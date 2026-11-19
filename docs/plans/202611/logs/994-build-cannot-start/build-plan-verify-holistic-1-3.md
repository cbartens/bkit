Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6
Loosened: none
Fingerprint: 3737e6ce566fa5dc7e1d67353049df379125f256176a86d969f4386dcad3ac97
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (the plan has 3 groups).

## Integration Gaps

0. The three groups agree with each other (details in Notes).

## Previously Attempted

- `build-plan-verify-holistic-1-1.md`: PASS, Tasks 1-5, judged 2 groups before the challenge round added group 3.
- `build-plan-verify-holistic-1-2.md`: CONCERNS, 1 gap (TASK 6: `keptBranchCopy` read the branch blob with no `maxBuffer`, so a differing copy over 1 MiB was silently not kept). `build-plan-gaps-remediate-holistic-1-2-log.md` reports it fixed (commit `9e25f2774`).
- Group reports read: `build-plan-verify-1-1.md` (CONCERNS, byte-identical test missing; fixed by `build-plan-gaps-remediate-1-1-log.md`), `build-plan-verify-1-2.md` (PASS, Tasks 1, 2), `build-plan-verify-2-1.md` (PASS, Tasks 3, 4, 5), `build-plan-verify-3-1.md` (CONCERNS, docs drift; fixed by `build-plan-gaps-remediate-3-1-log.md`), `build-plan-verify-3-2.md` (PASS, Task 6).

## Notes

- Mode: Holistic, judged against `tmp/bkit-diff-994-build-cannot-start.md`. No test-first audit report was supplied to this step, so Step 8 does not apply.
- Decision `build-decision-1-1.md` is a Fix-now (direction a), not an accept, so it accepts no gap. The orchestrator answered it under the away policy; the owner did not type it.
- The attempt-2 gap is closed: `keptBranchCopy` (`.bkit/core/engine/commands/workflow/branches.ts:559`) reads the blob with `maxBuffer: OUTPUT_LIMIT` (`1 << 26`, 64 MiB, `.bkit/core/engine/commands/lib.ts:1005`), and `resolveRebase` refuses with `REFUSE {path} — the branch's differing copy could not be kept aside` instead of reporting a silent success. The new `branches.test.ts` case `keeps a differing branch copy larger than 1 MiB aside and names it` passes. `dist/commands/workflow/branches.js` (built 23:13, source 23:07) carries both.
- TASK 1 satisfied: `classifyConflict(file, embeds, fid?)` returns `"planlog"` through `isOwnPlanFile` after the ledger check; the classification case passes.
- TASK 2 satisfied: `rebasedFid` (via `readRebaseState`, shared with `rebaseOrigHead`), `takeDevSide` shared with `resolvePath`, `how: "dev"`, the `RESOLVED ... — took the rebase target's copy` line and the `NOT_RESOLVABLE` plan-file clause are in place. `worktrees.integration.test.ts` proves the chain end to end against a real bare remote: `setup` exits 3, `branches rebase` exits 0, `setup` exits 0.
- TASK 3 satisfied: `pnpm exec tsx .bkit/core/engine/tools/cli-doc.ts` (check mode) exits 0 with no drift, and `cli-doc.test.ts` passes. The Tier 2 row and both `docs/testing.md` rows name the new cases.
- TASK 4 satisfied: `dist/` is newer than both sources and carries every change. `node dist/cli.js check` exits 0. `git status` shows only this run's `status.jsonl` and this report.
- TASK 5 satisfied: `bkit ledgers query` reports `951-build-rebase-plan-v2-reviewed-add-add-conflict` as `status: CLOSED`, and `git diff --numstat origin/dev...HEAD -- docs/failures.jsonl` is `1 0`.
- TASK 6 satisfied: a differing branch copy is kept under `{FID}/dropped-logs/{time}/{path}` through `droppedLogsDir` / `keepAside` (shared with `carryLeftovers`). The `RESOLVED` line names the kept path, and an identical copy keeps nothing. Its TEST FIRST test passes.
- Integration between groups: group 3 appends `; the branch's differing copy is kept at {path}` to group 1's `RESOLVED` line, and group 1's tests assert with `toContain`, so they still pass. The group 2 help text, the `.bkit/core/.bkit/cli.md` / `.bkit/cli.md` row (line 94, identical), the Tier 2 row in `.bkit/core/.bkit/workflows.md:835` / `.bkit/workflows.md:835` (identical) and the failures-row remediation all describe the built behaviour. `Resolution["how"]` gains no new value. `worktrees.ts` does not import `./branches.js`, so the new import adds no cycle. `DETAILS.md` and `docs/capabilities.md` change only in generated graph counts.
- Derived Test Matrix: all 10 rows have their tests in the TASK 1, TASK 2 and TASK 6 `DONE WHEN` / `TEST FIRST`, and every one exists and passes.
- Test run (load 8.6): `pnpm exec vitest run` on `branches.test.ts`, `worktrees.integration.test.ts`, `worktrees.test.ts` and `cli-doc.test.ts` ran 4 files and 475 tests, all passed in 234.69s. `oxlint` on `branches.ts`, `branches.test.ts` and `worktrees.ts` reported nothing. `build-holistic-gate-1-2.md` ends `every stage passed` (it ran before the remediation). The full suite was not run here: the rules keep it for the pre-push hook and the workflow's final run.
- Observation (no gap): the Tier 2 row does not mention the new refusal for a differing copy that cannot be kept aside. It fires only above 64 MiB or on a failed `git cat-file`. If `keepAside` throws (for example, the outbox folder is not writable), the verb fails with the rebase still in progress rather than aborting it. Either way the exit is non-zero and the workflow takes the Failure Path.
- Open LOW deferrals from the challenge round (not gaps, recorded in `docs/deferrals.jsonl`): `branches.ts-646` (misleading skip line), `branches.ts-553` (glob characters given to `git rm`), `branches.ts-907` (a feature id holding `/` from `rebasedFid`).
- Observability: `docs/observability.md` is present. Each settled plan file logs one `RESOLVED` line, and every refusal logs a `REFUSE ... ; routing to Failure Path` line.
- Every `Documentation Updates` row is done.

## Identified Gaps Log

None
