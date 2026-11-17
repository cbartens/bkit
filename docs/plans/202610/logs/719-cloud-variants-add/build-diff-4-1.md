diff --git a/.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts b/.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts
index fd21aed03..800c2bf0f 100644
--- a/.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts
@@ -67,6 +67,7 @@ function extractStepScript(yaml: string, stepName: string): string {
 const rawTemplate = fs.readFileSync(TEMPLATE_PATH, "utf-8");
 const CTX_SCRIPT = hasTools ? extractStepScript(rawTemplate, "Resolve phase + brief context") : "";
 const GATE_SCRIPT = extractStepScript(rawTemplate, "Check runner credentials");
+const SELECT_SCRIPT = extractStepScript(rawTemplate, "Select agent job");
 const hasBash = spawnSync("bash", ["--version"]).status === 0;
 
 // ---------------------------------------------------------------------------
@@ -811,6 +812,12 @@ describe.skipIf(!hasBash)("bkit-cloud.yml gate step — per-job credential detec
     "ANTHROPIC_FEDERATION_RULE_ID",
     "ANTHROPIC_ORGANIZATION_ID",
     "OPENCODE_PROVIDER_KEY",
+    "OPENAI_API_KEY",
+    "BKIT_ANTHROPIC_API_KEY",
+    "BKIT_OPENCODE_API_KEY",
+    "BKIT_OPENROUTER_API_KEY",
+    "BKIT_OLLAMA_API_KEY",
+    "BKIT_OPENAI_API_KEY",
   ];
   let tmp: string;
 
@@ -822,17 +829,24 @@ describe.skipIf(!hasBash)("bkit-cloud.yml gate step — per-job credential detec
     fs.rmSync(tmp, { recursive: true, force: true });
   });
 
