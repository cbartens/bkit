diff --git a/.bkit/core/engine/commands/workflow/branches.test.ts b/.bkit/core/engine/commands/workflow/branches.test.ts
index a96515222..c11031254 100644
--- a/.bkit/core/engine/commands/workflow/branches.test.ts
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -4429,4 +4429,26 @@ describe("branches scan-diff --since-step", { timeout: GIT_TIMEOUT }, () => {
     expect(r.code).toBe(1);
     expect(r.json).toEqual({ found: false, paths: [] });
   });
+
+  it("scan-diff --since-step --code exits 0 when a refused finish wrote a takeover row after the subagent committed its fix", async () => {
+    const { clone, file } = runWithEarlierStep("since-takeover");
+    commit(clone, { "src/fix.ts": "fix\n" }, "subagent fix");
+    fs.appendFileSync(
+      file,
+      row({
+        type: "step-done",
+        workflow: "build",
+        step: "build-takeover",
+        status: "DONE",
+        at: "2026-11-01T10:08:00Z",
+        parentSha: sha(clone),
+        uncommitted: true,
+        artifacts: [],
+      }),
+    );
+    finish(clone);
+    const r = await scan(clone, file);
+    expect(r.code).toBe(0);
+    expect(r.json).toEqual({ found: true, paths: ["src/fix.ts"] });
+  });
 });
diff --git a/.bkit/core/engine/commands/workflow/step-base.test.ts b/.bkit/core/engine/commands/workflow/step-base.test.ts
index 5d98d8fbd..dd4e9a70e 100644
--- a/.bkit/core/engine/commands/workflow/step-base.test.ts
+++ b/.bkit/core/engine/commands/workflow/step-base.test.ts
@@ -106,4 +106,32 @@ describe("stepBase", () => {
     expect(swept).not.toBe(c1);
     expect(stepBase({ cwd })).toBe(c1);
   });
+
+  it("with no file on a feat/{FID} branch, picks that FID's run when another run is in progress", () => {
+    repo();
+    git("checkout", "-q", "-B", "feat/1-x");
+    appendRow(started("2026-11-01T10:00:00Z"));
+    const c1 = commit("run start");
+    appendRow(done("build-plan-a", "2026-11-01T10:05:00Z", c1));
+    const c2 = commit("step a");
+    const other = path.join(cwd, "docs/plans/202611/logs/2-y/status.jsonl");
+    fs.mkdirSync(path.dirname(other), { recursive: true });
+    fs.writeFileSync(other, `${JSON.stringify(started("2026-11-01T11:00:00Z"))}\n`);
+    commit("another feature's run start");
+    expect(c2).not.toBe(c1);
+    expect(stepBase({ cwd })).toBe(c2);
+  });
+
+  it("skips a build-takeover row written inside the step it measures", () => {
+    repo();
+    appendRow(started("2026-11-01T10:00:00Z"));
+    const c1 = commit("run start");
+    appendRow(done("build-plan-a", "2026-11-01T10:05:00Z", c1));
+    const c2 = commit("step a");
+    fs.writeFileSync(path.join(cwd, "fix.ts"), "fix\n");
+    const fix = commit("subagent fix");
+    appendRow({ ...done("build-takeover", "2026-11-01T10:08:00Z", fix), uncommitted: true });
+    expect(fix).not.toBe(c2);
+    expect(stepBase({ cwd, step: "build-plan-b" })).toBe(c2);
+  });
 });
diff --git a/.bkit/core/engine/commands/workflow/step-base.ts b/.bkit/core/engine/commands/workflow/step-base.ts
index a39f32996..cd786a8fc 100644
--- a/.bkit/core/engine/commands/workflow/step-base.ts
+++ b/.bkit/core/engine/commands/workflow/step-base.ts
@@ -10,6 +10,16 @@ import * as path from "node:path";
 import { git, resolveActiveRun } from "../lib.js";
 import { readStatusRows } from "./status.js";
 
