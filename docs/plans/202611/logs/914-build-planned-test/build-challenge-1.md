Verdict: CONCERNS
Failures: 7
Fingerprint: 0ccf42aad1b670c416405f30a8616baf6f9371dccf3500a70a4d6bd8cf829f02
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

Read the plan `docs/plans/202611/914-build-planned-test-plan.md` (groups 1-4, Tasks 1-13) and the run diff `tmp/bkit-diff-914-build-planned-test.md` (no `partial diff coverage` marker). Went deep on the engine source hunks: `.bkit/core/engine/commands/workflow/tests.ts` (`lockBaselines`, `workflowRows`, `plannedKeys`, `touchedTests`, `baselineDiff`, `blockedTests`, the `tests red` `standing` check, the `tests green` `changed` list, its not-enforced path and the report section) and `.bkit/core/engine/commands/workflow/steps.ts` (the `finish` lock block, the problem and help text). Read the new tests in `steps.test.ts`, `tests.test.ts` and `planned-test-lock.integration.test.ts`, the `bkit-build.md` exit 11 re-asks and Step 15 routing, the prompt and catalog hunks, and the surrounding code the diff relies on: `writeStepRow` and its rollback, `extraField`, `CORE_ROW_KEYS`, `testSpan`, `lineDiff`, `doneTasks` and the summary disposition reader (`summary.ts:768`). The regex and split claims in Tasks 5-7 were checked with `node -e` against the exact expressions in the code. Host mirrors, `dist/`, the render snapshot, `DETAILS.md`, the ledgers and `docs/capabilities.md` hunks were read only as far as their outline: they repeat the sources and hold nothing for this lens.

## Notes

- Docs read: `.agents/docs.md`; `docs/security.md` § Untrusted Content & Prompt Injection and § Shell Injection; `docs/architecture.md` (headings only: it has no section on the test-first lock); `.bkit/core/.bkit/workflows.md` § Test-first and § Decision Pause as the diff changes them. Other Build-column docs (`.bkit/prompts.md`, `.agents/skills.md`, `docs/capabilities.md`, `docs/data-schema.md`, `docs/observability.md`, `docs/testing.md`, `docs/knowledge.jsonl`) were not loaded: they hold nothing about the lock's null and error paths.
- Task 1 cross-reference: the plan's first Goal ("every change it keeps reaches the owner") and Security & Privacy bullet ("Each let-through is recorded and reaches the owner at the `CHANGED_TESTS` pause") do not hold for a repo with no `bkit:test:file` script. `tests red` still writes blobs and blocks on that path (`EXIT_NO_GATE` help: "the row holds the blobs with enforced false"), so the lock and its `BLOCKED` let-through run, but `tests green` returns at `tests.ts:2471-2485` with `changed: []` and exit 0, so Step 15 never pauses.
- Task 2 cross-reference: `.bkit/core/.bkit/workflows.md` § Test-first says "Other tests in the same file, helpers and new tests are free to change", and the plan's second Goal says a step that did not touch the file is never refused for it. Both fail for a planned test whose red `block` is null (the whole-file fallback), and the widening to every group makes a later group's tests step trigger it. The holistic step already had this fault before the diff.
- Task 3 cross-reference: the exit 11 help and problem text name `changedTests` to the orchestrator, and `extraField` JSON-parses any `--field`, so the sanctioned flag can write the field. `lockBaselines` needs no `reason`, while `tests green` lists only records with one (`b.reasons.length > 0`): a reason-less record moves the baseline and is never shown.
- Task 4 cross-reference: the plan's Task 11 fix exists so the owner sees more than the agent's words. A planned test written whole by the code agent after a `missing` red still reaches the owner through the `UNPROVEN` pause, because `tests green`'s red audit reads `redEntries`. The `CHANGED_TESTS` item for it, though, has no diff.
- Checked and found sound: `writeStepRow` takes the row back off `status.jsonl` when the commit fails, so a let-through is never recorded for an uncommitted step. `extras.changedTests` is set only when no test is refused. `<attempt>` is filled in before the lock reads `artifacts[0]`. `redKey` holds the task number, so dropping the group filter in `tests red`'s `standing` check adds no key collision. A baseline blob that cannot be read makes `removes` true, so the lock fails closed. `tests red` writes red blobs with `hash-object -w`, so `baselineDiff` can read them back.
- Not raised: a change that only adds lines can still disable a test (an added `return;`). `lineDiff`'s own comment says so, and the owner's Task 11 decision accepted the add-only rule with the diff shown at the pause. Wrapping a planned test in a `describe.skip` without re-indenting it leaves the block hash unchanged. That gap is older than this diff ("other edits to a test file are free") and is not in its scope.
- No CRITICAL finding: every gap either fails closed (it refuses correct work) or reaches the owner by another route, except Task 1, which is HIGH because the change merges with no owner question in a supported configuration that holds no data or secret.
- No embedded directives were found in the diff or the plan.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** In a repo with no `bkit:test:file` script, a code agent keeps a planned-test change under a `BLOCKED` line and it merges unseen, because `tests green` prints `changed: []` whenever test-first is not enforced
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests.ts:2481` · **Round:** 1
  - **DONE WHEN:** `tests green` builds its `changed` list from `lockBaselines` before the not-enforced return and prints it (and the `## Changed by a code step` report section) on that path too, because the lock in `steps finish` runs on the red row's blobs whether or not the test-file script exists. Step 15 then reaches the `CHANGED_TESTS` pause for such a repo.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green lists a changed test when test-first is not enforced` fails on `changed: []` when the test-file script is undeclared and a `build-plan-tasks` row written by `writeStepRow` carries a `changedTests` record for a plan-named test
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** A later group's tests step adds a test to a file whose earlier-group planned test has no recorded block, and every later code step is refused with exit 11 that no `BLOCKED` line can clear
  **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/tests.ts:468` · **Round:** 1
  - **DONE WHEN:** The owner decides how a planned test whose lines the lock cannot find (red `block` null, for example a parameterised `it.each` name) is locked now that every group is checked: by its whole file across every later group (today: any later edit to the file, including a later tests step's new test, refuses the code step, and the `BLOCKED` path always refuses it because `baselineDiff` returns null against a non-null baseline), only within its own group, or let through by a whole-file additive diff under a `BLOCKED` line. No agent can settle it: it trades the lock's strength against goal 2 of the plan ("a later step that did not touch the file is never refused for it") and the § Test-first promise that other tests in the same file are free to change.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block` fails on exit 11 when group 1's red entry has `block: null` (its name is not in the file) and group 2's red row records a new test appended to the same file
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** A `changedTests` record on any step row, written through `--field changedTests=...` or with no reason, moves the lock's baseline, and `tests green` then hides it from the owner
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests.ts:377` · **Round:** 1
  - **DONE WHEN:** `lockBaselines` reads `changedTests` only from `step-done` rows of `build-plan-tasks`, `build-plan-gaps-remediate` and `build-plan-gaps-remediate-holistic`, and only records with a non-empty string `reason`, so every record that moves a baseline is one `tests green` lists. `steps finish` and `steps record` refuse a `--field changedTests` with a usage error, so only the lock writes the field.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a changedTests record on a non-code-step row does not move the lock's baseline` fails on exit 0 when a `build-plan-verify` row written by `writeStepRow` carries a reason-less `changedTests` record holding the weakened test's block, and the execute step then removes an `expect` line from the planned test with no `BLOCKED` line
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `refuses a --field changedTests on a step finish` fails on exit 0 and a row carrying the forged `changedTests`
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** A code agent writes a planned test whole, after its red recorded the file `missing`, under a `BLOCKED` line, and the owner's `CHANGED_TESTS` item carries no diff, only the agent's reason
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests.ts:486` · **Round:** 1
  - **DONE WHEN:** `baselineDiff` reads a null baseline blob (a red that recorded the file `missing`) as empty text, so the diff lists every line of the test as added and `additive` is `true`. `tests green`'s `changed` entry for such a test then carries that diff, and the § Decision Pause item shows it. A baseline blob that is set but unreadable still gives null, so `steps finish` keeps refusing it.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green gives a changed test whose red recorded its file missing every line of the test as added` fails on a `changed` entry with `diff: null` after a red row records the test `missing` with `blob: null` and a `build-plan-tasks` row records a `changedTests` entry for the file the code step then wrote
