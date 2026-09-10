#!/usr/bin/env node
// guardrails.cjs — bkit destructive-op shell gates (Codex CLI).
//
// Twin of `.cursor/hooks/guardrails.cjs`, carrying the same decision engine so the
// four hosts cannot drift. Wired from `.codex/hooks.json`, matcher `Bash` — Codex's
// canonical tool name for shell execution.
//
// TWO THINGS DIFFER FROM THE CURSOR TWIN, both forced by Codex:
//
//   1. NO `ask`. Codex parses `permissionDecision: "ask"` but does not implement it —
//      an attempt is recorded as an error and the tool call proceeds anyway. So the
//      ask tier CANNOT be a prompt here. It is emitted as `additionalContext`: a loud
//      advisory the model reads, command still runs. The deny tier is a real block.
//      This is a deliberate, documented divergence, not an oversight — see
//      `.bkit/src/bkit-permissions-parity.integration.test.ts` and providers.md.
//   2. ENVELOPE. Codex is the Claude-family hook contract (stdin `tool_name` /
//      `tool_input`, stdout `hookSpecificOutput`), not Cursor's `beforeShellExecution`
//      + `{ permission }` shape.
//
// Consequence worth stating plainly: on Codex the ask tier informs rather than stops.
// Every command in it is already on the PROHIBITED list in all five bkit workflow
// headers, so no bkit workflow reaches one; this covers a human driving Codex by hand.
//
// REGISTRATION: `.codex/hooks.json`, matcher `Bash`. Codex loads project-local hooks
// only once the project `.codex/` layer is TRUSTED — until then this does not run.
// See .bkit/providers.md § GateGuard.
//
// CONTRACT — do not regress:
//   - FAIL OPEN: one top-level catch swallows every error and exits 0.
//   - DENY IS REAL: the deny tier returns permissionDecision "deny" and blocks.
//   - PURE ENGINE: everything between the markers is a decision engine only — no stdin
//     read, no stdout write — so bkit's emitter and yours cannot collide into one
//     unparseable stdout blob. Add your own gates in the driver below the block.
//
// OWNERSHIP: everything between the markers is bkit-managed and overwritten on every
// `bkit install` / `bkit upgrade`.

"use strict";

// bkit:start

const fs = require("node:fs");
const path = require("node:path");

/** Verdicts mirror the Cursor twin so the shared gate table reads identically. */
function allow() {
  return { verdict: "allow" };
}

function ask(reason) {
  return { verdict: "ask", reason };
}

function deny(reason) {
  return { verdict: "deny", reason };
}

/** @param {string} cmd */
function decideShell(cmd) {
  const c = String(cmd || "").trim();
  if (!c) return allow();

  // Deny — matches Claude deny, Cursor deny, OpenCode bash deny.
  // Check --force-with-lease BEFORE bare --force (substring otherwise matches).
  const isForceWithLease = /\bgit\s+push\b[\s\S]*--force-with-lease\b/.test(c);
  if (
    !isForceWithLease &&
    (/\bgit\s+push\b[\s\S]*--force\b/.test(c) || /\bgit\s+push\b[\s\S]*\s-f\b/.test(c))
  ) {
    return deny(
      "Blocked by bkit Codex guardrails: git force-push. Use a normal push, or --force-with-lease only when the user explicitly asks for it on a personal branch.",
    );
  }
  if (/\brm\s+-rf\s+(\/(?:\s|$|\*)|~\/\*|\$HOME\/\*)/.test(c)) {
    return deny(
      "Blocked by bkit Codex guardrails: recursive delete of a filesystem root. Narrow the path to the target directory.",
    );
  }
  if (/\bchmod\s+-R\s+777\s+\//.test(c)) {
    return deny("Blocked by bkit Codex guardrails: chmod -R 777 on the filesystem root.");
  }

  // Ask tier — advisory on this host (Codex cannot prompt). Same patterns as the
  // Cursor twin so a gate added there is added here.
  const askPatterns = [
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
  for (const re of askPatterns) {
    if (re.test(c)) {
      return ask(
        `bkit Codex guardrails: this is a destructive or privileged command and Codex cannot prompt for confirmation. It is on the PROHIBITED list in every bkit workflow. Do not run it unless the user asked for this exact command. Note that git clean and git checkout -- . destroy untracked files and uncommitted work, which no reflog can recover. Command: ${c}`,
      );
    }
  }

  // curl / wget: allowed when every URL host is on the network allowlist, advisory
  // otherwise. Claude leaves shell fetches ungated entirely (its rules match a command
  // prefix, not a URL host, so per-domain allows are inexpressible); this host can parse
  // the host, so it does.
  if (usesFetch(c)) {
    if (curlWgetHostAllowed(c)) return allow();
    return ask(
      `bkit Codex guardrails: outbound fetch to a host that is not on the network allowlist. Confirm the destination is intended before relying on the result. Command: ${c}`,
    );
  }

  // Shell-as-edit-channel: advisory on every host. See the Cursor twin for why this
  // is never a block — the rule has sanctioned exceptions and bkit's own plan
  // workflow relies on one.
  const edits = shellEditTargets(c);
  if (edits.length > 0) return ask(shellEditAdvisory(edits));

  return allow();
}

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
 * Matching a bare word anywhere in the command instead is why this exists: `grep -n
 * 'curl' file` and `sed -n '/sed -i/p' notes.md` both contain the token without running
 * anything, and a gate that fires on those is noise a consumer switches off.
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
 * Deliberately quiet on the shapes that dominate legitimate use — `> /dev/null`,
 * `>> "$GITHUB_ENV"`, `mktemp` handoff files, log capture — because a gate that
 * fires constantly is one that gets disabled. Only a redirect whose target both
 * looks like a repo path AND carries a source extension is reported.
 *
 * Byte-identical to the Cursor twin; behavioural parity is asserted in
 * bkit-permissions-parity.integration.test.ts.
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

/** One shared advisory string so the hosts cannot word this differently. */
function shellEditAdvisory(hits) {
  return (
    `bkit guardrails: this command edits files through the shell (${hits.join("; ")}). ` +
    "Pre-edit gates only see edit/write tools, so a shell rewrite bypasses every one of " +
    "them. Use the edit/write tool instead unless this is one of the sanctioned exceptions " +
    "in .agents/rules.md (generating files from a script, or a bulk mechanical rewrite). " +
    "Not blocked — proceed if it is."
  );
}

/** Tooling-only fallback — keep in sync with BKIT_SHIPPED_NETWORK_DOMAINS (no stack hosts). */
const SHIPPED_NETWORK_BASES = [
  "github.com",
  "githubusercontent.com",
  "anthropic.com",
  "claude.com",
  "cursor.com",
  "linear.app",
  "opencode.ai",
  "ollama.com",
  "openrouter.ai",
  "npmjs.com",
];

/**
 * Reads `.cursor/allowlist.json` — the single install-written artifact carrying the
 * resolved network allowlist. Codex has no allowlist file of its own, and duplicating
 * one would be a second source of truth that drifts. Absent (cursor module not
 * installed) → shipped tooling bases only.
 */
function loadNetworkAllowlistBases() {
  const bases = new Set(SHIPPED_NETWORK_BASES);
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
    /* shipped fallback only — a corrupt/absent allowlist must not crash the
       session; SHIPPED_NETWORK_BASES above is the correct fallback */
  }
  return bases;
}

