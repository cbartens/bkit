// planned-test-lock.integration.test.ts — the planned-test lock over a real temp git repo: `bkit`
// is spawned through `requireTsx()` and runs `steps finish` and `tests green` end to end.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { useGateRunner } from "../../../../../vitest.gate-fixture";
import { tierTimeouts } from "../../../../../vitest.timeout-budget";
import { requireTsx } from "../../../../../vitest.tsx-bin";

const BUDGET = tierTimeouts(true);
const CLI = path.resolve(".bkit/core/engine/cli.ts");
const STATUS = "logs/status.jsonl";
const FIRST = { file: "src/a.test.ts", name: "adds a row" };
const SECOND = { file: "src/c.test.ts", name: "does other" };

useGateRunner();

let cwd: string;
let env: NodeJS.ProcessEnv;

const git = (...args: string[]) => {
  const res = spawnSync("git", args, { cwd, env, encoding: "utf-8" });
  expect(res.status, res.stderr).toBe(0);
  return res.stdout.trim();
};
const write = (rel: string, body: string) => {
  fs.mkdirSync(path.dirname(path.join(cwd, rel)), { recursive: true });
  fs.writeFileSync(path.join(cwd, rel), body);
};
const bkit = (...args: string[]) => {
  const res = spawnSync(requireTsx(), [CLI, ...args, "--json"], {
    cwd,
    env,
    encoding: "utf-8",
    timeout: BUDGET.testTimeout,
  });
  return {
    status: res.status,
    stdout: res.stdout,
    stderr: res.stderr,
    json: res.stdout.trim() ? (JSON.parse(res.stdout) as Record<string, any>) : {},
  };
};

/** Group 1's task is ticked, as Step 8's `tasks tick` leaves it; group 2's is open. */
const PLAN = [
  "# Plan",
  "",
  "<!-- bkit:group 1 start -->",
  "### TASK GROUP 1: Rows",
  "<!-- bkit:task 1 start -->",
  "- [x] **TASK 1:** Add a row",
  "  - **CREATE:** `src/a.ts`: the row",
  "  - **DONE WHEN:** passes",
  "  - **TEST FIRST:**",
  `    - \`${FIRST.file}\` \`${FIRST.name}\` fails on the stub`,
  "<!-- bkit:task 1 end -->",
  "<!-- bkit:group 1 end -->",
  "<!-- bkit:group 2 start -->",
  "### TASK GROUP 2: Others",
  "<!-- bkit:task 2 start -->",
  "- [ ] **TASK 2:** Add other",
  "  - **CREATE:** `src/c.ts`: other",
  "  - **DONE WHEN:** passes",
  "  - **TEST FIRST:**",
  `    - \`${SECOND.file}\` \`${SECOND.name}\` fails on the stub`,
  "<!-- bkit:task 2 end -->",
  "<!-- bkit:group 2 end -->",
  "",
].join("\n");

const FIRST_BODY = [
  "describe('rows', () => {",
  `  it('${FIRST.name}', () => {`,
  "    expect(addRow()).toBe(1);",
  "  });",
  "});",
  "",
].join("\n");

beforeEach(() => {
  cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-planned-lock-")));
  env = {
    ...process.env,
    BKIT_ENGINE_JOURNAL: "off",
    GIT_AUTHOR_NAME: "t",
    GIT_AUTHOR_EMAIL: "t@t",
    GIT_COMMITTER_NAME: "t",
    GIT_COMMITTER_EMAIL: "t@t",
  };
  for (const key of Object.keys(env))
    if (key.startsWith("BKIT_TEST_") || key === "CI") delete env[key];
  git("init", "-q", "-b", "feat/1-x");
  git("config", "commit.gpgsign", "false");
  write(
    "package.json",
    JSON.stringify({ private: true, scripts: { "bkit:test:file": 'node runner.mjs "$@"' } }),
  );
  write(
    "runner.mjs",
    [
      'import fs from "node:fs";',
      "const nameOf = (f) => /it\\('([^']+)'/.exec(fs.readFileSync(f, 'utf8'))[1];",
      'const cases = process.argv.slice(2).map((f) => `<testcase name="${nameOf(f)}" file="${f}"/>`);',
      'fs.writeFileSync(process.env.BKIT_TEST_REPORT, "<testsuite>" + cases.join("") + "</testsuite>");',
      "",
    ].join("\n"),
  );
  write("plan.md", PLAN);
  write(FIRST.file, FIRST_BODY);
  write(SECOND.file, "it('does other', () => expect(other()).toBe(1));\n");
  write("src/b.ts", "export const b = 1;\n");
  write("logs/.keep", "");
  git("add", "-A");
  git("commit", "-q", "-m", "tests");
});

