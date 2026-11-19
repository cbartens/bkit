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

describe("a planned test whose name holds backticks", () => {
  const NAME =
    "ASK on `git reset HEAD~1 --soft` (a soft reset moves another agent's work) — all five hosts";
  const STASH = "ASK on `git stash list` (every stash form asks) — all five hosts";
  const FILE = "src/h.test.ts";
  /** The test file: one double-quoted test per name, each asserting its own index, then `other row`. */
  const bodyOf = (names: string[]) =>
    [
      'describe("hosts", () => {',
      ...names.flatMap((n, i) => [
        `  it("${n}", () => {`,
        `    expect(ask(${i})).toBe(true);`,
        "  });",
        "",
      ]),
      '  it("other row", () => {',
      "    expect(1).toBe(1);",
      "  });",
      "});",
      "",
    ].join("\n");

  /**
   * A one-task plan naming each of `names` in `src/h.test.ts` with escaped backticks, its
   * tests step committed, and `bkit tests red` run and committed. Returns the red row.
   */
  const redFor = (names: string[]) => {
    write(
      "plan.md",
      [
        "# Plan",
        "",
        "<!-- bkit:group 1 start -->",
        "### TASK GROUP 1: Hosts",
        "<!-- bkit:task 1 start -->",
        "- [ ] **TASK 1:** Ask on a soft reset",
        "  - **CREATE:** `src/h.ts`: the ask",
        "  - **DONE WHEN:** passes",
        "  - **TEST FIRST:**",
        ...names.map(
          (n) =>
            `    - \`${FILE}\` \`${n.replace(/`/g, "\\`")}\` fails on the git call being allowed`,
        ),
        "<!-- bkit:task 1 end -->",
        "<!-- bkit:group 1 end -->",
        "",
      ].join("\n"),
    );
    // Every double-quoted `it(...)` of the file runs and fails, as a red run before the code.
    write(
      "runner.mjs",
      [
        'import fs from "node:fs";',
        "const cases = process.argv.slice(2).flatMap((f) =>",
        '  [...fs.readFileSync(f, "utf8").matchAll(/it\\("([^"]+)"/g)].map(',
        '    (m) => `<testcase name="${m[1]}" file="${f}"><failure message="not yet"/></testcase>`,',
        "  ),",
        ");",
        'fs.writeFileSync(process.env.BKIT_TEST_REPORT, "<testsuite>" + cases.join("") + "</testsuite>");',
        "",
      ].join("\n"),
    );
    write(FILE, bodyOf(names));
    git("add", "-A");
    git("commit", "-q", "-m", "plan and runner");
    const red = bkit(
      "tests",
      "red",
      `--file=${STATUS}`,
      "--workflow=build",
      "--group=1",
      "--plan=plan.md",
      "--log=logs/build-tests-red-1-1.md",
    );
    expect(red.status, red.stdout + red.stderr).toBe(0);
    git("add", "-A");
    git("commit", "-q", "-m", "group 1 tests");
    return fs
      .readFileSync(path.join(cwd, STATUS), "utf-8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l) as Record<string, any>)
      .find((r) => r.step === "build-tests-red")!;
  };

  /** The code step writes `body` into the test file and its code, logs DONE, and finishes. */
  const codeStep = (body: string) => {
    write(FILE, body);
    write("src/h.ts", "export const ask = () => true;\n");
    write(
      "logs/execute-1-log.md",
      "Verdict: PASS\n\n<!-- verdict:end -->\n\n# Build Plan\n\nDONE — TASK 1: asks on a soft reset\n",
    );
    return bkit(
      ...finishArgs("build-plan-tasks", "bkit-build-plan-tasks", "logs/execute-1-log.md", 1),
    );
  };

  it("tests red records it under its full name with a block, and an edit to another test of its file finishes the code step", () => {
    const redRow = redFor([NAME]);
    expect(redRow.tests).toEqual([
      expect.objectContaining({
        task: 1,
        test: FILE,
        testName: NAME,
        state: "red",
        block: expect.any(String),
      }),
    ]);
    // The code step edits only the other test of the file: the planned test's own lines stay.
    const code = codeStep(
      bodyOf([NAME]).replace("expect(1).toBe(1)", "expect(1).toBe(1);\n    expect(2).toBe(2)"),
    );
    expect(code.status, code.stdout + code.stderr).toBe(0);
  });

  it("an edit inside the planned test is refused with exit 11 naming that test", () => {
    redFor([NAME]);
    const code = codeStep(bodyOf([NAME]).replace("toBe(true)", "toBe(false)"));
    expect(code.status, code.stdout + code.stderr).toBe(11);
    expect(code.json.tests).toEqual([expect.objectContaining({ test: FILE, name: NAME })]);
  });

  it("of two names sharing the text before their first backtick, an edit inside one names only that one", () => {
    redFor([NAME, STASH]);
    const code = codeStep(
      bodyOf([NAME, STASH]).replace("ask(1)).toBe(true)", "ask(1)).toBe(false)"),
    );
    expect(code.status, code.stdout + code.stderr).toBe(11);
    expect(code.json.tests).toEqual([expect.objectContaining({ test: FILE, name: STASH })]);
  });
});

