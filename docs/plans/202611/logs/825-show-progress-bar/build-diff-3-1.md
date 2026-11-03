diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index cb5cc4162..bf51a3e43 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -674,7 +674,7 @@ Progress: ███████░░░ 71% · Step 10/14 Merge Gate + Merge PR
 
 The line describes the current numbered position, rather than elapsed time or a count of completed rows. Flat workflows divide the current number by their distinct numbered positions. Build expands Steps 7–9 for each current plan group: with `G` groups its total is `6 + 3G + 7`; inside group ordinal `g`, completed units are `6 + 3(g - 1) + (n - 6)`, and after the loop they are `6 + 3G + (n - 9)`. Sparse group markers map to their order in the plan. A missing plan uses one group, and each emission reads the plan again, so added groups immediately change the denominator.
 
-The percentage uses nearest-integer rounding, and the ten-cell bar uses nearest-ten rounding. Nonfinal positions are capped at 99%; the final numbered position reaches 100%. Returning to an earlier step can lower progress. Build loop lines add `Group {g} of {G}`. Retries above one add `Attempt {a} of {allowance}` from saved limits and grants, or `Attempt {a}` when no budget is known. Debug soak uses its saved cross-run soak count and grants.
+The percentage uses nearest-integer rounding, and the ten-cell bar uses nearest-ten rounding. Nonfinal positions are capped at 99%; the final numbered position reaches 100%. Returning to an earlier step can lower progress. Build loop lines add `Group {g} of {G}`. Retries above one add `Attempt {a} of {allowance}` from saved limits and grants, or `Attempt {a}` when no budget is known. Normal debug remediation counts completed remediation rows across every debug run, including the completion being recorded. Debug soak reuses its saved cross-run soak count on later completions. Both debug budgets include grants across every debug run. Build challenge uses its saved round, so rewriting a report within that round does not advance its budget attempt.
 
 `steps finish`, `steps done`, recorded `context finalise`, recorded `runs dispatch` and a close that records its step expose eligible completion lines. Invalid input, a refused completion write or commit, decision and owner-pause rows, and unnumbered bookkeeping expose none. Progress is derived output and is never stored in status rows. A resume selects the same run and saved counter context.
 
diff --git a/.bkit/core/engine/commands/workflow/progress.integration.test.ts b/.bkit/core/engine/commands/workflow/progress.integration.test.ts
index 90032b16d..30ed8b357 100644
--- a/.bkit/core/engine/commands/workflow/progress.integration.test.ts
+++ b/.bkit/core/engine/commands/workflow/progress.integration.test.ts
@@ -564,6 +564,68 @@ describe("workflow progress command wiring", () => {
     expect(released.code).toBe(0);
   });
 
