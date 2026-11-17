// --- Shell detection: identical in every host's guardrails hook (bkit renders it from
// one source). Needs `fs` and `path` in scope; the host's own code above declares them. The
// git entry of `KNOWN_WRITERS` calls `parseGit` from `guardrails-deny.js`, spliced beside it.

/** Wrappers that precede the real command; skipped when finding a command's program. */
const CMD_WRAPPERS = new Set([
  "sudo",
  "env",
  "time",
  "nohup",
  "nice",
  "command",
  "exec",
  "xargs",
  "timeout",
  "stdbuf",
  "builtin",
  "noglob",
  "doas",
  "setsid",
  "busybox",
]);

/** Per program (wrappers too): the short letters and long options whose value is the next word. */
const VALUE_OPTIONS = {
  grep: [
    "ABCDdefm",
    [
      "--regexp",
      "--file",
      "--after-context",
      "--before-context",
      "--context",
      "--max-count",
      "--include",
      "--exclude",
      "--exclude-dir",
      "--label",
    ],
  ],
  rg: [
    "ABCMTefgjmrt",
    [
      "--regexp",
      "--file",
      "--glob",
      "--iglob",
      "--type",
      "--type-not",
      "--max-count",
      "--after-context",
      "--before-context",
      "--context",
      "--replace",
      "--max-depth",
      "--threads",
    ],
  ],
  ag: ["ABCGgm", ["--after", "--before", "--context", "--max-count", "--file-search-regex"]],
  sed: ["efl", ["--expression", "--file", "--line-length"]],
  awk: ["Ffv", ["--file", "--assign", "--field-separator"]],
  sort: ["kotST", ["--key", "--output", "--field-separator"]],
  cut: ["bcdf", ["--bytes", "--characters", "--delimiter", "--fields"]],
  head: ["cn", ["--bytes", "--lines"]],
  tail: ["cn", ["--bytes", "--lines"]],
  scp: ["cFiJloPS", []],
  rsync: ["e", ["--rsh"]],
  xargs: ["InPLsdEaJ", []],
  sudo: ["ughpCDRTUrt", []],
  doas: ["uC", []],
  nice: ["n", []],
  env: ["uCS", []],
  timeout: ["ks", []],
  exec: ["a", []],
  stdbuf: ["ioe", []],
};
VALUE_OPTIONS.egrep = VALUE_OPTIONS.fgrep = VALUE_OPTIONS.grep;

/** Whether option word `w` takes the next word as its value by `spec`, a `VALUE_OPTIONS` row. */
function takesValue(spec, w) {
  if (!spec || w.includes("=")) return false;
  if (w.startsWith("--")) return spec[1].includes(w);
  // The first value letter of a cluster takes the rest of the word (`-uroot`), so the next
  // word is its value only when that letter ends the cluster (`-Eu root`).
  return [...w.slice(1)].findIndex((ch) => spec[0].includes(ch)) === w.length - 2;
}

const SHELLS = new Set(["sh", "bash", "zsh", "dash", "ksh"]);

/** A word that is safe to pass to a shell unquoted. */
const PLAIN_WORD_RE = /^[A-Za-z0-9_\/.,:=+@%-]+$/;

/**
 * A host's command field as shell text: a string as is; an argv array with each element
 * shell-quoted, so `["bash", "-lc", "git push -f"]` reads its script as one word. Else null.
 */
function shellCommandText(command) {
  if (typeof command === "string") return command;
  if (!Array.isArray(command) || !command.every((w) => typeof w === "string")) return null;
  return command
    .map((w) => (PLAIN_WORD_RE.test(w) ? w : "'" + w.split("'").join("'\\''") + "'"))
    .join(" ");
}

/**
 * A shell's script source: `{ script }` for the operand of `-c`, `{ stdin: true }` when it reads
 * stdin (no operand, `-s`, `-`), or `{ operand }` for a script file. Options are read the way
 * bash reads them: every option word before the first operand, `-o` / `-O` take a value, and
 * `--` or `-` ends the options.
 */
function shellScriptSource(words) {
  let dashC = false;
  let dashS = false;
  let i = 1;
  for (; i < words.length; i++) {
    const w = words[i];
    if (w === "--" || w === "-") {
      i++;
      break;
    }
    if (!/^[-+]/.test(w)) break;
    if (w.startsWith("--")) {
      if (w === "--rcfile" || w === "--init-file") i++;
      continue;
    }
    if (w[0] === "-" && w.includes("c")) dashC = true;
    if (w[0] === "-" && w.includes("s")) dashS = true;
    if (/[oO]/.test(w)) i++;
  }
  if (dashC) return { script: words[i] };
  if (dashS || i >= words.length) return { stdin: true };
  return { operand: words[i] };
}

