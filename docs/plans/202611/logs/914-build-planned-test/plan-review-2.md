Verdict: CONCERNS
Failures: 8
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Regression risk — touched surfaces, backwards compatibility, design-coverage.

## Surface-Area Map

Design artifact: none (`docs/plans/202611/914*` holds no design; the plan says so in § Narrative), so the design-coverage check does not apply.

**High-risk surfaces flagged:** `touchedTests` (shared lock utility, `.bkit/core/engine/commands/workflow/tests.ts:351`), the `bkit steps finish` flag contract (shipped CLI, `use: workflow`, `.bkit/core/engine/commands/workflow/steps.ts:1713`), the `status.jsonl` `step-done` row shape (read by `redEntries` callers in `tests.ts:2037`, `tests.ts:2318`, `context.ts:1626`), and the build § Decision Pause (multi-question routing, `.bkit/core/workflows/bkit-build.md:127-229`).

**Task 1 — plan-named lock across every group, `--plan` required**

- Files: `.bkit/core/engine/commands/workflow/tests.ts`, `steps.ts`, `steps.test.ts`; new `planned-test-lock.integration.test.ts`.
- Symbols: `touchedTests` (`tests.ts:351`, signature change; only caller `steps.ts:1262`, plus `dist/commands/workflow/steps.js`); new plan-key helper over `readTestFirst` (`tests.ts:745`) and `redKey` (`tests.ts:296`); the lock condition in `finish` (`steps.ts:1256-1260`).
- Consumers: every `steps finish` call for `build-plan-tasks` / `build-plan-gaps-remediate` / `build-plan-gaps-remediate-holistic` — `.bkit/core/workflows/bkit-build.md:643`, `:810`, `:895`; the render baseline `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt:558`, `:725`, `:810`; `.bkit/workflows.md:970`; `status.test.ts:397` (a `--step=build-plan-tasks` row writer, not a finish).
- Runtime binary: `{BKIT}` = the main checkout's `node_modules/.bin/bkit` (`bkit-build.md:36`), so every worktree build on one clone runs the same engine.
- Commit path: the code step's commit runs git hooks (`steps.ts:721`, no `--no-verify`); `.husky/pre-commit:18-23` runs `bkit:check:dist` (`package.json:88`) on any staged non-test engine `.ts`.

**Task 2 — `blockedTests`, let-through, `changedTests` baseline**

- Files: `tests.ts`, `steps.ts`, `steps.test.ts`, `tests.test.ts`.
- Symbols: new `blockedTests` beside `passesLines` (`tests.ts:1463`); `touchedTests` return shape (`TouchedTest`, `tests.ts:339-342`) gains `task` and `block`; the exit 11 emit (`steps.ts:1269-1275`, `tests: [{test, name}]`); problem text (`steps.ts:1266`); `--plan` help (`steps.ts:1715`); exit 11 help (`steps.ts:1809`).
- Consumers of the emitted `tests` list: existing assertions `steps.test.ts:1877`, `:1894` (`toEqual([{ test, name }])`); the workflow re-asks' `<tests>` (`bkit-build.md:645`, `:812`, `:897`); `recordTestLockFriction` (`steps.ts:93`).
- Other readers of `BLOCKED` log lines: `tasks open` (`tasks.ts:280`, counts `BLOCKED` as closed); the summary's last-disposition reader (`summary.ts:510-515`); the tasks and remediate prompts' `FAIL` rules (`bkit-build-plan-tasks.md:128`, `bkit-build-plan-gaps-remediate.md:120`).
- Baseline readers that stay on `redEntries` without `changedTests`: `tests red`'s `standing` (`tests.ts:2037-2048`) and `context brief --tests-only` (`context.ts:1624-1632`).

**Task 3 — `tests green` `changed` list and report section**

- Files: `tests.ts`, `tests.test.ts`, the integration test.
- Symbols: the `green` run (`tests.ts:2276-2493`, JSON emit at `:2480-2489`); `writeAuditReport`.
- Consumers: build Step 8 green (`bkit-build.md:679`, per group), Step 15 green (`bkit-build.md:1114`, whole plan), the verify prompt's audit-report rules (`bkit-build-plan-verify.md:89-101`).

**Task 4 — build workflow: `--plan`, re-asks, `CHANGED_TESTS` pause**

- Files: `.bkit/core/workflows/bkit-build.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/instructions.md`.
- Consumers: the render baseline test `.bkit/core/engine/render/trackers.test.ts:399-402` (`bkit-build: the none render matches its baseline byte for byte`, file `__snapshots__/bkit-build.none.txt`); `workflow-shape.test.ts:736-758` (Step 7 audit); the instructions corpus check; `decisions compose` / `apply` / `pending` (question-agnostic, `workflows.ts:288`); ship § Confirm Assumed Items (`bkit-ship.md:360-400`).

**Task 5 — prompts**

