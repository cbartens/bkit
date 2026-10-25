// bkit ci — the gates CI and the git hooks run.
//
// `slop` — the enforcing slop gate (`slop:delta`). `lint:slop` (`slop-scan scan`) only
// reports. This gate checks the base ref out as a detached worktree, runs
// `slop-scan delta` against the working tree, and fails when the change makes the repo
// worse on NET: more findings, or a higher score. It gates on the net figures, not on
// "added": slop-scan's delta is keyed by position, so editing above a pre-existing
// finding reports it as resolved at the old line and added at the new one, netting to
// zero. The pre-existing baseline is never the change's to fix.
//
// `prose` — the prose gate (`lint:prose`): Vale over the markdown files the globs
// select. Skips with a log line when vale is not installed; restores the gitignored
// write-good package from the main worktree (else `vale sync`) when it is missing.
//
// `skip-token` — whether a commit message carries a GitHub skip-CI token
// (`SKIP_CI_TOKEN`), for the `.husky/pre-push` CI-suppressor guard.
//
// `min-push` — whether every file a push changes matches `bkit.testing.minPushPaths`, so
// `.husky/pre-push` runs `bkit:gate:min`. Files decide, never `[skip ci]` (a typed label
// GitHub reads off the last commit only).
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { readBkitConfig } from "../../shared/settings.js";
import { CommandError, commitMessage, EXIT, git, parseJson, runGit, SKIP_CI_TOKEN, } from "../lib.js";
import { changedOutside } from "../workflow/ledgers.js";
/** Exit code: slop-scan could not be started (not installed, not executable). */
export const EXIT_SLOP_UNAVAILABLE = 3;
/** Exit code: slop-scan ran but failed, or its JSON lacks the fields the gate reads. */
export const EXIT_SLOP_FAILED = 4;
/** Exit code: the base ref could not be checked out as a worktree. */
export const EXIT_NO_WORKTREE = 5;
/** Exit code: vale could not run, or ended with a runtime error (its exit 2). */
export const EXIT_VALE_FAILED = 6;
/** Exit code: a pushed commit, its base, or its `git diff` could not be read. */
export const EXIT_RANGE_UNKNOWN = 7;
/** Branches whose merge-base with HEAD is the default base, in order. */
const BASE_CANDIDATES = ["origin/dev", "origin/main"];
/** A net score at or below this is float noise, not worsening. */
const SCORE_EPSILON = 0.001;
/**
 * Printed on failure: names the fixes to avoid (deleting files, rewiring callers,
 * casting to any). The casts are named in words; spelled as code, this string would
 * itself be a type-suppression finding.
 */
export const FAIL_GUIDANCE = [
    "FAIL — change adds/worsens slop on net.",
    "- ONLY fix net-new, NEVER the baseline. New lines matching existing patterns are consistent, NOT slop.",
    "- Type-suppression (any casts, double casts through unknown, @ts-* directives): Assert real type, else Record<string, unknown>, NEVER any; suppress only with written reason.",
    "- Structure/defensive (over-fragmentation, pass-through-wrapper, empty-catch, ...): Fix in place; NEVER delete/move/merge files or rewire callers to satisfy — refactors are separate decisions, NOT lint side effects.",
    "Inspect: slop-scan delta --base <base-worktree> --head .",
];
/** The `summary` fields the gate reads; each must be present. */
const SUMMARY_FIELDS = [
    "addedCount",
    "resolvedCount",
    "worsenedCount",
    "netFindingCount",
    "netRepoScore",
];
const CLEANUP_SIGNALS = ["SIGINT", "SIGTERM"];
/** First of `--base`, `$SLOP_BASE_REF`, merge-base with origin/dev or origin/main, `HEAD~1`, HEAD. */
export function resolveBaseRef(cwd, given) {
    if (given)
        return given;
    for (const cand of BASE_CANDIDATES) {
        if (!runGit(cwd, ["rev-parse", "--verify", "--quiet", cand]).ok)
            continue;
        const mb = runGit(cwd, ["merge-base", "HEAD", cand]);
        if (mb.ok && mb.stdout)
            return mb.stdout;
    }
    const parent = runGit(cwd, ["rev-parse", "--verify", "--quiet", "HEAD~1"]);
    return parent.ok ? parent.stdout : runGit(cwd, ["rev-parse", "HEAD"]).stdout;
}
/**
 * `slop-scan` from PATH (a package script puts `node_modules/.bin` there), else the
 * locally installed package through npx; `--no-install` never reaches the network.
 */
