diff --git a/.bkit/core/.bkit/providers.md b/.bkit/core/.bkit/providers.md
index 8b5ecc015..3e1efd2ed 100644
--- a/.bkit/core/.bkit/providers.md
+++ b/.bkit/core/.bkit/providers.md
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
 
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index d21b9a0e4..fd54461f2 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -1615,7 +1615,7 @@ Without `acceptEdits` / a wildcard allow surface, every `Bash`, `Edit`, `Write`,
 | `ask` | `sudo:*`, `brew install:*`, `(pnpm / npm / bun) publish:*`, `gh repo delete:*`, `gh pr close:*`, `gh release delete:*`; git: `git reset --hard:*`, `git reset \*--hard\*`, `git -\* reset \*--hard\*`, `git clean -fd(x):*`, `git clean -\*f\*`, `git filter-branch:*`, `git checkout -- .:*`, `git checkout \*.`, `git checkout \* . \*`, `git restore .:*`, `git restore \*.`, `git restore \* . \*`, `git stash drop:*`, `git stash clear:*`, `git rebase -i:*`, `git rebase \* -i( \*)`, `git rebase \*--interactive\*`, `git \* --no-verify( \*)`, `git commit -n\*`, `git commit \* -n( \*)`, `\*bkit\*tests jump\*`, `\*cli.js tests jump\*`, `\*cli.ts tests jump\*`; `Read(./.env)`, `Read(./.env.\*)`, `Read(./\*\*/.env)`, `Read(./\*\*/.env.\*)`, `Read(./.bkit/.env)` | Per-call human confirmation for destructive ops, hook-skipping commits / pushes and secret reads. The `\*` globs catch the same git commands with flags in another order (`git reset -q --hard`, `git clean -df`); a git global option before the subcommand (`git -C dir reset --hard`) is not matched. The `.env` rows are globs, not an enumeration of known filenames, because an enumeration silently drops `.env.ci` / `.env.preview` / anything a consumer invents into `defaultMode`. The recursive `./**/` forms cover monorepo `apps/*` and `packages/*`. Shell reads of secret files (`cat .env`) carry no `Bash(...)` row: a command-text glob cannot tell a read from a mention. |
 | `deny` | `Bash(rm -rf /\*)`, `Bash(rm -rf ~/\*)`, `Bash(rm -rf $HOME/\*)`, `Bash(chmod -R 777 /:*)`, `Bash(git push --force)`, `Bash(git push --force \*)`, `Bash(git push -f)`, `Bash(git push -f \*)`, `Bash(git push -f\*)`, `Bash(git push \* --force)`, `Bash(git push \* --force \*)`, `Bash(git push \* -f\*)`, `Bash(git push \* +\*)`, `Read(./\*\*/\*.pem)`, `Read(./\*\*/\*.p12)`, `Read(./\*\*/id_rsa)` | Hard-block catastrophic deletes, force-push and private-key reads. Force-push is denied as `--force`, `-f` / an `-f…` cluster, or a `+refspec`, in any argument position. No row is a `--force` prefix: `--force:*` and `--force*` also match `--force-with-lease` and would deny the allowed form. |
 
