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
      return g.args[0] === "drop" ? "git stash drop" : null;
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
 */
function classifyShell(c) {
  if (!c) return null;
  const denied = denyRule(c);
  if (denied) return { tier: "deny", ...denied };
  const what = askRule(c);
  if (what) return { tier: "ask", what };
  const secret = shellSecretRead(c);
  if (secret) return { tier: "secret", path: secret };
  if (usesFetch(c)) return curlWgetHostAllowed(c) ? null : { tier: "fetch" };
  const edits = shellEditTargets(c);
  return edits.length > 0 ? { tier: "edit", edits } : null;
}
