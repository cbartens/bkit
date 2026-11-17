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
  const ops = operands(c.words.slice(1));
  if (c.program === "brew" && ops[0] === "install") return "brew install";
  if (["pnpm", "npm", "bun"].includes(c.program) && ops[0] === "publish") return "package publish";
  if (c.program === "gh") {
    const sub = `${ops[0] || ""} ${ops[1] || ""}`;
    if (sub === "repo delete" || sub === "pr close" || sub === "release delete") return `gh ${sub}`;
  }
  return isTestsJump(c.words) ? "bkit tests jump" : null;
}

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
 * `"key"` for a private-key file (`mayNameKeyFile`), `"env"` for an env / secrets file
 * (`.env`, `.env.*` except `.env.example`), else null. `/` or `\` separated.
 */
function secretFileKind(filePath) {
  const p = String(filePath || "").replace(/\\/g, "/");
  if (!p) return null;
  if (mayNameKeyFile(p)) return "key";
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
/** Programs whose first positional is a filter expression, never a file (`jq .key f.json`). */
const FILTER_HEADS = new Set(["jq", "yq"]);

/** Whether a grep / sed / awk invocation takes its pattern or script from an option. */
function patternFromOption(words) {
  return words.some((w) => /^-[a-zA-Z]*[ef]/.test(w) || /^--(?:regexp|expression|file)\b/.test(w));
}

/**
 * The first secret file the parsed commands read (`cat .bkit/.env`, `grep KEY .env.local`,
 * `source .env`, `curl -d @.env ...`, `wc -l < .env`), else null. Not reads: a redirect
 * target (`> .env`), a copy destination, a grep pattern (`grep -rn ".env" docs`), a `jq` /
 * `yq` filter, and anything `NON_READING_HEADS` runs.
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
    // The pattern or filter is the first operand, past option values (`grep -A 2 PATTERN`).
    if (FILTER_HEADS.has(head) || (PATTERN_HEADS.has(head) && !patternFromOption(words))) {
      skip.add(words.indexOf(operands(words.slice(1), VALUE_OPTIONS[head])[0], 1));
    }
    for (let i = 1; i < words.length; i++) {
      if (skip.has(i)) continue;
      // Then the whole word: a `{a,b}` glob holds a comma.
      for (const part of [...words[i].split(/[=:@,]/), words[i]]) {
        if (secretFileKind(part)) return part;
      }
    }
  }
  return null;
}

/** A private-key file: `id_rsa`, `id_dsa`, `id_ecdsa`, `id_ed25519` (not `*.pub`), `*.pem`, `*.p12`, `*.pfx`, `*.key`. */
const PRIVATE_KEY_RE = /(?:^|\/)id_(?:rsa|dsa|ecdsa|ed25519)(?:_sk)?$|\.(?:pem|p12|pfx|key)$/i;
/** Programs that print the content of the files they are given. */
const CONTENT_READERS = new Set(
  "cat tac nl head tail less more bat base64 base32 xxd od hexdump strings cut sort uniq fold rev paste column diff grep egrep fgrep rg ag sed awk".split(
    " ",
  ),
);
/** `openssl` subcommands that print the private key they read, unless told to print none. */
const OPENSSL_KEY_PRINTERS = new Set(["rsa", "dsa", "ec", "pkey", "pkcs8", "pkcs12", "storeutl"]);
/** `openssl` subcommands that print an encoding of whatever file they read with `-in`. */
const OPENSSL_ENCODERS = new Set(["base64", "enc", "asn1parse"]);
/** Names a key-file glob is tried against, and plain names a narrow glob must not match. */
const KEY_NAME_SAMPLES = ["id_rsa", "id_dsa", "id_ecdsa", "id_ed25519", "id_ed25519_sk"].concat(
  ["pem", "p12", "pfx", "key"].map((ext) => "k." + ext),
);
const PLAIN_NAME_SAMPLES = ["k", "k.txt"];

/** The regex source for one shell glob: `*`, `?`, `[...]` and `{a,b}`. */
function globSource(glob) {
  let re = "";
  for (let i = 0; i < glob.length; i++) {
    const ch = glob[i];
    const close = ch === "[" ? glob.indexOf("]", i + 2) : ch === "{" ? glob.indexOf("}", i) : -1;
    if (ch === "*") re += ".*";
    else if (ch === "?") re += ".";
    else if (ch === "[" && close > 0) re += "[" + glob.slice(i + 1, close).replace(/^!/, "^") + "]";
    else if (ch === "{" && close > 0) {
      re +=
        "(?:" +
        glob
          .slice(i + 1, close)
          .split(",")
          .map(globSource)
          .join("|") +
        ")";
    } else re += ch.replace(/[.*+?^$()|[\]\\{}]/g, "\\$&");
    if (close > 0 && (ch === "[" || ch === "{")) i = close;
  }
  return re;
}

/**
 * Whether a file word names a private-key file, or is a glob that can match one: a glob
 * under a `.ssh/` folder that can match a key name (`~/.ssh/*`, not `~/.ssh/*.pub`), or one
 * that can match a key name and no plain name (`*.pem`, `id_rs?`, `id_{rsa,dsa}`, not `*`).
 */