+/** The step a refused `steps finish` writes into the step being measured (`TAKEOVER_STEP` in tests.ts; not imported, since tests.ts imports this module's callers). */
+const TAKEOVER = "build-takeover";
+
+/** The FID a `feat/{FID}` branch names; undefined on any other branch. */
+function branchFid(cwd: string): string | undefined {
+  const branch = git(cwd, ["rev-parse", "--abbrev-ref", "HEAD"]);
+  const m = branch === null ? null : /^feat\/(.+)$/.exec(branch);
+  return m === null || m === undefined ? undefined : m[1];
+}
+
 /** The earliest commit that adds a row stamped `at` to `file`; null when none does. */
 function commitOfRow(file: string, at: unknown): string | null {
   if (typeof at !== "string" || at === "") return null;
@@ -34,7 +44,10 @@ function commitOfRow(file: string, at: unknown): string | null {
  * holds the run's `workflow-started` row. Null with no active run or no such commit.
  */
 export function stepBase(opts: { cwd: string; step?: string; file?: string }): string | null {
-  const run = resolveActiveRun({ cwd: opts.cwd, file: opts.file });
+  const fid = opts.file === undefined ? branchFid(opts.cwd) : undefined;
+  const run =
+    (fid === undefined ? undefined : resolveActiveRun({ cwd: opts.cwd, fid })) ??
+    resolveActiveRun({ cwd: opts.cwd, file: opts.file });
   if (run === undefined) return null;
   const rows = readStatusRows(run.file);
   let start = -1;
@@ -42,7 +55,7 @@ export function stepBase(opts: { cwd: string; step?: string; file?: string }): s
     if (r.type === "workflow-started" && r.workflow === run.workflow) start = i;
   });
   const inRun = rows.slice(start + 1).filter((r) => r.workflow === run.workflow);
-  let done = inRun.filter((r) => r.type === "step-done");
+  let done = inRun.filter((r) => r.type === "step-done" && r.step !== TAKEOVER);
   if (opts.step !== undefined) {
     const at = done.map((r) => r.step).lastIndexOf(opts.step);
     if (at >= 0) done = done.slice(0, at);
diff --git a/.bkit/core/engine/commands/workflow/tests-changed.test.ts b/.bkit/core/engine/commands/workflow/tests-changed.test.ts
index f0aac96df..d31b0bb67 100644
--- a/.bkit/core/engine/commands/workflow/tests-changed.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests-changed.test.ts
@@ -16,6 +16,7 @@ import {
   snapshotTree,
 } from "./tests-changed";
 import { testsCommand } from "./tests";
+import { newRecord, writeRecord } from "./ledgers";
 
 const dirs: string[] = [];
 const tmp = (prefix: string) => {
@@ -478,4 +479,54 @@ describe("tests changed default base", () => {
     expect(r.json?.files).toContain("src/a.ts");
     expect(r.json?.files).not.toContain("src/prev.ts");
   });
+
+  it("lists the subagent's committed file when another feature's run is also in progress", async () => {
+    checkout({ [BKIT_GATE_CHANGED_SCRIPT]: "x" });
+    git("checkout", "-q", "-B", "feat/1-x");
+    appendRow({ type: "workflow-started", workflow: "build", at: "2026-11-01T10:00:00Z" });
+    const start = commit("run start");
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
+    write(
+      "docs/plans/202611/logs/2-y/status.jsonl",
+      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-11-01T11:00:00Z" })}\n`,
+    );
+    commit("another feature's run start");
+    write("src/a.ts", "subagent edit\n");
+    commit("subagent commit");
+    const r = await changed([]);
+    expect(r.json?.files).toEqual(["src/a.ts"]);
+  });
+
+  it("on an in-place shared-branch run leaves out a file another agent committed after the last step-done commit", async () => {
+    checkout({ [BKIT_GATE_CHANGED_SCRIPT]: "x" });
+    git("checkout", "-q", "-B", "dev");
+    appendRow({ type: "workflow-started", workflow: "build", at: "2026-11-01T10:00:00Z" });
+    const start = commit("run start");
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
+    writeRecord(cwd, newRecord(cwd, "1-x", "dev"));
+    write("src/foreign.ts", "foreign\n");
+    commit("another agent's commit");
+    write("src/a.ts", "debug edit\n");
+    const r = await changed([]);
+    expect(r.json?.files).toContain("src/a.ts");
+    expect(r.json?.files).not.toContain("src/foreign.ts");
+  });
 });
diff --git a/.bkit/core/engine/commands/workflow/tests-changed.ts b/.bkit/core/engine/commands/workflow/tests-changed.ts
index 8f09ef744..f65cfcbc2 100644
--- a/.bkit/core/engine/commands/workflow/tests-changed.ts
+++ b/.bkit/core/engine/commands/workflow/tests-changed.ts
@@ -10,12 +10,24 @@ import * as os from "node:os";
 import * as path from "node:path";
 
 import { BKIT_GATE_CHANGED_SCRIPT } from "../../install/manifest.js";
-import { CommandError, EXIT, git, runGit, wholeNumber, type VerbSpec } from "../lib.js";
+import {
+  CommandError,
+  EXIT,
+  git,
+  resolveActiveRun,
+  runGit,
+  wholeNumber,
+  type VerbSpec,
+} from "../lib.js";
 import { readPackageJson } from "../../shared/package-json.js";
 import { COULD_NOT_RUN_EXIT_CODES, scriptCommand } from "../../shared/package-manager.js";
 import { runGateUnderLock } from "./junit.js";
+import { readRecord } from "./ledgers.js";
 import { stepBase } from "./step-base.js";
 
+/** A run's status ledger: bookkeeping, never a file the gate checks (another feature's run commits one too). */
+const RUN_STATUS_FILE = /^docs\/plans\/[^/]+\/logs\/[^/]+\/status\.jsonl$/;
+
 /** Exit code: neither `bkit:gate:changed` nor the --fallback gate is declared. */
 const EXIT_NO_GATE = 3;
 /** Exit code: the gate could not run (exit 126 / 127, or the package runner is missing). */
@@ -37,7 +49,9 @@ export function changedFiles(top: string, base: string): string[] {
     ...gitPaths(top, ["ls-files", "--others", "--exclude-standard", "-z"]),
     ...gitPaths(top, ["diff", "--name-only", "--no-renames", "-z", `${base}...HEAD`]),
   ]);
