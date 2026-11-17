diff --git a/.bkit/core/engine/checks/after/auth.test.ts b/.bkit/core/engine/checks/after/auth.test.ts
index 8bcd59e86..16b7ef21c 100644
--- a/.bkit/core/engine/checks/after/auth.test.ts
+++ b/.bkit/core/engine/checks/after/auth.test.ts
@@ -254,6 +254,154 @@ describe("detectCiRouterSecrets", () => {
   });
 });
 
+// ---------------------------------------------------------------------------
+// detectCiRouterSecrets — per-variant, per-tracker secret findings (TASK 14)
+// ---------------------------------------------------------------------------
+
+describe("detectCiRouterSecrets per variant", () => {
+  const CURRENT =
+    "name: bkit-cloud\n  K: ${{ secrets.BKIT_X }}\n  anthropic_federation_rule_id: x\n";
+  const LEGACY =
+    "name: bkit-cloud\n  K: ${{ secrets.ANTHROPIC_API_KEY }}\n  anthropic_federation_rule_id: x\n";
+
+  function setup(opts: {
+    agent: string;
+    tracker?: string;
+    provider?: string;
+    router?: string;
+  }): void {
+    const bkit: Record<string, unknown> = {
+      cloud: { agent: opts.agent },
+      tracker: { default: opts.tracker ?? "github" },
+    };
+    if (opts.provider)
+      bkit.providers = { opencode: { default: opts.provider, installed: [opts.provider] } };
+    fs.writeFileSync(
+      path.join(tmpDir, "package.json"),
+      JSON.stringify({ name: "c", version: "1.0.0", bkit }),
+    );
+    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
+    fs.writeFileSync(
+      path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"),
+      opts.router ?? CURRENT,
+    );
+  }
+  const text = (f: { detect: string; action: string }) => `${f.detect}\n${f.action}`;
+
+  it("%s tracker without its BKIT_ secret gives cloud-router-tracker-secret-missing naming it", () => {
+    const keys: Record<string, string> = {
+      linear: "BKIT_LINEAR_API_KEY",
+      jira: "BKIT_JIRA_API_KEY",
+    };
+    for (const tracker of ["linear", "jira"]) {
+      setup({ agent: "claude", tracker });
+      mockGhNames({ secret: ["BKIT_ANTHROPIC_API_KEY"], variable: [] });
+      const finding = detectCiRouterSecrets(tmpDir).find(
+        (f) => f.id === "cloud-router-tracker-secret-missing",
+      );
+      expect(finding, tracker).toBeDefined();
+      expect(text(finding!), tracker).toContain(keys[tracker]!);
+      for (const other of Object.keys(keys).filter((k) => k !== tracker))
+        expect(text(finding!), tracker).not.toContain(keys[other]!);
+    }
+  });
+
+  it("cloud.agent codex without BKIT_OPENAI_API_KEY gives codex-api-key-secret-missing", () => {
+    setup({ agent: "codex" });
+    mockGhNames({ secret: [], variable: [] });
+    const findings = detectCiRouterSecrets(tmpDir);
+    const finding = findings.find((f) => f.id === "codex-api-key-secret-missing");
+    expect(finding).toBeDefined();
+    expect(text(finding!)).toContain("BKIT_OPENAI_API_KEY");
+    expect(findings.map((f) => f.id)).not.toContain("anthropic-api-key-secret-missing");
+  });
+
+  it("anthropic findings fire only for cloud.agent claude, under BKIT_ANTHROPIC_API_KEY", () => {
+    const anthropicIds = [
+      "anthropic-api-key-secret-missing",
+      "anthropic-api-key-shadows-federation",
+      "anthropic-federation-template-stale",
+    ];
+    setup({ agent: "codex" });
+    mockGhNames({ secret: [], variable: [] });
+    for (const f of detectCiRouterSecrets(tmpDir)) expect(anthropicIds).not.toContain(f.id);
+    setup({ agent: "opencode", provider: "openrouter" });
+    mockGhNames({ secret: [], variable: [] });
+    for (const f of detectCiRouterSecrets(tmpDir)) expect(anthropicIds).not.toContain(f.id);
+    setup({ agent: "claude" });
+    mockGhNames({ secret: [], variable: [] });
+    const missing = detectCiRouterSecrets(tmpDir).find(
+      (f) => f.id === "anthropic-api-key-secret-missing",
+    );
+    expect(missing).toBeDefined();
+    expect(missing!.action).toContain("gh secret set BKIT_ANTHROPIC_API_KEY");
+    expect(missing!.action).not.toContain("gh secret set ANTHROPIC_API_KEY");
+  });
+
+  it("legacy ANTHROPIC_API_KEY without BKIT_ANTHROPIC_API_KEY gives cloud-router-secret-renamed", () => {
+    setup({ agent: "claude" });
+    mockGhNames({ secret: ["ANTHROPIC_API_KEY"], variable: [] });
+    const finding = detectCiRouterSecrets(tmpDir).find(
+      (f) => f.id === "cloud-router-secret-renamed",
+    );
+    expect(finding).toBeDefined();
+    expect(finding!.action).toContain("gh secret set BKIT_ANTHROPIC_API_KEY");
+    expect(finding!.action).toContain("gh secret delete ANTHROPIC_API_KEY");
+  });
+
+  it("legacy OPENCODE_PROVIDER_KEY without the provider key gives cloud-router-secret-renamed naming that key", () => {
+    setup({ agent: "opencode", provider: "opencode-go" });
+    mockGhNames({ secret: ["OPENCODE_PROVIDER_KEY"], variable: [] });
+    const finding = detectCiRouterSecrets(tmpDir).find(
+      (f) => f.id === "cloud-router-secret-renamed",
+    );
+    expect(finding).toBeDefined();
+    expect(finding!.action).toContain("gh secret set BKIT_OPENCODE_API_KEY");
+    expect(finding!.action).toContain("gh secret delete OPENCODE_PROVIDER_KEY");
+    setup({ agent: "opencode", provider: "openrouter" });
+    const other = detectCiRouterSecrets(tmpDir).find((f) => f.id === "cloud-router-secret-renamed");
+    expect(other!.action).toContain("gh secret set BKIT_OPENROUTER_API_KEY");
+    expect(other!.action).not.toContain("BKIT_OPENCODE_API_KEY");
+  });
+
+  it("adopted copy still reading legacy secret names gets legacy-name findings and no cloud-router-secret-renamed", () => {
+    setup({ agent: "claude", router: LEGACY });
+    mockGhNames({ secret: ["ANTHROPIC_API_KEY"], variable: [] });
+    expect(detectCiRouterSecrets(tmpDir).map((f) => f.id)).not.toContain(
+      "cloud-router-secret-renamed",
+    );
+    setup({ agent: "claude", router: CURRENT });
+    const renamed = detectCiRouterSecrets(tmpDir).find(
+      (f) => f.id === "cloud-router-secret-renamed",
+    );
+    expect(renamed).toBeDefined();
+    expect(renamed!.action).toContain("gh secret set BKIT_ANTHROPIC_API_KEY");
+    expect(renamed!.action).toContain("gh secret delete ANTHROPIC_API_KEY");
+    setup({ agent: "claude", router: LEGACY });
+    mockGhNames({ secret: [], variable: [] });
+    const missing = detectCiRouterSecrets(tmpDir).find(
+      (f) => f.id === "anthropic-api-key-secret-missing",
+    );
+    expect(missing).toBeDefined();
+    expect(missing!.action).toContain("gh secret set ANTHROPIC_API_KEY");
+    expect(missing!.action).not.toContain("BKIT_ANTHROPIC_API_KEY");
+  });
+
+  it("dashboards router section names the recorded variant's BKIT_ secret", () => {
+    const cases: Array<[Parameters<typeof setup>[0], string]> = [
+      [{ agent: "claude" }, "BKIT_ANTHROPIC_API_KEY"],
+      [{ agent: "codex" }, "BKIT_OPENAI_API_KEY"],
+      [{ agent: "opencode", provider: "openrouter" }, "BKIT_OPENROUTER_API_KEY"],
+    ];
+    for (const [opts, secret] of cases) {
+      setup(opts);
+      const action = buildCloudDashboardsAdvisory(tmpDir)!.action;
+      expect(action, opts.agent).toContain(secret);
+      expect(action, opts.agent).not.toContain("gh secret set ANTHROPIC_API_KEY");
+    }
+  });
+});
+
 // ---------------------------------------------------------------------------
 // buildCloudDashboardsAdvisory
 // ---------------------------------------------------------------------------
