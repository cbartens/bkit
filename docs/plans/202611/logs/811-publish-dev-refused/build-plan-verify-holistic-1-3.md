Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4
Loosened: none
Fingerprint: e3fb2ecc6cb77050a98eeb179357ca319445aac397c49482797a1df72d12b824
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has 2 groups).

## Integration Gaps

0. The gap from attempt 2 is closed. For a merged `ship-failed/{FID}` PR, `landFailedRecord` now returns `linkRef` = `dev` (`.bkit/core/engine/commands/workflow/workflows.ts:830`), and `handoverVerb` links the handover comment at `linkRef ?? ref` (`workflows.ts:957`). For `close-pr-open` the link stays on the open branch. The JSON `ref` stays `ship-failed/{FID}`, as the Success Criterion names. "--flush refused by dev links the handover comment at dev once the PR merged" asserts `/blob/dev/` and no `/blob/ship-failed/`, and passes.

The other cross-group links hold. Group 2's doc lines (`.bkit/core/.bkit/workflows.md:132`, `:150`, `:823`, `docs/testing.md:826`, `docs/deployments.md:142`) describe what Group 1 built: a `ship-failed/{FID}` PR only for `--flush` (`viaPr: true`), with `--push` from a shared checkout unchanged (`viaPr: false`). Both callers of `closePr` (`shipClose` and the `landFailedRecord` refused handler) use the `{ title, branch, subject }` contract. `pushToDev` awaits the `refused` handler before it returns the `refused` result (`.bkit/core/engine/commands/land.ts:256-257`). `dist/commands/workflow/workflows.js` carries the same change, including `linkRef`. The rendered `.bkit/workflows.md`, its `.bkit/version` hash and `.bkit/instructions.md:9966` match the source. The ship Failure Path (`.bkit/core/workflows/bkit-ship.md:118-120`) reads only the posted `comment`, so it needs no change.

## Previously Attempted

- `build-plan-verify-holistic-1-1.md`: PASS, Tasks 1, 2, 3, 4, no gaps. The holistic gate then failed on `instructions-sources.test.ts`; `build-plan-gaps-remediate-holistic-1-1-log.md` fixed it by syncing `.bkit/instructions.md:9966`.
- `build-plan-verify-holistic-1-2.md`: CONCERNS, 1 integration gap (handover comment linked a `ship-failed/{FID}` branch the PR merge deletes). `build-plan-gaps-remediate-holistic-1-2-log.md` fixed it with `linkRef` and a new test.
- Group reports: `build-plan-verify-1-1.md` (Group 1, PASS) and `build-plan-verify-2-1.md` (Group 2, PASS).

## Notes

- TASK 1 (satisfied): `closePr` takes `{ title, branch, subject }`. Searching `workflows.ts` for `ship DONE` and `ship-close/${` finds only the `shipClose` call (lines 1568-1569) and the `close` verb help string (line 2470), which is outside `closePr`. "closePr with base dev still merges" asserts `--title docs(12-export-csv): ship DONE`; it and "closePr refuses when the PR base is unknown" pass.
- TASK 2 (satisfied): a refused `--flush` returns exit 0, `pushed: true`, `ref` `ship-failed/{FID}` with `pr create` titled `chore(12-export-csv): ship FAILED`; with the PR path failing it exits 10, keeps the record and logs both "dev refused the push" and "branch push failed". "--push on dev refused keeps the record in the checkout and exits 10" passes unchanged. All three `Derived Test Matrix` tests are in its `DONE WHEN` and pass. The `as` at `workflows.ts:819` only widens a closure-assigned `let` back to its declared type; it is not an `as any` / `as unknown as` escape.
- TASK 3 (satisfied): `.bkit/core/.bkit/workflows.md` lines 132, 150 and 823 name `ship-failed`; `.bkit/core/workflows/bkit-ship.md` has no commit since the branch start (d7bed40ce).
- TASK 4 (satisfied): `docs/testing.md:826` and `docs/deployments.md:142` carry the edits; the old "a refused push keeping the record in the book with exit 10" clause is gone.
- Runs this attempt: `npx vitest run .bkit/core/engine/commands/workflow/workflows.test.ts` passed 190 of 190; `npx tsc --noEmit` exited 0. The holistic gate's attempt 2 ran before remediation attempt 2, so the next holistic gate covers that commit.
- No test-first audit report was supplied to this step. No decision records (`build-decision-*.md`) exist for this run.
- `docs/observability.md` exists. The change adds only `ctx.log` lines on the existing stderr log, with no new log names.
- Not required by the plan: the Process Sketch case "PR opens but the merge fails" (`close-pr-open`) has no dedicated test, and no matrix row names it.
- Out of scope, proposed separately: `docs/deployments.md:142` says the `ship-failed/{FID}` PR runs "under the same two prerequisites", as Task 4 prescribed, but `closePr` passes `--delete-branch` itself (`workflows.ts:1515`), so the "Automatically delete head branches" setting is not needed for it.
- Out of scope, proposed separately: remediation commit ef8628116 added a `.bkit/friction.jsonl` row about another run (`catalogue.test.ts`, parentSha c3913835); nothing in this plan touches that test.

## Identified Gaps Log

None
