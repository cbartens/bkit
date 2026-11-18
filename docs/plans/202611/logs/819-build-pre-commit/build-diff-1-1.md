diff --git a/.bkit/core/engine/audits/repo/check-dist.integration.test.ts b/.bkit/core/engine/audits/repo/check-dist.integration.test.ts
new file mode 100644
index 000000000..f4d1b7f20
--- /dev/null
+++ b/.bkit/core/engine/audits/repo/check-dist.integration.test.ts
@@ -0,0 +1,130 @@
+// audits/repo/check-dist.integration.test.ts — `scripts/gate/bkit-check-dist.mjs` checks the
+// staged `dist/` against a compile of the staged tree, never the working tree.
+//
+// Each probe builds a scratch git repo with two engine sources and a committed `dist/`, then runs
+// the real script with that repo as its working directory.
+
+import { spawnSync } from "node:child_process";
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+import { afterEach, describe, expect, it } from "vitest";
+import { localLimit } from "../../../../../vitest.timeout-budget";
+
+const ROOT = process.cwd();
+const SCRIPT = path.join(ROOT, "scripts/gate/bkit-check-dist.mjs");
+const TSC = path.join(ROOT, "node_modules/.bin/tsc");
+const STALE_MESSAGE = "[bkit] dist/ is stale — run pnpm build and commit the result";
+
+const temps: string[] = [];
+
+afterEach(() => {
+  for (const dir of temps.splice(0)) {
+    fs.rmSync(dir, { recursive: true, force: true });
+  }
+});
+
+function git(cwd: string, ...args: string[]) {
+  const result = spawnSync("git", args, { cwd, encoding: "utf-8" });
+  expect(result.status, `git ${args.join(" ")}: ${result.stderr}`).toBe(0);
+  return result.stdout;
+}
+
+function build(cwd: string) {
+  fs.rmSync(path.join(cwd, "dist"), { recursive: true, force: true });
+  const result = spawnSync(TSC, [], { cwd, encoding: "utf-8" });
+  expect(result.status, `tsc: ${result.stdout}`).toBe(0);
+}
+
+function write(cwd: string, file: string, text: string) {
+  fs.mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true });
+  fs.writeFileSync(path.join(cwd, file), text);
+}
+
+const A = ".bkit/core/engine/a.ts";
+const B = ".bkit/core/engine/b.ts";
+
+/** A scratch repo with a.ts and b.ts committed together with the dist built from them. */
+function scratchRepo(): string {
+  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-check-dist-"));
+  temps.push(dir);
+  git(dir, "init", "-q");
+  git(dir, "config", "user.email", "test@example.com");
+  git(dir, "config", "user.name", "Test");
+  fs.copyFileSync(path.join(ROOT, "tsconfig.json"), path.join(dir, "tsconfig.json"));
+  fs.symlinkSync(path.join(ROOT, "node_modules"), path.join(dir, "node_modules"));
+  write(dir, ".gitignore", "node_modules\ntmp\n");
+  write(dir, A, "export const a: number = 1;\n");
+  write(dir, B, "export const b: number = 1;\n");
+  build(dir);
+  git(dir, "add", "-A");
+  git(dir, "commit", "-q", "-m", "init");
+  return dir;
+}
+
+function check(cwd: string) {
+  return spawnSync("node", [SCRIPT], { cwd, encoding: "utf-8" });
+}
+
+function readDist(cwd: string): Record<string, string> {
+  const out: Record<string, string> = {};
+  const walk = (rel: string) => {
+    for (const entry of fs.readdirSync(path.join(cwd, rel), { withFileTypes: true })) {
+      const next = path.join(rel, entry.name);
+      if (entry.isDirectory()) walk(next);
+      else out[next] = fs.readFileSync(path.join(cwd, next), "utf-8");
+    }
+  };
+  walk("dist");
+  return out;
+}
+
+function scratchLeftovers(cwd: string): string[] {
+  const tmp = path.join(cwd, "tmp");
+  const names = fs.existsSync(tmp) ? fs.readdirSync(tmp) : [];
+  return names.filter((n) => n.startsWith("check-dist-"));
+}
+
+/** Stage an a.ts edit with its matching rebuilt dist, then leave a b.ts edit unstaged. */
+function stageAWithUnstagedB(dir: string) {
+  write(dir, A, "export const a: number = 2;\n");
+  build(dir);
+  git(dir, "add", A, "dist");
+  write(dir, B, "export const b: number = 2;\n");
+}
+
+describe("bkit-check-dist", () => {
+  it(
+    "passes for the staged tree with an unstaged engine edit beside it",
+    { timeout: localLimit(120_000) },
+    () => {
+      const dir = scratchRepo();
+      stageAWithUnstagedB(dir);
+      const result = check(dir);
+      expect(result.stderr + result.stdout).not.toContain("dist/ is stale");
+      expect(result.status).toBe(0);
+    },
+  );
+
+  it("refuses a stale staged dist", { timeout: localLimit(120_000) }, () => {
+    const dir = scratchRepo();
+    write(dir, A, "export const a: number = 3;\n");
+    git(dir, "add", A);
+    const result = check(dir);
+    expect(result.status).not.toBe(0);
+    expect(result.stderr + result.stdout).toContain(STALE_MESSAGE);
+  });
+
+  it("leaves the working tree's dist untouched", { timeout: localLimit(120_000) }, () => {
+    const dir = scratchRepo();
+    stageAWithUnstagedB(dir);
+    // A working-tree dist that differs from both the staged dist and any fresh build.
+    write(dir, "dist/b.js", "// hand-edited working tree output\n");
+    write(dir, "dist/extra.js", "// untracked working tree output\n");
+    const before = readDist(dir);
+    const result = check(dir);
+    expect(result.status, result.stderr).toBe(0);
+    expect(readDist(dir)).toEqual(before);
+    expect(scratchLeftovers(dir)).toEqual([]);
+  });
+});
diff --git a/docs/testing.md b/docs/testing.md
index b94b3896e..b4a912863 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -787,6 +787,7 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `.bkit/core/engine/audits/templates/branding.test.ts` | Unit | Branding guard: template script names that run bkit code start `bkit:`, template file names, workflow and job display names and the shipped Vale style start `bkit-` / `Bkit`; each rule runs on a seeded negative. |
 | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | Unit | Every template has an entry; each repo-root copy equals the template after its listed edits (placeholder / adapt / bkit-only), else the test fails. Change a copy → list the edit there. |
 | `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts` | Integration | bkit's own `bkit:test:file` (`scripts/ci/bkit-test-file.mjs`) on a `.bats`, a `node:test` `.mjs` and a Vitest file: the JUnit report at `$BKIT_TEST_REPORT` holds the named test passed (read with the audit's `parseJunit` / `judgeGreen`); unset report path leaves the test file untouched; files of two runners → exit 2; a `node:test` file whose test awaits a never-exiting child exits 1 within the limit, reported as a failure. `bkit:lint:file` exits 0 on each kind. |
