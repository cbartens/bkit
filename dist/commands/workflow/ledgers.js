// bkit ledgers commit|union|only-bookkeeping|append|check|triage|compact — stage and
// commit bookkeeping by an allow-list, never `git add -A`; append validated rows with
// a minted `ts`; check that the ledger rows a plan names are on disk; drop superseded
// rows from the keyed ledgers.
//
// The pathspec is built by `git ls-files` against quoted globs, so git does the
// matching and an unmatched glob is empty output, never a shell abort. Staging
// and committing read that list NUL-delimited from a file. An empty list stops
// before `git commit`: `git commit --pathspec-from-file=<empty file>` commits
// everything already in the index, not nothing.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { readBkitVersion } from "../../install/version-file.js";
import { readBkitConfig } from "../../shared/settings.js";
import { APPEND_LEDGERS, SCHEMA, UNJUSTIFIED_REASON, gitEnv, parse, queryLedger, mintTs, resolveRepoSlug, validate, withLineage, writerProblem, } from "../../ledgers/telemetry.js";
import { COMPACT_LEDGERS, compactLedgers } from "../../ledgers/compact.js";
import { CORRECTION_REJECTED_ROW, CORRECTION_SUCCEEDED_ROW, LEDGER_OPERATIONS_FILE, actionHash, appendHeld, appendLine, correctionScope, ledgerIntent, ledgerOperation, pendingLedgerIntents, recordLedgerIntent, recordLedgerOperation, statusTimestamp, withTargetLock, writePrepared, } from "../../ledgers/status.js";
import { CommandError, CorrectionExhausted, EXIT, INVOCATION_FLAG, invocationDir, isIgnoredPath, isSharedBranch, NoWriteRejection, parseJson, UncertainEffect, wholeNumber, } from "../lib.js";
import { CORRECTION_LIMIT, spendCorrection } from "./counters.js";
import { readStatusRows, str } from "./status.js";
import { NO_MARKERS_REASON, outOfScope, parsePlanBlocks, reuseInventory, } from "./plan-blocks.js";
/** Root is not a directory or repo, git is too old, or a ref does not resolve. */
export const EXIT_ROOT = 3;
/** `git add` / `git add -u` / mkdir / copy failed. */
export const EXIT_STAGE = 4;
/** `git commit` failed. */
export const EXIT_COMMIT = 5;
/** The bookkeeping pathspec matched nothing; refusing to reach `git commit`. */
export const EXIT_EMPTY = 6;
/** only-bookkeeping: a non-bookkeeping path changed, or from is not an ancestor of to. */
export const EXIT_NOT_BOOKKEEPING = 7;
/** append: a row was refused (supplied `ts`, wrong kind, invalid, unlisted writer). */
export const EXIT_ROW_REFUSED = 8;
/** Rows per `ledgers query` page unless --limit says otherwise. */
const QUERY_PAGE = 200;
const SCOPES = ["core", "full", "pr"];
const MODES = ["stage", "commit", "commit-allow-empty"];
/** `package.json` globs as git pathspecs: `:(glob)` unless an entry carries its own magic. */
export const globPathspecs = (paths) => paths.map((p) => (p.startsWith(":") ? p : `:(glob)${p}`));
/**
 * The bookkeeping allow-list. Plain git pathspec `*` crosses `/`, so the
 * top-level-only entries use the `:(glob)` magic. `extra` is
 * `bkit.testing.ciSkipPaths` (`ciSkipPaths`), the project docs a repo
 * keeps outside `docs/*.md` (bkit's own: `CHANGELOG.md`, `README.md`); it reaches
 * the `pr` scope only.
 */
