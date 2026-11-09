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

// --- Shell edit evidence -----------------------------------------------------
//
// Lexical evidence for "this command edits files": ordered unique exact targets, an
// independent uncertainty set and at most one analysis limit. Nothing is executed. Files
// named directly (a patch, a script) are read through bounded descriptors.

/** Source-ish extensions: a write into one of these is plausibly a file edit. */
const SOURCE_EXT_RE =
  /\.(ts|tsx|js|jsx|cjs|mjs|json|jsonl|md|sh|bash|py|rb|go|rs|java|css|scss|html|ya?ml|toml|sql)$/i;

/** Agent-read locations an edit reaches even without a source extension. */
const EVIDENCE_AGENT_READ_RE =
  /(?:^|\/)(?:\.agents|\.bkit)\/|(?:^|\/)(?:AGENTS|CLAUDE|GEMINI)\.md$/;

const EVIDENCE_LIMITS = {
  commandBytes: 256 * 1024,
  sourceBytes: 64 * 1024,
  depth: 3,
  targets: 64,
  deadlineMs: 200,
};

/** The call context a hook passes: effective directory and the workspace root. */
function hookContext(payload) {
  const p = payload && typeof payload === "object" ? payload : {};
  const roots = Array.isArray(p.workspace_roots) ? p.workspace_roots : [];
  const root = roots.find((r) => typeof r === "string" && r) || undefined;
  const cwd = typeof p.cwd === "string" && p.cwd ? p.cwd : undefined;
  return { cwd, root };
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
    commands: 0,
    deadline: Date.now() + EVIDENCE_LIMITS.deadlineMs,
  };
}

/** Record the first limit; `halt` stops all further analysis (a prefix is kept). */
function evidenceLimit(st, reason, halt = true) {
  if (!st.limit) st.limit = reason;
  if (halt) st.halted = true;
}