+| `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` | Integration | `scripts/gate/bkit-check-dist.mjs` in a scratch git repo: a staged edit with a matching staged `dist/` passes beside an unstaged engine edit; a stale staged `dist/` exits 1 with `[bkit] dist/ is stale`; the working tree's `dist/` bytes and `tmp/` stay untouched. |
 | `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts` | Integration | `tests/shell/setup_suite.bash` under a linked worktree's `GIT_DIR`: clears every `GIT_*` variable, fails and undoes a test's identity or `core.bare` write; a hanging bats test fails with `timeout after` under `CI=true`. |
 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | Integration | Cursor destructive-op / secret-exposure hook (`.cursor/hooks/bkit-guardrails.cjs`, spawned): the tiers judge the commands that run, not quoted text (a quoted commit message, `echo`, `grep` and `gh` body allowed; a force push inside `$(…)`, `bash -c` (also `bash -c -- '…'`), `eval`, `env -S`, `find -exec`, `function f { …; }`, a heredoc fed to `bash`, literal `echo` / `printf` / `cat <<` text piped into a shell, an `echo` in `<(…)` given to `bash` or `source`, or behind `timeout` / `env -u` / `nice` / `setsid` refused; `echo … \| grep` and `echo … \| cat` allowed; a command over 256 KiB cut on a character boundary); `rm -rf` of a root or home (also `//`, `/.`, behind `doas` or `busybox`) refused and of a project path allowed, a world-writable `chmod -R` of `/` (`777`, `0777`, `a+rwx`), `sudo` and `doas` as program or wrapper, `bkit tests jump` (refused on Codex only), `cat .env` and `cat < .env`; the deny part spliced once into the Claude, Codex, Cursor and Antigravity hooks; curl-wget host allowlist read from the parsed curl / wget words only (a URL in a quoted `echo` is not a fetch; one after `--` or behind `timeout` / `env -u` is), private-key and `.env` reads, managed-block boundary. Shell-edit advice from the known-writers table: each writer names its target (`perl -lpi` and `-0777pi` too), a variable target (also `find -exec sed -i … {} +`) warns without a name, `git -C sub apply` warns, `node` / `python3` script runs, `prettier --check` and `git checkout -b` are silent; the analysis bounds and the output budget; `guardrails-shell.js` is at most 1433 lines; live visibility on any host stays unverified. |
 | `.bkit/core/engine/audits/hooks/guardrails-parity.integration.test.ts` | Integration | The five hosts' guardrails hooks as install renders them: `composeAdvice` gives Codex, Cursor and Antigravity one advice text for deny, ask, secret, fetch and edit apart from the host name, and a long fetch command is cut inside the 2000-byte budget; the Claude hook prints a deny JSON and exits 0 for an `env -u FOO` force push and no deny for a quoted one; the OpenCode plugin, run in process on 1.x and 2.0 payloads, throws for that force push, returns for `git status` and returns when it errors; one command table gets the same refuse-or-allow verdict on all five hosts, with ask only on Cursor and Antigravity and the Codex-only `bkit tests jump` deny; private-key shell commands: Codex denies each command that prints a key's content or sends it off the machine (`git show`, `dd`, `openssl` encoders, `@file` uploads, `scp` to a host, globs that can match a key) and does not deny one that uses, writes, edits in place or names a key file, Cursor and Antigravity ask on every command that names a key file (`id_ed25519`, `*.key` and key globs included), and Claude Code and OpenCode allow; `classifyShell`, loaded from the rendered Cursor block, gives `deny` for `codex` and `secret` for `cursor` and `antigravity` from the host argument alone; an argv-array command (`["bash", "-lc", "git push -f origin dev"]`) is refused on Claude, Codex and Antigravity and a quoted array element is not. No test starts a host session. |
