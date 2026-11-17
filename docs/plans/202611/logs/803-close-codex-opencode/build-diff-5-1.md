diff --git a/.bkit/version b/.bkit/version
index b308b2f39..0c5f789f0 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -13,7 +13,7 @@
     ".gitignore": "7b18419d0469def99a4a9c05f28e734f6258b2e60755c640a041a84b4d60275b",
     ".mcp.json": "65b29f1bb28dd6296d1dc8ea34aca4826d9ca072d7cef9d2971a7045280505d9",
     ".bkit/.env.example": "33195c635ab4b35dea8990a278bb28193f4b5f331dcbdc5c975aeb5f51743e41",
-    ".opencode/opencode.json": "83dbad6e236be57944702da355ea2d823db481408f14a4b9f522225d2ed27d75",
+    ".opencode/opencode.json": "5f7083b545f71c00f88f5bd08b441ac1ce8e61616ef54a7a21c6001c84c3d000",
     ".claude/commands/bkit-auto.md": "2fb94062947b55466f7baed87ee27347e2626d6a43200691ff68cb7f62a0947f",
     ".claude/commands/bkit-build.md": "a82369810095a5fc09772a0a81477c1f1aee18bf317cd1d633499ee340d78952",
     ".claude/commands/bkit-debug.md": "025f3de595d6365f43d4f986b5e06e36c8ffa6441c7eb61be34f05150a3f7912",
diff --git a/.opencode/opencode.json b/.opencode/opencode.json
index 4f7e77037..f85ffe616 100644
--- a/.opencode/opencode.json
+++ b/.opencode/opencode.json
@@ -179,169 +179,7 @@
       "git -* push* -6f*": "deny",
       "*bkit*tests jump*": "ask",
       "*cli.js tests jump*": "ask",
