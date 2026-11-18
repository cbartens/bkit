diff --git a/.agents/plugins/bkit/skills/bkit-design/SKILL.md b/.agents/plugins/bkit/skills/bkit-design/SKILL.md
index 826f4351e..821a2a2d5 100644
--- a/.agents/plugins/bkit/skills/bkit-design/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-design/SKILL.md
@@ -572,11 +572,11 @@ description: "Design Feature — Autonomous design phase"
      Read: `{OUTBOX}/design-answers.md`.
      Update: `docs/plans/{YYYYMM}/{FID}-design.md`.
      **If** `Verdict` = FAIL → tell the user which answer stays unapplied, never the **Failure Path**.
-   - Commit `docs/plans/{YYYYMM}/{FID}-design.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md" --session-dir="{SESSION_DIR}"
+     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md" --file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
      ```
+   - Commit `docs/plans/{YYYYMM}/{FID}-design.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
 
 ### 🔒 Gate 12 — Close Workflow
 
diff --git a/.agents/plugins/bkit/skills/bkit-plan/SKILL.md b/.agents/plugins/bkit/skills/bkit-plan/SKILL.md
index a8751b34f..0daf7ad22 100644
--- a/.agents/plugins/bkit/skills/bkit-plan/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-plan/SKILL.md
@@ -488,15 +488,15 @@ Before generating, ask the engine for this step's invocation id and keep the pri
      cd "{REPO_ROOT}" && "{BKIT}" tests plan-check --plan=docs/plans/{YYYYMM}/{FID}-plan.md --existence=refuse --log={OUTBOX}/plan-answers-check.md
      ```
      Route — first match wins:
-     - **If** exit 0 → the commit below.
+     - **If** exit 0 → the next bullet.
      - **If** this is the second exit 1 → tell the user what `{OUTBOX}/plan-answers-check.md` names, and commit nothing from this round.
      - **If** exit 1 → invoke `@bkit-plan-update` again with Context `"Fix only what '{OUTBOX}/plan-answers-check.md' names; edit only those lines, do not seed the file again."`, Update: `docs/plans/{YYYYMM}/{FID}-plan.md` → re-run this sub-step.
      - **Else** → tell the user what the command printed, and commit nothing from this round.
-   - Commit `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md" --session-dir="{SESSION_DIR}"
+     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md" --file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
      ```
+   - Commit `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
 
 ### 🔒 Gate 8 — Close Workflow
 
diff --git a/.agents/skills/bkit-design/SKILL.md b/.agents/skills/bkit-design/SKILL.md
index dabd38f5c..208c7b9d9 100644
--- a/.agents/skills/bkit-design/SKILL.md
+++ b/.agents/skills/bkit-design/SKILL.md
@@ -572,11 +572,11 @@ description: "Design Feature — Autonomous design phase"
      Read: `{OUTBOX}/design-answers.md`.
      Update: `docs/plans/{YYYYMM}/{FID}-design.md`.
      **If** `Verdict` = FAIL → tell the user which answer stays unapplied, never the **Failure Path**.
-   - Commit `docs/plans/{YYYYMM}/{FID}-design.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md" --session-dir="{SESSION_DIR}"
+     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md" --file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
      ```
+   - Commit `docs/plans/{YYYYMM}/{FID}-design.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
 
 ### 🔒 Gate 12 — Close Workflow
 
diff --git a/.agents/skills/bkit-plan/SKILL.md b/.agents/skills/bkit-plan/SKILL.md
index b2f15f500..50b35194e 100644
--- a/.agents/skills/bkit-plan/SKILL.md
+++ b/.agents/skills/bkit-plan/SKILL.md
@@ -488,15 +488,15 @@ Before generating, ask the engine for this step's invocation id and keep the pri
      cd "{REPO_ROOT}" && "{BKIT}" tests plan-check --plan=docs/plans/{YYYYMM}/{FID}-plan.md --existence=refuse --log={OUTBOX}/plan-answers-check.md
      ```
      Route — first match wins:
-     - **If** exit 0 → the commit below.
+     - **If** exit 0 → the next bullet.
      - **If** this is the second exit 1 → tell the user what `{OUTBOX}/plan-answers-check.md` names, and commit nothing from this round.
      - **If** exit 1 → invoke `@bkit-plan-update` again with Context `"Fix only what '{OUTBOX}/plan-answers-check.md' names; edit only those lines, do not seed the file again."`, Update: `docs/plans/{YYYYMM}/{FID}-plan.md` → re-run this sub-step.
      - **Else** → tell the user what the command printed, and commit nothing from this round.
-   - Commit `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md" --session-dir="{SESSION_DIR}"
+     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md" --file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
      ```
+   - Commit `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
 
 ### 🔒 Gate 8 — Close Workflow
 
diff --git a/.bkit/core/.bkit/trackers.md b/.bkit/core/.bkit/trackers.md
index d3bc89221..5a344493a 100644
--- a/.bkit/core/.bkit/trackers.md
+++ b/.bkit/core/.bkit/trackers.md
@@ -22,7 +22,7 @@
 
 The engine may append routine reports to its own eligible progress comment. Ownership comes from an explicit repo-info session or an exact workflow run, never another active run. A later human or unrelated comment, missing ownership evidence, or a capacity rollover starts a new comment. Attention reports and terminal summaries always use new comments.
 
