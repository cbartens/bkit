// commands/lib.ts — what every `bkit <noun> <verb>` command shares.
//
// Flag parsing, one output object on stdout (text, or JSON with `--json`),
// `[bkit-<noun>]`-tagged logs on stderr,
// the exit-code table, `--help` rendering, and the repo facts several workflow
// steps each re-derived by hand: repo root, UTC month, where `status.jsonl` lives,
// the skip-CI tokens, and which branches are shared. A command declares its flags,
// output keys and exit codes in its spec; `--help` and the convention test both read
// that spec, so the help text cannot drift from what the command accepts.
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { appendFrictionRow, appendJournalRow, engineCallRow, frictionRow, journalEnabled, shouldRecordFriction, } from "../ledgers/journal.js";
import { fold } from "../ledgers/status.js";
import { gitEnv, resolveGitSha } from "../ledgers/telemetry.js";
import { parseJson } from "../shared/json.js";
import { renderText } from "../shared/text.js";
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
};
export const SHARED_EXIT_CODES = {
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
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
    }
}
// ---------------------------------------------------------------------------
// Flags
// ---------------------------------------------------------------------------
const camel = (kebab) => kebab.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
/** An orchestrator placeholder (`{FID}`, `{STATUS}`) the workflow should have substituted. */
const PLACEHOLDER = /\{[A-Z][A-Z0-9_]*\}/;
/** Refuse a flag value still carrying a literal `{UPPER}` placeholder. */
function refuseUnsubstituted(flag, value) {
    const hit = PLACEHOLDER.exec(value);
    if (hit) {
        throw new CommandError(EXIT.USAGE, `--${flag} carries the unsubstituted placeholder ${hit[0]} — substitute it before running`);
    }
}
/**
 * Parse `--flag=value` / `--flag value` / `--bool` against the verb's spec. Keys
 * are filled in argv order, so a verb may render repeated or free-form flags in
 * the order the caller gave them. A value holding a literal `{UPPER}` placeholder
 * is refused (exit 2): the workflow passed it through unsubstituted.
 */
