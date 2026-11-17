diff --git a/.agents/plugins/bkit/agents/bkit-audit-generate.md b/.agents/plugins/bkit/agents/bkit-audit-generate.md
index 132f1285e..33b10e356 100644
--- a/.agents/plugins/bkit/agents/bkit-audit-generate.md
+++ b/.agents/plugins/bkit/agents/bkit-audit-generate.md
@@ -23,7 +23,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-build-challenge-1.md b/.agents/plugins/bkit/agents/bkit-build-challenge-1.md
index 5ce94a730..d458b4306 100644
--- a/.agents/plugins/bkit/agents/bkit-build-challenge-1.md
+++ b/.agents/plugins/bkit/agents/bkit-build-challenge-1.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-build-challenge-2.md b/.agents/plugins/bkit/agents/bkit-build-challenge-2.md
index 116df101c..5fa1f04bb 100644
--- a/.agents/plugins/bkit/agents/bkit-build-challenge-2.md
+++ b/.agents/plugins/bkit/agents/bkit-build-challenge-2.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-build-install-skills.md b/.agents/plugins/bkit/agents/bkit-build-install-skills.md
index ecfc5b03e..a35fe5535 100644
--- a/.agents/plugins/bkit/agents/bkit-build-install-skills.md
+++ b/.agents/plugins/bkit/agents/bkit-build-install-skills.md
@@ -17,7 +17,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-convert.md b/.agents/plugins/bkit/agents/bkit-build-plan-convert.md
index 16daf03b9..c1655c835 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-convert.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-convert.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-current.md b/.agents/plugins/bkit/agents/bkit-build-plan-current.md
index 62421edf1..5bbe8a2d0 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-current.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-current.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md b/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
index c49fa36f1..c3be9c2d1 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-tasks.md b/.agents/plugins/bkit/agents/bkit-build-plan-tasks.md
index 284c712c0..ccd89baef 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-tasks.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-tasks.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-tests.md b/.agents/plugins/bkit/agents/bkit-build-plan-tests.md
index f802350c6..612ed488c 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-tests.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-tests.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-verify.md b/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
index 5617f73e2..d30728203 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-debug-abort-handover.md b/.agents/plugins/bkit/agents/bkit-debug-abort-handover.md
index 45d2fb827..b3ff93238 100644
--- a/.agents/plugins/bkit/agents/bkit-debug-abort-handover.md
+++ b/.agents/plugins/bkit/agents/bkit-debug-abort-handover.md
@@ -16,7 +16,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md b/.agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
index ee65d9a6c..4c5e1a639 100644
--- a/.agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
+++ b/.agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
@@ -21,7 +21,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-debug-failure-remediate.md b/.agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
index 3c7beb6b8..df7f8ab24 100644
--- a/.agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
+++ b/.agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md b/.agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
index c126c66d0..8d61e6df1 100644
--- a/.agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
+++ b/.agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-debug-failure-soak.md b/.agents/plugins/bkit/agents/bkit-debug-failure-soak.md
index 831e893e3..2e8dd9834 100644
--- a/.agents/plugins/bkit/agents/bkit-debug-failure-soak.md
+++ b/.agents/plugins/bkit/agents/bkit-debug-failure-soak.md
@@ -21,7 +21,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md b/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
index ab3535dc7..54e74ef6a 100644
--- a/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
+++ b/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
@@ -17,7 +17,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md b/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
index cb32a6220..129caafc2 100644
--- a/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
+++ b/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
@@ -17,7 +17,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md b/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
index f332a7282..9f33e5723 100644
--- a/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
+++ b/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
@@ -17,7 +17,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-design-generate.md b/.agents/plugins/bkit/agents/bkit-design-generate.md
index 96bea8eb6..c41be4f9f 100644
--- a/.agents/plugins/bkit/agents/bkit-design-generate.md
+++ b/.agents/plugins/bkit/agents/bkit-design-generate.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-design-organise.md b/.agents/plugins/bkit/agents/bkit-design-organise.md
index c6ffa11a7..fcfb8d023 100644
--- a/.agents/plugins/bkit/agents/bkit-design-organise.md
+++ b/.agents/plugins/bkit/agents/bkit-design-organise.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-design-review-1.md b/.agents/plugins/bkit/agents/bkit-design-review-1.md
index eac77ba06..d9f57e5c1 100644
--- a/.agents/plugins/bkit/agents/bkit-design-review-1.md
+++ b/.agents/plugins/bkit/agents/bkit-design-review-1.md
@@ -21,7 +21,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-design-review-2.md b/.agents/plugins/bkit/agents/bkit-design-review-2.md
index 5ebca6528..62041a4b2 100644
--- a/.agents/plugins/bkit/agents/bkit-design-review-2.md
+++ b/.agents/plugins/bkit/agents/bkit-design-review-2.md
@@ -21,7 +21,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-design-spike.md b/.agents/plugins/bkit/agents/bkit-design-spike.md
index 1d5d4945a..3405354cc 100644
--- a/.agents/plugins/bkit/agents/bkit-design-spike.md
+++ b/.agents/plugins/bkit/agents/bkit-design-spike.md
@@ -21,7 +21,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-design-update.md b/.agents/plugins/bkit/agents/bkit-design-update.md
index 521b67d49..0f12909de 100644
--- a/.agents/plugins/bkit/agents/bkit-design-update.md
+++ b/.agents/plugins/bkit/agents/bkit-design-update.md
@@ -18,7 +18,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-plan-generate.md b/.agents/plugins/bkit/agents/bkit-plan-generate.md
index acc6529d3..1b6518a93 100644
--- a/.agents/plugins/bkit/agents/bkit-plan-generate.md
+++ b/.agents/plugins/bkit/agents/bkit-plan-generate.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-plan-review-1.md b/.agents/plugins/bkit/agents/bkit-plan-review-1.md
index 25328bab0..3a5ae8f24 100644
--- a/.agents/plugins/bkit/agents/bkit-plan-review-1.md
+++ b/.agents/plugins/bkit/agents/bkit-plan-review-1.md
@@ -18,7 +18,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-plan-review-2.md b/.agents/plugins/bkit/agents/bkit-plan-review-2.md
index bdb29d467..fd616b9ca 100644
--- a/.agents/plugins/bkit/agents/bkit-plan-review-2.md
+++ b/.agents/plugins/bkit/agents/bkit-plan-review-2.md
@@ -18,7 +18,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-plan-scope-check.md b/.agents/plugins/bkit/agents/bkit-plan-scope-check.md
index 811ad2899..dfe330062 100644
--- a/.agents/plugins/bkit/agents/bkit-plan-scope-check.md
+++ b/.agents/plugins/bkit/agents/bkit-plan-scope-check.md
@@ -18,7 +18,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-plan-update.md b/.agents/plugins/bkit/agents/bkit-plan-update.md
index 4fc1b6596..36dc41ff6 100644
--- a/.agents/plugins/bkit/agents/bkit-plan-update.md
+++ b/.agents/plugins/bkit/agents/bkit-plan-update.md
@@ -18,7 +18,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md b/.agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
index f78daa9b7..021697d0e 100644
--- a/.agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
+++ b/.agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md b/.agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
index ab962bf0f..05b1a9eb4 100644
--- a/.agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
+++ b/.agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-ship-update-docs.md b/.agents/plugins/bkit/agents/bkit-ship-update-docs.md
index cb8a0235f..3e6ca7b69 100644
--- a/.agents/plugins/bkit/agents/bkit-ship-update-docs.md
+++ b/.agents/plugins/bkit/agents/bkit-ship-update-docs.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-utility-compress-markdown.md b/.agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
index da7f6b8ed..76ff11109 100644
--- a/.agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
+++ b/.agents/plugins/bkit/agents/bkit-utility-compress-markdown.md
@@ -17,7 +17,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-utility-update-decisions.md b/.agents/plugins/bkit/agents/bkit-utility-update-decisions.md
index fd72cec1b..96e2c7fb7 100644
--- a/.agents/plugins/bkit/agents/bkit-utility-update-decisions.md
+++ b/.agents/plugins/bkit/agents/bkit-utility-update-decisions.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-utility-update-deferrals.md b/.agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
index e0b9d60f5..98d89bd33 100644
--- a/.agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
+++ b/.agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-utility-update-documentation.md b/.agents/plugins/bkit/agents/bkit-utility-update-documentation.md
index 50c3d77b1..d7c47d3ab 100644
--- a/.agents/plugins/bkit/agents/bkit-utility-update-documentation.md
+++ b/.agents/plugins/bkit/agents/bkit-utility-update-documentation.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-utility-update-failures.md b/.agents/plugins/bkit/agents/bkit-utility-update-failures.md
index 014069aee..36cea3884 100644
--- a/.agents/plugins/bkit/agents/bkit-utility-update-failures.md
+++ b/.agents/plugins/bkit/agents/bkit-utility-update-failures.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-utility-update-knowledge.md b/.agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
index 9eb239285..123d36ee8 100644
--- a/.agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
+++ b/.agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-utility-update-roadmap.md b/.agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
index 9b195c833..5ffc9dd39 100644
--- a/.agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
+++ b/.agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
@@ -21,7 +21,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/plugins/bkit/agents/bkit-utility-update-tracker.md b/.agents/plugins/bkit/agents/bkit-utility-update-tracker.md
index 6ab0890da..35c6048ef 100644
--- a/.agents/plugins/bkit/agents/bkit-utility-update-tracker.md
+++ b/.agents/plugins/bkit/agents/bkit-utility-update-tracker.md
@@ -24,7 +24,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.agents/rules.md b/.agents/rules.md
index 38529dd11..80775fefa 100644
--- a/.agents/rules.md
+++ b/.agents/rules.md
@@ -12,6 +12,7 @@
 > - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
 > - `Universal Rules` apply to all agents; `Orchestrator Rules` apply only to workflows and commands.
 > - Local project rules / overrides → `Project Rules` below the bkit-managed block; universal rules stay in the block.
+> - What the project optimises for → `Project Goals`, between `Project Rules` and `Project Settings`. Goals break ties between options the rules both allow, and add no rule.
 > - Where project services live (repo, boards, service org / project ids) → `Project Settings`, the last section. It holds facts only: no rules, and nothing that changes workflows, gates or permissions.
 
 ## bkit Rules
diff --git a/.bkit/core/.agents/rules.md b/.bkit/core/.agents/rules.md
index b1bdabf61..9d31024e4 100644
--- a/.bkit/core/.agents/rules.md
+++ b/.bkit/core/.agents/rules.md
@@ -12,6 +12,7 @@
 > - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
 > - `Universal Rules` apply to all agents; `Orchestrator Rules` apply only to workflows and commands.
 > - Local project rules / overrides → `Project Rules` below the bkit-managed block; universal rules stay in the block.
+> - What the project optimises for → `Project Goals`, between `Project Rules` and `Project Settings`. Goals break ties between options the rules both allow, and add no rule.
 > - Where project services live (repo, boards, service org / project ids) → `Project Settings`, the last section. It holds facts only: no rules, and nothing that changes workflows, gates or permissions.
 
 ## bkit Rules
@@ -180,6 +181,16 @@
 
 ### Orchestrator Rules
 
+## Project Goals
+
+What this project optimises for, most important first. Goals break ties: when two options both satisfy the rules, pick the one that serves these goals better. One bullet per goal; delete unused examples.
+
+<!-- Examples:
+- **Correct over fast:** A wrong answer costs more than a slow one. Prefer the option that checks its input.
+- **Works for everyone:** Every screen works with a keyboard and a screen reader. Prefer the option that keeps it so.
+- **Small to run:** Prefer the option with fewer moving parts to deploy and watch.
+-->
+
 ## Project Settings
 
 Non-secret identifiers agents pass to MCP servers and CLIs; tokens stay in env files. One row per value; delete unused rows.
diff --git a/.bkit/core/.bkit/prompts.md b/.bkit/core/.bkit/prompts.md
index 2daad5f4f..1bb11c09d 100644
--- a/.bkit/core/.bkit/prompts.md
+++ b/.bkit/core/.bkit/prompts.md
@@ -446,7 +446,7 @@ Hooks add text to an agent's context mid-run. The text reaches every agent and s
 | **Tracker-bound output (`Output cap: 500 token prose`)** | `bkit-debug-abort-handover` | Output is pasted verbatim into the tracker comment thread (workflow `comment-post-step` block). The cap applies to prose only. Sections that list items verbatim are exempt, because a reworded acceptance item or option loses the trade-off the human decides on. The output is self-contained: don't add references to other files the human reviewer can't open. **Cap belongs only here:** critique / review / diagnosis agents (`bkit-*-review-*`, `bkit-*-scope-check-*`, `bkit-build-plan-verify`, `bkit-build-challenge-*`, `bkit-debug-failure-diagnose`, `bkit-ship-deferred-sweep`) are uncapped because their output drives downstream apply steps (`*-update`, `*-remediate`) and detail compression there pushes interpretation cost onto the apply agent. |
 | **Stubbed output (verdict + section placeholders)** | All multi-section verdict-bearing agents — critique / review (`bkit-design-review-*`, `bkit-design-spike`, `bkit-plan-review-*`, `bkit-plan-scope-check`, `bkit-build-plan-current`, `bkit-build-plan-verify`, `bkit-build-challenge-1`, `bkit-build-challenge-2`, `bkit-debug-failure-diagnose`, `bkit-ship-deferred-sweep`), top-of-pipeline synthesizers (`bkit-design-generate`, `bkit-plan-generate`, `bkit-audit-generate`), the tracker-bound handover (`bkit-debug-abort-handover`), and source modifiers (`bkit-build-plan-tasks`, `bkit-build-plan-gaps-remediate`, `bkit-debug-failure-remediate`, `bkit-ship-conflict-resolve`) — see "Flat append-only log for source modifiers" row below. | Process shape: (1) Write the **Create** output stub, with `PENDING` in every placeholder (matches Output format); (2-3) re-read inputs + load docs; (4) Update **Create** output — replace each PENDING via `Edit` as content becomes available (standing directive for the analysis below); (5+) analysis steps fill PENDING incrementally as findings emerge. Output format ends each section's bracketed placeholder with "; initially set to `PENDING`." Truncation recovery is section-granular: the orchestrator greps for PENDING markers and re-issues the specific gaps. Per-step gate `No PENDING placeholders remain` paired with `Verdict valid` enforces completeness. Plan-update / design-update / design-organise follow the same shape but bootstrap from the prior v(N) with `bkit steps stub --from= --to=` (Bash; `--strip-header` drops the prior header) instead of fresh stub (Write), so steps 2-4 above are steps 1-3 there. |
 | **Untrusted-input prompt-defense** | every `.bkit/core/prompts/*.md` and every `.bkit/core/workflows/*.md` — no exceptions, no selection step | Two bullets in the `**Rules:**` block, identical in every file: the `external-input` and `external-skills` clauses in `.bkit/instructions.md`, copied from `.agents/rules.md`. `.bkit/core/engine/tools/instructions.test.ts` enumerates both directories and rejects missing clauses, near-copies and retired wording. It checks the data-not-instructions, report-directives and token-scope requirements, plus the skill-authority boundary. Every new prompt must carry both rules. Universal coverage avoids a per-file decision that could leave an agent unprotected. Threat model, write-time fence and spawn-line notice: `.bkit/prompts.md` § Untrusted Content & Prompt Injection (threat model). |
-| **Central agent rules (`**Rules file:**` bullet, `**Rules:**` block)** | every `.bkit/core/prompts/*.md` — no exceptions | `.agents/rules.md` is a 2x2: `bkit Rules` and `Project Rules` each split into `Universal Rules` (binds every agent) and `Orchestrator Rules` (workflows / commands only — git, CI, merge, tracker, and human-gate rules a leaf must not act on). **bkit rules are copied:** the `**Rules:**` block after `**Contract:**` holds, word for word and in `rules.md` order, every bkit `Universal Rules` bullet whose `- carry:` line in `.bkit/instructions.md` names the prompt (the agent acts on it: its carriers plus its tool set — `Bash` → `Destructive git`, `Other parallel agents`; `Edit` / `Write` → `File edits`, `Edit tools`). A rule never appears in `**Protocol:**` or `**Contract:**` as well. A leaf sees only the bkit rules its carry lines name. **Project rules are read:** a prompt with `Grep` or `Bash` says ``Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.``, so its agent never loads the bkit block it already carries; a prompt with neither says ``Read `.agents/rules.md` below `<!-- bkit:end -->` → …``. Either way a consumer's universal rules and `Project Settings` reach leaves while their orchestrator-only rules do not. The split is the consumer's declaration of which is which. Subsection names are shared across the two groups (`Agent Management`, `Git, CI & Merges`); a subsection is omitted only where it has no entry. **Position is contract:** `**Rules file:**` is always the first bullet of the `**Protocol:**` block, in every prompt and every workflow. Workflows and the repo-only `utility-*` agents (they push and merge) take the unscoped `**Rules file:**` line, and the entry files (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules/bkit-rules.mdc`, un-quoted `- **Rules:**`) the same text under `**Rules:**`: ``Read `.agents/rules.md` → follow all rules.``. `.bkit/core/engine/tools/instructions.test.ts` asserts the three header blocks, the `**Rules file:**` anchor, the block and order of every placed header clause, `rules-leaf` forbidden on workflows and `utility-*` agents, both groups under `bkit Rules`, and a universal counterpart for every orchestrator subsection; `.bkit/core/engine/tools/instructions-coverage.test.ts` asserts every prompt holds each rule its carry line names, no prompt holds a bkit rule no carry line names, and every prompt carries at least one. **Assertions stop at `bkit:end`:** `Project Rules` is consumer-owned; `bkit install` never writes it and `bkit check` ignores it. Header clauses (`**Order:**`, `**No improv:**`, `**No commits:**` (prompts with `Bash`)) stay inline in every prompt they apply to. `**Auto-apply:**` is `Orchestrator Rules` only and inlined in no prompt. |
+| **Central agent rules (`**Rules file:**` bullet, `**Rules:**` block)** | every `.bkit/core/prompts/*.md` — no exceptions | `.agents/rules.md` is a 2x2: `bkit Rules` and `Project Rules` each split into `Universal Rules` (binds every agent) and `Orchestrator Rules` (workflows / commands only — git, CI, merge, tracker, and human-gate rules a leaf must not act on). **bkit rules are copied:** the `**Rules:**` block after `**Contract:**` holds, word for word and in `rules.md` order, every bkit `Universal Rules` bullet whose `- carry:` line in `.bkit/instructions.md` names the prompt (the agent acts on it: its carriers plus its tool set — `Bash` → `Destructive git`, `Other parallel agents`; `Edit` / `Write` → `File edits`, `Edit tools`). A rule never appears in `**Protocol:**` or `**Contract:**` as well. A leaf sees only the bkit rules its carry lines name. **Project rules are read:** a prompt with `Grep` or `Bash` says ``Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.``, so its agent never loads the bkit block it already carries; a prompt with neither says ``Read `.agents/rules.md` below `<!-- bkit:end -->` → …``. Either way a consumer's universal rules, `Project Goals` (a third section a leaf reads, which breaks ties between options the rules both allow) and `Project Settings` reach leaves while their orchestrator-only rules do not. The split is the consumer's declaration of which is which. Subsection names are shared across the two groups (`Agent Management`, `Git, CI & Merges`); a subsection is omitted only where it has no entry. **Position is contract:** `**Rules file:**` is always the first bullet of the `**Protocol:**` block, in every prompt and every workflow. Workflows and the repo-only `utility-*` agents (they push and merge) take the unscoped `**Rules file:**` line, and the entry files (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules/bkit-rules.mdc`, un-quoted `- **Rules:**`) the same text under `**Rules:**`: ``Read `.agents/rules.md` → follow all rules.``. `.bkit/core/engine/tools/instructions.test.ts` asserts the three header blocks, the `**Rules file:**` anchor, the block and order of every placed header clause, `rules-leaf` forbidden on workflows and `utility-*` agents, both groups under `bkit Rules`, and a universal counterpart for every orchestrator subsection; `.bkit/core/engine/tools/instructions-coverage.test.ts` asserts every prompt holds each rule its carry line names, no prompt holds a bkit rule no carry line names, and every prompt carries at least one. **Assertions stop at `bkit:end`:** `Project Rules` is consumer-owned; `bkit install` never writes it and `bkit check` ignores it. Header clauses (`**Order:**`, `**No improv:**`, `**No commits:**` (prompts with `Bash`)) stay inline in every prompt they apply to. `**Auto-apply:**` is `Orchestrator Rules` only and inlined in no prompt. |
 | **`.agents/docs.md` read exemption** | `bkit-utility-compress-markdown` | A single-file mechanical utility that compresses prose in one supplied target. It does no domain reasoning, so the doc catalog earns nothing against its token cost. Every other prompt loads it. |
 | **`acceptEdits` hard requirement** | All in-pipeline agents | `Bash(*)`/`Edit(*)`/`Write(*)` blanket-allow lives in `.claude/settings.json`; `acceptEdits` skips per-call prompts. Stricter modes break end-to-end runs. |
 | **Plan task ticking owned by verify** | `bkit-build-plan-tasks` (ticks only applicable Pre-Flight and gate boxes), `bkit-build-plan-verify` (ticks task boxes `[ ]`→`[x]` only on verified codebase artifact) | Task checkboxes are verify's derived view of the codebase. The executor's durable progress record is its flat append-only log of `DONE —` lines, which keeps resume safe and keeps per-task `Edit` ticks out of its turn budget. Execute ticks each applicable Pre-Flight and gate box as that gate passes and continues without asking; it never ticks a task box or a human-confirmation box. |
diff --git a/.bkit/core/engine/audits/repo/rules-sync.test.ts b/.bkit/core/engine/audits/repo/rules-sync.test.ts
index 0b18cdcfb..92943fc56 100644
--- a/.bkit/core/engine/audits/repo/rules-sync.test.ts
+++ b/.bkit/core/engine/audits/repo/rules-sync.test.ts
@@ -110,13 +110,37 @@ describe("bkit-rules-sync — managed block byte-equality gate (WS7-T1, D3)", ()
     const belowManaged = templateContent.slice(
       templateContent.indexOf("<!-- bkit:end -->") + "<!-- bkit:end -->".length,
     );
-    const bullets = [...belowManaged.matchAll(/^-\s*\*\*([^*]+):\*\*/gm)].map((m) => m[1]);
+    const withoutComments = belowManaged.replace(/<!--[\s\S]*?-->/g, "");
+    const bullets = [...withoutComments.matchAll(/^-\s*\*\*([^*]+):\*\*/gm)].map((m) => m[1]);
 
     expect(
       bullets,
       ".bkit/core/.agents/rules.md must carry no project rules below bkit:end",
     ).toEqual([]);
   });