-The optional progress cache and run association live under the repository's Git-common `bkit-outbox` directory, shared by linked worktrees. Losing this state starts fresh. Remote text can confirm an owned comment, but never becomes the source of a replacement body. Reconciliation reads a bounded newest-created window, including paginated provider responses.
+A session folder holds its random id, and the run's `workflow-started` row in `status.jsonl` holds the run's comment link, so a post after the run closed still joins its comment. The optional progress source cache lives under the repository's Git-common `bkit-outbox` directory, shared by linked worktrees. Losing it starts fresh. Remote text can confirm an owned comment, but never becomes the source of a replacement body. Reconciliation reads a bounded newest-created window, including paginated provider responses.
 
 Preparation, delivery, reconciliation, receipt and friction failures are nonfatal. When `tracker.done` is false and `commentFile` exists, attempt one new MCP comment from that file byte-for-byte. MCP fallback never edits prior tracker content. Record best-effort redacted friction and continue substantive work even when the file or fallback is unavailable.
 
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index fda745c4e..c53ddf8c8 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -42,7 +42,7 @@ Skill selection and activation within every workflow follow `.agents/skills.md`
 
 ## Tracker reporting
 
-Every phase carries its explicit repo-info session into fileless reports and workflow start. The engine binds that session to the exact run so later step reports retain the same invocation. Auto and its dispatched phase keep separate invocations. A resumed exact run keeps its original association; an unrelated run never supplies one.
+Every phase carries its explicit repo-info session into fileless reports and workflow start. The engine binds that session to the exact run, and records the run's link on its `workflow-started` row, so later step reports retain the same invocation. Auto and its dispatched phase keep separate invocations. A resumed exact run keeps its original association; an unrelated run never supplies one.
 
 Routine reports may append to an eligible engine-owned progress comment. Attention reports and terminal summaries create new comments. All tracker reporting, including preparation, MCP fallback and friction, is nonfatal: attempt the report or an applicable skip, then continue substantive work. When fallback is available, publish `commentFile` byte-for-byte as one new comment and never edit prior tracker content. See `.bkit/trackers.md` § Workflow comment delivery for ownership, reconciliation and recovery.
 
@@ -287,7 +287,7 @@ Rationale: keeping per-run state on `feat/{FID}` removes the divergence between
 <!-- prettier-ignore -->
 | Event | Shape | Meaning |
 | --- | --- | --- |
-| `workflow-started` | `{type, workflow, at, parentSha, limits?}` | Opens a new run of a phase workflow. `limits` holds the workflow's ask point settings as `package.json` gave them when the run started; `counters route` reads them for the whole run (§ Ask points). |
+| `workflow-started` | `{type, workflow, at, parentSha, limits?, progress?}` | Opens a new run of a phase workflow. `progress` is the run's comment link, written by `workflows start` from the session's random id; every post that names the run's status file reads it. `limits` holds the workflow's ask point settings as `package.json` gave them when the run started; `counters route` reads them for the whole run (§ Ask points). |
 | `step-done` | `{type, workflow, step, status, at, parentSha, artifacts, verdict?, attempt?, group?, failures?, strategy?, scope?, round?, clamped?, challengeFindings?, uncommitted?}` | One completed step (the bulk). Challenge snapshots are described under § Summary / handover step. |
 | `allowance-granted` | `{type, workflow, at, point, group?, value}` | The owner chose to go on at a used-up limit: one more full allowance of `maxAttempts` for that ask point (and group). Written by `bkit counters grant`; counted by `counters route` / `counters max` and `challenge merge --round` (§ Ask points). Not folded. |
 | `workflow-meta` | `{type, workflow, at, …fields}` | Workflow-level metadata merged onto the run (e.g. `debugAttempt`). |
@@ -473,7 +473,7 @@ The lock is `docs/plans/{YYYYMM}/logs/{FID}/.lock` under the main checkout (ever
 
 Every workflow step posts a new tracker comment. Never edit, paraphrase, summarise, truncate, deduplicate, or reorder prior content. Each step is independent: no comment ID is carried forward, and no bodies are concatenated. `bkit issues comment` builds every body below (`--kind=step|failure|handover|audit`, header fields in flag order, `###### bkit:generated` first, a copied whole-line cut marker defused, stderr fenced) and prints it. With `--post` the verb that builds a comment (`steps finish`, `issues comment`, `workflows fail` / `handover` / `close` / `links`) posts it itself — GitHub through `gh` (`BKIT_GH_TOKEN` as `GH_TOKEN`), Linear through its GraphQL API (`BKIT_LINEAR_API_KEY`), Jira through the Rovo MCP server over HTTP (`BKIT_JIRA_API_KEY`; a body over 32,767 characters goes as consecutive `_(part i/n)_` comments) — and prints `tracker`: `{done: true, action, url, deduped?}`, `{done: false, action, reason}` (`network` | `auth` | `scope` | `rate-limit` | `not-found` | `http-<n>`; the exit code is the verb's own) or `{skipped: no-issue | tracker-none}`. Every verb that prints a `comment` also writes it byte-for-byte to `tmp/bkit-comment-{hash}.md` at the checkout root and prints that path as `commentFile` (after any commit the verb makes, so no commit carries it); `prs open` / `branches land` stage `open` print the PR body's file as `bodyFile` on exit 80. Text output escapes a multi-line value onto one line, so when `tracker.done` = false, the workflow posts the content of `commentFile` through the tracker MCP (the header's **Comments** line), never the printed `comment`.
 
-**Posted once.** With a run's `status.jsonl` the verb records the post as an `engine-action` row (`.bkit/jsonl.md` § status.jsonl), keyed by workflow, run, step and the comment's kind. A re-run with the same body finds the row and prints `deduped: true` without posting. An edited body posts again. `steps finish --post`, `issues comment --post --file=`, and `workflows fail --post` with the run's `--token` write the row before the run's next commit. The rest (`issues comment` without `--file`, `workflows handover` / `close` / `links`, whose posts come after their record is pushed or committed) check the issue's last 5 comments for the same marker hash: the hash survives the tracker's markdown rewrite, Jira's HTML page and the `_(part i/n)_` split, so a match is `deduped: true`. A status.jsonl write that fails after a post prints `done: true` with a `warning`.
+**Posted once.** With a run's `status.jsonl` the verb records the post as an `engine-action` row (`.bkit/jsonl.md` § status.jsonl), keyed by workflow, run, step and the comment's kind. A re-run with the same body finds the row and prints `deduped: true` without posting. An edited body posts again. `steps finish --post`, `issues comment --post --file=`, and `workflows fail --post` with the run's `--token` write the row before the run's next commit. A `--file` post after its run ended is keyed to that run, not the next one. The rest (`issues comment` without `--file`, `workflows handover` / `close` / `links`, whose posts come after their record is pushed or committed) check the issue's last 5 comments for the same marker hash: the hash survives the tracker's markdown rewrite, Jira's HTML page and the `_(part i/n)_` split, so a match is `deduped: true`. A status.jsonl write that fails after a post prints `done: true` with a `warning`.
 
 **Run proof required.** `bkit issues comment` refuses, with and without `--post`, any call that carries no proof that a workflow or audit run is making it, and exits 2 with a message that points at plain markdown through the tracker MCP. The three proofs are a `--session-dir` folder directly under the Git-common `bkit-outbox/sessions/`, a `--file` status file holding a run, and an audit call with `--kind=audit`, `--audit-slug` and a `--body-file` in that audit's own `audit-{slug}` outbox folder. Work comments outside a workflow go as plain markdown through the tracker MCP (`.agents/rules.md` § Tracker work comments), because a `###### bkit:generated` line makes later workflows drop the comment (§ Tracker context filtering).
 
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 482ed49b8..3071cf6a4 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -1624,7 +1624,7 @@ describe("plan", () => {
       expect(step).not.toContain("every `kind`");
     }
     expect(update).toContain("**If** exit 0 → sub-step 5.");
-    expect(close).toContain("**If** exit 0 → the commit below.");
+    expect(close).toContain("**If** exit 0 → the next bullet.");
     expect(plan).not.toContain("PLAN_CHECK_REPAIRS");
     expect(plan).not.toContain("PLAN_CHECK_LIMIT");
   });
@@ -2873,3 +2873,28 @@ describe("build gaps-fix source checks", () => {
     expect(in10[0]).toContain("--code");
   });
 });