export function parseFlags(argv, specs) {
    const byName = new Map(specs.map((s) => [s.name, s]));
    const positional = specs.find((s) => s.positional);
    const out = {};
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (!arg.startsWith("--")) {
            const key = positional && camel(positional.name);
            if (!key || out[key] !== undefined) {
                throw new CommandError(EXIT.USAGE, `unexpected argument "${arg}" — commands take flags only`);
            }
            refuseUnsubstituted(positional.name, arg);
            out[key] = arg;
            continue;
        }
        const eq = arg.indexOf("=");
        const name = arg.slice(2, eq === -1 ? undefined : eq);
        const spec = byName.get(name);
        if (!spec)
            throw new CommandError(EXIT.USAGE, `unknown flag --${name}`);
        let value;
        if (spec.type === "boolean") {
            if (eq !== -1)
                throw new CommandError(EXIT.USAGE, `--${name} takes no value`);
            value = true;
        }
        else if (eq !== -1) {
            value = arg.slice(eq + 1);
        }
        else {
            const next = argv[i + 1];
            if (next === undefined || next.startsWith("--")) {
                throw new CommandError(EXIT.USAGE, `--${name} needs a value`);
            }
            value = next;
            i++;
        }
        if (typeof value === "string")
            refuseUnsubstituted(name, value);
        const key = camel(name);
        if (spec.repeatable) {
            const prior = out[key];
            out[key] = [...(Array.isArray(prior) ? prior : []), String(value)];
        }
        else {
            if (out[key] !== undefined)
                throw new CommandError(EXIT.USAGE, `--${name} given twice`);
            out[key] = value;
        }
    }
    for (const spec of specs) {
        if (!spec.required)
            continue;
        const value = out[camel(spec.name)];
        if (value === undefined) {
            throw new CommandError(EXIT.USAGE, `missing required flag --${spec.name}`);
        }
        if (value === "" || (Array.isArray(value) && value.includes(""))) {
            throw new CommandError(EXIT.USAGE, `required flag --${spec.name} needs a non-empty value`);
        }
    }
    return out;
}
// ---------------------------------------------------------------------------
// Help
// ---------------------------------------------------------------------------
const table = (rows) => {
    const width = Math.max(0, ...rows.map(([k]) => k.length));
    return rows.map(([k, v]) => `  ${k.padEnd(width)}  ${v}`).join("\n");
};
function exitCodeRows(own = {}) {
    return Object.entries({ ...SHARED_EXIT_CODES, ...own })
        .map(([code, meaning]) => [Number(code), meaning])
        .sort((a, b) => a[0] - b[0])
        .map(([code, meaning]) => [String(code), meaning]);
}
export function commandHelp(cmd) {
    const verbs = Object.entries(cmd.verbs).map(([v, s]) => [v, s.summary]);
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
export function verbHelp(cmd, verb) {
    const spec = cmd.verbs[verb];
    const flags = spec.flags.map((f) => {
        const usage = f.type === "boolean" ? `--${f.name}` : `--${f.name}=<value>`;
        const notes = [
            f.required ? "required" : "",
            f.repeatable ? "repeatable" : "",
            f.positional ? "or as the one bare argument" : "",
        ].filter(Boolean);
        return [usage, notes.length ? `${f.help} (${notes.join(", ")})` : f.help];
    });
    return [
        `bkit ${cmd.noun} ${verb} — ${spec.summary}`,
        "",
        `Usage: bkit ${cmd.noun} ${verb} [flags]`,
        "",
        "Flags:",
        flags.length ? table(flags) : "  none",
        "",
        "Output (one object on stdout: `key: value` text, JSON with --json):",
        table(Object.entries(spec.output).map(([key, help]) => [key, help + omitNote(spec, key)])),
        "",
        "Exit codes:",
        table(exitCodeRows(spec.exitCodes)),
        "",
    ].join("\n");
}
// ---------------------------------------------------------------------------
// Dispatch
// ---------------------------------------------------------------------------
export const logTag = (noun) => `[bkit-${noun}]`;
const processIo = {
    stdout: (t) => process.stdout.write(t),
    stderr: (t) => process.stderr.write(t),
};
const isHelp = (arg) => arg === "--help" || arg === "-h";
/** Global boolean flag every verb takes; it is removed before the verb's own flags parse. */
const JSON_FLAG = "--json";
/** `output` less the keys `spec.textOmit` leaves out of text. */
function textOutput(spec, output) {
    const omit = new Set((spec.textOmit ?? []).flatMap((o) => typeof o === "string" ? [o] : o.when(output[o.key], output) ? [o.key] : []));
    return Object.fromEntries(Object.entries(output).filter(([k]) => !omit.has(k)));
}
/** `--help`'s note on an output key text leaves out: always, or only when it does not matter. */
function omitNote(spec, key) {
    const o = (spec.textOmit ?? []).find((x) => (typeof x === "string" ? x : x.key) === key);
    if (o === undefined)
        return "";
    return typeof o === "string" ? " (--json only)" : " (text: only when it matters)";
}
/** Row types `fold` reads; the other rows a `status.jsonl` carries (engine-call, ...) stay out of it. */
const FOLD_TYPES = new Set([
    "workflow-started",
    "step-done",
    "workflow-meta",
    "workflow-done",
    "workflow-failed",
]);
/** Most `status.jsonl` files `resolveActiveRun` reads when it walks a checkout. */
const ACTIVE_RUN_SCAN_CAP = 500;
/** The workflow of the last run in `file` when that run is IN_PROGRESS, else undefined. */
function inProgressWorkflow(file) {
    if (!fs.existsSync(file))
        return undefined;
    const events = [];
    for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
        if (line.trim() === "")
            continue;
        const parsed = parseJson(line);
        if (!parsed.ok || parsed.value === null || typeof parsed.value !== "object")
            continue;
        const type = parsed.value.type;
        if (typeof type === "string" && FOLD_TYPES.has(type))
            events.push(parsed.value);
    }
    const last = fold(events).at(-1);
    return last?.status === "IN_PROGRESS" ? last.workflow : undefined;
}
/** The directories under `dir`, by name; none when `dir` is missing. */
function subdirs(dir) {
    if (!fs.existsSync(dir))
        return [];
    return fs
        .readdirSync(dir, { withFileTypes: true })
        .filter((e) => e.isDirectory())
        .map((e) => e.name);
}
/**
 * The run a command call belongs to, or undefined. In order: the command's own
 * `--file`; `--fid` (+ `--month`, default this UTC month) through `statusLocation`;
 * the single IN_PROGRESS run among the `docs/plans/<month>/logs/<fid>/status.jsonl`
 * files under the cwd's git toplevel (capped). From the main checkout a feature
 * worktree's run is not found, so an out-of-worktree call is skipped, never
 * attributed to another run. Reads with this module's own `node:fs` and `parseJson`
 * and folds with `ledgers/status.ts`, so it never imports a `commands/**` module.
 */