/** The text a command prints when it only prints literal text (`echo`, `printf`, `cat <<`), else null. */
function literalOutput(item, words) {
  const program = (words[0] || "").replace(/^.*\//, "");
  if (program === "cat" && words.length === 1) {
    if (item.heredoc) return item.heredoc.body;
    if (item.hereString !== null) return item.hereString;
    return null;
  }
  const args = words.slice(1).map((w) => w.replace(/\u0000/g, ""));
  if (program === "echo") {
    while (/^-[neE]+$/.test(args[0] || "")) args.shift();
    return args.join(" ");
  }
  if (program === "printf" && args.length > 0) {
    return args.length > 1 ? args.slice(1).join("\n") : args[0].replace(/\\n/g, "\n");
  }
  return null;
}

/** `text` cut to at most `limit` bytes of UTF-8, at the last whole character. */
function cutUtf8(text, limit) {
  const buf = Buffer.from(text, "utf8");
  if (buf.length <= limit) return text;
  let end = limit;
  // A continuation byte (10xxxxxx) at the cut belongs to a character that does not fit.
  while (end > 0 && (buf[end] & 0xc0) === 0x80) end--;
  return buf.subarray(0, end).toString("utf8");
}

/** Each `$(…)` and backtick body in an unquoted heredoc body, which the shell expands. */
function heredocSubstitutions(body) {
  const out = [];
  for (let i = 0; i < body.length; i++) {
    if (body[i] === "\\") i++;
    else if (body[i] === "$" && body[i + 1] === "(" && body[i + 2] !== "(") {
      const end = matchParen(body, i + 2);
      out.push(body.slice(i + 2, end));
      i = end;
    } else if (body[i] === "`") {
      const end = body.indexOf("`", i + 1);
      out.push(body.slice(i + 1, end < 0 ? body.length : end));
      i = end < 0 ? body.length : end;
    }
  }
  return out;
}

/**
 * The simple commands a shell text runs, quote-aware (`lexShell`): each list and pipeline
 * member, the bodies of `$(…)`, backticks, subshells and `<(…)`, the script of a `sh -c '…'`,
 * the words of `eval`, the string of `env -S`, the command of `find -exec`, a heredoc or
 * here-string fed to a shell, the literal text `echo`, `printf` or `cat <<` pipes into a shell
 * or a `<(…)` hands to a shell or `source`, and the substitutions of an unquoted heredoc,
 * to depth 3. Each is `{ program, words, prefix, redirects, stdinFile, dyn, scope }`: `words` is
 * the program and its arguments, `prefix` the assignments, wrappers and reserved words
 * stripped ahead of it (so `sudo` stays visible), `program` the first word with its path
 * stripped, `redirects` the output targets, `stdinFile` the `<` input file, `dyn` the
 * words whose value is computed (`$VAR`, `$(…)`, a glob) and `scope` the ids of the
 * subshell scopes it runs in, outermost first (a `cd` moves only its own scope). Text over
 * 256 KiB of UTF-8 is cut at the last whole character first. Quoted text and data heredoc
 * bodies are never commands. A text the parser cannot finish is judged on what was read.
 * `st` (`newEvidence`) collects the analysis limits reached, the cut included.
 */
function shellCommands(text, st = newEvidence()) {
  const out = [];
  let nextScope = 0;
  const collect = (src, depth, outer) => {
    const scope = [...outer, nextScope++];
    let prev = null;
    for (const item of lexShell(src, st, depth)) {
      if (item.kind === "open") scope.push(nextScope++);
      else if (item.kind === "close" && scope.length > outer.length + 1) scope.pop();
      if (item.kind !== "cmd") continue;
      const before = prev;
      prev = item;
      judge(item, item.words, depth, scope, before);
    }
  };
  // One simple command, then the scripts it runs: a shell's script, `eval`'s words, `env -S`'s
  // string, a `find -exec` command, and text piped or process-substituted into a shell.
  const judge = (item, rawWords, depth, scope, before) => {
    const { words, prefix } = stripCommandPrefix(rawWords);
    const program = (words[0] || "").replace(/^.*\//, "");
    out.push({
      program,
      words,
      prefix,
      redirects: item.redirects,
      stdinFile: item.stdinFile,
      dyn: [...item.dyn],
      scope: [...scope],
    });
    if (item.heredoc && !item.heredoc.quoted && depth < EVIDENCE_LIMITS.depth) {
      for (const body of heredocSubstitutions(item.heredoc.body)) collect(body, depth + 1, scope);
    }
    const scripts = [];
    const split = prefix.findIndex((w, i) => w === "-S" && prefix.slice(0, i).includes("env"));
    if (split >= 0) scripts.push([prefix[split + 1], ...words].join(" "));
    // `eval` joins its words with spaces and runs the result as a script.
    if (program === "eval")
      scripts.push(
        words
          .slice(1)
          .join(" ")
          .replace(/\u0000/g, ""),
      );
    if (program === "find") {
      for (let i = 1; i < words.length; i++) {
        if (!/^-(exec|execdir|ok|okdir)$/.test(words[i])) continue;
        let end = i + 1;
        while (end < words.length && words[end] !== ";" && words[end] !== "+") end++;
        // `{}` stands for each found path: a target the hook cannot name.
        const run = { ...item, redirects: [], stdinFile: null, heredoc: null, hereString: null };
        Object.assign(run, { piped: false, procSubs: [], dyn: new Set([...item.dyn, "{}"]) });
        judge(run, words.slice(i + 1, end), depth, scope, null);
        i = end;
      }
    }
    if (SHELLS.has(program) || program === "source" || program === ".") {
      const src = SHELLS.has(program) ? shellScriptSource(words) : { operand: words[1] };
      if (src.script !== undefined && !item.dyn.has(src.script)) scripts.push(src.script);
      else if (src.operand === "\u0000" && item.procSubs.length > 0) {
        for (const body of item.procSubs) {
          const inner = lexShell(body, st, depth + 1).filter((c) => c.kind === "cmd");
          const last = inner[inner.length - 1];
          const text = last && literalOutput(last, stripCommandPrefix(last.words).words);
          if (text) scripts.push(text);
        }
      } else if (src.stdin) {
        if (item.heredoc) scripts.push(item.heredoc.body);
        else if (item.hereString !== null) scripts.push(item.hereString);
        else if (item.piped && before) {
          const text = literalOutput(before, stripCommandPrefix(before.words).words);
          if (text) scripts.push(text);
        }
      }
    }
    if (!scripts.some(Boolean)) return;
    if (depth >= EVIDENCE_LIMITS.depth) {
      evidenceLimit(st, "depth", false);
      return;
    }
    for (const script of scripts.filter(Boolean)) collect(script, depth + 1, scope);
  };
  const cut = cutUtf8(String(text), EVIDENCE_LIMITS.commandBytes);
  if (cut.length < String(text).length) evidenceLimit(st, "command-size", false);
  collect(cut, 0, []);
  return out;
}

/**
 * True when some parsed command (`shellCommands`) INVOKES curl or wget, including inside
 * `sh -c '…'`, `$(…)`, backticks and `( … )`.
 *
 * A token that only appears as an argument (`grep -n 'curl' file`) is not a program.
 */
function usesFetch(cmds) {
  return cmds.some((c) => c.program === "curl" || c.program === "wget");
}

// --- Shell edit evidence -----------------------------------------------------
//
// Lexical evidence for "this command edits files", read only from the commands that match
// `KNOWN_WRITERS` or redirect output: ordered unique exact targets, an independent
// uncertainty set and at most one analysis limit. Nothing is executed and no file is read.

/** Source-ish extensions: a write into one of these is plausibly a file edit. */
const SOURCE_EXT_RE =
  /\.(ts|tsx|js|jsx|cjs|mjs|json|jsonl|md|sh|bash|py|rb|go|rs|java|css|scss|html|ya?ml|toml|sql)$/i;

/** Agent-read locations an edit reaches even without a source extension. */
const EVIDENCE_AGENT_READ_RE =
  /(?:^|\/)(?:\.agents|\.bkit)\/|(?:^|\/)(?:AGENTS|CLAUDE|GEMINI)\.md$/;

const EVIDENCE_LIMITS = {
  commandBytes: 256 * 1024,
  depth: 3,
  targets: 64,
  targetChars: 160,
  deadlineMs: 200,
};

/**
 * The call context a hook passes: the effective directory, the workspace root, and `dirs`,
 * the directories that locate the network allowlist, most authoritative first: the workspace
 * roots (Cursor `workspace_roots`; Antigravity `workspacePaths`, carried over by its payload
 * adapter), the payload `cwd` (Claude, Codex, Cursor), then the hook process's own cwd —
 * which on Antigravity is the plugin dir, not the repo.
 */
function hookContext(payload) {
  const p = payload && typeof payload === "object" ? payload : {};
  const roots = Array.isArray(p.workspace_roots) ? p.workspace_roots : [];
  const root = roots.find((r) => typeof r === "string" && r) || undefined;
  const cwd = typeof p.cwd === "string" && p.cwd ? p.cwd : undefined;
  const dirs = [...roots, cwd, process.cwd()].filter((d) => typeof d === "string" && d !== "");
  return { cwd, root, dirs };
}

/** This process's own CPU time in ms; scheduler contention does not inflate it. */
function cpuMs() {
  const u = process.cpuUsage();
  return (u.user + u.system) / 1000;
}

function newEvidence(ctx) {
  const cwd = path.resolve((ctx && ctx.cwd) || process.cwd());
  const root = path.resolve((ctx && ctx.root) || (ctx && ctx.cwd) || process.cwd());
  return {
    root,
    baseCwd: cwd,
    targets: [],
    seen: new Set(),
    uncertain: new Set(),
    limit: null,
    halted: false,
    startWall: Date.now(),
    startCpu: cpuMs(),
  };
}

/** Record the first limit; `halt` stops all further analysis (a prefix is kept). */
function evidenceLimit(st, reason, halt = true) {
  if (!st.limit) st.limit = reason;
  if (halt) st.halted = true;
}

function evidenceExpired(st) {
  if (st.halted) return true;
  // The deadline counts the process's own CPU time, so machine load cannot trip it;
  // a wall-clock backstop (4x) still bounds a stalled process.
  if (
    cpuMs() - st.startCpu > EVIDENCE_LIMITS.deadlineMs ||
    Date.now() - st.startWall > EVIDENCE_LIMITS.deadlineMs * 4
  ) {
    evidenceLimit(st, "deadline");
    return true;
  }
  return false;
}

function isQuietLiteral(literal) {
  return (
    /^\/(dev|tmp|var\/folders|var\/tmp)\//.test(literal) ||
    /\.(log|bak|tmp|out|err|orig)$/i.test(literal)
  );
}

function insideRoot(st, abs) {
  const rel = path.relative(st.root, abs);
  return rel !== ".." && !rel.startsWith(".." + path.sep) && !path.isAbsolute(rel);
}

/**
 * Add one literal target. `force` skips the source-extension filter (in-place editors and
 * formatters name files whatever their extension); a forced target that is a directory is
 * uncertainty. A relative target under an unresolved directory is uncertainty, never a
 * guessed path.
 */
function addEvidenceTarget(st, literal, cwd, force) {
  if (evidenceExpired(st) || !literal) return;
  if (!force && !SOURCE_EXT_RE.test(literal) && !EVIDENCE_AGENT_READ_RE.test(literal)) return;
  if (/\.(log|bak|tmp|out|err|orig)$/i.test(literal)) return;
  if (cwd === null && !path.isAbsolute(literal)) {
    st.uncertain.add("unresolved-directory");
    return;
  }
  const abs = path.resolve(cwd === null ? path.sep : cwd, literal);
  if (isQuietLiteral(literal) && !insideRoot(st, abs)) return;
  const shown = insideRoot(st, abs) ? path.relative(st.root, abs).split(path.sep).join("/") : abs;
  // A target reaches hook output: control characters, backticks, overlong names and
  // directories become uncertainty instead of text.
  if (
    shown === "" ||
    shown.length > EVIDENCE_LIMITS.targetChars ||
    (force && fs.statSync(abs, { throwIfNoEntry: false })?.isDirectory()) ||
    /[\u0000-\u001f\u007f-\u009f\u2028\u2029`]/.test(shown)
  ) {
    st.uncertain.add("unresolved-target");
    return;
  }
  if (st.seen.has(shown)) return;
  if (st.targets.length >= EVIDENCE_LIMITS.targets) {
    evidenceLimit(st, "target-count");
    return;
  }
  st.seen.add(shown);
  st.targets.push(shown);
}

/** A target word: dynamic ones are uncertain when they could name a source file. */
function addWordTarget(st, cmd, text, cwd, force) {
  if (cmd.dyn.includes(text)) {
    if (force || SOURCE_EXT_RE.test(text.replace(/\u0000/g, ""))) {
      if (!/^\$[A-Za-z_{][A-Za-z0-9_}]*$/.test(text) || force)
        st.uncertain.add("unresolved-target");
    }
    return;
  }
  addEvidenceTarget(st, text, cwd, force);
}

// --- Lexer -------------------------------------------------------------------

/** Matching `)` of a `$(` whose body starts at `from`; quotes and nesting aware. */
function matchParen(text, from) {
  let depth = 1;
  let quote = "";
  const heredocs = [];
  for (let i = from; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === "\\" && quote === '"') i++;
      else if (ch === quote) quote = "";
      continue;
    }
    if (ch === "<" && text[i + 1] === "<" && text[i + 2] !== "<" && text[i + 2] !== "(") {
      const m = /^<<(-?)[ \t]*(?:'([^'\n]*)'|"([^"\n]*)"|\\?([A-Za-z0-9_.-]+))/.exec(
        text.slice(i, i + 200),
      );
      if (m) {
        heredocs.push({ delim: m[2] ?? m[3] ?? m[4], strip: m[1] === "-" });
        i += m[0].length - 1;
        continue;
      }
    }
    if (ch === "\n" && heredocs.length > 0) {
      // Heredoc bodies are data: skip to the line holding each delimiter.
      let pos = i + 1;
      for (const h of heredocs) {
        while (pos < text.length) {
          let eol = text.indexOf("\n", pos);
          if (eol < 0) eol = text.length;
          let line = text.slice(pos, eol);
          if (h.strip) line = line.replace(/^\t+/, "");
          pos = eol + 1;
          if (line === h.delim) break;
        }
      }
      heredocs.length = 0;
      i = pos - 2;
      continue;
    }
    if (ch === "\\") i++;
    else if (ch === "'" || ch === '"') quote = ch;
    else if (ch === "(") depth++;
    else if (ch === ")" && --depth === 0) return i;
  }
  return text.length;
}

/**
 * Parse `text` into command items: `{ kind: "cmd", words, dyn, redirects, heredoc,
 * stdinFile, hereString, piped }` plus `open` / `close` scope markers around subshells and
 * substitutions. Quotes, escapes, comments, heredoc bodies and substitutions are honoured.
 */
function lexShell(text, st, depth) {
  const items = [];
  let cmd = newLexCommand();
  let cur = newLexWord();
  let pending = null;
  let pipedFromPrev = false;
  const heredocs = [];

  function newLexCommand() {
    return {
      kind: "cmd",
      words: [],
      dyn: new Set(),
      redirects: [],
      heredoc: null,
      stdinFile: null,
      hereString: null,
      piped: false,
      procSubs: [],
    };
  }
  function newLexWord() {
    return { t: "", started: false, dyn: false, quoted: false, digits: true };
  }
  function pushWord() {
    if (!cur.started) return;
    const word = cur;
    cur = newLexWord();
    if (word.dyn) cmd.dyn.add(word.t);
    if (pending) {
      const r = pending;
      pending = null;
      if (r.op === "<<") heredocs.push({ cmd, delim: word.t, quoted: word.quoted, strip: r.strip });
      else if (r.op === "<") cmd.stdinFile = word.t;
      else if (r.op === "<<<") cmd.hereString = word.t;
      else if (r.op === ">" && !r.ignore) cmd.redirects.push(word.t);
      else if (r.op === ">" && r.dup && !/^(\d+|-)$/.test(word.t)) cmd.redirects.push(word.t);
      return;
    }
    cmd.words.push(word.t);
  }
  function endCommand(pipe) {
    pushWord();
    pending = null;
    if (cmd.words.length > 0 || cmd.redirects.length > 0 || cmd.stdinFile || cmd.heredoc) {
      cmd.piped = pipedFromPrev;
      items.push(cmd);
    }
    pipedFromPrev = pipe;
    cmd = newLexCommand();
  }
  function subshell(body) {
    if (depth + 1 > EVIDENCE_LIMITS.depth) {
      // Too deep a nesting skips that body only: the commands after it are still judged.
      evidenceLimit(st, "depth", false);
      return;
    }
    items.push({ kind: "open" });
    items.push(...lexShell(body, st, depth + 1));
    items.push({ kind: "close" });
  }
  function add(ch) {
    cur.t += ch;
    cur.started = true;
    if (!/\d/.test(ch)) cur.digits = false;
  }
  function expansion(i) {
    // text[i] === "$"; returns the index of the last consumed char.
    const next = text[i + 1];
    if (next === "(") {
      const end = matchParen(text, i + 2);
      if (text[i + 2] !== "(") subshell(text.slice(i + 2, end));
      cur.dyn = true;
      cur.t += "\u0000";
      cur.started = true;
      cur.digits = false;
      return end;
    }
    if (next === "{") {
      const end = text.indexOf("}", i + 2);
      cur.dyn = true;
      cur.t += text.slice(i, end < 0 ? text.length : end + 1);
      cur.started = true;
      cur.digits = false;
      return end < 0 ? text.length : end;
    }
    if (next && /[A-Za-z0-9_@*#?!-]/.test(next)) cur.dyn = true;
    add("$");
    return i;
  }
  function backtick(i) {
    const end = text.indexOf("`", i + 1);
    subshell(text.slice(i + 1, end < 0 ? text.length : end));
    cur.dyn = true;
    cur.t += "\u0000";
    cur.started = true;
    cur.digits = false;
    return end < 0 ? text.length : end;
  }
  function readHeredocBodies(from) {
    let i = from;
    for (const h of heredocs.splice(0)) {
      const lines = [];
      while (i < text.length) {
        let eol = text.indexOf("\n", i);
        if (eol < 0) eol = text.length;
        const line = text.slice(i, eol);
        i = Math.min(eol + 1, text.length);
        if ((h.strip ? line.replace(/^\t+/, "") : line) === h.delim) break;
        lines.push(line);
      }
      h.cmd.heredoc = { body: lines.join("\n"), quoted: h.quoted };
    }
    return i;
  }

  for (let i = 0; i < text.length; i++) {
    if (i % 512 === 0 && evidenceExpired(st)) break;
    const ch = text[i];
    if (ch === "\\") {
      if (text[i + 1] === "\n") {
        i++;
        continue;
      }
      if (i + 1 < text.length) add(text[++i]);
      cur.quoted = true;
      continue;
    }
    if (ch === "'") {
      const end = text.indexOf("'", i + 1);
      cur.t += text.slice(i + 1, end < 0 ? text.length : end);
      cur.started = true;
      cur.quoted = true;
      cur.digits = false;
      i = end < 0 ? text.length : end;
      continue;
    }
    if (ch === '"') {
      cur.started = true;
      cur.quoted = true;
      cur.digits = false;
      let j = i + 1;
      for (; j < text.length && text[j] !== '"'; j++) {
        const c = text[j];
        if (c === "\\" && j + 1 < text.length) {
          const n = text[j + 1];
          if (n === "\n") j++;
          else if (/["\\$`]/.test(n)) cur.t += text[++j];
          else cur.t += c;
        } else if (c === "$") j = expansion(j);
        else if (c === "`") j = backtick(j);
        else cur.t += c;
      }
      i = j;
      continue;
    }
    if (ch === "`") {
      i = backtick(i);
      continue;
    }
    if (ch === "$") {
      i = expansion(i);
      continue;
    }
    if (ch === "#" && !cur.started) {
      const eol = text.indexOf("\n", i);
      i = eol < 0 ? text.length : eol - 1;
      continue;
    }
    if (ch === "\n") {
      endCommand(false);
      i = readHeredocBodies(i + 1) - 1;
      continue;
    }
    if (/\s/.test(ch)) {
      pushWord();
      continue;
    }
    if (ch === ";") {
      endCommand(false);
      continue;
    }
    if (ch === "&") {
      if (text[i + 1] === "&") {
        endCommand(false);
        i++;
      } else if (text[i + 1] === ">") {
        pushWord();
        pending = { op: ">", ignore: false };
        i += text[i + 2] === ">" ? 2 : 1;
      } else {
        endCommand(false);
      }
      continue;
    }
    if (ch === "|") {
      endCommand(true);
      if (text[i + 1] === "|") {
        pipedFromPrev = false;
        i++;
      } else if (text[i + 1] === "&") i++;
      continue;
    }
    if (ch === "(" || ch === ")") {
      endCommand(false);
      items.push({ kind: ch === "(" ? "open" : "close" });
      continue;
    }
    if ((ch === "<" || ch === ">") && text[i + 1] === "(") {
      // Process substitution: its body runs, and the word is a path to its output.
      const end = matchParen(text, i + 2);
      subshell(text.slice(i + 2, end));
      cmd.procSubs.push(text.slice(i + 2, end));
      cur.dyn = true;
      cur.t += "\u0000";
      cur.started = true;
      cur.digits = false;
      i = end;
      continue;
    }
    if (ch === ">" || ch === "<") {
      let fd = false;
      let stdoutFd = false;
      if (cur.started && cur.digits && !cur.quoted) {
        fd = true;
        stdoutFd = ch === ">" && cur.t === "1";
        cur = newLexWord();
      } else pushWord();
      let op = ch;
      let strip = false;
      let ignore = fd && !stdoutFd;
      let dup = false;
      let j = i + 1;
      if (ch === ">") {
        if (text[j] === ">" || text[j] === "|") j++;
        else if (text[j] === "&") {
          ignore = true;
          dup = !fd || stdoutFd;
          j++;
        }
      } else if (text[j] === "<") {
        j++;
        if (text[j] === "<") {
          op = "<<<";
          j++;
        } else {
          op = "<<";
          if (text[j] === "-") {
            strip = true;
            j++;
          }
        }
      } else if (text[j] === "&") {
        op = ">";
        ignore = true;
        j++;
      } else if (text[j] === ">") {
        j++;
      }
      i = j - 1;
      pending = { op, strip, ignore, dup };
      continue;
    }
    if (!cur.started && ch === "~") cur.dyn = true;
    if (ch === "*" || ch === "?" || ch === "[") cur.dyn = true;
    add(ch);
  }
  endCommand(false);
  readHeredocBodies(text.length);
  return items;
}

// --- Command prefix ----------------------------------------------------------

const KEYWORD_PREFIX = new Set([
  "then",
  "do",
  "else",
  "elif",
  "if",
  "while",
  "until",
  "!",
  "{",
  "}",
  "time",
]);

/**
 * Strip assignments, wrappers (with their options, the arguments those options take and
 * the `timeout` duration), reserved words and a `function NAME` head ahead of the real program. `prefix` is the
 * stripped words.
 */
function stripCommandPrefix(words) {
  let i = 0;
  while (
    i < words.length &&
    (/^[A-Za-z_][A-Za-z0-9_]*=/.test(words[i]) ||
      CMD_WRAPPERS.has(words[i]) ||
      KEYWORD_PREFIX.has(words[i]) ||
      words[i] === "function")
  ) {
    const wrapper = words[i];
    // `function NAME` heads a definition; its body is the command.
    i += wrapper === "function" ? 2 : 1;
    if (!CMD_WRAPPERS.has(wrapper)) continue;
    while (i < words.length && words[i].startsWith("-") && words[i].length > 1) {
      const opt = words[i++];
      if (opt === "--") break;
      if (takesValue(VALUE_OPTIONS[wrapper], opt)) i++;
    }
    if (wrapper === "timeout" && i < words.length) i++;
  }
  return { words: words.slice(i), prefix: words.slice(0, i) };
}

function resolveCwd(cwd, dir) {
  if (cwd === null) return path.isAbsolute(dir) ? path.resolve(dir) : null;
  return path.resolve(cwd, dir);
}

/**
 * Positional operands of `args` (a command's words after its program): non-option words and
 * everything after `--`, skipping the value of each option `spec` (`VALUE_OPTIONS`) names.
 */
function operands(args, spec) {
  const out = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--") return out.concat(args.slice(i + 1));
    if (args[i] === "-" || !args[i].startsWith("-")) out.push(args[i]);
    else if (takesValue(spec, args[i])) i++;
  }
  return out;
}

// --- Known writers -------------------------------------------------------------

/**
 * In-place operands of an editor call, or null when it does not edit in place. `flag(a)` reads
 * one option word: `"in-place"`, `"script"` (the program is an option value, so the first
 * operand is a file), `"script+1"` / `"value"` (the next word is that value) or null. Without
 * a script option the first operand is the program.
 */
function inPlaceOperands(args, flag) {
  let inPlace = false;
  let script = false;
  const pos = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--") {
      pos.push(...args.slice(i + 1));
      break;
    }
    if (!a.startsWith("-") || a === "-") {
      pos.push(a);
      continue;
    }
    const kind = flag(a, args[i + 1]);
    if (kind === "in-place") inPlace = true;
    else if (kind === "in-place+1") {
      inPlace = true;
      i++;
    } else if (kind === "script") script = true;
    else if (kind === "script+1") {
      script = true;
      i++;
    } else if (kind === "value") i++;
  }
  if (!inPlace) return null;
  if (!script) pos.shift();
  return pos;
}

/** sed / gsed: `-i[SUFFIX]` (BSD `-i ''`), `--in-place`; `-e` / `-f` supply the script. */
function sedFlag(a, next) {
  if (/^--in-place(=|$)/.test(a)) return "in-place";
  if (/^--(expression|file)=/.test(a)) return "script";
  if (a === "--expression" || a === "--file") return "script+1";
  const m = /^-[A-Za-z]*?([ief])/.exec(a);
  if (!m) return null;
  if (m[1] === "i") return a.endsWith("i") && next === "" ? "in-place+1" : "in-place";
  return a.endsWith(m[1]) ? "script+1" : "script";
}

/** perl / ruby: `-i[SUFFIX]` in a cluster (`-pi`); `-e` / `-E` supply the script. */
function perlFlag(a) {
  if (a.startsWith("--")) return null;
  for (let k = 1; k < a.length; k++) {
    const c = a[k];
    if (c === "i") return "in-place";
    if (c === "e" || c === "E") return k === a.length - 1 ? "script+1" : "script";
    // `-l` / `-0` take only octal digits; the others take the rest of the cluster.
    if (c === "l" || c === "0") k += a.slice(k + 1).match(/^[0-7]*/)[0].length;
    else if ("IMmFx".includes(c)) return null;
  }
  return null;
}

/** awk / gawk: `-i inplace`; `-f` / `-e` supply the program; `-v`, `-F` take a value. */
function awkFlag(a, next) {
  if (a === "-i") return next === "inplace" ? "in-place+1" : "value";
  if (a === "-f" || a === "-e" || a === "--file" || a === "--source") return "script+1";
  if (a === "-v" || a === "-F") return "value";
  return null;
}

/** Operands a formatter writes when one of `flags` is given; `values` take the next word. */
function fixerTargets(args, flags, values) {
  if (!args.some((a) => flags.includes(a))) return null;
  const out = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--") {
      out.push(...args.slice(i + 1));
      break;
    }
    if (!a.startsWith("-")) out.push(a);
    else if (values.has(a)) i++;
  }
  return out;
}

