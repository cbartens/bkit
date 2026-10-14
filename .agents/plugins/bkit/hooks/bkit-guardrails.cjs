#!/usr/bin/env node
// bkit-guardrails.cjs — bkit destructive-op shell gates (Google Antigravity).
//
// Twin of `.cursor/hooks/bkit-guardrails.cjs` and `.codex/hooks/bkit-guardrails.cjs`:
// bkit generates the same shell detection and deny / ask tiers into all three at install
// (bkit's `core/hooks/`). Wired from `.agents/plugins/bkit/hooks.json`, matcher `run_command` —
// Antigravity's canonical tool name for shell execution.
//
// WHAT DIFFERS FROM THE CODEX TWIN — Antigravity's hook contract, live-verified on the agy
// CLI (bkit's `core/hooks/antigravity-hook.js`):
//
//   1. ENVELOPE. stdin is `{ conversationId, toolCall: { name, args }, workspacePaths }`;
//      the command is `args.CommandLine`.
//   2. OUTPUT. stdout is `{ decision, reason }`. deny → `deny`; ask → Antigravity's own
//      `ask` (it prompts the human); the advisory tiers (fetch host, shell-as-edit) deny the
//      call once with the advisory as the reason, because only a deny's reason reaches the
//      model — the agent's retry goes through.
//
// REGISTRATION: `.agents/plugins/bkit/hooks.json`, matcher `run_command`. See .bkit/providers.md § GateGuard.
//
// CONTRACT — do not regress:
//   - FAIL OPEN: one top-level catch emits a bare allow on any error.
//   - DENY IS REAL: the deny tier returns decision "deny" and blocks every time.
//   - PURE ENGINE: everything between the markers is a decision engine only — no stdin
//     read, no stdout write. Add your own gates in the driver below the block.
//
// OWNERSHIP: everything between the markers is bkit-managed and overwritten on every
// `bkit install` / `bkit upgrade`.

"use strict";

// bkit:start

// bkit:managed v5.1.0 — do not edit; run `bkit upgrade` to refresh

const fs = require("node:fs");
const os = require("node:os");
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

// --- Antigravity hook contract: identical in bkit's three Antigravity hooks (bkit renders
// it from one source). Needs `fs`, `os` and `path` in scope; the host's own code above
// declares them.
//
// Live-verified on the agy CLI: PreToolUse stdin is `{ conversationId, toolCall: { name,
// args }, workspacePaths, stepIdx, ... }` — no tool_name / tool_input / session_id / cwd.
// Args: `view_file` AbsolutePath / StartLine / EndLine; `run_command` CommandLine / Cwd;
// `write_to_file` / `replace_file_content` TargetFile. Stdout is `{ decision, reason }`,
// and only a `deny`'s reason reaches the model.

/**
 * Antigravity's envelope in the Claude-family shape bkit's shared engines read. A payload
 * already in that shape (a consumer's own matcher, a test) passes through unchanged.
 */
function fromAntigravityPayload(payload) {
  if (!payload || typeof payload !== "object" || !payload.toolCall) return payload;
  const args =
    payload.toolCall.args && typeof payload.toolCall.args === "object" ? payload.toolCall.args : {};
  const roots = payload.workspacePaths;
  const root = Array.isArray(roots) && typeof roots[0] === "string" ? roots[0] : undefined;
  return {
    tool_name: payload.toolCall.name,
    tool_input: args,
    session_id: payload.conversationId,
    cwd: typeof args.Cwd === "string" ? args.Cwd : root,
  };
}

// Model-written labels that differ between two otherwise identical calls.
const AG_LABEL_ARGS = new Set(["toolAction", "toolSummary", "Description", "Instruction"]);

/** The call's identity: tool name plus its arguments, labels dropped, keys sorted. */
function agCallSignature(toolName, input) {
  const args = input && typeof input === "object" ? input : {};
  const kept = Object.keys(args)
    .filter((k) => !AG_LABEL_ARGS.has(k))
    .sort()
    .map((k) => [k, args[k]]);
  return JSON.stringify([toolName, kept]);
}

// One record per (hook, conversation): two hooks on the same call each let its retry through.
function agRetryFile(hook, sessionId) {
  const safe =
    typeof sessionId === "string" ? sessionId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128) : "";
  return path.join(os.tmpdir(), "bkit-antigravity-retry", `${hook}.${safe || "no-session"}.json`);
}

/**
 * Delivers an advisory the only way Antigravity shows one to the model: deny the call
 * with the advisory as the reason, once. The identical call right after is the agent's
 * retry and is allowed.
 */
function adviseOnce(hook, sessionId, signature, advisory) {
  const file = agRetryFile(hook, sessionId);
  const last = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
  if (last === signature) {
    fs.rmSync(file, { force: true });
    return { decision: "allow" };
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, signature, "utf-8");
  return {
    decision: "deny",
    reason: `${advisory}\nBlocked once so you see this; repeat the same call to proceed.`,
  };
}

/**
 * Antigravity reports shell execution as `run_command`; the aliases match a
 * consumer-registered matcher or an isolated `run_command` session.
 */
const SHELL_TOOL_NAMES = new Set(["run_command", "RunCommand", "Bash", "bash", "shell"]);

/**
 * Entry point — pure. Takes the parsed hook payload, returns Antigravity's
 * `{ decision: "allow"|"ask"|"deny", reason? }`, or `null` when bkit has no opinion
 * (the caller decides what a no-opinion result means).
 */
function bkitGuardrails(payload) {
  const p = fromAntigravityPayload(payload);
  if (!p || typeof p !== "object") return null;
  const tool = p.tool_name;
  if (!SHELL_TOOL_NAMES.has(tool)) return null;
  const input = p.tool_input || {};
  const raw = Array.isArray(input.command)
    ? input.command.join(" ")
    : (input.CommandLine ?? input.command);
  if (typeof raw !== "string") return null;

  const cmd = raw.trim();
  const tier = classifyShell(cmd);
  if (!tier) return null;
  if (tier.tier === "deny") {
    return {
      decision: "deny",
      reason: `Blocked by bkit Antigravity guardrails: ${tier.what}. ${tier.fix}`,
    };
  }
  if (tier.tier === "ask") {
    return {
      decision: "ask",
      reason: `bkit Antigravity guardrails: this is a destructive or privileged command. It is on the PROHIBITED list in every bkit workflow. Do not run it unless the user asked for this exact command. Note that git clean and git checkout -- . destroy untracked files and uncommitted work, which no reflog can recover. Command: ${cmd}`,
    };
  }
  const advisory =
    tier.tier === "fetch"
      ? `bkit Antigravity guardrails: outbound fetch to a host that is not on the network allowlist. Confirm the destination is intended before relying on the result. Command: ${cmd}`
      : shellEditAdvisory(tier.edits);
  return adviseOnce("guardrails", p.session_id, agCallSignature(tool, input), advisory);
}

// bkit:end

// --- Driver (yours to extend) ----------------------------------------------
//
// Fold in your own checks here: call bkitGuardrails(payload), combine with your own
// decision, and call emit() exactly once. Keep the single-emit rule — two writers on
// one stdout produce an unparseable blob and Antigravity ignores the whole thing.

function emit(decision) {
  process.stdout.write(JSON.stringify(decision));
}

try {
  const raw = fs.readFileSync(0, "utf-8");
  const result = raw.trim() ? bkitGuardrails(JSON.parse(raw)) : null;
  emit(result ?? { decision: "allow" });
} catch {
  emit({ decision: "allow" }); // fail open — never block, never error out
}