diff --git a/.bkit/core/engine/checks/after/auth.ts b/.bkit/core/engine/checks/after/auth.ts
index 54e7364a9..41bcafe05 100644
--- a/.bkit/core/engine/checks/after/auth.ts
+++ b/.bkit/core/engine/checks/after/auth.ts
@@ -6,6 +6,8 @@ import * as path from "node:path";
 import { spawnSync } from "node:child_process";
 import type { PreflightFinding } from "../before/index.js";
 import { readJsonFile } from "../../shared/json.js";
+import { readBkitConfig } from "../../shared/settings.js";
+import { OPENCODE_PROVIDER_DEFAULTS } from "../../shared/egress.js";
 
 // ---------------------------------------------------------------------------
 // Token-surface detectors
@@ -137,13 +139,24 @@ export function buildCloudDashboardsAdvisory(cwd: string): PreflightFinding | nu
 
   const sections: string[] = [];
   if (hasRouter) {
-    sections.push(
+    const config = readBkitConfig(cwd);
+    const agent = config.cloudAgents === "none" ? "claude" : config.cloudAgents;
+    let secret = "BKIT_ANTHROPIC_API_KEY";
+    if (agent === "codex") secret = "BKIT_OPENAI_API_KEY";
+    else if (agent === "opencode")
+      secret = config.opencodeProvider
+        ? OPENCODE_PROVIDER_DEFAULTS[config.opencodeProvider].envVar
+        : "BKIT_<PROVIDER>_API_KEY";
+    let text =
       "**GitHub Actions** (used by bkit-cloud.yml and your own workflows):\n" +
-        "       gh secret set ANTHROPIC_API_KEY --body='<value>'\n\n" +
-        "       Verify: `gh secret list | grep -E 'ANTHROPIC_API_KEY'`\n\n" +
+      `       gh secret set ${secret} --body='<value>'\n\n` +
+      `       Verify: \`gh secret list | grep -E '${secret}'\`\n\n`;
+    if (agent === "claude")
+      text +=
         "       Keyless alternative for bkit-cloud.yml (workload identity federation): leave the secret unset and set the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables (`gh variable set`) from a Claude Console federation rule.\n\n" +
-        "       ANTHROPIC_API_KEY is read from the Anthropic dashboard (https://console.anthropic.com/settings/keys); `.bkit/.env` holds the same value as BKIT_ANTHROPIC_API_KEY. The Claude GitHub App (`/install-github-app`) is also required for `cloud=claude`.",
-    );
+        "       BKIT_ANTHROPIC_API_KEY is read from the Anthropic dashboard (https://console.anthropic.com/settings/keys); `.bkit/.env` holds the same value. The Claude GitHub App (`/install-github-app`) is also required for `cloud=claude`.";
+    else text += `       \`.bkit/.env\` holds the same value as ${secret}.`;
+    sections.push(text);
   }
   for (const [, text] of present) sections.push(text);
   return {
@@ -162,66 +175,124 @@ export function buildCloudDashboardsAdvisory(cwd: string): PreflightFinding | nu
 /** Repo variables that, both set, switch bkit-cloud.yml's claude job to workload identity federation. */
 const FEDERATION_VARIABLES = ["ANTHROPIC_FEDERATION_RULE_ID", "ANTHROPIC_ORGANIZATION_ID"];
 
+const LEGACY_ANTHROPIC = "ANTHROPIC_API_KEY";
+const BKIT_ANTHROPIC = "BKIT_ANTHROPIC_API_KEY";
+
 /**
- * Detect whether `bkit-cloud.yml`'s claude job has a credential. Only fires when
- * `.github/workflows/bkit-cloud.yml` exists. The claude job (claude-code-action) takes the
- * `ANTHROPIC_API_KEY` repo secret OR workload identity federation (both
- * `FEDERATION_VARIABLES` repo variables). The workflow is GitHub-tracker only — no
- * `BKIT_LINEAR_API_KEY` dependency. Silent when gh cannot list secrets; when only the
- * variables are unlistable, a missing key still raises the missing-credential finding.
+ * Secret findings for the adopted `bkit-cloud.yml`, per recorded variant and tracker.
+ * Only fires when `.github/workflows/bkit-cloud.yml` exists. Every finding is keyed on the
+ * secret names the adopted copy reads (`secrets.BKIT_` sniff): a legacy copy keeps its
+ * legacy names and gets no rename finding; a current copy gets `BKIT_` names plus
+ * `cloud-router-secret-renamed` when only the legacy twin is set. Claude: the key secret or
+ * workload identity federation (both `FEDERATION_VARIABLES` repo variables). Codex:
+ * `BKIT_OPENAI_API_KEY`. Linear / Jira: the tracker key (current copies only). Silent when
+ * gh cannot list secrets; when only the variables are unlistable, a missing key still
+ * raises the missing-credential finding.
  */
 export function detectCiRouterSecrets(cwd: string): PreflightFinding[] {
   const routerPath = path.join(cwd, ".github", "workflows", "bkit-cloud.yml");
   if (!fs.existsSync(routerPath)) return [];
-  const key = detectGhSecret("ANTHROPIC_API_KEY");
-  if (key === "unknown") return [];
-  const variables = listGhNames("variable");
-  const federated = variables !== null && FEDERATION_VARIABLES.every((v) => variables.includes(v));
+  const names = listGhNames("secret");
+  if (names === null) return [];
+  const content = fs.readFileSync(routerPath, "utf-8");
+  const legacy = !content.includes("secrets.BKIT_");
+  const config = readBkitConfig(cwd);
+  const agent = config.cloudAgents === "none" ? "claude" : config.cloudAgents;
+  const findings: PreflightFinding[] = [];
+
+  if (!legacy && (config.issueTracker === "linear" || config.issueTracker === "jira")) {
+    const tk = config.issueTracker === "linear" ? "BKIT_LINEAR_API_KEY" : "BKIT_JIRA_API_KEY";
+    if (!names.includes(tk))
+      findings.push({
+        id: "cloud-router-tracker-secret-missing",
+        severity: "advisory",
+        detect: `The \`${tk}\` repo secret is not set. The router reads the \`bkit:auto\` label from ${config.issueTracker} with it; without it the router starts no agent.`,
+        action: `\`gh secret set ${tk} --body='<paste-value-here>'\`, then verify with \`gh secret list\`.`,
+      });
+  }
 
-  if (key === "present" && federated) {
-    return [
-      {
-        id: "anthropic-api-key-shadows-federation",
+  if (agent === "codex") {
+    if (!legacy && !names.includes("BKIT_OPENAI_API_KEY"))
+      findings.push({
+        id: "codex-api-key-secret-missing",
         severity: "advisory",
         detect:
-          "The `ANTHROPIC_API_KEY` repo secret and the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables are all set. claude-code-action uses the key and skips workload identity federation.",
+          "`bkit.cloud.agent` is `codex` but the `BKIT_OPENAI_API_KEY` repo secret is not set; the codex job exits no-op.",
         action:
-          "To run keyless, delete the secret: `gh secret delete ANTHROPIC_API_KEY`. To stay on the key, delete the variables: `gh variable delete ANTHROPIC_FEDERATION_RULE_ID` and `gh variable delete ANTHROPIC_ORGANIZATION_ID`.",
-      },
-    ];
+          "`gh secret set BKIT_OPENAI_API_KEY --body='<paste-value-here>'`, then verify with `gh secret list`.",
+      });
+    return findings;
   }
-  if (key === "present") return [];
+
+  if (agent === "opencode") {
+    const envVar = config.opencodeProvider
+      ? OPENCODE_PROVIDER_DEFAULTS[config.opencodeProvider].envVar
+      : null;
+    if (!legacy && envVar && names.includes("OPENCODE_PROVIDER_KEY") && !names.includes(envVar))
+      findings.push({
+        id: "cloud-router-secret-renamed",
+        severity: "advisory",
+        detect: `The legacy \`OPENCODE_PROVIDER_KEY\` repo secret is set but \`${envVar}\`, the name the router now reads, is not.`,
+        action: `\`gh secret set ${envVar} --body='<same-value>'\`, then \`gh secret delete OPENCODE_PROVIDER_KEY\`.`,
+      });
+    return findings;
+  }
+
+  if (agent !== "claude") return findings;
+
+  const keyName = legacy ? LEGACY_ANTHROPIC : BKIT_ANTHROPIC;
+  if (!legacy && names.includes(LEGACY_ANTHROPIC) && !names.includes(BKIT_ANTHROPIC)) {
+    findings.push({
+      id: "cloud-router-secret-renamed",
+      severity: "advisory",
+      detect: `The legacy \`${LEGACY_ANTHROPIC}\` repo secret is set but \`${BKIT_ANTHROPIC}\`, the name the router now reads, is not.`,
+      action: `\`gh secret set ${BKIT_ANTHROPIC} --body='<same-value>'\`, then \`gh secret delete ${LEGACY_ANTHROPIC}\`.`,
+    });
+    return findings;
+  }
+  const keyPresent = names.includes(keyName);
+  const variables = listGhNames("variable");
+  const federated = variables !== null && FEDERATION_VARIABLES.every((v) => variables.includes(v));
+
+  if (keyPresent && federated) {
+    findings.push({
+      id: "anthropic-api-key-shadows-federation",
+      severity: "advisory",
+      detect: `The \`${keyName}\` repo secret and the \`ANTHROPIC_FEDERATION_RULE_ID\` + \`ANTHROPIC_ORGANIZATION_ID\` repo variables are all set. claude-code-action uses the key and skips workload identity federation.`,
+      action: `To run keyless, delete the secret: \`gh secret delete ${keyName}\`. To stay on the key, delete the variables: \`gh variable delete ANTHROPIC_FEDERATION_RULE_ID\` and \`gh variable delete ANTHROPIC_ORGANIZATION_ID\`.`,
+    });
+    return findings;
+  }
+  if (keyPresent) return findings;
 
   if (federated) {
-    if (fs.readFileSync(routerPath, "utf-8").includes("anthropic_federation_rule_id:")) return [];
-    return [
-      {
+    if (!content.includes("anthropic_federation_rule_id:"))
+      findings.push({
         id: "anthropic-federation-template-stale",
         severity: "advisory",
         detect:
           "The `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables are set, but `.github/workflows/bkit-cloud.yml` does not pass `anthropic_federation_rule_id` to claude-code-action — the claude job exits no-op.",
         action:
           "Re-copy the template: `cp .bkit/templates/.github/workflows/bkit-cloud.yml .github/workflows/bkit-cloud.yml`, then re-apply your own edits (the `runs-on` runner at minimum).",
-      },
-    ];
+      });
+    return findings;
   }
 
-  return [
-    {
-      id: "anthropic-api-key-secret-missing",
-      severity: "advisory",
-      detect:
-        variables === null
-          ? "gh confirms the `ANTHROPIC_API_KEY` repo secret is not set on this GitHub repo, and could not list repo variables to check for the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` federation variables."
-          : "gh confirms neither the `ANTHROPIC_API_KEY` repo secret nor both `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables are set on this GitHub repo.",
-      action:
-        "`.github/workflows/bkit-cloud.yml`'s claude job needs one claude credential; without it, the job exits no-op. Set ONE of:\n\n" +
-        "- API key:\n\n    gh secret set ANTHROPIC_API_KEY --body='<paste-value-here>'\n\n" +
-        "- Workload identity federation (keyless): Claude Console → Settings → Workload identity → Connect workload → GitHub Actions creates the issuer, service account and federation rule. Then:\n\n" +
-        "    gh variable set ANTHROPIC_FEDERATION_RULE_ID --body='fdrl_...'\n" +
-        "    gh variable set ANTHROPIC_ORGANIZATION_ID --body='<organization-uuid>'\n\n" +
-        "  Optional: `ANTHROPIC_SERVICE_ACCOUNT_ID` (`svac_...`) and `ANTHROPIC_WORKSPACE_ID` (`wrkspc_...`, needed when the rule covers more than one workspace).\n\n" +
-        "Then verify: `gh secret list` / `gh variable list`. The workflow itself does not need redeploying — both are read at run time.",
-    },
-  ];
+  findings.push({
+    id: "anthropic-api-key-secret-missing",
+    severity: "advisory",
+    detect:
+      variables === null
+        ? `gh confirms the \`${keyName}\` repo secret is not set on this GitHub repo, and could not list repo variables to check for the \`ANTHROPIC_FEDERATION_RULE_ID\` + \`ANTHROPIC_ORGANIZATION_ID\` federation variables.`
+        : `gh confirms neither the \`${keyName}\` repo secret nor both \`ANTHROPIC_FEDERATION_RULE_ID\` + \`ANTHROPIC_ORGANIZATION_ID\` repo variables are set on this GitHub repo.`,
+    action:
+      "`.github/workflows/bkit-cloud.yml`'s claude job needs one claude credential; without it, the job exits no-op. Set ONE of:\n\n" +
+      `- API key:\n\n    gh secret set ${keyName} --body='<paste-value-here>'\n\n` +
+      "- Workload identity federation (keyless): Claude Console → Settings → Workload identity → Connect workload → GitHub Actions creates the issuer, service account and federation rule. Then:\n\n" +
+      "    gh variable set ANTHROPIC_FEDERATION_RULE_ID --body='fdrl_...'\n" +
+      "    gh variable set ANTHROPIC_ORGANIZATION_ID --body='<organization-uuid>'\n\n" +
+      "  Optional: `ANTHROPIC_SERVICE_ACCOUNT_ID` (`svac_...`) and `ANTHROPIC_WORKSPACE_ID` (`wrkspc_...`, needed when the rule covers more than one workspace).\n\n" +
+      "Then verify: `gh secret list` / `gh variable list`. The workflow itself does not need redeploying — both are read at run time.",
+  });
+  return findings;
 }
diff --git a/.bkit/core/engine/checks/after/github.test.ts b/.bkit/core/engine/checks/after/github.test.ts
index abda998df..fd2748650 100644
--- a/.bkit/core/engine/checks/after/github.test.ts
+++ b/.bkit/core/engine/checks/after/github.test.ts
@@ -372,7 +372,11 @@ describe("buildCloudSetupAdvisory", () => {
     fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
     fs.writeFileSync(
       path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"),
-      "name: bkit-auto\n",
+      "name: bkit-auto\npermissions:\n  id-token: write\nenv:\n  K: ${{ secrets.BKIT_ANTHROPIC_API_KEY }}\n",
+    );
+    fs.writeFileSync(
+      path.join(tmpDir, "package.json"),
+      JSON.stringify({ name: "x", bkit: { cloud: { agent: "claude" } } }),
     );
     const result = buildCloudSetupAdvisory(tmpDir);
     expect(result).not.toBeNull();
@@ -417,15 +421,6 @@ describe("buildCloudSetupAdvisory", () => {
     expect(buildCloudSetupAdvisory(tmpDir)?.id).toBe("cloud-router-none");
   });
 
-  it("jira tracker: no nudge (Jira runs locally only)", () => {
-    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
-    fs.writeFileSync(
-      path.join(tmpDir, "package.json"),
-      JSON.stringify({ name: "x", bkit: { tracker: { default: "jira" } } }),
-    );
-    expect(buildCloudSetupAdvisory(tmpDir)).toBeNull();
-  });
-
   it("router presence wins over a stale bkit.cloud.agent=none field", () => {
     fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
     fs.writeFileSync(
@@ -440,6 +435,84 @@ describe("buildCloudSetupAdvisory", () => {
     expect(result).not.toBeNull();
     expect(result!.id).toBe("cloud-router");
   });
+
+  // ---- TASK 13: stale-router sniffs, per-variant text, agent-unset ----
+
+  const writeRouter = (content: string, agent?: string, tracker?: string) => {
+    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
+    fs.writeFileSync(path.join(tmpDir, ".github", "workflows", "bkit-cloud.yml"), content);
+    const bkit: Record<string, unknown> = {};
+    if (agent) bkit.cloud = { agent };
+    if (tracker) bkit.tracker = { default: tracker };
+    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "x", bkit }));
+  };
+  const STALE = "# serves the GitHub tracker only\n";
+
+  it("adopted copy serving the GitHub tracker only under %s gives cloud-router-tracker-stale", () => {
+    for (const tracker of ["linear", "jira"]) {
+      writeRouter(`${STALE}permissions:\n  id-token: write\nsecrets.BKIT_X\n`, "claude", tracker);
+      expect(buildCloudSetupAdvisory(tmpDir)?.id, tracker).toBe("cloud-router-tracker-stale");
+    }
+  });
+
+  it("adopted copy without openai/codex-action under cloud.agent codex gives cloud-router-codex-missing", () => {
+    writeRouter("name: bkit-auto\nsecrets.BKIT_X\n", "codex", "github");
+    expect(buildCloudSetupAdvisory(tmpDir)?.id).toBe("cloud-router-codex-missing");
+  });
+
+  it("missing id-token wins over tracker-stale and tracker-stale over codex-missing", () => {
+    writeRouter(`${STALE}secrets.BKIT_X\n`, "claude", "linear");
+    expect(buildCloudSetupAdvisory(tmpDir)?.id).toBe("cloud-claude-missing-id-token");
+    writeRouter(`${STALE}id-token: write\nsecrets.BKIT_X\n`, "claude", "linear");
+    expect(buildCloudSetupAdvisory(tmpDir)?.id).toBe("cloud-router-tracker-stale");
+    writeRouter(`${STALE}secrets.BKIT_X\n`, "codex", "linear");
+    expect(buildCloudSetupAdvisory(tmpDir)?.id).toBe("cloud-router-tracker-stale");
+    writeRouter("secrets.BKIT_X\n", "codex", "linear");
+    expect(buildCloudSetupAdvisory(tmpDir)?.id).toBe("cloud-router-codex-missing");
+  });
+
+  it("cloud-claude-missing-id-token action names the template re-copy, not --tracker=github", () => {
+    writeRouter("name: bkit-auto\nsecrets.BKIT_X\n", "claude", "github");
+    const result = buildCloudSetupAdvisory(tmpDir);
+    expect(result?.id).toBe("cloud-claude-missing-id-token");
+    expect(result!.action).not.toContain("--tracker=github");
+    expect(result!.action).toMatch(/template/i);
+    expect(result!.action).toMatch(/re-copy/i);
+  });
+
+  it("jira tracker without a router gets the tracker-neutral cloud-router-none nudge", () => {
+    fs.mkdirSync(path.join(tmpDir, ".github", "workflows"), { recursive: true });
+    fs.writeFileSync(
+      path.join(tmpDir, "package.json"),
+      JSON.stringify({ name: "x", bkit: { tracker: { default: "jira" } } }),
+    );
+    const result = buildCloudSetupAdvisory(tmpDir);
+    expect(result?.id).toBe("cloud-router-none");
+    expect(result!.action).toMatch(/bkit install --auto=/);
+    expect(result!.action).not.toContain("For a GitHub-tracker repo");
+    expect(result!.action).not.toContain("--tracker=github");
+  });
+
+  it("cloud-router advisory names the Claude GitHub App only for cloud.agent claude", () => {
+    writeRouter("id-token: write\nsecrets.BKIT_ANTHROPIC_API_KEY\n", "claude", "github");
+    const claude = buildCloudSetupAdvisory(tmpDir);
+    expect(claude?.id).toBe("cloud-router");
+    expect(`${claude!.detect}\n${claude!.action}`).toContain("Claude GitHub App");
+    for (const agent of ["codex", "opencode"]) {
+      writeRouter("openai/codex-action\nsecrets.BKIT_OPENAI_API_KEY\n", agent, "github");
+      const other = buildCloudSetupAdvisory(tmpDir);
+      expect(other?.id, agent).toBe("cloud-router");
+      expect(`${other!.detect}\n${other!.action}`, agent).not.toContain("Claude GitHub App");
+    }
+  });
+
+  it("adopted router with no bkit.cloud.agent gives cloud-router-agent-unset naming bkit install --auto=", () => {
+    writeRouter("name: bkit-auto\nsecrets.BKIT_X\n", undefined, "github");
+    const result = buildCloudSetupAdvisory(tmpDir);
+    expect(result?.id).toBe("cloud-router-agent-unset");
+    expect(result!.action).toContain("bkit install --auto=");
+    expect(result!.detect).not.toMatch(/routing is active/i);
+  });
 });
 
 // ---------------------------------------------------------------------------
diff --git a/.bkit/core/engine/checks/after/github.ts b/.bkit/core/engine/checks/after/github.ts
index 33f7f6065..d0e5c4e0c 100644
--- a/.bkit/core/engine/checks/after/github.ts
+++ b/.bkit/core/engine/checks/after/github.ts
@@ -376,60 +376,90 @@ export function buildGithubProjectTokenScopeAdvisory(cwd: string): PreflightFind
 /**
  * Emit a cloud-agents setup advisory (parity with the tracker / dep-updater
  * advisories). Post-CI auto-routing (`bkit-cloud.yml`) is opt-in via
- * `bkit install --auto=claude`; it does NOT ship with a default install. This nudges
- * consumers to make the choice post-install.
+ * `bkit install --auto=<claude|opencode|codex|cursor>`; it does NOT ship with a default
+ * install. This nudges consumers to make the choice post-install.
  *
- * Also performs the cloud=claude config-consistency assertion: when
- * `bkit.cloud.agent === "claude"` but the installed `bkit-cloud.yml` lacks
- * `id-token: write`, it surfaces a consistency warning (exit-1 signal surfaced via
- * the `blocker` severity in the checks/before/index.ts caller).
+ * Resolution order (file presence is authoritative, package.json field is the opt-out):
+ *   - router present, claude without `id-token: write`        → `cloud-claude-missing-id-token` (blocker)
+ *   - router present, linear / jira, copy says it serves GitHub only → `cloud-router-tracker-stale`
+ *   - router present, `cloud.agent` codex, no `openai/codex-action`   → `cloud-router-codex-missing`
+ *   - router present, `cloud.agent` absent                            → `cloud-router-agent-unset`
+ *   - router present otherwise                                        → `cloud-router` (informational)
+ *   - `bkit.cloud.agent === "none"` (explicit)                        → null (opt-out — stay quiet)
+ *   - otherwise (undecided)                                           → `cloud-router-none` (nudge)
  *
- * Resolution order (file presence is authoritative, package.json field is the
- * opt-out):
- *   - `.github/workflows/bkit-cloud.yml` present → `cloud-router` (informational; active)
- *   - `bkit.cloud.agent === "none"`                  → null (opt-out — stay quiet)
- *   - `bkit.tracker.default === "jira"`                 → null (Jira runs locally only)
- *   - otherwise (undecided)                          → `cloud-router-none` (nudge to choose)
- *
- * Only fires when there is a `.github/workflows/` dir (the router wakes on a CI
+ * Only nudges when there is a `.github/workflows/` dir (the router wakes on a CI
  * completion event).
  */
 export function buildCloudSetupAdvisory(cwd: string): PreflightFinding | null {
   const routerPath = path.join(cwd, ".github", "workflows", "bkit-cloud.yml");
 
   if (fs.existsSync(routerPath)) {
-    // Config-consistency assertion: cloud=claude requires id-token: write.
-    // If the recorded variant is "claude" and the workflow file lacks id-token: write,
-    // surface a consistency finding.
-    if (readBkitConfig(cwd).cloudAgents === "claude") {
-      const workflowContent = fs.readFileSync(routerPath, "utf-8");
-      if (!workflowContent.includes("id-token: write")) {
-        return {
-          id: "cloud-claude-missing-id-token",
-          severity: "blocker",
-          detect:
-            "`bkit.cloud.agent` is `claude` but `.github/workflows/bkit-cloud.yml` lacks `id-token: write`. `claude-code-action@v1` will fail at boot with an OIDC error.",
-          action:
-            "Re-run `pnpm bkit install --auto=claude --tracker=github` to regenerate the workflow with `id-token: write` and the App-auth framing. Also verify the Claude GitHub App is installed (`/install-github-app`). See bkit's `cloud.md` § Post-CI auto-routing.",
-        };
-      }
+    const { cloudAgents, cloudAgentsExplicit, issueTracker } = readBkitConfig(cwd);
+    const content = fs.readFileSync(routerPath, "utf-8");
+    const recopy =
+      "Re-copy the template: `cp .bkit/templates/.github/workflows/bkit-cloud.yml .github/workflows/bkit-cloud.yml`, then re-apply your own edits (the `runs-on` runner and the `{{NODE_VERSION}}` value).";
+
+    if (cloudAgents === "claude" && !content.includes("id-token: write")) {
+      return {
+        id: "cloud-claude-missing-id-token",
+        severity: "blocker",
+        detect:
+          "`bkit.cloud.agent` is `claude` but `.github/workflows/bkit-cloud.yml` lacks `id-token: write`. `claude-code-action@v1` will fail at boot with an OIDC error.",
+        action: `${recopy} Also verify the Claude GitHub App is installed (\`/install-github-app\`). See bkit's \`cloud.md\` § Post-CI auto-routing.`,
+      };
+    }
+    if (
+      (issueTracker === "linear" || issueTracker === "jira") &&
+      content.includes("serves the GitHub tracker only")
+    ) {
+      return {
+        id: "cloud-router-tracker-stale",
+        severity: "advisory",
+        detect: `\`bkit.tracker.default\` is \`${issueTracker}\` but the adopted \`.github/workflows/bkit-cloud.yml\` serves the GitHub tracker only: it never dispatches an agent for ${issueTracker} issues.`,
+        action: recopy,
+      };
+    }
+    if (cloudAgents === "codex" && !content.includes("openai/codex-action")) {
+      return {
+        id: "cloud-router-codex-missing",
+        severity: "advisory",
+        detect:
+          "`bkit.cloud.agent` is `codex` but the adopted `.github/workflows/bkit-cloud.yml` has no `openai/codex-action` job, so no Codex run starts.",
+        action: recopy,
+      };
+    }
+    if (!cloudAgentsExplicit) {
+      return {
+        id: "cloud-router-agent-unset",
+        severity: "advisory",
+        detect:
+          "`.github/workflows/bkit-cloud.yml` is present but `bkit.cloud.agent` is not recorded, so the router cannot tell which agent job to start.",
+        action:
+          "Record the variant: `pnpm bkit install --auto=claude`, `--auto=opencode` or `--auto=codex` (the agent whose credential you set).",
+      };
     }
 
+    const claude = cloudAgents === "claude";
+    const secret =
+      cloudAgents === "codex"
+        ? "`BKIT_OPENAI_API_KEY` repo secret"
+        : cloudAgents === "opencode"
+          ? "opencode provider's `BKIT_` repo secret"
+          : "`BKIT_ANTHROPIC_API_KEY` repo secret OR the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables (keyless workload identity federation)";
     return {
       id: "cloud-router",
       severity: "advisory",
-      detect:
-        "Cloud agents: post-CI auto-routing is active (`.github/workflows/bkit-cloud.yml` present). The Claude GitHub App is required — run `/install-github-app` (Claude Code CLI) once if not already done.",
-      action: `The workflow requires: the \`ANTHROPIC_API_KEY\` repo secret OR the \`ANTHROPIC_FEDERATION_RULE_ID\` + \`ANTHROPIC_ORGANIZATION_ID\` repo variables (keyless workload identity federation), the Claude GitHub App (\`/install-github-app\`), and GitHub Actions write permissions (org AND repo). See the \`bkit-auto-setup\` advisory (emitted by \`bkit install --auto=claude\`) and bkit's \`cloud.md\` § Post-CI auto-routing for the full checklist.\n\nbkit's agents comment as you, so every workflow those comments trigger notifies you, even ones that skip. To see only failures: GitHub → Settings → Notifications → System → Actions → "Only notify for failed workflows".`,
+      detect: `Cloud agents: post-CI auto-routing is configured for \`${cloudAgents}\` (\`.github/workflows/bkit-cloud.yml\` present).${claude ? " The Claude GitHub App is required — run `/install-github-app` (Claude Code CLI) once if not already done." : ""}`,
+      action: `The workflow requires: the ${secret}${claude ? ", the Claude GitHub App (`/install-github-app`)" : ""}, and GitHub Actions write permissions (org AND repo). See the \`bkit-auto-setup\` advisory (emitted by \`bkit install --auto=${cloudAgents}\`) and bkit's \`cloud.md\` § Post-CI auto-routing for the full checklist.\n\nbkit's agents comment as you, so every workflow those comments trigger notifies you, even ones that skip. To see only failures: GitHub → Settings → Notifications → System → Actions → "Only notify for failed workflows".`,
     };
   }
 
   // No router present — distinguish opt-out from undecided.
-  const { cloudAgents, cloudAgentsExplicit, issueTracker } = readBkitConfig(cwd);
+  const { cloudAgents, cloudAgentsExplicit } = readBkitConfig(cwd);
   if (cloudAgents === "none" && cloudAgentsExplicit) {
     return null; // consumer explicitly chose `none` — stay quiet
   }
-  if (issueTracker === "jira") return null; // no cloud setup exists for a Jira tracker
 
   // Only nudge if there's a workflows dir for the router to wake on.
   if (!fs.existsSync(path.join(cwd, ".github", "workflows"))) return null;
@@ -440,8 +470,8 @@ export function buildCloudSetupAdvisory(cwd: string): PreflightFinding | null {
     detect:
       "Cloud agents: post-CI auto-routing is not configured. `.github/workflows/` exists but no `bkit-cloud.yml` — CI pass/fail does not auto-dispatch bkit-ship / bkit-debug.",
     action:
-      "Optional post-install decision. For a GitHub-tracker repo: `pnpm bkit install --auto=claude --tracker=github`. For a Linear-tracker repo: `pnpm bkit install --auto=cursor --tracker=linear`.\n\n" +
-      "Prerequisites for `--auto=claude`: `ANTHROPIC_API_KEY` repo secret (or the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables for keyless workload identity federation) + Claude GitHub App (`/install-github-app`) + GitHub Actions write permissions.\n\n" +
+      "Optional post-install decision: `pnpm bkit install --auto=<claude|opencode|codex|cursor>` (any variant works with your wired tracker; `codex` also needs `--codex`).\n\n" +
+      "Prerequisites: the variant's `BKIT_` repo secret (`BKIT_ANTHROPIC_API_KEY`, `BKIT_OPENAI_API_KEY` or the opencode provider's key; claude may use the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables instead), the tracker key under Linear / Jira, the Claude GitHub App (`/install-github-app`) for claude, and GitHub Actions write permissions.\n\n" +
       'To opt out and silence this advisory, set `bkit.cloud.agent` to `"none"` in package.json.',
   };
 }
diff --git a/dist/checks/after/auth.js b/dist/checks/after/auth.js
index 69c22b5be..43c669384 100644
--- a/dist/checks/after/auth.js
+++ b/dist/checks/after/auth.js
@@ -4,6 +4,8 @@ import * as fs from "node:fs";
 import * as path from "node:path";
 import { spawnSync } from "node:child_process";
 import { readJsonFile } from "../../shared/json.js";
+import { readBkitConfig } from "../../shared/settings.js";
+import { OPENCODE_PROVIDER_DEFAULTS } from "../../shared/egress.js";
 /**
  * Detect whether BKIT_GH_TOKEN is set in the shell environment. Distinguishes
  * empty from unset so action text can guide the user precisely. Never reads the
@@ -126,11 +128,25 @@ export function buildCloudDashboardsAdvisory(cwd) {
         return null;
     const sections = [];
     if (hasRouter) {
-        sections.push("**GitHub Actions** (used by bkit-cloud.yml and your own workflows):\n" +
-            "       gh secret set ANTHROPIC_API_KEY --body='<value>'\n\n" +
-            "       Verify: `gh secret list | grep -E 'ANTHROPIC_API_KEY'`\n\n" +
-            "       Keyless alternative for bkit-cloud.yml (workload identity federation): leave the secret unset and set the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables (`gh variable set`) from a Claude Console federation rule.\n\n" +
-            "       ANTHROPIC_API_KEY is read from the Anthropic dashboard (https://console.anthropic.com/settings/keys); `.bkit/.env` holds the same value as BKIT_ANTHROPIC_API_KEY. The Claude GitHub App (`/install-github-app`) is also required for `cloud=claude`.");
+        const config = readBkitConfig(cwd);
+        const agent = config.cloudAgents === "none" ? "claude" : config.cloudAgents;
+        let secret = "BKIT_ANTHROPIC_API_KEY";
+        if (agent === "codex")
+            secret = "BKIT_OPENAI_API_KEY";
+        else if (agent === "opencode")
+            secret = config.opencodeProvider
+                ? OPENCODE_PROVIDER_DEFAULTS[config.opencodeProvider].envVar
+                : "BKIT_<PROVIDER>_API_KEY";
+        let text = "**GitHub Actions** (used by bkit-cloud.yml and your own workflows):\n" +
+            `       gh secret set ${secret} --body='<value>'\n\n` +
+            `       Verify: \`gh secret list | grep -E '${secret}'\`\n\n`;
+        if (agent === "claude")
+            text +=
+                "       Keyless alternative for bkit-cloud.yml (workload identity federation): leave the secret unset and set the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables (`gh variable set`) from a Claude Console federation rule.\n\n" +
+                    "       BKIT_ANTHROPIC_API_KEY is read from the Anthropic dashboard (https://console.anthropic.com/settings/keys); `.bkit/.env` holds the same value. The Claude GitHub App (`/install-github-app`) is also required for `cloud=claude`.";
+        else
+            text += `       \`.bkit/.env\` holds the same value as ${secret}.`;
+        sections.push(text);
     }
     for (const [, text] of present)
         sections.push(text);
@@ -146,61 +162,113 @@ export function buildCloudDashboardsAdvisory(cwd) {
 }
 /** Repo variables that, both set, switch bkit-cloud.yml's claude job to workload identity federation. */
 const FEDERATION_VARIABLES = ["ANTHROPIC_FEDERATION_RULE_ID", "ANTHROPIC_ORGANIZATION_ID"];
+const LEGACY_ANTHROPIC = "ANTHROPIC_API_KEY";
+const BKIT_ANTHROPIC = "BKIT_ANTHROPIC_API_KEY";
 /**
- * Detect whether `bkit-cloud.yml`'s claude job has a credential. Only fires when
- * `.github/workflows/bkit-cloud.yml` exists. The claude job (claude-code-action) takes the
- * `ANTHROPIC_API_KEY` repo secret OR workload identity federation (both
- * `FEDERATION_VARIABLES` repo variables). The workflow is GitHub-tracker only — no
- * `BKIT_LINEAR_API_KEY` dependency. Silent when gh cannot list secrets; when only the
- * variables are unlistable, a missing key still raises the missing-credential finding.
+ * Secret findings for the adopted `bkit-cloud.yml`, per recorded variant and tracker.
+ * Only fires when `.github/workflows/bkit-cloud.yml` exists. Every finding is keyed on the
+ * secret names the adopted copy reads (`secrets.BKIT_` sniff): a legacy copy keeps its
+ * legacy names and gets no rename finding; a current copy gets `BKIT_` names plus
+ * `cloud-router-secret-renamed` when only the legacy twin is set. Claude: the key secret or
+ * workload identity federation (both `FEDERATION_VARIABLES` repo variables). Codex:
+ * `BKIT_OPENAI_API_KEY`. Linear / Jira: the tracker key (current copies only). Silent when
+ * gh cannot list secrets; when only the variables are unlistable, a missing key still
+ * raises the missing-credential finding.
  */
 export function detectCiRouterSecrets(cwd) {
     const routerPath = path.join(cwd, ".github", "workflows", "bkit-cloud.yml");
     if (!fs.existsSync(routerPath))
         return [];
-    const key = detectGhSecret("ANTHROPIC_API_KEY");
-    if (key === "unknown")
+    const names = listGhNames("secret");
+    if (names === null)
         return [];
+    const content = fs.readFileSync(routerPath, "utf-8");
+    const legacy = !content.includes("secrets.BKIT_");
+    const config = readBkitConfig(cwd);
+    const agent = config.cloudAgents === "none" ? "claude" : config.cloudAgents;
+    const findings = [];
+    if (!legacy && (config.issueTracker === "linear" || config.issueTracker === "jira")) {
+        const tk = config.issueTracker === "linear" ? "BKIT_LINEAR_API_KEY" : "BKIT_JIRA_API_KEY";
+        if (!names.includes(tk))
+            findings.push({
+                id: "cloud-router-tracker-secret-missing",
+                severity: "advisory",
+                detect: `The \`${tk}\` repo secret is not set. The router reads the \`bkit:auto\` label from ${config.issueTracker} with it; without it the router starts no agent.`,
+                action: `\`gh secret set ${tk} --body='<paste-value-here>'\`, then verify with \`gh secret list\`.`,
+            });
+    }
+    if (agent === "codex") {
+        if (!legacy && !names.includes("BKIT_OPENAI_API_KEY"))
+            findings.push({
+                id: "codex-api-key-secret-missing",
+                severity: "advisory",
+                detect: "`bkit.cloud.agent` is `codex` but the `BKIT_OPENAI_API_KEY` repo secret is not set; the codex job exits no-op.",
+                action: "`gh secret set BKIT_OPENAI_API_KEY --body='<paste-value-here>'`, then verify with `gh secret list`.",
+            });
+        return findings;
+    }
+    if (agent === "opencode") {
+        const envVar = config.opencodeProvider
+            ? OPENCODE_PROVIDER_DEFAULTS[config.opencodeProvider].envVar
+            : null;
+        if (!legacy && envVar && names.includes("OPENCODE_PROVIDER_KEY") && !names.includes(envVar))
+            findings.push({
+                id: "cloud-router-secret-renamed",
+                severity: "advisory",
+                detect: `The legacy \`OPENCODE_PROVIDER_KEY\` repo secret is set but \`${envVar}\`, the name the router now reads, is not.`,
+                action: `\`gh secret set ${envVar} --body='<same-value>'\`, then \`gh secret delete OPENCODE_PROVIDER_KEY\`.`,
+            });
+        return findings;
+    }
+    if (agent !== "claude")
+        return findings;
+    const keyName = legacy ? LEGACY_ANTHROPIC : BKIT_ANTHROPIC;
+    if (!legacy && names.includes(LEGACY_ANTHROPIC) && !names.includes(BKIT_ANTHROPIC)) {
+        findings.push({
+            id: "cloud-router-secret-renamed",
+            severity: "advisory",
+            detect: `The legacy \`${LEGACY_ANTHROPIC}\` repo secret is set but \`${BKIT_ANTHROPIC}\`, the name the router now reads, is not.`,
+            action: `\`gh secret set ${BKIT_ANTHROPIC} --body='<same-value>'\`, then \`gh secret delete ${LEGACY_ANTHROPIC}\`.`,
+        });
+        return findings;
+    }
+    const keyPresent = names.includes(keyName);
     const variables = listGhNames("variable");
     const federated = variables !== null && FEDERATION_VARIABLES.every((v) => variables.includes(v));
-    if (key === "present" && federated) {
-        return [
-            {
-                id: "anthropic-api-key-shadows-federation",
-                severity: "advisory",
-                detect: "The `ANTHROPIC_API_KEY` repo secret and the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables are all set. claude-code-action uses the key and skips workload identity federation.",
-                action: "To run keyless, delete the secret: `gh secret delete ANTHROPIC_API_KEY`. To stay on the key, delete the variables: `gh variable delete ANTHROPIC_FEDERATION_RULE_ID` and `gh variable delete ANTHROPIC_ORGANIZATION_ID`.",
-            },
-        ];
+    if (keyPresent && federated) {
+        findings.push({
+            id: "anthropic-api-key-shadows-federation",
+            severity: "advisory",
+            detect: `The \`${keyName}\` repo secret and the \`ANTHROPIC_FEDERATION_RULE_ID\` + \`ANTHROPIC_ORGANIZATION_ID\` repo variables are all set. claude-code-action uses the key and skips workload identity federation.`,
+            action: `To run keyless, delete the secret: \`gh secret delete ${keyName}\`. To stay on the key, delete the variables: \`gh variable delete ANTHROPIC_FEDERATION_RULE_ID\` and \`gh variable delete ANTHROPIC_ORGANIZATION_ID\`.`,
+        });
+        return findings;
     }
-    if (key === "present")
-        return [];
+    if (keyPresent)
+        return findings;
     if (federated) {
-        if (fs.readFileSync(routerPath, "utf-8").includes("anthropic_federation_rule_id:"))
-            return [];
-        return [
-            {
+        if (!content.includes("anthropic_federation_rule_id:"))
+            findings.push({
                 id: "anthropic-federation-template-stale",
                 severity: "advisory",
                 detect: "The `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables are set, but `.github/workflows/bkit-cloud.yml` does not pass `anthropic_federation_rule_id` to claude-code-action — the claude job exits no-op.",
                 action: "Re-copy the template: `cp .bkit/templates/.github/workflows/bkit-cloud.yml .github/workflows/bkit-cloud.yml`, then re-apply your own edits (the `runs-on` runner at minimum).",
-            },
-        ];
+            });
+        return findings;
     }
-    return [
-        {
-            id: "anthropic-api-key-secret-missing",
-            severity: "advisory",
-            detect: variables === null
-                ? "gh confirms the `ANTHROPIC_API_KEY` repo secret is not set on this GitHub repo, and could not list repo variables to check for the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` federation variables."
-                : "gh confirms neither the `ANTHROPIC_API_KEY` repo secret nor both `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables are set on this GitHub repo.",
-            action: "`.github/workflows/bkit-cloud.yml`'s claude job needs one claude credential; without it, the job exits no-op. Set ONE of:\n\n" +
-                "- API key:\n\n    gh secret set ANTHROPIC_API_KEY --body='<paste-value-here>'\n\n" +
-                "- Workload identity federation (keyless): Claude Console → Settings → Workload identity → Connect workload → GitHub Actions creates the issuer, service account and federation rule. Then:\n\n" +
-                "    gh variable set ANTHROPIC_FEDERATION_RULE_ID --body='fdrl_...'\n" +
-                "    gh variable set ANTHROPIC_ORGANIZATION_ID --body='<organization-uuid>'\n\n" +
-                "  Optional: `ANTHROPIC_SERVICE_ACCOUNT_ID` (`svac_...`) and `ANTHROPIC_WORKSPACE_ID` (`wrkspc_...`, needed when the rule covers more than one workspace).\n\n" +
-                "Then verify: `gh secret list` / `gh variable list`. The workflow itself does not need redeploying — both are read at run time.",
-        },
-    ];
+    findings.push({
+        id: "anthropic-api-key-secret-missing",
+        severity: "advisory",
+        detect: variables === null
+            ? `gh confirms the \`${keyName}\` repo secret is not set on this GitHub repo, and could not list repo variables to check for the \`ANTHROPIC_FEDERATION_RULE_ID\` + \`ANTHROPIC_ORGANIZATION_ID\` federation variables.`
+            : `gh confirms neither the \`${keyName}\` repo secret nor both \`ANTHROPIC_FEDERATION_RULE_ID\` + \`ANTHROPIC_ORGANIZATION_ID\` repo variables are set on this GitHub repo.`,
+        action: "`.github/workflows/bkit-cloud.yml`'s claude job needs one claude credential; without it, the job exits no-op. Set ONE of:\n\n" +
+            `- API key:\n\n    gh secret set ${keyName} --body='<paste-value-here>'\n\n` +
+            "- Workload identity federation (keyless): Claude Console → Settings → Workload identity → Connect workload → GitHub Actions creates the issuer, service account and federation rule. Then:\n\n" +
+            "    gh variable set ANTHROPIC_FEDERATION_RULE_ID --body='fdrl_...'\n" +
+            "    gh variable set ANTHROPIC_ORGANIZATION_ID --body='<organization-uuid>'\n\n" +
+            "  Optional: `ANTHROPIC_SERVICE_ACCOUNT_ID` (`svac_...`) and `ANTHROPIC_WORKSPACE_ID` (`wrkspc_...`, needed when the rule covers more than one workspace).\n\n" +
+            "Then verify: `gh secret list` / `gh variable list`. The workflow itself does not need redeploying — both are read at run time.",
+    });
+    return findings;
 }
diff --git a/dist/checks/after/github.js b/dist/checks/after/github.js
index aaf2535b8..ae5c76ac7 100644
--- a/dist/checks/after/github.js
+++ b/dist/checks/after/github.js
@@ -344,55 +344,78 @@ export function buildGithubProjectTokenScopeAdvisory(cwd) {
 /**
  * Emit a cloud-agents setup advisory (parity with the tracker / dep-updater
  * advisories). Post-CI auto-routing (`bkit-cloud.yml`) is opt-in via
- * `bkit install --auto=claude`; it does NOT ship with a default install. This nudges
- * consumers to make the choice post-install.
+ * `bkit install --auto=<claude|opencode|codex|cursor>`; it does NOT ship with a default
+ * install. This nudges consumers to make the choice post-install.
  *
- * Also performs the cloud=claude config-consistency assertion: when
- * `bkit.cloud.agent === "claude"` but the installed `bkit-cloud.yml` lacks
- * `id-token: write`, it surfaces a consistency warning (exit-1 signal surfaced via
- * the `blocker` severity in the checks/before/index.ts caller).
+ * Resolution order (file presence is authoritative, package.json field is the opt-out):
+ *   - router present, claude without `id-token: write`        → `cloud-claude-missing-id-token` (blocker)
+ *   - router present, linear / jira, copy says it serves GitHub only → `cloud-router-tracker-stale`
+ *   - router present, `cloud.agent` codex, no `openai/codex-action`   → `cloud-router-codex-missing`
+ *   - router present, `cloud.agent` absent                            → `cloud-router-agent-unset`
+ *   - router present otherwise                                        → `cloud-router` (informational)
+ *   - `bkit.cloud.agent === "none"` (explicit)                        → null (opt-out — stay quiet)
+ *   - otherwise (undecided)                                           → `cloud-router-none` (nudge)
  *
- * Resolution order (file presence is authoritative, package.json field is the
- * opt-out):
- *   - `.github/workflows/bkit-cloud.yml` present → `cloud-router` (informational; active)
- *   - `bkit.cloud.agent === "none"`                  → null (opt-out — stay quiet)
- *   - `bkit.tracker.default === "jira"`                 → null (Jira runs locally only)
- *   - otherwise (undecided)                          → `cloud-router-none` (nudge to choose)
- *
- * Only fires when there is a `.github/workflows/` dir (the router wakes on a CI
+ * Only nudges when there is a `.github/workflows/` dir (the router wakes on a CI
  * completion event).
  */
 export function buildCloudSetupAdvisory(cwd) {
     const routerPath = path.join(cwd, ".github", "workflows", "bkit-cloud.yml");
     if (fs.existsSync(routerPath)) {
-        // Config-consistency assertion: cloud=claude requires id-token: write.
-        // If the recorded variant is "claude" and the workflow file lacks id-token: write,
-        // surface a consistency finding.
-        if (readBkitConfig(cwd).cloudAgents === "claude") {
-            const workflowContent = fs.readFileSync(routerPath, "utf-8");
-            if (!workflowContent.includes("id-token: write")) {
-                return {
-                    id: "cloud-claude-missing-id-token",
-                    severity: "blocker",
-                    detect: "`bkit.cloud.agent` is `claude` but `.github/workflows/bkit-cloud.yml` lacks `id-token: write`. `claude-code-action@v1` will fail at boot with an OIDC error.",
-                    action: "Re-run `pnpm bkit install --auto=claude --tracker=github` to regenerate the workflow with `id-token: write` and the App-auth framing. Also verify the Claude GitHub App is installed (`/install-github-app`). See bkit's `cloud.md` § Post-CI auto-routing.",
-                };
-            }
+        const { cloudAgents, cloudAgentsExplicit, issueTracker } = readBkitConfig(cwd);
+        const content = fs.readFileSync(routerPath, "utf-8");
+        const recopy = "Re-copy the template: `cp .bkit/templates/.github/workflows/bkit-cloud.yml .github/workflows/bkit-cloud.yml`, then re-apply your own edits (the `runs-on` runner and the `{{NODE_VERSION}}` value).";
+        if (cloudAgents === "claude" && !content.includes("id-token: write")) {
+            return {
+                id: "cloud-claude-missing-id-token",
+                severity: "blocker",
+                detect: "`bkit.cloud.agent` is `claude` but `.github/workflows/bkit-cloud.yml` lacks `id-token: write`. `claude-code-action@v1` will fail at boot with an OIDC error.",
+                action: `${recopy} Also verify the Claude GitHub App is installed (\`/install-github-app\`). See bkit's \`cloud.md\` § Post-CI auto-routing.`,
+            };
+        }
+        if ((issueTracker === "linear" || issueTracker === "jira") &&
+            content.includes("serves the GitHub tracker only")) {
+            return {
+                id: "cloud-router-tracker-stale",
+                severity: "advisory",
+                detect: `\`bkit.tracker.default\` is \`${issueTracker}\` but the adopted \`.github/workflows/bkit-cloud.yml\` serves the GitHub tracker only: it never dispatches an agent for ${issueTracker} issues.`,
+                action: recopy,
+            };
+        }
+        if (cloudAgents === "codex" && !content.includes("openai/codex-action")) {
+            return {
+                id: "cloud-router-codex-missing",
+                severity: "advisory",
+                detect: "`bkit.cloud.agent` is `codex` but the adopted `.github/workflows/bkit-cloud.yml` has no `openai/codex-action` job, so no Codex run starts.",
+                action: recopy,
+            };
+        }
+        if (!cloudAgentsExplicit) {
+            return {
+                id: "cloud-router-agent-unset",
+                severity: "advisory",
+                detect: "`.github/workflows/bkit-cloud.yml` is present but `bkit.cloud.agent` is not recorded, so the router cannot tell which agent job to start.",
+                action: "Record the variant: `pnpm bkit install --auto=claude`, `--auto=opencode` or `--auto=codex` (the agent whose credential you set).",
+            };
         }
+        const claude = cloudAgents === "claude";
+        const secret = cloudAgents === "codex"
+            ? "`BKIT_OPENAI_API_KEY` repo secret"
+            : cloudAgents === "opencode"
+                ? "opencode provider's `BKIT_` repo secret"
+                : "`BKIT_ANTHROPIC_API_KEY` repo secret OR the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables (keyless workload identity federation)";
         return {
             id: "cloud-router",
             severity: "advisory",
-            detect: "Cloud agents: post-CI auto-routing is active (`.github/workflows/bkit-cloud.yml` present). The Claude GitHub App is required — run `/install-github-app` (Claude Code CLI) once if not already done.",
-            action: `The workflow requires: the \`ANTHROPIC_API_KEY\` repo secret OR the \`ANTHROPIC_FEDERATION_RULE_ID\` + \`ANTHROPIC_ORGANIZATION_ID\` repo variables (keyless workload identity federation), the Claude GitHub App (\`/install-github-app\`), and GitHub Actions write permissions (org AND repo). See the \`bkit-auto-setup\` advisory (emitted by \`bkit install --auto=claude\`) and bkit's \`cloud.md\` § Post-CI auto-routing for the full checklist.\n\nbkit's agents comment as you, so every workflow those comments trigger notifies you, even ones that skip. To see only failures: GitHub → Settings → Notifications → System → Actions → "Only notify for failed workflows".`,
+            detect: `Cloud agents: post-CI auto-routing is configured for \`${cloudAgents}\` (\`.github/workflows/bkit-cloud.yml\` present).${claude ? " The Claude GitHub App is required — run `/install-github-app` (Claude Code CLI) once if not already done." : ""}`,
+            action: `The workflow requires: the ${secret}${claude ? ", the Claude GitHub App (`/install-github-app`)" : ""}, and GitHub Actions write permissions (org AND repo). See the \`bkit-auto-setup\` advisory (emitted by \`bkit install --auto=${cloudAgents}\`) and bkit's \`cloud.md\` § Post-CI auto-routing for the full checklist.\n\nbkit's agents comment as you, so every workflow those comments trigger notifies you, even ones that skip. To see only failures: GitHub → Settings → Notifications → System → Actions → "Only notify for failed workflows".`,
         };
     }
     // No router present — distinguish opt-out from undecided.
-    const { cloudAgents, cloudAgentsExplicit, issueTracker } = readBkitConfig(cwd);
+    const { cloudAgents, cloudAgentsExplicit } = readBkitConfig(cwd);
     if (cloudAgents === "none" && cloudAgentsExplicit) {
         return null; // consumer explicitly chose `none` — stay quiet
     }
-    if (issueTracker === "jira")
-        return null; // no cloud setup exists for a Jira tracker
     // Only nudge if there's a workflows dir for the router to wake on.
     if (!fs.existsSync(path.join(cwd, ".github", "workflows")))
         return null;
@@ -400,8 +423,8 @@ export function buildCloudSetupAdvisory(cwd) {
         id: "cloud-router-none",
         severity: "advisory",
         detect: "Cloud agents: post-CI auto-routing is not configured. `.github/workflows/` exists but no `bkit-cloud.yml` — CI pass/fail does not auto-dispatch bkit-ship / bkit-debug.",
-        action: "Optional post-install decision. For a GitHub-tracker repo: `pnpm bkit install --auto=claude --tracker=github`. For a Linear-tracker repo: `pnpm bkit install --auto=cursor --tracker=linear`.\n\n" +
-            "Prerequisites for `--auto=claude`: `ANTHROPIC_API_KEY` repo secret (or the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables for keyless workload identity federation) + Claude GitHub App (`/install-github-app`) + GitHub Actions write permissions.\n\n" +
+        action: "Optional post-install decision: `pnpm bkit install --auto=<claude|opencode|codex|cursor>` (any variant works with your wired tracker; `codex` also needs `--codex`).\n\n" +
+            "Prerequisites: the variant's `BKIT_` repo secret (`BKIT_ANTHROPIC_API_KEY`, `BKIT_OPENAI_API_KEY` or the opencode provider's key; claude may use the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables instead), the tracker key under Linear / Jira, the Claude GitHub App (`/install-github-app`) for claude, and GitHub Actions write permissions.\n\n" +
             'To opt out and silence this advisory, set `bkit.cloud.agent` to `"none"` in package.json.',
     };
 }
diff --git a/docs/migrations.md b/docs/migrations.md
index 0029bb608..7e914d132 100644
--- a/docs/migrations.md
+++ b/docs/migrations.md
@@ -44,6 +44,10 @@
 <!-- prettier-ignore -->
 | Guard | Where | What it detects | Human fix |
 | --- | --- | --- | --- |
+| `cloud-router-tracker-stale` advisory | `.bkit/core/engine/checks/after/github.ts` (`buildCloudSetupAdvisory`, called by `runPostInstallCheck`) | An adopted `.github/workflows/bkit-cloud.yml` containing `serves the GitHub tracker only` while `bkit.tracker.default` is `linear` or `jira`: the router never dispatches. Tests: `checks/after/github.test.ts`. | Re-copy `.bkit/templates/.github/workflows/bkit-cloud.yml`, then re-apply your `runs-on` and `{{NODE_VERSION}}` edits. |
+| `cloud-router-codex-missing` advisory | `.bkit/core/engine/checks/after/github.ts` (`buildCloudSetupAdvisory`) | `bkit.cloud.agent` is `codex` but the adopted `bkit-cloud.yml` has no `openai/codex-action`. Tests: `checks/after/github.test.ts`. | Re-copy the template and re-apply your edits. |
+| `cloud-router-agent-unset` advisory | `.bkit/core/engine/checks/after/github.ts` (`buildCloudSetupAdvisory`) | An adopted `bkit-cloud.yml` with `bkit.cloud.agent` absent: the router cannot tell which agent job to start. Tests: `checks/after/github.test.ts`. | Run `pnpm bkit install --auto=<claude\|opencode\|codex>` to record the variant. |
+| `cloud-router-secret-renamed` advisory | `.bkit/core/engine/checks/after/auth.ts` (`detectCiRouterSecrets`) | A current adopted router (reads `secrets.BKIT_`) while only the legacy `ANTHROPIC_API_KEY` / `OPENCODE_PROVIDER_KEY` secret is set, not its `BKIT_` twin. A legacy copy keeps its legacy names and is not flagged. Tests: `checks/after/auth.test.ts`. | `gh secret set <BKIT_NAME>` with the same value, then `gh secret delete <legacy name>`. |
 | Trivy required-check advisory | `.bkit/core/engine/checks/after/github.ts` (`buildTrivyProtectionAdvisory`, called by `runPostInstallCheck`) | An adopted `bkit-trivy.yml` with existing protected branches or active rulesets still requiring `trivy`. Reads at most 10 protected branches and 100 rules per branch; unavailable or capped reads are reported as unchecked. Tests: `checks/after/github.test.ts`. | Coordinate the `bkit-trivy` context with the workflow landing. Preserve strict mode, application bindings, bypass policies and unrelated checks; re-read settings afterwards. No remote settings are written. |
 | Unmarked older copy (install) | `.bkit/core/engine/install/write.ts` (`findUnmarkedCopy`) | A managed `.md` with no `bkit:start` / `bkit:end` markers that already holds an older bkit copy. Install skips the file instead of appending a duplicate. | Delete the file, re-run install, and re-add your own lines below `<!-- bkit:end -->`. |
 | `test-file-script-missing` advisory | `.bkit/core/engine/install/modules/core.ts` (`detectGateAdvisories`) | `package.json` without `bkit:test:file`: `/bkit-build` reports test-first as not enforced. Plans predating `**Test first:**` lines get the same report from `bkit tests green`. | Declare `bkit:test:file` (runs one test file, writes JUnit to `$BKIT_TEST_REPORT`); new plans carry `Test first` lines. |
diff --git a/docs/observability.md b/docs/observability.md
index 476d41d49..a2b3c5d6f 100644
--- a/docs/observability.md
+++ b/docs/observability.md
@@ -208,7 +208,7 @@ Phase 3 emits credential findings as advisory text. Finding ids = audit trail:
 | --- | --- | --- |
 | `detectShellGhMcpToken` | `checks/after/auth.ts` | `BKIT_GH_TOKEN` missing / empty in the shell — gated on a configured `github` MCP server |
 | `detectGhSecret` | `checks/after/auth.ts` | GitHub Actions repo secret presence (`gh secret list`) |
-| `detectCiRouterSecrets` | `checks/after/auth.ts` | `bkit-cloud.yml` installed and: no claude credential (`anthropic-api-key-secret-missing`; repo variables read via `gh variable list` — unlistable → still raised when the key is missing, naming the unchecked variables); key set alongside federation vars (`anthropic-api-key-shadows-federation`); federation vars set but adopted copy lacks the federation inputs (`anthropic-federation-template-stale`) |
+| `detectCiRouterSecrets` | `checks/after/auth.ts` | `bkit-cloud.yml` installed and: no claude credential (`anthropic-api-key-secret-missing`; repo variables read via `gh variable list` — unlistable → still raised when the key is missing, naming the unchecked variables); key set alongside federation vars (`anthropic-api-key-shadows-federation`); federation vars set but adopted copy lacks the federation inputs (`anthropic-federation-template-stale`). The Anthropic findings fire for `cloud.agent` claude only, under `BKIT_ANTHROPIC_API_KEY` (legacy `ANTHROPIC_API_KEY` for a copy that predates the `BKIT_` names). Also: Linear / Jira tracker key unset (`cloud-router-tracker-secret-missing`); codex without `BKIT_OPENAI_API_KEY` (`codex-api-key-secret-missing`); legacy secret set without its `BKIT_` twin (`cloud-router-secret-renamed`) |
 | `buildCloudDashboardsAdvisory` | `checks/after/auth.ts` | Cloud-dashboard secret checklist (GitHub Actions + Claude + Cursor) |
 
 ## Runtime capability row
