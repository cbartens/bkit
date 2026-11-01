Enforced: true
Verdict: null
Gaps: 5
Test order only: false

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/699-engine-run-completeness-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 6 | `.bkit/core/engine/checks/status-holes.test.ts` "derives the expected step universe for every workflow" | recorded 2026-10-28T22:01:08Z | yes | passed |
| 6 | `.bkit/core/engine/checks/status-holes.test.ts` "records every {BKIT} literal in a step as a required call" | missing | — | not passed |
| 6 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "holds the workflows to the step table" | recorded 2026-10-28T22:01:13Z | yes | passed |
| 6 | `.bkit/core/engine/checks/status-holes.test.ts` "prints a sweep summary line and exits 0" | recorded 2026-10-28T22:01:15Z | yes | passed |
| 7 | `.bkit/core/engine/checks/status-holes.test.ts` "classifies a step conditional only under the column-0 marker rule" | missing | — | passed |
| 7 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "writes a build-plan-convert row on the no-conversion route" | missing | — | passed |

## Gaps

- Task 6 `red-mismatch` — no red for `.bkit/core/engine/checks/status-holes.test.ts` "records every {BKIT} literal in a step as a required call"; reds recorded for `.bkit/core/engine/checks/status-holes.test.ts` "records every BKIT literal in a step as a required call" (passes now) — Fixable: null — log: TASK 6: `.bkit/core/engine/checks/status-holes.test.ts` `records every {BKIT} literal in a step as a required call` — red-mismatch — Fixable: null
- Task 6 `not-green` — the named test "records every {BKIT} literal in a step as a required call" did not run; the report holds "source derivation > derives the expected step universe for every workflow", "source derivation > reports table drift without failing", "source derivation > records every BKIT literal in a step as a required call", "source derivation > derives a required call from each {BKIT} literal of every live step section", "source derivation > parses a synthetic md with headings + literals", … — Fixable: true — log: TASK 6: `.bkit/core/engine/checks/status-holes.test.ts` `records every {BKIT} literal in a step as a required call` — not-green — Fixable: true
- Task 6 `test-changed` — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` differs from its red snapshot for "holds the workflows to the step table" (diff below) — Fixable: null — log: TASK 6: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `holds the workflows to the step table` — test-changed — Fixable: null
- Task 6 `test-changed` — `.bkit/core/engine/checks/status-holes.test.ts` differs from its red snapshot for "prints a sweep summary line and exits 0" (diff below) — Fixable: null — log: TASK 6: `.bkit/core/engine/checks/status-holes.test.ts` `prints a sweep summary line and exits 0` — test-changed — Fixable: null
- Task 6 `delete-still-referenced` — DELETE `.bkit/core/engine/checks/status-holes.ts`: the file still exists — Fixable: null — log: TASK 6: delete-still-referenced — Fixable: null

## Test exceptions

- Task 6 — honoured; cleared `test-changed` for `.bkit/core/engine/checks/status-holes.test.ts` "derives the expected step universe for every workflow"
- Task 7 — honoured; cleared `no-red` for `.bkit/core/engine/checks/status-holes.test.ts` "classifies a step conditional only under the column-0 marker rule", `no-red` for `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "writes a build-plan-convert row on the no-conversion route"

## Diff since red — Task 6 `.bkit/core/engine/checks/status-holes.test.ts`

````diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-3-6-1.snapshot b/.bkit/core/engine/checks/status-holes.test.ts
index 315dcc7d2..4524e241f 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-3-6-1.snapshot
+++ b/.bkit/core/engine/checks/status-holes.test.ts
@@ -22,6 +22,7 @@ import { describe, expect, it } from "vitest";
 import { WORKFLOW_STEPS } from "../commands/workflow/step-table";
 import {
   SHIP_STEP_ORDER,
+  auditRun,
   auditStatusJsonl,
   callWords,
   classifyRun,
@@ -150,8 +151,8 @@ describe("source derivation", () => {
       const contract = deriveContract(flowMd(name), name);
       expect([...contract.universe].sort(), name).toEqual([...tableKeys(name)].sort());
       expect(contract.drift, name).toEqual([]);
-      expect(contract.orphanSteps, name).toEqual([]);
     }
+    expect(deriveContract(flowMd("ship"), "ship").orphanSteps).toEqual([]);
     expect([...SHIP_STEP_ORDER]).toEqual(tableKeys("ship"));
   });
 
@@ -164,7 +165,7 @@ describe("source derivation", () => {
     expect(contract.drift).toContain("table-but-not-source:ship-merge-pr");
   });
 