export function slopScanArgv(env = process.env) {
    return onPath("slop-scan", env) ? ["slop-scan"] : ["npx", "--no-install", "slop-scan"];
}
/** Whether `bin` resolves on PATH (`command -v`). */
function onPath(bin, env = process.env) {
    return spawnSync("/bin/sh", ["-c", `command -v ${bin}`], { env }).status === 0;
}
/** The gate's figures from `slop-scan delta --json`, or the first field it lacks. */
export function readSummary(raw) {
    const parsed = parseJson(raw);
    // Not JSON at all: reported as the whole summary missing, same exit as a dropped field.
    if (!parsed.ok)
        return { missing: "summary (output is not JSON)" };
    const summary = parsed.value?.summary;
    if (typeof summary !== "object" || summary === null)
        return { missing: "summary" };
    const s = summary;
    const out = {};
    for (const field of SUMMARY_FIELDS) {
        if (typeof s[field] !== "number")
            return { missing: `summary.${field}` };
        out[field] = s[field];
    }
    return out;
}
export const gateFails = (s) => s.netFindingCount > 0 || s.netRepoScore > SCORE_EPSILON;
/** Whether a failed slop-scan run means it never started, rather than that it failed. */
function couldNotRun(res, viaNpx) {
    if (res.error?.code === "ENOENT")
        return true;
    if (res.status === 126 || res.status === 127)
        return true;
    // npx exits 1 with this message when the package is not installed locally.
    return viaNpx && /could not determine executable/i.test(String(res.stderr ?? ""));
}
/** The last 20 lines of `text`. */
const tail = (text) => text.trim().split("\n").slice(-20).join("\n");
/**
 * Run `body`, then `cleanup` even if SIGINT / SIGTERM arrives meanwhile, then terminate as
 * the signal would. Without the listeners Node dies on the signal and leaves the base
 * worktree registered in the repo.
 */
