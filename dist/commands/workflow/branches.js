// bkit branches sync|push|rebase|switch|land|anchor-stamp|anchor-read — the
// branch mechanics every phase workflow repeated inline: bring a feature branch
// up to date with dev, push it the one safe way for its kind, auto-resolve the
// rebase conflicts that lose nothing, return the main checkout to dev after a
// merge, land a design / plan close on dev, and stamp / read the base commit a
// design or plan doc was written against.
//
// Every verb works on `origin` and the integration branch `dev`, as the
// workflows do. A push is always EXACTLY ONE `git push`: `dev` / `main` get a
// plain push, every other branch `--force-with-lease`, so a shared branch is
// never force-pushed and a personal one survives the rebase that rewrote it.
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { gitEnv } from "../../ledgers/telemetry.js";
import { bodySkipToken, CommandError, EXIT, git, parseJson, repoRoot, runGit, SKIP_CI_TOKEN, } from "../lib.js";
import { bkitVersionStatus } from "../../shared/bkit-latest.js";
import { TIMEOUTS } from "../../shared/timeouts.js";
import { commitBookkeeping } from "./ledgers.js";
import { acquireDevLock, lockRoot, releaseLock, resolveMonth, workflowLockPath } from "./locks.js";
import { closeTransportRow, crossCheckFile, mergePr, openPrFor, probePr } from "./prs.js";
import { appendFeature } from "./roadmap.js";
import { detect } from "./runtime.js";
import { readStatusRows } from "./status.js";
import { removeWorktree } from "./worktrees.js";
import { COULD_NOT_RUN_EXIT_CODES, LOCKFILE_REGENERATE, installCommand, } from "../../shared/package-manager.js";
import { str } from "./status.js";
const REMOTE = "origin";
const DEV = "dev";
const UPSTREAM = `${REMOTE}/${DEV}`;
const SHARED_BRANCHES = new Set([DEV, "main"]);
/** Exit codes, distinct across verbs so a code means one thing anywhere in this noun. */
export const EXIT_REFUSED = 3;
export const EXIT_NO_REBASE = 4;
export const EXIT_DETACHED = 5;
export const EXIT_SKIP_CI = 6;
export const EXIT_OPEN_PR = 7;
export const EXIT_PUSH_FAILED = 8;
export const EXIT_NOT_DEV = 9;
export const EXIT_FETCH_FAILED = 10;
export const EXIT_MERGE_CONFLICT = 11;
export const EXIT_ANCHOR_SKIP = 12;
export const EXIT_NO_FILE = 13;
export const EXIT_PULL_FAILED = 14;
export const EXIT_RUNTIME_REFUSED = 15;
export const EXIT_INSTALL_FAILED = 16;
export const EXIT_LAND_STOPPED = 17;
export const EXIT_LANDED_UNVERIFIED = 18;
export const EXIT_LOCK_LEFT = 19;
// ---------------------------------------------------------------------------
// Process helpers
// ---------------------------------------------------------------------------
/** git with a non-interactive editor, so `--continue` / `--skip` / merge commits never open one. */
const quietGit = (cwd, args) => {
    const res = spawnSync("git", args, {
        cwd,
        encoding: "utf-8",
        env: { ...gitEnv(), GIT_EDITOR: "true" },
    });
    return {
        ok: res.status === 0,
        stdout: (res.stdout ?? "").trim(),
        stderr: (res.stderr ?? "").trim(),
    };
};
/** `git show :<stage>:<path>` as raw bytes; empty when that stage does not exist. */
function stageBytes(top, stage, file) {
    const res = spawnSync("git", ["show", `:${stage}:${file}`], { cwd: top, env: gitEnv() });
    // A missing stage is a legitimate shape (add/add, delete/modify): merge against empty.
    return res.status === 0 ? res.stdout : Buffer.alloc(0);
}
/** Paths still unmerged, NUL-separated so unusual names arrive unquoted. */
function unmergedPaths(top) {
    return (git(top, ["diff", "--name-only", "--diff-filter=U", "-z"]) ?? "")
        .split("\0")
        .filter(Boolean);
}
function rebaseInProgress(top) {
    return ["rebase-merge", "rebase-apply"].some((d) => {
        const p = git(top, ["rev-parse", "--git-path", d]);
        return p !== null && fs.existsSync(path.resolve(top, p));
    });
}
const currentBranch = (cwd) => git(cwd, ["branch", "--show-current"]) ?? "";
const boolString = (v, flag) => {
    if (v === "true")
        return true;
    if (v === "false")
        return false;
    throw new CommandError(EXIT.USAGE, `--${flag} must be true or false, got "${String(v)}"`);
};
// ---------------------------------------------------------------------------
// Conflict classification and resolution (rebase, and sync's docs merge)
// ---------------------------------------------------------------------------
/**
 * Ledgers a conflict may be resolved in by union. Each is append-only and its
 * reader folds last-wins by `ts` over an identity tuple, so union loses nothing:
 * interleaved or duplicated rows are resolved by the reader. Same result as
 * `merge=union` in `.gitattributes`, for a repo whose `.gitattributes` lacks a
 * ledger or is missing.
 *
 * `.bkit/friction.jsonl` ships WITHOUT `merge=union` but is listed here; a row union
 * resurrects after `bkit harvest` drained it is re-banked by the next harvest.
 *
 * `docs/roadmap.md` is not append-only — it is regenerated from
 * `.bkit/issues.jsonl` — but every workflow close re-folds it, so both sides of
 * almost any rebase changed it. The duplicated sections a union leaves are erased
 * by the next fold, which rewrites the marker blocks wholesale.
 */
export const LEDGERS = [
    "docs/knowledge.jsonl",
    "docs/decisions.jsonl",
    "docs/deferrals.jsonl",
    "docs/failures.jsonl",
    ".bkit/issues.jsonl",
    "docs/roadmap.md",
    ".bkit/stats.jsonl",
    ".bkit/friction.jsonl",
    "docs/plans/**/status.jsonl",
];
/** `.gitattributes` glob semantics: `**` crosses `/`, `*` stays inside one segment. */
const globToRegExp = (glob) => new RegExp(`^${glob
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*\*/g, "\0")
    .replace(/\*/g, "[^/]*")
    .replace(/\0/g, ".*")}$`);
const LEDGER_PATTERNS = LEDGERS.map(globToRegExp);
/** How a conflicted path may be resolved. Only repo-root lockfiles count: the regenerate runs there. */
export function classifyConflict(file) {
    if (Object.hasOwn(LOCKFILE_REGENERATE, file))
        return "lockfile";
    if (LEDGER_PATTERNS.some((re) => re.test(file)))
        return "ledger";
    return "refuse";
}
/** First-occurrence-wins line de-dup; a non-empty result always ends with a newline. */
function dedupeLines(text) {
    if (text === "")
        return "";
    const lines = text.split("\n");
    if (text.endsWith("\n"))
        lines.pop();
    const seen = new Set();
    const kept = lines.filter((l) => !seen.has(l) && Boolean(seen.add(l)));
    return `${kept.join("\n")}\n`;
}
/**
 * Union-resolve one conflicted ledger in place: rebuild the three stages from the
 * index and run `git merge-file --union`, the driver `merge=union` runs, so the
 * result is byte-identical to the attribute's. JSONL output is checked line by
 * line (a side whose last row lacked a newline can splice two rows into one) and
 * exact duplicates are dropped; prose (`docs/roadmap.md`) is never de-duped.
 */
