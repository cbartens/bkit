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
diff --git a/docs/testing.md b/docs/testing.md
index 38b1e15ce..094159e17 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -812,7 +812,7 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `shared/bkit-latest.test.ts` | Unit (boundary: temp dirs, fake `pnpm` on PATH) | Outdated-bkit check: `compareSemver` numeric order (5.10.0 > 5.9.0) and prerelease order; unpinned and `BKIT_NO_UPDATE_CHECK` skip the registry (`0` does not); one lookup per day, a failed lookup remembered for an hour, corrupt / future-dated cache rewritten, no git dir → no cache; `lookupLatestPublished` null on a pnpm failure, non-version output, or no pnpm. |
 | `commands/workflow/fids.test.ts` | Unit | `bkit fids check / parse`: per-tracker shapes, `any` for CI_DEV, linear / jira lowercased, tracker from the main checkout's `package.json`; marker beats branch, malformed or foreign marker falls through, neither → exit 3; `bkit fids check --issue`: an issue given → the FID must embed that same id (`123-foo` with `--issue=456` fails), empty → any lowercase slug; `parse --branch` takes the suffix verbatim and links an embedded issue only when `.bkit/issues.jsonl` has a feature row for it (else `issueId` null, `upgrade-react-19` accepted, a non-slug exits 3); `featureIssueIds`; `parse --prompt-file`: per-tracker issue forms in prompt order, `ref`, a named FID, a missing file exits 7; `slugWords` / `mintFid`; `bkit fids resolve`: prompt, branch, logged (working tree and `dev`, several → exit 4), minted, then the first free `-b`, `-c`, … suffix, an IN_PROGRESS run continued, exit 5 when every name is used, exit 1 on a bad format; `bkit fids plans`: single / none (numbered files beside the plan are not plans); `bkit fids design --description-file --prompt-file`: link, own design, audit paths, exit 7 for a missing file. `bkit fids find --issue`: one (0) / none (1) / several (4), never a longer issue number, Linear case-insensitive; auto's FID entry points go through `runs context`. |
 | `commands/workflow/tests-base.test.ts` | Unit | `bkit tests base` classification: each failing gate case is `base-red` or `branch-red` against the base run's cases; the verdict is `all`, `some`, `none` or `unknown` with a reason. |
