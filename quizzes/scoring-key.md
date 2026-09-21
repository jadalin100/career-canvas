# Scoring Key — Career Canvas Quizzes

This is the **engine spec**: how each quiz turns answers into results. It's written
so a person can score by hand today *and* so a website can implement it later.
Students never see any of this.

**Three quizzes: College (20 questions), Career (24), DECA Event (30).** There
used to be a fourth, Major, but it scored almost the same set of outcomes as
Career with mostly the same questions, so it was merged in -- Career now covers
all 16 of the combined results. Every question has **at most 5 options** — when a
quiz has more possible results than that, the options **rotate** instead of
piling onto one question.

---

## Universal rules (all four quizzes)

**1. Point per code.** Every answer option lists a result code in `[brackets]`.
When a student picks that option, that code gets **+1**.

**2. Show the TOP 3 matches.** Rank buckets by total and present the top three as
"Your Top Matches" — #1 as the headline, #2 and #3 as "also strong fits." This is
kinder than a single verdict and honest about how close the scores usually are.

**3. Balance is a hard requirement, not a nicety.** Every result in a quiz must
appear in **roughly the same number of answer options** (within ~2 of each other),
and option positions must be **shuffled** so no result is always option A.

*Why this rule exists:* the first drafts failed both tests. Marketing was tagged on
~19 options in the career quiz while Entrepreneur had ~8, so the most
founder-minded student possible still scored Marketing 13 / Entrepreneur 9. And
option A was Marketing in 19 of 20 career questions and Big State School in all 20
college questions — answering straight down column A gave a predetermined result.
**If you add or edit a question, re-count.**

**How to check:** for each result, build the most extreme student who should get it
— pick that result's option every single time one is offered — and confirm they
actually land in the top 3, ideally at #1. If they can't, the quiz is broken.

**4. Ties.** Ties are fine now that three results show. If #3 and #4 tie, show
four. Don't break ties randomly.

---

## Quiz — College · 20 questions, 8 results, 4 options each
Codes: `BIG` `POWER` `STARTUP` `CITY` `TECH` `KNIT` `GLOBAL` `CREATIVE`.

**Balance:** exactly **10** options each (80 slots); each vibe is option A one to
three times. Results also carry a `schools` field — real schools **ranked inside
the vibe** (same feel, different selectivity), not a ranking across vibes.
Parsed from an indented `Schools:` line under the result in
[`2-college-quiz.md`](2-college-quiz.md) — see `SCHOOLS_RE` in
`build_quiz_data.py`.

## Quiz — Career · 24 questions, 16 results, 4 options each
Codes: `MKT` `FIN` `ACC` `ENT` `HOS` `SALES` `HR` `CONSULT` `SEM` `ANLY` `MGT`
`ECON` `INTL` `SCM` `MIS` `RE`.

**Balance:** exactly **6** options each (96 slots); each career is option A once
or twice. This quiz absorbed the old Major quiz's six unique results (General
Manager, Economist, International Business Manager, Supply Chain & Operations
Manager, Business Systems/IT Analyst, Real Estate Developer) — Major and Career
used to be separate quizzes scoring almost the same outcomes with duplicate
questions. Blurbs in [`3-career-quiz.md`](3-career-quiz.md).

**Verify it stays reachable:** `python3 verify_balance.py` (in this folder)
confirms every College and Career result wins its own extreme-student persona.
Run it after any edit to either quiz's questions.

---

## Quiz — DECA Event · 30 questions, all 29 role-play events

**This quiz scores the 29 events directly — there is no "pick a category, then
look up an event" step.** Each answer adds points to specific events, and the
result is the **top 3 events** by score.

### Weights
| Signal | Points |
|---|---|
| Part 1 (Q1–Q8) — you pick an event's **cluster** | **+1** to every event in it |
| Part 2 (Q9–Q26) — you pick an event's **geek-out tag** | **+3** to each event with that tag |
| Part 2 — any tag belonging to a **Principles event's cluster** | **+1** to that Principles event |
| Part 3 — `SOLO` | **+3** to each Individual Series event |
| Part 3 — `TEAM` | **+3** to each Team Decision Making event |
| Part 3 — `FOUND` | **+5** to each Principles event |
| Part 3 — `SPEC` | **+3** to each Series & Team event |

> **Six clusters, confirmed.** Olivia's Q1–Q5 use a 5-cluster framing. Jada
> confirmed the quiz keeps **Personal Financial Literacy as a 6th cluster**, so the
> PFL event stays reachable out of the 29; PFL appears in Jada's Q6–Q8.

