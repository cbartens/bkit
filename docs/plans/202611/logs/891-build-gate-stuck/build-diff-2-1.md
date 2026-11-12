diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 5adfacbe0..91b227235 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -372,6 +372,7 @@ Run the deepest declared local gate, or one test file to record a red and audit
 <!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
+| `base` | workflow | `--log` `--file` `--workflow` `--out` | Check whether the failing tests of a red gate also fail on the commit the branch started from; exit 0 for every verdict. |
 | `changed` | by hand | `--lock-wait-s` `--base` `--fallback` | Check only the files changed since --base: run `bkit:gate:changed` with them as arguments, else the --fallback gate; exit 0 PASS or nothing changed, 1 FAIL, 4 could not run, 81 tests lock held. |
 | `run` | by hand | **`--gate`** **`--log`** `--tail` `--lock-wait-s` `--artifact` `--fid` `--step` `--attempt` `--file` `--workflow` `--ci-run` `--ci-url` | Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run, 81 tests lock held. |
 | `red` | workflow | **`--file`** **`--workflow`** **`--group`** **`--plan`** **`--log`** `--writer-log` | Run every TEST FIRST test of one group's open tasks before any task code exists, and write one build-tests-red row holding a state and blob per planned test; a test an earlier row of the group proved red, its file unchanged since, is not run again. Exit 0 every test red, 1 a gap (a test passing, absent from its report, failing lint, or its file missing), 3 bkit:test:file undeclared (blobs recorded, nothing ran), 4 a script could not run. |
