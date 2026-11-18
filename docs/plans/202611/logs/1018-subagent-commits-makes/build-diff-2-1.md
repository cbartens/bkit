diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index e15bb1d0f..e2246e731 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -889,9 +889,9 @@ Run § Pending takeovers first.
    Hold `fields.Fixed` as `VERIFY_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Step 8 runs again and judges the fixes. A later PASS verification of the same group resolves a gaps-fix FAIL in the summary; separate warnings remain concerns.
 5. Check that the attempt changed source files, not only logs and ledgers:
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
+   cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --since-step=build-plan-gaps-remediate --file="{STATUS}" --code >/dev/null
    ```
-   Exit 1 means the attempt changed no source file. Hold `SOURCE_CHANGED` = true on exit 0, else false.
+   Exit 1: no source file changed. Hold `SOURCE_CHANGED` = true on exit 0, else false.
    Route — first match wins:
    - **If** exit 1 **or** `VERIFY_FIXED` = 0:
      - Set `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify` and `PAUSE_QUESTION` = `VERIFY_GAPS`.
@@ -1000,9 +1000,9 @@ This step checks the whole feature against the plan after the last group, and ag
     ```
     **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — Gap {N}: test `{file}` `{name}` — {why} to your log, then append DONE — Gap {N} again. Correct the Fixed count and verdict in your log to match."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
     Hold `fields.Fixed` as `HOLISTIC_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Sub-step 1 runs again and judges the fixes. A later PASS holistic verification resolves a holistic gaps-fix FAIL in the summary.
-12. Check that the attempt changed source files, as Step 9 sub-step 5 does:
+12. Check the attempt changed source files, as Step 9 sub-step 5 does:
     ```bash
-    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
+    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --since-step=build-plan-gaps-remediate-holistic --file="{STATUS}" --code >/dev/null
     ```
     Hold `SOURCE_CHANGED` = true on exit 0, else false.
     Route — first match wins:
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index ceb3099e7..4e2df0d4a 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -889,9 +889,9 @@ Run § Pending takeovers first.
    Hold `fields.Fixed` as `VERIFY_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Step 8 runs again and judges the fixes. A later PASS verification of the same group resolves a gaps-fix FAIL in the summary; separate warnings remain concerns.
 5. Check that the attempt changed source files, not only logs and ledgers:
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
+   cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --since-step=build-plan-gaps-remediate --file="{STATUS}" --code >/dev/null
    ```
-   Exit 1 means the attempt changed no source file. Hold `SOURCE_CHANGED` = true on exit 0, else false.
+   Exit 1: no source file changed. Hold `SOURCE_CHANGED` = true on exit 0, else false.
    Route — first match wins:
    - **If** exit 1 **or** `VERIFY_FIXED` = 0:
      - Set `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify` and `PAUSE_QUESTION` = `VERIFY_GAPS`.
@@ -1000,9 +1000,9 @@ This step checks the whole feature against the plan after the last group, and ag
     ```
     **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — Gap {N}: test `{file}` `{name}` — {why} to your log, then append DONE — Gap {N} again. Correct the Fixed count and verdict in your log to match."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
     Hold `fields.Fixed` as `HOLISTIC_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Sub-step 1 runs again and judges the fixes. A later PASS holistic verification resolves a holistic gaps-fix FAIL in the summary.
-12. Check that the attempt changed source files, as Step 9 sub-step 5 does:
+12. Check the attempt changed source files, as Step 9 sub-step 5 does:
     ```bash
-    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
+    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --since-step=build-plan-gaps-remediate-holistic --file="{STATUS}" --code >/dev/null
     ```
     Hold `SOURCE_CHANGED` = true on exit 0, else false.
     Route — first match wins:
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 82123fdfe..482ed49b8 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -2847,3 +2847,29 @@ describe("build planned-test takeovers", () => {
     expect(rerun.indexOf("§ Pending takeovers")).toBeLessThan(rerun.indexOf("decisions apply"));
   });
 });
+
+describe("build gaps-fix source checks", () => {
+  const build = workflow("build");
+
+  it("bkit-build gaps-fix source checks measure from the previous step, never HEAD~1", () => {
+    expect(build).not.toContain("--base=HEAD~1");
+    const calls = commandLines(build, "branches scan-diff").filter((l) =>
+      l.includes("--since-step"),
+    );
+    expect(calls).toHaveLength(2);
+    const [step9, step10] = [
+      stepBody(build, /Step 9 — /),
+      stepBody(build, /Step 10 — Plan Verify Holistic/),
+    ];
+    const in9 = commandLines(step9, "branches scan-diff");
+    const in10 = commandLines(step10, "branches scan-diff");
+    expect(in9).toHaveLength(1);
+    expect(in9[0]).toContain("--since-step=build-plan-gaps-remediate ");
+    expect(in9[0]).toContain('--file="{STATUS}"');
+    expect(in9[0]).toContain("--code");
+    expect(in10).toHaveLength(1);
+    expect(in10[0]).toContain("--since-step=build-plan-gaps-remediate-holistic ");
+    expect(in10[0]).toContain('--file="{STATUS}"');
+    expect(in10[0]).toContain("--code");
+  });
+});
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index 7ddec3b74..948feab53 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -930,9 +930,9 @@ Run § Pending takeovers first.
    Hold `fields.Fixed` as `VERIFY_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Step 8 runs again and judges the fixes. A later PASS verification of the same group resolves a gaps-fix FAIL in the summary; separate warnings remain concerns.
 5. Check that the attempt changed source files, not only logs and ledgers:
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
+   cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --since-step=build-plan-gaps-remediate --file="{STATUS}" --code >/dev/null
    ```