export function resolveActiveRun(opts) {
    // A `--file` that is a run's `status.jsonl` names that run; any other file (a plan or
    // design doc) says nothing about the run and falls through to `--fid` and the scan.
    if (opts.file !== undefined && path.basename(opts.file) === "status.jsonl") {
        const file = path.resolve(opts.cwd, opts.file);
        const workflow = inProgressWorkflow(file);
        const logs = path.dirname(path.dirname(file));
        if (workflow === undefined ||
            path.basename(logs) !== "logs" ||
            path.basename(path.dirname(path.dirname(logs))) !== "plans") {
            return undefined;
        }
        return {
            workflow,
            file,
            bookRoot: path.dirname(path.dirname(path.dirname(path.dirname(logs)))),
        };
    }
    if (opts.fid !== undefined) {
        try {
            const loc = statusLocation({
                cwd: opts.cwd,
                workflow: opts.workflow ?? "build",
                fid: opts.fid,
                month: opts.month ?? utcMonth(),
            });
            const workflow = inProgressWorkflow(loc.path);
            if (workflow !== undefined)
                return { workflow, file: loc.path, bookRoot: loc.bookRoot };
        }
        catch (err) {
            if (!(err instanceof CommandError))
                throw err;
        }
    }
    const top = git(opts.cwd, ["rev-parse", "--show-toplevel"]);
    if (top === null)
        return undefined;
    const found = [];
    let read = 0;
    for (const month of subdirs(path.join(top, "docs", "plans"))) {
        for (const fid of subdirs(path.join(top, "docs", "plans", month, "logs"))) {
            if (++read > ACTIVE_RUN_SCAN_CAP)
                return undefined;
            const file = path.join(top, statusRelPath(month, fid));
            const workflow = inProgressWorkflow(file);
            if (workflow !== undefined)
                found.push({ workflow, file, bookRoot: top });
        }
    }
    return found.length === 1 ? found[0] : undefined;
}
/** The journal `runCommand` uses unless a caller injects one: writes into the active run's own books. */
function engineJournal() {
    let resolved = false;
    let run;
    const active = (i) => {
        if (!resolved) {
            resolved = true;
            const text = (v) => (typeof v === "string" ? v : undefined);
            run = resolveActiveRun({
                cwd: i.cwd,
                file: text(i.flags["file"]),
                fid: text(i.flags["fid"]),
                month: text(i.flags["month"]),
                workflow: text(i.flags["workflow"]),
            });
        }
        return run;
    };
    return {
        call(i) {
            if (!journalEnabled())
                return;
            const r = active(i);
            if (r === undefined)
                return;
            const wrote = appendJournalRow(r.file, engineCallRow({ workflow: r.workflow, noun: i.noun, verb: i.verb, flags: i.argv }));
            if (!wrote.ok)
                throw new Error(wrote.error);
        },
        failure(i) {
            if (!journalEnabled())
                return;
            const r = active(i);
            if (r === undefined)
                return;
            const step = i.flags["step"];
            const row = frictionRow({
                workflow: r.workflow,
                step: typeof step === "string" ? step : undefined,
                noun: i.noun,
                verb: i.verb,
                code: i.code,
                bookRoot: r.bookRoot,
                parentSha: resolveGitSha("HEAD", r.bookRoot),
            });
            const wrote = appendFrictionRow(r.bookRoot, row);
            if (!wrote.ok)
                throw new Error(wrote.error);
        },
    };
}
/**
 * Run `argv` (without the leading `bkit`) if it names a registered command.
 * Returns the exit code, or null when `argv` is not a command, so the caller falls
 * through to the classic verbs. A noun that is also a classic verb (`status`)
 * routes only when the second word is one of its verbs or a help flag, so
 * `bkit status` keeps its classic meaning while `bkit status --help` still lists
 * the noun's own verbs.
 */