export function unionResolve(top, file) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-union-"));
    try {
        const sides = { base: 1, ours: 2, theirs: 3 };
        for (const [name, stage] of Object.entries(sides)) {
            fs.writeFileSync(path.join(tmp, name), stageBytes(top, stage, file));
        }
        const merged = spawnSync("git", [
            "merge-file",
            "--union",
            "-p",
            path.join(tmp, "ours"),
            path.join(tmp, "base"),
            path.join(tmp, "theirs"),
        ], { cwd: top, env: gitEnv() });
        // --union never leaves conflict markers, so a non-zero exit is an I/O failure.
        if (merged.status !== 0)
            return { ok: false, problem: "git merge-file --union failed" };
        let text = merged.stdout.toString("utf-8");
        if (file.endsWith(".jsonl")) {
            if (!text.split("\n").every((l) => l.trim() === "" || parseJson(l).ok)) {
                return { ok: false, problem: "union produced a line that is not valid JSON (torn row?)" };
            }
            text = dedupeLines(text);
        }
        // The next append must start on its own line.
        if (text !== "" && !text.endsWith("\n"))
            text += "\n";
        fs.writeFileSync(path.join(top, file), text);
        return { ok: true };
    }
    finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
}
/**
 * Resolve a lockfile conflict: start from the rebase target's copy, then
 * regenerate from the manifest, which merged normally (or refused and stopped
 * the rebase before this). During a rebase `--ours` is the branch being rebased
 * ONTO; `--theirs` is the commit being replayed.
 */
function lockfileResolve(top, file) {
    const regenerate = LOCKFILE_REGENERATE[file];
    if (!regenerate)
        return false;
    if (!runGit(top, ["checkout", "--ours", "--", file]).ok)
        return false;
    const res = spawnSync(regenerate[0], regenerate.slice(1), { cwd: top, stdio: "ignore" });
    return res.status === 0;
}
/**
 * Drive an in-progress rebase to completion, auto-resolving each stop. Loops
 * because `--continue` replays the next commit, which can conflict in turn; the
 * bound is a runaway guard. Never aborts: on refusal the rebase is left in
 * progress and `branches rebase` aborts it.
 */
export function resolveRebase(top, onLog = () => undefined) {
    const result = {
        ok: false,
        resolved: [],
        skippedCommits: 0,
        rounds: 0,
        refused: null,
        reason: null,
        log: [],
    };
    const log = (line) => {
        result.log.push(line);
        onLog(line);
    };
    const refuse = (line, refused, reason) => {
        log(line);
        result.refused = refused;
        result.reason = reason;
        return result;
    };
    while (result.rounds < 100) {
        result.rounds++;
        const conflicts = unmergedPaths(top);
        if (conflicts.length > 0) {
            // Classify the whole set before resolving any of it, so a refused path
            // never leaves half the set rewritten.
            const refused = conflicts.find((f) => classifyConflict(f) === "refuse");
            if (refused !== undefined) {
                return refuse(`REFUSE ${refused} — not an append-only ledger or a recognised lockfile; routing to Failure Path`, refused, "not an append-only ledger or a recognised lockfile");
            }
            for (const f of conflicts) {
                const kind = classifyConflict(f);
                const ok = kind === "ledger" ? unionResolve(top, f).ok : lockfileResolve(top, f);
                if (!ok || !runGit(top, ["add", "--", f]).ok) {
                    return refuse(`REFUSE ${f} — resolution failed`, f, "resolution failed");
                }
                result.resolved.push({ path: f, how: kind === "ledger" ? "union" : "lockfile" });
                log(kind === "ledger"
                    ? `RESOLVED ${f} — union (append-only ledger)`
                    : `RESOLVED ${f} — took rebase target + regenerated`);
            }
        }
        // A resolution can empty the commit (both sides appended the same rows);
        // `--continue` refuses an empty commit, so skip it instead.
        if (runGit(top, ["diff", "--cached", "--quiet"]).ok && unmergedPaths(top).length === 0) {
            const skip = quietGit(top, ["rebase", "--skip"]);
            if (skip.ok || unmergedPaths(top).length > 0) {
                result.skippedCommits++;
                log("SKIPPED an empty commit (its changes were already on the target)");
                // The skip moved on and the next commit conflicted: resolve it next round.
                if (!skip.ok)
                    continue;
            }
            else {
                return refuse("REFUSE — git rebase --skip failed", null, "git rebase --skip failed");
            }
        }
        else if (!quietGit(top, ["rebase", "--continue"]).ok) {
            // The next commit conflicted (next round handles it), or the rebase is stuck.
            if (unmergedPaths(top).length === 0) {
                return refuse("REFUSE — git rebase --continue failed with no unmerged paths", null, "git rebase --continue failed with no unmerged paths");
            }
            continue;
        }
        if (!rebaseInProgress(top)) {
            log(`COMPLETE — rebase finished after ${result.rounds} auto-resolved round(s)`);
            result.ok = true;
            return result;
        }
    }
    return refuse("REFUSE — exceeded 100 auto-resolve rounds; treating as stuck", null, "exceeded 100 auto-resolve rounds");
}
// ---------------------------------------------------------------------------
// Anchor block
// ---------------------------------------------------------------------------
const ANCHOR_OPEN = "<!-- bkit:anchor";
const ANCHOR_CLOSE = "-->";
/** Ends the visible line a stamp writes under the block when the doc came from an outdated bkit. */
const OUTDATED_MARK = "<!-- bkit:outdated -->";
const OUTDATED_LINE = new RegExp(`^.*${OUTDATED_MARK}\n(?:\n)?`, "gm");
export const ANCHOR_FIELDS = [
    "baseSha",
    "baseRef",
    "designPath",
    "designBaseSha",
    "bkitVersion",
    "bkitLatest",
];
/** Lines of `text` with whether each sits inside an anchor block (a `sed '/open/,/close/'` range). */
function anchorLines(text) {
    const lines = text.split("\n");
    const trailing = text.endsWith("\n");
    if (trailing)
        lines.pop();
    let open = false;
    return lines.map((line, i) => {
        // Like sed: the close line is looked for from the line AFTER the open line,
        // and a block never closed runs to the end of the file.
        let inBlock = open;
        if (!open && line === ANCHOR_OPEN) {
            open = true;
            inBlock = true;
        }
        else if (open && line === ANCHOR_CLOSE) {
            open = false;
        }
        return { line, inBlock, last: i === lines.length - 1 && !trailing };
    });
}
/** Every field in the file's anchor block(s); first occurrence wins, absent fields are omitted. */
export function readAnchor(text) {
    const out = {};
    for (const { line, inBlock } of anchorLines(text)) {
        if (!inBlock)
            continue;
        for (const field of ANCHOR_FIELDS) {
            if (out[field] === undefined && line.startsWith(`${field}: `))
                out[field] = line.slice(field.length + 2);
        }
    }
    return out;
}
/**
 * The bkit release a doc is being generated from, for its anchor: undefined when
 * this repo has no `.bkit/version` pin (nothing to record). Asks the registry for
 * the newest release at most once a day; offline leaves `latest` null.
 */
export function anchorBkitStatus(cwd) {
    const status = bkitVersionStatus(git(cwd, ["rev-parse", "--show-toplevel"]) ?? cwd, git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]));
    return status.version === null ? undefined : status;
}
/**
 * `text` with a fresh anchor block on top and every prior one removed, so re-stamping
 * is idempotent. With `bkit`, the block records the release the doc came from and the
 * newest one (empty when unknown); an outdated release adds one visible warning line
 * under the block, replaced or dropped by the next stamp like the block itself.
 */