const PRETTIER_VALUE_OPTS = new Set([
  "--config",
  "--ignore-path",
  "--plugin",
  "--parser",
  "--log-level",
  "--cache-location",
  "--cache-strategy",
  "--stdin-filepath",
  "--print-width",
  "--tab-width",
]);
const ESLINT_VALUE_OPTS = new Set([
  "-c",
  "--config",
  "-f",
  "--format",
  "-o",
  "--output-file",
  "--ext",
  "--rule",
  "--parser",
  "--plugin",
  "--ignore-path",
  "--ignore-pattern",
  "--max-warnings",
  "--cache-location",
  "--fix-type",
]);
const YQ_VALUE_OPTS = new Set([
  "-o",
  "--output-format",
  "-p",
  "--input-format",
  "-I",
  "--indent",
  "-s",
  "--split-exp",
  "--front-matter",
]);

/** yq: `-i` / `--inplace`; files follow the expression (`yq eval -i EXPR FILE`). */
function yqTargets(args) {
  if (!args.some((a) => a === "-i" || /^--inplace(=|$)/.test(a))) return null;
  const rest = ["e", "eval", "ea", "eval-all"].includes(args[0]) ? args.slice(1) : args;
  let expression = false;
  const pos = [];
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i];
    if (a === "--expression") {
      expression = true;
      i++;
    } else if (a.startsWith("--expression=")) expression = true;
    else if (!a.startsWith("-")) pos.push(a);
    else if (YQ_VALUE_OPTS.has(a)) i++;
  }
  if (!expression) pos.shift();
  return pos;
}

