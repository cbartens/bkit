// commands/workflow/tests-changed.ts — `bkit tests changed`: check only what a step changed.
//
// An agent step runs its gate after every change. This verb computes the files the step
// changed and hands them to the consumer's `bkit:gate:changed`, which runs the tests that
// import them, the tests that name their paths and static checks on them. Undeclared →
// the --fallback whole gate runs, exactly as before the script existed.
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { BKIT_GATE_CHANGED_SCRIPT } from "../../install/manifest.js";
import { CommandError, EXIT, git, runGit, wholeNumber } from "../lib.js";
import { readPackageJson } from "../../shared/package-json.js";
import { COULD_NOT_RUN_EXIT_CODES, scriptCommand } from "../../shared/package-manager.js";
import { runGateUnderLock } from "./junit.js";
import { readRecord } from "./ledgers.js";
import { stepBase, stepRun } from "./step-base.js";
/** A run's status ledger: bookkeeping, never a file the gate checks (another feature's run commits one too). */
const RUN_STATUS_FILE = /^docs\/plans\/[^/]+\/logs\/[^/]+\/status\.jsonl$/;
/** Exit code: neither `bkit:gate:changed` nor the --fallback gate is declared. */
const EXIT_NO_GATE = 3;
/** Exit code: the gate could not run (exit 126 / 127, or the package runner is missing). */
const EXIT_COULD_NOT_RUN = 4;
/** The NUL-separated paths `git <args>` prints in `top`; none when it fails. */
const gitPaths = (top, args) => (git(top, args) ?? "").split("\0").filter(Boolean);
/**
 * Files changed since `base`, repo-relative and sorted: uncommitted (staged or not),
 * untracked and not ignored, plus every file a commit after `base` touched. Existing
 * files only: a deleted file is a change `deletedFiles` lists, and `importersOf` turns
 * into the files that still mention it.
 */
export function changedFiles(top, base) {
    const all = new Set([
        ...gitPaths(top, ["diff", "--name-only", "--no-renames", "-z", "HEAD"]),
        ...gitPaths(top, ["ls-files", "--others", "--exclude-standard", "-z"]),
        ...gitPaths(top, ["diff", "--name-only", "--no-renames", "-z", `${base}...HEAD`]),
    ]);
    return [...all]
        .filter((f) => !RUN_STATUS_FILE.test(f) && fs.existsSync(path.join(top, f)))
        .sort();
}
/**
 * A commit holding the working tree as it is now: tracked files as edited, untracked files
 * that are not ignored, deleted files gone; its parent is HEAD (none before the first
 * commit). It is built in a copy of the index, so no ref, the index and the working tree
 * stay as they were; no ref points at it, and `git gc` prunes it once unreachable objects
 * expire. Null when git cannot build it.
 */
export function snapshotTree(top) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-snapshot-"));
    try {
        const index = path.join(dir, "index");
        const real = git(top, ["rev-parse", "--path-format=absolute", "--git-path", "index"]);
        // The real index's stat data lets `git add -A` skip unchanged files instead of hashing them.
        if (real !== null && fs.existsSync(real))
            fs.copyFileSync(real, index);
        const env = { GIT_INDEX_FILE: index };
        if (!runGit(top, ["add", "-A"], env).ok)
            return null;
        const tree = runGit(top, ["write-tree"], env);
        if (!tree.ok)
            return null;
        const head = git(top, ["rev-parse", "-q", "--verify", "HEAD^{commit}"]);
        const commit = runGit(top, [
            "-c",
            "user.name=bkit",
            "-c",
            "user.email=bkit@localhost",
            "commit-tree",
            "--no-gpg-sign",
            tree.stdout,
            ...(head === null ? [] : ["-p", head]),
            "-m",
            "bkit tested snapshot",
        ]);
        return commit.ok ? commit.stdout : null;
    }
    finally {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}
/** Whether `sha` names a commit the object store still holds. */
export const commitExists = (top, sha) => git(top, ["cat-file", "-e", `${sha}^{commit}`]) !== null;
/**
 * The files that differ between snapshot `from` and the working tree now (`now`, else a
 * fresh `snapshotTree`), sorted: `files` the ones that exist now, `deleted` the ones that do
 * not. Null when `from` is gone from the object store or the tree cannot be snapshotted.
 */