+
+describe("Owner Answers comment posts", () => {
+  const statusFlag = '--file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"';
+
+  it("plan and design post the Owner Answers comment with the run's status file before the round's commit", () => {
+    for (const [name, heading, answers] of [
+      ["plan", /Step 8 — Close Workflow/, "plan-answers.md"],
+      ["design", /Step 12 — Close Workflow/, "design-answers.md"],
+    ] as const) {
+      const lines = stepBody(workflow(name), heading).split("\n");
+      const post = lines.findIndex((l) =>
+        new RegExp(`issues comment --post.*--body-file="\\{OUTBOX\\}/${answers}"`).test(l),
+      );
+      expect(post, `${name}: no Owner Answers post`).toBeGreaterThanOrEqual(0);
+      expect(lines[post]).toContain(statusFlag);
+      expect(lines[post]).not.toContain("--session-dir");
+      const commit = lines.findIndex((l) => l.startsWith("   - Commit `docs/plans/"));
+      expect(commit, `${name}: no round commit bullet`).toBeGreaterThanOrEqual(0);
+      expect(post).toBeLessThan(commit);
+    }
+    const route = stepBody(workflow("plan"), /Step 8 — Close Workflow/);
+    expect(route).toContain("**If** exit 0 → the next bullet.");
+    expect(route).not.toContain("the commit below");
+  });
+});
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
index 0514977df..0baeac77c 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
@@ -434,7 +434,7 @@ Before generating, ask the engine for this step's invocation id and keep the pri
      cd "{REPO_ROOT}" && "{BKIT}" tests plan-check --plan=docs/plans/{YYYYMM}/{FID}-plan.md --existence=refuse --log={OUTBOX}/plan-answers-check.md
      ```
      Route — first match wins:
-     - **If** exit 0 → the commit below.
+     - **If** exit 0 → the next bullet.
      - **If** this is the second exit 1 → tell the user what `{OUTBOX}/plan-answers-check.md` names, and commit nothing from this round.
      - **If** exit 1 → invoke `@bkit-plan-update` again with Context `"Fix only what '{OUTBOX}/plan-answers-check.md' names; edit only those lines, do not seed the file again."`, Update: `docs/plans/{YYYYMM}/{FID}-plan.md` → re-run this sub-step.
      - **Else** → tell the user what the command printed, and commit nothing from this round.
diff --git a/.bkit/core/workflows/bkit-design.md b/.bkit/core/workflows/bkit-design.md
index f8ac53373..7929d4410 100644
--- a/.bkit/core/workflows/bkit-design.md
+++ b/.bkit/core/workflows/bkit-design.md
@@ -639,13 +639,13 @@ description: "Design Feature — Autonomous design phase"
      Read: `{OUTBOX}/design-answers.md`.
      Update: `docs/plans/{YYYYMM}/{FID}-design.md`.
      **If** `Verdict` = FAIL → tell the user which answer stays unapplied, never the **Failure Path**.
-   - Commit `docs/plans/{YYYYMM}/{FID}-design.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
    <!-- bkit:tracker true start -->
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md" --session-dir="{SESSION_DIR}"
+     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md" --file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
      ```
    <!-- bkit:tracker true end -->
+   - Commit `docs/plans/{YYYYMM}/{FID}-design.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
 
 ### 🔒 Gate 12 — Close Workflow
 
