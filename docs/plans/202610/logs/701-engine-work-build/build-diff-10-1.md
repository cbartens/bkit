diff --git a/.bkit/core/engine/commands/workflow/ledgers.test.ts b/.bkit/core/engine/commands/workflow/ledgers.test.ts
index 1e74c62aa..855a0c235 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.test.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.test.ts
@@ -16,6 +16,7 @@ import {
   readRecord,
   writeRecord,
 } from "./ledgers";
+import { NO_MARKERS_REASON } from "./plan-blocks";
 
 const dirs: string[] = [];
 afterEach(() => {
@@ -1489,6 +1490,66 @@ describe("bkit ledgers triage", () => {
     expect(lines(r)).toHaveLength(1);
   });
 
+  it("triage refuses a plan with no task blocks", async () => {
+    const r = triageRepo([deferral()]);
+    put(
+      r,
+      PLAN_FILE,
+      [
+        "# Plan",
+        "",
+        "## Out of Scope",
+        "",
+        "| Excluded item | Why `Exempt` | Where it belongs |",
+        "| --- | --- | --- |",
+        "| Something else entirely | declared before work | `docs/elsewhere.md` |",
+        "",
+      ].join("\n"),
+    );
+    commitAll(r, "no markers");
+    const before = lines(r);
+    const res = await triage(r);
+    expect(res.code).toBe(1);
+    expect(res.err).toContain(NO_MARKERS_REASON);
+    expect(lines(r)).toEqual(before);
+  });
+
+  it("triage refuses a plan whose task blocks do not parse", async () => {
+    const r = triageRepo([deferral()]);
+    put(
+      r,
+      PLAN_FILE,
+      [
+        "# Plan",
+        "",
+        "<!-- bkit:group 1 start -->",
+        "### GROUP 1: The group",
+        "",
+        "<!-- bkit:task 2 start -->",
+        "- [ ] **TASK 2:** Guard the second call.",
+        "  - **UPDATE:** `guard` in `src/a.ts`: add the check",
+        "  - **DONE WHEN:** the guard runs",
+        "  - **TEST FIRST:** n/a — text only",
+        "<!-- bkit:task 2 end -->",
+        "",
+        "<!-- bkit:task 1 start -->",
+        "- [ ] **TASK 1:** Guard the call.",
+        "  - **UPDATE:** `guard` in `src/a.ts`: add the check",
+        "  - **DONE WHEN:** the guard runs",
+        "  - **TEST FIRST:** n/a — text only",
+        "<!-- bkit:task 1 end -->",
+        "<!-- bkit:group 1 end -->",
+      ].join("\n"),
+    );
+    commitAll(r, "unordered tasks");
+    const before = lines(r);
+    const res = await triage(r);
+    expect(res.code).toBe(2);
+    expect(res.err).toContain(`${PLAN_FILE}:13:`);
+    expect(res.err).toContain("TASK 1 comes after TASK 2");
+    expect(lines(r)).toEqual(before);
+  });
+
   it("triage marks a scope-declared row whose only declaration is itself lazy", async () => {
     const r = triageRepo([
       deferral({ key: "701-own-declaration", references: ["701-own-declaration", "src/a.ts"] }),
diff --git a/.bkit/core/engine/commands/workflow/ledgers.ts b/.bkit/core/engine/commands/workflow/ledgers.ts
index 1c484728c..d32c78dd6 100644
--- a/.bkit/core/engine/commands/workflow/ledgers.ts
+++ b/.bkit/core/engine/commands/workflow/ledgers.ts
@@ -37,7 +37,13 @@ import {
   type RunContext,
 } from "../lib.js";
 import { str } from "./status.js";
-import { outOfScope, parsePlanBlocks, reuseInventory, type OutOfScopeRow } from "./plan-blocks.js";
+import {
+  NO_MARKERS_REASON,
+  outOfScope,
+  parsePlanBlocks,
+  reuseInventory,
+  type OutOfScopeRow,
+} from "./plan-blocks.js";
 
 /** Root is not a directory or repo, git is too old, or a ref does not resolve. */
 export const EXIT_ROOT = 3;
@@ -1693,15 +1699,26 @@ export function unjustifiedRow(
 /**
  * Bucket the FID's deferral rows by the four tests and append a same-`key`
  * `unjustified` / `TRIAGED` row for each that holds all four. Throws
- * CommandError(USAGE) on a missing `--plan`, EXIT_ROW_REFUSED when a computed row
- * fails validation — nothing written.
+ * CommandError(USAGE) on a missing `--plan` or a plan whose task blocks do not
+ * parse, CommandError(NO) on a plan with no task blocks — nothing written either
+ * way — and EXIT_ROW_REFUSED when a computed row fails validation.
  */
 export function triageDeferrals(root: string, fid: string, planPath: string): TriageResult {
   const abs = path.resolve(root, planPath);
   if (!fs.existsSync(abs)) throw new CommandError(EXIT.USAGE, `--plan not found: ${planPath}`);
   const text = fs.readFileSync(abs, "utf-8");
+  const blocks = parsePlanBlocks(text);
+  const error = blocks.errors[0];
+  if (error !== undefined)
+    throw new CommandError(
+      EXIT.USAGE,
+      `${planPath}:${error.line}: ${error.message} — run \`bkit tests plan-check\``,
+    );
+  // No task block means no task surface: every row would bucket `Exempt` unread.
+  if (blocks.tasks.length === 0)
+    throw new CommandError(EXIT.NO, `${planPath}: ${NO_MARKERS_REASON}`);
   const surfaces = new Set<string>();
-  for (const task of parsePlanBlocks(text).tasks)
+  for (const task of blocks.tasks)
     for (const ref of [...task.create, ...task.read, ...task.update, ...task.delete])
       surfaces.add(path.posix.normalize(ref.file));
   for (const row of reuseInventory(text)?.rows ?? []) for (const f of row.files) surfaces.add(f);
diff --git a/.bkit/core/engine/commands/workflow/plan-blocks.ts b/.bkit/core/engine/commands/workflow/plan-blocks.ts
index 17fc3af5c..9527c0724 100644
--- a/.bkit/core/engine/commands/workflow/plan-blocks.ts
+++ b/.bkit/core/engine/commands/workflow/plan-blocks.ts
@@ -31,6 +31,10 @@ export const PLAN_FIELDS = [
 ] as const;
 export type PlanField = (typeof PLAN_FIELDS)[number];
 
+/** Why every plan reader (`tests`, `tasks`, `ledgers triage`) refuses a plan with no task blocks. */
+export const NO_MARKERS_REASON =
+  "this plan has no task markers; run /bkit-build again to convert it";
+
 /** A CREATE / READ / UPDATE / DELETE line: `` `symbol` in `file`: what ``, or `` `file`: what ``. */
 export interface PlanRef {
   /** Absent on the file-only form. A Markdown section is `§ heading text`. */
diff --git a/.bkit/core/engine/commands/workflow/tasks.ts b/.bkit/core/engine/commands/workflow/tasks.ts
index d429849de..c426c5a39 100644
--- a/.bkit/core/engine/commands/workflow/tasks.ts
+++ b/.bkit/core/engine/commands/workflow/tasks.ts
@@ -20,13 +20,14 @@ import { CommandError, EXIT, type CommandSpec, git, runGit } from "../lib.js";
 import { EXIT_DIFF_FAILED, fetchRemoteRef } from "./branches.js";
 import { DIFF_BASE } from "./context.js";
 import {
+  NO_MARKERS_REASON,
   parsePlanBlocks,
   type PlanGroup,
   type PlanRef,
   type PlanTaskBlock,
 } from "./plan-blocks.js";
 import { positiveInt, str } from "./status.js";
-import { NO_MARKERS_REASON, doneTasks } from "./tests.js";
+import { doneTasks } from "./tests.js";
 
 /** A task's heading line: the box and the number the tick addresses. */
 const TASK_BOX = /^(\s*)- \[([ xX])\] \*\*TASK (\d+):\*\*/;
diff --git a/.bkit/core/engine/commands/workflow/tests.ts b/.bkit/core/engine/commands/workflow/tests.ts
index 788452770..8522d732d 100644
--- a/.bkit/core/engine/commands/workflow/tests.ts
+++ b/.bkit/core/engine/commands/workflow/tests.ts
@@ -37,6 +37,7 @@ import {
   str,
 } from "./status.js";
 import {
+  NO_MARKERS_REASON,
   derivedTestMatrix,
   fenceNeverClosed,
   parsePlanBlocks,
@@ -276,9 +277,6 @@ export type TestFirst =
 /** The task field naming a task's tests, and the one recording an accepted test-order gap. */
 export const TEST_FIRST = "**TEST FIRST:**";
 export const TEST_EXCEPTION = "**TEST EXCEPTION:**";
-/** Why `tests green` refuses a plan with no group and task blocks. */
-export const NO_MARKERS_REASON =
-  "this plan has no task markers; run /bkit-build again to convert it";
 
 /** The plan caps `package.json` `bkit.workflows.tasks` sets for the checkout `cwd` sits in. */
 export const planCaps = (cwd: string): TaskCaps => readBkitConfig(toplevel(cwd)).tasks;
diff --git a/dist/commands/workflow/ledgers.js b/dist/commands/workflow/ledgers.js
index 19cf984ae..0a4a6ae3e 100644
--- a/dist/commands/workflow/ledgers.js
+++ b/dist/commands/workflow/ledgers.js
@@ -15,7 +15,7 @@ import { readBkitVersion } from "../../install/version-file.js";
 import { APPEND_LEDGERS, SCHEMA, UNJUSTIFIED_REASON, gitEnv, parse, mintTs, resolveRepoSlug, validate, writerProblem, } from "../../ledgers/telemetry.js";
 import { CommandError, EXIT, isIgnoredPath, isSharedBranch, parseJson, } from "../lib.js";
 import { str } from "./status.js";
-import { outOfScope, parsePlanBlocks, reuseInventory } from "./plan-blocks.js";
+import { NO_MARKERS_REASON, outOfScope, parsePlanBlocks, reuseInventory, } from "./plan-blocks.js";
 /** Root is not a directory or repo, git is too old, or a ref does not resolve. */
 export const EXIT_ROOT = 3;
 /** `git add` / `git add -u` / mkdir / copy failed. */
@@ -1416,16 +1416,24 @@ export function unjustifiedRow(row, fid, held) {
 /**
  * Bucket the FID's deferral rows by the four tests and append a same-`key`
  * `unjustified` / `TRIAGED` row for each that holds all four. Throws
- * CommandError(USAGE) on a missing `--plan`, EXIT_ROW_REFUSED when a computed row
- * fails validation — nothing written.
+ * CommandError(USAGE) on a missing `--plan` or a plan whose task blocks do not
+ * parse, CommandError(NO) on a plan with no task blocks — nothing written either
+ * way — and EXIT_ROW_REFUSED when a computed row fails validation.
  */
 export function triageDeferrals(root, fid, planPath) {
     const abs = path.resolve(root, planPath);
     if (!fs.existsSync(abs))
         throw new CommandError(EXIT.USAGE, `--plan not found: ${planPath}`);
     const text = fs.readFileSync(abs, "utf-8");
+    const blocks = parsePlanBlocks(text);
+    const error = blocks.errors[0];
+    if (error !== undefined)
+        throw new CommandError(EXIT.USAGE, `${planPath}:${error.line}: ${error.message} — run \`bkit tests plan-check\``);
+    // No task block means no task surface: every row would bucket `Exempt` unread.
+    if (blocks.tasks.length === 0)
+        throw new CommandError(EXIT.NO, `${planPath}: ${NO_MARKERS_REASON}`);
     const surfaces = new Set();
-    for (const task of parsePlanBlocks(text).tasks)
+    for (const task of blocks.tasks)
         for (const ref of [...task.create, ...task.read, ...task.update, ...task.delete])
             surfaces.add(path.posix.normalize(ref.file));
     for (const row of reuseInventory(text)?.rows ?? [])
diff --git a/dist/commands/workflow/plan-blocks.js b/dist/commands/workflow/plan-blocks.js
index c02fd7f8b..04c82d152 100644
--- a/dist/commands/workflow/plan-blocks.js
+++ b/dist/commands/workflow/plan-blocks.js
@@ -27,6 +27,8 @@ export const PLAN_FIELDS = [
     "TEST FIRST",
     "TEST EXCEPTION",
 ];
+/** Why every plan reader (`tests`, `tasks`, `ledgers triage`) refuses a plan with no task blocks. */
+export const NO_MARKERS_REASON = "this plan has no task markers; run /bkit-build again to convert it";
 const tableCells = (row) => row
     .split("|")
     .slice(1, -1)
diff --git a/dist/commands/workflow/tasks.js b/dist/commands/workflow/tasks.js
index 0faa407ae..a53f4cc48 100644
--- a/dist/commands/workflow/tasks.js
+++ b/dist/commands/workflow/tasks.js
@@ -17,9 +17,9 @@ import { parseJson } from "../../shared/json.js";
 import { CommandError, EXIT, git, runGit } from "../lib.js";
 import { EXIT_DIFF_FAILED, fetchRemoteRef } from "./branches.js";
 import { DIFF_BASE } from "./context.js";
-import { parsePlanBlocks, } from "./plan-blocks.js";
+import { NO_MARKERS_REASON, parsePlanBlocks, } from "./plan-blocks.js";
 import { positiveInt, str } from "./status.js";
-import { NO_MARKERS_REASON, doneTasks } from "./tests.js";
+import { doneTasks } from "./tests.js";
 /** A task's heading line: the box and the number the tick addresses. */
 const TASK_BOX = /^(\s*)- \[([ xX])\] \*\*TASK (\d+):\*\*/;
 /** A `tests green` report's gap line: `- Task {N} \`{kind}\` — …`. */
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index 12d991555..2128a5077 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -26,7 +26,7 @@ import { readPackageJson } from "../../shared/package-json.js";
 import { COULD_NOT_RUN_EXIT_CODES, scriptCommand } from "../../shared/package-manager.js";
 import { CONFIG_DEFAULTS, readBkitConfig } from "../../shared/settings.js";
 import { FILE_FLAG, GROUP_FLAG, WORKFLOW_FLAG, positiveInt, readStatusRows, statusFile, str, } from "./status.js";
-import { derivedTestMatrix, fenceNeverClosed, parsePlanBlocks, reuseInventory, supersessionInventory, } from "./plan-blocks.js";
+import { NO_MARKERS_REASON, derivedTestMatrix, fenceNeverClosed, parsePlanBlocks, reuseInventory, supersessionInventory, } from "./plan-blocks.js";
 import { writeStepRow } from "./steps.js";
 import { appendRecord, clampFile } from "./context.js";
 /** Exit code: no candidate gate is declared in package.json. */
@@ -195,8 +195,6 @@ export function judgeGreen(cases, want) {
 /** The task field naming a task's tests, and the one recording an accepted test-order gap. */
 export const TEST_FIRST = "**TEST FIRST:**";
 export const TEST_EXCEPTION = "**TEST EXCEPTION:**";
-/** Why `tests green` refuses a plan with no group and task blocks. */
-export const NO_MARKERS_REASON = "this plan has no task markers; run /bkit-build again to convert it";
 /** The plan caps `package.json` `bkit.workflows.tasks` sets for the checkout `cwd` sits in. */
 export const planCaps = (cwd) => readBkitConfig(toplevel(cwd)).tasks;
 /** The caps as the plan-check report and help state them. */
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index f88851ff8..4d30fa7fd 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -321,3 +321,4 @@
 {"schema":3,"ts":1793107857006,"kind":"knowledge","key":"slop-gate-suppression-flags-skip-literals-in-test-fixtures","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":["scripts/slop/bkit-slop-type-suppression.mjs","slop-scan.config.json",".bkit/core/engine/commands/workflow/branches.ts"],"summary":"A test fixture that spells `it.skip(...)` fails `bkit ci slop`'s boundary/gate-suppression rule; compose the marker from two pieces as the plugin composes its own patterns","description":"- **Category:** tooling\n- **Symptom:** `pnpm slop:delta` fails with `netFindingCount: 1` on a test file that only holds skip markers inside fixture strings, never calling a skip.\n- **Root cause:** `bkit-slop-type-suppression.mjs` scans raw file text for `.skip` / `.only` / x-prefixed test calls and only skips comments, so a fixture string that builds a skip marker is indistinguishable from a disabled test; the plugin avoids its own patterns with character classes and string composition.\n- **Fix or rule:** spell a fixture's marker in two pieces (`const SKIP = `${`it`}.${`skip`}`;`) with a comment saying why, and keep the fixture's assertions unchanged; a scoped `boundary/gate-suppression` override in `slop-scan.config.json` is a gate opt-out and needs the owner.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"The rule reads text, not syntax, so any string carrying a skip marker counts; test fixtures are its main false positive and no override exists for them.","remediation":"Compose the marker in two pieces inside a helper or constant, as the plugin composes its own patterns, so the file carries no literal the scanner matches."}
 {"schema":3,"ts":1793110852612,"kind":"knowledge","key":"plan-derived-test-matrix-needs-a-task-column","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":[".bkit/core/engine/commands/workflow/tests.ts",".bkit/core/engine/commands/workflow/plan-blocks.ts",".bkit/core/engine/commands/workflow/challenge.ts",".bkit/core/docs/templates/bkit-plan.md"],"summary":"`bkit tests plan-check` refuses a `Derived Test Matrix` header with no `Task` column, so every matrix the build writes (converted, challenge-merged, Fix now) carries one cell naming exactly one runbook task","description":"- **Category:** process\n- **Symptom:** `bkit tests plan-check` exits 1 with `the Derived Test Matrix header has no `Task` column`, then `Derived Test Matrix row maps to no task`, `maps to TASK {n}, which the plan does not define`, or `TASK {n} names TEST FIRST tests but no Derived Test Matrix row maps to it`.\n- **Root cause:** the matrix-to-runbook mapping is a plan contract with one right answer, so `plan-check` derives it from the table; a plan converted from an issue body carries the issue's three-column matrix (`Test description | Type | Target file`) with no mapping, and a task appended later (challenge merge, Decision Pause Fix now) adds its test to `TEST FIRST` without a row.\n- **Fix or rule:** write the matrix as `Test description | Type | Target file | Task`, one task number per row, and append one row per test every later task adds; `bkit challenge merge` and the Fix-now task writer add both together.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"The issue's change shape carries a three-column matrix while the plan's table is the runbook's coverage map; converting one to the other adds the column only if the writer knows the mapping is checked.","remediation":"Give the table a `Task` column, name one defined task per row, and add a row beside every test a later task appends; run `bkit tests plan-check` after any plan write."}
 {"schema":3,"ts":1793140927438,"kind":"knowledge","key":"scan-diff-removal-case-diffs-a-commit-not-the-branch","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash"},"references":[".bkit/core/engine/commands/workflow/branches.ts",".bkit/core/engine/commands/workflow/branches.test.ts"],"summary":"A removal-only case for `bkit branches scan-diff --disabled-tests` must diff a commit whose parent already holds the test file: against `origin/dev` a file the branch itself creates nets to a pure addition, so the deleted line never appears and the test false-greens","description":"- **Category:** tooling\n- **Symptom:** a `branches.test.ts` case asserting that a removed test-file line is (or is not) reported passes while the scanner still over-reports, and the same case fails for the wrong reason after a `--base` change.\n- **Root cause:** `--base=origin/dev` diffs the whole branch, so a test file added inside the branch shows as one `+` block with its final content; a line added in an earlier commit and deleted in a later one is net-absent from the diff and its removal branch never runs.\n- **Fix or rule:** give the fixture a commit holding the file first, then diff `--base=HEAD~1` (or a base that already carries the file) so the deletion appears as a `-` line; keep `origin/dev` for added-marker cases.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** low\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"Git's diff is per range, not per commit: a line that exists only between two commits of the range cancels out, so a removal-only assertion has nothing to read.","remediation":"Seed the file in an earlier commit and diff `--base=HEAD~1`, or land the file on `dev` before branching."}
+{"schema":3,"ts":1793148317642,"kind":"knowledge","key":"workflow-ledgers-importing-tests-closes-a-steps-cycle","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-execute","model":"openrouter/deepseek-v4.1-flash-1017"},"references":[".bkit/core/engine/commands/workflow/ledgers.ts",".bkit/core/engine/commands/workflow/plan-blocks.ts",".bkit/core/engine/commands/workflow/steps.ts",".bkit/core/engine/commands/workflow/tests.ts"],"summary":"A new `ledgers.ts` -> `tests.ts` import crashes every `bkit` invocation at startup with `ReferenceError: Cannot access 'EXIT_FOREIGN_PATH' before initialization`; `tsc` and the file's own tests stay green, so only a built CLI exposes it","description":"- **Category:** tooling\n- **Symptom:** after adding an import edge between two workflow command modules, `node dist/cli.js help` (and every other verb, `--version` included) dies while loading `dist/commands/workflow/steps.js` with `ReferenceError: Cannot access 'EXIT_FOREIGN_PATH' before initialization`; `pnpm build` passes and the touched test file passes.\n- **Root cause:** `steps.ts` imports `EXIT_FOREIGN_PATH` from `ledgers.ts` and `tests.ts` imports `writeStepRow` from `steps.ts`. An edge `ledgers.ts` -> `tests.ts` closes the cycle `ledgers -> tests -> steps -> ledgers`, so ESM evaluates `steps.js` first and its module-level `exitCodes` object reads the `const` before `ledgers.js` initialises it.\n- **Fix or rule:** never import `tests.js`, `steps.js` or `context.js` from `ledgers.ts`; a value two of them need (e.g. `NO_MARKERS_REASON`) lives in the leaf reader `plan-blocks.ts`, which imports nothing from the command layer. Verify with `pnpm build && node dist/cli.js help` — a cycle that type-checks is only visible on the built CLI.\n- **Type:** gotcha\n- **Confidence:** high\n- **Severity:** medium\n- **Scope:** bkit-repo\n- **Source:** agent","rootCause":"The workflow command modules are one import graph with a cycle already (steps -> ledgers, tests -> steps); any new edge into that graph reorders ESM evaluation and a module-level read of another module's `const` becomes a TDZ error at startup.","remediation":"Put shared constants and pure readers in a leaf module (`plan-blocks.ts`) and import the command modules only from the layer above them; after any new cross-module import, run the built CLI, not only `pnpm build` and vitest."}
diff --git a/docs/testing.md b/docs/testing.md
index ee865c425..a5a7f9a43 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -622,7 +622,7 @@ The status-hole detector (`.bkit/core/engine/checks/status-holes.ts`) is **advis
 | `commands/workflow/prs.test.ts` | Unit (stub `gh`) | `bkit prs open / probe / merge / verbose-ci / scan-body / cross-check / transport-row`: marker first in every body, open-PR refusal vs reuse, one retry, base read-back, 80 with the printed title / body; probe states; merge (empty body, `--match-head`, `--delete-branch`, exact-match auto-route subject, already-merged skip, `--expect-merged` 7, 80; `--base=refs/heads/main` spellings refused; a base retarget after the merge fails loudly); verbose-ci on / off / no-op / 5 / 80; body-only token scan; fallback-row cross-check; `transport-row --scan` (clean, token recorded then exit 1, unreadable 8, `--cross-check` refusal unrecorded). |
 | `commands/workflow/issues.test.ts` | Unit | `bkit issues text / labels / comment`: generated drop before the last-marker cut, oldest-first sort; phase vs additive label arithmetic, `merged` clears `bkit:failed`, board payloads from `bkit.tracker.github.project`; comment bodies, defused cut marker, fenced stderr, `--error-file`. Never shells out, because tracker writes stay on MCP. |
 | `commands/workflow/runs.test.ts` | Unit (`tests/fixtures/gh/` stub, stub `gh`) | `bkit runs gate / mirror / wait / dispatch / revalidate / context / declared` — see § Ship merge-gate. Gate `--pr` / `--squash-of` heads, title skip token (18), `--snapshot` written before deciding, `--record` refusal / `ship-merge-ci` rows, unreadable PR (20); revalidate with no head move, unreadable PR (1), 80, bad `--reason`; auto context BRIEF / CI_DEV (slug refused, 9) / CI (marker, branch fallback, not open 7, no run 8, unknown phase 3, 80); dispatch `--file` / `--step` row + close transport. |
-| `commands/workflow/ledgers.test.ts` | Unit (boundary: real temp git repo) | `bkit ledgers commit / union / only-bookkeeping`: allow-list per scope, unmatched glob never aborts, empty pathspec refused (exit 6), staging failure no false success, `--squash-of`, `--only-if-dirty-tracked`; union append-only, never `.bkit/issues.jsonl`; carry-forward range check; `append` mints a non-round `ts` and fills `schema` / `repo` / `bkit.version`, keeps a row's own `repo`, takes `compliance` / `counter` / `outcome` with `--ledger=stats`, refuses a supplied `ts` / `schema` / `bkit`, a flat top-level field `by` holds, a wrong kind, an invalid row, an empty rows file, an unlisted writer and the `issues` ledger, writing nothing on refusal; `check` passes when every `**Ledger rows:**` key has a `decision` / `deferral` row or the line reads `None`, and exits 11 naming keys with no row (a `knowledge` row does not count), on a missing line or an unfilled one. `triage --fid= --plan=`: a `low-severity` deferral stays `Exempt`, another feature's rows and a FID with no row print and write nothing, an unjustified row prints its `bucket` and appends one same-`key` `unjustified` / `TRIAGED` row with a minted `ts`, a row whose only declaration is itself stays `Lazy`, a `CLOSED` row stays `Exempt` with no test result and no write, an already-adjudicated `unjustified` row reports `Lazy` (never `Exempt`) and writes nothing on a re-run. |
+| `commands/workflow/ledgers.test.ts` | Unit (boundary: real temp git repo) | `bkit ledgers commit / union / only-bookkeeping`: allow-list per scope, unmatched glob never aborts, empty pathspec refused (exit 6), staging failure no false success, `--squash-of`, `--only-if-dirty-tracked`; union append-only, never `.bkit/issues.jsonl`; carry-forward range check; `append` mints a non-round `ts` and fills `schema` / `repo` / `bkit.version`, keeps a row's own `repo`, takes `compliance` / `counter` / `outcome` with `--ledger=stats`, refuses a supplied `ts` / `schema` / `bkit`, a flat top-level field `by` holds, a wrong kind, an invalid row, an empty rows file, an unlisted writer and the `issues` ledger, writing nothing on refusal; `check` passes when every `**Ledger rows:**` key has a `decision` / `deferral` row or the line reads `None`, and exits 11 naming keys with no row (a `knowledge` row does not count), on a missing line or an unfilled one. `triage --fid= --plan=`: a `low-severity` deferral stays `Exempt`, another feature's rows and a FID with no row print and write nothing, an unjustified row prints its `bucket` and appends one same-`key` `unjustified` / `TRIAGED` row with a minted `ts`, a row whose only declaration is itself stays `Lazy`, a `CLOSED` row stays `Exempt` with no test result and no write, an already-adjudicated `unjustified` row reports `Lazy` (never `Exempt`) and writes nothing on a re-run; a plan with no task blocks exits 1 with the no-markers reason, and a plan whose task blocks do not parse exits 2 naming the line, both writing nothing. |
 | `commands/workflow/context.test.ts` | Unit (boundary: real `bash` for blocks, real temp git repos for `diff`) | `bkit context clamp / clamp-log / ledger-scan / diff / brief / list-blocks / run-block / finalise` (`fetch` in `context-fetch.test.ts`): both profiles read against the clamped FILE, in-place loss markers, ceiling; ranked ledger scan; `diff` writes `{base}...HEAD` without `docs/plans/**` with `--numstat` totals, `--base` narrows to a group's start sha (a `build-group-start` row's `parentSha` via `status route`), unknown base exits 5 and writes nothing, empty range writes a one-line note, past the 10000-line guard a `partial diff coverage` first line + `--stat` + the largest files first cut to 500 lines each, `topFiles` / `totalLines` ceiling, record in the clamp log; `brief` `--next` picks the first group with an open task (none open: nothing written, `group: null`), leaves out a task with a `DONE — TASK N` log line, carries one-line summaries of earlier `DEPENDS ON` tasks, the note file under Deviations, the reds already recorded, the Reuse Inventory rows and Architecture entries naming the open tasks' files (past the 8 KB work cap left out and counted), prints only path / size / group / tasks / `workBytes` / `workCap`, an unknown group exits 2; block parsing by ordinal; fence written byte-for-byte, clamp inside the fence; finalise verdict / contexts / records; `finalise --record` writes + commits the `context-fetch` row and prints the comment (`--file` required). |
 | `commands/workflow/roadmap.test.ts` | Unit (real fixture ledgers, real git remote for `mirror`) | `bkit roadmap fold`: ledger projection, deterministic regenerate, `ABANDONED` hidden, fail-open on malformed / absent ledger and unwritable board, consumer text preserved, notes blocks, `## Shipped` cap, marker self-heal. `feature --strict` (exit 1 when not appended). `mirror`: worktree row then the same row committed in a throwaway `origin/dev` checkout and pushed as `dev`, skipped only on `dev`, a refused push never fails the close. |
 | `.bkit/core/engine/ledgers/migrate.test.ts` | Unit | Ledger rows without `schema` rewritten through `normalize` (idempotent; malformed, non-object, blank and schema lines kept byte-for-byte; CRLF and missing final newline kept; an old line whose rewrite the file holds dropped, repeated old lines with none kept); `migrateLedgers` rewrites in place via temp file, dry run counts only, missing ledgers skipped; `isSchemaLedger` covers every ledger. |
