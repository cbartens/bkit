Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 3, 4, 5
Loosened: none
Fingerprint: a0b17551c3da1f1cb8322d6b7a91894d20f8fd659dc21c78696e04cef64a7752
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (the plan has 3 groups).

## Integration Gaps

0. The three groups agree with each other (details in Notes).

## Previously Attempted

- `build-plan-verify-holistic-1-1.md`: PASS, Tasks 1-5. It ran before the challenge round added group 3 (TASK 6), so it judged 2 of what are now 3 groups.
- Group reports read: `build-plan-verify-1-1.md` (CONCERNS, byte-identical test missing; fixed by `build-plan-gaps-remediate-1-1-log.md`), `build-plan-verify-1-2.md` (PASS, Tasks 1, 2), `build-plan-verify-2-1.md` (PASS, Tasks 3, 4, 5), `build-plan-verify-3-1.md` (CONCERNS, docs drift; fixed by `build-plan-gaps-remediate-3-1-log.md`), `build-plan-verify-3-2.md` (PASS, Task 6).

## Notes

- Mode: Holistic, judged against `tmp/bkit-diff-994-build-cannot-start.md`. No test-first audit report was supplied to this step, so Step 8 does not apply.
- Decision `build-decision-1-1.md` is a Fix-now (direction a), not an accept. The orchestrator answered it under the away policy; the owner did not type it. It accepts no gap.
- TASK 1 satisfied: `classifyConflict(file, embeds, fid?)` returns `"planlog"` through `isOwnPlanFile` after the ledger check.
- TASK 2 satisfied: `rebasedFid` (via `readRebaseState`, shared with `rebaseOrigHead`), `takeDevSide` shared with `resolvePath`, `how: "dev"`, the `RESOLVED ... — took the rebase target's copy` line and the `NOT_RESOLVABLE` plan-file clause are all in place. The end-to-end chain (`setup` exits 3, `branches rebase` exits 0, `setup` exits 0) is proven in `worktrees.integration.test.ts` against a real bare remote.
- TASK 3 satisfied: `pnpm cli:sync` exits 0 and leaves no diff. `cli-doc.test.ts` passes. The Tier 2 row and both `docs/testing.md` rows name the new cases.
- TASK 4 satisfied: `dist/commands/workflow/branches.js` and `dist/commands/workflow/worktrees.js` carry every change, including group 3's `keptBranchCopy`, `droppedLogsDir` and `keepAside`. `node dist/cli.js check` exits 0. `git status` shows only this run's logs.
- TASK 5 satisfied: the `951-build-rebase-plan-v2-reviewed-add-add-conflict` row is `CLOSED`, and `git diff --numstat origin/dev...HEAD -- docs/failures.jsonl` is `1 0`.
- TASK 6 not satisfied: the mechanism is in place (`keptBranchCopy`, shared `droppedLogsDir` / `keepAside` called by `carryLeftovers`). Its TEST FIRST test passes. But a differing branch copy larger than 1 MiB is silently not kept (gap below). A previous group verifier saw this as an observation; this attempt confirmed a real tracked plan log of that size exists and probed the failure.
- Integration between groups: group 3 appends `; the branch's differing copy is kept at {path}` to group 1's `RESOLVED` line. Group 1's tests assert with `toContain`, so they still pass. The group 2 help text, `.bkit/core/.bkit/cli.md` / `.bkit/cli.md` row and failures-row remediation still describe the behaviour correctly. The Tier 2 row in `.bkit/core/.bkit/workflows.md:835` and its rendered `.bkit/workflows.md:835` are byte-identical and describe the kept copy. `branches.ts` already imported `./worktrees.js`, and `worktrees.ts` does not import `./branches.js`, so no import cycle is added. `Resolution["how"]` gains no new value.
- Derived Test Matrix: all 10 rows have their tests in the TASK 1, TASK 2 and TASK 6 `DONE WHEN` / `TEST FIRST`, and all of them exist and pass.
- Test run (load 3.3): `pnpm exec vitest run` on `branches.test.ts`, `worktrees.integration.test.ts`, `worktrees.test.ts` and `cli-doc.test.ts` ran 4 files and 474 tests, all passed. `oxlint` on `branches.ts` and `worktrees.ts` exits 0. The full suite was not run here: the rules keep it for the pre-push hook and the workflow's final run.
- Observation (no gap): `branches.ts` imports from `./worktrees.js` twice (lines 78 and 83-93). Lint does not flag it.
- Open LOW deferrals from the challenge round (not gaps, recorded in `docs/deferrals.jsonl`): the misleading skip line when a plan-file replacement empties a commit (`branches.ts:646`), glob characters in the path given to `git rm` (`branches.ts:553`), and a feature id containing `/` from `rebasedFid` (`branches.ts:907`).
- Observability: `docs/observability.md` is present. Refusals keep the `REFUSE ... ; routing to Failure Path` line, and each settled plan file logs one `RESOLVED` line. The silent lost copy is the one exception, logged below.
- Every `Documentation Updates` row is done.

## Identified Gaps Log

1 gap.

TASK 6: `.bkit/core/engine/commands/workflow/branches.ts:559` — `keptBranchCopy` reads the branch blob with `spawnSync("git", ["cat-file", "blob", ...])` and no `maxBuffer`, so a differing branch copy over Node's 1 MiB default (a real tracked plan log is 1405196 bytes: `docs/plans/202611/logs/1053-upgrade-leaves-stale/build-tests-red-1-1.md`; probed on Node v24.16.0: `status null`, `ENOBUFS`) returns null, is not written aside, the `RESOLVED` line names no kept path and nothing is logged, while the rebase still exits 0 — the DONE WHEN "that branch copy is first written aside" fails for that input; read the blob with the file's existing `OUTPUT_LIMIT` (or stream it to the kept path) and log or refuse when the copy cannot be kept, with a `branches.test.ts` case over a blob larger than 1 MiB — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A differing branch copy of a plan file over 1 MiB is silently not kept
  **Severity:** MEDIUM · **Class:** correctness · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:559` · **Round:** 1
  - **DONE WHEN:** keptBranchCopy reads the branch blob with maxBuffer OUTPUT_LIMIT (or streams it to the kept path), so a differing branch copy larger than 1 MiB is written under the outbox {FID}/dropped-logs/{time}/{path} and named on the RESOLVED line; when the copy still cannot be kept, branches rebase logs it on stderr or refuses instead of reporting a silent success; a branches.test.ts case over a plan log larger than 1 MiB proves it
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/branches.test.ts
<!-- bkit:task 1 end -->