function evidenceExpired(st) {
  if (st.halted) return true;
  if (Date.now() > st.deadline) {
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
 * Add one literal target. `force` skips the source-extension filter (in-place editors,
 * patches and scripts name files whatever their extension). A relative target under an
 * unresolved directory is uncertainty, never a guessed path.
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
  if (cmd.dyn.has(text)) {
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
  for (let i = from; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === "\\" && quote === '"') i++;
      else if (ch === quote) quote = "";
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
      evidenceLimit(st, "depth");
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
  function expansion(i, inDouble) {
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
        } else if (c === "$") j = expansion(j, true);
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
      i = expansion(i, false);
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
        pending = { op: ">", ignore: true };
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
    if (ch === ">" || ch === "<") {
      let fd = false;
      if (cur.started && cur.digits && !cur.quoted) {
        fd = true;
        cur = newLexWord();
      } else pushWord();
      let op = ch;
      let strip = false;
      let ignore = fd;
      let j = i + 1;
      if (ch === ">") {
        if (text[j] === ">" || text[j] === "|") j++;
        else if (text[j] === "&") {
          ignore = true;
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
      pending = { op, strip, ignore };
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

// --- Evaluation --------------------------------------------------------------

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

/** Strip assignments, wrappers and reserved words ahead of the real program. */
function stripCommandPrefix(words) {
  let i = 0;
  let viaXargs = false;
  while (
    i < words.length &&
    (/^[A-Za-z_][A-Za-z0-9_]*=/.test(words[i]) ||
      CMD_WRAPPERS.has(words[i]) ||
      KEYWORD_PREFIX.has(words[i]))
  ) {
    if (words[i] === "xargs") viaXargs = true;
    i++;
  }
  return { words: words.slice(i), viaXargs };
}

function resolveCwd(cwd, dir) {
  if (cwd === null) return path.isAbsolute(dir) ? path.resolve(dir) : null;
  return path.resolve(cwd, dir);
}

function evalItems(items, st, depth, cwdIn) {
  let cwd = cwdIn;
  const stack = [];
  for (const it of items) {
    if (evidenceExpired(st)) return;
    if (it.kind === "open") stack.push(cwd);
    else if (it.kind === "close") cwd = stack.length > 0 ? stack.pop() : cwd;
    else {
      cwd = evalCommand(it, st, depth, cwd);
      st.commands += 1;
    }
  }
}

/** Positional operands of a simple tool: non-option words (everything after `--`). */
function operands(args) {
  const out = [];
  let rest = false;
  for (const a of args) {
    if (rest || a === "-" || !a.startsWith("-")) out.push(a);
    else if (a === "--") rest = true;
  }
  return out;
}

/** `-i` in-place file operands of a sed invocation, or null when it is not in place. */
function sedFiles(args) {
  let inPlace = false;
  let hasScript = false;
  const pos = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--") {
      pos.push(...args.slice(i + 1));
      break;
    }
    if (a.startsWith("--")) {
      if (a === "--in-place" || a.startsWith("--in-place=")) inPlace = true;
      else if (a === "--expression" || a === "--file") {
        hasScript = true;
        i++;
      } else if (a.startsWith("--expression=") || a.startsWith("--file=")) hasScript = true;
      continue;
    }
    if (a.startsWith("-") && a.length > 1) {
      for (let k = 1; k < a.length; k++) {
        const c = a[k];
        if (c === "i") {
          inPlace = true;
          break;
        }
        if (c === "e" || c === "f") {
          hasScript = true;
          if (k === a.length - 1) i++;
          break;
        }
      }
      if (a.endsWith("i") && args[i + 1] === "") i++;
      continue;
    }
    pos.push(a);
  }
  if (!inPlace) return null;
  if (!hasScript) pos.shift();
  return pos;
}

/** `-i` in-place file operands of a perl or ruby invocation, or null. */
function perlRubyFiles(args) {
  let inPlace = false;
  let hasScript = false;
  const pos = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--") {
      pos.push(...args.slice(i + 1));
      break;
    }
    if (a.startsWith("-") && a.length > 1 && !a.startsWith("--")) {
      for (let k = 1; k < a.length; k++) {
        const c = a[k];
        if (c === "i") {
          inPlace = true;
          break;
        }
        if (c === "e" || c === "E") {
          hasScript = true;
          if (k === a.length - 1) i++;
          break;
        }
        if ("IMmFlx0".includes(c)) break;
      }
      continue;
    }
    if (a.startsWith("--")) continue;
    pos.push(a);
  }
  if (!inPlace) return null;
  if (!hasScript) pos.shift();
  return pos;
}

/** `-i inplace` file operands of an awk invocation, or null. */
function awkFiles(args) {
  let inPlace = false;
  let hasProgram = false;
  const pos = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "-i" && args[i + 1] === "inplace") {
      inPlace = true;
      i++;
    } else if (a === "-f" || a === "--file") {
      hasProgram = true;
      i++;
    } else if (a === "-v" || a === "-F" || a === "-e") i++;
    else if (a.startsWith("-") && a.length > 1) continue;
    else pos.push(a);
  }
  if (!inPlace) return null;
  if (!hasProgram) pos.shift();
  return pos;
}

