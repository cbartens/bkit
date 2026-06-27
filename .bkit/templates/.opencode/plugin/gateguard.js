// gateguard.js — bkit GateGuard plugin for opencode.
//
// Fires via `tool.execute.before` hook. On the FIRST touch of a given file in a
// session it injects an investigation checklist into the model's context so the
// investigation happens BEFORE the edit. A second class of paths — quality-gate
// configs — gets a stronger "fix the code, don't weaken the gate" advisory.
//
// CONTRACT — do not regress:
//   - ADVISORY BY DEFAULT: throws with advisory text to inject model-visible context.
//     In opencode's plugin model, returning from the hook = allow; throwing = block
//     with the thrown message surfaced to the model. Advisory mode uses a non-blocking
//     mechanism: we throw only in deny mode; in advisory mode we log to stderr (model
//     context injection in opencode v1.16.x is via the throw path only — advisory mode
//     therefore uses stderr which opencode surfaces in tool context).
//
//     UPDATE: opencode's tool.execute.before hook is block-or-allow only (no separate
//     "inject context" primitive). Advisory mode works by throwing the advisory text
//     so the model sees it — but since that would block the edit, advisory mode instead
//     writes the advisory to the tool's output context via stderr (opencode surfaces
//     stderr to the model for inspection). Deny mode throws to hard-block.
//
//     IMPLEMENTATION NOTE: opencode's plugin API (v1.16.x) fires tool.execute.before
//     for ALL tools. The hook can: (a) return to allow, or (b) throw to block. There is
//     no separate "inject context without blocking" primitive. Advisory mode therefore
//     uses process.stderr (opencode surfaces stderr in the tool result seen by the model)
//     to deliver the investigation checklist without blocking the edit. Deny mode throws.
//
//   - FAIL OPEN: top-level try/catch swallows every error. A plugin that throws
//     unexpectedly would crash the tool call — the fail-open boundary prevents that.
//   - SUBAGENT EXEMPT: skipped when client.session.get() returns a non-empty parentID.
//     bkit's workflow subagents are already scope-bounded by their own prompts.
//   - DEDUP: warns once per (session, file); state lives in OS temp dir keyed by
//     sessionID and is GC'd after 24h. Never writes into the consumer repo.
//
// MODES (BKIT_GATEGUARD env var):
//   - unset / anything else → advisory  (emit context to stderr, never block)  [DEFAULT]
//   - "off"                 → disabled  (no-op)
//   - "deny"                → deny the FIRST touch per file by throwing with the checklist
//                             as the reason; allow the retry (dedup). Opt-in.
//
//   BKIT_ALLOW_CONFIG_EDIT=1 → suppress the gate-config advisory (sanctioned edit).
//
// opencode tool names (v1.16.x, from spike-verdict.md §(d)):
//   The spike captured `"tool": "bash"` for a subagent bash call. opencode does not
//   ship separate Edit/Write/MultiEdit tools — its primary edit surface is `write`
//   (file writes) and `edit` (targeted edits). We guard: write, edit, patch.
//   Bash is excluded (same as Claude's hook excludes Bash from non-edit tools).
//
// See: docs/plans/202606/logs/245-opencode-provider-host/spike-verdict.md §(d)
// Functional mirror of: .bkit/templates/.claude/hooks/gateguard.cjs

// bkit:start
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

// opencode edit-like tool names (v1.16.x confirmed from spike).
// `bash` is NOT in this list — same logic as the Claude hook excluding Bash.
// Tool names are lowercase in opencode's plugin API (confirmed from spike payload).
const EDIT_TOOLS = new Set(["write", "edit", "patch"]);

// Basename patterns for quality-gate configs (lint / format / types / test / slop).
// Editing these to silence a gate is the recurring "weaken the gate instead of
// fixing the code" anti-pattern — prefer a targeted per-file opt-out + sign-off.
const GATE_CONFIG_PATTERNS = [
  /^tsconfig(\..+)?\.json$/,
  /^vitest\.config\.[mc]?[jt]s$/,
  /^vite\.config\.[mc]?[jt]s$/,
  /^eslint\.config\.[mc]?[jt]s$/,
  /^\.eslintrc(\.(json|js|cjs|ya?ml))?$/,
  /^\.prettierrc(\.(json|js|cjs|mjs|ya?ml|toml))?$/,
  /^prettier\.config\.[mc]?js$/,
  /^\.prettierignore$/,
  /^biome\.jsonc?$/,
  /^\.vale\.ini$/,
  /^slop-scan\.config\.json$/,
  /^\.lintstagedrc(\.(json|js|cjs|mjs|ya?ml))?$/,
  /^lint-staged\.config\.[mc]?js$/,
];

function isGateConfig(filePath) {
  const base = path.basename(filePath);
  return GATE_CONFIG_PATTERNS.some((re) => re.test(base));
}

