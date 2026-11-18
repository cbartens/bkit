import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { stepBase } from "./step-base";

const dirs: string[] = [];
const tmp = (prefix: string) => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  dirs.push(d);
  return d;
};
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

const GIT_ENV = {
  ...process.env,
  GIT_AUTHOR_NAME: "t",
  GIT_AUTHOR_EMAIL: "t@t",
  GIT_COMMITTER_NAME: "t",
  GIT_COMMITTER_EMAIL: "t@t",
};
const STATUS_REL = "docs/plans/202611/logs/1-x/status.jsonl";

let cwd: string;
const git = (...args: string[]) =>
  spawnSync("git", ["-C", cwd, ...args], { encoding: "utf-8", env: GIT_ENV }).stdout.trim();
const commit = (message: string) => {
  git("add", "-A");
  git("commit", "-q", "-m", message);
  return git("rev-parse", "HEAD");
};
const appendRow = (row: Record<string, unknown>) => {
  const file = path.join(cwd, STATUS_REL);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, `${JSON.stringify(row)}\n`);
};
const started = (at: string) => ({ type: "workflow-started", workflow: "build", at });
const done = (step: string, at: string, parentSha: string) => ({
  type: "step-done",
  workflow: "build",
  step,
  status: "DONE",
  at,
  parentSha,
  artifacts: [],
});

/** A committed repo with no run at all. */
function repo() {
  cwd = tmp("bkit-step-base-");
  git("init", "-q");
  fs.writeFileSync(path.join(cwd, "README.md"), "x\n");
  return commit("base");
}

describe("stepBase", () => {
  it("returns the commit that holds the last step-done row", () => {
    const c0 = repo();
    appendRow(started("2026-11-01T10:00:00Z"));
    const c1 = commit("run start");
    appendRow(done("build-plan-a", "2026-11-01T10:05:00Z", c1));
    const c2 = commit("step a");
    appendRow(done("build-plan-b", "2026-11-01T10:10:00Z", c2));
    const c3 = commit("step b");
    fs.writeFileSync(path.join(cwd, "later.ts"), "later\n");
    commit("subagent work after the last step");
    expect(new Set([c0, c1, c2, c3]).size).toBe(4);
    expect(stepBase({ cwd })).toBe(c3);
  });

  it("with a step name returns the commit of the row before that step's latest row", () => {
    const c0 = repo();
    appendRow(started("2026-11-01T10:00:00Z"));
    const c1 = commit("run start");
    appendRow(done("build-plan-a", "2026-11-01T10:05:00Z", c1));
    const c2 = commit("step a");
    appendRow(done("build-plan-b", "2026-11-01T10:10:00Z", c2));
    const c3 = commit("step b");
    expect(new Set([c0, c1, c2, c3]).size).toBe(4);
    expect(stepBase({ cwd, step: "build-plan-b" })).toBe(c2);
    expect(stepBase({ cwd, step: "build-plan-a" })).toBe(c1);
  });

  it("falls back to the run start commit, and null with no run", () => {
    repo();
    expect(stepBase({ cwd })).toBeNull();
    appendRow(started("2026-11-01T10:00:00Z"));
    const c1 = commit("run start");
    fs.writeFileSync(path.join(cwd, "later.ts"), "later\n");
    commit("work before any step is done");
    expect(stepBase({ cwd })).toBe(c1);
  });

  it("returns the parentSha of an uncommitted row even after a later commit sweeps it in", () => {
    repo();
    appendRow(started("2026-11-01T10:00:00Z"));
    const c1 = commit("run start");
    appendRow({ ...done("build-tests-red", "2026-11-01T10:05:00Z", c1), uncommitted: true });
    fs.writeFileSync(path.join(cwd, "work.ts"), "work\n");
    const swept = commit("subagent work with git add -A");
    expect(swept).not.toBe(c1);
    expect(stepBase({ cwd })).toBe(c1);
  });

  it("with no file on a feat/{FID} branch, picks that FID's run when another run is in progress", () => {
    repo();
    git("checkout", "-q", "-B", "feat/1-x");
    appendRow(started("2026-11-01T10:00:00Z"));
    const c1 = commit("run start");
    appendRow(done("build-plan-a", "2026-11-01T10:05:00Z", c1));
    const c2 = commit("step a");
    const other = path.join(cwd, "docs/plans/202611/logs/2-y/status.jsonl");
    fs.mkdirSync(path.dirname(other), { recursive: true });
    fs.writeFileSync(other, `${JSON.stringify(started("2026-11-01T11:00:00Z"))}\n`);
    commit("another feature's run start");
    expect(c2).not.toBe(c1);
    expect(stepBase({ cwd })).toBe(c2);
  });

  it("skips a build-takeover row written inside the step it measures", () => {
    repo();
    appendRow(started("2026-11-01T10:00:00Z"));
    const c1 = commit("run start");
    appendRow(done("build-plan-a", "2026-11-01T10:05:00Z", c1));
    const c2 = commit("step a");
    fs.writeFileSync(path.join(cwd, "fix.ts"), "fix\n");
    const fix = commit("subagent fix");
    appendRow({ ...done("build-takeover", "2026-11-01T10:08:00Z", fix), uncommitted: true });
    expect(fix).not.toBe(c2);
    expect(stepBase({ cwd, step: "build-plan-b" })).toBe(c2);
  });

  it("with no file on a branch that is not feat/{FID}, picks the run this branch started when another run is in progress", () => {
    repo();
    git("checkout", "-q", "-B", "dev");
    const other = path.join(cwd, "docs/plans/202611/logs/2-y/status.jsonl");
    fs.mkdirSync(path.dirname(other), { recursive: true });
    fs.writeFileSync(other, `${JSON.stringify(started("2026-11-01T09:00:00Z"))}\n`);
    commit("another feature's run start");
    git("checkout", "-q", "-B", "claude/session");
    appendRow(started("2026-11-01T10:00:00Z"));
    const c1 = commit("run start");
    appendRow(done("build-plan-a", "2026-11-01T10:05:00Z", c1));
    const c2 = commit("step a");
    expect(c2).not.toBe(c1);
    expect(stepBase({ cwd })).toBe(c2);
  });
});