+  it("progress normal debug attempts span runs", async () => {
+    const cwd = repo("debug", { "debug.fix": { ask: true, max: 3 } });
+    write(
+      cwd,
+      STATUS,
+      jsonl([
+        started("debug", { "debug.fix": { ask: true, max: 3 } }),
+        completed(cwd, "debug", "debug-failure-remediate", { attempt: 1 }),
+        { type: "workflow-done", workflow: "debug", at: at() },
+        started("debug", { "debug.fix": { ask: true, max: 3 } }),
+        { type: "workflow-meta", workflow: "debug", at: at(), debugMode: "NORMAL" },
+      ]),
+    );
+    const result = await run(cwd, doneArgs("debug", "debug-failure-remediate", "--attempt=1"));
+    expect(result.code).toBe(0);
+    expect(result.json.row).toMatchObject({ step: "debug-failure-remediate", attempt: 1 });
+    expect(result.json.progressLine).toBe(
+      "Progress: ██████░░░░ 64% · Step 7/11 Failure Remediate · Attempt 2 of 3",
+    );
+    expect(domainRows(cwd).filter((row) => row.step === "debug-failure-remediate")).toHaveLength(2);
+  });
+
+  it("progress reuses saved soak counter on later completions", async () => {
+    const cwd = repo("debug", { "debug.soak": { ask: true, max: 3 } });
+    fs.appendFileSync(
+      path.join(cwd, STATUS),
+      jsonl([
+        { type: "workflow-meta", workflow: "debug", at: at(), debugMode: "SOAK" },
+        completed(cwd, "debug", "debug-failure-soak", { attempt: 1, soakAttempt: 4 }),
+        { type: "allowance-granted", workflow: "debug", point: "debug.soak", at: at() },
+      ]),
+    );
+    const result = await run(
+      cwd,
+      doneArgs("debug", "debug-run-tests", "--attempt=2", "--field=scope=unit"),
+    );
+    expect(result.code).toBe(0);
+    expect(result.json.row).toMatchObject({ step: "debug-run-tests", attempt: 2, scope: "unit" });
+    expect(result.json.progressLine).toBe(
+      "Progress: ███░░░░░░░ 27% · Step 3/11 Run Tests · Attempt 4 of 6",
+    );
+    expect(domainRows(cwd).filter((row) => row.step === "debug-failure-soak")).toEqual([
+      expect.objectContaining({ soakAttempt: 4 }),
+    ]);
+  });
+
+  it("progress challenge budget follows round rather than report attempt", async () => {
+    const cwd = repo("build", { "build.challenge": { ask: true, max: 2 } });
+    fs.appendFileSync(
+      path.join(cwd, STATUS),
+      jsonl([completed(cwd, "build", "build-challenge", { attempt: 1, round: 1 })]),
+    );
+    const result = await run(
+      cwd,
+      doneArgs("build", "build-challenge", "--attempt=2", "--field=round=1"),
+    );
+    expect(result.code).toBe(0);
+    expect(result.json.row).toMatchObject({ step: "build-challenge", attempt: 2, round: 1 });
+    expect(result.json.progressLine).toBe("Progress: ███████░░░ 69% · Step 11/16 Build Challenge");
+    expect(domainRows(cwd).filter((row) => row.step === "build-challenge")).toHaveLength(2);
+  });
+
   it("progress excludes noncompletions", async () => {
     vi.stubEnv("BKIT_ENGINE_JOURNAL", "on");
     vi.stubEnv("GIT_EXEC_PATH", "");
diff --git a/.bkit/core/engine/commands/workflow/steps.ts b/.bkit/core/engine/commands/workflow/steps.ts
index dbb1b6243..147acc429 100644
--- a/.bkit/core/engine/commands/workflow/steps.ts
+++ b/.bkit/core/engine/commands/workflow/steps.ts
@@ -478,12 +478,18 @@ function stepProgress(cwd: string, r: StepRow, number?: number): string | undefi
   );
   const soak = runOrStepField(runs, r.workflow, "debugMode") === "SOAK";
   const point = progressPoint(r.workflow, r.step, soak);
-  const soakAttempt = r.extras?.soakAttempt ?? runOrStepField(runs, r.workflow, "soakAttempt");
+  const soakAttempt = Number(
+    r.extras?.soakAttempt ?? runOrStepField(runs, r.workflow, "soakAttempt"),
+  );
+  const challengeRound = Number(r.extras?.round ?? runOrStepField(runs, r.workflow, "round"));
   const attempt =
-    point === "debug.soak" && typeof soakAttempt === "number"
+    point === "debug.soak" && Number.isSafeInteger(soakAttempt) && soakAttempt > 0
       ? soakAttempt
-      : (r.attempt ??
-        (typeof r.extras?.round === "number" ? r.extras.round : same.at(-1)?.attempt));
+      : point === "debug.fix" && r.step === "debug-failure-remediate"
+        ? allRunsDoneSteps(runs, r.workflow, { step: r.step }).length + 1
+        : point === "build.challenge" && Number.isSafeInteger(challengeRound) && challengeRound > 0
+          ? challengeRound
+          : (r.attempt ?? same.at(-1)?.attempt);
   return runProgress({
     workflow: r.workflow,
     step: r.step,
@@ -494,7 +500,13 @@ function stepProgress(cwd: string, r: StepRow, number?: number): string | undefi
     max:
       point === undefined
         ? undefined
-        : savedPointLimit(r.file, r.workflow, point, r.group, point === "debug.soak"),
+        : savedPointLimit(
+            r.file,
+            r.workflow,
+            point,
+            r.group,
+            point === "debug.fix" || point === "debug.soak",
+          ),
   }).progressLine;
 }
 
diff --git a/.bkit/version b/.bkit/version
index 9fe67043e..5a1688d1c 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -224,7 +224,7 @@
     ".bkit/providers.md": "f55e9e3e06f53afec0ba2aed6d0981307469cfc4c1aba7b99f176cc3a8cde6eb",
     ".bkit/prompts.md": "05bef1112ac15f6ffdb8877f132d0b85e2718ca682be4dca0a7dbebdd798ab05",
     ".bkit/trackers.md": "3a3b60d2de7e69a8a59a7567159457afa6c5787a1f066b1399f6ed7499b49d96",
