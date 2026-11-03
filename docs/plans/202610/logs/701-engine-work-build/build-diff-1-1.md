diff --git a/.bkit/core/engine/commands/workflow/steps.test.ts b/.bkit/core/engine/commands/workflow/steps.test.ts
index 673babeaf..435e9a7d0 100644
--- a/.bkit/core/engine/commands/workflow/steps.test.ts
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -37,7 +37,7 @@ function repo() {
   write(
     cwd,
     "logs/verify-1.md",
-    "Verdict: FAIL\nFailures: 2\nFixable: true\n\n<!-- verdict:end -->\n\n# Verify\n\nTwo gaps.\n",
+    "Verdict: FAIL\nFailures: 2\nFixable: true\nTasks: none\n\n<!-- verdict:end -->\n\n# Verify\n\nTwo gaps.\n",
   );
   return cwd;
 }
@@ -239,7 +239,7 @@ describe("bkit steps verdict", () => {
     expect(r.code).toBe(0);
     expect(r.json).toEqual({
       verdict: "FAIL",
-      fields: { Verdict: "FAIL", Failures: "2", Fixable: "true" },
+      fields: { Verdict: "FAIL", Failures: "2", Fixable: "true", Tasks: "none" },
     });
   });
 
@@ -929,7 +929,7 @@ describe("bkit steps finish --post", () => {
     write(
       cwd,
       `${LOG}/verify-1.md`,
-      "Verdict: PASS\nFailures: 0\nFixable: false\n<!-- verdict:end -->\n",
+      "Verdict: PASS\nFailures: 0\nFixable: false\nTasks: none\n<!-- verdict:end -->\n",
     );
     return cwd;
   }
diff --git a/.bkit/core/engine/commands/workflow/tests.test.ts b/.bkit/core/engine/commands/workflow/tests.test.ts
index 895de01c8..ae52e19b0 100644
--- a/.bkit/core/engine/commands/workflow/tests.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests.test.ts
@@ -1498,23 +1498,32 @@ describe("bkit tests red / green", () => {
         task: 1,
         kind: "delete-still-referenced",
         detail: "DELETE `oldGate` in `src/gate.ts` is still referenced: `src/use.ts:3`",
+        fixable: null,
+        logLine: "TASK 1: delete-still-referenced — Fixable: null",
       },
       {
         task: 1,
         kind: "delete-still-referenced",
         detail: "DELETE `src/legacyShim.ts` is still referenced as `legacyShim`: `src/use.ts:2`",
+        fixable: null,
+        logLine: "TASK 1: delete-still-referenced — Fixable: null",
       },
       {
         task: 1,
         kind: "delete-still-referenced",
         detail: "DELETE `src/still.ts`: the file still exists",
+        fixable: null,
+        logLine: "TASK 1: delete-still-referenced — Fixable: null",
       },
       {
         task: 1,
         kind: "delete-still-referenced",
         detail: "DELETE § Old section in `docs/d.md` is still referenced: `docs/d.md:3`",
+        fixable: null,
+        logLine: "TASK 1: delete-still-referenced — Fixable: null",
       },
     ]);
+    expect(r.json.verdict).toBe(null);
     expect(report()).toContain("- Task 1 `delete-still-referenced` — DELETE `oldGate`");
   });
 
@@ -1547,11 +1556,13 @@ describe("bkit tests red / green", () => {
         task: 1,
         kind: "delete-still-referenced",
         detail: "DELETE `src/moved.ts` is still referenced as `moved`: `src/stale.ts:1`",
+        fixable: null,
+        logLine: "TASK 1: delete-still-referenced — Fixable: null",
       },
     ]);
   });
 