export function changedBetween(top, from, now = snapshotTree(top)) {
    if (now === null || !commitExists(top, from))
        return null;
    const listed = runGit(top, ["diff", "--name-only", "--no-renames", "-z", from, now]);
    if (!listed.ok)
        return null;
    const all = listed.stdout.split("\0").filter(Boolean).sort();
    const exists = (f) => fs.existsSync(path.join(top, f));
    return { files: all.filter(exists), deleted: all.filter((f) => !exists(f)) };
}
/**
 * Files removed since `base`, repo-relative and sorted: deleted in the working tree or
 * the index, or by a commit after `base`, and missing from the working tree now.
 */
export function deletedFiles(top, base) {
    const all = new Set([
        ...gitPaths(top, ["diff", "--name-only", "--no-renames", "--diff-filter=D", "-z", "HEAD"]),
        ...gitPaths(top, [
            "diff",
            "--name-only",
            "--no-renames",
            "--diff-filter=D",
            "-z",
            `${base}...HEAD`,
        ]),
    ]);
    return [...all].filter((f) => !fs.existsSync(path.join(top, f))).sort();
}
/**
 * For each deleted file, the files of the `base` tree that mention its name without the
 * extension (`git grep -l -F`) and still exist, sorted; a file nothing mentions maps to
 * `[]`. Null when a search fails (`base` names no tree, or the tree cannot be read):
 * the caller cannot tell which tests the deletion touches.
 */
