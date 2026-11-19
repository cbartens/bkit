diff --git a/.bkit/cli.md b/.bkit/cli.md
index 95088df52..8e2fe655d 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -173,8 +173,8 @@ Build decision files: check the orchestrator's questions, write the engine's cou

<!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
 | `check` | workflow | **`--file`** | Check the orchestrator's decision file: lettered options with effects, a Recommended and a Default if unanswered line per question, no repeated number, no Q1 beside the engine's loop question. |
-| `counts` | workflow | **`--out`** `--source-changed` `--loop` `--file` `--group` `--attempt` `--max` `--base-check` | Write the engine's pause counts into the decision file's -engine.md sibling: Source changed, Gate, and with --loop the attempt line, progress and the loop question Q1. |
-| `apply` | workflow | **`--file`** **`--by`** `--q` `--confirm` `--reject` `--answer` `--reason` `--reason-file` `--root` | Settle a pause's questions, writing Decision lines into the -engine.md file: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item, or answers the loop question. |
+| `counts` | workflow | **`--decision`** `--source-changed` `--loop` `--file` `--group` `--attempt` `--max` `--base-check` | Append the engine's pause counts as a decision-counts row to the status.jsonl beside the decision file (Source changed, Gate, with --loop the loop question Q1) and print the lines the owner is shown. |
+| `apply` | workflow | **`--file`** **`--by`** `--q` `--confirm` `--reject` `--answer` `--reason` `--reason-file` `--root` | Settle a pause's questions, appending decision-answer rows to the status.jsonl beside the decision file: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item, or answers the loop question. |
 | `skip` | workflow | **`--file`** | Whether a settled verify or holistic pause may route continue: exit 0 and route=continue when all five conditions hold, else exit 1 naming the first fact that fails. |
 | `pending` | workflow | **`--fid`** **`--month`** `--root` `--defer` | List the feature's assumed Accepts nobody confirmed; --defer writes one needs-decision deferral per item. |
 
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index cc32b3106..600397e45 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -173,8 +173,8 @@ Build decision files: check the orchestrator's questions, write the engine's cou

<!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
 | `check` | workflow | **`--file`** | Check the orchestrator's decision file: lettered options with effects, a Recommended and a Default if unanswered line per question, no repeated number, no Q1 beside the engine's loop question. |
-| `counts` | workflow | **`--out`** `--source-changed` `--loop` `--file` `--group` `--attempt` `--max` `--base-check` | Write the engine's pause counts into the decision file's -engine.md sibling: Source changed, Gate, and with --loop the attempt line, progress and the loop question Q1. |
-| `apply` | workflow | **`--file`** **`--by`** `--q` `--confirm` `--reject` `--answer` `--reason` `--reason-file` `--root` | Settle a pause's questions, writing Decision lines into the -engine.md file: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item, or answers the loop question. |
+| `counts` | workflow | **`--decision`** `--source-changed` `--loop` `--file` `--group` `--attempt` `--max` `--base-check` | Append the engine's pause counts as a decision-counts row to the status.jsonl beside the decision file (Source changed, Gate, with --loop the loop question Q1) and print the lines the owner is shown. |
+| `apply` | workflow | **`--file`** **`--by`** `--q` `--confirm` `--reject` `--answer` `--reason` `--reason-file` `--root` | Settle a pause's questions, appending decision-answer rows to the status.jsonl beside the decision file: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item, or answers the loop question. |
 | `skip` | workflow | **`--file`** | Whether a settled verify or holistic pause may route continue: exit 0 and route=continue when all five conditions hold, else exit 1 naming the first fact that fails. |
 | `pending` | workflow | **`--fid`** **`--month`** `--root` `--defer` | List the feature's assumed Accepts nobody confirmed; --defer writes one needs-decision deferral per item. |
 
diff --git a/.bkit/core/engine/commands/workflow/challenge.ts b/.bkit/core/engine/commands/workflow/challenge.ts
index 8aa81eb22..1f0c575f7 100644
--- a/.bkit/core/engine/commands/workflow/challenge.ts
+++ b/.bkit/core/engine/commands/workflow/challenge.ts
@@ -28,7 +28,7 @@ import { appendLine, statusTimestamp } from "../../ledgers/status.js";
 import { CommandError, DEV, EXIT, git, runGit, type CommandSpec } from "../lib.js";
 import { EXIT_BASE, diffNumstat, type DiffStat } from "./context.js";
 import { defaultRange } from "./feature-base.js";
-import { decisionItems, isEngineFile } from "./open-decision.js";
+import { decisionItems } from "./open-decision.js";
 import { EXIT_ROW_REFUSED, EXIT_STAGE, appendLedgerRows } from "./ledgers.js";
 import { derivedTestMatrix, parsePlanBlocks, type PlanTaskBlock, testTier } from "./plan-blocks.js";
 import { readBkitConfig, type TaskCaps } from "../../shared/settings.js";
