#!/usr/bin/env node
// bkit-guardrails.cjs — Cursor destructive-op + secret-exposure gates (parity with
// Claude `.claude/settings.json` permissions deny/ask and OpenCode permission map).
//
// Wired from `.cursor/hooks.json`:
//   - beforeShellExecution → force-push / recursive-rm / dangerous git+gh; shell reads of
//     .env / private-key files ask
//   - preToolUse (Read|TabRead) → .env ask; private-key deny
//
// Output: JSON `{ permission: "allow"|"ask"|"deny", user_message?, agent_message? }`
// Exit 0 always on a decided permission. failClosed:true in hooks.json blocks on crash.
// Fail-open: a single top-level catch allows on unexpected errors (same shape as gateguard).
//
// bkit generates the managed block at install: the shell detection and the deny / ask
// tiers are shared with the Claude and Codex hooks, the read tiers with the Antigravity
// hook (bkit's `core/hooks/`); the output shape is Cursor's own.
//
// OWNERSHIP: everything between the markers below is bkit-managed and is
// overwritten on every `bkit install` / `bkit upgrade`. It is a pure decision
// engine only — no stdin read, no stdout write, no top-level invocation. Add your
// own gates in the driver that follows the managed block: call
// `bkitGuardrails(payload)`, fold in your own checks, and call `emit()` once.

"use strict";

// bkit:start

// bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh

const fs = require("node:fs");
const path = require("node:path");

// --- Shell detection: identical in every host's guardrails hook (bkit renders it from
// one source). Needs `fs` and `path` in scope; the host's own code above declares them.

/** Wrappers that precede the real command; skipped when finding a command's program. */
const CMD_WRAPPERS = new Set(["sudo", "env", "time", "nohup", "nice", "command", "exec", "xargs"]);

