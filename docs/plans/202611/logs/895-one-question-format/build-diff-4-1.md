diff --git a/.bkit/core/engine/audits/workflows/question-option-format.test.ts b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
index 7b2bff39b..88f4af11b 100644
--- a/.bkit/core/engine/audits/workflows/question-option-format.test.ts
+++ b/.bkit/core/engine/audits/workflows/question-option-format.test.ts
@@ -725,7 +725,10 @@ describe("question option format: the debug questions in the shared shape", () =
     expect(step).toMatch(
       /`LOOP_LIMIT` = true[\s\S]{0,300}?Recommended: A\) Stop — the attempts set aside for this are used up/,
     );
-    expect(step).toContain("Recommended: A) Stop — the last attempt left no fewer failures");
+    expect(step).toContain(
+      "Recommended: A) Stop — the attempts so far have not brought the failures down through a code change",
+    );
+    expect(step).not.toContain("left no fewer failures");
   });
 
   it("bkit-debug: every question shows a Default if unanswered line", () => {
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 5d4190461..c99edd742 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -2152,6 +2152,7 @@ describe("fix loops ask only when the last round made no progress", () => {
       expect(q, q).not.toContain("left no fewer failures");
     }
     expect(loop).toMatch(/taken without asking \([^\n]*\{LOOP_TREND_LINE\}/);
+    expect(loop).not.toContain("left no fewer failures");
   });
 
   it("debug Loop Question at the used-up soak limit states the trend line", () => {
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
index 8518351ba..e4ed89407 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
@@ -121,7 +121,7 @@ _No tracker connected, skip step._
      ```
    - The recommendation, first match wins:
      - **If** `LOOP_LIMIT` = true → `Recommended: A) Stop — the attempts set aside for this are used up`.
-     - **Else** → `Recommended: A) Stop — the last attempt left no fewer failures`.
+     - **Else** → `Recommended: A) Stop — the attempts so far have not brought the failures down through a code change`.
    - `Default if unanswered: the run waits for you`.
    - The line `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.`
      Record the wait → end turn → wait for the answer:
diff --git a/.bkit/core/workflows/bkit-debug.md b/.bkit/core/workflows/bkit-debug.md
index 13d05c530..2bf2fd520 100644
--- a/.bkit/core/workflows/bkit-debug.md
+++ b/.bkit/core/workflows/bkit-debug.md
@@ -148,7 +148,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
      ```
    - The recommendation, first match wins:
      - **If** `LOOP_LIMIT` = true → `Recommended: A) Stop — the attempts set aside for this are used up`.
-     - **Else** → `Recommended: A) Stop — the last attempt left no fewer failures`.
+     - **Else** → `Recommended: A) Stop — the attempts so far have not brought the failures down through a code change`.
    - `Default if unanswered: the run waits for you`.
    - The line `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.`
      Record the wait → end turn → wait for the answer:
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 7dff8f17b..b14338101 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -10391,7 +10391,7 @@ Read the loop's progress:
 The two answers, one per line:
 The recommendation, first match wins:
 **If** `LOOP_LIMIT` = true → `Recommended: A) Stop — the attempts set aside for this are used up`.
-**Else** → `Recommended: A) Stop — the last attempt left no fewer failures`.
+**Else** → `Recommended: A) Stop — the attempts so far have not brought the failures down through a code change`.
 `Default if unanswered: the run waits for you`.
 The line `Reply with a letter per question, or "yes" to take every recommendation. "stop" ends here with a handover; the next run resumes here.`
 Record the wait → end turn → wait for the answer:
