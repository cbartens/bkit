// shared-checkout.integration.test.ts — a debug run in place on `dev`, with real
// git and a real bare `origin`: foreign work (a modified file, an untracked one,
// a staged one, a pre-existing ledger row, a local commit) is in flight when the
// run starts, and the run's commits and push must carry only the run's own work.
// Integration-tier: every case runs a chain of bkit commands over real repos.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { runCommand } from "../lib";
import { COMMANDS } from "../registry";
import { readRecord } from "./ledgers";

vi.setConfig({ testTimeout: 60_000 });

const FID = "650-shared-dev";
const MONTH = "202610";
const LOGS = `docs/plans/${MONTH}/logs/${FID}`;
const ISSUES = ".bkit/issues.jsonl";
const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

const g = (cwd: string, ...args: string[]) =>
  spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd,
    encoding: "utf-8",
  });
const git = (cwd: string, ...args: string[]) => g(cwd, ...args).stdout.trim();
const write = (cwd: string, rel: string, body: string) => {
  fs.mkdirSync(path.dirname(path.join(cwd, rel)), { recursive: true });
  fs.writeFileSync(path.join(cwd, rel), body);
};
const read = (cwd: string, rel: string) => fs.readFileSync(path.join(cwd, rel), "utf-8");
const row = (o: object) => `${JSON.stringify(o)}\n`;

/** A commit with HEAD's tree on top of HEAD, made without touching the index or the files. */
function foreignCommit(cwd: string, message: string): string {
  const sha = git(cwd, "commit-tree", "HEAD^{tree}", "-p", "HEAD", "-m", message);
  git(cwd, "update-ref", "HEAD", sha);
  return sha;
}