diff --git a/.bkit/core/workflows/bkit-plan.md b/.bkit/core/workflows/bkit-plan.md
index 13fb2b7a2..c273e53a7 100644
--- a/.bkit/core/workflows/bkit-plan.md
+++ b/.bkit/core/workflows/bkit-plan.md
@@ -550,17 +550,17 @@ Before generating, ask the engine for this step's invocation id and keep the pri
      cd "{REPO_ROOT}" && "{BKIT}" tests plan-check --plan=docs/plans/{YYYYMM}/{FID}-plan.md --existence=refuse --log={OUTBOX}/plan-answers-check.md
      ```
      Route — first match wins:
-     - **If** exit 0 → the commit below.
+     - **If** exit 0 → the next bullet.
      - **If** this is the second exit 1 → tell the user what `{OUTBOX}/plan-answers-check.md` names, and commit nothing from this round.
      - **If** exit 1 → invoke `@bkit-plan-update` again with Context `"Fix only what '{OUTBOX}/plan-answers-check.md' names; edit only those lines, do not seed the file again."`, Update: `docs/plans/{YYYYMM}/{FID}-plan.md` → re-run this sub-step.
      - **Else** → tell the user what the command printed, and commit nothing from this round.
-   - Commit `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
    <!-- bkit:tracker true start -->
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md" --session-dir="{SESSION_DIR}"
+     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md" --file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
      ```
    <!-- bkit:tracker true end -->
+   - Commit `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
 
 ### 🔒 Gate 8 — Close Workflow
 
diff --git a/.bkit/trackers.md b/.bkit/trackers.md
index a009a350e..6054a5fda 100644
--- a/.bkit/trackers.md
+++ b/.bkit/trackers.md
@@ -22,7 +22,7 @@
 
 The engine may append routine reports to its own eligible progress comment. Ownership comes from an explicit repo-info session or an exact workflow run, never another active run. A later human or unrelated comment, missing ownership evidence, or a capacity rollover starts a new comment. Attention reports and terminal summaries always use new comments.
 
-The optional progress cache and run association live under the repository's Git-common `bkit-outbox` directory, shared by linked worktrees. Losing this state starts fresh. Remote text can confirm an owned comment, but never becomes the source of a replacement body. Reconciliation reads a bounded newest-created window, including paginated provider responses.
+A session folder holds its random id, and the run's `workflow-started` row in `status.jsonl` holds the run's comment link, so a post after the run closed still joins its comment. The optional progress source cache lives under the repository's Git-common `bkit-outbox` directory, shared by linked worktrees. Losing it starts fresh. Remote text can confirm an owned comment, but never becomes the source of a replacement body. Reconciliation reads a bounded newest-created window, including paginated provider responses.
 
 Preparation, delivery, reconciliation, receipt and friction failures are nonfatal. When `tracker.done` is false and `commentFile` exists, attempt one new MCP comment from that file byte-for-byte. MCP fallback never edits prior tracker content. Record best-effort redacted friction and continue substantive work even when the file or fallback is unavailable.
 
diff --git a/.bkit/version b/.bkit/version
index 04e7b3800..67859a992 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -17,8 +17,8 @@
     ".claude/commands/bkit-auto.md": "2b0c16b2a7c783ad8d1d1f8160b62b8afa5369c7c179064c10db836e70de9744",
     ".claude/commands/bkit-build.md": "707c6dd3678881bcb9dc7e6e8c0e6c195e72bafd78d968a2eba494278cb38221",
     ".claude/commands/bkit-debug.md": "6b58fad4ef1d72a6b951d326bab931c2e27119a3d4d0f83d4d7ff8766b9eb0f6",
-    ".claude/commands/bkit-design.md": "dae2b4e44305a5cbe85c19357e4fcf5381485c093e6948ea00280628c000e843",
-    ".claude/commands/bkit-plan.md": "85c7b7cb3b9f0873761fdbc62fdbbe5c1cc494a272173947ad2bea4d907c9a39",
+    ".claude/commands/bkit-design.md": "33b2cac81b4ac40832da6fe4042bb220e6417d565b7e63ef19e1941d0013a479",
+    ".claude/commands/bkit-plan.md": "4600789040a921e07edcb7fa9f7a0ce23585bb85e1cae7e3e30950a0bbf02fd0",
     ".claude/commands/bkit-ship.md": "ac597a53b09235918ffc3ca73ca59fe946d767fca0db55de8f3effbff0342b75",
     ".claude/agents/bkit-build-challenge-1.md": "27b112ecab10c311a195ab8cca36187708722554344f402a9a51c402d8c87c9b",
     ".claude/agents/bkit-build-challenge-2.md": "b83d1d00da3d86b93c6ab33379ac48cade1a3f182b9890d54e847a46b1e430bf",
@@ -49,8 +49,8 @@
     ".cursor/commands/bkit-auto.md": "28471fc3de9f81742c3111c3b4f9abe67f4c020f05c0d26574eae6db1580f41b",
     ".cursor/commands/bkit-build.md": "8227067d999bf9fd11dbef444010e79a20f7d75a491ba174dcc1661f1c7c2bd7",
     ".cursor/commands/bkit-debug.md": "f76b79801538fa4bae3f2613b8e8a572365db3665c123749a9ec6299fce25c43",
-    ".cursor/commands/bkit-design.md": "cafad1a3acc6788e3c2356694efb51681477e425b81a98f3e4e5ce00c9454a02",
-    ".cursor/commands/bkit-plan.md": "7b9298fa053dba33814fbb657968584c1a87d181229a087058bfdb559f4b0cd1",
+    ".cursor/commands/bkit-design.md": "b583fe26ac1cb6f57b61aa0c72ebe423de5e2dfad6cec16e50152e014672b0be",
+    ".cursor/commands/bkit-plan.md": "538fa66cd3d9e1132432a93028a72e46b282e55608c576d2eaccf6e9c3fb053d",
     ".cursor/commands/bkit-ship.md": "18846ae5cce57a4d29f51271fe337a50a8ea4373c182fbbb77e51a51bc78dfb0",
     ".cursor/agents/bkit-build-challenge-1.md": "e8736c4d2e1c56397ee64f0efd867677c3dad3b09c1809bc57385c4880f1a832",
     ".cursor/agents/bkit-build-challenge-2.md": "41a0ac26cdd42bc02c1399eee02fc956e56f15a2a44243988cc68d4126840dc8",
