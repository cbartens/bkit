diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-verify.md b/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
index b131b6dc8..7bb90fe91 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
@@ -91,8 +91,9 @@ tools:
      - **If** the hit is a different thing with the same name → no gap.
      - **Else** → `Fixable: true`.
    - `Unproven` section → list each test in `Notes`. No gap: the engine could not prove that test red before its code existed, and the owner answers it once, at the end of the build.
-   - `Changed by a code step` section → list each test and its reason in `Notes`.
-     No gap: a code step kept the change under a `BLOCKED` line, and the owner answers it once, at the end of the build.
+   - `Changed by a code step` section → list each test and its reason in `Notes`; its entry carries the engine's line diff since its baseline, and you read the added lines of that diff the way the `Updated tests` rule reads an update.
+     No gap when the added lines only add setup or expectations (the owner answers the change once, at the end of the build). **Else** → an added line disables or loosens the test (an early `return`, a skip, a comment pair around assertions, `expect.assertions(0)`, a reassignment of the value under test):
+     - Raise a `test-loosened` gap: ``TASK {N}: `{file}` `{name}` — test-loosened: {what} — Fixable: true``, and name the test on the header's `Loosened` line, which sends it back to the tests step to restore.
    - `Updated tests` section → each test is an existing test the tests step changed. Its entry carries the engine's line diff of the test's own lines since `base`, and says whether the change is additive (no line removed). Read that diff, and the supplied group diff when the entry says the lines could not be read:
      - **If** the update only adds expectations → no gap. An additive change is one unless an added line disables or overrides an earlier expectation (a skip, an early return, a reassignment).
      - **Else** → the update removes or loosens an expectation. The tests step restores it and keeps the additions, because no code step may rewrite a planned test:
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
diff --git a/.bkit/core/prompts/bkit-build-plan-verify.md b/.bkit/core/prompts/bkit-build-plan-verify.md
index 079f11c88..ab1d52221 100644
--- a/.bkit/core/prompts/bkit-build-plan-verify.md
+++ b/.bkit/core/prompts/bkit-build-plan-verify.md
@@ -93,8 +93,9 @@ autoCompactWindow: 300000
      - **If** the hit is a different thing with the same name → no gap.
      - **Else** → `Fixable: true`.
    - `Unproven` section → list each test in `Notes`. No gap: the engine could not prove that test red before its code existed, and the owner answers it once, at the end of the build.
-   - `Changed by a code step` section → list each test and its reason in `Notes`.
-     No gap: a code step kept the change under a `BLOCKED` line, and the owner answers it once, at the end of the build.
+   - `Changed by a code step` section → list each test and its reason in `Notes`; its entry carries the engine's line diff since its baseline, and you read the added lines of that diff the way the `Updated tests` rule reads an update.
+     No gap when the added lines only add setup or expectations (the owner answers the change once, at the end of the build). **Else** → an added line disables or loosens the test (an early `return`, a skip, a comment pair around assertions, `expect.assertions(0)`, a reassignment of the value under test):
+     - Raise a `test-loosened` gap: ``TASK {N}: `{file}` `{name}` — test-loosened: {what} — Fixable: true``, and name the test on the header's `Loosened` line, which sends it back to the tests step to restore.
    - `Updated tests` section → each test is an existing test the tests step changed. Its entry carries the engine's line diff of the test's own lines since `base`, and says whether the change is additive (no line removed). Read that diff, and the supplied group diff when the entry says the lines could not be read:
      - **If** the update only adds expectations → no gap. An additive change is one unless an added line disables or overrides an earlier expectation (a skip, an early return, a reassignment).
      - **Else** → the update removes or loosens an expectation. The tests step restores it and keeps the additions, because no code step may rewrite a planned test:
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index baaaf59eb..b11668e00 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -11190,7 +11190,9 @@ Set `Verdict` from the `Fixable` values you decided, never from the report's `nu
 Put `Tasks` and `Loosened` in `judgments`, because the engine never derives them and the workflow reads them from the header.
 Put the `## Identified Gaps Log` section, with one `TASK {N}` line per gap, in `body`, because the remediate step reads it from the report.
 The engine never overrides a `Verdict` that depends on evidence: `CONCERNS` and the `Loosened` decision stay yours.