-   Exit 1 means the attempt changed no source file. Hold `SOURCE_CHANGED` = true on exit 0, else false.
+   Exit 1: no source file changed. Hold `SOURCE_CHANGED` = true on exit 0, else false.
    Route — first match wins:
    - **If** exit 1 **or** `VERIFY_FIXED` = 0:
      - Set `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify` and `PAUSE_QUESTION` = `VERIFY_GAPS`.
@@ -1041,9 +1041,9 @@ This step checks the whole feature against the plan after the last group, and ag
     ```
     **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — Gap {N}: test `{file}` `{name}` — {why} to your log, then append DONE — Gap {N} again. Correct the Fixed count and verdict in your log to match."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
     Hold `fields.Fixed` as `HOLISTIC_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Sub-step 1 runs again and judges the fixes. A later PASS holistic verification resolves a holistic gaps-fix FAIL in the summary.
-12. Check that the attempt changed source files, as Step 9 sub-step 5 does:
+12. Check the attempt changed source files, as Step 9 sub-step 5 does:
     ```bash
-    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
+    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --since-step=build-plan-gaps-remediate-holistic --file="{STATUS}" --code >/dev/null
     ```
     Hold `SOURCE_CHANGED` = true on exit 0, else false.
     Route — first match wins:
diff --git a/.bkit/version b/.bkit/version
index 13d416a9f..552a6a33e 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -15,7 +15,7 @@
     ".bkit/.env.example": "6bf0e90fae894711f951811a122424eb8eaec00bcc0c0bfdafcc2750927b4daf",
     ".opencode/opencode.json": "37a299e11dd7e9d28fd3a212fdf3ac990ba656998263d47731285d30192f0397",
     ".claude/commands/bkit-auto.md": "2b0c16b2a7c783ad8d1d1f8160b62b8afa5369c7c179064c10db836e70de9744",
-    ".claude/commands/bkit-build.md": "4ec4a31dc95de75561b1d680fdebb2c7027c818dab16a356f78c645fecd6bffc",
+    ".claude/commands/bkit-build.md": "6289a61bb1b797e309c31f1aac0ea3bf6a8d095087c1c1badf6452a4180d450a",
     ".claude/commands/bkit-debug.md": "6b58fad4ef1d72a6b951d326bab931c2e27119a3d4d0f83d4d7ff8766b9eb0f6",
     ".claude/commands/bkit-design.md": "dae2b4e44305a5cbe85c19357e4fcf5381485c093e6948ea00280628c000e843",
     ".claude/commands/bkit-plan.md": "85c7b7cb3b9f0873761fdbc62fdbbe5c1cc494a272173947ad2bea4d907c9a39",
@@ -47,7 +47,7 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "73709aceb5e80f5715a0dcba275f07ed3edb84fe02950230b6632fcfc18c4890",
     ".claude/agents/bkit-utility-update-documentation.md": "5006f0bf8be7ca10d048fa6050e2f71dc9b82c445c150b0bd64e8884d4bf6897",
     ".cursor/commands/bkit-auto.md": "28471fc3de9f81742c3111c3b4f9abe67f4c020f05c0d26574eae6db1580f41b",
-    ".cursor/commands/bkit-build.md": "85c5941f3270559dbe7e23236bcc3451e8e8d8bbcc619ba192871d29bc69fc40",
+    ".cursor/commands/bkit-build.md": "e24c93a0216e0bd3a274ed5793ab4c0074e6aec63d0fd700f8ca052d7bb4873c",
     ".cursor/commands/bkit-debug.md": "f76b79801538fa4bae3f2613b8e8a572365db3665c123749a9ec6299fce25c43",
     ".cursor/commands/bkit-design.md": "cafad1a3acc6788e3c2356694efb51681477e425b81a98f3e4e5ce00c9454a02",
     ".cursor/commands/bkit-plan.md": "7b9298fa053dba33814fbb657968584c1a87d181229a087058bfdb559f4b0cd1",
@@ -105,7 +105,7 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "7429e7ff947702372741829224dd41d3725dd715414c1205cb8c7b1f1366f743",
     ".opencode/agents/bkit-utility-update-documentation.md": "25176686d7b31c9e340500d769dcfbeac72f5c53e92c873803d9bca502c63780",
     ".opencode/commands/bkit-auto.md": "7695e7b766a5d89b516befb2bcaed679018bbe8b6708ea497af9a805270f085c",
-    ".opencode/commands/bkit-build.md": "d7b2739c2eee7405225d68c4ce91468eb5bd328b8ad91cfe08830bfbb1939e8c",
+    ".opencode/commands/bkit-build.md": "87169118936b504c0272ba8eb98aa39e205d08988de02bfa1eab396baa5c005f",
     ".opencode/commands/bkit-debug.md": "e4ef9e278efb5cd6ef5f9702463e967f42972c1d50a6e7a02127d2b7e7b4aa90",
     ".opencode/commands/bkit-design.md": "599a393c2309e2ff50f53f54d8383a854763f1f98074904886b4b9f4ea394312",
     ".opencode/commands/bkit-plan.md": "8b8b40b4a5286bba48f1108eace3c350c769884d74ff5edf8674d23338aca2e1",
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index 5fb9cac2f..388ce738c 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -888,9 +888,9 @@ Run § Pending takeovers first.
    Hold `fields.Fixed` as `VERIFY_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Step 8 runs again and judges the fixes. A later PASS verification of the same group resolves a gaps-fix FAIL in the summary; separate warnings remain concerns.
 5. Check that the attempt changed source files, not only logs and ledgers:
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
+   cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --since-step=build-plan-gaps-remediate --file="{STATUS}" --code >/dev/null
    ```
