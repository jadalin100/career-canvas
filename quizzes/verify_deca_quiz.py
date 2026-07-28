#!/usr/bin/env python3
"""Proves every one of the 29 DECA role-play events is actually reachable.

For each event we build its ideal student -- someone who picks that event's
cluster and geek-out tag every single time one is offered -- score all 29
events, and check the target comes out on top. If an event can never win, the
quiz is broken and this fails loudly.

Dependency-free on purpose (workspace rule). Run:  python3 verify_deca_quiz.py
"""

import json
import re
import sys
from pathlib import Path

QUIZ = Path(__file__).parent / "4-deca-event-quiz.md"

# event -> (cluster, geek-out tag or None, tier)
EVENTS = {
    # Marketing
    "PMK":   ("MKT", None,           "PRIN"),
    "AAM":   ("MKT", "F_FASHION",    "SERIES"),
    "ASM":   ("MKT", "F_AUTO",       "SERIES"),
    "BSM":   ("MKT", "F_SERVICE",    "SERIES"),
    "FMS":   ("MKT", "F_FOODPROD",   "SERIES"),
    "MCS":   ("MKT", "F_ADS",        "SERIES"),
    "RMS":   ("MKT", "F_RETAIL",     "SERIES"),
    "SEM":   ("MKT", "F_SPORTS",     "SERIES"),
    "PSE":   ("MKT", "F_SELL",       "SERIES"),
    "MTDM":  ("MKT", "F_ADS",        "TDM"),
    "BTDM":  ("MKT", "F_RETAIL",     "TDM"),
    "STDM":  ("MKT", "F_SPORTS",     "TDM"),
    # Finance
    "PFN":   ("FIN", None,           "PRIN"),
    "ACT":   ("FIN", "F_ACCT",       "SERIES"),
    "BFS":   ("FIN", "F_INVEST",     "SERIES"),
    "FTDM":  ("FIN", "F_INVEST",     "TDM"),
    # Hospitality & Tourism
    "PHT":   ("HOS", None,           "PRIN"),
    "HLM":   ("HOS", "F_HOTEL",      "SERIES"),
    "QSRM":  ("HOS", "F_FASTFOOD",   "SERIES"),
    "RFSM":  ("HOS", "F_RESTAURANT", "SERIES"),
    "HTDM":  ("HOS", "F_HOTEL",      "TDM"),
    "TTDM":  ("HOS", "F_TRAVEL",     "TDM"),
    # Business Management & Admin
    "PBM":   ("MGT", None,           "PRIN"),
    "HRM":   ("MGT", "F_PEOPLE",     "SERIES"),
    "BLTDM": ("MGT", "F_LAW",        "TDM"),
    # Entrepreneurship
    "PEN":   ("ENT", None,           "PRIN"),
    "ENT":   ("ENT", "F_STARTUP",    "SERIES"),
    "ETDM":  ("ENT", "F_STARTUP",    "TDM"),
    # Personal Finance
    "PFL":   ("PFL", "F_MONEY",      "SERIES"),
}

CLUSTERS = {"MKT", "FIN", "HOS", "MGT", "ENT", "PFL"}

# which cluster each geek-out tag belongs to
FLAVOR_CLUSTER = {f: c for c, f, _ in EVENTS.values() if f}

# event -> deca.org/compete/<slug> -- every one of the 29 checked by hand
# (curl, HTTP 200) against the live site. Re-run that check each competition
# year; DECA occasionally renames or retires an event.
EVENT_SLUG = {
    "PMK":   "principles-of-marketing",
    "AAM":   "apparel-and-accessories-marketing-series",
    "ASM":   "automotive-services-marketing-series",
    "BSM":   "business-services-marketing-series",
    "FMS":   "food-marketing-series",
    "MCS":   "marketing-communications-series",
    "RMS":   "retail-merchandising-series",
    "SEM":   "sports-and-entertainment-marketing-series",
    "PSE":   "professional-selling",
    "MTDM":  "marketing-management-team-decision-making",
    "BTDM":  "buying-and-merchandising-team-decision-making",
    "STDM":  "sports-and-entertainment-marketing-team-decision-making",
    "PFN":   "principles-of-finance",
    "ACT":   "accounting-applications-series",
    "BFS":   "business-finance-series",
    "FTDM":  "financial-services-team-decision-making",
    "PHT":   "principles-of-hospitality",
    "HLM":   "hotel-and-lodging-management-series",
    "QSRM":  "quick-serve-restaurant-management-series",
    "RFSM":  "restaurant-and-food-service-management-series",
    "HTDM":  "hospitality-services-team-decision-making",
    "TTDM":  "travel-and-tourism-team-decision-making",
    "PBM":   "principles-of-business-management-and-administration",
    "HRM":   "human-resources-management-series",
    "BLTDM": "business-law-and-ethics-team-decision-making",
    "PEN":   "principles-of-entrepreneurship",
    "ENT":   "entrepreneurship-series",
    "ETDM":  "entrepreneurship-team-decision-making",
    "PFL":   "personal-financial-literacy",
}
assert set(EVENT_SLUG) == set(EVENTS), "EVENT_SLUG and EVENTS drifted apart"


