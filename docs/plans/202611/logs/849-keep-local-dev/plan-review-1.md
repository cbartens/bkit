Verdict: CONCERNS
Failures: 1
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Tightness — task dependency order, design-coverage.

## CRITICAL

1. **Group 1 hands a failing test to Group 3: the close-squash integration test runs the built `dist/`, which only Task 11 rebuilds.** (plan edit)
   - **What breaks:** Task 3's `TEST FIRST` rewrites `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` `bkit-design.md local close squash > lands past another session's uncommitted edit to a file the close changes, and keeps the edit` to assert the close JSON's `localDev` `blocked: edited-files`. That test runs `bkit branches land` from the repo's built binary, not through `tsx`: `const BKIT_BIN = path.resolve("dist/cli.js");` (`close-squash.integration.test.ts:23`), and the file header says `bkit branches land` "runs from the repo's built dist/" (`:7`). No `globalSetup` or `pretest` script builds `dist/` (`vitest.config.ts:35` sets only `./vitest.test-lock.ts`; `package.json:84` `test:integration` is a bare `vitest run integration.test`).
   - **Where `dist/` is produced:** only Task 11 (Group 3) runs `pnpm build`. Tasks 1-10 change engine `.ts` without rebuilding.
   - **Result:** the rewritten assertion stays red through Group 1 and Group 2. It turns green only when Group 3's Task 11 rebuilds `dist/`. The build checks each group before it starts the next, so Group 1 cannot end green. Task 9's `DONE WHEN` (`pnpm vitest run .bkit/core/engine/audits/workflows` passes) depends on the same rebuild.
   - **Plan text that is wrong:** `Verification Plan` § Automated Tests says this test is "a real design / plan close spawned through `tsx`". It runs `dist/cli.js`.
   - **Fix (plan edit):**
     - Add `pnpm build` to Task 3's steps, and add "`pnpm build` has rebuilt `dist/`" to its `DONE WHEN`.
     - Apply the same rule to every task that edits `.bkit/core/engine/**/*.ts` (Tasks 1-8 and 10). `.agents/rules.md` § Engine builds (`pnpm build && git add dist/`, so `dist/` lands in the same commit) and `docs/knowledge.jsonl` row 60 ("dist/ staleness — `pnpm build` must run before push for `.bkit/core/engine/**/*.ts` changes") both ask for this.
     - The runbook's "a natural commit split is one commit per group" would commit Groups 1 and 2 without `dist/`, so either drop that sentence or tie it to the per-task build.
     - Also correct the "spawned through `tsx`" wording.
     - Alternative: move the rewritten close-squash assertion to Group 3, after Task 11. This is weaker, because Group 1 then ships `branches land` with no integration proof.

## OPTIONAL

1. **Task 10 breaks a test that no task names.** Ship's step count drops from 14 to 13, but `.bkit/core/engine/commands/workflow/progress.integration.test.ts:471` still asserts `"Progress: ██████████ 100% · Step 14/14 Close Workflow"` for the ship `--flush` close. Add it to Task 10's `UPDATE` list (it becomes `Step 13/13`). Also check `workflows.test.ts:785` (`"--step-number=14"`).
2. **Tasks 9 and 10 leave render snapshots for Task 11 to fix.** Both tasks edit workflow sources (`bkit-design.md`, `bkit-plan.md`, `bkit-debug.md`, `bkit-build.md`, `bkit-ship.md`), and `.bkit/core/engine/render/__snapshots__/*.none.txt` is regenerated only in Task 11. Everything stays inside Group 3, so the group hand-off holds. Still, regenerating each affected snapshot in the task that changes its source keeps every task green on its own and matches "no task leaves its tests to a later one".
3. **Task 9 may break how close-squash finds the `branches land` line.** The test pulls the `branches land` line out of the Close Workflow block of `bkit-design.md` / `bkit-plan.md` and runs it as written (`close-squash.integration.test.ts:2-4`). Task 9 changes that block to hold `localDev.line` as `LOCAL_DEV_LINE`. Add that test to Task 9 as a `READ` plus a regression check, so the new capture does not break the extraction.
4. **The ship Failure Path's `--flush` handover has no test.** Task 7's two handover tests cover only `--push` on `dev`. Ship's Failure Path runs `workflows handover --flush` (`bkit-ship.md:110`), which reaches `landFailedRecord` from a non-shared feature checkout (`workflows.ts:907-913`), and Task 9 shows its `localDev.line`. Add a matrix row and a Task 7 test for `--flush`. It should also say whether `routine: "failure-handover"` applies there: from a feature worktree, the record's edits are not in the main checkout.
5. **Two fetches where the design asks for one.** Task 3 keeps the audit's `fetchDev(root)` in `landVerb` (`branches.ts:3223`) and also keeps a plain `fetchDev` in `syncDevVerb` for the exit code, and `syncLocalDev` then fetches again. The design's Key Edge Case says "one fetch after the landing; the target is that fetched tip". Nothing is unsafe (`origin/dev` only moves forward), but it costs an extra network call per close. Consider a `fetched` option on `syncLocalDev`, or let `syncDevVerb` map `unavailable: fetch-failed` to `EXIT_FETCH_FAILED`.
6. **No test covers the `landPr` fallback.** Design WS-7 names "`branches land` … including the `landPr` fallback once merged". Task 3's call comes after `landPr` returns a landed SHA, so the code path is covered by construction, but the matrix has no row for a merged PR fallback while the runtime pushes `dev` (the `dev` push was refused, then the PR merged). Consider one `branches.test.ts` row.
7. **Task 5 changes the behaviour of tests that already exist.** Once `pushBranch` syncs on every push of `dev`, each existing test that pushes `dev` through `pushBranch` (`branches.test.ts` push cases, `runs.test.ts` dispatch, `workflows.test.ts` handover) now fetches, and may run the frozen install when local `dev` moves under a main checkout on `dev`. Task 5 should name a fixture rule: no `package.json`, or an injected install. Otherwise a temp-repo test may spawn a real `pnpm install` or exceed its timeout. The plan names this risk only for the one handover test in Task 7.
8. **#842 has shipped, so the plan's #842 references are out of date.** `related-issues.md` lists `#842 … (closed)` with "already merged (259c7fc55)", and `.bkit/issues.jsonl:106` records `842-ship-fails-local` as `SHIPPED`. The plan still says `#842 … (open)` (Related Issues), relies on "#842 gap E owns the 'publish `dev`' advice" (Assumption), sends the Out of Scope row and deferral `849-publish-dev-advice-stays-with-842` to "#842 gap E", and recommends "Build #842 after this plan" (Suggested Scope Expansion). The three `git push origin dev` strings are still in the code (`branches.ts:3173`, `worktrees.ts:269` ff., test `branches.test.ts:3786`). Keeping them unchanged still follows the issue comment of 2026-11-10, but the deferral now has no live home. Re-home it in a new issue or the next release umbrella, and fix the Related Issues status and the scope-expansion row.
9. **Group 1 is one test below its cap.** Group 1 holds 24 `TEST FIRST` tests against the cap of 25. Any test added while fixing CRITICAL 1 (or OPTIONAL 6) has to go into Group 2 or force a split. Task 4 (one log-text test) could move to Group 2 to make room, because it consumes nothing from Task 3. Its `DEPENDS ON: 3` is ordering, not an artefact.

## OUT OF SCOPE

- `docs/testing.md` § Spawning `bkit` from tests (`:869-885`) tells tests to spawn through `tsx` (`requireTsx()`), but eight integration tests spawn `dist/cli.js`, including `close-squash.integration.test.ts`. Pick one rule and make the doc and those tests agree. This belongs in its own change, not in this plan.

## SUGGESTED SCOPE EXPANSION

- `engine-journal-misattributes-calls-to-stale-run` — `related-failures.md` row 4 (`TRIAGED`): the engine journal dirties a tracked `status.jsonl` in the main checkout and blocked fast-forwarding `dev`. Once this plan ships, that shows up as a routine `blocked: edited-files` line. Recommendation: keep it separate, but name it in the plan's risks so the owner can tell that line apart from a real edit.
- `842-sync-with-origin-dev` — `related-deferrals.md` (`OPEN`), from the #842 build, which has since shipped. Recommendation: ask the owner to close it as stale, not join it to this plan.
- `842-remote-branch-retention-unapproved` — `related-failures.md` row 8 (`OPEN`): it touches the remote-branch delete in `worktrees.ts`, which Task 8 exempts from the reachability walk. Recommendation: keep it separate. Task 8's exemption check only has to keep tracking where that push currently lives.
- #813 rollback path / `dev` checks — `related-issues.md` (open): it overlaps the `bkit-ship.md` step list (Task 10). Recommendation: keep it separate. It needs a design decision.
