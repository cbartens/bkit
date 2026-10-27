diff --git a/.bkit/core/engine/commands/workflow/tasks.test.ts b/.bkit/core/engine/commands/workflow/tasks.test.ts
index 9bd6ae0ab..bf1402816 100644
--- a/.bkit/core/engine/commands/workflow/tasks.test.ts
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -1,11 +1,15 @@
 /**
- * commands/workflow/tasks.test.ts — `bkit tasks`: the plan tick and the group's open set.
+ * commands/workflow/tasks.test.ts — `bkit tasks`: the plan tick, the group's open set
+ * and the path / symbol match against landed changes.
  *
  * Each test writes a plan and (for `open`) an execute log in a temp folder and reads
  * the command's one output object; the plan file's other lines are compared byte for
- * byte, because the tick rewrites one heading line and nothing else.
+ * byte, because the tick rewrites one heading line and nothing else. `currency` runs
+ * against a real temp git repo: the commit range is its subject, so a stub diff would
+ * test nothing.
  */
 
+import { spawnSync } from "node:child_process";
 import * as fs from "node:fs";
 import * as os from "node:os";
 import * as path from "node:path";
@@ -70,6 +74,46 @@ const write = (name: string, text: string) => {
 };
 const read = (file: string) => fs.readFileSync(file, "utf-8");
 
+/** git in a fixture repo; a non-zero exit is the fixture's bug, so it throws. */
+const git = (repo: string, ...args: string[]) => {
+  const r = spawnSync("git", ["-c", "user.email=t@t", "-c", "user.name=t", ...args], {
+    cwd: repo,
+    encoding: "utf-8",
+  });
+  if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
+  return (r.stdout ?? "").trim();
+};
+const writeIn = (repo: string, rel: string, body: string) => {
+  const abs = path.join(repo, rel);
+  fs.mkdirSync(path.dirname(abs), { recursive: true });
+  fs.writeFileSync(abs, body);
+};
+const commit = (repo: string, message: string) => {
+  git(repo, "add", "-A");
+  git(repo, "commit", "-q", "-m", message);
+  return git(repo, "rev-parse", "HEAD");
+};
+/** A fixture repo on `main` holding `files`, its first commit made. */
+const repo = (files: Record<string, string>) => {
+  const d = tmp();
+  git(d, "init", "-q", "-b", "main");
+  for (const [rel, body] of Object.entries(files)) writeIn(d, rel, body);
+  commit(d, "base");
+  return d;
+};
+/** A plan whose one task refs `refs` as `` `symbol` in `file`: what `` UPDATE lines. */
+const refPlan = (...refs: string[]) =>
+  planText(
+    group(1, [
+      "<!-- bkit:task 4 start -->",
+      "- [ ] **TASK 4:** Currency task.",
+      ...refs.map((r) => `  - **UPDATE:** ${r}`),
+      "  - **DONE WHEN:** done",
+      "  - **TEST FIRST:** n/a — docs only",
+      "<!-- bkit:task 4 end -->",
+    ]),
+  );
+
 async function run(argv: string[]) {
   const out: string[] = [];
   const err: string[] = [];
@@ -231,3 +275,87 @@ describe("bkit tasks open", () => {
     expect(r.err).toMatch(/no task markers/);
   });
 });
