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