function evalCommand(cmd, st, depth, cwd) {
  const { words, viaXargs } = stripCommandPrefix(cmd.words);
  for (const target of cmd.redirects) {
    if (cmd.dyn.has(target)) {
      if (
        SOURCE_EXT_RE.test(target.replace(/\u0000/g, "")) &&
        !/^\$[A-Za-z_{][A-Za-z0-9_}]*$/.test(target)
      ) {
        st.uncertain.add("unresolved-target");
      }
    } else if (!target.startsWith("&")) addEvidenceTarget(st, target, cwd, false);
  }
  if (words.length === 0) return cwd;
  const program = words[0].replace(/^.*\//, "");
  const args = words.slice(1);
  const inPlaceTargets = (files) => {
    for (const f of files) addWordTarget(st, cmd, f, cwd, true);
    if (viaXargs) st.uncertain.add("unknown-stdin");
  };

  if (cmd.dyn.has(words[0])) return cwd;
  switch (program) {
    case "cd": {
      const arg = operands(args)[0];
      if (!arg || arg === "-" || cmd.dyn.has(arg)) return null;
      return resolveCwd(cwd, arg);
    }
    case "pushd":
    case "popd":
      return null;
    case "tee":
      for (const f of operands(args)) addWordTarget(st, cmd, f, cwd, false);
      return cwd;
    case "sed": {
      const files = sedFiles(args);
      if (files) inPlaceTargets(files);
      return cwd;
    }
    case "perl":
    case "ruby": {
      const files = perlRubyFiles(args);
      if (files) inPlaceTargets(files);
      return cwd;
    }
    case "awk":
    case "gawk": {
      const files = awkFiles(args);
      if (files) inPlaceTargets(files);
      return cwd;
    }
    case "cp": {
      const ops = operands(args);
      if (
        args.some((a) => /^-[a-zA-Z]*[rRa]/.test(a) || a === "--recursive" || a === "--archive")
      ) {
        st.uncertain.add("unresolved-target");
      }
      if (args.some((a) => a === "-t" || a.startsWith("--target-directory"))) {
        st.uncertain.add("unresolved-target");
      } else if (ops.length > 1) addWordTarget(st, cmd, ops[ops.length - 1], cwd, false);
      return cwd;
    }
    case "mv": {
      for (const f of operands(args)) addWordTarget(st, cmd, f, cwd, false);
      return cwd;
    }
    case "bash":
    case "sh":
    case "zsh":
    case "dash":
    case "ksh": {
      const c = args.findIndex((w) => /^-[a-z]*c$/.test(w));
      if (c < 0 || args[c + 1] === undefined) return cwd;
      const script = args[c + 1];
      if (cmd.dyn.has(script)) {
        st.uncertain.add("unknown-script-effect");
        return cwd;
      }
      if (depth + 1 > EVIDENCE_LIMITS.depth) {
        evidenceLimit(st, "depth");
        return cwd;
      }
      evalItems(lexShell(script, st, depth + 1), st, depth + 1, cwd);
      return cwd;
    }
    case "git":
      if (args[0] === "apply") evalPatch(cmd, st, "git", args.slice(1), cwd);
      return cwd;
    case "patch":
      evalPatch(cmd, st, "patch", args, cwd);
      return cwd;
    case "python":
    case "python3":
    case "node":
    case "nodejs":
      evalInterpreter(cmd, st, program.startsWith("python") ? "python" : "js", args, cwd);
      return cwd;
    default:
      if (/\//.test(words[0]) && /\.(py|js|mjs|cjs)$/.test(words[0])) {
        evalInterpreter(
          cmd,
          st,
          /\.py$/.test(words[0]) ? "python" : "js",
          [words[0], ...args],
          cwd,
        );
      }
      return cwd;
  }
}

// --- Bounded source reads ----------------------------------------------------

/** Text of a directly named regular file, or null with uncertainty / a limit recorded. */
function readBoundedSource(st, file, cwd) {
  if (cwd === null && !path.isAbsolute(file)) {
    st.uncertain.add("unresolved-directory");
    return null;
  }
  const max = EVIDENCE_LIMITS.sourceBytes;
  try {
    const abs = path.resolve(cwd === null ? path.sep : cwd, file);
    const before = fs.lstatSync(abs);
    if (!before.isFile()) {
      st.uncertain.add("unavailable-source");
      return null;
    }
    const fd = fs.openSync(
      abs,
      fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0) | (fs.constants.O_NONBLOCK || 0),
    );
    try {
      const after = fs.fstatSync(fd);
      if (!after.isFile() || after.ino !== before.ino || after.dev !== before.dev) {
        st.uncertain.add("unavailable-source");
        return null;
      }
      const buf = Buffer.alloc(max + 1);
      const n = fs.readSync(fd, buf, 0, max + 1, 0);
      if (n > max) {
        evidenceLimit(st, "source-size");
        return null;
      }
      return buf.toString("utf8", 0, n);
    } finally {
      fs.closeSync(fd);
    }
  } catch (err) {
    // A file that does not exist yet, named after an earlier command of the same line, is
    // that command's output (`pnpm build && node dist/x.js`): nothing to inspect, not unknown.
    if (!(err && err.code === "ENOENT" && st.commands > 0)) st.uncertain.add("unavailable-source");
    return null;
  }
}

/** The text a command reads on stdin when it is known, else null (uncertainty recorded). */
function knownStdin(cmd, st, cwd) {
  if (cmd.heredoc) return cmd.heredoc.body;
  if (cmd.hereString !== null) return cmd.hereString;
  if (cmd.stdinFile) return readBoundedSource(st, cmd.stdinFile, cwd);
  if (cmd.piped) st.uncertain.add("unknown-stdin");
  return null;
}

// --- Patches -----------------------------------------------------------------

function stripPatchPath(p, n) {
  if (!p || p === "/dev/null") return null;
  const parts = p.split("/").filter((x) => x !== "");
  if (parts.length <= n) return null;
  return parts.slice(n).join("/");
}

