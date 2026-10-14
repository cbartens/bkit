// bkit-readguard.js — bkit ReadGuard plugin for opencode.
//
// When an agent re-reads a line range of a file it already read in this session, and
// the file has not changed since (same mtime and size), it appends a note to the tool
// result so the next read uses the earlier output instead. Covers the `read` tool and
// plain shell reads (`cat FILE`, `sed -n 'A,Bp' FILE`, `head` / `tail` with a line
// count) through the terminal tool (`shell` in v2, `bash` before v2).
//
// CONTRACT — do not regress:
//   - ADVISORY ONLY: appends the note to the tool RESULT in the after-execute hook.
//     The before-execute hook can only allow or block, so ReadGuard does not use it;
//     the note arrives with the repeated read, not before it.
//   - FAIL OPEN: every hook swallows its own errors.
//   - PER SESSION: keyed by sessionID. A subagent runs in its own session, so it never
//     inherits its parent's reads.
//   - COMPACTION: 1.x forgets a session's reads on `session.compacted`. 2.0 exposes no
//     event subscription to this plugin, so its log is not cleared on a summary; the
//     note tells the agent to re-read when the earlier output is no longer in context.
//   - STATE: OS temp dir, GC'd after 24h. Never writes into the consumer repo.
//
// MODES (BKIT_READGUARD env var): unset → advisory [DEFAULT] | "off" → no-op.
//
// The engine inside the managed block is generated at install from bkit's
// `core/hooks/readguard-engine.js`, the same source as the Claude, Cursor, Codex and
// Antigravity hooks. See .bkit/providers.md § ReadGuard.
//
// OWNERSHIP: everything between the markers below is bkit-managed and is
// overwritten on every `bkit install` / `bkit upgrade`. It is a pure advisory
// engine only — no client calls, no stderr write, no throw — so it composes
// with your own checks in the exported plugin that follows the managed block.

// bkit:start

// {{BKIT_MANAGED_MARKER}}

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

// opencode tool names, lowercase in opencode's plugin API.
const READ_TOOLS = new Set(["read"]);
const SHELL_TOOLS = new Set(["shell", "bash"]);

// {{BKIT_PART readguard-engine.js}}

// Pure: takes the tool name, its arguments and the session id; returns the note to
// append or null. `read` takes `path` (2.0) or `filePath` (1.x); 1-based `offset` plus
// `limit`, the whole file when neither is given. The terminal tool takes `command` and
// an optional `workdir`.
function bkitReadguard(tool, args, sessionID) {
  const input = args && typeof args === "object" ? args : {};
  const cwd = typeof input.workdir === "string" ? input.workdir : process.cwd();
  let targets = [];
  if (READ_TOOLS.has(tool)) {
    const paged = input.offset !== undefined || input.limit !== undefined;
    targets = toolReadTarget(
      input.path ?? input.filePath,
      cwd,
      input.offset,
      input.limit,
      paged ? undefined : OPEN_END,
    );
  } else if (SHELL_TOOLS.has(tool)) {
    targets = shellReadTargets(typeof input.command === "string" ? input.command : "", cwd);
  }
  return repeatReadAdvice(targets, sessionID, undefined, cwd);
}

// bkit:end

// ---------------------------------------------------------------------------
// Driver — the one export shape OpenCode 1.x and 2.0 both load (same as
// `bkit-gateguard.js`): 2.0 calls `setup(ctx)` and registers `execute.after`; 1.18.29+
// calls `server()` and uses `"tool.execute.after"` plus the `event` hook.
// ---------------------------------------------------------------------------

/** OpenCode 1.x after hook: append the note to `output.output`, the result text. */
async function bkitReadGuardAfterV1(hookInput, output) {
  try {
    const { tool, sessionID, args } = hookInput ?? {};
    if (!output || typeof output !== "object") return;
    const context = bkitReadguard(tool, args ?? output.args, sessionID);
    if (!context) return;
    const existing = typeof output.output === "string" ? output.output : "";
    output.output = existing.length > 0 ? `${existing}\n\n${context}` : context;
  } catch {
    // fail-open: never let an advisory error reach the host
  }
}

/** OpenCode 1.x event hook: forget a session's reads once it is compacted. */
async function bkitReadGuardEventV1({ event } = {}) {
  try {
    if (event?.type === "session.compacted") resetReadLog(event.properties?.sessionID);
  } catch {
    // fail-open: never let an advisory error reach the host
  }
}

/** OpenCode 2.0 after hook: append the note to `event.result.content`. */
async function bkitReadGuardAfterV2(event) {
  try {
    if (event?.status !== "completed" || !event.result) return;
    const context = bkitReadguard(event.tool, event.input, event.sessionID);
    if (!context) return;
    const content = Array.isArray(event.result.content) ? event.result.content : [];
    event.result.content = [...content, { type: "text", text: context }];
  } catch {
    // fail-open: never let an advisory error reach the host
  }
}

const bkitReadGuardPlugin = {
  id: "bkit-readguard",
  async setup(ctx) {
    await ctx.tool.hook("execute.after", bkitReadGuardAfterV2);
  },
  async server() {
    return {
      "tool.execute.after": bkitReadGuardAfterV1,
      event: bkitReadGuardEventV1,
    };
  },
};

export default bkitReadGuardPlugin;
