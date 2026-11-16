// Local full-gate receipts, shared by linked worktrees and bound to committed trees.
import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { gitEnv } from "../../ledgers/telemetry.js";
import { parseJson, readJsonFile } from "../../shared/json.js";
import { readPackageJson } from "../../shared/package-json.js";
import { scriptCommand, testCommand } from "../../shared/package-manager.js";
import { classifyLockOutcome, EXIT, git, LOCK_STATUS_FILE_ENV, lockStatusFile, outboxRoot, readLockStatus, runGit, } from "../lib.js";
import { pidAlive } from "../workflow/disk.js";
const UNIT = "bkit:gate:static-unit";
const INTEGRATION = "bkit:gate:static-unit-integration";
const SHA = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;
function scriptsOf(pkg) {
    if (!pkg || typeof pkg !== "object" || !("scripts" in pkg))
        return null;
    const scripts = pkg.scripts;
    if (!scripts || typeof scripts !== "object" || Array.isArray(scripts))
        return null;
    return scripts;
}
function gateDefinition(pkg) {
    const values = scriptsOf(pkg);
    if (!values)
        return null;
    const gate = typeof values[INTEGRATION] === "string" ? INTEGRATION : UNIT;
    if (typeof values[gate] !== "string" || values[gate].trim() === "")
        return null;
    const fingerprint = createHash("sha256")
        .update(JSON.stringify(Object.entries(values).sort(([a], [b]) => a.localeCompare(b))))
        .digest("hex");
    return { gate, fingerprint };
}
/** The deepest full push gate declared by this checkout. */
export function requiredPushGate(cwd) {
    const pkg = readPackageJson(cwd);
    return pkg.ok ? (gateDefinition(pkg.pkg)?.gate ?? null) : null;
}
const receiptPath = (cwd, sha) => {
    const outbox = outboxRoot(cwd);
    return outbox ? path.join(outbox, "push-gates", `${sha}.json`) : null;
};
const STATUS = [
    "status",
    "--porcelain",
    "--no-renames",
    "--untracked-files=all",
    "--ignore-submodules=none",
];
const lineCount = (text) => text === null ? -1 : text === "" ? 0 : text.split("\n").length;
/** HEAD when every uncommitted path lies inside `tolerated` (none given: the tree must be clean). */
function cleanHead(cwd, tolerated = []) {
    const all = lineCount(git(cwd, STATUS));
    if (all < 0)
        return null;
    if (all > 0) {
        if (tolerated.length === 0)
            return null;
        if (lineCount(git(cwd, [...STATUS, "--", ...tolerated])) !== all)
            return null;
    }
    const sha = git(cwd, ["rev-parse", "--verify", "HEAD^{commit}"]);
    const tree = git(cwd, ["rev-parse", "--verify", "HEAD^{tree}"]);
    return sha && tree ? { sha, tree } : null;
}
/** The recorded runner's process id of a `.running` attempt file; null when unreadable. */
function attemptPid(file) {
    const read = readJsonFile(file);
    if (!read.ok || !read.value || typeof read.value !== "object")
        return null;
    const pid = read.value.pid;
    return typeof pid === "number" && Number.isInteger(pid) && pid > 0 ? pid : null;
}
/**
 * Run a gate through `run` and record its receipt: the `.running` marker while it runs, a
 * `.failed` marker when it fails, the before/after HEAD and fingerprint check, and the
 * receipt write. An attempt on the same commit whose runner process is gone counts as a
 * failed run and is cleared. Uncommitted paths in `tolerated` do not block the receipt; a
 * lock wait (`waited`, default never) leaves the receipt and markers as they were.
 */
export function runWithReceipt(cwd, gate, tolerated, run, log, waited = () => false) {
    const pkg = readPackageJson(cwd);
    const definition = pkg.ok ? gateDefinition(pkg.pkg) : null;
    const before = cleanHead(cwd, tolerated);
    const head = git(cwd, ["rev-parse", "--verify", "HEAD^{commit}"]);
    const file = head ? receiptPath(cwd, head) : null;
    const attempt = file && definition?.gate === gate ? path.join(`${file}.running`, randomUUID()) : null;
    const fail = () => {
        if (!attempt || !file)
            return;
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(`${file}.failed`, JSON.stringify({ version: 1, sha: head, gate, passed: false }) + "\n");
        fs.rmSync(file, { force: true });
    };
    if (attempt) {
        const dir = path.dirname(attempt);
        fs.mkdirSync(dir, { recursive: true });
        for (const entry of fs.readdirSync(dir)) {
            const pid = attemptPid(path.join(dir, entry));
            if (pid === null || pidAlive(pid))
                continue;
            fs.rmSync(path.join(dir, entry), { force: true });
            fail();
        }
        fs.writeFileSync(attempt, JSON.stringify({ pid: process.pid, sha: head }) + "\n");
    }
    const finish = (code) => {
        if (attempt)
            fs.rmSync(attempt, { force: true });
        return code;
    };
    const status = run();
    if (waited(status))
        return finish(status);
    if (status !== 0 || !before || definition?.gate !== gate) {
        fail();
        return finish(status);
    }
    const after = cleanHead(cwd, tolerated);
    const afterPkg = readPackageJson(cwd);
    if (after?.sha !== before.sha ||
        after.tree !== before.tree ||
        !afterPkg.ok ||
        gateDefinition(afterPkg.pkg)?.fingerprint !== definition.fingerprint) {
        log("full gate passed, but the checkout changed — no reusable push receipt");
        fail();
        return finish(status);
    }
    if (file) {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, JSON.stringify({ version: 1, ...before, ...definition, passed: true }) + "\n");
        fs.rmSync(`${file}.failed`, { force: true });
        log(`recorded full push gate for ${before.sha}`);
    }
    return finish(status);
}
/**
 * Execute a consumer gate; only a successful deepest full gate on an unchanged clean tree earns
 * proof. A tests-lock wait (the lock wrapper gave up, exit 75) leaves the receipt and its
 * markers as they were, and its status file is handed on to a caller that asked for one.
 */
