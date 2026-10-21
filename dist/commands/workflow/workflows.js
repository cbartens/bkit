// bkit workflows start|fail|handover|close|promote|links — a phase workflow's
// lifecycle state.
//
// start     takes the feature lock (or checks the one Step 1 took) and opens a run
//           with a `workflow-started` row, unless this is a resume of the same
//           workflow's IN_PROGRESS run.
// fail      the Failure Path's state and payloads: `workflow-failed` row, abort an
//           in-progress rebase, release the lock, clear the sentinels, say whether
//           a handover is due, and print the `bkit:failed` label set and the
//           failure comment. The tracker calls stay in the workflow.
// handover  after the handover subagent: commit and abort-push it (`--push`), or
//           ship's one-commit flush (`--flush`), and print the handover comment.
// close     grade compliance, then the `workflow-done` row, the run's counter and
//           outcome rows in `.bkit/stats.jsonl`, this workflow's telemetry report
//           and the artifact links. `--flush` is ship's close: land it on dev
//           through a throwaway origin/dev checkout, then remove the worktree.
// promote   design / plan close: the highest versioned draft becomes the
//           canonical doc (anchor stamped, a superseded canonical archived).
// links     the feature docs and this workflow's logs on a ref, as markdown links.
import * as fs from "node:fs";
import * as path from "node:path";
import { appendLine, fold, runNumber, runOrStepField, statusTimestamp, } from "../../ledgers/status.js";
import { appendLine as telemetryLine, foldFrom, resolveRepoSlug, validate, workflowTelemetry, } from "../../ledgers/telemetry.js";
import { readBkitVersion } from "../../install/version-file.js";
import { gradeCompliance } from "../comply.js";
import { landDir, pushToDev } from "../land.js";
import { CommandError, DEV, EXIT, git, isSharedBranch, parseJson, repoRoot, runGh, runGit, statusLocation, statusRelPath, } from "../lib.js";
import { anchorBkitStatus, pushBranch, readAnchor, stampAnchor } from "./branches.js";
import { AUTO_LABEL, AUTO_ROUTE_SUFFIX, buildComment, linearState, transitionLabels, } from "./issues.js";
import { EXIT_EMPTY, commitBookkeeping, unionLedgers } from "./ledgers.js";
import { EXIT_REMOVE_FAILED, EXIT_SPLIT_BUCKET, acquireWorkflowLock, owns, readHolder, releaseLock, resolveMonth, workflowLockPath, } from "./locks.js";
import { mergePr, probePr } from "./prs.js";
import { FEATURE_STATUS } from "./roadmap.js";
import { EXIT_NO_STATUS, WORKFLOW_FLAG, positiveInt, readRuns, readStatusEvents, readStatusRows, str, } from "./status.js";
import { writeStepRow } from "./steps.js";
import { removeWorktree } from "./worktrees.js";
/** Sentinels a workflow leaves in its logs folder; either one existing means a handover is due. */
export const SENTINELS = [".rebase-failed", ".deferred-blocked"];
/** Exit code (start --lock-held): the lock is missing or belongs to another owner. */
export const EXIT_LOCK_NOT_HELD = 6;
/** Exit code (handover --push): the branch has an open PR, so nothing was pushed. */
export const EXIT_OPEN_PR_KEPT = 9;
/** Exit code (handover, close --flush): a push failed. */
export const EXIT_PUSH_FAILED = 10;
/** Exit code (handover --flush, close --flush): a dev checkout, commit or worktree step failed. */
export const EXIT_FLUSH_FAILED = 11;
/** Exit code (promote): no versioned draft to promote. */
export const EXIT_NO_VERSION = 12;
function workflowName(workflow) {
    if (!Object.hasOwn(FEATURE_STATUS, workflow))
        throw new CommandError(EXIT.USAGE, `--workflow must be ${Object.keys(FEATURE_STATUS).join(", ")}`);
    return workflow;
}
/** start and close work in the current tree, the root `git rev-parse --show-toplevel` reports. */
function whereInTree(cwd, o) {
    const root = repoRoot(cwd);
    const month = resolveMonth(root, o.fid, o.month);
    const tree = git(cwd, ["rev-parse", "--show-toplevel"]) ?? root;
    const status = o.file ? path.resolve(cwd, o.file) : path.join(tree, statusRelPath(month, o.fid));
    return { root, month, tree, status };
}
const headSha = (cwd) => git(cwd, ["rev-parse", "HEAD"]) ?? "";
const logDirRel = (month, fid) => path.join("docs", "plans", month, "logs", fid);
const list = (v) => v ?? [];
// ---------------------------------------------------------------------------
// start
// ---------------------------------------------------------------------------
function checkHeldLock(file, who) {
    const holder = readHolder(file);
    if (holder === undefined)
        throw new CommandError(EXIT_LOCK_NOT_HELD, `no lock at ${file}`);
    if (!owns(holder, who))
        throw new CommandError(EXIT_LOCK_NOT_HELD, `${file} is held by another owner: ${holder.line}`);
}
// ---------------------------------------------------------------------------
// fail
// ---------------------------------------------------------------------------
/**
 * Abort a rebase left in progress in `tree`. `git rev-parse --git-path X` always
 * exits 0 (it only computes the path), so the directory's existence is the test.
 */
