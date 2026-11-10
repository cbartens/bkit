// bkit branches sync|push|rebase|switch|land|fast-forward|scan-diff|force-build|
// anchor-stamp|anchor-read — the branch mechanics every phase workflow repeated
// inline: bring a feature branch up to date with dev, push it the one safe way
// for its kind, auto-resolve the rebase conflicts that lose nothing, return the
// main checkout to dev after a merge, land a design / plan close on dev,
// fast-forward onto a remote branch, route on what a branch's diff holds, force
// a full CI build, and stamp / read the base commit a design or plan doc was
// written against.
//
// Every verb works on `origin` and the integration branch `dev`, as the
// workflows do. A push is always EXACTLY ONE `git push`: `dev` / `main` get a
// plain push, every other branch `--force-with-lease`, so a shared branch is
// never force-pushed and a personal one survives the rebase that rewrote it.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { gitEnv } from "../../ledgers/telemetry.js";
import { actionHash, actionKey, alreadyDone, recordAction } from "../../ledgers/status.js";
import { bodySkipToken, classifyLockExit, CommandError, DEV, EXIT, ghUnavailable, git, isSharedBranch, OUTPUT_LIMIT, parseJson, repoRoot, runGh, runGit, SKIP_CI_TOKEN, testsLockHolder, wholeNumber, } from "../lib.js";
import { bkitVersionStatus } from "../../shared/bkit-latest.js";
import { parseBkitVersion, serializeBkitVersion, } from "../../install/version-file.js";
import { DEV_REFSPEC, fetchDev, landBackoffMs, landDir, pushToDev, sleep } from "../land.js";
import { TIMEOUTS } from "../../shared/timeouts.js";
import { activeRecord, bookPathspecs, checkOnlyBookkeeping, commitBookkeeping, markRecordPushed, recordOnBranch, } from "./ledgers.js";
import { releaseLock, resolveMonth, workflowLockPath } from "./locks.js";
import { EXIT_BASE_NOT_DEV, FORCE_BUILD, closeTransportRow, crossCheckRows, mergePr, openPrFor, probePr, } from "./prs.js";
import { AUTO_LABEL, AUTO_ROUTE_SUFFIX } from "./issues.js";
import { appendFeature } from "./roadmap.js";
import { detect } from "./runtime.js";
import { readRuns, readStatusRows, readStatusRowsAt } from "./status.js";
import { declaredName, testSource } from "./test-blocks.js";
import { addAllButCopied, assertShipEligible, copyExcludes, hasLeftovers, notOnDev, rebaseNoteFile, recordRebase, removeWorktree, worktreeDir, } from "./worktrees.js";
import { COULD_NOT_RUN_EXIT_CODES, LOCKFILE_REGENERATE, installCommand, scriptCommand, } from "../../shared/package-manager.js";
import { readPackageJson } from "../../shared/package-json.js";
import { str } from "./status.js";
const REMOTE = "origin";
const UPSTREAM = `${REMOTE}/${DEV}`;
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
export const EXIT_INSTALL_FAILED = 16;
export const EXIT_LAND_STOPPED = 17;
export const EXIT_LANDED_UNVERIFIED = 18;
export const EXIT_LOCK_LEFT = 19;
export const EXIT_NO_RECORD = 20;
export const EXIT_NOTHING_TO_PUSH = 21;
export const EXIT_DIVERGED = 22;
export const EXIT_DIFF_FAILED = 23;
export const EXIT_HAND_RESOLVE = 24;
export const EXIT_GENERATE_FAILED = 25;
// ---------------------------------------------------------------------------
// Process helpers
// ---------------------------------------------------------------------------
/** git with a non-interactive editor, so `--continue` / `--skip` / merge commits never open one. */
const quietGit = (cwd, args) => runGit(cwd, args, { GIT_EDITOR: "true" });
/** `git show :<stage>:<path>` as raw bytes; empty when that stage does not exist, null when git could not run. */
function stageBytes(top, stage, file) {
    const res = spawnSync("git", ["show", `:${stage}:${file}`], {
        cwd: top,
        env: gitEnv(),
        maxBuffer: OUTPUT_LIMIT,
    });
    if (res.error)
        return null;
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
 * resurrects after the harvest drained it is re-banked by the next harvest.
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
/** bkit's install record: merged entry by entry (`recordResolve`), never line by line. */
export const INSTALL_RECORD = ".bkit/version";
/**
 * Generated registers a conflict is settled in by taking dev's copy. Each side rebuilt
 * the whole file, so neither side's text is worth a hand merge, and running `script`
 * with `args` after the rebase or merge makes dev's copy current. `keep` brackets the
 * one hand-written region, which the rebuild reads back and re-emits, so a branch's
 * edit to it is carried onto dev's copy. `embed` names the variable in `script` that
 * lists the hand-written docs the rebuild copies a generated block into, and the
 * markers around that block.
 */
export const REGISTERS = {
    "docs/capabilities.md": {
        script: "scripts/graphify/bkit-graphify.sh",
        args: ["refresh"],
        keep: ["<!-- overrides:start -->", "<!-- overrides:end -->"],
        embed: {
            variable: "GRAPH_EMBED_DOCS",
            block: ["<!-- graph:packages:start -->", "<!-- graph:packages:end -->"],
        },
    },
};
/**
 * Each doc a register's script in `top` embeds a generated block into, mapped to that
 * register. Read from the script's own `embed.variable` assignment, so a repo whose
 * script lists no docs, or that has no script, gets an empty map.
 */
export function embedDocs(top) {
    const out = new Map();
    for (const [register, entry] of Object.entries(REGISTERS)) {
        const script = path.join(top, entry.script);
        if (!fs.existsSync(script))
            continue;
        const assigned = new RegExp(`^${entry.embed.variable}="([^"]*)"`, "m").exec(fs.readFileSync(script, "utf-8"));
        for (const doc of (assigned?.[1] ?? "").split(/\s+/).filter(Boolean))
            out.set(doc, register);
    }
    return out;
}
/**
 * How a conflicted path may be resolved. Only repo-root lockfiles count: the regenerate
 * runs there. `embeds` is the repo's `embedDocs`.
 */
export function classifyConflict(file, embeds = new Map()) {
    if (Object.hasOwn(REGISTERS, file))
        return "register";
    if (embeds.has(file))
        return "embed";
    if (file === INSTALL_RECORD)
        return "record";
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
            const bytes = stageBytes(top, stage, file);
            if (bytes === null)
                return { ok: false, problem: `git show :${stage}:${file} failed` };
            fs.writeFileSync(path.join(tmp, name), bytes);
        }
        const merged = spawnSync("git", [
            "merge-file",
            "--union",
            "-p",
            path.join(tmp, "ours"),
            path.join(tmp, "base"),
            path.join(tmp, "theirs"),
        ], { cwd: top, env: gitEnv(), maxBuffer: OUTPUT_LIMIT });
        // --union never leaves conflict markers, so a non-zero exit is an I/O failure.
        if (merged.error || merged.status !== 0)
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
 * Resolve a lockfile conflict: start from dev's copy, then regenerate from the
 * manifest, which merged normally (or refused and stopped the rebase or merge
 * before this). During a rebase dev is `--ours` (the branch being rebased ONTO;
 * `--theirs` is the commit being replayed); in a merge of origin/dev it is `--theirs`.
 */
function lockfileResolve(top, file, dev = "ours") {
    const regenerate = LOCKFILE_REGENERATE[file];
    if (!regenerate)
        return false;
    if (!runGit(top, ["checkout", `--${dev}`, "--", file]).ok)
        return false;
    const res = spawnSync(regenerate[0], regenerate.slice(1), { cwd: top, stdio: "ignore" });
    return res.status === 0;
}
/** The text from `keep`'s open marker through its close marker; null when either is missing. */
function keptRegion(text, [open, close]) {
    const start = text.indexOf(open);
    if (start === -1)
        return null;
    const end = text.indexOf(close, start + open.length);
    return end === -1 ? null : text.slice(start, end + close.length);
}
/**
 * Settle a conflicted register on dev's copy, carrying the branch's edit to the
 * hand-written region when dev left that region as the merge base had it. Refuses when
 * a side deleted the file, or both sides changed the region: that needs a hand merge.
 * During a rebase dev is `ours`; in a merge of origin/dev it is `theirs`.
 */
export function registerResolve(top, file, dev) {
    const entry = REGISTERS[file];
    if (entry === undefined)
        return { ok: false, problem: "not a generated register" };
    const base = stageBytes(top, 1, file);
    const devSide = stageBytes(top, dev === "ours" ? 2 : 3, file);
    const branchSide = stageBytes(top, dev === "ours" ? 3 : 2, file);
    if (base === null || devSide === null || branchSide === null)
        return { ok: false, problem: "git show of a conflict stage failed" };
    if (devSide.length === 0 || branchSide.length === 0)
        return { ok: false, problem: "one side deleted the register" };
    let text = devSide.toString("utf-8");
    const baseKept = keptRegion(base.toString("utf-8"), entry.keep);
    const devKept = keptRegion(text, entry.keep);
    const branchKept = keptRegion(branchSide.toString("utf-8"), entry.keep);
    if (branchKept !== baseKept && branchKept !== devKept) {
        if (devKept !== baseKept)
            return { ok: false, problem: "both sides changed the hand-written region" };
        if (devKept === null || branchKept === null)
            return { ok: false, problem: "one side added or removed the hand-written region" };
        text = text.replace(devKept, () => branchKept);
    }
    fs.writeFileSync(path.join(top, file), text);
    return { ok: true };
}
/**
 * Settle a conflicted doc that embeds a register's generated block: give all three
 * stages dev's copy of the block, then merge the rest of the doc as git would. Refuses
 * when a side lacks the block, or when the doc still conflicts outside it: that needs a
 * hand merge. The register's rebuild rewrites the block afterwards.
 */
export function embedResolve(top, file, register, dev) {
    const entry = REGISTERS[register];
    if (entry === undefined)
        return { ok: false, problem: "not a generated register" };
    const stages = { base: 1, ours: 2, theirs: 3 };
    const texts = { base: "", ours: "", theirs: "" };
    for (const [name, stage] of Object.entries(stages)) {
        const bytes = stageBytes(top, stage, file);
        if (bytes === null)
            return { ok: false, problem: `git show :${stage}:${file} failed` };
        texts[name] = bytes.toString("utf-8");
    }
    const devBlock = keptRegion(texts[dev], entry.embed.block);
    if (devBlock === null)
        return { ok: false, problem: "a side lacks the generated block" };
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-embed-"));
    try {
        for (const name of Object.keys(stages)) {
            const block = keptRegion(texts[name], entry.embed.block);
            if (block === null)
                return { ok: false, problem: "a side lacks the generated block" };
            fs.writeFileSync(path.join(tmp, name), texts[name].replace(block, () => devBlock));
        }
        const merged = spawnSync("git", [
            "merge-file",
            "-p",
            path.join(tmp, "ours"),
            path.join(tmp, "base"),
            path.join(tmp, "theirs"),
        ], { cwd: top, env: gitEnv(), maxBuffer: OUTPUT_LIMIT });
        // Exit status = conflicts left, capped at 127; above that it failed.
        if (merged.error || merged.status === null || merged.status > 127)
            return { ok: false, problem: "git merge-file failed" };
        if (merged.status > 0)
            return { ok: false, problem: "it conflicts outside the generated block" };
        fs.writeFileSync(path.join(top, file), merged.stdout);
        return { ok: true };
    }
    finally {
        fs.rmSync(tmp, { recursive: true, force: true });
    }
}
/** The value one entry takes: the side that changed it, or dev's when both did. */
function pickEntry(base, dev, branch) {
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    return same(dev, base) ? branch : dev;
}
/**
 * Merge a conflicted install record entry by entry: `pinnedVersion`,
 * `claudeAllowDerived` and each `canonicalHashes` path take the side that changed
 * them, and dev's value when both did. A fingerprint left at dev's value makes
 * `bkit upgrade` treat that file as edited by hand until it refreshes the entry, so
 * the record needs no rebuild. Refuses when a side deleted the record or a copy is
 * not a record. During a rebase dev is `ours`; in a merge of origin/dev it is `theirs`.
 */
export function recordResolve(top, dev) {
    const copies = [];
    for (const stage of [1, dev === "ours" ? 2 : 3, dev === "ours" ? 3 : 2]) {
        const bytes = stageBytes(top, stage, INSTALL_RECORD);
        if (bytes === null)
            return { ok: false, problem: `git show :${stage}:${INSTALL_RECORD} failed` };
        if (bytes.length === 0 && stage !== 1)
            return { ok: false, problem: "one side deleted the install record" };
        // Both sides adding the record leaves no base: merge against an empty one.
        const parsed = bytes.length === 0
            ? { pinnedVersion: "", canonicalHashes: {}, claudeAllowDerived: [] }
            : parseBkitVersion(bytes.toString("utf-8"));
        if (parsed === null)
            return { ok: false, problem: "a copy of the install record is not valid" };
        copies.push(parsed);
    }
    const [base, devSide, branch] = copies;
    const canonicalHashes = {};
    for (const p of new Set([
        ...Object.keys(devSide.canonicalHashes),
        ...Object.keys(branch.canonicalHashes),
    ])) {
        const hash = pickEntry(base.canonicalHashes[p], devSide.canonicalHashes[p], branch.canonicalHashes[p]);
        if (hash !== undefined)
            canonicalHashes[p] = hash;
    }
    const merged = {
        pinnedVersion: pickEntry(base.pinnedVersion, devSide.pinnedVersion, branch.pinnedVersion),
        canonicalHashes,
        claudeAllowDerived: pickEntry(base.claudeAllowDerived, devSide.claudeAllowDerived, branch.claudeAllowDerived),
    };
    fs.writeFileSync(path.join(top, INSTALL_RECORD), serializeBkitVersion(merged));
    return { ok: true };
}
const NOT_RESOLVABLE = "not an append-only ledger, a recognised lockfile, a generated register, a doc embedding one or the install record";
/** How a rebase settled each kind of conflict, for its log. */
const REBASE_HOW = {
    union: "union (append-only ledger)",
    lockfile: "took rebase target + regenerated",
    register: "took rebase target's copy of a generated register",
    embed: "took rebase target's copy of the generated block, merged the rest",
    record: "merged the install record entry by entry, rebase target's value where both changed",
};
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
    const embeds = embedDocs(top);
    while (result.rounds < 100) {
        result.rounds++;
        const conflicts = unmergedPaths(top);
        if (conflicts.length > 0) {
            // Classify the whole set before resolving any of it, so a refused path
            // never leaves half the set rewritten.
            const refused = conflicts.find((f) => classifyConflict(f, embeds) === "refuse");
            if (refused !== undefined) {
                return refuse(`REFUSE ${refused} — ${NOT_RESOLVABLE}; routing to Failure Path`, refused, NOT_RESOLVABLE);
            }
            for (const f of conflicts) {
                const kind = classifyConflict(f, embeds);
                const settled = kind === "register"
                    ? registerResolve(top, f, "ours")
                    : kind === "embed"
                        ? embedResolve(top, f, embeds.get(f), "ours")
                        : kind === "record"
                            ? recordResolve(top, "ours")
                            : null;
                if (settled !== null && !settled.ok)
                    return refuse(`REFUSE ${f} — ${settled.problem}`, f, settled.problem);
                const ok = settled !== null ||
                    (kind === "ledger" ? unionResolve(top, f).ok : lockfileResolve(top, f));
                if (!ok || !runGit(top, ["add", "--", f]).ok) {
                    return refuse(`REFUSE ${f} — resolution failed`, f, "resolution failed");
                }
                const how = kind === "ledger"
                    ? "union"
                    : kind === "register" || kind === "embed" || kind === "record"
                        ? kind
                        : "lockfile";
                result.resolved.push({ path: f, how });
                log(`RESOLVED ${f} — ${REBASE_HOW[how]}`);
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
        else {
            const cont = quietGit(top, ["rebase", "--continue"]);
            // The next commit conflicted (next round handles it), or the rebase is stuck.
            if (!cont.ok && unmergedPaths(top).length === 0) {
                const why = (cont.stderr || cont.stdout).replace(/\s*\n\s*/g, " ");
                const reason = `git rebase --continue failed with no unmerged paths: ${why || "git gave no reason"}`;
                return refuse(`REFUSE — ${reason}`, null, reason);
            }
            if (!cont.ok)
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
        maxBuffer: OUTPUT_LIMIT,
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
/**
 * Appends the resolution lines to the run's log, after the note `worktrees setup`
 * held outside the tree while the rebase was paused (`rebaseNoteFile`), then drops
 * the note. Called only once the rebase has finished or been aborted.
 */
function appendLog(ctx, top, file, lines) {
    if (file === undefined)
        return;
    const noteFile = rebaseNoteFile(top);
    const note = noteFile !== null && fs.existsSync(noteFile) ? fs.readFileSync(noteFile, "utf-8") : "";
    if (note === "" && lines.length === 0)
        return;
    const abs = path.resolve(ctx.cwd, file);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.appendFileSync(abs, note + lines.map((l) => `[bkit-rebase] ${l}\n`).join(""));
    if (noteFile !== null)
        fs.rmSync(noteFile, { force: true });
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
    const origHead = rebaseOrigHead(top);
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
    let rebuilt = null;
    if (result.ok) {
        const fid = currentBranch(top).replace(/^feat\//, "") || "rebase";
        rebuilt = rebuildRegisters(top, result.resolved, (files) => `chore(${fid}): rebuild ${files.join(" ")} after the rebase`, (line) => {
            result.log.push(line);
            ctx.log(line);
        });
    }
    appendLog(ctx, top, str(ctx.flags.logFile), result.log);
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
        rebuilt,
    });
    const statusFile = str(ctx.flags.file);
    if (result.ok && statusFile !== undefined)
        recordRebase(path.resolve(ctx.cwd, statusFile), origHead, git(top, ["rev-parse", "HEAD"]));
    return result.ok ? EXIT.OK : EXIT_REFUSED;
}
/** The branch tip the in-progress rebase started from. */
function rebaseOrigHead(top) {
    for (const dir of ["rebase-merge", "rebase-apply"]) {
        const file = git(top, [
            "rev-parse",
            "--path-format=absolute",
            "--git-path",
            `${dir}/orig-head`,
        ]);
        if (file !== null && fs.existsSync(file))
            return fs.readFileSync(file, "utf-8").trim();
    }
    return null;
}
/** Git collapses a failing pre-push hook's status; classify its exact tests-lock markers. */
function runPush(cwd, args, branch) {
    const who = `bkit branches push ${branch}`;
    const wait = wholeNumber(process.env.BKIT_LOCK_WAIT_S, "BKIT_LOCK_WAIT_S", 60);
    const res = runGit(cwd, args, {
        LOCAL_STACK_LOCK_WAIT_S: String(wait),
        LOCAL_STACK_LOCK_WHO: who,
    });
    const log = [res.stdout, res.stderr].filter(Boolean).join("\n");
    const lockHolder = res.ok ? null : testsLockHolder(log, who);
    const outcome = res.ok
        ? "gate"
        : classifyLockExit({ exitCode: lockHolder === null ? 73 : 75, log, who });
    return {
        ...res,
        lockHolder,
        lockExit: outcome === "lock-wait" ? EXIT.AGENT_WAIT : outcome === "could-not-run" ? 4 : null,
    };
}
/**
 * Push the current branch with exactly one `git push`: plain for dev / main,
 * `--force-with-lease` otherwise. `abort` never pushes into an open PR (`openPr`:
 * the answer MCP gave; undefined asks gh, which throws EXIT.USE_MCP when it cannot).
 * An in-place run on dev (a shared-checkout record exists) pushes only the
 * commits it made: plain when they are all that local dev holds beyond
 * origin/dev, else replayed onto a fresh origin/dev through `pushToDev`.
 */
export async function pushBranch(cwd, o, log) {
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
            replayed: false,
            mergedDev: false,
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
    if (mode === "plain")
        return pushPlain(cwd, branch, o, log, notPushed);
    const shared = isSharedBranch(branch);
    const rec = !shared
        ? null
        : o.fid === undefined
            ? recordOnBranch(cwd, branch)
            : activeRecord(cwd, o.fid);
    // Without the run's record the push would carry all of local dev, not the run's commits.
    if (shared && rec === null && (mode === "dev" || o.fid !== undefined)) {
        log(`no shared-checkout record${o.fid === undefined ? "" : ` for ${o.fid}`} on ${branch} — refusing to push: it would carry commits the run does not own`);
        return notPushed(EXIT_NO_RECORD);
    }
    if (o.requireCi === true) {
        // With a record, the commit that reaches the remote last is the run's own.
        const last = rec?.commits.at(-1) ?? "HEAD";
        const message = git(cwd, ["log", "-1", "--pretty=%B", last]) ?? "";
        if (SKIP_CI_TOKEN.test(message)) {
            log(`HEAD message on ${branch} carries a CI-suppressing token, and this push needs a CI run — refusing`);
            return notPushed(EXIT_SKIP_CI, { skipped: "skip-ci" });
        }
    }
    if (rec !== null)
        return pushOwnCommits(cwd, rec, o, log, notPushed);
    let mergedDev = false;
    if (mode === "feature" && o.requireCi === true && !shared) {
        const top = topLevel(cwd);
        const fetched = fetchDev(top);
        if (!fetched.ok) {
            log(`git fetch ${REMOTE} ${DEV} failed: ${fetched.stderr}`);
            return notPushed(EXIT_FETCH_FAILED);
        }
        const m = mergeDevDocs(top, { branch, generate: true }, log);
        if (m.code !== EXIT.OK)
            return notPushed(m.code, { mergedDev: m.merged });
        mergedDev = m.merged;
    }
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
    const res = runPush(cwd, args, branch);
    if (!res.ok) {
        log(`git ${args.join(" ")} failed: ${res.stderr}`);
        return notPushed(res.lockExit ?? EXIT_PUSH_FAILED, { lockHolder: res.lockHolder });
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
            replayed: false,
            mergedDev,
        },
    };
}
/**
 * `git fetch` of `ref` when it names a branch of origin (`origin/<b>`); null when
 * it names anything else (a SHA, a local branch), which needs no fetch.
 */
export function fetchRemoteRef(cwd, ref) {
    const m = new RegExp(`^${REMOTE}/(.+)$`).exec(ref);
    if (!m)
        return null;
    return runGit(cwd, ["fetch", REMOTE, `+refs/heads/${m[1]}:refs/remotes/${REMOTE}/${m[1]}`]);
}
/** Commits HEAD holds beyond `ref`; 0 when the count cannot be read. */
function commitsAhead(cwd, ref) {
    const n = Number(git(cwd, ["rev-list", "--count", `${ref}..HEAD`]) ?? "0");
    return Number.isFinite(n) ? n : 0;
}
/**
 * `--mode=plain`: one `git push [-u] origin <branch>`, never forced. A feature
 * branch only: dev / main and a branch with nothing beyond `aheadOf` have nothing to ship.
 */
function pushPlain(cwd, branch, o, log, notPushed) {
    if (isSharedBranch(branch)) {
        log(`Nothing to ship: on '${branch}', no feature branch`);
        return notPushed(EXIT_NOTHING_TO_PUSH);
    }
    if (o.aheadOf !== undefined) {
        const fetched = fetchRemoteRef(cwd, o.aheadOf);
        if (fetched !== null && !fetched.ok) {
            log(`git fetch for ${o.aheadOf} failed: ${fetched.stderr} — counting against the local ref`);
        }
        if (commitsAhead(cwd, o.aheadOf) === 0) {
            log(`Nothing to ship: ${branch} has no commits ahead of ${o.aheadOf}`);
            return notPushed(EXIT_NOTHING_TO_PUSH);
        }
    }
    if (o.requireCi === true && SKIP_CI_TOKEN.test(git(cwd, ["log", "-1", "--pretty=%B"]) ?? "")) {
        log(`HEAD message on ${branch} carries a CI-suppressing token, and this push needs a CI run — refusing`);
        return notPushed(EXIT_SKIP_CI, { skipped: "skip-ci" });
    }
    const args = ["push", ...(o.setUpstream === true ? ["-u"] : []), REMOTE, branch];
    const res = runPush(cwd, args, branch);
    if (!res.ok) {
        log(`git ${args.join(" ")} failed: ${res.stderr}`);
        return notPushed(res.lockExit ?? EXIT_PUSH_FAILED, { lockHolder: res.lockHolder });
    }
    log(`pushed ${branch}`);
    return {
        code: EXIT.OK,
        out: {
            pushed: true,
            ref: branch,
            sha: git(cwd, ["rev-parse", "HEAD"]),
            forced: false,
            skipped: null,
            prNumber: null,
            replayed: false,
            mergedDev: false,
        },
    };
}
/**
 * The `key` of an engine-action row for a marker commit this run makes: keyed on the
 * workflow's latest run, in progress or just closed by `workflows close`.
 */
function markerKey(file, workflow, what) {
    const runs = fs.existsSync(file) ? readRuns(file).filter((r) => r.workflow === workflow) : [];
    return actionKey(workflow, Math.max(runs.length, 1), what);
}
/**
 * Make a marker commit once per run: an engine-action row with the same key and
 * message whose commit is still on HEAD means it is already made (`deduped`).
 * `addAll` stages every change first (`git add -A`); the commit is always
 * allowed to be empty. The row is written before the caller pushes.
 */
function markerCommit(cwd, o) {
    const hash = actionHash(o.message);
    const prior = alreadyDone(o.file, o.key, hash);
    if (prior?.ref && runGit(cwd, ["merge-base", "--is-ancestor", prior.ref, "HEAD"]).ok) {
        return { sha: prior.ref, deduped: true };
    }
    if (o.addAll) {
        const added = addAllButCopied(cwd);
        if (!added.ok)
            throw new CommandError(EXIT_PUSH_FAILED, `git add -A failed: ${added.stderr}`);
    }
    const made = runGit(cwd, ["commit", "--allow-empty", "-m", o.message]);
    if (!made.ok) {
        throw new CommandError(EXIT_PUSH_FAILED, `git commit failed: ${made.stderr || made.stdout}`);
    }
    const sha = git(cwd, ["rev-parse", "HEAD"]) ?? "";
    recordAction(o.file, { action: "commit", key: o.key, hash, ref: sha });
    return { sha, deduped: false };
}
const autoRouteSuffix = (labels) => labels.includes(AUTO_LABEL) ? AUTO_ROUTE_SUFFIX : "";
/** A replayed commit that does not apply onto origin/dev without the foreign commits it builds on. */
class ReplayConflict extends Error {
}
/**
 * The `pushToDev` build callback that replays `shas` (oldest first) onto the
 * fresh origin/dev in `dir`, each as a cherry-pick that keeps its message and
 * author and keeps empty commits. A commit that does not apply throws a
 * ReplayConflict naming the conflicting paths, after aborting the cherry-pick.
 */
export function replayBuild(shas) {
    return (dir) => {
        for (const sha of shas) {
            const picked = runGit(dir, ["cherry-pick", "--allow-empty", "--keep-redundant-commits", sha]);
            if (picked.ok)
                continue;
            const paths = (git(dir, ["diff", "--name-only", "--diff-filter=U"]) ?? "")
                .split("\n")
                .filter(Boolean);
            runGit(dir, ["cherry-pick", "--abort"]);
            throw new ReplayConflict(`commit ${sha.slice(0, 12)} does not apply onto ${UPSTREAM} without the local ${DEV} commits it builds on — ${paths.length > 0 ? `conflicts in: ${paths.join(", ")}` : picked.stderr}`);
        }
    };
}
/**
 * Push only the commits an in-place run on dev made (the record's `commits`).
 * Plain push of their tip SHA when origin/dev is an ancestor of local dev and they
 * are exactly what local dev holds beyond it; otherwise (a foreign commit among
 * them, origin/dev moved, or the plain push is rejected) they are replayed onto a
 * fresh origin/dev in the throwaway checkout and pushed from there.
 */
async function pushOwnCommits(cwd, rec, o, log, notPushed) {
    const gone = rec.commits.filter((c) => !runGit(cwd, ["merge-base", "--is-ancestor", c, "HEAD"]).ok);
    if (gone.length > 0) {
        log(`the run's commit(s) ${gone.map((c) => c.slice(0, 12)).join(", ")} are no longer on ${rec.branch} — refusing to push`);
        return notPushed(EXIT_PUSH_FAILED);
    }
    const fetched = fetchDev(cwd);
    if (!fetched.ok) {
        log(`git fetch ${REMOTE} ${DEV} failed: ${fetched.stderr}`);
        return notPushed(EXIT_FETCH_FAILED);
    }
    // Oldest first, minus what origin/dev already has (pushed plain before) and
    // what an earlier replay already landed.
    const mine = new Set(rec.commits);
    const landed = new Set(rec.pushed ?? []);
    const range = runGit(cwd, ["rev-parse", "-q", "--verify", `${rec.startSha}^{commit}`]).ok
        ? `${rec.startSha}..HEAD`
        : "HEAD";
    const pending = (git(cwd, ["rev-list", "--reverse", range]) ?? "")
        .split("\n")
        .filter((c) => mine.has(c) &&
        !landed.has(c) &&
        !runGit(cwd, ["merge-base", "--is-ancestor", c, UPSTREAM]).ok);
    if (pending.length === 0) {
        log("every commit the run made is already on origin/dev — nothing to push");
        return notPushed(EXIT.OK, { skipped: "no-run-commits" });
    }
    const ahead = (git(cwd, ["rev-list", "--reverse", `${UPSTREAM}..HEAD`]) ?? "")
        .split("\n")
        .filter(Boolean);
    // Plain only when origin/dev is an ancestor of local dev (a fast-forward) and
    // the run's commits are all local dev holds beyond it; the explicit SHA keeps
    // a commit made after the check out of the push.
    const fastForward = runGit(cwd, ["merge-base", "--is-ancestor", UPSTREAM, "HEAD"]).ok;
    if (fastForward && ahead.length === pending.length && ahead.every((c, i) => c === pending[i])) {
        const last = pending[pending.length - 1];
        const args = [
            "push",
            ...(o.setUpstream === true ? ["-u"] : []),
            REMOTE,
            `${last}:refs/heads/${rec.branch}`,
        ];
        const res = runPush(cwd, args, rec.branch);
        if (res.ok) {
            log(`pushed ${rec.branch}: the run's ${pending.length} commit(s) are all local dev holds`);
            return {
                code: EXIT.OK,
                out: {
                    pushed: true,
                    ref: rec.branch,
                    sha: last,
                    forced: false,
                    skipped: null,
                    prNumber: null,
                    replayed: false,
                    mergedDev: false,
                },
            };
        }
        if (res.lockExit !== null) {
            log(`git ${args.join(" ")} failed: ${res.stderr}`);
            return notPushed(res.lockExit, { lockHolder: res.lockHolder });
        }
        log(`git ${args.join(" ")} failed: ${res.stderr} — replaying onto a fresh ${UPSTREAM}`);
    }
    const root = repoRoot(cwd);
    let res;
    try {
        res = await pushToDev({
            root,
            dir: landDir(root, rec.fid),
            build: replayBuild(pending),
            log,
        });
    }
    catch (err) {
        if (!(err instanceof ReplayConflict))
            throw err;
        log(`replaying the run's commits onto ${UPSTREAM} stopped: ${err.message}`);
        return notPushed(EXIT_MERGE_CONFLICT);
    }
    switch (res.kind) {
        case "landed":
            markRecordPushed(cwd, rec.fid, pending);
            log(`pushed ${pending.length} commit(s) of the run to ${DEV} as copies on a fresh ${UPSTREAM} (${res.sha.slice(0, 12)}); local ${DEV} still holds the originals beside other commits — resync with: git pull --rebase ${REMOTE} ${DEV}`);
            return {
                code: EXIT.OK,
                out: {
                    pushed: true,
                    ref: rec.branch,
                    sha: res.sha,
                    forced: false,
                    skipped: null,
                    prNumber: null,
                    replayed: true,
                    mergedDev: false,
                },
            };
        case "refused":
            log(`${DEV} refused the push: ${res.stderr}`);
            return notPushed(EXIT_PUSH_FAILED);
        case "push-failed":
            log(`push to ${DEV} failed without a server answer: ${res.stderr}`);
            return notPushed(EXIT_PUSH_FAILED);
        case "exhausted":
            log(`${DEV} moved before each of ${res.attempts} pushes`);
            return notPushed(EXIT_PUSH_FAILED);
        case "fetch-failed":
            log(`git fetch ${REMOTE} ${DEV} failed: ${res.stderr}`);
            return notPushed(EXIT_FETCH_FAILED);
        case "setup-failed":
            log(`throwaway checkout failed: ${res.stderr}`);
            return notPushed(EXIT_PUSH_FAILED);
    }
}
async function pushVerb(ctx) {
    const mode = String(ctx.flags.mode);
    if (!["feature", "abort", "dev", "plain"].includes(mode)) {
        throw new CommandError(EXIT.USAGE, "--mode must be feature, abort, dev, or plain");
    }
    const aheadOf = str(ctx.flags.aheadOf);
    if (aheadOf !== undefined && mode !== "plain") {
        throw new CommandError(EXIT.USAGE, "--ahead-of applies to --mode=plain only");
    }
    const commitMessage = str(ctx.flags.commit);
    let marker;
    if (commitMessage !== undefined) {
        const file = str(ctx.flags.file);
        const workflow = str(ctx.flags.workflow);
        if (mode !== "feature" || file === undefined || workflow === undefined) {
            throw new CommandError(EXIT.USAGE, "--commit needs --mode=feature, --file (status.jsonl) and --workflow");
        }
        const branch = currentBranch(ctx.cwd);
        if (branch === "") {
            ctx.log("no branch checked out (detached HEAD) — refusing to commit and push");
            return EXIT_DETACHED;
        }
        if (isSharedBranch(branch)) {
            ctx.log(`Nothing to ship: --commit makes a marker commit on a feature branch, not '${branch}'`);
            return EXIT_NOTHING_TO_PUSH;
        }
        const message = `${commitMessage}${autoRouteSuffix(ctx.flags.label ?? [])}`;
        if (ctx.flags.requireCi === true && SKIP_CI_TOKEN.test(message)) {
            ctx.log("the --commit message carries a CI-suppressing token, and this push needs a CI run — refusing");
            ctx.emit({
                pushed: false,
                ref: null,
                sha: null,
                forced: false,
                skipped: "skip-ci",
                prNumber: null,
                replayed: false,
                mergedDev: false,
            });
            return EXIT_SKIP_CI;
        }
        marker = markerCommit(ctx.cwd, {
            file: path.resolve(ctx.cwd, file),
            key: markerKey(path.resolve(ctx.cwd, file), workflow, "push-commit"),
            message,
            addAll: true,
        });
        if (marker.deduped)
            ctx.log(`marker commit ${marker.sha.slice(0, 12)} already made this run — pushing it`);
    }
    const r = await pushBranch(ctx.cwd, {
        mode: mode,
        setUpstream: ctx.flags.setUpstream === true,
        aheadOf,
        requireCi: ctx.flags.requireCi === true,
        openPr: str(ctx.flags.openPr),
        fid: str(ctx.flags.fid),
    }, ctx.log);
    // A detached HEAD and a wrong checkout print nothing, as the push never got to run.
    if (r.code !== EXIT_DETACHED && r.code !== EXIT_NOT_DEV) {
        ctx.emit(marker === undefined
            ? { lockHolder: null, ...r.out }
            : { lockHolder: null, ...r.out, commit: marker.sha, deduped: marker.deduped });
    }
    return r.code;
}
function fastForwardVerb(ctx) {
    const onto = String(ctx.flags.onto);
    const top = topLevel(ctx.cwd);
    const fetched = fetchRemoteRef(top, onto);
    if (fetched !== null && !fetched.ok) {
        ctx.log(`git fetch for ${onto} failed: ${fetched.stderr}`);
        return EXIT_FETCH_FAILED;
    }
    if (!runGit(top, ["rev-parse", "-q", "--verify", `${onto}^{commit}`]).ok) {
        ctx.log(`unknown ref: ${onto}`);
        return EXIT_FETCH_FAILED;
    }
    const before = git(top, ["rev-parse", "HEAD"]);
    if (runGit(top, ["merge-base", "--is-ancestor", onto, "HEAD"]).ok) {
        ctx.emit({ moved: false, head: before });
        return EXIT.OK;
    }
    const merged = runGit(top, ["merge", "--ff-only", onto]);
    if (!merged.ok) {
        ctx.log(`local ${currentBranch(top) || "HEAD"} diverged from ${onto} — reconcile, then re-run`);
        return EXIT_DIVERGED;
    }
    const head = git(top, ["rev-parse", "HEAD"]);
    ctx.log(`fast-forwarded onto ${onto} (${head?.slice(0, 12) ?? ""})`);
    ctx.emit({ moved: head !== before, head });
    return EXIT.OK;
}
/** Paths a source-change check leaves out: plan logs and the append-only ledgers. */
const NOT_CODE = [":(exclude)docs/plans", ":(exclude)docs/*.jsonl", ":(exclude).bkit/*.jsonl"];
/** A test file's name at any tier: unit, integration, E2E. */
const TEST_FILE = /\.(?:test|spec)\.|_test\.|(^|\/)test_[^/]*\.py$/;
/** Added-line markers that disable a test: `bkit-slop-type-suppression.mjs`'s set, widened. */
const MARKERS = [
    /\b(?:describe|context|it|test|suite|bench)\.(?:skip|todo|fixme)\b/,
    /(?<!\.)\bx(?:it|describe|test|context)\s*\(/,
    /\bxfail\b/,
    /\bt\.Skip\(/,
    /#\[ignore\b/,
    /@Disabled\b/,
    /@pytest\.mark\.skip\b/,
    /@unittest\.skip\b/,
    /\.skip\s*\(/,
];
/** The markers that apply to an added line of `file`: only a test file carries them. */
const markersFor = (file) => (TEST_FILE.test(file) ? MARKERS : []);
/** A quoted span: a marker inside it is prose or a fixture string, not a call. */
const QUOTED = /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g;
/** A line's trailing comment (`#` is one unless it opens a Rust or C attribute). */
const COMMENT_TAIL = /(?:^|\s)(?:\/\/|#(?!\[))/;
/** A line that opens or continues a block comment. */
const BLOCK_COMMENT = /^\s*(?:\/\*|\*)/;
/** `line` with its quoted spans and comment removed — the part a marker can be a call in. */
function stripProse(line) {
    if (BLOCK_COMMENT.test(line))
        return "";
    const code = line.replace(QUOTED, '""');
    const cut = code.search(COMMENT_TAIL);
    return cut === -1 ? code : code.slice(0, cut);
}
/** An assertion call a change deletes from a test file: `expect(…)`, `assert.equal(…)`, `should(…)`. */
const ASSERTION = /(?<![\w$])(?:expect|assert\w*|should_\w+|should)\s*[(.]/;
/** Python's bare `assert x` statement, which calls nothing but asserts. */
const BARE_ASSERT = /^\s*assert\s+\S/;
/** A commented-out line: its words are prose, not a call. */
const COMMENT = /^\s*(?:\/\/|\/\*|\*|#|--)/;
/** True when a removed `line` takes an assertion, rather than being a comment or an import. */
const isAssertion = (line) => !COMMENT.test(line) && (ASSERTION.test(line) || BARE_ASSERT.test(line));
/** The test at 1-based `at` in `body`: the nearest declaration above it, else `line` itself. */
function testAt(body, line, at) {
    if (body !== null) {
        const lines = body.split(/\r?\n/);
        const from = Math.min(at, lines.length) - 1;
        // A decorator (`@pytest.mark.skip`) names the test it sits on, which is below it.
        if (line.trimStart().startsWith("@")) {
            for (let i = from + 1; i < lines.length; i++) {
                const name = declaredName(lines[i]);
                if (name !== null)
                    return name;
            }
        }
        for (let i = from; i >= 0; i--) {
            const name = declaredName(lines[i]);
            if (name !== null)
                return name;
        }
    }
    return line.trim();
}
const HUNK = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/;
/**
 * The text of the regular file `rel` names under `root`, or null when it is missing, a
 * symlink, or resolves outside `root` — so a diff path never opens a file the repo does not hold.
 */
function inRepoFile(root, rel) {
    const abs = path.resolve(root, rel);
    const inside = (base, p) => {
        const r = path.relative(base, p);
        return r !== "" && !r.startsWith("..") && !path.isAbsolute(r);
    };
    if (!inside(root, abs))
        return null;
    const stat = fs.lstatSync(abs, { throwIfNoEntry: false });
    if (stat === undefined || stat.isSymbolicLink() || !stat.isFile())
        return null;
    // A symlinked parent directory can still lead outside the repo.
    if (!inside(fs.realpathSync(root), fs.realpathSync(abs)))
        return null;
    return fs.readFileSync(abs, "utf-8");
}
/**
 * Unmatched disabled markers and removed assertion occurrences in a unified diff.
 * Exact moves consume one added occurrence; cross-file moves require unchanged test context.
 * Rewritten assertions pair only inside the same file and test. Removed lines retain their
 * original test name; a deleted file uses old line numbers, otherwise the new hunk position.
 */
export function disabledTestsIn(diff, root) {
    const out = [];
    const bodies = new Map();
    const body = (rel) => {
        if (!bodies.has(rel))
            bodies.set(rel, inRepoFile(root, rel));
        return bodies.get(rel);
    };
    const added = [];
    const removed = [];
    const addedMarkers = [];
    const removedMarkers = [];
    const patches = new Map();
    let file = "";
    let from = "";
    let deleted = false;
    let current;
    let next = 0;
    let old = 0;
    for (const raw of diff.split("\n")) {
        if (raw.startsWith("diff --git ")) {
            current = undefined;
            file = "";
            continue;
        }
        if (raw.startsWith("--- ")) {
            from = raw.replace(/^--- (a\/)?/, "");
            continue;
        }
        if (raw.startsWith("+++ ")) {
            const plus = raw.replace(/^\+\+\+ (b\/)?/, "");
            file = plus === "/dev/null" ? from : plus;
            deleted = plus === "/dev/null";
            continue;
        }
        const hunk = HUNK.exec(raw);
        if (hunk !== null) {
            old = Number(hunk[1]);
            next = Number(hunk[3]);
            current = { start: next, count: Number(hunk[4] ?? 1), lines: [] };
            const hunks = patches.get(file) ?? [];
            hunks.push(current);
            patches.set(file, hunks);
            continue;
        }
        if (current === undefined)
            continue;
        if (raw.startsWith("+")) {
            const text = raw.slice(1);
            if (TEST_FILE.test(file)) {
                const occurrence = { file, line: next, text, test: testAt(body(file), text, next) };
                if (markersFor(file).some((m) => m.test(stripProse(text))))
                    addedMarkers.push(occurrence);
                if (isAssertion(text))
                    added.push(occurrence);
            }
            next++;
        }
        else if (raw.startsWith("-")) {
            const text = raw.slice(1);
            current.lines.push(text);
            if (TEST_FILE.test(file)) {
                const occurrence = { file, line: deleted ? old : next, old, text };
                if (isAssertion(text))
                    removed.push(occurrence);
                if (markersFor(file).some((m) => m.test(stripProse(text))))
                    removedMarkers.push(occurrence);
            }
            old++;
        }
        else if (raw.startsWith(" ")) {
            current.lines.push(raw.slice(1));
            next++;
            old++;
        }
    }
    const oldBodies = new Map();
    const original = (r) => {
        if (!oldBodies.has(r.file)) {
            const lines = body(r.file)?.split(/\r?\n/) ?? [];
            for (const hunk of [...(patches.get(r.file) ?? [])].reverse())
                lines.splice(Math.max(0, hunk.start - 1), hunk.count, ...hunk.lines);
            oldBodies.set(r.file, lines.join("\n"));
        }
        return { ...r, test: testAt(oldBodies.get(r.file), r.text, r.old) };
    };
    const contexts = new Map();
    const context = (occurrence, before) => {
        const key = JSON.stringify([before, occurrence.file, occurrence.test]);
        if (!contexts.has(key)) {
            const source = before ? oldBodies.get(occurrence.file) : body(occurrence.file);
            const lines = source == null ? null : testSource(source, occurrence.test);
            contexts.set(key, lines === null
                ? null
                : lines
                    .filter((line) => stripProse(line).trim() !== "" && !isAssertion(stripProse(line)))
                    .map((line) => line
                    .trim()
                    .replace(/\b(it|test|suite|describe|context|bench)\.(?:skip|todo|fixme)\b/g, "$1"))
                    .join("\n"));
        }
        return contexts.get(key);
    };
    const exact = (a, b) => a.text.trim() === b.text.trim() &&
        (a.file === b.file ||
            (a.test === b.test && context(a, true) !== null && context(a, true) === context(b, false)));
    const consume = (available, occurrence, match = exact) => {
        const index = available.findIndex((candidate) => match(occurrence, candidate));
        if (index === -1)
            return false;
        available.splice(index, 1);
        return true;
    };
    for (const r of removedMarkers)
        consume(addedMarkers, original(r), (a, b) => exact(a, b) &&
            a.test === b.test &&
            context(a, true) !== null &&
            context(a, true) === context(b, false));
    const drops = removed.map(original).filter((r) => !consume(added, r));
    for (const r of drops)
        if (!consume(added, r, (a, b) => a.file === b.file && a.test === b.test))
            out.push({ file: r.file, line: r.line, test: r.test });
    out.unshift(...addedMarkers.map(({ file, line, test }) => ({ file, line, test })));
    return out;
}
function scanDiffVerb(ctx) {
    const base = String(ctx.flags.base);
    const pattern = str(ctx.flags.paths);
    const marker = str(ctx.flags.marker);
    const code = ctx.flags.code === true;
    const disabled = ctx.flags.disabledTests === true;
    if ([pattern !== undefined, marker !== undefined, code, disabled].filter(Boolean).length !== 1) {
        throw new CommandError(EXIT.USAGE, "give exactly one of --paths, --marker, --code, --disabled-tests");
    }
    if (disabled && ctx.flags.expectNone === true)
        throw new CommandError(EXIT.USAGE, "--disabled-tests inverts the exit already; drop --expect-none");
    let re;
    if (pattern !== undefined) {
        try {
            re = new RegExp(pattern, "i");
        }
        catch (err) {
            ctx.log(`--paths is not a valid pattern: ${err.message}`);
            return EXIT.USAGE;
        }
    }
    const top = topLevel(ctx.cwd);
    const fetched = fetchRemoteRef(top, base);
    if (fetched !== null && !fetched.ok) {
        ctx.log(`git fetch for ${base} failed: ${fetched.stderr} — diffing against the local ref`);
    }
    if (!runGit(top, ["rev-parse", "-q", "--verify", `${base}^{commit}`]).ok) {
        ctx.log(`unknown base: ${base}`);
        return EXIT_DIFF_FAILED;
    }
    const range = `${base}...HEAD`;
    if (disabled) {
        const diff = quietGit(top, ["diff", "--no-renames", range, "--", ".", ":(exclude)docs/plans"]);
        if (!diff.ok) {
            ctx.log(`git diff ${range} failed: ${diff.stderr}`);
            return EXIT_DIFF_FAILED;
        }
        const hits = disabledTestsIn(diff.stdout, top);
        const files = [...new Set(hits.map((h) => h.file))];
        ctx.emit({ found: hits.length > 0, paths: files, disabled: hits });
        if (hits.length > 0)
            ctx.log(`disabled tests or removed assertions:\n${hits.map((h) => `${h.file}:${h.line} — ${h.test}`).join("\n")}`);
        return hits.length > 0 ? EXIT.NO : EXIT.OK;
    }
    let paths;
    if (marker !== undefined) {
        const diff = quietGit(top, ["diff", "--no-renames", range, "--", ".", ":(exclude)docs/plans"]);
        if (!diff.ok) {
            ctx.log(`git diff ${range} failed: ${diff.stderr}`);
            return EXIT_DIFF_FAILED;
        }
        const hits = new Set();
        let file = "";
        for (const line of diff.stdout.split("\n")) {
            if (line.startsWith("+++ ")) {
                file = line.replace(/^\+\+\+ (b\/)?/, "");
                continue;
            }
            if (line.startsWith("+") && line.includes(marker))
                hits.add(file);
        }
        paths = [...hits];
    }
    else {
        const diff = quietGit(top, [
            "diff",
            "--name-only",
            "-z",
            "--no-renames",
            range,
            ...(code ? ["--", ".", ...NOT_CODE] : []),
        ]);
        if (!diff.ok) {
            ctx.log(`git diff ${range} failed: ${diff.stderr}`);
            return EXIT_DIFF_FAILED;
        }
        paths = diff.stdout.split("\0").filter(Boolean);
        if (re !== undefined)
            paths = paths.filter((p) => re.test(p));
    }
    ctx.emit({ found: paths.length > 0, paths });
    if (ctx.flags.expectNone === true) {
        if (paths.length > 0) {
            ctx.log(marker !== undefined
                ? `added lines still carry ${marker} in: ${paths.join(", ")}`
                : `expected no match, found: ${paths.join(", ")}`);
        }
        return paths.length > 0 ? EXIT.NO : EXIT.OK;
    }
    return paths.length > 0 ? EXIT.OK : EXIT.NO;
}
async function forceBuildVerb(ctx) {
    const f = ctx.flags;
    const fid = String(f.fid);
    const file = path.resolve(ctx.cwd, String(f.file));
    const workflow = String(f.workflow);
    const openPrFlag = str(f.openPr);
    if (openPrFlag !== undefined && openPrFlag !== "none" && !/^[1-9][0-9]*$/.test(openPrFlag)) {
        throw new CommandError(EXIT.USAGE, `--open-pr must be a PR number or none, got "${openPrFlag}"`);
    }
    const branch = currentBranch(ctx.cwd);
    if (branch === "") {
        ctx.log("no branch checked out (detached HEAD) — refusing to force a build");
        return EXIT_DETACHED;
    }
    if (isSharedBranch(branch)) {
        ctx.log(`Nothing to ship: force-build marks a feature branch, not '${branch}'`);
        return EXIT_NOTHING_TO_PUSH;
    }
    // (1) The PR title: CI reads the marker from it on pull_request events.
    const viaMcp = (why) => {
        ctx.log(`${why} — add " bkit ${FORCE_BUILD}" to the open PR's title through update_pull_request (skip when no PR is open), then re-run with --title-set`);
        return EXIT.USE_MCP;
    };
    let prNumber = null;
    let titleChanged = false;
    if (f.titleSet !== true && openPrFlag !== "none") {
        const probe = probePr(ctx.cwd, openPrFlag === undefined
            ? { head: branch, state: "open" }
            : { number: openPrFlag, state: "open" });
        if (probe.kind !== "ok")
            return viaMcp(probe.message);
        if (probe.pr) {
            prNumber = probe.pr.number;
            if (!probe.pr.title.includes(FORCE_BUILD)) {
                const next = `${probe.pr.title} bkit ${FORCE_BUILD}`;
                const edit = runGh(ctx.cwd, ["pr", "edit", String(prNumber), "--title", next]);
                if (!edit.ok) {
                    return viaMcp(ghUnavailable(edit)
                        ? "gh unavailable for gh pr edit"
                        : `gh pr edit ${prNumber} failed: ${edit.stderr}`);
                }
                titleChanged = true;
                ctx.log(`PR #${prNumber} title now carries ${FORCE_BUILD}`);
            }
        }
    }
    // (2) The empty marker commit, once per run; its push is the event that starts the run.
    const message = `chore(${fid}): force build bkit ${FORCE_BUILD}${autoRouteSuffix(f.label ?? [])}`;
    const marker = markerCommit(ctx.cwd, {
        file,
        key: markerKey(file, workflow, "force-build"),
        message,
        addAll: false,
    });
    if (marker.deduped)
        ctx.log(`force-build commit ${marker.sha.slice(0, 12)} already made this run — pushing it`);
    const pushed = await pushBranch(ctx.cwd, { mode: "feature", requireCi: true }, ctx.log);
    ctx.emit({
        prNumber,
        titleChanged,
        commit: marker.sha,
        deduped: marker.deduped,
        pushed: pushed.out.pushed,
        ref: pushed.out.ref,
        sha: pushed.out.sha,
    });
    return pushed.code;
}
/** The paths a feature branch must hold dev's commits for before GitHub reads it: docs/ and every ledger. */
const DEV_DOC_PATHSPECS = ["docs/", ...LEDGERS.map((l) => `:(glob)${l}`)];
/** Commits on origin/dev not in `head` that touch docs/ or a ledger. */
function docsBehindOf(top, head) {
    return Number(git(top, ["rev-list", "--count", `${head}..${UPSTREAM}`, "--", ...DEV_DOC_PATHSPECS]) ?? "0");
}
/**
 * The `docs` merge: bring dev's docs/ and ledger commits onto the feature branch
 * when it is behind them, so GitHub, which ignores `merge=union`, reads no ledger
 * conflict and CI runs. Nothing on a shared branch or when docs/ is current.
 */
function mergeDevDocs(top, o, log) {
    const docsBehind = docsBehindOf(top, "HEAD");
    const current = isSharedBranch(o.branch) || docsBehind === 0;
    if (!current)
        log(`docs/ and the ledgers are ${docsBehind} commit(s) behind ${UPSTREAM} — merging it in`);
    const merged = mergeDev(top, { branch: o.branch, policy: "docs", generate: o.generate, current }, log);
    return { ...merged, docsBehind };
}
/**
 * Run the consumer's `bkit:generate` (`.bkit/workflows.md` § Local gate scripts)
 * and commit what it changed (`commitWhatChanged`). null when the script is undeclared.
 */
function regenerate(top, branch, log, o = {}) {
    if (!generateDeclared(top))
        return null;
    const fid = o.fid ?? branch.replace(/^feat\//, "");
    const message = `chore(${fid}): regenerate after merging ${DEV}`;
    const done = commitWhatChanged(top, "bkit:generate", () => runGenerate(top, log, "after the merge"), message, log);
    if (done.outcome === "committed")
        log(`committed bkit:generate's output after merging ${UPSTREAM}`);
    return done.outcome !== "failed";
}
/** Whether `top`'s package.json declares a non-empty `bkit:generate` script. */
function generateDeclared(top) {
    const pkg = readPackageJson(top);
    const scripts = pkg.ok ? pkg.pkg.scripts : undefined;
    return (typeof scripts === "object" &&
        scripts !== null &&
        typeof scripts["bkit:generate"] === "string" &&
        scripts["bkit:generate"] !== "");
}
/** Run `bkit:generate` in `top`; false when it failed, logged with its output's last lines. */
function runGenerate(top, log, when) {
    return runLogged(top, scriptCommand("bkit:generate"), log, when);
}
/** Run `argv` in `top`; false when it failed, logged with its output's last lines. */
function runLogged(top, argv, log, when) {
    const res = spawnSync(argv[0], argv.slice(1), {
        cwd: top,
        encoding: "utf-8",
        stdio: ["ignore", "pipe", "pipe"],
        maxBuffer: 1 << 26,
    });
    if (res.status === 0)
        return true;
    log(`${argv.join(" ")} exited ${String(res.status ?? res.error?.message)} ${when}`);
    const out = `${res.stdout ?? ""}${res.stderr ?? ""}`.trim();
    if (out !== "")
        for (const line of out.split("\n").slice(-20))
            log(`  ${line}`);
    return false;
}
/**
 * Each changed path in `top` (the entries worktree setup copies in left out), with a hash
 * of its content ("" when deleted); null when git could not run. Read raw: `--porcelain`
 * lines start with a status column that may be a space.
 */
function changedPaths(top) {
    const res = spawnSync("git", ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--", ".", ...copyExcludes(top)], { cwd: top, env: gitEnv(), encoding: "utf-8", maxBuffer: OUTPUT_LIMIT });
    if (res.error || res.status !== 0)
        return null;
    const out = new Map();
    const entries = res.stdout.split("\0");
    for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        if (entry.length < 4)
            continue;
        const file = entry.slice(3);
        // A staged rename or copy carries its source as the next entry.
        if (entry[0] === "R" || entry[0] === "C")
            i++;
        const abs = path.join(top, file);
        out.set(file, fs.existsSync(abs) && fs.statSync(abs).isFile()
            ? createHash("sha256").update(fs.readFileSync(abs)).digest("hex")
            : "");
    }
    return out;
}
/**
 * What a generator changed between two `changedPaths` reads: `rewritten` were already
 * changed and changed again, so they cannot be told apart from work that is not
 * generated; `added` are the paths only the generator changed, sorted.
 */
function changedSince(dirty, after) {
    return {
        rewritten: [...after].filter(([f, h]) => dirty.has(f) && dirty.get(f) !== h).map(([f]) => f),
        added: [...after.keys()].filter((f) => !dirty.has(f)).sort(),
    };
}
/** Commit exactly `paths`, deletions included; false when the add or the commit failed. */
function commitPaths(top, paths, message) {
    return (runGit(top, ["add", "-A", "--", ...paths]).ok &&
        quietGit(top, ["commit", "-q", "-m", message, "--", ...paths]).ok);
}
/**
 * Run a generator (`run`, named `what` in the log) in `top` and commit exactly the paths
 * it changed as `message`, so uncommitted work already in the tree stays out of the
 * commit. `failed` (logged) when `git status` or the commit failed, `run` failed, or it
 * changed a path that already held uncommitted changes again: that cannot be told apart
 * from work that is not generated. `unchanged` when it changed nothing.
 */
function commitWhatChanged(top, what, run, message, log) {
    const failed = { outcome: "failed", paths: [] };
    const dirty = changedPaths(top);
    if (dirty === null) {
        log(`git status failed — ${what} not run`);
        return failed;
    }
    if (!run())
        return failed;
    const after = changedPaths(top);
    if (after === null) {
        log(`git status failed after ${what}`);
        return failed;
    }
    const { rewritten, added } = changedSince(dirty, after);
    if (rewritten.length > 0) {
        for (const f of rewritten)
            log(`  ${f}`);
        log(`${what} changed paths that already held uncommitted changes — nothing committed`);
        return failed;
    }
    if (added.length === 0)
        return { outcome: "unchanged", paths: [] };
    if (!commitPaths(top, added, message)) {
        log(`committing the output of ${what} failed`);
        return failed;
    }
    return { outcome: "committed", paths: added };
}
/**
 * Rebuild each register a conflict settled on dev's copy (`REGISTERS`), or whose
 * generated block a conflicted doc took from dev, and commit only the paths the rebuild
 * changed. null when none was settled, or no settled register's script exists in the
 * repo; false when a rebuild failed, or changed a path that already held uncommitted
 * changes. A register not rebuilt keeps dev's copy: the pre-push gate, CI and ship's
 * `bkit:generate` still judge it.
 */
function rebuildRegisters(top, resolved, commitMessage, log) {
    const embeds = embedDocs(top);
    const settled = [
        ...new Set(resolved.flatMap((r) => {
            const register = r.how === "register" ? r.path : r.how === "embed" ? embeds.get(r.path) : undefined;
            return register === undefined ? [] : [register];
        })),
    ];
    const due = settled.filter((f) => fs.existsSync(path.join(top, REGISTERS[f].script)));
    for (const f of settled)
        if (!due.includes(f))
            log(`NOT REBUILT ${f} — ${REGISTERS[f].script} is absent`);
    if (due.length === 0)
        return null;
    const which = due.join(", ");
    const rebuild = () => due.every((f) => {
        const { script, args } = REGISTERS[f];
        if (runLogged(top, ["bash", script, ...args], log, `rebuilding ${f}`))
            return true;
        log(`NOT REBUILT ${f} — it keeps ${DEV}'s copy`);
        return false;
    });
    const done = commitWhatChanged(top, `the rebuild of ${which}`, rebuild, commitMessage(due), log);
    if (done.outcome === "failed")
        return false;
    log(done.outcome === "unchanged"
        ? `REBUILT ${which} — ${DEV}'s copy was already current`
        : `REBUILT ${which} — committed as ${git(top, ["rev-parse", "HEAD"])}`);
    return true;
}
/**
 * Ship's regenerate (`.bkit/workflows.md` § `/bkit-ship`): run a declared `bkit:generate`
 * on the checked-out feature branch and commit only the paths it changed
 * (`commitWhatChanged`), so the run's own uncommitted bookkeeping (status.jsonl) stays out
 * of the commit. Step 10 runs it when every failed CI step is one it fixes (`--attempt`).
 */
function regenerateVerb(ctx) {
    const top = topLevel(ctx.cwd);
    const branch = currentBranch(top);
    if (branch === "") {
        ctx.log("no branch checked out (detached HEAD) — cannot regenerate");
        return EXIT_DETACHED;
    }
    if (isSharedBranch(branch))
        throw new CommandError(EXIT.USAGE, `regenerate runs on a feature branch, never on ${branch}`);
    const attempt = str(ctx.flags.attempt);
    if (attempt !== undefined && !/^[1-9]\d*$/.test(attempt))
        throw new CommandError(EXIT.USAGE, "--attempt must be a whole number >= 1");
    const fid = str(ctx.flags.fid) || branch.replace(/^feat\//, "");
    const before = git(top, ["rev-parse", "HEAD"]);
    const out = { outcome: "undeclared", head: before, paths: [] };
    if (!generateDeclared(top)) {
        ctx.log("bkit:generate is not declared — nothing regenerated");
        ctx.emit(out);
        return EXIT.OK;
    }
    const message = attempt === undefined
        ? `chore(${fid}): regenerate before re-validating`
        : `fix(${fid}): regenerate attempt ${attempt}`;
    const done = commitWhatChanged(top, "bkit:generate", () => runGenerate(top, ctx.log, "on the branch"), message, ctx.log);
    if (done.outcome === "failed")
        return EXIT_GENERATE_FAILED;
    out.paths = done.paths;
    if (done.outcome === "unchanged") {
        out.outcome = "unchanged";
        ctx.log("bkit:generate changed nothing");
        ctx.emit(out);
        return EXIT.OK;
    }
    out.outcome = "committed";
    out.head = git(top, ["rev-parse", "HEAD"]);
    for (const f of out.paths)
        ctx.log(`regenerated ${f}`);
    ctx.log(`committed bkit:generate's output as ${out.head}`);
    const statusFile = str(ctx.flags.file);
    if (statusFile !== undefined && before !== null && out.head !== null) {
        recordAction(path.resolve(ctx.cwd, statusFile), {
            action: "regenerate",
            key: actionKey("regenerate", before),
            hash: actionHash(`${before}..${out.head}`),
            ref: out.head,
        });
    }
    ctx.emit(out);
    return EXIT.OK;
}
/** Whether a merge is in progress in `top` (its MERGE_HEAD exists). */
function mergeInProgress(top) {
    const p = git(top, ["rev-parse", "--path-format=absolute", "--git-path", "MERGE_HEAD"]);
    return p !== null && fs.existsSync(p);
}
/** Settle one conflicted path under `policy`, staging it when it is resolved. */
function resolvePath(top, file, policy, embeds) {
    const kind = classifyConflict(file, embeds);
    if (kind === "ledger") {
        const union = unionResolve(top, file);
        if (!union.ok)
            return { refused: union.problem };
        return runGit(top, ["add", "--", file]).ok ? "union" : { refused: "git add failed" };
    }
    if (kind === "register") {
        const settled = registerResolve(top, file, "theirs");
        if (!settled.ok)
            return { refused: settled.problem };
        return runGit(top, ["add", "--", file]).ok ? "register" : { refused: "git add failed" };
    }
    if (kind === "embed") {
        const settled = embedResolve(top, file, embeds.get(file), "theirs");
        if (!settled.ok)
            return { refused: settled.problem };
        return runGit(top, ["add", "--", file]).ok ? "embed" : { refused: "git add failed" };
    }
    if (kind === "record") {
        const settled = recordResolve(top, "theirs");
        if (!settled.ok)
            return { refused: settled.problem };
        return runGit(top, ["add", "--", file]).ok ? "record" : { refused: "git add failed" };
    }
    if (policy === "docs") {
        if (!file.startsWith("docs/"))
            return { refused: "outside docs/ and the ledgers" };
        // In a merge `--theirs` is the branch merged in: dev. Dev deleting the file
        // leaves no stage 3, and taking dev's side means deleting it here too.
        const devHasIt = runGit(top, ["cat-file", "-e", `:3:${file}`]).ok;
        const ok = devHasIt
            ? runGit(top, ["checkout", "--theirs", "--", file]).ok && runGit(top, ["add", "--", file]).ok
            : runGit(top, ["rm", "-q", "--", file]).ok;
        return ok ? "dev" : { refused: `taking ${DEV}'s side failed` };
    }
    if (kind === "lockfile") {
        if (!lockfileResolve(top, file, "theirs"))
            return { refused: "lockfile regenerate failed" };
        return runGit(top, ["add", "--", file]).ok ? "lockfile" : { refused: "git add failed" };
    }
    return "pending";
}
const RESOLVED_HOW = {
    union: "union (append-only ledger)",
    dev: `took ${DEV}`,
    lockfile: `lockfile regenerated from ${DEV}'s copy`,
    register: `took ${DEV}'s copy of a generated register`,
    embed: `took ${DEV}'s copy of the generated block, merged the rest`,
    record: `merged the install record entry by entry, ${DEV}'s value where both changed`,
};
/**
 * Merge origin/dev (already fetched) into the checked-out feature branch under
 * `policy`. A merge in progress at the start is continued: its remaining conflicts
 * are settled and it is committed, which is how a `full` hand resolution finishes
 * (`git add`, then run again). `full` also commits the tree's uncommitted work first
 * (ship's open status.jsonl). No commit carries a skip token: the merge brings dev's
 * code, and the pre-push hook refuses a skip-token head that carries code while the
 * PR is open. Never a rebase: GitHub ignores `merge=union`, so a
 * branch rebased onto dev still shows as conflicting on every ledger both sides
 * appended to, while the merge commit is what GitHub's own merge would compute.
 */
function mergeDev(top, o, log) {
    const out = {
        code: EXIT.OK,
        outcome: "merged",
        merged: false,
        carried: null,
        resolved: [],
        pending: [],
        aborted: false,
        generated: null,
        rebuilt: null,
        before: null,
    };
    const full = o.policy === "full";
    const target = o.target ?? UPSTREAM;
    const targetName = o.target ?? DEV;
    const fid = o.fid ?? o.branch.replace(/^feat\//, "");
    const refuse = (why) => {
        const abort = runGit(top, ["merge", "--abort"]);
        out.aborted = abort.ok;
        log(abort.ok ? `${why} — merge aborted` : `${why} — git merge --abort failed: ${abort.stderr}`);
        return { ...out, code: EXIT_MERGE_CONFLICT, outcome: "refused" };
    };
    if (mergeInProgress(top)) {
        const merging = git(top, ["rev-parse", "--verify", "MERGE_HEAD"]);
        const expected = git(top, ["rev-parse", "--verify", `${target}^{commit}`]);
        if (merging === null || expected === null || merging !== expected) {
            log(`the pending merge targets ${merging ?? "an unreadable ref"}, not ${target}; finish that merge first`);
            return { ...out, code: EXIT_REFUSED, outcome: "refused" };
        }
        out.before = git(top, ["rev-parse", "--verify", "--quiet", "ORIG_HEAD"]);
        log(`a merge of ${target} is in progress — continuing it`);
    }
    else {
        if (o.current)
            return { ...out, outcome: "current" };
        if (full && hasLeftovers(top)) {
            const message = `chore(${fid}): carry uncommitted work before merging ${targetName}`;
            if (!addAllButCopied(top).ok || !quietGit(top, ["commit", "-q", "-m", message]).ok) {
                log("the uncommitted work could not be committed before the merge");
                return { ...out, code: EXIT_REFUSED, outcome: "refused" };
            }
            out.carried = git(top, ["rev-parse", "HEAD"]);
            log(`committed the uncommitted work as ${out.carried} before merging ${target}`);
        }
        out.before = git(top, ["rev-parse", "HEAD"]);
        const message = `chore(${fid}): merge ${targetName}`;
        const merge = quietGit(top, ["merge", "--no-edit", "-m", message, target]);
        if (!merge.ok && !mergeInProgress(top)) {
            // Not a conflict: git refused to start the merge at all.
            log(`git merge ${target} failed: ${merge.stderr.trim()}`);
            return { ...out, code: EXIT_MERGE_CONFLICT, outcome: "refused" };
        }
    }
    if (mergeInProgress(top)) {
        const embeds = embedDocs(top);
        for (const f of unmergedPaths(top)) {
            const r = resolvePath(top, f, o.policy, embeds);
            if (typeof r === "object")
                return refuse(`${f}: ${r.refused}`);
            if (r === "pending") {
                out.pending.push(f);
                continue;
            }
            out.resolved.push({ path: f, how: r });
            log(`RESOLVED ${f} — ${RESOLVED_HOW[r]}`);
        }
        if (out.pending.length > 0) {
            for (const p of out.pending)
                log(`PENDING ${p} — needs a hand resolution; run again after git add`);
            return { ...out, code: EXIT_HAND_RESOLVE, outcome: "pending" };
        }
        if (!quietGit(top, ["commit", "--no-edit"]).ok)
            return refuse("the merge could not be committed");
    }
    out.merged = true;
    log(`merged ${target} into ${o.branch} as ${git(top, ["rev-parse", "HEAD"])}`);
    if (o.generate) {
        out.rebuilt = rebuildRegisters(top, out.resolved, (files) => `chore(${fid}): rebuild ${files.join(" ")} after merging ${targetName}`, log);
        out.generated = regenerate(top, o.branch, log, { fid });
        if (out.generated === false)
            out.code = EXIT_GENERATE_FAILED;
    }
    return out;
}
/**
 * An engine-action row for a merge of origin/dev that moved the branch, keyed on
 * the tip it started from, so the run's record shows the integration. Nothing when
 * HEAD did not move.
 */
function recordMerge(statusFile, before, after) {
    if (before === null || after === null || before === after)
        return;
    recordAction(statusFile, {
        action: "merge",
        key: actionKey("merge", before),
        hash: actionHash(`${before}..${after}`),
        ref: after,
    });
}
function reconcileFeature(ctx, top, branch, observed) {
    if (branch === "" || isSharedBranch(branch)) {
        throw new CommandError(EXIT.USAGE, "feature reconciliation needs a checked-out feature branch");
    }
    const remote = `${REMOTE}/${branch}`;
    const probeResult = spawnSync("git", ["ls-remote", "--exit-code", "--heads", REMOTE, branch], {
        cwd: top,
        encoding: "utf-8",
        env: gitEnv(),
    });
    const probe = { ok: probeResult.status === 0, stderr: probeResult.stderr ?? "" };
    if (!probe.ok && probeResult.status !== 2) {
        ctx.log(`cannot fetch ${remote}: ${probe.stderr}`);
        return EXIT_FETCH_FAILED;
    }
    if (probe.ok) {
        const fetched = fetchRemoteRef(top, remote);
        if (fetched === null || !fetched.ok) {
            ctx.log(`git fetch ${remote} failed: ${fetched?.stderr ?? "unknown remote ref"}`);
            return EXIT_FETCH_FAILED;
        }
        observed.remoteHead = git(top, [
            "rev-parse",
            "--verify",
            "--quiet",
            `refs/remotes/${remote}^{commit}`,
        ]);
        if (observed.remoteHead === null) {
            ctx.log(`cannot read the freshly fetched feature ${remote}`);
            return EXIT_FETCH_FAILED;
        }
    }
    assertShipEligible(top, "HEAD");
    if (probe.ok)
        assertShipEligible(top, remote);
    const headFlag = str(ctx.flags.head);
    if (headFlag !== undefined &&
        git(top, ["rev-parse", "--verify", "--quiet", `${headFlag}^{commit}`]) === null) {
        throw new CommandError(EXIT.USAGE, `--head ${headFlag} does not name a commit`);
    }
    if (!mergeInProgress(top) && hasLeftovers(top)) {
        const statusFile = str(ctx.flags.file);
        const relative = statusFile && path.relative(top, path.resolve(ctx.cwd, statusFile)).split(path.sep).join("/");
        const scope = relative && /^docs\/plans\/(\d{6})\/logs\/([^/]+)\/status\.jsonl$/.exec(relative);
        const fid = str(ctx.flags.fid) || branch.replace(/^feat\//, "");
        if (!scope || scope[2] !== fid) {
            ctx.log("feature branch has uncommitted work — commit that work before reconciliation");
            return EXIT_REFUSED;
        }
        const outside = runGit(top, [
            "status",
            "--porcelain=v1",
            "-z",
            "--untracked-files=all",
            "--",
            ".",
            ...copyExcludes(top),
            ...bookPathspecs(scope[1], fid, "core").map((spec) => `:(exclude)${spec}`),
        ]);
        if (!outside.ok || outside.stdout !== "") {
            ctx.log("feature branch has unrelated uncommitted work — commit that work before reconciliation");
            return EXIT_REFUSED;
        }
        const carried = commitBookkeeping({
            root: top,
            month: scope[1],
            fid,
            scope: "core",
            mode: "commit",
            message: `chore(${fid}): carry ship bookkeeping before reconciliation`,
        }, ctx.log);
        if (carried.outcome !== "committed") {
            ctx.log("the workflow bookkeeping could not be committed before reconciliation");
            return EXIT_REFUSED;
        }
    }
    const fid = str(ctx.flags.fid) || branch.replace(/^feat\//, "");
    const merge = (target, current) => {
        const m = mergeDev(top, { branch, target, policy: "full", fid, generate: true, current }, ctx.log);
        const after = git(top, ["rev-parse", "HEAD"]);
        const file = str(ctx.flags.file);
        if (m.merged && file !== undefined)
            recordMerge(path.resolve(ctx.cwd, file), m.before, after);
        if (m.code !== EXIT.OK) {
            ctx.emit({ branch, head: after, remoteHead: observed.remoteHead, ...m, target });
        }
        return m.code;
    };
    if (mergeInProgress(top)) {
        const pending = git(top, ["rev-parse", "--verify", "MERGE_HEAD"]);
        if (pending === null ||
            !probe.ok ||
            !runGit(top, ["merge-base", "--is-ancestor", pending, remote]).ok) {
            ctx.log("the pending merge is not the fetched feature merge — finish it before reconciliation");
            return EXIT_REFUSED;
        }
        const code = merge(pending, false);
        if (code !== EXIT.OK)
            return code;
    }
    if (probe.ok) {
        const local = git(top, ["rev-parse", "HEAD"]);
        if (local === null)
            return EXIT_REFUSED;
        const ancestor = (a, b) => spawnSync("git", ["merge-base", "--is-ancestor", a, b], { cwd: top, env: gitEnv() }).status;
        const behind = ancestor("HEAD", remote);
        const ahead = ancestor(remote, "HEAD");
        if ((behind !== 0 && behind !== 1) || (ahead !== 0 && ahead !== 1)) {
            ctx.log(`cannot compare the local feature with ${remote}`);
            return EXIT_REFUSED;
        }
        if (behind === 0 && ahead !== 0) {
            const ff = quietGit(top, ["merge", "--ff-only", remote]);
            if (!ff.ok) {
                ctx.log(`cannot fast-forward the feature: ${ff.stderr}`);
                return EXIT_REFUSED;
            }
            const file = str(ctx.flags.file);
            if (file !== undefined)
                recordMerge(path.resolve(ctx.cwd, file), local, git(top, ["rev-parse", "HEAD"]));
        }
        else if (ahead !== 0) {
            const code = merge(remote, false);
            if (code !== EXIT.OK)
                return code;
        }
    }
    assertShipEligible(top, "HEAD");
    const unpublished = !probe.ok || commitsAhead(top, remote) > 0;
    if (unpublished && SKIP_CI_TOKEN.test(git(top, ["log", "-1", "--format=%B"]) ?? "")) {
        const trigger = quietGit(top, [
            "commit",
            "--allow-empty",
            "-m",
            `chore(${fid}): validate reconciled feature`,
        ]);
        if (!trigger.ok) {
            ctx.log(`cannot create a CI-running feature head: ${trigger.stderr}`);
            return EXIT_REFUSED;
        }
    }
    return EXIT.OK;
}
/** Merge-aware coverage identity; omit a dev merge only when Git proves its result automatic. */
function featureCodeState(top, head, month, fid) {
    const commits = runGit(top, ["rev-list", "--parents", `${UPSTREAM}..${head}`]);
    if (!commits.ok)
        throw new CommandError(EXIT_DIFF_FAILED, commits.stderr);
    const retained = [];
    for (const line of commits.stdout.split("\n").filter(Boolean)) {
        const [sha, first, second, ...other] = line.split(" ");
        if (!sha || !first)
            throw new CommandError(EXIT_DIFF_FAILED, "feature coverage needs readable commit parents");
        const bookkeeping = checkOnlyBookkeeping(top, { month, fid, from: first, to: sha });
        if (bookkeeping.kind === "ok")
            continue;
        if (bookkeeping.kind !== "outside")
            throw new CommandError(EXIT_DIFF_FAILED, `feature coverage classification: ${bookkeeping.kind}`);
        if (second && other.length === 0) {
            const devParent = runGit(top, ["merge-base", "--is-ancestor", second, UPSTREAM]);
            if (devParent.ok) {
                const automatic = git(top, ["merge-tree", "--write-tree", first, second]);
                const tree = git(top, ["rev-parse", `${sha}^{tree}`]);
                if (automatic && tree && automatic.split("\n")[0] === tree)
                    continue;
            }
        }
        retained.push(sha);
    }
    return `v1:${retained.sort().join(",")}`;
}
function syncVerb(ctx) {
    const mergeDocs = ctx.flags.mergeDocs === true;
    const merge = ctx.flags.merge === true;
    const reconcile = ctx.flags.reconcileFeature === true;
    const featureState = ctx.flags.featureState === true;
    const month = str(ctx.flags.month);
    const coverageFid = str(ctx.flags.fid);
    if (featureState &&
        (mergeDocs || merge || reconcile || !month || !/^\d{6}$/.test(month) || !coverageFid))
        throw new CommandError(EXIT.USAGE, "--feature-state needs --month=YYYYMM and --fid, separately from reconciliation or merging");
    const targetFlag = str(ctx.flags.target);
    if (targetFlag !== undefined && (!merge || targetFlag === "" || targetFlag.startsWith("-")))
        throw new CommandError(EXIT.USAGE, "--target needs --merge and a commit ref");
    if (reconcile && (mergeDocs || merge))
        throw new CommandError(EXIT.USAGE, "give --reconcile-feature separately from --merge or --merge-docs");
    const headFlag = str(ctx.flags.head);
    if ((mergeDocs || merge) && headFlag !== undefined) {
        throw new CommandError(EXIT.USAGE, "--merge and --merge-docs merge into HEAD; give --head or one of them, not both");
    }
    if (mergeDocs && merge)
        throw new CommandError(EXIT.USAGE, "give --merge or --merge-docs, not both");
    const sentinel = str(ctx.flags.sentinel);
    const sentinelPath = sentinel === undefined ? undefined : path.resolve(ctx.cwd, sentinel);
    if (merge && sentinelPath)
        fs.rmSync(sentinelPath, { force: true });
    const top = topLevel(ctx.cwd);
    const target = targetFlag === undefined
        ? undefined
        : git(top, ["rev-parse", "--verify", "--quiet", `${targetFlag}^{commit}`]);
    if (targetFlag !== undefined && !target)
        throw new CommandError(EXIT.USAGE, `--target ${targetFlag} does not name a commit`);
    const fetch = fetchDev(top);
    if (!fetch.ok) {
        ctx.log(`git fetch ${REMOTE} ${DEV} failed: ${fetch.stderr}`);
        return EXIT_FETCH_FAILED;
    }
    const branch = currentBranch(top);
    const observed = { remoteHead: null };
    if (reconcile) {
        const code = reconcileFeature(ctx, top, branch, observed);
        if (code !== EXIT.OK)
            return code;
    }
    const head = git(top, [
        "rev-parse",
        "--verify",
        "--quiet",
        `${reconcile ? "HEAD" : (headFlag ?? "HEAD")}^{commit}`,
    ]);
    if (!head)
        throw new CommandError(EXIT.USAGE, `--head ${headFlag ?? "HEAD"} does not name a commit`);
    const ancestor = spawnSync("git", ["merge-base", "--is-ancestor", UPSTREAM, head], {
        cwd: top,
        env: gitEnv(),
    });
    if (ancestor.status !== 0 && ancestor.status !== 1) {
        throw new CommandError(EXIT.USAGE, `cannot compare ${UPSTREAM} with ${head}: ${String(ancestor.stderr).trim()}`);
    }
    const count = (args) => Number(git(top, ["rev-list", "--count", ...args]) ?? "0");
    const behind = count([`${head}..${UPSTREAM}`]);
    const docsBehind = docsBehindOf(top, head);
    const out = {
        branch: branch === "" ? null : branch,
        head,
        ...(reconcile ? { remoteHead: observed.remoteHead, reconciledHead: head } : {}),
        ...(featureState
            ? { featureCodeState: featureCodeState(top, head, month, coverageFid) }
            : {}),
        basePath: ancestor.status === 0 ? "A" : "B",
        behind,
        docsBehind,
        merged: false,
        resolved: [],
        generated: null,
        rebuilt: null,
    };
    if (mergeDocs) {
        if (branch === "") {
            ctx.log("no branch checked out (detached HEAD) — cannot merge dev's docs");
            return EXIT_DETACHED;
        }
        const m = mergeDevDocs(top, { branch, generate: true }, ctx.log);
        if (m.code === EXIT_MERGE_CONFLICT)
            return m.code;
        out.merged = m.merged;
        out.resolved = m.resolved;
        out.generated = m.generated;
        out.rebuilt = m.rebuilt;
        if (m.merged)
            out.head = git(top, ["rev-parse", "HEAD"]) ?? head;
        ctx.emit(out);
        return m.code;
    }
    if (merge) {
        if (branch === "") {
            ctx.log(`no branch checked out (detached HEAD) — cannot merge ${UPSTREAM}`);
            return EXIT_DETACHED;
        }
        if (isSharedBranch(branch)) {
            throw new CommandError(EXIT.USAGE, `--merge merges ${UPSTREAM} into a feature branch, never into ${branch}`);
        }
        const fid = str(ctx.flags.fid) || branch.replace(/^feat\//, "");
        const m = mergeDev(top, {
            branch,
            policy: "full",
            fid,
            generate: true,
            ...(target ? { target } : {}),
            current: target
                ? runGit(top, ["merge-base", "--is-ancestor", target, "HEAD"]).ok
                : out.basePath === "A",
        }, ctx.log);
        const refused = m.outcome === "refused";
        if (refused && sentinelPath) {
            fs.mkdirSync(path.dirname(sentinelPath), { recursive: true });
            fs.writeFileSync(sentinelPath, "");
        }
        const newHead = git(top, ["rev-parse", "HEAD"]) ?? head;
        ctx.emit({
            ...out,
            ...(target ? { target } : {}),
            head: newHead,
            merged: m.merged,
            resolved: m.resolved,
            generated: m.generated,
            rebuilt: m.rebuilt,
            outcome: m.outcome,
            carried: m.carried,
            pending: m.pending,
            aborted: m.aborted,
            sentinel: refused && sentinel !== undefined ? sentinel : null,
        });
        const statusFile = str(ctx.flags.file);
        if (m.merged && statusFile !== undefined)
            recordMerge(path.resolve(ctx.cwd, statusFile), m.before, newHead);
        return m.code;
    }
    ctx.emit(out);
    return EXIT.OK;
}
/**
 * Ship Step 13: after the merge, bring local dev up to origin/dev by a pure
 * fast-forward without checking anything out, then a frozen install when the
 * main checkout is on dev and moved. Never pushes.
 */
function syncDevVerb(ctx) {
    const root = repoRoot(ctx.cwd);
    const fetch = fetchDev(root);
    if (!fetch.ok) {
        ctx.log(`git fetch ${REMOTE} ${DEV} failed: ${fetch.stderr}`);
        return EXIT_FETCH_FAILED;
    }
    const devLocal = fastForwardDev(root, git(root, ["rev-parse", UPSTREAM]) ?? "", ctx.log);
    const branch = currentBranch(root);
    const installed = branch === DEV && devLocal === "fast-forwarded" ? install(ctx, root) : null;
    ctx.emit({ devLocal, branch, installed });
    return installed === false ? EXIT_INSTALL_FAILED : EXIT.OK;
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
/** The canonical doc `ref` carries for the feature: `{fid}-design.md` or `{fid}-plan.md`. */
function canonicalDocs(root, ref, workflow, month, fid) {
    const re = new RegExp(`^docs/plans/${month}/${fid}-${workflow}\\.md$`);
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
/** This run's artifacts written untracked into the main checkout instead of the worktree stop the close. */
function strayCheck(root, month, fid) {
    const stray = (git(root, ["status", "--porcelain", "-uall", "--", `docs/plans/${month}/logs/${fid}/`]) ?? "")
        .split("\n")
        .filter((l) => l.startsWith("??"));
    if (stray.length) {
        throw new Stop(EXIT_LAND_STOPPED, `${fid} artifacts written to the main checkout instead of the worktree:\n${stray.join("\n")}\nMove them under .worktrees/${fid}/ or delete them, then re-run.`);
    }
}
/** Non-empty lines of `rev:p`, trimmed; [] when `p` is absent there. */
function revLines(root, rev, p) {
    return (git(root, ["show", `${rev}:${p}`]) ?? "")
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l !== "");
}
/**
 * Put back the `.jsonl` rows `branch` added that the squash dropped: `-X ours`
 * keeps dev's side of a conflicting hunk, and a ledger git does not union-merge
 * (a consumer's `.bkit/friction.jsonl`) loses the branch's rows there. Each
 * missing row is appended to the staged file.
 */
function restoreBranchRows(dir, branch) {
    const base = git(dir, ["merge-base", "HEAD", branch]);
    if (base === null)
        return;
    const changed = (git(dir, ["diff", "--name-only", "--no-renames", "--diff-filter=d", base, branch]) ?? "")
        .split("\n")
        .filter((p) => p.endsWith(".jsonl"));
    for (const p of changed) {
        const before = new Set(revLines(dir, base, p));
        const file = path.join(dir, p);
        const text = fs.existsSync(file) ? fs.readFileSync(file, "utf-8") : "";
        const have = new Set(text.split("\n").map((l) => l.trim()));
        const missing = revLines(dir, branch, p).filter((l) => !before.has(l) && !have.has(l));
        if (missing.length === 0)
            continue;
        const sep = text !== "" && !text.endsWith("\n") ? "\n" : "";
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.appendFileSync(file, `${sep}${missing.join("\n")}\n`);
        runGit(dir, ["add", "--", p]);
    }
}
/**
 * Build the close in `dir`, a detached origin/dev checkout: squash `branch` with
 * -X ours, put back ledger rows the squash dropped, check only docs came and the
 * canonical docs are the branch's copy, add the roadmap row, commit `{workflow} DONE`.
 */
function buildClose(ctx, dir, o) {
    const squash = runGit(dir, ["merge", "--squash", "-X", "ours", o.branch]);
    if (!squash.ok) {
        throw new Stop(EXIT_LAND_STOPPED, `squash of ${o.branch} onto ${UPSTREAM} failed — nothing landed; ${o.branch} and its worktree kept: ${squash.stderr}`);
    }
    restoreBranchRows(dir, o.branch);
    const staged = (git(dir, ["diff", "--cached", "--name-only"]) ?? "")
        .split("\n")
        .filter((p) => p !== "" && !CLOSE_DOCS.test(p));
    if (staged.length) {
        const inherited = localDevCopies(dir, staged, (p) => `:${p}`);
        throw new Stop(EXIT_LAND_STOPPED, `${o.workflow} close staged non-doc files:\n${staged.join("\n")}${unpushedDevCause(dir, inherited.length, staged.length, ", then re-run the close.")}`);
    }
    const docs = canonicalDocs(dir, o.branch, o.workflow, o.month, o.fid);
    const main = `docs/plans/${o.month}/${o.fid}-${o.workflow}.md`;
    if (!docs.includes(main))
        throw new Stop(EXIT_LAND_STOPPED, `${o.branch} carries no ${main} — nothing landed; ${o.branch} kept`);
    const unlanded = docs.filter((d) => git(dir, ["rev-parse", "-q", "--verify", `:${d}`]) !==
        git(dir, ["rev-parse", `${o.branch}:${d}`]));
    if (unlanded.length) {
        throw new Stop(EXIT_LAND_STOPPED, `squash did not stage the ${o.branch} copy of:\n${unlanded.join("\n")}\nnothing landed; ${o.branch} kept`);
    }
    appendFeature(dir, { workflow: o.workflow, fid: o.fid }, ctx.log);
    commitBookkeeping({
        root: dir,
        month: o.month,
        fid: o.fid,
        scope: "core",
        mode: "commit-allow-empty",
        squashOf: o.branch,
        message: `docs(${o.fid}): ${o.workflow} DONE bkit [skip ci]`,
    }, ctx.log);
}
/**
 * The direct close, every runtime: build it in `.worktrees/_land-{fid}` off a
 * fresh origin/dev and push it as dev. The main checkout is never touched. dev
 * moved underneath → rebuild on the new dev and push again, with backoff,
 * LAND_ATTEMPTS pushes in all. Any other refusal → null: the PR close takes over.
 */
async function landDirect(ctx, root, o) {
    const dir = landDir(root, o.fid);
    const res = await pushToDev({ root, dir, build: (d) => buildClose(ctx, d, o), log: ctx.log });
    switch (res.kind) {
        case "landed":
            return {
                shape: "local",
                transport: "git",
                sha: res.sha,
                prNumber: null,
                pushAttempts: res.attempts,
            };
        case "refused":
            ctx.log(`${REMOTE} refused the dev push — closing through a PR instead: ${res.stderr}`);
            return null;
        case "push-failed":
            throw new Stop(EXIT_PUSH_FAILED, `dev push failed without a server answer — nothing landed; ${o.branch} and its worktree kept; re-run the land: ${res.stderr}`);
        case "fetch-failed":
            throw new Stop(EXIT_FETCH_FAILED, `git fetch ${REMOTE} ${DEV} failed — nothing landed; ${o.branch} kept`);
        case "setup-failed":
            throw new Stop(EXIT_LAND_STOPPED, `could not create ${dir} — nothing landed: ${res.stderr}`);
        case "exhausted":
            throw new Stop(EXIT_PUSH_FAILED, `dev moved before each of ${res.attempts} pushes — nothing landed; ${o.branch} and its worktree kept; re-run the land`);
    }
}
/** The checkout that has `branch` checked out, or null. */
function branchTree(root, branch) {
    for (const block of (git(root, ["worktree", "list", "--porcelain"]) ?? "").split("\n\n")) {
        const lines = block.split("\n");
        if (lines.includes(`branch refs/heads/${branch}`))
            return lines.find((l) => l.startsWith("worktree "))?.slice("worktree ".length) ?? null;
    }
    return null;
}
/**
 * A land retry: merge origin/dev's docs and ledger commits into the PR branch in
 * the checkout holding it and push, so the PR carries dev's ledger rows. GitHub's
 * own branch update ignores `merge=union` and fails on the same conflict each time.
 */
async function mergeDevIntoPrBranch(root, branch, log) {
    const tree = branchTree(root, branch);
    if (tree === null)
        throw new Stop(EXIT_LAND_STOPPED, `no checkout has ${branch} checked out — cannot merge ${DEV} into the PR branch; the PR stays open`);
    if (!fetchDev(tree).ok)
        throw new Stop(EXIT_LAND_STOPPED, `fetch of ${UPSTREAM} failed — the PR stays open`);
    const m = mergeDevDocs(tree, { branch, generate: false }, log);
    if (m.code !== EXIT.OK)
        throw new Stop(EXIT_LAND_STOPPED, `merging ${UPSTREAM} into ${branch} stopped on a conflict outside docs/ and the ledgers — the PR stays open`);
    if (!m.merged)
        return;
    const pushed = await pushBranch(tree, { mode: "feature" }, log);
    if (pushed.code !== EXIT.OK)
        throw new Stop(EXIT_PUSH_FAILED, `push of ${branch} after merging ${DEV} failed`);
    log(`merged ${UPSTREAM} into ${branch} and pushed it`);
}
/**
 * The PR close (the dev push was refused): commit the roadmap row on the branch
 * in the checkout holding it, push it, open or reuse the PR, squash-merge it with
 * an empty body. A merge that does not land on an open PR → merge dev into its
 * branch locally, push, and try again, with backoff, LAND_ATTEMPTS tries in all; then stop with
 * the PR left open. gh missing → EXIT.USE_MCP with what to create / merge; re-run
 * with `--pr` (and `--merged-sha` once merged).
 */
async function landPr(ctx, root, o) {
    let prNumber = o.pr;
    if (prNumber === undefined) {
        const tree = branchTree(root, o.branch);
        if (tree === null)
            throw new Stop(EXIT_LAND_STOPPED, `no checkout has ${o.branch} checked out — the PR close commits the roadmap row on it; nothing landed`);
        runGit(tree, [
            "fetch",
            REMOTE,
            DEV_REFSPEC,
            `+refs/heads/${o.branch}:refs/remotes/${REMOTE}/${o.branch}`,
        ]);
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
        const pushed = await pushBranch(tree, { mode: "feature" }, ctx.log);
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
        for (let attempt = 1;; attempt++) {
            const merged = mergePr(root, { number: prNumber, subject }, ctx.log);
            if (merged.code === EXIT.USE_MCP) {
                ctx.emit({ stage: "merge", prNumber: Number(prNumber), subject, body: "" });
                return EXIT.USE_MCP;
            }
            if (merged.code === EXIT_BASE_NOT_DEV)
                throw new Stop(EXIT_LAND_STOPPED, `PR ${prNumber} does not target ${DEV} — bkit merges into ${DEV} only, releases stay manual; nothing merged, PR left open`);
            if (merged.out.merged) {
                sha = merged.out.mergeCommitOid ?? "";
                break;
            }
            // An unread state (gh read failed) is retried like an open PR; only a closed PR stops at once.
            if (merged.out.state !== null && merged.out.state !== "OPEN")
                throw new Stop(EXIT_LAND_STOPPED, `PR ${prNumber} did not reach MERGED (state=${merged.out.state})`);
            if (attempt >= TIMEOUTS.LAND_ATTEMPTS)
                throw new Stop(EXIT_LAND_STOPPED, `PR ${prNumber} still not merged after ${attempt} tries — left open; merge it, then re-run with --pr=${prNumber} --merged-sha=<merge commit>`);
            await mergeDevIntoPrBranch(root, o.branch, ctx.log);
            const wait = landBackoffMs(attempt);
            ctx.log(`PR ${prNumber} not merged on try ${attempt} of ${TIMEOUTS.LAND_ATTEMPTS} — trying again in ${(wait / 1000).toFixed(1)}s`);
            await sleep(wait);
        }
        transport = "gh";
    }
    else {
        const back = probePr(root, { number: prNumber, state: "open" });
        if (back.kind === "ok" && back.pr && back.pr.state !== "MERGED")
            throw new Stop(EXIT_LAND_STOPPED, `PR ${prNumber} is ${back.pr.state}, not MERGED`);
    }
    if (sha === "")
        throw new Stop(EXIT_LAND_STOPPED, `could not resolve the landed SHA for PR ${prNumber}`);
    if (!fetchDev(root).ok)
        throw new Stop(EXIT_LAND_STOPPED, "fetch of origin/dev after the merge failed");
    return { shape: "pr", transport, sha, prNumber: Number(prNumber), pushAttempts: 0 };
}
/**
 * Bring local dev up to `sha` when that is a pure fast-forward — `merge
 * --ff-only` when the main checkout is on dev, else move the branch pointer
 * alone; nothing is checked out or pushed. Local dev already past `sha` and on
 * origin/dev (a later landing fast-forwarded it) is current. Local commits
 * origin/dev lacks (listed with the command that publishes them), or git refusing
 * (an uncommitted edit the move would overwrite, dev checked out in another
 * worktree), skip it with a log line: what landed is on origin/dev either way.
 */
function fastForwardDev(root, sha, log) {
    const local = git(root, ["rev-parse", "-q", "--verify", `refs/heads/${DEV}`]);
    if (local === null)
        return "none";
    if (local === sha)
        return "current";
    const isAncestor = (a, b) => runGit(root, ["merge-base", "--is-ancestor", a, b]).ok;
    if (!isAncestor(local, sha)) {
        if (isAncestor(sha, local) && isAncestor(local, UPSTREAM))
            return "current";
        const ahead = (git(root, ["log", "--format=%h %s", `${UPSTREAM}..${local}`]) ?? "")
            .split("\n")
            .filter((l) => l !== "");
        log(`local ${DEV} has ${ahead.length} commit(s) ${UPSTREAM} does not — not fast-forwarded:`);
        for (const l of ahead)
            log(`  ${l}`);
        log(`to publish them, on ${DEV} in ${root}: git pull --rebase ${REMOTE} ${DEV} && git push ${REMOTE} ${DEV}`);
        return "skipped";
    }
    const moved = currentBranch(root) === DEV
        ? runGit(root, ["merge", "--ff-only", "-q", sha])
        : runGit(root, ["fetch", "-q", ".", `${sha}:refs/heads/${DEV}`]);
    if (!moved.ok) {
        log(`local ${DEV} not fast-forwarded — git refused: ${moved.stderr}`);
        return "skipped";
    }
    return "fast-forwarded";
}
/**
 * Those of `paths` whose content at `spec(p)` is already local `dev`'s: work the
 * branch carries because `dev` is unpushed, not work a run in this branch made.
 * `spec` names the side to compare — the index (`:path`) or a commit (`ref:path`).
 */
function localDevCopies(root, paths, spec) {
    if (git(root, ["rev-parse", "-q", "--verify", `refs/heads/${DEV}`]) === null)
        return [];
    return paths.filter((p) => {
        const at = git(root, ["rev-parse", "-q", "--verify", `${DEV}:${p}`]);
        return at !== null && at === git(root, ["rev-parse", "-q", "--verify", spec(p)]);
    });
}
/**
 * What a close refusal adds when some of the paths it names are unpushed `dev`'s
 * own content: the branch inherited them, and publishing `dev` is what unblocks
 * the close. Empty when none are, so the refusal reads as it did before.
 */
function unpushedDevCause(root, inherited, total, then) {
    if (inherited === 0)
        return "";
    const ahead = git(root, ["rev-list", "--count", `${UPSTREAM}..${DEV}`]) ?? "?";
    const tip = git(root, ["rev-parse", "--short", DEV]) ?? DEV;
    const which = inherited === total ? "all of them" : `${inherited} of them`;
    return `\n${which} are local ${DEV}'s content (tip ${tip}, ${ahead} commit(s) ahead of ${UPSTREAM}): this branch carries unpushed ${DEV} work — publish ${DEV} (git push ${REMOTE} ${DEV})${then}`;
}
/**
 * Uncommitted or untracked files in the feature worktree; [] when there is no
 * worktree. The worktree copy entries setup copied in (`copyExcludes`) are never
 * committed, so they are not work left behind.
 */
function uncommitted(root, fid) {
    const wt = worktreeDir(root, fid);
    if (!fs.existsSync(wt))
        return [];
    const status = runGit(wt, ["status", "--porcelain", "-uall", "--", ".", ...copyExcludes(wt)]);
    if (!status.ok)
        return [`git status in ${wt} failed: ${status.stderr}`];
    return status.stdout.split("\n").filter((l) => l !== "");
}
async function landVerb(ctx) {
    const workflow = String(ctx.flags.workflow);
    if (!["design", "plan"].includes(workflow))
        throw new CommandError(EXIT.USAGE, "--workflow must be design or plan");
    const fid = String(ctx.flags.fid);
    const root = repoRoot(ctx.cwd);
    const month = resolveMonth(root, fid, str(ctx.flags.month));
    const worktreeStatus = path.join(git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? root, "docs", "plans", month, "logs", fid, "status.jsonl");
    try {
        const devPushes = devPushesOf(root, worktreeStatus, ctx.log);
        const branch = str(ctx.flags.branch) || (devPushes ? `feat/${fid}` : currentBranch(ctx.cwd));
        const pr = str(ctx.flags.pr);
        if (devPushes && pr === undefined)
            strayCheck(root, month, fid);
        const landed = (pr === undefined ? await landDirect(ctx, root, { workflow, fid, month, branch }) : null) ??
            (await landPr(ctx, root, {
                workflow,
                fid,
                month,
                issue: str(ctx.flags.issue) || undefined,
                branch,
                pr,
                mergedSha: str(ctx.flags.mergedSha),
            }));
        if (typeof landed === "number")
            return landed;
        fetchDev(root);
        const localDev = devPushes ? fastForwardDev(root, landed.sha, ctx.log) : null;
        // The audit: canonical docs on origin/dev, the landed body clean, the transport recorded.
        const docs = canonicalDocs(root, landed.sha, workflow, month, fid);
        const main = `docs/plans/${month}/${fid}-${workflow}.md`;
        const missing = [main, ...docs].filter((d) => !runGit(root, ["cat-file", "-e", `${UPSTREAM}:${d}`]).ok);
        const token = bodySkipToken(root, landed.sha);
        if (token === undefined)
            throw new Stop(EXIT_LANDED_UNVERIFIED, `post-close body scan errored on ${landed.sha}`);
        const scanResult = token ? "skip-token-found" : "clean";
        // A PR runtime's checkout holds the branch, so its status file is this run's.
        // A runtime that pushes dev never writes the main checkout: the cross-check
        // reads the landed commit's copy, and the transport is in the emitted result.
        const status = path.join(root, "docs", "plans", month, "logs", fid, "status.jsonl");
        const onDisk = !devPushes && fs.existsSync(status);
        const rows = onDisk ? readStatusRows(status) : readStatusRowsAt(status, landed.sha);
        const label = onDisk ? status : `${landed.sha}:${path.relative(root, status)}`;
        if (!crossCheckRows(rows, label, landed.transport, ctx.log).ok)
            throw new Stop(EXIT_LANDED_UNVERIFIED, "close transport cross-check failed");
        if (onDisk)
            closeTransportRow(status, { shape: landed.shape, sha: landed.sha, scanResult });
        else
            ctx.log(`close-transport row not written — the main checkout is never written to; shape=${landed.shape} sha=${landed.sha} scan=${scanResult}`);
        if (token)
            throw new Stop(EXIT_LANDED_UNVERIFIED, `landed commit ${landed.sha} inherited a CI-suppression token in its body`);
        if (missing.length)
            throw new Stop(EXIT_LANDED_UNVERIFIED, `canonical ${workflow} missing on ${UPSTREAM}: ${missing.join(", ")}`);
        const notLanded = notOnDev(root, branch);
        if (notLanded.length) {
            const inherited = localDevCopies(root, notLanded, (p) => `${branch}:${p}`);
            throw new Stop(EXIT_LANDED_UNVERIFIED, `${branch} carries work ${UPSTREAM} does not — ${branch} and its worktree kept:\n${notLanded.join("\n")}${unpushedDevCause(root, inherited.length, notLanded.length, "; the close landed without it.")}`);
        }
        let worktree = null;
        const left = devPushes ? uncommitted(root, fid) : [];
        if (left.length) {
            ctx.log(`.worktrees/${fid} holds work that was never committed, so it is not on ${UPSTREAM} — it and ${branch} kept; commit or move it, then remove them by hand:\n${left.join("\n")}`);
            worktree = { removed: false, reason: "uncommitted", files: left };
        }
        else if (devPushes) {
            try {
                worktree = { ...removeWorktree(root, fid, branch, ctx.log) };
            }
            catch (err) {
                // The close landed; a leftover worktree is a human's to remove.
                ctx.log(`worktree removal failed — remove .worktrees/${fid} by hand: ${err.message}`);
            }
        }
        const released = releaseLock(workflowLockPath(root, month, fid), {
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
            canonicalRef: UPSTREAM,
            scanResult,
            pushAttempts: landed.pushAttempts,
            localDev,
            worktree,
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
    summary: "Sync, push, land and rebase branches; stamp and read a doc's base-commit anchor.",
    verbs: {
        parse: {
            summary: "Read an explicitly named or existing branch from the session prompt.",
            use: "workflow",
            flags: [
                { name: "prompt-file", type: "string", required: true, help: "session prompt" },
                {
                    name: "workflow",
                    type: "string",
                    help: "debug: validate an explicit debug adoption request",
                },
            ],
            output: {
                branch: "one existing branch, or null",
                via: "explicit | token | null",
                where: "local | remote | both | null",
            },
            exitCodes: {
                3: "an explicit branch is invalid or absent",
                8: "multiple branches were named",
            },
            run: (ctx) => {
                if (ctx.flags.workflow !== undefined && ctx.flags.workflow !== "debug")
                    throw new CommandError(EXIT.USAGE, "--workflow must be debug");
                const prompt = fs.readFileSync(path.resolve(ctx.cwd, String(ctx.flags.promptFile)), "utf8");
                const candidates = new Map();
                for (const token of prompt.split(/\s+/)) {
                    const explicit = token.startsWith("branch=");
                    const branch = explicit ? token.slice("branch=".length) : token;
                    if (!explicit && (!branch.includes("/") || /^[a-z][a-z0-9+.-]*:\/\//i.test(branch)))
                        continue;
                    const valid = runGit(ctx.cwd, ["check-ref-format", "--branch", branch]).ok;
                    const local = valid &&
                        runGit(ctx.cwd, ["show-ref", "--verify", "--quiet", `refs/heads/${branch}`]).ok;
                    const remote = valid &&
                        runGit(ctx.cwd, ["show-ref", "--verify", "--quiet", `refs/remotes/origin/${branch}`])
                            .ok;
                    if (!local && !remote) {
                        if (explicit)
                            throw new CommandError(3, `branch ${branch} is invalid or does not exist`);
                        continue;
                    }
                    candidates.set(branch, {
                        via: explicit ? "explicit" : "token",
                        where: local && remote ? "both" : local ? "local" : "remote",
                    });
                }
                if (candidates.size > 1)
                    throw new CommandError(8, `multiple branch selections: ${[...candidates.keys()].join(", ")}`);
                const selected = [...candidates.entries()][0];
                ctx.emit(selected
                    ? { branch: selected[0], ...selected[1] }
                    : { branch: null, via: null, where: null });
                return EXIT.OK;
            },
        },
        sync: {
            summary: `Fetch ${UPSTREAM}; report whether it is an ancestor of HEAD (Path A/B) and how far docs/ and the ledgers are behind; optionally merge it in.`,
            use: "workflow",
            flags: [
                {
                    name: "feature-state",
                    type: "boolean",
                    help: "report merge-aware feature coverage, excluding bookkeeping and proven automatic dev-only merges; needs --month and --fid",
                },
                { name: "month", type: "string", help: "--feature-state: bookkeeping month YYYYMM" },
                {
                    name: "reconcile-feature",
                    type: "boolean",
                    help: "ship: fetch and reconcile the feature branch before classifying its base; preserve divergent work through a merge and ensure unpublished work has a CI-running head",
                },
                {
                    name: "head",
                    type: "string",
                    help: "commit to compare (default HEAD), e.g. ship's ENTRY_HEAD",
                },
                {
                    name: "merge",
                    type: "boolean",
                    help: `ship Step 4: merge ${UPSTREAM} into the checked-out feature branch — the run's uncommitted work is committed first, ledger conflicts union, a lockfile regenerates from ${DEV}'s copy, a generated register takes ${DEV}'s copy and is rebuilt after the merge, a doc embedding the register's generated block takes ${DEV}'s block and merges the rest, the install record (.bkit/version) merges entry by entry with ${DEV}'s value where both changed, any other conflict stays in the tree with the merge in progress for a hand resolution (exit 24; run again after git add), then a declared bkit:generate runs and its output is committed; never a rebase or force-push, never on ${DEV} / main`,
                },
                {
                    name: "target",
                    type: "string",
                    help: "--merge: exact recorded merge target (default origin/dev); continuation refuses a different MERGE_HEAD",
                },
                {
                    name: "merge-docs",
                    type: "boolean",
                    help: `on a feature branch whose docs/ or ledgers are behind, merge ${UPSTREAM} (ledgers union, a generated register takes ${DEV}'s copy and is rebuilt, a doc embedding its generated block takes ${DEV}'s block and merges the rest, the install record (.bkit/version) merges entry by entry, other docs/ take ${DEV}, anything else aborts), then run a declared bkit:generate and commit its output`,
                },
                {
                    name: "fid",
                    type: "string",
                    help: "--merge: the feature id in the commit messages (default: the branch name without feat/)",
                },
                {
                    name: "file",
                    type: "string",
                    help: "--merge: the run's status.jsonl: a completed merge appends an engine-action row (action merge, key merge/{old tip}, ref the new HEAD)",
                },
                {
                    name: "sentinel",
                    type: "string",
                    help: "--merge: file removed at start and created on refusal, e.g. logs/{FID}/.rebase-failed",
                },
            ],
            output: {
                branch: "current branch (null when detached)",
                head: "commit compared (after a merge: the new HEAD)",
                remoteHead: "--reconcile-feature: the freshly observed remote feature commit, or null when absent",
                reconciledHead: "--reconcile-feature: the resulting local feature commit used for base classification",
                featureCodeState: "--feature-state: versioned identity of feature commits and semantic merge results",
                target: "--merge --target: the resolved commit being merged or continued",
                basePath: `A when ${UPSTREAM} is an ancestor of head (nothing to integrate), else B`,
                behind: `commits on ${UPSTREAM} not in head`,
                docsBehind: `of those, commits touching docs/ or a ledger path (LEDGERS)`,
                merged: `true when --merge or --merge-docs merged ${UPSTREAM}`,
                resolved: "conflicts the merge resolved: [{path, how: union|lockfile|register|embed|record|dev}]",
                rebuilt: "a generated register the merge settled on dev's copy, or whose generated block a doc took from dev, rebuilt after the merge: true (rebuilt; output committed), false (failed: it keeps dev's copy), null (not run: none settled, its script absent, or no merge)",
                generated: "bkit:generate after the merge: true (ran; only the paths it changed committed), false (failed, or it changed a path that already held uncommitted changes; exit 25), null (not run: no merge, or undeclared)",
                outcome: `--merge: merged | current (${UPSTREAM} already an ancestor; nothing done) | pending (conflicts left for a hand resolution, merge in progress) | refused (merge aborted)`,
                carried: "--merge: the commit that carried the uncommitted work before the merge (null when the tree was clean)",
                pending: "--merge: the paths left conflicted for a hand resolution (empty otherwise)",
                aborted: "--merge: a refused merge was aborted",
                sentinel: "--merge: the sentinel written on refusal (null otherwise)",
            },
            exitCodes: {
                [EXIT_DIFF_FAILED]: "--feature-state: commit ancestry or bookkeeping classification could not be read",
                [EXIT_REFUSED]: "--merge: the uncommitted work could not be committed before the merge",
                [EXIT_DETACHED]: "--merge / --merge-docs with no branch checked out",
                [EXIT_FETCH_FAILED]: `git fetch ${REMOTE} ${DEV} failed`,
                [EXIT_MERGE_CONFLICT]: `the merge conflicted where it may not (--merge-docs: outside docs/ and the ledgers; --merge: a ledger union, lockfile regenerate or register resolution failed), could not be committed, or (--merge) ${UPSTREAM} could not be merged at all; merge aborted`,
                [EXIT_HAND_RESOLVE]: "--merge: conflicts outside the ledgers, lockfiles, generated registers, their generated blocks and the install record are left in the tree with the merge in progress; resolve them, git add, run again",
                [EXIT_GENERATE_FAILED]: "bkit:generate failed after the merge, or its output could not be committed; the merge commit stays",
            },
            run: syncVerb,
        },
        regenerate: {
            summary: "Run a declared bkit:generate on the feature branch and commit only the paths it changed (ship Step 10's fix round).",
            use: "workflow",
            flags: [
                {
                    name: "fid",
                    type: "string",
                    help: "the feature id in the commit message (default: the branch name without feat/)",
                },
                {
                    name: "attempt",
                    type: "string",
                    help: "ship Step 10's merge round: the commit is fix({FID}): regenerate attempt {N}; without it, chore({FID}): regenerate before re-validating",
                },
                {
                    name: "file",
                    type: "string",
                    help: "the run's status.jsonl: a commit appends an engine-action row (action regenerate, key regenerate/{old tip}, ref the new HEAD)",
                },
            ],
            output: {
                outcome: "committed (bkit:generate changed paths; committed) | unchanged (it changed nothing) | undeclared (no bkit:generate script; nothing run)",
                head: "HEAD after the verb (the regenerate commit when committed)",
                paths: "the paths bkit:generate changed and the commit carries (empty otherwise)",
            },
            exitCodes: {
                [EXIT_DETACHED]: "no branch checked out",
                [EXIT_GENERATE_FAILED]: "bkit:generate failed, changed a path that already held uncommitted changes, or its output could not be committed; nothing committed",
            },
            run: regenerateVerb,
        },
        push: {
            summary: "Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise; 81 tests lock held.",
            use: "workflow",
            flags: [
                {
                    name: "mode",
                    type: "string",
                    required: true,
                    help: "feature (a step's push) | abort (Failure Path: never into an open PR) | dev (the checkout must be on dev) | plain (a feature branch, never forced)",
                },
                { name: "set-upstream", type: "boolean", help: "push with -u" },
                {
                    name: "ahead-of",
                    type: "string",
                    help: "--mode=plain: refuse (21) when HEAD has no commits beyond this ref; an origin/<branch> ref is fetched first",
                },
                {
                    name: "commit",
                    type: "string",
                    help: "--mode=feature: `git add -A`, then an allow-empty commit with this message (plus ` bkit [auto route]` when --label holds bkit:auto), once per run, before the push",
                },
                {
                    name: "label",
                    type: "string",
                    repeatable: true,
                    help: "--commit: the issue's labels, one per flag",
                },
                { name: "file", type: "string", help: "--commit: status.jsonl for the engine-action row" },
                { name: "workflow", type: "string", help: "--commit: the workflow, for the run number" },
                {
                    name: "require-ci",
                    type: "boolean",
                    help: `this push must start a CI run: refuse when the HEAD message carries a skip-CI token; --mode=feature on a feature branch first merges ${UPSTREAM} in when its docs/ or ledgers are behind (as sync --merge-docs does), so GitHub sees no ledger conflict`,
                },
                {
                    name: "open-pr",
                    type: "string",
                    help: "--mode=abort: the open-PR answer from MCP (a number, or none) instead of asking gh",
                },
                {
                    name: "fid",
                    type: "string",
                    help: "an in-place run on dev: its FID, which selects the run's shared-checkout record; with it a missing record refuses the push",
                },
            ],
            output: {
                pushed: "true when the push ran and succeeded",
                lockHolder: "the tests-lock holder on exit 81 (null otherwise)",
                replayed: "true when the run's commits went out as copies cherry-picked onto a fresh origin/dev (an in-place run on dev whose local dev holds other commits); sha is then the landed origin/dev commit",
                ref: "the branch pushed — link handover artifacts to this ref; null when nothing was pushed",
                sha: "HEAD commit pushed (null when not pushed)",
                forced: "true when pushed with --force-with-lease",
                skipped: "why the push did not run: open-pr | skip-ci | no-run-commits (an in-place run on dev with nothing new to push) (null otherwise)",
                prNumber: "the open PR that stopped an abort push (null otherwise)",
                mergedDev: `--require-ci: ${UPSTREAM} was merged in before the push`,
                commit: "--commit: the marker commit's sha",
                deduped: "--commit: the marker commit was already made this run (not made again)",
            },
            exitCodes: {
                4: "the pre-push hook could not acquire the tests lock",
                [EXIT_DETACHED]: "no branch checked out",
                [EXIT_NOTHING_TO_PUSH]: "--mode=plain or --commit on dev / main, or --ahead-of and HEAD has no commits beyond it",
                [EXIT_SKIP_CI]: "--require-ci and the HEAD message carries a skip-CI token",
                [EXIT_OPEN_PR]: "--mode=abort and the branch has an open PR: push skipped, remote HEAD kept",
                [EXIT_PUSH_FAILED]: "git push failed, or dev refused a replayed push (in-place run on dev: the refusal is printed)",
                [EXIT_NOT_DEV]: "--mode=dev and the checkout is not on dev",
                [EXIT_NO_RECORD]: "--mode=dev, or --fid, on dev with no shared-checkout record for the run: nothing pushed",
                [EXIT_FETCH_FAILED]: "fetching origin/dev failed (in-place run on dev, or a --require-ci feature push); nothing pushed",
                [EXIT_MERGE_CONFLICT]: "in-place run on dev: a run commit does not apply onto origin/dev without the local commits it builds on; or a --require-ci feature push: merging origin/dev conflicts outside docs/ and the ledgers (merge aborted). The conflicting paths are printed, nothing pushed",
                [EXIT_GENERATE_FAILED]: "--require-ci feature push: bkit:generate failed after merging origin/dev; nothing pushed",
            },
            run: pushVerb,
        },
        "fast-forward": {
            summary: "Fetch a remote branch and fast-forward the checkout onto it; refuse when diverged.",
            use: "workflow",
            flags: [
                {
                    name: "onto",
                    type: "string",
                    required: true,
                    help: "the ref to fast-forward onto; an origin/<branch> ref is fetched first",
                },
            ],
            output: { moved: "HEAD moved", head: "HEAD after" },
            exitCodes: {
                [EXIT_FETCH_FAILED]: "fetching --onto failed, or it does not resolve",
                [EXIT_DIVERGED]: "the checkout has commits --onto lacks: nothing moved",
            },
            run: fastForwardVerb,
        },
        "scan-diff": {
            summary: "Exit 0 when the branch's diff from --base matches (paths, an added marker line, a source change, or a disabled test); 1 when not — --disabled-tests turns that round: 1 when a test was disabled or lost an assertion, 0 when none was.",
            use: "by-hand",
            flags: [
                {
                    name: "base",
                    type: "string",
                    required: true,
                    help: "diff <base>...HEAD; an origin/<branch> base is fetched first",
                },
                {
                    name: "paths",
                    type: "string",
                    help: "a changed path matches this pattern (case-insensitive)",
                },
                {
                    name: "marker",
                    type: "string",
                    help: "an added line carries this text, outside docs/plans",
                },
                {
                    name: "code",
                    type: "boolean",
                    help: "a path changed outside docs/plans, docs/*.jsonl and .bkit/*.jsonl",
                },
                {
                    name: "disabled-tests",
                    type: "boolean",
                    help: "an added line disables a test (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled`, `@pytest.mark.skip`, `@unittest.skip`), outside comments or quotes, or an assertion is removed; matches exact moved occurrences once (unchanged test name, scope and setup across files), and rewritten assertions within the same file and test; unchanged duplicates do not cancel removals; inverts --paths / --marker / --code's polarity, so never pass it with --expect-none",
                },
                {
                    name: "expect-none",
                    type: "boolean",
                    help: "invert the exit: 0 when nothing matched, 1 (naming the paths on stderr) when something did",
                },
            ],
            output: {
                found: "something matched",
                paths: "the matching paths",
                disabled: "[{file, line, test}]: unmatched added disabling markers and removed assertion occurrences, attributed to their original test (only with --disabled-tests)",
            },
            exitCodes: {
                [EXIT_DIFF_FAILED]: "--base does not resolve, or git diff failed",
            },
            run: scanDiffVerb,
        },
        "force-build": {
            summary: `Force a full CI build: put ${FORCE_BUILD} on the open PR's title, then push an empty marker commit (once per run).`,
            use: "workflow",
            flags: [
                { name: "fid", type: "string", required: true, help: "feature id, for the commit subject" },
                {
                    name: "file",
                    type: "string",
                    required: true,
                    help: "status.jsonl for the engine-action row",
                },
                {
                    name: "workflow",
                    type: "string",
                    required: true,
                    help: "the workflow, for the run number",
                },
                {
                    name: "label",
                    type: "string",
                    repeatable: true,
                    help: "the issue's labels; bkit:auto adds ` bkit [auto route]` to the commit",
                },
                {
                    name: "open-pr",
                    type: "string",
                    help: "the open-PR answer from MCP (a number, or none) instead of asking gh",
                },
                {
                    name: "title-set",
                    type: "boolean",
                    help: "the title is handled (set through MCP, or no PR is open): skip gh",
                },
            ],
            output: {
                prNumber: "the open PR whose title was checked, or null",
                titleChanged: `the title gained ${FORCE_BUILD}`,
                commit: "the marker commit's sha",
                deduped: "the marker commit was already made this run",
                pushed: "the push ran and succeeded",
                ref: "the branch pushed",
                sha: "HEAD pushed",
            },
            exitCodes: {
                [EXIT_DETACHED]: "no branch checked out",
                [EXIT_NOTHING_TO_PUSH]: "on dev / main",
                [EXIT_PUSH_FAILED]: "git commit or git push failed",
            },
            run: forceBuildVerb,
        },
        rebase: {
            summary: "Drive a rebase to completion, auto-resolving ledger (union), lockfile (regenerate), generated-register (take the target's copy, rebuild after), embedded generated-block (take the target's block, merge the rest, rebuild after) and install-record (merge entry by entry, the target's value where both changed) conflicts; refuse and abort on anything else.",
            use: "workflow",
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
                {
                    name: "file",
                    type: "string",
                    help: "the run's status.jsonl: a completed rebase appends an engine-action row (action rebase, key rebase/{old tip}, ref the new HEAD)",
                },
            ],
            output: {
                outcome: "resolved | refused (a refused rebase is aborted)",
                resolved: "conflicts resolved: [{path, how: union|lockfile|register|embed|record}]",
                rebuilt: "a generated register settled on the rebase target's copy, or whose generated block a doc took from the target, rebuilt after the rebase: true (rebuilt; output committed), false (failed: it keeps the target's copy), null (not run: none settled, or its script absent)",
                skippedCommits: "commits skipped because resolution emptied them",
                rounds: "resolve rounds run",
                refused: "the path that stopped resolution (null when none, or not path-specific)",
                reason: "why resolution refused or stopped (null on success)",
                aborted: "a refused rebase was aborted (false on success, or when the abort failed)",
                sentinel: "the sentinel written on refusal (null otherwise)",
            },
            exitCodes: {
                [EXIT_REFUSED]: "a conflict is not auto-resolvable",
                [EXIT_NO_REBASE]: "no rebase in progress",
            },
            run: rebaseVerb,
        },
        "sync-dev": {
            summary: "After a merge, fast-forward local dev to origin/dev without checking it out or pushing; frozen install when the main checkout is on dev and moved.",
            use: "workflow",
            flags: [],
            output: {
                devLocal: "fast-forwarded | current | skipped (local dev has commits origin/dev lacks, listed with the publish command, or git refused) | none (no local dev)",
                branch: "the branch the main checkout is on (unchanged)",
                installed: "dependency install result: true, false (failed, exit 16), null (not run: not on dev, dev did not move, or no package.json)",
            },
            exitCodes: {
                [EXIT_FETCH_FAILED]: `git fetch ${REMOTE} ${DEV} failed`,
                [EXIT_INSTALL_FAILED]: "dependency install failed or the package manager could not run",
            },
            run: syncDevVerb,
        },
        land: {
            summary: "Design / plan close: squash the branch onto origin/dev in a throwaway worktree and push it as dev (retrying with backoff when dev moved), else the PR squash-merge; then audit it, fast-forward local dev on a laptop and release the lock.",
            use: "workflow",
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
                    help: "the branch to land (default: feat/{fid} where the runtime pushes dev, else the current branch)",
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
                canonicalRef: "origin/dev — where the canonical docs were verified",
                scanResult: "the landed commit body's scan: clean",
                pushAttempts: "dev pushes the direct close took (0 for a PR close)",
                localDev: "fast-forwarded | current | skipped (local commits, or git refused) | none (no local dev) | null (runtime does not push dev)",
                worktree: "the worktree removal result (runtime pushes dev), else null",
                stage: "exit 80 only: open (create the PR via MCP with title / body / base / head) | merge (merge via MCP with subject, empty body)",
            },
            exitCodes: {
                [EXIT_PUSH_FAILED]: "dev moved before every one of LAND_ATTEMPTS pushes, or the PR branch push failed (nothing landed)",
                [EXIT_FETCH_FAILED]: `git fetch ${REMOTE} ${DEV} failed (nothing landed)`,
                [EXIT_LAND_STOPPED]: "a guard stopped the land: stray files, failed squash, staged non-doc files, canonical blob mismatch, no checkout holds the branch, PR not opened / not merged after LAND_ATTEMPTS tries, PR base not dev or unreadable (nothing landed; the PR stays open)",
                [EXIT_LANDED_UNVERIFIED]: "landed, but the body scan, transport cross-check or canonical-on-dev check failed",
                [EXIT_LOCK_LEFT]: "landed and audited, but the workflow lock file survived removal",
            },
            run: landVerb,
        },
        "anchor-stamp": {
            summary: "Put a <!-- bkit:anchor --> block recording the base commit and bkit release on top of a design/plan doc or audit report (idempotent).",
            use: "workflow",
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
            use: "by-hand",
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
