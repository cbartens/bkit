diff --git a/.agents/plugins/bkit/hooks/bkit-guardrails.cjs b/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
index 90156219b..7d4cc5da3 100644
--- a/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
+++ b/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
@@ -2822,12 +2822,14 @@ const COPY_HEADS = new Set(["cp", "install", "rsync", "scp"]);
 const PATTERN_HEADS = new Set(["grep", "egrep", "fgrep", "rg", "ag"]);
 
 /**
- * The first secret file a command reads through the shell (`cat .bkit/.env`,
+ * The secret file a command reads through the shell, a private-key path ahead of an env path
+ * (`cat .bkit/.env`,
  * `grep KEY .env.local`, `source .env`, `curl -d @.env …`), else null. Not reads: a
  * redirect target (`> .env`), a copy destination, a grep pattern (`grep -rn ".env" docs`),
  * and anything `NON_READING_HEADS` runs.
  */
 function shellSecretRead(c) {
+  let envHit = null;
   for (const line of commandLines(c)) {
     const words = commandWords(line);
     const head = (words[0] || "").replace(/^.*\//, "");
@@ -2850,11 +2852,13 @@ function shellSecretRead(c) {
       }
       if (/^(?:\d*|&)>/.test(w)) continue;
       for (const part of w.replace(/^</, "").split(/[=:@,]/)) {
-        if (secretFileKind(part)) return part;
+        const kind = secretFileKind(part);
+        if (kind === "key") return part;
+        if (kind && !envHit) envHit = part;
       }
     }
   }
-  return null;
+  return envHit;
 }
 
 /**
diff --git a/.bkit/core/.bkit/prompts.md b/.bkit/core/.bkit/prompts.md
index c8df89780..0a3024f09 100644
--- a/.bkit/core/.bkit/prompts.md
+++ b/.bkit/core/.bkit/prompts.md
@@ -432,7 +432,7 @@ Hooks add text to an agent's context mid-run. The text reaches every agent and s
 | --- | --- | --- | --- | --- |
 | GateGuard | First edit per (session, agent, file) | First touch → investigation checklist (file read, callers, symbols, contracts, conventions, instructions quoted); new file → reuse-over-duplicate checklist; gate-config path → fix-code-not-gate advisory; `docs/**.md` (not `docs/plans/`) → density advisory appended | All five | `.bkit/core/hooks/gateguard-engine.js` |
 | ReadGuard | Repeat read of an unchanged line range, same agent | Use-earlier-output note; re-read only if the output left context | All five | `.bkit/core/hooks/readguard-engine.js` |
-| Guardrails | Shell edit (`sed -i`, redirect into a source file); unlisted `curl` / `wget` host on Claude, Codex; Codex ask tier | Advisory naming the bypassed gate; command still runs | Claude, Codex, Antigravity, Cursor | `.bkit/core/hooks/guardrails-shell.js`, `.bkit/core/hooks/guardrails-tiers.js` |
+| Guardrails | Shell edit (`sed -i`, redirect into a source file); unlisted `curl` / `wget` host on Claude, Codex; Codex ask tier | Advisory naming the bypassed gate; command still runs. Codex `.env` shell reads are advisory too. Codex private-key shell reads are denied (configured to deny, not verified on a real Codex host) | Claude, Codex, Antigravity, Cursor | `.bkit/core/hooks/guardrails-shell.js`, `.bkit/core/hooks/guardrails-tiers.js` |
 
 - **Never a must-do:** hook text is advisory and fails open. It never fires on an untrusted Codex `.codex/` layer, and it arrives after the edit on OpenCode. A prompt instruction that must hold stays in the prompt.
 
diff --git a/.bkit/core/.bkit/providers.md b/.bkit/core/.bkit/providers.md
index 0fd25062a..4590180ee 100644
--- a/.bkit/core/.bkit/providers.md
+++ b/.bkit/core/.bkit/providers.md
@@ -268,7 +268,7 @@ Per-action gates on all five hosts, subagents included. This section is an overv

<!-- prettier-ignore -->
 | Guard | Trigger | Effect | Enforcement |
 | --- | --- | --- | --- |
 | Destructive commands | Shell | deny: force-push (never `--force-with-lease`), `rm -rf` / `rm -fr` on `/`, `~`, `$HOME` or `${HOME}` (bare, `/`, `/*`; the hooks also catch `-Rf` and `-r -f`), `chmod -R 777 /`; ask: `git reset --hard`, forced `git clean`, whole-tree `git checkout` / `git restore`, `git rebase -i`, `git stash drop` / `git stash clear`, `git filter-branch`, `--no-verify`, publish, destructive `gh` | Claude / OpenCode permission rules; Codex / Antigravity / Cursor `bkit-guardrails` hook. Codex ask → advisory |
-| Secret files | Read tool; shell reads on Codex, Antigravity, Cursor | Read tool: deny `*.pem` / `*.p12` / `id_rsa`, ask `.env` / `.env.*`. Shell reads of any of them: ask on Antigravity and Cursor, advisory on Codex, not gated on Claude and OpenCode (§ Permissions / auto-approve) | Codex shell → advisory |
+| Secret files | Read tool; shell reads on Codex, Antigravity, Cursor | Read tool: deny `*.pem` / `*.p12` / `id_rsa`, ask `.env` / `.env.*`. Shell reads of any of them: ask on Antigravity and Cursor, on Codex: private-key reads denied (configured to deny, not verified on a real Codex host), `.env` reads advisory; not gated on Claude and OpenCode (§ Permissions / auto-approve) | Codex shell → private-key deny (not verified on a real host), `.env` advisory |
 | Network | `curl` / `wget`, fetch tool | ask unless host in allowlist (§ Network allowlist) | Advisory on Claude shell, Codex; Antigravity denies once, retry passes |
 | Shell-as-edit-channel | `sed -i`, redirect into a source file | Advisory: edit skips pre-edit gates | All hosts except OpenCode |
 | GateGuard | First edit per (session, agent, file) | Investigation checklist; gate-config path → fix-code advisory; new file → reuse nudge; `docs/**.md` → density advisory | Advisory; `BKIT_GATEGUARD=deny` denies first touch once |
@@ -304,7 +304,7 @@ Per-action gates on all five hosts, subagents included. This section is an overv
 | `readguard-payload.js` | Claude, Codex, Antigravity, Cursor `readguard` | read / shell payload adapter `bkitReadguard(payload)`; compaction event → reset |
 | `antigravity-hook.js` | Antigravity `gateguard`, `guardrails`, `readguard` | Antigravity envelope → Claude-family shape (`fromAntigravityPayload`), call signature, deny-once advisory delivery (`adviseOnce`) |
 | `guardrails-shell.js` | Claude, Codex, Antigravity, Cursor `guardrails` | shell parsing (`shellSegments`, `shellWords`, `commandWords`, `commandLines`: `sh -c` scripts, `$(…)`, backticks, `( … )`), curl / wget host allowlist (`.bkit/allowlist.json` located from `hookDirs(payload)`), shell-as-edit-channel detection (quote-aware redirects) |
-| `guardrails-tiers.js` | Codex, Antigravity, Cursor `guardrails` | git parsing (`parseGit`), deny + ask rules, `secretFileKind`, shell secret-read detection, `classifyShell` precedence |
+| `guardrails-tiers.js` | Codex, Antigravity, Cursor `guardrails` | git parsing (`parseGit`), deny + ask rules, `secretFileKind`, shell secret-read detection (`shellSecretRead` returns a private-key path ahead of an `.env` path; Codex denies the key kind in its own hook), `classifyShell` precedence |
 | `guardrails-read.js` | Antigravity, Cursor `guardrails` | `classifyRead` over `secretFileKind`: deny `*.pem` / `*.p12` / `id_rsa`, ask `.env` / `.env.*` (not `.env.example`) |
 | `preflight-tracker.sh` | Claude, Cursor `preflight` | Tracker guard: GitHub (REST), Linear (GraphQL) and Jira (`bkit issues fetch`) key / issue checks, `bkit:auto` + terminal-by-category guards; a session with no issue id is unguarded |
 | `preflight-rules.sh` | Claude, Cursor `preflight` | the rules-read advisory sentence and its `emit_context` call, merged into the one SessionStart JSON document |
diff --git a/.bkit/core/.codex/hooks/bkit-guardrails.cjs b/.bkit/core/.codex/hooks/bkit-guardrails.cjs
index 36bc4fba4..d24c18c1b 100644
--- a/.bkit/core/.codex/hooks/bkit-guardrails.cjs
+++ b/.bkit/core/.codex/hooks/bkit-guardrails.cjs
@@ -76,8 +76,13 @@ function decideShell(cmd, dirs, ctx, session) {
         `bkit Codex guardrails: this destructive or privileged command (${v.what}) ran without confirmation, because Codex cannot prompt for one. It is on the PROHIBITED list in every bkit workflow.\nTell the user that you ran it.\nIf the user did not ask for this exact command, NEVER run it again.\n\`git clean\` and \`git checkout -- .\` destroy untracked files and uncommitted work, which no reflog can recover.\nCommand: ${c}`,
       );
     case "secret":
+      if (secretFileKind(v.path) === "key") {
+        return deny(
+          `Blocked by bkit Codex guardrails: this command reads ${v.path}, a private-key file.\nNEVER read private keys through the shell.\nAsk the user to run the step that needs the key.`,
+        );
+      }
       return ask(
-        `bkit Codex guardrails: this command read ${v.path}, an env, secrets or private-key file, without confirmation, because Codex cannot prompt for one.\nNEVER print secret values.\nPrefer direnv or documented non-secret examples.\nCommand: ${c}`,
+        `bkit Codex guardrails: this command read ${v.path}, an env or secrets file, without confirmation, because Codex cannot prompt for one.\nNEVER print secret values.\nPrefer direnv or documented non-secret examples.\nCommand: ${c}`,
       );
     case "fetch": {
       const fetchNote = `bkit Codex guardrails: outbound fetch to a host that is not on the network allowlist.\nConfirm the destination is intended before you rely on the result.\nCommand: ${c}`;
diff --git a/.bkit/core/engine/commands/install/install.integration.test.ts b/.bkit/core/engine/commands/install/install.integration.test.ts
index c24cee9cb..9cdb1d517 100644
--- a/.bkit/core/engine/commands/install/install.integration.test.ts
+++ b/.bkit/core/engine/commands/install/install.integration.test.ts
@@ -1351,6 +1351,23 @@ describe("Scenario — Codex + Antigravity install side by side without conflict
     expect(read(PLUGIN_SKILL)).toContain("`view_file`");
     assertCleanCheck("codex→antigravity");
   }, 180_000);
+
+  it("a --codex install reports the private-key and .env shell-read protection status", () => {
+    seedConsumer();
+    const install = run(["install", "--codex", "--tracker=github"]);
+    expect(install.status, `install failed:\n${install.stdout}\n${install.stderr}`).toBe(0);
+    const out = combinedOutput(install);
+    expect(out).toContain("codex-setup");
+    expect(out).toContain("Four things");
+    // Status phrase: not verified unless a real Codex session showed the deny.
+    expect(out).toMatch(
+      /configured to deny, not verified on a real Codex host|denied \(verified on codex-cli/,
+    );
+    expect(out).toMatch(/private-key/i);
+    // `.env` stays advisory, with the direnv corrective action.
+    expect(out).toMatch(/\.env[^\n]*advisory|advisory[^\n]*\.env/i);
+    expect(out).toContain("direnv");
+  }, 180_000);
 });
 
 // A tracker switch and an active-provider uninstall leave a consumer `bkit check` passes.
diff --git a/.bkit/core/engine/install/modules/codex.ts b/.bkit/core/engine/install/modules/codex.ts
index eff8db99e..b48e8935f 100644
--- a/.bkit/core/engine/install/modules/codex.ts
+++ b/.bkit/core/engine/install/modules/codex.ts
@@ -18,6 +18,13 @@ import { writeCodexCloudDoc } from "../cloud-env.js";
 import type { ModuleContext } from "./index.js";
 import { BKIT_PREFIX, installFile, listMdFiles, removeOrphans, trackMirrorWrite } from "./core.js";
 
+/**
+ * Status of the Codex private-key shell-read deny. Set from the recorded real-host result
+ * (`tests/experiments/hooks/results/<date>/bkit-codex-key-deny.json`): only an outcome of
+ * `denied` allows "denied (verified on codex-cli {version}, {date})".
+ */
+const CODEX_KEY_DENY_STATUS = "configured to deny, not verified on a real Codex host";
+
 /**
  * Convert a workflow orchestrator (`.bkit/core/workflows/*.md`) into a Codex SKILL.md.
  *
@@ -213,9 +220,10 @@ export function runCodexModule(ctx: ModuleContext): void {
     severity: "advisory",
     detect: "codex host installed (.codex/agents + .agents/skills/bkit-*).",
     action:
-      "Three things that differ from the other hosts:\n" +
+      "Four things that differ from the other hosts:\n" +
       "1. TRUST THE LAYER. Codex loads project-local hooks only once the `.codex/` layer is trusted. Until then GateGuard and ReadGuard are installed and never fire.\n" +
       "2. Workflows are SKILLS here, not slash commands: invoke `$bkit-design`, not `/bkit-design`.\n" +
-      "3. Per-agent `tools:` is NOT enforced. Codex has no tool allowlist, so every agent gets the full built-in tool set. See .bkit/providers.md.",
+      "3. Per-agent `tools:` is NOT enforced. Codex has no tool allowlist, so every agent gets the full built-in tool set. See .bkit/providers.md.\n" +
+      `4. SHELL READS OF SECRET FILES. Private-key shell reads (\`cat ~/.ssh/id_rsa\`, \`*.pem\`, \`*.p12\`) are ${CODEX_KEY_DENY_STATUS}. \`.env\` shell reads stay advisory: the command runs with a note, so the protection is advisory only. Keep secrets out of reach with direnv (\`.envrc\`) and do not rely on this hook for \`.env\` files.`,
   });
 }
diff --git a/.bkit/core/engine/install/modules/index.integration.test.ts b/.bkit/core/engine/install/modules/index.integration.test.ts
index 94101da79..e3d9d6aae 100644
--- a/.bkit/core/engine/install/modules/index.integration.test.ts
+++ b/.bkit/core/engine/install/modules/index.integration.test.ts
@@ -633,16 +633,22 @@ describe("permissions-parity", () => {
    * message naming `.env`, and an ask stalls autonomous and cloud runs. `expect` is the
    * script hosts' verdict; Claude and opencode allow every row.
    */