-`Changed by a code step` section → list each test and its reason in `Notes`.
+`Changed by a code step` section → list each test and its reason in `Notes`; its entry carries the engine's line diff since its baseline, and you read the added lines of that diff the way the `Updated tests` rule reads an update.
+No gap when the added lines only add setup or expectations (the owner answers the change once, at the end of the build). **Else** → an added line disables or loosens the test (an early `return`, a skip, a comment pair around assertions, `expect.assertions(0)`, a reassignment of the value under test):
+Raise a `test-loosened` gap: ``TASK {N}: `{file}` `{name}` — test-loosened: {what} — Fixable: true``, and name the test on the header's `Loosened` line, which sends it back to the tests step to restore.
 ```
 
 #### bkit-debug-abort-handover
diff --git a/.bkit/version b/.bkit/version
index 34879906c..7f749518e 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -24,7 +24,7 @@
     ".claude/agents/bkit-build-challenge-2.md": "0ef8a829af9b89602a75ac257a093e4a47169ca9c2a4c216d6f11937e2e9c48f",
     ".claude/agents/bkit-build-install-skills.md": "0249b5fe6550c45afe95972d1d3f4a65f7e159a74038ce9179ca1fceb29e1d12",
     ".claude/agents/bkit-build-plan-gaps-remediate.md": "62f9aa0a792e7adb01a83b29ea51e6ea4d2e1530923ddc2f0fa98ce4c8b1ca03",
-    ".claude/agents/bkit-build-plan-verify.md": "4579dc2cf9db1efb0a3e3361efc2ac60b3889f3914f4e699b46d97a9c5c9e7ef",
+    ".claude/agents/bkit-build-plan-verify.md": "b68f28b00aa84b6397e86d69f6e694ae6c8ee50a0241d92e56c3e0d35848e97a",
     ".claude/agents/bkit-debug-abort-handover.md": "4d2ed067a5933578768325379269f51357365d7740986a2de580f022bace0a26",
     ".claude/agents/bkit-debug-failure-diagnose.md": "9169cb6210ffbe5a0d6237e81da9f7299067a0db2bdff6a35af6961ce608caa9",
     ".claude/agents/bkit-debug-failure-remediate.md": "0711217d55056389f25a82431d04bbb587c3124da45d5ea0f1d6f6bcbead04f5",
@@ -56,7 +56,7 @@
     ".cursor/agents/bkit-build-challenge-2.md": "6399d8b34ff1be2a63b77b911fd8321f80bd0bf64550103f809cdf5194820c24",
     ".cursor/agents/bkit-build-install-skills.md": "9f77d5ce2bc7e5d1c60d8860b5a06d81091f9194522607151a76838fc895da6d",
     ".cursor/agents/bkit-build-plan-gaps-remediate.md": "4067031d8aa4cc868b2401b95d4c2421ecf005ae0df29da400decc25c4254bae",
-    ".cursor/agents/bkit-build-plan-verify.md": "a86d722b0c7fb0a099637000572be9212a0351f5ccb15653ff8317da1c2db92b",
+    ".cursor/agents/bkit-build-plan-verify.md": "40e905411b5c69040989ef464dcbc6497ce2d2b67ac7c65a0e65cbf6a8a65e5e",
     ".cursor/agents/bkit-debug-abort-handover.md": "dbe3697156bb2068701efe79242d9e7d3554206fa266e26772bc74537c946ea9",
     ".cursor/agents/bkit-debug-failure-diagnose.md": "83da231f51d4526c7a6235475b2c40c872dc58e973e9ac30b5c9e85c98377229",
     ".cursor/agents/bkit-debug-failure-remediate.md": "597d997785131366a3bd240ffa29b82dce9be80f7bad283dd59a480e7ea9f2d4",
@@ -82,7 +82,7 @@
     ".opencode/agents/bkit-build-challenge-2.md": "9c8bdb5092b44f070468b82d88d9457ab58193d7f5697300877fc96779400e9d",
     ".opencode/agents/bkit-build-install-skills.md": "56687e9967e11c8e3ddc0c965a4818898d2ad61cc279af30ea862390eb245b8d",
     ".opencode/agents/bkit-build-plan-gaps-remediate.md": "b348e0cb7ebf3e9457dca5e071127e34068a3fec67c8a4cae4bd6486a9f571b0",
-    ".opencode/agents/bkit-build-plan-verify.md": "c3c02f1af17b77b324f767d903b5632cc3608bd3376c88d772d5834dc4b6105c",
+    ".opencode/agents/bkit-build-plan-verify.md": "3264af589bc4f612c3fc6c44c6e5fbecfa41d6583bb7000b9037ab9640d5d0fb",
     ".opencode/agents/bkit-debug-abort-handover.md": "924dddce677e294ff9391e38e9d563b16ce14ca527db0167386dfb0898ea44a9",
     ".opencode/agents/bkit-debug-failure-diagnose.md": "341bbb7bc59750b9fd5979eb1fc715bf8a289c6b3ed86a61a976e4d6d770977f",
     ".opencode/agents/bkit-debug-failure-remediate.md": "6f7707a6a7266249350315ed6e505fa8522d1bac8ad56af1f28919c2287b48c9",
@@ -122,7 +122,7 @@
     ".codex/agents/bkit-build-install-skills.toml": "ed158a6f987f24f5b0f83919e610cd7574605d2f794ffcd748eec6b12e314a76",
     ".codex/agents/bkit-build-plan-current.toml": "339cd3e95a5a7e23caf8c21de8b04866a96d47cd494c4e2f6766aeb202c355b2",
     ".codex/agents/bkit-build-plan-gaps-remediate.toml": "7559cc695ce2816a2a87402ad2e996f688004208642e1273a0ab63c394bbdb4e",
-    ".codex/agents/bkit-build-plan-verify.toml": "a304ce20d5c46377a5c65d98cff754222678ff39e124de4f8f37350caeb41edd",
+    ".codex/agents/bkit-build-plan-verify.toml": "abc6cc13d7b201445fb19a042f828e943c75d1f23e477ee6331dbd4026078c68",
     ".codex/agents/bkit-debug-abort-handover.toml": "1683aa233cc3b353fc32f5e73699961b326fa9466133b1ced2d674c95fd0bd7f",
     ".codex/agents/bkit-debug-failure-diagnose.toml": "4542279af7a5585e4bd711a0bae836f398a644b0cac09519aed8251a78249a36",
     ".codex/agents/bkit-debug-failure-remediate.toml": "c3230461bfbe5c85732462654780f2cbf4df8ea3cf4ff53a08307f9becfdc06d",
diff --git a/.claude/agents/bkit-build-plan-verify.md b/.claude/agents/bkit-build-plan-verify.md
index e1743023d..abdbe11f7 100644
--- a/.claude/agents/bkit-build-plan-verify.md
+++ b/.claude/agents/bkit-build-plan-verify.md
@@ -94,8 +94,9 @@ autoCompactWindow: 300000
      - **If** the hit is a different thing with the same name → no gap.
      - **Else** → `Fixable: true`.
    - `Unproven` section → list each test in `Notes`. No gap: the engine could not prove that test red before its code existed, and the owner answers it once, at the end of the build.
-   - `Changed by a code step` section → list each test and its reason in `Notes`.
-     No gap: a code step kept the change under a `BLOCKED` line, and the owner answers it once, at the end of the build.
+   - `Changed by a code step` section → list each test and its reason in `Notes`; its entry carries the engine's line diff since its baseline, and you read the added lines of that diff the way the `Updated tests` rule reads an update.
+     No gap when the added lines only add setup or expectations (the owner answers the change once, at the end of the build). **Else** → an added line disables or loosens the test (an early `return`, a skip, a comment pair around assertions, `expect.assertions(0)`, a reassignment of the value under test):
+     - Raise a `test-loosened` gap: ``TASK {N}: `{file}` `{name}` — test-loosened: {what} — Fixable: true``, and name the test on the header's `Loosened` line, which sends it back to the tests step to restore.
    - `Updated tests` section → each test is an existing test the tests step changed. Its entry carries the engine's line diff of the test's own lines since `base`, and says whether the change is additive (no line removed). Read that diff, and the supplied group diff when the entry says the lines could not be read:
      - **If** the update only adds expectations → no gap. An additive change is one unless an added line disables or overrides an earlier expectation (a skip, an early return, a reassignment).
      - **Else** → the update removes or loosens an expectation. The tests step restores it and keeps the additions, because no code step may rewrite a planned test:
diff --git a/.codex/agents/bkit-build-plan-verify.toml b/.codex/agents/bkit-build-plan-verify.toml
index f982e1eaf..903def9fb 100644
--- a/.codex/agents/bkit-build-plan-verify.toml
+++ b/.codex/agents/bkit-build-plan-verify.toml
@@ -81,8 +81,9 @@ developer_instructions = """
      - **If** the hit is a different thing with the same name → no gap.
      - **Else** → `Fixable: true`.
    - `Unproven` section → list each test in `Notes`. No gap: the engine could not prove that test red before its code existed, and the owner answers it once, at the end of the build.
-   - `Changed by a code step` section → list each test and its reason in `Notes`.
-     No gap: a code step kept the change under a `BLOCKED` line, and the owner answers it once, at the end of the build.
+   - `Changed by a code step` section → list each test and its reason in `Notes`; its entry carries the engine's line diff since its baseline, and you read the added lines of that diff the way the `Updated tests` rule reads an update.
+     No gap when the added lines only add setup or expectations (the owner answers the change once, at the end of the build). **Else** → an added line disables or loosens the test (an early `return`, a skip, a comment pair around assertions, `expect.assertions(0)`, a reassignment of the value under test):
+     - Raise a `test-loosened` gap: ``TASK {N}: `{file}` `{name}` — test-loosened: {what} — Fixable: true``, and name the test on the header's `Loosened` line, which sends it back to the tests step to restore.
    - `Updated tests` section → each test is an existing test the tests step changed. Its entry carries the engine's line diff of the test's own lines since `base`, and says whether the change is additive (no line removed). Read that diff, and the supplied group diff when the entry says the lines could not be read:
      - **If** the update only adds expectations → no gap. An additive change is one unless an added line disables or overrides an earlier expectation (a skip, an early return, a reassignment).
      - **Else** → the update removes or loosens an expectation. The tests step restores it and keeps the additions, because no code step may rewrite a planned test:
diff --git a/.cursor/agents/bkit-build-plan-verify.md b/.cursor/agents/bkit-build-plan-verify.md
index e7e2b2a48..7333a06e6 100644
--- a/.cursor/agents/bkit-build-plan-verify.md
+++ b/.cursor/agents/bkit-build-plan-verify.md
@@ -91,8 +91,9 @@ tools:
      - **If** the hit is a different thing with the same name → no gap.
      - **Else** → `Fixable: true`.
    - `Unproven` section → list each test in `Notes`. No gap: the engine could not prove that test red before its code existed, and the owner answers it once, at the end of the build.
-   - `Changed by a code step` section → list each test and its reason in `Notes`.
-     No gap: a code step kept the change under a `BLOCKED` line, and the owner answers it once, at the end of the build.
+   - `Changed by a code step` section → list each test and its reason in `Notes`; its entry carries the engine's line diff since its baseline, and you read the added lines of that diff the way the `Updated tests` rule reads an update.
+     No gap when the added lines only add setup or expectations (the owner answers the change once, at the end of the build). **Else** → an added line disables or loosens the test (an early `return`, a skip, a comment pair around assertions, `expect.assertions(0)`, a reassignment of the value under test):
+     - Raise a `test-loosened` gap: ``TASK {N}: `{file}` `{name}` — test-loosened: {what} — Fixable: true``, and name the test on the header's `Loosened` line, which sends it back to the tests step to restore.
    - `Updated tests` section → each test is an existing test the tests step changed. Its entry carries the engine's line diff of the test's own lines since `base`, and says whether the change is additive (no line removed). Read that diff, and the supplied group diff when the entry says the lines could not be read:
      - **If** the update only adds expectations → no gap. An additive change is one unless an added line disables or overrides an earlier expectation (a skip, an early return, a reassignment).
      - **Else** → the update removes or loosens an expectation. The tests step restores it and keeps the additions, because no code step may rewrite a planned test:
diff --git a/.opencode/agents/bkit-build-plan-verify.md b/.opencode/agents/bkit-build-plan-verify.md
index c1d2450a8..60c0b63c7 100644
--- a/.opencode/agents/bkit-build-plan-verify.md
+++ b/.opencode/agents/bkit-build-plan-verify.md
@@ -92,8 +92,9 @@ tools:
      - **If** the hit is a different thing with the same name → no gap.
      - **Else** → `Fixable: true`.
    - `Unproven` section → list each test in `Notes`. No gap: the engine could not prove that test red before its code existed, and the owner answers it once, at the end of the build.
-   - `Changed by a code step` section → list each test and its reason in `Notes`.
-     No gap: a code step kept the change under a `BLOCKED` line, and the owner answers it once, at the end of the build.
+   - `Changed by a code step` section → list each test and its reason in `Notes`; its entry carries the engine's line diff since its baseline, and you read the added lines of that diff the way the `Updated tests` rule reads an update.
+     No gap when the added lines only add setup or expectations (the owner answers the change once, at the end of the build). **Else** → an added line disables or loosens the test (an early `return`, a skip, a comment pair around assertions, `expect.assertions(0)`, a reassignment of the value under test):
+     - Raise a `test-loosened` gap: ``TASK {N}: `{file}` `{name}` — test-loosened: {what} — Fixable: true``, and name the test on the header's `Loosened` line, which sends it back to the tests step to restore.
    - `Updated tests` section → each test is an existing test the tests step changed. Its entry carries the engine's line diff of the test's own lines since `base`, and says whether the change is additive (no line removed). Read that diff, and the supplied group diff when the entry says the lines could not be read:
      - **If** the update only adds expectations → no gap. An additive change is one unless an added line disables or overrides an earlier expectation (a skip, an early return, a reassignment).
      - **Else** → the update removes or loosens an expectation. The tests step restores it and keeps the additions, because no code step may rewrite a planned test:
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
 
