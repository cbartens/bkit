Verdict: CONCERNS
Failures: 6

<!-- verdict:end -->

# Plan Review

Lens: Tightness, dependency correctness, design-coverage.

## CRITICAL

1. **Task 4 and Task 12 prescribe a `status route --prompt-file` command the CLI refuses.**
   - `status.ts:416-418` throws `--prompt-file is for --workflow=debug`, so the plan's build call at Task 12 (`status route --workflow=build --file="{STATUS}" --prompt-file="{SESSION_DIR}/prompt.md"`) exits `USAGE` (2), which build routes to the Failure Path. Task 4 line 383 says "Flags unchanged", and its own `DONE WHEN` runs the same command, so it cannot pass either.
   - Fix: Task 4 widens the guard (accept `build` as well as `debug`), names that change in `**UPDATE:**`, and adds a `TEST FIRST`/matrix row for "`status route --prompt-file` accepts `--workflow=build`". Without it, the whole publish-resolution design is unreachable.

2. **Task 13's `DONE WHEN` cannot pass before Task 14, and Task 14 depends on Task 13.**
   - Task 13 greps `.bkit/core/.bkit` for `(:lite|lite\.md|[Ll]ite workflows?)` (line 925). `.bkit/core/.bkit/README.md:52` still holds `build:lite` and `lite.md`; Task 9 only removes lines 244 and 279, and line 52 is Task 14's (`rewrite the change row to /bkit-plan or /bkit-build only`, line 940). Task 14's `DEPENDS ON: 13` then deadlocks.
   - Fix: move the `.bkit/core/.bkit/README.md` change-row rewrite into Task 13, or drop that file from Task 13's grep and add a `.bkit/core/.bkit/README.md` grep to Task 14's `DONE WHEN`.

3. **The held close's roadmap step names no command, and the existing command pushes to `dev`.**
   - Current Step 16 runs `bkit roadmap mirror` (`bkit-build.md:898`), and `mirror` appends the row then lands it on `dev` through `pushToDev` (`roadmap.ts:439-470`), violating "nothing pushed". `roadmap fold` (`roadmap.ts:508-524`) only re-renders from `.bkit/issues.jsonl` and does not append the `BUILT` row, so `/bkit-ship` would sweep a feature with no `BUILT` row.
   - Task 12 says only "fold the roadmap in the worktree"; the plan's Assumption (line 233) calls that "a worktree commit, not a push", which `roadmap mirror` contradicts. Fix: name `bkit roadmap feature --workflow=build --fid={FID}` (append + render, no push) in the held branch, and add a shape test that the held path does not call `roadmap mirror`.

4. **Task 2 and Task 4 consume a `dist/` build that only Task 15 produces.**
   - `dist/` is tracked (`git ls-files dist`), `build` is `tsc`, and the runbook builds it only in Task 15 (line 960). Task 2's `DONE WHEN` runs `node dist/cli.js repo info` and Task 4's runs `node dist/cli.js status route …`; both read the stale pre-change build. Tasks 1-11 also change engine `.ts` without the `pnpm build && git add dist/` the repo rule requires in the same commit.
   - Fix: add `pnpm build && git add dist/` to each task that changes engine code (or to the last task of each engine group), and drop the CLI checks from Task 2/4, leaving `node dist/cli.js` assertions in Task 15.

5. **`migrateRetiredLite` inherits two preconditions that stop it retiring the real payload.**
   - (a) `migrateShortcutsToLite` early-returns when `getBkitDocsRoot()/lite.md` is absent (`core.ts:341`); Task 9 deletes exactly that file, after which the migration would no-op in every consumer upgrade. (b) The shipped doc's only content below `bkit:end` is the seeded `## Project Lite Workflows` heading (`core.ts:71-73`; the repo mirror `.bkit/lite.md:71-73` is identical), so "no consumer lines" is false for every install unless that heading is excluded the way `migrateShortcutsToLite` excludes `## Project Shortcuts` (`core.ts:337,351-355`).
   - Task 15 requires `grep -c . .bkit/lite.md` to find no file (line 968), so both must be fixed. Fix: Task 7 states the replacement does not gate on the payload doc's existence and drops the seeded heading, with two extra fixtures (heading-only file is deleted; migration runs with `.bkit/core/.bkit/lite.md` absent).

6. **`Docs: not synced` is required in the summary but no task or test produces it.**
   - Success criterion 5 (line 50) and the plan's own acceptance detail (line 59) say `Docs: not synced` appears in the summary. `buildSummary` (`summary.ts:161`) has no Docs line, Task 5 adds only `Publish: held` / `Publish: pr` (lines 726-728), and the matrix's summary rows (130-133) have no Docs row. The only assertion is Task 14's README test, which checks the README, not the summary.
   - Fix: Task 5 emits `Docs: not synced (ship syncs on landing)` when `publish === false`, and add the matching `Derived Test Matrix` row and `TEST FIRST` test.

## OPTIONAL

1. **Task 3's non-object-block branch is untested.** `detectBuildPublish` claims `bkit-build-publish-invalid` for "a non-object block or a non-boolean `local`", but matrix row 124 covers only the non-boolean `local`; the non-object case has no row or test.
2. **Task 4 claims `publishSource` output with no test.** Matrix rows 127-129 assert `publish` only; `publishSource` (`token|local|remote|coerced`) is unasserted. Add one row, or drop the output.
3. **Task 12 reads only § Prompts and Workflows** (line 885); the repo rule names § Prompts and Workflows **and** § Workflows Only for a workflow edit. Add the second read.
4. **Task 15 lists `.bkit/version` twice** (lines 961 and 965). Drop one.
5. **Success criterion 8 (`/bkit-ship <ref>` lands a held build) has no runbook test.** Only the advisory Manual Verification Step 2 covers it. Either add a task sentence naming the existing ship path it relies on (probe finds no PR → `prs open`, CI gate, merge) or a test.
6. **Task 12's snapshot `DONE WHEN` is tautological.** "The none baseline matches after `-u`" is satisfied by the regeneration itself; rely on the reviewed diff the Verification Plan already requires and say so.
7. **Task 12 Step 1 holds `buildPublishRemote` / `buildPublishLocal` but nothing later reads them**, while Step 2 re-derives from `status route`. Either use them in the coercion narration or drop the hold and the Task 12 dependency on Task 2.
8. **New install/git integration tests should isolate `GIT_DIR` / `GIT_WORK_TREE`.** The open `docs/failures.jsonl` row `main-checkout-left-core-bare-true` records a test writing `core.bare=true` and a fixture identity into the real checkout under the pre-push hook's exported `GIT_DIR`; Tasks 7/8 add install tests and Task 15 installs in the repo. State the isolation in Task 7's `TEST FIRST` note.

## OUT OF SCOPE

None. Every plan task maps to an issue item, and each `Out of Scope` row carries a reason, a destination and a matching `docs/deferrals.jsonl` key.

## SUGGESTED SCOPE EXPANSION

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| `363-dev-dispatch-cap-self-resettable-by-controlled-principal` (LOW, open) | `related-deferrals.md` line 10 | Task 10's `closeWorkflow` and Task 12's held path that drops `runs dispatch` | Keep deferred — the held path removes dispatch entirely and no counter changes. |
| `gate-prompts-md-untrusted-input-doctrine-row` (MEDIUM, open) | `related-deferrals.md` line 12 | Task 13's edit to `.bkit/core/.bkit/prompts.md` | Keep deferred — different row; Task 13's edit is prose removal covered by the grep, not by a pinning test. |
| `639-refused-ship-failed-record-lost-in-cloud-container` (LOW, open) | `related-deferrals.md` line 22 | The held handoff's later `/bkit-ship` landing | Keep deferred — ship's record path is unchanged by this plan. |