export function runPushGate(cwd, gate, log) {
    const pkg = readPackageJson(cwd);
    const script = pkg.ok ? scriptsOf(pkg.pkg)?.[gate] : null;
    if (typeof script !== "string" || script.trim() === "") {
        log(`package.json must declare a non-empty ${gate} script`);
        return EXIT.USAGE;
    }
    const env = gitEnv();
    const outerStatus = env[LOCK_STATUS_FILE_ENV];
    const lock = { status: null };
    return runWithReceipt(cwd, gate, [], () => {
        const argv = testCommand(scriptCommand(gate));
        log(`running ${scriptCommand(gate).join(" ")}`);
        const statusPath = lockStatusFile();
        const result = spawnSync(argv[0], argv.slice(1), {
            cwd,
            env: {
                ...env,
                LOCAL_STACK_LOCK_WHO: env.LOCAL_STACK_LOCK_WHO || `bkit ci push-gate ${gate}`,
                [LOCK_STATUS_FILE_ENV]: statusPath,
            },
            stdio: ["ignore", 2, 2],
        });
        if (result.error)
            log(result.error.message);
        if (outerStatus && fs.statSync(statusPath, { throwIfNoEntry: false })?.isFile())
            fs.copyFileSync(statusPath, outerStatus);
        lock.status = readLockStatus(statusPath);
        return result.error
            ? 127
            : (result.status ??
                128 + ((result.signal ? os.constants.signals[result.signal] : undefined) ?? 1));
    }, log, (code) => classifyLockOutcome(code, lock.status) === "lock-wait");
}
/** Pending files survive interrupted runners; one read suffices to block earlier proof. */
function pendingAttempt(file) {
    const dir = `${file}.running`;
    if (!fs.existsSync(dir))
        return false;
    const handle = fs.opendirSync(dir);
    try {
        return handle.readSync() !== null;
    }
    finally {
        handle.closeSync();
    }
}
function validReceipt(cwd, file, sha, definition) {
    const read = readJsonFile(file);
    if (!read.ok || !read.value || typeof read.value !== "object")
        return false;
    const receipt = read.value;
    return (receipt.version === 1 &&
        receipt.passed === true &&
        receipt.sha === sha &&
        receipt.gate === definition.gate &&
        receipt.fingerprint === definition.fingerprint &&
        receipt.tree === git(cwd, ["rev-parse", `${sha}^{tree}`]));
}
/** Every commit not covered by this success must be free of failed or unreadable gate evidence. */
function noLaterFailure(cwd, dir, sha, newSha, definition) {
    const range = git(cwd, ["rev-list", "--max-count=129", newSha, `^${sha}`]);
    if (range === null)
        return false;
    const commits = range ? range.split("\n") : [];
    if (commits.length > 128)
        return false;
    for (const commit of [sha, ...commits]) {
        const file = path.join(dir, `${commit}.json`);
        if (fs.existsSync(`${file}.failed`) ||
            pendingAttempt(file) ||
            (fs.existsSync(file) && !validReceipt(cwd, file, commit, definition)))
            return false;
    }
    return true;
}
/** A bounded ancestor search; absent, malformed or stale proof always requires the full gate. */
export function hasVerifiedIncrement(cwd, oldSha, newSha, outsideOf) {
    const isNew = /^0+$/.test(oldSha);
    if ((!isNew && !SHA.test(oldSha)) ||
        !SHA.test(newSha) ||
        (!isNew && !runGit(cwd, ["merge-base", "--is-ancestor", oldSha, newSha]).ok))
        return false;
    const raw = git(cwd, ["show", `${newSha}:package.json`]);
    const parsed = raw === null ? null : parseJson(raw);
    const definition = parsed?.ok ? gateDefinition(parsed.value) : null;
    const localPkg = readPackageJson(cwd);
    if (!definition ||
        !localPkg.ok ||
        gateDefinition(localPkg.pkg)?.fingerprint !== definition.fingerprint)
        return false;
    const ancestors = git(cwd, ["rev-list", "--max-count=128", isNew ? newSha : oldSha]);
    const firstFile = receiptPath(cwd, newSha);
    if (!ancestors || !firstFile)
        return false;
    const dir = path.dirname(firstFile);
    for (const sha of ancestors.split("\n")) {
        const file = path.join(dir, `${sha}.json`);
        if (!validReceipt(cwd, file, sha, definition))
            continue;
        const diff = outsideOf(sha, newSha);
        if (diff.ok && diff.outside.length === 0 && noLaterFailure(cwd, dir, sha, newSha, definition))
            return true;
    }
    return false;
}