-   Exit 1 means the attempt changed no source file. Hold `SOURCE_CHANGED` = true on exit 0, else false.
+   Exit 1: no source file changed. Hold `SOURCE_CHANGED` = true on exit 0, else false.
    Route — first match wins:
    - **If** exit 1 **or** `VERIFY_FIXED` = 0:
      - Set `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify` and `PAUSE_QUESTION` = `VERIFY_GAPS`.
@@ -999,9 +999,9 @@ This step checks the whole feature against the plan after the last group, and ag
     ```
     **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — Gap {N}: test `{file}` `{name}` — {why} to your log, then append DONE — Gap {N} again. Correct the Fixed count and verdict in your log to match."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
     Hold `fields.Fixed` as `HOLISTIC_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Sub-step 1 runs again and judges the fixes. A later PASS holistic verification resolves a holistic gaps-fix FAIL in the summary.
-12. Check that the attempt changed source files, as Step 9 sub-step 5 does:
+12. Check the attempt changed source files, as Step 9 sub-step 5 does:
     ```bash
-    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
+    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --since-step=build-plan-gaps-remediate-holistic --file="{STATUS}" --code >/dev/null
     ```
     Hold `SOURCE_CHANGED` = true on exit 0, else false.
     Route — first match wins:
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index d8ea99fa2..7fcc7f9ad 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -887,9 +887,9 @@ Run § Pending takeovers first.
    Hold `fields.Fixed` as `VERIFY_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Step 8 runs again and judges the fixes. A later PASS verification of the same group resolves a gaps-fix FAIL in the summary; separate warnings remain concerns.
 5. Check that the attempt changed source files, not only logs and ledgers:
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
+   cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --since-step=build-plan-gaps-remediate --file="{STATUS}" --code >/dev/null
    ```
-   Exit 1 means the attempt changed no source file. Hold `SOURCE_CHANGED` = true on exit 0, else false.
+   Exit 1: no source file changed. Hold `SOURCE_CHANGED` = true on exit 0, else false.
    Route — first match wins:
    - **If** exit 1 **or** `VERIFY_FIXED` = 0:
      - Set `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify` and `PAUSE_QUESTION` = `VERIFY_GAPS`.
@@ -998,9 +998,9 @@ This step checks the whole feature against the plan after the last group, and ag
     ```
     **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — Gap {N}: test `{file}` `{name}` — {why} to your log, then append DONE — Gap {N} again. Correct the Fixed count and verdict in your log to match."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
     Hold `fields.Fixed` as `HOLISTIC_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Sub-step 1 runs again and judges the fixes. A later PASS holistic verification resolves a holistic gaps-fix FAIL in the summary.
-12. Check that the attempt changed source files, as Step 9 sub-step 5 does:
+12. Check the attempt changed source files, as Step 9 sub-step 5 does:
     ```bash
-    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
+    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --since-step=build-plan-gaps-remediate-holistic --file="{STATUS}" --code >/dev/null
     ```
     Hold `SOURCE_CHANGED` = true on exit 0, else false.
     Route — first match wins:
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index c2aae50d1..25dcfe21f 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -891,9 +891,9 @@ Run § Pending takeovers first.
    Hold `fields.Fixed` as `VERIFY_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Step 8 runs again and judges the fixes. A later PASS verification of the same group resolves a gaps-fix FAIL in the summary; separate warnings remain concerns.
 5. Check that the attempt changed source files, not only logs and ledgers:
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
+   cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --since-step=build-plan-gaps-remediate --file="{STATUS}" --code >/dev/null
    ```
-   Exit 1 means the attempt changed no source file. Hold `SOURCE_CHANGED` = true on exit 0, else false.
+   Exit 1: no source file changed. Hold `SOURCE_CHANGED` = true on exit 0, else false.
    Route — first match wins:
    - **If** exit 1 **or** `VERIFY_FIXED` = 0:
      - Set `PAUSE_STEP` = 9, `PAUSE_POINT` = `build.verify` and `PAUSE_QUESTION` = `VERIFY_GAPS`.
@@ -1002,9 +1002,9 @@ This step checks the whole feature against the plan after the last group, and ag
     ```
     **If** exit 11 → the fix edited a planned test case the tests step recorded (`tests`; the engine logs an `agent-rework` friction row): invoke `@bkit-build-plan-gaps-remediate` again with ``"<problem> Put each test in <tests> back as the tests step left it; your other edits to those files stay. Or, when a correct code change forces the edit, keep it and append the line BLOCKED — Gap {N}: test `{file}` `{name}` — {why} to your log, then append DONE — Gap {N} again. Correct the Fixed count and verdict in your log to match."`` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**.
     Hold `fields.Fixed` as `HOLISTIC_FIXED`. Nothing routes on `verdict`: it only goes on the step's row. Sub-step 1 runs again and judges the fixes. A later PASS holistic verification resolves a holistic gaps-fix FAIL in the summary.
-12. Check that the attempt changed source files, as Step 9 sub-step 5 does:
+12. Check the attempt changed source files, as Step 9 sub-step 5 does:
     ```bash
