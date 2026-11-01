Enforced: true
Verdict: null
Gaps: 2
Test order only: false

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/699-engine-run-completeness-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/run-facts.test.ts` "leaves a run's step minutes unchanged when journal rows land between step rows" | recorded 2026-10-28T12:57:41Z | yes | passed |
| 1 | `scripts/harvest/bkit-harvest.test.mjs` "MARK_ROWS is the engine's" | missing | — | not passed |
| 2 | `.bkit/core/engine/commands/workflow/status.test.ts` "ignores a row type it does not know" | missing | — | passed |

## Gaps

- Task 1 `test-changed` — `.bkit/core/engine/commands/workflow/run-facts.test.ts` differs from its red snapshot for "leaves a run's step minutes unchanged when journal rows land between step rows" (diff below) — Fixable: null — log: TASK 1: `.bkit/core/engine/commands/workflow/run-facts.test.ts` `leaves a run's step minutes unchanged when journal rows land between step rows` — test-changed — Fixable: null
- Task 1 `not-green` — the named test "MARK_ROWS is the engine's" did not run; the report holds no tests — Fixable: true — log: TASK 1: `scripts/harvest/bkit-harvest.test.mjs` `MARK_ROWS is the engine's` — not-green — Fixable: true

## Test exceptions

- Task 1 — honoured; cleared `no-red` for `scripts/harvest/bkit-harvest.test.mjs` "MARK_ROWS is the engine's"
- Task 2 — honoured; cleared `no-red` for `.bkit/core/engine/commands/workflow/status.test.ts` "ignores a row type it does not know"

## Diff since red — Task 1 `.bkit/core/engine/commands/workflow/run-facts.test.ts`

```diff
diff --git a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-1-1-1.snapshot b/.bkit/core/engine/commands/workflow/run-facts.test.ts
index ccc93b98d..c19fc2179 100644
--- a/docs/plans/202610/logs/699-engine-run-completeness/build-task-red-1-1-1.snapshot
+++ b/.bkit/core/engine/commands/workflow/run-facts.test.ts
@@ -221,13 +221,17 @@ describe("runStatusRows / stepsBlock / ciList", () => {
     expect(totalsProblem({ steps })).toBeUndefined();
   });
 
+  // A row read back from `status.jsonl`: its type is not one `StatusEvent` declares.
+  const journalRow = (fields: Record<string, unknown>): Row =>
+    JSON.parse(JSON.stringify({ workflow: "build", ...fields }));
+
   it("leaves a run's step minutes unchanged when journal rows land between step rows", () => {
     const plain = [started(0), step(1, "build-a"), step(4, "build-b")];
     const journaled = [
       started(0),
       step(1, "build-a"),
-      { type: "engine-call", workflow: "build", at: at(2), noun: "steps", verb: "finish" } as Row,
-      { type: "completeness", workflow: "build", at: at(3), verdict: "complete" } as Row,
+      journalRow({ type: "engine-call", at: at(2), noun: "steps", verb: "finish" }),
+      journalRow({ type: "completeness", at: at(3), verdict: "complete" }),
       step(4, "build-b"),
     ];
     expect(stepsBlock(journaled)).toEqual(stepsBlock(plain));
```

## Runner output — `scripts/harvest/bkit-harvest.test.mjs`

```

> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" scripts/harvest/bkit-harvest.test.mjs


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

No test files found, exiting with code 1

filter: scripts/harvest/bkit-harvest.test.mjs
include: .bkit/core/engine/**/*.test.ts, .bkit/core/engine/**/*.integration.test.ts, scripts/harvest/**/*.test.ts
exclude:  **/node_modules/**, **/.git/**

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-xvaodO/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
