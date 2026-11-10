diff --git a/.bkit/core/engine/commands/workflow/tests.test.ts b/.bkit/core/engine/commands/workflow/tests.test.ts
index add55c0f7..762aad67c 100644
--- a/.bkit/core/engine/commands/workflow/tests.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -1194,6 +1194,7 @@ describe("bkit tests plan-check", () => {
     ].join("\n");
   /** The matrix header the reader maps rows to tasks by. */
   const MATRIX = ["Test description", "Type", "Target file", "Task"];
+  const EXPECTED_MATRIX_HEADER = "Test description | Type | Target file | Task";
   /** A Supersession Inventory table with one DELETE row per file. */
   const supersession = (...files: string[]) =>
     [
@@ -1615,9 +1616,82 @@ describe("bkit tests plan-check", () => {
       expect.objectContaining({ kind: "matrix", line: lineOf("plan.md", "| Test description") }),
     ]);
     expect(r.json.problems[0].message).toContain("Task");
+    expect(r.json.problems[0].message).toContain("Test description | Type | Target file | Task");
     expect(report().match(/`matrix`/g)).toHaveLength(1);
   });
 
+  it("plan-check refuses a matrix header with an extra leading # column", async () => {
+    write(
+      "plan.md",
+      matrix(
+        ["#", "Test description", "Type", "Target file", "Task"],
+        ["1", "case a", "Unit", "`t0.test.ts`", "1"],
+        ["2", "case b", "Unit", "`t1.test.ts`", "2"],
+      ),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const r = await check();
+    expect(r.code).toBe(1);
+    expect(r.json.problems).toEqual([
+      expect.objectContaining({ kind: "matrix", line: lineOf("plan.md", "| #") }),
+    ]);
+    expect(r.json.problems[0].message).toContain(EXPECTED_MATRIX_HEADER);
+    expect(report().match(/`matrix`/g)).toHaveLength(1);
+  });
+
+  it("plan-check refuses a matrix header with Task not last", async () => {
+    write(
+      "plan.md",
+      matrix(
+        ["Test description", "Type", "Task", "Target file"],
+        ["case a", "Unit", "1", "`t0.test.ts`"],
+        ["case b", "Unit", "2", "`t1.test.ts`"],
+      ),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const r = await check();
+    expect(r.code).toBe(1);
+    expect(r.json.problems).toEqual([
+      expect.objectContaining({ kind: "matrix", line: lineOf("plan.md", "| Test description") }),
+    ]);
+    expect(r.json.problems[0].message).toContain(EXPECTED_MATRIX_HEADER);
+    expect(report().match(/`matrix`/g)).toHaveLength(1);
+  });
+
+  it("plan-check refuses synonym matrix column names", async () => {
+    write(
+      "plan.md",
+      matrix(
+        ["Behaviour", "Tier", "Target file", "Task"],
+        ["case a", "Unit", "`t0.test.ts`", "1"],
+        ["case b", "Unit", "`t1.test.ts`", "2"],
+      ),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const r = await check();
+    expect(r.code).toBe(1);
+    expect(r.json.problems).toEqual([
+      expect.objectContaining({ kind: "matrix", line: lineOf("plan.md", "| Behaviour") }),
+    ]);
+    expect(r.json.problems[0].message).toContain(EXPECTED_MATRIX_HEADER);
+    expect(report().match(/`matrix`/g)).toHaveLength(1);
+  });
+
+  it("plan-check accepts the template matrix header in any letter case", async () => {
+    write(
+      "plan.md",
+      matrix(
+        ["test DESCRIPTION", " TYPE", "target File ", "TASK"],
+        ["case a", "Unit", "`t0.test.ts`", "1"],
+        ["case b", "Unit", "`t1.test.ts`", "2"],
+      ),
+      groupBlock(1, okTask(1), okTask(2)),
+    );
+    const r = await check();
+    expect(r.code).toBe(0);
+    expect(r.json.problems).toEqual([]);
+  });
+
   it("plan-check refuses a Task cell naming an undefined task", async () => {
     write(
       "plan.md",
diff --git a/.bkit/core/engine/commands/workflow/tests.ts b/.bkit/core/engine/commands/workflow/tests.ts
index 58b208059..e9051d4c5 100644
--- a/.bkit/core/engine/commands/workflow/tests.ts
+++ b/.bkit/core/engine/commands/workflow/tests.ts
@@ -895,14 +895,20 @@ export function checkPlanText(text: string, caps: TaskCaps = CONFIG_DEFAULTS.tas
   // matrix section yields no problem: the refusal is on a row, and issue-form plans carry none.
   const matrix = derivedTestMatrix(text);
   if (matrix !== null) {
-    if (matrix.taskColumn === null)
+    const expected = "Test description | Type | Target file | Task";
+    const header = (matrix.head[0] ?? "")
+      .trim()
+      .replace(/^\||\|$/g, "")
+      .split("|")
+      .map((c) => c.trim().toLowerCase())
+      .join(" | ");
+    if (header !== expected.toLowerCase())
       problems.push({
         line: matrix.line,
         kind: "matrix",
-        message:
-          "the Derived Test Matrix header has no `Task` column; add one naming the task each row's test belongs to",
+        message: `the Derived Test Matrix header must be exactly \`${expected}\`, in that order with no other columns`,
       });
-    else {
+    if (matrix.taskColumn !== null) {
       const mapped = new Set<number>();
       for (const row of matrix.rows) {
         const named = row.tasks.map((n) => `TASK ${n}`);
diff --git a/.bkit/core/prompts/bkit-build-plan-convert.md b/.bkit/core/prompts/bkit-build-plan-convert.md
index 47fed6152..cf2497521 100644
--- a/.bkit/core/prompts/bkit-build-plan-convert.md
+++ b/.bkit/core/prompts/bkit-build-plan-convert.md
@@ -33,7 +33,7 @@ autoCompactWindow: 300000
 - **Input dates:** Where two sections of the `*-input-*.md` file disagree, the newer one wins; older text still counts wherever nothing newer contradicts it.
 - **Same scope:** Every task traces to the input file or the existing plan. Add no work that they do not ask for, and drop no work that they do ask for.
 - **No anchor authoring:** Do not write a `<!-- bkit:anchor` block; keep an existing one byte-for-byte.
-- **Matrix shape:** The plan's `Derived Test Matrix` has a `Task` column beside `Test description`, `Type` and `Target file`. Each cell in it names the one runbook task that lands that row's test.
+- **Matrix shape:** The plan's `Derived Test Matrix` has exactly the header `Test description | Type | Target file | Task`, in that order, with no extra columns. Each `Task` cell in it names the one runbook task that lands that row's test.
 - **Runbook tasks:** The runbook is groups of task blocks in build order (schema, then API, then UI). A group is `<!-- bkit:group N start -->`, `### TASK GROUP N: {title}`, its task blocks and `<!-- bkit:group N end -->`, holding tasks and `TEST FIRST` tests within the per-group plan caps your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all); bigger → split the group. A task is `<!-- bkit:task N start -->`, `- [ ] **TASK N:** {title}`, one sub-bullet per field and `<!-- bkit:task N end -->`, its number unique across the plan. Fields, uppercase: `**CREATE:**` / `**READ:**` / `**UPDATE:**` / `**DELETE:**` (`` `{symbol}` in `{file}`: {what} `` or `` `{file}`: {what} ``, one line per reference), `**DEPENDS ON:**` (task numbers, same or earlier group), `**DONE WHEN:**`, `**TEST FIRST:**`, `**TEST EXCEPTION:**`; `bkit tests plan-check` refuses task-like text outside every block. `DONE WHEN` is short, testable and checkable in the codebase (a file exists, a signature matches, a test passes, a behaviour shows). A task that adds or changes logic names its own tests and fixes the tests it breaks; no task leaves its tests to a later one. Behaviour tests come only from `Derived Test Matrix` rows, and a task crossing a boundary (DB, API, model, network, migration) pairs them with non-mock tests. An audit plan has one task per in-scope finding id; tasks group findings only on one shared root cause and still name every id.
 - **TEST FIRST:** Each task carries a `**TEST FIRST:**` field after `DONE WHEN`. A behaviour change at the unit or integration tier lists one or more tests, within the per-task plan caps your Context names (tests, test files), one sub-bullet per test, each `` `{test file}` `` `` `{test name}` `` fails on {what goes wrong}: a repo-relative test file, the test name as the runner reports it or its last segments, and {what goes wrong} as the wrong behaviour a stub shows, not a literal assertion. When the planned failure prints a phrase no other failure would, put that phrase in double quotes inside {what goes wrong}, e.g. fails on the total "expected 12" being 0: `tests red` refuses a red whose failure message and failure text hold none of the quoted phrases. More tests or files → split the task. No behaviour change (docs, config, pure refactor) or E2E / `@live` tier only → `n/a — {reason naming which}` on the field line. A regenerated baseline (a snapshot, a coverage list, a generated doc) is never a `TEST FIRST` test: regenerating it makes it pass, so it cannot fail first.
 - **TEST EXCEPTION:** Only the owner writes a `**TEST EXCEPTION:**` field, or the build orchestrator after the owner approves it. NEVER write one on your own judgement. It sits inside the task's block, with entries in `TEST FIRST` form each ending `— {reason}`.
diff --git a/.bkit/core/prompts/bkit-plan-generate.md b/.bkit/core/prompts/bkit-plan-generate.md
index 0cc8b3c3a..b41a13dac 100644
--- a/.bkit/core/prompts/bkit-plan-generate.md
+++ b/.bkit/core/prompts/bkit-plan-generate.md
@@ -43,7 +43,7 @@ autoCompactWindow: 300000
 - **Related Issues:** List each tracker reference from the plan input as `#N — title (state)`, without its content. The references help find duplicates and add no scope. **If** there are none → `None`.
 - **Example tools:** Tools and commands `docs/templates/bkit-plan.md` names are examples; write the project's own and drop what does not apply.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; NEVER invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has the header `Test description | Type | Target file | Task`, in that order, with no extra columns, and one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Test tiers:** A `Derived Test Matrix` row's `Type` is a tier name exactly as `docs/testing.md` writes it, picked by its tier-selection rubric: the lowest tier that exercises the behaviour, or several. Boundary rows reach the real boundary and assert a ground-truth signal, with `@live` for an external or deployed boundary.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` ONLY when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
diff --git a/.bkit/core/prompts/bkit-plan-review-1.md b/.bkit/core/prompts/bkit-plan-review-1.md
index 02b3b6b01..3e0f407ba 100644
--- a/.bkit/core/prompts/bkit-plan-review-1.md
+++ b/.bkit/core/prompts/bkit-plan-review-1.md
@@ -33,7 +33,7 @@ autoCompactWindow: 300000
 - **Lens discipline:** Stay within the lens that your Process defines. A finding outside that lens is outside your remit.
 - **Output header:** Every line above `<!-- verdict:end -->` MUST stay machine-parseable.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; NEVER invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has the header `Test description | Type | Target file | Task`, in that order, with no extra columns, and one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` ONLY when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
 - **Suggested Scope Expansion:** List prior work overlapping the plan's surfaces as candidates (related open issues, open `docs/deferrals.jsonl` and `docs/failures.jsonl` rows, audit findings the input did not name), each with source, overlap and recommendation. Candidates are for the human, not runbook tasks; one joins the plan ONLY through design scope or a human decision, and then leaves the list.
diff --git a/.bkit/core/prompts/bkit-plan-scope-check.md b/.bkit/core/prompts/bkit-plan-scope-check.md
index 239daeb01..826b0619d 100644
--- a/.bkit/core/prompts/bkit-plan-scope-check.md
+++ b/.bkit/core/prompts/bkit-plan-scope-check.md
@@ -34,7 +34,7 @@ autoCompactWindow: 300000
 - **Lens discipline:** Stay within the lens that your Process defines. A finding outside that lens is outside your remit.
 - **Output header:** Every line above `<!-- verdict:end -->` MUST stay machine-parseable.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; NEVER invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has the header `Test description | Type | Target file | Task`, in that order, with no extra columns, and one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` ONLY when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
 - **Reuse Inventory:** Each capability the plan introduces has a `Reuse Inventory` row, written before `Architecture & Component Changes`, recording the searches run (in-repo text and symbol search, framework built-ins, current practice) and a decision. The default is `EXTEND`: a `[MODIFY]` of the named file plus a runbook task. `NEW` needs one reason: (a) the searches find no candidate, (b) extending breaks the candidate's contract or callers, both named, or (c) the candidate is a `Supersession Inventory` `DELETE`. A cleaner fresh start or a messy or close-but-different candidate is no reason, and a row with no search is unsearched, not `NEW`. Each `[NEW]` file carries its row's reason. Each row names the file it decides in `File`, and each task `CREATE` file needs a `NEW` row naming it.
diff --git a/.bkit/core/prompts/bkit-plan-update.md b/.bkit/core/prompts/bkit-plan-update.md
index 104b49c73..cf2285e60 100644
--- a/.bkit/core/prompts/bkit-plan-update.md
+++ b/.bkit/core/prompts/bkit-plan-update.md
@@ -35,7 +35,7 @@ autoCompactWindow: 300000
 - **Output header:** Every line above `<!-- verdict:end -->` MUST stay machine-parseable.
 - **Example tools:** Tools and commands `docs/templates/bkit-plan.md` names are examples; write the project's own and drop what does not apply.
 - **Acceptance Scenario:** `Narrative` and `Success Criteria` come word for word from the first source that has them: the design's `Acceptance Scenario`, else the issue's change-shape fields (`.bkit/trackers.md` § Issue shapes), else, for an audit-only plan, the user or operator impact of the in-scope findings. With no source, both read `⚠️ MISSING: no design doc, no issue Narrative and no audit report — human must provide before plan proceeds`; NEVER invent them. `Narrative` is 1-2 sentences from the user's side: what they do and what they get back. `Success Criteria` are at most 5 measurable outcomes, not steps; an audit plan has one per in-scope finding id, from its `Expected`, with no cap. `Context & Goals` does not repeat them.
-- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
+- **Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has the header `Test description | Type | Target file | Task`, in that order, with no extra columns, and one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 - **Test tiers:** A `Derived Test Matrix` row's `Type` is a tier name exactly as `docs/testing.md` writes it, picked by its tier-selection rubric: the lowest tier that exercises the behaviour, or several. Boundary rows reach the real boundary and assert a ground-truth signal, with `@live` for an external or deployed boundary.
 - **Open questions:** Each open question gives 2-3 options with their trade-offs as the lettered `Options: A) {option} — {trade-off} · B) …`, a `Recommended` naming the chosen letter and the default if unanswered; the design's options and recommendation carry forward where it already answered. Each assumption names what breaks if it is wrong.
 - **Out of Scope:** Plan work is in scope by default. An `Out of Scope` row is `Exempt` ONLY when no `Success Criteria`, `Acceptance Scenario`, `Derived Test Matrix` row or design item (non-goals aside) needs it, and it says why and where the item belongs. Required work parked there is a `Blocking` deferral and belongs in the runbook. Each `Exempt` row has a matching `docs/deferrals.jsonl` row; an audit `LOW` finding left out is an `Exempt` row.
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 3e60c923a..4b1f12538 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -3825,7 +3825,7 @@ Record `partial diff coverage` in the verdict.
 - carriers: prompt `bkit-plan-generate`, `bkit-plan-review-1`, `bkit-plan-scope-check`, `bkit-plan-update`
 
 ```text
-**Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
+**Scenario detail:** `Process Sketch` restates the `Concrete Example` and `Edge Cases` as 3-7 `WHEN X → THEN Y` outcome lines, with no new examples. `Concrete Example` is one scenario: role, starting state, numbered steps, observable outcome. `Edge Cases` keep the design's Key Edge Cases, else the issue's rows, word for word, and add validation, error and boundary cases. `Derived Test Matrix` has the header `Test description | Type | Target file | Task`, in that order, with no extra columns, and one row per testable behaviour, each with a target file and a `Task` cell naming the one runbook task that lands its test; issue rows stay word for word, and each in-scope audit behaviour has a row.
 ```
 
 ```retired
@@ -10694,7 +10694,7 @@ Write the **Create** output in the Output format.
 ```text
 **Role:** Senior engineer turning an issue or a free-form plan into a plan in task-block form.
 **Same scope:** Every task traces to the input file or the existing plan. Add no work that they do not ask for, and drop no work that they do ask for.
-**Matrix shape:** The plan's `Derived Test Matrix` has a `Task` column beside `Test description`, `Type` and `Target file`. Each cell in it names the one runbook task that lands that row's test.
+**Matrix shape:** The plan's `Derived Test Matrix` has exactly the header `Test description | Type | Target file | Task`, in that order, with no extra columns. Each `Task` cell in it names the one runbook task that lands that row's test.
 Read `docs/templates/bkit-plan.md` § `Agent Execution Runbook` for the shape of a group and of a task block. The rules for filling them are the **Runbook tasks**, **TEST FIRST** and **TEST EXCEPTION** clauses above.
 Set up the plan file:
 **If** the plan file exists → keep every section except `Agent Execution Runbook` as written, and rewrite the runbook.
diff --git a/.bkit/trackers.md b/.bkit/trackers.md
index b095cff0c..1d517f2f6 100644
--- a/.bkit/trackers.md
+++ b/.bkit/trackers.md
@@ -139,7 +139,7 @@ Workflows read an issue's body and comments (`bkit issues text`), never its titl
 
 - Success Criteria: <=5 bullets, each an observable outcome.
 - Edge Cases: `| Scenario | Expected Behavior |`.
-- Derived Test Matrix: `| Test description | Type | Target file |`. Type = the lowest tier that exercises the test, named as in `docs/testing.md`. Exactly one task covers each row.
+- Derived Test Matrix: `| Test description | Type | Target file |` in the issue; the plan form is the four columns `Test description | Type | Target file | Task`, with `Task` last. Type = the lowest tier that exercises the test, named as in `docs/testing.md`. Exactly one task covers each row.
 - Tasks, in build order, as task group and task blocks (`docs/templates/bkit-plan.md` § Agent Execution Runbook), sized by `package.json` `bkit.workflows.tasks`:
   - Each group holds <= `bkit.workflows.tasks.maxPerGroup` tasks (default 5) and <= `bkit.workflows.tasks.maxTestsPerGroup` `TEST FIRST` tests (default 25).
   - Each task has 1 to `bkit.workflows.tasks.maxTestsPerTask` tests (default 10) across <= `bkit.workflows.tasks.maxTestFilesPerTask` test files (default 3), or `n/a — {reason}` for docs, config, a pure refactor, or E2E / @live only.
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index ccd38afff..ef8a4010a 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -641,13 +641,20 @@ export function checkPlanText(text, caps = CONFIG_DEFAULTS.tasks) {
     // matrix section yields no problem: the refusal is on a row, and issue-form plans carry none.
     const matrix = derivedTestMatrix(text);
     if (matrix !== null) {
-        if (matrix.taskColumn === null)
+        const expected = "Test description | Type | Target file | Task";
+        const header = (matrix.head[0] ?? "")
+            .trim()
+            .replace(/^\||\|$/g, "")
+            .split("|")
+            .map((c) => c.trim().toLowerCase())
+            .join(" | ");
+        if (header !== expected.toLowerCase())
             problems.push({
                 line: matrix.line,
                 kind: "matrix",
-                message: "the Derived Test Matrix header has no `Task` column; add one naming the task each row's test belongs to",
+                message: `the Derived Test Matrix header must be exactly \`${expected}\`, in that order with no other columns`,
             });
-        else {
+        if (matrix.taskColumn !== null) {
             const mapped = new Set();
             for (const row of matrix.rows) {
                 const named = row.tasks.map((n) => `TASK ${n}`);
