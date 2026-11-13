diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index f460f3772..21ef134bb 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -235,7 +235,7 @@ The table lists the header bullets of the 6 workflow files, block by block, in f
 | **CI wait turn-loop** | Protocol | build, debug | CI-wait block exits 81 (or 80) → resolve the poll in the agent turn loop, then re-run the block with the result. |
 | **Friction** | Contract | all 6 | Manual installs, rework, repeated tool failures, destructive backouts → append `.bkit/friction.jsonl` rows → continue or escalate; never replaces **Failure Path**. Owner pauses are not the agent's to log: `status row --type=owner-pause` writes their `human-confirm` row. |
 | **Finish** | Contract | design, plan, build, debug, ship | `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt, checks what the gate checks, writes the row, commits, prints `comment`. Across agents: the worst verdict, `Failures` summed, a `true \| false` field true when any agent sets it true, any other field from the first agent that sets it. Exit 5 or 6 → re-ask `reask.agent` for its header only, re-run the block; still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run the block; the attempt is unchanged. Exit 82 → the commit failed and the row stays in `status.jsonl` (another writer appended after it) → **Failure Path**. |
-| **Resume** | Contract | design, plan, build, debug, ship | After Step 2, `bkit status resume` folds status.jsonl and names the step after the last `DONE` step of the active `IN_PROGRESS` run; for build, `workflows start` also prints the run's `OPEN` decision as `openDecision`. |
+| **Resume** | Contract | design, plan, build, debug, ship | After Step 2, `bkit status resume` folds status.jsonl and names the step after the last `DONE` step of the active `IN_PROGRESS` run; for build, `workflows start` also prints the run's `OPEN` decision, or a `DECIDED` / `ASSUMED` one no `build-decision` row names, as `openDecision`. |
 | **Plan** | Contract | build | The plan path, in task-block form, with the `bkit.workflows.tasks` group caps held at Step 1; one group per pass of the execute-verify loop; tasks tick `[x]` only in verify. |
 | **Status** | Contract | design, plan, build, debug, ship | `status.jsonl` = append-only NDJSON event log, folded to the run array; `step-done` carries `parentSha` captured at step start plus optional `verdict`, `failures`, `attempt`, `strategy`; build adds `group`, debug a `workflow-meta` `debugAttempt`. |
 | **Locks** | Contract | design, plan, build, debug, ship | Step 1 takes the per-feature `.lock` (`bkit locks acquire`); released at close and in Failure Path. Existing lock: holder `IN_PROGRESS` with a step <30min ago → **Failure Path**; any other holder's lock reclaimed. |
@@ -986,6 +986,7 @@ One mechanism for every build question: verify gaps logged `Fixable: false`, a n
 
 - **Base check:** at a pause after a red group gate (Step 8) or a red final run (Step 12), `bkit tests base --log= --out=` re-runs the failing tests on the base commit (a passing push-event CI run at that exact sha settles `none`; the last CI run on `dev` never settles anything) and prints a verdict `all|some|none|unknown` (`unknown` names its reason; `some` with unchecked cases names them too). `decisions compose --base-check=` words the loop question from it: `all` recommends `Stop` and tells the owner to fix `dev` first (adopt mode: also merge `dev` into the branch before resuming), `Try again` stays offered in every case. The header carries `Gate: FAIL`, and the round counts include the gate's failing tests, so a red gate never shows `0 → 0`. Gate and suite failures are never items.
 - **Resume into a red-gate pause:** `openDecision.gate` = `FAIL` and the loop question is the pause's only undecided question → the resume skips the question and re-runs the gate first (`decisions apply --by=rerun`, no `counters grant`); any other open `Gate: FAIL` pause (a file with no loop question, or undecided item questions) resumes at **Decision Pause** step 3. Green → the build continues without asking; still red → the pause is asked again with fresh numbers.
+- **Resume after the answers:** a run stopped after step 6 wrote the answers (`Status: DECIDED` or `ASSUMED`) but before `steps finish --step=build-decision` has a decision file no `build-decision` row names; `openDecision` returns it, so the resume goes back to step 3 and step 5 reuses the task each `Fix task:` line names. A decided file a `build-decision` row names is not reopened, and `decisions compose` is unchanged.
 - **Record:** `bkit decisions compose` writes `build-decision-{RUN}-{K}.md` from the orchestrator's items JSON: `Status: OPEN`, the header (`Question` (`VERIFY_GAPS|CHALLENGE|TESTS_LOOP|UNPROVEN`), `From` (`verify` / `challenge` / `tests` / `summary`), `Pause step`, `Group` (verify), `Verify attempt` or `Test attempt`, `Plan`), the `{workflow} {point}: attempt {n} of {max}` line and `## Progress` block for loop questions (`--loop`), then one item per question in the question layout (§ Ask points); an item answered `Fix now` also gets a `Fix task: {N}` line naming the task that carries its fix, which the summary checks. Status ends `DECIDED`, or `ASSUMED` while an assumed accept is in it.
 - **Who asks:**
   - **If** `ask` is true and the run is not headless → the orchestrator asks, in session. Never a subagent, because subagents cannot reach the human.
