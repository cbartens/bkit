Status: DECIDED
Question: VERIFY_GAPS
From: holistic
Pause step: 10
Plan: docs/plans/202611/957-workflows-skip-re-plan.md
Holistic attempt: 5
Source changed: false

**Q1 — The saved decision note for this feature (fixed in the last round):** The last fix round re-wrote the saved decision note `957-reruns-follow-answers` in `docs/decisions.jsonl` (now line 864) so it states the current rule for skipping a re-check. That round changed only this one saved note and no source code, so another whole-feature check would only re-read the same note. Accept the fixed note and go on, or fix it again?
Options: A) Accept / B) Fix now
Recommended: A) Accept — The note now matches the workflow text; no code changed, so a re-check has nothing new to find.
Decision: Accept — A

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