async function bkit(cwd: string, ...argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(argv, COMMANDS, {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

/** A clone on `dev` of a bare origin, with foreign work in flight; the run has not started. */
function fixture(o: { ahead?: boolean } = {}) {
  const base = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-shared-")));
  dirs.push(base);
  const origin = path.join(base, "origin.git");
  const cwd = path.join(base, "clone");
  git(base, "init", "-q", "--bare", "-b", "dev", origin);
  git(base, "clone", "-q", origin, cwd);
  git(cwd, "switch", "-q", "-C", "dev");
  git(cwd, "config", "user.email", "t@t");
  git(cwd, "config", "user.name", "t");
  write(cwd, "src/a.txt", "a\n");
  write(cwd, "src/staged.txt", "s\n");
  write(cwd, ".bkit/version", JSON.stringify({ pinnedVersion: "5.5.0" }));
  write(cwd, ISSUES, row({ id: "base" }));
  git(cwd, "add", "-A");
  git(cwd, "commit", "-q", "-m", "base");
  git(cwd, "push", "-q", "-u", "origin", "dev");

  // Foreign work, all before the run starts.
  if (o.ahead !== false) foreignCommit(cwd, "foreign local commit");
  write(cwd, "src/a.txt", "a\nforeign edit\n");
  write(cwd, "notes.md", "foreign notes\n");
  write(cwd, "src/staged.txt", "s\nforeign staged\n");
  git(cwd, "add", "src/staged.txt");
  fs.appendFileSync(path.join(cwd, ISSUES), row({ id: "foreign-row" }));
  const foreign = {
    "src/a.txt": read(cwd, "src/a.txt"),
    "notes.md": read(cwd, "notes.md"),
    "src/staged.txt": read(cwd, "src/staged.txt"),
  };
  return { base, origin, cwd, foreign };
}

/** setup, a lock, the start row, one finished step. */
async function startRun(cwd: string) {
  const setup = await bkit(
    cwd,
    "worktrees",
    "setup",
    "--workflow=debug",
    `--fid=${FID}`,
    `--month=${MONTH}`,
  );
  expect(setup.code).toBe(0);
  const lock = await bkit(
    cwd,
    "locks",
    "acquire",
    "--kind=workflow",
    "--workflow=debug",
    `--fid=${FID}`,
    `--month=${MONTH}`,
  );
  const start = await bkit(
    cwd,
    "workflows",
    "start",
    "--workflow=debug",
    `--fid=${FID}`,
    `--month=${MONTH}`,
    "--lock-held",
    `--token=${lock.json.token}`,
  );
  expect(start.code).toBe(0);
  write(cwd, `${LOGS}/verify-1.md`, "Verdict: PASS\nFailures: 0\n\n<!-- verdict:end -->\n");
  return { setup, token: lock.json.token as string };
}

const step = (cwd: string) =>
  bkit(
    cwd,
    "steps",
    "done",
    `--file=${LOGS}/status.jsonl`,
    "--workflow=debug",
    "--step=debug-verify",
    "--verdict=PASS",
    "--failures=0",
    `--artifact=${LOGS}/verify-1.md`,
    `--message=chore(${FID}): verify`,
  );

const untouched = (cwd: string, foreign: Record<string, string>) => {
  for (const [rel, body] of Object.entries(foreign)) expect(read(cwd, rel)).toBe(body);
  expect(git(cwd, "diff", "--cached", "--name-only")).toBe("src/staged.txt");
  expect(git(cwd, "ls-files", "--others", "--exclude-standard")).toContain("notes.md");
};

describe("the push of a debug run in place on dev sends only the run's commits", () => {
  const remoteLog = (origin: string) => git(origin, "log", "--format=%s", "dev").split("\n");

  /** setup, one step, a foreign commit mid-run, the close commit. */
  async function finishedRun(cwd: string) {
    await startRun(cwd);
    await step(cwd);
    foreignCommit(cwd, "foreign commit made mid-run");
    const close = await bkit(
      cwd,
      "workflows",
      "close",
      "--workflow=debug",
      `--fid=${FID}`,
      `--month=${MONTH}`,
      `--message=chore(${FID}): close`,
    );
    expect(close.code).toBe(0);
  }
  const push = (cwd: string, mode: string) => bkit(cwd, "branches", "push", `--mode=${mode}`);

  it("push from an ahead local dev lands only the run commits", async () => {
    const { cwd, origin, foreign } = fixture();
    await finishedRun(cwd);
    const r = await push(cwd, "dev");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ pushed: true, ref: "dev", replayed: true });
    expect(r.json.sha).toBe(git(origin, "rev-parse", "dev"));
    const log = remoteLog(origin);
    expect(log).toContain(`chore(${FID}): verify`);
    expect(log).toContain(`chore(${FID}): close`);
    expect(log).not.toContain("foreign local commit");
    untouched(cwd, foreign);
    expect(readRecord(cwd, FID)).not.toBeNull();
    expect(fs.existsSync(path.join(cwd, ".worktrees", `_land-${FID}`))).toBe(false);
  });

  it("a foreign commit made mid-run never reaches the remote", async () => {
    const { cwd, origin } = fixture();
    await finishedRun(cwd);
    await push(cwd, "dev");
    expect(remoteLog(origin)).not.toContain("foreign commit made mid-run");
    // The run's own commit made after the foreign one still went out.
    expect(remoteLog(origin)).toContain(`chore(${FID}): close`);
  });

  it("feature-mode push on dev with a record never pushes the foreign commit", async () => {
    const { cwd, origin } = fixture();
    await finishedRun(cwd);
    const r = await push(cwd, "feature");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ pushed: true, replayed: true });
    expect(remoteLog(origin)).not.toContain("foreign local commit");
    expect(remoteLog(origin)).not.toContain("foreign commit made mid-run");
    expect(remoteLog(origin)).toContain(`chore(${FID}): close`);
  });

  it("push from a level local dev is a plain push", async () => {
    const { cwd, origin } = fixture({ ahead: false });
    await startRun(cwd);
    await step(cwd);
    const r = await push(cwd, "dev");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ pushed: true, replayed: false });
    expect(r.json.sha).toBe(git(cwd, "rev-parse", "HEAD"));
    expect(git(origin, "rev-parse", "dev")).toBe(git(cwd, "rev-parse", "HEAD"));
  });
});
