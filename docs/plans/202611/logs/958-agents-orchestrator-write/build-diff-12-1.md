diff --git a/DETAILS.md b/DETAILS.md
index 0481ffd66..b88329dc1 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -354,7 +354,7 @@ flowchart LR
     n_bkit_core_engine_shared["shared<br/>157 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands -->|489| n_bkit_core_engine_ledgers
+  n_bkit_core_engine_commands -->|490| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|425| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|221| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|187| n_bkit_core_engine_shared
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 9d1703b56..3f0adc0a7 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -133,7 +133,7 @@ flowchart LR
     n_bkit_core_engine_shared["shared<br/>157 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands -->|489| n_bkit_core_engine_ledgers
+  n_bkit_core_engine_commands -->|490| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|425| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|221| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|187| n_bkit_core_engine_shared
@@ -381,11 +381,11 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_tracker -->|19| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_workflows -->|19| n_bkit_core_engine_commands_workflow_issues
   n_bkit_core_engine_commands_lib -->|18| n_bkit_core_engine_ledgers_journal
+  n_bkit_core_engine_commands_workflow_decisions -->|18| n_bkit_core_engine_commands_workflow_open_decision
   n_bkit_core_engine_commands_workflow_prs -->|18| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_workflows -->|18| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_workflow_branches -->|17| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_counters -->|17| n_bkit_core_engine_commands_lib
-  n_bkit_core_engine_commands_workflow_decisions -->|17| n_bkit_core_engine_commands_workflow_open_decision
   n_bkit_core_engine_commands_workflow_runs -->|17| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_workflow_tasks -->|17| n_bkit_core_engine_commands_workflow_plan_blocks
   n_bkit_core_engine_ledgers_journal -->|17| n_bkit_core_engine_ledgers_telemetry
@@ -557,6 +557,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_challenge -->|6| n_bkit_core_engine_commands_workflow_tests
   n_bkit_core_engine_commands_workflow_context -->|6| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_counters -->|6| n_bkit_core_engine_shared_settings
+  n_bkit_core_engine_commands_workflow_decisions -->|6| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_disk -->|6| n_bkit_core_engine_checks_before_env
   n_bkit_core_engine_commands_workflow_issues -->|6| n_bkit_core_engine_shared_settings
   n_bkit_core_engine_commands_workflow_issues -->|6| n_bkit_core_engine_commands_workflow_audit_report
@@ -917,6 +918,7 @@ flowchart LR
   linkStyle 228 stroke:#59636e80,stroke-width:2px
   linkStyle 229 stroke:#59636e80,stroke-width:2px
   linkStyle 230 stroke:#59636e80,stroke-width:2px
+  linkStyle 231 stroke:#59636e80,stroke-width:2px
 ```
 
 <!-- graphify:end -->