/** cp / mv: the target is an option value (`-t DIR`) the table does not name. */
function hasTargetDir(args) {
  return args.some((a) => a === "-t" || a.startsWith("--target-directory"));
}

/** git: `apply` (its files are in the patch body) and `checkout -- <file>`, via `parseGit`. */
function gitTargets(args, words) {
  const g = parseGit(words);
  if (!g) return null;
  if (g.sub === "apply") {
    const report = ["--check", "--stat", "--numstat", "--summary"].some((o) => g.long.has(o));
    return report && !g.long.has("--apply") ? null : "patch-body";
  }
  if (g.sub !== "checkout") return null;
  const end = words.indexOf("--");
  return end > 0 ? words.slice(end + 1) : null;
}

/**
 * The commands known to write files: the only ones the "may edit files" advice names. bkit
 * owns the list; it is not extensible. Each entry is keyed by program and gives `form`, the
 * flag or form that makes it write, and `read(args, words)`, which returns the target words,
 * null when this call writes nothing, or a reason code when the targets are not on the command
 * line. `force` names a target whatever its extension; otherwise only source and agent-read
 * files count, so `cp a.png b.png` and `tee out.txt` stay quiet. The `>` and `>>` redirects
 * of any command are writers too (`shellEditTargets`). Every other command is silent: script
 * runners (`node`, `python3`) are never read. `prettier` and `eslint` are also matched behind
 * `npx`, `pnpm exec`, `pnpm dlx`, `yarn` and `bunx` (`unwrapRunner`).
 */