/** The paths a patch text creates, deletes, moves or edits, with `-p` stripping applied. */
function patchPaths(text, strip, st) {
  const out = [];
  const add = (raw, n) => {
    if (!raw || raw === "/dev/null") return;
    const p = stripPatchPath(raw, n);
    if (p === null) st.uncertain.add("unresolved-target");
    else out.push(p);
  };
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m;
    if ((m = /^diff --git (\S+) (\S+)\s*$/.exec(line))) {
      add(m[1], strip);
      add(m[2], strip);
    } else if (line.startsWith("diff --git ")) {
      st.uncertain.add("unresolved-target");
    } else if ((m = /^(?:rename|copy) (?:from|to) (.+?)\s*$/.exec(line))) {
      add(m[1], Math.max(0, strip - 1));
    } else if (line.startsWith("--- ") && (lines[i + 1] || "").startsWith("+++ ")) {
      add(line.slice(4).split("\t")[0].trim(), strip);
      add(lines[i + 1].slice(4).split("\t")[0].trim(), strip);
      i++;
    }
  }
  return out;
}

function evalPatch(cmd, st, kind, args, cwd) {
  let strip = kind === "git" ? 1 : 0;
  let dir = null;
  let input = null;
  const files = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    let m;
    if (kind === "git" && /^--(check|stat|numstat|summary)$/.test(a)) return;
    if (kind === "patch" && (a === "--dry-run" || a === "-C" || a === "--check")) return;
    if ((m = /^-p(\d+)$/.exec(a))) strip = Number(m[1]);
    else if (a === "-p" && /^\d+$/.test(args[i + 1] || "")) strip = Number(args[++i]);
    else if ((m = /^--directory=(.*)$/.exec(a))) dir = m[1];
    else if (kind === "patch" && a === "-d") dir = args[++i] ?? null;
    else if (kind === "patch" && (m = /^-d(.+)$/.exec(a))) dir = m[1];
    else if (kind === "patch" && a === "-i") input = args[++i] ?? null;
    else if (kind === "patch" && (m = /^--input=(.*)$/.exec(a))) input = m[1];
    else if (a.startsWith("-") && a !== "-") continue;
    else files.push(a);
  }
  let base = cwd;
  if (dir !== null) base = cmd.dyn.has(dir) ? null : resolveCwd(cwd, dir);
  const texts = [];
  if (kind === "git") {
    for (const f of files) {
      if (f === "-") {
        const t = knownStdin(cmd, st, cwd);
        if (t !== null) texts.push(t);
      } else if (cmd.dyn.has(f)) st.uncertain.add("unavailable-source");
      else {
        const t = readBoundedSource(st, f, cwd);
        if (t !== null) texts.push(t);
      }
    }
    if (files.length === 0) {
      const t = knownStdin(cmd, st, cwd);
      if (t !== null) texts.push(t);
      else if (!cmd.piped) st.uncertain.add("unknown-stdin");
    }
  } else {
    if (input !== null && !cmd.dyn.has(input)) {
      const t = readBoundedSource(st, input, cwd);
      if (t !== null) texts.push(t);
    } else {
      const t = knownStdin(cmd, st, cwd);
      if (t !== null) texts.push(t);
      else if (!cmd.piped) st.uncertain.add("unknown-stdin");
    }
    if (files.length > 0) {
      for (const f of files) addWordTarget(st, cmd, f, base, true);
      return;
    }
  }
  for (const text of texts) {
    for (const p of patchPaths(text, strip, st)) addEvidenceTarget(st, p, base, true);
  }
}

// --- Scripts -----------------------------------------------------------------

function evalInterpreter(cmd, st, lang, args, cwd) {
  let code = null;
  let file = null;
  let stdin = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (lang === "python") {
      if (a === "-c") {
        code = args[++i] ?? null;
        break;
      }
      if (a === "-m") {
        st.uncertain.add("unknown-script-effect");
        return;
      }
      if (a === "-W" || a === "-X") i++;
    } else {
      if (a === "-e" || a === "--eval" || a === "-p" || a === "--print") {
        code = args[++i] ?? null;
        break;
      }
      if (a === "-r" || a === "--require" || a === "--import" || a.startsWith("--require=")) {
        st.uncertain.add("unknown-script-effect");
        return;
      }
    }
    if (a === "-") {
      stdin = true;
      break;
    }
    if (a.startsWith("-") && a.length > 1) continue;
    file = a;
    break;
  }
  let source = null;
  if (code !== null) {
    if (cmd.dyn.has(code)) {
      st.uncertain.add("unknown-script-effect");
      return;
    }
    source = code;
  } else if (file !== null) {
    if (cmd.dyn.has(file)) {
      st.uncertain.add("unavailable-source");
      return;
    }
    source = readBoundedSource(st, file, cwd);
  } else if (stdin || cmd.heredoc || cmd.stdinFile || cmd.hereString !== null || cmd.piped) {
    source = knownStdin(cmd, st, cwd);
  }
  if (source === null) return;
  const result = lang === "python" ? analyzePython(source) : analyzeJs(source);
  for (const t of result.writes) addEvidenceTarget(st, t, cwd, true);
  if (result.unknown) st.uncertain.add("unknown-script-effect");
}

