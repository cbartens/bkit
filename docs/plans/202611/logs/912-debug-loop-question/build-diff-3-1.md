diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index 4d1373245..47c888093 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -1027,7 +1027,7 @@ This step checks the whole feature against the plan after the last group, and ag
        ```
        **If** exit non-zero → **Failure Path**. Hold `trend` as `TEST_TREND`.
        - **If** `TEST_TREND` = `stuck` **or** `worse` → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**.
-       - **Else** → Step 13; a failed test round after a round that made progress is always fixed, never asked.
+       - **Else** → Step 13; a failed test round whose trend is not `stuck` or `worse` (`closing`, `unknown`) is always fixed, never asked.
      - **Else** → **Failure Path**.
    - **Else** → **Failure Path**.
 
diff --git a/.agents/plugins/bkit/skills/bkit-debug/SKILL.md b/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
index f8d3506b0..5cbbcf316 100644
--- a/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
@@ -114,15 +114,15 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    "{BKIT}" counters progress --file="{STATUS}" --workflow=debug --check=debug-run-tests --fix={LOOP_FIX}
    ```
    **If** exit non-zero → **Failure Path**.
-   Hold `trend` as `LOOP_TREND` and `counts` as `LOOP_COUNTS`.
-   **If** `LOOP_LIMIT` is not held **and** `LOOP_TREND` != `stuck` **and** `LOOP_TREND` != `worse` → narrate `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking (failures {LOOP_COUNTS})` → return to the calling step.
+   Hold `trend` as `LOOP_TREND`, `counts` as `LOOP_COUNTS` and `trendLine` as `LOOP_TREND_LINE`.
+   **If** `LOOP_LIMIT` is not held **and** `LOOP_TREND` != `stuck` **and** `LOOP_TREND` != `worse` → narrate `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking ({LOOP_TREND_LINE})` → return to the calling step.
 3. Ask the owner in this session; plain text, not through a host question tool. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. One message:
    - `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}`, then `Failures per test round: {LOOP_COUNTS}`, then the newest diagnosis (`debug-failure-diagnose-*.md`) or soak log (`debug-failure-soak-*-log.md`) in one line each.
    - The question — first match wins:
-     - **If** `LOOP_LIMIT` = true → `**Q1 — Soak:** The soak attempts are used up. Stop here instead of trying one more set of attempts?`.
-     - **If** `LOOP_POINT` = `fix` → `**Q1 — Fix:** The last fix attempt left no fewer failures. Stop here instead of trying again?`.
-     - **If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up, and the last one left no fewer failures. Stop here instead of starting soak (a slower, step-by-step investigation)?`.
-     - **Else** → `**Q1 — Soak:** The last soak attempt left no fewer failures. Stop here instead of trying again?`.
+     - **If** `LOOP_LIMIT` = true → `**Q1 — Soak:** The soak attempts are used up. {LOOP_TREND_LINE} Stop here instead of trying one more set of attempts?`.
+     - **If** `LOOP_POINT` = `fix` → `**Q1 — Fix:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
+     - **If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up. {LOOP_TREND_LINE} Stop here instead of starting soak (a slower, step-by-step investigation)?`.
+     - **Else** → `**Q1 — Soak:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
    - `Options: A) Stop / B) Try again`, then `Recommended: A) Stop`.
    - The line `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.`
      Record the wait → end turn → wait for the answer:
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index f6d9e765a..58cf14ad3 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -1027,7 +1027,7 @@ This step checks the whole feature against the plan after the last group, and ag
        ```
        **If** exit non-zero → **Failure Path**. Hold `trend` as `TEST_TREND`.
        - **If** `TEST_TREND` = `stuck` **or** `worse` → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**.
-       - **Else** → Step 13; a failed test round after a round that made progress is always fixed, never asked.
+       - **Else** → Step 13; a failed test round whose trend is not `stuck` or `worse` (`closing`, `unknown`) is always fixed, never asked.
      - **Else** → **Failure Path**.
    - **Else** → **Failure Path**.
 
diff --git a/.agents/skills/bkit-debug/SKILL.md b/.agents/skills/bkit-debug/SKILL.md
index 2a8f14ec8..87acba36a 100644
--- a/.agents/skills/bkit-debug/SKILL.md
+++ b/.agents/skills/bkit-debug/SKILL.md
@@ -114,15 +114,15 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    "{BKIT}" counters progress --file="{STATUS}" --workflow=debug --check=debug-run-tests --fix={LOOP_FIX}
    ```
    **If** exit non-zero → **Failure Path**.
-   Hold `trend` as `LOOP_TREND` and `counts` as `LOOP_COUNTS`.
-   **If** `LOOP_LIMIT` is not held **and** `LOOP_TREND` != `stuck` **and** `LOOP_TREND` != `worse` → narrate `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking (failures {LOOP_COUNTS})` → return to the calling step.
+   Hold `trend` as `LOOP_TREND`, `counts` as `LOOP_COUNTS` and `trendLine` as `LOOP_TREND_LINE`.
+   **If** `LOOP_LIMIT` is not held **and** `LOOP_TREND` != `stuck` **and** `LOOP_TREND` != `worse` → narrate `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking ({LOOP_TREND_LINE})` → return to the calling step.
 3. Ask the owner in this session; plain text, not through a host question tool. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. One message:
    - `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}`, then `Failures per test round: {LOOP_COUNTS}`, then the newest diagnosis (`debug-failure-diagnose-*.md`) or soak log (`debug-failure-soak-*-log.md`) in one line each.
    - The question — first match wins:
-     - **If** `LOOP_LIMIT` = true → `**Q1 — Soak:** The soak attempts are used up. Stop here instead of trying one more set of attempts?`.
-     - **If** `LOOP_POINT` = `fix` → `**Q1 — Fix:** The last fix attempt left no fewer failures. Stop here instead of trying again?`.
-     - **If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up, and the last one left no fewer failures. Stop here instead of starting soak (a slower, step-by-step investigation)?`.
-     - **Else** → `**Q1 — Soak:** The last soak attempt left no fewer failures. Stop here instead of trying again?`.
+     - **If** `LOOP_LIMIT` = true → `**Q1 — Soak:** The soak attempts are used up. {LOOP_TREND_LINE} Stop here instead of trying one more set of attempts?`.
+     - **If** `LOOP_POINT` = `fix` → `**Q1 — Fix:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
+     - **If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up. {LOOP_TREND_LINE} Stop here instead of starting soak (a slower, step-by-step investigation)?`.
+     - **Else** → `**Q1 — Soak:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
    - `Options: A) Stop / B) Try again`, then `Recommended: A) Stop`.
    - The line `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.`
      Record the wait → end turn → wait for the answer:
diff --git a/.bkit/authoring.md b/.bkit/authoring.md
index 74340abdf..5d7a52b8a 100644
--- a/.bkit/authoring.md
+++ b/.bkit/authoring.md
@@ -648,7 +648,7 @@ This section applies to `.bkit/core/workflows/*.md`. § Prompts and Workflows ap
   - Before the branches of a step that routes on the answer, say that a reply naming a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
   - Example (`bkit-debug.md` § Loop Question): "yes" stops the loop, which is the recommendation. The question already gives the reason, so the `Recommended:` line needs none.
     ```markdown
-    **Q1 — Fix:** The last fix attempt left no fewer failures. Stop here instead of trying again?
+    **Q1 — Fix:** The count did not fall between the first and the last round (4 → 4). Stop here instead of trying again?
     Options: A) Stop / B) Try again
     Recommended: A) Stop
     ```
diff --git a/.bkit/core/.bkit/authoring.md b/.bkit/core/.bkit/authoring.md
index d6f12f169..d2a67384d 100644
--- a/.bkit/core/.bkit/authoring.md
+++ b/.bkit/core/.bkit/authoring.md
@@ -648,7 +648,7 @@ This section applies to `.bkit/core/workflows/*.md`. § Prompts and Workflows ap
   - Before the branches of a step that routes on the answer, say that a reply naming a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
   - Example (`bkit-debug.md` § Loop Question): "yes" stops the loop, which is the recommendation. The question already gives the reason, so the `Recommended:` line needs none.
     ```markdown
-    **Q1 — Fix:** The last fix attempt left no fewer failures. Stop here instead of trying again?
+    **Q1 — Fix:** The count did not fall between the first and the last round (4 → 4). Stop here instead of trying again?
     Options: A) Stop / B) Try again
     Recommended: A) Stop
     ```
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index 5e16db643..b4bd38144 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -1026,13 +1026,14 @@ Every point where a run can ask the owner has two settings under `package.json`

<!-- prettier-ignore -->
   | Field | Source |
   | --- | --- |
   | `counts` (`5 → 2`) | `failures` on each check row |