async function withCleanup(body, cleanup) {
    const received = [];
    const onSignal = (sig) => received.push(sig);
    for (const sig of CLEANUP_SIGNALS)
        process.on(sig, onSignal);
    try {
        return body();
    }
    finally {
        cleanup();
        // A signal that arrived during a blocking spawn is dispatched on a later loop turn, and
        // one turn is not always enough: on Node 20 the first `setImmediate` runs before the
        // listener is called, so the signal looks absent and the process would run to completion
        // (reproduced on node:20). Give the loop a bounded number of turns to deliver a pending
        // signal before deciding.
        for (let turn = 0; turn < 10 && received.length === 0; turn++) {
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
        for (const sig of CLEANUP_SIGNALS)
            process.off(sig, onSignal);
        if (received[0]) {
            // Exit with the conventional 128+signo rather than re-raising: Node keeps the libuv
            // signal watcher installed after the last listener is removed, so `process.kill(self,
            // sig)` is swallowed and the process runs to completion. A shell reads the same 143.
            process.exit(128 + (os.constants.signals[received[0]] ?? 0));
        }
    }
}
function slop(ctx) {
    const top = runGit(ctx.cwd, ["rev-parse", "--show-toplevel"]);
    if (!top.ok)
        throw new CommandError(EXIT.USAGE, `not inside a git repository: ${ctx.cwd}`);
    const given = typeof ctx.flags.base === "string" ? ctx.flags.base : undefined;
    const baseRef = resolveBaseRef(ctx.cwd, given || process.env.SLOP_BASE_REF || undefined);
    const empty = { added: 0, resolved: 0, worsened: 0, netFindingCount: 0, netScore: 0 };
    const sha = runGit(ctx.cwd, ["rev-parse", "--verify", "--quiet", `${baseRef}^{commit}`]);
    if (!sha.ok) {
        ctx.log(`base ref '${baseRef}' not found locally — fetch it (CI needs fetch-depth: 0). Skipping.`);
        ctx.emit({ passed: true, skipped: "base-not-found", baseRef, base: null, ...empty });
        return EXIT.OK;
    }
    const base = sha.stdout;
    if (base === runGit(ctx.cwd, ["rev-parse", "HEAD"]).stdout) {
        ctx.log("base resolves to HEAD — no committed delta to check; skipping.");
        ctx.emit({ passed: true, skipped: "base-is-head", baseRef, base, ...empty });
        return EXIT.OK;
    }
    const wt = fs.mkdtempSync(path.join(os.tmpdir(), "slop-delta."));
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "slop-delta-out."));
    const outFile = path.join(outDir, "delta.json");
    const removeWorktree = () => {
        runGit(ctx.cwd, ["worktree", "remove", "--force", wt]);
        fs.rmSync(wt, { recursive: true, force: true });
        fs.rmSync(outDir, { recursive: true, force: true });
    };
    return withCleanup(() => {
        const added = runGit(ctx.cwd, ["worktree", "add", "-q", "--detach", wt, base]);
        if (!added.ok) {
            ctx.log(`could not check out base ${base} as a worktree: ${added.stderr}`);
            return EXIT_NO_WORKTREE;
        }
        ctx.log(`base ${base} (${baseRef}) vs working tree`);
        const argv = slopScanArgv();
        const viaNpx = argv[0] === "npx";
        // slop-scan calls process.exit right after writing its JSON. Into a pipe that
        // drops whatever is still buffered (about 64 KB survives); into a file the
        // write is synchronous, so the whole report lands.
        const outFd = fs.openSync(outFile, "w");
        let res;
        try {
            res = spawnSync(argv[0], [...argv.slice(1), "delta", "--base", wt, "--head", ".", "--json"], {
                cwd: top.stdout,
                encoding: "utf-8",
                stdio: ["ignore", outFd, "pipe"],
                maxBuffer: 1 << 28,
            });
        }
        finally {
            fs.closeSync(outFd);
        }
        const stdout = fs.readFileSync(outFile, "utf-8");
        if (res.status !== 0) {
            if (couldNotRun(res, viaNpx)) {
                ctx.log(`slop-scan could not run (${argv.join(" ")}): install it as a dev dependency, or put it on PATH`);
                return EXIT_SLOP_UNAVAILABLE;
            }
            ctx.log(`slop-scan delta failed (exit ${res.status ?? res.signal}):\n${tail(res.stderr ?? "")}`);
            return EXIT_SLOP_FAILED;
        }
        const s = readSummary(stdout);
        if ("missing" in s) {
            ctx.log(`slop-scan delta --json has no ${s.missing} — its output format changed; refusing to pass a gate that would check nothing`);
            return EXIT_SLOP_FAILED;
        }
        ctx.log(`added ${s.addedCount}, resolved ${s.resolvedCount}, worsened ${s.worsenedCount}; ` +
            `net findings ${s.netFindingCount}, net score ${s.netRepoScore.toFixed(2)}`);
        const failed = gateFails(s);
        for (const line of failed
            ? FAIL_GUIDANCE
            : ["OK — no net-new or worsened findings (baseline line-shifts ignored)."]) {
            ctx.log(line);
        }
        ctx.emit({
            passed: !failed,
            skipped: null,
            baseRef,
            base,
            added: s.addedCount,
            resolved: s.resolvedCount,
            worsened: s.worsenedCount,
            netFindingCount: s.netFindingCount,
            netScore: s.netRepoScore,
        });
        return failed ? EXIT.NO : EXIT.OK;
    }, removeWorktree);
}
// ---------------------------------------------------------------------------
// prose
// ---------------------------------------------------------------------------
/** What `bkit ci prose` lints when no `--glob` is given. */
export const DEFAULT_PROSE_GLOBS = ["**/*.md"];
/** Folders the file walk never enters. */
const WALK_SKIP = new Set(["node_modules", ".git"]);
/** Vale's write-good package: gitignored, so absent in every fresh checkout and worktree. */
const WRITE_GOOD = path.join(".vale", "styles", "write-good");
/** A `/`-separated glob (`*`, `**`, `?`) as an anchored regex over `/`-separated paths. */
export function globToRegExp(glob) {
    let re = "";
    for (let i = 0; i < glob.length; i++) {
        const c = glob[i];
        if (c === "*" && glob[i + 1] === "*") {
            const slash = glob[i + 2] === "/";
            re += slash ? "(?:.*/)?" : ".*";
            i += slash ? 2 : 1;
        }
        else if (c === "*")
            re += "[^/]*";
        else if (c === "?")
            re += "[^/]";
        else
            re += c.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    }
    return new RegExp(`^${re}$`);
}
/**
 * Where a glob's walk starts — its literal leading folders, `.` when it starts with a
 * wildcard — and how many levels below that it can match (unbounded with `**`).
 */