export function bookPathspecs(month, fid, scope, extra = []) {
    const specs = [
        `docs/plans/${month}/logs/${fid}/*`,
        ".bkit/friction.jsonl",
        ".bkit/stats.jsonl",
        "docs/plans/*/logs/*/*.jsonl",
        "docs/*.jsonl",
        ".bkit/*.jsonl",
        // A projection of .bkit/issues.jsonl, but a .md, so no *.jsonl glob reaches it.
        "docs/roadmap.md",
    ];
    if (scope === "full" || scope === "pr") {
        specs.push("docs/deferrals.jsonl", "docs/failures.jsonl", "docs/knowledge.jsonl", "docs/decisions.jsonl", "skills-lock.json", ".agents/skills/*", ".claude/skills/*", ".cursor/skills/*", ".opencode/skills/*");
    }
    // `pr` adds the project docs ship's docs sync edits, for the commit that rides the
    // PR: top-level `docs/*.md`, plus whatever the repo names in `ciSkipPaths` (the
    // engine hardcodes no file name; a glob nothing matches selects nothing). Kept out
    // of `full` so a close on a laptop's dev checkout never sweeps unrelated dirty docs
    // into its commit.
    if (scope === "pr") {
        specs.push(":(glob)docs/*.md", ...globPathspecs(extra));
    }
    return specs;
}
/** Ledgers a worktree teardown carries into the destination checkout. */
const UNION_PATHSPECS = [
    "docs/plans/*/logs/*/*.jsonl",
    "docs/*.jsonl",
    ".bkit/*.jsonl",
    // ship writes its SHIPPED row into the worktree before the merge so it rides
    // the PR; carrying it into a dev checkout from a run that never merged would
    // mark the feature shipped.
    ":(exclude).bkit/issues.jsonl",
];
/** `git <args>` in `cwd`, never throwing and never trimming (NUL-delimited output). */
function gitRaw(cwd, args, env = {}, input) {
    const res = spawnSync("git", args, {
        cwd,
        encoding: "utf-8",
        env: { ...gitEnv(), ...env },
        maxBuffer: 1 << 28,
        ...(input === undefined ? {} : { input }),
    });
    // A spawn error is never a success: the child can exit 0 before ENOBUFS kills it.
    const status = res.error && res.status === 0 ? 1 : res.status;
    return { status, stdout: res.stdout ?? "", stderr: (res.stderr ?? "").trim() };
}
const nulList = (out) => out.split("\0").filter((p) => p !== "");
function requireRepo(root) {
    if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) {
        throw new CommandError(EXIT_ROOT, `root not a directory: ${root}`);
    }
    if (gitRaw(root, ["rev-parse", "--git-dir"]).status !== 0) {
        throw new CommandError(EXIT_ROOT, `root not a git repo: ${root}`);
    }
}
/** `--pathspec-from-file` needs git >= 2.25. */
function requireGitVersion() {
    const res = spawnSync("git", ["--version"], { encoding: "utf-8", env: gitEnv() });
    const m = /(\d+)\.(\d+)/.exec(res.stdout ?? "");
    const [major, minor] = m ? [Number(m[1]), Number(m[2])] : [0, 0];
    if (major < 2 || (major === 2 && minor < 25)) {
        throw new CommandError(EXIT_ROOT, `git >= 2.25 required for --pathspec-from-file (found '${m ? `${major}.${minor}` : "unknown"}')`);
    }
}
const required = (ctx, name) => {
    const v = str(ctx.flags[name]);
    if (!v)
        throw new CommandError(EXIT.USAGE, `--${name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)} is required`);
    return v;
};
const rootOf = (ctx) => path.resolve(ctx.cwd, str(ctx.flags.root) ?? ".");
const ROOT_FLAG = {
    name: "root",
    type: "string",
    help: "checkout to stage in (default: the working directory)",
};
const MONTH_FLAG = {
    name: "month",
    type: "string",
    required: true,
    help: "YYYYMM bucket of the feature's logs",
};
const FID_FLAG = { name: "fid", type: "string", required: true, help: "feature id" };
/** Tracked files with uncommitted changes (`git status --porcelain` minus untracked). */
function dirtyTracked(root) {
    return gitRaw(root, ["status", "--porcelain"])
        .stdout.split("\n")
        .filter((l) => l !== "" && !l.startsWith("??"));
}
// ---------------------------------------------------------------------------
// Shared-checkout record — the one home
// ---------------------------------------------------------------------------
//
// An in-place run on `dev` shares its checkout with whatever else is dirty or
// committed there. At `worktrees setup` the run snapshots which paths were
// already dirty (and the HEAD it started from) into a per-clone file under the
// git dir, never committed. Every commit the run makes goes through
// `ownPathCommit`, which leaves those paths alone, and records its SHA so the
// push sends exactly the run's commits. Nothing else reads or writes the file.
/** Exit code: a path that was dirty before the run changed during it, so no commit was made. */
export const EXIT_FOREIGN_PATH = 10;
/** check: the plan has no `**Ledger rows:**` line, it is unfilled, or a key it names is on no ledger. */
export const EXIT_ROWS_MISSING = 11;
/** commit --scope=pr: the checkout is on `dev`, `main` or a detached HEAD, so nothing is committed. */
export const EXIT_SHARED_BRANCH = 12;
const RECORD_DIR = "bkit/shared-checkout";
const RECORD_FID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
/** The checkout's top: git status and pathspecs are relative to it, whatever `cwd` is. */
function topOf(cwd) {
    const top = gitRaw(cwd, ["rev-parse", "--show-toplevel"]);
    return top.status === 0 ? top.stdout.trim() : cwd;
}
/** `$(git rev-parse --git-path bkit/shared-checkout/{sub})`, absolute; null outside a repo. */
function recordPathOf(cwd, sub) {
    const res = gitRaw(cwd, ["rev-parse", "--git-path", `${RECORD_DIR}/${sub}`]);
    return res.status === 0 && res.stdout.trim() !== "" ? path.resolve(cwd, res.stdout.trim()) : null;
}
const recordFile = (cwd, fid) => RECORD_FID.test(fid) && !fid.includes("..") ? recordPathOf(cwd, `${fid}.json`) : null;
function asRecord(value) {
    if (typeof value !== "object" || value === null)
        return null;
    const r = value;
    if (typeof r.fid !== "string" ||
        typeof r.branch !== "string" ||
        typeof r.startSha !== "string" ||
        typeof r.aheadAtStart !== "number" ||
        !Array.isArray(r.paths) ||
        !Array.isArray(r.commits))
        return null;
    return {
        fid: r.fid,
        branch: r.branch,
        startSha: r.startSha,
        originSha: typeof r.originSha === "string" ? r.originSha : null,
        aheadAtStart: r.aheadAtStart,
        paths: r.paths.filter((p) => typeof p?.path === "string"),
        commits: r.commits.filter((c) => typeof c === "string"),
        ...(Array.isArray(r.pushed)
            ? { pushed: r.pushed.filter((c) => typeof c === "string") }
            : {}),
    };
}
/** The FID's record, or null when absent or unreadable. */
export function readRecord(cwd, fid) {
    const file = recordFile(cwd, fid);
    if (file === null || !fs.existsSync(file))
        return null;
    const parsed = parseJson(fs.readFileSync(file, "utf-8"));
    return parsed.ok ? asRecord(parsed.value) : null;
}
/** Note run commits that now sit on origin/dev as replayed copies, so a later push skips them. */
export function markRecordPushed(cwd, fid, shas) {
    const rec = readRecord(cwd, fid);
    if (rec === null)
        return;
    writeRecord(cwd, { ...rec, pushed: [...new Set([...(rec.pushed ?? []), ...shas])] });
}
/** Every record in this clone. */
export function listRecords(cwd) {
    const dir = recordPathOf(cwd, "");
    if (dir === null || !fs.existsSync(dir))
        return [];
    return fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".json"))
        .map((f) => readRecord(cwd, f.slice(0, -".json".length)))
        .filter((r) => r !== null);
}
export function writeRecord(cwd, rec) {
    const file = recordFile(cwd, rec.fid);
    if (file === null)
        throw new CommandError(EXIT_ROOT, `cannot place a record for "${rec.fid}"`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(rec, null, 2)}\n`);
}
/** A setup guard older than this is a crashed setup's leftover. */
const SETUP_GUARD_STALE_MS = 30_000;
/**
 * Run `fn` as the only record-setup in this clone: an exclusive-create guard file
 * next to the records makes the busy check and the record write one step. Returns
 * null, without running `fn`, when another setup holds a fresh guard.
 */
export function withSetupGuard(cwd, fn) {
    const guard = recordPathOf(cwd, ".setup.lock");
    if (guard === null)
        return { value: fn() };
    fs.mkdirSync(path.dirname(guard), { recursive: true });
    const take = () => {
        try {
            fs.closeSync(fs.openSync(guard, "wx"));
            return true;
        }
        catch (err) {
            if (err.code === "EEXIST")
                return false;
            throw err;
        }
    };
    if (!take()) {
        const age = fs.existsSync(guard) ? Date.now() - fs.statSync(guard).mtimeMs : Infinity;
        if (age < SETUP_GUARD_STALE_MS)
            return null;
        fs.rmSync(guard, { force: true });
        if (!take())
            return null;
    }
    try {
        return { value: fn() };
    }
    finally {
        fs.rmSync(guard, { force: true });
    }
}
/** Remove the FID's record; false when there was none. */
export function removeRecord(cwd, fid) {
    const file = recordFile(cwd, fid);
    if (file === null || !fs.existsSync(file))
        return false;
    fs.rmSync(file, { force: true });
    return true;
}
/** The FID's record, only while its branch is still the one checked out. */
export function activeRecord(cwd, fid) {
    const rec = readRecord(cwd, fid);
    if (rec === null)
        return null;
    const here = gitRaw(cwd, ["branch", "--show-current"]).stdout.trim();
    return here === rec.branch ? rec : null;
}
/**
 * The record of the run in place on `branch`, for a command that is not told
 * its FID (the push). Setup keeps one live record per clone; if several are left
 * over, the one written last wins.
 */
export function recordOnBranch(cwd, branch) {
    const dir = recordPathOf(cwd, "");
    const written = (r) => {
        const file = recordFile(cwd, r.fid);
        return file !== null && fs.existsSync(file) ? fs.statSync(file).mtimeMs : 0;
    };
    const ours = listRecords(cwd).filter((r) => r.branch === branch);
    if (dir === null || ours.length === 0)
        return null;
    return ours.reduce((a, b) => (written(b) > written(a) ? b : a));
}
/** Append a commit the run made; called only after the commit succeeded. */
export function appendRecordCommit(cwd, fid, sha) {
    const rec = readRecord(cwd, fid);
    if (rec === null || rec.commits.includes(sha))
        return;
    writeRecord(cwd, { ...rec, commits: [...rec.commits, sha] });
}
/** Paths git reports as changed or untracked, relative to the top, one per file. */
function dirtyPaths(top) {
    const res = gitRaw(top, ["status", "--porcelain", "-z", "-uall", "--no-renames"]);
    return nulList(res.stdout)
        .filter((e) => e.length > 3 && !e.startsWith("!!"))
        .map((e) => e.slice(3));
}
/** `git hash-object` of the working file; null when it is gone. */
function hashOf(top, rel) {
    const abs = path.join(top, rel);
    if (!fs.existsSync(abs))
        return null;
    if (!fs.statSync(abs).isFile())
        return "not-a-file";
    const res = gitRaw(top, ["hash-object", "--", rel]);
    return res.status === 0 ? res.stdout.trim() : "unhashable";
}
/** A text's non-blank lines. */
const rowsOf = (text) => text.split("\n").filter((l) => l.trim() !== "");
/** Lines of `file` in `cwd`'s working copy that its HEAD blob lacks (compared trimmed). */
export function rowsHeadLacks(cwd, file) {
    const head = new Set(rowsOf(gitRaw(cwd, ["show", `HEAD:${file}`]).stdout).map((l) => l.trim()));
    return rowsOf(fs.readFileSync(path.join(cwd, file), "utf-8")).filter((l) => !head.has(l.trim()));
}
/**
 * Rows of `file` the run appended: lines HEAD lacks, and past the recorded line
 * count when the run's record holds the file (rows before it are someone else's).
 */
export function runRows(cwd, file, rec) {
    const was = rec?.paths.find((p) => p.path === file);
    if (was?.lines === undefined)
        return rowsHeadLacks(cwd, file);
    const head = gitRaw(cwd, ["show", `HEAD:${file}`]);
    const have = new Set(rowsOf(head.status === 0 ? head.stdout : "").map((l) => l.trim()));
    const lines = fs.readFileSync(path.join(cwd, file), "utf-8").split("\n").slice(was.lines);
    return rowsOf(lines.join("\n")).filter((l) => !have.has(l.trim()));
}
/** The record for a run starting now in `cwd` on `branch`. */
export function newRecord(cwd, fid, branch) {
    const top = topOf(cwd);
    const startSha = gitRaw(top, ["rev-parse", "HEAD"]).stdout.trim();
    const origin = gitRaw(top, ["rev-parse", "-q", "--verify", `refs/remotes/origin/${branch}`]);
    const originSha = origin.status === 0 ? origin.stdout.trim() : null;
    const ahead = originSha === null
        ? 0
        : Number(gitRaw(top, ["rev-list", "--count", `${originSha}..HEAD`]).stdout);
    const paths = dirtyPaths(top).map((rel) => {
        const hash = hashOf(top, rel);
        const abs = path.join(top, rel);
        const text = hash !== null && rel.endsWith(".jsonl") ? fs.readFileSync(abs, "utf-8") : null;
        return text !== null && (text === "" || text.endsWith("\n"))
            ? { path: rel, hash, lines: fileLines(text).length }
            : { path: rel, hash };
    });
    return { fid, branch, startSha, originSha, aheadAtStart: ahead, paths, commits: [] };
}
/**
 * The paths that are the run's own: dirty now, minus every recorded path. A
 * recorded append-only ledger contributes only the rows appended after the
 * recorded line count that HEAD lacks. Any other recorded path whose content
 * changed, or a ledger whose recorded lines changed, throws EXIT_FOREIGN_PATH.
 * `among` limits which recorded paths count (a bookkeeping commit only commits
 * its allow-list).
 */
export function ownSet(cwd, rec, among) {
    const top = topOf(cwd);
    const recorded = new Map(rec.paths.map((p) => [p.path, p]));
    const out = { plain: [], ledgers: [] };
    const foreign = [];
    for (const rel of dirtyPaths(top)) {
        const was = recorded.get(rel);
        if (was === undefined) {
            out.plain.push(rel);
            continue;
        }
        if (among !== undefined && !among.includes(rel))
            continue;
        if (hashOf(top, rel) === was.hash)
            continue;
        if (was.lines === undefined) {
            foreign.push(rel);
            continue;
        }
        const text = fs.readFileSync(path.join(top, rel), "utf-8");
        const lines = text.split("\n");
        const prefix = `${lines.slice(0, was.lines).join("\n")}\n`;
        // `--path` applies the same clean / eol filters `hashOf` hashed the file with.
        const prefixHash = gitRaw(top, ["hash-object", `--path=${rel}`, "--stdin"], {}, prefix).stdout.trim();
        if (was.lines > 0 && prefixHash !== was.hash) {
            foreign.push(rel);
            continue;
        }
        const own = runRows(top, rel, rec);
        if (own.length === 0)
            continue;
        const head = gitRaw(top, ["show", `HEAD:${rel}`]);
        const base = head.status === 0 ? head.stdout : "";
        const sep = base === "" || base.endsWith("\n") ? "" : "\n";
        out.ledgers.push({ path: rel, text: `${base}${sep}${own.join("\n")}\n` });
    }
    if (foreign.length > 0) {
        throw new CommandError(EXIT_FOREIGN_PATH, `refusing to commit: ${foreign.join(", ")} changed during the run but was already modified before it started — nothing committed; commit or revert ${foreign.length === 1 ? "it" : "them"} yourself, then re-run`);
    }
    return out;
}
/**
 * Rebuild the real index entry of a ledger the user staged before the run: the
 * new HEAD blob plus the staged rows HEAD lacks, so the user's next plain commit
 * keeps the run's committed rows.
 */
function restageLedger(top, rel) {
    const staged = gitRaw(top, ["show", `:${rel}`]);
    const head = gitRaw(top, ["show", `HEAD:${rel}`]);
    if (staged.status !== 0 || head.status !== 0)
        return;
    const have = new Set(rowsOf(head.stdout).map((l) => l.trim()));
    const theirs = rowsOf(staged.stdout).filter((l) => !have.has(l.trim()));
    if (theirs.length === 0) {
        gitRaw(top, ["reset", "-q", "--", rel]);
        return;
    }
    const sep = head.stdout === "" || head.stdout.endsWith("\n") ? "" : "\n";
    const blob = gitRaw(top, ["hash-object", "-w", "--stdin"], {}, `${head.stdout}${sep}${theirs.join("\n")}\n`);
    if (blob.status !== 0)
        return;
    gitRaw(top, ["update-index", "--cacheinfo", `100644,${blob.stdout.trim()},${rel}`]);
}
/**
 * Commit `set` and nothing else: foreign index entries stay staged and foreign
 * files stay out. Plain files go through a pathspec commit; ledger rows, or an
 * empty set, go through a temporary index read from HEAD. With `skipIfEmpty`, no
 * change against HEAD makes no commit (`sha` null). The caller records the SHA.
 */
export function commitOwnSet(cwd, set, message, o = {}) {
    const top = topOf(cwd);
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-own-"));
    try {
        const list = path.join(tmp, "list");
        const all = [...set.plain, ...set.ledgers.map((l) => l.path)];
        // `dirtyPaths` drops ignored entries, so `all` never holds one today; name the
        // failure if a future caller passes a gitignored path, rather than let git's
        // ignored-paths guard surface as an opaque stage error.
        const ignored = all.filter((p) => isIgnoredPath(top, p));
        if (ignored.length > 0) {
            return { ok: false, error: `refusing to stage gitignored path(s): ${ignored.join(", ")}` };
        }
        fs.writeFileSync(list, all.map((p) => `${p}\0`).join(""));
        const stagedBefore = new Set(nulList(gitRaw(top, ["diff", "--cached", "--name-only", "-z"]).stdout));
        const tail = ["-m", message];
        let made;
        if (set.ledgers.length === 0 && set.plain.length > 0) {
            const add = gitRaw(top, ["add", `--pathspec-from-file=${list}`, "--pathspec-file-nul"]);
            if (add.status !== 0)
                return { ok: false, error: `'git add' failed: ${add.stderr}` };
            if (o.skipIfEmpty === true &&
                gitRaw(top, ["diff", "--cached", "--quiet", "--", ...set.plain]).status === 0)
                return { ok: true, sha: null };
            made = gitRaw(top, [
                "commit",
                ...(o.allowEmpty === true ? ["--allow-empty"] : []),
                `--pathspec-from-file=${list}`,
                "--pathspec-file-nul",
                ...tail,
            ]);
        }
        else {
            const env = { GIT_INDEX_FILE: path.join(tmp, "index") };
            if (gitRaw(top, ["rev-parse", "-q", "--verify", "HEAD"]).status === 0) {
                const read = gitRaw(top, ["read-tree", "HEAD"], env);
                if (read.status !== 0)
                    return { ok: false, error: `'git read-tree' failed: ${read.stderr}` };
            }
            if (set.plain.length > 0) {
                const add = gitRaw(top, ["add", `--pathspec-from-file=${list}`, "--pathspec-file-nul"], env);
                if (add.status !== 0)
                    return { ok: false, error: `'git add' failed: ${add.stderr}` };
            }
            for (const l of set.ledgers) {
                const blob = gitRaw(top, ["hash-object", "-w", "--stdin"], env, l.text);
                const upd = gitRaw(top, ["update-index", "--add", "--cacheinfo", `100644,${blob.stdout.trim()},${l.path}`], env);
                if (blob.status !== 0 || upd.status !== 0) {
                    return { ok: false, error: `'git update-index' failed: ${upd.stderr || blob.stderr}` };
                }
            }
            if (o.skipIfEmpty === true && gitRaw(top, ["diff", "--cached", "--quiet"], env).status === 0)
                return { ok: true, sha: null };
            made = gitRaw(top, ["commit", ...(o.allowEmpty === true ? ["--allow-empty"] : []), ...tail], env);
            if (made.status === 0 && all.length > 0) {
                // The real index still holds the pre-commit entries; bring the run's own
                // (unstaged-by-anyone-else) paths level with the new HEAD.
                const reset = all.filter((p) => !stagedBefore.has(p));
                fs.writeFileSync(list, reset.map((p) => `${p}\0`).join(""));
                if (reset.length > 0) {
                    gitRaw(top, ["reset", "-q", `--pathspec-from-file=${list}`, "--pathspec-file-nul"]);
                }
                // A ledger the user had staged keeps their rows in the index, on top of the new HEAD's.
                for (const l of set.ledgers)
                    if (stagedBefore.has(l.path))
                        restageLedger(top, l.path);
            }
        }
        if (made.status !== 0) {
            // Leave the index as it was: unstage what this attempt staged, never another's entry.
            const unstage = all.filter((p) => !stagedBefore.has(p));
            fs.writeFileSync(list, unstage.map((p) => `${p}\0`).join(""));
            if (unstage.length > 0)
                gitRaw(top, ["reset", "-q", `--pathspec-from-file=${list}`, "--pathspec-file-nul"]);
            return { ok: false, error: made.stderr || made.stdout.trim() };
        }
        return { ok: true, sha: gitRaw(top, ["rev-parse", "HEAD"]).stdout.trim() };
    }
    finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
}
/**
 * The run's own-path commit: compute the own set from the record, commit it,
 * append the SHA to the record. Throws EXIT_FOREIGN_PATH before committing.
 */
export function ownPathCommit(cwd, rec, message, o = {}) {
    const made = commitOwnSet(cwd, ownSet(cwd, rec), message, o);
    if (made.ok && made.sha !== null)
        appendRecordCommit(cwd, rec.fid, made.sha);
    return made;
}
/**
 * An empty commit of the run's own: nothing from the working tree or the real
 * index goes in, so a path the user staged never lands in it. The SHA is
 * appended to the record.
 */
export function retriggerCommit(cwd, rec, message) {
    const made = commitOwnSet(cwd, { plain: [], ledgers: [] }, message, { allowEmpty: true });
    if (made.ok && made.sha !== null)
        appendRecordCommit(cwd, rec.fid, made.sha);
    return made;
}
// ---------------------------------------------------------------------------
// Command
// ---------------------------------------------------------------------------
export const ledgersCommand = {
    noun: "ledgers",
    summary: "Stage and commit bookkeeping by allow-list; union ledgers; check a range is bookkeeping only; compact keyed ledgers.",
    verbs: {
        commit: {
            summary: "Stage (and commit) the bookkeeping allow-list for one feature.",
            use: "workflow",
            flags: [
                ROOT_FLAG,
                MONTH_FLAG,
                FID_FLAG,
                {
                    name: "scope",
                    type: "string",
                    help: "core (logs + ledgers) | full (+ docs ledgers, skills) | pr (+ top-level docs/*.md); not with --path",
                },
                {
                    name: "mode",
                    type: "string",
                    required: true,
                    help: "stage | commit (skips when nothing changed) | commit-allow-empty",
                },
                {
                    name: "stage-tracked-updates",
                    type: "boolean",
                    help: "run `git add -u` first (stages every tracked change; commit modes commit them too)",
                },
                {
                    name: "path",
                    type: "string",
                    help: "commit this one path alone, relative to --root (commit modes only; no --scope)",
                },
                {
                    name: "squash-of",
                    type: "string",
                    help: "after `git merge --squash <ref>`, also commit every path <ref> brought in, as staged",
                },
                {
                    name: "only-if-dirty-tracked",
                    type: "boolean",
                    help: "do nothing unless a tracked file has uncommitted changes (the pre-worktree commit)",
                },
                { name: "message", type: "string", help: "commit message (required for commit modes)" },
            ],
            output: {
                outcome: "committed | staged | nothing-to-commit | clean (no tracked changes, with --only-if-dirty-tracked)",
                commit: "the new commit's sha, or null",
                paths: "bookkeeping paths the allow-list matched (the --path alone with --path)",
                tracked: "tracked paths --stage-tracked-updates staged into the commit",
                squashPaths: "paths the --squash-of ref brought in",
            },
            exitCodes: {
                [EXIT_ROOT]: "root not a directory or git repo, git < 2.25, or --squash-of does not resolve",
                [EXIT_STAGE]: "staging failed (git add / git add -u)",
                [EXIT_COMMIT]: "git commit failed",
                [EXIT_EMPTY]: "the allow-list matched nothing — refusing to commit the whole index; or --path is outside the checkout",
                [EXIT_FOREIGN_PATH]: "an in-place run's allow-listed path was already modified before the run and changed during it — nothing committed",
                [EXIT_SHARED_BRANCH]: "--scope=pr commit on dev, main or a detached HEAD — refused, nothing committed",
            },
            run: (ctx) => commit(ctx),
        },
        union: {
            summary: "Append a worktree's new ledger rows into another checkout (never .bkit/issues.jsonl).",
            use: "workflow",
            flags: [
                { name: "src", type: "string", required: true, help: "worktree to read ledgers from" },
                { name: "dst", type: "string", required: true, help: "checkout to append them to" },
            ],
            output: { unioned: "ledgers swept", files: "their paths, relative to both roots" },
            exitCodes: {
                [EXIT_ROOT]: "src not a directory or git repo",
                [EXIT_STAGE]: "mkdir or copy into dst failed",
            },
            run: (ctx) => union(ctx),
        },
        "only-bookkeeping": {
            summary: "Exit 0 when every path changed in from..to is on the --scope=pr allow-list.",
            use: "by-hand",
            flags: [
                ROOT_FLAG,
                MONTH_FLAG,
                FID_FLAG,
                { name: "from", type: "string", required: true, help: "commit CI validated" },
                { name: "to", type: "string", required: true, help: "head to accept" },
            ],
            output: {
                onlyBookkeeping: "true when every changed path is bookkeeping",
                ancestor: "whether from is an ancestor of to",
                outside: "changed paths outside the allow-list",
            },
            exitCodes: {
                [EXIT_ROOT]: "root not a repo, a commit does not resolve, or git diff failed",
                [EXIT_NOT_BOOKKEEPING]: "a non-bookkeeping path changed, or from is not an ancestor of to",
            },
            run: (ctx) => onlyBookkeeping(ctx),
        },
        append: {
            summary: "Append validated rows to one ledger, minting each row's ts at append time.",
            use: "by-hand",
            flags: [
                { name: "root", type: "string", help: "checkout whose ledger to append to (default: cwd)" },
                {
                    name: "ledger",
                    type: "string",
                    required: true,
                    help: Object.keys(APPEND_LEDGERS).join(" | "),
                },
                {
                    name: "rows",
                    type: "string",
                    required: true,
                    help: "file holding a JSON array of rows without schema, ts or bkit, or - for stdin",
                },
                {
                    ...INVOCATION_FLAG,
                    help: `${INVOCATION_FLAG.help}; fills each row's by block (workflow, step, subagent, model, provenance) and refuses a row whose own by disagrees`,
                },
                {
                    name: "operation",
                    type: "string",
                    help: "operation id naming this request: the same id and rows replay the original receipt without writing; the same id with other rows is refused; a new id is a deliberate later update",
                },
                {
                    name: "issue-operation",
                    type: "boolean",
                    help: "let the engine issue the operation id from --invocation and the request, so a retried call after a lost response replays instead of appending again; exclusive with --operation",
                },
                {
                    name: "correction-of",
                    type: "string",
                    help: "the operation of an earlier guaranteed no-write rejection of this ledger append in this step: this call is its corrected retry (two per scope), under its own fresh --operation or --issue-operation",
                },
            ],
            output: {
                ledger: "the ledger appended to",
                file: "its path, relative to --root",
                appended: "rows written",
                keys: "each row's key, in order (null when a row has none)",
                receipt: "with --operation: {operation, ledger, file, offset, bytes, rows[{key, ts}], replayed}; replayed is true when the original effect is returned",
                correction: "with --correction-of: {scope, operation, of, used, limit, substep, verified}; verified is true when the rows landed (or the original receipt was returned)",
            },
            exitCodes: {
                [EXIT_STAGE]: "mkdir or append failed, the ledger is locked by another writer, or a prior attempt left an uncertain partial write",
                [EXIT_ROW_REFUSED]: "a row carries ts, has the wrong kind, fails validation, or names a writer not listed for its kind — nothing written",
            },
            run: (ctx) => append(ctx),
        },
        query: {
            summary: "Read one ledger's canonical winners (filtered after the fold), paged, with line diagnostics and coverage. Writes nothing.",
            use: "by-hand",
            flags: [
                { name: "root", type: "string", help: "checkout whose ledger to read (default: cwd)" },
                {
                    name: "ledger",
                    type: "string",
                    required: true,
                    help: Object.keys(APPEND_LEDGERS).join(" | "),
                },
                { name: "key", type: "string", help: "only the winner with this key" },
                { name: "status", type: "string", help: "only winners whose status is this (e.g. ACTIVE)" },
                {
                    name: "limit",
                    type: "string",
                    help: `rows per page (default ${QUERY_PAGE}, at least 1)`,
                },
                {
                    name: "cursor",
                    type: "string",
                    help: "nextCursor of the previous page; refused when the ledger or the filter changed",
                },
            ],
            output: {
                ledger: "the ledger read",
                file: "its path, relative to --root",
                rows: "this page of fold winners, oldest ts first (equal ts by identity)",
                nextCursor: "pass as --cursor for the next page, or null on the last page",
                snapshot: "digest of the bytes read; every page of one scan shares it",
                total: "winners that pass the filter, across all pages",
                diagnostics: "each unreadable line: {line, reason}; on every page",
                coverage: "{status: complete|partial|missing|unreadable, clean, malformedLines, lines}; clean is true only for a complete scan with no unreadable line",
            },
            run: (ctx) => query(ctx),
        },
        triage: {
            summary: "Bucket each deferral row the FID declared by the four Deferral Reason tests, and write the unjustified ones.",
            use: "workflow",
            flags: [
                { name: "root", type: "string", help: "checkout whose deferrals to read (default: cwd)" },
                FID_FLAG,
                {
                    name: "plan",
                    type: "string",
                    required: true,
                    help: "plan file whose task surfaces and Out of Scope rows the four tests read",
                },
            ],
            output: {
                fid: "the feature id triaged",
                plan: "the plan the tests were read from",
                rows: "each matched deferral's key, bucket (Exempt | Lazy), test results (none for a settled row: closed, LOW, or already adjudicated) and whether a row was written",
                total: "deferral rows the FID matched",
                written: "unjustified rows appended",
            },
            exitCodes: {
                [EXIT_ROW_REFUSED]: "a computed unjustified row fails validation or its writer check — nothing written",
            },
            run: (ctx) => triage(ctx),
        },
        check: {
            summary: "Check that every decision / deferral key on a plan's `**Ledger rows:**` line is on disk.",
            use: "by-hand",
            flags: [
                { name: "root", type: "string", help: "checkout whose ledgers to read (default: cwd)" },
                { name: "plan", type: "string", required: true, help: "plan file, relative to --root" },
            ],
            output: {
                plan: "the plan checked",
                keys: "the keys its Ledger rows line names (empty for None)",
                missing: "keys on neither docs/decisions.jsonl nor docs/deferrals.jsonl",
            },
            exitCodes: {
                [EXIT_ROWS_MISSING]: "no `**Ledger rows:**` line, the line is unfilled, or a key it names has no row",
            },
            run: (ctx) => check(ctx),
        },
        compact: {
            summary: "Rewrite keyed ledgers to their fold winners, stamping each winner's firstTs + updates.",
            use: "by-hand",
            flags: [
                { name: "root", type: "string", help: "checkout whose ledgers to compact (default: cwd)" },
                {
                    name: "ledger",
                    type: "string",
                    help: `${Object.keys(COMPACT_LEDGERS).join(" | ")} | all (default: all)`,
                },
                { name: "dry-run", type: "boolean", help: "count only; write nothing" },
            ],
            output: {
                dryRun: "true when nothing was written by design",
                ledgers: "per ledger: ledger, file, rows (keyed rows folded), dropped (superseded rows removed), stamped (winners given firstTs / updates), written",
                dropped: "superseded rows removed across all ledgers",
            },
            exitCodes: { [EXIT_STAGE]: "writing a compacted ledger failed" },
            run: (ctx) => compact(ctx),
        },
    },
};
/** Commit one named path alone: `git add` it, then `git commit -- <path>`. */
function commitOnePath(o, log) {
    const { root, mode, message } = o;
    const rel = o.path;
    const abs = path.resolve(root, rel);
    const inside = path.relative(root, abs);
    if (inside === "" || inside.startsWith("..") || path.isAbsolute(inside)) {
        throw new CommandError(EXIT_EMPTY, `--path is outside the checkout: ${rel}`);
    }
    const done = (outcome, sha) => ({
        outcome,
        commit: sha,
        paths: [inside],
        squashPaths: [],
        tracked: [],
    });
    if (isIgnoredPath(root, inside)) {
        throw new CommandError(EXIT_STAGE, `--path is gitignored, refusing to stage it: ${inside}`);
    }
    const add = gitRaw(root, ["add", "--", inside]);
    if (add.status !== 0)
        throw new CommandError(EXIT_STAGE, `'git add' failed: ${add.stderr}`);
    if (mode === "commit" &&
        gitRaw(root, ["diff", "--cached", "--quiet", "--", inside]).status === 0) {
        log(`nothing to commit at ${inside}`);
        return done("nothing-to-commit", null);
    }
    const made = gitRaw(root, [
        "commit",
        ...(mode === "commit-allow-empty" ? ["--allow-empty"] : []),
        "-m",
        message,
        "--",
        inside,
    ]);
    if (made.status !== 0) {
        throw new CommandError(EXIT_COMMIT, `'git commit' failed: ${made.stderr || made.stdout.trim()}`);
    }
    const sha = gitRaw(root, ["rev-parse", "HEAD"]).stdout.trim();
    if (activeRecord(root, o.fid) !== null)
        appendRecordCommit(root, o.fid, sha);
    return done("committed", sha);
}
/**
 * Stage (and commit) the bookkeeping allow-list for one feature. Throws a
 * CommandError with EXIT_ROOT / EXIT_STAGE / EXIT_COMMIT / EXIT_EMPTY.
 */
