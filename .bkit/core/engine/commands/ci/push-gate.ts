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
import { EXIT, git, outboxRoot, runGit } from "../lib.js";
import { changedOutside } from "../workflow/ledgers.js";

const UNIT = "bkit:gate:static-unit";
const INTEGRATION = "bkit:gate:static-unit-integration";
const SHA = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;

function scriptsOf(pkg: unknown): Record<string, unknown> | null {
  if (!pkg || typeof pkg !== "object" || !("scripts" in pkg)) return null;
  const scripts = pkg.scripts;
  if (!scripts || typeof scripts !== "object" || Array.isArray(scripts)) return null;
  return scripts as Record<string, unknown>;
}

function gateDefinition(pkg: unknown): { gate: string; fingerprint: string } | null {
  const values = scriptsOf(pkg);
  if (!values) return null;
  const gate = typeof values[INTEGRATION] === "string" ? INTEGRATION : UNIT;
  if (typeof values[gate] !== "string" || values[gate].trim() === "") return null;
  const fingerprint = createHash("sha256")
    .update(JSON.stringify(Object.entries(values).sort(([a], [b]) => a.localeCompare(b))))
    .digest("hex");
  return { gate, fingerprint };
}

/** The deepest full push gate declared by this checkout. */
export function requiredPushGate(cwd: string): string | null {
  const pkg = readPackageJson(cwd);
  return pkg.ok ? (gateDefinition(pkg.pkg)?.gate ?? null) : null;
}

const receiptPath = (cwd: string, sha: string): string | null => {
  const outbox = outboxRoot(cwd);
  return outbox ? path.join(outbox, "push-gates", `${sha}.json`) : null;
};

function cleanHead(cwd: string): { sha: string; tree: string } | null {
  const status = git(cwd, [
    "status",
    "--porcelain",
    "--untracked-files=all",
    "--ignore-submodules=none",
  ]);
  if (status !== "") return null;
  const sha = git(cwd, ["rev-parse", "--verify", "HEAD^{commit}"]);
  const tree = git(cwd, ["rev-parse", "--verify", "HEAD^{tree}"]);
  return sha && tree ? { sha, tree } : null;
}

/** Execute a consumer gate; only a successful deepest full gate on an unchanged clean tree earns proof. */
export function runPushGate(cwd: string, gate: string, log: (message: string) => void): number {
  const pkg = readPackageJson(cwd);
  const script = pkg.ok ? scriptsOf(pkg.pkg)?.[gate] : null;
  if (typeof script !== "string" || script.trim() === "") {
    log(`package.json must declare a non-empty ${gate} script`);
    return EXIT.USAGE;
  }
  const definition = pkg.ok ? gateDefinition(pkg.pkg) : null;
  const before = cleanHead(cwd);
  const head = git(cwd, ["rev-parse", "--verify", "HEAD^{commit}"]);
  const file = head ? receiptPath(cwd, head) : null;
  const attempt =
    file && definition?.gate === gate ? path.join(`${file}.running`, randomUUID()) : null;
  const fail = () => {
    if (!attempt || !file) return;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(
      `${file}.failed`,
      JSON.stringify({ version: 1, sha: head, gate, passed: false }) + "\n",
    );
    fs.rmSync(file, { force: true });
  };
  if (attempt) {
    fs.mkdirSync(path.dirname(attempt), { recursive: true });
    fs.writeFileSync(attempt, JSON.stringify({ pid: process.pid, sha: head }) + "\n");
    fail();
  }
  const finish = (code: number) => {
    if (attempt) fs.rmSync(attempt, { force: true });
    return code;
  };
  const argv = testCommand(scriptCommand(gate));
  log(`running ${scriptCommand(gate).join(" ")}`);
  const result = spawnSync(argv[0]!, argv.slice(1), {
    cwd,
    env: gitEnv(),
    stdio: ["ignore", 2, 2],
  });
  const status = result.error
    ? 127
    : (result.status ??
      128 + ((result.signal ? os.constants.signals[result.signal] : undefined) ?? 1));
  if (result.error) log(result.error.message);
  if (status !== 0 || !before || definition?.gate !== gate) {
    fail();
    return finish(status);
  }
  const after = cleanHead(cwd);
  const afterPkg = readPackageJson(cwd);
  if (
    after?.sha !== before.sha ||
    after.tree !== before.tree ||
    !afterPkg.ok ||
    gateDefinition(afterPkg.pkg)?.fingerprint !== definition.fingerprint
  ) {
    log("full gate passed, but the checkout changed — no reusable push receipt");
    fail();
    return finish(status);
  }
  if (file) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(
      file,
      JSON.stringify({ version: 1, ...before, ...definition, passed: true }) + "\n",
    );
    fs.rmSync(`${file}.failed`, { force: true });
    log(`recorded full push gate for ${before.sha}`);
  }
  return finish(status);
}