-Shell `curl` / `wget` are not on the Claude `ask` list. They run under `Bash(*)`, with `deny`, the auto-mode classifier, and the advisory `.claude/hooks/bkit-guardrails.cjs` (PreToolUse, matcher `Bash`) as the backstops. Claude rules match a command prefix, not a URL host, so per-domain allows are inexpressible and the only options are blanket-ask or blanket-allow; blanket-ask forces a prompt on every shell fetch in every mode (a content-scoped `ask` is evaluated before the classifier and beats a matching `allow`), which a cloud session has nobody to answer. `WebFetch(domain:…)` governs the `WebFetch` tool only, never `curl` in `Bash`. Cursor gates by parsed URL host (`bkit-guardrails.cjs`), OpenCode via `curl https://{host}/*` allows layered after a `curl *` ask (command-string glob: trailing flags or extra URLs still match, so it narrows rather than blocks). All four run an allowlisted-host fetch unprompted; on an undeclared host Cursor and OpenCode ask, Claude and Codex emit an advisory instead (Claude to avoid re-adding the prompt, Codex because it cannot prompt).
+Shell `curl` / `wget` are not on the Claude `ask` list. They run under `Bash(*)`, with `deny`, the auto-mode classifier, and the advisory `.claude/hooks/bkit-guardrails.cjs` (PreToolUse, matcher `Bash`) as the backstops. Claude rules match a command prefix, not a URL host, so per-domain allows are inexpressible and the only options are blanket-ask or blanket-allow; blanket-ask forces a prompt on every shell fetch in every mode (a content-scoped `ask` is evaluated before the classifier and beats a matching `allow`), which a cloud session has nobody to answer. `WebFetch(domain:…)` governs the `WebFetch` tool only, never `curl` in `Bash`. Cursor gates by parsed URL host (`bkit-guardrails.cjs`), OpenCode keeps `curl *` / `wget *` at ask with no derived allow (a command-string glob cannot match a host safely). Cursor runs an allowlisted-host fetch unprompted; Cursor asks on an undeclared host and OpenCode asks on every shell fetch; Claude and Codex emit an advisory instead (Claude to avoid re-adding the prompt, Codex because it cannot prompt).
 
 **Shell-as-edit-channel.** `.agents/rules.md` requires edit / write tools for file contents so pre-edit gates see them; `sed -i` and redirects into source files route around every one. `bkit-guardrails.cjs` on Claude, Codex and Cursor flags both. It is advisory and never blocks, because the rule has sanctioned exceptions (generated files, bulk mechanical rewrites, a log line appended to the step's own output file) and bkit's own plan workflow relies on one. Redirects into `/dev/null`, `$GITHUB_ENV`, `/tmp`, and `*.log` are deliberately silent. The same shell edits also reach GateGuard (`bkit-gateguard.cjs`), which composes the per-file checklist and the general authoring reminder for each exact target, shares the once-per-file warning record with the edit tools, and gives one cannot-determine-all-targets notice for scripts whose writes are unknown. Output stays inside each host's response budget, and a target whose block does not fit stays unacknowledged. Under `BKIT_GATEGUARD=deny` the shell path stays advisory. `BKIT_GATEGUARD=off` silences GateGuard and leaves this guardrail as is. Limits, signatures and per-host delivery boundaries are in `providers.md` § GateGuard. OpenCode has no script hook, so it is uncovered.
 
diff --git a/.bkit/core/engine/checks/before/files.test.ts b/.bkit/core/engine/checks/before/files.test.ts
index 0446f9494..8d2194977 100644
--- a/.bkit/core/engine/checks/before/files.test.ts
+++ b/.bkit/core/engine/checks/before/files.test.ts
@@ -9,6 +9,8 @@ import {
   stripBkitBlock,
   detectGitignoreBlockDuplicates,
   detectPlaywrightReporterHostile,
+  detectOpencodeSubstringFetchGrants,
+  redactUrlParts,
   MARKERED_TEXT_DRIFT_PATHS,
   detectTier2TextDrift,
 } from "./files";
@@ -243,6 +245,85 @@ describe("detectPlaywrightReporterHostile", () => {
   });
 });
 
+describe("detectOpencodeSubstringFetchGrants", () => {
+  const OC_REL = path.join(".opencode", "opencode.json");
+
+  function writeOpencode(content: string): string {
+    const abs = path.join(tmpDir, OC_REL);
+    fs.mkdirSync(path.dirname(abs), { recursive: true });
+    fs.writeFileSync(abs, content, "utf-8");
+    return abs;
+  }
+
+  function writeBash(bash: Record<string, string>, webfetch?: Record<string, string>): string {
+    return writeOpencode(
+      JSON.stringify({ permission: { bash, ...(webfetch ? { webfetch } : {}) } }, null, 2),
+    );
+  }
+
+  it("reports each substring curl and wget allow with its removal action", () => {
+    writeBash({ "curl *": "ask", "curl *github.com*": "allow", "wget *github.com*": "allow" });
+    const f = detectOpencodeSubstringFetchGrants(tmpDir);
+    expect(f).not.toBeNull();
+    expect(f?.id).toBe("opencode-substring-fetch-grants");
+    expect(f?.severity).toBe("advisory");
+    expect(f?.detect).toContain("curl *github.com*");
+    expect(f?.detect).toContain("wget *github.com*");
+    expect(f?.detect).toContain(OC_REL);
+    expect(f?.action).toContain("permission.bash");
+    expect(f?.action).toMatch(/remove|delete/i);
+  });
+
+  it("ignores webfetch, non-allow and unrelated consumer entries", () => {
+    writeBash(
+      {
+        "curl *": "ask",
+        "curl *x*": "ask",
+        "git status*": "allow",
+        "npm run *": "allow",
+      },
+      { "*": "ask", "*github.com*": "allow", "https://api.example.com/*": "allow" },
+    );
+    expect(detectOpencodeSubstringFetchGrants(tmpDir)).toBeNull();
+  });
+
+  it("redacts URL credentials and query strings in a reported key", () => {
+    writeBash({ "curl *https://user:tok@example.com/p?k=v*": "allow" });
+    const f = detectOpencodeSubstringFetchGrants(tmpDir);
+    expect(f).not.toBeNull();
+    const text = `${f?.detect}\n${f?.action}`;
+    expect(text).not.toContain("user:tok");
+    expect(text).not.toContain("k=v");
+    expect(text).toContain("example.com");
+    const red = redactUrlParts("curl *https://user:tok@example.com/p?k=v*");
+    expect(red).not.toContain("user:tok");
+    expect(red).not.toContain("k=v");
+  });
+
+  it("reports nothing and writes nothing for an absent, unparseable or map-less file", () => {
+    expect(detectOpencodeSubstringFetchGrants(tmpDir)).toBeNull();
+    expect(fs.existsSync(path.join(tmpDir, OC_REL))).toBe(false);
+
+    for (const content of [
+      "{ not json",
+      JSON.stringify({ permission: { bash: "allow" } }),
+      JSON.stringify({ permission: "allow" }),
+      JSON.stringify({}),
+    ]) {
+      const abs = writeOpencode(content);
+      const before = fs.readFileSync(abs, "utf-8");
+      expect(detectOpencodeSubstringFetchGrants(tmpDir)).toBeNull();
+      expect(fs.readFileSync(abs, "utf-8")).toBe(before);
+    }
+
+    // A reported file is never rewritten either.
+    const abs = writeBash({ "curl *github.com*": "allow" });
+    const before = fs.readFileSync(abs, "utf-8");
+    expect(detectOpencodeSubstringFetchGrants(tmpDir)).not.toBeNull();
+    expect(fs.readFileSync(abs, "utf-8")).toBe(before);
+  });
+});
+
 // ---------------------------------------------------------------------------
 // process.env snapshot and restore around each test
 // ---------------------------------------------------------------------------