-    ".bkit/workflows.md": "35b69cebbfcbe5b2a1c1281faa79dfb46b244b929710cf72d5135c6aae9e4052",
+    ".bkit/workflows.md": "8d8084e053990e136992e2d844857b8592ef23c5c3a3ba3faf8558faf2d3caff",
     ".bkit/README.md": "1037df0251190241d83d900a9e3e5e2bf8e6dbfd3d9cb7d5f7948a73ab9732a4",
     ".cursor/rules/bkit-rules.mdc": "164c1bc7aed517d5eca01abac2f0c0e87a1102ceb1700eae02e340ef6f9ce797",
     ".claude/hooks/bkit-gateguard.cjs": "e13200a179c654f32e2a91f79be766c1755dd814d7d025bffd707ba6e91b965e",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index b713c16a3..eafc56a42 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -674,7 +674,7 @@ Progress: ███████░░░ 71% · Step 10/14 Merge Gate + Merge PR
 
 The line describes the current numbered position, rather than elapsed time or a count of completed rows. Flat workflows divide the current number by their distinct numbered positions. Build expands Steps 7–9 for each current plan group: with `G` groups its total is `6 + 3G + 7`; inside group ordinal `g`, completed units are `6 + 3(g - 1) + (n - 6)`, and after the loop they are `6 + 3G + (n - 9)`. Sparse group markers map to their order in the plan. A missing plan uses one group, and each emission reads the plan again, so added groups immediately change the denominator.
 
-The percentage uses nearest-integer rounding, and the ten-cell bar uses nearest-ten rounding. Nonfinal positions are capped at 99%; the final numbered position reaches 100%. Returning to an earlier step can lower progress. Build loop lines add `Group {g} of {G}`. Retries above one add `Attempt {a} of {allowance}` from saved limits and grants, or `Attempt {a}` when no budget is known. Debug soak uses its saved cross-run soak count and grants.
+The percentage uses nearest-integer rounding, and the ten-cell bar uses nearest-ten rounding. Nonfinal positions are capped at 99%; the final numbered position reaches 100%. Returning to an earlier step can lower progress. Build loop lines add `Group {g} of {G}`. Retries above one add `Attempt {a} of {allowance}` from saved limits and grants, or `Attempt {a}` when no budget is known. Normal debug remediation counts completed remediation rows across every debug run, including the completion being recorded. Debug soak reuses its saved cross-run soak count on later completions. Both debug budgets include grants across every debug run. Build challenge uses its saved round, so rewriting a report within that round does not advance its budget attempt.
 
 `steps finish`, `steps done`, recorded `context finalise`, recorded `runs dispatch` and a close that records its step expose eligible completion lines. Invalid input, a refused completion write or commit, decision and owner-pause rows, and unnumbered bookkeeping expose none. Progress is derived output and is never stored in status rows. A resume selects the same run and saved counter context.
 
diff --git a/dist/commands/workflow/steps.js b/dist/commands/workflow/steps.js
index 362bffd3b..f42488e58 100644
--- a/dist/commands/workflow/steps.js
+++ b/dist/commands/workflow/steps.js
@@ -374,11 +374,15 @@ function stepProgress(cwd, r, number) {
     const same = prior.filter((s) => s.step === r.step && (r.group === undefined || s.group === r.group));
     const soak = runOrStepField(runs, r.workflow, "debugMode") === "SOAK";
     const point = progressPoint(r.workflow, r.step, soak);
-    const soakAttempt = r.extras?.soakAttempt ?? runOrStepField(runs, r.workflow, "soakAttempt");
-    const attempt = point === "debug.soak" && typeof soakAttempt === "number"
+    const soakAttempt = Number(r.extras?.soakAttempt ?? runOrStepField(runs, r.workflow, "soakAttempt"));
+    const challengeRound = Number(r.extras?.round ?? runOrStepField(runs, r.workflow, "round"));
+    const attempt = point === "debug.soak" && Number.isSafeInteger(soakAttempt) && soakAttempt > 0
         ? soakAttempt
-        : (r.attempt ??
-            (typeof r.extras?.round === "number" ? r.extras.round : same.at(-1)?.attempt));
+        : point === "debug.fix" && r.step === "debug-failure-remediate"
+            ? allRunsDoneSteps(runs, r.workflow, { step: r.step }).length + 1
+            : point === "build.challenge" && Number.isSafeInteger(challengeRound) && challengeRound > 0
+                ? challengeRound
+                : (r.attempt ?? same.at(-1)?.attempt);
     return runProgress({
         workflow: r.workflow,
         step: r.step,
@@ -388,7 +392,7 @@ function stepProgress(cwd, r, number) {
         attempt,
         max: point === undefined
             ? undefined
-            : savedPointLimit(r.file, r.workflow, point, r.group, point === "debug.soak"),
+            : savedPointLimit(r.file, r.workflow, point, r.group, point === "debug.fix" || point === "debug.soak"),
     }).progressLine;
 }
 /** Exit code: a debug run on a shared branch has no shared-checkout record, so nothing was written or committed. */
