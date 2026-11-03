Verdict: PASS
Failures: 0
Fixable: false

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 5` (one group): TASK 7 `ledgers triage`, TASK 8 `ship-update-docs` `Pending Items` from the engine.

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

Both group-5 tasks are satisfied in the codebase, and each `DONE — TASK {N}` line in `build-plan-execute-5-log.md` was checked rather than taken as proof.

**TASK 7.** `.bkit/core/engine/commands/workflow/ledgers.ts` registers `triage` (summary, `--root` / `--fid` / `--plan` with `--plan` required, output `fid` / `plan` / `rows` / `total` / `written`, exit `EXIT_ROW_REFUSED`), exports `DEFERRAL_TESTS`, `featureDeferrals`, `unjustifiedRow` and `triageDeferrals`, and hands each computed row to the existing `appendLedgerRows`, so the `ts` mint and the writer check stay in one place (confirmed: `appendLedgerRows` refuses a row carrying `ts` and mints it, `.bkit/core/engine/commands/workflow/ledgers.ts:1234`). `.bkit/core/engine/commands/workflow/plan-blocks.ts:261` adds `outOfScope` beside `reuseInventory`, over the same `firstTable` / `tableCells` heading scope. The sweep prompt's reason-test block is replaced by the verb call in § Process 9 (`.bkit/core/prompts/bkit-ship-deferred-sweep.md:70`), names none of the four test names, and § Process 7 keeps its deliverable rows. Dogfooded against a scratch repo with `node dist/cli.js ledgers triage`: a row whose four tests all hold printed `Lazy` and got a same-`key` `unjustified` / `TRIAGED` row with a minted `ts` (`1793109832044`, `schema` 3, `by.workflow` = `ship`); a `low-severity` / `LOW` row printed `Exempt: not tested` and wrote nothing; a row whose only declaration is itself stayed `Exempt`; another feature's row was not listed; a FID with no row exited 0 with `total: 0` and wrote nothing; a re-run wrote nothing (5 rows before and after); a missing `--plan` exited 2.

**TASK 8.** `.bkit/core/prompts/bkit-ship-update-docs.md` § Process 7 no longer greps `docs/deferrals.jsonl` (lines 62 and 80 fill `Pending Items` from the `ship-pending-items.md` scan; the surviving `docs/deferrals.jsonl` mention at line 48 is the deferral-write rule, not the removed grep). `.bkit/core/workflows/bkit-ship.md` § Step 6 runs `context ledger-scan --terms="{FID}" --source=docs/deferrals.jsonl --artifact="{OUTBOX}/ship-pending-items.md" --fid={FID} --step=ship-update-docs --reset-log` before the subagent and lists the artifact in its `Read:`. Every flag checks out against `context.ts:1334-1352`: `--terms`, `--source` and `--artifact` are required, `--reset-log` needs `--log` or `--fid` + `--step`, both supplied.

**Tests.** The eight planned group-5 tests exist by name and pass, together with the task-8 guard: `pnpm vitest run ledgers.test.ts plan-blocks.test.ts workflow-shape.test.ts` → 3 files, 335 tests passed. The full suite is green (`pnpm vitest run` → 201 files, 7937 passed, 1 skipped; the skip is a conditional `skipIf` on a tool's availability outside group 5, and neither group-5 test file carries a `.skip` / `.todo`). Every group-5 `Derived Test Matrix` row (plan lines 147-149, 159, 174-177) sits in TASK 7's `TEST FIRST`; TASK 8's `TEST FIRST` is `n/a`, which the plan's own rule exempts from a matrix row.

**Test-first audit** (`build-tests-green-5-1.md`, `Enforced: true`, `Gaps: 2`). Both gaps are `test-changed` on `.bkit/core/engine/commands/workflow/plan-blocks.test.ts`, and both diffs are prettier's line wrapping of one `cells` array — same three elements, same order, no assertion removed, weakened or rewritten → no gap. The six `ledgers.test.ts` rows marked `added lines only` differ from their snapshots by one removed blank line at `@@ -1304,7 +1304,6 @@`, outside every planned test and outside the setup those tests run → no gap. The report carries no `Late-red check` section, so no task is recorded there; none is added as a gap.

**Advisory, not gaps.** The diff also carries `.bkit/instructions.md` (the coverage index re-synced to the changed ship sweep / update-docs / ship steps, which `.agents/rules.md` § Repo Authoring requires) and `dist/commands/workflow/{ledgers,plan-blocks}.js` (rebuilt with `pnpm build`), neither of which is a field on TASK 7 or TASK 8; both are consistent with the repo's authoring rules and neither satisfies or blocks a `DONE WHEN`. Per the execute log's second NOTE, `.bkit/workflows.md`'s ship Step 6 row, the `docs/deferrals.jsonl` writer row and the `.claude/` / `.cursor/` / `.opencode/` mirrors are still group 6's work (TASK 10 / TASK 11), not group 5's.

No decision records, no `build-plan-gaps-remediate-5-*` logs and no prior `build-plan-verify-5-*` reports exist for this group; this is attempt 1.

## Identified Gaps Log

None
