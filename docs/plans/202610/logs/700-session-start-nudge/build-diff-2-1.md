diff --git a/.agents/plugins/bkit/hooks.json b/.agents/plugins/bkit/hooks.json
index a58469d4e..a9df089ec 100644
--- a/.agents/plugins/bkit/hooks.json
+++ b/.agents/plugins/bkit/hooks.json
@@ -30,6 +30,16 @@
"statusMessage": "bkit ReadGuard"
}
]

-      },
-      {
-        "matcher": "write_to_file|replace_file_content|view_file|run_command",
-        "hooks": [
-          {
-            "type": "command",
-            "command": "f=hooks/bkit-rules.cjs; test -f \"$f\" || f=.agents/plugins/bkit/$f; test -f \"$f\" && node \"$f\" || true",
-            "statusMessage": "bkit rules"
-          }
-        ]
       }
  ]
  }
  diff --git a/.agents/plugins/bkit/hooks/bkit-rules.cjs b/.agents/plugins/bkit/hooks/bkit-rules.cjs
  new file mode 100644
  index 000000000..1ec48ad23
  --- /dev/null
  +++ b/.agents/plugins/bkit/hooks/bkit-rules.cjs
  @@ -0,0 +1,181 @@
  +#!/usr/bin/env node
  +// bkit-rules.cjs — bkit rules-read advisory PreToolUse hook (Google Antigravity).
  +//
  +// Antigravity has no session-start event, and its only channel to the model is a `deny`'s
  +// reason (bkit's `core/hooks/antigravity-hook.js`). So the advisory is delivered by
  +// denying the FIRST tool call once with the advisory as the reason; the agent's retry of
  +// the identical call is allowed. The session is never blocked.
  +//
  +// bkit generates the advisory text and its once-per-session helper into this hook at
  +// install (bkit's `core/hooks/session-rules-advisory.js`), the same source as the opencode
  +// and Codex hooks, plus the shared envelope adapter and `adviseOnce` deny-once delivery.
  +//
  +// REGISTRATION: `.agents/plugins/bkit/hooks.json`, matcher
  +// `write_to_file|replace_file_content|view_file|run_command` — the broadest PreToolUse
  +// matcher, so the session's first call of any kind carries the advisory. See
  +// .bkit/providers.md § GateGuard.
  +//
  +// CONTRACT — do not regress:
  +// - ADVISORY, DELIVERED BY ONE BLOCK: the first call of a session is denied with the
  +// advisory; the retry is allowed.
  +// - FAIL OPEN: one top-level catch emits a bare allow on any error.
  +// - ONCE PER SESSION: the rulesReadAdviceOnce() gate is keyed by `conversationId`, state
  +// in the OS temp dir, GC'd after 24h. A payload carrying no conversation id falls back
  +// to one shared bucket.
  +//
  +// OWNERSHIP: everything between the markers is bkit-managed and overwritten on every
  +// `bkit install` / `bkit upgrade`. Add your own logic in the driver below the block.
-

+"use strict"; +
+// bkit:start +
+// bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh +
+const fs = require("node:fs");
+const os = require("node:os");
+const path = require("node:path"); +
+// --- Rules-read advisory: the one first-tool-call nudge (bkit renders it from this one
+// source into every host hook whose host has no session-start event: opencode, Codex,
+// Antigravity). Advisory only: it names `.agents/rules.md` and no other file, never blocks
+// and never throws. Needs `fs`, `os` and `path` in scope; the host's own code above
+// declares them. Plain declarations only — no `export` and no `import`: renderParts copies
+// these bytes into each host template, so either would make the rendered CJS hook invalid. +
+const RULES_READ_ADVISORY =

- "[bkit] Required reading before any other action: read `.agents/rules.md` and follow every rule in it.";
-

+/** The OS-temp dir holding one state file per session the advisory already reached. */
+function rulesAdvisoryStateDir() {

- return path.join(os.tmpdir(), "bkit-rules-advisory");
  +}
-

+/** One state file per session id; a payload with no id falls back to one shared bucket. */
+function rulesAdvisoryFile(sessionId) {

- const safe =
- typeof sessionId === "string" ? sessionId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128) : "";
- return path.join(rulesAdvisoryStateDir(), `${safe || "no-session"}.json`);
  +}
-

+/** Opportunistic TTL: drops state files older than 24h. */
+function rulesAdvisoryGc() {

- const dir = rulesAdvisoryStateDir();
- if (!fs.existsSync(dir)) return;
- const cutoff = Date.now() - 24 * 60 * 60 * 1000;
- for (const name of fs.readdirSync(dir)) {
- const file = path.join(dir, name);
- const stat = fs.statSync(file, { throwIfNoEntry: false });
- if (stat && stat.mtimeMs < cutoff) fs.rmSync(file, { force: true });
- }
  +}
-

+/**

- - The advisory the first time `sessionId` is seen, null after. State lives in the OS temp
- - dir — never in the consumer repo — and is GC'd after 24h. Fail-open: a state-file error
- - returns the advisory instead of throwing, so the nudge is never lost to a bad state.
- */
  +function rulesReadAdviceOnce(sessionId) {
- try {
- const file = rulesAdvisoryFile(sessionId);
- if (fs.existsSync(file)) return null;
- fs.mkdirSync(rulesAdvisoryStateDir(), { recursive: true });
- fs.writeFileSync(file, JSON.stringify({ at: Date.now() }), "utf-8");
- rulesAdvisoryGc();
- return RULES_READ_ADVISORY;
- } catch {
- return RULES_READ_ADVISORY;
- }
  +}
-

+// --- Antigravity hook contract: identical in bkit's three Antigravity hooks (bkit renders
+// it from one source). Needs `fs`, `os` and `path` in scope; the host's own code above
+// declares them.
+//
+// Live-verified on the agy CLI: PreToolUse stdin is `{ conversationId, toolCall: { name,
+// args }, workspacePaths, stepIdx, ... }` — no tool_name / tool_input / session_id / cwd.
+// Args: `view_file` AbsolutePath / StartLine / EndLine; `run_command` CommandLine / Cwd;
+// `write_to_file` / `replace_file_content` TargetFile. Stdout is `{ decision, reason }`,
+// and only a `deny`'s reason reaches the model. +
+/**

- - Antigravity's envelope in the Claude-family shape bkit's shared engines read. A payload
- - already in that shape (a consumer's own matcher, a test) passes through unchanged.
- */
  +function fromAntigravityPayload(payload) {
- if (!payload || typeof payload !== "object" || !payload.toolCall) return payload;
- const args =
- payload.toolCall.args && typeof payload.toolCall.args === "object" ? payload.toolCall.args : {};
- const roots = payload.workspacePaths;
- const root = Array.isArray(roots) && typeof roots[0] === "string" ? roots[0] : undefined;
- return {
- tool_name: payload.toolCall.name,
- tool_input: args,
- session_id: payload.conversationId,
- cwd: typeof args.Cwd === "string" ? args.Cwd : root,
- workspace_roots: Array.isArray(roots) ? roots : [],
- };
  +}
-

+// Model-written labels that differ between two otherwise identical calls.
+const AG_LABEL_ARGS = new Set(["toolAction", "toolSummary", "Description", "Instruction"]); +
+/** The call's identity: tool name plus its arguments, labels dropped, keys sorted. */
+function agCallSignature(toolName, input) {

- const args = input && typeof input === "object" ? input : {};
- const kept = Object.keys(args)
- .filter((k) => !AG_LABEL_ARGS.has(k))
- .sort()
- .map((k) => [k, args[k]]);
- return JSON.stringify([toolName, kept]);
  +}
-

+// One record per (hook, conversation): two hooks on the same call each let its retry through.
+function agRetryFile(hook, sessionId) {

- const safe =
- typeof sessionId === "string" ? sessionId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128) : "";
- return path.join(os.tmpdir(), "bkit-antigravity-retry", `${hook}.${safe || "no-session"}.json`);
  +}
-

+/**

- - Delivers an advisory the only way Antigravity shows one to the model: deny the call
- - with the advisory as the reason, once. The identical call right after is the agent's
- - retry and is allowed.
- */
  +function adviseOnce(hook, sessionId, signature, advisory) {
- const file = agRetryFile(hook, sessionId);
- const last = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
- if (last === signature) {
- fs.rmSync(file, { force: true });
- return { decision: "allow" };
- }
- fs.mkdirSync(path.dirname(file), { recursive: true });
- fs.writeFileSync(file, signature, "utf-8");
- return {
- decision: "deny",
- reason: `${advisory}\nBlocked once so you see this; repeat the same call to proceed.`,
- };
  +}
-

+// bkit:end +
+function emit(decision) {

- process.stdout.write(JSON.stringify(decision));
  +}
-

