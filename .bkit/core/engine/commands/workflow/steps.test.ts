import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEFERRAL_WRITERS, KIND_WRITERS } from "../../ledgers/telemetry";
import { parseText } from "../../shared/text";
import { runCommand } from "../lib";
import { COMMANDS } from "../registry";
import { newRecord, readRecord, writeRecord } from "./ledgers";
import {
  EXIT_SOURCE_TOUCHED,
  EXIT_TESTS_TOUCHED,
  ROW_FIELDS,
  headerDeclaration,
  placeholderLines,
  promptHeader,
  promptVerdicts,
  readHeader,
  stepsCommand,
} from "./steps";
import { blockHash, runPlanPath } from "./tests";

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
    "Verdict: FAIL\nFailures: 2\nFixable: true\nTasks: none\nLoosened: none\n\n<!-- verdict:end -->\n\n# Verify\n\n## Identified Gaps Log\n\n- Gap one at `a.ts:1` — Fixable: true\n- Gap two at `b.ts:2` — Fixable: true\n",
  );
  return cwd;
}

const write = (cwd: string, rel: string, body: string) =>
  fs.writeFileSync(path.join(cwd, rel), body);

async function run(cwd: string, argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand([...argv, "--json"], COMMANDS, {
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
  "--group=1",
  "--artifact=logs/verify-1.md",
  "--message=chore(1-x): plan-verify",
  ...extra,
];

function ciFinishFixture() {
  const cwd = repo();
  const selection = {
    mode: "ci",
    provider: "github",
    repo: "example/example",
    runId: "123",
    runAttempt: 2,
    runUrl: "https://github.com/example/example/actions/runs/123/attempts/2",
    workflowId: "456",
    workflowPath: ".github/workflows/consumer-ci.yml",
    headBranch: "feat/1-x",
    headSha: git(cwd, "rev-parse", "HEAD"),
    conclusion: "failure",
    redTiers: ["integration"],
    via: "prompt-run",
  };
  const artifact = "logs/ci-round-1.md";
  const row = {
    type: "test-run",
    workflow: "debug",
    step: "debug-run-tests",
    at: "2026-10-01T00:00:02Z",
    attempt: 1,
    run: 1,
    source: "ci",
    verdict: "FAIL",
    scope: "ci:123",
    gate: null,
    exitCode: null,
    failures: null as number | null,
    ciRun: "123",
    ciUrl: selection.runUrl,
    runAttempt: 2,
    ciGeneration: 1,
    repo: selection.repo,
    workflowId: selection.workflowId,
    workflowPath: selection.workflowPath,
    headSha: selection.headSha,
    log: artifact,
    artifact,
  };
  const rows = [
    { type: "workflow-started", workflow: "debug", at: "2026-10-01T00:00:00Z" },
    {
      type: "workflow-meta",
      workflow: "debug",
      at: "2026-10-01T00:00:01Z",
      ciSelection: selection,
      ciGeneration: 1,
    },
    row,
  ];
  const save = () =>
    write(cwd, "logs/status.jsonl", rows.map((value) => JSON.stringify(value)).join("\n") + "\n");
  save();
  write(
    cwd,
    artifact,
    [
      "Verdict: FAIL",
      "Source: ci",
      "Scope: ci:123",
      `Repository: ${selection.repo}`,
      `Workflow: ${selection.workflowPath} (${selection.workflowId})`,
      "Run: 123",
      "Run attempt: 2",
      "CI generation: 1",
      `Commit: ${selection.headSha}`,
      `URL: ${selection.runUrl}`,
      "",
      "<!-- verdict:end -->",
      "",
      "# CI evidence",
      "",
      "The local gate was not run.",
      "",
    ].join("\n"),
  );
  const args = [
    "steps",
    "finish",
    "--file=logs/status.jsonl",
    "--workflow=debug",
    "--step=debug-run-tests",
    "--attempt=1",
    "--verdict=FAIL",
    "--scope=ci:123",
    `--artifact=${artifact}`,
    "--field=source=ci",
    "--field=ciGeneration=1",
    "--clamp-log=debug-run-tests:1",
    "--commit=none",
  ];
  return { cwd, selection, artifact, row, rows, save, args };
}

describe("test-round completion evidence", () => {
  it("finishes validated CI evidence rounds without local clamp records", async () => {
    const valid = ciFinishFixture();
    const finished = await run(valid.cwd, valid.args);
    expect(finished.code).toBe(0);
    expect(finished.json).toMatchObject({ pass: true, verdict: "FAIL", attempt: 1 });
    expect(finished.json.row).toMatchObject({
      step: "debug-run-tests",
      source: "ci",
      ciGeneration: 1,
      scope: "ci:123",
    });
    expect(finished.json.row.artifacts).toContain(valid.artifact);
    expect(finished.json.row.failures).not.toBe(0);
    const wrongAttempt = ciFinishFixture();
    wrongAttempt.row.runAttempt = 3;
    wrongAttempt.save();
    const refused = await run(wrongAttempt.cwd, wrongAttempt.args);
    expect(refused.code).not.toBe(0);
    expect(
      fs.readFileSync(path.join(wrongAttempt.cwd, "logs/status.jsonl"), "utf-8"),
    ).not.toContain('"type":"step-done"');
    const forged = ciFinishFixture();
    const artifact = fs.readFileSync(path.join(forged.cwd, forged.artifact), "utf-8");
    write(
      forged.cwd,
      forged.artifact,
      artifact.replace(
        forged.selection.runUrl,
        "https://github.com/example/example/actions/runs/999/attempts/2",
      ),
    );
    expect((await run(forged.cwd, forged.args)).code).not.toBe(0);
  });

  it("finishes a CI round only with its own failed job count", async () => {
    const stepDone = (f: ReturnType<typeof ciFinishFixture>) =>
      fs
        .readFileSync(path.join(f.cwd, "logs/status.jsonl"), "utf-8")
        .includes('"type":"step-done"');
    const counted = ciFinishFixture();
    counted.row.failures = 2;
    counted.save();
    const finished = await run(counted.cwd, [...counted.args, "--failures=2"]);
    expect(finished.code).toBe(0);
    expect(finished.json.row).toMatchObject({ step: "debug-run-tests", source: "ci", failures: 2 });
    expect(stepDone(counted)).toBe(true);

    const different = ciFinishFixture();
    different.row.failures = 2;
    different.save();
    const wrong = await run(different.cwd, [...different.args, "--failures=3"]);
    expect(wrong.code).not.toBe(0);
    expect(stepDone(different)).toBe(false);

    const uncounted = ciFinishFixture();
    const refused = await run(uncounted.cwd, [...uncounted.args, "--failures=2"]);
    expect(refused.code).not.toBe(0);
    expect(stepDone(uncounted)).toBe(false);
  });

  it("preserves local clamp enforcement when completing test rounds", async () => {
    const cwd = repo();
    write(
      cwd,
      "logs/local-round-1.md",
      "Verdict: PASS\n\n<!-- verdict:end -->\n\n# Local checks\n\nOne local test passed.\n",
    );
    write(
      cwd,
      "logs/status.jsonl",
      [
        { type: "workflow-started", workflow: "debug", at: "2026-10-01T00:00:00Z" },
        {
          type: "test-run",
          workflow: "debug",
          step: "debug-run-tests",
          at: "2026-10-01T00:00:01Z",
          attempt: 1,
          run: 1,
          source: "local",
          verdict: "PASS",
          exitCode: 0,
          failures: 0,
          scope: "pnpm bkit:gate:static-unit",
          log: "logs/local.log",
          artifact: "logs/local-round-1.md",
        },
      ]
        .map((value) => JSON.stringify(value))
        .join("\n") + "\n",
    );
    const result = await run(cwd, [
      "steps",
      "finish",
      "--file=logs/status.jsonl",
      "--workflow=debug",
      "--step=debug-run-tests",
      "--attempt=1",
      "--verdict=PASS",
      "--failures=0",
      "--scope=pnpm bkit:gate:static-unit",
      "--artifact=logs/local-round-1.md",
      "--field=source=local",
      "--clamp-log=debug-run-tests:1",
      "--commit=none",
    ]);
    expect(result.code).not.toBe(0);
    expect(`${result.err} ${JSON.stringify(result.json)}`).toMatch(/clamp/i);
    expect(fs.readFileSync(path.join(cwd, "logs/status.jsonl"), "utf-8")).not.toContain(
      '"type":"step-done"',
    );
  });
});

describe("progress command output", () => {
  it("finish prints progressLine", async () => {
    const cwd = repo();
    const r = await run(cwd, [
      "steps",
      "finish",
      ...STEP,
      "--group=1",
      "--attempt=1",
      "--verdict=FAIL",
      "--failures=2",
      "--artifact=logs/verify-1.md",
      "--commit=none",
    ]);
    expect(r.code).toBe(0);
    expect(r.json.progressLine).toBe(
      "Progress: █████░░░░░ 50% · Step 8/16 Plan Verify · Group 1 of 1",
    );
    expect(r.json.row).not.toHaveProperty("progressLine");
    expect(fs.readFileSync(path.join(cwd, "logs/status.jsonl"), "utf8")).not.toContain(
      "progressLine",
    );
  });

  it("done prints progressLine", async () => {
    const cwd = repo();
    const r = await run(cwd, ["steps", "done", ...STEP, "--group=1", "--commit=none"]);
    expect(r.code).toBe(0);
    expect(r.json.progressLine).toBe(
      "Progress: █████░░░░░ 50% · Step 8/16 Plan Verify · Group 1 of 1",
    );
    const out: string[] = [];
    const code = await runCommand(
      ["steps", "done", ...STEP, "--group=1", "--commit=none"],
      COMMANDS,
      {
        classicVerbs: new Set(),
        cwd,
        io: { stdout: (text) => out.push(text), stderr: () => undefined },
      },
    );
    expect(code).toBe(0);
    expect(out.join("")).toContain(`progressLine: ${r.json.progressLine}`);
    expect(r.json.row).not.toHaveProperty("progressLine");
  });

  it("progress output metadata", () => {
    for (const [noun, verbs] of [
      ["steps", ["done", "finish", "gate"]],
      ["context", ["finalise"]],
      ["runs", ["dispatch"]],
      ["workflows", ["close"]],
    ] as const) {
      const spec = COMMANDS.find((entry) => entry.noun === noun)!;
      for (const verb of verbs)
        expect(spec.verbs[verb]!.output, `${noun} ${verb}`).toHaveProperty("progressLine");
    }
    expect(stepsCommand.verbs.gate!.flags?.some((flag) => flag.name === "progress-number")).toBe(
      true,
    );
  });

  it("gate progress number validation", async () => {
    const cwd = repo();
    await run(cwd, ["steps", "done", ...STEP, "--group=1", "--attempt=1", "--commit=none"]);
    const args = ["steps", "gate", ...STEP, "--group=1", "--attempt=1"];
    for (const value of ["0", "17", "1.5", "not-a-number"]) {
      const result = await run(cwd, [...args, `--progress-number=${value}`]);
      expect(result.code, value).not.toBe(0);
      expect(result.json?.progressLine).toBeUndefined();
    }
    const good = await run(cwd, [...args, "--progress-number=8"]);
    expect(good.code).toBe(0);
    expect(good.json.progressLine).toBe(
      "Progress: █████░░░░░ 50% · Step 8/16 Plan Verify · Group 1 of 1",
    );
    const badGate = await run(cwd, [...args, "--artifact=logs/missing.md", "--progress-number=8"]);
    expect(badGate.code).not.toBe(0);
    expect(badGate.json?.progressLine).toBeUndefined();
  });
});

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
      group: 1,
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

  it("done --group writes group on the row", async () => {
    const cwd = repo();
    const r = await run(cwd, [...doneArgs().filter((a) => a !== "--group=1"), "--group=2"]);
    expect(r.code).toBe(0);
    expect(r.json.row).toMatchObject({ group: 2 });
    expect(r.json.row).not.toHaveProperty("subPlan");
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
    expect(r.json.row.uncommitted).toBe(true);
    expect(git(cwd, "status", "--porcelain")).toContain("logs/");
  });

  it("build-group-start records parentSha and group", async () => {
    const cwd = repo();
    const before = git(cwd, "rev-parse", "HEAD");
    const r = await run(cwd, [
      "steps",
      "done",
      "--file=logs/status.jsonl",
      "--workflow=build",
      "--step=build-group-start",
      "--group=2",
      "--commit=none",
    ]);
    expect(r.code).toBe(0);
    expect(r.json.row).toMatchObject({
      step: "build-group-start",
      status: "DONE",
      parentSha: before,
      group: 2,
    });
    expect(r.json.commit).toBeNull();
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

  it("reports a failed commit with exit 8 without writing the row", async () => {
    const cwd = repo();
    fs.mkdirSync(path.join(cwd, ".git/hooks"), { recursive: true });
    write(cwd, ".git/hooks/pre-commit", "#!/bin/sh\necho blocked >&2\nexit 1\n");
    fs.chmodSync(path.join(cwd, ".git/hooks/pre-commit"), 0o755);
    const r = await run(cwd, doneArgs());
    expect(r.code).toBe(8);
    expect(r.err).toContain("blocked");
    expect(fs.existsSync(path.join(cwd, "logs/status.jsonl"))).toBe(false);
  });

  it("a failed commit leaves no row staged in the index", async () => {
    const cwd = repo();
    fs.mkdirSync(path.join(cwd, ".git/hooks"), { recursive: true });
    write(cwd, ".git/hooks/pre-commit", "#!/bin/sh\necho blocked >&2\nexit 1\n");
    fs.chmodSync(path.join(cwd, ".git/hooks/pre-commit"), 0o755);
    const r = await run(cwd, doneArgs());
    expect(r.code).toBe(8);
    // The rollback takes the row off disk, so the index must lose it too: a pathspec-less
    // commit would otherwise carry the row the failed attempt was refused. Nothing else
    // the attempt staged is left behind either — the index matches the rolled-back tree.
    const staged = git(cwd, "diff", "--cached", "--name-only");
    expect(staged).not.toContain("status.jsonl");
    expect(staged).toBe("");
  });

  /** `repo()` with a failing pre-commit `hook`; `rows` seeds a committed `logs/status.jsonl`. */
  function hookedRepo(hook: string, rows = '{"type":"x","n":1}\n') {
    const cwd = repo();
    if (rows !== "") {
      write(cwd, "logs/status.jsonl", rows);
      git(cwd, "add", "-A");
      git(cwd, "commit", "-q", "-m", "base");
    }
    fs.mkdirSync(path.join(cwd, ".git/hooks"), { recursive: true });
    write(cwd, ".git/hooks/pre-commit", `#!/bin/sh\n${hook}\n`);
    fs.chmodSync(path.join(cwd, ".git/hooks/pre-commit"), 0o755);
    return cwd;
  }
  /** A pre-commit body standing in for a writer that appends during the commit window. */
  const OTHER_WRITER = `printf '{"type":"other-writer"}\\n' >> logs/status.jsonl\necho blocked >&2\nexit 1`;
  const statusText = (cwd: string) => fs.readFileSync(path.join(cwd, "logs/status.jsonl"), "utf-8");

  it("a failed commit restores an already-staged status.jsonl to its pre-attempt index entry", async () => {
    const cwd = hookedRepo("echo blocked >&2\nexit 1");
    fs.appendFileSync(path.join(cwd, "logs/status.jsonl"), '{"type":"x","n":2}\n');
    git(cwd, "add", "logs/status.jsonl");
    // A partially staged file: one change staged, a later one left in the working tree.
    write(cwd, "logs/verify-1.md", "staged\n");
    git(cwd, "add", "logs/verify-1.md");
    write(cwd, "logs/verify-1.md", "Verdict: FAIL\nFailures: 2\n\n<!-- verdict:end -->\n");
    const indexBefore = git(cwd, "ls-files", "-s");
    const r = await run(cwd, doneArgs());
    expect(r.code).toBe(8);
    expect(git(cwd, "show", ":logs/status.jsonl")).toBe('{"type":"x","n":1}\n{"type":"x","n":2}');
    expect(git(cwd, "ls-files", "-s")).toBe(indexBefore);
    expect(git(cwd, "show", ":logs/verify-1.md")).toBe("staged");
  });

  it("a failed commit keeps a caller-staged path that a bracketed new path glob-matches", async () => {
    const cwd = hookedRepo("echo blocked >&2\nexit 1");
    fs.mkdirSync(path.join(cwd, "src"));
    write(cwd, "src/i.tsx", "caller staged\n");
    git(cwd, "add", "src/i.tsx");
    write(cwd, "src/[id].tsx", "run made\n");
    const r = await run(cwd, doneArgs());
    expect(r.code).toBe(8);
    expect(git(cwd, "diff", "--cached", "--name-only")).toBe("src/i.tsx");
  });

  it("a failed commit whose status.jsonl gained another writer's row does not report nothing written", async () => {
    const cwd = hookedRepo(OTHER_WRITER);
    const r = await run(cwd, doneArgs());
    expect(r.code).toBe(82);
    expect(r.err).toContain("blocked");
    expect(r.err).not.toContain("no row written");
    expect(r.err).toContain(`stays in ${path.join(cwd, "logs/status.jsonl")}`);
    expect(statusText(cwd).match(/"step-done"/g)).toHaveLength(1);
    expect(statusText(cwd)).toContain("other-writer");
  });

  it("a failed first-row commit keeps a row another writer appended during the commit", async () => {
    const cwd = hookedRepo(OTHER_WRITER, "");
    const r = await run(cwd, doneArgs());
    expect(r.code).toBe(82);
    expect(statusText(cwd)).toContain("other-writer");
  });

  it("a failed commit that removed status.jsonl still exits 8 with the commit error and an unstaged index", async () => {
    const cwd = hookedRepo("rm -f logs/status.jsonl\necho blocked-by-hook >&2\nexit 1");
    const r = await run(cwd, doneArgs());
    expect(r.code).toBe(8);
    expect(r.err).toContain("blocked-by-hook");
    expect(git(cwd, "diff", "--cached", "--name-only")).toBe("");
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
    expect(r.json).toEqual({
      verdict: "FAIL",
      fields: { Verdict: "FAIL", Failures: "2", Fixable: "true", Tasks: "none", Loosened: "none" },
    });
  });

  it("reads a header with a leftover Fingerprint line", async () => {
    const cwd = repo();
    write(
      cwd,
      "logs/old.md",
      "Verdict: PASS\nFingerprint: 0000000000000000\n<!-- verdict:end -->\n\n# Body edited later\n",
    );
    const r = await run(cwd, ["steps", "verdict", "--file=logs/old.md"]);
    expect(r.err).not.toMatch(/Fingerprint mismatch|stale/);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ verdict: "PASS" });
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

  it("takes the allowed values from the subagent's own prompt, or from --allowed", async () => {
    expect(promptVerdicts("bkit-build-plan-verify")).toEqual(["PASS", "CONCERNS", "FAIL"]);
    const cwd = repo();
    write(cwd, "logs/c.md", "Verdict: SPLIT\n<!-- verdict:end -->\n");
    expect((await run(cwd, ["steps", "verdict", "--file=logs/c.md"])).code).toBe(6);
    expect(
      (await run(cwd, ["steps", "verdict", "--file=logs/c.md", "--agent=bkit-build-plan-verify"]))
        .code,
    ).toBe(6);
    expect(
      (await run(cwd, ["steps", "verdict", "--file=logs/c.md", "--allowed=SINGLE,SPLIT"])).code,
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
    run(cwd, ["steps", "gate", ...STEP, "--group=1", "--artifact=logs/verify-1.md", ...extra]);

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
      "--group=1",
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
      "--group=1",
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

  it("records a verdict outside PASS|CONCERNS|FAIL as `verdict`, from the --allowed set", async () => {
    const cwd = repo();
    write(cwd, "logs/check.md", "Verdict: STOP\n\n<!-- verdict:end -->\n");
    const args = [
      "steps",
      "done",
      "--file=logs/status.jsonl",
      "--workflow=plan",
      "--step=plan-generate",
      "--verdict=STOP",
      "--attempt=1",
      "--artifact=logs/check.md",
      "--commit=none",
    ];
    const r = await run(cwd, [...args, "--allowed=GO,STOP"]);
    expect(r.code).toBe(0);
    expect(r.json.row).toMatchObject({ verdict: "STOP" });
    // Without --allowed the default PASS|CONCERNS|FAIL set refuses it.
    expect((await run(cwd, args)).code).toBe(2);
    const g = await run(cwd, [
      "steps",
      "gate",
      "--file=logs/status.jsonl",
      "--workflow=plan",
      "--step=plan-generate",
      "--attempt=1",
      "--artifact=logs/check.md",
      "--verdict-required",
      "--allowed=GO,STOP",
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
    const r = await rowThenGate("build", "build-plan-verify", ["--group=1"], ["--group=1"]);
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

  it("steps finish records attempt and scope on a build-holistic-gate row", async () => {
    const cwd = repo();
    const finish = (...extra: string[]) =>
      run(cwd, [
        "steps",
        "finish",
        "--file=logs/status.jsonl",
        "--workflow=build",
        "--step=build-holistic-gate",
        "--verdict=FAIL",
        "--attempt=2",
        "--commit=none",
        ...extra,
      ]);
    const unscoped = await finish();
    expect(unscoped.code).not.toBe(0);
    expect(`${unscoped.err} ${JSON.stringify(unscoped.json)}`).toContain("row would miss scope");
    const r = await finish("--scope=pnpm bkit:gate:changed");
    expect(r.code).toBe(0);
    expect(r.json.row).toMatchObject({
      step: "build-holistic-gate",
      attempt: 2,
      scope: "pnpm bkit:gate:changed",
    });
    expect(r.json.progressLine).toContain("Plan Verify Holistic");
  });

  it("names every missing field at once", async () => {
    const r = await rowThenGate("build", "build-failure-remediate", []);
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

describe("ledger writer references", () => {
  it("every configured writer has a prompt file", () => {
    const prompts = path.join(REPO_ROOT, ".bkit", "core", "prompts");
    const named = [
      ...DEFERRAL_WRITERS,
      ...Object.values(KIND_WRITERS)
        .map((w) => w.subagents)
        .filter((s): s is ReadonlySet<string> => s instanceof Set)
        .flatMap((s) => [...s]),
    ];
    expect(named.filter((n) => !fs.existsSync(path.join(prompts, `${n}.md`)))).toEqual([]);
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

  it("preserves challenge findings in the event when a later round overwrites the report", async () => {
    const cwd = repo();
    write(
      cwd,
      "logs/challenge.md",
      [
        "Verdict: FAIL",
        "Failures: 1",
        "<!-- verdict:end -->",
        "## Findings Log",
        "<!-- bkit:task 1 start -->",
        "- [ ] **TASK 1:** Handle missing value.",
        "  **Severity:** CRITICAL · **Fixable:** true · **Location:** `a.ts:10`",
        "  - **DONE WHEN:** Missing values work.",
        "  - **TEST FIRST:**",
        "    - `a.test.ts` `missing value` fails on null",
        "<!-- bkit:task 1 end -->",
      ].join("\n"),
    );
    const args = [
      ...FINISH,
      "--step=build-challenge",
      "--attempt=1",
      "--field=round=1",
      "--agent=bkit-build-challenge-1",
      "--artifact=logs/challenge.md",
      "--commit=none",
    ];
    const r = await run(cwd, args);
    expect(r.code).toBe(0);
    expect(r.json.row.challengeFindings).toEqual([
      { severity: "CRITICAL", location: "a.ts:10", title: "Handle missing value." },
    ]);
    write(
      cwd,
      "logs/challenge.md",
      "Verdict: PASS\nFailures: 0\n<!-- verdict:end -->\n## Findings Log\nNone\n",
    );
    const events = fs.readFileSync(path.join(cwd, "logs/status.jsonl"), "utf-8");
    expect(events).toContain('"location":"a.ts:10"');
    expect(events).toContain('"severity":"CRITICAL"');
  });

  it("steps finish refuses route=continue that decisions skip would refuse", async () => {
    const cwd = repo();
    const pause = (gate: string[]) =>
      [
        "Status: DECIDED",
        "From: verify",
        "Group: 1",
        ...gate,
        "Source changed: false",
        "",
        "**Q1 — Task 3 gap:** accept it?",
        "A) Accept — the item is recorded as accepted",
        "B) Fix now — a fix task is added to the plan",
        "Recommended: A) Accept — minor",
        "Decision: Accept — minor",
        "",
      ].join("\n");
    // Run 1 started before the engine marked its start row, so these old files read as written.
    const started = `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" })}\n`;
    write(cwd, "logs/status.jsonl", started);
    write(cwd, "logs/build-decision-1-1.md", pause(["Gate: FAIL"]));
    write(cwd, "logs/build-decision-1-2.md", pause([]));
    const finishDecision = (n: number) =>
      run(cwd, [
        ...FINISH,
        "--step=build-decision",
        `--attempt=${n}`,
        `--artifact=logs/build-decision-1-${n}.md`,
        "--field=route=continue",
        "--commit=none",
      ]);
    const refused = await finishDecision(1);
    expect(refused.code).toBe(1);
    expect(refused.err).toContain("Gate: FAIL");
    expect(fs.readFileSync(path.join(cwd, "logs/status.jsonl"), "utf-8")).toBe(started);
    const clean = await finishDecision(2);
    expect(clean.code).toBe(0);
    expect(clean.json.row).toMatchObject({ step: "build-decision", route: "continue" });
  });

  it("reads the agent's header, derives the attempt, writes and commits the row, prints the comment", async () => {
    const cwd = repo();
    const before = git(cwd, "rev-parse", "HEAD");
    const r = await run(cwd, [
      ...FINISH,
      "--step=build-plan-verify",
      "--group=1",
      "--attempt-of=build-plan-verify:next",
      "--agent=bkit-build-plan-verify",
      "--artifact=logs/verify-<attempt>.md",
      "--message=chore(1-x): plan-verify attempt <attempt>",
      "--number=7",
      "--title=Plan Verify",
      "--group-count=2",
    ]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ verdict: "FAIL", failures: 2, attempt: 1, pass: true });
    expect(r.json.row).toMatchObject({
      step: "build-plan-verify",
      verdict: "FAIL",
      failures: 2,
      attempt: 1,
      group: 1,
      parentSha: before,
      artifacts: ["logs/verify-1.md"],
    });
    expect(r.json.parentSha).toBe(before);
    expect(git(cwd, "log", "-1", "--format=%s")).toBe("chore(1-x): plan-verify attempt 1");
    expect(r.json.comment).toContain(
      "### Step 7 — Plan Verify - Verdict: FAIL - Failures: 2 - Group: 1/2 - Attempt: 1",
    );
    expect(fs.readFileSync(r.json.commentFile, "utf-8")).toBe(r.json.comment);
    expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).not.toContain("tmp/");
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

  describe("--derived-artifact", () => {
    const DERIVED = ["--step=build-create-pr", "--commit=none"];

    it("a --derived-artifact holding a whole-line PENDING passes and is recorded", async () => {
      const cwd = repo();
      write(cwd, "logs/related.md", "Quoted from another issue:\nPENDING\nStatus: PENDING\n");
      const r = await run(cwd, [...FINISH, ...DERIVED, "--derived-artifact=logs/related.md"]);
      expect(r.code).toBe(0);
      expect(r.json.row.artifacts).toContain("logs/related.md");
    });

    it("a PENDING in --artifact still refuses while a --derived-artifact is passed", async () => {
      const cwd = repo();
      write(cwd, "logs/related.md", "PENDING\n");
      write(cwd, "logs/own.md", "# Own\n\nPENDING\n");
      const r = await run(cwd, [
        ...FINISH,
        ...DERIVED,
        "--artifact=logs/own.md",
        "--derived-artifact=logs/related.md",
      ]);
      expect(r.code).not.toBe(0);
      expect(r.err).toContain("placeholders logs/own.md");
      expect(r.err).not.toContain("placeholders logs/related.md");
    });

    it("a PENDING in --optional-artifact still refuses while a --derived-artifact is passed", async () => {
      const cwd = repo();
      write(cwd, "logs/related.md", "PENDING\n");
      write(cwd, "logs/opt.md", "# Opt\n\nPENDING\n");
      const r = await run(cwd, [
        ...FINISH,
        ...DERIVED,
        "--optional-artifact=logs/opt.md",
        "--derived-artifact=logs/related.md",
      ]);
      expect(r.code).not.toBe(0);
      expect(r.err).toContain("placeholders logs/opt.md");
      expect(r.err).not.toContain("placeholders logs/related.md");
    });

    it("a missing --derived-artifact is skipped and not recorded", async () => {
      const cwd = repo();
      const r = await run(cwd, [...FINISH, ...DERIVED, "--derived-artifact=logs/absent.md"]);
      expect(r.code).toBe(0);
      expect(r.json.row.artifacts).not.toContain("logs/absent.md");
    });
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
    write(
      cwd,
      "logs/c1.md",
      [
        "Verdict: FAIL",
        "Failures: 1",
        "<!-- verdict:end -->",
        "## Findings Log",
        "<!-- bkit:task 1 start -->",
        "- [ ] **TASK 1:** Handle missing value.",
        "  **Severity:** CRITICAL · **Fixable:** true · **Location:** `a.ts:10`",
        "  - **DONE WHEN:** Missing values work.",
        "  - **TEST FIRST:**",
        "    - `a.test.ts` `missing value` fails on null",
        "<!-- bkit:task 1 end -->",
        "",
      ].join("\n"),
    );
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
    expect(r.json.row).toMatchObject({ verdict: "FAIL", failures: 1, attempt: 0 });
  });

  it("a true | false header field is true when any agent sets it true", async () => {
    const cwd = repo();
    const review = (redesign: string) =>
      `Verdict: FAIL\nFailures: 1\nRedesign: ${redesign}\n<!-- verdict:end -->\n## CRITICAL\n- One critical finding at \`a.ts:1\`.\n`;
    write(cwd, "logs/r1.md", review("false"));
    write(cwd, "logs/r2.md", review("true"));
    write(cwd, "logs/s.md", review("false"));
    const r = await run(cwd, [
      "steps",
      "finish",
      "--file=logs/status.jsonl",
      "--workflow=plan",
      "--step=plan-review",
      "--attempt=1",
      "--agent=bkit-plan-review-1",
      "--agent=bkit-plan-review-2",
      "--agent=bkit-plan-scope-check",
      "--artifact=logs/r1.md",
      "--artifact=logs/r2.md",
      "--artifact=logs/s.md",
      "--commit=none",
    ]);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ verdict: "FAIL", fields: { Redesign: "true" } });
  });

  it("text output leaves out the row and passing checks, and prints parentSha", async () => {
    const cwd = repo();
    const before = git(cwd, "rev-parse", "HEAD");
    write(cwd, "logs/c1.md", "Verdict: PASS\nFailures: 0\n<!-- verdict:end -->\n");
    const out: string[] = [];
    const argv = [
      ...FINISH,
      "--step=build-challenge",
      "--attempt=0",
      "--agent=bkit-build-challenge-1",
      "--artifact=logs/c1.md",
      "--commit=none",
    ];
    const code = await runCommand(argv, COMMANDS, {
      classicVerbs: new Set(),
      cwd,
      io: { stdout: (t) => out.push(t), stderr: () => {} },
    });
    expect(code).toBe(0);
    const text = parseText(out.join(""));
    expect(text).toMatchObject({ verdict: "PASS", parentSha: before, pass: true });
    expect(text).not.toHaveProperty("row");
    expect(text).not.toHaveProperty("checks");
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

  /** A repo whose worktree.copy names `.env` and `config/local`, both copied in and not gitignored. */
  function copiedRepo() {
    const cwd = repo();
    write(
      cwd,
      "package.json",
      JSON.stringify({ bkit: { workflows: { worktree: { copy: [".env", "config/local"] } } } }),
    );
    git(cwd, "add", "package.json");
    git(cwd, "commit", "-q", "-m", "config");
    write(cwd, ".env", "SECRET=1\n");
    fs.mkdirSync(path.join(cwd, "config"));
    write(cwd, "config/local", "x\n");
    return cwd;
  }

  it("--commit=auto never stages a copied-in worktree.copy file", async () => {
    const cwd = copiedRepo();
    write(cwd, "src.ts", "export {};\n");
    const r = await run(cwd, [
      ...FINISH,
      "--step=build-branch-sync",
      "--artifact=logs/verify-1.md",
      "--message=m",
    ]);
    expect(r.code).toBe(0);
    const committed = git(cwd, "show", "--name-only", "--format=", "HEAD").split("\n");
    expect(committed).toContain("src.ts");
    expect(committed).not.toContain(".env");
    expect(committed).not.toContain("config/local");
    expect(git(cwd, "status", "--porcelain").split("\n").sort()).toEqual(["?? .env", "?? config/"]);
  });

  it("--docs-only does not count a copied-in worktree.copy file as outside docs/plans/", async () => {
    const cwd = copiedRepo();
    git(cwd, "add", "logs");
    git(cwd, "commit", "-q", "-m", "logs");
    fs.mkdirSync(path.join(cwd, "docs/plans/202610"), { recursive: true });
    write(cwd, "docs/plans/202610/sync.md", "Verdict: PASS\nFailures: 0\n\n<!-- verdict:end -->\n");
    const r = await run(cwd, [
      "steps",
      "finish",
      "--file=docs/plans/202610/status.jsonl",
      "--workflow=build",
      "--step=build-branch-sync",
      "--artifact=docs/plans/202610/sync.md",
      "--docs-only",
      "--message=m",
    ]);
    expect(r.code).toBe(0);
    expect(git(cwd, "ls-files", ".env", "config/local")).toBe("");
  });

  /** Like `copiedRepo`, but a copy entry is gitignored — the #700 shape. */
  function copiedRepoGitignored() {
    const cwd = repo();
    write(cwd, ".gitignore", ".bkit/.env\n");
    write(
      cwd,
      "package.json",
      JSON.stringify({ bkit: { workflows: { worktree: { copy: [".env", ".bkit/.env"] } } } }),
    );
    git(cwd, "add", ".gitignore", "package.json");
    git(cwd, "commit", "-q", "-m", "config");
    fs.mkdirSync(path.join(cwd, ".bkit"), { recursive: true });
    write(cwd, ".bkit/.env", "SECRET=1\n");
    return cwd;
  }

  it("--commit=auto commits when a copied-in worktree.copy entry is gitignored (#700)", async () => {
    const cwd = copiedRepoGitignored();
    write(cwd, "src.ts", "export {};\n");
    const r = await run(cwd, [
      ...FINISH,
      "--step=build-branch-sync",
      "--artifact=logs/verify-1.md",
      "--message=m",
    ]);
    expect(r.code).toBe(0);
    expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).toContain("src.ts");
    expect(git(cwd, "ls-files", ".bkit/.env")).toBe("");
  });
});

describe("bkit steps finish --post", () => {
  const LOG = "docs/plans/202610/logs/eng-4-x";
  const saved = process.env.BKIT_LINEAR_API_KEY;
  beforeEach(() => {
    delete process.env.BKIT_LINEAR_API_KEY;
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    if (saved === undefined) delete process.env.BKIT_LINEAR_API_KEY;
    else process.env.BKIT_LINEAR_API_KEY = saved;
  });

  function linearRepo() {
    const cwd = repo();
    fs.writeFileSync(
      path.join(cwd, "package.json"),
      JSON.stringify({ bkit: { tracker: { default: "linear" } } }),
    );
    fs.mkdirSync(path.join(cwd, LOG), { recursive: true });
    write(
      cwd,
      `${LOG}/verify-1.md`,
      "Verdict: PASS\nFailures: 0\nFixable: false\nTasks: none\nLoosened: none\n<!-- verdict:end -->\n",
    );
    return cwd;
  }
  const args = (...extra: string[]) => [
    "steps",
    "finish",
    `--file=${LOG}/status.jsonl`,
    "--workflow=build",
    "--step=build-plan-verify",
    "--group=1",
    "--attempt=1",
    "--agent=bkit-build-plan-verify",
    `--artifact=${LOG}/verify-1.md`,
    "--message=chore(eng-4-x): plan-verify",
    "--number=7",
    "--title=Plan Verify",
    ...extra,
  ];
  function stubLinear() {
    const sent: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_u: string, init: RequestInit) => {
        const q = JSON.parse(String(init.body)) as { variables: { input: { body: string } } };
        sent.push(q.variables.input.body);
        return new Response(
          JSON.stringify({
            data: { commentCreate: { success: true, comment: { url: "https://l/c/1" } } },
          }),
        );
      }),
    );
    return sent;
  }
  const rows = (cwd: string) =>
    fs
      .readFileSync(path.join(cwd, LOG, "status.jsonl"), "utf-8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l) as Record<string, unknown>);

  it("posts, records the engine-action row before the step row, and commits both", async () => {
    process.env.BKIT_LINEAR_API_KEY = "k";
    const cwd = linearRepo();
    const sent = stubLinear();
    const r = await run(cwd, args("--post"));
    expect(r.code).toBe(0);
    expect(r.json.tracker).toEqual({ done: true, action: "comment", url: "https://l/c/1" });
    expect(sent).toEqual([r.json.comment]);
    const [action, step] = rows(cwd);
    expect(action).toMatchObject({
      type: "engine-action",
      action: "comment",
      key: "build/1/build-plan-verify/1/1/comment",
      ref: "https://l/c/1",
    });
    expect(step).toMatchObject({ type: "step-done", step: "build-plan-verify" });
    expect(git(cwd, "status", "--porcelain", "--", LOG)).toBe("");
  });

  it("a re-run of the same step and body is deduped: nothing posted again", async () => {
    process.env.BKIT_LINEAR_API_KEY = "k";
    const cwd = linearRepo();
    const sent = stubLinear();
    await run(cwd, args("--post"));
    const again = await run(cwd, args("--post"));
    expect(again.json.tracker).toEqual({
      done: true,
      action: "comment",
      url: "https://l/c/1",
      deduped: true,
    });
    expect(sent).toHaveLength(1);
  });

  it("a failed post keeps the exit code and prints done false; the row still lands", async () => {
    const cwd = linearRepo();
    const r = await run(cwd, args("--post"));
    expect(r.code).toBe(0);
    expect(r.json.tracker).toEqual({ done: false, action: "comment", reason: "auth" });
    expect(rows(cwd).map((x) => x.type)).toEqual(["step-done"]);
  });

  it("--post needs --number; without --post there is no tracker key", async () => {
    const cwd = linearRepo();
    const noNumber = args("--post").filter((a) => !/^--(number|title)=/.test(a));
    expect((await run(cwd, noNumber)).code).toBe(2);
    const plain = await run(cwd, args("--commit=none"));
    expect(plain.json).not.toHaveProperty("tracker");
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

  it("refuses --result-file as an unknown flag", async () => {
    const cwd = repo();
    write(cwd, "logs/v1.md", "# Design\n\nBody.\n");
    write(cwd, "logs/r.json", "{}");
    const r = await run(cwd, [
      "steps",
      "stub",
      "--from=logs/v1.md",
      "--to=logs/v2.md",
      "--result-file=logs/r.json",
    ]);
    expect(r.code).toBe(2);
    expect(r.err).toContain("unknown flag --result-file");
    expect(fs.existsSync(path.join(cwd, "logs/v2.md"))).toBe(false);
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
      write(cwd, "package.json", JSON.stringify({ bkit: { tracker: { default: tracker } } }));
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

    it('gate --issue="" fails the fid check for a non-slug FID and passes 123-fix under github', async () => {
      const bad = await gate(wired(), "Fix_CI", "--issue=");
      expect(bad.code).toBe(1);
      expect(bad.json.checks[0]).toMatchObject({ check: "fid Fix_CI", ok: false });
      expect(bad.err).toContain("not a slug");
      expect((await gate(wired(), "123-fix", "--issue=")).code).toBe(0);
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
      expect((await gate(wired(), "Fix_CI", "--issue=")).code).toBe(1);
    });

    it("gate --fid=123-foo --issue=456 fails: the FID embeds another issue", async () => {
      const r = await gate(wired(), "123-foo", "--issue=456");
      expect(r.code).toBe(1);
      expect(r.json.checks[0]).toMatchObject({ check: "fid 123-foo", ok: false });
      expect(r.err).toContain("embeds issue 123, not the run's issue 456");
      expect((await gate(wired(), "123-foo", "--issue=123")).code).toBe(0);
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
        "--group=1",
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

describe("bkit steps done — a run in place on dev that shares its checkout", () => {
  const FID = "650-shared";
  const LOGS = `docs/plans/202610/logs/${FID}`;

  /** A repo on dev holding foreign work (modified, untracked, staged) and the run's record. */
  function shared() {
    const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-steps-shared-")));
    dirs.push(cwd);
    git(cwd, "init", "-q", "-b", "dev");
    git(cwd, "config", "user.email", "t@t");
    git(cwd, "config", "user.name", "t");
    fs.mkdirSync(path.join(cwd, "src"));
    write(cwd, "src/a.txt", "a\n");
    write(cwd, "src/staged.txt", "s\n");
    git(cwd, "add", "-A");
    git(cwd, "commit", "-q", "-m", "base");
    write(cwd, "src/a.txt", "a\nforeign\n");
    write(cwd, "notes.md", "foreign notes\n");
    write(cwd, "src/staged.txt", "s\nforeign\n");
    git(cwd, "add", "src/staged.txt");
    writeRecord(cwd, newRecord(cwd, FID, "dev"));
    fs.mkdirSync(path.join(cwd, LOGS), { recursive: true });
    write(cwd, `${LOGS}/verify-1.md`, "Verdict: PASS\nFailures: 0\n\n<!-- verdict:end -->\n");
    return cwd;
  }
  const step = (cwd: string) =>
    run(cwd, [
      "steps",
      "done",
      `--file=${LOGS}/status.jsonl`,
      "--workflow=debug",
      "--step=debug-verify",
      "--verdict=PASS",
      "--failures=0",
      `--artifact=${LOGS}/verify-1.md`,
      `--message=chore(${FID}): verify`,
    ]);
  const committed = (cwd: string) =>
    git(cwd, "show", "--name-only", "--format=", "HEAD").split("\n").sort();
  const staged = (cwd: string) => git(cwd, "diff", "--cached", "--name-only");

  it("writeStepRow with a shared-checkout record never commits a recorded path", async () => {
    const cwd = shared();
    const r = await step(cwd);
    expect(r.code).toBe(0);
    expect(committed(cwd)).toEqual([`${LOGS}/status.jsonl`, `${LOGS}/verify-1.md`]);
    expect(staged(cwd)).toBe("src/staged.txt");
    expect(fs.readFileSync(path.join(cwd, "src/a.txt"), "utf-8")).toBe("a\nforeign\n");
  });

  it("writeStepRow refuses when a recorded path changed", async () => {
    const cwd = shared();
    const head = git(cwd, "rev-parse", "HEAD");
    write(cwd, "src/a.txt", "a\nforeign\nedited mid-run\n");
    const r = await step(cwd);
    expect(r.code).toBe(10);
    expect(r.err).toContain("src/a.txt");
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
    // No row is written, so the re-run after the human's fix writes it once.
    expect(fs.existsSync(path.join(cwd, LOGS, "status.jsonl"))).toBe(false);
    write(cwd, "src/a.txt", "a\nforeign\n");
    expect((await step(cwd)).code).toBe(0);
    const rows = fs
      .readFileSync(path.join(cwd, LOGS, "status.jsonl"), "utf-8")
      .trim()
      .split("\n");
    expect(rows).toHaveLength(1);
  });

  it("writeStepRow exits 14 with no row and no commit when the run has no record on dev", async () => {
    const cwd = shared();
    fs.rmSync(
      path.resolve(cwd, git(cwd, "rev-parse", "--git-path", `bkit/shared-checkout/${FID}.json`)),
    );
    const head = git(cwd, "rev-parse", "HEAD");
    const r = await step(cwd);
    expect(r.code).toBe(14);
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
    expect(fs.existsSync(path.join(cwd, LOGS, "status.jsonl"))).toBe(false);
    expect(staged(cwd)).toBe("src/staged.txt");
  });

  it("writeStepRow appends its commit sha to the record", async () => {
    const cwd = shared();
    const r = await step(cwd);
    expect(r.code).toBe(0);
    expect(readRecord(cwd, FID)?.commits).toEqual([git(cwd, "rev-parse", "HEAD")]);
  });

  it("a hook-refused own-path commit exits without staging a recorded path or writing the row", async () => {
    const cwd = shared();
    const head = git(cwd, "rev-parse", "HEAD");
    fs.mkdirSync(path.join(cwd, ".git/hooks"), { recursive: true });
    write(cwd, ".git/hooks/pre-commit", "#!/bin/sh\necho blocked >&2\nexit 1\n");
    fs.chmodSync(path.join(cwd, ".git/hooks/pre-commit"), 0o755);
    const r = await step(cwd);
    expect(r.code).toBe(8);
    expect(r.err).toContain("blocked");
    expect(staged(cwd)).toBe("src/staged.txt");
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
    expect(readRecord(cwd, FID)).toMatchObject({ commits: [] });
    expect(fs.existsSync(path.join(cwd, LOGS, "status.jsonl"))).toBe(false);
  });
});

describe("bkit steps finish — the tests step touches only tests, the code steps never touch a test", () => {
  const TEST = { file: "src/a.test.ts", name: "adds a row" };
  const PLAN = [
    "# Plan",
    "",
    "<!-- bkit:group 1 start -->",
    "### GROUP 1: Rows",
    "<!-- bkit:task 1 start -->",
    "- [ ] **TASK 1:** Add a row",
    "  - **CREATE:** `src/a.ts`: the row",
    "  - **UPDATE:** `src/b.ts`: calls it",
    "  - **DONE WHEN:** passes",
    "  - **TEST FIRST:**",
    `    - \`${TEST.file}\` \`${TEST.name}\` fails on the stub`,
    "<!-- bkit:task 1 end -->",
    "<!-- bkit:group 1 end -->",
    "",
  ].join("\n");
  const STATUS = "logs/status.jsonl";
  const codeStep = (step: string, agent: string, log: string) => [
    "steps",
    "finish",
    `--file=${STATUS}`,
    "--workflow=build",
    `--step=${step}`,
    "--group=1",
    `--attempt-of=${step}:next`,
    `--agent=${agent}`,
    `--artifact=${log}`,
    `--message=chore(1-x): ${step} group 1`,
  ];
  const EXECUTE = codeStep("build-plan-tasks", "bkit-build-plan-tasks", "logs/execute-1-log.md");
  const REMEDIATE = codeStep(
    "build-plan-gaps-remediate",
    "bkit-build-plan-gaps-remediate",
    "logs/remediate-1-log.md",
  );
  const TESTS = [
    "steps",
    "finish",
    `--file=${STATUS}`,
    "--workflow=build",
    "--step=build-plan-tests",
    "--group=1",
    "--attempt=1",
    "--plan=plan.md",
    "--verdict=PASS",
    "--artifact=logs/build-plan-tests-1-log.md",
    "--message=chore(1-x): plan-tests group 1",
  ];

  /** A repo holding the plan, a source file and the planned test, all committed, plus the step logs. */
  function planned() {
    const cwd = repo();
    fs.mkdirSync(path.join(cwd, "src"));
    write(cwd, "plan.md", PLAN);
    write(cwd, "src/b.ts", "export const b = 1;\n");
    write(cwd, TEST.file, "it('adds a row', () => expect(addRow()).toBe(1));\n");
    git(cwd, "add", "-A");
    git(cwd, "commit", "-q", "-m", "tests");
    write(
      cwd,
      "logs/execute-1-log.md",
      "Verdict: PASS\n\n<!-- verdict:end -->\n\n# Build Plan\n\nDONE — TASK 1: added\n",
    );
    write(
      cwd,
      "logs/remediate-1-log.md",
      "Verdict: PASS\nStrategy: STANDARD\nFixed: 1\n\n<!-- verdict:end -->\n\n# Plan Gaps\n",
    );
    write(
      cwd,
      "logs/build-plan-tests-1-log.md",
      "# Tests\n\nWROTE — TASK 1: src/a.test.ts adds a row\n",
    );
    return cwd;
  }
  const blobOf = (cwd: string, file: string) => git(cwd, "hash-object", file);
  /** The group's build-tests-red row, naming the planned test at its committed blob. */
  const redRow = (cwd: string, extra: Record<string, unknown> = {}) =>
    fs.appendFileSync(
      path.join(cwd, STATUS),
      `${JSON.stringify({
        type: "step-done",
        workflow: "build",
        step: "build-tests-red",
        status: "DONE",
        at: "2026-11-01T05:00:00Z",
        parentSha: git(cwd, "rev-parse", "HEAD"),
        group: 1,
        attempt: 1,
        enforced: true,
        artifacts: ["logs/build-tests-red-1-1.md"],
        tests: [
          {
            task: 1,
            test: TEST.file,
            testName: TEST.name,
            state: "red",
            blob: blobOf(cwd, TEST.file),
          },
        ],
        ...extra,
      })}\n`,
    );
  const unchanged = (cwd: string, head: string, status: string) => {
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
    expect(fs.readFileSync(path.join(cwd, STATUS), "utf-8")).toBe(status);
  };

  it("refuses the execute step when a planned test file's blob differs from the row, exit 11, naming the files", async () => {
    const cwd = planned();
    redRow(cwd);
    write(cwd, TEST.file, "it('adds a row', () => expect(true).toBe(true));\n");
    write(cwd, "src/a.ts", "export const addRow = () => 1;\n");
    const head = git(cwd, "rev-parse", "HEAD");
    const status = fs.readFileSync(path.join(cwd, STATUS), "utf-8");
    const r = await run(cwd, EXECUTE);
    expect(r.code).toBe(EXIT_TESTS_TOUCHED);
    expect(r.code).toBe(11);
    expect(r.json.touched).toEqual([TEST.file]);
    expect(r.json.reask).toEqual({
      agent: "bkit-build-plan-tasks",
      artifact: "logs/execute-1-log.md",
    });
    expect(r.json.problem).toContain(TEST.file);
    expect(r.json.problem).toContain("BLOCKED");
    unchanged(cwd, head, status);
  });

  /** A test file holding the planned test and an unplanned one, and a red row naming the planned test's lines. */
  function twoTests() {
    const cwd = planned();
    const body = (planned: string, other: string) =>
      [
        "describe('rows', () => {",
        "  it('adds a row', () => {",
        `    expect(addRow()).toBe(${planned});`,
        "  });",
        "",
        "  it('counts rows', () => {",
        `    expect(count()).toBe(${other});`,
        "  });",
        "});",
        "",
      ].join("\n");
    write(cwd, TEST.file, body("1", "0"));
    git(cwd, "commit", "-qam", "tests");
    const text = fs.readFileSync(path.join(cwd, TEST.file), "utf-8");
    redRow(cwd, {
      tests: [
        {
          task: 1,
          test: TEST.file,
          testName: TEST.name,
          state: "red",
          blob: blobOf(cwd, TEST.file),
          block: blockHash(text, TEST.name),
        },
      ],
    });
    write(cwd, "src/a.ts", "export const addRow = () => 1;\n");
    return { cwd, body };
  }

  it("derives the block from the recorded blob when the row has none: a neighbour edit passes, a planned-test edit is refused", async () => {
    const { cwd, body } = twoTests();
    const status = path.join(cwd, STATUS);
    fs.writeFileSync(
      status,
      fs.readFileSync(status, "utf-8").replace(/"block":"[0-9a-f]+"/, '"block":null'),
    );
    write(cwd, TEST.file, body("1", "2"));
    expect((await run(cwd, EXECUTE)).code).toBe(0);
    write(cwd, TEST.file, body("2", "2"));
    const r = await run(cwd, EXECUTE);
    expect(r.code).toBe(11);
    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
  });

  it("locks the planned test case, not its file: an edit to another test of the file passes", async () => {
    const { cwd, body } = twoTests();
    write(cwd, TEST.file, body("1", "2"));
    expect((await run(cwd, EXECUTE)).code).toBe(0);
    expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).toContain(TEST.file);
  });

  it("skips a red record for a test name the plan no longer holds, and still locks the planned test", async () => {
    const cwd = planned();
    const body = (planned: string, other: string) =>
      [
        "describe('mirror suite', () => {",
        "  it('adds a row', () => {",
        `    expect(addRow()).toBe(${planned});`,
        "  });",
        "  it('counts rows', () => {",
        `    expect(count()).toBe(${other});`,
        "  });",
        "});",
        "",
      ].join("\n");
    write(cwd, TEST.file, body("1", "0"));
    git(cwd, "commit", "-qam", "tests");
    const text = fs.readFileSync(path.join(cwd, TEST.file), "utf-8");
    const entry = (testName: string, state: string) => ({
      task: 1,
      test: TEST.file,
      testName,
      state,
      blob: blobOf(cwd, TEST.file),
      block: blockHash(text, testName),
    });
    // An earlier plan named the suite; the plan now names only the test inside it.
    redRow(cwd, { tests: [entry("mirror suite", "missing"), entry(TEST.name, "red")] });
    write(cwd, "src/a.ts", "export const addRow = () => 1;\n");
    write(cwd, TEST.file, body("1", "2"));
    expect((await run(cwd, EXECUTE)).code).toBe(11);
    const withPlan = await run(cwd, [...EXECUTE, "--plan=plan.md"]);
    expect(withPlan.code).toBe(0);

    write(cwd, TEST.file, body("2", "2"));
    const r = await run(cwd, [...EXECUTE, "--plan=plan.md"]);
    expect(r.code).toBe(11);
    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
  });

  it("finds the run's plan beside its status file", () => {
    expect(runPlanPath("docs/plans/202611/logs/787-x/status.jsonl")).toBe(
      path.join("docs/plans/202611", "787-x-plan.md"),
    );
  });

  it("refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row", async () => {
    const { cwd, body } = twoTests();
    write(cwd, TEST.file, body("2", "2"));
    vi.stubEnv("BKIT_ENGINE_JOURNAL", "on");
    const r = await run(cwd, EXECUTE);
    vi.unstubAllEnvs();
    expect(r.code).toBe(11);
    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
    expect(r.json.touched).toEqual([TEST.file]);
    expect(r.json.problem).toContain(`"${TEST.name}"`);
    expect(r.json.problem).toContain("other edits to the file stay");
    const friction = fs
      .readFileSync(path.join(cwd, ".bkit/friction.jsonl"), "utf-8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l) as Record<string, unknown>);
    expect(friction).toEqual([
      expect.objectContaining({
        kind: "friction",
        category: "agent-rework",
        by: { workflow: "build", step: "build-plan-tasks" },
      }),
    ]);
  });

  it("passes the execute step when every planned test file matches the row, and checks nothing without a row", async () => {
    const cwd = planned();
    redRow(cwd);
    write(cwd, "src/a.ts", "export const addRow = () => 1;\n");
    expect((await run(cwd, EXECUTE)).code).toBe(0);
    expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).toContain("src/a.ts");

    const bare = planned();
    write(bare, TEST.file, "it('adds a row', () => expect(true).toBe(true));\n");
    expect((await run(bare, EXECUTE)).code).toBe(0);
  });

  it("applies the blob check to the gaps-remediate step, against the latest blob each file was recorded at", async () => {
    const cwd = planned();
    redRow(cwd, {
      tests: [
        { task: 1, test: TEST.file, testName: TEST.name, state: "red", blob: "0".repeat(40) },
      ],
    });
    redRow(cwd);
    // A later row of the group naming only another file leaves this file's blob standing.
    write(cwd, "src/other.test.ts", "it('other', () => expect(1).toBe(1));\n");
    redRow(cwd, {
      attempt: 3,
      tests: [
        {
          task: 2,
          test: "src/other.test.ts",
          testName: "other",
          state: "red",
          blob: blobOf(cwd, "src/other.test.ts"),
        },
      ],
    });
    write(cwd, "src/a.ts", "export const addRow = () => 1;\n");
    expect((await run(cwd, REMEDIATE)).code).toBe(0);
    write(cwd, TEST.file, "it('adds a row', () => expect(true).toBe(true));\n");
    write(
      cwd,
      "logs/remediate-2-log.md",
      fs.readFileSync(path.join(cwd, "logs/remediate-1-log.md"), "utf-8"),
    );
    const r = await run(
      cwd,
      REMEDIATE.map((a) => a.replace("remediate-1-log", "remediate-2-log")),
    );
    expect(r.code).toBe(11);
    expect(r.json.touched).toEqual([TEST.file]);
  });

  it("refuses the holistic gaps fix, which has no group, when it edits any group's planned test, exit 11", async () => {
    const cwd = planned();
    redRow(cwd);
    const holistic = codeStep(
      "build-plan-gaps-remediate-holistic",
      "bkit-build-plan-gaps-remediate",
      "logs/remediate-1-log.md",
    ).filter((a) => a !== "--group=1");
    write(cwd, "src/a.ts", "export const addRow = () => 1;\n");
    expect((await run(cwd, holistic)).code).toBe(0);
    write(cwd, TEST.file, "it('adds a row', () => expect(true).toBe(true));\n");
    write(
      cwd,
      "logs/remediate-2-log.md",
      fs.readFileSync(path.join(cwd, "logs/remediate-1-log.md"), "utf-8"),
    );
    const r = await run(
      cwd,
      holistic.map((a) => a.replace("remediate-1-log", "remediate-2-log")),
    );
    expect(r.code).toBe(EXIT_TESTS_TOUCHED);
    expect(r.json.touched).toEqual([TEST.file]);
    expect(r.json.reask).toMatchObject({ agent: "bkit-build-plan-gaps-remediate" });
  });

  it("refuses a build-plan-tests step whose diff changes a file no TEST FIRST line of the group names, exit 15", async () => {
    const cwd = planned();
    write(cwd, TEST.file, "it('adds a row', () => expect(addRow()).toBe(2));\n");
    write(cwd, "src/b.ts", "export const b = 2;\n");
    const head = git(cwd, "rev-parse", "HEAD");
    const r = await run(cwd, TESTS);
    expect(r.code).toBe(EXIT_SOURCE_TOUCHED);
    expect(r.code).toBe(15);
    expect(r.json.source).toEqual(["src/b.ts"]);
    expect(r.err).toContain("src/b.ts");
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
    expect(fs.existsSync(path.join(cwd, STATUS))).toBe(false);
  });

  it("allows the tests step to add a file no CREATE line of the plan names, and refuses one a CREATE line names", async () => {
    const cwd = planned();
    write(cwd, TEST.file, "it('adds a row', () => expect(addRow()).toBe(2));\n");
    fs.mkdirSync(path.join(cwd, "src/fixtures"));
    write(cwd, "src/fixtures/rows.json", "[]\n");
    expect((await run(cwd, TESTS)).code).toBe(0);
    expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).toContain(
      "src/fixtures/rows.json",
    );

    const created = planned();
    write(created, "src/a.ts", "export const addRow = () => 1;\n");
    const r = await run(created, TESTS);
    expect(r.code).toBe(15);
    expect(r.json.source).toEqual(["src/a.ts"]);
  });

  /** The plan with group 1's task ticked (as Step 8's `tasks tick` leaves it) and a group 2 task after it. */
  const TWO_GROUP_PLAN = [
    PLAN.replace("- [ ] **TASK 1:**", "- [x] **TASK 1:**").trimEnd(),
    "<!-- bkit:group 2 start -->",
    "### GROUP 2: Others",
    "<!-- bkit:task 2 start -->",
    "- [ ] **TASK 2:** Add other",
    "  - **CREATE:** `src/c.ts`: other",
    "  - **DONE WHEN:** passes",
    "  - **TEST FIRST:**",
    "    - `src/c.test.ts` `does other` fails on the stub",
    "<!-- bkit:task 2 end -->",
    "<!-- bkit:group 2 end -->",
    "",
  ].join("\n");
  const inGroup2 = (argv: string[]) => [
    ...argv.map((a) => (a === "--group=1" ? "--group=2" : a)),
    "--plan=plan.md",
  ];

  /** A repo whose group 1 red row stands, whose plan ticks group 1, and whose group 1 planned test is changed. */
  function changedInOtherGroup() {
    const cwd = planned();
    write(cwd, "plan.md", TWO_GROUP_PLAN);
    git(cwd, "commit", "-qam", "plan");
    redRow(cwd);
    write(cwd, TEST.file, "it('adds a row', () => expect(true).toBe(true));\n");
    write(cwd, "src/c.ts", "export const other = 1;\n");
    return cwd;
  }

  it("refuses the execute step when it changes another group's planned test, exit 11", async () => {
    const cwd = changedInOtherGroup();
    const head = git(cwd, "rev-parse", "HEAD");
    const r = await run(cwd, inGroup2(EXECUTE));
    expect(r.code).toBe(11);
    expect(r.json.touched).toEqual([TEST.file]);
    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
  });

  it("refuses the gaps-remediate step when it changes another group's planned test, exit 11", async () => {
    const cwd = changedInOtherGroup();
    const head = git(cwd, "rev-parse", "HEAD");
    const r = await run(cwd, inGroup2(REMEDIATE));
    expect(r.code).toBe(11);
    expect(r.json.touched).toEqual([TEST.file]);
    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
  });

  /**
   * Group 1 (ticked) names `adds a row`; group 2's task names `counts rows` in the same file,
   * plus each of `extra` names. Group 1's red row stands on both tests' first lines.
   */
  function testsStepInGroup2(extra: string[] = []) {
    const { cwd, body } = twoTests();
    fs.rmSync(path.join(cwd, "src/a.ts"));
    write(
      cwd,
      "plan.md",
      TWO_GROUP_PLAN.replace(
        "    - `src/c.test.ts` `does other` fails on the stub",
        [`    - \`${TEST.file}\` \`counts rows\` fails on the stub`, ...extra].join("\n"),
      ),
    );
    write(
      cwd,
      "logs/build-plan-tests-2-log.md",
      "Verdict: PASS\n\n<!-- verdict:end -->\n\n# Tests\n\nWROTE — TASK 2: src/a.test.ts counts rows\n",
    );
    git(cwd, "add", "-A");
    git(cwd, "commit", "-qm", "plan");
    const args = [
      ...TESTS.filter((a) => a !== "--verdict=PASS").map((a) =>
        a === "--group=1" ? "--group=2" : a.replace("plan-tests-1-log", "plan-tests-2-log"),
      ),
      "--agent=bkit-build-plan-tests",
    ];
    return { cwd, body, args };
  }

  it("the tests step's finish refuses an earlier task's changed planned test with exit 11", async () => {
    const { cwd, body, args } = testsStepInGroup2();
    write(cwd, TEST.file, body("2", "1"));
    const head = git(cwd, "rev-parse", "HEAD");
    const r = await run(cwd, args);
    expect(r.code).toBe(EXIT_TESTS_TOUCHED);
    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
    expect(r.json.touched).toEqual([TEST.file]);
    expect(r.json.reask).toEqual({
      agent: "bkit-build-plan-tests",
      artifact: "logs/build-plan-tests-2-log.md",
    });
    expect(r.json.problem).toContain("an earlier task's planned test");
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
  });

  it("the tests step's finish passes its own group's and taken-over tests", async () => {
    const { cwd, body, args } = testsStepInGroup2([
      `    - \`${TEST.file}\` \`${TEST.name}\` fails on the stub`,
    ]);
    write(cwd, TEST.file, body("2", "1"));
    const r = await run(cwd, args);
    expect(r.code, r.err).toBe(0);
  });

  const blockedLine = (kind: "TASK" | "Gap", n: number, name: string, reason: string) =>
    `BLOCKED — ${kind} ${n}: test \`${TEST.file}\` \`${name}\` — ${reason}\n`;
  const appendTo = (cwd: string, rel: string, text: string) =>
    fs.appendFileSync(path.join(cwd, rel), text);
  const stepRows = (cwd: string, step: string) =>
    fs
      .readFileSync(path.join(cwd, STATUS), "utf-8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l) as Record<string, unknown>)
      .filter((r) => r.type === "step-done" && r.step === step);
  /** The log of a later attempt: the first log's text, then `extra`. */
  const copyLog = (cwd: string, from: string, to: string, extra = "") =>
    write(cwd, to, fs.readFileSync(path.join(cwd, from), "utf-8") + extra);
  const later = (argv: string[], from: string, to: string) => argv.map((a) => a.replace(from, to));
  const textOfTest = (cwd: string) => fs.readFileSync(path.join(cwd, TEST.file), "utf-8");

  /** The two-test file with `a` expectation lines added to the planned test and `b` to the other (changes that only add). */
  const grown = (body: (p: string, o: string) => string, a: number, b: number) =>
    body("1", "0")
      .replace(
        "    expect(addRow()).toBe(1);",
        [
          "    expect(addRow()).toBe(1);",
          ...Array.from({ length: a }, (_, i) => `    expect(addRow()).toBeGreaterThan(${i});`),
        ].join("\n"),
      )
      .replace(
        "    expect(count()).toBe(0);",
        [
          "    expect(count()).toBe(0);",
          ...Array.from({ length: b }, (_, i) => `    expect(count()).toBeGreaterThan(${i});`),
        ].join("\n"),
      );

  it("lets a code step through when its log's BLOCKED line names the changed planned test, and records the change on its row", async () => {
    const { cwd, body } = twoTests();
    write(
      cwd,
      TEST.file,
      body("1", "0").replace(
        "  it('adds a row', () => {",
        "  it('adds a row', () => {\n    setup();",
      ),
    );
    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "new setup line"));
    const r = await run(cwd, EXECUTE);
    expect(r.code).toBe(0);
    const [row] = stepRows(cwd, "build-plan-tasks");
    expect(row!.changedTests).toEqual([
      {
        task: 1,
        test: TEST.file,
        testName: TEST.name,
        block: blockHash(textOfTest(cwd), TEST.name),
        reason: "new setup line",
        blob: expect.any(String),
        after: expect.any(String),
      },
    ]);
  });

  it("lets a code step through when its BLOCKED line names the changed test by the last segment of its name", async () => {
    const { cwd, body } = twoTests();
    const status = path.join(cwd, STATUS);
    fs.writeFileSync(
      status,
      fs
        .readFileSync(status, "utf-8")
        .replace(`"testName":"${TEST.name}"`, `"testName":"rows > ${TEST.name}"`),
    );
    write(cwd, TEST.file, grown(body, 1, 0));
    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "needs a 2"));
    const r = await run(cwd, EXECUTE);
    expect(r.code).toBe(0);
    const [row] = stepRows(cwd, "build-plan-tasks");
    expect(row!.changedTests).toEqual([
      expect.objectContaining({ testName: `rows > ${TEST.name}`, reason: "needs a 2" }),
    ]);
  });

  it("lets a gaps-remediate step through when its log's Gap BLOCKED line names the changed planned test", async () => {
    const { cwd, body } = twoTests();
    write(cwd, TEST.file, grown(body, 1, 0));
    appendTo(cwd, "logs/remediate-1-log.md", blockedLine("Gap", 1, TEST.name, "gap fix needs a 2"));
    const r = await run(cwd, REMEDIATE);
    expect(r.code).toBe(0);
    const [row] = stepRows(cwd, "build-plan-gaps-remediate");
    expect(row!.changedTests).toEqual([
      expect.objectContaining({
        test: TEST.file,
        testName: TEST.name,
        reason: "gap fix needs a 2",
      }),
    ]);
  });

  /** twoTests, plus a second planned test ("counts rows") recorded red at its committed lines. */
  function withCountsRow() {
    const fx = twoTests();
    const text = fs.readFileSync(path.join(fx.cwd, TEST.file), "utf-8");
    redRow(fx.cwd, {
      attempt: 2,
      tests: [
        {
          task: 2,
          test: TEST.file,
          testName: "counts rows",
          state: "red",
          blob: blobOf(fx.cwd, TEST.file),
          block: blockHash(text, "counts rows"),
        },
      ],
    });
    return fx;
  }

  it("records only the changed test when a BLOCKED line also names an unchanged one", async () => {
    const { cwd, body } = withCountsRow();
    write(cwd, TEST.file, grown(body, 1, 0));
    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "needs a 2"));
    appendTo(
      cwd,
      "logs/execute-1-log.md",
      blockedLine("TASK", 2, "counts rows", "thought it changed"),
    );
    const r = await run(cwd, EXECUTE);
    expect(r.code).toBe(0);
    const [row] = stepRows(cwd, "build-plan-tasks");
    expect(row!.changedTests).toEqual([expect.objectContaining({ testName: TEST.name })]);
  });

  it("refuses only the changed planned tests no BLOCKED line of the log names", async () => {
    const { cwd, body } = withCountsRow();
    write(cwd, TEST.file, grown(body, 1, 1));
    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 2, "counts rows", "needs a 3"));
    const r = await run(cwd, EXECUTE);
    expect(r.code).toBe(11);
    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
  });

  it("the refusal names the BLOCKED line the engine reads", async () => {
    const { cwd, body } = twoTests();
    write(cwd, TEST.file, grown(body, 1, 1));
    const r = await run(cwd, EXECUTE);
    expect(r.code).toBe(11);
    expect(r.json.problem).toMatch(/BLOCKED — TASK [^:]+: test `src\/a\.test\.ts` `adds a row` — /);
  });

  it("the exit 11 help names the BLOCKED line that lets a change through", () => {
    const codes = stepsCommand.verbs.finish!.exitCodes as Record<number, string>;
    expect(codes[11]).toMatch(/BLOCKED — [^`]*test `/);
  });

  it("passes a later code step that leaves a BLOCKED change as it is", async () => {
    const { cwd, body } = twoTests();
    write(cwd, TEST.file, grown(body, 1, 0));
    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "needs a 2"));
    expect((await run(cwd, EXECUTE)).code).toBe(0);
    expect(stepRows(cwd, "build-plan-tasks")[0]!.changedTests).toHaveLength(1);
    write(cwd, "src/b.ts", "export const b = 2;\n");
    const r = await run(cwd, REMEDIATE);
    expect(r.code).toBe(0);
  });

  it("refuses a later code step that changes a BLOCKED change again", async () => {
    const { cwd, body } = twoTests();
    write(cwd, TEST.file, grown(body, 1, 0));
    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "needs a 2"));
    expect((await run(cwd, EXECUTE)).code).toBe(0);
    expect(stepRows(cwd, "build-plan-tasks")[0]!.changedTests).toEqual([
      expect.objectContaining({ testName: TEST.name }),
    ]);
    write(cwd, TEST.file, grown(body, 2, 0));
    copyLog(cwd, "logs/execute-1-log.md", "logs/execute-2-log.md");
    const r = await run(cwd, later(EXECUTE, "execute-1-log", "execute-2-log"));
    expect(r.code).toBe(11);
    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
  });

  it("records the newer lines when a later code step re-changes a recorded test under a new BLOCKED line", async () => {
    const { cwd, body } = twoTests();
    write(cwd, TEST.file, grown(body, 1, 0));
    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "needs a 2"));
    expect((await run(cwd, EXECUTE)).code).toBe(0);
    write(cwd, TEST.file, grown(body, 2, 0));
    copyLog(
      cwd,
      "logs/execute-1-log.md",
      "logs/execute-2-log.md",
      blockedLine("TASK", 1, TEST.name, "needs a 3 after all"),
    );
    const r = await run(cwd, later(EXECUTE, "execute-1-log", "execute-2-log"));
    expect(r.code).toBe(0);
    const rows = stepRows(cwd, "build-plan-tasks");
    expect(rows.at(-1)!.changedTests).toEqual([
      expect.objectContaining({
        testName: TEST.name,
        block: blockHash(textOfTest(cwd), TEST.name),
        reason: "needs a 3 after all",
      }),
    ]);
  });

  it("uses a red the tests step recorded after a code step's change as the baseline", async () => {
    const { cwd, body } = twoTests();
    write(cwd, TEST.file, grown(body, 1, 0));
    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "needs a 2"));
    expect((await run(cwd, EXECUTE)).code).toBe(0);
    expect(stepRows(cwd, "build-plan-tasks")[0]!.changedTests).toEqual([
      expect.objectContaining({ testName: TEST.name }),
    ]);
    // The tests step proves a newer red at other lines.
    write(cwd, TEST.file, body("5", "0"));
    redRow(cwd, {
      attempt: 3,
      tests: [
        {
          task: 1,
          test: TEST.file,
          testName: TEST.name,
          state: "red",
          blob: blobOf(cwd, TEST.file),
          block: blockHash(textOfTest(cwd), TEST.name),
        },
      ],
    });
    copyLog(cwd, "logs/remediate-1-log.md", "logs/remediate-2-log.md");
    write(cwd, "src/b.ts", "export const b = 3;\n");
    const same = await run(cwd, later(REMEDIATE, "remediate-1-log", "remediate-2-log"));
    expect(same.code).toBe(0);
    write(cwd, TEST.file, body("6", "0"));
    copyLog(cwd, "logs/remediate-1-log.md", "logs/remediate-3-log.md");
    const r = await run(cwd, later(REMEDIATE, "remediate-1-log", "remediate-3-log"));
    expect(r.code).toBe(11);
    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
  });

  /** The planned test's lines with `extra` expectation lines added after its first expect (a change that only adds). */
  const addsLines = (body: string, ...extra: string[]) =>
    body.replace(
      "    expect(addRow()).toBe(1);",
      ["    expect(addRow()).toBe(1);", ...extra.map((e) => `    ${e}`)].join("\n"),
    );

  it("refuses a code step that writes a planned test whose red recorded its file missing, exit 11", async () => {
    const cwd = planned();
    git(cwd, "rm", "-q", TEST.file);
    git(cwd, "commit", "-qm", "the test file is not written yet");
    redRow(cwd, {
      tests: [{ task: 1, test: TEST.file, testName: TEST.name, state: "missing", blob: null }],
    });
    write(cwd, TEST.file, "it('adds a row', () => expect(true).toBe(true));\n");
    write(cwd, "src/a.ts", "export const addRow = () => 1;\n");
    const head = git(cwd, "rev-parse", "HEAD");
    const r = await run(cwd, EXECUTE);
    expect(r.code).toBe(11);
    expect(r.json.touched).toEqual([TEST.file]);
    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
  });

  it("the refusal of a restored BLOCKED change names the recorded change as the lines to put back", async () => {
    const { cwd, body } = twoTests();
    write(cwd, TEST.file, addsLines(body("1", "0"), "expect(addRow()).toBeDefined();"));
    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "needs a check"));
    expect((await run(cwd, EXECUTE)).code).toBe(0);
    expect(stepRows(cwd, "build-plan-tasks")[0]!.changedTests).toHaveLength(1);
    // A later remediate step puts the test back as the tests step wrote it.
    write(cwd, TEST.file, body("1", "0"));
    write(cwd, "src/b.ts", "export const b = 2;\n");
    copyLog(cwd, "logs/remediate-1-log.md", "logs/remediate-2-log.md");
    const r = await run(cwd, later(REMEDIATE, "remediate-1-log", "remediate-2-log"));
    expect(r.code).toBe(11);
    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
    expect(r.json.problem).not.toContain("as the tests step left it");
    expect(r.json.problem).not.toContain("recorded at its red");
    expect(r.json.problem).toMatch(/recorded change|changedTests/);
  });

  it("the refusal of a re-change says the logged reason is already recorded", async () => {
    const { cwd, body } = twoTests();
    write(cwd, TEST.file, addsLines(body("1", "0"), "expect(addRow()).toBeDefined();"));
    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "needs a 2"));
    expect((await run(cwd, EXECUTE)).code).toBe(0);
    write(
      cwd,
      TEST.file,
      addsLines(
        body("1", "0"),
        "expect(addRow()).toBeDefined();",
        "expect(addRow()).not.toBeNull();",
      ),
    );
    copyLog(cwd, "logs/execute-1-log.md", "logs/execute-2-log.md");
    const r = await run(cwd, later(EXECUTE, "execute-1-log", "execute-2-log"));
    expect(r.code).toBe(11);
    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
    expect(r.json.problem).toContain("needs a 2");
    expect(r.json.problem).toMatch(/already recorded/);
    expect(r.json.problem).toMatch(/new reason/);
  });

  it("refuses a code step whose BLOCKED-named change removes a line from a planned test, exit 11", async () => {
    const { cwd, body } = twoTests();
    write(cwd, TEST.file, body("1", "0").replace("    expect(addRow()).toBe(1);\n", ""));
    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "the check is wrong"));
    const head = git(cwd, "rev-parse", "HEAD");
    const r = await run(cwd, EXECUTE);
    expect(r.code).toBe(11);
    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
    expect(r.json.problem).toMatch(/refuses a BLOCKED-named change that removes a line/);
    expect(r.json.problem).toMatch(
      /the engine refuses a BLOCKED-named change that removes a line of a planned test/,
    );
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
  });

  /**
   * twoTests under the two-group plan, TASK 1's box ticked or open, and TASK 2's BLOCKED line
   * removing a line of TASK 1's test. Returns the repo and the finish to run.
   */
  function contradicting(ticked: boolean) {
    const { cwd, body } = twoTests();
    write(
      cwd,
      "plan.md",
      ticked ? TWO_GROUP_PLAN : TWO_GROUP_PLAN.replace("- [x] **TASK 1:**", "- [ ] **TASK 1:**"),
    );
    git(cwd, "commit", "-qam", "plan");
    write(cwd, TEST.file, body("1", "0").replace("    expect(addRow()).toBe(1);\n", ""));
    appendTo(
      cwd,
      "logs/execute-1-log.md",
      blockedLine("TASK", 2, TEST.name, "rows now start at 0"),
    );
    return { cwd, finish: () => run(cwd, [...EXECUTE, "--plan=plan.md"]) };
  }
  const planOf = (cwd: string) => fs.readFileSync(path.join(cwd, "plan.md"), "utf-8");

  it("a code step's finish adds one takeover task and one build-takeover row for a contradicted test, exit 11", async () => {
    const { cwd, finish } = contradicting(true);
    const head = git(cwd, "rev-parse", "HEAD");
    const r = await finish();
    expect(r.code).toBe(11);
    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
    expect(r.json.contradicts).toEqual([
      { test: TEST.file, name: TEST.name, from: 1, task: 2, takeover: 3 },
    ]);
    const plan = planOf(cwd);
    expect(plan).toContain("<!-- bkit:group 3 start -->");
    expect(plan).toContain("- [ ] **TASK 3:** Take over `adds a row` from TASK 1");
    expect(plan).toContain("  - **DEPENDS ON:** 2");
    expect(stepRows(cwd, "build-takeover")).toEqual([
      expect.objectContaining({ task: 3, from: 1, test: TEST.file, name: TEST.name }),
    ]);
    expect(stepRows(cwd, "build-takeover")[0]!.reason).toBe("rows now start at 0");
    expect(stepRows(cwd, "build-plan-tasks")).toEqual([]);
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
  });

  it("the contradiction's problem says the takeover task rewrites the test and no BLOCKED line keeps it", async () => {
    const r = await contradicting(true).finish();
    expect(r.json.problem).toContain("owned by an earlier, ticked task (TASK 1)");
    expect(r.json.problem).toContain("the build added takeover TASK 3");
    expect(r.json.problem).toContain("put it back as the tests step left it");
    expect(r.json.problem).toContain("a BLOCKED line does not keep it");
    expect(r.json.problem).not.toContain("or keep the edit and log");
  });

  it("the same contradicted finish run again adds no second task or row", async () => {
    const { cwd, finish } = contradicting(true);
    expect((await finish()).code).toBe(11);
    const once = planOf(cwd);
    const again = await finish();
    expect(again.code).toBe(11);
    expect(again.json.contradicts).toEqual([
      { test: TEST.file, name: TEST.name, from: 1, task: 2, takeover: 3 },
    ]);
    expect(planOf(cwd)).toBe(once);
    expect(stepRows(cwd, "build-takeover")).toHaveLength(1);
  });

  it("exit 11 names no contradiction and adds no task while the owning task is open", async () => {
    const { cwd, finish } = contradicting(false);
    const before = planOf(cwd);
    const r = await finish();
    expect(r.code).toBe(11);
    expect(r.json.contradicts).toEqual([]);
    expect(planOf(cwd)).toBe(before);
    expect(stepRows(cwd, "build-takeover")).toEqual([]);
  });

  it("a mixed refusal names both tests and words the problem for each kind", async () => {
    const { cwd, body } = twoTests();
    write(cwd, "plan.md", SHARED_FILE_PLAN);
    git(cwd, "commit", "-qam", "plan");
    redRow(cwd, {
      group: 2,
      tests: [
        {
          task: 2,
          test: TEST.file,
          testName: "counts rows",
          state: "red",
          blob: blobOf(cwd, TEST.file),
          block: blockHash(textOfTest(cwd), "counts rows"),
        },
      ],
    });
    write(cwd, TEST.file, body("1", "5").replace("    expect(addRow()).toBe(1);\n", ""));
    appendTo(
      cwd,
      "logs/execute-1-log.md",
      blockedLine("TASK", 2, TEST.name, "rows now start at 0"),
    );
    const r = await run(cwd, [...EXECUTE, "--plan=plan.md"]);
    expect(r.code).toBe(11);
    expect(r.json.tests).toEqual([
      { test: TEST.file, name: TEST.name },
      { test: TEST.file, name: "counts rows" },
    ]);
    expect(r.json.contradicts).toEqual([
      { test: TEST.file, name: TEST.name, from: 1, task: 2, takeover: 3 },
    ]);
    expect(r.json.problem).toContain(
      `\`${TEST.file}\` "${TEST.name}" is owned by an earlier, ticked task`,
    );
    expect(r.json.problem).toContain(
      `\`${TEST.file}\` "counts rows" differs from what the group's tests step recorded at its red`,
    );
    expect(r.json.problem).toContain("or keep the edit and log one line per test");
    expect(r.json.problem).toContain("BLOCKED — TASK {N}: test `src/a.test.ts` `counts rows`");
    expect(r.json.problem).not.toContain("BLOCKED — TASK {N}: test `src/a.test.ts` `adds a row`");
  });

  it("a chain of takeovers gives one contradiction, from the latest owner", async () => {
    const { cwd, body } = twoTests();
    write(
      cwd,
      "plan.md",
      TWO_GROUP_PLAN.replace("- [ ] **TASK 2:**", "- [x] **TASK 2:**").replace(
        "`src/c.test.ts` `does other`",
        `\`${TEST.file}\` \`${TEST.name}\``,
      ),
    );
    git(cwd, "commit", "-qam", "plan");
    redRow(cwd, {
      group: 2,
      tests: [
        {
          task: 2,
          from: 1,
          test: TEST.file,
          testName: TEST.name,
          state: "taken-over",
          blob: blobOf(cwd, TEST.file),
          block: blockHash(textOfTest(cwd), TEST.name),
        },
      ],
    });
    write(cwd, TEST.file, body("1", "0").replace("    expect(addRow()).toBe(1);\n", ""));
    appendTo(cwd, "logs/remediate-1-log.md", blockedLine("Gap", 1, TEST.name, "rows start at 0"));
    const r = await run(cwd, [...REMEDIATE, "--plan=plan.md"]);
    expect(r.code).toBe(11);
    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
    expect(r.json.contradicts).toEqual([
      { test: TEST.file, name: TEST.name, from: 2, task: null, takeover: 3 },
    ]);
    expect(planOf(cwd)).toContain("- [ ] **TASK 3:** Take over `adds a row` from TASK 2");
  });

  it("refuses a code step whose BLOCKED-named change renames a planned test away, exit 11", async () => {
    const { cwd, body } = twoTests();
    write(cwd, TEST.file, body("1", "0").replace(TEST.name, "a renamed test"));
    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "renamed it"));
    const head = git(cwd, "rev-parse", "HEAD");
    const r = await run(cwd, EXECUTE);
    expect(r.code).toBe(11);
    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
    expect(r.json.problem).toMatch(/refuses a BLOCKED-named change that removes a line/);
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
  });

  it("records the baseline blob on a BLOCKED-named change that only adds lines", async () => {
    const { cwd, body } = twoTests();
    write(cwd, TEST.file, addsLines(body("1", "0"), "expect(addRow()).toBeDefined();"));
    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "an added check"));
    const r = await run(cwd, EXECUTE);
    expect(r.code).toBe(0);
    const [row] = stepRows(cwd, "build-plan-tasks");
    const [record] = row!.changedTests as Array<Record<string, unknown>>;
    expect(typeof record!.blob).toBe("string");
    const read = spawnSync("git", ["cat-file", "-p", record!.blob as string], {
      cwd,
      encoding: "utf-8",
    });
    expect(read.status).toBe(0);
    expect(read.stdout).toContain("expect(addRow()).toBe(1);");
  });

  /** A plan whose group 1 and group 2 tasks both name tests in `TEST.file`. */
  const SHARED_FILE_PLAN = TWO_GROUP_PLAN.replace(
    "`src/c.test.ts` `does other`",
    `\`${TEST.file}\` \`counts rows\``,
  );
  const PARAM_V1 = "it.each([1])('row %i', (n) => {\n  expect(addRow()).toBe(n);\n});\n";
  const PARAM_V2 = `${PARAM_V1}\nit('counts rows', () => {\n  expect(count()).toBe(0);\n});\n`;

  /** Group 1's test is parameterised (its name is in no line, so no block), and group 2's red row appended a test to the file. */
  function laterTestsStepAppended() {
    const cwd = planned();
    write(cwd, "plan.md", SHARED_FILE_PLAN);
    write(cwd, TEST.file, PARAM_V1);
    git(cwd, "add", "-A");
    git(cwd, "commit", "-qm", "group 1 tests");
    redRow(cwd, {
      tests: [
        {
          task: 1,
          test: TEST.file,
          testName: TEST.name,
          state: "red",
          blob: blobOf(cwd, TEST.file),
          block: null,
        },
      ],
    });
    write(cwd, TEST.file, PARAM_V2);
    git(cwd, "commit", "-qam", "group 2 tests");
    redRow(cwd, {
      group: 2,
      attempt: 1,
      tests: [
        {
          task: 2,
          test: TEST.file,
          testName: "counts rows",
          state: "red",
          blob: blobOf(cwd, TEST.file),
          block: blockHash(PARAM_V2, "counts rows"),
        },
      ],
    });
    write(cwd, "src/c.ts", "export const other = 1;\n");
    return cwd;
  }

  it("passes a group 2 code step when a later tests step added a test to a file whose group 1 planned test has no recorded block", async () => {
    const cwd = laterTestsStepAppended();
    const r = await run(cwd, inGroup2(EXECUTE));
    expect(r.code).toBe(0);
    expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).toContain("src/c.ts");
  });

  it("still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11", async () => {
    const cwd = laterTestsStepAppended();
    write(cwd, TEST.file, PARAM_V2.replace("toBe(n)", "toBeDefined()"));
    const head = git(cwd, "rev-parse", "HEAD");
    const r = await run(cwd, inGroup2(EXECUTE));
    expect(r.code).toBe(11);
    expect(r.json.touched).toEqual([TEST.file]);
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
  });

  /** A shared-file plan repo and group 2's tests-step finish, run after group 2's tests step wrote `after`. */
  function group2TestsStep(after: string) {
    const cwd = planned();
    write(cwd, "plan.md", SHARED_FILE_PLAN);
    write(
      cwd,
      "logs/build-plan-tests-2-log.md",
      "Verdict: PASS\n\n<!-- verdict:end -->\n\n# Tests\n\nWROTE — TASK 2: src/a.test.ts counts rows\n",
    );
    const finish = () => {
      write(cwd, TEST.file, after);
      return run(cwd, [
        ...TESTS.filter((a) => a !== "--verdict=PASS").map((a) =>
          a === "--group=1" ? "--group=2" : a.replace("plan-tests-1-log", "plan-tests-2-log"),
        ),
        "--agent=bkit-build-plan-tests",
      ]);
    };
    return { cwd, finish };
  }

  it("passes group 2's tests step that appends its test to a file whose group 1 test has no recorded block, before group 2's red", async () => {
    const { cwd, finish } = group2TestsStep(PARAM_V2);
    write(cwd, TEST.file, PARAM_V1);
    git(cwd, "add", "-A");
    git(cwd, "commit", "-qm", "group 1 tests");
    redRow(cwd, {
      tests: [
        {
          task: 1,
          test: TEST.file,
          testName: TEST.name,
          state: "red",
          blob: blobOf(cwd, TEST.file),
          block: null,
        },
      ],
    });
    const r = await finish();
    expect(r.code, r.err).toBe(0);
    expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).toContain(TEST.file);
  });

  it("passes group 2's tests step that creates the file a group 1 test was recorded missing in", async () => {
    const { cwd, finish } = group2TestsStep(
      "it('counts rows', () => {\n  expect(count()).toBe(0);\n});\n",
    );
    fs.rmSync(path.join(cwd, TEST.file));
    git(cwd, "add", "-A");
    git(cwd, "commit", "-qm", "no tests yet");
    redRow(cwd, {
      tests: [
        {
          task: 1,
          test: TEST.file,
          testName: TEST.name,
          state: "missing",
          blob: null,
          block: null,
        },
      ],
    });
    const r = await finish();
    expect(r.code, r.err).toBe(0);
  });

  it("a changedTests record on a non-code-step row does not move the lock's baseline", async () => {
    const { cwd, body } = twoTests();
    const weakened = body("1", "0").replace("    expect(addRow()).toBe(1);\n", "");
    fs.appendFileSync(
      path.join(cwd, STATUS),
      `${JSON.stringify({
        type: "step-done",
        workflow: "build",
        step: "build-plan-verify",
        status: "DONE",
        at: "2026-11-01T06:00:00Z",
        parentSha: git(cwd, "rev-parse", "HEAD"),
        group: 1,
        attempt: 1,
        artifacts: ["logs/verify-1.md"],
        changedTests: [
          { task: 1, test: TEST.file, testName: TEST.name, block: blockHash(weakened, TEST.name) },
        ],
      })}\n`,
    );
    write(cwd, TEST.file, weakened);
    const r = await run(cwd, EXECUTE);
    expect(r.code).toBe(11);
    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
  });

  it("refuses a --field changedTests on a step finish", async () => {
    const cwd = planned();
    redRow(cwd);
    write(cwd, "src/a.ts", "export const addRow = () => 1;\n");
    const r = await run(cwd, [
      ...EXECUTE,
      `--field=changedTests=[{"task":1,"test":"${TEST.file}","testName":"${TEST.name}","reason":"x"}]`,
    ]);
    expect(r.code).toBe(2);
    expect(r.err).toContain("changedTests");
    expect(stepRows(cwd, "build-plan-tasks")).toEqual([]);
  });

  it("the exit 11 refusal says verify reads a BLOCKED change's added lines", async () => {
    const { cwd, body } = twoTests();
    write(cwd, TEST.file, body("1", "0").replace("    expect(addRow()).toBe(1);\n", ""));
    appendTo(cwd, "logs/execute-1-log.md", blockedLine("TASK", 1, TEST.name, "the check is wrong"));
    const r = await run(cwd, EXECUTE);
    expect(r.code).toBe(11);
    expect(r.json.problem).toMatch(/verify reads[^.]*added lines?/);
    expect(r.json.problem).not.toMatch(/cannot remove or loosen/);
  });

  it("exit codes list 11 as planned tests touched and 15 as source touched in the tests step", () => {
    const codes = stepsCommand.verbs.finish!.exitCodes as Record<number, string>;
    expect(codes[11]).toMatch(/planned test/);
    expect(codes[11]).not.toMatch(/red/);
    expect(codes[15]).toMatch(/tests step/);
    expect(codes[15]).toMatch(/TEST FIRST/);
  });
});

