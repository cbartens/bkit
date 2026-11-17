diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index 470459342..fabb886ad 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -247,7 +247,7 @@ description: "Build Feature — Autonomous implementation"
      - **Else** → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1.
    - **If** any item was answered `Fix now` → `DECISION_ROUTE` = `fix`.
    - **If** the loop question was answered `Try again` → `DECISION_ROUTE` = `retry`.
-   - **If** `From: verify` or `From: holistic` with every item answered `Accept` or `Accept (assumed)`, the loop question (when asked) answered `Decide`, and no `Gate: FAIL` header → `DECISION_ROUTE` = `continue`. The answers changed no code and asked for no round, so a re-run would return what they already settled.
+   - **If** `From: verify` or `From: holistic` with every item answered `Accept` or `Accept (assumed)`, the loop question (when asked) answered `Decide`, no `Gate: FAIL` header, **and** no source changed since the paused verify (`SOURCE_CHANGED` = false: the pause came from Step 8 or Step 10 sub-steps 5-6, or the `branches scan-diff` in Step 9 or Step 10 sub-step 10 exited 1) → `DECISION_ROUTE` = `continue`. The answers changed no code and asked for no round, so a re-run would return what they already settled. A pause reached with scan-diff exit 0 and `VERIFY_FIXED` / `HOLISTIC_FIXED` = 0 has edited source the verify never saw, so it keeps the re-run.
    - **If** `From: holistic` → `DECISION_ROUTE` = `holistic`.
    - **If** `From: verify` → `DECISION_ROUTE` = `verify`.
    - **If** `From: summary` → `DECISION_ROUTE` = `summary`.
@@ -274,6 +274,14 @@ description: "Build Feature — Autonomous implementation"
 
    **If** exit >= 2 → **Failure Path**.
 
+   **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → tick the accepted gaps' tasks before the decision is recorded, so a resume either reopens the unrecorded decision (the tick already made is kept) or finds the tasks ticked:
+
+   ```bash
+   "{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
+   ```
+
+   **If** exit != 0 → **Failure Path**.
+
    Record the decision and its route. The loop counts are not reset:
 
    ```bash
@@ -286,7 +294,7 @@ description: "Build Feature — Autonomous implementation"
    - **If** `DECISION_ROUTE` = `retry` **and** `From: holistic` → Step 10 sub-step 7.
    - **If** `DECISION_ROUTE` = `retry` → Step 13.
    - **If** `DECISION_ROUTE` = `continue` **and** `From: holistic` → Step 11.
-   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run `"{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, then Step 7.
+   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run `"{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
    - **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
    - **If** `DECISION_ROUTE` = `holistic` → re-run Step 10.
    - **If** `DECISION_ROUTE` = `summary` → Step 15.
@@ -729,7 +737,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
     Hold `value` as `VERIFY_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
-    Set `PAUSE_STEP` = 8 and `PAUSE_POINT` = `build.verify`.
+    Set `PAUSE_STEP` = 8, `PAUSE_POINT` = `build.verify` and `SOURCE_CHANGED` = false.
     **If** `GATE_RERUN` = true **and** `GATE_VERDICT` = FAIL → clear `GATE_RERUN`, `PAUSE_QUESTION` = `VERIFY_GAPS`, `PAUSE_LOOP` = `verify` → **Decision Pause** — the re-run gate is still red, so the pause is asked again with fresh numbers.
     **If** `LIMIT_ASK` = true **and** either exit 1 **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `verify`, so the pause also asks whether to try another round.
     Route — first match wins:
@@ -821,7 +829,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
    ```
-   Exit 1 means the attempt changed no source file.
+   Exit 1 means the attempt changed no source file. Hold `SOURCE_CHANGED` = true on exit 0, else false.
    Route — first match wins:
    - **If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS`. **If** `GATE_VERDICT` = FAIL → also `PAUSE_LOOP` = `verify`, so the pause asks the loop question about the red gate → **Decision Pause**.
    - **If** exit 0 → re-run Step 8.
@@ -883,7 +891,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" counters route --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --file="{STATUS}" --workflow=build --point=build.holistic --continue=within-limit --exceeded=failure-path
    ```
    Hold `value` as `HOLISTIC_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
-   Set `PAUSE_STEP` = 10 and `PAUSE_POINT` = `build.holistic`.
+   Set `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.holistic` and `SOURCE_CHANGED` = false.
    **If** `LIMIT_ASK` = true **and** exit 1 → `PAUSE_LOOP` = `holistic`, so the pause also asks whether to try another round.
    Route — first match wins:
    - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.holistic.maxAttempts` is used up, so the owner decides.
@@ -916,7 +924,7 @@ This step checks the whole feature against the plan after the last group, and ag
     ```bash
     cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
     ```
-    Exit 1 means the attempt changed no source file.
+    Exit 1 means the attempt changed no source file. Hold `SOURCE_CHANGED` = true on exit 0, else false.
     Route — first match wins:
     - **If** exit 1 **or** `HOLISTIC_FIXED` = 0 → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.holistic`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
     - **If** exit 0 → re-run Step 10.
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index 31633005a..81ea29137 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -247,7 +247,7 @@ description: "Build Feature — Autonomous implementation"
      - **Else** → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1.
    - **If** any item was answered `Fix now` → `DECISION_ROUTE` = `fix`.
    - **If** the loop question was answered `Try again` → `DECISION_ROUTE` = `retry`.