@@ -107,8 +107,8 @@
     ".opencode/commands/bkit-auto.md": "7695e7b766a5d89b516befb2bcaed679018bbe8b6708ea497af9a805270f085c",
     ".opencode/commands/bkit-build.md": "a92edad6562020f7c4c048924282674040253ed85c06c84ee9cbfee0084ad783",
     ".opencode/commands/bkit-debug.md": "e4ef9e278efb5cd6ef5f9702463e967f42972c1d50a6e7a02127d2b7e7b4aa90",
-    ".opencode/commands/bkit-design.md": "599a393c2309e2ff50f53f54d8383a854763f1f98074904886b4b9f4ea394312",
-    ".opencode/commands/bkit-plan.md": "8b8b40b4a5286bba48f1108eace3c350c769884d74ff5edf8674d23338aca2e1",
+    ".opencode/commands/bkit-design.md": "3d66703350608ead4fe33a4d4b36e2c8b366a5f46a67e973bce169487eb567de",
+    ".opencode/commands/bkit-plan.md": "9245b16ae71f70a16861fc9746ee59c43cbc81a55eb1be415031cbb8fad82416",
     ".opencode/commands/bkit-ship.md": "7bf3cdc1f819e400ec7abf75f88133ca75d6250dc724787f462e2206da965ff1",
     ".claude/agents/bkit-design-spike.md": "1628fe87f44714001e6bb4056de5ffe94c3ba8784ad347f548022ea8bdea3649",
     ".cursor/agents/bkit-design-spike.md": "16b114cf2d43dee7f4c4e4703480056e6b94467a096f21654c69b655d078a3ec",
@@ -213,8 +213,8 @@
     ".bkit/jsonl.md": "2ee43214c4fa16717bfe932463f3a311a22caa40569f24f71e6bd23b6942459c",
     ".bkit/providers.md": "cd84350a719e69837d96a698fe5597f98c79785d3e4079cb1867fbcf4901430e",
     ".bkit/prompts.md": "2ac9bdc011d81372cbebcdb914815f02140c91d82dfb79a1bdbb72875d48d852",
-    ".bkit/trackers.md": "85913cc84a994cd14a6c0948a8f6b63611a776b1be80cf9a902e5cb994add0c2",
-    ".bkit/workflows.md": "40cbd95b65b86461e194ce61682fabadb3d7134b92e490605478d0794cc24aee",
+    ".bkit/trackers.md": "489175623dcfeb76714039dd334024797f1a3a22fd57be1ea2ca7c06f32f9623",
+    ".bkit/workflows.md": "273e1d599f40b71f0f3ea6cd021ceb2e0a7030db5d6d93b4dafc818463b456ef",
     ".bkit/README.md": "76da76193945362dbf7908c9ede6ffc456f783218c110e6ad98d0e737475d98a",
     ".cursor/rules/bkit-rules.mdc": "36782c0c77a3eabb5a89b82804465d9960ecc7bc4962531fdef9f5c5be07e84d",
     ".claude/hooks/bkit-gateguard.cjs": "ae6358523d8033cf3ccdb6bb306e91f3feaa702effd8b73ecd838c1ace04fa87",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 1b42072ce..4ca591f18 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -42,7 +42,7 @@ Skill selection and activation within every workflow follow `.agents/skills.md`
 
 ## Tracker reporting
 
-Every phase carries its explicit repo-info session into fileless reports and workflow start. The engine binds that session to the exact run so later step reports retain the same invocation. Auto and its dispatched phase keep separate invocations. A resumed exact run keeps its original association; an unrelated run never supplies one.
+Every phase carries its explicit repo-info session into fileless reports and workflow start. The engine binds that session to the exact run, and records the run's link on its `workflow-started` row, so later step reports retain the same invocation. Auto and its dispatched phase keep separate invocations. A resumed exact run keeps its original association; an unrelated run never supplies one.
 
 Routine reports may append to an eligible engine-owned progress comment. Attention reports and terminal summaries create new comments. All tracker reporting, including preparation, MCP fallback and friction, is nonfatal: attempt the report or an applicable skip, then continue substantive work. When fallback is available, publish `commentFile` byte-for-byte as one new comment and never edit prior tracker content. See `.bkit/trackers.md` § Workflow comment delivery for ownership, reconciliation and recovery.
 
@@ -287,7 +287,7 @@ Rationale: keeping per-run state on `feat/{FID}` removes the divergence between
 <!-- prettier-ignore -->
 | Event | Shape | Meaning |
 | --- | --- | --- |
-| `workflow-started` | `{type, workflow, at, parentSha, limits?}` | Opens a new run of a phase workflow. `limits` holds the workflow's ask point settings as `package.json` gave them when the run started; `counters route` reads them for the whole run (§ Ask points). |
+| `workflow-started` | `{type, workflow, at, parentSha, limits?, progress?}` | Opens a new run of a phase workflow. `progress` is the run's comment link, written by `workflows start` from the session's random id; every post that names the run's status file reads it. `limits` holds the workflow's ask point settings as `package.json` gave them when the run started; `counters route` reads them for the whole run (§ Ask points). |
 | `step-done` | `{type, workflow, step, status, at, parentSha, artifacts, verdict?, attempt?, group?, failures?, strategy?, scope?, round?, clamped?, challengeFindings?, uncommitted?}` | One completed step (the bulk). Challenge snapshots are described under § Summary / handover step. |
 | `allowance-granted` | `{type, workflow, at, point, group?, value}` | The owner chose to go on at a used-up limit: one more full allowance of `maxAttempts` for that ask point (and group). Written by `bkit counters grant`; counted by `counters route` / `counters max` and `challenge merge --round` (§ Ask points). Not folded. |
 | `workflow-meta` | `{type, workflow, at, …fields}` | Workflow-level metadata merged onto the run (e.g. `debugAttempt`). |