@@ -994,7 +995,7 @@ One mechanism for every build question: verify gaps logged `Fixable: false`, a n
 - **Hard blockers:** the unfixable gaps (`no-test-first`, `test-first-malformed`, `test-first-unread`, `exception-refused`, and holistic gaps logged `Fixable: false`) and `**Fixable:** false` challenge findings. No recommendation; "yes" never answers one. `Fix now` on one needs the owner's direction: with none, the pause asks what the fix should do and builds no task.
 - **Accept** by the owner: written ONLY after explicit human approval of that item. Agents NEVER write one on their own judgement. An `exception-refused` gap or an `UNPROVEN` item → a `**TEST EXCEPTION:**` field in the task's block, committed alone (`git commit -- {plan}`) so `tests green` honours them; each entry ends `— {reason} (owner, {YYYY-MM-DD})`, and the field replaces the task's existing one, never a second, so the plan-alone commit always changes its lines and blame points at it; other → `docs/decisions.jsonl` row (`by.step` `build-decision`, `rationale` `accepted by owner: …`). Verify and `bkit challenge merge` read `build-decision-*.md` and drop accepted items. An accepted challenge task is also ticked `[x]` and its title ends ` — accepted by owner`, so the summary does not count it as unfinished. Group-gate failures are never items.
 - **Accept (assumed):** taken without the owner — `Decision: Accept (assumed) — {reason} ({ask:false|headless}, {RUNTIME}, {date})`. Settled for this build (verify, `acceptedLocations()`, gaps-remediate treat it as accepted), but it is not an acceptance: no `docs/decisions.jsonl` row, no `TEST EXCEPTION`. The build summary lists each one and keeps the verdict at CONCERNS; `/bkit-ship` asks the owner to confirm it (§ `/bkit-ship`, Confirm Assumed Items).