/** Pending files survive interrupted runners; one read suffices to block earlier proof. */
function pendingAttempt(file: string): boolean {
  const dir = `${file}.running`;
  if (!fs.existsSync(dir)) return false;
  const handle = fs.opendirSync(dir);
  try {
    return handle.readSync() !== null;
  } finally {
    handle.closeSync();
  }
}

function validReceipt(
  cwd: string,
  file: string,
  sha: string,
  definition: { gate: string; fingerprint: string },
): boolean {
  const read = readJsonFile(file);
  if (!read.ok || !read.value || typeof read.value !== "object") return false;
  const receipt = read.value as Record<string, unknown>;
  return (
    receipt.version === 1 &&
    receipt.passed === true &&
    receipt.sha === sha &&
    receipt.gate === definition.gate &&
    receipt.fingerprint === definition.fingerprint &&
    receipt.tree === git(cwd, ["rev-parse", `${sha}^{tree}`])
  );
}

/** Every commit not covered by this success must be free of failed or unreadable gate evidence. */
function noLaterFailure(
  cwd: string,
  dir: string,
  sha: string,
  newSha: string,
  definition: { gate: string; fingerprint: string },
): boolean {
  const range = git(cwd, ["rev-list", "--max-count=129", newSha, `^${sha}`]);
  if (range === null) return false;
  const commits = range ? range.split("\n") : [];
  if (commits.length > 128) return false;
  for (const commit of [sha, ...commits]) {
    const file = path.join(dir, `${commit}.json`);
    if (
      fs.existsSync(`${file}.failed`) ||
      pendingAttempt(file) ||
      (fs.existsSync(file) && !validReceipt(cwd, file, commit, definition))
    )
      return false;
  }
  return true;
}

/** A bounded ancestor search; absent, malformed or stale proof always requires the full gate. */
export function hasVerifiedIncrement(
  cwd: string,
  oldSha: string,
  newSha: string,
  paths: string[],
): boolean {
  if (
    !SHA.test(oldSha) ||
    !SHA.test(newSha) ||
    /^0+$/.test(oldSha) ||
    !runGit(cwd, ["merge-base", "--is-ancestor", oldSha, newSha]).ok
  )
    return false;
  const raw = git(cwd, ["show", `${newSha}:package.json`]);
  const parsed = raw === null ? null : parseJson(raw);
  const definition = parsed?.ok ? gateDefinition(parsed.value) : null;
  const localPkg = readPackageJson(cwd);
  if (
    !definition ||
    !localPkg.ok ||
    gateDefinition(localPkg.pkg)?.fingerprint !== definition.fingerprint
  )
    return false;
  const ancestors = git(cwd, ["rev-list", "--max-count=128", oldSha]);
  const firstFile = receiptPath(cwd, oldSha);
  if (!ancestors || !firstFile) return false;
  const dir = path.dirname(firstFile);
  for (const sha of ancestors.split("\n")) {
    const file = path.join(dir, `${sha}.json`);
    if (!validReceipt(cwd, file, sha, definition)) continue;
    const diff = changedOutside(cwd, sha, newSha, paths);
    if (diff.ok && diff.outside.length === 0 && noLaterFailure(cwd, dir, sha, newSha, definition))
      return true;
  }
  return false;
}