-  | `codeChanged` | `git diff` of source (plan logs and ledgers excluded) between the first and last check rows' `parentSha`; `null` when git cannot compare |
+  | `codeChanged` | `git diff` of source (plan logs and ledgers excluded) between the `parentSha` of the compared same-scope pair; `null` when git cannot compare |
   | `lastStrategy` / `nextStrategy` / `finalSpent` | fix rows' `strategy`; next rung from every run |
   | `minutesPerRound` | check-row timestamps |
-  | `trend` | `worse` = count rose; `closing` = count fell and code changed (or unknown); `stuck` = otherwise; `first-round` = one check row |
-  | `recommend` | `try-again` when `closing`, else `stop`; `null` on `first-round` |
+  | `trend` | Compares the earliest round with the last round's `scope` against the last round. `unknown` = a compared count is missing, or no earlier round shares the last round's `scope`; `worse` = count rose; `closing` = count fell and code changed; `stuck` = otherwise; `first-round` = one check row |
+  | `trendLine` | One plain sentence with the compared counts and the reason for the trend; every loop question states it instead of a fixed claim |
+  | `recommend` | `try-again` when `closing`, else `stop`; `null` on `first-round` and `unknown` |
 
-- **Loop question:** `Q1`, worded so "yes" accepts `recommend`: `Another fix round?` (`Try again`) on `try-again`, else `Decide the items below instead of another fix round?` (`Decide`) when items exist, else `Stop`; items numbered from `Q2`. Every route into the pause sets `PAUSE_QUESTION` — `VERIFY_GAPS` for unfixable gaps, a fix round that changed nothing, or no round left; `TESTS_LOOP` for a failed test round with rounds left and `trend` `stuck` or `worse`; `CHALLENGE` for challenge tasks no agent can fix, or more findings than one merge takes. It picks the header, the items and the loop question, and resume reads it back from the `Question:` header.
+- **Loop question:** `Q1`, worded so "yes" accepts `recommend`: `Another fix round?` (`Try again`) on `try-again`, else `Decide the items below instead of another fix round?` (`Decide`) when items exist, else `Stop`; items numbered from `Q2`. Every route into the pause sets `PAUSE_QUESTION` — `VERIFY_GAPS` for unfixable gaps, a fix round that changed nothing, or no round left; `TESTS_LOOP` for a failed test round with rounds left and `trend` `stuck` or `worse` (`unknown` goes on to the fix without asking); `CHALLENGE` for challenge tasks no agent can fix, or more findings than one merge takes. It picks the header, the items and the loop question, and resume reads it back from the `Question:` header.
 
 ### `/bkit-debug` — 11 steps
 
@@ -1040,7 +1041,7 @@ Every point where a run can ask the owner has two settings under `package.json`
 
 **Evidence selection (Steps 1–2):** parse the named existing branch with `branches parse --workflow=debug`, then adopt it with `worktrees setup --branch` when supplied. Resolve prompt, current human issue text and active status with `runs locate`, validating branch and commit ancestry. Exit 0 selects red CI; exit 1 selects local discovery only after an explicit local choice or a proven no-red result. Exit 80 enters the mapped read fallback and revalidates its normalized evidence; ambiguous or unavailable references and branch conflicts stop before tests or edits. `status meta --ci-selection-file` persists the validated selection atomically and `status route` rederives gates. Resolution runs before downstream resume; a changed `ciGeneration` returns to Step 3 and requires fresh context.
 
-**Selected CI loop:** Step 3 passes saved `--ci-run` / `--ci-url`, records `source: ci` and `ciGeneration`, and does not run a local discovery gate until a matching-generation DONE remediation or soak row exists. Local rounds keep their clamp records; CI evidence rounds have no local clamp. Step 4 requires freshly checked complete selected-run logs with the matching identity receipt; partial or unavailable evidence stops diagnosis. `[repro]` routes to Step 5 once per generation: YES proceeds directly to Diagnose or Soak; NO blocks resolution. Steps 5–8 carry the selected identity and stamp their rows with `ciGeneration`. At close, every branch, including `main` without a PR, requires the configured gate and selected workflow to pass at the exact head held from the final successful push or dispatch. A missing pushed head stops before success. Original and verifying run links stay separate in the comment and final report. A red, skipped, cancelled, absent or unavailable verification blocks success.
+**Selected CI loop:** Step 3 passes saved `--ci-run` / `--ci-url`, records `source: ci` and `ciGeneration`, and does not run a local discovery gate until a matching-generation DONE remediation or soak row exists. Local rounds keep their clamp records; CI evidence rounds have no local clamp. The CI evidence round's `failures` is the selected run's failed job count when `runs locate` read the jobs (capstone left out), else unknown. Step 4 requires freshly checked complete selected-run logs with the matching identity receipt; partial or unavailable evidence stops diagnosis. `[repro]` routes to Step 5 once per generation: YES proceeds directly to Diagnose or Soak; NO blocks resolution. Steps 5–8 carry the selected identity and stamp their rows with `ciGeneration`. At close, every branch, including `main` without a PR, requires the configured gate and selected workflow to pass at the exact head held from the final successful push or dispatch. A missing pushed head stops before success. Original and verifying run links stay separate in the comment and final report. A red, skipped, cancelled, absent or unavailable verification blocks success.
 
 **Evidence round contract:** `tests run` writes a CI artifact with `Verdict: FAIL`, `Source: ci`, repository, workflow, run, attempt, commit, URL and generation. Its row has `source: ci`, `scope: ci:<runId>`, and null gate, exit code and failure count; it explicitly says the local gate did not run. `steps finish` checks this artifact against the active selection instead of demanding a local clamp record. `status route` returns `ciRun`, `ciGeneration`, `ciFixDone` and `ciReproduced`; only DONE rows for the current generation count. The reproduction row persists the report's `Reproduced` value as `reproduced`. After a matching fix, ordered declared gates cover known failed tiers first, retain the normal fallback order, and honor `[live=off]`. The configured workflow selector remains `package.json` `bkit.testing.ciWorkflow`; selecting another workflow adds its final proof rather than replacing the configured gate.
 
@@ -1767,7 +1768,7 @@ Build stops at integration because its diagnose → remediate loop can only repa
 
 Both resolve via `bkit tests run --gate=<deepest> --gate=<next> … --log=`: the deepest declared candidate runs (an empty script is not declared) and its full output is saved to `--log`; `scope` names it. None declared → exit 3, nothing run; a gate that could not run (126 / 127) → exit 4, never a FAIL verdict, so a missing tool is never diagnosed as a failing test. With `--file` (needs `--workflow` and `--step`, and an existing `status.jsonl`) every run, pass, fail or could not run, appends one `test-run` row and prints it as `row`.
 
-**Failure count from JUnit reports.** `tests run` empties `{log}.reports/` (next to the log, in the outbox, never committed) and passes its absolute path to the gate as `$BKIT_TEST_REPORT_DIR`. `failures` = failing plus erroring test cases summed over every `*.xml` there; skipped cases do not count. PASS prints 0. FAIL with no report, or with reports naming no failing case, prints `null` (count unknown) and a hint — never a guessed number; the step then drops `--failures`. Each test runner in a gate writes its own JUnit file into that folder: any `*.xml` name, never one that another runner of the gate also writes, and nothing at all when the variable is unset.
+**Failure count from JUnit reports.** `tests run` empties `{log}.reports/` (next to the log, in the outbox, never committed) and passes its absolute path to the gate as `$BKIT_TEST_REPORT_DIR`. `failures` = failing plus erroring test cases summed over every `*.xml` there; skipped cases do not count. PASS prints 0. FAIL with no report, or with reports naming no failing case, prints `null` (count unknown) and a hint — never a guessed number; the step then drops `--failures`. Each test runner in a gate writes its own JUnit file into that folder: any `*.xml` name, never one that another runner of the gate also writes, and nothing at all when the variable is unset. A `source: ci` round has no reports: its `failures` counts the selected run's failed CI jobs, the capstone left out, and the trend never compares it with a local round.
 
 A repo with no integration tier is visibly gated at `bkit:gate:static-unit` instead of quietly claiming more. `[live=off]` in the session prompt drops debug's live candidate (`status route --prompt-file` prints the remaining `gates`); no live gate declared → CONCERNS + `testsLiveSkipped`.
 
@@ -1849,7 +1850,7 @@ Verify→remediate and diagnose→fix loops carry context through per-attempt lo
 | --- | --- | --- | --- |
 | `@bkit-build-plan-verify` | `@bkit-build-plan-gaps-remediate` | `build.verify.maxAttempts` (2) rounds per group, never reset; unfixable gaps or no progress → Decision Pause | Further rounds taken without asking; limit used up → Decision Pause on the open gaps with the loop question when `ask` is true in a session (a go-on answer grants one more allowance), else Failure Path |
 | `bkit challenge gate` → `@bkit-build-challenge-2`, plus `@bkit-build-challenge-1` when large (parallel) → `bkit challenge merge` | `@bkit-build-plan-tasks` (the merged findings are plan tasks) | `build.challenge.maxAttempts` (2) rounds (`CHALLENGE_ROUND`): earlier rounds may fix on their own; the last never does | `**Fixable:** false` tasks, last-round tasks, or too many findings → Decision Pause; the last round's fixes are not challenged again |