-  function runGate(env: Record<string, string>): {
-    stdout: string;
-    outputs: Record<string, string>;
-  } {
+  function runScript(
+    script: string,
+    env: Record<string, string>,
+    agent?: string | null,
+  ): { stdout: string; outputs: Record<string, string> } {
     const outputFile = path.join(tmp, "github-output");
     fs.writeFileSync(outputFile, "");
+    const cwd = path.join(tmp, "workspace");
+    fs.mkdirSync(cwd, { recursive: true });
+    const bkit: Record<string, unknown> = {};
+    if (agent !== undefined && agent !== null) bkit.cloud = { agent };
+    fs.writeFileSync(path.join(cwd, "package.json"), JSON.stringify({ name: "c", bkit }));
     const base = Object.fromEntries(
       Object.entries(process.env).filter(([k]) => !CREDENTIAL_VARS.includes(k)),
     );
-    const res = spawnSync("bash", ["-c", GATE_SCRIPT], {
+    const res = spawnSync("bash", ["-c", script], {
       encoding: "utf8",
+      cwd,
       env: { ...base, GITHUB_OUTPUT: outputFile, ...env },
     });
     expect(res.status).toBe(0);
@@ -844,17 +858,29 @@ describe.skipIf(!hasBash)("bkit-cloud.yml gate step — per-job credential detec
     return { stdout: res.stdout ?? "", outputs };
   }
 
-  it("ANTHROPIC_API_KEY alone enables the claude job", () => {
-    const { outputs } = runGate({ ANTHROPIC_API_KEY: "k" });
-    expect(outputs).toMatchObject({ claude: "true", opencode: "false", enabled: "true" });
+  function runGate(env: Record<string, string>) {
+    return runScript(GATE_SCRIPT, env);
+  }
+
+  function runSelect(agent: string | null, env: Record<string, string>) {
+    return runScript(SELECT_SCRIPT, env, agent);
+  }
+
+  function selectedJobs(outputs: Record<string, string>): string[] {
+    return ["claude", "opencode", "codex"].filter((j) => outputs[j] === "true");
+  }
+
+  it("BKIT_ANTHROPIC_API_KEY alone enables the run", () => {
+    const { outputs } = runGate({ BKIT_ANTHROPIC_API_KEY: "k" });
+    expect(outputs).toMatchObject({ enabled: "true" });
   });
 
-  it("both federation variables, no key, enable the claude job", () => {
+  it("both federation variables, no key, enable the run", () => {
     const { outputs, stdout } = runGate({
       ANTHROPIC_FEDERATION_RULE_ID: "fdrl_x",
       ANTHROPIC_ORGANIZATION_ID: "00000000-0000-0000-0000-000000000000",
     });
-    expect(outputs).toMatchObject({ claude: "true", enabled: "true" });
+    expect(outputs).toMatchObject({ enabled: "true" });
     expect(stdout).not.toContain("claude job no-op");
   });
 
@@ -863,14 +889,79 @@ describe.skipIf(!hasBash)("bkit-cloud.yml gate step — per-job credential detec
     ["ANTHROPIC_ORGANIZATION_ID", "ANTHROPIC_FEDERATION_RULE_ID"],
   ])("only %s set: claude job no-ops with a notice naming %s", (set, missing) => {
     const { outputs, stdout } = runGate({ [set]: "x" });
-    expect(outputs).toMatchObject({ claude: "false", enabled: "false" });
+    expect(outputs).toMatchObject({ enabled: "false" });
     expect(stdout).toMatch(new RegExp(`::notice::${missing} repo variable not set`));
   });
 
   it("no claude credential: notice names both the secret and the federation variables", () => {
-    const { outputs, stdout } = runGate({ OPENCODE_PROVIDER_KEY: "k" });
-    expect(outputs).toMatchObject({ claude: "false", opencode: "true", enabled: "true" });
-    expect(stdout).toContain("ANTHROPIC_API_KEY");
+    const { outputs, stdout } = runGate({ BKIT_OPENCODE_API_KEY: "k" });
+    expect(outputs).toMatchObject({ enabled: "true" });
+    expect(stdout).toContain("BKIT_ANTHROPIC_API_KEY");
     expect(stdout).toContain("ANTHROPIC_FEDERATION_RULE_ID");
   });
+
+  it.each([
+    ["BKIT_ANTHROPIC_API_KEY"],
+    ["BKIT_OPENCODE_API_KEY"],
+    ["BKIT_OPENROUTER_API_KEY"],
+    ["BKIT_OLLAMA_API_KEY"],
+    ["BKIT_OPENAI_API_KEY"],
+  ])("%s alone sets enabled true", (name) => {
+    expect(runGate({ [name]: "k" }).outputs.enabled).toBe("true");
+  });
+
+  it("enabled is true when any agent BKIT_ secret is set and false when none is", () => {
+    for (const legacy of ["ANTHROPIC_API_KEY", "OPENCODE_PROVIDER_KEY", "OPENAI_API_KEY"]) {
+      expect(runGate({ [legacy]: "k" }).outputs.enabled).toBe("false");
+      expect(runGate({ [legacy]: "k", BKIT_OPENAI_API_KEY: "k" }).outputs.enabled).toBe("true");
+    }
+    expect(runGate({}).outputs.enabled).toBe("false");
+  });
+
+  it("absent bkit.cloud.agent selects no job and the notice names bkit install --auto=", () => {
+    const { outputs, stdout } = runSelect(null, {
+      BKIT_ANTHROPIC_API_KEY: "k",
+      BKIT_OPENAI_API_KEY: "k",
+      BKIT_OPENROUTER_API_KEY: "k",
+    });
+    expect(selectedJobs(outputs)).toEqual([]);
+    expect(stdout).toContain("bkit install --auto=");
+  });
+
+  it("recorded claude with BKIT_ANTHROPIC_API_KEY selects only the claude job", () => {
+    const { outputs } = runSelect("claude", {
+      BKIT_ANTHROPIC_API_KEY: "k",
+      BKIT_OPENAI_API_KEY: "k",
+      BKIT_OPENCODE_API_KEY: "k",
+    });
+    expect(selectedJobs(outputs)).toEqual(["claude"]);
+    expect(outputs.agent).toBe("claude");
+  });
+
+  it("recorded codex selects only codex while BKIT_ANTHROPIC_API_KEY is also set", () => {
+    const { outputs } = runSelect("codex", {
+      BKIT_ANTHROPIC_API_KEY: "k",
+      BKIT_OPENAI_API_KEY: "k",
+    });
+    expect(selectedJobs(outputs)).toEqual(["codex"]);
+    expect(outputs.agent).toBe("codex");
+  });
+
+  it("recorded agent without its secret selects no job and names the missing secret", () => {
+    const { outputs, stdout } = runSelect("codex", {
+      BKIT_ANTHROPIC_API_KEY: "k",
+      BKIT_OPENCODE_API_KEY: "k",
+    });
+    expect(selectedJobs(outputs)).toEqual([]);
+    expect(stdout).toContain("BKIT_OPENAI_API_KEY");
+  });
+
+  it.each([["cursor"], ["none"]])("recorded %s selects no router job", (agent) => {
+    const { outputs } = runSelect(agent, {
+      BKIT_ANTHROPIC_API_KEY: "k",
+      BKIT_OPENAI_API_KEY: "k",
+      BKIT_OPENCODE_API_KEY: "k",
+    });
+    expect(selectedJobs(outputs)).toEqual([]);
+  });
 });
diff --git a/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts b/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts
index e083f4634..10b8798ff 100644
--- a/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts
@@ -22,9 +22,26 @@ describe("bkit-cloud.yml template — GitHub-only content", () => {
     expect(yml).not.toContain("mcp__jira__*");
     expect(yml).toContain("mcp__github__*");
     expect(yml).not.toMatch(/@@CLOUD_TRACKER/);
-    expect(yml).toMatch(
-      /ANTHROPIC_API_KEY: \$\{\{ secrets\.ANTHROPIC_API_KEY \}\}\n {10}GH_TOKEN:/,
-    );
+    expect(yml).toMatch(/secrets\.BKIT_ANTHROPIC_API_KEY \}\}\n {10}GH_TOKEN:/);
+  });
+
+  it("claude job reads secrets.BKIT_ANTHROPIC_API_KEY and no step names secrets.ANTHROPIC_API_KEY", () => {
+    expect(yml).toContain("secrets.BKIT_ANTHROPIC_API_KEY");
+    expect(yml).not.toMatch(/secrets\.ANTHROPIC_API_KEY/);
+  });
+
+  it("opencode dispatch maps each provider BKIT_ secret to its own env name", () => {
+    const start = yml.indexOf("- name: Dispatch /bkit-auto on opencode runner");
+    expect(start).toBeGreaterThan(-1);
+    const step = yml.slice(start);
+    for (const name of [
+      "BKIT_OPENCODE_API_KEY",
+      "BKIT_OPENROUTER_API_KEY",
+      "BKIT_OLLAMA_API_KEY",
+    ]) {
+      expect(step).toContain(`${name}: \${{ secrets.${name} }}`);
+    }
+    expect(yml).not.toContain("OPENCODE_PROVIDER_KEY");
   });
 
   it("claude step passes the four workload identity federation inputs from repo variables", () => {
diff --git a/.bkit/templates/.github/workflows/bkit-cloud.yml b/.bkit/templates/.github/workflows/bkit-cloud.yml
index 8751e298a..1d1c1fdf4 100644
--- a/.bkit/templates/.github/workflows/bkit-cloud.yml
+++ b/.bkit/templates/.github/workflows/bkit-cloud.yml
@@ -3,16 +3,18 @@
 name: bkit-cloud
 
 # Phase-routed cloud-agent workflow. One `context` job resolves the phase and its
-# argument, then TWO dispatch jobs — `claude` (via claude-code-action@v1) and `opencode`
-# (via the opencode CLI `run` subcommand) — run the same `/bkit-auto <phase> <arg>`
+# argument, then ONE dispatch job (the recorded agent) — `claude` (via claude-code-action@v1) and `opencode`
+# (via the opencode CLI `run` subcommand) — runs the same `/bkit-auto <phase> <arg>`
 # orchestrator against the committed `.claude/` / `.opencode/` config respectively.
 #
-# RUNTIME GATING — credential-presence auto-detect (in the context job):
-#   - ANTHROPIC_API_KEY secret set, OR both ANTHROPIC_FEDERATION_RULE_ID and
-#     ANTHROPIC_ORGANIZATION_ID repo variables set → claude job runs.
-#   - OPENCODE_PROVIDER_KEY set → opencode job runs.
-#   Both can run on one event (additive); a missing credential skips that job (zero
-#   billable runner minutes).
+# RUNTIME GATING — one agent per run (in the context job):
+#   - The agent recorded in package.json `bkit.cloud.agent` (claude | opencode | codex)
+#     is the only router job that starts, and only when its credential is set:
+#     claude: BKIT_ANTHROPIC_API_KEY secret, or both ANTHROPIC_FEDERATION_RULE_ID and
+#     ANTHROPIC_ORGANIZATION_ID repo variables; opencode: any of BKIT_OPENCODE_API_KEY /
+#     BKIT_OPENROUTER_API_KEY / BKIT_OLLAMA_API_KEY; codex: BKIT_OPENAI_API_KEY.
+#   - No credential-presence fallback: another agent's secret never starts a job. A missing
+#     credential or an unrecorded agent starts nothing (zero billable runner minutes).
 #
 # Trigger surfaces:
 #   - workflow_run (CI completion on feat/**): success -> ship, failure -> debug
@@ -24,13 +26,13 @@ name: bkit-cloud
 #
 # Required credentials (claude job): Claude GitHub App (one-time `/install-github-app`;
 #   claude-code-action@v1 authenticates as the App via `id-token: write` OIDC) + ONE of:
-#   - ANTHROPIC_API_KEY repo secret, or
+#   - BKIT_ANTHROPIC_API_KEY repo secret, or
 #   - workload identity federation (keyless): ANTHROPIC_FEDERATION_RULE_ID +
 #     ANTHROPIC_ORGANIZATION_ID repo variables (+ optional ANTHROPIC_SERVICE_ACCOUNT_ID /
 #     ANTHROPIC_WORKSPACE_ID) from a Claude Console federation rule. A set
-#     ANTHROPIC_API_KEY secret wins over federation — delete it when switching.
-# Required secrets (opencode job): OPENCODE_PROVIDER_KEY (any provider key the
-#   committed .opencode/opencode.json references; fan-out maps it to known env var names).
+#     BKIT_ANTHROPIC_API_KEY secret wins over federation — delete it when switching.
+# Required secrets (opencode job): one of BKIT_OPENCODE_API_KEY / BKIT_OPENROUTER_API_KEY /
+#   BKIT_OLLAMA_API_KEY (the provider the committed .opencode/opencode.json references).
 # Required tracker label on the issue: `bkit:auto` (opt-in) for the CI-driven path.
 # Docs: bkit's cloud.md § Post-CI auto-routing.
 
@@ -110,47 +112,52 @@ jobs:
       issues: read
       actions: read
     outputs:
-      claude: ${{ steps.gate.outputs.claude }}
-      opencode: ${{ steps.gate.outputs.opencode }}
+      agent: ${{ steps.select.outputs.agent }}
+      claude: ${{ steps.select.outputs.claude }}
+      opencode: ${{ steps.select.outputs.opencode }}
+      codex: ${{ steps.select.outputs.codex }}
+      dispatched: ${{ steps.select.outputs.dispatched }}
+      ignored: ${{ steps.select.outputs.ignored }}
       skip: ${{ steps.ctx.outputs.skip }}
       phase: ${{ steps.ctx.outputs.phase }}
       arg: ${{ steps.ctx.outputs.arg }}
     steps:
-      # A runner job whose credential is missing is a no-op; with neither job enabled,
-      # nothing below runs (no counter row, no checkout).
+      # With no router credential set, nothing below runs (no counter row, no checkout).
+      # Which single job starts is decided by `Select agent job` after checkout.
       - name: Check runner credentials
         id: gate
         env:
-          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
+          BKIT_ANTHROPIC_API_KEY: ${{ secrets.BKIT_ANTHROPIC_API_KEY }}
           ANTHROPIC_FEDERATION_RULE_ID: ${{ vars.ANTHROPIC_FEDERATION_RULE_ID }}
           ANTHROPIC_ORGANIZATION_ID: ${{ vars.ANTHROPIC_ORGANIZATION_ID }}
-          OPENCODE_PROVIDER_KEY: ${{ secrets.OPENCODE_PROVIDER_KEY }}
+          BKIT_OPENCODE_API_KEY: ${{ secrets.BKIT_OPENCODE_API_KEY }}
+          BKIT_OPENROUTER_API_KEY: ${{ secrets.BKIT_OPENROUTER_API_KEY }}
+          BKIT_OLLAMA_API_KEY: ${{ secrets.BKIT_OLLAMA_API_KEY }}
+          BKIT_OPENAI_API_KEY: ${{ secrets.BKIT_OPENAI_API_KEY }}
         run: |
-          claude=false
-          opencode=false
-          if [ -n "$ANTHROPIC_API_KEY" ]; then
-            claude=true
+          enabled=false
+          if [ -n "$BKIT_ANTHROPIC_API_KEY" ]; then
+            enabled=true
           elif [ -n "$ANTHROPIC_FEDERATION_RULE_ID" ] && [ -n "$ANTHROPIC_ORGANIZATION_ID" ]; then
-            claude=true
+            enabled=true
           elif [ -n "$ANTHROPIC_FEDERATION_RULE_ID" ]; then
             echo "::notice::ANTHROPIC_ORGANIZATION_ID repo variable not set — federation needs it alongside ANTHROPIC_FEDERATION_RULE_ID; claude job no-op."
           elif [ -n "$ANTHROPIC_ORGANIZATION_ID" ]; then
             echo "::notice::ANTHROPIC_FEDERATION_RULE_ID repo variable not set — federation needs it alongside ANTHROPIC_ORGANIZATION_ID; claude job no-op."
           else
-            echo "::notice::Neither the ANTHROPIC_API_KEY secret nor the ANTHROPIC_FEDERATION_RULE_ID + ANTHROPIC_ORGANIZATION_ID repo variables are set — claude job no-op."
+            echo "::notice::Neither the BKIT_ANTHROPIC_API_KEY secret nor the ANTHROPIC_FEDERATION_RULE_ID + ANTHROPIC_ORGANIZATION_ID repo variables are set — claude job no-op."
           fi
-          if [ -n "$OPENCODE_PROVIDER_KEY" ]; then
-            opencode=true
+          if [ -n "$BKIT_OPENCODE_API_KEY" ] || [ -n "$BKIT_OPENROUTER_API_KEY" ] || [ -n "$BKIT_OLLAMA_API_KEY" ]; then
+            enabled=true
           else
-            echo "::notice::OPENCODE_PROVIDER_KEY not set — opencode job no-op."
+            echo "::notice::None of BKIT_OPENCODE_API_KEY, BKIT_OPENROUTER_API_KEY, BKIT_OLLAMA_API_KEY is set — opencode job no-op."
           fi
-          enabled=false
-          if [ "$claude" = true ] || [ "$opencode" = true ]; then enabled=true; fi
-          {
-            echo "claude=$claude"
-            echo "opencode=$opencode"
-            echo "enabled=$enabled"
-          } >> "$GITHUB_OUTPUT"
+          if [ -n "$BKIT_OPENAI_API_KEY" ]; then
+            enabled=true
+          else
+            echo "::notice::BKIT_OPENAI_API_KEY not set — codex job no-op."
+          fi
+          echo "enabled=$enabled" >> "$GITHUB_OUTPUT"
 
       # SHA pins in this file — your updater refreshes them in your copy (keep this file out
       # of renovate.json5 `ignorePaths`); `bkit upgrade` lists this template when bkit's pins move.
@@ -165,6 +172,73 @@ jobs:
           # The auto-provided GITHUB_TOKEN inherits the `permissions:` block above.
           token: ${{ github.token }}
 
+      # Exactly one router job starts: the agent recorded in package.json `bkit.cloud.agent`,
+      # and only when that agent's BKIT_ secret is set. Another agent's secret never starts a
+      # job; Cursor runs through its own triggers and starts none here.
+      - name: Select agent job
+        id: select
+        if: steps.gate.outputs.enabled == 'true'
+        env:
+          BKIT_ANTHROPIC_API_KEY: ${{ secrets.BKIT_ANTHROPIC_API_KEY }}
+          ANTHROPIC_FEDERATION_RULE_ID: ${{ vars.ANTHROPIC_FEDERATION_RULE_ID }}
+          ANTHROPIC_ORGANIZATION_ID: ${{ vars.ANTHROPIC_ORGANIZATION_ID }}
+          BKIT_OPENCODE_API_KEY: ${{ secrets.BKIT_OPENCODE_API_KEY }}
+          BKIT_OPENROUTER_API_KEY: ${{ secrets.BKIT_OPENROUTER_API_KEY }}
+          BKIT_OLLAMA_API_KEY: ${{ secrets.BKIT_OLLAMA_API_KEY }}
+          BKIT_OPENAI_API_KEY: ${{ secrets.BKIT_OPENAI_API_KEY }}
+        run: |
+          AGENT=$(jq -r '.bkit.cloud.agent // empty | strings' package.json 2>/dev/null || true)
+          AGENT="${AGENT:-none}"
+          claude=false
+          opencode=false
+          codex=false
+          dispatched=""
+          ignored=""
+          missing=""
+          have_claude=false
+          if [ -n "$BKIT_ANTHROPIC_API_KEY" ] || { [ -n "$ANTHROPIC_FEDERATION_RULE_ID" ] && [ -n "$ANTHROPIC_ORGANIZATION_ID" ]; }; then have_claude=true; fi
+          have_opencode=false
+          if [ -n "$BKIT_OPENCODE_API_KEY" ] || [ -n "$BKIT_OPENROUTER_API_KEY" ] || [ -n "$BKIT_OLLAMA_API_KEY" ]; then have_opencode=true; fi
+          have_codex=false
+          if [ -n "$BKIT_OPENAI_API_KEY" ]; then have_codex=true; fi
+          case "$AGENT" in
+            claude)
+              if [ "$have_claude" = true ]; then claude=true; dispatched=claude
+              else missing="BKIT_ANTHROPIC_API_KEY (or the ANTHROPIC_FEDERATION_RULE_ID + ANTHROPIC_ORGANIZATION_ID repo variables)"; fi
+              ;;
+            opencode)
+              if [ "$have_opencode" = true ]; then opencode=true; dispatched=opencode
+              else missing="one of BKIT_OPENCODE_API_KEY, BKIT_OPENROUTER_API_KEY, BKIT_OLLAMA_API_KEY"; fi
+              ;;
+            codex)
+              if [ "$have_codex" = true ]; then codex=true; dispatched=codex
+              else missing="BKIT_OPENAI_API_KEY"; fi
+              ;;
+            cursor)
+              echo "::notice::bkit.cloud.agent is 'cursor' — Cursor runs through its own native triggers; no router job starts."
+              ;;
+            *)
+              echo "::notice::bkit.cloud.agent is '$AGENT' — no router job starts. Run bkit install --auto=<claude|opencode|codex> to record one."
+              ;;
+          esac
+          if [ -n "$missing" ]; then
+            echo "::notice::bkit.cloud.agent is '$AGENT' but its credential is not set (missing $missing) — no router job starts."
+          fi
+          [ "$have_claude" = true ] && [ "$AGENT" != claude ] && ignored="${ignored:+$ignored }claude"
+          [ "$have_opencode" = true ] && [ "$AGENT" != opencode ] && ignored="${ignored:+$ignored }opencode"
+          [ "$have_codex" = true ] && [ "$AGENT" != codex ] && ignored="${ignored:+$ignored }codex"
+          if [ -n "$ignored" ]; then
+            echo "::notice::Ignoring credentials for other agents ($ignored) — only the recorded agent '$AGENT' dispatches."
+          fi
+          {
+            echo "agent=$AGENT"
+            echo "claude=$claude"
+            echo "opencode=$opencode"
+            echo "codex=$codex"
+            echo "dispatched=$dispatched"
+            echo "ignored=$ignored"
+          } >> "$GITHUB_OUTPUT"
+
       - name: Configure git user
         if: steps.gate.outputs.enabled == 'true'
         run: |
