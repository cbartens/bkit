#!/usr/bin/env node
// guardrails.cjs — Cursor destructive-op + secret-exposure gates (parity with
// Claude `.claude/settings.json` permissions deny/ask and OpenCode permission map).
//
// Wired from `.cursor/hooks.json`:
//   - beforeShellExecution → force-push / recursive-rm / dangerous git+gh
//   - preToolUse (Read|TabRead) → .env ask; private-key deny
//
// Output: JSON `{ permission: "allow"|"ask"|"deny", user_message?, agent_message? }`
// Exit 0 always on a decided permission. failClosed:true in hooks.json blocks on crash.
// Fail-open: a single top-level catch allows on unexpected errors (same shape as gateguard).
//
// OWNERSHIP: everything between the markers below is bkit-managed and is
// overwritten on every `bkit install` / `bkit upgrade`. It is a pure decision
// engine only — no stdin read, no stdout write, no top-level invocation — so two
// emitters (bkit's and yours) can never collide into one unparseable stdout
// blob. Add your own gates in the driver that follows the managed block: call
// `bkitGuardrails(payload)`, fold in your own checks, and call `emit()` once.

"use strict";

// bkit:start

const fs = require("node:fs");
const path = require("node:path");

function allow() {
  return { permission: "allow" };
}

function ask(userMessage, agentMessage) {
  return {
    permission: "ask",
    user_message: userMessage,
    agent_message: agentMessage ?? userMessage,
  };
}

function deny(userMessage, agentMessage) {
  return {
    permission: "deny",
    user_message: userMessage,
    agent_message: agentMessage ?? userMessage,
  };
}

/** @param {string} cmd */
function decideShell(cmd) {
  const c = cmd.trim();
  if (!c) return allow();

  // Deny — matches Claude deny + OpenCode bash deny
  // Check --force-with-lease BEFORE bare --force (substring otherwise matches).
  const isForceWithLease = /\bgit\s+push\b[\s\S]*--force-with-lease\b/.test(c);
  if (
    !isForceWithLease &&
    (/\bgit\s+push\b[\s\S]*--force\b/.test(c) || /\bgit\s+push\b[\s\S]*\s-f\b/.test(c))
  ) {
    return deny(
      "Blocked: git force-push is denied by bkit Cursor guardrails.",
      "Do not force-push. Use a normal push or --force-with-lease only when the user explicitly requests it on a personal branch.",
    );
  }
  if (/\brm\s+-rf\s+(\/(?:\s|$|\*)|~\/\*|\$HOME\/\*)/.test(c)) {
    return deny(
      "Blocked: recursive delete of filesystem roots is denied by bkit Cursor guardrails.",
      "Do not run rm -rf against /, ~, or $HOME. Narrow the path to the target directory.",
    );
  }
  if (/\bchmod\s+-R\s+777\s+\//.test(c)) {
    return deny(
      "Blocked: chmod -R 777 / is denied by bkit Cursor guardrails.",
      "Do not world-writable-chmod the filesystem root.",
    );
  }

  // Ask — privileged / destructive shell. curl/wget: ask UNLESS the URL host is
  // on the shared network allowlist (shipped defaults + `.cursor/allowlist.json`).
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
        "bkit Cursor guardrails: confirm this destructive / privileged shell command.",
        `Command requires confirmation: ${c}`,
      );
    }
  }

  if (usesFetch(c)) {
    if (curlWgetHostAllowed(c)) return allow();
    return ask(
      "bkit Cursor guardrails: confirm outbound curl/wget (host not on network allowlist).",
      `Command requires confirmation: ${c}`,
    );
  }

  // Shell-as-edit-channel: ADVISORY, never a block. `.agents/rules.md` § Output &
  // Editing says to change files with edit tools, so pre-edit gates (GateGuard) see
  // them; a shell rewrite routes around every one of those gates and the hook log
  // shows Read/Shell/Grep and no Write at all. Advisory rather than ask/deny because
  // the rule has sanctioned exceptions — bkit's own plan workflow does a `sed -i.bak
  // -E` bulk rewrite of cross-references across generated files — and a gate that
  // blocks a documented exception gets switched off. Allow + tell the agent.
  const edits = shellEditTargets(c);
  if (edits.length > 0) {
    return {
      permission: "allow",
      agent_message: shellEditAdvisory(edits),
    };
  }

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
const SOURCE_EXT_RE = /\.(ts|tsx|js|jsx|cjs|mjs|json|md|sh|bash|py|rb|go|rs|java|css|scss|html|ya?ml|toml|sql)$/i;