### Event table — cluster · geek-out tag · tier
| Event | Cluster | Tag | Tier |
|---|---|---|---|
| PMK Principles of Marketing | MKT | — | Principles |
| AAM Apparel & Accessories Mktg | MKT | `F_FASHION` | Series |
| ASM Automotive Services Mktg | MKT | `F_AUTO` | Series |
| BSM Business Services Mktg | MKT | `F_SERVICE` | Series |
| FMS Food Marketing | MKT | `F_FOODPROD` | Series |
| MCS Marketing Communications | MKT | `F_ADS` | Series |
| RMS Retail Merchandising | MKT | `F_RETAIL` | Series |
| SEM Sports & Entertainment Mktg | MKT | `F_SPORTS` | Series |
| PSE Professional Selling | MKT | `F_SELL` | Series |
| MTDM Marketing Management Team | MKT | `F_ADS` | Team |
| BTDM Buying & Merchandising Team | MKT | `F_RETAIL` | Team |
| STDM Sports & Ent. Mktg Team | MKT | `F_SPORTS` | Team |
| PFN Principles of Finance | FIN | — | Principles |
| ACT Accounting Applications | FIN | `F_ACCT` | Series |
| BFS Business Finance | FIN | `F_INVEST` | Series |
| FTDM Financial Services Team | FIN | `F_INVEST` | Team |
| PHT Principles of Hospitality & Tourism | HOS | — | Principles |
| HLM Hotel & Lodging Management | HOS | `F_HOTEL` | Series |
| QSRM Quick Serve Restaurant Mgmt | HOS | `F_FASTFOOD` | Series |
| RFSM Restaurant & Food Service Mgmt | HOS | `F_RESTAURANT` | Series |
| HTDM Hospitality Services Team | HOS | `F_HOTEL` | Team |
| TTDM Travel & Tourism Team | HOS | `F_TRAVEL` | Team |
| PBM Principles of Business Mgmt & Admin | MGT | — | Principles |
| HRM Human Resources Management | MGT | `F_PEOPLE` | Series |
| BLTDM Business Law & Ethics Team | MGT | `F_LAW` | Team |
| PEN Principles of Entrepreneurship | ENT | — | Principles |
| ENT Entrepreneurship Series | ENT | `F_STARTUP` | Series |
| ETDM Entrepreneurship Team | ENT | `F_STARTUP` | Team |
| PFL Personal Financial Literacy | PFL | `F_MONEY` | Series |

Note how pairs are separated: MCS/MTDM, RMS/BTDM, SEM/STDM, BFS/FTDM, HLM/HTDM,
and ENT/ETDM each share a tag and are split by **solo vs. team**.

### Verify it still works
`python3 verify_deca_quiz.py` builds the ideal student for each of the 29 events
and confirms that event lands in their top 3. **Run it after any edit.** Current
status: all 29 reachable, 28 rank #1 (PEN ties PMK at 18 and shows at #2).

---

## Superseded design (kept as a warning)

The first version routed **cluster → flavor → format** through a lookup table and
did *not* work:
- Only 8 flavor questions for 14 tags meant most students scored 0–1 on
  everything, so the table fell through to its `(else …)` defaults and nearly
  everyone got SEM, BFS, or HLM.
- A "first-year override" sent beginners to a Principles event — but the question
  was *"Is this your first year in DECA?"*, which every middle schooler answers
  **yes**, collapsing 29 outcomes down to about 6.

Lesson worth keeping: **a question everyone answers the same way carries no
information.** Ask about preference, not about a fact the whole audience shares.

> **Verify before launch:** confirm all 29 event names/abbreviations against
> deca.org/compete for the current competition year — DECA occasionally renames or
> retires an event. Last verified against deca.org: all 29 matched.

### Official guidelines links

Every one of the 29 events has its own page at `deca.org/compete/<slug>`. The
slug for each event lives in `EVENT_SLUG` in `verify_deca_quiz.py`, right next
to `EVENTS` — one source of truth, checked with `assert set(EVENT_SLUG) ==
set(EVENTS)` so the two dicts can't drift apart, and `build_quiz_data.py` fails
the build if any event is missing a slug. Each DECA result card links straight
to its event's official guidelines; the general DECA Guide
(`deca.org/guide`) is the fallback link in the results footer. All 29 URLs were
checked by hand (curl, HTTP 200) — re-check them each competition year, same as
the event names above.