-| Build test loop (`bkit tests run`, deepest declared gate) | `@bkit-debug-failure-diagnose` → `@bkit-debug-failure-remediate` | `build.tests.maxAttempts` (2) test rounds, never reset | Further rounds taken without asking; Decision Pause (`TESTS_LOOP`) only when `trend` is `stuck` or `worse`; limit used up → the same pause when `ask` is true in a session (a go-on answer grants one more allowance), else Failure Path |
+| Build test loop (`bkit tests run`, deepest declared gate) | `@bkit-debug-failure-diagnose` → `@bkit-debug-failure-remediate` | `build.tests.maxAttempts` (2) test rounds, never reset | Further rounds taken without asking; Decision Pause (`TESTS_LOOP`) only when `trend` is `stuck` or `worse` (`unknown` is fixed without asking); limit used up → the same pause when `ask` is true in a session (a go-on answer grants one more allowance), else Failure Path |
 | Debug test loop | `@bkit-debug-failure-diagnose` → `@bkit-debug-failure-remediate` (NORMAL); `@bkit-debug-failure-soak` (SOAK) | `debug.fix.maxAttempts` (2) then `debug.soak.maxAttempts` (2), each counted across every debug run of the feature | Further attempts taken without asking; Loop Question only when `trend` is `stuck` or `worse`; fix used up → SOAK; soak used up → Loop Question when `debug.soak.ask` is true in a session (`Try again` grants one more allowance), else Failure Path with `@bkit-debug-abort-handover` |
 | Ship merge loop | `@bkit-debug-failure-diagnose` → `@bkit-debug-failure-remediate` | `ship.merge.maxAttempts` (2) failed arrivals at Step 10 (gate refusals plus failed merges) | Fix round taken without asking when the diagnosis verdict is `PASS`, else asked; limit used up → the Merge Question when `ship.merge.ask` is true in a session (`Try again` grants one more allowance), else Failure Path with `@bkit-debug-abort-handover` |
 
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 0aa72fa95..8b7aefa84 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -2034,6 +2034,24 @@ describe("fix loops ask only when the last round made no progress", () => {
     expect(step3).toContain("`LOOP_POINT` = `soak`, `LOOP_FIX` = `debug-failure-soak`");
   });
 