export function commitBookkeeping(o, log) {
    const { root, month, fid, scope, mode, message, squashOf } = o;
    if (o.path !== undefined) {
        if (mode === "stage" || !MODES.includes(mode)) {
            throw new CommandError(EXIT.USAGE, "--path needs --mode=commit or commit-allow-empty");
        }
        if (o.stageTrackedUpdates === true || squashOf !== undefined || o.onlyIfDirtyTracked === true) {
            throw new CommandError(EXIT.USAGE, "--path commits one path alone; drop --stage-tracked-updates, --squash-of and --only-if-dirty-tracked");
        }
        if (!message)
            throw new CommandError(EXIT.USAGE, `--message is required for --mode=${mode}`);
        requireRepo(root);
        return commitOnePath(o, log);
    }
    if (!SCOPES.includes(scope)) {
        throw new CommandError(EXIT.USAGE, `--scope must be core, full, or pr (got '${scope}')`);
    }
    if (!MODES.includes(mode)) {
        throw new CommandError(EXIT.USAGE, `--mode must be stage, commit, or commit-allow-empty (got '${mode}')`);
    }
    if (mode !== "stage" && !message)
        throw new CommandError(EXIT.USAGE, `--message is required for --mode=${mode}`);
    if (mode === "stage" && squashOf !== undefined) {
        throw new CommandError(EXIT.USAGE, "--squash-of applies to commit modes only");
    }
    requireRepo(root);
    if (scope === "pr" && mode !== "stage") {
        const branch = gitRaw(root, ["branch", "--show-current"]).stdout.trim();
        if (branch === "" || isSharedBranch(branch)) {
            throw new CommandError(EXIT_SHARED_BRANCH, `--scope=pr commits a feature branch's bookkeeping: refusing to commit on '${branch || "detached HEAD"}'`);
        }
    }
    if (squashOf !== undefined &&
        gitRaw(root, ["rev-parse", "-q", "--verify", `${squashOf}^{commit}`]).status !== 0) {
        throw new CommandError(EXIT_ROOT, `--squash-of: unknown commit: ${squashOf}`);
    }
    requireGitVersion();
    if (o.onlyIfDirtyTracked === true) {
        const dirty = dirtyTracked(root);
        if (dirty.length === 0) {
            log("no tracked file has uncommitted changes — nothing to commit");
            return { outcome: "clean", commit: null, paths: [], squashPaths: [], tracked: [] };
        }
        for (const line of dirty)
            log(line);
    }
    // An in-place run on a shared branch: recorded paths are someone else's.
    const rec = squashOf === undefined ? activeRecord(root, fid) : null;
    let tracked = [];
    if (o.stageTrackedUpdates === true) {
        // Throws EXIT_FOREIGN_PATH when any recorded path changed, before anything is staged.
        if (rec !== null)
            ownSet(root, rec);
        const keepOut = (rec?.paths ?? []).map((p) => `:(exclude,literal)${p.path}`);
        const res = gitRaw(root, ["add", "-u", ...(keepOut.length > 0 ? ["--", ".", ...keepOut] : [])]);
        if (res.status !== 0)
            throw new CommandError(EXIT_STAGE, `'git add -u' failed: ${res.stderr}`);
        if (mode !== "stage") {
            const cached = gitRaw(root, [
                "diff",
                "--cached",
                "--name-only",
                "-z",
                "--no-renames",
                ...(keepOut.length > 0 ? ["--", ".", ...keepOut] : []),
            ]);
            if (cached.status !== 0) {
                throw new CommandError(EXIT_STAGE, `'git diff --cached' failed: ${cached.stderr}`);
            }
            tracked = nulList(cached.stdout);
        }
    }
    const specs = bookPathspecs(month, fid, scope, readBkitConfig(root).ciSkipPaths);
    const listed = gitRaw(root, [
        "ls-files",
        "-z",
        "--cached",
        "--others",
        "--exclude-standard",
        "--",
        ...specs,
    ]);
    if (listed.status !== 0) {
        throw new CommandError(EXIT_ROOT, `'git ls-files' failed while building the pathspec: ${listed.stderr}`);
    }
    let paths = nulList(listed.stdout);
    let ledgerRows = [];
    if (rec !== null) {
        // Throws EXIT_FOREIGN_PATH when a recorded path in the allow-list changed.
        ledgerRows = ownSet(root, rec, paths).ledgers;
        const recorded = new Set(rec.paths.map((p) => p.path));
        paths = paths.filter((p) => !recorded.has(p));
    }
    let squashPaths = [];
    if (squashOf !== undefined) {
        const diff = gitRaw(root, ["diff", "--name-only", "-z", "--no-renames", `HEAD...${squashOf}`]);
        if (diff.status !== 0) {
            throw new CommandError(EXIT_ROOT, `'git diff' failed while listing the paths ${squashOf} brought in: ${diff.stderr}`);
        }
        squashPaths = nulList(diff.stdout);
    }
    if (mode !== "stage" &&
        paths.length + squashPaths.length + ledgerRows.length + tracked.length === 0) {
        // The pre-worktree commit records only bookkeeping; a dirty tree with none
        // of it (a fresh consumer repo) has nothing of ours to commit, and stopping
        // here never reaches `git commit`.
        if (o.onlyIfDirtyTracked === true) {
            log(`no bookkeeping under scope=${scope} in ${root} — nothing to commit`);
            return { outcome: "nothing-to-commit", commit: null, paths, squashPaths, tracked };
        }
        throw new CommandError(EXIT_EMPTY, `empty pathspec list — refusing to commit (nothing under scope=${scope} matched in ${root})`);
    }
    if (rec !== null && mode !== "stage" && ledgerRows.length > 0) {
        const made = commitOwnSet(root, { plain: [...paths, ...tracked], ledgers: ledgerRows }, message, {
            allowEmpty: mode === "commit-allow-empty",
            skipIfEmpty: mode === "commit",
        });
        if (!made.ok)
            throw new CommandError(EXIT_COMMIT, `'git commit' failed: ${made.error}`);
        if (made.sha === null) {
            log("nothing to commit");
            return { outcome: "nothing-to-commit", commit: null, paths, squashPaths, tracked };
        }
        appendRecordCommit(root, fid, made.sha);
        return { outcome: "committed", commit: made.sha, paths, squashPaths, tracked };
    }
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ledgers-"));
    try {
        const bookList = path.join(tmp, "book");
        const commitList = path.join(tmp, "commit");
        fs.writeFileSync(bookList, paths.map((p) => `${p}\0`).join(""));
        const commitPaths = [...new Set([...paths, ...squashPaths, ...tracked])];
        fs.writeFileSync(commitList, commitPaths.map((p) => `${p}\0`).join(""));
        const add = gitRaw(root, ["add", `--pathspec-from-file=${bookList}`, "--pathspec-file-nul"]);
        if (add.status !== 0)
            throw new CommandError(EXIT_STAGE, `'git add' failed: ${add.stderr}`);
        if (mode === "stage") {
            log(`staged (scope=${scope})`);
            return { outcome: "staged", commit: null, paths, squashPaths, tracked };
        }
        if (mode === "commit" &&
            gitRaw(root, ["diff", "--cached", "--quiet", "--", ...specs, ...squashPaths, ...tracked])
                .status === 0) {
            log("nothing to commit");
            return { outcome: "nothing-to-commit", commit: null, paths, squashPaths, tracked };
        }
        const made = gitRaw(root, [
            "commit",
            ...(mode === "commit-allow-empty" ? ["--allow-empty"] : []),
            `--pathspec-from-file=${commitList}`,
            "--pathspec-file-nul",
            "-m",
            message,
        ]);
        if (made.status !== 0) {
            throw new CommandError(EXIT_COMMIT, `'git commit' failed: ${made.stderr || made.stdout.trim()}`);
        }
        const sha = gitRaw(root, ["rev-parse", "HEAD"]).stdout.trim();
        if (rec !== null)
            appendRecordCommit(root, fid, sha);
        return { outcome: "committed", commit: sha, paths, squashPaths, tracked };
    }
    finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
}
function commit(ctx) {
    const f = ctx.flags;
    ctx.emit({
        ...commitBookkeeping({
            root: rootOf(ctx),
            month: required(ctx, "month"),
            fid: required(ctx, "fid"),
            scope: String(f.scope ?? ""),
            mode: String(f.mode),
            message: str(f.message),
            stageTrackedUpdates: f.stageTrackedUpdates === true,
            squashOf: str(f.squashOf),
            onlyIfDirtyTracked: f.onlyIfDirtyTracked === true,
            path: str(f.path),
        }, ctx.log),
    });
    return EXIT.OK;
}
/** Lines as `grep` reads them: a final newline ends the last line, it does not start an empty one. */
const fileLines = (text) => (text === "" ? [] : text.replace(/\n$/, "").split("\n"));
/**
 * Append a worktree's new ledger rows into another checkout (never
 * .bkit/issues.jsonl). Throws EXIT_ROOT / EXIT_STAGE.
 */