- Files: `bkit-build-plan-tasks.md` (`:107-109`, `:128`, `:141-146`), `bkit-build-plan-gaps-remediate.md` (`:95`, `:120`, `:136`), `bkit-build-plan-verify.md` (`:89-101`), `.bkit/core/.bkit/prompts.md`, `.bkit/instructions.md`.
- Consumers: `prompt-notation.test.ts:45`, the instructions corpus check, host mirrors.

**Task 6 — docs, `dist/`, mirrors**

- Files: `.bkit/core/.bkit/workflows.md`, `.bkit/shared/docs/testing.md`, `.bkit/core/docs/templates/bkit-plan.md`, `docs/testing.md`, `dist/`, every host mirror.
- Consumers: `bkit check` drift, `bkit:check:dist`, the capability register (`docs/capabilities.md`, knowledge key `capability-register-drift-reached-dev-through-warn-only-pre-push`).

**Schemas and tables:** none (no database). The one row change is the optional `changedTests` field on three code steps' `step-done` rows; rows without it read as "no change".

## CRITICAL

1. **(plan edit) Group 1's code-step commit is refused by the dist freshness hook.** Tasks 1-3 edit `.bkit/core/engine/commands/workflow/tests.ts` and `steps.ts`, and the plan rebuilds `dist/` only in Task 6 (group 2). `steps finish --commit=auto` commits with hooks (`steps.ts:721`). `.husky/pre-commit:18-23` runs `bkit:check:dist` (`package.json:88`: rebuilds and `git diff --exit-code dist/`) whenever a non-test engine `.ts` is staged, so the group 1 `build-plan-tasks` commit fails and the step is rolled back. `.agents/rules.md:202` (§ Engine builds) also requires `dist/` in the same commit. Fix: add `pnpm build` with `dist/` staged to the `DONE WHEN` of Tasks 1, 2 and 3, and keep Task 6's rebuild only as the final check.

2. **(plan edit) Task 4 breaks an existing test it does not name.** Every `bkit-build.md` edit changes the none render. `.bkit/core/engine/render/trackers.test.ts:399-402` (`bkit-build: the none render matches its baseline byte for byte`) compares it with `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`, which holds the three finish lines at `:558`, `:725` and `:810` without `--plan`. Fix: add a Task 4 `UPDATE` line for that baseline file (regenerated with `vitest -u` after review), and name the test in `DONE WHEN`.

3. **(plan edit) Task 2 changes the exit 11 JSON shape, which existing tests and the re-asks read.** Task 2 makes `touchedTests` return `{task, test, name, block}`. `finish` emits that array as `tests` directly (`steps.ts:1269-1275`). The existing assertions `expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }])` at `steps.test.ts:1877` and `:1894` then fail, and the documented contract (`steps.ts:1809`: `` `tests`: [{test, name}] ``) and the re-asks' `<tests>` (`bkit-build.md:645`, `:812`, `:897`) change. Fix: either emit only `{test, name}` from the refusal (keep `task` / `block` internal for `changedTests`), or add `UPDATE` lines for those two assertions and the help text.

4. **(plan edit) The cross-group fixtures do not match what a real run produces, so the lock can lose finished groups unseen.** In a real build, Step 8's `tasks tick` (`bkit-build.md:701`) marks group 1's tasks `- [x]` before group 2's code step runs. The nearest code pattern, `tests red`, skips done tasks (`tests.ts:2059`: `if (s.kind !== "test" || done.has(s.task)) continue;`). A plan-key helper that copies it locks no test of any finished group. A fixture plan with group 1 still `- [ ]`, like the existing one (`steps.test.ts:1708`), cannot catch that. Fix: in Task 1 rows 1-2 (`refuses the execute step ...`, `refuses the gaps-remediate step ...`) and Task 3's integration row, state that the fixture plan has group 1's tasks ticked `[x]`. Also state in Task 1's helper line that done tasks stay in the plan-named set.

5. **(plan edit) The superseded-test tests can pass on the current code.** `passes a code step whose red row names a test the plan no longer names` (Task 1, `steps.test.ts`) and `a red row's test the plan dropped never blocks a code step` (Task 1, integration) do not say which group's red row holds the dropped test. The current code checks only the finishing step's own group (`steps.ts:1258` passes `group` to `touchedTests`, which reads `redEntries(file, workflow, group)` at `tests.ts:366`). If the fixture follows the Concrete Example (group 6's red row, group 7's step), the current code already exits 0 and the tests never go red. Fix: pin the dropped test's red row to the finishing step's own group (or use the holistic step), so the current code exits 11 on it.

6. **(plan edit) `refuses a later code step that changes a BLOCKED change again` (Task 2) names a failure the current code cannot produce.** Its only failure signal is "the later step finishing with exit 0". The current code refuses any planned-test change against the red (`tests.ts:374-375`). So if the fixture writes the earlier `changedTests` row by hand, the test already passes on the current code. Fix: require the setup to record the first change through a real finish whose exit 0 and `changedTests` entry the test asserts, or add a signal only the new code gives (the refusal compared against the recorded change, not the red).

