// --- Shell deny tier: identical in every host's guardrails hook (bkit renders it from one
// source). Reads the parsed commands `shellCommands` (`guardrails-shell.js`) returns; needs
// nothing else in scope.
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

/** `{ what, fix }` when a parsed command's words force-push with git, else null. */
function gitDenyRule(words) {
  const g = parseGit(words);
  if (!g || g.sub !== "push") return null;
  if (g.long.has("--force") || g.short.has("f") || g.args.some((a) => a.startsWith("+"))) {
    return {
      what: "git force-push",
      fix: "NEVER force-push (--force, -f or a +refspec). Use a normal push, or --force-with-lease only when the user explicitly asks for it on a personal branch.",
    };
  }
  return null;
}

/**
 * A filesystem root an operand names: `/` (also `//`, `/.`), or `~`, `$HOME` or `${HOME}` bare
 * or followed by such slashes and dots, with an optional trailing `*`.
 */
const ROOT_OPERAND = /^(?:\/[/.]*|(?:~|\$HOME|\$\{HOME\})(?:\/[/.]*)?)\*?$/;

/** The system root itself: `/`, `//`, `/.`, `/*`. */
const SYSTEM_ROOT = /^\/[/.]*\*?$/;

/** A chmod mode that makes a file world-writable: octal `777` / `0777` / `666`, or `a+w` / `o=rwx`. */
function worldWritable(mode) {
  if (/^[0-7]{3,4}$/.test(mode)) return /[2367]$/.test(mode);
  return mode.split(",").some((clause) => /^[ugoa]*[ao][ugoa]*[+=][rwxXst]*w/.test(clause));
}

/** An option word's short letters and long names, and the operands, of `words` after the program. */
function optionsAndOperands(words) {
  const short = new Set();
  const long = new Set();
  const operands = [];
  let positionalOnly = false;
  for (const w of words.slice(1)) {
    if (positionalOnly || w === "-" || !w.startsWith("-")) operands.push(w);
    else if (w === "--") positionalOnly = true;
    else if (w.startsWith("--")) long.add(w.split("=")[0]);
    else for (const ch of w.slice(1)) short.add(ch);
  }
  return { short, long, operands };
}

/**
 * Deny tier — matches Claude's settings.json deny rows and OpenCode's bash deny map.
 * `cmds` are the parsed commands (`shellCommands`). `{ what, fix }` for a blocked
 * command, else null.
 */
function denyRule(cmds) {
  for (const c of cmds) {
    const denied = gitDenyRule(c.words);
    if (denied) return denied;
    const { short, long, operands } = optionsAndOperands(c.words);
    // rm with both -r and -f (-rf, -fr, -Rf, -r -f, --recursive --force) on /, ~ or $HOME
    // itself. A path below them (~/projects/x) is not matched.
    if (
      c.program === "rm" &&
      (short.has("r") || short.has("R") || long.has("--recursive")) &&
      (short.has("f") || long.has("--force")) &&
      operands.some((o) => ROOT_OPERAND.test(o))
    ) {
      return {
        what: "recursive delete of a filesystem root",
        fix: "NEVER run rm -rf against /, ~, or $HOME. Narrow the path to the target directory.",
      };
    }
    if (
      c.program === "chmod" &&
      (short.has("R") || long.has("--recursive")) &&
      worldWritable(operands[0] || "") &&
      operands.slice(1).some((o) => SYSTEM_ROOT.test(o))
    ) {
      return {
        what: "world-writable chmod -R on the filesystem root",
        fix: "NEVER make the filesystem root world-writable.",
      };
    }
  }
  return null;
}