export function unionLedgers(src, dst) {
    if (!fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
        throw new CommandError(EXIT_ROOT, `src not a directory: ${src}`);
    }
    if (gitRaw(src, ["rev-parse", "--git-dir"]).status !== 0) {
        throw new CommandError(EXIT_ROOT, `src not a git repo: ${src}`);
    }
    const listed = gitRaw(src, [
        "ls-files",
        "-z",
        "--cached",
        "--others",
        "--exclude-standard",
        "--",
        ...UNION_PATHSPECS,
    ]);
    const files = [];
    for (const rel of nulList(listed.stdout)) {
        const from = path.join(src, rel);
        if (!fs.existsSync(from) || !fs.statSync(from).isFile())
            continue;
        const to = path.join(dst, rel);
        const made = mkdirp(path.dirname(to));
        if (made)
            throw new CommandError(EXIT_STAGE, `mkdir failed for ${path.dirname(to)}: ${made}`);
        if (fs.existsSync(to) && fs.statSync(to).isFile()) {
            // Under the destination's target lock, so a pending ledger operation's bytes are never reordered.
            withTargetLock(to, () => {
                const pending = pendingLedgerIntents(path.join(dst, LEDGER_OPERATIONS_FILE), rel);
                if (pending.length > 0)
                    throw new CommandError(EXIT_STAGE, `${rel} has ledger operation(s) with bytes but no receipt (${pending.map((p) => p.operation).join(", ")}); replay them first`);
                const existing = fs.readFileSync(to, "utf-8");
                const have = new Set(fileLines(existing));
                const fresh = fileLines(fs.readFileSync(from, "utf-8")).filter((l) => !have.has(l));
                const block = fresh.join("\n").replace(/\n+$/, "");
                // A destination missing its final newline would glue the first new row
                // onto its last one, leaving a line that is not JSON.
                const sep = existing !== "" && !existing.endsWith("\n") ? "\n" : "";
                if (block !== "")
                    fs.appendFileSync(to, `${sep}${block}\n`);
            });
        }
        else {
            const copied = copy(from, to);
            if (copied)
                throw new CommandError(EXIT_STAGE, `copy failed for ${rel}: ${copied}`);
        }
        files.push(rel);
    }
    return files;
}
function union(ctx) {
    const src = path.resolve(ctx.cwd, String(ctx.flags.src));
    const dst = path.resolve(ctx.cwd, String(ctx.flags.dst));
    const files = unionLedgers(src, dst);
    ctx.log(`swept ${files.length} ledger(s) from ${src} into ${dst}`);
    ctx.emit({ unioned: files.length, files });
    return EXIT.OK;
}
/** The top section in its written order, then the row's own fields. */
const TOP_ORDER = [
    "schema",
    "ts",
    "firstTs",
    "updates",
    "kind",
    "key",
    "repo",
    "bkit",
    "by",
    "references",
];
/** A row's `by` block when it is an object, else an empty one. */
const byOfRow = (row) => row["by"] !== null && typeof row["by"] === "object" && !Array.isArray(row["by"])
    ? row["by"]
    : {};