+  it("debug Loop Question states the engine's trend line, never a fixed claim", () => {
+    const loop = section(workflow("debug"), /Loop Question/);
+    expect(loop).toContain("`trendLine` as `LOOP_TREND_LINE`");
+    expect(loop).not.toContain("left no fewer failures");
+    const questions = loop.split("\n").filter((l) => l.includes("**Q1 — "));
+    expect(questions.length).toBeGreaterThanOrEqual(4);
+    for (const q of questions) expect(q, q).toContain("{LOOP_TREND_LINE}");
+    expect(loop).toMatch(/taken without asking \([^\n]*\{LOOP_TREND_LINE\}/);
+  });
+
+  it("debug Loop Question at the used-up soak limit states the trend line", () => {
+    const loop = section(workflow("debug"), /Loop Question/);
+    expect(loop).toMatch(
+      /`LOOP_LIMIT` = true.*\*\*Q1 — Soak:\*\* The soak attempts are used up[^\n]*\{LOOP_TREND_LINE\}/,
+    );
+    expect(loop).toContain("`Recommended: A) Stop`");
+  });
+
   it("ship takes a merge fix round without asking when the diagnosis found the cause", () => {
     const step11 = section(workflow("ship"), /Step 11 — Failure Diagnose/);
     expect(step11).toContain("Hold `verdict` as `DIAGNOSE_VERDICT`");
diff --git a/.bkit/core/engine/commands/workflow/decisions.test.ts b/.bkit/core/engine/commands/workflow/decisions.test.ts
index b4308709b..45c0d2c3d 100644
--- a/.bkit/core/engine/commands/workflow/decisions.test.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.test.ts
@@ -359,6 +359,109 @@ describe("bkit decisions compose", () => {
     expect(r.json.loopRecommended).not.toBe("Stop");
   });
 
+  /** An uncounted group gate after a counted verify round: the trend reads `unknown`. */
+  async function composeUnknownTrend() {
+    const { root, logs } = checkout();
+    const status = path.join(logs, "status.jsonl");
+    const verifyRow = (at: string, attempt: number, failures: number) => ({
+      type: "step-done",
+      workflow: "build",
+      step: "build-plan-verify",
+      status: "DONE",
+      at,
+      group: 1,
+      attempt,
+      failures,
+    });
+    const gateRow = {
+      type: "test-run",
+      workflow: "build",
+      at: "2026-10-01T00:29:00Z",
+      step: "build-group-gate-1",
+      attempt: 2,
+      run: 1,
+      verdict: "FAIL",
+      exitCode: 1,
+      failures: null,
+      scope: "gate",
+      log: "x.log",
+    };
+    fs.writeFileSync(
+      status,
+      [
+        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
+        verifyRow("2026-10-01T00:10:00Z", 1, 2),
+        gateRow,
+        verifyRow("2026-10-01T00:30:00Z", 2, 0),
+      ]
+        .map((x) => JSON.stringify(x))
+        .join("\n") + "\n",
+    );
+    const { r, out } = await compose(
+      root,
+      logs,
+      [],
+      "--loop=verify",
+      `--file=${status}`,
+      "--group=1",
+      "--attempt=2",
+      "--max=2",
+    );
+    expect(r.code).toBe(0);
+    return fs.readFileSync(out, "utf-8");
+  }
+
+  it("--loop on an unknown trend recommends Try again without claiming progress", async () => {
+    const text = await composeUnknownTrend();
+    expect(text).toContain("Trend: unknown");
+    expect(text).toMatch(/Recommended: (A\) )?Try again — /);
+    expect(text).not.toContain("the last round made progress");
+  });
+
+  it("--loop on an unknown trend says the limit is used up", async () => {
+    const text = await composeUnknownTrend();
+    expect(text).toContain("limit is used up");
+    expect(text).not.toContain("a round is left");
+  });
+
+  it("--loop states the engine's trendLine in Q1", async () => {
+    const { root, logs } = checkout();
+    const status = path.join(logs, "status.jsonl");
+    const verify = (at: string, failures: number) => ({
+      type: "step-done",
+      workflow: "build",
+      step: "build-plan-verify",
+      status: "DONE",
+      at,
+      group: 1,
+      failures,
+    });
+    fs.writeFileSync(
+      status,
+      [
+        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
+        verify("2026-10-01T00:10:00Z", 5),
+        verify("2026-10-01T00:20:00Z", 2),
+      ]
+        .map((x) => JSON.stringify(x))
+        .join("\n") + "\n",
+    );
+    const { r, out } = await compose(
+      root,
+      logs,
+      ITEMS,
+      "--loop=verify",
+      `--file=${status}`,
+      "--group=1",
+      "--attempt=2",
+      "--max=3",
+    );
+    expect(r.code).toBe(0);
+    const text = fs.readFileSync(out, "utf-8");
+    const q1 = text.slice(text.indexOf("**Q1"), text.indexOf("**Q2"));
+    expect(q1).toContain("(5 → 2)");
+  });
+
   /** A verify loop stuck at 4 → 4, so the trend alone recommends `Decide` (`Stop` with no items). */
   function stuckStatus(logs: string) {
     const status = path.join(logs, "status.jsonl");
diff --git a/.bkit/core/engine/commands/workflow/decisions.ts b/.bkit/core/engine/commands/workflow/decisions.ts
index 25927b6c0..17f925cc4 100644
--- a/.bkit/core/engine/commands/workflow/decisions.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.ts
@@ -458,18 +458,13 @@ export const decisionsCommand: CommandSpec = {
           const attempt = str(ctx.flags.attempt) ?? String(p.rounds.length);
           const max = str(ctx.flags.max) ?? "?";
           const changed = p.codeChanged === null ? "unknown" : p.codeChanged ? "yes" : "no";
-          const trendLine = {
-            "first-round": "This was the first round, so there is no trend yet.",
-            closing: "Fewer problems after each round, and the code changed.",
-            stuck: "No fewer problems, or the code did not change.",
-            worse: "More problems than the first round.",
-            unknown: "The counts cannot show whether the rounds helped.",
-          }[p.trend];
           loopRecommended = p.recommend === "stop" ? "Decide" : "Try again";
           const trendReason =
-            loopRecommended === "Try again"
-              ? "the last round made progress"
-              : "another round is unlikely to close the remaining items";
+            p.trend === "unknown"
+              ? `the limit is used up and the counts cannot show whether the rounds helped (${p.trendLine})`
+              : loopRecommended === "Try again"
+                ? "the last round made progress"
+                : "another round is unlikely to close the remaining items";
           let reason = trendReason;
           let baseLine: string[] = [];
           if (baseCheck !== undefined) {
@@ -514,8 +509,8 @@ export const decisionsCommand: CommandSpec = {
               title: loop.title,
               question:
                 loopRecommended === "Try again"
-                  ? `another fix round? ${trendLine}`
-                  : `decide the items below instead of another round? ${trendLine}`,
+                  ? `another fix round? ${p.trendLine}`
+                  : `decide the items below instead of another round? ${p.trendLine}`,
               options: items.length > 0 ? ["Try again", "Decide"] : ["Try again", "Stop"],
               recommended:
                 items.length > 0 || loopRecommended === "Try again" ? loopRecommended : "Stop",
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index edf8cd499..6b7c01e41 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -983,7 +983,7 @@ This step checks the whole feature against the plan after the last group, and ag
        ```
        **If** exit non-zero → **Failure Path**. Hold `trend` as `TEST_TREND`.
        - **If** `TEST_TREND` = `stuck` **or** `worse` → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**.
-       - **Else** → Step 13; a failed test round after a round that made progress is always fixed, never asked.
+       - **Else** → Step 13; a failed test round whose trend is not `stuck` or `worse` (`closing`, `unknown`) is always fixed, never asked.
      - **Else** → **Failure Path**.
    - **Else** → **Failure Path**.
 
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
index a32d7591c..dbb5c98f8 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
@@ -105,15 +105,15 @@ _No tracker connected, skip step._
    "{BKIT}" counters progress --file="{STATUS}" --workflow=debug --check=debug-run-tests --fix={LOOP_FIX}
    ```
    **If** exit non-zero → **Failure Path**.
-   Hold `trend` as `LOOP_TREND` and `counts` as `LOOP_COUNTS`.
-   **If** `LOOP_LIMIT` is not held **and** `LOOP_TREND` != `stuck` **and** `LOOP_TREND` != `worse` → narrate `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking (failures {LOOP_COUNTS})` → return to the calling step.
+   Hold `trend` as `LOOP_TREND`, `counts` as `LOOP_COUNTS` and `trendLine` as `LOOP_TREND_LINE`.
+   **If** `LOOP_LIMIT` is not held **and** `LOOP_TREND` != `stuck` **and** `LOOP_TREND` != `worse` → narrate `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking ({LOOP_TREND_LINE})` → return to the calling step.
 3. Ask the owner in this session; plain text, not through a host question tool. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. One message:
    - `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}`, then `Failures per test round: {LOOP_COUNTS}`, then the newest diagnosis (`debug-failure-diagnose-*.md`) or soak log (`debug-failure-soak-*-log.md`) in one line each.
    - The question — first match wins:
-     - **If** `LOOP_LIMIT` = true → `**Q1 — Soak:** The soak attempts are used up. Stop here instead of trying one more set of attempts?`.
-     - **If** `LOOP_POINT` = `fix` → `**Q1 — Fix:** The last fix attempt left no fewer failures. Stop here instead of trying again?`.
-     - **If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up, and the last one left no fewer failures. Stop here instead of starting soak (a slower, step-by-step investigation)?`.
-     - **Else** → `**Q1 — Soak:** The last soak attempt left no fewer failures. Stop here instead of trying again?`.
+     - **If** `LOOP_LIMIT` = true → `**Q1 — Soak:** The soak attempts are used up. {LOOP_TREND_LINE} Stop here instead of trying one more set of attempts?`.
+     - **If** `LOOP_POINT` = `fix` → `**Q1 — Fix:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
+     - **If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up. {LOOP_TREND_LINE} Stop here instead of starting soak (a slower, step-by-step investigation)?`.
+     - **Else** → `**Q1 — Soak:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
    - `Options: A) Stop / B) Try again`, then `Recommended: A) Stop`.
    - The line `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.`
      Record the wait → end turn → wait for the answer:
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index 4f20abd73..79b779b7b 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -1068,7 +1068,7 @@ This step checks the whole feature against the plan after the last group, and ag
        ```
        **If** exit non-zero → **Failure Path**. Hold `trend` as `TEST_TREND`.
        - **If** `TEST_TREND` = `stuck` **or** `worse` → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**.
-       - **Else** → Step 13; a failed test round after a round that made progress is always fixed, never asked.
+       - **Else** → Step 13; a failed test round whose trend is not `stuck` or `worse` (`closing`, `unknown`) is always fixed, never asked.
      - **Else** → **Failure Path**.
    - **Else** → **Failure Path**.
 
diff --git a/.bkit/core/workflows/bkit-debug.md b/.bkit/core/workflows/bkit-debug.md
index 25a9d732c..c3bfcbcfa 100644
--- a/.bkit/core/workflows/bkit-debug.md
+++ b/.bkit/core/workflows/bkit-debug.md
@@ -132,15 +132,15 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    "{BKIT}" counters progress --file="{STATUS}" --workflow=debug --check=debug-run-tests --fix={LOOP_FIX}
    ```
    **If** exit non-zero → **Failure Path**.
-   Hold `trend` as `LOOP_TREND` and `counts` as `LOOP_COUNTS`.
-   **If** `LOOP_LIMIT` is not held **and** `LOOP_TREND` != `stuck` **and** `LOOP_TREND` != `worse` → narrate `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking (failures {LOOP_COUNTS})` → return to the calling step.
+   Hold `trend` as `LOOP_TREND`, `counts` as `LOOP_COUNTS` and `trendLine` as `LOOP_TREND_LINE`.
+   **If** `LOOP_LIMIT` is not held **and** `LOOP_TREND` != `stuck` **and** `LOOP_TREND` != `worse` → narrate `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking ({LOOP_TREND_LINE})` → return to the calling step.
 3. Ask the owner in this session; plain text, not through a host question tool. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. One message:
    - `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}`, then `Failures per test round: {LOOP_COUNTS}`, then the newest diagnosis (`debug-failure-diagnose-*.md`) or soak log (`debug-failure-soak-*-log.md`) in one line each.
    - The question — first match wins:
-     - **If** `LOOP_LIMIT` = true → `**Q1 — Soak:** The soak attempts are used up. Stop here instead of trying one more set of attempts?`.
-     - **If** `LOOP_POINT` = `fix` → `**Q1 — Fix:** The last fix attempt left no fewer failures. Stop here instead of trying again?`.
-     - **If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up, and the last one left no fewer failures. Stop here instead of starting soak (a slower, step-by-step investigation)?`.
-     - **Else** → `**Q1 — Soak:** The last soak attempt left no fewer failures. Stop here instead of trying again?`.
+     - **If** `LOOP_LIMIT` = true → `**Q1 — Soak:** The soak attempts are used up. {LOOP_TREND_LINE} Stop here instead of trying one more set of attempts?`.
+     - **If** `LOOP_POINT` = `fix` → `**Q1 — Fix:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
+     - **If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up. {LOOP_TREND_LINE} Stop here instead of starting soak (a slower, step-by-step investigation)?`.
+     - **Else** → `**Q1 — Soak:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
    - `Options: A) Stop / B) Try again`, then `Recommended: A) Stop`.
    - The line `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.`
      Record the wait → end turn → wait for the answer:
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 2d9533455..b7eb4ce24 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -10301,11 +10301,11 @@ Final return: display `{FINAL_RETURN}` verbatim. With selected CI, append `Origi
 **Modes:** Step 1 decides `PUSH_MODE` (`PR|LOCAL`) and `DEBUG_MODE` (`NORMAL|SOAK`). `DEBUG_MODE` selects the fix step: `NORMAL` → Diagnose (6) and Remediate (7); `SOAK` → Failure Remediate Soak (8). `REPRO` (`[repro]`) adds Failure Reproduce (5) after a first-attempt PASS, in either mode. A run starts in `SOAK` on `[soak]`, on an open run already soaking, or once the feature's runs hold `debug.fix.maxAttempts` Remediate rows. `NORMAL` switches to `SOAK` mid-run when the diagnose agent sets `Mode: SOAK`, or when the fix attempts are used up. `SOAK` is terminal.
 **If** `LOOP_ASK` = false → narrate `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking` → return to the calling step.
 Read the loop's progress:
-**If** `LOOP_LIMIT` is not held **and** `LOOP_TREND` != `stuck` **and** `LOOP_TREND` != `worse` → narrate `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking (failures {LOOP_COUNTS})` → return to the calling step.
+**If** `LOOP_LIMIT` is not held **and** `LOOP_TREND` != `stuck` **and** `LOOP_TREND` != `worse` → narrate `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking ({LOOP_TREND_LINE})` → return to the calling step.
 `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}`, then `Failures per test round: {LOOP_COUNTS}`, then the newest diagnosis (`debug-failure-diagnose-*.md`) or soak log (`debug-failure-soak-*-log.md`) in one line each.
-**If** `LOOP_POINT` = `fix` → `**Q1 — Fix:** The last fix attempt left no fewer failures. Stop here instead of trying again?`.
-**If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up, and the last one left no fewer failures. Stop here instead of starting soak (a slower, step-by-step investigation)?`.
-**Else** → `**Q1 — Soak:** The last soak attempt left no fewer failures. Stop here instead of trying again?`.
+**If** `LOOP_POINT` = `fix` → `**Q1 — Fix:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
+**If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up. {LOOP_TREND_LINE} Stop here instead of starting soak (a slower, step-by-step investigation)?`.
+**Else** → `**Q1 — Soak:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
 `Options: A) Stop / B) Try again`, then `Recommended: A) Stop`.
 The line `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.`
 Record the wait → end turn → wait for the answer:
diff --git a/.bkit/version b/.bkit/version
index 0d3bc0178..bdbe685b2 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -15,8 +15,8 @@
     ".bkit/.env.example": "33195c635ab4b35dea8990a278bb28193f4b5f331dcbdc5c975aeb5f51743e41",
     ".opencode/opencode.json": "06b3702dcb8968463c164b36fbc340428591f6601420cb48e95371db1d1ac958",
     ".claude/commands/bkit-auto.md": "2fb94062947b55466f7baed87ee27347e2626d6a43200691ff68cb7f62a0947f",
-    ".claude/commands/bkit-build.md": "7580beab783bea59021269556901d2c33fbfed0bbd31e3c8eaaaf98e57daccbf",
-    ".claude/commands/bkit-debug.md": "374d4520e78a4421fa1e3227e3c5e184feb08706b2aaafdc290c6e0835c78333",
+    ".claude/commands/bkit-build.md": "267cc6580715b298a476ee0935ecf5e3bc092a0ebc0c198d7f576f35ed8345f5",
+    ".claude/commands/bkit-debug.md": "d90b236a686546f2206d6c24e4d8cb6b2cf4b2c0393b510139a214c9e4ecab0d",
     ".claude/commands/bkit-design.md": "19fc3688e1f0063c2ff02b61921c6c3153f5d3892eb08c812643507539f8790a",
     ".claude/commands/bkit-plan.md": "21e65d37fb3fede54a1edbb0d6a71e589178a0d6991b007b24770aedf818afde",
     ".claude/commands/bkit-ship.md": "83fe28b8c8777339d8cd7d1faa8528ed5d4804de187409fd11469c35cbcee5d7",
@@ -47,8 +47,8 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "1b7656fc438127f67b566c9f532e6a39649c79e1bda1814608a4f3d44daed45b",
     ".claude/agents/bkit-utility-update-documentation.md": "58eef51a24cbbd53a16c12cf603888fc4a98963bb7dadbde0b60a7e3207eb43c",
     ".cursor/commands/bkit-auto.md": "f363b93008d334ca20e3825f5a734cd5cd0b5ad27e4287c0231985702653826a",
-    ".cursor/commands/bkit-build.md": "5cc985a3353cc2fe435048db2c572b468c01011f53528f6081c257757ce6c233",
-    ".cursor/commands/bkit-debug.md": "0c431c1245effbc9d70ab3d928cc739c8c6eb72807c6afcf51889dd16c2b83f6",
+    ".cursor/commands/bkit-build.md": "89a2154fa7d70355dd0240e3ed23621a4586573c30e64340af51b371d0848087",
+    ".cursor/commands/bkit-debug.md": "e9744cc9f7a0143d42d91c34dd057e65489632548177ae66df1e6519ffe2d738",
     ".cursor/commands/bkit-design.md": "50503d506d3be97b176612647f202e4428e43446a3e29c9f63c931ebdc32f2c1",
     ".cursor/commands/bkit-plan.md": "3ce05ec47616b860b785c128c5a80e3e81dda9951d84744a8f8c93063c3a91ed",
     ".cursor/commands/bkit-ship.md": "dab8baaa8628fa12169af91a4afe0acd7ed110661a3b3f77da699a727b348631",
@@ -105,8 +105,8 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "f2f08f6e4de6311dd5f6a4f0573b234d31bae1e0f5d1c4c071969ca978140ee9",
     ".opencode/agents/bkit-utility-update-documentation.md": "5b274f7a0f331ee4c1ea2bcfc44a5d7855e0756e94e99dafd3d17ef942f3a032",
     ".opencode/commands/bkit-auto.md": "973d91ed58716f8b8be1009c3f2f686051cf1c8a617b14c3775814e7b356debb",
-    ".opencode/commands/bkit-build.md": "768b249f04353ef1c3e2d644d9f0672a622800b528b3cf0afd83e78321b787e1",
-    ".opencode/commands/bkit-debug.md": "22160c578bd2f06c9e674fe524accae793a977d206185814d04ccd99e75bbc6d",
+    ".opencode/commands/bkit-build.md": "ac40db75f408939d9622d8767722cfe194624161aa852906f964c5f9143b2d90",
+    ".opencode/commands/bkit-debug.md": "3f3c872889c0e09a744fc8c6c41af1d63ac1a7ee53a2ce9619edce7161aedead",
     ".opencode/commands/bkit-design.md": "43ef687878db97f39336b4e91ffe1adb845048999b5b686864898b4cc58a09a7",
     ".opencode/commands/bkit-plan.md": "afd4b5bb5a1c7d14ec9d4257ebe2f415e57c2e6ad625ec8c993c429acc886a42",
     ".opencode/commands/bkit-ship.md": "047e1a1793d0a7d3b6ebb96e4226582f99abe3373bbd6a55162b77a08b81170f",
@@ -214,7 +214,7 @@
     ".bkit/providers.md": "e87503c7cc4d045997c30ea315f76438589abc9bcf038f63ce291ca85b8f1e1f",
     ".bkit/prompts.md": "1042b43fc528b1720e8a3a96b319b65a9bf7585735d6a333926dc9556847fac1",
     ".bkit/trackers.md": "c3b91b7ffcf75333bc2d09af7c9d887397850539b87b964441025e8978f41803",
-    ".bkit/workflows.md": "f6f9896050ff9da1f79b2e67a583bbe7e77ce64272d61c54fa411fb96cc582b4",
+    ".bkit/workflows.md": "38548e69b5382c75c2c37e39fcac17e710007f97427003cf41e5b2a8a1b223bd",
     ".bkit/README.md": "7e46439319d2c1befb9ee4f1ff7fb2d4ffdf442bc7bc0f45217704b1cc4dceb5",
     ".cursor/rules/bkit-rules.mdc": "0c15e475a322bd66f4f2258b5ffc2a6700bb9c9d217a75fa18d8168c9e1106e8",
     ".claude/hooks/bkit-gateguard.cjs": "0b805d03e1361054c12dd91f8a7641484ce45c914d9dec06d1f7866c6cb4c3ce",
@@ -250,7 +250,7 @@
     ".cursor/agents/bkit-build-plan-convert.md": "a02f2eb7938d1dbf59be029626ec4391794eb3aa8899b1b06a17c7279e06f9b0",
     ".opencode/agents/bkit-build-plan-convert.md": "6184fc3549d6829d45a8bdf8e56da784a1de3ca03d67c5f4d427ce00ec9bf597",
     ".codex/agents/bkit-build-plan-convert.toml": "cf2060e8d79d9d36dca315f2ac175c140cf32cf6f64e5b1f84f04e4ebfb877c9",
-    ".bkit/authoring.md": "de9369894e80de63673091f86d233cc70bb3f9232d136f2affd7cb2bf361bd85",
+    ".bkit/authoring.md": "21651ce3ec8e9ba62da5827c2d945fe1d9ad7c215e25ff2caac860ce317cedc4",
     ".codex/hooks/bkit-rules.cjs": "8aee2cde5448c083ae0dc07a4f1db86ce7e815a2a2eafe54b886b7f4393cab91",
     ".opencode/plugin/bkit-rules.js": "417d3ca107ebf005060953a17340620e1fcfb5bcdf491316a937e0c747b0377e",
     ".bkit/router.md": "c20d006757e350c173da94686d48500bc83e12d9f7bb6ff5911e47e332e45eab",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index b7654ab07..0453433ea 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -1026,13 +1026,14 @@ Every point where a run can ask the owner has two settings under `package.json`

<!-- prettier-ignore -->
   | Field | Source |
   | --- | --- |
   | `counts` (`5 → 2`) | `failures` on each check row |
-  | `codeChanged` | `git diff` of source (plan logs and ledgers excluded) between the first and last check rows' `parentSha`; `null` when git cannot compare |
+  | `codeChanged` | `git diff` of source (plan logs and ledgers excluded) between the `parentSha` of the compared same-scope pair; `null` when git cannot compare |
   | `lastStrategy` / `nextStrategy` / `finalSpent` | fix rows' `strategy`; next rung from every run |
   | `minutesPerRound` | check-row timestamps |
-  | `trend` | `worse` = count rose; `closing` = count fell and code changed (or unknown); `stuck` = otherwise; `first-round` = one check row |
-  | `recommend` | `try-again` when `closing`, else `stop`; `null` on `first-round` |
+  | `trend` | Compares the earliest round with the last round's `scope` against the last round. `unknown` = a compared count is missing, or no earlier round shares the last round's `scope`; `worse` = count rose; `closing` = count fell and code changed; `stuck` = otherwise; `first-round` = one check row |
+  | `trendLine` | One plain sentence with the compared counts and the reason for the trend; every loop question states it instead of a fixed claim |
+  | `recommend` | `try-again` when `closing`, else `stop`; `null` on `first-round` and `unknown` |
 
-- **Loop question:** `Q1`, worded so "yes" accepts `recommend`: `Another fix round?` (`Try again`) on `try-again`, else `Decide the items below instead of another fix round?` (`Decide`) when items exist, else `Stop`; items numbered from `Q2`. Every route into the pause sets `PAUSE_QUESTION` — `VERIFY_GAPS` for unfixable gaps, a fix round that changed nothing, or no round left; `TESTS_LOOP` for a failed test round with rounds left and `trend` `stuck` or `worse`; `CHALLENGE` for challenge tasks no agent can fix, or more findings than one merge takes. It picks the header, the items and the loop question, and resume reads it back from the `Question:` header.
+- **Loop question:** `Q1`, worded so "yes" accepts `recommend`: `Another fix round?` (`Try again`) on `try-again`, else `Decide the items below instead of another fix round?` (`Decide`) when items exist, else `Stop`; items numbered from `Q2`. Every route into the pause sets `PAUSE_QUESTION` — `VERIFY_GAPS` for unfixable gaps, a fix round that changed nothing, or no round left; `TESTS_LOOP` for a failed test round with rounds left and `trend` `stuck` or `worse` (`unknown` goes on to the fix without asking); `CHALLENGE` for challenge tasks no agent can fix, or more findings than one merge takes. It picks the header, the items and the loop question, and resume reads it back from the `Question:` header.
 
 ### `/bkit-debug` — 11 steps
 
@@ -1040,7 +1041,7 @@ Every point where a run can ask the owner has two settings under `package.json`
 
 **Evidence selection (Steps 1–2):** parse the named existing branch with `branches parse --workflow=debug`, then adopt it with `worktrees setup --branch` when supplied. Resolve prompt, current human issue text and active status with `runs locate`, validating branch and commit ancestry. Exit 0 selects red CI; exit 1 selects local discovery only after an explicit local choice or a proven no-red result. Exit 80 enters the mapped read fallback and revalidates its normalized evidence; ambiguous or unavailable references and branch conflicts stop before tests or edits. `status meta --ci-selection-file` persists the validated selection atomically and `status route` rederives gates. Resolution runs before downstream resume; a changed `ciGeneration` returns to Step 3 and requires fresh context.
 
-**Selected CI loop:** Step 3 passes saved `--ci-run` / `--ci-url`, records `source: ci` and `ciGeneration`, and does not run a local discovery gate until a matching-generation DONE remediation or soak row exists. Local rounds keep their clamp records; CI evidence rounds have no local clamp. Step 4 requires freshly checked complete selected-run logs with the matching identity receipt; partial or unavailable evidence stops diagnosis. `[repro]` routes to Step 5 once per generation: YES proceeds directly to Diagnose or Soak; NO blocks resolution. Steps 5–8 carry the selected identity and stamp their rows with `ciGeneration`. At close, every branch, including `main` without a PR, requires the configured gate and selected workflow to pass at the exact head held from the final successful push or dispatch. A missing pushed head stops before success. Original and verifying run links stay separate in the comment and final report. A red, skipped, cancelled, absent or unavailable verification blocks success.
+**Selected CI loop:** Step 3 passes saved `--ci-run` / `--ci-url`, records `source: ci` and `ciGeneration`, and does not run a local discovery gate until a matching-generation DONE remediation or soak row exists. Local rounds keep their clamp records; CI evidence rounds have no local clamp. The CI evidence round's `failures` is the selected run's failed job count when `runs locate` read the jobs (capstone left out), else unknown. Step 4 requires freshly checked complete selected-run logs with the matching identity receipt; partial or unavailable evidence stops diagnosis. `[repro]` routes to Step 5 once per generation: YES proceeds directly to Diagnose or Soak; NO blocks resolution. Steps 5–8 carry the selected identity and stamp their rows with `ciGeneration`. At close, every branch, including `main` without a PR, requires the configured gate and selected workflow to pass at the exact head held from the final successful push or dispatch. A missing pushed head stops before success. Original and verifying run links stay separate in the comment and final report. A red, skipped, cancelled, absent or unavailable verification blocks success.
 
 **Evidence round contract:** `tests run` writes a CI artifact with `Verdict: FAIL`, `Source: ci`, repository, workflow, run, attempt, commit, URL and generation. Its row has `source: ci`, `scope: ci:<runId>`, and null gate, exit code and failure count; it explicitly says the local gate did not run. `steps finish` checks this artifact against the active selection instead of demanding a local clamp record. `status route` returns `ciRun`, `ciGeneration`, `ciFixDone` and `ciReproduced`; only DONE rows for the current generation count. The reproduction row persists the report's `Reproduced` value as `reproduced`. After a matching fix, ordered declared gates cover known failed tiers first, retain the normal fallback order, and honor `[live=off]`. The configured workflow selector remains `package.json` `bkit.testing.ciWorkflow`; selecting another workflow adds its final proof rather than replacing the configured gate.
 
@@ -1767,7 +1768,7 @@ Build stops at integration because its diagnose → remediate loop can only repa
 
 Both resolve via `bkit tests run --gate=<deepest> --gate=<next> … --log=`: the deepest declared candidate runs (an empty script is not declared) and its full output is saved to `--log`; `scope` names it. None declared → exit 3, nothing run; a gate that could not run (126 / 127) → exit 4, never a FAIL verdict, so a missing tool is never diagnosed as a failing test. With `--file` (needs `--workflow` and `--step`, and an existing `status.jsonl`) every run, pass, fail or could not run, appends one `test-run` row and prints it as `row`.
 
-**Failure count from JUnit reports.** `tests run` empties `{log}.reports/` (next to the log, in the outbox, never committed) and passes its absolute path to the gate as `$BKIT_TEST_REPORT_DIR`. `failures` = failing plus erroring test cases summed over every `*.xml` there; skipped cases do not count. PASS prints 0. FAIL with no report, or with reports naming no failing case, prints `null` (count unknown) and a hint — never a guessed number; the step then drops `--failures`. Each test runner in a gate writes its own JUnit file into that folder: any `*.xml` name, never one that another runner of the gate also writes, and nothing at all when the variable is unset.
+**Failure count from JUnit reports.** `tests run` empties `{log}.reports/` (next to the log, in the outbox, never committed) and passes its absolute path to the gate as `$BKIT_TEST_REPORT_DIR`. `failures` = failing plus erroring test cases summed over every `*.xml` there; skipped cases do not count. PASS prints 0. FAIL with no report, or with reports naming no failing case, prints `null` (count unknown) and a hint — never a guessed number; the step then drops `--failures`. Each test runner in a gate writes its own JUnit file into that folder: any `*.xml` name, never one that another runner of the gate also writes, and nothing at all when the variable is unset. A `source: ci` round has no reports: its `failures` counts the selected run's failed CI jobs, the capstone left out, and the trend never compares it with a local round.
 
 A repo with no integration tier is visibly gated at `bkit:gate:static-unit` instead of quietly claiming more. `[live=off]` in the session prompt drops debug's live candidate (`status route --prompt-file` prints the remaining `gates`); no live gate declared → CONCERNS + `testsLiveSkipped`.
 
@@ -1849,7 +1850,7 @@ Verify→remediate and diagnose→fix loops carry context through per-attempt lo
 | --- | --- | --- | --- |
 | `@bkit-build-plan-verify` | `@bkit-build-plan-gaps-remediate` | `build.verify.maxAttempts` (2) rounds per group, never reset; unfixable gaps or no progress → Decision Pause | Further rounds taken without asking; limit used up → Decision Pause on the open gaps with the loop question when `ask` is true in a session (a go-on answer grants one more allowance), else Failure Path |
 | `bkit challenge gate` → `@bkit-build-challenge-2`, plus `@bkit-build-challenge-1` when large (parallel) → `bkit challenge merge` | `@bkit-build-plan-tasks` (the merged findings are plan tasks) | `build.challenge.maxAttempts` (2) rounds (`CHALLENGE_ROUND`): earlier rounds may fix on their own; the last never does | `**Fixable:** false` tasks, last-round tasks, or too many findings → Decision Pause; the last round's fixes are not challenged again |
-| Build test loop (`bkit tests run`, deepest declared gate) | `@bkit-debug-failure-diagnose` → `@bkit-debug-failure-remediate` | `build.tests.maxAttempts` (2) test rounds, never reset | Further rounds taken without asking; Decision Pause (`TESTS_LOOP`) only when `trend` is `stuck` or `worse`; limit used up → the same pause when `ask` is true in a session (a go-on answer grants one more allowance), else Failure Path |
+| Build test loop (`bkit tests run`, deepest declared gate) | `@bkit-debug-failure-diagnose` → `@bkit-debug-failure-remediate` | `build.tests.maxAttempts` (2) test rounds, never reset | Further rounds taken without asking; Decision Pause (`TESTS_LOOP`) only when `trend` is `stuck` or `worse` (`unknown` is fixed without asking); limit used up → the same pause when `ask` is true in a session (a go-on answer grants one more allowance), else Failure Path |
 | Debug test loop | `@bkit-debug-failure-diagnose` → `@bkit-debug-failure-remediate` (NORMAL); `@bkit-debug-failure-soak` (SOAK) | `debug.fix.maxAttempts` (2) then `debug.soak.maxAttempts` (2), each counted across every debug run of the feature | Further attempts taken without asking; Loop Question only when `trend` is `stuck` or `worse`; fix used up → SOAK; soak used up → Loop Question when `debug.soak.ask` is true in a session (`Try again` grants one more allowance), else Failure Path with `@bkit-debug-abort-handover` |
 | Ship merge loop | `@bkit-debug-failure-diagnose` → `@bkit-debug-failure-remediate` | `ship.merge.maxAttempts` (2) failed arrivals at Step 10 (gate refusals plus failed merges) | Fix round taken without asking when the diagnosis verdict is `PASS`, else asked; limit used up → the Merge Question when `ship.merge.ask` is true in a session (`Try again` grants one more allowance), else Failure Path with `@bkit-debug-abort-handover` |
 
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index c63ceaf72..8355be36f 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -1026,7 +1026,7 @@ This step checks the whole feature against the plan after the last group, and ag
        ```
        **If** exit non-zero → **Failure Path**. Hold `trend` as `TEST_TREND`.
        - **If** `TEST_TREND` = `stuck` **or** `worse` → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**.
-       - **Else** → Step 13; a failed test round after a round that made progress is always fixed, never asked.
+       - **Else** → Step 13; a failed test round whose trend is not `stuck` or `worse` (`closing`, `unknown`) is always fixed, never asked.
      - **Else** → **Failure Path**.
    - **Else** → **Failure Path**.
 
diff --git a/.claude/commands/bkit-debug.md b/.claude/commands/bkit-debug.md
index ebf7538ab..5325c70f1 100644
--- a/.claude/commands/bkit-debug.md
+++ b/.claude/commands/bkit-debug.md
@@ -113,15 +113,15 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    "{BKIT}" counters progress --file="{STATUS}" --workflow=debug --check=debug-run-tests --fix={LOOP_FIX}
    ```
    **If** exit non-zero → **Failure Path**.
-   Hold `trend` as `LOOP_TREND` and `counts` as `LOOP_COUNTS`.
-   **If** `LOOP_LIMIT` is not held **and** `LOOP_TREND` != `stuck` **and** `LOOP_TREND` != `worse` → narrate `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking (failures {LOOP_COUNTS})` → return to the calling step.
+   Hold `trend` as `LOOP_TREND`, `counts` as `LOOP_COUNTS` and `trendLine` as `LOOP_TREND_LINE`.
+   **If** `LOOP_LIMIT` is not held **and** `LOOP_TREND` != `stuck` **and** `LOOP_TREND` != `worse` → narrate `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking ({LOOP_TREND_LINE})` → return to the calling step.
 3. Ask the owner in this session; plain text, not through a host question tool. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. One message:
    - `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}`, then `Failures per test round: {LOOP_COUNTS}`, then the newest diagnosis (`debug-failure-diagnose-*.md`) or soak log (`debug-failure-soak-*-log.md`) in one line each.
    - The question — first match wins:
-     - **If** `LOOP_LIMIT` = true → `**Q1 — Soak:** The soak attempts are used up. Stop here instead of trying one more set of attempts?`.
-     - **If** `LOOP_POINT` = `fix` → `**Q1 — Fix:** The last fix attempt left no fewer failures. Stop here instead of trying again?`.
-     - **If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up, and the last one left no fewer failures. Stop here instead of starting soak (a slower, step-by-step investigation)?`.
-     - **Else** → `**Q1 — Soak:** The last soak attempt left no fewer failures. Stop here instead of trying again?`.
+     - **If** `LOOP_LIMIT` = true → `**Q1 — Soak:** The soak attempts are used up. {LOOP_TREND_LINE} Stop here instead of trying one more set of attempts?`.
+     - **If** `LOOP_POINT` = `fix` → `**Q1 — Fix:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
+     - **If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up. {LOOP_TREND_LINE} Stop here instead of starting soak (a slower, step-by-step investigation)?`.
+     - **Else** → `**Q1 — Soak:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
    - `Options: A) Stop / B) Try again`, then `Recommended: A) Stop`.
    - The line `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.`
      Record the wait → end turn → wait for the answer:
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index 38843a655..fccce3a94 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -1025,7 +1025,7 @@ This step checks the whole feature against the plan after the last group, and ag
        ```
        **If** exit non-zero → **Failure Path**. Hold `trend` as `TEST_TREND`.
        - **If** `TEST_TREND` = `stuck` **or** `worse` → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**.
