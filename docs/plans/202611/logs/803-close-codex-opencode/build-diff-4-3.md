diff --git a/.bkit/allowlist.json b/.bkit/allowlist.json
index 6ec976f46..94d2b7d71 100644
--- a/.bkit/allowlist.json
+++ b/.bkit/allowlist.json
@@ -162,5 +162,6 @@
     "*.w3.org",
     "yaml.org",
     "*.yaml.org"
-  ]
+  ],
+  "fingerprint": "5b7f786f"
 }
diff --git a/.bkit/cloud.md b/.bkit/cloud.md
index d3a3b9d67..b9d418973 100644
--- a/.bkit/cloud.md
+++ b/.bkit/cloud.md
@@ -100,7 +100,7 @@ Open `claude.ai/code` → environment selector → **+ Add environment**. It has
 ## In-repo side
 
 - `.claude/hooks/bkit-preflight.sh` — the tracker opt-in guard plus the rules-read advisory, as one JSON document (`.bkit/providers.md` § Rules-read advisory). When the tracker issue ID env var is unset, as in an IDE session, it prints the advisory alone and exits 0. On Claude a non-zero exit is informational only, because `SessionStart` cannot block. The agent reads the `HARD STOP` text from `additionalContext`.
-- `.claude/hooks/bkit-cloud-bootstrap.sh` — when `CLAUDE_CODE_REMOTE=true`, runs `pnpm install --frozen-lockfile` and `vale sync`, then gh auth, then context-fetch CLI provisioning through the just-installed bkit (`bkit context provision`). When bkit is missing, it skips provisioning with a loud log line. A failed recipe's `.bkit/.unavailable` line goes to stdout, and so into the session's context. Locally the hook does nothing.
+- `.claude/hooks/bkit-cloud-bootstrap.sh` — when `CLAUDE_CODE_REMOTE=true`, runs `pnpm install --frozen-lockfile` and `vale sync`, then gh auth, then context-fetch CLI provisioning through the just-installed bkit (`bkit context provision`). When bkit is missing, it skips provisioning with a loud log line. A failed recipe's `.bkit/.unavailable` line goes to stdout, and so into the session's context. Locally the hook does nothing. It also compares the `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` env var with the `fingerprint` in `.bkit/allowlist.json` and warns when the variable is unset, malformed or different, then continues. A match is an operator assertion, so the deployed dashboard list stays unverified. `bkit check` reports `cloud-bootstrap-fingerprint-missing` when an adopted copy never reads the variable.
 - Both are registered in `.claude/settings.json` under `hooks.SessionStart`.
 
 These ship with the repo. Do not paste them into the app.
@@ -120,6 +120,9 @@ Always choose `Custom`, because the rendered list carries bkit's own shipped hos
 1. Select **Custom**.
 2. Tick **Also include default list of common package managers**. It extends the trusted defaults (package registries, GitHub, cloud SDKs) and never replaces them.
 3. Paste the domains bkit renders into `.claude/bkit-cloud.md` § Network access into **Allowed domains**.
+4. Set `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` in the environment's variables to the "Allowlist fingerprint" printed under that list. The same value is the `fingerprint` in `.bkit/allowlist.json`. After any `allowed-domains` change, run `bkit upgrade`, re-paste the list and update the variable.
+
+The fingerprint covers the whole pasted list, consumer `allowed-domains` included. Every cloud's dashboard list (Claude, Cursor and Codex) is an unverified operator assertion: bkit cannot read it, so a matching stamp proves only that you copied the current value. The Cursor and Codex paste notes print a derived-set stamp only, which ignores consumer `allowed-domains`, so it does not describe the full list those dashboards hold, and no bootstrap compares it.
 
 Declare only what bkit cannot see: the log-backend and API hosts that the implicit CLI blocks reach (`vercel` / `gcloud`), plus the app's production and preview / dev domains. Declare apex domains only. `bkit install` expands each one to `<domain>` + `*.<domain>` and unions them with the derived set. Under `Trusted` those hosts are unreachable, so a cloud `/bkit-debug` gets no runtime logs and e2e tests can't reach the deployment.
 
diff --git a/.bkit/core/.bkit/cloud.md b/.bkit/core/.bkit/cloud.md
index 41dd22ae6..d8856a54c 100644
--- a/.bkit/core/.bkit/cloud.md
+++ b/.bkit/core/.bkit/cloud.md
@@ -100,7 +100,7 @@ Open `claude.ai/code` → environment selector → **+ Add environment**. It has
 ## In-repo side
 
 - `.claude/hooks/bkit-preflight.sh` — the tracker opt-in guard plus the rules-read advisory, as one JSON document (`.bkit/providers.md` § Rules-read advisory). When the tracker issue ID env var is unset, as in an IDE session, it prints the advisory alone and exits 0. On Claude a non-zero exit is informational only, because `SessionStart` cannot block. The agent reads the `HARD STOP` text from `additionalContext`.
-- `.claude/hooks/bkit-cloud-bootstrap.sh` — when `CLAUDE_CODE_REMOTE=true`, runs `pnpm install --frozen-lockfile` and `vale sync`, then gh auth, then context-fetch CLI provisioning through the just-installed bkit (`bkit context provision`). When bkit is missing, it skips provisioning with a loud log line. A failed recipe's `.bkit/.unavailable` line goes to stdout, and so into the session's context. Locally the hook does nothing.
+- `.claude/hooks/bkit-cloud-bootstrap.sh` — when `CLAUDE_CODE_REMOTE=true`, runs `pnpm install --frozen-lockfile` and `vale sync`, then gh auth, then context-fetch CLI provisioning through the just-installed bkit (`bkit context provision`). When bkit is missing, it skips provisioning with a loud log line. A failed recipe's `.bkit/.unavailable` line goes to stdout, and so into the session's context. Locally the hook does nothing. It also compares the `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` env var with the `fingerprint` in `.bkit/allowlist.json` and warns when the variable is unset, malformed or different, then continues. A match is an operator assertion, so the deployed dashboard list stays unverified. `bkit check` reports `cloud-bootstrap-fingerprint-missing` when an adopted copy never reads the variable.
 - Both are registered in `.claude/settings.json` under `hooks.SessionStart`.
 
 These ship with the repo. Do not paste them into the app.
@@ -120,6 +120,9 @@ Always choose `Custom`, because the rendered list carries bkit's own shipped hos
 1. Select **Custom**.
 2. Tick **Also include default list of common package managers**. It extends the trusted defaults (package registries, GitHub, cloud SDKs) and never replaces them.
 3. Paste the domains bkit renders into `.claude/bkit-cloud.md` § Network access into **Allowed domains**.
+4. Set `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` in the environment's variables to the "Allowlist fingerprint" printed under that list. The same value is the `fingerprint` in `.bkit/allowlist.json`. After any `allowed-domains` change, run `bkit upgrade`, re-paste the list and update the variable.
+
+The fingerprint covers the whole pasted list, consumer `allowed-domains` included. Every cloud's dashboard list (Claude, Cursor and Codex) is an unverified operator assertion: bkit cannot read it, so a matching stamp proves only that you copied the current value. The Cursor and Codex paste notes print a derived-set stamp only, which ignores consumer `allowed-domains`, so it does not describe the full list those dashboards hold, and no bootstrap compares it.
 
 Declare only what bkit cannot see: the log-backend and API hosts that the implicit CLI blocks reach (`vercel` / `gcloud`), plus the app's production and preview / dev domains. Declare apex domains only. `bkit install` expands each one to `<domain>` + `*.<domain>` and unions them with the derived set. Under `Trusted` those hosts are unreachable, so a cloud `/bkit-debug` gets no runtime logs and e2e tests can't reach the deployment.
 
diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index 63db1b022..40ef24c97 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -76,7 +76,7 @@ The adoption order is the `bkit tips` order. The machine lock has no tip, so ado
 | Machine lock | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | `scripts/ci/` | that file |
 | Local test sleep prevention | `.bkit/templates/scripts/ci/bkit-test-awake.mjs`, `bkit-test-awake.test.mjs` | `scripts/ci/` | both files |
 | Context-fetch blocks | `.bkit/templates/context/bkit-<provider>.md` | below `<!-- bkit:end -->` in `.agents/context.md` | the blocks you use |
-| Cloud SessionStart hook | `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` | `.claude/hooks/bkit-cloud-bootstrap.sh` | that file |
+| Cloud SessionStart hook | `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` | `.claude/hooks/bkit-cloud-bootstrap.sh` | that file; it compares `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` with `.bkit/allowlist.json` and warns on a mismatch, and `bkit check` raises `cloud-bootstrap-fingerprint-missing` for a copy that never reads the variable |
 
 Placeholders: the copies keep them raw, so replace each one in your copy:
 
diff --git a/.bkit/core/engine/checks/before/files.test.ts b/.bkit/core/engine/checks/before/files.test.ts
index 8d2194977..87c18a7e4 100644
--- a/.bkit/core/engine/checks/before/files.test.ts
+++ b/.bkit/core/engine/checks/before/files.test.ts
@@ -10,6 +10,7 @@ import {
   detectGitignoreBlockDuplicates,
   detectPlaywrightReporterHostile,
   detectOpencodeSubstringFetchGrants,
+  detectCloudBootstrapFingerprintMissing,
   redactUrlParts,
   MARKERED_TEXT_DRIFT_PATHS,
   detectTier2TextDrift,
@@ -324,6 +325,45 @@ describe("detectOpencodeSubstringFetchGrants", () => {
   });
 });
 
+describe("detectCloudBootstrapFingerprintMissing", () => {
+  const BOOTSTRAP_REL = path.join(".claude", "hooks", "bkit-cloud-bootstrap.sh");
+
+  function writeBootstrap(body: string): void {
+    const abs = path.join(tmpDir, BOOTSTRAP_REL);
+    fs.mkdirSync(path.dirname(abs), { recursive: true });
+    fs.writeFileSync(abs, body, "utf-8");
+  }
+
+  it("reports an adopted bootstrap that never reads BKIT_CLOUD_ALLOWLIST_FINGERPRINT", () => {
+    // A bootstrap copied from the pre-fingerprint template: the trust check, no compare.
+    writeBootstrap(
+      "#!/usr/bin/env bash\nset -euo pipefail\ncat >/dev/null\n" +
+        'if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then exit 0; fi\n' +
+        "pnpm install --frozen-lockfile\n",
+    );
+    const f = detectCloudBootstrapFingerprintMissing(tmpDir);
+    expect(f).not.toBeNull();
+    expect(f?.id).toBe("cloud-bootstrap-fingerprint-missing");
+    expect(f?.detect).toContain(BOOTSTRAP_REL);
+    expect(f?.detect).toContain("BKIT_CLOUD_ALLOWLIST_FINGERPRINT");
+    expect(f?.action).toContain(".bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh");
+  });
+
+  it("accepts a customised bootstrap that reads the variable", () => {
+    // Rewritten, not byte-equal to the template, but it compares the variable itself.
+    writeBootstrap(
+      "#!/usr/bin/env bash\nmy_custom_setup() { :; }\n" +
+        'if [ "${BKIT_CLOUD_ALLOWLIST_FINGERPRINT:-}" = "$(my_stamp)" ]; then echo same; fi\n',
+    );
+    expect(detectCloudBootstrapFingerprintMissing(tmpDir)).toBeNull();
+  });
+
+  it("stays silent when no bootstrap is adopted", () => {
+    expect(fs.existsSync(path.join(tmpDir, BOOTSTRAP_REL))).toBe(false);
+    expect(detectCloudBootstrapFingerprintMissing(tmpDir)).toBeNull();
+  });
+});
+
 // ---------------------------------------------------------------------------
 // process.env snapshot and restore around each test
 // ---------------------------------------------------------------------------
diff --git a/.bkit/core/engine/checks/before/files.ts b/.bkit/core/engine/checks/before/files.ts
index 7ecceb5e2..1af62315f 100644
--- a/.bkit/core/engine/checks/before/files.ts
+++ b/.bkit/core/engine/checks/before/files.ts
@@ -144,6 +144,27 @@ export function detectOpencodeSubstringFetchGrants(cwd: string): PreflightFindin
   };
 }
 