describe("bkit steps finish — the attempt matches the saved artifacts", () => {
  const GATE = [
    "steps",
    "finish",
    "--file=logs/status.jsonl",
    "--workflow=build",
    "--step=build-group-gate",
    "--verdict=PASS",
    "--scope=unit",
    "--group=3",
    "--artifact=logs/gate-3-<attempt>.md",
    "--message=chore(1-x): group-gate group 3 attempt <attempt>",
  ];
  const gate = (cwd: string, attempt: number) =>
    write(cwd, `logs/gate-3-${attempt}.md`, `Verdict: PASS\n\n<!-- verdict:end -->\n`);

  it("refuses (exit 12) an attempt below the highest saved artifact, writing nothing", async () => {
    const cwd = repo();
    for (const n of [2, 3, 6]) gate(cwd, n);
    const head = git(cwd, "rev-parse", "HEAD");
    const r = await run(cwd, [...GATE, "--attempt=2"]);
    expect(r.code).toBe(12);
    expect(r.json.later).toEqual(["logs/gate-3-3.md", "logs/gate-3-6.md"]);
    expect(r.err).toContain("logs/gate-3-6.md");
    expect(fs.existsSync(path.join(cwd, "logs/status.jsonl"))).toBe(false);
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
  });

  it("passes the highest saved attempt, and ignores another group's artifacts", async () => {
    const cwd = repo();
    for (const n of [1, 2]) gate(cwd, n);
    write(cwd, "logs/gate-13-5.md", "Verdict: PASS\n\n<!-- verdict:end -->\n");
    expect((await run(cwd, [...GATE, "--attempt=2"])).code).toBe(0);
  });

  it("does not count an artifact the run found committed when it started", async () => {
    const cwd = repo();
    gate(cwd, 4);
    git(cwd, "add", "-A");
    git(cwd, "commit", "-q", "-m", "an earlier run");
    write(
      cwd,
      "logs/status.jsonl",
      `${JSON.stringify({
        type: "workflow-started",
        workflow: "build",
        at: "2026-01-01T00:00:00Z",
        parentSha: git(cwd, "rev-parse", "HEAD"),
      })}\n`,
    );
    gate(cwd, 1);
    expect((await run(cwd, [...GATE, "--attempt=1"])).code).toBe(0);
  });
});

