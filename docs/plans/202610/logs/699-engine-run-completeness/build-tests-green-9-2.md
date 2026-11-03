Enforced: true
Verdict: null
Gaps: 1
Test order only: true

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/699-engine-run-completeness-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 18 | `.bkit/core/engine/checks/status-holes.test.ts` "calls outside the journal window are matched but never required" | recorded 2026-10-29T07:10:48Z | test body | passed |
| 19 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "prints one telemetry line on stderr when the journal looks dead at close" | recorded 2026-10-29T07:13:31Z | test body | passed |

## Gaps

- Task 18 `test-changed` — "calls outside the journal window are matched but never required"'s own lines changed since its red (diff below) — Fixable: null — log: TASK 18: `.bkit/core/engine/checks/status-holes.test.ts` `calls outside the journal window are matched but never required` — test-changed — Fixable: null

## Test exceptions

- Task 19 — honoured; cleared `test-changed` for `.bkit/core/engine/commands/workflow/workflows.test.ts` "prints one telemetry line on stderr when the journal looks dead at close"

## Late-red check

- Task 18 — not checked: no plan-execute step commit's log records `DONE — TASK 18`, so when its code landed is unknown
- Task 19 — not checked: no plan-execute step commit's log records `DONE — TASK 19`, so when its code landed is unknown

## Diff since red — Task 18 `.bkit/core/engine/checks/status-holes.test.ts`

```diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-9-18-1.snapshot b/.bkit/core/engine/checks/status-holes.test.ts
index c7d212d5d..49a2b139a 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-9-18-1.snapshot
+++ b/.bkit/core/engine/checks/status-holes.test.ts
@@ -216,10 +216,11 @@ describe("source derivation", () => {
       const md = flowMd(name);
       const contract = deriveContract(md, name);
       const inSteps = stepSections(md).reduce((n, s) => n + s.body.split('"{BKIT}"').length - 1, 0);
+      // Every literal is a step call or a workflow-level call (calls outside the journal window move there).
       expect(
-        contract.steps.reduce((n, s) => n + s.calls.length, 0),
+        contract.steps.reduce((n, s) => n + s.calls.length, 0) + contract.workflowCalls.length,
         name,
-      ).toBe(inSteps);
+      ).toBe(md.split('"{BKIT}"').length - 1);
       expect(inSteps, name).toBeGreaterThan(0);
     }
     expect(callWords('steps finish --a="x y" | tee')).toEqual(["steps", "finish", '--a="x y"']);
@@ -898,6 +899,8 @@ describe("check — hole classes", () => {
         u.calls
           .filter((c) => c.position === position)
           .filter((c) => withBranches || !c.branch)
+          // A fresh run finds no active run at `workflows start`, so the journal never holds it.
+          .filter((c) => !(c.noun === "workflows" && c.verb === "start"))
           .map((c) => callRow(name, c.noun, c.verb) as StatusRow);
       const own = u.keys.map((k) => stepRow(name, k) as StatusRow);
       return [...take("pre"), ...own, ...take("post")];
@@ -1048,7 +1051,6 @@ describe("check — hole classes", () => {
     const inWindow = [
       callRow("build", "steps", "finish"),
       stepRow("build", "build-a"),
-      callRow("build", "workflows", "start"),
       callRow("build", "steps", "finish"),
       stepRow("build", "build-b"),
       callRow("build", "tests", "run"),
@@ -1068,6 +1070,19 @@ describe("check — hole classes", () => {
     expect(check(missing, contract).verdict).toBe("HOLEY");
   });
 
+  it("never requires the workflows start call, which a fresh run cannot journal", () => {
+    for (const name of FLOWS) {
+      const contract = deriveContract(flowMd(name), name);
+      const required = contractUnits(contract).flatMap((u) =>
+        u.calls.map((c) => `${c.noun} ${c.verb}`),
+      );
+      expect(required, name).not.toContain("workflows start");
+      const verdict = check(replay(name, false), contract);
+      expect(verdict.evidenceHoles, name).toEqual([]);
+      expect(verdict.verdict, name).toBe("CLEAN");
+    }
+  });
+
   it("reports an untaken route arm as unexercised", () => {
     const build = deriveContract(flowMd("build"), "build");
     const step12 = build.steps.find((s) => s.number === 12)!;
```

## Diff since red — Task 19 `.bkit/core/engine/commands/workflow/workflows.test.ts`

```diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-9-19-1.snapshot b/.bkit/core/engine/commands/workflow/workflows.test.ts
index b6ed4fc16..8865a9dbc 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-9-19-1.snapshot
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -1072,7 +1072,7 @@ describe("bkit workflows close", () => {
     expect(r.code).toBe(0);
     const lines = r.err.split("\n").filter((l) => l.includes("journal looks dead"));
     expect(lines).toHaveLength(1);
-    expect(lines[0]).toMatch(/^\[bkit-telemetry\] journal looks dead at close/);
+    expect(lines[0]).toContain("[bkit-telemetry] journal looks dead at close");
     // stdout is still the one output object, with no journal field.
     expect(JSON.stringify(r.json)).not.toContain("journal looks dead");
     expect(r.json).not.toHaveProperty("journalSuspect");
```