export function stampAnchor(text, baseSha, design, baseRef = UPSTREAM, bkit) {
    const header = [ANCHOR_OPEN, `baseSha: ${baseSha}`, `baseRef: ${baseRef}`];
    if (design)
        header.push(`designPath: ${design.path}`, `designBaseSha: ${design.baseSha}`);
    if (bkit)
        header.push(`bkitVersion: ${bkit.version ?? ""}`, `bkitLatest: ${bkit.latest ?? ""}`);
    header.push(ANCHOR_CLOSE);
    let body = anchorLines(text)
        .filter((l) => !l.inBlock)
        .map((l) => (l.last ? l.line : `${l.line}\n`))
        .join("")
        .replace(OUTDATED_LINE, "");
    if (bkit?.outdated === true) {
        // Blank lines on both sides of the warning, as prettier writes them.
        header.push("", `> **Outdated bkit:** generated with bkit ${bkit.version} while ${bkit.latest} was out, so its workflow and template text may be stale. Upgrade with \`pnpm bkit upgrade --latest\` and regenerate if that matters. ${OUTDATED_MARK}`);
        body = `\n${body.replace(/^\n+/, "")}`;
    }
    return `${header.join("\n")}\n${body}`;
}
// ---------------------------------------------------------------------------
// Open-PR probe (push --mode=abort)
// ---------------------------------------------------------------------------
/** The open PR number on `branch`, or null. gh missing or failing → use MCP, never a guess. */
function openPrNumber(cwd, branch) {
    const res = spawnSync("gh", ["pr", "list", "--head", branch, "--state", "open", "--json", "number,state"], {
        cwd,
        encoding: "utf-8",
    });
    const parsed = res.status === 0 ? parseJson(res.stdout ?? "") : { ok: false };
    const prs = parsed.ok ? parsed.value : undefined;
    if (!Array.isArray(prs)) {
        const why = res.error
            ? "gh is not available"
            : `gh pr list failed: ${(res.stderr ?? "").trim()}`;
        throw new CommandError(EXIT.USE_MCP, `${why} — look up the open PR on ${branch} via MCP and re-run with --open-pr=<number>|none`);
    }
    const open = prs.find((p) => typeof p === "object" && p !== null && p.state === "OPEN");
    return typeof open?.number === "number" ? open.number : null;
}
// ---------------------------------------------------------------------------
// Verbs
// ---------------------------------------------------------------------------
function topLevel(cwd) {
    const top = git(cwd, ["rev-parse", "--show-toplevel"]);
    if (!top)
        throw new CommandError(EXIT.USAGE, `not inside a git work tree: ${cwd}`);
    return top;
}
function appendLog(ctx, file, lines) {
    if (file === undefined || lines.length === 0)
        return;
    const abs = path.resolve(ctx.cwd, file);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.appendFileSync(abs, lines.map((l) => `[bkit-rebase] ${l}\n`).join(""));
}
function rebaseVerb(ctx) {
    const top = topLevel(ctx.cwd);
    const sentinel = str(ctx.flags.sentinel);
    const sentinelPath = sentinel === undefined ? undefined : path.resolve(ctx.cwd, sentinel);
    if (sentinelPath)
        fs.rmSync(sentinelPath, { force: true });
    if (!rebaseInProgress(top)) {
        ctx.log("no rebase in progress");
        return EXIT_NO_REBASE;
    }
    const result = resolveRebase(top, (line) => ctx.log(line));
    let aborted = false;
    if (!result.ok) {
        // Abort before the log and sentinel writes: the abort resets tracked files.
        const abort = runGit(top, ["rebase", "--abort"]);
        aborted = abort.ok;
        const line = abort.ok
            ? "ABORTED — git rebase --abort restored the branch"
            : `ABORT FAILED — git rebase --abort: ${abort.stderr}`;
        result.log.push(line);
        ctx.log(line);
    }
    appendLog(ctx, str(ctx.flags.logFile), result.log);
    if (!result.ok && sentinelPath) {
        fs.mkdirSync(path.dirname(sentinelPath), { recursive: true });
        fs.writeFileSync(sentinelPath, "");
    }
    ctx.emit({
        outcome: result.ok ? "resolved" : "refused",
        resolved: result.resolved,
        skippedCommits: result.skippedCommits,
        rounds: result.rounds,
        refused: result.refused,
        reason: result.reason,
        aborted,
        sentinel: !result.ok && sentinel !== undefined ? sentinel : null,
    });
    return result.ok ? EXIT.OK : EXIT_REFUSED;
}
/**
 * Push the current branch with exactly one `git push`: plain for dev / main,
 * `--force-with-lease` otherwise. `abort` never pushes into an open PR (`openPr`:
 * the answer MCP gave; undefined asks gh, which throws EXIT.USE_MCP when it cannot).
 */