/**
 * Tokens of a Python or JS source: `{ k: "id"|"str"|"dstr"|"num"|"p"|"nl", v }`, or null
 * when the text cannot be tokenized. `dstr` is a string that is not a plain literal.
 */
function tokenizeSource(src, lang) {
  const out = [];
  let depth = 0;
  const n = src.length;
  for (let i = 0; i < n; i++) {
    const ch = src[i];
    if (ch === "\n") {
      if (depth === 0) out.push({ k: "nl", v: "\n" });
      if (lang === "python" && depth === 0) {
        let j = i + 1;
        while (src[j] === " " || src[j] === "\t") j++;
        if (j > i + 1 && src[j] !== "\n" && src[j] !== "#" && j < n) return null;
      }
      continue;
    }
    if (/\s/.test(ch)) continue;
    if (lang === "python" && ch === "#") {
      while (i < n && src[i] !== "\n") i++;
      i--;
      continue;
    }
    if (lang === "js" && ch === "/" && src[i + 1] === "/") {
      while (i < n && src[i] !== "\n") i++;
      i--;
      continue;
    }
    if (lang === "js" && ch === "/" && src[i + 1] === "*") {
      const end = src.indexOf("*/", i + 2);
      if (end < 0) return null;
      i = end + 1;
      continue;
    }
    if (lang === "python" && ch === "\\" && src[i + 1] === "\n") {
      i++;
      continue;
    }
    const prefix = lang === "python" ? /^[rRbBuUfF]{1,2}(?=['"])/.exec(src.slice(i, i + 3)) : null;
    const q = prefix ? src[i + prefix[0].length] : ch;
    if (q === "'" || q === '"' || (lang === "js" && q === "`")) {
      const start = i + (prefix ? prefix[0].length : 0);
      const triple = lang === "python" && src.startsWith(q.repeat(3), start);
      const open = triple ? 3 : 1;
      let j = start + open;
      let body = "";
      let plain = !(prefix && /[fF]/.test(prefix[0]));
      for (; j < n; j++) {
        const c = src[j];
        if (c === "\\") {
          plain = false;
          j++;
          continue;
        }
        if (triple ? src.startsWith(q.repeat(3), j) : c === q) break;
        if (c === "\n" && !triple && q !== "`") return null;
        if (q === "`" && c === "$" && src[j + 1] === "{") plain = false;
        if (prefix && /[fF]/.test(prefix[0]) && (c === "{" || c === "}")) plain = false;
        body += c;
      }
      if (j >= n) return null;
      out.push({ k: plain ? "str" : "dstr", v: body });
      i = j + open - 1;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      while (i + 1 < n && /[0-9A-Za-z_.]/.test(src[i + 1])) i++;
      out.push({ k: "num", v: "0" });
      continue;
    }
    const idStart = lang === "js" ? /[A-Za-z_$]/ : /[A-Za-z_]/;
    if (idStart.test(ch)) {
      let j = i;
      while (j + 1 < n && (lang === "js" ? /[A-Za-z0-9_$]/ : /[A-Za-z0-9_]/).test(src[j + 1])) j++;
      out.push({ k: "id", v: src.slice(i, j + 1) });
      i = j;
      continue;
    }
    if ("([{".includes(ch)) depth++;
    if (")]}".includes(ch)) depth = Math.max(0, depth - 1);
    if ("()[]{},.:;=+-*/%<>!&|^~?".includes(ch)) {
      out.push({ k: "p", v: ch });
      continue;
    }
    return null;
  }
  return out;
}

function splitStatements(tokens) {
  const stmts = [];
  let cur = [];
  for (const t of tokens) {
    if (t.k === "nl" || (t.k === "p" && t.v === ";")) {
      if (cur.length) stmts.push(cur);
      cur = [];
    } else cur.push(t);
  }
  if (cur.length) stmts.push(cur);
  return stmts;
}

const PY_SAFE_MODULES = new Set([
  "os",
  "sys",
  "json",
  "re",
  "math",
  "pathlib",
  "time",
  "datetime",
  "collections",
  "itertools",
  "functools",
  "string",
  "textwrap",
  "base64",
  "hashlib",
  "typing",
]);
const PY_BUILTINS = new Set([
  "print",
  "len",
  "str",
  "int",
  "float",
  "bool",
  "abs",
  "min",
  "max",
  "sum",
  "sorted",
  "list",
  "dict",
  "set",
  "tuple",
  "repr",
  "range",
  "enumerate",
  "zip",
  "reversed",
]);
const PY_EXPR_WORDS = new Set([
  "and",
  "or",
  "not",
  "in",
  "is",
  "if",
  "else",
  "True",
  "False",
  "None",
]);
const PY_STATEMENT_WORDS = new Set([
  "for",
  "while",
  "if",
  "def",
  "class",
  "with",
  "try",
  "lambda",
  "return",
  "del",
  "global",
  "nonlocal",
  "async",
  "await",
  "raise",
  "assert",
  "yield",
  "break",
  "continue",
  "elif",
  "else",
  "except",
  "finally",
  "exec",
  "pass",
]);
const PY_ATTR_OK = new Set([
  "read",
  "readlines",
  "readline",
  "write",
  "close",
  "strip",
  "lstrip",
  "rstrip",
  "split",
  "splitlines",
  "join",
  "format",
  "upper",
  "lower",
  "startswith",
  "endswith",
  "find",
  "count",
  "encode",
  "decode",
  "get",
  "keys",
  "values",
  "items",
  "append",
  "environ",
  "path",
  "argv",
  "stdout",
  "stderr",
  "exit",
  "loads",
  "dumps",
  "load",
  "match",
  "search",
  "findall",
  "sub",
  "sqrt",
  "floor",
  "ceil",
  "pi",
  "now",
  "today",
  "strftime",
  "isoformat",
  "sha256",
  "hexdigest",
  "b64encode",
  "b64decode",
  "Path",
  "title",
  "capitalize",
  "index",
  "extend",
]);
const PY_OS_OK = new Set([
  "environ",
  "path",
  "getcwd",
  "listdir",
  "getenv",
  "sep",
  "linesep",
  "name",
  "getpid",
]);

/** Python source effects: literal write targets plus whether anything is unrecognized. */
function analyzePython(src) {
  const tokens = tokenizeSource(src, "python");
  if (!tokens) return { writes: [], unknown: true };
  const writes = [];
  const recognized = new Set();
  let unknown = false;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.k === "id" && t.v === "open" && tokens[i - 1]?.v !== ".") {
      const ok =
        tokens[i + 1]?.v === "(" &&
        tokens[i + 2]?.k === "str" &&
        (tokens[i + 3]?.v === ")" ||
          (tokens[i + 3]?.v === "," && tokens[i + 4]?.k === "str" && tokens[i + 5]?.v === ")"));
      if (ok) {
        recognized.add(i);
        const mode = tokens[i + 3]?.v === "," ? tokens[i + 4].v : "r";
        if (/[wax+]/.test(mode)) writes.push(tokens[i + 2].v);
      }
    }
    if (
      t.k === "id" &&
      (t.v === "write_text" || t.v === "write_bytes") &&
      tokens[i - 1]?.v === "." &&
      tokens[i - 2]?.v === ")" &&
      tokens[i - 3]?.k === "str" &&
      tokens[i - 4]?.v === "(" &&
      tokens[i - 5]?.v === "Path"
    ) {
      recognized.add(i);
      writes.push(tokens[i - 3].v);
    }
  }
  const bound = new Set();
  for (const stmt of splitStatements(tokens)) {
    const first = stmt[0];
    if (first.k === "id" && (first.v === "import" || first.v === "from")) {
      const names = [];
      let i = 1;
      let moduleRoot = null;
      if (first.v === "from") {
        moduleRoot = stmt[1]?.v;
        if (stmt[2]?.v !== "import" || !moduleRoot) unknown = true;
        i = 3;
      }
      if (first.v === "import" || !unknown) {
        for (; i < stmt.length; i++) {
          const t = stmt[i];
          if (t.k === "id" && t.v !== "as") {
            const aliased = stmt[i + 1]?.v === "as" && stmt[i + 2]?.k === "id";
            const rootName = first.v === "import" ? t.v : moduleRoot;
            if (!PY_SAFE_MODULES.has(rootName)) unknown = true;
            names.push(aliased ? stmt[i + 2].v : t.v);
            if (aliased) i += 2;
            while (stmt[i + 1]?.v === "." && stmt[i + 2]?.k === "id") i += 2;
          } else if (t.k === "p" && t.v === "*") unknown = true;
        }
      }
      for (const nme of names) bound.add(nme);
      continue;
    }
    if (first.k === "id" && PY_STATEMENT_WORDS.has(first.v) && !(first.v === "pass")) {
      unknown = true;
      continue;
    }
    let start = 0;
    let bindName = null;
    if (
      first.k === "id" &&
      stmt[1]?.v === "=" &&
      stmt[2]?.v !== "=" &&
      !PY_EXPR_WORDS.has(first.v)
    ) {
      bindName = first.v;
      start = 2;
    }
    for (let j = start; j < stmt.length; j++) {
      const t = stmt[j];
      if (t.k === "dstr") {
        unknown = true;
        continue;
      }
      if (t.k !== "id") continue;
      const prev = stmt[j - 1];
      if (prev && prev.k === "p" && prev.v === ".") {
        const recv = stmt[j - 2];
        const viaPath = recv?.v === "path" && stmt[j - 3]?.v === ".";
        if (recv?.v === "os" && bound.has("os")) {
          if (!PY_OS_OK.has(t.v)) unknown = true;
        } else if (!viaPath && !PY_ATTR_OK.has(t.v) && !recognized.has(tokens.indexOf(t)))
          unknown = true;
        continue;
      }
      if (t.v === "open") {
        if (!recognized.has(tokens.indexOf(t))) unknown = true;
        continue;
      }
      if (PY_EXPR_WORDS.has(t.v) || PY_BUILTINS.has(t.v) || bound.has(t.v)) continue;
      unknown = true;
    }
    if (bindName) bound.add(bindName);
  }
  return { writes, unknown };
}