diff --git a/.bkit/core/engine/commands/conventions.test.ts b/.bkit/core/engine/commands/conventions.test.ts
index d746914cd..6af8ed07e 100644
--- a/.bkit/core/engine/commands/conventions.test.ts
+++ b/.bkit/core/engine/commands/conventions.test.ts
@@ -172,6 +172,8 @@ const HELPER_SOURCES = new Set([
   path.join("commands", "workflow", "test-blocks.ts"),
   // The `tests changed` verb, registered on `bkit tests` in tests.ts.
   path.join("commands", "workflow", "tests-changed.ts"),
+  // The `tests base` verb, registered on `bkit tests` in tests.ts.
+  path.join("commands", "workflow", "tests-base.ts"),
   // The JUnit reader and one-file test runner, read by `tests` and the base-commit check.
   path.join("commands", "workflow", "junit.ts"),
   // The pinned-checksum check behind `ci pins`.
diff --git a/.bkit/core/engine/commands/workflow/tests-base.integration.test.ts b/.bkit/core/engine/commands/workflow/tests-base.integration.test.ts
new file mode 100644
index 000000000..9d40fc415
--- /dev/null
+++ b/.bkit/core/engine/commands/workflow/tests-base.integration.test.ts
@@ -0,0 +1,482 @@
+// tests-base.integration.test.ts — `bkit tests base` over real temp git repos: the base commit is
+// reachable as `refs/remotes/origin/dev`, the package runner is the gate fixture, and `gh` is the
+// PATH-shimmed stub. Integration-tier: every case runs the verb against a real checkout.
+
+import { spawnSync } from "node:child_process";
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+
+import { afterEach, describe, expect, it, vi } from "vitest";
+
+import { useGateRunner } from "../../../../../vitest.gate-fixture";
+import { runCommand } from "../lib";
+import { COMMANDS } from "../registry";
+
+useGateRunner();
+
+vi.setConfig({ testTimeout: 60_000 });
+
+const GH_BIN = path.resolve("tests/fixtures/gh/bin");
+const dirs: string[] = [];
+afterEach(() => {
+  vi.unstubAllEnvs();
+  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
+});
+
+const g = (cwd: string, ...args: string[]) =>
+  spawnSync(
+    "git",
+    ["-c", "user.email=t@t", "-c", "user.name=t", "-c", "commit.gpgsign=false", ...args],
+    {
+      cwd,
+      encoding: "utf-8",
+    },
+  );
+const git = (cwd: string, ...args: string[]) => {
+  const res = g(cwd, ...args);
+  expect(res.status, res.stderr).toBe(0);
+  return res.stdout.trim();
+};
+const write = (cwd: string, rel: string, body: string) => {
+  fs.mkdirSync(path.dirname(path.join(cwd, rel)), { recursive: true });
+  fs.writeFileSync(path.join(cwd, rel), body);
+};
+
+/** A one-file "test suite": each key is a case, each value `pass`, `fail` or `env` (passes only when `.env` exists). */
+const spec = (cases: Record<string, string>) => JSON.stringify(cases);
+
+/** The package's `bkit:test:file`: runs the named spec files and writes JUnit to $BKIT_TEST_REPORT. */
+const RUNNER = `import fs from "node:fs";
+const out = process.env.BKIT_TEST_REPORT;
+let bad = 0;
+const cases = [];
+for (const file of process.argv.slice(2)) {
+  const spec = JSON.parse(fs.readFileSync(file, "utf8"));
+  if (spec.__no_report) process.exit(1);
+  for (const [name, want] of Object.entries(spec)) {
+    const ok = want === "pass" || (want === "env" && fs.existsSync(".env"));
+    if (!ok) bad++;
+    cases.push('<testcase classname="' + file + '" name="' + name + '" file="' + file + '">' + (ok ? "" : '<failure message="boom"/>') + "</testcase>");
+  }
+}
+if (out) fs.writeFileSync(out, "<testsuite>" + cases.join("") + "</testsuite>");
+process.exit(bad ? 1 : 0);
+`;
+
+const withTestFile = { scripts: { "bkit:test:file": 'node runner.mjs "$@"' } };
+
+interface Opts {
+  /** Files committed on the base commit. */
+  baseFiles?: Record<string, string>;
+  /** Files committed on top of the base, on the branch. */
+  branchFiles?: Record<string, string>;
+  basePackage?: object;
+  branchPackage?: object;
+  /** Point `refs/remotes/origin/dev` at the base commit (default true). */
+  originDev?: boolean;
+  /** Give the repo an `origin` remote URL naming a GitHub repo. */
+  remote?: boolean;
+  /** An untracked `.env` in the checkout. */
+  env?: boolean;
+  /** The run's `runtimeWorktrees`. */
+  worktrees?: boolean;
+}
+
+function fixture(o: Opts = {}) {
+  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-tests-base-")));
+  dirs.push(root);
+  const cwd = path.join(root, "repo");
+  fs.mkdirSync(cwd);
+  git(cwd, "init", "-q", "-b", "feat");
+  write(cwd, ".gitignore", "node_modules/\n");
+  write(cwd, "runner.mjs", RUNNER);
+  write(cwd, "package.json", JSON.stringify(o.basePackage ?? withTestFile));
+  for (const [rel, body] of Object.entries(o.baseFiles ?? {})) write(cwd, rel, body);
+  git(cwd, "add", "-A");
+  git(cwd, "commit", "-q", "-m", "base");
+  const base = git(cwd, "rev-parse", "HEAD");
+  if (o.originDev !== false) git(cwd, "update-ref", "refs/remotes/origin/dev", base);
+  if (o.remote) git(cwd, "remote", "add", "origin", "https://github.com/acme/widgets.git");
+  write(cwd, "package.json", JSON.stringify(o.branchPackage ?? o.basePackage ?? withTestFile));
+  write(cwd, "branch.txt", "branch work\n");
+  for (const [rel, body] of Object.entries(o.branchFiles ?? {})) write(cwd, rel, body);
+  git(cwd, "add", "-A");
+  git(cwd, "commit", "-q", "-m", "branch");
+  if (o.env) write(cwd, ".env", "SECRET=1\n");
+
+  const status = path.join(root, "status.jsonl");
+  fs.writeFileSync(
+    status,
+    `${JSON.stringify({
+      type: "runtime-resolved",
+      workflow: "build",
+      at: "2026-11-09T00:00:00Z",
+      runtime: "LOCAL",
+      runtimeWorktrees: o.worktrees ?? true,
+      runtimeDevPushes: true,
+      runtimeGithubCli: false,
+      runtimeGithubCliExit: 1,
+      runtimeGithubCliErr: "e",
+      baseSha: base,
+    })}\n`,
+  );
+  const log = path.join(root, "logs", "gate.log");
+  fs.mkdirSync(path.dirname(log), { recursive: true });
+  fs.writeFileSync(log, "gate output\n");
+  const ghRoot = path.join(root, "gh");
+  fs.mkdirSync(path.join(ghRoot, "runs"), { recursive: true });
+  fs.mkdirSync(path.join(ghRoot, "jobs"), { recursive: true });
+  vi.stubEnv("PATH", `${GH_BIN}${path.delimiter}${process.env.PATH ?? ""}`);
+  vi.stubEnv("BKIT_FAKE_GH_FIXTURE_ROOT", ghRoot);
+  return { root, cwd, base, status, log, out: path.join(root, "base-check.json"), ghRoot };
+}
+type Fixture = ReturnType<typeof fixture>;
+
+/** The gate's JUnit report: these cases (`[file, name]`) failed. */
+function gateReport(f: Fixture, cases: Array<[string, string]>) {
+  write(
+    `${f.log}.reports`,
+    "gate.xml",
+    `<testsuite>${cases
+      .map(
+        ([file, name]) =>
+          `<testcase classname="${file}" name="${name}" file="${file}"><failure message="boom"/></testcase>`,
+      )
+      .join("")}</testsuite>`,
+  );
+}
+
+async function bkit(cwd: string, ...argv: string[]) {
+  const out: string[] = [];
+  const err: string[] = [];
+  const code = await runCommand([...argv, "--json"], COMMANDS, {
+    classicVerbs: new Set(),
+    cwd,
+    io: { stdout: (t) => out.push(t), stderr: (t) => err.push(t) },
+  });
+  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
+}
+
+const testsBase = (f: Fixture) =>
+  bkit(
+    f.cwd,
+    "tests",
+    "base",
+    `--log=${f.log}`,
+    `--file=${f.status}`,
+    "--workflow=build",
+    `--out=${f.out}`,
+  );
+
+const registeredWorktrees = (f: Fixture) =>
+  git(f.cwd, "worktree", "list", "--porcelain")
+    .split("\n")
+    .filter((l) => l.startsWith("worktree "));
+const installRuns = (f: Fixture) => {
+  const file = path.join(f.cwd, ".git", "fixture-install-runs");
+  return fs.existsSync(file) ? fs.readFileSync(file, "utf-8").trim().split("\n") : [];
+};
+
+/** A completed CI run at `sha` whose jobs are `jobs` (`name` -> conclusion). */
+function ciRun(
+  f: Fixture,
+  o: { status?: string; conclusion?: string | null; jobs: Record<string, string> },
+) {
+  write(
+    f.ghRoot,
+    `runs/${f.base}.json`,
+    JSON.stringify({
+      total_count: 1,
+      workflow_runs: [
+        {
+          id: 5001,
+          name: "ci",
+          head_sha: f.base,
+          head_branch: "dev",
+          status: o.status ?? "completed",
+          conclusion: o.conclusion === undefined ? "success" : o.conclusion,
+          event: "push",
+          html_url: "https://github.com/acme/widgets/actions/runs/5001",
+          created_at: "2026-11-09T10:00:00Z",
+          updated_at: "2026-11-09T10:05:00Z",
+        },
+      ],
+    }),
+  );
+  write(
+    f.ghRoot,
+    "jobs/5001.json",
+    JSON.stringify({
+      total_count: Object.keys(o.jobs).length,
+      jobs: Object.entries(o.jobs).map(([name, conclusion], i) => ({
+        id: 9000 + i,
+        name,
+        head_sha: f.base,
+        status: conclusion === "in_progress" ? "in_progress" : "completed",
+        conclusion: conclusion === "in_progress" ? null : conclusion,
+        started_at: "2026-11-09T10:00:30Z",
+        completed_at: "2026-11-09T10:04:30Z",
+        html_url: `https://github.com/acme/widgets/actions/runs/5001/job/${9000 + i}`,
+      })),
+    }),
+  );
+}
+
+const ciPackage = {
+  ...withTestFile,
+  bkit: { testing: { ciRequired: ["test"] } },
+};
+const redOnBase = {
+  "tests/a.test.ts": spec({ x: "fail" }),
+};
+
+describe("bkit tests base", () => {
+  it("reports all from a local run at the merge-base", async () => {
+    const f = fixture({
+      baseFiles: {
+        "tests/a.test.ts": spec({ x: "fail", y: "fail", ok: "pass" }),
+        "tests/b.test.ts": spec({ z: "fail" }),
+      },
+    });
+    gateReport(f, [
+      ["tests/a.test.ts", "x"],
+      ["tests/a.test.ts", "y"],
+      ["tests/b.test.ts", "z"],
+    ]);
+    const r = await testsBase(f);
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({
+      verdict: "all",
+      reason: null,
+      base: f.base,
+      source: "local",
+      failing: 3,
+      baseRed: 3,
+      branch: 0,
+      undetermined: 0,
+    });
+    expect(JSON.parse(fs.readFileSync(f.out, "utf-8"))).toMatchObject({
+      verdict: "all",
+      baseRed: 3,
+    });
+    expect(registeredWorktrees(f)).toHaveLength(1);
+  });
+
+  it("a failing file absent at the base commit is the branch's", async () => {
+    const f = fixture({
+      baseFiles: { "tests/a.test.ts": spec({ x: "fail" }) },
+      branchFiles: { "tests/new.test.ts": spec({ n: "fail" }) },
+    });
+    gateReport(f, [["tests/new.test.ts", "n"]]);
+    const r = await testsBase(f);
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({
+      verdict: "none",
+      failing: 1,
+      baseRed: 0,
+      branch: 1,
+      undetermined: 0,
+    });
+    expect(r.json.cases).toEqual([
+      expect.objectContaining({ name: "n", file: "tests/new.test.ts", atBase: "absent" }),
+    ]);
+  });
+
+  it("no JUnit report reads unknown", async () => {
+    const f = fixture({ baseFiles: redOnBase });
+    const r = await testsBase(f);
+    expect(r.code).toBe(0);
+    expect(r.json.verdict).toBe("unknown");
+    expect(r.json.reason).toContain("no JUnit report");
+    expect(installRuns(f)).toEqual([]);
+  });
+
+  it("an undeclared bkit:test:file reads unknown", async () => {
+    const f = fixture({
+      basePackage: { scripts: {} },
+      branchPackage: withTestFile,
+      baseFiles: redOnBase,
+    });
+    gateReport(f, [["tests/a.test.ts", "x"]]);
+    const r = await testsBase(f);
+    expect(r.code).toBe(0);
+    expect(r.json.verdict).toBe("unknown");
+    expect(r.json.baseRed).toBe(0);
+    expect(typeof r.json.reason).toBe("string");
+    expect(registeredWorktrees(f)).toHaveLength(1);
+  });
+
+  it("a failed base install reads unknown and removes the worktree", async () => {
+    const f = fixture({
+      basePackage: { ...withTestFile, dependencies: { missing: "1.0.0" } },
+      baseFiles: redOnBase,
+    });
+    gateReport(f, [["tests/a.test.ts", "x"]]);
+    const r = await testsBase(f);
+    expect(r.code).toBe(0);
+    expect(r.json.verdict).toBe("unknown");
+    expect(r.json.reason).toContain("base install failed");
+    expect(registeredWorktrees(f)).toHaveLength(1);
+  });
+
+  it("installs at base with --frozen-lockfile --prefer-offline", async () => {
+    const f = fixture({ baseFiles: redOnBase });
+    gateReport(f, [["tests/a.test.ts", "x"]]);
+    const r = await testsBase(f);
+    expect(r.code).toBe(0);
+    const args = fs
+      .readFileSync(path.join(f.cwd, ".git", "fixture-install-args"), "utf-8")
+      .trim()
+      .split("\n")
+      .map((l) => JSON.parse(l) as string[]);
+    expect(args).toContainEqual(["install", "--frozen-lockfile", "--prefer-offline"]);
+  });
+
+  it("copies the worktreeCopy entries into the base checkout", async () => {
+    const f = fixture({ baseFiles: { "tests/a.test.ts": spec({ e: "env" }) }, env: true });
+    gateReport(f, [["tests/a.test.ts", "e"]]);
+    const r = await testsBase(f);
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ verdict: "none", baseRed: 0, branch: 1 });
+  });
+
+  it("no origin/dev ref reads unknown", async () => {
+    const f = fixture({ baseFiles: redOnBase, originDev: false });
+    gateReport(f, [["tests/a.test.ts", "x"]]);
+    const r = await testsBase(f);
+    expect(r.code).toBe(0);
+    expect(r.json.verdict).toBe("unknown");
+    expect(r.json.reason).toContain("no base commit");
+    expect(installRuns(f)).toEqual([]);
+    expect(registeredWorktrees(f)).toHaveLength(1);
+  });
+
+  it("a base file run that writes no report reads unknown", async () => {
+    const f = fixture({ baseFiles: { "tests/a.test.ts": spec({ __no_report: "yes" }) } });
+    gateReport(f, [["tests/a.test.ts", "x"]]);
+    const r = await testsBase(f);
+    expect(r.code).toBe(0);
+    expect(r.json.verdict).toBe("unknown");
+    expect(r.json.reason).toContain("no report from the base run");
+  });
+
+  it("a missing required flag is a usage error", async () => {
+    const f = fixture({ baseFiles: redOnBase });
+    gateReport(f, [["tests/a.test.ts", "x"]]);
+    const r = await bkit(
+      f.cwd,
+      "tests",
+      "base",
+      `--file=${f.status}`,
+      "--workflow=build",
+      `--out=${f.out}`,
+    );
+    expect(r.code).toBe(2);
+    expect(r.err).toContain("--log");
+    expect(r.err).not.toContain("unknown verb");
+    expect(fs.existsSync(f.out)).toBe(false);
+    expect(installRuns(f)).toEqual([]);
+  });
+
+  it("a passing CI run at the exact base sha settles none without a local run", async () => {
+    const f = fixture({
+      basePackage: ciPackage,
+      baseFiles: redOnBase,
+      remote: true,
+    });
+    ciRun(f, { jobs: { lint: "success", test: "success", "bkit-tests-check": "success" } });
+    gateReport(f, [["tests/a.test.ts", "x"]]);
+    const r = await testsBase(f);
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({
+      verdict: "none",
+      source: "ci",
+      base: f.base,
+      baseRed: 0,
+      branch: 1,
+    });
+    expect(installRuns(f)).toEqual([]);
+    expect(registeredWorktrees(f)).toHaveLength(1);
+  });
+
+  it("a CI run that cannot settle the base falls back to the local run", async () => {
+    const green = { lint: "success", test: "success", "bkit-tests-check": "success" };
+    const scenarios: Array<{ name: string; prepare: (f: Fixture) => void; remote: boolean }> = [
+      {
+        name: "skipped lane",
+        remote: true,
+        prepare: (f) =>
+          ciRun(f, { jobs: { lint: "success", test: "skipped", "bkit-tests-check": "success" } }),
+      },
+      {
+        name: "red run",
+        remote: true,
+        prepare: (f) =>
+          ciRun(f, {
+            conclusion: "failure",
+            jobs: { lint: "success", test: "failure", "bkit-tests-check": "failure" },
+          }),
+      },
+      {
+        name: "run still going",
+        remote: true,
+        prepare: (f) =>
+          ciRun(f, {
+            status: "in_progress",
+            conclusion: null,
+            jobs: { lint: "success", test: "in_progress" },
+          }),
+      },
+      {
+        name: "gh API error",
+        remote: true,
+        prepare: (f) => {
+          ciRun(f, { jobs: green });
+          vi.stubEnv("BKIT_FAKE_GH_API_ERROR", "1");
+        },
+      },
+      { name: "no resolvable repo", prepare: (f) => ciRun(f, { jobs: green }), remote: false },
+    ];
+    for (const s of scenarios) {
+      const f = fixture({
+        basePackage: ciPackage,
+        baseFiles: redOnBase,
+        remote: s.remote,
+      });
+      s.prepare(f);
+      gateReport(f, [["tests/a.test.ts", "x"]]);
+      const r = await testsBase(f);
+      expect(r.code, s.name).toBe(0);
+      expect(r.json, s.name).toMatchObject({ verdict: "all", source: "local", baseRed: 1 });
+      expect(installRuns(f), s.name).toHaveLength(1);
+      expect(registeredWorktrees(f), s.name).toHaveLength(1);
+      vi.unstubAllEnvs();
+    }
+  });
+
+  it("adopt follows the run's runtimeWorktrees", async () => {
+    const adopt = fixture({ baseFiles: redOnBase, worktrees: false });
+    gateReport(adopt, [["tests/a.test.ts", "x"]]);
+    expect((await testsBase(adopt)).json.adopt).toBe(true);
+
+    const worktrees = fixture({ baseFiles: redOnBase, worktrees: true });
+    gateReport(worktrees, [["tests/a.test.ts", "x"]]);
+    expect((await testsBase(worktrees)).json.adopt).toBe(false);
+  });
+
+  it("worktreeInstall off reads unknown", async () => {
+    const off = {
+      ...withTestFile,
+      bkit: { workflows: { worktree: { install: false } } },
+    };
+    const f = fixture({ basePackage: off, baseFiles: redOnBase });
+    gateReport(f, [["tests/a.test.ts", "x"]]);
+    const r = await testsBase(f);
+    expect(r.code).toBe(0);
+    expect(r.json.verdict).toBe("unknown");
+    expect(r.json.reason).toContain("no install at the base commit");
+    expect(installRuns(f)).toEqual([]);
+    expect(registeredWorktrees(f)).toHaveLength(1);
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/tests-base.test.ts b/.bkit/core/engine/commands/workflow/tests-base.test.ts
new file mode 100644
index 000000000..e50f472c7
--- /dev/null
+++ b/.bkit/core/engine/commands/workflow/tests-base.test.ts
@@ -0,0 +1,121 @@
+import { describe, expect, it } from "vitest";
+
+import { baseVerdict, caseFile } from "./tests-base";
+import type { JunitCase } from "./junit";
+
+const failing = (over: Partial<JunitCase>): JunitCase => ({
+  name: "case",
+  state: "failure",
+  classname: null,
+  file: null,
+  message: "",
+  detail: "",
+  ...over,
+});
+
+type AtBase = "red" | "pass" | "absent" | "unknown";
+const row = (name: string, atBase: AtBase, file: string | null = "tests/a.test.ts") => ({
+  name,
+  file,
+  atBase,
+});
+
+describe("baseVerdict", () => {
+  it("all when every failing case also fails at base", () => {
+    const v = baseVerdict([row("a", "red"), row("b", "red"), row("c", "red", "tests/b.test.ts")]);
+    expect(v).toMatchObject({
+      verdict: "all",
+      reason: null,
+      failing: 3,
+      baseRed: 3,
+      branch: 0,
+      undetermined: 0,
+    });
+  });
+
+  it("some with the base-red and branch counts", () => {
+    const v = baseVerdict([
+      row("a", "red"),
+      row("b", "red"),
+      row("c", "red"),
+      row("d", "pass"),
+      row("e", "absent", "tests/new.test.ts"),
+    ]);
+    expect(v).toMatchObject({
+      verdict: "some",
+      reason: null,
+      failing: 5,
+      baseRed: 3,
+      branch: 2,
+      undetermined: 0,
+    });
+  });
+
+  it("none when each case passes, is absent, or its file is absent at base", () => {
+    const v = baseVerdict([
+      row("a", "pass"),
+      row("b", "absent"),
+      row("c", "absent", "tests/new.test.ts"),
+    ]);
+    expect(v).toMatchObject({
+      verdict: "none",
+      reason: null,
+      failing: 3,
+      baseRed: 0,
+      branch: 3,
+      undetermined: 0,
+    });
+  });
+
+  it("unknown with a reason when no case is base-red and one is undetermined", () => {
+    const v = baseVerdict([row("a", "pass"), row("b", "unknown", null)]);
+    expect(v.verdict).toBe("unknown");
+    expect(v.baseRed).toBe(0);
+    expect(v.undetermined).toBe(1);
+    expect(typeof v.reason).toBe("string");
+    expect(v.reason).toContain("1");
+  });
+
+  it("unknown when a red gate has no failing case", () => {
+    const v = baseVerdict([]);
+    expect(v.verdict).toBe("unknown");
+    expect(v.reason).toBe("gate red with no failing test case");
+    expect(v.failing).toBe(0);
+  });
+});
+
+describe("caseFile", () => {
+  const tracked = [
+    "src/a.test.ts",
+    "test/b.test.ts",
+    "tests/bats/c.bats",
+    "pkg1/dup.test.ts",
+    "pkg2/dup.test.ts",
+  ];
+
+  it("resolves from file, then a classname path, then one matching tracked basename", () => {
+    expect(caseFile(failing({ file: "src/a.test.ts", classname: "other" }), tracked)).toBe(
+      "src/a.test.ts",
+    );
+    expect(caseFile(failing({ file: null, classname: "test/b.test.ts" }), tracked)).toBe(
+      "test/b.test.ts",
+    );
+    expect(
+      caseFile(failing({ file: "gone/x.test.ts", classname: "test/b.test.ts" }), tracked),
+    ).toBe("test/b.test.ts");
+    expect(caseFile(failing({ file: null, classname: "c.bats" }), tracked)).toBe(
+      "tests/bats/c.bats",
+    );
+  });
+
+  it("a classname matching two tracked basenames leaves the case undetermined", () => {
+    expect(caseFile(failing({ file: null, classname: "dup.test.ts" }), tracked)).toBeNull();
+  });
+
+  it("an untracked or outside-repo file attribute leaves the case undetermined", () => {
+    expect(caseFile(failing({ file: "../x.test.ts", classname: null }), tracked)).toBeNull();
+    expect(caseFile(failing({ file: "/etc/x.test.ts", classname: null }), tracked)).toBeNull();
+    expect(caseFile(failing({ file: "untracked/y.test.ts", classname: null }), tracked)).toBeNull();
+    expect(caseFile(failing({ file: null, classname: "../x.test.ts" }), tracked)).toBeNull();
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/tests-base.ts b/.bkit/core/engine/commands/workflow/tests-base.ts
new file mode 100644
index 000000000..6212d6e0d
--- /dev/null
+++ b/.bkit/core/engine/commands/workflow/tests-base.ts
@@ -0,0 +1,285 @@
+// commands/workflow/tests-base.ts — `bkit tests base`: do the gate's failing tests also fail on
+// the commit the branch started from?
+//
+// A red group gate or final run pauses the build. Whether a fix round could help depends on
+// where the failure comes from: the branch, or `dev`. This verb answers that from a passing CI
+// run at the base sha, else from a throwaway checkout of the base commit that re-runs only the
+// failing test files. Exit 0 for every verdict; only a usage error exits non-zero.
+//
+// A leaf of the verb graph: it imports nothing from `tests.ts`, and reaches `runs.ts` only
+// through a dynamic import inside the handler.
+
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+
+import { BKIT_TEST_FILE_SCRIPT } from "../../install/manifest.js";
+import { readBkitConfig } from "../../shared/settings.js";
+import { readPackageJson } from "../../shared/package-json.js";
+import { withCleanup } from "../ci/ci.js";
+import { dropLandTree, withoutHooks } from "../land.js";
+import { CommandError, EXIT, git, mainCheckoutRoot, runGh, runGit, type VerbSpec } from "../lib.js";
+import { reportFailures, runTestFile, countReportFailures, type JunitCase } from "./junit.js";
+import { latestRuntimeRow } from "./runtime.js";
+import { resolveOwnerRepo } from "./repo.js";
+import { copyListed, devBase, install } from "./worktrees.js";
+
+export type AtBase = "red" | "pass" | "absent" | "unknown";
+export type Verdict = "all" | "some" | "none" | "unknown";
+
+export interface CaseRow {
+  name: string;
+  file: string | null;
+  atBase: AtBase;
+}
+
+export interface BaseVerdict {
+  verdict: Verdict;
+  reason: string | null;
+  failing: number;
+  baseRed: number;
+  branch: number;
+  undetermined: number;
+}
+
+/** A repo-relative path with no `..` segment and no root, in `/` form; else null. */
+function safeRelative(p: string): string | null {
+  const norm = path.posix.normalize(p.replace(/\\/g, "/"));
+  if (norm === "." || norm.startsWith("/") || /^[a-z]:/i.test(norm)) return null;
+  if (norm.split("/").includes("..")) return null;
+  return norm;
+}
+
+/**
+ * The tracked repo file a failing case ran in: its `file` attribute when that is a tracked
+ * repo-relative path, else its `classname` when that is one, else the one tracked file whose
+ * basename is the `classname`'s. Null when none applies or two match. An untracked, absolute
+ * or `..` path is never returned.
+ */
+export function caseFile(c: JunitCase, tracked: readonly string[]): string | null {
+  const set = new Set(tracked);
+  for (const candidate of [c.file, c.classname]) {
+    if (candidate === null) continue;
+    const rel = safeRelative(candidate);
+    if (rel !== null && set.has(rel)) return rel;
+  }
+  if (c.classname === null) return null;
+  const rel = safeRelative(c.classname);
+  if (rel === null) return null;
+  const base = path.posix.basename(rel);
+  const hits = tracked.filter((t) => path.posix.basename(t) === base);
+  return hits.length === 1 ? hits[0]! : null;
+}
+
+/** Fold per-case base outcomes into one verdict with counts. */
+export function baseVerdict(cases: readonly CaseRow[]): BaseVerdict {
+  const failing = cases.length;
+  const baseRed = cases.filter((c) => c.atBase === "red").length;
+  const branch = cases.filter((c) => c.atBase === "pass" || c.atBase === "absent").length;
+  const undetermined = failing - baseRed - branch;
+  const counts = { failing, baseRed, branch, undetermined };
+  if (failing === 0)
+    return { verdict: "unknown", reason: "gate red with no failing test case", ...counts };
+  if (baseRed === failing) return { verdict: "all", reason: null, ...counts };
+  if (baseRed === 0 && undetermined === 0) return { verdict: "none", reason: null, ...counts };
+  if (baseRed === 0)
+    return {
+      verdict: "unknown",
+      reason: `${undetermined} case(s) with no resolvable result at the base commit`,
+      ...counts,
+    };
+  return { verdict: "some", reason: null, ...counts };
+}
+
+interface BaseRun {
+  /** Set when no case could be run at base; the reason is the verdict's. */
+  reason: string | null;
+  /** Per file: its cases at base; null when the run wrote no report; absent key = file not at base. */
+  files: Map<string, JunitCase[] | null>;
+}
+
+interface Output extends BaseVerdict {
+  base: string | null;
+  source: "ci" | "local" | null;
+  adopt: boolean;
+  cases: CaseRow[];
+}
+
+const str = (v: unknown): string | undefined => (typeof v === "string" && v !== "" ? v : undefined);
+
+function readRows(file: string): Record<string, unknown>[] {
+  if (!fs.existsSync(file)) throw new CommandError(EXIT.USAGE, `--file ${file} does not exist`);
+  const rows: Record<string, unknown>[] = [];
+  for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
+    if (line.trim() === "") continue;
+    try {
+      const row: unknown = JSON.parse(line);
+      if (typeof row === "object" && row !== null) rows.push(row as Record<string, unknown>);
+    } catch {
+      // A malformed line is not a row.
+    }
+  }
+  return rows;
+}
+
+export const testsBaseVerb: VerbSpec = {
+  summary:
+    "Check whether the failing tests of a red gate also fail on the commit the branch started from; exit 0 for every verdict.",
+  use: "workflow",
+  flags: [
+    { name: "log", type: "string", help: "the gate log; its JUnit reports are in {log}.reports" },
+    { name: "file", type: "string", help: "the run's status.jsonl" },
+    { name: "workflow", type: "string", help: "the workflow whose runtime row sets `adopt`" },
+    { name: "out", type: "string", help: "also write the output JSON to this path" },
+  ],
+  output: {
+    verdict: "all / some / none / unknown",
+    reason: "why the verdict is unknown, else null",
+    base: "the base commit sha, or null",
+    source: "ci (a passing CI run at the base sha), local (a run at the base commit), or null",
+    failing: "the gate's failing test cases",
+    baseRed: "of those, how many also fail at the base commit",
+    branch: "of those, how many pass or do not exist at the base commit",
+    undetermined: "of those, how many could not be checked",
+    adopt: "true when the run has no worktrees (runtimeWorktrees false)",
+    cases: "each failing case: {name, file, atBase: red / pass / absent / unknown}",
+  },
+  run: async (ctx) => {
+    const log = str(ctx.flags.log);
+    const file = str(ctx.flags.file);
+    const workflow = str(ctx.flags.workflow);
+    for (const [flag, value] of [
+      ["log", log],
+      ["file", file],
+      ["workflow", workflow],
+    ] as const)
+      if (value === undefined) throw new CommandError(EXIT.USAGE, `--${flag} is required`);
+    const out = str(ctx.flags.out);
+    const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
+    const runtime = latestRuntimeRow(readRows(file!), workflow);
+    const adopt = runtime?.runtimeWorktrees === false;
+
+    const finish = (r: Omit<Output, "adopt">): number => {
+      const output: Output = { ...r, adopt };
+      if (out) {
+        fs.mkdirSync(path.dirname(out), { recursive: true });
+        fs.writeFileSync(out, `${JSON.stringify(output, null, 2)}\n`);
+      }
+      ctx.emit({ ...output });
+      return EXIT.OK;
+    };
+    const unknown = (reason: string, base: string | null, cases: CaseRow[] = []) =>
+      finish({
+        ...baseVerdict(cases),
+        verdict: "unknown",
+        reason,
+        base,
+        source: null,
+        cases,
+      });
+
+    const reports = `${log}.reports`;
+    const count = fs.existsSync(reports) ? countReportFailures(reports) : null;
+    if (count === null) return unknown("no JUnit report", null);
+    const failures = reportFailures(reports) ?? [];
+    if (failures.length === 0) return finish({ ...noCases(), base: null, source: null, cases: [] });
+
+    const tracked = (git(top, ["ls-files", "-z"]) ?? "").split("\0").filter(Boolean);
+    const resolved = failures.map((c) => ({ c, file: caseFile(c, tracked) }));
+    const rowsWith = (at: (c: JunitCase, f: string | null) => AtBase): CaseRow[] =>
+      resolved.map(({ c, file: f }) => ({ name: c.name, file: f, atBase: at(c, f) }));
+
+    const mergeBase = git(top, ["merge-base", "HEAD", devBase(top)]);
+    if (mergeBase === null)
+      return unknown(
+        "no base commit",
+        null,
+        rowsWith(() => "unknown"),
+      );
+    const base: string = mergeBase;
+
+    // A passing CI run at the exact base sha settles "none" without a checkout.
+    const repo = resolveOwnerRepo(top);
+    if (repo !== null) {
+      const { shipGate } = await import("./runs.js");
+      const gate = shipGate(
+        { root: top, head: base, repo: repo.ownerRepo },
+        (args) => runGh(top, args),
+        () => undefined,
+      );
+      if (gate.passed && gate.skippedLanes.length === 0) {
+        const cases = rowsWith(() => "pass");
+        return finish({ ...baseVerdict(cases), base, source: "ci", cases });
+      }
+    }
+
+    if (!readBkitConfig(top).worktreeInstall)
+      return unknown(
+        "no install at the base commit (worktreeInstall off)",
+        base,
+        rowsWith(() => "unknown"),
+      );
+
+    const files = [...new Set(resolved.flatMap((r) => (r.file === null ? [] : [r.file])))];
+    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-base-"));
+    const logDir = `${log}.base`;
+    const baseRun = (): BaseRun => {
+      const result: BaseRun = { reason: null, files: new Map() };
+      const added = runGit(top, ["worktree", "add", "-q", "--detach", tmp, base]);
+      if (!added.ok) return { ...result, reason: "base checkout failed" };
+      copyListed(mainCheckoutRoot(top) ?? top, tmp, readBkitConfig(top).worktreeCopy, ctx.log);
+      const pkg = readPackageJson(tmp);
+      const scripts = pkg.ok ? pkg.pkg.scripts : undefined;
+      const declared =
+        typeof scripts === "object" &&
+        scripts !== null &&
+        typeof (scripts as Record<string, unknown>)[BKIT_TEST_FILE_SCRIPT] === "string";
+      if (!declared)
+        return { ...result, reason: `${BKIT_TEST_FILE_SCRIPT} not declared at the base commit` };
+      const status = install(tmp, ctx.log, { preferOffline: true });
+      if (status !== 0) return { ...result, reason: `base install failed (exit ${status})` };
+      files.forEach((f, n) => {
+        if (!fs.existsSync(path.join(tmp, f))) return;
+        const ran = runTestFile(tmp, f, path.join(logDir, `${n}.log`));
+        result.files.set(f, ran.cases);
+      });
+      return result;
+    };
+    const run = await withoutHooks(() => withCleanup(baseRun, () => dropLandTree(top, tmp)));
+    if (run.reason !== null)
+      return unknown(
+        run.reason,
+        base,
+        rowsWith(() => "unknown"),
+      );
+
+    let noReport = false;
+    const cases = rowsWith((c, f) => {
+      if (f === null) return "unknown";
+      if (!run.files.has(f)) return "absent";
+      const ran = run.files.get(f);
+      if (ran === null || ran === undefined) {
+        noReport = true;
+        return "unknown";
+      }
+      const same = ran.find((b) => b.name === c.name);
+      if (same === undefined) return "absent";
+      return same.state === "failure" || same.state === "error" ? "red" : "pass";
+    });
+    const verdict = baseVerdict(cases);
+    if (verdict.verdict === "unknown") {
+      const unresolved = cases.filter((c) => c.file === null).length;
+      const reason = noReport
+        ? "no report from the base run"
+        : unresolved > 0
+          ? `${unresolved} case(s) with no resolvable file`
+          : verdict.reason;
+      return finish({ ...verdict, reason, base, source: "local", cases });
+    }
+    return finish({ ...verdict, base, source: "local", cases });
+  },
+};
+
+function noCases(): BaseVerdict {
+  return baseVerdict([]);
+}
diff --git a/.bkit/core/engine/commands/workflow/tests.ts b/.bkit/core/engine/commands/workflow/tests.ts
index 84de44b3d..45010bdbf 100644
--- a/.bkit/core/engine/commands/workflow/tests.ts
+++ b/.bkit/core/engine/commands/workflow/tests.ts
@@ -66,6 +66,7 @@ import {
 import { writeStepRow } from "./steps.js";
 import { REPORT_ENV, countReportFailures, runTestFile, runToLog, type JunitCase } from "./junit.js";
 import { appendRecord, clampFile, type ClampRecord } from "./context.js";
+import { testsBaseVerb } from "./tests-base.js";
 import { testsChangedVerb } from "./tests-changed.js";
 
 /** Exit code: no candidate gate is declared in package.json. */
@@ -1506,6 +1507,7 @@ export const testsCommand: CommandSpec = {
   summary:
     "Run the deepest declared local gate, or one test file to record a red and audit a green.",
   verbs: {
+    base: testsBaseVerb,
     changed: testsChangedVerb,
     run: {
       summary:
diff --git a/dist/commands/workflow/tests-base.js b/dist/commands/workflow/tests-base.js
new file mode 100644
index 000000000..6fd43eedd
--- /dev/null
+++ b/dist/commands/workflow/tests-base.js
@@ -0,0 +1,237 @@
+// commands/workflow/tests-base.ts — `bkit tests base`: do the gate's failing tests also fail on
+// the commit the branch started from?
+//
+// A red group gate or final run pauses the build. Whether a fix round could help depends on
+// where the failure comes from: the branch, or `dev`. This verb answers that from a passing CI
+// run at the base sha, else from a throwaway checkout of the base commit that re-runs only the
+// failing test files. Exit 0 for every verdict; only a usage error exits non-zero.
+//
+// A leaf of the verb graph: it imports nothing from `tests.ts`, and reaches `runs.ts` only
+// through a dynamic import inside the handler.
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+import { BKIT_TEST_FILE_SCRIPT } from "../../install/manifest.js";
+import { readBkitConfig } from "../../shared/settings.js";
+import { readPackageJson } from "../../shared/package-json.js";
+import { withCleanup } from "../ci/ci.js";
+import { dropLandTree, withoutHooks } from "../land.js";
+import { CommandError, EXIT, git, mainCheckoutRoot, runGh, runGit } from "../lib.js";
+import { reportFailures, runTestFile, countReportFailures } from "./junit.js";
+import { latestRuntimeRow } from "./runtime.js";
+import { resolveOwnerRepo } from "./repo.js";
+import { copyListed, devBase, install } from "./worktrees.js";
+/** A repo-relative path with no `..` segment and no root, in `/` form; else null. */
+function safeRelative(p) {
+    const norm = path.posix.normalize(p.replace(/\\/g, "/"));
+    if (norm === "." || norm.startsWith("/") || /^[a-z]:/i.test(norm))
+        return null;
+    if (norm.split("/").includes(".."))
+        return null;
+    return norm;
+}
+/**
+ * The tracked repo file a failing case ran in: its `file` attribute when that is a tracked
+ * repo-relative path, else its `classname` when that is one, else the one tracked file whose
+ * basename is the `classname`'s. Null when none applies or two match. An untracked, absolute
+ * or `..` path is never returned.
+ */
+export function caseFile(c, tracked) {
+    const set = new Set(tracked);
+    for (const candidate of [c.file, c.classname]) {
+        if (candidate === null)
+            continue;
+        const rel = safeRelative(candidate);
+        if (rel !== null && set.has(rel))
+            return rel;
+    }
+    if (c.classname === null)
+        return null;
+    const rel = safeRelative(c.classname);
+    if (rel === null)
+        return null;
+    const base = path.posix.basename(rel);
+    const hits = tracked.filter((t) => path.posix.basename(t) === base);
+    return hits.length === 1 ? hits[0] : null;
+}
+/** Fold per-case base outcomes into one verdict with counts. */
+export function baseVerdict(cases) {
+    const failing = cases.length;
+    const baseRed = cases.filter((c) => c.atBase === "red").length;
+    const branch = cases.filter((c) => c.atBase === "pass" || c.atBase === "absent").length;
+    const undetermined = failing - baseRed - branch;
+    const counts = { failing, baseRed, branch, undetermined };
+    if (failing === 0)
+        return { verdict: "unknown", reason: "gate red with no failing test case", ...counts };
+    if (baseRed === failing)
+        return { verdict: "all", reason: null, ...counts };
+    if (baseRed === 0 && undetermined === 0)
+        return { verdict: "none", reason: null, ...counts };
+    if (baseRed === 0)
+        return {
+            verdict: "unknown",
+            reason: `${undetermined} case(s) with no resolvable result at the base commit`,
+            ...counts,
+        };
+    return { verdict: "some", reason: null, ...counts };
+}
+const str = (v) => (typeof v === "string" && v !== "" ? v : undefined);
+function readRows(file) {
+    if (!fs.existsSync(file))
+        throw new CommandError(EXIT.USAGE, `--file ${file} does not exist`);
+    const rows = [];
+    for (const line of fs.readFileSync(file, "utf-8").split("\n")) {
+        if (line.trim() === "")
+            continue;
+        try {
+            const row = JSON.parse(line);
+            if (typeof row === "object" && row !== null)
+                rows.push(row);
+        }
+        catch {
+            // A malformed line is not a row.
+        }
+    }
+    return rows;
+}
+export const testsBaseVerb = {
+    summary: "Check whether the failing tests of a red gate also fail on the commit the branch started from; exit 0 for every verdict.",
+    use: "workflow",
+    flags: [
+        { name: "log", type: "string", help: "the gate log; its JUnit reports are in {log}.reports" },
+        { name: "file", type: "string", help: "the run's status.jsonl" },
+        { name: "workflow", type: "string", help: "the workflow whose runtime row sets `adopt`" },
+        { name: "out", type: "string", help: "also write the output JSON to this path" },
+    ],
+    output: {
+        verdict: "all / some / none / unknown",
+        reason: "why the verdict is unknown, else null",
+        base: "the base commit sha, or null",
+        source: "ci (a passing CI run at the base sha), local (a run at the base commit), or null",
+        failing: "the gate's failing test cases",
+        baseRed: "of those, how many also fail at the base commit",
+        branch: "of those, how many pass or do not exist at the base commit",
+        undetermined: "of those, how many could not be checked",
+        adopt: "true when the run has no worktrees (runtimeWorktrees false)",
+        cases: "each failing case: {name, file, atBase: red / pass / absent / unknown}",
+    },
+    run: async (ctx) => {
+        const log = str(ctx.flags.log);
+        const file = str(ctx.flags.file);
+        const workflow = str(ctx.flags.workflow);
+        for (const [flag, value] of [
+            ["log", log],
+            ["file", file],
+            ["workflow", workflow],
+        ])
+            if (value === undefined)
+                throw new CommandError(EXIT.USAGE, `--${flag} is required`);
+        const out = str(ctx.flags.out);
+        const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
+        const runtime = latestRuntimeRow(readRows(file), workflow);
+        const adopt = runtime?.runtimeWorktrees === false;
+        const finish = (r) => {
+            const output = { ...r, adopt };
+            if (out) {
+                fs.mkdirSync(path.dirname(out), { recursive: true });
+                fs.writeFileSync(out, `${JSON.stringify(output, null, 2)}\n`);
+            }
+            ctx.emit({ ...output });
+            return EXIT.OK;
+        };
+        const unknown = (reason, base, cases = []) => finish({
+            ...baseVerdict(cases),
+            verdict: "unknown",
+            reason,
+            base,
+            source: null,
+            cases,
+        });
+        const reports = `${log}.reports`;
+        const count = fs.existsSync(reports) ? countReportFailures(reports) : null;
+        if (count === null)
+            return unknown("no JUnit report", null);
+        const failures = reportFailures(reports) ?? [];
+        if (failures.length === 0)
+            return finish({ ...noCases(), base: null, source: null, cases: [] });
+        const tracked = (git(top, ["ls-files", "-z"]) ?? "").split("\0").filter(Boolean);
+        const resolved = failures.map((c) => ({ c, file: caseFile(c, tracked) }));
+        const rowsWith = (at) => resolved.map(({ c, file: f }) => ({ name: c.name, file: f, atBase: at(c, f) }));
+        const mergeBase = git(top, ["merge-base", "HEAD", devBase(top)]);
+        if (mergeBase === null)
+            return unknown("no base commit", null, rowsWith(() => "unknown"));
+        const base = mergeBase;
+        // A passing CI run at the exact base sha settles "none" without a checkout.
+        const repo = resolveOwnerRepo(top);
+        if (repo !== null) {
+            const { shipGate } = await import("./runs.js");
+            const gate = shipGate({ root: top, head: base, repo: repo.ownerRepo }, (args) => runGh(top, args), () => undefined);
+            if (gate.passed && gate.skippedLanes.length === 0) {
+                const cases = rowsWith(() => "pass");
+                return finish({ ...baseVerdict(cases), base, source: "ci", cases });
+            }
+        }
+        if (!readBkitConfig(top).worktreeInstall)
+            return unknown("no install at the base commit (worktreeInstall off)", base, rowsWith(() => "unknown"));
+        const files = [...new Set(resolved.flatMap((r) => (r.file === null ? [] : [r.file])))];
+        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-base-"));
+        const logDir = `${log}.base`;
+        const baseRun = () => {
+            const result = { reason: null, files: new Map() };
+            const added = runGit(top, ["worktree", "add", "-q", "--detach", tmp, base]);
+            if (!added.ok)
+                return { ...result, reason: "base checkout failed" };
+            copyListed(mainCheckoutRoot(top) ?? top, tmp, readBkitConfig(top).worktreeCopy, ctx.log);
+            const pkg = readPackageJson(tmp);
+            const scripts = pkg.ok ? pkg.pkg.scripts : undefined;
+            const declared = typeof scripts === "object" &&
+                scripts !== null &&
+                typeof scripts[BKIT_TEST_FILE_SCRIPT] === "string";
+            if (!declared)
+                return { ...result, reason: `${BKIT_TEST_FILE_SCRIPT} not declared at the base commit` };
+            const status = install(tmp, ctx.log, { preferOffline: true });
+            if (status !== 0)
+                return { ...result, reason: `base install failed (exit ${status})` };
+            files.forEach((f, n) => {
+                if (!fs.existsSync(path.join(tmp, f)))
+                    return;
+                const ran = runTestFile(tmp, f, path.join(logDir, `${n}.log`));
+                result.files.set(f, ran.cases);
+            });
+            return result;
+        };
+        const run = await withoutHooks(() => withCleanup(baseRun, () => dropLandTree(top, tmp)));
+        if (run.reason !== null)
+            return unknown(run.reason, base, rowsWith(() => "unknown"));
+        let noReport = false;
+        const cases = rowsWith((c, f) => {
+            if (f === null)
+                return "unknown";
+            if (!run.files.has(f))
+                return "absent";
+            const ran = run.files.get(f);
+            if (ran === null || ran === undefined) {
+                noReport = true;
+                return "unknown";
+            }
+            const same = ran.find((b) => b.name === c.name);
+            if (same === undefined)
+                return "absent";
+            return same.state === "failure" || same.state === "error" ? "red" : "pass";
+        });
+        const verdict = baseVerdict(cases);
+        if (verdict.verdict === "unknown") {
+            const unresolved = cases.filter((c) => c.file === null).length;
+            const reason = noReport
+                ? "no report from the base run"
+                : unresolved > 0
+                    ? `${unresolved} case(s) with no resolvable file`
+                    : verdict.reason;
+            return finish({ ...verdict, reason, base, source: "local", cases });
+        }
+        return finish({ ...verdict, base, source: "local", cases });
+    },
+};
+function noCases() {
+    return baseVerdict([]);
+}
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index c3e2f1f1d..0bdcf942b 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -33,6 +33,7 @@ import { NO_MARKERS_REASON, derivedTestMatrix, fenceNeverClosed, parsePlanBlocks
 import { writeStepRow } from "./steps.js";
 import { REPORT_ENV, countReportFailures, runTestFile, runToLog } from "./junit.js";
 import { appendRecord, clampFile } from "./context.js";
+import { testsBaseVerb } from "./tests-base.js";
 import { testsChangedVerb } from "./tests-changed.js";
 /** Exit code: no candidate gate is declared in package.json. */
 export const EXIT_NO_GATE = 3;
@@ -1109,6 +1110,7 @@ export const testsCommand = {
     noun: "tests",
     summary: "Run the deepest declared local gate, or one test file to record a red and audit a green.",
     verbs: {
+        base: testsBaseVerb,
         changed: testsChangedVerb,
         run: {
             summary: "Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run, 81 tests lock held.",
diff --git a/tests/fixtures/gates/pnpm.cjs b/tests/fixtures/gates/pnpm.cjs
index 68029d296..b73244e8a 100755
--- a/tests/fixtures/gates/pnpm.cjs
+++ b/tests/fixtures/gates/pnpm.cjs
@@ -30,6 +30,8 @@ if (process.argv[2] === "install") {
 } else {
   const script = pkg.scripts?.[process.argv[2]];
   if (typeof script !== "string" || !script.trim()) process.exit(2);
-  const result = spawnSync("/bin/sh", ["-c", script], { stdio: "inherit" });
+  const result = spawnSync("/bin/sh", ["-c", script, "sh", ...process.argv.slice(3)], {
+    stdio: "inherit",
+  });
   process.exit(result.status ?? 1);
 }