-- **Fix now:** a new task block with `DONE WHEN` + `TEST FIRST` and one `Derived Test Matrix` row per test in it, numbered above the plan's highest task. From verify: inside the paused group when it stays within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests, else a new group straight after it, every later group renumbered. From holistic, tests or challenge: a new last group. The pause writes no test or fix code: Step 7 writes each test with `@bkit-build-plan-tests`, records its red with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. Then `tests plan-check` (non-zero → Failure Path) → Step 7, whose brief picks the group holding the open task → Step 8 → onward. Fix now on a challenge task rewrites that task in place to the owner's direction (its `DONE WHEN`, `TEST FIRST` and `Derived Test Matrix` rows, keeping its number, title, group and meta line), and a challenge-originated fix reaches the challenge reviewers again through Steps 10-11. Each `Fix now` item then gets a `Fix task: {N}` line in the decision file; an item that already has one reuses its task. Taken without asking → `Decision: Fix now — recommended; applied without asking ({RUNTIME})`.
+- **Fix now:** a new task block with `DONE WHEN` + `TEST FIRST` and one `Derived Test Matrix` row per test in it, numbered above the plan's highest task. From verify: inside the paused group when it stays within `bkit.workflows.tasks.maxPerGroup` tasks and `bkit.workflows.tasks.maxTestsPerGroup` tests, else a new group straight after it, every later group renumbered. From holistic, tests or challenge: a new last group. The pause writes no test or fix code: Step 7 writes each test with `@bkit-build-plan-tests`, records its red with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. Then `tests plan-check` (non-zero → Failure Path) → Step 7, whose brief picks the group holding the open task → Step 8 → onward. Fix now on a challenge task rewrites that task in place to the owner's direction (its `DONE WHEN`, `TEST FIRST` and `Derived Test Matrix` rows, keeping its number, title, group and meta line), and a challenge-originated fix reaches the challenge reviewers again through Steps 10-11. Each `Fix now` item then gets a `Fix task: {N}` line in the decision file; an item that already has one reuses its task. Step 5 writes that line right after the task block, before `tests plan-check`, so a run stopped between the two finds it on resume. Taken without asking → `Decision: Fix now — recommended; applied without asking ({RUNTIME})`.
 - **Try again** (loop questions only): one more fix round on the same problems; the items wait undecided. `From: verify` → Step 9, `From: holistic` → Step 10's fix round, `From: tests` → Step 13. The round counts against the same limit. A verify or holistic pause at its used-up limit asks the loop question too (`--loop=verify`, `--loop=holistic`), in a session only.
 - **Allowance:** every route but Stop from a verify, holistic or tests pause runs `counters grant` for that loop (holistic with `--since-clean`, so it counts only grants since the last clean holistic round); it writes a row only when the limit is used up and `ask` is true.
 - **Then:** `steps finish --step=build-decision --field=route={fix|retry|verify|holistic|tests|summary} --comment-body` (decision posted to the tracker) → Step 7 (`fix`), Step 9 (`retry` after a verify or group-gate loop), Step 10's fix round (`retry` after a holistic loop) or Step 13 (`retry` after a tests loop), re-run Step 8 (`verify`), re-run Step 10 (`holistic`), Step 12 (`tests`), or Step 15 (`summary`). The row's `route` is what `bkit status resume` reads to resume after a decision: `retry` resumes at Step 9 (`build-plan-gaps-remediate`) when the paused step was `build-plan-verify` or `build-group-gate`, at Step 10's fix round (`build-plan-gaps-remediate-holistic`) when it was `build-plan-verify-holistic` or `build-plan-gaps-remediate-holistic`, at Step 13 (`build-failure-diagnose`) when it was `build-run-tests`. A challenge decision with a fix to run → `fix`; one already in the last round also sets `CHALLENGE_DONE`, so Step 11 goes on to Step 12.
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index aa6997720..23ecb9287 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -952,6 +952,22 @@ describe("build", () => {
     );
   });
 