function abortRebase(tree, log) {
    const inProgress = ["rebase-merge", "rebase-apply"].some((name) => {
        const p = git(tree, ["rev-parse", "--path-format=absolute", "--git-path", name]);
        return p !== null && fs.existsSync(p);
    });
    if (!inProgress)
        return false;
    const res = runGit(tree, ["rebase", "--abort"]);
    if (!res.ok)
        log(`git rebase --abort failed in ${tree}: ${res.stderr}`);
    return res.ok;
}
/** The workflow-failed state: row, rebase abort, lock release, sentinels. */
function failState(ctx, workflow, fid) {
    const root = repoRoot(ctx.cwd);
    const month = resolveMonth(root, fid, str(ctx.flags.month) || undefined);
    const file = str(ctx.flags.file) || undefined;
    const status = file
        ? path.resolve(ctx.cwd, file)
        : statusLocation({ cwd: ctx.cwd, workflow, fid, month }).path;
    // The run's own tree: the feature worktree when there is one, else this checkout.
    // Never the main checkout behind a worktree, where a rebase would be a human's.
    const worktree = path.join(root, ".worktrees", fid);
    const tree = fs.existsSync(worktree)
        ? worktree
        : (git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? root);
    // Abort first: the abort resets the tree, which would drop a row appended to a
    // tracked status.jsonl before it.
    const rebaseAborted = abortRebase(tree, ctx.log);
    let row = null;
    let soak = false;
    if (fs.existsSync(status)) {
        soak =
            workflow === "debug" && runOrStepField(readRuns(status), "debug", "debugMode") === "SOAK";
        row = { type: "workflow-failed", workflow, at: statusTimestamp() };
        fs.appendFileSync(status, appendLine(row));
    }
    else {
        ctx.log(`${status} does not exist — no workflow-failed row written`);
    }
    const lockFile = workflowLockPath(root, month, fid);
    const { removeFailed, ...lock } = releaseLock(lockFile, {
        workflow,
        fid,
        token: str(ctx.flags.token),
    });
    if (lock.heldBy !== null)
        ctx.log(`${lockFile} belongs to another owner, left in place: ${lock.heldBy}`);
    if (removeFailed)
        ctx.log(`lock removal failed: ${lockFile}`);
    // Each sentinel is cleared where it was created: `.rebase-failed` in the run's
    // tree, `.deferred-blocked` beside status.jsonl.
    const logDirs = new Set([path.join(tree, logDirRel(month, fid)), path.dirname(status)]);
    const sentinels = [];
    for (const dir of logDirs) {
        for (const name of SENTINELS) {
            const p = path.join(dir, name);
            if (!fs.existsSync(p))
                continue;
            sentinels.push({ name, path: p });
            fs.rmSync(p, { force: true });
        }
    }
    return { row, rebaseAborted, lock, sentinels, removeFailed, soak };
}
function failVerb(ctx) {
    const workflow = workflowName(String(ctx.flags.workflow));
    // An empty value is a placeholder not held yet (the failure came before it was set).
    const fid = str(ctx.flags.fid) || undefined;
    const token = str(ctx.flags.token) || undefined;
    if (token !== undefined && fid === undefined)
        throw new CommandError(EXIT.USAGE, "--token needs --fid");
    // State only for a run that took the lock: without the token the failure came
    // before Step 1 locked, and nothing here is this run's to change.
    const state = token === undefined || fid === undefined
        ? {
            row: null,
            rebaseAborted: false,
            lock: null,
            sentinels: [],
            removeFailed: false,
            soak: false,
        }
        : failState(ctx, workflow, fid);
    // Labels: bkit:failed added; a ship whose PR already merged also moves to bkit:merged.
    const pr = str(ctx.flags.pr) || undefined;
    let prState = null;
    if (pr !== undefined && pr !== "") {
        const probed = probePr(ctx.cwd, { number: pr, state: "open" });
        prState = probed.kind === "ok" ? (probed.pr?.state ?? null) : null;
    }
    const merged = prState === "MERGED";
    const transition = merged ? { phase: "merged" } : { failed: true };
    const current = list(ctx.flags.label);
    const labels = transitionLabels(current, transition).labels;
    if (merged && !labels.includes("bkit:failed"))
        labels.push("bkit:failed");
    const add = labels.filter((l) => !current.includes(l));
    // The failure comment, when the step is named.
    let comment = null;
    const stepNumber = str(ctx.flags.stepNumber);
    if (stepNumber !== undefined) {
        const errorFile = str(ctx.flags.errorFile);
        const error = errorFile === undefined ? (str(ctx.flags.error) ?? "") : readText(ctx.cwd, errorFile);
        comment = buildComment(ctx.cwd, {
            kind: "failure",
            stepNumber,
            stepTitle: str(ctx.flags.stepTitle),
            subStep: str(ctx.flags.subStep),
            error: state.removeFailed ? `${error}; Lock removal failed` : error,
            stderrFile: str(ctx.flags.stderrFile) || undefined,
        });
    }
    ctx.emit({
        row: state.row,
        rebaseAborted: state.rebaseAborted,
        lock: state.lock,
        sentinels: state.sentinels,
        handoverNeeded: token !== undefined &&
            (ctx.flags.maxExceeded === true || state.sentinels.length > 0 || state.soak),
        add,
        labels,
        linearState: linearState(transition, undefined),
        prState,
        comment,
    });
    return state.removeFailed ? EXIT_REMOVE_FAILED : EXIT.OK;
}
/** A text file's content, trailing newlines dropped; a missing file is a usage error. */
function readText(cwd, rel) {
    const abs = path.resolve(cwd, rel);
    if (!fs.existsSync(abs))
        throw new CommandError(EXIT.USAGE, `${rel} does not exist`);
    return fs.readFileSync(abs, "utf-8").replace(/\n+$/, "");
}
// ---------------------------------------------------------------------------
// handover
// ---------------------------------------------------------------------------
/** Non-empty lines; a final newline ends the last line rather than starting an empty one. */
const textLines = (text) => text.split("\n").filter((l) => l.trim() !== "");
/** `rel` in `tree` differs from its HEAD copy, or is untracked: the run wrote it. */
const ownWrite = (tree, rel) => (git(tree, ["status", "--porcelain", "--untracked-files=all", "--", rel]) ?? "") !== "";
/** Copy each `.md` log in the run's log folder that dev lacks, or that the run rewrote. */
function carryLogs(src, dst, rel) {
    if (!fs.existsSync(path.join(src, rel)))
        return [];
    fs.mkdirSync(path.join(dst, rel), { recursive: true });
    const copied = [];
    for (const f of fs.readdirSync(path.join(src, rel)).filter((n) => n.endsWith(".md"))) {
        const from = path.join(src, rel, f);
        const to = path.join(dst, rel, f);
        const same = fs.existsSync(to) && fs.readFileSync(to).equals(fs.readFileSync(from));
        if (same || (fs.existsSync(to) && !ownWrite(src, path.join(rel, f))))
            continue;
        fs.copyFileSync(from, to);
        copied.push(path.join(rel, f));
    }
    return copied;
}
/**
 * Carry a run's book (its feature worktree) into a dev checkout: its `.md` logs,
 * and its ledger rows unioned line-wise (both hold rows the other does not).
 */
function carryBook(src, dst, month, fid) {
    carryLogs(src, dst, logDirRel(month, fid));
    unionLedgers(src, dst);
}
/** Shared ledgers a run may append to, outside its own log folder. */
const SHARED_LEDGERS = [
    ":(glob)docs/*.jsonl",
    ":(glob).bkit/*.jsonl",
    ":(exclude).bkit/issues.jsonl",
];
/**
 * Carry ONLY the run's own record out of a dev / main / detached checkout, which
 * other sessions and local-only commits share: the `.md` logs it wrote in its log
 * folder; the lines of that folder's `.jsonl` files its HEAD lacks; and, from the
 * shared ledgers, lines its HEAD lacks that are rows of `workflow` at or after
 * the run's start (`startMs`). No start known → no shared-ledger row is carried.
 */
function carryOwnBook(src, dst, o, log) {
    const rel = logDirRel(o.month, o.fid);
    const carried = { files: carryLogs(src, dst, rel), lines: new Map() };
    const uncommitted = (file) => {
        const head = new Set(textLines(git(src, ["show", `HEAD:${file}`]) ?? "").map((l) => l.trim()));
        return textLines(fs.readFileSync(path.join(src, file), "utf-8")).filter((l) => !head.has(l.trim()));
    };
    const add = (file, lines) => {
        const to = path.join(dst, file);
        const existing = fs.existsSync(to) ? fs.readFileSync(to, "utf-8") : "";
        const have = new Set(textLines(existing).map((l) => l.trim()));
        const fresh = lines.filter((l) => !have.has(l.trim()));
        if (fresh.length === 0)
            return;
        fs.mkdirSync(path.dirname(to), { recursive: true });
        const sep = existing !== "" && !existing.endsWith("\n") ? "\n" : "";
        fs.appendFileSync(to, `${sep}${fresh.join("\n")}\n`);
        carried.lines.set(file, fresh);
    };
    const listed = (specs) => (git(src, ["ls-files", "--cached", "--others", "--exclude-standard", "--", ...specs]) ?? "")
        .split("\n")
        .filter((f) => f !== "" && fs.existsSync(path.join(src, f)));
    for (const file of listed([`:(glob)${rel}/*.jsonl`]))
        add(file, uncommitted(file));
    if (o.startMs === undefined) {
        log(`no ${o.workflow} start row for ${o.fid} — no shared-ledger row carried`);
        return carried;
    }
    for (const file of listed(SHARED_LEDGERS)) {
        const own = uncommitted(file).filter((l) => {
            const parsed = parseJson(l);
            const row = parsed.ok ? parsed.value : null;
            return row?.workflow === o.workflow && Number(row.ts) >= o.startMs;
        });
        if (own.length > 0)
            add(file, own);
    }
    return carried;
}
/**
 * After a landing from a dev / main / detached checkout: hand back what was
 * carried, so a later fast-forward of dev does not stop on it. A carried `.md`
 * log identical to the landed copy is removed when untracked, or returns to HEAD
 * when tracked. A carried ledger loses exactly the carried lines; it returns to
 * HEAD when that leaves it equal, and an untracked one left empty is removed.
 * Anything staged, or a log changed since it landed, stays and is named.
 */
