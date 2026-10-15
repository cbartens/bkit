#!/usr/bin/env node
// bkit-gateguard.cjs — bkit GateGuard advisory PreToolUse hook (Google Antigravity).
//
// Twin of `.claude/hooks/bkit-gateguard.cjs`: bkit generates the same advisory engine into
// it at install (bkit's `core/hooks/gateguard-engine.js`). Antigravity's hook contract
// differs from Claude Code's, live-verified on the agy CLI (bkit's
// `core/hooks/antigravity-hook.js`):
//
//   1. ENVELOPE. stdin is `{ conversationId, toolCall: { name, args }, workspacePaths }`.
//      File edits are `write_to_file` / `replace_file_content`, target in `args.TargetFile`.
//   2. OUTPUT. stdout is `{ decision, reason }`, and only a `deny`'s reason reaches the
//      model. So the checklist is delivered by denying the first edit of a file once,
//      with the checklist as the reason; the agent's retry goes through.
//
// bkit's gateguard parity test runs the shared behaviour table against this host.
//
// REGISTRATION: `.agents/plugins/bkit/hooks.json`, matcher `write_to_file|replace_file_content`.
// See .bkit/providers.md § GateGuard.
//
// CONTRACT — do not regress:
//   - ADVISORY, DELIVERED BY ONE BLOCK: the first edit of a file per conversation is denied
//     with the checklist; the retry is allowed. BKIT_GATEGUARD=deny behaves the same here.
//   - FAIL OPEN: one top-level catch emits a bare allow on any error.
//   - SUBAGENTS: Antigravity has no native subagents; an `agy` run is its own conversation.
//   - DEDUP: warns once per (conversation, file), state in the OS temp dir, GC'd after 24h.
//
// MODES (BKIT_GATEGUARD): unset / "deny" → block the first touch per file once | "off" →
// no-op.  BKIT_ALLOW_CONFIG_EDIT=1 suppresses the gate-config advisory.
//
// OWNERSHIP: everything between the markers is bkit-managed and overwritten on every
// `bkit install` / `bkit upgrade`. Add your own logic in the driver below the block.

"use strict";

// bkit:start

// {{BKIT_MANAGED_MARKER}}

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

// Antigravity's file-writing tools. `write_to_file` creates or overwrites a whole file;
// `replace_file_content` edits in place. `Edit` / `Write` are accepted as matchers too.
const EDIT_TOOLS = new Set(["write_to_file", "replace_file_content", "Edit", "Write"]);

// Antigravity names the touched path `TargetFile`; `file_path` / `path` / `target_file`
// cover a consumer's own matcher. Resolved against cwd.
function parseEditTargets(input, cwd) {
  if (!input || typeof input !== "object") return [];
  const rel = input.TargetFile ?? input.file_path ?? input.path ?? input.target_file;
  if (typeof rel !== "string" || rel.length === 0) return [];
  return [{ file: cwd ? path.resolve(cwd, rel) : rel }];
}

// {{BKIT_PART gateguard-engine.js}}

// {{BKIT_PART antigravity-hook.js}}

// Pure: takes the already-parsed hook payload, returns Antigravity's `{ decision, reason }`
// or null for no opinion. Never touches process.stdin / process.stdout — the driver below
// owns both.
function bkitGateguard(payload) {
  if (process.env.BKIT_GATEGUARD === "off") return null;
  const p = fromAntigravityPayload(payload);
  if (!p || !EDIT_TOOLS.has(p.tool_name)) return null;

  const input = p.tool_input || {};
  const cwd = typeof p.cwd === "string" ? p.cwd : "";
  const sessionId = dedupKey(p.session_id, p.agent_id);
  const target = parseEditTargets(input, cwd).find((t) => !alreadyWarned(sessionId, t.file));
  if (!target) return null;
  // A write_to_file to a not-yet-existing path is a NEW file and gets the reuse checklist;
  // replace_file_content is always an in-place edit of an existing file.
  const isNew = p.tool_name === "write_to_file" && !fs.existsSync(target.file);
  const result = firstTouchAdvice(target.file, sessionId, isNew);
  if (!result) return null;
  return adviseOnce("gateguard", sessionId, agCallSignature(p.tool_name, input), result.context);
}

// bkit:end

function emit(decision) {
  process.stdout.write(JSON.stringify(decision));
}

try {
  const raw = fs.readFileSync(0, "utf-8");
  const result = raw.trim() ? bkitGateguard(JSON.parse(raw)) : null;
  emit(result ?? { decision: "allow" });
} catch {
  emit({ decision: "allow" }); // fail open — never block, never error out
}