export async function runCommand(argv, commands, options) {
    const io = options.io ?? processIo;
    const cmd = commands.find((c) => c.noun === argv[0]);
    if (!cmd)
        return null;
    const verb = argv[1];
    const isVerb = verb !== undefined && Object.hasOwn(cmd.verbs, verb);
    if (!isVerb && options.classicVerbs.has(cmd.noun) && !isHelp(verb))
        return null;
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
    const spec = cmd.verbs[verb];
    let emitted = false;
    const ctx = {
        flags: {},
        cwd: options.cwd ?? process.cwd(),
        json: false,
        log: (message) => io.stderr(`${tag} ${message}\n`),
        emit: (output) => {
            if (emitted)
                throw new Error(`${tag} ${verb} emitted twice — one output object per run`);
            emitted = true;
            io.stdout(ctx.json ? `${JSON.stringify(output)}\n` : renderText(textOutput(spec, output)));
        },
    };
    // The journal never changes the verb's exit code, output or throw: each write is
    // swallowed, and the first failure logs one line.
    const journal = options.journal ?? engineJournal();
    let journalWarned = false;
    const guarded = (write) => {
        try {
            write();
        }
        catch (err) {
            if (journalWarned)
                return;
            journalWarned = true;
            io.stderr(`[bkit-telemetry] journal write failed: ${err.message}\n`);
        }
    };
    const excluded = new Set([...Object.keys(SHARED_EXIT_CODES), ...Object.keys(spec.exitCodes ?? {})].map(Number));
    let input;
    /** undefined: not dispatched; null: the verb threw; a number: its exit code. */
    let outcome;
    try {
        const own = rest.filter((arg) => arg !== JSON_FLAG);
        if (own.some((arg) => arg.startsWith(`${JSON_FLAG}=`))) {
            throw new CommandError(EXIT.USAGE, `${JSON_FLAG} takes no value`);
        }
        ctx.json = own.length !== rest.length;
        ctx.flags = parseFlags(own, spec.flags);
        input = { noun: cmd.noun, verb, argv: rest, flags: ctx.flags, cwd: ctx.cwd };
        const entered = input;
        guarded(() => journal.call(entered));
        outcome = null;
        const code = await spec.run(ctx);
        outcome = code;
        return code;
    }
    catch (err) {
        if (!(err instanceof CommandError))
            throw err;
        io.stderr(`${tag} ${err.message}\n`);
        outcome = err.code;
        return err.code;
    }
    finally {
        if (input !== undefined && outcome !== undefined && shouldRecordFriction(outcome, excluded)) {
            const failed = { ...input, code: outcome };
            guarded(() => journal.failure(failed));
        }
    }
}
// ---------------------------------------------------------------------------
// Repo facts
// ---------------------------------------------------------------------------
/** Captured stdout / stderr cap for every git / gh spawn; hook output (pre-push) counts. */
export const OUTPUT_LIMIT = 1 << 26;
/** Spawn error as a stderr lead line: ENOBUFS names the limit, anything else Node's message. */
function spawnErrorText(cmd, args, err) {
    return err.code === "ENOBUFS"
        ? `${cmd} ${args[0] ?? ""}: output passed the ${OUTPUT_LIMIT / (1 << 20)} MiB limit (ENOBUFS)`
        : err.message;
}
/** `git <args>` in `cwd`, never throwing: exit status plus trimmed stdout / stderr; `env` adds vars. */
export function runGit(cwd, args, env = {}) {
    const res = spawnSync("git", args, {
        cwd,
        encoding: "utf-8",
        env: { ...gitEnv(), ...env },
        maxBuffer: OUTPUT_LIMIT,
    });
    const stderr = (res.stderr ?? "").trim();
    return {
        ok: !res.error && res.status === 0,
        stdout: (res.stdout ?? "").trim(),
        stderr: res.error
            ? [spawnErrorText("git", args, res.error), stderr].filter(Boolean).join("\n")
            : stderr,
    };
}
/** `git <args>` in `cwd`; stdout trimmed, or null on a non-zero exit. */
export function git(cwd, args) {
    const res = runGit(cwd, args);
    return res.ok ? res.stdout : null;
}
/**
 * True when git's ignore rules match `rel` in `cwd`. A tracked file reads as not
 * ignored, so an ignored `rel` is always an untracked file git would refuse to
 * `add` when a pathspec names it (the guard `:(exclude)` and `--pathspec-from-file`
 * trip). Check before naming a path in an add pathspec.
 */
