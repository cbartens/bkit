Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 3, 4
Loosened: none
Fingerprint: 33c24c348f07a602dad3bf770af97ac789fd651f2c07e722e70e159dd2f89dea
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has 2 groups).

## Integration Gaps

1. Task 2's new refused-flush result meets the ship Failure Path's posted handover comment wrongly. For a merged `ship-failed/{FID}` PR, `landFailedRecord` returns `ref` = `ship-failed/{FID}`. `handoverVerb` (`.bkit/core/engine/commands/workflow/workflows.ts:942-947`) passes that `ref` to `buildComment`, which links the handover at `https://github.com/{repo}/blob/ship-failed/{FID}/...` (`.bkit/core/engine/commands/workflow/issues.ts:561`). `closePr` merges with `deleteBranch: true` (`workflows.ts:1505`, passed on as `--delete-branch` in `prs.ts:701`), so the branch is gone once the PR merges and the link the ship Failure Path posts (`bkit-ship.md:118-120`, `--post`) returns 404. The record itself is on `dev`. The fix: link `dev` when the PR merged (`via` = `close-pr`) and keep the branch link for `close-pr-open`. The JSON `ref` the plan's Success Criterion names stays as it is. Add an assertion on the comment link to "--flush refused by dev publishes the FAILED record through a PR". No test covers the comment today.

The other cross-group links work. Group 2's doc lines (`.bkit/core/.bkit/workflows.md:132`, `:150`, `:823`, `docs/testing.md:826`, `docs/deployments.md:142`) describe what Group 1 built: a `ship-failed/{FID}` PR only for `--flush` (`viaPr: true`), with `--push` from a shared checkout unchanged (`viaPr: false`). Both callers (`shipClose` and the `landFailedRecord` refused handler) use the new `closePr({ title, branch, subject })` contract. `dist/commands/workflow/workflows.js` carries the change. The rendered `.bkit/workflows.md` mirror, its `.bkit/version` hash and `.bkit/instructions.md` (synced in remediation attempt 1) match the source.

## Previously Attempted

- `build-plan-verify-holistic-1-1.md`: PASS, Tasks 1, 2, 3, 4, no gaps.
- The holistic gate then failed on `.bkit/core/engine/tools/instructions-sources.test.ts` ("each Special Behaviors row and authoring section has one equal entry"). See `build-holistic-gate-1-1.md`: 1 failed, 8446 passed.
- `build-plan-gaps-remediate-holistic-1-1-log.md` fixed that failure by syncing `.bkit/instructions.md:9966`. Its gate log reports every stage passed.
- Group reports: `build-plan-verify-1-1.md` (Group 1, PASS) and `build-plan-verify-2-1.md` (Group 2, PASS).

## Notes

- TASK 1 (satisfied): `closePr` (`workflows.ts:1478`) takes `{ title, branch, subject }`. Searching for `ship DONE` and `ship-close/${` finds only the `shipClose` call (`workflows.ts:1558-1559`) and the `close` verb help string (`:2460`), which is outside `closePr`. "closePr with base dev still merges" asserts `--title docs(12-export-csv): ship DONE`.
- TASK 2 (satisfied): every clause of its `DONE WHEN` holds. All three `Derived Test Matrix` tests are in its `DONE WHEN` and pass. "--push on dev refused keeps the record in the checkout and exits 10" is unchanged. The `as` on `pr` at `workflows.ts:817` only widens a closure-assigned `let` back to the type it was declared with. It is not an `as any` / `as unknown as` escape. The integration gap above is logged separately and does not break this task's `DONE WHEN`.
- TASK 3 (satisfied): searching `.bkit/core/.bkit/workflows.md` for `ship-failed` finds lines 132, 150 and 823. `.bkit/core/workflows/bkit-ship.md` has no change since the branch start (d7bed40ce).
- TASK 4 (satisfied): `docs/testing.md:826` and `docs/deployments.md:142` carry the edits.
- Test run: `npx vitest run .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/tools/instructions-sources.test.ts` passed 212 of 212 (2 files).
- No test-first audit report was supplied to this step. No decision records (`build-decision-*.md`) exist for this run.
- `docs/observability.md` exists. The change adds only `ctx.log` lines on the existing stderr log, with no new log names.
- Not required by the plan: the Process Sketch case "PR opens but the merge fails" (`close-pr-open`) has no dedicated test, and no matrix row names it.

## Identified Gaps Log

1 gap.

INTEGRATION: TASK 2 (Group 1) x ship Failure Path comment: a refused `--flush` whose `ship-failed/{FID}` PR merged returns `ref` = `ship-failed/{FID}`, and `handoverVerb` (`.bkit/core/engine/commands/workflow/workflows.ts:942-947`) links the posted handover comment at `blob/ship-failed/{FID}/...` (`issues.ts:561`), but `closePr` merges with `deleteBranch: true` (`workflows.ts:1505`), so the link 404s once merged; link `dev` when `via` = `close-pr` (keep the branch for `close-pr-open`), keeping the JSON `ref` the plan names, and assert the comment link in the publishes-through-a-PR test — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Handover comment links a ship-failed branch that the PR merge deletes
  **Severity:** MEDIUM · **Class:** integration · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:942` · **Round:** 1
  - **DONE WHEN:** For a refused --flush whose ship-failed/{FID} PR merged (via close-pr), the handover comment links the artifact at blob/dev/...; for close-pr-open it links blob/ship-failed/{FID}/...; the JSON ref stays ship-failed/{FID}; "--flush refused by dev publishes the FAILED record through a PR" asserts the comment link and passes
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/workflows.test.ts
<!-- bkit:task 1 end -->