afterEach(() => {
  fs.rmSync(cwd, { recursive: true, force: true });
});

const redRows = () => {
  const blob = (file: string) => git("hash-object", "-w", file);
  const row = (group: number, task: number, t: { file: string; name: string }) =>
    JSON.stringify({
      type: "step-done",
      workflow: "build",
      step: "build-tests-red",
      status: "DONE",
      at: "2026-11-01T05:00:00Z",
      parentSha: git("rev-parse", "HEAD"),
      group,
      attempt: 1,
      enforced: true,
      artifacts: [`logs/build-tests-red-${group}-1.md`],
      tests: [{ task, test: t.file, testName: t.name, state: "red", blob: blob(t.file) }],
    });
  write(STATUS, `${row(1, 1, FIRST)}\n${row(2, 2, SECOND)}\n`);
  git("add", "-A");
  git("commit", "-q", "-m", "red rows");
};

const finishArgs = (step: string, agent: string, log: string, group?: number) => [
  "steps",
  "finish",
  `--file=${STATUS}`,
  "--workflow=build",
  `--step=${step}`,
  ...(group === undefined ? [] : [`--group=${group}`]),
  `--attempt-of=${step}:next`,
  `--agent=${agent}`,
  `--artifact=${log}`,
  "--plan=plan.md",
  `--message=chore(1-x): ${step}`,
];

describe("the planned-test lock across groups", () => {
  it("a cross-group change logged BLOCKED passes its own step and every later one, and green lists it as changed", () => {
    redRows();
    // Group 2's code step edits group 1's planned test (new setup line) and logs it BLOCKED.
    write(FIRST.file, FIRST_BODY.replace("    expect(", "    setup();\n    expect("));
    write("src/c.ts", "export const other = () => 1;\n");
    write(
      "logs/execute-2-log.md",
      [
        "Verdict: PASS",
        "",
        "<!-- verdict:end -->",
        "",
        "# Build Plan",
        "",
        `BLOCKED — TASK 2: test \`${FIRST.file}\` \`${FIRST.name}\` — the new src/c.ts needs setup()`,
        "DONE — TASK 2: added other",
        "",
      ].join("\n"),
    );
    const own = bkit(
      ...finishArgs("build-plan-tasks", "bkit-build-plan-tasks", "logs/execute-2-log.md", 2),
    );
    expect(own.status, own.stderr).toBe(0);
    const rows = fs
      .readFileSync(path.join(cwd, STATUS), "utf-8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l) as Record<string, any>);
    expect(rows.find((r) => r.step === "build-plan-tasks")?.changedTests).toEqual([
      expect.objectContaining({
        task: 1,
        test: FIRST.file,
        testName: FIRST.name,
        reason: "the new src/c.ts needs setup()",
      }),
    ]);

    // The holistic fix spans every group and never touched the file: it passes.
    write("src/b.ts", "export const b = 2;\n");
    write(
      "logs/remediate-1-log.md",
      "Verdict: PASS\nStrategy: STANDARD\nFixed: 1\n\n<!-- verdict:end -->\n\n# Plan Gaps\n",
    );
    const holistic = bkit(
      ...finishArgs(
        "build-plan-gaps-remediate-holistic",
        "bkit-build-plan-gaps-remediate",
        "logs/remediate-1-log.md",
      ),
    );
    expect(holistic.status, holistic.stderr).toBe(0);

    const green = bkit(
      "tests",
      "green",
      `--file=${STATUS}`,
      "--workflow=build",
      "--group=2",
      "--plan=plan.md",
      "--log=logs/green.md",
    );
    expect(green.json.gaps).toEqual([]);
    expect(green.json.changed).toEqual([
      expect.objectContaining({
        task: 1,
        test: FIRST.file,
        name: FIRST.name,
        reason: "the new src/c.ts needs setup()",
        additive: true,
      }),
    ]);
    expect(fs.readFileSync(path.join(cwd, "logs/green.md"), "utf-8")).toContain(
      "## Changed by a code step",
    );
  });
});