/** The `by` fields an invocation owns; a row may repeat them but never disagree. */
const INVOCATION_BY_KEYS = [
    "workflow",
    "step",
    "subagent",
    "model",
    "modelSource",
    "configuredModel",
    "host",
];
/**
 * `row` with its `by` block completed from the verified invocation. A field the row
 * asserts that differs from the invocation's, or that the invocation cannot vouch for,
 * is refused rather than overwritten. A configured pin is recorded as `configuredModel`
 * only, never as the model that ran.
 */
function withInvocationBy(row, inv, refuse) {
    const unavailable = inv.observedModel === "unavailable";
    const expected = {
        workflow: inv.workflow ?? inv.standalone ?? undefined,
        step: inv.step ?? inv.declaredStep ?? undefined,
        subagent: inv.agent ?? undefined,
        model: inv.agent !== null && inv.observedModel !== null && !unavailable
            ? inv.observedModel
            : undefined,
        modelSource: inv.agent === null || inv.observedModel === null
            ? undefined
            : unavailable
                ? "unavailable"
                : "observed",
        configuredModel: inv.agent !== null ? (inv.configuredModel ?? undefined) : undefined,
        host: inv.agent !== null ? (inv.host ?? undefined) : undefined,
    };
    const asserted = row["by"];
    if (asserted !== undefined &&
        (asserted === null || typeof asserted !== "object" || Array.isArray(asserted)))
        throw refuse("by must be an object");
    const by = { ...asserted };
    for (const key of INVOCATION_BY_KEYS) {
        if (by[key] !== undefined && by[key] !== expected[key]) {
            throw refuse(`conflict: by.${key}=${JSON.stringify(by[key])} disagrees with invocation ${inv.id} (${expected[key] === undefined ? "none" : JSON.stringify(expected[key])})`);
        }
        if (by[key] === undefined && expected[key] !== undefined)
            by[key] = expected[key];
    }
    return { ...row, by };
}
/**
 * The operation id of an append request: the caller's `--operation`, else (with
 * `--issue-operation`) one issued from the invocation and the request, so retrying a lost
 * response gets the same id.
 */
export function appendOperationId(ledger, rows, invocation, options) {
    if (options.operation !== undefined)
        return options.operation;
    if (options.issueOperation !== true || invocation === undefined)
        return undefined;
    const hash = actionHash(JSON.stringify({ ledger, rows, invocation: invocation.id }));
    return `op-${invocation.id.slice(4, 16)}-${hash.slice(0, 12)}`;
}
/**
 * The correction scope of an append by a workflow-run or a standalone (audit or utility)
 * invocation; null for any other caller.
 */
export function appendCorrectionScope(invocation, ledger) {
    const book = correctionBookKey(invocation);
    if (book === null)
        return null;
    return correctionScope({
        workflow: book.workflow,
        run: invocation.run,
        step: book.step,
        group: invocation.group,
        attempt: invocation.attempt,
        ledger,
        substep: "append",
    });
}
/** The workflow and step a correction scope is cut from; the declared step for a standalone call. */
function correctionBookKey(invocation) {
    if (invocation.scope === "run")
        return invocation.statusPath === null ||
            invocation.workflow === null ||
            invocation.step === null
            ? null
            : { workflow: invocation.workflow, step: invocation.step };
    return invocation.standalone === null || invocation.declaredStep === null
        ? null
        : { workflow: invocation.standalone, step: invocation.declaredStep };
}
/**
 * Where the correction events of `invocation` live: the run's `status.jsonl`, or for a standalone
 * call the event file beside its outbox receipt. Null when the caller has no correction scope.
 */
function correctionBook(cwd, invocation) {
    const key = correctionBookKey(invocation);
    if (key === null)
        return null;
    if (invocation.scope === "run")
        return invocation.statusPath === null ? null : { file: invocation.statusPath, ...key };
    const dir = invocationDir(cwd);
    if (dir === null)
        return null;
    const file = path.join(dir, `${invocation.id}.corrections.jsonl`);
    fs.appendFileSync(file, "");
    return { file, ...key };
}
/** The `{key, ts}` of each row in prepared `block` bytes. */
function receiptRows(block) {
    const out = [];
    for (const line of block.split("\n")) {
        if (line.trim() === "")
            continue;
        const parsed = parseJson(line);
        if (!parsed.ok || parsed.value === null || typeof parsed.value !== "object")
            continue;
        const r = parsed.value;
        out.push({ key: typeof r["key"] === "string" ? r["key"] : null, ts: Number(r["ts"]) });
    }
    return out;
}
/**
 * Append `rows` to one ledger. Every row is checked before any is written, so a
 * refused row leaves the file byte-identical. Each row gets `schema` and a `ts`
 * minted now (never supplied), `repo` when it lacks one and `bkit.version` from
 * `.bkit/version`; an `AGED_KINDS` row also gets `firstTs` + `updates` carried
 * forward from its entry's rows already in the ledger (supplied values replaced).
 * Never rewrites existing rows. The write runs under the ledger's target lock; with
 * `options.operation` it also records the prepared bytes and a durable receipt, so a
 * lost response is reconciled by inspecting the ledger, never by appending again.
 * Throws a CommandError (USAGE / EXIT_ROW_REFUSED / EXIT_STAGE).
 */
