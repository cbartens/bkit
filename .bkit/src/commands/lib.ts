// commands/lib.ts — what every `bkit <noun> <verb>` command shares.
//
// Flag parsing, one JSON object on stdout, `[bkit-<noun>]`-tagged logs on stderr,
// the exit-code table, `--help` rendering, and the repo facts several workflow
// steps each re-derived by hand: repo root, UTC month, where `status.jsonl` lives,
// and the skip-CI tokens. A command declares its flags, output keys and exit codes
// in its spec; `--help` and the convention test both read that spec, so the help
// text cannot drift from what the command accepts.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { gitEnv } from "../bkit-telemetry.js";

// ---------------------------------------------------------------------------
// Exit codes
// ---------------------------------------------------------------------------

/** Codes every command shares. A command's own codes sit in 3-79. */
export const EXIT = {
  OK: 0,
  /** The answer is "no": gate failed, max attempts exceeded, lock held. */
  NO: 1,
  /** Usage error or missing dependency. */
  USAGE: 2,
  /** Do this through the tracker / GitHub MCP instead (`gh` unavailable in this runtime). */
  USE_MCP: 80,
  /** Hand the wait back to the agent's turn loop. */
  AGENT_WAIT: 81,
  /** A human has to act. */
  NEEDS_HUMAN: 82,
} as const;

export const SHARED_EXIT_CODES: Readonly<Record<number, string>> = {
  [EXIT.OK]: "ok",
  [EXIT.NO]: "the answer is no (gate failed, max attempts exceeded, lock held)",
  [EXIT.USAGE]: "usage error or missing dependency",
  [EXIT.USE_MCP]: "do this through MCP instead (gh unavailable in this runtime)",
  [EXIT.AGENT_WAIT]: "hand the wait back to the agent's turn loop",
  [EXIT.NEEDS_HUMAN]: "needs a human",
};

/** Range a command's own exit codes must fall in. */
export const OWN_EXIT_MIN = 3;
export const OWN_EXIT_MAX = 79;

/** Thrown inside a command to exit with `code` and print `message` to stderr. */
export class CommandError extends Error {
  constructor(
    readonly code: number,
    message: string,
  ) {
    super(message);
  }
}

// ---------------------------------------------------------------------------
// Specs
// ---------------------------------------------------------------------------

export interface FlagSpec {
  /** kebab-case, without the leading `--`. */
  name: string;
  type: "string" | "boolean";
  required?: boolean;
  /** May be given more than once; the value is a string array. */
  repeatable?: boolean;
  /**
   * A single bare argument fills this flag. At most one per verb; it exists for
   * callers that already pass a bare value (a consumer's own CI file) and that bkit
   * cannot rewrite.
   */
  positional?: boolean;
  help: string;
}

export type FlagValue = string | boolean | string[] | undefined;

export interface RunContext {
  /** Parsed flags, keyed by camelCase name. */
  flags: Record<string, FlagValue>;
  cwd: string;
  /** Human-readable line on stderr, tagged `[bkit-<noun>]`. */
  log(message: string): void;
  /** The command's one JSON object on stdout. Call at most once. */
  emit(output: Record<string, unknown>): void;
}

export interface VerbSpec {
  summary: string;
  flags: FlagSpec[];
  /** Output key -> meaning. Keys are camelCase, matching `status.jsonl`. */
  output: Record<string, string>;
  /** This verb's own exit codes (3-79) -> meaning. */
  exitCodes?: Record<number, string>;
  run(ctx: RunContext): number | Promise<number>;
}

export interface CommandSpec {
  /** Plural where there are many of the thing (`counters`), singular where a repo has one (`status`). */
  noun: string;
  summary: string;
  verbs: Record<string, VerbSpec>;
}

// ---------------------------------------------------------------------------
// Flags
// ---------------------------------------------------------------------------

const camel = (kebab: string) => kebab.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());

/**
 * Parse `--flag=value` / `--flag value` / `--bool` against the verb's spec. Keys
 * are filled in argv order, so a verb may render repeated or free-form flags in
 * the order the caller gave them.
 */
