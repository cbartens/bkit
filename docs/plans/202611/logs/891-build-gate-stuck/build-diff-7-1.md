diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index 41f72da07..dcebe500c 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -42,7 +42,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
 - **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index cf9ad9d26..f0f0cec0b 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -42,7 +42,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
 - **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 0e2491a72..df49e2b5d 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -279,6 +279,16 @@ describe("resume facts", () => {
     );
     expect(resume).toContain("counters grant");
   });
+
+  it("build re-runs a red gate pause only when the loop question is its only undecided question", () => {
+    const text = workflow("build");
+    const resume = text.split("\n").filter((l) => l.startsWith("- **Resume:**"))[0];
+    expect(resume).toBeDefined();
+    const route = resume.slice(resume.indexOf("**If** `OPEN_GATE` = `FAIL`"));
+    expect(route).toContain("loop question");
+    expect(route).toMatch(/only undecided question/);
+    expect(route).toContain("Decision Pause** step 3");
+  });
 });
 
 describe("pre-worktree commit", () => {
diff --git a/.bkit/core/engine/commands/workflow/decisions.test.ts b/.bkit/core/engine/commands/workflow/decisions.test.ts
index 1fd29008b..58fbe3233 100644
--- a/.bkit/core/engine/commands/workflow/decisions.test.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.test.ts
@@ -406,6 +406,25 @@ describe("bkit decisions compose", () => {
     expect(text).toMatch(/Recommended: B\) Decide — a round can fix 2 of 5/);
   });
 
+  it("base check some with undetermined cases counts only the branch's as fixable", async () => {
+    const { r, text } = await composeWithBase(
+      {
+        verdict: "some",
+        failing: 3,
+        baseRed: 1,
+        branch: 1,
+        undetermined: 1,
+        reason: "the base run crashed",
+      },
+      ITEMS,
+    );
+    expect(r.code).toBe(0);
+    expect(text).toContain("a round can fix 1 of 3");
+    expect(text).not.toContain("a round can fix 2 of 3");
+    expect(text).toContain("the build will still stop on the 1 from `dev`");
+    expect(text).toMatch(/1 could not be checked: the base run crashed/);
+  });
+
   it("base check none keeps the trend and names the branch", async () => {
     const { r, text } = await composeWithBase(
       { verdict: "none", failing: 3, baseRed: 0, branch: 3 },
@@ -495,7 +514,35 @@ describe("bkit decisions apply --by=rerun", () => {
 
   it("records the re-run under Q1 and closes the file", async () => {
     const { root, logs } = checkout();
-    const { out } = await compose(root, logs, [ITEMS[1]], "--header=Gate=FAIL");
+    const status = path.join(logs, "status.jsonl");
+    const verify = (at: string) => ({
+      type: "step-done",
+      workflow: "build",
+      step: "build-plan-verify",
+      status: "DONE",
+      at,
+      group: 1,
+      failures: 4,
+    });
+    fs.writeFileSync(
+      status,
+      [
+        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
+        verify("2026-10-01T00:10:00Z"),
+        verify("2026-10-01T00:20:00Z"),
+      ]
+        .map((x) => JSON.stringify(x))
+        .join("\n") + "\n",
+    );
+    const { out } = await compose(
+      root,
+      logs,
+      [],
+      "--header=Gate=FAIL",
+      "--loop=verify",
+      `--file=${status}`,
+      "--group=1",
+    );
     expect(fs.readFileSync(out, "utf-8")).toContain("Gate: FAIL");
     const r = await rerun(root, out);
     expect(r.code).toBe(0);
@@ -529,6 +576,58 @@ describe("bkit decisions apply --by=rerun", () => {
     expect(fs.readFileSync(gated.out, "utf-8")).toBe(closed);
   });
 
+  it("refuses a Gate: FAIL file whose Q1 is an item, not the loop question", async () => {
+    const { root, logs } = checkout();
+    const { out } = await compose(root, logs, [BLOCKER], "--header=Gate=FAIL");
+    const before = fs.readFileSync(out, "utf-8");
+    const r = await rerun(root, out);
+    expect(r.code).toBe(2);
+    expect(r.err).toContain("Q1");
+    expect(fs.readFileSync(out, "utf-8")).toBe(before);
+    expect(fs.readFileSync(out, "utf-8")).toMatch(/^Status: OPEN$/m);
+    expect(fs.readFileSync(out, "utf-8")).not.toContain("Decision: Re-run gate");
+  });
+
+  it("refuses a loop file with an undecided item question", async () => {
+    const { root, logs } = checkout();
+    const status = path.join(logs, "status.jsonl");
+    const verify = (at: string) => ({
+      type: "step-done",
+      workflow: "build",
+      step: "build-plan-verify",
+      status: "DONE",
+      at,
+      group: 1,
+      failures: 4,
+    });
+    fs.writeFileSync(
+      status,
+      [
+        { type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" },
+        verify("2026-10-01T00:10:00Z"),
+        verify("2026-10-01T00:20:00Z"),
+      ]
+        .map((x) => JSON.stringify(x))
+        .join("\n") + "\n",
+    );
+    const { out } = await compose(
+      root,
+      logs,
+      [BLOCKER],
+      "--header=Gate=FAIL",
+      "--loop=verify",
+      `--file=${status}`,
+      "--group=1",
+    );
+    const before = fs.readFileSync(out, "utf-8");
+    expect(before).toContain("**Q2");
+    const r = await rerun(root, out);
+    expect(r.code).toBe(2);
+    expect(r.err).toContain("Q2");
+    expect(fs.readFileSync(out, "utf-8")).toBe(before);
+    expect(fs.readFileSync(out, "utf-8")).toMatch(/^Status: OPEN$/m);
+  });
+
   it("refuses a file whose only Gate: FAIL line is in an item body", async () => {
     const { root, logs } = checkout();
     const smuggled = { ...ITEMS[1], question: "Fix it?\nGate: FAIL" };
diff --git a/.bkit/core/engine/commands/workflow/decisions.ts b/.bkit/core/engine/commands/workflow/decisions.ts
index 7095682ca..0bfb07edf 100644
--- a/.bkit/core/engine/commands/workflow/decisions.ts
+++ b/.bkit/core/engine/commands/workflow/decisions.ts
@@ -204,6 +204,8 @@ interface BaseCheck {
   source: string | null;
   failing: number;
   baseRed: number;
+  branch: number;
+  undetermined: number;
   adopt: boolean;
 }
 
@@ -220,6 +222,12 @@ function readBaseCheck(file: string): BaseCheck {
   if (verdict !== "all" && verdict !== "some" && verdict !== "none" && verdict !== "unknown")
     throw bad("verdict", "must be all, some, none or unknown");
   const { failing, baseRed, adopt } = o;
+  const count = (k: string, fallback: number): number => {
+    const v = o[k];
+    if (v === undefined) return fallback;
+    if (typeof v !== "number" || !Number.isFinite(v)) throw bad(k, "must be a number");
+    return v;
+  };
   if (typeof failing !== "number" || !Number.isFinite(failing))
     throw bad("failing", "must be a number");
   if (typeof baseRed !== "number" || !Number.isFinite(baseRed))
@@ -238,6 +246,8 @@ function readBaseCheck(file: string): BaseCheck {
     source: text("source"),
     failing,
     baseRed,
+    branch: count("branch", failing - baseRed),
+    undetermined: count("undetermined", 0),
     adopt,
   };
 }
@@ -473,7 +483,11 @@ export const decisionsCommand: CommandSpec = {
               loopRecommended = items.length > 0 ? "Decide" : "Stop";
               reason = `all ${b.failing} failing tests fail on \`dev\` too, so no round here can fix them. Fix \`dev\`, then resume. If the gate is still red after \`dev\` is fixed and the run resumed, the rest comes from this branch, and the gate re-run on resume shows it.${b.adopt ? " This run has no worktrees: merge \`dev\` into the branch before resuming." : ""}`;
             } else if (b.verdict === "some") {
-              reason = `a round can fix ${b.failing - b.baseRed} of ${b.failing}; the build will still stop on the ${b.baseRed} from \`dev\`. ${trendReason}`;
+              const unchecked =
+                b.undetermined > 0
+                  ? ` ${b.undetermined} could not be checked: ${b.reason ?? "no reason given"}.`
+                  : "";
+              reason = `a round can fix ${b.branch} of ${b.failing}; the build will still stop on the ${b.baseRed} from \`dev\`.${unchecked} ${trendReason}`;
             } else if (b.verdict === "none") {
               reason = `the failures come from this branch, so a round can fix them. ${trendReason}`;
             } else {
@@ -586,6 +600,20 @@ export const decisionsCommand: CommandSpec = {
           const status = /^Status:[ \t]*(\S+)/m.exec(text)?.[1] ?? "OPEN";
           if (status !== "OPEN")
             throw new CommandError(EXIT.USAGE, `${name} is Status: ${status}, not OPEN`);
+          const head = text.split(ITEM_SPLIT, 1)[0] ?? "";
+          if (!/^## Progress$/m.test(head))
+            throw new CommandError(
+              EXIT.USAGE,
+              `${name}: Q1 is not the loop question (no ## Progress block), so a re-run cannot answer it`,
+            );
+          const undecided = parseDecisionItems(text)
+            .filter((i) => i.n !== 1 && i.decision === null && !i.rejected && !i.deferred)
+            .map((i) => `Q${i.n}`);
+          if (undecided.length > 0)
+            throw new CommandError(
+              EXIT.USAGE,
+              `${name} has undecided questions besides the loop question: ${undecided.join(", ")}`,
+            );
           const out = withStatus(
             addUnder(text, 1, [
               `Decision: Re-run gate — the owner resumed the run, so the gate runs again first (${today()})`,
diff --git a/.bkit/core/engine/commands/workflow/tests-base.integration.test.ts b/.bkit/core/engine/commands/workflow/tests-base.integration.test.ts
index 1ed6488f3..b03efd9d7 100644
--- a/.bkit/core/engine/commands/workflow/tests-base.integration.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests-base.integration.test.ts
@@ -43,7 +43,7 @@ const write = (cwd: string, rel: string, body: string) => {
   fs.writeFileSync(path.join(cwd, rel), body);
 };
 
-/** A one-file "test suite": each key is a case, each value `pass`, `fail`, `env` (passes only when `.env` exists) or `nohooks` (passes only when `GIT_CONFIG_COUNT` is unset). */
+/** A one-file "test suite": each key is a case, each value `pass`, `fail`, `skip` (reported skipped), `env` (passes only when `.env` exists) or `nohooks` (passes only when `GIT_CONFIG_COUNT` is unset). */
 const spec = (cases: Record<string, string>) => JSON.stringify(cases);
 
 /** The package's `bkit:test:file`: runs the named spec files and writes JUnit to $BKIT_TEST_REPORT. */
@@ -63,8 +63,9 @@ for (const file of process.argv.slice(2)) {
       want === "pass" ||
       (want === "env" && fs.existsSync(".env")) ||
       (want === "nohooks" && !process.env.GIT_CONFIG_COUNT);
-    if (!ok) bad++;
-    cases.push('<testcase classname="' + file + '" name="' + name + '" file="' + file + '">' + (ok ? "" : '<failure message="boom"/>') + "</testcase>");
+    const skipped = want === "skip";
+    if (!ok && !skipped) bad++;
+    cases.push('<testcase classname="' + file + '" name="' + name + '" file="' + file + '">' + (skipped ? "<skipped/>" : ok ? "" : '<failure message="boom"/>') + "</testcase>");
   }
 }
 if (out) fs.writeFileSync(out, "<testsuite>" + cases.join("") + "</testsuite>");
@@ -493,6 +494,18 @@ describe("bkit tests base", () => {
     ]);
   });
 
+  it("a case skipped at the base commit reads unknown, not the branch's", async () => {
+    const f = fixture({ baseFiles: { "tests/a.test.ts": spec({ x: "skip" }) } });
+    gateReport(f, [["tests/a.test.ts", "x"]]);
+    const r = await testsBase(f);
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ verdict: "unknown", baseRed: 0, branch: 0, undetermined: 1 });
+    expect(r.json.reason).toContain("skipped");
+    expect(r.json.cases).toEqual([
+      expect.objectContaining({ name: "x", file: "tests/a.test.ts", atBase: "unknown" }),
+    ]);
+  });
+
   it("the base test run does not inherit the hooks-off git config", async () => {
     vi.stubEnv("GIT_CONFIG_COUNT", undefined);
     const f = fixture({ baseFiles: { "tests/a.test.ts": spec({ h: "nohooks" }) } });
diff --git a/.bkit/core/engine/commands/workflow/tests-base.test.ts b/.bkit/core/engine/commands/workflow/tests-base.test.ts
index e50f472c7..b27e6e5a4 100644
--- a/.bkit/core/engine/commands/workflow/tests-base.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests-base.test.ts
@@ -76,6 +76,19 @@ describe("baseVerdict", () => {
     expect(v.reason).toContain("1");
   });
 
+  it("some with an undetermined case names it in the reason", () => {
+    const v = baseVerdict([row("a", "red"), row("b", "pass"), row("c", "unknown", null)]);
+    expect(v).toMatchObject({
+      verdict: "some",
+      failing: 3,
+      baseRed: 1,
+      branch: 1,
+      undetermined: 1,
+    });
+    expect(typeof v.reason).toBe("string");
+    expect(v.reason).toContain("1");
+  });
+
   it("unknown when a red gate has no failing case", () => {
     const v = baseVerdict([]);
     expect(v.verdict).toBe("unknown");
diff --git a/.bkit/core/engine/commands/workflow/tests-base.ts b/.bkit/core/engine/commands/workflow/tests-base.ts
index 3312d17c8..69ca69246 100644
--- a/.bkit/core/engine/commands/workflow/tests-base.ts
+++ b/.bkit/core/engine/commands/workflow/tests-base.ts
@@ -89,7 +89,14 @@ export function baseVerdict(cases: readonly CaseRow[]): BaseVerdict {
       reason: `${undetermined} case(s) with no resolvable result at the base commit`,
       ...counts,
     };
-  return { verdict: "some", reason: null, ...counts };
+  return {
+    verdict: "some",
+    reason:
+      undetermined > 0
+        ? `${undetermined} case(s) with no resolvable result at the base commit`
+        : null,
+    ...counts,
+  };
 }
 
 interface BaseRun {
@@ -267,6 +274,7 @@ export const testsBaseVerb: VerbSpec = {
 
     let noReport = false;
     let crashed: number | null = null;
+    let skipped = 0;
     const cases = rowsWith((c, f) => {
       if (f === null) return "unknown";
       if (!run.files.has(f)) return "absent";
@@ -284,10 +292,13 @@ export const testsBaseVerb: VerbSpec = {
         }
         return "absent";
       }
-      return same.state === "failure" || same.state === "error" ? "red" : "pass";
+      if (same.state === "failure" || same.state === "error") return "red";
+      if (same.state === "passed") return "pass";
+      skipped += 1;
+      return "unknown";
     });
     const verdict = baseVerdict(cases);
-    if (verdict.verdict === "unknown") {
+    if (verdict.verdict === "unknown" || verdict.verdict === "some") {
       const unresolved = cases.filter((c) => c.file === null).length;
       const reason = noReport
         ? "no report from the base run"
@@ -295,7 +306,9 @@ export const testsBaseVerb: VerbSpec = {
           ? `the base run of a test file exited ${crashed} without the failing case`
           : unresolved > 0
             ? `${unresolved} case(s) with no resolvable file`
-            : verdict.reason;
+            : skipped > 0
+              ? `${skipped} case(s) skipped at the base commit`
+              : verdict.reason;
       return finish({ ...verdict, reason, base, source: "local", cases });
     }
     return finish({ ...verdict, base, source: "local", cases });
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index 70e5a9e04..61e6ea73c 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -40,7 +40,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
 - **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index c55a0af01..67b394d55 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -40,7 +40,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
 - **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
diff --git a/.bkit/version b/.bkit/version
index f00e38091..03f1886cb 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -24,7 +24,7 @@
     ".opencode/opencode.json": "06b3702dcb8968463c164b36fbc340428591f6601420cb48e95371db1d1ac958",
     "docs/design.md": "e012c407c66e2b8da22a9ebc9b632237c42ea84c704f61cfb06d0144edd01536",
     ".claude/commands/bkit-auto.md": "cf0e2d6d29a873669c3e718bf6a83e0af3e8e8b6d71325bf5e968a7f3f315f22",
-    ".claude/commands/bkit-build.md": "1df252414eb5da8a763e252b1d44f231c35b44e56aefd6f8500ccd8f0358386a",
+    ".claude/commands/bkit-build.md": "dae98f40c847be97ead5bb01b4433cc9f1c857edb01fc6331ac2337dca86e2ef",
     ".claude/commands/bkit-debug.md": "f1304c91860d5e0f5bd3cf1b83262cb062004b2e62a4362254d91991a7796024",
     ".claude/commands/bkit-design.md": "e7b100d353cf886b88ba95572d3eb8f88ac09e584417f2823e6c817de6b21cf5",
     ".claude/commands/bkit-plan.md": "72b4b5b7461d58621715c10f684bcbafcfa343efce541c2481f6a45be2f2fbc1",
@@ -56,7 +56,7 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "48aee178590ac282a2de281a33454833d3df07065d2e174a73373e1f74dd2be3",
     ".claude/agents/bkit-utility-update-documentation.md": "aa2d0541c2b77b0f647ee0d046c38446d90598ad23af0ea8907a52b471b39768",
     ".cursor/commands/bkit-auto.md": "4c152651b33c0ba41f323ade39b9d578d6af66e3cea25d9464a408eb357e4a05",
-    ".cursor/commands/bkit-build.md": "05c7147a5640c4559d3f37280897f0afd0d8f33d382fe1a64172a6174ed3bccc",
+    ".cursor/commands/bkit-build.md": "8361a8266cde938c2689dce1b9938350127bcf0a38693556fbb5fd5b7074f605",
     ".cursor/commands/bkit-debug.md": "c02ad2c9c5b1e44a1c50f422b3244bc81f71006a31717e8e594fbe5744961b4b",
     ".cursor/commands/bkit-design.md": "505e4909b51ec35696974a567c6b720a5f2a20e0b9ae4dccd814060319497dfd",
     ".cursor/commands/bkit-plan.md": "a0328b0487eff4968a76907eebb76e5f7cb25a3c46f961458ef5fb5c1753b935",
@@ -114,7 +114,7 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "6eeac027ab801c0ad404351a6b1ee043a45442c0cf268f444a028071a8bafd7a",
     ".opencode/agents/bkit-utility-update-documentation.md": "5fd081ae119984018573f62444493240b66411a75ec2aeafe6bdd1b1de903390",
     ".opencode/commands/bkit-auto.md": "3440ae6b925da8906394459788c702adaebd1acfe9c3fa0eddc3b40102596606",
-    ".opencode/commands/bkit-build.md": "3bb69df82fc9eab476e2343846ae21c00933d01dd336aba0805a5ebb6920ff7b",
+    ".opencode/commands/bkit-build.md": "9b9f7258f27460cd1f47773e4f8c2e6795fa6a444e0c3f86c7c3aff4978d2160",
     ".opencode/commands/bkit-debug.md": "508ad6d28451d31b85933f4f866fb33338543d75a1d7da4004227ac4b11b0fe8",
     ".opencode/commands/bkit-design.md": "b26082616675924b1617cbd56a3be75b9045ca6abe809e7d93a6bff203ca1bff",
     ".opencode/commands/bkit-plan.md": "75e9b3ce72892071c9a1de753cef3d5ff124aa1dee2b0c1917adcb2c87fb9b97",
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index 7e14d5269..0a3244f30 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -41,7 +41,7 @@ description: "Build Feature — Autonomous implementation"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
 - **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index 1b1e390ad..d779ead51 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -40,7 +40,7 @@ Build Feature — Autonomous implementation
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
 - **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index d06d91728..cc96b1f17 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -44,7 +44,7 @@ $ARGUMENTS
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path or message becomes it), checks artifacts and row, writes the row, commits, prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`.
+- **Resume:** After Step 2, `"{BKIT}" status resume --workflow=build --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `group` non-null → `GROUP` = `group`; `CHALLENGE_ROUND` = `challengeRound`; `CHALLENGE_DONE` = `challengeDone`; `step` = `build-plan-gaps-remediate-holistic` → Step 10 sub-step 7; `after` = `build-challenge` → Step 11 sub-step 1's `counters max --point=build.challenge` block (hold `value` as `CHALLENGE_MAX`), sub-step 2, then sub-step 5. **If** Step 2's `workflows start --session-dir="{SESSION_DIR}"` printed `openDecision` != null → resume at **Decision Pause** step 3 with it instead: `decision` as `DECISION`, `question` as `PAUSE_QUESTION`, `pauseStep` as `PAUSE_STEP`, `group` as `GROUP`, `verifyAttempt` as `VERIFY_ATTEMPT`, `testAttempt` as `TEST_ATTEMPT`, `gate` as `OPEN_GATE`, `PAUSE_POINT` = `build.{from}`; `from` = `holistic` → `PAUSE_POINT` = `build.verify`; `from` = `challenge` → `CHALLENGE_ROUND` = `challengeRound`, then run `counters max --point=build.challenge` (hold `value` as `CHALLENGE_MAX`) and Step 11 sub-steps 2 and 5 (the merge finds its tasks already in the plan, writes nothing and prints the round's open tasks) → hold `fixTasks` as `CHALLENGE_TASKS` → back to **Decision Pause** step 3, NEVER sub-step 6. **If** `OPEN_GATE` = `FAIL` **and** the loop question is the pause's only undecided question (the decision file has a `## Progress` block and no other question without a `Decision:` line) → the pause asks about a red gate, so skip step 3 and re-run the gate instead: `DECISION_ROUTE` = `verify` for `from` = `verify`, else `tests`; run **Decision Pause** step 6's `steps finish --step=build-decision` block first, then `"{BKIT}" decisions apply --by=rerun --file="docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{DECISION}.md"`, so an interruption between them leaves the pause `OPEN` and the next resume re-runs the gate again; `GATE_RERUN` = true; `from` = `verify` → `VERIFY_VERDICT` = PASS, the held `{VERIFY_ATTEMPT}` unchanged, Step 8 sub-step 8; `from` = `tests` → Step 12; no `counters grant`. **If** `OPEN_GATE` = `FAIL` but another question is undecided (a hard-blocker or verify-gap pause) → resume at **Decision Pause** step 3 as for any open pause.
 - **Owner decisions:** A subagent learns the owner's answers only by reading the decision file (`build-decision-{RUN}-*.md`) named in its `Read`. NEVER restate, summarise or paraphrase an owner's answer in a subagent's `Context`.
 - **Plan:** `docs/plans/{YYYYMM}/{FID}-plan.md`, in task-block form (`docs/templates/bkit-plan.md` § Agent Execution Runbook). Each group holds at most `MAX_TASKS_PER_GROUP` tasks and at most `MAX_TESTS_PER_GROUP` `TEST FIRST` tests (`bkit.workflows.tasks`, held at Step 1). One group runs per pass of Steps 7-9. Only the verify steps and the **Decision Pause** tick a task `[x]`. The pause ticks a challenge task it accepts, whether the owner accepts it or the run assumes the accept.
 - **Status:** `status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `group`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
diff --git a/dist/commands/workflow/decisions.js b/dist/commands/workflow/decisions.js
index e5c396b05..a0b379114 100644
--- a/dist/commands/workflow/decisions.js
+++ b/dist/commands/workflow/decisions.js
@@ -163,6 +163,14 @@ function readBaseCheck(file) {
     if (verdict !== "all" && verdict !== "some" && verdict !== "none" && verdict !== "unknown")
         throw bad("verdict", "must be all, some, none or unknown");
     const { failing, baseRed, adopt } = o;
+    const count = (k, fallback) => {
+        const v = o[k];
+        if (v === undefined)
+            return fallback;
+        if (typeof v !== "number" || !Number.isFinite(v))
+            throw bad(k, "must be a number");
+        return v;
+    };
     if (typeof failing !== "number" || !Number.isFinite(failing))
         throw bad("failing", "must be a number");
     if (typeof baseRed !== "number" || !Number.isFinite(baseRed))
@@ -184,6 +192,8 @@ function readBaseCheck(file) {
         source: text("source"),
         failing,
         baseRed,
+        branch: count("branch", failing - baseRed),
+        undetermined: count("undetermined", 0),
         adopt,
     };
 }
@@ -391,7 +401,10 @@ export const decisionsCommand = {
                             reason = `all ${b.failing} failing tests fail on \`dev\` too, so no round here can fix them. Fix \`dev\`, then resume. If the gate is still red after \`dev\` is fixed and the run resumed, the rest comes from this branch, and the gate re-run on resume shows it.${b.adopt ? " This run has no worktrees: merge \`dev\` into the branch before resuming." : ""}`;
                         }
                         else if (b.verdict === "some") {
-                            reason = `a round can fix ${b.failing - b.baseRed} of ${b.failing}; the build will still stop on the ${b.baseRed} from \`dev\`. ${trendReason}`;
+                            const unchecked = b.undetermined > 0
+                                ? ` ${b.undetermined} could not be checked: ${b.reason ?? "no reason given"}.`
+                                : "";
+                            reason = `a round can fix ${b.branch} of ${b.failing}; the build will still stop on the ${b.baseRed} from \`dev\`.${unchecked} ${trendReason}`;
                         }
                         else if (b.verdict === "none") {
                             reason = `the failures come from this branch, so a round can fix them. ${trendReason}`;
@@ -481,6 +494,14 @@ export const decisionsCommand = {
                     const status = /^Status:[ \t]*(\S+)/m.exec(text)?.[1] ?? "OPEN";
                     if (status !== "OPEN")
                         throw new CommandError(EXIT.USAGE, `${name} is Status: ${status}, not OPEN`);
+                    const head = text.split(ITEM_SPLIT, 1)[0] ?? "";
+                    if (!/^## Progress$/m.test(head))
+                        throw new CommandError(EXIT.USAGE, `${name}: Q1 is not the loop question (no ## Progress block), so a re-run cannot answer it`);
+                    const undecided = parseDecisionItems(text)
+                        .filter((i) => i.n !== 1 && i.decision === null && !i.rejected && !i.deferred)
+                        .map((i) => `Q${i.n}`);
+                    if (undecided.length > 0)
+                        throw new CommandError(EXIT.USAGE, `${name} has undecided questions besides the loop question: ${undecided.join(", ")}`);
                     const out = withStatus(addUnder(text, 1, [
                         `Decision: Re-run gate — the owner resumed the run, so the gate runs again first (${today()})`,
                     ]), "DECIDED");
diff --git a/dist/commands/workflow/tests-base.js b/dist/commands/workflow/tests-base.js
index a6c1aadc0..7f21bb337 100644
--- a/dist/commands/workflow/tests-base.js
+++ b/dist/commands/workflow/tests-base.js
@@ -74,7 +74,13 @@ export function baseVerdict(cases) {
             reason: `${undetermined} case(s) with no resolvable result at the base commit`,
             ...counts,
         };
-    return { verdict: "some", reason: null, ...counts };
+    return {
+        verdict: "some",
+        reason: undetermined > 0
+            ? `${undetermined} case(s) with no resolvable result at the base commit`
+            : null,
+        ...counts,
+    };
 }
 const str = (v) => (typeof v === "string" && v !== "" ? v : undefined);
 function readRows(file) {
@@ -212,6 +218,7 @@ export const testsBaseVerb = {
             return unknown(run.reason, base, rowsWith(() => "unknown"));
         let noReport = false;
         let crashed = null;
+        let skipped = 0;
         const cases = rowsWith((c, f) => {
             if (f === null)
                 return "unknown";
@@ -231,10 +238,15 @@ export const testsBaseVerb = {
                 }
                 return "absent";
             }
-            return same.state === "failure" || same.state === "error" ? "red" : "pass";
+            if (same.state === "failure" || same.state === "error")
+                return "red";
+            if (same.state === "passed")
+                return "pass";
+            skipped += 1;
+            return "unknown";
         });
         const verdict = baseVerdict(cases);
-        if (verdict.verdict === "unknown") {
+        if (verdict.verdict === "unknown" || verdict.verdict === "some") {
             const unresolved = cases.filter((c) => c.file === null).length;
             const reason = noReport
                 ? "no report from the base run"
@@ -242,7 +254,9 @@ export const testsBaseVerb = {
                     ? `the base run of a test file exited ${crashed} without the failing case`
                     : unresolved > 0
                         ? `${unresolved} case(s) with no resolvable file`
-                        : verdict.reason;
+                        : skipped > 0
+                            ? `${skipped} case(s) skipped at the base commit`
+                            : verdict.reason;
             return finish({ ...verdict, reason, base, source: "local", cases });
         }
         return finish({ ...verdict, base, source: "local", cases });
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index 283260fa0..83f93957d 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -239,3 +239,6 @@
 {"schema":3,"ts":1794211336825,"firstTs":1794211336825,"updates":1,"kind":"deferral","key":"891-ship-base-red-notice","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-apply-review","subagent":"bkit-plan-update","model":"claude-opus-5-5"},"references":["891","https://github.com/cbartens/bkit/issues/891#issuecomment-6734127433 § Scope (Also out of scope: /bkit-ship, which still needs green CI as today)","docs/plans/202611/891-build-gate-stuck-plan.md § Out of Scope",".bkit/core/workflows/bkit-ship.md"],"type":"feature","category":"agentic","severity":"LOW","reason":"scope-declared","summary":"Tell the owner at /bkit-ship when a red PR CI check also fails on the base commit","description":"The #891 base-commit check (bkit tests base) steers only /bkit-build's Decision Pause. /bkit-ship could use the same evidence to say that a red CI check on the PR also fails on the commit the branch started from, so the owner knows to fix dev first. The owner's rescope declares /bkit-ship out of scope: it still needs green CI as today.","remediation":"A separate issue that reuses bkit tests base at /bkit-ship's CI wait, adding advice only and keeping the green-CI requirement.","source":"phase","status":"OPEN"}
 {"schema":3,"ts":1794211336827,"firstTs":1794211336827,"updates":1,"kind":"deferral","key":"891-ci-junit-artifact-settles-red-base-runs","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"plan","step":"plan-apply-review","subagent":"bkit-plan-update","model":"claude-opus-5-5"},"references":["891","docs/plans/202611/891-build-gate-stuck-plan.md § Out of Scope","docs/plans/202611/891-build-gate-stuck-plan.md § Open Questions & Assumptions (Q3)",".bkit/core/engine/commands/workflow/tests.ts"],"type":"feature","category":"agentic","severity":"LOW","reason":"own-cycle","summary":"Publish CI JUnit reports so a red CI run at the base commit can settle the base check","description":"bkit tests base treats only a completed success CI run at the exact base commit as decisive (verdict none); any red run falls back to a local re-run of the failing test files, because CI keeps no per-test list bkit can read. Publishing the test lane's JUnit reports as a run artifact would let a red run settle all / some without a local run. It is plan-sized: it changes the shipped CI workflow template to upload the reports, adds a gh run download reader, and needs a mapping from CI report cases to the gate's failing cases across runners.","remediation":"Its own design and plan: CI template upload step, artifact naming contract, gh run download reader in tests base, and tests against the fake gh fixture.","source":"phase","status":"OPEN"}
 {"schema":3,"ts":1794237541270,"firstTs":1794237541270,"updates":1,"kind":"deferral","key":"891-build-gate-stuck-challenge-low-bkit-core-engine-commands-workflow-tests-base-ts-264","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["891-build-gate-stuck"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"Two base cases with the same name in one file (an `it.each` with a repeated title) match by `find`, so a passing first twin hides a red second one and the case reads `pass`","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/tests-base.ts:264: Two base cases with the same name in one file (an `it.each` with a repeated title) match by `find`, so a passing first twin hides a red second one and the case reads `pass`. Done when: The base lookup considers every same-name case in the file: any red twin reads `red` (or an ambiguous match reads `unknown`), never `pass`.","source":".bkit/core/engine/commands/workflow/tests-base.ts:264"}
+{"schema":3,"ts":1794271330226,"firstTs":1794271330226,"updates":1,"kind":"deferral","key":"891-build-gate-stuck-challenge-low-bkit-core-engine-commands-workflow-tests-base-ts-278","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["891-build-gate-stuck"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A file holding two cases with the same name (an `it.each` title without a placeholder, or the same title in two `describe` blocks a runner does not prefix) matches the first one at base, so a case that fails at base reads `pass` (verdict `none`), or a case that passes at base reads `red` (a false `all` that recommends `Stop` and tells the owner to fix a healthy `dev`)","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/tests-base.ts:278: A file holding two cases with the same name (an `it.each` title without a placeholder, or the same title in two `describe` blocks a runner does not prefix) matches the first one at base, so a case that fails at base reads `pass` (verdict `none`), or a case that passes at base reads `red` (a false `all` that recommends `Stop` and tells the owner to fix a healthy `dev`). Done when: The base case is matched by name among the base report's cases of the same file, and a name that occurs more than once in that file's base report with differing states reads `atBase: \"unknown\"`; a unique name, or duplicates that all share one state, read as today.","source":".bkit/core/engine/commands/workflow/tests-base.ts:278"}
+{"schema":3,"ts":1794271330227,"firstTs":1794271330227,"updates":1,"kind":"deferral","key":"891-build-gate-stuck-challenge-low-bkit-core-engine-commands-workflow-tests-base-ts-241","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["891-build-gate-stuck"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A `worktreeCopy` entry that `fs.cpSync` cannot copy (a FIFO or socket at `.env`, an unreadable file) throws out of `baseRun`, so `tests base` exits non-zero and the build takes the Failure Path instead of pausing with verdict `unknown`, breaking the verb's \"exit 0 for every verdict\" contract","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/tests-base.ts:241: A `worktreeCopy` entry that `fs.cpSync` cannot copy (a FIFO or socket at `.env`, an unreadable file) throws out of `baseRun`, so `tests base` exits non-zero and the build takes the Failure Path instead of pausing with verdict `unknown`, breaking the verb's \"exit 0 for every verdict\" contract. Done when: An error thrown by `copyListed`, `install` or `runTestFile` inside `baseRun` becomes verdict `unknown` with a reason naming the failed step and the error message (for example `base checkout copy failed: {message}`), the verb exits 0, and `withCleanup` still removes the detached checkout.","source":".bkit/core/engine/commands/workflow/tests-base.ts:241"}
+{"schema":3,"ts":1794271330228,"firstTs":1794271330228,"updates":1,"kind":"deferral","key":"891-build-gate-stuck-challenge-low-bkit-core-engine-commands-workflow-tests-base-ts-252","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-challenge"},"references":["891-build-gate-stuck"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A branch that breaks a shared setup file makes every test file fail, and `tests base` then re-runs every one of them at the base commit, one process at a time with no file cap and no timeout, so the Decision Pause waits for a serial re-run of the whole suite (or forever on a test that hangs in the fresh checkout)","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/tests-base.ts:252: A branch that breaks a shared setup file makes every test file fail, and `tests base` then re-runs every one of them at the base commit, one process at a time with no file cap and no timeout, so the Decision Pause waits for a serial re-run of the whole suite (or forever on a test that hangs in the fresh checkout). Done when: `tests-base.ts` exports a cap on the distinct failing files it re-runs at base (a named constant); when the resolved files exceed it, the verb returns verdict `unknown` with reason `too many failing files to re-run at the base commit ({n} > {cap})` before any checkout or install, and below the cap it runs as today.","source":".bkit/core/engine/commands/workflow/tests-base.ts:252"}