-       - **Else** → Step 13; a failed test round after a round that made progress is always fixed, never asked.
+       - **Else** → Step 13; a failed test round whose trend is not `stuck` or `worse` (`closing`, `unknown`) is always fixed, never asked.
      - **Else** → **Failure Path**.
    - **Else** → **Failure Path**.
 
diff --git a/.cursor/commands/bkit-debug.md b/.cursor/commands/bkit-debug.md
index 85b7649d0..4485cffa5 100644
--- a/.cursor/commands/bkit-debug.md
+++ b/.cursor/commands/bkit-debug.md
@@ -112,15 +112,15 @@ Debug Feature — Autonomous diagnosis and remediation
    "{BKIT}" counters progress --file="{STATUS}" --workflow=debug --check=debug-run-tests --fix={LOOP_FIX}
    ```
    **If** exit non-zero → **Failure Path**.
-   Hold `trend` as `LOOP_TREND` and `counts` as `LOOP_COUNTS`.
-   **If** `LOOP_LIMIT` is not held **and** `LOOP_TREND` != `stuck` **and** `LOOP_TREND` != `worse` → narrate `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking (failures {LOOP_COUNTS})` → return to the calling step.
+   Hold `trend` as `LOOP_TREND`, `counts` as `LOOP_COUNTS` and `trendLine` as `LOOP_TREND_LINE`.
+   **If** `LOOP_LIMIT` is not held **and** `LOOP_TREND` != `stuck` **and** `LOOP_TREND` != `worse` → narrate `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking ({LOOP_TREND_LINE})` → return to the calling step.
 3. Ask the owner in this session; plain text, not through a host question tool. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. One message:
    - `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}`, then `Failures per test round: {LOOP_COUNTS}`, then the newest diagnosis (`debug-failure-diagnose-*.md`) or soak log (`debug-failure-soak-*-log.md`) in one line each.
    - The question — first match wins:
-     - **If** `LOOP_LIMIT` = true → `**Q1 — Soak:** The soak attempts are used up. Stop here instead of trying one more set of attempts?`.
-     - **If** `LOOP_POINT` = `fix` → `**Q1 — Fix:** The last fix attempt left no fewer failures. Stop here instead of trying again?`.
-     - **If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up, and the last one left no fewer failures. Stop here instead of starting soak (a slower, step-by-step investigation)?`.
-     - **Else** → `**Q1 — Soak:** The last soak attempt left no fewer failures. Stop here instead of trying again?`.
+     - **If** `LOOP_LIMIT` = true → `**Q1 — Soak:** The soak attempts are used up. {LOOP_TREND_LINE} Stop here instead of trying one more set of attempts?`.
+     - **If** `LOOP_POINT` = `fix` → `**Q1 — Fix:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
+     - **If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up. {LOOP_TREND_LINE} Stop here instead of starting soak (a slower, step-by-step investigation)?`.
+     - **Else** → `**Q1 — Soak:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
    - `Options: A) Stop / B) Try again`, then `Recommended: A) Stop`.
    - The line `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.`
      Record the wait → end turn → wait for the answer:
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index b50d1b2c8..78dec7127 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -1029,7 +1029,7 @@ This step checks the whole feature against the plan after the last group, and ag
        ```
        **If** exit non-zero → **Failure Path**. Hold `trend` as `TEST_TREND`.
        - **If** `TEST_TREND` = `stuck` **or** `worse` → `PAUSE_STEP` = 12, `PAUSE_POINT` = `build.tests`, `PAUSE_QUESTION` = `TESTS_LOOP` → **Decision Pause**.