const JS_GLOBALS = new Set([
  "console",
  "JSON",
  "Math",
  "Number",
  "String",
  "Boolean",
  "Array",
  "Object",
  "process",
  "require",
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity",
  "typeof",
]);
const JS_SAFE_MODULES = new Set([
  "fs",
  "node:fs",
  "path",
  "node:path",
  "os",
  "node:os",
  "util",
  "node:util",
  "fs/promises",
  "node:fs/promises",
]);
const JS_STATEMENT_WORDS = new Set([
  "if",
  "for",
  "while",
  "do",
  "switch",
  "function",
  "class",
  "try",
  "return",
  "throw",
  "async",
  "await",
  "import",
  "export",
  "delete",
  "with",
  "new",
  "else",
  "case",
  "break",
  "continue",
  "catch",
  "finally",
]);
const JS_ATTR_OK = new Set([
  "log",
  "error",
  "warn",
  "info",
  "stringify",
  "parse",
  "readFileSync",
  "readFile",
  "existsSync",
  "readdirSync",
  "statSync",
  "lstatSync",
  "join",
  "resolve",
  "basename",
  "dirname",
  "extname",
  "relative",
  "toString",
  "trim",
  "split",
  "length",
  "slice",
  "push",
  "includes",
  "indexOf",
  "startsWith",
  "endsWith",
  "replace",
  "toUpperCase",
  "toLowerCase",
  "keys",
  "values",
  "entries",
  "env",
  "argv",
  "cwd",
  "stdout",
  "stderr",
  "write",
  "platform",
  "sep",
  "floor",
  "ceil",
  "round",
  "max",
  "min",
  "abs",
  "isArray",
  "promises",
  "mkdirSync",
  "mkdir",
  "exit",
  "sort",
  "reverse",
]);
const JS_WRITE_ONE = new Set([
  "writeFileSync",
  "writeFile",
  "appendFileSync",
  "appendFile",
  "createWriteStream",
  "unlinkSync",
  "unlink",
  "rmSync",
  "rm",
]);
const JS_WRITE_DEST = new Set(["copyFileSync", "copyFile"]);
const JS_WRITE_TWO = new Set(["renameSync", "rename"]);