const KNOWN_WRITERS = {
  sed: { form: "-i", force: true, read: (args) => inPlaceOperands(args, sedFlag) },
  gsed: { form: "-i", force: true, read: (args) => inPlaceOperands(args, sedFlag) },
  perl: { form: "-i", force: true, read: (args) => inPlaceOperands(args, perlFlag) },
  ruby: { form: "-i", force: true, read: (args) => inPlaceOperands(args, perlFlag) },
  awk: { form: "-i inplace", force: true, read: (args) => inPlaceOperands(args, awkFlag) },
  gawk: { form: "-i inplace", force: true, read: (args) => inPlaceOperands(args, awkFlag) },
  tee: { form: "its file operands", force: false, read: (args) => operands(args) },
  cp: {
    form: "its last operand",
    force: false,
    read: (args) => {
      if (hasTargetDir(args)) return "unresolved-target";
      const ops = operands(args);
      return ops.length > 1 ? ops.slice(-1) : null;
    },
  },
  mv: {
    form: "both operands",
    force: false,
    read: (args) =>
      hasTargetDir(args) ? "unresolved-target" : operands(args).length > 1 ? operands(args) : null,
  },
  patch: {
    form: "any call but a dry run",
    read: (args) => (args.some((a) => /^(--dry-run|--check|-C)$/.test(a)) ? null : "patch-body"),
  },
  git: { form: "apply, checkout -- <file>", force: true, read: gitTargets },
  prettier: {
    form: "--write or -w",
    force: true,
    read: (args) => fixerTargets(args, ["--write", "-w"], PRETTIER_VALUE_OPTS),
  },
  eslint: {
    form: "--fix",
    force: true,
    read: (args) => fixerTargets(args, ["--fix"], ESLINT_VALUE_OPTS),
  },
  yq: { form: "-i or --inplace", force: true, read: yqTargets },
  dd: {
    form: "of=FILE",
    force: false,
    read: (args) => {
      const out = args.filter((a) => a.startsWith("of=")).map((a) => a.slice(3));
      return out.length > 0 ? out : null;
    },
  },
};