@@ -473,7 +473,7 @@ The lock is `docs/plans/{YYYYMM}/logs/{FID}/.lock` under the main checkout (ever
 
 Every workflow step posts a new tracker comment. Never edit, paraphrase, summarise, truncate, deduplicate, or reorder prior content. Each step is independent: no comment ID is carried forward, and no bodies are concatenated. `bkit issues comment` builds every body below (`--kind=step|failure|handover|audit`, header fields in flag order, `###### bkit:generated` first, a copied whole-line cut marker defused, stderr fenced) and prints it. With `--post` the verb that builds a comment (`steps finish`, `issues comment`, `workflows fail` / `handover` / `close` / `links`) posts it itself — GitHub through `gh` (`BKIT_GH_TOKEN` as `GH_TOKEN`), Linear through its GraphQL API (`BKIT_LINEAR_API_KEY`), Jira through the Rovo MCP server over HTTP (`BKIT_JIRA_API_KEY`; a body over 32,767 characters goes as consecutive `_(part i/n)_` comments) — and prints `tracker`: `{done: true, action, url, deduped?}`, `{done: false, action, reason}` (`network` | `auth` | `scope` | `rate-limit` | `not-found` | `http-<n>`; the exit code is the verb's own) or `{skipped: no-issue | tracker-none}`. Every verb that prints a `comment` also writes it byte-for-byte to `tmp/bkit-comment-{hash}.md` at the checkout root and prints that path as `commentFile` (after any commit the verb makes, so no commit carries it); `prs open` / `branches land` stage `open` print the PR body's file as `bodyFile` on exit 80. Text output escapes a multi-line value onto one line, so when `tracker.done` = false, the workflow posts the content of `commentFile` through the tracker MCP (the header's **Comments** line), never the printed `comment`.
 
-**Posted once.** With a run's `status.jsonl` the verb records the post as an `engine-action` row (`.bkit/jsonl.md` § status.jsonl), keyed by workflow, run, step and the comment's kind. A re-run with the same body finds the row and prints `deduped: true` without posting. An edited body posts again. `steps finish --post`, `issues comment --post --file=`, and `workflows fail --post` with the run's `--token` write the row before the run's next commit. The rest (`issues comment` without `--file`, `workflows handover` / `close` / `links`, whose posts come after their record is pushed or committed) check the issue's last 5 comments for the same marker hash: the hash survives the tracker's markdown rewrite, Jira's HTML page and the `_(part i/n)_` split, so a match is `deduped: true`. A status.jsonl write that fails after a post prints `done: true` with a `warning`.
+**Posted once.** With a run's `status.jsonl` the verb records the post as an `engine-action` row (`.bkit/jsonl.md` § status.jsonl), keyed by workflow, run, step and the comment's kind. A re-run with the same body finds the row and prints `deduped: true` without posting. An edited body posts again. `steps finish --post`, `issues comment --post --file=`, and `workflows fail --post` with the run's `--token` write the row before the run's next commit. A `--file` post after its run ended is keyed to that run, not the next one. The rest (`issues comment` without `--file`, `workflows handover` / `close` / `links`, whose posts come after their record is pushed or committed) check the issue's last 5 comments for the same marker hash: the hash survives the tracker's markdown rewrite, Jira's HTML page and the `_(part i/n)_` split, so a match is `deduped: true`. A status.jsonl write that fails after a post prints `done: true` with a `warning`.
 
 **Run proof required.** `bkit issues comment` refuses, with and without `--post`, any call that carries no proof that a workflow or audit run is making it, and exits 2 with a message that points at plain markdown through the tracker MCP. The three proofs are a `--session-dir` folder directly under the Git-common `bkit-outbox/sessions/`, a `--file` status file holding a run, and an audit call with `--kind=audit`, `--audit-slug` and a `--body-file` in that audit's own `audit-{slug}` outbox folder. Work comments outside a workflow go as plain markdown through the tracker MCP (`.agents/rules.md` § Tracker work comments), because a `###### bkit:generated` line makes later workflows drop the comment (§ Tracker context filtering).
 
diff --git a/.claude/commands/bkit-design.md b/.claude/commands/bkit-design.md
index 7c1da7147..9707f10c1 100644
--- a/.claude/commands/bkit-design.md
+++ b/.claude/commands/bkit-design.md
@@ -571,11 +571,11 @@ description: "Design Feature — Autonomous design phase"
      Read: `{OUTBOX}/design-answers.md`.
      Update: `docs/plans/{YYYYMM}/{FID}-design.md`.
      **If** `Verdict` = FAIL → tell the user which answer stays unapplied, never the **Failure Path**.
-   - Commit `docs/plans/{YYYYMM}/{FID}-design.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md" --session-dir="{SESSION_DIR}"
+     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md" --file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
      ```
+   - Commit `docs/plans/{YYYYMM}/{FID}-design.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
 
 ### 🔒 Gate 12 — Close Workflow
 
diff --git a/.claude/commands/bkit-plan.md b/.claude/commands/bkit-plan.md
index 6da84313e..c049f0950 100644
--- a/.claude/commands/bkit-plan.md
+++ b/.claude/commands/bkit-plan.md
@@ -487,15 +487,15 @@ Before generating, ask the engine for this step's invocation id and keep the pri
      cd "{REPO_ROOT}" && "{BKIT}" tests plan-check --plan=docs/plans/{YYYYMM}/{FID}-plan.md --existence=refuse --log={OUTBOX}/plan-answers-check.md
      ```
      Route — first match wins:
-     - **If** exit 0 → the commit below.
+     - **If** exit 0 → the next bullet.
      - **If** this is the second exit 1 → tell the user what `{OUTBOX}/plan-answers-check.md` names, and commit nothing from this round.
      - **If** exit 1 → invoke `@bkit-plan-update` again with Context `"Fix only what '{OUTBOX}/plan-answers-check.md' names; edit only those lines, do not seed the file again."`, Update: `docs/plans/{YYYYMM}/{FID}-plan.md` → re-run this sub-step.
      - **Else** → tell the user what the command printed, and commit nothing from this round.
-   - Commit `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md" --session-dir="{SESSION_DIR}"
+     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md" --file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
      ```
+   - Commit `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
 
 ### 🔒 Gate 8 — Close Workflow
 
diff --git a/.cursor/commands/bkit-design.md b/.cursor/commands/bkit-design.md
index 94bd3499c..0a5e09992 100644
--- a/.cursor/commands/bkit-design.md
+++ b/.cursor/commands/bkit-design.md
@@ -570,11 +570,11 @@ Design Feature — Autonomous design phase
      Read: `{OUTBOX}/design-answers.md`.
      Update: `docs/plans/{YYYYMM}/{FID}-design.md`.
      **If** `Verdict` = FAIL → tell the user which answer stays unapplied, never the **Failure Path**.
-   - Commit `docs/plans/{YYYYMM}/{FID}-design.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md" --session-dir="{SESSION_DIR}"
+     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md" --file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
      ```
+   - Commit `docs/plans/{YYYYMM}/{FID}-design.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
 
 ### 🔒 Gate 12 — Close Workflow
 
diff --git a/.cursor/commands/bkit-plan.md b/.cursor/commands/bkit-plan.md
index 0a3a046d3..07ce07134 100644
--- a/.cursor/commands/bkit-plan.md
+++ b/.cursor/commands/bkit-plan.md
@@ -486,15 +486,15 @@ Before generating, ask the engine for this step's invocation id and keep the pri
      cd "{REPO_ROOT}" && "{BKIT}" tests plan-check --plan=docs/plans/{YYYYMM}/{FID}-plan.md --existence=refuse --log={OUTBOX}/plan-answers-check.md
      ```
      Route — first match wins:
-     - **If** exit 0 → the commit below.
+     - **If** exit 0 → the next bullet.
      - **If** this is the second exit 1 → tell the user what `{OUTBOX}/plan-answers-check.md` names, and commit nothing from this round.
      - **If** exit 1 → invoke `@bkit-plan-update` again with Context `"Fix only what '{OUTBOX}/plan-answers-check.md' names; edit only those lines, do not seed the file again."`, Update: `docs/plans/{YYYYMM}/{FID}-plan.md` → re-run this sub-step.
      - **Else** → tell the user what the command printed, and commit nothing from this round.
-   - Commit `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md" --session-dir="{SESSION_DIR}"
+     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md" --file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
      ```
+   - Commit `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
 
 ### 🔒 Gate 8 — Close Workflow
 
diff --git a/.opencode/commands/bkit-design.md b/.opencode/commands/bkit-design.md
index 4e91d9f79..1310e7242 100644
--- a/.opencode/commands/bkit-design.md
+++ b/.opencode/commands/bkit-design.md
@@ -574,11 +574,11 @@ $ARGUMENTS
      Read: `{OUTBOX}/design-answers.md`.
      Update: `docs/plans/{YYYYMM}/{FID}-design.md`.
      **If** `Verdict` = FAIL → tell the user which answer stays unapplied, never the **Failure Path**.
-   - Commit `docs/plans/{YYYYMM}/{FID}-design.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md" --session-dir="{SESSION_DIR}"
+     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=design --step-number=12 --step-title="Owner Answers" --body-file="{OUTBOX}/design-answers.md" --file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
      ```
+   - Commit `docs/plans/{YYYYMM}/{FID}-design.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
 
 ### 🔒 Gate 12 — Close Workflow
 
diff --git a/.opencode/commands/bkit-plan.md b/.opencode/commands/bkit-plan.md
index 40d812caf..1f18fe9a8 100644
--- a/.opencode/commands/bkit-plan.md
+++ b/.opencode/commands/bkit-plan.md
@@ -490,15 +490,15 @@ Before generating, ask the engine for this step's invocation id and keep the pri
      cd "{REPO_ROOT}" && "{BKIT}" tests plan-check --plan=docs/plans/{YYYYMM}/{FID}-plan.md --existence=refuse --log={OUTBOX}/plan-answers-check.md
      ```
      Route — first match wins:
-     - **If** exit 0 → the commit below.
+     - **If** exit 0 → the next bullet.
      - **If** this is the second exit 1 → tell the user what `{OUTBOX}/plan-answers-check.md` names, and commit nothing from this round.
      - **If** exit 1 → invoke `@bkit-plan-update` again with Context `"Fix only what '{OUTBOX}/plan-answers-check.md' names; edit only those lines, do not seed the file again."`, Update: `docs/plans/{YYYYMM}/{FID}-plan.md` → re-run this sub-step.
      - **Else** → tell the user what the command printed, and commit nothing from this round.
-   - Commit `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
    - **Skip if** `ISSUE_ID` empty. Comment — this round's answers:
      ```bash
-     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md" --session-dir="{SESSION_DIR}"
+     cd "{REPO_ROOT}" && "{BKIT}" issues comment --post --issue="{ISSUE_ID}" --workflow=plan --step-number=8 --step-title="Owner Answers" --body-file="{OUTBOX}/plan-answers.md" --file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
      ```
+   - Commit `docs/plans/{YYYYMM}/{FID}-plan.md`, `docs/plans/{YYYYMM}/logs/{FID}/plan-answers-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` and, when a row was written, `docs/decisions.jsonl` on `dev`, those files only, with the message `docs({FID}): owner answers bkit [skip ci]`. NEVER push.
 
 ### 🔒 Gate 8 — Close Workflow
 
diff --git a/docs/architecture.md b/docs/architecture.md
index 5662b21c1..951759f76 100644
--- a/docs/architecture.md
+++ b/docs/architecture.md
@@ -96,11 +96,11 @@ Adopted project documents and their index rows below the managed block remain pr
 
 ### Tracker reporting boundary
 
-The command layer supplies the run or session identity, the adapter delivers the tracker comment and a private outbox in Git's common directory retains delivery state across linked worktrees. A run's authoritative progress lives in its checkout records. See `.bkit/core/engine/commands/workflow/tracker.ts` and [Data schema](data-schema.md).
+The command layer supplies the run or session identity, the adapter delivers the tracker comment and a private outbox in Git's common directory retains delivery state across linked worktrees. A run's authoritative progress, including its comment link on the `workflow-started` row, lives in its checkout records. See `.bkit/core/engine/commands/workflow/tracker.ts` and [Data schema](data-schema.md).
 
 ### Knowledge / Decisions JSONL Ledgers
 
-The ledger layer owns row encoding, mutation and replay receipts. The checkout holds the shared records, while the Git-common outbox holds private invocation and operation receipts. See `.bkit/core/engine/ledgers/` and [Ledger contracts](../.bkit/jsonl.md).
+The ledger layer owns row encoding, mutation and replay receipts. The checkout holds the shared records, while the Git-common outbox holds private operation receipts. See `.bkit/core/engine/ledgers/` and [Ledger contracts](../.bkit/jsonl.md).
 
 ### Roadmap Ledger & Board
 
diff --git a/docs/security.md b/docs/security.md
index 664079f93..4e9644f3d 100644
--- a/docs/security.md
+++ b/docs/security.md
@@ -137,9 +137,9 @@ Prose never substitutes for token scope.
 
 Only explicit session or exact-run ownership authorizes editing an engine progress comment. Session directories must resolve inside the repository's Git-common session directory. Another active run, a human comment or provider-returned text cannot grant ownership. Remote text is used only to recognize an owned delivery; replacement bodies come from locally cached source reports.
 
-`bkit issues comment` refuses a call with no workflow-run proof, which stops an agent from posting a comment that carries the `bkit:generated` marker by accident (`.bkit/workflows.md` § Comment Lifecycle). It is not a boundary: any local caller can supply one of the accepted proofs, and a session proof names a folder that need not exist any more, so the marker says nothing about who posted the comment.
+`bkit issues comment` refuses a call with no workflow-run proof, which stops an agent from posting a comment that carries the `bkit:generated` marker by accident (`.bkit/workflows.md` § Comment Lifecycle). It is not a boundary: any local caller can supply one of the accepted proofs, and a session proof names a folder that need not exist any more (the run's link lives in its `status.jsonl`, not in the folder), so the marker says nothing about who posted the comment.
 
-Optional progress and invocation files stay under Git-common `bkit-outbox`, outside committed content, with private file permissions. Missing or invalid ownership evidence causes a new comment. MCP fallback is create-only and publishes the existing fallback file verbatim. Reporting diagnostics exclude report bodies, credentials and personal data; see `observability.md` § Tracker reporting diagnostics.
+The outbox holds the progress source cache and the session folders, whose names are random session ids; it stays under Git-common `bkit-outbox`, outside committed content, with private file permissions. The run's committed `progress` link holds no path. Missing or invalid ownership evidence causes a new comment. MCP fallback is create-only and publishes the existing fallback file verbatim. Reporting diagnostics exclude report bodies, credentials and personal data; see `observability.md` § Tracker reporting diagnostics.
 
 ## Secrets
 
diff --git a/docs/testing.md b/docs/testing.md
index 25a56b771..56e44d594 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -996,7 +996,7 @@ Tests that compare against text an older bkit shipped read it from `tests/fixtur
 
 ### Routine tracker reporting coverage
 
-`commands/workflow/tracker.integration.test.ts` runs the real CLI against real Git repositories, linked worktrees and persistent provider stand-ins. It covers session-to-run ownership, independent and resumed invocations, routine append, terminal summaries, source loss and nonfatal transport failures. Tracker unit tests cover bounded provider reads, local-source reconstruction, capacity rollover and redacted friction. Rendered workflow audits check all five hosts and all four tracker settings for explicit association, create-only verbatim fallback and attempted-report gates.
+`commands/workflow/tracker.integration.test.ts` runs the real CLI against real Git repositories, linked worktrees and persistent provider stand-ins. It covers session-to-run ownership, a post after the run closed joining the run's comment, a status file moved to the main checkout, independent and resumed invocations, routine append, terminal summaries, source loss and nonfatal transport failures. Tracker unit tests cover bounded provider reads, local-source reconstruction, capacity rollover and redacted friction. Rendered workflow audits check all five hosts and all four tracker settings for explicit association, create-only verbatim fallback and attempted-report gates.
 
 Live provider probes are opt-in and use disposable issues or tickets under an explicitly authorized account. Verify newest-created pagination, update semantics, provider body counting and capacity rejection, and cleanup before recording a verified ceiling. Local stand-ins establish application behavior, not a live provider limit. Keep unresolved provider limits conservative and record unverified assumptions with the probe evidence.
 
