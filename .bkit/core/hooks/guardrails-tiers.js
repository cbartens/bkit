// --- Shell tiers: identical in the Cursor and Codex guardrails hooks (bkit renders them
// from one source). Each host maps a tier to its own output shape and wording.

/**
 * Deny tier — matches Claude's settings.json deny rows and OpenCode's bash deny map.
 * `{ what, fix }` for a blocked command, else null.
 */
function denyRule(c) {
  // Check --force-with-lease BEFORE bare --force (substring otherwise matches).
  const isForceWithLease = /\bgit\s+push\b[\s\S]*--force-with-lease\b/.test(c);
  if (
    !isForceWithLease &&
    (/\bgit\s+push\b[\s\S]*--force\b/.test(c) || /\bgit\s+push\b[\s\S]*\s-f\b/.test(c))
  ) {
    return {
      what: "git force-push",
      fix: "Do not force-push. Use a normal push, or --force-with-lease only when the user explicitly asks for it on a personal branch.",
    };
  }
  if (/\brm\s+-rf\s+(\/(?:\s|$|\*)|~\/\*|\$HOME\/\*)/.test(c)) {
    return {
      what: "recursive delete of a filesystem root",
      fix: "Do not run rm -rf against /, ~, or $HOME. Narrow the path to the target directory.",
    };
  }
  if (/\bchmod\s+-R\s+777\s+\//.test(c)) {
    return {
      what: "chmod -R 777 on the filesystem root",
      fix: "Do not world-writable-chmod the filesystem root.",
    };
  }
  return null;
}

/** Ask tier — destructive or privileged shell. */
const ASK_PATTERNS = [
  /\bsudo\b/,
  /\bbrew\s+install\b/,
  /\b(pnpm|npm|bun)\s+publish\b/,
  /\bgit\s+reset\s+--hard\b/,
  /\bgit\s+clean\s+-fdx?\b/,
  /\bgit\s+filter-branch\b/,
  /\bgit\s+checkout\s+--\s+\./,
  /\bgit\s+restore\s+\./,
  /\bgit\s+stash\s+drop\b/,
  /\bgit\s+rebase\s+-i\b/,
  /\bgh\s+repo\s+delete\b/,
  /\bgh\s+pr\s+close\b/,
  /\bgh\s+release\s+delete\b/,
];

/**
 * The tier a trimmed command falls in, first match wins:
 *   `{ tier: "deny", what, fix }` — blocked on every host;
 *   `{ tier: "ask" }`             — a destructive / privileged command;
 *   `{ tier: "fetch" }`           — curl / wget to a host off the network allowlist;
 *   `{ tier: "edit", edits }`     — the shell used as an edit channel (advisory only);
 *   null                          — nothing to say.
 */
function classifyShell(c) {
  if (!c) return null;
  const denied = denyRule(c);
  if (denied) return { tier: "deny", ...denied };
  if (ASK_PATTERNS.some((re) => re.test(c))) return { tier: "ask" };
  if (usesFetch(c)) return curlWgetHostAllowed(c) ? null : { tier: "fetch" };
  const edits = shellEditTargets(c);
  return edits.length > 0 ? { tier: "edit", edits } : null;
}