@@ -463,7 +537,7 @@ jobs:
           } >> "$GITHUB_OUTPUT"
 
   # ---------------------------------------------------------------------------
-  # claude job — dispatch via claude-code-action@v1 (ANTHROPIC_API_KEY or federation).
+  # claude job — dispatch via claude-code-action@v1 (BKIT_ANTHROPIC_API_KEY or federation).
   # Runs only when the context job found a claude credential and resolved a phase.
   # OIDC auth via Claude GitHub App (id-token: write); requires one-time
   # `/install-github-app` in the consumer repo.
@@ -532,16 +606,14 @@ jobs:
           anthropic_service_account_id: ${{ vars.ANTHROPIC_SERVICE_ACCOUNT_ID }}
           anthropic_workspace_id: ${{ vars.ANTHROPIC_WORKSPACE_ID }}
         env:
-          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
+          ANTHROPIC_API_KEY: ${{ secrets.BKIT_ANTHROPIC_API_KEY }}
           GH_TOKEN: ${{ github.token }}
 
   # ---------------------------------------------------------------------------
-  # opencode job — dispatch via `opencode run` CLI (OPENCODE_PROVIDER_KEY required).
-  # Runs only when the context job found OPENCODE_PROVIDER_KEY set and resolved a phase.
+  # opencode job — dispatch via `opencode run` CLI (a provider BKIT_ secret required).
+  # Runs only when `Select agent job` chose opencode and the context job resolved a phase.
   # The committed .opencode/opencode.json provides provider config + model pins —
   # no model is hard-coded in this YAML. No OIDC / Claude identity.
