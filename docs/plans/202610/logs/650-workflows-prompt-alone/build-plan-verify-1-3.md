Verdict: FAIL
Failures: 21

<!-- verdict:end -->

# Plan Verification

## Scope

`Single` — Sub-Plan 1 of 2 (Engine), `docs/plans/202610/650-workflows-prompt-alone-plan-1.md`, attempt 3.

## Sub-Plans Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-1-1.md` — `FAIL`, Failures 21: G1 Task 11 `no-red` x20, G2 Task 2 rewritten red assertion x1.
- `build-plan-gaps-remediate-1-1-log.md` — `FAIL` (`STANDARD`): G1 / G2 `BLOCKED`, no source change; it stated that recording a red by undoing the code would fake the evidence.
- `build-plan-verify-1-2.md` — `FAIL`, Failures 21: same G1 / G2.
- `build-plan-gaps-remediate-1-2-log.md` — `PASS` (`PIVOT`): recorded retroactive reds for G1 (x20) and G2 (x1) against pre-feature sources swapped in from a3a33172 and restored afterwards; no test or code change.

## Notes

- **Plan ticks (no edit needed):** `[x]` re-asserted for Tasks 1, 3, 4, 5, 12, 13, 6; `[ ]` kept for Task 2 (G2) and Task 11 (G1). Code for both meets `Done when`; each fails only on test-first evidence.
- **Failures = 21** = G1 x20 + G2 x1. The audit's 20 listed `test-changed` gaps cleared on reading the diffs: Task 1 x4 (adds `fromBranch` / `fromMarker` imports and Task 2 tests; moves the pre-existing `["github","feat/abc-x"]` row from the reject table to the `issueId: null` accept table, which Task 2 `Done when` requires; the four Task 1 red tests unchanged — judgement call), Task 3 x2 / Task 5 x4 / Task 4 `workflows.test.ts` (added lines only, -0), Task 4 `branches.test.ts` x2 (import reformat + added imports), Task 4 `close-squash.integration.test.ts` (equivalent `PATH` join), Task 12 x6 (added `replayed: false` expectations; one test gains a `git` call-log stub and one extra assertion).
- **Why G1 / G2 still count:** remediate attempt 2 swapped source back to a3a33172 to make the tests fail, then restored it. That is undoing code to force a red, which `.bkit/core/prompts/bkit-build-plan-execute.md:54` forbids. It also cannot show the tests were written before the code. The audit is now clean only because of these after-the-fact reds. Named `*-retro-*` red logs are accepted by `bkit tests green` the same as Step 6 reds. No doctrine allows a red recorded after the code, and none was found (`git grep -i retro` over prompts / workflows: no hit).
- **Source unchanged:** `git diff --quiet 3bc75387 -- .bkit/core dist` → 0 (also vs 63425085); `git status --short dist .bkit/core` clean. The swap-and-restore left no residue. Only change since HEAD: `build-tests-green-1-3.md` regenerated (whitespace and one `prettier-ignore` line, same 20 gaps).
- **Tests run:** `npx vitest run` on the 14 files the tasks name (11 unit, 3 integration incl. `shared-checkout.integration.test.ts`) → 14 files, 907 tests passed. Full suite / `pnpm bkit:gate:static-unit` not run (Single scope; remediate attempt 2 logged 5078 unit tests green).
- **Task 6:** not rebuilt this attempt (no-build mandate). `.bkit/core` and `dist/` are byte-identical to 3bc75387, where verify attempts 1 and 2 ran `pnpm bkit:check:dist` → exit 0.
- **Greps:** `FID_FORMAT\|ISSUE_FORMAT` in `.bkit/core/engine` rc=1; `bookkeeping only\|Land one commit` in `land.ts` rc=1; `bkit/shared-checkout` outside tests → `ledgers.ts` only; known hits found for `fidProblem` (fids.ts), `issueId === null` guard (`runs.ts:1862`), `EXIT_FOREIGN_PATH` (`ledgers.ts:180`).
- **Diff coverage:** partial. Large Diff Guard applied (584 files, +84654). Top 20 by size are all `docs/plans/**/logs/**` audit reports and red snapshots (out of scope). In-scope: 40 files under `.bkit/core/engine` + `dist` (+3458 -453), unchanged since plan-execute 3bc75387 and read in verify attempts 1–2. This attempt did targeted greps plus the audit diffs.
- **Gates / checklists:** Gate 1–4, Pre-Flight, Security and Verification Plan boxes left `[ ]`; this verifier ticks tasks only. Gate 2 `Test first` is false for Tasks 2 and 11.
- **Suggested follow-up (not filed; outside this verifier's I/O paths):** `bkit tests green` accepts reds whose `parentSha` comes after the task's code commit. A check that flags such reds would stop this from happening again. Candidate `docs/failures.jsonl` row.
- **Embedded directives:** none found in logs, audit or diffs.

## Identified Gaps Log

- G1 (Task 11, not fixable): test-first `no-red` x20 stands in substance. `build-tests-green-1-3.md` no longer lists it only because remediate attempt 2 recorded 20 reds (`build-task-red-1-11-retro-1..20`, `status.jsonl` rows at 04:18:49Z–04:22:29Z, `parentSha` 63425085) by swapping the five Task 11 sources back to their a3a33172 versions and running `bkit tests red`, then restoring them. That is undoing code to force a red after the code landed in 3bc75387. `.bkit/core/prompts/bkit-build-plan-execute.md:54` requires "every red MUST be recorded before the task code is written" and "never undo code to force a red". Execute log BLOCKED line and remediate attempt 1 confirm the code was written first. Plan-currency does not class Task 11 `Broken` and no `DONE — already landed` row exists. Code meets `Done when`; task stays `[ ]`.
- G2 (Task 2, not fixable): the planned red test `.bkit/core/engine/commands/workflow/runs.test.ts` "runs context refuses an issue-less marker and branch naming the missing issue" still has the assertion that was rewritten after its red, from `expect(viaMarker.json).not.toHaveProperty("issueId", null)` to `expect(viaMarker.json.fid).toBeNull()`. Remediate attempt 2 did not change the test. It re-recorded the red (`build-task-red-1-2-retro-3`, 04:23:07Z) against pre-Task-2 `runs.ts` / `fids.ts` swapped in from a3a33172, which reset the snapshot so the audit stopped flagging `test-changed`. The rewrite-after-red is unchanged and the new red came from undoing code (same rule as G1). Code meets `Done when`; task stays `[ ]`.