-   - **If** `From: verify` or `From: holistic` with every item answered `Accept` or `Accept (assumed)`, the loop question (when asked) answered `Decide`, and no `Gate: FAIL` header → `DECISION_ROUTE` = `continue`. The answers changed no code and asked for no round, so a re-run would return what they already settled.
+   - **If** `From: verify` or `From: holistic` with every item answered `Accept` or `Accept (assumed)`, the loop question (when asked) answered `Decide`, no `Gate: FAIL` header, **and** no source changed since the paused verify (`SOURCE_CHANGED` = false: the pause came from Step 8 or Step 10 sub-steps 5-6, or the `branches scan-diff` in Step 9 or Step 10 sub-step 10 exited 1) → `DECISION_ROUTE` = `continue`. The answers changed no code and asked for no round, so a re-run would return what they already settled. A pause reached with scan-diff exit 0 and `VERIFY_FIXED` / `HOLISTIC_FIXED` = 0 has edited source the verify never saw, so it keeps the re-run.
    - **If** `From: holistic` → `DECISION_ROUTE` = `holistic`.
    - **If** `From: verify` → `DECISION_ROUTE` = `verify`.
    - **If** `From: summary` → `DECISION_ROUTE` = `summary`.
@@ -274,6 +274,14 @@ description: "Build Feature — Autonomous implementation"
 
    **If** exit >= 2 → **Failure Path**.
 
+   **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → tick the accepted gaps' tasks before the decision is recorded, so a resume either reopens the unrecorded decision (the tick already made is kept) or finds the tasks ticked:
+
+   ```bash
+   "{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
+   ```
+
+   **If** exit != 0 → **Failure Path**.
+
    Record the decision and its route. The loop counts are not reset:
 
    ```bash
@@ -286,7 +294,7 @@ description: "Build Feature — Autonomous implementation"
    - **If** `DECISION_ROUTE` = `retry` **and** `From: holistic` → Step 10 sub-step 7.
    - **If** `DECISION_ROUTE` = `retry` → Step 13.
    - **If** `DECISION_ROUTE` = `continue` **and** `From: holistic` → Step 11.
-   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run `"{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, then Step 7.
+   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run `"{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
    - **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
    - **If** `DECISION_ROUTE` = `holistic` → re-run Step 10.
    - **If** `DECISION_ROUTE` = `summary` → Step 15.
@@ -729,7 +737,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
     Hold `value` as `VERIFY_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
-    Set `PAUSE_STEP` = 8 and `PAUSE_POINT` = `build.verify`.
+    Set `PAUSE_STEP` = 8, `PAUSE_POINT` = `build.verify` and `SOURCE_CHANGED` = false.
     **If** `GATE_RERUN` = true **and** `GATE_VERDICT` = FAIL → clear `GATE_RERUN`, `PAUSE_QUESTION` = `VERIFY_GAPS`, `PAUSE_LOOP` = `verify` → **Decision Pause** — the re-run gate is still red, so the pause is asked again with fresh numbers.
     **If** `LIMIT_ASK` = true **and** either exit 1 **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `verify`, so the pause also asks whether to try another round.
     Route — first match wins:
@@ -821,7 +829,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
    ```
-   Exit 1 means the attempt changed no source file.
+   Exit 1 means the attempt changed no source file. Hold `SOURCE_CHANGED` = true on exit 0, else false.
    Route — first match wins:
    - **If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS`. **If** `GATE_VERDICT` = FAIL → also `PAUSE_LOOP` = `verify`, so the pause asks the loop question about the red gate → **Decision Pause**.
    - **If** exit 0 → re-run Step 8.
@@ -883,7 +891,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" counters route --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --file="{STATUS}" --workflow=build --point=build.holistic --continue=within-limit --exceeded=failure-path
    ```
    Hold `value` as `HOLISTIC_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
-   Set `PAUSE_STEP` = 10 and `PAUSE_POINT` = `build.holistic`.
+   Set `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.holistic` and `SOURCE_CHANGED` = false.
    **If** `LIMIT_ASK` = true **and** exit 1 → `PAUSE_LOOP` = `holistic`, so the pause also asks whether to try another round.
    Route — first match wins:
    - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.holistic.maxAttempts` is used up, so the owner decides.
@@ -916,7 +924,7 @@ This step checks the whole feature against the plan after the last group, and ag
     ```bash
     cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
     ```
-    Exit 1 means the attempt changed no source file.
+    Exit 1 means the attempt changed no source file. Hold `SOURCE_CHANGED` = true on exit 0, else false.
     Route — first match wins:
     - **If** exit 1 **or** `HOLISTIC_FIXED` = 0 → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.holistic`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
     - **If** exit 0 → re-run Step 10.
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index da0eaf354..462dc69cf 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -2333,6 +2333,32 @@ describe("build Decision Pause continue route", () => {
     const { line } = routeRule(pause(), "continue");
     expect(line).toMatch(/no `Gate: FAIL`/);
   });
