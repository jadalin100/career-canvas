#!/usr/bin/env python3
"""Confirms every deca.org/compete/<slug> in EVENT_SLUG still resolves.

DECA occasionally renames or retires an event, which silently turns a result
card's "Official event guidelines" link into a 404. Re-run this each
competition year (or whenever DECA news says an event changed).

Dependency-free (stdlib urllib only). Run:  python3 verify_deca_links.py
"""
import sys
import urllib.request
from verify_deca_quiz import EVENT_SLUG

BASE = "https://www.deca.org/compete/"


def check(slug):
    req = urllib.request.Request(BASE + slug, method="HEAD",
                                  headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return resp.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception as e:
        return str(e)


def main():
    bad = []
    for code, slug in EVENT_SLUG.items():
        status = check(slug)
        ok = status == 200
        print(f"{'OK ' if ok else 'BAD'} {code:6s} {status}  {BASE}{slug}")
        if not ok:
            bad.append((code, slug, status))
    if bad:
        print(f"\nFAIL: {len(bad)} event link(s) no longer resolve.")
        return 1
    print(f"\nPASS: all {len(EVENT_SLUG)} event links resolve.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
