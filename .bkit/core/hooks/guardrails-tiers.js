// --- Shell tiers: identical in the Cursor, Codex and Google Antigravity guardrails hooks
// (bkit renders them from one source). Each host maps a tier to its own output shape and
// wording. Needs `shellCommands` and `usesFetch` from `guardrails-shell.js`, and
// `parseGit` and `denyRule` from `guardrails-deny.js`, above it.

/** A pathspec naming the whole tree (or more): `.`, `./`, `..`, `:/`. */
const WHOLE_TREE_PATH = /^(?:\.\.?\/?|:\/\.?)$/;

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

/** The basename of a word that names a program (`/usr/bin/sudo` -> `sudo`). */
function programName(word) {
  return String(word || "").replace(/^.*\//, "");
}

/** The words after the program that are not options. */
function operandsOf(words) {
  return words.slice(1).filter((w) => !w.startsWith("-"));
}

/** Whether a parsed command runs `bkit tests jump` (also `pnpm bkit ...`, `node dist/cli.js ...`). */
function isTestsJump(words) {
  return words.some(
    (w, i) =>
      (programName(w) === "bkit" || /^cli\.[jt]s$/.test(programName(w))) &&
      words[i + 1] === "tests" &&
      words[i + 2] === "jump",
  );
}

/** Whether any parsed command runs `bkit tests jump`. */
function testsJump(cmds) {
  return cmds.some((c) => isTestsJump(c.words));
}

/** Ask tier, non-git: what makes one parsed command destructive or privileged, else null. */
function shellAskRule(c) {
  for (const priv of ["sudo", "doas"]) {
    if (c.program === priv || c.prefix.some((w) => programName(w) === priv)) return priv;
  }
  const ops = operandsOf(c.words);
  if (c.program === "brew" && ops[0] === "install") return "brew install";
  if (["pnpm", "npm", "bun"].includes(c.program) && ops[0] === "publish") return "package publish";
  if (c.program === "gh") {
    const sub = `${ops[0] || ""} ${ops[1] || ""}`;
    if (sub === "repo delete" || sub === "pr close" || sub === "release delete") return `gh ${sub}`;
  }
  return isTestsJump(c.words) ? "bkit tests jump" : null;
}

/** Whether this hook is the Codex one, which cannot prompt: its `.codex/hooks/` copy. */
const CODEX_HOOK_RE = /[\\/]\.codex[\\/]hooks[\\/]|[\\/]codex\.cjs$/;
const HOOK_FILE = typeof __filename === "string" ? __filename : "";
// `__filename` is the real path; `process.argv[1]` is the path the hook was invoked by, which
// keeps a symlinked `.codex` folder visible.
const HOOK_INVOKED =
  typeof process !== "undefined" && process.argv && typeof process.argv[1] === "string"
    ? process.argv[1]
    : "";
const IS_CODEX_HOOK = CODEX_HOOK_RE.test(HOOK_FILE) || CODEX_HOOK_RE.test(HOOK_INVOKED);

/** What makes one of the parsed commands ask-tier, else null. */
function askRule(cmds) {
  for (const c of cmds) {
    const g = parseGit(c.words);
    const what = (g && gitAskRule(g)) || shellAskRule(c);
    if (what) return what;
  }
  return null;
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
 * The first secret file the parsed commands read (`cat .bkit/.env`, `grep KEY .env.local`,
 * `source .env`, `curl -d @.env ...`, `wc -l < .env`), else null. Not reads: a redirect
 * target (`> .env`), a copy destination, a grep pattern (`grep -rn ".env" docs`), and
 * anything `NON_READING_HEADS` runs.
 */
function shellSecretRead(cmds) {
  for (const c of cmds) {
    const words = c.words;
    const head = c.program;
    if (!head || NON_READING_HEADS.has(head)) continue;
    if (c.stdinFile && secretFileKind(c.stdinFile)) return c.stdinFile;
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
      for (const part of words[i].split(/[=:@,]/)) {
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
 *   `{ tier: "fetch", edits? }`   — curl / wget to a host off the network allowlist, with the
 *                                   edit evidence of the same command when it has any;
 *   `{ tier: "edit", edits }`     — the shell used as an edit channel (advisory only);
 *   null                          — nothing to say.
 * An allowed fetch never hides an edit in the same command. `edits` is the evidence from
 * `shellEditTargets`. `dirs` locate the network allowlist (`hookDirs`); `ctx` is the call's
 * `{ cwd, root }` (`hookContext`) that edit targets resolve against.
 */
function classifyShell(c, dirs, ctx) {
  if (!c) return null;
  const cmds = shellCommands(c);
  const denied = denyRule(cmds);
  if (denied) return { tier: "deny", ...denied };
  if (IS_CODEX_HOOK && testsJump(cmds)) {
    return {
      tier: "deny",
      what: "bkit tests jump",
      fix: "Every bkit tests jump needs the human's approval and Codex cannot ask. Ask the human to run it in their own terminal.",
    };
  }
  const what = askRule(cmds);
  if (what) return { tier: "ask", what };
  const secret = shellSecretRead(cmds);
  if (secret) return { tier: "secret", path: secret };
  const offList = usesFetch(cmds) && !curlWgetHostAllowed(c, dirs);
  const edits = shellEditTargets(c, ctx);
  const found = hasEditEvidence(edits);
  if (offList) return found ? { tier: "fetch", edits } : { tier: "fetch" };
  return found ? { tier: "edit", edits } : null;
}
