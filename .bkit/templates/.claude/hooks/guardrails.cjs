#!/usr/bin/env node
// guardrails.cjs — bkit shell advisories (Claude Code).
//
// Third twin of `.cursor/hooks/guardrails.cjs` and `.codex/hooks/guardrails.cjs`,
// carrying the same detection so the four hosts cannot drift. Wired from
// `.claude/settings.json` → PreToolUse, matcher `Bash`.
//
// WHY THIS EXISTS AT ALL, given Claude already has a permission table.
// `.claude/settings.json` covers everything expressible as a command PREFIX. Two
// things are not:
//
//   1. URL HOSTS. `Bash(curl:*)` matches a prefix, never a URL host, so Claude cannot
//      say "allow curl to an allowlisted host, flag anything else" the way Cursor and
//      opencode can. A blanket ask row would force a prompt on every shell fetch in
//      every mode — unanswerable in a cloud session. This hook gives the signal
//      without the prompt.
//   2. SHELL-AS-EDIT-CHANNEL. `sed -i` and redirection into a source file route around
//      every pre-edit gate; GateGuard only sees Edit/Write/MultiEdit. Detecting that
//      needs the target path parsed, which no permission table can do.
//
// ADVISORY ONLY — this hook NEVER denies and NEVER asks.
//   - `deny` already lives in settings.json and is evaluated BEFORE any hook, so
//     duplicating it here would be dead code with a second place to drift.
//   - `ask` is deliberately absent: a content-scoped ask is evaluated before the
//     auto-mode classifier and always forces a prompt. Adding one here would cause
//     the exact stall this host is configured to avoid.
//   So the strongest thing that reaches the model without costing a prompt is
//   `additionalContext`. The gate informs; the permission table and the auto-mode
//   classifier remain what stop things.
//
// CONTRACT — do not regress:
//   - FAIL OPEN: one top-level catch swallows every error and exits 0.
//   - NEVER BLOCKS: no `permissionDecision` is ever emitted from the managed block.
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

/**
 * Hosts come from `.cursor/allowlist.json`, the single install-written artifact
 * carrying the resolved network allowlist (shipped egress registry union the
 * consumer's `allowed-domains`). There is deliberately NO hardcoded fallback list:
 * a second copy drifts from the registry silently, and the failure it produces — a
 * host allowed in one IDE and not another — stays invisible until someone hits it.
 */

/**
 * Reads `.cursor/allowlist.json` — the single install-written artifact carrying the
 * resolved network allowlist. Claude has no allowlist file of its own (its WebFetch
 * grants live in settings.json and govern the WebFetch TOOL, not shell curl), and
 * duplicating one would be a second source of truth that drifts. Absent (cursor
 * module not installed) → shipped tooling bases only.
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
    /* shipped fallback only — a corrupt/absent allowlist must not break the session */
  }
  return bases;
}

/**
 * Pull the HOST out of every `http(s)://…` URL in a command.
 *
 * Deliberately strict: only an explicit scheme counts. A scheme-less token cannot be
 * told apart from a local path without guessing, and guessing converts a flag into
 * silence.
 */
function extractUrlHosts(cmd) {
  const hosts = [];
  const re = /\bhttps?:\/\/([^\s"'`\\|;&<>()]+)/gi;
  let m;
  while ((m = re.exec(cmd)) !== null) {
    let authority = m[1].split(/[/?#]/)[0];
    // Strip userinfo — `https://github.com@evil.tld/` is a request to evil.tld.
    const at = authority.lastIndexOf("@");
    if (at >= 0) authority = authority.slice(at + 1);
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
 * Matching the allowlist against the whole command string is trivially defeated:
 * `curl https://evil.example/x?src=github.com` or `curl https://github.com.attacker.io/`
 * both read as allowed. The host is the only part that decides where the bytes go, so
 * it is the only part consulted. No parseable URL → not allowed (flagged).
 */
function curlWgetHostAllowed(cmd) {
  const hosts = extractUrlHosts(cmd);
  if (hosts.length === 0) return false;
  const bases = loadNetworkAllowlistBases();
  return hosts.every((h) => [...bases].some((b) => hostMatchesBase(h, b)));
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
const SOURCE_EXT_RE = /\.(ts|tsx|js|jsx|cjs|mjs|json|md|sh|bash|py|rb|go|rs|java|css|scss|html|ya?ml|toml|sql)$/i;

/**
 * Detect a shell command being used as an edit channel. Returns a list of human
 * descriptions, empty when the command edits nothing.
 *
 * Deliberately quiet on the shapes that dominate legitimate use — `> /dev/null`,
 * `>> "$GITHUB_ENV"`, `mktemp` handoff files, log capture — because a gate that
 * fires constantly is one that gets disabled. Only a redirect whose target both
 * looks like a repo path AND carries a source extension is reported.
 *
 * Byte-identical to the Cursor and Codex twins; behavioural parity is asserted in
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

const SHELL_TOOL_NAMES = new Set(["Bash", "bash"]);

/**
 * Entry point — pure. Returns `{ context }` when bkit has something to say about this
 * call, or `null` when it does not. Never returns a blocking decision: see the header.
 */
function bkitGuardrails(payload) {
  if (!payload || typeof payload !== "object") return null;
  if (!SHELL_TOOL_NAMES.has(payload.tool_name)) return null;
  const input = payload.tool_input || {};
  const cmd = Array.isArray(input.command) ? input.command.join(" ") : input.command;
  if (typeof cmd !== "string") return null;
  const c = cmd.trim();
  if (!c) return null;

  const notes = [];
  if ((usesFetch(c)) && !curlWgetHostAllowed(c)) {
    notes.push(
      "bkit guardrails: outbound fetch to a host that is not on this repo's network allowlist " +
        "(.agents/context.md § allowed-domains, plus bkit's shipped tooling hosts). Not blocked — " +
        "confirm the destination is intended before relying on the result, and add the host to " +
        "allowed-domains if it is a standing dependency.",
    );
  }
  const edits = shellEditTargets(c);
  if (edits.length > 0) notes.push(shellEditAdvisory(edits));

  return notes.length > 0 ? { context: notes.join("\n\n") } : null;
}

// bkit:end

// --- Driver (yours to extend) ----------------------------------------------
//
// Fold in your own checks here: call bkitGuardrails(payload), combine with your own
// result, and call emit() exactly once. Keep the single-emit rule — two writers on one
// stdout produce an unparseable blob and Claude Code ignores the whole thing.

function emit(payload) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: payload }));
}

try {
  const raw = fs.readFileSync(0, "utf-8");
  if (raw.trim()) {
    const result = bkitGuardrails(JSON.parse(raw));
    if (result) {
      emit({ hookEventName: "PreToolUse", additionalContext: result.context });
    }
  }
} catch {
  process.exitCode = 0; // fail open — never block, never error out
}