-  # OPENCODE_PROVIDER_KEY is fanned out to all known provider env var names so the
-  # opencode.json ${VAR} reference resolves regardless of which provider is installed.
   # ---------------------------------------------------------------------------
   opencode:
     name: bkit-cloud-opencode (${{ github.event_name }})
@@ -579,15 +651,12 @@ jobs:
       - name: Dispatch /bkit-auto on opencode runner
         env:
           GH_TOKEN: ${{ github.token }}
-          # Fan out the single OPENCODE_PROVIDER_KEY secret to every supported cloud provider's
-          # env var name, so the committed .opencode/opencode.json {env:VAR} reference resolves
-          # regardless of which provider the consumer installed (openrouter/ollama/opencode).
-          # `opencode` (the opencode-native Zen gateway) reads BKIT_OPENCODE_API_KEY. No Claude
-          # identity leak — ANTHROPIC_API_KEY is absent.
-          BKIT_OPENROUTER_API_KEY: ${{ secrets.OPENCODE_PROVIDER_KEY }}
-          BKIT_OLLAMA_API_KEY: ${{ secrets.OPENCODE_PROVIDER_KEY }}
-          BKIT_OPENCODE_API_KEY: ${{ secrets.OPENCODE_PROVIDER_KEY }}
-          OPENCODE_PROVIDER_KEY: ${{ secrets.OPENCODE_PROVIDER_KEY }}
+          # Each provider secret maps to its same-named env var, so the committed
+          # .opencode/opencode.json {env:VAR} reference resolves for the installed provider.
+          # No Claude identity leak — ANTHROPIC_API_KEY is absent.
+          BKIT_OPENCODE_API_KEY: ${{ secrets.BKIT_OPENCODE_API_KEY }}
+          BKIT_OPENROUTER_API_KEY: ${{ secrets.BKIT_OPENROUTER_API_KEY }}
+          BKIT_OLLAMA_API_KEY: ${{ secrets.BKIT_OLLAMA_API_KEY }}
           # Pass phase/arg via env to avoid ${{ }} expansion in run: shell string (injection guard).
           BKIT_PHASE: ${{ needs.context.outputs.phase }}
           BKIT_ARG: ${{ needs.context.outputs.arg }}
