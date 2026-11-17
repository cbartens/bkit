diff --git a/.bkit/core/engine/commands/workflow/steps.test.ts b/.bkit/core/engine/commands/workflow/steps.test.ts
index 29e2e66d3..91f63e005 100644
--- a/.bkit/core/engine/commands/workflow/steps.test.ts
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -2088,6 +2088,275 @@ describe("bkit steps finish — the tests step touches only tests, the code step
     expect(r.json.source).toEqual(["src/a.ts"]);
   });
 
+  /** The plan with group 1's task ticked (as Step 8's `tasks tick` leaves it) and a group 2 task after it. */
+  const TWO_GROUP_PLAN = [
+    PLAN.replace("- [ ] **TASK 1:**", "- [x] **TASK 1:**").trimEnd(),
+    "<!-- bkit:group 2 start -->",
+    "### GROUP 2: Others",
+    "<!-- bkit:task 2 start -->",
+    "- [ ] **TASK 2:** Add other",
+    "  - **CREATE:** `src/c.ts`: other",
+    "  - **DONE WHEN:** passes",
+    "  - **TEST FIRST:**",
+    "    - `src/c.test.ts` `does other` fails on the stub",
+    "<!-- bkit:task 2 end -->",
+    "<!-- bkit:group 2 end -->",
+    "",
+  ].join("\n");
+  const inGroup2 = (argv: string[]) => [
+    ...argv.map((a) => (a === "--group=1" ? "--group=2" : a)),
+    "--plan=plan.md",
+  ];
+
+  /** A repo whose group 1 red row stands, whose plan ticks group 1, and whose group 1 planned test is changed. */
+  function changedInOtherGroup() {
+    const cwd = planned();
+    write(cwd, "plan.md", TWO_GROUP_PLAN);
+    git(cwd, "commit", "-qam", "plan");
+    redRow(cwd);
+    write(cwd, TEST.file, "it('adds a row', () => expect(true).toBe(true));\n");
+    write(cwd, "src/c.ts", "export const other = 1;\n");
+    return cwd;
+  }
+
+  it("refuses the execute step when it changes another group's planned test, exit 11", async () => {
+    const cwd = changedInOtherGroup();
+    const head = git(cwd, "rev-parse", "HEAD");
+    const r = await run(cwd, inGroup2(EXECUTE));
+    expect(r.code).toBe(11);
+    expect(r.json.touched).toEqual([TEST.file]);
+    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
+  });
+
+  it("refuses the gaps-remediate step when it changes another group's planned test, exit 11", async () => {
+    const cwd = changedInOtherGroup();
+    const head = git(cwd, "rev-parse", "HEAD");
+    const r = await run(cwd, inGroup2(REMEDIATE));
+    expect(r.code).toBe(11);
+    expect(r.json.touched).toEqual([TEST.file]);
+    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
+  });
+
+  const blockedLine = (kind: "TASK" | "Gap", n: number, name: string, reason: string) =>
+    `BLOCKED — ${kind} ${n}: test \`${TEST.file}\` \`${name}\` — ${reason}\n`;
+  const appendTo = (cwd: string, rel: string, text: string) =>
+    fs.appendFileSync(path.join(cwd, rel), text);
+  const stepRows = (cwd: string, step: string) =>
+    fs
+      .readFileSync(path.join(cwd, STATUS), "utf-8")
+      .trim()
+      .split("\n")
+      .map((l) => JSON.parse(l) as Record<string, unknown>)
+      .filter((r) => r.type === "step-done" && r.step === step);
+  /** The log of a later attempt: the first log's text, then `extra`. */
+  const copyLog = (cwd: string, from: string, to: string, extra = "") =>
+    write(cwd, to, fs.readFileSync(path.join(cwd, from), "utf-8") + extra);
+  const later = (argv: string[], from: string, to: string) => argv.map((a) => a.replace(from, to));
+  const textOfTest = (cwd: string) => fs.readFileSync(path.join(cwd, TEST.file), "utf-8");
+
+  it("lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row", async () => {
+    const { cwd, body } = twoTests();
+    write(
+      cwd,
+      TEST.file,
+      body("1", "0").replace(
+        "  it('adds a row', () => {",
+        "  it('adds a row', () => {\n    setup();",
+      ),
+    );
+    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "new setup line"));
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(0);
+    const [row] = stepRows(cwd, "build-plan-tasks");
+    expect(row!.changedTests).toEqual([
+      {
+        task: 1,
+        test: TEST.file,
+        testName: TEST.name,
+        block: blockHash(textOfTest(cwd), TEST.name),
+        reason: "new setup line",
+      },
+    ]);
+  });
+
+  it("lets a code step through when its BLOCKED line names the changed test by the last segment of its name", async () => {
+    const { cwd, body } = twoTests();
+    const status = path.join(cwd, STATUS);
+    fs.writeFileSync(
+      status,
+      fs
+        .readFileSync(status, "utf-8")
+        .replace(`"testName":"${TEST.name}"`, `"testName":"rows > ${TEST.name}"`),
+    );
+    write(cwd, TEST.file, body("2", "0"));
+    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "needs a 2"));
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(0);
+    const [row] = stepRows(cwd, "build-plan-tasks");
+    expect(row!.changedTests).toEqual([
+      expect.objectContaining({ testName: `rows > ${TEST.name}`, reason: "needs a 2" }),
+    ]);
+  });
+
+  it("lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test", async () => {
+    const { cwd, body } = twoTests();
+    write(cwd, TEST.file, body("2", "0"));
+    appendTo(cwd, "logs/remediate-1-log.md", blockedLine("Gap", 1, TEST.name, "gap fix needs a 2"));
+    const r = await run(cwd, REMEDIATE);
+    expect(r.code).toBe(0);
+    const [row] = stepRows(cwd, "build-plan-gaps-remediate");
+    expect(row!.changedTests).toEqual([
+      expect.objectContaining({
+        test: TEST.file,
+        testName: TEST.name,
+        reason: "gap fix needs a 2",
+      }),
+    ]);
+  });
+
+  /** twoTests, plus a second planned test ("counts rows") recorded red at its committed lines. */
+  function withCountsRow() {
+    const fx = twoTests();
+    const text = fs.readFileSync(path.join(fx.cwd, TEST.file), "utf-8");
+    redRow(fx.cwd, {
+      attempt: 2,
+      tests: [
+        {
+          task: 2,
+          test: TEST.file,
+          testName: "counts rows",
+          state: "red",
+          blob: blobOf(fx.cwd, TEST.file),
+          block: blockHash(text, "counts rows"),
+        },
+      ],
+    });
+    return fx;
+  }
+
+  it("records only the changed test when a BLOCKED line also names an unchanged one", async () => {
+    const { cwd, body } = withCountsRow();
+    write(cwd, TEST.file, body("2", "0"));
+    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "needs a 2"));
+    appendTo(
+      cwd,
+      "logs/execute-1-log.md",
+      blockedLine("TASK", 2, "counts rows", "thought it changed"),
+    );
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(0);
+    const [row] = stepRows(cwd, "build-plan-tasks");
+    expect(row!.changedTests).toEqual([expect.objectContaining({ testName: TEST.name })]);
+  });
+
+  it("refuses only the changed planned tests no BLOCKED line of the log names", async () => {
+    const { cwd, body } = withCountsRow();
+    write(cwd, TEST.file, body("2", "3"));
+    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 2, "counts rows", "needs a 3"));
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(11);
+    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
+  });
+
+  it("the refusal names the BLOCKED line the engine reads", async () => {
+    const { cwd, body } = twoTests();
+    write(cwd, TEST.file, body("2", "2"));
+    const r = await run(cwd, EXECUTE);
+    expect(r.code).toBe(11);
+    expect(r.json.problem).toMatch(/BLOCKED — TASK [^:]+: test `src\/a\.test\.ts` `adds a row` — /);
+  });
+
+  it("the exit 11 help names the BLOCKED line that lets a change through", () => {
+    const codes = stepsCommand.verbs.finish!.exitCodes as Record<number, string>;
+    expect(codes[11]).toMatch(/BLOCKED — [^`]*test `/);
+  });
+
+  it("passes a later code step that leaves a BLOCKED change as it is", async () => {
+    const { cwd, body } = twoTests();
+    write(cwd, TEST.file, body("2", "0"));
+    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "needs a 2"));
+    expect((await run(cwd, EXECUTE)).code).toBe(0);
+    expect(stepRows(cwd, "build-plan-tasks")[0]!.changedTests).toHaveLength(1);
+    write(cwd, "src/b.ts", "export const b = 2;\n");
+    const r = await run(cwd, REMEDIATE);
+    expect(r.code).toBe(0);
+  });
+
+  it("refuses a later code step that changes a BLOCKED change again", async () => {
+    const { cwd, body } = twoTests();
+    write(cwd, TEST.file, body("2", "0"));
+    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "needs a 2"));
+    expect((await run(cwd, EXECUTE)).code).toBe(0);
+    expect(stepRows(cwd, "build-plan-tasks")[0]!.changedTests).toEqual([
+      expect.objectContaining({ testName: TEST.name }),
+    ]);
+    write(cwd, TEST.file, body("3", "0"));
+    copyLog(cwd, "logs/execute-1-log.md", "logs/execute-2-log.md");
+    const r = await run(cwd, later(EXECUTE, "execute-1-log", "execute-2-log"));
+    expect(r.code).toBe(11);
+    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
+  });
+
+  it("records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line", async () => {
+    const { cwd, body } = twoTests();
+    write(cwd, TEST.file, body("2", "0"));
+    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "needs a 2"));
+    expect((await run(cwd, EXECUTE)).code).toBe(0);
+    write(cwd, TEST.file, body("3", "0"));
+    copyLog(
+      cwd,
+      "logs/execute-1-log.md",
+      "logs/execute-2-log.md",
+      blockedLine("TASK", 1, TEST.name, "needs a 3 after all"),
+    );
+    const r = await run(cwd, later(EXECUTE, "execute-1-log", "execute-2-log"));
+    expect(r.code).toBe(0);
+    const rows = stepRows(cwd, "build-plan-tasks");
+    expect(rows.at(-1)!.changedTests).toEqual([
+      expect.objectContaining({
+        testName: TEST.name,
+        block: blockHash(textOfTest(cwd), TEST.name),
+        reason: "needs a 3 after all",
+      }),
+    ]);
+  });
+
+  it("uses a red the tests step recorded after a code step's change as the baseline", async () => {
+    const { cwd, body } = twoTests();
+    write(cwd, TEST.file, body("2", "0"));
+    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "needs a 2"));
+    expect((await run(cwd, EXECUTE)).code).toBe(0);
+    expect(stepRows(cwd, "build-plan-tasks")[0]!.changedTests).toEqual([
+      expect.objectContaining({ testName: TEST.name }),
+    ]);
+    // The tests step proves a newer red at other lines.
+    write(cwd, TEST.file, body("5", "0"));
+    redRow(cwd, {
+      attempt: 3,
+      tests: [
+        {
+          task: 1,
+          test: TEST.file,
+          testName: TEST.name,
+          state: "red",
+          blob: blobOf(cwd, TEST.file),
+          block: blockHash(textOfTest(cwd), TEST.name),
+        },
+      ],
+    });
+    copyLog(cwd, "logs/remediate-1-log.md", "logs/remediate-2-log.md");
+    write(cwd, "src/b.ts", "export const b = 3;\n");
+    const same = await run(cwd, later(REMEDIATE, "remediate-1-log", "remediate-2-log"));
+    expect(same.code).toBe(0);
+    write(cwd, TEST.file, body("6", "0"));
+    copyLog(cwd, "logs/remediate-1-log.md", "logs/remediate-3-log.md");
+    const r = await run(cwd, later(REMEDIATE, "remediate-1-log", "remediate-3-log"));
+    expect(r.code).toBe(11);
+    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
+  });
+
   it("exit codes list 11 as planned tests touched and 15 as source touched in the tests step", () => {
     const codes = stepsCommand.verbs.finish!.exitCodes as Record<number, string>;
     expect(codes[11]).toMatch(/planned test/);
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index bcdb3d90b..0aaa56ec7 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -98,7 +98,13 @@ import {
   type TrackerOutcome,
 } from "./tracker.js";
 import { parsePlanBlocks } from "./plan-blocks.js";
-import { PLAN_TASKS_STEP, readTestFirst, runPlanPath, touchedTests } from "./tests.js";
+import {
+  blockedTests,
+  PLAN_TASKS_STEP,
+  readTestFirst,
+  runPlanPath,
+  touchedTests,
+} from "./tests.js";
 import { addAllButCopied } from "./worktrees.js";
 
 /**
@@ -1295,7 +1301,8 @@ async function finish(ctx: RunContext): Promise<number> {
   // ordinary code-step work the verifier reads in the diff. The holistic fix spans every group.
   if (
     workflow === "build" &&
-    (((step === PLAN_TASKS_STEP || step === PLAN_REMEDIATE_STEP) && group !== undefined) ||
+    (step === PLAN_TASKS_STEP ||
+      step === PLAN_REMEDIATE_STEP ||
       step === PLAN_REMEDIATE_HOLISTIC_STEP)
   ) {
     const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
@@ -1305,11 +1312,36 @@ async function finish(ctx: RunContext): Promise<number> {
         ? runPlanPath(path.resolve(ctx.cwd, file))
         : path.resolve(ctx.cwd, planArg);
     const plan = fs.existsSync(planFile) ? fs.readFileSync(planFile, "utf-8") : undefined;
-    const tests = touchedTests(top, file, workflow, group, plan);
+    const changed = touchedTests(top, file, workflow, plan);
+    // A BLOCKED line of the step's log naming a changed test lets it through (recorded on the
+    // row), unless an earlier record of that test already carries the line's reason.
+    const logRead = artifacts[0] ? readTextFile(path.resolve(ctx.cwd, artifacts[0])) : undefined;
+    const blocked = logRead?.ok ? blockedTests(logRead.text) : [];
+    const changedTests: Array<Record<string, unknown>> = [];
+    const tests: Array<{ test: string; name: string }> = [];
+    for (const c of changed) {
+      const last = c.name.split(">").pop()!.trim();
+      const line = blocked.find(
+        (b) =>
+          b.test === c.test &&
+          (b.name === c.name || b.name === last) &&
+          !c.reasons.includes(b.reason),
+      );
+      if (line === undefined) tests.push({ test: c.test, name: c.name });
+      else
+        changedTests.push({
+          task: c.task,
+          test: c.test,
+          testName: c.name,
+          block: c.block,
+          reason: line.reason,
+        });
+    }
+    if (tests.length === 0 && changedTests.length > 0) extras.changedTests = changedTests;
     if (tests.length > 0) {
       const touched = [...new Set(tests.map((t) => t.test))];
       const named = tests.map((t) => `\`${t.test}\` "${t.name}"`).join(", ");
-      const problem = `${named} differ${tests.length === 1 ? "s" : ""} from what the group's tests step recorded at its red: a code step never edits a planned test case — put ${tests.length === 1 ? "that test" : "those tests"} back as the tests step left ${tests.length === 1 ? "it" : "them"} (other edits to the file stay), or log the task BLOCKED naming the test and what it gets wrong (nothing written)`;
+      const problem = `${named} differ${tests.length === 1 ? "s" : ""} from what the group's tests step recorded at its red: a code step never edits a planned test case — put ${tests.length === 1 ? "that test" : "those tests"} back as the tests step left ${tests.length === 1 ? "it" : "them"} (other edits to the file stay), or keep the edit and log one line per test in the step's log: ${tests.map((t) => `BLOCKED — TASK {N}: test \`${t.test}\` \`${t.name}\` — {why}`).join("; ")} (Gap {N} in a gaps fix) (nothing written)`;
       ctx.log(problem);
       recordTestLockFriction(top, step, named);
       ctx.emit({
@@ -1970,7 +2002,7 @@ export const stepsCommand: CommandSpec = {
         {
           name: "plan",
           type: "string",
-          help: `${PLAN_TESTS_STEP}: the plan file whose TEST FIRST lines bound the step's commit (required there with --commit=auto)`,
+          help: `${PLAN_TESTS_STEP}: the plan file whose TEST FIRST lines bound the step's commit (required there with --commit=auto); the code steps: the plan whose TEST FIRST lines name the planned tests the lock checks (default: the plan beside the status file)`,
         },
         ...COMMIT_FLAGS.map((c) =>
           c.name === "message"
@@ -2064,7 +2096,7 @@ export const stepsCommand: CommandSpec = {
         [EXIT_OUTSIDE_DOCS]:
           "--docs-only and the step staged a file outside the artifact tree (nothing written)",
         [EXIT_TESTS_TOUCHED]:
-          "build plan-execute / plan-gaps-remediate: a planned test case of the group differs from the lines its tests step recorded in status.jsonl (`tests`: [{test, name}]; `touched`: their files) — re-ask `reask.agent` to put that test back or log the task BLOCKED; other edits to the file stay (nothing written; an agent-rework friction row is appended)",
+          "build plan-execute / plan-gaps-remediate: a planned test case (of any group) differs from the lines recorded in status.jsonl (`tests`: [{test, name}]; `touched`: their files) — re-ask `reask.agent` to put that test back, or to keep the edit and log ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (Gap {N} in a gaps fix) in the step's log, which lets that change through and records it in the row's `changedTests`; other edits to the file stay (nothing written; an agent-rework friction row is appended)",
         [EXIT_LATER_ATTEMPT]:
           "this run saved an artifact of a later attempt (`later`) than the one finished (nothing written)",
         [EXIT_WORKFLOWS_CHANGED]:
diff --git a/.bkit/core/engine/commands/workflow/tests.test.ts b/.bkit/core/engine/commands/workflow/tests.test.ts
index 4ea9fd867..62d688130 100644
--- a/.bkit/core/engine/commands/workflow/tests.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -20,6 +20,7 @@ import { getCoreRoot } from "../../shared/package-roots";
 import { taskCapDefaultsNamed } from "../../checks/before/repo";
 import {
   blockHash,
+  blockedTests,
   checkPlanText,
   classifyLockExit,
   gateScope,
@@ -2120,6 +2121,30 @@ describe("testBlock — a planned test's own lines, by name and indentation", ()
   });
 });
 
+describe("blockedTests", () => {
+  it("reads the file, name and reason from a TASK or Gap BLOCKED test line", () => {
+    const log = [
+      "# Log",
+      "BLOCKED — TASK 2: test `src/a.test.ts` `adds a row` — new setup line",
+      "BLOCKED — Gap 3: test `src/b.test.ts` `suite > counts` — fixture moved",
+      "BLOCKED - TASK 4: test `src/c.test.ts` `plain hyphen` — x",
+    ].join("\n");
+    expect(blockedTests(log)).toEqual([
+      { test: "src/a.test.ts", name: "adds a row", reason: "new setup line" },
+      { test: "src/b.test.ts", name: "suite > counts", reason: "fixture moved" },
+      { test: "src/c.test.ts", name: "plain hyphen", reason: "x" },
+    ]);
+  });
+
+  it("ignores a BLOCKED line that names no test", () => {
+    const log = [
+      "BLOCKED — TASK 1: Add a row — the fixture cannot be built",
+      "BLOCKED — TASK 2: test `src/a.test.ts` `adds a row`",
+    ].join("\n");
+    expect(blockedTests(log)).toEqual([]);
+  });
+});
+
 describe("bkit tests red / green", () => {
   const STATUS = "logs/status.jsonl";
   const TEST = "src/clamp.test.ts";
@@ -2449,6 +2474,35 @@ describe("bkit tests red / green", () => {
     expect(states(third)).toEqual([`${NAME}:red`]);
   });
 
+  it("red keeps a test standing whose lines match a code step's recorded change", async () => {
+    const body = (n: number) =>
+      `it('${NAME}', () => {\n  expect(clamp(5, 1, 10)).toBe(${n});\n});\n`;
+    fs.writeFileSync(path.join(cwd, TEST), body(5));
+    vi.stubEnv("FAKE_EXIT", "1");
+    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
+    expect((await red()).code).toBe(0);
+    // A code step changed the test's lines under a BLOCKED line, and its row recorded them.
+    fs.writeFileSync(path.join(cwd, TEST), body(6));
+    fs.appendFileSync(
+      path.join(cwd, STATUS),
+      `${JSON.stringify({
+        type: "step-done",
+        workflow: "build",
+        step: "build-plan-tasks",
+        status: "DONE",
+        group: 1,
+        attempt: 1,
+        changedTests: [
+          { task: 1, test: TEST, testName: NAME, block: blockHash(body(6), NAME), reason: "setup" },
+        ],
+      })}\n`,
+    );
+    const second = await red([], "logs/build-tests-red-1-2.md");
+    expect(second.code).toBe(0);
+    expect(second.json).toMatchObject({ attempt: 2, skipped: 1, gaps: [] });
+    expect(second.json.tests).toEqual([]);
+  });
+
   describe("per-test proof", () => {
     const body = (planned: string, other: string) =>
       [
diff --git a/.bkit/core/engine/commands/workflow/tests.ts b/.bkit/core/engine/commands/workflow/tests.ts
index 8743a5c20..cbd8862a9 100644
--- a/.bkit/core/engine/commands/workflow/tests.ts
+++ b/.bkit/core/engine/commands/workflow/tests.ts
@@ -309,30 +309,106 @@ export interface TouchedTest {
   name: string;
 }
 
+/** A changed planned test, with what `finish` records when a BLOCKED line lets it through. */
+export interface TouchedDetail extends TouchedTest {
+  task: number;
+  /** The test's current block hash; null when no line names it. */
+  block: string | null;
+}
+
+/** The lock's baseline for one planned test: its latest red or recorded change. */
+export interface LockBaseline extends RedTest {
+  /** Every reason a code step's `changedTests` record carried for this test, in order. */
+  reasons: string[];
+}
+
+/**
+ * The lock's baseline per planned test, from the status rows in order: every `build-tests-red`
+ * entry (a proven red is never replaced by an unproven result for the same lines) and every
+ * `changedTests` record of a code step; the latest per key wins. `planned` (the plan-named key
+ * set) limits the keys; null keeps them all.
+ */
+export function lockBaselines(
+  rows: Array<Record<string, unknown>>,
+  planned: Set<string> | null,
+): Map<string, LockBaseline> {
+  const out = new Map<string, LockBaseline>();
+  for (const row of rows) {
+    if (row.type !== "step-done") continue;
+    if (row.step === RED_STEP && typeof row.group === "number") {
+      for (const t of redTestsOf(row)) {
+        const key = redKey(t.task, t.test, t.testName);
+        if (planned !== null && !planned.has(key)) continue;
+        const earlier = out.get(key);
+        const keepsProof =
+          earlier !== undefined &&
+          RED_PROVEN.has(earlier.state) &&
+          !RED_PROVEN.has(t.state) &&
+          typeof earlier.block === "string" &&
+          earlier.block === t.block;
+        if (!keepsProof) out.set(key, { ...t, reasons: earlier?.reasons ?? [] });
+      }
+    }
+    if (Array.isArray(row.changedTests)) {
+      for (const c of row.changedTests as Array<Record<string, unknown>>) {
+        if (typeof c.task !== "number" || typeof c.test !== "string") continue;
+        if (typeof c.testName !== "string") continue;
+        const key = redKey(c.task, c.test, c.testName);
+        if (planned !== null && !planned.has(key)) continue;
+        const earlier = out.get(key);
+        out.set(key, {
+          task: c.task,
+          test: c.test,
+          testName: c.testName,
+          state: "red",
+          blob: null,
+          block: typeof c.block === "string" ? c.block : null,
+          reasons: [
+            ...(earlier?.reasons ?? []),
+            ...(typeof c.reason === "string" ? [c.reason] : []),
+          ],
+        });
+      }
+    }
+  }
+  return out;
+}
+
+/** The status rows of one workflow. */
+export const workflowRows = (file: string, workflow: string) =>
+  fs.existsSync(file)
+    ? (readStatusRows(file) as Array<Record<string, unknown>>).filter(
+        (r) => r.workflow === workflow,
+      )
+    : [];
+
+/** The key set of the tests a plan's `TEST FIRST` lines name (done tasks included), or null with no plan. */
+function plannedKeys(plan: string | undefined): Set<string> | null {
+  return plan === undefined
+    ? null
+    : new Set(
+        readTestFirst(plan).flatMap((s) =>
+          s.kind === "test" ? s.tests.map((t) => redKey(s.task, t.test, t.name)) : [],
+        ),
+      );
+}
+
 /**
- * The planned tests of `group` (every group when undefined) a code step changed since their red: a test whose own lines
- * (`testBlock`) no longer hash to the recorded block. A row with no block (written before
- * per-test locking, or when no line carried the name) derives the block from the recorded
- * blob; when that holds no block either, the whole file's blob is compared. Other edits to a
- * test file are free. With `plan` (the plan's text), only records of tests a `TEST FIRST`
- * line still names are checked: a name the plan dropped locks nothing.
+ * The planned tests (every group) a code step changed since their baseline (`lockBaselines`): a
+ * test whose own lines (`testBlock`) no longer hash to the recorded block. A record with no
+ * block (written before per-test locking, or when no line carried the name) derives the block
+ * from the recorded blob; when that holds no block either, the whole file's blob is compared.
+ * Other edits to a test file are free. With `plan` (the plan's text), only tests a `TEST FIRST`
+ * line still names are checked: a name the plan dropped locks nothing. Each result carries the
+ * test's task, its current block and the reasons already recorded, for `finish`.
  */
 export function touchedTests(
   top: string,
   file: string,
   workflow: string,
-  group: number | undefined,
   plan?: string,
-): TouchedTest[] {
-  const planned =
-    plan === undefined
-      ? null
-      : new Set(
-          readTestFirst(plan).flatMap((s) =>
-            s.kind === "test" ? s.tests.map((t) => redKey(s.task, t.test, t.name)) : [],
-          ),
-        );
-  const touched: TouchedTest[] = [];
+): Array<TouchedDetail & { reasons: string[] }> {
+  const touched: Array<TouchedDetail & { reasons: string[] }> = [];
   const texts = new Map<string, string | null>();
   const textOf = (test: string) => {
     if (!texts.has(test)) {
@@ -341,17 +417,27 @@ export function touchedTests(
     }
     return texts.get(test)!;
   };
-  for (const t of redEntries(file, workflow, group).values()) {
-    if (planned !== null && !planned.has(redKey(t.task, t.test, t.testName))) continue;
+  for (const t of lockBaselines(workflowRows(file, workflow), plannedKeys(plan)).values()) {
+    const now = blockHash(textOf(t.test), t.testName);
+    const hit = () =>
+      touched.push({
+        test: t.test,
+        name: t.testName,
+        task: t.task,
+        block: now,
+        reasons: t.reasons,
+      });
     let block = t.block ?? null;
     if (block === null) block = blockHash(blobText(top, t.blob), t.testName);
     if (block === null) {
-      if (git(top, ["hash-object", "--", t.test]) !== t.blob)
-        touched.push({ test: t.test, name: t.testName });
+      if (t.blob === null) {
+        if (now !== null && t.reasons.length > 0) hit();
+        continue;
+      }
+      if (git(top, ["hash-object", "--", t.test]) !== t.blob) hit();
       continue;
     }
-    if (blockHash(textOf(t.test), t.testName) !== block)
-      touched.push({ test: t.test, name: t.testName });
+    if (now !== block) hit();
   }
   return touched;
 }
@@ -1379,6 +1465,20 @@ interface PassesLine extends PlannedTest {
   reason: string;
 }
 
+/** A ``BLOCKED — {TASK N|Gap N}: test `{file}` `{name}` — {why}`` line of a code step's log. */
+export interface BlockedTest extends PlannedTest {
+  reason: string;
+}
+
+/** Every BLOCKED line of a code step's log that names a planned test, with its reason. */
+export function blockedTests(log: string): BlockedTest[] {
+  return [
+    ...log.matchAll(
+      /^BLOCKED\s*[—–-]+\s*(?:TASK|Gap)\s+\d+:\s*test\s+`([^`]+)`\s+`([^`]+)`\s*[—–-]+\s*(.+)$/gm,
+    ),
+  ].map((m) => ({ test: m[1]!.trim(), name: m[2]!.trim(), reason: m[3]!.trim() }));
+}
+
 /** Every PASSES line of a tests step's log: the tests the writer saw passing and vouches for. */
 function passesLines(log: string): PassesLine[] {
   return [
@@ -1956,7 +2056,7 @@ export const testsCommand: CommandSpec = {
         // retry, a handover or a task added to the group runs only what is left, and an edit
         // to another test of the same file costs no proof. A test whose lines could not be
         // found, and rows from before per-test locking, stand while the whole file is unchanged.
-        const proven = redEntries(status, workflow, group);
+        const proven = lockBaselines(workflowRows(status, workflow), null);
         const textOf = (test: string) => {
           const abs = path.join(top, test);
           return fs.existsSync(abs) ? fs.readFileSync(abs, "utf-8") : null;
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index 4bb01ee12..b032afc19 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -30,7 +30,7 @@ import { readHolder, resolveMonth, workflowLockPath } from "./locks.js";
 import { EXIT_NO_STATUS, FILE_FLAG, GROUP_FLAG, STEP_FLAG, WORKFLOW_FLAG, extraField, nonNegativeInt, positiveInt, readRuns, readStatusRows, readRunsAt, statusFile, str, } from "./status.js";
 import { COMMENT_FILE_OUTPUT, POST_FLAG, TRACKER_OUTPUT, commentFileOf, postForVerb, } from "./tracker.js";
 import { parsePlanBlocks } from "./plan-blocks.js";
-import { PLAN_TASKS_STEP, readTestFirst, runPlanPath, touchedTests } from "./tests.js";
+import { blockedTests, PLAN_TASKS_STEP, readTestFirst, runPlanPath, touchedTests, } from "./tests.js";
 import { addAllButCopied } from "./worktrees.js";
 /**
  * An `agent-rework` friction row for a refused planned-test edit: the step reruns, so
@@ -1036,7 +1036,8 @@ async function finish(ctx) {
     // lines the group's tests step recorded at its red. Every other edit to the file is
     // ordinary code-step work the verifier reads in the diff. The holistic fix spans every group.
     if (workflow === "build" &&
-        (((step === PLAN_TASKS_STEP || step === PLAN_REMEDIATE_STEP) && group !== undefined) ||
+        (step === PLAN_TASKS_STEP ||
+            step === PLAN_REMEDIATE_STEP ||
             step === PLAN_REMEDIATE_HOLISTIC_STEP)) {
         const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
         const planArg = str(f.plan);
@@ -1044,11 +1045,35 @@ async function finish(ctx) {
             ? runPlanPath(path.resolve(ctx.cwd, file))
             : path.resolve(ctx.cwd, planArg);
         const plan = fs.existsSync(planFile) ? fs.readFileSync(planFile, "utf-8") : undefined;
-        const tests = touchedTests(top, file, workflow, group, plan);
+        const changed = touchedTests(top, file, workflow, plan);
+        // A BLOCKED line of the step's log naming a changed test lets it through (recorded on the
+        // row), unless an earlier record of that test already carries the line's reason.
+        const logRead = artifacts[0] ? readTextFile(path.resolve(ctx.cwd, artifacts[0])) : undefined;
+        const blocked = logRead?.ok ? blockedTests(logRead.text) : [];
+        const changedTests = [];
+        const tests = [];
+        for (const c of changed) {
+            const last = c.name.split(">").pop().trim();
+            const line = blocked.find((b) => b.test === c.test &&
+                (b.name === c.name || b.name === last) &&
+                !c.reasons.includes(b.reason));
+            if (line === undefined)
+                tests.push({ test: c.test, name: c.name });
+            else
+                changedTests.push({
+                    task: c.task,
+                    test: c.test,
+                    testName: c.name,
+                    block: c.block,
+                    reason: line.reason,
+                });
+        }
+        if (tests.length === 0 && changedTests.length > 0)
+            extras.changedTests = changedTests;
         if (tests.length > 0) {
             const touched = [...new Set(tests.map((t) => t.test))];
             const named = tests.map((t) => `\`${t.test}\` "${t.name}"`).join(", ");
-            const problem = `${named} differ${tests.length === 1 ? "s" : ""} from what the group's tests step recorded at its red: a code step never edits a planned test case — put ${tests.length === 1 ? "that test" : "those tests"} back as the tests step left ${tests.length === 1 ? "it" : "them"} (other edits to the file stay), or log the task BLOCKED naming the test and what it gets wrong (nothing written)`;
+            const problem = `${named} differ${tests.length === 1 ? "s" : ""} from what the group's tests step recorded at its red: a code step never edits a planned test case — put ${tests.length === 1 ? "that test" : "those tests"} back as the tests step left ${tests.length === 1 ? "it" : "them"} (other edits to the file stay), or keep the edit and log one line per test in the step's log: ${tests.map((t) => `BLOCKED — TASK {N}: test \`${t.test}\` \`${t.name}\` — {why}`).join("; ")} (Gap {N} in a gaps fix) (nothing written)`;
             ctx.log(problem);
             recordTestLockFriction(top, step, named);
             ctx.emit({
@@ -1653,7 +1678,7 @@ export const stepsCommand = {
                 {
                     name: "plan",
                     type: "string",
-                    help: `${PLAN_TESTS_STEP}: the plan file whose TEST FIRST lines bound the step's commit (required there with --commit=auto)`,
+                    help: `${PLAN_TESTS_STEP}: the plan file whose TEST FIRST lines bound the step's commit (required there with --commit=auto); the code steps: the plan whose TEST FIRST lines name the planned tests the lock checks (default: the plan beside the status file)`,
                 },
                 ...COMMIT_FLAGS.map((c) => c.name === "message"
                     ? {
@@ -1733,7 +1758,7 @@ export const stepsCommand = {
                 [EXIT_FOREIGN_PATH]: "nothing written, nothing committed: a path that was dirty before an in-place run changed during it",
                 [EXIT_NO_RECORD]: "a debug run on dev/main with no shared-checkout record: nothing written or committed",
                 [EXIT_OUTSIDE_DOCS]: "--docs-only and the step staged a file outside the artifact tree (nothing written)",
-                [EXIT_TESTS_TOUCHED]: "build plan-execute / plan-gaps-remediate: a planned test case of the group differs from the lines its tests step recorded in status.jsonl (`tests`: [{test, name}]; `touched`: their files) — re-ask `reask.agent` to put that test back or log the task BLOCKED; other edits to the file stay (nothing written; an agent-rework friction row is appended)",
+                [EXIT_TESTS_TOUCHED]: "build plan-execute / plan-gaps-remediate: a planned test case (of any group) differs from the lines recorded in status.jsonl (`tests`: [{test, name}]; `touched`: their files) — re-ask `reask.agent` to put that test back, or to keep the edit and log ``BLOCKED — TASK {N}: test `{file}` `{name}` — {why}`` (Gap {N} in a gaps fix) in the step's log, which lets that change through and records it in the row's `changedTests`; other edits to the file stay (nothing written; an agent-rework friction row is appended)",
                 [EXIT_LATER_ATTEMPT]: "this run saved an artifact of a later attempt (`later`) than the one finished (nothing written)",
                 [EXIT_WORKFLOWS_CHANGED]: "the commit would change bkit.workflows in package.json (`changed` names the keys) (nothing written)",
                 [EXIT_SOURCE_TOUCHED]: "build plan-tests: the tests step changed a file no TEST FIRST line of the group's open tasks names, or added one a CREATE line of the plan names (`source`) (nothing written)",
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index 9e5082b76..99e6e1b4d 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -193,17 +193,78 @@ export function runPlanPath(statusFile) {
     return path.join(path.dirname(path.dirname(logs)), `${path.basename(logs)}-plan.md`);
 }
 /**
- * The planned tests of `group` (every group when undefined) a code step changed since their red: a test whose own lines
- * (`testBlock`) no longer hash to the recorded block. A row with no block (written before
- * per-test locking, or when no line carried the name) derives the block from the recorded
- * blob; when that holds no block either, the whole file's blob is compared. Other edits to a
- * test file are free. With `plan` (the plan's text), only records of tests a `TEST FIRST`
- * line still names are checked: a name the plan dropped locks nothing.
+ * The lock's baseline per planned test, from the status rows in order: every `build-tests-red`
+ * entry (a proven red is never replaced by an unproven result for the same lines) and every
+ * `changedTests` record of a code step; the latest per key wins. `planned` (the plan-named key
+ * set) limits the keys; null keeps them all.
  */
-export function touchedTests(top, file, workflow, group, plan) {
-    const planned = plan === undefined
+export function lockBaselines(rows, planned) {
+    const out = new Map();
+    for (const row of rows) {
+        if (row.type !== "step-done")
+            continue;
+        if (row.step === RED_STEP && typeof row.group === "number") {
+            for (const t of redTestsOf(row)) {
+                const key = redKey(t.task, t.test, t.testName);
+                if (planned !== null && !planned.has(key))
+                    continue;
+                const earlier = out.get(key);
+                const keepsProof = earlier !== undefined &&
+                    RED_PROVEN.has(earlier.state) &&
+                    !RED_PROVEN.has(t.state) &&
+                    typeof earlier.block === "string" &&
+                    earlier.block === t.block;
+                if (!keepsProof)
+                    out.set(key, { ...t, reasons: earlier?.reasons ?? [] });
+            }
+        }
+        if (Array.isArray(row.changedTests)) {
+            for (const c of row.changedTests) {
+                if (typeof c.task !== "number" || typeof c.test !== "string")
+                    continue;
+                if (typeof c.testName !== "string")
+                    continue;
+                const key = redKey(c.task, c.test, c.testName);
+                if (planned !== null && !planned.has(key))
+                    continue;
+                const earlier = out.get(key);
+                out.set(key, {
+                    task: c.task,
+                    test: c.test,
+                    testName: c.testName,
+                    state: "red",
+                    blob: null,
+                    block: typeof c.block === "string" ? c.block : null,
+                    reasons: [
+                        ...(earlier?.reasons ?? []),
+                        ...(typeof c.reason === "string" ? [c.reason] : []),
+                    ],
+                });
+            }
+        }
+    }
+    return out;
+}
+/** The status rows of one workflow. */
+export const workflowRows = (file, workflow) => fs.existsSync(file)
+    ? readStatusRows(file).filter((r) => r.workflow === workflow)
+    : [];
+/** The key set of the tests a plan's `TEST FIRST` lines name (done tasks included), or null with no plan. */
+function plannedKeys(plan) {
+    return plan === undefined
         ? null
         : new Set(readTestFirst(plan).flatMap((s) => s.kind === "test" ? s.tests.map((t) => redKey(s.task, t.test, t.name)) : []));
+}
+/**
+ * The planned tests (every group) a code step changed since their baseline (`lockBaselines`): a
+ * test whose own lines (`testBlock`) no longer hash to the recorded block. A record with no
+ * block (written before per-test locking, or when no line carried the name) derives the block
+ * from the recorded blob; when that holds no block either, the whole file's blob is compared.
+ * Other edits to a test file are free. With `plan` (the plan's text), only tests a `TEST FIRST`
+ * line still names are checked: a name the plan dropped locks nothing. Each result carries the
+ * test's task, its current block and the reasons already recorded, for `finish`.
+ */
+export function touchedTests(top, file, workflow, plan) {
     const touched = [];
     const texts = new Map();
     const textOf = (test) => {
@@ -213,19 +274,30 @@ export function touchedTests(top, file, workflow, group, plan) {
         }
         return texts.get(test);
     };
-    for (const t of redEntries(file, workflow, group).values()) {
-        if (planned !== null && !planned.has(redKey(t.task, t.test, t.testName)))
-            continue;
+    for (const t of lockBaselines(workflowRows(file, workflow), plannedKeys(plan)).values()) {
+        const now = blockHash(textOf(t.test), t.testName);
+        const hit = () => touched.push({
+            test: t.test,
+            name: t.testName,
+            task: t.task,
+            block: now,
+            reasons: t.reasons,
+        });
         let block = t.block ?? null;
         if (block === null)
             block = blockHash(blobText(top, t.blob), t.testName);
         if (block === null) {
+            if (t.blob === null) {
+                if (now !== null && t.reasons.length > 0)
+                    hit();
+                continue;
+            }
             if (git(top, ["hash-object", "--", t.test]) !== t.blob)
-                touched.push({ test: t.test, name: t.testName });
+                hit();
             continue;
         }
-        if (blockHash(textOf(t.test), t.testName) !== block)
-            touched.push({ test: t.test, name: t.testName });
+        if (now !== block)
+            hit();
     }
     return touched;
 }
@@ -1015,6 +1087,12 @@ function updatedEntry(top, task, t, base) {
     const d = lineDiff(was, now);
     return { ...entry, additive: d.removed === 0, diff: d.text };
 }
+/** Every BLOCKED line of a code step's log that names a planned test, with its reason. */
+export function blockedTests(log) {
+    return [
+        ...log.matchAll(/^BLOCKED\s*[—–-]+\s*(?:TASK|Gap)\s+\d+:\s*test\s+`([^`]+)`\s+`([^`]+)`\s*[—–-]+\s*(.+)$/gm),
+    ].map((m) => ({ test: m[1].trim(), name: m[2].trim(), reason: m[3].trim() }));
+}
 /** Every PASSES line of a tests step's log: the tests the writer saw passing and vouches for. */
 function passesLines(log) {
     return [
@@ -1528,7 +1606,7 @@ export const testsCommand = {
                 // retry, a handover or a task added to the group runs only what is left, and an edit
                 // to another test of the same file costs no proof. A test whose lines could not be
                 // found, and rows from before per-test locking, stand while the whole file is unchanged.
-                const proven = redEntries(status, workflow, group);
+                const proven = lockBaselines(workflowRows(status, workflow), null);
                 const textOf = (test) => {
                     const abs = path.join(top, test);
                     return fs.existsSync(abs) ? fs.readFileSync(abs, "utf-8") : null;
