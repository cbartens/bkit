import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parse as parseYaml } from "yaml";

import { PLAN_FIELDS, parsePlanBlocks, type PlanField, type PlanTaskBlock } from "./plan-blocks";
import {
  BKIT_BUILD_GATES,
  BKIT_DEBUG_GATES,
  BKIT_LINT_FILE_SCRIPT,
  BKIT_TEST_FILE_SCRIPT,
} from "../../install/manifest";
import { runCommand } from "../lib";
import { PACKAGE_RUNNER } from "../../shared/package-manager";
import { CONFIG_DEFAULTS, type TaskCaps } from "../../shared/settings";
import { getCoreRoot } from "../../shared/package-roots";
import { taskCapDefaultsNamed } from "../../checks/before/repo";
import {
  blockHash,
  checkPlanText,
  classifyLockExit,
  gateScope,
  judgeGreen,
  judgeRed,
  parseJunit,
  readTestFirst,
  redEntries,
  resolveGate,
  taskSizes,
  lineDiff,
  testBlock,
  testSpan,
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
 * then exits FAKE_EXIT. Asked for bkit:lint:file, it exits FAKE_LINT_EXIT (default 0) after the echoes.
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
      'printf "wait=%s who=%s\\n" "$LOCAL_STACK_LOCK_WAIT_S" "$LOCAL_STACK_LOCK_WHO"\n' +
      'if [ "$1" = "bkit:lint:file" ]; then exit "${FAKE_LINT_EXIT:-0}"; fi\n' +
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

function ciRoundFixture() {
  const selection = {
    mode: "ci",
    provider: "github",
    repo: "example/example",
    runId: "123",
    runAttempt: 2,
    runUrl: "https://github.com/example/example/actions/runs/123/attempts/2",
    workflowId: "456",
    workflowPath: ".github/workflows/consumer-ci.yml",
    headBranch: "fix/ci",
    headSha: "a".repeat(40),
    conclusion: "failure",
    redTiers: ["integration"],
    via: "prompt-run",
  };
  const file = path.join(cwd, "status.jsonl");
  fs.writeFileSync(
    file,
    [
      { type: "workflow-started", workflow: "debug", at: "2026-10-01T00:00:00Z" },
      {
        type: "workflow-meta",
        workflow: "debug",
        at: "2026-10-01T00:00:01Z",
        ciSelection: selection,
        ciGeneration: 2,
      },
    ]
      .map((row) => JSON.stringify(row))
      .join("\n") + "\n",
  );
  const marker = path.join(cwd, "local-gate-ran");
  fs.rmSync(marker, { force: true });
  fs.writeFileSync(
    path.join(bin, PACKAGE_RUNNER),
    `#!/bin/sh\necho "$1" >> '${marker}'\nexit 0\n`,
    { mode: 0o755 },
  );
  const args = [
    ...BUILD,
    `--file=${file}`,
    "--workflow=debug",
    "--step=debug-run-tests",
    "--attempt=1",
    "--ci-run=123",
    `--ci-url=${selection.runUrl}`,
    "--artifact=docs/plans/202611/logs/1-x/run-tests-1.md",
    "--fid=1-x",
  ];
  const append = (row: object) => fs.appendFileSync(file, JSON.stringify(row) + "\n");
  const fix = (generation: number, step = "debug-failure-remediate", status = "DONE") =>
    append({
      type: "step-done",
      workflow: "debug",
      step,
      status,
      at: "2026-10-01T00:01:00Z",
      parentSha: selection.headSha,
      artifacts: [],
      ciGeneration: generation,
    });
  return { file, marker, selection, args, append, fix };
}

describe("CI evidence test rounds", () => {
  it("records a CI evidence round without executing a local gate", async () => {
    const f = ciRoundFixture();
    const result = await run(f.args);
    expect(result.code).toBe(1);
    expect(result.json).toMatchObject({
      source: "ci",
      verdict: "FAIL",
      scope: "ci:123",
      gate: null,
      exitCode: null,
      failures: null,
      runAttempt: 2,
      ciGeneration: 2,
    });
    expect(result.json.row).toMatchObject({
      type: "test-run",
      workflow: "debug",
      step: "debug-run-tests",
      source: "ci",
      verdict: "FAIL",
      scope: "ci:123",
      exitCode: null,
      failures: null,
      ciRun: "123",
      runAttempt: 2,
      ciGeneration: 2,
    });
    expect(fs.existsSync(f.marker)).toBe(false);
    const artifact = fs.readFileSync(path.join(cwd, result.json.artifact), "utf-8");
    expect(artifact).toContain(f.selection.repo);
    expect(artifact).toContain(f.selection.workflowPath);
    expect(artifact).toContain(f.selection.headSha);
    expect(artifact).toContain(f.selection.runUrl);
    expect(artifact).toMatch(/local.+(?:not run|not executed)|(?:not run|not executed).+local/i);
    expect(result.json.clamp).toBeNull();
  });

  it("runs local gates only after current-generation remediation or soak", async () => {
    const f = ciRoundFixture();
    f.fix(1);
    expect((await run(f.args)).json.source).toBe("ci");
    expect(fs.existsSync(f.marker)).toBe(false);
    f.fix(2, "debug-failure-remediate", "FAILED");
    expect((await run(f.args)).json.source).toBe("ci");
    expect(fs.existsSync(f.marker)).toBe(false);
    f.fix(2);
    const checked = await run(f.args);
    expect(checked.code).toBe(0);
    expect(checked.json).toMatchObject({
      source: "local",
      verdict: "PASS",
      exitCode: 0,
      gate: DEEP,
    });
    expect(fs.readFileSync(f.marker, "utf-8")).toContain(DEEP);
    const soak = ciRoundFixture();
    soak.fix(2, "debug-failure-soak");
    expect((await run(soak.args)).json.source).toBe("local");
    expect(fs.existsSync(soak.marker)).toBe(true);
  });

  it("rejects CI rounds without active matching debug selection", async () => {
    const f = ciRoundFixture();
    expect((await run(f.args)).code).toBe(1);
    expect((await run(f.args.filter((arg) => !arg.startsWith("--file=")))).code).toBe(2);
    expect(
      (await run([...f.args.filter((arg) => !arg.startsWith("--ci-run=")), "--ci-run=999"])).code,
    ).toBe(2);
    expect(
      (
        await run([
          ...f.args.filter((arg) => !arg.startsWith("--ci-url=")),
          "--ci-url=https://github.com/other/repo/actions/runs/123/attempts/2",
        ])
      ).code,
    ).toBe(2);
    f.append({ type: "workflow-done", workflow: "debug", at: "2026-10-01T00:02:00Z" });
    expect((await run(f.args)).code).toBe(2);
    fs.writeFileSync(
      f.file,
      JSON.stringify({ type: "workflow-started", workflow: "debug", at: "2026-10-01T00:00:00Z" }) +
        "\n",
    );
    expect((await run(f.args)).code).toBe(2);
    expect(fs.existsSync(f.marker)).toBe(false);
    expect(fs.readFileSync(f.file, "utf-8")).not.toContain('"type":"test-run"');
  });
});

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
  it("a 75 exit is a lock wait only when the log's give-up line names the tests lock and this run", () => {
    const who = "bkit tests run bkit:gate:static-unit";
    const log = `[machine-lock] ❌ ${who} gave up after 0s waiting for tests, in use by another agent — /tmp/checkout (pid 123, since 12:00:00), no earlier run\n`;
    expect(classifyLockExit({ exitCode: 75, log, who })).toBe("lock-wait");
    expect(classifyLockExit({ exitCode: 75, log, who: who + " other" })).toBe("gate");
    expect(classifyLockExit({ exitCode: 1, log, who })).toBe("gate");
    expect(classifyLockExit({ exitCode: 75, log: "tests failed", who })).toBe("gate");
  });

  it("a gate whose nested lock gives up (exit 75, give-up line for another lock) is never exit 81", () => {
    const who = "bkit tests run bkit:gate:static-unit";
    const log = `[machine-lock] ❌ ${who} gave up after 0s waiting for database, in use by another agent — /tmp/tests (pid 123, since 12:00:00), no earlier run\n`;
    expect(classifyLockExit({ exitCode: 75, log, who })).toBe("gate");
  });

  it("a 73 exit with a machine-lock refusal line (lock dir or perl) is could-not-run, exit 4", () => {
    const who = "bkit tests run bkit:gate:static-unit";
    expect(
      classifyLockExit({
        exitCode: 73,
        log: "[machine-lock] ❌ could not take the lock for tests: cannot create /tmp/cache/bkit/machine-lock\n",
        who,
      }),
    ).toBe("could-not-run");
    expect(
      classifyLockExit({
        exitCode: 73,
        log: "[machine-lock] ❌ could not take the lock for tests: /usr/bin/perl not found\n",
        who,
      }),
    ).toBe("could-not-run");
    expect(
      classifyLockExit({
        exitCode: 73,
        log: "[machine-lock] ❌ cannot take tests while holding database: lock order is tests, other named locks, then the unnamed stack lock\n",
        who,
      }),
    ).toBe("could-not-run");
  });

  it("tests run with a --lock-wait-s that is not a whole number exits 2 and runs no gate", async () => {
    const results = await Promise.all(
      ["-1", "1.5", "bad"].map((value) => run([...BUILD, `--lock-wait-s=${value}`])),
    );
    expect(results.map((result) => result.code)).toEqual([2, 2, 2]);
    expect(results.map((result) => result.err)).toEqual([
      expect.stringContaining("--lock-wait-s takes a whole number >= 0"),
      expect.stringContaining("--lock-wait-s takes a whole number >= 0"),
      expect.stringContaining("--lock-wait-s takes a whole number >= 0"),
    ]);
    expect(fs.existsSync(path.join(cwd, "logs/test.md"))).toBe(false);
  });

  it("tests run defaults --lock-wait-s from BKIT_LOCK_WAIT_S and rejects a bad value with exit 2", async () => {
    vi.stubEnv("BKIT_LOCK_WAIT_S", "1200");
    const valid = await run(BUILD);
    expect(valid.code).toBe(0);
    expect(readLog()).toContain("wait=1200");
    fs.rmSync(path.join(cwd, "logs/test.md"));
    vi.stubEnv("BKIT_LOCK_WAIT_S", "bad");
    const invalid = await run(BUILD);
    expect(invalid.code).toBe(2);
    expect(invalid.err).toContain("BKIT_LOCK_WAIT_S");
    expect(fs.existsSync(path.join(cwd, "logs/test.md"))).toBe(false);
  });

  it("a 73 exit with a refusal line for another lock is the gate's own FAIL, never exit 4", () => {
    const who = "bkit tests run bkit:gate:static-unit";
    const log =
      "[machine-lock] ❌ could not take the lock for database: cannot create /tmp/tests/cache\n";
    expect(classifyLockExit({ exitCode: 73, log, who })).toBe("gate");
  });

  it("PASS: runs the gate through the package runner, saves stdout and stderr to the log", async () => {
    const r = await run(BUILD);
    expect(r.code).toBe(0);
    expect(r.json).toEqual({
      source: "local",
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
      row: null,
      lockHolder: null,
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

describe("bkit tests run --file", () => {
  const STATUS = "docs/plans/202611/logs/1-x/status.jsonl";
  const ARGS = [
    ...BUILD,
    `--file=${STATUS}`,
    "--workflow=build",
    "--step=build-group-gate-1",
    "--attempt=2",
  ];
  const rowsOf = () =>
    fs
      .readFileSync(path.join(cwd, STATUS), "utf-8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l) as Record<string, unknown>);
  const startRun = () => {
    fs.mkdirSync(path.dirname(path.join(cwd, STATUS)), { recursive: true });
    fs.appendFileSync(
      path.join(cwd, STATUS),
      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-11-01T00:00:00Z" })}\n`,
    );
  };

  it("appends one test-run row per run, pass or fail, with the step, attempt, run number and verdict", async () => {
    startRun();
    const pass = await run(ARGS);
    expect(pass.code).toBe(0);
    vi.stubEnv("FAKE_EXIT", "1");
    const fail = await run(ARGS);
    expect(fail.code).toBe(1);
    vi.stubEnv("FAKE_EXIT", "127");
    expect((await run(ARGS)).code).toBe(4);
    const runs = rowsOf().filter((r) => r.type === "test-run");
    expect(runs).toEqual([
      expect.objectContaining({
        workflow: "build",
        step: "build-group-gate-1",
        attempt: 2,
        run: 1,
        verdict: "PASS",
        exitCode: 0,
        failures: 0,
        scope: gateScope(DEEP),
        log: "logs/test.md",
      }),
      expect.objectContaining({ run: 2, verdict: "FAIL", exitCode: 1, failures: null }),
      expect.objectContaining({ run: 3, verdict: null, exitCode: 127 }),
    ]);
    expect(runs[0]!.at).toMatch(/Z$/);
    expect(pass.json.row).toEqual(runs[0]);
    expect(rowsOf().some((r) => r.type === "step-done")).toBe(false);
  });

  it("numbers runs within the workflow's active run and per step", async () => {
    startRun();
    await run(ARGS);
    startRun();
    await run(ARGS);
    await run([...BUILD, `--file=${STATUS}`, "--workflow=build", "--step=build-run-tests"]);
    const runs = rowsOf().filter((r) => r.type === "test-run");
    expect(runs.map((r) => `${String(r.step)}:${String(r.run)}`)).toEqual([
      "build-group-gate-1:1",
      "build-group-gate-1:1",
      "build-run-tests:1",
    ]);
    expect(runs[2]).not.toHaveProperty("attempt");
  });

  it("without --file no row is written and the output carries row null", async () => {
    const r = await run(BUILD);
    expect(r.code).toBe(0);
    expect(r.json.row).toBeNull();
  });

  it("--file needs --workflow and --step, and an existing status.jsonl, before the gate runs", async () => {
    startRun();
    expect((await run([...BUILD, `--file=${STATUS}`, "--step=s"])).code).toBe(2);
    expect((await run([...BUILD, `--file=${STATUS}`, "--workflow=build"])).code).toBe(2);
    const missing = await run([
      ...BUILD,
      "--file=docs/plans/202611/logs/2-y/status.jsonl",
      "--workflow=build",
      "--step=s",
    ]);
    expect(missing.code).toBe(2);
    expect(missing.err).toContain("does not exist");
    expect(fs.existsSync(path.join(cwd, "logs/test.md"))).toBe(false);
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
      { name: "clamp > passes", state: "passed", message: "", detail: "" },
      {
        name: `clamp > ${NAME}`,
        state: "failure",
        message: "expected +0 to be 5 // Object.is & co",
        detail: "trace",
      },
      { name: "boom", state: "error", message: "TypeError", detail: "" },
      { name: "later", state: "skipped", message: "", detail: "" },
    ]);
  });

  it("keeps a failure's text as detail, CDATA as written and tags stripped", () => {
    const cases = parseJunit(
      junit(
        `<testcase name="t"><failure message="m"><![CDATA[expected 12 <total> to be 0]]></failure></testcase>`,
        `<testcase name="u"><failure>AssertionError: <b>expected 1</b>&#10;  at u.test.ts:4</failure></testcase>`,
      ),
    );
    expect(cases).toEqual<JunitCase[]>([
      { name: "t", state: "failure", message: "m", detail: "expected 12 <total> to be 0" },
      {
        name: "u",
        state: "failure",
        message: "",
        detail: "AssertionError: expected 1\n  at u.test.ts:4",
      },
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
  const FILE = "src/clamp.test.ts";

  it("a red is the named test failing or erroring", () => {
    expect(judgeRed(p(failed(`clamp > ${NAME}`)), NAME, FILE).state).toBe("red");
    expect(
      judgeRed(p(`<testcase name="${NAME}"><error message="x"/></testcase>`), NAME, FILE).state,
    ).toBe("red");
  });

  it.each([
    ["no report (misspelled path)", null, "no-report", "no JUnit report"],
    [
      "load error named after the file",
      p(failed(FILE, "Cannot find module")),
      "red-not-loaded",
      "did not load",
    ],
    ["zero tests", [], "red-not-loaded", "did not load"],
    [
      "the named test passed (code written first)",
      p(passed(`clamp > ${NAME}`)),
      "vacuous",
      "passes at its red",
    ],
    ["the named test skipped (filter matched nothing)", p(skipped(NAME)), "missing", "skipped"],
    ["other tests only", p(failed("other")), "missing", '"other"'],
  ])("state: %s", (_label, cases, state, words) => {
    const judged = judgeRed(cases as JunitCase[] | null, NAME, FILE);
    expect(judged.state).toBe(state);
    expect(judged.detail).toContain(words);
  });

  it("a name only matches whole trailing segments", () => {
    expect(judgeRed(p(failed(`clamp > re${NAME}`)), NAME, FILE).state).toBe("missing");
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

/**
 * Issue task blocks wrapped as a plan: a Reuse Inventory NEW row per CREATE file and a
 * Supersession Inventory row per DELETE file, then the blocks.
 */
function asPlan(blocks: string): string {
  const parsed = parsePlanBlocks(blocks).tasks;
  const files = parsed.flatMap((t) => t.create.map((c) => c.file));
  const removed = parsed.flatMap((t) => t.delete.map((d) => d.file));
  return [
    "# Plan",
    "",
    "## Reuse Inventory",
    "",
    "| Capability | File | Search performed | Existing candidates | Decision (EXTEND/NEW) | Justification |",
    "| --- | --- | --- | --- | --- | --- |",
    ...files.map((f) => `| x | \`${f}\` | rg x | none | NEW | nothing to extend |`),
    ...(removed.length === 0
      ? []
      : [
          "",
          "## Supersession Inventory",
          "",
          "| Existing artifact | Replaced by | Decision | Justification |",
          "| --- | --- | --- | --- |",
          ...removed.map((f) => `| \`${f}\` | - | DELETE | replaced |`),
        ]),
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
  /** A Derived Test Matrix table: its `cols`, then one row per `row` cell list. */
  const matrix = (cols: string[], ...rows: string[][]) =>
    [
      "## Derived Test Matrix",
      "",
      `| ${cols.join(" | ")} |`,
      `| ${cols.map(() => "---").join(" | ")} |`,
      ...rows.map((r) => `| ${r.join(" | ")} |`),
    ].join("\n");
  /** The matrix header the reader maps rows to tasks by. */
  const MATRIX = ["Test description", "Type", "Target file", "Task"];
  const EXPECTED_MATRIX_HEADER = "Test description | Type | Target file | Task";
  /** A Supersession Inventory table with one DELETE row per file. */
  const supersession = (...files: string[]) =>
    [
      "## Supersession Inventory",
      "",
      "| Existing artifact | Replaced by | Decision | Justification |",
      "| --- | --- | --- | --- |",
      ...files.map((f) => `| \`${f}\` | \`src/new.ts\` | DELETE | replaced |`),
    ].join("\n");

  it("reports a planned test of an open task whose name its file already carries, and never refuses for it", async () => {
    const tf = (n: number, name: string, box = " ") =>
      taskBlock(
        n,
        [
          "  - **DONE WHEN:** passes",
          "  - **TEST FIRST:**",
          `    - \`src/a.test.ts\` \`${name}\` fails`,
        ],
        box,
      );
    write("plan.md", groupBlock(1, tf(1, "adds a row"), tf(2, "counts rows")));
    fs.mkdirSync(path.join(cwd, "src"), { recursive: true });
    fs.writeFileSync(
      path.join(cwd, "src/a.test.ts"),
      "it('adds a row', () => {\n  expect(1).toBe(1);\n});\n",
    );
    const r = await check("--existence=report");
    expect(r.json.existing).toEqual([
      {
        line: lineOf("plan.md", "**TEST FIRST:**"),
        task: 1,
        test: "src/a.test.ts",
        name: "adds a row",
      },
    ]);
    expect(r.json.problems.map((p: { message: string }) => p.message).join("\n")).not.toContain(
      "adds a row",
    );
    expect(report()).toContain('already holds a test named "adds a row"');
    write("plan.md", groupBlock(1, tf(1, "adds a row", "x"), tf(2, "counts rows")));
    expect((await check("--existence=report")).json.existing).toEqual([]);
  });

  it("states the caps the template and workflows doc name", () => {
    const { maxPerGroup, maxTestsPerGroup, maxTestsPerTask, maxTestFilesPerTask } =
      CONFIG_DEFAULTS.tasks;
    expect([maxPerGroup, maxTestsPerGroup, maxTestsPerTask, maxTestFilesPerTask]).toEqual([
      5, 25, 10, 3,
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

  it("plan-check refuses an unmapped matrix row", async () => {
    write(
      "plan.md",
      matrix(
        MATRIX,
        ["case a", "Unit", "`t0.test.ts`", ""],
        ["case b", "Unit", "`t0.test.ts`", "1"],
      ),
      groupBlock(1, okTask(1)),
    );
    const r = await check();
    expect(r.code).toBe(1);
    expect(r.json.problems).toEqual([
      expect.objectContaining({ kind: "matrix", line: lineOf("plan.md", "| case a") }),
    ]);
    expect(report()).toContain("row maps to no task");
  });

  it("plan-check refuses a delete with no supersession row", async () => {
    fs.mkdirSync(path.join(cwd, "src"));
    fs.writeFileSync(path.join(cwd, "src/old.ts"), "export const oldThing = 1;\n");
    const del = ["  - **DELETE:** `oldThing` in `src/old.ts`: gone"];
    write("plan.md", groupBlock(1, okTask(1, 1, 1, del)));
    let r = await check();
    expect(r.code).toBe(1);
    expect(r.json.problems).toEqual([
      expect.objectContaining({ kind: "supersession", line: lineOf("plan.md", "**DELETE:**") }),
    ]);
    expect(r.json.problems[0].message).toContain("src/old.ts");
    write("plan.md", supersession("src/old.ts"), groupBlock(1, okTask(1, 1, 1, del)));
    r = await check();
    expect(r.code).toBe(0);
  });

  it("plan-check refuses a matrix row mapped to two tasks", async () => {
    write(
      "plan.md",
      matrix(
        MATRIX,
        ["case a", "Unit", "`t0.test.ts`", "1"],
        ["case b", "Unit", "`t0.test.ts`", "2"],
        ["case c", "Unit", "`t0.test.ts`", "1, 2"],
      ),
      groupBlock(1, okTask(1), okTask(2)),
    );
    const r = await check();
    expect(r.code).toBe(1);
    expect(r.json.problems).toEqual([
      expect.objectContaining({ kind: "matrix", line: lineOf("plan.md", "| case c") }),
    ]);
    expect(r.json.problems[0].message).toContain("TASK 1");
    expect(r.json.problems[0].message).toContain("TASK 2");
  });

  it("plan-check refuses rows left in the old column order under the template header", async () => {
    write(
      "plan.md",
      matrix(
        MATRIX,
        ["case a", "Unit", "2", "`t1.test.ts`"],
        ["case b", "Unit", "1", "`t2.test.ts`"],
      ),
      groupBlock(1, okTask(1), okTask(2)),
    );
    const r = await check();
    expect(r.code).toBe(1);
    const lines = r.json.problems
      .filter((p: { kind: string }) => p.kind === "matrix")
      .map((p: { line: number }) => p.line);
    expect(lines).toContain(lineOf("plan.md", "| case a"));
    expect(lines).toContain(lineOf("plan.md", "| case b"));
  });

  it("plan-check refuses rows with an extra cell under the template header", async () => {
    write(
      "plan.md",
      matrix(
        MATRIX,
        ["1", "case a", "Unit", "`t1.test.ts`", "1"],
        ["2", "case b", "Unit", "`t2.test.ts`", "2"],
      ),
      groupBlock(1, okTask(1), okTask(2)),
    );
    const r = await check();
    expect(r.code).toBe(1);
    const lines = r.json.problems
      .filter((p: { kind: string }) => p.kind === "matrix")
      .map((p: { line: number }) => p.line);
    expect(lines).toContain(lineOf("plan.md", "| 1 | case a"));
    expect(lines).toContain(lineOf("plan.md", "| 2 | case b"));
  });

  it("plan-check refuses a task no matrix row maps to", async () => {
    write(
      "plan.md",
      matrix(MATRIX, ["case a", "Unit", "`t0.test.ts`", "1"]),
      groupBlock(1, okTask(1), okTask(2)),
    );
    const r = await check();
    expect(r.code).toBe(1);
    expect(r.json.problems).toEqual([
      expect.objectContaining({
        kind: "matrix",
        line: lineOf("plan.md", "<!-- bkit:task 2 start -->"),
      }),
    ]);
    expect(r.json.problems[0].message).toContain("TASK 2");
  });

  it("plan-check accepts a matrix that maps every test-bearing task", async () => {
    write(
      "plan.md",
      matrix(
        MATRIX,
        ["case a", "Unit", "`t0.test.ts`", "1"],
        ["case b", "Unit", "`t1.test.ts`", "2"],
      ),
      groupBlock(1, okTask(1), okTask(2)),
    );
    const r = await check();
    expect(r.code).toBe(0);
    expect(r.json.problems).toEqual([]);
    // The same plan minus one row is refused: the acceptance is the mapping, not the section.
    write(
      "plan.md",
      matrix(MATRIX, ["case a", "Unit", "`t0.test.ts`", "1"]),
      groupBlock(1, okTask(1), okTask(2)),
    );
    const missing = await check();
    expect(missing.code).toBe(1);
  });

  it("plan-check refuses a matrix header with no Task column, naming the column to add", async () => {
    write(
      "plan.md",
      matrix(
        ["Test description", "Type", "Target file"],
        ["case a", "Unit", "`t0.test.ts`"],
        ["case b", "Unit", "`t1.test.ts`"],
      ),
      groupBlock(1, okTask(1), okTask(2)),
    );
    const r = await check();
    expect(r.code).toBe(1);
    expect(r.json.problems).toEqual([
      expect.objectContaining({ kind: "matrix", line: lineOf("plan.md", "| Test description") }),
    ]);
    expect(r.json.problems[0].message).toContain("Task");
    expect(r.json.problems[0].message).toContain("Test description | Type | Target file | Task");
    expect(report().match(/`matrix`/g)).toHaveLength(1);
  });

  it("plan-check refuses a matrix header with an extra leading # column", async () => {
    write(
      "plan.md",
      matrix(
        ["#", "Test description", "Type", "Target file", "Task"],
        ["1", "case a", "Unit", "`t0.test.ts`", "1"],
        ["2", "case b", "Unit", "`t1.test.ts`", "2"],
      ),
      groupBlock(1, okTask(1), okTask(2)),
    );
    const r = await check();
    expect(r.code).toBe(1);
    expect(r.json.problems).toEqual([
      expect.objectContaining({ kind: "matrix", line: lineOf("plan.md", "| #") }),
    ]);
    expect(r.json.problems[0].message).toContain(EXPECTED_MATRIX_HEADER);
    expect(report().match(/`matrix`/g)).toHaveLength(1);
  });

  it("plan-check refuses a matrix header with Task not last", async () => {
    write(
      "plan.md",
      matrix(
        ["Test description", "Type", "Task", "Target file"],
        ["case a", "Unit", "1", "`t0.test.ts`"],
        ["case b", "Unit", "2", "`t1.test.ts`"],
      ),
      groupBlock(1, okTask(1), okTask(2)),
    );
    const r = await check();
    expect(r.code).toBe(1);
    expect(r.json.problems).toEqual([
      expect.objectContaining({ kind: "matrix", line: lineOf("plan.md", "| Test description") }),
    ]);
    expect(r.json.problems[0].message).toContain(EXPECTED_MATRIX_HEADER);
    expect(report().match(/`matrix`/g)).toHaveLength(1);
  });

  it("plan-check refuses synonym matrix column names", async () => {
    write(
      "plan.md",
      matrix(
        ["Behaviour", "Tier", "Target file", "Task"],
        ["case a", "Unit", "`t0.test.ts`", "1"],
        ["case b", "Unit", "`t1.test.ts`", "2"],
      ),
      groupBlock(1, okTask(1), okTask(2)),
    );
    const r = await check();
    expect(r.code).toBe(1);
    expect(r.json.problems).toEqual([
      expect.objectContaining({ kind: "matrix", line: lineOf("plan.md", "| Behaviour") }),
    ]);
    expect(r.json.problems[0].message).toContain(EXPECTED_MATRIX_HEADER);
    expect(report().match(/`matrix`/g)).toHaveLength(1);
  });

  it("plan-check refuses a matrix header with no closing pipe", async () => {
    const lines = matrix(
      MATRIX,
      ["case a", "Unit", "`t0.test.ts`", "1"],
      ["case b", "Unit", "`t1.test.ts`", "2"],
    ).split("\n");
    const head = lines.findIndex((l) => l.startsWith("| Test description"));
    lines[head] = lines[head].replace(/ \|$/, "");
    write("plan.md", lines.join("\n"), groupBlock(1, okTask(1), okTask(2)));
    const r = await check();
    expect(r.code).toBe(1);
    expect(r.json.problems).toEqual([
      expect.objectContaining({ kind: "matrix", line: lineOf("plan.md", "| Test description") }),
    ]);
    expect(r.json.problems[0].message).toContain(EXPECTED_MATRIX_HEADER);
  });

  it("plan-check accepts the template matrix header in any letter case", async () => {
    write(
      "plan.md",
      matrix(
        ["test DESCRIPTION", " TYPE", "target File ", "TASK"],
        ["case a", "Unit", "`t0.test.ts`", "1"],
        ["case b", "Unit", "`t1.test.ts`", "2"],
      ),
      groupBlock(1, okTask(1), okTask(2)),
    );
    const r = await check();
    expect(r.code).toBe(0);
    expect(r.json.problems).toEqual([]);
  });

  it("plan-check refuses a Task cell naming an undefined task", async () => {
    write(
      "plan.md",
      matrix(
        MATRIX,
        ["case a", "Unit", "`t0.test.ts`", "1"],
        ["case b", "Unit", "`t1.test.ts`", "9"],
      ),
      groupBlock(1, okTask(1)),
    );
    const r = await check();
    expect(r.code).toBe(1);
    expect(r.json.problems).toEqual([
      expect.objectContaining({ kind: "matrix", line: lineOf("plan.md", "| case b") }),
    ]);
    expect(r.json.problems[0].message).toContain("TASK 9");
  });

  it("plan-check accepts a task whose only TEST FIRST is n/a", async () => {
    write(
      "plan.md",
      matrix(MATRIX, ["case a", "Unit", "`t0.test.ts`", "1"]),
      groupBlock(
        1,
        okTask(1),
        taskBlock(2, [
          "  - **DONE WHEN:** the docs are updated",
          "  - **TEST FIRST:** n/a — docs only",
        ]),
      ),
    );
    const r = await check();
    expect(r.code).toBe(0);
    expect(r.json.problems).toEqual([]);
    // A task naming a test and no row is refused: only `n/a` is exempt from a row.
    write(
      "plan.md",
      matrix(MATRIX, ["case a", "Unit", "`t0.test.ts`", "1"]),
      groupBlock(1, okTask(1), okTask(2)),
    );
    const missing = await check();
    expect(missing.code).toBe(1);
  });

  it("plan-check refuses a group with 6 tasks", async () => {
    write(
      "plan.md",
      groupBlock(1, okTask(1), okTask(2), okTask(3), okTask(4), okTask(5), okTask(6)),
    );
    const r = await check();
    expect(r.code).toBe(1);
    expect(r.json.problems).toEqual([
      expect.objectContaining({ kind: "cap", line: lineOf("plan.md", "bkit:group 1 start") }),
    ]);
    expect(report()).toContain("GROUP 1 has 6 tasks, over the cap of 5");
  });

  it("plan-check refuses a group with 26 planned tests", async () => {
    write("plan.md", groupBlock(1, okTask(1, 9, 3), okTask(2, 9, 3), okTask(3, 8, 3)));
    const r = await check();
    expect(r.code).toBe(1);
    expect(report()).toContain("GROUP 1 has 26 TEST FIRST tests, over the cap of 25");
  });

  it("plan-check accepts 5 tasks and 25 tests in one group", async () => {
    write(
      "plan.md",
      groupBlock(
        1,
        okTask(1, 5, 3),
        okTask(2, 5, 3),
        okTask(3, 5, 3),
        okTask(4, 5, 3),
        okTask(5, 5, 3),
      ),
    );
    const r = await check();
    expect(r.code).toBe(0);
    expect(r.json.problems).toEqual([]);
    expect(r.json.groups).toEqual([expect.objectContaining({ group: 1, tasks: 5, tests: 25 })]);
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

describe("testBlock — a planned test's own lines, by name and indentation", () => {
  const VITEST = [
    "describe('rows', () => {",
    "  it('adds a row', () => {",
    "    expect(addRow()).toBe(1);",
    "",
    "    expect(rows()).toHaveLength(1);",
    "  });",
    "",
    "  it('counts rows', () => {",
    "    expect(count()).toBe(0);",
    "  });",
    "});",
  ].join("\n");

  it("takes the named test's opening line, its deeper lines and its closer, and nothing of its neighbours", () => {
    expect(testBlock(VITEST, "adds a row")).toBe(VITEST.split("\n").slice(1, 6).join("\n"));
    expect(testBlock(VITEST, "counts rows")).toBe(VITEST.split("\n").slice(7, 10).join("\n"));
  });

  it("an edit to a neighbour leaves the hash alone; an edit to the test's own lines changes it", () => {
    const before = blockHash(VITEST, "adds a row");
    expect(blockHash(VITEST.replace("toBe(0)", "toBe(2)"), "adds a row")).toBe(before);
    expect(blockHash(VITEST.replace("toBe(1)", "toBe(2)"), "adds a row")).not.toBe(before);
  });

  it("testSpan gives the 1-based first and last line of the block, and lineDiff counts the lines removed and added", () => {
    expect(testSpan(VITEST, "counts rows")).toEqual({ start: 8, end: 10 });
    expect(testSpan(VITEST, "no such test")).toBeNull();
    const d = lineDiff("a\nb\nc", "a\nc\nd");
    expect(d).toEqual({ text: " a\n-b\n c\n+d", removed: 1, added: 1 });
    expect(lineDiff("a\nb", "a\nb")).toEqual({ text: " a\n b", removed: 0, added: 0 });
  });

  it("finds a test planned by its suite path (`suite > test`) through its last segment", () => {
    expect(testBlock(VITEST, "rows > adds a row")).toBe(testBlock(VITEST, "adds a row"));
    expect(testBlock(VITEST, "outer > rows > counts rows")).toBe(testBlock(VITEST, "counts rows"));
    expect(testBlock(VITEST, "rows > no such test")).toBeNull();
  });

  it("starts at the call when the name sits on its own line under an open paren", () => {
    const text = [
      "it(",
      '  "adds a row",',
      "  () => {",
      "    expect(addRow()).toBe(1);",
      "  },",
      ");",
      "it('next', () => {});",
    ].join("\n");
    expect(testBlock(text, "adds a row")).toBe(text.split("\n").slice(0, 6).join("\n"));
  });

  it.each([
    [
      "pytest",
      "def test_adds_a_row():\n    assert add_row() == 1\n\ndef test_other():\n    assert True\n",
      "test_adds_a_row",
      "def test_adds_a_row():\n    assert add_row() == 1",
    ],
    [
      "go",
      "func TestAddsARow(t *testing.T) {\n\tif addRow() != 1 {\n\t\tt.Fatal()\n\t}\n}\n\nfunc TestOther(t *testing.T) {}\n",
      "TestAddsARow",
      "func TestAddsARow(t *testing.T) {\n\tif addRow() != 1 {\n\t\tt.Fatal()\n\t}\n}",
    ],
    [
      "rspec",
      "it 'adds a row' do\n  expect(add_row).to eq(1)\nend\nit 'other' do\nend\n",
      "adds a row",
      "it 'adds a row' do\n  expect(add_row).to eq(1)\nend",
    ],
  ])("is stack-agnostic: %s", (_stack, text, name, block) => {
    expect(testBlock(text, name)).toBe(block);
  });

  it("passes over a comment that quotes the name: the test, not the comment, is locked", () => {
    const text = [
      "// TODO: 'adds a row' should also cover retries",
      "describe('rows', () => {",
      "  it('adds a row', () => {",
      "    expect(addRow()).toBe(1);",
      "  });",
      "});",
    ].join("\n");
    expect(testBlock(text, "adds a row")).toBe(text.split("\n").slice(2, 5).join("\n"));
    expect(blockHash(text.replace("toBe(1)", "toBe(2)"), "adds a row")).not.toBe(
      blockHash(text, "adds a row"),
    );
  });

  it("passes over a suite titled like the test, so its neighbours stay free to change", () => {
    const text = [
      "describe('adds a row', () => {",
      "  it('adds a row', () => {",
      "    expect(addRow()).toBe(1);",
      "  });",
      "  it('counts rows', () => {",
      "    expect(count()).toBe(0);",
      "  });",
      "});",
    ].join("\n");
    expect(testBlock(text, "adds a row")).toBe(text.split("\n").slice(1, 4).join("\n"));
    expect(blockHash(text.replace("toBe(0)", "toBe(2)"), "adds a row")).toBe(
      blockHash(text, "adds a row"),
    );
  });

  it("falls back to a suite line when nothing else carries the name", () => {
    const text = ["describe('adds a row', () => {", "  it('works', () => {});", "});"].join("\n");
    expect(testBlock(text, "adds a row")).toBe(text);
  });

  it("is null when the name is not in the file, or there is no file", () => {
    expect(testBlock(VITEST, "removes a row")).toBeNull();
    expect(testBlock(null, "adds a row")).toBeNull();
    expect(blockHash(VITEST, "removes a row")).toBeNull();
  });
});

describe("bkit tests red / green", () => {
  const STATUS = "logs/status.jsonl";
  const TEST = "src/clamp.test.ts";
  const OTHER = "src/range.test.ts";
  const RED_LOG = "logs/build-tests-red-1-1.md";
  const WRITER_LOG = "logs/build-plan-tests-1-log.md";
  /** The orchestrator's group red: every planned test of group 1, one run per test file. */
  const red = (extra: string[] = [], log = RED_LOG) =>
    run(
      [
        `--file=${STATUS}`,
        "--workflow=build",
        "--group=1",
        "--plan=plan.md",
        `--log=${log}`,
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
  const redReport = () => fs.readFileSync(path.join(cwd, RED_LOG), "utf-8");
  const states = (r: { json: Record<string, unknown> }) =>
    (r.json.tests as Array<{ testName: string; state: string }>).map(
      (t) => `${t.testName}:${t.state}`,
    );
  const kinds = (r: { json: Record<string, unknown> }) =>
    (r.json.gaps as Array<{ kind: string }>).map((g) => g.kind);
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
  const GIT_ENV = {
    ...process.env,
    GIT_AUTHOR_NAME: "t",
    GIT_AUTHOR_EMAIL: "t@t",
    GIT_COMMITTER_NAME: "t",
    GIT_COMMITTER_EMAIL: "t@t",
  };
  const baseCommit = () =>
    spawnSync("git", ["-C", cwd, "commit", "-q", "--allow-empty", "-m", "base"], { env: GIT_ENV });

  beforeEach(() => {
    checkout(scripts({ [BKIT_TEST_FILE_SCRIPT]: "runner" }));
    baseCommit();
    fs.mkdirSync(path.join(cwd, "src"));
    fs.writeFileSync(path.join(cwd, TEST), "expect(clamp(5, 1, 10)).toBe(5);\n");
    writePlan([TASK_1]);
  });

  it("runs each planned test file once and writes one build-tests-red row with a state and blob per planned test", async () => {
    writePlan([
      testTask(1, [
        [TEST, NAME],
        [TEST, "second"],
      ]),
      testTask(2, [[OTHER, "third"]]),
    ]);
    fs.writeFileSync(path.join(cwd, OTHER), "expect(clamp(0, 1, 10)).toBe(1);\n");
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(`clamp > ${NAME}`), failed("second"), failed("third")));
    const r = await red();
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ enforced: true, attempt: 1, gaps: [], log: RED_LOG });
    expect(r.json.tests).toEqual([
      {
        task: 1,
        test: TEST,
        testName: NAME,
        state: "red",
        blob: expect.stringMatching(/^[0-9a-f]{40}$/),
        block: null,
      },
      {
        task: 1,
        test: TEST,
        testName: "second",
        state: "red",
        blob: expect.stringMatching(/^[0-9a-f]{40}$/),
        block: null,
      },
      {
        task: 2,
        test: OTHER,
        testName: "third",
        state: "red",
        blob: expect.stringMatching(/^[0-9a-f]{40}$/),
        block: null,
      },
    ]);
    const [row] = rows();
    expect(rows()).toHaveLength(1);
    expect(row).toMatchObject({
      type: "step-done",
      workflow: "build",
      step: "build-tests-red",
      group: 1,
      attempt: 1,
      enforced: true,
      artifacts: [RED_LOG],
      tests: r.json.tests,
    });
    expect(redReport()).toContain("Red: 3");
    expect(redReport()).toContain("Gaps: 0");
    expect(redReport().match(new RegExp(`arg: ${TEST}`, "g"))).toHaveLength(1);
    expect(redReport().match(new RegExp(`arg: ${OTHER}`, "g"))).toHaveLength(1);
  });

  it("a planned test that passes is a vacuous gap, exit 1", async () => {
    vi.stubEnv("FAKE_EXIT", "0");
    vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
    const r = await red();
    expect(r.code).toBe(1);
    expect(r.json.gaps).toEqual([
      {
        task: 1,
        test: TEST,
        name: NAME,
        kind: "vacuous",
        detail: expect.stringContaining("passes at its red"),
      },
    ]);
    expect(states(r)).toEqual([`${NAME}:vacuous`]);
    expect(r.err).toContain("vacuous");
    expect(rows()[0]!.tests).toMatchObject([{ state: "vacuous" }]);
    expect(redReport()).toContain("Gaps: 1");
    expect(redReport()).toContain("`vacuous`");
  });

  it("a planned test absent from a loaded report is a missing gap", async () => {
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed("other")));
    const r = await red();
    expect(r.code).toBe(1);
    expect(kinds(r)).toEqual(["missing"]);
    expect(r.json.gaps[0].detail).toContain('"other"');
    expect(states(r)).toEqual([`${NAME}:missing`]);
  });

  it("a file that fails to load is a red of kind red-not-loaded", async () => {
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit());
    let r = await red();
    expect(r.code).toBe(0);
    expect(states(r)).toEqual([`${NAME}:red-not-loaded`]);
    // The file changed, so the red runs again.
    fs.writeFileSync(path.join(cwd, TEST), "expect(clamp(6, 1, 10)).toBe(6);\n");
    vi.stubEnv("FAKE_JUNIT", junit(failed(TEST, "Cannot find module './clamp'")));
    r = await red();
    expect(r.code).toBe(0);
    expect(states(r)).toEqual([`${NAME}:red-not-loaded`]);
    expect(redReport()).toContain("red-not-loaded");
  });

  it("a PASSES line in the writer's log turns a passing test into passed-accepted", async () => {
    vi.stubEnv("FAKE_EXIT", "0");
    vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
    fs.mkdirSync(path.join(cwd, "logs"), { recursive: true });
    fs.writeFileSync(
      path.join(cwd, WRITER_LOG),
      `# Tests\n\nPASSES — TASK 1: \`${TEST}\` \`${NAME}\`: clamp already bounds its input\n`,
    );
    const r = await red([`--writer-log=${WRITER_LOG}`]);
    expect(r.code).toBe(0);
    expect(r.json.gaps).toEqual([]);
    expect(r.json.tests).toEqual([
      expect.objectContaining({
        state: "passed-accepted",
        reason: "clamp already bounds its input",
      }),
    ]);
    expect(redReport()).toContain("passed-accepted");
    // The line names another test: the pass stays a gap (the file changed, so the test runs again).
    fs.writeFileSync(path.join(cwd, TEST), "expect(clamp(6, 1, 10)).toBe(6);\n");
    fs.writeFileSync(
      path.join(cwd, WRITER_LOG),
      `PASSES — TASK 1: \`${TEST}\` \`other\`: already there\n`,
    );
    expect(kinds(await red([`--writer-log=${WRITER_LOG}`]))).toEqual(["vacuous"]);
  });

  it("no bkit:test:file script exits 3 and still records the blobs with enforced false", async () => {
    checkout(scripts({ test: "x" }));
    baseCommit();
    fs.mkdirSync(path.join(cwd, "src"));
    fs.writeFileSync(path.join(cwd, TEST), "expect(clamp(5, 1, 10)).toBe(5);\n");
    writePlan([TASK_1]);
    const r = await red();
    expect(r.code).toBe(3);
    expect(r.json).toMatchObject({ enforced: false, gaps: [] });
    expect(r.json.tests).toEqual([
      expect.objectContaining({ state: "unknown", blob: expect.stringMatching(/^[0-9a-f]{40}$/) }),
    ]);
    expect(rows()[0]).toMatchObject({ step: "build-tests-red", enforced: false });
    expect(r.err).toContain("BKIT_TEST_REPORT");
    expect(redReport()).toContain("Enforced: false");
  });

  it("a planned test file failing bkit:lint:file is a lint gap, and the file is not run", async () => {
    fs.writeFileSync(
      path.join(cwd, "package.json"),
      scripts({ [BKIT_TEST_FILE_SCRIPT]: "runner", [BKIT_LINT_FILE_SCRIPT]: "linter" }),
    );
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
    vi.stubEnv("FAKE_LINT_EXIT", "1");
    const linted = await red();
    expect(linted.code).toBe(1);
    expect(kinds(linted)).toEqual(["lint"]);
    expect(states(linted)).toEqual([`${NAME}:lint`]);
    expect(redReport()).toContain(`out: ${BKIT_LINT_FILE_SCRIPT}`);
    expect(redReport()).not.toContain(`out: ${BKIT_TEST_FILE_SCRIPT}`);
    vi.stubEnv("FAKE_LINT_EXIT", "127");
    expect((await red()).code).toBe(4);
    vi.stubEnv("FAKE_LINT_EXIT", "0");
    const clean = await red();
    expect(clean.code).toBe(0);
    expect(redReport()).toContain(`out: ${BKIT_TEST_FILE_SCRIPT}`);
  });

  it("an undeclared bkit:lint:file is noted, and the red still runs", async () => {
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
    vi.stubEnv("FAKE_LINT_EXIT", "1");
    const r = await red();
    expect(r.code).toBe(0);
    expect(r.err).toContain(`${BKIT_LINT_FILE_SCRIPT} is not declared`);
  });

  it("a planned test file that does not exist is a missing gap with no run; a runner that cannot run is exit 4", async () => {
    fs.rmSync(path.join(cwd, TEST));
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
    const r = await red();
    expect(r.code).toBe(1);
    expect(kinds(r)).toEqual(["missing"]);
    expect(r.json.gaps[0].detail).toContain("does not exist");
    expect(r.json.tests[0].blob).toBeNull();
    expect(redReport()).not.toContain(`arg: ${TEST}`);
    fs.writeFileSync(path.join(cwd, TEST), "expect(clamp(5, 1, 10)).toBe(5);\n");
    vi.stubEnv("FAKE_EXIT", "127");
    expect((await red()).code).toBe(4);
  });

  it("a ticked task is skipped, and a plan with no task markers is refused", async () => {
    writePlan([
      taskBlock(
        1,
        [
          "  - **DONE WHEN:** passes",
          "  - **TEST FIRST:**",
          `    - \`${TEST}\` \`${NAME}\` fails.`,
        ],
        "x",
      ),
      taskBlock(2, ["  - **DONE WHEN:** done", "  - **TEST FIRST:** n/a — docs."]),
    ]);
    vi.stubEnv("FAKE_EXIT", "0");
    vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
    const r = await red();
    expect(r.code).toBe(0);
    expect(r.json.tests).toEqual([]);
    expect(redReport()).not.toContain(`arg: ${TEST}`);
    fs.writeFileSync(path.join(cwd, "plan.md"), "# Plan\n\n- [ ] **Task 1:** Old plan.\n");
    const old = await red();
    expect(old.code).toBe(1);
    expect(old.json).toMatchObject({ enforced: false });
    expect(old.json.reason).toContain("run /bkit-build again to convert it");
  });

  it("a test an earlier row of the group proved red is not run again unless its file changed, and green reads every row", async () => {
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(`clamp > ${NAME}`), failed("third")));
    expect((await red()).code).toBe(0);
    // A task added to the group: only its tests run, the proven one stands.
    writePlan([TASK_1, testTask(2, [[OTHER, "third"]])]);
    fs.writeFileSync(path.join(cwd, OTHER), "expect(clamp(0, 1, 10)).toBe(1);\n");
    const second = await red([], "logs/build-tests-red-1-2.md");
    expect(second.code).toBe(0);
    expect(second.json).toMatchObject({ attempt: 2, skipped: 1, gaps: [] });
    expect(states(second)).toEqual(["third:red"]);
    expect(second.err).toContain("1 planned test(s) already red, not run again");
    expect(rows().map((r) => (r.tests as unknown[]).length)).toEqual([1, 1]);
    // Green sees both rows: neither test is no-red.
    vi.stubEnv("FAKE_EXIT", "0");
    vi.stubEnv("FAKE_JUNIT", junit(passed(NAME), passed("third")));
    const g = await green();
    expect(g.code).toBe(0);
    expect(g.json.gaps).toEqual([]);
    // The proven test's file changed: it runs again, the other stands.
    fs.writeFileSync(path.join(cwd, TEST), "expect(clamp(50, 1, 10)).toBe(10);\n");
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(`clamp > ${NAME}`), failed("third")));
    const third = await red([], "logs/build-tests-red-1-3.md");
    expect(third.code).toBe(0);
    expect(third.json).toMatchObject({ attempt: 3, skipped: 1 });
    expect(states(third)).toEqual([`${NAME}:red`]);
  });

  describe("per-test proof", () => {
    const body = (planned: string, other: string) =>
      [
        "describe('clamp', () => {",
        `  it('${NAME}', () => {`,
        `    expect(clamp(5, 1, 10)).toBe(${planned});`,
        "  });",
        "",
        "  it('second', () => {",
        `    expect(clamp(0, 1, 10)).toBe(${other});`,
        "  });",
        "});",
        "",
      ].join("\n");
    const commitAll = (message: string) => {
      spawnSync("git", ["-C", cwd, "add", "-A"], { env: GIT_ENV });
      spawnSync("git", ["-C", cwd, "commit", "-q", "-m", message], { env: GIT_ENV });
      return spawnSync("git", ["-C", cwd, "rev-parse", "HEAD"], {
        encoding: "utf-8",
      }).stdout.trim();
    };

    it("records each test's own lines, and a proven red stands while they are unchanged, whatever else in the file changes", async () => {
      fs.writeFileSync(path.join(cwd, TEST), body("5", "1"));
      vi.stubEnv("FAKE_EXIT", "1");
      vi.stubEnv("FAKE_JUNIT", junit(failed(`clamp > ${NAME}`)));
      const first = await red();
      expect(first.code).toBe(0);
      expect(first.json.tests[0].block).toBe(
        blockHash(fs.readFileSync(path.join(cwd, TEST), "utf-8"), NAME),
      );
      // Another test of the file changed: the proven red stands, nothing runs.
      fs.writeFileSync(path.join(cwd, TEST), body("5", "2"));
      vi.stubEnv("FAKE_EXIT", "0");
      vi.stubEnv("FAKE_JUNIT", junit(passed(`clamp > ${NAME}`)));
      const second = await red([], "logs/build-tests-red-1-2.md");
      expect(second.code).toBe(0);
      expect(second.json).toMatchObject({ skipped: 1, tests: [] });
      // Its own lines changed: it runs again.
      fs.writeFileSync(path.join(cwd, TEST), body("6", "2"));
      const third = await red([], "logs/build-tests-red-1-3.md");
      expect(states(third)).toEqual([`${NAME}:vacuous`]);
    });

    it("a later unproven result never replaces a proven red of the same lines", () => {
      const row = (state: string, block: string, attempt: number) =>
        JSON.stringify({
          type: "step-done",
          workflow: "build",
          step: "build-tests-red",
          status: "DONE",
          group: 1,
          attempt,
          tests: [{ task: 1, test: TEST, testName: NAME, state, blob: "b", block }],
        });
      fs.mkdirSync(path.join(cwd, "logs"), { recursive: true });
      const file = path.join(cwd, STATUS);
      fs.writeFileSync(file, `${row("red", "x", 1)}\n${row("vacuous", "x", 2)}\n`);
      expect([...redEntries(file, "build", 1).values()].map((t) => t.state)).toEqual(["red"]);
      fs.writeFileSync(file, `${row("red", "x", 1)}\n${row("vacuous", "y", 2)}\n`);
      expect([...redEntries(file, "build", 1).values()].map((t) => t.state)).toEqual(["vacuous"]);
    });

    it("an existing test the tests step changed and that passes is updated, with the group's start commit, and green lists it for the verifier", async () => {
      fs.writeFileSync(path.join(cwd, TEST), body("5", "1"));
      const start = commitAll("existing tests");
      fs.mkdirSync(path.join(cwd, "logs"), { recursive: true });
      fs.writeFileSync(
        path.join(cwd, STATUS),
        `${JSON.stringify({ type: "step-done", workflow: "build", step: "build-group-start", status: "DONE", group: 1, parentSha: start })}\n`,
      );
      // Unchanged since the group started and passing: proves nothing.
      vi.stubEnv("FAKE_EXIT", "0");
      vi.stubEnv("FAKE_JUNIT", junit(passed(`clamp > ${NAME}`)));
      const same = await red();
      expect(states(same)).toEqual([`${NAME}:vacuous`]);
      // Its expectation changed by the tests step: updated, judged by its diff.
      fs.writeFileSync(path.join(cwd, TEST), body("5).not.toBe(6", "1"));
      const r = await red([], "logs/build-tests-red-1-2.md");
      expect(r.code).toBe(0);
      expect(r.json.tests).toEqual([
        expect.objectContaining({ testName: NAME, state: "updated", base: start }),
      ]);
      expect(r.json.gaps).toEqual([]);
      expect(fs.readFileSync(path.join(cwd, "logs/build-tests-red-1-2.md"), "utf-8")).toContain(
        "Updated: 1",
      );
      const g = await green();
      expect(g.code).toBe(0);
      expect(g.json.unproven).toEqual([]);
      // The expectation's line changed: not additive, and the report carries the line diff.
      expect(g.json.updated).toEqual([
        {
          task: 1,
          test: TEST,
          name: NAME,
          base: start,
          additive: false,
          diff: [
            `   it('${NAME}', () => {`,
            "-    expect(clamp(5, 1, 10)).toBe(5);",
            "+    expect(clamp(5, 1, 10)).toBe(5).not.toBe(6);",
            "   });",
          ].join("\n"),
        },
      ]);
      const out = report();
      expect(out).toContain("## Updated tests");
      expect(out).toContain("not additive: a line of the test was removed or changed");
      expect(out).toContain(
        `  \`\`\`diff\n     it('${NAME}', () => {\n  -    expect(clamp(5, 1, 10)).toBe(5);`,
      );
    });

    it("an update that only adds lines to the test is additive, and the report says no expectation was dropped", async () => {
      fs.writeFileSync(path.join(cwd, TEST), body("5", "1"));
      const start = commitAll("existing tests");
      fs.mkdirSync(path.join(cwd, "logs"), { recursive: true });
      fs.writeFileSync(
        path.join(cwd, STATUS),
        `${JSON.stringify({ type: "step-done", workflow: "build", step: "build-group-start", status: "DONE", group: 1, parentSha: start })}\n`,
      );
      fs.writeFileSync(
        path.join(cwd, TEST),
        body("5", "1").replace(
          "    expect(clamp(5, 1, 10)).toBe(5);",
          "    expect(clamp(5, 1, 10)).toBe(5);\n    expect(clamp(11, 1, 10)).toBe(10);",
        ),
      );
      vi.stubEnv("FAKE_EXIT", "0");
      vi.stubEnv("FAKE_JUNIT", junit(passed(`clamp > ${NAME}`)));
      const r = await red();
      expect(states(r)).toEqual([`${NAME}:updated`]);
      const g = await green();
      expect(g.code).toBe(0);
      expect(g.json.updated).toEqual([
        expect.objectContaining({
          task: 1,
          additive: true,
          diff: expect.stringContaining("+    expect(clamp(11, 1, 10)).toBe(10);"),
        }),
      ]);
      expect(g.json.updated[0].diff).not.toContain("\n-");
      expect(report()).toContain("additive: no line of the test was removed");
    });
  });

  it("green reads the group's build-tests-red rows: a planned test not passing now is not-green, and no row leaves every planned test unproven, never a gap", async () => {
    writePlan([TASK_1, testTask(2, [[OTHER, "third"]])]);
    fs.writeFileSync(path.join(cwd, OTHER), "expect(clamp(0, 1, 10)).toBe(1);\n");
    vi.stubEnv("FAKE_EXIT", "0");
    vi.stubEnv("FAKE_JUNIT", junit(passed(NAME), passed("third")));
    let r = await green();
    expect(r.code).toBe(0);
    expect(r.json.gaps).toEqual([]);
    expect(r.json.verdict).toBe("PASS");
    expect(
      (r.json.unproven as Array<{ task: number; name: string }>).map((u) => `${u.task}:${u.name}`),
    ).toEqual([`1:${NAME}`, "2:third"]);
    expect(r.json.unproven[0].detail).toContain("no tests step recorded a red");
    expect(report()).toContain("| no row |");
    expect(report()).toContain("Unproven: 2");
    expect(report()).toContain("## Unproven");
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME), failed("third")));
    expect((await red()).code).toBe(0);
    vi.stubEnv("FAKE_JUNIT", junit(passed(NAME), failed("third")));
    r = await green();
    expect(r.code).toBe(1);
    expect(r.json.gaps).toEqual([
      expect.objectContaining({ task: 2, kind: "not-green", fixable: true }),
    ]);
    expect(report()).toContain("| red |");
    expect(report()).toContain("## Runner output");
    expect(r.json.verdict).toBe("CONCERNS");
  });

  it("green: a passed-accepted test is already landed, not a gap", async () => {
    vi.stubEnv("FAKE_EXIT", "0");
    vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
    fs.mkdirSync(path.join(cwd, "logs"), { recursive: true });
    fs.writeFileSync(
      path.join(cwd, WRITER_LOG),
      `PASSES — TASK 1: \`${TEST}\` \`${NAME}\`: clamp already bounds its input\n`,
    );
    expect((await red([`--writer-log=${WRITER_LOG}`])).code).toBe(0);
    const r = await green();
    expect(r.code).toBe(0);
    expect(r.json.gaps).toEqual([]);
    expect(r.json.alreadyLanded).toEqual([
      { task: 1, test: TEST, name: NAME, reason: "clamp already bounds its input" },
    ]);
    expect(report()).toContain("## Already landed");
    expect(report()).toContain("| passed-accepted |");
  });

  it("green: a red state the tests step left as a gap is unproven, naming the state", async () => {
    vi.stubEnv("FAKE_EXIT", "0");
    vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
    expect((await red()).code).toBe(1);
    const r = await green();
    expect(kinds(r)).toEqual([]);
    expect(r.json.unproven).toEqual([expect.objectContaining({ task: 1, test: TEST, name: NAME })]);
    expect(r.json.unproven[0].detail).toContain("vacuous");
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
    expect(r.json).toMatchObject({ enforced: true });
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
    expect(kinds(r)).toEqual(["no-test-first", "test-first-unread"]);
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
      ).json.unproven.map((u: { task: number }) => u.task);
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
    expect(Object.keys(r.json)).not.toContain("testOrderOnly");
    expect(Object.keys(r.json)).not.toContain("lateRedUnchecked");
    expect(report()).toContain("Gaps: 0");
    expect(report()).toContain("Verdict: PASS");
    expect(report()).toContain("| 1 |");
  });

  it("green prints a verdict and a fixable per gap: every gap fixable is CONCERNS", async () => {
    writePlan([TASK_1, testTask(2, [[TEST, "second"]]), testTask(3, [[OTHER, "third"]])]);
    fs.writeFileSync(path.join(cwd, OTHER), "expect(clamp(0, 1, 10)).toBe(1);\n");
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME), failed("second"), failed("third")));
    expect((await red()).code).toBe(0);
    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME), passed("second"), passed("third")));
    const r = await green();
    expect(r.code).toBe(1);
    expect(r.json.verdict).toBe("CONCERNS");
    expect(
      (r.json.gaps as Array<{ kind: string; fixable: boolean | null }>).map(
        (g) => `${g.kind}:${g.fixable}`,
      ),
    ).toEqual(["not-green:true"]);
    expect(report()).toContain("Verdict: CONCERNS");
    expect(report()).toContain(`TASK 1: \`${TEST}\` \`${NAME}\` — not-green — Fixable: true`);
  });

  it("green: lists each gap kind, with the runner output", async () => {
    writePlan([
      TASK_1,
      testTask(2, [[TEST, "second"]]),
      taskBlock(3, ["  - **DONE WHEN:** x"]),
      taskBlock(4, ["  - **DONE WHEN:** x", "  - **TEST FIRST:**", "    - `only-one`."]),
    ]);
    vi.stubEnv("FAKE_EXIT", "1");
    vi.stubEnv("FAKE_JUNIT", junit(failed(NAME), failed("second")));
    expect((await red()).code).toBe(0);
    vi.stubEnv("FAKE_JUNIT", junit(passed(NAME), failed("second")));
    const r = await green();
    expect(r.code).toBe(1);
    expect(
      (r.json.gaps as Array<{ task: number; kind: string }>).map((g) => `${g.task}:${g.kind}`),
    ).toEqual(["2:not-green", "3:no-test-first", "4:test-first-malformed"]);
    expect(report()).toContain("## Runner output");
    expect(report()).not.toContain("Test order only");
  });

  describe("test exceptions", () => {
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
    const EXCEPTION = `  - **TEST EXCEPTION:** \`${TEST}\` \`${NAME}\` — code landed before its test; approved by the owner.`;

    it("green reads a TEST EXCEPTION field inside the block: it clears a missing red only from a human-made commit, never not-green", async () => {
      const unproven = (r: { json: Record<string, unknown> }) =>
        (r.json.unproven as Array<{ name: string }>).map((u) => u.name);
      writePlan([testTask(1, [[TEST, NAME]], [EXCEPTION])]);
      statusRow({ step: "build-worktree-setup", artifacts: [] });
      vi.stubEnv("FAKE_EXIT", "0");
      vi.stubEnv("FAKE_JUNIT", junit(passed(NAME)));
      let r = await green();
      expect(kinds(r)).toEqual([]);
      expect(unproven(r)).toEqual([NAME]);
      expect(report()).toContain("not honoured");
      expect(report()).toContain("not committed");

      statusRow({ step: "build-plan-verify", artifacts: [] });
      const stepCommit = commit("chore(1-x): plan-verify group 1 attempt 1");
      r = await green();
      expect(unproven(r)).toEqual([NAME]);
      expect(report()).toContain(stepCommit.slice(0, 7));
      expect(report()).toContain("workflow step commit");

      writePlan([
        testTask(1, [[TEST, NAME]], [EXCEPTION.replace("the owner.", "the owner 2026-10-22.")]),
      ]);
      commit("docs(1-x): accept test order for TASK 1", ["plan.md"]);
      r = await green();
      expect(r.code).toBe(0);
      expect(r.json.gaps).toEqual([]);
      expect(unproven(r)).toEqual([]);
      expect(report()).not.toContain("not honoured");
      expect(report()).toMatch(/Task 1 — honoured; cleared the red for/);

      vi.stubEnv("FAKE_EXIT", "1");
      vi.stubEnv("FAKE_JUNIT", junit(failed(NAME)));
      r = await green();
      expect(kinds(r)).toEqual(["not-green"]);
    });

    const EXCEPTION_ONLY = taskBlock(1, [
      "  - **DONE WHEN:** the generated file exists",
      "  - **TEST EXCEPTION:** a generated file; no test can fail first.",
    ]);

    it("green refuses an exception-only task from a workflow step commit: exception-refused, verdict FAIL", async () => {
      writePlan([EXCEPTION_ONLY]);
      statusRow({ step: "build-plan-convert", artifacts: ["plan.md"] });
      const stepCommit = commit("chore(1-x): plan-convert attempt 1");
      const r = await green();
      expect(r.code).toBe(1);
      expect(kinds(r)).toEqual(["exception-refused"]);
      expect(r.json.verdict).toBe("FAIL");
      expect(r.json.gaps[0].fixable).toBe(false);
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
