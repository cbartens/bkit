diff --git a/.agents/plugins/bkit/hooks/bkit-guardrails.cjs b/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
index a0594f376..08233a1d9 100644
--- a/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
+++ b/.agents/plugins/bkit/hooks/bkit-guardrails.cjs
@@ -627,6 +627,7 @@ function newEvidence(ctx) {
     halted: false,
     commands: 0,
     produced: new Map(),
+    madeDirs: new Set(),
     startWall: Date.now(),
     startCpu: cpuMs(),
   };
@@ -1196,9 +1197,10 @@ const SCRIPT_FILE_RE = /\.(?:ts|tsx|mts|cts|rb|pl|php|lua|py|js|mjs|cjs)$/;
 const RUNNER_PROGRAMS = new Set(["tsx", "ts-node", "bun", "deno", "ruby", "perl"]);
 
 /** A `cp` / `mv` destination that names a directory: trailing slash or an existing directory. */
-function isDirDest(dest, cwd) {
+function isDirDest(dest, cwd, st) {
   if (dest.endsWith("/")) return true;
   if (cwd === null && !path.isAbsolute(dest)) return false;
+  if (st.madeDirs.has(path.resolve(cwd === null ? path.sep : cwd, dest))) return true;
   try {
     return fs.statSync(path.resolve(cwd === null ? path.sep : cwd, dest)).isDirectory();
   } catch {
@@ -1210,9 +1212,12 @@ function isDirDest(dest, cwd) {
 function markCopied(st, cmd, ops, cwd) {
   const dest = ops[ops.length - 1];
   if (cmd.dyn.has(dest)) return;
-  if (isDirDest(dest, cwd)) {
+  if (isDirDest(dest, cwd, st)) {
     for (const src of ops.slice(0, -1)) {
-      if (cmd.dyn.has(src)) continue;
+      if (cmd.dyn.has(src)) {
+        st.uncertain.add("unresolved-target");
+        continue;
+      }
       const made = dest.replace(/\/+$/, "") + "/" + src.replace(/^.*\//, "");
       markProduced(
         st,
@@ -1413,6 +1418,14 @@ function evalCommand(cmd, st, depth, cwd) {
     case "pushd":
     case "popd":
       return null;
+    case "mkdir":
+      for (const f of operands(args)) {
+        if (cmd.dyn.has(f)) st.uncertain.add("unresolved-target");
+        else if (cwd !== null || path.isAbsolute(f)) {
+          st.madeDirs.add(path.resolve(cwd === null ? path.sep : cwd, f));
+        }
+      }
+      return cwd;
     case "tee":
       for (const f of operands(args)) {
         addWordTarget(st, cmd, f, cwd, false);
@@ -1489,7 +1502,8 @@ function evalCommand(cmd, st, depth, cwd) {
             for (const a of opts.positionals) {
               const m = /^https?:\/\/[^?#]*\/([^/?#]+)$/.exec(a);
               if (!m || cmd.dyn.has(a) || dirDyn) st.uncertain.add("unresolved-target");
-              else markProduced(st, opts.outDir !== null ? `${opts.outDir}/${m[1]}` : m[1], cwd, null);
+              else
+                markProduced(st, opts.outDir !== null ? `${opts.outDir}/${m[1]}` : m[1], cwd, null);
             }
           }
         }
diff --git a/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts b/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
index 323634e42..0dacdcc9a 100644
--- a/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
+++ b/.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts
@@ -668,6 +668,24 @@ describe("cursor guardrails.cjs — shell edit evidence", () => {
     }
   });
 
+  it("flags a script copied into a new directory or by a glob", () => {
+    const dir = workDir("copynewdir");
+    fs.writeFileSync(path.join(dir, "tpl.py"), "open('src/copied.py','w').write('x')\n");
+    fs.mkdirSync(path.join(dir, "sub"), { recursive: true });
+    const commands = [
+      "mkdir bkp-nd && cp tpl.py bkp-nd && python3 bkp-nd/tpl.py",
+      "mkdir -p bkp-nd2 && cp tpl.py bkp-nd2 && python3 bkp-nd2/tpl.py",
+      "cp t*.py sub/ && python3 sub/tpl.py",
+    ];
+    for (const command of commands) {
+      const r = advise(command, dir);
+      expect({ command, text: r.text }).toEqual({
+        command,
+        text: expect.stringMatching(/src\/copied\.py|cannot be determined/i),
+      });
+    }
+  });
+
   it("marks scripts run by unanalysed interpreters as uncertain", () => {
     const dir = workDir("otherinterp");
     for (const command of ["ruby fix.rb", "perl fix.pl", "npx tsx gen.ts"]) {
@@ -791,24 +809,47 @@ describe("T6 — guardrails.cjs installed mirror is its rendered template", () =
     ["cursor", ".bkit/core/.cursor/hooks/bkit-guardrails.cjs", ".cursor/hooks/bkit-guardrails.cjs"],
     ["claude", ".bkit/core/.claude/hooks/bkit-guardrails.cjs", ".claude/hooks/bkit-guardrails.cjs"],
     ["codex", ".bkit/core/.codex/hooks/bkit-guardrails.cjs", ".codex/hooks/bkit-guardrails.cjs"],
+    [
+      "agents",
+      ".bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs",
+      ".agents/plugins/bkit/hooks/bkit-guardrails.cjs",
+    ],
   ];
 
-  for (const [host, template, mirror] of PAIRS) {
-    it(`${host}: mirror matches its template`, () => {
-      // bkit's own repo installs every host in PAIRS and tracks the mirrors.
-      expect(fs.existsSync(mirror), `${mirror} is missing — run \`pnpm bkit install\``).toBe(true);
-      expect(
-        fs.readFileSync(mirror, "utf-8"),
-        `${mirror} is stale — run \`pnpm bkit install\``,
-      ).toBe(
-        applyTokens(readTemplate(template), {
-          DEFAULT_BRANCH: "",
-          PROJECT_NAME: "",
-          REPO_SLUG: "",
-        }),
-      );
-    });
-  }
+  const mirrorOf = (i: number): { actual: string; rendered: string; path: string } => {
+    const [, template, mirror] = PAIRS[i];
+    // bkit's own repo installs every host in PAIRS and tracks the mirrors.
+    expect(fs.existsSync(mirror), `${mirror} is missing — run \`pnpm bkit install\``).toBe(true);
+    return {
+      actual: fs.readFileSync(mirror, "utf-8"),
+      rendered: applyTokens(readTemplate(template), {
+        DEFAULT_BRANCH: "",
+        PROJECT_NAME: "",
+        REPO_SLUG: "",
+      }),
+      path: mirror,
+    };
+  };
+
+  it("cursor: mirror matches its template", () => {
+    const m = mirrorOf(0);
+    expect(m.actual, `${m.path} is stale — run \`pnpm bkit install\``).toBe(m.rendered);
+  });
+
+  it("claude: mirror matches its template", () => {
+    const m = mirrorOf(1);
+    expect(m.actual, `${m.path} is stale — run \`pnpm bkit install\``).toBe(m.rendered);
+  });
+
+  it("codex: mirror matches its template", () => {
+    const m = mirrorOf(2);
+    expect(m.actual, `${m.path} is stale — run \`pnpm bkit install\``).toBe(m.rendered);
+  });
+
+  it("agents: mirror matches its template", () => {
+    const m = mirrorOf(3);
+    expect(m.actual, `${m.path} is stale — run \`pnpm bkit install\``).toBe(m.rendered);
+  });
 
   it("no host embeds its own copy of the shipped host list", () => {
     // The allowlist artifact is the only source; no hook carries a literal list.
diff --git a/.bkit/core/engine/commands/workflow/steps.test.ts b/.bkit/core/engine/commands/workflow/steps.test.ts
index 39a32ff7b..a8ca48e8b 100644
--- a/.bkit/core/engine/commands/workflow/steps.test.ts
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -20,7 +20,7 @@ import {
   readHeader,
   stepsCommand,
 } from "./steps";
-import { blockHash } from "./tests";
+import { blockHash, runPlanPath } from "./tests";
 
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
 
@@ -1884,6 +1884,51 @@ describe("bkit steps finish — the tests step touches only tests, the code step
     expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).toContain(TEST.file);
   });
 
+  it("skips a red record for a test name the plan no longer holds, and still locks the planned test", async () => {
+    const cwd = planned();
+    const body = (planned: string, other: string) =>
+      [
+        "describe('mirror suite', () => {",
+        "  it('adds a row', () => {",
+        `    expect(addRow()).toBe(${planned});`,
+        "  });",
+        "  it('counts rows', () => {",
+        `    expect(count()).toBe(${other});`,
+        "  });",
+        "});",
+        "",
+      ].join("\n");
+    write(cwd, TEST.file, body("1", "0"));
+    git(cwd, "commit", "-qam", "tests");
+    const text = fs.readFileSync(path.join(cwd, TEST.file), "utf-8");
+    const entry = (testName: string, state: string) => ({
+      task: 1,
+      test: TEST.file,
+      testName,
+      state,
+      blob: blobOf(cwd, TEST.file),
+      block: blockHash(text, testName),
+    });
+    // An earlier plan named the suite; the plan now names only the test inside it.
+    redRow(cwd, { tests: [entry("mirror suite", "missing"), entry(TEST.name, "red")] });
+    write(cwd, "src/a.ts", "export const addRow = () => 1;\n");
+    write(cwd, TEST.file, body("1", "2"));
+    expect((await run(cwd, EXECUTE)).code).toBe(11);
+    const withPlan = await run(cwd, [...EXECUTE, "--plan=plan.md"]);
+    expect(withPlan.code).toBe(0);
+
+    write(cwd, TEST.file, body("2", "2"));
+    const r = await run(cwd, [...EXECUTE, "--plan=plan.md"]);
+    expect(r.code).toBe(11);
+    expect(r.json.tests).toEqual([{ test: TEST.file, name: TEST.name }]);
+  });
+
+  it("finds the run's plan beside its status file", () => {
+    expect(runPlanPath("docs/plans/202611/logs/787-x/status.jsonl")).toBe(
+      path.join("docs/plans/202611", "787-x-plan.md"),
+    );
+  });
+
   it("refuses an edit to the planned test case, exit 11, naming the test, and appends an agent-rework friction row", async () => {
     const { cwd, body } = twoTests();
     write(cwd, TEST.file, body("2", "2"));
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index b30c86b7a..338039307 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -82,7 +82,7 @@ import {
   type TrackerOutcome,
 } from "./tracker.js";
 import { parsePlanBlocks } from "./plan-blocks.js";
-import { PLAN_TASKS_STEP, readTestFirst, touchedTests } from "./tests.js";
+import { PLAN_TASKS_STEP, readTestFirst, runPlanPath, touchedTests } from "./tests.js";
 import { addAllButCopied } from "./worktrees.js";
 
 /**
@@ -1259,7 +1259,13 @@ async function finish(ctx: RunContext): Promise<number> {
       step === PLAN_REMEDIATE_HOLISTIC_STEP)
   ) {
     const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
-    const tests = touchedTests(top, file, workflow, group);
+    const planArg = str(f.plan);
+    const planFile =
+      planArg === undefined
+        ? runPlanPath(path.resolve(ctx.cwd, file))
+        : path.resolve(ctx.cwd, planArg);
+    const plan = fs.existsSync(planFile) ? fs.readFileSync(planFile, "utf-8") : undefined;
+    const tests = touchedTests(top, file, workflow, group, plan);
     if (tests.length > 0) {
       const touched = [...new Set(tests.map((t) => t.test))];
       const named = tests.map((t) => `\`${t.test}\` "${t.name}"`).join(", ");
diff --git a/.bkit/core/engine/commands/workflow/tests.ts b/.bkit/core/engine/commands/workflow/tests.ts
index 58b208059..dbfba31f8 100644
--- a/.bkit/core/engine/commands/workflow/tests.ts
+++ b/.bkit/core/engine/commands/workflow/tests.ts
@@ -335,6 +335,15 @@ export function redEntries(file: string, workflow: string, group?: number): Map<
   return out;
 }
 
+/**
+ * The plan beside a run's status file: `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` →
+ * `docs/plans/{YYYYMM}/{FID}-plan.md`.
+ */
+export function runPlanPath(statusFile: string): string {
+  const logs = path.dirname(statusFile);
+  return path.join(path.dirname(path.dirname(logs)), `${path.basename(logs)}-plan.md`);
+}
+
 /** A planned test that differs from how the group's tests step left it. */
 export interface TouchedTest {
   test: string;
@@ -346,14 +355,24 @@ export interface TouchedTest {
  * (`testBlock`) no longer hash to the recorded block. A row with no block (written before
  * per-test locking, or when no line carried the name) derives the block from the recorded
  * blob; when that holds no block either, the whole file's blob is compared. Other edits to a
- * test file are free.
+ * test file are free. With `plan` (the plan's text), only records of tests a `TEST FIRST`
+ * line still names are checked: a name the plan dropped locks nothing.
  */
 export function touchedTests(
   top: string,
   file: string,
   workflow: string,
   group: number | undefined,
+  plan?: string,
 ): TouchedTest[] {
+  const planned =
+    plan === undefined
+      ? null
+      : new Set(
+          readTestFirst(plan).flatMap((s) =>
+            s.kind === "test" ? s.tests.map((t) => redKey(s.task, t.test, t.name)) : [],
+          ),
+        );
   const touched: TouchedTest[] = [];
   const texts = new Map<string, string | null>();
   const textOf = (test: string) => {
@@ -364,6 +383,7 @@ export function touchedTests(
     return texts.get(test)!;
   };
   for (const t of redEntries(file, workflow, group).values()) {
+    if (planned !== null && !planned.has(redKey(t.task, t.test, t.testName))) continue;
     let block = t.block ?? null;
     if (block === null) block = blockHash(blobText(top, t.blob), t.testName);
     if (block === null) {
diff --git a/.bkit/core/hooks/guardrails-shell.js b/.bkit/core/hooks/guardrails-shell.js
index 0d72b8e57..f8ab9aba7 100644
--- a/.bkit/core/hooks/guardrails-shell.js
+++ b/.bkit/core/hooks/guardrails-shell.js
@@ -176,6 +176,7 @@ function newEvidence(ctx) {
     halted: false,
     commands: 0,
     produced: new Map(),
+    madeDirs: new Set(),
     startWall: Date.now(),
     startCpu: cpuMs(),
   };
@@ -745,9 +746,10 @@ const SCRIPT_FILE_RE = /\.(?:ts|tsx|mts|cts|rb|pl|php|lua|py|js|mjs|cjs)$/;
 const RUNNER_PROGRAMS = new Set(["tsx", "ts-node", "bun", "deno", "ruby", "perl"]);
 
 /** A `cp` / `mv` destination that names a directory: trailing slash or an existing directory. */
-function isDirDest(dest, cwd) {
+function isDirDest(dest, cwd, st) {
   if (dest.endsWith("/")) return true;
   if (cwd === null && !path.isAbsolute(dest)) return false;
+  if (st.madeDirs.has(path.resolve(cwd === null ? path.sep : cwd, dest))) return true;
   try {
     return fs.statSync(path.resolve(cwd === null ? path.sep : cwd, dest)).isDirectory();
   } catch {
@@ -759,9 +761,12 @@ function isDirDest(dest, cwd) {
 function markCopied(st, cmd, ops, cwd) {
   const dest = ops[ops.length - 1];
   if (cmd.dyn.has(dest)) return;
-  if (isDirDest(dest, cwd)) {
+  if (isDirDest(dest, cwd, st)) {
     for (const src of ops.slice(0, -1)) {
-      if (cmd.dyn.has(src)) continue;
+      if (cmd.dyn.has(src)) {
+        st.uncertain.add("unresolved-target");
+        continue;
+      }
       const made = dest.replace(/\/+$/, "") + "/" + src.replace(/^.*\//, "");
       markProduced(
         st,
@@ -962,6 +967,14 @@ function evalCommand(cmd, st, depth, cwd) {
     case "pushd":
     case "popd":
       return null;
+    case "mkdir":
+      for (const f of operands(args)) {
+        if (cmd.dyn.has(f)) st.uncertain.add("unresolved-target");
+        else if (cwd !== null || path.isAbsolute(f)) {
+          st.madeDirs.add(path.resolve(cwd === null ? path.sep : cwd, f));
+        }
+      }
+      return cwd;
     case "tee":
       for (const f of operands(args)) {
         addWordTarget(st, cmd, f, cwd, false);
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index 9fefcef18..e70184bc9 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -113,3 +113,4 @@
 {"schema":3,"ts":1794365968981,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":12,"lastConfirmed":1794365968981}
 {"schema":3,"ts":1794385665367,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":13,"lastConfirmed":1794385665367}
 {"schema":3,"ts":1794448254251,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"2fa3c402b5dd5e8b6637a36a686dfad63d87b394"},"recurrenceCount":14,"lastConfirmed":1794448254251}
+{"schema":3,"ts":1794454306315,"kind":"friction","key":"steps-finish/build-plan-tasks","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"category":"agent-rework","scope":"bkit-repo","severity":"LOW","summary":"a code step edited a planned test case","description":"`bkit steps finish` refused build-plan-tasks with exit 11: `.bkit/core/engine/commands/workflow/tracker.test.ts` \"edits by verified comment id through each existing transport\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"seals unavailable or unstable representation evidence\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"uses accepted final preflight eligibility without provider atomicity\", `.bkit/core/engine/commands/workflow/tracker.test.ts` \"refuses aggregation with an unverified provider budget\" changed after the group's red; the step reruns.","source":"orchestrator","status":"OPEN","run":{"parentSha":"5834934f4a050b24979f75e161c9017d284733a2"},"recurrenceCount":7,"lastConfirmed":1794454306315}
diff --git a/.bkit/version b/.bkit/version
index 7b9b0824b..48ce93e84 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -228,12 +228,12 @@
     ".bkit/README.md": "3eab3725aca61c812345c2867a375c71434e4f3482d9961587fb41dd2ede7ae6",
     ".cursor/rules/bkit-rules.mdc": "0c15e475a322bd66f4f2258b5ffc2a6700bb9c9d217a75fa18d8168c9e1106e8",
     ".claude/hooks/bkit-gateguard.cjs": "11ac4050fa9d0a87bf4b7aaddd3849fe76ed1cee1220c6d65e224ce59d867520",
-    ".claude/hooks/bkit-guardrails.cjs": "759dad5c32de35490573aa836c74ffba54d8df90e1aeaf093b591ae76474a087",
+    ".claude/hooks/bkit-guardrails.cjs": "670ef77bcbf5bbc51456268123839ed887a77ed11e73f184cf82175941d212ef",
     ".claude/hooks/bkit-preflight.sh": "566dd1d6455e4da142a56f43f95a89d92aadca9c97cc4cd6e0f103b9bcfcf205",
     ".codex/hooks/bkit-gateguard.cjs": "ea84bfe4499bc2e5348476ae6b8f82cb3e2957b75fd94859b93ff8667c12049d",
-    ".codex/hooks/bkit-guardrails.cjs": "8a95abfec7cb8a8d21f333a2c42e7707edf51f4749d58794ed4ff8e4755dd262",
+    ".codex/hooks/bkit-guardrails.cjs": "bce0445a89fe20529de00b6d5a372fdaf8add1c2d5357362f142a97df9e50022",
     ".cursor/hooks/bkit-gateguard.cjs": "afe98fc5081fc44d7a8d0ea04d52d5fbf55f26fcd4e154676b881ca1057b3df8",
-    ".cursor/hooks/bkit-guardrails.cjs": "9dd5fc0b6329ec0cca5203201f6c1752049d561e1cd4e314a7122c77da2fef41",
+    ".cursor/hooks/bkit-guardrails.cjs": "4b80d2047ff7aa7a5a746dfffe16219d55799e8979c0d2733488aebe4ab59758",
     ".cursor/hooks/bkit-preflight.sh": "95bf73b2b001f94d83ed029a81092cda7a1c5bab0a6b6ede29b94b9454bb0bc1",
     ".opencode/plugin/bkit-gateguard.js": "a08c31417eed59bf2a8150d87b5ef4654f8055e57394e646d7d64b759b8ab6fa",
     ".bkit/LICENSE.md": "8ecc0313d0df30aa0209c5af04aaea31c19e2f7d128608a27b2162466ac67453",
diff --git a/.claude/hooks/bkit-guardrails.cjs b/.claude/hooks/bkit-guardrails.cjs
index 93357ab22..602bec65c 100644
--- a/.claude/hooks/bkit-guardrails.cjs
+++ b/.claude/hooks/bkit-guardrails.cjs
@@ -622,6 +622,7 @@ function newEvidence(ctx) {
     halted: false,
     commands: 0,
     produced: new Map(),
+    madeDirs: new Set(),
     startWall: Date.now(),
     startCpu: cpuMs(),
   };
@@ -1191,9 +1192,10 @@ const SCRIPT_FILE_RE = /\.(?:ts|tsx|mts|cts|rb|pl|php|lua|py|js|mjs|cjs)$/;
 const RUNNER_PROGRAMS = new Set(["tsx", "ts-node", "bun", "deno", "ruby", "perl"]);
 
 /** A `cp` / `mv` destination that names a directory: trailing slash or an existing directory. */
-function isDirDest(dest, cwd) {
+function isDirDest(dest, cwd, st) {
   if (dest.endsWith("/")) return true;
   if (cwd === null && !path.isAbsolute(dest)) return false;
+  if (st.madeDirs.has(path.resolve(cwd === null ? path.sep : cwd, dest))) return true;
   try {
     return fs.statSync(path.resolve(cwd === null ? path.sep : cwd, dest)).isDirectory();
   } catch {
@@ -1205,9 +1207,12 @@ function isDirDest(dest, cwd) {
 function markCopied(st, cmd, ops, cwd) {
   const dest = ops[ops.length - 1];
   if (cmd.dyn.has(dest)) return;
-  if (isDirDest(dest, cwd)) {
+  if (isDirDest(dest, cwd, st)) {
     for (const src of ops.slice(0, -1)) {
-      if (cmd.dyn.has(src)) continue;
+      if (cmd.dyn.has(src)) {
+        st.uncertain.add("unresolved-target");
+        continue;
+      }
       const made = dest.replace(/\/+$/, "") + "/" + src.replace(/^.*\//, "");
       markProduced(
         st,
@@ -1408,6 +1413,14 @@ function evalCommand(cmd, st, depth, cwd) {
     case "pushd":
     case "popd":
       return null;
+    case "mkdir":
+      for (const f of operands(args)) {
+        if (cmd.dyn.has(f)) st.uncertain.add("unresolved-target");
+        else if (cwd !== null || path.isAbsolute(f)) {
+          st.madeDirs.add(path.resolve(cwd === null ? path.sep : cwd, f));
+        }
+      }
+      return cwd;
     case "tee":
       for (const f of operands(args)) {
         addWordTarget(st, cmd, f, cwd, false);
@@ -1484,7 +1497,8 @@ function evalCommand(cmd, st, depth, cwd) {
             for (const a of opts.positionals) {
               const m = /^https?:\/\/[^?#]*\/([^/?#]+)$/.exec(a);
               if (!m || cmd.dyn.has(a) || dirDyn) st.uncertain.add("unresolved-target");
-              else markProduced(st, opts.outDir !== null ? `${opts.outDir}/${m[1]}` : m[1], cwd, null);
+              else
+                markProduced(st, opts.outDir !== null ? `${opts.outDir}/${m[1]}` : m[1], cwd, null);
             }
           }
         }
diff --git a/.codex/hooks/bkit-guardrails.cjs b/.codex/hooks/bkit-guardrails.cjs
index 486e32272..719efa80e 100644
--- a/.codex/hooks/bkit-guardrails.cjs
+++ b/.codex/hooks/bkit-guardrails.cjs
@@ -624,6 +624,7 @@ function newEvidence(ctx) {
     halted: false,
     commands: 0,
     produced: new Map(),
+    madeDirs: new Set(),
     startWall: Date.now(),
     startCpu: cpuMs(),
   };
@@ -1193,9 +1194,10 @@ const SCRIPT_FILE_RE = /\.(?:ts|tsx|mts|cts|rb|pl|php|lua|py|js|mjs|cjs)$/;
 const RUNNER_PROGRAMS = new Set(["tsx", "ts-node", "bun", "deno", "ruby", "perl"]);
 
 /** A `cp` / `mv` destination that names a directory: trailing slash or an existing directory. */
-function isDirDest(dest, cwd) {
+function isDirDest(dest, cwd, st) {
   if (dest.endsWith("/")) return true;
   if (cwd === null && !path.isAbsolute(dest)) return false;
+  if (st.madeDirs.has(path.resolve(cwd === null ? path.sep : cwd, dest))) return true;
   try {
     return fs.statSync(path.resolve(cwd === null ? path.sep : cwd, dest)).isDirectory();
   } catch {
@@ -1207,9 +1209,12 @@ function isDirDest(dest, cwd) {
 function markCopied(st, cmd, ops, cwd) {
   const dest = ops[ops.length - 1];
   if (cmd.dyn.has(dest)) return;
-  if (isDirDest(dest, cwd)) {
+  if (isDirDest(dest, cwd, st)) {
     for (const src of ops.slice(0, -1)) {
-      if (cmd.dyn.has(src)) continue;
+      if (cmd.dyn.has(src)) {
+        st.uncertain.add("unresolved-target");
+        continue;
+      }
       const made = dest.replace(/\/+$/, "") + "/" + src.replace(/^.*\//, "");
       markProduced(
         st,
@@ -1410,6 +1415,14 @@ function evalCommand(cmd, st, depth, cwd) {
     case "pushd":
     case "popd":
       return null;
+    case "mkdir":
+      for (const f of operands(args)) {
+        if (cmd.dyn.has(f)) st.uncertain.add("unresolved-target");
+        else if (cwd !== null || path.isAbsolute(f)) {
+          st.madeDirs.add(path.resolve(cwd === null ? path.sep : cwd, f));
+        }
+      }
+      return cwd;
     case "tee":
       for (const f of operands(args)) {
         addWordTarget(st, cmd, f, cwd, false);
@@ -1486,7 +1499,8 @@ function evalCommand(cmd, st, depth, cwd) {
             for (const a of opts.positionals) {
               const m = /^https?:\/\/[^?#]*\/([^/?#]+)$/.exec(a);
               if (!m || cmd.dyn.has(a) || dirDyn) st.uncertain.add("unresolved-target");
-              else markProduced(st, opts.outDir !== null ? `${opts.outDir}/${m[1]}` : m[1], cwd, null);
+              else
+                markProduced(st, opts.outDir !== null ? `${opts.outDir}/${m[1]}` : m[1], cwd, null);
             }
           }
         }
diff --git a/.cursor/hooks/bkit-guardrails.cjs b/.cursor/hooks/bkit-guardrails.cjs
index 58ac39e10..da5d86181 100644
--- a/.cursor/hooks/bkit-guardrails.cjs
+++ b/.cursor/hooks/bkit-guardrails.cjs
@@ -616,6 +616,7 @@ function newEvidence(ctx) {
     halted: false,
     commands: 0,
     produced: new Map(),
+    madeDirs: new Set(),
     startWall: Date.now(),
     startCpu: cpuMs(),
   };
@@ -1185,9 +1186,10 @@ const SCRIPT_FILE_RE = /\.(?:ts|tsx|mts|cts|rb|pl|php|lua|py|js|mjs|cjs)$/;
 const RUNNER_PROGRAMS = new Set(["tsx", "ts-node", "bun", "deno", "ruby", "perl"]);
 
 /** A `cp` / `mv` destination that names a directory: trailing slash or an existing directory. */
-function isDirDest(dest, cwd) {
+function isDirDest(dest, cwd, st) {
   if (dest.endsWith("/")) return true;
   if (cwd === null && !path.isAbsolute(dest)) return false;
+  if (st.madeDirs.has(path.resolve(cwd === null ? path.sep : cwd, dest))) return true;
   try {
     return fs.statSync(path.resolve(cwd === null ? path.sep : cwd, dest)).isDirectory();
   } catch {
@@ -1199,9 +1201,12 @@ function isDirDest(dest, cwd) {
 function markCopied(st, cmd, ops, cwd) {
   const dest = ops[ops.length - 1];
   if (cmd.dyn.has(dest)) return;
-  if (isDirDest(dest, cwd)) {
+  if (isDirDest(dest, cwd, st)) {
     for (const src of ops.slice(0, -1)) {
-      if (cmd.dyn.has(src)) continue;
+      if (cmd.dyn.has(src)) {
+        st.uncertain.add("unresolved-target");
+        continue;
+      }
       const made = dest.replace(/\/+$/, "") + "/" + src.replace(/^.*\//, "");
       markProduced(
         st,
@@ -1402,6 +1407,14 @@ function evalCommand(cmd, st, depth, cwd) {
     case "pushd":
     case "popd":
       return null;
+    case "mkdir":
+      for (const f of operands(args)) {
+        if (cmd.dyn.has(f)) st.uncertain.add("unresolved-target");
+        else if (cwd !== null || path.isAbsolute(f)) {
+          st.madeDirs.add(path.resolve(cwd === null ? path.sep : cwd, f));
+        }
+      }
+      return cwd;
     case "tee":
       for (const f of operands(args)) {
         addWordTarget(st, cmd, f, cwd, false);
@@ -1478,7 +1491,8 @@ function evalCommand(cmd, st, depth, cwd) {
             for (const a of opts.positionals) {
               const m = /^https?:\/\/[^?#]*\/([^/?#]+)$/.exec(a);
               if (!m || cmd.dyn.has(a) || dirDyn) st.uncertain.add("unresolved-target");
-              else markProduced(st, opts.outDir !== null ? `${opts.outDir}/${m[1]}` : m[1], cwd, null);
+              else
+                markProduced(st, opts.outDir !== null ? `${opts.outDir}/${m[1]}` : m[1], cwd, null);
             }
           }
         }
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index a8ec51ed7..5730c09ff 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -29,7 +29,7 @@ import { readHolder, resolveMonth, workflowLockPath } from "./locks.js";
 import { EXIT_NO_STATUS, FILE_FLAG, GROUP_FLAG, STEP_FLAG, WORKFLOW_FLAG, extraField, nonNegativeInt, positiveInt, readRuns, readStatusRows, readRunsAt, statusFile, str, } from "./status.js";
 import { COMMENT_FILE_OUTPUT, POST_FLAG, TRACKER_OUTPUT, commentFileOf, postForVerb, } from "./tracker.js";
 import { parsePlanBlocks } from "./plan-blocks.js";
-import { PLAN_TASKS_STEP, readTestFirst, touchedTests } from "./tests.js";
+import { PLAN_TASKS_STEP, readTestFirst, runPlanPath, touchedTests } from "./tests.js";
 import { addAllButCopied } from "./worktrees.js";
 /**
  * An `agent-rework` friction row for a refused planned-test edit: the step reruns, so
@@ -1017,7 +1017,12 @@ async function finish(ctx) {
         (((step === PLAN_TASKS_STEP || step === PLAN_REMEDIATE_STEP) && group !== undefined) ||
             step === PLAN_REMEDIATE_HOLISTIC_STEP)) {
         const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
-        const tests = touchedTests(top, file, workflow, group);
+        const planArg = str(f.plan);
+        const planFile = planArg === undefined
+            ? runPlanPath(path.resolve(ctx.cwd, file))
+            : path.resolve(ctx.cwd, planArg);
+        const plan = fs.existsSync(planFile) ? fs.readFileSync(planFile, "utf-8") : undefined;
+        const tests = touchedTests(top, file, workflow, group, plan);
         if (tests.length > 0) {
             const touched = [...new Set(tests.map((t) => t.test))];
             const named = tests.map((t) => `\`${t.test}\` "${t.name}"`).join(", ");
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index ccd38afff..17de6c5c3 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -214,14 +214,26 @@ export function redEntries(file, workflow, group) {
         }
     return out;
 }
+/**
+ * The plan beside a run's status file: `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` →
+ * `docs/plans/{YYYYMM}/{FID}-plan.md`.
+ */
+export function runPlanPath(statusFile) {
+    const logs = path.dirname(statusFile);
+    return path.join(path.dirname(path.dirname(logs)), `${path.basename(logs)}-plan.md`);
+}
 /**
  * The planned tests of `group` (every group when undefined) a code step changed since their red: a test whose own lines
  * (`testBlock`) no longer hash to the recorded block. A row with no block (written before
  * per-test locking, or when no line carried the name) derives the block from the recorded
  * blob; when that holds no block either, the whole file's blob is compared. Other edits to a
- * test file are free.
+ * test file are free. With `plan` (the plan's text), only records of tests a `TEST FIRST`
+ * line still names are checked: a name the plan dropped locks nothing.
  */
-export function touchedTests(top, file, workflow, group) {
+export function touchedTests(top, file, workflow, group, plan) {
+    const planned = plan === undefined
+        ? null
+        : new Set(readTestFirst(plan).flatMap((s) => s.kind === "test" ? s.tests.map((t) => redKey(s.task, t.test, t.name)) : []));
     const touched = [];
     const texts = new Map();
     const textOf = (test) => {
@@ -232,6 +244,8 @@ export function touchedTests(top, file, workflow, group) {
         return texts.get(test);
     };
     for (const t of redEntries(file, workflow, group).values()) {
+        if (planned !== null && !planned.has(redKey(t.task, t.test, t.testName)))
+            continue;
         let block = t.block ?? null;
         if (block === null)
             block = blockHash(blobText(top, t.blob), t.testName);
