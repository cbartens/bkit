import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BKIT_BUILD_GATES, BKIT_DEBUG_GATES, BKIT_TEST_FILE_SCRIPT } from "../../install/manifest";
import { runCommand } from "../lib";
import { PACKAGE_RUNNER } from "../../shared/package-manager";
import {
  gateScope,
  judgeGreen,
  judgeRed,
  onlyAddsLines,
  parseJunit,
  readTestFirst,
  resolveGate,
  testsCommand,
  type JunitCase,
} from "./tests";

const dirs: string[] = [];
const tmp = (prefix: string) => {
  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
  dirs.push(d);
  return d;
};

const DEEP = "bkit:gate:static-unit-integration";
const SHALLOW = "bkit:gate:static-unit";
const scripts = (s: Record<string, string>) => JSON.stringify({ scripts: s });

/**
 * A checkout declaring `scripts`, and a fake package runner on PATH that echoes
 * the script it was asked for on stdout and stderr, writes FAKE_JUNIT to
 * $BKIT_TEST_REPORT when both are set, then exits FAKE_EXIT.
 */
let cwd: string;
let bin: string;
function checkout(pkg: string | null) {
  cwd = tmp("bkit-tests-");
  spawnSync("git", ["init", "-q", cwd]);
  if (pkg !== null) fs.writeFileSync(path.join(cwd, "package.json"), pkg);
}
beforeEach(() => {
  bin = tmp("bkit-tests-bin-");
  fs.writeFileSync(
    path.join(bin, PACKAGE_RUNNER),
    '#!/bin/sh\necho "out: $1 in $(pwd)"\necho "err: $1" >&2\necho "arg: $2"\n' +
      'if [ -n "$BKIT_TEST_REPORT" ] && [ -n "$FAKE_JUNIT" ]; then printf "%s" "$FAKE_JUNIT" > "$BKIT_TEST_REPORT"; fi\n' +
      'exit "${FAKE_EXIT:-0}"\n',
    { mode: 0o755 },
  );
  vi.stubEnv("FAKE_EXIT", "0");
  vi.stubEnv("PATH", `${bin}:${process.env.PATH}`);
  checkout(scripts({ [SHALLOW]: "x", [DEEP]: "y" }));
});
afterEach(() => {
  vi.unstubAllEnvs();
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

async function run(argv: string[], at = cwd, verb = "run") {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand(["tests", verb, ...argv], [testsCommand], {
    classicVerbs: new Set(),
    cwd: at,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

const BUILD = [...BKIT_BUILD_GATES.map((g) => `--gate=${g}`), "--log=logs/test.md"];
const readLog = () => fs.readFileSync(path.join(cwd, "logs/test.md"), "utf-8");

describe("resolveGate", () => {
  it("picks the deepest declared candidate, not the first declared in package.json", () => {
    expect(resolveGate(cwd, [DEEP, SHALLOW])).toBe(DEEP);
  });

  it("falls back to a shallower candidate when the deeper one is undeclared", () => {
    checkout(scripts({ [SHALLOW]: "x" }));
    expect(resolveGate(cwd, [DEEP, SHALLOW])).toBe(SHALLOW);
  });

  it("an empty script is not declared: it would run nothing and exit 0 (fix)", () => {
    checkout(scripts({ [DEEP]: "  ", [SHALLOW]: "x" }));
    expect(resolveGate(cwd, [DEEP, SHALLOW])).toBe(SHALLOW);
  });

  it("no package.json, no scripts, or unparseable -> null", () => {
    checkout(null);
    expect(resolveGate(cwd, [SHALLOW])).toBeNull();
    checkout("{}");
    expect(resolveGate(cwd, [SHALLOW])).toBeNull();
    checkout("{oops");
    expect(resolveGate(cwd, [SHALLOW])).toBeNull();
  });

  it("debug's live-first chain stops at the deepest declared tier", () => {
    checkout(scripts({ "bkit:gate:static-unit-integration-e2e": "e", [SHALLOW]: "x" }));
    expect(resolveGate(cwd, BKIT_DEBUG_GATES)).toBe("bkit:gate:static-unit-integration-e2e");
  });
});

describe("bkit tests run", () => {
  it("PASS: runs the gate through the package runner, saves stdout and stderr to the log", async () => {
    const r = await run(BUILD);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({
      verdict: "PASS",
      exitCode: 0,
      gate: DEEP,
      scope: gateScope(DEEP),
      failures: 0,
      log: "logs/test.md",
      logBytes: fs.statSync(path.join(cwd, "logs/test.md")).size,
    });
    expect(r.json.scope).toBe(`${PACKAGE_RUNNER} ${DEEP}`);
    expect(readLog()).toContain(`out: ${DEEP}`);
    expect(readLog()).toContain(`err: ${DEEP}`);
    expect(r.err).toContain(`[bkit-tests] out: ${DEEP}`);
  });

  it("FAIL: a non-zero exit is a FAIL verdict, exit 1, and the log is still saved (build saved none)", async () => {
    vi.stubEnv("FAKE_EXIT", "3");
    const r = await run(BUILD);
    expect(r.code).toBe(1);
    expect(r.json).toMatchObject({ verdict: "FAIL", exitCode: 3, failures: null });
    expect(readLog()).toContain("out:");
  });

  it.each([
    [127, "command not found"],
    [126, "not executable"],
  ])(
    "exit %i from the gate could not run: exit 4, verdict null, never FAIL (#498)",
    async (code, words) => {
      vi.stubEnv("FAKE_EXIT", String(code));
      const r = await run(BUILD);
      expect(r.code).toBe(4);
      expect(r.json).toMatchObject({ verdict: null, exitCode: code });
      expect(r.err).toContain(words);
      expect(r.err).toContain("not a FAIL verdict");
    },
  );

  it("the package runner itself missing could not run either (exit 4, 127 in the log)", async () => {
    const onlyGit = tmp("bkit-tests-onlygit-");
    const gitBin = spawnSync("sh", ["-c", "command -v git"], { encoding: "utf-8" }).stdout.trim();
    fs.symlinkSync(gitBin, path.join(onlyGit, "git"));
    vi.stubEnv("PATH", onlyGit);
    const r = await run(BUILD);
    expect(r.code).toBe(4);
    expect(r.json.exitCode).toBe(127);
    expect(readLog()).toContain("not found on PATH");
  });

  it("no candidate declared: exit 3, nothing run, and the hint names bkit:gate:* — not an install flag (fix)", async () => {
    checkout(scripts({ test: "x" }));
    const r = await run(BUILD);
    expect(r.code).toBe(3);
    expect(r.json).toBeUndefined();
    expect(r.err).toContain("no bkit:gate:* script declared");
    expect(r.err).toContain("declare a bkit:gate:* script in package.json");
    expect(r.err).not.toContain("--typescript");
    expect(fs.existsSync(path.join(cwd, "logs"))).toBe(false);
  });

  it("a missing or broken package.json is named, then reads as nothing declared", async () => {
    checkout("{oops");
    const broken = await run(BUILD);
    expect(broken.code).toBe(3);
    expect(broken.err).toContain("is unparseable");
    checkout(null);
    expect((await run(BUILD)).err).toContain("is missing");
  });

  it("runs at the checkout top from a subdirectory; the log path resolves against the caller's cwd", async () => {
    fs.mkdirSync(path.join(cwd, "sub"));
    const r = await run([`--gate=${SHALLOW}`, "--log=here.md"], path.join(cwd, "sub"));
    expect(r.code).toBe(0);
    const log = fs.readFileSync(path.join(cwd, "sub", "here.md"), "utf-8");
    expect(log).toContain(`in ${cwd}\n`);
  });

  it("--tail bounds the echoed lines; --tail=0 echoes none", async () => {
    expect((await run([...BUILD, "--tail=1"])).err).not.toContain("out:");
    const quiet = await run([...BUILD, "--tail=0"]);
    expect(quiet.err).not.toContain("err:");
    expect((await run([...BUILD, "--tail=x"])).code).toBe(2);
  });

  it("--gate and --log are required", async () => {
    expect((await run(["--log=l.md"])).code).toBe(2);
    expect((await run([`--gate=${SHALLOW}`])).code).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Test-first: red / green
// ---------------------------------------------------------------------------

const NAME = "keeps a value inside the range";
const junit = (...cases: string[]) =>
  `<?xml version="1.0"?><testsuites><testsuite name="s">${cases.join("")}</testsuite></testsuites>`;
const passed = (name: string) => `<testcase classname="f" name="${name}" time="0.1"/>`;
const failed = (name: string, message = "expected 0 to be 5") =>
  `<testcase classname="f" name="${name}"><failure message="${message}" type="AssertionError">trace</failure></testcase>`;
const skipped = (name: string) => `<testcase name="${name}"><skipped/></testcase>`;

describe("parseJunit", () => {
  it("reads names, outcomes and failure messages, decoding entities", () => {
    const cases = parseJunit(
      junit(
        passed("clamp &gt; passes"),
        failed("clamp &gt; " + NAME, "expected +0 to be 5 // Object.is &amp; co"),
        `<testcase name="boom"><error message="TypeError"/></testcase>`,
        skipped("later"),
      ),
    );
    expect(cases).toEqual<JunitCase[]>([
      { name: "clamp > passes", state: "passed", message: "" },
      {
        name: `clamp > ${NAME}`,
        state: "failure",
        message: "expected +0 to be 5 // Object.is & co",
      },
      { name: "boom", state: "error", message: "TypeError" },
      { name: "later", state: "skipped", message: "" },
    ]);
  });

  it("survives a raw > inside an attribute and a closing tag inside CDATA", () => {
    const cases = parseJunit(
      junit(
        `<testcase name="a > b"><failure><![CDATA[</testcase> in output]]></failure></testcase>`,
        passed("c"),
      ),
    );
    expect(cases.map((c) => [c.name, c.state])).toEqual([
      ["a > b", "failure"],
      ["c", "passed"],
    ]);
  });

  it("no testcase elements -> empty", () => {
    expect(parseJunit("<testsuites/>")).toEqual([]);
    expect(parseJunit("not xml")).toEqual([]);
  });
});

describe("judgeRed / judgeGreen — the named test, never the exit code alone", () => {
  const p = (xml: string) => parseJunit(junit(xml));

  it("a red is the named test failing on a non-zero exit", () => {
    expect(judgeRed(1, p(failed(`clamp > ${NAME}`)), NAME)).toBeNull();
    expect(
      judgeRed(1, p(`<testcase name="${NAME}"><error message="x"/></testcase>`), NAME),
    ).toBeNull();
  });

  it.each([
    ["no report (misspelled path)", null, 1, "no-report", "no JUnit report"],
    [
      "load error named after the file",
      p(failed("src/clamp.test.ts", "Cannot find module")),
      1,
      "not-run",
      "did not run",
    ],
    ["zero tests", [], 1, "not-run", "holds no tests"],
    [
      "the named test passed (code written first)",
      p(passed(`clamp > ${NAME}`)),
      0,
      "passed",
      "passed",
    ],
    ["the named test skipped (filter matched nothing)", p(skipped(NAME)), 0, "skipped", "skipped"],
    ["report and exit code disagree", p(failed(NAME)), 0, "exit-mismatch", "exited 0"],
  ])("not a red: %s", (_label, cases, exit, kind, words) => {
    const refusal = judgeRed(exit as number, cases as JunitCase[] | null, NAME);
    expect(refusal?.kind).toBe(kind);
    expect(refusal?.reason).toContain(words);
  });

  it("a name only matches whole trailing segments", () => {
    expect(judgeRed(1, p(failed(`clamp > re${NAME}`)), NAME)?.kind).toBe("not-run");
  });

  it("green needs every case of the named test to pass", () => {
    expect(judgeGreen(p(passed(`a > ${NAME}`)), NAME)).toBeNull();
    expect(judgeGreen(p(skipped(NAME)), NAME)).toContain("skipped");
    expect(judgeGreen(p(passed(`ios ${NAME}`) + failed(`android ${NAME}`)), NAME)).toContain(
      "failure",
    );
    expect(judgeGreen(p(passed("other")), NAME)).toContain("did not run");
    expect(judgeGreen(null, NAME)).toContain("no JUnit report");
  });
});

describe("readTestFirst", () => {
  it("reads test, n/a, missing and malformed entries per task, across wrapped lines", () => {
    const plan = [
      "## Agent Execution Runbook",
      "- [ ] **Task 1:** Add clamp. **Done when:** test passes. **Test first:** `src/./clamp.test.ts` `keeps a value inside the range` fails: stub returns 0.",
      "- [x] **Task 2:** Docs. **Done when:** written. **Test first:** n/a — docs only.",
      "- [ ] **Task 3:** No line. **Done when:** done.",
      "- [ ] **Task 4:** Wrapped. **Done when:** done.",
      "  **Test first:** `a.test.ts` only one span.",
      "- [ ] **Task 5:** Next line holds it.",
      "  **Test first:** `b.test.ts` `rejects bad input`.",
      "",
      "- [ ] Not a task line **Test first:** `x` `y`",
    ].join("\n");
    expect(readTestFirst(plan)).toEqual([
      { task: 1, kind: "test", tests: [{ test: "src/clamp.test.ts", name: NAME }] },
      { task: 2, kind: "na", reason: "docs only." },
      { task: 3, kind: "missing" },
      { task: 4, kind: "malformed" },
      { task: 5, kind: "test", tests: [{ test: "b.test.ts", name: "rejects bad input" }] },
    ]);
  });

  it("reads several tests per task, split on `;` outside backticks", () => {
    const plan = [
      "- [ ] **Task 1:** X. **Done when:** x. **Test first:** `a.test.ts` `clamps low` fails on `clamp(-1, 0, 9)`; `a.test.ts` `clamps high` fails; `b.int.test.ts` `stores; then reads` fails.",
      "- [ ] **Task 2:** Y. **Done when:** y. **Test first:** `a.test.ts` `ok`; `half.test.ts` fails.",
    ].join("\n");
    expect(readTestFirst(plan)).toEqual([
      {
        task: 1,
        kind: "test",
        tests: [
          { test: "a.test.ts", name: "clamps low" },
          { test: "a.test.ts", name: "clamps high" },
          { test: "b.int.test.ts", name: "stores; then reads" },
        ],
      },
      { task: 2, kind: "malformed" },
    ]);
  });

  it("reads a task's Test-order exception line apart from its Test first tests, with its plan lines", () => {
    const plan = [
      "# Plan",
      "- [ ] **Task 1:** X. **Done when:** x. **Test first:** `a.test.ts` `clamps low` fails on a low value passing through; `a.test.ts` `clamps high` fails on a high value passing through.",
      "  **Test-order exception:** `a.test.ts` `clamps high` — code landed before its test; approved by the owner 2026-10-22.",
      "- [ ] **Task 2:** Y. **Done when:** y. **Test first:** `b.test.ts` `ok` fails on the stub result.",
    ].join("\n");
    expect(readTestFirst(plan)).toEqual([
      {
        task: 1,
        kind: "test",
        tests: [
          { test: "a.test.ts", name: "clamps low" },
          { test: "a.test.ts", name: "clamps high" },
        ],
        exception: { tests: [{ test: "a.test.ts", name: "clamps high" }], lines: [3] },
      },
      { task: 2, kind: "test", tests: [{ test: "b.test.ts", name: "ok" }] },
    ]);
  });
});

describe("onlyAddsLines", () => {
  const before = "import { a } from 'a';\n\nit('x', () => {\n  expect(a()).toBe(1);\n});\n";

  it("passes added lines and whitespace-only changes", () => {
    expect(onlyAddsLines(before, before)).toBe(true);
    expect(onlyAddsLines(before, `${before}\nit('y', () => {\n  expect(a()).toBe(2);\n});\n`)).toBe(
      true,
    );
    expect(onlyAddsLines(before, before.replace("  expect", "\t\texpect"))).toBe(true);
  });

  it("fails an edited or a removed line", () => {
    expect(onlyAddsLines(before, before.replace("{ a }", "{ a, b }"))).toBe(false);
    expect(onlyAddsLines(before, before.replace("toBe(1)", "toBe(2)"))).toBe(false);
    expect(onlyAddsLines(before, before.replace("  expect(a()).toBe(1);\n", ""))).toBe(false);
  });
});

describe("bkit tests red / green", () => {
  const STATUS = "logs/status.jsonl";
  const TEST = "src/clamp.test.ts";
  const RED_LOG = "logs/build-task-red-1-1.md";
  const red = (extra: string[] = []) =>
    run(
      [
        `--file=${STATUS}`,
        "--workflow=build",
        "--sub-plan=1",
        "--task=1",
        `--test=${TEST}`,
        `--name=${NAME}`,
        `--log=${RED_LOG}`,
        ...extra,
      ],
      cwd,
      "red",
    );
  const green = (plan = "plan.md") =>
    run(
      [
        `--file=${STATUS}`,
        "--workflow=build",
        "--sub-plan=1",
        `--plan=${plan}`,
        "--log=logs/green.md",
      ],
      cwd,
      "green",
    );
  const greenBrief = (brief: string) =>
    run(
      [
        `--file=${STATUS}`,
        "--workflow=build",
        "--sub-plan=1",
        "--plan=missing.md",
        `--brief=${brief}`,
        "--log=logs/green.md",
      ],
      cwd,
      "green",
    );
  const rows = () =>
    fs
      .readFileSync(path.join(cwd, STATUS), "utf-8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l) as Record<string, unknown>);
  const report = () => fs.readFileSync(path.join(cwd, "logs/green.md"), "utf-8");
  const writePlan = (...tasks: string[]) =>
    fs.writeFileSync(path.join(cwd, "plan.md"), `# Plan\n\n${tasks.join("\n")}\n`);
  const TASK_1 = `- [ ] **Task 1:** Clamp. **Done when:** passes. **Test first:** \`${TEST}\` \`${NAME}\` fails.`;

  beforeEach(() => {
    checkout(scripts({ [BKIT_TEST_FILE_SCRIPT]: "runner" }));
    spawnSync("git", ["-C", cwd, "commit", "-q", "--allow-empty", "-m", "base"], {
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: "t",
        GIT_AUTHOR_EMAIL: "t@t",
        GIT_COMMITTER_NAME: "t",
        GIT_COMMITTER_EMAIL: "t@t",
      },
    });
    fs.mkdirSync(path.join(cwd, "src"));
    fs.writeFileSync(path.join(cwd, TEST), "expect(clamp(5, 1, 10)).toBe(5);\n");
  });

  it("records a red: the named test failed; row, log and test snapshot written, path passed whole", async () => {
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(`clamp > ${NAME}`)));
    const r = await red();
    expect(r.code).toBe(0);
    expect(r.json.recorded).toBe(true);
    const [row] = rows();
    expect(row).toMatchObject({
      type: "step-done",
      workflow: "build",
      step: "build-task-red",
      subPlan: 1,
      task: 1,
      test: TEST,
      testName: NAME,
      exitCode: 1,
      failure: "expected 0 to be 5",
      artifacts: [RED_LOG, "logs/build-task-red-1-1.snapshot"],
    });
    expect(row!.testBlob).toMatch(/^[0-9a-f]{40}$/);
    expect(fs.readFileSync(path.join(cwd, RED_LOG), "utf-8")).toContain(`arg: ${TEST}`);
    expect(fs.readFileSync(path.join(cwd, "logs/build-task-red-1-1.snapshot"), "utf-8")).toBe(
      fs.readFileSync(path.join(cwd, TEST), "utf-8"),
    );
  });

  it("refuses a run that is not a red: exit 1, reason printed, no row", async () => {
    vi.stubEnv("FAKE_EXIT", "0");
    vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
    const r = await red();
    expect(r.code).toBe(1);
    expect(r.json).toMatchObject({ recorded: false, refused: "passed" });
    expect(r.err).toContain("not a red (passed)");
    expect(r.err).toContain("a red must fail before the task's code exists");
    expect(fs.existsSync(path.join(cwd, STATUS))).toBe(false);
  });

  it("a red already recorded for the unchanged test stands on resume; a changed test runs again", async () => {
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
    expect((await red()).code).toBe(0);
    vi.stubEnv("FAKE_EXIT", "0");
    vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
    const resumed = await red();
    expect(resumed.code).toBe(0);
    expect(resumed.json).toMatchObject({ recorded: true, already: true, log: RED_LOG });
    expect(resumed.err).toContain("red already recorded");
    expect(rows()).toHaveLength(1);
    fs.appendFileSync(path.join(cwd, TEST), "// edited after the red\n");
    const changed = await red();
    expect(changed.code).toBe(1);
    expect(changed.json).toMatchObject({ recorded: false, refused: "passed" });
  });

  it("refuses a missing report, an undeclared script (exit 3), a path outside the repo (exit 2)", async () => {
    vi.stubEnv("FAKE_EXIT", "1");
    expect((await red()).err).toContain("no JUnit report");
    expect((await red(["--test=../outside.test.ts"])).code).toBe(2);
    expect((await red(["--test=src/nope.test.ts"])).code).toBe(2);
    checkout(scripts({ test: "x" }));
    const undeclared = await red();
    expect(undeclared.code).toBe(3);
    expect(undeclared.err).toContain("BKIT_TEST_REPORT");
  });

  it("a script that cannot run is exit 4, not a rejected red", async () => {
    vi.stubEnv("FAKE_EXIT", "127");
    expect((await red()).code).toBe(4);
  });

  it("green: not enforced (exit 0, report says why) without a plan, Test first lines, or the script", async () => {
    let r = await green("missing.md");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ enforced: false });
    expect(report()).toContain("Enforced: false");
    expect(report()).toContain("no plan file");
    writePlan("- [ ] **Task 1:** Old plan. **Done when:** done.");
    r = await green();
    expect(r.json.reason).toContain("no `Test first:` lines");
    writePlan(TASK_1);
    checkout(scripts({ test: "x" }));
    writePlan(TASK_1);
    r = await green();
    expect(r.json.reason).toContain("not declared");
  });

  it("green: no plan file -> a brief with plan-shaped tasks is audited; a plain brief is not", async () => {
    fs.writeFileSync(path.join(cwd, "brief.md"), `# Session prompt\n\nAdd clamp.\n`);
    let r = await greenBrief("brief.md");
    expect(r.json).toMatchObject({ enforced: false });
    expect(r.json.reason).toContain("the brief has no `**Task N:**` lines");
    fs.writeFileSync(path.join(cwd, "brief.md"), `# Session prompt\n\n### Tasks\n\n${TASK_1}\n`);
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
    expect((await red()).code).toBe(0);
    vi.stubEnv("FAKE_EXIT", "0");
    vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
    r = await greenBrief("brief.md");
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ enforced: true, plan: "brief.md", gaps: [] });
    writePlan("- [ ] **Task 1:** Old plan. **Done when:** done.");
    r = await run(
      [
        `--file=${STATUS}`,
        "--workflow=build",
        "--sub-plan=1",
        "--plan=plan.md",
        "--brief=brief.md",
        "--log=logs/green.md",
      ],
      cwd,
      "green",
    );
    expect(r.json.reason).toContain("the plan has no `Test first:` lines");
  });

  it("green: red recorded, test unchanged, named test passing -> no gaps", async () => {
    writePlan(TASK_1, "- [ ] **Task 2:** Docs. **Done when:** done. **Test first:** n/a — docs.");
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
    expect((await red()).code).toBe(0);
    vi.stubEnv("FAKE_EXIT", "0");
    vi.stubEnv("FAKE_JUNIT", junit(passed(`clamp > ${NAME}`)));
    const r = await green();
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ enforced: true, gaps: [] });
    expect(report()).toContain("Gaps: 0");
    expect(report()).toContain("| 1 |");
  });

  it("green: lists each gap kind, with the diff for a test changed since its red", async () => {
    writePlan(
      TASK_1,
      `- [ ] **Task 2:** No red. **Done when:** x. **Test first:** \`${TEST}\` \`second\` fails.`,
      "- [ ] **Task 3:** No line. **Done when:** x.",
      "- [ ] **Task 4:** Bad line. **Done when:** x. **Test first:** `only-one`.",
    );
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
    expect((await red()).code).toBe(0);
    fs.writeFileSync(path.join(cwd, TEST), "expect(true).toBe(true);\n");
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(passed(NAME), failed("second")));
    const r = await green();
    expect(r.code).toBe(1);
    expect(
      (r.json.gaps as Array<{ task: number; kind: string }>).map((g) => `${g.task}:${g.kind}`),
    ).toEqual([
      "1:test-changed",
      "2:no-red",
      "2:not-green",
      "3:no-test-first",
      "4:test-first-malformed",
    ]);
    expect(r.json.testOrderOnly).toBe(false);
    expect(report()).toContain("Test order only: false");
    expect(report()).toContain("-expect(clamp(5, 1, 10)).toBe(5);");
    expect(report()).toContain("+expect(true).toBe(true);");
    expect(report()).toContain("## Runner output");
  });

  it("green: a red recorded for a different test than the plan names is a red-mismatch", async () => {
    writePlan(
      `- [ ] **Task 1:** X. **Done when:** x. **Test first:** \`${TEST}\` \`planned name\` fails.`,
    );
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
    expect((await red()).code).toBe(0);
    vi.stubEnv("FAKE_EXIT", "0");
    vi.stubEnv("FAKE_JUNIT", junit(passed("planned name")));
    const r = await green();
    const gaps = r.json.gaps as Array<{ kind: string; detail: string }>;
    expect(gaps.map((g) => g.kind)).toEqual(["red-mismatch"]);
    expect(gaps[0]!.detail).toContain(`"${NAME}" (not passing:`);
  });

  it("green: a planned test that moved is a red-mismatch saying whether the recorded test passes now", async () => {
    writePlan(
      `- [ ] **Task 1:** X. **Done when:** x. **Test first:** \`src/old/clamp.test.ts\` \`${NAME}\` fails.`,
    );
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
    expect((await red()).code).toBe(0);
    vi.stubEnv("FAKE_EXIT", "0");
    vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
    const gaps = (await green()).json.gaps as Array<{ kind: string; detail: string }>;
    expect(gaps.map((g) => g.kind)).toEqual(["red-mismatch", "not-green"]);
    expect(gaps[0]!.detail).toContain(`\`${TEST}\` "${NAME}" (passes now)`);
    expect(gaps[1]!.detail).toContain("does not exist");
  });

  it("green: every test a task names needs its own red and its own pass", async () => {
    const redFor = (name: string, n: number) =>
      run(
        [
          `--file=${STATUS}`,
          "--workflow=build",
          "--sub-plan=1",
          "--task=1",
          `--test=${TEST}`,
          `--name=${name}`,
          `--log=logs/build-task-red-1-1-${n}.md`,
        ],
        cwd,
        "red",
      );
    writePlan(
      `- [ ] **Task 1:** X. **Done when:** x. **Test first:** \`${TEST}\` \`clamps low\` fails; \`${TEST}\` \`clamps high\` fails; \`${TEST}\` \`clamps nan\` fails.`,
    );
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv(
      "FAKE_JUNIT",
      junit(failed("clamps low"), failed("clamps high"), failed("clamps nan")),
    );
    expect((await redFor("clamps low", 1)).code).toBe(0);
    expect((await redFor("clamps high", 2)).code).toBe(0);
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv(
      "FAKE_JUNIT",
      junit(passed("clamps low"), failed("clamps high"), passed("clamps nan")),
    );
    const r = await green();
    expect(r.code).toBe(1);
    expect((r.json.gaps as Array<{ kind: string; detail: string }>).map((g) => g.kind)).toEqual([
      "not-green",
      "no-red",
    ]);
    expect(report()).toContain('`src/clamp.test.ts` "clamps nan"');
    expect(rows().map((row) => row.testName)).toEqual(["clamps low", "clamps high"]);
  });

  describe("test order", () => {
    const GIT_ENV = {
      ...process.env,
      GIT_AUTHOR_NAME: "t",
      GIT_AUTHOR_EMAIL: "t@t",
      GIT_COMMITTER_NAME: "t",
      GIT_COMMITTER_EMAIL: "t@t",
    };
    const head = () =>
      spawnSync("git", ["-C", cwd, "rev-parse", "HEAD"], { encoding: "utf-8" }).stdout.trim();
    const commit = (message: string, paths: string[] = ["-A"]) => {
      spawnSync("git", ["-C", cwd, "add", ...paths], { env: GIT_ENV });
      spawnSync("git", ["-C", cwd, "commit", "-q", "-m", message], { env: GIT_ENV });
      return head();
    };
    const statusRow = (row: Record<string, unknown>) => {
      fs.mkdirSync(path.join(cwd, "logs"), { recursive: true });
      fs.appendFileSync(
        path.join(cwd, STATUS),
        `${JSON.stringify({ type: "step-done", workflow: "build", status: "DONE", at: "2026-10-22T05:00:00Z", parentSha: head(), ...row })}\n`,
      );
    };
    /** What `steps finish` does for plan-execute: log, row, then one commit of everything. */
    const finishExecute = (log: string) => {
      statusRow({
        step: "build-plan-execute",
        artifacts: ["logs/build-plan-execute-1-log.md"],
        subPlan: 1,
        attempt: 1,
      });
      fs.writeFileSync(path.join(cwd, "logs/build-plan-execute-1-log.md"), log);
      return commit("chore(1-x): plan-execute sub-plan 1");
    };
    const kinds = (r: { json: Record<string, unknown> }) =>
      (r.json.gaps as Array<{ kind: string }>).map((g) => g.kind);
    const EXCEPTION = `  **Test-order exception:** \`${TEST}\` \`${NAME}\` — code landed before its test; approved by the owner.`;

    it("a red recorded on or after the commit that first holds the task's code is a late-red", async () => {
      writePlan(TASK_1);
      commit("plan");
      const code = finishExecute("DONE — Task 1: Clamp — implemented\n");
      vi.stubEnv("FAKE_EXIT", "1");
      vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
      expect((await red()).code).toBe(0);
      vi.stubEnv("FAKE_EXIT", "0");
      vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
      const r = await green();
      expect(r.code).toBe(1);
      expect(kinds(r)).toEqual(["late-red"]);
      const [gap] = r.json.gaps as Array<{ detail: string }>;
      expect(gap!.detail).toContain(code.slice(0, 7));
      expect(gap!.detail).toContain("plan-execute log records Task 1 DONE");
      expect(r.json.testOrderOnly).toBe(true);
      expect(report()).toContain("Test order only: true");
    });

    it("a red recorded before the task's code commit stands, across a resumed execute", async () => {
      writePlan(TASK_1);
      commit("plan");
      finishExecute("BLOCKED — Task 1: Clamp — turn cap\n");
      vi.stubEnv("FAKE_EXIT", "1");
      vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
      expect((await red()).code).toBe(0);
      finishExecute("DONE — Task 1: Clamp — implemented\n");
      vi.stubEnv("FAKE_EXIT", "0");
      vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
      const r = await green();
      expect(r.code).toBe(0);
      expect(r.json).toMatchObject({ gaps: [], testOrderOnly: false, lateRedUnchecked: [] });
      expect(report()).not.toContain("## Late-red check");
    });

    it("a task with a red but no plan-execute commit recording it DONE is reported as late-red not checked", async () => {
      writePlan(TASK_1);
      commit("plan");
      vi.stubEnv("FAKE_EXIT", "1");
      vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
      expect((await red()).code).toBe(0);
      finishExecute("- DONE — Task 1: Clamp — implemented\n");
      vi.stubEnv("FAKE_EXIT", "0");
      vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
      const r = await green();
      expect(r.code).toBe(0);
      expect(r.json).toMatchObject({ gaps: [], lateRedUnchecked: [1] });
      expect(report()).toContain("## Late-red check");
      expect(report()).toContain(
        "- Task 1 — not checked: no plan-execute step commit's log records",
      );
    });

    it("a test file that only gained lines since its red is no gap; the diff stays in the report", async () => {
      writePlan(TASK_1);
      vi.stubEnv("FAKE_EXIT", "1");
      vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
      expect((await red()).code).toBe(0);
      fs.appendFileSync(path.join(cwd, TEST), "\nexpect(clamp(0, 1, 10)).toBe(1);\n");
      vi.stubEnv("FAKE_EXIT", "0");
      vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
      const r = await green();
      expect(r.code).toBe(0);
      expect(r.json.gaps).toEqual([]);
      expect(report()).toContain("| added lines only |");
      expect(report()).toContain("+expect(clamp(0, 1, 10)).toBe(1);");
    });

    it("an exception clears its tests' test-order gaps only from a human-made commit, never not-green", async () => {
      writePlan(TASK_1, EXCEPTION);
      statusRow({ step: "build-worktree-setup", artifacts: [] });
      vi.stubEnv("FAKE_EXIT", "0");
      vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
      let r = await green();
      expect(kinds(r)).toEqual(["no-red"]);
      expect(report()).toContain("not honoured");
      expect(report()).toContain("not committed");

      statusRow({ step: "build-plan-verify", artifacts: [] });
      const stepCommit = commit("chore(1-x): plan-verify sub-plan 1 attempt 1");
      r = await green();
      expect(kinds(r)).toEqual(["no-red"]);
      expect(report()).toContain(stepCommit.slice(0, 7));
      expect(report()).toContain("workflow step commit");

      writePlan(TASK_1, EXCEPTION.replace("the owner.", "the owner 2026-10-22."));
      commit("docs(1-x): accept test order for Task 1", ["plan.md"]);
      r = await green();
      expect(r.code).toBe(0);
      expect(r.json.gaps).toEqual([]);
      expect(report()).not.toContain("not honoured");
      expect(report()).toMatch(/Task 1 — honoured; cleared .*no-red/);

      vi.stubEnv("FAKE_EXIT", "1");
      vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
      r = await green();
      expect(kinds(r)).toEqual(["not-green"]);
    });
  });
});
