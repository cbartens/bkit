#!/usr/bin/env node
// bkit-guardrails.cjs — bkit destructive-op shell gates (Google Antigravity).
//
// Twin of `.cursor/hooks/bkit-guardrails.cjs` and `.codex/hooks/bkit-guardrails.cjs`:
// bkit generates the same shell detection and deny / ask tiers into all three at install
// (bkit's `core/hooks/`). Wired from `.agents/plugins/bkit/hooks.json`, matcher `run_command` —
// Antigravity's canonical tool name for shell execution.
//
// ONE THING DIFFERS FROM THE CODEX TWIN:
//
//   1. ENVELOPE / TOOL NAME. Antigravity reports shell execution as `run_command`, and
//      passes the command as `tool_input.command` (some builds use `CommandLine`). Both
//      are accepted. The stdout envelope is the Claude-family `hookSpecificOutput` shape.
//
// REGISTRATION: `.agents/plugins/bkit/hooks.json`, matcher `run_command`. See .bkit/providers.md § GateGuard.
//
// CONTRACT — do not regress:
//   - FAIL OPEN: one top-level catch swallows every error and exits 0.
//   - DENY IS REAL: the deny tier returns permissionDecision "deny" and blocks.
//   - PURE ENGINE: everything between the markers is a decision engine only — no stdin
//     read, no stdout write. Add your own gates in the driver below the block.
//
// OWNERSHIP: everything between the markers is bkit-managed and overwritten on every
// `bkit install` / `bkit upgrade`.

"use strict";

// bkit:start

// bkit:managed v5.1.0 — PolyForm Noncommercial 1.0.0 / Small Business 1.0.0 (https://polyformproject.org/licenses/) — do not edit; run `bkit upgrade` to refresh

const fs = require("node:fs");
const path = require("node:path");

// --- Shell detection: identical in every host's guardrails hook (bkit renders it from
// one source). Needs `fs` and `path` in scope; the host's own code above declares them.

/** Wrappers that precede the real command; skipped when finding a segment's head. */
const CMD_WRAPPERS = new Set(["sudo", "env", "time", "nohup", "nice", "command", "exec", "xargs"]);