/** The tool a package runner starts (`npx -y prettier@3 …` -> `prettier …`), else `words`. */
function unwrapRunner(words) {
  const p = (words[0] || "").replace(/^.*\//, "");
  let rest;
  if (p === "npx" || p === "bunx") rest = words.slice(1);
  else if (p === "pnpm" && (words[1] === "exec" || words[1] === "dlx")) rest = words.slice(2);
  else if (p === "yarn")
    rest = ["exec", "dlx"].includes(words[1]) ? words.slice(2) : words.slice(1);
  else return words;
  let i = 0;
  while (i < rest.length && rest[i].startsWith("-")) i += /^(-p|--package)$/.test(rest[i]) ? 2 : 1;
  rest = rest.slice(i);
  return rest.length > 0 ? [rest[0].replace(/(.)@[^/]*$/, "$1"), ...rest.slice(1)] : rest;
}

/** Record what one parsed command writes, from its redirects and `KNOWN_WRITERS`. */
function addCommandEdits(st, c, cwd) {
  for (const t of c.redirects) if (!t.startsWith("&")) addWordTarget(st, c, t, cwd, false);
  const words = unwrapRunner(c.words);
  const program = (words[0] || "").replace(/^.*\//, "");
  if (!Object.hasOwn(KNOWN_WRITERS, program) || c.dyn.includes(words[0])) return;
  const writer = KNOWN_WRITERS[program];
  const hit = writer.read(words.slice(1), words);
  if (hit === null) return;
  // A reason code, or operands `xargs` extends from its input: no file can be named.
  if (typeof hit === "string") st.uncertain.add(hit);
  else if (c.prefix.some((w) => w.replace(/^.*\//, "") === "xargs"))
    st.uncertain.add("unresolved-target");
  else for (const w of hit) addWordTarget(st, c, w, cwd, writer.force);
}

const EVIDENCE_REASONS = {
  "unresolved-directory": "the working directory is not a literal path",
  "unresolved-target": "a target path is computed, not literal, or a directory",
  "patch-body": "a patch names its files in its body, which is not read",
};
const LIMIT_REASONS = {
  "command-size": "the command is longer than 256 KiB",
  depth: "nesting is deeper than 3 levels",
  "target-count": "more than 64 targets",
  deadline: "analysis took longer than 200 ms",
};

/**
 * Edit evidence for a shell command: `{ targets, uncertain, limit }`. Each parsed command
 * in `cmds` is matched against its redirects and `KNOWN_WRITERS`; nothing else counts.
 * `targets` are ordered unique paths (workspace-relative where inside it), `uncertain` lists
 * reason codes for writes whose targets cannot be named, and `limit` is the first analysis
 * limit reached (the targets found before it are kept). A literal `cd` moves the directory
 * relative targets resolve against, within its own subshell scope. A command that matches no
 * writer returns empty `targets` and `uncertain` and a null `limit`.
 *
 * Quiet on `> /dev/null`, `>> "$GITHUB_ENV"`, `mktemp` handoff files and log capture.
 * `st` is the `newEvidence(ctx)` state `shellCommands` filled while it parsed `cmds`.
 */
function shellEditTargets(cmds, st) {
  // The directory of each scope: a scope starts in its parent's directory.
  const cwds = new Map();
  for (const c of cmds) {
    if (evidenceExpired(st)) break;
    let cwd = st.baseCwd;
    for (const id of c.scope) {
      if (cwds.has(id)) cwd = cwds.get(id);
      else cwds.set(id, cwd);
    }
    if (c.program === "cd" || c.program === "pushd" || c.program === "popd") {
      const arg = c.program === "popd" ? undefined : operands(c.words.slice(1))[0];
      const known = arg !== undefined && arg !== "-" && !c.dyn.includes(arg);
      cwds.set(c.scope[c.scope.length - 1], known ? resolveCwd(cwd, arg) : null);
    }
    addCommandEdits(st, c, cwd);
  }
  return { targets: st.targets, uncertain: [...st.uncertain], limit: st.limit };
}

/** True when the evidence has anything to report. */
function hasEditEvidence(ev) {
  return Boolean(ev) && (ev.targets.length > 0 || ev.uncertain.length > 0 || Boolean(ev.limit));
}

/** Shared advisory string, identical on every host. */
function shellEditAdvisory(ev) {
  const named = ev.targets.length > 0;
  // The introduction counts against the host's response budget, so it names only as many
  // targets as fit a fixed character cap; the per-file blocks carry the full list.
  const shown = [];
  let used = 0;
  for (const t of ev.targets) {
    if (shown.length > 0 && used + JSON.stringify(t).length > 200) break;
    shown.push(JSON.stringify(t));
    used += JSON.stringify(t).length + 2;
  }
  const more = ev.targets.length - shown.length;
  const lines = [
    named
      ? `bkit guardrails: this command edits files through the shell (targets: ${shown.join(", ")}${more > 0 ? ` and ${more} more` : ""}). The command is allowed.`
      : "bkit guardrails: this command may edit files through the shell. The command is allowed.",
    "Pre-edit gates see only the edit and write tools, so a shell edit gets past every one of them.",
  ];
  if (ev.uncertain.length > 0) {
    lines.push(
      `Some targets cannot be determined (${ev.uncertain.map((r) => EVIDENCE_REASONS[r] || r).join("; ")}). The authoring rules in .bkit/authoring.md still apply to every file this command may write.`,
    );
  }
  if (ev.limit) {
    lines.push(
      `Analysis limit reached (${LIMIT_REASONS[ev.limit] || ev.limit}); the targets listed were found before it, and later ones were not examined.`,
    );
  }
  lines.push(
    "Use the edit or write tool instead.",
    "If this is one of the exceptions in .agents/rules.md (generating files from a script, a bulk mechanical rewrite, or appending a log line to your own step output file with `>>`), proceed.",
  );
  return lines.join("\n");
}

/** Repo-relative path of the install-written network allowlist every host's hook reads. */
const NETWORK_ALLOWLIST_FILE = path.join(".bkit", "allowlist.json");

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
 * directories (`hookContext`). There is NO hardcoded fallback list: absent or unreadable,
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
 * The HOST of every `http(s)://…` URL in the words of the parsed curl / wget commands
 * (`usesFetch`); a URL in another command or inside its quoted text is not fetched.
 *
 * Strict: only an explicit scheme counts; a scheme-less token (`./deploy.sh`,
 * `pkg.json`) is never read as a URL.
 */
function extractUrlHosts(cmds) {
  const hosts = [];
  const words = cmds.filter((c) => usesFetch([c])).flatMap((c) => c.words);
  for (const m of words.join(" ").matchAll(/\bhttps?:\/\/([^\s"'`\\|;&<>()]+)/gi)) {
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
 * True when EVERY URL the parsed commands fetch targets an allowlisted host.
 *
 * Only each URL's host is consulted, never the rest of the command (query params,
 * headers). No parseable URL, or any host off the list → false. `dirs` locate the
 * allowlist (`hookContext`).
 */
function curlWgetHostAllowed(cmds, dirs) {
  const hosts = extractUrlHosts(cmds);
  if (hosts.length === 0) return false;
  const bases = loadNetworkAllowlistBases(dirs);
  return hosts.every((h) => [...bases].some((b) => hostMatchesBase(h, b)));
}