-       - **Else** → Step 13; a failed test round after a round that made progress is always fixed, never asked.
+       - **Else** → Step 13; a failed test round whose trend is not `stuck` or `worse` (`closing`, `unknown`) is always fixed, never asked.
      - **Else** → **Failure Path**.
    - **Else** → **Failure Path**.
 
diff --git a/.opencode/commands/bkit-debug.md b/.opencode/commands/bkit-debug.md
index 75775ec3e..a7e7a5224 100644
--- a/.opencode/commands/bkit-debug.md
+++ b/.opencode/commands/bkit-debug.md
@@ -116,15 +116,15 @@ $ARGUMENTS
    "{BKIT}" counters progress --file="{STATUS}" --workflow=debug --check=debug-run-tests --fix={LOOP_FIX}
    ```
    **If** exit non-zero → **Failure Path**.
-   Hold `trend` as `LOOP_TREND` and `counts` as `LOOP_COUNTS`.
-   **If** `LOOP_LIMIT` is not held **and** `LOOP_TREND` != `stuck` **and** `LOOP_TREND` != `worse` → narrate `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking (failures {LOOP_COUNTS})` → return to the calling step.
+   Hold `trend` as `LOOP_TREND`, `counts` as `LOOP_COUNTS` and `trendLine` as `LOOP_TREND_LINE`.
+   **If** `LOOP_LIMIT` is not held **and** `LOOP_TREND` != `stuck` **and** `LOOP_TREND` != `worse` → narrate `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}, taken without asking ({LOOP_TREND_LINE})` → return to the calling step.
 3. Ask the owner in this session; plain text, not through a host question tool. State what the owner must decide and what each option does, in plain English, before naming any file, test or identifier. One message:
    - `debug {LOOP_POINT}: attempt {LOOP_ATTEMPT} of {LOOP_MAX}`, then `Failures per test round: {LOOP_COUNTS}`, then the newest diagnosis (`debug-failure-diagnose-*.md`) or soak log (`debug-failure-soak-*-log.md`) in one line each.
    - The question — first match wins:
-     - **If** `LOOP_LIMIT` = true → `**Q1 — Soak:** The soak attempts are used up. Stop here instead of trying one more set of attempts?`.
-     - **If** `LOOP_POINT` = `fix` → `**Q1 — Fix:** The last fix attempt left no fewer failures. Stop here instead of trying again?`.
-     - **If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up, and the last one left no fewer failures. Stop here instead of starting soak (a slower, step-by-step investigation)?`.
-     - **Else** → `**Q1 — Soak:** The last soak attempt left no fewer failures. Stop here instead of trying again?`.
+     - **If** `LOOP_LIMIT` = true → `**Q1 — Soak:** The soak attempts are used up. {LOOP_TREND_LINE} Stop here instead of trying one more set of attempts?`.
+     - **If** `LOOP_POINT` = `fix` → `**Q1 — Fix:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
+     - **If** `LOOP_POINT` = `soak` **and** `{LOOP_ATTEMPT}` = 1 → `**Q1 — Soak:** The fix attempts are used up. {LOOP_TREND_LINE} Stop here instead of starting soak (a slower, step-by-step investigation)?`.
+     - **Else** → `**Q1 — Soak:** {LOOP_TREND_LINE} Stop here instead of trying again?`.
    - `Options: A) Stop / B) Try again`, then `Recommended: A) Stop`.
    - The line `Reply per question. "yes" takes every recommendation. "stop" writes a handover; the run can be resumed.`
      Record the wait → end turn → wait for the answer:
diff --git a/dist/commands/workflow/decisions.js b/dist/commands/workflow/decisions.js
index a6b820725..b71748c89 100644
--- a/dist/commands/workflow/decisions.js
+++ b/dist/commands/workflow/decisions.js
@@ -376,17 +376,12 @@ export const decisionsCommand = {
                     const attempt = str(ctx.flags.attempt) ?? String(p.rounds.length);
                     const max = str(ctx.flags.max) ?? "?";
                     const changed = p.codeChanged === null ? "unknown" : p.codeChanged ? "yes" : "no";
-                    const trendLine = {
-                        "first-round": "This was the first round, so there is no trend yet.",
-                        closing: "Fewer problems after each round, and the code changed.",
-                        stuck: "No fewer problems, or the code did not change.",
-                        worse: "More problems than the first round.",
-                        unknown: "The counts cannot show whether the rounds helped.",
-                    }[p.trend];
                     loopRecommended = p.recommend === "stop" ? "Decide" : "Try again";
-                    const trendReason = loopRecommended === "Try again"
-                        ? "the last round made progress"
-                        : "another round is unlikely to close the remaining items";
+                    const trendReason = p.trend === "unknown"
+                        ? `the limit is used up and the counts cannot show whether the rounds helped (${p.trendLine})`
+                        : loopRecommended === "Try again"
+                            ? "the last round made progress"
+                            : "another round is unlikely to close the remaining items";
                     let reason = trendReason;
                     let baseLine = [];
                     if (baseCheck !== undefined) {
@@ -419,8 +414,8 @@ export const decisionsCommand = {
                         : [`Group gate failures after each round: ${p.gateCounts}`]), `Code changed: ${changed}`, `Strategy: ${p.lastStrategy ?? "none"} → next ${p.nextStrategy}${p.finalSpent ? " (FINAL already used)" : ""}`, `Minutes per round: ${p.minutesPerRound ?? "unknown"}`, `Trend: ${p.trend}`, ...baseLine, "", ...itemLines(1, {
                         title: loop.title,
                         question: loopRecommended === "Try again"
-                            ? `another fix round? ${trendLine}`
-                            : `decide the items below instead of another round? ${trendLine}`,
+                            ? `another fix round? ${p.trendLine}`
+                            : `decide the items below instead of another round? ${p.trendLine}`,
                         options: items.length > 0 ? ["Try again", "Decide"] : ["Try again", "Stop"],
                         recommended: items.length > 0 || loopRecommended === "Try again" ? loopRecommended : "Stop",
                         reason,
diff --git a/docs/testing.md b/docs/testing.md
index 5e00ee478..4fd598967 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -332,6 +332,7 @@ Wrap each test-running `bkit:gate:*` script with the adopted machine lock (`.bki
 - **Counted:** failing plus erroring test cases across every file. Skipped cases do not count.
 - **No reports:** `failures` is `null` (count unknown), and a hint says to turn the reporters on. The verdict still comes from the gate's exit code.
 - **Unset variable:** the runner behaves as it always does, so a gate run by hand writes nothing extra.
