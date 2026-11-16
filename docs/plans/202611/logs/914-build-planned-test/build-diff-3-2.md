diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md b/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
index 212af9414..e7aee76ad 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
@@ -92,7 +92,7 @@ tools:
    - `PIVOT` → identify why each earlier attempt failed. Try a different approach from the earlier attempts, and do not repeat one.
    - `FINAL` → run `pnpm bkit:deps:outdated`. Diagnose again: check that this is the right problem, whether the plan is flawed and whether the root cause lies upstream, and compare the result with each earlier attempt.
    - All strategies: do not edit, rename, move or delete a planned `TEST FIRST` test, and NEVER touch a `TEST EXCEPTION` field. Only the tests step rewrites a planned test. Other tests in the same file are yours to change: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
-   - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. The owner answers it at the end of the build.
+   - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. Under a `BLOCKED` line the engine passes a fix that only adds lines to the test's own lines; a fix that removes or rewrites any of the test's lines is refused, whatever the line says. The owner answers it at the end of the build.
    - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this round; they override the strategy's default angle. `Decision: Accept (assumed)` and `Decision: Fix now — recommended; applied without asking` are not the owner's words: an assumed accept is settled for this build (leave it), an unasked `Fix now` takes the recommendation.
 7. Fix the gaps in `priority` order. For each gap:
    - Apply a targeted fix by editing or creating source.
diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-tasks.md b/.agents/plugins/bkit/agents/bkit-build-plan-tasks.md
index a183362f0..86e24d25a 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-tasks.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-tasks.md
@@ -106,7 +106,7 @@ tools:
    - The task's `TEST FIRST` tests are already on disk: the tests step wrote them, and the engine recorded each one red before this step. Do not edit, rename, move or delete a planned test, and NEVER touch a `TEST EXCEPTION` field.
      - Other tests in the same file are yours to change, for example to fix a test your code breaks: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
      - **If** a planned test is wrong (it asserts what the task's `DONE WHEN` does not ask for, or fakes a value the real code cannot return) → append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` with Bash `echo >>`, and build the rest of the task.
-     - **If** a correct code change forces an edit to a planned test (for example new setup lines, with the assertions unchanged) → keep the edit and finish the task's code first. Then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed. Formatting a planned test file (for example `prettier --write`) counts as an edit. The engine lets the step through, and the owner answers the change at the end of the build.
+     - **If** a correct code change forces an edit to a planned test (for example new setup lines, with the assertions unchanged) → keep the edit and finish the task's code first. Then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed. Formatting a planned test file (for example `prettier --write`) counts as an edit. A `BLOCKED` line lets through only a change that adds lines to the test's own lines: a change that removes or rewrites any of the test's lines is refused, whatever the line says. The engine lets an adding change through, and the owner answers the change at the end of the build.
    - Build the task in this order:
      - Edit or create the source until the task's tests pass.
      - Refactor, keeping the tests green.
diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index f884988d4..ad11fc5e6 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -133,7 +133,7 @@ description: "Build Feature — Autonomous implementation"
      - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
      - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
    - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
-   - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept the change?`
+   - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason and the entry's `diff` (the test's own-line diff since its baseline, shown in a diff fence). Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept the change?`
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
    Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index 287006db1..16eaa4dfa 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -133,7 +133,7 @@ description: "Build Feature — Autonomous implementation"
      - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
      - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
    - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
-   - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept the change?`
+   - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason and the entry's `diff` (the test's own-line diff since its baseline, shown in a diff fence). Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept the change?`
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
    Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index f99842659..f0ce6c5f1 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -992,7 +992,7 @@ One mechanism for every build question: verify gaps logged `Fixable: false`, a n
 - **Who asks:**
   - **If** `ask` is true and the run is not headless → the orchestrator asks, in session. Never a subagent, because subagents cannot reach the human.
   - **If** `ask` is false or the run is headless → `bkit decisions apply --by=headless` takes each recommendation. Exit 4 means hard blockers are left: in a session only those are asked; headless, the run takes the Failure Path.
-- **Changed tests (Step 15):** before the unproven ones, `bkit tests green` over the whole plan lists each planned test a code step changed under a `BLOCKED` line (`changed`). One pause, `Question: CHANGED_TESTS`, one item per test with the step's reason, options `Accept` / `Stop`, recommended `Accept`; asked once per run (a decision file with `Question: CHANGED_TESTS` already there skips it). Headless → `Accept (assumed)`, which ship asks the owner to confirm. The opening skip needs both `CHANGED_TESTS` and `UNPROVEN` answers, so `tests green` still runs when only one is answered.
+- **Changed tests (Step 15):** before the unproven ones, `bkit tests green` over the whole plan lists each planned test a code step changed under a `BLOCKED` line (`changed`). One pause, `Question: CHANGED_TESTS`, one item per test with the step's reason and the diff of its own lines since its baseline (`changed` carries `diff` and `additive`), options `Accept` / `Stop`, recommended `Accept`; asked once per run (a decision file with `Question: CHANGED_TESTS` already there skips it). Headless → `Accept (assumed)`, which ship asks the owner to confirm. The opening skip needs both `CHANGED_TESTS` and `UNPROVEN` answers, so `tests green` still runs when only one is answered.
 - **Unproven tests (Step 15):** before the summary, `bkit tests green` over the whole plan lists each planned test still `unproven` (never failed before its code existed). One pause, `Question: UNPROVEN`, one item per test, options `Accept` / `Stop`, recommended `Accept`; asked once per run (a decision file with `Question: UNPROVEN` already there skips it). Headless → `Accept (assumed)`, which ship asks the owner to confirm. Route `summary` → Step 15.
 - **Hard blockers:** the unfixable gaps (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, and holistic gaps logged `Fixable: false`) and `**Fixable:** false` challenge findings. No recommendation; "yes" never answers one. `Fix now` on one needs the owner's direction: with none, the pause asks what the fix should do and builds no task.
 - **Accept** by the owner: written ONLY after explicit human approval of that item. Agents NEVER write one on their own judgement. An `exception-refused` gap or an `UNPROVEN` item → a `**TEST EXCEPTION:**` field in the task's block, committed alone (`git commit -- {plan}`) so `tests green` honours them; each entry ends `— {reason} (owner, {YYYY-MM-DD})`, and the field replaces the task's existing one, never a second, so the plan-alone commit always changes its lines and blame points at it; other → `docs/decisions.jsonl` row (`by.step` `build-decision`, `rationale` `accepted by owner: …`). Verify and `bkit challenge merge` read `build-decision-*.md` and drop accepted items. An accepted challenge task is also ticked `[x]` and its title ends ` — accepted by owner`, so the summary does not count it as unfinished. Group-gate failures are never items.
@@ -1799,7 +1799,7 @@ Every plan task block carries a `**TEST FIRST:**` field — one sub-bullet per t
 | Unproven (Step 15) | orchestrator runs `bkit tests green` over the whole plan, log `build-tests-green-final.md` | `unproven` non-empty → one § Decision Pause (`UNPROVEN`), one `Accept` / `Stop` item per test; `Accept` writes a `TEST EXCEPTION`. Asked once per run. |
 
 - **The report, never the exit code:** a misspelled path, a syntax error, and an import of unwritten code all exit non-zero like a real failure; a test-name filter matching nothing exits 0 with the test skipped. Only the named test's own outcome counts, except that when no case carries the planned name and the report holds no case, or every case is non-passing with a name containing the file's stem, the file is `red-not-loaded` (per-runner commands: `docs/testing.md` § Test first): the tests step writes no source, so an import of unwritten code is the expected shape of a red.
-- **Each planned test case is locked, not its file:** the red row records each planned test file's git blob, written into the local object store (`hash-object -w`) so the content is recoverable while something references it, and each test's `block`: the sha-1 of its own lines. Its lines start on the first line naming it as a quoted string (else as a whole word) that is no comment and opens no suite (`describe`, `context`, `suite`, a class), or on the line before when that line ends with `(`, and run through every deeper-indented line plus one closing line (`}`, `)`, `]`, `end`) at the start's indent; the reader needs only the name and indentation, so it works for any framework. `steps finish` on the code steps (`build-plan-tasks`, `build-plan-gaps-remediate`, `build-plan-gaps-remediate-holistic`) re-hashes each planned test the plan names, of every group with a red row, and refuses the step when one differs from its baseline (the block its red recorded, or the block of a later `changedTests` record): exit 11, `tests` names each `{test, name}`, `touched` their files, nothing committed, `reask` names the agent; a test named by a ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` line (`Gap {N}` for the gap fixes) in the step's log is let through instead and recorded in the step row's `changedTests` (its reason, its new block), which becomes the test's next baseline; the orchestrator re-asks once (put that test back, keep the other edits, or log that line and the `DONE` line again), then Failure Path. Each refusal appends an `agent-rework` friction row. Other tests in the same file, helpers and new tests are free to change. A row with no `block` (no line carried the name, or the row predates per-test locking) derives the block from the recorded blob at check time; only when that holds no block either does the check fall back to the whole-file blob.
+- **Each planned test case is locked, not its file:** the red row records each planned test file's git blob, written into the local object store (`hash-object -w`) so the content is recoverable while something references it, and each test's `block`: the sha-1 of its own lines. Its lines start on the first line naming it as a quoted string (else as a whole word) that is no comment and opens no suite (`describe`, `context`, `suite`, a class), or on the line before when that line ends with `(`, and run through every deeper-indented line plus one closing line (`}`, `)`, `]`, `end`) at the start's indent; the reader needs only the name and indentation, so it works for any framework. `steps finish` on the code steps (`build-plan-tasks`, `build-plan-gaps-remediate`, `build-plan-gaps-remediate-holistic`) re-hashes each planned test the plan names, of every group with a red row, and refuses the step when one differs from its baseline (the block its red recorded, or the block of a later `changedTests` record): exit 11, `tests` names each `{test, name}`, `touched` their files, nothing committed, `reask` names the agent; a test named by a ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` line (`Gap {N}` for the gap fixes) in the step's log is let through instead, only when it adds lines to the test's own lines and removes none (a removal or rewrite is refused even under that line; a reason already recorded for the test does not count again), and recorded in the step row's `changedTests` (its reason, its new block, the baseline `blob` stored with `hash-object -w` and the `after` blob), which becomes the test's next baseline; the orchestrator re-asks once (put that test back, keep the other edits, or log that line and the `DONE` line again), then Failure Path. Each refusal appends an `agent-rework` friction row. Other tests in the same file, helpers and new tests are free to change. A row with no `block` (no line carried the name, or the row predates per-test locking) derives the block from the recorded blob at check time; only when that holds no block either does the check fall back to the whole-file blob.
 - **Literal names:** a planned name must be a `<testcase name>` the repo's `bkit:test:file` writes (red and green match a case whose name equals it or ends with ` {name}`); a runner that reports one case per file means the plan names the file (per-runner commands: `docs/testing.md` § Test first). The lock finds a test by its name, so a planned test carries its name as a literal string: no `it.each` / `@pytest.mark.parametrize` row and no template string builds it. A plan may name a test by its suite path as a JUnit report does (`suite > test`); red and green match that path as a suffix of the case name, and the lock finds the test by the last `>` segment when no line carries the whole path.
 - **Updating an existing test:** a `TEST FIRST` line may name a test that already exists (`tests plan-check` lists such names under `existing`, reported only). The tests step may add expectations to it, never remove or loosen one. If it passes after that, the red records it `updated` with the group's start commit as `base`, and verify reads its diff since `base` against that rule. The tests brief lists each such test under `Planned tests that already exist` with the line it starts on (`exists at {file}:{line}`), so the tests step updates it in place rather than writing a second test of that name. A loosened update is `test-loosened`: the first time `Fixable: true`, answered by the tests step (Step 9 sends the test back to it: removed or loosened expectations restored as at `base`, additions kept, the red recorded again, Step 8 re-run), never by the owner or a code step; loosened again → `Fixable: false` → § Decision Pause.
 - **Resume-safe:** neither step ticks tasks. A resumed or handed-over group re-runs Step 7: the tests brief leaves out every test the group's red rows already proved and names no task with none left, the red skips those tests, the code brief leaves out the `DONE` tasks. A `passed-accepted` test is already landed: `DONE WHEN` already holds with no task code written → execute logs `DONE — TASK N: already landed`; never code undone to force a red.
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 89661a2b4..ed7cbb16a 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -2380,6 +2380,24 @@ describe("planned tests a code step changed", () => {
     expect(FORM("Gap").test(log.replaceAll("``", ""))).toBe(true);
   });
 
+  it("a changed-test item shows the test's line diff since its baseline", () => {
+    const pause = section(workflow("build"), /Decision Pause/);
+    const rule = pause.split("\n").find((l) => l.includes("`PAUSE_QUESTION` = `CHANGED_TESTS`"));
+    expect(rule, "§ Decision Pause has no CHANGED_TESTS item rule").toBeDefined();
+    expect(rule).toMatch(/\bdiff\b/);
+    expect(rule).toMatch(/baseline/);
+  });
+
+  it("the code prompts say a BLOCKED line lets through only a change that adds lines", () => {
+    for (const name of ["bkit-build-plan-tasks", "bkit-build-plan-gaps-remediate"]) {
+      const text = keepCase(prompt(name));
+      expect(text, `${name}: no add-only guidance`).toMatch(/adds? lines|only adds|additive/i);
+      expect(text, `${name}: no refusal of removed lines`).toMatch(
+        /(removes?|rewrites?)[^.\n]*(planned test's lines|lines)[^.\n]*refused|refused[^.\n]*(removes?|rewrites?)/i,
+      );
+    }
+  });
+
   it("the verify prompt notes a planned test a code step changed and raises no gap", () => {
     const lines = prompt("bkit-build-plan-verify").split("\n");
     const at = lines.findIndex((l) => l.includes("`Changed by a code step` section"));
diff --git a/.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts b/.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts
index f1a009096..759ec789e 100644
--- a/.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts
+++ b/.bkit/core/engine/commands/workflow/planned-test-lock.integration.test.ts
@@ -223,12 +223,13 @@ describe("the planned-test lock across groups", () => {
     );
     expect(green.json.gaps).toEqual([]);
     expect(green.json.changed).toEqual([
-      {
+      expect.objectContaining({
         task: 1,
         test: FIRST.file,
         name: FIRST.name,
         reason: "the new src/c.ts needs setup()",
-      },
+        additive: true,
+      }),
     ]);
     expect(fs.readFileSync(path.join(cwd, "logs/green.md"), "utf-8")).toContain(
       "## Changed by a code step",
diff --git a/.bkit/core/engine/commands/workflow/steps.test.ts b/.bkit/core/engine/commands/workflow/steps.test.ts
index 91f63e005..511dab915 100644
--- a/.bkit/core/engine/commands/workflow/steps.test.ts
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -2156,6 +2156,24 @@ describe("bkit steps finish — the tests step touches only tests, the code step
   const later = (argv: string[], from: string, to: string) => argv.map((a) => a.replace(from, to));
   const textOfTest = (cwd: string) => fs.readFileSync(path.join(cwd, TEST.file), "utf-8");
 
+  /** The two-test file with `a` expectation lines added to the planned test and `b` to the other (changes that only add). */
+  const grown = (body: (p: string, o: string) => string, a: number, b: number) =>
+    body("1", "0")
+      .replace(
+        "    expect(addRow()).toBe(1);",
+        [
+          "    expect(addRow()).toBe(1);",
+          ...Array.from({ length: a }, (_, i) => `    expect(addRow()).toBeGreaterThan(${i});`),
+        ].join("\n"),
+      )
+      .replace(
+        "    expect(count()).toBe(0);",
+        [
+          "    expect(count()).toBe(0);",
+          ...Array.from({ length: b }, (_, i) => `    expect(count()).toBeGreaterThan(${i});`),
+        ].join("\n"),
+      );
+
   it("lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row", async () => {
     const { cwd, body } = twoTests();
     write(
@@ -2177,6 +2195,8 @@ describe("bkit steps finish — the tests step touches only tests, the code step
         testName: TEST.name,
         block: blockHash(textOfTest(cwd), TEST.name),
         reason: "new setup line",
+        blob: expect.any(String),
+        after: expect.any(String),
       },
     ]);
   });
@@ -2190,7 +2210,7 @@ describe("bkit steps finish — the tests step touches only tests, the code step
         .readFileSync(status, "utf-8")
         .replace(`"testName":"${TEST.name}"`, `"testName":"rows > ${TEST.name}"`),
     );
-    write(cwd, TEST.file, body("2", "0"));
+    write(cwd, TEST.file, grown(body, 1, 0));
     appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "needs a 2"));
     const r = await run(cwd, EXECUTE);
     expect(r.code).toBe(0);
@@ -2202,7 +2222,7 @@ describe("bkit steps finish — the tests step touches only tests, the code step
 
   it("lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test", async () => {
     const { cwd, body } = twoTests();
-    write(cwd, TEST.file, body("2", "0"));
+    write(cwd, TEST.file, grown(body, 1, 0));
     appendTo(cwd, "logs/remediate-1-log.md", blockedLine("Gap", 1, TEST.name, "gap fix needs a 2"));
     const r = await run(cwd, REMEDIATE);
     expect(r.code).toBe(0);
@@ -2238,7 +2258,7 @@ describe("bkit steps finish — the tests step touches only tests, the code step
 
   it("records only the changed test when a BLOCKED line also names an unchanged one", async () => {
     const { cwd, body } = withCountsRow();
-    write(cwd, TEST.file, body("2", "0"));
+    write(cwd, TEST.file, grown(body, 1, 0));
     appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "needs a 2"));
     appendTo(
       cwd,
@@ -2253,7 +2273,7 @@ describe("bkit steps finish — the tests step touches only tests, the code step
 
   it("refuses only the changed planned tests no BLOCKED line of the log names", async () => {
     const { cwd, body } = withCountsRow();
-    write(cwd, TEST.file, body("2", "3"));
+    write(cwd, TEST.file, grown(body, 1, 1));
     appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 2, "counts rows", "needs a 3"));
     const r = await run(cwd, EXECUTE);
     expect(r.code).toBe(11);
@@ -2262,7 +2282,7 @@ describe("bkit steps finish — the tests step touches only tests, the code step
 
   it("the refusal names the BLOCKED line the engine reads", async () => {
     const { cwd, body } = twoTests();
-    write(cwd, TEST.file, body("2", "2"));
+    write(cwd, TEST.file, grown(body, 1, 1));
     const r = await run(cwd, EXECUTE);
     expect(r.code).toBe(11);
     expect(r.json.problem).toMatch(/BLOCKED — TASK [^:]+: test `src\/a\.test\.ts` `adds a row` — /);
@@ -2275,7 +2295,7 @@ describe("bkit steps finish — the tests step touches only tests, the code step
 
   it("passes a later code step that leaves a BLOCKED change as it is", async () => {
     const { cwd, body } = twoTests();
-    write(cwd, TEST.file, body("2", "0"));
+    write(cwd, TEST.file, grown(body, 1, 0));
     appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "needs a 2"));
     expect((await run(cwd, EXECUTE)).code).toBe(0);
     expect(stepRows(cwd, "build-plan-tasks")[0]!.changedTests).toHaveLength(1);
@@ -2286,13 +2306,13 @@ describe("bkit steps finish — the tests step touches only tests, the code step
 
   it("refuses a later code step that changes a BLOCKED change again", async () => {
     const { cwd, body } = twoTests();
-    write(cwd, TEST.file, body("2", "0"));
+    write(cwd, TEST.file, grown(body, 1, 0));
     appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "needs a 2"));
     expect((await run(cwd, EXECUTE)).code).toBe(0);
     expect(stepRows(cwd, "build-plan-tasks")[0]!.changedTests).toEqual([
       expect.objectContaining({ testName: TEST.name }),
     ]);
-    write(cwd, TEST.file, body("3", "0"));
+    write(cwd, TEST.file, grown(body, 2, 0));
     copyLog(cwd, "logs/execute-1-log.md", "logs/execute-2-log.md");
     const r = await run(cwd, later(EXECUTE, "execute-1-log", "execute-2-log"));
     expect(r.code).toBe(11);
@@ -2301,10 +2321,10 @@ describe("bkit steps finish — the tests step touches only tests, the code step
 
   it("records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line", async () => {
     const { cwd, body } = twoTests();
-    write(cwd, TEST.file, body("2", "0"));
+    write(cwd, TEST.file, grown(body, 1, 0));
     appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "needs a 2"));
     expect((await run(cwd, EXECUTE)).code).toBe(0);
-    write(cwd, TEST.file, body("3", "0"));
+    write(cwd, TEST.file, grown(body, 2, 0));
     copyLog(
       cwd,
       "logs/execute-1-log.md",
@@ -2325,7 +2345,7 @@ describe("bkit steps finish — the tests step touches only tests, the code step
 
   it("uses a red the tests step recorded after a code step's change as the baseline", async () => {
     const { cwd, body } = twoTests();
-    write(cwd, TEST.file, body("2", "0"));
+    write(cwd, TEST.file, grown(body, 1, 0));
     appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "needs a 2"));
     expect((await run(cwd, EXECUTE)).code).toBe(0);
     expect(stepRows(cwd, "build-plan-tasks")[0]!.changedTests).toEqual([
@@ -2357,6 +2377,112 @@ describe("bkit steps finish — the tests step touches only tests, the code step
     expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
   });
 
+  /** The planned test's lines with `extra` expectation lines added after its first expect (a change that only adds). */
+  const addsLines = (body: string, ...extra: string[]) =>
+    body.replace(
+      "    expect(addRow()).toBe(1);",
+      ["    expect(addRow()).toBe(1);", ...extra.map((e) => `    ${e}`)].join("\n"),
+    );
+
+  it("refuses a code step that writes a planned test whose red recorded its file missing, exit 11", async () => {
+    const cwd = planned();
+    git(cwd, "rm", "-q", TEST.file);
+    git(cwd, "commit", "-qm", "the test file is not written yet");
+    redRow(cwd, {
+      tests: [{ task: 1, test: TEST.file, testName: TEST.name, state: "missing", blob: null }],
+    });
+    write(cwd, TEST.file, "it('adds a row', () => expect(true).toBe(true));\n");
+    write(cwd, "src/a.ts", "export const addRow = () => 1;\n");
+    const head = git(cwd, "rev-parse", "HEAD");
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(11);
+    expect(r.json.touched).toEqual([TEST.file]);
+    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
+  });
+
+  it("the refusal of a restored BLOCKED change names the recorded change as the lines to put back", async () => {
+    const { cwd, body } = twoTests();
+    write(cwd, TEST.file, addsLines(body("1", "0"), "expect(addRow()).toBeDefined();"));
+    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "needs a check"));
+    expect((await run(cwd, EXECUTE)).code).toBe(0);
+    expect(stepRows(cwd, "build-plan-tasks")[0]!.changedTests).toHaveLength(1);
+    // A later remediate step puts the test back as the tests step wrote it.
+    write(cwd, TEST.file, body("1", "0"));
+    write(cwd, "src/b.ts", "export const b = 2;\n");
+    copyLog(cwd, "logs/remediate-1-log.md", "logs/remediate-2-log.md");
+    const r = await run(cwd, later(REMEDIATE, "remediate-1-log", "remediate-2-log"));
+    expect(r.code).toBe(11);
+    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
+    expect(r.json.problem).not.toContain("as the tests step left it");
+    expect(r.json.problem).not.toContain("recorded at its red");
+    expect(r.json.problem).toMatch(/recorded change|changedTests/);
+  });
+
+  it("the refusal of a re-change says the logged reason is already recorded", async () => {
+    const { cwd, body } = twoTests();
+    write(cwd, TEST.file, addsLines(body("1", "0"), "expect(addRow()).toBeDefined();"));
+    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "needs a 2"));
+    expect((await run(cwd, EXECUTE)).code).toBe(0);
+    write(
+      cwd,
+      TEST.file,
+      addsLines(
+        body("1", "0"),
+        "expect(addRow()).toBeDefined();",
+        "expect(addRow()).not.toBeNull();",
+      ),
+    );
+    copyLog(cwd, "logs/execute-1-log.md", "logs/execute-2-log.md");
+    const r = await run(cwd, later(EXECUTE, "execute-1-log", "execute-2-log"));
+    expect(r.code).toBe(11);
+    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
+    expect(r.json.problem).toContain("needs a 2");
+    expect(r.json.problem).toMatch(/already recorded/);
+    expect(r.json.problem).toMatch(/new reason/);
+  });
+
+  it("refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11", async () => {
+    const { cwd, body } = twoTests();
+    write(cwd, TEST.file, body("1", "0").replace("    expect(addRow()).toBe(1);\n", ""));
+    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "the check is wrong"));
+    const head = git(cwd, "rev-parse", "HEAD");
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(11);
+    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
+    expect(r.json.problem).toMatch(/BLOCKED line cannot remove or loosen/);
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
+  });
+
+  it("refuses a code step whose BLOCKED-named change renames a planned test away, exit 11", async () => {
+    const { cwd, body } = twoTests();
+    write(cwd, TEST.file, body("1", "0").replace(TEST.name, "a renamed test"));
+    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "renamed it"));
+    const head = git(cwd, "rev-parse", "HEAD");
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(11);
+    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
+    expect(r.json.problem).toMatch(/BLOCKED line cannot remove or loosen/);
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
+  });
+
+  it("records the baseline blob on a BLOCKED-named change that only adds lines", async () => {
+    const { cwd, body } = twoTests();
+    write(cwd, TEST.file, addsLines(body("1", "0"), "expect(addRow()).toBeDefined();"));
+    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "an added check"));
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(0);
+    const [row] = stepRows(cwd, "build-plan-tasks");
+    const [record] = row!.changedTests as Array<Record<string, unknown>>;
+    expect(typeof record!.blob).toBe("string");
+    const read = spawnSync("git", ["cat-file", "-p", record!.blob as string], {
+      cwd,
+      encoding: "utf-8",
+    });
+    expect(read.status).toBe(0);
+    expect(read.stdout).toContain("expect(addRow()).toBe(1);");
+  });
+
   it("exit codes list 11 as planned tests touched and 15 as source touched in the tests step", () => {
     const codes = stepsCommand.verbs.finish!.exitCodes as Record<number, string>;
     expect(codes[11]).toMatch(/planned test/);
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index 0aaa56ec7..0f40368a8 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -104,6 +104,7 @@ import {
   readTestFirst,
   runPlanPath,
   touchedTests,
+  baselineDiff,
 } from "./tests.js";
 import { addAllButCopied } from "./worktrees.js";
 
@@ -1319,29 +1320,68 @@ async function finish(ctx: RunContext): Promise<number> {
     const blocked = logRead?.ok ? blockedTests(logRead.text) : [];
     const changedTests: Array<Record<string, unknown>> = [];
     const tests: Array<{ test: string; name: string }> = [];
+    /** Why each refused test is refused, in step with `tests`. */
+    const why: Array<{ fromChange: boolean; removed: boolean; reused: string | null }> = [];
     for (const c of changed) {
       const last = c.name.split(">").pop()!.trim();
-      const line = blocked.find(
-        (b) =>
-          b.test === c.test &&
-          (b.name === c.name || b.name === last) &&
-          !c.reasons.includes(b.reason),
+      const naming = blocked.filter(
+        (b) => b.test === c.test && (b.name === c.name || b.name === last),
       );
-      if (line === undefined) tests.push({ test: c.test, name: c.name });
-      else
+      const line = naming.find((b) => !c.reasons.includes(b.reason));
+      const diff = line === undefined ? null : baselineDiff(top, c.text, c.test, c.name);
+      // A test gone from the file (or renamed) against a recorded baseline removes its lines.
+      const removes = diff === null ? c.text !== null : !diff.additive;
+      if (line === undefined || removes) {
+        tests.push({ test: c.test, name: c.name });
+        why.push({
+          fromChange: c.fromChange,
+          removed: line !== undefined,
+          reused: line === undefined ? (naming[0]?.reason ?? null) : null,
+        });
+      } else {
+        const after = git(top, ["hash-object", "-w", "--", c.test]);
         changedTests.push({
           task: c.task,
           test: c.test,
           testName: c.name,
           block: c.block,
           reason: line.reason,
+          blob: c.text,
+          ...(after === null ? {} : { after }),
         });
+      }
     }
     if (tests.length === 0 && changedTests.length > 0) extras.changedTests = changedTests;
     if (tests.length > 0) {
       const touched = [...new Set(tests.map((t) => t.test))];
-      const named = tests.map((t) => `\`${t.test}\` "${t.name}"`).join(", ");
-      const problem = `${named} differ${tests.length === 1 ? "s" : ""} from what the group's tests step recorded at its red: a code step never edits a planned test case — put ${tests.length === 1 ? "that test" : "those tests"} back as the tests step left ${tests.length === 1 ? "it" : "them"} (other edits to the file stay), or keep the edit and log one line per test in the step's log: ${tests.map((t) => `BLOCKED — TASK {N}: test \`${t.test}\` \`${t.name}\` — {why}`).join("; ")} (Gap {N} in a gaps fix) (nothing written)`;
+      const nameOf = (t: { test: string; name: string }) => `\`${t.test}\` "${t.name}"`;
+      const named = tests.map(nameOf).join(", ");
+      const logLines = (list: typeof tests) =>
+        list.map((t) => `BLOCKED — TASK {N}: test \`${t.test}\` \`${t.name}\` — {why}`).join("; ");
+      const part = (fromChange: boolean) => {
+        const list = tests.filter((_, i) => why[i]!.fromChange === fromChange);
+        if (list.length === 0) return "";
+        const many = list.length > 1;
+        const subject = `${list.map(nameOf).join(", ")} differ${many ? "" : "s"} from`;
+        const them = many ? "those tests" : "that test";
+        const it = many ? "them" : "it";
+        return fromChange
+          ? `${subject} the change a code step already recorded for ${many ? "them" : "it"} (changedTests): put ${them} back as that recorded change left ${it}, or keep the edit and log one line per test in the step's log: ${logLines(list)}`
+          : `${subject} what the group's tests step recorded at its red: a code step never edits a planned test case — put ${them} back as the tests step left ${it} (other edits to the file stay), or keep the edit and log one line per test in the step's log: ${logLines(list)}`;
+      };
+      const notes: string[] = [];
+      for (const [i, t] of tests.entries()) {
+        const w = why[i]!;
+        if (w.removed)
+          notes.push(
+            `${nameOf(t)}: a BLOCKED line cannot remove or loosen a planned test's lines — it lets through only a change that adds lines`,
+          );
+        if (w.reused !== null)
+          notes.push(
+            `${nameOf(t)}: the BLOCKED line's reason "${w.reused}" is already recorded for that test — log a new reason`,
+          );
+      }
+      const problem = `${[part(false), part(true)].filter(Boolean).join(" | ")}${notes.length ? ` (${notes.join("; ")})` : ""} (Gap {N} in a gaps fix) (nothing written)`;
       ctx.log(problem);
       recordTestLockFriction(top, step, named);
       ctx.emit({
diff --git a/.bkit/core/engine/commands/workflow/tests.test.ts b/.bkit/core/engine/commands/workflow/tests.test.ts
index 7dcbd666a..d6d960c75 100644
--- a/.bkit/core/engine/commands/workflow/tests.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -2754,12 +2754,57 @@ describe("bkit tests red / green", () => {
       expect(r.code).toBe(0);
       expect(r.json.gaps).toEqual([]);
       expect(r.json.changed).toEqual([
-        { task: 1, test: TEST, name: NAME, reason: "new setup line" },
+        expect.objectContaining({ task: 1, test: TEST, name: NAME, reason: "new setup line" }),
       ]);
       expect(report()).toContain("## Changed by a code step");
       expect(report()).toContain("new setup line");
     });
 
+    it("green gives each changed test the line diff of its own lines since its baseline and whether it is additive", async () => {
+      await provenRed();
+      const baseline = fs.readFileSync(path.join(cwd, TEST), "utf-8");
+      const stored = spawnSync("git", ["hash-object", "-w", "--", TEST], {
+        cwd,
+        encoding: "utf-8",
+      }).stdout.trim();
+      const added = "  expect(clamp(5, 1, 10)).toBeGreaterThan(0);";
+      fs.writeFileSync(path.join(cwd, TEST), baseline.replace("});\n", `${added}\n});\n`));
+      writeStepRow(
+        cwd,
+        {
+          file: path.join(cwd, STATUS),
+          workflow: "build",
+          step: "build-plan-tasks",
+          group: 1,
+          attempt: 1,
+          artifacts: [],
+          extras: {
+            changedTests: [
+              {
+                task: 1,
+                test: TEST,
+                testName: NAME,
+                block: blockHash(fs.readFileSync(path.join(cwd, TEST), "utf-8"), NAME),
+                blob: stored,
+                reason: "an added check",
+              },
+            ],
+          },
+          commit: "none",
+        },
+        () => {},
+      );
+      vi.stubEnv("FAKE_EXIT", "0");
+      vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
+      const r = await green();
+      expect(r.code).toBe(0);
+      expect(r.json.changed).toEqual([
+        expect.objectContaining({ test: TEST, name: NAME, additive: true }),
+      ]);
+      expect(r.json.changed[0].diff).toContain(`+${added}`);
+      expect(r.json.changed[0].diff).not.toMatch(/^-\s+expect/m);
+    });
+
     it("green leaves a changed test the plan no longer names out of changed", async () => {
       writePlan([TASK_1, testTask(2, [[OTHER, "third"]])]);
       fs.writeFileSync(path.join(cwd, OTHER), "expect(clamp(0, 1, 10)).toBe(1);\n");
@@ -2778,7 +2823,9 @@ describe("bkit tests red / green", () => {
       vi.stubEnv("FAKE_EXIT", "0");
       vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
       const r = await green();
-      expect(r.json.changed).toEqual([{ task: 1, test: TEST, name: NAME, reason: "kept" }]);
+      expect(r.json.changed).toEqual([
+        expect.objectContaining({ task: 1, test: TEST, name: NAME, reason: "kept" }),
+      ]);
       expect(report()).not.toContain("dropped from the plan");
     });
 
diff --git a/.bkit/core/engine/commands/workflow/tests.ts b/.bkit/core/engine/commands/workflow/tests.ts
index ab5fc3d94..aa451d831 100644
--- a/.bkit/core/engine/commands/workflow/tests.ts
+++ b/.bkit/core/engine/commands/workflow/tests.ts
@@ -314,6 +314,12 @@ export interface TouchedDetail extends TouchedTest {
   task: number;
   /** The test's current block hash; null when no line names it. */
   block: string | null;
+  /** The blob of the baseline's text (the red's blob, or a change record's `after`); null when unknown. */
+  text: string | null;
+  /** The blob of the first baseline of the chain (the red's, or the first change's `blob`). */
+  origin: string | null;
+  /** True when the baseline is a code step's `changedTests` record. */
+  fromChange: boolean;
 }
 
 /** The lock's baseline for one planned test: its latest red or recorded change. */
@@ -322,6 +328,10 @@ export interface LockBaseline extends RedTest {
   reasons: string[];
   /** True when the newest record for this test is a code step's `changedTests` entry. */
   fromChange: boolean;
+  /** The blob of the baseline's text; null when unknown. */
+  text: string | null;
+  /** The blob of the chain's first baseline (what `tests green` diffs against); null when unknown. */
+  origin: string | null;
 }
 
 /**
@@ -348,7 +358,14 @@ export function lockBaselines(
           !RED_PROVEN.has(t.state) &&
           typeof earlier.block === "string" &&
           earlier.block === t.block;
-        if (!keepsProof) out.set(key, { ...t, reasons: earlier?.reasons ?? [], fromChange: false });
+        if (!keepsProof)
+          out.set(key, {
+            ...t,
+            reasons: earlier?.reasons ?? [],
+            fromChange: false,
+            text: t.blob,
+            origin: t.blob,
+          });
       }
     }
     if (Array.isArray(row.changedTests)) {
@@ -366,6 +383,8 @@ export function lockBaselines(
           blob: null,
           block: typeof c.block === "string" ? c.block : null,
           fromChange: true,
+          text: typeof c.after === "string" ? c.after : null,
+          origin: earlier?.origin ?? (typeof c.blob === "string" ? c.blob : null),
           reasons: [
             ...(earlier?.reasons ?? []),
             ...(typeof c.reason === "string" ? [c.reason] : []),
@@ -429,11 +448,14 @@ export function touchedTests(
         task: t.task,
         block: now,
         reasons: t.reasons,
+        text: t.text,
+        origin: t.origin,
+        fromChange: t.fromChange,
       });
     let block = t.block ?? null;
     if (block === null) block = blockHash(blobText(top, t.blob), t.testName);
     if (block === null) {
-      if (t.blob === null) {
+      if (t.blob === null && t.fromChange) {
         if (now !== null && t.reasons.length > 0) hit();
         continue;
       }
@@ -445,6 +467,24 @@ export function touchedTests(
   return touched;
 }
 
+/**
+ * The line diff of the test's own lines from the baseline text `blob` to the file now, and
+ * whether it only adds lines; null when either side cannot be read.
+ */
+export function baselineDiff(
+  top: string,
+  blob: string | null,
+  test: string,
+  name: string,
+): { additive: boolean; diff: string } | null {
+  const was = testBlock(blobText(top, blob), name);
+  const abs = path.join(top, test);
+  const now = fs.existsSync(abs) ? testBlock(fs.readFileSync(abs, "utf-8"), name) : null;
+  if (was === null || now === null) return null;
+  const d = lineDiff(was, now);
+  return { additive: d.removed === 0, diff: d.text };
+}
+
 /** The text a recorded blob holds, untrimmed; null when the object store lacks it. */
 function blobText(top: string, blob: string | null): string | null {
   if (blob === null) return null;
@@ -1426,6 +1466,9 @@ interface Changed {
   test: string;
   name: string;
   reason: string;
+  /** The test's own-line diff from its baseline; null when a side cannot be read. */
+  diff: string | null;
+  additive: boolean | null;
 }
 
 /**
@@ -1644,10 +1687,15 @@ function writeAuditReport(
       `- Task ${u.task} \`${u.test}\` "${u.name}" — ${u.detail}; the owner answers it at the end of the build`,
     );
   if (o.changed.length > 0) out.push("", "## Changed by a code step", "");
-  for (const c of o.changed)
+  for (const c of o.changed) {
     out.push(
       `- Task ${c.task} \`${c.test}\` "${c.name}" — a code step changed it under a BLOCKED line: ${c.reason}; the owner answers it at the end of the build`,
     );
+    if (c.diff !== null) {
+      const fence = fenceFor(c.diff);
+      out.push("", `  ${fence}diff`, ...c.diff.split("\n").map((l) => `  ${l}`), `  ${fence}`, "");
+    }
+  }
   for (const t of o.outputs) {
     const fence = fenceFor(t.tail);
     out.push("", `## Runner output — \`${t.test}\``, "", fence, t.tail, fence);
@@ -2295,7 +2343,7 @@ export const testsCommand: CommandSpec = {
         unproven:
           "[{task, test, name, detail}]: tests with no proven red (no build-tests-red row, or a state other than red, red-not-loaded, updated or passed-accepted) and no honoured TEST EXCEPTION; never a gap — the owner answers them once, at the end of the build",
         changed:
-          "[{task, test, name, reason}]: plan-named tests (every group) a code step changed under a BLOCKED line naming them (the step's changedTests record); never a gap — the owner answers them once, at the end of the build",
+          "[{task, test, name, reason, diff, additive}]: plan-named tests (every group) a code step changed under a BLOCKED line naming them (the step's changedTests record), with the diff of the test's own lines since its baseline and whether it only adds lines; never a gap — the owner answers them once, at the end of the build",
         updated:
           "[{task, test, name, base, additive, diff}]: existing tests the tests step changed (updated on the red row); base is the group's start commit; additive = the test's own lines since base gained lines and lost none (null when a side cannot be read), diff = their unified line diff; the verifier judges each diff — it may add expectations, never remove or loosen one",
         log: "where the report was written (as given)",
@@ -2375,6 +2423,10 @@ export const testsCommand: CommandSpec = {
             test: b.test,
             name: b.testName,
             reason: b.reasons.join("; "),
+            ...(() => {
+              const d = baselineDiff(top, b.origin, b.test, b.testName);
+              return { diff: d?.diff ?? null, additive: d?.additive ?? null };
+            })(),
           }));
         const rows: AuditRow[] = [];
         const outputs: Array<{ test: string; tail: string }> = [];
diff --git a/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md b/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
index 2f09e9f0b..a19eda08f 100644
--- a/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
+++ b/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
@@ -94,7 +94,7 @@ autoCompactWindow: 300000
    - `PIVOT` → identify why each earlier attempt failed. Try a different approach from the earlier attempts, and do not repeat one.
    - `FINAL` → run `pnpm bkit:deps:outdated`. Diagnose again: check that this is the right problem, whether the plan is flawed and whether the root cause lies upstream, and compare the result with each earlier attempt.
    - All strategies: do not edit, rename, move or delete a planned `TEST FIRST` test, and NEVER touch a `TEST EXCEPTION` field. Only the tests step rewrites a planned test. Other tests in the same file are yours to change: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
-   - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. The owner answers it at the end of the build.
+   - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. Under a `BLOCKED` line the engine passes a fix that only adds lines to the test's own lines; a fix that removes or rewrites any of the test's lines is refused, whatever the line says. The owner answers it at the end of the build.
    - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this round; they override the strategy's default angle. `Decision: Accept (assumed)` and `Decision: Fix now — recommended; applied without asking` are not the owner's words: an assumed accept is settled for this build (leave it), an unasked `Fix now` takes the recommendation.
 7. Fix the gaps in `priority` order. For each gap:
    - Apply a targeted fix by editing or creating source.
diff --git a/.bkit/core/prompts/bkit-build-plan-tasks.md b/.bkit/core/prompts/bkit-build-plan-tasks.md
index f916a4c59..632aecf42 100644
--- a/.bkit/core/prompts/bkit-build-plan-tasks.md
+++ b/.bkit/core/prompts/bkit-build-plan-tasks.md
@@ -108,7 +108,7 @@ autoCompactWindow: 300000
    - The task's `TEST FIRST` tests are already on disk: the tests step wrote them, and the engine recorded each one red before this step. Do not edit, rename, move or delete a planned test, and NEVER touch a `TEST EXCEPTION` field.
      - Other tests in the same file are yours to change, for example to fix a test your code breaks: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
      - **If** a planned test is wrong (it asserts what the task's `DONE WHEN` does not ask for, or fakes a value the real code cannot return) → append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` with Bash `echo >>`, and build the rest of the task.
-     - **If** a correct code change forces an edit to a planned test (for example new setup lines, with the assertions unchanged) → keep the edit and finish the task's code first. Then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed. Formatting a planned test file (for example `prettier --write`) counts as an edit. The engine lets the step through, and the owner answers the change at the end of the build.
+     - **If** a correct code change forces an edit to a planned test (for example new setup lines, with the assertions unchanged) → keep the edit and finish the task's code first. Then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed. Formatting a planned test file (for example `prettier --write`) counts as an edit. A `BLOCKED` line lets through only a change that adds lines to the test's own lines: a change that removes or rewrites any of the test's lines is refused, whatever the line says. The engine lets an adding change through, and the owner answers the change at the end of the build.
    - Build the task in this order:
      - Edit or create the source until the task's tests pass.
      - Refactor, keeping the tests green.
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index b57782729..21ece47e6 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -151,7 +151,7 @@ description: "Build Feature — Autonomous implementation"
      - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
      - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
    - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
-   - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept the change?`
+   - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason and the entry's `diff` (the test's own-line diff since its baseline, shown in a diff fence). Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept the change?`
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
    Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 1c502d4b9..4e5faf920 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -10332,7 +10332,7 @@ Re-read the issue's labels after the push, for the kill-switch check:
 Labels re-read before the close commit
 Lock released
 PR created
-**If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept the change?`
+**If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason and the entry's `diff` (the test's own-line diff since its baseline, shown in a diff fence). Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept the change?`
 **If** `CHANGED_TESTS` is not empty **and** no decision file holds the line `Question: CHANGED_TESTS` → `PAUSE_STEP` = 15, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `CHANGED_TESTS` → **Decision Pause**. Headless, it takes `Accept (assumed)` for each test, and ship asks the owner to confirm them.
 Changed planned tests asked once, or none left
 ```
@@ -11049,7 +11049,7 @@ Honour the brief's `Reuse Inventory rows` and `Architecture entries`:
 `PASS` = every pending task has a `DONE` log entry, and local lint and typecheck pass.
 `HANDOVER` = at least one pending task has neither a `DONE` nor a `BLOCKED` log entry, whether or not another task ended `BLOCKED`. When the turn cap is near, stop after the current task's log line and set this verdict. The caller re-runs with a fresh brief.
 `FAIL` = every pending task has a `DONE` or `BLOCKED` log entry, and at least one of these holds: a task ends `BLOCKED` with no later `DONE`, **or** local lint or typecheck fails.
-**If** a correct code change forces an edit to a planned test (for example new setup lines, with the assertions unchanged) → keep the edit and finish the task's code first. Then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed. Formatting a planned test file (for example `prettier --write`) counts as an edit. The engine lets the step through, and the owner answers the change at the end of the build.
+**If** a correct code change forces an edit to a planned test (for example new setup lines, with the assertions unchanged) → keep the edit and finish the task's code first. Then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed. Formatting a planned test file (for example `prettier --write`) counts as an edit. A `BLOCKED` line lets through only a change that adds lines to the test's own lines: a change that removes or rewrites any of the test's lines is refused, whatever the line says. The engine lets an adding change through, and the owner answers the change at the end of the build.
 ```
 
 #### bkit-build-plan-gaps-remediate
@@ -11078,7 +11078,7 @@ Fix those files in the same pass as the failure.
 **If** it cannot reach exit 0 → append `BLOCKED — Group gate: {reason}`.
 Never end on `PASS` from targeted test runs alone.
 `PASS` = every in-scope gap has a `DONE` line across the logs, the local tests pass, when Context names a group gate the log holds `DONE — Group gate: exit 0`, no test passed only on a rerun, and no warning needs a follow-up.
-**If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. The owner answers it at the end of the build.
+**If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. Under a `BLOCKED` line the engine passes a fix that only adds lines to the test's own lines; a fix that removes or rewrites any of the test's lines is refused, whatever the line says. The owner answers it at the end of the build.
 ```
 
 #### bkit-build-plan-tests
diff --git a/.bkit/version b/.bkit/version
index 6b3be22b8..ecc82874a 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -15,7 +15,7 @@
     ".bkit/.env.example": "33195c635ab4b35dea8990a278bb28193f4b5f331dcbdc5c975aeb5f51743e41",
     ".opencode/opencode.json": "83dbad6e236be57944702da355ea2d823db481408f14a4b9f522225d2ed27d75",
     ".claude/commands/bkit-auto.md": "2fb94062947b55466f7baed87ee27347e2626d6a43200691ff68cb7f62a0947f",
-    ".claude/commands/bkit-build.md": "ebd57125d9e7255150669b5e807b34fdd01d8e1cde402e57caed5aca4215249d",
+    ".claude/commands/bkit-build.md": "dba107e3e8687f941ee4a07a7e6e9fd83c4586a734f081c3c2538002855ebd1e",
     ".claude/commands/bkit-debug.md": "025f3de595d6365f43d4f986b5e06e36c8ffa6441c7eb61be34f05150a3f7912",
     ".claude/commands/bkit-design.md": "0757693c8e91c830aa36220a928a72d81aedb72cc51207364319214bd3902c6a",
     ".claude/commands/bkit-plan.md": "10d26eccf148db714a03d5883f1a95722dcab09d29c34d3532245e188ff4abe2",
@@ -23,7 +23,7 @@
     ".claude/agents/bkit-build-challenge-1.md": "20ff6fcaf48d5a6418c696c88e796101c34083326b8353bf6ec766422c4c734f",
     ".claude/agents/bkit-build-challenge-2.md": "0ef8a829af9b89602a75ac257a093e4a47169ca9c2a4c216d6f11937e2e9c48f",
     ".claude/agents/bkit-build-install-skills.md": "0249b5fe6550c45afe95972d1d3f4a65f7e159a74038ce9179ca1fceb29e1d12",
-    ".claude/agents/bkit-build-plan-gaps-remediate.md": "ac0fdf71f2234bf30b3059201f2c3bd69be508f6e30703ec69710ae1c9f3d206",
+    ".claude/agents/bkit-build-plan-gaps-remediate.md": "e93d736b4b17fb637e2dee5337a8ab8d380c8dbcdc2f571ad8f10324ab3817da",
     ".claude/agents/bkit-build-plan-verify.md": "55f0f91f32b53910bd01836aa63cd956487c768213615d76229ca20848acbadd",
     ".claude/agents/bkit-debug-abort-handover.md": "4d2ed067a5933578768325379269f51357365d7740986a2de580f022bace0a26",
     ".claude/agents/bkit-debug-failure-diagnose.md": "9169cb6210ffbe5a0d6237e81da9f7299067a0db2bdff6a35af6961ce608caa9",
@@ -47,7 +47,7 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "1b7656fc438127f67b566c9f532e6a39649c79e1bda1814608a4f3d44daed45b",
     ".claude/agents/bkit-utility-update-documentation.md": "58eef51a24cbbd53a16c12cf603888fc4a98963bb7dadbde0b60a7e3207eb43c",
     ".cursor/commands/bkit-auto.md": "f363b93008d334ca20e3825f5a734cd5cd0b5ad27e4287c0231985702653826a",
-    ".cursor/commands/bkit-build.md": "951644daccc82ffd8af27cee3e0402d6bfb8f91715728284126800f92f35fd32",
+    ".cursor/commands/bkit-build.md": "0e902a87d932727c13be26dbf69fa359f034999af6b286f03311eb2e412efd8f",
     ".cursor/commands/bkit-debug.md": "c59d2b8a4f7577d5ac23d9454718097943831916340f87655b1cfdca6641305b",
     ".cursor/commands/bkit-design.md": "8129e74e460ed742c62fb07830d099d365b6981c7094960eaeecd27811803e2b",
     ".cursor/commands/bkit-plan.md": "54493f905560e350148948e666c12b5f92b328bcab6af88608fdcee9006458c8",
@@ -55,7 +55,7 @@
     ".cursor/agents/bkit-build-challenge-1.md": "91f6446c505416d377dcbabcc49030e704384980f3ed232694069108504c2dab",
     ".cursor/agents/bkit-build-challenge-2.md": "6399d8b34ff1be2a63b77b911fd8321f80bd0bf64550103f809cdf5194820c24",
     ".cursor/agents/bkit-build-install-skills.md": "9f77d5ce2bc7e5d1c60d8860b5a06d81091f9194522607151a76838fc895da6d",
-    ".cursor/agents/bkit-build-plan-gaps-remediate.md": "e8424b2a1653bb0b45e1d9fc839188b80c98fc0a6ad396a9685ed3fc2e8361e2",
+    ".cursor/agents/bkit-build-plan-gaps-remediate.md": "369b1c5eb37e9f1643e57d6e4072efe0c900850ab1641958b0af08038ee79a61",
     ".cursor/agents/bkit-build-plan-verify.md": "cf5291114dd422ea1beb210fdec165e34afa932dae68a72c6c27ddfbfcc13d4d",
     ".cursor/agents/bkit-debug-abort-handover.md": "dbe3697156bb2068701efe79242d9e7d3554206fa266e26772bc74537c946ea9",
     ".cursor/agents/bkit-debug-failure-diagnose.md": "83da231f51d4526c7a6235475b2c40c872dc58e973e9ac30b5c9e85c98377229",
@@ -81,7 +81,7 @@
     ".opencode/agents/bkit-build-challenge-1.md": "f279a1470feb7e542494b9fcc69b7dff1ad8e1d7c19190472b76f0734e59f744",
     ".opencode/agents/bkit-build-challenge-2.md": "9c8bdb5092b44f070468b82d88d9457ab58193d7f5697300877fc96779400e9d",
     ".opencode/agents/bkit-build-install-skills.md": "56687e9967e11c8e3ddc0c965a4818898d2ad61cc279af30ea862390eb245b8d",
-    ".opencode/agents/bkit-build-plan-gaps-remediate.md": "58d97666cee4c05944b0e7a2014a5cec11c8aa9cbb9f9e0744da24beaaf63c4d",
+    ".opencode/agents/bkit-build-plan-gaps-remediate.md": "a93f5c7635a085180866dee272198c81ca0607470ed16fa603f72137ddd22954",
     ".opencode/agents/bkit-build-plan-verify.md": "3d98d057977f9ed4a2cb2e6b7a7bccd1c8ac66f06c3f605ce7e0f2bdcc22c246",
     ".opencode/agents/bkit-debug-abort-handover.md": "924dddce677e294ff9391e38e9d563b16ce14ca527db0167386dfb0898ea44a9",
     ".opencode/agents/bkit-debug-failure-diagnose.md": "341bbb7bc59750b9fd5979eb1fc715bf8a289c6b3ed86a61a976e4d6d770977f",
@@ -105,7 +105,7 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "f2f08f6e4de6311dd5f6a4f0573b234d31bae1e0f5d1c4c071969ca978140ee9",
     ".opencode/agents/bkit-utility-update-documentation.md": "5b274f7a0f331ee4c1ea2bcfc44a5d7855e0756e94e99dafd3d17ef942f3a032",
     ".opencode/commands/bkit-auto.md": "973d91ed58716f8b8be1009c3f2f686051cf1c8a617b14c3775814e7b356debb",
-    ".opencode/commands/bkit-build.md": "516773cf530f39b0829fb3b4f75929e371f235ec372aef6b7e9f0784caf4032d",
+    ".opencode/commands/bkit-build.md": "f69ed6c9af3535795ea0d066a6a745f1133eab96f384275f16e174ad75441707",
     ".opencode/commands/bkit-debug.md": "6a54040b8fb2bb18f98eac785ef39463ef216726e9660890eb6aab9b99cb3ee6",
     ".opencode/commands/bkit-design.md": "0d78ce47215552943f6628ddb8fadcae403ab219413e331289349b65e9955953",
     ".opencode/commands/bkit-plan.md": "d7d6d757dec7dfefe9630b273ab0348de156e2af4dc723519ce33f2db751b0b8",
@@ -121,7 +121,7 @@
     ".codex/agents/bkit-build-challenge-2.toml": "ccb61eb11b5a8b664e8c2c0135122300a2f867a490fca5b14a81e79c9ab4809f",
     ".codex/agents/bkit-build-install-skills.toml": "ed158a6f987f24f5b0f83919e610cd7574605d2f794ffcd748eec6b12e314a76",
     ".codex/agents/bkit-build-plan-current.toml": "339cd3e95a5a7e23caf8c21de8b04866a96d47cd494c4e2f6766aeb202c355b2",
-    ".codex/agents/bkit-build-plan-gaps-remediate.toml": "581b1bb6c1f976128d3df514cf205ab795c4c65228fe187dcb310e1e0a47cde8",
+    ".codex/agents/bkit-build-plan-gaps-remediate.toml": "6096cb067c74150ab5bef21dfa304268612d6b530440d0613fa17820d70f4461",
     ".codex/agents/bkit-build-plan-verify.toml": "9e0c0c9a096c4e6d4d3426a85cbd53ed03d2c37c47e499d332f1acf6f2b22c8a",
     ".codex/agents/bkit-debug-abort-handover.toml": "1683aa233cc3b353fc32f5e73699961b326fa9466133b1ced2d674c95fd0bd7f",
     ".codex/agents/bkit-debug-failure-diagnose.toml": "4542279af7a5585e4bd711a0bae836f398a644b0cac09519aed8251a78249a36",
@@ -214,7 +214,7 @@
     ".bkit/providers.md": "e87503c7cc4d045997c30ea315f76438589abc9bcf038f63ce291ca85b8f1e1f",
     ".bkit/prompts.md": "914cc05f5df0cf70f6d82a9aaf5345c799b8fb20b63a78a3e86fd2852b9b1716",
     ".bkit/trackers.md": "c3b91b7ffcf75333bc2d09af7c9d887397850539b87b964441025e8978f41803",
-    ".bkit/workflows.md": "b06fcb6b9f1156f8f767808e443d785098055292d5c7505a2b1a30b31499efa2",
+    ".bkit/workflows.md": "55322325cdaa07bc7c66436557dbc9715351d32402cb64d788a7cb1e1f6a45b6",
     ".bkit/README.md": "7e46439319d2c1befb9ee4f1ff7fb2d4ffdf442bc7bc0f45217704b1cc4dceb5",
     ".cursor/rules/bkit-rules.mdc": "0c15e475a322bd66f4f2258b5ffc2a6700bb9c9d217a75fa18d8168c9e1106e8",
     ".claude/hooks/bkit-gateguard.cjs": "c49a6b4aa6289f9eacf5cda6fced12a9811a244bd50948c2ef5cdb2741ea848f",
@@ -259,10 +259,10 @@
     ".cursor/agents/bkit-build-plan-tests.md": "d8090b4065d6ba337ea522926c254a5f4a11681d7afaa47090056b71952e4dc7",
     ".opencode/agents/bkit-build-plan-tests.md": "92d4a922d62cf7d913dedf18bc3910f9333fbba3b93ba23ea341e6971b1aa6b6",
     ".codex/agents/bkit-build-plan-tests.toml": "d97cd961547fd7bc48b24777626093fd8f7261310a1491c04a801116078641f1",
-    ".claude/agents/bkit-build-plan-tasks.md": "ec2a0a404f14305bc5f7ae663dd374f0d470fa4601bf14b8b630cd2259f4f4d5",
-    ".cursor/agents/bkit-build-plan-tasks.md": "4126223305b54d608d2cd28f69ca4d2f2a52da0b98a98577c225fd73d7131d82",
-    ".opencode/agents/bkit-build-plan-tasks.md": "2bc369483a60ef3629c14f9f78f71c7257029c2fd0c3a864044deaf723715bcf",
-    ".codex/agents/bkit-build-plan-tasks.toml": "07f179fb97586fea075a266e8043adc9d96a1c81fd2097754794f8f14354f615"
+    ".claude/agents/bkit-build-plan-tasks.md": "2e8fa595540605147eb4059c7412daeb7e82b280e90d3ee6b77acdfc1fa6cb8f",
+    ".cursor/agents/bkit-build-plan-tasks.md": "281c08fb26d0b78ba7372f902b201a3888661e89af0838574790a0bda1ae493b",
+    ".opencode/agents/bkit-build-plan-tasks.md": "f7514e742efeffc9baad3d592086fd21fddec608abb32a4450d77b23f51401c6",
+    ".codex/agents/bkit-build-plan-tasks.toml": "1864b00aecf2bf68d227cd1f125db1dcb7a8fac4263b0cb4acd384600e1d7651"
   },
   "claudeAllowDerived": [
     "WebFetch(domain:12factor.net)",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 906c93852..d33e73d22 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -992,7 +992,7 @@ One mechanism for every build question: verify gaps logged `Fixable: false`, a n
 - **Who asks:**
   - **If** `ask` is true and the run is not headless → the orchestrator asks, in session. Never a subagent, because subagents cannot reach the human.
   - **If** `ask` is false or the run is headless → `bkit decisions apply --by=headless` takes each recommendation. Exit 4 means hard blockers are left: in a session only those are asked; headless, the run takes the Failure Path.
-- **Changed tests (Step 15):** before the unproven ones, `bkit tests green` over the whole plan lists each planned test a code step changed under a `BLOCKED` line (`changed`). One pause, `Question: CHANGED_TESTS`, one item per test with the step's reason, options `Accept` / `Stop`, recommended `Accept`; asked once per run (a decision file with `Question: CHANGED_TESTS` already there skips it). Headless → `Accept (assumed)`, which ship asks the owner to confirm. The opening skip needs both `CHANGED_TESTS` and `UNPROVEN` answers, so `tests green` still runs when only one is answered.
+- **Changed tests (Step 15):** before the unproven ones, `bkit tests green` over the whole plan lists each planned test a code step changed under a `BLOCKED` line (`changed`). One pause, `Question: CHANGED_TESTS`, one item per test with the step's reason and the diff of its own lines since its baseline (`changed` carries `diff` and `additive`), options `Accept` / `Stop`, recommended `Accept`; asked once per run (a decision file with `Question: CHANGED_TESTS` already there skips it). Headless → `Accept (assumed)`, which ship asks the owner to confirm. The opening skip needs both `CHANGED_TESTS` and `UNPROVEN` answers, so `tests green` still runs when only one is answered.
 - **Unproven tests (Step 15):** before the summary, `bkit tests green` over the whole plan lists each planned test still `unproven` (never failed before its code existed). One pause, `Question: UNPROVEN`, one item per test, options `Accept` / `Stop`, recommended `Accept`; asked once per run (a decision file with `Question: UNPROVEN` already there skips it). Headless → `Accept (assumed)`, which ship asks the owner to confirm. Route `summary` → Step 15.
 - **Hard blockers:** the unfixable gaps (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, and holistic gaps logged `Fixable: false`) and `**Fixable:** false` challenge findings. No recommendation; "yes" never answers one. `Fix now` on one needs the owner's direction: with none, the pause asks what the fix should do and builds no task.
 - **Accept** by the owner: written ONLY after explicit human approval of that item. Agents NEVER write one on their own judgement. An `exception-refused` gap or an `UNPROVEN` item → a `**TEST EXCEPTION:**` field in the task's block, committed alone (`git commit -- {plan}`) so `tests green` honours them; each entry ends `— {reason} (owner, {YYYY-MM-DD})`, and the field replaces the task's existing one, never a second, so the plan-alone commit always changes its lines and blame points at it; other → `docs/decisions.jsonl` row (`by.step` `build-decision`, `rationale` `accepted by owner: …`). Verify and `bkit challenge merge` read `build-decision-*.md` and drop accepted items. An accepted challenge task is also ticked `[x]` and its title ends ` — accepted by owner`, so the summary does not count it as unfinished. Group-gate failures are never items.
@@ -1799,7 +1799,7 @@ Every plan task block carries a `**TEST FIRST:**` field — one sub-bullet per t
 | Unproven (Step 15) | orchestrator runs `bkit tests green` over the whole plan, log `build-tests-green-final.md` | `unproven` non-empty → one § Decision Pause (`UNPROVEN`), one `Accept` / `Stop` item per test; `Accept` writes a `TEST EXCEPTION`. Asked once per run. |
 
 - **The report, never the exit code:** a misspelled path, a syntax error, and an import of unwritten code all exit non-zero like a real failure; a test-name filter matching nothing exits 0 with the test skipped. Only the named test's own outcome counts, except that when no case carries the planned name and the report holds no case, or every case is non-passing with a name containing the file's stem, the file is `red-not-loaded` (per-runner commands: `docs/testing.md` § Test first): the tests step writes no source, so an import of unwritten code is the expected shape of a red.
-- **Each planned test case is locked, not its file:** the red row records each planned test file's git blob, written into the local object store (`hash-object -w`) so the content is recoverable while something references it, and each test's `block`: the sha-1 of its own lines. Its lines start on the first line naming it as a quoted string (else as a whole word) that is no comment and opens no suite (`describe`, `context`, `suite`, a class), or on the line before when that line ends with `(`, and run through every deeper-indented line plus one closing line (`}`, `)`, `]`, `end`) at the start's indent; the reader needs only the name and indentation, so it works for any framework. `steps finish` on the code steps (`build-plan-tasks`, `build-plan-gaps-remediate`, `build-plan-gaps-remediate-holistic`) re-hashes each planned test the plan names, of every group with a red row, and refuses the step when one differs from its baseline (the block its red recorded, or the block of a later `changedTests` record): exit 11, `tests` names each `{test, name}`, `touched` their files, nothing committed, `reask` names the agent; a test named by a ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` line (`Gap {N}` for the gap fixes) in the step's log is let through instead and recorded in the step row's `changedTests` (its reason, its new block), which becomes the test's next baseline; the orchestrator re-asks once (put that test back, keep the other edits, or log that line and the `DONE` line again), then Failure Path. Each refusal appends an `agent-rework` friction row. Other tests in the same file, helpers and new tests are free to change. A row with no `block` (no line carried the name, or the row predates per-test locking) derives the block from the recorded blob at check time; only when that holds no block either does the check fall back to the whole-file blob.
+- **Each planned test case is locked, not its file:** the red row records each planned test file's git blob, written into the local object store (`hash-object -w`) so the content is recoverable while something references it, and each test's `block`: the sha-1 of its own lines. Its lines start on the first line naming it as a quoted string (else as a whole word) that is no comment and opens no suite (`describe`, `context`, `suite`, a class), or on the line before when that line ends with `(`, and run through every deeper-indented line plus one closing line (`}`, `)`, `]`, `end`) at the start's indent; the reader needs only the name and indentation, so it works for any framework. `steps finish` on the code steps (`build-plan-tasks`, `build-plan-gaps-remediate`, `build-plan-gaps-remediate-holistic`) re-hashes each planned test the plan names, of every group with a red row, and refuses the step when one differs from its baseline (the block its red recorded, or the block of a later `changedTests` record): exit 11, `tests` names each `{test, name}`, `touched` their files, nothing committed, `reask` names the agent; a test named by a ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` line (`Gap {N}` for the gap fixes) in the step's log is let through instead, only when it adds lines to the test's own lines and removes none (a removal or rewrite is refused even under that line; a reason already recorded for the test does not count again), and recorded in the step row's `changedTests` (its reason, its new block, the baseline `blob` stored with `hash-object -w` and the `after` blob), which becomes the test's next baseline; the orchestrator re-asks once (put that test back, keep the other edits, or log that line and the `DONE` line again), then Failure Path. Each refusal appends an `agent-rework` friction row. Other tests in the same file, helpers and new tests are free to change. A row with no `block` (no line carried the name, or the row predates per-test locking) derives the block from the recorded blob at check time; only when that holds no block either does the check fall back to the whole-file blob.
 - **Literal names:** a planned name must be a `<testcase name>` the repo's `bkit:test:file` writes (red and green match a case whose name equals it or ends with ` {name}`); a runner that reports one case per file means the plan names the file (per-runner commands: `docs/testing.md` § Test first). The lock finds a test by its name, so a planned test carries its name as a literal string: no `it.each` / `@pytest.mark.parametrize` row and no template string builds it. A plan may name a test by its suite path as a JUnit report does (`suite > test`); red and green match that path as a suffix of the case name, and the lock finds the test by the last `>` segment when no line carries the whole path.
 - **Updating an existing test:** a `TEST FIRST` line may name a test that already exists (`tests plan-check` lists such names under `existing`, reported only). The tests step may add expectations to it, never remove or loosen one. If it passes after that, the red records it `updated` with the group's start commit as `base`, and verify reads its diff since `base` against that rule. The tests brief lists each such test under `Planned tests that already exist` with the line it starts on (`exists at {file}:{line}`), so the tests step updates it in place rather than writing a second test of that name. A loosened update is `test-loosened`: the first time `Fixable: true`, answered by the tests step (Step 9 sends the test back to it: removed or loosened expectations restored as at `base`, additions kept, the red recorded again, Step 8 re-run), never by the owner or a code step; loosened again → `Fixable: false` → § Decision Pause.
 - **Resume-safe:** neither step ticks tasks. A resumed or handed-over group re-runs Step 7: the tests brief leaves out every test the group's red rows already proved and names no task with none left, the red skips those tests, the code brief leaves out the `DONE` tasks. A `passed-accepted` test is already landed: `DONE WHEN` already holds with no task code written → execute logs `DONE — TASK N: already landed`; never code undone to force a red.
diff --git a/.claude/agents/bkit-build-plan-gaps-remediate.md b/.claude/agents/bkit-build-plan-gaps-remediate.md
index ae06b4a7b..c9a62bde3 100644
--- a/.claude/agents/bkit-build-plan-gaps-remediate.md
+++ b/.claude/agents/bkit-build-plan-gaps-remediate.md
@@ -95,7 +95,7 @@ autoCompactWindow: 300000
    - `PIVOT` → identify why each earlier attempt failed. Try a different approach from the earlier attempts, and do not repeat one.
    - `FINAL` → run `pnpm bkit:deps:outdated`. Diagnose again: check that this is the right problem, whether the plan is flawed and whether the root cause lies upstream, and compare the result with each earlier attempt.
    - All strategies: do not edit, rename, move or delete a planned `TEST FIRST` test, and NEVER touch a `TEST EXCEPTION` field. Only the tests step rewrites a planned test. Other tests in the same file are yours to change: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
-   - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. The owner answers it at the end of the build.
+   - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. Under a `BLOCKED` line the engine passes a fix that only adds lines to the test's own lines; a fix that removes or rewrites any of the test's lines is refused, whatever the line says. The owner answers it at the end of the build.
    - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this round; they override the strategy's default angle. `Decision: Accept (assumed)` and `Decision: Fix now — recommended; applied without asking` are not the owner's words: an assumed accept is settled for this build (leave it), an unasked `Fix now` takes the recommendation.
 7. Fix the gaps in `priority` order. For each gap:
    - Apply a targeted fix by editing or creating source.
diff --git a/.claude/agents/bkit-build-plan-tasks.md b/.claude/agents/bkit-build-plan-tasks.md
index 3a71d7264..e8c1b19de 100644
--- a/.claude/agents/bkit-build-plan-tasks.md
+++ b/.claude/agents/bkit-build-plan-tasks.md
@@ -109,7 +109,7 @@ autoCompactWindow: 300000
    - The task's `TEST FIRST` tests are already on disk: the tests step wrote them, and the engine recorded each one red before this step. Do not edit, rename, move or delete a planned test, and NEVER touch a `TEST EXCEPTION` field.
      - Other tests in the same file are yours to change, for example to fix a test your code breaks: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
      - **If** a planned test is wrong (it asserts what the task's `DONE WHEN` does not ask for, or fakes a value the real code cannot return) → append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` with Bash `echo >>`, and build the rest of the task.
-     - **If** a correct code change forces an edit to a planned test (for example new setup lines, with the assertions unchanged) → keep the edit and finish the task's code first. Then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed. Formatting a planned test file (for example `prettier --write`) counts as an edit. The engine lets the step through, and the owner answers the change at the end of the build.
+     - **If** a correct code change forces an edit to a planned test (for example new setup lines, with the assertions unchanged) → keep the edit and finish the task's code first. Then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed. Formatting a planned test file (for example `prettier --write`) counts as an edit. A `BLOCKED` line lets through only a change that adds lines to the test's own lines: a change that removes or rewrites any of the test's lines is refused, whatever the line says. The engine lets an adding change through, and the owner answers the change at the end of the build.
    - Build the task in this order:
      - Edit or create the source until the task's tests pass.
      - Refactor, keeping the tests green.
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index c6faaeb5b..58e687abb 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -132,7 +132,7 @@ description: "Build Feature — Autonomous implementation"
      - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
      - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
    - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
-   - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept the change?`
+   - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason and the entry's `diff` (the test's own-line diff since its baseline, shown in a diff fence). Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept the change?`
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
    Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
diff --git a/.codex/agents/bkit-build-plan-gaps-remediate.toml b/.codex/agents/bkit-build-plan-gaps-remediate.toml
index 97c66f68e..2f0f975f4 100644
--- a/.codex/agents/bkit-build-plan-gaps-remediate.toml
+++ b/.codex/agents/bkit-build-plan-gaps-remediate.toml
@@ -82,7 +82,7 @@ developer_instructions = """
    - `PIVOT` → identify why each earlier attempt failed. Try a different approach from the earlier attempts, and do not repeat one.
    - `FINAL` → run `pnpm bkit:deps:outdated`. Diagnose again: check that this is the right problem, whether the plan is flawed and whether the root cause lies upstream, and compare the result with each earlier attempt.
    - All strategies: do not edit, rename, move or delete a planned `TEST FIRST` test, and NEVER touch a `TEST EXCEPTION` field. Only the tests step rewrites a planned test. Other tests in the same file are yours to change: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
-   - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. The owner answers it at the end of the build.
+   - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. Under a `BLOCKED` line the engine passes a fix that only adds lines to the test's own lines; a fix that removes or rewrites any of the test's lines is refused, whatever the line says. The owner answers it at the end of the build.
    - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this round; they override the strategy's default angle. `Decision: Accept (assumed)` and `Decision: Fix now — recommended; applied without asking` are not the owner's words: an assumed accept is settled for this build (leave it), an unasked `Fix now` takes the recommendation.
 7. Fix the gaps in `priority` order. For each gap:
    - Apply a targeted fix by editing or creating source.
diff --git a/.codex/agents/bkit-build-plan-tasks.toml b/.codex/agents/bkit-build-plan-tasks.toml
index 9b8d2be2c..33f79823e 100644
--- a/.codex/agents/bkit-build-plan-tasks.toml
+++ b/.codex/agents/bkit-build-plan-tasks.toml
@@ -96,7 +96,7 @@ developer_instructions = """
    - The task's `TEST FIRST` tests are already on disk: the tests step wrote them, and the engine recorded each one red before this step. Do not edit, rename, move or delete a planned test, and NEVER touch a `TEST EXCEPTION` field.
      - Other tests in the same file are yours to change, for example to fix a test your code breaks: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
      - **If** a planned test is wrong (it asserts what the task's `DONE WHEN` does not ask for, or fakes a value the real code cannot return) → append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` with Bash `echo >>`, and build the rest of the task.
-     - **If** a correct code change forces an edit to a planned test (for example new setup lines, with the assertions unchanged) → keep the edit and finish the task's code first. Then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed. Formatting a planned test file (for example `prettier --write`) counts as an edit. The engine lets the step through, and the owner answers the change at the end of the build.
+     - **If** a correct code change forces an edit to a planned test (for example new setup lines, with the assertions unchanged) → keep the edit and finish the task's code first. Then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed. Formatting a planned test file (for example `prettier --write`) counts as an edit. A `BLOCKED` line lets through only a change that adds lines to the test's own lines: a change that removes or rewrites any of the test's lines is refused, whatever the line says. The engine lets an adding change through, and the owner answers the change at the end of the build.
    - Build the task in this order:
      - Edit or create the source until the task's tests pass.
      - Refactor, keeping the tests green.
diff --git a/.cursor/agents/bkit-build-plan-gaps-remediate.md b/.cursor/agents/bkit-build-plan-gaps-remediate.md
index 295f12ba5..9bed2cd47 100644
--- a/.cursor/agents/bkit-build-plan-gaps-remediate.md
+++ b/.cursor/agents/bkit-build-plan-gaps-remediate.md
@@ -92,7 +92,7 @@ tools:
    - `PIVOT` → identify why each earlier attempt failed. Try a different approach from the earlier attempts, and do not repeat one.
    - `FINAL` → run `pnpm bkit:deps:outdated`. Diagnose again: check that this is the right problem, whether the plan is flawed and whether the root cause lies upstream, and compare the result with each earlier attempt.
    - All strategies: do not edit, rename, move or delete a planned `TEST FIRST` test, and NEVER touch a `TEST EXCEPTION` field. Only the tests step rewrites a planned test. Other tests in the same file are yours to change: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
-   - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. The owner answers it at the end of the build.
+   - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. Under a `BLOCKED` line the engine passes a fix that only adds lines to the test's own lines; a fix that removes or rewrites any of the test's lines is refused, whatever the line says. The owner answers it at the end of the build.
    - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this round; they override the strategy's default angle. `Decision: Accept (assumed)` and `Decision: Fix now — recommended; applied without asking` are not the owner's words: an assumed accept is settled for this build (leave it), an unasked `Fix now` takes the recommendation.
 7. Fix the gaps in `priority` order. For each gap:
    - Apply a targeted fix by editing or creating source.
diff --git a/.cursor/agents/bkit-build-plan-tasks.md b/.cursor/agents/bkit-build-plan-tasks.md
index 371d77761..cb345c080 100644
--- a/.cursor/agents/bkit-build-plan-tasks.md
+++ b/.cursor/agents/bkit-build-plan-tasks.md
@@ -106,7 +106,7 @@ tools:
    - The task's `TEST FIRST` tests are already on disk: the tests step wrote them, and the engine recorded each one red before this step. Do not edit, rename, move or delete a planned test, and NEVER touch a `TEST EXCEPTION` field.
      - Other tests in the same file are yours to change, for example to fix a test your code breaks: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
      - **If** a planned test is wrong (it asserts what the task's `DONE WHEN` does not ask for, or fakes a value the real code cannot return) → append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` with Bash `echo >>`, and build the rest of the task.
-     - **If** a correct code change forces an edit to a planned test (for example new setup lines, with the assertions unchanged) → keep the edit and finish the task's code first. Then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed. Formatting a planned test file (for example `prettier --write`) counts as an edit. The engine lets the step through, and the owner answers the change at the end of the build.
+     - **If** a correct code change forces an edit to a planned test (for example new setup lines, with the assertions unchanged) → keep the edit and finish the task's code first. Then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed. Formatting a planned test file (for example `prettier --write`) counts as an edit. A `BLOCKED` line lets through only a change that adds lines to the test's own lines: a change that removes or rewrites any of the test's lines is refused, whatever the line says. The engine lets an adding change through, and the owner answers the change at the end of the build.
    - Build the task in this order:
      - Edit or create the source until the task's tests pass.
      - Refactor, keeping the tests green.
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index 61a8c08cc..9f81064cb 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -131,7 +131,7 @@ Build Feature — Autonomous implementation
      - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
      - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
    - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
-   - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept the change?`
+   - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason and the entry's `diff` (the test's own-line diff since its baseline, shown in a diff fence). Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept the change?`
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
    Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
diff --git a/.opencode/agents/bkit-build-plan-gaps-remediate.md b/.opencode/agents/bkit-build-plan-gaps-remediate.md
index d53b195eb..98b75459c 100644
--- a/.opencode/agents/bkit-build-plan-gaps-remediate.md
+++ b/.opencode/agents/bkit-build-plan-gaps-remediate.md
@@ -93,7 +93,7 @@ tools:
    - `PIVOT` → identify why each earlier attempt failed. Try a different approach from the earlier attempts, and do not repeat one.
    - `FINAL` → run `pnpm bkit:deps:outdated`. Diagnose again: check that this is the right problem, whether the plan is flawed and whether the root cause lies upstream, and compare the result with each earlier attempt.
    - All strategies: do not edit, rename, move or delete a planned `TEST FIRST` test, and NEVER touch a `TEST EXCEPTION` field. Only the tests step rewrites a planned test. Other tests in the same file are yours to change: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
-   - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. The owner answers it at the end of the build.
+   - **If** your fix forces a planned test to change (new setup lines, say, with the assertions unchanged) → keep that change, and finish the fix's code first. Then append ``BLOCKED — Gap {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the gap's `DONE` line. Running a formatter such as `prettier --write` over a planned test file is a change too. Under a `BLOCKED` line the engine passes a fix that only adds lines to the test's own lines; a fix that removes or rewrites any of the test's lines is refused, whatever the line says. The owner answers it at the end of the build.
    - **If** a decision record is supplied → follow the owner's words on its `Decision:` lines in this round; they override the strategy's default angle. `Decision: Accept (assumed)` and `Decision: Fix now — recommended; applied without asking` are not the owner's words: an assumed accept is settled for this build (leave it), an unasked `Fix now` takes the recommendation.
 7. Fix the gaps in `priority` order. For each gap:
    - Apply a targeted fix by editing or creating source.
diff --git a/.opencode/agents/bkit-build-plan-tasks.md b/.opencode/agents/bkit-build-plan-tasks.md
index 4cd80428e..1f10d5be9 100644
--- a/.opencode/agents/bkit-build-plan-tasks.md
+++ b/.opencode/agents/bkit-build-plan-tasks.md
@@ -107,7 +107,7 @@ tools:
    - The task's `TEST FIRST` tests are already on disk: the tests step wrote them, and the engine recorded each one red before this step. Do not edit, rename, move or delete a planned test, and NEVER touch a `TEST EXCEPTION` field.
      - Other tests in the same file are yours to change, for example to fix a test your code breaks: the engine locks each planned test case, not its file, and `steps finish` exit 11 names the planned test you edited.
      - **If** a planned test is wrong (it asserts what the task's `DONE WHEN` does not ask for, or fakes a value the real code cannot return) → append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` with Bash `echo >>`, and build the rest of the task.
-     - **If** a correct code change forces an edit to a planned test (for example new setup lines, with the assertions unchanged) → keep the edit and finish the task's code first. Then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed. Formatting a planned test file (for example `prettier --write`) counts as an edit. The engine lets the step through, and the owner answers the change at the end of the build.
+     - **If** a correct code change forces an edit to a planned test (for example new setup lines, with the assertions unchanged) → keep the edit and finish the task's code first. Then append ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (why the change is needed) and the task's `DONE` line, because `tasks open` counts any `BLOCKED` line as closed. Formatting a planned test file (for example `prettier --write`) counts as an edit. A `BLOCKED` line lets through only a change that adds lines to the test's own lines: a change that removes or rewrites any of the test's lines is refused, whatever the line says. The engine lets an adding change through, and the owner answers the change at the end of the build.
    - Build the task in this order:
      - Edit or create the source until the task's tests pass.
      - Refactor, keeping the tests green.
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index 45809024e..f56ae667f 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -135,7 +135,7 @@ $ARGUMENTS
      - **If** the item is `**Fixable:** false` → a hard blocker with options `["Accept", "Fix now", "Stop"]`.
      - **Else** → options `["Accept", "Fix now"]`, with a recommendation per finding.
    - **If** `PAUSE_QUESTION` = `TESTS_LOOP` → write no items: a failing suite test is never an item, and the loop question carries it.
-   - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept the change?`
+   - **If** `PAUSE_QUESTION` = `CHANGED_TESTS` → write one item per entry of `CHANGED_TESTS`, titled with its task number and test name. Each item is a planned test a code step had to change, with the step's reason and the entry's `diff` (the test's own-line diff since its baseline, shown in a diff fence). Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept the change?`
    - **If** `PAUSE_QUESTION` = `UNPROVEN` → write one item per entry of `UNPROVEN_TESTS`, titled with its task number and test name. Each item is a planned test that never failed before its code existed, so nothing shows it can catch the bug it was written for. Options `["Accept", "Stop"]`, recommended `Accept`. Its question ends `Accept it? You write the reason, and it is recorded as your TEST EXCEPTION.`
 
    Check a red gate against the base commit, the commit the branch started from. **If** `PAUSE_QUESTION` = `TESTS_LOOP` **or** `GATE_VERDICT` = FAIL → `GATE_LOG` = `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log` for `TESTS_LOOP`, else `{OUTBOX}/build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.log`:
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index b032afc19..b051fcd43 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -30,7 +30,7 @@ import { readHolder, resolveMonth, workflowLockPath } from "./locks.js";
 import { EXIT_NO_STATUS, FILE_FLAG, GROUP_FLAG, STEP_FLAG, WORKFLOW_FLAG, extraField, nonNegativeInt, positiveInt, readRuns, readStatusRows, readRunsAt, statusFile, str, } from "./status.js";
 import { COMMENT_FILE_OUTPUT, POST_FLAG, TRACKER_OUTPUT, commentFileOf, postForVerb, } from "./tracker.js";
 import { parsePlanBlocks } from "./plan-blocks.js";
-import { blockedTests, PLAN_TASKS_STEP, readTestFirst, runPlanPath, touchedTests, } from "./tests.js";
+import { blockedTests, PLAN_TASKS_STEP, readTestFirst, runPlanPath, touchedTests, baselineDiff, } from "./tests.js";
 import { addAllButCopied } from "./worktrees.js";
 /**
  * An `agent-rework` friction row for a refused planned-test edit: the step reruns, so
@@ -1052,28 +1052,64 @@ async function finish(ctx) {
         const blocked = logRead?.ok ? blockedTests(logRead.text) : [];
         const changedTests = [];
         const tests = [];
+        /** Why each refused test is refused, in step with `tests`. */
+        const why = [];
         for (const c of changed) {
             const last = c.name.split(">").pop().trim();
-            const line = blocked.find((b) => b.test === c.test &&
-                (b.name === c.name || b.name === last) &&
-                !c.reasons.includes(b.reason));
-            if (line === undefined)
+            const naming = blocked.filter((b) => b.test === c.test && (b.name === c.name || b.name === last));
+            const line = naming.find((b) => !c.reasons.includes(b.reason));
+            const diff = line === undefined ? null : baselineDiff(top, c.text, c.test, c.name);
+            // A test gone from the file (or renamed) against a recorded baseline removes its lines.
+            const removes = diff === null ? c.text !== null : !diff.additive;
+            if (line === undefined || removes) {
                 tests.push({ test: c.test, name: c.name });
-            else
+                why.push({
+                    fromChange: c.fromChange,
+                    removed: line !== undefined,
+                    reused: line === undefined ? (naming[0]?.reason ?? null) : null,
+                });
+            }
+            else {
+                const after = git(top, ["hash-object", "-w", "--", c.test]);
                 changedTests.push({
                     task: c.task,
                     test: c.test,
                     testName: c.name,
                     block: c.block,
                     reason: line.reason,
+                    blob: c.text,
+                    ...(after === null ? {} : { after }),
                 });
+            }
         }
         if (tests.length === 0 && changedTests.length > 0)
             extras.changedTests = changedTests;
         if (tests.length > 0) {
             const touched = [...new Set(tests.map((t) => t.test))];
-            const named = tests.map((t) => `\`${t.test}\` "${t.name}"`).join(", ");
-            const problem = `${named} differ${tests.length === 1 ? "s" : ""} from what the group's tests step recorded at its red: a code step never edits a planned test case — put ${tests.length === 1 ? "that test" : "those tests"} back as the tests step left ${tests.length === 1 ? "it" : "them"} (other edits to the file stay), or keep the edit and log one line per test in the step's log: ${tests.map((t) => `BLOCKED — TASK {N}: test \`${t.test}\` \`${t.name}\` — {why}`).join("; ")} (Gap {N} in a gaps fix) (nothing written)`;
+            const nameOf = (t) => `\`${t.test}\` "${t.name}"`;
+            const named = tests.map(nameOf).join(", ");
+            const logLines = (list) => list.map((t) => `BLOCKED — TASK {N}: test \`${t.test}\` \`${t.name}\` — {why}`).join("; ");
+            const part = (fromChange) => {
+                const list = tests.filter((_, i) => why[i].fromChange === fromChange);
+                if (list.length === 0)
+                    return "";
+                const many = list.length > 1;
+                const subject = `${list.map(nameOf).join(", ")} differ${many ? "" : "s"} from`;
+                const them = many ? "those tests" : "that test";
+                const it = many ? "them" : "it";
+                return fromChange
+                    ? `${subject} the change a code step already recorded for ${many ? "them" : "it"} (changedTests): put ${them} back as that recorded change left ${it}, or keep the edit and log one line per test in the step's log: ${logLines(list)}`
+                    : `${subject} what the group's tests step recorded at its red: a code step never edits a planned test case — put ${them} back as the tests step left ${it} (other edits to the file stay), or keep the edit and log one line per test in the step's log: ${logLines(list)}`;
+            };
+            const notes = [];
+            for (const [i, t] of tests.entries()) {
+                const w = why[i];
+                if (w.removed)
+                    notes.push(`${nameOf(t)}: a BLOCKED line cannot remove or loosen a planned test's lines — it lets through only a change that adds lines`);
+                if (w.reused !== null)
+                    notes.push(`${nameOf(t)}: the BLOCKED line's reason "${w.reused}" is already recorded for that test — log a new reason`);
+            }
+            const problem = `${[part(false), part(true)].filter(Boolean).join(" | ")}${notes.length ? ` (${notes.join("; ")})` : ""} (Gap {N} in a gaps fix) (nothing written)`;
             ctx.log(problem);
             recordTestLockFriction(top, step, named);
             ctx.emit({
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index 873e27a65..b7620202b 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -215,7 +215,13 @@ export function lockBaselines(rows, planned) {
                     typeof earlier.block === "string" &&
                     earlier.block === t.block;
                 if (!keepsProof)
-                    out.set(key, { ...t, reasons: earlier?.reasons ?? [], fromChange: false });
+                    out.set(key, {
+                        ...t,
+                        reasons: earlier?.reasons ?? [],
+                        fromChange: false,
+                        text: t.blob,
+                        origin: t.blob,
+                    });
             }
         }
         if (Array.isArray(row.changedTests)) {
@@ -236,6 +242,8 @@ export function lockBaselines(rows, planned) {
                     blob: null,
                     block: typeof c.block === "string" ? c.block : null,
                     fromChange: true,
+                    text: typeof c.after === "string" ? c.after : null,
+                    origin: earlier?.origin ?? (typeof c.blob === "string" ? c.blob : null),
                     reasons: [
                         ...(earlier?.reasons ?? []),
                         ...(typeof c.reason === "string" ? [c.reason] : []),
@@ -283,12 +291,15 @@ export function touchedTests(top, file, workflow, plan) {
             task: t.task,
             block: now,
             reasons: t.reasons,
+            text: t.text,
+            origin: t.origin,
+            fromChange: t.fromChange,
         });
         let block = t.block ?? null;
         if (block === null)
             block = blockHash(blobText(top, t.blob), t.testName);
         if (block === null) {
-            if (t.blob === null) {
+            if (t.blob === null && t.fromChange) {
                 if (now !== null && t.reasons.length > 0)
                     hit();
                 continue;
@@ -302,6 +313,19 @@ export function touchedTests(top, file, workflow, plan) {
     }
     return touched;
 }
+/**
+ * The line diff of the test's own lines from the baseline text `blob` to the file now, and
+ * whether it only adds lines; null when either side cannot be read.
+ */
+export function baselineDiff(top, blob, test, name) {
+    const was = testBlock(blobText(top, blob), name);
+    const abs = path.join(top, test);
+    const now = fs.existsSync(abs) ? testBlock(fs.readFileSync(abs, "utf-8"), name) : null;
+    if (was === null || now === null)
+        return null;
+    const d = lineDiff(was, now);
+    return { additive: d.removed === 0, diff: d.text };
+}
 /** The text a recorded blob holds, untrimmed; null when the object store lacks it. */
 function blobText(top, blob) {
     if (blob === null)
@@ -1210,8 +1234,13 @@ function writeAuditReport(log, o) {
         out.push(`- Task ${u.task} \`${u.test}\` "${u.name}" — ${u.detail}; the owner answers it at the end of the build`);
     if (o.changed.length > 0)
         out.push("", "## Changed by a code step", "");
-    for (const c of o.changed)
+    for (const c of o.changed) {
         out.push(`- Task ${c.task} \`${c.test}\` "${c.name}" — a code step changed it under a BLOCKED line: ${c.reason}; the owner answers it at the end of the build`);
+        if (c.diff !== null) {
+            const fence = fenceFor(c.diff);
+            out.push("", `  ${fence}diff`, ...c.diff.split("\n").map((l) => `  ${l}`), `  ${fence}`, "");
+        }
+    }
     for (const t of o.outputs) {
         const fence = fenceFor(t.tail);
         out.push("", `## Runner output — \`${t.test}\``, "", fence, t.tail, fence);
@@ -1818,7 +1847,7 @@ export const testsCommand = {
                 gaps: "[{task, kind, detail, fixable, logLine}]: no-test-first | test-first-malformed | test-first-unread (task null: a plan-level format problem) | not-green | exception-refused (a task whose only test field is a TEST EXCEPTION not honoured) | delete-still-referenced (a DELETE line's file still exists, or its name is still found in the tree); fixable is null when the gap needs a diff read; logLine is the line the verifier appends",
                 alreadyLanded: "[{task, test, name, reason}]: tests the tests step accepted as passing before any task code (passed-accepted on the red row); no red is due for them",
                 unproven: "[{task, test, name, detail}]: tests with no proven red (no build-tests-red row, or a state other than red, red-not-loaded, updated or passed-accepted) and no honoured TEST EXCEPTION; never a gap — the owner answers them once, at the end of the build",
-                changed: "[{task, test, name, reason}]: plan-named tests (every group) a code step changed under a BLOCKED line naming them (the step's changedTests record); never a gap — the owner answers them once, at the end of the build",
+                changed: "[{task, test, name, reason, diff, additive}]: plan-named tests (every group) a code step changed under a BLOCKED line naming them (the step's changedTests record), with the diff of the test's own lines since its baseline and whether it only adds lines; never a gap — the owner answers them once, at the end of the build",
                 updated: "[{task, test, name, base, additive, diff}]: existing tests the tests step changed (updated on the red row); base is the group's start commit; additive = the test's own lines since base gained lines and lost none (null when a side cannot be read), diff = their unified line diff; the verifier judges each diff — it may add expectations, never remove or loosen one",
                 log: "where the report was written (as given)",
             },
@@ -1897,6 +1926,10 @@ export const testsCommand = {
                     test: b.test,
                     name: b.testName,
                     reason: b.reasons.join("; "),
+                    ...(() => {
+                        const d = baselineDiff(top, b.origin, b.test, b.testName);
+                        return { diff: d?.diff ?? null, additive: d?.additive ?? null };
+                    })(),
                 }));
                 const rows = [];
                 const outputs = [];
diff --git a/docs/testing.md b/docs/testing.md
index 4e16478d6..18bbf2b5b 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -311,7 +311,7 @@ A plan's `Derived Test Matrix` (`docs/templates/bkit-plan.md`) applies this rubr
 - **Call the runner directly:** a task runner that caches results, or runs dependent packages' suites first, breaks the one-file contract. A monorepo routes the path to the package and config that own it. An integration file gets the same environment setup that the integration suite gets.
 - **Judged by the report, never the exit code:** a misspelled path, a syntax error and an import of unwritten code all exit non-zero, just like a real failure. A red counts when the named test ran and failed, or when its file failed to load: no case carries the planned name, and the report holds no case, or only non-passing cases whose name contains the file's stem (the tests step writes no source, so an import of unwritten code is the expected shape of a red); a green only when it ran and passed.
 - **Test name:** use the name as the runner reports it, or its last segment (`clamp > keeps a value inside the range` → `keeps a value inside the range`).
-- **The red test stays:** after the red, the test may gain tests or formatting. A weakened, removed or rewritten assertion fails the build's verify. A code step that must change a planned test (for example new setup lines a correct code change forces) keeps the edit and logs a `BLOCKED` line naming the test and why; `steps finish` lets it through, and the owner answers the change at the end of the build.
+- **The red test stays:** after the red, the test may gain tests or formatting. A weakened, removed or rewritten assertion fails the build's verify. A code step that must change a planned test (for example new setup lines a correct code change forces) keeps the edit and logs a `BLOCKED` line naming the test and why; `steps finish` lets it through only when the change adds lines and removes none (a removed or rewritten line is refused even under a `BLOCKED` line), and the owner answers the change, shown as a diff, at the end of the build.
 
 ## Tests lock
 