-  return [...all].filter((f) => fs.existsSync(path.join(top, f))).sort();
+  return [...all]
+    .filter((f) => !RUN_STATUS_FILE.test(f) && fs.existsSync(path.join(top, f)))
+    .sort();
 }
 
 /**
@@ -171,7 +185,7 @@ export const testsChangedVerb: VerbSpec = {
     {
       name: "base",
       type: "string",
-      help: "commit the step began after; files committed after it count as changed (default: the commit holding the active run's last step-done row, else HEAD)",
+      help: "commit the step began after; files committed after it count as changed (default: the commit holding the active run's last step-done row, else HEAD; a run in place on a shared branch always uses HEAD)",
     },
     {
       name: "fallback",
@@ -204,7 +218,11 @@ export const testsChangedVerb: VerbSpec = {
     let base: string;
     if (typeof ctx.flags.base === "string") base = ctx.flags.base;
     else {
-      const fromRun = stepBase({ cwd: top });
+      // A run in place on a shared branch has other agents' commits after its last step-done commit.
+      const run = resolveActiveRun({ cwd: top });
+      const inPlace =
+        run !== undefined && readRecord(top, path.basename(path.dirname(run.file))) !== null;
+      const fromRun = inPlace ? null : stepBase({ cwd: top });
       if (fromRun === null) ctx.log("no active run with a step-done row — measuring from HEAD");
       base = fromRun ?? "HEAD";
     }
diff --git a/dist/commands/workflow/step-base.js b/dist/commands/workflow/step-base.js
index 8b2a293e3..850c175e8 100644
--- a/dist/commands/workflow/step-base.js
+++ b/dist/commands/workflow/step-base.js
@@ -7,6 +7,14 @@
 import * as path from "node:path";
 import { git, resolveActiveRun } from "../lib.js";
 import { readStatusRows } from "./status.js";
+/** The step a refused `steps finish` writes into the step being measured (`TAKEOVER_STEP` in tests.ts; not imported, since tests.ts imports this module's callers). */
+const TAKEOVER = "build-takeover";
+/** The FID a `feat/{FID}` branch names; undefined on any other branch. */
+function branchFid(cwd) {
+    const branch = git(cwd, ["rev-parse", "--abbrev-ref", "HEAD"]);
+    const m = branch === null ? null : /^feat\/(.+)$/.exec(branch);
+    return m === null || m === undefined ? undefined : m[1];
+}
 /** The earliest commit that adds a row stamped `at` to `file`; null when none does. */
 function commitOfRow(file, at) {
     if (typeof at !== "string" || at === "")
@@ -31,7 +39,9 @@ function commitOfRow(file, at) {
  * holds the run's `workflow-started` row. Null with no active run or no such commit.
  */
 export function stepBase(opts) {
-    const run = resolveActiveRun({ cwd: opts.cwd, file: opts.file });
+    const fid = opts.file === undefined ? branchFid(opts.cwd) : undefined;
+    const run = (fid === undefined ? undefined : resolveActiveRun({ cwd: opts.cwd, fid })) ??
+        resolveActiveRun({ cwd: opts.cwd, file: opts.file });
     if (run === undefined)
         return null;
     const rows = readStatusRows(run.file);
@@ -41,7 +51,7 @@ export function stepBase(opts) {
             start = i;
     });
     const inRun = rows.slice(start + 1).filter((r) => r.workflow === run.workflow);
-    let done = inRun.filter((r) => r.type === "step-done");
+    let done = inRun.filter((r) => r.type === "step-done" && r.step !== TAKEOVER);
     if (opts.step !== undefined) {
         const at = done.map((r) => r.step).lastIndexOf(opts.step);
         if (at >= 0)
diff --git a/dist/commands/workflow/tests-changed.js b/dist/commands/workflow/tests-changed.js
index a7ebcf12f..76193db8a 100644
--- a/dist/commands/workflow/tests-changed.js
+++ b/dist/commands/workflow/tests-changed.js
@@ -8,11 +8,14 @@ import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
 import { BKIT_GATE_CHANGED_SCRIPT } from "../../install/manifest.js";
-import { CommandError, EXIT, git, runGit, wholeNumber } from "../lib.js";
+import { CommandError, EXIT, git, resolveActiveRun, runGit, wholeNumber, } from "../lib.js";
 import { readPackageJson } from "../../shared/package-json.js";
 import { COULD_NOT_RUN_EXIT_CODES, scriptCommand } from "../../shared/package-manager.js";
 import { runGateUnderLock } from "./junit.js";
+import { readRecord } from "./ledgers.js";
 import { stepBase } from "./step-base.js";
+/** A run's status ledger: bookkeeping, never a file the gate checks (another feature's run commits one too). */
+const RUN_STATUS_FILE = /^docs\/plans\/[^/]+\/logs\/[^/]+\/status\.jsonl$/;
 /** Exit code: neither `bkit:gate:changed` nor the --fallback gate is declared. */
 const EXIT_NO_GATE = 3;
 /** Exit code: the gate could not run (exit 126 / 127, or the package runner is missing). */
@@ -31,7 +34,9 @@ export function changedFiles(top, base) {
         ...gitPaths(top, ["ls-files", "--others", "--exclude-standard", "-z"]),
         ...gitPaths(top, ["diff", "--name-only", "--no-renames", "-z", `${base}...HEAD`]),
     ]);
-    return [...all].filter((f) => fs.existsSync(path.join(top, f))).sort();
+    return [...all]
+        .filter((f) => !RUN_STATUS_FILE.test(f) && fs.existsSync(path.join(top, f)))
+        .sort();
 }
 /**
  * A commit holding the working tree as it is now: tracked files as edited, untracked files
@@ -154,7 +159,7 @@ export const testsChangedVerb = {
         {
             name: "base",
             type: "string",
-            help: "commit the step began after; files committed after it count as changed (default: the commit holding the active run's last step-done row, else HEAD)",
+            help: "commit the step began after; files committed after it count as changed (default: the commit holding the active run's last step-done row, else HEAD; a run in place on a shared branch always uses HEAD)",
         },
         {
             name: "fallback",
@@ -184,7 +189,10 @@ export const testsChangedVerb = {
         if (typeof ctx.flags.base === "string")
             base = ctx.flags.base;
         else {
-            const fromRun = stepBase({ cwd: top });
+            // A run in place on a shared branch has other agents' commits after its last step-done commit.
+            const run = resolveActiveRun({ cwd: top });
+            const inPlace = run !== undefined && readRecord(top, path.basename(path.dirname(run.file))) !== null;
+            const fromRun = inPlace ? null : stepBase({ cwd: top });
             if (fromRun === null)
                 ctx.log("no active run with a step-done row — measuring from HEAD");
             base = fromRun ?? "HEAD";
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index 3a6cc5987..1c3c289f5 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -475,3 +475,7 @@
 {"schema":3,"ts":1794890833848,"firstTs":1794614634378,"updates":2,"kind":"deferral","key":"887-idea-md-template","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"utility","step":"manual"},"references":["887","docs/plans/202611/logs/887-review-doc-starters/plan-v2-reviewed.md § Out of Scope","887-idea-md-free-form-no-template"],"type":"issue","category":"docs","severity":"LOW","reason":"scope-declared","summary":"A template for docs/idea.md and a docs/idea.md for bkit itself","description":"Closed: the owner signed off that this work is not to be done. `docs/idea.md` stays free-form with no template (decision 887-idea-md-free-form-no-template). Original finding: docs/idea.md stays free-form with no template and bkit has none of its own, per the owner's decision on the issue.","source":"phase","status":"CLOSED"}
 {"schema":3,"ts":1794890833849,"firstTs":1794614634381,"updates":2,"kind":"deferral","key":"887-starter-vendor-content","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"utility","step":"manual"},"references":["887",".agents/rules.md","docs/plans/202611/logs/887-review-doc-starters/plan-v2-reviewed.md § Out of Scope"],"type":"issue","category":"docs","severity":"LOW","reason":"scope-declared","summary":"Vendor-specific starter content","description":"Closed: the owner signed off that this work is not to be done. The stack-independence rule in `.agents/rules.md` forbids the work. Original finding: Starters stay stack-agnostic and vendor names stay marked as examples, per the stack-agnostic rule in .agents/rules.md.","source":"phase","status":"CLOSED"}
 {"schema":3,"ts":1794890939718,"firstTs":1794353585868,"updates":3,"kind":"deferral","key":"803-cursor-codex-cloud-fingerprint-compare","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"utility","step":"manual"},"references":["#803","docs/plans/202611/803-close-codex-opencode-plan.md § Open Questions & Assumptions (Open Question 2)",".bkit/core/engine/install/cloud-env.ts renderWidenedNetworkList","803-cursor-codex-allowlist-check-follows-claude","https://github.com/cbartens/bkit/issues/803"],"type":"feature","category":"observability","severity":"LOW","reason":"needs-decision","summary":"Cursor and Codex cloud setup scripts do not compare an allowlist fingerprint","description":"Decided by the owner (decision 803-cursor-codex-allowlist-check-follows-claude): Cursor and Codex cloud get the same check, after issue 803 ships. Original finding: #803 adds the fingerprint compare to the Claude cloud SessionStart bootstrap only. The Cursor and Codex cloud docs say their dashboard allowlist is an operator assertion and unverified, and keep the derived-set stamp, but no Cursor or Codex setup script warns when the pasted list and the repo diverge. Plan Open Question 2 recommends docs only; option B adds the compare to both setup-script renders.","remediation":"The Claude check exists since issue 803 landed (`.bkit/core/engine/install/cloud-env.ts`, the `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` comparison), so this is due now: add the same stale allowed-hosts check for the Cursor and Codex cloud setups, whose paste lists carry the fingerprint and compare nothing.","status":"TRIAGED"}
+{"schema":3,"ts":1794967094875,"firstTs":1794967094875,"updates":1,"kind":"deferral","key":"1018-subagent-commits-makes-challenge-low-bkit-core-engine-commands-workflow-step-base-ts-48","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1018-subagent-commits-makes"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"Someone runs `scan-diff --since-step` by hand with a step name the run has no row for (a typo, or before `steps finish`), and it quietly measures from the run's last row, which is the step's own finish commit, and exits 1 \"no source change\" instead of refusing","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/step-base.ts:48: Someone runs `scan-diff --since-step` by hand with a step name the run has no row for (a typo, or before `steps finish`), and it quietly measures from the run's last row, which is the step's own finish commit, and exits 1 \"no source change\" instead of refusing. Done when: `scan-diff --since-step=<step>` exits `EXIT_DIFF_FAILED` with a log line naming the step when the active run has no `step-done` row for that step, so the check fails closed instead of reporting an empty range.","source":".bkit/core/engine/commands/workflow/step-base.ts:48","status":"OPEN"}
+{"schema":3,"ts":1794967094877,"firstTs":1794967094877,"updates":1,"kind":"deferral","key":"1018-subagent-commits-makes-challenge-low-bkit-core-engine-commands-workflow-step-base-ts-20","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1018-subagent-commits-makes"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"Two commits land in the same second, the first holding any row stamped with that second (an `engine-call` or `engine-action` row), and `commitOfRow` finds the row by its second-precision `at` alone, so it returns the earlier commit and the base takes in the previous step's own commit","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/step-base.ts:20: Two commits land in the same second, the first holding any row stamped with that second (an `engine-call` or `engine-action` row), and `commitOfRow` finds the row by its second-precision `at` alone, so it returns the earlier commit and the base takes in the previous step's own commit. Done when: `commitOfRow` looks the row up by a key only that row carries (its full serialized line, or `at` together with `step` and `parentSha`), so a row of another type stamped with the same second never selects an earlier commit.","source":".bkit/core/engine/commands/workflow/step-base.ts:20","status":"OPEN"}
+{"schema":3,"ts":1794967094878,"firstTs":1794967094878,"updates":1,"kind":"deferral","key":"1018-subagent-commits-makes-challenge-low-bkit-core-engine-commands-workflow-steps-ts-452","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1018-subagent-commits-makes"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A by-hand `steps finish --field=uncommitted=true` on a committed step sets the new routing flag, and `stepBase` then returns the row's `parentSha`, so the next step's base includes that step's own commit","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/steps.ts:452: A by-hand `steps finish --field=uncommitted=true` on a committed step sets the new routing flag, and `stepBase` then returns the row's `parentSha`, so the next step's base includes that step's own commit. Done when: `uncommitted` is in `CORE_ROW_KEYS`, so `--field` cannot set it and only `--commit=none` stamps it.","source":".bkit/core/engine/commands/workflow/steps.ts:452","status":"OPEN"}
+{"schema":3,"ts":1794967094879,"firstTs":1794967094879,"updates":1,"kind":"deferral","key":"1018-subagent-commits-makes-challenge-low-bkit-core-engine-commands-workflow-tests-changed-ts-207","repo":"cbartens/bkit","bkit":{"version":"6.2.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["1018-subagent-commits-makes"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A person runs `bkit tests changed` by hand on `dev`, where the only in-progress run is another feature's abandoned run, and the default base silently becomes that run's last step-done commit, so the gate runs over every file changed on `dev` since then instead of the uncommitted files","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/tests-changed.ts:207: A person runs `bkit tests changed` by hand on `dev`, where the only in-progress run is another feature's abandoned run, and the default base silently becomes that run's last step-done commit, so the gate runs over every file changed on `dev` since then instead of the uncommitted files. Done when: The owner decides whether a run the checkout does not name (no `feat/{FID}` branch, no shared-checkout record) may set the default base. No agent can settle it: the planned `step-base.test.ts` case `returns the commit that holds the last step-done row` encodes \"the single in-progress run sets the base on any branch\", and the planned-test lock refuses an edit to it. Either that case changes and `stepBase` returns null for a run the checkout does not name, or the by-hand behaviour stays and `.bkit/core/.bkit/cli.md` says so.","source":".bkit/core/engine/commands/workflow/tests-changed.ts:207","status":"OPEN"}
