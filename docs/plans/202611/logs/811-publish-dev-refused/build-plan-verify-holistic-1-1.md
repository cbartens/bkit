Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4
Loosened: none
Fingerprint: c5d9641a8b376ead62ad2d0274843e908849f238c2b91169d63af842c87dc189
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has 2 groups).

## Integration Gaps

0. Group 2's doc lines describe the behaviour Group 1 built: `.bkit/core/.bkit/workflows.md:132`, `:150` and `:823`, `docs/testing.md:826` and `docs/deployments.md:142` each say a refused `--flush` opens a `ship-failed/{FID}` PR and keeps the record only when that path fails too, and that `--push` from a shared checkout still keeps it. This matches `landFailedRecord` (`viaPr: true` only from the `--flush` call in `handoverVerb`, `viaPr: false` from the `--push` shared call). The `closePr` contract change (`{ title, branch, subject }`) is applied at both callers (`shipClose` and the new `landFailedRecord` refused handler). The rendered mirror `.bkit/workflows.md` and its `.bkit/version` hash were regenerated in commit 8da3a6370, and `dist/commands/workflow/workflows.js` carries the change.

## Previously Attempted

None for the holistic pass. Group reports: `build-plan-verify-1-1.md` (Group 1, PASS, Tasks 1, 2) and `build-plan-verify-2-1.md` (Group 2, PASS, Tasks 3, 4).

## Notes

- TASK 1: `closePr` (`.bkit/core/engine/commands/workflow/workflows.ts:1478`) takes `{ title, branch, subject }`. `grep -n 'ship DONE`\|ship-close/${'` hits only the `shipClose` call (lines 1558-1559) and line 2460, the existing `close` verb help string, which is not part of `closePr`. The `gh` stub (`ghStub`, head as a parameter) and `withGhOnPath` are at file scope; "closePr with base dev still merges" asserts the `docs(12-export-csv): ship DONE` title.
- TASK 2: a refused `--flush` returns exit 0, `pushed: true`, `ref` `ship-failed/{fid}` for a merged or open PR, and exit 10 naming both the dev refusal and the PR failure otherwise. "--push on dev refused keeps the record in the checkout and exits 10" (`workflows.test.ts:2338`) is unchanged. All three `Derived Test Matrix` rows are in Task 2's `DONE WHEN` and pass. The `refused` case widens `pr` back to its declared union with `as` because TypeScript narrows a closure-assigned `let` to `null`; this is not an `as any` / `as unknown as` escape.
- TASK 3: `grep -n 'ship-failed' .bkit/core/.bkit/workflows.md` shows lines 132, 150 and 823; `.bkit/core/workflows/bkit-ship.md` has no change since the branch start (d7bed40ce).
- TASK 4: `docs/testing.md:826` and `docs/deployments.md:142` carry the edits; the old "a refused push keeping the record in the book with exit 10" clause is gone.
- `npx vitest run .bkit/core/engine/commands/workflow/workflows.test.ts`: 189 passed, 0 skipped. Group 1 gate (`build-group-gate-1-1.md`): 57 test files, 4461 tests passed.
- Test-first audits `build-tests-green-1-1.md` and `build-tests-green-2-1.md`: `Enforced: true`, PASS, 0 gaps, 0 unproven; no `Taken over`, `Unproven`, `Changed by a code step`, `Updated tests` or `Already landed` sections.
- `docs/observability.md` exists; the change adds only `ctx.log` lines on the existing stderr log, which the plan rated not applicable, and no new log names.
- No decision records and no gap-remediation logs exist for this run.
- Uncovered but not required by the plan: the Process Sketch case "PR opens but the merge fails" (`close-pr-open`) has no dedicated test; no matrix row names it.

## Identified Gaps Log

None
