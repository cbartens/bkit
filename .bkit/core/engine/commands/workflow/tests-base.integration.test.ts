// tests-base.integration.test.ts — `bkit tests base` over real temp git repos: the base commit is
// reachable as `refs/remotes/origin/dev`, the package runner is the gate fixture, and `gh` is the
// PATH-shimmed stub. Integration-tier: every case runs the verb against a real checkout.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

import { afterEach, describe, expect, it, vi } from "vitest";

import { useGateRunner } from "../../../../../vitest.gate-fixture";
import { runCommand } from "../lib";
import { COMMANDS } from "../registry";

useGateRunner();

vi.setConfig({ testTimeout: 60_000 });

const GH_BIN = path.resolve("tests/fixtures/gh/bin");
const dirs: string[] = [];
afterEach(() => {
  vi.unstubAllEnvs();
  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
});

const g = (cwd: string, ...args: string[]) =>
  spawnSync(
    "git",
    ["-c", "user.email=t@t", "-c", "user.name=t", "-c", "commit.gpgsign=false", ...args],
    {
      cwd,
      encoding: "utf-8",
    },
  );
const git = (cwd: string, ...args: string[]) => {
  const res = g(cwd, ...args);
  expect(res.status, res.stderr).toBe(0);
  return res.stdout.trim();
};
const write = (cwd: string, rel: string, body: string) => {
  fs.mkdirSync(path.dirname(path.join(cwd, rel)), { recursive: true });
  fs.writeFileSync(path.join(cwd, rel), body);
};

/** A one-file "test suite": each key is a case, each value `pass`, `fail`, `skip` (reported skipped), `env` (passes only when `.env` exists) or `nohooks` (passes only when `GIT_CONFIG_COUNT` is unset). */
const spec = (cases: Record<string, string>) => JSON.stringify(cases);

/** The package's `bkit:test:file`: runs the named spec files and writes JUnit to $BKIT_TEST_REPORT. */
const RUNNER = `import fs from "node:fs";
const out = process.env.BKIT_TEST_REPORT;
let bad = 0;
const cases = [];
for (const file of process.argv.slice(2)) {
  const spec = JSON.parse(fs.readFileSync(file, "utf8"));
  if (spec.__no_report) process.exit(1);
  if (spec.__crash) {
    if (out) fs.writeFileSync(out, "<testsuite></testsuite>");
    process.exit(1);
  }
  for (const [name, want] of Object.entries(spec)) {
    const ok =
      want === "pass" ||
      (want === "env" && fs.existsSync(".env")) ||
      (want === "nohooks" && !process.env.GIT_CONFIG_COUNT);
    const skipped = want === "skip";
    if (!ok && !skipped) bad++;
    cases.push('<testcase classname="' + file + '" name="' + name + '" file="' + file + '">' + (skipped ? "<skipped/>" : ok ? "" : '<failure message="boom"/>') + "</testcase>");
  }
}
if (out) fs.writeFileSync(out, "<testsuite>" + cases.join("") + "</testsuite>");
process.exit(bad ? 1 : 0);
`;

const withTestFile = { scripts: { "bkit:test:file": 'node runner.mjs "$@"' } };

interface Opts {
  /** Files committed on the base commit. */
  baseFiles?: Record<string, string>;
  /** Files committed on top of the base, on the branch. */
  branchFiles?: Record<string, string>;
  basePackage?: object;
  branchPackage?: object;
  /** Point `refs/remotes/origin/dev` at the base commit (default true). */
  originDev?: boolean;
  /** Give the repo an `origin` remote URL naming a GitHub repo. */
  remote?: boolean;
  /** An untracked `.env` in the checkout. */
  env?: boolean;
  /** The run's `runtimeWorktrees`. */
  worktrees?: boolean;
}