+try {

- const raw = fs.readFileSync(0, "utf-8");
- if (!raw.trim()) {
- emit({ decision: "allow" });
- } else {
- const p = fromAntigravityPayload(JSON.parse(raw));
- const advisory = rulesReadAdviceOnce(p.session_id);
- emit(
-      advisory
-        ? adviseOnce("rules", p.session_id, agCallSignature(p.tool_name, p.tool_input), advisory)
-        : { decision: "allow" },
- );
- }
  +} catch {
- emit({ decision: "allow" }); // fail open — never block, never error out
  +}
  diff --git a/.bkit/core/.bkit/providers.md b/.bkit/core/.bkit/providers.md
  index e8db44e75..3edb230b6 100644
  --- a/.bkit/core/.bkit/providers.md
  +++ b/.bkit/core/.bkit/providers.md
  @@ -300,9 +300,30 @@ Per-action gates, all five hosts, subagents included. Overview only; per-host en
  | `guardrails-tiers.js` | Cursor, Codex, Google Antigravity `guardrails` | git parsing (`parseGit`), deny + ask rules, `secretFileKind`, shell secret-read detection, `classifyShell` precedence |
  | `guardrails-read.js` | Cursor, Google Antigravity `guardrails` | `classifyRead` over `secretFileKind`: deny `*.pem` / `*.p12` / `id_rsa`, ask `.env` / `.env.*` (not `.env.example`) |
  | `preflight-linear.sh` | Claude, Cursor `preflight` | Linear key / issue checks, GraphQL query, `bkit:auto` + terminal-state guards |
  +| `preflight-rules.sh` | Claude, Cursor `preflight` | the rules-read advisory sentence and its `emit_context` call, merged into the one SessionStart JSON document |
  +| `session-rules-advisory.js` | opencode, Codex, Google Antigravity `rules` | the rules-read advisory sentence plus the once-per-session helper (`rulesReadAdviceOnce`, OS-temp state, 24h GC) |

Per host, outside the parts: Claude `gateguard` / `guardrails` — `require` + `hookSpecificOutput` driver, guardrails advisory-only; Cursor — `{ permission }` output, guardrails `Read|TabRead` path extraction, gateguard workspace-relative path resolve; Codex — `apply_patch` envelope parser, ask tier emitted as advisory; Google Antigravity — `antigravity-hook.js` envelope conversion + deny-once delivery, `{ decision, reason }` driver, `write_to_file` / `replace_file_content` edit tools (path `TargetFile`), `view_file` and `run_command` (`CommandLine`); opencode — ES module, `write` / `edit` / `patch` (`apply_patch`) vocabulary, every `*** Add|Update|Delete File:` / `*** Move to:` target of a `patchText` checked (deny mode blocks if any target is a first touch), checklist appended to the tool result in `execute.after` + throw from `execute.before` to block (2.0 exposes no pre-edit context hook, and stderr does not reach the model); `preflight` — trigger (Claude `LINEAR_ISSUE_ID`, Cursor `is_background_agent` + `.bkit/.runtime-cursor` marker), Claude-only Darwin brew check, `emit_context` shape.

+### Rules-read advisory +
+The session-start nudge, on all five hosts (Claude Code, Cursor, Codex, Google Antigravity, opencode). One constant sentence names `.agents/rules.md` as required reading and never names `AGENTS.md`; it never blocks a session and never changes an exit code. Delivery rides each host's earliest event: `SessionStart` where the host has one (Claude Code, Cursor), the first tool call where it does not (opencode, Codex, Antigravity). + +<!-- prettier-ignore -->
+| Host | File | Registration | Delivery |
+| --- | --- | --- | --- |
+| Claude Code | `.claude/hooks/bkit-preflight.sh` | `.claude/settings.json` → `hooks.SessionStart` | spliced from the part `preflight-rules.sh`, merged into the one session-start JSON document: the advisory alone on an IDE session, the advisory plus the Linear guard result on a cloud session, from a `printf` path that needs no `python3` |
+| Cursor | `.cursor/hooks/bkit-preflight.sh` | `.cursor/hooks.json` → `hooks.sessionStart` | same part, same one-document merge, in Cursor's `{ additional_context }` shape |
+| opencode | `.opencode/plugin/bkit-rules.js` | `.opencode/opencode.json` → `plugin` array (spec `./plugin/bkit-rules.js`) | no session-start event: appended to the first tool result in `execute.after` |
+| Codex | `.codex/hooks/bkit-rules.cjs` | `.codex/hooks.json` → `hooks.PreToolUse`, two single-value groups (`apply_patch`, `Bash`) | no session-start event: `additionalContext` once per session |
+| Antigravity | `.agents/plugins/bkit/hooks/bkit-rules.cjs` | `.agents/plugins/bkit/hooks.json` → `hooks.PreToolUse` (`write_to_file\|replace_file_content\|view_file\|run_command`) | no session-start event: deny the first call once with the advisory as `reason`, allow the identical retry | + +**Codex registration:** two single-value `PreToolUse` groups (`apply_patch`, `Bash`) — the shape every shipped Codex matcher uses; alternation is unverified on that host, where a matcher that never fires installs and exits 0 silently. Project-local hooks load only once the `.codex/` layer is TRUSTED (§ host table above). + +**Dedup scope:** once per session. The two SessionStart hooks fire once per session and hold no state; the three first-tool-call hooks dedup by the host's session id (`session_id` Claude / Codex, `conversation_id` Cursor, `conversationId` Antigravity, `sessionID` opencode), state in the OS temp dir, GC'd after 24h; a payload with no session id falls back to one shared bucket. Codex reports the parent's `session_id` inside a subagent and no agent id, so a subagent can miss an advisory its parent already consumed — the same limit § GateGuard records; on opencode a subagent runs in its own session and gets its own advisory. + +**Ownership:** as § GateGuard — bkit owns the advisory sentence and the once-per-session helper between the markers, the consumer owns the driver below them. +

### GateGuard