/** Split a command line into pipeline / list segments. */
function shellSegments(cmd) {
  return String(cmd)
    .split(/\|\||&&|[|;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * The program a segment actually runs: leading `VAR=val` assignments and wrappers
 * skipped, path stripped (`/usr/bin/curl` -> `curl`).
 *
 * A token that only appears as an argument (`grep -n 'curl' file`,
 * `sed -n '/sed -i/p' notes.md`) is not the segment's program.
 */
function segmentHead(seg) {
  const words = seg.split(/\s+/).filter(Boolean);
  let i = 0;
  while (
    i < words.length &&
    (/^[A-Za-z_][A-Za-z0-9_]*=/.test(words[i]) || CMD_WRAPPERS.has(words[i]))
  )
    i++;
  return (words[i] || "").replace(/^.*\//, "");
}

/** True when some segment actually INVOKES curl or wget. */
function usesFetch(cmd) {
  return shellSegments(cmd).some((s) => {
    const h = segmentHead(s);
    return h === "curl" || h === "wget";
  });
}

/** Source-ish extensions: a redirect into one of these is plausibly a file edit. */
const SOURCE_EXT_RE =
  /\.(ts|tsx|js|jsx|cjs|mjs|json|md|sh|bash|py|rb|go|rs|java|css|scss|html|ya?ml|toml|sql)$/i;

/**
 * Detect a shell command being used as an edit channel. Returns a list of human
 * descriptions, empty when the command edits nothing.
 *
 * Quiet on `> /dev/null`, `>> "$GITHUB_ENV"`, `mktemp` handoff files and log capture.
 * Only a redirect whose target both looks like a repo path AND carries a source
 * extension is reported.
 */
function shellEditTargets(cmd) {
  const hits = [];
  for (const seg of shellSegments(cmd)) {
    const head = segmentHead(seg);
    if ((head === "sed" || head === "perl") && /\s-i(?:\.\S*)?(?:\s|$)/.test(seg)) {
      hits.push("in-place sed/perl (-i)");
    }
    if (head === "awk" && /\s-i\s+inplace\b/.test(seg)) hits.push("awk -i inplace");
  }

  const redir = /(?:^|[^>&\d])>>?\s*("([^"]+)"|'([^']+)'|([^\s;|&<>]+))/g;
  let m;
  while ((m = redir.exec(cmd)) !== null) {
    const target = (m[2] || m[3] || m[4] || "").trim();
    if (!target) continue;
    // Scratch and env sinks — never a source edit.
    if (target.startsWith("$") || target.startsWith("&")) continue;
    if (/^\/(dev|tmp|var\/folders|var\/tmp)\//.test(target)) continue;
    if (/\.(log|bak|tmp|out|err|orig)$/i.test(target)) continue;
    if (!SOURCE_EXT_RE.test(target)) continue;
    hits.push(`redirect into ${target}`);
  }
  return [...new Set(hits)];
}

/** Shared advisory string, identical on every host. */
function shellEditAdvisory(hits) {
  return (
    `bkit guardrails: this command edits files through the shell (${hits.join("; ")}). ` +
    "Pre-edit gates only see edit/write tools, so a shell rewrite bypasses every one of " +
    "them. Use the edit/write tool instead unless this is one of the sanctioned exceptions " +
    "in .agents/rules.md (generating files from a script, or a bulk mechanical rewrite). " +
    "Not blocked — proceed if it is."
  );
}

/**
 * Hosts come from `.cursor/allowlist.json`, the one install-written artifact carrying
 * the resolved network allowlist (the shipped egress registry union the consumer's
 * `allowed-domains`); every host's hook reads it. There is NO hardcoded fallback list:
 * absent (cursor module not installed) or unreadable, this returns empty and every
 * host is treated as unknown.
 */
function loadNetworkAllowlistBases() {
  const bases = new Set();
  try {
    const p = path.join(process.cwd(), ".cursor", "allowlist.json");
    if (fs.existsSync(p)) {
      const doc = JSON.parse(fs.readFileSync(p, "utf8"));
      const domains = Array.isArray(doc.domains) ? doc.domains : [];
      for (const d of domains) {
        const b = String(d).replace(/^\*\./, "").trim();
        if (b) bases.add(b);
      }
    }
  } catch {
    /* corrupt allowlist → empty set: every host reads as unknown; never crashes */
  }
  return bases;
}

/**
 * Pull the HOST out of every `http(s)://…` URL in a command.
 *
 * Strict: only an explicit scheme counts; a scheme-less token (`./deploy.sh`,
 * `pkg.json`) is never read as a URL.
 */
function extractUrlHosts(cmd) {
  const hosts = [];
  const re = /\bhttps?:\/\/([^\s"'`\\|;&<>()]+)/gi;
  let m;
  while ((m = re.exec(cmd)) !== null) {
    // Authority ends at the first /, ? or #.
    let authority = m[1].split(/[/?#]/)[0];
    // Strip userinfo — `https://github.com@evil.tld/` is a request to evil.tld.
    const at = authority.lastIndexOf("@");
    if (at >= 0) authority = authority.slice(at + 1);
    // Strip port.
    authority = authority.split(":")[0];
    if (authority) hosts.push(authority.toLowerCase());
  }
  return hosts;
}

/** Suffix match on host labels — `github.com` covers `api.github.com`, not `github.com.evil.tld`. */
function hostMatchesBase(host, base) {
  const b = String(base).toLowerCase();
  return host === b || host.endsWith("." + b);
}

/**
 * True when EVERY URL in the command targets an allowlisted host.
 *
 * Only each URL's host is consulted, never the rest of the command string (query
 * params, headers). No parseable URL, or any host off the list → false.
 */
function curlWgetHostAllowed(cmd) {
  const hosts = extractUrlHosts(cmd);
  if (hosts.length === 0) return false;
  const bases = loadNetworkAllowlistBases();
  return hosts.every((h) => [...bases].some((b) => hostMatchesBase(h, b)));
}

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

/** Verdicts mirror the Cursor hook's tiers so the shared gate table reads identically. */
function ask(reason) {
  return { verdict: "ask", reason };
}

function deny(reason) {
  return { verdict: "deny", reason };
}

/**
 * Entry point — pure. Takes the parsed hook payload, returns
 * `{ verdict: "allow"|"ask"|"deny", reason? }`, or `null` when bkit has no opinion
 * (the caller decides what a no-opinion result means).
 *
 * Antigravity reports shell execution as `run_command`; the aliases match a
 * consumer-registered matcher or an isolated `run_command` session.
 */
const SHELL_TOOL_NAMES = new Set(["run_command", "RunCommand", "Bash", "bash", "shell"]);

function bkitGuardrails(payload) {
  if (!payload || typeof payload !== "object") return null;
  const tool = payload.tool_name;
  if (!SHELL_TOOL_NAMES.has(tool)) return null;
  const input = payload.tool_input || {};
  // Antigravity passes the command as a string (`command`), or `CommandLine` in some builds.
  const raw = Array.isArray(input.command)
    ? input.command.join(" ")
    : (input.command ?? input.CommandLine);
  if (typeof raw !== "string") return null;

  const cmd = raw.trim();
  const tier = classifyShell(cmd);
  if (!tier) return null;
  if (tier.tier === "deny") {
    return deny(`Blocked by bkit Antigravity guardrails: ${tier.what}. ${tier.fix}`);
  }
  if (tier.tier === "ask") {
    return ask(
      `bkit Antigravity guardrails: this is a destructive or privileged command. It is on the PROHIBITED list in every bkit workflow. Do not run it unless the user asked for this exact command. Note that git clean and git checkout -- . destroy untracked files and uncommitted work, which no reflog can recover. Command: ${cmd}`,
    );
  }
  if (tier.tier === "fetch") {
    return ask(
      `bkit Antigravity guardrails: outbound fetch to a host that is not on the network allowlist. Confirm the destination is intended before relying on the result. Command: ${cmd}`,
    );
  }
  // Shell-as-edit-channel: advisory on every host, never a block.
  return ask(shellEditAdvisory(tier.edits));
}

// bkit:end

// --- Driver (yours to extend) ----------------------------------------------
//
// Fold in your own checks here: call bkitGuardrails(payload), combine with your own
// verdict, and call emit() exactly once. Keep the single-emit rule — two writers on
// one stdout produce an unparseable blob and Antigravity ignores the whole thing.

function emit(payload) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: payload }));
}

try {
  const raw = fs.readFileSync(0, "utf-8");
  if (raw.trim()) {
    const result = bkitGuardrails(JSON.parse(raw));
    if (result) {
      emit(
        result.verdict === "deny"
          ? {
              hookEventName: "PreToolUse",
              permissionDecision: "deny",
              permissionDecisionReason: result.reason,
            }
          : { hookEventName: "PreToolUse", additionalContext: result.reason },
      );
    }
  }
} catch {
  process.exitCode = 0; // fail open — never block, never error out
}