/** Split a command line into pipeline / list segments. */
function shellSegments(cmd) {
  return String(cmd)
    .split(/\|\||&&|[|;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * A segment's words: single / double quotes group and are dropped, a backslash escapes
 * the next character, an unquoted `#` at a word start ends the segment (comment). An
 * unterminated quote runs to the end of the segment.
 */
function shellWords(seg) {
  const words = [];
  let cur = "";
  let started = false;
  let quote = "";
  for (let i = 0; i < seg.length; i++) {
    const ch = seg[i];
    if (quote) {
      if (ch === quote) quote = "";
      else if (ch === "\\" && quote === '"' && i + 1 < seg.length) cur += seg[++i];
      else cur += ch;
      continue;
    }
    if (ch === "#" && !started) break;
    if (ch === "'" || ch === '"') {
      quote = ch;
      started = true;
    } else if (ch === "\\" && i + 1 < seg.length) {
      cur += seg[++i];
      started = true;
    } else if (/\s/.test(ch)) {
      if (started) words.push(cur);
      cur = "";
      started = false;
    } else {
      cur += ch;
      started = true;
    }
  }
  if (started) words.push(cur);
  return words;
}

/** The words a segment runs: subshell punctuation, `VAR=val` and wrappers skipped. */
function commandWords(seg) {
  const words = shellWords(seg.replace(/^(?:\$\(|[({`!\s])+/, "").replace(/[)}`\s]+$/, ""));
  let i = 0;
  while (
    i < words.length &&
    (/^[A-Za-z_][A-Za-z0-9_]*=/.test(words[i]) || CMD_WRAPPERS.has(words[i]))
  )
    i++;
  return words.slice(i);
}

const SHELLS = new Set(["sh", "bash", "zsh", "dash", "ksh"]);

/**
 * Every command line the input runs: each list / pipeline segment, the script of a
 * `sh -c '…'`, and the body of each `$(…)` / backtick substitution, recursively.
 */
function commandLines(cmd, depth = 0) {
  const lines = [];
  if (depth < 3) {
    for (const m of String(cmd).matchAll(/\$\(([^()]*)\)|`([^`]*)`/g)) {
      lines.push(...commandLines(m[1] ?? m[2] ?? "", depth + 1));
    }
  }
  for (const seg of shellSegments(cmd)) {
    lines.push(seg);
    if (depth >= 3) continue;
    const words = commandWords(seg);
    const head = (words[0] || "").replace(/^.*\//, "");
    if (!SHELLS.has(head)) continue;
    const c = words.findIndex((w, i) => i > 0 && /^-[a-z]*c$/.test(w));
    if (c > 0 && words[c + 1]) lines.push(...commandLines(words[c + 1], depth + 1));
  }
  return lines;
}

/** The program a command line runs, path stripped (`/usr/bin/curl` -> `curl`). */
function commandProgram(words) {
  return (words[0] || "").replace(/^.*\//, "");
}

/**
 * True when some command line actually INVOKES curl or wget, including inside
 * `sh -c '…'`, `$(…)`, backticks and `( … )`.
 *
 * A token that only appears as an argument (`grep -n 'curl' file`) is not a program.
 */
function usesFetch(cmd) {
  return commandLines(cmd).some((line) => {
    const p = commandProgram(commandWords(line));
    return p === "curl" || p === "wget";
  });
}

/** Source-ish extensions: a redirect into one of these is plausibly a file edit. */
const SOURCE_EXT_RE =
  /\.(ts|tsx|js|jsx|cjs|mjs|json|md|sh|bash|py|rb|go|rs|java|css|scss|html|ya?ml|toml|sql)$/i;

/**
 * Targets of every unquoted `>` / `>>` redirect in a command line. A `>` inside single
 * or double quotes is text (`rg 'a > b.ts'`), a backslash-escaped `>` is a literal, and
 * `2>`, `&>` and `>&` forms (fd redirects) are not file targets.
 */
function redirectTargets(text) {
  const targets = [];
  let quote = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === quote) quote = "";
      else if (ch === "\\" && quote === '"') i++;
      continue;
    }
    if (ch === "'" || ch === '"') quote = ch;
    else if (ch === "\\") i++;
    else if (ch === ">") {
      const prev = text[i - 1] ?? "";
      let j = i + 1;
      if (text[j] === ">") j++;
      const fdOrAmp = /[>&\d]/.test(prev);
      i = j - 1;
      if (fdOrAmp) continue;
      while (/\s/.test(text[j] ?? "")) j++;
      const open = text[j];
      let target = "";
      if (open === '"' || open === "'") {
        const end = text.indexOf(open, j + 1);
        target = end < 0 ? "" : text.slice(j + 1, end);
        i = end < 0 ? text.length : end;
      } else {
        const m = /^[^\s;|&<>]+/.exec(text.slice(j));
        target = m ? m[0] : "";
        i = j + target.length - 1;
      }
      if (target.trim()) targets.push(target.trim());
    }
  }
  return targets;
}

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
  const lines = commandLines(cmd);
  for (const line of lines) {
    const words = commandWords(line);
    const program = commandProgram(words);
    const args = words.slice(1);
    if ((program === "sed" || program === "perl") && args.some((w) => /^-i(?:\..*)?$/.test(w))) {
      hits.push("in-place sed/perl (-i)");
    }
    if (program === "awk" && args.some((w, i) => w === "-i" && args[i + 1] === "inplace")) {
      hits.push("awk -i inplace");
    }
  }
  for (const text of [String(cmd), ...lines]) {
    for (const target of redirectTargets(text)) {
      // Scratch and env sinks — never a source edit.
      if (target.startsWith("$") || target.startsWith("&")) continue;
      if (/^\/(dev|tmp|var\/folders|var\/tmp)\//.test(target)) continue;
      if (/\.(log|bak|tmp|out|err|orig)$/i.test(target)) continue;
      if (!SOURCE_EXT_RE.test(target)) continue;
      hits.push(`redirect into ${target}`);
    }
  }
  return [...new Set(hits)];
}

/** Shared advisory string, identical on every host. */
function shellEditAdvisory(hits) {
  return (
    `bkit guardrails: this command edits files through the shell (${hits.join("; ")}). ` +
    "Pre-edit gates only see edit/write tools, so a shell rewrite bypasses every one of them. " +
    "Use the edit/write tool instead unless this is one of the sanctioned exceptions in .agents/rules.md (generating files from a script, a bulk mechanical rewrite, or appending a log line to your own step output file). " +
    "Not blocked — proceed if it is."
  );
}

/** Repo-relative path of the install-written network allowlist every host's hook reads. */
const NETWORK_ALLOWLIST_FILE = path.join(".bkit", "allowlist.json");

/**
 * Directories a hook call names, most authoritative first: the workspace roots (Cursor
 * `workspace_roots`; Antigravity `workspacePaths`, carried over by its payload adapter),
 * the payload `cwd` (Claude, Codex, Cursor), then the hook process's own cwd — which on
 * Antigravity is the plugin dir, not the repo.
 */
function hookDirs(payload) {
  const p = payload && typeof payload === "object" ? payload : {};
  const roots = Array.isArray(p.workspace_roots) ? p.workspace_roots : [];
  return [...roots, p.cwd, process.cwd()].filter((d) => typeof d === "string" && d !== "");
}

/**
 * The network allowlist file for a hook call: walking up from each of `dirs` in turn,
 * the first `.bkit/allowlist.json` found. A directory holding `.git` (the repo root)
 * ends that walk. null when none is found.
 */
function findNetworkAllowlist(dirs) {
  for (const start of dirs) {
    let dir = path.resolve(start);
    for (;;) {
      const file = path.join(dir, NETWORK_ALLOWLIST_FILE);
      if (fs.existsSync(file)) return file;
      const parent = path.dirname(dir);
      if (parent === dir || fs.existsSync(path.join(dir, ".git"))) break;
      dir = parent;
    }
  }
  return null;
}

/**
 * Hosts come from `.bkit/allowlist.json`, the one install-written artifact carrying the
 * resolved network allowlist (the shipped egress registry union the consumer's
 * `allowed-domains`); every host's hook reads it, found from the hook call's
 * directories (`hookDirs`). There is NO hardcoded fallback list: absent or unreadable,
 * this returns empty and every host is treated as unknown.
 */
function loadNetworkAllowlistBases(dirs) {
  const bases = new Set();
  try {
    const p = findNetworkAllowlist(dirs);
    if (p) {
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
 * params, headers). No parseable URL, or any host off the list → false. `dirs` locate
 * the allowlist (`hookDirs`).
 */
function curlWgetHostAllowed(cmd, dirs) {
  const hosts = extractUrlHosts(cmd);
  if (hosts.length === 0) return false;
  const bases = loadNetworkAllowlistBases(dirs);
  return hosts.every((h) => [...bases].some((b) => hostMatchesBase(h, b)));
}

// --- Shell tiers: identical in the Cursor, Codex and Google Antigravity guardrails hooks
// (bkit renders them from one source). Each host maps a tier to its own output shape and
// wording. Needs `commandWords`, `commandLines` and `shellSegments` from `guardrails-shell.js`
// above it.
//
// git commands are classified by their parsed words — subcommand, flag set (any order,
// short clusters such as `-fdx` expanded), positionals, `+refspec` — never by a literal
// prefix, so `git reset -q --hard` and `git push origin +dev` land in the same tier as
// `git reset --hard` and `git push --force`.

/** git global options that take the next word as their value (`git -C dir push`). */
const GIT_GLOBAL_VALUE_OPTS = new Set([
  "-C",
  "-c",
  "--git-dir",
  "--work-tree",
  "--namespace",
  "--config-env",
  "--super-prefix",
]);

/**
 * Per subcommand, the options that take a value: `short` letters consume the rest of their
 * cluster or the next word, `long` names consume the next word when written without `=`.
 * A value is never read as a flag or a positional (`git commit -m "drop -n"`).
 */
const GIT_VALUE_OPTS = {
  push: { short: "o", long: ["--push-option", "--repo", "--receive-pack", "--exec"] },
  clean: { short: "e", long: ["--exclude"] },
  checkout: { short: "bB", long: ["--orphan"] },
  restore: { short: "s", long: ["--source"] },
  rebase: { short: "xsXC", long: ["--onto", "--exec", "--strategy", "--strategy-option"] },
  commit: {
    short: "mFCct",
    long: [
      "--message",
      "--file",
      "--author",
      "--date",
      "--reuse-message",
      "--reedit-message",
      "--fixup",
      "--squash",
      "--template",
      "--cleanup",
      "--trailer",
    ],
  },
};

/**
 * A git invocation's parsed words, or null when `words` does not run git:
 * `{ sub, long: Set<"--name">, short: Set<letter>, args: string[] }`. Words after `--`
 * are positionals.
 */
function parseGit(words) {
  if ((words[0] || "").replace(/^.*\//, "") !== "git") return null;
  let i = 1;
  while (i < words.length && words[i].startsWith("-")) {
    i += GIT_GLOBAL_VALUE_OPTS.has(words[i]) ? 2 : 1;
  }
  const sub = words[i];
  if (!sub) return null;
  const spec = GIT_VALUE_OPTS[sub] || { short: "", long: [] };
  const long = new Set();
  const short = new Set();
  const args = [];
  let positionalOnly = false;
  for (let j = i + 1; j < words.length; j++) {
    const w = words[j];
    if (positionalOnly || w === "-" || !w.startsWith("-")) {
      args.push(w);
    } else if (w === "--") {
      positionalOnly = true;
    } else if (w.startsWith("--")) {
      const name = w.split("=")[0];
      long.add(name);
      if (!w.includes("=") && spec.long.includes(name)) j++;
    } else {
      for (let k = 1; k < w.length; k++) {
        short.add(w[k]);
        if (spec.short.includes(w[k])) {
          if (k === w.length - 1) j++;
          break;
        }
      }
    }
  }
  return { sub, long, short, args };
}

/** A pathspec naming the whole tree (or more): `.`, `./`, `..`, `:/`. */
const WHOLE_TREE_PATH = /^(?:\.\.?\/?|:\/\.?)$/;

/** `{ what, fix }` when a parsed git invocation force-pushes, else null. */
function gitDenyRule(g) {
  if (g.sub !== "push") return null;
  if (g.long.has("--force") || g.short.has("f") || g.args.some((a) => a.startsWith("+"))) {
    return {
      what: "git force-push",
      fix: "Do not force-push (--force, -f or a +refspec). Use a normal push, or --force-with-lease only when the user explicitly asks for it on a personal branch.",
    };
  }
  return null;
}

/** What makes a parsed git invocation ask-tier, else null. */
function gitAskRule(g) {
  if (g.long.has("--no-verify") || (g.sub === "commit" && g.short.has("n"))) {
    return "--no-verify (skips git hooks)";
  }
  switch (g.sub) {
    case "reset":
      return g.long.has("--hard") ? "git reset --hard" : null;
    case "clean":
      return g.short.has("n") || g.long.has("--dry-run") ? null : "git clean";
    case "checkout":
      return g.args.some((p) => WHOLE_TREE_PATH.test(p)) ? "git checkout of the whole tree" : null;
    case "restore": {
      const staged = g.long.has("--staged") || g.short.has("S");
      const worktree = g.long.has("--worktree") || g.short.has("W");
      return g.args.some((p) => WHOLE_TREE_PATH.test(p)) && (!staged || worktree)
        ? "git restore of the whole tree"
        : null;
    }
    case "stash":
      return g.args[0] === "drop" || g.args[0] === "clear" ? `git stash ${g.args[0]}` : null;
    case "rebase":
      return g.short.has("i") || g.long.has("--interactive") ? "git rebase -i" : null;
    case "filter-branch":
      return "git filter-branch";
    default:
      return null;
  }
}

/**
 * Deny tier — matches Claude's settings.json deny rows and OpenCode's bash deny map.
 * `{ what, fix }` for a blocked command, else null.
 */
function denyRule(c) {
  for (const line of commandLines(c)) {
    const g = parseGit(commandWords(line));
    const denied = g && gitDenyRule(g);
    if (denied) return denied;
  }
  // rm with both -r and -f (-rf, -fr, -Rf, -r -f) on /, ~ or $HOME itself, bare, with a
  // trailing slash, or with a trailing /*. A path below them (~/projects/x) is not matched.
  if (
    /\brm\s+(?:-[a-zA-Z]*(?:[rR][a-zA-Z]*f|f[a-zA-Z]*[rR])[a-zA-Z]*|-[rR]\s+-f|-f\s+-[rR])\s+(?:\/|~\/?|\$HOME\/?|\$\{HOME\}\/?)\*?(?=\s|$|[;&|)])/.test(
      c,
    )
  ) {
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

/** Ask tier, non-git — destructive or privileged shell. */
const ASK_PATTERNS = [
  { re: /\bsudo\b/, what: "sudo" },
  { re: /\bbrew\s+install\b/, what: "brew install" },
  { re: /\b(pnpm|npm|bun)\s+publish\b/, what: "package publish" },
  { re: /\bgh\s+repo\s+delete\b/, what: "gh repo delete" },
  { re: /\bgh\s+pr\s+close\b/, what: "gh pr close" },
  { re: /\bgh\s+release\s+delete\b/, what: "gh release delete" },
];

/** What makes a command ask-tier, else null. */
function askRule(c) {
  for (const line of commandLines(c)) {
    const g = parseGit(commandWords(line));
    const what = g && gitAskRule(g);
    if (what) return what;
  }
  const hit = ASK_PATTERNS.find((p) => p.re.test(c));
  return hit ? hit.what : null;
}

/**
 * `"key"` for private-key material (`*.pem`, `*.p12`, `id_rsa`), `"env"` for an env /
 * secrets file (`.env`, `.env.*` except `.env.example`), else null. `/` or `\` separated.
 */
function secretFileKind(filePath) {
  const p = String(filePath || "").replace(/\\/g, "/");
  if (!p) return null;
  if (/\.pem$/i.test(p) || /\.p12$/i.test(p) || /(^|\/)id_rsa$/i.test(p)) return "key";
  const base = p.split("/").pop() || p;
  if (base === ".env" || (/^\.env[.*]/.test(base) && base !== ".env.example")) return "env";
  return null;
}

/** Programs that only stat, create or remove a file — naming a secret file reads nothing. */
const NON_READING_HEADS = new Set([
  "ls",
  "stat",
  "test",
  "[",
  "[[",
  "touch",
  "rm",
  "mv",
  "ln",
  "chmod",
  "chown",
  "mkdir",
  "echo",
  "printf",
  "realpath",
  "basename",
  "dirname",
]);

/** Programs whose last positional is the file they write (`cp .env.example .env`). */
const COPY_HEADS = new Set(["cp", "install", "rsync", "scp"]);
/** Programs whose first positional is a search pattern unless `-e` / `-f` supplies one. */
const PATTERN_HEADS = new Set(["grep", "egrep", "fgrep", "rg", "ag"]);

/**
 * The first secret file a command reads through the shell (`cat .bkit/.env`,
 * `grep KEY .env.local`, `source .env`, `curl -d @.env …`), else null. Not reads: a
 * redirect target (`> .env`), a copy destination, a grep pattern (`grep -rn ".env" docs`),
 * and anything `NON_READING_HEADS` runs.
 */
function shellSecretRead(c) {
  for (const line of commandLines(c)) {
    const words = commandWords(line);
    const head = (words[0] || "").replace(/^.*\//, "");
    if (!head || NON_READING_HEADS.has(head)) continue;
    const positionals = words.flatMap((w, i) => (i > 0 && !w.startsWith("-") ? [i] : []));
    const skip = new Set();
    if (COPY_HEADS.has(head) && positionals.length > 1) skip.add(positionals.at(-1));
    if (
      PATTERN_HEADS.has(head) &&
      !words.some((w) => /^-[a-zA-Z]*[ef]/.test(w) || /^--(?:regexp|file)\b/.test(w))
    ) {
      skip.add(positionals[0]);
    }
    for (let i = 1; i < words.length; i++) {
      if (skip.has(i)) continue;
      const w = words[i];
      if (/^(?:\d*|&)>[>|]?$/.test(w)) {
        i++;
        continue;
      }
      if (/^(?:\d*|&)>/.test(w)) continue;
      for (const part of w.replace(/^</, "").split(/[=:@,]/)) {
        if (secretFileKind(part)) return part;
      }
    }
  }
  return null;
}

/**
 * The tier a trimmed command falls in, first match wins:
 *   `{ tier: "deny", what, fix }` — blocked on every host;
 *   `{ tier: "ask", what }`       — a destructive / privileged command;
 *   `{ tier: "secret", path }`    — a shell read of an env / secrets / private-key file;
 *   `{ tier: "fetch" }`           — curl / wget to a host off the network allowlist;
 *   `{ tier: "edit", edits }`     — the shell used as an edit channel (advisory only);
 *   null                          — nothing to say.
 * `dirs` locate the network allowlist (`hookDirs`).
 */
function classifyShell(c, dirs) {
  if (!c) return null;
  const denied = denyRule(c);
  if (denied) return { tier: "deny", ...denied };
  const what = askRule(c);
  if (what) return { tier: "ask", what };
  const secret = shellSecretRead(c);
  if (secret) return { tier: "secret", path: secret };
  if (usesFetch(c)) return curlWgetHostAllowed(c, dirs) ? null : { tier: "fetch" };
  const edits = shellEditTargets(c);
  return edits.length > 0 ? { tier: "edit", edits } : null;
}

// --- Secret-file read tier: identical in the Cursor and Google Antigravity guardrails hooks
// (bkit renders it from one source). Same policy as Claude's settings.json `Read(...)` deny /
// ask rows and opencode's `permission.read` map; each host maps a tier to its own output
// shape and wording. Needs `secretFileKind` from `guardrails-tiers.js` above it.

/**
 * The read tier for a file path (`/` or `\` separated), first match wins:
 *   `{ tier: "deny", path }` — private-key material: `*.pem`, `*.p12`, `id_rsa`;
 *   `{ tier: "ask", path }`  — an env / secrets file: `.env`, `.env.*` except `.env.example`;
 *   null                     — nothing to say.
 */
function classifyRead(filePath) {
  const p = String(filePath || "").replace(/\\/g, "/");
  const kind = secretFileKind(p);
  if (kind === "key") return { tier: "deny", path: p };
  if (kind === "env") return { tier: "ask", path: p };
  return null;
}

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

/**
 * @param {string} cmd
 * @param {string[]} dirs where to look for the network allowlist (`hookDirs`)
 */
function decideShell(cmd, dirs) {
  const c = cmd.trim();
  const v = classifyShell(c, dirs);
  if (!v) return allow();
  switch (v.tier) {
    case "deny":
      return deny(`Blocked: ${v.what} is denied by bkit Cursor guardrails.`, v.fix);
    case "ask":
      return ask(
        `bkit Cursor guardrails: confirm this destructive / privileged shell command (${v.what}).`,
        `Command requires confirmation: ${c}`,
      );
    case "secret":
      return ask(
        "bkit Cursor guardrails: confirm a shell read of an env/secrets or private-key file.",
        `Reading ${v.path} through the shell may expose secrets. Prefer direnv / documented non-secret examples. Command: ${c}`,
      );
    case "fetch":
      return ask(
        "bkit Cursor guardrails: confirm outbound curl/wget (host not on network allowlist).",
        `Command requires confirmation: ${c}`,
      );
    default:
      // Shell-as-edit-channel: ADVISORY, never a block — allow plus an `agent_message`
      // naming the edited paths.
      return { permission: "allow", agent_message: shellEditAdvisory(v.edits) };
  }
}

/** @param {string} filePath */
function decideRead(filePath) {
  const v = classifyRead(filePath);
  if (!v) return allow();
  if (v.tier === "deny") {
    return deny(
      "Blocked: reading private-key material is denied by bkit Cursor guardrails.",
      `Do not read ${v.path}. Ask the user to supply needed material out-of-band.`,
    );
  }
  return ask(
    "bkit Cursor guardrails: confirm reading an env/secrets file.",
    `Reading ${v.path} may expose secrets. Prefer direnv / documented non-secret examples.`,
  );
}

/**
 * Entry point — pure. Takes the parsed hook payload, returns a decision object
 * `{ permission, user_message?, agent_message? }`, or `null` when bkit has no
 * opinion on this call (the caller decides what a no-opinion result means).
 */
function bkitGuardrails(payload) {
  // beforeShellExecution: { command, cwd, workspace_roots }
  if (
    typeof payload.command === "string" &&
    payload.tool_name == null &&
    payload.tool_input == null
  ) {
    return decideShell(payload.command, hookDirs(payload));
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