Advisory hook, on all five hosts (Claude Code, Cursor, Codex, Google Antigravity, opencode). Claude / Cursor / Codex inject the checklist pre-edit (PreToolUse); Antigravity denies the first edit of a file once with the checklist as the reason (the only text its hooks deliver to the model) and allows the retry; opencode 2.0 exposes no pre-edit context hook, so it appends the checklist to the tool result in the post-execute hook — the first edit's result, not a pre-edit gate — and reserves the pre-execute hook for deny mode. First file touch per session → investigation checklist; gate-config paths (JS/TS: tsconfig/eslint/prettier/vitest/jest/vale/slop/lint-staged; Python: ruff.toml/.ruff.toml/.flake8/mypy.ini/.mypy.ini/pylintrc/.pylintrc/pytest.ini; Go: golangci; Rust: clippy.toml/.clippy.toml/rustfmt.toml/.rustfmt.toml; mixed-purpose manifests such as package.json, pyproject.toml, setup.cfg, tox.ini are not matched) → "fix code, don't weaken gate" advisory, except under a consumer's `.bkit/templates/` (reference copies; in bkit's own repo, package name `@cbartens/bkit`, that folder is the template source and stays guarded); new-file writes → reuse-over-duplicate nudge; `docs/**.md` (not `docs/plans/`) → density advisory appended. **fail-open**, **subagents included**, dedup `(session, agent, file)` via OS-temp state, 24h TTL.
@@ -317,7 +338,7 @@ Advisory hook, on all five hosts (Claude Code, Cursor, Codex, Google Antigravity
| Antigravity | `bkit-gateguard.cjs` (CJS) — Antigravity's `{ toolCall, conversationId }` stdin / `{ decision, reason }` stdout; `write_to_file` / `replace_file_content` edit tools, path from `args.TargetFile` | `.agents/plugins/bkit/hooks/bkit-gateguard.cjs` | `.agents/plugins/bkit/hooks.json` → `hooks.PreToolUse` on `write_to_file\|replace_file_content` |
| Cursor | `bkit-guardrails.cjs` (CJS) — destructive-op / secret-exposure gates, the Cursor equivalent of Claude's `permissions` and opencode's `permission` map | `.cursor/hooks/bkit-guardrails.cjs` | `.cursor/hooks.json` → `beforeShellExecution` + `preToolUse` (`Read\|TabRead`), both `failClosed` |

-**Ownership:** both GateGuard files — and Cursor's `bkit-guardrails.cjs` — are **markered-text** (slash-comment: `// bkit:start` / `// bkit:end`). bkit owns only the advisory engine between the markers and reconverges it on every install / upgrade; the driver around it — Claude's stdin read + single `emit()`, opencode's exported `plugin` — is consumer-owned from first install onward, so consumer advisories survive upgrades. bkit's block is pure (no stdin, no stdout / stderr, no top-level call): Claude Code parses hook stdout as one JSON document, so two emitters would produce `{...}{...}` and the whole hook's output — bkit's included — is discarded. Marker-less file on upgrade → hash matches a bkit release: replaced wholesale; hash unknown: block appended plus printed wiring instructions. Uninstall strips the block, leaving the consumer's driver working. `bkit-guardrails.cjs` follows the identical split: bkit owns `bkitGuardrails(payload)`, which returns a decision object or `null` for no-opinion, and the consumer owns the stdin read and the single `emit()`. +**Ownership:** both GateGuard files — and Cursor's `bkit-guardrails.cjs` — are **markered-text** (slash-comment: `// bkit:start` / `// bkit:end`). bkit owns only the advisory engine between the markers and reconverges it on every install / upgrade; the driver around it — Claude's stdin read + single `emit()`, opencode's exported `plugin` — is consumer-owned from first install onward, so consumer advisories survive upgrades. bkit's block is pure (no stdin, no stdout / stderr, no top-level call): Claude Code parses hook stdout as one JSON document, so two emitters would produce `{...}{...}` and the whole hook's output — bkit's included — is discarded. Marker-less file on upgrade → hash matches a bkit release: replaced wholesale; hash unknown: block appended plus printed wiring instructions. Uninstall strips the block, leaving the consumer's driver working. `bkit-guardrails.cjs` follows the identical split: bkit owns `bkitGuardrails(payload)`, which returns a decision object or `null` for no-opinion, and the consumer owns the stdin read and the single `emit()`. The rules-read advisory hooks — `bkit-rules.cjs` on Codex and Antigravity, `bkit-rules.js` on opencode (§ Rules-read advisory) — follow the identical split.

**Modes (env):** unset → advisory _[default]_; `BKIT_GATEGUARD=off` → disabled; `BKIT_GATEGUARD=deny` → deny first touch (checklist as reason), allow retry. `BKIT_ALLOW_CONFIG_EDIT=1` suppresses gate-config advisory.

diff --git a/.bkit/providers.md b/.bkit/providers.md
index a6c84e235..eb245289d 100644
--- a/.bkit/providers.md
+++ b/.bkit/providers.md
@@ -300,9 +300,30 @@ Per-action gates, all five hosts, subagents included. Overview only; per-host en
| `guardrails-tiers.js` | Cursor, Codex, Google Antigravity `guardrails` | git parsing (`parseGit`), deny + ask rules, `secretFileKind`, shell secret-read detection, `classifyShell` precedence |
| `guardrails-read.js` | Cursor, Google Antigravity `guardrails` | `classifyRead` over `secretFileKind`: deny `*.pem` / `*.p12` / `id_rsa`, ask `.env` / `.env.*` (not `.env.example`) |
| `preflight-linear.sh` | Claude, Cursor `preflight` | Linear key / issue checks, GraphQL query, `bkit:auto` + terminal-state guards |
+| `preflight-rules.sh` | Claude, Cursor `preflight` | the rules-read advisory sentence and its `emit_context` call, merged into the one SessionStart JSON document |
+| `session-rules-advisory.js` | opencode, Codex, Google Antigravity `rules` | the rules-read advisory sentence plus the once-per-session helper (`rulesReadAdviceOnce`, OS-temp state, 24h GC) |

Per host, outside the parts: Claude `gateguard` / `guardrails` — `require` + `hookSpecificOutput` driver, guardrails advisory-only; Cursor — `{ permission }` output, guardrails `Read|TabRead` path extraction, gateguard workspace-relative path resolve; Codex — `apply_patch` envelope parser, ask tier emitted as advisory; Google Antigravity — `antigravity-hook.js` envelope conversion + deny-once delivery, `{ decision, reason }` driver, `write_to_file` / `replace_file_content` edit tools (path `TargetFile`), `view_file` and `run_command` (`CommandLine`); opencode — ES module, `write` / `edit` / `patch` (`apply_patch`) vocabulary, every `*** Add|Update|Delete File:` / `*** Move to:` target of a `patchText` checked (deny mode blocks if any target is a first touch), checklist appended to the tool result in `execute.after` + throw from `execute.before` to block (2.0 exposes no pre-edit context hook, and stderr does not reach the model); `preflight` — trigger (Claude `LINEAR_ISSUE_ID`, Cursor `is_background_agent` + `.bkit/.runtime-cursor` marker), Claude-only Darwin brew check, `emit_context` shape.

+### Rules-read advisory +
+The session-start nudge, on all five hosts (Claude Code, Cursor, Codex, Google Antigravity, opencode). One constant sentence names `.agents/rules.md` as required reading and never names `AGENTS.md`; it never blocks a session and never changes an exit code. Delivery rides each host's earliest event: `SessionStart` where the host has one (Claude Code, Cursor), the first tool call where it does not (opencode, Codex, Antigravity). + +<!-- prettier-ignore -->
+| Host | File | Registration | Delivery |
+| --- | --- | --- | --- |
+| Claude Code | `.claude/hooks/bkit-preflight.sh` | `.claude/settings.json` → `hooks.SessionStart` | spliced from the part `preflight-rules.sh`, merged into the one session-start JSON document: the advisory alone on an IDE session, the advisory plus the Linear guard result on a cloud session, from a `printf` path that needs no `python3` |
+| Cursor | `.cursor/hooks/bkit-preflight.sh` | `.cursor/hooks.json` → `hooks.sessionStart` | same part, same one-document merge, in Cursor's `{ additional_context }` shape |
+| opencode | `.opencode/plugin/bkit-rules.js` | `.opencode/opencode.json` → `plugin` array (spec `./plugin/bkit-rules.js`) | no session-start event: appended to the first tool result in `execute.after` |
+| Codex | `.codex/hooks/bkit-rules.cjs` | `.codex/hooks.json` → `hooks.PreToolUse`, two single-value groups (`apply_patch`, `Bash`) | no session-start event: `additionalContext` once per session |
+| Antigravity | `.agents/plugins/bkit/hooks/bkit-rules.cjs` | `.agents/plugins/bkit/hooks.json` → `hooks.PreToolUse` (`write_to_file\|replace_file_content\|view_file\|run_command`) | no session-start event: deny the first call once with the advisory as `reason`, allow the identical retry | + +**Codex registration:** two single-value `PreToolUse` groups (`apply_patch`, `Bash`) — the shape every shipped Codex matcher uses; alternation is unverified on that host, where a matcher that never fires installs and exits 0 silently. Project-local hooks load only once the `.codex/` layer is TRUSTED (§ host table above). + +**Dedup scope:** once per session. The two SessionStart hooks fire once per session and hold no state; the three first-tool-call hooks dedup by the host's session id (`session_id` Claude / Codex, `conversation_id` Cursor, `conversationId` Antigravity, `sessionID` opencode), state in the OS temp dir, GC'd after 24h; a payload with no session id falls back to one shared bucket. Codex reports the parent's `session_id` inside a subagent and no agent id, so a subagent can miss an advisory its parent already consumed — the same limit § GateGuard records; on opencode a subagent runs in its own session and gets its own advisory. + +**Ownership:** as § GateGuard — bkit owns the advisory sentence and the once-per-session helper between the markers, the consumer owns the driver below them. +

### GateGuard

Advisory hook, on all five hosts (Claude Code, Cursor, Codex, Google Antigravity, opencode). Claude / Cursor / Codex inject the checklist pre-edit (PreToolUse); Antigravity denies the first edit of a file once with the checklist as the reason (the only text its hooks deliver to the model) and allows the retry; opencode 2.0 exposes no pre-edit context hook, so it appends the checklist to the tool result in the post-execute hook — the first edit's result, not a pre-edit gate — and reserves the pre-execute hook for deny mode. First file touch per session → investigation checklist; gate-config paths (JS/TS: tsconfig/eslint/prettier/vitest/jest/vale/slop/lint-staged; Python: ruff.toml/.ruff.toml/.flake8/mypy.ini/.mypy.ini/pylintrc/.pylintrc/pytest.ini; Go: golangci; Rust: clippy.toml/.clippy.toml/rustfmt.toml/.rustfmt.toml; mixed-purpose manifests such as package.json, pyproject.toml, setup.cfg, tox.ini are not matched) → "fix code, don't weaken gate" advisory, except under a consumer's `.bkit/templates/` (reference copies; in bkit's own repo, package name `@cbartens/bkit`, that folder is the template source and stays guarded); new-file writes → reuse-over-duplicate nudge; `docs/**.md` (not `docs/plans/`) → density advisory appended. **fail-open**, **subagents included**, dedup `(session, agent, file)` via OS-temp state, 24h TTL.
@@ -317,7 +338,7 @@ Advisory hook, on all five hosts (Claude Code, Cursor, Codex, Google Antigravity
| Antigravity | `bkit-gateguard.cjs` (CJS) — Antigravity's `{ toolCall, conversationId }` stdin / `{ decision, reason }` stdout; `write_to_file` / `replace_file_content` edit tools, path from `args.TargetFile` | `.agents/plugins/bkit/hooks/bkit-gateguard.cjs` | `.agents/plugins/bkit/hooks.json` → `hooks.PreToolUse` on `write_to_file\|replace_file_content` |
| Cursor | `bkit-guardrails.cjs` (CJS) — destructive-op / secret-exposure gates, the Cursor equivalent of Claude's `permissions` and opencode's `permission` map | `.cursor/hooks/bkit-guardrails.cjs` | `.cursor/hooks.json` → `beforeShellExecution` + `preToolUse` (`Read\|TabRead`), both `failClosed` |

-**Ownership:** both GateGuard files — and Cursor's `bkit-guardrails.cjs` — are **markered-text** (slash-comment: `// bkit:start` / `// bkit:end`). bkit owns only the advisory engine between the markers and reconverges it on every install / upgrade; the driver around it — Claude's stdin read + single `emit()`, opencode's exported `plugin` — is consumer-owned from first install onward, so consumer advisories survive upgrades. bkit's block is pure (no stdin, no stdout / stderr, no top-level call): Claude Code parses hook stdout as one JSON document, so two emitters would produce `{...}{...}` and the whole hook's output — bkit's included — is discarded. Marker-less file on upgrade → hash matches a bkit release: replaced wholesale; hash unknown: block appended plus printed wiring instructions. Uninstall strips the block, leaving the consumer's driver working. `bkit-guardrails.cjs` follows the identical split: bkit owns `bkitGuardrails(payload)`, which returns a decision object or `null` for no-opinion, and the consumer owns the stdin read and the single `emit()`. +**Ownership:** both GateGuard files — and Cursor's `bkit-guardrails.cjs` — are **markered-text** (slash-comment: `// bkit:start` / `// bkit:end`). bkit owns only the advisory engine between the markers and reconverges it on every install / upgrade; the driver around it — Claude's stdin read + single `emit()`, opencode's exported `plugin` — is consumer-owned from first install onward, so consumer advisories survive upgrades. bkit's block is pure (no stdin, no stdout / stderr, no top-level call): Claude Code parses hook stdout as one JSON document, so two emitters would produce `{...}{...}` and the whole hook's output — bkit's included — is discarded. Marker-less file on upgrade → hash matches a bkit release: replaced wholesale; hash unknown: block appended plus printed wiring instructions. Uninstall strips the block, leaving the consumer's driver working. `bkit-guardrails.cjs` follows the identical split: bkit owns `bkitGuardrails(payload)`, which returns a decision object or `null` for no-opinion, and the consumer owns the stdin read and the single `emit()`. The rules-read advisory hooks — `bkit-rules.cjs` on Codex and Antigravity, `bkit-rules.js` on opencode (§ Rules-read advisory) — follow the identical split.

**Modes (env):** unset → advisory _[default]_; `BKIT_GATEGUARD=off` → disabled; `BKIT_GATEGUARD=deny` → deny first touch (checklist as reason), allow retry. `BKIT_ALLOW_CONFIG_EDIT=1` suppresses gate-config advisory.

diff --git a/.bkit/version b/.bkit/version
index 4548a1190..0debe2670 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -21,7 +21,7 @@
"docs/architecture.md": "2d2d7150544ec71d50b1ca4015e0823180129de7b06ec05df412b5300aa9f342",
"docs/technology.md": "407aa5f6d77018d48fa2463c6ac18d6e76dc96830676e22c7f6a81013c5588ac",
".bkit/.env.example": "3eae6dd3d96a33aed1745fc6b069000ae7272fbdab99617250015e9c233e6200",

- ".opencode/opencode.json": "8188271e9949a4fe71808bae5d70b33c192abf7cd5645b5051803ab531c2f2ac",

* ".opencode/opencode.json": "06b3702dcb8968463c164b36fbc340428591f6601420cb48e95371db1d1ac958",
  "docs/design.md": "ca5146835a83d6e22e28e990b11e2df619096482b02c6d6e2567592cff2bea41",
  ".claude/commands/bkit-auto.md": "0f0a4f496d1a5f4ba274c5f47e7b53df02c8bd399d18db2bdf2e1dcc0579f85b",
  ".claude/commands/bkit-build.md": "c73b20aaa4eb3a430dc7aa4f4f90c886138aaa94cfd42a3222c566376eed752d",
  @@ -159,7 +159,7 @@
  ".codex/agents/bkit-ship-update-docs.toml": "b4ec1f66530d1347f5838967dce0e027cb00b58caca85b974f35f6444d10ee78",
  ".codex/agents/bkit-utility-compress-markdown.toml": "d2d207968b0fa208b8f18d5b3e16dd8e0fa7513aa5904595d1cb28a6e32ed053",
  ".codex/agents/bkit-utility-update-documentation.toml": "f773ee47957dac97cb2674c3a012a3fdc589c9edf34cc9f91e6768cbb3257873",

- ".codex/hooks.json": "a6605aff7bb90e089d415c1c07083baa23424f46c21b94e535d2988e82c9aea8",

* ".codex/hooks.json": "30b45abaee09ac88a77f2296fb31166e96f675a77edc605186f5b2b3fd9063b0",
  ".opencode/agents/bkit-utility-update-decisions.md": "93f7899752f4812813bd31834b6909bc08dd7dd1774e70f656178195c3f33034",
  ".opencode/agents/bkit-utility-update-deferrals.md": "c1bc524ed5f44db56d1e3767fad3ebae77d27bc587ac89dea52137087eecff68",
  ".opencode/agents/bkit-utility-update-failures.md": "726bf1a273a5d36d301e2e636445266218e88b9feda0f55a02014b6819a541d7",
  @@ -225,7 +225,7 @@
  ".bkit/comparison.md": "55c9cc956a824f699898e66dd9a9bd7534d984d29e095187e37ed0229e9e01e5",
  ".bkit/install.md": "406ba71349bc016d164a2119eeb35836bb0451eae03b92f54e134df07e921c46",
  ".bkit/jsonl.md": "0c9c8b5bf4f1241e64b07898a9ed16e54d3825c40f43067608ea374a5680d549",

- ".bkit/providers.md": "d5c8cef101535a192a93cd9d1c9626ede070aef829eafba48e6e68aebdb8a3e4",

* ".bkit/providers.md": "6e382360401c914e8967617532f8817c20d9358ff68f0d9ee5dbafe901ae28dc",
  ".bkit/prompts.md": "4aea780ed1c7fd82b9a3fe5c22a1151fc804d93c44b6c4ab2e3703080d6db19f",
  ".bkit/trackers.md": "189cac5e7f50b729b2c1a3e7b7e5bee875556a227273521d904537b748e11986",
  ".bkit/workflows.md": "eac6d5b8fda266b6c4355c1471598641e316164cf4c07c6dafd63f27890c449e",
  @@ -233,12 +233,12 @@
  ".cursor/rules/bkit-rules.mdc": "164c1bc7aed517d5eca01abac2f0c0e87a1102ceb1700eae02e340ef6f9ce797",
  ".claude/hooks/bkit-gateguard.cjs": "839a1e2c52484956a310f763df6ce749d649e4dab9ac035f52b462b4b69609d6",
  ".claude/hooks/bkit-guardrails.cjs": "82776a4c2d7d2f2cb5ca4c14087ab5364587f3c1b4049778c6806b0da8de925a",

- ".claude/hooks/bkit-preflight.sh": "6d52b8c4deeab863073295dd1f6cb46f9b26cd9c3bbb9bea04d2a8a92bce8387",

* ".claude/hooks/bkit-preflight.sh": "a7f8a3c35cf04891423218ecc1bb036251988fa5a021066ff2812af827b8c688",
  ".codex/hooks/bkit-gateguard.cjs": "e6e347a7dacd9a0f425bb576143c3c7ec1fc5c08674526b2e56fa2255adecbee",
  ".codex/hooks/bkit-guardrails.cjs": "fc147e816a26be47009c656a048ecc1aed4cbe349d53bb9899783aa44def8cd2",
  ".cursor/hooks/bkit-gateguard.cjs": "1b79611ea218a03fdb80ecf12fbd2bfaa66952bafa7d89d7a95e96bc41dd3696",
  ".cursor/hooks/bkit-guardrails.cjs": "5be877200b11dfe7d44237d3b0a1cf14b843888005cc372db8df2c207b89fc10",

- ".cursor/hooks/bkit-preflight.sh": "b929a631a12a088e5ca41555ec7cf94305af06c9b3a24a0698036b71c380d108",

* ".cursor/hooks/bkit-preflight.sh": "c2532cfa550719ba815163cb8dc4a234344520dd8825a281560ed6455cde8f16",
  ".opencode/plugin/bkit-gateguard.js": "ae5f36dfd1bf08bc487adea65c28cc5b16b2bb1f457ab11c421694fa0fbfdcb6",
  ".bkit/LICENSE.md": "e768db6af8e05dceec02eaff78e8a8478cd8705f5f06522377f98a5a513bc027",
  "GEMINI.md": "bcda8fa4805a544dd2ecd475f3864543db52dc45e9947b8aaa6f864c612f0442",
  @@ -265,7 +265,9 @@
  ".cursor/agents/bkit-build-plan-convert.md": "85b09edacf552ae8ffaa9a99e24577f9cb3c95711dd4fadfef460737cabb5afc",
  ".opencode/agents/bkit-build-plan-convert.md": "d92d55cab671b8b9f3897f7e7cb8471ecb8c2bac3f983e624aa63a5216dd43d7",
  ".codex/agents/bkit-build-plan-convert.toml": "114f3d7eb538b94088ae441b3181648f41511fa94bbd090b5ade02f225b2d0cc",

- ".bkit/authoring.md": "3ed815ec886f46a41e8c4a0c35326fe24f4ec1301325da2472846d987354ee1e"

* ".bkit/authoring.md": "3ed815ec886f46a41e8c4a0c35326fe24f4ec1301325da2472846d987354ee1e",
* ".opencode/plugin/bkit-rules.js": "ee9ab878d4939f7569d377930cb8ab0c608916f3846d82bdf10f5e228de7e3ec",
* ".codex/hooks/bkit-rules.cjs": "d692d543a9295b0ba351ee0c456eedd672454654391288582b6fb706f50b33a6"
  },
  "claudeAllowDerived": [
  "WebFetch(domain:12factor.net)",
  diff --git a/.claude/hooks/bkit-preflight.sh b/.claude/hooks/bkit-preflight.sh
  index 5c54a0e4c..fe0db104c 100755
  --- a/.claude/hooks/bkit-preflight.sh
  +++ b/.claude/hooks/bkit-preflight.sh
  @@ -28,21 +28,48 @@ set -euo pipefail

# Claude SessionStart payload: { session_id, transcript_path, cwd, permission_mode } — unused here.

INPUT=$(cat)

-# emit_context — Claude SessionStart expects { hookSpecificOutput: { hookEventName, additionalContext } }.
+# emit_context — Claude SessionStart expects ONE JSON document
+# { hookSpecificOutput: { hookEventName, additionalContext } } on stdout. Each call
+# accumulates its string; the EXIT trap writes the document once, so the advisory and
+# the Linear guard result ride one document (two documents are unparseable).

# (Cursor variant: emits { additional_context: ... } directly.)

+BKIT_CONTEXT=""
emit_context() {

- python3 - "$1" <<'PY'
  -import json, sys
  -print(json.dumps({
- "hookSpecificOutput": {
- "hookEventName": "SessionStart",
- "additionalContext": sys.argv[1],
- },
  -}))
  -PY

* [[ -z "$BKIT_CONTEXT" ]] || BKIT_CONTEXT+=$'\n\n'
* BKIT_CONTEXT+="$1"
  }

-# IDE session detection — skip silently when this isn't a background/cloud run.
+# JSON-escape one string, so a context carrying a quote or a backslash cannot break the
+# document. No python3 on this path: a python3-less IDE session must still get the
+# advisory (Claude cannot block, so a lost advisory would be silent).
+bkit_json_escape() {

- local s=$1
- s=${s//\\/\\\\}
- s=${s//\"/\\\"}
- s=${s//$'\n'/\\n}
- s=${s//$'\r'/\\r}
- s=${s//$'\t'/\\t}
- printf '%s' "$s"
  +}
-

+bkit_write_document() {

- [[ -n "$BKIT_CONTEXT" ]] || return 0
- printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' \
- "$(bkit_json_escape "$BKIT_CONTEXT")"
  +}
-

+trap bkit_write_document EXIT +
+# --- Rules-read advisory: the one session-start nudge (bkit renders it from this one
+# source into each SessionStart host's hook). Advisory only: it names `.agents/rules.md`
+# and no other file, never blocks a session and never changes the exit code. Needs
+# `emit_context`, which the host's own code above defines. +
+BKIT_RULES_ADVISORY='[bkit] Required reading before any other action: read `.agents/rules.md` and follow every rule in it.' +
+emit_context "$BKIT_RULES_ADVISORY" +
+# IDE session detection — the advisory above already fired; nothing else runs here.

# Claude has no native is-background flag, so we use empty LINEAR_ISSUE_ID as the proxy.

# (Cursor variant: parses `is_background_agent` from stdin JSON.)

if [[ -z "${LINEAR_ISSUE_ID:-}" ]]; then
diff --git a/.codex/hooks.json b/.codex/hooks.json
index 856998ef7..a9052a775 100644
--- a/.codex/hooks.json
+++ b/.codex/hooks.json
@@ -30,6 +30,26 @@
"statusMessage": "bkit ReadGuard"
}
]

-      },
-      {
-        "matcher": "apply_patch",
-        "hooks": [
-          {
-            "type": "command",
-            "command": "test -f .codex/hooks/bkit-rules.cjs && node .codex/hooks/bkit-rules.cjs || true",
-            "statusMessage": "bkit rules"
-          }
-        ]
-      },
-      {
-        "matcher": "Bash",
-        "hooks": [
-          {
-            "type": "command",
-            "command": "test -f .codex/hooks/bkit-rules.cjs && node .codex/hooks/bkit-rules.cjs || true",
-            "statusMessage": "bkit rules"
-          }
-        ]
       }
  ],
  "PreCompact": [
  diff --git a/.codex/hooks/bkit-rules.cjs b/.codex/hooks/bkit-rules.cjs
  new file mode 100644
  index 000000000..e01d9501d
  --- /dev/null
  +++ b/.codex/hooks/bkit-rules.cjs
  @@ -0,0 +1,107 @@
  +#!/usr/bin/env node
  +// bkit-rules.cjs — bkit rules-read advisory PreToolUse hook (Codex CLI).
  +//
  +// Codex's hook contract is the same family as Claude Code's — same stdin envelope
  +// (`tool_name`, `tool_input`, `session_id`, `cwd`), same stdout shape
  +// (`hookSpecificOutput` with `additionalContext`). bkit generates the advisory text and
  +// its once-per-session helper into it at install (bkit's
  +// `core/hooks/session-rules-advisory.js`), the same source as the opencode and
  +// Antigravity hooks.
  +//
  +// Codex has no session-start event, so the advisory rides the FIRST tool call instead:
  +// the hook writes it as `additionalContext` once per session, and every later call writes
  +// nothing. `additionalContext` is advisory only — no call is ever blocked.
  +//
  +// REGISTRATION: `.codex/hooks.json`, two single-value `PreToolUse` groups — `apply_patch`
  +// and `Bash`, the shape every shipped Codex matcher uses (alternation is not verified on
  +// that host). Codex loads project-local hooks only once the project `.codex/` layer is
  +// TRUSTED — until then this does not run. See .bkit/providers.md § GateGuard.
  +//
  +// CONTRACT — do not regress:
  +// - ADVISORY ONLY: emits `additionalContext`, never a permission decision.
  +// - FAIL OPEN: one top-level catch swallows every error and exits 0.
  +// - ONCE PER SESSION: dedup is by `session_id`, state in the OS temp dir, GC'd after
  +// 24h. Codex reports the parent's session_id inside a subagent and no agent id, so a
  +// subagent can miss an advisory its parent already consumed — the same limit
  +// GateGuard records. A payload carrying no session id falls back to one shared bucket.
  +//
  +// OWNERSHIP: everything between the markers is bkit-managed and overwritten on every
  +// `bkit install` / `bkit upgrade`. Add your own logic in the driver below the block.
-

+"use strict"; +
+// bkit:start +
+// bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh +
+const fs = require("node:fs");
+const os = require("node:os");
+const path = require("node:path"); +
+// --- Rules-read advisory: the one first-tool-call nudge (bkit renders it from this one
+// source into every host hook whose host has no session-start event: opencode, Codex,
+// Antigravity). Advisory only: it names `.agents/rules.md` and no other file, never blocks
+// and never throws. Needs `fs`, `os` and `path` in scope; the host's own code above
+// declares them. Plain declarations only — no `export` and no `import`: renderParts copies
+// these bytes into each host template, so either would make the rendered CJS hook invalid. +
+const RULES_READ_ADVISORY =

- "[bkit] Required reading before any other action: read `.agents/rules.md` and follow every rule in it.";
-

+/** The OS-temp dir holding one state file per session the advisory already reached. */
+function rulesAdvisoryStateDir() {

- return path.join(os.tmpdir(), "bkit-rules-advisory");
  +}
-

+/** One state file per session id; a payload with no id falls back to one shared bucket. */
+function rulesAdvisoryFile(sessionId) {

- const safe =
- typeof sessionId === "string" ? sessionId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128) : "";
- return path.join(rulesAdvisoryStateDir(), `${safe || "no-session"}.json`);
  +}
-

+/** Opportunistic TTL: drops state files older than 24h. */
+function rulesAdvisoryGc() {

- const dir = rulesAdvisoryStateDir();
- if (!fs.existsSync(dir)) return;
- const cutoff = Date.now() - 24 * 60 * 60 * 1000;
- for (const name of fs.readdirSync(dir)) {
- const file = path.join(dir, name);
- const stat = fs.statSync(file, { throwIfNoEntry: false });
- if (stat && stat.mtimeMs < cutoff) fs.rmSync(file, { force: true });
- }
  +}
-

+/**

- - The advisory the first time `sessionId` is seen, null after. State lives in the OS temp
- - dir — never in the consumer repo — and is GC'd after 24h. Fail-open: a state-file error
- - returns the advisory instead of throwing, so the nudge is never lost to a bad state.
- */
  +function rulesReadAdviceOnce(sessionId) {
- try {
- const file = rulesAdvisoryFile(sessionId);
- if (fs.existsSync(file)) return null;
- fs.mkdirSync(rulesAdvisoryStateDir(), { recursive: true });
- fs.writeFileSync(file, JSON.stringify({ at: Date.now() }), "utf-8");
- rulesAdvisoryGc();
- return RULES_READ_ADVISORY;
- } catch {
- return RULES_READ_ADVISORY;
- }
  +}
-

+// bkit:end +
+function emit(payload) {

- process.stdout.write(JSON.stringify({ hookSpecificOutput: payload }));
  +}
-

+try {

- const raw = fs.readFileSync(0, "utf-8");
- if (raw.trim()) {
- const advisory = rulesReadAdviceOnce(JSON.parse(raw).session_id);
- if (advisory) emit({ hookEventName: "PreToolUse", additionalContext: advisory });
- }
  +} catch {
- process.exitCode = 0; // fail open — never block, never error out
  +}
  diff --git a/.cursor/hooks/bkit-preflight.sh b/.cursor/hooks/bkit-preflight.sh
  index 147381548..520dce000 100755
  --- a/.cursor/hooks/bkit-preflight.sh
  +++ b/.cursor/hooks/bkit-preflight.sh
  @@ -26,6 +26,46 @@ set -euo pipefail

# Cursor sessionStart payload: { session_id, is_background_agent, composer_mode } — used for IDE detection below.

INPUT=$(cat)

+# emit_context — Cursor sessionStart expects ONE JSON document { additional_context: ... }
+# on stdout. Each call accumulates its string; the EXIT trap writes the document once, so
+# the advisory and the Linear guard result ride one document. Defined above the bail so an
+# IDE session gets the advisory too, and built with no python3: failClosed:true blocks the
+# session on a non-zero exit, and an IDE session may not have python3 at all.
+# (Claude variant: wraps in { hookSpecificOutput: { hookEventName, additionalContext } }.)
+BKIT_CONTEXT=""
+emit_context() {

- [[ -z "$BKIT_CONTEXT" ]] || BKIT_CONTEXT+=$'\n\n'
- BKIT_CONTEXT+="$1"
  +}
-

+# JSON-escape one string, so a context carrying a quote or a backslash cannot break the
+# document.
+bkit_json_escape() {

- local s=$1
- s=${s//\\/\\\\}
- s=${s//\"/\\\"}
- s=${s//$'\n'/\\n}
- s=${s//$'\r'/\\r}
- s=${s//$'\t'/\\t}
- printf '%s' "$s"
  +}
-

+bkit_write_document() {

- [[ -n "$BKIT_CONTEXT" ]] || return 0
- printf '{"additional_context":"%s"}\n' "$(bkit_json_escape "$BKIT_CONTEXT")"
  +}
-

+trap bkit_write_document EXIT +
+# --- Rules-read advisory: the one session-start nudge (bkit renders it from this one
+# source into each SessionStart host's hook). Advisory only: it names `.agents/rules.md`
+# and no other file, never blocks a session and never changes the exit code. Needs
+# `emit_context`, which the host's own code above defines. +
+BKIT_RULES_ADVISORY='[bkit] Required reading before any other action: read `.agents/rules.md` and follow every rule in it.' +
+emit_context "$BKIT_RULES_ADVISORY" +

# IDE session bailout — grep only, no python3 on the skip path (failClosed:true in

# .cursor/hooks.json blocks the session if this exits non-zero). Background-agent

# sessions run inside the bkit Dockerfile, where python3 is present for the code below.

@@ -44,15 +84,6 @@ if BKIT_REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) && [[ -d "$BKIT_R
|| echo "[bkit-runtime] could not write .bkit/.runtime-cursor — runtime will resolve as LOCAL" >&2
fi

-# emit_context — Cursor sessionStart expects { additional_context: ... } directly.
-# (Claude variant: wraps in { hookSpecificOutput: { hookEventName, additionalContext } }.)
-emit_context() {

- python3 - "$1" <<'PY'
  -import json, sys
  -print(json.dumps({"additional_context": sys.argv[1]}))
  -PY
  -}
-

# Brew dep preflight — N/A on Cursor Cloud.

# Cursor Cloud runs in a containerised env where required CLIs (gh, jq, vale, pnpm, bun) are

# pre-installed via .cursor/Dockerfile, so the laptop-side brew check makes no sense here.

diff --git a/.opencode/opencode.json b/.opencode/opencode.json
index 0e94ae640..d65e42f99 100644
--- a/.opencode/opencode.json
+++ b/.opencode/opencode.json
@@ -366,7 +366,8 @@
},
"plugin": [
"./plugin/bkit-gateguard.js",

- "./plugin/bkit-readguard.js"

* "./plugin/bkit-readguard.js",
* "./plugin/bkit-rules.js"
  ],
  "provider": {
  "openrouter": {
  diff --git a/.opencode/plugin/bkit-rules.js b/.opencode/plugin/bkit-rules.js
  new file mode 100644
  index 000000000..4fbf0309e
  --- /dev/null
  +++ b/.opencode/plugin/bkit-rules.js
  @@ -0,0 +1,133 @@
  +// bkit-rules.js — bkit rules-read advisory plugin for opencode.
  +//
  +// Fires on opencode's tool hooks. On the FIRST tool call of a session it appends the
  +// rules-read advisory to the tool result, so the model is told to read `.agents/rules.md`
  +// before any other action; every later call appends nothing.
  +//
  +// CONTRACT — do not regress:
  +// - ADVISORY ONLY: appends the advisory to the tool RESULT in the after-execute hook —
  +// never blocks. stderr is NOT a model channel on 2.0's detached server.
  +// - FAIL OPEN: a top-level try/catch swallows every error; the plugin never throws.
  +// - ONCE PER SESSION: dedup is by sessionID, state in the OS temp dir, GC'd after 24h.
  +// A subagent runs in its own session, so it gets its own advisory; a payload carrying
  +// no session id falls back to one shared bucket.
  +// - NO SESSION-START EVENT: opencode has none, so the advisory rides the first tool
  +// call's result instead.
  +//
  +// The advisory text and its once-per-session helper are generated at install from bkit's
  +// `core/hooks/session-rules-advisory.js`, the same source as the Codex and Antigravity
  +// hooks.
  +//
  +// OWNERSHIP: everything between the markers below is bkit-managed and is overwritten on
  +// every `bkit install` / `bkit upgrade`. It is a pure advisory only — no client calls, no
  +// stderr write, no throw — so it composes with your own checks in the exported plugin
  +// that follows the managed block.
*

+// bkit:start +
+// bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh +
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path"; +
+// --- Rules-read advisory: the one first-tool-call nudge (bkit renders it from this one
+// source into every host hook whose host has no session-start event: opencode, Codex,
+// Antigravity). Advisory only: it names `.agents/rules.md` and no other file, never blocks
+// and never throws. Needs `fs`, `os` and `path` in scope; the host's own code above
+// declares them. Plain declarations only — no `export` and no `import`: renderParts copies
+// these bytes into each host template, so either would make the rendered CJS hook invalid. +
+const RULES_READ_ADVISORY =

- "[bkit] Required reading before any other action: read `.agents/rules.md` and follow every rule in it.";
-

+/** The OS-temp dir holding one state file per session the advisory already reached. */
+function rulesAdvisoryStateDir() {

- return path.join(os.tmpdir(), "bkit-rules-advisory");
  +}
-

+/** One state file per session id; a payload with no id falls back to one shared bucket. */
+function rulesAdvisoryFile(sessionId) {

- const safe =
- typeof sessionId === "string" ? sessionId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128) : "";
- return path.join(rulesAdvisoryStateDir(), `${safe || "no-session"}.json`);
  +}
-

+/** Opportunistic TTL: drops state files older than 24h. */
+function rulesAdvisoryGc() {

- const dir = rulesAdvisoryStateDir();
- if (!fs.existsSync(dir)) return;
- const cutoff = Date.now() - 24 * 60 * 60 * 1000;
- for (const name of fs.readdirSync(dir)) {
- const file = path.join(dir, name);
- const stat = fs.statSync(file, { throwIfNoEntry: false });
- if (stat && stat.mtimeMs < cutoff) fs.rmSync(file, { force: true });
- }
  +}
-

+/**

- - The advisory the first time `sessionId` is seen, null after. State lives in the OS temp
- - dir — never in the consumer repo — and is GC'd after 24h. Fail-open: a state-file error
- - returns the advisory instead of throwing, so the nudge is never lost to a bad state.
- */
  +function rulesReadAdviceOnce(sessionId) {
- try {
- const file = rulesAdvisoryFile(sessionId);
- if (fs.existsSync(file)) return null;
- fs.mkdirSync(rulesAdvisoryStateDir(), { recursive: true });
- fs.writeFileSync(file, JSON.stringify({ at: Date.now() }), "utf-8");
- rulesAdvisoryGc();
- return RULES_READ_ADVISORY;
- } catch {
- return RULES_READ_ADVISORY;
- }
  +}
-

+// bkit:end +
+// ---------------------------------------------------------------------------
+// Driver — the one export shape OpenCode 1.x and 2.0 both load (same as
+// `bkit-gateguard.js`): 2.0 calls `setup(ctx)` and registers `execute.after`; 1.18.29+
+// calls `server()` and uses `"tool.execute.after"`. Both call the shared
+// rulesReadAdviceOnce() above, so once-per-session behaviour is identical across the two.
+// The file deliberately imports NOTHING from `@opencode/plugin`: that package only exists
+// on 2.0, and importing it would break the module load on 1.x.
+// --------------------------------------------------------------------------- +
+/** OpenCode 1.x after hook: append the advisory to `output.output`, the result text. */
+async function bkitRulesAfterV1(hookInput, output) {

- try {
- const advisory = rulesReadAdviceOnce(hookInput?.sessionID);
- if (!advisory) return;
- if (!output || typeof output !== "object") return;
- const existing = typeof output.output === "string" ? output.output : "";
- output.output = existing.length > 0 ? `${existing}\n\n${advisory}` : advisory;
- } catch {
- // fail-open: never let an advisory error reach the host
- }
  +}
-

+/** OpenCode 2.0 after hook: append the advisory to `event.result.content`. */
+async function bkitRulesAfterV2(event) {

- try {
- const advisory = rulesReadAdviceOnce(event?.sessionID);
- if (!advisory) return;
- if (!event || !event.result) return;
- const content = Array.isArray(event.result.content) ? event.result.content : [];
- event.result.content = [...content, { type: "text", text: advisory }];
- } catch {
- // fail-open: never let an advisory error reach the host
- }
  +}
-

+const bkitRulesPlugin = {

- id: "bkit-rules",
- async setup(ctx) {
- await ctx.tool.hook("execute.after", bkitRulesAfterV2);
- },
- async server() {
- return { "tool.execute.after": bkitRulesAfterV1 };
- },
  +};
-

+export default bkitRulesPlugin;
diff --git a/docs/architecture.md b/docs/architecture.md
index c6a9b0cca..6aa8ff737 100644
--- a/docs/architecture.md
+++ b/docs/architecture.md
@@ -169,7 +169,7 @@ Workflow / prompt SOURCES not shipped into consumer `.agents/`; live in installe

- `.codex/agents/` + `.codex/hooks.json` + `.codex/hooks/` — additive Codex CLI host; opt-in `bkit install --codex`. No `.codex/config.toml`: `openai` is a reserved built-in provider id, so bkit has nothing to declare. Project-local hooks load only once the `.codex/` layer is TRUSTED.
- `.agents/plugins/bkit/` (`plugin.json` + `skills/bkit-*/SKILL.md` + `agents/bkit-*.md` + `hooks.json` + `hooks/`) + `GEMINI.md` — additive Google Antigravity host installed as a workspace **plugin**; opt-in `bkit install --antigravity`; `.agents/` root stays the dedicated Codex install; workflows ship as plugin skills, subagents as in-session prompts loaded with `view_file`. See `docs/technology.md` § Execution Hosts.

-`.claude/hooks/bkit-gateguard.cjs`, `.cursor/hooks/bkit-gateguard.cjs`, `.codex/hooks/bkit-gateguard.cjs`, `.agents/plugins/bkit/hooks/bkit-gateguard.cjs` and `.opencode/plugin/bkit-gateguard.js` (the GateGuard advisory hooks — pre-edit on Claude / Cursor / Codex / Antigravity, appended to the tool result on opencode), the same five paths with `bkit-readguard` (the ReadGuard repeat-read advisory hooks, `.bkit/providers.md` § ReadGuard) plus `.claude/hooks/bkit-guardrails.cjs`, `.cursor/hooks/bkit-guardrails.cjs`, `.codex/hooks/bkit-guardrails.cjs` and `.agents/plugins/bkit/hooks/bkit-guardrails.cjs` (shell gates: destructive ops, secret exposure, URL-host checks and shell-as-edit-channel) — like the two `bkit-preflight.sh` hooks, generated at install from a per-host template plus the shared `.bkit/core/hooks/` (`render/parts.ts`) — are markered-text (slash-comment: `// bkit:start` / `// bkit:end`) — bkit owns only the pure advisory engine between the markers; the stdin / stdout driver (Claude) or exported plugin (opencode) around it is consumer-owned from first install onward, so a consumer can add their own advisories without losing them on upgrade. A pre-markers install (no markers, hash matches a prior canonical hash) is replaced wholesale on the next install / upgrade; a genuinely consumer-authored file (no markers, unknown hash) gets the block appended plus printed wiring instructions. +`.claude/hooks/bkit-gateguard.cjs`, `.cursor/hooks/bkit-gateguard.cjs`, `.codex/hooks/bkit-gateguard.cjs`, `.agents/plugins/bkit/hooks/bkit-gateguard.cjs` and `.opencode/plugin/bkit-gateguard.js` (the GateGuard advisory hooks — pre-edit on Claude / Cursor / Codex / Antigravity, appended to the tool result on opencode), the same five paths with `bkit-readguard` (the ReadGuard repeat-read advisory hooks, `.bkit/providers.md` § ReadGuard), `.codex/hooks/bkit-rules.cjs`, `.agents/plugins/bkit/hooks/bkit-rules.cjs` and `.opencode/plugin/bkit-rules.js` (the rules-read advisory hooks — the advisory at the first tool call on Codex, Antigravity and opencode; `.bkit/providers.md` § Rules-read advisory), plus `.claude/hooks/bkit-guardrails.cjs`, `.cursor/hooks/bkit-guardrails.cjs`, `.codex/hooks/bkit-guardrails.cjs` and `.agents/plugins/bkit/hooks/bkit-guardrails.cjs` (shell gates: destructive ops, secret exposure, URL-host checks and shell-as-edit-channel) — like the two `bkit-preflight.sh` hooks, both now also carrying the rules-read advisory in the one session-start document, generated at install from a per-host template plus the shared `.bkit/core/hooks/` (`render/parts.ts`, which also holds the advisory parts `preflight-rules.sh` and `session-rules-advisory.js`) — are markered-text (slash-comment: `// bkit:start` / `// bkit:end`) — bkit owns only the pure advisory engine between the markers; the stdin / stdout driver (Claude) or exported plugin (opencode) around it is consumer-owned from first install onward, so a consumer can add their own advisories without losing them on upgrade. A pre-markers install (no markers, hash matches a prior canonical hash) is replaced wholesale on the next install / upgrade; a genuinely consumer-authored file (no markers, unknown hash) gets the block appended plus printed wiring instructions.

Every non-JSON file bkit writes or refreshes carries the managed-version marker, one text in the file's comment syntax: `<!-- bkit:managed vX.Y.Z … -->` (markdown), `# <!-- bkit:managed vX.Y.Z … -->` (shell, `.gitignore`, `.gitattributes`, `.env.example`, codex TOML), `// bkit:managed vX.Y.Z …` (JS hooks, `.mjs`). The full MIT text and copyright notice travel at `.bkit/LICENSE.md` (`runBkitDocs`). Rendered agents / commands / skills are stamped by `stampManagedVersion`; every other file carries `{{BKIT_MANAGED_MARKER}}` in its source, resolved by `applyTokens`. The stamped version, the `.bkit/version` pin and the staleness check all read `readInstallingVersion()`; a damaged package stops the command instead of stamping a guessed version. The marker sits on the first line inside the `bkit:start` block, or below the first heading of a whole file. `listStampedFiles` (`.bkit/core/engine/install/modules/index.ts`) derives the set from the core templates, the manifest and the rendered mirrors; marker drift on any of them → `bkit check` emits `bkit-managed-stale` (never consumer plans). **Branch-scoped** (`isOnProtectedBranch`): blocker on `main` / `dev` (or PR into them via `GITHUB_BASE_REF`); advisory on feature branches (listed in the checklist, does not block push).

diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index 25347db6e..d2222135a 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -309,3 +309,4 @@
{"schema":2,"ts":1792747332665,"kind":"knowledge","key":"identity-gated-prune-destroys-fold-losers-truncated-friction-keys-collide","repo":"cbartens/bkit","bkit":{"version":"5.5.1"},"by":{"workflow":"utility","step":"manual","subagent":"bkit-utility-update-knowledge","model":"claude-opus-5-5"},"references":["343","234","scripts/harvest/ledgers.ts",".bkit/core/engine/ledgers/telemetry.ts (identity, VALID_KINDS)","docs/observability.md § [bkit-harvest] prefix","8badea26","abe49983","683"],"summary":"A prune gated on identity destroys rows the dedup fold dropped — friction keys truncate to ~68 chars and collide, so two distinct entries share one identity and only one is ever stored","description":"Found while making bkit harvest MOVE consumer friction (#343). fold() is last-write-wins per identity(), so colliding rows collapse to ONE stored row. An identity-gated prune then deletes EVERY colliding row from the consumer while the store kept one — the loser exists nowhere. Reproduced against live consumer-a data: 'Plan Step 11: close-workflow STRAY guard rejects protocol-mandated docs/pending.md edit' (ts 1783944967776) and a different entry about docs/decisions.md + docs/pending.md edits truncate to the byte-identical key 'friction-plan-step-11-close-workflow-stray-guard-rejects-protocol-ma'; the first was destroyed. Harmless under the old copy-only harvest, fatal the moment harvest deletes. Second instance of the same shape: identity() has no default branch, so rows whose kind is outside VALID_KINDS all collide on undefined — live data has kind:'tool-failure' and kind:'agent-rework' rows in consumer-a friction, and the newer evicted the older from the store.","rootCause":"identity() is a lossy projection of a row (kind+repo+key, or ts when key is absent), and fold() treats an identity match as an upsert. Anything gating a DELETE on that projection deletes rows the projection cannot distinguish. Two independent sources of collision: (1) friction keys are truncated at write time, so distinct content yields identical keys; (2) identity() returns undefined for kinds outside VALID_KINDS, mapping every unknown-kind row onto a single fold slot.","remediation":"Gate any destructive drain on byte-for-byte row CONTENT read back off disk, never on identity, and keep a store of every DISTINCT row (content dedup), never of fold winners — `scripts/harvest/ledgers.ts` header invariants (the harvest, `pnpm harvest`). The same gate covers friction rows and the `chat` / `run` rows pruned from `.bkit/stats.jsonl`. A fold loser is then stored and safe to prune; consumer lines not in the store stay and are logged (`kept N line(s) not in the store`). `identity()` (`.bkit/core/engine/ledgers/telemetry.ts`) still has no branch for kinds outside VALID_KINDS — never gate a delete on it. General rule: an identity used for dedup/upsert is NOT safe as a delete gate.","status":"ACTIVE"}
{"schema":3,"ts":1793001618237,"kind":"knowledge","key":"new-raw-gate-log-name-must-join-prettierignore","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"deepseek-v4.1-flash"},"summary":"`prettier --check .` fails on a workflow's raw gate log unless the log's name pattern sits in the raw-gate-output block of both `.prettierignore` and `.bkit/templates/.prettierignore`: the current pnpm/vitest runner output starts with a blank line, and prettier's markdown parser then reflows the whole log.","rootCause":"That block lists one pattern per log name. `bkit tests red` writes `docs/plans/*/logs/*/build-task-red-*.md`, which was never added, so the format gate reads raw runner output as markdown and every build's static gate fails.","remediation":"When a command starts writing a new `docs/plans/*/logs/*/*.md` raw log, add its pattern to the raw-gate-output block of `.prettierignore` and `.bkit/templates/.prettierignore` in the same change, and name it in `.bkit/core/.bkit/workflows.md` § Gate logs plus the `.bkit/workflows.md` mirror.","status":"ACTIVE"}
{"schema":3,"ts":1793022027352,"kind":"knowledge","key":"spawn-heavy-unit-suite-needs-its-own-budget-under-load","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"openrouter/deepseek/deepseek-v4.1-flash"},"references":["700-session-start-nudge","docs/plans/202610/logs/700-session-start-nudge/build-plan-gaps-remediate-1-1-log.md",".bkit/core/engine/audits/repo/resolve-push-base.test.ts","vitest.timeout-budget.ts","local-pnpm-test-full-parallelism-integration-timeouts-flake"],"summary":"A unit-tier test file that spawns real child processes needs its own suite-level budget: the load-scaled budget's factor is `loadAverage / cores` floored at 1, so a box at or above capacity scales nothing","description":"Symptom: 'Error: Test timed out in 5000ms' on a different child-process-spawning unit test each run, all green in isolation, on a box whose load average is at or above its core count. The repo's load-scaled budget (vitest.timeout-budget.ts, re-read per file by vitest.setup.ts) is wired and does apply to these files, but `loadFactor()` returns `loadAverage / cores` clamped to a floor of 1 — at load average 7.5 on 10 cores it returns 1, and at 13 it returns 1.34 — while contention inflates a spawn-heavy case's wall time about 9x (541ms idle to 5055ms under a full gate). So the factor is inert exactly when it is needed.","rootCause":"`loadAverage / cores` reads a machine at full capacity as '1x slower than idle'. A CPU-bound test sharing its core with one other runnable process takes about 2x, and subprocess spawn latency plus memory and IO contention inflate it further, so the measured 1.0-1.34 is a large under-estimate; MAX_LOAD_FACTOR (6) is never reached in practice.","remediation":"For a file whose cases spawn child processes, give the spawn-heavy suite its own load-scaled budget rather than relying on the unit base: `describe(\"…\", { timeout: tierTimeouts(true).testTimeout }, …)` in `.bkit/core/engine/audits/repo/resolve-push-base.test.ts` (30s base, scaled by load, CI pinned to 1). `it(…, { timeout }, …)` is the equivalent per-case form, as `audits/templates/ci-scripts.test.ts` uses. Do NOT hard-code a bare number — a fixed 30s also flaked under the full gate for the shipped-suite case. The underlying factor under-scaling is still open (`.bkit/friction.jsonl` `pre-push-gate-flakes-under-concurrent-load-block-workflow-push`); a whole-config fix would raise `loadFactor` above 1 when load average reaches the core count, which would fix every such file at once.","status":"ACTIVE"}
+{"schema":3,"ts":1793023059383,"kind":"knowledge","key":"kn-hooks-sessionstart-stdout-is-one-json-document","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek/deepseek-v4.1-flash"},"references":[".bkit/core/.claude/hooks/bkit-preflight.sh",".bkit/core/hooks/preflight-rules.sh",".bkit/core/.cursor/hooks/bkit-preflight.sh"],"summary":"A Claude Code hook's stdout is one JSON document — a second top-level print discards both","description":"A SessionStart hook that prints JSON twice — once for the rules-read advisory, once for the Linear guard result — writes `{...}{...}`; the host parses stdout as a single JSON document, fails, and drops the whole output (advisory included) with no error and a zero exit.","rootCause":"Claude Code reads a hook's stdout as ONE JSON document. A second top-level print is not merged into the first; it makes the stream unparseable, so bkit's own output is lost too.","remediation":"Accumulate every context string through one helper (`emit_context`) and write the single document from an EXIT trap; a spliced part must call that helper, never `echo` / `printf` JSON itself.","status":"ACTIVE"}
diff --git a/docs/testing.md b/docs/testing.md
index 912159790..90a1776d0 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -594,7 +594,8 @@ The status-hole detector (`.bkit/core/engine/checks/status-holes.ts`) is **advis
| `.bkit/core/engine/audits/repo/json-parse-owner.test.ts` | Unit | No non-test `.ts` under `.bkit/core/engine/` except `shared/json.ts` has a `JSON.parse` inside a `try` statement (block, `catch` or `finally`); a failed parse goes through `parseJson` / `readJsonFile`. Lists `file:line` per finding. Parses with prettier's bundled TypeScript parser (TypeScript 7 has no JS compiler API). Unguarded `JSON.parse` (deep clones, bkit-owned templates, fail-closed teardown) is allowed. |
| `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | Unit | Every template has an entry; each repo-root copy equals the template after its listed edits (placeholder / adapt / bkit-only), else the test fails. Change a copy → list the edit there. |
| `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | Integration | Cursor destructive-op / secret-exposure hook (`.cursor/hooks/bkit-guardrails.cjs`, spawned): shell deny / ask patterns, curl-wget host allowlist, private-key and `.env` reads, managed-block boundary. |
-| `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` | Integration | Claude and Cursor `bkit-preflight.sh` as generated (spawned under bash): IDE-skip paths, missing key / issue hard-stops in each host's output shape, the shared Linear guard carried verbatim, no call into bkit. |
+| `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` | Integration | Claude and Cursor `bkit-preflight.sh` as generated (spawned under bash): the rules-read advisory on an IDE session and merged with the Linear guard result in the one session-start document on a cloud session, missing key / issue hard-stops in each host's output shape, the shared Linear guard carried verbatim, no call into bkit. |
+| `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` | Integration | The rules-read advisory on the hosts with no session-start event: the opencode plugin driven through both the 1.x `server()` and 2.0 `setup()` shapes, and the rendered Codex and Antigravity `bkit-rules.cjs` hooks spawned as their host runs them — advisory once per session, fail-open, no `AGENTS.md`; the shell and JS parts hold the byte-identical advisory string. |
| `.bkit/core/engine/render/parts.test.ts` | Unit | `renderParts` part-line splicing (JS and shell markers, no nesting, missing part throws); the nine host hook templates splice parts only inside the managed block, every part is used by two or more hosts, and every generated hook passes `node --check` / `bash -n`. |
| `.bkit/core/engine/install/modules/index.integration.test.ts` | Integration | One canonical permission-gate table asserted across Claude `settings.json`, opencode `opencode.json`, Cursor `bkit-guardrails.cjs` and Codex `bkit-guardrails.cjs` — same verdict for every destructive command on all four hosts; secret reads asserted on opencode, Cursor and Antigravity `bkit-guardrails.cjs` (Codex has no read gate, see deferrals). Plus shell-as-edit-channel advisories, curl / wget host matching, every hook finding `.bkit/allowlist.json` from payload dirs whatever its cwd, every reader host's install writing it (and moving a recorded `.cursor/allowlist.json`), and the documented per-host divergences. |
| `.bkit/core/engine/commands/workflow/context.test.ts` | Unit | Untrusted-content fence: identical at every workflow write site, no second fence from shipped fetch blocks, `Context:` names untrusted `Read:` paths. |
