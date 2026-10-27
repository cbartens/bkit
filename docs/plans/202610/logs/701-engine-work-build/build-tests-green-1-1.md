Enforced: true
Gaps: 6
Test order only: true

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/701-engine-work-build-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green prints a verdict and a fixable per gap" | recorded 2026-10-27T11:08:22Z | yes | passed |
| 1 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green verdict is FAIL when a gap is unfixable" | recorded 2026-10-27T11:08:33Z | yes | passed |
| 1 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green leaves a diff-reading kind fixable null" | recorded 2026-10-27T11:08:42Z | yes | passed |
| 1 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green with no gaps prints verdict PASS and an empty gaps" | recorded 2026-10-27T11:08:53Z | yes | passed |
| 1 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green prints verdict null when a gap needs a diff read" | recorded 2026-10-27T11:09:02Z | yes | passed |
| 1 | `.bkit/core/engine/commands/workflow/tests.test.ts` "green emits a test-changed gap for a red whose test gained added lines only" | recorded 2026-10-27T11:09:10Z | yes | passed |

## Gaps

- Task 1 `test-changed` — `.bkit/core/engine/commands/workflow/tests.test.ts` differs from its red snapshot for "green prints a verdict and a fixable per gap" (diff below)
- Task 1 `test-changed` — `.bkit/core/engine/commands/workflow/tests.test.ts` differs from its red snapshot for "green verdict is FAIL when a gap is unfixable" (diff below)
- Task 1 `test-changed` — `.bkit/core/engine/commands/workflow/tests.test.ts` differs from its red snapshot for "green leaves a diff-reading kind fixable null" (diff below)
- Task 1 `test-changed` — `.bkit/core/engine/commands/workflow/tests.test.ts` differs from its red snapshot for "green with no gaps prints verdict PASS and an empty gaps" (diff below)
- Task 1 `test-changed` — `.bkit/core/engine/commands/workflow/tests.test.ts` differs from its red snapshot for "green prints verdict null when a gap needs a diff read" (diff below)
- Task 1 `test-changed` — `.bkit/core/engine/commands/workflow/tests.test.ts` differs from its red snapshot for "green emits a test-changed gap for a red whose test gained added lines only" (diff below)

## Diff since red — Task 1 `.bkit/core/engine/commands/workflow/tests.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-1-1-1.snapshot b/.bkit/core/engine/commands/workflow/tests.test.ts
index 0670976be..ae52e19b0 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-1-1-1.snapshot
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
 
@@ -1547,6 +1556,8 @@ describe("bkit tests red / green", () => {
         task: 1,
         kind: "delete-still-referenced",
         detail: "DELETE `src/moved.ts` is still referenced as `moved`: `src/stale.ts:1`",
+        fixable: null,
+        logLine: "TASK 1: delete-still-referenced — Fixable: null",
       },
     ]);
   });
@@ -1602,9 +1613,7 @@ describe("bkit tests red / green", () => {
       ),
     ).toEqual(["not-green:true", "no-red:false", "test-changed:null"]);
     expect(report()).toContain("Verdict: null");
-    expect(report()).toContain(
-      `TASK 1: \`${TEST}\` \`${NAME}\` — not-green — Fixable: true`,
-    );
+    expect(report()).toContain(`TASK 1: \`${TEST}\` \`${NAME}\` — not-green — Fixable: true`);
     expect(report()).toContain("Fixable: false");
     expect(report()).toContain("Fixable: null");
   });
```

## Diff since red — Task 1 `.bkit/core/engine/commands/workflow/tests.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-1-1-2.snapshot b/.bkit/core/engine/commands/workflow/tests.test.ts
index 0670976be..ae52e19b0 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-1-1-2.snapshot
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
 
@@ -1547,6 +1556,8 @@ describe("bkit tests red / green", () => {
         task: 1,
         kind: "delete-still-referenced",
         detail: "DELETE `src/moved.ts` is still referenced as `moved`: `src/stale.ts:1`",
+        fixable: null,
+        logLine: "TASK 1: delete-still-referenced — Fixable: null",
       },
     ]);
   });
@@ -1602,9 +1613,7 @@ describe("bkit tests red / green", () => {
       ),
     ).toEqual(["not-green:true", "no-red:false", "test-changed:null"]);
     expect(report()).toContain("Verdict: null");
-    expect(report()).toContain(
-      `TASK 1: \`${TEST}\` \`${NAME}\` — not-green — Fixable: true`,
-    );
+    expect(report()).toContain(`TASK 1: \`${TEST}\` \`${NAME}\` — not-green — Fixable: true`);
     expect(report()).toContain("Fixable: false");
     expect(report()).toContain("Fixable: null");
   });
```

## Diff since red — Task 1 `.bkit/core/engine/commands/workflow/tests.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-1-1-3.snapshot b/.bkit/core/engine/commands/workflow/tests.test.ts
index 0670976be..ae52e19b0 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-1-1-3.snapshot
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
 
