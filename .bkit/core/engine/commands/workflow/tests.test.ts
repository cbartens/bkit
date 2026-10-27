import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parse as parseYaml } from "yaml";

import { PLAN_FIELDS, parsePlanBlocks, type PlanField, type PlanTaskBlock } from "./plan-blocks";
import { BKIT_BUILD_GATES, BKIT_DEBUG_GATES, BKIT_TEST_FILE_SCRIPT } from "../../install/manifest";
import { runCommand } from "../lib";
import { PACKAGE_RUNNER } from "../../shared/package-manager";
import { CONFIG_DEFAULTS, type TaskCaps } from "../../shared/settings";
import { getCoreRoot } from "../../shared/package-roots";
import { taskCapDefaultsNamed } from "../../checks/before/repo";
import {
  checkPlanText,
  gateScope,
  judgeGreen,
  judgeRed,
  onlyAddsLines,
  parseJunit,
  readTestFirst,
  resolveGate,
  taskSizes,
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
 * $BKIT_TEST_REPORT when both are set, writes FAKE_REPORT_A / FAKE_REPORT_B into
 * $BKIT_TEST_REPORT_DIR (B one folder down), prints FAKE_LINES numbered lines,
 * then exits FAKE_EXIT.
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
      'if [ -n "$FAKE_REPORT_A" ]; then printf "%s" "$FAKE_REPORT_A" > "$BKIT_TEST_REPORT_DIR/a.xml"; fi\n' +
      'if [ -n "$FAKE_REPORT_B" ]; then mkdir -p "$BKIT_TEST_REPORT_DIR/tier" && printf "%s" "$FAKE_REPORT_B" > "$BKIT_TEST_REPORT_DIR/tier/b.xml"; fi\n' +
      'if [ -n "$FAKE_LINES" ]; then seq 1 "$FAKE_LINES" | sed "s/$/ quiet runner line/"; fi\n' +
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
  const code = await runCommand(["tests", verb, ...argv, "--json"], [testsCommand], {
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

  it("with no e2e gate, debug runs the integration gate build runs", () => {
    checkout(scripts({ "bkit:gate:static-unit-integration": "i", [SHALLOW]: "x" }));
    expect(resolveGate(cwd, BKIT_DEBUG_GATES)).toBe("bkit:gate:static-unit-integration");
    expect(resolveGate(cwd, BKIT_DEBUG_GATES)).toBe(resolveGate(cwd, BKIT_BUILD_GATES));
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
      reports: "logs/test.md.reports",
      log: "logs/test.md",
      logBytes: fs.statSync(path.join(cwd, "logs/test.md")).size,
      artifact: null,
      clamp: null,
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

describe("bkit tests run — failures from JUnit reports", () => {
  const xml = (...cases: string[]) =>
    `<?xml version="1.0"?><testsuites><testsuite name="s">${cases.join("")}</testsuite></testsuites>`;
  const caseOf = (name: string, child = "") =>
    child === "" ? `<testcase name="${name}"/>` : `<testcase name="${name}">${child}</testcase>`;
  const failing = (name: string) => caseOf(name, '<failure message="boom">t</failure>');
  const erroring = (name: string) => caseOf(name, '<error message="crash">t</error>');
  const skippedCase = (name: string) => caseOf(name, "<skipped/>");

  it("sums failing and erroring cases across every XML file in the report folder; skipped never counts", async () => {
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_REPORT_A", xml(failing("a1"), caseOf("a2"), skippedCase("a3")));
    vi.stubEnv("FAKE_REPORT_B", xml(erroring("b1"), failing("b2"), skippedCase("b3")));
    const r = await run(BUILD);
    expect(r.code).toBe(1);
    expect(r.json).toMatchObject({ verdict: "FAIL", failures: 3, reports: "logs/test.md.reports" });
    expect(fs.readdirSync(path.join(cwd, "logs/test.md.reports"))).toContain("a.xml");
  });

  it("FAIL with no report: failures null and a hint naming the folder, never a guessed count", async () => {
    vi.stubEnv("FAKE_EXIT", "1");
    const r = await run(BUILD);
    expect(r.json).toMatchObject({ verdict: "FAIL", failures: null });
    expect(r.err).toContain("BKIT_TEST_REPORT_DIR");
    expect(r.err).toContain("JUnit");
  });

  it("FAIL whose reports hold no failing case: failures null (the gate failed outside its reported tests)", async () => {
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_REPORT_A", xml(caseOf("ok"), skippedCase("s")));
    const r = await run(BUILD);
    expect(r.json).toMatchObject({ verdict: "FAIL", failures: null });
    expect(r.err).toContain("outside");
  });

  it("PASS is 0 failures with or without reports", async () => {
    expect((await run(BUILD)).json.failures).toBe(0);
    vi.stubEnv("FAKE_REPORT_A", xml(caseOf("ok")));
    expect((await run(BUILD)).json.failures).toBe(0);
  });

  it("clears a previous attempt's reports before the gate runs", async () => {
    const stale = path.join(cwd, "logs/test.md.reports/old.xml");
    fs.mkdirSync(path.dirname(stale), { recursive: true });
    fs.writeFileSync(stale, xml(failing("old")));
    vi.stubEnv("FAKE_EXIT", "1");
    const r = await run(BUILD);
    expect(r.json.failures).toBeNull();
    expect(fs.existsSync(stale)).toBe(false);
  });

  it("hands the gate the report folder as an absolute BKIT_TEST_REPORT_DIR", async () => {
    vi.stubEnv("FAKE_REPORT_A", xml(caseOf("ok")));
    await run(BUILD, cwd);
    expect(fs.existsSync(path.join(cwd, "logs/test.md.reports/a.xml"))).toBe(true);
  });
});

describe("bkit tests run --artifact", () => {
  const ART = "docs/plans/202610/logs/1-x/run-tests-2.md";
  const ARGS = [
    ...BUILD,
    `--artifact=${ART}`,
    "--fid=1-x",
    "--step=build-run-tests",
    "--attempt=2",
  ];
  const clampLog = () => path.join(cwd, "tmp/bkit-clamp-1-x-build-run-tests-2.jsonl");

  it("copies the log to the artifact, trims the copy, keeps the log whole, and resets then records the clamp", async () => {
    fs.mkdirSync(path.join(cwd, "tmp"), { recursive: true });
    fs.writeFileSync(clampLog(), '{"stale":true}\n');
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_LINES", "9000");
    const r = await run(ARGS);
    expect(r.code).toBe(1);
    expect(r.json).toMatchObject({
      artifact: ART,
      clamp: {
        artifact: ART,
        clamped: true,
        raw: "logs/test.md",
        source: gateScope(DEEP),
      },
    });
    expect(r.json.clamp.fetchedAt).toMatch(/Z$/);
    expect(readLog().split("\n").length).toBeGreaterThan(9000);
    const art = fs.readFileSync(path.join(cwd, ART), "utf-8");
    expect(art).toContain("TRUNCATED");
    expect(art.split("\n").length).toBeLessThan(9000);
    const rows = fs
      .readFileSync(clampLog(), "utf-8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l));
    expect(rows).toEqual([r.json.clamp]);
  });

  it("a log under the outbox is named main-checkout relative in the record", async () => {
    const log = path.join(cwd, ".git/bkit-outbox/1-x/run-tests-2.log");
    vi.stubEnv("FAKE_LINES", "9000");
    const r = await run([
      ...BKIT_BUILD_GATES.map((g) => `--gate=${g}`),
      `--log=${log}`,
      `--artifact=${ART}`,
      "--fid=1-x",
      "--step=build-run-tests",
      "--attempt=2",
    ]);
    expect(r.code).toBe(0);
    expect(r.json.clamp).toMatchObject({
      clamped: true,
      raw: ".git/bkit-outbox/1-x/run-tests-2.log",
      source: gateScope(DEEP),
    });
    expect(r.json.reports).toBe(`${log}.reports`);
    expect(fs.readdirSync(path.dirname(path.join(cwd, ART)))).toEqual(["run-tests-2.md"]);
  });

  it("a log small enough is copied whole: not clamped, raw null", async () => {
    const r = await run(ARGS);
    expect(r.json.clamp).toMatchObject({ clamped: false, raw: null, source: gateScope(DEEP) });
    expect(fs.readFileSync(path.join(cwd, ART), "utf-8")).toBe(readLog());
  });

  it("exit 5 when the artifact cannot be written; the verdict is still printed", async () => {
    fs.writeFileSync(path.join(cwd, "docs"), "a file where a folder should be");
    const r = await run(ARGS);
    expect(r.code).toBe(5);
    expect(r.json).toMatchObject({ verdict: "PASS", artifact: ART, clamp: null });
    expect(r.err).toContain(ART);
  });

  it("--artifact needs --fid and --step", async () => {
    expect((await run([...BUILD, `--artifact=${ART}`])).code).toBe(2);
    expect((await run([...BUILD, `--artifact=${ART}`, "--fid=1-x"])).code).toBe(2);
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

/** A task block: markers, its `**TASK N:**` line, then `fields`. */
const taskBlock = (n: number, fields: string[], tick = " ") =>
  [
    `<!-- bkit:task ${n} start -->`,
    `- [${tick}] **TASK ${n}:** Do ${n}.`,
    ...fields,
    `<!-- bkit:task ${n} end -->`,
  ].join("\n");
/** A group block holding `tasks`. */
const groupBlock = (n: number, ...tasks: string[]) =>
  [
    `<!-- bkit:group ${n} start -->`,
    `### GROUP ${n}: Group ${n}`,
    "",
    ...tasks.flatMap((t) => [t, ""]),
    `<!-- bkit:group ${n} end -->`,
  ].join("\n");
/** A TEST FIRST field naming `n` tests spread over `files` test files. */
const testFirstField = (n: number, files = 1, from = 0) => [
  "  - **TEST FIRST:**",
  ...Array.from(
    { length: n },
    (_, k) => `    - \`t${k % files}.test.ts\` \`case ${from + k}\` fails on the stub`,
  ),
];
/** A well-formed task: DONE WHEN, `extra` fields, and `tests` TEST FIRST tests. */
const okTask = (n: number, tests = 1, files = 1, extra: string[] = [], tick = " ") =>
  taskBlock(
    n,
    ["  - **DONE WHEN:** done", ...extra, ...testFirstField(tests, files, n * 100)],
    tick,
  );

describe("readTestFirst", () => {
  it("reads test, n/a, missing and malformed entries per task", () => {
    const plan = [
      "## Agent Execution Runbook",
      groupBlock(
        1,
        taskBlock(1, [
          "  - **DONE WHEN:** test passes",
          "  - **TEST FIRST:**",
          `    - \`src/./clamp.test.ts\` \`${NAME}\` fails: stub returns 0`,
        ]),
        taskBlock(2, ["  - **DONE WHEN:** written", "  - **TEST FIRST:** n/a — docs only."], "x"),
        taskBlock(3, ["  - **DONE WHEN:** done"]),
        taskBlock(4, ["  - **TEST FIRST:**", "    - `a.test.ts` only one span."]),
        taskBlock(5, ["  - **TEST FIRST:**"]),
      ),
    ].join("\n");
    expect(readTestFirst(plan)).toEqual([
      { task: 1, kind: "test", tests: [{ test: "src/clamp.test.ts", name: NAME }] },
      { task: 2, kind: "na", reason: "docs only." },
      { task: 3, kind: "missing" },
      { task: 4, kind: "malformed" },
      { task: 5, kind: "malformed" },
    ]);
  });

  it("reads several tests per task, one per sub-bullet; a name may hold a `;`", () => {
    const plan = groupBlock(
      1,
      taskBlock(1, [
        "  - **TEST FIRST:**",
        "    - `a.test.ts` `clamps low` fails on `clamp(-1, 0, 9)`",
        "    - `a.test.ts` `clamps high` fails",
        "    - `b.int.test.ts` `stores; then reads` fails",
      ]),
    );
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
    ]);
  });

  it("reads a task's TEST EXCEPTION field apart from its TEST FIRST tests, with its plan lines", () => {
    const plan = [
      "# Plan",
      groupBlock(
        1,
        taskBlock(1, [
          "  - **TEST FIRST:**",
          "    - `a.test.ts` `clamps low` fails on a low value passing through",
          "    - `a.test.ts` `clamps high` fails on a high value passing through",
          "  - **TEST EXCEPTION:** `a.test.ts` `clamps high` — code landed before its test;",
          "    approved by the owner 2026-10-22.",
        ]),
        taskBlock(2, ["  - **TEST EXCEPTION:** a generated file; no test can fail first."]),
      ),
    ].join("\n");
    expect(readTestFirst(plan)).toEqual([
      {
        task: 1,
        kind: "test",
        tests: [
          { test: "a.test.ts", name: "clamps low" },
          { test: "a.test.ts", name: "clamps high" },
        ],
        exception: { tests: [{ test: "a.test.ts", name: "clamps high" }], lines: [10, 11] },
      },
      { task: 2, kind: "na", reason: "a generated file; no test can fail first." },
    ]);
  });

  it("narrows to one group's tasks", () => {
    const plan = [groupBlock(1, okTask(1)), groupBlock(2, okTask(2), okTask(3))].join("\n");
    expect(readTestFirst(plan, 2).map((s) => s.task)).toEqual([2, 3]);
  });

  it("reads no task from old-format task lines", () => {
    const plan =
      "- [ ] **Task 1:** Old. **Done when:** x. **Test first:** `a.test.ts` `clamps low` fails.";
    expect(readTestFirst(plan)).toEqual([]);
  });
});

describe("taskSizes", () => {
  it("counts tests and distinct test files per task; n/a, missing and malformed count 0", () => {
    const plan = groupBlock(
      1,
      taskBlock(1, [
        "  - **TEST FIRST:**",
        "    - `a.test.ts` `one` fails",
        "    - `./a.test.ts` `two` fails",
        "    - `b.test.ts` `three` fails",
      ]),
      taskBlock(2, ["  - **TEST FIRST:** n/a — docs."]),
      taskBlock(3, []),
    );
    expect(taskSizes(readTestFirst(plan))).toEqual([
      { task: 1, tests: 3, files: 2 },
      { task: 2, tests: 0, files: 0 },
      { task: 3, tests: 0, files: 0 },
    ]);
  });
});

describe("checkPlanText", () => {
  it("sizes each group and task, and lists each problem with its line", () => {
    const text = [
      "# Plan",
      groupBlock(1, okTask(1, 11), okTask(2, 2, 2)),
      "## Notes",
      "**TEST FIRST:** `b.test.ts` `stray` fails",
    ].join("\n");
    const check = checkPlanText(text);
    expect(check.groups).toEqual([
      expect.objectContaining({ group: 1, title: "Group 1", tasks: 2, tests: 13 }),
    ]);
    expect(check.sizes).toEqual([
      { task: 1, group: 1, tests: 11, files: 1 },
      { task: 2, group: 1, tests: 2, files: 2 },
    ]);
    expect(check.overCap).toEqual([{ task: 1, group: 1, tests: 11, files: 1 }]);
    expect(check.problems.map((p) => [p.line, p.kind])).toEqual([
      [5, "cap"],
      [text.split("\n").length, "stray"],
    ]);
  });

  it("refuses a task that depends on itself", () => {
    const text = groupBlock(1, okTask(1, 1, 1, ["  - **DEPENDS ON:** 1"]));
    expect(checkPlanText(text).problems).toEqual([
      { line: 4, kind: "depends", message: "TASK 1 depends on itself" },
    ]);
  });

  it("an unclosed code fence is reported as such, not as missing task markers", () => {
    const text = ["# Plan", "```text", groupBlock(1, okTask(1))].join("\n");
    expect(checkPlanText(text).problems.map((p) => p.message)).toEqual([
      "the code fence at line 2 is never closed; nothing after it is read",
    ]);
  });

  it("reads a CRLF plan's Reuse Inventory", () => {
    const text = [
      "# Plan",
      "",
      "## Reuse Inventory",
      "",
      "| Capability | File | Search performed | Existing candidates | Decision (EXTEND/NEW) | Justification |",
      "| --- | --- | --- | --- | --- | --- |",
      "| x | `src/new.ts` | rg x | none | NEW | nothing to extend |",
      "",
      groupBlock(1, okTask(1, 1, 1, ["  - **CREATE:** `made` in `src/new.ts`: new"])),
    ]
      .join("\n")
      .replace(/\n/g, "\r\n");
    expect(checkPlanText(text).problems).toEqual([]);
  });
});

/** The first ```text fence in `md`, its indent removed; "" when there is none. */
function fencedText(md: string): string {
  const fence = /^( *)```text\n([\s\S]*?)^\1```/m.exec(md);
  if (!fence) return "";
  const indent = fence[1]!;
  return fence[2]!
    .split("\n")
    .map((l) => (l.startsWith(indent) ? l.slice(indent.length) : l))
    .join("\n");
}

/** Issue task blocks wrapped as a plan: a Reuse Inventory NEW row per CREATE file, then the blocks. */
function asPlan(blocks: string): string {
  const files = parsePlanBlocks(blocks).tasks.flatMap((t) => t.create.map((c) => c.file));
  return [
    "# Plan",
    "",
    "## Reuse Inventory",
    "",
    "| Capability | File | Search performed | Existing candidates | Decision (EXTEND/NEW) | Justification |",
    "| --- | --- | --- | --- | --- | --- |",
    ...files.map((f) => `| x | \`${f}\` | rg x | none | NEW | nothing to extend |`),
    "",
    blocks,
  ].join("\n");
}

/** The task fields any task block in `text` shows, in `PLAN_FIELDS` order. */
function fieldsShown(text: string): PlanField[] {
  const tasks = parsePlanBlocks(text).tasks;
  const shown: Record<PlanField, (t: PlanTaskBlock) => boolean> = {
    CREATE: (t) => t.create.length > 0,
    READ: (t) => t.read.length > 0,
    UPDATE: (t) => t.update.length > 0,
    DELETE: (t) => t.delete.length > 0,
    "DEPENDS ON": (t) => t.dependsOn.length > 0,
    "DONE WHEN": (t) => (t.doneWhen ?? "") !== "",
    "TEST FIRST": (t) => (t.testFirst?.tests.length ?? 0) > 0,
    "TEST EXCEPTION": (t) => (t.testException?.tests.length ?? 0) > 0,
  };
  return PLAN_FIELDS.filter((f) => tasks.some(shown[f]));
}

describe("shipped task examples", () => {
  const CORE = path.resolve(__dirname, "../../..");
  const trackersExample = () => {
    const doc = fs.readFileSync(path.join(CORE, ".bkit/trackers.md"), "utf-8");
    const section = doc.slice(
      doc.indexOf("**Change shape syntax**"),
      doc.indexOf("**Machine-read lines**"),
    );
    return fencedText(section);
  };
  const changeFormTasks = () => {
    const form = parseYaml(
      fs.readFileSync(
        path.resolve(CORE, "../templates/.github/ISSUE_TEMPLATE/bkit-change.yml"),
        "utf-8",
      ),
    ) as { body: Array<{ id?: string; attributes: Record<string, string> }> };
    return form.body.find((b) => b.id === "tasks")!.attributes;
  };

  it("the shipped plan template's example parses", () => {
    const text = fs.readFileSync(path.join(CORE, "docs/templates/bkit-plan.md"), "utf-8");
    const check = checkPlanText(text);
    expect(check.problems).toEqual([]);
    expect(check.groups.map((g) => g.tasks)).toEqual([2]);
  });

  it("the change-shape example in trackers.md parses", () => {
    const example = trackersExample();
    expect(example).not.toBe("");
    const check = checkPlanText(asPlan(example));
    expect(check.problems).toEqual([]);
    expect(check.sizes.length).toBeGreaterThan(0);
  });

  it("change issue form example passes plan-check", () => {
    const { placeholder, description } = changeFormTasks();
    const check = checkPlanText(asPlan(placeholder!));
    expect(check.problems).toEqual([]);
    expect(fieldsShown(placeholder!)).toEqual([...PLAN_FIELDS]);
    for (const field of PLAN_FIELDS) expect(description).toContain(`**${field}**`);
    const { maxPerGroup, maxTestsPerGroup } = CONFIG_DEFAULTS.tasks;
    expect(description).toContain(
      `\`bkit.workflows.tasks.maxPerGroup\` tasks (default ${maxPerGroup})`,
    );
    expect(description).toContain(
      `\`bkit.workflows.tasks.maxTestsPerGroup\` **TEST FIRST** tests (default ${maxTestsPerGroup})`,
    );
  });

  it("trackers.md change example shows every task field", () => {
    expect(fieldsShown(trackersExample())).toEqual(fieldsShown(changeFormTasks().placeholder!));
  });

  const ROOT = path.resolve(CORE, "../..");
  const CAP_KEYS = Object.keys(CONFIG_DEFAULTS.tasks).sort();
  const capsNamed = (file: string) => taskCapDefaultsNamed(fs.readFileSync(file, "utf-8"));
  const defaultsOf = (named: { key: string; value: number }[]) =>
    named.map(({ key }) => ({ key, value: CONFIG_DEFAULTS.tasks[key as keyof TaskCaps] }));

  it.each([
    [
      "the shipped change form",
      path.resolve(CORE, "../templates/.github/ISSUE_TEMPLATE/bkit-change.yml"),
    ],
    ["this repo's change form", path.join(ROOT, ".github/ISSUE_TEMPLATE/bkit-change.yml")],
  ])("%s shows every plan cap with its settings default", (_name, file) => {
    const named = capsNamed(file);
    expect([...new Set(named.map((n) => n.key))].sort()).toEqual(CAP_KEYS);
    expect(named).toEqual(defaultsOf(named));
  });

  it.each([
    ["trackers.md", path.join(CORE, ".bkit/trackers.md")],
    ["README.md", path.join(CORE, ".bkit/README.md")],
  ])("%s shows each plan cap it names with its settings default", (_name, file) => {
    const named = capsNamed(file);
    expect(named.length).toBeGreaterThan(0);
    expect(named.every((n) => CAP_KEYS.includes(n.key))).toBe(true);
    expect(named).toEqual(defaultsOf(named));
  });

  it("this repo's change form shows the caps this repo's package.json sets", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf-8")) as {
      bkit: { workflows: { tasks: Record<string, number> } };
    };
    const named = capsNamed(path.join(ROOT, ".github/ISSUE_TEMPLATE/bkit-change.yml"));
    expect(named).toEqual(named.map(({ key }) => ({ key, value: pkg.bkit.workflows.tasks[key] })));
  });
});

describe("bkit tests plan-check", () => {
  const write = (rel: string, ...blocks: string[]) => {
    fs.mkdirSync(path.dirname(path.join(cwd, rel)), { recursive: true });
    fs.writeFileSync(path.join(cwd, rel), `# Plan\n\n${blocks.join("\n\n")}\n`);
  };
  const check = (...extra: string[]) =>
    run(["--plan=plan.md", "--log=logs/check.md", ...extra], cwd, "plan-check");
  const report = () => fs.readFileSync(path.join(cwd, "logs/check.md"), "utf-8");
  const lineOf = (rel: string, text: string) =>
    fs
      .readFileSync(path.join(cwd, rel), "utf-8")
      .split("\n")
      .findIndex((l) => l.includes(text)) + 1;
  /** A Reuse Inventory table with one NEW row per file. */
  const inventory = (...files: string[]) =>
    [
      "## Reuse Inventory",
      "",
      "| Capability | File | Search performed | Existing candidates | Decision (EXTEND/NEW) | Justification |",
      "| --- | --- | --- | --- | --- | --- |",
      ...files.map((f) => `| x | \`${f}\` | rg x | none | NEW | nothing to extend |`),
    ].join("\n");

  it("states the caps the template and workflows doc name", () => {
    const { maxPerGroup, maxTestsPerGroup, maxTestsPerTask, maxTestFilesPerTask } =
      CONFIG_DEFAULTS.tasks;
    expect([maxPerGroup, maxTestsPerGroup, maxTestsPerTask, maxTestFilesPerTask]).toEqual([
      3, 15, 10, 3,
    ]);
  });

  const coreText = (rel: string) => fs.readFileSync(path.join(getCoreRoot(), rel), "utf-8");
  const mdFiles = (dir: string) =>
    fs
      .readdirSync(path.join(getCoreRoot(), dir))
      .filter((f) => f.endsWith(".md"))
      .sort();
  const bulletOf = (lines: string[], label: string) =>
    lines.filter((l) => l.startsWith(`- **${label}:**`)).join("\n");
  /** Prompts carrying the `TEST FIRST` or `Runbook tasks` bullet, with each bullet's text. */
  const sizingPrompts = () =>
    mdFiles("prompts")
      .map((f) => {
        const lines = coreText(`prompts/${f}`).split("\n");
        return {
          name: f.slice(0, -3),
          testFirst: bulletOf(lines, "TEST FIRST"),
          runbook: bulletOf(lines, "Runbook tasks"),
        };
      })
      .filter((p) => `${p.testFirst}${p.runbook}` !== "");
  /** Each `**Subagent:** Invoke` of one of `names`, with the Context line under it. */
  const invocationsOf = (names: Set<string>) =>
    mdFiles("workflows").flatMap((f) => {
      const lines = coreText(`workflows/${f}`).split("\n");
      return lines.flatMap((l, i) =>
        [...l.matchAll(/\*\*Subagent:\*\* Invoke `@([\w-]+)`/g)]
          .filter((m) => names.has(m[1]!))
          .map((m) => ({ at: `${f}:${i + 1} @${m[1]}`, context: lines[i + 1]! })),
      );
    });

  it("every prompt that sizes a task or group takes the caps from its Context", () => {
    // A planner sizes tasks while writing them; learning the caps only at the
    // plan check costs a plan round. The caps are a setting, so no prompt pins a number.
    const sizing = sizingPrompts();
    expect(sizing.length).toBeGreaterThan(0);
    expect(
      sizing.filter((p) => /\(default \d+\)/.test(`${p.testFirst}${p.runbook}`)).map((p) => p.name),
    ).toEqual([]);
    expect(
      sizing
        .filter((p) => p.testFirst !== "")
        .filter((p) => !p.testFirst.includes("within the per-task plan caps your Context names"))
        .map((p) => p.name),
    ).toEqual([]);
    expect(
      sizing
        .filter((p) => p.runbook !== "")
        .filter((p) => !p.runbook.includes("within the per-group plan caps your Context names"))
        .map((p) => p.name),
    ).toEqual([]);
    const invocations = invocationsOf(new Set(sizing.map((p) => p.name)));
    expect(invocations.length).toBeGreaterThan(0);
    expect(
      invocations
        .filter(
          (v) =>
            !v.context.includes(
              "Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task.",
            ),
        )
        .map((v) => v.at),
    ).toEqual([]);
  });

  it("plan-check refuses a task without DONE WHEN", async () => {
    write("plan.md", groupBlock(1, okTask(1), taskBlock(2, testFirstField(1))));
    const r = await check();
    expect(r.code).toBe(1);
    const at = lineOf("plan.md", "<!-- bkit:task 2 start -->");
    expect(r.json.problems).toEqual([
      expect.objectContaining({ line: at, message: expect.stringContaining("TASK 2") }),
    ]);
    expect(report()).toContain(`\`plan.md:${at}\``);
    expect(report()).toContain("DONE WHEN");
  });

  it("plan-check refuses DEPENDS ON a later group", async () => {
    write(
      "plan.md",
      groupBlock(1, okTask(1, 1, 1, ["  - **DEPENDS ON:** TASK 2"])),
      groupBlock(2, okTask(2)),
    );
    const r = await check();
    expect(r.code).toBe(1);
    expect(r.json.problems).toEqual([
      expect.objectContaining({
        kind: "depends",
        message: expect.stringMatching(/TASK 1 depends on TASK 2.*later group/),
      }),
    ]);
    write("plan.md", groupBlock(1, okTask(1, 1, 1, ["  - **DEPENDS ON:** TASK 9"])));
    expect((await check()).json.problems[0].message).toContain("TASK 9 does not exist");
  });

  it("plan-check refuses an UPDATE symbol missing from its file", async () => {
    fs.mkdirSync(path.join(cwd, "src"));
    fs.writeFileSync(path.join(cwd, "src/a.ts"), "export function realName() {}\n");
    write(
      "plan.md",
      groupBlock(
        1,
        okTask(1, 1, 1, [
          "  - **UPDATE:** `realName` in `src/a.ts`: keep",
          "  - **UPDATE:** `inventedName` in `src/a.ts`: change",
          "  - **READ:** `src/gone.ts`: context",
        ]),
      ),
    );
    let r = await check();
    expect(r.code).toBe(1);
    expect(r.json.existence.map((e: { message: string }) => e.message)).toEqual([
      expect.stringContaining("`inventedName` is not in `src/a.ts`"),
      expect.stringContaining("`src/gone.ts` does not exist"),
    ]);
    r = await check("--existence=report");
    expect(r.code).toBe(0);
    expect(r.json.existence).toHaveLength(2);
    expect(report()).toContain("`inventedName` is not in `src/a.ts`");
    expect((await check("--existence=maybe")).code).toBe(2);
  });

  it("plan-check matches a Markdown heading symbol", async () => {
    fs.mkdirSync(path.join(cwd, "docs"));
    fs.writeFileSync(path.join(cwd, "docs/t.md"), "# Trackers\n\n## Issue shapes\n\nText.\n");
    write(
      "plan.md",
      groupBlock(
        1,
        okTask(1, 1, 1, [
          "  - **UPDATE:** § Issue shapes in `docs/t.md`: show blocks",
          "  - **READ:** `tracker.labels.ready` in `docs/t.md`: not a heading",
        ]),
      ),
    );
    const r = await check();
    expect(r.json.existence).toEqual([
      expect.objectContaining({
        message: "TASK 1: `ready` (last segment of `tracker.labels.ready`) is not in `docs/t.md`",
      }),
    ]);
    fs.appendFileSync(path.join(cwd, "docs/t.md"), "Set `tracker.labels.ready`.\n");
    expect((await check()).code).toBe(0);
  });

  it("plan-check matches a heading exactly, in a CRLF file too", async () => {
    fs.mkdirSync(path.join(cwd, "docs"));
    fs.writeFileSync(path.join(cwd, "docs/w.md"), "# W\r\n\r\n## Step 10\r\n\r\n## Step 2 ##\r\n");
    write(
      "plan.md",
      groupBlock(
        1,
        okTask(1, 1, 1, [
          "  - **UPDATE:** § Step 1 in `docs/w.md`: not Step 10",
          "  - **UPDATE:** § Step 2 in `docs/w.md`: closing hashes",
          "  - **UPDATE:** § Step 10 in `docs/w.md`: there",
        ]),
      ),
    );
    expect((await check()).json.existence.map((e: { message: string }) => e.message)).toEqual([
      "TASK 1: no heading `Step 1` in `docs/w.md`",
    ]);
  });

  it("plan-check walks a dotted key through indented JSON, YAML and TOML", async () => {
    fs.writeFileSync(
      path.join(cwd, "conf.json"),
      JSON.stringify(
        { bkit: { workflows: { tasks: { maxPerGroup: 3 } } }, other: { maxTestsPerTask: 1 } },
        null,
        2,
      ),
    );
    fs.writeFileSync(
      path.join(cwd, "conf.yml"),
      "bkit:\n  workflows:\n    tasks:\n      maxPerGroup: 3\nlimit: 1\n",
    );
    fs.writeFileSync(path.join(cwd, "conf.toml"), "[bkit.workflows.tasks]\nmaxPerGroup = 3\n");
    write(
      "plan.md",
      groupBlock(
        1,
        okTask(1, 1, 1, [
          "  - **READ:** `bkit.workflows.tasks.maxPerGroup` in `conf.json`: there",
          "  - **READ:** `bkit.workflows.tasks.maxTestsPerTask` in `conf.json`: only elsewhere",
          "  - **READ:** `bkit.workflows.tasks.maxPerGroup` in `conf.yml`: nested",
          "  - **READ:** `bkit.limit` in `conf.yml`: segments out of place",
          "  - **READ:** `bkit.workflows.tasks.maxPerGroup` in `conf.toml`: table and key",
          "  - **READ:** `bkit.maxPerGroup` in `conf.toml`: no such table",
        ]),
      ),
    );
    expect((await check()).json.existence.map((e: { message: string }) => e.message)).toEqual([
      "TASK 1: `bkit.workflows.tasks.maxTestsPerTask` is not in `conf.json`",
      "TASK 1: `bkit.limit` is not in `conf.yml`",
      "TASK 1: `bkit.maxPerGroup` is not in `conf.toml`",
    ]);
  });

  it("plan-check matches a dotted symbol in code on its last segment, and parses one-line JSON", async () => {
    fs.mkdirSync(path.join(cwd, "src"));
    fs.writeFileSync(
      path.join(cwd, "src/settings.ts"),
      "export const CONFIG_DEFAULTS = { tasks: { maxPerGroup: 3 } };\n",
    );
    fs.writeFileSync(
      path.join(cwd, "compact.json"),
      '{"bkit":{"workflows":{"tasks":{"maxPerGroup":3}}}}\n',
    );
    fs.writeFileSync(
      path.join(cwd, "package.json"),
      JSON.stringify({ bkit: { workflows: { tasks: { maxPerGroup: 3 } } } }, null, 2),
    );
    write(
      "plan.md",
      groupBlock(
        1,
        okTask(1, 1, 1, [
          "  - **UPDATE:** `CONFIG_DEFAULTS.tasks.maxPerGroup` in `src/settings.ts`: nested member",
          "  - **UPDATE:** `CONFIG_DEFAULTS.tasks.gone` in `src/settings.ts`: no such member",
          "  - **READ:** `bkit.workflows.tasks.maxPerGroup` in `compact.json`: one line",
          "  - **READ:** `bkit.nonsense.tasks` in `package.json`: segments out of place",
        ]),
      ),
    );
    expect((await check()).json.existence.map((e: { message: string }) => e.message)).toEqual([
      "TASK 1: `gone` (last segment of `CONFIG_DEFAULTS.tasks.gone`) is not in `src/settings.ts`",
      "TASK 1: `bkit.nonsense.tasks` is not in `package.json`",
    ]);
  });

  it("plan-check skips existence on ticked tasks", async () => {
    fs.mkdirSync(path.join(cwd, "src"));
    fs.writeFileSync(path.join(cwd, "src/a.ts"), "export function renamed() {}\n");
    write(
      "plan.md",
      groupBlock(1, okTask(1, 1, 1, ["  - **UPDATE:** `oldName` in `src/a.ts`: rename"], "x")),
    );
    const r = await check();
    expect(r.code).toBe(0);
    expect(r.json.existence).toEqual([]);
  });

  it("plan-check refuses CREATE without a Reuse Inventory NEW row", async () => {
    const create = ["  - **CREATE:** `countThreads` in `src/threads.ts`: count open threads"];
    write("plan.md", groupBlock(1, okTask(1, 1, 1, create)));
    let r = await check();
    expect(r.code).toBe(1);
    expect(r.json.problems).toEqual([
      expect.objectContaining({
        kind: "inventory",
        message: expect.stringContaining("`src/threads.ts`"),
      }),
    ]);
    write("plan.md", inventory("src/threads.ts"), groupBlock(1, okTask(1, 1, 1, create)));
    r = await check();
    expect(r.code).toBe(0);
  });

  it("plan-check refuses a group with 4 tasks", async () => {
    write("plan.md", groupBlock(1, okTask(1), okTask(2), okTask(3), okTask(4)));
    const r = await check();
    expect(r.code).toBe(1);
    expect(r.json.problems).toEqual([
      expect.objectContaining({ kind: "cap", line: lineOf("plan.md", "bkit:group 1 start") }),
    ]);
    expect(report()).toContain("GROUP 1 has 4 tasks, over the cap of 3");
  });

  it("plan-check refuses a group with 16 planned tests", async () => {
    write("plan.md", groupBlock(1, okTask(1, 8, 2), okTask(2, 8, 2)));
    const r = await check();
    expect(r.code).toBe(1);
    expect(report()).toContain("GROUP 1 has 16 TEST FIRST tests, over the cap of 15");
  });

  it("plan-check accepts 3 tasks and 15 tests in one group", async () => {
    write("plan.md", groupBlock(1, okTask(1, 5, 3), okTask(2, 5, 3), okTask(3, 5, 3)));
    const r = await check();
    expect(r.code).toBe(0);
    expect(r.json.problems).toEqual([]);
    expect(r.json.groups).toEqual([expect.objectContaining({ group: 1, tasks: 3, tests: 15 })]);
  });

  it("plan-check report lists groups, not a verdict", async () => {
    write("plan.md", groupBlock(1, okTask(1), okTask(2)), groupBlock(2, okTask(3)));
    const r = await check();
    expect(r.code).toBe(0);
    expect(r.json).not.toHaveProperty("verdict");
    expect(report()).not.toMatch(/^Verdict:/m);
    expect(report()).toMatch(/^Problems: 0\nExistence: 0\n\n<!-- verdict:end -->/);
    expect(report()).toContain("| Group | Title | Tasks | TEST FIRST tests | KB |");
    expect(report()).toMatch(/\| 1 \| Group 1 \| 2 \| 2 \| \d+\.\d \|/);
    expect(report()).toMatch(/\| 2 \| Group 2 \| 1 \| 1 \| \d+\.\d \|/);
  });

  it("plan-check refuses a task over the per-task caps, naming the task and the cap", async () => {
    write("plan.md", groupBlock(1, okTask(1, 11, 1)), groupBlock(2, okTask(2, 4, 4)));
    const r = await check();
    expect(r.code).toBe(1);
    expect(report()).toContain("TASK 1 names 11 TEST FIRST tests, over the cap of 10");
    expect(report()).toContain("TASK 2 names 4 test files, over the cap of 3");
  });

  it("plan-check follows bkit.workflows.tasks", async () => {
    const tasks = {
      maxPerGroup: 4,
      maxTestsPerGroup: 20,
      maxTestsPerTask: 12,
      maxTestFilesPerTask: 4,
    };
    fs.writeFileSync(
      path.join(cwd, "package.json"),
      JSON.stringify({ bkit: { workflows: { tasks } } }),
    );
    // Each raised value is accepted: 4 tasks and 20 tests in a group, 12 tests and 4 files in a task.
    write(
      "plan.md",
      groupBlock(1, okTask(1, 12, 4), okTask(2, 4, 1), okTask(3, 2, 1), okTask(4, 2, 1)),
    );
    let r = await check();
    expect(r.json.problems).toEqual([]);
    expect(r.code).toBe(0);
    expect(report()).toContain(
      "Caps: 4 tasks and 20 TEST FIRST tests per group; 12 tests across 4 test files per task.",
    );
    // One above each is refused.
    write(
      "plan.md",
      groupBlock(1, okTask(1), okTask(2), okTask(3), okTask(4), okTask(5)),
      groupBlock(2, okTask(6, 11, 1), okTask(7, 10, 1)),
      groupBlock(3, okTask(8, 13, 1)),
      groupBlock(4, okTask(9, 5, 5)),
    );
    r = await check();
    expect(r.code).toBe(1);
    expect(r.json.problems.map((p: { message: string }) => p.message)).toEqual([
      "GROUP 1 has 5 tasks, over the cap of 4",
      "GROUP 2 has 21 TEST FIRST tests, over the cap of 20",
      "TASK 8 names 13 TEST FIRST tests, over the cap of 12",
      "TASK 9 names 5 test files, over the cap of 4",
    ]);
  });

  it("plan-check refuses task-like text outside a block and a plan with no task markers", async () => {
    write("plan.md", groupBlock(1, okTask(1)), "## Notes", "**TEST FIRST:** `x.test.ts` `loose`.");
    let r = await check();
    expect(r.code).toBe(1);
    expect(r.json.problems).toEqual([
      expect.objectContaining({ kind: "stray", line: lineOf("plan.md", "`loose`") }),
    ]);
    write("plan.md", "- [ ] **Task 1:** Old. **Done when:** x. **Test first:** n/a — docs.");
    r = await check();
    expect(r.code).toBe(1);
    expect(r.json.problems.map((p: { message: string }) => p.message)).toContainEqual(
      expect.stringContaining("no task markers"),
    );
  });

  it("a missing plan file is a usage error", async () => {
    expect((await check()).code).toBe(2);
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
        "--group=1",
        "--task=1",
        `--test=${TEST}`,
        `--name=${NAME}`,
        `--log=${RED_LOG}`,
        ...extra,
      ],
      cwd,
      "red",
    );
  const green = (plan = "plan.md", extra: string[] = []) =>
    run(
      [
        `--file=${STATUS}`,
        "--workflow=build",
        "--group=1",
        `--plan=${plan}`,
        "--log=logs/green.md",
        ...extra,
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
  /** plan.md holding `tasks` in GROUP 1, then `after` outside every block. */
  const writePlan = (tasks: string[], after: string[] = []) =>
    fs.writeFileSync(
      path.join(cwd, "plan.md"),
      `# Plan\n\n${[groupBlock(1, ...tasks), ...after].join("\n")}\n`,
    );
  /** A task block naming `tests` (file, name) in TEST FIRST, then `extra` fields. */
  const testTask = (n: number, tests: Array<[string, string]>, extra: string[] = []) =>
    taskBlock(n, [
      "  - **DONE WHEN:** passes",
      "  - **TEST FIRST:**",
      ...tests.map(([file, name]) => `    - \`${file}\` \`${name}\` fails on the stub`),
      ...extra,
    ]);
  const TASK_1 = testTask(1, [[TEST, NAME]]);

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
      group: 1,
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

  it("green: not enforced (exit 0, report says why) when the test-file script is undeclared", async () => {
    checkout(scripts({ test: "x" }));
    writePlan([TASK_1]);
    const r = await green();
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ enforced: false });
    expect(r.json.reason).toContain("not declared");
    expect(report()).toContain("Enforced: false");
  });

  it("green refuses a plan with no task markers", async () => {
    fs.writeFileSync(
      path.join(cwd, "plan.md"),
      `# Plan\n\n- [ ] **Task 1:** Old plan. **Done when:** done. **Test first:** \`${TEST}\` \`${NAME}\` fails.\n`,
    );
    let r = await green();
    expect(r.code).toBe(1);
    expect(r.json).toMatchObject({ enforced: false });
    expect(r.json.reason).toBe(
      "this plan has no task markers; run /bkit-build again to convert it",
    );
    expect(report()).toContain("run /bkit-build again to convert it");
    r = await green("missing.md");
    expect(r.code).toBe(1);
    expect(r.json.reason).toContain("run /bkit-build again to convert");
  });

  it("green: task-like text outside every block is a plan-level gap, and the rest is still audited", async () => {
    writePlan([TASK_1], ["", "**TEST FIRST:** `src/other.test.ts` `lost` fails."]);
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
    expect((await red()).code).toBe(0);
    vi.stubEnv("FAKE_EXIT", "0");
    vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
    let r = await green();
    expect(r.code).toBe(1);
    expect(r.json).toMatchObject({ enforced: true, testOrderOnly: false });
    expect(r.json.gaps).toEqual([
      expect.objectContaining({ task: null, kind: "test-first-unread" }),
    ]);
    const lines = fs.readFileSync(path.join(cwd, "plan.md"), "utf-8").split("\n");
    expect(r.json.gaps[0].detail).toContain(
      `\`plan.md:${lines.findIndex((l) => l.includes("lost")) + 1}\``,
    );
    expect(report()).toContain("- Plan `test-first-unread`");
    writePlan([taskBlock(1, ["  - **DONE WHEN:** done"])], ["**TEST FIRST:** `a` `b` fails."]);
    r = await green();
    expect(r.json.enforced).toBe(true);
    expect(r.json.gaps.map((g: { kind: string }) => g.kind)).toEqual([
      "no-test-first",
      "test-first-unread",
    ]);
  });

  it("green: --group audits only that group's tasks", async () => {
    fs.writeFileSync(
      path.join(cwd, "plan.md"),
      `# Plan\n\n${groupBlock(1, TASK_1)}\n\n${groupBlock(2, testTask(2, [[TEST, "second"]]))}\n`,
    );
    vi.stubEnv("FAKE_EXIT", "0");
    vi.stubEnv("FAKE_JUNIT", junit(passed(NAME), passed("second")));
    fs.mkdirSync(path.join(cwd, "logs"), { recursive: true });
    fs.writeFileSync(path.join(cwd, STATUS), "");
    const at = async (group: string) =>
      (
        await run(
          [
            `--file=${STATUS}`,
            "--workflow=build",
            `--group=${group}`,
            "--plan=plan.md",
            "--log=logs/green.md",
          ],
          cwd,
          "green",
        )
      ).json.gaps.map((g: { task: number }) => g.task);
    expect(await at("1")).toEqual([1]);
    expect(await at("2")).toEqual([2]);
  });

  it("green: --group naming a group with no tasks is refused", async () => {
    writePlan([TASK_1], [groupBlock(2)]);
    const at = (group: string) =>
      run(
        [
          `--file=${STATUS}`,
          "--workflow=build",
          `--group=${group}`,
          "--plan=plan.md",
          "--log=logs/green.md",
        ],
        cwd,
        "green",
      );
    let r = await at("2");
    expect(r.code).toBe(2);
    expect(r.err).toContain("GROUP 2 has no tasks");
    r = await at("7");
    expect(r.code).toBe(2);
    expect(r.err).toContain("the plan has no GROUP 7");
  });

  it("green: a code fence never closed is the reason, not missing task markers", async () => {
    fs.writeFileSync(path.join(cwd, "plan.md"), `# Plan\n\n\`\`\`text\n${groupBlock(1, TASK_1)}\n`);
    const r = await green();
    expect(r.code).toBe(1);
    expect(r.json.reason).toBe(
      "the code fence at line 3 is never closed; nothing after it is read",
    );
  });

  it("green: a DELETE still referenced in the tree is a delete-still-referenced gap", async () => {
    fs.writeFileSync(path.join(cwd, "src/gate.ts"), "export const kept = 1;\n");
    fs.writeFileSync(
      path.join(cwd, "src/use.ts"),
      'import { kept } from "./gate.js";\nimport "./legacyShim.js";\noldGate(kept);\nmovedFn();\n',
    );
    fs.writeFileSync(path.join(cwd, "src/still.ts"), "export {};\n");
    fs.mkdirSync(path.join(cwd, "docs"));
    fs.writeFileSync(path.join(cwd, "docs/d.md"), "# D\n\n## Old section\n");
    writePlan([
      testTask(
        1,
        [[TEST, NAME]],
        [
          "  - **DELETE:**",
          "    - `oldGate` in `src/gate.ts`: replaced",
          "    - `goneName` in `src/gate.ts`: unused",
          "    - `src/legacyShim.ts`: gone",
          "    - `src/still.ts`: gone",
          "    - § Old section in `docs/d.md`: gone",
          "    - `movedFn` in `src/gate.ts`: moves to b.ts",
          "  - **CREATE:** `movedFn` in `src/b.ts`: moved here",
        ],
      ),
    ]);
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
    expect((await red()).code).toBe(0);
    vi.stubEnv("FAKE_EXIT", "0");
    vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
    const r = await green();
    expect(r.code).toBe(1);
    expect(r.json.testOrderOnly).toBe(false);
    expect(r.json.gaps).toEqual([
      {
        task: 1,
        kind: "delete-still-referenced",
        detail: "DELETE `oldGate` in `src/gate.ts` is still referenced: `src/use.ts:3`",
        fixable: null,
        logLine: "TASK 1: delete-still-referenced — Fixable: null",
      },
      {
        task: 1,
        kind: "delete-still-referenced",
        detail: "DELETE `src/legacyShim.ts` is still referenced as `legacyShim`: `src/use.ts:2`",
        fixable: null,
        logLine: "TASK 1: delete-still-referenced — Fixable: null",
      },
      {
        task: 1,
        kind: "delete-still-referenced",
        detail: "DELETE `src/still.ts`: the file still exists",
        fixable: null,
        logLine: "TASK 1: delete-still-referenced — Fixable: null",
      },
      {
        task: 1,
        kind: "delete-still-referenced",
        detail: "DELETE § Old section in `docs/d.md` is still referenced: `docs/d.md:3`",
        fixable: null,
        logLine: "TASK 1: delete-still-referenced — Fixable: null",
      },
    ]);
    expect(r.json.verdict).toBe(null);
    expect(report()).toContain("- Task 1 `delete-still-referenced` — DELETE `oldGate`");
  });

  it("green: a file moved to a CREATE of the same name is referenced only by imports of the old path", async () => {
    fs.mkdirSync(path.join(cwd, "src/new"));
    fs.writeFileSync(path.join(cwd, "src/new/moved.ts"), "// moved here\nexport const m = 1;\n");
    fs.writeFileSync(path.join(cwd, "src/new/sib.ts"), 'import { m } from "./moved.js";\n');
    fs.writeFileSync(path.join(cwd, "src/consumer.ts"), 'import { m } from "./new/moved.js";\n');
    writePlan([
      testTask(
        1,
        [[TEST, NAME]],
        [
          "  - **DELETE:** `src/moved.ts`: moves to src/new",
          "  - **CREATE:** `src/new/moved.ts`: moved here",
        ],
      ),
    ]);
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
    expect((await red()).code).toBe(0);
    vi.stubEnv("FAKE_EXIT", "0");
    vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
    let r = await green();
    expect(r.json.gaps).toEqual([]);
    fs.writeFileSync(path.join(cwd, "src/stale.ts"), 'import { m } from "./moved.js";\n');
    r = await green();
    expect(r.json.gaps).toEqual([
      {
        task: 1,
        kind: "delete-still-referenced",
        detail: "DELETE `src/moved.ts` is still referenced as `moved`: `src/stale.ts:1`",
        fixable: null,
        logLine: "TASK 1: delete-still-referenced — Fixable: null",
      },
    ]);
  });

  it("green with no gaps prints verdict PASS and an empty gaps", async () => {
    writePlan([
      TASK_1,
      taskBlock(2, ["  - **DONE WHEN:** done", "  - **TEST FIRST:** n/a — docs."]),
    ]);
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
    expect((await red()).code).toBe(0);
    vi.stubEnv("FAKE_EXIT", "0");
    vi.stubEnv("FAKE_JUNIT", junit(passed(`clamp > ${NAME}`)));
    const r = await green();
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ enforced: true, gaps: [], verdict: "PASS" });
    expect(report()).toContain("Gaps: 0");
    expect(report()).toContain("Verdict: PASS");
    expect(report()).toContain("| 1 |");
  });

  it("green prints a verdict and a fixable per gap", async () => {
    const OTHER = "src/range.test.ts";
    writePlan([TASK_1, testTask(2, [[TEST, "second"]]), testTask(3, [[OTHER, "third"]])]);
    fs.writeFileSync(path.join(cwd, OTHER), "expect(clamp(0, 1, 10)).toBe(1);\n");
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
    expect((await red()).code).toBe(0);
    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME), failed("third")));
    const thirdRed = await run(
      [
        `--file=${STATUS}`,
        "--workflow=build",
        "--group=1",
        "--task=3",
        `--test=${OTHER}`,
        "--name=third",
        "--log=logs/build-task-red-1-3.md",
      ],
      cwd,
      "red",
    );
    expect(thirdRed.code).toBe(0);
    fs.writeFileSync(path.join(cwd, OTHER), "expect(clamp(9, 1, 10)).toBe(9);\n");
    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME), passed("second"), passed("third")));
    const r = await green();
    expect(r.code).toBe(1);
    expect(r.json.verdict).toBe(null);
    expect(
      (r.json.gaps as Array<{ kind: string; fixable: boolean | null }>).map(
        (g) => `${g.kind}:${g.fixable}`,
      ),
    ).toEqual(["not-green:true", "no-red:false", "test-changed:null"]);
    expect(report()).toContain("Verdict: null");
    expect(report()).toContain(`TASK 1: \`${TEST}\` \`${NAME}\` — not-green — Fixable: true`);
    expect(report()).toContain("Fixable: false");
    expect(report()).toContain("Fixable: null");
  });

  it("green verdict is FAIL when a gap is unfixable", async () => {
    writePlan([testTask(1, [[TEST, NAME]])]);
    fs.mkdirSync(path.join(cwd, "logs"), { recursive: true });
    fs.writeFileSync(
      path.join(cwd, STATUS),
      `${JSON.stringify({ type: "step-done", workflow: "build", step: "build-worktree-setup", status: "DONE", artifacts: [] })}\n`,
    );
    vi.stubEnv("FAKE_EXIT", "0");
    vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
    const r = await green();
    expect(r.code).toBe(1);
    expect(r.json.verdict).toBe("FAIL");
    expect((r.json.gaps as Array<{ kind: string; fixable: boolean }>)[0]).toMatchObject({
      kind: "no-red",
      fixable: false,
    });
    expect(report()).toContain("Verdict: FAIL");
  });

  it("green leaves a diff-reading kind fixable null", async () => {
    writePlan([testTask(1, [[TEST, "planned name"]])]);
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
    expect((await red()).code).toBe(0);
    vi.stubEnv("FAKE_JUNIT", junit(passed("planned name")));
    const r = await green();
    const gaps = r.json.gaps as Array<{ kind: string; fixable: boolean | null }>;
    expect(gaps.map((g) => g.kind)).toEqual(["red-mismatch"]);
    expect(gaps[0]!.fixable).toBe(null);
    expect(r.json.verdict).toBe(null);
  });

  it("green prints verdict null when a gap needs a diff read", async () => {
    writePlan([TASK_1]);
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
    expect((await red()).code).toBe(0);
    fs.writeFileSync(path.join(cwd, TEST), "expect(true).toBe(true);\n");
    vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
    const r = await green();
    expect(r.code).toBe(1);
    expect((r.json.gaps as Array<{ kind: string }>).map((g) => g.kind)).toEqual(["test-changed"]);
    expect(r.json.verdict).toBe(null);
    expect(report()).toContain("Verdict: null");
  });

  it("green: lists each gap kind, with the diff for a test changed since its red", async () => {
    writePlan([
      TASK_1,
      testTask(2, [[TEST, "second"]]),
      taskBlock(3, ["  - **DONE WHEN:** x"]),
      taskBlock(4, ["  - **DONE WHEN:** x", "  - **TEST FIRST:**", "    - `only-one`."]),
    ]);
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
    writePlan([testTask(1, [[TEST, "planned name"]])]);
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
    writePlan([testTask(1, [["src/old/clamp.test.ts", NAME]])]);
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
          "--group=1",
          "--task=1",
          `--test=${TEST}`,
          `--name=${name}`,
          `--log=logs/build-task-red-1-1-${n}.md`,
        ],
        cwd,
        "red",
      );
    writePlan([
      testTask(1, [
        [TEST, "clamps low"],
        [TEST, "clamps high"],
        [TEST, "clamps nan"],
      ]),
    ]);
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
        group: 1,
        attempt: 1,
      });
      fs.writeFileSync(path.join(cwd, "logs/build-plan-execute-1-log.md"), log);
      return commit("chore(1-x): plan-execute group 1");
    };
    const kinds = (r: { json: Record<string, unknown> }) =>
      (r.json.gaps as Array<{ kind: string }>).map((g) => g.kind);
    const EXCEPTION = `  - **TEST EXCEPTION:** \`${TEST}\` \`${NAME}\` — code landed before its test; approved by the owner.`;

    it("green finds the code commit for DONE — TASK N", async () => {
      for (const done of [
        "DONE — TASK 1: Clamp — implemented\n",
        "DONE — Task 1: Clamp — implemented\n",
      ]) {
        fs.rmSync(path.join(cwd, "logs"), { recursive: true, force: true });
        writePlan([TASK_1]);
        commit("plan");
        const code = finishExecute(done);
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
        expect(gap!.detail).toContain("plan-execute log records TASK 1 DONE");
        expect(r.json.testOrderOnly).toBe(true);
        expect(report()).toContain("Test order only: true");
      }
    });

    it("a red recorded before the task's code commit stands, across a resumed execute", async () => {
      writePlan([TASK_1]);
      commit("plan");
      finishExecute("BLOCKED — TASK 1: Clamp — turn cap\n");
      vi.stubEnv("FAKE_EXIT", "1");
      vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
      expect((await red()).code).toBe(0);
      finishExecute("DONE — TASK 1: Clamp — implemented\n");
      vi.stubEnv("FAKE_EXIT", "0");
      vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
      const r = await green();
      expect(r.code).toBe(0);
      expect(r.json).toMatchObject({ gaps: [], testOrderOnly: false, lateRedUnchecked: [] });
      expect(report()).not.toContain("## Late-red check");
    });

    it("a task with a red but no plan-execute commit recording it DONE is reported as late-red not checked", async () => {
      writePlan([TASK_1]);
      commit("plan");
      vi.stubEnv("FAKE_EXIT", "1");
      vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
      expect((await red()).code).toBe(0);
      finishExecute("- DONE — TASK 1: Clamp — implemented\n");
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

    it("green emits a test-changed gap for a red whose test gained added lines only", async () => {
      writePlan([TASK_1]);
      vi.stubEnv("FAKE_EXIT", "1");
      vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
      expect((await red()).code).toBe(0);
      fs.appendFileSync(path.join(cwd, TEST), "\nexpect(clamp(0, 1, 10)).toBe(1);\n");
      vi.stubEnv("FAKE_EXIT", "0");
      vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
      const r = await green();
      expect(r.code).toBe(1);
      expect(r.json.gaps).toEqual([
        expect.objectContaining({ task: 1, kind: "test-changed", fixable: null }),
      ]);
      expect(r.json.verdict).toBe(null);
      expect(report()).toContain("| added lines only |");
      expect(report()).toContain("+expect(clamp(0, 1, 10)).toBe(1);");
    });

    it("green reads a TEST EXCEPTION field inside the block: it clears test-order gaps only from a human-made commit, never not-green", async () => {
      writePlan([testTask(1, [[TEST, NAME]], [EXCEPTION])]);
      statusRow({ step: "build-worktree-setup", artifacts: [] });
      vi.stubEnv("FAKE_EXIT", "0");
      vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
      let r = await green();
      expect(kinds(r)).toEqual(["no-red"]);
      expect(report()).toContain("not honoured");
      expect(report()).toContain("not committed");

      statusRow({ step: "build-plan-verify", artifacts: [] });
      const stepCommit = commit("chore(1-x): plan-verify group 1 attempt 1");
      r = await green();
      expect(kinds(r)).toEqual(["no-red"]);
      expect(report()).toContain(stepCommit.slice(0, 7));
      expect(report()).toContain("workflow step commit");

      writePlan([
        testTask(1, [[TEST, NAME]], [EXCEPTION.replace("the owner.", "the owner 2026-10-22.")]),
      ]);
      commit("docs(1-x): accept test order for TASK 1", ["plan.md"]);
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

    const EXCEPTION_ONLY = taskBlock(1, [
      "  - **DONE WHEN:** the generated file exists",
      "  - **TEST EXCEPTION:** a generated file; no test can fail first.",
    ]);

    it("green refuses an exception-only task from a workflow step commit", async () => {
      writePlan([EXCEPTION_ONLY]);
      statusRow({ step: "build-plan-convert", artifacts: ["plan.md"] });
      const stepCommit = commit("chore(1-x): plan-convert attempt 1");
      const r = await green();
      expect(r.code).toBe(1);
      expect(kinds(r)).toEqual(["exception-refused"]);
      expect(r.json.testOrderOnly).toBe(false);
      expect(report()).toContain("- Task 1 — not honoured:");
      expect(report()).toContain(stepCommit.slice(0, 7));
      expect(report()).toContain("workflow step commit");

      writePlan([
        taskBlock(1, ["  - **DONE WHEN:** written", "  - **TEST FIRST:** n/a — docs only."]),
      ]);
      statusRow({ step: "build-plan-convert", artifacts: ["plan.md"] });
      commit("chore(1-x): plan-convert attempt 2");
      const plain = await green();
      expect(plain.code).toBe(0);
      expect(plain.json.gaps).toEqual([]);
      expect(report()).not.toContain("## Test exceptions");
    });

    it("green clears an exception-only task from a human commit", async () => {
      writePlan([EXCEPTION_ONLY]);
      statusRow({ step: "build-worktree-setup", artifacts: [] });
      let r = await green();
      expect(kinds(r)).toEqual(["exception-refused"]);
      expect(report()).toContain("not committed");

      commit("docs(1-x): test exception accepted by owner", ["plan.md"]);
      r = await green();
      expect(r.code).toBe(0);
      expect(r.json.gaps).toEqual([]);
      expect(report()).toMatch(/- Task 1 — honoured; cleared /);
    });
  });
});
