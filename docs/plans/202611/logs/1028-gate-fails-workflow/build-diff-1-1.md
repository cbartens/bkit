diff --git a/.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts b/.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts
new file mode 100644
index 000000000..fb9091cd4
--- /dev/null
+++ b/.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts
@@ -0,0 +1,176 @@
+// audits/repo/agent-text-ceiling.test.ts — #1028 — repo-only word ceiling for the text agents read.
+//
+// Runs scripts/gate/bkit-text-ceiling.mjs as a real process against fixture folders under
+// os.tmpdir(). The record holds one ceiling per folder: { workflows: { ceiling, reason },
+// prompts: { ceiling, reason } }.
+
+import { spawnSync } from "node:child_process";
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+import { afterEach, describe, expect, it } from "vitest";
+
+const SCRIPT = path.resolve("scripts/gate/bkit-text-ceiling.mjs");
+
+const made: string[] = [];
+afterEach(() => {
+  for (const dir of made.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
+});
+
+const words = (n: number): string => Array.from({ length: n }, (_, i) => `w${i}`).join(" ") + "\n";
+
+interface Fixture {
+  root: string;
+  record: string;
+}
+
+function makeFixture(
+  workflowFiles: Record<string, number>,
+  promptFiles: Record<string, number>,
+  ceilings?: { workflows: number; prompts: number },
+): Fixture {
+  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-text-ceiling-"));
+  made.push(root);
+  const wf = path.join(root, ".bkit/core/workflows");
+  const pr = path.join(root, ".bkit/core/prompts");
+  fs.mkdirSync(wf, { recursive: true });
+  fs.mkdirSync(pr, { recursive: true });
+  for (const [name, n] of Object.entries(workflowFiles))
+    fs.writeFileSync(path.join(wf, name), words(n));
+  for (const [name, n] of Object.entries(promptFiles))
+    fs.writeFileSync(path.join(pr, name), words(n));
+  const sum = (o: Record<string, number>): number => Object.values(o).reduce((a, b) => a + b, 0);
+  const c = ceilings ?? { workflows: sum(workflowFiles), prompts: sum(promptFiles) };
+  const record = path.join(root, "scripts/gate/bkit-text-ceiling.json");
+  fs.mkdirSync(path.dirname(record), { recursive: true });
+  fs.writeFileSync(
+    record,
+    JSON.stringify(
+      {
+        prompts: { ceiling: c.prompts, reason: "prompts reason" },
+        workflows: { ceiling: c.workflows, reason: "workflows reason" },
+      },
+      null,
+      2,
+    ) + "\n",
+  );
+  return { root, record };
+}
+
+function run(args: string[], fx: Fixture, cwd?: string) {
+  const r = spawnSync("node", [SCRIPT, ...args, "--root", fx.root, "--record", fx.record], {
+    encoding: "utf-8",
+    cwd: cwd ?? fx.root,
+  });
+  return { status: r.status, out: `${r.stdout}${r.stderr}` };
+}
+
+function readRecord(fx: Fixture): {
+  workflows: { ceiling: number; reason: string };
+  prompts: { ceiling: number; reason: string };
+} {
+  return JSON.parse(fs.readFileSync(fx.record, "utf-8"));
+}
+
+describe("bkit-text-ceiling check", () => {
+  it("fails above the ceiling and names total, ceiling, grown files and the raise command", () => {
+    const fx = makeFixture(
+      { "a.md": 10, "b.md": 10 },
+      { "p.md": 5 },
+      { workflows: 15, prompts: 5 },
+    );
+    const r = run(["check"], fx);
+    expect(r.status).toBe(1);
+    expect(r.out).toContain("20");
+    expect(r.out).toContain("15");
+    expect(r.out).toMatch(/a\.md|b\.md/);
+    expect(r.out).toContain('pnpm bkit:text:ceiling raise --reason "<why>"');
+    expect(r.out.toLowerCase()).toContain("owner");
+  });
+
+  it("passes when a total equals its ceiling", () => {
+    const fx = makeFixture({ "a.md": 10 }, { "p.md": 5 });
+    const r = run(["check"], fx);
+    expect(r.status).toBe(0);
+  });
+
+  it("fails below the ceiling and names the lower command", () => {
+    const fx = makeFixture({ "a.md": 10 }, { "p.md": 5 }, { workflows: 10, prompts: 9 });
+    const r = run(["check"], fx);
+    expect(r.status).toBe(1);
+    expect(r.out).toContain("pnpm bkit:text:ceiling lower");
+  });
+
+  it("names only the files that grew since the record's last commit", () => {
+    const fx = makeFixture({ "grew.md": 10, "same.md": 10 }, { "p.md": 5 });
+    const git = (...a: string[]) =>
+      spawnSync("git", ["-c", "user.name=t", "-c", "user.email=t@t", ...a], {
+        cwd: fx.root,
+        encoding: "utf-8",
+      });
+    expect(git("init", "-q").status).toBe(0);
+    expect(git("add", "-A").status).toBe(0);
+    expect(git("commit", "-q", "-m", "baseline").status).toBe(0);
+    fs.writeFileSync(path.join(fx.root, ".bkit/core/workflows/grew.md"), words(25));
+    const r = run(["check"], fx);
+    expect(r.status).toBe(1);
+    expect(r.out).toContain("grew.md");
+    expect(r.out).not.toContain("same.md");
+  });
+});
+
+describe("bkit-text-ceiling lower and raise", () => {
+  it("raise without a reason refuses and leaves the record unchanged", () => {
+    const fx = makeFixture({ "a.md": 20 }, { "p.md": 5 }, { workflows: 10, prompts: 5 });
+    const before = fs.readFileSync(fx.record, "utf-8");
+    const r = run(["raise"], fx);
+    expect(r.status).toBe(1);
+    expect(r.out).toMatch(/reason/i);
+    expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);
+    const blank = run(["raise", "--reason", "  "], fx);
+    expect(blank.status).toBe(1);
+    expect(blank.out).toMatch(/reason/i);
+    expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);
+  });
+
+  it("raise with a reason rewrites both ceilings and stores the reason on the folder that grew", () => {
+    const fx = makeFixture({ "a.md": 20 }, { "p.md": 5 }, { workflows: 10, prompts: 5 });
+    const r = run(["raise", "--reason", "needed for new step"], fx);
+    expect(r.status).toBe(0);
+    const rec = readRecord(fx);
+    expect(rec.workflows.ceiling).toBe(20);
+    expect(rec.prompts.ceiling).toBe(5);
+    expect(rec.workflows.reason).toBe("needed for new step");
+    expect(rec.prompts.reason).toBe("prompts reason");
+    expect(run(["check"], fx).status).toBe(0);
+  });
+
+  it("lower rewrites both ceilings and keeps each reason", () => {
+    const fx = makeFixture({ "a.md": 10 }, { "p.md": 5 }, { workflows: 30, prompts: 9 });
+    const r = run(["lower"], fx);
+    expect(r.status).toBe(0);
+    const rec = readRecord(fx);
+    expect(rec.workflows.ceiling).toBe(10);
+    expect(rec.prompts.ceiling).toBe(5);
+    expect(rec.workflows.reason).toBe("workflows reason");
+    expect(rec.prompts.reason).toBe("prompts reason");
+    expect(run(["check"], fx).status).toBe(0);
+  });
+
+  it("lower refuses when a total is above its ceiling", () => {
+    const fx = makeFixture({ "a.md": 20 }, { "p.md": 5 }, { workflows: 10, prompts: 9 });
+    const before = fs.readFileSync(fx.record, "utf-8");
+    const r = run(["lower"], fx);
+    expect(r.status).toBe(1);
+    expect(r.out).toContain("raise --reason");
+    expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);
+  });
+});
+
+describe("bkit-text-ceiling on the real repo", () => {
+  it("bkit's own workflow and prompt folders sit exactly at the committed ceilings", () => {
+    const r = spawnSync("node", [SCRIPT, "check"], { encoding: "utf-8", cwd: path.resolve(".") });
+    expect(`${r.stdout}${r.stderr}`).not.toContain("raise --reason");
+    expect(r.status).toBe(0);
+  });
+});
diff --git a/.bkit/core/engine/audits/repo/package-json.test.ts b/.bkit/core/engine/audits/repo/package-json.test.ts
index 176670f71..d6e79ca33 100644
--- a/.bkit/core/engine/audits/repo/package-json.test.ts
+++ b/.bkit/core/engine/audits/repo/package-json.test.ts
@@ -27,6 +27,13 @@ describe("package.json manifest invariants (BAR-138)", () => {
     );
   });
 