export function isIgnoredPath(cwd, rel) {
    return runGit(cwd, ["check-ignore", "-q", "--", rel]).ok;
}
/** `JSON.parse` as a result instead of a throw; each caller says what bad input means for it. */
// Shared with the files that are not commands (checks, install): re-exported here
// for the command modules that already import it from this module.
export { parseJson } from "../shared/json.js";
// The shared-branch rule (`dev`, `main`) lives in shared/ so checks can read it too.
export { DEV, MAIN, isSharedBranch } from "../shared/branches.js";
/**
 * Run a tool other than git, never throwing. Hook-exported GIT_* vars are scrubbed
 * so gh and friends answer for `cwd`; `input` goes to stdin.
 */
export function runTool(cmd, args, cwd, opts = {}) {
    const res = spawnSync(cmd, args, {
        cwd,
        encoding: "utf-8",
        env: { ...gitEnv(), ...opts.env },
        input: opts.input,
        maxBuffer: OUTPUT_LIMIT,
    });
    if (res.error && res.pid === 0) {
        return { found: false, status: 127, stdout: "", stderr: `${cmd} not found on PATH` };
    }
    const status = res.status ?? 128 + signalNumber(res.signal);
    return {
        found: true,
        // A spawn error is never a success: the child can exit 0 before ENOBUFS kills it.
        status: res.error && status === 0 ? 1 : status,
        stdout: res.stdout ?? "",
        stderr: res.error
            ? [spawnErrorText(cmd, args, res.error), res.stderr ?? ""].filter(Boolean).join("\n")
            : (res.stderr ?? ""),
    };
}
const signalNumber = (signal) => (signal ? os.constants.signals[signal] : undefined) ?? 1;
/** `gh <args>` in `cwd`, never throwing; `input` goes to stdin; `env` is added to the child's. */
export function runGh(cwd, args, input, env) {
    const res = runTool("gh", args, cwd, { input, env });
    return {
        ok: res.found && res.status === 0,
        stdout: res.stdout.trim(),
        stderr: res.stderr.trim(),
        missing: !res.found,
        status: res.status,
    };
}
/**
 * gh cannot serve this call here: not installed, exit 4 (not logged in), or an
 * HTTP 403 — a token or proxy that may not use this API, where the GitHub MCP
 * (its own credentials) can.
 */