/** JavaScript source effects, on the same terms as `analyzePython`. */
function analyzeJs(src) {
  const tokens = tokenizeSource(src, "js");
  if (!tokens) return { writes: [], unknown: true };
  const writes = [];
  const recognized = new Set();
  let unknown = false;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.k !== "id" || tokens[i + 1]?.v !== "(") continue;
    const arg1 = tokens[i + 2];
    const arg2 = tokens[i + 4];
    if (JS_WRITE_ONE.has(t.v) && arg1?.k === "str") {
      recognized.add(i);
      writes.push(arg1.v);
    } else if (
      JS_WRITE_DEST.has(t.v) &&
      arg1?.k === "str" &&
      tokens[i + 3]?.v === "," &&
      arg2?.k === "str"
    ) {
      recognized.add(i);
      writes.push(arg2.v);
    } else if (
      JS_WRITE_TWO.has(t.v) &&
      arg1?.k === "str" &&
      tokens[i + 3]?.v === "," &&
      arg2?.k === "str"
    ) {
      recognized.add(i);
      writes.push(arg1.v, arg2.v);
    }
  }
  const bound = new Set();
  for (const stmt of splitStatements(tokens)) {
    const first = stmt[0];
    let start = 0;
    if (first.k === "id" && ["const", "let", "var"].includes(first.v)) {
      start = 1;
      if (stmt[1]?.k === "id") bound.add(stmt[1].v);
      else if (stmt[1]?.v === "{") {
        for (let j = 2; j < stmt.length && stmt[j].v !== "}"; j++)
          if (stmt[j].k === "id") bound.add(stmt[j].v);
      }
    } else if (first.k === "id" && JS_STATEMENT_WORDS.has(first.v)) {
      unknown = true;
      continue;
    }
    for (let j = start; j < stmt.length; j++) {
      const t = stmt[j];
      if (t.k === "dstr") {
        unknown = true;
        continue;
      }
      if (t.k !== "id") continue;
      const idx = tokens.indexOf(t);
      if (stmt[j - 1]?.v === ".") {
        if (!JS_ATTR_OK.has(t.v) && !recognized.has(idx)) unknown = true;
        continue;
      }
      if (recognized.has(idx)) continue;
      if (t.v === "require") {
        const mod = stmt[j + 2];
        if (stmt[j + 1]?.v !== "(" || mod?.k !== "str" || !JS_SAFE_MODULES.has(mod.v))
          unknown = true;
        continue;
      }
      if (JS_GLOBALS.has(t.v) || bound.has(t.v)) continue;
      unknown = true;
    }
  }
  return { writes, unknown };
}