@@ -1547,6 +1556,8 @@ describe("bkit tests red / green", () => {
         task: 1,
         kind: "delete-still-referenced",
         detail: "DELETE `src/moved.ts` is still referenced as `moved`: `src/stale.ts:1`",
+        fixable: null,
+        logLine: "TASK 1: delete-still-referenced — Fixable: null",
       },
     ]);
   });
@@ -1602,9 +1613,7 @@ describe("bkit tests red / green", () => {
       ),
     ).toEqual(["not-green:true", "no-red:false", "test-changed:null"]);
     expect(report()).toContain("Verdict: null");
-    expect(report()).toContain(
-      `TASK 1: \`${TEST}\` \`${NAME}\` — not-green — Fixable: true`,
-    );
+    expect(report()).toContain(`TASK 1: \`${TEST}\` \`${NAME}\` — not-green — Fixable: true`);
     expect(report()).toContain("Fixable: false");
     expect(report()).toContain("Fixable: null");
   });
```

## Diff since red — Task 1 `.bkit/core/engine/commands/workflow/tests.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-1-1-4.snapshot b/.bkit/core/engine/commands/workflow/tests.test.ts
index 0670976be..ae52e19b0 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-1-1-4.snapshot
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
 
@@ -1547,6 +1556,8 @@ describe("bkit tests red / green", () => {
         task: 1,
         kind: "delete-still-referenced",
         detail: "DELETE `src/moved.ts` is still referenced as `moved`: `src/stale.ts:1`",
+        fixable: null,
+        logLine: "TASK 1: delete-still-referenced — Fixable: null",
       },
     ]);
   });
@@ -1602,9 +1613,7 @@ describe("bkit tests red / green", () => {
       ),
     ).toEqual(["not-green:true", "no-red:false", "test-changed:null"]);
     expect(report()).toContain("Verdict: null");
-    expect(report()).toContain(
-      `TASK 1: \`${TEST}\` \`${NAME}\` — not-green — Fixable: true`,
-    );
+    expect(report()).toContain(`TASK 1: \`${TEST}\` \`${NAME}\` — not-green — Fixable: true`);
     expect(report()).toContain("Fixable: false");
     expect(report()).toContain("Fixable: null");
   });
```

## Diff since red — Task 1 `.bkit/core/engine/commands/workflow/tests.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-1-1-5.snapshot b/.bkit/core/engine/commands/workflow/tests.test.ts
index 0670976be..ae52e19b0 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-1-1-5.snapshot
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
 
@@ -1547,6 +1556,8 @@ describe("bkit tests red / green", () => {
         task: 1,
         kind: "delete-still-referenced",
         detail: "DELETE `src/moved.ts` is still referenced as `moved`: `src/stale.ts:1`",
+        fixable: null,
+        logLine: "TASK 1: delete-still-referenced — Fixable: null",
       },
     ]);
   });
@@ -1602,9 +1613,7 @@ describe("bkit tests red / green", () => {
       ),
     ).toEqual(["not-green:true", "no-red:false", "test-changed:null"]);
     expect(report()).toContain("Verdict: null");
-    expect(report()).toContain(
-      `TASK 1: \`${TEST}\` \`${NAME}\` — not-green — Fixable: true`,
-    );
+    expect(report()).toContain(`TASK 1: \`${TEST}\` \`${NAME}\` — not-green — Fixable: true`);
     expect(report()).toContain("Fixable: false");
     expect(report()).toContain("Fixable: null");
   });
```

## Diff since red — Task 1 `.bkit/core/engine/commands/workflow/tests.test.ts`

```diff
diff --git a/docs/plans/202610/logs/701-engine-work-build/build-task-red-1-1-6.snapshot b/.bkit/core/engine/commands/workflow/tests.test.ts
index 0670976be..ae52e19b0 100644
--- a/docs/plans/202610/logs/701-engine-work-build/build-task-red-1-1-6.snapshot
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
 
@@ -1547,6 +1556,8 @@ describe("bkit tests red / green", () => {
         task: 1,
         kind: "delete-still-referenced",
         detail: "DELETE `src/moved.ts` is still referenced as `moved`: `src/stale.ts:1`",
+        fixable: null,
+        logLine: "TASK 1: delete-still-referenced — Fixable: null",
       },
     ]);
   });
@@ -1602,9 +1613,7 @@ describe("bkit tests red / green", () => {
       ),
     ).toEqual(["not-green:true", "no-red:false", "test-changed:null"]);
     expect(report()).toContain("Verdict: null");
-    expect(report()).toContain(
-      `TASK 1: \`${TEST}\` \`${NAME}\` — not-green — Fixable: true`,
-    );
+    expect(report()).toContain(`TASK 1: \`${TEST}\` \`${NAME}\` — not-green — Fixable: true`);
     expect(report()).toContain("Fixable: false");
     expect(report()).toContain("Fixable: null");
   });
```