export function pushBranch(cwd, o, log) {
    const { mode, openPr: openPrFlag } = o;
    if (openPrFlag !== undefined && openPrFlag !== "none" && !/^[1-9][0-9]*$/.test(openPrFlag)) {
        throw new CommandError(EXIT.USAGE, `--open-pr must be a PR number or none, got "${openPrFlag}"`);
    }
    const branch = currentBranch(cwd);
    const notPushed = (code, extra = {}) => ({
        code,
        out: {
            pushed: false,
            ref: null,
            sha: null,
            forced: false,
            skipped: null,
            prNumber: null,
            ...extra,
        },
    });
    if (branch === "") {
        log("no branch checked out (detached HEAD) — refusing to push");
        return notPushed(EXIT_DETACHED);
    }
    if (mode === "dev" && branch !== DEV) {
        log(`--mode=dev pushes ${DEV}, but the checkout is on ${branch}`);
        return notPushed(EXIT_NOT_DEV);
    }
    if (o.requireCi === true) {
        const message = git(cwd, ["log", "-1", "--pretty=%B"]) ?? "";
        if (SKIP_CI_TOKEN.test(message)) {
            log(`HEAD message on ${branch} carries a CI-suppressing token, and this push needs a CI run — refusing`);
            return notPushed(EXIT_SKIP_CI, { skipped: "skip-ci" });
        }
    }
    const shared = SHARED_BRANCHES.has(branch);
    if (mode === "abort" && !shared) {
        const pr = openPrFlag === undefined
            ? openPrNumber(cwd, branch)
            : openPrFlag === "none"
                ? null
                : Number(openPrFlag);
        if (pr !== null) {
            // CI and the cloud router would run on an abort commit pushed into an open
            // PR; the last validated remote HEAD is kept instead.
            log(`open PR #${pr} on ${branch} — preserving the last validated remote HEAD (no push)`);
            return notPushed(EXIT_OPEN_PR, { skipped: "open-pr", prNumber: pr });
        }
    }
    const args = [
        "push",
        ...(o.setUpstream === true ? ["-u"] : []),
        ...(shared ? [] : ["--force-with-lease"]),
        REMOTE,
        branch,
    ];
    const res = runGit(cwd, args);
    if (!res.ok) {
        log(`git ${args.join(" ")} failed: ${res.stderr}`);
        return notPushed(EXIT_PUSH_FAILED);
    }
    log(`pushed ${branch}${shared ? "" : " (--force-with-lease)"}`);
    return {
        code: EXIT.OK,
        out: {
            pushed: true,
            ref: branch,
            sha: git(cwd, ["rev-parse", "HEAD"]),
            forced: !shared,
            skipped: null,
            prNumber: null,
        },
    };
}
function pushVerb(ctx) {
    const mode = String(ctx.flags.mode);
    if (!["feature", "abort", "dev"].includes(mode)) {
        throw new CommandError(EXIT.USAGE, "--mode must be feature, abort, or dev");
    }
    const r = pushBranch(ctx.cwd, {
        mode: mode,
        setUpstream: ctx.flags.setUpstream === true,
        requireCi: ctx.flags.requireCi === true,
        openPr: str(ctx.flags.openPr),
    }, ctx.log);
    // A detached HEAD and a wrong checkout print nothing, as the push never got to run.
    if (r.code !== EXIT_DETACHED && r.code !== EXIT_NOT_DEV)
        ctx.emit(r.out);
    return r.code;
}
/** Resolve sync's docs-merge conflicts: ledgers by union, other `docs/` paths take dev's side. */
function resolveDocsMerge(top) {
    const conflicts = unmergedPaths(top);
    const refused = conflicts.find((f) => classifyConflict(f) !== "ledger" && !f.startsWith("docs/"));
    if (refused !== undefined)
        return { refused };
    const resolved = [];
    for (const f of conflicts) {
        if (classifyConflict(f) === "ledger") {
            if (!unionResolve(top, f).ok || !runGit(top, ["add", "--", f]).ok)
                return { refused: f };
            resolved.push({ path: f, how: "union" });
            continue;
        }
        // In a merge `--theirs` is the branch merged in: dev. Dev deleting the file
        // leaves no stage 3, and taking dev's side means deleting it here too.
        const devHasIt = runGit(top, ["cat-file", "-e", `:3:${f}`]).ok;
        const ok = devHasIt
            ? runGit(top, ["checkout", "--theirs", "--", f]).ok && runGit(top, ["add", "--", f]).ok
            : runGit(top, ["rm", "-q", "--", f]).ok;
        if (!ok)
            return { refused: f };
        resolved.push({ path: f, how: "dev" });
    }
    return { resolved };
}
function syncVerb(ctx) {
    const mergeDocs = ctx.flags.mergeDocs === true;
    const headFlag = str(ctx.flags.head);
    if (mergeDocs && headFlag !== undefined) {
        throw new CommandError(EXIT.USAGE, "--merge-docs merges into HEAD; give --head or --merge-docs, not both");
    }
    const top = topLevel(ctx.cwd);
    const fetch = runGit(top, ["fetch", REMOTE, DEV]);
    if (!fetch.ok) {
        ctx.log(`git fetch ${REMOTE} ${DEV} failed: ${fetch.stderr}`);
        return EXIT_FETCH_FAILED;
    }
    const head = git(top, ["rev-parse", "--verify", "--quiet", `${headFlag ?? "HEAD"}^{commit}`]);
    if (!head)
        throw new CommandError(EXIT.USAGE, `--head ${headFlag ?? "HEAD"} does not name a commit`);
    const branch = currentBranch(top);
    const ancestor = spawnSync("git", ["merge-base", "--is-ancestor", UPSTREAM, head], {
        cwd: top,
        env: gitEnv(),
    });
    if (ancestor.status !== 0 && ancestor.status !== 1) {
        throw new CommandError(EXIT.USAGE, `cannot compare ${UPSTREAM} with ${head}: ${String(ancestor.stderr).trim()}`);
    }
    const count = (args) => Number(git(top, ["rev-list", "--count", ...args]) ?? "0");
    const behind = count([`${head}..${UPSTREAM}`]);
    const docsBehind = count([`${head}..${UPSTREAM}`, "--", "docs/"]);
    const out = {
        branch: branch === "" ? null : branch,
        head,
        basePath: ancestor.status === 0 ? "A" : "B",
        behind,
        docsBehind,
        merged: false,
        resolved: [],
    };
    if (mergeDocs) {
        if (branch === "") {
            ctx.log("no branch checked out (detached HEAD) — cannot merge dev's docs");
            return EXIT_DETACHED;
        }
        if (!SHARED_BRANCHES.has(branch) && docsBehind > 0) {
            ctx.log(`docs/ is ${docsBehind} commit(s) behind ${UPSTREAM} — merging it in`);
            if (!quietGit(top, ["merge", "--no-edit", UPSTREAM]).ok) {
                const outcome = resolveDocsMerge(top);
                if ("refused" in outcome) {
                    runGit(top, ["merge", "--abort"]);
                    ctx.log(`merge of ${UPSTREAM} conflicts on ${outcome.refused} — outside docs/, merge aborted`);
                    return EXIT_MERGE_CONFLICT;
                }
                if (unmergedPaths(top).length > 0 || !quietGit(top, ["commit", "--no-edit"]).ok) {
                    runGit(top, ["merge", "--abort"]);
                    ctx.log(`merge of ${UPSTREAM} could not be committed — merge aborted`);
                    return EXIT_MERGE_CONFLICT;
                }
                out.resolved = outcome.resolved;
                for (const r of outcome.resolved)
                    ctx.log(`RESOLVED ${r.path} — ${r.how === "union" ? "union (append-only ledger)" : `took ${DEV}`}`);
            }
            out.merged = true;
            out.head = git(top, ["rev-parse", "HEAD"]) ?? head;
        }
    }
    ctx.emit(out);
    return EXIT.OK;
}
async function switchVerb(ctx) {
    const devPushes = boolString(ctx.flags.devPushes, "dev-pushes");
    const worktrees = boolString(ctx.flags.worktrees, "worktrees");
    const root = repoRoot(ctx.cwd);
    // `bkit install` can leave core.bare=true on the main checkout, which breaks every checkout below.
    if (git(root, ["config", "--get", "core.bare"]) === "true" &&
        fs.statSync(path.join(root, ".git"), { throwIfNoEntry: false })?.isDirectory()) {
        runGit(root, ["config", "core.bare", "false"]);
    }
    const out = {
        switched: false,
        branch: currentBranch(root),
        ahead: 0,
        pushed: false,
        installed: null,
        skipped: null,
    };
    if (!devPushes) {
        ctx.log(`this runtime does not push ${DEV} — skipping the local ${DEV} checkout; the merge already landed server-side`);
        ctx.emit({ ...out, skipped: "dev-pushes-false" });
        return EXIT.OK;
    }
    if (!worktrees) {
        ctx.log("refusing a local dev checkout in a runtime without worktrees (devPushes=true, worktrees=false)");
        return EXIT_RUNTIME_REFUSED;
    }
    const fid = String(ctx.flags.fid);
    // Still held at the deadline: acquireDevLock throws EXIT.NO naming the holder.
    const lock = await acquireDevLock({
        cwd: root,
        workflow: "ship",
        fid,
        deadlineS: TIMEOUTS.SHIP_DEV_LOCK_ACQUIRE_DEADLINE_S,
        log: ctx.log,
    });
    try {
        runGit(root, ["checkout", DEV]);
        out.branch = currentBranch(root);
        if (out.branch !== DEV) {
            ctx.log(`not on ${DEV} after checkout (on '${out.branch}') — aborting dev ops`);
            return EXIT_NOT_DEV;
        }
        out.switched = true;
        const fetch = runGit(root, ["fetch", REMOTE, DEV]);
        if (!fetch.ok) {
            ctx.log(`git fetch ${REMOTE} ${DEV} failed: ${fetch.stderr}`);
            return EXIT_FETCH_FAILED;
        }
        out.ahead = Number(git(root, ["rev-list", "--count", `${UPSTREAM}..${DEV}`]) ?? "0");
        if (out.ahead > 0) {
            const triggering = (git(root, ["log", "--format=%h %s", `${UPSTREAM}..${DEV}`]) ?? "")
                .split("\n")
                .filter((l) => l !== "" && !SKIP_CI_TOKEN.test(l));
            if (triggering.length > 0) {
                ctx.log(`local ${DEV} is ${out.ahead} commit(s) ahead of ${UPSTREAM}, ${triggering.length} of them would run CI:`);
                for (const l of triggering)
                    ctx.log(`  ${l}`);
                ctx.log(`ship will not push these: a CI run on ${DEV} can cancel the in-flight run validating this merge`);
                ctx.log(`reconcile, then re-run ship: git -C "${root}" pull --rebase ${REMOTE} ${DEV} && git -C "${root}" push ${REMOTE} ${DEV}`);
                return EXIT.NEEDS_HUMAN;
            }
            const pull = quietGit(root, ["pull", "--rebase", REMOTE, DEV]);
            if (!pull.ok) {
                ctx.log(`git pull --rebase ${REMOTE} ${DEV} failed: ${pull.stderr}`);
                return EXIT_PULL_FAILED;
            }
            const push = runGit(root, ["push", REMOTE, DEV]);
            if (!push.ok) {
                ctx.log(`git push ${REMOTE} ${DEV} failed: ${push.stderr}`);
                return EXIT_PUSH_FAILED;
            }
            out.pushed = true;
        }
        else {
            const pull = runGit(root, ["pull", "--ff-only", REMOTE, DEV]);
            if (!pull.ok) {
                ctx.log(`git pull --ff-only ${REMOTE} ${DEV} failed: ${pull.stderr}`);
                return EXIT_PULL_FAILED;
            }
        }
        out.installed = install(ctx, root);
        ctx.emit(out);
        return out.installed === false ? EXIT_INSTALL_FAILED : EXIT.OK;
    }
    finally {
        releaseLock(lock.path, { workflow: "ship", fid, token: lock.token });
    }
}
/** Frozen install in the main checkout: false (logged) when it failed or could not run, null when there is nothing to install. */
function install(ctx, root) {
    if (!fs.existsSync(path.join(root, "package.json")))
        return null;
    const argv = installCommand({ frozen: true });
    const res = spawnSync(argv[0], argv.slice(1), { cwd: root, stdio: "ignore" });
    if (res.status === 0)
        return true;
    const couldNotRun = res.error !== undefined || COULD_NOT_RUN_EXIT_CODES.has(res.status ?? -1);
    ctx.log(couldNotRun
        ? `${argv.join(" ")} could not run — dependencies not installed`
        : `${argv.join(" ")} exited ${String(res.status)} — dependency install failed`);
    return false;
}
// ---------------------------------------------------------------------------
// land (design / plan close)
// ---------------------------------------------------------------------------
/** What a design / plan close may bring to dev: docs and ledgers, nothing else. */
const CLOSE_DOCS = /^docs\/plans\/|^docs\/roadmap\.md$|^docs\/[^/]+\.jsonl$|^\.bkit\/[^/]+\.jsonl$/;
/** The canonical docs `ref` carries for the feature: design, or plan plus sub-plans. */
function canonicalDocs(root, ref, workflow, month, fid) {
    const re = workflow === "plan"
        ? new RegExp(`^docs/plans/${month}/${fid}-plan(-[0-9]+)?\\.md$`)
        : new RegExp(`^docs/plans/${month}/${fid}-design\\.md$`);
    return (git(root, ["ls-tree", "-r", "--name-only", ref, "--", `docs/plans/${month}/`]) ?? "")
        .split("\n")
        .filter((f) => re.test(f));
}
/** Whether this runtime pushes dev: the run's runtime-resolved row, else a fresh detect. */
function devPushesOf(root, status, log) {
    const row = fs.existsSync(status)
        ? readStatusRows(status)
            .filter((r) => r.type === "runtime-resolved")
            .at(-1)
        : undefined;
    if (typeof row?.runtimeDevPushes === "boolean")
        return row.runtimeDevPushes;
    return detect(root, root, log).runtimeDevPushes;
}
class Stop extends CommandError {
}
/**
 * The local close: under the dev lock, squash `feat/{fid}` into dev in the main
 * checkout, check the staged canonical docs are the branch's, commit the
 * bookkeeping plus what the squash brought, push dev, remove the worktree.
 */