-      "*cli.ts tests jump*": "ask",
-      "curl *12factor.net*": "allow",
-      "wget *12factor.net*": "allow",
-      "curl *agents.md*": "allow",
-      "wget *agents.md*": "allow",
-      "curl *agentskills.io*": "allow",
-      "wget *agentskills.io*": "allow",
-      "curl *anthropic.com*": "allow",
-      "wget *anthropic.com*": "allow",
-      "curl *artificialanalysis.ai*": "allow",
-      "wget *artificialanalysis.ai*": "allow",
-      "curl *atlassian.com*": "allow",
-      "wget *atlassian.com*": "allow",
-      "curl *c4model.com*": "allow",
-      "wget *c4model.com*": "allow",
-      "curl *cabforum.org*": "allow",
-      "wget *cabforum.org*": "allow",
-      "curl *chatgpt.com*": "allow",
-      "wget *chatgpt.com*": "allow",
-      "curl *claude.com*": "allow",
-      "wget *claude.com*": "allow",
-      "curl *commonmark.org*": "allow",
-      "wget *commonmark.org*": "allow",
-      "curl *cursor.com*": "allow",
-      "wget *cursor.com*": "allow",
-      "curl *datacurve.ai*": "allow",
-      "wget *datacurve.ai*": "allow",
-      "curl *depot.dev*": "allow",
-      "wget *depot.dev*": "allow",
-      "curl *designarena.ai*": "allow",
-      "wget *designarena.ai*": "allow",
-      "curl *diataxis.fr*": "allow",
-      "wget *diataxis.fr*": "allow",
-      "curl *direnv.net*": "allow",
-      "wget *direnv.net*": "allow",
-      "curl *docker.com*": "allow",
-      "wget *docker.com*": "allow",
-      "curl *docker.io*": "allow",
-      "wget *docker.io*": "allow",
-      "curl *dora.dev*": "allow",
-      "wget *dora.dev*": "allow",
-      "curl *endoflife.date*": "allow",
-      "wget *endoflife.date*": "allow",
-      "curl *etsi.org*": "allow",
-      "wget *etsi.org*": "allow",
-      "curl *europa.eu*": "allow",
-      "wget *europa.eu*": "allow",
-      "curl *finops.org*": "allow",
-      "wget *finops.org*": "allow",
-      "curl *git-scm.com*": "allow",
-      "wget *git-scm.com*": "allow",
-      "curl *github.com*": "allow",
-      "wget *github.com*": "allow",
-      "curl *github.io*": "allow",
-      "wget *github.io*": "allow",
-      "curl *githubcopilot.com*": "allow",
-      "wget *githubcopilot.com*": "allow",
-      "curl *githubusercontent.com*": "allow",
-      "wget *githubusercontent.com*": "allow",
-      "curl *gnu.org*": "allow",
-      "wget *gnu.org*": "allow",
-      "curl *google.dev*": "allow",
-      "wget *google.dev*": "allow",
-      "curl *ico.org.uk*": "allow",
-      "wget *ico.org.uk*": "allow",
-      "curl *ietf.org*": "allow",
-      "wget *ietf.org*": "allow",
-      "curl *iso.org*": "allow",
-      "wget *iso.org*": "allow",
-      "curl *jqlang.org*": "allow",
-      "wget *jqlang.org*": "allow",
-      "curl *json-schema.org*": "allow",
-      "wget *json-schema.org*": "allow",
-      "curl *kanbanguides.org*": "allow",
-      "wget *kanbanguides.org*": "allow",
-      "curl *linear.app*": "allow",
-      "wget *linear.app*": "allow",
-      "curl *livebench.ai*": "allow",
-      "wget *livebench.ai*": "allow",
-      "curl *lmarena.ai*": "allow",
-      "wget *lmarena.ai*": "allow",
-      "curl *mend.io*": "allow",
-      "wget *mend.io*": "allow",
-      "curl *mitre.org*": "allow",
-      "wget *mitre.org*": "allow",
-      "curl *modelcontextprotocol.io*": "allow",
-      "wget *modelcontextprotocol.io*": "allow",
-      "curl *models.dev*": "allow",
-      "wget *models.dev*": "allow",
-      "curl *mozilla.org*": "allow",
-      "wget *mozilla.org*": "allow",
-      "curl *nist.gov*": "allow",
-      "wget *nist.gov*": "allow",
-      "curl *nngroup.com*": "allow",
-      "wget *nngroup.com*": "allow",
-      "curl *nodejs.org*": "allow",
-      "wget *nodejs.org*": "allow",
-      "curl *nodesource.com*": "allow",
-      "wget *nodesource.com*": "allow",
-      "curl *npmjs.com*": "allow",
-      "wget *npmjs.com*": "allow",
-      "curl *npmjs.org*": "allow",
-      "wget *npmjs.org*": "allow",
-      "curl *ollama.com*": "allow",
-      "wget *ollama.com*": "allow",
-      "curl *openai.com*": "allow",
-      "wget *openai.com*": "allow",
-      "curl *opencode.ai*": "allow",
-      "wget *opencode.ai*": "allow",
-      "curl *opengroup.org*": "allow",
-      "wget *opengroup.org*": "allow",
-      "curl *openrouter.ai*": "allow",
-      "wget *openrouter.ai*": "allow",
-      "curl *openssf.org*": "allow",
-      "wget *openssf.org*": "allow",
-      "curl *opentelemetry.io*": "allow",
-      "wget *opentelemetry.io*": "allow",
-      "curl *owasp.org*": "allow",
-      "wget *owasp.org*": "allow",
-      "curl *pnpm.io*": "allow",
-      "wget *pnpm.io*": "allow",
-      "curl *prettier.io*": "allow",
-      "wget *prettier.io*": "allow",
-      "curl *publicsuffix.org*": "allow",
-      "wget *publicsuffix.org*": "allow",
-      "curl *renovatebot.com*": "allow",
-      "wget *renovatebot.com*": "allow",
-      "curl *rfc-editor.org*": "allow",
-      "wget *rfc-editor.org*": "allow",
-      "curl *schema.org*": "allow",
-      "wget *schema.org*": "allow",
-      "curl *schemastore.org*": "allow",
-      "wget *schemastore.org*": "allow",
-      "curl *scrumguides.org*": "allow",
-      "wget *scrumguides.org*": "allow",
-      "curl *semver.org*": "allow",
-      "wget *semver.org*": "allow",
-      "curl *shellcheck.net*": "allow",
-      "wget *shellcheck.net*": "allow",
-      "curl *skills.sh*": "allow",
-      "wget *skills.sh*": "allow",
-      "curl *slsa.dev*": "allow",
-      "wget *slsa.dev*": "allow",
-      "curl *spdx.org*": "allow",
-      "wget *spdx.org*": "allow",
-      "curl *sre.google*": "allow",
-      "wget *sre.google*": "allow",
-      "curl *tavily.com*": "allow",
-      "wget *tavily.com*": "allow",
-      "curl *tc39.es*": "allow",
-      "wget *tc39.es*": "allow",
-      "curl *typescriptlang.org*": "allow",
-      "wget *typescriptlang.org*": "allow",
-      "curl *vale.sh*": "allow",
-      "wget *vale.sh*": "allow",
-      "curl *vite.dev*": "allow",
-      "wget *vite.dev*": "allow",
-      "curl *vitest.dev*": "allow",
-      "wget *vitest.dev*": "allow",
-      "curl *w3.org*": "allow",
-      "wget *w3.org*": "allow",
-      "curl *yaml.org*": "allow",
-      "wget *yaml.org*": "allow"
+      "*cli.ts tests jump*": "ask"
     },
     "github_*": "allow",
     "serena_*": "allow"
