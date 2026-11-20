Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

4 of 4 (the plan has four groups: tasks 1-3, 4-8, 9 and 10-11).

## Integration Gaps

0. All four groups change one function, `closePr` in `.bkit/core/engine/commands/workflow/workflows.ts`, and its helpers. The checks run in one order before any merge or push: read origin's tip (TASK 1); the record-path check with `:(glob)` patterns (TASK 10, which replaces TASK 8's `UNION_PATHSPECS` list and TASK 1's `minPushOutside` check); the deleted-file and removed-`.jsonl`-row check (TASK 11); the symlink/gitlink check (TASK 4). Then come the `-X ours` merge, the ledger-row put-back through the exported, symlink-safe `restoreBranchRows` (TASKS 1, 4), the commit with the record's `[skip ci]` subject (TASK 6), the landing gate (TASK 9), the push, reuse of a same-repo open PR (TASKS 1, 5), the head wait (TASK 7), the merge at `head`, and the return of `sha: head` (TASK 2).
- Group 4 against groups 1-3: a real record's leftover tip still passes the narrowed check. `carryLogs` copies only `*.md` files directly in the run's log folder, ledger rows come through `unionLedgers` / `SHARED_LEDGERS` (both exclude `.bkit/issues.jsonl`), and records only append rows. So the TASK 1 success paths (open PR, no PR, squash-merged tip, close reuse) and TASK 9's `{REL}/poison.md` gate test still reach the merge. TASK 4's `${REL}/evil.jsonl` symlink is still admitted by the ledger glob and refused by the mode check, which names it. The TASK 8 skill and `.bkit/issues.jsonl` tips fall outside the new list and are refused.
- API contracts: `closePr` returns `Promise<{ ref, via, sha } | { failed }>`, and both callers `await` it. `landFailedRecord` links `close-pr-open` at `sha` and `close-pr` at `DEV`. `shipClose` keeps `{ ref, via }` in `landed`. `failed` maps to exit 10 (flush) and 11 (close).
- Shared state: `isCrossRepository` (in `PR_FIELDS` / `PrInfo`), `changedOutside` (ledgers.ts) and `sleep` (land.ts) are used with their existing meanings. `pnpm exec tsc --noEmit -p .` exits 0.

## Previously Attempted

- `build-plan-verify-holistic-1-1.md`: `PASS`, tasks 1-3 (the plan had one group then).
- `build-plan-verify-holistic-1-2.md`: `PASS`, tasks 1-9 (three groups). The holistic gate that followed was red on two load-flaky tests (`tracker.test.ts`, `locks.test.ts`); `build-plan-gaps-remediate-holistic-1-2-log.md` found no branch defect and changed no file. Challenge round 2 (`build-challenge-2.md`) then added group 4.
- Group 1: `build-plan-verify-1-1.md` `CONCERNS` (2 gaps, one missing setup write in a TASK 1 test), fixed by `build-plan-gaps-remediate-1-1-log.md`; `build-plan-verify-1-2.md` `PASS`.
- Group 2: `build-plan-verify-2-1.md` `CONCERNS` (TASK 4's `git diff --raw` failed open), fixed by `build-plan-gaps-remediate-2-1-log.md`; `build-plan-verify-2-2.md` `PASS`, tasks 4-8.
- Group 3: `build-plan-verify-3-1.md` `PASS`, task 9.
- Group 4: `build-plan-verify-4-1.md` `PASS`, tasks 10-11.

## Notes

- Tests run here (2026-11-20, load ~9-13): `pnpm exec vitest run .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/commands/workflow/branches.test.ts` → 2 files, 542/542 passed, none skipped. The run diff adds no `.skip`, `.only`, `it.todo`, type escape or linter disable; the `it.skip` hits in `branches.test.ts` are pre-existing string fixtures. The full suite was not run here (`Local tests first`: it runs in the holistic gate and the pre-push hook).
- Derived Test Matrix: all 19 rows have their test in their task's `TEST FIRST` (18 in `workflows.test.ts`, 1 in `branches.test.ts`), each name is present exactly once, and each passes. The existing tests TASKS 1 and 2 name (`closePr with base dev still merges`, `closePr refuses when the PR base is unknown`, `--flush refused by dev publishes the FAILED record through a PR`, `--flush refused by dev links the handover comment at dev once the PR merged`) exist and pass.
- TASKS 1-9: satisfied, as `build-plan-verify-holistic-1-2.md` judged; group 4 changed only `closePr`'s pre-merge checks, the tests and `dist/`. The `...-1509` and `...-830` deferrals have `CLOSED` rows and `811-leftover-...` has a `SUPERSEDED` row, each naming `1042`. `.bkit/workflows.md` matches its source on every leftover-branch clause line.
- TASKS 10-11: satisfied, as `build-plan-verify-4-1.md` judged. `dist/commands/workflow/workflows.js` carries the `:(glob)` list, the `--diff-filter=D` / `--numstat` check and `gateMerged` (last touched in the group 4 execute commit `7f40cd43c`).
- Documentation Updates: all 4 rows done. `docs/observability.md` is present; the new failure reasons go through the existing `ctx.log` / `stop` paths.
- Advisory, not gaps (no `DONE WHEN` asks for them): `UNION_PATHSPECS` stays exported from `ledgers.ts` though no file outside `ledgers.ts` imports it any more, because TASK 10 gave `closePr` its own `:(glob)` list. `gateMerged` does not re-check that the gate left the tree unchanged, which is deferral `...-workflows-ts-1696`. The close path's exit 11 for the TASK 10/11 refusals has no test of its own; it goes through the same `closePr` return the flush tests cover.
- No test-first audit report was supplied for this holistic run, so Step 8 has nothing to decide. Decision records `build-decision-1-1.md` and `build-decision-1-2.md` hold only the `VERIFY_GAPS` question header with no answers, so they accept no gap.
- The plan file's uncommitted change ticks TASKS 10 and 11; it is the workflow's own edit, not this step's.

## Identified Gaps Log

None

