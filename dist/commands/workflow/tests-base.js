// commands/workflow/tests-base.ts — `bkit tests base`: do the gate's failing tests also fail on
// the commit the branch started from?
//
// A red group gate or final run pauses the build. Whether a fix round could help depends on
// where the failure comes from: the branch, or `dev`. This verb answers that from a passing CI
// run at the base sha, else from a throwaway checkout of the base commit that re-runs only the
// failing test files. Exit 0 for every verdict; only a usage error exits non-zero.
//
// A leaf of the verb graph: it imports nothing from `tests.ts`, and reaches `runs.ts` only
// through a dynamic import inside the handler.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { BKIT_TEST_FILE_SCRIPT } from "../../install/manifest.js";
import { parseJson } from "../../shared/json.js";
import { readBkitConfig } from "../../shared/settings.js";
import { readPackageJson } from "../../shared/package-json.js";
import { withCleanup } from "../ci/ci.js";
import { dropLandTree } from "../land.js";
import { CommandError, EXIT, git, mainCheckoutRoot, runGh, runGit } from "../lib.js";
import { reportFailures, runTestFile, countReportFailures } from "./junit.js";
import { latestRuntimeRow } from "./runtime.js";
import { resolveOwnerRepo } from "./repo.js";
import { copyListed, devBase, install } from "./worktrees.js";
/** A repo-relative path with no `..` segment and no root, in `/` form; else null. */
function safeRelative(p) {
    const norm = path.posix.normalize(p.replace(/\\/g, "/"));
    if (norm === "." || norm.startsWith("/") || /^[a-z]:/i.test(norm))
        return null;
    if (norm.split("/").includes(".."))
        return null;
    return norm;
}
/**
 * The tracked repo file a failing case ran in: its `file` attribute when that is a tracked
 * repo-relative path, else its `classname` when that is one, else the one tracked file whose
 * basename is the `classname`'s. Null when none applies or two match. An untracked, absolute
 * or `..` path is never returned.
 */