+  it("bkit:text:ceiling runs scripts/gate/bkit-text-ceiling.mjs", () => {
+    const manifest = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf-8")) as {
+      scripts: Record<string, string>;
+    };
+    expect(manifest.scripts["bkit:text:ceiling"]).toBe("node scripts/gate/bkit-text-ceiling.mjs");
+  });
+
   const pkgPath = path.resolve("package.json");
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   let pkg: Record<string, any>;
diff --git a/docs/architecture.md b/docs/architecture.md
index 186dc9775..105cc0f1b 100644
--- a/docs/architecture.md
+++ b/docs/architecture.md
@@ -88,7 +88,8 @@ cbartens/bkit (this repo)
 ├── scripts/ci/             # Adopted copy of `.bkit/templates/scripts/ci/`, plus bkit-repo-only
 │                           #   bkit-test-file.mjs (`bkit:test:file`: runner picked by test file type)
 ├── scripts/gate/           # bkit-repo-only bkit-gate-changed.mjs (`bkit:gate:changed`: checks on
-│                           #   the changed files bkit passes it)
+│                           #   the changed files bkit passes it) and bkit-text-ceiling.mjs with its record
+│                           #   bkit-text-ceiling.json (word ceilings for the workflow and prompt folders)
 ├── dist/                   # Compiled output (committed; published in tarball)
 ├── vitest.*.ts             # Repo-only test configuration and shared fixture support;
 │                           # gate-fixture runs consumer scripts with local dependencies.