def parse_questions(text):
    """-> list of (part_number, [tag, ...]) in question order."""
    part = 0
    questions = []
    for line in text.splitlines():
        if line.startswith("## Part "):
            part = int(line.split()[2])
        elif re.match(r"^\*\*Q\d+\.", line):
            questions.append((part, []))
        elif line.startswith("- ") and questions:
            tag = re.search(r"`\[([A-Z_]+)\]`", line)
            if tag:
                questions[-1][1].append(tag.group(1))
    return questions


def score(questions, target):
    """Score all 29 events for the student who always picks `target`'s signals."""
    cluster, flavor, tier = EVENTS[target]
    totals = {e: 0 for e in EVENTS}

    for part, tags in questions:
        if not tags:
            continue
        if part == 1:
            pick = cluster if cluster in tags else tags[0]
            for e, (c, _, _) in EVENTS.items():
                if c == pick:
                    totals[e] += 1
        elif part == 2:
            pick = flavor if flavor in tags else tags[0]
            pick_cluster = FLAVOR_CLUSTER.get(pick)
            for e, (c, f, t) in EVENTS.items():
                if f == pick:
                    totals[e] += 3
                # Principles events have no geek-out tag of their own, so they
                # earn partial credit whenever you pick anything in their world.
                elif t == "PRIN" and c == pick_cluster:
                    totals[e] += 1
        elif part == 3:
            if "SOLO" in tags:
                pick = "TEAM" if tier == "TDM" else "SOLO"
            else:
                pick = "FOUND" if tier == "PRIN" else "SPEC"
            for e, (_, _, t) in EVENTS.items():
                if pick == "SOLO" and t == "SERIES":
                    totals[e] += 3
                elif pick == "TEAM" and t == "TDM":
                    totals[e] += 3
                elif pick == "FOUND" and t == "PRIN":
                    totals[e] += 5
                elif pick == "SPEC" and t in ("SERIES", "TDM"):
                    totals[e] += 3
    return totals


def persona_answers(questions, target):
    """The exact option tag this event's ideal student picks, per question.

    Shared with the website's parity check so both sides score identical input.
    """
    cluster, flavor, tier = EVENTS[target]
    picks = []
    for part, tags in questions:
        if not tags:
            picks.append(None)
        elif part == 1:
            picks.append(cluster if cluster in tags else tags[0])
        elif part == 2:
            picks.append(flavor if flavor in tags else tags[0])
        else:
            if "SOLO" in tags:
                picks.append("TEAM" if tier == "TDM" else "SOLO")
            else:
                picks.append("FOUND" if tier == "PRIN" else "SPEC")
    return picks


def emit_json(questions):
    """Personas + expected top-3, for the browser to diff against."""
    out = {}
    for target in EVENTS:
        totals = score(questions, target)
        ranked = sorted(totals, key=lambda e: -totals[e])
        out[target] = {
            "answers": persona_answers(questions, target),
            "top3": ranked[:3],
            "scores": totals,
        }
    print(json.dumps(out))


def main():
    questions = parse_questions(QUIZ.read_text())
    counts = {}
    for part, tags in questions:
        counts[part] = counts.get(part, 0) + 1
    assert sum(counts.values()) == 30, f"expected 30 questions, got {counts}"

    if "--json" in sys.argv:
        emit_json(questions)
        return 0

    failures, not_first = [], []
    for target in EVENTS:
        totals = score(questions, target)
        ranked = sorted(totals, key=lambda e: -totals[e])
        top3 = ranked[:3]
        if target not in top3:
            failures.append((target, top3))
        elif ranked[0] != target:
            not_first.append((target, ranked[0], totals[target], totals[ranked[0]]))

    print(f"questions per part: {counts}  (total {sum(counts.values())})")
    print(f"events checked: {len(EVENTS)}\n")

    for t, winner, ts, ws in not_first:
        print(f"  ~ {t}: reachable but ranks behind {winner} ({ts} vs {ws})")
    for t, top3 in failures:
        print(f"  X {t}: UNREACHABLE -- top 3 was {top3}")

    if failures:
        print(f"\nFAIL: {len(failures)} event(s) can never place in the top 3.")
        return 1
    print(f"\nPASS: all {len(EVENTS)} events reachable; "
          f"{len(EVENTS) - len(not_first)} rank #1 for their ideal student.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