export function parseFlags(argv: string[], specs: FlagSpec[]): Record<string, FlagValue> {
  const byName = new Map(specs.map((s) => [s.name, s]));
  const positional = specs.find((s) => s.positional);
  const out: Record<string, FlagValue> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (!arg.startsWith("--")) {
      const key = positional && camel(positional.name);
      if (!key || out[key] !== undefined) {
        throw new CommandError(
          EXIT.USAGE,
          `unexpected argument "${arg}" — commands take flags only`,
        );
      }
      out[key] = arg;
      continue;
    }
    const eq = arg.indexOf("=");
    const name = arg.slice(2, eq === -1 ? undefined : eq);
    const spec = byName.get(name);
    if (!spec) throw new CommandError(EXIT.USAGE, `unknown flag --${name}`);
    let value: string | boolean;
    if (spec.type === "boolean") {
      if (eq !== -1) throw new CommandError(EXIT.USAGE, `--${name} takes no value`);
      value = true;
    } else if (eq !== -1) {
      value = arg.slice(eq + 1);
    } else {
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) {
        throw new CommandError(EXIT.USAGE, `--${name} needs a value`);
      }
      value = next;
      i++;
    }
    const key = camel(name);
    if (spec.repeatable) {
      const prior = out[key];
      out[key] = [...(Array.isArray(prior) ? prior : []), String(value)];
    } else {
      if (out[key] !== undefined) throw new CommandError(EXIT.USAGE, `--${name} given twice`);
      out[key] = value;
    }
  }
  for (const spec of specs) {
    if (spec.required && out[camel(spec.name)] === undefined) {
      throw new CommandError(EXIT.USAGE, `missing required flag --${spec.name}`);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Help
// ---------------------------------------------------------------------------

const table = (rows: Array<[string, string]>) => {
  const width = Math.max(0, ...rows.map(([k]) => k.length));
  return rows.map(([k, v]) => `  ${k.padEnd(width)}  ${v}`).join("\n");
};

function exitCodeRows(own: Record<number, string> = {}): Array<[string, string]> {
  return Object.entries({ ...SHARED_EXIT_CODES, ...own })
    .map(([code, meaning]) => [Number(code), meaning] as const)
    .sort((a, b) => a[0] - b[0])
    .map(([code, meaning]) => [String(code), meaning]);
}

export function commandHelp(cmd: CommandSpec): string {
  const verbs = Object.entries(cmd.verbs).map(([v, s]) => [v, s.summary] as [string, string]);
  return [
    `bkit ${cmd.noun} — ${cmd.summary}`,
    "",
    `Usage: bkit ${cmd.noun} <verb> [flags]`,
    "",
    "Verbs:",
    table(verbs),
    "",
    `Run \`bkit ${cmd.noun} <verb> --help\` for each verb's flags, output keys, and own exit codes.`,
    "",
    "Exit codes:",
    table(exitCodeRows()),
    "",
  ].join("\n");
}

export function verbHelp(cmd: CommandSpec, verb: string): string {
  const spec = cmd.verbs[verb]!;
  const flags = spec.flags.map((f) => {
    const usage = f.type === "boolean" ? `--${f.name}` : `--${f.name}=<value>`;
    const notes = [
      f.required ? "required" : "",
      f.repeatable ? "repeatable" : "",
      f.positional ? "or as the one bare argument" : "",
    ].filter(Boolean);
    return [usage, notes.length ? `${f.help} (${notes.join(", ")})` : f.help] as [string, string];
  });
  return [
    `bkit ${cmd.noun} ${verb} — ${spec.summary}`,
    "",
    `Usage: bkit ${cmd.noun} ${verb} [flags]`,
    "",
    "Flags:",
    flags.length ? table(flags) : "  none",
    "",
    "Output (one JSON object on stdout):",
    table(Object.entries(spec.output)),
    "",
    "Exit codes:",
    table(exitCodeRows(spec.exitCodes)),
    "",
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------

export const logTag = (noun: string) => `[bkit-${noun}]`;

export interface Io {
  stdout(text: string): void;
  stderr(text: string): void;
}

const processIo: Io = {
  stdout: (t) => process.stdout.write(t),
  stderr: (t) => process.stderr.write(t),
};

const isHelp = (arg: string | undefined) => arg === "--help" || arg === "-h";

/**
 * Run `argv` (without the leading `bkit`) if it names a registered command.
 * Returns the exit code, or null when `argv` is not a command, so the caller falls
 * through to the classic verbs. A noun that is also a classic verb (`status`)
 * routes only when the second word is one of its verbs, so `bkit status` keeps
 * its classic meaning.
 */
export async function runCommand(
  argv: string[],
  commands: readonly CommandSpec[],
  options: { classicVerbs: ReadonlySet<string>; cwd?: string; io?: Io },
): Promise<number | null> {
  const io = options.io ?? processIo;
  const cmd = commands.find((c) => c.noun === argv[0]);
  if (!cmd) return null;
  const verb = argv[1];
  const isVerb = verb !== undefined && Object.hasOwn(cmd.verbs, verb);
  if (!isVerb && options.classicVerbs.has(cmd.noun)) return null;

  const tag = logTag(cmd.noun);
  if (!isVerb) {
    if (verb === undefined || isHelp(verb)) {
      io.stdout(commandHelp(cmd));
      return verb === undefined ? EXIT.USAGE : EXIT.OK;
    }
    io.stderr(`${tag} unknown verb "${verb}" — run \`bkit ${cmd.noun} --help\`\n`);
    return EXIT.USAGE;
  }
  const rest = argv.slice(2);
  if (rest.some(isHelp)) {
    io.stdout(verbHelp(cmd, verb));
    return EXIT.OK;
  }

  const spec = cmd.verbs[verb]!;
  let emitted = false;
  const ctx: RunContext = {
    flags: {},
    cwd: options.cwd ?? process.cwd(),
    log: (message) => io.stderr(`${tag} ${message}\n`),
    emit: (output) => {
      if (emitted) throw new Error(`${tag} ${verb} emitted twice — one JSON object per run`);
      emitted = true;
      io.stdout(`${JSON.stringify(output)}\n`);
    },
  };
  try {
    ctx.flags = parseFlags(rest, spec.flags);
    return await spec.run(ctx);
  } catch (err) {
    if (!(err instanceof CommandError)) throw err;
    io.stderr(`${tag} ${err.message}\n`);
    return err.code;
  }
}

// ---------------------------------------------------------------------------
// Repo facts
// ---------------------------------------------------------------------------

/** `git <args>` in `cwd`, never throwing: exit status plus trimmed stdout / stderr. */
export function runGit(
  cwd: string,
  args: string[],
): { ok: boolean; stdout: string; stderr: string } {
  const res = spawnSync("git", args, { cwd, encoding: "utf-8", env: gitEnv() });
  return {
    ok: res.status === 0,
    stdout: (res.stdout ?? "").trim(),
    stderr: (res.stderr ?? "").trim(),
  };
}

/** `git <args>` in `cwd`; stdout trimmed, or null on a non-zero exit. */
export function git(cwd: string, args: string[]): string | null {
  const res = runGit(cwd, args);
  return res.ok ? res.stdout : null;
}

/** `JSON.parse` as a result instead of a throw; each caller says what bad input means for it. */
export function parseJson(raw: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(raw) as unknown };
  } catch {
    // Not JSON: the result says so, and the caller reports it in its own terms.
    return { ok: false };
  }
}

export interface ToolResult {
  /** False when the binary is not on PATH (or could not be spawned). */
  found: boolean;
  /** Exit code; 127 when not found, 128+n when killed by signal n, as a shell reports it. */
  status: number;
  stdout: string;
  stderr: string;
}

/**
 * Run a tool other than git, never throwing. Hook-exported GIT_* vars are scrubbed
 * so gh and friends answer for `cwd`; `input` goes to stdin.
 */
export function runTool(
  cmd: string,
  args: string[],
  cwd: string,
  opts: { input?: string } = {},
): ToolResult {
  const res = spawnSync(cmd, args, {
    cwd,
    encoding: "utf-8",
    env: gitEnv(),
    input: opts.input,
    maxBuffer: 1 << 26,
  });
  if (res.error) {
    return { found: false, status: 127, stdout: "", stderr: `${cmd} not found on PATH` };
  }
  return {
    found: true,
    status: res.status ?? 128 + signalNumber(res.signal),
    stdout: res.stdout ?? "",
    stderr: res.stderr ?? "",
  };
}

const signalNumber = (signal: NodeJS.Signals | null): number =>
  (signal ? os.constants.signals[signal] : undefined) ?? 1;

export interface GhResult {
  ok: boolean;
  /** stdout trimmed; kept apart from stderr so gh warnings never corrupt JSON. */
  stdout: string;
  stderr: string;
  /** gh is not on PATH: the workflow's GitHub MCP fallback applies. */
  missing: boolean;
  status?: number;
}

/** `gh <args>` in `cwd`, never throwing; `input` goes to stdin. */
export function runGh(cwd: string, args: string[], input?: string): GhResult {
  const res = runTool("gh", args, cwd, { input });
  return {
    ok: res.found && res.status === 0,
    stdout: res.stdout.trim(),
    stderr: res.stderr.trim(),
    missing: !res.found,
    status: res.status,
  };
}

/** gh cannot serve this call here: not installed, or exit 4 (not logged in). */
export const ghUnavailable = (res: GhResult): boolean => res.missing || res.status === 4;

/**
 * The main checkout's root, from any worktree. `--git-common-dir` points at the
 * shared `.git`, so a linked worktree resolves to the same root as the main one.
 */
export function repoRoot(cwd: string): string {
  const common = git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
  if (!common) throw new CommandError(EXIT.USAGE, `not inside a git repository: ${cwd}`);
  return path.dirname(common);
}

/** `YYYYMM` in UTC, so every workflow picks the same month bucket at a month boundary. */
export function utcMonth(now: Date = new Date()): string {
  return `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** `docs/plans/{month}/logs/{fid}/status.jsonl`, relative to whichever root holds it. */
export const statusRelPath = (month: string, fid: string) =>
  path.join("docs", "plans", month, "logs", fid, "status.jsonl");

export interface StatusLocation {
  /** Root the log lives under (also where the workflow books its other logs). */
  bookRoot: string;
  /** Absolute path to `status.jsonl` (may not exist yet). */
  path: string;
}

/**
 * Where a workflow's `status.jsonl` lives. One rule per workflow kind:
 *
 * - design / plan / build / debug: the feature worktree's copy when it exists
 *   (`.worktrees/{fid}`), else the main checkout's.
 * - ship: the main checkout when this runtime pushes to dev, else the current
 *   worktree's top (the branch being shipped). An unresolved runtime takes the
 *   least-capable answer: current worktree.
 */
export function statusLocation(opts: {
  cwd: string;
  workflow: string;
  fid: string;
  month: string;
  devPushes?: boolean;
}): StatusLocation {
  const root = repoRoot(opts.cwd);
  const rel = statusRelPath(opts.month, opts.fid);
  if (opts.workflow === "ship") {
    const bookRoot =
      opts.devPushes === true ? root : (git(opts.cwd, ["rev-parse", "--show-toplevel"]) ?? root);
    return { bookRoot, path: path.join(bookRoot, rel) };
  }
  const worktree = path.join(root, ".worktrees", opts.fid);
  const bookRoot = fs.existsSync(path.join(worktree, rel)) ? worktree : root;
  return { bookRoot, path: path.join(bookRoot, rel) };
}

/** The tokens GitHub Actions honours to skip every workflow run for a commit. */
export const SKIP_CI_TOKEN = /\[(?:skip ci|ci skip|no ci|skip actions|actions skip)\]/i;

/** A commit's full message, or null when it cannot be read (`%B` is never empty for a real commit). */
export function commitMessage(cwd: string, sha: string): string | null {
  const res = runGit(cwd, ["log", "-1", "--format=%B", sha]);
  return res.ok && res.stdout !== "" ? res.stdout : null;
}

/**
 * The skip-CI token in a commit's BODY, or null; undefined when the commit cannot
 * be read. The subject is excluded (a docs-only commit carries `[skip ci]` in its
 * subject by convention); the body is where a squash concatenates branch subjects.
 */
export function bodySkipToken(cwd: string, sha: string): string | null | undefined {
  const msg = sha === "" ? null : commitMessage(cwd, sha);
  if (msg === null) return undefined;
  return SKIP_CI_TOKEN.exec(msg.split("\n").slice(1).join("\n"))?.[0] ?? null;
}