diff --git a/DETAILS.md b/DETAILS.md
index c92263423..c5fdb2a0c 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -345,7 +345,7 @@ config:
 flowchart LR
   %% Generated by bkit-graphify-rollup.py — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
-    n_bkit_core_engine_checks["checks<br/>256 symbols · 18 files"]
+    n_bkit_core_engine_checks["checks<br/>261 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
     n_bkit_core_engine_commands["commands<br/>1857 symbols · 54 files"]
     n_bkit_core_engine_install["install<br/>359 symbols · 21 files"]
@@ -356,10 +356,10 @@ flowchart LR
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   n_bkit_core_engine_commands -->|467| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|411| n_bkit_core_engine_shared
-  n_bkit_core_engine_commands -->|220| n_bkit_core_engine_install
+  n_bkit_core_engine_commands -->|218| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|181| n_bkit_core_engine_shared
-  n_bkit_core_engine_checks -->|145| n_bkit_core_engine_shared
-  n_bkit_core_engine_commands -->|84| n_bkit_core_engine_checks
+  n_bkit_core_engine_checks -->|147| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|89| n_bkit_core_engine_checks
   n_bkit_core_engine_checks -->|81| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|64| n_bkit_core_engine_render
   n_bkit_core_engine_commands -->|42| n_bkit_core_engine_render
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 8e082c7a0..9c9666f92 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -162,7 +162,7 @@ config:
 flowchart LR
   %% Generated by bkit-graphify-rollup.py — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
-    n_bkit_core_engine_checks["checks<br/>256 symbols · 18 files"]
+    n_bkit_core_engine_checks["checks<br/>261 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
     n_bkit_core_engine_commands["commands<br/>1857 symbols · 54 files"]
     n_bkit_core_engine_install["install<br/>359 symbols · 21 files"]
@@ -173,10 +173,10 @@ flowchart LR
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
   n_bkit_core_engine_commands -->|467| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|411| n_bkit_core_engine_shared
-  n_bkit_core_engine_commands -->|220| n_bkit_core_engine_install
+  n_bkit_core_engine_commands -->|218| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|181| n_bkit_core_engine_shared
-  n_bkit_core_engine_checks -->|145| n_bkit_core_engine_shared
-  n_bkit_core_engine_commands -->|84| n_bkit_core_engine_checks
+  n_bkit_core_engine_checks -->|147| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|89| n_bkit_core_engine_checks
   n_bkit_core_engine_checks -->|81| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|64| n_bkit_core_engine_render
   n_bkit_core_engine_commands -->|42| n_bkit_core_engine_render
@@ -286,7 +286,7 @@ flowchart LR
       subgraph gn_bkit_core_engine_checks_before[".bkit/core/engine/checks/before"]
         n_bkit_core_engine_checks_before_context_fetch["context-fetch<br/>20 symbols · 1 files"]
         n_bkit_core_engine_checks_before_env["env<br/>8 symbols · 1 files"]
-        n_bkit_core_engine_checks_before_files["files<br/>8 symbols · 1 files"]
+        n_bkit_core_engine_checks_before_files["files<br/>13 symbols · 1 files"]
         n_bkit_core_engine_checks_before_repo["repo<br/>13 symbols · 1 files"]
       end
       n_bkit_core_engine_checks_status_holes["status-holes<br/>46 symbols · 1 files"]
@@ -446,6 +446,7 @@ flowchart LR
   n_bkit_core_engine_install_modules_core -->|14| n_bkit_core_engine_install_version_file
   nscripts_harvest -->|14| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_checks_after_index -->|13| n_bkit_core_engine_checks_after_tools
+  n_bkit_core_engine_checks_before_index -->|13| n_bkit_core_engine_checks_before_files
   n_bkit_core_engine_commands_ci_ci -->|13| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_workflow_context -->|13| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_run_facts -->|13| n_bkit_core_engine_ledgers_telemetry
@@ -495,7 +496,6 @@ flowchart LR
   n_bkit_core_engine_commands_install_upgrade -->|9| n_bkit_core_engine_install_template_copies
   n_bkit_core_engine_checks_after_ci_yml -->|9| n_bkit_core_engine_shared_settings
   n_bkit_core_engine_checks_after_index -->|9| n_bkit_core_engine_checks_before_env
-  n_bkit_core_engine_checks_before_index -->|9| n_bkit_core_engine_checks_before_files
   n_bkit_core_engine_commands_install_install -->|9| n_bkit_core_engine_checks_after_index
   n_bkit_core_engine_commands_install_uninstall -->|9| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_commands_workflow_challenge -->|9| n_bkit_core_engine_commands_workflow_plan_blocks
@@ -569,7 +569,6 @@ flowchart LR
   n_bkit_core_engine_commands_install_install -->|6| n_bkit_core_engine_commands_install_uninstall
   n_bkit_core_engine_commands_install_uninstall -->|6| n_bkit_core_engine_install_managed_block
   n_bkit_core_engine_commands_install_uninstall -->|6| n_bkit_core_engine_shared_json
-  n_bkit_core_engine_commands_install_uninstall -->|6| n_bkit_core_engine_install_cloud_env
   n_bkit_core_engine_commands_install_upgrade -->|6| n_bkit_core_engine_shared_package_json
   n_bkit_core_engine_commands_install_upgrade -->|6| n_bkit_core_engine_install_write
   n_bkit_core_engine_commands_land -->|6| n_bkit_core_engine_commands_ci_ci
@@ -783,7 +782,7 @@ flowchart LR
   linkStyle 75 stroke:#59636e,stroke-width:6px
   linkStyle 76 stroke:#59636e,stroke-width:6px
   linkStyle 77 stroke:#59636e,stroke-width:6px
-  linkStyle 78 stroke:#59636eb3,stroke-width:3px
+  linkStyle 78 stroke:#59636e,stroke-width:6px
   linkStyle 79 stroke:#59636eb3,stroke-width:3px
   linkStyle 80 stroke:#59636eb3,stroke-width:3px
   linkStyle 81 stroke:#59636eb3,stroke-width:3px
@@ -924,5 +923,4 @@ flowchart LR
   linkStyle 216 stroke:#59636e80,stroke-width:2px
   linkStyle 217 stroke:#59636e80,stroke-width:2px
   linkStyle 218 stroke:#59636e80,stroke-width:2px
-  linkStyle 219 stroke:#59636e80,stroke-width:2px
 ```
diff --git a/docs/testing.md b/docs/testing.md
index 92d034f96..369cb9609 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -675,6 +675,8 @@ Validated-head carry-forward = Tier 1: `commands/workflow/runs.test.ts` (`--vali
 
 `tests/shell/bkit-cloud-bootstrap-preflight.bats` isolates the gh-preflight block inside `.claude/hooks/bkit-cloud-bootstrap.sh` (a tmp git `CLAUDE_PROJECT_DIR` with no `pnpm-lock.yaml`/`.vale.ini`/`.agents/context.md` self-skips the rest of the hook; its `node_modules/.bin/bkit` shims the built `dist/cli.js`, which the hook's `bkit runtime detect` probe and `bkit context list-blocks` provisioning call) — covers: the loud skip without bkit; provision recipes from below `bkit:end` only; sanctioned `GH_TOKEN`/`GITHUB_TOKEN` env preferred over `gh auth login --with-token`; `RUNTIME_GITHUBCLI` recorded loudly every run; the dual-lane WARNING (non-blocking, because SessionStart hooks cannot hard-stop a session) firing only when `BKIT_GH_TOKEN`/`GH_TOKEN`/`GITHUB_TOKEN` are ALL unset.
 
+The same file's `fingerprint:` cases cover the allowlist-fingerprint compare: a warning with the refresh steps when `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` is unset; a warning naming both fingerprints when they differ; a match reported as operator-asserted with the deployed allowlist unverified; a warning when `.bkit/allowlist.json` has no fingerprint or `jq` is absent; a value that is not 8 hex characters rejected without being echoed; invalid `.bkit/allowlist.json` JSON. Every case warns and continues (exit 0).
+
 `BKIT_CLOUD_BOOTSTRAP_SH` overrides the template-relative default script path.
 
 <!-- prettier-ignore -->
@@ -884,6 +886,8 @@ const violations = runGrader({ parentSha, phase: "ship", gitAdapter: realGitAdap
 | OpenCode reconverge on upgrade | `.bkit/core/engine/install/write.integration.test.ts` | consumer keys in `opencode.json` survive; bkit keys reconverged |
 | GateGuard OpenCode plugin | `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` | advisory fires, subagents included, dedup, docs density advisory, managed-block boundary |
 | GateGuard markered-text | `.bkit/core/engine/install/modules/claude.integration.test.ts`, `.bkit/core/engine/commands/install/upgrade.test.ts`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | install and upgrade engines: fresh install writes the slash-comment block, a marker-less consumer file gets the block appended, upgrade round-trip refreshes the block while preserving consumer content outside it |
+| no generated shell fetch allows | `.bkit/core/engine/install/modules/opencode.integration.test.ts` | install writes no `curl *{domain}*` / `wget *{domain}*` allows; consumer `allowed-domains` reach only the fetch tool (`webfetch`, decision 551) |
+| legacy substring fetch grants detector | `.bkit/core/engine/checks/before/files.test.ts` | `opencode-substring-fetch-grants` lists each substring `curl` / `wget` allow with its removal action; grants are reported, never rewritten |
 | end-to-end (manual) | `e2e-verdict.md` (Task 5.1) | § Manual recipe — OpenCode E2E |
 
 ## Manual recipe — OpenCode E2E (Task 5.1)