async function landLocal(ctx, root, o) {
    const feat = `feat/${o.fid}`;
    const lock = await acquireDevLock({
        cwd: root,
        workflow: o.workflow,
        fid: o.fid,
        deadlineS: TIMEOUTS.SHIP_DEV_LOCK_ACQUIRE_DEADLINE_S,
        log: ctx.log,
    });
    try {
        runGit(root, ["checkout", DEV]);
        const on = currentBranch(root);
        if (on !== DEV)
            throw new Stop(EXIT_NOT_DEV, `not on dev after checkout (on '${on}') — aborting dev ops`);
        const stray = (git(root, ["status", "--porcelain", "-uall", "--", `docs/plans/${o.month}/logs/${o.fid}/`]) ??
            "")
            .split("\n")
            .filter((l) => l.startsWith("??"));
        if (stray.length) {
            throw new Stop(EXIT_LAND_STOPPED, `${o.fid} artifacts written to the main checkout instead of the worktree:\n${stray.join("\n")}\nMove them under .worktrees/${o.fid}/ or delete them, then re-run.`);
        }
        if (!runGit(root, ["pull", "--ff-only", REMOTE, DEV]).ok)
            throw new Stop(EXIT_PULL_FAILED, "dev fast-forward failed");
        const squash = runGit(root, ["merge", "--squash", "-X", "ours", feat]);
        if (!squash.ok) {
            throw new Stop(EXIT_LAND_STOPPED, `squash of ${feat} into dev failed — nothing committed or pushed; ${feat} and its worktree kept. Clear what git names from the main checkout, then re-run: ${squash.stderr}`);
        }
        const staged = (git(root, ["diff", "--cached", "--name-only"]) ?? "")
            .split("\n")
            .filter((p) => p !== "" && !CLOSE_DOCS.test(p));
        if (staged.length)
            throw new Stop(EXIT_LAND_STOPPED, `${o.workflow} close staged non-doc files:\n${staged.join("\n")}`);
        const docs = canonicalDocs(root, feat, o.workflow, o.month, o.fid);
        const main = `docs/plans/${o.month}/${o.fid}-${o.workflow}.md`;
        if (!docs.includes(main))
            throw new Stop(EXIT_LAND_STOPPED, `${feat} carries no ${main} — nothing committed or pushed; ${feat} kept`);
        const unlanded = docs.filter((d) => git(root, ["rev-parse", "-q", "--verify", `:${d}`]) !==
            git(root, ["rev-parse", `${feat}:${d}`]));
        if (unlanded.length) {
            throw new Stop(EXIT_LAND_STOPPED, `squash did not stage the ${feat} copy of:\n${unlanded.join("\n")}\nnothing committed or pushed; ${feat} kept; the main checkout index still holds the squash`);
        }
        appendFeature(root, { workflow: o.workflow, fid: o.fid }, ctx.log);
        commitBookkeeping({
            root,
            month: o.month,
            fid: o.fid,
            scope: "core",
            mode: "commit-allow-empty",
            squashOf: feat,
            message: `docs(${o.fid}): ${o.workflow} DONE bkit [skip ci]`,
        }, ctx.log);
        if (!runGit(root, ["push", REMOTE, DEV]).ok)
            throw new Stop(EXIT_PUSH_FAILED, "dev push failed");
        const sha = git(root, ["rev-parse", "HEAD"]) ?? "";
        let worktree = null;
        try {
            worktree = { ...removeWorktree(root, o.fid, feat, ctx.log) };
        }
        catch (err) {
            // The close landed; a leftover worktree is a human's to remove.
            ctx.log(`worktree removal failed — remove .worktrees/${o.fid} by hand: ${err.message}`);
        }
        return { shape: "local", transport: "git", sha, canonicalRef: DEV, prNumber: null, worktree };
    }
    finally {
        releaseLock(lock.path, { workflow: o.workflow, fid: o.fid, token: lock.token });
    }
}
/**
 * The PR close (a runtime that cannot push dev): commit the roadmap row on the
 * branch, push it, open or reuse the PR, squash-merge it with an empty body. gh
 * missing → EXIT.USE_MCP with what to create / merge; re-run with `--pr` (and
 * `--merged-sha` once merged).
 */