+
+  it("continue is never set after a fix round that changed source files", () => {
+    const { line } = routeRule(pause(), "continue");
+    expect(line).toMatch(/source/i);
+    expect(line).toMatch(/changed|scan-diff/i);
+  });
+
+  it("the continue decision tick runs before the build-decision row is recorded", () => {
+    const lines = pause().split("\n");
+    const tick = lines.findIndex((l) => /tasks tick[^\n]*--decision=/.test(l));
+    const record = lines.findIndex((l) =>
+      l.includes("steps finish --workflow=build --step=build-decision"),
+    );
+    expect(tick, "no tasks tick --decision line").toBeGreaterThanOrEqual(0);
+    expect(record, "no build-decision steps finish line").toBeGreaterThanOrEqual(0);
+    expect(tick).toBeLessThan(record);
+  });
+
+  it("the continue decision tick routes a non-zero exit to the Failure Path", () => {
+    const verifyRoute = continueRoutes(pause())
+      .filter((l) => /From: verify/.test(l))
+      .join("\n");
+    expect(verifyRoute).not.toBe("");
+    expect(verifyRoute).toMatch(/non-zero|exit/i);
+    expect(verifyRoute).toContain("Failure Path");
+  });
 });
 
 describe("questions never re-run a check without a change", () => {
diff --git a/.bkit/core/engine/commands/workflow/summary.test.ts b/.bkit/core/engine/commands/workflow/summary.test.ts
index 8566189c5..f833be220 100644
--- a/.bkit/core/engine/commands/workflow/summary.test.ts
+++ b/.bkit/core/engine/commands/workflow/summary.test.ts
@@ -655,6 +655,29 @@ describe("buildSummary", () => {
       expect(s.verdict).not.toBe("FAIL");
     });
 
+    it("an all-Accept holistic pause with a Decide loop question settles the holistic FAIL", () => {
+      const loop = (answer: string) => [
+        "**Q3 — Holistic verify:** the round limit is used up, go on?",
+        "Options: A) Decide / B) Try again",
+        "Recommended: A) Decide",
+        `Decision: ${answer}`,
+        "",
+      ];
+      const withLoop = (answer: string) =>
+        [pause("Accept — minor", "Accept (assumed) — headless"), ...loop(answer)].join("\n");
+      const settled = run(withLoop("Decide"));
+      expect(settled.reasons).not.toContain("build-plan-verify-holistic FAIL");
+      expect(settled.reasons).not.toContain("build-plan-gaps-remediate-holistic FAIL");
+      expect(settled.markdown.split("## Resolved Findings")[1]!.split("## ")[0]!).toContain(
+        "build-plan-verify-holistic FAIL, resolved by the Decision Pause",
+      );
+      expect(settled.verdict).not.toBe("FAIL");
+
+      const again = run(withLoop("Try again"));
+      expect(again.reasons).toContain("build-plan-verify-holistic FAIL");
+      expect(again.verdict).toBe("FAIL");
+    });
+
     it("a holistic pause with a Fix now item settles nothing", () => {
       const s = run(pause("Accept — minor", "Fix now"));
       expect(s.reasons).toContain("build-plan-verify-holistic FAIL");
diff --git a/.bkit/core/engine/commands/workflow/summary.ts b/.bkit/core/engine/commands/workflow/summary.ts
index 089480dca..0d9c70847 100644
--- a/.bkit/core/engine/commands/workflow/summary.ts
+++ b/.bkit/core/engine/commands/workflow/summary.ts
@@ -426,8 +426,11 @@ export function buildSummary(input: SummaryInput): Summary {
         const text = read(rel);
         if (text === null || decisionHeader(text).From !== "holistic") continue;
         const items = parseDecisionItems(text);
-        if (items.length === 0) continue;
-        if (!items.every((i) => /^Accept\b/.test(i.decision ?? ""))) continue;
+        const gaps = items.filter((i) => i.title !== "Holistic verify");
+        const loop = items.filter((i) => i.title === "Holistic verify");
+        if (gaps.length === 0) continue;
+        if (!gaps.every((i) => /^Accept\b/.test(i.decision ?? ""))) continue;
+        if (!loop.every((i) => /^Decide\b/.test(i.decision ?? ""))) continue;
         holistic = { index, rel };
       }
     });
diff --git a/.bkit/core/engine/commands/workflow/tasks.test.ts b/.bkit/core/engine/commands/workflow/tasks.test.ts
index 3133600ef..68fce6bc8 100644
--- a/.bkit/core/engine/commands/workflow/tasks.test.ts
+++ b/.bkit/core/engine/commands/workflow/tasks.test.ts
@@ -164,6 +164,22 @@ describe("bkit tasks tick", () => {
     ]);
   });
 
