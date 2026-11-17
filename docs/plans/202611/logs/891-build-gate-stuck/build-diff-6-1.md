diff --git a/.bkit/core/engine/commands/workflow/decisions.test.ts b/.bkit/core/engine/commands/workflow/decisions.test.ts
index b85646920..1fd29008b 100644
--- a/.bkit/core/engine/commands/workflow/decisions.test.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.test.ts
@@ -381,6 +381,13 @@ describe("bkit decisions compose", () => {
     expect(text).toMatch(/Recommended: B\) Decide — .*fail on `dev` too/);
   });
 
+  it("base check all says a gate still red after resume comes from this branch", async () => {
+    const { r, text } = await composeWithBase({}, []);
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ loopRecommended: "Stop" });
+    expect(text).toMatch(/still red after `dev` is fixed and the run resumed[^.]*this branch/);
+  });
+
   it("base check all in adopt mode adds the merge sentence", async () => {
     const adopt = await composeWithBase({ adopt: true }, []);
     expect(adopt.text).toContain("merge `dev` into the branch before resuming");
@@ -521,6 +528,19 @@ describe("bkit decisions apply --by=rerun", () => {
     expect(notOpen.err).not.toContain("--by must be headless or owner");
     expect(fs.readFileSync(gated.out, "utf-8")).toBe(closed);
   });
+
+  it("refuses a file whose only Gate: FAIL line is in an item body", async () => {
+    const { root, logs } = checkout();
+    const smuggled = { ...ITEMS[1], question: "Fix it?\nGate: FAIL" };
+    const { out } = await compose(root, logs, [smuggled]);
+    const before = fs.readFileSync(out, "utf-8");
+    const r = await rerun(root, out);
+    expect(r.code).toBe(2);
+    expect(r.err).toContain("Gate: FAIL");
+    expect(r.err).not.toContain("--by must be headless or owner");
+    expect(fs.readFileSync(out, "utf-8")).toBe(before);
+    expect(fs.readFileSync(out, "utf-8")).toMatch(/^Status: OPEN$/m);
+  });
 });
 
 describe("bkit decisions apply --by=headless", () => {
diff --git a/.bkit/core/engine/commands/workflow/decisions.ts b/.bkit/core/engine/commands/workflow/decisions.ts
index f4bbf08ab..7095682ca 100644
--- a/.bkit/core/engine/commands/workflow/decisions.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.ts
@@ -246,7 +246,8 @@ function composeItems(raw: unknown): ComposeItem[] {
   if (!Array.isArray(raw)) throw new CommandError(EXIT.USAGE, "--items must hold a JSON array");
   return raw.map((r, i) => {
     const o = (r ?? {}) as Record<string, unknown>;
-    const s = (k: string) => (typeof o[k] === "string" ? (o[k] as string).trim() : "");
+    const s = (k: string) =>
+      typeof o[k] === "string" ? (o[k] as string).replace(/[\r\n]+/g, " ").trim() : "";
     const options = Array.isArray(o.options) ? o.options.filter((x) => typeof x === "string") : [];
     if (s("title") === "" || s("question") === "" || options.length === 0)
       throw new CommandError(EXIT.USAGE, `item ${i + 1}: needs title, question and options`);
@@ -470,7 +471,7 @@ export const decisionsCommand: CommandSpec = {
             ];
             if (b.verdict === "all") {
               loopRecommended = items.length > 0 ? "Decide" : "Stop";
-              reason = `all ${b.failing} failing tests fail on \`dev\` too, so no round here can fix them. Fix \`dev\`, then resume.${b.adopt ? " This run has no worktrees: merge \`dev\` into the branch before resuming." : ""}`;
+              reason = `all ${b.failing} failing tests fail on \`dev\` too, so no round here can fix them. Fix \`dev\`, then resume. If the gate is still red after \`dev\` is fixed and the run resumed, the rest comes from this branch, and the gate re-run on resume shows it.${b.adopt ? " This run has no worktrees: merge \`dev\` into the branch before resuming." : ""}`;
             } else if (b.verdict === "some") {
               reason = `a round can fix ${b.failing - b.baseRed} of ${b.failing}; the build will still stop on the ${b.baseRed} from \`dev\`. ${trendReason}`;
             } else if (b.verdict === "none") {
@@ -580,7 +581,7 @@ export const decisionsCommand: CommandSpec = {
         }
         if (by === "rerun") {
           const name = path.basename(file);
-          if (!/^Gate:[ \t]*FAIL\b/m.test(text))
+          if (!/^Gate:[ \t]*FAIL\b/m.test(text.split(/\r?\n[ \t]*\r?\n/, 1)[0] ?? ""))
             throw new CommandError(EXIT.USAGE, `${name} has no Gate: FAIL header`);
           const status = /^Status:[ \t]*(\S+)/m.exec(text)?.[1] ?? "OPEN";
           if (status !== "OPEN")
diff --git a/.bkit/core/engine/commands/workflow/tests-base.integration.test.ts b/.bkit/core/engine/commands/workflow/tests-base.integration.test.ts
index 9d40fc415..1ed6488f3 100644
--- a/.bkit/core/engine/commands/workflow/tests-base.integration.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests-base.integration.test.ts
@@ -43,7 +43,7 @@ const write = (cwd: string, rel: string, body: string) => {
   fs.writeFileSync(path.join(cwd, rel), body);
 };
 
-/** A one-file "test suite": each key is a case, each value `pass`, `fail` or `env` (passes only when `.env` exists). */
+/** A one-file "test suite": each key is a case, each value `pass`, `fail`, `env` (passes only when `.env` exists) or `nohooks` (passes only when `GIT_CONFIG_COUNT` is unset). */
 const spec = (cases: Record<string, string>) => JSON.stringify(cases);
 
 /** The package's `bkit:test:file`: runs the named spec files and writes JUnit to $BKIT_TEST_REPORT. */
@@ -54,8 +54,15 @@ const cases = [];
 for (const file of process.argv.slice(2)) {
   const spec = JSON.parse(fs.readFileSync(file, "utf8"));
   if (spec.__no_report) process.exit(1);
+  if (spec.__crash) {
+    if (out) fs.writeFileSync(out, "<testsuite></testsuite>");
+    process.exit(1);
+  }
   for (const [name, want] of Object.entries(spec)) {
-    const ok = want === "pass" || (want === "env" && fs.existsSync(".env"));
+    const ok =
+      want === "pass" ||
+      (want === "env" && fs.existsSync(".env")) ||
+      (want === "nohooks" && !process.env.GIT_CONFIG_COUNT);
     if (!ok) bad++;
     cases.push('<testcase classname="' + file + '" name="' + name + '" file="' + file + '">' + (ok ? "" : '<failure message="boom"/>') + "</testcase>");
   }
@@ -181,7 +188,12 @@ const installRuns = (f: Fixture) => {
 /** A completed CI run at `sha` whose jobs are `jobs` (`name` -> conclusion). */
 function ciRun(
   f: Fixture,
-  o: { status?: string; conclusion?: string | null; jobs: Record<string, string> },
+  o: {
+    status?: string;
+    conclusion?: string | null;
+    event?: string;
+    jobs: Record<string, string>;
+  },
 ) {
   write(
     f.ghRoot,
@@ -196,7 +208,7 @@ function ciRun(
           head_branch: "dev",
           status: o.status ?? "completed",
           conclusion: o.conclusion === undefined ? "success" : o.conclusion,
-          event: "push",
+          event: o.event ?? "push",
           html_url: "https://github.com/acme/widgets/actions/runs/5001",
           created_at: "2026-11-09T10:00:00Z",
           updated_at: "2026-11-09T10:05:00Z",
@@ -455,6 +467,41 @@ describe("bkit tests base", () => {
     }
   });
 
+  it("a pull_request-event CI run at the base sha does not settle none", async () => {
+    const f = fixture({ basePackage: ciPackage, baseFiles: redOnBase, remote: true });
+    ciRun(f, {
+      event: "pull_request",
+      jobs: { lint: "success", test: "success", "bkit-tests-check": "success" },
+    });
+    gateReport(f, [["tests/a.test.ts", "x"]]);
+    const r = await testsBase(f);
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ verdict: "all", source: "local", baseRed: 1 });
+    expect(installRuns(f)).toHaveLength(1);
+  });
+
+  it("a base file run that exits non-zero without the failing case reads unknown", async () => {
+    const f = fixture({ baseFiles: { "tests/a.test.ts": spec({ __crash: "yes" }) } });
+    gateReport(f, [["tests/a.test.ts", "x"]]);
+    const r = await testsBase(f);
+    expect(r.code).toBe(0);
+    expect(r.json.verdict).toBe("unknown");
+    expect(r.json.reason).toContain("exit");
+    expect(r.json.branch).toBe(0);
+    expect(r.json.cases).toEqual([
+      expect.objectContaining({ name: "x", file: "tests/a.test.ts", atBase: "unknown" }),
+    ]);
+  });
+
+  it("the base test run does not inherit the hooks-off git config", async () => {
+    vi.stubEnv("GIT_CONFIG_COUNT", undefined);
+    const f = fixture({ baseFiles: { "tests/a.test.ts": spec({ h: "nohooks" }) } });
+    gateReport(f, [["tests/a.test.ts", "h"]]);
+    const r = await testsBase(f);
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ verdict: "none", baseRed: 0, branch: 1 });
+  });
+
   it("adopt follows the run's runtimeWorktrees", async () => {
     const adopt = fixture({ baseFiles: redOnBase, worktrees: false });
     gateReport(adopt, [["tests/a.test.ts", "x"]]);
diff --git a/.bkit/core/engine/commands/workflow/tests-base.ts b/.bkit/core/engine/commands/workflow/tests-base.ts
index c32f635fc..83b793c08 100644
--- a/.bkit/core/engine/commands/workflow/tests-base.ts
+++ b/.bkit/core/engine/commands/workflow/tests-base.ts
@@ -18,7 +18,7 @@ import { parseJson } from "../../shared/json.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import { readPackageJson } from "../../shared/package-json.js";
 import { withCleanup } from "../ci/ci.js";
-import { dropLandTree, withoutHooks } from "../land.js";
+import { dropLandTree } from "../land.js";
 import { CommandError, EXIT, git, mainCheckoutRoot, runGh, runGit, type VerbSpec } from "../lib.js";
 import { reportFailures, runTestFile, countReportFailures, type JunitCase } from "./junit.js";
 import { latestRuntimeRow } from "./runtime.js";
@@ -97,6 +97,8 @@ interface BaseRun {
   reason: string | null;
   /** Per file: its cases at base; null when the run wrote no report; absent key = file not at base. */
   files: Map<string, JunitCase[] | null>;
+  /** Per file: the exit code of its base run. */
+  exits: Map<string, number>;
 }
 
 interface Output extends BaseVerdict {
@@ -202,7 +204,7 @@ export const testsBaseVerb: VerbSpec = {
     if (repo !== null) {
       const { shipGate } = await import("./runs.js");
       const gate = shipGate(
-        { root: top, head: base, repo: repo.ownerRepo },
+        { root: top, head: base, repo: repo.ownerRepo, event: "push" },
         (args) => runGh(top, args),
         ctx.log,
       );
@@ -223,8 +225,17 @@ export const testsBaseVerb: VerbSpec = {
     const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-base-"));
     const logDir = `${log}.base`;
     const baseRun = (): BaseRun => {
-      const result: BaseRun = { reason: null, files: new Map() };
-      const added = runGit(top, ["worktree", "add", "-q", "--detach", tmp, base]);
+      const result: BaseRun = { reason: null, files: new Map(), exits: new Map() };
+      const added = runGit(top, [
+        "-c",
+        "core.hooksPath=/dev/null",
+        "worktree",
+        "add",
+        "-q",
+        "--detach",
+        tmp,
+        base,
+      ]);
       if (!added.ok) return { ...result, reason: "base checkout failed" };
       copyListed(mainCheckoutRoot(top) ?? top, tmp, readBkitConfig(top).worktreeCopy, ctx.log);
       const pkg = readPackageJson(tmp);
@@ -241,10 +252,11 @@ export const testsBaseVerb: VerbSpec = {
         if (!fs.existsSync(path.join(tmp, f))) return;
         const ran = runTestFile(tmp, f, path.join(logDir, `${n}.log`));
         result.files.set(f, ran.cases);
+        result.exits.set(f, ran.exitCode);
       });
       return result;
     };
-    const run = await withoutHooks(() => withCleanup(baseRun, () => dropLandTree(top, tmp)));
+    const run = await withCleanup(baseRun, () => dropLandTree(top, tmp));
     if (run.reason !== null)
       return unknown(
         run.reason,
@@ -253,6 +265,7 @@ export const testsBaseVerb: VerbSpec = {
       );
 
     let noReport = false;
+    let crashed: number | null = null;
     const cases = rowsWith((c, f) => {
       if (f === null) return "unknown";
       if (!run.files.has(f)) return "absent";
@@ -262,7 +275,14 @@ export const testsBaseVerb: VerbSpec = {
         return "unknown";
       }
       const same = ran.find((b) => b.name === c.name);
-      if (same === undefined) return "absent";
+      if (same === undefined) {
+        const exit = run.exits.get(f) ?? 0;
+        if (exit !== 0) {
+          crashed ??= exit;
+          return "unknown";
+        }
+        return "absent";
+      }
       return same.state === "failure" || same.state === "error" ? "red" : "pass";
     });
     const verdict = baseVerdict(cases);
@@ -270,9 +290,11 @@ export const testsBaseVerb: VerbSpec = {
       const unresolved = cases.filter((c) => c.file === null).length;
       const reason = noReport
         ? "no report from the base run"
-        : unresolved > 0
-          ? `${unresolved} case(s) with no resolvable file`
-          : verdict.reason;
+        : crashed !== null
+          ? `the base run of a test file exited ${crashed} without the failing case`
+          : unresolved > 0
+            ? `${unresolved} case(s) with no resolvable file`
+            : verdict.reason;
       return finish({ ...verdict, reason, base, source: "local", cases });
     }
     return finish({ ...verdict, base, source: "local", cases });
diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index 4adbaf107..f40ed8834 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -598,6 +598,28 @@ describe("bkit workflows start — resume facts", () => {
     expect(r.json.openDecision.gate).toBeNull();
   });
 
+  it("openDecision gate ignores a Gate line below the header", async () => {
+    const cwd = repo();
+    write(cwd, `${REL}/status.jsonl`, jsonl([started("2026-07-01T00:00:00Z")]));
+    write(
+      cwd,
+      `${REL}/build-decision-1-1.md`,
+      [
+        "Status: OPEN",
+        "Question: CHALLENGE",
+        "From: challenge",
+        "",
+        "**Q1 — Task 3:** Fix it?",
+        "Gate: FAIL",
+        "",
+      ].join("\n"),
+    );
+    const r = await run(cwd, wf("start", "build"));
+    expect(r.code).toBe(0);
+    expect(r.json.openDecision).not.toBeNull();
+    expect(r.json.openDecision.gate).toBeNull();
+  });
+
   it("reads Test attempt from a tests pause", async () => {
     const cwd = repo();
     write(cwd, `${REL}/status.jsonl`, jsonl([started("2026-07-01T00:00:00Z")]));
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index 4c5f7e017..c49bc44ef 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -279,6 +279,9 @@ export function openDecision(
     const field = (key: string) =>
       new RegExp(`^${key}:[ \\t]*(.+?)[ \\t]*$`, "m").exec(text)?.[1] ?? null;
     if (field("Status") !== "OPEN") continue;
+    // `Gate:` counts only in the header block (the lines before the first blank line).
+    const header = text.split(/\r?\n[ \t]*\r?\n/, 1)[0] ?? "";
+    const gate = /^Gate:[ \t]*(.+?)[ \t]*$/m.exec(header)?.[1] ?? null;
     const num = (key: string) => {
       const v = field(key);
       return v !== null && /^[0-9]+$/.test(v) ? Number(v) : null;
@@ -293,7 +296,7 @@ export function openDecision(
       verifyAttempt: num("Verify attempt"),
       testAttempt: num("Test attempt"),
       plan: field("Plan"),
-      gate: field("Gate"),
+      gate,
     };
   }
   return null;
diff --git a/dist/commands/workflow/decisions.js b/dist/commands/workflow/decisions.js
index 100d8b61f..e5c396b05 100644
--- a/dist/commands/workflow/decisions.js
+++ b/dist/commands/workflow/decisions.js
@@ -192,7 +192,7 @@ function composeItems(raw) {
         throw new CommandError(EXIT.USAGE, "--items must hold a JSON array");
     return raw.map((r, i) => {
         const o = (r ?? {});
-        const s = (k) => (typeof o[k] === "string" ? o[k].trim() : "");
+        const s = (k) => typeof o[k] === "string" ? o[k].replace(/[\r\n]+/g, " ").trim() : "";
         const options = Array.isArray(o.options) ? o.options.filter((x) => typeof x === "string") : [];
         if (s("title") === "" || s("question") === "" || options.length === 0)
             throw new CommandError(EXIT.USAGE, `item ${i + 1}: needs title, question and options`);
@@ -388,7 +388,7 @@ export const decisionsCommand = {
                         ];
                         if (b.verdict === "all") {
                             loopRecommended = items.length > 0 ? "Decide" : "Stop";
-                            reason = `all ${b.failing} failing tests fail on \`dev\` too, so no round here can fix them. Fix \`dev\`, then resume.${b.adopt ? " This run has no worktrees: merge \`dev\` into the branch before resuming." : ""}`;
+                            reason = `all ${b.failing} failing tests fail on \`dev\` too, so no round here can fix them. Fix \`dev\`, then resume. If the gate is still red after \`dev\` is fixed and the run resumed, the rest comes from this branch, and the gate re-run on resume shows it.${b.adopt ? " This run has no worktrees: merge \`dev\` into the branch before resuming." : ""}`;
                         }
                         else if (b.verdict === "some") {
                             reason = `a round can fix ${b.failing - b.baseRed} of ${b.failing}; the build will still stop on the ${b.baseRed} from \`dev\`. ${trendReason}`;
@@ -476,7 +476,7 @@ export const decisionsCommand = {
                 }
                 if (by === "rerun") {
                     const name = path.basename(file);
-                    if (!/^Gate:[ \t]*FAIL\b/m.test(text))
+                    if (!/^Gate:[ \t]*FAIL\b/m.test(text.split(/\r?\n[ \t]*\r?\n/, 1)[0] ?? ""))
                         throw new CommandError(EXIT.USAGE, `${name} has no Gate: FAIL header`);
                     const status = /^Status:[ \t]*(\S+)/m.exec(text)?.[1] ?? "OPEN";
                     if (status !== "OPEN")
diff --git a/dist/commands/workflow/tests-base.js b/dist/commands/workflow/tests-base.js
index 99b90e097..05b097b6e 100644
--- a/dist/commands/workflow/tests-base.js
+++ b/dist/commands/workflow/tests-base.js
@@ -16,7 +16,7 @@ import { parseJson } from "../../shared/json.js";
 import { readBkitConfig } from "../../shared/settings.js";
 import { readPackageJson } from "../../shared/package-json.js";
 import { withCleanup } from "../ci/ci.js";
-import { dropLandTree, withoutHooks } from "../land.js";
+import { dropLandTree } from "../land.js";
 import { CommandError, EXIT, git, mainCheckoutRoot, runGh, runGit } from "../lib.js";
 import { reportFailures, runTestFile, countReportFailures } from "./junit.js";
 import { latestRuntimeRow } from "./runtime.js";
@@ -162,7 +162,7 @@ export const testsBaseVerb = {
         const repo = resolveOwnerRepo(top);
         if (repo !== null) {
             const { shipGate } = await import("./runs.js");
-            const gate = shipGate({ root: top, head: base, repo: repo.ownerRepo }, (args) => runGh(top, args), ctx.log);
+            const gate = shipGate({ root: top, head: base, repo: repo.ownerRepo, event: "push" }, (args) => runGh(top, args), ctx.log);
             if (gate.passed && gate.skippedLanes.length === 0) {
                 const cases = rowsWith(() => "pass");
                 return finish({ ...baseVerdict(cases), base, source: "ci", cases });
@@ -174,8 +174,17 @@ export const testsBaseVerb = {
         const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-base-"));
         const logDir = `${log}.base`;
         const baseRun = () => {
-            const result = { reason: null, files: new Map() };
-            const added = runGit(top, ["worktree", "add", "-q", "--detach", tmp, base]);
+            const result = { reason: null, files: new Map(), exits: new Map() };
+            const added = runGit(top, [
+                "-c",
+                "core.hooksPath=/dev/null",
+                "worktree",
+                "add",
+                "-q",
+                "--detach",
+                tmp,
+                base,
+            ]);
             if (!added.ok)
                 return { ...result, reason: "base checkout failed" };
             copyListed(mainCheckoutRoot(top) ?? top, tmp, readBkitConfig(top).worktreeCopy, ctx.log);
@@ -194,13 +203,15 @@ export const testsBaseVerb = {
                     return;
                 const ran = runTestFile(tmp, f, path.join(logDir, `${n}.log`));
                 result.files.set(f, ran.cases);
+                result.exits.set(f, ran.exitCode);
             });
             return result;
         };
-        const run = await withoutHooks(() => withCleanup(baseRun, () => dropLandTree(top, tmp)));
+        const run = await withCleanup(baseRun, () => dropLandTree(top, tmp));
         if (run.reason !== null)
             return unknown(run.reason, base, rowsWith(() => "unknown"));
         let noReport = false;
+        let crashed = null;
         const cases = rowsWith((c, f) => {
             if (f === null)
                 return "unknown";
@@ -212,8 +223,14 @@ export const testsBaseVerb = {
                 return "unknown";
             }
             const same = ran.find((b) => b.name === c.name);
-            if (same === undefined)
+            if (same === undefined) {
+                const exit = run.exits.get(f) ?? 0;
+                if (exit !== 0) {
+                    crashed ??= exit;
+                    return "unknown";
+                }
                 return "absent";
+            }
             return same.state === "failure" || same.state === "error" ? "red" : "pass";
         });
         const verdict = baseVerdict(cases);
@@ -221,9 +238,11 @@ export const testsBaseVerb = {
             const unresolved = cases.filter((c) => c.file === null).length;
             const reason = noReport
                 ? "no report from the base run"
-                : unresolved > 0
-                    ? `${unresolved} case(s) with no resolvable file`
-                    : verdict.reason;
+                : crashed !== null
+                    ? `the base run of a test file exited ${crashed} without the failing case`
+                    : unresolved > 0
+                        ? `${unresolved} case(s) with no resolvable file`
+                        : verdict.reason;
             return finish({ ...verdict, reason, base, source: "local", cases });
         }
         return finish({ ...verdict, base, source: "local", cases });
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index 4a79c3521..e6f20604d 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -126,6 +126,9 @@ export function openDecision(logDir, tree, workflow, run) {
         const field = (key) => new RegExp(`^${key}:[ \\t]*(.+?)[ \\t]*$`, "m").exec(text)?.[1] ?? null;
         if (field("Status") !== "OPEN")
             continue;
+        // `Gate:` counts only in the header block (the lines before the first blank line).
+        const header = text.split(/\r?\n[ \t]*\r?\n/, 1)[0] ?? "";
+        const gate = /^Gate:[ \t]*(.+?)[ \t]*$/m.exec(header)?.[1] ?? null;
         const num = (key) => {
             const v = field(key);
             return v !== null && /^[0-9]+$/.test(v) ? Number(v) : null;
@@ -140,7 +143,7 @@ export function openDecision(logDir, tree, workflow, run) {
             verifyAttempt: num("Verify attempt"),
             testAttempt: num("Test attempt"),
             plan: field("Plan"),
-            gate: field("Gate"),
+            gate,
         };
     }
     return null;
