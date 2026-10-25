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