<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->
- [ ] **TASK 5:** A code agent logs `BLOCKED - TASK 3: test ...` with a hyphen, the lock lets the change through, and the build summary still lists task 3 as blocked after its `DONE — TASK 3` line
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/summary.ts:768` · **Round:** 1
  - **DONE WHEN:** The summary's disposition reader accepts the same em dash, en dash or hyphen that `blockedTests` and `doneTasks` accept, so a later `DONE` line for the same task replaces a hyphen `BLOCKED` test line and no risk item is listed for it.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `a hyphen BLOCKED test line followed by DONE for the same task lists no blocked item` fails on a `Risks and action items` entry holding `BLOCKED - TASK 3: test`
<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->
- [ ] **TASK 6:** A `BLOCKED` line names a changed test by the last ` > ` segment of a name that itself holds `>` (for example `keeps a >= 0`), and the step is refused
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:1326` · **Round:** 1
  - **DONE WHEN:** `finish` takes the last segment with `split(" > ")`, the same split `testSpan` uses to find a test by its last segment, so a `BLOCKED` line naming that segment matches.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `lets a code step through when its BLOCKED line names the last segment of a name holding a >` fails on exit 11 when the red records `rows > keeps a >= 0`, the file holds `it('keeps a >= 0'`, a line is added to that test, and the log's `BLOCKED` line names `keeps a >= 0`
<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->
- [ ] **TASK 7:** A `BLOCKED` test line whose reason is only a trailing space (an `echo` with an empty variable) lets the change through with an empty reason, and the owner's item says nothing about why
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests.ts:1537` · **Round:** 1
  - **DONE WHEN:** `blockedTests` drops a line whose reason is empty after trimming, so it names no test and the change is refused as an unlogged one, as the plan's Edge Cases row for a line with no reason says.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `blockedTests > ignores a BLOCKED test line whose reason is only spaces` fails on an entry with `reason: ""` read from a `BLOCKED — TASK 2: test` line for `src/a.test.ts` `adds a row` that ends in an em dash and one space
<!-- bkit:task 7 end -->