@@ -993,7 +994,7 @@ Any read-only filesystem invariant: step 6 = `fileUnchanged` (not mtime). `after
 `.github/workflows/bkit-ci.yml` is the template `.bkit/templates/.github/workflows/bkit-ci.yml` with the adaptations `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` lists. It runs a 5-job scaffold on every push to `dev` / `main` and PRs into them — a **flat DAG**: `bkit-tests-scope` fans out to every lane, the capstone joins them, so wall-clock == the slowest single lane. One run per branch or PR: a newer run cancels the older one, except on `main`, which queues (template `concurrency`). bkit has no browser / DB / deploy, so there is no `bkit-tests-build` / `-e2e` / `-migration` / `-live`:
 
 1. **`bkit-tests-scope`** (always-on planner; no `if:`, never skips) — reads markers, computes `run_level` (`[skip ci]` → none, a hard veto over any force marker; `[force build]` / `[force full]` / PR / `workflow_dispatch` / push-to-`main` / every `dev` push → full; push to any other branch → light), emits the `bkit-test-plan` JSON via `steps.scope.outputs.plan` and a `$GITHUB_STEP_SUMMARY` table. Markers are read from the commit message (push) or the PR title (`pull_request`) only, so **none** of them apply on a `workflow_dispatch` — steer that path with workflow inputs (`deployments.md` § Commit-message force tags). It is the planner, not a test lane, but it lives in the `bkit-tests-*` namespace, so any guard treating every `bkit-tests-*` job as a lane must exempt it by name.
-2. **`bkit-tests-static`** (`if: run_level != 'none'`) — static-analysis lane, run on a clean tree (no test artifacts): `pnpm typecheck` → `pnpm lint` → `pnpm format:check` → vale prose lint → `pnpm lint:slop` → slop delta (PR-only) → actionlint → `pnpm bkit check` (drift gate) → `pnpm bkit:check:dist` (rebuilds `dist/`, fails on drift) → `pnpm bkit:audit:status` (Tier-3 run-completeness sweep over `docs/plans/*/logs/*/status.jsonl`). The sweep step is the lane's only non-blocking-on-holes step — the sweep exits 0 even when it finds holes (`|| true`), so a hole never fails `bkit-tests-static`; the step fails only when the sweep printed no `[bkit-status-holes] sweep:` summary line (a silent no-op), pinned by `tests/shell/bkit-status-holes-sweep.bats`. Keep it wired: promotion to a blocking gate is gated on accruing fail-open signal, which requires a live caller (contract: § Tier-3 fail-open advisory channel). Checks out at `fetch-depth: 0` so slop delta can materialise the PR base as a worktree. Vale is installed in-lane (pinned tarball, sha256-verified before extract, then `vale sync`) — the runner has none and `.vale/styles/` is gitignored, so without it `pnpm bkit:lint:prose` fails with an unavailable-tool result. Also carries the non-blocking promotion-lag warning on `dev` pushes (see `docs/deployments.md` § Promotion-lag warning).
+2. **`bkit-tests-static`** (`if: run_level != 'none'`) — static-analysis lane, run on a clean tree (no test artifacts): `pnpm typecheck` → `pnpm lint` → `pnpm format:check` → vale prose lint → `pnpm lint:slop` → slop delta (PR-only) → actionlint → `pnpm bkit check` (drift gate) → `pnpm bkit:check:dist` (`scripts/gate/bkit-check-dist.mjs`: compiles the staged tree in `tmp/check-dist-*` and fails when the staged `dist/` differs; never touches the working tree's `dist/`) → `pnpm bkit:audit:status` (Tier-3 run-completeness sweep over `docs/plans/*/logs/*/status.jsonl`). The sweep step is the lane's only non-blocking-on-holes step — the sweep exits 0 even when it finds holes (`|| true`), so a hole never fails `bkit-tests-static`; the step fails only when the sweep printed no `[bkit-status-holes] sweep:` summary line (a silent no-op), pinned by `tests/shell/bkit-status-holes-sweep.bats`. Keep it wired: promotion to a blocking gate is gated on accruing fail-open signal, which requires a live caller (contract: § Tier-3 fail-open advisory channel). Checks out at `fetch-depth: 0` so slop delta can materialise the PR base as a worktree. Vale is installed in-lane (pinned tarball, sha256-verified before extract, then `vale sync`) — the runner has none and `.vale/styles/` is gitignored, so without it `pnpm bkit:lint:prose` fails with an unavailable-tool result. Also carries the non-blocking promotion-lag warning on `dev` pushes (see `docs/deployments.md` § Promotion-lag warning).
 3. **`bkit-tests-unit`** (`if: run_level != 'none'`) — unit-test lane: installs `zsh` and `actionlint` (same SHA-pinned download as the static lane, put on `PATH`) so the tests that skip without them run, then runs `pnpm test:coverage:unit`, then the bats shell tier (`pnpm bkit:test:bats` — the bkit-cloud-bootstrap gh preflight, the `gh` stub harness and the release-PR mirror script, logic vitest cannot reach because it lives in shell). The gate command itself lives in the `test:coverage:unit` **package.json script** — unit suite (`--exclude '**/*.integration.test.ts'`), `--coverage.include` scoped to the logic surface (the files its flags list plus every `.bkit/core/engine/commands/**/*.ts`; `install/modules/` is measured on the integration lane only), and `-c vitest.unit.config.ts`, which carries the branch-coverage floor `coverage.thresholds.branches` (currently `80`, set just below current and ratcheted up; it lives on the unit run only — vitest coverage is per-run, so a `vitest.config` block would gate both lanes). **Single source:** `/bkit-build`'s pre-PR gate runs the same script, so a coverage drop fails in the worktree before this lane sees it — bump the floor in `vitest.unit.config.ts` and both callers move together. The CI step only appends the JSON reporter emitting `tests_ran`. `Report Unit Coverage` (`davelosert/vitest-coverage-report-action`, `vite-config-path: vitest.unit.config.ts`) runs on every event, including a red unit run, and writes the coverage table with the floor as its target to the job summary; it posts a `name: unit` PR comment on same-repo PRs only (fork PRs get `comment-on: none`, because the token is read-only). The action reads that file as raw text and regex-matches `<metric>: <number>`, so the floor stays on one unquoted line and no other metric name followed by a colon and a number appears in the file — a broken match drops the target silently while the gate keeps passing. Needs the job-level `permissions:` block (`contents: read` and `pull-requests: write`) — job-level permissions replace the workflow-level block, so `contents: read` must be re-declared for the checkout. **`.bkit/core/engine/cli.ts` reads low on this gate on purpose** — `.bkit/core/engine/commands/install/install.integration.test.ts` spawns `tsx` dozens of times against its un-exported `main()` dispatch (real CLI process per scenario), which in-process v8 coverage cannot see; only the handful of pure decision functions pulled out of `main()` for direct unit testing (e.g. `validateModuleFlagsForVerb` in `cli.ts`, `validateCloudTrackerMatch` in `commands/install/install.ts`) register here. A low `cli.ts` % on this lane is a spawn-tested blind spot, not evidence of missing coverage: the integration lane's executed-count + the Consumer-runtime parity rule (below) are the CLI dispatch's real gate.
 4. **`bkit-tests-integration`** (`if: run_level != 'none'`) — integration-test lane (parallel sibling): installs `zsh` (the snippet tests skip without it), then `vitest run --coverage` over `*.integration.test.ts`, scoped via `--coverage.include` to the engine surface (`modules` / `install` / `upgrade` / `uninstall`), emitting its own `tests_ran`. **Report-only** (no threshold, because a whole-repo integration % is denominator-noise and punishes the pyramid shape); posts a `name: integration` coverage comment. A separate lane per tier — mirrors how consumer repos run it and dogfoods the shipped scaffold. Own job-level `permissions:`.
 5. **`bkit-tests-check`** (capstone, `if: !cancelled()`) — asserts `bkit-tests-scope` succeeded and, when `run_level != none`, `bkit-tests-static` and `bkit-tests-unit` and `bkit-tests-integration` all succeeded **and unit and integration each executed > 0 tests** (per-lane `assert_ran` over each lane's `tests_ran`; `run_level=none` asserts nothing). This is the sole branch-protection required check (`bkit setup protect-main`, which requires `bkit.testing.ciCapstone` = `bkit-tests-check`) — green here means the planned suite actually ran, not merely "nothing failed".
diff --git a/package.json b/package.json
index 0e6bc00ed..b5196ab75 100644
--- a/package.json
+++ b/package.json
@@ -86,7 +86,7 @@
     "test:coverage:unit": "node scripts/ci/bkit-test-awake.mjs vitest run -c vitest.unit.config.ts --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts' --coverage.include='.bkit/core/engine/{cli,commands/analysis,install/cloud-env,commands/comply,commands/install/install,commands/launch,install/manifest,install/managed-block,shared/package-roots,shared/protected-paths,checks/after/index,checks/after/auth,checks/after/ci-yml,checks/after/github,checks/after/managed,checks/after/tools,checks/after/suppression,checks/before/index,checks/before/context-fetch,checks/before/env,checks/before/files,checks/before/mcp,checks/before/repo,checks/before/version,ledgers/status,ledgers/telemetry,install/write,install/placeholders,install/template-copies,render/trackers,render/hosts,render/models,commands/install/uninstall,commands/install/upgrade,install/version-file,tools/instructions,tools/cli-doc}.ts' --coverage.include='.bkit/core/engine/commands/**/*.ts' --coverage.include='.bkit/core/engine/shared/{settings,package-json,package-manager,timeouts}.ts'",
     "bkit:test:bats": "node scripts/ci/bkit-test-awake.mjs --shell 'pnpm exec bats ${BKIT_TEST_REPORT_DIR:+--report-formatter junit --output \"$BKIT_TEST_REPORT_DIR\"} tests/shell/*.bats'",
     "build": "tsc && chmod +x dist/cli.js",
-    "bkit:check:dist": "rm -rf dist && tsc && chmod +x dist/cli.js && git diff --exit-code dist/ || (echo '[bkit] dist/ is stale — run pnpm build and commit the result' && exit 1)",
+    "bkit:check:dist": "node scripts/gate/bkit-check-dist.mjs",
     "bkit:graph": "bash scripts/graphify/bkit-graphify.sh build",
     "bkit:graph:check": "bash scripts/graphify/bkit-graphify.sh check",
     "bkit:graph:clean": "bash scripts/graphify/bkit-graphify.sh clean",
diff --git a/scripts/gate/bkit-check-dist.mjs b/scripts/gate/bkit-check-dist.mjs
new file mode 100644
index 000000000..9ae4e9d90
--- /dev/null
+++ b/scripts/gate/bkit-check-dist.mjs
@@ -0,0 +1,105 @@
+#!/usr/bin/env node
+// Checks the staged `dist/` against a compile of the staged tree (the index), never the working
+// tree. Exports the staged engine sources into `tmp/check-dist-*`, compiles them there and
+// compares each output's mode and blob hash with `git ls-files -s dist/`. Leaves the working
+// tree's `dist/` alone.
+
+import { spawnSync } from "node:child_process";
+import * as fs from "node:fs";
+import * as path from "node:path";
+
+const STALE = "[bkit] dist/ is stale — run pnpm build and commit the result";
+
+function git(args, options = {}) {
+  const result = spawnSync("git", args, {
+    encoding: "utf-8",
+    maxBuffer: 256 * 1024 * 1024,
+    ...options,
+  });
+  if (result.status !== 0) {
+    throw new Error(`git ${args.join(" ")}: ${result.stderr}`);
+  }
+  return result.stdout;
+}
+
+function walk(root, rel = "") {
+  const files = [];
+  for (const entry of fs.readdirSync(path.join(root, rel), { withFileTypes: true })) {
+    const next = rel ? `${rel}/${entry.name}` : entry.name;
+    if (entry.isDirectory()) files.push(...walk(root, next));
+    else files.push(next);
+  }
+  return files;
+}
+
+function run() {
+  const repo = git(["rev-parse", "--show-toplevel"]).trim();
+  const tmpRoot = path.join(repo, "tmp");
+  fs.mkdirSync(tmpRoot, { recursive: true });
+  const scratch = fs.mkdtempSync(path.join(tmpRoot, "check-dist-"));
+  try {
+    const staged = git(
+      ["ls-files", "-z", "--", ".bkit/core/engine", "tsconfig.json", "package.json"],
+      { cwd: repo },
+    )
+      .split("\0")
+      .filter(Boolean);
+    const exported = spawnSync("git", ["checkout-index", "-z", "--stdin", `--prefix=${scratch}/`], {
+      cwd: repo,
+      input: staged.join("\0") + "\0",
+      encoding: "utf-8",
+    });
+    if (exported.status !== 0) {
+      console.error(exported.stderr);
+      return 1;
+    }
+    fs.symlinkSync(path.join(repo, "node_modules"), path.join(scratch, "node_modules"));
+
+    const tsc = spawnSync(path.join(scratch, "node_modules/.bin/tsc"), [], {
+      cwd: scratch,
+      encoding: "utf-8",
+    });
+    if (tsc.status !== 0) {
+      process.stderr.write(`${tsc.stdout}${tsc.stderr}`);
+      return 1;
+    }
+    const cli = path.join(scratch, "dist/cli.js");
+    if (fs.existsSync(cli)) fs.chmodSync(cli, 0o755);
+
+    const expected = new Map();
+    for (const line of git(["ls-files", "-s", "-z", "--", "dist/"], { cwd: repo })
+      .split("\0")
+      .filter(Boolean)) {
+      const [meta, file] = line.split("\t");
+      const [mode, hash] = meta.split(" ");
+      expected.set(file, `${mode} ${hash}`);
+    }
+
+    const actual = new Map();
+    const distRoot = path.join(scratch, "dist");
+    for (const rel of fs.existsSync(distRoot) ? walk(distRoot) : []) {
+      const abs = path.join(distRoot, rel);
+      const mode = fs.statSync(abs).mode & 0o111 ? "100755" : "100644";
+      actual.set(`dist/${rel}`, `${mode} ${git(["hash-object", abs]).trim()}`);
+    }
+
+    let stale = expected.size !== actual.size;
+    for (const [file, value] of actual) {
+      if (expected.get(file) !== value) stale = true;
+    }
+    if (stale) {
+      console.error(STALE);
+      return 1;
+    }
+    return 0;
+  } finally {
+    fs.rmSync(scratch, { recursive: true, force: true });
+  }
+}
+
+try {
+  process.exitCode = run();
+} catch (error) {
+  console.error(error instanceof Error ? error.message : String(error));
+  process.exitCode = 1;
+}