export function appendLedgerRows(root, ledger, rows, invocation, options = {}) {
    if (!Object.hasOwn(APPEND_LEDGERS, ledger)) {
        throw new CommandError(EXIT.USAGE, `--ledger must be one of ${Object.keys(APPEND_LEDGERS).join(", ")} (got '${ledger}')`);
    }
    const { file, kinds } = APPEND_LEDGERS[ledger];
    const takes = kinds;
    if (!Array.isArray(rows))
        throw new CommandError(EXIT.USAGE, "--rows must hold a JSON array");
    if (rows.length === 0)
        throw new CommandError(EXIT.USAGE, "--rows holds no rows");
    const abs = path.join(root, file);
    const made = mkdirp(path.dirname(abs));
    if (made)
        throw new CommandError(EXIT_STAGE, `mkdir failed for ${path.dirname(file)}: ${made}`);
    const ops = path.join(root, LEDGER_OPERATIONS_FILE);
    // The request is the ledger and rows alone: an operation stays reconcilable after its
    // invocation goes stale, and replay writes the recorded bytes, never a re-derived `by`.
    const hash = actionHash(JSON.stringify({ ledger, rows }));
    if (options.operation !== undefined && options.issueOperation === true)
        throw new CommandError(EXIT.USAGE, "--issue-operation and --operation are exclusive: the engine issues the id, or the caller names it");
    if (options.issueOperation === true && invocation === undefined)
        throw new CommandError(EXIT.USAGE, "--issue-operation needs --invocation: the id is issued from that invocation's context");
    const operation = appendOperationId(ledger, rows, invocation, options);
    // A rejection before any write is correctable only inside a workflow run (it has a scope to
    // spend from) and only when the operation can be named by the corrected retry.
    const scope = invocation === undefined ? null : appendCorrectionScope(invocation, ledger);
    const reject = (why, row) => {
        const message = `row ${row}: ${why}`;
        return scope !== null && operation !== undefined
            ? new NoWriteRejection(EXIT_ROW_REFUSED, message, { scope, substep: "append" })
            : new CommandError(EXIT_ROW_REFUSED, message);
    };
    const result = (landed, block, replayed) => {
        const parsedRows = receiptRows(block);
        return {
            ledger: ledger,
            file,
            appended: replayed ? 0 : parsedRows.length,
            keys: parsedRows.map((r) => r.key),
            ...(operation === undefined
                ? {}
                : {
                    receipt: {
                        operation,
                        ledger,
                        file,
                        offset: landed.offset,
                        bytes: landed.bytes,
                        rows: parsedRows,
                        replayed,
                    },
                }),
        };
    };
    const build = (text) => {
        let repo;
        let version;
        let last;
        const prior = parse(text).events;
        const out = rows.map((raw, i) => {
            const refuse = (why) => new CommandError(EXIT_ROW_REFUSED, `row ${i + 1}: ${why}`);
            if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
                throw reject("not a JSON object", i + 1);
            }
            const r = invocation === undefined
                ? raw
                : withInvocationBy(raw, invocation, refuse);
            if (invocation === undefined && byOfRow(r)["modelSource"] === "unavailable")
                throw refuse("by.modelSource unavailable needs a validated --invocation; the engine records it, a caller cannot assert it");
            if (Object.hasOwn(r, "ts"))
                throw reject("carries ts; ts is minted at append time", i + 1);
            if (Object.hasOwn(r, "schema"))
                throw reject("carries schema; it is set at append time", i + 1);
            if (!takes.includes(String(r["kind"]))) {
                throw reject(`kind must be ${takes.join(" | ")} in --ledger=${ledger} (got ${String(r["kind"])})`, i + 1);
            }
            if (Object.hasOwn(r, "bkit"))
                throw reject("carries bkit; bkit.version is set at append time", i + 1);
            repo ??= resolveRepoSlug(root) || "unknown/repo";
            version ??= readBkitVersion(path.join(root, ".bkit", "version"))?.pinnedVersion || "unknown";
            last = mintTs(last);
            const filled = withLineage(prior, {
                repo,
                ...r,
                schema: SCHEMA,
                ts: last,
                bkit: { version },
            });
            const row = {};
            for (const k of TOP_ORDER)
                if (filled[k] !== undefined)
                    row[k] = filled[k];
            for (const [k, v] of Object.entries(filled))
                if (!(k in row))
                    row[k] = v;
            const v = validate(row);
            if (!v.ok)
                throw reject(v.reason ?? "invalid", i + 1);
            const who = writerProblem(row);
            if (who !== undefined)
                throw refuse(who);
            prior.push(row);
            return row;
        });
        return out.map((r) => `${JSON.stringify(r)}\n`).join("");
    };
    const stage = (err) => err instanceof CommandError
        ? err
        : new CommandError(EXIT_STAGE, `append failed: ${file} \u2014 ${err.message}`);
    try {
        return withTargetLock(abs, () => {
            if (operation === undefined) {
                const landed = appendHeld(abs, build, { checkpoint: options.checkpoint });
                return result(landed, landed.block, false);
            }
            // The operation store is serialized by its own lock, taken after the target's, so two
            // ledgers' operations (and `union` of the store) never interleave check and record.
            return withTargetLock(ops, () => {
                const known = ledgerOperation(ops, operation, hash);
                if (known.state === "conflict")
                    throw new CommandError(EXIT_ROW_REFUSED, `operation ${operation} was already used for a different request; nothing written`);
                if (known.state === "replay") {
                    const d = known.row
                        .detail;
                    if (d === undefined)
                        throw new CommandError(EXIT_STAGE, `operation ${operation} has a receipt without its effect`);
                    return result(d, d.block, true);
                }
                const intent = ledgerIntent(ops, operation);
                if (intent !== undefined && intent.hash !== hash)
                    throw new CommandError(EXIT_ROW_REFUSED, `operation ${operation} was already used for a different request; nothing written`);
                const receipt = (landed) => recordLedgerOperation(ops, {
                    operation,
                    hash,
                    ref: `${file}@${landed.offset}+${landed.bytes}`,
                    detail: { offset: landed.offset, bytes: landed.bytes, block: landed.block },
                });
                if (intent !== undefined) {
                    const have = fs.existsSync(abs) ? fs.readFileSync(abs) : Buffer.alloc(0);
                    const want = Buffer.from(intent.block);
                    const seg = have.subarray(intent.offset, intent.offset + want.length);
                    if (seg.equals(want)) {
                        // The bytes landed whole; confirm them durable and receipt them.
                        const fd = fs.openSync(abs, "r");
                        try {
                            fs.fsyncSync(fd);
                        }
                        finally {
                            fs.closeSync(fd);
                        }
                        receipt(intent);
                        options.checkpoint?.("receipted");
                        return result(intent, intent.block, true);
                    }
                    let landedBytes = 0;
                    while (landedBytes < seg.length &&
                        landedBytes < want.length &&
                        seg[landedBytes] === want[landedBytes])
                        landedBytes++;
                    if (landedBytes > 0 || (seg.length > 0 && have.length === intent.offset + seg.length))
                        throw new UncertainEffect(EXIT_STAGE, `operation ${operation}: ${file} holds ${landedBytes} of ${want.length} prepared bytes at the recorded offset; the effect is uncertain, nothing was truncated or retried`);
                    if (have.length === intent.offset) {
                        // Nothing landed: write the exact prepared bytes again.
                        writePrepared(abs, intent.block, intent.offset);
                        options.checkpoint?.("written");
                        receipt(intent);
                        options.checkpoint?.("receipted");
                        return result(intent, intent.block, false);
                    }
                    // Another writer appended after the failed attempt and none of ours landed: prepare afresh.
                }
                const landed = appendHeld(abs, build, {
                    checkpoint: options.checkpoint,
                    prepared: (p) => recordLedgerIntent(ops, {
                        operation,
                        hash,
                        file,
                        offset: p.offset,
                        bytes: Buffer.byteLength(p.block),
                        block: p.block,
                    }),
                    written: (p) => receipt(p),
                });
                return result(landed, landed.block, false);
            });
        });
    }
    catch (err) {
        throw stage(err);
    }
}
function append(ctx) {
    const root = path.resolve(ctx.cwd, str(ctx.flags.root) ?? ".");
    const src = String(ctx.flags.rows);
    const read = readText(src === "-" ? 0 : path.resolve(ctx.cwd, src));
    if (!read.ok)
        throw new CommandError(EXIT.USAGE, `--rows unreadable: ${read.error}`);
    const text = read.text;
    if (text.trim() === "")
        throw new CommandError(EXIT.USAGE, "--rows holds no rows");
    const parsed = parseJson(text);
    if (!parsed.ok)
        throw new CommandError(EXIT.USAGE, "--rows is not JSON");
    const bound = ctx.invocation?.bookRoot;
    if (bound !== undefined && bound !== null && bound !== root)
        throw new CommandError(EXIT.USAGE, `conflict: --root ${root} is not the invocation's book root ${bound}`);
    // A runless call has no book root of its own: its output scope is the checkout that issued it.
    if (ctx.invocation?.scope === "outbox") {
        const rel = path.relative(ctx.invocation.worktree, root);
        if (rel.startsWith("..") || path.isAbsolute(rel))
            throw new CommandError(EXIT.USAGE, `conflict: --root ${root} is outside the checkout ${ctx.invocation.worktree} that issued invocation ${ctx.invocation.id}`);
    }
    const ledger = String(ctx.flags.ledger);
    const request = {
        operation: str(ctx.flags.operation),
        issueOperation: ctx.flags.issueOperation === true,
    };
    const run = ctx.invocation;
    const scope = run === undefined ? null : appendCorrectionScope(run, ledger);
    const operation = appendOperationId(ledger, parsed.value, run, request);
    const correctionOf = str(ctx.flags.correctionOf);
    let spend;
    const book = run === undefined || scope === null ? null : correctionBook(ctx.cwd, run);
    if (correctionOf !== undefined) {
        if (run === undefined || scope === null || book === null)
            throw new CommandError(EXIT.USAGE, "--correction-of needs an --invocation with a correction scope: a workflow-run call, or a standalone audit or utility call");
        if (operation === undefined || operation === correctionOf)
            throw new CommandError(EXIT.USAGE, "--correction-of needs a fresh --operation or --issue-operation: a corrected candidate has its own operation id");
        const rejected = readStatusRows(book.file).some((row) => row.type === CORRECTION_REJECTED_ROW &&
            row.operation === correctionOf &&
            row.scope === scope &&
            row.workflow === book.workflow);
        if (!rejected)
            throw new CommandError(EXIT.USAGE, `--correction-of=${correctionOf} names no rejected ${ledger} append in this step; only a guaranteed no-write rejection of this sub-step can be corrected`);
        // An earlier operation on this ledger whose effect is unconfirmed is reconciled first.
        const target = Object.hasOwn(APPEND_LEDGERS, ledger)
            ? APPEND_LEDGERS[ledger].file
            : undefined;
        if (target !== undefined &&
            pendingLedgerIntents(path.join(root, LEDGER_OPERATIONS_FILE), target).length > 0)
            throw new UncertainEffect(EXIT_STAGE, `${target} holds an operation whose effect is unconfirmed; reconcile it before any corrected candidate — nothing was written`);
        spend = spendCorrection(book.file, book.workflow, scope, operation, CORRECTION_LIMIT, {
            of: correctionOf,
            step: book.step,
            substep: "append",
        });
        if (!spend.allowed)
            throw new CorrectionExhausted(EXIT.NO, `the correction budget of ${scope} is spent (${spend.used} of ${spend.limit}); nothing was written`, scope);
    }
    let r;
    try {
        r = appendLedgerRows(root, ledger, parsed.value, ctx.invocation, request);
    }
    catch (err) {
        if (err instanceof NoWriteRejection && book !== null && operation !== undefined) {
            fs.appendFileSync(book.file, appendLine({
                type: CORRECTION_REJECTED_ROW,
                workflow: book.workflow,
                at: statusTimestamp(),
                scope: err.detail.scope,
                substep: err.detail.substep,
                operation,
                step: book.step,
            }));
            // The last allowed retry was just used: the rejection is final, not correctable.
            if (spend !== undefined && spend.remaining === 0)
                throw new CommandError(err.code, err.message);
        }
        throw err;
    }
    ctx.log(r.receipt?.replayed === true
        ? `operation ${r.receipt.operation} already appended to ${r.file}; nothing written`
        : `appended ${r.appended} row(s) to ${r.file}`);
    if (spend === undefined || book === null || scope === null) {
        ctx.emit({ ...r });
        return EXIT.OK;
    }
    const verified = r.receipt?.replayed === true || r.appended === parsed.value.length;
    const succeeded = readStatusRows(book.file).some((row) => row.type === CORRECTION_SUCCEEDED_ROW && row.operation === operation);
    if (verified && !succeeded)
        fs.appendFileSync(book.file, appendLine({
            type: CORRECTION_SUCCEEDED_ROW,
            workflow: book.workflow,
            at: statusTimestamp(),
            scope,
            substep: "append",
            operation,
            of: correctionOf,
            step: book.step,
        }));
    ctx.emit({
        ...r,
        correction: {
            scope,
            operation,
            of: correctionOf,
            used: spend.used,
            limit: spend.limit,
            substep: "append",
            verified,
        },
    });
    return EXIT.OK;
}
/** Page cursor: the snapshot and filter it was cut from, and the offset of the next row. */
function encodeCursor(c) {
    return Buffer.from(JSON.stringify(c)).toString("base64url");
}
function decodeCursor(text) {
    const parsed = parseJson(Buffer.from(text, "base64url").toString("utf-8"));
    if (!parsed.ok || parsed.value === null || typeof parsed.value !== "object")
        return null;
    const v = parsed.value;
    return typeof v["s"] === "string" && typeof v["f"] === "string" && Number.isInteger(v["o"])
        ? { s: v["s"], f: v["f"], o: v["o"] }
        : null;
}
function query(ctx) {
    const root = rootOf(ctx);
    const ledger = String(ctx.flags.ledger);
    if (!Object.hasOwn(APPEND_LEDGERS, ledger)) {
        throw new CommandError(EXIT.USAGE, `--ledger must be one of ${Object.keys(APPEND_LEDGERS).join(", ")} (got '${ledger}')`);
    }
    const { file } = APPEND_LEDGERS[ledger];
    const filter = { key: str(ctx.flags.key), status: str(ctx.flags.status) };
    const limit = wholeNumber(ctx.flags.limit, "limit", QUERY_PAGE, 1);
    const filterId = JSON.stringify([filter.key ?? null, filter.status ?? null]);
    const cursorText = str(ctx.flags.cursor);
    const cursor = cursorText === undefined ? null : decodeCursor(cursorText);
    if (cursorText !== undefined && cursor === null)
        throw new CommandError(EXIT.USAGE, "--cursor is not a cursor from this command");
    const abs = path.join(root, file);
    const read = readText(abs);
    const missing = !read.ok && !fs.existsSync(abs);
    const raw = read.ok ? read.text : "";
    const snapshot = createHash("sha256").update(raw).digest("hex").slice(0, 16);
    if (cursor !== null && (cursor.s !== snapshot || cursor.f !== filterId))
        throw new CommandError(EXIT.USAGE, "stale cursor: the ledger or the filter changed since this scan began; start again without --cursor");
    const result = queryLedger(raw, filter);
    const offset = cursor?.o ?? 0;
    const page = result.rows.slice(offset, offset + limit);
    const next = offset + limit < result.rows.length ? offset + limit : null;
    const status = missing
        ? "missing"
        : !read.ok
            ? "unreadable"
            : result.diagnostics.length > 0
                ? "partial"
                : "complete";
    ctx.emit({
        ledger,
        file,
        rows: page,
        nextCursor: next === null ? null : encodeCursor({ s: snapshot, f: filterId, o: next }),
        snapshot,
        total: result.rows.length,
        diagnostics: result.diagnostics,
        coverage: {
            status,
            clean: status === "complete",
            malformedLines: result.diagnostics.length,
            lines: result.lines,
            ...(!read.ok && !missing ? { error: read.error } : {}),
        },
    });
    return EXIT.OK;
}
const LEDGER_ROWS_LINE = /^\*\*Ledger rows:\*\*(.*)$/m;
const CHECKED_LEDGERS = [APPEND_LEDGERS.decisions, APPEND_LEDGERS.deferrals];
/**
 * Read the plan's `**Ledger rows:**` line — backticked keys, or `None` — and
 * return the keys no `decision` / `deferral` row carries. Throws EXIT_ROWS_MISSING
 * when the line is absent or still a placeholder.
 */
