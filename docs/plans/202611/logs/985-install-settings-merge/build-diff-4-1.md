diff --git a/.bkit/core/engine/install/modules/claude.integration.test.ts b/.bkit/core/engine/install/modules/claude.integration.test.ts
index d6f87c4cd..5d91d4ad0 100644
--- a/.bkit/core/engine/install/modules/claude.integration.test.ts
+++ b/.bkit/core/engine/install/modules/claude.integration.test.ts
@@ -206,7 +206,7 @@ describe("runClaudeModule dry run reports retired settings entries", () => {
   });
 
   it("dry run names an edited variant as kept", () => {
-    const edited = "mcp__claude_ai_Linear__get_issue";
+    const edited = "mcp__claude_ai_Linear__my_own_tool";
     seedSettings(["Bash(ls)", edited]);
     const ctx = makeCtx({ dryRun: true });
     runClaudeModule(ctx);
@@ -216,6 +216,23 @@ describe("runClaudeModule dry run reports retired settings entries", () => {
     expect(found[0]!.detect).toMatch(/kept|edited/);
   });
 
+  it("dry run over a v2.2.3 settings file names the Linear connector write grants as retired, not kept", () => {
+    seedSettings([
+      "Bash(ls)",
+      "mcp__claude_ai_Linear__save_issue",
+      "mcp__claude_ai_Linear__save_comment",
+    ]);
+    const ctx = makeCtx({ dryRun: true });
+    runClaudeModule(ctx);
+    const found = retiredAdvisories(ctx);
+    expect(found).toHaveLength(1);
+    const detect = found[0]!.detect;
+    expect(detect).toContain("retired entries bkit removes");
+    expect(detect).toContain("mcp__claude_ai_Linear__save_issue");
+    expect(detect).toContain("mcp__claude_ai_Linear__save_comment");
+    expect(detect).not.toContain("edited copies of a retired entry, kept");
+  });
+
   it("keeps a retired value the mcp-servers block derives and records no drift on the next dry run", () => {
     fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
     fs.writeFileSync(
diff --git a/.bkit/core/engine/install/write.test.ts b/.bkit/core/engine/install/write.test.ts
index 8793c9015..f57a43e33 100644
--- a/.bkit/core/engine/install/write.test.ts
+++ b/.bkit/core/engine/install/write.test.ts
@@ -924,7 +924,7 @@ describe("retired settings entries — find and prune", () => {
     expect(text).toContain(".claude/settings.json");
     expect(text).toContain("permissions.allow");
     expect(text).toContain(RETIRED_LINEAR);
-    expect(RETIRED_SETTINGS_ENTRIES).toHaveLength(1);
+    expect(RETIRED_SETTINGS_ENTRIES).toHaveLength(11);
   });
 
   it("removes a retired entry and keeps the person's entries beside it", () => {
@@ -950,7 +950,7 @@ describe("retired settings entries — find and prune", () => {
   });
 
   it("reports an edited variant as edited and never removes it", () => {
-    const edited = "mcp__claude_ai_Linear__get_issue";
+    const edited = "mcp__claude_ai_Linear__my_own_tool";
     const doc = { permissions: { allow: [edited, "mcp__mine__*"] } };
     const found = findRetiredSettingsEntries(".claude/settings.json", doc as JsonValue);
     expect(found.retired).toHaveLength(0);
@@ -961,7 +961,7 @@ describe("retired settings entries — find and prune", () => {
   });
 
   it("does not report an entry the template ships as edited", () => {
-    const shipped = "mcp__claude_ai_Linear__get_issue";
+    const shipped = "mcp__claude_ai_Linear__my_own_tool";
     const doc = { permissions: { allow: [shipped] } };
     const template = { permissions: { allow: [shipped] } };
     const found = findRetiredSettingsEntries(
@@ -996,6 +996,27 @@ describe("retired settings entries — find and prune", () => {
     expect(doc.permissions.deny).toEqual(["Bash(rm -rf ~/*)", "Bash(mine)"]);
   });
 
+  it("removes every Linear connector tool grant bkit shipped in v0.4.0-v2.2.3 and reports none as edited", () => {
+    const tools = [
+      "list_teams",
+      "list_projects",
+      "list_issues",
+      "list_issue_labels",
+      "list_issue_statuses",
+      "get_issue",
+      "get_issue_status",
+      "save_issue",
+      "list_comments",
+      "save_comment",
+    ].map((t) => `mcp__claude_ai_Linear__${t}`);
+    const doc = { permissions: { allow: [...tools, "mcp__mine__*"] } };
+    const found = findRetiredSettingsEntries(".claude/settings.json", doc as JsonValue);
+    expect(found.edited).toHaveLength(0);
+    expect(found.retired.map((e) => e.value).sort()).toEqual([...tools].sort());
+    const out = pruneRetiredSettingsEntries(".claude/settings.json", doc as JsonValue);
+    expect(allowOf(out)).toEqual(["mcp__mine__*"]);
+  });
+
   it("prunes a retired entry in any host file the list names", () => {
     const doc = { permissions: { allow: ["retired-codex-entry", "keep"] } };
     const out = pruneRetiredSettingsEntries(".codex/hooks.json", doc as JsonValue, CODEX_LIST);
@@ -1042,7 +1063,7 @@ describe("writeTier2JsonContained — retired settings entries", () => {
   });
 
   it("keeps an edited variant and warns with the file and the entry", () => {
-    const edited = "mcp__claude_ai_Linear__get_issue";
+    const edited = "mcp__claude_ai_Linear__my_own_tool";
     const { src, dst } = seed(["Bash(*)", edited]);
     const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
     try {
diff --git a/.bkit/core/engine/install/write.ts b/.bkit/core/engine/install/write.ts
index 22454690a..a7ce9f49b 100644
--- a/.bkit/core/engine/install/write.ts
+++ b/.bkit/core/engine/install/write.ts
@@ -364,6 +364,24 @@ export interface RetiredSettingsEntry {
 export const RETIRED_SETTINGS_ENTRIES: readonly RetiredSettingsEntry[] = [
   // v3.0.0-v5.4.0, dropped in v5.5.0.
   { file: ".claude/settings.json", path: "permissions.allow", value: "mcp__claude_ai_Linear__*" },
+  // v0.4.0-v2.2.3 (get_issue, list_issues, save_issue, list_comments, save_comment from v0.4.0;
+  // the rest from v2.0.5), all last shipped in v2.2.3.
+  ...[
+    "list_teams",
+    "list_projects",
+    "list_issues",
+    "list_issue_labels",
+    "list_issue_statuses",
+    "get_issue",
+    "get_issue_status",
+    "save_issue",
+    "list_comments",
+    "save_comment",
+  ].map((tool) => ({
+    file: ".claude/settings.json",
+    path: "permissions.allow",
+    value: `mcp__claude_ai_Linear__${tool}`,
+  })),
 ];
 
 /** Only `permissions.allow` entries can be retired; a deny or ask rule is never taken back. */
@@ -411,12 +429,16 @@ export function findRetiredSettingsEntries(
     const held = arrayAt(doc, entry.path);
     if (!held) continue;
     const shipped = template === undefined ? [] : (arrayAt(template, entry.path) ?? []);
+    const listed = list
+      .filter((e) => e.file === entry.file && e.path === entry.path)
+      .map((e) => e.value);
     const stem = entry.value.replace(/\*$/, "");
     for (const item of held) {
       if (typeof item !== "string") continue;
       const finding = { file: entry.file, path: entry.path, value: item, retired: entry.value };
       if (item === entry.value) retired.push(finding);
-      else if (item.startsWith(stem) && !shipped.includes(item)) edited.push(finding);
+      else if (item.startsWith(stem) && !listed.includes(item) && !shipped.includes(item))
+        edited.push(finding);
     }
   }
   return { retired, edited };
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index ec661e7cb..8c9d5bad5 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -315,3 +315,6 @@
 {"schema":3,"ts":1795078616166,"kind":"friction","key":"owner-pause/design.draft","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"design","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"design paused for the owner at design.draft","description":"The design workflow stopped and asked the owner (`owner-pause` at design.draft).","source":"orchestrator","status":"OPEN","run":{"parentSha":"c7bd209c17f9759595e5e44035319304e2a37fb3"},"recurrenceCount":7,"lastConfirmed":1795078616166}
 {"schema":3,"ts":1795084738150,"kind":"friction","key":"tracker-mcp-down-plan-comment-via-gh/design-workstream-suggest","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"design","step":"design-workstream-suggest"},"references":["260-milestone-orchestrator-autonomous","#260","https://github.com/cbartens/bkit/issues/260#issuecomment-7006700275"],"category":"tool-failure","scope":"bkit-repo","severity":"LOW","summary":"Step 11 plan-list comment needs the GitHub MCP, which failed to connect (401); posted the printed commentFile byte for byte with keyring gh instead","description":"bkit plans comment printed a commentFile to post via the tracker MCP. The github MCP server had failed to connect at session start (AUTH_HEADER_REJECTED, 401, stale BKIT_GH_TOKEN). The orchestrator posted the same file with 'env -u GH_TOKEN -u BKIT_GH_TOKEN gh issue comment 260 --body-file <commentFile>', which returned the comment URL.","source":"orchestrator","status":"OPEN","remediation":"Rotate BKIT_GH_TOKEN; consider a bkit verb that posts the plans comment itself so the step does not need the MCP."}
 {"schema":3,"ts":1795096362791,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":34,"lastConfirmed":1795096362791}
+{"schema":3,"ts":1795100433761,"kind":"friction","key":"steps-finish/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-tasks with exit 11: `.bkit/core/engine/commands/workflow/tracker.test.ts` \"edits by verified comment id through each existing transport\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"seals unavailable or unstable representation evidence\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"uses accepted final preflight eligibility without provider atomicity\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"refuses aggregation with an unverified provider budget\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"5834934f4a050b24979f75e161c9017d284733a2"},"recurrenceCount":6,"lastConfirmed":1795100433761}
+{"schema":3,"ts":1795100490086,"kind":"friction","key":"steps-finish/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-tasks with exit 11: `.bkit/core/engine/commands/workflow/tracker.test.ts` \"edits by verified comment id through each existing transport\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"seals unavailable or unstable representation evidence\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"uses accepted final preflight eligibility without provider atomicity\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"refuses aggregation with an unverified provider budget\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"5834934f4a050b24979f75e161c9017d284733a2"},"recurrenceCount":7,"lastConfirmed":1795100490086}
+{"schema":3,"ts":1795100638979,"kind":"friction","key":"985-install-settings-merge-exit-11-two-stage-reask","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["985","985-install-settings-merge","1036",".claude/commands/bkit-build.md"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"exit 11 route allows one re-ask, but a BLOCKED answer to an earlier task's test needs two","description":"Build 985 group 4 (Task 8) had to change five tests owned by ticked Tasks 1-3. First exit 11: the re-ask kept the edits with BLOCKED lines. Second exit 11: the engine refused the BLOCKED answer, added takeover Tasks 9-13 in group 5 and asked for the five tests back. The workflow text routes a second non-zero to the Failure Path and does not name this second stage; the v6.3 orchestrator chose one more re-ask (not the owner's answer).","status":"OPEN"}
diff --git a/DETAILS.md b/DETAILS.md
index e3a4caa04..96ab8c5d7 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -348,7 +348,7 @@ flowchart LR
     n_bkit_core_engine_checks["checks<br/>265 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
     n_bkit_core_engine_commands["commands<br/>1968 symbols · 58 files"]
-    n_bkit_core_engine_install["install<br/>370 symbols · 21 files"]
+    n_bkit_core_engine_install["install<br/>378 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>241 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>157 symbols · 13 files<br/>1 open finding"]
@@ -356,7 +356,7 @@ flowchart LR
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   n_bkit_core_engine_commands -->|474| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|432| n_bkit_core_engine_shared
-  n_bkit_core_engine_commands -->|222| n_bkit_core_engine_install
+  n_bkit_core_engine_commands -->|224| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|187| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|147| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|89| n_bkit_core_engine_checks
@@ -364,9 +364,9 @@ flowchart LR
   n_bkit_core_engine_install -->|64| n_bkit_core_engine_render
   n_bkit_core_engine_commands -->|42| n_bkit_core_engine_render
   n_bkit_core_engine_cli -->|35| n_bkit_core_engine_commands
+  n_bkit_core_engine_install -->|19| n_bkit_core_engine_checks
   n_bkit_core_engine_ledgers -->|19| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|18| n_bkit_core_engine_commands
-  n_bkit_core_engine_install -->|17| n_bkit_core_engine_checks
   n_bkit_core_engine_shared -->|16| n_bkit_core_engine_install
   n_bkit_core_engine_commands -->|15| n_bkit_core_engine_cli
   nscripts_harvest -->|14| n_bkit_core_engine_ledgers
diff --git a/dist/install/write.js b/dist/install/write.js
index 04e01a1d3..557803adc 100644
--- a/dist/install/write.js
+++ b/dist/install/write.js
@@ -276,6 +276,24 @@ export function trackerEntryInSync(existing, owned) {
 export const RETIRED_SETTINGS_ENTRIES = [
     // v3.0.0-v5.4.0, dropped in v5.5.0.
     { file: ".claude/settings.json", path: "permissions.allow", value: "mcp__claude_ai_Linear__*" },
+    // v0.4.0-v2.2.3 (get_issue, list_issues, save_issue, list_comments, save_comment from v0.4.0;
+    // the rest from v2.0.5), all last shipped in v2.2.3.
+    ...[
+        "list_teams",
+        "list_projects",
+        "list_issues",
+        "list_issue_labels",
+        "list_issue_statuses",
+        "get_issue",
+        "get_issue_status",
+        "save_issue",
+        "list_comments",
+        "save_comment",
+    ].map((tool) => ({
+        file: ".claude/settings.json",
+        path: "permissions.allow",
+        value: `mcp__claude_ai_Linear__${tool}`,
+    })),
 ];
 /** Only `permissions.allow` entries can be retired; a deny or ask rule is never taken back. */
 function assertRetirableEntry(entry) {
@@ -308,6 +326,9 @@ export function findRetiredSettingsEntries(rel, doc, template, list = RETIRED_SE
         if (!held)
             continue;
         const shipped = template === undefined ? [] : (arrayAt(template, entry.path) ?? []);
+        const listed = list
+            .filter((e) => e.file === entry.file && e.path === entry.path)
+            .map((e) => e.value);
         const stem = entry.value.replace(/\*$/, "");
         for (const item of held) {
             if (typeof item !== "string")
@@ -315,7 +336,7 @@ export function findRetiredSettingsEntries(rel, doc, template, list = RETIRED_SE
             const finding = { file: entry.file, path: entry.path, value: item, retired: entry.value };
             if (item === entry.value)
                 retired.push(finding);
-            else if (item.startsWith(stem) && !shipped.includes(item))
+            else if (item.startsWith(stem) && !listed.includes(item) && !shipped.includes(item))
                 edited.push(finding);
         }
     }
diff --git a/docs/capabilities.md b/docs/capabilities.md
index abd0d5c6a..c94038228 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -94,11 +94,11 @@ Not scanned; run the rollup with `--reachability`.
 <!-- prettier-ignore -->
 | File | Evaluates at import | Downstream files | of which tests |
 | --- | --- | --- | --- |
-| `.bkit/core/engine/shared/text.ts` | `Symbol` | 216 | 130 |
-| `.bkit/core/engine/checks/after/ci-yml.ts` | `CI_SCRIPT_UNITS.flat` | 197 | 119 |
-| `.bkit/core/engine/checks/tips/index.ts` | `STAR_TIP.replace` | 197 | 119 |
-| `.bkit/core/engine/commands/workflow/branches.ts` | `LEDGERS.map` | 197 | 119 |
-| `.bkit/core/engine/commands/workflow/workflows.ts` | `Error` | 197 | 119 |
+| `.bkit/core/engine/shared/text.ts` | `Symbol` | 226 | 137 |
+| `.bkit/core/engine/checks/after/ci-yml.ts` | `CI_SCRIPT_UNITS.flat` | 211 | 129 |
+| `.bkit/core/engine/checks/tips/index.ts` | `STAR_TIP.replace` | 211 | 129 |
+| `.bkit/core/engine/commands/workflow/branches.ts` | `LEDGERS.map` | 211 | 129 |
+| `.bkit/core/engine/commands/workflow/workflows.ts` | `Error` | 211 | 129 |
 
 1 further file nothing imports, though an entrypoint is supposed to do work when it loads. In the JSON report only.
 
@@ -127,7 +127,7 @@ flowchart LR
     n_bkit_core_engine_checks["checks<br/>265 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
     n_bkit_core_engine_commands["commands<br/>1968 symbols · 58 files"]
-    n_bkit_core_engine_install["install<br/>370 symbols · 21 files"]
+    n_bkit_core_engine_install["install<br/>378 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>241 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>157 symbols · 13 files<br/>1 open finding"]
@@ -135,7 +135,7 @@ flowchart LR
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   n_bkit_core_engine_commands -->|474| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|432| n_bkit_core_engine_shared
-  n_bkit_core_engine_commands -->|222| n_bkit_core_engine_install
+  n_bkit_core_engine_commands -->|224| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|187| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|147| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|89| n_bkit_core_engine_checks
@@ -143,9 +143,9 @@ flowchart LR
   n_bkit_core_engine_install -->|64| n_bkit_core_engine_render
   n_bkit_core_engine_commands -->|42| n_bkit_core_engine_render
   n_bkit_core_engine_cli -->|35| n_bkit_core_engine_commands
+  n_bkit_core_engine_install -->|19| n_bkit_core_engine_checks
   n_bkit_core_engine_ledgers -->|19| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|18| n_bkit_core_engine_commands
-  n_bkit_core_engine_install -->|17| n_bkit_core_engine_checks
   n_bkit_core_engine_shared -->|16| n_bkit_core_engine_install
   n_bkit_core_engine_commands -->|15| n_bkit_core_engine_cli
   nscripts_harvest -->|14| n_bkit_core_engine_ledgers
@@ -225,7 +225,7 @@ flowchart LR
     n_bkit_core_engine_install_manifest[".bkit/core/engine/install/manifest<br/>34 symbols · 1 files"]
     n_bkit_core_engine_install_modules_index[".bkit/core/engine/install/modules/index<br/>12 symbols · 1 files"]
     n_bkit_core_engine_install_version_file[".bkit/core/engine/install/version-file<br/>18 symbols · 1 files"]
-    n_bkit_core_engine_install_write[".bkit/core/engine/install/write<br/>30 symbols · 1 files"]
+    n_bkit_core_engine_install_write[".bkit/core/engine/install/write<br/>38 symbols · 1 files"]
     n_bkit_core_engine_shared_package_roots[".bkit/core/engine/shared/package-roots<br/>14 symbols · 1 files"]
   end
   subgraph gncustom_telemetry["Telemetry"]
@@ -411,6 +411,7 @@ flowchart LR
   n_bkit_core_engine_checks_before_repo -->|14| n_bkit_core_engine_shared_settings
   n_bkit_core_engine_commands_install_install -->|14| n_bkit_core_engine_render_models
   n_bkit_core_engine_commands_install_upgrade -->|14| n_bkit_core_engine_install_version_file
+  n_bkit_core_engine_commands_install_upgrade -->|14| n_bkit_core_engine_install_cloud_env
   n_bkit_core_engine_commands_workflow_branches -->|14| n_bkit_core_engine_commands_workflow_prs
   n_bkit_core_engine_commands_workflow_context -->|14| n_bkit_core_engine_commands_workflow_tests
   n_bkit_core_engine_commands_workflow_summary_findings -->|14| n_bkit_core_engine_commands_workflow_challenge
@@ -428,7 +429,6 @@ flowchart LR
   n_bkit_core_engine_install_modules_core -->|13| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_install_modules_index -->|13| n_bkit_core_engine_install_modules_core
   n_bkit_core_engine_render_hosts -->|13| n_bkit_core_engine_render_models
-  n_bkit_core_engine_commands_install_upgrade -->|12| n_bkit_core_engine_install_cloud_env
   n_bkit_core_engine_commands_install_upgrade -->|12| n_bkit_core_engine_render_models
   n_bkit_core_engine_commands_setup_setup -->|12| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_context -->|12| n_bkit_core_engine_commands_workflow_plan_blocks
@@ -568,6 +568,7 @@ flowchart LR
   n_bkit_core_engine_install_cloud_env -->|6| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_install_cloud_env -->|6| n_bkit_core_engine_install_placeholders
   n_bkit_core_engine_install_modules_antigravity -->|6| n_bkit_core_engine_render_hosts
+  n_bkit_core_engine_install_modules_claude -->|6| n_bkit_core_engine_install_cloud_env
   n_bkit_core_engine_install_modules_opencode -->|6| n_bkit_core_engine_shared_json
   n_bkit_core_engine_checks_tips_catalogue -->|6| n_bkit_core_engine_checks_before_env
   style gncustom_health_checks fill:#8250df0a,stroke:#8250df,stroke-width:2px
@@ -769,7 +770,7 @@ flowchart LR
   linkStyle 84 stroke:#59636e,stroke-width:6px
   linkStyle 85 stroke:#59636e,stroke-width:6px
   linkStyle 86 stroke:#59636e,stroke-width:6px
-  linkStyle 87 stroke:#59636eb3,stroke-width:3px
+  linkStyle 87 stroke:#59636e,stroke-width:6px
   linkStyle 88 stroke:#59636eb3,stroke-width:3px
   linkStyle 89 stroke:#59636eb3,stroke-width:3px
   linkStyle 90 stroke:#59636eb3,stroke-width:3px
@@ -911,6 +912,7 @@ flowchart LR
   linkStyle 226 stroke:#59636e80,stroke-width:2px
   linkStyle 227 stroke:#59636e80,stroke-width:2px
   linkStyle 228 stroke:#59636e80,stroke-width:2px
+  linkStyle 229 stroke:#59636e80,stroke-width:2px
 ```
 
 <!-- graphify:end -->
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index cee3b0b37..b52d65225 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -552,3 +552,4 @@
 {"schema":3,"ts":1795096336120,"firstTs":1795096336120,"updates":1,"kind":"deferral","key":"985-install-settings-merge-challenge-low-bkit-core-engine-install-write-ts-408","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["985-install-settings-merge"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A list value the current template ships again is still pruned and reported as \"retired entries bkit removes\" on every run, against the plan's edge case \"Entry equals a string the current template ships: never removed or reported\"","description":"LOW build challenge finding at .bkit/core/engine/install/write.ts:408: A list value the current template ships again is still pruned and reported as \"retired entries bkit removes\" on every run, against the plan's edge case \"Entry equals a string the current template ships: never removed or reported\". Done when: `findRetiredSettingsEntries` skips an exact retired value that `arrayAt(template, entry.path)` holds, `pruneRetiredSettingsEntries` leaves it in place (it takes the template, or `writeTier2JsonContained` filters by it), and `writeTier2JsonContained` pushes no `retired-settings-entry` advisory for it.","source":".bkit/core/engine/install/write.ts:408","status":"OPEN"}
 {"schema":3,"ts":1795096336121,"firstTs":1795096336121,"updates":1,"kind":"deferral","key":"985-install-settings-merge-challenge-low-bkit-core-engine-install-write-ts-513","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["985-install-settings-merge"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"After a real `bkit install` has already removed a retired grant, the post-install checklist still says \"retired entries bkit removes\" and \"Run bkit upgrade to remove a retired entry\", which describes nothing left to do","description":"LOW build challenge finding at .bkit/core/engine/install/write.ts:513: After a real `bkit install` has already removed a retired grant, the post-install checklist still says \"retired entries bkit removes\" and \"Run bkit upgrade to remove a retired entry\", which describes nothing left to do. Done when: a real run that pruned an entry either pushes no \"retired\" advisory part or words it as already removed, and the \"Run bkit upgrade to remove\" instruction appears only in a dry run (the `bkit check` path). The edited-copy part still appears in both.","source":".bkit/core/engine/install/write.ts:513","status":"OPEN"}
 {"schema":3,"ts":1795096336122,"firstTs":1795096336122,"updates":1,"kind":"deferral","key":"985-install-settings-merge-challenge-low-bkit-core-engine-install-write-ts-516","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["985-install-settings-merge"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"`bkit upgrade` and `bkit upgrade --dry-run` take back a permission entry while printing only `upgrade (merge): .claude/settings.json`, so the person gets no record of which grant or rule changed","description":"LOW build challenge finding at .bkit/core/engine/install/write.ts:516: `bkit upgrade` and `bkit upgrade --dry-run` take back a permission entry while printing only `upgrade (merge): .claude/settings.json`, so the person gets no record of which grant or rule changed. Done when: When `writeTier2JsonContained` runs with no `advisories` list (the `runUpgrade` walk in `.bkit/core/engine/commands/install/upgrade.ts:380`), it prints one line for each retired entry it removes, or would remove in a dry run. The line names the file, the list and the exact entry, in the same way the sibling `derived-grants-pruned` advisory in `.bkit/core/engine/install/modules/claude.ts:258` names each grant it withdraws. The existing warning for an edited entry stays as it is.","source":".bkit/core/engine/install/write.ts:516","status":"OPEN"}
+{"schema":3,"ts":1795099633003,"firstTs":1795099633003,"updates":1,"kind":"deferral","key":"985-install-settings-merge-challenge-low-bkit-core-engine-install-write-ts-366","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["985-install-settings-merge"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A consumer upgrading from bkit v0.2.0-v0.3.0 or v4.1.5-v4.10.0 silently keeps shipped grants no current release gives (`mcp__*__save_issue` and `mcp__*__save_comment` on every MCP server, `WebFetch` for `z.ai`, `kimi.com`, `moonshot.ai`, `*.nvidia.com` and `supabase.com`), because the retired list comes from a release survey that missed them","description":"LOW build challenge finding at .bkit/core/engine/install/write.ts:366: A consumer upgrading from bkit v0.2.0-v0.3.0 or v4.1.5-v4.10.0 silently keeps shipped grants no current release gives (`mcp__*__save_issue` and `mcp__*__save_comment` on every MCP server, `WebFetch` for `z.ai`, `kimi.com`, `moonshot.ai`, `*.nvidia.com` and `supabase.com`), because the retired list comes from a release survey that missed them. Done when: `RETIRED_SETTINGS_ENTRIES` holds `mcp__*__get_issue`, `mcp__*__list_issues`, `mcp__*__save_issue`, `mcp__*__list_comments` and `mcp__*__save_comment` (`.agents/templates/.claude/settings.json`, `v0.2.0` through `v0.3.0`), and `WebFetch(domain:z.ai)`, `WebFetch(domain:*.z.ai)`, `WebFetch(domain:moonshot.ai)`, `WebFetch(domain:*.moonshot.ai)`, `WebFetch(domain:kimi.com)`, `WebFetch(domain:*.kimi.com)` (`v4.9.0` through `v4.10.0`), `WebFetch(domain:*.nvidia.com)` (`v4.1.7` through `v4.10.0`) and `WebFetch(domain:supabase.com)` (`v4.1.5` through `v4.1.6`) from `.bkit/templates/.claude/settings.json`, each with a `docs/migrations.md` row naming its source tags. The plan's Source section lists every `permissions.allow` string a release tag's shipped template held (`.agents/templates/`, `.bkit/templates/` and `.bkit/shared/` copies) that HEAD neither ships nor derives through `resolveClaudeDerivedAllows`, and says which ones are on the list and which are left off because a grant HEAD still gives covers them.","source":".bkit/core/engine/install/write.ts:366","status":"OPEN"}
diff --git a/docs/migrations.md b/docs/migrations.md
index b9db7c914..582d39e24 100644
--- a/docs/migrations.md
+++ b/docs/migrations.md
@@ -44,7 +44,7 @@
 | Vale style `House` → `Bkit` | `.bkit/core/engine/install/modules/core.ts` (`migrateValeHouseStyle`, `SHIPPED_HOUSE_RULE_HASHES`, called by `runBkitDocs`) | `.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml` matching a shipped release move to `.vale/styles/Bkit/` when absent; an edited rule, a taken target or a symlinked rule stays with a warning naming the manual move; a symlinked `.vale`, `.vale/styles`, `House` or `Bkit` directory leaves the rules unmoved with a warning. `.vale.ini` `House.<moved>` → `Bkit.<moved>`; `BasedOnStyles` swaps `House` for `Bkit` once `House/` is empty (directory removed), else appends `Bkit`. Own rules stay, including an own entry named like a moved rule without `.yml` (a `Filler/` folder). Unhashed writes. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 | Slop plugin ignores inert skip text | `.bkit/core/engine/install/modules/core.ts` (`migrateSlopTypeSuppression`, `RETIRED_SLOP_PLUGIN_HASH`, called by `runBkitDocs`) | `scripts/slop/bkit-slop-type-suppression.mjs` byte-identical to the shipped v6.0.0 template → replaced with the current template. An edited copy, a non-file or a symlinked path stays with a warning to merge `.bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs` by hand. An absent or current copy stays untouched. Dry run records the same update without writing; `unhashed` keeps the copy consumer-owned. | up to 6.0.x | `.bkit/core/engine/install/modules/core.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` (fixture `tests/fixtures/slop-6.0.0/`) |
 | Project docs moved out of managed ownership | `.bkit/core/engine/install/project-docs.ts` (`syncProjectDocs`, `LEGACY_STARTER_DIGEST_HISTORY`), `.bkit/core/engine/install/managed-block.ts` (`stripManagedWrapper`); called by `runInstall` and `runUpgradeCommand` | `docs/{architecture,technology,security,data-schema,testing,deployments,observability,design,noise,setup}.md` carrying the `<!-- bkit:start -->` / `<!-- bkit:end -->` lines and the `bkit:managed` notice → those lines (and one padding blank line each) removed, every other byte kept, CRLF included. Ambiguous wrappers (missing partner, inverted, repeated, inside a code fence) and symlinked or non-file paths are kept and reported. Then `.agents/docs.md` `## Project Documents` gains a row per present default doc whose indexed equivalent row is absent, out of tree or unsafe (an equivalent is the same basename or a Scope naming "Equivalent to docs/x.md"; skipped equivalents are printed); an unreadable index is left byte-for-byte with a warning. Dry run reports the same writeset. | 5.0.0-6.1.x (every released starter, branch-agnostic normalization) | `.bkit/core/engine/install/project-docs.test.ts`; `.bkit/core/engine/install/managed-block.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
-| Retired settings entries removed | `.bkit/core/engine/install/write.ts` (`RETIRED_SETTINGS_ENTRIES`, `findRetiredSettingsEntries`, `pruneRetiredSettingsEntries`, called by `writeTier2JsonContained`) | `mcp__claude_ai_Linear__*` in `permissions.allow` of `.claude/settings.json` → removed before the list merge; shipped `v3.0.0` through `v5.4.0`, dropped in `v5.5.0` (`f57bc5942`). An edited copy (for example `mcp__claude_ai_Linear__get_issue`) no longer matches, so it is kept and install / upgrade warns; `bkit check` names a retired or edited entry (`retired-settings-entry`). A value that `resolveClaudeDerivedAllows` derives (a `Linear` row in the `mcp-servers` block) is kept and not reported. Only `permissions.allow` entries may be listed; any other path throws, naming the value and its path. Add one list line and one row here per later retired entry. | up to 5.4.x | `.bkit/core/engine/install/write.test.ts` (`mergeManagedJson`, `writeTier2JsonContained`, list-versus-migrations test); `.bkit/core/engine/install/modules/claude.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
+| Retired settings entries removed | `.bkit/core/engine/install/write.ts` (`RETIRED_SETTINGS_ENTRIES`, `findRetiredSettingsEntries`, `pruneRetiredSettingsEntries`, called by `writeTier2JsonContained`) | `mcp__claude_ai_Linear__*` in `permissions.allow` of `.claude/settings.json` → removed before the list merge; shipped `v3.0.0` through `v5.4.0`, dropped in `v5.5.0` (`f57bc5942`). The ten Linear connector tool grants `mcp__claude_ai_Linear__list_teams`, `mcp__claude_ai_Linear__list_projects`, `mcp__claude_ai_Linear__list_issues`, `mcp__claude_ai_Linear__list_issue_labels`, `mcp__claude_ai_Linear__list_issue_statuses`, `mcp__claude_ai_Linear__get_issue`, `mcp__claude_ai_Linear__get_issue_status`, `mcp__claude_ai_Linear__save_issue`, `mcp__claude_ai_Linear__list_comments`, `mcp__claude_ai_Linear__save_comment` → removed the same way; `get_issue`, `list_issues`, `save_issue`, `list_comments`, `save_comment` shipped from `v0.4.0`, the other five from `v2.0.5`, all last in `v2.2.3`. An edited copy (for example `mcp__claude_ai_Linear__my_own_tool`) no longer matches, so it is kept and install / upgrade warns; `bkit check` names a retired or edited entry (`retired-settings-entry`). A value that `resolveClaudeDerivedAllows` derives (a `Linear` row in the `mcp-servers` block) is kept and not reported. Only `permissions.allow` entries may be listed; any other path throws, naming the value and its path. Add one list line and one row here per later retired entry. | up to 5.4.x | `.bkit/core/engine/install/write.test.ts` (`mergeManagedJson`, `writeTier2JsonContained`, list-versus-migrations test); `.bkit/core/engine/install/modules/claude.integration.test.ts`; `.bkit/core/engine/commands/install/upgrade.integration.test.ts` |
 
 ## Detect-only guards
 
