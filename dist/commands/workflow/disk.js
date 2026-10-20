// bkit disk prune — runs the person's own cleanup steps. bkit itself deletes nothing.
//
// Steps live in two optional files the person owns, copied from
// `.bkit/templates/scripts/cleanup/`: the checkout's `scripts/cleanup/bkit-disk-prune.mjs`
// (steps for this checkout, run from its top) and `disk-prune.mjs` in the bkit config folder
// (`~/.config/bkit/`; steps for tools every repo on the machine shares, run from the home
// folder). Each exports a list of steps; `max` also runs every `min` step. No file → nothing
// runs, and worktree setup checks nothing.
//
// `--auto` is the hooks' entry: a mode runs at most once a day per machine, and `max` at
// most once an hour while free disk is under `bkit.disk.minFreeGb`; the sweep then runs
// detached and logs to the bkit cache folder, so the hook does not wait. `bkit worktrees
// setup` calls `ensureDiskSpace` before it mints. A lock in the cache folder keeps one sweep
// at a time across every repo. CI and cloud sessions run nothing.
//
// A step calls `note()` for what it found but would not delete on its own (a worktree with
// uncommitted files, say). Each sweep replaces its checkout's notes in the cache folder;
// `bkit tips` lists them first, so the workflow that prints its tips surfaces them.
import { spawn, spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { pathToFileURL } from "node:url";
import { isCloudOrCi } from "../../checks/before/env.js";
import { readJsonFile } from "../../shared/json.js";
import { readBkitConfig } from "../../shared/settings.js";
import { CommandError, EXIT, git, repoRoot } from "../lib.js";
import { tryCreate } from "./locks.js";
const MODES = ["min", "max"];
export const REPO_STEPS = "scripts/cleanup/bkit-disk-prune.mjs";
const TEMPLATES = ".bkit/templates/scripts/cleanup/";
const SETTING = "bkit.disk.minFreeGb";
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
/** A lock this old, or whose process is gone, belongs to a sweep that died. */
const LOCK_STALE_MS = HOUR_MS;
const GB = 1e9;
const configDir = () => path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config"), "bkit");
const cacheDir = () => path.join(process.env.XDG_CACHE_HOME || path.join(os.homedir(), ".cache"), "bkit");
export const machineStepsPath = () => path.join(configDir(), "disk-prune.mjs");
export const sweepLogPath = () => path.join(cacheDir(), "disk-prune.log");
const lockPath = () => path.join(cacheDir(), "disk-prune.lock");
const stampPath = (name) => path.join(cacheDir(), `disk-prune-${name}.stamp`);
const notesPath = () => path.join(cacheDir(), "disk-prune-notes.json");
/** Notes older than this are dropped: no sweep has run there since. */
const NOTES_STALE_MS = 7 * DAY_MS;
const gb = (bytes) => (bytes === null ? "?" : `${(bytes / GB).toFixed(1)} GB`);
const errorText = (err) => (err instanceof Error ? err.message : String(err));
const checkoutTop = (cwd) => git(cwd, ["rev-parse", "--show-toplevel"]) ?? cwd;
/** The step files that exist for `cwd`, repo first. */
function stepFilePaths(cwd) {
    const top = checkoutTop(cwd);
    return [
        { scope: "repo", file: path.join(top, REPO_STEPS), cwd: top },
        { scope: "machine", file: machineStepsPath(), cwd: os.homedir() },
    ].filter((f) => fs.existsSync(f.file));
}
const isAction = (v) => typeof v === "string" || typeof v === "function";
function stepProblem(step) {
    if (step === null || typeof step !== "object")
        return "not an object";
    const s = step;
    if (typeof s.name !== "string" || s.name.trim() === "")
        return "name must be a non-empty string";
    if (!MODES.includes(s.mode))
        return `${s.name}: mode must be "min" or "max"`;
    if (!isAction(s.run))
        return `${s.name}: run must be a shell command or a function`;
    if (s.skip !== undefined && !isAction(s.skip))
        return `${s.name}: skip must be a shell command or a function`;
    if (s.paths !== undefined &&
        !(Array.isArray(s.paths) && s.paths.every((p) => typeof p === "string")))
        return `${s.name}: paths must be a list of strings`;
    return null;
}
async function loadStepFile(at) {
    let list;
    try {
        list = (await import(pathToFileURL(at.file).href)).default;
    }
    catch (err) {
        return { ...at, steps: [], error: `could not load: ${errorText(err)}` };
    }
    if (!Array.isArray(list)) {
        return { ...at, steps: [], error: "its default export is not a list of steps" };
    }
    const steps = [];
    const problems = [];
    for (const [i, step] of list.entries()) {
        const problem = stepProblem(step);
        if (problem === null)
            steps.push(step);
        else
            problems.push(`step ${i + 1}: ${problem}`);
    }
    return { ...at, steps, error: problems.length > 0 ? problems.join("; ") : null };
}
// ---------------------------------------------------------------------------
// Disk, sizes, stamps, lock
// ---------------------------------------------------------------------------
/** Bytes free to this user on the filesystem holding `dir`; null when unreadable. */
export function freeBytes(dir) {
    try {
        const s = fs.statfsSync(dir);
        return s.bavail * s.bsize;
    }
    catch {
        return null;
    }
}
/** Total size of everything `patterns` match under `cwd`; null when `du` cannot answer. */
function sizeOf(patterns, cwd) {
    const matches = patterns.flatMap((p) => {
        const abs = p.startsWith("~/") ? path.join(os.homedir(), p.slice(2)) : path.resolve(cwd, p);
        return fs.globSync(abs);
    });
    if (matches.length === 0)
        return 0;
    const r = spawnSync("du", ["-sk", ...matches], { encoding: "utf-8" });
    if (r.error || r.stdout === "")
        return null;
    return r.stdout
        .trim()
        .split("\n")
        .reduce((sum, line) => sum + Number(line.split(/\s/)[0] ?? 0) * 1024, 0);
}
function due(name, everyMs, now) {
    const st = fs.statSync(stampPath(name), { throwIfNoEntry: false });
    return st === undefined || now - st.mtimeMs >= everyMs;
}
function touch(...names) {
    fs.mkdirSync(cacheDir(), { recursive: true });
    for (const name of names)
        fs.writeFileSync(stampPath(name), `${new Date().toISOString()}\n`);
}
function pidAlive(pid) {
    try {
        process.kill(pid, 0);
        return true;
    }
    catch (err) {
        return err.code === "EPERM";
    }
}
/** Take the sweep lock; a dead or hour-old holder's lock is replaced. False when held. */
function takeLock() {
    const file = lockPath();
    const line = `${new Date().toISOString()} ${process.pid}`;
    if (tryCreate(file, line))
        return true;
    const st = fs.statSync(file, { throwIfNoEntry: false });
    const holder = st === undefined ? "" : fs.readFileSync(file, "utf-8");
    const pid = Number(holder.split(/\s+/)[1]);
    const live = st !== undefined && Date.now() - st.mtimeMs < LOCK_STALE_MS;
    if (live && Number.isInteger(pid) && pid > 0 && pidAlive(pid))
        return false;
    fs.rmSync(file, { force: true });
    return tryCreate(file, line);
}
function releaseLock() {
    const file = lockPath();
    const pid = fs.existsSync(file) ? fs.readFileSync(file, "utf-8").split(/\s+/)[1] : undefined;
    if (pid === String(process.pid))
        fs.rmSync(file, { force: true });
}
function shell(command, cwd, log) {
    const r = spawnSync("sh", ["-c", command], { cwd, encoding: "utf-8", maxBuffer: 1 << 26 });
    const out = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();
    if (out !== "")
        for (const line of out.split("\n").slice(-20))
            log(`  ${line}`);
    return r.error ? 127 : (r.status ?? 1);
}
async function skipReason(step, ctx) {
    if (step.skip === undefined)
        return null;
    if (typeof step.skip === "string") {
        return shell(step.skip, ctx.cwd, ctx.log) === 0 ? `skip check passed: ${step.skip}` : null;
    }
    const answer = await step.skip(ctx);
    if (!answer)
        return null;
    return typeof answer === "string" ? answer : "its skip check said so";
}
async function runStep(step, ctx) {
    try {
        const reason = await skipReason(step, ctx);
        if (reason !== null)
            return { outcome: "skipped", detail: reason };
        if (typeof step.run === "string") {
            const status = shell(step.run, ctx.cwd, ctx.log);
            if (status !== 0)
                return { outcome: "failed", detail: `exit ${status}` };
        }
        else {
            await step.run(ctx);
        }
        return { outcome: "ran", detail: null };
    }
    catch (err) {
        return { outcome: "failed", detail: errorText(err) };
    }
}
/**
 * Run the `mode` steps from every step file for `cwd`, one at a time, repo file first.
 * `dryRun` runs nothing and sizes each step's paths instead.
 */
export async function sweep(opts) {
    const result = {
        reason: null,
        files: [],
        steps: [],
        notes: [],
        freeBefore: null,
        freeAfter: null,
    };
    if (isCloudOrCi())
        return { ...result, reason: "ci" };
    const files = await Promise.all(stepFilePaths(opts.cwd).map(loadStepFile));
    result.files = files.map((f) => ({
        scope: f.scope,
        file: f.file,
        steps: f.steps.length,
        error: f.error,
    }));
    for (const f of files)
        if (f.error !== null)
            opts.log(`${f.file}: ${f.error}`);
    if (files.length === 0) {
        opts.log(`no cleanup steps: copy ${TEMPLATES}bkit-disk-prune.mjs to ${REPO_STEPS} and/or ${TEMPLATES}bkit-disk-prune.machine.mjs to ${machineStepsPath()}`);
        return { ...result, reason: "no-steps" };
    }
    const chosen = files.flatMap((f) => f.steps.filter((s) => s.mode === "min" || opts.mode === "max").map((step) => ({ f, step })));
    if (opts.dryRun) {
        for (const { f, step } of chosen) {
            const bytes = step.paths ? sizeOf(step.paths, f.cwd) : null;
            result.steps.push({
                scope: f.scope,
                name: step.name,
                mode: step.mode,
                outcome: "would-run",
                detail: null,
                bytes,
            });
            opts.log(`${f.scope}: ${step.name} (${step.mode})${bytes === null ? "" : ` — ${gb(bytes)}`}`);
        }
        return result;
    }
    if (!takeLock()) {
        opts.log(`another sweep is running (${lockPath()})`);
        return { ...result, reason: "locked" };
    }
    try {
        result.freeBefore = freeBytes(opts.cwd);
        opts.log(`${new Date().toISOString()} ${opts.mode} sweep, ${gb(result.freeBefore)} free`);
        const note = (message) => {
            result.notes.push(message);
            opts.log(`to review: ${message}`);
        };
        for (const { f, step } of chosen) {
            const r = await runStep(step, { cwd: f.cwd, log: opts.log, note });
            result.steps.push({ scope: f.scope, name: step.name, mode: step.mode, ...r, bytes: null });
            opts.log(`${f.scope}: ${step.name} — ${r.outcome}${r.detail === null ? "" : ` (${r.detail})`}`);
        }
        result.freeAfter = freeBytes(opts.cwd);
        opts.log(`${gb(result.freeBefore)} → ${gb(result.freeAfter)} free`);
        saveNotes(checkoutTop(opts.cwd), result.notes);
    }
    finally {
        releaseLock();
    }
    return result;
}
/** The notes file; `{}` when missing or not a JSON object (the next sweep rewrites it). */
function readNotesFile() {
    const r = readJsonFile(notesPath());
    return r.ok && r.value !== null && typeof r.value === "object" && !Array.isArray(r.value)
        ? r.value
        : {};
}
/** Replace `top`'s notes with `notes`; none clears its entry. */
function saveNotes(top, notes) {
    const all = readNotesFile();
    if (notes.length === 0)
        delete all[top];
    else
        all[top] = { at: new Date().toISOString(), notes };
    fs.mkdirSync(cacheDir(), { recursive: true });
    fs.writeFileSync(notesPath(), `${JSON.stringify(all, null, 2)}\n`);
}
/**
 * The last sweep's notes for the checkout holding `cwd` and for the main checkout (where
 * the worktree step runs), so a workflow inside its worktree sees both; stale or absent
 * entries add none.
 */
export function readNotes(cwd, now = Date.now()) {
    const all = readNotesFile();
    const tops = new Set([checkoutTop(cwd)]);
    try {
        tops.add(repoRoot(cwd));
    }
    catch {
        // Not a git repository: only the folder itself.
    }
    const notes = [];
    for (const top of tops) {
        const entry = all[top];
        if (!entry || !Array.isArray(entry.notes))
            continue;
        const at = Date.parse(entry.at);
        if (!Number.isFinite(at) || now - at >= NOTES_STALE_MS)
            continue;
        for (const n of entry.notes)
            if (typeof n === "string" && !notes.includes(n))
                notes.push(n);
    }
    return notes;
}
/** `notes` as the markdown block `bkit tips` prints first; "" when none. */
export function formatNotes(notes) {
    if (notes.length === 0)
        return "";
    return [
        "**Found by the disk clean-up, left for you to decide** (`bkit disk prune`):",
        ...notes.map((n) => `- ${n}`),
        'Ask your agent: "Show me each of these and remove the ones I no longer need."',
    ].join("\n");
}
// ---------------------------------------------------------------------------
// Scheduling (hooks) and the worktree check
// ---------------------------------------------------------------------------
/** Start `bkit disk prune --mode=<mode>` detached, its output appended to the sweep log. */
function spawnDetached(mode, cwd) {
    fs.mkdirSync(cacheDir(), { recursive: true });
    const fd = fs.openSync(sweepLogPath(), "a");
    const child = spawn(process.execPath, [...process.execArgv, process.argv[1], "disk", "prune", `--mode=${mode}`], { cwd, detached: true, stdio: ["ignore", fd, fd] });
    child.unref();
    fs.closeSync(fd);
}
/**
 * `--auto`: start a detached sweep when one is due. Under `minFreeGb` free → `max`, at
 * most hourly; else `mode`, at most daily. A `max` run also counts as that day's `min`.
 */
export function schedule(opts) {
    if (isCloudOrCi())
        return { started: null, reason: "ci" };
    if (stepFilePaths(opts.cwd).length === 0)
        return { started: null, reason: "no-steps" };
    const now = opts.now ?? Date.now();
    const start = opts.start ?? spawnDetached;
    const free = freeBytes(opts.cwd);
    if (free !== null && free < opts.minFreeGb * GB) {
        if (!due("low", HOUR_MS, now))
            return { started: null, reason: "not-due" };
        touch("low", "max", "min");
        start("max", opts.cwd);
        return { started: "max", reason: "low-disk" };
    }
    if (!due(opts.mode, DAY_MS, now))
        return { started: null, reason: "not-due" };
    touch(...(opts.mode === "max" ? ["max", "min"] : ["min"]));
    start(opts.mode, opts.cwd);
    return { started: opts.mode, reason: "due" };
}
/**
 * Before worktree setup mints: under `minFreeGb` free with step files present, run the
 * `max` steps and check again. Null = carry on; else why the worktree must not be made.
 */
export async function ensureDiskSpace(opts) {
    if (isCloudOrCi() || stepFilePaths(opts.cwd).length === 0)
        return null;
    const min = opts.minFreeGb * GB;
    const before = freeBytes(opts.cwd);
    if (before === null || before >= min)
        return null;
    opts.log(`${gb(before)} free, under ${SETTING} (${opts.minFreeGb} GB) — running your max cleanup steps`);
    touch("low", "max", "min");
    const ran = await sweep({ cwd: opts.cwd, mode: "max", dryRun: false, log: opts.log });
    const after = freeBytes(opts.cwd);
    if (after === null || after >= min)
        return null;
    opts.log("what your max steps still cover:");
    await sweep({ cwd: opts.cwd, mode: "max", dryRun: true, log: opts.log });
    const locked = ran.reason === "locked" ? " (another sweep was running — re-run once it ends)" : "";
    return `${gb(after)} free after your max cleanup steps, still under ${SETTING} (${opts.minFreeGb} GB)${locked} — free space by hand or add steps (.bkit/templates.md § Disk prune), then re-run`;
}
// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------
export const diskCommand = {
    noun: "disk",
    summary: "Free disk with your own cleanup steps; bkit itself deletes nothing.",
    verbs: {
        prune: {
            summary: `Run the min or max steps from ${REPO_STEPS} and ~/.config/bkit/disk-prune.mjs.`,
            flags: [
                {
                    name: "mode",
                    type: "string",
                    required: true,
                    help: "min (stale, cheap) or max (min plus everything that comes back by itself)",
                },
                {
                    name: "dry-run",
                    type: "boolean",
                    help: "run nothing; list each step with the size of its paths",
                },
                {
                    name: "auto",
                    type: "boolean",
                    help: `for hooks: run detached, at most once a day per mode; max at most hourly while free disk is under ${SETTING}`,
                },
            ],
            output: {
                mode: "the mode asked for",
                reason: "why nothing ran: ci | no-steps | locked, --auto also not-due; low-disk | due when --auto started a sweep; null when the steps ran",
                started: "--auto: the mode started in the background (max when disk is low); else null",
                files: "step files found: [{scope: repo|machine, file, steps, error}]",
                steps: "[{scope, name, mode, outcome: ran|failed|skipped|would-run, detail, bytes}]",
                notes: "what steps left for you to decide (`bkit tips` lists them until the next sweep)",
                freeBefore: "bytes free before the steps ran; null when they did not",
                freeAfter: "bytes free after the steps ran; null when they did not",
            },
            run: async (ctx) => {
                const mode = String(ctx.flags.mode);
                if (!MODES.includes(mode))
                    throw new CommandError(EXIT.USAGE, "--mode must be min or max");
                const dryRun = ctx.flags.dryRun === true;
                if (ctx.flags.auto === true) {
                    if (dryRun)
                        throw new CommandError(EXIT.USAGE, "give --auto or --dry-run, not both");
                    const plan = schedule({
                        cwd: ctx.cwd,
                        mode: mode,
                        minFreeGb: readBkitConfig(checkoutTop(ctx.cwd)).diskMinFreeGb,
                    });
                    if (plan.started !== null)
                        ctx.log(`${plan.started} cleanup started in the background — log: ${sweepLogPath()}`);
                    ctx.emit({
                        mode,
                        ...plan,
                        files: [],
                        steps: [],
                        notes: [],
                        freeBefore: null,
                        freeAfter: null,
                    });
                    return EXIT.OK;
                }
                const r = await sweep({ cwd: ctx.cwd, mode: mode, dryRun, log: ctx.log });
                ctx.emit({ mode, started: null, ...r });
                const failed = r.files.some((f) => f.error !== null) || r.steps.some((s) => s.outcome === "failed");
                return failed ? EXIT.NO : EXIT.OK;
            },
        },
    },
};
