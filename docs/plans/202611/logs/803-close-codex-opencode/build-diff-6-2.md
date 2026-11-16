diff --git a/.bkit/core/.codex/hooks/bkit-guardrails.cjs b/.bkit/core/.codex/hooks/bkit-guardrails.cjs
index d24c18c1b..ebf7e6ee8 100644
--- a/.bkit/core/.codex/hooks/bkit-guardrails.cjs
+++ b/.bkit/core/.codex/hooks/bkit-guardrails.cjs
@@ -67,6 +67,15 @@ function decideShell(cmd, dirs, ctx, session) {
   const c = String(cmd || "").trim();
   const v = classifyShell(c, dirs, ctx);
   if (!v) return allow();
+  // A private-key read is denied whatever tier won (`sudo cat id_rsa`, `echo x; cat id_rsa`).
+  if (v.tier !== "deny") {
+    const secret = shellSecretRead(c);
+    if (secret && secretFileKind(secret) === "key") {
+      return deny(
+        `Blocked by bkit Codex guardrails: this command reads ${secret}, a private-key file.\nNEVER read private keys through the shell.\nAsk the user to run the step that needs the key.`,
+      );
+    }
+  }
   switch (v.tier) {
     case "deny":
       return deny(`Blocked by bkit Codex guardrails: ${v.what}. ${v.fix}`);
diff --git a/.bkit/core/engine/checks/before/files.test.ts b/.bkit/core/engine/checks/before/files.test.ts
index 87c18a7e4..1e71504ab 100644
--- a/.bkit/core/engine/checks/before/files.test.ts
+++ b/.bkit/core/engine/checks/before/files.test.ts
@@ -301,6 +301,21 @@ describe("detectOpencodeSubstringFetchGrants", () => {
     expect(red).not.toContain("k=v");
   });
 
+  it("redacts schemeless user-info in a reported key", () => {
+    writeBash({ "curl *user:tok@example.com*": "allow" });
+    const f = detectOpencodeSubstringFetchGrants(tmpDir);
+    expect(f).not.toBeNull();
+    const text = `${f?.detect}\n${f?.action}`;
+    expect(text).not.toContain("user:tok");
+    expect(text).toContain("example.com");
+  });
+
+  it("redactUrlParts drops user-info with no scheme", () => {
+    const red = redactUrlParts("wget *user:tok@example.com/p*");
+    expect(red).not.toContain("user:tok");
+    expect(red).toContain("example.com");
+  });
+
   it("reports nothing and writes nothing for an absent, unparseable or map-less file", () => {
     expect(detectOpencodeSubstringFetchGrants(tmpDir)).toBeNull();
     expect(fs.existsSync(path.join(tmpDir, OC_REL))).toBe(false);
diff --git a/.bkit/core/engine/checks/before/files.ts b/.bkit/core/engine/checks/before/files.ts
index 1af62315f..2a4503218 100644
--- a/.bkit/core/engine/checks/before/files.ts
+++ b/.bkit/core/engine/checks/before/files.ts
@@ -116,7 +116,7 @@ export function isOpencodeSubstringFetchKey(key: string): boolean {
 
 /** Drop URL user-info and query / fragment text from a permission key before it is printed. */
 export function redactUrlParts(text: string): string {
-  return text.replace(/\/\/[^/@\s*]*@/g, "//").replace(/[?#][^*\s]*/g, "?…");
+  return text.replace(/[^/@\s*]+@/g, "").replace(/[?#][^*\s]*/g, "?…");
 }
 
 /**
diff --git a/.bkit/core/engine/commands/install/install.integration.test.ts b/.bkit/core/engine/commands/install/install.integration.test.ts
index 59a19d050..c00e6d96b 100644
--- a/.bkit/core/engine/commands/install/install.integration.test.ts
+++ b/.bkit/core/engine/commands/install/install.integration.test.ts
@@ -1375,7 +1375,37 @@ describe("Scenario — Codex + Antigravity install side by side without conflict
     expect(install.status, `install failed:\n${install.stdout}\n${install.stderr}`).toBe(0);
     const out = combinedOutput(install);
     expect(out).toContain("keep private keys out of the repo");
-    expect(out).toContain("docs/testing.md");
+  }, 180_000);
+
+  it("the codex-setup private-key action is self-contained in a fresh consumer", () => {
+    seedConsumer();
+    const install = run(["install", "--codex", "--tracker=github"]);
+    expect(install.status, `install failed:\n${install.stdout}\n${install.stderr}`).toBe(0);
+    const out = combinedOutput(install);
+    expect(out).toContain("codex-setup");
+    // A pointer to docs/testing.md is only valid when the consumer's own copy holds the recipe.
+    const own = path.join(tmpDir, "docs", "testing.md");
+    const body = [own]
+      .filter((f) => fs.existsSync(f))
+      .map((f) => fs.readFileSync(f, "utf-8"))
+      .join("");
+    // Only the codex-setup advisory block counts: from its header to the next advisory header.
+    const blockMatch =
+      /^--- \d+\/\d+ \[advisory\] codex-setup ---$[\s\S]*?(?=^--- \d+\/\d+ \[|(?![\s\S]))/m.exec(
+        out,
+      );
+    expect(blockMatch, `codex-setup advisory header missing:\n${out}`).not.toBeNull();
+    const advisoryBlock = String(blockMatch);
+    expect(advisoryBlock).toContain("Private-key shell reads");
+    const pointsAtOwnDoc = advisoryBlock.includes("docs/testing.md");
+    const recipeInOwnDoc = body.includes("Codex key-read deny");
+    expect({ pointsAtOwnDoc, recipeInOwnDoc }).not.toEqual({
+      pointsAtOwnDoc: true,
+      recipeInOwnDoc: false,
+    });
+    // The inline steps: trust .codex/, cat a synthetic id_rsa, confirm a control is denied.
+    expect(advisoryBlock).toContain("id_rsa");
+    expect(advisoryBlock).toContain("bkit tests jump");
   }, 180_000);
 });
 
diff --git a/.bkit/core/engine/install/modules/codex.ts b/.bkit/core/engine/install/modules/codex.ts
index 0c8113d47..1f2180161 100644
--- a/.bkit/core/engine/install/modules/codex.ts
+++ b/.bkit/core/engine/install/modules/codex.ts
@@ -224,6 +224,6 @@ export function runCodexModule(ctx: ModuleContext): void {
       "1. TRUST THE LAYER. Codex loads project-local hooks only once the `.codex/` layer is trusted. Until then GateGuard and ReadGuard are installed and never fire.\n" +
       "2. Workflows are SKILLS here, not slash commands: invoke `$bkit-design`, not `/bkit-design`.\n" +
       "3. Per-agent `tools:` is NOT enforced. Codex has no tool allowlist, so every agent gets the full built-in tool set. See .bkit/providers.md.\n" +
-      `4. SHELL READS OF SECRET FILES. Private-key shell reads (\`cat ~/.ssh/id_rsa\`, \`*.pem\`, \`*.p12\`) are ${CODEX_KEY_DENY_STATUS}. To act on it: trust the \`.codex/\` layer (item 1), keep private keys out of the repo, and run the manual recipe in docs/testing.md on a real Codex host before relying on the deny. \`.env\` shell reads stay advisory: the command runs with a note, so the protection is advisory only. Keep secrets out of reach with direnv (\`.envrc\`) and do not rely on this hook for \`.env\` files.`,
+      `4. SHELL READS OF SECRET FILES. Private-key shell reads (\`cat ~/.ssh/id_rsa\`, \`*.pem\`, \`*.p12\`) are ${CODEX_KEY_DENY_STATUS}. To act on it: trust the \`.codex/\` layer (item 1), keep private keys out of the repo, and check the deny on a real Codex host before relying on it: trust the \`.codex/\` layer, write a synthetic \`id_rsa\` containing no real key, ask Codex to run \`cat ./id_rsa\`, and confirm a control that the same hook denies (\`bkit tests jump\`) is also denied; if the control is not denied the hook did not run. \`.env\` shell reads stay advisory: the command runs with a note, so the protection is advisory only. Keep secrets out of reach with direnv (\`.envrc\`) and do not rely on this hook for \`.env\` files.`,
   });
 }
diff --git a/.bkit/core/engine/install/modules/index.integration.test.ts b/.bkit/core/engine/install/modules/index.integration.test.ts
index e3d9d6aae..fea5dbbde 100644
--- a/.bkit/core/engine/install/modules/index.integration.test.ts
+++ b/.bkit/core/engine/install/modules/index.integration.test.ts
@@ -945,6 +945,31 @@ describe("permissions-parity", () => {
       expect(codexVerdict("cat .env ~/.ssh/id_rsa")).toBe("deny");
     });
 
+    it("Codex denies a private-key read combined with an ask-tier command", () => {
+      for (const cmd of ["sudo cat ~/.ssh/id_rsa", "cat ~/.ssh/id_rsa; gh pr close 1"]) {
+        expect({ cmd, v: codexVerdict(cmd) }).toEqual({ cmd, v: "deny" });
+        // Cursor and Antigravity keep their ask.
+        expect({ cmd, v: cursorVerdict({ command: cmd }) }).toEqual({ cmd, v: "ask" });
+        expect({ cmd, v: antigravityShellVerdict(cmd) }).toEqual({ cmd, v: "ask" });
+      }
+    });
+
+    it("Codex denies a private-key read after a destructive git ask", () => {
+      const cmd = "git stash drop && cat certs/server.pem";
+      expect({ cmd, v: codexVerdict(cmd) }).toEqual({ cmd, v: "deny" });
+      expect({ cmd, v: cursorVerdict({ command: cmd }) }).toEqual({ cmd, v: "ask" });
+    });
+
+    it("Codex denies a private-key shell read chained after an ask-tier command", () => {
+      for (const cmd of [
+        "echo gh pr close; cat ~/.ssh/id_rsa",
+        "sudo cat ~/.ssh/id_rsa",
+        "git stash drop; cat certs/server.pem",
+      ]) {
+        expect({ cmd, v: codexVerdict(cmd) }).toEqual({ cmd, v: "deny" });
+      }
+    });
+
     it("the Codex private-key deny reason names the file and not the command", () => {
       const res = spawnSync("node", [CODEX_GUARDRAILS], {
         cwd: GENERATED,
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index a03c60fba..f430cc8a0 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -225,3 +225,4 @@
 {"schema":3,"ts":1794689191614,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":23,"lastConfirmed":1794689191614}
 {"schema":3,"ts":1794692880591,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":24,"lastConfirmed":1794692880591}
 {"schema":3,"ts":1794693768804,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":25,"lastConfirmed":1794693768804}
+{"schema":3,"ts":1794700080288,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":26,"lastConfirmed":1794700080288}
diff --git a/.bkit/version b/.bkit/version
index 0c5f789f0..74044bcf7 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -221,7 +221,7 @@
     ".claude/hooks/bkit-guardrails.cjs": "f763740fb29f3d3202722cf27d28a214deb368228dc0d6b4cda9f89800824ac3",
     ".claude/hooks/bkit-preflight.sh": "566dd1d6455e4da142a56f43f95a89d92aadca9c97cc4cd6e0f103b9bcfcf205",
     ".codex/hooks/bkit-gateguard.cjs": "7e3ed3f09d60e0e935f5bda669b48733a10e9cd521badcb30f1daa3051aa687a",
-    ".codex/hooks/bkit-guardrails.cjs": "4eb5286ed0daf7baf746cf53d8a51db586b5b961d40165ff4ca417ba4ff8fae1",
+    ".codex/hooks/bkit-guardrails.cjs": "2154b384da14a6b6c05471c5cf0e40c2d823f3e4af3bb64ab8037b79de43c632",
     ".cursor/hooks/bkit-gateguard.cjs": "465d0dab51064af52cb5530e45ededf43d469826065383f046f4397977a39a9c",
     ".cursor/hooks/bkit-guardrails.cjs": "5708da1856d4409e98fc8f526728cb534e9b99178608f018a2b216fc8184fe57",
     ".cursor/hooks/bkit-preflight.sh": "95bf73b2b001f94d83ed029a81092cda7a1c5bab0a6b6ede29b94b9454bb0bc1",
diff --git a/.codex/hooks/bkit-guardrails.cjs b/.codex/hooks/bkit-guardrails.cjs
index aae688b5b..9ecdf32c4 100644
--- a/.codex/hooks/bkit-guardrails.cjs
+++ b/.codex/hooks/bkit-guardrails.cjs
@@ -2915,6 +2915,15 @@ function decideShell(cmd, dirs, ctx, session) {
   const c = String(cmd || "").trim();
   const v = classifyShell(c, dirs, ctx);
   if (!v) return allow();
+  // A private-key read is denied whatever tier won (`sudo cat id_rsa`, `echo x; cat id_rsa`).
+  if (v.tier !== "deny") {
+    const secret = shellSecretRead(c);
+    if (secret && secretFileKind(secret) === "key") {
+      return deny(
+        `Blocked by bkit Codex guardrails: this command reads ${secret}, a private-key file.\nNEVER read private keys through the shell.\nAsk the user to run the step that needs the key.`,
+      );
+    }
+  }
   switch (v.tier) {
     case "deny":
       return deny(`Blocked by bkit Codex guardrails: ${v.what}. ${v.fix}`);
diff --git a/dist/checks/before/files.js b/dist/checks/before/files.js
index 30bed2644..2ea52c225 100644
--- a/dist/checks/before/files.js
+++ b/dist/checks/before/files.js
@@ -105,7 +105,7 @@ export function isOpencodeSubstringFetchKey(key) {
 }
 /** Drop URL user-info and query / fragment text from a permission key before it is printed. */
 export function redactUrlParts(text) {
-    return text.replace(/\/\/[^/@\s*]*@/g, "//").replace(/[?#][^*\s]*/g, "?…");
+    return text.replace(/[^/@\s*]+@/g, "").replace(/[?#][^*\s]*/g, "?…");
 }
 /**
  * Advisory: `.opencode/opencode.json` `permission.bash` holds substring `curl` / `wget`
diff --git a/dist/install/modules/codex.js b/dist/install/modules/codex.js
index c90d0b1aa..bb5a6e6d9 100644
--- a/dist/install/modules/codex.js
+++ b/dist/install/modules/codex.js
@@ -194,6 +194,6 @@ export function runCodexModule(ctx) {
             "1. TRUST THE LAYER. Codex loads project-local hooks only once the `.codex/` layer is trusted. Until then GateGuard and ReadGuard are installed and never fire.\n" +
             "2. Workflows are SKILLS here, not slash commands: invoke `$bkit-design`, not `/bkit-design`.\n" +
             "3. Per-agent `tools:` is NOT enforced. Codex has no tool allowlist, so every agent gets the full built-in tool set. See .bkit/providers.md.\n" +
-            `4. SHELL READS OF SECRET FILES. Private-key shell reads (\`cat ~/.ssh/id_rsa\`, \`*.pem\`, \`*.p12\`) are ${CODEX_KEY_DENY_STATUS}. To act on it: trust the \`.codex/\` layer (item 1), keep private keys out of the repo, and run the manual recipe in docs/testing.md on a real Codex host before relying on the deny. \`.env\` shell reads stay advisory: the command runs with a note, so the protection is advisory only. Keep secrets out of reach with direnv (\`.envrc\`) and do not rely on this hook for \`.env\` files.`,
+            `4. SHELL READS OF SECRET FILES. Private-key shell reads (\`cat ~/.ssh/id_rsa\`, \`*.pem\`, \`*.p12\`) are ${CODEX_KEY_DENY_STATUS}. To act on it: trust the \`.codex/\` layer (item 1), keep private keys out of the repo, and check the deny on a real Codex host before relying on it: trust the \`.codex/\` layer, write a synthetic \`id_rsa\` containing no real key, ask Codex to run \`cat ./id_rsa\`, and confirm a control that the same hook denies (\`bkit tests jump\`) is also denied; if the control is not denied the hook did not run. \`.env\` shell reads stay advisory: the command runs with a note, so the protection is advisory only. Keep secrets out of reach with direnv (\`.envrc\`) and do not rely on this hook for \`.env\` files.`,
     });
 }
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index 7e322c144..3bd07a9a0 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -372,3 +372,6 @@
 {"schema":3,"ts":1794353585867,"firstTs":1789018486814,"updates":5,"kind":"deferral","key":"opencode-has-no-script-hook-so-two-gates-are-inexpressible-there","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-generate","subagent":"bkit-plan-generate","model":"claude-opus-5-5"},"references":["441",".opencode/opencode.json",".bkit/core/engine/install/modules/index.integration.test.ts § permissions-parity","#803","#803 § Constraints and non-goals (owner scope revision, 2026-11-03): no new OpenCode enforcement plugin","docs/plans/202611/803-close-codex-opencode-plan.md § Out of Scope","docs/audits/202611/deferrals.md deferrals-11"],"type":"issue","category":"security","severity":"MEDIUM","reason":"scope-declared","summary":"opencode gates only through its permission table, so the shell-as-edit-channel gate and URL-host matching cannot be expressed on that host","description":"Two gates the other three hosts carry are absent on opencode, both for the same structural reason: it has a glob-keyed permission table and no guardrails script. (1) Shell-as-edit-channel -- deciding whether a redirect target is a tracked source file or scratch needs the path parsed, which a glob cannot do; a blanket sed -i ask would prompt constantly and would also break the sanctioned bulk rewrite at bkit-plan.md:923. (2) URL-host matching -- its curl allows are substring-keyed, so curl https://evil.example/?src=github.com and curl https://github.com.attacker.io/ both match a github.com allow and read as allowlisted. Cursor parses the host correctly; Claude and Codex now do too. #803 removes the generated substring allows (shell fetches ask, fetch-tool allows are exact origins), so gap (2) no longer allows a bypass; gap (1) stays. The #803 owner scope revision declares a new OpenCode enforcement plugin a non-goal.","remediation":"Give opencode a guardrails plugin alongside its existing GateGuard plugin, reusing the shared decision engine, then extend the shell-as-edit-channel and host-matching describes in .bkit/core/engine/install/modules/index.integration.test.ts § permissions-parity to include it. Plan-sized rather than mechanical: opencode's plugin contract differs from both the Cursor beforeShellExecution shape and the Claude-family PreToolUse envelope, so it is a third adapter rather than a copy.","status":"TRIAGED"}
 {"schema":3,"ts":1794353585868,"firstTs":1794353585868,"updates":1,"kind":"deferral","key":"803-cursor-codex-cloud-fingerprint-compare","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-generate","subagent":"bkit-plan-generate","model":"claude-opus-5-5"},"references":["#803","docs/plans/202611/803-close-codex-opencode-plan.md § Open Questions & Assumptions (Open Question 2)",".bkit/core/engine/install/cloud-env.ts renderWidenedNetworkList"],"type":"feature","category":"observability","severity":"LOW","reason":"needs-decision","summary":"Cursor and Codex cloud setup scripts do not compare an allowlist fingerprint","description":"#803 adds the fingerprint compare to the Claude cloud SessionStart bootstrap only. The Cursor and Codex cloud docs say their dashboard allowlist is an operator assertion and unverified, and keep the derived-set stamp, but no Cursor or Codex setup script warns when the pasted list and the repo diverge. Plan Open Question 2 recommends docs only; option B adds the compare to both setup-script renders.","remediation":"If the owner picks option B: stamp the Cursor and Codex paste lists with egressFingerprint(entries), add the same compare-and-warn block to the rendered Cursor and Codex setup scripts, and cover both with a shell test.","status":"OPEN"}
 {"schema":3,"ts":1794355279599,"firstTs":1794355279599,"updates":1,"kind":"deferral","key":"803-opencode-webfetch-exact-origin-never-revoked","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-update","subagent":"bkit-plan-update","model":"claude-opus-5-5"},"references":["#803","docs/plans/202611/803-close-codex-opencode-plan.md § Out of Scope","#803 § Constraints and non-goals (owner scope revision, 2026-11-03): no permission recovery journal, durable transaction/locking subsystem","381-opencode-bash-grants-never-revoked",".bkit/core/engine/install/modules/opencode.ts reconcileOpencodeJson",".bkit/core/engine/commands/install/uninstall.ts stripOpencodeJsonScope"],"type":"issue","category":"security","severity":"LOW","reason":"scope-declared","summary":"Exact-origin OpenCode webfetch allows are never revoked, and uninstall cannot tell a consumer-authored equal key from a derived one","description":"#803 replaces the derived *{base}* webfetch allows with https://{name} and https://{name}/* keys. Upgrade deep-merges existing keys, so both keys stay after the domain leaves allowed-domains, and the substring detector does not report exact-origin keys. Uninstall removes OpenCode keys by recomputing the derived set through stripOpencodeJsonScope, so a consumer-authored key equal to a derived one is deleted. Closing either gap needs a per-key ownership record for OpenCode permission keys, which the 2026-11-03 revision declares a non-goal. The shell part of 381-opencode-bash-grants-never-revoked closes in #803; this residual is the webfetch part.","remediation":"In a future issue: record the OpenCode permission keys bkit writes (for example in .bkit/version beside claudeAllowDerived), drop recorded keys that leave the derived set on upgrade, and strip only recorded keys on uninstall.","status":"OPEN"}
+{"schema":3,"ts":1794699116282,"firstTs":1794699116282,"updates":1,"kind":"deferral","key":"803-close-codex-opencode-challenge-low-bkit-core-engine-checks-before-files-ts-158","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["803-close-codex-opencode"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A consumer deletes the fingerprint compare from their adopted bootstrap but keeps the template's header comment that names `BKIT_CLOUD_ALLOWLIST_FINGERPRINT`, and `bkit check` stays silent","description":"LOW build challenge finding at .bkit/core/engine/checks/before/files.ts:158: A consumer deletes the fingerprint compare from their adopted bootstrap but keeps the template's header comment that names `BKIT_CLOUD_ALLOWLIST_FINGERPRINT`, and `bkit check` stays silent. Done when: `detectCloudBootstrapFingerprintMissing` matches the variable only on non-comment lines (drop lines matching `^\\s*#` first, as `detectPlaywrightReporterHostile` in the same file does), so a copy that mentions the variable only in a comment (the template's own lines 21-22 `# Customise: the BKIT_CLOUD_ALLOWLIST_FINGERPRINT block ...`) is still reported, while a customised copy that reads it in code raises nothing.","source":".bkit/core/engine/checks/before/files.ts:158"}
+{"schema":3,"ts":1794699116283,"firstTs":1794699116283,"updates":1,"kind":"deferral","key":"803-close-codex-opencode-challenge-low-bkit-core-engine-checks-before-files-ts-118","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["803-close-codex-opencode"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A consumer-authored OpenCode key `curl *user:ghp_token@github.com*` (user-info with no `//` scheme) is printed whole by the `opencode-substring-fetch-grants` advisory and the uninstall review line, so the credential lands in `bkit check` / CI / agent output","description":"LOW build challenge finding at .bkit/core/engine/checks/before/files.ts:118: A consumer-authored OpenCode key `curl *user:ghp_token@github.com*` (user-info with no `//` scheme) is printed whole by the `opencode-substring-fetch-grants` advisory and the uninstall review line, so the credential lands in `bkit check` / CI / agent output. Done when: `redactUrlParts` removes a user-info part (`<text>@` before a host) whether or not `//` precedes it, so `redactUrlParts(\"curl *user:tok@github.com*\")` holds no `tok` and still names `github.com`; the existing `curl *https://user:tok@example.com/p?k=v*` case still redacts; both callers (`detectOpencodeSubstringFetchGrants` and the uninstall review line in `.bkit/core/engine/commands/install/uninstall.ts`) use it unchanged. Verified by hand: the current helper returns `curl *user:tok@github.com*` unchanged.","source":".bkit/core/engine/checks/before/files.ts:118"}
+{"schema":3,"ts":1794699116284,"firstTs":1794699116284,"updates":1,"kind":"deferral","key":"803-close-codex-opencode-challenge-low-bkit-core-engine-ledgers-telemetry-ts-450","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["803-close-codex-opencode"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A subagent that reads untrusted text (a challenge agent over a diff, a debug agent over CI logs or web results) is steered by an embedded directive into appending an ACTIVE `docs/knowledge.jsonl` row, which every later build and debug agent reads as a trusted gotcha before touching code, because `KIND_WRITERS.knowledge` now admits any writer","description":"LOW build challenge finding at .bkit/core/engine/ledgers/telemetry.ts:450: A subagent that reads untrusted text (a challenge agent over a diff, a debug agent over CI logs or web results) is steered by an embedded directive into appending an ACTIVE `docs/knowledge.jsonl` row, which every later build and debug agent reads as a trusted gotcha before touching code, because `KIND_WRITERS.knowledge` now admits any writer. Done when: No agent can settle this: the owner's ACTIVE decision `any-agent-writes-knowledge` in `docs/decisions.jsonl` chose `ANY_WRITER` so the Discovered gotchas rule can be followed, and it does not weigh the persistent-injection path; `writerProblem` checks a self-declared `by` identity, so the old five-subagent list was never a strong control either. The owner decides between keeping `ANY_WRITER` and recording this risk in `docs/security.md` § Untrusted Content & Prompt Injection, landing agent-written knowledge rows as a non-ACTIVE status until the owner confirms them, or fencing knowledge rows as untrusted data where agents read them (`bkit ledgers query --ledger=knowledge`).","source":".bkit/core/engine/ledgers/telemetry.ts:450"}
