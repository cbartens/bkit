Verdict: FAIL
Strategy: FINAL

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

BLOCKED — Gap G1: Task 11 test-first no-red x20 — re-diagnosed (FINAL): the gap is about ORDER (tests must be seen failing before the code exists), not about content. Code and tests already meet Done when (14 task test files, 907 tests green in verify 1-3). No source edit can change that order. Attempt 2 forced the reds by swapping code back (rejected by verify as undoing code, bkit-build-plan-execute.md:54); repeating or refining that is the same forbidden move. A fresh genuine red is impossible because the Task 11 behaviour already exists. Needs a human decision: accept Task 11 with the order exception recorded, or re-run Task 11 from scratch on a branch without the code. No source change made.
BLOCKED — Gap G2: Task 2 runs.test.ts "runs context refuses an issue-less marker and branch naming the missing issue" assertion rewritten after its red — re-diagnosed (FINAL): the red-time line `expect(viaMarker.json).not.toHaveProperty("issueId", null)` contradicts the pre-existing refusal output (`out.issueId: null`, runs.ts L1770, emitted at L1861), so it could never pass as written; the later `expect(viaMarker.json.fid).toBeNull()` is the correct form. Restoring the old line makes a green test red; changing runs.ts output shape to fit it adds behaviour no requirement asks for. The retro red from attempt 2 is the same swap-code-back move. Needs a human decision (accept the corrected assertion as a documented exception). No source change made.
DONE — FINAL checks: pnpm bkit:deps:outdated run (only vitest/@vitest/coverage-v8 5.0.3->5.0.4, oxlint 1.87.0->1.88.0, @types/node, vite majors outdated; none related to either gap); failures.jsonl already has row tests-green-accepts-red-recorded-after-task-code (no duplicate added)
DONE — Local gate: pnpm bkit:gate:static-unit rc=0 — 135 files, 5078 unit tests pass; no source changed this attempt (git status: only .bkit/friction.jsonl and docs/failures.jsonl modified by others)