export function importersOf(top, base, deleted) {
    const found = new Map();
    for (const file of deleted) {
        const name = path.basename(file, path.extname(file));
        const res = runGit(top, ["grep", "-l", "-z", "-F", "-e", name, base, "--"]);
        // Exit 1 with nothing on stderr is "no match". Any stderr fails the search: git grep
        // exits 0 when it found a match even though it could not read another blob.
        if (res.stderr !== "")
            return null;
        const prefix = `${base}:`;
        found.set(file, res.stdout
            .split("\0")
            .filter(Boolean)
            .map((hit) => (hit.startsWith(prefix) ? hit.slice(prefix.length) : hit))
            .filter((hit) => !deleted.includes(hit) && fs.existsSync(path.join(top, hit)))
            .sort());
    }
    return found;
}
/** Whether `dir/package.json` declares `name` as a non-empty script. */
export function declares(dir, name) {
    const read = readPackageJson(dir);
    const scripts = read.ok ? read.pkg.scripts : undefined;
    if (typeof scripts !== "object" || scripts === null)
        return false;
    const body = scripts[name];
    return typeof body === "string" && body.trim() !== "";
}
export const testsChangedVerb = {
    summary: `Check only the files changed since --base: run \`${BKIT_GATE_CHANGED_SCRIPT}\` with them as arguments, else the --fallback gate; exit 0 PASS or nothing changed, 1 FAIL, 4 could not run, 81 tests lock held (read from the lock status file, never from the exit code alone).`,
    use: "by-hand",
    flags: [
        {
            name: "lock-wait-s",
            type: "string",
            help: "whole-number lock wait >= 0, passed as LOCAL_STACK_LOCK_WAIT_S (default BKIT_LOCK_WAIT_S, else 60)",
        },
        {
            name: "base",
            type: "string",
            help: "commit the step began after; files committed after it count as changed (default: the commit holding the active run's last step-done row, else HEAD; a run in place on a shared branch always uses HEAD)",
        },
        {
            name: "fallback",
            type: "string",
            help: `gate script run, with no file arguments and whatever changed, when package.json does not declare \`${BKIT_GATE_CHANGED_SCRIPT}\``,
        },
    ],
    output: {
        files: "the changed files, repo-relative and sorted (deleted files left out)",
        gate: `the script that ran (\`${BKIT_GATE_CHANGED_SCRIPT}\` or the --fallback gate), or null when nothing ran`,
        scope: "the command that ran, without the file arguments, or null",
        exitCode: "the gate's exit code, or null when nothing ran",
        verdict: "PASS / FAIL, or null when nothing ran or the gate could not run",
        lockHolder: "tests-lock holder when the wait gave up, else null",
    },
    exitCodes: {
        [EXIT_NO_GATE]: `neither \`${BKIT_GATE_CHANGED_SCRIPT}\` nor the --fallback gate is declared in package.json`,
        [EXIT_COULD_NOT_RUN]: "the gate could not run (exit 126 / 127): not a test failure",
    },
    run: (ctx) => {
        const waitSource = ctx.flags.lockWaitS ?? process.env.BKIT_LOCK_WAIT_S;
        const waitS = wholeNumber(waitSource, ctx.flags.lockWaitS === undefined && process.env.BKIT_LOCK_WAIT_S !== undefined
            ? "lock-wait-s (BKIT_LOCK_WAIT_S)"
            : "lock-wait-s", 60);
        const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
        let base;
        if (typeof ctx.flags.base === "string")
            base = ctx.flags.base;
        else {
            // A run in place on a shared branch has other agents' commits after its last step-done commit.
            const run = stepRun({ cwd: top });
            const inPlace = run !== undefined && readRecord(top, path.basename(path.dirname(run.file))) !== null;
            const fromRun = inPlace ? null : stepBase({ cwd: top });
            if (fromRun === null)
                ctx.log("no active run with a step-done row — measuring from HEAD");
            base = fromRun ?? "HEAD";
        }
        if (git(top, ["rev-parse", "-q", "--verify", `${base}^{commit}`]) === null)
            throw new CommandError(EXIT.USAGE, `--base ${base} names no commit`);
        const fallback = typeof ctx.flags.fallback === "string" ? ctx.flags.fallback : undefined;
        const files = changedFiles(top, base);
        ctx.log(files.length === 0
            ? "no changed files"
            : `${files.length} changed file(s): ${files.join(" ")}`);
        let gate;
        let argv;
        if (declares(top, BKIT_GATE_CHANGED_SCRIPT)) {
            if (files.length === 0) {
                ctx.emit({
                    files,
                    gate: null,
                    scope: null,
                    exitCode: null,
                    verdict: null,
                    lockHolder: null,
                });
                return EXIT.OK;
            }
            gate = BKIT_GATE_CHANGED_SCRIPT;
            argv = [...scriptCommand(gate), ...files];
        }
        else if (fallback !== undefined && declares(top, fallback)) {
            ctx.log(`${BKIT_GATE_CHANGED_SCRIPT} is not declared — running the whole ${fallback} gate`);
            gate = fallback;
            argv = scriptCommand(gate);
        }
        else {
            ctx.log(`neither ${BKIT_GATE_CHANGED_SCRIPT} nor ${fallback ?? "a --fallback gate"} is declared in package.json (.bkit/workflows.md § Local gate scripts)`);
            return EXIT_NO_GATE;
        }
        const scope = scriptCommand(gate).join(" ");
        ctx.log(`running ${scope}`);
        const who = `bkit tests changed ${gate}`;
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tests-changed-"));
        const log = path.join(dir, "out.log");
        let run;
        try {
            run = runGateUnderLock(argv, top, log, {
                LOCAL_STACK_LOCK_WAIT_S: String(waitS),
                LOCAL_STACK_LOCK_WHO: who,
            });
            for (const line of fs.readFileSync(log, "utf-8").split(/\r?\n/))
                if (line !== "")
                    ctx.log(line);
        }
        finally {
            fs.rmSync(dir, { recursive: true, force: true });
        }
        const { exitCode, status: lockStatus, lock: lockExit } = run;
        const couldNotRun = lockExit === "could-not-run" || COULD_NOT_RUN_EXIT_CODES.has(exitCode);
        const lockWait = lockExit === "lock-wait";
        const verdict = couldNotRun || lockWait ? null : exitCode === 0 ? "PASS" : "FAIL";
        const lockHolder = lockWait ? (lockStatus?.holder ?? null) : null;
        ctx.emit({ files, gate, scope, exitCode, verdict, lockHolder });
        if (lockWait)
            return EXIT.AGENT_WAIT;
        if (couldNotRun)
            return EXIT_COULD_NOT_RUN;
        return exitCode === 0 ? EXIT.OK : EXIT.NO;
    },
};
