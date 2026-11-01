# Debug Abort Handover

## The Short Version

The new run-completeness checker works, but it wrongly says the build run for this feature has two missing steps. The ship run stopped at the deferred-work check because one planned item (TASK 25) is not met. Fixing it means changing checker code, which this handover does not do.

## What's Actually Happening

- **Symptom:** `ship-deferred-sweep` returned FAIL with 1 failure (`status.jsonl`: `workflow-failed` at 2026-11-01T06:02:37Z). TASK 25's `DONE WHEN` is not met at HEAD `472e66b5f`.
- **Trigger:** `BKIT_ENGINE_JOURNAL=off node dist/cli.js completeness check --file=docs/plans/202610/logs/699-engine-run-completeness/status.jsonl` reports `build: HOLEY (148 step(s), 110 call(s) observed)` with `evidence hole: build-create-pr lacks prs probe` and `evidence hole: build-close-workflow lacks prs probe`.
- **Proximate cause:** the build file journals no `steps finish`, `steps done`, `prs probe`, `workflows close` or `prs open` call. Its 112 `engine-call` rows are `disk prune`, `ci slop`, `ci prose`, `completeness check` and `ledgers append` only. The two Step 16 visits (`status.jsonl:434-436`) have no journaled call in their gaps, so the "required" `prs probe` looks missing.
- **Root cause:** the rule "judge a visit steps-only when its row-writing call was not journaled" (`.bkit/core/engine/checks/status-holes.ts:656-659`) only fires when the unit's non-branch calls include `steps finish` or `steps done`. For build Step 16 the contract is `[build-create-pr, build-close-workflow]`. `steps done` (`bkit-build.md:1035`) sits below `workflows close`, so it lands in `outsideWindow` (`:357-364`) and is dropped. The skip never applies.
- **Contributing factors:** the build's `workflow-done` row (`status.jsonl:433`) was written by a non-journaling engine, so there is no stored `completeness` row. `previousRunWarning` (`workflows.ts:1117-1127`) then computes the verdict on the fly and warns about a hole that is not real. Any consumer whose Step 16 runs under a non-journaling `{BKIT}` gets the same false warning. The earlier verify (`build-plan-verify-12-2.md`) saw CLEAN, but that was before the Step 16 rows existed.

## Rot Signals

None. No diagnose attempts exist for this run (no `ship-failure-diagnose-*.md`).

## Out-of-Scope Recommendations

None.

## Attempt History

<!-- prettier-ignore -->
| Strategy | What was tried | Why it failed |
| --- | --- | --- |
| (none) | No diagnose or remediate attempt files exist. The run failed straight from `ship-deferred-sweep`. | n/a |

## Verified Resolutions (do not roll back)

From the sweep's runs at HEAD `472e66b5f`, all passing:

- 11 Derived Test Matrix files: 686 tests pass; `pnpm test:harvest` 58 pass; `tests/status-holes-sweep-liveness.bats` 2/2.
- `node dist/cli.js check`, `pnpm bkit:check:dist`, `pnpm bkit:typecheck:tests` and `graphify check-at HEAD` all exit 0.
- Delivered: success criteria 1-5; TASKs 1-2, 3-5, 7-24 (except 25); the `completeness` verb; the `tool-failure` friction seam; the CI advisory step (`.github/workflows/bkit-ci.yml:521-524`); the 3 knowledge entries. No test was disabled (`scan-diff --disabled-tests` found none).

## Persistent Errors

- Failed requirement: plan TASK 25, "a visit whose own row-writing call has no journaled `engine-call` in its owned gaps is judged steps-only ... and this run's own `status.jsonl` reports no evidence hole for a visit with no journaled `steps finish`".
- File: `.bkit/core/engine/checks/status-holes.ts:656-659` (skip condition), `:357-411` (`outsideWindow`).
- Error text: `evidence hole: build-create-pr lacks prs probe` and `evidence hole: build-close-workflow lacks prs probe`.
- Sequence: verify 12-2 CLEAN with 136 steps, then Step 16 rows `build-create-pr` and `build-close-workflow` are written, then the check goes HOLEY with 148 steps.
- The full `pnpm vitest run` suite was not re-run in the sweep.

## Recommended Next Steps

1. **Fix the skip rule in `status-holes.ts` (smallest).** Make the skip also fire when the row-writing call falls in `outsideWindow`, or when the unit's row was written by a non-journaling engine. Add a test using build Step 16's real shape. FIXES the false holes and the false start warning. Does not fix other attribution cases. COST: one checker change plus a test, then rebuild `dist`, the graph and re-run the sweep.
2. **Derive the verdict at close from the visit's own journaled calls only.** If a visit has none, judge it steps-only. FIXES the whole class. Does not fix older runs without a stored row. COST: larger change to the checker and `completeness.ts`.
3. **Re-run build Step 16 under a journaling engine so a stored `completeness` row exists.** FIXES this FID's warning only. Does NOT fix other consumers or the TASK 25 bar. COST: re-doing a closed build step, and it hides the bug.
4. **Defer TASK 25 as a known gap.** FIXES the ship block. Does NOT fix the false warning, and it breaks the plan's `DONE WHEN`. COST: needs a recorded deferral and an explicit sign-off.

## Recommended Path

Option 1. It matches the plan's stated bar, is small, and removes the false warning for every consumer. Run `/bkit-ship` again after the rebuild.

## Reference Docs

- `docs/plans/202610/logs/699-engine-run-completeness/ship-deferred-sweep.md` (verdict FAIL, Blocking Deferrals)
- `docs/plans/202610/logs/699-engine-run-completeness/build-plan-verify-12-2.md` (earlier CLEAN result)
- `docs/plans/202610/699-engine-run-completeness-plan.md` (TASK 25)
- Issue comment on #699: https://github.com/cbartens/bkit/issues/699#issuecomment-6554207268
- Probe script: `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/91131698-d6a2-4b6f-9113-720b495a9c74/scratchpad/u16.mjs`