function globWalk(glob) {
    const parts = glob.split("/");
    const literal = [];
    for (const part of parts.slice(0, -1)) {
        if (/[*?]/.test(part))
            break;
        literal.push(part);
    }
    return {
        root: literal.length > 0 ? literal.join("/") : ".",
        depth: glob.includes("**") ? Infinity : parts.length - literal.length,
    };
}
/**
 * Every file under `root` down to `depth` levels (relative to `cwd`, `/`-separated).
 * Skips WALK_SKIP folders and never follows a symlinked folder.
 */
function walkFiles(cwd, root, depth) {
    const out = [];
    const visit = (rel, level) => {
        const abs = path.join(cwd, rel);
        if (!fs.existsSync(abs))
            return;
        for (const ent of fs.readdirSync(abs, { withFileTypes: true })) {
            const child = rel === "." ? ent.name : `${rel}/${ent.name}`;
            if (ent.isDirectory()) {
                if (level < depth && !WALK_SKIP.has(ent.name))
                    visit(child, level + 1);
            }
            else if (ent.isFile() || ent.isSymbolicLink()) {
                out.push(child);
            }
        }
    };
    visit(root, 1);
    return out;
}
/** The files the globs select under `cwd`, `/`-separated, sorted, each once. */
export function proseFiles(cwd, globs) {
    const files = new Set();
    for (const given of globs) {
        const glob = given.replace(/^\.\//, "");
        const re = globToRegExp(glob);
        const { root, depth } = globWalk(glob);
        for (const rel of walkFiles(cwd, root, depth)) {
            if (re.test(rel))
                files.add(rel);
        }
    }
    return [...files].sort();
}
/**
 * Put write-good back when it is missing: copy it from the main worktree (no network),
 * else `vale sync`. True when it is present afterwards.
 */
function restoreWriteGood(ctx) {
    const target = path.join(ctx.cwd, WRITE_GOOD);
    if (fs.existsSync(target))
        return true;
    ctx.log(".vale/styles/write-good absent (fresh checkout or worktree) - restoring");
    const common = git(ctx.cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"]);
    const main = common ? path.join(path.dirname(common), WRITE_GOOD) : null;
    if (main && path.resolve(main) !== path.resolve(target) && fs.existsSync(main)) {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.cpSync(main, target, { recursive: true });
        return true;
    }
    // vale's own report goes to stderr: stdout carries this command's one JSON object.
    spawnSync("vale", ["sync"], { cwd: ctx.cwd, stdio: ["ignore", 2, 2] });
    return fs.existsSync(target);
}
function prose(ctx) {
    const given = ctx.flags.glob;
    const globs = Array.isArray(given) && given.length > 0 ? given : DEFAULT_PROSE_GLOBS;
    const skip = (skipped, message) => {
        ctx.log(message);
        ctx.emit({ passed: true, skipped, files: 0 });
        return EXIT.OK;
    };
    if (!onPath("vale")) {
        return skip("vale-missing", "vale not installed - skipping prose lint (install vale, then run vale sync, to enable)");
    }
    if (!restoreWriteGood(ctx)) {
        return skip("write-good-missing", "WARNING - PROSE LINT SKIPPED: vale is installed but .vale/styles/write-good could not be restored (main-worktree copy and vale sync both failed). The prose gate is NOT enforcing here - run: vale sync");
    }
    const files = proseFiles(ctx.cwd, globs);
    if (files.length === 0) {
        return skip("no-files", `no files match ${globs.join(" ")} - nothing to lint`);
    }
    const res = spawnSync("vale", files, { cwd: ctx.cwd, stdio: ["ignore", 2, 2] });
    if (res.error || (res.status !== 0 && res.status !== 1)) {
        ctx.log(`vale failed (${res.error?.message ?? `exit ${res.status ?? res.signal}`})`);
        return EXIT_VALE_FAILED;
    }
    const passed = res.status === 0;
    ctx.emit({ passed, skipped: null, files: files.length });
    return passed ? EXIT.OK : EXIT.NO;
}
// ---------------------------------------------------------------------------
// skip-token
// ---------------------------------------------------------------------------
function skipToken(ctx) {
    const ref = typeof ctx.flags.ref === "string" && ctx.flags.ref !== "" ? ctx.flags.ref : "HEAD";
    const sha = git(ctx.cwd, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
    const message = sha ? commitMessage(ctx.cwd, sha) : null;
    if (!sha || message === null) {
        throw new CommandError(EXIT.USAGE, `cannot read commit '${ref}' in ${ctx.cwd}`);
    }
    const token = SKIP_CI_TOKEN.exec(message)?.[0] ?? null;
    ctx.emit({ ref, sha, token });
    return token === null ? EXIT.NO : EXIT.OK;
}
// ---------------------------------------------------------------------------
// min-push
// ---------------------------------------------------------------------------
/** `bkit.testing.minPushPaths` as git pathspecs: `:(glob)` unless an entry carries its own magic. */
export const minPushPathspecs = (paths) => paths.map((p) => (p.startsWith(":") ? p : `:(glob)${p}`));
/** Where a pushed commit's range starts: its merge-base with origin/dev, else origin/main. */
export function pushBase(cwd, sha) {
    for (const cand of BASE_CANDIDATES) {
        if (!runGit(cwd, ["rev-parse", "--verify", "--quiet", cand]).ok)
            continue;
        const mb = runGit(cwd, ["merge-base", sha, cand]);
        if (mb.ok && mb.stdout)
            return mb.stdout;
    }
    return null;
}
function minPush(ctx) {
    const top = runGit(ctx.cwd, ["rev-parse", "--show-toplevel"]);
    if (!top.ok)
        throw new CommandError(EXIT.USAGE, `not inside a git repository: ${ctx.cwd}`);
    const given = ctx.flags.ref;
    const refs = Array.isArray(given) && given.length > 0 ? given.map(String) : ["HEAD"];
    const baseFlag = typeof ctx.flags.base === "string" && ctx.flags.base ? ctx.flags.base : null;
    const paths = readBkitConfig(top.stdout).minPushPaths;
    const specs = minPushPathspecs(paths);
    const changed = new Set();
    const outside = new Set();
    for (const ref of refs) {
        const sha = git(ctx.cwd, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
        const base = sha ? (baseFlag ?? pushBase(ctx.cwd, sha)) : null;
        const diff = sha && base ? changedOutside(top.stdout, base, sha, specs) : null;
        if (!diff?.ok) {
            const why = !sha
                ? `cannot read commit '${ref}'`
                : !base
                    ? `no base for ${ref} (neither origin/dev nor origin/main resolves)`
                    : `'git diff' failed for ${base}..${ref}: ${diff && !diff.ok ? diff.stderr : ""}`;
            ctx.log(`${why} — not proven a min push`);
            ctx.emit({ minPush: false, reason: "unknown", changed: 0, outside: [], paths });
            return EXIT_RANGE_UNKNOWN;
        }
        for (const p of diff.changed)
            changed.add(p);
        for (const p of diff.outside)
            outside.add(p);
    }
    const result = (reason, code, message) => {
        ctx.log(message);
        ctx.emit({
            minPush: reason === null,
            reason,
            changed: changed.size,
            outside: [...outside].sort(),
            paths,
        });
        return code;
    };
    if (paths.length === 0) {
        return result("no-paths", EXIT.NO, "bkit.testing.minPushPaths is empty — not a min push");
    }
    if (changed.size === 0) {
        return result("no-changes", EXIT.NO, "the push changes no files — not proven a min push");
    }
    if (outside.size > 0) {
        const first = [...outside].sort()[0];
        return result("outside", EXIT.NO, `${outside.size} of ${changed.size} changed files match no min-push path (first: ${first})`);
    }
    return result(null, EXIT.OK, `all ${changed.size} changed files match min-push paths`);
}
export const ciCommand = {
    noun: "ci",
    summary: "Gates CI and the git hooks run.",
    verbs: {
        slop: {
            summary: "Fail when the working tree adds or worsens slop on net against a base ref.",
            flags: [
                {
                    name: "base",
                    type: "string",
                    positional: true,
                    help: "base ref (default: $SLOP_BASE_REF, else merge-base with origin/dev or origin/main, else HEAD~1)",
                },
            ],
            output: {
                passed: "false when the change adds or worsens slop on net",
                skipped: "base-not-found | base-is-head when there was nothing to compare, else null",
                baseRef: "the ref compared against, as resolved",
                base: "its commit SHA (null when not found)",
                added: "findings added (raw; a line-shift counts here)",
                resolved: "findings resolved (raw)",
                worsened: "findings worsened",
                netFindingCount: "net change in finding count — gated on",
                netScore: "net change in slop score — gated on",
            },
            exitCodes: {
                [EXIT_SLOP_UNAVAILABLE]: "slop-scan could not run (not installed or not executable)",
                [EXIT_SLOP_FAILED]: "slop-scan failed, or its JSON lacks the fields the gate reads",
                [EXIT_NO_WORKTREE]: "the base ref could not be checked out as a worktree",
            },
            run: slop,
        },
        prose: {
            summary: "Run Vale over the markdown files the globs select; skip when vale is not installed.",
            flags: [
                {
                    name: "glob",
                    type: "string",
                    repeatable: true,
                    help: "files to lint, relative to the working directory (`*`, `**`, `?`; node_modules skipped; default `**/*.md`)",
                },
            ],
            output: {
                passed: "false when vale reported alerts",
                skipped: "vale-missing | write-good-missing | no-files when nothing was linted, else null",
                files: "how many files vale linted",
            },
            exitCodes: {
                [EXIT_VALE_FAILED]: "vale could not run, or ended with a runtime error",
            },
            run: prose,
        },
        "skip-token": {
            summary: "Whether a commit message carries a GitHub skip-CI token ([skip ci] and kin).",
            flags: [{ name: "ref", type: "string", help: "commit to read (default HEAD)" }],
            output: {
                ref: "the ref read",
                sha: "its commit SHA",
                token: "the first skip-CI token in the message, else null",
            },
            run: skipToken,
        },
        "min-push": {
            summary: "Exit 0 when every file a push changes matches bkit.testing.minPushPaths (the pre-push light gate).",
            flags: [
                {
                    name: "ref",
                    type: "string",
                    repeatable: true,
                    help: "a pushed commit (default HEAD); its range starts at its merge-base with origin/dev, else origin/main",
                },
                { name: "base", type: "string", help: "start every range here instead" },
            ],
            output: {
                minPush: "true when every changed file matches bkit.testing.minPushPaths",
                reason: "null when a min push; else no-paths | no-changes | outside | unknown",
                changed: "files the push changes, across every ref",
                outside: "the changed files no min-push path matches",
                paths: "bkit.testing.minPushPaths as read",
            },
            exitCodes: {
                [EXIT_RANGE_UNKNOWN]: "a pushed commit, its base, or its git diff could not be read",
            },
            run: minPush,
        },
    },
};