function investigationChecklist(filePath) {
  const base = path.basename(filePath);
  return (
    `[bkit GateGuard] First edit to \`${base}\` this session - confirm following, and investigate anything you cannot answer BEFORE editing:\n` +
    `- Confirm you read this file and exact symbols/lines you are about to change.\n` +
    `- Confirm precise field names, types, and signatures being changed.\n` +
    `- Confirm callers/importers changes affect (grep/read source, do NOT assume).\n` +
    `- Confirm symbols/flags/configs changes require exist (grep/read source, do NOT assume).\n` +
    `- Confirm external data contracts (DB schemas, APIs/SDKs) changes affect (verify actual shape, do NOT assume).\n` +
    `- Confirm user instructions or plan tasks changes serve (quote them, do NOT trust memory).\n` +
    `Self-review is weak; the investigation itself is what changes the output. Advisory — proceed once satisfied.`
  );
}

function configAdvisory(filePath) {
  const base = path.basename(filePath);
  return (
    `[bkit GateGuard] \`${base}\` quality-gate config (lint / format / types / test / slop):\n` +
    `- Prefer FIXING code over weakening any gates.\n` +
    `- If changes genuinely warranted, use targeted per-file/per-rule opt-outs over blanket disable.\n` +
    `- ALWAYS get explicit human sign-off for any quality-gate config changes.\n` +
    `Set BKIT_ALLOW_CONFIG_EDIT=1 to silence this. Advisory — proceed once satisfied.`
  );
}

function stateDir() {
  return path.join(os.tmpdir(), "bkit-gateguard");
}

function stateFile(sessionId) {
  const safe = sessionId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128) || "no-session";
  return path.join(stateDir(), safe + ".json");
}

function readState(sessionId) {
  const file = stateFile(sessionId);
  if (!fs.existsSync(file)) return { files: {} };
  const parsed = JSON.parse(fs.readFileSync(file, "utf-8"));
  if (parsed && typeof parsed === "object" && parsed.files && typeof parsed.files === "object") {
    return parsed;
  }
  return { files: {} };
}

function alreadyWarned(sessionId, filePath) {
  return Boolean(readState(sessionId).files[filePath]);
}

function markWarned(sessionId, filePath) {
  fs.mkdirSync(stateDir(), { recursive: true });
  const state = readState(sessionId);
  state.files[filePath] = true;
  fs.writeFileSync(stateFile(sessionId), JSON.stringify(state), "utf-8");
}

// Opportunistic TTL: drop session state files older than 24h so the temp dir does
// not grow without bound. Runs last (after the advisory is emitted) so a cleanup
// race cannot suppress the advisory.
function gcOldState() {
  const dir = stateDir();
  if (!fs.existsSync(dir)) return;
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const name of fs.readdirSync(dir)) {
    const f = path.join(dir, name);
    try {
      const stat = fs.statSync(f);
      if (stat.mtimeMs < cutoff) fs.unlinkSync(f);
    } catch {
      // GC is opportunistic — ignore individual file errors
    }
  }
}

/** @param {import('@opencode-ai/plugin').PluginInput} input */
export default function plugin(input) {
  return {
    "tool.execute.before": async (hookInput, output) => {
      try {
        const mode = process.env.BKIT_GATEGUARD;
        if (mode === "off") return;

        const { tool, sessionID } = hookInput;
        if (!EDIT_TOOLS.has(tool)) return;

        // Subagent-exempt: use client.session.get() to check parentID.
        // Subagent sessions have a non-empty parentID; orchestrator sessions do not.
        // This is the opencode equivalent of Claude's agent_id exemption.
        // (Spike-confirmed: no direct agent_id in hook payload; use session lookup.)
        let parentID = "";
        try {
          const session = await input.client.session.get({ sessionID });
          parentID = session?.parentID ?? "";
        } catch {
          // If session lookup fails, fail-open: treat as orchestrator (apply advisory)
          parentID = "";
        }
        if (parentID !== "" && parentID != null) return;

        // Extract file path from tool args (opencode's write/edit/patch tools).
        // The args object structure: write → { path, content }, edit → { path, ... },
        // patch → { path, ... }. All use `path` as the file-path key.
        const args = output?.args ?? {};
        const filePath = args.path ?? args.file_path;
        if (!filePath || typeof filePath !== "string") return;

        const sessionId = typeof sessionID === "string" ? sessionID : "no-session";

        // Warn once per (session, file). Emit first, then record + GC.
        if (alreadyWarned(sessionId, filePath)) return;

        const gated = isGateConfig(filePath) && process.env.BKIT_ALLOW_CONFIG_EDIT !== "1";
        const context = gated ? configAdvisory(filePath) : investigationChecklist(filePath);

        if (mode === "deny") {
          // Deny mode: throw to hard-block the tool call. The thrown message is
          // model-visible in opencode's tool result surface.
          markWarned(sessionId, filePath);
          gcOldState();
          throw new Error(context);
        } else {
          // Advisory mode: emit to stderr (opencode surfaces stderr in tool context).
          // This delivers the checklist to the model without blocking the edit.
          process.stderr.write(`\n${context}\n\n`);
          markWarned(sessionId, filePath);
          gcOldState();
        }
      } catch (err) {
        // Re-throw only for deny mode (intentional block). All other errors: fail-open.
        const mode = process.env.BKIT_GATEGUARD;
        if (mode === "deny" && err instanceof Error && err.message.includes("[bkit GateGuard]")) {
          throw err;
        }
        // Fail-open: swallow unexpected errors so the hook never crashes a session.
      }
    },
  };
}
// bkit:end