+  it("Decision Pause step 5 records each Fix now item's Fix task line before tests plan-check", () => {
+    const pause = section(build, /Decision Pause/);
+    const step5 = pause.slice(
+      pause.indexOf("5. Apply each decision"),
+      pause.indexOf("6. Write the decisions"),
+    );
+    expect(step5).toContain("Fix task: {N}");
+    expect(step5).toContain("tests plan-check");
+    expect(step5.indexOf("Fix task: {N}")).toBeLessThan(step5.indexOf("tests plan-check"));
+    const step6 = pause.slice(
+      pause.indexOf("6. Write the decisions"),
+      pause.indexOf("--step=build-decision", pause.indexOf("6. Write the decisions")),
+    );
+    expect(step6).toMatch(/still missing/);
+  });
+
   it("the owner decisions contract names the task block as the Fix now carrier", () => {
     const bullet = build.split("\n").find((l) => l.startsWith("- **Owner decisions:**"));
     expect(bullet).toBeDefined();
diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index dfde5ad17..8ddc4e124 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -585,6 +585,57 @@ describe("bkit workflows start — resume facts", () => {
     expect(r.json.openDecision).toMatchObject({ decision: 1, gate: "FAIL" });
   });
 
+  it("workflows start reports openDecision for a DECIDED decision file that no build-decision row names", async () => {
+    const cwd = repo();
+    write(
+      cwd,
+      `${REL}/status.jsonl`,
+      jsonl([started("2026-07-01T00:00:00Z"), done("build-challenge", "2026-07-01T00:05:00Z")]),
+    );
+    writeDecision(cwd, 1, 1, [
+      "Status: DECIDED",
+      "Question: CHALLENGE",
+      "From: challenge",
+      "Pause step: 11",
+      `Plan: docs/plans/${M}/${FID}-plan.md`,
+    ]);
+    const r = await run(cwd, wf("start", "build"));
+    expect(r.code).toBe(0);
+    expect(r.json.openDecision).toMatchObject({
+      file: `${REL}/build-decision-1-1.md`,
+      decision: 1,
+      question: "CHALLENGE",
+      from: "challenge",
+      pauseStep: 11,
+    });
+  });
+
+  it("workflows start does not report openDecision for a DECIDED decision file that a build-decision row names", async () => {
+    const cwd = repo();
+    write(
+      cwd,
+      `${REL}/status.jsonl`,
+      jsonl([
+        started("2026-07-01T00:00:00Z"),
+        done("build-challenge", "2026-07-01T00:05:00Z"),
+        done("build-decision", "2026-07-01T00:06:00Z", {
+          route: "verify",
+          artifacts: [`${REL}/build-decision-1-1.md`],
+        }),
+      ]),
+    );
+    writeDecision(cwd, 1, 1, [
+      "Status: DECIDED",
+      "Question: CHALLENGE",
+      "From: challenge",
+      "Pause step: 11",
+      `Plan: docs/plans/${M}/${FID}-plan.md`,
+    ]);
+    const r = await run(cwd, wf("start", "build"));
+    expect(r.code).toBe(0);
+    expect(r.json.openDecision).toBeNull();
+  });
+
   it("openDecision gate is null without the header", async () => {
     const cwd = repo();
     write(cwd, `${REL}/status.jsonl`, jsonl([started("2026-07-01T00:00:00Z")]));
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index d17858d63..0ea592174 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -258,14 +258,17 @@ export interface OpenDecision {
 
 /**
  * The highest-numbered `{workflow}-decision-{run}-{N}.md` in `logDir` whose header holds
- * `Status: OPEN`, or null. Only the given run's files count, so an earlier run's pause
- * never resurfaces. `file` is relative to `tree`.
+ * `Status: OPEN`, or a `DECIDED` / `ASSUMED` file that none of the run's `{workflow}-decision`
+ * rows names (a pause stopped after its answers were written, before the step finished), or
+ * null. Only the given run's files count, so an earlier run's pause never resurfaces.
+ * `file` is relative to `tree`; `finished` lists the paths the run's decision rows name.
  */
 export function openDecision(
   logDir: string,
   tree: string,
   workflow: string,
   run: number,
+  finished: readonly string[] = [],
 ): OpenDecision | null {
   if (!fs.existsSync(logDir)) return null;
   const name = new RegExp(`^${workflow}-decision-${run}-([0-9]+)\\.md$`);
@@ -279,7 +282,10 @@ export function openDecision(
     const text = fs.readFileSync(path.join(logDir, f), "utf-8");
     const field = (key: string) =>
       new RegExp(`^${key}:[ \\t]*(.+?)[ \\t]*$`, "m").exec(text)?.[1] ?? null;
-    if (field("Status") !== "OPEN") continue;
+    const status = field("Status");
+    const rel = path.relative(tree, path.join(logDir, f));
+    const unfinished = (status === "DECIDED" || status === "ASSUMED") && !finished.includes(rel);
+    if (status !== "OPEN" && !unfinished) continue;
     // `Gate:` counts only in the header block (the lines before the first blank line).
     const header = text.split(/\r?\n[ \t]*\r?\n/, 1)[0] ?? "";
     const gate = /^Gate:[ \t]*(.+?)[ \t]*$/m.exec(header)?.[1] ?? null;
@@ -288,7 +294,7 @@ export function openDecision(
       return v !== null && /^[0-9]+$/.test(v) ? Number(v) : null;
     };
     return {
-      file: path.relative(tree, path.join(logDir, f)),
+      file: rel,
       decision: n,
       question: field("Question"),
       from: field("From"),
@@ -2092,7 +2098,7 @@ export const workflowsCommand: CommandSpec = {
         run: "which run of the workflow this is (1-based)",
         lastDoneStep: "the current run's last DONE step: resume after it (null on a new run)",
         openDecision:
-          "{file, decision, question, from, pauseStep, group, verifyAttempt, testAttempt, plan, gate} of the current run's highest {workflow}-decision-{run}-{N}.md holding Status: OPEN, else null",
+          "{file, decision, question, from, pauseStep, group, verifyAttempt, testAttempt, plan, gate} of the current run's highest {workflow}-decision-{run}-{N}.md holding Status: OPEN, or DECIDED / ASSUMED when no {workflow}-decision row names it, else null",
       },
       textOmit: ["row"],
       exitCodes: {
@@ -2184,7 +2190,15 @@ export const workflowsCommand: CommandSpec = {
           run,
           lastDoneStep: current?.steps.filter((s) => s.status === "DONE").at(-1)?.step ?? null,
           openDecision: resumed
-            ? openDecision(path.dirname(file), where.tree, workflow, run)
+            ? openDecision(
+                path.dirname(file),
+                where.tree,
+                workflow,
+                run,
+                (current?.steps ?? [])
+                  .filter((s) => s.step === `${workflow}-decision`)
+                  .flatMap((s) => s.artifacts),
+              )
             : null,
         });
         return EXIT.OK;
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index 6bcb20c6d..22787f920 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -46,7 +46,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null (a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after step 6 wrote the answers) → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
 - **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -197,6 +197,7 @@ _No tracker connected, skip step._
    - **Fix now**:
      - Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
      - **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
+     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`, where `{N}` is the number of the task that carries its fix: the rewritten challenge task, the new task block, or the task an existing `Fix task:` line names.
      - **If** the item is a challenge task → rewrite that task in place to the owner's direction:
        - Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
        - Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
@@ -218,7 +219,7 @@ _No tracker connected, skip step._
        **If** exit non-zero → **Failure Path** naming each problem in the report.
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}`.
-   - Under each `Fix now` item, add `Fix task: {N}`, where `{N}` is the number of the task that carries its fix: the rewritten challenge task, the new task block, or the task an existing `Fix task:` line names.
+   - Under each `Fix now` item, add the `Fix task: {N}` line only if step 5 has not written it yet.
    - Under the loop question, add `Decision: {Try again|Decide} — {owner's words}`.
    - Set `Status: ASSUMED` while any `Decision: Accept (assumed)` line remains, and `Status: DECIDED` otherwise.
 
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index a4f02790f..661c931ef 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -46,7 +46,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null (a decision file with `Status: OPEN`, or a `DECIDED` / `ASSUMED` one that no `build-decision` row names, because the run stopped after step 6 wrote the answers) → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
 - **Owner decisions:** A subagent learns the owner's `Accept`, `Try again` and `Stop` answers by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`, and a `Fix now` direction from the task block that carries it. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
@@ -224,6 +224,7 @@ description: "Build Feature — Autonomous implementation"
    - **Fix now**:
      - Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
      - **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
+     - Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`, where `{N}` is the number of the task that carries its fix: the rewritten challenge task, the new task block, or the task an existing `Fix task:` line names.
      - **If** the item is a challenge task → rewrite that task in place to the owner's direction:
        - Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
        - Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
@@ -245,7 +246,7 @@ description: "Build Feature — Autonomous implementation"
        **If** exit non-zero → **Failure Path** naming each problem in the report.
 6. Write the decisions into the decision file:
    - Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}`.
-   - Under each `Fix now` item, add `Fix task: {N}`, where `{N}` is the number of the task that carries its fix: the rewritten challenge task, the new task block, or the task an existing `Fix task:` line names.
+   - Under each `Fix now` item, add the `Fix task: {N}` line only if it is still missing after step 5.
    - Under the loop question, add `Decision: {Try again|Decide} — {owner's words}`.
    - Set `Status: ASSUMED` while any `Decision: Accept (assumed)` line remains, and `Status: DECIDED` otherwise.
 
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index d16235eb9..6e6d91835 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -1140,7 +1140,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-adoption`, `bkit-audit-dependencies`, `bkit-audit-usability`
 - drift:
-  - `bkit-build:443`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-build:444`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
   - `bkit-design:208`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
@@ -1237,7 +1237,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-adoption`, `bkit-audit-dependencies`, `bkit-audit-repo`, `bkit-audit-usability`
 - drift:
-  - `bkit-build:443`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
+  - `bkit-build:444`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
   - `bkit-design:208`: "--only-if-dirty-tracked --scope=core --mode=commit" Commits every dirty tracked file in scope core, not only files this run touched; `commits` says ONLY commit files you touched, named explicitly
     - kept: commits only the bookkeeping allow-list (this run's log dir and ledgers) on the originating branch, never pushed, so the new worktree branch carries the run's log and ledger rows
@@ -9671,7 +9671,7 @@ The table lists the header bullets of the 6 workflow files, block by block, in f
 | **CI wait turn-loop** | Protocol | build, debug | CI-wait block exits 81 (or 80) → resolve the poll in the agent turn loop, then re-run the block with the result. |
 | **Friction** | Contract | all 6 | Manual installs, rework, repeated tool failures, destructive backouts → append `.bkit/friction.jsonl` rows → continue or escalate; never replaces **Failure Path**. Owner pauses are not the agent's to log: `status row --type=owner-pause` writes their `human-confirm` row. |
 | **Finish** | Contract | design, plan, build, debug, ship | `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt, checks what the gate checks, writes the row, commits, prints `comment`. Across agents: the worst verdict, `Failures` summed, a `true \| false` field true when any agent sets it true, any other field from the first agent that sets it. Exit 5 or 6 → re-ask `reask.agent` for its header only, re-run the block; still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run the block; the attempt is unchanged. Exit 82 → the commit failed and the row stays in `status.jsonl` (another writer appended after it) → **Failure Path**. |
-| **Resume** | Contract | design, plan, build, debug, ship | After Step 2, `bkit status resume` folds status.jsonl and names the step after the last `DONE` step of the active `IN_PROGRESS` run; for build, `workflows start` also prints the run's `OPEN` decision as `openDecision`. |
+| **Resume** | Contract | design, plan, build, debug, ship | After Step 2, `bkit status resume` folds status.jsonl and names the step after the last `DONE` step of the active `IN_PROGRESS` run; for build, `workflows start` also prints the run's `OPEN` decision, or a `DECIDED` / `ASSUMED` one no `build-decision` row names, as `openDecision`. |
 | **Plan** | Contract | build | The plan path, in task-block form, with the `bkit.workflows.tasks` group caps held at Step 1; one group per pass of the execute-verify loop; tasks tick `[x]` only in verify. |
 | **Status** | Contract | design, plan, build, debug, ship | `status.jsonl` = append-only NDJSON event log, folded to the run array; `step-done` carries `parentSha` captured at step start plus optional `verdict`, `failures`, `attempt`, `strategy`; build adds `group`, debug a `workflow-meta` `debugAttempt`. |
 | **Locks** | Contract | design, plan, build, debug, ship | Step 1 takes the per-feature `.lock` (`bkit locks acquire`); released at close and in Failure Path. Existing lock: holder `IN_PROGRESS` with a step <30min ago → **Failure Path**; any other holder's lock reclaimed. |
@@ -10043,6 +10043,7 @@ Append one `docs/decisions.jsonl` row with `bkit ledgers append` (`.bkit/jsonl.m
 **Fix now**:
 Write no test and no fix code at this pause. Step 7 writes the new task's `TEST FIRST` tests with `@bkit-build-plan-tests`, records them failing with `tests red`, and only then writes the fix with `@bkit-build-plan-tasks`. NEVER undo code to force a red.
 **If** the item already has a `Fix task:` line in the decision file → reuse the task it names and write no second block. A resumed pause can reach this step twice.
+Write the item's `Fix task: {N}` line under it in the decision file right after the task block is written or rewritten, before `tests plan-check`, where `{N}` is the number of the task that carries its fix: the rewritten challenge task, the new task block, or the task an existing `Fix task:` line names.
 **If** the item is a challenge task → rewrite that task in place to the owner's direction:
 Rewrite its `**DONE WHEN:**` and its `**TEST FIRST:**`, with one sub-bullet per test: `` `{test file}` `{test name}` fails on {what goes wrong} ``.
 Rewrite its rows in the `Derived Test Matrix` to match the new `TEST FIRST`.
@@ -10060,7 +10061,7 @@ Then check the plan:
 **If** exit non-zero → **Failure Path** naming each problem in the report.
 Write the decisions into the decision file:
 Under each item the owner answered, add `Decision: {Accept|Fix now} — {owner's words}`.
-Under each `Fix now` item, add `Fix task: {N}`, where `{N}` is the number of the task that carries its fix: the rewritten challenge task, the new task block, or the task an existing `Fix task:` line names.
+Under each `Fix now` item, add the `Fix task: {N}` line only if it is still missing after step 5.
 Under the loop question, add `Decision: {Try again|Decide} — {owner's words}`.
 Set `Status: ASSUMED` while any `Decision: Accept (assumed)` line remains, and `Status: DECIDED` otherwise.
 [commits] **If** a `TEST EXCEPTION` was written → commit the plan alone first:
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index 9ef7ea735..14971573f 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -108,10 +108,12 @@ export function recordChat(file, workflow, env) {
 }
 /**
  * The highest-numbered `{workflow}-decision-{run}-{N}.md` in `logDir` whose header holds
- * `Status: OPEN`, or null. Only the given run's files count, so an earlier run's pause
- * never resurfaces. `file` is relative to `tree`.
+ * `Status: OPEN`, or a `DECIDED` / `ASSUMED` file that none of the run's `{workflow}-decision`
+ * rows names (a pause stopped after its answers were written, before the step finished), or
+ * null. Only the given run's files count, so an earlier run's pause never resurfaces.
+ * `file` is relative to `tree`; `finished` lists the paths the run's decision rows name.
  */
-export function openDecision(logDir, tree, workflow, run) {
+export function openDecision(logDir, tree, workflow, run, finished = []) {
     if (!fs.existsSync(logDir))
         return null;
     const name = new RegExp(`^${workflow}-decision-${run}-([0-9]+)\\.md$`);
@@ -124,7 +126,10 @@ export function openDecision(logDir, tree, workflow, run) {
     for (const { f, n } of found) {
         const text = fs.readFileSync(path.join(logDir, f), "utf-8");
         const field = (key) => new RegExp(`^${key}:[ \\t]*(.+?)[ \\t]*$`, "m").exec(text)?.[1] ?? null;
-        if (field("Status") !== "OPEN")
+        const status = field("Status");
+        const rel = path.relative(tree, path.join(logDir, f));
+        const unfinished = (status === "DECIDED" || status === "ASSUMED") && !finished.includes(rel);
+        if (status !== "OPEN" && !unfinished)
             continue;
         // `Gate:` counts only in the header block (the lines before the first blank line).
         const header = text.split(/\r?\n[ \t]*\r?\n/, 1)[0] ?? "";
@@ -134,7 +139,7 @@ export function openDecision(logDir, tree, workflow, run) {
             return v !== null && /^[0-9]+$/.test(v) ? Number(v) : null;
         };
         return {
-            file: path.relative(tree, path.join(logDir, f)),
+            file: rel,
             decision: n,
             question: field("Question"),
             from: field("From"),
@@ -1699,7 +1704,7 @@ export const workflowsCommand = {
                 row: "the appended workflow-started row, with `limits` (the workflow's ask points from bkit.workflows, frozen for the run), or null when resuming",
                 run: "which run of the workflow this is (1-based)",
                 lastDoneStep: "the current run's last DONE step: resume after it (null on a new run)",
-                openDecision: "{file, decision, question, from, pauseStep, group, verifyAttempt, testAttempt, plan, gate} of the current run's highest {workflow}-decision-{run}-{N}.md holding Status: OPEN, else null",
+                openDecision: "{file, decision, question, from, pauseStep, group, verifyAttempt, testAttempt, plan, gate} of the current run's highest {workflow}-decision-{run}-{N}.md holding Status: OPEN, or DECIDED / ASSUMED when no {workflow}-decision row names it, else null",
             },
             textOmit: ["row"],
             exitCodes: {
@@ -1790,7 +1795,9 @@ export const workflowsCommand = {
                     run,
                     lastDoneStep: current?.steps.filter((s) => s.status === "DONE").at(-1)?.step ?? null,
                     openDecision: resumed
-                        ? openDecision(path.dirname(file), where.tree, workflow, run)
+                        ? openDecision(path.dirname(file), where.tree, workflow, run, (current?.steps ?? [])
+                            .filter((s) => s.step === `${workflow}-decision`)
+                            .flatMap((s) => s.artifacts))
                         : null,
                 });
                 return EXIT.OK;