+- **CI rounds:** a `source: ci` round has no reports. Its count is the selected run's failed CI jobs, the capstone left out.
 
 ## What each tier must do
 
@@ -634,7 +635,7 @@ When adding bkit-managed file types or scope keys, extend fixture — single sou
 <!-- prettier-ignore -->
 | File | Tier | Scope |
 | --- | --- | --- |
-| `commands/workflow/counters.test.ts` | Unit | Row counting at the three positions (`current` refuses 0); fold dedup (retries survive / replays collapse); active-run scoping; group isolation; `--all-runs`; run numbering incl. resume + interleave; fail-closed value / max; `--point` (limit and `ask` from `package.json`, `ask` false when headless); `--of` + `--rows` summed |
+| `commands/workflow/counters.test.ts` | Unit | Row counting at the three positions (`current` refuses 0); fold dedup (retries survive / replays collapse); active-run scoping; group isolation; `--all-runs`; run numbering incl. resume + interleave; fail-closed value / max; `loopProgress` same-scope trend, `unknown` trend with `recommend` null, `trendLine`; `--point` (limit and `ask` from `package.json`, `ask` false when headless); `--of` + `--rows` summed |
 | `commands/workflow/status.test.ts` | Unit | `debugMode`/`pushMode` meta (run-level over step); last verdict / failures; all-runs strategy + next rung; `--require` failures |
 | `commands/workflow/summary.test.ts` | Unit | `bkit workflows summary` verdict from status rows: unticked build task / last test FAIL / a build with no plan file (`No plan file`) → FAIL; a FAIL a later step answers, a CONCERNS row, a Decision Pause accept or a new deferral → CONCERNS; next step per workflow and verdict; issue ref per tracker; the `## Challenge` line naming a skipped challenge-1 from the latest `challenge-gate` row; `Publish: held` and `Docs: not synced` lines on a held build (`Publish: pr` otherwise), with the verdict and next step unchanged by `publish` |
 | `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts` | Unit (markdown-invariant) | No prose `Init` / `Increment`, no bare `*_ATTEMPT` comparison outside fenced blocks; counters derived in the block that routes on them, or by the routing / writing command itself (`steps finish --attempt=next` / `--attempt-of`, `counters route --of`); each derived counter maps to the right step; counted steps commit in-block or are exempted |
