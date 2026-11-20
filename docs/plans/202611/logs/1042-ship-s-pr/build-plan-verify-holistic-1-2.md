Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (the plan has three groups: tasks 1-3, 4-8 and 9).

## Integration Gaps

0. The three groups change one function, `closePr` in `.bkit/core/engine/commands/workflow/workflows.ts`, and its helpers, and the pieces run in one order: read origin's tip (TASK 1), refuse a tip outside the record's paths (TASK 8, which replaces TASK 1's `minPushOutside` check), refuse symlinks and gitlinks (TASK 4), merge `-X ours`, put back ledger rows through the exported `restoreBranchRows` (TASK 1, hardened by TASK 4), commit with the record's `[skip ci]` subject (TASK 6), run the landing gate (TASK 9), take `head`, push, reuse an open same-repo PR (TASK 1, filtered by TASK 5 in `probePr`), wait for its head (TASK 7), merge with `--match-head-commit` at `head`, and return `sha: head` (TASK 2).
- API contracts: `closePr` now returns `Promise<{ ref, via, sha } | { failed }>`; both callers `await` it. `landFailedRecord` links `close-pr-open` at `sha` and `close-pr` at `DEV`; `shipClose` keeps only `{ ref, via }` in `landed`, so its output shape is unchanged. `failed` maps to exit 10 (`EXIT_PUSH_FAILED`, flush) and 11 (`EXIT_FLUSH_FAILED`, close).
- Shared state: `UNION_PATHSPECS` (now exported from `ledgers.ts`), `isCrossRepository` (added to `PR_FIELDS` and `PrInfo` in `prs.ts`) and `sleep` (already exported from `land.ts`) are used with their existing meanings. `gateMerged` picks the gate as `checkLanding` in `.bkit/core/engine/commands/land.ts:199` does and runs in the same `_land-{FID}` checkout, so its inputs are already prepared.
- `pnpm exec tsc --noEmit -p .` exits 0.

## Previously Attempted

- `build-plan-verify-holistic-1-1.md`: `PASS`, tasks 1, 2, 3. It ran when the plan had one group, before the challenge added groups 2 and 3.
- Group 1: `build-plan-verify-1-1.md` `CONCERNS` (2 gaps, one missing setup write in a TASK 1 test), fixed by `build-plan-gaps-remediate-1-1-log.md`; `build-plan-verify-1-2.md` `PASS`.
- Group 2: `build-plan-verify-2-1.md` `CONCERNS` (1 gap, TASK 4's `git diff --raw` check failed open), fixed by `build-plan-gaps-remediate-2-1-log.md`; `build-plan-verify-2-2.md` `PASS`, tasks 4-8.
- Group 3: `build-plan-verify-3-1.md` `PASS`, task 9.

## Notes

- Tests run here: `pnpm exec vitest run .bkit/core/engine/commands/workflow/workflows.test.ts .bkit/core/engine/commands/workflow/branches.test.ts` → 2 files, 539/539 passed, none skipped. The run diff adds no `.skip`, `.only`, `it.todo`, type escape or linter disable. The full suite was not run here (`Local tests first`: it runs in the pre-push hook and the holistic gate).
- Derived Test Matrix: all 16 rows have their test in their task's `TEST FIRST` (15 in `workflows.test.ts`, 1 in `branches.test.ts`), and each passes. The existing tests TASK 1 and TASK 2 name (`closePr with base dev still merges`, `closePr refuses when the PR base is unknown`, `--flush refused by dev publishes the FAILED record through a PR`, `--flush refused by dev links the handover comment at dev once the PR merged`) exist and pass.
- TASKS 1-3: satisfied, as `build-plan-verify-holistic-1-1.md` judged, with the later groups' changes on top. `dist/commands/workflow/{workflows,branches,ledgers,prs}.js` carry every source change. The `...-1509` and `...-830` deferrals have `CLOSED` rows naming `1042`; `811-leftover-...` has a `SUPERSEDED` row naming `1042`. `.bkit/workflows.md` matches its source on the clause lines, and its SHA-256 equals the `.bkit/version` entry.
- TASKS 4-8: satisfied, as `build-plan-verify-2-2.md` judged; the TASK 4 fail-open gap from `build-plan-verify-2-1.md` stays fixed (`raw.ok` check before the mode scan).
- TASK 9: satisfied, as `build-plan-verify-3-1.md` judged. `gateMerged` runs after the merge commit and before the push, a failing or undeclared gate returns `{ failed }` naming the branch and the gate, and `docs/security.md` § Supply-Chain (GitHub Actions) carries the `[skip ci]` paragraph.
- Documentation Updates: all 4 rows done (`docs/decisions.jsonl`, `docs/testing.md` row at line 965, `docs/deployments.md` lines 138 and 357, `.bkit/core/.bkit/workflows.md` plus the re-render). `docs/observability.md` is present; the new failure reasons go through the existing `ctx.log` / `stop` paths.
- The two new LOW rows in `docs/deferrals.jsonl` (`1042-ship-s-pr-challenge-low-...-branches-ts-2947`, `...-workflows-ts-1692`) are challenge deferrals, outside every task's `DONE WHEN`.
- Advisory, not gaps (no `DONE WHEN` asks for them): `gateMerged` does not re-check that the gate left HEAD and the tree unchanged, as `checkLanding` does. The reuse wait in TASK 7 runs its full 20 x 500 ms when a stub's `pr view` answers no `headRefOid` (the default `ghStub`), which adds about 10 s to each reuse test.
- No test-first audit report was supplied for this holistic run, so Step 8 has nothing to decide. No decision records (`build-decision-*.md`) exist.

## Identified Gaps Log

None
