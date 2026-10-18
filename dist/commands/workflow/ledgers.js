// bkit ledgers commit|union|only-bookkeeping — stage and commit bookkeeping by
// an allow-list, never `git add -A`.
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
import { gitEnv } from "../../ledgers/telemetry.js";
import { CommandError, EXIT } from "../lib.js";
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
function gitRaw(cwd, args) {
    const res = spawnSync("git", args, {
        cwd,
        encoding: "utf-8",
        env: gitEnv(),
        maxBuffer: 1 << 28,
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
    if (o.stageTrackedUpdates === true) {
        const res = gitRaw(root, ["add", "-u"]);
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
    const paths = nulList(listed.stdout);
    let squashPaths = [];
    if (squashOf !== undefined) {
        const diff = gitRaw(root, ["diff", "--name-only", "-z", "--no-renames", `HEAD...${squashOf}`]);
        if (diff.status !== 0) {
            throw new CommandError(EXIT_ROOT, `'git diff' failed while listing the paths ${squashOf} brought in: ${diff.stderr}`);
        }
        squashPaths = nulList(diff.stdout);
    }
    if (mode !== "stage" && paths.length + squashPaths.length === 0) {
        // The pre-worktree commit records only bookkeeping; a dirty tree with none
        // of it (a fresh consumer repo) has nothing of ours to commit, and stopping
        // here never reaches `git commit`.
        if (o.onlyIfDirtyTracked === true) {
            log(`no bookkeeping under scope=${scope} in ${root} — nothing to commit`);
            return { outcome: "nothing-to-commit", commit: null, paths, squashPaths };
        }
        throw new CommandError(EXIT_EMPTY, `empty pathspec list — refusing to commit (nothing under scope=${scope} matched in ${root})`);
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
        return {
            outcome: "committed",
            commit: gitRaw(root, ["rev-parse", "HEAD"]).stdout.trim(),
            paths,
            squashPaths,
        };
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
    const changed = (specs) => gitRaw(root, [
        "diff",
        "--name-only",
        "-z",
        "--no-renames",
        o.from,
        o.to,
        ...(specs.length ? ["--", ...specs] : []),
    ]);
    const all = changed([]);
    const book = changed(bookPathspecs(o.month, o.fid, "pr"));
    if (all.status !== 0 || book.status !== 0) {
        return { kind: "diff-failed", stderr: all.status !== 0 ? all.stderr : book.stderr };
    }
    const allowed = new Set(nulList(book.stdout));
    const outside = [...new Set(nulList(all.stdout).filter((p) => !allowed.has(p)))].sort();
    return outside.length ? { kind: "outside", outside } : { kind: "ok" };
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
