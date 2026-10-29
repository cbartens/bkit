Enforced: true
Verdict: PASS
Gaps: 0
Test order only: false

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/699-engine-run-completeness-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 20 | `.bkit/core/engine/checks/status-holes.test.ts` "a tracker-none run that journals every rendered call is CLEAN" | recorded 2026-10-29T07:57:44Z | code it runs | passed |
| 20 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run" | recorded 2026-10-29T07:58:19Z | test body | passed |
| 21 | `.bkit/core/engine/commands/lib.test.ts` "resolveActiveRun falls back to the cwd scan when --file names a non-status file" | recorded 2026-10-29T07:58:55Z | no | passed |
| 21 | `.bkit/core/engine/ledgers/journal.integration.test.ts` "branches anchor-read with a plan --file journals into the active run" | recorded 2026-10-29T07:58:57Z | no | passed |
| 22 | `.bkit/core/engine/checks/status-holes.test.ts` "a run whose journal starts mid-run reports no evidence hole for steps finished before its first engine-call row" | recorded 2026-10-29T07:59:16Z | outside the test only | passed |

## Gaps

None.

## Test exceptions

- Task 20 — honoured; cleared `test-changed` for `.bkit/core/engine/checks/status-holes.test.ts` "a tracker-none run that journals every rendered call is CLEAN", `test-changed` for `.bkit/core/engine/commands/workflow/workflows.test.ts` "close on a tracker-none consumer writes a CLEAN completeness row for a fully journaled run"

## Diff since red — Task 20 `.bkit/core/engine/checks/status-holes.test.ts`

```diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-10-20-1.snapshot b/.bkit/core/engine/checks/status-holes.test.ts
index 62fc1eb6c..ce648f8de 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-10-20-1.snapshot
+++ b/.bkit/core/engine/checks/status-holes.test.ts
@@ -916,7 +916,7 @@ describe("check — hole classes", () => {
         u.calls
           .filter((c) => c.position === position)
           .filter((c) => !c.branch)
-          .filter((c) => c.noun !== "workflows")
+          .filter((c) => `${c.noun} ${c.verb}` !== "workflows start")
           .map((c) => callRow(name, c.noun, c.verb) as StatusRow);
       return [...take("pre"), ...u.keys.map((k) => stepRow(name, k) as StatusRow), ...take("post")];
     });
@@ -967,6 +967,35 @@ describe("check — hole classes", () => {
     expect(whole.verdict).toBe("CLEAN");
   });
 
+  it("a run whose journal starts mid-run reports no evidence hole for steps finished before its first engine-call row", () => {
+    const md = [
+      "## 🧠 Step 1 — Setup",
+      ...fence("tests run --gate=a", FINISH("build-worktree-setup", 1)),
+      "## 🧠 Step 2 — Verify",
+      ...fence("tests run --gate=b", FINISH("build-b", 2)),
+      "## 🧠 Step 3 — Close",
+      ...fence(FINISH("build-close-workflow", 3)),
+    ].join("\n");
+    const contract = deriveContract(md, "build");
+    const midRun = check(
+      [
+        stepRow("build", "build-worktree-setup"),
+        callRow("build", "steps", "finish"),
+        stepRow("build", "build-b"),
+        callRow("build", "steps", "finish"),
+        stepRow("build", "build-close-workflow"),
+      ] as StatusRow[],
+      contract,
+    );
+    expect(midRun.preJournal).toBe(false);
+    expect(midRun.evidenceHoles.map((h) => h.step)).toEqual(["build-b"]);
+    const none = check(
+      [stepRow("build", "build-worktree-setup"), stepRow("build", "build-b")] as StatusRow[],
+      contract,
+    );
+    expect(none.preJournal).toBe(true);
+  });
+
   it("reports a missing required step as a step hole", () => {
     const md = [
       "## 🧠 Step 1 — Start",
```

## Diff since red — Task 20 `.bkit/core/engine/commands/workflow/workflows.test.ts`

```diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-10-20-2.snapshot b/.bkit/core/engine/commands/workflow/workflows.test.ts
index a1d41a65c..dc961047d 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-10-20-2.snapshot
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -1083,7 +1083,7 @@ describe("bkit workflows close", () => {
         u.calls
           .filter((c) => c.position === position)
           .filter((c) => !c.branch)
-          .filter((c) => c.noun !== "workflows")
+          .filter((c) => `${c.noun} ${c.verb}` !== "workflows start")
           .map((c) => ({
             type: "engine-call",
             workflow,
```
