// bkit-rules.js — bkit rules-read advisory plugin for opencode.
//
// Fires on opencode's tool hooks. On the FIRST tool call of a session it appends the
// rules-read advisory to the tool result, so the model is told to read `.agents/rules.md`
// before any other action; every later call appends nothing.
//
// CONTRACT — do not regress:
//   - ADVISORY ONLY: appends the advisory to the tool RESULT in the after-execute hook —
//     never blocks. stderr is NOT a model channel on 2.0's detached server.
//   - FAIL OPEN: a top-level try/catch swallows every error; the plugin never throws.
//   - ONCE PER SESSION: dedup is by sessionID, state in the OS temp dir, GC'd after 24h.
//     A subagent runs in its own session, so it gets its own advisory; a payload carrying
//     no session id falls back to one shared bucket. The token is spent only once the call
//     is known to carry the advisory, so a call whose result never arrived leaves it for
//     the next call instead of losing the nudge for the whole session.
//   - NO SESSION-START EVENT: opencode has none, so the advisory rides the first tool
//     call's result instead.
//
// The advisory text and its once-per-session helper are generated at install from bkit's
// `core/hooks/session-rules-advisory.js`, the same source as the Codex and Antigravity
// hooks.
//
// OWNERSHIP: everything between the markers below is bkit-managed and is overwritten on
// every `bkit install` / `bkit upgrade`. It is a pure advisory only — no client calls, no
// stderr write, no throw — so it composes with your own checks in the exported plugin
// that follows the managed block.

// bkit:start

// {{BKIT_MANAGED_MARKER}}

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

// {{BKIT_PART session-rules-advisory.js}}

// bkit:end

// ---------------------------------------------------------------------------
// Driver — the one export shape OpenCode 1.x and 2.0 both load (same as
// `bkit-gateguard.js`): 2.0 calls `setup(ctx)` and registers `execute.after`; 1.18.29+
// calls `server()` and uses `"tool.execute.after"`. Both call the shared
// rulesReadAdviceOnce() above, so once-per-session behaviour is identical across the two.
// The file deliberately imports NOTHING from `@opencode/plugin`: that package only exists
// on 2.0, and importing it would break the module load on 1.x.
// ---------------------------------------------------------------------------

/** OpenCode 1.x after hook: append the advisory to `output.output`, the result text. */
async function bkitRulesAfterV1(hookInput, output) {
  try {
    // Check the delivery shape BEFORE spending the session's one advisory: a call that
    // cannot carry it must leave the token for the next call.
    if (!output || typeof output !== "object") return;
    const advisory = rulesReadAdviceOnce(hookInput?.sessionID);
    if (!advisory) return;
    const existing = typeof output.output === "string" ? output.output : "";
    output.output = existing.length > 0 ? `${existing}\n\n${advisory}` : advisory;
  } catch {
    // fail-open: never let an advisory error reach the host
  }
}

/** OpenCode 2.0 after hook: append the advisory to `event.result.content`. */
async function bkitRulesAfterV2(event) {
  try {
    // Check the delivery shape BEFORE spending the session's one advisory: a call that
    // cannot carry it must leave the token for the next call.
    if (!event || event.status !== "completed" || !event.result) return;
    const advisory = rulesReadAdviceOnce(event?.sessionID);
    if (!advisory) return;
    const content = Array.isArray(event.result.content) ? event.result.content : [];
    event.result.content = [...content, { type: "text", text: advisory }];
  } catch {
    // fail-open: never let an advisory error reach the host
  }
}

const bkitRulesPlugin = {
  id: "bkit-rules",
  async setup(ctx) {
    await ctx.tool.hook("execute.after", bkitRulesAfterV2);
  },
  async server() {
    return { "tool.execute.after": bkitRulesAfterV1 };
  },
};

export default bkitRulesPlugin;