/**
 * Detect a shell command being used as an edit channel. Returns a list of human
 * descriptions, empty when the command edits nothing.
 *
 * Deliberately quiet on the shapes that dominate legitimate use — `> /dev/null`,
 * `>> "$GITHUB_ENV"`, `mktemp` handoff files, log capture — because a gate that
 * fires constantly is one that gets disabled. Only a redirect whose target both
 * looks like a repo path AND carries a source extension is reported.
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

function loadNetworkAllowlistBases() {
  const bases = new Set(SHIPPED_NETWORK_BASES);
  try {
    const p = path.join(process.cwd(), ".cursor", "allowlist.json");
    if (fs.existsSync(p)) {
      const doc = JSON.parse(fs.readFileSync(p, "utf8"));
      const domains = Array.isArray(doc.domains) ? doc.domains : [];
      for (const d of domains) {
        const b = String(d)
          .replace(/^\*\./, "")
          .trim();
        if (b) bases.add(b);
      }
    }
  } catch {
    /* shipped fallback only — a corrupt/absent allowlist must not crash the
       editor session; SHIPPED_NETWORK_BASES above is the correct fallback */
  }
  return bases;
}

/**
 * Pull the HOST out of every `http(s)://…` URL in a command.
 *
 * Deliberately strict: only an explicit scheme counts. A scheme-less token
 * cannot be told apart from a local path (`./deploy.sh`, `pkg.json`) without
 * guessing, and guessing here converts an ask into an allow.
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
 * Matching the allowlist against the whole command string (an `includes` over
 * `cmd`) is trivially defeated: `curl https://evil.example/x?src=github.com`,
 * `curl https://github.com.attacker.io/`, or any request carrying an
 * allowlisted domain in a header or query param all read as allowed. The host
 * is the only part of the command that decides where the bytes go, so it is the
 * only part consulted. No parseable URL, or any host off the list → ask.
 */
function curlWgetHostAllowed(cmd) {
  const hosts = extractUrlHosts(cmd);
  if (hosts.length === 0) return false;
  const bases = loadNetworkAllowlistBases();
  return hosts.every((h) => [...bases].some((b) => hostMatchesBase(h, b)));
}

/** @param {string} filePath */
function decideRead(filePath) {
  const p = filePath.replace(/\\/g, "/");
  if (!p) return allow();

  // Deny private-key material
  if (/\.pem$/i.test(p) || /\.p12$/i.test(p) || /(^|\/)id_rsa$/i.test(p)) {
    return deny(
      "Blocked: reading private-key material is denied by bkit Cursor guardrails.",
      `Do not read ${p}. Ask the user to supply needed material out-of-band.`,
    );
  }

  // Ask on .env (allow .env.example)
  const base = p.split("/").pop() || p;
  if (base === ".env" || (/^\.env\./.test(base) && base !== ".env.example")) {
    return ask(
      "bkit Cursor guardrails: confirm reading an env/secrets file.",
      `Reading ${p} may expose secrets. Prefer direnv / documented non-secret examples.`,
    );
  }

  return allow();
}

/**
 * Entry point — pure. Takes the parsed hook payload, returns a decision object
 * `{ permission, user_message?, agent_message? }`, or `null` when bkit has no
 * opinion on this call (the caller decides what a no-opinion result means).
 */
function bkitGuardrails(payload) {
  // beforeShellExecution: { command }
  if (
    typeof payload.command === "string" &&
    payload.tool_name == null &&
    payload.tool_input == null
  ) {
    return decideShell(payload.command);
  }

  // preToolUse Read/TabRead: { tool_name, tool_input: { path|file_path|target_file|... } }
  const tool = String(payload.tool_name || payload.toolName || "");
  if (/^(Read|TabRead)$/i.test(tool) || payload.hook_event_name === "beforeReadFile") {
    const input = payload.tool_input || payload.toolInput || payload;
    const filePath =
      input.path ||
      input.file_path ||
      input.filePath ||
      input.target_file ||
      input.targetFile ||
      "";
    return decideRead(String(filePath));
  }

  // beforeReadFile may put path at top level
  if (typeof payload.path === "string" && !payload.command) {
    return decideRead(payload.path);
  }

  return null;
}

// bkit:end

// --- driver (yours) ---------------------------------------------------------
// Reads stdin, calls into the managed block, and emits EXACTLY ONE JSON document.
// Add your own gates here: inspect the payload, and either return your own
// decision or defer to bkit's. Cursor discards the whole hook's output if two
// emitters both write to stdout.

function emit(decision) {
  process.stdout.write(JSON.stringify(decision) + "\n");
}

function main() {
  const raw = fs.readFileSync(0, "utf8").trim();
  if (!raw) return emit({ permission: "allow" });

  const payload = JSON.parse(raw);
  const decision = bkitGuardrails(payload);

  emit(decision ?? { permission: "allow" });
}

try {
  main();
} catch {
  emit({ permission: "allow" });
}