diff --git a/.github/workflows/bkit-cloud.yml b/.github/workflows/bkit-cloud.yml
index f3b8a1aaa..037be79b2 100644
--- a/.github/workflows/bkit-cloud.yml
+++ b/.github/workflows/bkit-cloud.yml
@@ -3,16 +3,18 @@
 name: bkit-cloud
 
 # Phase-routed cloud-agent workflow. One `context` job resolves the phase and its
-# argument, then TWO dispatch jobs — `claude` (via claude-code-action@v1) and `opencode`
-# (via the opencode CLI `run` subcommand) — run the same `/bkit-auto <phase> <arg>`
+# argument, then ONE dispatch job (the recorded agent) — `claude` (via claude-code-action@v1) and `opencode`
+# (via the opencode CLI `run` subcommand) — runs the same `/bkit-auto <phase> <arg>`
 # orchestrator against the committed `.claude/` / `.opencode/` config respectively.
 #
-# RUNTIME GATING — credential-presence auto-detect (in the context job):
-#   - ANTHROPIC_API_KEY secret set, OR both ANTHROPIC_FEDERATION_RULE_ID and
-#     ANTHROPIC_ORGANIZATION_ID repo variables set → claude job runs.
-#   - OPENCODE_PROVIDER_KEY set → opencode job runs.
-#   Both can run on one event (additive); a missing credential skips that job (zero
-#   billable runner minutes).
+# RUNTIME GATING — one agent per run (in the context job):
+#   - The agent recorded in package.json `bkit.cloud.agent` (claude | opencode | codex)
+#     is the only router job that starts, and only when its credential is set:
+#     claude: BKIT_ANTHROPIC_API_KEY secret, or both ANTHROPIC_FEDERATION_RULE_ID and
+#     ANTHROPIC_ORGANIZATION_ID repo variables; opencode: any of BKIT_OPENCODE_API_KEY /
+#     BKIT_OPENROUTER_API_KEY / BKIT_OLLAMA_API_KEY; codex: BKIT_OPENAI_API_KEY.
+#   - No credential-presence fallback: another agent's secret never starts a job. A missing
+#     credential or an unrecorded agent starts nothing (zero billable runner minutes).
 #
 # Trigger surfaces:
 #   - workflow_run (CI completion on feat/**): success -> ship, failure -> debug
