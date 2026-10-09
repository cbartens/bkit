import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { COMMANDS } from "../registry";
import { placeholderLines, promptVerdicts, readHeader } from "./steps";

const dirs: string[] = [];
afterEach(() => {
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

const git = (cwd: string, ...args: string[]) =>
  spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
    cwd,
    encoding: "utf-8",
  }).stdout.trim();

/** A repo with one commit, a log dir, and a finished artifact. */
function repo() {
  const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-steps-")));
  dirs.push(cwd);
  git(cwd, "init", "-q", "-b", "feat/1-x");
  git(cwd, "config", "user.email", "t@t");
  git(cwd, "config", "user.name", "t");
  git(cwd, "commit", "-q", "--allow-empty", "-m", "init");
  fs.mkdirSync(path.join(cwd, "logs"));
  write(
    cwd,
    "logs/verify-1.md",
    "Verdict: FAIL\nFailures: 2\n\n<!-- verdict:end -->\n\n# Verify\n\nTwo gaps.\n",
  );
  return cwd;
}

const write = (cwd: string, rel: string, body: string) =>
  fs.writeFileSync(path.join(cwd, rel), body);

async function run(cwd: string, argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(argv, COMMANDS, {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

const STEP = ["--file=logs/status.jsonl", "--workflow=build", "--step=build-plan-verify"];
const doneArgs = (...extra: string[]) => [
  "steps",
  "done",
  ...STEP,
  "--verdict=FAIL",
  "--failures=2",
  "--sub-plan=1",
  "--artifact=logs/verify-1.md",
  "--message=chore(1-x): plan-verify",
  ...extra,
];

describe("bkit steps done", () => {
  it("captures parentSha first, writes the row, then commits on top of it", async () => {
    const cwd = repo();
    const before = git(cwd, "rev-parse", "HEAD");
    const r = await run(cwd, doneArgs("--attempt=next"));
    expect(r.code).toBe(0);
    expect(r.json.row).toMatchObject({
      type: "step-done",
      workflow: "build",
      step: "build-plan-verify",
      status: "DONE",
      parentSha: before,
      verdict: "FAIL",
      failures: 2,
      subPlan: 1,
      attempt: 1,
      artifacts: ["logs/verify-1.md"],
    });
    expect(r.json.commit).toBe(git(cwd, "rev-parse", "HEAD"));
    expect(git(cwd, "rev-parse", "HEAD~1")).toBe(before);
    expect(git(cwd, "status", "--porcelain")).toBe("");
    expect(JSON.parse(fs.readFileSync(path.join(cwd, "logs/status.jsonl"), "utf-8"))).toEqual(
      r.json.row,
    );
  });

  it("--attempt=next advances with each row, so the next parentSha differs", async () => {
    const cwd = repo();
    const first = await run(cwd, doneArgs("--attempt=next"));
    const second = await run(cwd, doneArgs("--attempt=next"));
    expect(second.json.row.attempt).toBe(2);
    expect(second.json.row.parentSha).toBe(first.json.commit);
  });

  it("--commit=none writes the row and leaves it uncommitted", async () => {
    const cwd = repo();
    const r = await run(cwd, [
      "steps",
      "done",
      ...STEP,
      "--commit=none",
      "--artifact=logs/verify-1.md",
    ]);
    expect(r.json.commit).toBeNull();
    expect(git(cwd, "status", "--porcelain")).toContain("logs/");
  });

  it("carries extra fields, parsed as JSON when they are JSON", async () => {
    const cwd = repo();
    const r = await run(
      cwd,
      doneArgs(
        '--field=ciDispatch={"verdict":"PASS"}',
        "--field=clamped=true",
        "--field=note=plain text",
      ),
    );
    expect(r.json.row).toMatchObject({
      ciDispatch: { verdict: "PASS" },
      clamped: true,
      note: "plain text",
    });
  });

  it.each([
    [["--artifact=logs/missing.md"], 7, "does not exist"],
    [["--artifact=../outside.md"], 7, "is outside"],
  ])("refuses artifact %j before writing anything", async (flags, code, problem) => {
    const cwd = repo();
    const r = await run(cwd, ["steps", "done", ...STEP, "--message=m", ...flags]);
    expect(r.code).toBe(code);
    expect(r.err).toContain(problem);
    expect(fs.existsSync(path.join(cwd, "logs/status.jsonl"))).toBe(false);
  });

  it("refuses an empty artifact", async () => {
    const cwd = repo();
    write(cwd, "logs/empty.md", "");
    expect(
      (await run(cwd, ["steps", "done", ...STEP, "--message=m", "--artifact=logs/empty.md"])).code,
    ).toBe(7);
  });

  it.each([
    [["--verdict=PASS", "--failures=1"], "PASS needs failures=0"],
    [["--verdict=FAIL", "--failures=0"], "FAIL needs failures>0"],
    [["--verdict=MAYBE"], "--verdict must be"],
    [["--strategy=YOLO"], "--strategy must be"],
    [["--failures=-1"], "non-negative integer"],
    [["--field=verdict=PASS"], "cannot set verdict"],
    [["--status=SKIPPED"], "--status must be"],
  ])("rejects %j", async (flags, problem) => {
    const cwd = repo();
    const r = await run(cwd, ["steps", "done", ...STEP, "--message=m", ...flags]);
    expect(r.code).toBe(2);
    expect(r.err).toContain(problem);
  });

  it("needs a message unless --commit=none", async () => {
    expect((await run(repo(), ["steps", "done", ...STEP])).code).toBe(2);
  });

  it("reports a failed commit with exit 8 after writing the row", async () => {
    const cwd = repo();
    fs.mkdirSync(path.join(cwd, ".git/hooks"), { recursive: true });
    write(cwd, ".git/hooks/pre-commit", "#!/bin/sh\necho blocked >&2\nexit 1\n");
    fs.chmodSync(path.join(cwd, ".git/hooks/pre-commit"), 0o755);
    const r = await run(cwd, doneArgs());
    expect(r.code).toBe(8);
    expect(r.err).toContain("blocked");
    expect(fs.existsSync(path.join(cwd, "logs/status.jsonl"))).toBe(true);
  });
});

describe("bkit steps verdict", () => {
  it("returns the verdict and every header field", async () => {
    const r = await run(repo(), [
      "steps",
      "verdict",
      "--file=logs/verify-1.md",
      "--field=Failures",
    ]);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({ verdict: "FAIL", fields: { Verdict: "FAIL", Failures: "2" } });
  });

  it.each([
    ["missing", null, 4],
    ["empty", "", 4],
    ["pending", "Verdict: PENDING\n<!-- verdict:end -->\n", 5],
    ["no marker", "Verdict: PASS\n", 6],
    ["disallowed", "Verdict: GREAT\n<!-- verdict:end -->\n", 6],
    ["bad failures", "Verdict: PASS\nFailures: some\n<!-- verdict:end -->\n", 6],
  ])("%s artifact exits %#", async (_, body, code) => {
    const cwd = repo();
    if (body !== null) write(cwd, "logs/a.md", body);
    expect((await run(cwd, ["steps", "verdict", "--file=logs/a.md"])).code).toBe(code);
  });

  it("a required field that is absent is invalid (re-prompt)", async () => {
    const cwd = repo();
    write(cwd, "logs/a.md", "Verdict: PASS\n<!-- verdict:end -->\n");
    expect(
      (await run(cwd, ["steps", "verdict", "--file=logs/a.md", "--field=Strategy"])).code,
    ).toBe(6);
  });

  it("takes the allowed values from the subagent's own prompt", async () => {
    expect(promptVerdicts("bkit-plan-complexity-check")).toEqual(["SINGLE", "SPLIT"]);
    expect(promptVerdicts("bkit-build-plan-verify")).toEqual(["PASS", "CONCERNS", "FAIL"]);
    const cwd = repo();
    write(cwd, "logs/c.md", "Verdict: SPLIT\n<!-- verdict:end -->\n");
    expect((await run(cwd, ["steps", "verdict", "--file=logs/c.md"])).code).toBe(6);
    expect(
      (
        await run(cwd, [
          "steps",
          "verdict",
          "--file=logs/c.md",
          "--agent=bkit-plan-complexity-check",
        ])
      ).code,
    ).toBe(0);
  });

  it("only reads above the marker", () => {
    const cwd = repo();
    write(
      cwd,
      "logs/b.md",
      "Verdict: PASS\n<!-- verdict:end -->\nVerdict: FAIL\nStatus: PENDING\n",
    );
    expect(readHeader(path.join(cwd, "logs/b.md"), ["PASS", "FAIL"])).toMatchObject({
      ok: true,
      verdict: "PASS",
    });
  });
});

describe("bkit steps gate", () => {
  const gate = (cwd: string, ...extra: string[]) =>
    run(cwd, ["steps", "gate", ...STEP, "--sub-plan=1", "--artifact=logs/verify-1.md", ...extra]);

  it("passes after done wrote the row for the artifact", async () => {
    const cwd = repo();
    await run(cwd, doneArgs("--attempt=next"));
    const r = await gate(cwd, "--verdict-required", "--attempt=1");
    expect(r.code).toBe(0);
    expect(r.json.pass).toBe(true);
    expect(r.json.checks.map((c: { check: string }) => c.check)).toEqual([
      "artifact logs/verify-1.md",
      "placeholders logs/verify-1.md",
      "verdict logs/verify-1.md",
      "status row",
    ]);
  });

  it("fails when no row was written for the step", async () => {
    const cwd = repo();
    write(cwd, "logs/status.jsonl", "");
    const r = await gate(cwd);
    expect(r.code).toBe(1);
    expect(r.err).toContain("no DONE build-plan-verify row");
  });

  it("fails on a placeholder left in the artifact", async () => {
    const cwd = repo();
    await run(cwd, doneArgs());
    fs.appendFileSync(path.join(cwd, "logs/verify-1.md"), "\n## Notes\n\nPENDING\n");
    const r = await gate(cwd);
    expect(r.code).toBe(1);
    expect(r.err).toMatch(/placeholders logs\/verify-1.md: PENDING left on line\(s\) \d+/);
  });

  it("fails when the row's verdict differs from the artifact's", async () => {
    const cwd = repo();
    await run(cwd, [
      "steps",
      "done",
      ...STEP,
      "--verdict=PASS",
      "--failures=0",
      "--sub-plan=1",
      "--artifact=logs/verify-1.md",
      "--message=m",
    ]);
    const r = await gate(cwd, "--verdict-required");
    expect(r.code).toBe(1);
    expect(r.err).toContain("row verdict PASS differs from the artifact's FAIL");
  });

  it("fails when the row does not list the artifact, or carries another attempt", async () => {
    const cwd = repo();
    write(cwd, "logs/other.md", "x\n");
    await run(cwd, [
      "steps",
      "done",
      ...STEP,
      "--sub-plan=1",
      "--attempt=1",
      "--artifact=logs/other.md",
      "--message=m",
    ]);
    expect((await gate(cwd)).err).toContain("row does not list logs/verify-1.md");
    expect((await gate(cwd, "--attempt=2")).err).toContain("with attempt 2");
  });

  it("fails on a missing artifact", async () => {
    const cwd = repo();
    await run(cwd, doneArgs());
    fs.rmSync(path.join(cwd, "logs/verify-1.md"));
    expect((await gate(cwd)).err).toContain(
      "artifact logs/verify-1.md: logs/verify-1.md does not exist",
    );
  });
});

describe("placeholderLines", () => {
  it("flags a bare PENDING or a field left at PENDING, not prose that mentions it", () => {
    const d = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-ph-"));
    dirs.push(d);
    const f = path.join(d, "a.md");
    fs.writeFileSync(f, "Scope: PENDING\nPENDING\n[PENDING]\nThe PENDING rows were cleared.\n");
    expect(placeholderLines(f)).toEqual([1, 2, 3]);
  });
});