-| `commands/workflow/tests-changed.test.ts` | Unit (boundary: real temp git repos) | `snapshotTree` holds uncommitted and untracked files and leaves the index, worktree, refs, HEAD and stash unchanged; `changedBetween` splits changed and deleted files, null when the snapshot is gone; `deletedFiles`; `importersOf` lists the files that mention each deleted file, null when the search cannot read a blob; a gate whose status file says `held-too-long` (exit 124) exits 4 with no verdict; with no `--base`, a file the subagent committed after the last `step-done` commit is listed, the same file left uncommitted is listed, and a file only the previous step's own commit touched is left out. |
+| `commands/workflow/tests-changed.test.ts` | Unit (boundary: real temp git repos) | `snapshotTree` holds uncommitted and untracked files and leaves the index, worktree, refs, HEAD and stash unchanged; `changedBetween` splits changed and deleted files, null when the snapshot is gone; `deletedFiles`; `importersOf` lists the files that mention each deleted file, null when the search cannot read a blob; a gate whose status file says `held-too-long` (exit 124) exits 4 with no verdict; with no `--base`, a file the subagent committed after the last `step-done` commit is listed, the same file left uncommitted is listed, and a file only the previous step's own commit touched is left out; on a `feat/{FID}` branch with another feature's run also in progress, that FID's run is picked and the subagent's committed file is listed; on an in-place shared-branch run the base stays `HEAD`, so a file another agent committed after the last `step-done` commit is left out; run `status.jsonl` files are never listed as changed. |
 | `commands/workflow/junit.test.ts` | Unit | `reportFailures`: the failing cases of a JUnit report, `[]` for a clean report, null with no report. |
 | `commands/workflow/tests-base.integration.test.ts` | Integration (real git, real subprocess) | `bkit tests base`: the local run at the base commit in a worktree, CI evidence at the base sha, the run's mode and install setting. |
 | `commands/workflow/tests.test.ts` | Unit (boundary: real subprocess) | `bkit tests run`: deepest declared gate wins, an empty script is not declared; PASS / FAIL with the log always saved; no gate declared → exit 3; runner could not run → exit 4 (never FAIL); runs at the checkout top; `--tail`; `--changed-since=<sha>` runs `bkit:gate:changed` on the files changed since that commit (the resolved gate whole when it is undeclared; no changed file → PASS row, nothing run; a sha naming no commit → exit 2; a lock wait read from the status file → exit 81, no row; exit 75 with no status file → a gate failure; a deleted file runs the gate on the files that mention it, a failed search runs it whole; `--changed-since=feature-base`; `--since-pass-of` measures from the newest passing run's `tested` snapshot, falling back to `--changed-since`). A `--file` row records its `tested` snapshot; a FAIL row records `failedTests` (at most 100, `failedTestsTruncated` when cut); a CI evidence row lists each failed job as `job:{name}`. A passing run of the exact required push gate records a push-gate receipt for HEAD (uncommitted changes inside the min-push paths are tolerated, any other uncommitted change records none), a failing run leaves the `.failed` marker, a lock wait or a gate other than the required push gate records none. `bkit tests plan-check`: the group and task blocks, `DONE WHEN` / `TEST FIRST`, `DEPENDS ON` order, a `Reuse Inventory` `NEW` row per `CREATE` file, a `Supersession Inventory` row per `DELETE`, the matrix header exactly `Test description \| Type \| Target file \| Task` and a row per test-bearing task (a header with a missing, extra or reordered column or no closing pipe, a row without exactly 4 cells or with anything but task numbers in its `Task` cell, an unmapped row, two tasks, an undefined task and a test-bearing task with no row each refused), the caps from `bkit.workflows.tasks`, symbol existence skipped on a ticked task, the change-issue form example accepted. `bkit tests red` / `green`: the named test decides, never the exit code alone; one red row per group run with a state and blob per planned test, a test an earlier row proved red skipped while its file is unchanged; green merges the group's rows per test, prints `verdict` and a `fixable` per gap, an empty `gaps` on a clean plan, and folds a multi-line failure message onto its gap line so a `## ` line never ends the `## Gaps` section. Takeovers: `plan-check` lists `takeovers` (a later task naming an earlier task's test, a suite-path name matched on its last segment); the red records `from` and `taken-over`; green lists `takenOver` with its diff, never a gap or `unproven`. `plan-check --ledger-rows`: a key on the `**Ledger rows:**` line with no row on disk is refused and named, a missing or unfilled line is refused, a plan whose keys all have a decision or deferral row passes, and the line stays unchecked without the flag. |
@@ -826,7 +826,7 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `commands/workflow/workflows.test.ts` | Unit (boundary: real temp git repos + bare remote) | `bkit workflows start / fail / handover / close / promote / links`: run opened vs resumed (a run still resumes after another workflow's run), `--lock-held`, `lastDoneStep` and, as `openDecision` with its `status` and `sourceChanged` (the `Source changed` header) on a resume, the run's own `OPEN` decision or a `DECIDED` / `ASSUMED` one that no `build-decision` row names; failed row, own-lock release, rebase or merge abort only when in progress, sentinel clearing, `handoverNeeded` (incl. debug `SOAK`), nothing changed without `--token` (empty values count as absent), labels, failure comment from `--error-file`; handover `--push` (the record committed and pushed on the feature branch with or without a handover, open PR → 9 with no link, pushed → linked comment, the named worktree committed in, and from `dev` only the logs and ledgers landed through a throwaway checkout with the checkout's code untouched, then the landed copies handed back so local `dev` fast-forwards onto them while a staged ledger stays and is named, a refusal → 10 with the record kept) and ship `--flush` (one FAILED commit landed on `dev` from a throwaway checkout with the main checkout untouched, nothing-to-commit, the named worktree's logs carried, a refused push keeping the record in the book with exit 10); ship `close --flush` (one DONE commit on `dev` carrying the book, then the owned worktree and branch removed; an unowned worktree and its branch left in place); compliance rows before counter + outcome rows, one `run.parentSha` on all three, a `build-plan-convert` row → `plan.source` `converted` with groups, plan tasks counted from task headings, unwritable stats never failing the close, ship size + coverage, artifact links, `--message` commit with the exact-match auto-route marker and `--verbose-ci-local`, `--record-step`, `--outbox` + `--number` comment; promote (`--resolve`, exit 12, archive of a changed canonical, anchor from the base commit, bkit release and outdated warning in the anchor, the plan copied alone, a stray `{FID}-plan-N.md` neither copied nor archived); links (comment, branch name in URLs); `close --ending=held --publish=false` writing `ending: held` and `publish: false` on the `workflow-done` row (default `done`, an unknown ending refused) and passing `publish` into the summary; `handover` prints `route` `stop` on every exit it reaches (0, 9 with ship's push skipped on an open PR, 10, 11, `--ref`) and the not-pushed line as `message` on each non-zero one. |
 | `commands/workflow/worktrees.test.ts`, `worktrees.integration.test.ts` | Unit and Integration (real git remote) | `bkit worktrees setup / remove`: adopt in place, debug / ship branch rules, mint off a freshly fetched `origin/dev` — always for design / plan, and off local `dev` when it is ahead for build / debug (diverged → `origin/dev`, narrated) —, a resumed design / plan branch carrying unpushed `dev` commits refused (7) while the same worktree resumes for build, resume rebase onto the same base + sentinel, a failed ship's uncommitted leftovers committed before that rebase (logs dev already holds dropped, copied entries never committed; a refused commit → exit 9), `direnv allow` only for a `.envrc` identical to the main checkout's (direnv stubbed on PATH), `bkit.workflows.worktree.copy` list with missing entries narrated, install in every workflow (design / plan included), install failure vs could-not-run exits, `--detect` taking mint vs adopt from the runtime (exclusive with `--worktrees`), ownership marker, removal only of a marked worktree, `--branch` deleting the local and remote branch unless another worktree holds it (`branchBlockedBy`); debug in place on `dev` writes the shared-checkout record (`startSha`, `aheadAtStart`) and exits 13 when another feature's live run holds the checkout; a ship of `dev` / `main` and `main` for design / plan / build exit 7. |
 | `commands/workflow/shared-checkout.integration.test.ts` | Integration (real git, real bare `origin`) | A debug run in place on `dev` with foreign work in flight (a modified file, an untracked one, a staged one, a pre-existing ledger row, a local commit): the push sends only the run's commits (replayed as copies onto `origin/dev` when local `dev` is ahead or `origin/dev` moved, a plain push when level, a foreign commit never; with the run's record gone, or another run's newer record present, the push refuses with exit 20 or selects its own `--fid` record), and the run's commits, close commit and roadmap mirror row carry only its own paths and rows, leaving foreign staged, untracked and `.bkit/issues.jsonl` changes behind. |
-| `commands/workflow/branches.test.ts` | Unit (boundary: real temp git repos) | `bkit branches rebase / anchor-stamp / anchor-read / push / sync / sync-dev`: ledger union byte-identical to `merge=union`, lockfile from the rebase target then regenerated, refuse-before-mutate; idempotent anchor stamp, `--base-ref` override, `bkitVersion` / `bkitLatest` stamped and the visible outdated line written then dropped after an upgrade, the outdated stamp prettier-clean and stable on re-stamp, empty `bkitLatest` when unknown; `--against` skip exits; one `git push`, lease only off `dev`/`main`, `--require-ci`, abort guard + `--open-pr`; a `--require-ci` feature push merging `origin/dev`'s ledger rows first (`mergedDev: true`), pushing as-is when `dev` has not moved or without `--require-ci`, and exiting 11 with nothing pushed on a code conflict; docs-from-dev merge committed as `chore({FID}): merge dev` with no skip token, also when only a ledger outside `docs/` moved, a declared `bkit:generate` run and committed after it (25 when it fails); `sync --merge` (ship Step 4) merging `origin/dev` into the checked-out branch: a clean merge committed with the branch as first parent, `current` when `dev` has not moved with a stale sentinel cleared, uncommitted work carried in its own commit first, a conflicted lockfile taken from `dev`, conflicts outside the ledgers and lockfile left in progress with exit 24 until `git add` and a re-run complete the merge, a failed ledger resolution aborting the merge with the sentinel written (11), `bkit:generate` committed after the merge, `--file` writing one `engine-action` merge row, usage (2) and detached (5) refusals; `regenerate` (ship Steps 3 and 10) committing only the paths `bkit:generate` changed while the run's own uncommitted files stay uncommitted, a rewrite and a delete committed, `--attempt` giving the `fix({FID}): regenerate attempt {N}` subject, `--file` writing one `engine-action` regenerate row, `unchanged` when nothing changed, `undeclared` with no or an empty script, 25 when `bkit:generate` fails or rewrites a file that was already uncommitted, usage (2) for `--attempt=0` and on `dev`; `rebase --file` writing one `engine-action` rebase row for a completed rebase and none for a refused one; `sync-dev` fast-forwarding local `dev` without a checkout, moving the checkout and installing only when on `dev` and `dev` moved (16 on a failed install), listing local-only `dev` commits with the publish command and pushing none (10 on a failed fetch); a refused rebase whose `--abort` fails reports `aborted: false` and `ABORT FAILED`. `bkit branches land`: workflow refusal, stray main-checkout artifacts (17), squash off `origin/dev` → `design DONE` commit pushed + audited + local `dev` fast-forwarded, staged files in the main checkout left staged, local-only `dev` commits left unpushed (`localDev: skipped`), another checked-out branch kept with only the `dev` pointer moved, `dev` moving under the push rebuilt and retried (`pushAttempts: 2`) or exhausted (8, branch kept, throwaway worktree gone), non-doc files refused (17) — a branch carrying unpushed `dev` commits additionally named as such, with the unpushed count and `git push origin dev` —, refused `dev` push → PR shape handing the PR to MCP (80, stage `open`) after pushing the roadmap commit (cloud, and on a laptop from the worktree holding the branch), refused PR merge → `origin/dev` merged into the branch locally and pushed (no server-side update-branch) then merged, a CLOSED PR stopping at once (17), uncommitted files in the feature worktree keeping the worktree and branch (`worktree.reason: uncommitted`), branch work missing from `origin/dev` stopping (18) with branch and worktree kept; `landBackoffMs` schedule (2s doubling, 30s cap, jitter, 3min total); the full local close is also run from the workflow in `close-squash.integration.test.ts`. `scan-diff --since-step=<step> --file --code`: exit 0 whether the subagent committed its fix before `steps finish` or left it for the finish commit, exit 1 when the step changed only logs. `scan-diff --disabled-tests`: added disabling markers exit 1 with each hit's `file:line` and test name; no unmatched candidates exits 0 with an empty `disabled`. Exact assertion moves consume each added occurrence once and require unchanged test context across files; rewrites pair only within the same file and test. Unchanged duplicates and unrelated additions cannot conceal removals. Removed assertions retain their original test names; deleted files use old line numbers. Comments, non-assertion deletions and quoted markers in docs or source files are excluded. |
+| `commands/workflow/branches.test.ts` | Unit (boundary: real temp git repos) | `bkit branches rebase / anchor-stamp / anchor-read / push / sync / sync-dev`: ledger union byte-identical to `merge=union`, lockfile from the rebase target then regenerated, refuse-before-mutate; idempotent anchor stamp, `--base-ref` override, `bkitVersion` / `bkitLatest` stamped and the visible outdated line written then dropped after an upgrade, the outdated stamp prettier-clean and stable on re-stamp, empty `bkitLatest` when unknown; `--against` skip exits; one `git push`, lease only off `dev`/`main`, `--require-ci`, abort guard + `--open-pr`; a `--require-ci` feature push merging `origin/dev`'s ledger rows first (`mergedDev: true`), pushing as-is when `dev` has not moved or without `--require-ci`, and exiting 11 with nothing pushed on a code conflict; docs-from-dev merge committed as `chore({FID}): merge dev` with no skip token, also when only a ledger outside `docs/` moved, a declared `bkit:generate` run and committed after it (25 when it fails); `sync --merge` (ship Step 4) merging `origin/dev` into the checked-out branch: a clean merge committed with the branch as first parent, `current` when `dev` has not moved with a stale sentinel cleared, uncommitted work carried in its own commit first, a conflicted lockfile taken from `dev`, conflicts outside the ledgers and lockfile left in progress with exit 24 until `git add` and a re-run complete the merge, a failed ledger resolution aborting the merge with the sentinel written (11), `bkit:generate` committed after the merge, `--file` writing one `engine-action` merge row, usage (2) and detached (5) refusals; `regenerate` (ship Steps 3 and 10) committing only the paths `bkit:generate` changed while the run's own uncommitted files stay uncommitted, a rewrite and a delete committed, `--attempt` giving the `fix({FID}): regenerate attempt {N}` subject, `--file` writing one `engine-action` regenerate row, `unchanged` when nothing changed, `undeclared` with no or an empty script, 25 when `bkit:generate` fails or rewrites a file that was already uncommitted, usage (2) for `--attempt=0` and on `dev`; `rebase --file` writing one `engine-action` rebase row for a completed rebase and none for a refused one; `sync-dev` fast-forwarding local `dev` without a checkout, moving the checkout and installing only when on `dev` and `dev` moved (16 on a failed install), listing local-only `dev` commits with the publish command and pushing none (10 on a failed fetch); a refused rebase whose `--abort` fails reports `aborted: false` and `ABORT FAILED`. `bkit branches land`: workflow refusal, stray main-checkout artifacts (17), squash off `origin/dev` → `design DONE` commit pushed + audited + local `dev` fast-forwarded, staged files in the main checkout left staged, local-only `dev` commits left unpushed (`localDev: skipped`), another checked-out branch kept with only the `dev` pointer moved, `dev` moving under the push rebuilt and retried (`pushAttempts: 2`) or exhausted (8, branch kept, throwaway worktree gone), non-doc files refused (17) — a branch carrying unpushed `dev` commits additionally named as such, with the unpushed count and `git push origin dev` —, refused `dev` push → PR shape handing the PR to MCP (80, stage `open`) after pushing the roadmap commit (cloud, and on a laptop from the worktree holding the branch), refused PR merge → `origin/dev` merged into the branch locally and pushed (no server-side update-branch) then merged, a CLOSED PR stopping at once (17), uncommitted files in the feature worktree keeping the worktree and branch (`worktree.reason: uncommitted`), branch work missing from `origin/dev` stopping (18) with branch and worktree kept; `landBackoffMs` schedule (2s doubling, 30s cap, jitter, 3min total); the full local close is also run from the workflow in `close-squash.integration.test.ts`. `scan-diff --since-step=<step> --file --code`: exit 0 whether the subagent committed its fix before `steps finish` or left it for the finish commit, exit 1 when the step changed only logs, and skipping a `build-takeover` row a refused finish wrote after the subagent committed. `scan-diff --disabled-tests`: added disabling markers exit 1 with each hit's `file:line` and test name; no unmatched candidates exits 0 with an empty `disabled`. Exact assertion moves consume each added occurrence once and require unchanged test context across files; rewrites pair only within the same file and test. Unchanged duplicates and unrelated additions cannot conceal removals. Removed assertions retain their original test names; deleted files use old line numbers. Comments, non-assertion deletions and quoted markers in docs or source files are excluded. |
 | `commands/land.test.ts` | Unit (boundary: real temp git repos + bare remote) | `pushToDev`, the one routine every `dev` write goes through: commit built in a throwaway `origin/dev` checkout and pushed as `dev`, the main checkout untouched, local-only `dev` commits never pushed, `dev` moving under the push rebuilt and retried or exhausted, any other refusal handed to the caller's `refused` hook with the throwaway checkout still there, fetch failure, a throwing build; the throwaway checkout gone on every path; `landBackoffMs` schedule. |
 | `commands/workflow/skills.test.ts` | Unit (stub skills CLI) | `bkit skills prune`: union of folders and lock keys, never `bkit-*`, whole-name and literal matching, skips with a warning (exit 0) without `.agents/skills.md`, CLI failure and could-not-run warned and listed in `failed` (exit 0). |
 | `commands/workflow/prs.test.ts` | Unit (stub `gh`) | `bkit prs open / probe / merge / verbose-ci / scan-body / cross-check / transport-row`: marker first in every body, open-PR refusal vs reuse, one retry, base read-back, 80 with the printed title / body; probe states; merge (empty body, `--match-head`, `--delete-branch`, exact-match auto-route subject, already-merged skip, `--expect-merged` 7, 80; `--base=refs/heads/main` spellings refused; a base retarget after the merge fails loudly); verbose-ci on / off / no-op / 5 / 80; body-only token scan; fallback-row cross-check; `transport-row --scan` (clean, token recorded then exit 1, unreadable 8, `--cross-check` refusal unrecorded). |