diff --git a/docs/testing.md b/docs/testing.md
index 89bba743f..fa0ce4f76 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -571,6 +571,7 @@ Manual host-hook compatibility experiments live in [`tests/experiments/hooks/`](
 - **Time limits:** under `CI` the Vitest per-test and per-hook budgets (`vitest.timeout-budget.ts`) are strict (5s / 10s unit, 30s integration); off CI each is a fixed 6 times that (30s / 60s / 180s), a hang limit with no load reading. A limit a test file sets itself goes through `localLimit(ms)`, including one held in a named constant, so it stays as written under `CI` and is 6 times that off CI; `vitest.setup.ts` records the factor in `BKIT_LIMIT_FACTOR` before it clears `CI`, so a test file still reads the CI factor. The budgets also cap synchronous child calls (`vitest.child-deadline.ts`): a call with no `timeout` gets, from a test body, the test's timeout counted from when the body starts (`beforeEach` time is not taken off it; time the body spent before the call is), and, from a file's own `beforeEach` / `afterEach` hook (read from the hook state Vitest records on the running test, so it holds across an `await`), the test's remaining time but never less than the hook timeout so cleanup is not cut short, and is ended with SIGKILL (unless the caller sets `killSignal`) so a child that ignores SIGTERM cannot outlast it. `node --test` runs get `--test-timeout` and `--test-force-exit` from `scripts/ci/bkit-test-limits.mjs`, derived from the integration budget (30s under CI); `pnpm bkit:test:awake` runs its test file through `scripts/ci/bkit-test-file.mjs`, so it gets them too. Bats gets `BATS_TEST_TIMEOUT` from the same source, or from `tests/shell/setup_suite.bash` for `pnpm bkit:test:bats`. A limit kills only the direct child, so a grandchild it started can outlive the run. `patches/bats@1.13.0.patch` fixes two bats 1.13.0 defects: `bats-exec-test` declared the watchdog pid with `declare -r` inside a function, so a failing test could not stop its watchdog and waited out the whole limit; `bin/bats` ran `env` on a path that pnpm's patched-package directory name makes look like an assignment.
 - **Changed files:** `pnpm bkit:gate:changed {file}...` holds the `tests` lock through `scripts/ci/bkit-machine-lock.sh` and passes the file arguments to `scripts/gate/bkit-gate-changed.mjs`, which `bkit tests changed` calls for build and debug agents and `bkit tests run --changed-since=<sha>` calls for the build group gate: `vitest related --run` on the changed files, every test file that names a changed path (Vitest, `node --test` or bats by file type), Oxlint on changed engine `.ts`, Prettier on every changed file, and `pnpm typecheck` when a `.ts` file changed. Runs every stage, and exits 1 when any fails.
 - **Test gates:** `bkit:gate:static-unit`, `bkit:gate:static-unit-integration` and `bkit:gate:install-static-unit-build` hold the same `tests` lock for their whole run. A nested gate inherits its parent's live lock owner and runs unlocked.
+- **Text ceiling:** the unit tier fails when the word total of `.bkit/core/workflows/*.md` or `.bkit/core/prompts/*.md` differs from `scripts/gate/bkit-text-ceiling.json`. `pnpm bkit:text:ceiling lower` shrinks the record and needs no reason; `pnpm bkit:text:ceiling raise --reason "<why>"` is run by the owner only and is never called by a workflow, hook or agent.
 - **Test files** sit next to the file they test under `.bkit/core/engine/`; tests that read shipped text (workflows, templates, hooks, this repo's own docs and ledgers) sit in `.bkit/core/engine/audits/{workflows,templates,hooks,repo}/`. `tests/` holds automated shell tests in `shell/`, reusable inputs in `fixtures/` and manual research in `experiments/{compression,hooks}/`. Experiments keep reports in `reports/`, illustrations in `assets/` and preserved observations in dated `results/` folders.
 - **Shell names and runner:** Authored shell tests use `bkit-<subject>-<behaviour>.bats`. Keep the runner-required `setup_suite.bash` name and fixture names required by the software they imitate, such as `gh` and `package.json`. Local gates and CI both call `pnpm bkit:test:bats`, which selects `tests/shell/*.bats` and loads the adjacent suite setup. Manual experiments remain outside that selection.
 - **Real-repo guard:** both tiers run from `.husky/pre-push`, whose git exports `GIT_DIR` (from a linked worktree `<main>/.git/worktrees/<name>`, which beats a child's cwd and `-C`). `vitest.setup.ts` and `tests/shell/setup_suite.bash` clear every `GIT_*` variable before any test runs, then read `user.name` / `user.email` / `core.bare` / `core.worktree` of the repo the run starts from; a change fails the test (vitest, after each test, `vitest.repo-config-guard.ts`) or the run (bats `teardown_suite`) and puts the old values back. Pinned by `.bkit/core/engine/audits/repo/vitest-repo-config-guard.test.ts` and `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts`.
@@ -798,6 +799,7 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` (`.husky/pre-push direnv`) | Integration (stub `direnv` and `pnpm`, both hook copies) | The inner run goes through `direnv exec .` and the gate sees the `.envrc` variables; an untrusted `.envrc` blocks before `bkit check` with direnv's message and the `direnv allow .` fix; a trusted `.envrc` that fails to load blocks with direnv's own output and no `direnv allow .` advice; no `.envrc`, no `direnv` on `PATH` or `CI` set skip direnv. |
 | `.bkit/core/engine/checks/tips/catalogue.test.ts` | Unit | The `pre-push-pr-conflict` tip fires for a `.husky/pre-push` without `merge-tree` or `PUSH_BRANCH_SHA=`, and not for one with both or for no hook. The `project-goals` tip fires for a rules file with no `## Project Goals` heading or only commented examples, and stays quiet for one goal bullet (`-`, `*` or numbered), a goal in a second section, or no rules file; its ask says to fill an existing section instead of adding a second. |
 | `.bkit/core/engine/audits/repo/rules-sync.test.ts` (`Project Goals`) | Unit | The shipped `.bkit/core/.agents/rules.md` holds `## Project Rules`, `## Project Goals` and `## Project Settings` in that order below `bkit:end`, with no goal bullet and no project rule outside an HTML comment. |
+| `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` (#1028) | Unit | `scripts/gate/bkit-text-ceiling.mjs check` fails above the ceiling (naming total, ceiling, grown files and the raise command), passes at it, fails below it (naming `lower`); `raise` without a reason and `lower` when above refuse and leave the record unchanged; growth names only files that grew since the record's last commit; bkit's own folders sit at the committed ceilings. |
 | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` | Integration | The rules-read advisory on the hosts with no session-start event: the OpenCode plugin driven through both the 1.x `server()` and 2.0 `setup()` shapes, and the rendered Codex and Antigravity `bkit-rules.cjs` hooks spawned as their host runs them — advisory once per session (also when the state dir cannot be written: per-user state dir, in-process memory for OpenCode), fail-open, no `AGENTS.md`; the shell and JS parts hold the byte-identical advisory string. |
 | `.bkit/core/engine/render/parts.test.ts` | Unit | `renderParts` part-line splicing (JS and shell markers, no nesting, missing part throws); the host hook templates splice parts only inside the managed block, every part is used by two or more hosts, and every generated hook passes `node --check` / `bash -n`. |
 | `.bkit/core/engine/install/modules/index.integration.test.ts` | Integration | One canonical permission-gate table asserted across Claude `settings.json`, OpenCode `opencode.json`, Cursor `bkit-guardrails.cjs` and Codex `bkit-guardrails.cjs` — same verdict for every destructive command on all four hosts; secret reads asserted on Antigravity, Cursor and OpenCode `bkit-guardrails.cjs` (Codex has no file-read tool, so its reads are shell commands); Codex denies a shell command that prints or sends a private key's content (`it.each` over the exposing and the use-write-or-name commands) and keeps `.env` reads advisory. Plus shell-as-edit-channel advisories, curl / wget host matching, every hook finding `.bkit/allowlist.json` from payload dirs whatever its cwd, every reader host's install writing it (and moving a recorded `.cursor/allowlist.json`), and the documented per-host divergences. |
diff --git a/package.json b/package.json
index f8947ece7..0e6bc00ed 100644
--- a/package.json
+++ b/package.json
@@ -77,6 +77,7 @@
     "bkit:lint:prose": "bkit ci prose --glob='.agents/*.md' --glob='.bkit/core/.bkit/*.md' --glob='.bkit/core/workflows/**/*.md' --glob='.bkit/core/prompts/**/*.md' --glob='.bkit/core/.agents/*.md' --glob='.bkit/core/docs/**/*.md' --glob='.bkit/templates/**/*.md' --glob='docs/*.md' --glob='*.md'",
     "lint:slop": "slop-scan scan .",
     "bkit:slop:delta": "bkit ci slop",
+    "bkit:text:ceiling": "node scripts/gate/bkit-text-ceiling.mjs",
     "bkit:lint:workflows": "bash -c 'if command -v actionlint >/dev/null 2>&1; then actionlint; else echo \"[bkit] actionlint missing — skipping workflow lint (install actionlint to enable)\"; fi'",
     "test": "node scripts/ci/bkit-test-awake.mjs vitest run",
     "harvest": "tsx scripts/harvest/bkit-harvest.mjs",
diff --git a/scripts/gate/bkit-text-ceiling.json b/scripts/gate/bkit-text-ceiling.json
new file mode 100644
index 000000000..a29fcc107
--- /dev/null
+++ b/scripts/gate/bkit-text-ceiling.json
@@ -0,0 +1,10 @@
+{
+  "prompts": {
+    "ceiling": 86494,
+    "reason": "initial baseline for #1028"
+  },
+  "workflows": {
+    "ceiling": 58536,
+    "reason": "initial baseline for #1028"
+  }
+}
diff --git a/scripts/gate/bkit-text-ceiling.mjs b/scripts/gate/bkit-text-ceiling.mjs
new file mode 100644
index 000000000..bf4de776e
--- /dev/null
+++ b/scripts/gate/bkit-text-ceiling.mjs
@@ -0,0 +1,168 @@
+#!/usr/bin/env node
+// bkit's own checkout only; never shipped (not in dist, .bkit/core, .bkit/shared or .bkit/templates).
+/**
+ * bkit-text-ceiling.mjs — #1028: one word ceiling per folder of agent-read text
+ * (`.bkit/core/workflows/*.md`, `.bkit/core/prompts/*.md`), kept in a committed record.
+ *   check   exit 1 when a total is above or below its ceiling, 0 when equal
+ *   lower   rewrite both ceilings to the current totals; refuses when a total is above its ceiling
+ *   raise   --reason "<why>": rewrite both ceilings to the current totals (owner only)
+ * Options: --root <dir> (default: repo root), --record <file> (default: scripts/gate/bkit-text-ceiling.json).
+ */
+
+import { spawnSync } from "node:child_process";
+import fs from "node:fs";
+import path from "node:path";
+
+const FOLDERS = { prompts: ".bkit/core/prompts", workflows: ".bkit/core/workflows" };
+const RAISE = 'pnpm bkit:text:ceiling raise --reason "<why>"';
+
+const argv = process.argv.slice(2);
+const command = argv[0];
+const opt = (name) => {
+  const i = argv.indexOf(`--${name}`);
+  return i === -1 ? undefined : (argv[i + 1] ?? "");
+};
+const root = path.resolve(opt("root") ?? path.resolve(import.meta.dirname, "..", ".."));
+const recordPath = path.resolve(
+  opt("record") ?? path.join(root, "scripts/gate/bkit-text-ceiling.json"),
+);
+
+const countWords = (text) => text.split(/\s+/).filter(Boolean).length;
+
+function listFiles(folder) {
+  const dir = path.join(root, folder);
+  if (!fs.existsSync(dir)) return [];
+  return fs
+    .readdirSync(dir)
+    .filter((n) => n.endsWith(".md"))
+    .sort()
+    .map((n) => ({
+      rel: `${folder}/${n}`,
+      words: countWords(fs.readFileSync(path.join(dir, n), "utf-8")),
+    }));
+}
+
+function git(args) {
+  const r = spawnSync("git", args, { cwd: root, encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 });
+  return r.status === 0 ? r.stdout : null;
+}
+
+/** Files of one folder that grew since the record's last commit; the five largest without one. */
+function grownFiles(files) {
+  const sha = git(["log", "-1", "--format=%H", "--", recordPath])?.trim();
+  let rows;
+  if (sha) {
+    rows = files.map((f) => {
+      const old = git(["show", `${sha}:${f.rel}`]);
+      return { ...f, delta: f.words - (old === null ? 0 : countWords(old)) };
+    });
+    rows = rows.filter((r) => r.delta > 0);
+  } else {
+    rows = files.map((f) => ({ ...f, delta: f.words }));
+  }
+  return rows.sort((a, b) => b.delta - a.delta || a.rel.localeCompare(b.rel)).slice(0, 5);
+}
+
+function loadRecord() {
+  if (!fs.existsSync(recordPath)) return null;
+  return JSON.parse(fs.readFileSync(recordPath, "utf-8"));
+}
+
+function writeRecord(rec) {
+  const sorted = {};
+  for (const k of Object.keys(rec).sort()) {
+    sorted[k] = { ceiling: rec[k].ceiling, reason: rec[k].reason };
+  }
+  fs.mkdirSync(path.dirname(recordPath), { recursive: true });
+  fs.writeFileSync(recordPath, `${JSON.stringify(sorted, null, 2)}\n`);
+}
+
+const state = {};
+for (const [name, folder] of Object.entries(FOLDERS)) {
+  const files = listFiles(folder);
+  state[name] = { files, total: files.reduce((a, f) => a + f.words, 0) };
+}
+const record = loadRecord();
+
+function problems() {
+  const out = [];
+  let above = false;
+  for (const name of Object.keys(FOLDERS)) {
+    const total = state[name].total;
+    const ceiling = record?.[name]?.ceiling;
+    if (typeof ceiling !== "number") {
+      out.push(`${name}: no ceiling in ${recordPath}.`);
+      above = true;
+      continue;
+    }
+    if (total > ceiling) {
+      above = true;
+      const grown = grownFiles(state[name].files)
+        .map((f) => `    ${f.rel} (+${f.delta}, ${f.words} words)`)
+        .join("\n");
+      out.push(
+        `${name}: ${total} words is above the ceiling of ${ceiling}. Files that grew most:\n${grown}\n` +
+          `  Shorten the text, or (owner only, never from a workflow, hook or agent) run: ${RAISE}`,
+      );
+    } else if (total < ceiling) {
+      out.push(
+        `${name}: ${total} words is below the ceiling of ${ceiling}. Lower the ceiling in this change: pnpm bkit:text:ceiling lower`,
+      );
+    }
+  }
+  return { out, above };
+}
+
+function next(reasonFor) {
+  const rec = {};
+  for (const name of Object.keys(FOLDERS)) {
+    const old = record?.[name];
+    const total = state[name].total;
+    rec[name] = {
+      ceiling: total,
+      reason: old && old.ceiling === total ? old.reason : (reasonFor ?? old?.reason ?? ""),
+    };
+  }
+  return rec;
+}
+
+if (command === "check") {
+  const { out } = problems();
+  if (out.length > 0) {
+    console.error(`[bkit:text:ceiling] FAIL\n${out.join("\n")}`);
+    process.exit(1);
+  }
+  console.log(
+    `[bkit:text:ceiling] ok — ${Object.keys(FOLDERS)
+      .map((n) => `${n} ${state[n].total}`)
+      .join(", ")}`,
+  );
+} else if (command === "lower") {
+  const { above } = problems();
+  const grew = Object.keys(FOLDERS).some(
+    (n) => typeof record?.[n]?.ceiling !== "number" || state[n].total > record[n].ceiling,
+  );
+  if (above || grew) {
+    console.error(
+      `[bkit:text:ceiling] lower refused: a total is above its ceiling or the record is missing. Owner only: ${RAISE}`,
+    );
+    process.exit(1);
+  }
+  writeRecord(next(undefined));
+  console.log("[bkit:text:ceiling] ceilings lowered to the current totals");
+} else if (command === "raise") {
+  const reason = (opt("reason") ?? "").trim();
+  if (!reason) {
+    console.error(
+      `[bkit:text:ceiling] raise refused: a non-empty --reason is required. Usage: ${RAISE}`,
+    );
+    process.exit(1);
+  }
+  writeRecord(next(reason));
+  console.log("[bkit:text:ceiling] ceilings raised to the current totals");
+} else {
+  console.error(
+    "Usage: bkit-text-ceiling.mjs check|lower|raise [--reason <why>] [--root <dir>] [--record <file>]",
+  );
+  process.exit(1);
+}