/** PLAN with group 2's task taking over group 1's planned test. */
const TAKEOVER_PLAN = PLAN.replace(
  `    - \`${SECOND.file}\` \`${SECOND.name}\` fails on the stub`,
  `    - \`${FIRST.file}\` \`${FIRST.name}\` fails on the stub`,
);
/** Group 1's proven red of TASK 1, as its tests step left it. */
const groupOneRed = () => {
  const row = {
    type: "step-done",
    workflow: "build",
    step: "build-tests-red",
    status: "DONE",
    at: "2026-11-01T05:00:00Z",
    parentSha: git("rev-parse", "HEAD"),
    group: 1,
    attempt: 1,
    enforced: true,
    artifacts: ["logs/build-tests-red-1-1.md"],
    tests: [
      {
        task: 1,
        test: FIRST.file,
        testName: FIRST.name,
        state: "red",
        blob: git("hash-object", "-w", FIRST.file),
      },
    ],
  };
  write(STATUS, `${JSON.stringify(row)}\n`);
  git("add", "-A");
  git("commit", "-q", "-m", "red rows");
};
const takeoverBody = FIRST_BODY.replace("toBe(1)", "toBe(2)");

describe("a takeover of an earlier task's planned test", () => {
  it("a takeover across groups lets the next code step finish", () => {
    write("plan.md", TAKEOVER_PLAN);
    groupOneRed();
    // Group 2's tests step rewrites the taken-over test; its red records the takeover.
    write(FIRST.file, takeoverBody);
    const red = bkit(
      "tests",
      "red",
      `--file=${STATUS}`,
      "--workflow=build",
      "--group=2",
      "--plan=plan.md",
      "--log=logs/build-tests-red-2-1.md",
    );
    expect(red.status, red.stderr).toBe(0);
    expect(red.json.tests).toEqual([
      expect.objectContaining({ task: 2, state: "taken-over", from: 1 }),
    ]);
    git("add", "-A");
    git("commit", "-q", "-m", "group 2 tests");
    // Group 2's code step touches only its code: the moved lock lets it finish.
    write("src/c.ts", "export const other = () => 1;\n");
    write(
      "logs/execute-2-log.md",
      "Verdict: PASS\n\n<!-- verdict:end -->\n\n# Build Plan\n\nDONE — TASK 2: rows count two\n",
    );
    const code = bkit(
      ...finishArgs("build-plan-tasks", "bkit-build-plan-tasks", "logs/execute-2-log.md", 2),
    );
    expect(code.status, code.stderr).toBe(0);
  });

  it("a mid-build contradiction adds a takeover task and the next code step finishes", () => {
    groupOneRed();
    // Group 2's code step removes a line of ticked TASK 1's planned test and logs it BLOCKED.
    const removed = FIRST_BODY.replace("    expect(addRow()).toBe(1);\n", "");
    write(FIRST.file, removed);
    write("src/c.ts", "export const other = () => 1;\n");
    const executeLog = [
      "Verdict: PASS",
      "",
      "<!-- verdict:end -->",
      "",
      "# Build Plan",
      "",
      `BLOCKED — TASK 2: test \`${FIRST.file}\` \`${FIRST.name}\` — rows now start at 0`,
      "DONE — TASK 2: added other",
      "",
    ].join("\n");
    write("logs/execute-2-log.md", executeLog);
    const refused = bkit(
      ...finishArgs("build-plan-tasks", "bkit-build-plan-tasks", "logs/execute-2-log.md", 2),
    );
    expect(refused.status).toBe(11);
    // The refused finish adds the takeover task itself; the code agent puts the test back.
    expect(refused.json.contradicts).toEqual([
      { test: FIRST.file, name: FIRST.name, from: 1, task: 2, takeover: 3 },
    ]);
    write(FIRST.file, FIRST_BODY);
    const again = bkit(
      ...finishArgs("build-plan-tasks", "bkit-build-plan-tasks", "logs/execute-2-log.md", 2),
    );
    expect(again.status, again.stderr).toBe(0);

    // § Pending takeovers: group 3's tests half runs now.
    const pending = () =>
      bkit("tasks", "takeover", "--pending", "--plan=plan.md", `--file=${STATUS}`).json.pending;
    expect(pending()).toEqual({ group: 3, tasks: [3] });
    write(FIRST.file, removed);
    write(
      "logs/build-plan-tests-3-log.md",
      `Verdict: PASS\n\n<!-- verdict:end -->\n\n# Tests\n\nWROTE — TASK 3: ${FIRST.file} ${FIRST.name}\n`,
    );
    const testsStep = bkit(
      "steps",
      "finish",
      `--file=${STATUS}`,
      "--workflow=build",
      "--step=build-plan-tests",
      "--group=3",
      "--attempt=1",
      "--plan=plan.md",
      "--agent=bkit-build-plan-tests",
      "--artifact=logs/build-plan-tests-3-log.md",
      "--message=chore(1-x): plan-tests group 3",
    );
    expect(testsStep.status, testsStep.stderr).toBe(0);
    const red = bkit(
      "tests",
      "red",
      `--file=${STATUS}`,
      "--workflow=build",
      "--group=3",
      "--plan=plan.md",
      "--log=logs/build-tests-red-3-1.md",
    );
    expect(red.status, red.stderr).toBe(0);
    expect(red.json.tests).toEqual([
      expect.objectContaining({ task: 3, state: "taken-over", from: 1 }),
    ]);
    expect(pending()).toBeNull();
    git("add", "-A");
    git("commit", "-q", "-m", "group 3 tests");

    // Group 3's code step has nothing left to write: its finish passes on the moved lock.
    write(
      "logs/execute-3-log.md",
      "Verdict: PASS\n\n<!-- verdict:end -->\n\n# Build Plan\n\nDONE — TASK 3: already landed\n",
    );
    const code = bkit(
      ...finishArgs("build-plan-tasks", "bkit-build-plan-tasks", "logs/execute-3-log.md", 3),
    );
    expect(code.status, code.stderr).toBe(0);
  });
});