+const CLOUD_BOOTSTRAP_REL = ".claude/hooks/bkit-cloud-bootstrap.sh";
+const CLOUD_BOOTSTRAP_TEMPLATE_REL = ".bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh";
+
+/**
+ * Advisory: an adopted `.claude/hooks/bkit-cloud-bootstrap.sh` never reads
+ * `BKIT_CLOUD_ALLOWLIST_FINGERPRINT`, so a stale cloud network allowlist goes unwarned.
+ * Matches the variable name, never byte identity, so a customised bootstrap that compares
+ * the variable its own way is accepted. Silent when no bootstrap is adopted. Reads only.
+ */
+export function detectCloudBootstrapFingerprintMissing(cwd: string): PreflightFinding | null {
+  const abs = path.join(cwd, CLOUD_BOOTSTRAP_REL);
+  if (!fs.existsSync(abs)) return null;
+  if (fs.readFileSync(abs, "utf-8").includes("BKIT_CLOUD_ALLOWLIST_FINGERPRINT")) return null;
+  return {
+    id: "cloud-bootstrap-fingerprint-missing",
+    severity: "advisory",
+    detect: `${CLOUD_BOOTSTRAP_REL} never reads \`BKIT_CLOUD_ALLOWLIST_FINGERPRINT\`, so a cloud session cannot warn when the network allowlist pasted into the cloud dashboard is stale.`,
+    action: `Copy the fingerprint block (the \`EXPECTED_FP\` section after the workspace-trust check) from ${CLOUD_BOOTSTRAP_TEMPLATE_REL} into ${CLOUD_BOOTSTRAP_REL}, or compare \`BKIT_CLOUD_ALLOWLIST_FINGERPRINT\` with the \`fingerprint\` in \`.bkit/allowlist.json\` your own way. Then set the variable in the cloud environment to the fingerprint printed in \`.claude/bkit-cloud.md\` § Network access.`,
+  };
+}
+
 /**
  * Advisory: detect when a JSON file is missing content the template owns.
  * Runs deepContains(template, consumerFile) — fires when ok=false.
diff --git a/.bkit/core/engine/checks/before/index.ts b/.bkit/core/engine/checks/before/index.ts
index 9316ae95b..eb9ccac5a 100644
--- a/.bkit/core/engine/checks/before/index.ts
+++ b/.bkit/core/engine/checks/before/index.ts
@@ -32,6 +32,7 @@ import {
   detectGitignoreBlockDuplicates,
   detectPlaywrightReporterHostile,
   detectOpencodeSubstringFetchGrants,
+  detectCloudBootstrapFingerprintMissing,
   detectTier2JsonDrift,
   detectTier2TextDrift,
 } from "./files.js";
@@ -158,6 +159,9 @@ export function runPreflight(
   const opencodeSubstringGrants = detectOpencodeSubstringFetchGrants(cwd);
   if (opencodeSubstringGrants) advisories.push(opencodeSubstringGrants);
 
+  const cloudBootstrapFingerprint = detectCloudBootstrapFingerprintMissing(cwd);
+  if (cloudBootstrapFingerprint) advisories.push(cloudBootstrapFingerprint);
+
   const contextFetch = detectContextFetchMissing(cwd);
   if (contextFetch) advisories.push(contextFetch);
 
diff --git a/.bkit/core/engine/commands/install/check.integration.test.ts b/.bkit/core/engine/commands/install/check.integration.test.ts
index b473c89f7..8b01f919e 100644
--- a/.bkit/core/engine/commands/install/check.integration.test.ts
+++ b/.bkit/core/engine/commands/install/check.integration.test.ts
@@ -775,3 +775,21 @@ describe("Scenario: bkit check stale-marker gate is branch-scoped (#256)", () =>
     expect(r.combined).not.toContain("bkit-managed files are stale (managed-version marker drift)");
   });
 });
+
+describe("cloud bootstrap fingerprint compare — adoption signal", () => {
+  it("bkit check reports a stale adopted cloud bootstrap with the template block to copy", () => {
+    // A bootstrap adopted before the fingerprint compare existed: it never reads the variable.
+    const hook = path.join(tmpDir, ".claude", "hooks", "bkit-cloud-bootstrap.sh");
+    fs.mkdirSync(path.dirname(hook), { recursive: true });
+    fs.writeFileSync(
+      hook,
+      "#!/usr/bin/env bash\nset -euo pipefail\ncat >/dev/null\nexit 0\n",
+      "utf-8",
+    );
+    const r = runBkit(["check"]);
+    const out = combinedOutput(r);
+    expect(out, out).toContain("cloud-bootstrap-fingerprint-missing");
+    expect(out).toContain(".claude/hooks/bkit-cloud-bootstrap.sh");
+    expect(out).toContain(".bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh");
+  });
+});
diff --git a/.bkit/core/engine/commands/install/doctor.integration.test.ts b/.bkit/core/engine/commands/install/doctor.integration.test.ts
index ab1cb8777..b6df44e7d 100644
--- a/.bkit/core/engine/commands/install/doctor.integration.test.ts
+++ b/.bkit/core/engine/commands/install/doctor.integration.test.ts
@@ -148,6 +148,29 @@ describe("bkit doctor — integration", () => {
     expect(combinedOutput).toContain("bkit-version-pin-stale");
   });
 
+  it("bkit doctor lists a stale adopted cloud bootstrap", () => {
+    seedMinimalConsumer(tmpDir);
+    const hook = path.join(tmpDir, ".claude", "hooks", "bkit-cloud-bootstrap.sh");
+    fs.mkdirSync(path.dirname(hook), { recursive: true });
+    fs.writeFileSync(
+      hook,
+      "#!/usr/bin/env bash\nset -euo pipefail\ncat >/dev/null\nexit 0\n",
+      "utf-8",
+    );
+
+    const result = spawnSync(requireTsx(), [bkitInstallPath, "doctor"], {
+      cwd: tmpDir,
+      encoding: "utf-8",
+      timeout: 30_000,
+      env: { ...process.env },
+    });
+
+    expect(result.status, `doctor crashed:\n${result.stdout}\n${result.stderr}`).toBe(0);
+    const out = result.stdout + result.stderr;
+    expect(out, out).toContain("cloud-bootstrap-fingerprint-missing");
+    expect(out).toContain(".bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh");
+  });
+
   it("writes only the .bkit/advisories.md artifact (no other side effects)", () => {
     seedMinimalConsumer(tmpDir);
 
diff --git a/.bkit/core/engine/install/cloud-env.test.ts b/.bkit/core/engine/install/cloud-env.test.ts
index e595a7f6e..d9c481204 100644
--- a/.bkit/core/engine/install/cloud-env.test.ts
+++ b/.bkit/core/engine/install/cloud-env.test.ts
@@ -39,6 +39,7 @@ import {
   renderCodexNetworkAllowlist,
   writeCodexCloudDoc,
   SESSION_HIJACK_KEYS,
+  egressFingerprint,
 } from "./cloud-env";
 import {
   OPENCODE_PROVIDER_DEFAULTS,
@@ -570,6 +571,22 @@ describe("extractAllowedDomains / expandAllowedDomains / renderCloudNetworkAllow
     expect(out).toContain("```text");
   });
 
+  it("renderCloudNetworkAllowlist names the .bkit/allowlist.json fingerprint and the BKIT_CLOUD_ALLOWLIST_FINGERPRINT step", () => {
+    write(
+      ".agents/context.md",
+      "<!-- bkit:end -->\n<!-- allowed-domains:start -->\nexample.invalid\n<!-- allowed-domains:end -->\n",
+    );
+    const stamp = egressFingerprint(resolveNetworkAllowlist(tmpDir));
+    const out = renderCloudNetworkAllowlist(tmpDir);
+    expect(out).toContain("Allowlist fingerprint `" + stamp + "`");
+    expect(out).toContain("BKIT_CLOUD_ALLOWLIST_FINGERPRINT");
+    expect(out).toContain("operator");
+    expect(out).toContain("unverified");
+    expect(out).not.toContain("Derived set fingerprint");
+    // the stamp covers the consumer union: it differs from the derived-set stamp
+    expect(stamp).not.toBe(egressFingerprint());
+  });
+
   it("resolveNetworkAllowlist stays stack-agnostic until consumer declares domains", () => {
     expect(BKIT_SHIPPED_NETWORK_DOMAINS).not.toContain("vercel.com");
     expect(BKIT_SHIPPED_NETWORK_DOMAINS).not.toContain("supabase.com");
diff --git a/.bkit/core/engine/install/cloud-env.ts b/.bkit/core/engine/install/cloud-env.ts
index d6ccf3c2d..c37ad9c67 100644
--- a/.bkit/core/engine/install/cloud-env.ts
+++ b/.bkit/core/engine/install/cloud-env.ts
@@ -648,15 +648,15 @@ function writeGeneratedJson(cwd: string, rel: string, doc: unknown, dryRun: bool
 }
 
 /**
- * 8-hex fingerprint of the DERIVED egress set only — bases and hosts, sorted, never
- * the consumer union. Hosts are included (the Cursor paste is hosts-only). Editing
- * `allowed-domains` never moves it; editing a registry row does.
+ * 8-hex fingerprint of an entry list, sorted and de-duplicated. With no argument it
+ * covers the DERIVED egress set only — bases and hosts, never the consumer union (the
+ * Cursor and Codex paste notes use that); editing `allowed-domains` never moves it,
+ * editing a registry row does. Pass the resolved allowlist to cover consumer
+ * `allowed-domains` too (the Claude paste list and `.bkit/allowlist.json`).
  */