export function checkPlanRows(root, plan) {
    const abs = path.resolve(root, plan);
    if (!fs.existsSync(abs))
        throw new CommandError(EXIT.USAGE, `--plan not found: ${plan}`);
    const text = fs.readFileSync(abs, "utf-8");
    const line = LEDGER_ROWS_LINE.exec(text)?.[1]?.trim();
    if (line === undefined) {
        throw new CommandError(EXIT_ROWS_MISSING, `${plan} has no **Ledger rows:** line`);
    }
    const keys = [...line.matchAll(/`([^`]+)`/g)].map((m) => m[1] ?? "");
    if (keys.length === 0) {
        if (line.replace(/[."\s]/g, "") === "None")
            return { keys: [], missing: [] };
        throw new CommandError(EXIT_ROWS_MISSING, `${plan}: **Ledger rows:** is unfilled (${line})`);
    }
    const onDisk = new Set();
    for (const { file, kinds } of CHECKED_LEDGERS) {
        const abs = path.join(root, file);
        if (!fs.existsSync(abs))
            continue;
        for (const e of parse(fs.readFileSync(abs, "utf-8")).events) {
            const key = e.key;
            if (kinds.includes(e.kind) && typeof key === "string")
                onDisk.add(key);
        }
    }
    return { keys, missing: keys.filter((k) => !onDisk.has(k)) };
}
function check(ctx) {
    const root = rootOf(ctx);
    const plan = String(ctx.flags.plan);
    const r = checkPlanRows(root, plan);
    ctx.emit({ plan, ...r });
    if (r.missing.length > 0) {
        ctx.log(`${plan}: no ledger row for ${r.missing.join(", ")}`);
        return EXIT_ROWS_MISSING;
    }
    ctx.log(`${plan}: ${r.keys.length} ledger row(s) on disk`);
    return EXIT.OK;
}
function compact(ctx) {
    const root = rootOf(ctx);
    const named = str(ctx.flags.ledger) ?? "all";
    if (named !== "all" && !Object.hasOwn(COMPACT_LEDGERS, named)) {
        throw new CommandError(EXIT.USAGE, `--ledger must be one of ${Object.keys(COMPACT_LEDGERS).join(", ")}, all (got '${named}')`);
    }
    const ledgers = (named === "all" ? Object.keys(COMPACT_LEDGERS) : [named]);
    const dryRun = ctx.flags.dryRun === true;
    const results = compactOrError(root, ledgers, dryRun);
    if (typeof results === "string")
        throw new CommandError(EXIT_STAGE, `compact failed: ${results}`);
    const dropped = results.reduce((n, r) => n + r.dropped, 0);
    for (const r of results) {
        ctx.log(`${r.file}: ${r.dropped} superseded row(s) dropped, ${r.stamped} winner(s) stamped`);
    }
    ctx.emit({ dryRun, ledgers: results, dropped });
    return EXIT.OK;
}
/** mkdir -p; the error text, or undefined on success. */
function mkdirp(dir) {
    try {
        fs.mkdirSync(dir, { recursive: true });
        return undefined;
    }
    catch (err) {
        // Reported as the command's staging exit code, with the reason.
        return err.message;
    }
}
/** {@link compactLedgers}; its results, or the error text. A failed temp write or rename leaves the ledger untouched. */
function compactOrError(root, ledgers, dryRun) {
    try {
        const targets = ledgers.map((l) => COMPACT_LEDGERS[l]).sort();
        const locked = (i) => {
            if (i === targets.length) {
                const ops = path.join(root, LEDGER_OPERATIONS_FILE);
                for (const t of targets) {
                    const pending = pendingLedgerIntents(ops, t);
                    if (pending.length > 0)
                        throw new Error(`${t} has ${pending.length} ledger operation(s) with bytes but no receipt (${pending.map((p) => p.operation).join(", ")}); replay them before compacting`);
                }
                return compactLedgers(root, ledgers, dryRun);
            }
            return withTargetLock(path.join(root, targets[i]), () => locked(i + 1));
        };
        return locked(0);
    }
    catch (err) {
        // Reported as the command's staging exit code, with the reason.
        return err.message;
    }
}
/** Read `file` (0 = stdin) as UTF-8; the text, or the error text. */
function readText(file) {
    try {
        return { ok: true, text: fs.readFileSync(file, "utf-8") };
    }
    catch (err) {
        // Reported as a usage error, with the reason.
        return { ok: false, error: err.message };
    }
}
function copy(from, to) {
    try {
        fs.copyFileSync(from, to);
        return undefined;
    }
    catch (err) {
        // Reported as the command's staging exit code, with the reason.
        return err.message;
    }
}
/**
 * Whether `to` is `from` plus bookkeeping-only commits (the `pr` allow-list). One
 * check for `ledgers only-bookkeeping` and the ship gate's carry-forward.
 */
export function checkOnlyBookkeeping(root, o) {
    for (const ref of [o.from, o.to]) {
        if (gitRaw(root, ["cat-file", "-e", `${ref}^{commit}`]).status !== 0) {
            return { kind: "unknown-commit", ref };
        }
    }
    if (gitRaw(root, ["merge-base", "--is-ancestor", o.from, o.to]).status !== 0) {
        return { kind: "not-ancestor" };
    }
    const diff = changedOutside(root, o.from, o.to, bookPathspecs(o.month, o.fid, "pr", readBkitConfig(root).ciSkipPaths));
    if (!diff.ok)
        return { kind: "diff-failed", stderr: diff.stderr };
    return diff.outside.length ? { kind: "outside", outside: diff.outside } : { kind: "ok" };
}
/**
 * Every path changed in `from..to`, and the ones no pathspec in `specs` matches, both
 * sorted. Git does the matching, so `specs` take pathspec magic (`:(glob)`). Renames
 * count as a delete plus an add, so both paths must match.
 */
export function changedOutside(root, from, to, specs) {
    const diff = (only) => gitRaw(root, [
        "diff",
        "--name-only",
        "-z",
        "--no-renames",
        from,
        to,
        ...(only.length ? ["--", ...only] : []),
    ]);
    const all = diff([]);
    if (all.status !== 0)
        return { ok: false, stderr: all.stderr };
    const changed = [...new Set(nulList(all.stdout))].sort();
    // No specs = nothing allowed: `git diff` with no pathspec would match every path.
    if (specs.length === 0)
        return { ok: true, changed, outside: changed };
    const book = diff(specs);
    if (book.status !== 0)
        return { ok: false, stderr: book.stderr };
    const allowed = new Set(nulList(book.stdout));
    return { ok: true, changed, outside: changed.filter((p) => !allowed.has(p)) };
}
function onlyBookkeeping(ctx) {
    const month = required(ctx, "month");
    const fid = required(ctx, "fid");
    const from = required(ctx, "from");
    const to = required(ctx, "to");
    const root = rootOf(ctx);
    requireRepo(root);
    const check = checkOnlyBookkeeping(root, { month, fid, from, to });
    switch (check.kind) {
        case "unknown-commit":
            throw new CommandError(EXIT_ROOT, `unknown commit: ${check.ref}`);
        case "diff-failed":
            throw new CommandError(EXIT_ROOT, `'git diff' failed for ${from}..${to}: ${check.stderr}`);
        case "not-ancestor":
            ctx.log(`${from} is not an ancestor of ${to}`);
            ctx.emit({ onlyBookkeeping: false, ancestor: false, outside: [] });
            return EXIT_NOT_BOOKKEEPING;
        case "outside":
            ctx.log(`non-bookkeeping paths changed in ${from}..${to}:`);
            for (const p of check.outside)
                ctx.log(`  ${p}`);
            ctx.emit({ onlyBookkeeping: false, ancestor: true, outside: check.outside });
            return EXIT_NOT_BOOKKEEPING;
        case "ok":
            ctx.log(`every path changed in ${from}..${to} is bookkeeping`);
            ctx.emit({ onlyBookkeeping: true, ancestor: true, outside: [] });
            return EXIT.OK;
    }
}
// ---------------------------------------------------------------------------
// triage — the sweep's deferral tests, computed
// ---------------------------------------------------------------------------
//
// `.bkit/jsonl.md` § Deferral Reason states the four tests: each names a way a
// deferral reads as in-scope work that should have been finished, and all four
// holding marks the row `unjustified`. The engine decides them from the row, its
// own `references`, the plan's task surfaces, its Reuse Inventory and its
// Out of Scope table. The sweep keeps the judgement the four cannot reach.
/** The four tests, in `.bkit/jsonl.md` order; each holds when the row reads as in-scope work. */
export const DEFERRAL_TESTS = [
    "bounded-remediation",
    "in-scope-surface",
    "no-external-blocker",
    "own-declaration",
];
/** The issue number a FID leads with (`701-engine-work` → `701`), else "". */
const fidIssue = (fid) => /^(\d+)(?=$|[-_])/.exec(fid)?.[1] ?? "";
/** A row's `references` entries, as written. */
const rowRefs = (row) => Array.isArray(row["references"])
    ? row["references"].filter((x) => typeof x === "string")
    : [];
/** True when `ref` names the feature: the FID, or its leading issue number as `N` / `#N`. */
const namesFeature = (ref, fid, issue) => ref.includes(fid) || (issue !== "" && new RegExp(`^#?${issue}(?![0-9])`).test(ref));
/** Every well-formed row of a JSONL ledger, as written. */
function readLedgerRows(file) {
    if (!fs.existsSync(file))
        return [];
    return fs
        .readFileSync(file, "utf-8")
        .split("\n")
        .flatMap((line) => {
        if (line.trim() === "")
            return [];
        const parsed = parseJson(line);
        const v = parsed.ok ? parsed.value : null;
        return typeof v === "object" && v !== null && !Array.isArray(v)
            ? [v]
            : [];
    });
}
/** The deferral rows `fid` declared, same-`key` folded last-wins, in first-seen order. */
export function featureDeferrals(rows, fid) {
    const issue = fidIssue(fid);
    const kept = [];
    const at = new Map();
    for (const row of rows) {
        if (row["kind"] !== "deferral")
            continue;
        const key = typeof row["key"] === "string" ? row["key"] : "";
        const named = key !== "" && namesFeature(key, fid, issue);
        if (!named && !rowRefs(row).some((r) => namesFeature(r, fid, issue)))
            continue;
        const seen = key === "" ? undefined : at.get(key);
        if (seen !== undefined) {
            kept[seen] = row;
            continue;
        }
        if (key !== "")
            at.set(key, kept.length);
        kept.push(row);
    }
    return kept;
}
/** A repo path a token names, with any `:line` suffix cut; null when the token is no path. */
function pathToken(token) {
    const t = token
        .trim()
        .replace(/:\d+(?:-\d+)?$/, "")
        .replace(/[.,;:]+$/, "")
        .replace(/^\.\//, "");
    if (t === "" || /\s/.test(t) || t.startsWith("#") || /^[a-z][a-z0-9+.-]*:\/\//i.test(t))
        return null;
    if (!t.includes("/") && !/\.[A-Za-z][A-Za-z0-9]{0,5}$/.test(t))
        return null;
    return path.posix.normalize(t);
}
/** The repo paths a row names: backticked spans and bare words of its `remediation`, plus its `references`. */
function namedPaths(row) {
    const texts = [
        ...(typeof row["remediation"] === "string" ? [row["remediation"]] : []),
        ...rowRefs(row),
    ];
    const tokens = texts.flatMap((t) => [
        ...[...t.matchAll(/`([^`]+)`/g)].map((m) => m[1]),
        ...t.replace(/`[^`]*`/g, " ").split(/[\s,()[\]]+/),
    ]);
    return [
        ...new Set(tokens.map(pathToken).filter((p) => p !== null && p !== "." && p !== "..")),
    ];
}
/** True when one of `paths` is a file in `root`. */
function existsIn(root, paths) {
    return paths.some((p) => {
        const abs = path.resolve(root, p);
        const rel = path.relative(root, abs);
        return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel) && fs.existsSync(abs);
    });
}
/** True when `a` and `b` name the same path, or one sits inside the other. */
const within = (a, b) => a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`);
const NORMAL = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();
/** The items the plan's `Out of Scope` rows declare: their excluded item and every backticked token. */
function declaredItems(rows) {
    const out = new Set();
    for (const row of rows ?? []) {
        const item = row.cells[0] ?? "";
        if (item !== "")
            out.add(NORMAL(item));
        for (const cell of row.cells)
            for (const m of cell.matchAll(/`([^`]+)`/g))
                if (m[1].trim() !== "")
                    out.add(NORMAL(m[1]));
    }
    return out;
}
/**
 * True when a reference other than the row's own key or the bare FID names a
 * pre-existing declaration: a plan `Out of Scope` item, or a doc section declared
 * out of scope. A row that is its own only declaration names none.
 */
