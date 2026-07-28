#!/usr/bin/env python3
"""Turns the four quiz markdown files into quizzes.json for the website.

The markdown in ../quizzes/ stays the single source of truth -- Jada and Olivia
edit there, then run this to rebuild the site's data. Nothing is hand-copied.

The 29-event table and the markdown parser are imported from verify_deca_quiz.py
rather than re-declared, so the site and the checker cannot drift apart.

Dependency-free (workspace rule). Run:  python3 build_quiz_data.py
"""

import json
import re
import sys
from pathlib import Path

SITE = Path(__file__).parent
QUIZZES = SITE.parent / "quizzes"
sys.path.insert(0, str(QUIZZES))

from verify_deca_quiz import EVENTS, FLAVOR_CLUSTER, EVENT_SLUG  # noqa: E402

OUT = SITE / "quizzes.json"

QUIZ_FILES = {
    "college": ("2-college-quiz.md",    "College",    "What kind of college is your vibe?"),
    "career":  ("3-career-quiz.md",     "Career",     "What business career suits you?"),
    "deca":    ("4-deca-event-quiz.md", "DECA Event", "Which DECA event should you compete in?"),
}
ORDER = ["college", "career", "deca"]

# expected question count per quiz -- catches an edit that silently drops or
# duplicates a question
EXPECTED_QUESTIONS = {"college": 20, "career": 24, "deca": 30}

# expected per-tag counts from scoring-key.md -- drift here means a quiz got
# unbalanced, which is exactly the bug we spent the session fixing
EXPECTED = {
    "college": {10},
    "career":  {6},
}

QUESTION_RE = re.compile(r"^\*\*(Q\d+)\.\s*(.+?)\*\*\s*$")
OPTION_RE = re.compile(r"^-\s+([A-E])\)\s+(.*?)\s*`\[([A-Z_+]+)\]`\s*$")
RESULT_RE = re.compile(r"^-\s+\*\*(.+?)\*\*\s+`\[([A-Z_]+)\]`\s+[—-]\s+(.*)$")
SCHOOLS_RE = re.compile(r"^\s+Schools:\s*(.*)$")


def strip_md(text):
    """Drop the inline markdown the site renders as plain text."""
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
    text = re.sub(r"\*(.+?)\*", r"\1", text)
    text = re.sub(r"`(.+?)`", r"\1", text)
    return text.strip()


def parse_quiz(path):
    """-> (questions, results). Questions carry their Part number for quiz 4."""
    part = 0
    in_results = False
    questions, results = [], []

    for line in path.read_text(encoding="utf-8").splitlines():
        if line.startswith("## Part "):
            part = int(line.split()[2])
            in_results = False
            continue
        if line.startswith("## Your Results"):
            in_results = True
            continue
        if line.startswith("## ") and not line.startswith("## Your Results"):
            in_results = False

        if in_results:
            m = RESULT_RE.match(line)
            if m:
                name, code, blurb = m.groups()
                results.append({
                    "code": code,
                    "name": strip_md(name),
                    "blurb": strip_md(blurb),
                })
                continue
            m = SCHOOLS_RE.match(line)
            if m and results:
                results[-1]["schools"] = strip_md(m.group(1))
            continue

        m = QUESTION_RE.match(line)
        if m:
            questions.append({
                "id": m.group(1),
                "part": part or 1,
                "text": strip_md(m.group(2)),
                "options": [],
            })
            continue

        m = OPTION_RE.match(line)
        if m and questions:
            letter, text, tag = m.groups()
            questions[-1]["options"].append({
                "letter": letter,
                "text": strip_md(text),
                "tag": tag,
            })

    return questions, results


def tag_counts(questions):
    counts = {}
    for q in questions:
        for o in q["options"]:
            counts[o["tag"]] = counts.get(o["tag"], 0) + 1
    return counts


def main():
    data = {"quizzes": [], "events": None}
    problems = []

    for key in ORDER:
        fname, title, subtitle = QUIZ_FILES[key]
        questions, results = parse_quiz(QUIZZES / fname)

        expected_n = EXPECTED_QUESTIONS[key]
        if len(questions) != expected_n:
            problems.append(f"{key}: expected {expected_n} questions, parsed {len(questions)}")
        for q in questions:
            if not (2 <= len(q["options"]) <= 5):
                problems.append(f"{key} {q['id']}: {len(q['options'])} options (want 2-5)")
        if not results:
            problems.append(f"{key}: parsed no results")

        counts = tag_counts(questions)

        # every option's tag must resolve to a real result (quiz 4's signal tags
        # are scoring inputs, not results, so they're exempt)
        if key != "deca":
            codes = {r["code"] for r in results}
            for tag in counts:
                if tag not in codes:
                    problems.append(f"{key}: option tag [{tag}] has no result")
            for code in codes:
                if code not in counts:
                    problems.append(f"{key}: result [{code}] unreachable - no option awards it")

            spread = set(counts.values())
            if key in EXPECTED and not spread <= EXPECTED[key]:
                problems.append(
                    f"{key}: tag counts {sorted(spread)} - expected {sorted(EXPECTED[key])}"
                )
        else:
            flavors = {t: c for t, c in counts.items() if t.startswith("F_")}
            if set(flavors.values()) != {5}:
                problems.append(f"deca: geek-out tags must each appear 5x, got {flavors}")
            codes = {r["code"] for r in results}
            missing = set(EVENTS) - codes
            if missing:
                problems.append(f"deca: no description for events {sorted(missing)}")

        data["quizzes"].append({
            "key": key,
            "title": title,
            "subtitle": subtitle,
            "questions": questions,
            "results": results,
        })
        print(f"{key:8s} {len(questions)} questions, {len(results)} results, "
              f"{len(counts)} tags")

    for code in EVENTS:
        if code not in EVENT_SLUG:
            problems.append(f"deca: event {code} has no EVENT_SLUG entry")

    data["events"] = {
        code: {"cluster": c, "flavor": f, "tier": t, "slug": EVENT_SLUG.get(code)}
        for code, (c, f, t) in EVENTS.items()
    }
    data["flavorCluster"] = FLAVOR_CLUSTER

    if problems:
        print("\nFAIL:")
        for p in problems:
            print(f"  X {p}")
        return 1

    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\nPASS: wrote {OUT.name} ({OUT.stat().st_size // 1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