@@ -24,13 +26,13 @@ name: bkit-cloud
 #
 # Required credentials (claude job): Claude GitHub App (one-time `/install-github-app`;
 #   claude-code-action@v1 authenticates as the App via `id-token: write` OIDC) + ONE of:
-#   - ANTHROPIC_API_KEY repo secret, or
+#   - BKIT_ANTHROPIC_API_KEY repo secret, or
 #   - workload identity federation (keyless): ANTHROPIC_FEDERATION_RULE_ID +
 #     ANTHROPIC_ORGANIZATION_ID repo variables (+ optional ANTHROPIC_SERVICE_ACCOUNT_ID /
 #     ANTHROPIC_WORKSPACE_ID) from a Claude Console federation rule. A set
-#     ANTHROPIC_API_KEY secret wins over federation — delete it when switching.
-# Required secrets (opencode job): OPENCODE_PROVIDER_KEY (any provider key the
-#   committed .opencode/opencode.json references; fan-out maps it to known env var names).
+#     BKIT_ANTHROPIC_API_KEY secret wins over federation — delete it when switching.
+# Required secrets (opencode job): one of BKIT_OPENCODE_API_KEY / BKIT_OPENROUTER_API_KEY /
+#   BKIT_OLLAMA_API_KEY (the provider the committed .opencode/opencode.json references).
 # Required tracker label on the issue: `bkit:auto` (opt-in) for the CI-driven path.
 # Docs: bkit's cloud.md § Post-CI auto-routing.
 
@@ -110,47 +112,52 @@ jobs:
       issues: read
       actions: read
     outputs:
-      claude: ${{ steps.gate.outputs.claude }}
-      opencode: ${{ steps.gate.outputs.opencode }}
+      agent: ${{ steps.select.outputs.agent }}
+      claude: ${{ steps.select.outputs.claude }}
+      opencode: ${{ steps.select.outputs.opencode }}
+      codex: ${{ steps.select.outputs.codex }}
+      dispatched: ${{ steps.select.outputs.dispatched }}
+      ignored: ${{ steps.select.outputs.ignored }}
       skip: ${{ steps.ctx.outputs.skip }}
       phase: ${{ steps.ctx.outputs.phase }}
       arg: ${{ steps.ctx.outputs.arg }}
     steps:
-      # A runner job whose credential is missing is a no-op; with neither job enabled,
-      # nothing below runs (no counter row, no checkout).
+      # With no router credential set, nothing below runs (no counter row, no checkout).
+      # Which single job starts is decided by `Select agent job` after checkout.
       - name: Check runner credentials
         id: gate
         env:
-          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
+          BKIT_ANTHROPIC_API_KEY: ${{ secrets.BKIT_ANTHROPIC_API_KEY }}
           ANTHROPIC_FEDERATION_RULE_ID: ${{ vars.ANTHROPIC_FEDERATION_RULE_ID }}
           ANTHROPIC_ORGANIZATION_ID: ${{ vars.ANTHROPIC_ORGANIZATION_ID }}
-          OPENCODE_PROVIDER_KEY: ${{ secrets.OPENCODE_PROVIDER_KEY }}
+          BKIT_OPENCODE_API_KEY: ${{ secrets.BKIT_OPENCODE_API_KEY }}
+          BKIT_OPENROUTER_API_KEY: ${{ secrets.BKIT_OPENROUTER_API_KEY }}
+          BKIT_OLLAMA_API_KEY: ${{ secrets.BKIT_OLLAMA_API_KEY }}
+          BKIT_OPENAI_API_KEY: ${{ secrets.BKIT_OPENAI_API_KEY }}
         run: |
