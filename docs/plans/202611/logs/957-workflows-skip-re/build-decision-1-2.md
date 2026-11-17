Status: DECIDED
Question: VERIFY_GAPS
From: holistic
Pause step: 10
Plan: docs/plans/202611/957-workflows-skip-re-plan.md
Holistic attempt: 5
Source changed: false

build holistic: attempt 3 of 2

## Progress

Problems after each round: 1
Code changed: unknown
Strategy: none → next FINAL
Minutes per round: unknown
Trend: first-round

**Q1 — Holistic verify:** another fix round? This was the first round, so there is no trend yet.
Options: A) Try again / B) Decide
Recommended: A) Try again — the last round made progress
Decision: Try again — yes (takes every recommendation)

**Q2 — The saved decision note for this feature still states the old, looser rule for skipping a re-check:** One saved note (the row `957-reruns-follow-answers` in `docs/decisions.jsonl`) still says a re-check is skipped whenever every item is accepted and the loop question is Decide. The workflow itself now also requires that no source code changed and that the pause file says `Source changed: false`, and it ticks the tasks before recording the answer. Future planning agents read that note, so one could bring back the skip after a fix round that edited code. Fixing it means re-writing that one note with the current rule, in one more fix round plus a re-check. Accept the stale note, or fix it now?
Options: A) Accept / B) Fix now
Recommended: B) Fix now — It is a one-row text correction, and leaving it lets a future agent trust a rule the workflow no longer follows.

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