const EVIDENCE_REASONS = {
  "unresolved-directory": "the working directory is not a literal path",
  "unresolved-target": "a target path is computed or not literal",
  "unknown-script-effect": "a script has effects that were not recognized",
  "unavailable-source": "a named source file could not be safely read",
  "unknown-stdin": "its input is not a literal patch or script",
};
const LIMIT_REASONS = {
  "command-size": "the command is longer than 256 KiB",
  "source-size": "a source file is larger than 64 KiB",
  depth: "nesting is deeper than 3 levels",
  "target-count": "more than 64 targets",
  deadline: "analysis took longer than 200 ms",
};

/**
 * Edit evidence for a shell command: `{ targets, uncertain, limit }`.
 * `targets` are ordered unique paths (workspace-relative where inside it), `uncertain` lists
 * reason codes for effects whose targets cannot be determined, and `limit` is the first
 * analysis limit reached (analysis stopped there and kept the earlier targets). A command that
 * edits nothing returns empty `targets` and `uncertain` and a null `limit`.
 *
 * Quiet on `> /dev/null`, `>> "$GITHUB_ENV"`, `mktemp` handoff files and log capture.
 * `ctx` is `{ cwd, root }` (`hookContext`).
 */
function shellEditTargets(cmd, ctx) {
  const st = newEvidence(ctx);
  let text = String(cmd);
  if (Buffer.byteLength(text, "utf8") > EVIDENCE_LIMITS.commandBytes) {
    text = text.slice(0, EVIDENCE_LIMITS.commandBytes);
    evidenceLimit(st, "command-size", false);
  }
  try {
    evalItems(lexShell(text, st, 0), st, 0, st.baseCwd);
  } catch {
    st.uncertain.add("unknown-script-effect");
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
  const lines = [
    named
      ? `bkit guardrails: this command edits files through the shell (targets: ${ev.targets.join(", ")}). The command is allowed.`
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
