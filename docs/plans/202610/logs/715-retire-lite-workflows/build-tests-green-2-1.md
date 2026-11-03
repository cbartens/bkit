Enforced: true
Verdict: null
Gaps: 3
Test order only: true

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/715-retire-lite-workflows-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 4 | `.bkit/core/engine/commands/workflow/status.test.ts` "lets the publish token override publish.local" | recorded 2026-10-28T21:04:21Z | no | passed |
| 4 | `.bkit/core/engine/commands/workflow/status.test.ts` "reads publish.local on LOCAL without a token" | recorded 2026-10-28T21:04:23Z | no | passed |
| 4 | `.bkit/core/engine/commands/workflow/status.test.ts` "coerces publish false to true on a non-LOCAL runtime" | recorded 2026-10-28T21:04:25Z | no | passed |
| 4 | `.bkit/core/engine/commands/workflow/status.test.ts` "accepts --prompt-file with --workflow=build" | recorded 2026-10-28T21:04:27Z | no | passed |
| 4 | `.bkit/core/engine/commands/workflow/status.test.ts` "ignores publish=maybe and falls through to config" | recorded 2026-10-28T21:04:29Z | no | passed |
| 4 | `.bkit/core/engine/commands/workflow/status.test.ts` "refuses publish without a runtime-resolved row" | recorded 2026-10-28T21:04:31Z | no | passed |
| 4 | `.bkit/core/engine/commands/workflow/status.test.ts` "prints publishSource for token, local, remote and coerced" | recorded 2026-10-28T21:04:33Z | no | passed |
| 5 | `.bkit/core/engine/commands/workflow/summary.test.ts` "writes Publish: held when publish is false" | recorded 2026-10-28T21:05:20Z | added lines only | passed |
| 5 | `.bkit/core/engine/commands/workflow/summary.test.ts` "writes Publish: pr by default" | recorded 2026-10-28T21:05:22Z | added lines only | passed |
| 5 | `.bkit/core/engine/commands/workflow/summary.test.ts` "writes Docs: not synced on a held summary" | recorded 2026-10-28T21:05:23Z | added lines only | passed |
| 5 | `.bkit/core/engine/commands/workflow/summary.test.ts` "keeps the verdict and next step unchanged by publish" | recorded 2026-10-28T21:06:21Z | no | passed |
| 5 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "passes publish into the summary input" | recorded 2026-10-28T21:06:16Z | no | passed |

## Gaps

- Task 5 `test-changed` — `.bkit/core/engine/commands/workflow/summary.test.ts` gained lines since its red snapshot for "writes Publish: held when publish is false" (diff below) — Fixable: null — log: TASK 5: `.bkit/core/engine/commands/workflow/summary.test.ts` `writes Publish: held when publish is false` — test-changed — Fixable: null
- Task 5 `test-changed` — `.bkit/core/engine/commands/workflow/summary.test.ts` gained lines since its red snapshot for "writes Publish: pr by default" (diff below) — Fixable: null — log: TASK 5: `.bkit/core/engine/commands/workflow/summary.test.ts` `writes Publish: pr by default` — test-changed — Fixable: null
- Task 5 `test-changed` — `.bkit/core/engine/commands/workflow/summary.test.ts` gained lines since its red snapshot for "writes Docs: not synced on a held summary" (diff below) — Fixable: null — log: TASK 5: `.bkit/core/engine/commands/workflow/summary.test.ts` `writes Docs: not synced on a held summary` — test-changed — Fixable: null

## Diff since red — Task 5 `.bkit/core/engine/commands/workflow/summary.test.ts`

```diff
diff --git a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-2-5-1.snapshot b/.bkit/core/engine/commands/workflow/summary.test.ts
index 76841336e..455233d0e 100644
--- a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-2-5-1.snapshot
+++ b/.bkit/core/engine/commands/workflow/summary.test.ts
@@ -87,6 +87,8 @@ describe("buildSummary", () => {
   it("keeps the verdict and next step unchanged by publish", () => {
     const held = buildSummary(input({ publish: false }));
     const pr = buildSummary(input({ publish: true }));
+    expect(held.markdown).toContain("Publish: held");
+    expect(pr.markdown).toContain("Publish: pr");
     expect(held.verdict).toBe(pr.verdict);
     expect(held.nextStep).toBe(pr.nextStep);
     expect(held.reasons).toEqual(pr.reasons);
```

## Diff since red — Task 5 `.bkit/core/engine/commands/workflow/summary.test.ts`

```diff
diff --git a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-2-5-2.snapshot b/.bkit/core/engine/commands/workflow/summary.test.ts
index 76841336e..455233d0e 100644
--- a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-2-5-2.snapshot
+++ b/.bkit/core/engine/commands/workflow/summary.test.ts
@@ -87,6 +87,8 @@ describe("buildSummary", () => {
   it("keeps the verdict and next step unchanged by publish", () => {
     const held = buildSummary(input({ publish: false }));
     const pr = buildSummary(input({ publish: true }));
+    expect(held.markdown).toContain("Publish: held");
+    expect(pr.markdown).toContain("Publish: pr");
     expect(held.verdict).toBe(pr.verdict);
     expect(held.nextStep).toBe(pr.nextStep);
     expect(held.reasons).toEqual(pr.reasons);
```

## Diff since red — Task 5 `.bkit/core/engine/commands/workflow/summary.test.ts`

```diff
diff --git a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-2-5-3.snapshot b/.bkit/core/engine/commands/workflow/summary.test.ts
index 76841336e..455233d0e 100644
--- a/docs/plans/202610/logs/715-retire-lite-workflows/build-task-red-2-5-3.snapshot
+++ b/.bkit/core/engine/commands/workflow/summary.test.ts
@@ -87,6 +87,8 @@ describe("buildSummary", () => {
   it("keeps the verdict and next step unchanged by publish", () => {
     const held = buildSummary(input({ publish: false }));
     const pr = buildSummary(input({ publish: true }));
+    expect(held.markdown).toContain("Publish: held");
+    expect(pr.markdown).toContain("Publish: pr");
     expect(held.verdict).toBe(pr.verdict);
     expect(held.nextStep).toBe(pr.nextStep);
     expect(held.reasons).toEqual(pr.reasons);
```
