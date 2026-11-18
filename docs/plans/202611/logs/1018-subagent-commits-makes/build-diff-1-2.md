diff --git a/.bkit/cli.md b/.bkit/cli.md
index 58378f773..1bd84666a 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -89,7 +89,7 @@ Sync, push, land and rebase branches; stamp and read a doc's base-commit anchor.
 | `regenerate` | workflow | `--fid` `--attempt` `--file` | Run a declared bkit:generate on the feature branch and commit only the paths it changed (ship Step 10's fix round). |
 | `push` | workflow | **`--mode`** `--set-upstream` `--ahead-of` `--commit` `--label` `--file` `--workflow` `--require-ci` `--open-pr` `--fid` | Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise; when the pre-push hook's lock status file says so, 81 tests lock held, 4 tests lock refused the run or stopped it at the hold limit. |
 | `fast-forward` | workflow | **`--onto`** | Fetch a remote branch and fast-forward the checkout onto it; refuse when diverged. |
-| `scan-diff` | by hand | `--base` `--paths` `--marker` `--code` `--disabled-tests` `--expect-none` | Exit 0 when the branch's diff from --base matches (paths, an added marker line, a source change, or a disabled test); 1 when not — --disabled-tests turns that round: 1 when a test was disabled or lost an assertion, 0 when none was. |
+| `scan-diff` | by hand | `--base` `--since-step` `--file` `--paths` `--marker` `--code` `--disabled-tests` `--expect-none` | Exit 0 when the branch's diff from --base matches (paths, an added marker line, a source change, or a disabled test); 1 when not — --disabled-tests turns that round: 1 when a test was disabled or lost an assertion, 0 when none was. |
 | `force-build` | workflow | **`--fid`** **`--file`** **`--workflow`** `--label` `--open-pr` `--title-set` | Force a full CI build: put [force build] on the open PR's title, then push an empty marker commit (once per run). |
 | `rebase` | workflow | `--log-file` `--sentinel` `--file` | Drive a rebase to completion, auto-resolving ledger (union), lockfile (regenerate), generated-register (take the target's copy, rebuild after), embedded generated-block (take the target's block, merge the rest, rebuild after) and install-record (merge entry by entry, the target's value where both changed) conflicts; refuse and abort on anything else. |
 | `sync-dev` | workflow | — | After a merge, fast-forward local dev to origin/dev without checking it out or pushing; frozen install when the main checkout is on dev and moved. |
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 1d9dfdfad..404ab117d 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -89,7 +89,7 @@ Sync, push, land and rebase branches; stamp and read a doc's base-commit anchor.
 | `regenerate` | workflow | `--fid` `--attempt` `--file` | Run a declared bkit:generate on the feature branch and commit only the paths it changed (ship Step 10's fix round). |
 | `push` | workflow | **`--mode`** `--set-upstream` `--ahead-of` `--commit` `--label` `--file` `--workflow` `--require-ci` `--open-pr` `--fid` | Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise; when the pre-push hook's lock status file says so, 81 tests lock held, 4 tests lock refused the run or stopped it at the hold limit. |
 | `fast-forward` | workflow | **`--onto`** | Fetch a remote branch and fast-forward the checkout onto it; refuse when diverged. |
-| `scan-diff` | by hand | `--base` `--paths` `--marker` `--code` `--disabled-tests` `--expect-none` | Exit 0 when the branch's diff from --base matches (paths, an added marker line, a source change, or a disabled test); 1 when not — --disabled-tests turns that round: 1 when a test was disabled or lost an assertion, 0 when none was. |
+| `scan-diff` | by hand | `--base` `--since-step` `--file` `--paths` `--marker` `--code` `--disabled-tests` `--expect-none` | Exit 0 when the branch's diff from --base matches (paths, an added marker line, a source change, or a disabled test); 1 when not — --disabled-tests turns that round: 1 when a test was disabled or lost an assertion, 0 when none was. |
 | `force-build` | workflow | **`--fid`** **`--file`** **`--workflow`** `--label` `--open-pr` `--title-set` | Force a full CI build: put [force build] on the open PR's title, then push an empty marker commit (once per run). |
 | `rebase` | workflow | `--log-file` `--sentinel` `--file` | Drive a rebase to completion, auto-resolving ledger (union), lockfile (regenerate), generated-register (take the target's copy, rebuild after), embedded generated-block (take the target's block, merge the rest, rebuild after) and install-record (merge entry by entry, the target's value where both changed) conflicts; refuse and abort on anything else. |
 | `sync-dev` | workflow | — | After a merge, fast-forward local dev to origin/dev without checking it out or pushing; frozen install when the main checkout is on dev and moved. |
diff --git a/.bkit/core/engine/commands/conventions.test.ts b/.bkit/core/engine/commands/conventions.test.ts
index 3274c5acf..cad83417d 100644
--- a/.bkit/core/engine/commands/conventions.test.ts
+++ b/.bkit/core/engine/commands/conventions.test.ts
@@ -178,6 +178,8 @@ const HELPER_SOURCES = new Set([
   path.join("commands", "workflow", "open-decision.ts"),
   // The `tests changed` verb, registered on `bkit tests` in tests.ts.
   path.join("commands", "workflow", "tests-changed.ts"),
+  // The last step-done commit of a run, read by `tests changed` and `branches scan-diff`.
+  path.join("commands", "workflow", "step-base.ts"),
   // The `tests jump` verb, registered on `bkit tests` in tests.ts.
   path.join("commands", "workflow", "tests-jump.ts"),
   // The `tests base` verb, registered on `bkit tests` in tests.ts.
diff --git a/.bkit/core/engine/commands/workflow/branches.test.ts b/.bkit/core/engine/commands/workflow/branches.test.ts
index 0409dcd00..a96515222 100644
--- a/.bkit/core/engine/commands/workflow/branches.test.ts
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -4353,3 +4353,80 @@ describe("branches regenerate", { timeout: GIT_TIMEOUT }, () => {
     expect((await run(clone, ["regenerate"])).code).toBe(2);
   });
 });
+
+describe("branches scan-diff --since-step", { timeout: GIT_TIMEOUT }, () => {
+  const STEP = "build-plan-gaps-remediate";
+  const REL = "docs/plans/202611/logs/1-x/status.jsonl";
+  const row = (r: Record<string, unknown>) => `${JSON.stringify(r)}\n`;
+  /** A feature branch whose run has started and finished one earlier step; returns the run file. */
+  function runWithEarlierStep(name: string) {
+    const { clone } = featureBranch(name);
+    commit(
+      clone,
+      { [REL]: row({ type: "workflow-started", workflow: "build", at: "2026-11-01T10:00:00Z" }) },
+      "run start",
+    );
+    commit(
+      clone,
+      {
+        [REL]: row({
+          type: "step-done",
+          workflow: "build",
+          step: "build-plan-gaps",
+          status: "DONE",
+          at: "2026-11-01T10:05:00Z",
+          parentSha: sha(clone),
+          artifacts: [],
+        }),
+      },
+      "earlier step",
+    );
+    return { clone, file: path.join(clone, REL) };
+  }
+  /** What `steps finish` does: append the step's row, then commit it with whatever is in the tree. */
+  const finish = (clone: string) =>
+    commit(
+      clone,
+      {
+        [REL]: row({
+          type: "step-done",
+          workflow: "build",
+          step: STEP,
+          status: "DONE",
+          at: "2026-11-01T10:10:00Z",
+          parentSha: sha(clone),
+          artifacts: [],
+        }),
+      },
+      "step finish",
+    );
+  const scan = (clone: string, file: string) =>
+    run(clone, ["scan-diff", `--since-step=${STEP}`, "--code", `--file=${file}`]);
+
+  it("scan-diff --since-step --code exits 0 when the subagent committed its fix before steps finish", async () => {
+    const { clone, file } = runWithEarlierStep("since-committed");
+    commit(clone, { "src/fix.ts": "fix\n" }, "subagent fix");
+    finish(clone);
+    const r = await scan(clone, file);
+    expect(r.code).toBe(0);
+    expect(r.json).toEqual({ found: true, paths: ["src/fix.ts"] });
+  });
+
+  it("scan-diff --since-step --code exits 0 when the fix was left uncommitted and the finish commit holds it", async () => {
+    const { clone, file } = runWithEarlierStep("since-uncommitted");
+    write(clone, "src/fix.ts", "fix\n");
+    finish(clone);
+    const r = await scan(clone, file);
+    expect(r.code).toBe(0);
+    expect(r.json).toEqual({ found: true, paths: ["src/fix.ts"] });
+  });
+
+  it("scan-diff --since-step --code exits 1 when the step changed only logs", async () => {
+    const { clone, file } = runWithEarlierStep("since-logs");
+    commit(clone, { "docs/plans/202611/logs/1-x/note.md": "note\n" }, "subagent logs");
+    finish(clone);
+    const r = await scan(clone, file);
+    expect(r.code).toBe(1);
+    expect(r.json).toEqual({ found: false, paths: [] });
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/branches.ts b/.bkit/core/engine/commands/workflow/branches.ts
index e66a4865a..7f99c62e4 100644
--- a/.bkit/core/engine/commands/workflow/branches.ts
+++ b/.bkit/core/engine/commands/workflow/branches.ts
@@ -76,6 +76,7 @@ import { AUTO_LABEL, AUTO_ROUTE_SUFFIX } from "./issues.js";
 import { appendFeature } from "./roadmap.js";
 import { detect } from "./runtime.js";
 import { defaultRange } from "./feature-base.js";
+import { stepBase } from "./step-base.js";
 import { readRuns, readStatusRows, readStatusRowsAt } from "./status.js";
 import { declaredName, testSource } from "./test-blocks.js";
 import {
@@ -1687,10 +1688,22 @@ function scanDiffVerb(ctx: RunContext): number {
       return EXIT.USAGE;
     }
   }
+  const sinceStep = str(ctx.flags.sinceStep);
+  if (sinceStep !== undefined && explicitBase !== undefined)
+    throw new CommandError(EXIT.USAGE, "--since-step and --base are exclusive");
   const top = topLevel(ctx.cwd);
-  const fallback = explicitBase === undefined ? defaultRange(top, ctx.log) : null;
-  const base = explicitBase ?? fallback!.base;
-  const fetched = explicitBase === undefined ? null : fetchRemoteRef(top, base);
+  let stepStart: string | null = null;
+  if (sinceStep !== undefined) {
+    stepStart = stepBase({ cwd: ctx.cwd, step: sinceStep, file: str(ctx.flags.file) });
+    if (stepStart === null) {
+      ctx.log(`--since-step ${sinceStep}: no active run or no commit to measure from`);
+      return EXIT_DIFF_FAILED;
+    }
+  }
+  const rangeBase = explicitBase ?? stepStart ?? undefined;
+  const fallback = rangeBase === undefined ? defaultRange(top, ctx.log) : null;
+  const base = rangeBase ?? fallback!.base;
+  const fetched = rangeBase === undefined || stepStart !== null ? null : fetchRemoteRef(top, base);
   if (fetched !== null && !fetched.ok) {
     ctx.log(`git fetch for ${base} failed: ${fetched.stderr} — diffing against the local ref`);
   }
@@ -3709,6 +3722,16 @@ export const branchesCommand: CommandSpec = {
           type: "string",
           help: "diff <base>...HEAD; an origin/<branch> base is fetched first (default: the feature base, where the branch's own work starts)",
         },
+        {
+          name: "since-step",
+          type: "string",
+          help: "diff from the commit before this step's own work (the previous step-done row's commit of the active run), so a fix committed by the subagent or by `steps finish` both count; exclusive with --base",
+        },
+        {
+          name: "file",
+          type: "string",
+          help: "the run's status.jsonl, for --since-step (default: the single in-progress run)",
+        },
         {
           name: "paths",
           type: "string",
diff --git a/.bkit/core/engine/commands/workflow/step-base.test.ts b/.bkit/core/engine/commands/workflow/step-base.test.ts
new file mode 100644
index 000000000..12c1ab4dc
--- /dev/null
+++ b/.bkit/core/engine/commands/workflow/step-base.test.ts
@@ -0,0 +1,98 @@
+import { spawnSync } from "node:child_process";
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+
+import { afterEach, describe, expect, it } from "vitest";
+
+import { stepBase } from "./step-base";
+
+const dirs: string[] = [];
+const tmp = (prefix: string) => {
+  const d = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), prefix)));
+  dirs.push(d);
+  return d;
+};
+afterEach(() => {
+  for (const d of dirs.splice(0)) fs.rmSync(d, { recursive: true, force: true });
+});
+
+const GIT_ENV = {
+  ...process.env,
+  GIT_AUTHOR_NAME: "t",
+  GIT_AUTHOR_EMAIL: "t@t",
+  GIT_COMMITTER_NAME: "t",
+  GIT_COMMITTER_EMAIL: "t@t",
+};
+const STATUS_REL = "docs/plans/202611/logs/1-x/status.jsonl";
+
+let cwd: string;
+const git = (...args: string[]) =>
+  spawnSync("git", ["-C", cwd, ...args], { encoding: "utf-8", env: GIT_ENV }).stdout.trim();
+const commit = (message: string) => {
+  git("add", "-A");
+  git("commit", "-q", "-m", message);
+  return git("rev-parse", "HEAD");
+};
+const appendRow = (row: Record<string, unknown>) => {
+  const file = path.join(cwd, STATUS_REL);
+  fs.mkdirSync(path.dirname(file), { recursive: true });
+  fs.appendFileSync(file, `${JSON.stringify(row)}\n`);
+};
+const started = (at: string) => ({ type: "workflow-started", workflow: "build", at });
+const done = (step: string, at: string, parentSha: string) => ({
+  type: "step-done",
+  workflow: "build",
+  step,
+  status: "DONE",
+  at,
+  parentSha,
+  artifacts: [],
+});
+
+/** A committed repo with no run at all. */
+function repo() {
+  cwd = tmp("bkit-step-base-");
+  git("init", "-q");
+  fs.writeFileSync(path.join(cwd, "README.md"), "x\n");
+  return commit("base");
+}
+
+describe("stepBase", () => {
+  it("returns the commit that holds the last step-done row", () => {
+    const c0 = repo();
+    appendRow(started("2026-11-01T10:00:00Z"));
+    const c1 = commit("run start");
+    appendRow(done("build-plan-a", "2026-11-01T10:05:00Z", c1));
+    const c2 = commit("step a");
+    appendRow(done("build-plan-b", "2026-11-01T10:10:00Z", c2));
+    const c3 = commit("step b");
+    fs.writeFileSync(path.join(cwd, "later.ts"), "later\n");
+    commit("subagent work after the last step");
+    expect(new Set([c0, c1, c2, c3]).size).toBe(4);
+    expect(stepBase({ cwd })).toBe(c3);
+  });
+
+  it("with a step name returns the commit of the row before that step's latest row", () => {
+    const c0 = repo();
+    appendRow(started("2026-11-01T10:00:00Z"));
+    const c1 = commit("run start");
+    appendRow(done("build-plan-a", "2026-11-01T10:05:00Z", c1));
+    const c2 = commit("step a");
+    appendRow(done("build-plan-b", "2026-11-01T10:10:00Z", c2));
+    const c3 = commit("step b");
+    expect(new Set([c0, c1, c2, c3]).size).toBe(4);
+    expect(stepBase({ cwd, step: "build-plan-b" })).toBe(c2);
+    expect(stepBase({ cwd, step: "build-plan-a" })).toBe(c1);
+  });
+
+  it("falls back to the run start commit, and null with no run", () => {
+    repo();
+    expect(stepBase({ cwd })).toBeNull();
+    appendRow(started("2026-11-01T10:00:00Z"));
+    const c1 = commit("run start");
+    fs.writeFileSync(path.join(cwd, "later.ts"), "later\n");
+    commit("work before any step is done");
+    expect(stepBase({ cwd })).toBe(c1);
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/step-base.ts b/.bkit/core/engine/commands/workflow/step-base.ts
new file mode 100644
index 000000000..89ade5303
--- /dev/null
+++ b/.bkit/core/engine/commands/workflow/step-base.ts
@@ -0,0 +1,57 @@
+// commands/workflow/step-base.ts — the commit a run's last step began after.
+//
+// A subagent may commit its edits or leave them uncommitted. A check that measures from
+// HEAD or HEAD~1 answers differently in the two cases; one that measures from the commit
+// holding the previous `step-done` row answers the same. Imports neither tests-changed.ts
+// nor branches.ts, so both can import it.
+
+import * as path from "node:path";
+
+import { git, resolveActiveRun } from "../lib.js";
+import { readStatusRows } from "./status.js";
+
+/** The earliest commit that adds a row stamped `at` to `file`; null when none does. */
+function commitOfRow(file: string, at: unknown): string | null {
+  if (typeof at !== "string" || at === "") return null;
+  const out = git(path.dirname(file), [
+    "log",
+    "--reverse",
+    "--format=%H",
+    `-S${at}`,
+    "--",
+    path.basename(file),
+  ]);
+  const first = out?.split("\n").find((l) => l !== "");
+  return first === undefined ? null : first;
+}
+
+/**
+ * The commit the active run's current step began after: the commit that holds the last
+ * `step-done` row (found by the row's `at` in the status file's history, else the row's
+ * `parentSha`). With `step`, the commit of the `step-done` row before that step's latest
+ * row (a step with no row yet counts the whole run). No `step-done` row → the commit that
+ * holds the run's `workflow-started` row. Null with no active run or no such commit.
+ */
+export function stepBase(opts: { cwd: string; step?: string; file?: string }): string | null {
+  const run = resolveActiveRun({ cwd: opts.cwd, file: opts.file });
+  if (run === undefined) return null;
+  const rows = readStatusRows(run.file);
+  let start = -1;
+  rows.forEach((r, i) => {
+    if (r.type === "workflow-started" && r.workflow === run.workflow) start = i;
+  });
+  const inRun = rows.slice(start + 1).filter((r) => r.workflow === run.workflow);
+  let done = inRun.filter((r) => r.type === "step-done");
+  if (opts.step !== undefined) {
+    const at = done.map((r) => r.step).lastIndexOf(opts.step);
+    if (at >= 0) done = done.slice(0, at);
+  }
+  const prior = done.at(-1);
+  if (prior !== undefined) {
+    const found = commitOfRow(run.file, prior.at);
+    if (found !== null) return found;
+    if (typeof prior.parentSha === "string" && prior.parentSha !== "") return prior.parentSha;
+  }
+  const started = start >= 0 ? rows[start] : undefined;
+  return started === undefined ? null : commitOfRow(run.file, started.at);
+}
diff --git a/.bkit/core/engine/commands/workflow/tests-changed.test.ts b/.bkit/core/engine/commands/workflow/tests-changed.test.ts
index 8bc1f5a6e..2f68921ec 100644
--- a/.bkit/core/engine/commands/workflow/tests-changed.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests-changed.test.ts
@@ -403,3 +403,56 @@ describe("tests changed", () => {
     expect(ranWith()).toBeNull();
   });
 });
+
+describe("tests changed default base", () => {
+  const STATUS_REL = "docs/plans/202611/logs/1-x/status.jsonl";
+  const appendRow = (row: Record<string, unknown>) => {
+    const file = path.join(cwd, STATUS_REL);
+    fs.mkdirSync(path.dirname(file), { recursive: true });
+    fs.appendFileSync(file, `${JSON.stringify(row)}\n`);
+  };
+  /**
+   * A run in flight: its start row in one commit, then a previous step that committed
+   * `src/prev.ts` together with its `step-done` row. Returns nothing; HEAD is that commit.
+   */
+  function runWithPreviousStep() {
+    checkout({ [BKIT_GATE_CHANGED_SCRIPT]: "x" });
+    appendRow({ type: "workflow-started", workflow: "build", at: "2026-11-01T10:00:00Z" });
+    const start = commit("run start");
+    write("src/prev.ts", "prev\n");
+    appendRow({
+      type: "step-done",
+      workflow: "build",
+      step: "build-plan-prev",
+      status: "DONE",
+      at: "2026-11-01T10:05:00Z",
+      parentSha: start,
+      artifacts: [],
+    });
+    commit("previous step");
+  }
+
+  it("lists a file the subagent committed after the last step-done commit", async () => {
+    runWithPreviousStep();
+    write("src/a.ts", "subagent edit\n");
+    commit("subagent commit");
+    const r = await changed([]);
+    expect(r.json?.files).toEqual(["src/a.ts"]);
+  });
+
+  it("lists the same file when it is left uncommitted", async () => {
+    runWithPreviousStep();
+    write("src/a.ts", "subagent edit\n");
+    const r = await changed([]);
+    expect(r.json?.files).toEqual(["src/a.ts"]);
+  });
+
+  it("leaves out a file only the previous step's own commit touched", async () => {
+    runWithPreviousStep();
+    write("src/a.ts", "subagent edit\n");
+    commit("subagent commit");
+    const r = await changed([]);
+    expect(r.json?.files).not.toContain("src/prev.ts");
+    expect(r.json?.files).toEqual(["src/a.ts"]);
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/tests-changed.ts b/.bkit/core/engine/commands/workflow/tests-changed.ts
index e82fc7968..8f09ef744 100644
--- a/.bkit/core/engine/commands/workflow/tests-changed.ts
+++ b/.bkit/core/engine/commands/workflow/tests-changed.ts
@@ -14,6 +14,7 @@ import { CommandError, EXIT, git, runGit, wholeNumber, type VerbSpec } from "../
 import { readPackageJson } from "../../shared/package-json.js";
 import { COULD_NOT_RUN_EXIT_CODES, scriptCommand } from "../../shared/package-manager.js";
 import { runGateUnderLock } from "./junit.js";
+import { stepBase } from "./step-base.js";
 
 /** Exit code: neither `bkit:gate:changed` nor the --fallback gate is declared. */
 const EXIT_NO_GATE = 3;
@@ -170,7 +171,7 @@ export const testsChangedVerb: VerbSpec = {
     {
       name: "base",
       type: "string",
-      help: "commit the step began on; files committed after it count as changed (default HEAD: uncommitted files only)",
+      help: "commit the step began after; files committed after it count as changed (default: the commit holding the active run's last step-done row, else HEAD)",
     },
     {
       name: "fallback",
@@ -200,7 +201,13 @@ export const testsChangedVerb: VerbSpec = {
       60,
     );
     const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
-    const base = typeof ctx.flags.base === "string" ? ctx.flags.base : "HEAD";
+    let base: string;
+    if (typeof ctx.flags.base === "string") base = ctx.flags.base;
+    else {
+      const fromRun = stepBase({ cwd: top });
+      if (fromRun === null) ctx.log("no active run with a step-done row — measuring from HEAD");
+      base = fromRun ?? "HEAD";
+    }
     if (git(top, ["rev-parse", "-q", "--verify", `${base}^{commit}`]) === null)
       throw new CommandError(EXIT.USAGE, `--base ${base} names no commit`);
     const fallback = typeof ctx.flags.fallback === "string" ? ctx.flags.fallback : undefined;
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 4fdaa6e85..a59614967 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -9725,11 +9725,11 @@ A single-file mechanical utility that compresses prose in one supplied target. I
 ### plan-task-ticking-owned-by-verify
 
 - behavior: **Plan task ticking owned by verify**
-- agents: `bkit-build-plan-tasks` (ticks only applicable Pre-Flight and gate boxes), `bkit-build-plan-verify` (ticks task boxes `[ ]`→`[x]` only on verified codebase artifact)
+- agents: `bkit-build-plan-tasks` (ticks no box), `bkit-build-plan-verify` (ticks task boxes `[ ]`→`[x]` only on verified codebase artifact)
 - source: `.bkit/core/.bkit/prompts.md` § Special Behaviors (frontmatter-adjacent contracts)
 
 ```text
-Task checkboxes are verify's derived view of the codebase. The executor's durable progress record is its flat append-only log of `DONE —` lines, which keeps resume safe and keeps per-task `Edit` ticks out of its turn budget. Execute ticks each applicable Pre-Flight and gate box as that gate passes and continues without asking; it never ticks a task box or a human-confirmation box.
+Task checkboxes are verify's derived view of the codebase. The executor's durable progress record is its flat append-only log of `DONE —` lines, which keeps resume safe and keeps per-task `Edit` ticks out of its turn budget. Execute ticks no box in the plan.
 ```
 
 ### flat-append-only-log-for-source-modifiers
diff --git a/.bkit/version b/.bkit/version
index 87f591c0f..13d416a9f 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -254,7 +254,7 @@
     ".codex/hooks/bkit-rules.cjs": "65d998bd5f0299d1eaf33cd18110894f3c4cb95998698c9ccbfc63baec796df8",
     ".opencode/plugin/bkit-rules.js": "02bc8a76a4d1ec4f3fd23f299047270914c72662570964fa22894a7e0e0b04e8",
     ".bkit/router.md": "77538e88a48383850f5ebe0835bc4b80d3b33117c7fa72e49b98faba079d2ef5",
-    ".bkit/cli.md": "f506e1a2a429346a18e8c10ddd1bb35457bf2b3737ac398b0b6b1ebc3caf2254",
+    ".bkit/cli.md": "5b4e078089ffd669da8e37dad628d71b780440b5a290223a50782451ca4d057d",
     ".claude/agents/bkit-build-plan-tests.md": "e4c22cfb4973eb332139aaa698924f3fc39d938b2fdbe45b848881b9c1699434",
     ".cursor/agents/bkit-build-plan-tests.md": "c1f77dee3a5bfdcf3df077b7ddeb2a6f393ec518c884e99a8db3c177b5549dba",
     ".opencode/agents/bkit-build-plan-tests.md": "de624000ba6c0f9c5b55c498f0680ccf8bff9950b9511b44c3d85171e0309b7b",
diff --git a/DETAILS.md b/DETAILS.md
index 35098bdf1..511d0f557 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -347,7 +347,7 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>265 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1955 symbols · 57 files"]
+    n_bkit_core_engine_commands["commands<br/>1958 symbols · 58 files"]
     n_bkit_core_engine_install["install<br/>366 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>240 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
diff --git a/dist/commands/workflow/branches.js b/dist/commands/workflow/branches.js
index 938ee97ed..ee81a7330 100644
--- a/dist/commands/workflow/branches.js
+++ b/dist/commands/workflow/branches.js
@@ -31,6 +31,7 @@ import { AUTO_LABEL, AUTO_ROUTE_SUFFIX } from "./issues.js";
 import { appendFeature } from "./roadmap.js";
 import { detect } from "./runtime.js";
 import { defaultRange } from "./feature-base.js";
+import { stepBase } from "./step-base.js";
 import { readRuns, readStatusRows, readStatusRowsAt } from "./status.js";
 import { declaredName, testSource } from "./test-blocks.js";
 import { addAllButCopied, assertShipEligible, copyExcludes, hasLeftovers, notOnDev, rebaseNoteFile, recordRebase, removeWorktree, worktreeDir, } from "./worktrees.js";
@@ -1388,10 +1389,22 @@ function scanDiffVerb(ctx) {
             return EXIT.USAGE;
         }
     }
+    const sinceStep = str(ctx.flags.sinceStep);
+    if (sinceStep !== undefined && explicitBase !== undefined)
+        throw new CommandError(EXIT.USAGE, "--since-step and --base are exclusive");
     const top = topLevel(ctx.cwd);
-    const fallback = explicitBase === undefined ? defaultRange(top, ctx.log) : null;
-    const base = explicitBase ?? fallback.base;
-    const fetched = explicitBase === undefined ? null : fetchRemoteRef(top, base);
+    let stepStart = null;
+    if (sinceStep !== undefined) {
+        stepStart = stepBase({ cwd: ctx.cwd, step: sinceStep, file: str(ctx.flags.file) });
+        if (stepStart === null) {
+            ctx.log(`--since-step ${sinceStep}: no active run or no commit to measure from`);
+            return EXIT_DIFF_FAILED;
+        }
+    }
+    const rangeBase = explicitBase ?? stepStart ?? undefined;
+    const fallback = rangeBase === undefined ? defaultRange(top, ctx.log) : null;
+    const base = rangeBase ?? fallback.base;
+    const fetched = rangeBase === undefined || stepStart !== null ? null : fetchRemoteRef(top, base);
     if (fetched !== null && !fetched.ok) {
         ctx.log(`git fetch for ${base} failed: ${fetched.stderr} — diffing against the local ref`);
     }
@@ -3073,6 +3086,16 @@ export const branchesCommand = {
                     type: "string",
                     help: "diff <base>...HEAD; an origin/<branch> base is fetched first (default: the feature base, where the branch's own work starts)",
                 },
+                {
+                    name: "since-step",
+                    type: "string",
+                    help: "diff from the commit before this step's own work (the previous step-done row's commit of the active run), so a fix committed by the subagent or by `steps finish` both count; exclusive with --base",
+                },
+                {
+                    name: "file",
+                    type: "string",
+                    help: "the run's status.jsonl, for --since-step (default: the single in-progress run)",
+                },
                 {
                     name: "paths",
                     type: "string",
diff --git a/dist/commands/workflow/step-base.js b/dist/commands/workflow/step-base.js
new file mode 100644
index 000000000..e6f4a3f6f
--- /dev/null
+++ b/dist/commands/workflow/step-base.js
@@ -0,0 +1,59 @@
+// commands/workflow/step-base.ts — the commit a run's last step began after.
+//
+// A subagent may commit its edits or leave them uncommitted. A check that measures from
+// HEAD or HEAD~1 answers differently in the two cases; one that measures from the commit
+// holding the previous `step-done` row answers the same. Imports neither tests-changed.ts
+// nor branches.ts, so both can import it.
+import * as path from "node:path";
+import { git, resolveActiveRun } from "../lib.js";
+import { readStatusRows } from "./status.js";
+/** The earliest commit that adds a row stamped `at` to `file`; null when none does. */
+function commitOfRow(file, at) {
+    if (typeof at !== "string" || at === "")
+        return null;
+    const out = git(path.dirname(file), [
+        "log",
+        "--reverse",
+        "--format=%H",
+        `-S${at}`,
+        "--",
+        path.basename(file),
+    ]);
+    const first = out?.split("\n").find((l) => l !== "");
+    return first === undefined ? null : first;
+}
+/**
+ * The commit the active run's current step began after: the commit that holds the last
+ * `step-done` row (found by the row's `at` in the status file's history, else the row's
+ * `parentSha`). With `step`, the commit of the `step-done` row before that step's latest
+ * row (a step with no row yet counts the whole run). No `step-done` row → the commit that
+ * holds the run's `workflow-started` row. Null with no active run or no such commit.
+ */
+export function stepBase(opts) {
+    const run = resolveActiveRun({ cwd: opts.cwd, file: opts.file });
+    if (run === undefined)
+        return null;
+    const rows = readStatusRows(run.file);
+    let start = -1;
+    rows.forEach((r, i) => {
+        if (r.type === "workflow-started" && r.workflow === run.workflow)
+            start = i;
+    });
+    const inRun = rows.slice(start + 1).filter((r) => r.workflow === run.workflow);
+    let done = inRun.filter((r) => r.type === "step-done");
+    if (opts.step !== undefined) {
+        const at = done.map((r) => r.step).lastIndexOf(opts.step);
+        if (at >= 0)
+            done = done.slice(0, at);
+    }
+    const prior = done.at(-1);
+    if (prior !== undefined) {
+        const found = commitOfRow(run.file, prior.at);
+        if (found !== null)
+            return found;
+        if (typeof prior.parentSha === "string" && prior.parentSha !== "")
+            return prior.parentSha;
+    }
+    const started = start >= 0 ? rows[start] : undefined;
+    return started === undefined ? null : commitOfRow(run.file, started.at);
+}
diff --git a/dist/commands/workflow/tests-changed.js b/dist/commands/workflow/tests-changed.js
index ba424022e..a7ebcf12f 100644
--- a/dist/commands/workflow/tests-changed.js
+++ b/dist/commands/workflow/tests-changed.js
@@ -12,6 +12,7 @@ import { CommandError, EXIT, git, runGit, wholeNumber } from "../lib.js";
 import { readPackageJson } from "../../shared/package-json.js";
 import { COULD_NOT_RUN_EXIT_CODES, scriptCommand } from "../../shared/package-manager.js";
 import { runGateUnderLock } from "./junit.js";
+import { stepBase } from "./step-base.js";
 /** Exit code: neither `bkit:gate:changed` nor the --fallback gate is declared. */
 const EXIT_NO_GATE = 3;
 /** Exit code: the gate could not run (exit 126 / 127, or the package runner is missing). */
@@ -153,7 +154,7 @@ export const testsChangedVerb = {
         {
             name: "base",
             type: "string",
-            help: "commit the step began on; files committed after it count as changed (default HEAD: uncommitted files only)",
+            help: "commit the step began after; files committed after it count as changed (default: the commit holding the active run's last step-done row, else HEAD)",
         },
         {
             name: "fallback",
@@ -179,7 +180,15 @@ export const testsChangedVerb = {
             ? "lock-wait-s (BKIT_LOCK_WAIT_S)"
             : "lock-wait-s", 60);
         const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
-        const base = typeof ctx.flags.base === "string" ? ctx.flags.base : "HEAD";
+        let base;
+        if (typeof ctx.flags.base === "string")
+            base = ctx.flags.base;
+        else {
+            const fromRun = stepBase({ cwd: top });
+            if (fromRun === null)
+                ctx.log("no active run with a step-done row — measuring from HEAD");
+            base = fromRun ?? "HEAD";
+        }
         if (git(top, ["rev-parse", "-q", "--verify", `${base}^{commit}`]) === null)
             throw new CommandError(EXIT.USAGE, `--base ${base} names no commit`);
         const fallback = typeof ctx.flags.fallback === "string" ? ctx.flags.fallback : undefined;
diff --git a/docs/capabilities.md b/docs/capabilities.md
index c74b2e76d..8520595c7 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -89,16 +89,16 @@ Not scanned; run the rollup with `--reachability`.
 
 ## Import-time side effects
 
-15 module-scope side effects in 6 of 126 source files. A call here runs on **import**, not on first use, so every file downstream pays for it, and a test that never touches the thing still has to stub it. Sorted by reach.
+15 module-scope side effects in 6 of 127 source files. A call here runs on **import**, not on first use, so every file downstream pays for it, and a test that never touches the thing still has to stub it. Sorted by reach.
 
 <!-- prettier-ignore -->
 | File | Evaluates at import | Downstream files | of which tests |
 | --- | --- | --- | --- |
-| `.bkit/core/engine/shared/text.ts` | `Symbol` | 214 | 129 |
-| `.bkit/core/engine/checks/after/ci-yml.ts` | `CI_SCRIPT_UNITS.flat` | 195 | 118 |
-| `.bkit/core/engine/checks/tips/index.ts` | `STAR_TIP.replace` | 195 | 118 |
-| `.bkit/core/engine/commands/workflow/branches.ts` | `LEDGERS.map` | 195 | 118 |
-| `.bkit/core/engine/commands/workflow/workflows.ts` | `Error` | 195 | 118 |
+| `.bkit/core/engine/shared/text.ts` | `Symbol` | 216 | 130 |
+| `.bkit/core/engine/checks/after/ci-yml.ts` | `CI_SCRIPT_UNITS.flat` | 197 | 119 |
+| `.bkit/core/engine/checks/tips/index.ts` | `STAR_TIP.replace` | 197 | 119 |
+| `.bkit/core/engine/commands/workflow/branches.ts` | `LEDGERS.map` | 197 | 119 |
+| `.bkit/core/engine/commands/workflow/workflows.ts` | `Error` | 197 | 119 |
 
 1 further file nothing imports, though an entrypoint is supposed to do work when it loads. In the JSON report only.
 
@@ -126,7 +126,7 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>265 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1955 symbols · 57 files"]
+    n_bkit_core_engine_commands["commands<br/>1958 symbols · 58 files"]
     n_bkit_core_engine_install["install<br/>366 symbols · 21 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>240 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
