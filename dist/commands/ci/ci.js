// bkit ci slop — the enforcing slop gate (`slop:delta`).
//
// `lint:slop` (`slop-scan scan`) only reports. This gate checks the base ref out as
// a detached worktree, runs `slop-scan delta` against the working tree, and fails
// when the change makes the repo worse on NET: more findings, or a higher score.
// It gates on the net figures, not on "added": slop-scan's delta is keyed by
// position, so editing above a pre-existing finding reports it as resolved at the
// old line and added at the new one, netting to zero. The pre-existing baseline is
// never the change's to fix.
import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { CommandError, EXIT, parseJson, runGit, } from "../lib.js";
/** Exit code: slop-scan could not be started (not installed, not executable). */
export const EXIT_SLOP_UNAVAILABLE = 3;
/** Exit code: slop-scan ran but failed, or its JSON lacks the fields the gate reads. */
export const EXIT_SLOP_FAILED = 4;
/** Exit code: the base ref could not be checked out as a worktree. */
export const EXIT_NO_WORKTREE = 5;
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
    const onPath = spawnSync("/bin/sh", ["-c", "command -v slop-scan"], { env }).status === 0;
    return onPath ? ["slop-scan"] : ["npx", "--no-install", "slop-scan"];
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
const tail = (text, lines = 20) => text.trim().split("\n").slice(-lines).join("\n");
/**
 * Run `body`, then `cleanup` even if SIGINT / SIGTERM arrives meanwhile, then let
 * the signal take its default effect. Without the listeners Node dies on the
 * signal and leaves the base worktree registered in the repo.
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
        // A signal that arrived during a blocking spawn is dispatched on the next tick.
        await new Promise((resolve) => setImmediate(resolve));
        for (const sig of CLEANUP_SIGNALS)
            process.off(sig, onSignal);
        if (received[0])
            process.kill(process.pid, received[0]);
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
export const ciCommand = {
    noun: "ci",
    summary: "Gates CI and the pre-push hook run.",
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
    },
};