function mayNameKeyFile(word) {
  const p = String(word || "").replace(/\\/g, "/");
  if (PRIVATE_KEY_RE.test(p)) return true;
  if (!/[*?[{]/.test(p)) return false;
  const base = new RegExp("^" + globSource(p.split("/").pop()) + "$", "i");
  if (!KEY_NAME_SAMPLES.some((n) => base.test(n))) return false;
  return /(?:^|\/)\.ssh\//.test(p) || !PLAIN_NAME_SAMPLES.some((n) => base.test(n));
}

/** Options that upload the file named by their value (`curl -T`, `wget --post-file`). */
const UPLOAD_OPTIONS = new Set(["-T", "--upload-file", "--post-file", "--body-file"]);

/**
 * The key file one parsed command sends off the machine, else null: an `@file` word of any
 * program (`curl -d @key.pem`, `-F f=@key.pem`), a curl / wget upload option's value, or a
 * local source operand of `scp` / `rsync` whose destination is `host:...`.
 */
function keySentBy(c) {
  const words = c.words;
  for (let i = 1; i < words.length; i++) {
    const at = /(?:^-[A-Za-z]|^|=)@([^;]+)/.exec(words[i]);
    if (at && mayNameKeyFile(at[1])) return at[1];
    const eq = words[i].startsWith("--") ? words[i].indexOf("=") : -1;
    const [name, value] =
      eq > 0 ? [words[i].slice(0, eq), words[i].slice(eq + 1)] : [words[i], words[i + 1]];
    const uploads = (c.program === "curl" || c.program === "wget") && UPLOAD_OPTIONS.has(name);
    if (uploads && mayNameKeyFile(value)) return value;
  }
  if (c.program !== "scp" && c.program !== "rsync") return null;
  const remote = (w) => /^[^/]*:/.test(w);
  const ops = operands(words.slice(1), VALUE_OPTIONS[c.program]);
  if (ops.length < 2 || !remote(ops.at(-1))) return null;
  return ops.slice(0, -1).find((w) => !remote(w) && mayNameKeyFile(w)) || null;
}

/**
 * The key file one parsed `git` or `openssl` command prints, else null: `git show` /
 * `git cat-file` of `rev:path`, `git diff --no-index`, an `openssl` encoder's `-in` file, or
 * a key printer's input unless it prints only the public key or nothing (`-pubout`,
 * `-noout`, `pkcs12 -nokeys`, each without `-text`).
 */
function keyPrintedByTool(c) {
  const words = c.words;
  const g = parseGit(words);
  if (g && (g.sub === "show" || g.sub === "cat-file")) {
    const file = g.args.map((a) => a.slice(a.indexOf(":") + 1 || a.length)).find(mayNameKeyFile);
    return file || null;
  }
  if (g)
    return g.sub === "diff" && g.long.has("--no-index")
      ? g.args.find(mayNameKeyFile) || null
      : null;
  if (c.program !== "openssl") return null;
  const sub = words[1];
  const inAt = words.findIndex((w) => w === "-in" || w.startsWith("-in="));
  const named =
    inAt < 0 ? null : words[inAt].startsWith("-in=") ? words[inAt].slice(4) : words[inAt + 1];
  const input = sub === "storeutl" ? words.at(-1) : named;
  if (!mayNameKeyFile(input)) return null;
  if (OPENSSL_ENCODERS.has(sub)) return input;
  if (!OPENSSL_KEY_PRINTERS.has(sub)) return null;
  const has = (o) => words.includes(o);
  const quiet = has("-pubout") || has("-noout") || (sub === "pkcs12" && has("-nokeys"));
  return quiet && !has("-text") ? null : input;
}

/**
 * The key file one parsed content reader prints, else null: an operand of `cat`, `head`,
 * `grep` and the like (after a grep / sed / awk pattern unless an option supplies it, and
 * skipping option values such as `grep -A 2`), or `dd if=`. An in-place `sed -i` prints
 * nothing.
 */
function keyPrintedByReader(c) {
  const words = c.words;
  if (c.program === "dd") {
    const input = (words.find((w) => w.startsWith("if=")) || "").slice(3);
    return mayNameKeyFile(input) ? input : null;
  }
  if (!CONTENT_READERS.has(c.program)) return null;
  if (c.program === "sed" && words.some((w) => /^-[a-zA-Z]*i|^--in-place/.test(w))) return null;
  const ops = operands(words.slice(1), VALUE_OPTIONS[c.program]);
  const scripted = PATTERN_HEADS.has(c.program) || c.program === "sed" || c.program === "awk";
  const files = scripted && !patternFromOption(words) ? ops.slice(1) : ops;
  return files.find(mayNameKeyFile) || null;
}

/**
 * The private-key file whose content one of the parsed commands exposes, else null:
 * printed (a reader, a `<` input file, `git show`, `dd`, a key-printing `openssl`
 * subcommand) or sent off the machine (`curl -d @key`, `scp key host:`). A key passed to
 * a program that only uses it (`ssh -i`, `curl --cacert`, `openssl x509 -in`), a write
 * destination (`-out`, `-keyout`, `ssh-keygen -f`) and a word that only names it
 * (`git rm`, `git commit -m`, `ls`) does not expose it.
 */
function privateKeyContentRead(cmds) {
  for (const c of cmds) {
    if (mayNameKeyFile(c.stdinFile)) return c.stdinFile;
    const key = keySentBy(c) || keyPrintedByTool(c) || keyPrintedByReader(c);
    if (key) return key;
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
 * `shellEditTargets`. `host` is the hook's host (`codex` cannot prompt); `ctx` is the call's
 * `{ cwd, root, dirs }` (`hookContext`).
 */
function classifyShell(c, host, ctx) {
  if (!c) return null;
  const st = newEvidence(ctx);
  const cmds = shellCommands(c, st);
  const denied = denyRule(cmds);
  if (denied) return { tier: "deny", ...denied };
  if (host === "codex" && testsJump(cmds)) {
    return {
      tier: "deny",
      what: "bkit tests jump",
      fix: "Every bkit tests jump needs the human's approval and Codex cannot ask. Ask the human to run it in their own terminal.",
    };
  }
  // Codex cannot prompt, so a command that exposes a private key's content (prints it or
  // sends it off the machine) is denied there whatever tier would win; a command that uses,
  // writes or only names a key file keeps the advisory.
  const keyRead = host === "codex" ? privateKeyContentRead(cmds) : null;
  if (keyRead) {
    return {
      tier: "deny",
      what: `a command that exposes the content of ${keyRead}, a private-key file`,
      fix: "NEVER read or send private keys through the shell. Ask the user to run the step that needs the key.",
    };
  }
  const what = askRule(cmds);
  if (what) return { tier: "ask", what };
  const secret = shellSecretRead(cmds);
  if (secret) return { tier: "secret", path: secret };
  const offList = usesFetch(cmds) && !curlWgetHostAllowed(cmds, ctx.dirs);
  const edits = shellEditTargets(cmds, st);
  const found = hasEditEvidence(edits);
  if (offList) return found ? { tier: "fetch", edits } : { tier: "fetch" };
  return found ? { tier: "edit", edits } : null;
}
