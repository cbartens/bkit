// bkit ledgers commit|union|only-bookkeeping|append — stage and commit bookkeeping
// by an allow-list, never `git add -A`; append validated rows with a minted `ts`.
//
// The pathspec is built by `git ls-files` against quoted globs, so git does the
// matching and an unmatched glob is empty output, never a shell abort. Staging
// and committing read that list NUL-delimited from a file. An empty list stops
// before `git commit`: `git commit --pathspec-from-file=<empty file>` commits
// everything already in the index, not nothing.
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { readBkitVersion } from "../../install/version-file.js";
import { APPEND_LEDGERS, SCHEMA, gitEnv, mintTs, resolveRepoSlug, validate, writerProblem, } from "../../ledgers/telemetry.js";
import { CommandError, EXIT, parseJson, } from "../lib.js";
import { str } from "./status.js";
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
const SCOPES = ["core", "full", "pr"];
const MODES = ["stage", "commit", "commit-allow-empty"];
/**
 * The bookkeeping allow-list. Plain git pathspec `*` crosses `/`, so the
 * top-level-only entry uses the `:(glob)` magic.
 */
export function bookPathspecs(month, fid, scope) {
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
    // `pr` adds the project docs ship's docs sync edits, for the commit that rides
    // the PR. Kept out of `full` so a close on a laptop's dev checkout never sweeps
    // unrelated dirty docs into its commit.
    if (scope === "pr")
        specs.push(":(glob)docs/*.md");
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
    summary: "Stage and commit bookkeeping by allow-list; union ledgers; check a range is bookkeeping only.",
    verbs: {
        commit: {
            summary: "Stage (and commit) the bookkeeping allow-list for one feature.",
            flags: [
                ROOT_FLAG,
                MONTH_FLAG,
                FID_FLAG,
                {
                    name: "scope",
                    type: "string",
                    required: true,
                    help: "core (logs + ledgers) | full (+ docs ledgers, skills) | pr (+ top-level docs/*.md)",
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
                    help: "run `git add -u` first (stages every tracked change)",
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
                paths: "bookkeeping paths the allow-list matched",
                squashPaths: "paths the --squash-of ref brought in",
            },
            exitCodes: {
                [EXIT_ROOT]: "root not a directory or git repo, git < 2.25, or --squash-of does not resolve",
                [EXIT_STAGE]: "staging failed (git add / git add -u)",
                [EXIT_COMMIT]: "git commit failed",
                [EXIT_EMPTY]: "the allow-list matched nothing — refusing to commit the whole index",
                [EXIT_FOREIGN_PATH]: "an in-place run's allow-listed path was already modified before the run and changed during it — nothing committed",
            },
            run: (ctx) => commit(ctx),
        },
        union: {
            summary: "Append a worktree's new ledger rows into another checkout (never .bkit/issues.jsonl).",
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
            ],
            output: {
                ledger: "the ledger appended to",
                file: "its path, relative to --root",
                appended: "rows written",
                keys: "each row's key, in order (null when a row has none)",
            },
            exitCodes: {
                [EXIT_STAGE]: "mkdir or append failed",
                [EXIT_ROW_REFUSED]: "a row carries ts, has the wrong kind, fails validation, or names a writer not listed for its kind — nothing written",
            },
            run: (ctx) => append(ctx),
        },
    },
};
/**
 * Stage (and commit) the bookkeeping allow-list for one feature. Throws a
 * CommandError with EXIT_ROOT / EXIT_STAGE / EXIT_COMMIT / EXIT_EMPTY.
 */
