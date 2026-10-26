// --- Rules-read advisory: the one first-tool-call nudge (bkit renders it from this one
// source into every host hook whose host has no session-start event: opencode, Codex,
// Antigravity). Advisory only: it names `.agents/rules.md` and no other file, never blocks
// and never throws. Needs `fs`, `os` and `path` in scope; the host's own code above
// declares them. Plain declarations only — no `export` and no `import`: renderParts copies
// these bytes into each host template, so either would make the rendered CJS hook invalid.

const RULES_READ_ADVISORY =
  "[bkit] Required reading before any other action: read `.agents/rules.md` and follow every rule in it.";

/** The OS-temp dir holding one state file per session the advisory already reached. */
function rulesAdvisoryStateDir() {
  return path.join(os.tmpdir(), "bkit-rules-advisory");
}

/** One state file per session id; a payload with no id falls back to one shared bucket. */
function rulesAdvisoryFile(sessionId) {
  const safe =
    typeof sessionId === "string" ? sessionId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 128) : "";
  return path.join(rulesAdvisoryStateDir(), `${safe || "no-session"}.json`);
}

/** Opportunistic TTL: drops state files older than 24h. */
function rulesAdvisoryGc() {
  const dir = rulesAdvisoryStateDir();
  if (!fs.existsSync(dir)) return;
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    const stat = fs.statSync(file, { throwIfNoEntry: false });
    if (stat && stat.mtimeMs < cutoff) fs.rmSync(file, { force: true });
  }
}

/**
 * The advisory the first time `sessionId` is seen, null after. State lives in the OS temp
 * dir — never in the consumer repo — and is GC'd after 24h. Fail-open: a state-file error
 * returns the advisory instead of throwing, so the nudge is never lost to a bad state.
 */
function rulesReadAdviceOnce(sessionId) {
  try {
    const file = rulesAdvisoryFile(sessionId);
    if (fs.existsSync(file)) return null;
    fs.mkdirSync(rulesAdvisoryStateDir(), { recursive: true });
    fs.writeFileSync(file, JSON.stringify({ at: Date.now() }), "utf-8");
    rulesAdvisoryGc();
    return RULES_READ_ADVISORY;
  } catch {
    return RULES_READ_ADVISORY;
  }
}