function declares(row, fid, issue, declared) {
    const own = typeof row["key"] === "string" ? NORMAL(row["key"]) : "";
    const self = NORMAL(fid);
    for (const ref of rowRefs(row)) {
        const t = ref.trim();
        if (t === "" || NORMAL(t) === own || NORMAL(t) === self || t === `#${issue}`)
            continue;
        if (t.includes("§") && /out[- ]of[- ]scope|non-?goals?/i.test(t))
            return true;
        const n = NORMAL(t);
        if (declared.has(n))
            return true;
        for (const d of declared)
            if (d.length >= 8 && n.includes(d))
                return true;
    }
    return false;
}
/** The same-`key` row triage appends: every prior field verbatim, the verdict fields replaced. */
export function unjustifiedRow(row, fid, held) {
    const out = {};
    for (const [k, v] of Object.entries(row)) {
        if (k === "schema" || k === "ts" || k === "bkit" || k === "by" || k === "description")
            continue;
        out[k] = v;
    }
    out["kind"] = "deferral";
    out["reason"] = UNJUSTIFIED_REASON;
    out["status"] = "TRIAGED";
    out["description"] =
        `Adjudicated unjustified by bkit ledgers triage for ${fid}: every deferral test holds (${held.join(", ")}).`;
    // The ship orchestrator's sweep step is the writer, so the row clears the kind's writer check.
    out["by"] = { workflow: "ship", step: "ship-deferred-sweep" };
    return out;
}
/**
 * Bucket the FID's deferral rows by the four tests and append a same-`key`
 * `unjustified` / `TRIAGED` row for each that holds all four. Throws
 * CommandError(USAGE) on a missing `--plan` or a plan whose task blocks do not
 * parse, CommandError(NO) on a plan with no task blocks — nothing written either
 * way — and EXIT_ROW_REFUSED when a computed row fails validation.
 */
export function triageDeferrals(root, fid, planPath) {
    const abs = path.resolve(root, planPath);
    if (!fs.existsSync(abs))
        throw new CommandError(EXIT.USAGE, `--plan not found: ${planPath}`);
    const text = fs.readFileSync(abs, "utf-8");
    const blocks = parsePlanBlocks(text);
    const error = blocks.errors[0];
    if (error !== undefined)
        throw new CommandError(EXIT.USAGE, `${planPath}:${error.line}: ${error.message} — run \`bkit tests plan-check\``);
    // No task block means no task surface: every row would bucket `Exempt` unread.
    if (blocks.tasks.length === 0)
        throw new CommandError(EXIT.NO, `${planPath}: ${NO_MARKERS_REASON}`);
    const surfaces = new Set();
    for (const task of blocks.tasks)
        for (const ref of [...task.create, ...task.read, ...task.update, ...task.delete])
            surfaces.add(path.posix.normalize(ref.file));
    for (const row of reuseInventory(text)?.rows ?? [])
        for (const f of row.files)
            surfaces.add(f);
    const scope = [...surfaces];
    const declared = declaredItems(outOfScope(text));
    const issue = fidIssue(fid);
    const rows = featureDeferrals(readLedgerRows(path.join(root, APPEND_LEDGERS.deferrals.file)), fid);
    const out = [];
    const write = [];
    for (const row of rows) {
        const key = typeof row["key"] === "string" ? row["key"] : null;
        // Closed work is done: nothing to test, nothing to write.
        if (row["status"] === "CLOSED") {
            out.push({ key, bucket: "Exempt", tests: [], written: false });
            continue;
        }
        // A LOW challenge finding holds without the tests, and an adjudicated row is never
        // re-adjudicated: it keeps the `Lazy` bucket its adjudication earned, so an
        // outstanding unjustified deferral never reads as `Exempt Deferrals`.
        if (row["reason"] === UNJUSTIFIED_REASON) {
            out.push({ key, bucket: "Lazy", tests: [], written: false });
            continue;
        }
        if (row["reason"] === "low-severity" && row["severity"] === "LOW") {
            out.push({ key, bucket: "Exempt", tests: [], written: false });
            continue;
        }
        const paths = namedPaths(row);
        const verdicts = {
            // Test 1 reads "not a new architecture": an `own-cycle` row declares itself plan-sized.
            "bounded-remediation": row["reason"] !== "own-cycle" && existsIn(root, paths),
            "in-scope-surface": paths.some((p) => scope.some((s) => within(p, s))),
            "no-external-blocker": row["reason"] !== "hard-blocked" && row["reason"] !== "needs-decision",
            "own-declaration": !declares(row, fid, issue, declared),
        };
        const tests = DEFERRAL_TESTS.map((test) => ({ test, held: verdicts[test] }));
        const lazy = tests.every((t) => t.held);
        if (lazy)
            write.push(unjustifiedRow(row, fid, tests.map((t) => t.test)));
        out.push({ key, bucket: lazy ? "Lazy" : "Exempt", tests, written: lazy });
    }
    if (write.length > 0)
        appendLedgerRows(root, "deferrals", write);
    return { fid, plan: planPath, rows: out, total: out.length, written: write.length };
}
function triage(ctx) {
    const r = triageDeferrals(rootOf(ctx), required(ctx, "fid"), required(ctx, "plan"));
    for (const row of r.rows) {
        const verdict = row.tests.length === 0
            ? "not tested"
            : row.tests.map((t) => `${t.test} ${t.held ? "holds" : "fails"}`).join(", ");
        ctx.log(`${row.key ?? "(no key)"} — ${row.bucket}: ${verdict}`);
    }
    ctx.log(`${r.total} deferral row(s) for ${r.fid}, ${r.written} written unjustified`);
    ctx.emit({ ...r });
    return EXIT.OK;
}