function fixture(o: Opts = {}) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tests-base-")));
  dirs.push(root);
  const cwd = path.join(root, "repo");
  fs.mkdirSync(cwd);
  git(cwd, "init", "-q", "-b", "feat");
  write(cwd, ".gitignore", "node_modules/\n");
  write(cwd, "runner.mjs", RUNNER);
  write(cwd, "package.json", JSON.stringify(o.basePackage ?? withTestFile));
  for (const [rel, body] of Object.entries(o.baseFiles ?? {})) write(cwd, rel, body);
  git(cwd, "add", "-A");
  git(cwd, "commit", "-q", "-m", "base");
  const base = git(cwd, "rev-parse", "HEAD");
  if (o.originDev !== false) git(cwd, "update-ref", "refs/remotes/origin/dev", base);
  if (o.remote) git(cwd, "remote", "add", "origin", "https://github.com/acme/widgets.git");
  write(cwd, "package.json", JSON.stringify(o.branchPackage ?? o.basePackage ?? withTestFile));
  write(cwd, "branch.txt", "branch work\n");
  for (const [rel, body] of Object.entries(o.branchFiles ?? {})) write(cwd, rel, body);
  git(cwd, "add", "-A");
  git(cwd, "commit", "-q", "-m", "branch");
  if (o.env) write(cwd, ".env", "SECRET=1\n");

  const status = path.join(root, "status.jsonl");
  fs.writeFileSync(
    status,
    `${JSON.stringify({
      type: "runtime-resolved",
      workflow: "build",
      at: "2026-11-09T00:00:00Z",
      runtime: "LOCAL",
      runtimeWorktrees: o.worktrees ?? true,
      runtimeDevPushes: true,
      runtimeGithubCli: false,
      runtimeGithubCliExit: 1,
      runtimeGithubCliErr: "e",
      baseSha: base,
    })}\n`,
  );
  const log = path.join(root, "logs", "gate.log");
  fs.mkdirSync(path.dirname(log), { recursive: true });
  fs.writeFileSync(log, "gate output\n");
  const ghRoot = path.join(root, "gh");
  fs.mkdirSync(path.join(ghRoot, "runs"), { recursive: true });
  fs.mkdirSync(path.join(ghRoot, "jobs"), { recursive: true });
  vi.stubEnv("PATH", `${GH_BIN}${path.delimiter}${process.env.PATH ?? ""}`);
  vi.stubEnv("BKIT_FAKE_GH_FIXTURE_ROOT", ghRoot);
  return { root, cwd, base, status, log, out: path.join(root, "base-check.json"), ghRoot };
}
type Fixture = ReturnType<typeof fixture>;

/** The gate's JUnit report: these cases (`[file, name]`) failed. */
function gateReport(f: Fixture, cases: Array<[string, string]>) {
  write(
    `${f.log}.reports`,
    "gate.xml",
    `<testsuite>${cases
      .map(
        ([file, name]) =>
          `<testcase classname="${file}" name="${name}" file="${file}"><failure message="boom"/></testcase>`,
      )
      .join("")}</testsuite>`,
  );
}

async function bkit(cwd: string, ...argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCommand([...argv, "--json"], COMMANDS, {
    classicVerbs: new Set(),
    cwd,
    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
  });
  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
}

const testsBase = (f: Fixture) =>
  bkit(
    f.cwd,
    "tests",
    "base",
    `--log=${f.log}`,
    `--file=${f.status}`,
    "--workflow=build",
    `--out=${f.out}`,
  );

const registeredWorktrees = (f: Fixture) =>
  git(f.cwd, "worktree", "list", "--porcelain")
    .split("\n")
    .filter((l) => l.startsWith("worktree "));
const installRuns = (f: Fixture) => {
  const file = path.join(f.cwd, ".git", "fixture-install-runs");
  return fs.existsSync(file) ? fs.readFileSync(file, "utf-8").trim().split("\n") : [];
};