@@ -253,7 +253,7 @@ export function mergeFindings(
 export function acceptedLocations(logDir: string, cwd: string): Set<string> {
   const out = new Set<string>();
   const files = fs.existsSync(logDir)
-    ? fs.readdirSync(logDir).filter((f) => /^build-decision-.*\.md$/.test(f) && !isEngineFile(f))
+    ? fs.readdirSync(logDir).filter((f) => /^build-decision-.*\.md$/.test(f))
     : [];
   for (const file of files) {
     const items = decisionItems((rel) => {
diff --git a/.bkit/core/engine/commands/workflow/decisions.test.ts b/.bkit/core/engine/commands/workflow/decisions.test.ts
index 20a1555a8..70dd204f3 100644
--- a/.bkit/core/engine/commands/workflow/decisions.test.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.test.ts
@@ -154,7 +154,7 @@ describe("bkit decisions apply --by=rerun", () => {
       [
         "decisions",
         "counts",
-        `--out=${out}`,
+        `--decision=${out}`,
         "--loop=verify",
         `--file=${status}`,
         "--group=1",
@@ -249,7 +249,7 @@ describe("bkit decisions apply --by=rerun", () => {
       [
         "decisions",
         "counts",
-        `--out=${out}`,
+        `--decision=${out}`,
         "--loop=verify",
         `--file=${status}`,
         "--group=1",
@@ -371,40 +371,41 @@ describe("bkit decisions skip", () => {
 
   it("keeps the re-run when the owner's Fix now beats an engine Accept (assumed)", async () => {
     const { root, logs } = checkout();
-    const file = path.join(logs, "build-decision-1-1.md");
+    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
+    const status = path.join(logs, "status.jsonl");
     fs.writeFileSync(
-      file,
-      [
-        "Question: CHALLENGE",
-        "From: verify",
-        "Group: 1",
-        "",
-        "**Q2 \u2014 Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
-        "A) Accept \u2014 the item is recorded as accepted",
-        "B) Fix now \u2014 a fix task is added to the plan",
-        "Recommended: A) Accept \u2014 the caller already caps it",
-        "Decision: Fix now \u2014 the owner wants it fixed",
-        "",
-      ].join("\n"),
+      status,
+      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-11-17T00:00:00Z" })}\n`,
     );
-    fs.writeFileSync(
-      engineOf(file),
-      [
-        "Source changed: false",
-        "",
-        "## Progress",
-        "",
-        "**Q1 \u2014 Verify loop:** decide the items below instead of another round?",
-        "A) Try again \u2014 another fix round runs",
-        "B) Decide \u2014 the questions below are asked instead of another round",
-        "Recommended: B) Decide \u2014 another round is unlikely to help",
-        "Decision: Decide",
-        "",
-        "**Q2 \u2014 Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
-        "Decision: Accept (assumed) \u2014 the caller caps it (no owner, LOCAL, 2026-11-17)",
-        "",
-      ].join("\n"),
+    const counted = await run(
+      ["decisions", "counts", `--decision=${file}`, "--source-changed=false"],
+      root,
     );
+    expect(counted.code).toBe(0);
+    const named = (
+      JSON.parse(fs.readFileSync(status, "utf-8").trim().split("\n").at(-1)!) as { file: string }
+    ).file;
+    const answer = (text: string, extra: object) =>
+      fs.appendFileSync(
+        status,
+        `${JSON.stringify({
+          type: "decision-answer",
+          workflow: "build",
+          at: "2026-11-17T00:01:00Z",
+          file: named,
+          q: 2,
+          answer: text,
+          ...extra,
+        })}\n`,
+      );
+    answer("Accept (assumed) — the caller caps it (no owner, LOCAL, 2026-11-17)", {
+      by: "headless",
+      assumed: true,
+    });
+    const settled = await run(["decisions", "skip", `--file=${file}`], root);
+    expect(settled.code).toBe(0);
+    expect(settled.json.route).toBe("continue");
+    answer("Fix now — the owner wants it fixed", { by: "owner" });
     const r = await run(["decisions", "skip", `--file=${file}`], root);
     expect(r.code).toBe(1);
     expect(r.json.route).toBeNull();
@@ -1092,7 +1093,7 @@ describe("bkit decisions counts", () => {
       [
         "decisions",
         "counts",
-        `--out=${out}`,
+        `--decision=${out}`,
         "--loop=verify",
         `--file=${status}`,
         "--group=1",
@@ -1103,12 +1104,39 @@ describe("bkit decisions counts", () => {
       root,
     );
 
+  /** `decisions counts` for the pause `decision`, its loop counted from the status log in `status`. */
+  const countsAt = (root: string, decision: string, status: string, ...extra: string[]) =>
+    run(
+      [
+        "decisions",
+        "counts",
+        `--decision=${decision}`,
+        "--loop=verify",
+        `--file=${status}`,
+        "--group=1",
+        "--attempt=2",
+        "--max=2",
+        ...extra,
+      ],
+      root,
+    );
+  /** The `decision-counts` rows in a log folder's status.jsonl. */
+  const countsRows = (logs: string) =>
+    fs
+      .readFileSync(path.join(logs, "status.jsonl"), "utf-8")
+      .split("\n")
+      .filter(Boolean)
+      .map((l) => JSON.parse(l) as Record<string, unknown>)
+      .filter((r) => r.type === "decision-counts");
+  /** The lines `decisions counts` prints for the owner, as one string. */
+  const shownOf = (json: { show?: unknown }) => JSON.stringify(json.show);
+
   it("writes the attempt line, progress, base check and loop question into the engine file only", async () => {
     const { root, logs } = checkout();
     const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 2);
     const before = fs.readFileSync(out, "utf-8");
     const base = baseFile(root, { verdict: "none", baseRed: 0, branch: 3 });
-    const r = await counts(
+    const r = await countsAt(
       root,
       out,
       statusOf(logs, [4, 4]),
@@ -1117,69 +1145,113 @@ describe("bkit decisions counts", () => {
     );
     expect(r.code).toBe(0);
     expect(fs.readFileSync(out, "utf-8")).toBe(before);
-    const engine = fs.readFileSync(engineOf(out), "utf-8");
-    expect(engine).toContain("Source changed: false");
-    expect(engine).toContain("Gate: FAIL");
-    expect(engine).toContain("build verify: attempt 2 of 2");
-    expect(engine).toContain("## Progress");
-    expect(engine).toContain("Problems after each round: 4 → 4");
-    expect(engine).toContain("Also red on base abc1234: 0 of 3");
-    expect(engine).toMatch(/\*\*Q1 — Verify:\*\* decide the items below/);
-    expect(engine).toContain("A) Try again — one more fix round runs");
-    expect(engine).toContain("B) Decide — ");
-    expect(engine).not.toContain("**Q2");
-    expect(engine).not.toMatch(/^Status:/m);
+    expect(fs.existsSync(engineOf(out))).toBe(false);
+    expect(fs.readdirSync(logs).filter((f) => f.endsWith(".md"))).toEqual([
+      "build-decision-1-1.md",
+    ]);
+    const rows = countsRows(logs);
+    expect(rows).toHaveLength(1);
+    expect(rows[0]).toMatchObject({
+      type: "decision-counts",
+      workflow: "build",
+      sourceChanged: false,
+      gate: "FAIL",
+      loop: { recommended: "Decide" },
+    });
+    expect(String(rows[0]!.file)).toMatch(/build-decision-1-1\.md$/);
+    expect(JSON.stringify(rows[0])).toContain("abc1234");
+    const shown = shownOf(r.json);
+    expect(shown).toContain("build verify: attempt 2 of 2");
+    expect(shown).toContain("Problems after each round: 4 → 4");
+    expect(shown).toContain("Also red on base abc1234: 0 of 3");
+    expect(shown).toMatch(/\*\*Q1 — Verify:\*\* decide the items below/);
+    expect(shown).toContain("A) Try again — one more fix round runs");
+    expect(shown).toContain("B) Decide — ");
+    expect(shown).not.toContain("**Q2");
+  });
+
+  it("carries the attempt, max and progress numbers in the row's loop", async () => {
+    const { root, logs } = checkout();
+    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
+    await countsAt(root, out, statusOf(logs, [4, 4]), "--source-changed=false");
+    expect(countsRows(logs)[0]!.loop).toMatchObject({
+      attempt: "2",
+      max: "2",
+      progress: {
+        problems: "4 → 4",
+        codeChanged: null,
+        nextStrategy: expect.any(String),
+      },
+    });
   });
 
   it("recommends Decide when the last round changed no source", async () => {
     const { root, logs } = checkout();
     const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
-    const r = await counts(root, out, statusOf(logs, [4, 4]), "--source-changed=false");
+    const r = await countsAt(root, out, statusOf(logs, [4, 4]), "--source-changed=false");
     expect(r.code).toBe(0);
-    const engine = fs.readFileSync(engineOf(out), "utf-8");
-    expect(engine).toContain("Source changed: false");
-    expect(engine).toMatch(/Recommended: B\) Decide — another round is unlikely/);
+    const rows = countsRows(logs);
+    expect(rows[0]).toMatchObject({ sourceChanged: false, loop: { recommended: "Decide" } });
+    expect(shownOf(r.json)).toMatch(/Recommended: B\) Decide — another round is unlikely/);
+    expect(fs.existsSync(engineOf(out))).toBe(false);
   });
 
   it("recommends Try again when the last round made progress", async () => {
     const { root, logs } = checkout();
     const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
-    const r = await counts(root, out, statusOf(logs, [5, 2]), "--source-changed=true");
+    const r = await countsAt(root, out, statusOf(logs, [5, 2]), "--source-changed=true");
     expect(r.code).toBe(0);
-    const engine = fs.readFileSync(engineOf(out), "utf-8");
-    expect(engine).toContain("Source changed: true");
-    expect(engine).toContain("(5 → 2)");
-    expect(engine).toMatch(/Recommended: A\) Try again — the last round made progress/);
+    const rows = countsRows(logs);
+    expect(rows[0]).toMatchObject({ sourceChanged: true, loop: { recommended: "Try again" } });
+    expect(shownOf(r.json)).toContain("(5 → 2)");
+    expect(shownOf(r.json)).toMatch(/Recommended: A\) Try again — the last round made progress/);
+    expect(fs.existsSync(engineOf(out))).toBe(false);
   });
 
   it("engine file recommends Stop when the base check is all and no questions are counted", async () => {
     const { root, logs } = checkout();
     const out = orchestratorPause(logs, [], 2);
-    const r = await counts(root, out, statusOf(logs, [4, 4]), `--base-check=${baseFile(root, {})}`);
+    const r = await countsAt(
+      root,
+      out,
+      statusOf(logs, [4, 4]),
+      `--base-check=${baseFile(root, {})}`,
+    );
     expect(r.code).toBe(0);
-    const engine = fs.readFileSync(engineOf(out), "utf-8");
-    expect(engine).toMatch(/Recommended: B\) Stop — .*fail on `dev` too/);
-    expect(engine).toContain("Fix `dev`, then resume.");
+    expect(countsRows(logs)[0]).toMatchObject({ loop: { recommended: "Stop" } });
+    expect(shownOf(r.json)).toMatch(/Recommended: B\) Stop — .*fail on `dev` too/);
+    expect(shownOf(r.json)).toContain("Fix `dev`, then resume.");
+    expect(fs.existsSync(engineOf(out))).toBe(false);
   });
 
   it("engine file recommends Decide when the base check is all and questions are counted", async () => {
     const { root, logs } = checkout();
     const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 2);
-    const r = await counts(root, out, statusOf(logs, [4, 4]), `--base-check=${baseFile(root, {})}`);
+    const r = await countsAt(
+      root,
+      out,
+      statusOf(logs, [4, 4]),
+      `--base-check=${baseFile(root, {})}`,
+    );
     expect(r.code).toBe(0);
-    const engine = fs.readFileSync(engineOf(out), "utf-8");
-    expect(engine).toMatch(/Recommended: B\) Decide — .*fail on `dev` too/);
+    expect(countsRows(logs)[0]).toMatchObject({ loop: { recommended: "Decide" } });
+    expect(shownOf(r.json)).toMatch(/Recommended: B\) Decide — .*fail on `dev` too/);
+    expect(fs.existsSync(engineOf(out))).toBe(false);
   });
 
   it("writes Source changed and Gate into the engine file for a verify pause with no loop", async () => {
     const { root, logs } = checkout();
     const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1);
     const before = fs.readFileSync(out, "utf-8");
+    fs.writeFileSync(
+      path.join(logs, "status.jsonl"),
+      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" })}\n`,
+    );
     const r = await run(
       [
         "decisions",
         "counts",
-        `--out=${out}`,
+        `--decision=${out}`,
         "--source-changed=true",
         `--base-check=${baseFile(root, {})}`,
       ],
@@ -1187,11 +1259,36 @@ describe("bkit decisions counts", () => {
     );
     expect(r.code).toBe(0);
     expect(fs.readFileSync(out, "utf-8")).toBe(before);
-    const engine = fs.readFileSync(engineOf(out), "utf-8");
-    expect(engine).toContain("Source changed: true");
-    expect(engine).toContain("Gate: FAIL");
-    expect(engine).not.toContain("## Progress");
-    expect(engine).not.toContain("**Q1");
+    const rows = countsRows(logs);
+    expect(rows).toHaveLength(1);
+    expect(rows[0]).toMatchObject({ sourceChanged: true, gate: "FAIL" });
+    expect(rows[0]!.loop).toBeUndefined();
+    expect(shownOf(r.json)).not.toContain("**Q1");
+    expect(fs.existsSync(engineOf(out))).toBe(false);
+  });
+
+  it("prints the attempt, progress, base and loop question lines in show", async () => {
+    const { root, logs } = checkout();
+    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 2);
+    const r = await countsAt(
+      root,
+      out,
+      statusOf(logs, [4, 4]),
+      "--source-changed=false",
+      `--base-check=${baseFile(root, {})}`,
+    );
+    expect(r.code).toBe(0);
+    expect(r.json.questions).toBe(2);
+    expect(String(r.json.file)).toMatch(/build-decision-1-1\.md$/);
+    expect(r.json.show).toBeDefined();
+    const shown = shownOf(r.json);
+    expect(shown).toContain("build verify: attempt 2 of 2");
+    expect(shown).toContain("Problems after each round: 4 → 4");
+    expect(shown).toContain("Also red on base abc1234");
+    expect(shown).toMatch(/\*\*Q1 — Verify:\*\*/);
+    expect(shown).toContain("A) Try again");
+    expect(shown).toContain("Recommended:");
+    expect(shown).toContain("Default if unanswered:");
   });
 
   const statusRows = (logs: string, rows: object[]) => {
@@ -1237,13 +1334,13 @@ describe("bkit decisions counts", () => {
     const { root, logs } = checkout();
     const out = orchestratorPause(logs, titles, 2);
     const r = await run(
-      ["decisions", "counts", `--out=${out}`, `--file=${status(logs)}`, ...flags],
+      ["decisions", "counts", `--decision=${out}`, `--file=${status(logs)}`, ...flags],
       root,
     );
     return {
       root,
       r,
-      engine: fs.existsSync(engineOf(out)) ? fs.readFileSync(engineOf(out), "utf-8") : "",
+      engine: ((r.json?.show as string[] | undefined) ?? []).join("\n"),
     };
   }
   const stuck = (logs: string) =>
@@ -1354,7 +1451,7 @@ describe("bkit decisions counts", () => {
       [
         "decisions",
         "counts",
-        `--out=${out}`,
+        `--decision=${out}`,
         "--loop=verify",
         `--file=${stuck(logs)}`,
         "--group=1",
@@ -1366,7 +1463,7 @@ describe("bkit decisions counts", () => {
     );
     return {
       r,
-      engine: fs.existsSync(engineOf(out)) ? fs.readFileSync(engineOf(out), "utf-8") : "",
+      engine: ((r.json?.show as string[] | undefined) ?? []).join("\n"),
     };
   }
 
@@ -1401,7 +1498,7 @@ describe("bkit decisions counts", () => {
     const out = orchestratorPause(logs, [], 2);
     const r = await counts(root, out, statusOf(logs, [2]));
     expect(r.code).toBe(0);
-    const engine = fs.readFileSync(engineOf(out), "utf-8");
+    const engine = ((r.json?.show as string[] | undefined) ?? []).join("\n");
     expect(engine).toContain("A) Try again — one more fix round runs");
     expect(engine).toContain(
       "B) Stop — the run ends here with a handover; the next run resumes here",
@@ -1510,7 +1607,7 @@ describe("bkit decisions counts", () => {
       [
         "decisions",
         "counts",
-        `--out=${out}`,
+        `--decision=${out}`,
         "--loop=verify",
         `--file=${stuck(logs)}`,
         "--group=1",
@@ -1533,7 +1630,7 @@ describe("bkit decisions counts", () => {
   it("--loop needs --file", async () => {
     const { root, logs } = checkout();
     const out = orchestratorPause(logs, ITEM_TITLES, 2);
-    const r = await run(["decisions", "counts", `--out=${out}`, "--loop=verify"], root);
+    const r = await run(["decisions", "counts", `--decision=${out}`, "--loop=verify"], root);
     expect(r.code).toBe(2);
   });
 });
@@ -1669,3 +1766,16 @@ describe("bkit decisions apply --by=owner and pending", () => {
     expect(engine).toContain(words);
   });
 });
+
+describe("bkit decisions apply --by=headless", () => {
+  it("exits non-zero on a decision file with no readable question", async () => {
+    const { root, logs } = checkout();
+    const out = path.join(logs, "build-decision-1-1.md");
+    fs.writeFileSync(out, ["Question: CHALLENGE", "From: verify", "Group: 1", ""].join("\n"));
+    process.env.BKIT_RUNTIME = "LOCAL";
+    const r = await run(["decisions", "apply", "--by=headless", `--file=${out}`], root);
+    expect(r.code).toBe(6);
+    expect(JSON.stringify(r.json)).not.toMatch(/"applied":\[[0-9]/);
+    expect(`${JSON.stringify(r.json)}${r.err}`).toContain("build-decision-1-1.md");
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/decisions.ts b/.bkit/core/engine/commands/workflow/decisions.ts
index ce2c29b08..8ba20caf8 100644
--- a/.bkit/core/engine/commands/workflow/decisions.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.ts
@@ -1,11 +1,11 @@
 // bkit decisions check|counts|apply|skip|pending — the build's decision files, from question to ship.
 // `open-decision.ts` reads them; `skip` applies its `skipProblem` rule.
 //
-// A pause holds two files. The orchestrator writes the decision file (`build-decision-{RUN}-{N}.md`):
-// its header and its questions. The engine writes the `-engine.md` sibling: the lines only it can
-// count (`Source changed`, `Gate`, the attempt line, the progress block, the loop question Q1) and
-// every `Decision:` line `apply` writes. `decisionItems` reads the two as one pause. The engine
-// never edits the orchestrator's file and writes no `Status` line: `Status` is read from the items.
+// A pause is the orchestrator's decision file (`build-decision-{RUN}-{N}.md`: its header and its
+// questions) and the engine's rows in the `status.jsonl` beside it: `decision-counts` (written by
+// `counts`: `Source changed`, `Gate`, the loop question Q1) and one `decision-answer` row per
+// answer. `decisionItems` folds the rows over the file's questions. The engine never edits the
+// orchestrator's file, and `Status` is read from the folded items.
 //
 // A decision file (`docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{N}.md`) holds header
 // lines, an optional progress block, then one item per question:
@@ -31,6 +31,7 @@
 import * as fs from "node:fs";
 import * as path from "node:path";
 
+import { appendLine, statusTimestamp } from "../../ledgers/status.js";
 import { readJsonFile, readTextFile } from "../../shared/json.js";
 import { CommandError, EXIT, git, type CommandSpec } from "../lib.js";
 import { loopProgress } from "./counters.js";
@@ -39,12 +40,9 @@ import { LOOPS, loopGateStep } from "./loops.js";
 import {
   decisionFileHeader,
   decisionItems,
-  engineSibling,
-  isEngineFile,
   ITEM_SPLIT,
   decisionHeader,
   letterAt,
-  mergeItems,
   pauseStatus,
   parseDecisionItems,
   skipProblem,
@@ -61,18 +59,6 @@ export const EXIT_HARD_BLOCKERS = 4;
 const letteredOptions = (options: string[]): string =>
   options.map((o, i) => `${letterAt(i)}) ${o}`).join(" / ");
 
-/** `extra` lines added under item `n`'s last line. */
-function addUnder(text: string, n: number, extra: string[], replace?: RegExp): string {
-  const parts = text.split(ITEM_SPLIT);
-  const i = parts.findIndex((p) => p.startsWith(`**Q${n} — `));
-  if (i < 0) throw new CommandError(EXIT.USAGE, `no Q${n} in the decision file`);
-  const body = parts[i]!.trimEnd().split("\n");
-  const kept = replace === undefined ? body : body.filter((l) => !replace.test(l));
-  const trail = parts[i]!.slice(parts[i]!.trimEnd().length) || "\n\n";
-  parts[i] = [...kept, ...extra].join("\n") + trail;
-  return parts.join("");
-}
-
 const today = () => new Date().toISOString().slice(0, 10);
 const readText = (file: string) => {
   if (!fs.existsSync(file)) throw new CommandError(EXIT.USAGE, `${file} does not exist`);
@@ -243,57 +229,56 @@ function loopQuestionLines(o: {
 // apply
 // ---------------------------------------------------------------------------
 
-/** The engine file for a decision file that has none yet: a preamble line, so the first item is never read as one. */
-const engineStub = (file: string): string =>
-  `Written by the engine beside ${path.basename(file)}; the orchestrator's questions are in that file.\n\n`;
-
-/**
- * `extra` lines under question `n` of the engine file's text, the question's first line copied
- * in from the merged `items` when the engine file does not hold it yet.
- */
-function engineWith(
-  engineText: string,
-  items: DecisionItem[],
-  n: number,
-  extra: string[],
-  replace?: RegExp,
-): string {
-  let text = engineText;
-  if (!text.split(ITEM_SPLIT).some((p) => p.startsWith(`**Q${n} — `))) {
-    const heading = items.find((i) => i.n === n)?.text.split("\n")[0];
-    if (heading === undefined) throw new CommandError(EXIT.USAGE, `no Q${n} in the decision file`);
-    text = `${text.trimEnd()}\n\n${heading}\n`;
-  }
-  return addUnder(text, n, extra, replace);
+/** The decision file's folded items. */
+function pauseOf(file: string) {
+  return { text: readText(file), items: decisionItems(readIf, file) };
 }
 
-/** The engine file's text (its stub when absent) and the merged items of a decision file. */
-function pauseOf(file: string) {
-  const text = readText(file);
-  const engineFile = engineSibling(file);
-  const engineText = readIf(engineFile);
-  return {
-    text,
-    engineFile,
-    engineText,
-    engineOrStub: engineText ?? engineStub(file),
-    items: mergeItems(text, engineText),
-  };
+/** Exit code: `status.jsonl` is missing beside the decision file, so no row can be appended. */
+const EXIT_NO_STATUS = 3;
+
+/** Appends one engine row to the `status.jsonl` beside the decision file; exit 3 when it is missing. */
+function appendRow(
+  file: string,
+  cwd: string,
+  row: { type: string } & Record<string, unknown>,
+): void {
+  const status = path.join(path.dirname(file), "status.jsonl");
+  if (!fs.existsSync(status)) throw new CommandError(EXIT_NO_STATUS, `${status} does not exist`);
+  const top = git(cwd, ["rev-parse", "--show-toplevel"]) ?? cwd;
+  fs.appendFileSync(
+    status,
+    appendLine({
+      workflow: "build",
+      at: statusTimestamp(),
+      file: path.relative(top, file),
+      ...row,
+    }),
+  );
 }
 
+/** One `decision-answer` row for question `q` of the decision file. */
+const answerRow = (
+  file: string,
+  cwd: string,
+  q: number,
+  answer: string,
+  by: string,
+  extra: Record<string, unknown> = {},
+) => appendRow(file, cwd, { type: "decision-answer", q, answer, by, ...extra });
+
 /** Each undecided item's recommendation as a `Decision:` line; hard blockers left for the owner. */
 export function applyRecommendations(
-  text: string,
+  source: string | DecisionItem[],
   runtime: string,
   why: "ask:false" | "headless",
-  engineText: string | null = null,
 ): {
   decisions: Array<{ n: number; line: string }>;
   applied: number[];
   hardBlockers: number[];
   loop: string | null;
 } {
-  const items = mergeItems(text, engineText);
+  const items = typeof source === "string" ? parseDecisionItems(source) : source;
   const loopItem = items.find((i) => i.options.includes("Try again"));
   const loop = loopItem?.decision?.split(" — ")[0] ?? loopItem?.recommended ?? null;
   const decisions: Array<{ n: number; line: string }> = [];
@@ -355,7 +340,7 @@ function decisionFiles(logDir: string): string[] {
   return fs.existsSync(logDir)
     ? fs
         .readdirSync(logDir)
-        .filter((f) => /^build-decision-\d+-\d+\.md$/.test(f) && !isEngineFile(f))
+        .filter((f) => /^build-decision-\d+-\d+\.md$/.test(f))
         .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
         .map((f) => path.join(logDir, f))
     : [];
@@ -393,7 +378,7 @@ export const decisionsCommand: CommandSpec = {
       run: (ctx) => {
         const file = path.resolve(ctx.cwd, String(ctx.flags.file));
         const text = readText(file);
-        const problem = itemProblem(text, readIf(engineSibling(file)));
+        const problem = itemProblem(text, null);
         ctx.emit({
           file: path.relative(ctx.cwd, file),
           questions: parseDecisionItems(text).length,
@@ -405,10 +390,15 @@ export const decisionsCommand: CommandSpec = {
     },
     counts: {
       summary:
-        "Write the engine's pause counts into the decision file's -engine.md sibling: Source changed, Gate, and with --loop the attempt line, progress and the loop question Q1.",
+        "Append the engine's pause counts as a decision-counts row to the status.jsonl beside the decision file (Source changed, Gate, with --loop the loop question Q1) and print the lines the owner is shown.",
       use: "workflow",
       flags: [
-        { name: "out", type: "string", required: true, help: "the orchestrator's decision file" },
+        {
+          name: "decision",
+          type: "string",
+          required: true,
+          help: "the orchestrator's decision file",
+        },
         {
           name: "source-changed",
           type: "string",
@@ -434,13 +424,14 @@ export const decisionsCommand: CommandSpec = {
         },
       ],
       output: {
-        file: "the engine file written",
-        questions: "number of questions in the decision file, the loop question included",
+        file: "the decision file the row names",
+        questions: "number of questions in the decision file, the loop question not counted",
         loopRecommended: "Try again | Decide | Stop (with --loop), else null",
+        show: "the attempt, progress, base-check and loop question lines the owner is shown",
       },
       run: (ctx) => {
-        const out = path.resolve(ctx.cwd, String(ctx.flags.out));
-        const own = parseDecisionItems(readText(out)).length;
+        const decision = path.resolve(ctx.cwd, String(ctx.flags.decision));
+        const own = parseDecisionItems(readText(decision)).length;
         const sourceChanged = str(ctx.flags.sourceChanged);
         if (sourceChanged !== undefined && sourceChanged !== "true" && sourceChanged !== "false")
           throw new CommandError(EXIT.USAGE, "--source-changed must be true or false");
@@ -453,11 +444,8 @@ export const decisionsCommand: CommandSpec = {
             EXIT.USAGE,
             "counts needs --source-changed, --base-check or --loop",
           );
-        const lines = [
-          ...(sourceChanged === undefined ? [] : [`Source changed: ${sourceChanged}`]),
-          ...(baseCheck === undefined ? [] : ["Gate: FAIL"]),
-          "",
-        ];
+        const lines: string[] = [];
+        let loopRow: Record<string, unknown> | undefined;
         let loopRecommended: string | null = null;
         if (loopName !== undefined) {
           const loop = LOOPS[loopName];
@@ -522,6 +510,31 @@ export const decisionsCommand: CommandSpec = {
               reason = `cause unknown: ${b.reason ?? "no reason given"}. ${trendReason}`;
             }
           }
+          const loopOptions = own > 0 ? ["Try again", "Decide"] : ["Try again", "Stop"];
+          const loopPick = own > 0 || loopRecommended === "Try again" ? loopRecommended : "Stop";
+          const loopQuestion =
+            loopRecommended === "Try again"
+              ? `another fix round? ${p.trendLine}`
+              : `decide the items below instead of another round? ${p.trendLine}`;
+          loopRow = {
+            title: loop.title,
+            question: loopQuestion,
+            options: loopOptions,
+            recommended: loopPick,
+            reason,
+            attempt,
+            max,
+            progress: {
+              problems: p.counts,
+              ...(p.gateCounts === undefined ? {} : { gateFailures: p.gateCounts }),
+              codeChanged: p.codeChanged,
+              lastStrategy: p.lastStrategy,
+              nextStrategy: p.nextStrategy,
+              finalSpent: p.finalSpent,
+              minutesPerRound: p.minutesPerRound,
+              trend: p.trend,
+            },
+          };
           lines.push(
             `build ${loop.point}: attempt ${attempt} of ${max}`,
             "",
@@ -539,32 +552,33 @@ export const decisionsCommand: CommandSpec = {
             "",
             ...loopQuestionLines({
               title: loop.title,
-              question:
-                loopRecommended === "Try again"
-                  ? `another fix round? ${p.trendLine}`
-                  : `decide the items below instead of another round? ${p.trendLine}`,
-              options: own > 0 ? ["Try again", "Decide"] : ["Try again", "Stop"],
-              recommended: own > 0 || loopRecommended === "Try again" ? loopRecommended : "Stop",
+              question: loopQuestion,
+              options: loopOptions,
+              recommended: loopPick,
               reason,
             }),
-            "",
           );
           if (own === 0 && loopRecommended === "Decide") loopRecommended = "Stop";
         }
-        const engineFile = engineSibling(out);
-        fs.mkdirSync(path.dirname(engineFile), { recursive: true });
-        fs.writeFileSync(engineFile, lines.join("\n"), "utf-8");
+        appendRow(decision, ctx.cwd, {
+          type: "decision-counts",
+          ...(sourceChanged === undefined ? {} : { sourceChanged: sourceChanged === "true" }),
+          ...(baseCheck === undefined ? {} : { gate: "FAIL", baseCheck }),
+          ...(loopRow === undefined ? {} : { loop: loopRow }),
+        });
+        const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
         ctx.emit({
-          file: path.relative(ctx.cwd, engineFile),
-          questions: own + (loopName === undefined ? 0 : 1),
+          file: path.relative(top, decision),
+          questions: own,
           loopRecommended,
+          show: lines,
         });
         return EXIT.OK;
       },
     },
     apply: {
       summary:
-        "Settle a pause's questions, writing Decision lines into the -engine.md file: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item, or answers the loop question.",
+        "Settle a pause's questions, appending decision-answer rows to the status.jsonl beside the decision file: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item, or answers the loop question.",
       use: "workflow",
       flags: [
         { name: "file", type: "string", required: true, help: "the decision file" },
@@ -596,6 +610,7 @@ export const decisionsCommand: CommandSpec = {
         loop: "--by=headless: the loop answer (Try again | Decide | Stop), or null",
         fixNow: "--by=headless: question numbers settled as Fix now",
         decisionKey: "--by=owner --confirm: key of the decision row written",
+        problem: "--by=headless: why nothing was applied (the file has no readable question)",
       },
       exitCodes: {
         [EXIT_HARD_BLOCKERS]:
@@ -605,25 +620,37 @@ export const decisionsCommand: CommandSpec = {
         const file = path.resolve(ctx.cwd, String(ctx.flags.file));
         const pause = pauseOf(file);
         const by = String(ctx.flags.by);
-        const write = (engine: string) => {
-          fs.writeFileSync(pause.engineFile, engine, "utf-8");
-          return pauseStatus(pause.text, engine);
-        };
+        const statusNow = () => pauseStatus(readIf, file);
         if (by === "headless") {
+          if (pause.items.length === 0) {
+            const problem = `${path.basename(file)} has no readable question; write each as "**Q{n} — {title}:** {question}"`;
+            ctx.emit({
+              status: "OPEN",
+              applied: [],
+              hardBlockers: [],
+              loop: null,
+              fixNow: [],
+              problem,
+            });
+            ctx.log(problem);
+            return EXIT_BAD_DECISION;
+          }
           const runtime = classifyAt(ctx.cwd);
           const r = applyRecommendations(
-            pause.text,
+            pause.items,
             runtime,
             runtime === "GITHUB_ACTION" ? "headless" : "ask:false",
-            pause.engineText,
           );
-          let engine = pause.engineOrStub;
-          for (const d of r.decisions) engine = engineWith(engine, pause.items, d.n, [d.line]);
-          const status =
-            r.decisions.length === 0 && pause.engineText === null ? null : write(engine);
-          const after = mergeItems(pause.text, engine);
+          for (const d of r.decisions) {
+            const answer = d.line.replace(/^Decision: /, "");
+            answerRow(file, ctx.cwd, d.n, answer, "headless", {
+              assumed: answer.startsWith("Accept (assumed)"),
+              runtime,
+            });
+          }
+          const after = decisionItems(readIf, file);
           ctx.emit({
-            status: status ?? pauseStatus(pause.text, pause.engineText),
+            status: statusNow(),
             applied: r.applied,
             hardBlockers: r.hardBlockers,
             loop: r.loop,
@@ -635,27 +662,31 @@ export const decisionsCommand: CommandSpec = {
         }
         if (by === "rerun") {
           const name = path.basename(file);
-          const header = decisionFileHeader((rel) => readIf(path.resolve(ctx.cwd, rel)), file);
+          const header = decisionFileHeader(readIf, file);
           if (!/^FAIL\b/.test(header.Gate ?? ""))
             throw new CommandError(EXIT.USAGE, `${name} has no Gate: FAIL header`);
-          const status = pauseStatus(pause.text, pause.engineText);
+          const status = statusNow();
           if (status !== "OPEN")
             throw new CommandError(EXIT.USAGE, `${name} is Status: ${status}, not OPEN`);
-          const { hasLoop, undecided } = undecidedBesidesLoop(pause.text, pause.engineText);
+          const { hasLoop, undecided } = undecidedBesidesLoop(readIf, file);
           if (!hasLoop)
             throw new CommandError(
               EXIT.USAGE,
-              `${name}: Q1 is not the loop question (no ## Progress block), so a re-run cannot answer it; undecided: ${undecided.join(", ") || "none"}`,
+              `${name}: Q1 is not the loop question (no decision-counts loop), so a re-run cannot answer it; undecided: ${undecided.join(", ") || "none"}`,
             );
           if (undecided.length > 0)
             throw new CommandError(
               EXIT.USAGE,
               `${name} has undecided questions besides the loop question: ${undecided.join(", ")}`,
             );
-          const engine = engineWith(pause.engineOrStub, pause.items, 1, [
-            `Decision: Re-run gate — the owner resumed the run, so the gate runs again first (${today()})`,
-          ]);
-          ctx.emit({ status: write(engine) });
+          answerRow(
+            file,
+            ctx.cwd,
+            1,
+            `Re-run gate — the owner resumed the run, so the gate runs again first (${today()})`,
+            "rerun",
+          );
+          ctx.emit({ status: statusNow() });
           return EXIT.OK;
         }
         if (by !== "owner")
@@ -689,14 +720,8 @@ export const decisionsCommand: CommandSpec = {
               EXIT.USAGE,
               `Q${n} has no option "${answer}" in ${path.basename(file)}`,
             );
-          const engine = engineWith(
-            pause.engineOrStub,
-            pause.items,
-            n,
-            [`Decision: ${answer} — ${reason} (owner, ${today()})`],
-            /^Decision:/,
-          );
-          ctx.emit({ status: write(engine), decisionKey: null });
+          answerRow(file, ctx.cwd, n, `${answer} — ${reason} (owner, ${today()})`, "owner");
+          ctx.emit({ status: statusNow(), decisionKey: null });
           return EXIT.OK;
         }
         if (it === undefined || !it.assumed)
@@ -704,29 +729,27 @@ export const decisionsCommand: CommandSpec = {
             EXIT.USAGE,
             `Q${n} is not an assumed Accept in ${path.basename(file)}`,
           );
-        let engine: string;
         let decisionKey: string | null = null;
         if (ctx.flags.confirm === true) {
           const row = decisionRow(path.relative(root(ctx.cwd, ctx.flags.root), file), it, reason);
           appendLedgerRows(root(ctx.cwd, ctx.flags.root), "decisions", [row]);
           decisionKey = String(row.key);
-          engine = engineWith(
-            pause.engineOrStub,
-            pause.items,
+          answerRow(
+            file,
+            ctx.cwd,
             n,
-            [`Decision: Accept — ${reason} (owner, confirmed at ship, ${today()})`],
-            /^(Decision|Rejected):/,
+            `Accept — ${reason} (owner, confirmed at ship, ${today()})`,
+            "owner",
+            { workflow: "ship" },
           );
         } else {
-          engine = engineWith(
-            pause.engineOrStub,
-            pause.items,
-            n,
-            [`Rejected: ${reason} (owner, ${today()})`],
-            /^Rejected:/,
-          );
+          answerRow(file, ctx.cwd, n, it.decision ?? "Accept (assumed)", "owner", {
+            workflow: "ship",
+            assumed: true,
+            rejected: true,
+          });
         }
-        ctx.emit({ status: write(engine), decisionKey });
+        ctx.emit({ status: statusNow(), decisionKey });
         return EXIT.OK;
       },
     },
@@ -744,7 +767,7 @@ export const decisionsCommand: CommandSpec = {
         const file = path.resolve(ctx.cwd, String(ctx.flags.file));
         const read = readTextFile(file);
         if (!read.ok) throw new CommandError(EXIT.USAGE, `${file} is missing or unreadable`);
-        const problem = skipProblem(read.text, readIf(engineSibling(file)));
+        const problem = skipProblem(readIf, file);
         if (problem !== null) ctx.log(`${path.basename(file)}: ${problem}`);
         ctx.emit({ route: problem === null ? "continue" : null, problem });
         return problem === null ? EXIT.OK : EXIT.NO;
@@ -782,8 +805,6 @@ export const decisionsCommand: CommandSpec = {
         for (const abs of decisionFiles(logDir)) {
           const rel = path.relative(top, abs);
           const merged = decisionItems(readIf, abs);
-          let engine = readIf(engineSibling(abs)) ?? engineStub(abs);
-          let marked = false;
           for (const it of merged) {
             if (!it.assumed || it.deferred) continue;
             items.push({
@@ -795,11 +816,14 @@ export const decisionsCommand: CommandSpec = {
             });
             if (ctx.flags.defer === true) {
               rows.push(deferralRow(rel, it));
-              engine = engineWith(engine, merged, it.n, [`Deferred: needs-decision (${today()})`]);
-              marked = true;
+              answerRow(abs, ctx.cwd, it.n, it.decision ?? "Accept (assumed)", "ship", {
+                workflow: "ship",
+                assumed: true,
+                rejected: it.rejected,
+                deferred: true,
+              });
             }
           }
-          if (marked) fs.writeFileSync(engineSibling(abs), engine, "utf-8");
         }
         const deferred = rows.length > 0 ? appendLedgerRows(top, "deferrals", rows).keys : [];
         ctx.emit({ items, count: items.length, deferred });
diff --git a/.bkit/core/engine/commands/workflow/open-decision.test.ts b/.bkit/core/engine/commands/workflow/open-decision.test.ts
index 7345b2b5e..1bb897bdb 100644
--- a/.bkit/core/engine/commands/workflow/open-decision.test.ts
+++ b/.bkit/core/engine/commands/workflow/open-decision.test.ts
@@ -11,7 +11,9 @@ import {
   openDecision,
   optionAnswer,
   parseDecisionItems,
+  pauseStatus,
   skipProblem,
+  statusOf,
   undecidedBesidesLoop,
 } from "./open-decision.js";
 
@@ -79,6 +81,37 @@ function pauseDir(orchestrator: string, engine?: string) {
   return { tree, logDir, rel, read };
 }
 
+const ROW_FILE = "logs/build-decision-1-1.md";
+/** The loop question a `decision-counts` row holds. */
+const LOOP_QUESTION = {
+  title: "Verify",
+  options: ["Try again", "Decide"],
+  recommended: "Decide",
+  reason: "another round is unlikely to help",
+};
+const statusRow = (type: string, o: Record<string, unknown>) => ({
+  type,
+  workflow: "build",
+  at: "2026-11-01T00:00:00Z",
+  file: ROW_FILE,
+  ...o,
+});
+/** The `decision-counts` row `decisions counts` appends for the pause above. */
+const countsRow = (o: Record<string, unknown> = {}) =>
+  statusRow("decision-counts", { sourceChanged: false, gate: "FAIL", loop: LOOP_QUESTION, ...o });
+/** A `decision-answer` row for question `q`. */
+const answerRow = (q: number, answer: string, o: Record<string, unknown> = {}) =>
+  statusRow("decision-answer", { q, answer, by: "owner", ...o });
+/** A log folder holding `build-decision-1-1.md` and the run's `status.jsonl` with `rows`; no engine file. */
+function rowDir(orchestrator: string, rows: object[]) {
+  const dir = pauseDir(orchestrator);
+  fs.writeFileSync(
+    path.join(dir.logDir, "status.jsonl"),
+    rows.map((r) => JSON.stringify(r)).join("\n") + "\n",
+  );
+  return dir;
+}
+
 /** A pause file: its header lines, the loop question when `loop` is given, then one gap item. */
 const pause = (o: { headers: string[]; loop?: string | null; answer?: string | null }) =>
   [
@@ -145,7 +178,8 @@ describe("decision file readers", () => {
 
 describe("decision file readers", () => {
   it("decisionItems reads the loop question and progress from the engine file", () => {
-    const { read, rel } = pauseDir(orchestratorFile(), engineFile());
+    const { read, rel, logDir } = rowDir(orchestratorFile(), [countsRow()]);
+    expect(fs.existsSync(path.join(logDir, "build-decision-1-1-engine.md"))).toBe(false);
     const items = decisionItems(read, rel);
     expect(items.map((i) => [i.n, i.title])).toEqual([
       [1, "Verify"],
@@ -158,29 +192,37 @@ describe("decision file readers", () => {
   });
 
   it("the engine file's Decision line wins for one question", () => {
-    const { read, rel } = pauseDir(
-      orchestratorFile({ answer: "Accept — the orchestrator wrote this" }),
-      engineFile({ q2: "Fix now — the engine file wrote this" }),
+    const { read, rel } = rowDir(
+      `Status: OPEN\n${orchestratorFile({ answer: "Accept — the orchestrator wrote this" })}`,
+      [countsRow(), answerRow(2, "Fix now — the row wrote this")],
     );
     const q2 = decisionItems(read, rel).find((i) => i.n === 2)!;
-    expect(q2.decision).toBe("Fix now — the engine file wrote this");
+    expect(q2.decision).toBe("Fix now — the row wrote this");
     expect(q2.options).toEqual(["Accept", "Fix now"]);
   });
 
   it("an owner's Fix now in the decision file wins over an engine Accept (assumed)", () => {
-    const { read, rel } = pauseDir(
-      orchestratorFile({ answer: "Fix now — the owner chose a fix" }),
-      engineFile({ q2: "Accept (assumed) — cosmetic (no owner, LOCAL, 2026-11-17)" }),
-    );
+    const { read, rel } = rowDir(orchestratorFile(), [
+      countsRow(),
+      answerRow(2, "Accept (assumed) — cosmetic (no owner, LOCAL, 2026-11-17)", {
+        assumed: true,
+        by: "headless",
+      }),
+      answerRow(2, "Fix now — the owner chose a fix"),
+    ]);
     const q2 = decisionItems(read, rel).find((i) => i.n === 2)!;
     expect(q2.decision).toBe("Fix now — the owner chose a fix");
+    expect(q2.assumed).toBe(false);
   });
 
   it("an owner's answer in the decision file wins over an engine line applied without asking", () => {
-    const { read, rel } = pauseDir(
-      orchestratorFile({ answer: "Fix now — the owner chose a fix" }),
-      engineFile({ q2: "Accept — recommended; applied without asking (GITHUB_ACTION)" }),
-    );
+    const { read, rel } = rowDir(orchestratorFile(), [
+      countsRow(),
+      answerRow(2, "Accept — recommended; applied without asking (GITHUB_ACTION)", {
+        by: "headless",
+      }),
+      answerRow(2, "Fix now — the owner chose a fix"),
+    ]);
     const q2 = decisionItems(read, rel).find((i) => i.n === 2)!;
     expect(q2.decision).toBe("Fix now — the owner chose a fix");
   });
@@ -192,10 +234,7 @@ describe("decision file readers", () => {
   });
 
   it("openDecision reads Gate and Source changed from the engine file's header", () => {
-    const { tree, logDir } = pauseDir(
-      orchestratorFile(),
-      engineFile({ headers: ["Source changed: true", "Gate: FAIL"] }),
-    );
+    const { tree, logDir } = rowDir(orchestratorFile(), [countsRow({ sourceChanged: true })]);
     const open = openDecision(logDir, tree, "build", 1);
     expect(open).toMatchObject({
       file: "logs/build-decision-1-1.md",
@@ -209,13 +248,13 @@ describe("decision file readers", () => {
   });
 
   it("a pause whose loop answer is Try again reads DECIDED", () => {
-    const { tree, logDir, rel } = pauseDir(
-      orchestratorFile(),
-      engineFile({ loop: "Try again — one more round" }),
-    );
+    const { tree, logDir, rel } = rowDir(orchestratorFile(), [
+      countsRow(),
+      answerRow(1, "Try again — one more round"),
+    ]);
     expect(openDecision(logDir, tree, "build", 1, [rel])).toBeNull();
     // The same pause with its loop question unanswered is still open.
-    const unanswered = pauseDir(orchestratorFile(), engineFile());
+    const unanswered = rowDir(orchestratorFile(), [countsRow()]);
     expect(
       openDecision(unanswered.logDir, unanswered.tree, "build", 1, [unanswered.rel]),
     ).toMatchObject({
@@ -227,11 +266,10 @@ describe("decision file readers", () => {
 describe("gateRerun", () => {
   it("re-runs a red-gate pause laid out in two files", () => {
     const orchestrator = ["Question: VERIFY_GAPS", "From: verify", "Group: 1", ""].join("\n");
-    const { tree, logDir, read, rel } = pauseDir(orchestrator, engineFile());
+    const { tree, logDir, read, rel } = rowDir(orchestrator, [countsRow()]);
     const open = openDecision(logDir, tree, "build", 1);
     expect(open).not.toBeNull();
-    const engine = read("logs/build-decision-1-1-engine.md")!;
-    expect(gateRerun(open, read(rel)!, engine)).toEqual({ gateRerun: true, rerunFrom: "verify" });
+    expect(gateRerun(open, read, rel)).toEqual({ gateRerun: true, rerunFrom: "verify" });
   });
 
   const red = { gate: "FAIL", status: "OPEN", from: "holistic" };
@@ -259,11 +297,19 @@ describe("gateRerun", () => {
 
 describe("skipProblem", () => {
   it("reads Source changed and the loop answer from the engine file", () => {
-    const orchestrator = orchestratorFile({ answer: "Accept — the caller caps it" });
-    const decided = engineFile({ headers: ["Source changed: false"], loop: "Decide" });
-    expect(skipProblem(orchestrator, decided)).toBeNull();
-    const again = engineFile({ headers: ["Source changed: false"], loop: "Try again" });
-    expect(skipProblem(orchestrator, again)).toBe(
+    const orchestrator = orchestratorFile();
+    const decided = rowDir(orchestrator, [
+      countsRow({ gate: undefined }),
+      answerRow(2, "Accept — the caller caps it"),
+      answerRow(1, "Decide"),
+    ]);
+    expect(skipProblem(decided.read, decided.rel)).toBeNull();
+    const again = rowDir(orchestrator, [
+      countsRow({ gate: undefined }),
+      answerRow(2, "Accept — the caller caps it"),
+      answerRow(1, "Try again"),
+    ]);
+    expect(skipProblem(again.read, again.rel)).toBe(
       'the loop question Q1 is "Try again", not Decide',
     );
   });
@@ -292,3 +338,51 @@ describe("skipProblem", () => {
     expect(skipProblem(pause(o))).toBe(problem);
   });
 });
+
+describe("decision rows", () => {
+  it("the row appended last wins even when its at is earlier", () => {
+    const { read, rel } = rowDir(orchestratorFile(), [
+      countsRow(),
+      answerRow(2, "Accept — appended first, dated later", { at: "2026-11-02T00:00:00Z" }),
+      answerRow(2, "Fix now — appended last, dated earlier", { at: "2026-11-01T00:00:00Z" }),
+    ]);
+    const q2 = decisionItems(read, rel).find((i) => i.n === 2)!;
+    expect(q2.decision).toBe("Fix now — appended last, dated earlier");
+  });
+
+  it("a Decision line in a file with no Status header is not read as an answer", () => {
+    const { read, rel } = rowDir(orchestratorFile({ answer: "Accept — pasted into the file" }), [
+      countsRow(),
+    ]);
+    const q2 = decisionItems(read, rel).find((i) => i.n === 2)!;
+    expect(q2.decision).toBeNull();
+  });
+
+  it("a file with a Gate header, a Decision line and no rows reads no answer", () => {
+    const text = orchestratorFile({ answer: "Accept — pasted into the file" }).replace(
+      /^Status:.*\n/m,
+      "",
+    );
+    const { read, rel } = rowDir(`Gate: FAIL\n${text}`, []);
+    expect(decisionItems(read, rel).find((i) => i.n === 2)!.decision).toBeNull();
+  });
+
+  it("a no-question file reads OPEN whatever Status line it carries", () => {
+    const text = ["Question: CHALLENGE", "Status: DECIDED", "From: verify", "Group: 1", ""].join(
+      "\n",
+    );
+    const { read, rel, tree, logDir } = rowDir(text, []);
+    expect(pauseStatus(read, rel)).toBe("OPEN");
+    expect(openDecision(logDir, tree, "build", 1)).toMatchObject({ status: "OPEN", questions: 0 });
+  });
+
+  it("a decision file with no readable question reads OPEN with questions 0", () => {
+    expect(statusOf([])).toBe("OPEN");
+    const empty = ["Question: CHALLENGE", "From: verify", "Group: 1", ""].join("\n");
+    const { tree, logDir } = rowDir(empty, []);
+    expect(openDecision(logDir, tree, "build", 1)).toMatchObject({
+      status: "OPEN",
+      questions: 0,
+    });
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/open-decision.ts b/.bkit/core/engine/commands/workflow/open-decision.ts
index 969d66b9e..5566a1ebf 100644
--- a/.bkit/core/engine/commands/workflow/open-decision.ts
+++ b/.bkit/core/engine/commands/workflow/open-decision.ts
@@ -1,12 +1,23 @@
-// Read a build Decision Pause file: its header, its items, the run's open pause, and the two
-// rules read from them — whether a resume re-runs a red gate (`gateRerun`) and whether a
-// pause may route `continue` (`skipProblem`). `decisions.ts` writes these files; this module
-// only reads them and imports nothing from the command modules, so `status.ts`, `steps.ts`
-// and `workflows.ts` read it without an import cycle.
+// Read a build Decision Pause: the orchestrator's decision file plus the engine's rows for it in
+// the folder's `status.jsonl` (`decision-counts`: Source changed, Gate, the loop question;
+// `decision-answer`: one row per answer). The module returns the header, the items, the run's
+// open pause, and the two rules read from them — whether a resume re-runs a red gate
+// (`gateRerun`) and whether a pause may route `continue` (`skipProblem`). The row appended last
+// wins for a question; `at` is never compared. A file no row names and whose header carries a
+// `Status`, `Source changed` or `Gate` line is an old file, read as written. The module imports
+// nothing from the command modules, so `status.ts`, `steps.ts` and `workflows.ts` read it
+// without an import cycle.
 
 import * as fs from "node:fs";
 import * as path from "node:path";
 
+import {
+  parseStatusLines,
+  type DecisionAnswerRow,
+  type DecisionCountsRow,
+  type StatusRow,
+} from "../../ledgers/status.js";
+
 /** One question of a decision file. */
 export interface DecisionItem {
   n: number;
@@ -108,48 +119,109 @@ export function parseDecisionItems(text: string): DecisionItem[] {
     });
 }
 
-/** The path of a decision file's engine sibling: `build-decision-1-2.md` → `build-decision-1-2-engine.md`. */
-export const engineSibling = (rel: string): string => rel.replace(/\.md$/, "-engine.md");
-
-/** Whether a file name is an engine file (`…-engine.md`), which is read beside its decision file. */
-export const isEngineFile = (name: string): boolean => /-engine\.md$/.test(name);
+/** Reads a path's text, or null when the file is absent. */
+export type ReadText = (rel: string) => string | null;
+/** A decision file as its text alone (an old file, no rows) or as a reader plus the file's path. */
+export type DecisionSource = string | ReadText;
 
-/** An engine `Decision:` line taken without asking; the owner's answer in the decision file beats it. */
-const TAKEN_UNASKED = /^Accept \(assumed\)|recommended; applied without asking/;
+const sourceOf = (
+  source: DecisionSource,
+  rel = "",
+): { read: ReadText; rel: string; text: boolean } =>
+  typeof source === "string"
+    ? { read: (r) => (r === "decision.md" ? source : null), rel: "decision.md", text: true }
+    : { read: source, rel, text: false };
 
 /**
- * The items of a decision file merged with those of its engine file: items by question
- * number, the engine file's answer winning for a question both hold (except one taken without asking, which the decision file's own answer beats), a question only the
- * engine file holds (the loop question) kept as it is. With no engine text the result is
- * `parseDecisionItems(text)`.
+ * The `decision-counts` and `decision-answer` rows naming `rel` in the `status.jsonl` beside it,
+ * in file order. A row names a file by its name: the rows sit in the file's own folder.
+ * `answersOf` keeps only the `decision-answer` rows of that workflow.
  */
-export function mergeItems(text: string, engineText: string | null | undefined): DecisionItem[] {
-  const own = parseDecisionItems(text);
-  if (engineText === null || engineText === undefined) return own;
-  const merged = [...own];
-  for (const e of parseDecisionItems(engineText)) {
-    const i = merged.findIndex((m) => m.n === e.n);
-    const base = merged[i];
-    if (base === undefined) {
-      merged.push(e);
-      continue;
-    }
-    const ownWins = base.decision !== null && e.decision !== null && TAKEN_UNASKED.test(e.decision);
-    merged[i] = {
-      ...base,
-      decision: ownWins ? base.decision : (e.decision ?? base.decision),
-      assumed: ownWins || e.decision === null ? base.assumed : e.assumed,
-      fixTask: e.fixTask ?? base.fixTask,
-      rejected: base.rejected || e.rejected,
-      deferred: base.deferred || e.deferred,
-    };
-  }
-  return merged.sort((a, b) => a.n - b.n);
+export function decisionRows(read: ReadText, rel: string, answersOf?: string): StatusRow[] {
+  const statusRel = path.join(path.dirname(rel), "status.jsonl");
+  const text = read(statusRel);
+  if (text === null) return [];
+  const parsed = parseStatusLines(text, statusRel);
+  if ("line" in parsed) throw new Error(`${statusRel} line ${parsed.line} is ${parsed.problem}`);
+  const name = path.basename(rel);
+  return parsed.rows.filter(
+    (r) =>
+      (r.type === "decision-counts" || r.type === "decision-answer") &&
+      typeof r.file === "string" &&
+      path.basename(r.file) === name &&
+      (answersOf === undefined || r.type !== "decision-answer" || r.workflow === answersOf),
+  );
+}
+
+/** Whether the header carries the `Status` line only an old file has: the old layout's mark. */
+const hasEngineLines = (header: Record<string, string>): boolean => "Status" in header;
+
+interface Folded {
+  items: DecisionItem[];
+  header: Record<string, string>;
+  hasLoop: boolean;
 }
 
-/** The header of a decision file merged with its engine file's: the engine file's line wins for a name. */
-function mergeHeader(text: string, engineText: string | null | undefined): Record<string, string> {
-  return { ...decisionHeader(text), ...(engineText == null ? {} : decisionHeader(engineText)) };
+/** The last row of a type, in file order. */
+const lastOf = <T>(rows: StatusRow[], type: string): T | null =>
+  (rows.filter((r) => r.type === type).at(-1) as T | undefined) ?? null;
+
+function foldDecision(read: ReadText, rel: string, answersOf?: string, textOnly = false): Folded {
+  const text = read(rel) ?? "";
+  const rows = decisionRows(read, rel, answersOf);
+  const header = decisionHeader(text);
+  const own = parseDecisionItems(text);
+  if (rows.length === 0 && (textOnly || hasEngineLines(header))) {
+    return { items: own, header, hasLoop: hasProgress(text) };
+  }
+  const counts = lastOf<DecisionCountsRow>(rows, "decision-counts");
+  const items: DecisionItem[] = own.map((i) => ({
+    ...i,
+    decision: null,
+    fixTask: null,
+    assumed: false,
+    rejected: false,
+    deferred: false,
+  }));
+  const loop = counts?.loop;
+  if (loop !== undefined && !items.some((i) => i.n === 1)) {
+    items.push({
+      n: 1,
+      title: loop.title,
+      text: [`**Q1 — ${loop.title}:**`, ...loop.options.map((o, k) => `${letterAt(k)}) ${o}`)].join(
+        "\n",
+      ),
+      options: loop.options,
+      recommended: loop.recommended,
+      reason: loop.reason,
+      decision: null,
+      fixTask: null,
+      assumed: false,
+      rejected: false,
+      deferred: false,
+    });
+  }
+  items.sort((a, b) => a.n - b.n);
+  const answers = new Map<number, DecisionAnswerRow>();
+  for (const r of rows)
+    if (r.type === "decision-answer") answers.set(Number(r.q), r as DecisionAnswerRow);
+  const folded = items.map((i) => {
+    const a = answers.get(i.n);
+    if (a === undefined) return i;
+    return {
+      ...i,
+      decision: optionAnswer(String(a.answer), i.options),
+      assumed: a.assumed === true,
+      rejected: a.rejected === true,
+      deferred: a.deferred === true,
+      fixTask: fixTaskOf(a.fixTask === undefined ? null : String(a.fixTask)),
+    };
+  });
+  const out = { ...header };
+  for (const k of ["Status", "Source changed", "Gate"]) delete out[k];
+  if (counts?.sourceChanged !== undefined) out["Source changed"] = String(counts.sourceChanged);
+  if (counts?.gate !== undefined) out.Gate = counts.gate;
+  return { items: folded, header: out, hasLoop: loop !== undefined };
 }
 
 /** Whether a file's text before its first item holds the `## Progress` block. */
@@ -157,27 +229,28 @@ const hasProgress = (text: string | null | undefined): boolean =>
   text != null && /^## Progress$/m.test(text.split(ITEM_SPLIT, 1)[0] ?? "");
 
 /**
- * The items of the decision file `rel` merged with its `-engine.md` sibling. `read` returns a
- * path's text, or null when the file is absent. The old single-file layout reads unchanged.
+ * The items of the decision file `rel`: its questions, the loop question `Q1` from the last
+ * `decision-counts` row, each answer from the row appended last for its question. `read` returns
+ * a path's text, or null when the file is absent. An old file (no row names it, its header has a
+ * `Status` line) is read as written. `answersOf` keeps only that
+ * workflow's answer rows.
  */
-export function decisionItems(read: (rel: string) => string | null, rel: string): DecisionItem[] {
-  return mergeItems(read(rel) ?? "", read(engineSibling(rel)));
+export function decisionItems(read: ReadText, rel: string, answersOf?: string): DecisionItem[] {
+  return foldDecision(read, rel, answersOf).items;
 }
 
-/** The header of the decision file `rel` merged with its `-engine.md` sibling's, the engine file's line winning. */
-export function decisionFileHeader(
-  read: (rel: string) => string | null,
-  rel: string,
-): Record<string, string> {
-  return mergeHeader(read(rel) ?? "", read(engineSibling(rel)));
+/** The header of the decision file `rel`, `Source changed` and `Gate` read from its `decision-counts` row. */
+export function decisionFileHeader(read: ReadText, rel: string): Record<string, string> {
+  return foldDecision(read, rel).header;
 }
 
 /**
- * The `Status` a pause's items leave it in: `OPEN` while a question has no answer, except that
- * the loop question answered `Try again` settles the pause; then `ASSUMED` while an assumed
- * `Accept` remains; else `DECIDED`.
+ * The `Status` a pause's items leave it in: `OPEN` while a question has no answer (and for a
+ * file with no readable question), except that the loop question answered `Try again` settles
+ * the pause; then `ASSUMED` while an assumed `Accept` remains; else `DECIDED`.
  */
 export function statusOf(items: DecisionItem[]): "OPEN" | "ASSUMED" | "DECIDED" {
+  if (items.length === 0) return "OPEN";
   const loop = items.find((i) => i.options.includes("Try again"));
   const settled = /^Try again\b/.test(loop?.decision ?? "");
   if (!settled && items.some((i) => i.decision === null)) return "OPEN";
@@ -185,26 +258,33 @@ export function statusOf(items: DecisionItem[]): "OPEN" | "ASSUMED" | "DECIDED"
 }
 
 /**
- * The `Status` of a pause: a lone decision file that still carries a written `Status:` line
- * (the old layout) is read as written; otherwise the status its merged items leave it in.
+ * The `Status` of a pause: an old file (no row names it) that carries a written `Status:` line
+ * is read as written; otherwise the status its folded items leave it in.
  */
-export function pauseStatus(text: string, engineText?: string | null): string {
-  const written = decisionHeader(text).Status;
-  if (written !== undefined && (engineText === null || engineText === undefined)) return written;
-  return statusOf(mergeItems(text, engineText));
+export function pauseStatus(source: DecisionSource, rel?: string): string {
+  const { read, rel: r, text } = sourceOf(source, rel);
+  const written = decisionHeader(read(r) ?? "").Status;
+  if (
+    written !== undefined &&
+    decisionRows(read, r).length === 0 &&
+    parseDecisionItems(read(r) ?? "").length > 0
+  )
+    return written;
+  return statusOf(foldDecision(read, r, undefined, text).items);
 }
 
 /**
- * Whether Q1 is the loop question (the text before the first item holds a `## Progress`
- * block, in the decision file or its engine file), and the questions besides it that nobody
- * answered, rejected or deferred.
+ * Whether Q1 is the loop question (a `decision-counts` row holds one, or an old file's text
+ * before its first item holds the `## Progress` block), and the questions besides it that
+ * nobody answered, rejected or deferred.
  */
 export function undecidedBesidesLoop(
-  text: string,
-  engineText?: string | null,
+  source: DecisionSource,
+  rel?: string,
 ): { hasLoop: boolean; undecided: string[] } {
-  const hasLoop = hasProgress(text) || hasProgress(engineText);
-  const undecided = mergeItems(text, engineText)
+  const { read, rel: r, text } = sourceOf(source, rel);
+  const { items, hasLoop } = foldDecision(read, r, undefined, text);
+  const undecided = items
     .filter(
       (i) => (hasLoop ? i.n !== 1 : true) && i.decision === null && !i.rejected && !i.deferred,
     )
@@ -223,11 +303,11 @@ export type RerunFrom = (typeof RERUN_FROM)[number];
  */
 export function gateRerun(
   open: Pick<OpenDecision, "gate" | "status" | "from"> | null,
-  text: string,
-  engineText?: string | null,
+  source: DecisionSource,
+  rel?: string,
 ): { gateRerun: boolean; rerunFrom: RerunFrom | null } {
   const from = RERUN_FROM.find((f) => f === open?.from);
-  const { hasLoop, undecided } = undecidedBesidesLoop(text, engineText);
+  const { hasLoop, undecided } = undecidedBesidesLoop(source, rel);
   const rerun =
     open?.gate === "FAIL" &&
     open.status === "OPEN" &&
@@ -247,13 +327,12 @@ const ACCEPTED = /^Accept(?: \(assumed\))?(?:$|[ \t]+—)/;
  * header that reads `false`. Headers count only in the header block, so a line inside an item
  * never stands in for one. A missing fact refuses; it is never guessed.
  */
-export function skipProblem(text: string, engineText?: string | null): string | null {
-  const header = mergeHeader(text, engineText);
+export function skipProblem(source: DecisionSource, rel?: string): string | null {
+  const { read, rel: r, text } = sourceOf(source, rel);
+  const { items, header, hasLoop } = foldDecision(read, r, undefined, text);
   const from = header.From;
   if (from === undefined) return "no From header";
   if (from !== "verify" && from !== "holistic") return `From is "${from}", not verify or holistic`;
-  const { hasLoop } = undecidedBesidesLoop(text, engineText);
-  const items = mergeItems(text, engineText);
   for (const it of items) {
     if (hasLoop && it.n === 1) continue;
     if (it.rejected) return `Q${it.n} is rejected, not Accept`;
@@ -284,6 +363,8 @@ export interface OpenDecision {
   gate: string | null;
   sourceChanged: string | null;
   status: string;
+  /** The number of questions the pause holds, the loop question included. */
+  questions: number;
 }
 
 /**
@@ -309,12 +390,13 @@ export function openDecision(
     .map(({ f, m }) => ({ f, n: Number(m[1]) }))
     .sort((a, b) => b.n - a.n);
   for (const { f, n } of found) {
-    const text = fs.readFileSync(path.join(logDir, f), "utf-8");
-    const engineFile = path.join(logDir, engineSibling(f));
-    const engineText = fs.existsSync(engineFile) ? fs.readFileSync(engineFile, "utf-8") : null;
-    const header = mergeHeader(text, engineText);
-    const status = pauseStatus(text, engineText);
     const rel = path.relative(tree, path.join(logDir, f));
+    const read: ReadText = (r) => {
+      const abs = path.join(tree, r);
+      return fs.existsSync(abs) ? fs.readFileSync(abs, "utf-8") : null;
+    };
+    const { header, items } = foldDecision(read, rel);
+    const status = pauseStatus(read, rel);
     const unfinished = (status === "DECIDED" || status === "ASSUMED") && !finished.includes(rel);
     if (status !== "OPEN" && !unfinished) continue;
     const num = (key: string) => {
@@ -334,6 +416,7 @@ export function openDecision(
       gate: header.Gate ?? null,
       sourceChanged: header["Source changed"] ?? null,
       status,
+      questions: items.length,
     };
   }
   return null;
diff --git a/.bkit/core/engine/commands/workflow/status.test.ts b/.bkit/core/engine/commands/workflow/status.test.ts
index c919d2f57..fcb6292a3 100644
--- a/.bkit/core/engine/commands/workflow/status.test.ts
+++ b/.bkit/core/engine/commands/workflow/status.test.ts
@@ -900,6 +900,11 @@ describe("bkit status resume gate re-run", () => {
   });
 
   it("re-runs the gate of a red-gate pause laid out in two files", async () => {
+    const root = tmp();
+    spawnSync("git", ["init", "-q", "-b", "dev"], { cwd: root });
+    fs.writeFileSync(path.join(root, "package.json"), "{}");
+    const logs = path.join(root, "logs");
+    fs.mkdirSync(logs);
     const orchestrator = [
       "Question: VERIFY_GAPS",
       "From: verify",
@@ -910,26 +915,41 @@ describe("bkit status resume gate re-run", () => {
       "B) Fix now — a fix task is added to the plan",
       "Recommended: A) Accept — minor",
       "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
-      "Decision: Accept — minor",
       "",
     ].join("\n");
-    const engine = [
-      "Source changed: false",
-      "Gate: FAIL",
-      "",
-      "build verify: attempt 3 of 3",
-      "",
-      "## Progress",
-      "",
-      "**Q1 — Verify:** another fix round?",
-      "A) Try again — another fix round runs",
-      "B) Stop — the run ends here",
-      "Recommended: A) Try again — the last round made progress",
-      "",
-    ].join("\n");
-    const file = stopped(orchestrator);
-    fs.writeFileSync(path.join(path.dirname(file), "build-decision-1-1-engine.md"), engine);
-    const r = await resume(file);
+    fs.writeFileSync(path.join(logs, "build-decision-1-1.md"), orchestrator);
+    const decision = "logs/build-decision-1-1.md";
+    const rows = [
+      started("build", "2026-11-01T00:00:00Z"),
+      done("build", "build-plan-verify", "2026-11-01T00:10:00Z", { group: 1, verdict: "PASS" }),
+      {
+        type: "decision-counts",
+        workflow: "build",
+        at: "2026-11-01T00:11:00Z",
+        file: decision,
+        sourceChanged: false,
+        gate: "FAIL",
+        loop: {
+          title: "Verify",
+          options: ["Try again", "Stop"],
+          recommended: "Try again",
+          reason: "the last round made progress",
+        },
+      },
+      {
+        type: "decision-answer",
+        workflow: "build",
+        at: "2026-11-01T00:12:00Z",
+        file: decision,
+        q: 2,
+        answer: "Accept — minor",
+        by: "owner",
+      },
+    ];
+    const status = path.join(logs, "status.jsonl");
+    fs.writeFileSync(status, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
+    expect(fs.existsSync(path.join(logs, "build-decision-1-1-engine.md"))).toBe(false);
+    const r = await run(["status", "resume", "--workflow=build", `--file=${status}`], root);
     expect(r.code).toBe(0);
     expect(r.json).toMatchObject({ gateRerun: true, rerunFrom: "verify" });
   });
@@ -1467,6 +1487,27 @@ describe("bkit status row", () => {
     expect(last).toEqual(r.json.row);
   });
 
+  it("refuses the engine-only types decision-counts and decision-answer", async () => {
+    const file = log([started("build", "2026-10-01T00:00:00Z")]);
+    const before = fs.readFileSync(file, "utf-8");
+    for (const [type, verb] of [
+      ["decision-counts", "decisions counts"],
+      ["decision-answer", "decisions apply"],
+    ] as const) {
+      const r = await run([
+        "status",
+        "row",
+        `--file=${file}`,
+        "--workflow=build",
+        `--type=${type}`,
+        "--field=file=logs/build-decision-1-1.md",
+      ]);
+      expect(r.code).toBe(2);
+      expect(`${JSON.stringify(r.json)}${r.err}`).toContain(verb);
+      expect(fs.readFileSync(file, "utf-8")).toBe(before);
+    }
+  });
+
   it.each([
     [["--type=step-done"], 2],
     [["--type=Ship_Gate"], 2],
diff --git a/.bkit/core/engine/commands/workflow/status.ts b/.bkit/core/engine/commands/workflow/status.ts
index 9b7e3c746..589dd9874 100644
--- a/.bkit/core/engine/commands/workflow/status.ts
+++ b/.bkit/core/engine/commands/workflow/status.ts
@@ -14,10 +14,12 @@ import {
   ciSelectionIdentity,
   allRunsDoneSteps,
   appendLine,
+  ENGINE_ROW_TYPES,
   type InvocationEvent,
   fold,
   lastDoneStepAllRuns,
   lastRun,
+  parseStatusLines,
   repeatStrategy,
   runNumber,
   runOrStepField,
@@ -42,7 +44,7 @@ import {
   type RunContext,
 } from "../lib.js";
 import { fixTestStep, gatedCheckStep } from "./loops.js";
-import { engineSibling, gateRerun, openDecision } from "./open-decision.js";
+import { gateRerun, openDecision } from "./open-decision.js";
 import { WORKFLOW_STEPS, isResumable, resumePoint } from "./step-table.js";
 
 // ---------------------------------------------------------------------------
@@ -115,20 +117,13 @@ const RENAMED_STEPS: Readonly<Record<string, string>> = {
 
 /** Parse NDJSON status text; `label` names it in errors. Malformed is an error, never "no rows". */
 function parseStatusRows(text: string, label: string): StatusRow[] {
-  return text
-    .split("\n")
-    .map((l) => l.trim())
-    .filter((l) => l !== "")
-    .map((l, i) => {
-      const parsed = parseJson(l);
-      if (!parsed.ok) throw new CommandError(EXIT_NO_STATUS, `${label} line ${i + 1} is not JSON`);
-      if (typeof parsed.value !== "object" || parsed.value === null) {
-        throw new CommandError(EXIT_NO_STATUS, `${label} line ${i + 1} is not a JSON object`);
-      }
-      const row = parsed.value as StatusRow;
-      const renamed = typeof row.step === "string" ? RENAMED_STEPS[row.step] : undefined;
-      return renamed === undefined ? row : { ...row, step: renamed };
-    });
+  const parsed = parseStatusLines(text, label);
+  if ("line" in parsed)
+    throw new CommandError(EXIT_NO_STATUS, `${label} line ${parsed.line} is ${parsed.problem}`);
+  return parsed.rows.map((row) => {
+    const renamed = typeof row.step === "string" ? RENAMED_STEPS[row.step] : undefined;
+    return renamed === undefined ? row : { ...row, step: renamed };
+  });
 }
 
 /** The rows as the fold reads them; the fold skips types it does not model. */
@@ -847,6 +842,8 @@ export const statusCommand: CommandSpec = {
           "true when the active run's open decision file (as `workflows start` prints it in openDecision) has a Gate: FAIL header, Status: OPEN, From verify, holistic or tests, and the loop question as its only undecided question: re-run that gate instead of asking again; else false",
         rerunFrom:
           "verify | holistic | tests: the open decision file's From header, the check whose gate re-runs; null when gateRerun is false",
+        questions:
+          "the number of questions in the active run's open decision file (the loop question included), or null when no decision is open",
         testVerdict:
           "debug: the verdict of the active run's last DONE debug-run-tests row (PASS|CONCERNS|FAIL), or null; other workflows null",
         testSource: "debug: that row's source (local|ci), or null; other workflows null",
@@ -888,11 +885,15 @@ export const statusCommand: CommandSpec = {
           ...point,
           ...gateRerun(
             open,
-            open === null ? "" : fs.readFileSync(path.resolve(root, open.file), "utf-8"),
-            open === null || !fs.existsSync(path.resolve(root, engineSibling(open.file)))
-              ? null
-              : fs.readFileSync(path.resolve(root, engineSibling(open.file)), "utf-8"),
+            open === null
+              ? ""
+              : (rel) => {
+                  const abs = path.resolve(root, rel);
+                  return fs.existsSync(abs) ? fs.readFileSync(abs, "utf-8") : null;
+                },
+            open?.file,
           ),
+          questions: open?.questions ?? null,
           ...round,
         });
         if (workflow === "debug" && point.number > 3 && round.testVerdict === null) {
@@ -1017,6 +1018,11 @@ export const statusCommand: CommandSpec = {
             EXIT.USAGE,
             `--type ${type} is folded; write it with its own verb`,
           );
+        if (ENGINE_ROW_TYPES.has(type))
+          throw new CommandError(
+            EXIT.USAGE,
+            `--type ${type} is written by the engine; use \`${type === "decision-counts" ? "decisions counts" : "decisions apply"}\``,
+          );
         const fields = Object.fromEntries(
           ((ctx.flags.field as string[] | undefined) ?? []).map(extraField),
         );
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index cc817ae2b..5147f0e22 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -46,7 +46,7 @@ import { activeRunStart, savedPointLimit } from "./counters.js";
 import type { AskPoint } from "../../shared/settings.js";
 import { isResumable, runProgress, WORKFLOW_STEPS } from "./step-table.js";
 import { planFiles } from "./run-facts.js";
-import { engineSibling, skipProblem } from "./open-decision.js";
+import { skipProblem } from "./open-decision.js";
 import { mergeFindings, parseFindings, reportSection, unfencedLines } from "./challenge.js";
 import { fidProblem, normaliseFid, readIssueTracker } from "./fids.js";
 import { buildComment } from "./issues.js";
@@ -1110,8 +1110,10 @@ function continueCheck(cwd: string, decisionFile: string | undefined): Check {
     return { check, ok: false, detail: "no decision file: pass it as the first --artifact" };
   const read = readTextFile(path.resolve(cwd, decisionFile));
   if (!read.ok) return { check, ok: false, detail: `${decisionFile} is missing or unreadable` };
-  const engine = readTextFile(path.resolve(cwd, engineSibling(decisionFile)));
-  const problem = skipProblem(read.text, engine.ok ? engine.text : null);
+  const problem = skipProblem((rel) => {
+    const text = readTextFile(path.resolve(cwd, rel));
+    return text.ok ? text.text : null;
+  }, decisionFile);
   return problem === null
     ? { check, ok: true, detail: `${decisionFile} passes decisions skip` }
     : { check, ok: false, detail: `${decisionFile}: ${problem}` };
diff --git a/.bkit/core/engine/commands/workflow/summary.ts b/.bkit/core/engine/commands/workflow/summary.ts
index bbcd18d7d..d7cb66466 100644
--- a/.bkit/core/engine/commands/workflow/summary.ts
+++ b/.bkit/core/engine/commands/workflow/summary.ts
@@ -5,7 +5,7 @@
 
 import { coversList, type Plan, type Workstream } from "./plans.js";
 import { issueIdOf, type FidTracker } from "./fids.js";
-import { decisionFileHeader, decisionItems, isEngineFile } from "./open-decision.js";
+import { decisionFileHeader, decisionItems } from "./open-decision.js";
 import { parsePlanBlocks } from "./plan-blocks.js";
 import { parseJson } from "../../shared/json.js";
 import { oneLine } from "../../shared/text.js";
@@ -430,14 +430,14 @@ export function buildSummary(input: SummaryInput): Summary {
     >();
     input.rows.forEach((row, index) => {
       if (row.type !== "step-done" || row.step !== "build-decision") return;
-      for (const rel of artifactsOf(row).filter((a) => !isEngineFile(a))) {
+      for (const rel of artifactsOf(row)) {
         if (read(rel) === null) continue;
         const header = decisionFileHeader(read, rel);
         const rule = PAUSE_RULES[header.From ?? ""];
         if (rule === undefined) continue;
         const group = /^[0-9]+$/.test(header.Group ?? "") ? Number(header.Group) : undefined;
         if (rule.grouped && group === undefined) continue;
-        const items = decisionItems(read, rel);
+        const items = decisionItems(read, rel, "build");
         const gaps = items.filter((i) => i.title !== rule.loop);
         const loop = items.filter((i) => i.title === rule.loop);
         if (gaps.length === 0) continue;
@@ -581,10 +581,9 @@ export function buildSummary(input: SummaryInput): Summary {
   // The Decision Pause: accepted items in this run's decision files.
   const decided = groups
     .filter((g) => g.step === "build-decision")
-    .flatMap((g) => g.rows.flatMap(({ row }) => artifactsOf(row)))
-    .filter((rel) => !isEngineFile(rel));
+    .flatMap((g) => g.rows.flatMap(({ row }) => artifactsOf(row)));
   const acceptItems = decided.flatMap((rel) =>
-    decisionItems(read, rel)
+    decisionItems(read, rel, "build")
       .filter((i) => /^Accept\b/.test(i.decision ?? ""))
       .map((i) => ({ assumed: i.assumed, line: `${rel}: Decision: ${i.decision}` })),
   );
@@ -833,7 +832,7 @@ export function buildSummary(input: SummaryInput): Summary {
   items.push(...accepted.map((a) => `- Accepted: ${a}`));
   items.push(...assumed.map((a) => `- Assumed, not confirmed: ${a}`));
   for (const rel of workflow === "build" ? input.decisionFiles : []) {
-    if (decisionItems(read, rel).every((i) => i.decision === null))
+    if (decisionItems(read, rel, "build").every((i) => i.decision === null))
       items.push(`- \`${rel}\`: no decision recorded`);
   }
   for (const p of input.plans) {
diff --git a/.bkit/core/engine/commands/workflow/tasks.test.ts b/.bkit/core/engine/commands/workflow/tasks.test.ts
index 8b661d0ba..bad2928e8 100644
--- a/.bkit/core/engine/commands/workflow/tasks.test.ts
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -201,6 +201,58 @@ describe("bkit tasks tick", () => {
     ]);
   });
 
+  it("ticks the task an Accept row names and no task for a Fix now row", async () => {
+    const plan = write("plan.md", planText(group(1, task(1), task(2), task(3))));
+    const question = (n: number) => [
+      `**Q${n} — Task ${n} gap:** accept it?`,
+      "A) Accept — the item is recorded as accepted",
+      "B) Fix now — a fix task is added to the plan",
+      "Recommended: A) Accept — minor",
+      "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
+      "",
+    ];
+    const decision = write(
+      "rows/build-decision-1-1.md",
+      [
+        "Question: VERIFY_GAPS",
+        "From: verify",
+        "Group: 1",
+        "",
+        ...question(1),
+        ...question(2),
+        ...question(3),
+      ].join("\n"),
+    );
+    const answer = (q: number, text: string, extra: object = {}) => ({
+      type: "decision-answer",
+      workflow: "build",
+      at: "2026-11-01T00:00:00Z",
+      file: decision,
+      q,
+      answer: text,
+      by: "owner",
+      ...extra,
+    });
+    write(
+      "rows/status.jsonl",
+      [
+        answer(1, "Accept — minor"),
+        answer(2, "Fix now — add a test", { fixTask: 2 }),
+        answer(3, "Accept (assumed) — headless", { assumed: true, by: "headless" }),
+      ]
+        .map((row) => JSON.stringify(row))
+        .join("\n") + "\n",
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
   it("tick --decision reads a per-line decision file with a lettered answer", async () => {
     const plan = write("plan.md", planText(group(1, task(1), task(2), task(3))));
     const decision = write(
diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index 9f0782b12..be258e4fd 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -572,6 +572,7 @@ describe("bkit workflows start — resume facts", () => {
       gate: null,
       sourceChanged: null,
       status: "OPEN",
+      questions: 1,
       plan: `docs/plans/${M}/${FID}-plan.md`,
     });
   });
@@ -3775,31 +3776,66 @@ describe("bkit workflows summary", () => {
   });
 
   it("counts an assumed item in an engine file once", async () => {
-    const cwd = tree(
-      [done("ship-merge-pr", "2020-01-01T00:10:00Z", { workflow: "ship" })],
+    const decisionRel = `${SREL}/build-decision-1-1.md`;
+    const orchestrator = [
+      "Question: CHALLENGE",
+      "From: challenge",
+      "",
+      "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
+      "A) Accept — the item is recorded as accepted",
+      "B) Fix now — a fix task is added to the plan",
+      "Recommended: A) Accept — the caller already caps it",
+      "Default if unanswered: the run waits for you",
+      "",
+    ].join("\n");
+    const answer = (workflow: string, at: string, extra: object) => ({
+      type: "decision-answer",
+      workflow,
+      at,
+      file: decisionRel,
+      q: 1,
+      ...extra,
+    });
+    const assumedRow = answer("build", "2020-01-01T00:05:00Z", {
+      answer: "Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
+      by: "headless",
+      assumed: true,
+    });
+    const shipRow = answer("ship", "2020-01-01T00:11:00Z", {
+      answer: "Accept — confirmed at ship",
+      by: "owner",
+    });
+
+    // A ship summary: the assumed item is read once, from its row, with no -engine.md file.
+    const shipTree = tree(
+      [assumedRow, done("ship-merge-pr", "2020-01-01T00:10:00Z", { workflow: "ship" })],
       undefined,
       "ship",
     );
-    const item = (decision: string) =>
-      [
-        "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
-        "A) Accept — the item is recorded as accepted",
-        "B) Fix now — a fix task is added to the plan",
-        "Recommended: A) Accept — the caller already caps it",
-        `Decision: ${decision}`,
-        "",
-      ].join("\n");
-    const assumed =
-      "A) Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)";
-    write(
-      cwd,
-      `${SREL}/build-decision-1-1.md`,
-      `Question: CHALLENGE\nFrom: challenge\n\n${item(assumed)}`,
-    );
-    write(cwd, `${SREL}/build-decision-1-1-engine.md`, `Source changed: false\n\n${item(assumed)}`);
-    const r = await summarize(cwd, "ship");
+    write(shipTree, decisionRel, orchestrator);
+    const r = await summarize(shipTree, "ship");
     expect(r.code).toBe(0);
     expect(r.json.reasons).toContain("shipped with 1 assumed item(s) the owner did not confirm");
+    expect(fs.existsSync(path.join(shipTree, `${SREL}/build-decision-1-1-engine.md`))).toBe(false);
+
+    // A build summary: a ship answer row for the same question is not a build answer, so the
+    // item stays assumed and is counted once as accepted without the owner.
+    const buildTree = tree(
+      [
+        done("build-plan-verify", "2020-01-01T00:04:00Z", { verdict: "PASS", failures: 0 }),
+        done("build-decision", "2020-01-01T00:06:00Z", { artifacts: [decisionRel] }),
+        assumedRow,
+        shipRow,
+      ],
+      planOf(task(1, true)),
+    );
+    write(buildTree, decisionRel, orchestrator);
+    const b = await summarize(buildTree);
+    expect(b.code).toBe(0);
+    expect(b.json.reasons).toContain(
+      "1 item(s) accepted without the owner (assumed; ship asks to confirm)",
+    );
+    expect(b.json.reasons).not.toContain("1 item(s) accepted at the Decision Pause");
   });
 
   it("summary is FAIL when a plan task is not done", async () => {
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index 48922185f..b3792257f 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -128,7 +128,7 @@ import {
   resolveMonth,
   workflowLockPath,
 } from "./locks.js";
-import { isEngineFile, openDecision } from "./open-decision.js";
+import { openDecision } from "./open-decision.js";
 import { highestVersion } from "./plan-versions.js";
 import { mergePr, probePr } from "./prs.js";
 import { FEATURE_STATUS } from "./roadmap.js";
@@ -1863,7 +1863,7 @@ function summaryVerb(ctx: RunContext): number {
       (workflow === "build" || workflow === "ship") && fs.existsSync(logDir)
         ? fs
             .readdirSync(logDir)
-            .filter((f) => /^build-decision-.*\.md$/.test(f) && !isEngineFile(f))
+            .filter((f) => /^build-decision-.*\.md$/.test(f))
             .sort()
             .map((f) => rel(path.join(logDir, f)))
         : [],
diff --git a/.bkit/core/engine/ledgers/status.ts b/.bkit/core/engine/ledgers/status.ts
index 0b2c76881..640bde0a3 100644
--- a/.bkit/core/engine/ledgers/status.ts
+++ b/.bkit/core/engine/ledgers/status.ts
@@ -474,6 +474,88 @@ export function fold(events: StatusEvent[]): WorkflowRun[] {
 // rows it skips (runtime-resolved, transport-fallback, close-transport, ...).
 export type StatusRow = { type: string } & Record<string, unknown>;
 
+/** Row types only the engine appends: `decisions counts` and `decisions apply`; `status row` refuses them. */
+export const ENGINE_ROW_TYPES: ReadonlySet<string> = new Set([
+  "decision-counts",
+  "decision-answer",
+]);
+
+/** The loop question a `decision-counts` row holds. */
+export type DecisionCountsLoop = {
+  title: string;
+  question?: string;
+  options: string[];
+  recommended: string | null;
+  reason: string;
+  /** The attempt the loop is on and its limit, as the pause's `attempt X of Y` line gives them. */
+  attempt?: string;
+  max?: string;
+  /** The `loopProgress` numbers the `## Progress` block prints. */
+  progress?: {
+    problems: string;
+    gateFailures?: string;
+    codeChanged: boolean | null;
+    lastStrategy: string | null;
+    nextStrategy: string;
+    finalSpent: boolean;
+    minutesPerRound: number | null;
+    trend: string;
+  };
+};
+
+/** The engine's counts for one decision file, appended by `decisions counts`. */
+export type DecisionCountsRow = {
+  type: "decision-counts";
+  workflow: string;
+  at: string;
+  file: string;
+  sourceChanged?: boolean;
+  gate?: string;
+  loop?: DecisionCountsLoop;
+  baseCheck?: Record<string, unknown>;
+} & Record<string, unknown>;
+
+/** One answer to one question of a decision file, appended by `decisions apply`. */
+export type DecisionAnswerRow = {
+  type: "decision-answer";
+  workflow: string;
+  at: string;
+  file: string;
+  q: number;
+  answer: string;
+  by: string;
+  assumed?: boolean;
+  rejected?: boolean;
+  deferred?: boolean;
+  fixTask?: number;
+  reasonFile?: string;
+  runtime?: string;
+} & Record<string, unknown>;
+
+/**
+ * Parse NDJSON status text in file order. A line that is not a JSON object comes back as
+ * `{ line, problem }` (1-based among the non-blank lines), never as "no rows". Imports nothing
+ * from `commands/`, so a reader of decision rows needs no command module.
+ */
+export function parseStatusLines(
+  text: string,
+  _label: string,
+): { rows: StatusRow[] } | { line: number; problem: "not JSON" | "not a JSON object" } {
+  const rows: StatusRow[] = [];
+  const lines = text
+    .split("\n")
+    .map((l) => l.trim())
+    .filter((l) => l !== "");
+  for (const [i, l] of lines.entries()) {
+    const parsed = parseJson(l);
+    if (!parsed.ok) return { line: i + 1, problem: "not JSON" };
+    if (typeof parsed.value !== "object" || parsed.value === null)
+      return { line: i + 1, problem: "not a JSON object" };
+    rows.push(parsed.value as StatusRow);
+  }
+  return { rows };
+}
+
 /**
  * The `invocation` row a run's `status.jsonl` carries for one engine-issued workflow-mode
  * invocation: the durable authority the outbox receipt is rebuilt from. The fold skips it.
diff --git a/.bkit/version b/.bkit/version
index 4d3a368ab..b90c9a363 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -251,7 +251,7 @@
     ".codex/hooks/bkit-rules.cjs": "65d998bd5f0299d1eaf33cd18110894f3c4cb95998698c9ccbfc63baec796df8",
     ".opencode/plugin/bkit-rules.js": "02bc8a76a4d1ec4f3fd23f299047270914c72662570964fa22894a7e0e0b04e8",
     ".bkit/router.md": "77538e88a48383850f5ebe0835bc4b80d3b33117c7fa72e49b98faba079d2ef5",
-    ".bkit/cli.md": "a58e59624579af0433c3789e9200c7a9613206ae0abaaae5ec1ac85f08c87b75",
+    ".bkit/cli.md": "8c2dcb975176313bc05f2b89437fc4a86712c5c9657d125045cf515ed2716e12",
     ".claude/agents/bkit-build-plan-tests.md": "e4c22cfb4973eb332139aaa698924f3fc39d938b2fdbe45b848881b9c1699434",
     ".cursor/agents/bkit-build-plan-tests.md": "c1f77dee3a5bfdcf3df077b7ddeb2a6f393ec518c884e99a8db3c177b5549dba",
     ".opencode/agents/bkit-build-plan-tests.md": "de624000ba6c0f9c5b55c498f0680ccf8bff9950b9511b44c3d85171e0309b7b",
diff --git a/DETAILS.md b/DETAILS.md
index e59a61ac8..0481ffd66 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -347,15 +347,15 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>265 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1974 symbols · 59 files"]
+    n_bkit_core_engine_commands["commands<br/>1977 symbols · 59 files"]
     n_bkit_core_engine_install["install<br/>370 symbols · 21 files"]
-    n_bkit_core_engine_ledgers["ledgers<br/>241 symbols · 6 files"]
+    n_bkit_core_engine_ledgers["ledgers<br/>246 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>157 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands -->|475| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_commands -->|426| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|489| n_bkit_core_engine_ledgers
+  n_bkit_core_engine_commands -->|425| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|221| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|187| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|147| n_bkit_core_engine_shared
@@ -364,7 +364,7 @@ flowchart LR
   n_bkit_core_engine_install -->|64| n_bkit_core_engine_render
   n_bkit_core_engine_commands -->|42| n_bkit_core_engine_render
   n_bkit_core_engine_cli -->|35| n_bkit_core_engine_commands
-  n_bkit_core_engine_ledgers -->|19| n_bkit_core_engine_shared
+  n_bkit_core_engine_ledgers -->|20| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|18| n_bkit_core_engine_commands
   n_bkit_core_engine_install -->|17| n_bkit_core_engine_checks
   n_bkit_core_engine_shared -->|16| n_bkit_core_engine_install
diff --git a/dist/commands/workflow/challenge.js b/dist/commands/workflow/challenge.js
index 8bb757608..00459e9be 100644
--- a/dist/commands/workflow/challenge.js
+++ b/dist/commands/workflow/challenge.js
@@ -26,7 +26,7 @@ import { appendLine, statusTimestamp } from "../../ledgers/status.js";
 import { CommandError, DEV, EXIT, git, runGit } from "../lib.js";
 import { EXIT_BASE, diffNumstat } from "./context.js";
 import { defaultRange } from "./feature-base.js";
-import { decisionItems, isEngineFile } from "./open-decision.js";
+import { decisionItems } from "./open-decision.js";
 import { EXIT_ROW_REFUSED, EXIT_STAGE, appendLedgerRows } from "./ledgers.js";
 import { derivedTestMatrix, parsePlanBlocks, testTier } from "./plan-blocks.js";
 import { readBkitConfig } from "../../shared/settings.js";
@@ -206,7 +206,7 @@ export function mergeFindings(reports, accepted) {
 export function acceptedLocations(logDir, cwd) {
     const out = new Set();
     const files = fs.existsSync(logDir)
-        ? fs.readdirSync(logDir).filter((f) => /^build-decision-.*\.md$/.test(f) && !isEngineFile(f))
+        ? fs.readdirSync(logDir).filter((f) => /^build-decision-.*\.md$/.test(f))
         : [];
     for (const file of files) {
         const items = decisionItems((rel) => {
diff --git a/dist/commands/workflow/decisions.js b/dist/commands/workflow/decisions.js
index 6a215d0e2..b64060508 100644
--- a/dist/commands/workflow/decisions.js
+++ b/dist/commands/workflow/decisions.js
@@ -1,11 +1,11 @@
 // bkit decisions check|counts|apply|skip|pending — the build's decision files, from question to ship.
 // `open-decision.ts` reads them; `skip` applies its `skipProblem` rule.
 //
-// A pause holds two files. The orchestrator writes the decision file (`build-decision-{RUN}-{N}.md`):
-// its header and its questions. The engine writes the `-engine.md` sibling: the lines only it can
-// count (`Source changed`, `Gate`, the attempt line, the progress block, the loop question Q1) and
-// every `Decision:` line `apply` writes. `decisionItems` reads the two as one pause. The engine
-// never edits the orchestrator's file and writes no `Status` line: `Status` is read from the items.
+// A pause is the orchestrator's decision file (`build-decision-{RUN}-{N}.md`: its header and its
+// questions) and the engine's rows in the `status.jsonl` beside it: `decision-counts` (written by
+// `counts`: `Source changed`, `Gate`, the loop question Q1) and one `decision-answer` row per
+// answer. `decisionItems` folds the rows over the file's questions. The engine never edits the
+// orchestrator's file, and `Status` is read from the folded items.
 //
 // A decision file (`docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{N}.md`) holds header
 // lines, an optional progress block, then one item per question:
@@ -29,30 +29,19 @@
 // deferral per item nobody confirmed.
 import * as fs from "node:fs";
 import * as path from "node:path";
+import { appendLine, statusTimestamp } from "../../ledgers/status.js";
 import { readJsonFile, readTextFile } from "../../shared/json.js";
 import { CommandError, EXIT, git } from "../lib.js";
 import { loopProgress } from "./counters.js";
 import { appendLedgerRows, monthAndFid } from "./ledgers.js";
 import { LOOPS, loopGateStep } from "./loops.js";
-import { decisionFileHeader, decisionItems, engineSibling, isEngineFile, ITEM_SPLIT, decisionHeader, letterAt, mergeItems, pauseStatus, parseDecisionItems, skipProblem, undecidedBesidesLoop, } from "./open-decision.js";
+import { decisionFileHeader, decisionItems, ITEM_SPLIT, decisionHeader, letterAt, pauseStatus, parseDecisionItems, skipProblem, undecidedBesidesLoop, } from "./open-decision.js";
 import { classifyAt } from "./runtime.js";
 import { positiveInt, str } from "./status.js";
 /** Exit code: `apply --by=headless` left hard blockers (no recommendation) for the owner. */
 export const EXIT_HARD_BLOCKERS = 4;
 /** The option list as it is written: `A) {A} / B) {B}`. */
 const letteredOptions = (options) => options.map((o, i) => `${letterAt(i)}) ${o}`).join(" / ");
-/** `extra` lines added under item `n`'s last line. */
-function addUnder(text, n, extra, replace) {
-    const parts = text.split(ITEM_SPLIT);
-    const i = parts.findIndex((p) => p.startsWith(`**Q${n} — `));
-    if (i < 0)
-        throw new CommandError(EXIT.USAGE, `no Q${n} in the decision file`);
-    const body = parts[i].trimEnd().split("\n");
-    const kept = replace === undefined ? body : body.filter((l) => !replace.test(l));
-    const trail = parts[i].slice(parts[i].trimEnd().length) || "\n\n";
-    parts[i] = [...kept, ...extra].join("\n") + trail;
-    return parts.join("");
-}
 const today = () => new Date().toISOString().slice(0, 10);
 const readText = (file) => {
     if (!fs.existsSync(file))
@@ -196,38 +185,30 @@ function loopQuestionLines(o) {
 // ---------------------------------------------------------------------------
 // apply
 // ---------------------------------------------------------------------------
-/** The engine file for a decision file that has none yet: a preamble line, so the first item is never read as one. */
-const engineStub = (file) => `Written by the engine beside ${path.basename(file)}; the orchestrator's questions are in that file.\n\n`;
-/**
- * `extra` lines under question `n` of the engine file's text, the question's first line copied
- * in from the merged `items` when the engine file does not hold it yet.
- */
-function engineWith(engineText, items, n, extra, replace) {
-    let text = engineText;
-    if (!text.split(ITEM_SPLIT).some((p) => p.startsWith(`**Q${n} — `))) {
-        const heading = items.find((i) => i.n === n)?.text.split("\n")[0];
-        if (heading === undefined)
-            throw new CommandError(EXIT.USAGE, `no Q${n} in the decision file`);
-        text = `${text.trimEnd()}\n\n${heading}\n`;
-    }
-    return addUnder(text, n, extra, replace);
-}
-/** The engine file's text (its stub when absent) and the merged items of a decision file. */
+/** The decision file's folded items. */
 function pauseOf(file) {
-    const text = readText(file);
-    const engineFile = engineSibling(file);
-    const engineText = readIf(engineFile);
-    return {
-        text,
-        engineFile,
-        engineText,
-        engineOrStub: engineText ?? engineStub(file),
-        items: mergeItems(text, engineText),
-    };
+    return { text: readText(file), items: decisionItems(readIf, file) };
+}
+/** Exit code: `status.jsonl` is missing beside the decision file, so no row can be appended. */
+const EXIT_NO_STATUS = 3;
+/** Appends one engine row to the `status.jsonl` beside the decision file; exit 3 when it is missing. */
+function appendRow(file, cwd, row) {
+    const status = path.join(path.dirname(file), "status.jsonl");
+    if (!fs.existsSync(status))
+        throw new CommandError(EXIT_NO_STATUS, `${status} does not exist`);
+    const top = git(cwd, ["rev-parse", "--show-toplevel"]) ?? cwd;
+    fs.appendFileSync(status, appendLine({
+        workflow: "build",
+        at: statusTimestamp(),
+        file: path.relative(top, file),
+        ...row,
+    }));
 }
+/** One `decision-answer` row for question `q` of the decision file. */
+const answerRow = (file, cwd, q, answer, by, extra = {}) => appendRow(file, cwd, { type: "decision-answer", q, answer, by, ...extra });
 /** Each undecided item's recommendation as a `Decision:` line; hard blockers left for the owner. */
-export function applyRecommendations(text, runtime, why, engineText = null) {
-    const items = mergeItems(text, engineText);
+export function applyRecommendations(source, runtime, why) {
+    const items = typeof source === "string" ? parseDecisionItems(source) : source;
     const loopItem = items.find((i) => i.options.includes("Try again"));
     const loop = loopItem?.decision?.split(" — ")[0] ?? loopItem?.recommended ?? null;
     const decisions = [];
@@ -287,7 +268,7 @@ function decisionFiles(logDir) {
     return fs.existsSync(logDir)
         ? fs
             .readdirSync(logDir)
-            .filter((f) => /^build-decision-\d+-\d+\.md$/.test(f) && !isEngineFile(f))
+            .filter((f) => /^build-decision-\d+-\d+\.md$/.test(f))
             .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
             .map((f) => path.join(logDir, f))
         : [];
@@ -315,7 +296,7 @@ export const decisionsCommand = {
             run: (ctx) => {
                 const file = path.resolve(ctx.cwd, String(ctx.flags.file));
                 const text = readText(file);
-                const problem = itemProblem(text, readIf(engineSibling(file)));
+                const problem = itemProblem(text, null);
                 ctx.emit({
                     file: path.relative(ctx.cwd, file),
                     questions: parseDecisionItems(text).length,
@@ -327,10 +308,15 @@ export const decisionsCommand = {
             },
         },
         counts: {
-            summary: "Write the engine's pause counts into the decision file's -engine.md sibling: Source changed, Gate, and with --loop the attempt line, progress and the loop question Q1.",
+            summary: "Append the engine's pause counts as a decision-counts row to the status.jsonl beside the decision file (Source changed, Gate, with --loop the loop question Q1) and print the lines the owner is shown.",
             use: "workflow",
             flags: [
-                { name: "out", type: "string", required: true, help: "the orchestrator's decision file" },
+                {
+                    name: "decision",
+                    type: "string",
+                    required: true,
+                    help: "the orchestrator's decision file",
+                },
                 {
                     name: "source-changed",
                     type: "string",
@@ -356,13 +342,14 @@ export const decisionsCommand = {
                 },
             ],
             output: {
-                file: "the engine file written",
-                questions: "number of questions in the decision file, the loop question included",
+                file: "the decision file the row names",
+                questions: "number of questions in the decision file, the loop question not counted",
                 loopRecommended: "Try again | Decide | Stop (with --loop), else null",
+                show: "the attempt, progress, base-check and loop question lines the owner is shown",
             },
             run: (ctx) => {
-                const out = path.resolve(ctx.cwd, String(ctx.flags.out));
-                const own = parseDecisionItems(readText(out)).length;
+                const decision = path.resolve(ctx.cwd, String(ctx.flags.decision));
+                const own = parseDecisionItems(readText(decision)).length;
                 const sourceChanged = str(ctx.flags.sourceChanged);
                 if (sourceChanged !== undefined && sourceChanged !== "true" && sourceChanged !== "false")
                     throw new CommandError(EXIT.USAGE, "--source-changed must be true or false");
@@ -371,11 +358,8 @@ export const decisionsCommand = {
                 const loopName = str(ctx.flags.loop);
                 if (sourceChanged === undefined && baseCheck === undefined && loopName === undefined)
                     throw new CommandError(EXIT.USAGE, "counts needs --source-changed, --base-check or --loop");
-                const lines = [
-                    ...(sourceChanged === undefined ? [] : [`Source changed: ${sourceChanged}`]),
-                    ...(baseCheck === undefined ? [] : ["Gate: FAIL"]),
-                    "",
-                ];
+                const lines = [];
+                let loopRow;
                 let loopRecommended = null;
                 if (loopName !== undefined) {
                     const loop = LOOPS[loopName];
@@ -431,33 +415,60 @@ export const decisionsCommand = {
                             reason = `cause unknown: ${b.reason ?? "no reason given"}. ${trendReason}`;
                         }
                     }
+                    const loopOptions = own > 0 ? ["Try again", "Decide"] : ["Try again", "Stop"];
+                    const loopPick = own > 0 || loopRecommended === "Try again" ? loopRecommended : "Stop";
+                    const loopQuestion = loopRecommended === "Try again"
+                        ? `another fix round? ${p.trendLine}`
+                        : `decide the items below instead of another round? ${p.trendLine}`;
+                    loopRow = {
+                        title: loop.title,
+                        question: loopQuestion,
+                        options: loopOptions,
+                        recommended: loopPick,
+                        reason,
+                        attempt,
+                        max,
+                        progress: {
+                            problems: p.counts,
+                            ...(p.gateCounts === undefined ? {} : { gateFailures: p.gateCounts }),
+                            codeChanged: p.codeChanged,
+                            lastStrategy: p.lastStrategy,
+                            nextStrategy: p.nextStrategy,
+                            finalSpent: p.finalSpent,
+                            minutesPerRound: p.minutesPerRound,
+                            trend: p.trend,
+                        },
+                    };
                     lines.push(`build ${loop.point}: attempt ${attempt} of ${max}`, "", "## Progress", "", `Problems after each round: ${p.counts || "none recorded"}`, ...(p.gateCounts === undefined
                         ? []
                         : [`${loop.gateTitle ?? "Gate"} failures after each round: ${p.gateCounts}`]), `Code changed: ${changed}`, `Strategy: ${p.lastStrategy ?? "none"} → next ${p.nextStrategy}${p.finalSpent ? " (FINAL already used)" : ""}`, `Minutes per round: ${p.minutesPerRound ?? "unknown"}`, `Trend: ${p.trend}`, ...baseLine, "", ...loopQuestionLines({
                         title: loop.title,
-                        question: loopRecommended === "Try again"
-                            ? `another fix round? ${p.trendLine}`
-                            : `decide the items below instead of another round? ${p.trendLine}`,
-                        options: own > 0 ? ["Try again", "Decide"] : ["Try again", "Stop"],
-                        recommended: own > 0 || loopRecommended === "Try again" ? loopRecommended : "Stop",
+                        question: loopQuestion,
+                        options: loopOptions,
+                        recommended: loopPick,
                         reason,
-                    }), "");
+                    }));
                     if (own === 0 && loopRecommended === "Decide")
                         loopRecommended = "Stop";
                 }
-                const engineFile = engineSibling(out);
-                fs.mkdirSync(path.dirname(engineFile), { recursive: true });
-                fs.writeFileSync(engineFile, lines.join("\n"), "utf-8");
+                appendRow(decision, ctx.cwd, {
+                    type: "decision-counts",
+                    ...(sourceChanged === undefined ? {} : { sourceChanged: sourceChanged === "true" }),
+                    ...(baseCheck === undefined ? {} : { gate: "FAIL", baseCheck }),
+                    ...(loopRow === undefined ? {} : { loop: loopRow }),
+                });
+                const top = git(ctx.cwd, ["rev-parse", "--show-toplevel"]) ?? ctx.cwd;
                 ctx.emit({
-                    file: path.relative(ctx.cwd, engineFile),
-                    questions: own + (loopName === undefined ? 0 : 1),
+                    file: path.relative(top, decision),
+                    questions: own,
                     loopRecommended,
+                    show: lines,
                 });
                 return EXIT.OK;
             },
         },
         apply: {
-            summary: "Settle a pause's questions, writing Decision lines into the -engine.md file: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item, or answers the loop question.",
+            summary: "Settle a pause's questions, appending decision-answer rows to the status.jsonl beside the decision file: --by=headless takes each recommendation; --by=owner confirms or rejects one assumed item, or answers the loop question.",
             use: "workflow",
             flags: [
                 { name: "file", type: "string", required: true, help: "the decision file" },
@@ -489,6 +500,7 @@ export const decisionsCommand = {
                 loop: "--by=headless: the loop answer (Try again | Decide | Stop), or null",
                 fixNow: "--by=headless: question numbers settled as Fix now",
                 decisionKey: "--by=owner --confirm: key of the decision row written",
+                problem: "--by=headless: why nothing was applied (the file has no readable question)",
             },
             exitCodes: {
                 [EXIT_HARD_BLOCKERS]: "--by=headless: hard blockers remain (headless → Failure Path; a session asks them)",
@@ -497,20 +509,33 @@ export const decisionsCommand = {
                 const file = path.resolve(ctx.cwd, String(ctx.flags.file));
                 const pause = pauseOf(file);
                 const by = String(ctx.flags.by);
-                const write = (engine) => {
-                    fs.writeFileSync(pause.engineFile, engine, "utf-8");
-                    return pauseStatus(pause.text, engine);
-                };
+                const statusNow = () => pauseStatus(readIf, file);
                 if (by === "headless") {
+                    if (pause.items.length === 0) {
+                        const problem = `${path.basename(file)} has no readable question; write each as "**Q{n} — {title}:** {question}"`;
+                        ctx.emit({
+                            status: "OPEN",
+                            applied: [],
+                            hardBlockers: [],
+                            loop: null,
+                            fixNow: [],
+                            problem,
+                        });
+                        ctx.log(problem);
+                        return EXIT_BAD_DECISION;
+                    }
                     const runtime = classifyAt(ctx.cwd);
-                    const r = applyRecommendations(pause.text, runtime, runtime === "GITHUB_ACTION" ? "headless" : "ask:false", pause.engineText);
-                    let engine = pause.engineOrStub;
-                    for (const d of r.decisions)
-                        engine = engineWith(engine, pause.items, d.n, [d.line]);
-                    const status = r.decisions.length === 0 && pause.engineText === null ? null : write(engine);
-                    const after = mergeItems(pause.text, engine);
+                    const r = applyRecommendations(pause.items, runtime, runtime === "GITHUB_ACTION" ? "headless" : "ask:false");
+                    for (const d of r.decisions) {
+                        const answer = d.line.replace(/^Decision: /, "");
+                        answerRow(file, ctx.cwd, d.n, answer, "headless", {
+                            assumed: answer.startsWith("Accept (assumed)"),
+                            runtime,
+                        });
+                    }
+                    const after = decisionItems(readIf, file);
                     ctx.emit({
-                        status: status ?? pauseStatus(pause.text, pause.engineText),
+                        status: statusNow(),
                         applied: r.applied,
                         hardBlockers: r.hardBlockers,
                         loop: r.loop,
@@ -522,21 +547,19 @@ export const decisionsCommand = {
                 }
                 if (by === "rerun") {
                     const name = path.basename(file);
-                    const header = decisionFileHeader((rel) => readIf(path.resolve(ctx.cwd, rel)), file);
+                    const header = decisionFileHeader(readIf, file);
                     if (!/^FAIL\b/.test(header.Gate ?? ""))
                         throw new CommandError(EXIT.USAGE, `${name} has no Gate: FAIL header`);
-                    const status = pauseStatus(pause.text, pause.engineText);
+                    const status = statusNow();
                     if (status !== "OPEN")
                         throw new CommandError(EXIT.USAGE, `${name} is Status: ${status}, not OPEN`);
-                    const { hasLoop, undecided } = undecidedBesidesLoop(pause.text, pause.engineText);
+                    const { hasLoop, undecided } = undecidedBesidesLoop(readIf, file);
                     if (!hasLoop)
-                        throw new CommandError(EXIT.USAGE, `${name}: Q1 is not the loop question (no ## Progress block), so a re-run cannot answer it; undecided: ${undecided.join(", ") || "none"}`);
+                        throw new CommandError(EXIT.USAGE, `${name}: Q1 is not the loop question (no decision-counts loop), so a re-run cannot answer it; undecided: ${undecided.join(", ") || "none"}`);
                     if (undecided.length > 0)
                         throw new CommandError(EXIT.USAGE, `${name} has undecided questions besides the loop question: ${undecided.join(", ")}`);
-                    const engine = engineWith(pause.engineOrStub, pause.items, 1, [
-                        `Decision: Re-run gate — the owner resumed the run, so the gate runs again first (${today()})`,
-                    ]);
-                    ctx.emit({ status: write(engine) });
+                    answerRow(file, ctx.cwd, 1, `Re-run gate — the owner resumed the run, so the gate runs again first (${today()})`, "rerun");
+                    ctx.emit({ status: statusNow() });
                     return EXIT.OK;
                 }
                 if (by !== "owner")
@@ -563,24 +586,27 @@ export const decisionsCommand = {
                 if (answer !== undefined) {
                     if (it === undefined || !it.options.includes(answer))
                         throw new CommandError(EXIT.USAGE, `Q${n} has no option "${answer}" in ${path.basename(file)}`);
-                    const engine = engineWith(pause.engineOrStub, pause.items, n, [`Decision: ${answer} — ${reason} (owner, ${today()})`], /^Decision:/);
-                    ctx.emit({ status: write(engine), decisionKey: null });
+                    answerRow(file, ctx.cwd, n, `${answer} — ${reason} (owner, ${today()})`, "owner");
+                    ctx.emit({ status: statusNow(), decisionKey: null });
                     return EXIT.OK;
                 }
                 if (it === undefined || !it.assumed)
                     throw new CommandError(EXIT.USAGE, `Q${n} is not an assumed Accept in ${path.basename(file)}`);
-                let engine;
                 let decisionKey = null;
                 if (ctx.flags.confirm === true) {
                     const row = decisionRow(path.relative(root(ctx.cwd, ctx.flags.root), file), it, reason);
                     appendLedgerRows(root(ctx.cwd, ctx.flags.root), "decisions", [row]);
                     decisionKey = String(row.key);
-                    engine = engineWith(pause.engineOrStub, pause.items, n, [`Decision: Accept — ${reason} (owner, confirmed at ship, ${today()})`], /^(Decision|Rejected):/);
+                    answerRow(file, ctx.cwd, n, `Accept — ${reason} (owner, confirmed at ship, ${today()})`, "owner", { workflow: "ship" });
                 }
                 else {
-                    engine = engineWith(pause.engineOrStub, pause.items, n, [`Rejected: ${reason} (owner, ${today()})`], /^Rejected:/);
+                    answerRow(file, ctx.cwd, n, it.decision ?? "Accept (assumed)", "owner", {
+                        workflow: "ship",
+                        assumed: true,
+                        rejected: true,
+                    });
                 }
-                ctx.emit({ status: write(engine), decisionKey });
+                ctx.emit({ status: statusNow(), decisionKey });
                 return EXIT.OK;
             },
         },
@@ -597,7 +623,7 @@ export const decisionsCommand = {
                 const read = readTextFile(file);
                 if (!read.ok)
                     throw new CommandError(EXIT.USAGE, `${file} is missing or unreadable`);
-                const problem = skipProblem(read.text, readIf(engineSibling(file)));
+                const problem = skipProblem(readIf, file);
                 if (problem !== null)
                     ctx.log(`${path.basename(file)}: ${problem}`);
                 ctx.emit({ route: problem === null ? "continue" : null, problem });
@@ -635,8 +661,6 @@ export const decisionsCommand = {
                 for (const abs of decisionFiles(logDir)) {
                     const rel = path.relative(top, abs);
                     const merged = decisionItems(readIf, abs);
-                    let engine = readIf(engineSibling(abs)) ?? engineStub(abs);
-                    let marked = false;
                     for (const it of merged) {
                         if (!it.assumed || it.deferred)
                             continue;
@@ -649,12 +673,14 @@ export const decisionsCommand = {
                         });
                         if (ctx.flags.defer === true) {
                             rows.push(deferralRow(rel, it));
-                            engine = engineWith(engine, merged, it.n, [`Deferred: needs-decision (${today()})`]);
-                            marked = true;
+                            answerRow(abs, ctx.cwd, it.n, it.decision ?? "Accept (assumed)", "ship", {
+                                workflow: "ship",
+                                assumed: true,
+                                rejected: it.rejected,
+                                deferred: true,
+                            });
                         }
                     }
-                    if (marked)
-                        fs.writeFileSync(engineSibling(abs), engine, "utf-8");
                 }
                 const deferred = rows.length > 0 ? appendLedgerRows(top, "deferrals", rows).keys : [];
                 ctx.emit({ items, count: items.length, deferred });
diff --git a/dist/commands/workflow/open-decision.js b/dist/commands/workflow/open-decision.js
index d4314c504..bf983761c 100644
--- a/dist/commands/workflow/open-decision.js
+++ b/dist/commands/workflow/open-decision.js
@@ -1,10 +1,15 @@
-// Read a build Decision Pause file: its header, its items, the run's open pause, and the two
-// rules read from them — whether a resume re-runs a red gate (`gateRerun`) and whether a
-// pause may route `continue` (`skipProblem`). `decisions.ts` writes these files; this module
-// only reads them and imports nothing from the command modules, so `status.ts`, `steps.ts`
-// and `workflows.ts` read it without an import cycle.
+// Read a build Decision Pause: the orchestrator's decision file plus the engine's rows for it in
+// the folder's `status.jsonl` (`decision-counts`: Source changed, Gate, the loop question;
+// `decision-answer`: one row per answer). The module returns the header, the items, the run's
+// open pause, and the two rules read from them — whether a resume re-runs a red gate
+// (`gateRerun`) and whether a pause may route `continue` (`skipProblem`). The row appended last
+// wins for a question; `at` is never compared. A file no row names and whose header carries a
+// `Status`, `Source changed` or `Gate` line is an old file, read as written. The module imports
+// nothing from the command modules, so `status.ts`, `steps.ts` and `workflows.ts` read it
+// without an import cycle.
 import * as fs from "node:fs";
 import * as path from "node:path";
+import { parseStatusLines, } from "../../ledgers/status.js";
 /** Splits a decision file before each `**Q{n} — ` item line. */
 export const ITEM_SPLIT = /^(?=\*\*Q\d+ — )/m;
 const lineOf = (text, key) => new RegExp(`^${key}:[ \\t]*(.+?)[ \\t]*$`, "m").exec(text)?.[1] ?? null;
@@ -82,65 +87,116 @@ export function parseDecisionItems(text) {
         };
     });
 }
-/** The path of a decision file's engine sibling: `build-decision-1-2.md` → `build-decision-1-2-engine.md`. */
-export const engineSibling = (rel) => rel.replace(/\.md$/, "-engine.md");
-/** Whether a file name is an engine file (`…-engine.md`), which is read beside its decision file. */
-export const isEngineFile = (name) => /-engine\.md$/.test(name);
-/** An engine `Decision:` line taken without asking; the owner's answer in the decision file beats it. */
-const TAKEN_UNASKED = /^Accept \(assumed\)|recommended; applied without asking/;
+const sourceOf = (source, rel = "") => typeof source === "string"
+    ? { read: (r) => (r === "decision.md" ? source : null), rel: "decision.md", text: true }
+    : { read: source, rel, text: false };
 /**
- * The items of a decision file merged with those of its engine file: items by question
- * number, the engine file's answer winning for a question both hold (except one taken without asking, which the decision file's own answer beats), a question only the
- * engine file holds (the loop question) kept as it is. With no engine text the result is
- * `parseDecisionItems(text)`.
+ * The `decision-counts` and `decision-answer` rows naming `rel` in the `status.jsonl` beside it,
+ * in file order. A row names a file by its name: the rows sit in the file's own folder.
+ * `answersOf` keeps only the `decision-answer` rows of that workflow.
  */
-export function mergeItems(text, engineText) {
+export function decisionRows(read, rel, answersOf) {
+    const statusRel = path.join(path.dirname(rel), "status.jsonl");
+    const text = read(statusRel);
+    if (text === null)
+        return [];
+    const parsed = parseStatusLines(text, statusRel);
+    if ("line" in parsed)
+        throw new Error(`${statusRel} line ${parsed.line} is ${parsed.problem}`);
+    const name = path.basename(rel);
+    return parsed.rows.filter((r) => (r.type === "decision-counts" || r.type === "decision-answer") &&
+        typeof r.file === "string" &&
+        path.basename(r.file) === name &&
+        (answersOf === undefined || r.type !== "decision-answer" || r.workflow === answersOf));
+}
+/** Whether the header carries the `Status` line only an old file has: the old layout's mark. */
+const hasEngineLines = (header) => "Status" in header;
+/** The last row of a type, in file order. */
+const lastOf = (rows, type) => rows.filter((r) => r.type === type).at(-1) ?? null;
+function foldDecision(read, rel, answersOf, textOnly = false) {
+    const text = read(rel) ?? "";
+    const rows = decisionRows(read, rel, answersOf);
+    const header = decisionHeader(text);
     const own = parseDecisionItems(text);
-    if (engineText === null || engineText === undefined)
-        return own;
-    const merged = [...own];
-    for (const e of parseDecisionItems(engineText)) {
-        const i = merged.findIndex((m) => m.n === e.n);
-        const base = merged[i];
-        if (base === undefined) {
-            merged.push(e);
-            continue;
-        }
-        const ownWins = base.decision !== null && e.decision !== null && TAKEN_UNASKED.test(e.decision);
-        merged[i] = {
-            ...base,
-            decision: ownWins ? base.decision : (e.decision ?? base.decision),
-            assumed: ownWins || e.decision === null ? base.assumed : e.assumed,
-            fixTask: e.fixTask ?? base.fixTask,
-            rejected: base.rejected || e.rejected,
-            deferred: base.deferred || e.deferred,
-        };
+    if (rows.length === 0 && (textOnly || hasEngineLines(header))) {
+        return { items: own, header, hasLoop: hasProgress(text) };
     }
-    return merged.sort((a, b) => a.n - b.n);
-}
-/** The header of a decision file merged with its engine file's: the engine file's line wins for a name. */
-function mergeHeader(text, engineText) {
-    return { ...decisionHeader(text), ...(engineText == null ? {} : decisionHeader(engineText)) };
+    const counts = lastOf(rows, "decision-counts");
+    const items = own.map((i) => ({
+        ...i,
+        decision: null,
+        fixTask: null,
+        assumed: false,
+        rejected: false,
+        deferred: false,
+    }));
+    const loop = counts?.loop;
+    if (loop !== undefined && !items.some((i) => i.n === 1)) {
+        items.push({
+            n: 1,
+            title: loop.title,
+            text: [`**Q1 — ${loop.title}:**`, ...loop.options.map((o, k) => `${letterAt(k)}) ${o}`)].join("\n"),
+            options: loop.options,
+            recommended: loop.recommended,
+            reason: loop.reason,
+            decision: null,
+            fixTask: null,
+            assumed: false,
+            rejected: false,
+            deferred: false,
+        });
+    }
+    items.sort((a, b) => a.n - b.n);
+    const answers = new Map();
+    for (const r of rows)
+        if (r.type === "decision-answer")
+            answers.set(Number(r.q), r);
+    const folded = items.map((i) => {
+        const a = answers.get(i.n);
+        if (a === undefined)
+            return i;
+        return {
+            ...i,
+            decision: optionAnswer(String(a.answer), i.options),
+            assumed: a.assumed === true,
+            rejected: a.rejected === true,
+            deferred: a.deferred === true,
+            fixTask: fixTaskOf(a.fixTask === undefined ? null : String(a.fixTask)),
+        };
+    });
+    const out = { ...header };
+    for (const k of ["Status", "Source changed", "Gate"])
+        delete out[k];
+    if (counts?.sourceChanged !== undefined)
+        out["Source changed"] = String(counts.sourceChanged);
+    if (counts?.gate !== undefined)
+        out.Gate = counts.gate;
+    return { items: folded, header: out, hasLoop: loop !== undefined };
 }
 /** Whether a file's text before its first item holds the `## Progress` block. */
 const hasProgress = (text) => text != null && /^## Progress$/m.test(text.split(ITEM_SPLIT, 1)[0] ?? "");
 /**
- * The items of the decision file `rel` merged with its `-engine.md` sibling. `read` returns a
- * path's text, or null when the file is absent. The old single-file layout reads unchanged.
+ * The items of the decision file `rel`: its questions, the loop question `Q1` from the last
+ * `decision-counts` row, each answer from the row appended last for its question. `read` returns
+ * a path's text, or null when the file is absent. An old file (no row names it, its header has a
+ * `Status` line) is read as written. `answersOf` keeps only that
+ * workflow's answer rows.
  */
-export function decisionItems(read, rel) {
-    return mergeItems(read(rel) ?? "", read(engineSibling(rel)));
+export function decisionItems(read, rel, answersOf) {
+    return foldDecision(read, rel, answersOf).items;
 }
-/** The header of the decision file `rel` merged with its `-engine.md` sibling's, the engine file's line winning. */
+/** The header of the decision file `rel`, `Source changed` and `Gate` read from its `decision-counts` row. */
 export function decisionFileHeader(read, rel) {
-    return mergeHeader(read(rel) ?? "", read(engineSibling(rel)));
+    return foldDecision(read, rel).header;
 }
 /**
- * The `Status` a pause's items leave it in: `OPEN` while a question has no answer, except that
- * the loop question answered `Try again` settles the pause; then `ASSUMED` while an assumed
- * `Accept` remains; else `DECIDED`.
+ * The `Status` a pause's items leave it in: `OPEN` while a question has no answer (and for a
+ * file with no readable question), except that the loop question answered `Try again` settles
+ * the pause; then `ASSUMED` while an assumed `Accept` remains; else `DECIDED`.
  */
 export function statusOf(items) {
+    if (items.length === 0)
+        return "OPEN";
     const loop = items.find((i) => i.options.includes("Try again"));
     const settled = /^Try again\b/.test(loop?.decision ?? "");
     if (!settled && items.some((i) => i.decision === null))
@@ -148,23 +204,27 @@ export function statusOf(items) {
     return items.some((i) => i.assumed && !i.deferred) ? "ASSUMED" : "DECIDED";
 }
 /**
- * The `Status` of a pause: a lone decision file that still carries a written `Status:` line
- * (the old layout) is read as written; otherwise the status its merged items leave it in.
+ * The `Status` of a pause: an old file (no row names it) that carries a written `Status:` line
+ * is read as written; otherwise the status its folded items leave it in.
  */
-export function pauseStatus(text, engineText) {
-    const written = decisionHeader(text).Status;
-    if (written !== undefined && (engineText === null || engineText === undefined))
+export function pauseStatus(source, rel) {
+    const { read, rel: r, text } = sourceOf(source, rel);
+    const written = decisionHeader(read(r) ?? "").Status;
+    if (written !== undefined &&
+        decisionRows(read, r).length === 0 &&
+        parseDecisionItems(read(r) ?? "").length > 0)
         return written;
-    return statusOf(mergeItems(text, engineText));
+    return statusOf(foldDecision(read, r, undefined, text).items);
 }
 /**
- * Whether Q1 is the loop question (the text before the first item holds a `## Progress`
- * block, in the decision file or its engine file), and the questions besides it that nobody
- * answered, rejected or deferred.
+ * Whether Q1 is the loop question (a `decision-counts` row holds one, or an old file's text
+ * before its first item holds the `## Progress` block), and the questions besides it that
+ * nobody answered, rejected or deferred.
  */
-export function undecidedBesidesLoop(text, engineText) {
-    const hasLoop = hasProgress(text) || hasProgress(engineText);
-    const undecided = mergeItems(text, engineText)
+export function undecidedBesidesLoop(source, rel) {
+    const { read, rel: r, text } = sourceOf(source, rel);
+    const { items, hasLoop } = foldDecision(read, r, undefined, text);
+    const undecided = items
         .filter((i) => (hasLoop ? i.n !== 1 : true) && i.decision === null && !i.rejected && !i.deferred)
         .map((i) => `Q${i.n}`);
     return { hasLoop, undecided };
@@ -176,9 +236,9 @@ export const RERUN_FROM = ["verify", "holistic", "tests"];
  * `FAIL`, its `Status` is `OPEN`, the loop question is its only undecided question, and its
  * `From` names a check that re-runs. `rerunFrom` is that check, null when `gateRerun` is false.
  */
-export function gateRerun(open, text, engineText) {
+export function gateRerun(open, source, rel) {
     const from = RERUN_FROM.find((f) => f === open?.from);
-    const { hasLoop, undecided } = undecidedBesidesLoop(text, engineText);
+    const { hasLoop, undecided } = undecidedBesidesLoop(source, rel);
     const rerun = open?.gate === "FAIL" &&
         open.status === "OPEN" &&
         from !== undefined &&
@@ -195,15 +255,14 @@ const ACCEPTED = /^Accept(?: \(assumed\))?(?:$|[ \t]+—)/;
  * header that reads `false`. Headers count only in the header block, so a line inside an item
  * never stands in for one. A missing fact refuses; it is never guessed.
  */
-export function skipProblem(text, engineText) {
-    const header = mergeHeader(text, engineText);
+export function skipProblem(source, rel) {
+    const { read, rel: r, text } = sourceOf(source, rel);
+    const { items, header, hasLoop } = foldDecision(read, r, undefined, text);
     const from = header.From;
     if (from === undefined)
         return "no From header";
     if (from !== "verify" && from !== "holistic")
         return `From is "${from}", not verify or holistic`;
-    const { hasLoop } = undecidedBesidesLoop(text, engineText);
-    const items = mergeItems(text, engineText);
     for (const it of items) {
         if (hasLoop && it.n === 1)
             continue;
@@ -242,12 +301,13 @@ export function openDecision(logDir, tree, workflow, run, finished = []) {
         .map(({ f, m }) => ({ f, n: Number(m[1]) }))
         .sort((a, b) => b.n - a.n);
     for (const { f, n } of found) {
-        const text = fs.readFileSync(path.join(logDir, f), "utf-8");
-        const engineFile = path.join(logDir, engineSibling(f));
-        const engineText = fs.existsSync(engineFile) ? fs.readFileSync(engineFile, "utf-8") : null;
-        const header = mergeHeader(text, engineText);
-        const status = pauseStatus(text, engineText);
         const rel = path.relative(tree, path.join(logDir, f));
+        const read = (r) => {
+            const abs = path.join(tree, r);
+            return fs.existsSync(abs) ? fs.readFileSync(abs, "utf-8") : null;
+        };
+        const { header, items } = foldDecision(read, rel);
+        const status = pauseStatus(read, rel);
         const unfinished = (status === "DECIDED" || status === "ASSUMED") && !finished.includes(rel);
         if (status !== "OPEN" && !unfinished)
             continue;
@@ -268,6 +328,7 @@ export function openDecision(logDir, tree, workflow, run, finished = []) {
             gate: header.Gate ?? null,
             sourceChanged: header["Source changed"] ?? null,
             status,
+            questions: items.length,
         };
     }
     return null;
diff --git a/dist/commands/workflow/status.js b/dist/commands/workflow/status.js
index 1dbad6bfa..ebe85c129 100644
--- a/dist/commands/workflow/status.js
+++ b/dist/commands/workflow/status.js
@@ -6,10 +6,10 @@ import { BKIT_DEBUG_GATES } from "../../install/manifest.js";
 import { appendFrictionRow, journalEnabled, pauseFrictionRow } from "../../ledgers/journal.js";
 import { resolveGitSha } from "../../ledgers/telemetry.js";
 import { readBkitConfig } from "../../shared/settings.js";
-import { activeDoneSteps, validateCiSelection, ciSelectionIdentity, allRunsDoneSteps, appendLine, fold, lastDoneStepAllRuns, lastRun, repeatStrategy, runNumber, runOrStepField, statusTimestamp, } from "../../ledgers/status.js";
+import { activeDoneSteps, validateCiSelection, ciSelectionIdentity, allRunsDoneSteps, appendLine, ENGINE_ROW_TYPES, fold, lastDoneStepAllRuns, lastRun, parseStatusLines, repeatStrategy, runNumber, runOrStepField, statusTimestamp, } from "../../ledgers/status.js";
 import { CommandError, EXIT, git, parseJson, resolveActiveRun, statusLocation, worktreeFingerprint, writeInvocation, } from "../lib.js";
 import { fixTestStep, gatedCheckStep } from "./loops.js";
-import { engineSibling, gateRerun, openDecision } from "./open-decision.js";
+import { gateRerun, openDecision } from "./open-decision.js";
 import { WORKFLOW_STEPS, isResumable, resumePoint } from "./step-table.js";
 // ---------------------------------------------------------------------------
 // Shared with counters / steps
@@ -79,18 +79,10 @@ const RENAMED_STEPS = {
 };
 /** Parse NDJSON status text; `label` names it in errors. Malformed is an error, never "no rows". */
 function parseStatusRows(text, label) {
-    return text
-        .split("\n")
-        .map((l) => l.trim())
-        .filter((l) => l !== "")
-        .map((l, i) => {
-        const parsed = parseJson(l);
-        if (!parsed.ok)
-            throw new CommandError(EXIT_NO_STATUS, `${label} line ${i + 1} is not JSON`);
-        if (typeof parsed.value !== "object" || parsed.value === null) {
-            throw new CommandError(EXIT_NO_STATUS, `${label} line ${i + 1} is not a JSON object`);
-        }
-        const row = parsed.value;
+    const parsed = parseStatusLines(text, label);
+    if ("line" in parsed)
+        throw new CommandError(EXIT_NO_STATUS, `${label} line ${parsed.line} is ${parsed.problem}`);
+    return parsed.rows.map((row) => {
         const renamed = typeof row.step === "string" ? RENAMED_STEPS[row.step] : undefined;
         return renamed === undefined ? row : { ...row, step: renamed };
     });
@@ -704,6 +696,7 @@ export const statusCommand = {
                 challengeDone: "build: true once the last allowed challenge round has merged, so Step 11 goes on to Step 12; null for other workflows",
                 gateRerun: "true when the active run's open decision file (as `workflows start` prints it in openDecision) has a Gate: FAIL header, Status: OPEN, From verify, holistic or tests, and the loop question as its only undecided question: re-run that gate instead of asking again; else false",
                 rerunFrom: "verify | holistic | tests: the open decision file's From header, the check whose gate re-runs; null when gateRerun is false",
+                questions: "the number of questions in the active run's open decision file (the loop question included), or null when no decision is open",
                 testVerdict: "debug: the verdict of the active run's last DONE debug-run-tests row (PASS|CONCERNS|FAIL), or null; other workflows null",
                 testSource: "debug: that row's source (local|ci), or null; other workflows null",
                 normalAttempt: "debug: the active run's DONE debug-run-tests rows (the round Steps 4-11 name their artifacts by), or null when there is none; other workflows null",
@@ -730,9 +723,13 @@ export const statusCommand = {
                 const round = debugTestRound(runs, workflow);
                 ctx.emit({
                     ...point,
-                    ...gateRerun(open, open === null ? "" : fs.readFileSync(path.resolve(root, open.file), "utf-8"), open === null || !fs.existsSync(path.resolve(root, engineSibling(open.file)))
-                        ? null
-                        : fs.readFileSync(path.resolve(root, engineSibling(open.file)), "utf-8")),
+                    ...gateRerun(open, open === null
+                        ? ""
+                        : (rel) => {
+                            const abs = path.resolve(root, rel);
+                            return fs.existsSync(abs) ? fs.readFileSync(abs, "utf-8") : null;
+                        }, open?.file),
+                    questions: open?.questions ?? null,
                     ...round,
                 });
                 if (workflow === "debug" && point.number > 3 && round.testVerdict === null) {
@@ -845,6 +842,8 @@ export const statusCommand = {
                     throw new CommandError(EXIT.USAGE, `--type ${type} is not kebab-case`);
                 if (FOLDED_TYPES.has(type))
                     throw new CommandError(EXIT.USAGE, `--type ${type} is folded; write it with its own verb`);
+                if (ENGINE_ROW_TYPES.has(type))
+                    throw new CommandError(EXIT.USAGE, `--type ${type} is written by the engine; use \`${type === "decision-counts" ? "decisions counts" : "decisions apply"}\``);
                 const fields = Object.fromEntries((ctx.flags.field ?? []).map(extraField));
                 const clash = ["type", "workflow", "at"].filter((k) => k in fields);
                 if (clash.length > 0)
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index b33d6d452..dadf18c00 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -21,7 +21,7 @@ import { CommandError, EXIT, git, isSharedBranch, parseJson, repoRoot, runGit, }
 import { activeRunStart, savedPointLimit } from "./counters.js";
 import { isResumable, runProgress, WORKFLOW_STEPS } from "./step-table.js";
 import { planFiles } from "./run-facts.js";
-import { engineSibling, skipProblem } from "./open-decision.js";
+import { skipProblem } from "./open-decision.js";
 import { mergeFindings, parseFindings, reportSection, unfencedLines } from "./challenge.js";
 import { fidProblem, normaliseFid, readIssueTracker } from "./fids.js";
 import { buildComment } from "./issues.js";
@@ -873,8 +873,10 @@ function continueCheck(cwd, decisionFile) {
     const read = readTextFile(path.resolve(cwd, decisionFile));
     if (!read.ok)
         return { check, ok: false, detail: `${decisionFile} is missing or unreadable` };
-    const engine = readTextFile(path.resolve(cwd, engineSibling(decisionFile)));
-    const problem = skipProblem(read.text, engine.ok ? engine.text : null);
+    const problem = skipProblem((rel) => {
+        const text = readTextFile(path.resolve(cwd, rel));
+        return text.ok ? text.text : null;
+    }, decisionFile);
     return problem === null
         ? { check, ok: true, detail: `${decisionFile} passes decisions skip` }
         : { check, ok: false, detail: `${decisionFile}: ${problem}` };
diff --git a/dist/commands/workflow/summary.js b/dist/commands/workflow/summary.js
index 094649c10..f1d2997db 100644
--- a/dist/commands/workflow/summary.js
+++ b/dist/commands/workflow/summary.js
@@ -4,7 +4,7 @@
 // disk and passes `read` for the log files.
 import { coversList } from "./plans.js";
 import { issueIdOf } from "./fids.js";
-import { decisionFileHeader, decisionItems, isEngineFile } from "./open-decision.js";
+import { decisionFileHeader, decisionItems } from "./open-decision.js";
 import { parsePlanBlocks } from "./plan-blocks.js";
 import { parseJson } from "../../shared/json.js";
 import { oneLine } from "../../shared/text.js";
@@ -340,7 +340,7 @@ export function buildSummary(input) {
         input.rows.forEach((row, index) => {
             if (row.type !== "step-done" || row.step !== "build-decision")
                 return;
-            for (const rel of artifactsOf(row).filter((a) => !isEngineFile(a))) {
+            for (const rel of artifactsOf(row)) {
                 if (read(rel) === null)
                     continue;
                 const header = decisionFileHeader(read, rel);
@@ -350,7 +350,7 @@ export function buildSummary(input) {
                 const group = /^[0-9]+$/.test(header.Group ?? "") ? Number(header.Group) : undefined;
                 if (rule.grouped && group === undefined)
                     continue;
-                const items = decisionItems(read, rel);
+                const items = decisionItems(read, rel, "build");
                 const gaps = items.filter((i) => i.title !== rule.loop);
                 const loop = items.filter((i) => i.title === rule.loop);
                 if (gaps.length === 0)
@@ -482,9 +482,8 @@ export function buildSummary(input) {
     // The Decision Pause: accepted items in this run's decision files.
     const decided = groups
         .filter((g) => g.step === "build-decision")
-        .flatMap((g) => g.rows.flatMap(({ row }) => artifactsOf(row)))
-        .filter((rel) => !isEngineFile(rel));
-    const acceptItems = decided.flatMap((rel) => decisionItems(read, rel)
+        .flatMap((g) => g.rows.flatMap(({ row }) => artifactsOf(row)));
+    const acceptItems = decided.flatMap((rel) => decisionItems(read, rel, "build")
         .filter((i) => /^Accept\b/.test(i.decision ?? ""))
         .map((i) => ({ assumed: i.assumed, line: `${rel}: Decision: ${i.decision}` })));
     // `Accept (assumed)`: taken without the owner (`ask: false` or headless); ship asks to confirm.
@@ -651,7 +650,7 @@ export function buildSummary(input) {
     items.push(...accepted.map((a) => `- Accepted: ${a}`));
     items.push(...assumed.map((a) => `- Assumed, not confirmed: ${a}`));
     for (const rel of workflow === "build" ? input.decisionFiles : []) {
-        if (decisionItems(read, rel).every((i) => i.decision === null))
+        if (decisionItems(read, rel, "build").every((i) => i.decision === null))
             items.push(`- \`${rel}\`: no decision recorded`);
     }
     for (const p of input.plans) {
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index 6630e8578..c44e26e16 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -38,7 +38,7 @@ import { agentContextBlock, buildBlock, chatFingerprint, ciList, claudeTranscrip
 import { buildSummary, refOf, SUMMARY_WORKFLOWS } from "./summary.js";
 import { parsePlans, parseWorkstreams } from "./plans.js";
 import { EXIT_LOCK_BUSY, EXIT_REMOVE_FAILED, EXIT_SPLIT_BUCKET, acquireWorkflowLock, owns, readHolder, readRunsLenient, releaseLock, resolveMonth, workflowLockPath, } from "./locks.js";
-import { isEngineFile, openDecision } from "./open-decision.js";
+import { openDecision } from "./open-decision.js";
 import { highestVersion } from "./plan-versions.js";
 import { mergePr, probePr } from "./prs.js";
 import { FEATURE_STATUS } from "./roadmap.js";
@@ -1494,7 +1494,7 @@ function summaryVerb(ctx) {
         decisionFiles: (workflow === "build" || workflow === "ship") && fs.existsSync(logDir)
             ? fs
                 .readdirSync(logDir)
-                .filter((f) => /^build-decision-.*\.md$/.test(f) && !isEngineFile(f))
+                .filter((f) => /^build-decision-.*\.md$/.test(f))
                 .sort()
                 .map((f) => rel(path.join(logDir, f)))
             : [],
diff --git a/dist/ledgers/status.js b/dist/ledgers/status.js
index 3fed7a038..336391312 100644
--- a/dist/ledgers/status.js
+++ b/dist/ledgers/status.js
@@ -354,6 +354,32 @@ export function fold(events) {
     }
     return runs;
 }
+/** Row types only the engine appends: `decisions counts` and `decisions apply`; `status row` refuses them. */
+export const ENGINE_ROW_TYPES = new Set([
+    "decision-counts",
+    "decision-answer",
+]);
+/**
+ * Parse NDJSON status text in file order. A line that is not a JSON object comes back as
+ * `{ line, problem }` (1-based among the non-blank lines), never as "no rows". Imports nothing
+ * from `commands/`, so a reader of decision rows needs no command module.
+ */
+export function parseStatusLines(text, _label) {
+    const rows = [];
+    const lines = text
+        .split("\n")
+        .map((l) => l.trim())
+        .filter((l) => l !== "");
+    for (const [i, l] of lines.entries()) {
+        const parsed = parseJson(l);
+        if (!parsed.ok)
+            return { line: i + 1, problem: "not JSON" };
+        if (typeof parsed.value !== "object" || parsed.value === null)
+            return { line: i + 1, problem: "not a JSON object" };
+        rows.push(parsed.value);
+    }
+    return { rows };
+}
 /** True for a parsed `status.jsonl` row that is a complete `invocation` event. */
 export function isInvocationEvent(value) {
     if (value === null || typeof value !== "object")
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 1be3dc85c..9d1703b56 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -126,15 +126,15 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>265 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1974 symbols · 59 files"]
+    n_bkit_core_engine_commands["commands<br/>1977 symbols · 59 files"]
     n_bkit_core_engine_install["install<br/>370 symbols · 21 files"]
-    n_bkit_core_engine_ledgers["ledgers<br/>241 symbols · 6 files"]
+    n_bkit_core_engine_ledgers["ledgers<br/>246 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>157 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands -->|475| n_bkit_core_engine_ledgers
-  n_bkit_core_engine_commands -->|426| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|489| n_bkit_core_engine_ledgers
+  n_bkit_core_engine_commands -->|425| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|221| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|187| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|147| n_bkit_core_engine_shared
@@ -143,7 +143,7 @@ flowchart LR
   n_bkit_core_engine_install -->|64| n_bkit_core_engine_render
   n_bkit_core_engine_commands -->|42| n_bkit_core_engine_render
   n_bkit_core_engine_cli -->|35| n_bkit_core_engine_commands
-  n_bkit_core_engine_ledgers -->|19| n_bkit_core_engine_shared
+  n_bkit_core_engine_ledgers -->|20| n_bkit_core_engine_shared
   n_bkit_core_engine_checks -->|18| n_bkit_core_engine_commands
   n_bkit_core_engine_install -->|17| n_bkit_core_engine_checks
   n_bkit_core_engine_shared -->|16| n_bkit_core_engine_install
@@ -275,7 +275,7 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_completeness["completeness<br/>4 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_context["context<br/>92 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_counters["counters<br/>30 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_decisions["decisions<br/>24 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_decisions["decisions<br/>23 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_disk["disk<br/>56 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_fids["fids<br/>58 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_issues["issues<br/>46 symbols · 1 files"]
@@ -283,7 +283,7 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_ledgers["ledgers<br/>130 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_locks["locks<br/>40 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_loops["loops<br/>7 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_open_decision["open-decision<br/>26 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_open_decision["open-decision<br/>30 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_plan_blocks["plan-blocks<br/>35 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_plans["plans<br/>15 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_prs["prs<br/>56 symbols · 1 files"]
@@ -323,7 +323,7 @@ flowchart LR
     subgraph gn_bkit_core_engine_ledgers[".bkit/core/engine/ledgers"]
       n_bkit_core_engine_ledgers_compact["compact<br/>8 symbols · 1 files"]
       n_bkit_core_engine_ledgers_journal["journal<br/>18 symbols · 1 files"]
-      n_bkit_core_engine_ledgers_status["status<br/>83 symbols · 1 files"]
+      n_bkit_core_engine_ledgers_status["status<br/>88 symbols · 1 files"]
     end
     subgraph gn_bkit_core_engine_render[".bkit/core/engine/render"]
       n_bkit_core_engine_render_hosts["hosts<br/>29 symbols · 1 files"]
@@ -353,10 +353,10 @@ flowchart LR
   n_bkit_core_engine_commands_ci_ci -->|38| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_steps -->|36| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_workflows -->|33| n_bkit_core_engine_commands_workflow_tracker
+  n_bkit_core_engine_commands_workflow_status -->|32| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_issues -->|31| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_workflows -->|30| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_workflows -->|30| n_bkit_core_engine_commands_workflow_run_facts
-  n_bkit_core_engine_commands_workflow_status -->|29| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_runs -->|28| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_status -->|27| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_counters -->|26| n_bkit_core_engine_commands_workflow_status
@@ -370,7 +370,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_branches -->|23| n_bkit_core_engine_commands_workflow_worktrees
   n_bkit_core_engine_commands_workflow_workflows -->|23| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_checks_after_tools -->|22| n_bkit_core_engine_install_project_docs
-  n_bkit_core_engine_commands_workflow_decisions -->|22| n_bkit_core_engine_commands_workflow_open_decision
   n_bkit_core_engine_tools_instructions -->|22| n_bkit_core_engine_tools_instructions_sources
   n_bkit_core_engine_checks_after_index -->|21| n_bkit_core_engine_checks_after_ci_yml
   n_bkit_core_engine_commands_workflow_branches -->|20| n_bkit_core_engine_commands_land
@@ -386,6 +385,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_workflows -->|18| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_workflow_branches -->|17| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_counters -->|17| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_decisions -->|17| n_bkit_core_engine_commands_workflow_open_decision
   n_bkit_core_engine_commands_workflow_runs -->|17| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_workflow_tasks -->|17| n_bkit_core_engine_commands_workflow_plan_blocks
   n_bkit_core_engine_ledgers_journal -->|17| n_bkit_core_engine_ledgers_telemetry
@@ -531,7 +531,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_commands_workflow_fids
   n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_commands_workflow_locks
   n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_ledgers_journal
-  n_bkit_core_engine_commands_workflow_summary -->|7| n_bkit_core_engine_commands_workflow_open_decision
   n_bkit_core_engine_commands_workflow_summary -->|7| n_bkit_core_engine_commands_workflow_plans
   n_bkit_core_engine_commands_workflow_workflows -->|7| n_bkit_core_engine_commands_workflow_summary
   n_bkit_core_engine_install_modules_core -->|7| n_bkit_core_engine_install_template_copies
@@ -561,6 +560,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_disk -->|6| n_bkit_core_engine_checks_before_env
   n_bkit_core_engine_commands_workflow_issues -->|6| n_bkit_core_engine_shared_settings
   n_bkit_core_engine_commands_workflow_issues -->|6| n_bkit_core_engine_commands_workflow_audit_report
+  n_bkit_core_engine_commands_workflow_open_decision -->|6| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_plans -->|6| n_bkit_core_engine_commands_workflow_tracker
   n_bkit_core_engine_commands_workflow_steps -->|6| n_bkit_core_engine_commands_workflow_step_table
   n_bkit_core_engine_commands_workflow_summary -->|6| n_bkit_core_engine_commands_workflow_summary_findings
