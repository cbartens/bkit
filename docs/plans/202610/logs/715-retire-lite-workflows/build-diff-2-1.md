diff --git a/.bkit/core/engine/commands/workflow/status.test.ts b/.bkit/core/engine/commands/workflow/status.test.ts
index 8e8cf6699..417d0d8ee 100644
--- a/.bkit/core/engine/commands/workflow/status.test.ts
+++ b/.bkit/core/engine/commands/workflow/status.test.ts
@@ -505,7 +505,7 @@ describe("bkit status route --prompt-file (debug Step 1)", () => {
 
   it("refuses --prompt-file for another workflow, and a missing --file without --fid", async () => {
     const p = prompt("x");
-    const other = ["status", "route", "--workflow=build", `--prompt-file=${p}`];
+    const other = ["status", "route", "--workflow=ship", `--prompt-file=${p}`];
     expect((await run([...other, `--file=${path.join(tmp(), "s.jsonl")}`])).code).toBe(2);
     expect((await run(["status", "route", "--workflow=debug", `--prompt-file=${p}`])).code).toBe(2);
     expect((await run(["status", "route", "--workflow=debug"])).code).toBe(2);
@@ -524,6 +524,83 @@ describe("bkit status route --prompt-file (debug Step 1)", () => {
   });
 });
 
+describe("bkit status route --workflow=build publish", () => {
+  const runtimeRow = (runtime: string) => ({
+    type: "runtime-resolved",
+    workflow: "build",
+    at: "2026-10-01T00:00:01Z",
+    runtime,
+    runtimeWorktrees: true,
+    runtimeDevPushes: true,
+    runtimeGithubCli: true,
+  });
+  const setup = (rows: object[], promptText: string, config?: object) => {
+    const root = tmp();
+    if (config)
+      fs.writeFileSync(
+        path.join(root, "package.json"),
+        JSON.stringify({ bkit: { workflows: { build: { publish: config } } } }),
+      );
+    const file = path.join(root, "status.jsonl");
+    fs.writeFileSync(file, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
+    const prompt = path.join(root, "prompt.md");
+    fs.writeFileSync(prompt, promptText);
+    return { root, file, prompt };
+  };
+  const route = (s: ReturnType<typeof setup>) =>
+    run(
+      ["status", "route", `--file=${s.file}`, "--workflow=build", `--prompt-file=${s.prompt}`],
+      s.root,
+    );
+  const rows = (runtime: string) => [started("build", "2026-10-01T00:00:00Z"), runtimeRow(runtime)];
+
+  it("lets the publish token override publish.local", async () => {
+    const r = await route(setup(rows("LOCAL"), "/bkit-build 7 publish=true", { local: false }));
+    expect(r.json).toMatchObject({ publish: true, publishSource: "token" });
+    const h = await route(setup(rows("LOCAL"), "/bkit-build 7 publish=false"));
+    expect(h.json).toMatchObject({ publish: false, publishSource: "token" });
+  });
+
+  it("reads publish.local on LOCAL without a token", async () => {
+    const r = await route(setup(rows("LOCAL"), "/bkit-build 7", { local: false }));
+    expect(r.json).toMatchObject({ publish: false, publishSource: "local" });
+  });
+
+  it("coerces publish false to true on a non-LOCAL runtime", async () => {
+    const r = await route(setup(rows("CLOUD_CLAUDE"), "/bkit-build 7 publish=false"));
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ publish: true, publishSource: "coerced" });
+  });
+
+  it("accepts --prompt-file with --workflow=build", async () => {
+    const r = await route(setup(rows("LOCAL"), "/bkit-build 7"));
+    expect(r.code).toBe(0);
+    expect(r.json.debugMode).toBeNull();
+    expect(r.json.gates).toBeUndefined();
+  });
+
+  it("ignores publish=maybe and falls through to config", async () => {
+    const r = await route(setup(rows("LOCAL"), "/bkit-build 7 publish=maybe", { local: false }));
+    expect(r.json).toMatchObject({ publish: false, publishSource: "local" });
+  });
+
+  it("refuses publish without a runtime-resolved row", async () => {
+    const r = await route(setup([started("build", "2026-10-01T00:00:00Z")], "/bkit-build 7"));
+    expect(r.code).toBe(4);
+    expect(r.err).toContain("Step 2");
+  });
+
+  it("prints publishSource for token, local, remote and coerced", async () => {
+    const sources = [
+      (await route(setup(rows("LOCAL"), "publish=false"))).json.publishSource,
+      (await route(setup(rows("LOCAL"), "x"))).json.publishSource,
+      (await route(setup(rows("GITHUB_ACTION"), "x"))).json.publishSource,
+      (await route(setup(rows("GITHUB_ACTION"), "publish=false"))).json.publishSource,
+    ];
+    expect(sources).toEqual(["token", "local", "remote", "coerced"]);
+  });
+});
+
 describe("bkit status route --expect", () => {
   const file = () =>
     log([
diff --git a/.bkit/core/engine/commands/workflow/status.ts b/.bkit/core/engine/commands/workflow/status.ts
index c666ad1f1..8336b1660 100644
--- a/.bkit/core/engine/commands/workflow/status.ts
+++ b/.bkit/core/engine/commands/workflow/status.ts
@@ -165,7 +165,14 @@ const DEBUG_MODES = ["NORMAL", "SOAK"];
 const PUSH_MODES = ["PR", "LOCAL"];
 const STRATEGIES = ["STANDARD", "PIVOT", "FINAL"];
 
-const ROUTE_FIELDS = ["verdict", "failures", "strategy", "debugMode", "pushMode"] as const;
+const ROUTE_FIELDS = [
+  "verdict",
+  "failures",
+  "strategy",
+  "debugMode",
+  "pushMode",
+  "publish",
+] as const;
 type RouteField = (typeof ROUTE_FIELDS)[number];
 
 /** Exit code: a `--require`d field is missing or holds a value outside its set. */
@@ -179,6 +186,8 @@ function route(runs: WorkflowRun[], workflow: string, step: string | undefined,
     nextStrategy: null,
     debugMode: null,
     pushMode: null,
+    publish: null,
+    publishSource: null,
     debugAttempt: 0,
     parentSha: null,
   };
@@ -223,6 +232,8 @@ function route(runs: WorkflowRun[], workflow: string, step: string | undefined,
         value === "" ? `${field} not recorded` : `${field} "${value}" is not ${allowed.join("|")}`;
   }
 
+  problems.publish = "publish not resolved: needs --workflow=build with --prompt-file";
+
   const attempt = Number(lastRun(runs, workflow)?.debugAttempt ?? 0);
   out.debugAttempt = Number.isFinite(attempt) ? attempt : 0;
   return { out, problems };
@@ -255,6 +266,34 @@ export function debugStart(runs: WorkflowRun[], promptText: string, fixMax: numb
   };
 }
 
+const PUBLISH_TOKEN = /(?<![\w-])publish=(true|false)(?![\w-])/;
+
+/**
+ * Build's ending, from the session prompt, `bkit.workflows.build.publish` and the runtime.
+ * A `publish=true|false` token wins; else LOCAL reads `publish.local` and any other runtime
+ * `publish.remote`. A non-LOCAL `false` resolves `true`. No `runtime-resolved` row throws.
+ */
+export function publishRoute(
+  rows: StatusRow[],
+  promptText: string,
+  config: { remote: boolean; local: boolean },
+): { publish: boolean; publishSource: "token" | "local" | "remote" | "coerced" } {
+  const row = rows.filter((r) => r.type === "runtime-resolved" && r.workflow === "build").at(-1);
+  if (row === undefined)
+    throw new CommandError(
+      EXIT_ROUTE_MISSING,
+      "no runtime-resolved row for build: Step 2 never recorded the runtime",
+    );
+  const local = row.runtime === "LOCAL";
+  const token = PUBLISH_TOKEN.exec(promptText)?.[1];
+  const wanted = token !== undefined ? token === "true" : local ? config.local : config.remote;
+  if (!local && !wanted) return { publish: true, publishSource: "coerced" };
+  return {
+    publish: wanted,
+    publishSource: token !== undefined ? "token" : local ? "local" : "remote",
+  };
+}
+
 /** `--file`, else the debug status.jsonl `--fid` and `--month` name. */
 function routeFile(ctx: RunContext): string {
   if (ctx.flags.file !== undefined) return statusFile(ctx);
@@ -358,7 +397,7 @@ export const statusCommand: CommandSpec = {
         {
           name: "prompt-file",
           type: "string",
-          help: "debug only: the session prompt; decides this run's attempt, mode, repro and gates (a missing status.jsonl is a fresh run)",
+          help: "debug or build: the session prompt; debug: this run's attempt, mode, repro and gates (a missing status.jsonl is a fresh run); build: publish and publishSource",
         },
         { name: "fid", type: "string", help: "with --prompt-file, in place of --file: feature id" },
         { name: "month", type: "string", help: "with --prompt-file, in place of --file: YYYYMM" },
@@ -377,6 +416,10 @@ export const statusCommand: CommandSpec = {
         repro: "with --prompt-file: [repro] in the prompt",
         gates:
           "with --prompt-file: the gates to try, deepest first; [live=off] in the prompt drops the live gate",
+        publish:
+          "with --workflow=build and --prompt-file: whether the build publishes (a publish=true|false token, else publish.local on LOCAL or publish.remote elsewhere; a non-LOCAL false resolves true), else null",
+        publishSource:
+          "with publish: token | local | remote | coerced (a non-LOCAL false forced to true), else null",
         parentSha:
           "HEAD when the step's last DONE row in the active run was written — a build-group-start row's is the group's start commit, the base for `context diff` — or null",
       },
@@ -414,8 +457,8 @@ export const statusCommand: CommandSpec = {
           }
         }
         const promptFile = str(ctx.flags.promptFile);
-        if (promptFile !== undefined && ctx.flags.workflow !== "debug")
-          throw new CommandError(EXIT.USAGE, "--prompt-file is for --workflow=debug");
+        if (promptFile !== undefined && !["debug", "build"].includes(String(ctx.flags.workflow)))
+          throw new CommandError(EXIT.USAGE, "--prompt-file is for --workflow=debug or build");
         const file = routeFile(ctx);
         let promptText = "";
         if (promptFile !== undefined) {
@@ -433,9 +476,15 @@ export const statusCommand: CommandSpec = {
         );
         if (promptFile !== undefined) {
           const root = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
-          const fixMax = readBkitConfig(root).asks["debug.fix"].max;
-          Object.assign(out, debugStart(runs, promptText, fixMax));
-          delete problems.debugMode;
+          const config = readBkitConfig(root);
+          if (ctx.flags.workflow === "debug") {
+            Object.assign(out, debugStart(runs, promptText, config.asks["debug.fix"].max));
+            delete problems.debugMode;
+          } else {
+            const rows = fs.existsSync(file) ? readStatusRows(file) : [];
+            Object.assign(out, publishRoute(rows, promptText, config.buildPublish));
+            delete problems.publish;
+          }
         }
         ctx.emit(out);
         const failed = required.filter((r) => problems[r as RouteField] !== undefined);
diff --git a/.bkit/core/engine/commands/workflow/summary.test.ts b/.bkit/core/engine/commands/workflow/summary.test.ts
index ff9eee5a3..455233d0e 100644
--- a/.bkit/core/engine/commands/workflow/summary.test.ts
+++ b/.bkit/core/engine/commands/workflow/summary.test.ts
@@ -63,6 +63,38 @@ describe("buildSummary", () => {
     expect(s.markdown).toContain("## Recommended Next Step");
   });
 
+  it("writes Publish: held when publish is false", () => {
+    const s = buildSummary(input({ publish: false }));
+    expect(s.markdown).toMatch(/^Publish: held$/m);
+    expect(s.markdown).not.toMatch(/^Publish: pr$/m);
+  });
+
+  it("writes Publish: pr by default", () => {
+    for (const publish of [undefined, true]) {
+      const s = buildSummary(input({ publish }));
+      expect(s.markdown).toMatch(/^Publish: pr$/m);
+      expect(s.markdown).not.toContain("Publish: held");
+    }
+  });
+
+  it("writes Docs: not synced on a held summary", () => {
+    const held = buildSummary(input({ publish: false }));
+    expect(held.markdown).toContain("Docs: not synced (ship syncs on landing)");
+    expect(buildSummary(input({ publish: true })).markdown).not.toContain("Docs:");
+    expect(buildSummary(input({})).markdown).not.toContain("Docs:");
+  });
+
+  it("keeps the verdict and next step unchanged by publish", () => {
+    const held = buildSummary(input({ publish: false }));
+    const pr = buildSummary(input({ publish: true }));
+    expect(held.markdown).toContain("Publish: held");
+    expect(pr.markdown).toContain("Publish: pr");
+    expect(held.verdict).toBe(pr.verdict);
+    expect(held.nextStep).toBe(pr.nextStep);
+    expect(held.reasons).toEqual(pr.reasons);
+    expect(held.markdown.split("\n").slice(0, 3)).toEqual(pr.markdown.split("\n").slice(0, 3));
+  });
+
   it("a plan step's FAIL review answered by its apply step is CONCERNS, not FAIL", () => {
     const s = buildSummary(
       input({
diff --git a/.bkit/core/engine/commands/workflow/summary.ts b/.bkit/core/engine/commands/workflow/summary.ts
index a46b1b240..9f5989274 100644
--- a/.bkit/core/engine/commands/workflow/summary.ts
+++ b/.bkit/core/engine/commands/workflow/summary.ts
@@ -100,6 +100,8 @@ export interface SummaryInput {
   workstreams?: Workstream[];
   /** design: the organised design's text; its `## Risks & Open Questions` becomes `## Open Questions`. */
   organised?: string;
+  /** build: `false` = the run held (no push, no PR); absent or `true` = it publishes. */
+  publish?: boolean;
   /** ship: the PR's size; absent when `gh` could not read it. */
   pr?: { number: number; additions: number; deletions: number; changedFiles: number };
 }
@@ -283,6 +285,9 @@ export function buildSummary(input: SummaryInput): Summary {
       input.plans.length === 0
         ? "Plan tasks: no plan file."
         : `Plan tasks: ${tasks.filter((t) => t.done).length} of ${tasks.length} ticked in ${input.plans.map((p) => `\`${p.path}\``).join(", ")}.`,
+      "",
+      input.publish === false ? "Publish: held" : "Publish: pr",
+      ...(input.publish === false ? ["", "Docs: not synced (ship syncs on landing)"] : []),
     );
 
   out.push(
diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index 07963b63e..9c99628ac 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -2644,6 +2644,28 @@ describe("bkit workflows summary", () => {
       `--file=${path.join(cwd, SREL, "status.jsonl")}`,
     ]);
 
+  it("passes publish into the summary input", async () => {
+    const cwd = tree(
+      [done("build-plan-verify", "2020-01-01T00:10:00Z", { verdict: "PASS", failures: 0 })],
+      planOf(task(1, true)),
+    );
+    const md = () => fs.readFileSync(path.join(cwd, SREL, "build-summary.md"), "utf-8");
+    const base = [
+      "workflows",
+      "summary",
+      "--workflow=build",
+      `--file=${path.join(cwd, SREL, "status.jsonl")}`,
+    ];
+    expect((await run(cwd, [...base, "--publish=false"])).code).toBe(0);
+    expect(md()).toContain("Publish: held");
+    expect(md()).toContain("Docs: not synced");
+    expect((await run(cwd, [...base, "--publish=true"])).code).toBe(0);
+    expect(md()).toContain("Publish: pr");
+    expect((await run(cwd, base)).code).toBe(0);
+    expect(md()).toContain("Publish: pr");
+    expect((await run(cwd, [...base, "--publish=maybe"])).code).toBe(2);
+  });
+
   it("summary is FAIL when a plan task is not done", async () => {
     const cwd = tree(
       [done("build-plan-verify", "2020-01-01T00:10:00Z", { verdict: "PASS", failures: 0 })],
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index 5325e4785..ed444e471 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -1594,8 +1594,12 @@ function summaryVerb(ctx: RunContext): number {
       ? fs.readFileSync(organisedPath, "utf-8")
       : undefined;
   const prNumber = positiveInt(ctx.flags.pr, "pr");
+  const publishFlag = str(ctx.flags.publish);
+  if (publishFlag !== undefined && publishFlag !== "true" && publishFlag !== "false")
+    throw new CommandError(EXIT.USAGE, `--publish must be true or false, got ${publishFlag}`);
 
   const summary = buildSummary({
+    publish: publishFlag === undefined ? undefined : publishFlag === "true",
     workflow: workflow as SummaryWorkflow,
     fid,
     ref: refOf(fid, readIssueTracker(tree)),
@@ -2508,6 +2512,11 @@ export const workflowsCommand: CommandSpec = {
           type: "string",
           help: "ship: the PR number; its size comes from gh pr view (left out when gh cannot answer)",
         },
+        {
+          name: "publish",
+          type: "string",
+          help: "build: true|false, the resolved ending; false writes `Publish: held` and `Docs: not synced` (default true)",
+        },
       ],
       output: {
         verdict: "PASS | CONCERNS | FAIL",
diff --git a/dist/commands/workflow/status.js b/dist/commands/workflow/status.js
index 2a45eb1a4..94b4feb87 100644
--- a/dist/commands/workflow/status.js
+++ b/dist/commands/workflow/status.js
@@ -127,7 +127,14 @@ const VERDICTS = ["PASS", "CONCERNS", "FAIL"];
 const DEBUG_MODES = ["NORMAL", "SOAK"];
 const PUSH_MODES = ["PR", "LOCAL"];
 const STRATEGIES = ["STANDARD", "PIVOT", "FINAL"];
-const ROUTE_FIELDS = ["verdict", "failures", "strategy", "debugMode", "pushMode"];
+const ROUTE_FIELDS = [
+    "verdict",
+    "failures",
+    "strategy",
+    "debugMode",
+    "pushMode",
+    "publish",
+];
 /** Exit code: a `--require`d field is missing or holds a value outside its set. */
 export const EXIT_ROUTE_MISSING = 4;
 function route(runs, workflow, step, group) {
@@ -138,6 +145,8 @@ function route(runs, workflow, step, group) {
         nextStrategy: null,
         debugMode: null,
         pushMode: null,
+        publish: null,
+        publishSource: null,
         debugAttempt: 0,
         parentSha: null,
     };
@@ -185,6 +194,7 @@ function route(runs, workflow, step, group) {
             problems[field] =
                 value === "" ? `${field} not recorded` : `${field} "${value}" is not ${allowed.join("|")}`;
     }
+    problems.publish = "publish not resolved: needs --workflow=build with --prompt-file";
     const attempt = Number(lastRun(runs, workflow)?.debugAttempt ?? 0);
     out.debugAttempt = Number.isFinite(attempt) ? attempt : 0;
     return { out, problems };
@@ -214,6 +224,26 @@ export function debugStart(runs, promptText, fixMax) {
             : [...BKIT_DEBUG_GATES],
     };
 }
+const PUBLISH_TOKEN = /(?<![\w-])publish=(true|false)(?![\w-])/;
+/**
+ * Build's ending, from the session prompt, `bkit.workflows.build.publish` and the runtime.
+ * A `publish=true|false` token wins; else LOCAL reads `publish.local` and any other runtime
+ * `publish.remote`. A non-LOCAL `false` resolves `true`. No `runtime-resolved` row throws.
+ */
+export function publishRoute(rows, promptText, config) {
+    const row = rows.filter((r) => r.type === "runtime-resolved" && r.workflow === "build").at(-1);
+    if (row === undefined)
+        throw new CommandError(EXIT_ROUTE_MISSING, "no runtime-resolved row for build: Step 2 never recorded the runtime");
+    const local = row.runtime === "LOCAL";
+    const token = PUBLISH_TOKEN.exec(promptText)?.[1];
+    const wanted = token !== undefined ? token === "true" : local ? config.local : config.remote;
+    if (!local && !wanted)
+        return { publish: true, publishSource: "coerced" };
+    return {
+        publish: wanted,
+        publishSource: token !== undefined ? "token" : local ? "local" : "remote",
+    };
+}
 /** `--file`, else the debug status.jsonl `--fid` and `--month` name. */
 function routeFile(ctx) {
     if (ctx.flags.file !== undefined)
@@ -311,7 +341,7 @@ export const statusCommand = {
                 {
                     name: "prompt-file",
                     type: "string",
-                    help: "debug only: the session prompt; decides this run's attempt, mode, repro and gates (a missing status.jsonl is a fresh run)",
+                    help: "debug or build: the session prompt; debug: this run's attempt, mode, repro and gates (a missing status.jsonl is a fresh run); build: publish and publishSource",
                 },
                 { name: "fid", type: "string", help: "with --prompt-file, in place of --file: feature id" },
                 { name: "month", type: "string", help: "with --prompt-file, in place of --file: YYYYMM" },
@@ -326,6 +356,8 @@ export const statusCommand = {
                 debugAttempt: "debugAttempt of the active run (0 when unset); with --prompt-file, this invocation's run number (a resume keeps its number)",
                 repro: "with --prompt-file: [repro] in the prompt",
                 gates: "with --prompt-file: the gates to try, deepest first; [live=off] in the prompt drops the live gate",
+                publish: "with --workflow=build and --prompt-file: whether the build publishes (a publish=true|false token, else publish.local on LOCAL or publish.remote elsewhere; a non-LOCAL false resolves true), else null",
+                publishSource: "with publish: token | local | remote | coerced (a non-LOCAL false forced to true), else null",
                 parentSha: "HEAD when the step's last DONE row in the active run was written — a build-group-start row's is the group's start commit, the base for `context diff` — or null",
             },
             exitCodes: {
@@ -355,8 +387,8 @@ export const statusCommand = {
                     }
                 }
                 const promptFile = str(ctx.flags.promptFile);
-                if (promptFile !== undefined && ctx.flags.workflow !== "debug")
-                    throw new CommandError(EXIT.USAGE, "--prompt-file is for --workflow=debug");
+                if (promptFile !== undefined && !["debug", "build"].includes(String(ctx.flags.workflow)))
+                    throw new CommandError(EXIT.USAGE, "--prompt-file is for --workflow=debug or build");
                 const file = routeFile(ctx);
                 let promptText = "";
                 if (promptFile !== undefined) {
@@ -369,9 +401,16 @@ export const statusCommand = {
                 const { out, problems } = route(runs, String(ctx.flags.workflow), step, positiveInt(ctx.flags.group, "group"));
                 if (promptFile !== undefined) {
                     const root = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
-                    const fixMax = readBkitConfig(root).asks["debug.fix"].max;
-                    Object.assign(out, debugStart(runs, promptText, fixMax));
-                    delete problems.debugMode;
+                    const config = readBkitConfig(root);
+                    if (ctx.flags.workflow === "debug") {
+                        Object.assign(out, debugStart(runs, promptText, config.asks["debug.fix"].max));
+                        delete problems.debugMode;
+                    }
+                    else {
+                        const rows = fs.existsSync(file) ? readStatusRows(file) : [];
+                        Object.assign(out, publishRoute(rows, promptText, config.buildPublish));
+                        delete problems.publish;
+                    }
                 }
                 ctx.emit(out);
                 const failed = required.filter((r) => problems[r] !== undefined);
diff --git a/dist/commands/workflow/summary.js b/dist/commands/workflow/summary.js
index 2fb0e4284..27024e7b6 100644
--- a/dist/commands/workflow/summary.js
+++ b/dist/commands/workflow/summary.js
@@ -208,7 +208,7 @@ export function buildSummary(input) {
     if (workflow === "build")
         out.push("", input.plans.length === 0
             ? "Plan tasks: no plan file."
-            : `Plan tasks: ${tasks.filter((t) => t.done).length} of ${tasks.length} ticked in ${input.plans.map((p) => `\`${p.path}\``).join(", ")}.`);
+            : `Plan tasks: ${tasks.filter((t) => t.done).length} of ${tasks.length} ticked in ${input.plans.map((p) => `\`${p.path}\``).join(", ")}.`, "", input.publish === false ? "Publish: held" : "Publish: pr", ...(input.publish === false ? ["", "Docs: not synced (ship syncs on landing)"] : []));
     out.push("", "## Steps", "", "| Step | Verdict | Failures | Attempts | Artifact |", "| --- | --- | --- | --- | --- |");
     for (const g of groups) {
         const { row } = lastOf(g);
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index 186a5d8bb..b05f2d2cb 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -1263,7 +1263,11 @@ function summaryVerb(ctx) {
         ? fs.readFileSync(organisedPath, "utf-8")
         : undefined;
     const prNumber = positiveInt(ctx.flags.pr, "pr");
+    const publishFlag = str(ctx.flags.publish);
+    if (publishFlag !== undefined && publishFlag !== "true" && publishFlag !== "false")
+        throw new CommandError(EXIT.USAGE, `--publish must be true or false, got ${publishFlag}`);
     const summary = buildSummary({
+        publish: publishFlag === undefined ? undefined : publishFlag === "true",
         workflow: workflow,
         fid,
         ref: refOf(fid, readIssueTracker(tree)),
@@ -2113,6 +2117,11 @@ export const workflowsCommand = {
                     type: "string",
                     help: "ship: the PR number; its size comes from gh pr view (left out when gh cannot answer)",
                 },
+                {
+                    name: "publish",
+                    type: "string",
+                    help: "build: true|false, the resolved ending; false writes `Publish: held` and `Docs: not synced` (default true)",
+                },
             ],
             output: {
                 verdict: "PASS | CONCERNS | FAIL",