+  it("tick --decision ticks a task whose item title reads TASK {N}", async () => {
+    const plan = write("plan.md", planText(group(1, task(1), task(2), task(3))));
+    const decision = write(
+      "decision.md",
+      decisionFile(["TASK 3", "Accept — minor"], ["TASK 2", "Fix now"]),
+    );
+    const r = await run(["tick", `--plan=${plan}`, "--group=1", `--decision=${decision}`]);
+    expect(r.code).toBe(0);
+    expect(r.json.ticked).toEqual([3]);
+    expect([tickOf(read(plan), 1), tickOf(read(plan), 2), tickOf(read(plan), 3)]).toEqual([
+      " ",
+      " ",
+      "x",
+    ]);
+  });
+
   it("tick --decision leaves a Fix now item's task open", async () => {
     const plan = write("plan.md", planText(group(1, task(1), task(2), task(3))));
     const decision = write(
diff --git a/.bkit/core/engine/commands/workflow/tasks.ts b/.bkit/core/engine/commands/workflow/tasks.ts
index 1303bf4ed..a7d6b5a58 100644
--- a/.bkit/core/engine/commands/workflow/tasks.ts
+++ b/.bkit/core/engine/commands/workflow/tasks.ts
@@ -216,7 +216,7 @@ export const tasksCommand: CommandSpec = {
             throw new CommandError(EXIT.USAGE, `--decision ${decisionArg} does not exist`);
           const accepted = parseDecisionItems(fs.readFileSync(decisionFile, "utf-8"))
             .filter((it) => it.decision !== null && /^Accept\b/.test(it.decision))
-            .map((it) => /\bTask (\d+)\b/.exec(it.title))
+            .map((it) => /\btask\s+(\d+)\b/i.exec(it.title))
             .filter((m): m is RegExpExecArray => m !== null)
             .map((m) => Number(m[1]));
           named = [...(named ?? []), ...accepted].filter((n) =>
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index b69bf340f..a260b11c7 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -265,7 +265,7 @@ description: "Build Feature — Autonomous implementation"
      - **Else** → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1.
    - **If** any item was answered `Fix now` → `DECISION_ROUTE` = `fix`.
    - **If** the loop question was answered `Try again` → `DECISION_ROUTE` = `retry`.
-   - **If** `From: verify` or `From: holistic` with every item answered `Accept` or `Accept (assumed)`, the loop question (when asked) answered `Decide`, and no `Gate: FAIL` header → `DECISION_ROUTE` = `continue`. The answers changed no code and asked for no round, so a re-run would return what they already settled.
+   - **If** `From: verify` or `From: holistic` with every item answered `Accept` or `Accept (assumed)`, the loop question (when asked) answered `Decide`, no `Gate: FAIL` header, **and** no source changed since the paused verify (`SOURCE_CHANGED` = false: the pause came from Step 8 or Step 10 sub-steps 5-6, or the `branches scan-diff` in Step 9 or Step 10 sub-step 10 exited 1) → `DECISION_ROUTE` = `continue`. The answers changed no code and asked for no round, so a re-run would return what they already settled. A pause reached with scan-diff exit 0 and `VERIFY_FIXED` / `HOLISTIC_FIXED` = 0 has edited source the verify never saw, so it keeps the re-run.
    - **If** `From: holistic` → `DECISION_ROUTE` = `holistic`.
    - **If** `From: verify` → `DECISION_ROUTE` = `verify`.
    - **If** `From: summary` → `DECISION_ROUTE` = `summary`.
@@ -292,6 +292,14 @@ description: "Build Feature — Autonomous implementation"
 
    **If** exit >= 2 → **Failure Path**.
 
+   **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → tick the accepted gaps' tasks before the decision is recorded, so a resume either reopens the unrecorded decision (the tick already made is kept) or finds the tasks ticked:
+
+   ```bash
+   "{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
+   ```
+
+   **If** exit != 0 → **Failure Path**.
+
    Record the decision and its route. The loop counts are not reset:
 
    ```bash
@@ -304,7 +312,7 @@ description: "Build Feature — Autonomous implementation"
    - **If** `DECISION_ROUTE` = `retry` **and** `From: holistic` → Step 10 sub-step 7.
    - **If** `DECISION_ROUTE` = `retry` → Step 13.
    - **If** `DECISION_ROUTE` = `continue` **and** `From: holistic` → Step 11.
-   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run `"{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, then Step 7.
+   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run `"{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
    - **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
    - **If** `DECISION_ROUTE` = `holistic` → re-run Step 10.
    - **If** `DECISION_ROUTE` = `summary` → Step 15.
@@ -770,7 +778,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
     Hold `value` as `VERIFY_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
-    Set `PAUSE_STEP` = 8 and `PAUSE_POINT` = `build.verify`.
+    Set `PAUSE_STEP` = 8, `PAUSE_POINT` = `build.verify` and `SOURCE_CHANGED` = false.
     **If** `GATE_RERUN` = true **and** `GATE_VERDICT` = FAIL → clear `GATE_RERUN`, `PAUSE_QUESTION` = `VERIFY_GAPS`, `PAUSE_LOOP` = `verify` → **Decision Pause** — the re-run gate is still red, so the pause is asked again with fresh numbers.
     **If** `LIMIT_ASK` = true **and** either exit 1 **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `verify`, so the pause also asks whether to try another round.
     Route — first match wins:
@@ -862,7 +870,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
    ```
-   Exit 1 means the attempt changed no source file.
+   Exit 1 means the attempt changed no source file. Hold `SOURCE_CHANGED` = true on exit 0, else false.
    Route — first match wins:
    - **If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS`. **If** `GATE_VERDICT` = FAIL → also `PAUSE_LOOP` = `verify`, so the pause asks the loop question about the red gate → **Decision Pause**.
    - **If** exit 0 → re-run Step 8.
@@ -924,7 +932,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" counters route --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --file="{STATUS}" --workflow=build --point=build.holistic --continue=within-limit --exceeded=failure-path
    ```
    Hold `value` as `HOLISTIC_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
-   Set `PAUSE_STEP` = 10 and `PAUSE_POINT` = `build.holistic`.
+   Set `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.holistic` and `SOURCE_CHANGED` = false.
    **If** `LIMIT_ASK` = true **and** exit 1 → `PAUSE_LOOP` = `holistic`, so the pause also asks whether to try another round.
    Route — first match wins:
    - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.holistic.maxAttempts` is used up, so the owner decides.
@@ -957,7 +965,7 @@ This step checks the whole feature against the plan after the last group, and ag
     ```bash
     cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
     ```
-    Exit 1 means the attempt changed no source file.
+    Exit 1 means the attempt changed no source file. Hold `SOURCE_CHANGED` = true on exit 0, else false.
     Route — first match wins:
     - **If** exit 1 **or** `HOLISTIC_FIXED` = 0 → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.holistic`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
     - **If** exit 0 → re-run Step 10.
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index a9f5194b8..26507086b 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -1155,7 +1155,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-adoption`, `bkit-audit-dependencies`, `bkit-audit-usability`
 - drift:
-  - `bkit-build:450`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-build:458`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
   - `bkit-design:208`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
@@ -1252,7 +1252,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-adoption`, `bkit-audit-dependencies`, `bkit-audit-repo`, `bkit-audit-usability`
 - drift:
-  - `bkit-build:450`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-build:458`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
   - `bkit-design:208`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
@@ -10141,17 +10141,19 @@ No-progress holistic round routed
 **Else** → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1.
 **If** any item was answered `Fix now` → `DECISION_ROUTE` = `fix`.
 **If** the loop question was answered `Try again` → `DECISION_ROUTE` = `retry`.
-**If** `From: verify` or `From: holistic` with every item answered `Accept` or `Accept (assumed)`, the loop question (when asked) answered `Decide`, and no `Gate: FAIL` header → `DECISION_ROUTE` = `continue`. The answers changed no code and asked for no round, so a re-run would return what they already settled.
+**If** `From: verify` or `From: holistic` with every item answered `Accept` or `Accept (assumed)`, the loop question (when asked) answered `Decide`, no `Gate: FAIL` header, **and** no source changed since the paused verify (`SOURCE_CHANGED` = false: the pause came from Step 8 or Step 10 sub-steps 5-6, or the `branches scan-diff` in Step 9 or Step 10 sub-step 10 exited 1) → `DECISION_ROUTE` = `continue`. The answers changed no code and asked for no round, so a re-run would return what they already settled. A pause reached with scan-diff exit 0 and `VERIFY_FIXED` / `HOLISTIC_FIXED` = 0 has edited source the verify never saw, so it keeps the re-run.
 **If** `From: verify` → `DECISION_ROUTE` = `verify`.
 **If** `From: summary` → `DECISION_ROUTE` = `summary`.
 **Else** → `DECISION_ROUTE` = `tests`. This covers `From: tests` and `From: challenge`.
 **If** `From: verify`:
 **If** exit >= 2 → **Failure Path**.
+**If** `DECISION_ROUTE` = `continue` **and** `From: verify` → tick the accepted gaps' tasks before the decision is recorded, so a resume either reopens the unrecorded decision (the tick already made is kept) or finds the tasks ticked:
+**If** exit != 0 → **Failure Path**.
 **If** `DECISION_ROUTE` = `fix` → Step 7.
 **If** `DECISION_ROUTE` = `retry` **and** `From: verify` → Step 9.
 **If** `DECISION_ROUTE` = `retry` → Step 13.
 **If** `DECISION_ROUTE` = `continue` **and** `From: holistic` → Step 11.
-**If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run `"{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, then Step 7.
+**If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run `"{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
 **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
 **If** `DECISION_ROUTE` = `summary` → Step 15.
 [workflow-pushes] Record the wait (step 4 `owner-pause` block). Create `docs/plans/{YYYYMM}/logs/{FID}/build-handover.md` = the decision file plus the line `Stopped by the owner ({RUNTIME}); run stays IN_PROGRESS. /bkit-build {REF} resumes at this pause.`; `REF` empty → `{FID}`. Then keep the record:
diff --git a/.bkit/version b/.bkit/version
index 0244d11c1..743537e55 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -15,7 +15,7 @@
     ".bkit/.env.example": "33195c635ab4b35dea8990a278bb28193f4b5f331dcbdc5c975aeb5f51743e41",
     ".opencode/opencode.json": "83dbad6e236be57944702da355ea2d823db481408f14a4b9f522225d2ed27d75",
     ".claude/commands/bkit-auto.md": "2fb94062947b55466f7baed87ee27347e2626d6a43200691ff68cb7f62a0947f",
-    ".claude/commands/bkit-build.md": "a0e4540a0c07e92e74b2e0386d63343f061295d2efd6f5c42f1f3c64b7a8e5c7",
+    ".claude/commands/bkit-build.md": "9a5676a0dc31c369abf57e2c766c09b89d9caf53d0b3641f3e7c59f9a3c30df6",
     ".claude/commands/bkit-debug.md": "025f3de595d6365f43d4f986b5e06e36c8ffa6441c7eb61be34f05150a3f7912",
     ".claude/commands/bkit-design.md": "0757693c8e91c830aa36220a928a72d81aedb72cc51207364319214bd3902c6a",
     ".claude/commands/bkit-plan.md": "10d26eccf148db714a03d5883f1a95722dcab09d29c34d3532245e188ff4abe2",
@@ -47,7 +47,7 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "1b7656fc438127f67b566c9f532e6a39649c79e1bda1814608a4f3d44daed45b",
     ".claude/agents/bkit-utility-update-documentation.md": "58eef51a24cbbd53a16c12cf603888fc4a98963bb7dadbde0b60a7e3207eb43c",
     ".cursor/commands/bkit-auto.md": "f363b93008d334ca20e3825f5a734cd5cd0b5ad27e4287c0231985702653826a",
-    ".cursor/commands/bkit-build.md": "840a9054d9a9ca791859f6d0dd62cbb2a5291fec047ada7af761108022db98cb",
+    ".cursor/commands/bkit-build.md": "986bbbc3415511f1418d707910aab092f87e5cf1d8e2f343f044093ff6d4e8c8",
     ".cursor/commands/bkit-debug.md": "c59d2b8a4f7577d5ac23d9454718097943831916340f87655b1cfdca6641305b",
     ".cursor/commands/bkit-design.md": "8129e74e460ed742c62fb07830d099d365b6981c7094960eaeecd27811803e2b",
     ".cursor/commands/bkit-plan.md": "54493f905560e350148948e666c12b5f92b328bcab6af88608fdcee9006458c8",
@@ -105,7 +105,7 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "f2f08f6e4de6311dd5f6a4f0573b234d31bae1e0f5d1c4c071969ca978140ee9",
     ".opencode/agents/bkit-utility-update-documentation.md": "5b274f7a0f331ee4c1ea2bcfc44a5d7855e0756e94e99dafd3d17ef942f3a032",
     ".opencode/commands/bkit-auto.md": "973d91ed58716f8b8be1009c3f2f686051cf1c8a617b14c3775814e7b356debb",
-    ".opencode/commands/bkit-build.md": "9d8a594d9050dd24d97842d421a27fe4c323c2b88426fff10a222f0e455c67bf",
+    ".opencode/commands/bkit-build.md": "777e6e69598047b9009e34d5adf8b72f92cd8d8821410ea0cdf96e2e20d20d7e",
     ".opencode/commands/bkit-debug.md": "6a54040b8fb2bb18f98eac785ef39463ef216726e9660890eb6aab9b99cb3ee6",
     ".opencode/commands/bkit-design.md": "0d78ce47215552943f6628ddb8fadcae403ab219413e331289349b65e9955953",
     ".opencode/commands/bkit-plan.md": "d7d6d757dec7dfefe9630b273ab0348de156e2af4dc723519ce33f2db751b0b8",
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index cdc45099a..97811620d 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -246,7 +246,7 @@ description: "Build Feature — Autonomous implementation"
      - **Else** → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1.
    - **If** any item was answered `Fix now` → `DECISION_ROUTE` = `fix`.
    - **If** the loop question was answered `Try again` → `DECISION_ROUTE` = `retry`.
-   - **If** `From: verify` or `From: holistic` with every item answered `Accept` or `Accept (assumed)`, the loop question (when asked) answered `Decide`, and no `Gate: FAIL` header → `DECISION_ROUTE` = `continue`. The answers changed no code and asked for no round, so a re-run would return what they already settled.
+   - **If** `From: verify` or `From: holistic` with every item answered `Accept` or `Accept (assumed)`, the loop question (when asked) answered `Decide`, no `Gate: FAIL` header, **and** no source changed since the paused verify (`SOURCE_CHANGED` = false: the pause came from Step 8 or Step 10 sub-steps 5-6, or the `branches scan-diff` in Step 9 or Step 10 sub-step 10 exited 1) → `DECISION_ROUTE` = `continue`. The answers changed no code and asked for no round, so a re-run would return what they already settled. A pause reached with scan-diff exit 0 and `VERIFY_FIXED` / `HOLISTIC_FIXED` = 0 has edited source the verify never saw, so it keeps the re-run.
    - **If** `From: holistic` → `DECISION_ROUTE` = `holistic`.
    - **If** `From: verify` → `DECISION_ROUTE` = `verify`.
    - **If** `From: summary` → `DECISION_ROUTE` = `summary`.
@@ -273,6 +273,14 @@ description: "Build Feature — Autonomous implementation"
 
    **If** exit >= 2 → **Failure Path**.
 
+   **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → tick the accepted gaps' tasks before the decision is recorded, so a resume either reopens the unrecorded decision (the tick already made is kept) or finds the tasks ticked:
+
+   ```bash
+   "{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
+   ```
+
+   **If** exit != 0 → **Failure Path**.
+
    Record the decision and its route. The loop counts are not reset:
 
    ```bash
@@ -285,7 +293,7 @@ description: "Build Feature — Autonomous implementation"
    - **If** `DECISION_ROUTE` = `retry` **and** `From: holistic` → Step 10 sub-step 7.
    - **If** `DECISION_ROUTE` = `retry` → Step 13.
    - **If** `DECISION_ROUTE` = `continue` **and** `From: holistic` → Step 11.
-   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run `"{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, then Step 7.
+   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run `"{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
    - **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
    - **If** `DECISION_ROUTE` = `holistic` → re-run Step 10.
    - **If** `DECISION_ROUTE` = `summary` → Step 15.
@@ -728,7 +736,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
     Hold `value` as `VERIFY_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
-    Set `PAUSE_STEP` = 8 and `PAUSE_POINT` = `build.verify`.
+    Set `PAUSE_STEP` = 8, `PAUSE_POINT` = `build.verify` and `SOURCE_CHANGED` = false.
     **If** `GATE_RERUN` = true **and** `GATE_VERDICT` = FAIL → clear `GATE_RERUN`, `PAUSE_QUESTION` = `VERIFY_GAPS`, `PAUSE_LOOP` = `verify` → **Decision Pause** — the re-run gate is still red, so the pause is asked again with fresh numbers.
     **If** `LIMIT_ASK` = true **and** either exit 1 **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `verify`, so the pause also asks whether to try another round.
     Route — first match wins:
@@ -820,7 +828,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
    ```
-   Exit 1 means the attempt changed no source file.
+   Exit 1 means the attempt changed no source file. Hold `SOURCE_CHANGED` = true on exit 0, else false.
    Route — first match wins:
    - **If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS`. **If** `GATE_VERDICT` = FAIL → also `PAUSE_LOOP` = `verify`, so the pause asks the loop question about the red gate → **Decision Pause**.
    - **If** exit 0 → re-run Step 8.
@@ -882,7 +890,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" counters route --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --file="{STATUS}" --workflow=build --point=build.holistic --continue=within-limit --exceeded=failure-path
    ```
    Hold `value` as `HOLISTIC_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
-   Set `PAUSE_STEP` = 10 and `PAUSE_POINT` = `build.holistic`.
+   Set `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.holistic` and `SOURCE_CHANGED` = false.
    **If** `LIMIT_ASK` = true **and** exit 1 → `PAUSE_LOOP` = `holistic`, so the pause also asks whether to try another round.
    Route — first match wins:
    - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.holistic.maxAttempts` is used up, so the owner decides.
@@ -915,7 +923,7 @@ This step checks the whole feature against the plan after the last group, and ag
     ```bash
     cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
     ```
-    Exit 1 means the attempt changed no source file.
+    Exit 1 means the attempt changed no source file. Hold `SOURCE_CHANGED` = true on exit 0, else false.
     Route — first match wins:
     - **If** exit 1 **or** `HOLISTIC_FIXED` = 0 → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.holistic`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
     - **If** exit 0 → re-run Step 10.
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index e535ddd6a..a6d783861 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -245,7 +245,7 @@ Build Feature — Autonomous implementation
      - **Else** → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1.
    - **If** any item was answered `Fix now` → `DECISION_ROUTE` = `fix`.
    - **If** the loop question was answered `Try again` → `DECISION_ROUTE` = `retry`.
-   - **If** `From: verify` or `From: holistic` with every item answered `Accept` or `Accept (assumed)`, the loop question (when asked) answered `Decide`, and no `Gate: FAIL` header → `DECISION_ROUTE` = `continue`. The answers changed no code and asked for no round, so a re-run would return what they already settled.
+   - **If** `From: verify` or `From: holistic` with every item answered `Accept` or `Accept (assumed)`, the loop question (when asked) answered `Decide`, no `Gate: FAIL` header, **and** no source changed since the paused verify (`SOURCE_CHANGED` = false: the pause came from Step 8 or Step 10 sub-steps 5-6, or the `branches scan-diff` in Step 9 or Step 10 sub-step 10 exited 1) → `DECISION_ROUTE` = `continue`. The answers changed no code and asked for no round, so a re-run would return what they already settled. A pause reached with scan-diff exit 0 and `VERIFY_FIXED` / `HOLISTIC_FIXED` = 0 has edited source the verify never saw, so it keeps the re-run.
    - **If** `From: holistic` → `DECISION_ROUTE` = `holistic`.
    - **If** `From: verify` → `DECISION_ROUTE` = `verify`.
    - **If** `From: summary` → `DECISION_ROUTE` = `summary`.
@@ -272,6 +272,14 @@ Build Feature — Autonomous implementation
 
    **If** exit >= 2 → **Failure Path**.
 
+   **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → tick the accepted gaps' tasks before the decision is recorded, so a resume either reopens the unrecorded decision (the tick already made is kept) or finds the tasks ticked:
+
+   ```bash
+   "{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
+   ```
+
+   **If** exit != 0 → **Failure Path**.
+
    Record the decision and its route. The loop counts are not reset:
 
    ```bash
@@ -284,7 +292,7 @@ Build Feature — Autonomous implementation
    - **If** `DECISION_ROUTE` = `retry` **and** `From: holistic` → Step 10 sub-step 7.
    - **If** `DECISION_ROUTE` = `retry` → Step 13.
    - **If** `DECISION_ROUTE` = `continue` **and** `From: holistic` → Step 11.
-   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run `"{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, then Step 7.
+   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run `"{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
    - **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
    - **If** `DECISION_ROUTE` = `holistic` → re-run Step 10.
    - **If** `DECISION_ROUTE` = `summary` → Step 15.
@@ -727,7 +735,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
     Hold `value` as `VERIFY_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
-    Set `PAUSE_STEP` = 8 and `PAUSE_POINT` = `build.verify`.
+    Set `PAUSE_STEP` = 8, `PAUSE_POINT` = `build.verify` and `SOURCE_CHANGED` = false.
     **If** `GATE_RERUN` = true **and** `GATE_VERDICT` = FAIL → clear `GATE_RERUN`, `PAUSE_QUESTION` = `VERIFY_GAPS`, `PAUSE_LOOP` = `verify` → **Decision Pause** — the re-run gate is still red, so the pause is asked again with fresh numbers.
     **If** `LIMIT_ASK` = true **and** either exit 1 **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `verify`, so the pause also asks whether to try another round.
     Route — first match wins:
@@ -819,7 +827,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
    ```
-   Exit 1 means the attempt changed no source file.
+   Exit 1 means the attempt changed no source file. Hold `SOURCE_CHANGED` = true on exit 0, else false.
    Route — first match wins:
    - **If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS`. **If** `GATE_VERDICT` = FAIL → also `PAUSE_LOOP` = `verify`, so the pause asks the loop question about the red gate → **Decision Pause**.
    - **If** exit 0 → re-run Step 8.
@@ -881,7 +889,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" counters route --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --file="{STATUS}" --workflow=build --point=build.holistic --continue=within-limit --exceeded=failure-path
    ```
    Hold `value` as `HOLISTIC_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
-   Set `PAUSE_STEP` = 10 and `PAUSE_POINT` = `build.holistic`.
+   Set `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.holistic` and `SOURCE_CHANGED` = false.
    **If** `LIMIT_ASK` = true **and** exit 1 → `PAUSE_LOOP` = `holistic`, so the pause also asks whether to try another round.
    Route — first match wins:
    - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.holistic.maxAttempts` is used up, so the owner decides.
@@ -914,7 +922,7 @@ This step checks the whole feature against the plan after the last group, and ag
     ```bash
     cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
     ```
-    Exit 1 means the attempt changed no source file.
+    Exit 1 means the attempt changed no source file. Hold `SOURCE_CHANGED` = true on exit 0, else false.
     Route — first match wins:
     - **If** exit 1 **or** `HOLISTIC_FIXED` = 0 → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.holistic`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
     - **If** exit 0 → re-run Step 10.
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index 79c5bbc48..edd8dea7e 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -249,7 +249,7 @@ $ARGUMENTS
      - **Else** → `CHALLENGE_ROUND` = `CHALLENGE_ROUND` + 1.
    - **If** any item was answered `Fix now` → `DECISION_ROUTE` = `fix`.
    - **If** the loop question was answered `Try again` → `DECISION_ROUTE` = `retry`.
-   - **If** `From: verify` or `From: holistic` with every item answered `Accept` or `Accept (assumed)`, the loop question (when asked) answered `Decide`, and no `Gate: FAIL` header → `DECISION_ROUTE` = `continue`. The answers changed no code and asked for no round, so a re-run would return what they already settled.
+   - **If** `From: verify` or `From: holistic` with every item answered `Accept` or `Accept (assumed)`, the loop question (when asked) answered `Decide`, no `Gate: FAIL` header, **and** no source changed since the paused verify (`SOURCE_CHANGED` = false: the pause came from Step 8 or Step 10 sub-steps 5-6, or the `branches scan-diff` in Step 9 or Step 10 sub-step 10 exited 1) → `DECISION_ROUTE` = `continue`. The answers changed no code and asked for no round, so a re-run would return what they already settled. A pause reached with scan-diff exit 0 and `VERIFY_FIXED` / `HOLISTIC_FIXED` = 0 has edited source the verify never saw, so it keeps the re-run.
    - **If** `From: holistic` → `DECISION_ROUTE` = `holistic`.
    - **If** `From: verify` → `DECISION_ROUTE` = `verify`.
    - **If** `From: summary` → `DECISION_ROUTE` = `summary`.
@@ -276,6 +276,14 @@ $ARGUMENTS
 
    **If** exit >= 2 → **Failure Path**.
 
+   **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → tick the accepted gaps' tasks before the decision is recorded, so a resume either reopens the unrecorded decision (the tick already made is kept) or finds the tasks ticked:
+
+   ```bash
+   "{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"
+   ```
+
+   **If** exit != 0 → **Failure Path**.
+
    Record the decision and its route. The loop counts are not reset:
 
    ```bash
@@ -288,7 +296,7 @@ $ARGUMENTS
    - **If** `DECISION_ROUTE` = `retry` **and** `From: holistic` → Step 10 sub-step 7.
    - **If** `DECISION_ROUTE` = `retry` → Step 13.
    - **If** `DECISION_ROUTE` = `continue` **and** `From: holistic` → Step 11.
-   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run `"{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, then Step 7.
+   - **If** `DECISION_ROUTE` = `continue` **and** `From: verify` → run `"{BKIT}" tasks tick --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --group={GROUP} --decision="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"` again (it ticks nothing twice), **If** exit != 0 → **Failure Path**, else Step 7.
    - **If** `DECISION_ROUTE` = `verify` → re-run Step 8.
    - **If** `DECISION_ROUTE` = `holistic` → re-run Step 10.
    - **If** `DECISION_ROUTE` = `summary` → Step 15.
@@ -731,7 +739,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
     "{BKIT}" counters route --name=VERIFY_ATTEMPT --of=build-plan-verify:current --file="{STATUS}" --workflow=build --group={GROUP} --point=build.verify --continue=within-limit --exceeded=failure-path
     ```
     Hold `value` as `VERIFY_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
-    Set `PAUSE_STEP` = 8 and `PAUSE_POINT` = `build.verify`.
+    Set `PAUSE_STEP` = 8, `PAUSE_POINT` = `build.verify` and `SOURCE_CHANGED` = false.
     **If** `GATE_RERUN` = true **and** `GATE_VERDICT` = FAIL → clear `GATE_RERUN`, `PAUSE_QUESTION` = `VERIFY_GAPS`, `PAUSE_LOOP` = `verify` → **Decision Pause** — the re-run gate is still red, so the pause is asked again with fresh numbers.
     **If** `LIMIT_ASK` = true **and** either exit 1 **or** `VERIFY_ROUNDS` = `PAUSE_MAX` → `PAUSE_LOOP` = `verify`, so the pause also asks whether to try another round.
     Route — first match wins:
@@ -823,7 +831,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
    ```
-   Exit 1 means the attempt changed no source file.
+   Exit 1 means the attempt changed no source file. Hold `SOURCE_CHANGED` = true on exit 0, else false.
    Route — first match wins:
    - **If** exit 1 **or** `VERIFY_FIXED` = 0 → `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify`, `PAUSE_QUESTION` = `VERIFY_GAPS`. **If** `GATE_VERDICT` = FAIL → also `PAUSE_LOOP` = `verify`, so the pause asks the loop question about the red gate → **Decision Pause**.
    - **If** exit 0 → re-run Step 8.
@@ -885,7 +893,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" counters route --name=HOLISTIC_ATTEMPT --of=build-plan-gaps-remediate-holistic:next --file="{STATUS}" --workflow=build --point=build.holistic --continue=within-limit --exceeded=failure-path
    ```
    Hold `value` as `HOLISTIC_ROUNDS`, `max` as `PAUSE_MAX` and `ask` as `LIMIT_ASK`.
-   Set `PAUSE_STEP` = 10 and `PAUSE_POINT` = `build.holistic`.
+   Set `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.holistic` and `SOURCE_CHANGED` = false.
    **If** `LIMIT_ASK` = true **and** exit 1 → `PAUSE_LOOP` = `holistic`, so the pause also asks whether to try another round.
    Route — first match wins:
    - **If** exit 1 **and** `LIMIT_ASK` = true → `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause** — `build.holistic.maxAttempts` is used up, so the owner decides.
@@ -918,7 +926,7 @@ This step checks the whole feature against the plan after the last group, and ag
     ```bash
     cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
     ```
-    Exit 1 means the attempt changed no source file.
+    Exit 1 means the attempt changed no source file. Hold `SOURCE_CHANGED` = true on exit 0, else false.
     Route — first match wins:
     - **If** exit 1 **or** `HOLISTIC_FIXED` = 0 → `PAUSE_STEP` = 10, `PAUSE_POINT` = `build.holistic`, `PAUSE_QUESTION` = `VERIFY_GAPS` → **Decision Pause**.
     - **If** exit 0 → re-run Step 10.
diff --git a/dist/commands/workflow/summary.js b/dist/commands/workflow/summary.js
index bbb0c6d85..0aa1cdf30 100644
--- a/dist/commands/workflow/summary.js
+++ b/dist/commands/workflow/summary.js
@@ -359,9 +359,13 @@ export function buildSummary(input) {
                 if (text === null || decisionHeader(text).From !== "holistic")
                     continue;
                 const items = parseDecisionItems(text);
-                if (items.length === 0)
+                const gaps = items.filter((i) => i.title !== "Holistic verify");
+                const loop = items.filter((i) => i.title === "Holistic verify");
+                if (gaps.length === 0)
                     continue;
-                if (!items.every((i) => /^Accept\b/.test(i.decision ?? "")))
+                if (!gaps.every((i) => /^Accept\b/.test(i.decision ?? "")))
+                    continue;
+                if (!loop.every((i) => /^Decide\b/.test(i.decision ?? "")))
                     continue;
                 holistic = { index, rel };
             }
diff --git a/dist/commands/workflow/tasks.js b/dist/commands/workflow/tasks.js
index b172fc7b0..ce34ed3dc 100644
--- a/dist/commands/workflow/tasks.js
+++ b/dist/commands/workflow/tasks.js
@@ -191,7 +191,7 @@ export const tasksCommand = {
                         throw new CommandError(EXIT.USAGE, `--decision ${decisionArg} does not exist`);
                     const accepted = parseDecisionItems(fs.readFileSync(decisionFile, "utf-8"))
                         .filter((it) => it.decision !== null && /^Accept\b/.test(it.decision))
-                        .map((it) => /\bTask (\d+)\b/.exec(it.title))
+                        .map((it) => /\btask\s+(\d+)\b/i.exec(it.title))
                         .filter((m) => m !== null)
                         .map((m) => Number(m[1]));
                     named = [...(named ?? []), ...accepted].filter((n) => candidates.some((t) => t.task === n));