export function commitBookkeeping(o, log) {
    const { root, month, fid, scope, mode, message, squashOf } = o;
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
    if (squashOf !== undefined &&
        gitRaw(root, ["rev-parse", "-q", "--verify", `${squashOf}^{commit}`]).status !== 0) {
        throw new CommandError(EXIT_ROOT, `--squash-of: unknown commit: ${squashOf}`);
    }
    requireGitVersion();
    if (o.onlyIfDirtyTracked === true) {
        const dirty = dirtyTracked(root);
        if (dirty.length === 0) {
            log("no tracked file has uncommitted changes — nothing to commit");
            return { outcome: "clean", commit: null, paths: [], squashPaths: [] };
        }
        for (const line of dirty)
            log(line);
    }
    // An in-place run on a shared branch: recorded paths are someone else's.
    const rec = squashOf === undefined ? activeRecord(root, fid) : null;
    if (o.stageTrackedUpdates === true) {
        // Throws EXIT_FOREIGN_PATH when any recorded path changed, before anything is staged.
        if (rec !== null)
            ownSet(root, rec);
        const keepOut = (rec?.paths ?? []).map((p) => `:(exclude,literal)${p.path}`);
        const res = gitRaw(root, ["add", "-u", ...(keepOut.length > 0 ? ["--", ".", ...keepOut] : [])]);
        if (res.status !== 0)
            throw new CommandError(EXIT_STAGE, `'git add -u' failed: ${res.stderr}`);
    }
    const specs = bookPathspecs(month, fid, scope);
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
    if (mode !== "stage" && paths.length + squashPaths.length + ledgerRows.length === 0) {
        // The pre-worktree commit records only bookkeeping; a dirty tree with none
        // of it (a fresh consumer repo) has nothing of ours to commit, and stopping
        // here never reaches `git commit`.
        if (o.onlyIfDirtyTracked === true) {
            log(`no bookkeeping under scope=${scope} in ${root} — nothing to commit`);
            return { outcome: "nothing-to-commit", commit: null, paths, squashPaths };
        }
        throw new CommandError(EXIT_EMPTY, `empty pathspec list — refusing to commit (nothing under scope=${scope} matched in ${root})`);
    }
    if (rec !== null && mode !== "stage" && ledgerRows.length > 0) {
        const made = commitOwnSet(root, { plain: paths, ledgers: ledgerRows }, message, {
            allowEmpty: mode === "commit-allow-empty",
            skipIfEmpty: mode === "commit",
        });
        if (!made.ok)
            throw new CommandError(EXIT_COMMIT, `'git commit' failed: ${made.error}`);
        if (made.sha === null) {
            log("nothing to commit");
            return { outcome: "nothing-to-commit", commit: null, paths, squashPaths };
        }
        appendRecordCommit(root, fid, made.sha);
        return { outcome: "committed", commit: made.sha, paths, squashPaths };
    }
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ledgers-"));
    try {
        const bookList = path.join(tmp, "book");
        const commitList = path.join(tmp, "commit");
        fs.writeFileSync(bookList, paths.map((p) => `${p}\0`).join(""));
        fs.writeFileSync(commitList, [...paths, ...squashPaths].map((p) => `${p}\0`).join(""));
        const add = gitRaw(root, ["add", `--pathspec-from-file=${bookList}`, "--pathspec-file-nul"]);
        if (add.status !== 0)
            throw new CommandError(EXIT_STAGE, `'git add' failed: ${add.stderr}`);
        if (mode === "stage") {
            log(`staged (scope=${scope})`);
            return { outcome: "staged", commit: null, paths, squashPaths };
        }
        if (mode === "commit" &&
            gitRaw(root, ["diff", "--cached", "--quiet", "--", ...specs, ...squashPaths]).status === 0) {
            log("nothing to commit");
            return { outcome: "nothing-to-commit", commit: null, paths, squashPaths };
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
        return { outcome: "committed", commit: sha, paths, squashPaths };
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
            scope: String(f.scope),
            mode: String(f.mode),
            message: str(f.message),
            stageTrackedUpdates: f.stageTrackedUpdates === true,
            squashOf: str(f.squashOf),
            onlyIfDirtyTracked: f.onlyIfDirtyTracked === true,
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
            const existing = fs.readFileSync(to, "utf-8");
            const have = new Set(fileLines(existing));
            const fresh = fileLines(fs.readFileSync(from, "utf-8")).filter((l) => !have.has(l));
            const block = fresh.join("\n").replace(/\n+$/, "");
            // A destination missing its final newline would glue the first new row
            // onto its last one, leaving a line that is not JSON.
            const sep = existing !== "" && !existing.endsWith("\n") ? "\n" : "";
            if (block !== "")
                fs.appendFileSync(to, `${sep}${block}\n`);
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
const TOP_ORDER = ["schema", "ts", "kind", "key", "repo", "bkit", "by", "references"];
/**
 * Append `rows` to one ledger. Every row is checked before any is written, so a
 * refused row leaves the file byte-identical. Each row gets `schema` and a `ts`
 * minted now (never supplied), `repo` when it lacks one and `bkit.version` from
 * `.bkit/version`. Never reads back or rewrites existing rows. Throws a
 * CommandError (USAGE / EXIT_ROW_REFUSED / EXIT_STAGE).
 */
export function appendLedgerRows(root, ledger, rows) {
    if (!Object.hasOwn(APPEND_LEDGERS, ledger)) {
        throw new CommandError(EXIT.USAGE, `--ledger must be one of ${Object.keys(APPEND_LEDGERS).join(", ")} (got '${ledger}')`);
    }
    const { file, kinds } = APPEND_LEDGERS[ledger];
    const takes = kinds;
    if (!Array.isArray(rows))
        throw new CommandError(EXIT.USAGE, "--rows must hold a JSON array");
    if (rows.length === 0)
        throw new CommandError(EXIT.USAGE, "--rows holds no rows");
    let repo;
    let version;
    let last;
    const out = rows.map((raw, i) => {
        const refuse = (why) => new CommandError(EXIT_ROW_REFUSED, `row ${i + 1}: ${why}`);
        if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
            throw refuse("not a JSON object");
        }
        const r = raw;
        if (Object.hasOwn(r, "ts"))
            throw refuse("carries ts; ts is minted at append time");
        if (Object.hasOwn(r, "schema"))
            throw refuse("carries schema; it is set at append time");
        if (!takes.includes(String(r["kind"]))) {
            throw refuse(`kind must be ${takes.join(" | ")} in --ledger=${ledger} (got ${String(r["kind"])})`);
        }
        if (Object.hasOwn(r, "bkit"))
            throw refuse("carries bkit; bkit.version is set at append time");
        repo ??= resolveRepoSlug(root) || "unknown/repo";
        version ??= readBkitVersion(path.join(root, ".bkit", "version"))?.pinnedVersion || "unknown";
        last = mintTs(last);
        const filled = {
            repo,
            ...r,
            schema: SCHEMA,
            ts: last,
            bkit: { version },
        };
        const row = {};
        for (const k of TOP_ORDER)
            if (filled[k] !== undefined)
                row[k] = filled[k];
        for (const [k, v] of Object.entries(filled))
            if (!(k in row))
                row[k] = v;
        const v = validate(row);
        if (!v.ok)
            throw refuse(v.reason ?? "invalid");
        const who = writerProblem(row);
        if (who !== undefined)
            throw refuse(who);
        return row;
    });
    const abs = path.join(root, file);
    const made = mkdirp(path.dirname(abs));
    if (made)
        throw new CommandError(EXIT_STAGE, `mkdir failed for ${path.dirname(file)}: ${made}`);
    const block = out.map((r) => `${JSON.stringify(r)}\n`).join("");
    try {
        // A file missing its final newline would glue the first row onto its last one.
        fs.appendFileSync(abs, endsMidLine(abs) ? `\n${block}` : block);
    }
    catch (err) {
        throw new CommandError(EXIT_STAGE, `append failed: ${file} — ${err.message}`);
    }
    return {
        ledger: ledger,
        file,
        appended: out.length,
        keys: out.map((r) => (typeof r["key"] === "string" ? r["key"] : null)),
    };
}
/** True when `abs` exists, is non-empty and its last byte is not a newline. */
function endsMidLine(abs) {
    let fd;
    try {
        fd = fs.openSync(abs, "r");
        const size = fs.fstatSync(fd).size;
        if (size === 0)
            return false;
        const last = Buffer.alloc(1);
        fs.readSync(fd, last, 0, 1, size - 1);
        return last[0] !== 0x0a;
    }
    catch {
        // No file yet: the append creates it.
        return false;
    }
    finally {
        if (fd !== undefined)
            fs.closeSync(fd);
    }
}
function append(ctx) {
    const root = path.resolve(ctx.cwd, str(ctx.flags.root) ?? ".");
    const src = String(ctx.flags.rows);
    let text;
    try {
        text = fs.readFileSync(src === "-" ? 0 : path.resolve(ctx.cwd, src), "utf-8");
    }
    catch (err) {
        throw new CommandError(EXIT.USAGE, `--rows unreadable: ${err.message}`);
    }
    if (text.trim() === "")
        throw new CommandError(EXIT.USAGE, "--rows holds no rows");
    const parsed = parseJson(text);
    if (!parsed.ok)
        throw new CommandError(EXIT.USAGE, "--rows is not JSON");
    const r = appendLedgerRows(root, String(ctx.flags.ledger), parsed.value);
    ctx.log(`appended ${r.appended} row(s) to ${r.file}`);
    ctx.emit({ ...r });
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
    const diff = changedOutside(root, o.from, o.to, bookPathspecs(o.month, o.fid, "pr"));
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
