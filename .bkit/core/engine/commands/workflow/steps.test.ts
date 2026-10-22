import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runCommand } from "../lib";
import { COMMANDS } from "../registry";
import { ROW_FIELDS, placeholderLines, promptHeader, promptVerdicts, readHeader } from "./steps";

const REPO_ROOT = path.resolve(__dirname, "../../../../..");

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

  it("a missing artifact exits 4", async () => {
    const cwd = repo();
    expect((await run(cwd, ["steps", "verdict", "--file=logs/a.md"])).code).toBe(4);
  });

  it.each([
    ["empty", "", 4],
    ["pending", "Verdict: PENDING\n<!-- verdict:end -->\n", 5],
    ["no marker", "Verdict: PASS\n", 6],
    ["disallowed", "Verdict: GREAT\n<!-- verdict:end -->\n", 6],
    ["bad failures", "Verdict: PASS\nFailures: some\n<!-- verdict:end -->\n", 6],
  ])("%s artifact exits %#", async (_, body, code) => {
    const cwd = repo();
    write(cwd, "logs/a.md", body);
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

  it("--ref reads the status file as committed on that ref, not from disk", async () => {
    const cwd = repo();
    await run(cwd, doneArgs("--attempt=next"));
    fs.rmSync(path.join(cwd, "logs/status.jsonl"));
    expect((await gate(cwd)).code).toBe(3);
    const r = await gate(cwd, "--ref=HEAD");
    expect(r.code).toBe(0);
    expect(r.json.pass).toBe(true);
  });

  it("--ref exits 3 when the ref does not carry the status file", async () => {
    const cwd = repo();
    await run(cwd, doneArgs("--attempt=next"));
    const r = await gate(cwd, "--ref=HEAD~1");
    expect(r.code).toBe(3);
    expect(r.err).toContain("HEAD~1:logs/status.jsonl");
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

describe("status row field names", () => {
  it("writes attempt 0 rather than dropping it", async () => {
    const cwd = repo();
    const r = await run(cwd, doneArgs("--attempt=0"));
    expect(r.code).toBe(0);
    expect(r.json.row.attempt).toBe(0);
    expect(JSON.parse(fs.readFileSync(path.join(cwd, "logs/status.jsonl"), "utf-8")).attempt).toBe(
      0,
    );
  });

  it("refuses a negative or non-integer attempt (2)", async () => {
    const cwd = repo();
    expect((await run(cwd, doneArgs("--attempt=-1"))).code).toBe(2);
    expect((await run(cwd, doneArgs("--attempt=1.5"))).code).toBe(2);
  });

  it("records the complexity verdict as `verdict`, from the agent's own verdict set", async () => {
    const cwd = repo();
    write(cwd, "logs/complexity.md", "Verdict: SPLIT\n\n<!-- verdict:end -->\n");
    const args = [
      "steps",
      "done",
      "--file=logs/status.jsonl",
      "--workflow=plan",
      "--step=plan-complexity-check",
      "--verdict=SPLIT",
      "--attempt=1",
      "--artifact=logs/complexity.md",
      "--commit=none",
    ];
    const r = await run(cwd, [...args, "--agent=bkit-plan-complexity-check"]);
    expect(r.code).toBe(0);
    expect(r.json.row).toMatchObject({ verdict: "SPLIT" });
    expect(r.json.row).not.toHaveProperty("complexity");
    // Without the agent the default PASS|CONCERNS|FAIL set refuses it.
    expect((await run(cwd, args)).code).toBe(2);
    const g = await run(cwd, [
      "steps",
      "gate",
      "--file=logs/status.jsonl",
      "--workflow=plan",
      "--step=plan-complexity-check",
      "--attempt=1",
      "--artifact=logs/complexity.md",
      "--verdict-required",
      "--agent=bkit-plan-complexity-check",
    ]);
    expect(g.code).toBe(0);
  });

  it("records a create-PR row's URL in artifacts, not a prUrl field", async () => {
    const cwd = repo();
    const url = "https://github.com/o/r/pull/7";
    const r = await run(cwd, [
      "steps",
      "done",
      "--file=logs/status.jsonl",
      "--workflow=build",
      "--step=build-create-pr",
      `--artifact=${url}`,
      "--commit=none",
    ]);
    expect(r.code).toBe(0);
    expect(r.json.row.artifacts).toEqual([url]);
    expect(r.json.row).not.toHaveProperty("prUrl");
  });

  it("the ship timeout row keeps its snake_case timeout_s key", async () => {
    const cwd = repo();
    write(cwd, "logs/status.jsonl", "");
    const r = await run(cwd, [
      "status",
      "row",
      "--file=logs/status.jsonl",
      "--workflow=ship",
      "--type=ship-revalidate-timeout",
      "--field=attempt=0",
      "--field=timeout_s=600",
    ]);
    expect(r.code).toBe(0);
    const row = JSON.parse(fs.readFileSync(path.join(cwd, "logs/status.jsonl"), "utf-8").trim());
    expect(row).toMatchObject({ attempt: 0, timeout_s: 600 });
    expect(row).not.toHaveProperty("timeoutS");
  });
});

/** A finish call's `--agent` writes `strategy` when its prompt's header declares one. */
const agentWritesStrategy = (line: string) =>
  [...line.matchAll(/--agent=([a-z0-9-]+)/g)].some((m) =>
    promptHeader(m[1]!).fields.some((f) => f.name === "Strategy"),
  );

/** The row fields each workflow's `steps done|finish` call writes, read from the workflow files. */
function workflowRowFields(): Record<string, string[]> {
  const dir = path.join(REPO_ROOT, ".bkit", "core", "workflows");
  const written: Record<string, string[]> = {};
  for (const name of fs.readdirSync(dir).filter((n) => /^bkit-.*\.md$/.test(n))) {
    const text = fs.readFileSync(path.join(dir, name), "utf-8").replace(/\\\n\s*/g, " ");
    for (const line of text.split("\n")) {
      // `context finalise --record` writes the context-fetch row with this run's attempt.
      if (/"\{BKIT\}" context finalise\b.*--record\b/.test(line)) {
        written["debug/context-fetch"] = ["attempt"];
        continue;
      }
      if (!/"\{BKIT\}" steps (done|finish)\b/.test(line)) continue;
      const workflow = /--workflow=([a-z]+)/.exec(line)?.[1];
      const step = /--step=([a-z0-9-]+)/.exec(line)?.[1];
      if (!workflow || !step) continue;
      const fields = [
        /--attempt(-of)?[= ]/.test(line) ? "attempt" : "",
        /--strategy=/.test(line) || agentWritesStrategy(line) ? "strategy" : "",
        /--field="?scope=|--scope=/.test(line) ? "scope" : "",
      ].filter(Boolean);
      if (fields.length) written[`${workflow}/${step}`] = fields;
    }
  }
  return written;
}

describe("bkit steps gate checks attempt / strategy / scope where the step writes them", () => {
  /** Write a row with `steps done --commit=none`, then gate it. */
  async function rowThenGate(workflow: string, step: string, done: string[], gate: string[] = []) {
    const cwd = repo();
    const base = ["--file=logs/status.jsonl", `--workflow=${workflow}`, `--step=${step}`];
    expect((await run(cwd, ["steps", "done", ...base, ...done, "--commit=none"])).code).toBe(0);
    return run(cwd, ["steps", "gate", ...base, ...gate]);
  }

  it("fails a row missing its attempt", async () => {
    const r = await rowThenGate("build", "build-plan-verify", ["--sub-plan=1"], ["--sub-plan=1"]);
    expect(r.code).toBe(1);
    expect(r.err).toContain("row is missing attempt");
  });

  it("passes attempt 0, and gate --attempt=0 matches it", async () => {
    const r = await rowThenGate("build", "build-challenge", ["--attempt=0"], ["--attempt=0"]);
    expect(r.code).toBe(0);
  });

  it("fails a diagnose row missing its strategy, passes with it", async () => {
    const without = await rowThenGate("build", "build-failure-diagnose", ["--attempt=1"]);
    expect(without.code).toBe(1);
    expect(without.err).toContain("row is missing strategy");
    const withIt = await rowThenGate("build", "build-failure-diagnose", [
      "--attempt=1",
      "--strategy=PIVOT",
    ]);
    expect(withIt.code).toBe(0);
  });

  it("fails a run-tests row missing its scope, and an empty scope", async () => {
    const without = await rowThenGate("build", "build-run-tests", ["--attempt=1"]);
    expect(without.err).toContain("row is missing scope");
    const empty = await rowThenGate("debug", "debug-run-tests", ["--attempt=1", "--field=scope="]);
    expect(empty.code).toBe(1);
    expect(empty.err).toContain("row is missing scope");
    const ok = await rowThenGate("build", "build-run-tests", ["--attempt=1", "--field=scope=unit"]);
    expect(ok.code).toBe(0);
  });

  it("names every missing field at once", async () => {
    const r = await rowThenGate("ship", "ship-failure-remediate", []);
    expect(r.err).toContain("row is missing attempt, strategy");
  });

  it("asks nothing of a step that writes none of them", async () => {
    expect((await rowThenGate("build", "build-branch-sync", [])).code).toBe(0);
  });

  it("ROW_FIELDS lists exactly the fields each workflow's `steps done|finish` call writes", () => {
    const table = Object.fromEntries(Object.entries(ROW_FIELDS).map(([k, v]) => [k, [...v]]));
    expect(workflowRowFields()).toEqual(table);
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

// ---------------------------------------------------------------------------

describe("bkit steps finish", () => {
  const FINISH = ["steps", "finish", "--file=logs/status.jsonl", "--workflow=build"];

  it("reads the agent's header, derives the attempt, writes and commits the row, prints the comment", async () => {
    const cwd = repo();
    const before = git(cwd, "rev-parse", "HEAD");
    const r = await run(cwd, [
      ...FINISH,
      "--step=build-plan-verify",
      "--sub-plan=1",
      "--attempt-of=build-plan-verify:next",
      "--agent=bkit-build-plan-verify",
      "--artifact=logs/verify-<attempt>.md",
      "--message=chore(1-x): plan-verify attempt <attempt>",
      "--number=7",
      "--title=Plan Verify",
      "--sub-plan-count=2",
    ]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ verdict: "FAIL", failures: 2, attempt: 1, pass: true });
    expect(r.json.row).toMatchObject({
      step: "build-plan-verify",
      verdict: "FAIL",
      failures: 2,
      attempt: 1,
      subPlan: 1,
      parentSha: before,
      artifacts: ["logs/verify-1.md"],
    });
    expect(git(cwd, "log", "-1", "--format=%s")).toBe("chore(1-x): plan-verify attempt 1");
    expect(r.json.comment).toContain(
      "### Step 7 — Plan Verify - Verdict: FAIL - Failures: 2 - Sub-plan: 1/2 - Attempt: 1",
    );
  });

  it("re-asks on a PENDING header (exit 5) and writes nothing", async () => {
    const cwd = repo();
    write(cwd, "logs/verify-1.md", "Verdict: PENDING\nFailures: 0\n<!-- verdict:end -->\n");
    const r = await run(cwd, [
      ...FINISH,
      "--step=build-plan-verify",
      "--attempt=1",
      "--agent=bkit-build-plan-verify",
      "--artifact=logs/verify-1.md",
      "--commit=none",
    ]);
    expect(r.code).toBe(5);
    expect(r.json.reask).toEqual({ agent: "bkit-build-plan-verify", artifact: "logs/verify-1.md" });
    expect(fs.existsSync(path.join(cwd, "logs/status.jsonl"))).toBe(false);
  });

  it("re-asks (exit 6) when a field the prompt declares is missing", async () => {
    const cwd = repo();
    write(cwd, "logs/verify-1.md", "Verdict: PASS\n<!-- verdict:end -->\n");
    const r = await run(cwd, [
      ...FINISH,
      "--step=build-plan-verify",
      "--attempt=1",
      "--agent=bkit-build-plan-verify",
      "--artifact=logs/verify-1.md",
      "--commit=none",
    ]);
    expect(r.code).toBe(6);
    expect(r.json.problem).toContain("Failures");
  });

  it("refuses (exit 1) a row that would miss a field its gate requires, writing nothing", async () => {
    const cwd = repo();
    const r = await run(cwd, [
      ...FINISH,
      "--step=build-plan-verify",
      "--agent=bkit-build-plan-verify",
      "--artifact=logs/verify-1.md",
      "--commit=none",
    ]);
    expect(r.code).toBe(1);
    expect(r.err).toContain("row would miss attempt");
    expect(fs.existsSync(path.join(cwd, "logs/status.jsonl"))).toBe(false);
  });

  it("pairs agents with artifacts by position: worst verdict, failures summed", async () => {
    const cwd = repo();
    write(cwd, "logs/c1.md", "Verdict: CONCERNS\nFailures: 1\n<!-- verdict:end -->\n");
    write(cwd, "logs/c2.md", "Verdict: PASS\nFailures: 0\n<!-- verdict:end -->\n");
    const r = await run(cwd, [
      ...FINISH,
      "--step=build-challenge",
      "--attempt=0",
      "--agent=bkit-build-challenge-1",
      "--agent=bkit-build-challenge-2",
      "--artifact=logs/c1.md",
      "--artifact=logs/c2.md",
      "--commit=none",
    ]);
    expect(r.code).toBe(0);
    expect(r.json.row).toMatchObject({ verdict: "CONCERNS", failures: 1, attempt: 0 });
  });

  it("records the header's Strategy on the row", async () => {
    const cwd = repo();
    write(cwd, "logs/rem.md", "Verdict: PASS\nStrategy: PIVOT\n<!-- verdict:end -->\n");
    const r = await run(cwd, [
      "steps",
      "finish",
      "--file=logs/status.jsonl",
      "--workflow=debug",
      "--step=debug-failure-remediate",
      "--attempt=2",
      "--agent=bkit-debug-failure-remediate",
      "--artifact=logs/rem.md",
      "--commit=none",
      "--number=6",
      "--title=Failure Remediate",
    ]);
    expect(r.code).toBe(0);
    expect(r.json.row).toMatchObject({ strategy: "PIVOT", attempt: 2 });
    expect(r.json.fields).toEqual({});
    expect(r.json.comment).toContain("Strategy: PIVOT");
    // A given --attempt is not derived, so the comment names no Attempt.
    expect(r.json.comment).not.toContain("Attempt:");
  });

  it("--attempt=next counts this step's DONE rows; --count-field derives another counter", async () => {
    const cwd = repo();
    const args = (n: number) => [
      "steps",
      "finish",
      "--file=logs/status.jsonl",
      "--workflow=debug",
      "--step=debug-failure-soak",
      "--attempt=next",
      "--count-field=soakAttempt=debug-failure-soak:next",
      "--verdict=PASS",
      "--commit=none",
      `--field=n=${n}`,
    ];
    const first = await run(cwd, args(1));
    const second = await run(cwd, args(2));
    expect(first.json.row).toMatchObject({ attempt: 1, soakAttempt: 1 });
    expect(second.json.row).toMatchObject({ attempt: 2, soakAttempt: 2 });
  });

  it("fills <done> from the artifact's first DONE line, else the fallback", async () => {
    const cwd = repo();
    write(
      cwd,
      "logs/exec.md",
      "Verdict: PASS\n<!-- verdict:end -->\nDONE — Task 1: add the export — ok\n",
    );
    const r = await run(cwd, [
      ...FINISH,
      "--step=build-branch-sync",
      "--verdict=PASS",
      "--artifact=logs/exec.md",
      "--message=chore(1-x): <done>",
      "--done-fallback=plan-execute",
    ]);
    expect(r.code).toBe(0);
    expect(git(cwd, "log", "-1", "--format=%s")).toBe("chore(1-x): add the export");
  });

  it("rejects --attempt with --attempt-of, and --agent with --verdict", async () => {
    const cwd = repo();
    const base = [...FINISH, "--step=build-branch-sync", "--commit=none"];
    expect((await run(cwd, [...base, "--attempt=1", "--attempt-of=x:next"])).code).toBe(2);
    expect(
      (
        await run(cwd, [
          ...base,
          "--agent=bkit-build-plan-verify",
          "--artifact=logs/verify-1.md",
          "--verdict=PASS",
        ])
      ).code,
    ).toBe(2);
  });

  it("--docs-only refuses a step that wrote outside docs/plans/ (exit 9)", async () => {
    const cwd = repo();
    write(cwd, "src.ts", "export {};\n");
    const r = await run(cwd, [
      ...FINISH,
      "--step=build-branch-sync",
      "--artifact=logs/verify-1.md",
      "--docs-only",
      "--message=m",
    ]);
    expect(r.code).toBe(9);
    expect(r.json.outside).toContain("src.ts");
  });
});

// ---------------------------------------------------------------------------

describe("bkit steps stub", () => {
  it("copies the prior version under a PENDING header", async () => {
    const cwd = repo();
    write(cwd, "logs/v1.md", "# Design\n\nBody.\n");
    const r = await run(cwd, ["steps", "stub", "--from=logs/v1.md", "--to=logs/v2.md"]);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({ file: "logs/v2.md", stripped: false });
    expect(fs.readFileSync(path.join(cwd, "logs/v2.md"), "utf-8")).toBe(
      "Verdict: PENDING\n<!-- verdict:end -->\n\n# Design\n\nBody.\n",
    );
  });

  it("--strip-header drops the prior version's own header", async () => {
    const cwd = repo();
    await run(cwd, [
      "steps",
      "stub",
      "--from=logs/verify-1.md",
      "--to=logs/v2.md",
      "--strip-header",
    ]);
    const text = fs.readFileSync(path.join(cwd, "logs/v2.md"), "utf-8");
    expect(text.startsWith("Verdict: PENDING\n<!-- verdict:end -->\n\n")).toBe(true);
    expect(text).not.toContain("Verdict: FAIL");
    expect(text).toContain("# Verify");
  });

  it("exits 4 when the prior version is missing or empty", async () => {
    const cwd = repo();
    write(cwd, "logs/empty.md", "");
    expect((await run(cwd, ["steps", "stub", "--from=logs/none.md", "--to=logs/v2.md"])).code).toBe(
      4,
    );
    expect(
      (await run(cwd, ["steps", "stub", "--from=logs/empty.md", "--to=logs/v2.md"])).code,
    ).toBe(4);
    expect(fs.existsSync(path.join(cwd, "logs/v2.md"))).toBe(false);
  });
});

// ---------------------------------------------------------------------------

describe("bkit steps gate — placeholders, FID, derived attempt", () => {
  it("checks held placeholders without a status file (Step 1)", async () => {
    const cwd = repo();
    const gate = (...p: string[]) =>
      run(cwd, ["steps", "gate", "--workflow=ship", "--step=ship-start-workflow", ...p]);
    expect((await gate("--placeholder=BRANCH=feat/1-x", "--placeholder=OWNER_REPO=o/r")).code).toBe(
      0,
    );
    const empty = await gate("--placeholder=BRANCH=", "--placeholder=OWNER_REPO=o/r");
    expect(empty.code).toBe(1);
    expect(empty.err).toContain("placeholder BRANCH: empty");
    expect((await gate("--placeholder=BRANCH")).code).toBe(2);
    expect((await gate("--placeholder=BRANCH={BRANCH}")).code).toBe(2);
  });

  it("checks the FID's shape for the wired tracker", async () => {
    const cwd = repo();
    const gate = (fid: string) =>
      run(cwd, [
        "steps",
        "gate",
        "--workflow=design",
        "--step=design-start-workflow",
        `--fid=${fid}`,
      ]);
    expect((await gate("1-export-csv")).code).toBe(0);
    expect((await gate("../escape")).code).toBe(1);
  });

  describe("--issue", () => {
    function wired(tracker = "github") {
      const cwd = repo();
      write(cwd, "package.json", JSON.stringify({ bkit: { issueTracker: tracker } }));
      return cwd;
    }
    const gate = (cwd: string, fid: string, ...extra: string[]) =>
      run(cwd, [
        "steps",
        "gate",
        "--workflow=design",
        "--step=design-start-workflow",
        `--fid=${fid}`,
        ...extra,
      ]);

    it('gate --issue="" fails the fid check for 123-fix under github', async () => {
      const r = await gate(wired(), "123-fix", "--issue=");
      expect(r.code).toBe(1);
      expect(r.json.checks[0]).toMatchObject({ check: "fid 123-fix", ok: false });
      expect(r.err).toContain("issue-less");
    });

    it('gate --issue="" passes the fid check for dev-ci-failures under github', async () => {
      const r = await gate(wired(), "dev-ci-failures", "--issue=");
      expect(r.code).toBe(0);
      expect(r.json.checks[0]).toMatchObject({ check: "fid dev-ci-failures", ok: true });
    });

    it("gate with --issue=<id> requires the tracker shape and a tracker issue id", async () => {
      expect((await gate(wired(), "650-x", "--issue=650")).code).toBe(0);
      expect((await gate(wired(), "dev-ci", "--issue=650")).code).toBe(1);
      expect((await gate(wired(), "650-x", "--issue=ABC-1")).code).toBe(1);
      expect((await gate(wired("linear"), "abc-1-x", "--issue=ABC-1")).code).toBe(0);
    });

    it("gate with --issue absent is unchanged: the tracker shape alone", async () => {
      expect((await gate(wired(), "650-x")).code).toBe(0);
      expect((await gate(wired(), "dev-ci-failures")).code).toBe(1);
      expect((await gate(wired(), "123-fix", "--issue=")).code).toBe(1);
    });

    it("gate --issue without --fid is a usage error", async () => {
      expect(
        (
          await run(wired(), [
            "steps",
            "gate",
            "--workflow=design",
            "--step=design-start-workflow",
            "--issue=",
          ])
        ).code,
      ).toBe(2);
    });

    it('gate --issue="" under none keeps today\'s check', async () => {
      expect((await gate(repo(), "123-fix", "--issue=")).code).toBe(0);
    });
  });

  it("--attempt-of checks the row carries the derived counter", async () => {
    const cwd = repo();
    await run(cwd, doneArgs("--attempt=next"));
    const gate = (spec: string) =>
      run(cwd, [
        "steps",
        "gate",
        ...STEP,
        "--sub-plan=1",
        `--attempt-of=${spec}`,
        "--artifact=logs/verify-<attempt>.md",
      ]);
    expect((await gate("build-plan-verify:current")).code).toBe(0);
    expect((await gate("build-plan-verify:next")).code).toBe(1);
    expect(
      (await run(cwd, ["steps", "gate", "--workflow=build", "--step=x", "--attempt-of=x:next"]))
        .code,
    ).toBe(2);
  });
});
