diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-tests.md b/.agents/plugins/bkit/agents/bkit-build-plan-tests.md
index ae46dd75a..1684d9dc4 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-tests.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-tests.md
@@ -74,8 +74,9 @@ tools:
    - **If** the log already holds `WROTE` or `PASSES` for a test → skip that test.
 5. **If** a red report is supplied → it names the tests whose red the engine could not prove, each with the state it found (`vacuous`, `missing`, `no-report`, `lint`). Rewrite only those tests, as the state says: a `vacuous` test passed with nothing to test, so make it reach the planned behaviour; a `missing` or `no-report` test is not at the file and name the entry gives; a `lint` test fails `bkit:lint:file`.
    - **If** the caller asks you to restore tests instead of supplying a brief (verify logged each one `test-loosened`) → for each test named:
-     - Read its `Updated tests` entry in the supplied green report. The entry's diff shows the test's own lines at `base` against the lines now.
-     - Put back every expectation the update removed or loosened, as it stood at `base` (`git show {base}:{file}`).
+     - Read its `Updated tests` or `Changed by a code step` entry in the supplied green report. The entry's diff shows the test's own lines at its baseline against the lines now.
+     - **If** the entry is an `Updated tests` one → put back every expectation the update removed or loosened, as it stood at `base` (`git show {base}:{file}`).
+     - **Else** (a `Changed by a code step` entry) → remove each added line that disables or loosens the test, so the restored test holds every baseline line of the entry's diff plus only the added lines that do not disable or loosen it.
      - Keep the expectations the update added.
      - Lint the file and run it, as for a test you write.
      - Append ``WROTE — TASK {N}: `{file}` `{name}` `` with Bash `echo >>`.
diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-verify.md b/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
index b131b6dc8..fa90b9fa6 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
@@ -91,8 +91,11 @@ tools:
      - **If** the hit is a different thing with the same name → no gap.
      - **Else** → `Fixable: true`.
    - `Unproven` section → list each test in `Notes`. No gap: the engine could not prove that test red before its code existed, and the owner answers it once, at the end of the build.
-   - `Changed by a code step` section → list each test and its reason in `Notes`.
-     No gap: a code step kept the change under a `BLOCKED` line, and the owner answers it once, at the end of the build.
+   - `Changed by a code step` section → list each test and its reason in `Notes`; its entry carries the engine's line diff since its baseline, and you read the added lines of that diff the way the `Updated tests` rule reads an update.
+     - **If** the added lines only add setup or expectations → No gap, because the owner answers the change once, at the end of the build.
+     - **Else** → an added line disables or loosens the test (an early `return`, a skip, a comment pair around assertions, `expect.assertions(0)`, a reassignment of the value under test):
+       - **If** a supplied earlier verify report of the group already logged `test-loosened` for that test, **or** the test belongs to a task of an earlier group (the tests step cannot record a restore of it in this group) → append ``TASK {N}: `{file}` `{name}` — test-loosened: {what} — Fixable: false``, so the owner decides.
+       - **Else** → raise a `test-loosened` gap: ``TASK {N}: `{file}` `{name}` — test-loosened: {what} — Fixable: true``, and name the test on the header's `Loosened` line, which sends it back to the tests step to restore.
    - `Updated tests` section → each test is an existing test the tests step changed. Its entry carries the engine's line diff of the test's own lines since `base`, and says whether the change is additive (no line removed). Read that diff, and the supplied group diff when the entry says the lines could not be read:
      - **If** the update only adds expectations → no gap. An additive change is one unless an added line disables or overrides an earlier expectation (a skip, an early return, a reassignment).
      - **Else** → the update removes or loosens an expectation. The tests step restores it and keeps the additions, because no code step may rewrite a planned test:
diff --git a/.bkit/core/.bkit/prompts.md b/.bkit/core/.bkit/prompts.md
index 5e7951f11..809a8673a 100644
--- a/.bkit/core/.bkit/prompts.md
+++ b/.bkit/core/.bkit/prompts.md
@@ -334,7 +334,7 @@ Cursor Cloud automation uses `composer-2.5` for metadata / API plumbing, and the
 | `bkit-build-install-skills` | Identify and install relevant skills via `npx skills find`/`add`: quality-hurdle the source (official publisher, or 1000+ installs / 100+ stars), install one named skill per gap, report provenance. |
 | `bkit-build-plan-tests` | Write one task group's planned tests — every `TEST FIRST` test of the task blocks in the brief `bkit context brief --group --tests-only --file` writes, which leaves out the tests the group's red rows already proved. Each test fails on the behaviour its `fails on` text names, is lint-clean, and never names a test the task's `TEST EXCEPTION` names; a stub only where a test cannot load without one; no source code (`steps finish --step=build-plan-tests --plan` refuses a diff touching any other file, exit 15). Flat log `build-plan-tests-{GROUP}-log.md`: ``WROTE — TASK {N}: `{file}` `{name}` ``, ``PASSES — TASK {N}: `{file}` `{name}`: {reason}`` (the behaviour already exists; `bkit tests red` records the test `passed-accepted`), ``BLOCKED — TASK {N}: `{file}` `{name}` — {reason}``, `SOURCE — TASK {N}: {value} from {file}:{line}` (where a value the test checks or fakes comes from). Verdict PASS / HANDOVER / FAIL: `HANDOVER` = turn cap near with tests left; the workflow re-runs the tests half once with a fresh brief. Re-invoked with a red report → rewrites only the tests it lists as `vacuous`, `missing`, `no-report` or `lint`. Never runs `bkit tests red` itself; the orchestrator runs it once per group after the step. |
 | `bkit-build-plan-tasks` | Execute one task group — the task blocks in the brief `bkit context brief --next` writes; earlier tasks in the brief are context only; the brief's `Deviations` section, when present, is the owner's run instruction, applied to the tasks it names. An existing log is kept and its `Verdict` reset to `PENDING`. Verdict PASS / HANDOVER / FAIL: `HANDOVER` = turn cap near with tasks neither `DONE` nor `BLOCKED` → stop after the current task's log line; the workflow re-runs the group once with a fresh brief, not as a failed attempt. The group's `TEST FIRST` tests are already on disk, written by `bkit-build-plan-tests` and recorded red by the engine before this step: makes them pass and never edits, renames, moves or deletes a planned test or a `TEST EXCEPTION` field (`steps finish` refuses the step when a planned test case differs from its baseline, exit 11), except that a correct code change forcing a planned-test edit is kept and logged ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` plus the task's `DONE` line, which the owner answers at the end of the build; a test recorded `passed-accepted` → `DONE — TASK {N}: already landed` when `DONE WHEN` already holds with no task code written; never undoes code to force a red (`.bkit/workflows.md` § Test-first). Honours the brief's `Reuse Inventory` rows and `Architecture` entries at the only point the decision can still be quietly discarded — `EXTEND` row modifies named artifact, never a parallel file; rows or entries the brief left out (8 KB work cap) → reads the plan section it names; reusable artifact found mid-build folds in, never forks; reads each task's `DONE WHEN` field as the completion criterion to satisfy; modify source; write stub artifact first then incremental `Task Log` entries — one `DONE — TASK {N}:` or `BLOCKED — TASK {N}:` line per task at line start, which the next brief reads to skip finished tasks. Reads `build-plan-current.md` when present: findings are fact, plan is intent — `Reword` tasks build at the paths the report names as current, `Broken` tasks whose work already landed log `DONE — TASK {N}: already landed`, the rest build the intent against current code. Never edits the plan file; tasks absent from the findings follow plan wording verbatim. Does not tick plan checkboxes (verify owns that). Does not write `docs/deferrals.jsonl` — a blocked task is a `BLOCKED` log line for verify to catch, not a deferral. |
-| `bkit-build-plan-verify` | Verify implementation vs plan; writes Plan Verification log. `Group` mode judges one group's briefs against the group diff (changes since the group's start commit); `Holistic` mode runs after the last group, and again after later groups, across every group, plus integration; it logs each integration gap and each failing test as an `INTEGRATION:` gap line ending `— Fixable: true`, or `— Fixable: false` only when closing it needs a choice the plan does not make. Ticks are the engine's: the header's `Tasks` line names the task numbers the codebase satisfies and `bkit tasks tick --green=` writes the `[x]`; the prompt edits no plan and never ticks a box. `bkit tests green` prints `verdict` and a `fixable` per gap, so the prompt holds no kind→`Fixable` table and no verdict mapping. Its reads decide only a `null` gap: `delete-still-referenced` → each hit read, a different thing with the same name → no gap, else `Fixable: true`; each `Updated tests` entry → the test's diff since its `base` read: only added expectations → no gap, a removed or loosened expectation → a `Fixable: false` gap; `Unproven` tests and `Changed by a code step` entries → `Notes`, no gap, because the owner answers them once at the build's end. Each gap is appended as the report's `logLine` with the decided `Fixable` in place of `null`; every other gap keeps its printed `fixable`; header `Failures` = unresolved gap count and `Fixable` = `true` when any is (build → fixable-only remediate, then Decision Pause); a test a task's `TEST EXCEPTION` field names is no gap; `Already landed` tests → `Notes` — a `BLOCKED` log line or a deferral row never discharges a task, so unfinished work routes to `@bkit-build-plan-gaps-remediate` in-loop instead of surfacing at ship. Missing `DONE WHEN` on any task → FAIL (template structure broken; remediation cannot recover). |
+| `bkit-build-plan-verify` | Verify implementation vs plan; writes Plan Verification log. `Group` mode judges one group's briefs against the group diff (changes since the group's start commit); `Holistic` mode runs after the last group, and again after later groups, across every group, plus integration; it logs each integration gap and each failing test as an `INTEGRATION:` gap line ending `— Fixable: true`, or `— Fixable: false` only when closing it needs a choice the plan does not make. Ticks are the engine's: the header's `Tasks` line names the task numbers the codebase satisfies and `bkit tasks tick --green=` writes the `[x]`; the prompt edits no plan and never ticks a box. `bkit tests green` prints `verdict` and a `fixable` per gap, so the prompt holds no kind→`Fixable` table and no verdict mapping. Its reads decide only a `null` gap: `delete-still-referenced` → each hit read, a different thing with the same name → no gap, else `Fixable: true`; each `Updated tests` entry → the test's diff since its `base` read: only added expectations → no gap, a removed or loosened expectation → a `Fixable: false` gap; `Unproven` tests → `Notes`, no gap, because the owner answers them once at the build's end; `Changed by a code step` entries → `Notes`, no gap when the added lines only add setup or expectations, else a `test-loosened` gap (`Fixable: false` for a test of an earlier group or one an earlier verify logged). Each gap is appended as the report's `logLine` with the decided `Fixable` in place of `null`; every other gap keeps its printed `fixable`; header `Failures` = unresolved gap count and `Fixable` = `true` when any is (build → fixable-only remediate, then Decision Pause); a test a task's `TEST EXCEPTION` field names is no gap; `Already landed` tests → `Notes` — a `BLOCKED` log line or a deferral row never discharges a task, so unfinished work routes to `@bkit-build-plan-gaps-remediate` in-loop instead of surfacing at ship. Missing `DONE WHEN` on any task → FAIL (template structure broken; remediation cannot recover). |
 | `bkit-build-plan-gaps-remediate` | Fix specific gaps from the group's latest verify log + group gate log failures, or, with Context `Mode: Holistic`, the holistic verify report's gap lines (reading the plan task blocks they name; no group gate) (the tests of the groups so far); a Context `Group gate` command is re-run after each fix until exit 0 — each newly exposed failure is a gap of the same round, other tests built on the same failing assumption are swept first — and logged `DONE — Group gate: exit 0`, which `PASS` needs; reads the group's briefs for its task blocks; Standard / Pivot / Final escalation. Context `Scope: fixable only` → `— Fixable: false` gaps out of scope. Header `Fixed` = `DONE — Gap` lines this attempt (0 → build Decision Pause). A supplied decision record → the owner's `Decision:` words steer the round. No strategy records a red by undoing or swapping out code, or rewrites a planned test case (`steps finish` exit 11 names the case); other tests in the same file are its to change, and a planned-test edit its code change forces is kept and logged ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` plus the gap's `DONE` line; never touches a `TEST EXCEPTION` field (`.bkit/workflows.md` § Test-first). |
 | `bkit-build-challenge-1` | Adversarial review of `git diff origin/dev...HEAD` — bug-hunting lens; effort slot 1 (`high`). Parallel with `-2`. Writes each finding as one task block — `Severity`, `Class` (`mechanical\|architectural`), `Fixable`, `Location`, `DONE WHEN`, `TEST FIRST` within the per-task `bkit.workflows.tasks` caps the workflow passes in Context — that `bkit challenge merge` appends to the plan as a new last group. Reads each `TEST FIRST` test's logic against the code the diff leaves: it must fail there, or `tests red` refuses it as `passed` and the fix task blocks; a finding an existing plan task or test already covers gets no block. Never references sibling output (circular reasoning guard). |
 | `bkit-build-challenge-2` | Same as `-1` — security lens; effort slot 2 (`high` on Claude / opus — depth-sensitive; Grok on Cursor — first-party depth, same native pool as `-1`). |
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index 69b3c313d..770238092 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -1796,7 +1796,7 @@ Every plan task block carries a `**TEST FIRST:**` field — one sub-bullet per t
 | Write (Step 7, per group) | `@bkit-build-plan-tests` from `build-brief-tests-{GROUP}-{n}.md`, log `build-plan-tests-{GROUP}-log.md` | Writes every planned test of the group's open tasks that no red row has proved yet, each failing on the behaviour its `fails on` text names, lint-clean; stubs only where a test cannot load without one; no source code. Log lines ``WROTE — TASK {N}: `{file}` `{name}` ``, ``PASSES — TASK {N}: `{file}` `{name}`: {reason}`` (the behaviour already exists), ``BLOCKED — TASK {N}: `{file}` `{name}` — {reason}``, `SOURCE — TASK {N}: {value} from {file}:{line}` (where a value the test checks or fakes comes from). `steps finish --step=build-plan-tests --plan` reads the group's `TEST FIRST` files from the plan and refuses a diff touching any other tracked file, or adding a file a plan `CREATE` line names: exit 15, `source` names them, nothing committed; the orchestrator re-asks once (undo the edits), then Failure Path. |
 | Red (Step 7, per group) | orchestrator runs `bkit tests red --group`, log `build-tests-red-{GROUP}-{n}.md` | Per planned test file of the group's open tasks: `bkit:lint:file` (when declared) passes on it, then `bkit:test:file` runs it once and its JUnit report is read. Per planned test: `red` (ran and failed), `red-not-loaded` (no case carries the planned name, and the report holds no case or only non-passing cases whose name contains the file's stem — an import of unwritten code; counts as red), `passed-accepted` (passed, and the writer's log has a `PASSES` line for it; already landed), `updated` (passed, no `PASSES` line, and the test already existed at the group's start commit with different lines: an existing test the tests step changed; `base` = that commit; counts as proven, and verify judges its diff), `vacuous` (passed, no `PASSES` line, not an update), `missing` (absent from a loaded report, or the file does not exist), `no-report` (no report written), `lint` (the file failed lint; not run). Writes one `build-tests-red` row (`attempt`, `enforced`, `tests` = `{task, test, testName, state, blob, block, reason?, base?}`, `blob` the file's git blob written into the object store with `hash-object -w`, `block` the sha-1 of the test's own lines (null when no line names it), `--commit=none`). Exit 0 every test red; 1 a gap; 3 `bkit:test:file` undeclared (blobs recorded, nothing ran, not enforced); 4 a script could not run. A test an earlier row of the group proved (`red`, `red-not-loaded`, `passed-accepted`, `updated`) with its own lines unchanged is not run again (`skipped`), so a handover, a retry or a task added to the group runs only what is left; a row holds the tests it ran, and readers merge the group's rows per test, later rows winning, except that a proven entry stands against a later unproven result for the same lines. Ticked tasks are skipped. Exit 1 → the orchestrator re-invokes the tests agent once with the red report (rewrite only the `vacuous` / `missing` / `no-report` / `lint` tests), runs red again, and then moves on whatever the result: the gaps reach `tests green` as `unproven`. |
 | Green (Step 8, before verify) | orchestrator runs `bkit tests green` | per planned test: a red entry of the group's rows in a proven state (else listed `unproven`, never a gap, its detail naming the recorded state or that no row exists); `passed-accepted` → `Already landed`, no gap; `updated` → `Updated tests` with the line diff of the test's own lines since `base` and whether it is additive (no line removed), no gap; the named test passes now (else `not-green`). Applies honoured `TEST EXCEPTION` fields; a task whose only test field is a `TEST EXCEPTION` not honoured → `exception-refused`. Per `DELETE` line: the file still exists, or its name (a dotted config key's full path, a `§ heading` as a heading line) is still found in the tree (`git grep`, untracked files included, the plan folder skipped) → `delete-still-referenced`; a `DELETE` + `CREATE` of the same thing is a move, not checked; a file-only `DELETE` + a `CREATE` of the same file name: the new file and paths to it are no reference; a failed grep → the gap says `references not checked`. `--group=N` audits that group's tasks only; a group that is missing or has no tasks → exit 2. Writes `build-tests-green-N-{VERIFY_ATTEMPT}.md` (`Enforced` / `Gaps` / `Unproven` header, `Test exceptions`, `Already landed`, `Updated tests` and `Unproven` sections); prints `alreadyLanded`, `updated`, `changed` and `unproven`; `changed` lists each plan-named test (every group) a code step's `changedTests` record changed, with its reason, never a gap, and the report gets a `Changed by a code step` section when it is non-empty. |
-| Judgement (Step 8) | `@bkit-build-plan-verify` | `not-green` → `Fixable: true`; `Already landed`, `Changed by a code step` and `Unproven` sections → noted, no gap; `Updated tests` → the entry's line diff since `base` read (additive = no line removed; the added lines are still read for one that disables an earlier expectation): it only adds expectations → no gap, else `test-loosened` → `Fixable: true` and the test named on the header's `Loosened` line, or `Fixable: false` when an earlier verify of the group already logged it for that test; `delete-still-referenced` → each hit read: a different thing with the same name → no gap, else `Fixable: true`; `no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused` → `Fixable: false`. Each gap logged `— Fixable: true` or `— Fixable: false`; header `Fixable: true` when any gap is. |
+| Judgement (Step 8) | `@bkit-build-plan-verify` | `not-green` → `Fixable: true`; `Already landed` and `Unproven` sections → noted, no gap; `Changed by a code step` → noted, no gap when its added lines only add setup or expectations, else `test-loosened` (`Fixable: true` and the test on the `Loosened` line, or `Fixable: false` for a test of an earlier group or one an earlier verify logged); `Updated tests` → the entry's line diff since `base` read (additive = no line removed; the added lines are still read for one that disables an earlier expectation): it only adds expectations → no gap, else `test-loosened` → `Fixable: true` and the test named on the header's `Loosened` line, or `Fixable: false` when an earlier verify of the group already logged it for that test; `delete-still-referenced` → each hit read: a different thing with the same name → no gap, else `Fixable: true`; `no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused` → `Fixable: false`. Each gap logged `— Fixable: true` or `— Fixable: false`; header `Fixable: true` when any gap is. |
 | Changed tests (Step 15) | orchestrator runs `bkit tests green` over the whole plan, log `build-tests-green-final.md` | `changed` non-empty → one § Decision Pause (`CHANGED_TESTS`), one `Accept` / `Stop` item per test. Asked once per run, before the Unproven pause. |
 | Unproven (Step 15) | orchestrator runs `bkit tests green` over the whole plan, log `build-tests-green-final.md` | `unproven` non-empty → one § Decision Pause (`UNPROVEN`), one `Accept` / `Stop` item per test; `Accept` writes a `TEST EXCEPTION`. Asked once per run. |
 
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index dd8f98f42..98b565954 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -2518,4 +2518,20 @@ describe("planned tests a code step changed", () => {
     expect(rule).toMatch(/No gap/);
     expect(rule).not.toMatch(/append ``?TASK/);
   });
+
+  it("the verify prompt reads a changed test's added lines for a skip, an early return or a reassignment", () => {
+    const lines = prompt("bkit-build-plan-verify").split("\n");
+    const at = lines.findIndex((l) => l.includes("`Changed by a code step` section"));
+    expect(at, "no `Changed by a code step` section rule").toBeGreaterThanOrEqual(0);
+    const rule = lines
+      .slice(at)
+      .join("\n")
+      .split(/\n {3}- `Updated tests`/)[0]!;
+    expect(rule).toMatch(/added lines?/);
+    expect(rule).toMatch(/\bdiff\b/);
+    expect(rule).toMatch(/early `?return/);
+    expect(rule).toMatch(/skip/);
+    expect(rule).toMatch(/reassign/);
+    expect(rule).toContain("test-loosened");
+  });
 });
diff --git a/.bkit/core/engine/commands/workflow/steps.test.ts b/.bkit/core/engine/commands/workflow/steps.test.ts
index 511dab915..8a21f9894 100644
--- a/.bkit/core/engine/commands/workflow/steps.test.ts
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -2450,7 +2450,7 @@ describe("bkit steps finish — the tests step touches only tests, the code step
     const r = await run(cwd, EXECUTE);
     expect(r.code).toBe(11);
     expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
-    expect(r.json.problem).toMatch(/BLOCKED line cannot remove or loosen/);
+    expect(r.json.problem).toMatch(/refuses a BLOCKED-named change that removes a line/);
     expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
   });
 
@@ -2462,7 +2462,7 @@ describe("bkit steps finish — the tests step touches only tests, the code step
     const r = await run(cwd, EXECUTE);
     expect(r.code).toBe(11);
     expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
-    expect(r.json.problem).toMatch(/BLOCKED line cannot remove or loosen/);
+    expect(r.json.problem).toMatch(/refuses a BLOCKED-named change that removes a line/);
     expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
   });
 
@@ -2483,6 +2483,119 @@ describe("bkit steps finish — the tests step touches only tests, the code step
     expect(read.stdout).toContain("expect(addRow()).toBe(1);");
   });
 
+  /** A plan whose group 1 and group 2 tasks both name tests in `TEST.file`. */
+  const SHARED_FILE_PLAN = TWO_GROUP_PLAN.replace(
+    "`src/c.test.ts` `does other`",
+    `\`${TEST.file}\` \`counts rows\``,
+  );
+  const PARAM_V1 = "it.each([1])('row %i', (n) => {\n  expect(addRow()).toBe(n);\n});\n";
+  const PARAM_V2 = `${PARAM_V1}\nit('counts rows', () => {\n  expect(count()).toBe(0);\n});\n`;
+
+  /** Group 1's test is parameterised (its name is in no line, so no block), and group 2's red row appended a test to the file. */
+  function laterTestsStepAppended() {
+    const cwd = planned();
+    write(cwd, "plan.md", SHARED_FILE_PLAN);
+    write(cwd, TEST.file, PARAM_V1);
+    git(cwd, "add", "-A");
+    git(cwd, "commit", "-qm", "group 1 tests");
+    redRow(cwd, {
+      tests: [
+        {
+          task: 1,
+          test: TEST.file,
+          testName: TEST.name,
+          state: "red",
+          blob: blobOf(cwd, TEST.file),
+          block: null,
+        },
+      ],
+    });
+    write(cwd, TEST.file, PARAM_V2);
+    git(cwd, "commit", "-qam", "group 2 tests");
+    redRow(cwd, {
+      group: 2,
+      attempt: 1,
+      tests: [
+        {
+          task: 2,
+          test: TEST.file,
+          testName: "counts rows",
+          state: "red",
+          blob: blobOf(cwd, TEST.file),
+          block: blockHash(PARAM_V2, "counts rows"),
+        },
+      ],
+    });
+    write(cwd, "src/c.ts", "export const other = 1;\n");
+    return cwd;
+  }
+
+  it("passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block", async () => {
+    const cwd = laterTestsStepAppended();
+    const r = await run(cwd, inGroup2(EXECUTE));
+    expect(r.code).toBe(0);
+    expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).toContain("src/c.ts");
+  });
+
+  it("still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11", async () => {
+    const cwd = laterTestsStepAppended();
+    write(cwd, TEST.file, PARAM_V2.replace("toBe(n)", "toBeDefined()"));
+    const head = git(cwd, "rev-parse", "HEAD");
+    const r = await run(cwd, inGroup2(EXECUTE));
+    expect(r.code).toBe(11);
+    expect(r.json.touched).toEqual([TEST.file]);
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
+  });
+
+  it("a changedTests record on a non-code-step row does not move the lock's baseline", async () => {
+    const { cwd, body } = twoTests();
+    const weakened = body("1", "0").replace("    expect(addRow()).toBe(1);\n", "");
+    fs.appendFileSync(
+      path.join(cwd, STATUS),
+      `${JSON.stringify({
+        type: "step-done",
+        workflow: "build",
+        step: "build-plan-verify",
+        status: "DONE",
+        at: "2026-11-01T06:00:00Z",
+        parentSha: git(cwd, "rev-parse", "HEAD"),
+        group: 1,
+        attempt: 1,
+        artifacts: ["logs/verify-1.md"],
+        changedTests: [
+          { task: 1, test: TEST.file, testName: TEST.name, block: blockHash(weakened, TEST.name) },
+        ],
+      })}\n`,
+    );
+    write(cwd, TEST.file, weakened);
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(11);
+    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
+  });
+
+  it("refuses a --field changedTests on a step finish", async () => {
+    const cwd = planned();
+    redRow(cwd);
+    write(cwd, "src/a.ts", "export const addRow = () => 1;\n");
+    const r = await run(cwd, [
+      ...EXECUTE,
+      `--field=changedTests=[{"task":1,"test":"${TEST.file}","testName":"${TEST.name}","reason":"x"}]`,
+    ]);
+    expect(r.code).toBe(2);
+    expect(r.err).toContain("changedTests");
+    expect(stepRows(cwd, "build-plan-tasks")).toEqual([]);
+  });
+
+  it("the exit 11 refusal says verify reads a BLOCKED change's added lines", async () => {
+    const { cwd, body } = twoTests();
+    write(cwd, TEST.file, body("1", "0").replace("    expect(addRow()).toBe(1);\n", ""));
+    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "the check is wrong"));
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(11);
+    expect(r.json.problem).toMatch(/verify reads[^.]*added lines?/);
+    expect(r.json.problem).not.toMatch(/cannot remove or loosen/);
+  });
+
   it("exit codes list 11 as planned tests touched and 15 as source touched in the tests step", () => {
     const codes = stepsCommand.verbs.finish!.exitCodes as Record<number, string>;
     expect(codes[11]).toMatch(/planned test/);
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index 0f40368a8..c7d9b466d 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -645,6 +645,16 @@ function restoreIndex(snap: IndexSnapshot): string | null {
   return null;
 }
 
+/** The `--field` extras; `changedTests` is written by the planned-test lock alone. */
+function fieldExtras(specs: string[]): Record<string, unknown> {
+  if (specs.some((x) => x.startsWith("changedTests=")))
+    throw new CommandError(
+      EXIT.USAGE,
+      "--field cannot set changedTests; only the planned-test lock in `steps finish` writes it",
+    );
+  return Object.fromEntries(specs.map(extraField));
+}
+
 /**
  * Append one `step-done` row, then commit (parentSha first, the row, then the
  * commit — the order the fold's de-dup relies on). Returns the row and the new
@@ -1107,7 +1117,7 @@ async function finish(ctx: RunContext): Promise<number> {
   } else {
     attempt = nonNegativeInt(f.attempt, "attempt");
   }
-  const extras: Record<string, unknown> = Object.fromEntries(list(f.field).map(extraField));
+  const extras: Record<string, unknown> = fieldExtras(list(f.field));
   for (const spec of list(f.countField)) {
     const eq = spec.indexOf("=");
     if (eq <= 0)
@@ -1374,7 +1384,7 @@ async function finish(ctx: RunContext): Promise<number> {
         const w = why[i]!;
         if (w.removed)
           notes.push(
-            `${nameOf(t)}: a BLOCKED line cannot remove or loosen a planned test's lines — it lets through only a change that adds lines`,
+            `${nameOf(t)}: the engine refuses a BLOCKED-named change that removes a line of a planned test; it lets through only a change that adds lines, and verify reads every added line`,
           );
         if (w.reused !== null)
           notes.push(
@@ -1952,7 +1962,7 @@ export const stepsCommand: CommandSpec = {
             group,
             strategy,
             artifacts,
-            extras: Object.fromEntries(list(f.field).map(extraField)),
+            extras: fieldExtras(list(f.field)),
             parentSha: str(f.parentSha),
             commit: commit as "auto" | "none",
             message: str(f.message),
diff --git a/.bkit/core/engine/commands/workflow/tests.test.ts b/.bkit/core/engine/commands/workflow/tests.test.ts
index e1103bbf1..35c52d2c1 100644
--- a/.bkit/core/engine/commands/workflow/tests.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -3176,6 +3176,42 @@ describe("bkit tests red / green", () => {
       expect(report()).not.toContain("stale reason");
     });
 
+    it("green lists a changed test when test-first is not enforced", async () => {
+      checkout(scripts({ test: "x" }));
+      baseCommit();
+      fs.mkdirSync(path.join(cwd, "src"));
+      fs.mkdirSync(path.join(cwd, "logs"));
+      writePlan([TASK_1]);
+      fs.writeFileSync(path.join(cwd, TEST), withSetup(5));
+      codeStepRow([{ test: TEST, testName: NAME, reason: "new setup line" }]);
+      const r = await green();
+      expect(r.json).toMatchObject({ enforced: false });
+      expect(r.json.changed).toEqual([
+        expect.objectContaining({ task: 1, test: TEST, name: NAME, reason: "new setup line" }),
+      ]);
+      expect(report()).toContain("## Changed by a code step");
+      expect(report()).toContain("new setup line");
+    });
+
+    it("green gives a changed test whose red recorded its file missing every line of the test as added", async () => {
+      fs.rmSync(path.join(cwd, TEST));
+      vi.stubEnv("FAKE_EXIT", "1");
+      vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
+      const missing = await red();
+      expect(missing.json.tests[0]).toMatchObject({ state: "missing", blob: null });
+      // The code agent writes the test whole.
+      fs.writeFileSync(path.join(cwd, TEST), body(5));
+      codeStepRow([{ test: TEST, testName: NAME, reason: "wrote the test file" }]);
+      vi.stubEnv("FAKE_EXIT", "0");
+      vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
+      const r = await green();
+      expect(r.json.changed).toEqual([
+        expect.objectContaining({ test: TEST, name: NAME, additive: true }),
+      ]);
+      expect(r.json.changed[0].diff).not.toBeNull();
+      expect(r.json.changed[0].diff).toContain("+  expect(clamp(5, 1, 10)).toBe(5);");
+    });
+
     it("green prints an empty changed list and no Changed by a code step section when no code step changed a test", async () => {
       await provenRed();
       vi.stubEnv("FAKE_EXIT", "0");
diff --git a/.bkit/core/engine/commands/workflow/tests.ts b/.bkit/core/engine/commands/workflow/tests.ts
index 2edefb59a..358ff8710 100644
--- a/.bkit/core/engine/commands/workflow/tests.ts
+++ b/.bkit/core/engine/commands/workflow/tests.ts
@@ -351,10 +351,13 @@ export function lockBaselines(
   planned: Set<string> | null,
 ): Map<string, LockBaseline> {
   const out = new Map<string, LockBaseline>();
+  /** The newest blob any red recorded per test file (a later tests step's additions included). */
+  const newestBlob = new Map<string, string>();
   for (const row of rows) {
     if (row.type !== "step-done") continue;
     if (row.step === RED_STEP && typeof row.group === "number") {
       for (const t of redTestsOf(row)) {
+        if (t.blob !== null) newestBlob.set(t.test, t.blob);
         const key = redKey(t.task, t.test, t.testName);
         if (planned !== null && !planned.has(key)) continue;
         const earlier = out.get(key);
@@ -374,10 +377,11 @@ export function lockBaselines(
           });
       }
     }
-    if (Array.isArray(row.changedTests)) {
+    if (CODE_STEPS.has(String(row.step)) && Array.isArray(row.changedTests)) {
       for (const c of row.changedTests as Array<Record<string, unknown>>) {
         if (typeof c.task !== "number" || typeof c.test !== "string") continue;
         if (typeof c.testName !== "string") continue;
+        if (typeof c.reason !== "string" || c.reason === "") continue;
         const key = redKey(c.task, c.test, c.testName);
         if (planned !== null && !planned.has(key)) continue;
         const earlier = out.get(key);
@@ -399,9 +403,24 @@ export function lockBaselines(
       }
     }
   }
+  // A test no line names (block null) is locked by its whole file, against the file's newest red blob.
+  for (const b of out.values()) {
+    const blob = newestBlob.get(b.test);
+    if (b.fromChange || b.block !== null || blob === undefined || b.blob === null) continue;
+    b.blob = blob;
+    b.text = blob;
+    b.origin = blob;
+  }
   return out;
 }
 
+/** The code steps whose `changedTests` records move the lock's baseline. */
+const CODE_STEPS = new Set([
+  "build-plan-tasks",
+  "build-plan-gaps-remediate",
+  "build-plan-gaps-remediate-holistic",
+]);
+
 /** The status rows of one workflow. */
 export const workflowRows = (file: string, workflow: string) =>
   fs.existsSync(file)
@@ -483,7 +502,8 @@ export function baselineDiff(
   test: string,
   name: string,
 ): { additive: boolean; diff: string } | null {
-  const was = testBlock(blobText(top, blob), name);
+  // A null blob is a red that recorded the file `missing`: every line of the test is added.
+  const was = blob === null ? "" : testBlock(blobText(top, blob), name);
   const abs = path.join(top, test);
   const now = fs.existsSync(abs) ? testBlock(fs.readFileSync(abs, "utf-8"), name) : null;
   if (was === null || now === null) return null;
@@ -595,7 +615,7 @@ export function lineDiff(
   before: string,
   after: string,
 ): { text: string; removed: number; added: number } {
-  const a = before.split("\n");
+  const a = before === "" ? [] : before.split("\n");
   const b = after.split("\n");
   const lcs: number[][] = Array.from({ length: a.length + 1 }, () =>
     new Array<number>(b.length + 1).fill(0),
@@ -2456,6 +2476,20 @@ export const testsCommand: CommandSpec = {
           (resolveGate(top, [BKIT_TEST_FILE_SCRIPT]) === null
             ? `\`${BKIT_TEST_FILE_SCRIPT}\` is not declared in package.json`
             : undefined);
+        const changed: Changed[] = [
+          ...lockBaselines(workflowRows(statusFile(ctx), workflow), plannedKeys(planText)).values(),
+        ]
+          .filter((b) => b.fromChange && b.reasons.length > 0)
+          .map((b) => ({
+            task: b.task,
+            test: b.test,
+            name: b.testName,
+            reason: b.reasons.join("; "),
+            ...(() => {
+              const d = baselineDiff(top, b.origin, b.test, b.testName);
+              return { diff: d?.diff ?? null, additive: d?.additive ?? null };
+            })(),
+          }));
         const empty = {
           verdict: null,
           rows: [],
@@ -2464,7 +2498,7 @@ export const testsCommand: CommandSpec = {
           landed: [],
           unproven: [],
           updated: [],
-          changed: [],
+          changed,
           outputs: [],
         };
         if (reason !== undefined) {
@@ -2478,7 +2512,7 @@ export const testsCommand: CommandSpec = {
             alreadyLanded: [],
             unproven: [],
             updated: [],
-            changed: [],
+            changed,
             log: logArg,
           });
           ctx.log(`test-first not enforced: ${reason}`);
@@ -2493,20 +2527,6 @@ export const testsCommand: CommandSpec = {
         const statusRel = repoRel(top, ctx.cwd, statusFile(ctx));
         const exceptions: ExceptionResult[] = [];
         const gaps: Gap[] = [];
-        const changed: Changed[] = [
-          ...lockBaselines(workflowRows(statusFile(ctx), workflow), plannedKeys(planText)).values(),
-        ]
-          .filter((b) => b.fromChange && b.reasons.length > 0)
-          .map((b) => ({
-            task: b.task,
-            test: b.test,
-            name: b.testName,
-            reason: b.reasons.join("; "),
-            ...(() => {
-              const d = baselineDiff(top, b.origin, b.test, b.testName);
-              return { diff: d?.diff ?? null, additive: d?.additive ?? null };
-            })(),
-          }));
         const rows: AuditRow[] = [];
         const outputs: Array<{ test: string; tail: string }> = [];
         const greens = new Map<string, { cases: JunitCase[] | null; tail: string }>();
diff --git a/.bkit/core/prompts/bkit-build-plan-tests.md b/.bkit/core/prompts/bkit-build-plan-tests.md
index 1728a535a..dbec29dc8 100644
--- a/.bkit/core/prompts/bkit-build-plan-tests.md
+++ b/.bkit/core/prompts/bkit-build-plan-tests.md
@@ -76,8 +76,9 @@ autoCompactWindow: 300000
    - **If** the log already holds `WROTE` or `PASSES` for a test → skip that test.
 5. **If** a red report is supplied → it names the tests whose red the engine could not prove, each with the state it found (`vacuous`, `missing`, `no-report`, `lint`). Rewrite only those tests, as the state says: a `vacuous` test passed with nothing to test, so make it reach the planned behaviour; a `missing` or `no-report` test is not at the file and name the entry gives; a `lint` test fails `bkit:lint:file`.
    - **If** the caller asks you to restore tests instead of supplying a brief (verify logged each one `test-loosened`) → for each test named:
-     - Read its `Updated tests` entry in the supplied green report. The entry's diff shows the test's own lines at `base` against the lines now.
-     - Put back every expectation the update removed or loosened, as it stood at `base` (`git show {base}:{file}`).
+     - Read its `Updated tests` or `Changed by a code step` entry in the supplied green report. The entry's diff shows the test's own lines at its baseline against the lines now.
+     - **If** the entry is an `Updated tests` one → put back every expectation the update removed or loosened, as it stood at `base` (`git show {base}:{file}`).
+     - **Else** (a `Changed by a code step` entry) → remove each added line that disables or loosens the test, so the restored test holds every baseline line of the entry's diff plus only the added lines that do not disable or loosen it.
      - Keep the expectations the update added.
      - Lint the file and run it, as for a test you write.
      - Append ``WROTE — TASK {N}: `{file}` `{name}` `` with Bash `echo >>`.
diff --git a/.bkit/core/prompts/bkit-build-plan-verify.md b/.bkit/core/prompts/bkit-build-plan-verify.md
index 079f11c88..dc46758d7 100644
--- a/.bkit/core/prompts/bkit-build-plan-verify.md
+++ b/.bkit/core/prompts/bkit-build-plan-verify.md
@@ -93,8 +93,11 @@ autoCompactWindow: 300000
      - **If** the hit is a different thing with the same name → no gap.
      - **Else** → `Fixable: true`.
    - `Unproven` section → list each test in `Notes`. No gap: the engine could not prove that test red before its code existed, and the owner answers it once, at the end of the build.
-   - `Changed by a code step` section → list each test and its reason in `Notes`.
-     No gap: a code step kept the change under a `BLOCKED` line, and the owner answers it once, at the end of the build.
+   - `Changed by a code step` section → list each test and its reason in `Notes`; its entry carries the engine's line diff since its baseline, and you read the added lines of that diff the way the `Updated tests` rule reads an update.
+     - **If** the added lines only add setup or expectations → No gap, because the owner answers the change once, at the end of the build.
+     - **Else** → an added line disables or loosens the test (an early `return`, a skip, a comment pair around assertions, `expect.assertions(0)`, a reassignment of the value under test):
+       - **If** a supplied earlier verify report of the group already logged `test-loosened` for that test, **or** the test belongs to a task of an earlier group (the tests step cannot record a restore of it in this group) → append ``TASK {N}: `{file}` `{name}` — test-loosened: {what} — Fixable: false``, so the owner decides.
+       - **Else** → raise a `test-loosened` gap: ``TASK {N}: `{file}` `{name}` — test-loosened: {what} — Fixable: true``, and name the test on the header's `Loosened` line, which sends it back to the tests step to restore.
    - `Updated tests` section → each test is an existing test the tests step changed. Its entry carries the engine's line diff of the test's own lines since `base`, and says whether the change is additive (no line removed). Read that diff, and the supplied group diff when the entry says the lines could not be read:
      - **If** the update only adds expectations → no gap. An additive change is one unless an added line disables or overrides an earlier expectation (a skip, an early return, a reassignment).
      - **Else** → the update removes or loosens an expectation. The tests step restores it and keeps the additions, because no code step may rewrite a planned test:
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index baaaf59eb..27f9d73a4 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -11106,8 +11106,9 @@ Its `Derived Test Matrix rows` say what each test asserts.
 **If** the log already holds `WROTE` or `PASSES` for a test → skip that test.
 **If** a red report is supplied → it names the tests whose red the engine could not prove, each with the state it found (`vacuous`, `missing`, `no-report`, `lint`). Rewrite only those tests, as the state says: a `vacuous` test passed with nothing to test, so make it reach the planned behaviour; a `missing` or `no-report` test is not at the file and name the entry gives; a `lint` test fails `bkit:lint:file`.
 **If** the caller asks you to restore tests instead of supplying a brief (verify logged each one `test-loosened`) → for each test named:
-Read its `Updated tests` entry in the supplied green report. The entry's diff shows the test's own lines at `base` against the lines now.
-Put back every expectation the update removed or loosened, as it stood at `base` (`git show {base}:{file}`).
+Read its `Updated tests` or `Changed by a code step` entry in the supplied green report. The entry's diff shows the test's own lines at its baseline against the lines now.
+**If** the entry is an `Updated tests` one → put back every expectation the update removed or loosened, as it stood at `base` (`git show {base}:{file}`).
+**Else** (a `Changed by a code step` entry) → remove each added line that disables or loosens the test, so the restored test holds every baseline line of the entry's diff plus only the added lines that do not disable or loosen it.
 Keep the expectations the update added.
 Lint the file and run it, as for a test you write.
 Append ``WROTE — TASK {N}: `{file}` `{name}` `` with Bash `echo >>`.
@@ -11190,7 +11191,11 @@ Set `Verdict` from the `Fixable` values you decided, never from the report's `nu
 Put `Tasks` and `Loosened` in `judgments`, because the engine never derives them and the workflow reads them from the header.
 Put the `## Identified Gaps Log` section, with one `TASK {N}` line per gap, in `body`, because the remediate step reads it from the report.
 The engine never overrides a `Verdict` that depends on evidence: `CONCERNS` and the `Loosened` decision stay yours.
-`Changed by a code step` section → list each test and its reason in `Notes`.
+`Changed by a code step` section → list each test and its reason in `Notes`; its entry carries the engine's line diff since its baseline, and you read the added lines of that diff the way the `Updated tests` rule reads an update.
+**If** the added lines only add setup or expectations → No gap, because the owner answers the change once, at the end of the build.
+**Else** → an added line disables or loosens the test (an early `return`, a skip, a comment pair around assertions, `expect.assertions(0)`, a reassignment of the value under test):
+**If** a supplied earlier verify report of the group already logged `test-loosened` for that test, **or** the test belongs to a task of an earlier group (the tests step cannot record a restore of it in this group) → append ``TASK {N}: `{file}` `{name}` — test-loosened: {what} — Fixable: false``, so the owner decides.
+**Else** → raise a `test-loosened` gap: ``TASK {N}: `{file}` `{name}` — test-loosened: {what} — Fixable: true``, and name the test on the header's `Loosened` line, which sends it back to the tests step to restore.
 ```
 
 #### bkit-debug-abort-handover
diff --git a/.bkit/prompts.md b/.bkit/prompts.md
index d154fd85d..bc8ad8018 100644
--- a/.bkit/prompts.md
+++ b/.bkit/prompts.md
@@ -334,7 +334,7 @@ Cursor Cloud automation uses `composer-2.5` for metadata / API plumbing, and the
 | `bkit-build-install-skills` | Identify and install relevant skills via `npx skills find`/`add`: quality-hurdle the source (official publisher, or 1000+ installs / 100+ stars), install one named skill per gap, report provenance. |
 | `bkit-build-plan-tests` | Write one task group's planned tests — every `TEST FIRST` test of the task blocks in the brief `bkit context brief --group --tests-only --file` writes, which leaves out the tests the group's red rows already proved. Each test fails on the behaviour its `fails on` text names, is lint-clean, and never names a test the task's `TEST EXCEPTION` names; a stub only where a test cannot load without one; no source code (`steps finish --step=build-plan-tests --plan` refuses a diff touching any other file, exit 15). Flat log `build-plan-tests-{GROUP}-log.md`: ``WROTE — TASK {N}: `{file}` `{name}` ``, ``PASSES — TASK {N}: `{file}` `{name}`: {reason}`` (the behaviour already exists; `bkit tests red` records the test `passed-accepted`), ``BLOCKED — TASK {N}: `{file}` `{name}` — {reason}``, `SOURCE — TASK {N}: {value} from {file}:{line}` (where a value the test checks or fakes comes from). Verdict PASS / HANDOVER / FAIL: `HANDOVER` = turn cap near with tests left; the workflow re-runs the tests half once with a fresh brief. Re-invoked with a red report → rewrites only the tests it lists as `vacuous`, `missing`, `no-report` or `lint`. Never runs `bkit tests red` itself; the orchestrator runs it once per group after the step. |
 | `bkit-build-plan-tasks` | Execute one task group — the task blocks in the brief `bkit context brief --next` writes; earlier tasks in the brief are context only; the brief's `Deviations` section, when present, is the owner's run instruction, applied to the tasks it names. An existing log is kept and its `Verdict` reset to `PENDING`. Verdict PASS / HANDOVER / FAIL: `HANDOVER` = turn cap near with tasks neither `DONE` nor `BLOCKED` → stop after the current task's log line; the workflow re-runs the group once with a fresh brief, not as a failed attempt. The group's `TEST FIRST` tests are already on disk, written by `bkit-build-plan-tests` and recorded red by the engine before this step: makes them pass and never edits, renames, moves or deletes a planned test or a `TEST EXCEPTION` field (`steps finish` refuses the step when a planned test case differs from its baseline, exit 11), except that a correct code change forcing a planned-test edit is kept and logged ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` plus the task's `DONE` line, which the owner answers at the end of the build; a test recorded `passed-accepted` → `DONE — TASK {N}: already landed` when `DONE WHEN` already holds with no task code written; never undoes code to force a red (`.bkit/workflows.md` § Test-first). Honours the brief's `Reuse Inventory` rows and `Architecture` entries at the only point the decision can still be quietly discarded — `EXTEND` row modifies named artifact, never a parallel file; rows or entries the brief left out (8 KB work cap) → reads the plan section it names; reusable artifact found mid-build folds in, never forks; reads each task's `DONE WHEN` field as the completion criterion to satisfy; modify source; write stub artifact first then incremental `Task Log` entries — one `DONE — TASK {N}:` or `BLOCKED — TASK {N}:` line per task at line start, which the next brief reads to skip finished tasks. Reads `build-plan-current.md` when present: findings are fact, plan is intent — `Reword` tasks build at the paths the report names as current, `Broken` tasks whose work already landed log `DONE — TASK {N}: already landed`, the rest build the intent against current code. Never edits the plan file; tasks absent from the findings follow plan wording verbatim. Does not tick plan checkboxes (verify owns that). Does not write `docs/deferrals.jsonl` — a blocked task is a `BLOCKED` log line for verify to catch, not a deferral. |
-| `bkit-build-plan-verify` | Verify implementation vs plan; writes Plan Verification log. `Group` mode judges one group's briefs against the group diff (changes since the group's start commit); `Holistic` mode runs after the last group, and again after later groups, across every group, plus integration; it logs each integration gap and each failing test as an `INTEGRATION:` gap line ending `— Fixable: true`, or `— Fixable: false` only when closing it needs a choice the plan does not make. Ticks are the engine's: the header's `Tasks` line names the task numbers the codebase satisfies and `bkit tasks tick --green=` writes the `[x]`; the prompt edits no plan and never ticks a box. `bkit tests green` prints `verdict` and a `fixable` per gap, so the prompt holds no kind→`Fixable` table and no verdict mapping. Its reads decide only a `null` gap: `delete-still-referenced` → each hit read, a different thing with the same name → no gap, else `Fixable: true`; each `Updated tests` entry → the test's diff since its `base` read: only added expectations → no gap, a removed or loosened expectation → a `Fixable: false` gap; `Unproven` tests and `Changed by a code step` entries → `Notes`, no gap, because the owner answers them once at the build's end. Each gap is appended as the report's `logLine` with the decided `Fixable` in place of `null`; every other gap keeps its printed `fixable`; header `Failures` = unresolved gap count and `Fixable` = `true` when any is (build → fixable-only remediate, then Decision Pause); a test a task's `TEST EXCEPTION` field names is no gap; `Already landed` tests → `Notes` — a `BLOCKED` log line or a deferral row never discharges a task, so unfinished work routes to `@bkit-build-plan-gaps-remediate` in-loop instead of surfacing at ship. Missing `DONE WHEN` on any task → FAIL (template structure broken; remediation cannot recover). |
+| `bkit-build-plan-verify` | Verify implementation vs plan; writes Plan Verification log. `Group` mode judges one group's briefs against the group diff (changes since the group's start commit); `Holistic` mode runs after the last group, and again after later groups, across every group, plus integration; it logs each integration gap and each failing test as an `INTEGRATION:` gap line ending `— Fixable: true`, or `— Fixable: false` only when closing it needs a choice the plan does not make. Ticks are the engine's: the header's `Tasks` line names the task numbers the codebase satisfies and `bkit tasks tick --green=` writes the `[x]`; the prompt edits no plan and never ticks a box. `bkit tests green` prints `verdict` and a `fixable` per gap, so the prompt holds no kind→`Fixable` table and no verdict mapping. Its reads decide only a `null` gap: `delete-still-referenced` → each hit read, a different thing with the same name → no gap, else `Fixable: true`; each `Updated tests` entry → the test's diff since its `base` read: only added expectations → no gap, a removed or loosened expectation → a `Fixable: false` gap; `Unproven` tests → `Notes`, no gap, because the owner answers them once at the build's end; `Changed by a code step` entries → `Notes`, no gap when the added lines only add setup or expectations, else a `test-loosened` gap (`Fixable: false` for a test of an earlier group or one an earlier verify logged). Each gap is appended as the report's `logLine` with the decided `Fixable` in place of `null`; every other gap keeps its printed `fixable`; header `Failures` = unresolved gap count and `Fixable` = `true` when any is (build → fixable-only remediate, then Decision Pause); a test a task's `TEST EXCEPTION` field names is no gap; `Already landed` tests → `Notes` — a `BLOCKED` log line or a deferral row never discharges a task, so unfinished work routes to `@bkit-build-plan-gaps-remediate` in-loop instead of surfacing at ship. Missing `DONE WHEN` on any task → FAIL (template structure broken; remediation cannot recover). |
 | `bkit-build-plan-gaps-remediate` | Fix specific gaps from the group's latest verify log + group gate log failures, or, with Context `Mode: Holistic`, the holistic verify report's gap lines (reading the plan task blocks they name; no group gate) (the tests of the groups so far); a Context `Group gate` command is re-run after each fix until exit 0 — each newly exposed failure is a gap of the same round, other tests built on the same failing assumption are swept first — and logged `DONE — Group gate: exit 0`, which `PASS` needs; reads the group's briefs for its task blocks; Standard / Pivot / Final escalation. Context `Scope: fixable only` → `— Fixable: false` gaps out of scope. Header `Fixed` = `DONE — Gap` lines this attempt (0 → build Decision Pause). A supplied decision record → the owner's `Decision:` words steer the round. No strategy records a red by undoing or swapping out code, or rewrites a planned test case (`steps finish` exit 11 names the case); other tests in the same file are its to change, and a planned-test edit its code change forces is kept and logged ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` plus the gap's `DONE` line; never touches a `TEST EXCEPTION` field (`.bkit/workflows.md` § Test-first). |
 | `bkit-build-challenge-1` | Adversarial review of `git diff origin/dev...HEAD` — bug-hunting lens; effort slot 1 (`high`). Parallel with `-2`. Writes each finding as one task block — `Severity`, `Class` (`mechanical\|architectural`), `Fixable`, `Location`, `DONE WHEN`, `TEST FIRST` within the per-task `bkit.workflows.tasks` caps the workflow passes in Context — that `bkit challenge merge` appends to the plan as a new last group. Reads each `TEST FIRST` test's logic against the code the diff leaves: it must fail there, or `tests red` refuses it as `passed` and the fix task blocks; a finding an existing plan task or test already covers gets no block. Never references sibling output (circular reasoning guard). |
 | `bkit-build-challenge-2` | Same as `-1` — security lens; effort slot 2 (`high` on Claude / opus — depth-sensitive; Grok on Cursor — first-party depth, same native pool as `-1`). |
diff --git a/.bkit/version b/.bkit/version
index 34879906c..47fabb844 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -24,7 +24,7 @@
     ".claude/agents/bkit-build-challenge-2.md": "0ef8a829af9b89602a75ac257a093e4a47169ca9c2a4c216d6f11937e2e9c48f",
     ".claude/agents/bkit-build-install-skills.md": "0249b5fe6550c45afe95972d1d3f4a65f7e159a74038ce9179ca1fceb29e1d12",
     ".claude/agents/bkit-build-plan-gaps-remediate.md": "62f9aa0a792e7adb01a83b29ea51e6ea4d2e1530923ddc2f0fa98ce4c8b1ca03",
-    ".claude/agents/bkit-build-plan-verify.md": "4579dc2cf9db1efb0a3e3361efc2ac60b3889f3914f4e699b46d97a9c5c9e7ef",
+    ".claude/agents/bkit-build-plan-verify.md": "4a29cdfea02f21e3640346930498f24942e396947ba36bd69a7ef1b7a6df721f",
     ".claude/agents/bkit-debug-abort-handover.md": "4d2ed067a5933578768325379269f51357365d7740986a2de580f022bace0a26",
     ".claude/agents/bkit-debug-failure-diagnose.md": "9169cb6210ffbe5a0d6237e81da9f7299067a0db2bdff6a35af6961ce608caa9",
     ".claude/agents/bkit-debug-failure-remediate.md": "0711217d55056389f25a82431d04bbb587c3124da45d5ea0f1d6f6bcbead04f5",
@@ -56,7 +56,7 @@
     ".cursor/agents/bkit-build-challenge-2.md": "6399d8b34ff1be2a63b77b911fd8321f80bd0bf64550103f809cdf5194820c24",
     ".cursor/agents/bkit-build-install-skills.md": "9f77d5ce2bc7e5d1c60d8860b5a06d81091f9194522607151a76838fc895da6d",
     ".cursor/agents/bkit-build-plan-gaps-remediate.md": "4067031d8aa4cc868b2401b95d4c2421ecf005ae0df29da400decc25c4254bae",
-    ".cursor/agents/bkit-build-plan-verify.md": "a86d722b0c7fb0a099637000572be9212a0351f5ccb15653ff8317da1c2db92b",
+    ".cursor/agents/bkit-build-plan-verify.md": "cd7161226d981bc60ab23ee958af3b2fd075b22221c77dca32f0b8111f63d02b",
     ".cursor/agents/bkit-debug-abort-handover.md": "dbe3697156bb2068701efe79242d9e7d3554206fa266e26772bc74537c946ea9",
     ".cursor/agents/bkit-debug-failure-diagnose.md": "83da231f51d4526c7a6235475b2c40c872dc58e973e9ac30b5c9e85c98377229",
     ".cursor/agents/bkit-debug-failure-remediate.md": "597d997785131366a3bd240ffa29b82dce9be80f7bad283dd59a480e7ea9f2d4",
@@ -82,7 +82,7 @@
     ".opencode/agents/bkit-build-challenge-2.md": "9c8bdb5092b44f070468b82d88d9457ab58193d7f5697300877fc96779400e9d",
     ".opencode/agents/bkit-build-install-skills.md": "56687e9967e11c8e3ddc0c965a4818898d2ad61cc279af30ea862390eb245b8d",
     ".opencode/agents/bkit-build-plan-gaps-remediate.md": "b348e0cb7ebf3e9457dca5e071127e34068a3fec67c8a4cae4bd6486a9f571b0",
-    ".opencode/agents/bkit-build-plan-verify.md": "c3c02f1af17b77b324f767d903b5632cc3608bd3376c88d772d5834dc4b6105c",
+    ".opencode/agents/bkit-build-plan-verify.md": "39034b2e40d84d596d11bb9174ba42299e6dd1e09965eec6c75901400fb7852f",
     ".opencode/agents/bkit-debug-abort-handover.md": "924dddce677e294ff9391e38e9d563b16ce14ca527db0167386dfb0898ea44a9",
     ".opencode/agents/bkit-debug-failure-diagnose.md": "341bbb7bc59750b9fd5979eb1fc715bf8a289c6b3ed86a61a976e4d6d770977f",
     ".opencode/agents/bkit-debug-failure-remediate.md": "6f7707a6a7266249350315ed6e505fa8522d1bac8ad56af1f28919c2287b48c9",
@@ -122,7 +122,7 @@
     ".codex/agents/bkit-build-install-skills.toml": "ed158a6f987f24f5b0f83919e610cd7574605d2f794ffcd748eec6b12e314a76",
     ".codex/agents/bkit-build-plan-current.toml": "339cd3e95a5a7e23caf8c21de8b04866a96d47cd494c4e2f6766aeb202c355b2",
     ".codex/agents/bkit-build-plan-gaps-remediate.toml": "7559cc695ce2816a2a87402ad2e996f688004208642e1273a0ab63c394bbdb4e",
-    ".codex/agents/bkit-build-plan-verify.toml": "a304ce20d5c46377a5c65d98cff754222678ff39e124de4f8f37350caeb41edd",
+    ".codex/agents/bkit-build-plan-verify.toml": "e80c41b3c35c48d59a2c0fbdaba5d60ff6c5fc7507599e26dbfc46db8b0f9447",
     ".codex/agents/bkit-debug-abort-handover.toml": "1683aa233cc3b353fc32f5e73699961b326fa9466133b1ced2d674c95fd0bd7f",
     ".codex/agents/bkit-debug-failure-diagnose.toml": "4542279af7a5585e4bd711a0bae836f398a644b0cac09519aed8251a78249a36",
     ".codex/agents/bkit-debug-failure-remediate.toml": "c3230461bfbe5c85732462654780f2cbf4df8ea3cf4ff53a08307f9becfdc06d",
@@ -255,10 +255,10 @@
     ".opencode/plugin/bkit-rules.js": "417d3ca107ebf005060953a17340620e1fcfb5bcdf491316a937e0c747b0377e",
     ".bkit/router.md": "c20d006757e350c173da94686d48500bc83e12d9f7bb6ff5911e47e332e45eab",
     ".bkit/cli.md": "e59f3556ac626da5132771a6e3e31fa8085d3b27041f3d26ec6ee6150859b60e",
-    ".claude/agents/bkit-build-plan-tests.md": "048eedc214f02c1c72cdf460bf1aecea0b38836420181796cb8112e9b8eb74da",
-    ".cursor/agents/bkit-build-plan-tests.md": "d8090b4065d6ba337ea522926c254a5f4a11681d7afaa47090056b71952e4dc7",
-    ".opencode/agents/bkit-build-plan-tests.md": "92d4a922d62cf7d913dedf18bc3910f9333fbba3b93ba23ea341e6971b1aa6b6",
-    ".codex/agents/bkit-build-plan-tests.toml": "d97cd961547fd7bc48b24777626093fd8f7261310a1491c04a801116078641f1",
+    ".claude/agents/bkit-build-plan-tests.md": "3880f1b0d2f7640bf1c26f8a3dba881f8650b43bcba1d95ae358851bafb2e68f",
+    ".cursor/agents/bkit-build-plan-tests.md": "ea95df5686755c951aef648f2909e6289415c25a6d3f82d26db4749e021b7f4d",
+    ".opencode/agents/bkit-build-plan-tests.md": "6ae66abad3efb6778d36684b58742e8d7314bd7b0211336e648fed5de9d85759",
+    ".codex/agents/bkit-build-plan-tests.toml": "61c7e46851d0c7fc950cb8d70cb76500261ac1d90f4058e74126dd5f096237fa",
     ".claude/agents/bkit-build-plan-tasks.md": "2e8fa595540605147eb4059c7412daeb7e82b280e90d3ee6b77acdfc1fa6cb8f",
     ".cursor/agents/bkit-build-plan-tasks.md": "281c08fb26d0b78ba7372f902b201a3888661e89af0838574790a0bda1ae493b",
     ".opencode/agents/bkit-build-plan-tasks.md": "f7514e742efeffc9baad3d592086fd21fddec608abb32a4450d77b23f51401c6",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 951552433..ed64f8578 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -1796,7 +1796,7 @@ Every plan task block carries a `**TEST FIRST:**` field — one sub-bullet per t
 | Write (Step 7, per group) | `@bkit-build-plan-tests` from `build-brief-tests-{GROUP}-{n}.md`, log `build-plan-tests-{GROUP}-log.md` | Writes every planned test of the group's open tasks that no red row has proved yet, each failing on the behaviour its `fails on` text names, lint-clean; stubs only where a test cannot load without one; no source code. Log lines ``WROTE — TASK {N}: `{file}` `{name}` ``, ``PASSES — TASK {N}: `{file}` `{name}`: {reason}`` (the behaviour already exists), ``BLOCKED — TASK {N}: `{file}` `{name}` — {reason}``, `SOURCE — TASK {N}: {value} from {file}:{line}` (where a value the test checks or fakes comes from). `steps finish --step=build-plan-tests --plan` reads the group's `TEST FIRST` files from the plan and refuses a diff touching any other tracked file, or adding a file a plan `CREATE` line names: exit 15, `source` names them, nothing committed; the orchestrator re-asks once (undo the edits), then Failure Path. |
 | Red (Step 7, per group) | orchestrator runs `bkit tests red --group`, log `build-tests-red-{GROUP}-{n}.md` | Per planned test file of the group's open tasks: `bkit:lint:file` (when declared) passes on it, then `bkit:test:file` runs it once and its JUnit report is read. Per planned test: `red` (ran and failed), `red-not-loaded` (no case carries the planned name, and the report holds no case or only non-passing cases whose name contains the file's stem — an import of unwritten code; counts as red), `passed-accepted` (passed, and the writer's log has a `PASSES` line for it; already landed), `updated` (passed, no `PASSES` line, and the test already existed at the group's start commit with different lines: an existing test the tests step changed; `base` = that commit; counts as proven, and verify judges its diff), `vacuous` (passed, no `PASSES` line, not an update), `missing` (absent from a loaded report, or the file does not exist), `no-report` (no report written), `lint` (the file failed lint; not run). Writes one `build-tests-red` row (`attempt`, `enforced`, `tests` = `{task, test, testName, state, blob, block, reason?, base?}`, `blob` the file's git blob written into the object store with `hash-object -w`, `block` the sha-1 of the test's own lines (null when no line names it), `--commit=none`). Exit 0 every test red; 1 a gap; 3 `bkit:test:file` undeclared (blobs recorded, nothing ran, not enforced); 4 a script could not run. A test an earlier row of the group proved (`red`, `red-not-loaded`, `passed-accepted`, `updated`) with its own lines unchanged is not run again (`skipped`), so a handover, a retry or a task added to the group runs only what is left; a row holds the tests it ran, and readers merge the group's rows per test, later rows winning, except that a proven entry stands against a later unproven result for the same lines. Ticked tasks are skipped. Exit 1 → the orchestrator re-invokes the tests agent once with the red report (rewrite only the `vacuous` / `missing` / `no-report` / `lint` tests), runs red again, and then moves on whatever the result: the gaps reach `tests green` as `unproven`. |
 | Green (Step 8, before verify) | orchestrator runs `bkit tests green` | per planned test: a red entry of the group's rows in a proven state (else listed `unproven`, never a gap, its detail naming the recorded state or that no row exists); `passed-accepted` → `Already landed`, no gap; `updated` → `Updated tests` with the line diff of the test's own lines since `base` and whether it is additive (no line removed), no gap; the named test passes now (else `not-green`). Applies honoured `TEST EXCEPTION` fields; a task whose only test field is a `TEST EXCEPTION` not honoured → `exception-refused`. Per `DELETE` line: the file still exists, or its name (a dotted config key's full path, a `§ heading` as a heading line) is still found in the tree (`git grep`, untracked files included, the plan folder skipped) → `delete-still-referenced`; a `DELETE` + `CREATE` of the same thing is a move, not checked; a file-only `DELETE` + a `CREATE` of the same file name: the new file and paths to it are no reference; a failed grep → the gap says `references not checked`. `--group=N` audits that group's tasks only; a group that is missing or has no tasks → exit 2. Writes `build-tests-green-N-{VERIFY_ATTEMPT}.md` (`Enforced` / `Gaps` / `Unproven` header, `Test exceptions`, `Already landed`, `Updated tests` and `Unproven` sections); prints `alreadyLanded`, `updated`, `changed` and `unproven`; `changed` lists each plan-named test (every group) a code step's `changedTests` record changed, with its reason, never a gap, and the report gets a `Changed by a code step` section when it is non-empty. |
-| Judgement (Step 8) | `@bkit-build-plan-verify` | `not-green` → `Fixable: true`; `Already landed`, `Changed by a code step` and `Unproven` sections → noted, no gap; `Updated tests` → the entry's line diff since `base` read (additive = no line removed; the added lines are still read for one that disables an earlier expectation): it only adds expectations → no gap, else `test-loosened` → `Fixable: true` and the test named on the header's `Loosened` line, or `Fixable: false` when an earlier verify of the group already logged it for that test; `delete-still-referenced` → each hit read: a different thing with the same name → no gap, else `Fixable: true`; `no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused` → `Fixable: false`. Each gap logged `— Fixable: true` or `— Fixable: false`; header `Fixable: true` when any gap is. |
+| Judgement (Step 8) | `@bkit-build-plan-verify` | `not-green` → `Fixable: true`; `Already landed` and `Unproven` sections → noted, no gap; `Changed by a code step` → noted, no gap when its added lines only add setup or expectations, else `test-loosened` (`Fixable: true` and the test on the `Loosened` line, or `Fixable: false` for a test of an earlier group or one an earlier verify logged); `Updated tests` → the entry's line diff since `base` read (additive = no line removed; the added lines are still read for one that disables an earlier expectation): it only adds expectations → no gap, else `test-loosened` → `Fixable: true` and the test named on the header's `Loosened` line, or `Fixable: false` when an earlier verify of the group already logged it for that test; `delete-still-referenced` → each hit read: a different thing with the same name → no gap, else `Fixable: true`; `no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused` → `Fixable: false`. Each gap logged `— Fixable: true` or `— Fixable: false`; header `Fixable: true` when any gap is. |
 | Changed tests (Step 15) | orchestrator runs `bkit tests green` over the whole plan, log `build-tests-green-final.md` | `changed` non-empty → one § Decision Pause (`CHANGED_TESTS`), one `Accept` / `Stop` item per test. Asked once per run, before the Unproven pause. |
 | Unproven (Step 15) | orchestrator runs `bkit tests green` over the whole plan, log `build-tests-green-final.md` | `unproven` non-empty → one § Decision Pause (`UNPROVEN`), one `Accept` / `Stop` item per test; `Accept` writes a `TEST EXCEPTION`. Asked once per run. |
 
diff --git a/.claude/agents/bkit-build-plan-tests.md b/.claude/agents/bkit-build-plan-tests.md
index de4819d7a..20f035ae4 100644
--- a/.claude/agents/bkit-build-plan-tests.md
+++ b/.claude/agents/bkit-build-plan-tests.md
@@ -77,8 +77,9 @@ autoCompactWindow: 300000
    - **If** the log already holds `WROTE` or `PASSES` for a test → skip that test.
 5. **If** a red report is supplied → it names the tests whose red the engine could not prove, each with the state it found (`vacuous`, `missing`, `no-report`, `lint`). Rewrite only those tests, as the state says: a `vacuous` test passed with nothing to test, so make it reach the planned behaviour; a `missing` or `no-report` test is not at the file and name the entry gives; a `lint` test fails `bkit:lint:file`.
    - **If** the caller asks you to restore tests instead of supplying a brief (verify logged each one `test-loosened`) → for each test named:
-     - Read its `Updated tests` entry in the supplied green report. The entry's diff shows the test's own lines at `base` against the lines now.
-     - Put back every expectation the update removed or loosened, as it stood at `base` (`git show {base}:{file}`).
+     - Read its `Updated tests` or `Changed by a code step` entry in the supplied green report. The entry's diff shows the test's own lines at its baseline against the lines now.
+     - **If** the entry is an `Updated tests` one → put back every expectation the update removed or loosened, as it stood at `base` (`git show {base}:{file}`).
+     - **Else** (a `Changed by a code step` entry) → remove each added line that disables or loosens the test, so the restored test holds every baseline line of the entry's diff plus only the added lines that do not disable or loosen it.
      - Keep the expectations the update added.
      - Lint the file and run it, as for a test you write.
      - Append ``WROTE — TASK {N}: `{file}` `{name}` `` with Bash `echo >>`.
diff --git a/.claude/agents/bkit-build-plan-verify.md b/.claude/agents/bkit-build-plan-verify.md
index e1743023d..dbc5a566c 100644
--- a/.claude/agents/bkit-build-plan-verify.md
+++ b/.claude/agents/bkit-build-plan-verify.md
@@ -94,8 +94,11 @@ autoCompactWindow: 300000
      - **If** the hit is a different thing with the same name → no gap.
      - **Else** → `Fixable: true`.
    - `Unproven` section → list each test in `Notes`. No gap: the engine could not prove that test red before its code existed, and the owner answers it once, at the end of the build.
-   - `Changed by a code step` section → list each test and its reason in `Notes`.
-     No gap: a code step kept the change under a `BLOCKED` line, and the owner answers it once, at the end of the build.
+   - `Changed by a code step` section → list each test and its reason in `Notes`; its entry carries the engine's line diff since its baseline, and you read the added lines of that diff the way the `Updated tests` rule reads an update.
+     - **If** the added lines only add setup or expectations → No gap, because the owner answers the change once, at the end of the build.
+     - **Else** → an added line disables or loosens the test (an early `return`, a skip, a comment pair around assertions, `expect.assertions(0)`, a reassignment of the value under test):
+       - **If** a supplied earlier verify report of the group already logged `test-loosened` for that test, **or** the test belongs to a task of an earlier group (the tests step cannot record a restore of it in this group) → append ``TASK {N}: `{file}` `{name}` — test-loosened: {what} — Fixable: false``, so the owner decides.
+       - **Else** → raise a `test-loosened` gap: ``TASK {N}: `{file}` `{name}` — test-loosened: {what} — Fixable: true``, and name the test on the header's `Loosened` line, which sends it back to the tests step to restore.
    - `Updated tests` section → each test is an existing test the tests step changed. Its entry carries the engine's line diff of the test's own lines since `base`, and says whether the change is additive (no line removed). Read that diff, and the supplied group diff when the entry says the lines could not be read:
      - **If** the update only adds expectations → no gap. An additive change is one unless an added line disables or overrides an earlier expectation (a skip, an early return, a reassignment).
      - **Else** → the update removes or loosens an expectation. The tests step restores it and keeps the additions, because no code step may rewrite a planned test:
diff --git a/.codex/agents/bkit-build-plan-tests.toml b/.codex/agents/bkit-build-plan-tests.toml
index 643b5b05b..4c5f6b912 100644
--- a/.codex/agents/bkit-build-plan-tests.toml
+++ b/.codex/agents/bkit-build-plan-tests.toml
@@ -64,8 +64,9 @@ developer_instructions = """
    - **If** the log already holds `WROTE` or `PASSES` for a test → skip that test.
 5. **If** a red report is supplied → it names the tests whose red the engine could not prove, each with the state it found (`vacuous`, `missing`, `no-report`, `lint`). Rewrite only those tests, as the state says: a `vacuous` test passed with nothing to test, so make it reach the planned behaviour; a `missing` or `no-report` test is not at the file and name the entry gives; a `lint` test fails `bkit:lint:file`.
    - **If** the caller asks you to restore tests instead of supplying a brief (verify logged each one `test-loosened`) → for each test named:
-     - Read its `Updated tests` entry in the supplied green report. The entry's diff shows the test's own lines at `base` against the lines now.
-     - Put back every expectation the update removed or loosened, as it stood at `base` (`git show {base}:{file}`).
+     - Read its `Updated tests` or `Changed by a code step` entry in the supplied green report. The entry's diff shows the test's own lines at its baseline against the lines now.
+     - **If** the entry is an `Updated tests` one → put back every expectation the update removed or loosened, as it stood at `base` (`git show {base}:{file}`).
+     - **Else** (a `Changed by a code step` entry) → remove each added line that disables or loosens the test, so the restored test holds every baseline line of the entry's diff plus only the added lines that do not disable or loosen it.
      - Keep the expectations the update added.
      - Lint the file and run it, as for a test you write.
      - Append ``WROTE — TASK {N}: `{file}` `{name}` `` with Bash `echo >>`.
diff --git a/.codex/agents/bkit-build-plan-verify.toml b/.codex/agents/bkit-build-plan-verify.toml
index f982e1eaf..ca5a7fed9 100644
--- a/.codex/agents/bkit-build-plan-verify.toml
+++ b/.codex/agents/bkit-build-plan-verify.toml
@@ -81,8 +81,11 @@ developer_instructions = """
      - **If** the hit is a different thing with the same name → no gap.
      - **Else** → `Fixable: true`.
    - `Unproven` section → list each test in `Notes`. No gap: the engine could not prove that test red before its code existed, and the owner answers it once, at the end of the build.
-   - `Changed by a code step` section → list each test and its reason in `Notes`.
-     No gap: a code step kept the change under a `BLOCKED` line, and the owner answers it once, at the end of the build.
+   - `Changed by a code step` section → list each test and its reason in `Notes`; its entry carries the engine's line diff since its baseline, and you read the added lines of that diff the way the `Updated tests` rule reads an update.
+     - **If** the added lines only add setup or expectations → No gap, because the owner answers the change once, at the end of the build.
+     - **Else** → an added line disables or loosens the test (an early `return`, a skip, a comment pair around assertions, `expect.assertions(0)`, a reassignment of the value under test):
+       - **If** a supplied earlier verify report of the group already logged `test-loosened` for that test, **or** the test belongs to a task of an earlier group (the tests step cannot record a restore of it in this group) → append ``TASK {N}: `{file}` `{name}` — test-loosened: {what} — Fixable: false``, so the owner decides.
+       - **Else** → raise a `test-loosened` gap: ``TASK {N}: `{file}` `{name}` — test-loosened: {what} — Fixable: true``, and name the test on the header's `Loosened` line, which sends it back to the tests step to restore.
    - `Updated tests` section → each test is an existing test the tests step changed. Its entry carries the engine's line diff of the test's own lines since `base`, and says whether the change is additive (no line removed). Read that diff, and the supplied group diff when the entry says the lines could not be read:
      - **If** the update only adds expectations → no gap. An additive change is one unless an added line disables or overrides an earlier expectation (a skip, an early return, a reassignment).
      - **Else** → the update removes or loosens an expectation. The tests step restores it and keeps the additions, because no code step may rewrite a planned test:
diff --git a/.cursor/agents/bkit-build-plan-tests.md b/.cursor/agents/bkit-build-plan-tests.md
index a12e492b5..9c809d74c 100644
--- a/.cursor/agents/bkit-build-plan-tests.md
+++ b/.cursor/agents/bkit-build-plan-tests.md
@@ -74,8 +74,9 @@ tools:
    - **If** the log already holds `WROTE` or `PASSES` for a test → skip that test.
 5. **If** a red report is supplied → it names the tests whose red the engine could not prove, each with the state it found (`vacuous`, `missing`, `no-report`, `lint`). Rewrite only those tests, as the state says: a `vacuous` test passed with nothing to test, so make it reach the planned behaviour; a `missing` or `no-report` test is not at the file and name the entry gives; a `lint` test fails `bkit:lint:file`.
    - **If** the caller asks you to restore tests instead of supplying a brief (verify logged each one `test-loosened`) → for each test named:
-     - Read its `Updated tests` entry in the supplied green report. The entry's diff shows the test's own lines at `base` against the lines now.
-     - Put back every expectation the update removed or loosened, as it stood at `base` (`git show {base}:{file}`).
+     - Read its `Updated tests` or `Changed by a code step` entry in the supplied green report. The entry's diff shows the test's own lines at its baseline against the lines now.
+     - **If** the entry is an `Updated tests` one → put back every expectation the update removed or loosened, as it stood at `base` (`git show {base}:{file}`).
+     - **Else** (a `Changed by a code step` entry) → remove each added line that disables or loosens the test, so the restored test holds every baseline line of the entry's diff plus only the added lines that do not disable or loosen it.
      - Keep the expectations the update added.
      - Lint the file and run it, as for a test you write.
      - Append ``WROTE — TASK {N}: `{file}` `{name}` `` with Bash `echo >>`.
diff --git a/.cursor/agents/bkit-build-plan-verify.md b/.cursor/agents/bkit-build-plan-verify.md
index e7e2b2a48..62a31fe6a 100644
--- a/.cursor/agents/bkit-build-plan-verify.md
+++ b/.cursor/agents/bkit-build-plan-verify.md
@@ -91,8 +91,11 @@ tools:
      - **If** the hit is a different thing with the same name → no gap.
      - **Else** → `Fixable: true`.
    - `Unproven` section → list each test in `Notes`. No gap: the engine could not prove that test red before its code existed, and the owner answers it once, at the end of the build.
-   - `Changed by a code step` section → list each test and its reason in `Notes`.
-     No gap: a code step kept the change under a `BLOCKED` line, and the owner answers it once, at the end of the build.
+   - `Changed by a code step` section → list each test and its reason in `Notes`; its entry carries the engine's line diff since its baseline, and you read the added lines of that diff the way the `Updated tests` rule reads an update.
+     - **If** the added lines only add setup or expectations → No gap, because the owner answers the change once, at the end of the build.
+     - **Else** → an added line disables or loosens the test (an early `return`, a skip, a comment pair around assertions, `expect.assertions(0)`, a reassignment of the value under test):
+       - **If** a supplied earlier verify report of the group already logged `test-loosened` for that test, **or** the test belongs to a task of an earlier group (the tests step cannot record a restore of it in this group) → append ``TASK {N}: `{file}` `{name}` — test-loosened: {what} — Fixable: false``, so the owner decides.
+       - **Else** → raise a `test-loosened` gap: ``TASK {N}: `{file}` `{name}` — test-loosened: {what} — Fixable: true``, and name the test on the header's `Loosened` line, which sends it back to the tests step to restore.
    - `Updated tests` section → each test is an existing test the tests step changed. Its entry carries the engine's line diff of the test's own lines since `base`, and says whether the change is additive (no line removed). Read that diff, and the supplied group diff when the entry says the lines could not be read:
      - **If** the update only adds expectations → no gap. An additive change is one unless an added line disables or overrides an earlier expectation (a skip, an early return, a reassignment).
      - **Else** → the update removes or loosens an expectation. The tests step restores it and keeps the additions, because no code step may rewrite a planned test:
diff --git a/.opencode/agents/bkit-build-plan-tests.md b/.opencode/agents/bkit-build-plan-tests.md
index d83cf32da..abac198de 100644
--- a/.opencode/agents/bkit-build-plan-tests.md
+++ b/.opencode/agents/bkit-build-plan-tests.md
@@ -75,8 +75,9 @@ tools:
    - **If** the log already holds `WROTE` or `PASSES` for a test → skip that test.
 5. **If** a red report is supplied → it names the tests whose red the engine could not prove, each with the state it found (`vacuous`, `missing`, `no-report`, `lint`). Rewrite only those tests, as the state says: a `vacuous` test passed with nothing to test, so make it reach the planned behaviour; a `missing` or `no-report` test is not at the file and name the entry gives; a `lint` test fails `bkit:lint:file`.
    - **If** the caller asks you to restore tests instead of supplying a brief (verify logged each one `test-loosened`) → for each test named:
-     - Read its `Updated tests` entry in the supplied green report. The entry's diff shows the test's own lines at `base` against the lines now.
-     - Put back every expectation the update removed or loosened, as it stood at `base` (`git show {base}:{file}`).
+     - Read its `Updated tests` or `Changed by a code step` entry in the supplied green report. The entry's diff shows the test's own lines at its baseline against the lines now.
+     - **If** the entry is an `Updated tests` one → put back every expectation the update removed or loosened, as it stood at `base` (`git show {base}:{file}`).
+     - **Else** (a `Changed by a code step` entry) → remove each added line that disables or loosens the test, so the restored test holds every baseline line of the entry's diff plus only the added lines that do not disable or loosen it.
      - Keep the expectations the update added.
      - Lint the file and run it, as for a test you write.
      - Append ``WROTE — TASK {N}: `{file}` `{name}` `` with Bash `echo >>`.
diff --git a/.opencode/agents/bkit-build-plan-verify.md b/.opencode/agents/bkit-build-plan-verify.md
index c1d2450a8..07aec71da 100644
--- a/.opencode/agents/bkit-build-plan-verify.md
+++ b/.opencode/agents/bkit-build-plan-verify.md
@@ -92,8 +92,11 @@ tools:
      - **If** the hit is a different thing with the same name → no gap.
      - **Else** → `Fixable: true`.
    - `Unproven` section → list each test in `Notes`. No gap: the engine could not prove that test red before its code existed, and the owner answers it once, at the end of the build.
-   - `Changed by a code step` section → list each test and its reason in `Notes`.
-     No gap: a code step kept the change under a `BLOCKED` line, and the owner answers it once, at the end of the build.
+   - `Changed by a code step` section → list each test and its reason in `Notes`; its entry carries the engine's line diff since its baseline, and you read the added lines of that diff the way the `Updated tests` rule reads an update.
+     - **If** the added lines only add setup or expectations → No gap, because the owner answers the change once, at the end of the build.
+     - **Else** → an added line disables or loosens the test (an early `return`, a skip, a comment pair around assertions, `expect.assertions(0)`, a reassignment of the value under test):
+       - **If** a supplied earlier verify report of the group already logged `test-loosened` for that test, **or** the test belongs to a task of an earlier group (the tests step cannot record a restore of it in this group) → append ``TASK {N}: `{file}` `{name}` — test-loosened: {what} — Fixable: false``, so the owner decides.
+       - **Else** → raise a `test-loosened` gap: ``TASK {N}: `{file}` `{name}` — test-loosened: {what} — Fixable: true``, and name the test on the header's `Loosened` line, which sends it back to the tests step to restore.
    - `Updated tests` section → each test is an existing test the tests step changed. Its entry carries the engine's line diff of the test's own lines since `base`, and says whether the change is additive (no line removed). Read that diff, and the supplied group diff when the entry says the lines could not be read:
      - **If** the update only adds expectations → no gap. An additive change is one unless an added line disables or overrides an earlier expectation (a skip, an early return, a reassignment).
      - **Else** → the update removes or loosens an expectation. The tests step restores it and keeps the additions, because no code step may rewrite a planned test:
diff --git a/DETAILS.md b/DETAILS.md
index 247b39e2b..348822b37 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -347,7 +347,7 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>256 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1869 symbols · 54 files"]
+    n_bkit_core_engine_commands["commands<br/>1871 symbols · 54 files"]
     n_bkit_core_engine_install["install<br/>360 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>240 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index b051fcd43..143eeddd2 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -468,6 +468,12 @@ function restoreIndex(snap) {
     fs.rmSync(lock, { force: true });
     return null;
 }
+/** The `--field` extras; `changedTests` is written by the planned-test lock alone. */
+function fieldExtras(specs) {
+    if (specs.some((x) => x.startsWith("changedTests=")))
+        throw new CommandError(EXIT.USAGE, "--field cannot set changedTests; only the planned-test lock in `steps finish` writes it");
+    return Object.fromEntries(specs.map(extraField));
+}
 /**
  * Append one `step-done` row, then commit (parentSha first, the row, then the
  * commit — the order the fold's de-dup relies on). Returns the row and the new
@@ -862,7 +868,7 @@ async function finish(ctx) {
     else {
         attempt = nonNegativeInt(f.attempt, "attempt");
     }
-    const extras = Object.fromEntries(list(f.field).map(extraField));
+    const extras = fieldExtras(list(f.field));
     for (const spec of list(f.countField)) {
         const eq = spec.indexOf("=");
         if (eq <= 0)
@@ -1105,7 +1111,7 @@ async function finish(ctx) {
             for (const [i, t] of tests.entries()) {
                 const w = why[i];
                 if (w.removed)
-                    notes.push(`${nameOf(t)}: a BLOCKED line cannot remove or loosen a planned test's lines — it lets through only a change that adds lines`);
+                    notes.push(`${nameOf(t)}: the engine refuses a BLOCKED-named change that removes a line of a planned test; it lets through only a change that adds lines, and verify reads every added line`);
                 if (w.reused !== null)
                     notes.push(`${nameOf(t)}: the BLOCKED line's reason "${w.reused}" is already recorded for that test — log a new reason`);
             }
@@ -1627,7 +1633,7 @@ export const stepsCommand = {
                     group,
                     strategy,
                     artifacts,
-                    extras: Object.fromEntries(list(f.field).map(extraField)),
+                    extras: fieldExtras(list(f.field)),
                     parentSha: str(f.parentSha),
                     commit: commit,
                     message: str(f.message),
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index d864a96f2..4a92f23a6 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -202,11 +202,15 @@ export function runPlanPath(statusFile) {
  */
 export function lockBaselines(rows, planned) {
     const out = new Map();
+    /** The newest blob any red recorded per test file (a later tests step's additions included). */
+    const newestBlob = new Map();
     for (const row of rows) {
         if (row.type !== "step-done")
             continue;
         if (row.step === RED_STEP && typeof row.group === "number") {
             for (const t of redTestsOf(row)) {
+                if (t.blob !== null)
+                    newestBlob.set(t.test, t.blob);
                 const key = redKey(t.task, t.test, t.testName);
                 if (planned !== null && !planned.has(key))
                     continue;
@@ -226,12 +230,14 @@ export function lockBaselines(rows, planned) {
                     });
             }
         }
-        if (Array.isArray(row.changedTests)) {
+        if (CODE_STEPS.has(String(row.step)) && Array.isArray(row.changedTests)) {
             for (const c of row.changedTests) {
                 if (typeof c.task !== "number" || typeof c.test !== "string")
                     continue;
                 if (typeof c.testName !== "string")
                     continue;
+                if (typeof c.reason !== "string" || c.reason === "")
+                    continue;
                 const key = redKey(c.task, c.test, c.testName);
                 if (planned !== null && !planned.has(key))
                     continue;
@@ -254,8 +260,23 @@ export function lockBaselines(rows, planned) {
             }
         }
     }
+    // A test no line names (block null) is locked by its whole file, against the file's newest red blob.
+    for (const b of out.values()) {
+        const blob = newestBlob.get(b.test);
+        if (b.fromChange || b.block !== null || blob === undefined || b.blob === null)
+            continue;
+        b.blob = blob;
+        b.text = blob;
+        b.origin = blob;
+    }
     return out;
 }
+/** The code steps whose `changedTests` records move the lock's baseline. */
+const CODE_STEPS = new Set([
+    "build-plan-tasks",
+    "build-plan-gaps-remediate",
+    "build-plan-gaps-remediate-holistic",
+]);
 /** The status rows of one workflow. */
 export const workflowRows = (file, workflow) => fs.existsSync(file)
     ? readStatusRows(file).filter((r) => r.workflow === workflow)
@@ -320,7 +341,8 @@ export function touchedTests(top, file, workflow, plan) {
  * whether it only adds lines; null when either side cannot be read.
  */
 export function baselineDiff(top, blob, test, name) {
-    const was = testBlock(blobText(top, blob), name);
+    // A null blob is a red that recorded the file `missing`: every line of the test is added.
+    const was = blob === null ? "" : testBlock(blobText(top, blob), name);
     const abs = path.join(top, test);
     const now = fs.existsSync(abs) ? testBlock(fs.readFileSync(abs, "utf-8"), name) : null;
     if (was === null || now === null)
@@ -425,7 +447,7 @@ export function testSpan(text, name) {
  * which only a read of the added lines tells.
  */
 export function lineDiff(before, after) {
-    const a = before.split("\n");
+    const a = before === "" ? [] : before.split("\n");
     const b = after.split("\n");
     const lcs = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
     for (let i = a.length - 1; i >= 0; i--)
@@ -1938,6 +1960,20 @@ export const testsCommand = {
                     (resolveGate(top, [BKIT_TEST_FILE_SCRIPT]) === null
                         ? `\`${BKIT_TEST_FILE_SCRIPT}\` is not declared in package.json`
                         : undefined);
+                const changed = [
+                    ...lockBaselines(workflowRows(statusFile(ctx), workflow), plannedKeys(planText)).values(),
+                ]
+                    .filter((b) => b.fromChange && b.reasons.length > 0)
+                    .map((b) => ({
+                    task: b.task,
+                    test: b.test,
+                    name: b.testName,
+                    reason: b.reasons.join("; "),
+                    ...(() => {
+                        const d = baselineDiff(top, b.origin, b.test, b.testName);
+                        return { diff: d?.diff ?? null, additive: d?.additive ?? null };
+                    })(),
+                }));
                 const empty = {
                     verdict: null,
                     rows: [],
@@ -1946,7 +1982,7 @@ export const testsCommand = {
                     landed: [],
                     unproven: [],
                     updated: [],
-                    changed: [],
+                    changed,
                     outputs: [],
                 };
                 if (reason !== undefined) {
@@ -1960,7 +1996,7 @@ export const testsCommand = {
                         alreadyLanded: [],
                         unproven: [],
                         updated: [],
-                        changed: [],
+                        changed,
                         log: logArg,
                     });
                     ctx.log(`test-first not enforced: ${reason}`);
@@ -1974,20 +2010,6 @@ export const testsCommand = {
                 const statusRel = repoRel(top, ctx.cwd, statusFile(ctx));
                 const exceptions = [];
                 const gaps = [];
-                const changed = [
-                    ...lockBaselines(workflowRows(statusFile(ctx), workflow), plannedKeys(planText)).values(),
-                ]
-                    .filter((b) => b.fromChange && b.reasons.length > 0)
-                    .map((b) => ({
-                    task: b.task,
-                    test: b.test,
-                    name: b.testName,
-                    reason: b.reasons.join("; "),
-                    ...(() => {
-                        const d = baselineDiff(top, b.origin, b.test, b.testName);
-                        return { diff: d?.diff ?? null, additive: d?.additive ?? null };
-                    })(),
-                }));
                 const rows = [];
                 const outputs = [];
                 const greens = new Map();
diff --git a/docs/capabilities.md b/docs/capabilities.md
index ebc8638ab..e233a5682 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -164,7 +164,7 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>256 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1869 symbols · 54 files"]
+    n_bkit_core_engine_commands["commands<br/>1871 symbols · 54 files"]
     n_bkit_core_engine_install["install<br/>360 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>240 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
@@ -329,11 +329,11 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_runtime["runtime<br/>20 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_status["status<br/>40 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_step_table["step-table<br/>15 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_steps["steps<br/>76 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_steps["steps<br/>77 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_summary["summary<br/>32 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_summary_findings["summary-findings<br/>7 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tasks["tasks<br/>11 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_tests["tests<br/>106 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_tests["tests<br/>107 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tests_base["tests-base<br/>14 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tests_changed["tests-changed<br/>5 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tracker["tracker<br/>94 symbols · 1 files"]
@@ -385,7 +385,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_issues -->|41| n_bkit_core_engine_commands_workflow_tracker
   n_bkit_core_engine_commands_ci_ci -->|38| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_ledgers -->|38| n_bkit_core_engine_ledgers_status
-  n_bkit_core_engine_commands_workflow_steps -->|36| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_steps -->|37| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_issues -->|32| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_workflows -->|31| n_bkit_core_engine_commands_workflow_run_facts
   n_bkit_core_engine_commands_workflow_workflows -->|30| n_bkit_core_engine_commands_workflow_status
diff --git a/docs/testing.md b/docs/testing.md
index 437bf6182..7cc51adf1 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -311,7 +311,7 @@ A plan's `Derived Test Matrix` (`docs/templates/bkit-plan.md`) applies this rubr
 - **Call the runner directly:** a task runner that caches results, or runs dependent packages' suites first, breaks the one-file contract. A monorepo routes the path to the package and config that own it. An integration file gets the same environment setup that the integration suite gets.
 - **Judged by the report, never the exit code:** a misspelled path, a syntax error and an import of unwritten code all exit non-zero, just like a real failure. A red counts when the named test ran and failed, or when its file failed to load: no case carries the planned name, and the report holds no case, or only non-passing cases whose name contains the file's stem (the tests step writes no source, so an import of unwritten code is the expected shape of a red); a green only when it ran and passed.
 - **Test name:** use the name as the runner reports it, or its last segment (`clamp > keeps a value inside the range` → `keeps a value inside the range`).
-- **The red test stays:** after the red, the test may gain tests or formatting. A weakened, removed or rewritten assertion fails the build's verify. A code step that must change a planned test (for example new setup lines a correct code change forces) keeps the edit and logs a `BLOCKED` line naming the test and why; `steps finish` lets it through only when the change adds lines and removes none (a removed or rewritten line is refused even under a `BLOCKED` line), and the owner answers the change, shown as a diff, at the end of the build.
+- **The red test stays:** after the red, the test may gain tests or formatting. A weakened, removed or rewritten assertion fails the build's verify. A code step that must change a planned test (for example new setup lines a correct code change forces) keeps the edit and logs a `BLOCKED` line naming the test and why; `steps finish` lets it through only when the change adds lines and removes none (a removed or rewritten line is refused even under a `BLOCKED` line), verify reads the added lines of that change and raises `test-loosened` for one that disables or loosens the test (an early `return`, a skip, a reassignment), and the owner answers the change, shown as a diff, at the end of the build.
 
 ## Tests lock
 