diff --git a/.bkit/core/engine/checks/before/files.ts b/.bkit/core/engine/checks/before/files.ts
index 879f4c1d7..7ecceb5e2 100644
--- a/.bkit/core/engine/checks/before/files.ts
+++ b/.bkit/core/engine/checks/before/files.ts
@@ -7,7 +7,7 @@ import { deepContains, type JsonValue } from "../../install/write.js";
 import { extractManagedBlock, stripManagedBlock } from "../../install/managed-block.js";
 import { readTemplate } from "../../render/parts.js";
 import { findTemplateSource, getPkgRoot } from "../../shared/package-roots.js";
-import { parseJson } from "../../shared/json.js";
+import { parseJson, readJsonFile } from "../../shared/json.js";
 import { ciWorkflowPath } from "../../shared/settings.js";
 import type { PreflightFinding } from "./index.js";
 
@@ -107,6 +107,43 @@ export function detectPlaywrightReporterHostile(cwd: string): PreflightFinding |
   };
 }
 
+const OPENCODE_JSON_REL = path.join(".opencode", "opencode.json");
+
+/** True for a `permission.bash` key of the legacy generated shape `curl *{host}*` / `wget *{host}*`. */
+export function isOpencodeSubstringFetchKey(key: string): boolean {
+  return /^(curl|wget) \*[^*\s]+\*$/.test(key);
+}
+
+/** Drop URL user-info and query / fragment text from a permission key before it is printed. */
+export function redactUrlParts(text: string): string {
+  return text.replace(/\/\/[^/@\s*]*@/g, "//").replace(/[?#][^*\s]*/g, "?…");
+}
+
+/**
+ * Advisory: `.opencode/opencode.json` `permission.bash` holds substring `curl` / `wget`
+ * allows that an earlier bkit install generated. No per-entry ownership record exists, so
+ * they are reported for owner review and never removed. Reads only; never writes.
+ */
+export function detectOpencodeSubstringFetchGrants(cwd: string): PreflightFinding | null {
+  const read = readJsonFile(path.join(cwd, OPENCODE_JSON_REL));
+  if (!read.ok) return null;
+  const root = read.value as { permission?: unknown } | null;
+  const permission = root && typeof root === "object" ? root.permission : undefined;
+  if (!permission || typeof permission !== "object") return null;
+  const bash = (permission as { bash?: unknown }).bash;
+  if (!bash || typeof bash !== "object" || Array.isArray(bash)) return null;
+  const keys = Object.entries(bash as Record<string, unknown>)
+    .filter(([k, v]) => v === "allow" && isOpencodeSubstringFetchKey(k))
+    .map(([k]) => redactUrlParts(k));
+  if (keys.length === 0) return null;
+  return {
+    id: "opencode-substring-fetch-grants",
+    severity: "advisory",
+    detect: `${OPENCODE_JSON_REL} \`permission.bash\` holds substring fetch allows (${keys.map((k) => `\`${k}\``).join(", ")}). A glob over the command string also matches the host inside a query string or user-info part, so \`curl https://evil.example/?x=host\` runs without a prompt.`,
+    action: `Review each entry. If you did not add it, remove it from \`permission.bash\` in ${OPENCODE_JSON_REL}; shell \`curl\` / \`wget\` then fall back to the \`curl *\` / \`wget *\` ask. bkit no longer writes these entries and never removes them for you.`,
+  };
+}
+
 /**
  * Advisory: detect when a JSON file is missing content the template owns.
  * Runs deepContains(template, consumerFile) — fires when ok=false.
diff --git a/.bkit/core/engine/checks/before/index.ts b/.bkit/core/engine/checks/before/index.ts
index 51d6ef22d..9316ae95b 100644
--- a/.bkit/core/engine/checks/before/index.ts
+++ b/.bkit/core/engine/checks/before/index.ts
@@ -31,6 +31,7 @@ import {
   MARKERED_TEXT_DRIFT_PATHS,
   detectGitignoreBlockDuplicates,
   detectPlaywrightReporterHostile,
+  detectOpencodeSubstringFetchGrants,
   detectTier2JsonDrift,
   detectTier2TextDrift,
 } from "./files.js";
@@ -154,6 +155,9 @@ export function runPreflight(
   const playwrightReporterHostile = detectPlaywrightReporterHostile(cwd);
   if (playwrightReporterHostile) advisories.push(playwrightReporterHostile);
 
+  const opencodeSubstringGrants = detectOpencodeSubstringFetchGrants(cwd);
+  if (opencodeSubstringGrants) advisories.push(opencodeSubstringGrants);
+
   const contextFetch = detectContextFetchMissing(cwd);
   if (contextFetch) advisories.push(contextFetch);
 
diff --git a/.bkit/core/engine/commands/install/upgrade.integration.test.ts b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
index ac326fc39..156fc05f0 100644
--- a/.bkit/core/engine/commands/install/upgrade.integration.test.ts
+++ b/.bkit/core/engine/commands/install/upgrade.integration.test.ts
@@ -2691,3 +2691,57 @@ describe("#892 — install, check and upgrade warn about a missing root lint-sta
     expect(combinedOutput(up)).not.toContain(COPY_LINE);
   });
 });
+
+describe("#803 — upgrade over legacy OpenCode substring fetch grants", () => {
+  const cliPath = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../cli.ts");
+  function runCli(args: string[]) {
+    return spawnSync(requireTsx(), [cliPath, ...args], {
+      cwd: tmpDir,
+      encoding: "utf-8",
+      env: { ...process.env, NODE_NO_WARNINGS: "1" },
+      timeout: 90_000,
+    });
+  }
+
+  it("upgrade keeps legacy OpenCode substring fetch grants and reports each for owner review", () => {
+    fs.mkdirSync(path.join(tmpDir, ".git"), { recursive: true });
+    fs.writeFileSync(
+      path.join(tmpDir, "package.json"),
+      JSON.stringify({ name: "consumer", version: "0.0.0" }, null, 2) + "\n",
+      "utf-8",
+    );
+    const install = runCli(["install", "--opencode=openrouter"]);
+    expect(install.status, combinedOutput(install)).toBe(0);
+
+    // Seed the legacy shape an older bkit wrote.
+    const ocPath = path.join(tmpDir, ".opencode", "opencode.json");
+    const seeded = JSON.parse(fs.readFileSync(ocPath, "utf-8")) as {
+      permission: { bash: Record<string, string> };
+    };
+    seeded.permission.bash["curl *github.com*"] = "allow";
+    seeded.permission.bash["wget *github.com*"] = "allow";
+    fs.writeFileSync(ocPath, JSON.stringify(seeded, null, 2) + "\n", "utf-8");
+
+    const up = runCli(["upgrade", "--auto-apply"]);
+    expect(up.status, combinedOutput(up)).toBe(0);
+
+    const out = combinedOutput(up);
+    expect(out).toContain("opencode-substring-fetch-grants");
+    expect(out).toContain("curl *github.com*");
+    expect(out).toContain("wget *github.com*");
+
+    const after = JSON.parse(fs.readFileSync(ocPath, "utf-8")) as {
+      permission: { bash: Record<string, string>; webfetch: Record<string, string> };
+    };
+    // Kept: bkit cannot attribute the entries, so it never removes them.
+    expect(after.permission.bash["curl *github.com*"]).toBe("allow");
+    expect(after.permission.bash["wget *github.com*"]).toBe("allow");
+    // The fetch tool keeps its accepted-risk allow, unreported.
+    expect(after.permission.webfetch["*github.com*"]).toBe("allow");
+    // No new substring key was generated.
+    const substringKeys = Object.keys(after.permission.bash).filter((k) =>
+      /^(curl|wget) \*[^*\s]+\*$/.test(k),
+    );
+    expect(substringKeys.sort()).toEqual(["curl *github.com*", "wget *github.com*"]);
+  });
+});
diff --git a/.bkit/core/engine/install/cloud-env.integration.test.ts b/.bkit/core/engine/install/cloud-env.integration.test.ts
index f51921342..a06b4489c 100644
--- a/.bkit/core/engine/install/cloud-env.integration.test.ts
+++ b/.bkit/core/engine/install/cloud-env.integration.test.ts
@@ -109,7 +109,7 @@ describe("T4 — the derived egress set reaches all five surfaces", () => {
         // 4 — .claude/settings.json WebFetch grants
         expect(settings.permissions.allow).toContain(`WebFetch(domain:${probe})`);
 
-        // 5 — .opencode/opencode.json permission.bash curl globs
+        // 5 — .opencode/opencode.json permission.webfetch `*{base}*` keys
         expect(opencode).toContain(probe);
       }
 
diff --git a/.bkit/core/engine/install/modules/index.integration.test.ts b/.bkit/core/engine/install/modules/index.integration.test.ts
index 3fde72e83..94101da79 100644
--- a/.bkit/core/engine/install/modules/index.integration.test.ts
+++ b/.bkit/core/engine/install/modules/index.integration.test.ts
@@ -1072,7 +1072,7 @@ describe("permissions-parity", () => {
     // path, and the one context-fetch blocks take. They differ only on an UNDECLARED host:
     //
     //   Cursor    asks   — parses the URL host in bkit-guardrails.cjs
-    //   opencode  asks   — `curl *: ask` + `curl *{domain}*: allow`, substring not host-parsed
+    //   opencode  asks   — `curl *: ask` with no derived allow (a glob cannot match a host safely)
     //   Claude    advises — a permission table cannot match a URL host
     //   Codex     advises — parses `permissionDecision: "ask"` but does not implement it
     //
@@ -1086,10 +1086,8 @@ describe("permissions-parity", () => {
         v: "allow",
       });
       // opencode is asserted against the TEMPLATE, which carries only the `curl *: ask`
-      // base. Its per-domain `curl *{domain}*: allow` rows are injected at install time
-      // from the consumer's resolved allowlist (injectOpencodeDerivedAllows), and the
-      // rendered result is covered in install/modules/index.integration.test.ts. So "ask" here is
-      // the template's honest verdict, not a gap in the host.
+      // base. Install derives no shell allow rows (injectOpencodeDerivedAllows writes
+      // only `permission.webfetch`), so "ask" is the host's real verdict for every shell fetch.
       expect({ host: "opencode(template)", v: opencodeVerdict("bash", ALLOWED) }).toEqual({
         host: "opencode(template)",
         v: "ask",
@@ -1298,7 +1296,7 @@ describe("permissions-parity", () => {
       expect(webFetch).toEqual([]);
     });
 
-    it("every derived base reaches BOTH fetch surfaces on every host (fetch tool + shell)", () => {
+    it("every derived base reaches the fetch tool on every host, and an OpenCode shell fetch asks", () => {
       // The gap this closes: the derived set reached the OpenCode SHELL (curl/wget globs)
       // but never the OpenCode fetch TOOL (`webfetch`), so an allowlisted host still
       // prompted when the agent used the fetch tool. Every surface the allowlist encodes
@@ -1319,6 +1317,14 @@ describe("permissions-parity", () => {
         const opencodePerm = JSON.parse(
           renderOpencodeJson(OPENCODE_JSON, "github", "openrouter", cwd),
         ).permission as { bash: Record<string, string>; webfetch: Record<string, string> };
+        // Last matching glob wins; no match means allow.
+        const shellVerdict = (cmd: string): string =>
+          [
+            "allow",
+            ...Object.entries(opencodePerm.bash)
+              .filter(([glob]) => globToRe(glob).test(cmd))
+              .map(([, v]) => v),
+          ].at(-1) as string;
         writeNetworkAllowlist(cwd, false, makeWriteSet(), "[test]");
         const hookDomains = (
           JSON.parse(fs.readFileSync(path.join(cwd, NETWORK_ALLOWLIST_RELPATH), "utf-8")) as {
@@ -1331,8 +1337,9 @@ describe("permissions-parity", () => {
           [`claude tool:${base}`, claudeAllow.includes(`WebFetch(domain:${base})`)],
           // OpenCode — fetch tool AND shell.
           [`opencode tool:${base}`, opencodePerm.webfetch[`*${base}*`] === "allow"],
-          [`opencode shell curl:${base}`, opencodePerm.bash[`curl *${base}*`] === "allow"],
-          [`opencode shell wget:${base}`, opencodePerm.bash[`wget *${base}*`] === "allow"],
+          // OpenCode shell — a `curl` / `wget` to the base asks (last match wins), never allows.
+          [`opencode shell curl asks:${base}`, shellVerdict(`curl https://${base}/`) === "ask"],
+          [`opencode shell wget asks:${base}`, shellVerdict(`wget https://${base}/`) === "ask"],
           // Cursor / Codex / Antigravity / Claude hooks — shell, read from this artifact.
           [`hook shell:${base}`, hookDomains.includes(base)],
         ]);
diff --git a/.bkit/core/engine/install/modules/opencode.integration.test.ts b/.bkit/core/engine/install/modules/opencode.integration.test.ts
index fa2f9a4d7..ccc867bc4 100644
--- a/.bkit/core/engine/install/modules/opencode.integration.test.ts
+++ b/.bkit/core/engine/install/modules/opencode.integration.test.ts
@@ -445,7 +445,7 @@ describe("renderOpencodeJson — opencode custom-provider format", () => {
     expect(parsed.plugins).toBeUndefined();
   });
 
-  it("permission: opencode tool-keyed map (not Claude {rules:[...]}), force-push gated", () => {
+  it("permission: opencode tool-keyed map (not Claude {rules:[...]}), force-push gated, no shell fetch allows", () => {
     const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "openrouter"));
     const perm = parsed.permission;
     expect(perm.rules).toBeUndefined(); // the Claude-style array that opencode rejects
@@ -462,10 +462,10 @@ describe("renderOpencodeJson — opencode custom-provider format", () => {
     // Stack hosts (vercel/supabase/…) are NOT shipped — only tooling defaults +
     // consumer `.agents/context.md` allowed-domains (after bkit:end).
     expect(perm.bash["curl *vercel.com*"]).toBeUndefined();
-    expect(perm.bash["curl *github.com*"]).toBe("allow");
-    const curlAskIdx = Object.keys(perm.bash).indexOf("curl *");
-    const curlGhIdx = Object.keys(perm.bash).indexOf("curl *github.com*");
-    expect(curlGhIdx).toBeGreaterThan(curlAskIdx);
+    expect(perm.bash["curl *github.com*"]).toBeUndefined();
+    expect(perm.bash["wget *github.com*"]).toBeUndefined();
+    expect(Object.keys(perm.bash).filter((k) => /^(curl|wget) \*[^*\s]+\*$/.test(k))).toEqual([]);
+    expect(perm.webfetch["*github.com*"]).toBe("allow");
     expect(perm.websearch).toBe("allow");
     // webfetch is a URL-keyed map (opencode matches the resource against the requested
     // URL); the template seeds `{ "*": "ask" }` and the resolved allowlist is layered on
@@ -538,7 +538,7 @@ describe("renderOpencodeJson — opencode custom-provider format", () => {
     }
   });
 
-  it("injects consumer allowed-domains into both fetch surfaces (shell + fetch tool)", () => {
+  it("injects consumer allowed-domains into the fetch tool and never into shell allows", () => {
     const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-net-"));
     fs.mkdirSync(path.join(tmp, ".agents"), { recursive: true });
     fs.writeFileSync(
@@ -547,9 +547,11 @@ describe("renderOpencodeJson — opencode custom-provider format", () => {
       "utf-8",
     );
     const parsed = JSON.parse(renderOpencodeJson(TEMPLATE, "github", "openrouter", tmp));
-    // Shell fetch.
-    expect(parsed.permission.bash["curl *vercel.com*"]).toBe("allow");
-    expect(parsed.permission.bash["wget *supabase.com*"]).toBe("allow");
+    // Shell fetch: no derived allow; `curl *` / `wget *` keep asking.
+    expect(parsed.permission.bash["curl *vercel.com*"]).toBeUndefined();
+    expect(parsed.permission.bash["wget *supabase.com*"]).toBeUndefined();
+    expect(parsed.permission.bash["curl *"]).toBe("ask");
+    expect(parsed.permission.bash["wget *"]).toBe("ask");
     // Fetch tool — the same bases must reach the webfetch URL map, or a host on the
     // allowlist still prompts when the agent uses the fetch tool instead of a shell.
     expect(parsed.permission.webfetch["*vercel.com*"]).toBe("allow");
diff --git a/.bkit/core/engine/install/modules/opencode.ts b/.bkit/core/engine/install/modules/opencode.ts
index e9b521ea9..6e17c5194 100644
--- a/.bkit/core/engine/install/modules/opencode.ts
+++ b/.bkit/core/engine/install/modules/opencode.ts
@@ -242,10 +242,8 @@ const OPENCODE_PROVIDER_BASE_URL_SENTINEL = "@@OPENCODE_PROVIDER_BASE_URL@@";
  * and fills in provider-specific fields.
  *
  * Also injects derived **allow** rules for {@link resolveNetworkAllowlist} so
- * context-fetch / provider hosts do not prompt on either fetch surface: `curl *{domain}*` /
- * `wget *{domain}*` after the template's `curl *` / `wget *` ask (OpenCode bash is
- * last-match-wins), and `*{domain}*` into the `permission.webfetch` URL map (after its
- * `"*": "ask"`). Adds `<server>_*` allows for the consumer's `mcp-servers` block.
+ * context-fetch / provider hosts do not prompt on the fetch tool: `*{domain}*` into the
+ * `permission.webfetch` URL map (after its `"*": "ask"`); shell fetches keep asking. Adds `<server>_*` allows for the consumer's `mcp-servers` block.
  */
 export function renderOpencodeJson(
   templatePath: string,
@@ -338,12 +336,10 @@ export function renderOpencodeJson(
  * last-match-wins), and one `<server>_*` allow per declared MCP server — opencode names
  * MCP tools `<server>_<tool>` and matches permission keys as globs against the tool name.
  *
- * The allowlist is applied to BOTH fetch surfaces, so an allowlisted host does not prompt
- * whichever path the agent takes:
- *   - fetch tool — `permission.webfetch` is a URL-keyed map (`{ "*": "ask" }` from the
- *     template); opencode matches the resource against the URL, so `*{base}*` allows it;
- *   - shell fetch — `permission.bash` gains `curl *{base}*` / `wget *{base}*` after the
- *     template's `curl *` / `wget *` ask.
+ * Only the fetch tool gets derived allows: `permission.webfetch` is a URL-keyed map
+ * (`{ "*": "ask" }` from the template); opencode matches the resource against the URL, so
+ * `*{base}*` allows it (accepted risk, decision 551). Shell `curl` / `wget` keep the
+ * template's ask, because a glob over the command string also matches a host in a query.
  */
 function injectOpencodeDerivedAllows(parsed: Record<string, unknown>, cwd: string): void {
   const permission = parsed.permission as Record<string, unknown> | undefined;
@@ -352,13 +348,6 @@ function injectOpencodeDerivedAllows(parsed: Record<string, unknown>, cwd: strin
     permission[`${server}_*`] = "allow";
   }
   const bases = networkAllowlistBases(resolveNetworkAllowlist(cwd));
-  if (typeof permission.bash === "object" && permission.bash !== null) {
-    const bash = permission.bash as Record<string, string>;
-    for (const base of bases) {
-      bash[`curl *${base}*`] = "allow";
-      bash[`wget *${base}*`] = "allow";
-    }
-  }
   // Fetch tool — opencode matches the webfetch resource against the requested URL.
   if (typeof permission.webfetch === "object" && permission.webfetch !== null) {
     const webfetch = permission.webfetch as Record<string, string>;
diff --git a/dist/checks/before/files.js b/dist/checks/before/files.js
index dff420498..df595f009 100644
--- a/dist/checks/before/files.js
+++ b/dist/checks/before/files.js
@@ -6,7 +6,7 @@ import { deepContains } from "../../install/write.js";
 import { extractManagedBlock, stripManagedBlock } from "../../install/managed-block.js";
 import { readTemplate } from "../../render/parts.js";
 import { findTemplateSource, getPkgRoot } from "../../shared/package-roots.js";
-import { parseJson } from "../../shared/json.js";
+import { parseJson, readJsonFile } from "../../shared/json.js";
 import { ciWorkflowPath } from "../../shared/settings.js";
 /**
  * Strip out content inside bkit-managed block markers (HTML and slash style).
@@ -98,6 +98,43 @@ export function detectPlaywrightReporterHostile(cwd) {
         action: 'Drop the `--reporter=line` flag so `playwright.config.ts`\'s configured reporter chain runs (typically `[list, html, github, json]`). Verbose-aware pattern: have `test:e2e` read `VERBOSE_CI` and append `--trace=on` to its own `playwright test` call (e.g. `TRACE=; [ "$VERBOSE_CI" = "1" ] && TRACE=--trace=on; playwright test $TRACE`), then run it plainly as `pnpm test:e2e` — do NOT pass `--trace=on` through a turbo / pnpm `-- --trace=on` passthrough, which appends to the script string and breaks any test:e2e ending in a bash construct (fi / done / esac). Never pass `--reporter`. Note that `--video` and `--screenshot` are NOT Playwright CLI flags (they\'re `use:` keys in playwright.config.ts); the trace.zip already captures snapshots / network / console / source. Default-mode output stays clean via the config\'s `list` reporter.',
     };
 }
+const OPENCODE_JSON_REL = path.join(".opencode", "opencode.json");
+/** True for a `permission.bash` key of the legacy generated shape `curl *{host}*` / `wget *{host}*`. */
+export function isOpencodeSubstringFetchKey(key) {
+    return /^(curl|wget) \*[^*\s]+\*$/.test(key);
+}
+/** Drop URL user-info and query / fragment text from a permission key before it is printed. */
+export function redactUrlParts(text) {
+    return text.replace(/\/\/[^/@\s*]*@/g, "//").replace(/[?#][^*\s]*/g, "?…");
+}
+/**
+ * Advisory: `.opencode/opencode.json` `permission.bash` holds substring `curl` / `wget`
+ * allows that an earlier bkit install generated. No per-entry ownership record exists, so
+ * they are reported for owner review and never removed. Reads only; never writes.
+ */
+export function detectOpencodeSubstringFetchGrants(cwd) {
+    const read = readJsonFile(path.join(cwd, OPENCODE_JSON_REL));
+    if (!read.ok)
+        return null;
+    const root = read.value;
+    const permission = root && typeof root === "object" ? root.permission : undefined;
+    if (!permission || typeof permission !== "object")
+        return null;
+    const bash = permission.bash;
+    if (!bash || typeof bash !== "object" || Array.isArray(bash))
+        return null;
+    const keys = Object.entries(bash)
+        .filter(([k, v]) => v === "allow" && isOpencodeSubstringFetchKey(k))
+        .map(([k]) => redactUrlParts(k));
+    if (keys.length === 0)
+        return null;
+    return {
+        id: "opencode-substring-fetch-grants",
+        severity: "advisory",
+        detect: `${OPENCODE_JSON_REL} \`permission.bash\` holds substring fetch allows (${keys.map((k) => `\`${k}\``).join(", ")}). A glob over the command string also matches the host inside a query string or user-info part, so \`curl https://evil.example/?x=host\` runs without a prompt.`,
+        action: `Review each entry. If you did not add it, remove it from \`permission.bash\` in ${OPENCODE_JSON_REL}; shell \`curl\` / \`wget\` then fall back to the \`curl *\` / \`wget *\` ask. bkit no longer writes these entries and never removes them for you.`,
+    };
+}
 /**
  * Advisory: detect when a JSON file is missing content the template owns.
  * Runs deepContains(template, consumerFile) — fires when ok=false.
diff --git a/dist/checks/before/index.js b/dist/checks/before/index.js
index 37ec62320..2d92c89d9 100644
--- a/dist/checks/before/index.js
+++ b/dist/checks/before/index.js
@@ -14,7 +14,7 @@
 import { readInstallingVersion } from "../../shared/package-json.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import { detectBkitNotOnPath, detectMalformedPackageJson, detectNoPackageJson, detectNotGitRepo, detectInvalidAskSettings, detectBuildPublish, detectInvalidTaskCaps, detectTaskCapFormStale, detectUnmarkedPlans, } from "./repo.js";
-import { MARKERED_TEXT_DRIFT_PATHS, detectGitignoreBlockDuplicates, detectPlaywrightReporterHostile, detectTier2JsonDrift, detectTier2TextDrift, } from "./files.js";
+import { MARKERED_TEXT_DRIFT_PATHS, detectGitignoreBlockDuplicates, detectPlaywrightReporterHostile, detectOpencodeSubstringFetchGrants, detectTier2JsonDrift, detectTier2TextDrift, } from "./files.js";
 import { detectBkitVersionMajorDowngrade, detectBkitVersionPinStale } from "./version.js";
 import { detectContextFetchContextMissing, detectContextFetchMissing, detectContextFetchProvisionMissing, detectContextFetchSourceNotEnabled, detectContextFetchUnbounded, } from "./context-fetch.js";
 import { detectExtraMcpServers, detectMissingMcpServers } from "./mcp.js";
@@ -105,6 +105,9 @@ export function runPreflight(modules, cwd = process.cwd(), installingVersion, is
     const playwrightReporterHostile = detectPlaywrightReporterHostile(cwd);
     if (playwrightReporterHostile)
         advisories.push(playwrightReporterHostile);
+    const opencodeSubstringGrants = detectOpencodeSubstringFetchGrants(cwd);
+    if (opencodeSubstringGrants)
+        advisories.push(opencodeSubstringGrants);
     const contextFetch = detectContextFetchMissing(cwd);
     if (contextFetch)
         advisories.push(contextFetch);
diff --git a/dist/install/modules/opencode.js b/dist/install/modules/opencode.js
index 3c38ba490..7edbddc72 100644
--- a/dist/install/modules/opencode.js
+++ b/dist/install/modules/opencode.js
@@ -189,10 +189,8 @@ const OPENCODE_PROVIDER_BASE_URL_SENTINEL = "@@OPENCODE_PROVIDER_BASE_URL@@";
  * and fills in provider-specific fields.
  *
  * Also injects derived **allow** rules for {@link resolveNetworkAllowlist} so
- * context-fetch / provider hosts do not prompt on either fetch surface: `curl *{domain}*` /
- * `wget *{domain}*` after the template's `curl *` / `wget *` ask (OpenCode bash is
- * last-match-wins), and `*{domain}*` into the `permission.webfetch` URL map (after its
- * `"*": "ask"`). Adds `<server>_*` allows for the consumer's `mcp-servers` block.
+ * context-fetch / provider hosts do not prompt on the fetch tool: `*{domain}*` into the
+ * `permission.webfetch` URL map (after its `"*": "ask"`); shell fetches keep asking. Adds `<server>_*` allows for the consumer's `mcp-servers` block.
  */
 export function renderOpencodeJson(templatePath, tracker, provider, cwd = process.cwd()) {
     const raw = fs.readFileSync(templatePath, "utf-8");
@@ -281,12 +279,10 @@ export function renderOpencodeJson(templatePath, tracker, provider, cwd = proces
  * last-match-wins), and one `<server>_*` allow per declared MCP server — opencode names
  * MCP tools `<server>_<tool>` and matches permission keys as globs against the tool name.
  *
- * The allowlist is applied to BOTH fetch surfaces, so an allowlisted host does not prompt
- * whichever path the agent takes:
- *   - fetch tool — `permission.webfetch` is a URL-keyed map (`{ "*": "ask" }` from the
- *     template); opencode matches the resource against the URL, so `*{base}*` allows it;
- *   - shell fetch — `permission.bash` gains `curl *{base}*` / `wget *{base}*` after the
- *     template's `curl *` / `wget *` ask.
+ * Only the fetch tool gets derived allows: `permission.webfetch` is a URL-keyed map
+ * (`{ "*": "ask" }` from the template); opencode matches the resource against the URL, so
+ * `*{base}*` allows it (accepted risk, decision 551). Shell `curl` / `wget` keep the
+ * template's ask, because a glob over the command string also matches a host in a query.
  */
 function injectOpencodeDerivedAllows(parsed, cwd) {
     const permission = parsed.permission;
@@ -296,13 +292,6 @@ function injectOpencodeDerivedAllows(parsed, cwd) {
         permission[`${server}_*`] = "allow";
     }
     const bases = networkAllowlistBases(resolveNetworkAllowlist(cwd));
-    if (typeof permission.bash === "object" && permission.bash !== null) {
-        const bash = permission.bash;
-        for (const base of bases) {
-            bash[`curl *${base}*`] = "allow";
-            bash[`wget *${base}*`] = "allow";
-        }
-    }
     // Fetch tool — opencode matches the webfetch resource against the requested URL.
     if (typeof permission.webfetch === "object" && permission.webfetch !== null) {
         const webfetch = permission.webfetch;