/** A completed CI run at `sha` whose jobs are `jobs` (`name` -> conclusion). */
function ciRun(
  f: Fixture,
  o: {
    status?: string;
    conclusion?: string | null;
    event?: string;
    jobs: Record<string, string>;
  },
) {
  write(
    f.ghRoot,
    `runs/${f.base}.json`,
    JSON.stringify({
      total_count: 1,
      workflow_runs: [
        {
          id: 5001,
          name: "ci",
          head_sha: f.base,
          head_branch: "dev",
          status: o.status ?? "completed",
          conclusion: o.conclusion === undefined ? "success" : o.conclusion,
          event: o.event ?? "push",
          html_url: "https://github.com/acme/widgets/actions/runs/5001",
          created_at: "2026-11-09T10:00:00Z",
          updated_at: "2026-11-09T10:05:00Z",
        },
      ],
    }),
  );
  write(
    f.ghRoot,
    "jobs/5001.json",
    JSON.stringify({
      total_count: Object.keys(o.jobs).length,
      jobs: Object.entries(o.jobs).map(([name, conclusion], i) => ({
        id: 9000 + i,
        name,
        head_sha: f.base,
        status: conclusion === "in_progress" ? "in_progress" : "completed",
        conclusion: conclusion === "in_progress" ? null : conclusion,
        started_at: "2026-11-09T10:00:30Z",
        completed_at: "2026-11-09T10:04:30Z",
        html_url: `https://github.com/acme/widgets/actions/runs/5001/job/${9000 + i}`,
      })),
    }),
  );
}

const ciPackage = {
  ...withTestFile,
  bkit: { testing: { ciRequired: ["test"] } },
};
const redOnBase = {
  "tests/a.test.ts": spec({ x: "fail" }),
};