-  it("green: red recorded, test unchanged, named test passing -> no gaps", async () => {
+  it("green with no gaps prints verdict PASS and an empty gaps", async () => {
     writePlan([
       TASK_1,
       taskBlock(2, ["  - **DONE WHEN:** done", "  - **TEST FIRST:** n/a — docs."]),
@@ -1563,11 +1574,96 @@ describe("bkit tests red / green", () => {
     vi.stubEnv("FAKE_JUNIT", junit(passed(`clamp > ${NAME}`)));
     const r = await green();
     expect(r.code).toBe(0);
-    expect(r.json).toMatchObject({ enforced: true, gaps: [] });
+    expect(r.json).toMatchObject({ enforced: true, gaps: [], verdict: "PASS" });
     expect(report()).toContain("Gaps: 0");
+    expect(report()).toContain("Verdict: PASS");
     expect(report()).toContain("| 1 |");
   });
 
+  it("green prints a verdict and a fixable per gap", async () => {
+    const OTHER = "src/range.test.ts";
+    writePlan([TASK_1, testTask(2, [[TEST, "second"]]), testTask(3, [[OTHER, "third"]])]);
+    fs.writeFileSync(path.join(cwd, OTHER), "expect(clamp(0, 1, 10)).toBe(1);\n");
+    vi.stubEnv("FAKE_EXIT", "1");
+    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
+    expect((await red()).code).toBe(0);
+    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME), failed("third")));
+    const thirdRed = await run(
+      [
+        `--file=${STATUS}`,
+        "--workflow=build",
+        "--group=1",
+        "--task=3",
+        `--test=${OTHER}`,
+        "--name=third",
+        "--log=logs/build-task-red-1-3.md",
+      ],
+      cwd,
+      "red",
+    );
+    expect(thirdRed.code).toBe(0);
+    fs.writeFileSync(path.join(cwd, OTHER), "expect(clamp(9, 1, 10)).toBe(9);\n");
+    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME), passed("second"), passed("third")));
+    const r = await green();
+    expect(r.code).toBe(1);
+    expect(r.json.verdict).toBe(null);
+    expect(
+      (r.json.gaps as Array<{ kind: string; fixable: boolean | null }>).map(
+        (g) => `${g.kind}:${g.fixable}`,
+      ),
+    ).toEqual(["not-green:true", "no-red:false", "test-changed:null"]);
+    expect(report()).toContain("Verdict: null");
+    expect(report()).toContain(`TASK 1: \`${TEST}\` \`${NAME}\` — not-green — Fixable: true`);
+    expect(report()).toContain("Fixable: false");
+    expect(report()).toContain("Fixable: null");
+  });
+
+  it("green verdict is FAIL when a gap is unfixable", async () => {
+    writePlan([testTask(1, [[TEST, NAME]])]);
+    fs.mkdirSync(path.join(cwd, "logs"), { recursive: true });
+    fs.writeFileSync(
+      path.join(cwd, STATUS),
+      `${JSON.stringify({ type: "step-done", workflow: "build", step: "build-worktree-setup", status: "DONE", artifacts: [] })}\n`,
+    );
+    vi.stubEnv("FAKE_EXIT", "0");
+    vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
+    const r = await green();
+    expect(r.code).toBe(1);
+    expect(r.json.verdict).toBe("FAIL");
+    expect((r.json.gaps as Array<{ kind: string; fixable: boolean }>)[0]).toMatchObject({
+      kind: "no-red",
+      fixable: false,
+    });
+    expect(report()).toContain("Verdict: FAIL");
+  });
+
+  it("green leaves a diff-reading kind fixable null", async () => {
+    writePlan([testTask(1, [[TEST, "planned name"]])]);
+    vi.stubEnv("FAKE_EXIT", "1");
+    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
+    expect((await red()).code).toBe(0);
+    vi.stubEnv("FAKE_JUNIT", junit(passed("planned name")));
+    const r = await green();
+    const gaps = r.json.gaps as Array<{ kind: string; fixable: boolean | null }>;
+    expect(gaps.map((g) => g.kind)).toEqual(["red-mismatch"]);
+    expect(gaps[0]!.fixable).toBe(null);
+    expect(r.json.verdict).toBe(null);
+  });
+
+  it("green prints verdict null when a gap needs a diff read", async () => {
+    writePlan([TASK_1]);
+    vi.stubEnv("FAKE_EXIT", "1");
+    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
+    expect((await red()).code).toBe(0);
+    fs.writeFileSync(path.join(cwd, TEST), "expect(true).toBe(true);\n");
+    vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
+    const r = await green();
+    expect(r.code).toBe(1);
+    expect((r.json.gaps as Array<{ kind: string }>).map((g) => g.kind)).toEqual(["test-changed"]);
+    expect(r.json.verdict).toBe(null);
+    expect(report()).toContain("Verdict: null");
+  });
+
   it("green: lists each gap kind, with the diff for a test changed since its red", async () => {
     writePlan([
       TASK_1,
@@ -1765,7 +1861,7 @@ describe("bkit tests red / green", () => {
       );
     });
 
-    it("a test file that only gained lines since its red is no gap; the diff stays in the report", async () => {
+    it("green emits a test-changed gap for a red whose test gained added lines only", async () => {
       writePlan([TASK_1]);
       vi.stubEnv("FAKE_EXIT", "1");
       vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
@@ -1774,8 +1870,11 @@ describe("bkit tests red / green", () => {
       vi.stubEnv("FAKE_EXIT", "0");
       vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
       const r = await green();
-      expect(r.code).toBe(0);
-      expect(r.json.gaps).toEqual([]);
+      expect(r.code).toBe(1);
+      expect(r.json.gaps).toEqual([
+        expect.objectContaining({ task: 1, kind: "test-changed", fixable: null }),
+      ]);
+      expect(r.json.verdict).toBe(null);
       expect(report()).toContain("| added lines only |");
       expect(report()).toContain("+expect(clamp(0, 1, 10)).toBe(1);");
     });
diff --git a/.bkit/core/engine/commands/workflow/tests.ts b/.bkit/core/engine/commands/workflow/tests.ts
index 211eceab6..e27f29212 100644
--- a/.bkit/core/engine/commands/workflow/tests.ts
+++ b/.bkit/core/engine/commands/workflow/tests.ts
@@ -668,13 +668,64 @@ const toplevel = (cwd: string) => git(cwd, ["rev-parse", "--show-toplevel"]) ??
 const fenceFor = (text: string) =>
   "`".repeat(Math.max(3, ...[...text.matchAll(/`+/g)].map((m) => m[0].length + 1)));
 
+/**
+ * Every gap the audit emits, and the verifier's `Fixable` for it: `null` = the
+ * answer needs a diff read, which only the verifier can make.
+ */
+const GAP_FIXABLE = {
+  "not-green": true,
+  "delete-still-referenced": null,
+  "test-changed": null,
+  "red-mismatch": null,
+  "no-red": false,
+  "late-red": false,
+  "no-test-first": false,
+  "test-first-malformed": false,
+  "test-first-unread": false,
+  "red-evidence-missing": false,
+  "exception-refused": false,
+} as const satisfies Record<string, boolean | null>;
+
+type GapKind = keyof typeof GAP_FIXABLE;
+
 interface Gap {
   /** null for a plan-level gap (`test-first-unread`). */
   task: number | null;
-  kind: string;
+  kind: GapKind;
   detail: string;
+  fixable: boolean | null;
+  /** The line the verifier appends, carrying `Fixable: null` for a decision it makes itself. */
+  logLine: string;
+}
+
+/** One gap, with the `fixable` its kind settles and the ready-to-append log line. */
+function gapOf(
+  task: number | null,
+  kind: GapKind,
+  detail: string,
+  test?: { file: string; name: string },
+): Gap {
+  const fixable = GAP_FIXABLE[kind];
+  const subject = test === undefined ? "" : `\`${test.file}\` \`${test.name}\` — `;
+  return {
+    task,
+    kind,
+    detail,
+    fixable,
+    logLine: `${task === null ? "Plan" : `TASK ${task}`}: ${subject}${kind} — Fixable: ${fixable}`,
+  };
 }
 
+/** The report's verdict from its gaps: a decision one gap still needs (`null`) outranks one it refuses. */
+const verdictOf = (gaps: Gap[]): "PASS" | "FAIL" | "CONCERNS" | null =>
+  gaps.length === 0
+    ? "PASS"
+    : gaps.some((g) => g.fixable === null)
+      ? null
+      : gaps.some((g) => g.fixable === false)
+        ? "FAIL"
+        : "CONCERNS";
+
 /** Gaps about when a test was seen failing; no edit made after the task's code can close one. */
 export const TEST_ORDER_GAPS: ReadonlySet<string> = new Set([
   "no-red",
@@ -855,8 +906,7 @@ function deleteGaps(
               )
               .map((c) => path.posix.normalize(c.file))
           : [];
-      const gap = (detail: string) =>
-        gaps.push({ task: t.task, kind: DELETE_STILL_REFERENCED, detail });
+      const gap = (detail: string) => gaps.push(gapOf(t.task, DELETE_STILL_REFERENCED, detail));
       const abs = path.join(top, file);
       const exists = fs.statSync(abs, { throwIfNoEntry: false })?.isFile() === true;
       let what: string;
@@ -922,6 +972,7 @@ function writeAuditReport(
     enforced: boolean;
     reason?: string;
     plan?: string;
+    verdict: "PASS" | "FAIL" | "CONCERNS" | null;
     rows: AuditRow[];
     gaps: Gap[];
     testOrderOnly: boolean;
@@ -933,6 +984,7 @@ function writeAuditReport(
 ): void {
   const out = [
     `Enforced: ${o.enforced}`,
+    `Verdict: ${o.verdict}`,
     `Gaps: ${o.gaps.length}`,
     `Test order only: ${o.testOrderOnly}`,
     "",
@@ -954,7 +1006,9 @@ function writeAuditReport(
   out.push("## Gaps", "");
   if (o.gaps.length === 0) out.push("None.");
   for (const g of o.gaps)
-    out.push(`- ${g.task === null ? "Plan" : `Task ${g.task}`} \`${g.kind}\` — ${g.detail}`);
+    out.push(
+      `- ${g.task === null ? "Plan" : `Task ${g.task}`} \`${g.kind}\` — ${g.detail} — Fixable: ${g.fixable} — log: ${g.logLine}`,
+    );
   if (o.exceptions.length > 0) out.push("", "## Test exceptions", "");
   for (const e of o.exceptions)
     out.push(
@@ -1279,7 +1333,9 @@ export const testsCommand: CommandSpec = {
           "false when the audit could not run: no plan file, a plan with no task markers (exit 1), or the test-file script undeclared (exit 0)",
         reason: "why test-first is not enforced",
         plan: "the plan file audited",
-        gaps: "[{task, kind, detail}]: no-test-first | test-first-malformed | test-first-unread (task null: a plan-level format problem) | no-red | late-red | red-mismatch | red-evidence-missing | test-changed | not-green | exception-refused (a task whose only test field is a TEST EXCEPTION not honoured) | delete-still-referenced (a DELETE line's file still exists, or its name is still found in the tree)",
+        verdict:
+          "PASS no gaps | FAIL a gap's fixable is false | CONCERNS every gap's fixable is true | null when a gap needs a diff read, or the audit could not run",
+        gaps: "[{task, kind, detail, fixable, logLine}]: no-test-first | test-first-malformed | test-first-unread (task null: a plan-level format problem) | no-red | late-red | red-mismatch | red-evidence-missing | test-changed | not-green | exception-refused (a task whose only test field is a TEST EXCEPTION not honoured) | delete-still-referenced (a DELETE line's file still exists, or its name is still found in the tree); fixable is null when the gap needs a diff read; logLine is the line the verifier appends",
         testOrderOnly:
           "true when there are gaps and every one is a test-order gap (no-red | late-red | red-mismatch | red-evidence-missing | test-changed)",
         lateRedUnchecked:
@@ -1323,6 +1379,7 @@ export const testsCommand: CommandSpec = {
             ? `\`${BKIT_TEST_FILE_SCRIPT}\` is not declared in package.json`
             : undefined);
         const empty = {
+          verdict: null,
           rows: [],
           gaps: [],
           testOrderOnly: false,
@@ -1337,6 +1394,7 @@ export const testsCommand: CommandSpec = {
             enforced: false,
             reason,
             plan: plan ?? null,
+            verdict: null,
             gaps: [],
             testOrderOnly: false,
             lateRedUnchecked: [],
@@ -1389,22 +1447,25 @@ export const testsCommand: CommandSpec = {
               cleared: refused === null ? ["the task's `TEST FIRST` check"] : [],
             });
             if (refused !== null)
-              gaps.push({
-                task: s.task,
-                kind: EXCEPTION_REFUSED,
-                detail: `the task's only test field is a \`**TEST EXCEPTION:**\`, not honoured: ${refused}`,
-              });
+              gaps.push(
+                gapOf(
+                  s.task,
+                  EXCEPTION_REFUSED,
+                  `the task's only test field is a \`**TEST EXCEPTION:**\`, not honoured: ${refused}`,
+                ),
+              );
             continue;
           }
           if (s.kind !== "test") {
-            gaps.push({
-              task: s.task,
-              kind: s.kind === "missing" ? "no-test-first" : "test-first-malformed",
-              detail:
+            gaps.push(
+              gapOf(
+                s.task,
+                s.kind === "missing" ? "no-test-first" : "test-first-malformed",
                 s.kind === "missing"
                   ? "the task has neither a `**TEST FIRST:**` nor a `**TEST EXCEPTION:**` field"
                   : "`**TEST FIRST:**` is neither `n/a — {reason}` nor one sub-bullet per test naming a backticked test file and test name",
-            });
+              ),
+            );
             continue;
           }
           const excepted = s.exception;
@@ -1439,10 +1500,10 @@ export const testsCommand: CommandSpec = {
               excepted!.tests.some((e) => e.test === t.test && e.name === t.name)
                 ? exception
                 : undefined;
-            const gap = (kind: string, detail: string) => {
+            const gap = (kind: GapKind, detail: string) => {
               if (clearing !== undefined && TEST_ORDER_GAPS.has(kind))
                 clearing.cleared.push(`\`${kind}\` for \`${t.test}\` "${t.name}"`);
-              else gaps.push({ task: s.task, kind, detail });
+              else gaps.push(gapOf(s.task, kind, detail, { file: t.test, name: t.name }));
             };
             const red = [...taskReds]
               .reverse()
@@ -1503,11 +1564,12 @@ export const testsCommand: CommandSpec = {
                   fs.readFileSync(testAbs, "utf-8"),
                 );
                 row.changed = added ? "added lines only" : "yes";
-                if (!added)
-                  gap(
-                    "test-changed",
-                    `\`${t.test}\` differs from its red snapshot for "${t.name}" (diff below)`,
-                  );
+                gap(
+                  "test-changed",
+                  added
+                    ? `\`${t.test}\` gained lines since its red snapshot for "${t.name}" (diff below)`
+                    : `\`${t.test}\` differs from its red snapshot for "${t.name}" (diff below)`,
+                );
                 const diff = runGit(top, [
                   "diff",
                   "--no-index",
@@ -1545,15 +1607,19 @@ export const testsCommand: CommandSpec = {
           ),
         );
         for (const e of parsed.errors)
-          gaps.push({
-            task: null,
-            kind: "test-first-unread",
-            detail: `\`${plan}:${e.line}\` ${e.message} — tests there were not audited; the plan's blocks need fixing`,
-          });
+          gaps.push(
+            gapOf(
+              null,
+              "test-first-unread",
+              `\`${plan}:${e.line}\` ${e.message} — tests there were not audited; the plan's blocks need fixing`,
+            ),
+          );
         const testOrderOnly = gaps.length > 0 && gaps.every((g) => TEST_ORDER_GAPS.has(g.kind));
+        const verdict = verdictOf(gaps);
         writeAuditReport(log, {
           enforced: true,
           plan,
+          verdict,
           rows,
           gaps,
           testOrderOnly,
@@ -1565,6 +1631,7 @@ export const testsCommand: CommandSpec = {
         ctx.emit({
           enforced: true,
           plan,
+          verdict,
           gaps,
           testOrderOnly,
           lateRedUnchecked: [...lateUnchecked].sort((a, b) => a - b),
diff --git a/.bkit/core/prompts/bkit-build-plan-verify.md b/.bkit/core/prompts/bkit-build-plan-verify.md
index d9c0754d5..36a72ce20 100644
--- a/.bkit/core/prompts/bkit-build-plan-verify.md
+++ b/.bkit/core/prompts/bkit-build-plan-verify.md
@@ -60,26 +60,21 @@ autoCompactWindow: 300000
 1. Initialise **Create** output stub with `PENDING` placeholders.
 2. Re-read all supplied inputs once at session start; do not trust session memory.
 3. Read `.agents/docs.md` → load docs for workflow / step / task; skip missing.
-4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available. Per gap — append log at EOF via Bash `echo {log entry} >> {output}`; heredoc for multi-line; each entry ends `— Fixable: true` or `— Fixable: false` (by gap-remediate). **If** any gap `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
+4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available. Per gap — append log at EOF via Bash `echo {log entry} >> {output}`; heredoc for multi-line; `{log entry}` is the gap's report `logLine` with your decided `Fixable: true` / `Fixable: false` in place of the engine's `Fixable: null`; each entry ends `— Fixable: true` or `— Fixable: false` (by gap-remediate). **If** any gap `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
 5. Determine `Mode` from input Context (`Group` or `Holistic`).
 6. **If** `Group` → the supplied briefs' task blocks are the work; judge them against the supplied group diff (the changes since the group started), not the whole branch; a brief's `Deviations` section holds the owner's run instructions → judge the tasks it names as it directs. Every task field and gate maps to real codebase changes. Find missing components, skipped steps, unimplemented edge cases. Cross-reference the tasks vs the execute log's `DONE — TASK {N}` lines; a `DONE` line is a claim to check, never proof.
 7. **If** `Holistic` → same task / gate / `DONE` log cross-reference across every group of the plan, plus integration: groups' components work together? API contracts match? Shared state consistent? Cross-domain boundaries respected? Run `pnpm bkit:gate:static-unit`.
-8. **If** test-first audit report supplied (`Enforced` / `Gaps` header) → map its gaps per task:
-   - `not-green` → `Fixable: true`.
+8. **If** test-first audit report supplied (`Enforced` / `Verdict` / `Gaps` header) → decide each gap: its `fixable` stands unless `null`, and a `null` one you decide from the diff it names:
    - `delete-still-referenced` → read each hit; a different thing with the same name → no gap; else `Fixable: true`.
    - `test-changed` → read its diff; only formatting → no gap; weakened, removed or rewritten assertions → `Fixable: false`.
-   - Row `Changed since red` = `added lines only` → read its diff; any line added inside a planned test or in setup it runs (`beforeEach`, fixture, mock) → `test-changed` gap, `Fixable: false`; added lines only outside every planned test → no gap.
+   - `test-changed` on a row whose `Changed since red` = `added lines only` → read its diff; any line added inside a planned test or in setup it runs (`beforeEach`, fixture, mock) → `Fixable: false`; added lines only outside every planned test → no gap.
    - `red-mismatch` → recorded test is the planned one renamed or moved **and** passes now → no gap, nor for that test's `not-green`; else `Fixable: false`.
-   - `no-red` on a task the plan-currency report classifies `Broken` with work already landed **and** the execute log records `DONE — TASK {N}: already landed` → no gap.
-   - `no-red`, `late-red`, `no-test-first`, `test-first-malformed`, `test-first-unread`, `red-evidence-missing`, `exception-refused` → `Fixable: false`.
-   - Test-order gap (`no-red`, `late-red`, `red-mismatch`, `red-evidence-missing`, `test-changed`) → log as ``TASK {N}: `{test file}` `{test name}` — {kind} — Fixable: false``.
+   - `no-red` on a task the plan-currency report classifies `Broken` with work already landed **and** the execute log records `DONE — TASK {N}: already landed` → no gap, overriding the gap's `Fixable: false`.
    - `Enforced: false` → reason in `Notes`; no gap.
    - `Late-red check` section → each task not checked in `Notes`; no gap.
+   - A gap you leave `Fixable: false` is a `FAIL`.
 9. Per task → assert codebase satisfies `DONE WHEN` (file exists, signature matches, test passes, observable behaviour) and has no test-first audit gap; `BLOCKED` log lines, `docs/deferrals.jsonl` rows, and out-of-scope notes never satisfy it; gaps a supplied decision record accepts (`Decision: Accept`, or `Decision: Accept (assumed)`) are no gap (name the record in `Notes`; an assumed accept is taken without the owner, so add `assumed, not the owner's acceptance`). **If** satisfied → tick its `- [ ] **TASK {N}:**` line `[x]` in the plan file; tick nothing else. **If** not satisfied or missing → leave `[ ]`, append log; **If** the gap is `Fixable: false` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
-10. Update **Create** — set `Failures` via `Edit` = count of unresolved gaps; set `Fixable` via `Edit` = `true` when any of those is `Fixable: true`, else `false`; set `Verdict` via `Edit`; mapping:
-    - `PASS` = no gaps.
-    - `FAIL` = any gap `Fixable: false`.
-    - `CONCERNS` = every gap `Fixable: true`.
+10. Update **Create** — set `Failures` via `Edit` = count of unresolved gaps; set `Fixable` via `Edit` = `true` when any of those is `Fixable: true`, else `false`; set `Verdict` via `Edit` = the roll-up over the `Fixable` you decided: any `false` → `FAIL`, **Else** any `true` → `CONCERNS`, **Else** → `PASS`; never the report's `null`.
 
 **Output format:**
 
@@ -87,6 +82,7 @@ autoCompactWindow: 300000
 Verdict: PASS | CONCERNS | FAIL [Initially set to PENDING.]
 Failures: <integer >= 0>
 Fixable: true | false
+Tasks: <the task numbers you judged satisfied, comma-separated; none when there are none>
 
 <!-- verdict:end -->
 
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index b7a73c724..513c6f83f 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -2587,7 +2587,7 @@ Produce **Create** output.
 
 - prompt: where-used
 - except: bkit-design-review-1
-- carriers: prompt `bkit-build-challenge-*`, `bkit-design-review-*`, `bkit-plan-review-*`, `bkit-build-plan-current`, `bkit-build-plan-execute`, `bkit-build-plan-gaps-remediate`, `bkit-build-plan-verify`, `bkit-debug-failure-diagnose`, `bkit-debug-failure-remediate`, `bkit-debug-failure-soak`, `bkit-design-organise`, `bkit-design-spike`, `bkit-design-update`, `bkit-plan-scope-check`, `bkit-plan-update`, `bkit-ship-conflict-resolve`, `bkit-ship-deferred-sweep`
+- carriers: prompt `bkit-build-challenge-*`, `bkit-design-review-*`, `bkit-plan-review-*`, `bkit-build-plan-current`, `bkit-build-plan-execute`, `bkit-build-plan-gaps-remediate`, `bkit-debug-failure-diagnose`, `bkit-debug-failure-remediate`, `bkit-debug-failure-soak`, `bkit-design-organise`, `bkit-design-spike`, `bkit-design-update`, `bkit-plan-scope-check`, `bkit-plan-update`, `bkit-ship-conflict-resolve`, `bkit-ship-deferred-sweep`
 
 ```text
 Update **Create** — set `Verdict` via `Edit`; mapping:
@@ -7698,24 +7698,19 @@ Read the group's briefs (its task blocks), plan gaps, the group gate log (if sup
 
 ```text
 **Role:** Senior verifier checking that plan deliverables actually exist in the codebase.
-**If** test-first audit report supplied (`Enforced` / `Gaps` header) → map its gaps per task:
-`not-green` → `Fixable: true`.
+**If** test-first audit report supplied (`Enforced` / `Verdict` / `Gaps` header) → decide each gap: its `fixable` stands unless `null`, and a `null` one you decide from the diff it names:
 [R72] `test-changed` → read its diff; only formatting → no gap; weakened, removed or rewritten assertions → `Fixable: false`.
-[R72] Row `Changed since red` = `added lines only` → read its diff; any line added inside a planned test or in setup it runs (`beforeEach`, fixture, mock) → `test-changed` gap, `Fixable: false`; added lines only outside every planned test → no gap.
+[R72] `test-changed` on a row whose `Changed since red` = `added lines only` → read its diff; any line added inside a planned test or in setup it runs (`beforeEach`, fixture, mock) → `Fixable: false`; added lines only outside every planned test → no gap.
 `red-mismatch` → recorded test is the planned one renamed or moved **and** passes now → no gap, nor for that test's `not-green`; else `Fixable: false`.
+A gap you leave `Fixable: false` is a `FAIL`.
 `Enforced: false` → reason in `Notes`; no gap.
 `Late-red check` section → each task not checked in `Notes`; no gap.
-Update **Create** — set `Failures` via `Edit` = count of unresolved gaps; set `Fixable` via `Edit` = `true` when any of those is `Fixable: true`, else `false`; set `Verdict` via `Edit`; mapping:
-`PASS` = no gaps.
-`FAIL` = any gap `Fixable: false`.
-`CONCERNS` = every gap `Fixable: true`.
+Update **Create** — set `Failures` via `Edit` = count of unresolved gaps; set `Fixable` via `Edit` = `true` when any of those is `Fixable: true`, else `false`; set `Verdict` via `Edit` = the roll-up over the `Fixable` you decided: any `false` → `FAIL`, **Else** any `true` → `CONCERNS`, **Else** → `PASS`; never the report's `null`.
 Determine `Mode` from input Context (`Group` or `Holistic`).
 **If** `Group` → the supplied briefs' task blocks are the work; judge them against the supplied group diff (the changes since the group started), not the whole branch; a brief's `Deviations` section holds the owner's run instructions → judge the tasks it names as it directs. Every task field and gate maps to real codebase changes. Find missing components, skipped steps, unimplemented edge cases. Cross-reference the tasks vs the execute log's `DONE — TASK {N}` lines; a `DONE` line is a claim to check, never proof.
 [R78] **If** `Holistic` → same task / gate / `DONE` log cross-reference across every group of the plan, plus integration: groups' components work together? API contracts match? Shared state consistent? Cross-domain boundaries respected? Run `pnpm bkit:gate:static-unit`.
 `delete-still-referenced` → read each hit; a different thing with the same name → no gap; else `Fixable: true`.
-`no-red` on a task the plan-currency report classifies `Broken` with work already landed **and** the execute log records `DONE — TASK {N}: already landed` → no gap.
-`no-red`, `late-red`, `no-test-first`, `test-first-malformed`, `test-first-unread`, `red-evidence-missing`, `exception-refused` → `Fixable: false`.
-Test-order gap (`no-red`, `late-red`, `red-mismatch`, `red-evidence-missing`, `test-changed`) → log as ``TASK {N}: `{test file}` `{test name}` — {kind} — Fixable: false``.
+`no-red` on a task the plan-currency report classifies `Broken` with work already landed **and** the execute log records `DONE — TASK {N}: already landed` → no gap, overriding the gap's `Fixable: false`.
 ```
 
 #### bkit-debug-abort-handover
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index 5208f8300..1ce80ba9c 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -514,6 +514,43 @@ export const snapshotPath = (log) => `${log.replace(/\.md$/, "")}.snapshot`;
 const toplevel = (cwd) => git(cwd, ["rev-parse", "--show-toplevel"]) ?? cwd;
 /** A fence longer than any backtick run in `text`. */
 const fenceFor = (text) => "`".repeat(Math.max(3, ...[...text.matchAll(/`+/g)].map((m) => m[0].length + 1)));
+/**
+ * Every gap the audit emits, and the verifier's `Fixable` for it: `null` = the
+ * answer needs a diff read, which only the verifier can make.
+ */
+const GAP_FIXABLE = {
+    "not-green": true,
+    "delete-still-referenced": null,
+    "test-changed": null,
+    "red-mismatch": null,
+    "no-red": false,
+    "late-red": false,
+    "no-test-first": false,
+    "test-first-malformed": false,
+    "test-first-unread": false,
+    "red-evidence-missing": false,
+    "exception-refused": false,
+};
+/** One gap, with the `fixable` its kind settles and the ready-to-append log line. */
+function gapOf(task, kind, detail, test) {
+    const fixable = GAP_FIXABLE[kind];
+    const subject = test === undefined ? "" : `\`${test.file}\` \`${test.name}\` — `;
+    return {
+        task,
+        kind,
+        detail,
+        fixable,
+        logLine: `${task === null ? "Plan" : `TASK ${task}`}: ${subject}${kind} — Fixable: ${fixable}`,
+    };
+}
+/** The report's verdict from its gaps: a decision one gap still needs (`null`) outranks one it refuses. */
+const verdictOf = (gaps) => gaps.length === 0
+    ? "PASS"
+    : gaps.some((g) => g.fixable === null)
+        ? null
+        : gaps.some((g) => g.fixable === false)
+            ? "FAIL"
+            : "CONCERNS";
 /** Gaps about when a test was seen failing; no edit made after the task's code can close one. */
 export const TEST_ORDER_GAPS = new Set([
     "no-red",
@@ -665,7 +702,7 @@ function deleteGaps(top, planRel, tasks, planTasks) {
                     path.posix.basename(path.posix.normalize(c.file)) === path.posix.basename(file))
                     .map((c) => path.posix.normalize(c.file))
                 : [];
-            const gap = (detail) => gaps.push({ task: t.task, kind: DELETE_STILL_REFERENCED, detail });
+            const gap = (detail) => gaps.push(gapOf(t.task, DELETE_STILL_REFERENCED, detail));
             const abs = path.join(top, file);
             const exists = fs.statSync(abs, { throwIfNoEntry: false })?.isFile() === true;
             let what;
@@ -711,6 +748,7 @@ export function redRows(file, workflow) {
 function writeAuditReport(log, o) {
     const out = [
         `Enforced: ${o.enforced}`,
+        `Verdict: ${o.verdict}`,
         `Gaps: ${o.gaps.length}`,
         `Test order only: ${o.testOrderOnly}`,
         "",
@@ -732,7 +770,7 @@ function writeAuditReport(log, o) {
     if (o.gaps.length === 0)
         out.push("None.");
     for (const g of o.gaps)
-        out.push(`- ${g.task === null ? "Plan" : `Task ${g.task}`} \`${g.kind}\` — ${g.detail}`);
+        out.push(`- ${g.task === null ? "Plan" : `Task ${g.task}`} \`${g.kind}\` — ${g.detail} — Fixable: ${g.fixable} — log: ${g.logLine}`);
     if (o.exceptions.length > 0)
         out.push("", "## Test exceptions", "");
     for (const e of o.exceptions)
@@ -1035,7 +1073,8 @@ export const testsCommand = {
                 enforced: "false when the audit could not run: no plan file, a plan with no task markers (exit 1), or the test-file script undeclared (exit 0)",
                 reason: "why test-first is not enforced",
                 plan: "the plan file audited",
-                gaps: "[{task, kind, detail}]: no-test-first | test-first-malformed | test-first-unread (task null: a plan-level format problem) | no-red | late-red | red-mismatch | red-evidence-missing | test-changed | not-green | exception-refused (a task whose only test field is a TEST EXCEPTION not honoured) | delete-still-referenced (a DELETE line's file still exists, or its name is still found in the tree)",
+                verdict: "PASS no gaps | FAIL a gap's fixable is false | CONCERNS every gap's fixable is true | null when a gap needs a diff read, or the audit could not run",
+                gaps: "[{task, kind, detail, fixable, logLine}]: no-test-first | test-first-malformed | test-first-unread (task null: a plan-level format problem) | no-red | late-red | red-mismatch | red-evidence-missing | test-changed | not-green | exception-refused (a task whose only test field is a TEST EXCEPTION not honoured) | delete-still-referenced (a DELETE line's file still exists, or its name is still found in the tree); fixable is null when the gap needs a diff read; logLine is the line the verifier appends",
                 testOrderOnly: "true when there are gaps and every one is a test-order gap (no-red | late-red | red-mismatch | red-evidence-missing | test-changed)",
                 lateRedUnchecked: "tasks with a red but no plan-execute step commit whose log records `DONE — TASK N`: the late-red check could not run for them",
                 log: "where the report was written (as given)",
@@ -1077,6 +1116,7 @@ export const testsCommand = {
                         ? `\`${BKIT_TEST_FILE_SCRIPT}\` is not declared in package.json`
                         : undefined);
                 const empty = {
+                    verdict: null,
                     rows: [],
                     gaps: [],
                     testOrderOnly: false,
@@ -1091,6 +1131,7 @@ export const testsCommand = {
                         enforced: false,
                         reason,
                         plan: plan ?? null,
+                        verdict: null,
                         gaps: [],
                         testOrderOnly: false,
                         lateRedUnchecked: [],
@@ -1139,21 +1180,13 @@ export const testsCommand = {
                             cleared: refused === null ? ["the task's `TEST FIRST` check"] : [],
                         });
                         if (refused !== null)
-                            gaps.push({
-                                task: s.task,
-                                kind: EXCEPTION_REFUSED,
-                                detail: `the task's only test field is a \`**TEST EXCEPTION:**\`, not honoured: ${refused}`,
-                            });
+                            gaps.push(gapOf(s.task, EXCEPTION_REFUSED, `the task's only test field is a \`**TEST EXCEPTION:**\`, not honoured: ${refused}`));
                         continue;
                     }
                     if (s.kind !== "test") {
-                        gaps.push({
-                            task: s.task,
-                            kind: s.kind === "missing" ? "no-test-first" : "test-first-malformed",
-                            detail: s.kind === "missing"
-                                ? "the task has neither a `**TEST FIRST:**` nor a `**TEST EXCEPTION:**` field"
-                                : "`**TEST FIRST:**` is neither `n/a — {reason}` nor one sub-bullet per test naming a backticked test file and test name",
-                        });
+                        gaps.push(gapOf(s.task, s.kind === "missing" ? "no-test-first" : "test-first-malformed", s.kind === "missing"
+                            ? "the task has neither a `**TEST FIRST:**` nor a `**TEST EXCEPTION:**` field"
+                            : "`**TEST FIRST:**` is neither `n/a — {reason}` nor one sub-bullet per test naming a backticked test file and test name"));
                         continue;
                     }
                     const excepted = s.exception;
@@ -1185,7 +1218,7 @@ export const testsCommand = {
                             if (clearing !== undefined && TEST_ORDER_GAPS.has(kind))
                                 clearing.cleared.push(`\`${kind}\` for \`${t.test}\` "${t.name}"`);
                             else
-                                gaps.push({ task: s.task, kind, detail });
+                                gaps.push(gapOf(s.task, kind, detail, { file: t.test, name: t.name }));
                         };
                         const red = [...taskReds]
                             .reverse()
@@ -1237,8 +1270,9 @@ export const testsCommand = {
                             else if (!fs.readFileSync(snapAbs).equals(fs.readFileSync(testAbs))) {
                                 const added = onlyAddsLines(fs.readFileSync(snapAbs, "utf-8"), fs.readFileSync(testAbs, "utf-8"));
                                 row.changed = added ? "added lines only" : "yes";
-                                if (!added)
-                                    gap("test-changed", `\`${t.test}\` differs from its red snapshot for "${t.name}" (diff below)`);
+                                gap("test-changed", added
+                                    ? `\`${t.test}\` gained lines since its red snapshot for "${t.name}" (diff below)`
+                                    : `\`${t.test}\` differs from its red snapshot for "${t.name}" (diff below)`);
                                 const diff = runGit(top, [
                                     "diff",
                                     "--no-index",
@@ -1271,15 +1305,13 @@ export const testsCommand = {
                 }
                 gaps.push(...deleteGaps(top, repoRel(top, ctx.cwd, plan), parsed.tasks.filter((t) => group === undefined || t.group === group), parsed.tasks));
                 for (const e of parsed.errors)
-                    gaps.push({
-                        task: null,
-                        kind: "test-first-unread",
-                        detail: `\`${plan}:${e.line}\` ${e.message} — tests there were not audited; the plan's blocks need fixing`,
-                    });
+                    gaps.push(gapOf(null, "test-first-unread", `\`${plan}:${e.line}\` ${e.message} — tests there were not audited; the plan's blocks need fixing`));
                 const testOrderOnly = gaps.length > 0 && gaps.every((g) => TEST_ORDER_GAPS.has(g.kind));
+                const verdict = verdictOf(gaps);
                 writeAuditReport(log, {
                     enforced: true,
                     plan,
+                    verdict,
                     rows,
                     gaps,
                     testOrderOnly,
@@ -1291,6 +1323,7 @@ export const testsCommand = {
                 ctx.emit({
                     enforced: true,
                     plan,
+                    verdict,
                     gaps,
                     testOrderOnly,
                     lateRedUnchecked: [...lateUnchecked].sort((a, b) => a - b),
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index 80511417d..09a3101db 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -316,3 +316,4 @@
 {"schema":3,"ts":1793004573755,"kind":"knowledge","key":"instructions-store-clause-text-and-local-entries-need-hand-edits","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":[".bkit/instructions.md",".bkit/core/engine/tools/instructions.ts",".bkit/core/engine/tools/instructions-coverage.test.ts",".bkit/core/workflows/bkit-debug.md",".bkit/core/docs/templates/bkit-plan.md"],"summary":"Editing a standing workflow / prompt / template line reds three instruction tools until the store's clause text and its `## Local Instructions` entry move with it; `pnpm instructions:sync` rewrites neither","description":"- **Category:** tooling\n- **Symptom:** after an edit to a standing line (a list item, or a line carrying `NEVER` / `ALWAYS` / `→`), `pnpm test` fails with `instructions-coverage.test.ts` `\"bkit-debug: local entry no longer in the file: …\"` plus `\".bkit/core/workflows/bkit-debug.md:108: no entry — add under #### bkit-debug: …\"`, and `instructions.test.ts` fails `has no findings` (near-copy), `sync has nothing left to rewrite` and `every clause reaches the cut-off of one surface it applies to`.\n- **Root cause:** `.bkit/instructions.md` holds the corpus twice over. A `## Clauses` entry carries one shared sentence, matched as a substring of a carrier line, and a `## Local Instructions` entry per file holds every standing local line verbatim. `pnpm instructions:sync` rewrites only the clause *instances* inside the carrier files and the generated copies; it never rewrites a clause's own `text` block or a local entry's line. A shared line whose only two carriers both moved also drops under `SHARED_MIN.workflow` of 2, which reads as an underused clause.\n- **Fix or rule:** edit the clause in the store — new wording in the ```` ```text ```` block, the old wording appended to ```` ```retired ```` (never a wording that is a prefix of its new text) — then run `pnpm instructions:sync` so every carrier takes it, and hand-edit the affected `## Local Instructions` entries to the new line. Verify with `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` (exit 0) and a second `pnpm instructions:sync` that prints nothing, then run `instructions.test.ts`, `instructions-coverage.test.ts` and `instructions-sources.test.ts`.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"`.bkit/instructions.md` is the one store for two kinds of record — `## Clauses` texts (substring-matched against carrier lines) and `## Local Instructions` entries (verbatim copies of each file's standing lines) — and `syncSources` / `syncClauses` / `syncCoverage` rewrite neither a clause's own text nor a local entry's line, so an edited line leaves the old store text dangling and the new line uncovered.","remediation":"Move the clause text in `.bkit/instructions.md` (old wording to `retired`, new wording to the ```` ```text ```` block), run `pnpm instructions:sync` so the carriers take it, then hand-edit every `## Local Instructions` entry whose file changed. Check with `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` (exit 0) plus a second `pnpm instructions:sync` that prints nothing.","status":"ACTIVE"}
 {"schema":3,"ts":1793004573756,"kind":"knowledge","key":"bkit-tests-red-snapshot-accepts-added-lines-only","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":[".bkit/core/engine/commands/workflow/tests.ts",".bkit/core/engine/audits/workflows/question-option-format.test.ts"],"summary":"`bkit tests green` reads a test file as unchanged only when it keeps every snapshot line in order, so a fix to a rule after its recorded red must be pure addition","description":"- **Category:** tooling\n- **Symptom:** `bkit tests green` reports `changed: yes` and a `test-changed` gap for a test that passed its recorded red, with a `Diff since red` block, after the rule under test was corrected.\n- **Root cause:** `bkit tests red` copies the test file beside its log as `<log>.snapshot` and stores its blob; the green audit compares that snapshot with the current file through `onlyAddsLines`, which walks the snapshot's non-blank, whitespace-stripped lines as a subsequence of the current file. Inserted lines anywhere pass (`added lines only`); any modified or removed line fails. A red cannot simply be re-recorded, because `bkit tests red` refuses `passed` for a named test that now succeeds.\n- **Fix or rule:** correct a red-flagged rule by adding lines — a normalisation pass appended inside the existing function, for instance — never by editing the lines the red validated; add the new behaviour as a separate pass over the existing output and leave the old lines in order. A `TEST EXCEPTION` committed by a human is the only other way past a test-order gap.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"`onlyAddsLines` is a subsequence test over the snapshot's normalised lines, so the red evidence pins the exact byte order of the old lines: an edit breaks it, an insertion does not. `bkit tests red` will not re-record a red for a named test that now passes.","remediation":"After a red, extend the rule with inserted lines (an extra pass over the existing function's result) and keep every old line intact; verify the gap stays clear with `bkit tests green --group=<n>`.","status":"ACTIVE"}
 {"schema":3,"ts":1793005661580,"kind":"knowledge","key":"dogfood-template-mirrors-need-install-after-a-core-template-or-core-bkit-doc-edit","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"openrouter/deepseek-v4.1-flash"},"references":[".bkit/core/engine/audits/templates/templates.test.ts",".bkit/core/docs/templates/bkit-plan.md","docs/templates/bkit-plan.md",".bkit/core/.bkit/workflows.md",".bkit/workflows.md",".bkit/install.md"],"summary":"Editing a core template or a core `.bkit/` doc reds the unit gate on the dogfood-parity test until the repo's own `bkit install` re-renders the mirrors","description":"The unit tier holds the repo's own installed copies byte-equal to their sources: `.bkit/core/engine/audits/templates/templates.test.ts` asserts `docs/templates/bkit-plan.md` and every `docs/templates/bkit-audit-*.md` equal their `.bkit/core/docs/templates/*` source but for the managed-version stamp, and `bkit check`'s core pass writes the `.bkit/core/.bkit/*.md` sources into the root `.bkit/*.md` mirrors. So an edit to a `.bkit/core/docs/templates/*.md` or `.bkit/core/.bkit/*.md` file leaves the gate red until the mirrors move, and the same edit makes `bkit check` report N write(s) of drift. A bare `bkit install` is not the fix: it errors because at least one module flag is required.","rootCause":"`docs/templates/bkit-*.md` and the root `.bkit/*.md` reference docs are install OUTPUTS, not hand-kept files, but only the host mirrors (`.claude/`, `.cursor/`, `.codex/`, `.opencode/`, `.agents/skills/`, `.agents/plugins/bkit/`) are conventionally thought of as rendered; the dogfood template and reference-doc copies look like ordinary tracked markdown, so a source edit there reads as complete while its mirror is still stale.","remediation":"After editing any `.bkit/core/docs/templates/*.md` or `.bkit/core/.bkit/*.md` file, re-render the mirrors with the repo's own install — `pnpm bkit install --claude --cursor --codex --antigravity --opencode=<provider>` (every installed host; a bare `bkit install` errors) — then confirm `node dist/cli.js check` reports 0 write(s). NEVER hand-edit `docs/templates/bkit-*.md` or the root `.bkit/*.md` mirrors; the install owns them and would revert the edit. `.bkit/version` re-pins the re-rendered files' hashes in the same run, so commit it too.","status":"ACTIVE"}
+{"schema":3,"ts":1793100920719,"kind":"knowledge","key":"prettier-write-after-a-red-breaks-the-test-first-audit","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":[".bkit/core/engine/commands/workflow/tests.ts",".bkit/core/prompts/bkit-build-plan-verify.md"],"summary":"Format a test file before recording its red; a later `prettier --write` moves a line and the green audit then reports `test-changed` with `changed: yes`","description":"- **Category:** tooling\n- **Symptom:** `bkit tests green` reports one `test-changed` gap per planned test in a file whose reds were all recorded, with `Changed since red` = `yes` and a diff that removes a single line (a wrapped `expect(…)` joined into one line) and adds the task's new tests.\n- **Root cause:** `onlyAddsLines` walks the red snapshot's whitespace-stripped, non-blank lines as a subsequence of the current file, so a prettier pass that joins a wrapped call, or splits a long one, removes a line the snapshot holds and turns the row from `added lines only` into `yes`. `bkit tests red` cannot re-record the red once the named test passes.\n- **Fix or rule:** run `prettier --write` on the test file before recording its reds, and after every later test edit check the row with `bkit tests green`: an additions-only diff keeps the row at `added lines only`, whose prompt rule clears added lines outside every planned test.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"Red evidence pins the snapshot's line sequence; the formatter is the usual second writer of a test file after its red, and the red cannot be re-recorded once the test passes.","remediation":"`prettier --write` the test file before `bkit tests red`, and keep every post-red edit a pure insertion.","status":"ACTIVE"}