function handBack(tree, sha, carried, log) {
    const back = [];
    const kept = [];
    const staged = (rel) => !runGit(tree, ["diff", "--cached", "--quiet", "--", rel]).ok;
    const tracked = (rel) => runGit(tree, ["ls-files", "--error-unmatch", "--", rel]).ok;
    for (const rel of carried.files) {
        const abs = path.join(tree, rel);
        const landed = runGit(tree, ["show", `${sha}:${rel}`]);
        const same = landed.ok && fs.existsSync(abs) && fs.readFileSync(abs, "utf-8").trim() === landed.stdout;
        if (!same || staged(rel))
            kept.push(rel);
        else if (!tracked(rel)) {
            fs.rmSync(abs);
            back.push(rel);
        }
        else if (runGit(tree, ["restore", "--source=HEAD", "--worktree", "--", rel]).ok)
            back.push(rel);
        else
            kept.push(rel);
    }
    for (const [rel, lines] of carried.lines) {
        const abs = path.join(tree, rel);
        if (!fs.existsSync(abs) || staged(rel)) {
            kept.push(rel);
            continue;
        }
        const drop = new Map();
        for (const l of lines)
            drop.set(l.trim(), (drop.get(l.trim()) ?? 0) + 1);
        const left = fs
            .readFileSync(abs, "utf-8")
            .split("\n")
            .filter((l) => {
            const n = drop.get(l.trim()) ?? 0;
            if (n === 0)
                return true;
            drop.set(l.trim(), n - 1);
            return false;
        })
            .join("\n");
        const head = runGit(tree, ["show", `HEAD:${rel}`]);
        if (head.ok && left.trim() === head.stdout.trim()) {
            if (!runGit(tree, ["restore", "--source=HEAD", "--worktree", "--", rel]).ok) {
                kept.push(rel);
                continue;
            }
        }
        else if (!tracked(rel) && left.trim() === "")
            fs.rmSync(abs);
        else
            fs.writeFileSync(abs, left.endsWith("\n") || left === "" ? left : `${left}\n`);
        back.push(rel);
    }
    if (back.length > 0)
        log(`handed back ${back.length} file(s) now on dev: ${back.join(", ")}`);
    if (kept.length > 0)
        log(`kept in ${tree}, not all on dev: ${kept.join(", ")}`);
}
/** Thrown by a landing's build when the book adds nothing to dev. */
const NOTHING_TO_LAND = new Error("no bookkeeping delta");
/**
 * Land a failed run's record on dev: carry its book (the run's tree) into a
 * throwaway origin/dev checkout, commit it as ONE
 * `chore({fid}): {workflow} FAILED bkit [skip ci]` and push it. Ship's Failure
 * Path always lands here; the other workflows land here only from a `dev` /
 * `main` / detached checkout, where a commit in the checkout would publish code.
 * `shared` (the book is such a checkout) → only the run's own record is carried
 * (`carryOwnBook`), and `carried` says what, for the hand-back.
 * Not landed → the record stays in the book, and the next run carries it.
 */
async function landFailedRecord(ctx, o) {
    const root = repoRoot(ctx.cwd);
    const { book } = o;
    const kept = `${o.workflow} FAILED record kept in ${book} — the next ${o.workflow} of ${o.fid} carries it`;
    const stop = (code, why) => {
        ctx.log(`${why} — ${kept}`);
        return { code, pushed: false, ref: null, skipped: null };
    };
    // Read leniently: an unreadable row only leaves the run's start unknown.
    const statusAbs = path.join(book, statusRelPath(o.month, o.fid));
    const starts = (fs.existsSync(statusAbs) ? textLines(fs.readFileSync(statusAbs, "utf-8")) : [])
        .map((l) => parseObject(l))
        .filter((e) => e?.type === "workflow-started" && e.workflow === o.workflow)
        .map((e) => Date.parse(String(e?.at)))
        .filter((ms) => Number.isFinite(ms));
    const startMs = starts.length > 0 ? Math.max(...starts) : NaN;
    let carried;
    let res;
    try {
        res = await pushToDev({
            root,
            dir: landDir(root, o.fid),
            build: (dir) => {
                if (o.shared)
                    carried = carryOwnBook(book, dir, {
                        month: o.month,
                        fid: o.fid,
                        workflow: o.workflow,
                        startMs: Number.isFinite(startMs) ? startMs : undefined,
                    }, ctx.log);
                else
                    carryBook(book, dir, o.month, o.fid);
                const before = headSha(dir);
                try {
                    commitBookkeeping({
                        root: dir,
                        month: o.month,
                        fid: o.fid,
                        scope: "full",
                        mode: "commit",
                        message: `chore(${o.fid}): ${o.workflow} FAILED bkit [skip ci]`,
                    }, ctx.log);
                }
                catch (err) {
                    throw err instanceof CommandError && err.code === EXIT_EMPTY ? NOTHING_TO_LAND : err;
                }
                if (headSha(dir) === before)
                    throw NOTHING_TO_LAND;
            },
            log: ctx.log,
        });
    }
    catch (err) {
        if (err === NOTHING_TO_LAND) {
            ctx.log("no bookkeeping delta to record — nothing committed, nothing pushed");
            return { code: EXIT.OK, pushed: false, ref: null, skipped: "nothing-to-commit" };
        }
        return stop(EXIT_FLUSH_FAILED, `bookkeeping commit failed: ${err.message}`);
    }
    switch (res.kind) {
        case "landed":
            return { code: EXIT.OK, pushed: true, ref: DEV, skipped: null, sha: res.sha, carried };
        case "refused":
            return stop(EXIT_PUSH_FAILED, `dev refused the push: ${res.stderr}`);
        case "push-failed":
            return stop(EXIT_PUSH_FAILED, `dev push failed without a server answer: ${res.stderr}`);
        case "exhausted":
            return stop(EXIT_PUSH_FAILED, `dev moved before each of ${res.attempts} pushes`);
        case "fetch-failed":
            return stop(EXIT_FLUSH_FAILED, `fetch of dev failed: ${res.stderr}`);
        case "setup-failed":
            return stop(EXIT_FLUSH_FAILED, `throwaway checkout failed: ${res.stderr}`);
    }
}
async function handoverVerb(ctx) {
    const workflow = workflowName(String(ctx.flags.workflow));
    const fid = String(ctx.flags.fid);
    const month = resolveMonth(repoRoot(ctx.cwd), fid, str(ctx.flags.month));
    const push = ctx.flags.push === true;
    const flush = ctx.flags.flush === true;
    if (push && flush)
        throw new CommandError(EXIT.USAGE, "give --push or --flush, not both");
    if (flush && workflow !== "ship")
        throw new CommandError(EXIT.USAGE, "--flush is ship only");
    const worktree = str(ctx.flags.worktree);
    const base = worktree === undefined ? ctx.cwd : path.resolve(ctx.cwd, worktree);
    const artifact = path.join(logDirRel(month, fid), `${workflow}-handover.md`);
    const abs = path.join(base, artifact);
    const present = fs.existsSync(abs) && fs.statSync(abs).size > 0;
    let code = EXIT.OK;
    let ref = str(ctx.flags.ref) ?? null;
    let pushed = false;
    let skipped = null;
    const tree = worktree === undefined ? (git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? base) : base;
    const branch = git(tree, ["branch", "--show-current"]) ?? "";
    // A dev / main / detached checkout is shared: only the run's own record leaves it.
    const shared = branch === "" || isSharedBranch(branch);
    let handed;
    if (push && shared) {
        const r = await landFailedRecord(ctx, { workflow, fid, month, book: tree, shared });
        if (r.sha !== undefined && r.carried !== undefined)
            handed = { sha: r.sha, carried: r.carried };
        code = r.code;
        pushed = r.pushed;
        ref = r.ref;
        skipped = r.skipped;
    }
    else if (push) {
        runGit(tree, ["add", "-A"]);
        const made = runGit(tree, ["commit", "-m", `docs(${fid}): ${workflow} aborted bkit [skip ci]`]);
        if (!made.ok)
            ctx.log(`abort commit: ${made.stderr || made.stdout}`);
        const r = pushBranch(tree, { mode: "abort", openPr: str(ctx.flags.openPr) }, ctx.log);
        if (r.code === EXIT.USE_MCP)
            return r.code;
        pushed = r.out.pushed;
        ref = r.out.ref;
        skipped = r.out.skipped;
        code =
            r.code === EXIT.OK
                ? EXIT.OK
                : r.out.skipped === "open-pr"
                    ? EXIT_OPEN_PR_KEPT
                    : EXIT_PUSH_FAILED;
    }
    else if (flush) {
        const r = await landFailedRecord(ctx, { workflow, fid, month, book: tree, shared });
        if (r.sha !== undefined && r.carried !== undefined)
            handed = { sha: r.sha, carried: r.carried };
        code = r.code;
        pushed = r.pushed;
        ref = r.ref;
        skipped = r.skipped;
    }
    const linkable = ref !== null && (pushed || (!push && !flush));
    const comment = present
        ? buildComment(base, {
            kind: "handover",
            ownerRepo: linkable ? (str(ctx.flags.ownerRepo) ?? resolveRepoSlug(base)) : undefined,
            ref: linkable ? ref : undefined,
            artifacts: linkable ? [artifact] : [],
            bodyFile: artifact,
        })
        : null;
    if (handed !== undefined)
        handBack(tree, handed.sha, handed.carried, ctx.log);
    ctx.emit({
        handover: present ? artifact : null,
        pushed,
        ref: pushed ? ref : null,
        skipped,
        comment,
    });
    return code;
}
/** Rows of a JSONL ledger; malformed lines are skipped, a missing file is empty. */
function ledgerRows(file) {
    if (!fs.existsSync(file))
        return [];
    return fs
        .readFileSync(file, "utf-8")
        .split("\n")
        .filter((l) => l.trim() !== "")
        .flatMap((l) => {
        const row = parseObject(l);
        return row === undefined ? [] : [row];
    });
}
/** Not JSON reads as undefined: callers treat that as "no value" and say what it means for them. */
function jsonOrUndefined(text) {
    const parsed = parseJson(text);
    return parsed.ok ? parsed.value : undefined;
}
function parseObject(line) {
    const v = jsonOrUndefined(line);
    return v !== null && typeof v === "object" ? v : undefined;
}
const distinctKeys = (rows) => new Set(rows.filter((r) => r.key !== undefined).map((r) => String(r.key))).size;
/**
 * Cumulative distinct deferrals / failures, and how many keys THIS run added to
 * each instinct ledger (rows of this workflow at or after the run's start). With
 * no start time the per-run counts are unknown, so they are omitted rather than
 * counting the ledger's whole history as this run's.
 */