describe("bkit tests base", () => {
  it("reports all from a local run at the merge-base", async () => {
    const f = fixture({
      baseFiles: {
        "tests/a.test.ts": spec({ x: "fail", y: "fail", ok: "pass" }),
        "tests/b.test.ts": spec({ z: "fail" }),
      },
    });
    gateReport(f, [
      ["tests/a.test.ts", "x"],
      ["tests/a.test.ts", "y"],
      ["tests/b.test.ts", "z"],
    ]);
    const r = await testsBase(f);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      verdict: "all",
      reason: null,
      base: f.base,
      source: "local",
      failing: 3,
      baseRed: 3,
      branch: 0,
      undetermined: 0,
    });
    expect(JSON.parse(fs.readFileSync(f.out, "utf-8"))).toMatchObject({
      verdict: "all",
      baseRed: 3,
    });
    expect(registeredWorktrees(f)).toHaveLength(1);
  });

  it("a failing file absent at the base commit is the branch's", async () => {
    const f = fixture({
      baseFiles: { "tests/a.test.ts": spec({ x: "fail" }) },
      branchFiles: { "tests/new.test.ts": spec({ n: "fail" }) },
    });
    gateReport(f, [["tests/new.test.ts", "n"]]);
    const r = await testsBase(f);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      verdict: "none",
      failing: 1,
      baseRed: 0,
      branch: 1,
      undetermined: 0,
    });
    expect(r.json.cases).toEqual([
      expect.objectContaining({ name: "n", file: "tests/new.test.ts", atBase: "absent" }),
    ]);
  });

  it("no JUnit report reads unknown", async () => {
    const f = fixture({ baseFiles: redOnBase });
    const r = await testsBase(f);
    expect(r.code).toBe(0);
    expect(r.json.verdict).toBe("unknown");
    expect(r.json.reason).toContain("no JUnit report");
    expect(installRuns(f)).toEqual([]);
  });

  it("an undeclared bkit:test:file reads unknown", async () => {
    const f = fixture({
      basePackage: { scripts: {} },
      branchPackage: withTestFile,
      baseFiles: redOnBase,
    });
    gateReport(f, [["tests/a.test.ts", "x"]]);
    const r = await testsBase(f);
    expect(r.code).toBe(0);
    expect(r.json.verdict).toBe("unknown");
    expect(r.json.baseRed).toBe(0);
    expect(typeof r.json.reason).toBe("string");
    expect(registeredWorktrees(f)).toHaveLength(1);
  });

  it("a failed base install reads unknown and removes the worktree", async () => {
    const f = fixture({
      basePackage: { ...withTestFile, dependencies: { missing: "1.0.0" } },
      baseFiles: redOnBase,
    });
    gateReport(f, [["tests/a.test.ts", "x"]]);
    const r = await testsBase(f);
    expect(r.code).toBe(0);
    expect(r.json.verdict).toBe("unknown");
    expect(r.json.reason).toContain("base install failed");
    expect(registeredWorktrees(f)).toHaveLength(1);
  });

  it("installs at base with --frozen-lockfile --prefer-offline", async () => {
    const f = fixture({ baseFiles: redOnBase });
    gateReport(f, [["tests/a.test.ts", "x"]]);
    const r = await testsBase(f);
    expect(r.code).toBe(0);
    const args = fs
      .readFileSync(path.join(f.cwd, ".git", "fixture-install-args"), "utf-8")
      .trim()
      .split("\n")
      .map((l) => JSON.parse(l) as string[]);
    expect(args).toContainEqual(["install", "--frozen-lockfile", "--prefer-offline"]);
  });

  it("copies the worktreeCopy entries into the base checkout", async () => {
    const f = fixture({ baseFiles: { "tests/a.test.ts": spec({ e: "env" }) }, env: true });
    gateReport(f, [["tests/a.test.ts", "e"]]);
    const r = await testsBase(f);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ verdict: "none", baseRed: 0, branch: 1 });
  });

  it("no origin/dev ref reads unknown", async () => {
    const f = fixture({ baseFiles: redOnBase, originDev: false });
    gateReport(f, [["tests/a.test.ts", "x"]]);
    const r = await testsBase(f);
    expect(r.code).toBe(0);
    expect(r.json.verdict).toBe("unknown");
    expect(r.json.reason).toContain("no base commit");
    expect(installRuns(f)).toEqual([]);
    expect(registeredWorktrees(f)).toHaveLength(1);
  });

  it("a base file run that writes no report reads unknown", async () => {
    const f = fixture({ baseFiles: { "tests/a.test.ts": spec({ __no_report: "yes" }) } });
    gateReport(f, [["tests/a.test.ts", "x"]]);
    const r = await testsBase(f);
    expect(r.code).toBe(0);
    expect(r.json.verdict).toBe("unknown");
    expect(r.json.reason).toContain("no report from the base run");
  });

  it("a missing required flag is a usage error", async () => {
    const f = fixture({ baseFiles: redOnBase });
    gateReport(f, [["tests/a.test.ts", "x"]]);
    const r = await bkit(
      f.cwd,
      "tests",
      "base",
      `--file=${f.status}`,
      "--workflow=build",
      `--out=${f.out}`,
    );
    expect(r.code).toBe(2);
    expect(r.err).toContain("--log");
    expect(r.err).not.toContain("unknown verb");
    expect(fs.existsSync(f.out)).toBe(false);
    expect(installRuns(f)).toEqual([]);
  });

  it("a passing CI run at the exact base sha settles none without a local run", async () => {
    const f = fixture({
      basePackage: ciPackage,
      baseFiles: redOnBase,
      remote: true,
    });
    ciRun(f, { jobs: { lint: "success", test: "success", "bkit-tests-check": "success" } });
    gateReport(f, [["tests/a.test.ts", "x"]]);
    const r = await testsBase(f);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({
      verdict: "none",
      source: "ci",
      base: f.base,
      baseRed: 0,
      branch: 1,
    });
    expect(installRuns(f)).toEqual([]);
    expect(registeredWorktrees(f)).toHaveLength(1);
  });

  it("a CI run that cannot settle the base falls back to the local run", async () => {
    const green = { lint: "success", test: "success", "bkit-tests-check": "success" };
    const scenarios: Array<{ name: string; prepare: (f: Fixture) => void; remote: boolean }> = [
      {
        name: "skipped lane",
        remote: true,
        prepare: (f) =>
          ciRun(f, { jobs: { lint: "success", test: "skipped", "bkit-tests-check": "success" } }),
      },
      {
        name: "red run",
        remote: true,
        prepare: (f) =>
          ciRun(f, {
            conclusion: "failure",
            jobs: { lint: "success", test: "failure", "bkit-tests-check": "failure" },
          }),
      },
      {
        name: "run still going",
        remote: true,
        prepare: (f) =>
          ciRun(f, {
            status: "in_progress",
            conclusion: null,
            jobs: { lint: "success", test: "in_progress" },
          }),
      },
      {
        name: "gh API error",
        remote: true,
        prepare: (f) => {
          ciRun(f, { jobs: green });
          vi.stubEnv("BKIT_FAKE_GH_API_ERROR", "1");
        },
      },
      { name: "no resolvable repo", prepare: (f) => ciRun(f, { jobs: green }), remote: false },
    ];
    for (const s of scenarios) {
      const f = fixture({
        basePackage: ciPackage,
        baseFiles: redOnBase,
        remote: s.remote,
      });
      s.prepare(f);
      gateReport(f, [["tests/a.test.ts", "x"]]);
      const r = await testsBase(f);
      expect(r.code, s.name).toBe(0);
      expect(r.json, s.name).toMatchObject({ verdict: "all", source: "local", baseRed: 1 });
      expect(installRuns(f), s.name).toHaveLength(1);
      expect(registeredWorktrees(f), s.name).toHaveLength(1);
      vi.unstubAllEnvs();
    }
  });

  it("a pull_request-event CI run at the base sha does not settle none", async () => {
    const f = fixture({ basePackage: ciPackage, baseFiles: redOnBase, remote: true });
    ciRun(f, {
      event: "pull_request",
      jobs: { lint: "success", test: "success", "bkit-tests-check": "success" },
    });
    gateReport(f, [["tests/a.test.ts", "x"]]);
    const r = await testsBase(f);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ verdict: "all", source: "local", baseRed: 1 });
    expect(installRuns(f)).toHaveLength(1);
  });

  it("a base file run that exits non-zero without the failing case reads unknown", async () => {
    const f = fixture({ baseFiles: { "tests/a.test.ts": spec({ __crash: "yes" }) } });
    gateReport(f, [["tests/a.test.ts", "x"]]);
    const r = await testsBase(f);
    expect(r.code).toBe(0);
    expect(r.json.verdict).toBe("unknown");
    expect(r.json.reason).toContain("exit");
    expect(r.json.branch).toBe(0);
    expect(r.json.cases).toEqual([
      expect.objectContaining({ name: "x", file: "tests/a.test.ts", atBase: "unknown" }),
    ]);
  });

  it("a case skipped at the base commit reads unknown, not the branch's", async () => {
    const f = fixture({ baseFiles: { "tests/a.test.ts": spec({ x: "skip" }) } });
    gateReport(f, [["tests/a.test.ts", "x"]]);
    const r = await testsBase(f);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ verdict: "unknown", baseRed: 0, branch: 0, undetermined: 1 });
    expect(r.json.reason).toContain("skipped");
    expect(r.json.cases).toEqual([
      expect.objectContaining({ name: "x", file: "tests/a.test.ts", atBase: "unknown" }),
    ]);
  });

  it("the base test run does not inherit the hooks-off git config", async () => {
    vi.stubEnv("GIT_CONFIG_COUNT", undefined);
    const f = fixture({ baseFiles: { "tests/a.test.ts": spec({ h: "nohooks" }) } });
    gateReport(f, [["tests/a.test.ts", "h"]]);
    const r = await testsBase(f);
    expect(r.code).toBe(0);
    expect(r.json).toMatchObject({ verdict: "none", baseRed: 0, branch: 1 });
  });

  it("adopt follows the run's runtimeWorktrees", async () => {
    const adopt = fixture({ baseFiles: redOnBase, worktrees: false });
    gateReport(adopt, [["tests/a.test.ts", "x"]]);
    expect((await testsBase(adopt)).json.adopt).toBe(true);

    const worktrees = fixture({ baseFiles: redOnBase, worktrees: true });
    gateReport(worktrees, [["tests/a.test.ts", "x"]]);
    expect((await testsBase(worktrees)).json.adopt).toBe(false);
  });

  it("worktreeInstall off reads unknown", async () => {
    const off = {
      ...withTestFile,
      bkit: { workflows: { worktree: { install: false } } },
    };
    const f = fixture({ basePackage: off, baseFiles: redOnBase });
    gateReport(f, [["tests/a.test.ts", "x"]]);
    const r = await testsBase(f);
    expect(r.code).toBe(0);
    expect(r.json.verdict).toBe("unknown");
    expect(r.json.reason).toContain("no install at the base commit");
    expect(installRuns(f)).toEqual([]);
    expect(registeredWorktrees(f)).toHaveLength(1);
  });
});