-  const SHELL_SECRET_READS: { cmd: string; expect: Verdict; why: string }[] = [
+  const SHELL_SECRET_READS: { cmd: string; expect: Verdict; codex?: Verdict; why: string }[] = [
     { cmd: "cat .bkit/.env", expect: "ask", why: "bkit tooling secrets" },
     { cmd: "cat .env", expect: "ask", why: "secrets" },
     { cmd: "grep KEY .env.local", expect: "ask", why: "secrets" },
     { cmd: "source .env", expect: "ask", why: "secrets loaded into the shell" },
     { cmd: "head -5 apps/web/.env.production", expect: "ask", why: "secrets" },
     { cmd: "cp .env /tmp/x", expect: "ask", why: "copy source is read" },
-    { cmd: "cat certs/server.pem", expect: "ask", why: "private-key material" },
-    { cmd: "openssl x509 -in cert.p12 -noout", expect: "ask", why: "private-key material" },
-    { cmd: "cat ~/.ssh/id_rsa", expect: "ask", why: "private-key material" },
+    { cmd: "cat certs/server.pem", expect: "ask", codex: "deny", why: "private-key material" },
+    {
+      cmd: "openssl x509 -in cert.p12 -noout",
+      expect: "ask",
+      codex: "deny",
+      why: "private-key material",
+    },
+    { cmd: "cat ~/.ssh/id_rsa", expect: "ask", codex: "deny", why: "private-key material" },
+    { cmd: "cat ~/.ssh/id_rsa.pub", expect: "allow", why: "public key, not private-key material" },
     { cmd: "cat .env.example", expect: "allow", why: "documented non-secret template" },
     { cmd: "cat .envrc", expect: "allow", why: "direnv loader, not a secrets file" },
     { cmd: "cp .env.example .env", expect: "allow", why: "copy destination is a write" },
@@ -652,6 +658,11 @@ describe("permissions-parity", () => {
     { cmd: 'git commit -m "ignore .env"', expect: "allow", why: "commit message text" },
   ];
 
+  /** Codex's verdict for a row: its own `codex` expectation, else the script hosts' one. */
+  function codexExpect(g: { expect: Verdict; codex?: Verdict }): Verdict {
+    return g.codex ?? g.expect;
+  }
+
   const READ_GATES: { file: string; expect: Verdict; why: string }[] = [
     { file: "certs/server.pem", expect: "deny", why: "private-key material" },
     { file: "certs/client.p12", expect: "deny", why: "private-key material" },
@@ -895,7 +906,7 @@ describe("permissions-parity", () => {
         });
         expect({ host: "codex", v: codexVerdict(g.cmd) }).toEqual({
           host: "codex",
-          v: g.expect,
+          v: codexExpect(g),
         });
         expect({ host: "antigravity", v: antigravityShellVerdict(g.cmd) }).toEqual({
           host: "antigravity",
@@ -913,6 +924,47 @@ describe("permissions-parity", () => {
         });
       });
     }
+
+    it("Codex denies shell reads of private-key files", () => {
+      for (const cmd of [
+        "cat ~/.ssh/id_rsa",
+        "cat certs/server.pem",
+        "openssl x509 -in cert.p12 -noout",
+      ]) {
+        expect({ cmd, v: codexVerdict(cmd) }).toEqual({ cmd, v: "deny" });
+        // Cursor and Antigravity keep their ask.
+        expect({ cmd, v: cursorVerdict({ command: cmd }) }).toEqual({ cmd, v: "ask" });
+        expect({ cmd, v: antigravityShellVerdict(cmd) }).toEqual({ cmd, v: "ask" });
+      }
+      // `.env` reads stay advisory on Codex, and a public key is allowed.
+      expect(codexVerdict("cat .env")).toBe("ask");
+      expect(codexVerdict("cat ~/.ssh/id_rsa.pub")).toBe("allow");
+    });
+
+    it("Codex denies a command that reads .env and a private key together", () => {
+      expect(codexVerdict("cat .env ~/.ssh/id_rsa")).toBe("deny");
+    });
+
+    it("the Codex private-key deny reason names the file and not the command", () => {
+      const res = spawnSync("node", [CODEX_GUARDRAILS], {
+        cwd: GENERATED,
+        input: JSON.stringify({
+          tool_name: "Bash",
+          tool_input: { command: "cat ~/.ssh/id_rsa" },
+        }),
+        encoding: "utf-8",
+      });
+      const hso = (
+        JSON.parse(res.stdout.trim()) as {
+          hookSpecificOutput: { permissionDecision: string; permissionDecisionReason?: string };
+        }
+      ).hookSpecificOutput;
+      expect(hso.permissionDecision).toBe("deny");
+      const reason = String(hso.permissionDecisionReason);
+      expect(reason).toContain("id_rsa");
+      expect(reason).not.toContain("Command:");
+      expect(reason).not.toContain("cat ~/.ssh/id_rsa");
+    });
   });
 
   // Codex is absent: its guardrail is registered on the shell tool only. Tracked in
diff --git a/.bkit/core/hooks/guardrails-tiers.js b/.bkit/core/hooks/guardrails-tiers.js
index be195030d..e23c3869f 100644
--- a/.bkit/core/hooks/guardrails-tiers.js
+++ b/.bkit/core/hooks/guardrails-tiers.js
@@ -241,12 +241,14 @@ const COPY_HEADS = new Set(["cp", "install", "rsync", "scp"]);
 const PATTERN_HEADS = new Set(["grep", "egrep", "fgrep", "rg", "ag"]);
 
 /**
- * The first secret file a command reads through the shell (`cat .bkit/.env`,
+ * The secret file a command reads through the shell, a private-key path ahead of an env path
+ * (`cat .bkit/.env`,
  * `grep KEY .env.local`, `source .env`, `curl -d @.env …`), else null. Not reads: a
  * redirect target (`> .env`), a copy destination, a grep pattern (`grep -rn ".env" docs`),
  * and anything `NON_READING_HEADS` runs.
  */
 function shellSecretRead(c) {
+  let envHit = null;
   for (const line of commandLines(c)) {
     const words = commandWords(line);
     const head = (words[0] || "").replace(/^.*\//, "");
@@ -269,11 +271,13 @@ function shellSecretRead(c) {
       }
       if (/^(?:\d*|&)>/.test(w)) continue;
       for (const part of w.replace(/^</, "").split(/[=:@,]/)) {
-        if (secretFileKind(part)) return part;
+        const kind = secretFileKind(part);
+        if (kind === "key") return part;
+        if (kind && !envHit) envHit = part;
       }
     }
   }
-  return null;
+  return envHit;
 }
 
 /**
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index b1989b0b0..5e9f3c822 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -9108,6 +9108,19 @@ Blocked by bkit Codex guardrails: ${v.what}. ${v.fix}
 Every bkit tests jump needs the human's approval and Codex cannot ask. Ask the human to run it in their own terminal.
 ```
 
+### guardrails-codex-key-shell-deny
+
+- hook: Guardrails
+- fires: Shell read of a private-key file, as a deny
+- hosts: Codex
+- source: `.bkit/core/.codex/hooks/bkit-guardrails.cjs` `decideShell`
+
+```text
+Blocked by bkit Codex guardrails: this command reads ${v.path}, a private-key file.
+NEVER read private keys through the shell.
+Ask the user to run the step that needs the key.
+```
+
 ### guardrails-codex-ask
 
 - hook: Guardrails
@@ -9126,12 +9139,12 @@ Command: ${c}
 ### guardrails-codex-secret-shell
 
 - hook: Guardrails
-- fires: Shell read of an env / secrets / private-key file, as an advisory
+- fires: Shell read of an env / secrets file, as an advisory
 - hosts: Codex
 - source: `.bkit/core/.codex/hooks/bkit-guardrails.cjs` `decideShell`
 
 ```text
-bkit Codex guardrails: this command read ${v.path}, an env, secrets or private-key file, without confirmation, because Codex cannot prompt for one.
+bkit Codex guardrails: this command read ${v.path}, an env or secrets file, without confirmation, because Codex cannot prompt for one.
 NEVER print secret values.
 Prefer direnv or documented non-secret examples.
 Command: ${c}
diff --git a/.bkit/prompts.md b/.bkit/prompts.md
index 7571cda4e..2fdfb2f7b 100644
--- a/.bkit/prompts.md
+++ b/.bkit/prompts.md
@@ -432,7 +432,7 @@ Hooks add text to an agent's context mid-run. The text reaches every agent and s
 | --- | --- | --- | --- | --- |
 | GateGuard | First edit per (session, agent, file) | First touch → investigation checklist (file read, callers, symbols, contracts, conventions, instructions quoted); new file → reuse-over-duplicate checklist; gate-config path → fix-code-not-gate advisory; `docs/**.md` (not `docs/plans/`) → density advisory appended | All five | `.bkit/core/hooks/gateguard-engine.js` |
 | ReadGuard | Repeat read of an unchanged line range, same agent | Use-earlier-output note; re-read only if the output left context | All five | `.bkit/core/hooks/readguard-engine.js` |
-| Guardrails | Shell edit (`sed -i`, redirect into a source file); unlisted `curl` / `wget` host on Claude, Codex; Codex ask tier | Advisory naming the bypassed gate; command still runs | Claude, Codex, Antigravity, Cursor | `.bkit/core/hooks/guardrails-shell.js`, `.bkit/core/hooks/guardrails-tiers.js` |
+| Guardrails | Shell edit (`sed -i`, redirect into a source file); unlisted `curl` / `wget` host on Claude, Codex; Codex ask tier | Advisory naming the bypassed gate; command still runs. Codex `.env` shell reads are advisory too. Codex private-key shell reads are denied (configured to deny, not verified on a real Codex host) | Claude, Codex, Antigravity, Cursor | `.bkit/core/hooks/guardrails-shell.js`, `.bkit/core/hooks/guardrails-tiers.js` |
 
 - **Never a must-do:** hook text is advisory and fails open. It never fires on an untrusted Codex `.codex/` layer, and it arrives after the edit on OpenCode. A prompt instruction that must hold stays in the prompt.
 
diff --git a/.bkit/providers.md b/.bkit/providers.md
index 9916fd212..be024e264 100644
--- a/.bkit/providers.md
+++ b/.bkit/providers.md
@@ -268,7 +268,7 @@ Per-action gates on all five hosts, subagents included. This section is an overv

<!-- prettier-ignore -->
 | Guard | Trigger | Effect | Enforcement |
 | --- | --- | --- | --- |
 | Destructive commands | Shell | deny: force-push (never `--force-with-lease`), `rm -rf` / `rm -fr` on `/`, `~`, `$HOME` or `${HOME}` (bare, `/`, `/*`; the hooks also catch `-Rf` and `-r -f`), `chmod -R 777 /`; ask: `git reset --hard`, forced `git clean`, whole-tree `git checkout` / `git restore`, `git rebase -i`, `git stash drop` / `git stash clear`, `git filter-branch`, `--no-verify`, publish, destructive `gh` | Claude / OpenCode permission rules; Codex / Antigravity / Cursor `bkit-guardrails` hook. Codex ask → advisory |
-| Secret files | Read tool; shell reads on Codex, Antigravity, Cursor | Read tool: deny `*.pem` / `*.p12` / `id_rsa`, ask `.env` / `.env.*`. Shell reads of any of them: ask on Antigravity and Cursor, advisory on Codex, not gated on Claude and OpenCode (§ Permissions / auto-approve) | Codex shell → advisory |
+| Secret files | Read tool; shell reads on Codex, Antigravity, Cursor | Read tool: deny `*.pem` / `*.p12` / `id_rsa`, ask `.env` / `.env.*`. Shell reads of any of them: ask on Antigravity and Cursor, on Codex: private-key reads denied (configured to deny, not verified on a real Codex host), `.env` reads advisory; not gated on Claude and OpenCode (§ Permissions / auto-approve) | Codex shell → private-key deny (not verified on a real host), `.env` advisory |
 | Network | `curl` / `wget`, fetch tool | ask unless host in allowlist (§ Network allowlist) | Advisory on Claude shell, Codex; Antigravity denies once, retry passes |
 | Shell-as-edit-channel | `sed -i`, redirect into a source file | Advisory: edit skips pre-edit gates | All hosts except OpenCode |
 | GateGuard | First edit per (session, agent, file) | Investigation checklist; gate-config path → fix-code advisory; new file → reuse nudge; `docs/**.md` → density advisory | Advisory; `BKIT_GATEGUARD=deny` denies first touch once |
@@ -304,7 +304,7 @@ Per-action gates on all five hosts, subagents included. This section is an overv
 | `readguard-payload.js` | Claude, Codex, Antigravity, Cursor `readguard` | read / shell payload adapter `bkitReadguard(payload)`; compaction event → reset |
 | `antigravity-hook.js` | Antigravity `gateguard`, `guardrails`, `readguard` | Antigravity envelope → Claude-family shape (`fromAntigravityPayload`), call signature, deny-once advisory delivery (`adviseOnce`) |
 | `guardrails-shell.js` | Claude, Codex, Antigravity, Cursor `guardrails` | shell parsing (`shellSegments`, `shellWords`, `commandWords`, `commandLines`: `sh -c` scripts, `$(…)`, backticks, `( … )`), curl / wget host allowlist (`.bkit/allowlist.json` located from `hookDirs(payload)`), shell-as-edit-channel detection (quote-aware redirects) |
-| `guardrails-tiers.js` | Codex, Antigravity, Cursor `guardrails` | git parsing (`parseGit`), deny + ask rules, `secretFileKind`, shell secret-read detection, `classifyShell` precedence |
+| `guardrails-tiers.js` | Codex, Antigravity, Cursor `guardrails` | git parsing (`parseGit`), deny + ask rules, `secretFileKind`, shell secret-read detection (`shellSecretRead` returns a private-key path ahead of an `.env` path; Codex denies the key kind in its own hook), `classifyShell` precedence |
 | `guardrails-read.js` | Antigravity, Cursor `guardrails` | `classifyRead` over `secretFileKind`: deny `*.pem` / `*.p12` / `id_rsa`, ask `.env` / `.env.*` (not `.env.example`) |
 | `preflight-tracker.sh` | Claude, Cursor `preflight` | Tracker guard: GitHub (REST), Linear (GraphQL) and Jira (`bkit issues fetch`) key / issue checks, `bkit:auto` + terminal-by-category guards; a session with no issue id is unguarded |
 | `preflight-rules.sh` | Claude, Cursor `preflight` | the rules-read advisory sentence and its `emit_context` call, merged into the one SessionStart JSON document |
@@ -485,7 +485,7 @@ It is fail-open and never blocks. The log lives in per-user OS temp (`bkit-readg
 | File / secrets — read tool | `.claude/settings.json` → `permissions` `Read(...)`: `*.pem` / `*.p12` / `id_rsa` deny; `.env` / `.env.*` ask — `.env.example` too: its `allow` row never fires, `ask` is evaluated before `allow` | none — no file-read tool | `.agents/plugins/bkit/hooks/bkit-guardrails.cjs` via `PreToolUse` (`view_file`, path `AbsolutePath`) — key deny; `.env` / `.env.*` ask (Antigravity's own `ask`); `.env.example` allowed | `.cursor/hooks/bkit-guardrails.cjs` via `preToolUse` (`Read\|TabRead`) — key deny; `.env` / `.env.*` ask; `.env.example` allowed | `.opencode/opencode.json` → `permission.read` map — key deny; `.env` / `.env.*` ask; `.env.example` allowed |
 | File / secrets — shell (`cat .bkit/.env`) | not gated — no `Bash(...)` rows: a command-text glob cannot tell `cat .env` from `cp .env.example .env`, a grep pattern or a commit message, and an ask stalls autonomous and cloud runs. A file command Claude recognises (`cat`, `head`, `tail`, `sed`, `tee`) on a key file still hits the `Read(...)` deny, which Claude applies to those commands | same detection as Cursor via `PreToolUse` (`Bash`) — advisory `additionalContext`, command runs | same detection as Cursor via `PreToolUse` (`run_command`) — Antigravity's own `ask` | `beforeShellExecution` ask on any program reading `.env`, `.env.*` (not `.env.example`), `*.pem`, `*.p12` or `id_rsa` (args, `< file`, `--opt=file`, `@file`, `rev:file`, copy sources, `sh -c` scripts); redirect targets, copy destinations, grep / rg patterns, comments and `ls` / `stat` / `test` / `touch` / `rm` / `mv` / `ln` / `chmod` / `echo` pass | not gated — no `permission.bash` rows, same reason as Claude |
 | Shell / destructive | `permissions.deny` globs on force-push in any argument position — `--force`, `-f` / `-f…` cluster, `+refspec`, never `--force-with-lease` — plus `rm -rf` / `rm -fr` on `/*`, `~`, `~/*`, `$HOME`, `$HOME/*`, `${HOME}`, `${HOME}/*`, `chmod -R 777 /`; `permissions.ask` globs on publish, destructive gh, and destructive git in common flag orders (`git reset … --hard`, forced `git clean` (`-…f…`), whole-tree `git checkout` / `git restore`, `git rebase … -i`, `git stash drop` / `git stash clear`, `git filter-branch`), `--no-verify` on any git subcommand, `git commit -n`. Force-push and `reset --hard` globs also cover git global options before the subcommand (`git -C dir push --force`, `git -c k=v push origin +ref`, `git -C dir reset --hard`) and `f` second in a cluster (`-uf`, `-vf`). Globs match the command text, so `f` later in a cluster (`-uvf`) is not matched; the parsed hosts catch it. Shell `curl` / `wget` are not gated here — `permissions` cannot match a URL host, so only the `WebFetch` tool is allowlisted | `.codex/hooks/bkit-guardrails.cjs` via `PreToolUse` (`Bash`) — Cursor's parsed tiers; deny blocks; ask emitted as advisory `additionalContext`, command runs (Codex cannot prompt) | same hook via `PreToolUse` (`run_command`) — Cursor's parsed tiers; deny blocks every time; ask = Antigravity's own `ask` | `.cursor/hooks/bkit-guardrails.cjs` via `beforeShellExecution` — same tiers, classified on the parsed command: git subcommand after global options (`-C`, `-c`, `--git-dir`, …), flags in any order, short clusters expanded, option values never read as flags; every `&&` / `;` / `\|` segment, `sh -c` script and `$(…)` substitution. `git clean -n` / `--dry-run` and `git restore --staged .` pass | `permission.bash` deny / ask globs, last match wins — same globs and gap as Claude |
-| Network fetch | `WebSearch` + tooling `WebFetch(domain:…)`; install / upgrade enriches from the shipped egress registry union consumer `allowed-domains` in `.agents/context.md` (stack hosts never shipped), recording what it wrote so it can later prune it | `curl`/`wget` off `.bkit/allowlist.json` → advisory `additionalContext`, command runs | `curl`/`wget` off `.bkit/allowlist.json` → denied once with the advisory, retry passes; `read_url` / `search_web` ungated | `curl`/`wget` ask unless host in `.bkit/allowlist.json` (tooling and consumer domains) | `websearch` allow; `webfetch` URL map (`"*": ask` → `*{domain}*: allow`) for the fetch tool and `curl *`/`wget *` ask → `curl *{domain}*`/`wget *{domain}*` allow for shell, from the same allowlist (baked into `opencode.json`) |
+| Network fetch | `WebSearch` + tooling `WebFetch(domain:…)`; install / upgrade enriches from the shipped egress registry union consumer `allowed-domains` in `.agents/context.md` (stack hosts never shipped), recording what it wrote so it can later prune it | `curl`/`wget` off `.bkit/allowlist.json` → advisory `additionalContext`, command runs | `curl`/`wget` off `.bkit/allowlist.json` → denied once with the advisory, retry passes; `read_url` / `search_web` ungated | `curl`/`wget` ask unless host in `.bkit/allowlist.json` (tooling and consumer domains) | `websearch` allow; `webfetch` URL map (`"*": ask` → `*{domain}*: allow`) for the fetch tool, from the same allowlist (baked into `opencode.json`); shell `curl *`/`wget *` ask with no derived allow |
 | Granularity | Per-tool glob | Hook script (project-scoped, fail-open; fires only once `.codex/` is trusted) | Hook script (workspace plugin, fail-open) | Hook script (project-scoped, fail-open; `failClosed` blocks only a crashed hook) | Per-path / per-command glob in `permission` |
 | Modes | `defaultMode: default \| acceptEdits \| plan \| bypassPermissions` | host defaults — bkit writes no `.codex/config.toml` | host defaults — bkit ships none | Implicit per-mode (Composer / Agent / Background) | `opencode --auto` + permission defaults |
 | MCP server config | `.mcp.json` at repo root (`mcpServers.<name>.url`) | none written | none written | `.cursor/mcp.json` (same `mcpServers.<name>.url` shape) | `.opencode/opencode.json` → `mcp` |
@@ -507,7 +507,7 @@ It is fail-open and never blocks. The log lives in per-user OS temp (`bkit-readg
 | **Codex** | Reads the same `.bkit/allowlist.json` at runtime via `.codex/hooks/bkit-guardrails.cjs` | Codex has no project-level permission file. The hook host-parses `curl`/`wget` and emits an advisory `ask` — Codex cannot prompt, so the allowlist informs rather than enforces. |
 | **Antigravity** | Reads the same `.bkit/allowlist.json` at runtime via `.agents/plugins/bkit/hooks/bkit-guardrails.cjs` | Antigravity has no project-level permission file. The hook host-parses `curl`/`wget` on the `run_command` matcher and denies a non-allowlisted fetch once with the advisory as the reason; the retry passes. |
 | **Cursor** | Generated `.bkit/allowlist.json` read at runtime by `.cursor/hooks/bkit-guardrails.cjs` | Cursor has no project settings equivalent to Claude `permissions` / OpenCode `permission` for curl host globs. Parity is a hook (`beforeShellExecution`): ask on `curl`/`wget` unless every URL host is on the allowlist. |
-| **OpenCode** | Baked into `.opencode/opencode.json`: `permission.webfetch` URL map (`"*": "ask"` then `*{domain}*: allow`) for the fetch tool, and `permission.bash` `curl *`/`wget *` ask then `curl *{domain}*`/`wget *{domain}*` allow for shell fetch (last-match-wins on both) | Both fetch surfaces are domain-gated, so an allowlisted host does not prompt whichever path the agent takes. `webfetch` matches the resource against the requested URL, `bash` against the command string. **Looser than Claude's `domain:`:** OpenCode globs match the whole string (`*` → `.*`, crossing `/` `?` `@`), so `*{domain}*` allows the domain anywhere in the URL or command — apex and every subdomain, but also `https://evil.tld/?x={domain}`. Accepted risk: no OpenCode glob covers subdomains without it. No separate allowlist file. |
+| **OpenCode** | Baked into `.opencode/opencode.json`: `permission.webfetch` URL map (`"*": "ask"` then `*{domain}*: allow`) for the fetch tool (last-match-wins). Shell `curl *`/`wget *` keep their ask: no allow is derived for them, because a glob over the command string also matches a host in a query or user-info part. Substring `curl` / `wget` allows an earlier install wrote are reported by the `opencode-substring-fetch-grants` advisory for owner review, never removed | Only the fetch tool is domain-allowed, so an allowlisted host does not prompt there; shell fetches ask. `webfetch` matches the resource against the requested URL. **Looser than Claude's `domain:`:** OpenCode globs match the whole string (`*` → `.*`, crossing `/` `?` `@`), so `*{domain}*` allows the domain anywhere in the URL — apex and every subdomain, but also `https://evil.tld/?x={domain}`. Accepted risk (decision 551): no OpenCode glob covers subdomains without it. No separate allowlist file. |
 
 **`.bkit/allowlist.json`:** core-owned. It is written on every install / upgrade whatever the host set, and removed by full uninstall. Do not hand-edit it, because install / upgrade rewrites it whole. Change `allowed-domains` instead. `bkit check` fails when it is missing or stale. The hook finds it from the payload's repo dirs (`workspace_roots`, `cwd`, Antigravity `workspacePaths`), then its own cwd, walking up to the `.git` root, because Antigravity runs plugin hooks from the plugin dir. When the file is missing, every host reads as unknown. The hook embeds no list, because a second copy drifts from the registry silently.
 
@@ -520,7 +520,7 @@ It is fail-open and never blocks. The log lives in per-user OS temp (`bkit-readg
 <!-- prettier-ignore -->
 | Host | Where the allows live | Rule per server `<s>` |
 | --- | --- | --- |
-| **Claude** | `.claude/settings.json` `permissions.allow`, recorded in `.bkit/version` `claudeAllowDerived` so a server dropped from the block is pruned | `mcp__<s>__*` (`.mcp.json` servers; claude.ai connectors in cloud sessions) + `mcp__claude_ai_<s>__*` (claude.ai connectors in the local CLI) |
+| **Claude** | `.claude/settings.json` `permissions.allow`, recorded in `.bkit/version` `claudeAllowDerived` so a server dropped from the block is pruned; `bkit uninstall` removes only the rows that record holds and lists other derived-looking rows for owner review | `mcp__<s>__*` (`.mcp.json` servers; claude.ai connectors in cloud sessions) + `mcp__claude_ai_<s>__*` (claude.ai connectors in the local CLI) |
 | **Cursor** | Generated `.cursor/cli.json` `permissions.allow` — Cursor CLI + cloud agents. The IDE agent's MCP auto-run list is user-level only | `Mcp(<s>:*)` |
 | **OpenCode** | Baked into `.opencode/opencode.json` → `permission` | `"<s>_*": "allow"` — OpenCode names MCP tools `<s>_<tool>` |
 
diff --git a/.bkit/version b/.bkit/version
index d4f957856..938b35295 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -193,7 +193,7 @@
     "docs/templates/bkit-audit-cost.md": "53c86ef642f5f9f9ec23a7a2febfe1a8226a1da7f13f1d394ed9c9bb76ade859",
     "docs/templates/bkit-audit-coverage.md": "4c3584fdba306b59e9cbab3e34025cc97929eba5858dd48b362f50989ee51eee",
     "docs/templates/bkit-audit-deferrals.md": "f5f7a6b900b8016b847499e388c99663fcf64f08418885e15f9bcb1bf703bbd5",
-    "docs/templates/bkit-audit-dependencies.md": "1f806abe33ffdc3d29f3adf5c091e06ed78ba362adc79f14009a28f0cd75197e",
+    "docs/templates/bkit-audit-dependencies.md": "ac25cc7ab05f9062868d89d6789d78a4651642f9c993aef85ab8e3cb1dba446a",
     "docs/templates/bkit-audit-failures.md": "143e6881a81e4693df6edf6ba074ac6905d8300e04791112c8b6a757716e90ce",
     "docs/templates/bkit-audit-flakes.md": "9349b5851b1ace1e2c21a5e99e73322ef845ece148295762e93e486fc42cf4d4",
     "docs/templates/bkit-audit-gates.md": "9808ac55e349f1550df59cc29920fed9f763f94ff9a6502b27481d2db318396d",
@@ -211,19 +211,19 @@
     ".bkit/comparison.md": "48845a4c08abe236dcb5af4947db755a10aad06996a87c5d5b1bed07528514de",
     ".bkit/install.md": "42dc98ac1962ce9acd03d5c0777e88f3b7afe9b600a53398ee4b26673d7d1e86",
     ".bkit/jsonl.md": "1c0d5597648167929c2098fa0176ac2daa5eaca7b198bd040f2fa79b1b5b40ab",
-    ".bkit/providers.md": "e87503c7cc4d045997c30ea315f76438589abc9bcf038f63ce291ca85b8f1e1f",
-    ".bkit/prompts.md": "40c140b8c9d4e6d3ee91b8d106cbe78d1bff751343c4341668064decd0f4eb1e",
+    ".bkit/providers.md": "8b73ee36aededb4bea344cd181e13eadd5b8f825e51f894ad7801c8d79c1e51b",
+    ".bkit/prompts.md": "7cc77694de5dd0da4c39fd43f6d82f25121a87309a6842fd1c84786d3e4e834b",
     ".bkit/trackers.md": "c3b91b7ffcf75333bc2d09af7c9d887397850539b87b964441025e8978f41803",
-    ".bkit/workflows.md": "6f0c596eb9878a4cdb8ee0b47af44524aa24bb1ba614173011ed5bd5ececf8dc",
+    ".bkit/workflows.md": "663ca2cafcbb733a306be952f89cee8f278d03f98ccf56198151397352ab495e",
     ".bkit/README.md": "7e46439319d2c1befb9ee4f1ff7fb2d4ffdf442bc7bc0f45217704b1cc4dceb5",
     ".cursor/rules/bkit-rules.mdc": "0c15e475a322bd66f4f2258b5ffc2a6700bb9c9d217a75fa18d8168c9e1106e8",
     ".claude/hooks/bkit-gateguard.cjs": "c49a6b4aa6289f9eacf5cda6fced12a9811a244bd50948c2ef5cdb2741ea848f",
     ".claude/hooks/bkit-guardrails.cjs": "f763740fb29f3d3202722cf27d28a214deb368228dc0d6b4cda9f89800824ac3",
     ".claude/hooks/bkit-preflight.sh": "566dd1d6455e4da142a56f43f95a89d92aadca9c97cc4cd6e0f103b9bcfcf205",
     ".codex/hooks/bkit-gateguard.cjs": "7e3ed3f09d60e0e935f5bda669b48733a10e9cd521badcb30f1daa3051aa687a",
-    ".codex/hooks/bkit-guardrails.cjs": "769c5bef7a18474bf9d3cbfcd5198c51143452128f6c7e2561153ef7c0f5cb6e",
+    ".codex/hooks/bkit-guardrails.cjs": "4eb5286ed0daf7baf746cf53d8a51db586b5b961d40165ff4ca417ba4ff8fae1",
     ".cursor/hooks/bkit-gateguard.cjs": "465d0dab51064af52cb5530e45ededf43d469826065383f046f4397977a39a9c",
-    ".cursor/hooks/bkit-guardrails.cjs": "38270063855dcabd89c28e57c29a24cff08a2e473416be36a4109c86a6c3433d",
+    ".cursor/hooks/bkit-guardrails.cjs": "5708da1856d4409e98fc8f526728cb534e9b99178608f018a2b216fc8184fe57",
     ".cursor/hooks/bkit-preflight.sh": "95bf73b2b001f94d83ed029a81092cda7a1c5bab0a6b6ede29b94b9454bb0bc1",
     ".opencode/plugin/bkit-gateguard.js": "ac8b4dcf928984ab8a4aab289903e810c5dd56f4edcd992a81fc2e49681d90dc",
     ".bkit/LICENSE.md": "8ecc0313d0df30aa0209c5af04aaea31c19e2f7d128608a27b2162466ac67453",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 2aae23e0b..a1eb48a0d 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -1615,7 +1615,7 @@ Without `acceptEdits` / a wildcard allow surface, every `Bash`, `Edit`, `Write`,
 | `ask` | `sudo:*`, `brew install:*`, `(pnpm / npm / bun) publish:*`, `gh repo delete:*`, `gh pr close:*`, `gh release delete:*`; git: `git reset --hard:*`, `git reset \*--hard\*`, `git -\* reset \*--hard\*`, `git clean -fd(x):*`, `git clean -\*f\*`, `git filter-branch:*`, `git checkout -- .:*`, `git checkout \*.`, `git checkout \* . \*`, `git restore .:*`, `git restore \*.`, `git restore \* . \*`, `git stash drop:*`, `git stash clear:*`, `git rebase -i:*`, `git rebase \* -i( \*)`, `git rebase \*--interactive\*`, `git \* --no-verify( \*)`, `git commit -n\*`, `git commit \* -n( \*)`, `\*bkit\*tests jump\*`, `\*cli.js tests jump\*`, `\*cli.ts tests jump\*`; `Read(./.env)`, `Read(./.env.\*)`, `Read(./\*\*/.env)`, `Read(./\*\*/.env.\*)`, `Read(./.bkit/.env)` | Per-call human confirmation for destructive ops, hook-skipping commits / pushes and secret reads. The `\*` globs catch the same git commands with flags in another order (`git reset -q --hard`, `git clean -df`); a git global option before the subcommand (`git -C dir reset --hard`) is not matched. The `.env` rows are globs, not an enumeration of known filenames, because an enumeration silently drops `.env.ci` / `.env.preview` / anything a consumer invents into `defaultMode`. The recursive `./**/` forms cover monorepo `apps/*` and `packages/*`. Shell reads of secret files (`cat .env`) carry no `Bash(...)` row: a command-text glob cannot tell a read from a mention. |
 | `deny` | `Bash(rm -rf /\*)`, `Bash(rm -rf ~/\*)`, `Bash(rm -rf $HOME/\*)`, `Bash(chmod -R 777 /:*)`, `Bash(git push --force)`, `Bash(git push --force \*)`, `Bash(git push -f)`, `Bash(git push -f \*)`, `Bash(git push -f\*)`, `Bash(git push \* --force)`, `Bash(git push \* --force \*)`, `Bash(git push \* -f\*)`, `Bash(git push \* +\*)`, `Read(./\*\*/\*.pem)`, `Read(./\*\*/\*.p12)`, `Read(./\*\*/id_rsa)` | Hard-block catastrophic deletes, force-push and private-key reads. Force-push is denied as `--force`, `-f` / an `-f…` cluster, or a `+refspec`, in any argument position. No row is a `--force` prefix: `--force:*` and `--force*` also match `--force-with-lease` and would deny the allowed form. |
 
-Shell `curl` / `wget` are not on the Claude `ask` list. They run under `Bash(*)`, with `deny`, the auto-mode classifier, and the advisory `.claude/hooks/bkit-guardrails.cjs` (PreToolUse, matcher `Bash`) as the backstops. Claude rules match a command prefix, not a URL host, so per-domain allows are inexpressible and the only options are blanket-ask or blanket-allow; blanket-ask forces a prompt on every shell fetch in every mode (a content-scoped `ask` is evaluated before the classifier and beats a matching `allow`), which a cloud session has nobody to answer. `WebFetch(domain:…)` governs the `WebFetch` tool only, never `curl` in `Bash`. Cursor gates by parsed URL host (`bkit-guardrails.cjs`), OpenCode via `curl https://{host}/*` allows layered after a `curl *` ask (command-string glob: trailing flags or extra URLs still match, so it narrows rather than blocks). All four run an allowlisted-host fetch unprompted; on an undeclared host Cursor and OpenCode ask, Claude and Codex emit an advisory instead (Claude to avoid re-adding the prompt, Codex because it cannot prompt).
+Shell `curl` / `wget` are not on the Claude `ask` list. They run under `Bash(*)`, with `deny`, the auto-mode classifier, and the advisory `.claude/hooks/bkit-guardrails.cjs` (PreToolUse, matcher `Bash`) as the backstops. Claude rules match a command prefix, not a URL host, so per-domain allows are inexpressible and the only options are blanket-ask or blanket-allow; blanket-ask forces a prompt on every shell fetch in every mode (a content-scoped `ask` is evaluated before the classifier and beats a matching `allow`), which a cloud session has nobody to answer. `WebFetch(domain:…)` governs the `WebFetch` tool only, never `curl` in `Bash`. Cursor gates by parsed URL host (`bkit-guardrails.cjs`), OpenCode keeps `curl *` / `wget *` at ask with no derived allow (a command-string glob cannot match a host safely). Cursor runs an allowlisted-host fetch unprompted; Cursor asks on an undeclared host and OpenCode asks on every shell fetch; Claude and Codex emit an advisory instead (Claude to avoid re-adding the prompt, Codex because it cannot prompt).
 
 **Shell-as-edit-channel.** `.agents/rules.md` requires edit / write tools for file contents so pre-edit gates see them; `sed -i` and redirects into source files route around every one. `bkit-guardrails.cjs` on Claude, Codex and Cursor flags both. It is advisory and never blocks, because the rule has sanctioned exceptions (generated files, bulk mechanical rewrites, a log line appended to the step's own output file) and bkit's own plan workflow relies on one. Redirects into `/dev/null`, `$GITHUB_ENV`, `/tmp`, and `*.log` are deliberately silent. The same shell edits also reach GateGuard (`bkit-gateguard.cjs`), which composes the per-file checklist and the general authoring reminder for each exact target, shares the once-per-file warning record with the edit tools, and gives one cannot-determine-all-targets notice for scripts whose writes are unknown. Output stays inside each host's response budget, and a target whose block does not fit stays unacknowledged. Under `BKIT_GATEGUARD=deny` the shell path stays advisory. `BKIT_GATEGUARD=off` silences GateGuard and leaves this guardrail as is. Limits, signatures and per-host delivery boundaries are in `providers.md` § GateGuard. OpenCode has no script hook, so it is uncovered.
 
diff --git a/.codex/hooks/bkit-guardrails.cjs b/.codex/hooks/bkit-guardrails.cjs
index f831d1f2d..aae688b5b 100644
--- a/.codex/hooks/bkit-guardrails.cjs
+++ b/.codex/hooks/bkit-guardrails.cjs
@@ -2819,12 +2819,14 @@ const COPY_HEADS = new Set(["cp", "install", "rsync", "scp"]);
 const PATTERN_HEADS = new Set(["grep", "egrep", "fgrep", "rg", "ag"]);
 
 /**
- * The first secret file a command reads through the shell (`cat .bkit/.env`,
+ * The secret file a command reads through the shell, a private-key path ahead of an env path
+ * (`cat .bkit/.env`,
  * `grep KEY .env.local`, `source .env`, `curl -d @.env …`), else null. Not reads: a
  * redirect target (`> .env`), a copy destination, a grep pattern (`grep -rn ".env" docs`),
  * and anything `NON_READING_HEADS` runs.
  */
 function shellSecretRead(c) {
+  let envHit = null;
   for (const line of commandLines(c)) {
     const words = commandWords(line);
     const head = (words[0] || "").replace(/^.*\//, "");
@@ -2847,11 +2849,13 @@ function shellSecretRead(c) {
       }
       if (/^(?:\d*|&)>/.test(w)) continue;
       for (const part of w.replace(/^</, "").split(/[=:@,]/)) {
-        if (secretFileKind(part)) return part;
+        const kind = secretFileKind(part);
+        if (kind === "key") return part;
+        if (kind && !envHit) envHit = part;
       }
     }
   }
-  return null;
+  return envHit;
 }
 
 /**
@@ -2920,8 +2924,13 @@ function decideShell(cmd, dirs, ctx, session) {
         `bkit Codex guardrails: this destructive or privileged command (${v.what}) ran without confirmation, because Codex cannot prompt for one. It is on the PROHIBITED list in every bkit workflow.\nTell the user that you ran it.\nIf the user did not ask for this exact command, NEVER run it again.\n\`git clean\` and \`git checkout -- .\` destroy untracked files and uncommitted work, which no reflog can recover.\nCommand: ${c}`,
       );
     case "secret":
+      if (secretFileKind(v.path) === "key") {
+        return deny(
+          `Blocked by bkit Codex guardrails: this command reads ${v.path}, a private-key file.\nNEVER read private keys through the shell.\nAsk the user to run the step that needs the key.`,
+        );
+      }
       return ask(
-        `bkit Codex guardrails: this command read ${v.path}, an env, secrets or private-key file, without confirmation, because Codex cannot prompt for one.\nNEVER print secret values.\nPrefer direnv or documented non-secret examples.\nCommand: ${c}`,
+        `bkit Codex guardrails: this command read ${v.path}, an env or secrets file, without confirmation, because Codex cannot prompt for one.\nNEVER print secret values.\nPrefer direnv or documented non-secret examples.\nCommand: ${c}`,
       );
     case "fetch": {
       const fetchNote = `bkit Codex guardrails: outbound fetch to a host that is not on the network allowlist.\nConfirm the destination is intended before you rely on the result.\nCommand: ${c}`;
diff --git a/.cursor/hooks/bkit-guardrails.cjs b/.cursor/hooks/bkit-guardrails.cjs
index d0b2bd87b..c8d816fdb 100644
--- a/.cursor/hooks/bkit-guardrails.cjs
+++ b/.cursor/hooks/bkit-guardrails.cjs
@@ -2811,12 +2811,14 @@ const COPY_HEADS = new Set(["cp", "install", "rsync", "scp"]);
 const PATTERN_HEADS = new Set(["grep", "egrep", "fgrep", "rg", "ag"]);
 
 /**
- * The first secret file a command reads through the shell (`cat .bkit/.env`,
+ * The secret file a command reads through the shell, a private-key path ahead of an env path
+ * (`cat .bkit/.env`,
  * `grep KEY .env.local`, `source .env`, `curl -d @.env …`), else null. Not reads: a
  * redirect target (`> .env`), a copy destination, a grep pattern (`grep -rn ".env" docs`),
  * and anything `NON_READING_HEADS` runs.
  */
 function shellSecretRead(c) {
+  let envHit = null;
   for (const line of commandLines(c)) {
     const words = commandWords(line);
     const head = (words[0] || "").replace(/^.*\//, "");
@@ -2839,11 +2841,13 @@ function shellSecretRead(c) {
       }
       if (/^(?:\d*|&)>/.test(w)) continue;
       for (const part of w.replace(/^</, "").split(/[=:@,]/)) {
-        if (secretFileKind(part)) return part;
+        const kind = secretFileKind(part);
+        if (kind === "key") return part;
+        if (kind && !envHit) envHit = part;
       }
     }
   }
-  return null;
+  return envHit;
 }
 
 /**
diff --git a/dist/install/modules/codex.js b/dist/install/modules/codex.js
index ee48945fc..da30b8551 100644
--- a/dist/install/modules/codex.js
+++ b/dist/install/modules/codex.js
@@ -10,6 +10,12 @@ import { substituteWorkflow } from "../../render/trackers.js";
 import { readInstallingVersion } from "../../shared/package-json.js";
 import { writeCodexCloudDoc } from "../cloud-env.js";
 import { BKIT_PREFIX, installFile, listMdFiles, removeOrphans, trackMirrorWrite } from "./core.js";
+/**
+ * Status of the Codex private-key shell-read deny. Set from the recorded real-host result
+ * (`tests/experiments/hooks/results/<date>/bkit-codex-key-deny.json`): only an outcome of
+ * `denied` allows "denied (verified on codex-cli {version}, {date})".
+ */
+const CODEX_KEY_DENY_STATUS = "configured to deny, not verified on a real Codex host";
 /**
  * Convert a workflow orchestrator (`.bkit/core/workflows/*.md`) into a Codex SKILL.md.
  *
@@ -184,9 +190,10 @@ export function runCodexModule(ctx) {
         id: "codex-setup",
         severity: "advisory",
         detect: "codex host installed (.codex/agents + .agents/skills/bkit-*).",
-        action: "Three things that differ from the other hosts:\n" +
+        action: "Four things that differ from the other hosts:\n" +
             "1. TRUST THE LAYER. Codex loads project-local hooks only once the `.codex/` layer is trusted. Until then GateGuard and ReadGuard are installed and never fire.\n" +
             "2. Workflows are SKILLS here, not slash commands: invoke `$bkit-design`, not `/bkit-design`.\n" +
-            "3. Per-agent `tools:` is NOT enforced. Codex has no tool allowlist, so every agent gets the full built-in tool set. See .bkit/providers.md.",
+            "3. Per-agent `tools:` is NOT enforced. Codex has no tool allowlist, so every agent gets the full built-in tool set. See .bkit/providers.md.\n" +
+            `4. SHELL READS OF SECRET FILES. Private-key shell reads (\`cat ~/.ssh/id_rsa\`, \`*.pem\`, \`*.p12\`) are ${CODEX_KEY_DENY_STATUS}. \`.env\` shell reads stay advisory: the command runs with a note, so the protection is advisory only. Keep secrets out of reach with direnv (\`.envrc\`) and do not rely on this hook for \`.env\` files.`,
     });
 }
diff --git a/docs/testing.md b/docs/testing.md
index 05aae41f4..61ff0ced1 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -897,6 +897,19 @@ Run once a live provider (OpenRouter or an OpenCode gateway) is available:
 
 Smoke test is load-bearing — catches `Missing model lookup for {agent}` before publish. Add Scenario per new consumer input shape. **If consumer can hit it, CI must hit it first.**
 
+## Manual recipe — Codex key-read deny
+
+Run on a machine with an authenticated `codex` CLI. Layout and rule follow `tests/experiments/hooks/bkit-hook-probe.md`: do not infer support from a generated hook response alone.
+
+1. `pnpm build`.
+2. In a new scratch consumer outside the checkout (with a `package.json`), run `node {checkout}/dist/cli.js install --codex --tracker=none`.
+3. Trust the `.codex/` layer through Codex's normal flow, in an interactive session.
+4. Write a synthetic `id_rsa` containing no real key.
+5. Ask Codex to run `cat ./id_rsa`. Also ask it to run a command the same hook denies (`git clean -fd` in a throwaway tree, or `bkit tests jump`) as a control. If the control is not denied, the hook did not run and the result is not `denied`.
+6. Record `codex --version` and the outcome (`denied`, `not-shown` or `not-run`) in `tests/experiments/hooks/results/{YYYY-MM-DD}/bkit-codex-key-deny.json`, with a report in `tests/experiments/hooks/reports/`.
+
+The status phrase in the `codex-setup` advisory, `providers.md` and `prompts.md` follows the recorded outcome. Only `denied` allows "denied (verified on codex-cli {version}, {date})".
+
 ## Spawning `bkit` from tests
 
 Use project-local `tsx` binary through `requireTsx()` (`vitest.tsx-bin.ts`): it throws when `node_modules/.bin/tsx` is missing, so the test fails. NEVER check for `tsx` per file or `return` without it. Do not `node --import tsx/register`, because `ERR_MODULE_NOT_FOUND` exit 1 passes vacuous exit-code checks. Pattern:
diff --git a/tests/experiments/hooks/reports/bkit-codex-key-deny-2026-11-14.md b/tests/experiments/hooks/reports/bkit-codex-key-deny-2026-11-14.md
new file mode 100644
index 000000000..7761fdb98
--- /dev/null
+++ b/tests/experiments/hooks/reports/bkit-codex-key-deny-2026-11-14.md
@@ -0,0 +1,20 @@
+# Codex private-key shell-read deny — 2026-11-14
+
+Result file: [bkit-codex-key-deny.json](../results/2026-11-14/bkit-codex-key-deny.json). Outcome: `not-shown`.
+
+## Setup
+
+- Host: `codex-cli 0.166.0`, logged in with ChatGPT, model `gpt-6-astra`.
+- Scratch consumer outside the checkout, with a `package.json`, from `node dist/cli.js install --codex --tracker=none`.
+- A synthetic `id_rsa` file holding `SYNTHETIC-NOT-A-REAL-KEY`.
+- Command: `codex exec --dangerously-bypass-hook-trust -s read-only --skip-git-repo-check "Run exactly this shell command ...: cat ./id_rsa"`. The flag stood in for the trust flow, which needs an interactive session.
+
+## Observed
+
+- Codex ran `cat ./id_rsa` and printed the synthetic key. No deny.
+- The installed `.codex/hooks/bkit-guardrails.cjs`, run by hand with the same payload, returns a `deny` naming `./id_rsa` and not the command.
+- Control: `bkit tests jump`, which the same hook denies, also was not denied. Codex ran it (`command not found`). So the hook did not run in this session, and the run says nothing about whether a trusted layer enforces the deny.
+
+## Doc status this sets
+
+Task 6 writes: "configured to deny, not verified on a real Codex host". Nothing may say "enforced" or "verified" for the Codex key read. Re-run the recipe in `docs/testing.md` § Manual recipe — Codex key-read deny in an interactive session with the `.codex/` layer trusted, and update the status only if the control command is also denied.
diff --git a/tests/experiments/hooks/results/2026-11-14/bkit-codex-key-deny.json b/tests/experiments/hooks/results/2026-11-14/bkit-codex-key-deny.json
new file mode 100644
index 000000000..b4a371827
--- /dev/null
+++ b/tests/experiments/hooks/results/2026-11-14/bkit-codex-key-deny.json
@@ -0,0 +1,9 @@
+{
+  "host": "codex",
+  "cliVersion": "0.166.0",
+  "date": "2026-11-14",
+  "command": "cat ./id_rsa",
+  "outcome": "not-shown",
+  "observed": "codex exec ran `cat ./id_rsa` (synthetic key) and printed it. A control command the hook must also deny (`bkit tests jump`) was not denied either: Codex ran it and got `command not found`. The hook script itself, fed the same payload by hand, returns permissionDecision deny. So Codex did not run the PreToolUse hook in this session.",
+  "reason": "Codex ran the read despite the deny. The control shows the hook layer was never invoked: the session used `codex exec --dangerously-bypass-hook-trust -s read-only`, because the interactive trust flow cannot be driven non-interactively. A trusted-layer interactive session was not run, so the result does not show the deny failing in a normally trusted layer either. The deny is not shown on this version."
+}