-export function egressFingerprint(): string {
-  const derived = [
-    ...new Set([...BKIT_SHIPPED_NETWORK_DOMAINS, ...BKIT_SHIPPED_NETWORK_HOSTS]),
-  ].sort();
-  return sha256(derived.join("\n")).slice(0, 8);
+export function egressFingerprint(entries?: readonly string[]): string {
+  const set = entries ?? [...BKIT_SHIPPED_NETWORK_DOMAINS, ...BKIT_SHIPPED_NETWORK_HOSTS];
+  return sha256([...new Set(set)].sort().join("\n")).slice(0, 8);
 }
 
 /**
@@ -703,10 +703,17 @@ export function renderCloudNetworkAllowlist(cwd: string): string {
     "\n```\n\n" +
     `_${domains.length} entries (${domains.length / 2} domains, each as apex + \`*.\` wildcard): ` +
     networkSourceCounts(networkAllowlistBases(declared), BKIT_SHIPPED_NETWORK_DOMAINS) +
-    ". Derived set fingerprint `" +
-    egressFingerprint() +
+    ". Allowlist fingerprint `" +
+    egressFingerprint(domains) +
     "`._" +
     declaredNote +
+    "\n\nThe fingerprint is also recorded in `.bkit/allowlist.json`. After you paste the list, " +
+    "set `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` to it in the cloud environment's variables (or " +
+    "the setup script); the SessionStart bootstrap compares it with the repo's current " +
+    "fingerprint and warns on a mismatch, then continues. The stamp is an operator " +
+    "assertion that you pasted this list: the deployed dashboard allowlist stays " +
+    "unverified. After any `allowed-domains` change, run `bkit upgrade`, re-paste the list " +
+    "and update the variable." +
     "\n\nUnder **Trusted**, your app domains and most observability / API hosts are\n" +
     "unreachable, so cloud `/bkit-debug` gets no runtime logs and e2e can't hit your\n" +
     "deployment. **Full** works too but opens all egress."
diff --git a/.bkit/core/engine/install/network-allowlist.test.ts b/.bkit/core/engine/install/network-allowlist.test.ts
index d3ff1842b..8dd196d2c 100644
--- a/.bkit/core/engine/install/network-allowlist.test.ts
+++ b/.bkit/core/engine/install/network-allowlist.test.ts
@@ -8,6 +8,7 @@ import {
   renderNetworkAllowlist,
   writeNetworkAllowlist,
 } from "./network-allowlist";
+import { egressFingerprint } from "./cloud-env";
 import { writeBkitVersion } from "./version-file";
 import type { WriteSet } from "./write";
 
@@ -83,6 +84,30 @@ describe("writeNetworkAllowlist — .bkit/allowlist.json", () => {
     expect(doc.domains).toContain("example.invalid");
     expect(doc.domains).toContain("*.example.invalid");
   });
+
+  it("records the fingerprint of its own domains list", () => {
+    run(false);
+    const doc = JSON.parse(fs.readFileSync(path.join(tmpDir, NETWORK_ALLOWLIST_RELPATH), "utf-8"));
+    expect(doc.fingerprint).toMatch(/^[0-9a-f]{8}$/);
+    expect(doc.fingerprint).toBe(egressFingerprint(doc.domains));
+  });
+
+  it("moves the fingerprint when allowed-domains changes", () => {
+    const stamp = (): string =>
+      JSON.parse(fs.readFileSync(path.join(tmpDir, NETWORK_ALLOWLIST_RELPATH), "utf-8"))
+        .fingerprint;
+    run(false);
+    const before = stamp();
+    expect(before).toMatch(/^[0-9a-f]{8}$/);
+    write(
+      ".agents/context.md",
+      "<!-- bkit:end -->\n<!-- allowed-domains:start -->\nexample.invalid\n<!-- allowed-domains:end -->\n",
+    );
+    run(false);
+    const after = stamp();
+    expect(after).toMatch(/^[0-9a-f]{8}$/);
+    expect(after).not.toBe(before);
+  });
 });
 
 describe("writeNetworkAllowlist — migration off .cursor/allowlist.json (installs up to 5.2.4)", () => {
diff --git a/.bkit/core/engine/install/network-allowlist.ts b/.bkit/core/engine/install/network-allowlist.ts
index 18194c851..122dc6ad2 100644
--- a/.bkit/core/engine/install/network-allowlist.ts
+++ b/.bkit/core/engine/install/network-allowlist.ts
@@ -6,7 +6,7 @@
 
 import * as fs from "node:fs";
 import * as path from "node:path";
-import { resolveNetworkAllowlist } from "./cloud-env.js";
+import { egressFingerprint, resolveNetworkAllowlist } from "./cloud-env.js";
 import { readBkitVersion } from "./version-file.js";
 import type { WriteSet } from "./write.js";
 
@@ -16,9 +16,14 @@ export const NETWORK_ALLOWLIST_RELPATH = path.join(".bkit", "allowlist.json");
 /** Where the cursor module wrote the allowlist up to 5.2.4 (migrated away). */
 export const RETIRED_NETWORK_ALLOWLIST_RELPATH = path.join(".cursor", "allowlist.json");
 
-/** The allowlist file body: `{ domains }`, apex + `*.` wildcard per base, sorted. */
+/**
+ * The allowlist file body: `{ domains, fingerprint }` — `domains` is apex + `*.` wildcard
+ * per base, sorted; `fingerprint` is the 8-hex stamp of that list, which the cloud
+ * bootstrap compares with `BKIT_CLOUD_ALLOWLIST_FINGERPRINT`.
+ */
 export function renderNetworkAllowlist(cwd: string): string {
-  return JSON.stringify({ domains: resolveNetworkAllowlist(cwd) }, null, 2) + "\n";
+  const domains = resolveNetworkAllowlist(cwd);
+  return JSON.stringify({ domains, fingerprint: egressFingerprint(domains) }, null, 2) + "\n";
 }
 
 /**
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index 92ba55b21..297c23d39 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -212,3 +212,4 @@
 {"schema":3,"ts":1794633542161,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":20,"lastConfirmed":1794633542161}
 {"schema":3,"ts":1794642779338,"kind":"friction","key":"steps-finish/build-plan-gaps-remediate","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-gaps-remediate with exit 11: `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` \"acknowledges only complete selected blocks on verified routes\", `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` \"reserves notices inside conservative host budgets\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"efc2e5a5eaf9dac459eebceed27d170bd50f5066"},"recurrenceCount":3,"lastConfirmed":1794642779338}
 {"schema":3,"ts":1794642784764,"kind":"friction","key":"steps-finish/build-plan-gaps-remediate","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-gaps-remediate with exit 11: `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` \"acknowledges only complete selected blocks on verified routes\", `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` \"reserves notices inside conservative host budgets\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"efc2e5a5eaf9dac459eebceed27d170bd50f5066"},"recurrenceCount":4,"lastConfirmed":1794642784764}
+{"schema":3,"ts":1794650003877,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":21,"lastConfirmed":1794650003877}
diff --git a/.bkit/templates.md b/.bkit/templates.md
index 0fffcfead..4966d5b41 100644
--- a/.bkit/templates.md
+++ b/.bkit/templates.md
@@ -76,7 +76,7 @@ The adoption order is the `bkit tips` order. The machine lock has no tip, so ado
 | Machine lock | `.bkit/templates/scripts/ci/bkit-machine-lock.sh` | `scripts/ci/` | that file |
 | Local test sleep prevention | `.bkit/templates/scripts/ci/bkit-test-awake.mjs`, `bkit-test-awake.test.mjs` | `scripts/ci/` | both files |
 | Context-fetch blocks | `.bkit/templates/context/bkit-<provider>.md` | below `<!-- bkit:end -->` in `.agents/context.md` | the blocks you use |
-| Cloud SessionStart hook | `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` | `.claude/hooks/bkit-cloud-bootstrap.sh` | that file |
+| Cloud SessionStart hook | `.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` | `.claude/hooks/bkit-cloud-bootstrap.sh` | that file; it compares `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` with `.bkit/allowlist.json` and warns on a mismatch, and `bkit check` raises `cloud-bootstrap-fingerprint-missing` for a copy that never reads the variable |
 
 Placeholders: the copies keep them raw, so replace each one in your copy:
 
diff --git a/.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh b/.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
index 20ede6204..bdeb27814 100755
--- a/.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
+++ b/.bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh
@@ -18,6 +18,8 @@
 #
 # The `bkit baseline install` section below is bkit's starting point; the whole
 # file is yours now — add your own steps anywhere (examples at the bottom).
+# Customise: the BKIT_CLOUD_ALLOWLIST_FINGERPRINT block compares the pasted network
+# allowlist's fingerprint with .bkit/allowlist.json; keep it or compare your own way.
 
 set -euo pipefail
 
@@ -54,6 +56,29 @@ if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ] && command -v jq >/dev/null 2>&1; then
   fi
 fi
 
+# Allowlist fingerprint compare. The operator pastes the network allowlist from
+# .claude/bkit-cloud.md into the cloud dashboard and copies its fingerprint into the
+# BKIT_CLOUD_ALLOWLIST_FINGERPRINT env var. This compares that value with the
+# `fingerprint` in .bkit/allowlist.json. A match is an operator assertion only: the
+# deployed dashboard allowlist stays unverified. Every outcome warns or reports and
+# continues; the hook never exits non-zero here.
+EXPECTED_FP=""
+if command -v jq >/dev/null 2>&1; then
+  EXPECTED_FP=$(jq -r '.fingerprint // empty' .bkit/allowlist.json 2>/dev/null || printf '')
+fi
+FP_REFRESH="Refresh: run 'bkit upgrade', re-paste the list from .claude/bkit-cloud.md section Network access into the cloud environment, then set BKIT_CLOUD_ALLOWLIST_FINGERPRINT to the fingerprint printed there."
+if ! [[ "$EXPECTED_FP" =~ ^[0-9a-f]{8}$ ]]; then
+  log "WARNING: the expected fingerprint is unavailable (.bkit/allowlist.json has no valid 8-hex fingerprint, is not valid JSON, or jq is missing), so the cloud network allowlist cannot be compared. Fix: run 'bkit upgrade' in the repo and install jq."
+elif [ -z "${BKIT_CLOUD_ALLOWLIST_FINGERPRINT:-}" ]; then
+  log "WARNING: BKIT_CLOUD_ALLOWLIST_FINGERPRINT is not set, so the cloud network allowlist cannot be checked for staleness. Expected fingerprint: $EXPECTED_FP. $FP_REFRESH"
+elif ! [[ "$BKIT_CLOUD_ALLOWLIST_FINGERPRINT" =~ ^[0-9a-f]{8}$ ]]; then
+  log "WARNING: BKIT_CLOUD_ALLOWLIST_FINGERPRINT is not an 8-hex fingerprint (value not shown). Expected fingerprint: $EXPECTED_FP. $FP_REFRESH"
+elif [ "$BKIT_CLOUD_ALLOWLIST_FINGERPRINT" != "$EXPECTED_FP" ]; then
+  log "WARNING: the cloud network allowlist is stale: BKIT_CLOUD_ALLOWLIST_FINGERPRINT is $BKIT_CLOUD_ALLOWLIST_FINGERPRINT, the repo expects $EXPECTED_FP. $FP_REFRESH"
+else
+  log "allowlist fingerprint $EXPECTED_FP: operator-asserted match; the deployed dashboard allowlist is unverified"
+fi
+
 if [ -f pnpm-lock.yaml ] && command -v pnpm >/dev/null 2>&1; then
   log "pnpm install --frozen-lockfile"
   pnpm install --frozen-lockfile --prefer-offline || log "pnpm install failed (non-blocking)"
diff --git a/.bkit/version b/.bkit/version
index 37c53e78c..6934d08c7 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -205,9 +205,9 @@
     ".cursor/agents/bkit-utility-update-roadmap.md": "d71b5fb0d3b1224e22c6de4944021d8571fdd8c003f1d6c2be9dd77334b13b10",
     "docs/templates/bkit-audit-agents.md": "b274136511b07082dc5f33bcbad7f95e36d3ce84b747e211b2cde3f183a375b9",
     "docs/templates/bkit-audit-prompts.md": "591c1a4a79bcfaabb7712d6c28cf88220d2186e77055db936d8a69287ec7d9ef",
-    ".bkit/templates.md": "163cbc1c932eba882ddedfd8f4c0077772270b9237ba3f09217fe7ab44afb224",
+    ".bkit/templates.md": "044d4ba31052e29d0b30cf8a3269c372ad04df812c9eac62bed01b492231e14b",
     "docs/templates/bkit-audit-adoption.md": "a0b56a7659e5d8a407c5b1c36201045d6a23e0a6f1b3353aa5e5f7d38c31fd9b",
-    ".bkit/cloud.md": "4b3fbcae7dcfdf991aa78774f4c487d3aff343b90fc27bbdf3f4aa492320dd4c",
+    ".bkit/cloud.md": "54998c39676430596fa4a0fe4f377a00ce8883ac4edd105fbc74cefe2954c1a0",
     ".bkit/comparison.md": "48845a4c08abe236dcb5af4947db755a10aad06996a87c5d5b1bed07528514de",
     ".bkit/install.md": "42dc98ac1962ce9acd03d5c0777e88f3b7afe9b600a53398ee4b26673d7d1e86",
     ".bkit/jsonl.md": "1c0d5597648167929c2098fa0176ac2daa5eaca7b198bd040f2fa79b1b5b40ab",
@@ -237,7 +237,7 @@
     ".cursor/agents/bkit-debug-failure-reproduce.md": "7ae3f377fe1742f6376120d0f7e9da666ced24ddf8ef9a64679aab11f2bf844b",
     ".opencode/agents/bkit-debug-failure-reproduce.md": "41165c69da40fa1b600a99de05b481f634a68df07d8720ad4ebd219f5fbd5422",
     ".codex/agents/bkit-debug-failure-reproduce.toml": "bcd72d0e52d9b0902a96bc920c7107f7db654bf79e2db8362b2adedc5374badd",
-    ".bkit/allowlist.json": "47f68886cd8488cd0ff0b77ac7bd985b9e33bc0484db2c4cbfca3b84c694fbce",
+    ".bkit/allowlist.json": "79268cabd25db8488d631c42fe8e9f011f06ce365cf807084aef9fa0cafb5b3c",
     ".claude/agents/bkit-utility-update-tracker.md": "9361c5e325f6b5afa4e64f7c6d165a6c7d6d8662071c1cf85183c7afe159802c",
     ".cursor/agents/bkit-utility-update-tracker.md": "e2e9079d249836b4a8ffb625f16e24fea93ac87a9fec5d471c32ca4569139f24",
     ".opencode/agents/bkit-utility-update-tracker.md": "0a75587998ed95b4b45f3882b6c07a463282ec4ccada504ad018f9be19b10860",
diff --git a/.claude/hooks/bkit-cloud-bootstrap.sh b/.claude/hooks/bkit-cloud-bootstrap.sh
index 20ede6204..bdeb27814 100755
--- a/.claude/hooks/bkit-cloud-bootstrap.sh
+++ b/.claude/hooks/bkit-cloud-bootstrap.sh
@@ -18,6 +18,8 @@
 #
 # The `bkit baseline install` section below is bkit's starting point; the whole
 # file is yours now — add your own steps anywhere (examples at the bottom).
+# Customise: the BKIT_CLOUD_ALLOWLIST_FINGERPRINT block compares the pasted network
+# allowlist's fingerprint with .bkit/allowlist.json; keep it or compare your own way.
 
 set -euo pipefail
 
@@ -54,6 +56,29 @@ if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ] && command -v jq >/dev/null 2>&1; then
   fi
 fi
 
+# Allowlist fingerprint compare. The operator pastes the network allowlist from
+# .claude/bkit-cloud.md into the cloud dashboard and copies its fingerprint into the
+# BKIT_CLOUD_ALLOWLIST_FINGERPRINT env var. This compares that value with the
+# `fingerprint` in .bkit/allowlist.json. A match is an operator assertion only: the
+# deployed dashboard allowlist stays unverified. Every outcome warns or reports and
+# continues; the hook never exits non-zero here.
+EXPECTED_FP=""
+if command -v jq >/dev/null 2>&1; then
+  EXPECTED_FP=$(jq -r '.fingerprint // empty' .bkit/allowlist.json 2>/dev/null || printf '')
+fi
+FP_REFRESH="Refresh: run 'bkit upgrade', re-paste the list from .claude/bkit-cloud.md section Network access into the cloud environment, then set BKIT_CLOUD_ALLOWLIST_FINGERPRINT to the fingerprint printed there."
+if ! [[ "$EXPECTED_FP" =~ ^[0-9a-f]{8}$ ]]; then
+  log "WARNING: the expected fingerprint is unavailable (.bkit/allowlist.json has no valid 8-hex fingerprint, is not valid JSON, or jq is missing), so the cloud network allowlist cannot be compared. Fix: run 'bkit upgrade' in the repo and install jq."
+elif [ -z "${BKIT_CLOUD_ALLOWLIST_FINGERPRINT:-}" ]; then
+  log "WARNING: BKIT_CLOUD_ALLOWLIST_FINGERPRINT is not set, so the cloud network allowlist cannot be checked for staleness. Expected fingerprint: $EXPECTED_FP. $FP_REFRESH"
+elif ! [[ "$BKIT_CLOUD_ALLOWLIST_FINGERPRINT" =~ ^[0-9a-f]{8}$ ]]; then
+  log "WARNING: BKIT_CLOUD_ALLOWLIST_FINGERPRINT is not an 8-hex fingerprint (value not shown). Expected fingerprint: $EXPECTED_FP. $FP_REFRESH"
+elif [ "$BKIT_CLOUD_ALLOWLIST_FINGERPRINT" != "$EXPECTED_FP" ]; then
+  log "WARNING: the cloud network allowlist is stale: BKIT_CLOUD_ALLOWLIST_FINGERPRINT is $BKIT_CLOUD_ALLOWLIST_FINGERPRINT, the repo expects $EXPECTED_FP. $FP_REFRESH"
+else
+  log "allowlist fingerprint $EXPECTED_FP: operator-asserted match; the deployed dashboard allowlist is unverified"
+fi
+
 if [ -f pnpm-lock.yaml ] && command -v pnpm >/dev/null 2>&1; then
   log "pnpm install --frozen-lockfile"
   pnpm install --frozen-lockfile --prefer-offline || log "pnpm install failed (non-blocking)"
diff --git a/dist/checks/before/files.js b/dist/checks/before/files.js
index df595f009..30bed2644 100644
--- a/dist/checks/before/files.js
+++ b/dist/checks/before/files.js
@@ -135,6 +135,27 @@ export function detectOpencodeSubstringFetchGrants(cwd) {
         action: `Review each entry. If you did not add it, remove it from \`permission.bash\` in ${OPENCODE_JSON_REL}; shell \`curl\` / \`wget\` then fall back to the \`curl *\` / \`wget *\` ask. bkit no longer writes these entries and never removes them for you.`,
     };
 }
+const CLOUD_BOOTSTRAP_REL = ".claude/hooks/bkit-cloud-bootstrap.sh";
+const CLOUD_BOOTSTRAP_TEMPLATE_REL = ".bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh";
+/**
+ * Advisory: an adopted `.claude/hooks/bkit-cloud-bootstrap.sh` never reads
+ * `BKIT_CLOUD_ALLOWLIST_FINGERPRINT`, so a stale cloud network allowlist goes unwarned.
+ * Matches the variable name, never byte identity, so a customised bootstrap that compares
+ * the variable its own way is accepted. Silent when no bootstrap is adopted. Reads only.
+ */
+export function detectCloudBootstrapFingerprintMissing(cwd) {
+    const abs = path.join(cwd, CLOUD_BOOTSTRAP_REL);
+    if (!fs.existsSync(abs))
+        return null;
+    if (fs.readFileSync(abs, "utf-8").includes("BKIT_CLOUD_ALLOWLIST_FINGERPRINT"))
+        return null;
+    return {
+        id: "cloud-bootstrap-fingerprint-missing",
+        severity: "advisory",
+        detect: `${CLOUD_BOOTSTRAP_REL} never reads \`BKIT_CLOUD_ALLOWLIST_FINGERPRINT\`, so a cloud session cannot warn when the network allowlist pasted into the cloud dashboard is stale.`,
+        action: `Copy the fingerprint block (the \`EXPECTED_FP\` section after the workspace-trust check) from ${CLOUD_BOOTSTRAP_TEMPLATE_REL} into ${CLOUD_BOOTSTRAP_REL}, or compare \`BKIT_CLOUD_ALLOWLIST_FINGERPRINT\` with the \`fingerprint\` in \`.bkit/allowlist.json\` your own way. Then set the variable in the cloud environment to the fingerprint printed in \`.claude/bkit-cloud.md\` § Network access.`,
+    };
+}
 /**
  * Advisory: detect when a JSON file is missing content the template owns.
  * Runs deepContains(template, consumerFile) — fires when ok=false.
diff --git a/dist/checks/before/index.js b/dist/checks/before/index.js
index 2d92c89d9..cc99df008 100644
--- a/dist/checks/before/index.js
+++ b/dist/checks/before/index.js
@@ -14,7 +14,7 @@
 import { readInstallingVersion } from "../../shared/package-json.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import { detectBkitNotOnPath, detectMalformedPackageJson, detectNoPackageJson, detectNotGitRepo, detectInvalidAskSettings, detectBuildPublish, detectInvalidTaskCaps, detectTaskCapFormStale, detectUnmarkedPlans, } from "./repo.js";
-import { MARKERED_TEXT_DRIFT_PATHS, detectGitignoreBlockDuplicates, detectPlaywrightReporterHostile, detectOpencodeSubstringFetchGrants, detectTier2JsonDrift, detectTier2TextDrift, } from "./files.js";
+import { MARKERED_TEXT_DRIFT_PATHS, detectGitignoreBlockDuplicates, detectPlaywrightReporterHostile, detectOpencodeSubstringFetchGrants, detectCloudBootstrapFingerprintMissing, detectTier2JsonDrift, detectTier2TextDrift, } from "./files.js";
 import { detectBkitVersionMajorDowngrade, detectBkitVersionPinStale } from "./version.js";
 import { detectContextFetchContextMissing, detectContextFetchMissing, detectContextFetchProvisionMissing, detectContextFetchSourceNotEnabled, detectContextFetchUnbounded, } from "./context-fetch.js";
 import { detectExtraMcpServers, detectMissingMcpServers } from "./mcp.js";
@@ -108,6 +108,9 @@ export function runPreflight(modules, cwd = process.cwd(), installingVersion, is
     const opencodeSubstringGrants = detectOpencodeSubstringFetchGrants(cwd);
     if (opencodeSubstringGrants)
         advisories.push(opencodeSubstringGrants);
+    const cloudBootstrapFingerprint = detectCloudBootstrapFingerprintMissing(cwd);
+    if (cloudBootstrapFingerprint)
+        advisories.push(cloudBootstrapFingerprint);
     const contextFetch = detectContextFetchMissing(cwd);
     if (contextFetch)
         advisories.push(contextFetch);
diff --git a/dist/install/cloud-env.js b/dist/install/cloud-env.js
index 953096a92..7c2d06c97 100644
--- a/dist/install/cloud-env.js
+++ b/dist/install/cloud-env.js
@@ -582,15 +582,15 @@ function writeGeneratedJson(cwd, rel, doc, dryRun) {
     return true;
 }
 /**
- * 8-hex fingerprint of the DERIVED egress set only — bases and hosts, sorted, never
- * the consumer union. Hosts are included (the Cursor paste is hosts-only). Editing
- * `allowed-domains` never moves it; editing a registry row does.
+ * 8-hex fingerprint of an entry list, sorted and de-duplicated. With no argument it
+ * covers the DERIVED egress set only — bases and hosts, never the consumer union (the
+ * Cursor and Codex paste notes use that); editing `allowed-domains` never moves it,
+ * editing a registry row does. Pass the resolved allowlist to cover consumer
+ * `allowed-domains` too (the Claude paste list and `.bkit/allowlist.json`).
  */
-export function egressFingerprint() {
-    const derived = [
-        ...new Set([...BKIT_SHIPPED_NETWORK_DOMAINS, ...BKIT_SHIPPED_NETWORK_HOSTS]),
-    ].sort();
-    return sha256(derived.join("\n")).slice(0, 8);
+export function egressFingerprint(entries) {
+    const set = entries ?? [...BKIT_SHIPPED_NETWORK_DOMAINS, ...BKIT_SHIPPED_NETWORK_HOSTS];
+    return sha256([...new Set(set)].sort().join("\n")).slice(0, 8);
 }
 /**
  * The "where these came from" clause of a network list's count note. A declared entry
@@ -631,10 +631,17 @@ export function renderCloudNetworkAllowlist(cwd) {
         "\n```\n\n" +
         `_${domains.length} entries (${domains.length / 2} domains, each as apex + \`*.\` wildcard): ` +
         networkSourceCounts(networkAllowlistBases(declared), BKIT_SHIPPED_NETWORK_DOMAINS) +
-        ". Derived set fingerprint `" +
-        egressFingerprint() +
+        ". Allowlist fingerprint `" +
+        egressFingerprint(domains) +
         "`._" +
         declaredNote +
+        "\n\nThe fingerprint is also recorded in `.bkit/allowlist.json`. After you paste the list, " +
+        "set `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` to it in the cloud environment's variables (or " +
+        "the setup script); the SessionStart bootstrap compares it with the repo's current " +
+        "fingerprint and warns on a mismatch, then continues. The stamp is an operator " +
+        "assertion that you pasted this list: the deployed dashboard allowlist stays " +
+        "unverified. After any `allowed-domains` change, run `bkit upgrade`, re-paste the list " +
+        "and update the variable." +
         "\n\nUnder **Trusted**, your app domains and most observability / API hosts are\n" +
         "unreachable, so cloud `/bkit-debug` gets no runtime logs and e2e can't hit your\n" +
         "deployment. **Full** works too but opens all egress.");
diff --git a/dist/install/network-allowlist.js b/dist/install/network-allowlist.js
index 0a050dba1..c5daa277c 100644
--- a/dist/install/network-allowlist.js
+++ b/dist/install/network-allowlist.js
@@ -5,15 +5,20 @@
 // it exists for every host that reads it and `bkit check` reports it missing or stale.
 import * as fs from "node:fs";
 import * as path from "node:path";
-import { resolveNetworkAllowlist } from "./cloud-env.js";
+import { egressFingerprint, resolveNetworkAllowlist } from "./cloud-env.js";
 import { readBkitVersion } from "./version-file.js";
 /** Consumer-relative path of the install-written curl/wget allowlist. */
 export const NETWORK_ALLOWLIST_RELPATH = path.join(".bkit", "allowlist.json");
 /** Where the cursor module wrote the allowlist up to 5.2.4 (migrated away). */
 export const RETIRED_NETWORK_ALLOWLIST_RELPATH = path.join(".cursor", "allowlist.json");
-/** The allowlist file body: `{ domains }`, apex + `*.` wildcard per base, sorted. */
+/**
+ * The allowlist file body: `{ domains, fingerprint }` — `domains` is apex + `*.` wildcard
+ * per base, sorted; `fingerprint` is the 8-hex stamp of that list, which the cloud
+ * bootstrap compares with `BKIT_CLOUD_ALLOWLIST_FINGERPRINT`.
+ */
 export function renderNetworkAllowlist(cwd) {
-    return JSON.stringify({ domains: resolveNetworkAllowlist(cwd) }, null, 2) + "\n";
+    const domains = resolveNetworkAllowlist(cwd);
+    return JSON.stringify({ domains, fingerprint: egressFingerprint(domains) }, null, 2) + "\n";
 }
 /**
  * Write `.bkit/allowlist.json` whole (hand edits do not survive — `allowed-domains` in
diff --git a/tests/shell/bkit-cloud-bootstrap-preflight.bats b/tests/shell/bkit-cloud-bootstrap-preflight.bats
index 0333826c1..9c1cf9cd1 100644
--- a/tests/shell/bkit-cloud-bootstrap-preflight.bats
+++ b/tests/shell/bkit-cloud-bootstrap-preflight.bats
@@ -6,7 +6,8 @@
 # records RUNTIME_GITHUBCLI loudly (always, not just on failure); emits a loud
 # NON-BLOCKING dual-lane signal when neither gh nor the GitHub MCP server
 # (both keyed off BKIT_GH_TOKEN) can authenticate — never a hook hard-stop
-# (SessionStart hooks cannot block the session).
+# (SessionStart hooks cannot block the session); compares
+# BKIT_CLOUD_ALLOWLIST_FINGERPRINT with .bkit/allowlist.json (the fingerprint block).
 #
 # Run: bats tests/shell/bkit-cloud-bootstrap-preflight.bats
 # Requires: bats >= 1.0
@@ -60,10 +61,18 @@ EOF
   for tool in bash sh cat node jq git; do
     ln -s "$(command -v "$tool")" "$NO_GH_BIN/$tool"
   done
+
+  # A tools-only PATH with gh (the fake) but NO jq, built the same way, so the
+  # jq-absent case holds even on a host with /usr/bin/jq.
+  NO_JQ_BIN="$(mktemp -d)"
+  ln -s "$FAKE_BIN/gh" "$NO_JQ_BIN/gh"
+  for tool in bash sh cat node git; do
+    ln -s "$(command -v "$tool")" "$NO_JQ_BIN/$tool"
+  done
 }
 
 teardown() {
-  rm -rf "$FAKE_BIN" "$WORKDIR" "$NO_GH_BIN"
+  rm -rf "$FAKE_BIN" "$WORKDIR" "$NO_GH_BIN" "$NO_JQ_BIN"
 }
 
 run_bootstrap() {
@@ -215,3 +224,76 @@ EOF
   grep -qx "supabase-local: local Supabase unavailable: 3 GB free, needs 10 GB" "$WORKDIR/hook.stdout"
   grep -qx "supabase-local: local Supabase unavailable: 3 GB free, needs 10 GB" "$WORKDIR/.bkit/.unavailable"
 }
+
+# --- allowlist fingerprint compare ---------------------------------------------
+# The hook compares BKIT_CLOUD_ALLOWLIST_FINGERPRINT (what the operator pasted into the
+# cloud environment) with the `fingerprint` in .bkit/allowlist.json. Every outcome warns
+# or reports and continues: a SessionStart hook never blocks the session.
+
+@test "fingerprint: warns with the refresh steps and exits 0 when BKIT_CLOUD_ALLOWLIST_FINGERPRINT is unset" {
+  mkdir -p "$WORKDIR/.bkit"
+  printf '{"domains":["example.com"],"fingerprint":"abcd1234"}\n' >"$WORKDIR/.bkit/allowlist.json"
+  run run_bootstrap env FAKE_GH_AUTH_OK=1
+  [ "$status" -eq 0 ]
+  [[ "$output" == *"WARNING"* ]]
+  [[ "$output" == *"BKIT_CLOUD_ALLOWLIST_FINGERPRINT"* ]]
+  [[ "$output" == *"abcd1234"* ]]
+}
+
+@test "fingerprint: warns naming both fingerprints when they differ, and continues" {
+  mkdir -p "$WORKDIR/.bkit"
+  printf '{"domains":["example.com"],"fingerprint":"abcd1234"}\n' >"$WORKDIR/.bkit/allowlist.json"
+  run run_bootstrap env FAKE_GH_AUTH_OK=1 BKIT_CLOUD_ALLOWLIST_FINGERPRINT=deadbeef
+  [ "$status" -eq 0 ]
+  [[ "$output" == *"WARNING"* ]]
+  [[ "$output" == *"abcd1234"* ]]
+  [[ "$output" == *"deadbeef"* ]]
+  [[ "$output" == *"gh-preflight: RUNTIME_GITHUBCLI=true"* ]]
+}
+
+@test "fingerprint: reports a match as operator-asserted with the deployed allowlist unverified" {
+  mkdir -p "$WORKDIR/.bkit"
+  printf '{"domains":["example.com"],"fingerprint":"abcd1234"}\n' >"$WORKDIR/.bkit/allowlist.json"
+  run run_bootstrap env FAKE_GH_AUTH_OK=1 BKIT_CLOUD_ALLOWLIST_FINGERPRINT=abcd1234
+  [ "$status" -eq 0 ]
+  [[ "$output" == *"operator-asserted"* ]]
+  [[ "$output" == *"unverified"* ]]
+}
+
+@test "fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent" {
+  mkdir -p "$WORKDIR/.bkit"
+  printf '{"domains":["example.com"]}\n' >"$WORKDIR/.bkit/allowlist.json"
+  run run_bootstrap env FAKE_GH_AUTH_OK=1 BKIT_CLOUD_ALLOWLIST_FINGERPRINT=abcd1234
+  [ "$status" -eq 0 ]
+  [[ "$output" == *"WARNING"* ]]
+  [[ "$output" == *"expected fingerprint"* ]]
+  [[ "$output" == *"unavailable"* ]]
+
+  printf '{"domains":["example.com"],"fingerprint":"abcd1234"}\n' >"$WORKDIR/.bkit/allowlist.json"
+  # jq is genuinely absent from the PATH the hook runs with.
+  [ -z "$(PATH="$NO_JQ_BIN" command -v jq)" ]
+  run bash -c 'printf "" | env -i PATH="$1" CLAUDE_CODE_REMOTE=true CLAUDE_PROJECT_DIR="$2" FAKE_GH_AUTH_OK=1 BKIT_CLOUD_ALLOWLIST_FINGERPRINT=abcd1234 bash "$3"' _ "$NO_JQ_BIN" "$WORKDIR" "$BOOTSTRAP_SH"
+  [ "$status" -eq 0 ]
+  [[ "$output" == *"WARNING"* ]]
+  [[ "$output" == *"expected fingerprint"* ]]
+  [[ "$output" == *"unavailable"* ]]
+}
+
+@test "fingerprint: rejects a value that is not 8 hex characters without echoing it" {
+  mkdir -p "$WORKDIR/.bkit"
+  printf '{"domains":["example.com"],"fingerprint":"abcd1234"}\n' >"$WORKDIR/.bkit/allowlist.json"
+  run run_bootstrap env FAKE_GH_AUTH_OK=1 BKIT_CLOUD_ALLOWLIST_FINGERPRINT='not-hex-SECRET-value'
+  [ "$status" -eq 0 ]
+  [[ "$output" == *"not an 8-hex fingerprint"* ]]
+  [[ "$output" != *"not-hex-SECRET-value"* ]]
+}
+
+@test "fingerprint: warns and continues when .bkit/allowlist.json is not valid JSON" {
+  mkdir -p "$WORKDIR/.bkit"
+  printf '{ this is not json\n' >"$WORKDIR/.bkit/allowlist.json"
+  run run_bootstrap env FAKE_GH_AUTH_OK=1 BKIT_CLOUD_ALLOWLIST_FINGERPRINT=abcd1234
+  [ "$status" -eq 0 ]
+  [[ "$output" == *"WARNING"* ]]
+  [[ "$output" == *"expected fingerprint"* ]]
+  [[ "$output" == *"unavailable"* ]]
+}