function ledgerCounts(tree, workflow, startMs) {
    const deferrals = ledgerRows(path.join(tree, "docs", "deferrals.jsonl"));
    const failures = ledgerRows(path.join(tree, "docs", "failures.jsonl"));
    const friction = ledgerRows(path.join(tree, ".bkit", "friction.jsonl"));
    const added = (rows) => distinctKeys(rows.filter((r) => r.workflow === workflow && Number(r.ts) >= startMs));
    return {
        deferrals: distinctKeys(deferrals.filter((r) => r.kind === "deferral")),
        failures: distinctKeys(failures.filter((r) => r.kind === "failure")),
        ...(startMs === undefined
            ? {}
            : {
                frictionAdded: added(friction),
                deferralsAdded: added(deferrals),
                failuresAdded: added(failures),
            }),
    };
}
/** `git diff --shortstat` numbers; 0 for anything absent or a range git rejects. */
export function diffStat(cwd, range) {
    const out = runGit(cwd, ["diff", "--shortstat", range]).stdout;
    const num = (re) => Number(re.exec(out)?.[1] ?? 0);
    const linesAdded = num(/(\d+) insertions?\(/);
    const linesDeleted = num(/(\d+) deletions?\(/);
    return {
        linesAdded,
        linesDeleted,
        linesChanged: linesAdded + linesDeleted,
        filesChanged: num(/(\d+) files? changed/),
    };
}
/** Checklist items (`- [`) across the feature's plan and sub-plans. */
function taskCount(tree, month, fid) {
    const dir = path.join(tree, "docs", "plans", month);
    if (!fs.existsSync(dir))
        return 0;
    return fs
        .readdirSync(dir)
        .filter((f) => f.startsWith(`${fid}-plan`) && f.endsWith(".md"))
        .flatMap((f) => fs.readFileSync(path.join(dir, f), "utf-8").split("\n"))
        .filter((l) => l.startsWith("- [")).length;
}
/** Per-tier coverage from `coverage/{tier}/coverage-summary.json`; undefined when none. */
function coverage(tree) {
    const out = {};
    for (const tier of ["unit", "integration", "e2e"]) {
        const file = path.join(tree, "coverage", tier, "coverage-summary.json");
        if (!fs.existsSync(file))
            continue;
        const total = parseObject(fs.readFileSync(file, "utf-8"))?.total;
        if (typeof total?.lines?.pct !== "number")
            continue;
        const stats = {};
        for (const k of ["lines", "branches", "functions", "statements"]) {
            const pct = total[k]?.pct;
            if (typeof pct === "number")
                stats[k] = pct;
        }
        out[tier] = stats;
    }
    return Object.keys(out).length ? out : undefined;
}
/** Last row of `type` for `workflow`, in `at` order (a union merge may interleave lines). */
function lastOfType(events, type, workflow) {
    return events
        .filter((e) => e.type === type && e.workflow === workflow)
        .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))
        .at(-1);
}
/** Append telemetry rows; best-effort, so a bad path is logged and never fails the close. */
function appendStats(file, rows, log) {
    const valid = rows.filter((r) => {
        const v = validate(r);
        if (!v.ok)
            log(`[bkit-telemetry] ${String(r.kind)} row invalid, not written: ${v.reason}`);
        return v.ok;
    });
    if (valid.length === 0)
        return false;
    try {
        fs.appendFileSync(file, valid.map((r) => `${telemetryLine(r)}\n`).join(""));
        return true;
    }
    catch (err) {
        // Telemetry never gates a close: report the failed append and carry on.
        log(`[bkit-telemetry] append failed: ${file} — ${err.message}`);
        return false;
    }
}
/** Markdown link per feature doc and per log of this workflow, as on `ref`. */
export function artifactLinks(root, ref, month, fid, workflow, ownerRepo) {
    const list = (dir) => (git(root, ["ls-tree", "-r", "--name-only", ref, "--", dir]) ?? "").split("\n").filter(Boolean);
    const docs = list(`docs/plans/${month}/`).filter((f) => path.posix.dirname(f) === `docs/plans/${month}` &&
        path.posix.basename(f).startsWith(`${fid}-`));
    const logs = list(`docs/plans/${month}/logs/${fid}/`).filter((f) => path.posix.basename(f).startsWith(`${workflow}-`));
    // The URL names the branch, never the remote-tracking ref it was read from.
    const urlRef = ref.replace(/^origin\//, "");
    return [...docs, ...logs].map((f) => ({
        name: path.posix.basename(f),
        path: f,
        url: `https://github.com/${ownerRepo}/blob/${urlRef}/${f}`,
    }));
}
const linkLines = (artifacts) => artifacts.map((a) => `- [${a.name}](${a.url})`).join("\n");
const ARTIFACTS_FILE = "close-artifacts.md";
const TELEMETRY_FILE = "close-telemetry.md";
/** The close comment: optional tree link, then the Artifacts and Telemetry sections from the outbox. */
function closeComment(cwd, outbox, o) {
    const sections = [ARTIFACTS_FILE, TELEMETRY_FILE]
        .filter((f) => fs.existsSync(path.join(outbox, f)))
        .map((f) => `${f === ARTIFACTS_FILE ? "Artifacts" : "Telemetry"}=${path.join(outbox, f)}`);
    return buildComment(cwd, {
        stepNumber: o.number,
        stepTitle: o.title,
        ownerRepo: o.tree === undefined ? undefined : (o.ownerRepo ?? resolveRepoSlug(cwd)),
        tree: o.tree,
        sections,
    });
}
/**
 * Grade compliance, append the workflow-done row (and, with `recordStep`, the
 * close step's row first), the counter and outcome telemetry rows, and build the
 * report and artifact links; with `outbox`, write them for the close comment; with
 * `message`, commit everything (`git add -A`) in the tree.
 */
export function closeWorkflow(cwd, o, log) {
    const workflow = workflowName(o.workflow);
    const where = whereInTree(cwd, o);
    const events = readStatusEvents(where.status);
    if (o.squashSha !== undefined && !/^[0-9a-f]{7,40}$/.test(o.squashSha))
        throw new CommandError(EXIT.USAGE, `--squash-sha "${o.squashSha}" is not a commit sha`);
    // Graded first, so the report below carries this run's grade.
    const violations = gradeCompliance(where.tree, workflow, log, o.squashSha);
    const step = `${workflow}-close-workflow`;
    if (o.recordStep === true) {
        writeStepRow(where.tree, { file: where.status, workflow, step, artifacts: [], commit: "none" }, log);
    }
    const row = { type: "workflow-done", workflow, at: statusTimestamp() };
    fs.appendFileSync(where.status, appendLine(row));
    const repo = resolveRepoSlug(where.root) || "unknown/repo";
    const bkitVersion = readBkitVersion(path.join(where.root, ".bkit", "version"))?.pinnedVersion || "unknown";
    const parentSha = headSha(where.tree);
    const started = lastOfType(events, "workflow-started", workflow);
    const startAt = started?.at;
    const startMs = startAt ? Date.parse(startAt) : NaN;
    const startKnown = Number.isFinite(startMs) ? startMs : undefined;
    const planSource = events
        .filter((e) => e.type === "workflow-meta" &&
        e.workflow === workflow &&
        (startAt === undefined || e.at >= startAt) &&
        e.planSource)
        .at(-1);
    const base = typeof started?.parentSha === "string" ? started.parentSha : "";
    const range = o.squashSha
        ? `${o.squashSha}^..${o.squashSha}`
        : base
            ? `${base}..HEAD`
            : "origin/dev...HEAD";
    const durationSeconds = startKnown === undefined ? 0 : Math.max(0, Math.floor((Date.now() - startKnown) / 1000));
    const startedRows = new Set(events.filter((e) => e.type === "workflow-started" && e.workflow === workflow).map((e) => e.at)).size;
    const ts = Date.now();
    const counterRow = {
        ts,
        kind: "counter",
        workflow,
        repo,
        bkitVersion,
        step,
        counterName: `${workflow.toUpperCase()}_ATTEMPT`,
        counterValue: Math.max(1, startedRows),
        counterSource: "shell-bus",
        parentSha,
    };
    const cov = workflow === "ship" ? coverage(where.tree) : undefined;
    const outcomeRow = {
        ts: ts + 1,
        kind: "outcome",
        workflow,
        repo,
        bkitVersion,
        step,
        parentSha,
        ...(o.prNumber === undefined ? {} : { prNumber: o.prNumber }),
        ...diffStat(where.tree, range),
        taskCount: taskCount(where.tree, where.month, o.fid),
        durationSeconds,
        ...ledgerCounts(where.tree, workflow, startKnown),
        ...(planSource?.planSource ? { planSource: planSource.planSource } : {}),
        ...(cov ? { coverage: cov } : {}),
    };
    const stats = path.join(where.tree, ".bkit", "stats.jsonl");
    const telemetryWritten = appendStats(stats, [counterRow, outcomeRow], log);
    const report = fs.existsSync(stats)
        ? workflowTelemetry(foldFrom([stats]), workflow).lines
        : ["[bkit-telemetry] stats.jsonl not found — no telemetry rows yet"];
    const ref = o.ref ??
        (["design", "plan", "ship"].includes(workflow)
            ? DEV
            : (git(cwd, ["branch", "--show-current"]) ?? "HEAD"));
    const artifacts = artifactLinks(where.root, ref, where.month, o.fid, workflow, o.ownerRepo ?? repo);
    let comment = null;
    if (o.outbox !== undefined) {
        const outbox = path.resolve(cwd, o.outbox);
        fs.mkdirSync(outbox, { recursive: true });
        fs.writeFileSync(path.join(outbox, ARTIFACTS_FILE), `${linkLines(artifacts)}\n`);
        fs.writeFileSync(path.join(outbox, TELEMETRY_FILE), `${report.join("\n")}\n`);
        if (o.number !== undefined) {
            if (o.title === undefined)
                throw new CommandError(EXIT.USAGE, "--number needs --title");
            comment = closeComment(where.tree, outbox, {
                number: o.number,
                title: o.title,
                tree: o.tree,
                ownerRepo: o.ownerRepo,
            });
        }
    }
    else if (o.number !== undefined) {
        throw new CommandError(EXIT.USAGE, "--number needs --outbox (the comment's sections live there)");
    }
    let commit = null;
    if (o.message !== undefined) {
        let message = o.message;
        if (o.verboseCiLocal === true &&
            runOrStepField(readRuns(where.status), workflow, "pushMode") === "LOCAL")
            message += " bkit [verbose ci]";
        if ((o.labels ?? []).includes(AUTO_LABEL))
            message += AUTO_ROUTE_SUFFIX;
        const add = runGit(where.tree, ["add", "-A"]);
        const made = add.ok ? runGit(where.tree, ["commit", "--allow-empty", "-m", message]) : add;
        if (!made.ok)
            throw new CommandError(EXIT.NO, `close commit failed: ${made.stderr || made.stdout}`);
        commit = headSha(where.tree);
    }
    return {
        row,
        counterRow: validate(counterRow).ok ? counterRow : null,
        outcomeRow: validate(outcomeRow).ok ? outcomeRow : null,
        telemetryWritten,
        compliance: violations === null ? null : violations.length,
        report,
        artifacts,
        artifactLinks: linkLines(artifacts),
        parentSha,
        commit,
        comment,
        roadmapFoldNeeded: true,
        featureStatus: FEATURE_STATUS[workflow],
    };
}
/**
 * Publish a close commit dev refused through its own `ship-close/{fid}` PR,
 * merged with an empty body. Returns where it landed, or why it did not.
 */
function closePr(ctx, dir, fid, subject) {
    const branch = `ship-close/${fid}`;
    const head = headSha(dir);
    if (!runGit(dir, ["push", "origin", `HEAD:refs/heads/${branch}`]).ok)
        return { failed: `close branch push failed` };
    const created = runGh(dir, [
        "pr",
        "create",
        "--base",
        DEV,
        "--head",
        branch,
        "--title",
        `docs(${fid}): ship DONE`,
        "--body",
        "",
    ]);
    if (!created.ok)
        return { failed: `gh pr create failed: ${created.stderr}` };
    const pr = probePr(dir, { head: branch, base: DEV, state: "open" });
    const number = pr.kind === "ok" ? pr.pr?.number : undefined;
    if (number === undefined)
        return { failed: `close PR not found for ${branch}` };
    const merged = mergePr(dir, { number: String(number), subject, matchHead: head, deleteBranch: true }, ctx.log);
    if (!merged.out.merged)
        ctx.log(`close PR #${number} opened but not merged — merge it by hand`);
    return { ref: branch, via: merged.out.merged ? "close-pr" : "close-pr-open" };
}
/**
 * Ship's close, in the run's tree (the feature worktree, or the adopted
 * checkout): the close rows there, then ONE `docs({fid}): ship DONE bkit [skip ci]`
 * commit built in a throwaway origin/dev checkout carrying the run's book and
 * landed on dev — a refused push publishes it through a `ship-close/{fid}` PR.
 * Only a close that landed (or opened its PR) releases the workflow lock; once
 * the close is on dev, the feature worktree and `branch` are removed. A close
 * that did not land keeps the lock for the Failure Path.
 */
async function shipClose(ctx, o, token) {
    const root = repoRoot(ctx.cwd);
    if (o.outbox === undefined)
        throw new CommandError(EXIT.USAGE, "--flush needs --outbox");
    const month = resolveMonth(root, o.fid, o.month);
    const book = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? root;
    const subject = `docs(${o.fid}): ship DONE bkit [skip ci]`;
    const kept = `close bookkeeping kept in ${book}`;
    const out = closeWorkflow(book, { ...o, recordStep: true, message: undefined }, ctx.log);
    let viaPr = null;
    let res;
    try {
        res = await pushToDev({
            root,
            dir: landDir(root, o.fid),
            build: (dir) => {
                carryBook(book, dir, month, o.fid);
                commitBookkeeping({
                    root: dir,
                    month,
                    fid: o.fid,
                    scope: "full",
                    mode: "commit-allow-empty",
                    message: subject,
                }, ctx.log);
            },
            refused: async (dir, stderr) => {
                ctx.log(`dev refused the close push — publishing it through a PR: ${stderr}`);
                viaPr = closePr(ctx, dir, o.fid, subject);
            },
            log: ctx.log,
        });
    }
    catch (err) {
        ctx.log(`close commit failed: ${err.message} — ${kept}`);
        return { code: EXIT_FLUSH_FAILED, out: null };
    }
    // A close that did not land keeps the lock: the Failure Path releases it.
    let landed = null;
    switch (res.kind) {
        case "landed":
            landed = { ref: DEV, via: "head-push" };
            break;
        case "refused": {
            const pr = viaPr;
            if (pr === null || "failed" in pr) {
                ctx.log(`${pr === null ? "close PR not attempted" : pr.failed} — ${kept}`);
                return { code: EXIT_FLUSH_FAILED, out: null };
            }
            landed = pr;
            break;
        }
        case "push-failed":
            ctx.log(`dev push failed without a server answer: ${res.stderr} — ${kept}`);
            return { code: EXIT_PUSH_FAILED, out };
        case "exhausted":
            ctx.log(`dev moved before each of ${res.attempts} pushes — ${kept}`);
            return { code: EXIT_PUSH_FAILED, out };
        case "fetch-failed":
            ctx.log(`fetch of dev failed: ${res.stderr} — ${kept}`);
            return { code: EXIT_FLUSH_FAILED, out: null };
        case "setup-failed":
            ctx.log(`throwaway checkout failed: ${res.stderr} — ${kept}`);
            return { code: EXIT_FLUSH_FAILED, out: null };
    }
    const released = releaseLock(workflowLockPath(root, month, o.fid), {
        workflow: "ship",
        fid: o.fid,
        token,
    });
    if (released.removeFailed) {
        ctx.log("Lock removal failed");
        return { code: EXIT_FLUSH_FAILED, out: null };
    }
    // The book is on dev only once the close landed or its PR merged.
    let worktree = null;
    if (landed.via === "close-pr-open") {
        ctx.log(`close PR not merged — ${kept} until it is`);
    }
    else {
        if (landed.via === "close-pr" && !runGit(root, ["fetch", "origin", DEV]).ok)
            ctx.log(`fetch of dev after the close PR failed — origin/${DEV} is stale until the next fetch`);
        try {
            worktree = removeWorktree(root, o.fid, o.branch, ctx.log);
        }
        catch (err) {
            ctx.log(`${err.message} — remove ${book} by hand`);
        }
    }
    return { code: EXIT.OK, out: { ...out, landed, worktree } };
}
// ---------------------------------------------------------------------------
// promote
// ---------------------------------------------------------------------------
/** The highest `{workflow}-v{N}-*.md` draft (sub-plan children `-v{N}-{k}.md` excluded), or null. */
export function highestVersion(dir, workflow) {
    if (!fs.existsSync(dir))
        return null;
    const re = new RegExp(`^${workflow}-v([0-9]+)-(.+)\\.md$`);
    let best = null;
    for (const f of fs.readdirSync(dir).sort()) {
        const m = re.exec(f);
        if (!m || /^[0-9]+$/.test(m[2]))
            continue;
        const n = Number(m[1]);
        if (best === null || n > best.n)
            best = { file: f, n };
    }
    return best;
}
/** Stamp `file`'s anchor when a base commit is known (plan: with its design's own anchor; both: the bkit release). */
function stamp(cwd, file, baseSha, design) {
    if (baseSha === "")
        return;
    const abs = path.resolve(cwd, file);
    const designAbs = design === undefined ? undefined : path.resolve(cwd, design);
    const d = design !== undefined && designAbs !== undefined && fs.existsSync(designAbs)
        ? { path: design, baseSha: readAnchor(fs.readFileSync(designAbs, "utf-8")).baseSha ?? "" }
        : undefined;
    const tmp = `${abs}.bkit-anchor.tmp`;
    const text = fs.readFileSync(abs, "utf-8");
    fs.writeFileSync(tmp, stampAnchor(text, baseSha, d, undefined, anchorBkitStatus(cwd)));
    fs.renameSync(tmp, abs);
}
function promoteVerb(ctx) {
    const workflow = String(ctx.flags.workflow);
    if (!["design", "plan"].includes(workflow))
        throw new CommandError(EXIT.USAGE, "--workflow must be design or plan");
    const fid = String(ctx.flags.fid);
    const month = resolveMonth(repoRoot(ctx.cwd), fid, str(ctx.flags.month));
    const logs = logDirRel(month, fid);
    const best = highestVersion(path.resolve(ctx.cwd, logs), workflow);
    if (best === null) {
        ctx.log(`no ${workflow}-v*.md under ${logs}`);
        return EXIT_NO_VERSION;
    }
    const final = path.join(logs, best.file);
    if (ctx.flags.resolve === true) {
        ctx.emit({ final, canonical: null, archived: [], subPlans: [], baseSha: null });
        return EXIT.OK;
    }
    // The base commit Step 2 recorded on the runtime-resolved row.
    const statusRel = str(ctx.flags.file) ?? path.join(logs, "status.jsonl");
    const statusAbs = path.resolve(ctx.cwd, statusRel);
    const runtime = fs.existsSync(statusAbs)
        ? readStatusRows(statusAbs)
            .filter((r) => r.type === "runtime-resolved")
            .at(-1)
        : undefined;
    const baseSha = typeof runtime?.baseSha === "string" ? runtime.baseSha : "";
    if (runtime === undefined)
        ctx.log("no runtime-resolved row — the canonical doc carries no anchor");
    const design = workflow === "plan" ? path.join("docs", "plans", month, `${fid}-design.md`) : undefined;
    const bucket = path.join("docs", "plans", month);
    const canonical = path.join(bucket, `${fid}-${workflow}.md`);
    stamp(ctx.cwd, final, baseSha, design);
    const children = workflow === "plan"
        ? fs
            .readdirSync(path.resolve(ctx.cwd, logs))
            .filter((f) => new RegExp(`^plan-v${best.n}-[0-9]+\\.md$`).test(f))
            .sort()
        : [];
    // A changed canonical moves to archive/ first — plan moves the whole set under one timestamp.
    const archived = [];
    const canonicalAbs = path.resolve(ctx.cwd, canonical);
    if (fs.existsSync(canonicalAbs) &&
        !fs.readFileSync(canonicalAbs).equals(fs.readFileSync(path.resolve(ctx.cwd, final)))) {
        const ts = new Date()
            .toISOString()
            .replace(/[-:]/g, "")
            .replace(/\.\d+Z$/, "Z");
        const archive = path.join(bucket, "archive");
        fs.mkdirSync(path.resolve(ctx.cwd, archive), { recursive: true });
        const set = fs
            .readdirSync(path.resolve(ctx.cwd, bucket))
            .filter((f) => workflow === "plan"
            ? f === `${fid}-plan.md` || new RegExp(`^${fid}-plan-[0-9]+\\.md$`).test(f)
            : f === `${fid}-design.md`);
        for (const f of set) {
            const to = path.join(archive, `${ts}-${f}`);
            fs.renameSync(path.resolve(ctx.cwd, bucket, f), path.resolve(ctx.cwd, to));
            archived.push(to);
        }
    }
    fs.mkdirSync(path.resolve(ctx.cwd, bucket), { recursive: true });
    fs.copyFileSync(path.resolve(ctx.cwd, final), canonicalAbs);
    const subPlans = [];
    for (const child of children) {
        const k = /-([0-9]+)\.md$/.exec(child)[1];
        stamp(ctx.cwd, path.join(logs, child), baseSha, design);
        const to = path.join(bucket, `${fid}-plan-${k}.md`);
        fs.copyFileSync(path.resolve(ctx.cwd, logs, child), path.resolve(ctx.cwd, to));
        subPlans.push(to);
    }
    if (workflow === "plan") {
        // Working names in the copies become the canonical names.
        for (const f of [canonical, ...subPlans]) {
            const abs = path.resolve(ctx.cwd, f);
            fs.writeFileSync(abs, fs
                .readFileSync(abs, "utf-8")
                .replace(/plan-v[0-9]+-split\.md/g, `${fid}-plan.md`)
                .replace(/plan-v[0-9]+-([0-9]+)\.md/g, `${fid}-plan-$1.md`));
        }
    }
    if (fs.statSync(canonicalAbs).size === 0) {
        ctx.log(`canonical empty: ${canonical}`);
        return EXIT_NO_VERSION;
    }
    ctx.emit({ final, canonical, archived, subPlans, baseSha: baseSha || null });
    return EXIT.OK;
}
// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------
const FID_FLAG = { name: "fid", type: "string", required: true, help: "feature id" };
const MONTH_FLAG = {
    name: "month",
    type: "string",
    help: "month bucket YYYYMM (default: the feature's bucket, else this UTC month)",
};
const STATUS_FILE_FLAG = {
    name: "file",
    type: "string",
    help: "path to status.jsonl (default: derived from --workflow, --fid, --month)",
};
const TOKEN_FLAG = {
    name: "token",
    type: "string",
    help: "the lock token `bkit locks acquire` returned (default: match workflow and fid)",
};
const OWNER_REPO_FLAG = {
    name: "owner-repo",
    type: "string",
    help: "owner/repo for links (default: from the origin remote)",
};
const COMMENT_FLAGS = [
    { name: "number", type: "string", help: "step number: print the close comment (needs --outbox)" },
    { name: "title", type: "string", help: "step title of the close comment" },
];
export const workflowsCommand = {
    noun: "workflows",
    summary: "Start, fail, hand over and close a phase workflow run; promote and link its documents.",
    verbs: {
        start: {
            summary: "Take the feature lock and open a run (workflow-started unless resuming).",
            flags: [
                WORKFLOW_FLAG,
                FID_FLAG,
                MONTH_FLAG,
                STATUS_FILE_FLAG,
                {
                    name: "lock-held",
                    type: "boolean",
                    help: "Step 1 already took the lock: check it is ours instead of acquiring",
                },
                TOKEN_FLAG,
            ],
            output: {
                lock: "{path, month, token, reclaimed} of the lock taken, or {path} with --lock-held",
                file: "absolute path to status.jsonl",
                resumed: "the latest run was this workflow, IN_PROGRESS: no new row",
                row: "the appended workflow-started row, or null when resuming",
                run: "which run of the workflow this is (1-based)",
            },
            exitCodes: {
                [EXIT_NO_STATUS]: "status.jsonl is not valid",
                [EXIT_SPLIT_BUCKET]: "the feature has logs in more than one month bucket",
                [EXIT_LOCK_NOT_HELD]: "--lock-held: the lock is missing or belongs to another owner",
            },
            run: (ctx) => {
                const workflow = workflowName(String(ctx.flags.workflow));
                const fid = String(ctx.flags.fid);
                const token = str(ctx.flags.token);
                if (token !== undefined && ctx.flags.lockHeld !== true)
                    throw new CommandError(EXIT.USAGE, "--token applies with --lock-held only");
                const where = whereInTree(ctx.cwd, {
                    workflow,
                    fid,
                    month: str(ctx.flags.month),
                    file: str(ctx.flags.file),
                });
                let lock;
                if (ctx.flags.lockHeld === true) {
                    const file = workflowLockPath(where.root, where.month, fid);
                    checkHeldLock(file, { workflow, fid, token });
                    lock = { path: file };
                }
                else {
                    lock = {
                        ...acquireWorkflowLock({
                            cwd: ctx.cwd,
                            workflow,
                            fid,
                            month: where.month,
                            log: ctx.log,
                        }),
                    };
                }
                const file = where.status;
                fs.mkdirSync(path.dirname(file), { recursive: true });
                if (!fs.existsSync(file))
                    fs.writeFileSync(file, "");
                const latest = fold(readStatusEvents(file)).at(-1);
                const resumed = latest?.workflow === workflow && latest.status === "IN_PROGRESS";
                let row = null;
                if (!resumed) {
                    row = {
                        type: "workflow-started",
                        workflow,
                        at: statusTimestamp(),
                        parentSha: headSha(path.dirname(file)),
                    };
                    fs.appendFileSync(file, appendLine(row));
                }
                ctx.emit({
                    lock,
                    file,
                    resumed,
                    row,
                    run: runNumber(fold(readStatusEvents(file)), workflow),
                });
                return EXIT.OK;
            },
        },
        fail: {
            summary: "Failure Path: workflow-failed row, abort rebase, release lock, clear sentinels (with --token); the bkit:failed labels and the failure comment.",
            flags: [
                WORKFLOW_FLAG,
                { ...FID_FLAG, required: false, help: "feature id (needed with --token)" },
                MONTH_FLAG,
                STATUS_FILE_FLAG,
                {
                    ...TOKEN_FLAG,
                    help: "the lock token Step 1 took; without it nothing is written or released (the run never locked)",
                },
                {
                    name: "max-exceeded",
                    type: "boolean",
                    help: "the failure is a MAX_* attempt limit being exceeded (a handover is due)",
                },
                {
                    name: "label",
                    type: "string",
                    repeatable: true,
                    help: "a label the issue carries now (labels: those plus bkit:failed)",
                },
                {
                    name: "pr",
                    type: "string",
                    help: "ship: the PR number; a MERGED PR moves the issue to bkit:merged as well",
                },
                {
                    name: "step-number",
                    type: "string",
                    help: "the failed step's number: print the failure comment",
                },
                { name: "step-title", type: "string", help: "the failed step's title" },
                { name: "sub-step", type: "string", help: "the failed sub-step" },
                {
                    name: "error-file",
                    type: "string",
                    help: "file holding the error message / tool response for the comment",
                },
                { name: "error", type: "string", help: "the error text, when there is no --error-file" },
                {
                    name: "stderr-file",
                    type: "string",
                    help: "the failed shell command's stderr (last 20 lines kept)",
                },
            ],
            output: {
                row: "the appended workflow-failed row, or null (no --token, or no status.jsonl)",
                rebaseAborted: "an in-progress rebase was found and aborted",
                lock: "{path, existed, released, heldBy}: heldBy is another owner's lock line, left in place; null without --token",
                sentinels: "[{name, path}] sentinels that existed before this call removed them",
                handoverNeeded: "--max-exceeded, a sentinel existed, or a debug run in SOAK mode: write the abort handover",
                add: "labels in the set that the issue does not carry yet",
                labels: "the label set to write: the current labels plus bkit:failed (and bkit:merged for a merged ship PR)",
                linearState: "the Linear state for the failed issue",
                prState: "the --pr PR's state, or null",
                comment: "the failure comment body (with --step-number), else null",
            },
            exitCodes: {
                [EXIT_SPLIT_BUCKET]: "no --month and the feature has logs in more than one month bucket",
                [EXIT_REMOVE_FAILED]: "the lock file is still there after removing it (everything else was done; the comment says so)",
            },
            run: failVerb,
        },
        handover: {
            summary: "Keep a failed run's record: commit and push it on the feature branch, or land its logs and ledgers on dev (--push from dev / main, ship's --flush); print the handover comment.",
            flags: [
                WORKFLOW_FLAG,
                FID_FLAG,
                MONTH_FLAG,
                {
                    name: "push",
                    type: "boolean",
                    help: "feature branch: git add -A, commit `docs({fid}): {workflow} aborted bkit [skip ci]`, push --mode=abort; dev / main / detached: lands like --flush, the checkout untouched",
                },
                {
                    name: "flush",
                    type: "boolean",
                    help: "ship: carry the run's logs and ledgers into a throwaway origin/dev checkout, ONE `chore({fid}): {workflow} FAILED bkit [skip ci]` commit, landed on dev",
                },
                {
                    name: "open-pr",
                    type: "string",
                    help: "--push: the open-PR answer from MCP (a number, or none) instead of asking gh",
                },
                { name: "ref", type: "string", help: "link the handover at this ref (no push / flush)" },
                {
                    name: "worktree",
                    type: "string",
                    help: "the run's tree: holds the handover and the logs, and is where --push commits (default: cwd's checkout)",
                },
                OWNER_REPO_FLAG,
            ],
            output: {
                handover: "the handover artifact, or null when absent",
                pushed: "the push (or flush push) ran and succeeded",
                ref: "where the handover now lives, or null when nothing was pushed",
                skipped: "why nothing was pushed: open-pr | skip-ci | nothing-to-commit (null otherwise)",
                comment: "the handover comment body (null when there is no handover); links only when pushed",
            },
            exitCodes: {
                [EXIT_SPLIT_BUCKET]: "no --month and the feature has logs in more than one month bucket",
                [EXIT_OPEN_PR_KEPT]: "--push: the branch has an open PR, nothing pushed (the comment has no link)",
                [EXIT_PUSH_FAILED]: "the push failed, or dev refused / kept moving under the FAILED landing (the comment has no link)",
                [EXIT_FLUSH_FAILED]: "the dev fetch, the throwaway checkout or the FAILED commit failed; the record stays in the run's tree",
            },
            run: handoverVerb,
        },
        close: {
            summary: "Grade compliance, workflow-done row, counter + outcome telemetry, report, artifact links; --flush lands ship's close on dev.",
            flags: [
                WORKFLOW_FLAG,
                FID_FLAG,
                MONTH_FLAG,
                STATUS_FILE_FLAG,
                {
                    name: "pr-number",
                    type: "string",
                    help: "ship: the merged PR number (outcome row prNumber)",
                },
                {
                    name: "squash-sha",
                    type: "string",
                    help: "ship: the PR's squash commit; size is measured over it (default: run start..HEAD)",
                },
                {
                    name: "ref",
                    type: "string",
                    help: "branch the artifact links point at (default: dev for design / plan / ship, else the current branch)",
                },
                OWNER_REPO_FLAG,
                {
                    name: "outbox",
                    type: "string",
                    help: "write close-artifacts.md and close-telemetry.md here, for the close comment",
                },
                {
                    name: "record-step",
                    type: "boolean",
                    help: "append the {workflow}-close-workflow step-done row first",
                },
                {
                    name: "message",
                    type: "string",
                    help: "then git add -A and commit with this message in the tree",
                },
                {
                    name: "label",
                    type: "string",
                    repeatable: true,
                    help: "a label the issue carries now: bkit:auto appends ` bkit [auto route]` to --message",
                },
                {
                    name: "verbose-ci-local",
                    type: "boolean",
                    help: "append ` bkit [verbose ci]` to --message when the run's pushMode is LOCAL",
                },
                ...COMMENT_FLAGS,
                { name: "tree", type: "string", help: "the close comment links the tree of this ref" },
                {
                    name: "flush",
                    type: "boolean",
                    help: "ship: commit `ship DONE` in a throwaway origin/dev checkout carrying the run's book, land it on dev (refused: a ship-close PR), release the lock (--token), remove the worktree",
                },
                { ...TOKEN_FLAG, help: "--flush: the workflow lock token to release" },
                {
                    name: "branch",
                    type: "string",
                    help: "--flush: the shipped branch, deleted locally and on origin with the worktree once the close is on dev",
                },
            ],
            output: {
                row: "the appended workflow-done row",
                counterRow: "the {WORKFLOW}_ATTEMPT counter row written to .bkit/stats.jsonl, or null if invalid",
                outcomeRow: "the outcome row written to .bkit/stats.jsonl, or null if invalid",
                telemetryWritten: "the stats rows were appended (false: append failed, logged, close continues)",
                compliance: "compliance violations graded before the report (null: the grader was unavailable)",
                report: "this workflow's telemetry report lines, for the close comment",
                artifacts: "[{name, path, url}] feature docs and this workflow's logs on --ref",
                artifactLinks: "the same as markdown `- [name](url)` lines",
                parentSha: "HEAD before the --message commit (the close step's parentSha)",
                commit: "the --message commit, or null",
                comment: "the close comment (--number with --outbox), else null",
                roadmapFoldNeeded: "always true: append the feature row and re-render the board (not run here)",
                featureStatus: "roadmap status this close moves the feature to",
                landed: "--flush: {ref, via: head-push | close-pr | close-pr-open}",
                worktree: "--flush: the `bkit worktrees remove` result once the close is on dev; null while the close PR is unmerged or the removal failed",
            },
            exitCodes: {
                [EXIT_NO_STATUS]: "status.jsonl missing, unreadable, or not valid NDJSON (nothing written)",
                [EXIT_SPLIT_BUCKET]: "no --month and the feature has logs in more than one month bucket",
                [EXIT_PUSH_FAILED]: "--flush: dev moved before every push, or the push failed without a server answer; the lock is kept",
                [EXIT_FLUSH_FAILED]: "--flush: the dev fetch, the throwaway checkout or the close commit failed, the close PR could not be opened (the lock is kept), or the lock could not be removed",
            },
            run: async (ctx) => {
                const f = ctx.flags;
                const input = {
                    workflow: String(f.workflow),
                    fid: String(f.fid),
                    month: str(f.month),
                    file: str(f.file),
                    prNumber: positiveInt(f.prNumber, "pr-number"),
                    squashSha: str(f.squashSha),
                    ref: str(f.ref),
                    ownerRepo: str(f.ownerRepo),
                    outbox: str(f.outbox),
                    recordStep: f.recordStep === true,
                    message: str(f.message),
                    labels: list(f.label),
                    verboseCiLocal: f.verboseCiLocal === true,
                    number: str(f.number),
                    title: str(f.title),
                    tree: str(f.tree),
                };
                if (f.flush === true) {
                    if (input.workflow !== "ship")
                        throw new CommandError(EXIT.USAGE, "--flush is ship only");
                    const r = await shipClose(ctx, { ...input, branch: str(f.branch) }, str(f.token));
                    if (r.out)
                        ctx.emit(r.out);
                    return r.code;
                }
                ctx.emit(closeWorkflow(ctx.cwd, input, ctx.log));
                return EXIT.OK;
            },
        },
        promote: {
            summary: "Design / plan close: the highest versioned draft becomes the canonical doc (anchor stamped, a changed canonical archived, plan sub-plans copied).",
            flags: [
                { ...WORKFLOW_FLAG, help: "design | plan" },
                FID_FLAG,
                MONTH_FLAG,
                {
                    name: "file",
                    type: "string",
                    help: "status.jsonl whose runtime-resolved row holds the base commit (default: in the logs folder)",
                },
                {
                    name: "resolve",
                    type: "boolean",
                    help: "only print the highest draft (final); copy nothing",
                },
            ],
            output: {
                final: "the highest versioned draft, e.g. docs/plans/202610/logs/12-x/design-v3-organised.md",
                canonical: "the canonical doc written, or null with --resolve",
                archived: "superseded canonical docs moved to archive/",
                subPlans: "plan: the canonical sub-plans written",
                baseSha: "the base commit stamped into the anchor, or null when none was recorded",
            },
            exitCodes: {
                [EXIT_SPLIT_BUCKET]: "no --month and the feature has logs in more than one month bucket",
                [EXIT_NO_VERSION]: "no versioned draft to promote, or the canonical came out empty",
            },
            run: promoteVerb,
        },
        links: {
            summary: "The feature's docs and this workflow's logs on a ref as markdown links; optionally the close comment.",
            flags: [
                WORKFLOW_FLAG,
                FID_FLAG,
                MONTH_FLAG,
                {
                    name: "ref",
                    type: "string",
                    help: "ref to list (default dev; origin/dev lists the remote copy, links still name dev)",
                },
                OWNER_REPO_FLAG,
                {
                    name: "outbox",
                    type: "string",
                    help: "write close-artifacts.md here (beside close's close-telemetry.md)",
                },
                ...COMMENT_FLAGS,
            ],
            output: {
                artifacts: "[{name, path, url}]",
                artifactLinks: "the same as markdown `- [name](url)` lines",
                comment: "the close comment (--number with --outbox): Artifacts and Telemetry sections, else null",
            },
            exitCodes: {
                [EXIT_SPLIT_BUCKET]: "no --month and the feature has logs in more than one month bucket",
            },
            run: (ctx) => {
                const workflow = workflowName(String(ctx.flags.workflow));
                const fid = String(ctx.flags.fid);
                const root = repoRoot(ctx.cwd);
                const month = resolveMonth(root, fid, str(ctx.flags.month));
                const artifacts = artifactLinks(root, str(ctx.flags.ref) ?? DEV, month, fid, workflow, str(ctx.flags.ownerRepo) ?? (resolveRepoSlug(root) || "unknown/repo"));
                let comment = null;
                const outbox = str(ctx.flags.outbox);
                if (outbox !== undefined) {
                    const dir = path.resolve(ctx.cwd, outbox);
                    fs.mkdirSync(dir, { recursive: true });
                    fs.writeFileSync(path.join(dir, ARTIFACTS_FILE), `${linkLines(artifacts)}\n`);
                    const number = str(ctx.flags.number);
                    if (number !== undefined) {
                        const title = str(ctx.flags.title);
                        if (title === undefined)
                            throw new CommandError(EXIT.USAGE, "--number needs --title");
                        comment = closeComment(root, dir, { number, title });
                    }
                }
                else if (ctx.flags.number !== undefined) {
                    throw new CommandError(EXIT.USAGE, "--number needs --outbox");
                }
                ctx.emit({ artifacts, artifactLinks: linkLines(artifacts), comment });
                return EXIT.OK;
            },
        },
    },
};