+
+  it("the template holds an empty Project Goals section between Project Rules and Project Settings", () => {
+    const templateContent = fs.readFileSync(templateRulesPath, "utf-8");
+    const belowManaged = templateContent.slice(
+      templateContent.indexOf("<!-- bkit:end -->") + "<!-- bkit:end -->".length,
+    );
+    const headings = [...belowManaged.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
+    expect(headings.filter((h) => h.startsWith("Project "))).toEqual([
+      "Project Rules",
+      "Project Goals",
+      "Project Settings",
+    ]);
+
+    const goalsStart = belowManaged.indexOf("## Project Goals");
+    const settingsStart = belowManaged.indexOf("## Project Settings");
+    const section = belowManaged
+      .slice(goalsStart + "## Project Goals".length, settingsStart)
+      .replace(/<!--[\s\S]*?-->/g, "");
+    expect(
+      [...section.matchAll(/^\s*[-*]\s+\S/gm)],
+      "no goal bullet may sit outside an HTML comment",
+    ).toEqual([]);
+  });
 });
 
 describe("Tracker work comments rule", () => {
diff --git a/.bkit/core/engine/tools/instructions.test.ts b/.bkit/core/engine/tools/instructions.test.ts
index e9b46ae9f..ad83b3331 100644
--- a/.bkit/core/engine/tools/instructions.test.ts
+++ b/.bkit/core/engine/tools/instructions.test.ts
@@ -257,14 +257,17 @@ describe("the rule groups the Rules clauses name exist", () => {
     );
   });
 
-  it("rules-leaf reads only below bkit:end and skips Orchestrator Rules", () => {
+  it("rules-leaf reads only below bkit:end, breaks ties by Project Goals and skips Orchestrator Rules", () => {
     // The bkit rules a leaf acts on are copied into its prompt (`- carry:`); the
     // SKIP half keeps the project's git / CI / merge rules away from a leaf.
     // A leaf that can search finds the marker's line first and reads from there,
     // so the bkit block it already carries is never loaded.
-    expect(clause("rules-leaf").texts[0]).toBe(
-      "**Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.",
+    const text = clause("rules-leaf").texts[0];
+    expect(text).toContain(
+      "**Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`",
     );
+    expect(text).toContain("break ties by its `Project Goals`");
+    expect(text).toContain("skip its `Orchestrator Rules`");
     expect(clause("rules-leaf").modes.prompt).toBe("if-search");
   });
 
diff --git a/.bkit/core/prompts/bkit-audit-generate.md b/.bkit/core/prompts/bkit-audit-generate.md
index 77b0175ab..6a29c7f32 100644
--- a/.bkit/core/prompts/bkit-audit-generate.md
+++ b/.bkit/core/prompts/bkit-audit-generate.md
@@ -40,7 +40,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-build-challenge-1.md b/.bkit/core/prompts/bkit-build-challenge-1.md
index e2a32352b..ea672124b 100644
--- a/.bkit/core/prompts/bkit-build-challenge-1.md
+++ b/.bkit/core/prompts/bkit-build-challenge-1.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-build-challenge-2.md b/.bkit/core/prompts/bkit-build-challenge-2.md
index de87cf3bf..2dc39e7ef 100644
--- a/.bkit/core/prompts/bkit-build-challenge-2.md
+++ b/.bkit/core/prompts/bkit-build-challenge-2.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-build-install-skills.md b/.bkit/core/prompts/bkit-build-install-skills.md
index 746c27554..29f1cdea9 100644
--- a/.bkit/core/prompts/bkit-build-install-skills.md
+++ b/.bkit/core/prompts/bkit-build-install-skills.md
@@ -19,7 +19,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-build-plan-convert.md b/.bkit/core/prompts/bkit-build-plan-convert.md
index 601c3d03e..396b0b389 100644
--- a/.bkit/core/prompts/bkit-build-plan-convert.md
+++ b/.bkit/core/prompts/bkit-build-plan-convert.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-build-plan-current.md b/.bkit/core/prompts/bkit-build-plan-current.md
index 49d3312cc..6ae19bf0a 100644
--- a/.bkit/core/prompts/bkit-build-plan-current.md
+++ b/.bkit/core/prompts/bkit-build-plan-current.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md b/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
index 2b3dd5b1d..ffdb3e5fe 100644
--- a/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
+++ b/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-build-plan-tasks.md b/.bkit/core/prompts/bkit-build-plan-tasks.md
index 7de0125d6..6ca2dabbb 100644
--- a/.bkit/core/prompts/bkit-build-plan-tasks.md
+++ b/.bkit/core/prompts/bkit-build-plan-tasks.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-build-plan-tests.md b/.bkit/core/prompts/bkit-build-plan-tests.md
index 870bf6616..95c4b604e 100644
--- a/.bkit/core/prompts/bkit-build-plan-tests.md
+++ b/.bkit/core/prompts/bkit-build-plan-tests.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-build-plan-verify.md b/.bkit/core/prompts/bkit-build-plan-verify.md
index 858fe8258..d808901a8 100644
--- a/.bkit/core/prompts/bkit-build-plan-verify.md
+++ b/.bkit/core/prompts/bkit-build-plan-verify.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-debug-abort-handover.md b/.bkit/core/prompts/bkit-debug-abort-handover.md
index cdce19064..21c1b04cc 100644
--- a/.bkit/core/prompts/bkit-debug-abort-handover.md
+++ b/.bkit/core/prompts/bkit-debug-abort-handover.md
@@ -18,7 +18,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-debug-failure-diagnose.md b/.bkit/core/prompts/bkit-debug-failure-diagnose.md
index 4559ccd46..23d9fc73c 100644
--- a/.bkit/core/prompts/bkit-debug-failure-diagnose.md
+++ b/.bkit/core/prompts/bkit-debug-failure-diagnose.md
@@ -23,7 +23,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-debug-failure-remediate.md b/.bkit/core/prompts/bkit-debug-failure-remediate.md
index a79cf3bb6..37fe12723 100644
--- a/.bkit/core/prompts/bkit-debug-failure-remediate.md
+++ b/.bkit/core/prompts/bkit-debug-failure-remediate.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-debug-failure-reproduce.md b/.bkit/core/prompts/bkit-debug-failure-reproduce.md
index 56120432f..7240e952f 100644
--- a/.bkit/core/prompts/bkit-debug-failure-reproduce.md
+++ b/.bkit/core/prompts/bkit-debug-failure-reproduce.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-debug-failure-soak.md b/.bkit/core/prompts/bkit-debug-failure-soak.md
index 9af3eed1e..408442b53 100644
--- a/.bkit/core/prompts/bkit-debug-failure-soak.md
+++ b/.bkit/core/prompts/bkit-debug-failure-soak.md
@@ -23,7 +23,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-design-brainstorm-ideate-1.md b/.bkit/core/prompts/bkit-design-brainstorm-ideate-1.md
index d4e591cea..79d20bbab 100644
--- a/.bkit/core/prompts/bkit-design-brainstorm-ideate-1.md
+++ b/.bkit/core/prompts/bkit-design-brainstorm-ideate-1.md
@@ -19,7 +19,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-design-brainstorm-ideate-2.md b/.bkit/core/prompts/bkit-design-brainstorm-ideate-2.md
index d5c2788a8..e29af9c8e 100644
--- a/.bkit/core/prompts/bkit-design-brainstorm-ideate-2.md
+++ b/.bkit/core/prompts/bkit-design-brainstorm-ideate-2.md
@@ -19,7 +19,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-design-brainstorm-ideate-3.md b/.bkit/core/prompts/bkit-design-brainstorm-ideate-3.md
index a4f9277a3..111400233 100644
--- a/.bkit/core/prompts/bkit-design-brainstorm-ideate-3.md
+++ b/.bkit/core/prompts/bkit-design-brainstorm-ideate-3.md
@@ -19,7 +19,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-design-generate.md b/.bkit/core/prompts/bkit-design-generate.md
index 345b5c0cf..5cacaf19c 100644
--- a/.bkit/core/prompts/bkit-design-generate.md
+++ b/.bkit/core/prompts/bkit-design-generate.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-design-organise.md b/.bkit/core/prompts/bkit-design-organise.md
index 88bb695ab..13f5aea39 100644
--- a/.bkit/core/prompts/bkit-design-organise.md
+++ b/.bkit/core/prompts/bkit-design-organise.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-design-review-1.md b/.bkit/core/prompts/bkit-design-review-1.md
index af1124d79..0a145b022 100644
--- a/.bkit/core/prompts/bkit-design-review-1.md
+++ b/.bkit/core/prompts/bkit-design-review-1.md
@@ -23,7 +23,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-design-review-2.md b/.bkit/core/prompts/bkit-design-review-2.md
index 47442f5d2..c6aa4bfe6 100644
--- a/.bkit/core/prompts/bkit-design-review-2.md
+++ b/.bkit/core/prompts/bkit-design-review-2.md
@@ -23,7 +23,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-design-spike.md b/.bkit/core/prompts/bkit-design-spike.md
index ae3582773..e0c9621e9 100644
--- a/.bkit/core/prompts/bkit-design-spike.md
+++ b/.bkit/core/prompts/bkit-design-spike.md
@@ -23,7 +23,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-design-update.md b/.bkit/core/prompts/bkit-design-update.md
index 5692d198e..5fe2cf6c1 100644
--- a/.bkit/core/prompts/bkit-design-update.md
+++ b/.bkit/core/prompts/bkit-design-update.md
@@ -20,7 +20,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-plan-generate.md b/.bkit/core/prompts/bkit-plan-generate.md
index ebde024c7..35107794b 100644
--- a/.bkit/core/prompts/bkit-plan-generate.md
+++ b/.bkit/core/prompts/bkit-plan-generate.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-plan-review-1.md b/.bkit/core/prompts/bkit-plan-review-1.md
index 2c2660620..9720d4c13 100644
--- a/.bkit/core/prompts/bkit-plan-review-1.md
+++ b/.bkit/core/prompts/bkit-plan-review-1.md
@@ -20,7 +20,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-plan-review-2.md b/.bkit/core/prompts/bkit-plan-review-2.md
index 76ad08cb9..c75ea8070 100644
--- a/.bkit/core/prompts/bkit-plan-review-2.md
+++ b/.bkit/core/prompts/bkit-plan-review-2.md
@@ -20,7 +20,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-plan-scope-check.md b/.bkit/core/prompts/bkit-plan-scope-check.md
index fc594ae19..fb2a7898f 100644
--- a/.bkit/core/prompts/bkit-plan-scope-check.md
+++ b/.bkit/core/prompts/bkit-plan-scope-check.md
@@ -20,7 +20,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-plan-update.md b/.bkit/core/prompts/bkit-plan-update.md
index 97ded5552..71d52ad42 100644
--- a/.bkit/core/prompts/bkit-plan-update.md
+++ b/.bkit/core/prompts/bkit-plan-update.md
@@ -20,7 +20,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-ship-conflict-resolve.md b/.bkit/core/prompts/bkit-ship-conflict-resolve.md
index ee6b74a95..ee2abc686 100644
--- a/.bkit/core/prompts/bkit-ship-conflict-resolve.md
+++ b/.bkit/core/prompts/bkit-ship-conflict-resolve.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-ship-deferred-sweep.md b/.bkit/core/prompts/bkit-ship-deferred-sweep.md
index 687deb4b3..4df4563e9 100644
--- a/.bkit/core/prompts/bkit-ship-deferred-sweep.md
+++ b/.bkit/core/prompts/bkit-ship-deferred-sweep.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-ship-update-docs.md b/.bkit/core/prompts/bkit-ship-update-docs.md
index e96dc6b71..5ff88e67a 100644
--- a/.bkit/core/prompts/bkit-ship-update-docs.md
+++ b/.bkit/core/prompts/bkit-ship-update-docs.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-utility-compress-markdown.md b/.bkit/core/prompts/bkit-utility-compress-markdown.md
index 651ffc270..a9b40ce8a 100644
--- a/.bkit/core/prompts/bkit-utility-compress-markdown.md
+++ b/.bkit/core/prompts/bkit-utility-compress-markdown.md
@@ -19,7 +19,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-utility-update-decisions.md b/.bkit/core/prompts/bkit-utility-update-decisions.md
index a4ef5c3c0..e14747eff 100644
--- a/.bkit/core/prompts/bkit-utility-update-decisions.md
+++ b/.bkit/core/prompts/bkit-utility-update-decisions.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-utility-update-deferrals.md b/.bkit/core/prompts/bkit-utility-update-deferrals.md
index dec4c82b7..28b35bc50 100644
--- a/.bkit/core/prompts/bkit-utility-update-deferrals.md
+++ b/.bkit/core/prompts/bkit-utility-update-deferrals.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-utility-update-documentation.md b/.bkit/core/prompts/bkit-utility-update-documentation.md
index 2dd9fd059..d9638090d 100644
--- a/.bkit/core/prompts/bkit-utility-update-documentation.md
+++ b/.bkit/core/prompts/bkit-utility-update-documentation.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-utility-update-failures.md b/.bkit/core/prompts/bkit-utility-update-failures.md
index dc5f0a3a1..971b421ee 100644
--- a/.bkit/core/prompts/bkit-utility-update-failures.md
+++ b/.bkit/core/prompts/bkit-utility-update-failures.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-utility-update-knowledge.md b/.bkit/core/prompts/bkit-utility-update-knowledge.md
index e3f446559..86672991f 100644
--- a/.bkit/core/prompts/bkit-utility-update-knowledge.md
+++ b/.bkit/core/prompts/bkit-utility-update-knowledge.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-utility-update-roadmap.md b/.bkit/core/prompts/bkit-utility-update-roadmap.md
index 2c931e5f3..c3e784d3b 100644
--- a/.bkit/core/prompts/bkit-utility-update-roadmap.md
+++ b/.bkit/core/prompts/bkit-utility-update-roadmap.md
@@ -38,7 +38,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/core/prompts/bkit-utility-update-tracker.md b/.bkit/core/prompts/bkit-utility-update-tracker.md
index b4183a041..b953269ce 100644
--- a/.bkit/core/prompts/bkit-utility-update-tracker.md
+++ b/.bkit/core/prompts/bkit-utility-update-tracker.md
@@ -49,7 +49,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 6ad6d3152..bb50de10e 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -2570,10 +2570,11 @@ One `### {name}` per clause, in the lines of § Format, Clause section lines. He
 - carriers: prompt all
 
 ```text
-**Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+**Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 ```
 
 ```retired
+**Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
 **Rules:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
 **Rules:** Read `.agents/rules.md` → follow all `Universal Rules`; skip `Orchestrator Rules`.
 **Rules:** Read `.agents/rules.md` → FOLLOW ALL `Universal Rules`; SKIP `Orchestrator Rules`.
@@ -9691,7 +9692,7 @@ Two bullets in the `**Rules:**` block, identical in every file: the `external-in
 - source: `.bkit/core/.bkit/prompts.md` § Special Behaviors (frontmatter-adjacent contracts)
 
 ```text
-`.agents/rules.md` is a 2x2: `bkit Rules` and `Project Rules` each split into `Universal Rules` (binds every agent) and `Orchestrator Rules` (workflows / commands only — git, CI, merge, tracker, and human-gate rules a leaf must not act on). **bkit rules are copied:** the `**Rules:**` block after `**Contract:**` holds, word for word and in `rules.md` order, every bkit `Universal Rules` bullet whose `- carry:` line in `.bkit/instructions.md` names the prompt (the agent acts on it: its carriers plus its tool set — `Bash` → `Destructive git`, `Other parallel agents`; `Edit` / `Write` → `File edits`, `Edit tools`). A rule never appears in `**Protocol:**` or `**Contract:**` as well. A leaf sees only the bkit rules its carry lines name. **Project rules are read:** a prompt with `Grep` or `Bash` says ``Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.``, so its agent never loads the bkit block it already carries; a prompt with neither says ``Read `.agents/rules.md` below `<!-- bkit:end -->` → …``. Either way a consumer's universal rules and `Project Settings` reach leaves while their orchestrator-only rules do not. The split is the consumer's declaration of which is which. Subsection names are shared across the two groups (`Agent Management`, `Git, CI & Merges`); a subsection is omitted only where it has no entry. **Position is contract:** `**Rules file:**` is always the first bullet of the `**Protocol:**` block, in every prompt and every workflow. Workflows and the repo-only `utility-*` agents (they push and merge) take the unscoped `**Rules file:**` line, and the entry files (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules/bkit-rules.mdc`, un-quoted `- **Rules:**`) the same text under `**Rules:**`: ``Read `.agents/rules.md` → follow all rules.``. `.bkit/core/engine/tools/instructions.test.ts` asserts the three header blocks, the `**Rules file:**` anchor, the block and order of every placed header clause, `rules-leaf` forbidden on workflows and `utility-*` agents, both groups under `bkit Rules`, and a universal counterpart for every orchestrator subsection; `.bkit/core/engine/tools/instructions-coverage.test.ts` asserts every prompt holds each rule its carry line names, no prompt holds a bkit rule no carry line names, and every prompt carries at least one. **Assertions stop at `bkit:end`:** `Project Rules` is consumer-owned; `bkit install` never writes it and `bkit check` ignores it. Header clauses (`**Order:**`, `**No improv:**`, `**No commits:**` (prompts with `Bash`)) stay inline in every prompt they apply to. `**Auto-apply:**` is `Orchestrator Rules` only and inlined in no prompt.
+`.agents/rules.md` is a 2x2: `bkit Rules` and `Project Rules` each split into `Universal Rules` (binds every agent) and `Orchestrator Rules` (workflows / commands only — git, CI, merge, tracker, and human-gate rules a leaf must not act on). **bkit rules are copied:** the `**Rules:**` block after `**Contract:**` holds, word for word and in `rules.md` order, every bkit `Universal Rules` bullet whose `- carry:` line in `.bkit/instructions.md` names the prompt (the agent acts on it: its carriers plus its tool set — `Bash` → `Destructive git`, `Other parallel agents`; `Edit` / `Write` → `File edits`, `Edit tools`). A rule never appears in `**Protocol:**` or `**Contract:**` as well. A leaf sees only the bkit rules its carry lines name. **Project rules are read:** a prompt with `Grep` or `Bash` says ``Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.``, so its agent never loads the bkit block it already carries; a prompt with neither says ``Read `.agents/rules.md` below `<!-- bkit:end -->` → …``. Either way a consumer's universal rules, `Project Goals` (a third section a leaf reads, which breaks ties between options the rules both allow) and `Project Settings` reach leaves while their orchestrator-only rules do not. The split is the consumer's declaration of which is which. Subsection names are shared across the two groups (`Agent Management`, `Git, CI & Merges`); a subsection is omitted only where it has no entry. **Position is contract:** `**Rules file:**` is always the first bullet of the `**Protocol:**` block, in every prompt and every workflow. Workflows and the repo-only `utility-*` agents (they push and merge) take the unscoped `**Rules file:**` line, and the entry files (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules/bkit-rules.mdc`, un-quoted `- **Rules:**`) the same text under `**Rules:**`: ``Read `.agents/rules.md` → follow all rules.``. `.bkit/core/engine/tools/instructions.test.ts` asserts the three header blocks, the `**Rules file:**` anchor, the block and order of every placed header clause, `rules-leaf` forbidden on workflows and `utility-*` agents, both groups under `bkit Rules`, and a universal counterpart for every orchestrator subsection; `.bkit/core/engine/tools/instructions-coverage.test.ts` asserts every prompt holds each rule its carry line names, no prompt holds a bkit rule no carry line names, and every prompt carries at least one. **Assertions stop at `bkit:end`:** `Project Rules` is consumer-owned; `bkit install` never writes it and `bkit check` ignores it. Header clauses (`**Order:**`, `**No improv:**`, `**No commits:**` (prompts with `Bash`)) stay inline in every prompt they apply to. `**Auto-apply:**` is `Orchestrator Rules` only and inlined in no prompt.
 ```
 
 ### agents-docs-md-read-exemption
diff --git a/.bkit/prompts.md b/.bkit/prompts.md
index a64a1a970..c4759532b 100644
--- a/.bkit/prompts.md
+++ b/.bkit/prompts.md
@@ -446,7 +446,7 @@ Hooks add text to an agent's context mid-run. The text reaches every agent and s
 | **Tracker-bound output (`Output cap: 500 token prose`)** | `bkit-debug-abort-handover` | Output is pasted verbatim into the tracker comment thread (workflow `comment-post-step` block). The cap applies to prose only. Sections that list items verbatim are exempt, because a reworded acceptance item or option loses the trade-off the human decides on. The output is self-contained: don't add references to other files the human reviewer can't open. **Cap belongs only here:** critique / review / diagnosis agents (`bkit-*-review-*`, `bkit-*-scope-check-*`, `bkit-build-plan-verify`, `bkit-build-challenge-*`, `bkit-debug-failure-diagnose`, `bkit-ship-deferred-sweep`) are uncapped because their output drives downstream apply steps (`*-update`, `*-remediate`) and detail compression there pushes interpretation cost onto the apply agent. |
 | **Stubbed output (verdict + section placeholders)** | All multi-section verdict-bearing agents — critique / review (`bkit-design-review-*`, `bkit-design-spike`, `bkit-plan-review-*`, `bkit-plan-scope-check`, `bkit-build-plan-current`, `bkit-build-plan-verify`, `bkit-build-challenge-1`, `bkit-build-challenge-2`, `bkit-debug-failure-diagnose`, `bkit-ship-deferred-sweep`), top-of-pipeline synthesizers (`bkit-design-generate`, `bkit-plan-generate`, `bkit-audit-generate`), the tracker-bound handover (`bkit-debug-abort-handover`), and source modifiers (`bkit-build-plan-tasks`, `bkit-build-plan-gaps-remediate`, `bkit-debug-failure-remediate`, `bkit-ship-conflict-resolve`) — see "Flat append-only log for source modifiers" row below. | Process shape: (1) Write the **Create** output stub, with `PENDING` in every placeholder (matches Output format); (2-3) re-read inputs + load docs; (4) Update **Create** output — replace each PENDING via `Edit` as content becomes available (standing directive for the analysis below); (5+) analysis steps fill PENDING incrementally as findings emerge. Output format ends each section's bracketed placeholder with "; initially set to `PENDING`." Truncation recovery is section-granular: the orchestrator greps for PENDING markers and re-issues the specific gaps. Per-step gate `No PENDING placeholders remain` paired with `Verdict valid` enforces completeness. Plan-update / design-update / design-organise follow the same shape but bootstrap from the prior v(N) with `bkit steps stub --from= --to=` (Bash; `--strip-header` drops the prior header) instead of fresh stub (Write), so steps 2-4 above are steps 1-3 there. |
 | **Untrusted-input prompt-defense** | every `.bkit/core/prompts/*.md` and every `.bkit/core/workflows/*.md` — no exceptions, no selection step | Two bullets in the `**Rules:**` block, identical in every file: the `external-input` and `external-skills` clauses in `.bkit/instructions.md`, copied from `.agents/rules.md`. `.bkit/core/engine/tools/instructions.test.ts` enumerates both directories and rejects missing clauses, near-copies and retired wording. It checks the data-not-instructions, report-directives and token-scope requirements, plus the skill-authority boundary. Every new prompt must carry both rules. Universal coverage avoids a per-file decision that could leave an agent unprotected. Threat model, write-time fence and spawn-line notice: `.bkit/prompts.md` § Untrusted Content & Prompt Injection (threat model). |
-| **Central agent rules (`**Rules file:**` bullet, `**Rules:**` block)** | every `.bkit/core/prompts/*.md` — no exceptions | `.agents/rules.md` is a 2x2: `bkit Rules` and `Project Rules` each split into `Universal Rules` (binds every agent) and `Orchestrator Rules` (workflows / commands only — git, CI, merge, tracker, and human-gate rules a leaf must not act on). **bkit rules are copied:** the `**Rules:**` block after `**Contract:**` holds, word for word and in `rules.md` order, every bkit `Universal Rules` bullet whose `- carry:` line in `.bkit/instructions.md` names the prompt (the agent acts on it: its carriers plus its tool set — `Bash` → `Destructive git`, `Other parallel agents`; `Edit` / `Write` → `File edits`, `Edit tools`). A rule never appears in `**Protocol:**` or `**Contract:**` as well. A leaf sees only the bkit rules its carry lines name. **Project rules are read:** a prompt with `Grep` or `Bash` says ``Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.``, so its agent never loads the bkit block it already carries; a prompt with neither says ``Read `.agents/rules.md` below `<!-- bkit:end -->` → …``. Either way a consumer's universal rules and `Project Settings` reach leaves while their orchestrator-only rules do not. The split is the consumer's declaration of which is which. Subsection names are shared across the two groups (`Agent Management`, `Git, CI & Merges`); a subsection is omitted only where it has no entry. **Position is contract:** `**Rules file:**` is always the first bullet of the `**Protocol:**` block, in every prompt and every workflow. Workflows and the repo-only `utility-*` agents (they push and merge) take the unscoped `**Rules file:**` line, and the entry files (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules/bkit-rules.mdc`, un-quoted `- **Rules:**`) the same text under `**Rules:**`: ``Read `.agents/rules.md` → follow all rules.``. `.bkit/core/engine/tools/instructions.test.ts` asserts the three header blocks, the `**Rules file:**` anchor, the block and order of every placed header clause, `rules-leaf` forbidden on workflows and `utility-*` agents, both groups under `bkit Rules`, and a universal counterpart for every orchestrator subsection; `.bkit/core/engine/tools/instructions-coverage.test.ts` asserts every prompt holds each rule its carry line names, no prompt holds a bkit rule no carry line names, and every prompt carries at least one. **Assertions stop at `bkit:end`:** `Project Rules` is consumer-owned; `bkit install` never writes it and `bkit check` ignores it. Header clauses (`**Order:**`, `**No improv:**`, `**No commits:**` (prompts with `Bash`)) stay inline in every prompt they apply to. `**Auto-apply:**` is `Orchestrator Rules` only and inlined in no prompt. |
+| **Central agent rules (`**Rules file:**` bullet, `**Rules:**` block)** | every `.bkit/core/prompts/*.md` — no exceptions | `.agents/rules.md` is a 2x2: `bkit Rules` and `Project Rules` each split into `Universal Rules` (binds every agent) and `Orchestrator Rules` (workflows / commands only — git, CI, merge, tracker, and human-gate rules a leaf must not act on). **bkit rules are copied:** the `**Rules:**` block after `**Contract:**` holds, word for word and in `rules.md` order, every bkit `Universal Rules` bullet whose `- carry:` line in `.bkit/instructions.md` names the prompt (the agent acts on it: its carriers plus its tool set — `Bash` → `Destructive git`, `Other parallel agents`; `Edit` / `Write` → `File edits`, `Edit tools`). A rule never appears in `**Protocol:**` or `**Contract:**` as well. A leaf sees only the bkit rules its carry lines name. **Project rules are read:** a prompt with `Grep` or `Bash` says ``Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.``, so its agent never loads the bkit block it already carries; a prompt with neither says ``Read `.agents/rules.md` below `<!-- bkit:end -->` → …``. Either way a consumer's universal rules, `Project Goals` (a third section a leaf reads, which breaks ties between options the rules both allow) and `Project Settings` reach leaves while their orchestrator-only rules do not. The split is the consumer's declaration of which is which. Subsection names are shared across the two groups (`Agent Management`, `Git, CI & Merges`); a subsection is omitted only where it has no entry. **Position is contract:** `**Rules file:**` is always the first bullet of the `**Protocol:**` block, in every prompt and every workflow. Workflows and the repo-only `utility-*` agents (they push and merge) take the unscoped `**Rules file:**` line, and the entry files (`CLAUDE.md`, `AGENTS.md`, `.cursor/rules/bkit-rules.mdc`, un-quoted `- **Rules:**`) the same text under `**Rules:**`: ``Read `.agents/rules.md` → follow all rules.``. `.bkit/core/engine/tools/instructions.test.ts` asserts the three header blocks, the `**Rules file:**` anchor, the block and order of every placed header clause, `rules-leaf` forbidden on workflows and `utility-*` agents, both groups under `bkit Rules`, and a universal counterpart for every orchestrator subsection; `.bkit/core/engine/tools/instructions-coverage.test.ts` asserts every prompt holds each rule its carry line names, no prompt holds a bkit rule no carry line names, and every prompt carries at least one. **Assertions stop at `bkit:end`:** `Project Rules` is consumer-owned; `bkit install` never writes it and `bkit check` ignores it. Header clauses (`**Order:**`, `**No improv:**`, `**No commits:**` (prompts with `Bash`)) stay inline in every prompt they apply to. `**Auto-apply:**` is `Orchestrator Rules` only and inlined in no prompt. |
 | **`.agents/docs.md` read exemption** | `bkit-utility-compress-markdown` | A single-file mechanical utility that compresses prose in one supplied target. It does no domain reasoning, so the doc catalog earns nothing against its token cost. Every other prompt loads it. |
 | **`acceptEdits` hard requirement** | All in-pipeline agents | `Bash(*)`/`Edit(*)`/`Write(*)` blanket-allow lives in `.claude/settings.json`; `acceptEdits` skips per-call prompts. Stricter modes break end-to-end runs. |
 | **Plan task ticking owned by verify** | `bkit-build-plan-tasks` (ticks only applicable Pre-Flight and gate boxes), `bkit-build-plan-verify` (ticks task boxes `[ ]`→`[x]` only on verified codebase artifact) | Task checkboxes are verify's derived view of the codebase. The executor's durable progress record is its flat append-only log of `DONE —` lines, which keeps resume safe and keeps per-task `Edit` ticks out of its turn budget. Execute ticks each applicable Pre-Flight and gate box as that gate passes and continues without asking; it never ticks a task box or a human-confirmation box. |
diff --git a/.bkit/version b/.bkit/version
index 405e29b8d..1219f3248 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -20,153 +20,153 @@
     ".claude/commands/bkit-design.md": "e11b0c1ee964c028e893e12d173ae6f620f08adc238e784f3a0dba13f75ff0fe",
     ".claude/commands/bkit-plan.md": "8a8fc15962e55b3854410c909e609a57864525374a0b9e566edd67a474e6f797",
     ".claude/commands/bkit-ship.md": "0cde9defcdb4de469748f4f91496f2410fa01310926fc71e4ea4559435116e61",
-    ".claude/agents/bkit-build-challenge-1.md": "20ff6fcaf48d5a6418c696c88e796101c34083326b8353bf6ec766422c4c734f",
-    ".claude/agents/bkit-build-challenge-2.md": "0ef8a829af9b89602a75ac257a093e4a47169ca9c2a4c216d6f11937e2e9c48f",
-    ".claude/agents/bkit-build-install-skills.md": "0249b5fe6550c45afe95972d1d3f4a65f7e159a74038ce9179ca1fceb29e1d12",
-    ".claude/agents/bkit-build-plan-gaps-remediate.md": "9b76ed49ed1d98df75b89894f93ff2b22629e76cccebe771a554efa26231a6e5",
-    ".claude/agents/bkit-build-plan-verify.md": "821c7d9e62d93f13220380bb848ed7da20ffbfc319e9d7f0362b56cc75ff6a1f",
-    ".claude/agents/bkit-debug-abort-handover.md": "4d2ed067a5933578768325379269f51357365d7740986a2de580f022bace0a26",
-    ".claude/agents/bkit-debug-failure-diagnose.md": "6a398cc3e24ad1da9e624ec0b9efa63f27d1229c8f9f9f138a506f55817700b0",
-    ".claude/agents/bkit-debug-failure-remediate.md": "0711217d55056389f25a82431d04bbb587c3124da45d5ea0f1d6f6bcbead04f5",
-    ".claude/agents/bkit-debug-failure-soak.md": "0ff3e706428b1d9973b4774d75f7147d7e65682d15431127fc9fcc29b05e9055",
-    ".claude/agents/bkit-design-brainstorm-ideate-1.md": "f465bc0f6d1fc741182bce1aad55b85bf2a9de1c9b5c28bf72d2f7ca52276bb2",
-    ".claude/agents/bkit-design-brainstorm-ideate-2.md": "9d66709810fd63071cf68f0e909912366ea4fd2364fdf59e6e6c163467398bb5",
-    ".claude/agents/bkit-design-brainstorm-ideate-3.md": "5ff5aed2175e3cd102f86aa8af0cef211084c0276873f1c82ec3215ba49e5077",
-    ".claude/agents/bkit-design-generate.md": "fb676c2842243d4d86310ff77d2a96717ba9e0df94e7d505198664f1b482ecbb",
-    ".claude/agents/bkit-design-organise.md": "810283b6dcd06a76fb259bcab326d700d34744618ba4724c06e2e091c95f4328",
-    ".claude/agents/bkit-design-review-1.md": "33fa952eceb75001e826da6ba67236630c2d1138daebf959f27dbb187283fabe",
-    ".claude/agents/bkit-design-review-2.md": "197042abee1d7119bd2abadc1fae3a26cec75ff0201a8cd7abe98bdafbab2569",
-    ".claude/agents/bkit-design-update.md": "da188d9fbf453932766a064de41690953cf5d1457a956b6d0c4ba7043f6a760d",
-    ".claude/agents/bkit-plan-generate.md": "12edef87b62a45351dd4cfe65e2029986e89f351666b75d0bf05c84f3b209e09",
-    ".claude/agents/bkit-plan-review-1.md": "aaec6adedfeacd2e85b875c406ddd093d4197db20eab298a09b80e735a67b011",
-    ".claude/agents/bkit-plan-review-2.md": "6819aea7db885c635658991debda35e6974d534f9c07dc12bd26ef6deb7ac325",
-    ".claude/agents/bkit-plan-update.md": "ca76c16ebe81fef29e4bd6452e2dfc5b9e2c7052dda7d02aaf81853c6c369f83",
-    ".claude/agents/bkit-ship-conflict-resolve.md": "c133bd61a184ed730fd32c9b0bb09af73d4933baa7337c0ba9a53cf0dbcab815",
-    ".claude/agents/bkit-ship-deferred-sweep.md": "03439d9563505a4c86f172dbb954593666c10ee38ea79170c9b4ef90649ba836",
-    ".claude/agents/bkit-ship-update-docs.md": "6603009e9ab856f209a01a86f7017cf9ce995958c4c18b51e76ed4733f133d53",
-    ".claude/agents/bkit-utility-compress-markdown.md": "1b7656fc438127f67b566c9f532e6a39649c79e1bda1814608a4f3d44daed45b",
-    ".claude/agents/bkit-utility-update-documentation.md": "58eef51a24cbbd53a16c12cf603888fc4a98963bb7dadbde0b60a7e3207eb43c",
+    ".claude/agents/bkit-build-challenge-1.md": "55171e210cdcdb4060d7baa1ada0c7c51350f47366a049089cd231739f13d79f",
+    ".claude/agents/bkit-build-challenge-2.md": "3c05b187096965de3945e85c32db8af2d1f0f9553d39783b9913d81b9c7b9666",
+    ".claude/agents/bkit-build-install-skills.md": "e862e56303c648443e828f653434e805b6e0cf73fa4de9f68df4ea033b3a8907",
+    ".claude/agents/bkit-build-plan-gaps-remediate.md": "6db1817846a13b15c5d9b1e94e7361e5f579eaad3319ae654d3299d463bd4f85",
+    ".claude/agents/bkit-build-plan-verify.md": "ebfd258cc110c7ccbc23dc3409c1d8a9efe9183438b2b3a455d1a34811382919",
+    ".claude/agents/bkit-debug-abort-handover.md": "1c953a045650aa2defd5200f64316387b0314ebb36a7dba544ef1692cc171230",
+    ".claude/agents/bkit-debug-failure-diagnose.md": "bce73df9cf14e9f60f27c88feb44881e783dd6b9f52f3814df716de144e2946e",
+    ".claude/agents/bkit-debug-failure-remediate.md": "65f63a38337c2e11b86a1318042c6f1a05026e0eec414665d39786515405bf9a",
+    ".claude/agents/bkit-debug-failure-soak.md": "55ec04b8b55c4d045a53044c0f99b64f44d58917d3d842932c737324518ed700",
+    ".claude/agents/bkit-design-brainstorm-ideate-1.md": "35458850a0ddeff422e9affab325fe00c1edf12df69326a1280da0bb38064df3",
+    ".claude/agents/bkit-design-brainstorm-ideate-2.md": "469f72341aacd4cdfb014ef18e01372b3aac1f95fd6c6a4c245967f6faae19ce",
+    ".claude/agents/bkit-design-brainstorm-ideate-3.md": "821726bd5de7e6075f95ab2699f78b404cf9bddc5be5c5920deb3c20764e6ab1",
+    ".claude/agents/bkit-design-generate.md": "ada424e2d99804923dbb114bea5aeb6621b4322c575fc16ea91230226a9744a8",
+    ".claude/agents/bkit-design-organise.md": "97b5e578b77e9704f7bb74cc60d6ba2c8c800e976dcdb9e745f3050518d9bd8c",
+    ".claude/agents/bkit-design-review-1.md": "f2f10b8d4ccb6b1dc5dd765e1151cb9ce1172faa37567bfa795d3f41045dcd66",
+    ".claude/agents/bkit-design-review-2.md": "dda752f3e25cabc2b1573924d7516fe563586490f82aca06eacc189059325b51",
+    ".claude/agents/bkit-design-update.md": "707f751b70115c4aba9fd00e03bae937af16e4166147de9d671ef252d53e94d1",
+    ".claude/agents/bkit-plan-generate.md": "f210bede01f10cb62c887f588c0059981e7a3e2c2d8838ae8737d195eabdadba",
+    ".claude/agents/bkit-plan-review-1.md": "90d51ff259f21b17bda17716b662284f3c37acf63e63c3ccd12eedf6515cd277",
+    ".claude/agents/bkit-plan-review-2.md": "e08170cd85bc2676101c38d4641cf4a26b5eca3fd6dbf01f7da6a6c59c07a03b",
+    ".claude/agents/bkit-plan-update.md": "485fa90ffb61c574011061b0a753175fdc5dba0874eb0811cf24e9f231ac6252",
+    ".claude/agents/bkit-ship-conflict-resolve.md": "2d45173be6264d48c1287c08dc4433906c01b4354e95f9d2076eecf5efa524f6",
+    ".claude/agents/bkit-ship-deferred-sweep.md": "154e0c4153a39924826811a4bf1f45c72f22844607a05d8ede6526918db498b5",
+    ".claude/agents/bkit-ship-update-docs.md": "9a05315bf9942c8ef0a20d69a6b2bec72d78b86cc6a3d4c52b88bbaf136b7441",
+    ".claude/agents/bkit-utility-compress-markdown.md": "3c86aafbdf1d68cc368b5d1d0c111e4a59e76551cea3c3b1d2c90e6dea936629",
+    ".claude/agents/bkit-utility-update-documentation.md": "943acb08665af2528e0869de95232fac2f72615b515cda6ec1ec1c1a25cbc2c6",
     ".cursor/commands/bkit-auto.md": "6e39ef7c143de7ea229a4e7b096f9c23fce989cf25d60c9deee6a141b18cf6dc",
     ".cursor/commands/bkit-build.md": "a2df5a7c57f7a85e532340b6698b5a81e8830d113a3df2a3179847036d52211a",
     ".cursor/commands/bkit-debug.md": "b8129ac862700eed4b3cbd843aa59cbabfbe1085ccca16ea6dd5734195a5c30b",
     ".cursor/commands/bkit-design.md": "a4fd4ce45cbc02588c48beac332b5323ca43c551cce6c880372bde64ba6bfb42",
     ".cursor/commands/bkit-plan.md": "89e897f1d72ae270c919b127ed0f83500ca438fc38c60acf546c6762ae5693df",
     ".cursor/commands/bkit-ship.md": "1afc8f99aa7e7fcb058a44445666b2e1f247d3975cf123a0aa1d5b73771a14ec",
-    ".cursor/agents/bkit-build-challenge-1.md": "91f6446c505416d377dcbabcc49030e704384980f3ed232694069108504c2dab",
-    ".cursor/agents/bkit-build-challenge-2.md": "6399d8b34ff1be2a63b77b911fd8321f80bd0bf64550103f809cdf5194820c24",
-    ".cursor/agents/bkit-build-install-skills.md": "9f77d5ce2bc7e5d1c60d8860b5a06d81091f9194522607151a76838fc895da6d",
-    ".cursor/agents/bkit-build-plan-gaps-remediate.md": "93d66a835d5a6230833803496b55928560181f9799c2730d9fbe8a00f668b961",
-    ".cursor/agents/bkit-build-plan-verify.md": "5c51adbedde4cb6f7b1abf40ed727bd6680ab751a5937fb7c5c584b61c02c2e6",
-    ".cursor/agents/bkit-debug-abort-handover.md": "dbe3697156bb2068701efe79242d9e7d3554206fa266e26772bc74537c946ea9",
-    ".cursor/agents/bkit-debug-failure-diagnose.md": "7bb242e3e454e87e70e2a744827072423f12e37523e628bdaf78a842ce4df4a3",
-    ".cursor/agents/bkit-debug-failure-remediate.md": "597d997785131366a3bd240ffa29b82dce9be80f7bad283dd59a480e7ea9f2d4",
-    ".cursor/agents/bkit-debug-failure-soak.md": "464cf07e690f82bd0d5e32a9b669189e8ac0b6e119e1eae6243a09f14b9df4d5",
-    ".cursor/agents/bkit-design-brainstorm-ideate-1.md": "553260062d9631bd5ba041d35f0ee5917ab4825f9c5814112491efe4beb27077",
-    ".cursor/agents/bkit-design-brainstorm-ideate-2.md": "13de62df46df249dde16478972379d9ca91a2d6aef048d68eefa6ea274bf56cb",
-    ".cursor/agents/bkit-design-brainstorm-ideate-3.md": "8cbedb9b8ec822effb1086685a781931c607d3f217f37782ce58ad6a1754e9cf",
-    ".cursor/agents/bkit-design-generate.md": "1deee0e8b05f384b387e3b726a45494943a2e2a058a14f0cc550dd6cda63505b",
-    ".cursor/agents/bkit-design-organise.md": "6693a01b882c26427ab5aac4c037f783c8197445b2b126648ac08f3e8391a052",
-    ".cursor/agents/bkit-design-review-1.md": "865e2adccacb77c531652bd706113b068530f25c61cad0cb42fb2de970f5bfbc",
-    ".cursor/agents/bkit-design-review-2.md": "069d4218f7c2f378e375415ee188c34ed0803da4fd5a825ddc3e6b7c3f149aa6",
-    ".cursor/agents/bkit-design-update.md": "abc73bba074c55961259ed53e10a23128b7269c1dda4bcd9e3fee4322e2d3aed",
-    ".cursor/agents/bkit-plan-generate.md": "a384622e0d96e1b312f84fa36b582f742aa739f6f82eafec897768d2e0f7e3b0",
-    ".cursor/agents/bkit-plan-review-1.md": "ebf4a36f50493e9d86151efe41577275c512cfa81a613e92a1f4850b2541761a",
-    ".cursor/agents/bkit-plan-review-2.md": "69810779185dfe2d9a582964bfc6ce833f2eb4ee9b9e6f247ad5279bf3f365b6",
-    ".cursor/agents/bkit-plan-update.md": "ec7b794216c404f82dc857f8ddd81b738746e9ff3c5f91510198477c819de55b",
-    ".cursor/agents/bkit-ship-conflict-resolve.md": "67986520d07938a7fc460fd64d2afe1eba139870ccc86d3f63787475ffb5c8ca",
-    ".cursor/agents/bkit-ship-deferred-sweep.md": "90531b1335d7a77c62352a885d192fc64322c8d6f3eb3b96e5d8b1aa094452cd",
-    ".cursor/agents/bkit-ship-update-docs.md": "3cc8a9502a3b88eb478ab44cef636cb0322dff09ea8f9f5b4527ef52ba5d7fa2",
-    ".cursor/agents/bkit-utility-compress-markdown.md": "5238ba61a261eaa0667a511628a67e3df72d2f0132d42d673255b5f49943385d",
-    ".cursor/agents/bkit-utility-update-documentation.md": "9173c0b73336224c164046120ced88d348afe03a3b8a83e384b562bffd66c91f",
-    ".opencode/agents/bkit-build-challenge-1.md": "f279a1470feb7e542494b9fcc69b7dff1ad8e1d7c19190472b76f0734e59f744",
-    ".opencode/agents/bkit-build-challenge-2.md": "9c8bdb5092b44f070468b82d88d9457ab58193d7f5697300877fc96779400e9d",
-    ".opencode/agents/bkit-build-install-skills.md": "56687e9967e11c8e3ddc0c965a4818898d2ad61cc279af30ea862390eb245b8d",
-    ".opencode/agents/bkit-build-plan-gaps-remediate.md": "29482366034e9e60bf3ec9739373ec4a62e9a96e25ec066916fbe6de2fc427d1",
-    ".opencode/agents/bkit-build-plan-verify.md": "e8268c61ac7ac91a10485a4128015247cb3ea0cee5188e32812aacb9db5ae93f",
-    ".opencode/agents/bkit-debug-abort-handover.md": "924dddce677e294ff9391e38e9d563b16ce14ca527db0167386dfb0898ea44a9",
-    ".opencode/agents/bkit-debug-failure-diagnose.md": "dcc407c0594ad209cc95e7b6cd016312db6182346f32b4506585bcbfd102b524",
-    ".opencode/agents/bkit-debug-failure-remediate.md": "6f7707a6a7266249350315ed6e505fa8522d1bac8ad56af1f28919c2287b48c9",
-    ".opencode/agents/bkit-debug-failure-soak.md": "4487ed84e2ece70c5779160d6d8fbbdd7f6dacefecfa8df96e893f1d7f98558c",
-    ".opencode/agents/bkit-design-brainstorm-ideate-1.md": "0a7b8d0aba116228f1c653dbcc6037e39ccef86eaacbf6f2f09cbc869228541f",
-    ".opencode/agents/bkit-design-brainstorm-ideate-2.md": "73871681a169a3dfe1a8c3bac4a7c17d0a058e889b598d4a83ebf094f5009c3b",
-    ".opencode/agents/bkit-design-brainstorm-ideate-3.md": "f6ac88bd01d513db95b98850f3d6bb432b5b6e87b9e713975e6c9c498bbeb30c",
-    ".opencode/agents/bkit-design-generate.md": "5b1b8fc9972e691fadb24762451cca5452bbc8ef13025a2eb7295858711bdbfb",
-    ".opencode/agents/bkit-design-organise.md": "00c0f344cb66426a32445b0b4dbd23ca742202cc302996209f7fafe85ce17e74",
-    ".opencode/agents/bkit-design-review-1.md": "92abd444617f520c388847c0ede7f79c738710c1cbb487ef8c0f14219df2c6bf",
-    ".opencode/agents/bkit-design-review-2.md": "3161725905d5188b3e591733584d6b0dd27af70489b667b33370bc1ca84c1ecd",
-    ".opencode/agents/bkit-design-update.md": "3f358047bf9ba6260e09ee08cf437bb36b33055c155967a4276b1ad608ec3ea0",
-    ".opencode/agents/bkit-plan-generate.md": "9225a87ec543fabd1ec195b69a9847539f08d167a2853aa35333fc6d65a5c12d",
-    ".opencode/agents/bkit-plan-review-1.md": "00b0f9fbb5bb2df30cfd54a7e7eb037652374fa26670fca6d8b5fb3209105700",
-    ".opencode/agents/bkit-plan-review-2.md": "eb28d4237394510ae9134182037f8bf778cd8cfff492171aaa09e384fcc2133b",
-    ".opencode/agents/bkit-plan-update.md": "70cee2a5265d619a4df274544316259bc9d72a5acb3a5bed9cea149010c0c88b",
-    ".opencode/agents/bkit-ship-conflict-resolve.md": "46919d95ca3118549f92b4f2058025dda41059ad74dfb39cc4df9ff18bb89c95",
-    ".opencode/agents/bkit-ship-deferred-sweep.md": "4fe39a2ffe432c2f0f6fdda007b40d946471237799aadbbf42106f5408a09bf2",
-    ".opencode/agents/bkit-ship-update-docs.md": "8b8825e8ef0c25a575c1c4eadb5dae2d8ab285f6c4eca4a6118b2ab24e27bfd5",
-    ".opencode/agents/bkit-utility-compress-markdown.md": "f2f08f6e4de6311dd5f6a4f0573b234d31bae1e0f5d1c4c071969ca978140ee9",
-    ".opencode/agents/bkit-utility-update-documentation.md": "5b274f7a0f331ee4c1ea2bcfc44a5d7855e0756e94e99dafd3d17ef942f3a032",
+    ".cursor/agents/bkit-build-challenge-1.md": "f30812e46004c729665df3cbc26d90607d5ceb8f0a9ab2f54b03e7c114ce6d75",
+    ".cursor/agents/bkit-build-challenge-2.md": "b946b90f31448b17c5c11e868e71f23a0912d98463aee30e20ef307f144cc6e4",
+    ".cursor/agents/bkit-build-install-skills.md": "0893a6ec6bd24b43bf4ec1ce80e85b642a2d7816e61e074add01fcc41c243401",
+    ".cursor/agents/bkit-build-plan-gaps-remediate.md": "551b98658f877b37df076d5cc3b41666f6df910d59c918397757dec49cb11b12",
+    ".cursor/agents/bkit-build-plan-verify.md": "f281f32b253385328a6e27a12871d1f95eba93f63bb2a4a2c0bcb41a3a315711",
+    ".cursor/agents/bkit-debug-abort-handover.md": "bddec6974fbbde92392fe4e90e4bdb522df2d9ccd8633253e3369845d93e8a39",
+    ".cursor/agents/bkit-debug-failure-diagnose.md": "469f82925953fd108a9665713fad6f06d93fa51381c1748d0e7e538964565440",
+    ".cursor/agents/bkit-debug-failure-remediate.md": "93789b99426906fc088033c44a76a80b76aeaaac9d28d9096c4557faff21bd46",
+    ".cursor/agents/bkit-debug-failure-soak.md": "98104aec9e9f3652acef5d597215039387fbf386877da4f14efaa286e7b5cd76",
+    ".cursor/agents/bkit-design-brainstorm-ideate-1.md": "bc33c22a3ad277c5b0c579c9fe059ef7b2c5804cfc9fe78b29ab4555e4b30107",
+    ".cursor/agents/bkit-design-brainstorm-ideate-2.md": "7b4c3d46c3ed768edb464fe2a8f0c478edd6bc1f4debd170bf31ef0e9002b85b",
+    ".cursor/agents/bkit-design-brainstorm-ideate-3.md": "2acb2bc17eed0d0150c15b95e6cf213983516e8d717cbbca28a3cc863b77022c",
+    ".cursor/agents/bkit-design-generate.md": "e3421344df1c626dc1beceafff551234f2e38941fbe746750571289d55eae9e4",
+    ".cursor/agents/bkit-design-organise.md": "70dbe884c0fa43563bdb3d53bf2944a38466467b47d8f5f6901106746cb2b63a",
+    ".cursor/agents/bkit-design-review-1.md": "d2434c4760ddfba8fe2eb11cb95ea1ddb15a92b88ea7bdf112f3c7bd4ddcd95c",
+    ".cursor/agents/bkit-design-review-2.md": "95e2134bdab5d0ec50a73c196e4e954aada79952dfabdb0aaf85c42e4b0a90ca",
+    ".cursor/agents/bkit-design-update.md": "efb4396af22a9c0955d029d6ee47e34d286994bb97daa5559dad7af0a6462f90",
+    ".cursor/agents/bkit-plan-generate.md": "3f48e4ac181219fea7016924eb1763b53c200fb5ff9c843c61adfead51c399db",
+    ".cursor/agents/bkit-plan-review-1.md": "37becdfb1666e7fb97733eba4054c5a5b486523237612fc7b9e27fa7ed330738",
+    ".cursor/agents/bkit-plan-review-2.md": "c5f0cd127aa3eddd9b86b54770b47d7706a88c13979cab936a7da31a497633cf",
+    ".cursor/agents/bkit-plan-update.md": "fecf4a58a65d23dafef62cf6ac9d377f0cf1b21e08b9a259170df0e562cf5bac",
+    ".cursor/agents/bkit-ship-conflict-resolve.md": "d54928d1254e8daa2ba9ab4273f8785edc3d5c40103cf561ad88dc6c6ea810f8",
+    ".cursor/agents/bkit-ship-deferred-sweep.md": "b1311e3676bffccf2d12d807c4590cc6db99171c58cb27d4f33b4f9def10d347",
+    ".cursor/agents/bkit-ship-update-docs.md": "950041c5c9e29b62c6b9a304d7da3f185074f92771239bc7426e75286a88e02c",
+    ".cursor/agents/bkit-utility-compress-markdown.md": "55cd7864334c245225996294a7999c1b4c3e3909226a785e3ad697aa5127abb2",
+    ".cursor/agents/bkit-utility-update-documentation.md": "2b2ae5da4a0debf27127ded766ba5a3f12a29c9171676c0079ea9fea0921423e",
+    ".opencode/agents/bkit-build-challenge-1.md": "cfc0da588b6a0cbc323d6b89972ffc227d240555e2f9f3513d7bbc4f84494496",
+    ".opencode/agents/bkit-build-challenge-2.md": "fb320b5087762cafe37cd196cf3f65aa85bbb2c18a4566295d3b1c40313404c7",
+    ".opencode/agents/bkit-build-install-skills.md": "71359c33c3aa4ed4935e105c51cc4fe5b81cc289a83b4cd150a929dc43fa42ea",
+    ".opencode/agents/bkit-build-plan-gaps-remediate.md": "f9cc1171c9c316c6b35fc38fc855bf52e93e65433a634434bfc18619cea27009",
+    ".opencode/agents/bkit-build-plan-verify.md": "7b4ff5f3c100250a02411b8b2044b6ada6a016eaaf20c54ef479fa1efc0ef433",
+    ".opencode/agents/bkit-debug-abort-handover.md": "cc062473c996aa713859575a3632c9f549bc7890ead955b9612e562eadde018b",
+    ".opencode/agents/bkit-debug-failure-diagnose.md": "35ff0c0182f0dddb0e8ec859e0745964e7ca129a1b342f94f66579d7aa8e22b6",
+    ".opencode/agents/bkit-debug-failure-remediate.md": "502414c0c52e56b38765d0fbcc85cd41cc5d49f0d22aacca37cbbe996147a9ab",
+    ".opencode/agents/bkit-debug-failure-soak.md": "c118a4378a8e33afa65e6e1603f155662d8a6c6c6c8d7987c9bae7ba2e399951",
+    ".opencode/agents/bkit-design-brainstorm-ideate-1.md": "913ce50977bb1d3aea3e3e347b175814373e972bd1ff8167268b9990475372b8",
+    ".opencode/agents/bkit-design-brainstorm-ideate-2.md": "1da42bb4aebf2dd7dfdaacf3abb80fc19d1e26103dbae91191407f6ebbf6d124",
+    ".opencode/agents/bkit-design-brainstorm-ideate-3.md": "691be3459e4cc08601c6ff40172235be7735bf3a1927c670bb9883d9387737bf",
+    ".opencode/agents/bkit-design-generate.md": "c5bd394775705cb1ca2aba7e5b0070c478848625c5bc2980295c0c850ddf21bd",
+    ".opencode/agents/bkit-design-organise.md": "b26020aac0de041237b57634be9704e8cb0d95a399055ad29842f66a4acf48a6",
+    ".opencode/agents/bkit-design-review-1.md": "86c63ece714c0e3c7aba39e3440394f1f5ba78bd059cfe411e38d59dab85510d",
+    ".opencode/agents/bkit-design-review-2.md": "585492eba1f8584683de704eb14544bfa4a1a49ba84600d3cfcc800cc47784ed",
+    ".opencode/agents/bkit-design-update.md": "eb8cecbe5e8e538658a38dcf1556e79d157d7f82819a9bc9701effd96d74e042",
+    ".opencode/agents/bkit-plan-generate.md": "2813f52753fb86cbe555c6df84767d081b2074ddd3b45ba9a0fc259147f36188",
+    ".opencode/agents/bkit-plan-review-1.md": "ca085968f35e41298e13097a3f5bdc6ce121db6a7a8f5941c69994c88818f162",
+    ".opencode/agents/bkit-plan-review-2.md": "31282bba618d9eee6ebea2c781f933bada928ee053933b480047cbb5c4c61357",
+    ".opencode/agents/bkit-plan-update.md": "f782333c2aca89906df86abff989a378cfc905112b9f0857d62e11e640425fa2",
+    ".opencode/agents/bkit-ship-conflict-resolve.md": "eb02556b6b4b10186fb356e196fb76659e765bb682da27edc9f0a3b869465d20",
+    ".opencode/agents/bkit-ship-deferred-sweep.md": "e4b803d9c7cd5c64452e5fce5b97c4f6cd11b67701108e2a7ce29462b7db37a9",
+    ".opencode/agents/bkit-ship-update-docs.md": "ceb606506a169451691852a93cbb650c27be6c6ba415aadc09609cacf803d704",
+    ".opencode/agents/bkit-utility-compress-markdown.md": "f687b19c17a96ed0d3303029a57f2ffbb9a04d8d973d7a2399b29ed018e3f07d",
+    ".opencode/agents/bkit-utility-update-documentation.md": "7a6e399cbd2eb2d62f31a9af7837d9c5b70084c9915a5b0b668bedac4817406a",
     ".opencode/commands/bkit-auto.md": "4c4223f78cd42aa90890c6defa7c0895c17b639f30f2ffbfec6ff8384a42d4c8",
     ".opencode/commands/bkit-build.md": "7884c7160ef8a3ec7d38ca6337025213a08fb6282a745b69f5e031bf41afdff1",
     ".opencode/commands/bkit-debug.md": "1d1d3950771ec8638875321b0cd5f7c7b4a084752921ade007317c440f0fa86f",
     ".opencode/commands/bkit-design.md": "789434c940608dee0eebb43df8784c951cb44d21332b6c43b1218248e8583bc4",
     ".opencode/commands/bkit-plan.md": "c88748af0819ee59aad5711c22788caf94c94b3b2af6e122fd33716cb58ee641",
     ".opencode/commands/bkit-ship.md": "307d25015753d0a63c9776186046bbf20e5c97820825699c16d8368fee0326b9",
-    ".claude/agents/bkit-design-spike.md": "334a96f4f3fdb0a190c8d4cca32c38bee577138fd4acf51036302b325964e889",
-    ".cursor/agents/bkit-design-spike.md": "06729e7a0ffa9f98b109433b56dcfc1e3d0afad12c55250a28eee91549ea45a3",
-    ".opencode/agents/bkit-design-spike.md": "28e5d35f911887fe7b08a74983a48fc131cd5693b7546af8623e9bc75f8e54f4",
-    ".claude/agents/bkit-build-plan-current.md": "cccb291ec2b16fbef813765fdb104b1f7eb086d69b0f7e47e5bbcdfc91352e09",
-    ".cursor/agents/bkit-build-plan-current.md": "047578f46bebd51714dc2297068b6de0e58f25b3a502ffcca0450f5717c70f11",
-    ".opencode/agents/bkit-build-plan-current.md": "8c280ff9b9b4865666a430c9f393aa9db5be628b3f212d518d9f2c05ae3473f0",
+    ".claude/agents/bkit-design-spike.md": "e78d10ad309d2987a1e8bd4140b2b105bf875207670e963f0ef2eb68d4388c1f",
+    ".cursor/agents/bkit-design-spike.md": "7fb642ca98cbff5192cb55ff34e5400ce67d4bad3e4c519877772f13c43587d7",
+    ".opencode/agents/bkit-design-spike.md": "e21a5308037c3d280e9c5d7d19e7ad0cf812edfa65f39496a19e58a0f99700ed",
+    ".claude/agents/bkit-build-plan-current.md": "d3dbd69ab480f5eff655dedf5e2415cbb33ef0460249ac2c06850868ba2bf2b3",
+    ".cursor/agents/bkit-build-plan-current.md": "f876c2e1ebd92adf6f1fde8c001c0b172539863ec6b05699a84cc76f6fdcafe5",
+    ".opencode/agents/bkit-build-plan-current.md": "5fc93f1a620f0c7aae66327c260decb256e9ab81e8bcafd8a2f710bc40a1958e",
     "package.json": "a0cebac668584ed5f2f314a6de9c1304a20e0b4a505bd9119ab2489272a1dd2c",
-    ".codex/agents/bkit-build-challenge-1.toml": "9496ce18d065dbad3d1c09e1762582d20b8cc38e3ab103123bbc2f875b99771e",
-    ".codex/agents/bkit-build-challenge-2.toml": "ccb61eb11b5a8b664e8c2c0135122300a2f867a490fca5b14a81e79c9ab4809f",
-    ".codex/agents/bkit-build-install-skills.toml": "ed158a6f987f24f5b0f83919e610cd7574605d2f794ffcd748eec6b12e314a76",
-    ".codex/agents/bkit-build-plan-current.toml": "339cd3e95a5a7e23caf8c21de8b04866a96d47cd494c4e2f6766aeb202c355b2",
-    ".codex/agents/bkit-build-plan-gaps-remediate.toml": "2f740685faf581b74b6237fefe73247de5368ad62c63af078ffd2f8a972884cc",
-    ".codex/agents/bkit-build-plan-verify.toml": "5fcd3ff10b1e9a07ebe1b871bac5a4a8d559b5c79aa9928ccc9b63e91433c47d",
-    ".codex/agents/bkit-debug-abort-handover.toml": "1683aa233cc3b353fc32f5e73699961b326fa9466133b1ced2d674c95fd0bd7f",
-    ".codex/agents/bkit-debug-failure-diagnose.toml": "61a28e721ec133c1618a2b74233a9716c9c3f0c8e38354bdfa3a8fad16719274",
-    ".codex/agents/bkit-debug-failure-remediate.toml": "c3230461bfbe5c85732462654780f2cbf4df8ea3cf4ff53a08307f9becfdc06d",
-    ".codex/agents/bkit-debug-failure-soak.toml": "29768874d0a81cb19d38f79ec77d3bb013a10dac965d660654469d095887d50d",
-    ".codex/agents/bkit-design-brainstorm-ideate-1.toml": "ff50e70749520fab807bf6cc02ad5a5f2fe1aaa03c8793c0a878c0fbcad2c53b",
-    ".codex/agents/bkit-design-brainstorm-ideate-2.toml": "14b7c9f29bbceab83cb2629d48d21f8f7eac84311121d37e7d60750fc0b264f2",
-    ".codex/agents/bkit-design-brainstorm-ideate-3.toml": "2dc06877efe9bcaacf670206793788423ee95296681b0e2fed8cd15b4cd41714",
-    ".codex/agents/bkit-design-generate.toml": "9eac29bde00aecb3725daf4f07c2013ccd4544c83de8f00f49f03040306cdad3",
-    ".codex/agents/bkit-design-organise.toml": "3d8593f427197e50afe3b7ccc299b0c004e29c826906708d80231354bc571b3f",
-    ".codex/agents/bkit-design-review-1.toml": "15f3859bfe4084b3d8c640c44588b85866455a008439d5c6f6cc4ee7d8fa89cb",
-    ".codex/agents/bkit-design-review-2.toml": "3033240b4082c4bf20a9bc8c1cf0851ffa34659d3e41394aa830fd50199dc897",
-    ".codex/agents/bkit-design-spike.toml": "6a55a522cb4cb56b2f4c878b023ddac1248fead49ac302755f57c55e1d55b089",
-    ".codex/agents/bkit-design-update.toml": "6af6f525ae58828646920ab689a07726c2efc405dd7af56c48617c1407d50755",
-    ".codex/agents/bkit-plan-generate.toml": "c80a0c7203325438565e811486f80b87eeacd23eb30841696ad982f1b4da2f8f",
-    ".codex/agents/bkit-plan-review-1.toml": "1cb7d541f1b71c008c5aee5b77197bfe89375262c60435e3e8acea18aa93394f",
-    ".codex/agents/bkit-plan-review-2.toml": "d4927c43c8e834d8e552182adf345800d4ee23295b283c45812b17528c2a40fa",
-    ".codex/agents/bkit-plan-update.toml": "b1652977be0b6311417693ee9c598bb8c057a0ac740f948653e847ea4c3cf6f9",
-    ".codex/agents/bkit-ship-conflict-resolve.toml": "a8998334ea4b144c8653fe71fb28a9c4df10d820e4acbb5ed667f1f37f117262",
-    ".codex/agents/bkit-ship-deferred-sweep.toml": "8f46dbb2df35f1217f88ddff1f006fb11abe2e7b98860bfd2587e602c0fb15ac",
-    ".codex/agents/bkit-ship-update-docs.toml": "d247608f1f3491f28246d9fc6d3a1e6469b8ca2af48d9efde81d2d828e408497",
-    ".codex/agents/bkit-utility-compress-markdown.toml": "2d4a70bf126246ce104911f923969ea119511291a22fa8347fddf05aa6efef79",
-    ".codex/agents/bkit-utility-update-documentation.toml": "44fa8d458706c70f91c93fc83fa178825ce6d2406ae1cf82cd2eb15df6d9b2ac",
+    ".codex/agents/bkit-build-challenge-1.toml": "a5f5528de793e1735ff4e7d618cce55ae72598aad740a201c59d32d75eed3312",
+    ".codex/agents/bkit-build-challenge-2.toml": "42ab894714273d19346199374b04e89d4467d09b7ae9144eb5e8f6a03f90fa9f",
+    ".codex/agents/bkit-build-install-skills.toml": "2c8a31df55b574506fb438ec486c768580d4e2d99d4941fa9ab0dffc07dfede5",
+    ".codex/agents/bkit-build-plan-current.toml": "e5b9f40e872acbf54bee4dee969217261b3188b152929403c0d79f5c445cc38d",
+    ".codex/agents/bkit-build-plan-gaps-remediate.toml": "2d92d0e2080e5677cce769e90d7ef6c0ea9b41ae89eef2dc22cc9eae93532412",
+    ".codex/agents/bkit-build-plan-verify.toml": "8c7079660853110a84cf8e3ca7c56414f8a4703dfe3005cc6c7351b7de552058",
+    ".codex/agents/bkit-debug-abort-handover.toml": "cb74a924a676e18cab41716cdbfd16dd1c85da1b43cea2d5e4bc832c18786675",
+    ".codex/agents/bkit-debug-failure-diagnose.toml": "92ce7daa60efbee303a2dc952899abeb77962930f02d7ebc99c2e1571c704efb",
+    ".codex/agents/bkit-debug-failure-remediate.toml": "82203de2901af4ee52acb3453e235a7e25ebcf260377747575d44090a134e55f",
+    ".codex/agents/bkit-debug-failure-soak.toml": "0fe2b77b9139a1e83eadd1b616f3e897dca6b8614fa6f3d5aaca1b3d2b9b4bb0",
+    ".codex/agents/bkit-design-brainstorm-ideate-1.toml": "3293ef4901c5e6848dc766c7e61f9ff2ed6ecd3c9bd1a17b717669c7915ffda9",
+    ".codex/agents/bkit-design-brainstorm-ideate-2.toml": "b2734bec9049fed169d8d5b3ea94a0803b363eb4e70b5ed57642f0881146ff30",
+    ".codex/agents/bkit-design-brainstorm-ideate-3.toml": "4a6b529ab047c0a53b284dbfee63f50f71ab6b4668684db2623a943b4fde12e8",
+    ".codex/agents/bkit-design-generate.toml": "455d79d0591909e0bc8a0da54945887dbf71d594c6f13013d1ce77acb4de3071",
+    ".codex/agents/bkit-design-organise.toml": "05f91486335c8e1ee87bace138f639a696541bba4c2aa601ecc2380bae63059e",
+    ".codex/agents/bkit-design-review-1.toml": "3805ac60ada30ccb0c1fb22aede1d6ea17c00932b2548552d0f2205ad4b5a23f",
+    ".codex/agents/bkit-design-review-2.toml": "963edff424af65c595dd2302385aa64bef48bd92b6a9f7edec64cc55445c1d18",
+    ".codex/agents/bkit-design-spike.toml": "a71c2366fabff0a8fa302a00f42556d83b3cc80ae03e98caaad68fcfa7f5027a",
+    ".codex/agents/bkit-design-update.toml": "9545761bb939ac00476ca36bcbd93839872c844bba18102cb53bbf34903d7c71",
+    ".codex/agents/bkit-plan-generate.toml": "c8127ca1d3dd79d8f8ea2fe73737d35f048a58f899b0c199f8204f3976000e9a",
+    ".codex/agents/bkit-plan-review-1.toml": "62964eb4e3a8ac86ff10bedbbaabb42d36cad1be0d77e059fe3f684657655b8c",
+    ".codex/agents/bkit-plan-review-2.toml": "dc1a7dda602959b94dd3c8a5afeef1dfb9b645b6c131261040afa42d9a9e525f",
+    ".codex/agents/bkit-plan-update.toml": "760c0efb48e6a263514878a34ab10233511b200ee552a47602d75716976bf1a9",
+    ".codex/agents/bkit-ship-conflict-resolve.toml": "86a64890d4e66009aecad84517295dfe7ff0edb1a8f266fb292de18b594039a1",
+    ".codex/agents/bkit-ship-deferred-sweep.toml": "4ee20237428c3668421bf87185e33a0542cf64fa2e531decf9928bd6cf76ca75",
+    ".codex/agents/bkit-ship-update-docs.toml": "b480f311537fdc196f729051496ae745155221cb0c51846759e451fdfac17582",
+    ".codex/agents/bkit-utility-compress-markdown.toml": "e5502a4550e9dcd98f1c60d1621513cf61215ba5d22740a7939e7163ed4e35a5",
+    ".codex/agents/bkit-utility-update-documentation.toml": "d14927617d7918cd61a358c6587591a810a8d90fad1541c6dda8fc1fd7dfd543",
     ".codex/hooks.json": "30b45abaee09ac88a77f2296fb31166e96f675a77edc605186f5b2b3fd9063b0",
-    ".opencode/agents/bkit-utility-update-decisions.md": "20f4e392552eea621a49bb2a9a480c36eb1f9e9b72795196301d09d4f80bdd4f",
-    ".opencode/agents/bkit-utility-update-deferrals.md": "5a43fc92c462a172a6164484ab37eaabcbd2db2321328bc5ff4e94726f9ea231",
-    ".opencode/agents/bkit-utility-update-failures.md": "188d16467ac73a5eb25cc170f5cfc010d1104556d38b1e64e92dedc88c912e35",
-    ".opencode/agents/bkit-utility-update-knowledge.md": "0157694d374b75e6e2dd2ce275fdacd1bf88b1f46e88e707cec437cce9b98322",
-    ".codex/agents/bkit-utility-update-decisions.toml": "8cf1ff4538e609522947e72da4f2a4413814b6e995c64b6c996eee9b26e1973f",
-    ".codex/agents/bkit-utility-update-deferrals.toml": "686f5bbee85087f77cbe61d61108d0826e7fc9af7c19cb5969708c461f8802ee",
-    ".codex/agents/bkit-utility-update-failures.toml": "8ef427f37460d03f313708cf49c23520adaea206ce0b14a97dd046cf78e42263",
-    ".codex/agents/bkit-utility-update-knowledge.toml": "137cd4a794d8f74073b2d4038ee861fa6902ace975519b0943bdf7cc3099b60c",
-    ".claude/agents/bkit-utility-update-decisions.md": "31bfffe86e9f9053d05b830160bc7edbce9ec9adb1ea6590ef77c9b316cb0b30",
-    ".cursor/agents/bkit-utility-update-decisions.md": "4b13494e045592461772093feb4452f9c15d6b952293c73f083042d33f74f3b5",
-    ".claude/agents/bkit-utility-update-deferrals.md": "29a48a6a2426419f9e9e0b251324fd9b07e66e99873c3001c365224f57e733cf",
-    ".cursor/agents/bkit-utility-update-deferrals.md": "eebeaf500a148d2e4b1bf632c0f5487096af3f03984a1305b0cbc479733d6fe0",
-    ".claude/agents/bkit-utility-update-failures.md": "23f4e688ae38a64d5f778d2703cd3afd9b7faa8bf02100254fca2b57e4299eca",
-    ".cursor/agents/bkit-utility-update-failures.md": "4384c08e68989d77ac407fc93215dc990ac14197cb559e6c253670e9c7360c19",
-    ".claude/agents/bkit-utility-update-knowledge.md": "f5e95b738d50d69293c9a007465880e22dff25e02df3f3ca9bd41387ec1ee6ff",
-    ".cursor/agents/bkit-utility-update-knowledge.md": "670c1c48c23fb511611510d057fdaf32fc77f3744b2e33c58be1077d32d0223b",
-    ".opencode/agents/bkit-audit-generate.md": "51abbcc3a4f1435886b8c2fe825e5a7cc6f0ad265dad6ccb07e2eb9c6b4b8f2b",
-    ".codex/agents/bkit-audit-generate.toml": "93a7dfb7ce085fa4dce7f211193759068abd7ba294f5bbffe56194e1be337688",
+    ".opencode/agents/bkit-utility-update-decisions.md": "8e71fdb88693a8684ea900668e39846402e5ca25c143f7d76c7751bfa08b38f3",
+    ".opencode/agents/bkit-utility-update-deferrals.md": "367f7102b13f941b18290ae50a60583fbfbe8217df103e456bd50115000c350d",
+    ".opencode/agents/bkit-utility-update-failures.md": "0232032114670eba33e0aae1770b84761c94328fb38e11535c1d0a4624620fbc",
+    ".opencode/agents/bkit-utility-update-knowledge.md": "9b0412259d8c2fd2b05b24a838e237ce3ad2a1ff272a1a3f12202e3f8deeea76",
+    ".codex/agents/bkit-utility-update-decisions.toml": "2703d6f1b963843caa5bfdf4e9dd1874ec8294c606a4e1ab78c4b0b7a8c32bc6",
+    ".codex/agents/bkit-utility-update-deferrals.toml": "1fda944fcc244183c4ef3a6a2f3bffa49fa52203002277ca31d80337f904fefb",
+    ".codex/agents/bkit-utility-update-failures.toml": "a0f91c684c46db12c4ee1dcc31e38780d67764b67d1ccad2644c88f55f7c0dc0",
+    ".codex/agents/bkit-utility-update-knowledge.toml": "e7fac2a35f55cfa4639357b404ad804d0a76d3b5b31d81d13ba37d2f1c8d2bcf",
+    ".claude/agents/bkit-utility-update-decisions.md": "be8d6921c7ccd453f653188ecb8e6046ea1b3283e635099a19391d095911a29b",
+    ".cursor/agents/bkit-utility-update-decisions.md": "22c10cdbb42814fdb302f61eb362b2bf0ecad8c2cd27b0e26b8ea5b480e45271",
+    ".claude/agents/bkit-utility-update-deferrals.md": "8dc067cad6d552adc401b708f476e57a1f9dca64f66f0074943c4786353409b5",
+    ".cursor/agents/bkit-utility-update-deferrals.md": "6fa0aeb2ba2c49139e07d8fb9f249ddfb3bfdf792ffe80a0ecab83c8fe5a231b",
+    ".claude/agents/bkit-utility-update-failures.md": "76fa59e400d9abd2900f9d09f30d86c896377882cd218287a637b039a55cfccb",
+    ".cursor/agents/bkit-utility-update-failures.md": "4bfd787670f9dbe647663eb39d1755e8840f89756e1e0e49365e3dcae3e8623b",
+    ".claude/agents/bkit-utility-update-knowledge.md": "1767835f7feca6fb75805dcd035321d74d0fb8dcf1db6e36a4adaa39f73898ad",
+    ".cursor/agents/bkit-utility-update-knowledge.md": "f1ccaa4ec07c8fb404343b0ab37022bbc93aa3b36c65ec6d55dc28212af30bd8",
+    ".opencode/agents/bkit-audit-generate.md": "0b49b617e4ee24c1565b08da799b1a3bbc8524e3c086bf27f55ae1e155992148",
+    ".codex/agents/bkit-audit-generate.toml": "ee76d6610ae19f997f71d20d30ed4928c085a652b79258cdec17bdcebfe422b2",
     "docs/templates/bkit-plan.md": "92473d633d33b33c63c7d5034a508e40229ac3802441048b92ecb48871e54b5b",
-    ".claude/agents/bkit-audit-generate.md": "a17c76ddcf5afd854bf39cc36f0800f847a61c55fe6efb17c9163e98597c8422",
-    ".cursor/agents/bkit-audit-generate.md": "61a7dfae9dca9d0426adef302707a53066515e88a72dca9200336a14593f9e81",
+    ".claude/agents/bkit-audit-generate.md": "07a51f98a7da980b1384d7141061870b883b1db2923e0043b329fcd5dd45364a",
+    ".cursor/agents/bkit-audit-generate.md": "6e296b54dbdc1e04e8fcd9d33c0b1cc32b03b7667fd7e1554302e196437e6d89",
     "docs/templates/bkit-audit-accessibility.md": "82cc441b99db2dfa22124a9f5defa6abfd7f85a19704c3cad3c9a50052587133",
     "docs/templates/bkit-audit-app-performance.md": "26cea50277c8d79177ab8b5b35b93900ab2295438fafe01f831acfffa5d5e226",
     "docs/templates/bkit-audit-architecture.md": "527f6e7912332de81f70aab1e0a73fb16912320016af9ecb6cfee212e1dc3e44",
@@ -183,8 +183,8 @@
     "docs/templates/bkit-audit-slop.md": "4b62345a868760e6e3447a1b86b2a4bfd1bf9d25aba125c7785f628b81d36c15",
     "docs/templates/bkit-audit-usability.md": "1683eb698874688081b46ea684914d5c91fd46bee0e2372005347d53d196d618",
     "docs/templates/bkit-audit-testing.md": "1b18ffa6623086614e6c66c526aaf248fa3ac3172e05abb2d977edd31aa51f6c",
-    ".opencode/agents/bkit-utility-update-roadmap.md": "8ed1422f62edebd823bba24cf9f25c28c3038cebc321a17c28ecc019fad91e51",
-    ".codex/agents/bkit-utility-update-roadmap.toml": "b44757d2b03f3862635951f3d151ed6dfc2ec92f510721da711773dc62359091",
+    ".opencode/agents/bkit-utility-update-roadmap.md": "0a457ff1965b137be4a4878ec7e3ab2ce7867f150a59154804e71b335373154f",
+    ".codex/agents/bkit-utility-update-roadmap.toml": "a54f728de5211adfdd5adef539ee9634beaeceaa597a7f2b7aaab361a94e8ae4",
     "docs/templates/bkit-audit-aio-seo.md": "fe2d947aea4436b1fb1772b7d6bc30260927ca28294bdbf456f107af142e118d",
     "docs/templates/bkit-audit-analytics.md": "0ec38f64e008c71b9cea1d6303350a3119e4607df2d87d9c68488451cb61cf50",
     "docs/templates/bkit-audit-annotations.md": "c947de921e7bc046f1510dce58d3c52524306f1449e535fbd4fa9096c2c3a67b",
@@ -201,8 +201,8 @@
     "docs/templates/bkit-audit-logs.md": "6c19169f0368ad3e6267554de0fc769ec88a1c2991679e6067fbcda6b46d7722",
     "docs/templates/bkit-audit-models.md": "81c6634297651319b3befe2985acbef583df934415aa8e5d060c105632a58cd3",
     "docs/templates/bkit-audit-reliability.md": "a24b5390bc5518a5dff954f65c01577591efc1cb0ff6edc582c8589792ee30a6",
-    ".claude/agents/bkit-utility-update-roadmap.md": "b1bf33f94eaa198e0fd62fdca23a4e652746d9beb8350a4dbd1a4b7541cf70f4",
-    ".cursor/agents/bkit-utility-update-roadmap.md": "d71b5fb0d3b1224e22c6de4944021d8571fdd8c003f1d6c2be9dd77334b13b10",
+    ".claude/agents/bkit-utility-update-roadmap.md": "bd77100dc820e7b3fa093e3ab3e736630d1b89d8ed3bd36819d171674cfd778a",
+    ".cursor/agents/bkit-utility-update-roadmap.md": "8dd7d5ae329364f266b526e02bcbc659a049753e554956b6373ed84c91122d3b",
     "docs/templates/bkit-audit-agents.md": "b274136511b07082dc5f33bcbad7f95e36d3ce84b747e211b2cde3f183a375b9",
     "docs/templates/bkit-audit-prompts.md": "591c1a4a79bcfaabb7712d6c28cf88220d2186e77055db936d8a69287ec7d9ef",
     ".bkit/templates.md": "3c88c6c483735ac1d6d4a52b2dcb77a503024a39dcc507d307e9e544fbb7cb8f",
@@ -212,7 +212,7 @@
     ".bkit/install.md": "75bd7187294fa00dc4639b6bce122fa2985fa61dbcd0ad831ae92100a50cb5cf",
     ".bkit/jsonl.md": "b32c32a5545e06e36ac6e75cea17a4a1fa98673d2338f85f23a10e0687b1f33a",
     ".bkit/providers.md": "9df8ef339386a52987916f363324062400c6327cc6cf83184cc5a96c4adddad0",
-    ".bkit/prompts.md": "b7f53424292e0093795e7aad33c6c508e766871d99c9f8cf49933fa594065bf7",
+    ".bkit/prompts.md": "f65340dbdacddf7a481747ee2c334a3443525eb92bd8037fa1a67132c40a3295",
     ".bkit/trackers.md": "fad27868c2d2b3af519eb9cc0d8aa60ce56f641c689572bc392b567ba54ec78d",
     ".bkit/workflows.md": "cf6b46b771939fc6049b9917db7aa8be4a67ef5a5fc0e820167889fe896e9530",
     ".bkit/README.md": "b53c3487da17b805b649534c526d73c2a732707112d26731ba0768ae58864587",
@@ -233,36 +233,36 @@
     ".opencode/plugin/bkit-readguard.js": "cd784ceb8d319e95a562401df6f6d9ed862ba1b7769ab08be8c4e7c29d6b656f",
     ".codex/hooks/bkit-readguard.cjs": "140ae68164c31e349c9122d2b86bc88ddd58461b6de8f5d4bdbced6965dce5f1",
     ".bkit/pipeline.md": "a0c71e3a9c26aca864e696a52b191c08b420df5c0c5d912b0d0bee011a265171",
-    ".claude/agents/bkit-debug-failure-reproduce.md": "0c73a6e0480882fed9e267fbc8ba9faa59ceee9a94af8a3c93dcb9e09edeca3c",
-    ".cursor/agents/bkit-debug-failure-reproduce.md": "c7b5ca5202d9802dda4a774450ae9aa993b5ffb96fc190e9e1651344c5d5e61e",
-    ".opencode/agents/bkit-debug-failure-reproduce.md": "f4d2e48d08e49ecd0d819d6498d74a430f8665f57191b0a9931e57942eac6c17",
-    ".codex/agents/bkit-debug-failure-reproduce.toml": "82381cc654df10591d629824edac39ed7ee2badd66211ade3059468c1b69c7d0",
+    ".claude/agents/bkit-debug-failure-reproduce.md": "f917806173e083fbf7a44e303c6322c828a5e98a4ab1e037a7d0ead53ba3e552",
+    ".cursor/agents/bkit-debug-failure-reproduce.md": "98ebe68887d489b83dc124cd66cc53c40d1f40f33f8323d58b4dcc9d37405860",
+    ".opencode/agents/bkit-debug-failure-reproduce.md": "7a4a0bf4bec613bd3852ddde7c510ec2ba28788af3627db578e9b9f248218d35",
+    ".codex/agents/bkit-debug-failure-reproduce.toml": "d8d17f8b8bee35518233ceb5ac47bc789ce95744ae93fde6e28eed1716e0f83d",
     ".bkit/allowlist.json": "47f68886cd8488cd0ff0b77ac7bd985b9e33bc0484db2c4cbfca3b84c694fbce",
-    ".claude/agents/bkit-utility-update-tracker.md": "9361c5e325f6b5afa4e64f7c6d165a6c7d6d8662071c1cf85183c7afe159802c",
-    ".cursor/agents/bkit-utility-update-tracker.md": "e2e9079d249836b4a8ffb625f16e24fea93ac87a9fec5d471c32ca4569139f24",
-    ".opencode/agents/bkit-utility-update-tracker.md": "0a75587998ed95b4b45f3882b6c07a463282ec4ccada504ad018f9be19b10860",
-    ".codex/agents/bkit-utility-update-tracker.toml": "513cfeb045347fd83f63db8197117bea2299a2773469497a048f53a97be8a342",
-    ".claude/agents/bkit-plan-scope-check.md": "7bcc25d4e5d1e425f211e7f77ebb987ebd4d3a9d9d22dc0010fa0267c958ddbd",
-    ".cursor/agents/bkit-plan-scope-check.md": "0ae8597e71ba3f0a1ba94dc56ef8905a7c38fd93a9d4c597c379bb0d7f6aafa0",
-    ".opencode/agents/bkit-plan-scope-check.md": "359475e9a4e5fa369fe0694acc6dbf18c1934b5b0133bebce8395aa245955784",
-    ".codex/agents/bkit-plan-scope-check.toml": "b3afbd2e4be8147d17739cea89ff7718110e445d643bb9e578256133c76090d8",
-    ".claude/agents/bkit-build-plan-convert.md": "74aec2fb410f804c722b6d0c94198871edf2a5067c46d87210951529cc813140",
-    ".cursor/agents/bkit-build-plan-convert.md": "a02f2eb7938d1dbf59be029626ec4391794eb3aa8899b1b06a17c7279e06f9b0",
-    ".opencode/agents/bkit-build-plan-convert.md": "6184fc3549d6829d45a8bdf8e56da784a1de3ca03d67c5f4d427ce00ec9bf597",
-    ".codex/agents/bkit-build-plan-convert.toml": "cf2060e8d79d9d36dca315f2ac175c140cf32cf6f64e5b1f84f04e4ebfb877c9",
+    ".claude/agents/bkit-utility-update-tracker.md": "f42bece0b7c1510ed7f69852a2a9d21ba18b10fe484e5c45e0fb7bd555acc513",
+    ".cursor/agents/bkit-utility-update-tracker.md": "500c7a893a2f2480af20367f0bb7f700cc8dbc939358df5de02fd8a34008d548",
+    ".opencode/agents/bkit-utility-update-tracker.md": "fd5e0de053a4b02ac00bd63195df8a48a4073b5590852fe9b6697bd83ed4278e",
+    ".codex/agents/bkit-utility-update-tracker.toml": "f85c7b836903a11aa5d96f730081e19b5b7836b0348df9f58fed89739c2c4e39",
+    ".claude/agents/bkit-plan-scope-check.md": "cead75aa6c04baa1c8147da2627a47d00296b8328582798b0f931d899a344e73",
+    ".cursor/agents/bkit-plan-scope-check.md": "1a874559a0e5b3c9853531376f0c038cc65f2c729f17531b0e29c09246f61c0a",
+    ".opencode/agents/bkit-plan-scope-check.md": "d1d540a93c98c71cbc7b25f4510232ff7497887d2496a4ea3d4537c7f3e4e4fb",
+    ".codex/agents/bkit-plan-scope-check.toml": "876fba06e6743c53f5998ca7995537c259819060913a8f154a07b611e4d3f440",
+    ".claude/agents/bkit-build-plan-convert.md": "545f5e2c757940e8995c64f6a3476ee1fce0ea592831e00aece763ad802d7840",
+    ".cursor/agents/bkit-build-plan-convert.md": "97b42bffde53a981ddd498310dfb8df6b01909f28c99d414f70e29fb215572e1",
+    ".opencode/agents/bkit-build-plan-convert.md": "19e18038be58076a5fa14a820faffad8038f2f13be499023956cd63ffdcc3f1e",
+    ".codex/agents/bkit-build-plan-convert.toml": "1ae8eb881effa7f6cc29050729a1420b9b607b6bc44cf48a5e936e0c174ecab6",
     ".bkit/authoring.md": "21651ce3ec8e9ba62da5827c2d945fe1d9ad7c215e25ff2caac860ce317cedc4",
     ".codex/hooks/bkit-rules.cjs": "8aee2cde5448c083ae0dc07a4f1db86ce7e815a2a2eafe54b886b7f4393cab91",
     ".opencode/plugin/bkit-rules.js": "417d3ca107ebf005060953a17340620e1fcfb5bcdf491316a937e0c747b0377e",
     ".bkit/router.md": "c20d006757e350c173da94686d48500bc83e12d9f7bb6ff5911e47e332e45eab",
     ".bkit/cli.md": "6ebebae2b0ea31c84e5ebf135fc602fe0c2ff421f51af182d8efeaafbd99ee5f",
-    ".claude/agents/bkit-build-plan-tests.md": "048eedc214f02c1c72cdf460bf1aecea0b38836420181796cb8112e9b8eb74da",
-    ".cursor/agents/bkit-build-plan-tests.md": "d8090b4065d6ba337ea522926c254a5f4a11681d7afaa47090056b71952e4dc7",
-    ".opencode/agents/bkit-build-plan-tests.md": "92d4a922d62cf7d913dedf18bc3910f9333fbba3b93ba23ea341e6971b1aa6b6",
-    ".codex/agents/bkit-build-plan-tests.toml": "d97cd961547fd7bc48b24777626093fd8f7261310a1491c04a801116078641f1",
-    ".claude/agents/bkit-build-plan-tasks.md": "ed6413782c61bfe33b85b803dd70d4b19e43d64e93bfdd3aa2ad8d370565877a",
-    ".cursor/agents/bkit-build-plan-tasks.md": "96066ced550f3e0f8cc50e6b10a37b8a9200a47d07eaa4b8ea0026d8f9672cb3",
-    ".opencode/agents/bkit-build-plan-tasks.md": "3d4ba69ee06020783d2b7ce45c2747fe1e46baa9f959151eba2ccd75cfab044a",
-    ".codex/agents/bkit-build-plan-tasks.toml": "7b4f534ded4d7f4fdd5c3f8f3ac875c3ce1fd7a4fc05e027a9658b8ca28be74c",
+    ".claude/agents/bkit-build-plan-tests.md": "5e13913ed6c1c869ccfef34d4d335f0993ec6b4571cc46856bf7d6b12e5c1025",
+    ".cursor/agents/bkit-build-plan-tests.md": "6d5a37fa50eef40b57a79eea66b1ddf78eb4ad44116b35248bde4a54b101619d",
+    ".opencode/agents/bkit-build-plan-tests.md": "7cc7cb475c4c79f6fb414fea2d4f022674a68e34fb1cff295a6dbdcd6a858c31",
+    ".codex/agents/bkit-build-plan-tests.toml": "06e9e16312b05eaa423902e3759041c1e82d15e02bf529104ae5813f655d45e1",
+    ".claude/agents/bkit-build-plan-tasks.md": "c5a9d4cbd7c1bfd3ba14663037ddf6d817bf69561267de4c4a768ef62712b8fa",
+    ".cursor/agents/bkit-build-plan-tasks.md": "3f633aa122b7723b85328973677a704fc0b29773a453549d57f3364da143eca4",
+    ".opencode/agents/bkit-build-plan-tasks.md": "5a3bbe515649de9ff12cce0c2628a220060e886c5d64fc4b6c91a3ec1783617d",
+    ".codex/agents/bkit-build-plan-tasks.toml": "95e6111ab2e3b0c2553324d0bbebe0a9b085ba46cb59ee0263a2bea92517343c",
     ".opencode/plugin/bkit-guardrails.js": "f8662d09b99d4ba388439cf0f9f58fd9852ed6fcf390672ddc33cd3d589af92a"
   },
   "claudeAllowDerived": [
diff --git a/.claude/agents/bkit-audit-generate.md b/.claude/agents/bkit-audit-generate.md
index e00a47312..129645007 100644
--- a/.claude/agents/bkit-audit-generate.md
+++ b/.claude/agents/bkit-audit-generate.md
@@ -26,7 +26,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-build-challenge-1.md b/.claude/agents/bkit-build-challenge-1.md
index 0f9de2954..2749ec0a9 100644
--- a/.claude/agents/bkit-build-challenge-1.md
+++ b/.claude/agents/bkit-build-challenge-1.md
@@ -22,7 +22,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-build-challenge-2.md b/.claude/agents/bkit-build-challenge-2.md
index 698a56f58..96d70b7e6 100644
--- a/.claude/agents/bkit-build-challenge-2.md
+++ b/.claude/agents/bkit-build-challenge-2.md
@@ -22,7 +22,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-build-install-skills.md b/.claude/agents/bkit-build-install-skills.md
index b1bd5bb47..29a210d55 100644
--- a/.claude/agents/bkit-build-install-skills.md
+++ b/.claude/agents/bkit-build-install-skills.md
@@ -20,7 +20,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-build-plan-convert.md b/.claude/agents/bkit-build-plan-convert.md
index 729313d2c..128bc7d9e 100644
--- a/.claude/agents/bkit-build-plan-convert.md
+++ b/.claude/agents/bkit-build-plan-convert.md
@@ -22,7 +22,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-build-plan-current.md b/.claude/agents/bkit-build-plan-current.md
index 6d8114b4a..0322d7f89 100644
--- a/.claude/agents/bkit-build-plan-current.md
+++ b/.claude/agents/bkit-build-plan-current.md
@@ -22,7 +22,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-build-plan-gaps-remediate.md b/.claude/agents/bkit-build-plan-gaps-remediate.md
index 3f17e7660..617b5aa78 100644
--- a/.claude/agents/bkit-build-plan-gaps-remediate.md
+++ b/.claude/agents/bkit-build-plan-gaps-remediate.md
@@ -22,7 +22,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-build-plan-tasks.md b/.claude/agents/bkit-build-plan-tasks.md
index e249f7d19..4c860a952 100644
--- a/.claude/agents/bkit-build-plan-tasks.md
+++ b/.claude/agents/bkit-build-plan-tasks.md
@@ -22,7 +22,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-build-plan-tests.md b/.claude/agents/bkit-build-plan-tests.md
index b7af5c90c..43604527e 100644
--- a/.claude/agents/bkit-build-plan-tests.md
+++ b/.claude/agents/bkit-build-plan-tests.md
@@ -22,7 +22,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-build-plan-verify.md b/.claude/agents/bkit-build-plan-verify.md
index dbc5f6cae..1bf10af30 100644
--- a/.claude/agents/bkit-build-plan-verify.md
+++ b/.claude/agents/bkit-build-plan-verify.md
@@ -22,7 +22,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-debug-abort-handover.md b/.claude/agents/bkit-debug-abort-handover.md
index 37b284232..9a96d1dcf 100644
--- a/.claude/agents/bkit-debug-abort-handover.md
+++ b/.claude/agents/bkit-debug-abort-handover.md
@@ -19,7 +19,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-debug-failure-diagnose.md b/.claude/agents/bkit-debug-failure-diagnose.md
index 497e7cafc..a1a01bd10 100644
--- a/.claude/agents/bkit-debug-failure-diagnose.md
+++ b/.claude/agents/bkit-debug-failure-diagnose.md
@@ -24,7 +24,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-debug-failure-remediate.md b/.claude/agents/bkit-debug-failure-remediate.md
index e786b2dfa..369554ec5 100644
--- a/.claude/agents/bkit-debug-failure-remediate.md
+++ b/.claude/agents/bkit-debug-failure-remediate.md
@@ -22,7 +22,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-debug-failure-reproduce.md b/.claude/agents/bkit-debug-failure-reproduce.md
index 8ba27370c..4a044a053 100644
--- a/.claude/agents/bkit-debug-failure-reproduce.md
+++ b/.claude/agents/bkit-debug-failure-reproduce.md
@@ -22,7 +22,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-debug-failure-soak.md b/.claude/agents/bkit-debug-failure-soak.md
index d2e9c0edc..7639606c5 100644
--- a/.claude/agents/bkit-debug-failure-soak.md
+++ b/.claude/agents/bkit-debug-failure-soak.md
@@ -24,7 +24,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-design-brainstorm-ideate-1.md b/.claude/agents/bkit-design-brainstorm-ideate-1.md
index f6ef961f6..ac19ef6ee 100644
--- a/.claude/agents/bkit-design-brainstorm-ideate-1.md
+++ b/.claude/agents/bkit-design-brainstorm-ideate-1.md
@@ -20,7 +20,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-design-brainstorm-ideate-2.md b/.claude/agents/bkit-design-brainstorm-ideate-2.md
index 8eacd506c..d3face1f5 100644
--- a/.claude/agents/bkit-design-brainstorm-ideate-2.md
+++ b/.claude/agents/bkit-design-brainstorm-ideate-2.md
@@ -20,7 +20,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-design-brainstorm-ideate-3.md b/.claude/agents/bkit-design-brainstorm-ideate-3.md
index 3c8a698ef..ab7dd22aa 100644
--- a/.claude/agents/bkit-design-brainstorm-ideate-3.md
+++ b/.claude/agents/bkit-design-brainstorm-ideate-3.md
@@ -20,7 +20,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-design-generate.md b/.claude/agents/bkit-design-generate.md
index f3161ba7a..af4d28c28 100644
--- a/.claude/agents/bkit-design-generate.md
+++ b/.claude/agents/bkit-design-generate.md
@@ -22,7 +22,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-design-organise.md b/.claude/agents/bkit-design-organise.md
index 7961bdc54..a75ab5c48 100644
--- a/.claude/agents/bkit-design-organise.md
+++ b/.claude/agents/bkit-design-organise.md
@@ -22,7 +22,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-design-review-1.md b/.claude/agents/bkit-design-review-1.md
index b96e1c035..6f065efb5 100644
--- a/.claude/agents/bkit-design-review-1.md
+++ b/.claude/agents/bkit-design-review-1.md
@@ -24,7 +24,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-design-review-2.md b/.claude/agents/bkit-design-review-2.md
index a9e73c389..883264f82 100644
--- a/.claude/agents/bkit-design-review-2.md
+++ b/.claude/agents/bkit-design-review-2.md
@@ -24,7 +24,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-design-spike.md b/.claude/agents/bkit-design-spike.md
index 2def34221..e66c9264a 100644
--- a/.claude/agents/bkit-design-spike.md
+++ b/.claude/agents/bkit-design-spike.md
@@ -24,7 +24,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-design-update.md b/.claude/agents/bkit-design-update.md
index 4fc689628..c467e9fd2 100644
--- a/.claude/agents/bkit-design-update.md
+++ b/.claude/agents/bkit-design-update.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-plan-generate.md b/.claude/agents/bkit-plan-generate.md
index d1c519631..b66f5cb98 100644
--- a/.claude/agents/bkit-plan-generate.md
+++ b/.claude/agents/bkit-plan-generate.md
@@ -22,7 +22,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-plan-review-1.md b/.claude/agents/bkit-plan-review-1.md
index cf3514453..fb9bc1176 100644
--- a/.claude/agents/bkit-plan-review-1.md
+++ b/.claude/agents/bkit-plan-review-1.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-plan-review-2.md b/.claude/agents/bkit-plan-review-2.md
index e02afc7c3..6bd3320ca 100644
--- a/.claude/agents/bkit-plan-review-2.md
+++ b/.claude/agents/bkit-plan-review-2.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-plan-scope-check.md b/.claude/agents/bkit-plan-scope-check.md
index 9621c067f..a14fac600 100644
--- a/.claude/agents/bkit-plan-scope-check.md
+++ b/.claude/agents/bkit-plan-scope-check.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-plan-update.md b/.claude/agents/bkit-plan-update.md
index 642bf0629..17c54ed37 100644
--- a/.claude/agents/bkit-plan-update.md
+++ b/.claude/agents/bkit-plan-update.md
@@ -21,7 +21,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-ship-conflict-resolve.md b/.claude/agents/bkit-ship-conflict-resolve.md
index 3f345a312..a6bfe2afd 100644
--- a/.claude/agents/bkit-ship-conflict-resolve.md
+++ b/.claude/agents/bkit-ship-conflict-resolve.md
@@ -22,7 +22,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-ship-deferred-sweep.md b/.claude/agents/bkit-ship-deferred-sweep.md
index b3f209149..4c53d5689 100644
--- a/.claude/agents/bkit-ship-deferred-sweep.md
+++ b/.claude/agents/bkit-ship-deferred-sweep.md
@@ -22,7 +22,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-ship-update-docs.md b/.claude/agents/bkit-ship-update-docs.md
index faf5d588e..e2bdc9975 100644
--- a/.claude/agents/bkit-ship-update-docs.md
+++ b/.claude/agents/bkit-ship-update-docs.md
@@ -22,7 +22,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-utility-compress-markdown.md b/.claude/agents/bkit-utility-compress-markdown.md
index f12045e4e..0491ee739 100644
--- a/.claude/agents/bkit-utility-compress-markdown.md
+++ b/.claude/agents/bkit-utility-compress-markdown.md
@@ -20,7 +20,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-utility-update-decisions.md b/.claude/agents/bkit-utility-update-decisions.md
index 9ae095505..32d6e6bb4 100644
--- a/.claude/agents/bkit-utility-update-decisions.md
+++ b/.claude/agents/bkit-utility-update-decisions.md
@@ -22,7 +22,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-utility-update-deferrals.md b/.claude/agents/bkit-utility-update-deferrals.md
index 683712a8f..771a9d1c5 100644
--- a/.claude/agents/bkit-utility-update-deferrals.md
+++ b/.claude/agents/bkit-utility-update-deferrals.md
@@ -22,7 +22,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-utility-update-documentation.md b/.claude/agents/bkit-utility-update-documentation.md
index ae2218d93..c3b7350fd 100644
--- a/.claude/agents/bkit-utility-update-documentation.md
+++ b/.claude/agents/bkit-utility-update-documentation.md
@@ -22,7 +22,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-utility-update-failures.md b/.claude/agents/bkit-utility-update-failures.md
index 6fd21e7e7..45c8dd0d3 100644
--- a/.claude/agents/bkit-utility-update-failures.md
+++ b/.claude/agents/bkit-utility-update-failures.md
@@ -22,7 +22,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-utility-update-knowledge.md b/.claude/agents/bkit-utility-update-knowledge.md
index e65ed19b5..378edbeb7 100644
--- a/.claude/agents/bkit-utility-update-knowledge.md
+++ b/.claude/agents/bkit-utility-update-knowledge.md
@@ -22,7 +22,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-utility-update-roadmap.md b/.claude/agents/bkit-utility-update-roadmap.md
index 2d11fd499..44fba1593 100644
--- a/.claude/agents/bkit-utility-update-roadmap.md
+++ b/.claude/agents/bkit-utility-update-roadmap.md
@@ -24,7 +24,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.claude/agents/bkit-utility-update-tracker.md b/.claude/agents/bkit-utility-update-tracker.md
index c7c3f465d..cf3188e11 100644
--- a/.claude/agents/bkit-utility-update-tracker.md
+++ b/.claude/agents/bkit-utility-update-tracker.md
@@ -27,7 +27,7 @@ autoCompactWindow: 300000
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-audit-generate.toml b/.codex/agents/bkit-audit-generate.toml
index b45c6ce42..61f393ce1 100644
--- a/.codex/agents/bkit-audit-generate.toml
+++ b/.codex/agents/bkit-audit-generate.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-build-challenge-1.toml b/.codex/agents/bkit-build-challenge-1.toml
index 04f03f012..e21a6f0ef 100644
--- a/.codex/agents/bkit-build-challenge-1.toml
+++ b/.codex/agents/bkit-build-challenge-1.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-build-challenge-2.toml b/.codex/agents/bkit-build-challenge-2.toml
index 0b3ec9617..784bde088 100644
--- a/.codex/agents/bkit-build-challenge-2.toml
+++ b/.codex/agents/bkit-build-challenge-2.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-build-install-skills.toml b/.codex/agents/bkit-build-install-skills.toml
index 542198b8e..8db17e2aa 100644
--- a/.codex/agents/bkit-build-install-skills.toml
+++ b/.codex/agents/bkit-build-install-skills.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-build-plan-convert.toml b/.codex/agents/bkit-build-plan-convert.toml
index c1b24b813..0f9637262 100644
--- a/.codex/agents/bkit-build-plan-convert.toml
+++ b/.codex/agents/bkit-build-plan-convert.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-build-plan-current.toml b/.codex/agents/bkit-build-plan-current.toml
index 435aca6dc..91a01bf73 100644
--- a/.codex/agents/bkit-build-plan-current.toml
+++ b/.codex/agents/bkit-build-plan-current.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-build-plan-gaps-remediate.toml b/.codex/agents/bkit-build-plan-gaps-remediate.toml
index d8bd33f36..c078b9ece 100644
--- a/.codex/agents/bkit-build-plan-gaps-remediate.toml
+++ b/.codex/agents/bkit-build-plan-gaps-remediate.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-build-plan-tasks.toml b/.codex/agents/bkit-build-plan-tasks.toml
index aa60bb19e..4cb73387f 100644
--- a/.codex/agents/bkit-build-plan-tasks.toml
+++ b/.codex/agents/bkit-build-plan-tasks.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-build-plan-tests.toml b/.codex/agents/bkit-build-plan-tests.toml
index a35bbb016..6abc887c7 100644
--- a/.codex/agents/bkit-build-plan-tests.toml
+++ b/.codex/agents/bkit-build-plan-tests.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-build-plan-verify.toml b/.codex/agents/bkit-build-plan-verify.toml
index bf1659199..806f2d871 100644
--- a/.codex/agents/bkit-build-plan-verify.toml
+++ b/.codex/agents/bkit-build-plan-verify.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-debug-abort-handover.toml b/.codex/agents/bkit-debug-abort-handover.toml
index 404d639ab..583a91317 100644
--- a/.codex/agents/bkit-debug-abort-handover.toml
+++ b/.codex/agents/bkit-debug-abort-handover.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-debug-failure-diagnose.toml b/.codex/agents/bkit-debug-failure-diagnose.toml
index 8946a2c61..cec0ab50f 100644
--- a/.codex/agents/bkit-debug-failure-diagnose.toml
+++ b/.codex/agents/bkit-debug-failure-diagnose.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-debug-failure-remediate.toml b/.codex/agents/bkit-debug-failure-remediate.toml
index 4fe9aca00..9a3d5c5da 100644
--- a/.codex/agents/bkit-debug-failure-remediate.toml
+++ b/.codex/agents/bkit-debug-failure-remediate.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-debug-failure-reproduce.toml b/.codex/agents/bkit-debug-failure-reproduce.toml
index 655972588..3b5d8b7fd 100644
--- a/.codex/agents/bkit-debug-failure-reproduce.toml
+++ b/.codex/agents/bkit-debug-failure-reproduce.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-debug-failure-soak.toml b/.codex/agents/bkit-debug-failure-soak.toml
index 7c7d48203..b916a6b22 100644
--- a/.codex/agents/bkit-debug-failure-soak.toml
+++ b/.codex/agents/bkit-debug-failure-soak.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-design-brainstorm-ideate-1.toml b/.codex/agents/bkit-design-brainstorm-ideate-1.toml
index 3f6697db0..57952cf85 100644
--- a/.codex/agents/bkit-design-brainstorm-ideate-1.toml
+++ b/.codex/agents/bkit-design-brainstorm-ideate-1.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-design-brainstorm-ideate-2.toml b/.codex/agents/bkit-design-brainstorm-ideate-2.toml
index 983469917..f21fd0b11 100644
--- a/.codex/agents/bkit-design-brainstorm-ideate-2.toml
+++ b/.codex/agents/bkit-design-brainstorm-ideate-2.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-design-brainstorm-ideate-3.toml b/.codex/agents/bkit-design-brainstorm-ideate-3.toml
index b4e024cd7..ac38f23c2 100644
--- a/.codex/agents/bkit-design-brainstorm-ideate-3.toml
+++ b/.codex/agents/bkit-design-brainstorm-ideate-3.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-design-generate.toml b/.codex/agents/bkit-design-generate.toml
index 0ee651128..f6174c421 100644
--- a/.codex/agents/bkit-design-generate.toml
+++ b/.codex/agents/bkit-design-generate.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-design-organise.toml b/.codex/agents/bkit-design-organise.toml
index 037642a2f..5a6c85c27 100644
--- a/.codex/agents/bkit-design-organise.toml
+++ b/.codex/agents/bkit-design-organise.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-design-review-1.toml b/.codex/agents/bkit-design-review-1.toml
index b1cd4b528..842f0cff0 100644
--- a/.codex/agents/bkit-design-review-1.toml
+++ b/.codex/agents/bkit-design-review-1.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-design-review-2.toml b/.codex/agents/bkit-design-review-2.toml
index f00da6cf3..94f464611 100644
--- a/.codex/agents/bkit-design-review-2.toml
+++ b/.codex/agents/bkit-design-review-2.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-design-spike.toml b/.codex/agents/bkit-design-spike.toml
index d0d0c0870..603de15f7 100644
--- a/.codex/agents/bkit-design-spike.toml
+++ b/.codex/agents/bkit-design-spike.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-design-update.toml b/.codex/agents/bkit-design-update.toml
index e28700cd8..653f5cb20 100644
--- a/.codex/agents/bkit-design-update.toml
+++ b/.codex/agents/bkit-design-update.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-plan-generate.toml b/.codex/agents/bkit-plan-generate.toml
index 996630ac0..2136e07f8 100644
--- a/.codex/agents/bkit-plan-generate.toml
+++ b/.codex/agents/bkit-plan-generate.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-plan-review-1.toml b/.codex/agents/bkit-plan-review-1.toml
index 51b9a0109..15170ae5d 100644
--- a/.codex/agents/bkit-plan-review-1.toml
+++ b/.codex/agents/bkit-plan-review-1.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-plan-review-2.toml b/.codex/agents/bkit-plan-review-2.toml
index b33fb6753..dcd9df58d 100644
--- a/.codex/agents/bkit-plan-review-2.toml
+++ b/.codex/agents/bkit-plan-review-2.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-plan-scope-check.toml b/.codex/agents/bkit-plan-scope-check.toml
index 0456d8c71..5e0cb51f5 100644
--- a/.codex/agents/bkit-plan-scope-check.toml
+++ b/.codex/agents/bkit-plan-scope-check.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-plan-update.toml b/.codex/agents/bkit-plan-update.toml
index 1619d99e0..fabc23f67 100644
--- a/.codex/agents/bkit-plan-update.toml
+++ b/.codex/agents/bkit-plan-update.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-ship-conflict-resolve.toml b/.codex/agents/bkit-ship-conflict-resolve.toml
index d0e8e377d..872b6ee91 100644
--- a/.codex/agents/bkit-ship-conflict-resolve.toml
+++ b/.codex/agents/bkit-ship-conflict-resolve.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-ship-deferred-sweep.toml b/.codex/agents/bkit-ship-deferred-sweep.toml
index 2b5a657eb..bfb922bf2 100644
--- a/.codex/agents/bkit-ship-deferred-sweep.toml
+++ b/.codex/agents/bkit-ship-deferred-sweep.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-ship-update-docs.toml b/.codex/agents/bkit-ship-update-docs.toml
index ae4077232..6b75d6581 100644
--- a/.codex/agents/bkit-ship-update-docs.toml
+++ b/.codex/agents/bkit-ship-update-docs.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-utility-compress-markdown.toml b/.codex/agents/bkit-utility-compress-markdown.toml
index 21bc43e37..0d467d68b 100644
--- a/.codex/agents/bkit-utility-compress-markdown.toml
+++ b/.codex/agents/bkit-utility-compress-markdown.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-utility-update-decisions.toml b/.codex/agents/bkit-utility-update-decisions.toml
index 144964f04..fdbad96dc 100644
--- a/.codex/agents/bkit-utility-update-decisions.toml
+++ b/.codex/agents/bkit-utility-update-decisions.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-utility-update-deferrals.toml b/.codex/agents/bkit-utility-update-deferrals.toml
index 2d33e5cd5..4b767ac4b 100644
--- a/.codex/agents/bkit-utility-update-deferrals.toml
+++ b/.codex/agents/bkit-utility-update-deferrals.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-utility-update-documentation.toml b/.codex/agents/bkit-utility-update-documentation.toml
index e46d91a85..059b1ba0b 100644
--- a/.codex/agents/bkit-utility-update-documentation.toml
+++ b/.codex/agents/bkit-utility-update-documentation.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-utility-update-failures.toml b/.codex/agents/bkit-utility-update-failures.toml
index 382783152..0395657c4 100644
--- a/.codex/agents/bkit-utility-update-failures.toml
+++ b/.codex/agents/bkit-utility-update-failures.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-utility-update-knowledge.toml b/.codex/agents/bkit-utility-update-knowledge.toml
index 626c2956a..cd00574c9 100644
--- a/.codex/agents/bkit-utility-update-knowledge.toml
+++ b/.codex/agents/bkit-utility-update-knowledge.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-utility-update-roadmap.toml b/.codex/agents/bkit-utility-update-roadmap.toml
index 0249f3f52..3080236fc 100644
--- a/.codex/agents/bkit-utility-update-roadmap.toml
+++ b/.codex/agents/bkit-utility-update-roadmap.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.codex/agents/bkit-utility-update-tracker.toml b/.codex/agents/bkit-utility-update-tracker.toml
index 3f08c8c3c..97ca64f1c 100644
--- a/.codex/agents/bkit-utility-update-tracker.toml
+++ b/.codex/agents/bkit-utility-update-tracker.toml
@@ -9,7 +9,7 @@ developer_instructions = """
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-audit-generate.md b/.cursor/agents/bkit-audit-generate.md
index cd4cfae55..533f0a228 100644
--- a/.cursor/agents/bkit-audit-generate.md
+++ b/.cursor/agents/bkit-audit-generate.md
@@ -23,7 +23,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-build-challenge-1.md b/.cursor/agents/bkit-build-challenge-1.md
index 4807cfbe0..d1d53f6f3 100644
--- a/.cursor/agents/bkit-build-challenge-1.md
+++ b/.cursor/agents/bkit-build-challenge-1.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-build-challenge-2.md b/.cursor/agents/bkit-build-challenge-2.md
index c614b344c..957f690f0 100644
--- a/.cursor/agents/bkit-build-challenge-2.md
+++ b/.cursor/agents/bkit-build-challenge-2.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-build-install-skills.md b/.cursor/agents/bkit-build-install-skills.md
index b2f094d9c..6af25de5f 100644
--- a/.cursor/agents/bkit-build-install-skills.md
+++ b/.cursor/agents/bkit-build-install-skills.md
@@ -17,7 +17,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-build-plan-convert.md b/.cursor/agents/bkit-build-plan-convert.md
index f8289bc09..8ba6dce47 100644
--- a/.cursor/agents/bkit-build-plan-convert.md
+++ b/.cursor/agents/bkit-build-plan-convert.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-build-plan-current.md b/.cursor/agents/bkit-build-plan-current.md
index f4688d34e..f0596f182 100644
--- a/.cursor/agents/bkit-build-plan-current.md
+++ b/.cursor/agents/bkit-build-plan-current.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-build-plan-gaps-remediate.md b/.cursor/agents/bkit-build-plan-gaps-remediate.md
index 74e00b588..7c49586f4 100644
--- a/.cursor/agents/bkit-build-plan-gaps-remediate.md
+++ b/.cursor/agents/bkit-build-plan-gaps-remediate.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-build-plan-tasks.md b/.cursor/agents/bkit-build-plan-tasks.md
index 703bdef72..cdd28fbc3 100644
--- a/.cursor/agents/bkit-build-plan-tasks.md
+++ b/.cursor/agents/bkit-build-plan-tasks.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-build-plan-tests.md b/.cursor/agents/bkit-build-plan-tests.md
index 4ff20dbd1..7b0616545 100644
--- a/.cursor/agents/bkit-build-plan-tests.md
+++ b/.cursor/agents/bkit-build-plan-tests.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-build-plan-verify.md b/.cursor/agents/bkit-build-plan-verify.md
index 4914875db..5e3b615cb 100644
--- a/.cursor/agents/bkit-build-plan-verify.md
+++ b/.cursor/agents/bkit-build-plan-verify.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-debug-abort-handover.md b/.cursor/agents/bkit-debug-abort-handover.md
index 791fcc495..cd8ab7b6f 100644
--- a/.cursor/agents/bkit-debug-abort-handover.md
+++ b/.cursor/agents/bkit-debug-abort-handover.md
@@ -16,7 +16,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-debug-failure-diagnose.md b/.cursor/agents/bkit-debug-failure-diagnose.md
index 505ab0cf4..6f15acd32 100644
--- a/.cursor/agents/bkit-debug-failure-diagnose.md
+++ b/.cursor/agents/bkit-debug-failure-diagnose.md
@@ -21,7 +21,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-debug-failure-remediate.md b/.cursor/agents/bkit-debug-failure-remediate.md
index ef0ad8c67..b9b1f226c 100644
--- a/.cursor/agents/bkit-debug-failure-remediate.md
+++ b/.cursor/agents/bkit-debug-failure-remediate.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-debug-failure-reproduce.md b/.cursor/agents/bkit-debug-failure-reproduce.md
index 4433d8f56..d73039e2b 100644
--- a/.cursor/agents/bkit-debug-failure-reproduce.md
+++ b/.cursor/agents/bkit-debug-failure-reproduce.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-debug-failure-soak.md b/.cursor/agents/bkit-debug-failure-soak.md
index 3f42417a3..eb1727e9e 100644
--- a/.cursor/agents/bkit-debug-failure-soak.md
+++ b/.cursor/agents/bkit-debug-failure-soak.md
@@ -21,7 +21,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-design-brainstorm-ideate-1.md b/.cursor/agents/bkit-design-brainstorm-ideate-1.md
index bf580f628..64cc9ffed 100644
--- a/.cursor/agents/bkit-design-brainstorm-ideate-1.md
+++ b/.cursor/agents/bkit-design-brainstorm-ideate-1.md
@@ -17,7 +17,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-design-brainstorm-ideate-2.md b/.cursor/agents/bkit-design-brainstorm-ideate-2.md
index f2d9fefa8..6cc6a66f3 100644
--- a/.cursor/agents/bkit-design-brainstorm-ideate-2.md
+++ b/.cursor/agents/bkit-design-brainstorm-ideate-2.md
@@ -17,7 +17,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-design-brainstorm-ideate-3.md b/.cursor/agents/bkit-design-brainstorm-ideate-3.md
index 16b8b7fea..b7fb70c02 100644
--- a/.cursor/agents/bkit-design-brainstorm-ideate-3.md
+++ b/.cursor/agents/bkit-design-brainstorm-ideate-3.md
@@ -17,7 +17,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-design-generate.md b/.cursor/agents/bkit-design-generate.md
index 81507a53e..47f0945eb 100644
--- a/.cursor/agents/bkit-design-generate.md
+++ b/.cursor/agents/bkit-design-generate.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-design-organise.md b/.cursor/agents/bkit-design-organise.md
index 04e4f4601..33944d714 100644
--- a/.cursor/agents/bkit-design-organise.md
+++ b/.cursor/agents/bkit-design-organise.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-design-review-1.md b/.cursor/agents/bkit-design-review-1.md
index 3ece245e5..6f96fbc6b 100644
--- a/.cursor/agents/bkit-design-review-1.md
+++ b/.cursor/agents/bkit-design-review-1.md
@@ -21,7 +21,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-design-review-2.md b/.cursor/agents/bkit-design-review-2.md
index acf505fa2..595bbaf78 100644
--- a/.cursor/agents/bkit-design-review-2.md
+++ b/.cursor/agents/bkit-design-review-2.md
@@ -21,7 +21,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-design-spike.md b/.cursor/agents/bkit-design-spike.md
index 2def9ab10..29c7b5576 100644
--- a/.cursor/agents/bkit-design-spike.md
+++ b/.cursor/agents/bkit-design-spike.md
@@ -21,7 +21,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-design-update.md b/.cursor/agents/bkit-design-update.md
index 96166fce0..c53d4156f 100644
--- a/.cursor/agents/bkit-design-update.md
+++ b/.cursor/agents/bkit-design-update.md
@@ -18,7 +18,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-plan-generate.md b/.cursor/agents/bkit-plan-generate.md
index 1686fe70f..24e55e9e7 100644
--- a/.cursor/agents/bkit-plan-generate.md
+++ b/.cursor/agents/bkit-plan-generate.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-plan-review-1.md b/.cursor/agents/bkit-plan-review-1.md
index 7c63b9eb5..245067a1a 100644
--- a/.cursor/agents/bkit-plan-review-1.md
+++ b/.cursor/agents/bkit-plan-review-1.md
@@ -18,7 +18,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-plan-review-2.md b/.cursor/agents/bkit-plan-review-2.md
index c07110314..6379656d5 100644
--- a/.cursor/agents/bkit-plan-review-2.md
+++ b/.cursor/agents/bkit-plan-review-2.md
@@ -18,7 +18,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-plan-scope-check.md b/.cursor/agents/bkit-plan-scope-check.md
index a25fe8c2d..1a92bfd0c 100644
--- a/.cursor/agents/bkit-plan-scope-check.md
+++ b/.cursor/agents/bkit-plan-scope-check.md
@@ -18,7 +18,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-plan-update.md b/.cursor/agents/bkit-plan-update.md
index 1381b3078..554898450 100644
--- a/.cursor/agents/bkit-plan-update.md
+++ b/.cursor/agents/bkit-plan-update.md
@@ -18,7 +18,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-ship-conflict-resolve.md b/.cursor/agents/bkit-ship-conflict-resolve.md
index 22a7bc823..e6b80268b 100644
--- a/.cursor/agents/bkit-ship-conflict-resolve.md
+++ b/.cursor/agents/bkit-ship-conflict-resolve.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-ship-deferred-sweep.md b/.cursor/agents/bkit-ship-deferred-sweep.md
index 1d4836bb8..765b6ba92 100644
--- a/.cursor/agents/bkit-ship-deferred-sweep.md
+++ b/.cursor/agents/bkit-ship-deferred-sweep.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-ship-update-docs.md b/.cursor/agents/bkit-ship-update-docs.md
index 7d233b6e2..88ffe437f 100644
--- a/.cursor/agents/bkit-ship-update-docs.md
+++ b/.cursor/agents/bkit-ship-update-docs.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-utility-compress-markdown.md b/.cursor/agents/bkit-utility-compress-markdown.md
index 70ac390ff..b94ed640d 100644
--- a/.cursor/agents/bkit-utility-compress-markdown.md
+++ b/.cursor/agents/bkit-utility-compress-markdown.md
@@ -17,7 +17,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-utility-update-decisions.md b/.cursor/agents/bkit-utility-update-decisions.md
index b149976d6..d7502a197 100644
--- a/.cursor/agents/bkit-utility-update-decisions.md
+++ b/.cursor/agents/bkit-utility-update-decisions.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-utility-update-deferrals.md b/.cursor/agents/bkit-utility-update-deferrals.md
index 730aa4b5b..0e81c6b3c 100644
--- a/.cursor/agents/bkit-utility-update-deferrals.md
+++ b/.cursor/agents/bkit-utility-update-deferrals.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-utility-update-documentation.md b/.cursor/agents/bkit-utility-update-documentation.md
index f97e8cebd..a56a2805d 100644
--- a/.cursor/agents/bkit-utility-update-documentation.md
+++ b/.cursor/agents/bkit-utility-update-documentation.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-utility-update-failures.md b/.cursor/agents/bkit-utility-update-failures.md
index f974b1fd8..0906e2627 100644
--- a/.cursor/agents/bkit-utility-update-failures.md
+++ b/.cursor/agents/bkit-utility-update-failures.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-utility-update-knowledge.md b/.cursor/agents/bkit-utility-update-knowledge.md
index f7985b437..c33e76281 100644
--- a/.cursor/agents/bkit-utility-update-knowledge.md
+++ b/.cursor/agents/bkit-utility-update-knowledge.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-utility-update-roadmap.md b/.cursor/agents/bkit-utility-update-roadmap.md
index 448540018..654d08000 100644
--- a/.cursor/agents/bkit-utility-update-roadmap.md
+++ b/.cursor/agents/bkit-utility-update-roadmap.md
@@ -21,7 +21,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.cursor/agents/bkit-utility-update-tracker.md b/.cursor/agents/bkit-utility-update-tracker.md
index 9ec32dcaf..d116cd751 100644
--- a/.cursor/agents/bkit-utility-update-tracker.md
+++ b/.cursor/agents/bkit-utility-update-tracker.md
@@ -24,7 +24,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-audit-generate.md b/.opencode/agents/bkit-audit-generate.md
index a6b619d5b..923428e66 100644
--- a/.opencode/agents/bkit-audit-generate.md
+++ b/.opencode/agents/bkit-audit-generate.md
@@ -24,7 +24,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-build-challenge-1.md b/.opencode/agents/bkit-build-challenge-1.md
index 373e013a1..b0e7761df 100644
--- a/.opencode/agents/bkit-build-challenge-1.md
+++ b/.opencode/agents/bkit-build-challenge-1.md
@@ -20,7 +20,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-build-challenge-2.md b/.opencode/agents/bkit-build-challenge-2.md
index a7002c4ff..3ccb236b4 100644
--- a/.opencode/agents/bkit-build-challenge-2.md
+++ b/.opencode/agents/bkit-build-challenge-2.md
@@ -20,7 +20,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-build-install-skills.md b/.opencode/agents/bkit-build-install-skills.md
index 236b4eaed..7db38b046 100644
--- a/.opencode/agents/bkit-build-install-skills.md
+++ b/.opencode/agents/bkit-build-install-skills.md
@@ -18,7 +18,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-build-plan-convert.md b/.opencode/agents/bkit-build-plan-convert.md
index f54be04ca..c44494127 100644
--- a/.opencode/agents/bkit-build-plan-convert.md
+++ b/.opencode/agents/bkit-build-plan-convert.md
@@ -20,7 +20,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-build-plan-current.md b/.opencode/agents/bkit-build-plan-current.md
index a8a3d6fa8..9204fb9b1 100644
--- a/.opencode/agents/bkit-build-plan-current.md
+++ b/.opencode/agents/bkit-build-plan-current.md
@@ -20,7 +20,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-build-plan-gaps-remediate.md b/.opencode/agents/bkit-build-plan-gaps-remediate.md
index 9e9940866..11ca07940 100644
--- a/.opencode/agents/bkit-build-plan-gaps-remediate.md
+++ b/.opencode/agents/bkit-build-plan-gaps-remediate.md
@@ -20,7 +20,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-build-plan-tasks.md b/.opencode/agents/bkit-build-plan-tasks.md
index f1b57ce0c..572fb2e72 100644
--- a/.opencode/agents/bkit-build-plan-tasks.md
+++ b/.opencode/agents/bkit-build-plan-tasks.md
@@ -20,7 +20,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-build-plan-tests.md b/.opencode/agents/bkit-build-plan-tests.md
index 7b0b1654f..ac393bd34 100644
--- a/.opencode/agents/bkit-build-plan-tests.md
+++ b/.opencode/agents/bkit-build-plan-tests.md
@@ -20,7 +20,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-build-plan-verify.md b/.opencode/agents/bkit-build-plan-verify.md
index bfecb55e9..2c7bb43ed 100644
--- a/.opencode/agents/bkit-build-plan-verify.md
+++ b/.opencode/agents/bkit-build-plan-verify.md
@@ -20,7 +20,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-debug-abort-handover.md b/.opencode/agents/bkit-debug-abort-handover.md
index fc21c42f5..548a7e90c 100644
--- a/.opencode/agents/bkit-debug-abort-handover.md
+++ b/.opencode/agents/bkit-debug-abort-handover.md
@@ -17,7 +17,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-debug-failure-diagnose.md b/.opencode/agents/bkit-debug-failure-diagnose.md
index 16db30e61..b5056e548 100644
--- a/.opencode/agents/bkit-debug-failure-diagnose.md
+++ b/.opencode/agents/bkit-debug-failure-diagnose.md
@@ -22,7 +22,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-debug-failure-remediate.md b/.opencode/agents/bkit-debug-failure-remediate.md
index 1e0a9f8c9..53030ee66 100644
--- a/.opencode/agents/bkit-debug-failure-remediate.md
+++ b/.opencode/agents/bkit-debug-failure-remediate.md
@@ -20,7 +20,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-debug-failure-reproduce.md b/.opencode/agents/bkit-debug-failure-reproduce.md
index 861f26792..63573b9b0 100644
--- a/.opencode/agents/bkit-debug-failure-reproduce.md
+++ b/.opencode/agents/bkit-debug-failure-reproduce.md
@@ -20,7 +20,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-debug-failure-soak.md b/.opencode/agents/bkit-debug-failure-soak.md
index d77bbefc7..875d38ae2 100644
--- a/.opencode/agents/bkit-debug-failure-soak.md
+++ b/.opencode/agents/bkit-debug-failure-soak.md
@@ -22,7 +22,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-design-brainstorm-ideate-1.md b/.opencode/agents/bkit-design-brainstorm-ideate-1.md
index c317f6d1a..e7c451ebd 100644
--- a/.opencode/agents/bkit-design-brainstorm-ideate-1.md
+++ b/.opencode/agents/bkit-design-brainstorm-ideate-1.md
@@ -18,7 +18,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-design-brainstorm-ideate-2.md b/.opencode/agents/bkit-design-brainstorm-ideate-2.md
index 5dc4cd0f1..bc474ee26 100644
--- a/.opencode/agents/bkit-design-brainstorm-ideate-2.md
+++ b/.opencode/agents/bkit-design-brainstorm-ideate-2.md
@@ -18,7 +18,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-design-brainstorm-ideate-3.md b/.opencode/agents/bkit-design-brainstorm-ideate-3.md
index d8dabd1ad..5c8219a84 100644
--- a/.opencode/agents/bkit-design-brainstorm-ideate-3.md
+++ b/.opencode/agents/bkit-design-brainstorm-ideate-3.md
@@ -18,7 +18,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-design-generate.md b/.opencode/agents/bkit-design-generate.md
index a2ea01d09..9e97ce843 100644
--- a/.opencode/agents/bkit-design-generate.md
+++ b/.opencode/agents/bkit-design-generate.md
@@ -20,7 +20,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-design-organise.md b/.opencode/agents/bkit-design-organise.md
index c338cf7dd..7c85becac 100644
--- a/.opencode/agents/bkit-design-organise.md
+++ b/.opencode/agents/bkit-design-organise.md
@@ -20,7 +20,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-design-review-1.md b/.opencode/agents/bkit-design-review-1.md
index 40af59831..2bf615dc3 100644
--- a/.opencode/agents/bkit-design-review-1.md
+++ b/.opencode/agents/bkit-design-review-1.md
@@ -22,7 +22,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-design-review-2.md b/.opencode/agents/bkit-design-review-2.md
index c9c0f0158..0ec43fbb5 100644
--- a/.opencode/agents/bkit-design-review-2.md
+++ b/.opencode/agents/bkit-design-review-2.md
@@ -22,7 +22,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-design-spike.md b/.opencode/agents/bkit-design-spike.md
index 3014e30ff..84779476c 100644
--- a/.opencode/agents/bkit-design-spike.md
+++ b/.opencode/agents/bkit-design-spike.md
@@ -22,7 +22,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-design-update.md b/.opencode/agents/bkit-design-update.md
index 9e888e3ea..c785a0864 100644
--- a/.opencode/agents/bkit-design-update.md
+++ b/.opencode/agents/bkit-design-update.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-plan-generate.md b/.opencode/agents/bkit-plan-generate.md
index 7b4d753d7..e14a14e46 100644
--- a/.opencode/agents/bkit-plan-generate.md
+++ b/.opencode/agents/bkit-plan-generate.md
@@ -20,7 +20,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-plan-review-1.md b/.opencode/agents/bkit-plan-review-1.md
index b4ee9f350..a87d928a8 100644
--- a/.opencode/agents/bkit-plan-review-1.md
+++ b/.opencode/agents/bkit-plan-review-1.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-plan-review-2.md b/.opencode/agents/bkit-plan-review-2.md
index aaf409043..ef9805233 100644
--- a/.opencode/agents/bkit-plan-review-2.md
+++ b/.opencode/agents/bkit-plan-review-2.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-plan-scope-check.md b/.opencode/agents/bkit-plan-scope-check.md
index b9e3f3295..ad956ed5d 100644
--- a/.opencode/agents/bkit-plan-scope-check.md
+++ b/.opencode/agents/bkit-plan-scope-check.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-plan-update.md b/.opencode/agents/bkit-plan-update.md
index 35d9d70ef..fb5d89f2f 100644
--- a/.opencode/agents/bkit-plan-update.md
+++ b/.opencode/agents/bkit-plan-update.md
@@ -19,7 +19,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-ship-conflict-resolve.md b/.opencode/agents/bkit-ship-conflict-resolve.md
index 751519ecd..dab167033 100644
--- a/.opencode/agents/bkit-ship-conflict-resolve.md
+++ b/.opencode/agents/bkit-ship-conflict-resolve.md
@@ -20,7 +20,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-ship-deferred-sweep.md b/.opencode/agents/bkit-ship-deferred-sweep.md
index bdada26fa..4e85b7c78 100644
--- a/.opencode/agents/bkit-ship-deferred-sweep.md
+++ b/.opencode/agents/bkit-ship-deferred-sweep.md
@@ -20,7 +20,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-ship-update-docs.md b/.opencode/agents/bkit-ship-update-docs.md
index f79071bad..cd6578683 100644
--- a/.opencode/agents/bkit-ship-update-docs.md
+++ b/.opencode/agents/bkit-ship-update-docs.md
@@ -20,7 +20,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-utility-compress-markdown.md b/.opencode/agents/bkit-utility-compress-markdown.md
index f9d85e151..ced34caa2 100644
--- a/.opencode/agents/bkit-utility-compress-markdown.md
+++ b/.opencode/agents/bkit-utility-compress-markdown.md
@@ -18,7 +18,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-utility-update-decisions.md b/.opencode/agents/bkit-utility-update-decisions.md
index 1fa310149..ab36544c3 100644
--- a/.opencode/agents/bkit-utility-update-decisions.md
+++ b/.opencode/agents/bkit-utility-update-decisions.md
@@ -20,7 +20,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-utility-update-deferrals.md b/.opencode/agents/bkit-utility-update-deferrals.md
index 2b27d8045..c952e855e 100644
--- a/.opencode/agents/bkit-utility-update-deferrals.md
+++ b/.opencode/agents/bkit-utility-update-deferrals.md
@@ -20,7 +20,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-utility-update-documentation.md b/.opencode/agents/bkit-utility-update-documentation.md
index b3cda5315..4ab5a7573 100644
--- a/.opencode/agents/bkit-utility-update-documentation.md
+++ b/.opencode/agents/bkit-utility-update-documentation.md
@@ -20,7 +20,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-utility-update-failures.md b/.opencode/agents/bkit-utility-update-failures.md
index 05c7eb896..dc3e8128c 100644
--- a/.opencode/agents/bkit-utility-update-failures.md
+++ b/.opencode/agents/bkit-utility-update-failures.md
@@ -20,7 +20,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-utility-update-knowledge.md b/.opencode/agents/bkit-utility-update-knowledge.md
index 630207abf..810cbdcb2 100644
--- a/.opencode/agents/bkit-utility-update-knowledge.md
+++ b/.opencode/agents/bkit-utility-update-knowledge.md
@@ -20,7 +20,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-utility-update-roadmap.md b/.opencode/agents/bkit-utility-update-roadmap.md
index 516b4789b..d0841ee5f 100644
--- a/.opencode/agents/bkit-utility-update-roadmap.md
+++ b/.opencode/agents/bkit-utility-update-roadmap.md
@@ -22,7 +22,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
diff --git a/.opencode/agents/bkit-utility-update-tracker.md b/.opencode/agents/bkit-utility-update-tracker.md
index e9051997e..9e059d05f 100644
--- a/.opencode/agents/bkit-utility-update-tracker.md
+++ b/.opencode/agents/bkit-utility-update-tracker.md
@@ -25,7 +25,7 @@ tools:
 
 **Protocol:** Work through this file exactly as written.
 
-- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`; skip its `Orchestrator Rules`.
+- **Rules file:** Find the line of `<!-- bkit:end -->` in `.agents/rules.md` (`grep -n`), then read the file from that line on → follow its `Universal Rules`, and break ties by its `Project Goals`; skip its `Orchestrator Rules`.
 - **Order:** Execute steps sequentially unless stated otherwise.
 - **No improv:** Skip no step, and add no step of your own; how deeply you investigate within a step is your call.
 