7. **(plan edit) `green leaves a changed test the plan no longer names out of changed` (Task 3) names a failure no code path produces before Task 3.** Its failure is "`changed` listing a test that no `TEST FIRST` line names". Neither the current `tests green` emit (`tests.ts:2480-2489`) nor Task 2's code writes a `changed` key, so an assertion written as "does not contain" passes before Task 3 lands. Fix: assert the exact list, for example `changed` equals the one plan-named entry while the dropped test's `changedTests` record exists, so a missing `changed` key also fails.

8. **(plan edit) The required `--plan` has no shim for a build already running.** Breaking Changes row 1 says no migration is needed because `bkit upgrade` re-renders the workflow "the orchestrator reads on resume". But a session that is already running keeps the old workflow text, and `{BKIT}` is the main checkout's `node_modules/.bin/bkit` (`bkit-build.md:36`). Once the main checkout's `dist/` moves to the new engine (a dev sync, or an upgrade in a consumer), every running build on that clone gets exit 2 at its next code-step finish, and a missing `--plan` there has no `Route:` (`bkit-build.md:643`, `:810`, `:895`), so the run goes to the Failure Path. The Rollback table covers only the revert direction. Fix: when `--plan` is absent, fall back (Q4 option B's path derived from the status folder, or the old own-group lock with a logged warning) instead of exit 2. Or, at minimum, add the forward window and its recovery to Breaking Changes and Rollback.

## OPTIONAL

- **Baseline readers outside the lock ignore `changedTests`.** `tests red` decides whether an earlier red still holds by comparing block hashes against `redEntries` (`tests.ts:2037-2048`). The tests-step restore on the loosened-test arm re-runs `tests red` for the group (`bkit-build.md:798`). In that path, a same-group test let through by a `BLOCKED` line no longer counts as red, so it is re-run, passes, and is recorded as not red. That newer row replaces the `changedTests` record, so Step 15 shows the test as `UNPROVEN` and the reason is lost. The owner still sees the test, so the guarantee holds. Add a matrix row for that path, or make the check that keeps an earlier red honour the recorded change.
- **The re-ask path writes `BLOCKED` after `DONE`.** The usual way a cross-group change is found is the exit 11 re-ask (`bkit-build.md:645`), which appends the `BLOCKED` test line after the task's existing `DONE` line. Under the prompts' `FAIL` rule (`bkit-build-plan-tasks.md:128`, `bkit-build-plan-gaps-remediate.md:120`), the agent then sets `Verdict: FAIL`, and `summary.ts:510-515` keeps `BLOCKED` as the task's last disposition. Plan Assumption 2 holds only for a first-pass log. Have the re-ask also re-append `DONE — TASK {N}` (or `DONE — Gap {N}`), or exclude engine-read test lines from the `FAIL` rule.
- **`tasks open` counts any `BLOCKED` line as closed** (`tasks.ts:280`). Task 5 tells the agent to append the line and then finish the task. If the agent hits its turn cap in between, the task reads as closed and gets no handover. Tell the agent to finish the task's code first, then append the `BLOCKED` test line and its `DONE` line.
- **The lock fails open on a bad `--plan`.** If the plan file is missing, or the parser reads no task from it, the plan-named set is empty and the lock checks nothing. Add a Task 1 test showing that a `--plan` naming a missing file, or a plan with no task blocks, exits 2 and does not pass.
- **More exposure to a known formatter gotcha.** With every group locked, a code step that runs `prettier --write` over an earlier group's test file is now refused (knowledge keys `prettier-write-after-a-red-breaks-the-test-first-audit`, `steps-finish-refuses-a-code-step-whose-planned-test-file-changed`). Task 5's prompt text could say that formatting a planned test file counts as an edit.
- **Field names differ across the three shapes.** `changedTests` uses `testName`, while `changed` and `blockedTests` use `name`. Build Task 3's fixtures from a real Task 2 finish, or from one shared row builder, so a hand-typed row cannot drift from what `finish` writes.
- **Capability register.** The new test file and exports may change the module graph. Add `pnpm bkit:graph:check` to Task 6's `DONE WHEN` (knowledge key `capability-register-drift-reached-dev-through-warn-only-pre-push`).
- **Prerequisite drift.** The line numbers cite the current `dev`. Once #891 lands (`tests.ts`, `decisions.ts`, `bkit-build.md`, the verify prompt), re-check the Decision Pause item list and the Step 15 sub-step numbers before building.

## OUT OF SCOPE

- `build-failure-remediate` (`bkit-build.md:1096`, the Step 12 test-loop fix) writes code but is not one of the three locked steps, so it can change a planned test with no check. This predates this plan.
- At ship, rejecting a changed test still merges the branch (`bkit-ship.md:374`: "Ship merges either way"), and the reject is recorded as a `needs-decision` deferral; nothing puts the test back. The plan's `bkit tests restore` idea would be the place for that.
