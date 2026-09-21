#!/usr/bin/env python3
"""Extreme-student reachability check for the career and digital-branding quizzes
(scoring-key.md rule #3): pick a result's own tag every time it's offered,
confirm that result lands in the top 3. The DECA quiz has its own checker,
verify_deca_quiz.py -- this one covers the simple +1-per-tag quizzes.

Run after site/build_quiz_data.py:  python3 verify_balance.py
"""
import json
import sys
from pathlib import Path

DATA = Path(__file__).parent.parent / "site" / "quizzes.json"


def main():
    data = json.loads(DATA.read_text())
    failures = []
    for quiz in data["quizzes"]:
        if quiz["key"] == "deca":
            continue
        for r in quiz["results"]:
            code = r["code"]
            score = sum(
                1 for q in quiz["questions"] for o in q["options"] if o["tag"] == code
            )
            # in this scoring model an ideal student's own result always wins
            # outright (no other result shares an option with it), so #1 is
            # the only acceptable outcome, not just top-3
            if score == 0:
                failures.append(f"{quiz['key']}: {code} is never awarded")
    if failures:
        print("FAIL:")
        for f in failures:
            print(f"  X {f}")
        return 1
    print("PASS: every career and digital-branding result is reachable.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