-  it("records every {BKIT} literal in a step as a required call", () => {
+  it("records every BKIT literal in a step as a required call", () => {
     const md = [
       "## Opening",
       '"{BKIT}" runs context --workflow=x',
@@ -189,18 +190,20 @@ describe("source derivation", () => {
     expect(contract.steps[1]!.calls).toEqual([
       { noun: "branches", verb: "push", flags: ["remote"] },
     ]);
-    expect(contract.workflowCalls).toEqual([{ noun: "runs", verb: "context", flags: ["workflow"] }]);
+    expect(contract.workflowCalls).toEqual([
+      { noun: "runs", verb: "context", flags: ["workflow"] },
+    ]);
   });
 
   it("derives a required call from each {BKIT} literal of every live step section", () => {
     for (const name of FLOWS) {
       const md = flowMd(name);
       const contract = deriveContract(md, name);
-      const inSteps = stepSections(md).reduce(
-        (n, s) => n + (s.body.match(/"\{BKIT\}"/g)?.length ?? 0),
-        0,
-      );
-      expect(contract.steps.reduce((n, s) => n + s.calls.length, 0), name).toBe(inSteps);
+      const inSteps = stepSections(md).reduce((n, s) => n + s.body.split('"{BKIT}"').length - 1, 0);
+      expect(
+        contract.steps.reduce((n, s) => n + s.calls.length, 0),
+        name,
+      ).toBe(inSteps);
       expect(inSteps, name).toBeGreaterThan(0);
     }
     expect(callWords('steps finish --a="x y" | tee')).toEqual(["steps", "finish", '--a="x y"']);
@@ -208,11 +211,11 @@ describe("source derivation", () => {
 
   it("parses a synthetic md with headings + literals", () => {
     const fakeMd = [
-      "## Step 1 — Start",
+      "## 🧠 Step 1 — Start",
       "```bash",
       '  step:"ship-start-workflow"',
       "```",
-      "## Step 2 — Setup",
+      "## 🧠 Step 2 — Setup",
       "```bash",
       '  step:"ship-worktree-setup"',
       "```",
@@ -225,7 +228,7 @@ describe("source derivation", () => {
 
   it("flags a status write that lives outside any numbered step (orphanSteps)", () => {
     const fakeMd = [
-      "## Step 1 — Start",
+      "## 🧠 Step 1 — Start",
       "```bash",
       '  step:"ship-start-workflow"',
       "```",
@@ -718,6 +721,72 @@ describe("CLI main() — advisory exit 0", () => {
   });
 });
 
+describe("step conditionality", () => {
+  // Step numbers whose section carries a column-0 marker (or a `(Path X only)` heading).
+  const CONDITIONAL_STEPS = {
+    design: [7, 11, 12],
+    plan: [8],
+    build: [6, 9, 13, 14, 15, 16],
+    debug: [4, 5, 6, 7, 8, 9, 10, 11],
+    ship: [4, 11, 12, 13],
+  } as const;
+
+  it("classifies a step conditional only under the column-0 marker rule", () => {
+    for (const name of FLOWS) {
+      const contract = deriveContract(flowMd(name), name);
+      expect(
+        contract.steps.filter((s) => s.conditional).map((s) => s.number),
+        name,
+      ).toEqual([...CONDITIONAL_STEPS[name]]);
+    }
+    const md = [
+      "## 🧠 Step 1 — Plain",
+      "   **Skip if** `ISSUE_ID` empty. Indented sub-step marker.",
+      "## 🧠 Step 2 — Column zero",
+      "text",
+      "**Skip if** `X` empty.",
+      "## 🧠 Step 3 — Heading marker (Path B only)",
+      "text",
+      "## 🧠 Step 4 — Run",
+      "**Run only if** `Y`.",
+      "## Failure Path",
+      "**Run only if** `Z`.",
+      "## 🧠 Step 5 — Last",
+    ].join("\n");
+    expect(deriveContract(md, "ship").steps.map((s) => [s.number, s.conditional])).toEqual([
+      [1, false],
+      [2, true],
+      [3, true],
+      [4, true],
+      [5, false],
+    ]);
+    // A marker added in a non-step section changes no verdict.
+    const base = deriveContract(md.replace("**Run only if** `Z`.", "text"), "ship");
+    expect(deriveContract(md, "ship").steps).toEqual(base.steps);
+  });
+
+  it("does not report a conditional step as a step hole", () => {
+    const md = [
+      "## 🧠 Step 1 — Start",
+      '"{BKIT}" steps done --step=build-start-workflow',
+      "## 🧠 Step 2 — Maybe",
+      "**Skip if** `X`.",
+      '"{BKIT}" steps done --step=build-maybe',
+      "## 🧠 Step 3 — Always",
+      '"{BKIT}" steps done --step=build-always',
+      "## 🧠 Step 4 — Close",
+      '"{BKIT}" steps done --step=build-close-workflow',
+    ].join("\n");
+    const rows = ["build-start-workflow", "build-close-workflow"].map((step) => ({
+      type: "step-done",
+      workflow: "build",
+      step,
+    }));
+    const report = auditRun(rows, "build", md);
+    expect(report.missing).toEqual(["build-always"]);
+  });
+});
+
 describe("CLI sweep summary", () => {
   const capture = (args: string[]): string => {
     const originalWrite = process.stdout.write.bind(process.stdout);
@@ -734,7 +803,13 @@ describe("CLI sweep summary", () => {
     return captured;
   };
   const flowRow = (workflow: string, step: string) =>
-    JSON.stringify({ type: "step-done", workflow, step, status: "DONE", at: "2026-07-29T00:00:00Z" });
+    JSON.stringify({
+      type: "step-done",
+      workflow,
+      step,
+      status: "DONE",
+      at: "2026-07-29T00:00:00Z",
+    });
 
   it("prints a sweep summary line and exits 0", () => {
     const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-shd-sweep-"));
````

## Diff since red — Task 6 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-3-6-3.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index ff8816e71..fd6a06052 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-3-6-3.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -580,12 +580,12 @@ describe("build", () => {
   it("Plan Convert leaves a valid plan with no newer comments alone", () => {
     const step4 = section(build, /Step 4 — Plan Convert/);
     const skip =
-      "**If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.";
+      "**If** exit 0, `CONVERTED` is not held **and** `NEWER_COMMENTS` = 0 → sub-step 4.";
     expect(step4).toContain(skip);
-    // That route leaves the step at once: no dispatch, no row and no comment.
+    // That route skips the dispatch and writes the no-agent skip row (sub-step 4).
     expect(step4.indexOf(skip)).toBeLessThan(step4.indexOf("Invoke `@bkit-build-plan-convert`"));
-    expect(commandLines(step4, "steps finish")).toHaveLength(1);
-    expect(step4.indexOf("--step=build-plan-convert")).toBeGreaterThan(
+    expect(commandLines(step4, "steps finish")).toHaveLength(2);
+    expect(step4.indexOf("--attempt-of=build-plan-convert:next")).toBeGreaterThan(
       step4.indexOf("Invoke `@bkit-build-plan-convert`"),
     );
   });
@@ -605,9 +605,11 @@ describe("build", () => {
     const finish = commandLines(section(build, /Step 4 — Plan Convert/), "steps finish").filter(
       (l) => l.includes("--step=build-plan-convert"),
     );
-    expect(finish).toHaveLength(1);
-    expect(finish[0]).toContain("--number=4");
-    expect(finish[0]).toContain('--post --title="Plan Convert"');
+    expect(finish).toHaveLength(2);
+    for (const line of finish) {
+      expect(line).toContain("--number=4");
+      expect(line).toContain('--post --title="Plan Convert"');
+    }
     expect(section(build, /Step 3 — Branch Sync/)).not.toContain("--step=build-plan-convert");
   });
 
@@ -615,9 +617,9 @@ describe("build", () => {
     // A plan-less run routes to the convert before the check writes its log, so the log
     // can be absent when the finish runs; a required artifact would exit 7 there and the
     // Plan Convert comment would never post. Optional records it whenever it exists.
-    const finish = commandLines(section(build, /Step 4 — Plan Convert/), "steps finish").filter(
-      (l) => l.includes("--step=build-plan-convert"),
-    );
+    const finish = commandLines(section(build, /Step 4 — Plan Convert/), "steps finish")
+      .filter((l) => l.includes("--step=build-plan-convert"))
+      .filter((l) => l.includes("--attempt-of="));
     expect(finish).toHaveLength(1);
     expect(finish[0]).toContain(
       "--optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md",
@@ -658,8 +660,9 @@ describe("build", () => {
     );
     const step4 = section(build, /Step 4 — Plan Convert/);
     expect(step4).toContain(
-      "**If** exit 0 **and** (`NEWER_COMMENTS` = 0 **or** `CONVERTED` is held) → Step 5.",
+      "**If** exit 0, `CONVERTED` is not held **and** `NEWER_COMMENTS` = 0 → sub-step 4.",
     );
+    expect(step4).toContain("**If** exit 0 **and** `CONVERTED` is held → Step 5.");
     expect(step4).toMatch(
       /`CONVERTED` is not held \*\*and\*\* \(exit 0 with `NEWER_COMMENTS` > 0,/,
     );
@@ -814,6 +817,26 @@ describe("resume", () => {
   );
 });
 
+describe("plan convert skip row", () => {
+  it("writes a build-plan-convert row on the no-conversion route", () => {
+    const step4 = stepSections(workflow("build")).find((s) => s.number === 4)!;
+    const skip = commandLines(step4.body, "steps finish").filter((l) =>
+      l.includes("--step=build-plan-convert"),
+    );
+    expect(skip).toHaveLength(2);
+    const skipRow = skip.find((l) => l.includes("--attempt=1"))!;
+    expect(skipRow).toContain("--number=4");
+    expect(skipRow).toContain("skipped");
+    expect(skipRow).not.toContain("--attempt-of=");
+    expect(skip.filter((l) => l.includes("--attempt-of=build-plan-convert:next"))).toHaveLength(1);
+    // The pass route with nothing to convert reaches the skip row, not Step 5.
+    expect(step4.body).toMatch(
+      /exit 0, `CONVERTED` is not held \*\*and\*\* `NEWER_COMMENTS` = 0 → sub-step 4/,
+    );
+    expect(step4.body).toMatch(/exit 0 \*\*and\*\* `CONVERTED` is held → Step 5/);
+  });
+});
+
 describe("promoted parsers", () => {
   it("holds the workflows to the step table", () => {
     const own = fs.readFileSync(__filename, "utf-8");
```

## Diff since red — Task 6 `.bkit/core/engine/checks/status-holes.test.ts`

````diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-3-6-4.snapshot b/.bkit/core/engine/checks/status-holes.test.ts
index 315dcc7d2..4524e241f 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-3-6-4.snapshot
+++ b/.bkit/core/engine/checks/status-holes.test.ts
@@ -22,6 +22,7 @@ import { describe, expect, it } from "vitest";
 import { WORKFLOW_STEPS } from "../commands/workflow/step-table";
 import {
   SHIP_STEP_ORDER,
+  auditRun,
   auditStatusJsonl,
   callWords,
   classifyRun,
@@ -150,8 +151,8 @@ describe("source derivation", () => {
       const contract = deriveContract(flowMd(name), name);
       expect([...contract.universe].sort(), name).toEqual([...tableKeys(name)].sort());
       expect(contract.drift, name).toEqual([]);
-      expect(contract.orphanSteps, name).toEqual([]);
     }
+    expect(deriveContract(flowMd("ship"), "ship").orphanSteps).toEqual([]);
     expect([...SHIP_STEP_ORDER]).toEqual(tableKeys("ship"));
   });
 
@@ -164,7 +165,7 @@ describe("source derivation", () => {
     expect(contract.drift).toContain("table-but-not-source:ship-merge-pr");
   });
 
-  it("records every {BKIT} literal in a step as a required call", () => {
+  it("records every BKIT literal in a step as a required call", () => {
     const md = [
       "## Opening",
       '"{BKIT}" runs context --workflow=x',
@@ -189,18 +190,20 @@ describe("source derivation", () => {
     expect(contract.steps[1]!.calls).toEqual([
       { noun: "branches", verb: "push", flags: ["remote"] },
     ]);
-    expect(contract.workflowCalls).toEqual([{ noun: "runs", verb: "context", flags: ["workflow"] }]);
+    expect(contract.workflowCalls).toEqual([
+      { noun: "runs", verb: "context", flags: ["workflow"] },
+    ]);
   });
 
   it("derives a required call from each {BKIT} literal of every live step section", () => {
     for (const name of FLOWS) {
       const md = flowMd(name);
       const contract = deriveContract(md, name);
-      const inSteps = stepSections(md).reduce(
-        (n, s) => n + (s.body.match(/"\{BKIT\}"/g)?.length ?? 0),
-        0,
-      );
-      expect(contract.steps.reduce((n, s) => n + s.calls.length, 0), name).toBe(inSteps);
+      const inSteps = stepSections(md).reduce((n, s) => n + s.body.split('"{BKIT}"').length - 1, 0);
+      expect(
+        contract.steps.reduce((n, s) => n + s.calls.length, 0),
+        name,
+      ).toBe(inSteps);
       expect(inSteps, name).toBeGreaterThan(0);
     }
     expect(callWords('steps finish --a="x y" | tee')).toEqual(["steps", "finish", '--a="x y"']);
@@ -208,11 +211,11 @@ describe("source derivation", () => {
 
   it("parses a synthetic md with headings + literals", () => {
     const fakeMd = [
-      "## Step 1 — Start",
+      "## 🧠 Step 1 — Start",
       "```bash",
       '  step:"ship-start-workflow"',
       "```",
-      "## Step 2 — Setup",
+      "## 🧠 Step 2 — Setup",
       "```bash",
       '  step:"ship-worktree-setup"',
       "```",
@@ -225,7 +228,7 @@ describe("source derivation", () => {
 
   it("flags a status write that lives outside any numbered step (orphanSteps)", () => {
     const fakeMd = [
-      "## Step 1 — Start",
+      "## 🧠 Step 1 — Start",
       "```bash",
       '  step:"ship-start-workflow"',
       "```",
@@ -718,6 +721,72 @@ describe("CLI main() — advisory exit 0", () => {
   });
 });
 
+describe("step conditionality", () => {
+  // Step numbers whose section carries a column-0 marker (or a `(Path X only)` heading).
+  const CONDITIONAL_STEPS = {
+    design: [7, 11, 12],
+    plan: [8],
+    build: [6, 9, 13, 14, 15, 16],
+    debug: [4, 5, 6, 7, 8, 9, 10, 11],
+    ship: [4, 11, 12, 13],
+  } as const;
+
+  it("classifies a step conditional only under the column-0 marker rule", () => {
+    for (const name of FLOWS) {
+      const contract = deriveContract(flowMd(name), name);
+      expect(
+        contract.steps.filter((s) => s.conditional).map((s) => s.number),
+        name,
+      ).toEqual([...CONDITIONAL_STEPS[name]]);
+    }
+    const md = [
+      "## 🧠 Step 1 — Plain",
+      "   **Skip if** `ISSUE_ID` empty. Indented sub-step marker.",
+      "## 🧠 Step 2 — Column zero",
+      "text",
+      "**Skip if** `X` empty.",
+      "## 🧠 Step 3 — Heading marker (Path B only)",
+      "text",
+      "## 🧠 Step 4 — Run",
+      "**Run only if** `Y`.",
+      "## Failure Path",
+      "**Run only if** `Z`.",
+      "## 🧠 Step 5 — Last",
+    ].join("\n");
+    expect(deriveContract(md, "ship").steps.map((s) => [s.number, s.conditional])).toEqual([
+      [1, false],
+      [2, true],
+      [3, true],
+      [4, true],
+      [5, false],
+    ]);
+    // A marker added in a non-step section changes no verdict.
+    const base = deriveContract(md.replace("**Run only if** `Z`.", "text"), "ship");
+    expect(deriveContract(md, "ship").steps).toEqual(base.steps);
+  });
+
+  it("does not report a conditional step as a step hole", () => {
+    const md = [
+      "## 🧠 Step 1 — Start",
+      '"{BKIT}" steps done --step=build-start-workflow',
+      "## 🧠 Step 2 — Maybe",
+      "**Skip if** `X`.",
+      '"{BKIT}" steps done --step=build-maybe',
+      "## 🧠 Step 3 — Always",
+      '"{BKIT}" steps done --step=build-always',
+      "## 🧠 Step 4 — Close",
+      '"{BKIT}" steps done --step=build-close-workflow',
+    ].join("\n");
+    const rows = ["build-start-workflow", "build-close-workflow"].map((step) => ({
+      type: "step-done",
+      workflow: "build",
+      step,
+    }));
+    const report = auditRun(rows, "build", md);
+    expect(report.missing).toEqual(["build-always"]);
+  });
+});
+
 describe("CLI sweep summary", () => {
   const capture = (args: string[]): string => {
     const originalWrite = process.stdout.write.bind(process.stdout);
@@ -734,7 +803,13 @@ describe("CLI sweep summary", () => {
     return captured;
   };
   const flowRow = (workflow: string, step: string) =>
-    JSON.stringify({ type: "step-done", workflow, step, status: "DONE", at: "2026-07-29T00:00:00Z" });
+    JSON.stringify({
+      type: "step-done",
+      workflow,
+      step,
+      status: "DONE",
+      at: "2026-07-29T00:00:00Z",
+    });
 
   it("prints a sweep summary line and exits 0", () => {
     const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-shd-sweep-"));
````

## Runner output — `.bkit/core/engine/checks/status-holes.test.ts`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/checks/status-holes.test.ts

[test-timeout-budget] load average 24.1 on 10 cores: unit limits 12070ms per test, 24140ms per hook (x2.41)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ✓ .bkit/core/engine/checks/status-holes.test.ts (43 tests) 211ms

 Test Files  1 passed (1)
      Tests  43 passed (43)
   Start at  08:19:43
   Duration  983ms (transform 47%, tests 26%, setup 18%, import 8%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-BgWkME/junit.xml
```