export const ghUnavailable = (res) => res.missing || res.status === 4 || (!res.ok && /\bHTTP 403\b/.test(res.stderr));
/**
 * The main checkout's root from any worktree, or `null` when not inside a git repo.
 * `--git-common-dir` points at the shared `.git`, so a linked worktree resolves to the
 * same root as the main one.
 */
export function mainCheckoutRoot(cwd) {
    const common = git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
    return common ? path.dirname(common) : null;
}
/**
 * The main checkout's root, from any worktree. `--git-common-dir` points at the
 * shared `.git`, so a linked worktree resolves to the same root as the main one.
 */
export function repoRoot(cwd) {
    const root = mainCheckoutRoot(cwd);
    if (!root)
        throw new CommandError(EXIT.USAGE, `not inside a git repository: ${cwd}`);
    return root;
}
/** `<git common dir>/bkit-outbox`: per-run scratch files, never committed; null outside a git repo. */
export function outboxRoot(cwd) {
    const common = git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
    return common ? path.join(common, "bkit-outbox") : null;
}
/** An outbox path as a committed record names it: relative to the main checkout, never a home path. */
export function outboxRel(cwd, file) {
    const root = outboxRoot(cwd);
    if (root === null)
        return file;
    const rel = path.relative(path.dirname(path.dirname(root)), file);
    return rel.startsWith("..") || path.isAbsolute(rel) ? file : rel.split(path.sep).join("/");
}
/** `YYYYMM` in UTC, so every workflow picks the same month bucket at a month boundary. */
export function utcMonth(now = new Date()) {
    return `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}
/** `docs/plans/{month}/logs/{fid}/status.jsonl`, relative to whichever root holds it. */
export const statusRelPath = (month, fid) => path.join("docs", "plans", month, "logs", fid, "status.jsonl");
/**
 * Where a workflow's `status.jsonl` lives. One rule per workflow kind:
 *
 * - design / plan / build / debug: the feature worktree's copy when it exists
 *   (`.worktrees/{fid}`), else the main checkout's.
 * - ship: the current worktree's top — the tree ship works in (the feature
 *   worktree, or the adopted checkout), so asked from inside it.
 */
export function statusLocation(opts) {
    const root = repoRoot(opts.cwd);
    const rel = statusRelPath(opts.month, opts.fid);
    if (opts.workflow === "ship") {
        const bookRoot = git(opts.cwd, ["rev-parse", "--show-toplevel"]) ?? root;
        return { bookRoot, path: path.join(bookRoot, rel) };
    }
    const worktree = path.join(root, ".worktrees", opts.fid);
    const bookRoot = fs.existsSync(path.join(worktree, rel)) ? worktree : root;
    return { bookRoot, path: path.join(bookRoot, rel) };
}
/** The tokens GitHub Actions honours to skip every workflow run for a commit. */
export const SKIP_CI_TOKEN = /\[(?:skip ci|ci skip|no ci|skip actions|actions skip)\]/i;
/** A commit's full message, or null when it cannot be read (`%B` is never empty for a real commit). */
export function commitMessage(cwd, sha) {
    const res = runGit(cwd, ["log", "-1", "--format=%B", sha]);
    return res.ok && res.stdout !== "" ? res.stdout : null;
}
/**
 * The skip-CI token in a commit's BODY, or null; undefined when the commit cannot
 * be read. The subject is excluded (a docs-only commit carries `[skip ci]` in its
 * subject by convention); the body is where a squash concatenates branch subjects.
 */
export function bodySkipToken(cwd, sha) {
    const msg = sha === "" ? null : commitMessage(cwd, sha);
    if (msg === null)
        return undefined;
    return SKIP_CI_TOKEN.exec(msg.split("\n").slice(1).join("\n"))?.[0] ?? null;
}
