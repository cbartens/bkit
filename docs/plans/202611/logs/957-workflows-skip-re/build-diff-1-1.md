diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index bca5a0008..17e2f32b2 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -367,7 +367,7 @@ Tick a plan's task boxes, from the tasks a verify judged satisfied.
 <!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
-| `tick` | workflow | **`--plan`** **`--group`** `--tasks` `--green` | Tick the named tasks of one task group, less those a `tests green` report gaps; exit 0 ticked (including none), 1 a plan with no task blocks, 2 a bad flag value or plan. |
+| `tick` | workflow | **`--plan`** **`--group`** `--tasks` `--decision` `--green` | Tick the named tasks of one task group, less those a `tests green` report gaps; exit 0 ticked (including none), 1 a plan with no task blocks, 2 a bad flag value or plan. |
 | `open` | by hand | **`--plan`** **`--group`** **`--log`** | Print the group's tasks holding neither a `DONE` nor a `BLOCKED` line in the plan-execute log, and whether any is open; exit 0 (including none), 1 a plan with no task blocks, 2 a missing file or group. |
 | `currency` | by hand | **`--plan`** `--base` `--against` | Print each task whose CREATE / READ / UPDATE / DELETE paths or symbols moved between --base and --against, with its matched paths, needles and diff hunks (run logs under docs/plans/*/logs/ are left out); exit 0 (including no match), 1 a plan with no task blocks, 2 a bad plan. |
 
diff --git a/.bkit/core/engine/commands/workflow/step-table.test.ts b/.bkit/core/engine/commands/workflow/step-table.test.ts
index 37e9653c1..4b3bedbed 100644
--- a/.bkit/core/engine/commands/workflow/step-table.test.ts
+++ b/.bkit/core/engine/commands/workflow/step-table.test.ts
@@ -362,6 +362,36 @@ describe("bkit status resume", () => {
     });
   });
 
+  it("a continue decision after a holistic round resumes at Build Challenge", async () => {
+    for (const prior of ["build-plan-verify-holistic", "build-plan-gaps-remediate-holistic"]) {
+      const file = log([
+        ...setUp("build"),
+        done("build", prior, { verdict: "FAIL" }),
+        done("build", "build-decision", { route: "continue" }),
+      ]);
+      expect((await resume("build", file)).json).toMatchObject({
+        step: "build-challenge",
+        number: 11,
+        after: "build-decision",
+      });
+    }
+  });
+
+  it("a continue decision after a group verify resumes at Plan Execute", async () => {
+    for (const prior of ["build-plan-verify", "build-group-gate", "build-plan-gaps-remediate"]) {
+      const file = log([
+        ...setUp("build"),
+        done("build", prior, { verdict: "FAIL", group: 1 }),
+        done("build", "build-decision", { route: "continue" }),
+      ]);
+      expect((await resume("build", file)).json).toMatchObject({
+        step: "build-plan-tasks",
+        number: 7,
+        after: "build-decision",
+      });
+    }
+  });
+
   it("challengeDone is true once a round-2 challenge has merged", async () => {
     const doneOf = async (rows: object[]) => (await resume("build", log(rows))).json.challengeDone;
     const r1 = [...setUp("build"), done("build", "build-challenge", { round: 1 })];
diff --git a/.bkit/core/engine/commands/workflow/step-table.ts b/.bkit/core/engine/commands/workflow/step-table.ts
index 3436db7c9..9972c3008 100644
--- a/.bkit/core/engine/commands/workflow/step-table.ts
+++ b/.bkit/core/engine/commands/workflow/step-table.ts
@@ -230,6 +230,15 @@ export const DECISION_ROUTES: Readonly<
         "build-plan-gaps-remediate-holistic": "build-plan-gaps-remediate-holistic",
         "build-run-tests": "build-failure-diagnose",
       },
+      // Continue: every gap accepted, so the loop is settled. A group verify goes on to the next
+      // group's Plan Execute, a holistic round to Build Challenge.
+      continue: {
+        "build-plan-verify": "build-plan-tasks",
+        "build-group-gate": "build-plan-tasks",
+        "build-plan-gaps-remediate": "build-plan-tasks",
+        "build-plan-verify-holistic": "build-challenge",
+        "build-plan-gaps-remediate-holistic": "build-challenge",
+      },
     },
   },
 };
diff --git a/.bkit/core/engine/commands/workflow/summary.test.ts b/.bkit/core/engine/commands/workflow/summary.test.ts
index 7a1b6705c..8566189c5 100644
--- a/.bkit/core/engine/commands/workflow/summary.test.ts
+++ b/.bkit/core/engine/commands/workflow/summary.test.ts
@@ -597,6 +597,73 @@ describe("buildSummary", () => {
     ).toContain("build-plan-gaps-remediate-holistic FAIL");
   });
 
+  describe("a holistic pause", () => {
+    const DEC = "log/build-decision-1-1.md";
+    const row = (step: string, verdict: string, extra: object = {}) => ({
+      type: "step-done",
+      step,
+      verdict,
+      attempt: 1,
+      ...extra,
+    });
+    const decisionRow = {
+      type: "step-done",
+      step: "build-decision",
+      attempt: 1,
+      route: "continue",
+      artifacts: [DEC],
+    };
+    const pause = (...answers: string[]) =>
+      [
+        "Status: DECIDED",
+        "Question: VERIFY_GAPS",
+        "From: holistic",
+        "Pause step: 10",
+        "Plan: docs/plans/p-plan.md",
+        "",
+        ...answers.flatMap((answer, i) => [
+          `**Q${i + 1} — Gap ${i + 1}:** accept it?`,
+          "Options: A) Accept / B) Fix now",
+          "Recommended: A) Accept — minor",
+          `Decision: ${answer}`,
+          "",
+        ]),
+      ].join("\n");
+    const run = (decision: string) =>
+      buildSummary(
+        input({
+          rows: [
+            row("build-plan-verify-holistic", "FAIL"),
+            row("build-plan-gaps-remediate-holistic", "FAIL"),
+            decisionRow,
+          ],
+          decisionFiles: [DEC],
+          read: (p: string) => (p === DEC ? decision : null),
+        }),
+      );
+
+    it("an all-Accept holistic pause settles the holistic FAIL before it", () => {
+      const s = run(pause("Accept — minor", "Accept (assumed) — headless"));
+      expect(s.reasons).not.toContain("build-plan-verify-holistic FAIL");
+      expect(s.reasons).not.toContain("build-plan-gaps-remediate-holistic FAIL");
+      const resolved = s.markdown.split("## Resolved Findings")[1]!.split("## ")[0]!;
+      expect(resolved).toContain("build-plan-verify-holistic FAIL, resolved by the Decision Pause");
+      expect(resolved).toContain(
+        "build-plan-gaps-remediate-holistic FAIL, resolved by the Decision Pause",
+      );
+      expect(resolved).toContain("every item accepted");
+      expect(s.verdict).not.toBe("FAIL");
+    });
+
+    it("a holistic pause with a Fix now item settles nothing", () => {
+      const s = run(pause("Accept — minor", "Fix now"));
+      expect(s.reasons).toContain("build-plan-verify-holistic FAIL");
+      expect(s.reasons).toContain("build-plan-gaps-remediate-holistic FAIL");
+      expect(s.markdown).not.toContain("every item accepted");
+      expect(s.verdict).toBe("FAIL");
+    });
+  });
+
   it("a later PASS whole-plan verify resolves a group's failed execution and gaps fix", () => {
     const execute = { type: "step-done", step: "build-plan-tasks", verdict: "FAIL", group: 2 };
     const gaps = {
diff --git a/.bkit/core/engine/commands/workflow/summary.ts b/.bkit/core/engine/commands/workflow/summary.ts
index f8371a6eb..089480dca 100644
--- a/.bkit/core/engine/commands/workflow/summary.ts
+++ b/.bkit/core/engine/commands/workflow/summary.ts
@@ -298,6 +298,8 @@ const lastOf = (g: StepGroup) => g.rows.at(-1)!;
 
 /** Steps of a task group that a verify pause's answer settles when they ended FAIL. */
 const PAUSE_SETTLES = ["build-plan-tasks", "build-plan-verify", "build-plan-gaps-remediate"];
+/** The whole-run steps an all-Accept holistic pause settles. */
+const HOLISTIC_PAUSE_SETTLES = ["build-plan-verify-holistic", "build-plan-gaps-remediate-holistic"];
 
 /** A level-2 section whose heading matches `title`, minus the template's non-content subsections. */
 function planSection(text: string, title: RegExp): string | undefined {
@@ -415,6 +417,37 @@ export function buildSummary(input: SummaryInput): Summary {
         const g = groups.find((x) => x.key === key);
         if (g !== undefined && lastOf(g).index < pause.index) pauseSettled.add(key);
       }
+
+    // A holistic pause with every item accepted settles the whole-run FAIL rows before it.
+    let holistic: { index: number; rel: string } | undefined;
+    input.rows.forEach((row, index) => {
+      if (row.type !== "step-done" || row.step !== "build-decision") return;
+      for (const rel of artifactsOf(row)) {
+        const text = read(rel);
+        if (text === null || decisionHeader(text).From !== "holistic") continue;
+        const items = parseDecisionItems(text);
+        if (items.length === 0) continue;
+        if (!items.every((i) => /^Accept\b/.test(i.decision ?? ""))) continue;
+        holistic = { index, rel };
+      }
+    });
+    if (holistic !== undefined) {
+      const pause = holistic;
+      for (const step of HOLISTIC_PAUSE_SETTLES) {
+        const rows = input.rows
+          .map((row, index) => ({ row, index }))
+          .filter(
+            ({ row, index }) =>
+              row.type === "step-done" && row.step === step && index < pause.index,
+          );
+        if (rows.at(-1)?.row.verdict !== "FAIL") continue;
+        resolvedFindings.push(
+          `${step} FAIL, resolved by the Decision Pause (\`${pause.rel}\`), every item accepted`,
+        );
+        const g = groups.find((x) => x.step === step);
+        if (g !== undefined && lastOf(g).index < pause.index) pauseSettled.add(g.key);
+      }
+    }
   }
 
   for (const g of groups) {
diff --git a/.bkit/core/engine/commands/workflow/tasks.test.ts b/.bkit/core/engine/commands/workflow/tasks.test.ts
index 272d111ea..3133600ef 100644
--- a/.bkit/core/engine/commands/workflow/tasks.test.ts
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -131,6 +131,59 @@ const headOf = (text: string, n: number) =>
 const tickOf = (text: string, n: number) => /^- \[([ x])\]/.exec(headOf(text, n))![1];
 
 describe("bkit tasks tick", () => {
+  /** A verify-pause decision file: one item per `[title, answer]`, titled as `decisions compose` titles a gap. */
+  const decisionFile = (...items: Array<[string, string | null]>) =>
+    [
+      "Status: DECIDED",
+      "Question: VERIFY_GAPS",
+      "From: verify",
+      "Group: 1",
+      "",
+      ...items.flatMap(([title, answer], i) => [
+        `**Q${i + 1} — ${title}:** accept it?`,
+        "Options: A) Accept / B) Fix now",
+        "Recommended: A) Accept — minor",
+        ...(answer === null ? [] : [`Decision: ${answer}`]),
+        "",
+      ]),
+    ].join("\n");
+
+  it("tick --decision ticks the tasks of accepted verify-gap items", async () => {
+    const plan = write("plan.md", planText(group(1, task(1), task(2), task(3))));
+    const decision = write(
+      "decision.md",
+      decisionFile(["Task 1 gap", "Accept — minor"], ["Task 3 gap", "Accept (assumed) — headless"]),
+    );
+    const r = await run(["tick", `--plan=${plan}`, "--group=1", `--decision=${decision}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.ticked).toEqual([1, 3]);
+    expect([tickOf(read(plan), 1), tickOf(read(plan), 2), tickOf(read(plan), 3)]).toEqual([
+      "x",
+      " ",
+      "x",
+    ]);
+  });
+
+  it("tick --decision leaves a Fix now item's task open", async () => {
+    const plan = write("plan.md", planText(group(1, task(1), task(2), task(3))));
+    const decision = write(
+      "decision.md",
+      decisionFile(
+        ["Task 1 gap", "Accept — minor"],
+        ["Task 2 gap", "Fix now"],
+        ["Task 3 gap", null],
+      ),
+    );
+    const r = await run(["tick", `--plan=${plan}`, "--group=1", `--decision=${decision}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.ticked).toEqual([1]);
+    expect([tickOf(read(plan), 1), tickOf(read(plan), 2), tickOf(read(plan), 3)]).toEqual([
+      "x",
+      " ",
+      " ",
+    ]);
+  });
+
   it("tick marks only the named tasks", async () => {
     const plan = write("plan.md", planText(group(1, task(1), task(2), task(3))));
     const r = await run(["tick", `--plan=${plan}`, "--group=1", "--tasks=2"]);
diff --git a/.bkit/core/engine/commands/workflow/tasks.ts b/.bkit/core/engine/commands/workflow/tasks.ts
index 116a8f8a1..1303bf4ed 100644
--- a/.bkit/core/engine/commands/workflow/tasks.ts
+++ b/.bkit/core/engine/commands/workflow/tasks.ts
@@ -19,6 +19,7 @@ import { parseJson } from "../../shared/json.js";
 import { CommandError, EXIT, type CommandSpec, git, runGit } from "../lib.js";
 import { EXIT_DIFF_FAILED, fetchRemoteRef } from "./branches.js";
 import { DIFF_BASE } from "./context.js";
+import { parseDecisionItems } from "./decisions.js";
 import {
   NO_MARKERS_REASON,
   parsePlanBlocks,
@@ -176,7 +177,12 @@ export const tasksCommand: CommandSpec = {
           name: "tasks",
           type: "string",
           repeatable: true,
-          help: "the task numbers to tick, comma-separated or once per number; `none` ticks nothing (one of --tasks / --green)",
+          help: "the task numbers to tick, comma-separated or once per number; `none` ticks nothing (one of --tasks / --green / --decision)",
+        },
+        {
+          name: "decision",
+          type: "string",
+          help: "a decision file: the task each item answered `Accept` or `Accept (assumed)` names in its `Task {N}` title is ticked; `Fix now` and undecided items tick nothing (one of --tasks / --green / --decision)",
         },
         {
           name: "green",
@@ -197,11 +203,26 @@ export const tasksCommand: CommandSpec = {
         const tasksFlag = ctx.flags.tasks as string[] | undefined;
         const greenArg = str(ctx.flags.green);
         if (greenArg === "") throw new CommandError(EXIT.USAGE, "--green must be non-empty");
-        if (tasksFlag === undefined && greenArg === undefined)
-          throw new CommandError(EXIT.USAGE, "give one of --tasks and --green");
+        const decisionArg = str(ctx.flags.decision);
+        if (decisionArg === "") throw new CommandError(EXIT.USAGE, "--decision must be non-empty");
+        if (tasksFlag === undefined && greenArg === undefined && decisionArg === undefined)
+          throw new CommandError(EXIT.USAGE, "give one of --tasks, --green and --decision");
         const plan = readPlan(ctx.cwd, planArg);
         const candidates = groupTasks(plan, planArg, group);
-        const named = tasksFlag === undefined ? undefined : taskNumbers(tasksFlag, "tasks");
+        let named = tasksFlag === undefined ? undefined : taskNumbers(tasksFlag, "tasks");
+        if (decisionArg !== undefined) {
+          const decisionFile = path.resolve(ctx.cwd, decisionArg);
+          if (fs.statSync(decisionFile, { throwIfNoEntry: false })?.isFile() !== true)
+            throw new CommandError(EXIT.USAGE, `--decision ${decisionArg} does not exist`);
+          const accepted = parseDecisionItems(fs.readFileSync(decisionFile, "utf-8"))
+            .filter((it) => it.decision !== null && /^Accept\b/.test(it.decision))
+            .map((it) => /\bTask (\d+)\b/.exec(it.title))
+            .filter((m): m is RegExpExecArray => m !== null)
+            .map((m) => Number(m[1]));
+          named = [...(named ?? []), ...accepted].filter((n) =>
+            candidates.some((t) => t.task === n),
+          );
+        }
         for (const n of named ?? []) {
           const task = plan.tasks.find((t) => t.task === n);
           if (task === undefined) throw new CommandError(EXIT.USAGE, `${planArg} has no TASK ${n}`);
diff --git a/dist/commands/workflow/step-table.js b/dist/commands/workflow/step-table.js
index 8d10335b6..f3158c266 100644
--- a/dist/commands/workflow/step-table.js
+++ b/dist/commands/workflow/step-table.js
@@ -201,6 +201,15 @@ export const DECISION_ROUTES = {
                 "build-plan-gaps-remediate-holistic": "build-plan-gaps-remediate-holistic",
                 "build-run-tests": "build-failure-diagnose",
             },
+            // Continue: every gap accepted, so the loop is settled. A group verify goes on to the next
+            // group's Plan Execute, a holistic round to Build Challenge.
+            continue: {
+                "build-plan-verify": "build-plan-tasks",
+                "build-group-gate": "build-plan-tasks",
+                "build-plan-gaps-remediate": "build-plan-tasks",
+                "build-plan-verify-holistic": "build-challenge",
+                "build-plan-gaps-remediate-holistic": "build-challenge",
+            },
         },
     },
 };
diff --git a/dist/commands/workflow/summary.js b/dist/commands/workflow/summary.js
index f5839aafa..bbb0c6d85 100644
--- a/dist/commands/workflow/summary.js
+++ b/dist/commands/workflow/summary.js
@@ -228,6 +228,8 @@ function stepGroups(rows) {
 const lastOf = (g) => g.rows.at(-1);
 /** Steps of a task group that a verify pause's answer settles when they ended FAIL. */
 const PAUSE_SETTLES = ["build-plan-tasks", "build-plan-verify", "build-plan-gaps-remediate"];
+/** The whole-run steps an all-Accept holistic pause settles. */
+const HOLISTIC_PAUSE_SETTLES = ["build-plan-verify-holistic", "build-plan-gaps-remediate-holistic"];
 /** A level-2 section whose heading matches `title`, minus the template's non-content subsections. */
 function planSection(text, title) {
     const lines = text.split("\n");
@@ -347,6 +349,37 @@ export function buildSummary(input) {
                 if (g !== undefined && lastOf(g).index < pause.index)
                     pauseSettled.add(key);
             }
+        // A holistic pause with every item accepted settles the whole-run FAIL rows before it.
+        let holistic;
+        input.rows.forEach((row, index) => {
+            if (row.type !== "step-done" || row.step !== "build-decision")
+                return;
+            for (const rel of artifactsOf(row)) {
+                const text = read(rel);
+                if (text === null || decisionHeader(text).From !== "holistic")
+                    continue;
+                const items = parseDecisionItems(text);
+                if (items.length === 0)
+                    continue;
+                if (!items.every((i) => /^Accept\b/.test(i.decision ?? "")))
+                    continue;
+                holistic = { index, rel };
+            }
+        });
+        if (holistic !== undefined) {
+            const pause = holistic;
+            for (const step of HOLISTIC_PAUSE_SETTLES) {
+                const rows = input.rows
+                    .map((row, index) => ({ row, index }))
+                    .filter(({ row, index }) => row.type === "step-done" && row.step === step && index < pause.index);
+                if (rows.at(-1)?.row.verdict !== "FAIL")
+                    continue;
+                resolvedFindings.push(`${step} FAIL, resolved by the Decision Pause (\`${pause.rel}\`), every item accepted`);
+                const g = groups.find((x) => x.step === step);
+                if (g !== undefined && lastOf(g).index < pause.index)
+                    pauseSettled.add(g.key);
+            }
+        }
     }
     for (const g of groups) {
         const { row, index } = lastOf(g);
diff --git a/dist/commands/workflow/tasks.js b/dist/commands/workflow/tasks.js
index 45832adf2..b172fc7b0 100644
--- a/dist/commands/workflow/tasks.js
+++ b/dist/commands/workflow/tasks.js
@@ -17,6 +17,7 @@ import { parseJson } from "../../shared/json.js";
 import { CommandError, EXIT, git, runGit } from "../lib.js";
 import { EXIT_DIFF_FAILED, fetchRemoteRef } from "./branches.js";
 import { DIFF_BASE } from "./context.js";
+import { parseDecisionItems } from "./decisions.js";
 import { NO_MARKERS_REASON, parsePlanBlocks, } from "./plan-blocks.js";
 import { positiveInt, str } from "./status.js";
 import { doneTasks } from "./tests.js";
@@ -149,7 +150,12 @@ export const tasksCommand = {
                     name: "tasks",
                     type: "string",
                     repeatable: true,
-                    help: "the task numbers to tick, comma-separated or once per number; `none` ticks nothing (one of --tasks / --green)",
+                    help: "the task numbers to tick, comma-separated or once per number; `none` ticks nothing (one of --tasks / --green / --decision)",
+                },
+                {
+                    name: "decision",
+                    type: "string",
+                    help: "a decision file: the task each item answered `Accept` or `Accept (assumed)` names in its `Task {N}` title is ticked; `Fix now` and undecided items tick nothing (one of --tasks / --green / --decision)",
                 },
                 {
                     name: "green",
@@ -171,11 +177,25 @@ export const tasksCommand = {
                 const greenArg = str(ctx.flags.green);
                 if (greenArg === "")
                     throw new CommandError(EXIT.USAGE, "--green must be non-empty");
-                if (tasksFlag === undefined && greenArg === undefined)
-                    throw new CommandError(EXIT.USAGE, "give one of --tasks and --green");
+                const decisionArg = str(ctx.flags.decision);
+                if (decisionArg === "")
+                    throw new CommandError(EXIT.USAGE, "--decision must be non-empty");
+                if (tasksFlag === undefined && greenArg === undefined && decisionArg === undefined)
+                    throw new CommandError(EXIT.USAGE, "give one of --tasks, --green and --decision");
                 const plan = readPlan(ctx.cwd, planArg);
                 const candidates = groupTasks(plan, planArg, group);
-                const named = tasksFlag === undefined ? undefined : taskNumbers(tasksFlag, "tasks");
+                let named = tasksFlag === undefined ? undefined : taskNumbers(tasksFlag, "tasks");
+                if (decisionArg !== undefined) {
+                    const decisionFile = path.resolve(ctx.cwd, decisionArg);
+                    if (fs.statSync(decisionFile, { throwIfNoEntry: false })?.isFile() !== true)
+                        throw new CommandError(EXIT.USAGE, `--decision ${decisionArg} does not exist`);
+                    const accepted = parseDecisionItems(fs.readFileSync(decisionFile, "utf-8"))
+                        .filter((it) => it.decision !== null && /^Accept\b/.test(it.decision))
+                        .map((it) => /\bTask (\d+)\b/.exec(it.title))
+                        .filter((m) => m !== null)
+                        .map((m) => Number(m[1]));
+                    named = [...(named ?? []), ...accepted].filter((n) => candidates.some((t) => t.task === n));
+                }
                 for (const n of named ?? []) {
                     const task = plan.tasks.find((t) => t.task === n);
                     if (task === undefined)