-    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --base=HEAD~1 --code >/dev/null
+    cd "{WORKTREE_PATH}" && "{BKIT}" branches scan-diff --since-step=build-plan-gaps-remediate-holistic --file="{STATUS}" --code >/dev/null
     ```
     Hold `SOURCE_CHANGED` = true on exit 0, else false.
     Route — first match wins:
diff --git a/docs/testing.md b/docs/testing.md
index aa3d79203..38b1e15ce 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -569,7 +569,7 @@ Manual host-hook compatibility experiments live in [`tests/experiments/hooks/`](
 - **Raw Vitest:** `vitest.test-lock.ts` makes heavy root runs queue for the machine-wide `tests` lock in global setup; runs filtered entirely to existing files, watch mode, CI and nested runs with a live owner bypass acquisition. The lock script keeps its 60-second default wait without a TTY and honours an inherited wait budget. When the config loads, `testWorkers` sets `maxWorkers` from an inherited `BKIT_TEST_WORKERS`, else no limit under `CI=true` / `CI=1`, else the `workers` value of `bash scripts/ci/bkit-machine-lock.sh slots`, so the script is the only place that holds the slot rule (for example 4 workers on 10 local cores). The global setup then asks the lock for the same slot count and takes whichever slot is free, so a raw run and a gate hold both slots at once; it waits only while every slot is held. `BKIT_TEST_SLOTS=1` gives one slot at full width.
 - **One test file:** `pnpm bkit:test:file {file}` → `scripts/ci/bkit-test-file.mjs` picks the runner by file type (`.bats` → bats, `.mjs` → `node --test`, else Vitest); JUnit report only when `$BKIT_TEST_REPORT` is set.
 - **Time limits:** under `CI` the Vitest per-test and per-hook budgets (`vitest.timeout-budget.ts`) are strict (5s / 10s unit, 30s integration); off CI each is a fixed 6 times that (30s / 60s / 180s), a hang limit with no load reading. A limit a test file sets itself goes through `localLimit(ms)`, including one held in a named constant, so it stays as written under `CI` and is 6 times that off CI; `vitest.setup.ts` records the factor in `BKIT_LIMIT_FACTOR` before it clears `CI`, so a test file still reads the CI factor. The budgets also cap synchronous child calls (`vitest.child-deadline.ts`): a call with no `timeout` gets, from a test body, the test's timeout counted from when the body starts (`beforeEach` time is not taken off it; time the body spent before the call is), and, from a file's own `beforeEach` / `afterEach` hook (read from the hook state Vitest records on the running test, so it holds across an `await`), the test's remaining time but never less than the hook timeout so cleanup is not cut short, and is ended with SIGKILL (unless the caller sets `killSignal`) so a child that ignores SIGTERM cannot outlast it. From a `beforeAll` / `afterAll` hook, the call gets the hook timeout. No child limit reads a hook's own timeout, so a hook given a longer limit of its own, such as `beforeAll(fn, localLimit(120_000))`, passes `timeout` to the child processes it starts. `node --test` runs get `--test-timeout` and `--test-force-exit` from `scripts/ci/bkit-test-limits.mjs`, derived from the integration budget (30s under CI); `pnpm bkit:test:awake` runs its test file through `scripts/ci/bkit-test-file.mjs`, so it gets them too. Bats gets `BATS_TEST_TIMEOUT` from the same source, or from `tests/shell/setup_suite.bash` for `pnpm bkit:test:bats`. A limit kills only the direct child, so a grandchild it started can outlive the run. `patches/bats@1.13.0.patch` fixes two bats 1.13.0 defects: `bats-exec-test` declared the watchdog pid with `declare -r` inside a function, so a failing test could not stop its watchdog and waited out the whole limit; `bin/bats` ran `env` on a path that pnpm's patched-package directory name makes look like an assignment.
-- **Changed files:** `pnpm bkit:gate:changed {file}...` holds the `tests` lock through `scripts/ci/bkit-machine-lock.sh` and passes the file arguments to `scripts/gate/bkit-gate-changed.mjs`, which `bkit tests changed` calls for build and debug agents and `bkit tests run --changed-since=<sha>` calls for the build group gate: `vitest related --run` on the changed files, every test file that names a changed path (Vitest, `node --test` or bats by file type), Oxlint on changed engine `.ts`, Prettier on every changed file, and `pnpm typecheck` when a `.ts` file changed. Runs every stage, and exits 1 when any fails.
+- **Changed files:** `pnpm bkit:gate:changed {file}...` holds the `tests` lock through `scripts/ci/bkit-machine-lock.sh` and passes the file arguments to `scripts/gate/bkit-gate-changed.mjs`, which `bkit tests changed` calls for build and debug agents (its default `--base` is the commit holding the active run's last `step-done` row, so a subagent's own commit and an uncommitted edit list the same files and the previous step's commit is never listed) and `bkit tests run --changed-since=<sha>` calls for the build group gate: `vitest related --run` on the changed files, every test file that names a changed path (Vitest, `node --test` or bats by file type), Oxlint on changed engine `.ts`, Prettier on every changed file, and `pnpm typecheck` when a `.ts` file changed. Runs every stage, and exits 1 when any fails.
 - **Test gates:** `bkit:gate:static-unit`, `bkit:gate:static-unit-integration` and `bkit:gate:install-static-unit-build` hold the same `tests` lock for their whole run. A nested gate inherits its parent's live lock owner and runs unlocked.
 - **Test files** sit next to the file they test under `.bkit/core/engine/`; tests that read shipped text (workflows, templates, hooks, this repo's own docs and ledgers) sit in `.bkit/core/engine/audits/{workflows,templates,hooks,repo}/`. `tests/` holds automated shell tests in `shell/`, reusable inputs in `fixtures/` and manual research in `experiments/{compression,hooks}/`. Experiments keep reports in `reports/`, illustrations in `assets/` and preserved observations in dated `results/` folders.
 - **Shell names and runner:** Authored shell tests use `bkit-<subject>-<behaviour>.bats`. Keep the runner-required `setup_suite.bash` name and fixture names required by the software they imitate, such as `gh` and `package.json`. Local gates and CI both call `pnpm bkit:test:bats`, which selects `tests/shell/*.bats` and loads the adjacent suite setup. Manual experiments remain outside that selection.
@@ -812,7 +812,7 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `shared/bkit-latest.test.ts` | Unit (boundary: temp dirs, fake `pnpm` on PATH) | Outdated-bkit check: `compareSemver` numeric order (5.10.0 > 5.9.0) and prerelease order; unpinned and `BKIT_NO_UPDATE_CHECK` skip the registry (`0` does not); one lookup per day, a failed lookup remembered for an hour, corrupt / future-dated cache rewritten, no git dir → no cache; `lookupLatestPublished` null on a pnpm failure, non-version output, or no pnpm. |
 | `commands/workflow/fids.test.ts` | Unit | `bkit fids check / parse`: per-tracker shapes, `any` for CI_DEV, linear / jira lowercased, tracker from the main checkout's `package.json`; marker beats branch, malformed or foreign marker falls through, neither → exit 3; `bkit fids check --issue`: an issue given → the FID must embed that same id (`123-foo` with `--issue=456` fails), empty → any lowercase slug; `parse --branch` takes the suffix verbatim and links an embedded issue only when `.bkit/issues.jsonl` has a feature row for it (else `issueId` null, `upgrade-react-19` accepted, a non-slug exits 3); `featureIssueIds`; `parse --prompt-file`: per-tracker issue forms in prompt order, `ref`, a named FID, a missing file exits 7; `slugWords` / `mintFid`; `bkit fids resolve`: prompt, branch, logged (working tree and `dev`, several → exit 4), minted, then the first free `-b`, `-c`, … suffix, an IN_PROGRESS run continued, exit 5 when every name is used, exit 1 on a bad format; `bkit fids plans`: single / none (numbered files beside the plan are not plans); `bkit fids design --description-file --prompt-file`: link, own design, audit paths, exit 7 for a missing file. `bkit fids find --issue`: one (0) / none (1) / several (4), never a longer issue number, Linear case-insensitive; auto's FID entry points go through `runs context`. |
 | `commands/workflow/tests-base.test.ts` | Unit | `bkit tests base` classification: each failing gate case is `base-red` or `branch-red` against the base run's cases; the verdict is `all`, `some`, `none` or `unknown` with a reason. |
-| `commands/workflow/tests-changed.test.ts` | Unit (boundary: real temp git repos) | `snapshotTree` holds uncommitted and untracked files and leaves the index, worktree, refs, HEAD and stash unchanged; `changedBetween` splits changed and deleted files, null when the snapshot is gone; `deletedFiles`; `importersOf` lists the files that mention each deleted file, null when the search cannot read a blob; a gate whose status file says `held-too-long` (exit 124) exits 4 with no verdict. |
+| `commands/workflow/tests-changed.test.ts` | Unit (boundary: real temp git repos) | `snapshotTree` holds uncommitted and untracked files and leaves the index, worktree, refs, HEAD and stash unchanged; `changedBetween` splits changed and deleted files, null when the snapshot is gone; `deletedFiles`; `importersOf` lists the files that mention each deleted file, null when the search cannot read a blob; a gate whose status file says `held-too-long` (exit 124) exits 4 with no verdict; with no `--base`, a file the subagent committed after the last `step-done` commit is listed, the same file left uncommitted is listed, and a file only the previous step's own commit touched is left out. |
 | `commands/workflow/junit.test.ts` | Unit | `reportFailures`: the failing cases of a JUnit report, `[]` for a clean report, null with no report. |
 | `commands/workflow/tests-base.integration.test.ts` | Integration (real git, real subprocess) | `bkit tests base`: the local run at the base commit in a worktree, CI evidence at the base sha, the run's mode and install setting. |
 | `commands/workflow/tests.test.ts` | Unit (boundary: real subprocess) | `bkit tests run`: deepest declared gate wins, an empty script is not declared; PASS / FAIL with the log always saved; no gate declared → exit 3; runner could not run → exit 4 (never FAIL); runs at the checkout top; `--tail`; `--changed-since=<sha>` runs `bkit:gate:changed` on the files changed since that commit (the resolved gate whole when it is undeclared; no changed file → PASS row, nothing run; a sha naming no commit → exit 2; a lock wait read from the status file → exit 81, no row; exit 75 with no status file → a gate failure; a deleted file runs the gate on the files that mention it, a failed search runs it whole; `--changed-since=feature-base`; `--since-pass-of` measures from the newest passing run's `tested` snapshot, falling back to `--changed-since`). A `--file` row records its `tested` snapshot; a FAIL row records `failedTests` (at most 100, `failedTestsTruncated` when cut); a CI evidence row lists each failed job as `job:{name}`. A passing run of the exact required push gate records a push-gate receipt for HEAD (uncommitted changes inside the min-push paths are tolerated, any other uncommitted change records none), a failing run leaves the `.failed` marker, a lock wait or a gate other than the required push gate records none. `bkit tests plan-check`: the group and task blocks, `DONE WHEN` / `TEST FIRST`, `DEPENDS ON` order, a `Reuse Inventory` `NEW` row per `CREATE` file, a `Supersession Inventory` row per `DELETE`, the matrix header exactly `Test description \| Type \| Target file \| Task` and a row per test-bearing task (a header with a missing, extra or reordered column or no closing pipe, a row without exactly 4 cells or with anything but task numbers in its `Task` cell, an unmapped row, two tasks, an undefined task and a test-bearing task with no row each refused), the caps from `bkit.workflows.tasks`, symbol existence skipped on a ticked task, the change-issue form example accepted. `bkit tests red` / `green`: the named test decides, never the exit code alone; one red row per group run with a state and blob per planned test, a test an earlier row proved red skipped while its file is unchanged; green merges the group's rows per test, prints `verdict` and a `fixable` per gap, an empty `gaps` on a clean plan, and folds a multi-line failure message onto its gap line so a `## ` line never ends the `## Gaps` section. Takeovers: `plan-check` lists `takeovers` (a later task naming an earlier task's test, a suite-path name matched on its last segment); the red records `from` and `taken-over`; green lists `takenOver` with its diff, never a gap or `unproven`. `plan-check --ledger-rows`: a key on the `**Ledger rows:**` line with no row on disk is refused and named, a missing or unfilled line is refused, a plan whose keys all have a decision or deferral row passes, and the line stays unchecked without the flag. |
@@ -826,7 +826,7 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 | `commands/workflow/workflows.test.ts` | Unit (boundary: real temp git repos + bare remote) | `bkit workflows start / fail / handover / close / promote / links`: run opened vs resumed (a run still resumes after another workflow's run), `--lock-held`, `lastDoneStep` and, as `openDecision` with its `status` and `sourceChanged` (the `Source changed` header) on a resume, the run's own `OPEN` decision or a `DECIDED` / `ASSUMED` one that no `build-decision` row names; failed row, own-lock release, rebase or merge abort only when in progress, sentinel clearing, `handoverNeeded` (incl. debug `SOAK`), nothing changed without `--token` (empty values count as absent), labels, failure comment from `--error-file`; handover `--push` (the record committed and pushed on the feature branch with or without a handover, open PR → 9 with no link, pushed → linked comment, the named worktree committed in, and from `dev` only the logs and ledgers landed through a throwaway checkout with the checkout's code untouched, then the landed copies handed back so local `dev` fast-forwards onto them while a staged ledger stays and is named, a refusal → 10 with the record kept) and ship `--flush` (one FAILED commit landed on `dev` from a throwaway checkout with the main checkout untouched, nothing-to-commit, the named worktree's logs carried, a refused push keeping the record in the book with exit 10); ship `close --flush` (one DONE commit on `dev` carrying the book, then the owned worktree and branch removed; an unowned worktree and its branch left in place); compliance rows before counter + outcome rows, one `run.parentSha` on all three, a `build-plan-convert` row → `plan.source` `converted` with groups, plan tasks counted from task headings, unwritable stats never failing the close, ship size + coverage, artifact links, `--message` commit with the exact-match auto-route marker and `--verbose-ci-local`, `--record-step`, `--outbox` + `--number` comment; promote (`--resolve`, exit 12, archive of a changed canonical, anchor from the base commit, bkit release and outdated warning in the anchor, the plan copied alone, a stray `{FID}-plan-N.md` neither copied nor archived); links (comment, branch name in URLs); `close --ending=held --publish=false` writing `ending: held` and `publish: false` on the `workflow-done` row (default `done`, an unknown ending refused) and passing `publish` into the summary; `handover` prints `route` `stop` on every exit it reaches (0, 9 with ship's push skipped on an open PR, 10, 11, `--ref`) and the not-pushed line as `message` on each non-zero one. |
 | `commands/workflow/worktrees.test.ts`, `worktrees.integration.test.ts` | Unit and Integration (real git remote) | `bkit worktrees setup / remove`: adopt in place, debug / ship branch rules, mint off a freshly fetched `origin/dev` — always for design / plan, and off local `dev` when it is ahead for build / debug (diverged → `origin/dev`, narrated) —, a resumed design / plan branch carrying unpushed `dev` commits refused (7) while the same worktree resumes for build, resume rebase onto the same base + sentinel, a failed ship's uncommitted leftovers committed before that rebase (logs dev already holds dropped, copied entries never committed; a refused commit → exit 9), `direnv allow` only for a `.envrc` identical to the main checkout's (direnv stubbed on PATH), `bkit.workflows.worktree.copy` list with missing entries narrated, install in every workflow (design / plan included), install failure vs could-not-run exits, `--detect` taking mint vs adopt from the runtime (exclusive with `--worktrees`), ownership marker, removal only of a marked worktree, `--branch` deleting the local and remote branch unless another worktree holds it (`branchBlockedBy`); debug in place on `dev` writes the shared-checkout record (`startSha`, `aheadAtStart`) and exits 13 when another feature's live run holds the checkout; a ship of `dev` / `main` and `main` for design / plan / build exit 7. |
 | `commands/workflow/shared-checkout.integration.test.ts` | Integration (real git, real bare `origin`) | A debug run in place on `dev` with foreign work in flight (a modified file, an untracked one, a staged one, a pre-existing ledger row, a local commit): the push sends only the run's commits (replayed as copies onto `origin/dev` when local `dev` is ahead or `origin/dev` moved, a plain push when level, a foreign commit never; with the run's record gone, or another run's newer record present, the push refuses with exit 20 or selects its own `--fid` record), and the run's commits, close commit and roadmap mirror row carry only its own paths and rows, leaving foreign staged, untracked and `.bkit/issues.jsonl` changes behind. |
-| `commands/workflow/branches.test.ts` | Unit (boundary: real temp git repos) | `bkit branches rebase / anchor-stamp / anchor-read / push / sync / sync-dev`: ledger union byte-identical to `merge=union`, lockfile from the rebase target then regenerated, refuse-before-mutate; idempotent anchor stamp, `--base-ref` override, `bkitVersion` / `bkitLatest` stamped and the visible outdated line written then dropped after an upgrade, the outdated stamp prettier-clean and stable on re-stamp, empty `bkitLatest` when unknown; `--against` skip exits; one `git push`, lease only off `dev`/`main`, `--require-ci`, abort guard + `--open-pr`; a `--require-ci` feature push merging `origin/dev`'s ledger rows first (`mergedDev: true`), pushing as-is when `dev` has not moved or without `--require-ci`, and exiting 11 with nothing pushed on a code conflict; docs-from-dev merge committed as `chore({FID}): merge dev` with no skip token, also when only a ledger outside `docs/` moved, a declared `bkit:generate` run and committed after it (25 when it fails); `sync --merge` (ship Step 4) merging `origin/dev` into the checked-out branch: a clean merge committed with the branch as first parent, `current` when `dev` has not moved with a stale sentinel cleared, uncommitted work carried in its own commit first, a conflicted lockfile taken from `dev`, conflicts outside the ledgers and lockfile left in progress with exit 24 until `git add` and a re-run complete the merge, a failed ledger resolution aborting the merge with the sentinel written (11), `bkit:generate` committed after the merge, `--file` writing one `engine-action` merge row, usage (2) and detached (5) refusals; `regenerate` (ship Steps 3 and 10) committing only the paths `bkit:generate` changed while the run's own uncommitted files stay uncommitted, a rewrite and a delete committed, `--attempt` giving the `fix({FID}): regenerate attempt {N}` subject, `--file` writing one `engine-action` regenerate row, `unchanged` when nothing changed, `undeclared` with no or an empty script, 25 when `bkit:generate` fails or rewrites a file that was already uncommitted, usage (2) for `--attempt=0` and on `dev`; `rebase --file` writing one `engine-action` rebase row for a completed rebase and none for a refused one; `sync-dev` fast-forwarding local `dev` without a checkout, moving the checkout and installing only when on `dev` and `dev` moved (16 on a failed install), listing local-only `dev` commits with the publish command and pushing none (10 on a failed fetch); a refused rebase whose `--abort` fails reports `aborted: false` and `ABORT FAILED`. `bkit branches land`: workflow refusal, stray main-checkout artifacts (17), squash off `origin/dev` → `design DONE` commit pushed + audited + local `dev` fast-forwarded, staged files in the main checkout left staged, local-only `dev` commits left unpushed (`localDev: skipped`), another checked-out branch kept with only the `dev` pointer moved, `dev` moving under the push rebuilt and retried (`pushAttempts: 2`) or exhausted (8, branch kept, throwaway worktree gone), non-doc files refused (17) — a branch carrying unpushed `dev` commits additionally named as such, with the unpushed count and `git push origin dev` —, refused `dev` push → PR shape handing the PR to MCP (80, stage `open`) after pushing the roadmap commit (cloud, and on a laptop from the worktree holding the branch), refused PR merge → `origin/dev` merged into the branch locally and pushed (no server-side update-branch) then merged, a CLOSED PR stopping at once (17), uncommitted files in the feature worktree keeping the worktree and branch (`worktree.reason: uncommitted`), branch work missing from `origin/dev` stopping (18) with branch and worktree kept; `landBackoffMs` schedule (2s doubling, 30s cap, jitter, 3min total); the full local close is also run from the workflow in `close-squash.integration.test.ts`. `scan-diff --disabled-tests`: added disabling markers exit 1 with each hit's `file:line` and test name; no unmatched candidates exits 0 with an empty `disabled`. Exact assertion moves consume each added occurrence once and require unchanged test context across files; rewrites pair only within the same file and test. Unchanged duplicates and unrelated additions cannot conceal removals. Removed assertions retain their original test names; deleted files use old line numbers. Comments, non-assertion deletions and quoted markers in docs or source files are excluded. |
+| `commands/workflow/branches.test.ts` | Unit (boundary: real temp git repos) | `bkit branches rebase / anchor-stamp / anchor-read / push / sync / sync-dev`: ledger union byte-identical to `merge=union`, lockfile from the rebase target then regenerated, refuse-before-mutate; idempotent anchor stamp, `--base-ref` override, `bkitVersion` / `bkitLatest` stamped and the visible outdated line written then dropped after an upgrade, the outdated stamp prettier-clean and stable on re-stamp, empty `bkitLatest` when unknown; `--against` skip exits; one `git push`, lease only off `dev`/`main`, `--require-ci`, abort guard + `--open-pr`; a `--require-ci` feature push merging `origin/dev`'s ledger rows first (`mergedDev: true`), pushing as-is when `dev` has not moved or without `--require-ci`, and exiting 11 with nothing pushed on a code conflict; docs-from-dev merge committed as `chore({FID}): merge dev` with no skip token, also when only a ledger outside `docs/` moved, a declared `bkit:generate` run and committed after it (25 when it fails); `sync --merge` (ship Step 4) merging `origin/dev` into the checked-out branch: a clean merge committed with the branch as first parent, `current` when `dev` has not moved with a stale sentinel cleared, uncommitted work carried in its own commit first, a conflicted lockfile taken from `dev`, conflicts outside the ledgers and lockfile left in progress with exit 24 until `git add` and a re-run complete the merge, a failed ledger resolution aborting the merge with the sentinel written (11), `bkit:generate` committed after the merge, `--file` writing one `engine-action` merge row, usage (2) and detached (5) refusals; `regenerate` (ship Steps 3 and 10) committing only the paths `bkit:generate` changed while the run's own uncommitted files stay uncommitted, a rewrite and a delete committed, `--attempt` giving the `fix({FID}): regenerate attempt {N}` subject, `--file` writing one `engine-action` regenerate row, `unchanged` when nothing changed, `undeclared` with no or an empty script, 25 when `bkit:generate` fails or rewrites a file that was already uncommitted, usage (2) for `--attempt=0` and on `dev`; `rebase --file` writing one `engine-action` rebase row for a completed rebase and none for a refused one; `sync-dev` fast-forwarding local `dev` without a checkout, moving the checkout and installing only when on `dev` and `dev` moved (16 on a failed install), listing local-only `dev` commits with the publish command and pushing none (10 on a failed fetch); a refused rebase whose `--abort` fails reports `aborted: false` and `ABORT FAILED`. `bkit branches land`: workflow refusal, stray main-checkout artifacts (17), squash off `origin/dev` → `design DONE` commit pushed + audited + local `dev` fast-forwarded, staged files in the main checkout left staged, local-only `dev` commits left unpushed (`localDev: skipped`), another checked-out branch kept with only the `dev` pointer moved, `dev` moving under the push rebuilt and retried (`pushAttempts: 2`) or exhausted (8, branch kept, throwaway worktree gone), non-doc files refused (17) — a branch carrying unpushed `dev` commits additionally named as such, with the unpushed count and `git push origin dev` —, refused `dev` push → PR shape handing the PR to MCP (80, stage `open`) after pushing the roadmap commit (cloud, and on a laptop from the worktree holding the branch), refused PR merge → `origin/dev` merged into the branch locally and pushed (no server-side update-branch) then merged, a CLOSED PR stopping at once (17), uncommitted files in the feature worktree keeping the worktree and branch (`worktree.reason: uncommitted`), branch work missing from `origin/dev` stopping (18) with branch and worktree kept; `landBackoffMs` schedule (2s doubling, 30s cap, jitter, 3min total); the full local close is also run from the workflow in `close-squash.integration.test.ts`. `scan-diff --since-step=<step> --file --code`: exit 0 whether the subagent committed its fix before `steps finish` or left it for the finish commit, exit 1 when the step changed only logs. `scan-diff --disabled-tests`: added disabling markers exit 1 with each hit's `file:line` and test name; no unmatched candidates exits 0 with an empty `disabled`. Exact assertion moves consume each added occurrence once and require unchanged test context across files; rewrites pair only within the same file and test. Unchanged duplicates and unrelated additions cannot conceal removals. Removed assertions retain their original test names; deleted files use old line numbers. Comments, non-assertion deletions and quoted markers in docs or source files are excluded. |
 | `commands/land.test.ts` | Unit (boundary: real temp git repos + bare remote) | `pushToDev`, the one routine every `dev` write goes through: commit built in a throwaway `origin/dev` checkout and pushed as `dev`, the main checkout untouched, local-only `dev` commits never pushed, `dev` moving under the push rebuilt and retried or exhausted, any other refusal handed to the caller's `refused` hook with the throwaway checkout still there, fetch failure, a throwing build; the throwaway checkout gone on every path; `landBackoffMs` schedule. |
 | `commands/workflow/skills.test.ts` | Unit (stub skills CLI) | `bkit skills prune`: union of folders and lock keys, never `bkit-*`, whole-name and literal matching, skips with a warning (exit 0) without `.agents/skills.md`, CLI failure and could-not-run warned and listed in `failed` (exit 0). |
 | `commands/workflow/prs.test.ts` | Unit (stub `gh`) | `bkit prs open / probe / merge / verbose-ci / scan-body / cross-check / transport-row`: marker first in every body, open-PR refusal vs reuse, one retry, base read-back, 80 with the printed title / body; probe states; merge (empty body, `--match-head`, `--delete-branch`, exact-match auto-route subject, already-merged skip, `--expect-merged` 7, 80; `--base=refs/heads/main` spellings refused; a base retarget after the merge fails loudly); verbose-ci on / off / no-op / 5 / 80; body-only token scan; fallback-row cross-check; `transport-row --scan` (clean, token recorded then exit 1, unreadable 8, `--cross-check` refusal unrecorded). |