describe("bkit steps finish — a step commit never changes bkit.workflows", () => {
  const pkg = (workflows: Record<string, unknown>, extra: Record<string, unknown> = {}) =>
    `${JSON.stringify({ name: "x", ...extra, bkit: { workflows } }, null, 2)}\n`;
  const FINISH_SYNC = [
    "steps",
    "finish",
    "--file=logs/status.jsonl",
    "--workflow=build",
    "--step=build-branch-sync",
    "--artifact=logs/verify-1.md",
    "--message=m",
  ];

  /** A repo whose committed package.json sets build.verify.maxAttempts to 2. */
  function configured() {
    const cwd = repo();
    write(cwd, "package.json", pkg({ build: { verify: { ask: true, maxAttempts: 2 } } }));
    git(cwd, "add", "package.json");
    git(cwd, "commit", "-q", "-m", "config");
    return cwd;
  }

  it("refuses (exit 13) a commit that would change a bkit.workflows key, naming it", async () => {
    const cwd = configured();
    write(
      cwd,
      "package.json",
      pkg({ build: { verify: { ask: true, maxAttempts: 5 } }, tasks: { maxPerGroup: 4 } }),
    );
    const head = git(cwd, "rev-parse", "HEAD");
    const r = await run(cwd, FINISH_SYNC);
    expect(r.code).toBe(13);
    expect(r.json.changed).toEqual(["build.verify.maxAttempts", "tasks"]);
    expect(r.err).toContain("build.verify.maxAttempts");
    expect(fs.existsSync(path.join(cwd, "logs/status.jsonl"))).toBe(false);
    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
  });

  it("commits a package.json change outside bkit.workflows", async () => {
    const cwd = configured();
    write(
      cwd,
      "package.json",
      pkg({ build: { verify: { ask: true, maxAttempts: 2 } } }, { scripts: { t: "x" } }),
    );
    expect((await run(cwd, FINISH_SYNC)).code).toBe(0);
    expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).toContain("package.json");
  });

  it("in a shared checkout, a bkit.workflows edit dirty before the run is not the step's", async () => {
    const cwd = configured();
    git(cwd, "checkout", "-q", "-b", "dev");
    write(cwd, "package.json", pkg({ build: { verify: { ask: true, maxAttempts: 5 } } }));
    writeRecord(cwd, newRecord(cwd, "1-x", "dev"));
    const status = "docs/plans/202611/logs/1-x/status.jsonl";
    fs.mkdirSync(path.join(cwd, path.dirname(status)), { recursive: true });
    write(cwd, "docs/plans/202611/logs/1-x/verify-1.md", "Verdict: PASS\n");
    const r = await run(cwd, [
      "steps",
      "finish",
      `--file=${status}`,
      "--workflow=build",
      "--step=build-branch-sync",
      "--artifact=docs/plans/202611/logs/1-x/verify-1.md",
      "--message=m",
    ]);
    expect(r.code).toBe(0);
    expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).not.toContain("package.json");
    expect(
      JSON.parse(git(cwd, "show", "HEAD:package.json")).bkit.workflows.build.verify,
    ).toMatchObject({ maxAttempts: 2 });
    expect(
      JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf-8")).bkit.workflows,
    ).toMatchObject({ build: { verify: { maxAttempts: 5 } } });
  });
});