+
+describe("bkit tasks currency", () => {
+  it("currency matches a task on a moved symbol", async () => {
+    cwd = repo({ "src/money.ts": "export const price = 1;\n" });
+    const base = git(cwd, "rev-parse", "HEAD");
+    writeIn(cwd, "src/money.ts", "export const total = 1;\n");
+    commit(cwd, "rename price to total");
+    const plan = write(
+      "currency-symbol.md",
+      refPlan("`total` in `src/money.ts`: renamed from price"),
+    );
+    const r = await run(["currency", `--plan=${plan}`, `--base=${base}`, "--against=HEAD"]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks.map((t: { task: number }) => t.task)).toEqual([4]);
+    expect(r.json.tasks[0].paths).toEqual(["src/money.ts"]);
+    expect(r.json.tasks[0].needles).toEqual(["total"]);
+    expect(r.json.tasks[0].hunks.join("\n")).toContain("total");
+  });
+
+  it("currency emits no hunk outside the matched set", async () => {
+    cwd = repo({
+      "src/matched.ts": "export const alpha = 1;\n",
+      "src/other.ts": "export const beta = 1;\n",
+    });
+    const base = git(cwd, "rev-parse", "HEAD");
+    writeIn(cwd, "src/matched.ts", "export const alpha = 2;\n");
+    writeIn(cwd, "src/other.ts", "export const beta = 2;\n");
+    commit(cwd, "both change");
+    const plan = write("currency-hunks.md", refPlan("`alpha` in `src/matched.ts`: value changed"));
+    const r = await run(["currency", `--plan=${plan}`, `--base=${base}`, "--against=HEAD"]);
+    expect(r.code).toBe(0);
+    const hunks = r.json.tasks[0].hunks.join("\n");
+    expect(hunks).toContain("src/matched.ts");
+    expect(hunks).not.toContain("src/other.ts");
+  });
+
+  it("currency refuses a plan with no task blocks", async () => {
+    cwd = repo({ "src/x.ts": "x\n" });
+    const plan = write("currency-plain.md", "# Plan\n\nNo task blocks here.\n");
+    const r = await run(["currency", `--plan=${plan}`]);
+    expect(r.code).toBe(1);
+    expect(r.err).toMatch(/no task markers/);
+  });
+
+  it("currency exits 0 with no hunks when no task matches", async () => {
+    cwd = repo({ "src/untouched.ts": "one\n", "src/elsewhere.ts": "one\n" });
+    const base = git(cwd, "rev-parse", "HEAD");
+    writeIn(cwd, "src/elsewhere.ts", "two\n");
+    commit(cwd, "elsewhere changed");
+    const plan = write(
+      "currency-nomatch.md",
+      refPlan("`absent` in `src/untouched.ts`: nothing moved"),
+    );
+    const r = await run(["currency", `--plan=${plan}`, `--base=${base}`, "--against=HEAD"]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks).toEqual([]);
+  });
+
+  it("currency judges base...against (origin/dev), not base...HEAD", async () => {
+    cwd = repo({
+      "src/base.ts": "base\n",
+      "src/dev-moved.ts": "one\n",
+      "src/branch-moved.ts": "one\n",
+    });
+    const base = git(cwd, "rev-parse", "HEAD");
+    git(cwd, "checkout", "-q", "-b", "dev");
+    writeIn(cwd, "src/dev-moved.ts", "two\n");
+    commit(cwd, "dev moves");
+    git(cwd, "checkout", "-q", "-b", "feature", base);
+    writeIn(cwd, "src/branch-moved.ts", "two\n");
+    commit(cwd, "branch moves");
+    const plan = write(
+      "currency-range.md",
+      refPlan(
+        "`devMoved` in `src/dev-moved.ts`: moved on dev",
+        "`branchMoved` in `src/branch-moved.ts`: moved on the branch",
+      ),
+    );
+    const r = await run(["currency", `--plan=${plan}`, `--base=${base}`, "--against=dev"]);
+    expect(r.code).toBe(0);
+    expect(r.json.tasks[0].paths).toEqual(["src/dev-moved.ts"]);
+    expect(r.json.tasks[0].hunks.join("\n")).not.toContain("branch-moved");
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/tasks.ts b/.bkit/core/engine/commands/workflow/tasks.ts
index e57d9754b..74825d5e2 100644
--- a/.bkit/core/engine/commands/workflow/tasks.ts
+++ b/.bkit/core/engine/commands/workflow/tasks.ts
@@ -6,13 +6,25 @@
 // task already ticked is not rewritten and never repeated in `ticked`. `--green` reads a
 // `bkit tests green` report and drops every task it gaps, so a group's gap-free tasks
 // tick without the caller re-reading the report.
+//
+// `open` reads the execute log for the group's `DONE` / `BLOCKED` lines; `currency`
+// matches each task's `CREATE` / `READ` / `UPDATE` / `DELETE` paths and symbols against
+// `{base}...{against}` and prints the matched paths, needles and diff hunks — the
+// mechanical half of the plan-currency judgement, which stays with the agent.
 
 import * as fs from "node:fs";
 import * as path from "node:path";
 
 import { parseJson } from "../../shared/json.js";
-import { CommandError, EXIT, type CommandSpec } from "../lib.js";
-import { parsePlanBlocks, type PlanGroup, type PlanTaskBlock } from "./plan-blocks.js";
+import { CommandError, EXIT, type CommandSpec, git, runGit } from "../lib.js";
+import { EXIT_DIFF_FAILED, fetchRemoteRef } from "./branches.js";
+import { DIFF_BASE } from "./context.js";
+import {
+  parsePlanBlocks,
+  type PlanGroup,
+  type PlanRef,
+  type PlanTaskBlock,
+} from "./plan-blocks.js";
 import { positiveInt, str } from "./status.js";
 import { NO_MARKERS_REASON, doneTasks } from "./tests.js";
 
@@ -96,6 +108,31 @@ function headBox(lines: string[], task: PlanTaskBlock): { index: number; ticked:
   return null;
 }
 
+/** The refs a task names: its four path-and-symbol fields. */
+const taskRefs = (task: PlanTaskBlock): PlanRef[] => [
+  ...task.create,
+  ...task.read,
+  ...task.update,
+  ...task.delete,
+];
+
+/**
+ * A plan symbol as a `git diff -S` needle: a Markdown section's heading text, a flag,
+ * or the leading identifier of an applied symbol (`doneTasks(log, verbs)` -> `doneTasks`).
+ */
+export function needleOf(symbol: string): string | undefined {
+  const s = symbol.trim();
+  if (s === "") return undefined;
+  const heading = /^§\s*(.+)$/.exec(s);
+  if (heading) return heading[1]!.trim();
+  const token = /^(--?[\w-]+|[A-Za-z_$][\w$]*)/.exec(s)?.[0];
+  if (token === undefined) return s;
+  return /^[A-Za-z_$][\w$]*\s*[(\[]/.test(s) || token === s ? token : s;
+}
+
+/** `paths` as git printed them, split on NUL; empty output is no path. */
+const splitPaths = (stdout: string): string[] => stdout.split("\0").filter(Boolean);
+
 export const tasksCommand: CommandSpec = {
   noun: "tasks",
   summary: "Tick a plan's task boxes, from the tasks a verify judged satisfied.",
@@ -232,5 +269,124 @@ export const tasksCommand: CommandSpec = {
         return EXIT.OK;
       },
     },
+    currency: {
+      summary:
+        "Print each task whose CREATE / READ / UPDATE / DELETE paths or symbols moved between --base and --against, with its matched paths, needles and diff hunks; exit 0 (including no match), 1 a plan with no task blocks, 2 a bad plan.",
+      flags: [
+        {
+          name: "plan",
+          type: "string",
+          required: true,
+          help: "plan file holding the task blocks",
+        },
+        {
+          name: "base",
+          type: "string",
+          help: "the commit the plan was written against (default origin/dev)",
+        },
+        {
+          name: "against",
+          type: "string",
+          help: "the commit landed changes are judged on (default origin/dev)",
+        },
+      ],
+      output: {
+        plan: "the plan file read, as given",
+        base: "the commit the plan was written against",
+        against: "the commit landed changes were judged on",
+        tasks:
+          "each matched task ({task, group, paths, needles, hunks}): the changed paths and the needles that moved, and the diff over those paths only",
+      },
+      exitCodes: {
+        [EXIT_DIFF_FAILED]: "--base or --against does not resolve, or git diff failed",
+      },
+      run: (ctx) => {
+        const planArg = String(ctx.flags.plan);
+        const base = str(ctx.flags.base) ?? DIFF_BASE;
+        const against = str(ctx.flags.against) ?? DIFF_BASE;
+        if (base === "") throw new CommandError(EXIT.USAGE, "--base must be non-empty");
+        if (against === "") throw new CommandError(EXIT.USAGE, "--against must be non-empty");
+        const plan = readPlan(ctx.cwd, planArg);
+        const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]);
+        if (top === null)
+          throw new CommandError(EXIT.USAGE, `not inside a git work tree: ${ctx.cwd}`);
+        for (const ref of [base, against]) {
+          const fetched = fetchRemoteRef(top, ref);
+          if (fetched !== null && !fetched.ok)
+            ctx.log(
+              `git fetch for ${ref} failed — judging against the last fetch: ${fetched.stderr}`,
+            );
+          if (git(top, ["rev-parse", "-q", "--verify", `${ref}^{commit}`]) === null)
+            throw new CommandError(EXIT_DIFF_FAILED, `${ref} does not resolve to a commit`);
+        }
+        const range = `${base}...${against}`;
+        const changed = runGit(top, ["diff", "--name-only", "-z", "--no-renames", range]);
+        if (!changed.ok)
+          throw new CommandError(EXIT_DIFF_FAILED, `git diff ${range} failed: ${changed.stderr}`);
+        const changedPaths = splitPaths(changed.stdout);
+        const needleCache = new Map<string, string[]>();
+        /** The paths `needle` moved in, read once per needle. */
+        const needleMoves = (needle: string): string[] => {
+          const cached = needleCache.get(needle);
+          if (cached !== undefined) return cached;
+          const diff = runGit(top, [
+            "diff",
+            "--no-renames",
+            "-S",
+            needle,
+            "--name-only",
+            "-z",
+            range,
+          ]);
+          if (!diff.ok)
+            throw new CommandError(
+              EXIT_DIFF_FAILED,
+              `git diff ${range} -S${needle} failed: ${diff.stderr}`,
+            );
+          const paths = splitPaths(diff.stdout);
+          needleCache.set(needle, paths);
+          return paths;
+        };
+        const tasks: Array<{
+          task: number;
+          group: number;
+          paths: string[];
+          needles: string[];
+          hunks: string[];
+        }> = [];
+        for (const task of plan.tasks) {
+          const refs = taskRefs(task);
+          const files = [...new Set(refs.map((r) => r.file.trim()).filter((f) => f !== ""))];
+          const paths = changedPaths.filter((p) =>
+            files.some((f) => p === f || p.startsWith(`${f}/`)),
+          );
+          const needles: string[] = [];
+          for (const ref of refs) {
+            if (ref.symbol === undefined) continue;
+            const needle = needleOf(ref.symbol);
+            if (needle === undefined || needles.includes(needle)) continue;
+            if (needleMoves(needle).length > 0) needles.push(needle);
+          }
+          const matched =
+            paths.length > 0
+              ? paths
+              : [...new Set(needles.flatMap((needle) => needleMoves(needle)))].sort();
+          if (matched.length === 0) continue;
+          const diff = runGit(top, ["diff", "--no-renames", range, "--", ...matched]);
+          if (!diff.ok)
+            throw new CommandError(EXIT_DIFF_FAILED, `git diff ${range} failed: ${diff.stderr}`);
+          tasks.push({
+            task: task.task,
+            group: task.group,
+            paths: matched,
+            needles,
+            hunks: diff.stdout === "" ? [] : diff.stdout.split("\n"),
+          });
+        }
+        for (const t of tasks) ctx.log(`TASK ${t.task}: ${t.paths.join(", ")}`);
+        ctx.emit({ plan: planArg, base, against, tasks });
+        return EXIT.OK;
+      },
+    },
   },
 };
diff --git a/.bkit/core/prompts/bkit-build-plan-current.md b/.bkit/core/prompts/bkit-build-plan-current.md
index 97f4e8d80..cd73dc850 100644
--- a/.bkit/core/prompts/bkit-build-plan-current.md
+++ b/.bkit/core/prompts/bkit-build-plan-current.md
@@ -55,11 +55,11 @@ autoCompactWindow: 300000
 2. Re-read all supplied inputs once at session start; do not trust session memory.
 3. Read `.agents/docs.md` → load docs for workflow / step / task; skip missing.
 4. Update **Create** after each affected task — append log at EOF via Bash `echo {log entry} >> {output}`; heredoc for multi-line. **If** any task `Broken` → set `Verdict` = `FAIL` via `Edit` immediately; do not defer to final pass.
-5. Per plan task block, record paths, symbols, and commands its `CREATE` / `READ` / `UPDATE` / `DELETE` and `DONE WHEN` fields depend on → in-scope set.
-6. Run `git diff --name-only {BASE_SHA}..origin/dev` → changed-path list. Task matches on any in-scope path in that list. For each task with no path match run `git diff {BASE_SHA}..origin/dev -S{needle} --name-only` per in-scope symbol and command; non-empty output → matched on that needle:
-   - **If** no tasks match → no affected tasks; do not read any diff.
-   - **Else** → continue with matched tasks only.
-7. Per matched task, run `git diff {BASE_SHA}..origin/dev -- {path}` for its matched paths and read it; needle match → paths named by that needle `-S` output; never diff whole range; never read paths outside match set.
+5. Per plan task block, record the paths, symbols, and commands its `CREATE` / `READ` / `UPDATE` / `DELETE` and `DONE WHEN` fields depend on → in-scope set.
+6. Run `bkit tasks currency --plan={plan file} --base={BASE_SHA} --against=origin/dev` → each task whose in-scope path or symbol moved in `{BASE_SHA}...origin/dev`, with its matched paths, needles and diff hunks:
+   - **If** no task is printed → no affected tasks; do not read any diff.
+   - **Else** → continue with the printed tasks only.
+7. Read the diff hunks `currency` printed for each matched task; never read a path outside its matched set.
 8. Per matched task, decide against diff — `Executable` tasks are not findings and are not logged:
    - `Executable` = landed changes leave task approach intact.
    - `Reword` = task approach holds; paths, symbols, or commands task names have moved and wording no longer matches.
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 93cac8d19..1aa460ff4 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -7643,10 +7643,11 @@ Run the supplied check command. **If** it exits non-zero → fix each problem it
 ```text
 **Role:** Senior reviewer judging whether changes landed since the plan was written leave it executable.
 **Evidence not distance:** Commit count and elapsed time never carry verdict; tasks are affected only where named paths, symbols, signatures, or contracts they depend on moved.
-[R20] Run `git diff --name-only {BASE_SHA}..origin/dev` → changed-path list. Task matches on any in-scope path in that list. For each task with no path match run `git diff {BASE_SHA}..origin/dev -S{needle} --name-only` per in-scope symbol and command; non-empty output → matched on that needle:
-[R22] **If** no tasks match → no affected tasks; do not read any diff.
-**Else** → continue with matched tasks only.
-[R22] Per matched task, run `git diff {BASE_SHA}..origin/dev -- {path}` for its matched paths and read it; needle match → paths named by that needle `-S` output; never diff whole range; never read paths outside match set.
+Per plan task block, record the paths, symbols, and commands its `CREATE` / `READ` / `UPDATE` / `DELETE` and `DONE WHEN` fields depend on → in-scope set.
+[R20] Run `bkit tasks currency --plan={plan file} --base={BASE_SHA} --against=origin/dev` → each task whose in-scope path or symbol moved in `{BASE_SHA}...origin/dev`, with its matched paths, needles and diff hunks:
+**If** no task is printed → no affected tasks; do not read any diff.
+**Else** → continue with the printed tasks only.
+[R22] Read the diff hunks `currency` printed for each matched task; never read a path outside its matched set.
 Per matched task, decide against diff — `Executable` tasks are not findings and are not logged:
 `Executable` = landed changes leave task approach intact.
 `Reword` = task approach holds; paths, symbols, or commands task names have moved and wording no longer matches.
@@ -7656,7 +7657,6 @@ Per finding, all four required: task name, `class` (`Reword|Broken`), landed cha
 `PASS` = no affected tasks.
 `CONCERNS` = any `Reword` tasks, none `Broken`.
 `FAIL` = any `Broken` tasks.
-Per plan task block, record paths, symbols, and commands its `CREATE` / `READ` / `UPDATE` / `DELETE` and `DONE WHEN` fields depend on → in-scope set.
 ```
 
 #### bkit-build-plan-execute
diff --git a/dist/commands/workflow/tasks.js b/dist/commands/workflow/tasks.js
index bb884c9d8..7862285da 100644
--- a/dist/commands/workflow/tasks.js
+++ b/dist/commands/workflow/tasks.js
@@ -6,11 +6,18 @@
 // task already ticked is not rewritten and never repeated in `ticked`. `--green` reads a
 // `bkit tests green` report and drops every task it gaps, so a group's gap-free tasks
 // tick without the caller re-reading the report.
+//
+// `open` reads the execute log for the group's `DONE` / `BLOCKED` lines; `currency`
+// matches each task's `CREATE` / `READ` / `UPDATE` / `DELETE` paths and symbols against
+// `{base}...{against}` and prints the matched paths, needles and diff hunks — the
+// mechanical half of the plan-currency judgement, which stays with the agent.
 import * as fs from "node:fs";
 import * as path from "node:path";
 import { parseJson } from "../../shared/json.js";
-import { CommandError, EXIT } from "../lib.js";
-import { parsePlanBlocks } from "./plan-blocks.js";
+import { CommandError, EXIT, git, runGit } from "../lib.js";
+import { EXIT_DIFF_FAILED, fetchRemoteRef } from "./branches.js";
+import { DIFF_BASE } from "./context.js";
+import { parsePlanBlocks, } from "./plan-blocks.js";
 import { positiveInt, str } from "./status.js";
 import { NO_MARKERS_REASON, doneTasks } from "./tests.js";
 /** A task's heading line: the box and the number the tick addresses. */
@@ -76,6 +83,31 @@ function headBox(lines, task) {
     }
     return null;
 }
+/** The refs a task names: its four path-and-symbol fields. */
+const taskRefs = (task) => [
+    ...task.create,
+    ...task.read,
+    ...task.update,
+    ...task.delete,
+];
+/**
+ * A plan symbol as a `git diff -S` needle: a Markdown section's heading text, a flag,
+ * or the leading identifier of an applied symbol (`doneTasks(log, verbs)` -> `doneTasks`).
+ */
+export function needleOf(symbol) {
+    const s = symbol.trim();
+    if (s === "")
+        return undefined;
+    const heading = /^§\s*(.+)$/.exec(s);
+    if (heading)
+        return heading[1].trim();
+    const token = /^(--?[\w-]+|[A-Za-z_$][\w$]*)/.exec(s)?.[0];
+    if (token === undefined)
+        return s;
+    return /^[A-Za-z_$][\w$]*\s*[(\[]/.test(s) || token === s ? token : s;
+}
+/** `paths` as git printed them, split on NUL; empty output is no path. */
+const splitPaths = (stdout) => stdout.split("\0").filter(Boolean);
 export const tasksCommand = {
     noun: "tasks",
     summary: "Tick a plan's task boxes, from the tasks a verify judged satisfied.",
@@ -216,5 +248,116 @@ export const tasksCommand = {
                 return EXIT.OK;
             },
         },
+        currency: {
+            summary: "Print each task whose CREATE / READ / UPDATE / DELETE paths or symbols moved between --base and --against, with its matched paths, needles and diff hunks; exit 0 (including no match), 1 a plan with no task blocks, 2 a bad plan.",
+            flags: [
+                {
+                    name: "plan",
+                    type: "string",
+                    required: true,
+                    help: "plan file holding the task blocks",
+                },
+                {
+                    name: "base",
+                    type: "string",
+                    help: "the commit the plan was written against (default origin/dev)",
+                },
+                {
+                    name: "against",
+                    type: "string",
+                    help: "the commit landed changes are judged on (default origin/dev)",
+                },
+            ],
+            output: {
+                plan: "the plan file read, as given",
+                base: "the commit the plan was written against",
+                against: "the commit landed changes were judged on",
+                tasks: "each matched task ({task, group, paths, needles, hunks}): the changed paths and the needles that moved, and the diff over those paths only",
+            },
+            exitCodes: {
+                [EXIT_DIFF_FAILED]: "--base or --against does not resolve, or git diff failed",
+            },
+            run: (ctx) => {
+                const planArg = String(ctx.flags.plan);
+                const base = str(ctx.flags.base) ?? DIFF_BASE;
+                const against = str(ctx.flags.against) ?? DIFF_BASE;
+                if (base === "")
+                    throw new CommandError(EXIT.USAGE, "--base must be non-empty");
+                if (against === "")
+                    throw new CommandError(EXIT.USAGE, "--against must be non-empty");
+                const plan = readPlan(ctx.cwd, planArg);
+                const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]);
+                if (top === null)
+                    throw new CommandError(EXIT.USAGE, `not inside a git work tree: ${ctx.cwd}`);
+                for (const ref of [base, against]) {
+                    const fetched = fetchRemoteRef(top, ref);
+                    if (fetched !== null && !fetched.ok)
+                        ctx.log(`git fetch for ${ref} failed — judging against the last fetch: ${fetched.stderr}`);
+                    if (git(top, ["rev-parse", "-q", "--verify", `${ref}^{commit}`]) === null)
+                        throw new CommandError(EXIT_DIFF_FAILED, `${ref} does not resolve to a commit`);
+                }
+                const range = `${base}...${against}`;
+                const changed = runGit(top, ["diff", "--name-only", "-z", "--no-renames", range]);
+                if (!changed.ok)
+                    throw new CommandError(EXIT_DIFF_FAILED, `git diff ${range} failed: ${changed.stderr}`);
+                const changedPaths = splitPaths(changed.stdout);
+                const needleCache = new Map();
+                /** The paths `needle` moved in, read once per needle. */
+                const needleMoves = (needle) => {
+                    const cached = needleCache.get(needle);
+                    if (cached !== undefined)
+                        return cached;
+                    const diff = runGit(top, [
+                        "diff",
+                        "--no-renames",
+                        "-S",
+                        needle,
+                        "--name-only",
+                        "-z",
+                        range,
+                    ]);
+                    if (!diff.ok)
+                        throw new CommandError(EXIT_DIFF_FAILED, `git diff ${range} -S${needle} failed: ${diff.stderr}`);
+                    const paths = splitPaths(diff.stdout);
+                    needleCache.set(needle, paths);
+                    return paths;
+                };
+                const tasks = [];
+                for (const task of plan.tasks) {
+                    const refs = taskRefs(task);
+                    const files = [...new Set(refs.map((r) => r.file.trim()).filter((f) => f !== ""))];
+                    const paths = changedPaths.filter((p) => files.some((f) => p === f || p.startsWith(`${f}/`)));
+                    const needles = [];
+                    for (const ref of refs) {
+                        if (ref.symbol === undefined)
+                            continue;
+                        const needle = needleOf(ref.symbol);
+                        if (needle === undefined || needles.includes(needle))
+                            continue;
+                        if (needleMoves(needle).length > 0)
+                            needles.push(needle);
+                    }
+                    const matched = paths.length > 0
+                        ? paths
+                        : [...new Set(needles.flatMap((needle) => needleMoves(needle)))].sort();
+                    if (matched.length === 0)
+                        continue;
+                    const diff = runGit(top, ["diff", "--no-renames", range, "--", ...matched]);
+                    if (!diff.ok)
+                        throw new CommandError(EXIT_DIFF_FAILED, `git diff ${range} failed: ${diff.stderr}`);
+                    tasks.push({
+                        task: task.task,
+                        group: task.group,
+                        paths: matched,
+                        needles,
+                        hunks: diff.stdout === "" ? [] : diff.stdout.split("\n"),
+                    });
+                }
+                for (const t of tasks)
+                    ctx.log(`TASK ${t.task}: ${t.paths.join(", ")}`);
+                ctx.emit({ plan: planArg, base, against, tasks });
+                return EXIT.OK;
+            },
+        },
     },
 };
