// bkit-guardrails.js — bkit shell deny tier for opencode.
//
// Fires before every terminal command (`shell` in v2, `bash` before v2) and refuses the
// commands the other hosts' guardrails hooks refuse: a git force push, `rm -rf` of a
// filesystem root, `chmod -R 777 /`. The command is read by the same quote-aware parser
// as every other host (bkit's `core/hooks/guardrails-shell.js` and `guardrails-deny.js`),
// so a wrapper (`env -u FOO`, `timeout 30`, `nice -n 5`) does not hide the program, and a
// quoted sentence that only names a dangerous command is not refused.
//
// SCOPE — the deny tier only. The ask, secret and fetch tiers stay with opencode's own
// `permission.bash` map in `.opencode/opencode.json`.
//
// CONTRACT — do not regress:
//   - REFUSE BY THROWING: the before-execute hook is block-or-allow (return = allow,
//     throw = block); the thrown message is the reason the model reads.
//   - FAIL OPEN: every other error is swallowed and the command runs.
//
// OWNERSHIP: everything between the markers below is bkit-managed and is overwritten on
// every `bkit install` / `bkit upgrade`. It is a pure decision engine only — no client
// calls, no throw — so it composes with your own checks in the exported plugin that
// follows the managed block.

// bkit:start

// {{BKIT_MANAGED_MARKER}}

import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

// opencode terminal tool names: `shell` in v2, `bash` before v2.
const SHELL_TOOLS = new Set(["shell", "bash"]);

// {{BKIT_PART gateguard-engine.js}}

// {{BKIT_PART guardrails-shell.js}}

// {{BKIT_PART guardrails-deny.js}}

/**
 * Pure: takes the tool name and its arguments; returns the refusal reason for a command
 * the deny tier refuses, or null.
 */
function bkitGuardrails(toolName, args) {
  if (!SHELL_TOOLS.has(toolName)) return null;
  const cmd = args && typeof args === "object" ? args.command : undefined;
  if (typeof cmd !== "string") return null;
  const c = cmd.trim();
  if (!c) return null;
  const denied = denyRule(shellCommands(c));
  if (!denied) return null;
  return composeAdvice({ tier: "deny", ...denied }, "opencode", ADVICE_BUDGETS.opencode, {
    command: c,
  }).text;
}

// bkit:end

// ---------------------------------------------------------------------------
// Driver — the one export shape OpenCode 1.x and 2.0 both load.
//
//   - OpenCode 2.0 reads the default export's `id` and `setup()` and registers
//     `ctx.tool.hook("execute.before", …)`. The event carries the tool name and arguments
//     as `event.tool` / `event.input`.
//   - OpenCode 1.18.29+ calls the default export's `server()` and uses the returned
//     `"tool.execute.before"` hook, whose arguments are `(input, output)`, tool args on
//     `output.args`.
//
// The file imports NOTHING from `@opencode/plugin`: that package only exists on 2.0, and
// importing it would break the module load on 1.x.
// ---------------------------------------------------------------------------

/** Marks this plugin's own refusal, so fail-open swallows every other error. */
class BkitGuardrailsDeny extends Error {}

function isDenyThrow(err) {
  return err instanceof BkitGuardrailsDeny;
}

/** Throws the refusal for a denied command; returns for every other command. */
function refuseDenied(tool, args) {
  const reason = bkitGuardrails(tool, args);
  if (reason) throw new BkitGuardrailsDeny(reason);
}

/** OpenCode 1.x before hook: `(input, output)`, tool args on `output.args`. */
async function bkitGuardrailsBeforeV1(hookInput, output) {
  try {
    refuseDenied(hookInput?.tool, output?.args);
  } catch (err) {
    if (isDenyThrow(err)) throw err;
  }
}

/** OpenCode 2.0 before hook: one event, tool args on `event.input`. */
async function bkitGuardrailsBeforeV2(event) {
  try {
    refuseDenied(event?.tool, event?.input);
  } catch (err) {
    if (isDenyThrow(err)) throw err;
  }
}

const bkitGuardrailsPlugin = {
  id: "bkit-guardrails",
  async setup(ctx) {
    await ctx.tool.hook("execute.before", bkitGuardrailsBeforeV2);
  },
  async server() {
    return { "tool.execute.before": bkitGuardrailsBeforeV1 };
  },
};

export default bkitGuardrailsPlugin;
