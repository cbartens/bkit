diff --git a/.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts b/.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts
index fb9091cd4..549e2f898 100644
--- a/.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts
+++ b/.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts
@@ -8,6 +8,7 @@ import { spawnSync } from "node:child_process";
 import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
+import { pathToFileURL } from "node:url";
 import { afterEach, describe, expect, it } from "vitest";
 
 const SCRIPT = path.resolve("scripts/gate/bkit-text-ceiling.mjs");
@@ -65,6 +66,26 @@ function run(args: string[], fx: Fixture, cwd?: string) {
   return { status: r.status, out: `${r.stdout}${r.stderr}` };
 }
 
+interface RaiseOptions {
+  root: string;
+  record: string;
+  reason: string;
+  confirm: (...shown: unknown[]) => boolean | Promise<boolean>;
+}
+
+/** The script's exported write path for `raise`: takes the typed confirmation as a callback. */
+async function callRaise(opts: RaiseOptions): Promise<void> {
+  const mod: { raiseCeilings?: (o: RaiseOptions) => unknown } = await import(
+    pathToFileURL(SCRIPT).href
+  );
+  expect(typeof mod.raiseCeilings).toBe("function");
+  try {
+    await Promise.resolve(mod.raiseCeilings?.(opts));
+  } catch {
+    // a refusal may throw; the tests assert on the record, not the refusal's shape
+  }
+}
+
 function readRecord(fx: Fixture): {
   workflows: { ceiling: number; reason: string };
   prompts: { ceiling: number; reason: string };
@@ -77,15 +98,18 @@ describe("bkit-text-ceiling check", () => {
     const fx = makeFixture(
       { "a.md": 10, "b.md": 10 },
       { "p.md": 5 },
-      { workflows: 15, prompts: 5 },
+      { workflows: 12, prompts: 5 },
     );
     const r = run(["check"], fx);
     expect(r.status).toBe(1);
     expect(r.out).toContain("20");
-    expect(r.out).toContain("15");
+    expect(r.out).toContain("12");
+    expect(r.out).toMatch(/\b8\b/);
     expect(r.out).toMatch(/a\.md|b\.md/);
-    expect(r.out).toContain('pnpm bkit:text:ceiling raise --reason "<why>"');
-    expect(r.out.toLowerCase()).toContain("owner");
+    expect(r.out).not.toContain('raise --reason "<why>"');
+    expect(r.out).toContain("pnpm bkit:text:ceiling raise --reason");
+    expect(r.out.toLowerCase()).toContain("only the owner");
+    expect(r.out.toLowerCase()).toContain("terminal");
   });
 
   it("passes when a total equals its ceiling", () => {
@@ -120,23 +144,23 @@ describe("bkit-text-ceiling check", () => {
 });
 
 describe("bkit-text-ceiling lower and raise", () => {
-  it("raise without a reason refuses and leaves the record unchanged", () => {
+  it("raise without a reason refuses and leaves the record unchanged", async () => {
     const fx = makeFixture({ "a.md": 20 }, { "p.md": 5 }, { workflows: 10, prompts: 5 });
     const before = fs.readFileSync(fx.record, "utf-8");
-    const r = run(["raise"], fx);
-    expect(r.status).toBe(1);
-    expect(r.out).toMatch(/reason/i);
+    await callRaise({ root: fx.root, record: fx.record, reason: "", confirm: () => true });
     expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);
-    const blank = run(["raise", "--reason", "  "], fx);
-    expect(blank.status).toBe(1);
-    expect(blank.out).toMatch(/reason/i);
+    await callRaise({ root: fx.root, record: fx.record, reason: "  ", confirm: () => true });
     expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);
   });
 
-  it("raise with a reason rewrites both ceilings and stores the reason on the folder that grew", () => {
+  it("raise with a reason rewrites both ceilings and stores the reason on the folder that grew", async () => {
     const fx = makeFixture({ "a.md": 20 }, { "p.md": 5 }, { workflows: 10, prompts: 5 });
-    const r = run(["raise", "--reason", "needed for new step"], fx);
-    expect(r.status).toBe(0);
+    await callRaise({
+      root: fx.root,
+      record: fx.record,
+      reason: "needed for new step",
+      confirm: () => true,
+    });
     const rec = readRecord(fx);
     expect(rec.workflows.ceiling).toBe(20);
     expect(rec.prompts.ceiling).toBe(5);
@@ -145,6 +169,53 @@ describe("bkit-text-ceiling lower and raise", () => {
     expect(run(["check"], fx).status).toBe(0);
   });
 
+  it("raise from a non-interactive caller refuses and leaves the record unchanged", () => {
+    const fx = makeFixture({ "a.md": 20 }, { "p.md": 5 }, { workflows: 10, prompts: 5 });
+    const before = fs.readFileSync(fx.record, "utf-8");
+    const variants: { extra: string[]; env: Record<string, string> }[] = [
+      { extra: [], env: {} },
+      { extra: ["--yes"], env: {} },
+      { extra: ["--force"], env: {} },
+      { extra: [], env: { CI: "1" } },
+    ];
+    for (const v of variants) {
+      const r = spawnSync(
+        "node",
+        [SCRIPT, "raise", "--reason", "x", ...v.extra, "--root", fx.root, "--record", fx.record],
+        { encoding: "utf-8", cwd: fx.root, env: { ...process.env, ...v.env }, input: "yes\n" },
+      );
+      expect(r.status).not.toBe(0);
+      expect(r.status).not.toBeNull();
+      expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);
+    }
+  });
+
+  it("raise at a terminal shows the old and new ceilings and writes only after the typed confirmation", async () => {
+    const fx = makeFixture({ "a.md": 20 }, { "p.md": 5 }, { workflows: 10, prompts: 5 });
+    const before = fs.readFileSync(fx.record, "utf-8");
+    const shown: string[] = [];
+    await callRaise({
+      root: fx.root,
+      record: fx.record,
+      reason: "needed",
+      confirm: (...a) => {
+        shown.push(JSON.stringify(a));
+        return false;
+      },
+    });
+    expect(shown.length).toBeGreaterThan(0);
+    expect(shown.join("\n")).toContain("10");
+    expect(shown.join("\n")).toContain("20");
+    expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);
+    await callRaise({
+      root: fx.root,
+      record: fx.record,
+      reason: "needed",
+      confirm: () => true,
+    });
+    expect(readRecord(fx).workflows.ceiling).toBe(20);
+  });
+
   it("lower rewrites both ceilings and keeps each reason", () => {
     const fx = makeFixture({ "a.md": 10 }, { "p.md": 5 }, { workflows: 30, prompts: 9 });
     const r = run(["lower"], fx);
@@ -167,6 +238,49 @@ describe("bkit-text-ceiling lower and raise", () => {
   });
 });
 
+describe("bkit-text-ceiling missing folders and a broken record", () => {
+  it("check fails and lower refuses when a text folder is missing or empty", () => {
+    for (const mode of ["missing", "empty"] as const) {
+      const fx = makeFixture({ "a.md": 10 }, { "p.md": 5 });
+      const dir = path.join(fx.root, ".bkit/core/prompts");
+      fs.rmSync(path.join(dir, "p.md"));
+      const removed = { missing: dir, empty: path.join(dir, "none") };
+      fs.rmSync(removed[mode], { recursive: true, force: true });
+      const before = fs.readFileSync(fx.record, "utf-8");
+      const c = run(["check"], fx);
+      expect(c.status).toBe(1);
+      expect(c.out).toContain(".bkit/core/prompts");
+      for (const args of [["lower"], ["raise", "--reason", "why"]]) {
+        const r = run(args, fx);
+        expect(r.status).not.toBe(0);
+        expect(r.out).toContain(".bkit/core/prompts");
+        expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);
+      }
+    }
+  });
+
+  it("check, lower and raise each fail with one line naming the record when it is not valid JSON", () => {
+    const fx = makeFixture({ "a.md": 10 }, { "p.md": 5 });
+    fs.writeFileSync(
+      fx.record,
+      '{\n<<<<<<< HEAD\n  "prompts": { "ceiling": 5, "reason": "a" },\n=======\n  "prompts": { "ceiling": 4, "reason": "b" },\n>>>>>>> other\n}\n',
+    );
+    const before = fs.readFileSync(fx.record, "utf-8");
+    for (const args of [["check"], ["lower"], ["raise", "--reason", "why"]]) {
+      const r = run(args, fx);
+      expect(r.status).not.toBe(0);
+      expect(r.status).not.toBeNull();
+      const lines = r.out.split("\n").filter((l) => l.trim() !== "");
+      expect(lines).toHaveLength(1);
+      expect(r.out).toContain("scripts/gate/bkit-text-ceiling.json");
+      expect(r.out).toContain("not valid JSON");
+      expect(r.out).toContain("pnpm bkit:text:ceiling lower");
+      expect(r.out).not.toContain("SyntaxError");
+      expect(fs.readFileSync(fx.record, "utf-8")).toBe(before);
+    }
+  });
+});
+
 describe("bkit-text-ceiling on the real repo", () => {
   it("bkit's own workflow and prompt folders sit exactly at the committed ceilings", () => {
     const r = spawnSync("node", [SCRIPT, "check"], { encoding: "utf-8", cwd: path.resolve(".") });
diff --git a/docs/testing.md b/docs/testing.md
index 42b9373ed..0b0052ab7 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -571,7 +571,7 @@ Manual host-hook compatibility experiments live in [`tests/experiments/hooks/`](
 - **Time limits:** under `CI` the Vitest per-test and per-hook budgets (`vitest.timeout-budget.ts`) are strict (5s / 10s unit, 30s integration); off CI each is a fixed 6 times that (30s / 60s / 180s), a hang limit with no load reading. A limit a test file sets itself goes through `localLimit(ms)`, including one held in a named constant, so it stays as written under `CI` and is 6 times that off CI; `vitest.setup.ts` records the factor in `BKIT_LIMIT_FACTOR` before it clears `CI`, so a test file still reads the CI factor. The budgets also cap synchronous child calls (`vitest.child-deadline.ts`): a call with no `timeout` gets, from a test body, the test's timeout counted from when the body starts (`beforeEach` time is not taken off it; time the body spent before the call is), and, from a file's own `beforeEach` / `afterEach` hook (read from the hook state Vitest records on the running test, so it holds across an `await`), the test's remaining time but never less than the hook timeout so cleanup is not cut short, and is ended with SIGKILL (unless the caller sets `killSignal`) so a child that ignores SIGTERM cannot outlast it. From a `beforeAll` / `afterAll` hook, the call gets the hook timeout. No child limit reads a hook's own timeout, so a hook given a longer limit of its own, such as `beforeAll(fn, localLimit(120_000))`, passes `timeout` to the child processes it starts. `node --test` runs get `--test-timeout` and `--test-force-exit` from `scripts/ci/bkit-test-limits.mjs`, derived from the integration budget (30s under CI); `pnpm bkit:test:awake` runs its test file through `scripts/ci/bkit-test-file.mjs`, so it gets them too. Bats gets `BATS_TEST_TIMEOUT` from the same source, or from `tests/shell/setup_suite.bash` for `pnpm bkit:test:bats`. A limit kills only the direct child, so a grandchild it started can outlive the run. `patches/bats@1.13.0.patch` fixes two bats 1.13.0 defects: `bats-exec-test` declared the watchdog pid with `declare -r` inside a function, so a failing test could not stop its watchdog and waited out the whole limit; `bin/bats` ran `env` on a path that pnpm's patched-package directory name makes look like an assignment.
 - **Changed files:** `pnpm bkit:gate:changed {file}...` holds the `tests` lock through `scripts/ci/bkit-machine-lock.sh` and passes the file arguments to `scripts/gate/bkit-gate-changed.mjs`, which `bkit tests changed` calls for build and debug agents and `bkit tests run --changed-since=<sha>` calls for the build group gate: `vitest related --run` on the changed files, every test file that names a changed path (Vitest, `node --test` or bats by file type), Oxlint on changed engine `.ts`, Prettier on every changed file, and `pnpm typecheck` when a `.ts` file changed. Runs every stage, and exits 1 when any fails.
 - **Test gates:** `bkit:gate:static-unit`, `bkit:gate:static-unit-integration` and `bkit:gate:install-static-unit-build` hold the same `tests` lock for their whole run. A nested gate inherits its parent's live lock owner and runs unlocked.
-- **Text ceiling:** the unit tier fails when the word total of `.bkit/core/workflows/*.md` or `.bkit/core/prompts/*.md` differs from `scripts/gate/bkit-text-ceiling.json`. `pnpm bkit:text:ceiling lower` shrinks the record and needs no reason; `pnpm bkit:text:ceiling raise --reason "<why>"` is run by the owner only and is never called by a workflow, hook or agent.
+- **Text ceiling:** the unit tier fails when the word total of `.bkit/core/workflows/*.md` or `.bkit/core/prompts/*.md` differs from `scripts/gate/bkit-text-ceiling.json`. `pnpm bkit:text:ceiling lower` shrinks the record and needs no reason; `pnpm bkit:text:ceiling raise --reason "<why>"` is run by the owner only and is never called by a workflow, hook or agent: it refuses unless stdin and stdout are a terminal, shows each folder's old and new ceiling, and writes the record only after the owner types the confirmation it asks for.
 - **Test files** sit next to the file they test under `.bkit/core/engine/`; tests that read shipped text (workflows, templates, hooks, this repo's own docs and ledgers) sit in `.bkit/core/engine/audits/{workflows,templates,hooks,repo}/`. `tests/` holds automated shell tests in `shell/`, reusable inputs in `fixtures/` and manual research in `experiments/{compression,hooks}/`. Experiments keep reports in `reports/`, illustrations in `assets/` and preserved observations in dated `results/` folders.
 - **Shell names and runner:** Authored shell tests use `bkit-<subject>-<behaviour>.bats`. Keep the runner-required `setup_suite.bash` name and fixture names required by the software they imitate, such as `gh` and `package.json`. Local gates and CI both call `pnpm bkit:test:bats`, which selects `tests/shell/*.bats` and loads the adjacent suite setup. Manual experiments remain outside that selection.
 - **Real-repo guard:** both tiers run from `.husky/pre-push`, whose git exports `GIT_DIR` (from a linked worktree `<main>/.git/worktrees/<name>`, which beats a child's cwd and `-C`). `vitest.setup.ts` and `tests/shell/setup_suite.bash` clear every `GIT_*` variable before any test runs, then read `user.name` / `user.email` / `core.bare` / `core.worktree` of the repo the run starts from; a change fails the test (vitest, after each test, `vitest.repo-config-guard.ts`) or the run (bats `teardown_suite`) and puts the old values back. Pinned by `.bkit/core/engine/audits/repo/vitest-repo-config-guard.test.ts` and `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts`.
@@ -799,7 +799,7 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` (`.husky/pre-push direnv`) | Integration (stub `direnv` and `pnpm`, both hook copies) | The inner run goes through `direnv exec .` and the gate sees the `.envrc` variables; an untrusted `.envrc` blocks before `bkit check` with direnv's message and the `direnv allow .` fix; a trusted `.envrc` that fails to load blocks with direnv's own output and no `direnv allow .` advice; no `.envrc`, no `direnv` on `PATH` or `CI` set skip direnv. |
 | `.bkit/core/engine/checks/tips/catalogue.test.ts` | Unit | The `pre-push-pr-conflict` tip fires for a `.husky/pre-push` without `merge-tree` or `PUSH_BRANCH_SHA=`, and not for one with both or for no hook. The `project-goals` tip fires for a rules file with no `## Project Goals` heading or only commented examples, and stays quiet for one goal bullet (`-`, `*` or numbered), a goal in a second section, or no rules file; its ask says to fill an existing section instead of adding a second. |
 | `.bkit/core/engine/audits/repo/rules-sync.test.ts` (`Project Goals`) | Unit | The shipped `.bkit/core/.agents/rules.md` holds `## Project Rules`, `## Project Goals` and `## Project Settings` in that order below `bkit:end`, with no goal bullet and no project rule outside an HTML comment. |
-| `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | Unit | `scripts/gate/bkit-text-ceiling.mjs check` fails above the ceiling (naming total, ceiling, grown files and the raise command), passes at it, fails below it (naming `lower`); `raise` without a reason and `lower` when above refuse and leave the record unchanged; growth names only files that grew since the record's last commit; bkit's own folders sit at the committed ceilings. |
+| `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` | Unit | `scripts/gate/bkit-text-ceiling.mjs check` fails above the ceiling (naming total, ceiling, grown files and the raise command), passes at it, fails below it (naming `lower`); `raise` without a reason, `raise` from a non-terminal caller (no flag or variable skips this) and `lower` when above refuse and leave the record unchanged; `raise` at a terminal shows old and new ceilings and writes only after the typed confirmation; a missing or empty folder and an invalid-JSON record fail with one line; growth names only files that grew since the record's last commit; bkit's own folders sit at the committed ceilings. |
 | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` | Integration | The rules-read advisory on the hosts with no session-start event: the OpenCode plugin driven through both the 1.x `server()` and 2.0 `setup()` shapes, and the rendered Codex and Antigravity `bkit-rules.cjs` hooks spawned as their host runs them — advisory once per session (also when the state dir cannot be written: per-user state dir, in-process memory for OpenCode), fail-open, no `AGENTS.md`; the shell and JS parts hold the byte-identical advisory string. |
 | `.bkit/core/engine/render/parts.test.ts` | Unit | `renderParts` part-line splicing (JS and shell markers, no nesting, missing part throws); the host hook templates splice parts only inside the managed block, every part is used by two or more hosts, and every generated hook passes `node --check` / `bash -n`. |
 | `.bkit/core/engine/install/modules/index.integration.test.ts` | Integration | One canonical permission-gate table asserted across Claude `settings.json`, OpenCode `opencode.json`, Cursor `bkit-guardrails.cjs` and Codex `bkit-guardrails.cjs` — same verdict for every destructive command on all four hosts; secret reads asserted on Antigravity, Cursor and OpenCode `bkit-guardrails.cjs` (Codex has no file-read tool, so its reads are shell commands); Codex denies a shell command that prints or sends a private key's content (`it.each` over the exposing and the use-write-or-name commands) and keeps `.env` reads advisory. Plus shell-as-edit-channel advisories, curl / wget host matching, every hook finding `.bkit/allowlist.json` from payload dirs whatever its cwd, every reader host's install writing it (and moving a recorded `.cursor/allowlist.json`), and the documented per-host divergences. |
diff --git a/scripts/gate/bkit-text-ceiling.mjs b/scripts/gate/bkit-text-ceiling.mjs
index bf4de776e..fe1b467c9 100644
--- a/scripts/gate/bkit-text-ceiling.mjs
+++ b/scripts/gate/bkit-text-ceiling.mjs
@@ -5,31 +5,26 @@
  * (`.bkit/core/workflows/*.md`, `.bkit/core/prompts/*.md`), kept in a committed record.
  *   check   exit 1 when a total is above or below its ceiling, 0 when equal
  *   lower   rewrite both ceilings to the current totals; refuses when a total is above its ceiling
- *   raise   --reason "<why>": rewrite both ceilings to the current totals (owner only)
+ *   raise   --reason "<why>": rewrite both ceilings to the current totals; owner only, refuses unless
+ *           stdin and stdout are a terminal and the person types the confirmation
  * Options: --root <dir> (default: repo root), --record <file> (default: scripts/gate/bkit-text-ceiling.json).
  */
 
 import { spawnSync } from "node:child_process";
 import fs from "node:fs";
 import path from "node:path";
+import readline from "node:readline/promises";
+import { fileURLToPath } from "node:url";
 
 const FOLDERS = { prompts: ".bkit/core/prompts", workflows: ".bkit/core/workflows" };
 const RAISE = 'pnpm bkit:text:ceiling raise --reason "<why>"';
+const RECORD_REL = "scripts/gate/bkit-text-ceiling.json";
 
-const argv = process.argv.slice(2);
-const command = argv[0];
-const opt = (name) => {
-  const i = argv.indexOf(`--${name}`);
-  return i === -1 ? undefined : (argv[i + 1] ?? "");
-};
-const root = path.resolve(opt("root") ?? path.resolve(import.meta.dirname, "..", ".."));
-const recordPath = path.resolve(
-  opt("record") ?? path.join(root, "scripts/gate/bkit-text-ceiling.json"),
-);
+class CeilingError extends Error {}
 
 const countWords = (text) => text.split(/\s+/).filter(Boolean).length;
 
-function listFiles(folder) {
+function listFiles(root, folder) {
   const dir = path.join(root, folder);
   if (!fs.existsSync(dir)) return [];
   return fs
@@ -42,18 +37,18 @@ function listFiles(folder) {
     }));
 }
 
-function git(args) {
+function git(root, args) {
   const r = spawnSync("git", args, { cwd: root, encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 });
   return r.status === 0 ? r.stdout : null;
 }
 
 /** Files of one folder that grew since the record's last commit; the five largest without one. */
-function grownFiles(files) {
-  const sha = git(["log", "-1", "--format=%H", "--", recordPath])?.trim();
+function grownFiles(root, recordPath, files) {
+  const sha = git(root, ["log", "-1", "--format=%H", "--", recordPath])?.trim();
   let rows;
   if (sha) {
     rows = files.map((f) => {
-      const old = git(["show", `${sha}:${f.rel}`]);
+      const old = git(root, ["show", `${sha}:${f.rel}`]);
       return { ...f, delta: f.words - (old === null ? 0 : countWords(old)) };
     });
     rows = rows.filter((r) => r.delta > 0);
@@ -63,12 +58,18 @@ function grownFiles(files) {
   return rows.sort((a, b) => b.delta - a.delta || a.rel.localeCompare(b.rel)).slice(0, 5);
 }
 
-function loadRecord() {
+function loadRecord(recordPath) {
   if (!fs.existsSync(recordPath)) return null;
-  return JSON.parse(fs.readFileSync(recordPath, "utf-8"));
+  try {
+    return JSON.parse(fs.readFileSync(recordPath, "utf-8"));
+  } catch {
+    throw new CeilingError(
+      `${RECORD_REL} is not valid JSON (a merge conflict?). Take either side of the conflict and run: pnpm bkit:text:ceiling lower`,
+    );
+  }
 }
 
-function writeRecord(rec) {
+function writeRecord(recordPath, rec) {
   const sorted = {};
   for (const k of Object.keys(rec).sort()) {
     sorted[k] = { ceiling: rec[k].ceiling, reason: rec[k].reason };
@@ -77,14 +78,28 @@ function writeRecord(rec) {
   fs.writeFileSync(recordPath, `${JSON.stringify(sorted, null, 2)}\n`);
 }
 
-const state = {};
-for (const [name, folder] of Object.entries(FOLDERS)) {
-  const files = listFiles(folder);
-  state[name] = { files, total: files.reduce((a, f) => a + f.words, 0) };
+function load(root, recordPath) {
+  const record = loadRecord(recordPath);
+  const state = {};
+  const empty = [];
+  for (const [name, folder] of Object.entries(FOLDERS)) {
+    const files = listFiles(root, folder);
+    if (files.length === 0) empty.push(folder);
+    state[name] = { files, total: files.reduce((a, f) => a + f.words, 0) };
+  }
+  return { record, state, empty };
+}
+
+function requireFolders(ctx) {
+  if (ctx.empty.length > 0) {
+    throw new CeilingError(
+      `${ctx.empty.join(", ")} is missing or holds no *.md file; the ceiling cannot be counted. Restore the folder, or move the record's folder with the text.`,
+    );
+  }
 }
-const record = loadRecord();
 
-function problems() {
+function problems(root, recordPath, ctx) {
+  const { record, state } = ctx;
   const out = [];
   let above = false;
   for (const name of Object.keys(FOLDERS)) {
@@ -97,12 +112,12 @@ function problems() {
     }
     if (total > ceiling) {
       above = true;
-      const grown = grownFiles(state[name].files)
+      const grown = grownFiles(root, recordPath, state[name].files)
         .map((f) => `    ${f.rel} (+${f.delta}, ${f.words} words)`)
         .join("\n");
       out.push(
-        `${name}: ${total} words is above the ceiling of ${ceiling}. Files that grew most:\n${grown}\n` +
-          `  Shorten the text, or (owner only, never from a workflow, hook or agent) run: ${RAISE}`,
+        `${name}: ${total} words is above the ceiling of ${ceiling}, over the ceiling by ${total - ceiling} words. Files that grew most:\n${grown}\n` +
+          "  Shorten the text. Only the owner raises the ceiling, at a terminal, with: pnpm bkit:text:ceiling raise --reason",
       );
     } else if (total < ceiling) {
       out.push(
@@ -113,11 +128,11 @@ function problems() {
   return { out, above };
 }
 
-function next(reasonFor) {
+function next(ctx, reasonFor) {
   const rec = {};
   for (const name of Object.keys(FOLDERS)) {
-    const old = record?.[name];
-    const total = state[name].total;
+    const old = ctx.record?.[name];
+    const total = ctx.state[name].total;
     rec[name] = {
       ceiling: total,
       reason: old && old.ceiling === total ? old.reason : (reasonFor ?? old?.reason ?? ""),
@@ -126,43 +141,108 @@ function next(reasonFor) {
   return rec;
 }
 
-if (command === "check") {
-  const { out } = problems();
-  if (out.length > 0) {
-    console.error(`[bkit:text:ceiling] FAIL\n${out.join("\n")}`);
-    process.exit(1);
+/**
+ * The write path of `raise`. `confirm` receives the old and new ceilings of each folder and
+ * resolves true only when the person typed the confirmation; the record is written only then.
+ * Returns true when written.
+ */
+export async function raiseCeilings({ root, record, reason, confirm }) {
+  const recordPath = path.resolve(record ?? path.join(root, RECORD_REL));
+  const ctx = load(path.resolve(root), recordPath);
+  requireFolders(ctx);
+  const why = (reason ?? "").trim();
+  if (!why) {
+    throw new CeilingError(`raise refused: a non-empty --reason is required. Usage: ${RAISE}`);
   }
-  console.log(
-    `[bkit:text:ceiling] ok — ${Object.keys(FOLDERS)
-      .map((n) => `${n} ${state[n].total}`)
-      .join(", ")}`,
-  );
-} else if (command === "lower") {
-  const { above } = problems();
-  const grew = Object.keys(FOLDERS).some(
-    (n) => typeof record?.[n]?.ceiling !== "number" || state[n].total > record[n].ceiling,
-  );
-  if (above || grew) {
-    console.error(
-      `[bkit:text:ceiling] lower refused: a total is above its ceiling or the record is missing. Owner only: ${RAISE}`,
+  const proposed = next(ctx, why);
+  const shown = Object.keys(FOLDERS)
+    .map((n) => `${n}: ceiling ${ctx.record?.[n]?.ceiling ?? "none"} -> ${proposed[n].ceiling}`)
+    .join("\n");
+  if (!(await confirm(shown))) {
+    throw new CeilingError(
+      "raise cancelled: the confirmation was not given; the record is unchanged.",
     );
-    process.exit(1);
   }
-  writeRecord(next(undefined));
-  console.log("[bkit:text:ceiling] ceilings lowered to the current totals");
-} else if (command === "raise") {
-  const reason = (opt("reason") ?? "").trim();
-  if (!reason) {
+  writeRecord(recordPath, proposed);
+  return true;
+}
+
+async function typedConfirm(shown) {
+  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
+  try {
+    console.log(`Raise the text ceilings (owner only):\n${shown}`);
+    const answer = await rl.question("Type RAISE to write the record: ");
+    return answer.trim() === "RAISE";
+  } finally {
+    rl.close();
+  }
+}
+
+async function main(argv) {
+  const command = argv[0];
+  const opt = (name) => {
+    const i = argv.indexOf(`--${name}`);
+    return i === -1 ? undefined : (argv[i + 1] ?? "");
+  };
+  const root = path.resolve(opt("root") ?? path.resolve(import.meta.dirname, "..", ".."));
+  const recordPath = path.resolve(opt("record") ?? path.join(root, RECORD_REL));
+
+  if (command === "check") {
+    const ctx = load(root, recordPath);
+    requireFolders(ctx);
+    const { out } = problems(root, recordPath, ctx);
+    if (out.length > 0) {
+      console.error(`[bkit:text:ceiling] FAIL\n${out.join("\n")}`);
+      process.exit(1);
+    }
+    console.log(
+      `[bkit:text:ceiling] ok — ${Object.keys(FOLDERS)
+        .map((n) => `${n} ${ctx.state[n].total}`)
+        .join(", ")}`,
+    );
+  } else if (command === "lower") {
+    const ctx = load(root, recordPath);
+    requireFolders(ctx);
+    const { above } = problems(root, recordPath, ctx);
+    const grew = Object.keys(FOLDERS).some(
+      (n) =>
+        typeof ctx.record?.[n]?.ceiling !== "number" || ctx.state[n].total > ctx.record[n].ceiling,
+    );
+    if (above || grew) {
+      console.error(
+        `[bkit:text:ceiling] lower refused: a total is above its ceiling or the record is missing. Owner only: ${RAISE}`,
+      );
+      process.exit(1);
+    }
+    writeRecord(recordPath, next(ctx, undefined));
+    console.log("[bkit:text:ceiling] ceilings lowered to the current totals");
+  } else if (command === "raise") {
+    const ctx = load(root, recordPath);
+    requireFolders(ctx);
+    if (!(opt("reason") ?? "").trim()) {
+      throw new CeilingError(`raise refused: a non-empty --reason is required. Usage: ${RAISE}`);
+    }
+    if (!process.stdin.isTTY || !process.stdout.isTTY) {
+      throw new CeilingError(
+        "raise refused: it runs only at a terminal (stdin and stdout) and the owner types the confirmation.",
+      );
+    }
+    await raiseCeilings({ root, record: recordPath, reason: opt("reason"), confirm: typedConfirm });
+    console.log("[bkit:text:ceiling] ceilings raised to the current totals");
+  } else {
     console.error(
-      `[bkit:text:ceiling] raise refused: a non-empty --reason is required. Usage: ${RAISE}`,
+      "Usage: bkit-text-ceiling.mjs check|lower|raise [--reason <why>] [--root <dir>] [--record <file>]",
     );
     process.exit(1);
   }
-  writeRecord(next(reason));
-  console.log("[bkit:text:ceiling] ceilings raised to the current totals");
-} else {
-  console.error(
-    "Usage: bkit-text-ceiling.mjs check|lower|raise [--reason <why>] [--root <dir>] [--record <file>]",
-  );
-  process.exit(1);
+}
+
+if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
+  main(process.argv.slice(2)).catch((e) => {
+    if (e instanceof CeilingError) {
+      console.error(`[bkit:text:ceiling] ${e.message}`);
+      process.exit(1);
+    }
+    throw e;
+  });
 }
