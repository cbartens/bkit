Status: DECIDED
Question: VERIFY_GAPS
From: verify
Pause step: 8
Plan: docs/plans/202610/699-engine-run-completeness-plan.md
Group: 1
Verify attempt: 2

build verify: attempt 2 of 2

## Progress

Problems after each round: 4 → 3
Code changed: yes
Strategy: STANDARD → next PIVOT
Minutes per round: 9
Trend: closing

**Q1 — Verify:** another fix round? Fewer problems after each round, and the code changed.
Options: A) Try again / B) Decide
Recommended: A) Try again — the last round made progress
Decision: Decide — Accept all (the 2 fix rounds are used up; no further try)

**Q2 — TASK 1 [scripts/harvest/bkit-harvest.test.mjs] MARK_ROWS is the engine's — no-red:** The work for task 1 is done and the test passes, but nobody recorded it failing first, because the red-recording tool only runs vitest and vitest does not pick up `.mjs` files. The executing agent says it saw the test fail by running `node scripts/harvest/bkit-harvest.test.mjs` before the fix, but there is no recorded run. Accept this as a test-first exception? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can excuse a missing red; no agent may.
Decision: Accept — harvest test is plain-node .mjs the red tool cannot run; seen failing by hand before the fix (owner: Accept all)

**Q3 — TASK 1 [scripts/harvest/bkit-harvest.test.mjs] MARK_ROWS is the engine's — not-green:** The same harvest test passes under `pnpm test:harvest` (57/57), but the build's own audit cannot run it because vitest ignores `.mjs` files. Accept that the audit cannot see this test (the test still runs in the repo's harvest suite), or fix it now by moving the check into a vitest-run test file?
Options: A) Accept / B) Fix now
Recommended: A) Accept — The behaviour is covered by a passing test; the only gap is the audit's runner, and widening vitest's include list would change a gate.
Decision: Accept — audit cannot run the .mjs test; it passes under pnpm test:harvest (owner: Accept all)

**Q4 — TASK 2 [.bkit/core/engine/commands/workflow/status.test.ts] ignores a row type it does not know — no-red:** This test can never fail first, because the status readers already skip row types they do not know; it only pins that behaviour so it cannot regress. Accept it as a test-first exception? You write the reason, and it is recorded as your TEST EXCEPTION.
Options: A) Accept / B) Stop
No recommendation — Only the owner can excuse a missing red; no agent may.
Decision: Accept — test only pins existing reader behaviour and cannot fail first (owner: Accept all)

Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.