function landPr(ctx, o) {
    const tree = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
    let prNumber = o.pr;
    if (prNumber === undefined) {
        runGit(tree, ["fetch", REMOTE, DEV, o.branch]);
        appendFeature(tree, { workflow: o.workflow, fid: o.fid }, ctx.log);
        commitBookkeeping({
            root: tree,
            month: o.month,
            fid: o.fid,
            scope: "core",
            mode: "commit-allow-empty",
            message: `docs(${o.fid}): ${o.workflow} roadmap update bkit [skip ci]`,
        }, ctx.log);
        const stray = (git(tree, ["diff", "--name-only", `${UPSTREAM}...${o.branch}`]) ?? "")
            .split("\n")
            .filter((p) => p !== "" && !CLOSE_DOCS.test(p));
        if (stray.length)
            throw new Stop(EXIT_LAND_STOPPED, `${o.workflow} close diff carries non-doc files:\n${stray.join("\n")}`);
        const pushed = pushBranch(tree, { mode: "feature" }, ctx.log);
        if (pushed.code !== EXIT.OK)
            throw new Stop(EXIT_PUSH_FAILED, "close-commit push failed — the PR would not carry the roadmap row or the close status rows");
        const opened = openPrFor(tree, {
            fid: o.fid,
            title: `docs(${o.fid}): ${o.workflow} DONE`,
            issue: o.issue,
            head: o.branch,
            existing: "reuse",
        }, ctx.log);
        if (opened.code === EXIT.USE_MCP) {
            ctx.emit({ stage: "open", ...opened.out });
            return EXIT.USE_MCP;
        }
        if (opened.code !== EXIT.OK || !opened.out?.number)
            throw new Stop(EXIT_LAND_STOPPED, `could not open or reuse a PR for ${o.branch} to dev`);
        prNumber = String(opened.out.number);
    }
    const subject = `docs(${o.fid}): ${o.workflow} DONE bkit [skip ci]`;
    let sha = o.mergedSha ?? "";
    let transport = o.mergedSha === undefined ? "gh" : "mcp";
    if (o.mergedSha === undefined) {
        const merged = mergePr(tree, { number: prNumber, subject }, ctx.log);
        if (merged.code === EXIT.USE_MCP) {
            ctx.emit({ stage: "merge", prNumber: Number(prNumber), subject, body: "" });
            return EXIT.USE_MCP;
        }
        if (!merged.out.merged)
            throw new Stop(EXIT_LAND_STOPPED, `PR ${prNumber} did not reach MERGED (state=${merged.out.state ?? "unread"})`);
        sha = merged.out.mergeCommitOid ?? "";
        transport = "gh";
    }
    else {
        const back = probePr(tree, { number: prNumber, state: "open" });
        if (back.kind === "ok" && back.pr && back.pr.state !== "MERGED")
            throw new Stop(EXIT_LAND_STOPPED, `PR ${prNumber} is ${back.pr.state}, not MERGED`);
    }
    if (sha === "")
        throw new Stop(EXIT_LAND_STOPPED, `could not resolve the landed SHA for PR ${prNumber}`);
    if (!runGit(tree, ["fetch", REMOTE, DEV]).ok)
        throw new Stop(EXIT_LAND_STOPPED, "fetch of origin/dev after the merge failed");
    return {
        shape: "pr",
        transport,
        sha,
        canonicalRef: UPSTREAM,
        prNumber: Number(prNumber),
        worktree: null,
    };
}
async function landVerb(ctx) {
    const workflow = String(ctx.flags.workflow);
    if (!["design", "plan"].includes(workflow))
        throw new CommandError(EXIT.USAGE, "--workflow must be design or plan");
    const fid = String(ctx.flags.fid);
    const root = repoRoot(ctx.cwd);
    const month = resolveMonth(root, fid, str(ctx.flags.month));
    // `bkit install` can leave core.bare=true on the main checkout, which breaks every checkout below.
    if (git(root, ["config", "--get", "core.bare"]) === "true" &&
        fs.statSync(path.join(root, ".git"), { throwIfNoEntry: false })?.isDirectory()) {
        runGit(root, ["config", "core.bare", "false"]);
    }
    const worktreeStatus = path.join(git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? root, "docs", "plans", month, "logs", fid, "status.jsonl");
    try {
        const devPushes = devPushesOf(root, worktreeStatus, ctx.log);
        const landed = devPushes
            ? await landLocal(ctx, root, { workflow, fid, month })
            : landPr(ctx, {
                workflow,
                fid,
                month,
                issue: str(ctx.flags.issue) || undefined,
                branch: String(ctx.flags.branch ?? currentBranch(ctx.cwd)),
                pr: str(ctx.flags.pr),
                mergedSha: str(ctx.flags.mergedSha),
            });
        if (typeof landed === "number")
            return landed;
        // The audit: canonical docs on dev, the landed body clean, the transport recorded.
        const docs = canonicalDocs(root, landed.sha, workflow, month, fid);
        const main = `docs/plans/${month}/${fid}-${workflow}.md`;
        const missing = [main, ...docs].filter((d) => !runGit(root, ["cat-file", "-e", `${landed.canonicalRef}:${d}`]).ok);
        const status = path.join(root, "docs", "plans", month, "logs", fid, "status.jsonl");
        runGit(root, ["fetch", REMOTE, DEV]);
        const token = bodySkipToken(root, landed.sha);
        if (token === undefined)
            throw new Stop(EXIT_LANDED_UNVERIFIED, `post-close body scan errored on ${landed.sha}`);
        const scanResult = token ? "skip-token-found" : "clean";
        if (!crossCheckFile(status, landed.transport, ctx.log).ok)
            throw new Stop(EXIT_LANDED_UNVERIFIED, "close transport cross-check failed");
        closeTransportRow(status, { shape: landed.shape, sha: landed.sha, scanResult });
        if (token)
            throw new Stop(EXIT_LANDED_UNVERIFIED, `landed commit ${landed.sha} inherited a CI-suppression token in its body`);
        if (missing.length)
            throw new Stop(EXIT_LANDED_UNVERIFIED, `canonical ${workflow} missing on dev: ${missing.join(", ")}`);
        const released = releaseLock(workflowLockPath(lockRoot(root, workflow, false), month, fid), {
            workflow,
            fid,
            token: str(ctx.flags.token),
        });
        if (released.removeFailed)
            throw new Stop(EXIT_LOCK_LEFT, "Lock removal failed");
        ctx.emit({
            shape: landed.shape,
            transport: landed.transport,
            landedSha: landed.sha,
            prNumber: landed.prNumber,
            canonicalRef: landed.canonicalRef,
            scanResult,
            worktree: landed.worktree,
        });
        return EXIT.OK;
    }
    catch (err) {
        if (!(err instanceof Stop))
            throw err;
        ctx.log(err.message);
        return err.code;
    }
}
function anchorStampVerb(ctx) {
    const rel = String(ctx.flags.file);
    const file = path.resolve(ctx.cwd, rel);
    const baseSha = String(ctx.flags.baseSha);
    if (!fs.statSync(file, { throwIfNoEntry: false })?.isFile()) {
        ctx.log(`${rel} is missing or not a file — nothing to stamp`);
        return EXIT_NO_FILE;
    }
    if (baseSha === "")
        throw new CommandError(EXIT.USAGE, "--base-sha must be non-empty");
    const baseRef = str(ctx.flags.baseRef) ?? UPSTREAM;
    const designFlag = str(ctx.flags.design);
    const designFile = designFlag === undefined ? undefined : path.resolve(ctx.cwd, designFlag);
    const design = designFlag !== undefined && designFile !== undefined && fs.existsSync(designFile)
        ? {
            path: designFlag,
            baseSha: readAnchor(fs.readFileSync(designFile, "utf-8")).baseSha ?? "",
        }
        : undefined;
    const bkit = anchorBkitStatus(ctx.cwd);
    if (bkit?.advisory)
        ctx.log(bkit.advisory);
    const before = fs.readFileSync(file, "utf-8");
    const after = stampAnchor(before, baseSha, design, baseRef, bkit);
    // Temp file + rename: a crash mid-write never leaves a half-stamped doc.
    const tmp = `${file}.bkit-anchor.tmp`;
    fs.writeFileSync(tmp, after);
    fs.renameSync(tmp, file);
    ctx.emit({
        file: rel,
        baseSha,
        baseRef,
        designPath: design?.path ?? null,
        designBaseSha: design?.baseSha ?? null,
        bkitVersion: bkit?.version ?? null,
        bkitLatest: bkit?.latest ?? null,
        bkitOutdated: bkit?.outdated ?? null,
        bkitAdvisory: bkit?.advisory ?? null,
        changed: before !== after,
    });
    return EXIT.OK;
}
function anchorReadVerb(ctx) {
    const rel = String(ctx.flags.file);
    const file = path.resolve(ctx.cwd, rel);
    const field = str(ctx.flags.field);
    if (field !== undefined && !ANCHOR_FIELDS.includes(field)) {
        throw new CommandError(EXIT.USAGE, `--field must be one of ${ANCHOR_FIELDS.join(", ")}`);
    }
    const against = str(ctx.flags.against);
    const skip = (reason, message, fields) => {
        ctx.log(message);
        ctx.emit({ ...fields, value: null, skip: reason, landed: null });
        return EXIT_ANCHOR_SKIP;
    };
    const none = Object.fromEntries(ANCHOR_FIELDS.map((f) => [f, null]));
    if (!fs.statSync(file, { throwIfNoEntry: false })?.isFile()) {
        if (against !== undefined)
            return skip("no-file", `no ${rel} — nothing to check`, none);
        ctx.log(`${rel} not found`);
        return EXIT_NO_FILE;
    }
    const anchor = readAnchor(fs.readFileSync(file, "utf-8"));
    const fields = Object.fromEntries(ANCHOR_FIELDS.map((f) => [f, anchor[f] ?? null]));
    const value = field === undefined ? null : (anchor[field] ?? null);
    if (against === undefined) {
        ctx.emit({ ...fields, value, skip: null, landed: null });
        return EXIT.OK;
    }
    const base = anchor.baseSha ?? "";
    if (base === "")
        return skip("no-anchor", `no anchor on ${rel}`, fields);
    if (!runGit(ctx.cwd, ["cat-file", "-e", base]).ok) {
        return skip("unreachable", `base ${base} unreachable in this clone`, fields);
    }
    const diff = runGit(ctx.cwd, ["diff", "--name-only", `${base}..${against}`]);
    if (!diff.ok)
        throw new CommandError(EXIT.USAGE, `cannot diff ${base}..${against}: ${diff.stderr}`);
    const landed = diff.stdout.split("\n").filter(Boolean).length;
    if (landed === 0)
        return skip("nothing-landed", `nothing landed on ${against} since ${base}`, fields);
    ctx.emit({ ...fields, value, skip: null, landed });
    return EXIT.OK;
}
// ---------------------------------------------------------------------------
// Spec
// ---------------------------------------------------------------------------
export const branchesCommand = {
    noun: "branches",
    summary: "Sync, push, rebase and switch branches; stamp and read a doc's base-commit anchor.",
    verbs: {
        sync: {
            summary: `Fetch ${UPSTREAM}; report whether it is an ancestor of HEAD (Path A/B) and how far docs/ is behind; optionally merge it in.`,
            flags: [
                {
                    name: "head",
                    type: "string",
                    help: "commit to compare (default HEAD), e.g. ship's ENTRY_HEAD",
                },
                {
                    name: "merge-docs",
                    type: "boolean",
                    help: `on a feature branch whose docs/ is behind, merge ${UPSTREAM} (ledgers union, other docs/ take ${DEV}, anything else aborts)`,
                },
            ],
            output: {
                branch: "current branch (null when detached)",
                head: "commit compared (after a merge: the merge commit)",
                basePath: `A when ${UPSTREAM} is an ancestor of head (nothing to integrate), else B`,
                behind: `commits on ${UPSTREAM} not in head`,
                docsBehind: `of those, commits touching docs/`,
                merged: `true when --merge-docs merged ${UPSTREAM}`,
                resolved: "conflicts the merge resolved: [{path, how: union|dev}]",
            },
            exitCodes: {
                [EXIT_DETACHED]: "--merge-docs with no branch checked out",
                [EXIT_FETCH_FAILED]: `git fetch ${REMOTE} ${DEV} failed`,
                [EXIT_MERGE_CONFLICT]: "the docs merge conflicted outside docs/ or could not be committed; merge aborted",
            },
            run: syncVerb,
        },
        push: {
            summary: "Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise.",
            flags: [
                {
                    name: "mode",
                    type: "string",
                    required: true,
                    help: "feature (a step's push) | abort (Failure Path: never into an open PR) | dev (the checkout must be on dev)",
                },
                { name: "set-upstream", type: "boolean", help: "push with -u" },
                {
                    name: "require-ci",
                    type: "boolean",
                    help: "this push must start a CI run: refuse when the HEAD message carries a skip-CI token",
                },
                {
                    name: "open-pr",
                    type: "string",
                    help: "--mode=abort: the open-PR answer from MCP (a number, or none) instead of asking gh",
                },
            ],
            output: {
                pushed: "true when the push ran and succeeded",
                ref: "the branch pushed — link handover artifacts to this ref; null when nothing was pushed",
                sha: "HEAD commit pushed (null when not pushed)",
                forced: "true when pushed with --force-with-lease",
                skipped: "why the push did not run: open-pr | skip-ci (null otherwise)",
                prNumber: "the open PR that stopped an abort push (null otherwise)",
            },
            exitCodes: {
                [EXIT_DETACHED]: "no branch checked out",
                [EXIT_SKIP_CI]: "--require-ci and the HEAD message carries a skip-CI token",
                [EXIT_OPEN_PR]: "--mode=abort and the branch has an open PR: push skipped, remote HEAD kept",
                [EXIT_PUSH_FAILED]: "git push failed",
                [EXIT_NOT_DEV]: "--mode=dev and the checkout is not on dev",
            },
            run: pushVerb,
        },
        rebase: {
            summary: "Drive a rebase to completion, auto-resolving ledger (union) and lockfile (regenerate) conflicts; refuse and abort on anything else.",
            flags: [
                {
                    name: "log-file",
                    type: "string",
                    help: "append the resolution log lines here, e.g. logs/{FID}/rebase-resolve-log.md",
                },
                {
                    name: "sentinel",
                    type: "string",
                    help: "file removed at start and created on refusal, e.g. logs/{FID}/.rebase-failed",
                },
            ],
            output: {
                outcome: "resolved | refused (a refused rebase is aborted)",
                resolved: "conflicts resolved: [{path, how: union|lockfile}]",
                skippedCommits: "commits skipped because resolution emptied them",
                rounds: "resolve rounds run",
                refused: "the path that stopped resolution (null when none, or not path-specific)",
                reason: "why resolution refused (null on success)",
                aborted: "a refused rebase was aborted (false on success, or when the abort failed)",
                sentinel: "the sentinel written on refusal (null otherwise)",
            },
            exitCodes: {
                [EXIT_REFUSED]: "a conflict is not auto-resolvable",
                [EXIT_NO_REBASE]: "no rebase in progress",
            },
            run: rebaseVerb,
        },
        switch: {
            summary: "After a merge, return the main checkout to dev and bring it level with origin/dev, under the dev lock.",
            flags: [
                {
                    name: "fid",
                    type: "string",
                    required: true,
                    help: "feature id, recorded in the dev lock",
                },
                {
                    name: "dev-pushes",
                    type: "string",
                    required: true,
                    help: "true | false — runtimeDevPushes; false skips the switch",
                },
                {
                    name: "worktrees",
                    type: "string",
                    required: true,
                    help: "true | false — runtimeWorktrees; a local dev checkout needs true",
                },
            ],
            output: {
                switched: "true when the checkout is now on dev",
                branch: "branch checked out afterwards",
                ahead: "local dev commits that were ahead of origin/dev (all skip-CI, rebased and pushed)",
                pushed: "true when those commits were pushed",
                installed: "dependency install result: true, false (failed, exit 16), null (no package.json)",
                skipped: "dev-pushes-false when the runtime does not push dev (null otherwise)",
            },
            exitCodes: {
                [EXIT_NOT_DEV]: "the checkout is not on dev after git checkout dev",
                [EXIT_FETCH_FAILED]: `git fetch ${REMOTE} ${DEV} failed`,
                [EXIT_PUSH_FAILED]: "pushing the rebased local dev commits failed",
                [EXIT_PULL_FAILED]: "git pull failed: local dev is not level with origin/dev",
                [EXIT_RUNTIME_REFUSED]: "--dev-pushes=true with --worktrees=false",
                [EXIT_INSTALL_FAILED]: "dependency install failed or the package manager could not run",
            },
            run: switchVerb,
        },
        land: {
            summary: "Design / plan close: land feat/{fid} on dev — the local squash under the dev lock, or the PR squash-merge — then audit it and release the lock.",
            flags: [
                { name: "workflow", type: "string", required: true, help: "design | plan" },
                { name: "fid", type: "string", required: true, help: "feature id" },
                {
                    name: "month",
                    type: "string",
                    help: "month bucket YYYYMM (default: the feature's bucket)",
                },
                { name: "token", type: "string", help: "the workflow lock token to release once landed" },
                { name: "issue", type: "string", help: "PR close: the issue id for the PR-body marker" },
                {
                    name: "branch",
                    type: "string",
                    help: "PR close: the head branch (default: the current branch)",
                },
                {
                    name: "pr",
                    type: "string",
                    help: "PR close re-entry: the PR MCP created (after exit 80 at stage open)",
                },
                {
                    name: "merged-sha",
                    type: "string",
                    help: "PR close re-entry: the squash commit MCP's merge returned (after exit 80 at stage merge)",
                },
            ],
            output: {
                shape: "local | pr",
                transport: "git | gh | mcp",
                landedSha: "the commit that landed on dev",
                prNumber: "the PR (pr shape), else null",
                canonicalRef: "dev (local) | origin/dev (pr) — where the canonical docs were verified",
                scanResult: "the landed commit body's scan: clean",
                worktree: "the worktree removal result (local), else null",
                stage: "exit 80 only: open (create the PR via MCP with title / body / base / head) | merge (merge via MCP with subject, empty body)",
            },
            exitCodes: {
                [EXIT_PUSH_FAILED]: "the dev or branch push failed",
                [EXIT_NOT_DEV]: "the main checkout is not on dev after checkout",
                [EXIT_PULL_FAILED]: "dev could not fast-forward",
                [EXIT_LAND_STOPPED]: "a guard stopped the land: stray files, failed squash, staged non-doc files, canonical blob mismatch, PR not opened / merged (nothing landed)",
                [EXIT_LANDED_UNVERIFIED]: "landed, but the body scan, transport cross-check or canonical-on-dev check failed",
                [EXIT_LOCK_LEFT]: "landed and audited, but the workflow lock file survived removal",
            },
            run: landVerb,
        },
        "anchor-stamp": {
            summary: "Put a <!-- bkit:anchor --> block recording the base commit and bkit release on top of a design/plan doc or audit report (idempotent).",
            flags: [
                { name: "file", type: "string", required: true, help: "doc to stamp (must exist)" },
                {
                    name: "base-sha",
                    type: "string",
                    required: true,
                    help: "base commit the doc was written against (non-empty)",
                },
                {
                    name: "base-ref",
                    type: "string",
                    help: `ref baseSha was taken from (default ${UPSTREAM}; audit reports pass the audited branch)`,
                },
                {
                    name: "design",
                    type: "string",
                    help: "plan docs: the design doc it targets; when that file exists, designPath and its own baseSha are stamped too",
                },
            ],
            output: {
                file: "doc stamped",
                baseSha: "base commit stamped",
                baseRef: "ref stamped",
                designPath: "design path stamped (null when none)",
                designBaseSha: "the design doc's baseSha stamped (null when none; empty when it had no anchor)",
                bkitVersion: "the .bkit/version pin stamped (null when unpinned: no bkit fields are stamped then)",
                bkitLatest: "newest published bkit stamped (null when unknown: stamped empty)",
                bkitOutdated: "true when bkitVersion is older than bkitLatest: a visible warning line is stamped under the block (null when unknown)",
                bkitAdvisory: "one warning line when bkitOutdated, else null",
                changed: "false when the doc already carried exactly this block",
            },
            exitCodes: { [EXIT_NO_FILE]: "--file is missing or not a file" },
            run: anchorStampVerb,
        },
        "anchor-read": {
            summary: "Read a doc's anchor fields; with --against, decide whether anything landed since its baseSha.",
            flags: [
                { name: "file", type: "string", required: true, help: "design/plan doc or audit report" },
                {
                    name: "field",
                    type: "string",
                    help: `one field to return as value: ${ANCHOR_FIELDS.join(" | ")}`,
                },
                {
                    name: "against",
                    type: "string",
                    help: `ref to compare baseSha with, e.g. ${UPSTREAM}: exits ${EXIT_ANCHOR_SKIP} when the check should be skipped`,
                },
            ],
            output: {
                baseSha: "anchor baseSha (null when absent)",
                baseRef: "anchor baseRef (null when absent)",
                designPath: "anchor designPath (null when absent)",
                designBaseSha: "anchor designBaseSha (null when absent)",
                bkitVersion: "anchor bkitVersion (null when absent)",
                bkitLatest: "anchor bkitLatest (null when absent)",
                value: "the --field value (null when absent or no --field)",
                skip: "with --against: no-file | no-anchor | unreachable | nothing-landed (null = run the check)",
                landed: "with --against: paths changed between baseSha and the ref",
            },
            exitCodes: {
                [EXIT_ANCHOR_SKIP]: "--against: skip the check (no file, no anchor, base unreachable, nothing landed)",
                [EXIT_NO_FILE]: "--file not found (without --against)",
            },
            run: anchorReadVerb,
        },
    },
};