export function caseFile(c, tracked) {
    const set = new Set(tracked);
    for (const candidate of [c.file, c.classname]) {
        if (candidate === null)
            continue;
        const rel = safeRelative(candidate);
        if (rel !== null && set.has(rel))
            return rel;
    }
    if (c.classname === null)
        return null;
    const rel = safeRelative(c.classname);
    if (rel === null)
        return null;
    const base = path.posix.basename(rel);
    const hits = tracked.filter((t) => path.posix.basename(t) === base);
    return hits.length === 1 ? hits[0] : null;
}
/** Fold per-case base outcomes into one verdict with counts. */
export function baseVerdict(cases) {
    const failing = cases.length;
    const baseRed = cases.filter((c) => c.atBase === "red").length;
    const branch = cases.filter((c) => c.atBase === "pass" || c.atBase === "absent").length;
    const undetermined = failing - baseRed - branch;
    const counts = { failing, baseRed, branch, undetermined };
    if (failing === 0)
        return { verdict: "unknown", reason: "gate red with no failing test case", ...counts };
    if (baseRed === failing)
        return { verdict: "all", reason: null, ...counts };
    if (baseRed === 0 && undetermined === 0)
        return { verdict: "none", reason: null, ...counts };
    if (baseRed === 0)
        return {
            verdict: "unknown",
            reason: `${undetermined} case(s) with no resolvable result at the base commit`,
            ...counts,
        };
    return {
        verdict: "some",
        reason: undetermined > 0
            ? `${undetermined} case(s) with no resolvable result at the base commit`
            : null,
        ...counts,
    };
}
const str = (v) => (typeof v === "string" && v !== "" ? v : undefined);
function readRows(file) {
    if (!fs.existsSync(file))
        throw new CommandError(EXIT.USAGE, `--file ${file} does not exist`);
    const rows = [];
    for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
        if (line.trim() === "")
            continue;
        const read = parseJson(line);
        // A malformed line is not a row.
        if (read.ok && typeof read.value === "object" && read.value !== null)
            rows.push(read.value);
    }
    return rows;
}
export const testsBaseVerb = {
    summary: "Check whether the failing tests of a red gate also fail on the commit the branch started from; exit 0 for every verdict.",
    use: "workflow",
    flags: [
        { name: "log", type: "string", help: "the gate log; its JUnit reports are in {log}.reports" },
        { name: "file", type: "string", help: "the run's status.jsonl" },
        { name: "workflow", type: "string", help: "the workflow whose runtime row sets `adopt`" },
        { name: "out", type: "string", help: "also write the output JSON to this path" },
    ],
    output: {
        verdict: "all / some / none / unknown",
        reason: "why the verdict is unknown, or which cases could not be checked for some; else null",
        base: "the base commit sha, or null",
        source: "ci (a passing push-event CI run at the base sha), local (a run at the base commit), or null",
        failing: "the gate's failing test cases",
        baseRed: "of those, how many also fail at the base commit",
        branch: "of those, how many pass or do not exist at the base commit",
        undetermined: "of those, how many could not be checked",
        adopt: "true when the run has no worktrees (runtimeWorktrees false)",
        cases: "each failing case: {name, file, atBase: red / pass / absent / unknown}",
    },
    run: async (ctx) => {
        const log = str(ctx.flags.log);
        const file = str(ctx.flags.file);
        const workflow = str(ctx.flags.workflow);
        for (const [flag, value] of [
            ["log", log],
            ["file", file],
            ["workflow", workflow],
        ])
            if (value === undefined)
                throw new CommandError(EXIT.USAGE, `--${flag} is required`);
        const out = str(ctx.flags.out);
        const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
        const runtime = latestRuntimeRow(readRows(file), workflow);
        const adopt = runtime?.runtimeWorktrees === false;
        const finish = (r) => {
            const output = { ...r, adopt };
            if (out) {
                fs.mkdirSync(path.dirname(out), { recursive: true });
                fs.writeFileSync(out, `${JSON.stringify(output, null, 2)}\n`);
            }
            ctx.emit({ ...output });
            return EXIT.OK;
        };
        const unknown = (reason, base, cases = []) => finish({
            ...baseVerdict(cases),
            verdict: "unknown",
            reason,
            base,
            source: null,
            cases,
        });
        const reports = `${log}.reports`;
        const count = fs.existsSync(reports) ? countReportFailures(reports) : null;
        if (count === null)
            return unknown("no JUnit report", null);
        const failures = reportFailures(reports) ?? [];
        if (failures.length === 0)
            return finish({ ...noCases(), base: null, source: null, cases: [] });
        const tracked = (git(top, ["ls-files", "-z"]) ?? "").split("\0").filter(Boolean);
        const resolved = failures.map((c) => ({ c, file: caseFile(c, tracked) }));
        const rowsWith = (at) => resolved.map(({ c, file: f }) => ({ name: c.name, file: f, atBase: at(c, f) }));
        const mergeBase = git(top, ["merge-base", "HEAD", devBase(top)]);
        if (mergeBase === null)
            return unknown("no base commit", null, rowsWith(() => "unknown"));
        const base = mergeBase;
        // A passing push-event CI run at the exact base sha settles "none" without a checkout.
        const repo = resolveOwnerRepo(top);
        if (repo !== null) {
            const { shipGate } = await import("./runs.js");
            const gate = shipGate({ root: top, head: base, repo: repo.ownerRepo, event: "push" }, (args) => runGh(top, args), ctx.log);
            if (gate.passed && gate.skippedLanes.length === 0) {
                const cases = rowsWith(() => "pass");
                return finish({ ...baseVerdict(cases), base, source: "ci", cases });
            }
        }
        if (!readBkitConfig(top).worktreeInstall)
            return unknown("no install at the base commit (worktreeInstall off)", base, rowsWith(() => "unknown"));
        const files = [...new Set(resolved.flatMap((r) => (r.file === null ? [] : [r.file])))];
        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-base-"));
        const logDir = `${log}.base`;
        const baseRun = () => {
            const result = { reason: null, files: new Map(), exits: new Map() };
            const added = runGit(top, [
                "-c",
                "core.hooksPath=/dev/null",
                "worktree",
                "add",
                "-q",
                "--detach",
                tmp,
                base,
            ]);
            if (!added.ok)
                return { ...result, reason: "base checkout failed" };
            copyListed(mainCheckoutRoot(top) ?? top, tmp, readBkitConfig(top).worktreeCopy, ctx.log);
            const pkg = readPackageJson(tmp);
            const scripts = pkg.ok ? pkg.pkg.scripts : undefined;
            const declared = typeof scripts === "object" &&
                scripts !== null &&
                typeof scripts[BKIT_TEST_FILE_SCRIPT] === "string";
            if (!declared)
                return { ...result, reason: `${BKIT_TEST_FILE_SCRIPT} not declared at the base commit` };
            const status = install(tmp, ctx.log, { preferOffline: true });
            if (status !== 0)
                return { ...result, reason: `base install failed (exit ${status})` };
            files.forEach((f, n) => {
                if (!fs.existsSync(path.join(tmp, f)))
                    return;
                const ran = runTestFile(tmp, f, path.join(logDir, `${n}.log`));
                result.files.set(f, ran.cases);
                result.exits.set(f, ran.exitCode);
            });
            return result;
        };
        const run = await withCleanup(baseRun, () => dropLandTree(top, tmp));
        if (run.reason !== null)
            return unknown(run.reason, base, rowsWith(() => "unknown"));
        let noReport = false;
        let crashed = null;
        let skipped = 0;
        const cases = rowsWith((c, f) => {
            if (f === null)
                return "unknown";
            if (!run.files.has(f))
                return "absent";
            const ran = run.files.get(f);
            if (ran === null || ran === undefined) {
                noReport = true;
                return "unknown";
            }
            const same = ran.find((b) => b.name === c.name);
            if (same === undefined) {
                const exit = run.exits.get(f) ?? 0;
                if (exit !== 0) {
                    crashed ??= exit;
                    return "unknown";
                }
                return "absent";
            }
            if (same.state === "failure" || same.state === "error")
                return "red";
            if (same.state === "passed")
                return "pass";
            skipped += 1;
            return "unknown";
        });
        const verdict = baseVerdict(cases);
        if (verdict.verdict === "unknown" || verdict.verdict === "some") {
            const unresolved = cases.filter((c) => c.file === null).length;
            const reason = noReport
                ? "no report from the base run"
                : crashed !== null
                    ? `the base run of a test file exited ${crashed} without the failing case`
                    : unresolved > 0
                        ? `${unresolved} case(s) with no resolvable file`
                        : skipped > 0
                            ? `${skipped} case(s) skipped at the base commit`
                            : verdict.reason;
            return finish({ ...verdict, reason, base, source: "local", cases });
        }
        return finish({ ...verdict, base, source: "local", cases });
    },
};
function noCases() {
    return baseVerdict([]);
}