-          claude=false
-          opencode=false
-          if [ -n "$ANTHROPIC_API_KEY" ]; then
-            claude=true
+          enabled=false
+          if [ -n "$BKIT_ANTHROPIC_API_KEY" ]; then
+            enabled=true
           elif [ -n "$ANTHROPIC_FEDERATION_RULE_ID" ] && [ -n "$ANTHROPIC_ORGANIZATION_ID" ]; then
-            claude=true
+            enabled=true
           elif [ -n "$ANTHROPIC_FEDERATION_RULE_ID" ]; then
             echo "::notice::ANTHROPIC_ORGANIZATION_ID repo variable not set — federation needs it alongside ANTHROPIC_FEDERATION_RULE_ID; claude job no-op."
           elif [ -n "$ANTHROPIC_ORGANIZATION_ID" ]; then
             echo "::notice::ANTHROPIC_FEDERATION_RULE_ID repo variable not set — federation needs it alongside ANTHROPIC_ORGANIZATION_ID; claude job no-op."
           else
-            echo "::notice::Neither the ANTHROPIC_API_KEY secret nor the ANTHROPIC_FEDERATION_RULE_ID + ANTHROPIC_ORGANIZATION_ID repo variables are set — claude job no-op."
+            echo "::notice::Neither the BKIT_ANTHROPIC_API_KEY secret nor the ANTHROPIC_FEDERATION_RULE_ID + ANTHROPIC_ORGANIZATION_ID repo variables are set — claude job no-op."
           fi
-          if [ -n "$OPENCODE_PROVIDER_KEY" ]; then
-            opencode=true
+          if [ -n "$BKIT_OPENCODE_API_KEY" ] || [ -n "$BKIT_OPENROUTER_API_KEY" ] || [ -n "$BKIT_OLLAMA_API_KEY" ]; then
+            enabled=true
           else
-            echo "::notice::OPENCODE_PROVIDER_KEY not set — opencode job no-op."
+            echo "::notice::None of BKIT_OPENCODE_API_KEY, BKIT_OPENROUTER_API_KEY, BKIT_OLLAMA_API_KEY is set — opencode job no-op."
           fi
-          enabled=false
-          if [ "$claude" = true ] || [ "$opencode" = true ]; then enabled=true; fi
-          {
-            echo "claude=$claude"
-            echo "opencode=$opencode"
-            echo "enabled=$enabled"
-          } >> "$GITHUB_OUTPUT"
+          if [ -n "$BKIT_OPENAI_API_KEY" ]; then
+            enabled=true
+          else
+            echo "::notice::BKIT_OPENAI_API_KEY not set — codex job no-op."
+          fi
+          echo "enabled=$enabled" >> "$GITHUB_OUTPUT"
 
       # SHA pins in this file — your updater refreshes them in your copy (keep this file out
       # of renovate.json5 `ignorePaths`); `bkit upgrade` lists this template when bkit's pins move.
@@ -165,6 +172,73 @@ jobs:
           # The auto-provided GITHUB_TOKEN inherits the `permissions:` block above.
           token: ${{ github.token }}
 
+      # Exactly one router job starts: the agent recorded in package.json `bkit.cloud.agent`,
+      # and only when that agent's BKIT_ secret is set. Another agent's secret never starts a
+      # job; Cursor runs through its own triggers and starts none here.
+      - name: Select agent job
+        id: select
+        if: steps.gate.outputs.enabled == 'true'
+        env:
+          BKIT_ANTHROPIC_API_KEY: ${{ secrets.BKIT_ANTHROPIC_API_KEY }}
+          ANTHROPIC_FEDERATION_RULE_ID: ${{ vars.ANTHROPIC_FEDERATION_RULE_ID }}
+          ANTHROPIC_ORGANIZATION_ID: ${{ vars.ANTHROPIC_ORGANIZATION_ID }}
+          BKIT_OPENCODE_API_KEY: ${{ secrets.BKIT_OPENCODE_API_KEY }}
+          BKIT_OPENROUTER_API_KEY: ${{ secrets.BKIT_OPENROUTER_API_KEY }}
+          BKIT_OLLAMA_API_KEY: ${{ secrets.BKIT_OLLAMA_API_KEY }}
+          BKIT_OPENAI_API_KEY: ${{ secrets.BKIT_OPENAI_API_KEY }}
+        run: |
+          AGENT=$(jq -r '.bkit.cloud.agent // empty | strings' package.json 2>/dev/null || true)
+          AGENT="${AGENT:-none}"
+          claude=false
+          opencode=false
+          codex=false
+          dispatched=""
+          ignored=""
+          missing=""
+          have_claude=false
+          if [ -n "$BKIT_ANTHROPIC_API_KEY" ] || { [ -n "$ANTHROPIC_FEDERATION_RULE_ID" ] && [ -n "$ANTHROPIC_ORGANIZATION_ID" ]; }; then have_claude=true; fi
+          have_opencode=false
+          if [ -n "$BKIT_OPENCODE_API_KEY" ] || [ -n "$BKIT_OPENROUTER_API_KEY" ] || [ -n "$BKIT_OLLAMA_API_KEY" ]; then have_opencode=true; fi
+          have_codex=false
+          if [ -n "$BKIT_OPENAI_API_KEY" ]; then have_codex=true; fi
+          case "$AGENT" in
+            claude)
+              if [ "$have_claude" = true ]; then claude=true; dispatched=claude
+              else missing="BKIT_ANTHROPIC_API_KEY (or the ANTHROPIC_FEDERATION_RULE_ID + ANTHROPIC_ORGANIZATION_ID repo variables)"; fi
+              ;;
+            opencode)
+              if [ "$have_opencode" = true ]; then opencode=true; dispatched=opencode
+              else missing="one of BKIT_OPENCODE_API_KEY, BKIT_OPENROUTER_API_KEY, BKIT_OLLAMA_API_KEY"; fi
+              ;;
+            codex)
+              if [ "$have_codex" = true ]; then codex=true; dispatched=codex
+              else missing="BKIT_OPENAI_API_KEY"; fi
+              ;;
+            cursor)
+              echo "::notice::bkit.cloud.agent is 'cursor' — Cursor runs through its own native triggers; no router job starts."
+              ;;
+            *)
+              echo "::notice::bkit.cloud.agent is '$AGENT' — no router job starts. Run bkit install --auto=<claude|opencode|codex> to record one."
+              ;;
+          esac
+          if [ -n "$missing" ]; then
+            echo "::notice::bkit.cloud.agent is '$AGENT' but its credential is not set (missing $missing) — no router job starts."
+          fi
+          [ "$have_claude" = true ] && [ "$AGENT" != claude ] && ignored="${ignored:+$ignored }claude"
+          [ "$have_opencode" = true ] && [ "$AGENT" != opencode ] && ignored="${ignored:+$ignored }opencode"
+          [ "$have_codex" = true ] && [ "$AGENT" != codex ] && ignored="${ignored:+$ignored }codex"
+          if [ -n "$ignored" ]; then
+            echo "::notice::Ignoring credentials for other agents ($ignored) — only the recorded agent '$AGENT' dispatches."
+          fi
+          {
+            echo "agent=$AGENT"
+            echo "claude=$claude"
+            echo "opencode=$opencode"
+            echo "codex=$codex"
+            echo "dispatched=$dispatched"
+            echo "ignored=$ignored"
+          } >> "$GITHUB_OUTPUT"
+
       - name: Configure git user
         if: steps.gate.outputs.enabled == 'true'
         run: |
