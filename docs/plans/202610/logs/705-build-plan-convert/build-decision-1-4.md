Status: DECIDED
Question: CHALLENGE
From: challenge
Pause step: 10
Plan: docs/plans/202610/705-build-plan-convert-plan.md

**Q1 — TASK 8 [.bkit/core/workflows/bkit-build.md:391] — Plan Convert's finish asserts an artifact the no-plan route never writes:** Step 4's finish names `docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md` as a required `--artifact`, but on the no-plan route `tests plan-check` exits 2 without writing that log (the write sits after the missing-plan throw) and the re-check runs only after the finish, so `steps finish` refuses with exit 7 — before the Plan Convert comment is posted. That is the issue's headline path: a `/bkit-build` on an issue with no plan can never post `### Step 4 — Plan Convert`. The repair is one flag (`--optional-artifact=` for that log, as the round-2 report verified against `dist/cli.js`) or guaranteeing the log exists before the finish, inside Task 1's scope. Fix it now? Yes = fix now and re-verify.
Options: Accept / Fix now
Recommended: Fix now — A HIGH defect that defeats #705's own acceptance criterion; the repair is a one-flag change plus one test, and the challenge round is spent so this is the owner's call rather than another automatic round.
Decision: Fix now — fix now

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