describe("promptHeader", () => {
  it("reads the Failures count rule of bkit-plan-review-1", () => {
    const failures = promptHeader("bkit-plan-review-1").fields.find((f) => f.name === "Failures");
    expect(failures).toMatchObject({ name: "Failures", integer: true });
    expect(JSON.stringify(failures)).toContain("## CRITICAL");
  });
});

describe("headerDeclaration", () => {
  it("refuses an unknown count declaration", () => {
    expect(() => headerDeclaration("Failures: <count of widgets under ## Widgets>")).toThrow(
      "unknown count declaration",
    );
  });
});

describe("bkit steps finish", () => {
  const FINISH = ["steps", "finish", "--file=logs/status.jsonl", "--workflow=build"];
  const REVIEW = [
    "steps",
    "finish",
    "--file=logs/status.jsonl",
    "--workflow=plan",
    "--step=plan-review",
    "--attempt=1",
    "--agent=bkit-plan-review-1",
    "--artifact=logs/review.md",
    "--commit=none",
  ];
  const block = (n: number, severity: string, extra = "") =>
    [
      `<!-- bkit:task ${n} start -->`,
      `- [ ] **TASK ${n}:** Finding ${n}.`,
      `  **Severity:** ${severity} · **Fixable:** true · **Location:** \`a.ts:${n}\``,
      `  - **DONE WHEN:** Finding ${n} is fixed.`,
      "  - **TEST FIRST:**",
      `    - \`a.test.ts\` \`finding ${n}\` fails on null`,
      extra,
      `<!-- bkit:task ${n} end -->`,
    ].filter((l) => l !== "");
  const challenge = (verdict: string, failures: number, blocks: string[][]) =>
    [
      `Verdict: ${verdict}`,
      `Failures: ${failures}`,
      "<!-- verdict:end -->",
      "## Findings Log",
      ...(blocks.length ? blocks.flat() : ["None"]),
      "",
    ].join("\n");
  const CHALLENGE = (extra: string[] = []) => [
    ...FINISH,
    "--step=build-challenge",
    "--attempt=1",
    "--agent=bkit-build-challenge-1",
    "--artifact=logs/c1.md",
    "--commit=none",
    ...extra,
  ];
  const VERIFY = [
    ...FINISH,
    "--step=build-plan-verify",
    "--attempt=1",
    "--agent=bkit-build-plan-verify",
    "--artifact=logs/verify-1.md",
    "--commit=none",
  ];
  const verifyReport = (fixable: string, failures: number, gaps: string[]) =>
    [
      "Verdict: FAIL",
      `Failures: ${failures}`,
      `Fixable: ${fixable}`,
      "Tasks: none",
      "Loosened: none",
      "<!-- verdict:end -->",
      "## Identified Gaps Log",
      ...gaps,
      "",
    ].join("\n");

  it("checks Failures against the ## CRITICAL items and ignores OPTIONAL ones", async () => {
    const cwd = repo();
    write(
      cwd,
      "logs/review.md",
      "Verdict: PASS\nFailures: 0\nRedesign: false\n<!-- verdict:end -->\n## CRITICAL\nNone\n## OPTIONAL\n- A nicety.\n- Another nicety.\n",
    );
    const ok = await run(cwd, REVIEW);
    expect(ok.code).toBe(0);
    write(
      cwd,
      "logs/review.md",
      "Verdict: PASS\nFailures: 0\nRedesign: false\n<!-- verdict:end -->\n## CRITICAL\n- A real problem.\n## OPTIONAL\n- A nicety.\n",
    );
    const bad = await run(cwd, REVIEW);
    expect(bad.code).toBe(6);
    expect(bad.json.problem).toContain("counted 1");
    expect(bad.json.reask).toMatchObject({ agent: "bkit-plan-review-1" });
  });

  it("reads None under ## CRITICAL as zero items", async () => {
    const cwd = repo();
    write(
      cwd,
      "logs/review.md",
      "Verdict: PASS\nFailures: 0\nRedesign: false\n<!-- verdict:end -->\n## CRITICAL\n\nNone\n",
    );
    const r = await run(cwd, REVIEW);
    expect(r.code).toBe(0);
    expect(r.json.problem).toBeUndefined();
  });

  it("refuses a verify Fixable that disagrees with its gap lines", async () => {
    const cwd = repo();
    write(cwd, "logs/verify-1.md", verifyReport("false", 1, ["- Gap at `a.ts:1` — Fixable: true"]));
    const r = await run(cwd, VERIFY);
    expect(r.code).toBe(6);
    expect(r.json.problem).toContain("Fixable is false");
  });

  it("counts only the Fixable gap lines under a verify gap-count line", async () => {
    const cwd = repo();
    write(
      cwd,
      "logs/verify-1.md",
      verifyReport("true", 2, [
        "Gaps found: 2",
        "- Gap one at `a.ts:1` — Fixable: true",
        "- Gap two at `b.ts:2` — Fixable: true",
      ]),
    );
    const r = await run(cwd, VERIFY);
    expect(r.code).toBe(0);
    expect(r.json.failures).toBe(2);
  });

  it("does not count a Fixable line inside a code fence under the verify gaps log", async () => {
    const cwd = repo();
    write(
      cwd,
      "logs/verify-1.md",
      verifyReport("false", 1, [
        "- Gap at `a.ts:1` — Fixable: false",
        "```text",
        "quoted log: Gap at b.ts:2 — Fixable: true",
        "```",
      ]),
    );
    const r = await run(cwd, VERIFY);
    expect(r.code).toBe(0);
    expect(r.json.problem).toBeUndefined();
    expect(r.json.failures).toBe(1);
  });

  it("refuses a challenge PASS with a HIGH task block", async () => {
    const cwd = repo();
    write(cwd, "logs/c1.md", challenge("PASS", 0, [block(1, "HIGH")]));
    const r = await run(cwd, CHALLENGE());
    expect(r.code).toBe(6);
    expect(r.json.problem).toContain("PASS needs no findings");
  });

  it("refuses a challenge CONCERNS with a CRITICAL task block", async () => {
    const cwd = repo();
    write(cwd, "logs/c1.md", challenge("CONCERNS", 1, [block(1, "CRITICAL")]));
    const r = await run(cwd, CHALLENGE());
    expect(r.code).toBe(6);
    expect(r.json.problem).toContain("CONCERNS allows HIGH or lower");
  });

  it("hands back a challenge task block it cannot read", async () => {
    const cwd = repo();
    write(
      cwd,
      "logs/c1.md",
      challenge("FAIL", 1, [
        [
          "<!-- bkit:task 1 start -->",
          "- [ ] **TASK 1:** Half a block.",
          "<!-- bkit:task 1 end -->",
        ],
      ]),
    );
    const r = await run(cwd, CHALLENGE());
    expect(r.code).toBe(6);
    expect(r.json.problem).toContain("incomplete task block");
    expect(r.json.reask).toMatchObject({ agent: "bkit-build-challenge-1" });
  });

  it("refuses a report the old render wrote whose Failures counted an OPTIONAL item", async () => {
    const cwd = repo();
    write(
      cwd,
      "logs/review.md",
      "Verdict: FAIL\nFailures: 1\nRedesign: false\n<!-- verdict:end -->\n## CRITICAL\nNone\n## OPTIONAL\n- A nicety.\n",
    );
    const r = await run(cwd, REVIEW);
    expect(r.code).toBe(6);
    expect(r.json.problem).toContain("counted 0");
  });

  it("checks each agent's count in a two-agent finish", async () => {
    const cwd = repo();
    write(cwd, "logs/c1.md", challenge("FAIL", 2, [block(1, "CRITICAL")]));
    write(cwd, "logs/c2.md", challenge("FAIL", 1, [block(1, "CRITICAL"), block(2, "CRITICAL")]));
    const r = await run(cwd, [
      ...FINISH,
      "--step=build-challenge",
      "--attempt=1",
      "--agent=bkit-build-challenge-1",
      "--agent=bkit-build-challenge-2",
      "--artifact=logs/c1.md",
      "--artifact=logs/c2.md",
      "--commit=none",
    ]);
    expect(r.code).toBe(6);
    expect(r.json.problem).toContain("bkit-build-challenge-1");
  });

  it("does not count a fenced line under ## CRITICAL as an item", async () => {
    const cwd = repo();
    write(
      cwd,
      "logs/review.md",
      [
        "Verdict: FAIL",
        "Failures: 1",
        "Redesign: false",
        "<!-- verdict:end -->",
        "## CRITICAL",
        "- The plan quotes a task block it never defines.",
        "",
        "```markdown",
        "- [ ] **TASK 3:** quoted from the plan",
        "```",
        "## OPTIONAL",
        "None",
        "",
      ].join("\n"),
    );
    const r = await run(cwd, REVIEW);
    expect(r.code).toBe(0);
    expect(r.json.problem).toBeUndefined();
  });

  it("a fenced ## line under ## CRITICAL does not end the section", async () => {
    const cwd = repo();
    write(
      cwd,
      "logs/review.md",
      [
        "Verdict: FAIL",
        "Failures: 2",
        "Redesign: false",
        "<!-- verdict:end -->",
        "## CRITICAL",
        "- The first problem.",
        "",
        "```markdown",
        "## Example heading quoted from the plan",
        "```",
        "",
        "- The second problem.",
        "## OPTIONAL",
        "None",
        "",
      ].join("\n"),
    );
    const r = await run(cwd, REVIEW);
    expect(r.code).toBe(0);
    expect(r.json.problem).toBeUndefined();
  });
});
