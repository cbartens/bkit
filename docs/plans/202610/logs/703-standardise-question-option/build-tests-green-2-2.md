Enforced: true
Gaps: 0
Test order only: false

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/703-standardise-question-option-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 2 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "the canonical layout letters every option and recommendation" | recorded 2026-10-26T08:21:39Z | added lines only | passed |
| 3 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "every option line in the workflows letters every entry" | recorded 2026-10-26T08:23:27Z | added lines only | passed |
| 3 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "every recommendation line in the workflows names a letter" | recorded 2026-10-26T08:23:29Z | added lines only | passed |
| 4 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "every open-question rule in the prompts names the lettered option form" | recorded 2026-10-26T08:36:39Z | added lines only | passed |
| 4 | `.bkit/core/engine/audits/workflows/question-option-format.test.ts` "the plan template letters every option of its Open Questions placeholder" | recorded 2026-10-26T08:36:43Z | added lines only | passed |

## Gaps

None.

## Diff since red — Task 2 `.bkit/core/engine/audits/workflows/question-option-format.test.ts`

```diff
diff --git a/docs/plans/202610/logs/703-standardise-question-option/build-task-red-2-2-1.snapshot b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
index a30e1fc1a..6b9f90c2e 100644
--- a/docs/plans/202610/logs/703-standardise-question-option/build-task-red-2-2-1.snapshot
+++ b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
@@ -94,6 +94,12 @@ function optionLists(text: string): OptionList[] {
     if (raw === "") return;
     out.push({ no: i + 1, raw, entries: raw.split(ENTRY_SEPARATOR) });
   });
+  // A `**Options:**` label closes its bold right after the colon, so the first
+  // entry of that list carries the closing marker.
+  out.forEach((list) => {
+    list.raw = list.raw.replace(/^\*+\s*/, "");
+    list.entries[0] = list.entries[0]!.replace(/^\*+\s*/, "");
+  });
   return out;
 }
```

## Diff since red — Task 3 `.bkit/core/engine/audits/workflows/question-option-format.test.ts`

```diff
diff --git a/docs/plans/202610/logs/703-standardise-question-option/build-task-red-2-3-1.snapshot b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
index a30e1fc1a..6b9f90c2e 100644
--- a/docs/plans/202610/logs/703-standardise-question-option/build-task-red-2-3-1.snapshot
+++ b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
@@ -94,6 +94,12 @@ function optionLists(text: string): OptionList[] {
     if (raw === "") return;
     out.push({ no: i + 1, raw, entries: raw.split(ENTRY_SEPARATOR) });
   });
+  // A `**Options:**` label closes its bold right after the colon, so the first
+  // entry of that list carries the closing marker.
+  out.forEach((list) => {
+    list.raw = list.raw.replace(/^\*+\s*/, "");
+    list.entries[0] = list.entries[0]!.replace(/^\*+\s*/, "");
+  });
   return out;
 }
```

## Diff since red — Task 3 `.bkit/core/engine/audits/workflows/question-option-format.test.ts`

```diff
diff --git a/docs/plans/202610/logs/703-standardise-question-option/build-task-red-2-3-2.snapshot b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
index a30e1fc1a..6b9f90c2e 100644
--- a/docs/plans/202610/logs/703-standardise-question-option/build-task-red-2-3-2.snapshot
+++ b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
@@ -94,6 +94,12 @@ function optionLists(text: string): OptionList[] {
     if (raw === "") return;
     out.push({ no: i + 1, raw, entries: raw.split(ENTRY_SEPARATOR) });
   });
+  // A `**Options:**` label closes its bold right after the colon, so the first
+  // entry of that list carries the closing marker.
+  out.forEach((list) => {
+    list.raw = list.raw.replace(/^\*+\s*/, "");
+    list.entries[0] = list.entries[0]!.replace(/^\*+\s*/, "");
+  });
   return out;
 }
```

## Diff since red — Task 4 `.bkit/core/engine/audits/workflows/question-option-format.test.ts`

```diff
diff --git a/docs/plans/202610/logs/703-standardise-question-option/build-task-red-2-4-1.snapshot b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
index a30e1fc1a..6b9f90c2e 100644
--- a/docs/plans/202610/logs/703-standardise-question-option/build-task-red-2-4-1.snapshot
+++ b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
@@ -94,6 +94,12 @@ function optionLists(text: string): OptionList[] {
     if (raw === "") return;
     out.push({ no: i + 1, raw, entries: raw.split(ENTRY_SEPARATOR) });
   });
+  // A `**Options:**` label closes its bold right after the colon, so the first
+  // entry of that list carries the closing marker.
+  out.forEach((list) => {
+    list.raw = list.raw.replace(/^\*+\s*/, "");
+    list.entries[0] = list.entries[0]!.replace(/^\*+\s*/, "");
+  });
   return out;
 }
```

## Diff since red — Task 4 `.bkit/core/engine/audits/workflows/question-option-format.test.ts`

```diff
diff --git a/docs/plans/202610/logs/703-standardise-question-option/build-task-red-2-4-2.snapshot b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
index a30e1fc1a..6b9f90c2e 100644
--- a/docs/plans/202610/logs/703-standardise-question-option/build-task-red-2-4-2.snapshot
+++ b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
@@ -94,6 +94,12 @@ function optionLists(text: string): OptionList[] {
     if (raw === "") return;
     out.push({ no: i + 1, raw, entries: raw.split(ENTRY_SEPARATOR) });
   });
+  // A `**Options:**` label closes its bold right after the colon, so the first
+  // entry of that list carries the closing marker.
+  out.forEach((list) => {
+    list.raw = list.raw.replace(/^\*+\s*/, "");
+    list.entries[0] = list.entries[0]!.replace(/^\*+\s*/, "");
+  });
   return out;
 }
```