@@ -463,7 +537,7 @@ jobs:
           } >> "$GITHUB_OUTPUT"
 
   # ---------------------------------------------------------------------------
-  # claude job — dispatch via claude-code-action@v1 (ANTHROPIC_API_KEY or federation).
+  # claude job — dispatch via claude-code-action@v1 (BKIT_ANTHROPIC_API_KEY or federation).
   # Runs only when the context job found a claude credential and resolved a phase.
   # OIDC auth via Claude GitHub App (id-token: write); requires one-time
   # `/install-github-app` in the consumer repo.
@@ -532,16 +606,14 @@ jobs:
           anthropic_service_account_id: ${{ vars.ANTHROPIC_SERVICE_ACCOUNT_ID }}
           anthropic_workspace_id: ${{ vars.ANTHROPIC_WORKSPACE_ID }}
         env:
-          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
+          ANTHROPIC_API_KEY: ${{ secrets.BKIT_ANTHROPIC_API_KEY }}
           GH_TOKEN: ${{ github.token }}
 
   # ---------------------------------------------------------------------------
-  # opencode job — dispatch via `opencode run` CLI (OPENCODE_PROVIDER_KEY required).
-  # Runs only when the context job found OPENCODE_PROVIDER_KEY set and resolved a phase.
+  # opencode job — dispatch via `opencode run` CLI (a provider BKIT_ secret required).
+  # Runs only when `Select agent job` chose opencode and the context job resolved a phase.
   # The committed .opencode/opencode.json provides provider config + model pins —
   # no model is hard-coded in this YAML. No OIDC / Claude identity.
-  # OPENCODE_PROVIDER_KEY is fanned out to all known provider env var names so the
-  # opencode.json ${VAR} reference resolves regardless of which provider is installed.
   # ---------------------------------------------------------------------------
   opencode:
     name: bkit-cloud-opencode (${{ github.event_name }})
@@ -579,15 +651,12 @@ jobs:
       - name: Dispatch /bkit-auto on opencode runner
         env:
           GH_TOKEN: ${{ github.token }}
-          # Fan out the single OPENCODE_PROVIDER_KEY secret to every supported cloud provider's
-          # env var name, so the committed .opencode/opencode.json {env:VAR} reference resolves
-          # regardless of which provider the consumer installed (openrouter/ollama/opencode).
-          # `opencode` (the opencode-native Zen gateway) reads BKIT_OPENCODE_API_KEY. No Claude
-          # identity leak — ANTHROPIC_API_KEY is absent.
-          BKIT_OPENROUTER_API_KEY: ${{ secrets.OPENCODE_PROVIDER_KEY }}
-          BKIT_OLLAMA_API_KEY: ${{ secrets.OPENCODE_PROVIDER_KEY }}
-          BKIT_OPENCODE_API_KEY: ${{ secrets.OPENCODE_PROVIDER_KEY }}
-          OPENCODE_PROVIDER_KEY: ${{ secrets.OPENCODE_PROVIDER_KEY }}
+          # Each provider secret maps to its same-named env var, so the committed
+          # .opencode/opencode.json {env:VAR} reference resolves for the installed provider.
+          # No Claude identity leak — ANTHROPIC_API_KEY is absent.
+          BKIT_OPENCODE_API_KEY: ${{ secrets.BKIT_OPENCODE_API_KEY }}
+          BKIT_OPENROUTER_API_KEY: ${{ secrets.BKIT_OPENROUTER_API_KEY }}
+          BKIT_OLLAMA_API_KEY: ${{ secrets.BKIT_OLLAMA_API_KEY }}
           # Pass phase/arg via env to avoid ${{ }} expansion in run: shell string (injection guard).
           BKIT_PHASE: ${{ needs.context.outputs.phase }}
           BKIT_ARG: ${{ needs.context.outputs.arg }}