/**
 * Pull the HOST out of every `http(s)://…` URL in a command.
 *
 * Deliberately strict: only an explicit scheme counts. A scheme-less token cannot be
 * told apart from a local path (`./deploy.sh`, `pkg.json`) without guessing, and
 * guessing here converts an advisory into an allow.
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
 * Allow curl/wget only when EVERY URL in the command targets an allowlisted host.
 *
 * Matching the allowlist against the whole command string is trivially defeated:
 * `curl https://evil.example/x?src=github.com`, `curl https://github.com.attacker.io/`,
 * or any request carrying an allowlisted domain in a header all read as allowed. The
 * host is the only part of the command that decides where the bytes go, so it is the
 * only part consulted. No parseable URL, or any host off the list → advisory.
 */
function curlWgetHostAllowed(cmd) {
  const hosts = extractUrlHosts(cmd);
  if (hosts.length === 0) return false;
  const bases = loadNetworkAllowlistBases();
  return hosts.every((h) => [...bases].some((b) => hostMatchesBase(h, b)));
}

/**
 * Entry point — pure. Takes the parsed hook payload, returns
 * `{ verdict: "allow"|"ask"|"deny", reason? }`, or `null` when bkit has no opinion
 * (the caller decides what a no-opinion result means).
 *
 * Codex reports shell execution as `Bash`; the aliases are kept so a
 * consumer-registered matcher still routes here.
 */
const SHELL_TOOL_NAMES = new Set(["Bash", "bash", "shell", "local_shell", "exec"]);

function bkitGuardrails(payload) {
  if (!payload || typeof payload !== "object") return null;
  const tool = payload.tool_name;
  if (!SHELL_TOOL_NAMES.has(tool)) return null;
  const input = payload.tool_input || {};
  // Codex passes the command as a string, or as an argv array for some shells.
  const cmd = Array.isArray(input.command) ? input.command.join(" ") : input.command;
  if (typeof cmd !== "string") return null;
  const decision = decideShell(cmd);
  return decision.verdict === "allow" ? null : decision;
}

// bkit:end

// --- Driver (yours to extend) ----------------------------------------------
//
// Fold in your own checks here: call bkitGuardrails(payload), combine with your own
// verdict, and call emit() exactly once. Keep the single-emit rule — two writers on
// one stdout produce an unparseable blob and Codex ignores the whole thing.

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
          : // `ask` is parsed-but-unimplemented on Codex; surfacing it as a decision
            // would be recorded as an error and the call would proceed regardless.
            // Advisory context is the strongest thing that actually reaches the model.
            { hookEventName: "PreToolUse", additionalContext: result.reason },
      );
    }
  }
} catch {
  process.exitCode = 0; // fail open — never block, never error out
}
