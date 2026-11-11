diff --git a/.agents/plugins/bkit/agents/bkit-audit-generate.md b/.agents/plugins/bkit/agents/bkit-audit-generate.md
index 785e2942e..d7f70bbfe 100644
--- a/.agents/plugins/bkit/agents/bkit-audit-generate.md
+++ b/.agents/plugins/bkit/agents/bkit-audit-generate.md
@@ -112,7 +112,20 @@ tools:
      - **If** it exits non-zero → **STOP** and report the reason.
      - NEVER hand-write or edit the `bkit:anchor` block or the `bkit:outdated` line the stamp writes under it.
 3. Read every supplied input once at the start, and work from what it says, not from session memory. Do not re-read the template on every loop iteration.
-4. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+4. Read the `.agents/docs.md` index, and load the project documents the audit's surface needs, with or without a plan: `docs/architecture.md` for structure and boundaries, `docs/technology.md` for stack choices, `docs/security.md` for trust boundaries, `docs/testing.md` for test and gate rules, plus `docs/data-schema.md`, `docs/design.md`, `docs/observability.md`, `docs/deployments.md`, `docs/noise.md` or `docs/setup.md` when the audit's surface touches them.
+   - Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Mark an irrelevant topic not applicable, with the reason.
+   - Safeguards that need genuine evidence stay in force (secrets, permissions, untrusted input).
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "testing",
+       "gap": "missing",
+       "recommendedPath": "docs/testing.md",
+       "alternativeEvidence": "The CI workflow defines the lanes.",
+       "action": "Copy the testing starter and describe the project's tiers and lanes."
+     }
+     ```
 5. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
    - **If** a section has no content → `None`.
 6. Populate the template sections in template order, without changing the order. Take each section's shape from the template and every rule from this prompt, and verify every gate before you proceed:
diff --git a/.agents/plugins/bkit/agents/bkit-build-challenge-1.md b/.agents/plugins/bkit/agents/bkit-build-challenge-1.md
index 8bcd64131..d46588b64 100644
--- a/.agents/plugins/bkit/agents/bkit-build-challenge-1.md
+++ b/.agents/plugins/bkit/agents/bkit-build-challenge-1.md
@@ -53,7 +53,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/security.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each finding: append the entry at EOF with Bash `echo {log entry} >> {output}`.
    - **If** the entry spans several lines → append it with a heredoc instead.
    - **If** any finding is `CRITICAL` → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
diff --git a/.agents/plugins/bkit/agents/bkit-build-challenge-2.md b/.agents/plugins/bkit/agents/bkit-build-challenge-2.md
index 4c1a99cce..a5f6303ca 100644
--- a/.agents/plugins/bkit/agents/bkit-build-challenge-2.md
+++ b/.agents/plugins/bkit/agents/bkit-build-challenge-2.md
@@ -57,7 +57,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/security.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/security.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each finding: append the entry at EOF with Bash `echo {log entry} >> {output}`.
    - **If** the entry spans several lines → append it with a heredoc instead.
    - **If** any finding is `CRITICAL` → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
diff --git a/.agents/plugins/bkit/agents/bkit-build-install-skills.md b/.agents/plugins/bkit/agents/bkit-build-install-skills.md
index aa826b618..ecfc5b03e 100644
--- a/.agents/plugins/bkit/agents/bkit-build-install-skills.md
+++ b/.agents/plugins/bkit/agents/bkit-build-install-skills.md
@@ -47,7 +47,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Identify the technologies that the feature requires.
 4. List the folder names under `.agents/skills/`, without reading the folders' contents. Each folder name is the identity of one installed skill when you look for gaps.
 5. Identify each skill gap: a required technology that no folder name matches.
diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-convert.md b/.agents/plugins/bkit/agents/bkit-build-plan-convert.md
index bd40ec01d..ddb9faf92 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-convert.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-convert.md
@@ -60,10 +60,24 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
+   - Read the `.agents/docs.md` index, and consult the project documents the converted tasks need: always assess `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md`; add `docs/data-schema.md` when a task changes the database, `docs/design.md` for UI work, `docs/observability.md` for logging, `docs/deployments.md` for release or CI work, and `docs/noise.md` or `docs/setup.md` when a task touches them.
+     - Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+     - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Mark an irrelevant topic not applicable, with the reason.
+     - Record each topic, the path and section used, coverage, gap and action in the plan's `Documentation Consultation`, and put each `READ` / `UPDATE` line for these documents in the task that needs it.
+     - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+       ```jsonl
+       {
+         "topic": "security",
+         "gap": "starter-only",
+         "recommendedPath": "docs/security.md",
+         "alternativeEvidence": "The CI configuration defines token permissions.",
+         "action": "Populate the security document with the project's credential and permission boundaries."
+       }
+       ```
 2. Read `docs/templates/bkit-plan.md` § `Agent Execution Runbook` for the shape of a group and of a task block. The rules for filling them are the **Runbook tasks**, **TEST FIRST** and **TEST EXCEPTION** clauses above.
 3. Set up the plan file:
-   - **If** the plan file exists → keep every section except `Agent Execution Runbook` as written, and rewrite the runbook.
-   - **Else** → create the plan with `# {title} Implementation Plan`, `## Context & Goals` (the goal in 1-3 lines), `## Reuse Inventory` and `## Agent Execution Runbook`.
+   - **If** the plan file exists → keep every section except `Agent Execution Runbook` as written (add or refresh `Documentation Consultation` and `Documentation Warnings` from step 1), and rewrite the runbook.
+   - **Else** → create the plan with `# {title} Implementation Plan`, `## Context & Goals` (the goal in 1-3 lines), `## Documentation Consultation`, `## Documentation Warnings`, `## Reuse Inventory` and `## Agent Execution Runbook`.
    - In both cases, carry over every end state and test that the inputs name, in their order. You may tighten them, but never weaken them.
 4. Split the work into tasks, each one a testable change, and group the tasks in build order:
    - Keep each group within the per-group plan caps that your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all).
diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-current.md b/.agents/plugins/bkit/agents/bkit-build-plan-current.md
index dd2c5eb2e..43719d53b 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-current.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-current.md
@@ -52,7 +52,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each affected task: append the entry at EOF with Bash `echo {log entry} >> {output}`.
    - **If** the entry spans several lines → append it with a heredoc instead.
    - **If** any task `Broken` → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md b/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
index 93cb3554c..50f54ac2b 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
@@ -78,7 +78,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/testing.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Read the inputs, and find where to resume:
    - **If** Context `Mode` = `Holistic` → read the holistic verify report and every log. Each line of its `Identified Gaps Log` is one gap. Read the plan's task block of each task a gap names; no group gate log is supplied.
    - **Else** → read the group's briefs (their task blocks), the plan gaps, the group gate log when one is supplied, and every log. Each failure in the group gate log is one gap. In the logs, `DONE` = done and `BLOCKED` = blocked.
diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-tasks.md b/.agents/plugins/bkit/agents/bkit-build-plan-tasks.md
index 8ce527070..27212ed12 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-tasks.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-tasks.md
@@ -86,7 +86,7 @@ tools:
    - **If** **Create** already exists → set its `Verdict` to `PENDING` with `Edit`, and keep every log line.
    - **Else** → Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Read the supplied brief (`build-brief-{GROUP}-{n}.md`):
    - Its task blocks are the work, in order.
    - Its earlier tasks are context only.
diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-tests.md b/.agents/plugins/bkit/agents/bkit-build-plan-tests.md
index 655b7acf6..cb27129e0 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-tests.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-tests.md
@@ -65,7 +65,7 @@ tools:
    - **If** **Create** already exists → set its `Verdict` to `PENDING` with `Edit`, and keep every log line.
    - **Else** → Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Read the supplied brief (`build-brief-tests-{GROUP}-{n}.md`):
    - Its task blocks' `TEST FIRST` entries are the work, in order; the rest of each block says what the test is for.
    - Its `Derived Test Matrix rows` say what each test asserts.
diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-verify.md b/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
index 891e86175..062310214 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
@@ -58,7 +58,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
    - For each gap, append the entry at EOF with Bash `echo {log entry} >> {output}`.
      - **If** the entry spans several lines → append it with a heredoc instead.
diff --git a/.agents/plugins/bkit/agents/bkit-debug-abort-handover.md b/.agents/plugins/bkit/agents/bkit-debug-abort-handover.md
index b65c0641c..33698f5da 100644
--- a/.agents/plugins/bkit/agents/bkit-debug-abort-handover.md
+++ b/.agents/plugins/bkit/agents/bkit-debug-abort-handover.md
@@ -50,12 +50,13 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Extract `Rot Signals` from the diagnose attempts, and aggregate them into the handover: dedupe the slugs, and keep all the evidence.
 6. Extract `Out-of-Scope Recommendations` from the diagnose attempts, and aggregate them: dedupe the paths, and keep all the rationales.
-7. Append one row per failure to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
-8. Append one row per deferral to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
+7. Collect the `## Documentation Warnings` records from the diagnose, remediate and verify logs of the run, and copy them verbatim into the handover's `Documentation Warnings` section, dropping exact duplicates. Take no records from raw `*-input-*.md` files.
+8. Append one row per failure to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
+9. Append one row per deferral to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
 
 **Output format:**
 
@@ -98,6 +99,10 @@ tools:
 
 [Which option to take, and why. Initially set to `PENDING`.]
 
+## Documentation Warnings
+
+[The deduped records of the run's `## Documentation Warnings` sections, verbatim, in one `jsonl` fence with one JSON object per record. **If** none → `None`. Initially set to `PENDING`.]
+
 ## Reference Docs
 
 [The prior diagnoses, prior remediations, CI runs and observability evidence. Initially set to `PENDING`.]
diff --git a/.agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md b/.agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
index aff3f1803..23c6552e6 100644
--- a/.agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
+++ b/.agents/plugins/bkit/agents/bkit-debug-failure-diagnose.md
@@ -60,7 +60,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory. The CI and runtime logs are the primary signal.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` and `docs/noise.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Read `Strategy` from the input Context. **If** it is missing → set `Verdict` = `FAIL` in **Create**, change no other file, and go straight to the final return. Apply the matching strategy:
    - `STANDARD` → run a targeted diagnosis.
diff --git a/.agents/plugins/bkit/agents/bkit-debug-failure-remediate.md b/.agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
index d641ce748..119e74fd7 100644
--- a/.agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
+++ b/.agents/plugins/bkit/agents/bkit-debug-failure-remediate.md
@@ -57,7 +57,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each remediation: append `DONE|BLOCKED` at EOF with Bash `echo {log entry} >> {output}`.
 5. Read `Strategy` from the input Context. **If** it is missing → set `Verdict` = `FAIL` in **Create**, change no other file, and go straight to the final return. Apply the matching strategy:
    - `STANDARD` → apply the diagnosis as written.
diff --git a/.agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md b/.agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
index 1717eab0f..a2d9df417 100644
--- a/.agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
+++ b/.agents/plugins/bkit/agents/bkit-debug-failure-reproduce.md
@@ -52,7 +52,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory. The bug report in `debug-input-*.md` is the primary signal.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Choose where the tests go:
    - Pick the lowest tier that reaches the reported behaviours: unit before integration before e2e.
    - Co-locate them with the tests that cover the affected areas, and match those tests' imports, helpers and naming.
diff --git a/.agents/plugins/bkit/agents/bkit-debug-failure-soak.md b/.agents/plugins/bkit/agents/bkit-debug-failure-soak.md
index 6807d7c8f..c2fb4c706 100644
--- a/.agents/plugins/bkit/agents/bkit-debug-failure-soak.md
+++ b/.agents/plugins/bkit/agents/bkit-debug-failure-soak.md
@@ -61,7 +61,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Decide the single next step from the accumulated context:
    - **If** the cause is unknown → instrument the suspected surface: add `[DEBUG-OBSERVE]` logging, with no behaviour change.
    - **Else**:
diff --git a/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md b/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
index d1806f366..ccc327dfd 100644
--- a/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
+++ b/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-1.md
@@ -45,7 +45,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/technology.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Propose 2-3 approaches from the current constraints: existing code, minimal new infrastructure and the fastest path to ship.
    - Lead with the recommended approach.
    - Keep each approach in the existing stack, with no greenfield build and no hypothetical infrastructure.
diff --git a/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md b/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
index 19f99103f..eca47b257 100644
--- a/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
+++ b/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-2.md
@@ -43,7 +43,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/technology.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Propose 2-3 approaches from first principles: the best long-term shape if the existing constraints did not matter.
    - Lead with the recommended approach.
    - Ignore "we already have X" as a default.
diff --git a/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md b/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
index 4ec5c1f73..b1c44b6a7 100644
--- a/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
+++ b/.agents/plugins/bkit/agents/bkit-design-brainstorm-ideate-3.md
@@ -44,7 +44,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/security.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Propose 2-3 approaches framed by failure mode, not by happy-path shape.
    - Lead with the recommended approach.
    - For each approach, include additive risk-mitigation guidance to layer onto whichever approach is picked, not separate "safer" approaches.
diff --git a/.agents/plugins/bkit/agents/bkit-design-generate.md b/.agents/plugins/bkit/agents/bkit-design-generate.md
index 4b8ee220c..55f442a6b 100644
--- a/.agents/plugins/bkit/agents/bkit-design-generate.md
+++ b/.agents/plugins/bkit/agents/bkit-design-generate.md
@@ -57,7 +57,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Do not `cp` an existing input.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md`, `docs/technology.md` and `docs/security.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Identify the themes, complementary ideas, conflicts and related issues.
    - Layer the risk-premortem mitigations onto the selected approach. They are additive, not a separate approach.
diff --git a/.agents/plugins/bkit/agents/bkit-design-organise.md b/.agents/plugins/bkit/agents/bkit-design-organise.md
index 5c430272c..f27068871 100644
--- a/.agents/plugins/bkit/agents/bkit-design-organise.md
+++ b/.agents/plugins/bkit/agents/bkit-design-organise.md
@@ -54,7 +54,7 @@ tools:
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" steps stub --from="<Read>" --to="<Create>" --strip-header
    ```
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Identify the decomposition boundaries: domain boundaries, organisational structure and chronological dependencies. Do not use token or context-window size as a factor.
 5. Group the design work into workstreams at the identified boundaries.
 6. For each workstream:
diff --git a/.agents/plugins/bkit/agents/bkit-design-review-1.md b/.agents/plugins/bkit/agents/bkit-design-review-1.md
index 001f854b5..6d28b4700 100644
--- a/.agents/plugins/bkit/agents/bkit-design-review-1.md
+++ b/.agents/plugins/bkit/agents/bkit-design-review-1.md
@@ -58,7 +58,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/technology.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. For each major capability the design requires, search for prior art:
    - Search the repo: text search for names, strings, near-miss helpers and sibling modules, symbol references through the language server when one is configured, and `docs/capabilities.md` when present.
diff --git a/.agents/plugins/bkit/agents/bkit-design-review-2.md b/.agents/plugins/bkit/agents/bkit-design-review-2.md
index a7442907a..eb1e5cc85 100644
--- a/.agents/plugins/bkit/agents/bkit-design-review-2.md
+++ b/.agents/plugins/bkit/agents/bkit-design-review-2.md
@@ -57,7 +57,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/observability.md` and `docs/deployments.md` when they are present (warn and continue if either is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/observability.md` and `docs/deployments.md` when they are present (warn and continue if either is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. For each major component or flow, enumerate its failure modes:
    - What fails: an upstream dependency, internal logic, resource exhaustion, data corruption or partial state.
diff --git a/.agents/plugins/bkit/agents/bkit-design-spike.md b/.agents/plugins/bkit/agents/bkit-design-spike.md
index 0182af606..b06d0d14e 100644
--- a/.agents/plugins/bkit/agents/bkit-design-spike.md
+++ b/.agents/plugins/bkit/agents/bkit-design-spike.md
@@ -62,7 +62,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Restate each unknown in the review's `PoC Approach` and `Unknowns & Blockers` as one claim the design depends on and a probe could disprove:
    - Order the claims by blast radius.
diff --git a/.agents/plugins/bkit/agents/bkit-design-update.md b/.agents/plugins/bkit/agents/bkit-design-update.md
index 588c3684a..ef91ca842 100644
--- a/.agents/plugins/bkit/agents/bkit-design-update.md
+++ b/.agents/plugins/bkit/agents/bkit-design-update.md
@@ -57,7 +57,7 @@ tools:
    ```
    **If** the caller names **Update** and no **Create** → skip the seed: set the `Verdict` of **Update** to `PENDING`, and apply the findings to **Update** in place wherever the steps below name **Create**.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — apply findings via `Edit` as content becomes available.
 5. Apply every `CRITICAL` item. No consensus is required. **If** findings conflict → prefer the stricter wording.
 6. Apply each `OPTIONAL` item on merit. No consensus is required. **If** it conflicts with an applied `CRITICAL` item or expands scope → skip it.
diff --git a/.agents/plugins/bkit/agents/bkit-plan-generate.md b/.agents/plugins/bkit/agents/bkit-plan-generate.md
index 9662fff3a..07e73bd6b 100644
--- a/.agents/plugins/bkit/agents/bkit-plan-generate.md
+++ b/.agents/plugins/bkit/agents/bkit-plan-generate.md
@@ -100,7 +100,21 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Take its sections from `docs/templates/bkit-plan.md`.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read the `.agents/docs.md` index, and consult the project documents the plan needs. Always assess `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md`. Consult `docs/data-schema.md` for database changes, `docs/design.md` for UI, `docs/observability.md` for logging, `docs/deployments.md` for release or CI behaviour, and `docs/noise.md` or `docs/setup.md` when relevant.
+   - Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently.
+   - Mark an irrelevant topic not applicable, with the reason.
+   - Record each topic, the path and section actually used, coverage, gap, action, alternative evidence and remaining uncertainty in `Documentation Consultation`.
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "security",
+       "gap": "starter-only",
+       "recommendedPath": "docs/security.md",
+       "alternativeEvidence": "The CI configuration defines token permissions.",
+       "action": "Populate the security document with the project's credential and permission boundaries."
+     }
+     ```
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
    - Write each section group below before you read for the next group. Do not leave the writing to a final pass.
    - **If** a section has nothing to hold → `None`.
@@ -114,6 +128,7 @@ tools:
 7. Investigation & prerequisites:
    - `Open Questions & Assumptions`.
    - `Pre-Flight / Dependencies`.
+   - `Documentation Consultation` and `Documentation Warnings`, from step 3.
 8. Design:
    - `Alternative Approaches & Recommendations`.
    - `Data Schema Integration`.
@@ -137,6 +152,7 @@ tools:
       - Keep each group and task within the plan caps your Context names (`bkit.workflows.tasks`: tasks and `TEST FIRST` tests per group, tests and test files per task).
       - Put the groups in build order: a group's `DEPENDS ON` names only tasks in earlier groups or in its own group.
       - `READ` / `UPDATE` / `DELETE` name only symbols and files you opened this session. Open an unopened one first, or leave it out.
+      - Give each task that touches an assessed topic a `READ` line for its recommended document (or the indexed equivalent), and an `UPDATE` line for each document the task changes. A gap that the task cannot close stays in `Documentation Warnings`.
       - NEVER write `TEST EXCEPTION` of your own; copy each `TEST EXCEPTION` field an input writes into its task, word for word.
     - `Verification Plan` from Test Matrix and Execution Runbook.
 
diff --git a/.agents/plugins/bkit/agents/bkit-plan-review-1.md b/.agents/plugins/bkit/agents/bkit-plan-review-1.md
index c5dc04ed2..4fd028678 100644
--- a/.agents/plugins/bkit/agents/bkit-plan-review-1.md
+++ b/.agents/plugins/bkit/agents/bkit-plan-review-1.md
@@ -62,7 +62,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Check that the plan reflects its source, with no drift, no omissions and no silent expansion:
    - Design-coverage: **If** a design artifact exists (`docs/plans/{YYYYMM}/{FID}-design.md`, or one the input references):
diff --git a/.agents/plugins/bkit/agents/bkit-plan-review-2.md b/.agents/plugins/bkit/agents/bkit-plan-review-2.md
index b6b1685c4..3aac897e0 100644
--- a/.agents/plugins/bkit/agents/bkit-plan-review-2.md
+++ b/.agents/plugins/bkit/agents/bkit-plan-review-2.md
@@ -56,7 +56,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Trace the surface area of each `Agent Execution Runbook` task:
    - The files and modules it edits directly.
diff --git a/.agents/plugins/bkit/agents/bkit-plan-scope-check.md b/.agents/plugins/bkit/agents/bkit-plan-scope-check.md
index 5eacfa13e..cc8c26ca1 100644
--- a/.agents/plugins/bkit/agents/bkit-plan-scope-check.md
+++ b/.agents/plugins/bkit/agents/bkit-plan-scope-check.md
@@ -62,7 +62,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Check that every section `docs/templates/bkit-plan.md` mandates is present and filled in. A missing or broken section → `CRITICAL`.
 6. Check the scenario sections and the open questions:
diff --git a/.agents/plugins/bkit/agents/bkit-plan-update.md b/.agents/plugins/bkit/agents/bkit-plan-update.md
index 48fea814a..5a699f7a5 100644
--- a/.agents/plugins/bkit/agents/bkit-plan-update.md
+++ b/.agents/plugins/bkit/agents/bkit-plan-update.md
@@ -80,7 +80,19 @@ tools:
    ```
    **If** the caller names **Update** and no **Create** → skip the seed: set the `Verdict` of **Update** to `PENDING`, and apply the findings to **Update** in place wherever the steps below name **Create**.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read the `.agents/docs.md` index, and load the docs it lists for this task. Keep the plan's `Documentation Consultation` and `Documentation Warnings` sources as recorded.
+   - **If** a finding changes a topic the plan covers (architecture, technology, security, testing, data schema, UI, logging, release or setup) → re-consult its recommended document or indexed equivalent, update that topic's source, coverage, gap and action, and carry any new `READ` / `UPDATE` line into the task it touches.
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "security",
+       "gap": "starter-only",
+       "recommendedPath": "docs/security.md",
+       "alternativeEvidence": "The CI configuration defines token permissions.",
+       "action": "Populate the security document with the project's credential and permission boundaries."
+     }
+     ```
+   - Never drop an earlier warning the review did not resolve.
 4. Update **Create** — apply findings via `Edit` as content becomes available.
 5. Keep every `Agent Execution Runbook` task's `DONE WHEN` and `TEST FIRST` intact through the merge:
    - A critique may edit the task text around them.
diff --git a/.agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md b/.agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
index 48aa78eb5..00056a732 100644
--- a/.agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
+++ b/.agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
@@ -51,7 +51,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each substep: append the log entry at EOF with Bash `echo {log entry} >> {output}`.
 5. Confirm the merge state the caller left:
    - Record the branch head with `git rev-parse HEAD`, and append a log entry naming it.
diff --git a/.agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md b/.agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
index 15509616e..d87154fa1 100644
--- a/.agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
+++ b/.agents/plugins/bkit/agents/bkit-ship-deferred-sweep.md
@@ -53,7 +53,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Settle which file is the plan, then scan it for declared out-of-scope, future-work or non-goal items:
    - **If** no plan file exists:
diff --git a/.agents/plugins/bkit/agents/bkit-ship-update-docs.md b/.agents/plugins/bkit/agents/bkit-ship-update-docs.md
index 741df73f1..bc42f46e3 100644
--- a/.agents/plugins/bkit/agents/bkit-ship-update-docs.md
+++ b/.agents/plugins/bkit/agents/bkit-ship-update-docs.md
@@ -53,8 +53,12 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task.
    - Exclude `knowledge.jsonl` and `decisions.jsonl`.
+   - Check coverage before editing, for each of the ten recommended topics (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`) the shipped files touch: presence (absent or missing file), index accuracy (a row without a file, a file without a row, an `Equivalent to docs/{topic}.md` Scope cell), and project content (empty, or still the `.bkit/templates/docs/{topic}.md` starter).
+   - Mark an irrelevant topic not applicable, with the reason.
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Never report a clean sync while a relevant topic is absent or incomplete.
+   - Populate a relevant absent or starter-only document only within the ship's scope and from facts verified in the shipped files; otherwise report the gap.
 3. Read the history shipped this cycle:
    - Run `git rev-parse --is-shallow-repository`.
    - **If** it prints `true` → name the boundary commit in the output, and say that older history is unread.
@@ -65,6 +69,16 @@ tools:
 7. Fill `Pending Items` from the `ship-pending-items.md` deferral scan supplied in your Read paths, one entry per line.
    - Do not write `docs/deferrals.jsonl`.
 8. Produce the **Create** output.
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "testing",
+       "gap": "starter-only",
+       "recommendedPath": "docs/testing.md",
+       "alternativeEvidence": "The test runner configuration names the available tiers",
+       "action": "Populate the testing document with the lane graph and tier rules."
+     }
+     ```
 
 **Output format:**
 
@@ -79,6 +93,14 @@ tools:
 
 [For each file, which passes applied and which gaps closed. **If** none → `None`.]
 
+## Unresolved Coverage
+
+[Each topic that is absent, unindexed, empty, starter-only or undercovered after this run, with the evidence. Report it next to the edits above; it never makes the sync read as clean. **If** every relevant topic is covered → `None`.]
+
+## Documentation Warnings
+
+[The `jsonl` records from step 8. **If** no gaps → omit this section.]
+
 ## Pending Items
 
 [The `{FID}` matches from the `ship-pending-items.md` deferral scan, for human review. **If** no matches → `None`.]
diff --git a/.agents/plugins/bkit/agents/bkit-utility-update-decisions.md b/.agents/plugins/bkit/agents/bkit-utility-update-decisions.md
index 320d5c142..8959bcf3d 100644
--- a/.agents/plugins/bkit/agents/bkit-utility-update-decisions.md
+++ b/.agents/plugins/bkit/agents/bkit-utility-update-decisions.md
@@ -56,7 +56,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/decisions.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is `ACTIVE` or absent.
 4. Check each remaining entry against `docs/` and the codebase, never trusting the entry's own claims. Classify it, then apply its class:
    - `HOLDS` = docs or code confirm what the entry states, and none of them state otherwise → no change.
diff --git a/.agents/plugins/bkit/agents/bkit-utility-update-deferrals.md b/.agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
index 3d13c1582..9d34709b9 100644
--- a/.agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
+++ b/.agents/plugins/bkit/agents/bkit-utility-update-deferrals.md
@@ -53,7 +53,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/deferrals.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is not `CLOSED`.
 4. For each remaining entry, check in the codebase whether its work is done, never trusting the entry's own claims:
    - **If** it is done in code → set `status` to `CLOSED`, with `references` naming the evidence.
diff --git a/.agents/plugins/bkit/agents/bkit-utility-update-documentation.md b/.agents/plugins/bkit/agents/bkit-utility-update-documentation.md
index e9e655c27..84d038789 100644
--- a/.agents/plugins/bkit/agents/bkit-utility-update-documentation.md
+++ b/.agents/plugins/bkit/agents/bkit-utility-update-documentation.md
@@ -51,17 +51,33 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read the `.agents/docs.md` index as the full catalog of docs to check.
+2. Read the `.agents/docs.md` index as the catalog of docs to check, then check project documentation coverage before editing:
+   - **Presence:** for each of the ten recommended topics (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`), decide whether the change touched it (relevant) or not (not applicable, with the reason). Review every relevant topic, including one the index does not list and one whose file is absent or missing.
+   - **Index accuracy:** compare each `Project Documents` row with the repository. Report a row whose file is missing, a present file with no row, and an equivalent document (an indexed file whose Scope cell reads `Equivalent to docs/{topic}.md`).
+   - **Project content:** report a document that is empty or still the shipped starter (compare it with `.bkit/templates/docs/{topic}.md`); an irrelevant topic is not a gap. A document that differs from the starter is a candidate: assess its coverage against the code, and never call it complete from a mechanical check.
+   - **Populate** a relevant absent, empty or starter-only document only within the authorized scope and only with facts you verified in the repository; copy the starter from `.bkit/templates/docs/`, fill it in, and add its row to `Project Documents`. **If** the evidence is not there → leave the document alone and report the gap.
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Never report a clean sync while a relevant topic is absent or incomplete.
 3. Per doc, always follow its `Rules` headers when making edits.
 4. Per doc, four passes in order: Sync content (gaps vs implementation) → reorganize structure (dedupe, move misplaced) → compress wording (more token-efficient) → update cross-references (inline `docs/*.md` links).
-5. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory.
-6. Collect setup tips:
+5. Record the coverage result:
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "testing",
+       "gap": "starter-only",
+       "recommendedPath": "docs/testing.md",
+       "alternativeEvidence": "The test runner configuration names the available tiers",
+       "action": "Populate the testing document with the lane graph and tier rules."
+     }
+     ```
+6. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory.
+7. Collect setup tips:
    ```bash
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" tips --workflow=utility
    ```
    - Hold stdout as `BKIT_TIPS`. It is plain text, not JSON.
    - **If** it prints nothing or exits non-zero → `BKIT_TIPS` is empty.
-7. Final return: Display the output format verbatim as the final message to the user. Do not summarise or trim it.
+8. Final return: Display the output format verbatim as the final message to the user. Do not summarise or trim it.
    - Append a `## Suggested Replies` heading.
    - Append `Would you like me to explain any of this in plain English? Then write 'yes, explain in plain english'.`
    - **If** `BKIT_TIPS` is not empty:
@@ -81,6 +97,14 @@ tools:
 
 [For each file, which passes applied and which gaps closed. **If** none → `None`.]
 
+## Project Documentation Coverage
+
+[One row per topic: recommended path, state (populated, starter-only, empty, absent or not-applicable), index accuracy, and evidence. A coverage gap here is never `None`.]
+
+## Documentation Warnings
+
+[The `jsonl` records from step 5. **If** no gaps → omit this section.]
+
 ## Memories
 
 [Each memory rewrite: memory path, pointer. **If** none → `None`.]
diff --git a/.agents/plugins/bkit/agents/bkit-utility-update-failures.md b/.agents/plugins/bkit/agents/bkit-utility-update-failures.md
index ebb8117b9..dd8271bd1 100644
--- a/.agents/plugins/bkit/agents/bkit-utility-update-failures.md
+++ b/.agents/plugins/bkit/agents/bkit-utility-update-failures.md
@@ -55,7 +55,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/failures.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is not `CLOSED`.
 4. For each remaining entry, check in the codebase whether its work is done, never trusting the entry's own claims:
    - For `category` `testing`, the winning row's `updates` is the flake count. Only a landed deterministic fix counts as done, never a recent green run.
diff --git a/.agents/plugins/bkit/agents/bkit-utility-update-knowledge.md b/.agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
index d97f9eb27..9ae12560d 100644
--- a/.agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
+++ b/.agents/plugins/bkit/agents/bkit-utility-update-knowledge.md
@@ -57,7 +57,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/knowledge.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is `ACTIVE` or absent.
 4. Check each remaining entry against `docs/` and the codebase, never trusting the entry's own claims. Classify it, then apply its class:
    - `HOLDS` = docs or code confirm what the entry states, and none of them state otherwise → no change.
diff --git a/.agents/plugins/bkit/agents/bkit-utility-update-roadmap.md b/.agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
index a4302f821..8bfa0bc89 100644
--- a/.agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
+++ b/.agents/plugins/bkit/agents/bkit-utility-update-roadmap.md
@@ -57,7 +57,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Refresh `docs/roadmap.md` with `bkit roadmap fold` (the main checkout's `node_modules/.bin/bkit`):
    - **If** it fails → **STOP**.
    - Read the refreshed file in full. Its `bkit` block is a list of `FID`s.
diff --git a/.agents/plugins/bkit/agents/bkit-utility-update-tracker.md b/.agents/plugins/bkit/agents/bkit-utility-update-tracker.md
index 793850033..aca277002 100644
--- a/.agents/plugins/bkit/agents/bkit-utility-update-tracker.md
+++ b/.agents/plugins/bkit/agents/bkit-utility-update-tracker.md
@@ -61,7 +61,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Read repo facts:
    ```bash
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" repo info --allow-detached
diff --git a/.agents/plugins/bkit/skills/bkit-auto/SKILL.md b/.agents/plugins/bkit/skills/bkit-auto/SKILL.md
index d90cad828..1d8d88a7a 100644
--- a/.agents/plugins/bkit/skills/bkit-auto/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-auto/SKILL.md
@@ -117,6 +117,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 2. `REF` is the issue as `runs context` printed it (`#N` on GitHub, the key uppercased on Linear / Jira, empty with no tracker).
    - Never pass a bare `FID` or bare number: the dispatched workflow's Step 1 stops when no issue reference matches. It never creates an issue.
 3. Invoke the matching phase skill with the `view_file` tool, then exit.
+   The dispatched phase writes its own `## Documentation Warnings` in its summary. Forward that output as it is; do not collect or repeat it here.
    Route:
    - `PHASE` = `ship` → `/bkit-ship {FID} {REF}`
    - `PHASE` = `debug` → `/bkit-debug {FID} {REF} https://github.com/{OWNER_REPO}/actions/runs/{RUN_ID}` when `RUN_ID` is held; otherwise `/bkit-debug {FID} {REF}`.
diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index 1290d3998..50193cff3 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -460,6 +460,7 @@ description: "Build Feature — Autonomous implementation"
    Context: You are a subagent in the Build phase. Write the plan in task-block form. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. **If** `CONVERT_RETRY` is held → add `Your last plan failed the plan check: {CONVERT_RETRY}. Fix only those problems.` **If** `NEWER_COMMENTS` > 0 → add `{NEWER_COMMENTS} issue comments are newer than the plan; write what they change into it.` Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Check command: `"{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"`.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md` (if present), `docs/templates/bkit-plan.md`.
    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
+   Project documents: the converted plan carries `Documentation Consultation` and `Documentation Warnings`, and each task that touches an assessed topic names its `READ` / `UPDATE` documents. Later steps read those sources and warn from applicable tasks; a missing or starter-only document warns and the run continues.
 3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
@@ -1081,6 +1082,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" workflows summary --workflow=build --file="{STATUS}" --publish={PUBLISH}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 3. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --number=15 --post --title=Summary --link-ref={BRANCH} --comment-body --message="chore({FID}): summary"
diff --git a/.agents/plugins/bkit/skills/bkit-debug/SKILL.md b/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
index 7908c82fd..af2420588 100644
--- a/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
@@ -461,6 +461,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    Read: `{CI_SELECTION_FILE}`, `docs/plans/{YYYYMM}/logs/{FID}/debug-input-{DEBUG_ATTEMPT}.md`, the current-generation `context-*` artifacts recorded in Step 4.
    Update: Test files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-reproduce-{NORMAL_ATTEMPT}.md`.
+   Project documents: a debug run has no plan, so the subagents read the `.agents/docs.md` index and consult `docs/testing.md` for the test tiers and `docs/noise.md` for registered signal downgrades (also `docs/observability.md` or `docs/architecture.md` when they are present and relevant to the failure). A missing index or a missing, empty or starter-only document is a warning: continue from repository evidence, and record the gap in `## Documentation Warnings`. A handover keeps the unresolved warnings.
 2. Finish — commits the test:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-failure-reproduce --field=ciGeneration={CI_GENERATION} --attempt-of=debug-run-tests:current --agent=bkit-debug-failure-reproduce --artifact="docs/plans/{YYYYMM}/logs/{FID}/debug-failure-reproduce-<attempt>.md" --message="test({FID}): reproduce reported failure" --number=5 --post --title="Failure Reproduce"
@@ -604,6 +605,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    "{BKIT}" workflows summary --workflow=debug --file="{STATUS}"
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 2. Finish:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md --message="chore({FID}): summary" --verbose-ci-local --number=10 --post --title="Summary" --link-ref={BRANCH} --comment-body
diff --git a/.agents/plugins/bkit/skills/bkit-design/SKILL.md b/.agents/plugins/bkit/skills/bkit-design/SKILL.md
index 8b56f8ece..cdc19b8ab 100644
--- a/.agents/plugins/bkit/skills/bkit-design/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-design/SKILL.md
@@ -333,6 +333,7 @@ description: "Design Feature — Autonomous design phase"
    Context: You are a subagent in the Design phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Inputs carry distinct lenses. Merge across them, and do not collapse them to a consensus.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/design-input-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-1.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-2.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-3.md`, `docs/plans/{YYYYMM}/logs/{FID}/related-issues.md` (if present), `docs/plans/{YYYYMM}/{FID}-design.md` (if present — superseded design, context only, not a constraint).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md`.
+   Project documents: a design needs no plan, so the subagent reads the `.agents/docs.md` index and consults `docs/architecture.md` (boundaries and topology), plus `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/design.md`, `docs/observability.md` or `docs/deployments.md` when the design touches them. A missing index or a missing, empty or starter-only document is a warning: continue from repository evidence, and record the gap in `## Documentation Warnings` (one `jsonl` record per gap with `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action`).
 2. Finish:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=design --step=design-generate --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md --message="chore({FID}): design-generate" --number=5 --post --title="Generate Design" --link-ref=dev
@@ -452,6 +453,7 @@ description: "Design Feature — Autonomous design phase"
    "{BKIT}" workflows summary --workflow=design --file="{STATUS}"
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 3. Finish, then push with exactly one command:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=design --step=design-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/design-summary.md --message="chore({FID}): summary bkit [skip ci]" --number=10 --post --title=Summary --link-ref=dev --comment-body
diff --git a/.agents/plugins/bkit/skills/bkit-plan/SKILL.md b/.agents/plugins/bkit/skills/bkit-plan/SKILL.md
index 280f81917..19540312a 100644
--- a/.agents/plugins/bkit/skills/bkit-plan/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-plan/SKILL.md
@@ -221,6 +221,7 @@ description: "Plan Feature — Autonomous plan generation"
    Context: You are a subagent in the Plan phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. Workstreams this plan covers: {WORKSTREAMS}.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present — superseded plan, context only, not a constraint).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`.
+   Project documents: `@bkit-plan-generate` fills `Documentation Consultation` and `Documentation Warnings` in the plan. The review and apply-review steps keep those sources; a gap is a warning that continues the run, never a stop.
    **If** the draft still holds `PENDING` → invoke `@bkit-plan-generate` once more with Context `"Fill only the sections still marked PENDING and the empty groups; leave every finished section as it is."` and the plan caps and workstreams above, Read: the same inputs, Update: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`.
 2. Check the draft's groups and task blocks, and that every symbol it names exists:
    ```bash
@@ -388,6 +389,7 @@ description: "Plan Feature — Autonomous plan generation"
    "{BKIT}" workflows summary --workflow=plan --file="{STATUS}" --plan={PLAN_FINAL}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 4. Finish, then push the summary commit:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/plan-summary.md --message="chore({FID}): summary bkit [skip ci]" --number=7 --post --title=Summary --link-ref=dev --comment-body
diff --git a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
index 5d2e0278b..7755a392f 100644
--- a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
@@ -462,6 +462,7 @@ description: "Ship Feature — Autonomous merge and archive"
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`), `{OUTBOX}/ship-pending-items.md`.
    Update: Doc files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md`.
+   Documentation maintenance findings (unresolved coverage and the `## Documentation Warnings` records) stay in the ship summary next to the edits; a missing document is reported and the ship continues.
 3. Wait for the subagent to complete. Then append the `SHIPPED` row to the worktree ledger, re-render the mechanical `roadmap-status` board from it, and finish the step (bookkeeping to `$BOOK_ROOT`). The block exits 1 when the row did not land:
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
@@ -472,6 +473,7 @@ description: "Ship Feature — Autonomous merge and archive"
    "{BKIT}" workflows summary --workflow=ship --file="{STATUS}" --pr={PR_NUMBER}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 5. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --commit=none --number=6 --post --title="Update Docs & Summary" --link-ref=dev --comment-body
diff --git a/.agents/skills/bkit-auto/SKILL.md b/.agents/skills/bkit-auto/SKILL.md
index 788cab5c7..74071445a 100644
--- a/.agents/skills/bkit-auto/SKILL.md
+++ b/.agents/skills/bkit-auto/SKILL.md
@@ -117,6 +117,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 2. `REF` is the issue as `runs context` printed it (`#N` on GitHub, the key uppercased on Linear / Jira, empty with no tracker).
    - Never pass a bare `FID` or bare number: the dispatched workflow's Step 1 stops when no issue reference matches. It never creates an issue.
 3. Invoke the matching phase skill with the `Skill` tool, then exit.
+   The dispatched phase writes its own `## Documentation Warnings` in its summary. Forward that output as it is; do not collect or repeat it here.
    Route:
    - `PHASE` = `ship` → `/bkit-ship {FID} {REF}`
    - `PHASE` = `debug` → `/bkit-debug {FID} {REF} https://github.com/{OWNER_REPO}/actions/runs/{RUN_ID}` when `RUN_ID` is held; otherwise `/bkit-debug {FID} {REF}`.
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index 437e0a919..93a59045c 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -460,6 +460,7 @@ description: "Build Feature — Autonomous implementation"
    Context: You are a subagent in the Build phase. Write the plan in task-block form. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. **If** `CONVERT_RETRY` is held → add `Your last plan failed the plan check: {CONVERT_RETRY}. Fix only those problems.` **If** `NEWER_COMMENTS` > 0 → add `{NEWER_COMMENTS} issue comments are newer than the plan; write what they change into it.` Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Check command: `"{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"`.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md` (if present), `docs/templates/bkit-plan.md`.
    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
+   Project documents: the converted plan carries `Documentation Consultation` and `Documentation Warnings`, and each task that touches an assessed topic names its `READ` / `UPDATE` documents. Later steps read those sources and warn from applicable tasks; a missing or starter-only document warns and the run continues.
 3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
@@ -1081,6 +1082,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" workflows summary --workflow=build --file="{STATUS}" --publish={PUBLISH}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 3. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --number=15 --post --title=Summary --link-ref={BRANCH} --comment-body --message="chore({FID}): summary"
diff --git a/.agents/skills/bkit-debug/SKILL.md b/.agents/skills/bkit-debug/SKILL.md
index 2406d9f3f..c7476091a 100644
--- a/.agents/skills/bkit-debug/SKILL.md
+++ b/.agents/skills/bkit-debug/SKILL.md
@@ -461,6 +461,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    Read: `{CI_SELECTION_FILE}`, `docs/plans/{YYYYMM}/logs/{FID}/debug-input-{DEBUG_ATTEMPT}.md`, the current-generation `context-*` artifacts recorded in Step 4.
    Update: Test files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-reproduce-{NORMAL_ATTEMPT}.md`.
+   Project documents: a debug run has no plan, so the subagents read the `.agents/docs.md` index and consult `docs/testing.md` for the test tiers and `docs/noise.md` for registered signal downgrades (also `docs/observability.md` or `docs/architecture.md` when they are present and relevant to the failure). A missing index or a missing, empty or starter-only document is a warning: continue from repository evidence, and record the gap in `## Documentation Warnings`. A handover keeps the unresolved warnings.
 2. Finish — commits the test:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-failure-reproduce --field=ciGeneration={CI_GENERATION} --attempt-of=debug-run-tests:current --agent=bkit-debug-failure-reproduce --artifact="docs/plans/{YYYYMM}/logs/{FID}/debug-failure-reproduce-<attempt>.md" --message="test({FID}): reproduce reported failure" --number=5 --post --title="Failure Reproduce"
@@ -604,6 +605,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    "{BKIT}" workflows summary --workflow=debug --file="{STATUS}"
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 2. Finish:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md --message="chore({FID}): summary" --verbose-ci-local --number=10 --post --title="Summary" --link-ref={BRANCH} --comment-body
diff --git a/.agents/skills/bkit-design/SKILL.md b/.agents/skills/bkit-design/SKILL.md
index 80df59108..aee953751 100644
--- a/.agents/skills/bkit-design/SKILL.md
+++ b/.agents/skills/bkit-design/SKILL.md
@@ -333,6 +333,7 @@ description: "Design Feature — Autonomous design phase"
    Context: You are a subagent in the Design phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Inputs carry distinct lenses. Merge across them, and do not collapse them to a consensus.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/design-input-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-1.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-2.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-3.md`, `docs/plans/{YYYYMM}/logs/{FID}/related-issues.md` (if present), `docs/plans/{YYYYMM}/{FID}-design.md` (if present — superseded design, context only, not a constraint).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md`.
+   Project documents: a design needs no plan, so the subagent reads the `.agents/docs.md` index and consults `docs/architecture.md` (boundaries and topology), plus `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/design.md`, `docs/observability.md` or `docs/deployments.md` when the design touches them. A missing index or a missing, empty or starter-only document is a warning: continue from repository evidence, and record the gap in `## Documentation Warnings` (one `jsonl` record per gap with `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action`).
 2. Finish:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=design --step=design-generate --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md --message="chore({FID}): design-generate" --number=5 --post --title="Generate Design" --link-ref=dev
@@ -452,6 +453,7 @@ description: "Design Feature — Autonomous design phase"
    "{BKIT}" workflows summary --workflow=design --file="{STATUS}"
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 3. Finish, then push with exactly one command:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=design --step=design-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/design-summary.md --message="chore({FID}): summary bkit [skip ci]" --number=10 --post --title=Summary --link-ref=dev --comment-body
diff --git a/.agents/skills/bkit-plan/SKILL.md b/.agents/skills/bkit-plan/SKILL.md
index 71bd2a919..117578b68 100644
--- a/.agents/skills/bkit-plan/SKILL.md
+++ b/.agents/skills/bkit-plan/SKILL.md
@@ -221,6 +221,7 @@ description: "Plan Feature — Autonomous plan generation"
    Context: You are a subagent in the Plan phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. Workstreams this plan covers: {WORKSTREAMS}.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present — superseded plan, context only, not a constraint).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`.
+   Project documents: `@bkit-plan-generate` fills `Documentation Consultation` and `Documentation Warnings` in the plan. The review and apply-review steps keep those sources; a gap is a warning that continues the run, never a stop.
    **If** the draft still holds `PENDING` → invoke `@bkit-plan-generate` once more with Context `"Fill only the sections still marked PENDING and the empty groups; leave every finished section as it is."` and the plan caps and workstreams above, Read: the same inputs, Update: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`.
 2. Check the draft's groups and task blocks, and that every symbol it names exists:
    ```bash
@@ -388,6 +389,7 @@ description: "Plan Feature — Autonomous plan generation"
    "{BKIT}" workflows summary --workflow=plan --file="{STATUS}" --plan={PLAN_FINAL}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 4. Finish, then push the summary commit:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/plan-summary.md --message="chore({FID}): summary bkit [skip ci]" --number=7 --post --title=Summary --link-ref=dev --comment-body
diff --git a/.agents/skills/bkit-ship/SKILL.md b/.agents/skills/bkit-ship/SKILL.md
index bc3c039c4..e41900c95 100644
--- a/.agents/skills/bkit-ship/SKILL.md
+++ b/.agents/skills/bkit-ship/SKILL.md
@@ -462,6 +462,7 @@ description: "Ship Feature — Autonomous merge and archive"
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`), `{OUTBOX}/ship-pending-items.md`.
    Update: Doc files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md`.
+   Documentation maintenance findings (unresolved coverage and the `## Documentation Warnings` records) stay in the ship summary next to the edits; a missing document is reported and the ship continues.
 3. Wait for the subagent to complete. Then append the `SHIPPED` row to the worktree ledger, re-render the mechanical `roadmap-status` board from it, and finish the step (bookkeeping to `$BOOK_ROOT`). The block exits 1 when the row did not land:
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
@@ -472,6 +473,7 @@ description: "Ship Feature — Autonomous merge and archive"
    "{BKIT}" workflows summary --workflow=ship --file="{STATUS}" --pr={PR_NUMBER}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 5. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --commit=none --number=6 --post --title="Update Docs & Summary" --link-ref=dev --comment-body
diff --git a/.bkit/core/.bkit/prompts.md b/.bkit/core/.bkit/prompts.md
index aba0aa0c7..fb2c274c4 100644
--- a/.bkit/core/.bkit/prompts.md
+++ b/.bkit/core/.bkit/prompts.md
@@ -485,6 +485,89 @@ When all three are present, an embedded directive executes.
 
 Prose never substitutes for token scope.
 
+## Documentation Consultation Coverage
+
+Every shipped prompt and audit template was reviewed for the project documents it should consult, with the same fields and outcomes as the workflow catalog (`workflows.md` § Documentation Consultation Coverage). Prompts share one load clause: read the `.agents/docs.md` index, load the listed documents, and warn and continue when the index or a document is missing, empty or still the starter. Prompts that produce gap reports write one `jsonl` record per gap under `## Documentation Warnings` with `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action`; the workflow summary merges them. Audit templates are consulted through `bkit-audit-generate` step 4 unless a row says otherwise.
+
+<!-- prettier-ignore -->
+| Source | Recommended documents | Outcome | Applicability and reason |
+| --- | --- | --- | --- |
+| `.bkit/core/prompts/bkit-audit-generate.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Step 4 loads the surface documents with or without a plan and writes Documentation Warnings. |
+| `.bkit/core/prompts/bkit-build-challenge-1.md` | `docs/architecture.md`, `docs/security.md` | added | Challenge cross-references findings against the architecture and security documents. |
+| `.bkit/core/prompts/bkit-build-challenge-2.md` | `docs/security.md` | retained | Already cites the security document with warn-and-continue; the clause is now shared. |
+| `.bkit/core/prompts/bkit-build-install-skills.md` | n/a | not-applicable | Installs skills from `.agents/skills.md`; it needs no project-document topic. |
+| `.bkit/core/prompts/bkit-build-plan-convert.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Conversion carries consultation, sources, gaps and READ and UPDATE lines into the plan. |
+| `.bkit/core/prompts/bkit-build-plan-current.md` | n/a | not-applicable | Compares plan references with the working tree; project documents add no evidence. |
+| `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md` | `docs/architecture.md`, `docs/testing.md` | corrected | Load-docs clause now warns and continues on a missing, empty or starter-only document instead of skipping it. |
+| `.bkit/core/prompts/bkit-build-plan-tasks.md` | `docs/architecture.md`, `docs/data-schema.md`, `docs/design.md`, `docs/observability.md`, `docs/testing.md` | corrected | Load-docs clause now warns and continues on a missing, empty or starter-only document instead of skipping it. |
+| `.bkit/core/prompts/bkit-build-plan-tests.md` | `docs/architecture.md`, `docs/testing.md` | corrected | Load-docs clause now warns and continues on a missing, empty or starter-only document instead of skipping it. |
+| `.bkit/core/prompts/bkit-build-plan-verify.md` | `docs/observability.md`, `docs/testing.md` | corrected | Load-docs clause now warns and continues on a missing, empty or starter-only document instead of skipping it. |
+| `.bkit/core/prompts/bkit-debug-abort-handover.md` | n/a | not-applicable | Writes the handover from run artifacts and keeps their warnings; it consults no document. |
+| `.bkit/core/prompts/bkit-debug-failure-diagnose.md` | `docs/testing.md`, `docs/noise.md` | added | Diagnosis checks registered signal downgrades and test tiers before judging a failure. |
+| `.bkit/core/prompts/bkit-debug-failure-remediate.md` | `docs/testing.md` | added | Remediation follows the testing document when present. |
+| `.bkit/core/prompts/bkit-debug-failure-reproduce.md` | `docs/testing.md` | retained | Already cites the testing document with warn-and-continue. |
+| `.bkit/core/prompts/bkit-debug-failure-soak.md` | `docs/testing.md` | added | Soak runs follow the tier rules in the testing document when present. |
+| `.bkit/core/prompts/bkit-design-brainstorm-ideate-1.md` | `docs/architecture.md`, `docs/technology.md` | added | Pragmatic lens starts from existing topology and stack choices. |
+| `.bkit/core/prompts/bkit-design-brainstorm-ideate-2.md` | `docs/architecture.md`, `docs/technology.md` | added | Trade-off lens starts from existing topology and stack choices. |
+| `.bkit/core/prompts/bkit-design-brainstorm-ideate-3.md` | `docs/architecture.md`, `docs/security.md` | added | Pre-mortem lens reads boundaries and trust assumptions. |
+| `.bkit/core/prompts/bkit-design-generate.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md` | added | Draft design records the sources it consulted and warns on gaps. |
+| `.bkit/core/prompts/bkit-design-organise.md` | `docs/architecture.md` | added | Workstream grouping respects documented boundaries. |
+| `.bkit/core/prompts/bkit-design-review-1.md` | `docs/architecture.md`, `docs/technology.md` | added | Feasibility review checks the design against documented topology and stack. |
+| `.bkit/core/prompts/bkit-design-review-2.md` | `docs/observability.md`, `docs/deployments.md` | retained | Already cites both documents with warn-and-continue. |
+| `.bkit/core/prompts/bkit-design-spike.md` | n/a | not-applicable | Throwaway probes answer from code and the web; project documents add no evidence. |
+| `.bkit/core/prompts/bkit-design-update.md` | `docs/architecture.md` | added | Applying review items keeps the design consistent with documented boundaries. |
+| `.bkit/core/prompts/bkit-plan-generate.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Fills Documentation Consultation and Documentation Warnings and carries READ and UPDATE lines. |
+| `.bkit/core/prompts/bkit-plan-review-1.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Critique checks that the plan consulted each assessed topic. |
+| `.bkit/core/prompts/bkit-plan-review-2.md` | `docs/testing.md` | retained | Already cites the testing document with warn-and-continue. |
+| `.bkit/core/prompts/bkit-plan-scope-check.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Scope audit checks the consultation table and warnings are complete. |
+| `.bkit/core/prompts/bkit-plan-update.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Preserves source evidence and updates it when a review changes the plan. |
+| `.bkit/core/prompts/bkit-ship-conflict-resolve.md` | n/a | not-applicable | Resolves merge conflicts from git history and both sides; no project-document topic. |
+| `.bkit/core/prompts/bkit-ship-deferred-sweep.md` | n/a | not-applicable | Reads the deferral ledger only; no project-document topic. |
+| `.bkit/core/prompts/bkit-ship-update-docs.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md` | added | Checks presence, index accuracy and project content for every topic and reports unresolved coverage. |
+| `.bkit/core/prompts/bkit-utility-compress-markdown.md` | n/a | not-applicable | Compresses the one file it is given; no project-document topic. |
+| `.bkit/core/prompts/bkit-utility-update-decisions.md` | n/a | not-applicable | Ledger upkeep per `.bkit/jsonl.md`; no project-document topic. |
+| `.bkit/core/prompts/bkit-utility-update-deferrals.md` | n/a | not-applicable | Ledger upkeep per `.bkit/jsonl.md`; no project-document topic. |
+| `.bkit/core/prompts/bkit-utility-update-documentation.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md` | added | Reviews every relevant topic including absent ones, populates within scope and reports gaps. |
+| `.bkit/core/prompts/bkit-utility-update-failures.md` | n/a | not-applicable | Ledger upkeep per `.bkit/jsonl.md`; no project-document topic. |
+| `.bkit/core/prompts/bkit-utility-update-knowledge.md` | n/a | not-applicable | Ledger upkeep per `.bkit/jsonl.md`; no project-document topic. |
+| `.bkit/core/prompts/bkit-utility-update-roadmap.md` | n/a | not-applicable | Roadmap upkeep from ledgers and the tracker; no project-document topic. |
+| `.bkit/core/prompts/bkit-utility-update-tracker.md` | n/a | not-applicable | Tracker upkeep per `.bkit/trackers.md`; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-accessibility.md` | `docs/design.md` | retained | Already cites the design document for tokens and components. |
+| `.bkit/core/docs/templates/bkit-audit-adoption.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md` | added | Step 6 checks presence, index accuracy and content of every project document. |
+| `.bkit/core/docs/templates/bkit-audit-agents.md` | n/a | not-applicable | Reviews instruction files, hosts and hooks that bkit manages; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-aio-seo.md` | n/a | not-applicable | Crawls public pages for search and answer-engine readiness; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-analytics.md` | `docs/observability.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-annotations.md` | n/a | not-applicable | Reviews code annotations against the code; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-app-performance.md` | `docs/architecture.md`, `docs/observability.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-app-store.md` | `docs/deployments.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-architecture.md` | `docs/architecture.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-ci-performance.md` | `docs/deployments.md`, `docs/testing.md` | retained | Already cites both documents. |
+| `.bkit/core/docs/templates/bkit-audit-config.md` | `docs/deployments.md` | retained | Already cites the deployments document. |
+| `.bkit/core/docs/templates/bkit-audit-cost.md` | `docs/deployments.md` | retained | Already cites the deployments document. |
+| `.bkit/core/docs/templates/bkit-audit-coverage.md` | `docs/testing.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-database.md` | `docs/data-schema.md`, `docs/setup.md` | corrected | Cited the setup document only; the schema document is now named for the active schema. |
+| `.bkit/core/docs/templates/bkit-audit-dead-code.md` | `docs/architecture.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-deferrals.md` | n/a | not-applicable | Audits the deferral ledger; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-dependencies.md` | `docs/deployments.md` | retained | Already cites the deployments document. |
+| `.bkit/core/docs/templates/bkit-audit-documentation.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md` | added | Step 3 checks presence, index accuracy and project content and writes Documentation Warnings. |
+| `.bkit/core/docs/templates/bkit-audit-duplication.md` | `docs/architecture.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-failures.md` | n/a | not-applicable | Audits the failure ledger; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-flakes.md` | `docs/testing.md` | retained | Already cites the testing document. |
+| `.bkit/core/docs/templates/bkit-audit-gates.md` | `docs/deployments.md`, `docs/design.md`, `docs/testing.md` | retained | Already cites all three documents. |
+| `.bkit/core/docs/templates/bkit-audit-issues.md` | n/a | not-applicable | Audits tracker issues; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-llm.md` | `docs/technology.md`, `docs/security.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-logs.md` | `docs/observability.md`, `docs/noise.md` | retained | Already cites both documents. |
+| `.bkit/core/docs/templates/bkit-audit-models.md` | `docs/technology.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-privacy.md` | `docs/security.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-prompts.md` | n/a | not-applicable | Reviews bkit prompts and agent files; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-red-team.md` | `docs/security.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-reliability.md` | `docs/deployments.md` | retained | Already cites the deployments document. |
+| `.bkit/core/docs/templates/bkit-audit-repo.md` | `docs/architecture.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-security.md` | `docs/security.md`, `docs/deployments.md` | retained | Already cites both documents. |
+| `.bkit/core/docs/templates/bkit-audit-slop.md` | n/a | not-applicable | Scans code patterns against lint rules; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-testing.md` | `docs/testing.md` | retained | Already cites the testing document. |
+| `.bkit/core/docs/templates/bkit-audit-usability.md` | `docs/design.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+
 ## Model Presets
 
 Two settings for OpenRouter, the overflow column, which covers the days after the week's OpenAI, Anthropic and Google credits run out. Costs are per **2-day gap**, the binding case against the weekly cap (`.bkit/providers.md` § Budget band), at the measured OpenCode profile with each agent carrying an equal 1/40 share. Judges and key gates: § Models Judges note.
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index d7564dc69..ce07a48b6 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -1160,6 +1160,44 @@ It writes only the report and the template's consumer-owned `Project Instruction
 
 **CI-class skip conditions:** one tracker no-op line, then exit 0. Only real failures (missing args, tracker unreachable, malformed state) → Failure Path. Loop bound: `/bkit-debug` enforces `debug.fix` and `debug.soak` `maxAttempts` across every debug run of the feature; cloud counts only `dev` dispatches.
 
+## Documentation Consultation Coverage
+
+Every rule group, workflow step and plan-template section was reviewed for the project documents it should consult. A project document path is a recommendation: read the `.agents/docs.md` index, use the recommended path or an indexed equivalent (`Equivalent to docs/{topic}.md` in the Scope cell), and **if** the index or a document is missing, empty or still the starter, warn and continue from repository evidence. Outcomes: `added` (a named reference or section was added), `retained` (the source already cited it), `corrected` (an inappropriate or silent-skip reference was fixed) and `not-applicable` (no project document applies, with the reason). Each producing prompt writes gaps as `jsonl` records under `## Documentation Warnings`, and `bkit workflows summary` lists the current run's records once per topic and gap without changing the verdict. `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` checks that every source has a record.
+
+<!-- prettier-ignore -->
+| Source | Recommended documents | Outcome | Applicability and reason |
+| --- | --- | --- | --- |
+| `.bkit/core/.agents/rules.md` § New files | `docs/architecture.md` | retained | Places new files per the architecture document when present; a missing or starter-only document warns and the nearest structure applies. |
+| `.bkit/core/.agents/rules.md` § UI design | `docs/design.md` | retained | Applies when the change touches UI; warns and follows existing UI conventions when the document is missing. |
+| `.bkit/core/.agents/rules.md` § Explicit logging | `docs/observability.md` | retained | Applies to logging changes; warns and follows existing logging conventions when the document is missing. |
+| `.bkit/core/.agents/rules.md` § CI and deployments | `docs/deployments.md` | retained | Pushes, tags and CI behaviour point at the deployments document; the managed guides carry the bkit mechanics. |
+| `.bkit/core/.agents/rules.md` § Server-side validation, security and schema | `docs/security.md`, `docs/data-schema.md` | retained | Boundary notes name the security and schema documents; applicability follows the changed surface. |
+| `.bkit/core/.agents/rules.md` § Testing | `docs/testing.md` | retained | Tier rules and file inventory point at the testing document; `Tests discriminate` and `Test-first` stay in force without it. |
+| `.bkit/core/.agents/rules.md` § all other rules | n/a | not-applicable | Ledger, git, tracker, authoring and tool rules govern bkit operations and have no project-document topic. |
+| `.bkit/core/docs/templates/bkit-plan.md` § Pre-Flight / Dependencies | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md`, `docs/deployments.md`, `docs/design.md`, `docs/observability.md`, `docs/data-schema.md` | added | Core and Conditional items name each document, with the warn-and-continue rule. |
+| `.bkit/core/docs/templates/bkit-plan.md` § Documentation Consultation | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md`, `docs/data-schema.md`, `docs/design.md`, `docs/observability.md`, `docs/deployments.md` | added | New section records topic, applicability, source used, coverage, gap and action for every plan. |
+| `.bkit/core/docs/templates/bkit-plan.md` § Documentation Warnings | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | New section holds the structured warning records that the workflow summary aggregates. |
+| `.bkit/core/docs/templates/bkit-plan.md` § Data Schema Integration | `docs/data-schema.md` | retained | Reads and writes of the schema document stay explicit; absent schema documents warn through the consultation table. |
+| `.bkit/core/docs/templates/bkit-plan.md` § Documentation Updates | `docs/architecture.md`, `docs/technology.md`, `docs/data-schema.md`, `docs/design.md`, `docs/testing.md`, `docs/observability.md` | retained | Lists the documents a change touches; the runbook carries each as an UPDATE line. |
+| `.bkit/core/docs/templates/bkit-plan.md` § Agent Execution Runbook | `docs/architecture.md`, `docs/testing.md` | added | Tasks that touch an assessed topic carry READ and UPDATE lines for its document. |
+| `.bkit/core/docs/templates/bkit-plan.md` § Verification Plan | `docs/testing.md`, `docs/observability.md` | retained | Gate items verify tests and logging against the named documents. |
+| `.bkit/core/docs/templates/bkit-plan.md` § all other sections | n/a | not-applicable | Context, scenario, matrix, scope and rollback sections describe the change itself and cite no project document. |
+| `.bkit/core/workflows/bkit-design.md` § Step 3 Grill and Step 5 Generate Design | `docs/architecture.md`, `docs/technology.md`, `docs/security.md` | added | A design needs no plan: the generator reads the index, consults the documents and records warnings. |
+| `.bkit/core/workflows/bkit-design.md` § Step 10 Summary | `docs/architecture.md` | added | The summary carries Documentation Warnings from the run unchanged. |
+| `.bkit/core/workflows/bkit-design.md` § all other steps | n/a | not-applicable | Worktree, review, spike, organise and close steps handle files and verdicts, not project facts. |
+| `.bkit/core/workflows/bkit-plan.md` § Step 3 Generate Plan | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Plan generation fills Documentation Consultation and Documentation Warnings. |
+| `.bkit/core/workflows/bkit-plan.md` § Step 7 Summary | `docs/testing.md` | added | Summary shows attributed warnings once per topic and gap, advisory only. |
+| `.bkit/core/workflows/bkit-plan.md` § all other steps | n/a | not-applicable | Start, fetch, review, apply and close steps move artifacts; reviewers consult through their prompts. |
+| `.bkit/core/workflows/bkit-build.md` § Step 4 Plan Convert | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Issue-to-plan conversion carries the same consultation contract as generation. |
+| `.bkit/core/workflows/bkit-build.md` § Step 15 Summary | `docs/testing.md` | added | Summary carries warnings from the applicable tasks without changing the verdict. |
+| `.bkit/core/workflows/bkit-build.md` § all other steps | n/a | not-applicable | Group loop, tests, diagnosis and PR steps follow the plan; task prompts consult their documents. |
+| `.bkit/core/workflows/bkit-debug.md` § Step 5 Failure Reproduce | `docs/testing.md`, `docs/noise.md` | added | A debug run has no plan: subagents consult the testing and noise documents and warn when missing. |
+| `.bkit/core/workflows/bkit-debug.md` § Step 10 Summary | `docs/testing.md` | added | Summary and handover keep unresolved warnings. |
+| `.bkit/core/workflows/bkit-debug.md` § all other steps | n/a | not-applicable | Run-tests, context, push and close steps are mechanical and read no project document. |
+| `.bkit/core/workflows/bkit-ship.md` § Step 6 Update Docs and Summary | `docs/architecture.md`, `docs/deployments.md`, `docs/testing.md` | added | Documentation maintenance findings stay in the ship summary next to the edits. |
+| `.bkit/core/workflows/bkit-ship.md` § all other steps | n/a | not-applicable | Verify, integrate, merge and update steps handle git and CI state, not project facts. |
+| `.bkit/core/workflows/bkit-auto.md` § Step 2 Dispatch | n/a | not-applicable | Dispatch only routes to a phase; it forwards the phase summary and its warnings unchanged. |
+
 ## Test and release mechanics
 
 These mechanics belong to bkit, so they live in this managed guide and do not depend on the project adopting `docs/testing.md` or `docs/deployments.md`. The project's own choices (its tiers, lanes, rollback and deploy decisions) go in those documents, copied from `.bkit/templates/docs/`. Test-first, `bkit:test:file`, `bkit:lint:file` and the JUnit failure count are described in § Local gate scripts and § Test-first above, and the wrapper script is in `.bkit/templates.md` § Local test sleep prevention.
diff --git a/.bkit/core/docs/templates/bkit-audit-adoption.md b/.bkit/core/docs/templates/bkit-audit-adoption.md
index 4becc3db8..c21a8b530 100644
--- a/.bkit/core/docs/templates/bkit-audit-adoption.md
+++ b/.bkit/core/docs/templates/bkit-audit-adoption.md
@@ -28,10 +28,10 @@ bkit ships three folders. A file's path inside its folder is the path it lands a

<!-- prettier-ignore -->
 | Package folder | Install does | Repo gets |
 | --- | --- | --- |
 | `.bkit/core/` | Writes its files and keeps them current. It never writes `engine/`, `workflows/` or `prompts/` as they are: workflows and prompts render to host agent and command copies | Whole files, managed blocks, hooks, reference docs in `.bkit/`, audit and plan templates |
-| `.bkit/shared/` | Writes its files and keeps them current | bkit blocks and keys inside files you also edit (`docs/*.md`, `.gitignore`, settings, tool-server config) |
+| `.bkit/shared/` | Writes its files and keeps them current | bkit blocks and keys inside files you also edit (`.agents/docs.md`, `.gitignore`, settings, tool-server config) |
 | `.bkit/templates/` | Never writes them into the repo. It keeps a raw copy at `.bkit/templates/`, and `bkit upgrade` lists the changed paths | Nothing until you copy one and own it |
 
-`bkit check` proves that the written files match the package. Nothing proves the rest: a template never copied, a copy whose tool never runs, a written doc that holds only bkit's block, or a shipped audit never run. The failure this audit targets is a shipped piece that would have caught something but sits unused or half-wired, while every check stays green. Examples: `.husky/pre-push` was never copied, so tests run only in CI; `.lintstagedrc.json` was copied, but `pre-commit` never calls lint-staged; `{{NODE_VERSION}}` was left raw in `bkit-ci.yml`; `bkit-cloud.yml` waits on a workflow name that no longer exists; `docs/security.md` holds bkit's block and nothing else; `bkit-audit-security` was never run; or the install is three releases behind, with hand edits inside managed blocks.
+`bkit check` proves that the written files match the package. Nothing proves the rest: a template never copied, a copy whose tool never runs, a project document (`docs/*.md`) never copied from its starter or left as the untouched starter, or a shipped audit never run. The failure this audit targets is a shipped piece that would have caught something but sits unused or half-wired, while every check stays green. Examples: `.husky/pre-push` was never copied, so tests run only in CI; `.lintstagedrc.json` was copied, but `pre-commit` never calls lint-staged; `{{NODE_VERSION}}` was left raw in `bkit-ci.yml`; `bkit-cloud.yml` waits on a workflow name that no longer exists; `docs/security.md` is still the starter text, or the document exists but `Project Documents` does not list it; `bkit-audit-security` was never run; or the install is three releases behind, with hand edits inside managed blocks.
 
 **Applies when:** `.bkit/version` is present. **If** it is absent → write one `N/A` row with its evidence, and never report the surface as "clean".
 
@@ -98,7 +98,25 @@ bkit ships three folders. A file's path inside its folder is the path it lands a
 - [ ] **Step 3 — Version:** Compare `pinnedVersion`, the installed package and the registry latest. **If** pinned != installed → the package was bumped without `bkit upgrade`. **If** the repo is behind → record the release count, the release-note changes that touch this repo, and the template paths changed since the pinned version. **Done when:** `Version` names all three versions and every relevant release-note change.
 - [ ] **Step 4 — Check and Doctor:** Run `bkit check`, and record its exit code and the cause of each drift line. Run `bkit doctor`, and mark each advisory adopt, reject (saying why) or not applicable. Carry the previous report's rejects forward, and re-raise one only when the advisory text changed. **Done when:** `Check and Doctor` holds one row per drift line and per advisory.
 - [ ] **Step 5 — Hosts:** Compare the agent hosts in use with the bkit hosts installed. Find the hosts in use from the repo's config directories and from team use. Use the `Hosts` section of the newest `bkit-audit-agents` report as a cross-check, not as the source. For each installed host, check for one agent copy per `core/prompts/` source, one command copy per `core/workflows/` source, and every `core/` hook file present, executable and wired in that host's settings. Record these as findings: a host in use with no bkit install, because agents there run without bkit gates; a missing or extra copy; and a hook file present but unwired, or wired but absent. Whether hooks fire and agree across hosts goes to `bkit-audit-agents`. **Done when:** `Hosts` holds one row per host: in use · installed · agent copies · command copies · hooks wired.
-- [ ] **Step 6 — Written Files:** (a) Check that every `bkit:start` / `bkit:end` block and owned key is untouched (the Step 4 drift). **If** one holds a hand edit → the fix moves the edit below `bkit:end` or to `Project Instructions`. **If** the defect is in what bkit shipped → the fix is upstream in bkit. (b) In each file bkit shares with you (`AGENTS.md`, `CLAUDE.md`, `.agents/*.md`, `.gitignore`, `.gitattributes`, settings, tool-server config), check that your part is present for every block that expects one. A shared file that holds only bkit's block is unadopted. The ten project documents belong to you, so check them against their starters in `.bkit/templates/docs/` and `Project Documents` in `.agents/docs.md`. **If** `.bkit/.env.example` exists → check that `.bkit/.env` is present and git-ignored, and that every listed key is set (names only). **If** bkit wrote a tracker or tool-server entry → check that the credential env var it names is set. Whether your part is true goes to `bkit-audit-documentation`. **Done when:** `Written Files` holds one row per shared file: block untouched · your part present · verdict.
+- [ ] **Step 6 — Written Files:** (a) Check that every `bkit:start` / `bkit:end` block and owned key is untouched (the Step 4 drift). **If** one holds a hand edit → the fix moves the edit below `bkit:end` or to `Project Instructions`. **If** the defect is in what bkit shipped → the fix is upstream in bkit. (b) In each file bkit shares with you (`AGENTS.md`, `CLAUDE.md`, `.agents/*.md`, `.gitignore`, `.gitattributes`, settings, tool-server config), check that your part is present for every block that expects one. A shared file that holds only bkit's block is unadopted. The ten project documents belong to you, so check them against their starters in `.bkit/templates/docs/` and `Project Documents` in `.agents/docs.md`, topic by topic:
+  - **Presence:** a relevant topic with no file (absent or missing) is a finding. An indexed equivalent document counts (`Equivalent to docs/{topic}.md` in its Scope cell).
+  - **Index accuracy:** a file with no row, and a row with no file, are findings.
+  - **Content:** an empty file, or a file that still matches its starter, is a finding; a file that differs is a candidate for assessment, never proof of coverage. A topic that does not apply (no UI, no database) is irrelevant and recorded as not applicable with the reason.
+  - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Never mark the surface adopted.
+  - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+
+    ```jsonl
+    {
+      "topic": "testing",
+      "gap": "starter-only",
+      "recommendedPath": "docs/testing.md",
+      "alternativeEvidence": "CI lanes are defined in the bkit CI workflow.",
+      "action": "Populate the testing document with the project's tiers and lanes."
+    }
+    ```
+
+  **If** `.bkit/.env.example` exists → check that `.bkit/.env` is present and git-ignored, and that every listed key is set (names only). **If** bkit wrote a tracker or tool-server entry → check that the credential env var it names is set. Whether your part is true goes to `bkit-audit-documentation`. **Done when:** `Written Files` holds one row per shared file and per project document topic: block untouched · your part present · state (populated, starter-only, empty, absent or not applicable) · verdict.
+
 - [ ] **Step 7 — Audits:** For each `docs/templates/bkit-audit-*.md`, record whether its `**Applies when:**` is met, yes or no, with evidence; its `**Cadence:**`; and its newest report under `docs/audits/` by commit date. An audit never run is due, by the same rule as `bkit-utility-update-roadmap`. An `N/A` report with evidence counts as a run. Record these as findings: an audit that applies and was never run; an audit overdue by more than one cadence; and `Process Improvements` `Project` edits that a report proposed and that are absent from that template's `Project Instructions`. **Done when:** `Audits` holds one row per template: applies · cadence · last run · overdue by · verdict.
 - [ ] **Step 8 — Adoption:** Join each file in the package's `templates/` to `.bkit/templates.md` § Contract.
   - **If** a file is missing from the Contract → the fix is an upstream bkit doc fix.
@@ -155,6 +173,12 @@ Within a severity, list missing gates first, then unwired copies, then drift.
 
 **If** the run finds nothing → write one row: `None`.
 
+## Documentation Warnings
+
+PENDING
+
+Write `None` when the adoption check found no project-document gap; the records of Step 6 go here otherwise.
+
 ## Report
 
 ### Summary
diff --git a/.bkit/core/docs/templates/bkit-audit-database.md b/.bkit/core/docs/templates/bkit-audit-database.md
index eb784d4f7..3ef39d341 100644
--- a/.bkit/core/docs/templates/bkit-audit-database.md
+++ b/.bkit/core/docs/templates/bkit-audit-database.md
@@ -41,7 +41,7 @@ Migrations and integration tests exercise queries, but neither checks that privi
 - Platform serverless connection guidance.
 - DB routine-maintenance docs, edition = hosted major (e.g., PostgreSQL Routine Database Maintenance Tasks).
 - Safe-migration rule set (e.g., Squawk); record version.
-- bkit block of `docs/setup.md` (bkit version from `.bkit/version`): Rules
+- The project's `docs/setup.md` (local database setup and reset) and `docs/data-schema.md` (documented schema), when present; a missing or starter-only document is a warning, not a stop.
 
 ### Scope
 
diff --git a/.bkit/core/docs/templates/bkit-audit-documentation.md b/.bkit/core/docs/templates/bkit-audit-documentation.md
index 9f28a0aa0..94f973663 100644
--- a/.bkit/core/docs/templates/bkit-audit-documentation.md
+++ b/.bkit/core/docs/templates/bkit-audit-documentation.md
@@ -88,7 +88,26 @@ The failure this audit targets is a claim the code has left behind. Examples: a
 
 - [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
 - [ ] **Step 2 — Scope:** **If** there are no live docs → write one `N/A` row with evidence, then **STOP**. Otherwise take every live doc, and rank them by drift: for each live doc, count the commits to the repo paths it cites since the doc last changed, and add a column for the cited paths that no longer resolve. Record the ranking. Start from an up-to-date default branch with a clean `git status`. Historical records are citers. A pointer in one that leads nowhere is a finding, fixed at the target. A stale fact inside one is history, not a defect. **Done when:** `Scope` holds every live doc and the drift ranking.
-- [ ] **Step 3 — Catalogue:** Check `.agents/docs.md`. Every file on disk under `docs/`, outside `plans/`, `archive/` and `audits/`, has a row, and every row's file exists. No doc is listed twice. Two docs on one topic is a bug, and that includes one doc in both tables with different reading columns. Each row's one-line scope still matches the doc. The root `README.md` works as the entry point: it says what the project is, links the setup doc, the architecture doc and `.agents/docs.md`, and says how to report a security issue. A missing community-health file with no README substitute is a finding. **Done when:** `Catalogue` names every mismatch, and every clean check.
+- [ ] **Step 3 — Catalogue:** Check `.agents/docs.md`. Every file on disk under `docs/`, outside `plans/`, `archive/` and `audits/`, has a row, and every row's file exists. No doc is listed twice. Two docs on one topic is a bug, and that includes one doc in both tables with different reading columns. Each row's one-line scope still matches the doc. The root `README.md` works as the entry point: it says what the project is, links the setup doc, the architecture doc and `.agents/docs.md`, and says how to report a security issue. A missing community-health file with no README substitute is a finding. Then check the project's own documentation, topic by topic, for the ten recommended documents (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`) and `docs/components.md` when the project has shared UI components:
+  - **Presence:** a topic the project needs with no file (absent or missing) is a finding. An equivalent document counts when its `Project Documents` row names the recommended path in its Scope cell (`Equivalent to docs/{topic}.md`).
+  - **Index accuracy:** a present file with no `Project Documents` row, and a row whose file is missing, are findings.
+  - **Project content:** compare each file with `.bkit/templates/docs/{topic}.md`. An empty file or one that still matches the starter is a finding. A file that differs is a candidate: read it against the code and name the undercovered topics. Never call a topic covered from a mechanical comparison alone.
+  - **Not applicable:** a topic the project does not need (for example `docs/design.md` for a project with no UI) is irrelevant and recorded as not applicable with the reason. Absence, incomplete coverage and an irrelevant topic are three different outcomes; report each one apart.
+  - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Never report the surface as clean.
+  - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+
+    ```jsonl
+    {
+      "topic": "security",
+      "gap": "starter-only",
+      "recommendedPath": "docs/security.md",
+      "alternativeEvidence": "The CI configuration defines token permissions.",
+      "action": "Populate the security document with the project's credential and permission boundaries."
+    }
+    ```
+
+  **Done when:** `Catalogue` names every mismatch and every clean check, and `Project Documentation` holds one row per topic: path, state (populated, starter-only, empty, absent or not applicable), index accuracy and evidence.
+
 - [ ] **Step 4 — Mechanical:** Run prose lint, the format check and the managed-block check. Then:
   - Check that every backticked repo path in a live doc exists, and that every `*.md` name in a live doc resolves, backticked or not. The output is candidates. A path named on purpose as removed is not a finding. A path that moved is a finding. Section anchors and `file:line` wait for `Claims`.
   - Check relative links and heading anchors offline across every doc, plans and archive included, because they are citers. Then check external URLs in live docs, with a cache. The anchor builder must match the host (e.g., GitHub). Open a failed fragment before calling it broken. The path check cannot see Markdown links.
@@ -190,6 +209,12 @@ Within a severity, list destructive steps and contradictions first.
 
 **If** the run finds nothing → write one row: `None`.
 
+## Documentation Warnings
+
+PENDING
+
+**If** every topic is covered and indexed → write `None`; Step 3's records belong in this section.
+
 ## Report
 
 ### Summary
@@ -208,6 +233,10 @@ PENDING
 
 PENDING
 
+### Project Documentation
+
+PENDING
+
 ### Mechanical
 
 PENDING
@@ -278,6 +307,7 @@ PENDING
 ### 🔒 Gate 3: Report Check
 
 - [ ] **No placeholders:** no `PENDING` is left.
+- [ ] **Project documents:** `Project Documentation` has a row for every topic, and no absent, starter-only or undercovered topic reads as clean.
 - [ ] **Summary:** `Summary` gives the count per severity.
 - [ ] **Series:** the report shows load size, and setup-walk times when the walk ran, beside the previous report's numbers, or marks the run as baseline.
 - [ ] **Writes:** this run changed only this report, the template's `Project Instructions` and its own `docs/failures.jsonl` rows.
diff --git a/.bkit/core/docs/templates/bkit-plan.md b/.bkit/core/docs/templates/bkit-plan.md
index 947e69523..932240a9c 100644
--- a/.bkit/core/docs/templates/bkit-plan.md
+++ b/.bkit/core/docs/templates/bkit-plan.md
@@ -158,7 +158,7 @@ _e.g.,_ **WHEN** a user submits the form with a valid file **→ THEN** it is qu
 - [ ] **Existing-Solution Search (reuse over duplicate):** the in-repo, dependency and ecosystem searches are recorded in `Reuse Inventory`.
 - [ ] **User Context:** access to the files is confirmed, and missing user information is requested.
 - [ ] **Project Context:** the relevant `docs/knowledge.jsonl` and `docs/decisions.jsonl` rows are read.
-- [ ] **Testing & Quality:** the testing strategy matches `docs/testing.md`.
+- [ ] **Project Documents:** `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` are assessed through the `.agents/docs.md` index (a missing or starter-only document is a warning, not a stop), and the plan's strategy matches `docs/testing.md`. Record each source in `Documentation Consultation`.
 - [ ] **Prerequisite Plans:** [the plans to finish first. **If** none → `None`.]
 
 ### Conditional
@@ -167,6 +167,7 @@ _e.g.,_ **WHEN** a user submits the form with a valid file **→ THEN** it is qu
 - [ ] **Schema State:** the database state is confirmed against `docs/data-schema.md`.
 - [ ] **Architecture & UI:** the topology is checked against `docs/architecture.md`, and any UI against `docs/design.md`.
 - [ ] **Observability:** logs, audit tables and traces follow `docs/observability.md`.
+- [ ] **Deployments & Setup:** release, CI and branch behaviour follows `docs/deployments.md`, and local-setup changes follow `docs/setup.md`.
 - [ ] **Notifications:** the alert or toast tier follows the notifications doc.
 
 ### 🔒 Gate 1: Prerequisites Check
@@ -179,6 +180,31 @@ _e.g.,_ **WHEN** a user submits the form with a valid file **→ THEN** it is qu
 - [ ] **Reuse reasons:** every `NEW` row cites its reason.
 - [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.
 
+## Documentation Consultation
+
+[Read the `.agents/docs.md` index when it exists, and consult each applicable topic's recommended document or a valid indexed equivalent. Always assess `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md`. Consult `docs/data-schema.md` for database changes, `docs/design.md` for UI, `docs/observability.md` for logging, `docs/deployments.md` for release or CI behaviour, and `docs/noise.md` or `docs/setup.md` when relevant. A missing index, a missing or empty document, or a starter-only document is a warning: continue from repository evidence, and never stop the plan. Mark an irrelevant topic not applicable with the reason. Initially set to `PENDING`.]
+
+<!-- prettier-ignore -->
+| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
+| --- | --- | --- | --- | --- | --- |
+| [architecture] | `docs/architecture.md` | [yes / no — reason] | [the path and section actually read, or `none`] | [covered / partial / none] | [the gap, the alternative evidence, the action. **If** none → `None`.] |
+
+Carry each required read and each doc update into the runbook task that needs it (`READ:` and `UPDATE:` lines).
+
+## Documentation Warnings
+
+[One JSON object per line in a fenced `jsonl` block, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action`, all non-empty (`"None available"` when no alternative evidence exists). **If** every applicable topic is covered → write `None`. A warning never blocks the plan. Initially set to `PENDING`.]
+
+```jsonl
+{
+  "topic": "security",
+  "gap": "starter-only",
+  "recommendedPath": "docs/security.md",
+  "alternativeEvidence": "The CI configuration defines token permissions.",
+  "action": "Populate the security document with the project's credential and permission boundaries."
+}
+```
+
 ## Data Schema Integration
 
 [How this feature uses the existing schema, and what changes. Initially set to `PENDING`.]
diff --git a/.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts b/.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts
index 9932dee4e..d9a34ed12 100644
--- a/.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts
+++ b/.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts
@@ -191,3 +191,234 @@ describe("seeded config templates carry no internal identifiers or history prose
     });
   }
 });
+
+// ---------------------------------------------------------------------------
+// Documentation responsibility coverage and warning contracts
+// ---------------------------------------------------------------------------
+
+const TOPICS = [
+  "architecture",
+  "technology",
+  "security",
+  "data-schema",
+  "testing",
+  "deployments",
+  "observability",
+  "design",
+  "noise",
+  "setup",
+] as const;
+const TOPIC_PATH = new RegExp(`docs/(?:${TOPICS.join("|")}|components)\\.md`);
+const OUTCOMES = ["added", "retained", "corrected", "not-applicable"] as const;
+const COVERAGE_HEADING = "## Documentation Consultation Coverage";
+const WARNING_HEADING = "## Documentation Warnings";
+const WARNING_FIELDS = ["topic", "gap", "recommendedPath", "alternativeEvidence", "action"];
+
+const readRepo = (rel: string): string => fs.readFileSync(path.join(REPO_ROOT, rel), "utf-8");
+
+const mdIn = (dir: string, prefix: string): string[] =>
+  fs
+    .readdirSync(path.join(REPO_ROOT, dir))
+    .filter((f) => f.endsWith(".md"))
+    .sort()
+    .map((f) => `${prefix}${f}`);
+
+/** The table rows (cells) under a `## ` heading of `text`, header and divider rows dropped. */
+function tableRowsUnder(text: string, heading: string): string[][] {
+  const lines = text.split("\n");
+  const start = lines.findIndex((l) => l.trim() === heading);
+  if (start < 0) return [];
+  const rows: string[][] = [];
+  for (const line of lines.slice(start + 1)) {
+    if (/^## /.test(line)) break;
+    if (!line.trim().startsWith("|")) continue;
+    const cells = line
+      .trim()
+      .replace(/^\||\|$/g, "")
+      .split("|")
+      .map((c) => c.trim());
+    if (cells.every((c) => /^:?-{3,}:?$/.test(c))) continue;
+    rows.push(cells);
+  }
+  return rows.slice(1); // header row
+}
+
+/** Responsibility sources and the catalog that records their coverage. */
+const WORKFLOW_SOURCES = [
+  ".bkit/core/.agents/rules.md",
+  ".bkit/core/docs/templates/bkit-plan.md",
+  ...mdIn(".bkit/core/workflows", ".bkit/core/workflows/"),
+];
+const PROMPT_SOURCES = [
+  ...mdIn(".bkit/core/prompts", ".bkit/core/prompts/"),
+  ...mdIn(".bkit/core/docs/templates", ".bkit/core/docs/templates/").filter((f) =>
+    path.posix.basename(f).startsWith("bkit-audit-"),
+  ),
+];
+
+/** Problems with the coverage records of `sources` in `catalog`. */
+function coverageProblems(catalog: string, sources: string[]): string[] {
+  const rows = tableRowsUnder(readRepo(catalog), COVERAGE_HEADING);
+  const problems: string[] = [];
+  if (rows.length === 0) return [`${catalog}: no table under "${COVERAGE_HEADING}"`];
+  for (const source of sources) {
+    const mine = rows.filter((r) => (r[0] ?? "").includes(path.posix.basename(source)));
+    if (mine.length === 0) {
+      problems.push(`${catalog}: no coverage record for ${source}`);
+      continue;
+    }
+    for (const r of mine) {
+      const [, docs = "", outcome = "", reason = ""] = r;
+      if (!(OUTCOMES as readonly string[]).includes(outcome.toLowerCase()))
+        problems.push(
+          `${catalog}: ${source}: outcome "${outcome}" is not one of ${OUTCOMES.join("|")}`,
+        );
+      if (reason.length < 10)
+        problems.push(`${catalog}: ${source}: reason or applicability missing`);
+      if (outcome.toLowerCase() !== "not-applicable" && !TOPIC_PATH.test(docs))
+        problems.push(
+          `${catalog}: ${source}: ${outcome} record names no recommended project doc path`,
+        );
+    }
+  }
+  return problems;
+}
+
+/** Sources that must cite these named docs in their own text. */
+const REQUIRED_NAMED: Record<string, string[]> = {
+  ".bkit/core/prompts/bkit-plan-generate.md": [
+    "docs/architecture.md",
+    "docs/technology.md",
+    "docs/security.md",
+    "docs/testing.md",
+  ],
+  ".bkit/core/prompts/bkit-build-plan-convert.md": [
+    "docs/architecture.md",
+    "docs/technology.md",
+    "docs/security.md",
+    "docs/testing.md",
+  ],
+  ".bkit/core/docs/templates/bkit-plan.md": [
+    "docs/architecture.md",
+    "docs/technology.md",
+    "docs/security.md",
+    "docs/testing.md",
+    "docs/data-schema.md",
+    "docs/design.md",
+    "docs/observability.md",
+    "docs/deployments.md",
+  ],
+  ".bkit/core/workflows/bkit-design.md": ["docs/architecture.md"],
+  ".bkit/core/workflows/bkit-debug.md": ["docs/testing.md", "docs/noise.md"],
+  ".bkit/core/prompts/bkit-audit-generate.md": ["docs/architecture.md"],
+};
+
+function missingNamedRefs(): string[] {
+  return Object.entries(REQUIRED_NAMED).flatMap(([rel, refs]) => {
+    const text = readRepo(rel);
+    return refs.filter((r) => !text.includes(r)).map((r) => `${rel}: no reference to ${r}`);
+  });
+}
+
+describe("documentation responsibility inventory", () => {
+  it("covers the full documentation responsibility inventory", () => {
+    // The inventory itself is not vacuous.
+    expect(WORKFLOW_SOURCES).toContain(".bkit/core/workflows/bkit-debug.md");
+    expect(PROMPT_SOURCES).toContain(".bkit/core/prompts/bkit-plan-generate.md");
+    expect(PROMPT_SOURCES).toContain(".bkit/core/docs/templates/bkit-audit-adoption.md");
+    expect(PROMPT_SOURCES.length).toBeGreaterThan(40);
+
+    // Every starter the records point at ships from the relocated location.
+    const starters = fs.readdirSync(path.join(REPO_ROOT, ".bkit/templates/docs"));
+    expect(TOPICS.filter((t) => !starters.includes(`${t}.md`))).toEqual([]);
+
+    expect(coverageProblems(".bkit/core/.bkit/workflows.md", WORKFLOW_SOURCES)).toEqual([]);
+    expect(coverageProblems(".bkit/core/.bkit/prompts.md", PROMPT_SOURCES)).toEqual([]);
+    expect(missingNamedRefs()).toEqual([]);
+  });
+});
+
+/** Prompts and templates that produce a report with documentation gaps. */
+const WARNING_PRODUCERS = [
+  ".bkit/core/prompts/bkit-plan-generate.md",
+  ".bkit/core/prompts/bkit-build-plan-convert.md",
+  ".bkit/core/prompts/bkit-plan-update.md",
+  ".bkit/core/prompts/bkit-audit-generate.md",
+  ".bkit/core/prompts/bkit-utility-update-documentation.md",
+  ".bkit/core/prompts/bkit-ship-update-docs.md",
+  ".bkit/core/docs/templates/bkit-audit-documentation.md",
+  ".bkit/core/docs/templates/bkit-audit-adoption.md",
+];
+
+/** Workflows that carry the producers' warnings through their summary or return. */
+const WARNING_CARRIERS = [
+  "bkit-design",
+  "bkit-plan",
+  "bkit-build",
+  "bkit-debug",
+  "bkit-ship",
+  "bkit-auto",
+].map((n) => `.bkit/core/workflows/${n}.md`);
+
+/** Maintenance and audit sources that must check presence, the index and project content. */
+const MAINTENANCE = [
+  ".bkit/core/prompts/bkit-utility-update-documentation.md",
+  ".bkit/core/prompts/bkit-ship-update-docs.md",
+  ".bkit/core/docs/templates/bkit-audit-documentation.md",
+  ".bkit/core/docs/templates/bkit-audit-adoption.md",
+];
+
+function contractProblems(): string[] {
+  const problems: string[] = [];
+  for (const rel of WARNING_PRODUCERS) {
+    const text = readRepo(rel);
+    if (!text.includes(WARNING_HEADING)) problems.push(`${rel}: no "${WARNING_HEADING}" section`);
+    if (!text.includes("```jsonl")) problems.push(`${rel}: no jsonl warning record`);
+    for (const f of WARNING_FIELDS)
+      if (!text.includes(f)) problems.push(`${rel}: warning record lacks field ${f}`);
+    if (!/continue/i.test(text) || !/warn/i.test(text))
+      problems.push(`${rel}: no warn-and-continue behaviour`);
+  }
+  const plan = readRepo(".bkit/core/docs/templates/bkit-plan.md");
+  for (const heading of ["## Documentation Consultation", WARNING_HEADING])
+    if (!plan.includes(heading)) problems.push(`bkit-plan.md template: no "${heading}"`);
+  for (const rel of WARNING_CARRIERS)
+    if (!readRepo(rel).includes("Documentation Warnings"))
+      problems.push(`${rel}: does not carry Documentation Warnings`);
+  for (const rel of MAINTENANCE) {
+    const text = readRepo(rel);
+    if (/\.bkit\/shared\/docs/.test(text)) problems.push(`${rel}: probes the old shared docs`);
+    for (const [label, re] of [
+      ["presence (absent or missing documents)", /\b(absent|missing)\b/i],
+      ["index accuracy", /\bindex\b/i],
+      ["starter-only content", /starter/i],
+      ["a topic that does not apply", /not[- ]applicable|irrelevant/i],
+    ] as const)
+      if (!re.test(text)) problems.push(`${rel}: does not check ${label}`);
+  }
+  return problems;
+}
+
+/** Project documents that bkit must not manage: any managed starter, row or manifest entry. */
+function managedStarterProblems(): string[] {
+  const problems: string[] = [];
+  if (fs.existsSync(path.join(REPO_ROOT, ".bkit/shared/docs")))
+    problems.push(".bkit/shared/docs still exists");
+  const manifest = readRepo(".bkit/core/engine/install/manifest.ts");
+  for (const t of TOPICS)
+    if (manifest.includes(`"docs/${t}.md"`) || manifest.includes(`.bkit/shared/docs/${t}.md`))
+      problems.push(`manifest.ts manages docs/${t}.md`);
+  const index = readRepo(".bkit/core/.agents/docs.md");
+  const managed = index.slice(0, index.indexOf("<!-- bkit:end -->"));
+  for (const t of TOPICS)
+    if (managed.includes(`| \`docs/${t}.md\``))
+      problems.push(`.agents/docs.md managed block has a row for docs/${t}.md`);
+  return problems;
+}
+
+describe("documentation warning contracts", () => {
+  it("ships documentation warning contracts for plan and no-plan paths", () => {
+    expect(contractProblems()).toEqual([]);
+    expect(managedStarterProblems()).toEqual([]);
+  });
+});
diff --git a/.bkit/core/engine/audits/templates/template-shape.test.ts b/.bkit/core/engine/audits/templates/template-shape.test.ts
index 5ae3640e0..bb6620cbe 100644
--- a/.bkit/core/engine/audits/templates/template-shape.test.ts
+++ b/.bkit/core/engine/audits/templates/template-shape.test.ts
@@ -75,6 +75,8 @@ const PLAN_HEADINGS = [
   "### Core",
   "### Conditional",
   "### 🔒 Gate 1: Prerequisites Check",
+  "## Documentation Consultation",
+  "## Documentation Warnings",
   "## Data Schema Integration",
   "### Data Schema Usage",
   "### Data Schema Changes",
diff --git a/.bkit/core/engine/checks/after/index.test.ts b/.bkit/core/engine/checks/after/index.test.ts
index a8051cc69..2eea98424 100644
--- a/.bkit/core/engine/checks/after/index.test.ts
+++ b/.bkit/core/engine/checks/after/index.test.ts
@@ -995,3 +995,46 @@ describe("formatChecklist format contract", () => {
     expect(banner).toContain("--- 1/1 [advisory] single ---");
   });
 });
+
+// ---------------------------------------------------------------------------
+// Project documentation advisories through the shared pipeline
+// ---------------------------------------------------------------------------
+
+describe("project documentation advisories", () => {
+  it("reports and suppresses project documentation advisories without a blocker", () => {
+    fs.writeFileSync(path.join(tmpDir, "package.json"), JSON.stringify({ name: "root" }));
+
+    // Reported: an empty repo has no project documents and no index.
+    const reported = runPostInstallCheck([], tmpDir);
+    const docFindings = reported.filter((f) => f.id.startsWith("project-docs-"));
+    expect(docFindings.map((f) => f.id)).toEqual(
+      expect.arrayContaining(["project-docs-index-missing", "project-docs-missing"]),
+    );
+    expect(docFindings.every((f) => f.severity === "advisory")).toBe(true);
+    expect(reported.filter((f) => f.severity === "blocker").map((f) => f.id)).not.toContain(
+      "project-docs-missing",
+    );
+
+    // Rendered through the shared checklist and advisories artifact.
+    const checklist = formatChecklist(reported);
+    expect(checklist).toContain("[advisory] project-docs-missing");
+    expect(checklist).toContain("docs/architecture.md");
+    const md = renderAdvisoriesMarkdown(reported, { mode: "install", version: "2.2.0" });
+    expect(md).toContain("project-docs-missing");
+
+    // Suppressed: the existing bkit.advisories.ignore control drops the id and reports it.
+    fs.writeFileSync(
+      path.join(tmpDir, "package.json"),
+      JSON.stringify({
+        name: "root",
+        bkit: { advisories: { ignore: ["project-docs-missing"] } },
+      }),
+    );
+    const suppressed: SuppressionNote[] = [];
+    const after = runPostInstallCheck([], tmpDir, suppressed);
+    expect(after.some((f) => f.id === "project-docs-missing")).toBe(false);
+    expect(after.some((f) => f.id === "project-docs-index-missing")).toBe(true);
+    expect(suppressed).toContainEqual({ id: "project-docs-missing", scope: "." });
+    expect(formatChecklist(after, suppressed)).toContain("- project-docs-missing (.)");
+  });
+});
diff --git a/.bkit/core/engine/checks/after/index.ts b/.bkit/core/engine/checks/after/index.ts
index e637cd292..4779843ea 100644
--- a/.bkit/core/engine/checks/after/index.ts
+++ b/.bkit/core/engine/checks/after/index.ts
@@ -28,6 +28,7 @@ import {
 import {
   buildDepUpdaterSetupAdvisory,
   detectBkitStubs,
+  detectProjectDocs,
   detectValeMissing,
   detectValePackageNotSynced,
   detectWorkflowLintToolsMissing,
@@ -472,6 +473,9 @@ export function runPostInstallCheck(
   // bkit-stub sentinels in shipped templates — one advisory per still-commented stub.
   for (const stub of detectBkitStubs(cwd)) phase3.push(stub);
 
+  // Project documents (docs/*.md): missing, empty, starter-only or unindexed. Advisory only.
+  for (const f of detectProjectDocs(cwd, onSuppressed)) phase3.push(f);
+
   // turbo.json inputs for cache-replay safety (KN-24).
   for (const f of detectTurboIntegrationInputs(cwd)) phase3.push(f);
 
diff --git a/.bkit/core/engine/checks/after/tools.test.ts b/.bkit/core/engine/checks/after/tools.test.ts
index 513c3bab9..0a51c5b2d 100644
--- a/.bkit/core/engine/checks/after/tools.test.ts
+++ b/.bkit/core/engine/checks/after/tools.test.ts
@@ -10,7 +10,9 @@ import {
   detectWorkflowLintToolsMissing,
   detectBkitStubs,
   buildDepUpdaterSetupAdvisory,
+  detectProjectDocs,
 } from "./tools";
+import { LEGACY_STARTER_SOURCE_REVISION } from "../../install/project-docs";
 
 // ---------------------------------------------------------------------------
 // Module-level mock for node:child_process
@@ -413,3 +415,175 @@ describe("detectWorkflowLintToolsMissing", () => {
     expect(f?.detect).toContain("actionlint");
   });
 });
+
+// ---------------------------------------------------------------------------
+// detectProjectDocs — adoption and population advisories for the project documents
+// ---------------------------------------------------------------------------
+
+const STARTER_DIR = path.resolve(__dirname, "../../../../templates/docs");
+
+const INDEX_HEAD =
+  "<!-- bkit:start -->\nmanaged\n<!-- bkit:end -->\n\n## Project Documents\n\n" +
+  "| Doc | Design | Plan | Build | Debug | Ship | Scope |\n| --- | --- | --- | --- | --- | --- | --- |\n";
+
+function writeIndex(rows: Array<{ doc: string; scope?: string }>): void {
+  fs.mkdirSync(path.join(tmpDir, ".agents"), { recursive: true });
+  const body = rows
+    .map((r) => `| \`${r.doc}\` | ○ | ○ | ○ | ○ | ○ | ${r.scope ?? "Project doc."} |\n`)
+    .join("");
+  fs.writeFileSync(path.join(tmpDir, ".agents", "docs.md"), INDEX_HEAD + body);
+}
+
+function writeDoc(rel: string, text: string): void {
+  const abs = path.join(tmpDir, rel);
+  fs.mkdirSync(path.dirname(abs), { recursive: true });
+  fs.writeFileSync(abs, text);
+}
+
+const POPULATED =
+  "# Security\n\nAuth uses session cookies issued by the api service; rate limits live in the edge proxy.\n" +
+  "Secrets come from the host secret store and never reach the repo.\n";
+
+function stripLegacyWrapper(text: string): string {
+  return text
+    .split("\n")
+    .filter(
+      (l) =>
+        l !== "<!-- bkit:start -->" &&
+        l !== "<!-- bkit:end -->" &&
+        !l.startsWith("<!-- bkit:managed"),
+    )
+    .join("\n");
+}
+
+function allText(findings: Array<{ detect: string; action: string }>): string {
+  return findings.map((f) => `${f.detect}\n${f.action}`).join("\n");
+}
+
+describe("detectProjectDocs", () => {
+  it("distinguishes missing and empty project documentation from populated candidates", () => {
+    writeDoc("docs/security.md", POPULATED);
+    writeDoc("docs/testing.md", "   \n\n");
+    writeDoc("docs/setup.md", "");
+    writeIndex([{ doc: "docs/security.md" }, { doc: "docs/testing.md" }, { doc: "docs/setup.md" }]);
+
+    const findings = detectProjectDocs(tmpDir);
+
+    // Every finding is an advisory with a detect and an action, never a blocker.
+    expect(findings.length).toBeGreaterThan(0);
+    for (const f of findings) {
+      expect(f.severity).toBe("advisory");
+      expect(f.id).toMatch(/^project-docs-/);
+      expect(f.detect.length).toBeGreaterThan(0);
+      expect(f.action.length).toBeGreaterThan(0);
+    }
+
+    const missing = findings.find((f) => f.id === "project-docs-missing");
+    expect(missing).toBeDefined();
+    expect(missing!.detect).toContain("docs/architecture.md");
+    expect(missing!.detect).toContain("docs/deployments.md");
+    expect(missing!.detect).not.toContain("docs/security.md");
+    expect(missing!.detect).not.toContain("docs/testing.md");
+    expect(missing!.action).toContain(".bkit/templates/docs/");
+    expect(missing!.action).toContain(".agents/docs.md");
+
+    const empty = findings.find((f) => f.id === "project-docs-empty");
+    expect(empty).toBeDefined();
+    expect(empty!.detect).toContain("docs/testing.md");
+    expect(empty!.detect).toContain("docs/setup.md");
+    expect(empty!.detect).not.toContain("docs/security.md");
+
+    // The populated, indexed document is named by no finding.
+    expect(allText(findings)).not.toContain("docs/security.md");
+    // No claim that populated content is semantically complete.
+    expect(allText(findings).toLowerCase()).not.toContain("complete");
+    expect(findings.some((f) => f.id === "project-docs-index-missing")).toBe(false);
+  });
+
+  it("recognizes current and migrated untouched starters", async () => {
+    const starter = fs.readFileSync(path.join(STARTER_DIR, "architecture.md"), "utf-8");
+    // Current starter copied verbatim; a lightly edited placeholder-only copy of another starter.
+    writeDoc("docs/architecture.md", starter);
+    const techStarter = fs.readFileSync(path.join(STARTER_DIR, "technology.md"), "utf-8");
+    writeDoc("docs/technology.md", `${techStarter}\n\n\n`);
+    // A project that really wrote its document.
+    writeDoc("docs/security.md", POPULATED);
+    writeIndex([
+      { doc: "docs/architecture.md" },
+      { doc: "docs/technology.md" },
+      { doc: "docs/security.md" },
+    ]);
+
+    const cp = await vi.importActual<typeof import("node:child_process")>("node:child_process");
+    const legacy = cp.execFileSync(
+      "git",
+      ["show", `${LEGACY_STARTER_SOURCE_REVISION}:.bkit/shared/docs/noise.md`],
+      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], cwd: originalCwd },
+    );
+    // Migrated: the ownership wrapper lines are gone, the text is the shipped legacy text.
+    const migrated = stripLegacyWrapper(legacy);
+    writeDoc("docs/noise.md", migrated);
+    writeIndex([
+      { doc: "docs/architecture.md" },
+      { doc: "docs/technology.md" },
+      { doc: "docs/security.md" },
+      { doc: "docs/noise.md" },
+    ]);
+
+    const findings = detectProjectDocs(tmpDir);
+    const unpopulated = findings.find((f) => f.id === "project-docs-unpopulated");
+    expect(unpopulated).toBeDefined();
+    expect(unpopulated!.severity).toBe("advisory");
+    expect(unpopulated!.detect).toContain("docs/architecture.md");
+    expect(unpopulated!.detect).toContain("docs/technology.md");
+    expect(unpopulated!.detect).toContain("docs/noise.md");
+    expect(unpopulated!.detect).not.toContain("docs/security.md");
+    // The action names the repair and the alternative evidence.
+    expect(unpopulated!.action).toContain("docs/architecture.md");
+    expect(unpopulated!.action.toLowerCase()).toContain("equivalent");
+    // Indexed-but-untouched still warns even though the index lists it.
+    expect(findings.some((f) => f.id === "project-docs-missing")).toBe(true);
+    expect(allText(findings)).not.toContain("docs/security.md");
+  });
+
+  it("resolves an indexed equivalent without a missing default warning", () => {
+    writeDoc("handbook/security.md", POPULATED);
+    writeDoc("handbook/ops-testing.md", POPULATED);
+    writeIndex([
+      { doc: "handbook/security.md" },
+      { doc: "handbook/ops-testing.md", scope: "Equivalent to docs/testing.md" },
+    ]);
+
+    const findings = detectProjectDocs(tmpDir);
+    const missing = findings.find((f) => f.id === "project-docs-missing");
+    expect(missing).toBeDefined();
+    expect(missing!.detect).not.toContain("docs/security.md");
+    expect(missing!.detect).not.toContain("docs/testing.md");
+    expect(missing!.detect).toContain("docs/architecture.md");
+    expect(allText(findings)).not.toContain("handbook/security.md");
+
+    // An out-of-tree target is never read: its content reaches no finding, and the finding
+    // names the unsafe path instead of calling the topic populated.
+    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-outside-"));
+    try {
+      fs.writeFileSync(path.join(outside, "design.md"), "OUTSIDE-SECRET-CONTENT\n".repeat(20));
+      fs.mkdirSync(path.join(tmpDir, "docs"), { recursive: true });
+      fs.symlinkSync(path.join(outside, "design.md"), path.join(tmpDir, "docs", "design.md"));
+      writeIndex([
+        { doc: "docs/design.md" },
+        { doc: "../escape/noise.md", scope: "Equivalent to docs/noise.md" },
+      ]);
+      const readSpy = vi.spyOn(fs, "readFileSync");
+      const again = detectProjectDocs(tmpDir);
+      const reads = readSpy.mock.calls.map((c) => String(c[0]));
+      expect(reads.some((r) => r.startsWith(outside))).toBe(false);
+      expect(allText(again)).not.toContain("OUTSIDE-SECRET-CONTENT");
+      const ambiguous = again.find((f) => f.id === "project-docs-ambiguous");
+      expect(ambiguous).toBeDefined();
+      expect(ambiguous!.detect).toContain("docs/design.md");
+      expect(ambiguous!.severity).toBe("advisory");
+    } finally {
+      fs.rmSync(outside, { recursive: true, force: true });
+    }
+  });
+});
diff --git a/.bkit/core/engine/checks/after/tools.ts b/.bkit/core/engine/checks/after/tools.ts
index 13d869c8b..5d61664a7 100644
--- a/.bkit/core/engine/checks/after/tools.ts
+++ b/.bkit/core/engine/checks/after/tools.ts
@@ -6,6 +6,21 @@ import * as path from "node:path";
 import { spawnSync } from "node:child_process";
 import type { PreflightFinding } from "../before/index.js";
 import { readPackageJson } from "../../shared/package-json.js";
+import { readTextFile } from "../../shared/json.js";
+import { getPkgRoot } from "../../shared/package-roots.js";
+import {
+  PROJECT_DOC_TOPICS,
+  PROJECT_INDEX_PATH,
+  type ProjectDocTopic,
+  findIndexedEquivalent,
+  inspectRepoFile,
+  legacyStarterTopic,
+  normalizeLegacyText,
+  projectDocPath,
+  readProjectIndex,
+  starterPath,
+} from "../../install/project-docs.js";
+import { isAdvisorySuppressed, type SuppressionReporter } from "./suppression.js";
 import { ciWorkflowPath, readBkitConfig } from "../../shared/settings.js";
 import {
   DEP_UPDATER_NAMES,
@@ -415,3 +430,158 @@ export function buildDepUpdaterSetupAdvisory(cwd: string): PreflightFinding | nu
       'Use one updater, not both, and set `bkit.dependencies.updater` to its name (`"renovate"` or `"dependabot"`) in package.json. To silence this advisory, set it to `"none"`. See .bkit/templates.md.',
   };
 }
+
+// ---------------------------------------------------------------------------
+// Project documentation adoption and population
+// ---------------------------------------------------------------------------
+
+/** Text of a topic's current starter: the package copy first, then the consumer's own copy. */
+function readStarterText(cwd: string, topic: ProjectDocTopic): string | null {
+  for (const base of [getPkgRoot(), cwd]) {
+    const read = readTextFile(path.join(base, starterPath(topic)));
+    if (read.ok) return read.text;
+  }
+  return null;
+}
+
+/** True when `rel` is a repo-relative path with no parent or absolute segments. */
+function isInTreePath(rel: string): boolean {
+  if (rel === "" || path.isAbsolute(rel) || /^[A-Za-z]:/.test(rel)) return false;
+  return !rel.split(/[\\/]/).includes("..");
+}
+
+type DocAssessment = "empty" | "unpopulated" | "candidate";
+
+/** Mechanical read of a project document: empty, an untouched starter, or a candidate. */
+function assessDocText(cwd: string, topic: ProjectDocTopic, text: string): DocAssessment {
+  if (text.trim() === "") return "empty";
+  const normalized = normalizeLegacyText(text);
+  const legacy = legacyStarterTopic(text);
+  if (legacy === topic) return "unpopulated";
+  const starter = readStarterText(cwd, topic);
+  if (starter !== null && normalizeLegacyText(starter) === normalized) return "unpopulated";
+  // Headings, comments and rules only: nothing a project wrote.
+  const meaningful = normalized
+    .split("\n")
+    .map((l) => l.trim())
+    .filter(
+      (l) => l !== "" && !l.startsWith("#") && !/^<!--.*-->$/.test(l) && !/^[-*_|: ]+$/.test(l),
+    );
+  return meaningful.length === 0 ? "unpopulated" : "candidate";
+}
+
+/**
+ * Report the state of the ten project documents (`docs/architecture.md` ... `docs/setup.md`):
+ * the index missing, a document absent, empty, an untouched starter, present but unindexed, or
+ * unreadable. A document the index lists at another path (same basename, or a Scope cell
+ * `Equivalent to docs/<topic>.md`) counts for its topic. Findings are advisories only and read no
+ * file outside the repository. A document that differs from every starter is a candidate for
+ * the agent to assess; the mechanical read makes no claim about what it covers.
+ */
+export function detectProjectDocs(
+  cwd: string,
+  onSuppressed?: SuppressionReporter,
+): PreflightFinding[] {
+  const index = readProjectIndex(cwd);
+  const rows = index.status === "ok" ? index.rows : [];
+  const indexedPaths = new Set(rows.map((r) => r.path));
+  const missing: string[] = [];
+  const empty: string[] = [];
+  const unpopulated: string[] = [];
+  const unindexed: string[] = [];
+  const ambiguous: string[] = [];
+
+  for (const topic of PROJECT_DOC_TOPICS) {
+    const recommended = projectDocPath(topic);
+    const equivalent = findIndexedEquivalent(rows, topic);
+    const defaultState = inspectRepoFile(cwd, recommended);
+    let target = recommended;
+    if (defaultState === "absent") {
+      if (equivalent === null) {
+        missing.push(recommended);
+        continue;
+      }
+      target = equivalent;
+    }
+    if (!isInTreePath(target)) {
+      ambiguous.push(`${target} (${recommended}: it resolves outside the repository)`);
+      continue;
+    }
+    const state = target === recommended ? defaultState : inspectRepoFile(cwd, target);
+    if (state === "absent") {
+      missing.push(recommended);
+      continue;
+    }
+    if (state !== "regular") {
+      ambiguous.push(`${target} (${state.unsafe})`);
+      continue;
+    }
+    const read = readTextFile(path.join(cwd, target));
+    if (!read.ok) {
+      ambiguous.push(`${target} (it could not be read)`);
+      continue;
+    }
+    const assessed = assessDocText(cwd, topic, read.text);
+    if (assessed === "empty") empty.push(target);
+    else if (assessed === "unpopulated") unpopulated.push(target);
+    else if (index.status === "ok" && !indexedPaths.has(target)) unindexed.push(target);
+  }
+
+  const findings: PreflightFinding[] = [];
+  if (index.status === "missing") {
+    findings.push({
+      id: "project-docs-index-missing",
+      severity: "advisory",
+      detect: `${PROJECT_INDEX_PATH} is absent, so agents have no list of the project's own documents to consult.`,
+      action: `Run \`bkit install\` to write ${PROJECT_INDEX_PATH}, then add a row under \`## Project Documents\` for each project document you keep. Until then agents warn and fall back to repository evidence.`,
+    });
+  } else if (index.status === "unreadable") {
+    ambiguous.push(`${PROJECT_INDEX_PATH} (${index.reason})`);
+  }
+  if (missing.length > 0) {
+    findings.push({
+      id: "project-docs-missing",
+      severity: "advisory",
+      detect: `No project document covers: ${missing.join(", ")}.`,
+      action: `Copy the starter for each topic you want from \`.bkit/templates/docs/\` into \`docs/\`, fill it in from the repository, and add its row to \`## Project Documents\` in ${PROJECT_INDEX_PATH}. A document you already keep elsewhere counts: index it with \`Equivalent to <recommended path>\` in its Scope cell. Skip topics that do not apply.`,
+    });
+  }
+  if (empty.length > 0) {
+    findings.push({
+      id: "project-docs-empty",
+      severity: "advisory",
+      detect: `These project documents are empty: ${empty.join(", ")}.`,
+      action: `Write the project's facts into each file, or delete it and remove its row from ${PROJECT_INDEX_PATH}. Agents cannot use an empty document.`,
+    });
+  }
+  if (unpopulated.length > 0) {
+    findings.push({
+      id: "project-docs-unpopulated",
+      severity: "advisory",
+      detect: `These project documents still hold only the shipped starter text: ${unpopulated.join(", ")}.`,
+      action: `Replace the placeholders in ${unpopulated.join(", ")} with project facts taken from the repository, or index an equivalent document that already holds them (\`Equivalent to <recommended path>\` in the Scope cell of ${PROJECT_INDEX_PATH}). Agents warn about these topics until the text changes.`,
+    });
+  }
+  if (unindexed.length > 0) {
+    findings.push({
+      id: "project-docs-unindexed",
+      severity: "advisory",
+      detect: `These project documents exist but ${PROJECT_INDEX_PATH} does not list them: ${unindexed.join(", ")}.`,
+      action: `Add a row for each to \`## Project Documents\` in ${PROJECT_INDEX_PATH}, or run \`bkit upgrade\` to register the default paths.`,
+    });
+  }
+  if (ambiguous.length > 0) {
+    findings.push({
+      id: "project-docs-ambiguous",
+      severity: "advisory",
+      detect: `bkit did not read these project documents or the index: ${ambiguous.join("; ")}.`,
+      action: `Replace each with a regular file inside the repository (no symbolic link, no \`..\` path), or repair the \`## Project Documents\` table in ${PROJECT_INDEX_PATH}. bkit changes none of them itself.`,
+    });
+  }
+
+  return findings.filter((f) => {
+    if (!isAdvisorySuppressed(cwd, f.id, f.severity)) return true;
+    onSuppressed?.({ id: f.id, scope: "." });
+    return false;
+  });
+}
diff --git a/.bkit/core/engine/commands/workflow/summary.test.ts b/.bkit/core/engine/commands/workflow/summary.test.ts
index 2894ae4dd..89e03a1a5 100644
--- a/.bkit/core/engine/commands/workflow/summary.test.ts
+++ b/.bkit/core/engine/commands/workflow/summary.test.ts
@@ -828,6 +828,96 @@ describe("buildSummary", () => {
     ]);
   });
 
+  it("consolidates documentation warnings from the active run without changing its verdict", () => {
+    const record = (r: Record<string, string>) => JSON.stringify(r);
+    const report = (...records: string[]) =>
+      [
+        "Verdict: PASS",
+        "",
+        "## Documentation Warnings",
+        "",
+        "```jsonl",
+        ...records,
+        "```",
+        "",
+      ].join("\n");
+    const sec = {
+      topic: "security",
+      gap: "starter-only",
+      recommendedPath: "docs/security.md",
+      action: "Populate the security document with credential boundaries.",
+    };
+    const files = {
+      "log/build-plan-tasks-1-log.md": report(
+        record({ ...sec, alternativeEvidence: "EVIDENCE-FROM-TASKS-AGENT" }),
+      ),
+      "log/build-plan-verify-1-1.md": report(
+        record({ ...sec, topic: "Security", alternativeEvidence: "EVIDENCE-FROM-VERIFY-AGENT" }),
+        record({
+          topic: "testing",
+          gap: "missing",
+          recommendedPath: "docs/testing.md",
+          alternativeEvidence: "None available",
+          action: "Copy the testing starter and fill in the CI lanes.",
+        }),
+        "{ this line is not json",
+        record({ topic: "design", gap: "missing" }),
+      ),
+      // Untrusted raw input carrying a warning-shaped section.
+      "log/build-input-1.md": report(
+        record({ ...sec, topic: "deployments", gap: "RAW-INPUT-GAP", alternativeEvidence: "x" }),
+      ),
+      // A file of an earlier run: not one of this run's step artifacts.
+      "log/build-plan-tasks-0-log.md": report(
+        record({ ...sec, topic: "observability", gap: "OLD-RUN-GAP", alternativeEvidence: "y" }),
+      ),
+    };
+    const rows = [
+      {
+        type: "step-done",
+        step: "build-plan-tasks",
+        verdict: "PASS",
+        artifacts: ["log/build-plan-tasks-1-log.md", "log/missing-optional.md"],
+      },
+      {
+        type: "step-done",
+        step: "build-plan-verify",
+        verdict: "PASS",
+        artifacts: ["log/build-plan-verify-1-1.md", "log/build-input-1.md"],
+      },
+    ];
+    const baseline = buildSummary(input({ rows }));
+    const s = buildSummary(input({ rows, read: reader(files) }));
+
+    // Verdict, failures and next step are untouched.
+    expect(s.verdict).toBe(baseline.verdict);
+    expect(s.failures).toBe(baseline.failures);
+    expect(s.reasons).toEqual(baseline.reasons);
+    expect(s.nextStep).toBe(baseline.nextStep);
+    expect(s.markdown.split("\n").slice(0, 3)).toEqual([
+      "Verdict: PASS",
+      "Failures: 0",
+      "<!-- verdict:end -->",
+    ]);
+
+    expect(s.markdown).toContain("## Documentation Warnings");
+    // The same topic and gap from two agents appears once, with both pieces of evidence kept.
+    expect(s.markdown.split("Populate the security document").length - 1).toBe(1);
+    expect(s.markdown).toContain("EVIDENCE-FROM-TASKS-AGENT");
+    expect(s.markdown).toContain("EVIDENCE-FROM-VERIFY-AGENT");
+    // A distinct gap stays visible.
+    expect(s.markdown).toContain("Copy the testing starter and fill in the CI lanes.");
+    expect(s.markdown).toContain("docs/testing.md");
+    // Untrusted input, earlier runs and malformed records never surface as a current gap.
+    expect(s.markdown).not.toContain("RAW-INPUT-GAP");
+    expect(s.markdown).not.toContain("OLD-RUN-GAP");
+    expect(s.markdown).not.toContain("not json");
+    expect(s.markdown).not.toContain("docs/design.md");
+
+    // No warnings in the run: no section.
+    expect(baseline.markdown).not.toContain("## Documentation Warnings");
+  });
+
   it("counts a lettered Accept decision as accepted at the Decision Pause", () => {
     const decision = [
       "Status: ASSUMED",
@@ -863,4 +953,47 @@ describe("buildSummary", () => {
       "- Accepted: log/build-decision-1-1.md: Decision: Accept — fine by me",
     );
   });
+
+  it("reads pretty-printed and one-line warning records from a jsonl fence", () => {
+    const pretty = JSON.stringify(
+      {
+        topic: "security",
+        gap: "missing",
+        recommendedPath: "docs/security.md",
+        alternativeEvidence: "has } and { in text",
+        action: "PRETTY-ACTION",
+      },
+      null,
+      2,
+    );
+    const oneLine = JSON.stringify({
+      topic: "testing",
+      gap: "missing",
+      recommendedPath: "docs/testing.md",
+      alternativeEvidence: "e",
+      action: "ONELINE-ACTION",
+    });
+    const text = [
+      "Verdict: PASS",
+      "",
+      "## Documentation Warnings",
+      "",
+      "```jsonl",
+      "{ broken",
+      pretty,
+      oneLine,
+      "```",
+      "",
+    ].join("\n");
+    const s = buildSummary(
+      input({
+        rows: [
+          { type: "step-done", step: "build-plan-tasks", verdict: "PASS", artifacts: ["log/a.md"] },
+        ],
+        read: reader({ "log/a.md": text }),
+      }),
+    );
+    expect(s.markdown).toContain("PRETTY-ACTION");
+    expect(s.markdown).toContain("ONELINE-ACTION");
+  });
 });
diff --git a/.bkit/core/engine/commands/workflow/summary.ts b/.bkit/core/engine/commands/workflow/summary.ts
index 80267a7ea..51852041d 100644
--- a/.bkit/core/engine/commands/workflow/summary.ts
+++ b/.bkit/core/engine/commands/workflow/summary.ts
@@ -7,6 +7,7 @@ import { coversList, type Plan, type Workstream } from "./plans.js";
 import { issueIdOf, type FidTracker } from "./fids.js";
 import { parseDecisionItems } from "./decisions.js";
 import { parsePlanBlocks } from "./plan-blocks.js";
+import { parseJson } from "../../shared/json.js";
 import { challengeResolution, taskVerified } from "./summary-findings.js";
 
 export const SUMMARY_WORKFLOWS = ["plan", "design", "build", "debug", "ship"] as const;
@@ -132,6 +133,107 @@ const taskGroupOf = (r: Row) => {
   return typeof taskGroup === "number" ? taskGroup : undefined;
 };
 
+/** One consolidated documentation gap: a topic and gap key, with every distinct piece of evidence and action. */
+interface DocWarning {
+  topic: string;
+  gap: string;
+  recommendedPath: string;
+  evidence: string[];
+  actions: string[];
+}
+
+const WARNING_FIELDS = [
+  "topic",
+  "gap",
+  "recommendedPath",
+  "alternativeEvidence",
+  "action",
+] as const;
+/** Raw inputs (`*-input-N.md`) are untrusted: never a source of warnings. */
+const isRawInput = (rel: string) => /(^|\/)[a-z-]*-?input-[^/]*$/.test(rel);
+
+/**
+ * The top-level `{...}` objects in a fence body, in order. Each may span several lines (prettier
+ * rewrites a one-line record into that shape); braces inside strings are ignored. Text outside
+ * an object and an unterminated object are dropped.
+ */
+function jsonObjectChunks(body: string): string[] {
+  const chunks: string[] = [];
+  let depth = 0;
+  let start = -1;
+  let inString = false;
+  let escaped = false;
+  for (let i = 0; i < body.length; i++) {
+    const ch = body[i]!;
+    if (inString) {
+      if (escaped) escaped = false;
+      else if (ch === "\\") escaped = true;
+      else if (ch === '"') inString = false;
+      continue;
+    }
+    if (ch === '"' && depth > 0) inString = true;
+    else if (ch === "{") {
+      if (depth === 0) start = i;
+      depth++;
+    } else if (ch === "}" && depth > 0) {
+      depth--;
+      if (depth === 0) chunks.push(body.slice(start, i + 1));
+    }
+  }
+  if (depth > 0) {
+    // An unterminated object must not swallow the records after it: rescan after its first line.
+    const nl = body.indexOf("\n", start);
+    if (nl !== -1) chunks.push(...jsonObjectChunks(body.slice(nl + 1)));
+  }
+  return chunks;
+}
+
+/**
+ * The structured records under `## Documentation Warnings` (JSON objects, one per line or pretty-printed, in a
+ * `jsonl` fence) of the run's own step artifacts, merged by normalised topic and gap. A missing
+ * section, a malformed line or a record without all five non-empty fields is skipped.
+ */
+function documentationWarnings(rows: Row[], read: (rel: string) => string | null): DocWarning[] {
+  const merged = new Map<string, DocWarning>();
+  const seenFiles = new Set<string>();
+  for (const row of rows) {
+    if (row.type !== "step-done") continue;
+    for (const rel of artifactsOf(row)) {
+      if (!rel.endsWith(".md") || isRawInput(rel) || seenFiles.has(rel)) continue;
+      seenFiles.add(rel);
+      const text = read(rel);
+      if (text === null) continue;
+      const section = /^## Documentation Warnings[ \t]*\r?\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(
+        text,
+      );
+      const fence = section === null ? null : /```jsonl[ \t]*\r?\n([\s\S]*?)```/.exec(section[1]!);
+      if (fence === null) continue;
+      for (const chunk of jsonObjectChunks(fence[1]!)) {
+        const parsed = parseJson(chunk);
+        if (!parsed.ok) continue;
+        const value = parsed.value;
+        if (typeof value !== "object" || value === null || Array.isArray(value)) continue;
+        const rec = value as Record<string, unknown>;
+        const fields = WARNING_FIELDS.map((f) => rec[f]);
+        if (!fields.every((f): f is string => typeof f === "string" && f.trim() !== "")) continue;
+        const [topic, gap, recommendedPath, evidence, action] = fields.map((f) => f.trim());
+        const key = `${topic!.toLowerCase()}\u0000${gap!.toLowerCase()}`;
+        const found = merged.get(key) ?? {
+          topic: topic!.toLowerCase(),
+          gap: gap!.toLowerCase(),
+          recommendedPath: recommendedPath!,
+          evidence: [],
+          actions: [],
+        };
+        if (!found.evidence.includes(evidence!)) found.evidence.push(evidence!);
+        if (!found.actions.includes(action!)) found.actions.push(action!);
+        merged.set(key, found);
+      }
+    }
+  }
+  return [...merged.values()];
+}
+
 /** The run's step rows grouped per step (and task group), in first-seen order. */
 function stepGroups(rows: Row[]): StepGroup[] {
   const groups = new Map<string, StepGroup>();
@@ -500,6 +602,17 @@ export function buildSummary(input: SummaryInput): Summary {
       ...unconfirmed.map((u) => `- ${u}`),
     );
 
+  // Documentation warnings: advisory only, never part of the verdict.
+  const docWarnings = documentationWarnings(input.rows, read);
+  if (docWarnings.length > 0) {
+    out.push("", "## Documentation Warnings", "");
+    for (const w of docWarnings) {
+      out.push(`- **${w.topic}** (${w.gap}) — \`${w.recommendedPath}\``);
+      for (const e of w.evidence) out.push(`  - Evidence: ${e}`);
+      for (const a of w.actions) out.push(`  - Action: ${a}`);
+    }
+  }
+
   // Risks and action items.
   const items: string[] = [];
   for (const g of groups) {
diff --git a/.bkit/core/engine/commands/workflow/workflows.integration.test.ts b/.bkit/core/engine/commands/workflow/workflows.integration.test.ts
new file mode 100644
index 000000000..628cc5aca
--- /dev/null
+++ b/.bkit/core/engine/commands/workflow/workflows.integration.test.ts
@@ -0,0 +1,195 @@
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+
+import { afterEach, describe, expect, it } from "vitest";
+
+import { runCommand } from "../lib";
+import { COMMANDS } from "../registry";
+
+const FID = "864-doc-warnings";
+const MONTH = "202611";
+const LOG = `docs/plans/${MONTH}/logs/${FID}`;
+const STATUS = `${LOG}/status.jsonl`;
+const SUMMARY = `${LOG}/plan-summary.md`;
+const dirs: string[] = [];
+let tick = 0;
+const at = () => new Date(Date.UTC(2026, 10, 1, 0, 0, tick++)).toISOString();
+const jsonl = (rows: object[]) => rows.map((row) => `${JSON.stringify(row)}\n`).join("");
+
+const write = (cwd: string, file: string, body: string) => {
+  fs.mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true });
+  fs.writeFileSync(path.join(cwd, file), body);
+};
+const read = (cwd: string, file: string) => fs.readFileSync(path.join(cwd, file), "utf8");
+
+const warning = (r: Record<string, string>) => JSON.stringify(r);
+const report = (...records: string[]) =>
+  ["Verdict: PASS", "", "## Documentation Warnings", "", "```jsonl", ...records, "```", ""].join(
+    "\n",
+  );
+
+const SECURITY = {
+  topic: "security",
+  gap: "starter-only",
+  recommendedPath: "docs/security.md",
+  action: "Populate the security document with credential boundaries.",
+};
+const TESTING = {
+  topic: "testing",
+  gap: "missing",
+  recommendedPath: "docs/testing.md",
+  alternativeEvidence: "None available",
+  action: "Copy the testing starter and fill in the CI lanes.",
+};
+
+const stepDone = (step: string, artifacts: string[]) => ({
+  type: "step-done",
+  workflow: "plan",
+  step,
+  status: "DONE",
+  verdict: "PASS",
+  at: at(),
+  artifacts,
+});
+const started = () => ({ type: "workflow-started", workflow: "plan", at: at(), limits: {} });
+
+function repo() {
+  const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-docwarn-")));
+  dirs.push(cwd);
+  write(
+    cwd,
+    "package.json",
+    JSON.stringify({
+      name: "docwarn-fixture",
+      private: true,
+      bkit: { tracker: { default: "none" } },
+    }),
+  );
+  return cwd;
+}
+
+async function summarize(cwd: string) {
+  const out: string[] = [];
+  const err: string[] = [];
+  const code = await runCommand(
+    ["workflows", "summary", "--workflow=plan", `--file=${STATUS}`, "--json"],
+    COMMANDS,
+    {
+      cwd,
+      classicVerbs: new Set(),
+      io: { stdout: (text) => out.push(text), stderr: (text) => err.push(text) },
+    },
+  );
+  return { code, json: out.length ? JSON.parse(out.join("")) : undefined, err: err.join("") };
+}
+
+const count = (text: string, needle: string) => text.split(needle).length - 1;
+
+afterEach(() => {
+  for (const dir of dirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true });
+});
+
+describe("workflows summary documentation warnings", () => {
+  it("reports only attributed documentation warnings for the active run", async () => {
+    const cwd = repo();
+    // Run 1: an earlier run left a gap that this run does not repeat.
+    write(
+      cwd,
+      `${LOG}/plan-generate-1.md`,
+      report(
+        warning({
+          ...SECURITY,
+          topic: "observability",
+          gap: "OLD-RUN-GAP",
+          alternativeEvidence: "o",
+        }),
+      ),
+    );
+    // Run 2 (active): two agents report the same gap, one reports a distinct gap.
+    write(
+      cwd,
+      `${LOG}/plan-review-2.md`,
+      report(warning({ ...SECURITY, alternativeEvidence: "EVIDENCE-FROM-REVIEW" })),
+    );
+    write(
+      cwd,
+      `${LOG}/plan-verify-2.md`,
+      report(
+        warning({ ...SECURITY, alternativeEvidence: "EVIDENCE-FROM-VERIFY" }),
+        warning(TESTING),
+      ),
+    );
+    // Raw input: warning-shaped, but not an attributed artifact of the run.
+    write(
+      cwd,
+      `${LOG}/plan-input-2.md`,
+      report(
+        warning({
+          ...SECURITY,
+          topic: "deployments",
+          gap: "RAW-INPUT-GAP",
+          alternativeEvidence: "r",
+        }),
+      ),
+    );
+    write(
+      cwd,
+      STATUS,
+      jsonl([
+        started(),
+        stepDone("plan-generate", [`${LOG}/plan-generate-1.md`]),
+        { type: "workflow-done", workflow: "plan", at: at() },
+        started(),
+        stepDone("plan-review", [`${LOG}/plan-review-2.md`, `${LOG}/never-written-optional.md`]),
+        stepDone("plan-verify", [`${LOG}/plan-verify-2.md`]),
+      ]),
+    );
+
+    const first = await summarize(cwd);
+    expect(first.err).toBe("");
+    expect(first.code).toBe(0);
+    const markdown = read(cwd, SUMMARY);
+
+    // The verdict is the one the steps decide: warnings change nothing.
+    expect(markdown.split("\n").slice(0, 3)).toEqual([
+      "Verdict: PASS",
+      "Failures: 0",
+      "<!-- verdict:end -->",
+    ]);
+    expect(first.json.verdict).toBe("PASS");
+    expect(first.json.failures).toBe(0);
+
+    expect(markdown).toContain("## Documentation Warnings");
+    expect(count(markdown, "Populate the security document")).toBe(1);
+    expect(markdown).toContain("EVIDENCE-FROM-REVIEW");
+    expect(markdown).toContain("EVIDENCE-FROM-VERIFY");
+    expect(count(markdown, "Copy the testing starter and fill in the CI lanes.")).toBe(1);
+    expect(markdown).not.toContain("OLD-RUN-GAP");
+    expect(markdown).not.toContain("RAW-INPUT-GAP");
+
+    // A later run that still has the unresolved gap reports it again, and only it.
+    write(
+      cwd,
+      `${LOG}/plan-verify-3.md`,
+      report(warning({ ...SECURITY, alternativeEvidence: "LATER-RUN-EVIDENCE" })),
+    );
+    fs.appendFileSync(
+      path.join(cwd, STATUS),
+      jsonl([
+        { type: "workflow-done", workflow: "plan", at: at() },
+        started(),
+        stepDone("plan-verify", [`${LOG}/plan-verify-3.md`]),
+      ]),
+    );
+    const later = await summarize(cwd);
+    expect(later.code).toBe(0);
+    const laterMarkdown = read(cwd, SUMMARY);
+    expect(laterMarkdown).toContain("## Documentation Warnings");
+    expect(count(laterMarkdown, "Populate the security document")).toBe(1);
+    expect(laterMarkdown).toContain("LATER-RUN-EVIDENCE");
+    expect(laterMarkdown).not.toContain("EVIDENCE-FROM-REVIEW");
+    expect(laterMarkdown).not.toContain("Copy the testing starter");
+    expect(laterMarkdown.split("\n")[0]).toBe("Verdict: PASS");
+  });
+});
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index f9a60c90a..f7b0fe775 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -416,6 +416,7 @@ _No tracker connected, skip step._
    Context: You are a subagent in the Build phase. Write the plan in task-block form. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. **If** `CONVERT_RETRY` is held → add `Your last plan failed the plan check: {CONVERT_RETRY}. Fix only those problems.` **If** `NEWER_COMMENTS` > 0 → add `{NEWER_COMMENTS} issue comments are newer than the plan; write what they change into it.` Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Check command: `"{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"`.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md` (if present), `docs/templates/bkit-plan.md`.
    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
+   Project documents: the converted plan carries `Documentation Consultation` and `Documentation Warnings`, and each task that touches an assessed topic names its `READ` / `UPDATE` documents. Later steps read those sources and warn from applicable tasks; a missing or starter-only document warns and the run continues.
 3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
@@ -1037,6 +1038,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" workflows summary --workflow=build --file="{STATUS}" --publish={PUBLISH}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 3. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --number=15 --post --title=Summary --link-ref={BRANCH} --comment-body --message="chore({FID}): summary"
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
index 1af8b389a..d08d24b1c 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
@@ -418,6 +418,7 @@ _No tracker connected, skip step._
    Read: `{CI_SELECTION_FILE}`, `docs/plans/{YYYYMM}/logs/{FID}/debug-input-{DEBUG_ATTEMPT}.md`, the current-generation `context-*` artifacts recorded in Step 4.
    Update: Test files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-reproduce-{NORMAL_ATTEMPT}.md`.
+   Project documents: a debug run has no plan, so the subagents read the `.agents/docs.md` index and consult `docs/testing.md` for the test tiers and `docs/noise.md` for registered signal downgrades (also `docs/observability.md` or `docs/architecture.md` when they are present and relevant to the failure). A missing index or a missing, empty or starter-only document is a warning: continue from repository evidence, and record the gap in `## Documentation Warnings`. A handover keeps the unresolved warnings.
 2. Finish — commits the test:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-failure-reproduce --field=ciGeneration={CI_GENERATION} --attempt-of=debug-run-tests:current --agent=bkit-debug-failure-reproduce --artifact="docs/plans/{YYYYMM}/logs/{FID}/debug-failure-reproduce-<attempt>.md" --message="test({FID}): reproduce reported failure" --number=5 --post --title="Failure Reproduce"
@@ -561,6 +562,7 @@ _No tracker connected, skip step._
    "{BKIT}" workflows summary --workflow=debug --file="{STATUS}"
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 2. Finish:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md --message="chore({FID}): summary" --verbose-ci-local --number=10 --post --title="Summary" --link-ref={BRANCH} --comment-body
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt
index ea761e607..c43d42b1c 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt
@@ -290,6 +290,7 @@ _No tracker connected, skip step._
    Context: You are a subagent in the Design phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Inputs carry distinct lenses. Merge across them, and do not collapse them to a consensus.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/design-input-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-1.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-2.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-3.md`, `docs/plans/{YYYYMM}/logs/{FID}/related-issues.md` (if present), `docs/plans/{YYYYMM}/{FID}-design.md` (if present — superseded design, context only, not a constraint).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md`.
+   Project documents: a design needs no plan, so the subagent reads the `.agents/docs.md` index and consults `docs/architecture.md` (boundaries and topology), plus `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/design.md`, `docs/observability.md` or `docs/deployments.md` when the design touches them. A missing index or a missing, empty or starter-only document is a warning: continue from repository evidence, and record the gap in `## Documentation Warnings` (one `jsonl` record per gap with `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action`).
 2. Finish:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=design --step=design-generate --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md --message="chore({FID}): design-generate" --number=5 --post --title="Generate Design" --link-ref=dev
@@ -409,6 +410,7 @@ _No tracker connected, skip step._
    "{BKIT}" workflows summary --workflow=design --file="{STATUS}"
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 3. Finish, then push with exactly one command:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=design --step=design-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/design-summary.md --message="chore({FID}): summary bkit [skip ci]" --number=10 --post --title=Summary --link-ref=dev --comment-body
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
index c7386ceef..7d4ba5913 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
@@ -184,6 +184,7 @@ _No tracker connected, skip step._
    Context: You are a subagent in the Plan phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. Workstreams this plan covers: {WORKSTREAMS}.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present — superseded plan, context only, not a constraint).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`.
+   Project documents: `@bkit-plan-generate` fills `Documentation Consultation` and `Documentation Warnings` in the plan. The review and apply-review steps keep those sources; a gap is a warning that continues the run, never a stop.
    **If** the draft still holds `PENDING` → invoke `@bkit-plan-generate` once more with Context `"Fill only the sections still marked PENDING and the empty groups; leave every finished section as it is."` and the plan caps and workstreams above, Read: the same inputs, Update: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`.
 2. Check the draft's groups and task blocks, and that every symbol it names exists:
    ```bash
@@ -343,6 +344,7 @@ _No tracker connected, skip step._
    "{BKIT}" workflows summary --workflow=plan --file="{STATUS}" --plan={PLAN_FINAL}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 4. Finish, then push the summary commit:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/plan-summary.md --message="chore({FID}): summary bkit [skip ci]" --number=7 --post --title=Summary --link-ref=dev --comment-body
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
index 9534fb403..4ca65b917 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
@@ -426,6 +426,7 @@ _No tracker connected, skip step._
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`), `{OUTBOX}/ship-pending-items.md`.
    Update: Doc files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md`.
+   Documentation maintenance findings (unresolved coverage and the `## Documentation Warnings` records) stay in the ship summary next to the edits; a missing document is reported and the ship continues.
 3. Wait for the subagent to complete. Then append the `SHIPPED` row to the worktree ledger, re-render the mechanical `roadmap-status` board from it, and finish the step (bookkeeping to `$BOOK_ROOT`). The block exits 1 when the row did not land:
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
@@ -436,6 +437,7 @@ _No tracker connected, skip step._
    "{BKIT}" workflows summary --workflow=ship --file="{STATUS}" --pr={PR_NUMBER}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 5. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --commit=none --number=6 --post --title="Update Docs & Summary" --link-ref=dev --comment-body
diff --git a/.bkit/core/prompts/bkit-audit-generate.md b/.bkit/core/prompts/bkit-audit-generate.md
index 53d7526da..f5f974519 100644
--- a/.bkit/core/prompts/bkit-audit-generate.md
+++ b/.bkit/core/prompts/bkit-audit-generate.md
@@ -129,7 +129,20 @@ autoCompactWindow: 300000
      - **If** it exits non-zero → **STOP** and report the reason.
      - NEVER hand-write or edit the `bkit:anchor` block or the `bkit:outdated` line the stamp writes under it.
 3. Read every supplied input once at the start, and work from what it says, not from session memory. Do not re-read the template on every loop iteration.
-4. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+4. Read the `.agents/docs.md` index, and load the project documents the audit's surface needs, with or without a plan: `docs/architecture.md` for structure and boundaries, `docs/technology.md` for stack choices, `docs/security.md` for trust boundaries, `docs/testing.md` for test and gate rules, plus `docs/data-schema.md`, `docs/design.md`, `docs/observability.md`, `docs/deployments.md`, `docs/noise.md` or `docs/setup.md` when the audit's surface touches them.
+   - Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Mark an irrelevant topic not applicable, with the reason.
+   - Safeguards that need genuine evidence stay in force (secrets, permissions, untrusted input).
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "testing",
+       "gap": "missing",
+       "recommendedPath": "docs/testing.md",
+       "alternativeEvidence": "The CI workflow defines the lanes.",
+       "action": "Copy the testing starter and describe the project's tiers and lanes."
+     }
+     ```
 5. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
    - **If** a section has no content → `None`.
 6. Populate the template sections in template order, without changing the order. Take each section's shape from the template and every rule from this prompt, and verify every gate before you proceed:
diff --git a/.bkit/core/prompts/bkit-build-challenge-1.md b/.bkit/core/prompts/bkit-build-challenge-1.md
index bd997ada4..b2fb85887 100644
--- a/.bkit/core/prompts/bkit-build-challenge-1.md
+++ b/.bkit/core/prompts/bkit-build-challenge-1.md
@@ -55,7 +55,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/security.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each finding: append the entry at EOF with Bash `echo {log entry} >> {output}`.
    - **If** the entry spans several lines → append it with a heredoc instead.
    - **If** any finding is `CRITICAL` → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
diff --git a/.bkit/core/prompts/bkit-build-challenge-2.md b/.bkit/core/prompts/bkit-build-challenge-2.md
index 289e91721..715b9b323 100644
--- a/.bkit/core/prompts/bkit-build-challenge-2.md
+++ b/.bkit/core/prompts/bkit-build-challenge-2.md
@@ -59,7 +59,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/security.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/security.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each finding: append the entry at EOF with Bash `echo {log entry} >> {output}`.
    - **If** the entry spans several lines → append it with a heredoc instead.
    - **If** any finding is `CRITICAL` → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
diff --git a/.bkit/core/prompts/bkit-build-install-skills.md b/.bkit/core/prompts/bkit-build-install-skills.md
index 8a7e884ca..746c27554 100644
--- a/.bkit/core/prompts/bkit-build-install-skills.md
+++ b/.bkit/core/prompts/bkit-build-install-skills.md
@@ -49,7 +49,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Identify the technologies that the feature requires.
 4. List the folder names under `.agents/skills/`, without reading the folders' contents. Each folder name is the identity of one installed skill when you look for gaps.
 5. Identify each skill gap: a required technology that no folder name matches.
diff --git a/.bkit/core/prompts/bkit-build-plan-convert.md b/.bkit/core/prompts/bkit-build-plan-convert.md
index 47fed6152..9bd8596f2 100644
--- a/.bkit/core/prompts/bkit-build-plan-convert.md
+++ b/.bkit/core/prompts/bkit-build-plan-convert.md
@@ -62,10 +62,24 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
+   - Read the `.agents/docs.md` index, and consult the project documents the converted tasks need: always assess `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md`; add `docs/data-schema.md` when a task changes the database, `docs/design.md` for UI work, `docs/observability.md` for logging, `docs/deployments.md` for release or CI work, and `docs/noise.md` or `docs/setup.md` when a task touches them.
+     - Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+     - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Mark an irrelevant topic not applicable, with the reason.
+     - Record each topic, the path and section used, coverage, gap and action in the plan's `Documentation Consultation`, and put each `READ` / `UPDATE` line for these documents in the task that needs it.
+     - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+       ```jsonl
+       {
+         "topic": "security",
+         "gap": "starter-only",
+         "recommendedPath": "docs/security.md",
+         "alternativeEvidence": "The CI configuration defines token permissions.",
+         "action": "Populate the security document with the project's credential and permission boundaries."
+       }
+       ```
 2. Read `docs/templates/bkit-plan.md` § `Agent Execution Runbook` for the shape of a group and of a task block. The rules for filling them are the **Runbook tasks**, **TEST FIRST** and **TEST EXCEPTION** clauses above.
 3. Set up the plan file:
-   - **If** the plan file exists → keep every section except `Agent Execution Runbook` as written, and rewrite the runbook.
-   - **Else** → create the plan with `# {title} Implementation Plan`, `## Context & Goals` (the goal in 1-3 lines), `## Reuse Inventory` and `## Agent Execution Runbook`.
+   - **If** the plan file exists → keep every section except `Agent Execution Runbook` as written (add or refresh `Documentation Consultation` and `Documentation Warnings` from step 1), and rewrite the runbook.
+   - **Else** → create the plan with `# {title} Implementation Plan`, `## Context & Goals` (the goal in 1-3 lines), `## Documentation Consultation`, `## Documentation Warnings`, `## Reuse Inventory` and `## Agent Execution Runbook`.
    - In both cases, carry over every end state and test that the inputs name, in their order. You may tighten them, but never weaken them.
 4. Split the work into tasks, each one a testable change, and group the tasks in build order:
    - Keep each group within the per-group plan caps that your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all).
diff --git a/.bkit/core/prompts/bkit-build-plan-current.md b/.bkit/core/prompts/bkit-build-plan-current.md
index 79504e46f..91b635cc0 100644
--- a/.bkit/core/prompts/bkit-build-plan-current.md
+++ b/.bkit/core/prompts/bkit-build-plan-current.md
@@ -54,7 +54,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each affected task: append the entry at EOF with Bash `echo {log entry} >> {output}`.
    - **If** the entry spans several lines → append it with a heredoc instead.
    - **If** any task `Broken` → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
diff --git a/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md b/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
index fd03eb828..402a7101f 100644
--- a/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
+++ b/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
@@ -80,7 +80,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/testing.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Read the inputs, and find where to resume:
    - **If** Context `Mode` = `Holistic` → read the holistic verify report and every log. Each line of its `Identified Gaps Log` is one gap. Read the plan's task block of each task a gap names; no group gate log is supplied.
    - **Else** → read the group's briefs (their task blocks), the plan gaps, the group gate log when one is supplied, and every log. Each failure in the group gate log is one gap. In the logs, `DONE` = done and `BLOCKED` = blocked.
diff --git a/.bkit/core/prompts/bkit-build-plan-tasks.md b/.bkit/core/prompts/bkit-build-plan-tasks.md
index f62aaf3fa..8581832dd 100644
--- a/.bkit/core/prompts/bkit-build-plan-tasks.md
+++ b/.bkit/core/prompts/bkit-build-plan-tasks.md
@@ -88,7 +88,7 @@ autoCompactWindow: 300000
    - **If** **Create** already exists → set its `Verdict` to `PENDING` with `Edit`, and keep every log line.
    - **Else** → Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Read the supplied brief (`build-brief-{GROUP}-{n}.md`):
    - Its task blocks are the work, in order.
    - Its earlier tasks are context only.
diff --git a/.bkit/core/prompts/bkit-build-plan-tests.md b/.bkit/core/prompts/bkit-build-plan-tests.md
index 43a69ed1d..71ecb385c 100644
--- a/.bkit/core/prompts/bkit-build-plan-tests.md
+++ b/.bkit/core/prompts/bkit-build-plan-tests.md
@@ -67,7 +67,7 @@ autoCompactWindow: 300000
    - **If** **Create** already exists → set its `Verdict` to `PENDING` with `Edit`, and keep every log line.
    - **Else** → Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Read the supplied brief (`build-brief-tests-{GROUP}-{n}.md`):
    - Its task blocks' `TEST FIRST` entries are the work, in order; the rest of each block says what the test is for.
    - Its `Derived Test Matrix rows` say what each test asserts.
diff --git a/.bkit/core/prompts/bkit-build-plan-verify.md b/.bkit/core/prompts/bkit-build-plan-verify.md
index cc7abc654..ebc50ebd7 100644
--- a/.bkit/core/prompts/bkit-build-plan-verify.md
+++ b/.bkit/core/prompts/bkit-build-plan-verify.md
@@ -60,7 +60,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
    - For each gap, append the entry at EOF with Bash `echo {log entry} >> {output}`.
      - **If** the entry spans several lines → append it with a heredoc instead.
diff --git a/.bkit/core/prompts/bkit-debug-abort-handover.md b/.bkit/core/prompts/bkit-debug-abort-handover.md
index b41f01600..7758235af 100644
--- a/.bkit/core/prompts/bkit-debug-abort-handover.md
+++ b/.bkit/core/prompts/bkit-debug-abort-handover.md
@@ -52,12 +52,13 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Extract `Rot Signals` from the diagnose attempts, and aggregate them into the handover: dedupe the slugs, and keep all the evidence.
 6. Extract `Out-of-Scope Recommendations` from the diagnose attempts, and aggregate them: dedupe the paths, and keep all the rationales.
-7. Append one row per failure to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
-8. Append one row per deferral to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
+7. Collect the `## Documentation Warnings` records from the diagnose, remediate and verify logs of the run, and copy them verbatim into the handover's `Documentation Warnings` section, dropping exact duplicates. Take no records from raw `*-input-*.md` files.
+8. Append one row per failure to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
+9. Append one row per deferral to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
 
 **Output format:**
 
@@ -100,6 +101,10 @@ autoCompactWindow: 300000
 
 [Which option to take, and why. Initially set to `PENDING`.]
 
+## Documentation Warnings
+
+[The deduped records of the run's `## Documentation Warnings` sections, verbatim, in one `jsonl` fence with one JSON object per record. **If** none → `None`. Initially set to `PENDING`.]
+
 ## Reference Docs
 
 [The prior diagnoses, prior remediations, CI runs and observability evidence. Initially set to `PENDING`.]
diff --git a/.bkit/core/prompts/bkit-debug-failure-diagnose.md b/.bkit/core/prompts/bkit-debug-failure-diagnose.md
index 8f20a9043..ebcaa3c9d 100644
--- a/.bkit/core/prompts/bkit-debug-failure-diagnose.md
+++ b/.bkit/core/prompts/bkit-debug-failure-diagnose.md
@@ -62,7 +62,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory. The CI and runtime logs are the primary signal.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` and `docs/noise.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Read `Strategy` from the input Context. **If** it is missing → set `Verdict` = `FAIL` in **Create**, change no other file, and go straight to the final return. Apply the matching strategy:
    - `STANDARD` → run a targeted diagnosis.
diff --git a/.bkit/core/prompts/bkit-debug-failure-remediate.md b/.bkit/core/prompts/bkit-debug-failure-remediate.md
index d1f446419..c2fd15c77 100644
--- a/.bkit/core/prompts/bkit-debug-failure-remediate.md
+++ b/.bkit/core/prompts/bkit-debug-failure-remediate.md
@@ -59,7 +59,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each remediation: append `DONE|BLOCKED` at EOF with Bash `echo {log entry} >> {output}`.
 5. Read `Strategy` from the input Context. **If** it is missing → set `Verdict` = `FAIL` in **Create**, change no other file, and go straight to the final return. Apply the matching strategy:
    - `STANDARD` → apply the diagnosis as written.
diff --git a/.bkit/core/prompts/bkit-debug-failure-reproduce.md b/.bkit/core/prompts/bkit-debug-failure-reproduce.md
index 772d1b246..34c28645a 100644
--- a/.bkit/core/prompts/bkit-debug-failure-reproduce.md
+++ b/.bkit/core/prompts/bkit-debug-failure-reproduce.md
@@ -54,7 +54,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory. The bug report in `debug-input-*.md` is the primary signal.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Choose where the tests go:
    - Pick the lowest tier that reaches the reported behaviours: unit before integration before e2e.
    - Co-locate them with the tests that cover the affected areas, and match those tests' imports, helpers and naming.
diff --git a/.bkit/core/prompts/bkit-debug-failure-soak.md b/.bkit/core/prompts/bkit-debug-failure-soak.md
index 4acba224e..cfc9fad34 100644
--- a/.bkit/core/prompts/bkit-debug-failure-soak.md
+++ b/.bkit/core/prompts/bkit-debug-failure-soak.md
@@ -63,7 +63,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Decide the single next step from the accumulated context:
    - **If** the cause is unknown → instrument the suspected surface: add `[DEBUG-OBSERVE]` logging, with no behaviour change.
    - **Else**:
diff --git a/.bkit/core/prompts/bkit-design-brainstorm-ideate-1.md b/.bkit/core/prompts/bkit-design-brainstorm-ideate-1.md
index b2ba08944..0507c785a 100644
--- a/.bkit/core/prompts/bkit-design-brainstorm-ideate-1.md
+++ b/.bkit/core/prompts/bkit-design-brainstorm-ideate-1.md
@@ -47,7 +47,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/technology.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Propose 2-3 approaches from the current constraints: existing code, minimal new infrastructure and the fastest path to ship.
    - Lead with the recommended approach.
    - Keep each approach in the existing stack, with no greenfield build and no hypothetical infrastructure.
diff --git a/.bkit/core/prompts/bkit-design-brainstorm-ideate-2.md b/.bkit/core/prompts/bkit-design-brainstorm-ideate-2.md
index a67af1a06..4b5d4cee8 100644
--- a/.bkit/core/prompts/bkit-design-brainstorm-ideate-2.md
+++ b/.bkit/core/prompts/bkit-design-brainstorm-ideate-2.md
@@ -45,7 +45,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/technology.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Propose 2-3 approaches from first principles: the best long-term shape if the existing constraints did not matter.
    - Lead with the recommended approach.
    - Ignore "we already have X" as a default.
diff --git a/.bkit/core/prompts/bkit-design-brainstorm-ideate-3.md b/.bkit/core/prompts/bkit-design-brainstorm-ideate-3.md
index ef33f3099..9f79dde6c 100644
--- a/.bkit/core/prompts/bkit-design-brainstorm-ideate-3.md
+++ b/.bkit/core/prompts/bkit-design-brainstorm-ideate-3.md
@@ -46,7 +46,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/security.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Propose 2-3 approaches framed by failure mode, not by happy-path shape.
    - Lead with the recommended approach.
    - For each approach, include additive risk-mitigation guidance to layer onto whichever approach is picked, not separate "safer" approaches.
diff --git a/.bkit/core/prompts/bkit-design-generate.md b/.bkit/core/prompts/bkit-design-generate.md
index 4ea663c30..811ec976b 100644
--- a/.bkit/core/prompts/bkit-design-generate.md
+++ b/.bkit/core/prompts/bkit-design-generate.md
@@ -59,7 +59,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Do not `cp` an existing input.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md`, `docs/technology.md` and `docs/security.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Identify the themes, complementary ideas, conflicts and related issues.
    - Layer the risk-premortem mitigations onto the selected approach. They are additive, not a separate approach.
diff --git a/.bkit/core/prompts/bkit-design-organise.md b/.bkit/core/prompts/bkit-design-organise.md
index 0d7129293..34c9b3ef5 100644
--- a/.bkit/core/prompts/bkit-design-organise.md
+++ b/.bkit/core/prompts/bkit-design-organise.md
@@ -56,7 +56,7 @@ autoCompactWindow: 300000
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" steps stub --from="<Read>" --to="<Create>" --strip-header
    ```
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Identify the decomposition boundaries: domain boundaries, organisational structure and chronological dependencies. Do not use token or context-window size as a factor.
 5. Group the design work into workstreams at the identified boundaries.
 6. For each workstream:
diff --git a/.bkit/core/prompts/bkit-design-review-1.md b/.bkit/core/prompts/bkit-design-review-1.md
index ca740d6e5..8a6479f0d 100644
--- a/.bkit/core/prompts/bkit-design-review-1.md
+++ b/.bkit/core/prompts/bkit-design-review-1.md
@@ -60,7 +60,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/technology.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. For each major capability the design requires, search for prior art:
    - Search the repo: text search for names, strings, near-miss helpers and sibling modules, symbol references through the language server when one is configured, and `docs/capabilities.md` when present.
diff --git a/.bkit/core/prompts/bkit-design-review-2.md b/.bkit/core/prompts/bkit-design-review-2.md
index 4469fe095..c469cc1ab 100644
--- a/.bkit/core/prompts/bkit-design-review-2.md
+++ b/.bkit/core/prompts/bkit-design-review-2.md
@@ -59,7 +59,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/observability.md` and `docs/deployments.md` when they are present (warn and continue if either is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/observability.md` and `docs/deployments.md` when they are present (warn and continue if either is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. For each major component or flow, enumerate its failure modes:
    - What fails: an upstream dependency, internal logic, resource exhaustion, data corruption or partial state.
diff --git a/.bkit/core/prompts/bkit-design-spike.md b/.bkit/core/prompts/bkit-design-spike.md
index 49604045f..0311b4cd4 100644
--- a/.bkit/core/prompts/bkit-design-spike.md
+++ b/.bkit/core/prompts/bkit-design-spike.md
@@ -64,7 +64,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Restate each unknown in the review's `PoC Approach` and `Unknowns & Blockers` as one claim the design depends on and a probe could disprove:
    - Order the claims by blast radius.
diff --git a/.bkit/core/prompts/bkit-design-update.md b/.bkit/core/prompts/bkit-design-update.md
index 1ea15b1a8..2ae16167d 100644
--- a/.bkit/core/prompts/bkit-design-update.md
+++ b/.bkit/core/prompts/bkit-design-update.md
@@ -59,7 +59,7 @@ autoCompactWindow: 300000
    ```
    **If** the caller names **Update** and no **Create** → skip the seed: set the `Verdict` of **Update** to `PENDING`, and apply the findings to **Update** in place wherever the steps below name **Create**.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — apply findings via `Edit` as content becomes available.
 5. Apply every `CRITICAL` item. No consensus is required. **If** findings conflict → prefer the stricter wording.
 6. Apply each `OPTIONAL` item on merit. No consensus is required. **If** it conflicts with an applied `CRITICAL` item or expands scope → skip it.
diff --git a/.bkit/core/prompts/bkit-plan-generate.md b/.bkit/core/prompts/bkit-plan-generate.md
index 89fa9755f..a83ef41f4 100644
--- a/.bkit/core/prompts/bkit-plan-generate.md
+++ b/.bkit/core/prompts/bkit-plan-generate.md
@@ -102,7 +102,21 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Take its sections from `docs/templates/bkit-plan.md`.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read the `.agents/docs.md` index, and consult the project documents the plan needs. Always assess `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md`. Consult `docs/data-schema.md` for database changes, `docs/design.md` for UI, `docs/observability.md` for logging, `docs/deployments.md` for release or CI behaviour, and `docs/noise.md` or `docs/setup.md` when relevant.
+   - Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently.
+   - Mark an irrelevant topic not applicable, with the reason.
+   - Record each topic, the path and section actually used, coverage, gap, action, alternative evidence and remaining uncertainty in `Documentation Consultation`.
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "security",
+       "gap": "starter-only",
+       "recommendedPath": "docs/security.md",
+       "alternativeEvidence": "The CI configuration defines token permissions.",
+       "action": "Populate the security document with the project's credential and permission boundaries."
+     }
+     ```
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
    - Write each section group below before you read for the next group. Do not leave the writing to a final pass.
    - **If** a section has nothing to hold → `None`.
@@ -116,6 +130,7 @@ autoCompactWindow: 300000
 7. Investigation & prerequisites:
    - `Open Questions & Assumptions`.
    - `Pre-Flight / Dependencies`.
+   - `Documentation Consultation` and `Documentation Warnings`, from step 3.
 8. Design:
    - `Alternative Approaches & Recommendations`.
    - `Data Schema Integration`.
@@ -139,6 +154,7 @@ autoCompactWindow: 300000
       - Keep each group and task within the plan caps your Context names (`bkit.workflows.tasks`: tasks and `TEST FIRST` tests per group, tests and test files per task).
       - Put the groups in build order: a group's `DEPENDS ON` names only tasks in earlier groups or in its own group.
       - `READ` / `UPDATE` / `DELETE` name only symbols and files you opened this session. Open an unopened one first, or leave it out.
+      - Give each task that touches an assessed topic a `READ` line for its recommended document (or the indexed equivalent), and an `UPDATE` line for each document the task changes. A gap that the task cannot close stays in `Documentation Warnings`.
       - NEVER write `TEST EXCEPTION` of your own; copy each `TEST EXCEPTION` field an input writes into its task, word for word.
     - `Verification Plan` from Test Matrix and Execution Runbook.
 
diff --git a/.bkit/core/prompts/bkit-plan-review-1.md b/.bkit/core/prompts/bkit-plan-review-1.md
index 02b3b6b01..0f3529327 100644
--- a/.bkit/core/prompts/bkit-plan-review-1.md
+++ b/.bkit/core/prompts/bkit-plan-review-1.md
@@ -64,7 +64,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Check that the plan reflects its source, with no drift, no omissions and no silent expansion:
    - Design-coverage: **If** a design artifact exists (`docs/plans/{YYYYMM}/{FID}-design.md`, or one the input references):
diff --git a/.bkit/core/prompts/bkit-plan-review-2.md b/.bkit/core/prompts/bkit-plan-review-2.md
index a1838c39d..19047b7d4 100644
--- a/.bkit/core/prompts/bkit-plan-review-2.md
+++ b/.bkit/core/prompts/bkit-plan-review-2.md
@@ -58,7 +58,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Trace the surface area of each `Agent Execution Runbook` task:
    - The files and modules it edits directly.
diff --git a/.bkit/core/prompts/bkit-plan-scope-check.md b/.bkit/core/prompts/bkit-plan-scope-check.md
index 239daeb01..586f3204a 100644
--- a/.bkit/core/prompts/bkit-plan-scope-check.md
+++ b/.bkit/core/prompts/bkit-plan-scope-check.md
@@ -64,7 +64,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Check that every section `docs/templates/bkit-plan.md` mandates is present and filled in. A missing or broken section → `CRITICAL`.
 6. Check the scenario sections and the open questions:
diff --git a/.bkit/core/prompts/bkit-plan-update.md b/.bkit/core/prompts/bkit-plan-update.md
index c90c0fdad..d625c945e 100644
--- a/.bkit/core/prompts/bkit-plan-update.md
+++ b/.bkit/core/prompts/bkit-plan-update.md
@@ -82,7 +82,19 @@ autoCompactWindow: 300000
    ```
    **If** the caller names **Update** and no **Create** → skip the seed: set the `Verdict` of **Update** to `PENDING`, and apply the findings to **Update** in place wherever the steps below name **Create**.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read the `.agents/docs.md` index, and load the docs it lists for this task. Keep the plan's `Documentation Consultation` and `Documentation Warnings` sources as recorded.
+   - **If** a finding changes a topic the plan covers (architecture, technology, security, testing, data schema, UI, logging, release or setup) → re-consult its recommended document or indexed equivalent, update that topic's source, coverage, gap and action, and carry any new `READ` / `UPDATE` line into the task it touches.
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "security",
+       "gap": "starter-only",
+       "recommendedPath": "docs/security.md",
+       "alternativeEvidence": "The CI configuration defines token permissions.",
+       "action": "Populate the security document with the project's credential and permission boundaries."
+     }
+     ```
+   - Never drop an earlier warning the review did not resolve.
 4. Update **Create** — apply findings via `Edit` as content becomes available.
 5. Keep every `Agent Execution Runbook` task's `DONE WHEN` and `TEST FIRST` intact through the merge:
    - A critique may edit the task text around them.
diff --git a/.bkit/core/prompts/bkit-ship-conflict-resolve.md b/.bkit/core/prompts/bkit-ship-conflict-resolve.md
index d56e1ed43..f90d499d1 100644
--- a/.bkit/core/prompts/bkit-ship-conflict-resolve.md
+++ b/.bkit/core/prompts/bkit-ship-conflict-resolve.md
@@ -53,7 +53,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each substep: append the log entry at EOF with Bash `echo {log entry} >> {output}`.
 5. Confirm the merge state the caller left:
    - Record the branch head with `git rev-parse HEAD`, and append a log entry naming it.
diff --git a/.bkit/core/prompts/bkit-ship-deferred-sweep.md b/.bkit/core/prompts/bkit-ship-deferred-sweep.md
index 780f6029c..93a21eb62 100644
--- a/.bkit/core/prompts/bkit-ship-deferred-sweep.md
+++ b/.bkit/core/prompts/bkit-ship-deferred-sweep.md
@@ -55,7 +55,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Settle which file is the plan, then scan it for declared out-of-scope, future-work or non-goal items:
    - **If** no plan file exists:
diff --git a/.bkit/core/prompts/bkit-ship-update-docs.md b/.bkit/core/prompts/bkit-ship-update-docs.md
index 00e960674..7952572a2 100644
--- a/.bkit/core/prompts/bkit-ship-update-docs.md
+++ b/.bkit/core/prompts/bkit-ship-update-docs.md
@@ -55,8 +55,12 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task.
    - Exclude `knowledge.jsonl` and `decisions.jsonl`.
+   - Check coverage before editing, for each of the ten recommended topics (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`) the shipped files touch: presence (absent or missing file), index accuracy (a row without a file, a file without a row, an `Equivalent to docs/{topic}.md` Scope cell), and project content (empty, or still the `.bkit/templates/docs/{topic}.md` starter).
+   - Mark an irrelevant topic not applicable, with the reason.
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Never report a clean sync while a relevant topic is absent or incomplete.
+   - Populate a relevant absent or starter-only document only within the ship's scope and from facts verified in the shipped files; otherwise report the gap.
 3. Read the history shipped this cycle:
    - Run `git rev-parse --is-shallow-repository`.
    - **If** it prints `true` → name the boundary commit in the output, and say that older history is unread.
@@ -67,6 +71,16 @@ autoCompactWindow: 300000
 7. Fill `Pending Items` from the `ship-pending-items.md` deferral scan supplied in your Read paths, one entry per line.
    - Do not write `docs/deferrals.jsonl`.
 8. Produce the **Create** output.
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "testing",
+       "gap": "starter-only",
+       "recommendedPath": "docs/testing.md",
+       "alternativeEvidence": "The test runner configuration names the available tiers",
+       "action": "Populate the testing document with the lane graph and tier rules."
+     }
+     ```
 
 **Output format:**
 
@@ -81,6 +95,14 @@ autoCompactWindow: 300000
 
 [For each file, which passes applied and which gaps closed. **If** none → `None`.]
 
+## Unresolved Coverage
+
+[Each topic that is absent, unindexed, empty, starter-only or undercovered after this run, with the evidence. Report it next to the edits above; it never makes the sync read as clean. **If** every relevant topic is covered → `None`.]
+
+## Documentation Warnings
+
+[The `jsonl` records from step 8. **If** no gaps → omit this section.]
+
 ## Pending Items
 
 [The `{FID}` matches from the `ship-pending-items.md` deferral scan, for human review. **If** no matches → `None`.]
diff --git a/.bkit/core/prompts/bkit-utility-update-decisions.md b/.bkit/core/prompts/bkit-utility-update-decisions.md
index 3cba0e88c..e549cbad5 100644
--- a/.bkit/core/prompts/bkit-utility-update-decisions.md
+++ b/.bkit/core/prompts/bkit-utility-update-decisions.md
@@ -58,7 +58,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/decisions.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is `ACTIVE` or absent.
 4. Check each remaining entry against `docs/` and the codebase, never trusting the entry's own claims. Classify it, then apply its class:
    - `HOLDS` = docs or code confirm what the entry states, and none of them state otherwise → no change.
diff --git a/.bkit/core/prompts/bkit-utility-update-deferrals.md b/.bkit/core/prompts/bkit-utility-update-deferrals.md
index 53078d42a..34da33e3e 100644
--- a/.bkit/core/prompts/bkit-utility-update-deferrals.md
+++ b/.bkit/core/prompts/bkit-utility-update-deferrals.md
@@ -55,7 +55,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/deferrals.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is not `CLOSED`.
 4. For each remaining entry, check in the codebase whether its work is done, never trusting the entry's own claims:
    - **If** it is done in code → set `status` to `CLOSED`, with `references` naming the evidence.
diff --git a/.bkit/core/prompts/bkit-utility-update-documentation.md b/.bkit/core/prompts/bkit-utility-update-documentation.md
index f25aadf88..a4e8ce7b6 100644
--- a/.bkit/core/prompts/bkit-utility-update-documentation.md
+++ b/.bkit/core/prompts/bkit-utility-update-documentation.md
@@ -53,17 +53,33 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read the `.agents/docs.md` index as the full catalog of docs to check.
+2. Read the `.agents/docs.md` index as the catalog of docs to check, then check project documentation coverage before editing:
+   - **Presence:** for each of the ten recommended topics (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`), decide whether the change touched it (relevant) or not (not applicable, with the reason). Review every relevant topic, including one the index does not list and one whose file is absent or missing.
+   - **Index accuracy:** compare each `Project Documents` row with the repository. Report a row whose file is missing, a present file with no row, and an equivalent document (an indexed file whose Scope cell reads `Equivalent to docs/{topic}.md`).
+   - **Project content:** report a document that is empty or still the shipped starter (compare it with `.bkit/templates/docs/{topic}.md`); an irrelevant topic is not a gap. A document that differs from the starter is a candidate: assess its coverage against the code, and never call it complete from a mechanical check.
+   - **Populate** a relevant absent, empty or starter-only document only within the authorized scope and only with facts you verified in the repository; copy the starter from `.bkit/templates/docs/`, fill it in, and add its row to `Project Documents`. **If** the evidence is not there → leave the document alone and report the gap.
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Never report a clean sync while a relevant topic is absent or incomplete.
 3. Per doc, always follow its `Rules` headers when making edits.
 4. Per doc, four passes in order: Sync content (gaps vs implementation) → reorganize structure (dedupe, move misplaced) → compress wording (more token-efficient) → update cross-references (inline `docs/*.md` links).
-5. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory.
-6. Collect setup tips:
+5. Record the coverage result:
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "testing",
+       "gap": "starter-only",
+       "recommendedPath": "docs/testing.md",
+       "alternativeEvidence": "The test runner configuration names the available tiers",
+       "action": "Populate the testing document with the lane graph and tier rules."
+     }
+     ```
+6. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory.
+7. Collect setup tips:
    ```bash
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" tips --workflow=utility
    ```
    - Hold stdout as `BKIT_TIPS`. It is plain text, not JSON.
    - **If** it prints nothing or exits non-zero → `BKIT_TIPS` is empty.
-7. Final return: Display the output format verbatim as the final message to the user. Do not summarise or trim it.
+8. Final return: Display the output format verbatim as the final message to the user. Do not summarise or trim it.
    - Append a `## Suggested Replies` heading.
    - Append `Would you like me to explain any of this in plain English? Then write 'yes, explain in plain english'.`
    - **If** `BKIT_TIPS` is not empty:
@@ -83,6 +99,14 @@ autoCompactWindow: 300000
 
 [For each file, which passes applied and which gaps closed. **If** none → `None`.]
 
+## Project Documentation Coverage
+
+[One row per topic: recommended path, state (populated, starter-only, empty, absent or not-applicable), index accuracy, and evidence. A coverage gap here is never `None`.]
+
+## Documentation Warnings
+
+[The `jsonl` records from step 5. **If** no gaps → omit this section.]
+
 ## Memories
 
 [Each memory rewrite: memory path, pointer. **If** none → `None`.]
diff --git a/.bkit/core/prompts/bkit-utility-update-failures.md b/.bkit/core/prompts/bkit-utility-update-failures.md
index 2d9df8bd2..b70daf54f 100644
--- a/.bkit/core/prompts/bkit-utility-update-failures.md
+++ b/.bkit/core/prompts/bkit-utility-update-failures.md
@@ -57,7 +57,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/failures.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is not `CLOSED`.
 4. For each remaining entry, check in the codebase whether its work is done, never trusting the entry's own claims:
    - For `category` `testing`, the winning row's `updates` is the flake count. Only a landed deterministic fix counts as done, never a recent green run.
diff --git a/.bkit/core/prompts/bkit-utility-update-knowledge.md b/.bkit/core/prompts/bkit-utility-update-knowledge.md
index dcef32e09..faf08ca38 100644
--- a/.bkit/core/prompts/bkit-utility-update-knowledge.md
+++ b/.bkit/core/prompts/bkit-utility-update-knowledge.md
@@ -59,7 +59,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/knowledge.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is `ACTIVE` or absent.
 4. Check each remaining entry against `docs/` and the codebase, never trusting the entry's own claims. Classify it, then apply its class:
    - `HOLDS` = docs or code confirm what the entry states, and none of them state otherwise → no change.
diff --git a/.bkit/core/prompts/bkit-utility-update-roadmap.md b/.bkit/core/prompts/bkit-utility-update-roadmap.md
index 8c6509c2d..58f7621f5 100644
--- a/.bkit/core/prompts/bkit-utility-update-roadmap.md
+++ b/.bkit/core/prompts/bkit-utility-update-roadmap.md
@@ -74,7 +74,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Refresh `docs/roadmap.md` with `bkit roadmap fold` (the main checkout's `node_modules/.bin/bkit`):
    - **If** it fails → **STOP**.
    - Read the refreshed file in full. Its `bkit` block is a list of `FID`s.
diff --git a/.bkit/core/prompts/bkit-utility-update-tracker.md b/.bkit/core/prompts/bkit-utility-update-tracker.md
index 9edd39189..91c73fca5 100644
--- a/.bkit/core/prompts/bkit-utility-update-tracker.md
+++ b/.bkit/core/prompts/bkit-utility-update-tracker.md
@@ -86,7 +86,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. <!-- bkit:tracker true start -->
    Read repo facts:
    ```bash
diff --git a/.bkit/core/workflows/bkit-auto.md b/.bkit/core/workflows/bkit-auto.md
index 6e5dec4e8..70da3b44e 100644
--- a/.bkit/core/workflows/bkit-auto.md
+++ b/.bkit/core/workflows/bkit-auto.md
@@ -152,6 +152,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 2. `REF` is the issue as `runs context` printed it (`#N` on GitHub, the key uppercased on Linear / Jira, empty with no tracker).
    - Never pass a bare `FID` or bare number: the dispatched workflow's Step 1 stops when no issue reference matches. It never creates an issue.
 3. Invoke the matching phase skill with the `Skill` tool, then exit.
+   The dispatched phase writes its own `## Documentation Warnings` in its summary. Forward that output as it is; do not collect or repeat it here.
    Route:
    - `PHASE` = `ship` → `/bkit-ship {FID} {REF}`
    - `PHASE` = `debug` → `/bkit-debug {FID} {REF} https://github.com/{OWNER_REPO}/actions/runs/{RUN_ID}` when `RUN_ID` is held; otherwise `/bkit-debug {FID} {REF}`.
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index d5eebaa6f..6b98bcadb 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -501,6 +501,7 @@ description: "Build Feature — Autonomous implementation"
    Context: You are a subagent in the Build phase. Write the plan in task-block form. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. **If** `CONVERT_RETRY` is held → add `Your last plan failed the plan check: {CONVERT_RETRY}. Fix only those problems.` **If** `NEWER_COMMENTS` > 0 → add `{NEWER_COMMENTS} issue comments are newer than the plan; write what they change into it.` Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Check command: `"{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"`.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md` (if present), `docs/templates/bkit-plan.md`.
    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
+   Project documents: the converted plan carries `Documentation Consultation` and `Documentation Warnings`, and each task that touches an assessed topic names its `READ` / `UPDATE` documents. Later steps read those sources and warn from applicable tasks; a missing or starter-only document warns and the run continues.
 3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
@@ -1122,6 +1123,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" workflows summary --workflow=build --file="{STATUS}" --publish={PUBLISH}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 3. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --number=15 --post --title=Summary --link-ref={BRANCH} --comment-body --message="chore({FID}): summary"
diff --git a/.bkit/core/workflows/bkit-debug.md b/.bkit/core/workflows/bkit-debug.md
index a990b80e6..955de74e8 100644
--- a/.bkit/core/workflows/bkit-debug.md
+++ b/.bkit/core/workflows/bkit-debug.md
@@ -515,6 +515,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    Read: `{CI_SELECTION_FILE}`, `docs/plans/{YYYYMM}/logs/{FID}/debug-input-{DEBUG_ATTEMPT}.md`, the current-generation `context-*` artifacts recorded in Step 4.
    Update: Test files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-reproduce-{NORMAL_ATTEMPT}.md`.
+   Project documents: a debug run has no plan, so the subagents read the `.agents/docs.md` index and consult `docs/testing.md` for the test tiers and `docs/noise.md` for registered signal downgrades (also `docs/observability.md` or `docs/architecture.md` when they are present and relevant to the failure). A missing index or a missing, empty or starter-only document is a warning: continue from repository evidence, and record the gap in `## Documentation Warnings`. A handover keeps the unresolved warnings.
 2. Finish — commits the test:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-failure-reproduce --field=ciGeneration={CI_GENERATION} --attempt-of=debug-run-tests:current --agent=bkit-debug-failure-reproduce --artifact="docs/plans/{YYYYMM}/logs/{FID}/debug-failure-reproduce-<attempt>.md" --message="test({FID}): reproduce reported failure" --number=5 --post --title="Failure Reproduce"
@@ -658,6 +659,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    "{BKIT}" workflows summary --workflow=debug --file="{STATUS}"
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 2. Finish:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md --message="chore({FID}): summary" --verbose-ci-local --number=10 --post --title="Summary" --link-ref={BRANCH} --comment-body
diff --git a/.bkit/core/workflows/bkit-design.md b/.bkit/core/workflows/bkit-design.md
index 633bc8e4d..04f6e994c 100644
--- a/.bkit/core/workflows/bkit-design.md
+++ b/.bkit/core/workflows/bkit-design.md
@@ -387,6 +387,7 @@ description: "Design Feature — Autonomous design phase"
    Context: You are a subagent in the Design phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Inputs carry distinct lenses. Merge across them, and do not collapse them to a consensus.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/design-input-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-1.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-2.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-3.md`, `docs/plans/{YYYYMM}/logs/{FID}/related-issues.md` (if present), `docs/plans/{YYYYMM}/{FID}-design.md` (if present — superseded design, context only, not a constraint).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md`.
+   Project documents: a design needs no plan, so the subagent reads the `.agents/docs.md` index and consults `docs/architecture.md` (boundaries and topology), plus `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/design.md`, `docs/observability.md` or `docs/deployments.md` when the design touches them. A missing index or a missing, empty or starter-only document is a warning: continue from repository evidence, and record the gap in `## Documentation Warnings` (one `jsonl` record per gap with `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action`).
 2. Finish:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=design --step=design-generate --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md --message="chore({FID}): design-generate" --number=5 --post --title="Generate Design" --link-ref=dev
@@ -506,6 +507,7 @@ description: "Design Feature — Autonomous design phase"
    "{BKIT}" workflows summary --workflow=design --file="{STATUS}"
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 3. Finish, then push with exactly one command:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=design --step=design-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/design-summary.md --message="chore({FID}): summary bkit [skip ci]" --number=10 --post --title=Summary --link-ref=dev --comment-body
diff --git a/.bkit/core/workflows/bkit-plan.md b/.bkit/core/workflows/bkit-plan.md
index 0195b69c1..23d9109d5 100644
--- a/.bkit/core/workflows/bkit-plan.md
+++ b/.bkit/core/workflows/bkit-plan.md
@@ -265,6 +265,7 @@ description: "Plan Feature — Autonomous plan generation"
    Context: You are a subagent in the Plan phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. Workstreams this plan covers: {WORKSTREAMS}.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present — superseded plan, context only, not a constraint).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`.
+   Project documents: `@bkit-plan-generate` fills `Documentation Consultation` and `Documentation Warnings` in the plan. The review and apply-review steps keep those sources; a gap is a warning that continues the run, never a stop.
    **If** the draft still holds `PENDING` → invoke `@bkit-plan-generate` once more with Context `"Fill only the sections still marked PENDING and the empty groups; leave every finished section as it is."` and the plan caps and workstreams above, Read: the same inputs, Update: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`.
 2. Check the draft's groups and task blocks, and that every symbol it names exists:
    ```bash
@@ -444,6 +445,7 @@ description: "Plan Feature — Autonomous plan generation"
    "{BKIT}" workflows summary --workflow=plan --file="{STATUS}" --plan={PLAN_FINAL}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 4. Finish, then push the summary commit:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/plan-summary.md --message="chore({FID}): summary bkit [skip ci]" --number=7 --post --title=Summary --link-ref=dev --comment-body
diff --git a/.bkit/core/workflows/bkit-ship.md b/.bkit/core/workflows/bkit-ship.md
index 8598da8e5..567c18541 100644
--- a/.bkit/core/workflows/bkit-ship.md
+++ b/.bkit/core/workflows/bkit-ship.md
@@ -506,6 +506,7 @@ description: "Ship Feature — Autonomous merge and archive"
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`), `{OUTBOX}/ship-pending-items.md`.
    Update: Doc files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md`.
+   Documentation maintenance findings (unresolved coverage and the `## Documentation Warnings` records) stay in the ship summary next to the edits; a missing document is reported and the ship continues.
 3. Wait for the subagent to complete. Then append the `SHIPPED` row to the worktree ledger, re-render the mechanical `roadmap-status` board from it, and finish the step (bookkeeping to `$BOOK_ROOT`). The block exits 1 when the row did not land:
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
@@ -516,6 +517,7 @@ description: "Ship Feature — Autonomous merge and archive"
    "{BKIT}" workflows summary --workflow=ship --file="{STATUS}" --pr={PR_NUMBER}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 5. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --commit=none --number=6 --post --title="Update Docs & Summary" --link-ref=dev --comment-body
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index eefbe260f..eca491158 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -399,7 +399,7 @@ Clause section lines:
 - hook:
   - partial: `gateguard-docs`
 - drift:
-  - `bkit-utility-update-documentation:56`: "index as the full catalog of docs to check" Reads docs.md as a full catalog to check, not lazy-load by phase matrix (fits a full-sync task)
+  - `bkit-utility-update-documentation:56`: "index as the catalog of docs to check" Reads docs.md as a full catalog to check, not lazy-load by phase matrix (fits a full-sync task)
     - kept: a full docs sync checks every doc the index lists, so it reads the whole catalog
 
 ```text
@@ -886,7 +886,7 @@ Clause section lines:
     - kept: a blocked in-scope plan task is not a deferral; it is reported to the orchestrator, which routes it
   - `bkit-build-plan-gaps-remediate:33`: "NEVER append to `docs/deferrals.jsonl`" Says never append to docs/deferrals.jsonl; consistent with `finish-over-deferrals` (blocked in-scope work is not a deferral) but reads as the inverse of `deferred-work`'s ALWAYS-append
     - kept: a blocked in-scope plan task is not a deferral; it is reported to the orchestrator, which routes it
-  - `bkit-ship-update-docs:68`: "Do not write `docs/deferrals.jsonl`." Forbids writing `docs/deferrals.jsonl`; deferrals are surfaced for human review only
+  - `bkit-ship-update-docs:72`: "Do not write `docs/deferrals.jsonl`." Forbids writing `docs/deferrals.jsonl`; deferrals are surfaced for human review only
     - kept: the rows it surfaces already sit in `docs/deferrals.jsonl`; it reads them for human review and adds no deferral of its own
 
 ```text
@@ -1371,7 +1371,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-annotations`, `bkit-audit-ci-performance`
 - drift:
-  - `bkit-ship:584`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
+  - `bkit-ship:586`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
     - kept: Re-validate probes for an existing run first and dispatches only when the head has none, which happens when the head commit carries `[skip ci]` or GitHub started no run
 
 ```text
@@ -1670,7 +1670,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-ci-performance`
 - drift:
-  - `bkit-ship:584`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
+  - `bkit-ship:586`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
     - kept: Re-validate probes for an existing run first and dispatches only when the head has none, which happens when the head commit carries `[skip ci]` or GitHub started no run
 
 ```text
@@ -3339,16 +3339,70 @@ Re-read all supplied inputs ONCE at session start; do NOT trust session memory.
 - prompt: where-used
 - audit: forbidden
 - tags: review-docs-first
-- carriers: prompt all except `bkit-build-plan-convert`, `bkit-utility-compress-markdown`, `bkit-utility-update-documentation`; repo-agent all
+- carriers: prompt `bkit-build-challenge-*`, `bkit-debug-*`, `bkit-design-*`, `bkit-plan-review-*`, `bkit-build-install-skills`, `bkit-build-plan-current`, `bkit-build-plan-gaps-remediate`, `bkit-build-plan-tasks`, `bkit-build-plan-tests`, `bkit-build-plan-verify`, `bkit-plan-scope-check`, `bkit-ship-conflict-resolve`, `bkit-ship-deferred-sweep`, `bkit-utility-update-decisions`, `bkit-utility-update-deferrals`, `bkit-utility-update-failures`, `bkit-utility-update-knowledge`, `bkit-utility-update-roadmap`, `bkit-utility-update-tracker`; repo-agent all
 
 ```text
-Read `.agents/docs.md`, and load the docs it lists for this task{{focus?}}. Skip any listed doc that does not exist
+Read `.agents/docs.md`, and load the docs it lists for this task{{focus?}}. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently
 ```
 
 ```retired
+Read `.agents/docs.md`, and load the docs it lists for this task{{focus?}}. Skip any listed doc that does not exist
 Read `.agents/docs.md` → load docs for workflow / step / task{{focus?}}; skip missing
 ```
 
+### doc-warning-record
+
+- prompt: where-used
+- audit: where-used
+- tags: review-docs-first
+- carriers: prompt `bkit-audit-generate`, `bkit-build-plan-convert`, `bkit-plan-generate`, `bkit-plan-update`, `bkit-ship-update-docs`, `bkit-utility-update-documentation`; audit `bkit-audit-adoption`, `bkit-audit-documentation`
+
+```text
+Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+```
+
+### doc-gap-continue
+
+- prompt: where-used
+- audit: where-used
+- tags: review-docs-first
+- carriers: prompt `bkit-audit-generate`, `bkit-build-plan-convert`, `bkit-plan-generate`, `bkit-plan-update`, `bkit-ship-update-docs`, `bkit-utility-update-documentation`; audit `bkit-audit-adoption`, `bkit-audit-documentation`
+
+```text
+**If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently.
+```
+
+### doc-topic-not-applicable
+
+- prompt: where-used
+- audit: where-used
+- tags: review-docs-first
+- carriers: prompt `bkit-audit-generate`, `bkit-build-plan-convert`, `bkit-plan-generate`, `bkit-ship-update-docs`
+
+```text
+Mark an irrelevant topic not applicable, with the reason.
+```
+
+### doc-indexed-equivalent
+
+- prompt: where-used
+- tags: review-docs-first
+- carriers: prompt `bkit-audit-generate`, `bkit-build-plan-convert`, `bkit-plan-generate`
+
+```text
+Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+```
+
+### doc-warnings-summary
+
+- workflow: where-used
+- tags: review-docs-first
+- carriers: workflow all except `bkit-auto`
+
+```text
+The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
+```
+
 ### replace-pending
 
 - prompt: where-used
@@ -10551,6 +10605,8 @@ Post the comment:
 `mcp__jira__addOrEditJiraIssueComment({ cloudId: "{TRACKER_SITE}", issueIdOrKey: "{ISSUE_ID}", commentBody: "{BODY}" })` (no `commentId`). **If** the body is over 32,767 characters → post consecutive comments split at line breaks, in order.
 [verify-tools] **If** it still fails → `Issue` = `{ISSUE_ID} failed`.
 **Else** → `Issue` = `{ISSUE_ID} posted`.
+Read the `.agents/docs.md` index, and load the project documents the audit's surface needs, with or without a plan: `docs/architecture.md` for structure and boundaries, `docs/technology.md` for stack choices, `docs/security.md` for trust boundaries, `docs/testing.md` for test and gate rules, plus `docs/data-schema.md`, `docs/design.md`, `docs/observability.md`, `docs/deployments.md`, `docs/noise.md` or `docs/setup.md` when the audit's surface touches them.
+Safeguards that need genuine evidence stay in force (secrets, permissions, untrusted input).
 ```
 
 #### bkit-build-challenge-1
@@ -10632,8 +10688,6 @@ Write the **Create** output in the Output format.
 **Matrix shape:** The plan's `Derived Test Matrix` has a `Task` column beside `Test description`, `Type` and `Target file`. Each cell in it names the one runbook task that lands that row's test.
 Read `docs/templates/bkit-plan.md` § `Agent Execution Runbook` for the shape of a group and of a task block. The rules for filling them are the **Runbook tasks**, **TEST FIRST** and **TEST EXCEPTION** clauses above.
 Set up the plan file:
-**If** the plan file exists → keep every section except `Agent Execution Runbook` as written, and rewrite the runbook.
-**Else** → create the plan with `# {title} Implementation Plan`, `## Context & Goals` (the goal in 1-3 lines), `## Reuse Inventory` and `## Agent Execution Runbook`.
 In both cases, carry over every end state and test that the inputs name, in their order. You may tighten them, but never weaken them.
 Split the work into tasks, each one a testable change, and group the tasks in build order:
 Keep each group within the per-group plan caps that your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all).
@@ -10643,6 +10697,10 @@ For each `CREATE` file, add one `NEW` row to `Reuse Inventory` that records the
 **If** it exits 0 → stop.
 **If** it exits non-zero on the third run → stop, and leave the plan as it stands. The caller runs the same check and handles the problems that are left.
 **If** it exits non-zero → fix each problem its report lists, and run it again.
+Read the `.agents/docs.md` index, and consult the project documents the converted tasks need: always assess `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md`; add `docs/data-schema.md` when a task changes the database, `docs/design.md` for UI work, `docs/observability.md` for logging, `docs/deployments.md` for release or CI work, and `docs/noise.md` or `docs/setup.md` when a task touches them.
+Record each topic, the path and section used, coverage, gap and action in the plan's `Documentation Consultation`, and put each `READ` / `UPDATE` line for these documents in the task that needs it.
+**If** the plan file exists → keep every section except `Agent Execution Runbook` as written (add or refresh `Documentation Consultation` and `Documentation Warnings` from step 1), and rewrite the runbook.
+**Else** → create the plan with `# {title} Implementation Plan`, `## Context & Goals` (the goal in 1-3 lines), `## Documentation Consultation`, `## Documentation Warnings`, `## Reuse Inventory` and `## Agent Execution Runbook`.
 ```
 
 #### bkit-build-plan-current
@@ -10843,6 +10901,7 @@ Set `Verdict` from the `Fixable` values you decided, never from the report's `nu
 **Output cap:** Apply max 500 token limit to **Create** prose; sections that list items verbatim are exempt.
 Extract `Rot Signals` from the diagnose attempts, and aggregate them into the handover: dedupe the slugs, and keep all the evidence.
 [scope-discipline] Extract `Out-of-Scope Recommendations` from the diagnose attempts, and aggregate them: dedupe the paths, and keep all the rationales.
+[scope-discipline] Collect the `## Documentation Warnings` records from the diagnose, remediate and verify logs of the run, and copy them verbatim into the handover's `Documentation Warnings` section, dropping exact duplicates. Take no records from raw `*-input-*.md` files.
 ```
 
 #### bkit-debug-failure-diagnose
@@ -11225,6 +11284,10 @@ Keep each group and task within the plan caps your Context names (`bkit.workflow
 Put the groups in build order: a group's `DEPENDS ON` names only tasks in earlier groups or in its own group.
 `READ` / `UPDATE` / `DELETE` name only symbols and files you opened this session. Open an unopened one first, or leave it out.
 `Verification Plan` from Test Matrix and Execution Runbook.
+Read the `.agents/docs.md` index, and consult the project documents the plan needs. Always assess `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md`. Consult `docs/data-schema.md` for database changes, `docs/design.md` for UI, `docs/observability.md` for logging, `docs/deployments.md` for release or CI behaviour, and `docs/noise.md` or `docs/setup.md` when relevant.
+Record each topic, the path and section actually used, coverage, gap, action, alternative evidence and remaining uncertainty in `Documentation Consultation`.
+`Documentation Consultation` and `Documentation Warnings`, from step 3.
+Give each task that touches an assessed topic a `READ` line for its recommended document (or the indexed equivalent), and an `UPDATE` line for each document the task changes. A gap that the task cannot close stays in `Documentation Warnings`.
 ```
 
 #### bkit-plan-review-1
@@ -11323,6 +11386,9 @@ Add each decision or deferral `key` you wrote to the plan's `**Ledger rows:**` l
 **If** applied findings add or reword questions under `Open Questions & Assumptions` → shape each per **Open questions** above.
 Remove the answered question from `Open Questions & Assumptions`.
 **If** the answer carries `Decision: {key}` → add that `key` to the plan's `**Ledger rows:**` line.
+Read the `.agents/docs.md` index, and load the docs it lists for this task. Keep the plan's `Documentation Consultation` and `Documentation Warnings` sources as recorded.
+**If** a finding changes a topic the plan covers (architecture, technology, security, testing, data schema, UI, logging, release or setup) → re-consult its recommended document or indexed equivalent, update that topic's source, coverage, gap and action, and carry any new `READ` / `UPDATE` line into the task it touches.
+Never drop an earlier warning the review did not resolve.
 ```
 
 #### bkit-ship-conflict-resolve
@@ -11444,6 +11510,9 @@ Read the history shipped this cycle:
 Run `git log --oneline --stat origin/dev..HEAD` for the files shipped this cycle.
 [deferred-work] Fill `Pending Items` from the `ship-pending-items.md` deferral scan supplied in your Read paths, one entry per line.
 [deferred-work] Do not write `docs/deferrals.jsonl`.
+Read `.agents/docs.md`, and load the docs it lists for this task.
+Check coverage before editing, for each of the ten recommended topics (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`) the shipped files touch: presence (absent or missing file), index accuracy (a row without a file, a file without a row, an `Equivalent to docs/{topic}.md` Scope cell), and project content (empty, or still the `.bkit/templates/docs/{topic}.md` starter).
+Populate a relevant absent or starter-only document only within the ship's scope and from facts verified in the shipped files; otherwise report the gap.
 ```
 
 #### bkit-utility-compress-markdown
@@ -11535,7 +11604,12 @@ Report to the caller, never into the file: the original vs new line / word count
 
 ```text
 **Role:** Senior tech writer syncing project docs with system state after multiple plans.
-[review-docs-first] Read the `.agents/docs.md` index as the full catalog of docs to check.
+Read the `.agents/docs.md` index as the catalog of docs to check, then check project documentation coverage before editing:
+**Presence:** for each of the ten recommended topics (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`), decide whether the change touched it (relevant) or not (not applicable, with the reason). Review every relevant topic, including one the index does not list and one whose file is absent or missing.
+**Index accuracy:** compare each `Project Documents` row with the repository. Report a row whose file is missing, a present file with no row, and an equivalent document (an indexed file whose Scope cell reads `Equivalent to docs/{topic}.md`).
+**Project content:** report a document that is empty or still the shipped starter (compare it with `.bkit/templates/docs/{topic}.md`); an irrelevant topic is not a gap. A document that differs from the starter is a candidate: assess its coverage against the code, and never call it complete from a mechanical check.
+**Populate** a relevant absent, empty or starter-only document only within the authorized scope and only with facts you verified in the repository; copy the starter from `.bkit/templates/docs/`, fill it in, and add its row to `Project Documents`. **If** the evidence is not there → leave the document alone and report the gap.
+Record the coverage result:
 ```
 
 #### bkit-utility-update-failures
@@ -11976,7 +12050,6 @@ Check that there is one context-fetch block per context with a lane, and that ea
 **Step 3 — Version:** Compare `pinnedVersion`, the installed package and the registry latest. **If** pinned != installed → the package was bumped without `bkit upgrade`. **If** the repo is behind → record the release count, the release-note changes that touch this repo, and the template paths changed since the pinned version. **Done when:** `Version` names all three versions and every relevant release-note change.
 **Step 4 — Check and Doctor:** Run `bkit check`, and record its exit code and the cause of each drift line. Run `bkit doctor`, and mark each advisory adopt, reject (saying why) or not applicable. Carry the previous report's rejects forward, and re-raise one only when the advisory text changed. **Done when:** `Check and Doctor` holds one row per drift line and per advisory.
 **Step 5 — Hosts:** Compare the agent hosts in use with the bkit hosts installed. Find the hosts in use from the repo's config directories and from team use. Use the `Hosts` section of the newest `bkit-audit-agents` report as a cross-check, not as the source. For each installed host, check for one agent copy per `core/prompts/` source, one command copy per `core/workflows/` source, and every `core/` hook file present, executable and wired in that host's settings. Record these as findings: a host in use with no bkit install, because agents there run without bkit gates; a missing or extra copy; and a hook file present but unwired, or wired but absent. Whether hooks fire and agree across hosts goes to `bkit-audit-agents`. **Done when:** `Hosts` holds one row per host: in use · installed · agent copies · command copies · hooks wired.
-**Step 6 — Written Files:** (a) Check that every `bkit:start` / `bkit:end` block and owned key is untouched (the Step 4 drift). **If** one holds a hand edit → the fix moves the edit below `bkit:end` or to `Project Instructions`. **If** the defect is in what bkit shipped → the fix is upstream in bkit. (b) In each file bkit shares with you (`AGENTS.md`, `CLAUDE.md`, `.agents/*.md`, `.gitignore`, `.gitattributes`, settings, tool-server config), check that your part is present for every block that expects one. A shared file that holds only bkit's block is unadopted. The ten project documents belong to you, so check them against their starters in `.bkit/templates/docs/` and `Project Documents` in `.agents/docs.md`. **If** `.bkit/.env.example` exists → check that `.bkit/.env` is present and git-ignored, and that every listed key is set (names only). **If** bkit wrote a tracker or tool-server entry → check that the credential env var it names is set. Whether your part is true goes to `bkit-audit-documentation`. **Done when:** `Written Files` holds one row per shared file: block untouched · your part present · verdict.
 **Step 7 — Audits:** For each `docs/templates/bkit-audit-*.md`, record whether its `**Applies when:**` is met, yes or no, with evidence; its `**Cadence:**`; and its newest report under `docs/audits/` by commit date. An audit never run is due, by the same rule as `bkit-utility-update-roadmap`. An `N/A` report with evidence counts as a run. Record these as findings: an audit that applies and was never run; an audit overdue by more than one cadence; and `Process Improvements` `Project` edits that a report proposed and that are absent from that template's `Project Instructions`. **Done when:** `Audits` holds one row per template: applies · cadence · last run · overdue by · verdict.
 **Step 8 — Adoption:** Join each file in the package's `templates/` to `.bkit/templates.md` § Contract.
 **If** a file is missing from the Contract → the fix is an upstream bkit doc fix.
@@ -12003,6 +12076,11 @@ For each context-fetch block, check that its job regex and artifact name match e
 **Hosts:** `Summary` names the hosts.
 **Template counts:** `Summary` gives the count of templates adopted / `gap` / `covered` / `not applicable`.
 **Throwaways removed:** the throwaway package unpack is removed.
+**Step 6 — Written Files:** (a) Check that every `bkit:start` / `bkit:end` block and owned key is untouched (the Step 4 drift). **If** one holds a hand edit → the fix moves the edit below `bkit:end` or to `Project Instructions`. **If** the defect is in what bkit shipped → the fix is upstream in bkit. (b) In each file bkit shares with you (`AGENTS.md`, `CLAUDE.md`, `.agents/*.md`, `.gitignore`, `.gitattributes`, settings, tool-server config), check that your part is present for every block that expects one. A shared file that holds only bkit's block is unadopted. The ten project documents belong to you, so check them against their starters in `.bkit/templates/docs/` and `Project Documents` in `.agents/docs.md`, topic by topic:
+**Presence:** a relevant topic with no file (absent or missing) is a finding. An indexed equivalent document counts (`Equivalent to docs/{topic}.md` in its Scope cell).
+**Index accuracy:** a file with no row, and a row with no file, are findings.
+**Content:** an empty file, or a file that still matches its starter, is a finding; a file that differs is a candidate for assessment, never proof of coverage. A topic that does not apply (no UI, no database) is irrelevant and recorded as not applicable with the reason.
+**If** `.bkit/.env.example` exists → check that `.bkit/.env` is present and git-ignored, and that every listed key is set (names only). **If** bkit wrote a tracker or tool-server entry → check that the credential env var it names is set. Whether your part is true goes to `bkit-audit-documentation`. **Done when:** `Written Files` holds one row per shared file and per project document topic: block untouched · your part present · state (populated, starter-only, empty, absent or not applicable) · verdict.
 ```
 
 #### bkit-audit-agents
@@ -12811,7 +12889,7 @@ Platform backup / restore docs.
 Platform serverless connection guidance.
 DB routine-maintenance docs, edition = hosted major (e.g., PostgreSQL Routine Database Maintenance Tasks).
 Safe-migration rule set (e.g., Squawk); record version.
-bkit block of `docs/setup.md` (bkit version from `.bkit/version`): Rules
+The project's `docs/setup.md` (local database setup and reset) and `docs/data-schema.md` (documented schema), when present; a missing or starter-only document is a warning, not a stop.
 Check the catalogue privileges on functions, tables and sequences.
 Find the role each write in the code actually runs as.
 Check the row-level access coverage, and the exposure outside the main schema (file storage, change feeds, views, exposed schemas).
@@ -13293,7 +13371,6 @@ Check that each topic has one doc, and label each live doc with its Diátaxis qu
 **API Doc Validator:** **If** the project has shared packages **or** an HTTP API → Step 9 — e.g., TypeDoc `--validation`, `eslint-plugin-jsdoc`. Fallback: read the exports, and mark broken links `Not Checked`.
 [honest-reporting] **Local Memory:** **If** the run is on a maintainer machine → Step 10 — the IDE auto-memory directory. Fallback: a cloud session skips it and records that in `Not Checked`.
 **Step 2 — Scope:** **If** there are no live docs → write one `N/A` row with evidence, then **STOP**. Otherwise take every live doc, and rank them by drift: for each live doc, count the commits to the repo paths it cites since the doc last changed, and add a column for the cited paths that no longer resolve. Record the ranking. Start from an up-to-date default branch with a clean `git status`. Historical records are citers. A pointer in one that leads nowhere is a finding, fixed at the target. A stale fact inside one is history, not a defect. **Done when:** `Scope` holds every live doc and the drift ranking.
-**Step 3 — Catalogue:** Check `.agents/docs.md`. Every file on disk under `docs/`, outside `plans/`, `archive/` and `audits/`, has a row, and every row's file exists. No doc is listed twice. Two docs on one topic is a bug, and that includes one doc in both tables with different reading columns. Each row's one-line scope still matches the doc. The root `README.md` works as the entry point: it says what the project is, links the setup doc, the architecture doc and `.agents/docs.md`, and says how to report a security issue. A missing community-health file with no README substitute is a finding. **Done when:** `Catalogue` names every mismatch, and every clean check.
 **Step 4 — Mechanical:** Run prose lint, the format check and the managed-block check. Then:
 Check that every backticked repo path in a live doc exists, and that every `*.md` name in a live doc resolves, backticked or not. The output is candidates. A path named on purpose as removed is not a finding. A path that moved is a finding. Section anchors and `file:line` wait for `Claims`.
 [empty-is-inconclusive] Check relative links and heading anchors offline across every doc, plans and archive included, because they are citers. Then check external URLs in live docs, with a cache. The anchor builder must match the host (e.g., GitHub). Open a failed fragment before calling it broken. The path check cannot see Markdown links.
@@ -13339,6 +13416,13 @@ Never name a doc that tests parse, or a ledger, as a compress candidate.
 **Docs untouched:** no live doc, memory file or instruction file changed, other than the template's `Project Instructions`.
 **Ledger rows untouched:** no existing ledger row changed.
 [tmp-files] **Scratch in tmp:** scratch files are only under the repo-root `tmp/`.
+**Presence:** a topic the project needs with no file (absent or missing) is a finding. An equivalent document counts when its `Project Documents` row names the recommended path in its Scope cell (`Equivalent to docs/{topic}.md`).
+**Index accuracy:** a present file with no `Project Documents` row, and a row whose file is missing, are findings.
+**Project content:** compare each file with `.bkit/templates/docs/{topic}.md`. An empty file or one that still matches the starter is a finding. A file that differs is a candidate: read it against the code and name the undercovered topics. Never call a topic covered from a mechanical comparison alone.
+**Not applicable:** a topic the project does not need (for example `docs/design.md` for a project with no UI) is irrelevant and recorded as not applicable with the reason. Absence, incomplete coverage and an irrelevant topic are three different outcomes; report each one apart.
+**Done when:** `Catalogue` names every mismatch and every clean check, and `Project Documentation` holds one row per topic: path, state (populated, starter-only, empty, absent or not applicable), index accuracy and evidence.
+**If** every topic is covered and indexed → write `None`; Step 3's records belong in this section.
+**Project documents:** `Project Documentation` has a row for every topic, and no absent, starter-only or undercovered topic reads as clean.
 ```
 
 #### bkit-audit-duplication
@@ -14829,7 +14913,6 @@ These are the unknowns and assumptions this plan relies on. An unresolved questi
 **Existing-Solution Search (reuse over duplicate):** the in-repo, dependency and ecosystem searches are recorded in `Reuse Inventory`.
 **User Context:** access to the files is confirmed, and missing user information is requested.
 **Project Context:** the relevant `docs/knowledge.jsonl` and `docs/decisions.jsonl` rows are read.
-**Testing & Quality:** the testing strategy matches `docs/testing.md`.
 **Prerequisite Plans:** [the plans to finish first. **If** none → `None`.]
 **Secrets & Env Vars:** the secret store and the service-account roles are checked.
 **Schema State:** the database state is confirmed against `docs/data-schema.md`.
@@ -14892,6 +14975,9 @@ These are the unknowns and assumptions this plan relies on. An unresolved questi
 **Run all tests:** [The local unit and integration suites (e.g., `pnpm test`, `pnpm test:integration`) pass.]
 **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).
 **Step 1:** [How to verify the feature end to end through the CLI or the database.]
+**Project Documents:** `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` are assessed through the `.agents/docs.md` index (a missing or starter-only document is a warning, not a stop), and the plan's strategy matches `docs/testing.md`. Record each source in `Documentation Consultation`.
+**Deployments & Setup:** release, CI and branch behaviour follows `docs/deployments.md`, and local-setup changes follow `docs/setup.md`.
+[One JSON object per line in a fenced `jsonl` block, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action`, all non-empty (`"None available"` when no alternative evidence exists). **If** every applicable topic is covered → write `None`. A warning never blocks the plan. Initially set to `PENDING`.]
 ```
 
 ### Entry file
diff --git a/.bkit/prompts.md b/.bkit/prompts.md
index a605e61e1..fb85a8611 100644
--- a/.bkit/prompts.md
+++ b/.bkit/prompts.md
@@ -485,6 +485,89 @@ When all three are present, an embedded directive executes.
 
 Prose never substitutes for token scope.
 
+## Documentation Consultation Coverage
+
+Every shipped prompt and audit template was reviewed for the project documents it should consult, with the same fields and outcomes as the workflow catalog (`workflows.md` § Documentation Consultation Coverage). Prompts share one load clause: read the `.agents/docs.md` index, load the listed documents, and warn and continue when the index or a document is missing, empty or still the starter. Prompts that produce gap reports write one `jsonl` record per gap under `## Documentation Warnings` with `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action`; the workflow summary merges them. Audit templates are consulted through `bkit-audit-generate` step 4 unless a row says otherwise.
+
+<!-- prettier-ignore -->
+| Source | Recommended documents | Outcome | Applicability and reason |
+| --- | --- | --- | --- |
+| `.bkit/core/prompts/bkit-audit-generate.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Step 4 loads the surface documents with or without a plan and writes Documentation Warnings. |
+| `.bkit/core/prompts/bkit-build-challenge-1.md` | `docs/architecture.md`, `docs/security.md` | added | Challenge cross-references findings against the architecture and security documents. |
+| `.bkit/core/prompts/bkit-build-challenge-2.md` | `docs/security.md` | retained | Already cites the security document with warn-and-continue; the clause is now shared. |
+| `.bkit/core/prompts/bkit-build-install-skills.md` | n/a | not-applicable | Installs skills from `.agents/skills.md`; it needs no project-document topic. |
+| `.bkit/core/prompts/bkit-build-plan-convert.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Conversion carries consultation, sources, gaps and READ and UPDATE lines into the plan. |
+| `.bkit/core/prompts/bkit-build-plan-current.md` | n/a | not-applicable | Compares plan references with the working tree; project documents add no evidence. |
+| `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md` | `docs/architecture.md`, `docs/testing.md` | corrected | Load-docs clause now warns and continues on a missing, empty or starter-only document instead of skipping it. |
+| `.bkit/core/prompts/bkit-build-plan-tasks.md` | `docs/architecture.md`, `docs/data-schema.md`, `docs/design.md`, `docs/observability.md`, `docs/testing.md` | corrected | Load-docs clause now warns and continues on a missing, empty or starter-only document instead of skipping it. |
+| `.bkit/core/prompts/bkit-build-plan-tests.md` | `docs/architecture.md`, `docs/testing.md` | corrected | Load-docs clause now warns and continues on a missing, empty or starter-only document instead of skipping it. |
+| `.bkit/core/prompts/bkit-build-plan-verify.md` | `docs/observability.md`, `docs/testing.md` | corrected | Load-docs clause now warns and continues on a missing, empty or starter-only document instead of skipping it. |
+| `.bkit/core/prompts/bkit-debug-abort-handover.md` | n/a | not-applicable | Writes the handover from run artifacts and keeps their warnings; it consults no document. |
+| `.bkit/core/prompts/bkit-debug-failure-diagnose.md` | `docs/testing.md`, `docs/noise.md` | added | Diagnosis checks registered signal downgrades and test tiers before judging a failure. |
+| `.bkit/core/prompts/bkit-debug-failure-remediate.md` | `docs/testing.md` | added | Remediation follows the testing document when present. |
+| `.bkit/core/prompts/bkit-debug-failure-reproduce.md` | `docs/testing.md` | retained | Already cites the testing document with warn-and-continue. |
+| `.bkit/core/prompts/bkit-debug-failure-soak.md` | `docs/testing.md` | added | Soak runs follow the tier rules in the testing document when present. |
+| `.bkit/core/prompts/bkit-design-brainstorm-ideate-1.md` | `docs/architecture.md`, `docs/technology.md` | added | Pragmatic lens starts from existing topology and stack choices. |
+| `.bkit/core/prompts/bkit-design-brainstorm-ideate-2.md` | `docs/architecture.md`, `docs/technology.md` | added | Trade-off lens starts from existing topology and stack choices. |
+| `.bkit/core/prompts/bkit-design-brainstorm-ideate-3.md` | `docs/architecture.md`, `docs/security.md` | added | Pre-mortem lens reads boundaries and trust assumptions. |
+| `.bkit/core/prompts/bkit-design-generate.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md` | added | Draft design records the sources it consulted and warns on gaps. |
+| `.bkit/core/prompts/bkit-design-organise.md` | `docs/architecture.md` | added | Workstream grouping respects documented boundaries. |
+| `.bkit/core/prompts/bkit-design-review-1.md` | `docs/architecture.md`, `docs/technology.md` | added | Feasibility review checks the design against documented topology and stack. |
+| `.bkit/core/prompts/bkit-design-review-2.md` | `docs/observability.md`, `docs/deployments.md` | retained | Already cites both documents with warn-and-continue. |
+| `.bkit/core/prompts/bkit-design-spike.md` | n/a | not-applicable | Throwaway probes answer from code and the web; project documents add no evidence. |
+| `.bkit/core/prompts/bkit-design-update.md` | `docs/architecture.md` | added | Applying review items keeps the design consistent with documented boundaries. |
+| `.bkit/core/prompts/bkit-plan-generate.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Fills Documentation Consultation and Documentation Warnings and carries READ and UPDATE lines. |
+| `.bkit/core/prompts/bkit-plan-review-1.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Critique checks that the plan consulted each assessed topic. |
+| `.bkit/core/prompts/bkit-plan-review-2.md` | `docs/testing.md` | retained | Already cites the testing document with warn-and-continue. |
+| `.bkit/core/prompts/bkit-plan-scope-check.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Scope audit checks the consultation table and warnings are complete. |
+| `.bkit/core/prompts/bkit-plan-update.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Preserves source evidence and updates it when a review changes the plan. |
+| `.bkit/core/prompts/bkit-ship-conflict-resolve.md` | n/a | not-applicable | Resolves merge conflicts from git history and both sides; no project-document topic. |
+| `.bkit/core/prompts/bkit-ship-deferred-sweep.md` | n/a | not-applicable | Reads the deferral ledger only; no project-document topic. |
+| `.bkit/core/prompts/bkit-ship-update-docs.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md` | added | Checks presence, index accuracy and project content for every topic and reports unresolved coverage. |
+| `.bkit/core/prompts/bkit-utility-compress-markdown.md` | n/a | not-applicable | Compresses the one file it is given; no project-document topic. |
+| `.bkit/core/prompts/bkit-utility-update-decisions.md` | n/a | not-applicable | Ledger upkeep per `.bkit/jsonl.md`; no project-document topic. |
+| `.bkit/core/prompts/bkit-utility-update-deferrals.md` | n/a | not-applicable | Ledger upkeep per `.bkit/jsonl.md`; no project-document topic. |
+| `.bkit/core/prompts/bkit-utility-update-documentation.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md` | added | Reviews every relevant topic including absent ones, populates within scope and reports gaps. |
+| `.bkit/core/prompts/bkit-utility-update-failures.md` | n/a | not-applicable | Ledger upkeep per `.bkit/jsonl.md`; no project-document topic. |
+| `.bkit/core/prompts/bkit-utility-update-knowledge.md` | n/a | not-applicable | Ledger upkeep per `.bkit/jsonl.md`; no project-document topic. |
+| `.bkit/core/prompts/bkit-utility-update-roadmap.md` | n/a | not-applicable | Roadmap upkeep from ledgers and the tracker; no project-document topic. |
+| `.bkit/core/prompts/bkit-utility-update-tracker.md` | n/a | not-applicable | Tracker upkeep per `.bkit/trackers.md`; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-accessibility.md` | `docs/design.md` | retained | Already cites the design document for tokens and components. |
+| `.bkit/core/docs/templates/bkit-audit-adoption.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md` | added | Step 6 checks presence, index accuracy and content of every project document. |
+| `.bkit/core/docs/templates/bkit-audit-agents.md` | n/a | not-applicable | Reviews instruction files, hosts and hooks that bkit manages; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-aio-seo.md` | n/a | not-applicable | Crawls public pages for search and answer-engine readiness; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-analytics.md` | `docs/observability.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-annotations.md` | n/a | not-applicable | Reviews code annotations against the code; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-app-performance.md` | `docs/architecture.md`, `docs/observability.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-app-store.md` | `docs/deployments.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-architecture.md` | `docs/architecture.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-ci-performance.md` | `docs/deployments.md`, `docs/testing.md` | retained | Already cites both documents. |
+| `.bkit/core/docs/templates/bkit-audit-config.md` | `docs/deployments.md` | retained | Already cites the deployments document. |
+| `.bkit/core/docs/templates/bkit-audit-cost.md` | `docs/deployments.md` | retained | Already cites the deployments document. |
+| `.bkit/core/docs/templates/bkit-audit-coverage.md` | `docs/testing.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-database.md` | `docs/data-schema.md`, `docs/setup.md` | corrected | Cited the setup document only; the schema document is now named for the active schema. |
+| `.bkit/core/docs/templates/bkit-audit-dead-code.md` | `docs/architecture.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-deferrals.md` | n/a | not-applicable | Audits the deferral ledger; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-dependencies.md` | `docs/deployments.md` | retained | Already cites the deployments document. |
+| `.bkit/core/docs/templates/bkit-audit-documentation.md` | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md` | added | Step 3 checks presence, index accuracy and project content and writes Documentation Warnings. |
+| `.bkit/core/docs/templates/bkit-audit-duplication.md` | `docs/architecture.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-failures.md` | n/a | not-applicable | Audits the failure ledger; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-flakes.md` | `docs/testing.md` | retained | Already cites the testing document. |
+| `.bkit/core/docs/templates/bkit-audit-gates.md` | `docs/deployments.md`, `docs/design.md`, `docs/testing.md` | retained | Already cites all three documents. |
+| `.bkit/core/docs/templates/bkit-audit-issues.md` | n/a | not-applicable | Audits tracker issues; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-llm.md` | `docs/technology.md`, `docs/security.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-logs.md` | `docs/observability.md`, `docs/noise.md` | retained | Already cites both documents. |
+| `.bkit/core/docs/templates/bkit-audit-models.md` | `docs/technology.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-privacy.md` | `docs/security.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-prompts.md` | n/a | not-applicable | Reviews bkit prompts and agent files; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-red-team.md` | `docs/security.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-reliability.md` | `docs/deployments.md` | retained | Already cites the deployments document. |
+| `.bkit/core/docs/templates/bkit-audit-repo.md` | `docs/architecture.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+| `.bkit/core/docs/templates/bkit-audit-security.md` | `docs/security.md`, `docs/deployments.md` | retained | Already cites both documents. |
+| `.bkit/core/docs/templates/bkit-audit-slop.md` | n/a | not-applicable | Scans code patterns against lint rules; no project-document topic. |
+| `.bkit/core/docs/templates/bkit-audit-testing.md` | `docs/testing.md` | retained | Already cites the testing document. |
+| `.bkit/core/docs/templates/bkit-audit-usability.md` | `docs/design.md` | added | Consulted through `bkit-audit-generate` step 4, which loads the surface's documents, warns and continues when one is missing, and writes `Documentation Warnings`. |
+
 ## Model Presets
 
 Two settings for OpenRouter, the overflow column, which covers the days after the week's OpenAI, Anthropic and Google credits run out. Costs are per **2-day gap**, the binding case against the weekly cap (`.bkit/providers.md` § Budget band), at the measured OpenCode profile with each agent carrying an equal 1/40 share. Judges and key gates: § Models Judges note.
diff --git a/.bkit/version b/.bkit/version
index 318ce8688..b4b4baad7 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -14,166 +14,166 @@
     ".mcp.json": "65b29f1bb28dd6296d1dc8ea34aca4826d9ca072d7cef9d2971a7045280505d9",
     ".bkit/.env.example": "33195c635ab4b35dea8990a278bb28193f4b5f331dcbdc5c975aeb5f51743e41",
     ".opencode/opencode.json": "06b3702dcb8968463c164b36fbc340428591f6601420cb48e95371db1d1ac958",
-    ".claude/commands/bkit-auto.md": "cf0e2d6d29a873669c3e718bf6a83e0af3e8e8b6d71325bf5e968a7f3f315f22",
-    ".claude/commands/bkit-build.md": "1436b48b64650f41b2afb0aa6a4f2c8f1356cbd79b7ca22c4f8d40d5e7fc7f72",
-    ".claude/commands/bkit-debug.md": "f1304c91860d5e0f5bd3cf1b83262cb062004b2e62a4362254d91991a7796024",
-    ".claude/commands/bkit-design.md": "e7b100d353cf886b88ba95572d3eb8f88ac09e584417f2823e6c817de6b21cf5",
-    ".claude/commands/bkit-plan.md": "72b4b5b7461d58621715c10f684bcbafcfa343efce541c2481f6a45be2f2fbc1",
-    ".claude/commands/bkit-ship.md": "b9116db64902b23b5c439edfbaf83580d618507c1e1814798173a91dafafafe4",
-    ".claude/agents/bkit-build-challenge-1.md": "1f0761c059842a1dcefff95f27fe3cc68e41155f03c8929d88ccc0c83461d290",
-    ".claude/agents/bkit-build-challenge-2.md": "bbcd34b3aebe874539aa62ec3e1caf02b87d7296f6cf67d8ad58c810e325957b",
-    ".claude/agents/bkit-build-install-skills.md": "4da65c11fa042e5b578717c510dfaf3e8fe51466c04adc63cb16a8215913b817",
-    ".claude/agents/bkit-build-plan-gaps-remediate.md": "204739e34d24c342ca2ba87997d4db961a9698a09cfa7eab41d4a903caf422a9",
-    ".claude/agents/bkit-build-plan-verify.md": "af4fcaf68d3b93e8e59076be61f7404438b7b90b96909a8cb13d594e78af3f9f",
-    ".claude/agents/bkit-debug-abort-handover.md": "f5611ebb0250dc782e7a98c516f0c97ff37234b191cd890d6959539e0c9864f7",
-    ".claude/agents/bkit-debug-failure-diagnose.md": "39dc6d8b20bcf665238b3a940f93d17481ca109947063cc40553431c1cd82f21",
-    ".claude/agents/bkit-debug-failure-remediate.md": "24ee9d2820cb0df18d22212115283701911e87d297d1776ee6fb86c74850fa48",
-    ".claude/agents/bkit-debug-failure-soak.md": "ce8e43382f2417524133e4f5770428f05e409ccb6aa69607add6ad5e452ca7c9",
-    ".claude/agents/bkit-design-brainstorm-ideate-1.md": "5d89ea2f92997dad6cda79538506c54f45b0cae30b4554bec11c7a0d6096f78f",
-    ".claude/agents/bkit-design-brainstorm-ideate-2.md": "1f7bffe9c09b610d4d655567c0ae4742f35c957a435a76d4b5984db2efcdf6be",
-    ".claude/agents/bkit-design-brainstorm-ideate-3.md": "824a8bf841efa0073bf30d4d94c277b9fce7a2fbec3379e82a8c44001f633411",
-    ".claude/agents/bkit-design-generate.md": "7006434475b3ee4f08470c634df484a51a163f34d655a156f263e8ca8b2cfc08",
-    ".claude/agents/bkit-design-organise.md": "8182afc9291956b97fe5115d11f8d96e75445c5d1e4013aac7ce7b94a34ac334",
-    ".claude/agents/bkit-design-review-1.md": "1d4420f76c7948dd6cab6ccc398e06056c91924d9c52b62d1a54c498a43cfa3b",
-    ".claude/agents/bkit-design-review-2.md": "ab4713030f49963a91adfa7a9eb14a19cb2e5614a2575df993bde8a4e1762a56",
-    ".claude/agents/bkit-design-update.md": "9b8988b0576b2c4432da8f77c86a41012067b7b78600385ed1e4ecb3240b6345",
-    ".claude/agents/bkit-plan-generate.md": "232e456eb63639213c43ec00ce7c6afaebf7526f7782926097811a5bdedfe2e1",
-    ".claude/agents/bkit-plan-review-1.md": "1aabc9050ee1e6e61ccc91a72593651c7414dcc8636af29c308357368657a450",
-    ".claude/agents/bkit-plan-review-2.md": "4feecd74d4b1dc39cd6249ee2238d13d2095826780f2b98876fdc891979e197a",
-    ".claude/agents/bkit-plan-update.md": "0404fd44252de2f687fe7bc973ed79067fd4573b7e806fd9f67edc233ffde234",
-    ".claude/agents/bkit-ship-conflict-resolve.md": "f2ef825d7030231947c541a7f7e3c561afe3708ce9436d8585bb466911bf6b28",
-    ".claude/agents/bkit-ship-deferred-sweep.md": "4eb74e02b7438e72818cd735b07af1f0a964dae7bfa42779ecd93d294e632b0a",
-    ".claude/agents/bkit-ship-update-docs.md": "f10a697f8f4d98b22b220c4405d64c7f31d78d32384ef0a64102b6da6a67c9e9",
+    ".claude/commands/bkit-auto.md": "d92e196cb450c7f50b8a21e8281014627e9ed131c8154b3685f88b2c5aa4d025",
+    ".claude/commands/bkit-build.md": "c1ce924c8fb7a9dd0a846a4da0e93ed29367ee031fff9688c44e75a8b9ee3fbf",
+    ".claude/commands/bkit-debug.md": "de832653702912caa21f6cd134ea19922b3c358d489c7df40a6709c31a4d0ccb",
+    ".claude/commands/bkit-design.md": "8e489c8698fda8675b6d916de2841fd79aed180dc9529dda0734d3a4d9d76352",
+    ".claude/commands/bkit-plan.md": "4a611c8acb1773a83fbf0ca01411fbc288bb6af9e00f7dbaabd5e1585e191e8a",
+    ".claude/commands/bkit-ship.md": "077ad9c32cc5cab956c1aa4dce9ed25bad6da92b605d262e7a23682ec4eb764b",
+    ".claude/agents/bkit-build-challenge-1.md": "20ff6fcaf48d5a6418c696c88e796101c34083326b8353bf6ec766422c4c734f",
+    ".claude/agents/bkit-build-challenge-2.md": "0ef8a829af9b89602a75ac257a093e4a47169ca9c2a4c216d6f11937e2e9c48f",
+    ".claude/agents/bkit-build-install-skills.md": "0249b5fe6550c45afe95972d1d3f4a65f7e159a74038ce9179ca1fceb29e1d12",
+    ".claude/agents/bkit-build-plan-gaps-remediate.md": "3f7fdf1567bf18a5df713b9a7bf2ebd3f612b45a3b97903e07166affc4dfcd81",
+    ".claude/agents/bkit-build-plan-verify.md": "9ced3d54b76e26a9542a2ce5cfc5bd442e36f12122e5308fa2b44405034ff434",
+    ".claude/agents/bkit-debug-abort-handover.md": "872c243f11040dd1ed4074be6ff89669fdc2b95098734377b9c5166789f678c5",
+    ".claude/agents/bkit-debug-failure-diagnose.md": "7f65bb01cd4e5d51a0a1442fc5032c0745037e63764ff183bd3277a5207350cc",
+    ".claude/agents/bkit-debug-failure-remediate.md": "17927a641c817441a1754d72891372c6bc6e486306168f1adf588b2a5a1385e4",
+    ".claude/agents/bkit-debug-failure-soak.md": "067de334b846f1f4d88e05b40a3cd570a15c3014ccf0224fb58d044d3bb5de39",
+    ".claude/agents/bkit-design-brainstorm-ideate-1.md": "f465bc0f6d1fc741182bce1aad55b85bf2a9de1c9b5c28bf72d2f7ca52276bb2",
+    ".claude/agents/bkit-design-brainstorm-ideate-2.md": "9d66709810fd63071cf68f0e909912366ea4fd2364fdf59e6e6c163467398bb5",
+    ".claude/agents/bkit-design-brainstorm-ideate-3.md": "5ff5aed2175e3cd102f86aa8af0cef211084c0276873f1c82ec3215ba49e5077",
+    ".claude/agents/bkit-design-generate.md": "fb676c2842243d4d86310ff77d2a96717ba9e0df94e7d505198664f1b482ecbb",
+    ".claude/agents/bkit-design-organise.md": "810283b6dcd06a76fb259bcab326d700d34744618ba4724c06e2e091c95f4328",
+    ".claude/agents/bkit-design-review-1.md": "33fa952eceb75001e826da6ba67236630c2d1138daebf959f27dbb187283fabe",
+    ".claude/agents/bkit-design-review-2.md": "197042abee1d7119bd2abadc1fae3a26cec75ff0201a8cd7abe98bdafbab2569",
+    ".claude/agents/bkit-design-update.md": "da188d9fbf453932766a064de41690953cf5d1457a956b6d0c4ba7043f6a760d",
+    ".claude/agents/bkit-plan-generate.md": "a9c65f1bf1e42415409132024e83eb1730a24184fb50b8cd78fbd78cf6752bb5",
+    ".claude/agents/bkit-plan-review-1.md": "e98b2fc54b29ca9f4cd1164af0f1b950bed961566a324900a4e7505774c22592",
+    ".claude/agents/bkit-plan-review-2.md": "6819aea7db885c635658991debda35e6974d534f9c07dc12bd26ef6deb7ac325",
+    ".claude/agents/bkit-plan-update.md": "6829d1d1379cb377c50acdfebd35406569ed4579f5599062c31f68ba620b4e4f",
+    ".claude/agents/bkit-ship-conflict-resolve.md": "c133bd61a184ed730fd32c9b0bb09af73d4933baa7337c0ba9a53cf0dbcab815",
+    ".claude/agents/bkit-ship-deferred-sweep.md": "03439d9563505a4c86f172dbb954593666c10ee38ea79170c9b4ef90649ba836",
+    ".claude/agents/bkit-ship-update-docs.md": "6603009e9ab856f209a01a86f7017cf9ce995958c4c18b51e76ed4733f133d53",
     ".claude/agents/bkit-utility-compress-markdown.md": "1b7656fc438127f67b566c9f532e6a39649c79e1bda1814608a4f3d44daed45b",
-    ".claude/agents/bkit-utility-update-documentation.md": "aa2d0541c2b77b0f647ee0d046c38446d90598ad23af0ea8907a52b471b39768",
-    ".cursor/commands/bkit-auto.md": "4c152651b33c0ba41f323ade39b9d578d6af66e3cea25d9464a408eb357e4a05",
-    ".cursor/commands/bkit-build.md": "d5a109a8a7b75655aacca6aa11f1b296352353bd9beb61e9cf0f0dc131d8c827",
-    ".cursor/commands/bkit-debug.md": "c02ad2c9c5b1e44a1c50f422b3244bc81f71006a31717e8e594fbe5744961b4b",
-    ".cursor/commands/bkit-design.md": "505e4909b51ec35696974a567c6b720a5f2a20e0b9ae4dccd814060319497dfd",
-    ".cursor/commands/bkit-plan.md": "a0328b0487eff4968a76907eebb76e5f7cb25a3c46f961458ef5fb5c1753b935",
-    ".cursor/commands/bkit-ship.md": "7237c78c9f0fe01d724821eb3a48c5abb71d26cb0274889d7deb539ab37c178d",
-    ".cursor/agents/bkit-build-challenge-1.md": "38fb30e36724318e5e986f69ad598e5f5b4b087b084101e68d330d9353287ff2",
-    ".cursor/agents/bkit-build-challenge-2.md": "71b3912372bb4f8c704e5032b0ec2e3bf6d17eee1d7b3620e979882aee8e7eb6",
-    ".cursor/agents/bkit-build-install-skills.md": "823ebd00f4d9e732796520677b2d2b5aa17fbd72dcbc9a92ff78bf141c44af95",
-    ".cursor/agents/bkit-build-plan-gaps-remediate.md": "cc7100edd7fa5069f7cadb824098e84a8abcdd27344c1fe10f8e34460a7b2f3e",
-    ".cursor/agents/bkit-build-plan-verify.md": "f5d88ec08b788ca40e30a41437cfa06854a354bd82401f74344a12a7e2009e94",
-    ".cursor/agents/bkit-debug-abort-handover.md": "b697eb7fe094d71a361e6b5b4af68590c5bc27f0f30e751edd2e1fc88613d1c6",
-    ".cursor/agents/bkit-debug-failure-diagnose.md": "4e3e65558765353110f523e84950be3ef9b896f3a86c531b6de5aa28e7662b17",
-    ".cursor/agents/bkit-debug-failure-remediate.md": "f0be7aa4321eec49b2e7abb68fbf4189418123f802e9100cfc20cf3bb9673e02",
-    ".cursor/agents/bkit-debug-failure-soak.md": "8d05d1f52fc487f678e3caeacff7b01c7c09138876788ac2815700a535ce0abc",
-    ".cursor/agents/bkit-design-brainstorm-ideate-1.md": "c433b65eb87ccb89e2bf6ed845c5f64ca36e4fae6423c7411632fbc9462d8f7f",
-    ".cursor/agents/bkit-design-brainstorm-ideate-2.md": "136bf551c8e034d4e5af07a6a8bd6d7059281dec698b012a627b7a37f43710cb",
-    ".cursor/agents/bkit-design-brainstorm-ideate-3.md": "47ebef0e1267a3171dceac61387208c5e5ea37a8ba1673eb512a74f950ffe3dc",
-    ".cursor/agents/bkit-design-generate.md": "d424779644f5bbbf01338b948f924c512b301b02eb185a220cc2ffa40f3d3dcc",
-    ".cursor/agents/bkit-design-organise.md": "7506e05e928749fac35a224bbeaa705dde25e80fedbaa2a2bb8ea9006ee10f8b",
-    ".cursor/agents/bkit-design-review-1.md": "3ff941e6d6c46a2583bdd4e330bbb01a4280c77f4c3d3ffb263bf7e87a291a42",
-    ".cursor/agents/bkit-design-review-2.md": "8955bbfc28ff163258fbfe29b4ca6c713b58614d56a2be4c4b814282ea4bf9f1",
-    ".cursor/agents/bkit-design-update.md": "18111146f7159a2ebb7c8127099f4a565b5da0c8617d4b2e66a23bbaf7ae0b39",
-    ".cursor/agents/bkit-plan-generate.md": "88b70a61b21847a48c32770651e300dc08ee5cde17e9eee6dbcf0b358ed00bda",
-    ".cursor/agents/bkit-plan-review-1.md": "a7daed5f78dac1e9d3bce8f5b264380c3ca1ba30e9ad43390bece6edc33f3c26",
-    ".cursor/agents/bkit-plan-review-2.md": "72c65bdc78b0ef91740c554940364995eab974fc0df2d2f520edd0c78e8fefe0",
-    ".cursor/agents/bkit-plan-update.md": "e054af6a58f6130237b555e4e03c7c907be0021f7c311da765b76313dc2574b1",
-    ".cursor/agents/bkit-ship-conflict-resolve.md": "b91a0960d061ecc7b7172358381928c6169731be546fcb869e97ab20c19e7ca6",
-    ".cursor/agents/bkit-ship-deferred-sweep.md": "c365eaa6eb3cf2233707f8e1f9820c10a9a32e3b2ecbe647c21eaee5260f62d3",
-    ".cursor/agents/bkit-ship-update-docs.md": "548fd12739db4f16092559dccd8035d40f8d03b7f0f1004996549b6ac284fe88",
+    ".claude/agents/bkit-utility-update-documentation.md": "58eef51a24cbbd53a16c12cf603888fc4a98963bb7dadbde0b60a7e3207eb43c",
+    ".cursor/commands/bkit-auto.md": "f5b3b8b6a8981d850815f5fe45274fc5ad42d075660e21447f52a364d79f8db4",
+    ".cursor/commands/bkit-build.md": "ad06d7ed575706cd210966b9fe093584c877074d4de7c56b3ce6d526801246e4",
+    ".cursor/commands/bkit-debug.md": "ed534e4baed06aa8b60b7e54bd1d0c45252f855a3d9b4049ffb146deaec3eda1",
+    ".cursor/commands/bkit-design.md": "f0c539059e6774644496305a4fd9bd3d05be9254189817f587badffad18d6e3f",
+    ".cursor/commands/bkit-plan.md": "a13dbd7259b03f28f6aa4fe8ae61e481f65d0269384ac7d348a5afd47d363145",
+    ".cursor/commands/bkit-ship.md": "e4c5a5f6e4966a466f7734f547b13e0e27a64123fb5e9b2da94ba25304e23a51",
+    ".cursor/agents/bkit-build-challenge-1.md": "91f6446c505416d377dcbabcc49030e704384980f3ed232694069108504c2dab",
+    ".cursor/agents/bkit-build-challenge-2.md": "6399d8b34ff1be2a63b77b911fd8321f80bd0bf64550103f809cdf5194820c24",
+    ".cursor/agents/bkit-build-install-skills.md": "9f77d5ce2bc7e5d1c60d8860b5a06d81091f9194522607151a76838fc895da6d",
+    ".cursor/agents/bkit-build-plan-gaps-remediate.md": "878f11cb9ccc6ff47513805b71593df1f3e53b85da55b3e1c2737704c98bedb4",
+    ".cursor/agents/bkit-build-plan-verify.md": "7461b798c399a2a8819df61823de576c9d0aaf0f2095a3523f844900dbf217dc",
+    ".cursor/agents/bkit-debug-abort-handover.md": "e5f2aa83a3656e9e3ac12f5ab1866361da06f07e852599a7d9da0d81df21d153",
+    ".cursor/agents/bkit-debug-failure-diagnose.md": "8072b784681dd9db3f55a9617cf5cac5f58909a8a903ecc60c0260f621cb14af",
+    ".cursor/agents/bkit-debug-failure-remediate.md": "4c61953d5b6ebae9ad3258e7556e7ba56ffb2e0fe24ff9b09d7430ba7cb44b89",
+    ".cursor/agents/bkit-debug-failure-soak.md": "6372e4d0c6258e9f0757a06e272acc79bff7187490e9556fc51b3890e2230de3",
+    ".cursor/agents/bkit-design-brainstorm-ideate-1.md": "553260062d9631bd5ba041d35f0ee5917ab4825f9c5814112491efe4beb27077",
+    ".cursor/agents/bkit-design-brainstorm-ideate-2.md": "13de62df46df249dde16478972379d9ca91a2d6aef048d68eefa6ea274bf56cb",
+    ".cursor/agents/bkit-design-brainstorm-ideate-3.md": "8cbedb9b8ec822effb1086685a781931c607d3f217f37782ce58ad6a1754e9cf",
+    ".cursor/agents/bkit-design-generate.md": "1deee0e8b05f384b387e3b726a45494943a2e2a058a14f0cc550dd6cda63505b",
+    ".cursor/agents/bkit-design-organise.md": "6693a01b882c26427ab5aac4c037f783c8197445b2b126648ac08f3e8391a052",
+    ".cursor/agents/bkit-design-review-1.md": "865e2adccacb77c531652bd706113b068530f25c61cad0cb42fb2de970f5bfbc",
+    ".cursor/agents/bkit-design-review-2.md": "069d4218f7c2f378e375415ee188c34ed0803da4fd5a825ddc3e6b7c3f149aa6",
+    ".cursor/agents/bkit-design-update.md": "abc73bba074c55961259ed53e10a23128b7269c1dda4bcd9e3fee4322e2d3aed",
+    ".cursor/agents/bkit-plan-generate.md": "69bb27e1b9f1a07b5551e3acb3dc47bd9c6a533cfe953707fc5f5ef74f8cbe02",
+    ".cursor/agents/bkit-plan-review-1.md": "4337035031fe1d92169a7cf5a94a0d6623fdd92e3b9f21a1a5200c79842a6c58",
+    ".cursor/agents/bkit-plan-review-2.md": "69810779185dfe2d9a582964bfc6ce833f2eb4ee9b9e6f247ad5279bf3f365b6",
+    ".cursor/agents/bkit-plan-update.md": "513c55737a783e78eea609922559d2f0ac90951368bb0cd5f005eb7e7341016e",
+    ".cursor/agents/bkit-ship-conflict-resolve.md": "67986520d07938a7fc460fd64d2afe1eba139870ccc86d3f63787475ffb5c8ca",
+    ".cursor/agents/bkit-ship-deferred-sweep.md": "90531b1335d7a77c62352a885d192fc64322c8d6f3eb3b96e5d8b1aa094452cd",
+    ".cursor/agents/bkit-ship-update-docs.md": "3cc8a9502a3b88eb478ab44cef636cb0322dff09ea8f9f5b4527ef52ba5d7fa2",
     ".cursor/agents/bkit-utility-compress-markdown.md": "5238ba61a261eaa0667a511628a67e3df72d2f0132d42d673255b5f49943385d",
-    ".cursor/agents/bkit-utility-update-documentation.md": "94d4e88e4dfb7ff1ee6d1d7e0a6d273b9b4173fcecc53a4bf131976978f973f7",
-    ".opencode/agents/bkit-build-challenge-1.md": "22569b9ce32537a8ad8db975d3fb570ebc3a74f3a12b52db3f1ce6695fd3685d",
-    ".opencode/agents/bkit-build-challenge-2.md": "e2c1959f56344cecf117b0bceca6b5e9dc70d4f221c247d208bb7ee77efd4e95",
-    ".opencode/agents/bkit-build-install-skills.md": "b7bf5934fa71e8d7f7b895c848533ff1b8bd56813d57c17f86c49bef10b7e387",
-    ".opencode/agents/bkit-build-plan-gaps-remediate.md": "61530d80300834ffa9229abbaa8ecb888e99a060ef2b25a23714330cdc1da003",
-    ".opencode/agents/bkit-build-plan-verify.md": "6fe0b8f1690f1bc67c26ace298041e9f9d450ec54183ed8ff8046195059c8334",
-    ".opencode/agents/bkit-debug-abort-handover.md": "38a0710518d6d638122708ae1e4f02265bfe653d01776b78001a168c3706ec65",
-    ".opencode/agents/bkit-debug-failure-diagnose.md": "c0c296704dd6e409d63a42fc85a62ab4077209aa788f2a0765c11a10bbbf0d52",
-    ".opencode/agents/bkit-debug-failure-remediate.md": "c67c9339c20b88d94f04e7645b13b1f200d815a323b1d7cf15e7913e741bf240",
-    ".opencode/agents/bkit-debug-failure-soak.md": "73a8624182839b5602407965ad612fc9e9d3bef5cd528e7879e1dd80e7ee2f5d",
-    ".opencode/agents/bkit-design-brainstorm-ideate-1.md": "36fbadd762b9dad9ae93cb024235b53a2cc34d77905ef76dd7613f2df95a83ac",
-    ".opencode/agents/bkit-design-brainstorm-ideate-2.md": "367e75977f5879923bc6bfe95306fdb3f59614375a27dc1f33b94afbf1727d51",
-    ".opencode/agents/bkit-design-brainstorm-ideate-3.md": "bed6d5a465f41a43e7f05a0f16902826ff18e3c05ba795b8c9d7dfc42e02f5ba",
-    ".opencode/agents/bkit-design-generate.md": "28fa234bf2e59520c36e5d928114a475ab67e4f209e763b381a218b534ad2383",
-    ".opencode/agents/bkit-design-organise.md": "a2f592675a35cd07f77937691c76d7514c4a25bb2f7802b7276c83153a118fdd",
-    ".opencode/agents/bkit-design-review-1.md": "337f30d9b832ccc78b184c6a1b8dfea21465ef4de1ac7ed512921a2bdb930b42",
-    ".opencode/agents/bkit-design-review-2.md": "25177d715afce62e7df5671ba15ce82fc0354bf40ad09637cde92d4cacdb8db0",
-    ".opencode/agents/bkit-design-update.md": "5df586e715f2d080f05682fd7b1da9bd5ef42f3a624488e8e733fddebb3e6ddd",
-    ".opencode/agents/bkit-plan-generate.md": "4c4038e3377c66da59c484f303b28a774d3091f7d34e39d9910376e5dd2c8c0b",
-    ".opencode/agents/bkit-plan-review-1.md": "e7b57391bd28c73c272fd0388d44138d70f837e98dc2677f6224344b0196cb68",
-    ".opencode/agents/bkit-plan-review-2.md": "dc510e946d49e28bf34d877bc95222065e528633f89211bcf8c4ba2d1790227b",
-    ".opencode/agents/bkit-plan-update.md": "15ce3d0c22b7a50ca47031060e0dea90ff9f51165b8e59af9797fd165455a234",
-    ".opencode/agents/bkit-ship-conflict-resolve.md": "afcf5b68e41a78bca50db2bf89d5789070d3fd8849ae9ead377dad48420610b4",
-    ".opencode/agents/bkit-ship-deferred-sweep.md": "bbfb1b8cb1c1ed05476bf4dddbd3a17ec362ff5c66661b8f616f7ffef866459c",
-    ".opencode/agents/bkit-ship-update-docs.md": "ca9cd4fd12e76d787b7ad00717fb91732e183cff35d8fc7ea9b97ce084c0d09e",
+    ".cursor/agents/bkit-utility-update-documentation.md": "9173c0b73336224c164046120ced88d348afe03a3b8a83e384b562bffd66c91f",
+    ".opencode/agents/bkit-build-challenge-1.md": "f279a1470feb7e542494b9fcc69b7dff1ad8e1d7c19190472b76f0734e59f744",
+    ".opencode/agents/bkit-build-challenge-2.md": "9c8bdb5092b44f070468b82d88d9457ab58193d7f5697300877fc96779400e9d",
+    ".opencode/agents/bkit-build-install-skills.md": "56687e9967e11c8e3ddc0c965a4818898d2ad61cc279af30ea862390eb245b8d",
+    ".opencode/agents/bkit-build-plan-gaps-remediate.md": "615f617bde964af3e5e8554173d164551510fa8cafadd5a8ec92705a178df1ed",
+    ".opencode/agents/bkit-build-plan-verify.md": "d90502dd64dd9cf200aa58a06f1a62402597d121b71a77523dddb1fb87cd6372",
+    ".opencode/agents/bkit-debug-abort-handover.md": "21c8b8c364310bb283daddfad8887b26993838f41aadeb5bcffb5ba107622039",
+    ".opencode/agents/bkit-debug-failure-diagnose.md": "0be5c25e6e8d38cb242994e8630acb7362027058a03fb1bd70a723fe403f5aa7",
+    ".opencode/agents/bkit-debug-failure-remediate.md": "e87e4a1300cae817bfbaa8662c8f109bc20cefa8c1fd5c50849b660f9deb58f7",
+    ".opencode/agents/bkit-debug-failure-soak.md": "0e8191db468cbed5382f8cdab7072222365120ffe3477100589e7b4706a55ef5",
+    ".opencode/agents/bkit-design-brainstorm-ideate-1.md": "0a7b8d0aba116228f1c653dbcc6037e39ccef86eaacbf6f2f09cbc869228541f",
+    ".opencode/agents/bkit-design-brainstorm-ideate-2.md": "73871681a169a3dfe1a8c3bac4a7c17d0a058e889b598d4a83ebf094f5009c3b",
+    ".opencode/agents/bkit-design-brainstorm-ideate-3.md": "f6ac88bd01d513db95b98850f3d6bb432b5b6e87b9e713975e6c9c498bbeb30c",
+    ".opencode/agents/bkit-design-generate.md": "5b1b8fc9972e691fadb24762451cca5452bbc8ef13025a2eb7295858711bdbfb",
+    ".opencode/agents/bkit-design-organise.md": "00c0f344cb66426a32445b0b4dbd23ca742202cc302996209f7fafe85ce17e74",
+    ".opencode/agents/bkit-design-review-1.md": "92abd444617f520c388847c0ede7f79c738710c1cbb487ef8c0f14219df2c6bf",
+    ".opencode/agents/bkit-design-review-2.md": "3161725905d5188b3e591733584d6b0dd27af70489b667b33370bc1ca84c1ecd",
+    ".opencode/agents/bkit-design-update.md": "3f358047bf9ba6260e09ee08cf437bb36b33055c155967a4276b1ad608ec3ea0",
+    ".opencode/agents/bkit-plan-generate.md": "40ed25861d76915208234ceb4bc973cfcb6bb116acc1592372fb874288e7102a",
+    ".opencode/agents/bkit-plan-review-1.md": "c8a093af7563c205d20170649e15ea1a9e33003b5acaa1db5a4aa4c3a13fb997",
+    ".opencode/agents/bkit-plan-review-2.md": "eb28d4237394510ae9134182037f8bf778cd8cfff492171aaa09e384fcc2133b",
+    ".opencode/agents/bkit-plan-update.md": "77a460568adc62c1e768d7aef24338f858029e6ce925b742feb742055fef206b",
+    ".opencode/agents/bkit-ship-conflict-resolve.md": "46919d95ca3118549f92b4f2058025dda41059ad74dfb39cc4df9ff18bb89c95",
+    ".opencode/agents/bkit-ship-deferred-sweep.md": "4fe39a2ffe432c2f0f6fdda007b40d946471237799aadbbf42106f5408a09bf2",
+    ".opencode/agents/bkit-ship-update-docs.md": "8b8825e8ef0c25a575c1c4eadb5dae2d8ab285f6c4eca4a6118b2ab24e27bfd5",
     ".opencode/agents/bkit-utility-compress-markdown.md": "f2f08f6e4de6311dd5f6a4f0573b234d31bae1e0f5d1c4c071969ca978140ee9",
-    ".opencode/agents/bkit-utility-update-documentation.md": "5fd081ae119984018573f62444493240b66411a75ec2aeafe6bdd1b1de903390",
-    ".opencode/commands/bkit-auto.md": "3440ae6b925da8906394459788c702adaebd1acfe9c3fa0eddc3b40102596606",
-    ".opencode/commands/bkit-build.md": "5bba20dc1089feabb09a127896d9ab20cb7d956225307b1b232eaec5ccc6a15c",
-    ".opencode/commands/bkit-debug.md": "508ad6d28451d31b85933f4f866fb33338543d75a1d7da4004227ac4b11b0fe8",
-    ".opencode/commands/bkit-design.md": "b26082616675924b1617cbd56a3be75b9045ca6abe809e7d93a6bff203ca1bff",
-    ".opencode/commands/bkit-plan.md": "75e9b3ce72892071c9a1de753cef3d5ff124aa1dee2b0c1917adcb2c87fb9b97",
-    ".opencode/commands/bkit-ship.md": "ba943cecba745e195188e7848302169f5fa05fd284e6ef3797a53e62c41f38a4",
-    ".claude/agents/bkit-design-spike.md": "6ebe2fa4b367cf183bf1fe766e95afff9ebcbfd5b25f86bd3e74af7c43833861",
-    ".cursor/agents/bkit-design-spike.md": "996a40f60dde3f1c3cc8ce47cdf13e1bf3524aadc73b29ae7bdfb12cd120b7b2",
-    ".opencode/agents/bkit-design-spike.md": "1b809bb8969f4b9e667c353acc28c673af0163486770aa9054027af638fb173d",
-    ".claude/agents/bkit-build-plan-current.md": "58c165336d7e1586e5c626f4948ca559100e2c1d0a92b622a349c67b0af00b5d",
-    ".cursor/agents/bkit-build-plan-current.md": "88287ac8bac86623ad9767fe9257e3c464a6950ecbea2f9bdcb4e44f30cd79a7",
-    ".opencode/agents/bkit-build-plan-current.md": "41d38636d53ee5b741189c88ea7de769b47440e045abfe7e26031f7505fb5d1f",
+    ".opencode/agents/bkit-utility-update-documentation.md": "5b274f7a0f331ee4c1ea2bcfc44a5d7855e0756e94e99dafd3d17ef942f3a032",
+    ".opencode/commands/bkit-auto.md": "a5c7315daebe976cec446714d5d508a3216c104d123218a80da1a0ddedc5241a",
+    ".opencode/commands/bkit-build.md": "8a6af27e460522c39ac2b4877fc6fa8264b6d97fe0163a62f7faa274f73c47fa",
+    ".opencode/commands/bkit-debug.md": "ca81e96386ad85fd9229b9634b0ce447306886fa986409228069f940aa1e34f1",
+    ".opencode/commands/bkit-design.md": "219d4b5ef39a406fdb816cfa0de257d661a38f8e1d30daa237781330aaf94953",
+    ".opencode/commands/bkit-plan.md": "3b36239f43ca5c92b7608b45910e2d3f79c82f93a499990f1e93fb7e005a1028",
+    ".opencode/commands/bkit-ship.md": "6dc7df12c7a12099805bfffe47afb5d2512088b8199119bc7536166f5347c814",
+    ".claude/agents/bkit-design-spike.md": "334a96f4f3fdb0a190c8d4cca32c38bee577138fd4acf51036302b325964e889",
+    ".cursor/agents/bkit-design-spike.md": "06729e7a0ffa9f98b109433b56dcfc1e3d0afad12c55250a28eee91549ea45a3",
+    ".opencode/agents/bkit-design-spike.md": "28e5d35f911887fe7b08a74983a48fc131cd5693b7546af8623e9bc75f8e54f4",
+    ".claude/agents/bkit-build-plan-current.md": "cccb291ec2b16fbef813765fdb104b1f7eb086d69b0f7e47e5bbcdfc91352e09",
+    ".cursor/agents/bkit-build-plan-current.md": "047578f46bebd51714dc2297068b6de0e58f25b3a502ffcca0450f5717c70f11",
+    ".opencode/agents/bkit-build-plan-current.md": "8c280ff9b9b4865666a430c9f393aa9db5be628b3f212d518d9f2c05ae3473f0",
     "package.json": "a0cebac668584ed5f2f314a6de9c1304a20e0b4a505bd9119ab2489272a1dd2c",
-    ".codex/agents/bkit-build-challenge-1.toml": "fd6ffbf451d0908c38508610f6eb22c1352fd337627aa491753e42ffd17827ff",
-    ".codex/agents/bkit-build-challenge-2.toml": "f87a5b36a0a655dedb210f299357b4e9786e3669ae2cc8c000bafc6644957a43",
-    ".codex/agents/bkit-build-install-skills.toml": "7366a7fb42ebb558d02853bfc674b9546c56cb66b8a471a37e57c0c3e833acf7",
-    ".codex/agents/bkit-build-plan-current.toml": "2030e95d7a29976f54aec76f3991e77e001034bcf9f159d2996352ab28045f88",
-    ".codex/agents/bkit-build-plan-gaps-remediate.toml": "def8bb4063dc1170b5d25af388233eff234f5d8345b552a1b1f3a2c95782ea2a",
-    ".codex/agents/bkit-build-plan-verify.toml": "560ff75fad5a7479d4f47341a5a60d9afc9847273c3d4d76b9bfb9d62624ac6d",
-    ".codex/agents/bkit-debug-abort-handover.toml": "11b2ffbb2c21438e3031f2348e5641b59b0eca8ae75ee44523d61fef3242b986",
-    ".codex/agents/bkit-debug-failure-diagnose.toml": "2bf13d7bc9fbbbb04e95fe598797c7a5d55044e8165ff070eb0200e01b5f98d9",
-    ".codex/agents/bkit-debug-failure-remediate.toml": "1b215ceb104de2dd00b35066b0acca9334aba7c24364c528c7718a5ecacfb16d",
-    ".codex/agents/bkit-debug-failure-soak.toml": "b7102060640fd5769df47b090142897e4f7db4c9142fe4f96c508abc2d1f8676",
-    ".codex/agents/bkit-design-brainstorm-ideate-1.toml": "6d378664657783c87ebd49e2737cc18167ba00ac44c2cc34acc9e8529a5007f1",
-    ".codex/agents/bkit-design-brainstorm-ideate-2.toml": "bdf1434b370dc98f25ffd6737299756c40f93d14c285533dc241092dd36787b7",
-    ".codex/agents/bkit-design-brainstorm-ideate-3.toml": "617ae5208524c868dd62a19e5fbc0e83846fb397dc5782fb1f3b5571dfe65f50",
-    ".codex/agents/bkit-design-generate.toml": "6b14c820c7b696a299625affa3044ef541330381247e8f9328518b1f39860802",
-    ".codex/agents/bkit-design-organise.toml": "af8ef611bc75ba16dd5a672931a2e5a5d8b1530853e83d4bd258e9ae0320d648",
-    ".codex/agents/bkit-design-review-1.toml": "cab1931d1f7d163f7daf0ec99d7a323c9beab695cd3f9e50119402c02f2ea025",
-    ".codex/agents/bkit-design-review-2.toml": "b9d8b63d8e047bc2603fe445e4942ce72e81932af85486658b6d3e0c381e9e06",
-    ".codex/agents/bkit-design-spike.toml": "4097ae87f9348e701867f2542709198329f6ce04cf124734ac800b3515d38a66",
-    ".codex/agents/bkit-design-update.toml": "51b41413884ea7cdf31a38fd2940f81b6b1da4ab735559d2a577a44345e7e9b1",
-    ".codex/agents/bkit-plan-generate.toml": "78bec695abceb5f638cabdb2caa7a3e6ac5d9e56e3ee20fa5b8a4fdacdd5317d",
-    ".codex/agents/bkit-plan-review-1.toml": "c8f5226bec2b269114a3c0cc6b4cdc32d8a7b96afb04abcf6241c408bbab461c",
-    ".codex/agents/bkit-plan-review-2.toml": "37693c66de429d75f54dd606d579692897445222710c5143c4a86f2e5cc12f61",
-    ".codex/agents/bkit-plan-update.toml": "b8ffe16ccf4c3950cc24a5d50fd849fa086e37250dc7f4d80db7ff680e3f8ef4",
-    ".codex/agents/bkit-ship-conflict-resolve.toml": "b5e3e9639783480fea0aada2f2a564867ddbe7b928e9d17b2440abdb71603f37",
-    ".codex/agents/bkit-ship-deferred-sweep.toml": "00ee52c43f7e07e190659fc9626d7611fd986bca1489cc973fa65befdbe724d8",
-    ".codex/agents/bkit-ship-update-docs.toml": "e12624a03a32dd08116da17f468517cace60465ecdf8637ccf71e1d513945ab3",
+    ".codex/agents/bkit-build-challenge-1.toml": "9496ce18d065dbad3d1c09e1762582d20b8cc38e3ab103123bbc2f875b99771e",
+    ".codex/agents/bkit-build-challenge-2.toml": "ccb61eb11b5a8b664e8c2c0135122300a2f867a490fca5b14a81e79c9ab4809f",
+    ".codex/agents/bkit-build-install-skills.toml": "ed158a6f987f24f5b0f83919e610cd7574605d2f794ffcd748eec6b12e314a76",
+    ".codex/agents/bkit-build-plan-current.toml": "339cd3e95a5a7e23caf8c21de8b04866a96d47cd494c4e2f6766aeb202c355b2",
+    ".codex/agents/bkit-build-plan-gaps-remediate.toml": "a0973c0b8b1be8eeb87a6eeea240216f4e89325e8e646e28898a1166bf25d234",
+    ".codex/agents/bkit-build-plan-verify.toml": "9acdbc3846770c086deab3456e13c09ca26243072c2ffdb6daf9afea7bed1efd",
+    ".codex/agents/bkit-debug-abort-handover.toml": "13aae099507d02b70c6abb1c5dadce3fb7bc21bb7c8388c110bc3fad14ed54c3",
+    ".codex/agents/bkit-debug-failure-diagnose.toml": "35b5f9861a423970ddc40a0043b57289eb0840e150bf2d2155bf64cb923e8c10",
+    ".codex/agents/bkit-debug-failure-remediate.toml": "45a0bb9d669c3595cea33850d04ffdfaeb8a8dd236c341a5c2ece34f0b6c76b0",
+    ".codex/agents/bkit-debug-failure-soak.toml": "78c9ffab8e8715ad43eacf02bf02c0fb8df161d4e14e75d46d7d0c97be6eab67",
+    ".codex/agents/bkit-design-brainstorm-ideate-1.toml": "ff50e70749520fab807bf6cc02ad5a5f2fe1aaa03c8793c0a878c0fbcad2c53b",
+    ".codex/agents/bkit-design-brainstorm-ideate-2.toml": "14b7c9f29bbceab83cb2629d48d21f8f7eac84311121d37e7d60750fc0b264f2",
+    ".codex/agents/bkit-design-brainstorm-ideate-3.toml": "2dc06877efe9bcaacf670206793788423ee95296681b0e2fed8cd15b4cd41714",
+    ".codex/agents/bkit-design-generate.toml": "9eac29bde00aecb3725daf4f07c2013ccd4544c83de8f00f49f03040306cdad3",
+    ".codex/agents/bkit-design-organise.toml": "3d8593f427197e50afe3b7ccc299b0c004e29c826906708d80231354bc571b3f",
+    ".codex/agents/bkit-design-review-1.toml": "15f3859bfe4084b3d8c640c44588b85866455a008439d5c6f6cc4ee7d8fa89cb",
+    ".codex/agents/bkit-design-review-2.toml": "3033240b4082c4bf20a9bc8c1cf0851ffa34659d3e41394aa830fd50199dc897",
+    ".codex/agents/bkit-design-spike.toml": "6a55a522cb4cb56b2f4c878b023ddac1248fead49ac302755f57c55e1d55b089",
+    ".codex/agents/bkit-design-update.toml": "6af6f525ae58828646920ab689a07726c2efc405dd7af56c48617c1407d50755",
+    ".codex/agents/bkit-plan-generate.toml": "15cdc85d18b76ed0d1e28488cda5fcc4a4aaa32d64a8399c66ced19184fdd7cf",
+    ".codex/agents/bkit-plan-review-1.toml": "af1340f8f23731587306560cf71422ff8e852d74920366ca129227e3e3b71057",
+    ".codex/agents/bkit-plan-review-2.toml": "d4927c43c8e834d8e552182adf345800d4ee23295b283c45812b17528c2a40fa",
+    ".codex/agents/bkit-plan-update.toml": "d8ef8273774786cd19c811575dee2538ee3d97062bc8e411f3ad935226a255b1",
+    ".codex/agents/bkit-ship-conflict-resolve.toml": "a8998334ea4b144c8653fe71fb28a9c4df10d820e4acbb5ed667f1f37f117262",
+    ".codex/agents/bkit-ship-deferred-sweep.toml": "8f46dbb2df35f1217f88ddff1f006fb11abe2e7b98860bfd2587e602c0fb15ac",
+    ".codex/agents/bkit-ship-update-docs.toml": "d247608f1f3491f28246d9fc6d3a1e6469b8ca2af48d9efde81d2d828e408497",
     ".codex/agents/bkit-utility-compress-markdown.toml": "2d4a70bf126246ce104911f923969ea119511291a22fa8347fddf05aa6efef79",
-    ".codex/agents/bkit-utility-update-documentation.toml": "f458c4ac8373b80ef7ea0c02b6a21ca46bddfb8c8c829a88e0662ce080dbf0ec",
+    ".codex/agents/bkit-utility-update-documentation.toml": "44fa8d458706c70f91c93fc83fa178825ce6d2406ae1cf82cd2eb15df6d9b2ac",
     ".codex/hooks.json": "30b45abaee09ac88a77f2296fb31166e96f675a77edc605186f5b2b3fd9063b0",
-    ".opencode/agents/bkit-utility-update-decisions.md": "6fa43a3a7f236e888999911d82749af345b289e1e76b4b1e6fa4ed348044f132",
-    ".opencode/agents/bkit-utility-update-deferrals.md": "041198d27ab138a407adfb6b8fbdeaf41175004d78238fc73977f5095a396e8d",
-    ".opencode/agents/bkit-utility-update-failures.md": "791b26ceb0c00469c4657903690a4006856c17246896991dcc7ce53368663644",
-    ".opencode/agents/bkit-utility-update-knowledge.md": "843f0947210cc23b279a7b42d024684c06caabba0e9b3fa3a991c9a5aad3f8d6",
-    ".codex/agents/bkit-utility-update-decisions.toml": "e21fd04a9d6a037b5e3dc383b8eeba5aa9e01b445c14df79323b8435d6da7048",
-    ".codex/agents/bkit-utility-update-deferrals.toml": "bdb4c2f230ec33c8ce61ff5a6066854d9e25cb8d900532643c337f3f90393070",
-    ".codex/agents/bkit-utility-update-failures.toml": "967021436b150c48394a8530620e3eb36c743ddc74194551ca3591c38d06dc1b",
-    ".codex/agents/bkit-utility-update-knowledge.toml": "80a51c212541936fbb3a475043018da3fad3ec32c949c885e6402140eb808b3b",
-    ".claude/agents/bkit-utility-update-decisions.md": "61317866dc756bf52a1105a5c6b2cc687b20e3758d2a63c2f6ff138d4d7a0460",
-    ".cursor/agents/bkit-utility-update-decisions.md": "20ea4accf91f6aace4d70da598188c2cd4ed3c28ba6dc4d935f4736bbaf4a7ba",
-    ".claude/agents/bkit-utility-update-deferrals.md": "61b7092cb1465029d7ed69ded4349f92d5b52ec897b80b8f1f05ff9a6f5432d8",
-    ".cursor/agents/bkit-utility-update-deferrals.md": "e21031c684ea5d5539305347587e25a800dd0aa983b92cbba6cfd7851492e6f4",
-    ".claude/agents/bkit-utility-update-failures.md": "7326bfcae4267d0b3395705c4ead5822fda9d5820c88878cc97d209c9c511644",
-    ".cursor/agents/bkit-utility-update-failures.md": "d250004d856deeb378fc480a4d87bba35bb45b2db8d3249c1c1fc7cac1ba1d86",
-    ".claude/agents/bkit-utility-update-knowledge.md": "926e9d79778afdd03cf2fcdeba532d26559b4b4d32dac187705b4791e2340ad0",
-    ".cursor/agents/bkit-utility-update-knowledge.md": "74c79f240780f318bdf94134539c7942ee473e2c1240cb5781d5efee29835b36",
-    ".opencode/agents/bkit-audit-generate.md": "00a08055c45b14277bc06272863462bb1ce4abfdf8ca132cc3ce5429be5a6f2f",
-    ".codex/agents/bkit-audit-generate.toml": "6be65cf2880e203fdf5e217bbb5cd04d0eec2645769f81d0f3d53848a60eeddb",
-    "docs/templates/bkit-plan.md": "8ba752b38a009173ddeb281d34f64cb402fd84555755bdb0f7d6ecbce1928b5c",
-    ".claude/agents/bkit-audit-generate.md": "37473e017cc44f42e433291fbf4069d6c52326099b4492b6e3f15e70739c182d",
-    ".cursor/agents/bkit-audit-generate.md": "0cd7f28cda0455d3120c3b2a2f0eb5159675ec8496623b9b025276803d205bb5",
+    ".opencode/agents/bkit-utility-update-decisions.md": "e2a801c02e6a141dbed99f4f63f179a06540540d8ee78012b85041ac8db4f04b",
+    ".opencode/agents/bkit-utility-update-deferrals.md": "f56baf8ea1a821ada3137f20adb7a038336975d7f50f08a5388c1ebbb0d153ce",
+    ".opencode/agents/bkit-utility-update-failures.md": "24c61eda9a042ba942d329718c30d80e0bca3eb17ed01f34bb24ab93ffc1d5c0",
+    ".opencode/agents/bkit-utility-update-knowledge.md": "ad9ef022fd9fa81eec98fc59a9a303ccea23b96fe0e391732517b95e77bdc394",
+    ".codex/agents/bkit-utility-update-decisions.toml": "659ad57fe1a2031a3637047a0f204d880123226fdc2781025b176406860730fe",
+    ".codex/agents/bkit-utility-update-deferrals.toml": "3e69fa30bdbaac8e605daf2a8ba4d86f1bcc60f555e1da48090d84d41b366e94",
+    ".codex/agents/bkit-utility-update-failures.toml": "a963beb708f8d390bc4c2b4daa56ee2cc28b9d1353de5ef18a563c9e06f35fb3",
+    ".codex/agents/bkit-utility-update-knowledge.toml": "7cbdb393cdca099b364bc0f71b26ae6073c4f14b9846238f4e580bf7e3c36d2f",
+    ".claude/agents/bkit-utility-update-decisions.md": "451dd3a4fdf292625f4f163f24e877c89096031e6c77c8d987ecaa9a85b3c914",
+    ".cursor/agents/bkit-utility-update-decisions.md": "a21e98e16c50f581e76d9790ea2ee4f15313aa78be1f5cfffa001a4932065de0",
+    ".claude/agents/bkit-utility-update-deferrals.md": "ac265d71ecd2d13dcafd0a5b76ab9bd8e3df66b2073e9ebd2a9826c508213fd1",
+    ".cursor/agents/bkit-utility-update-deferrals.md": "baea731747b37f8ae1aacc528cba815f04694ef8e6c58028d6ff7276df71d870",
+    ".claude/agents/bkit-utility-update-failures.md": "9a3e75dff299d2455a21f79018f4f768ae719609ee5538ea8b566420380ba222",
+    ".cursor/agents/bkit-utility-update-failures.md": "1adce4ba38bf00276eeaef735d02f3b09b8c3295489e69924c907a0c05461841",
+    ".claude/agents/bkit-utility-update-knowledge.md": "baf17f9cf8f1ac24a786ea8250761b44f30392e1dc14ad42ff368a3c993deb01",
+    ".cursor/agents/bkit-utility-update-knowledge.md": "376dd86e3ac5abecb77e48dcfa9b45ce2ca8824e2b2391918a37201e2f336e13",
+    ".opencode/agents/bkit-audit-generate.md": "51abbcc3a4f1435886b8c2fe825e5a7cc6f0ad265dad6ccb07e2eb9c6b4b8f2b",
+    ".codex/agents/bkit-audit-generate.toml": "93a7dfb7ce085fa4dce7f211193759068abd7ba294f5bbffe56194e1be337688",
+    "docs/templates/bkit-plan.md": "4bc48336b9786137dd81f22f9a07b3a2b22bcf4b910e140fa059753f10d884a8",
+    ".claude/agents/bkit-audit-generate.md": "a17c76ddcf5afd854bf39cc36f0800f847a61c55fe6efb17c9163e98597c8422",
+    ".cursor/agents/bkit-audit-generate.md": "61a7dfae9dca9d0426adef302707a53066515e88a72dca9200336a14593f9e81",
     "docs/templates/bkit-audit-accessibility.md": "01e2646f5c5d8a914c6597cd8215b20c36e6aa0baf6f9f6db7fadea56b37c51a",
     "docs/templates/bkit-audit-app-performance.md": "907eab138a87095abf45e34cdcf482ae80f100eca015554f47dfb2397f46fea3",
     "docs/templates/bkit-audit-architecture.md": "139c78cee90870cc1fb640e6641f949a1f2f208c3bfad157ee4aabd3df642ee1",
     "docs/templates/bkit-audit-ci-performance.md": "63f269e778a828050a4dd22a2d830255b60cd6419a064b3357c0f94cce454f12",
-    "docs/templates/bkit-audit-database.md": "69e634049f718325da68578174a215a7448d36a3e449e1fc428471e2a5ad57b4",
+    "docs/templates/bkit-audit-database.md": "3b57a7461bbbb94d4c84539b343282a9070a08a681309479eea187bb708e5390",
     "docs/templates/bkit-audit-dead-code.md": "c758ce76266d4280cc0ae6a1eac10ff2c506efe55b453b225e0bb8e7a26a8249",
-    "docs/templates/bkit-audit-documentation.md": "da04b98ad624fdcbffea3af2f7d3473f0767c4be8a29078333b43638997d25df",
+    "docs/templates/bkit-audit-documentation.md": "cd968f46bf448ba5cdd5b119f0766181aa8334b5ef3cf857be63f771fb9379df",
     "docs/templates/bkit-audit-duplication.md": "b00747e00c1aa4b9979f80c41a0e999f3e9866a594eec150bf7bd69216072eb6",
     "docs/templates/bkit-audit-llm.md": "5ef525d099dfd5f8c8c52e5f3005640a3d5da2f76f0db1be94df4c367edf598b",
     "docs/templates/bkit-audit-privacy.md": "b4ad490e4ac38035199cd9769089943c76ce3acda3b1cc45a58b49abcf119a80",
@@ -183,8 +183,8 @@
     "docs/templates/bkit-audit-slop.md": "8abcf18aac8d91d95197e246468ade294b81d55a325dea94ad28f71d1181d6f8",
     "docs/templates/bkit-audit-usability.md": "473bff909923bd873bb30599e3d292c617f4ab5b56b24426bb7c3e73e6df751c",
     "docs/templates/bkit-audit-testing.md": "b36abe72fc2e56d64981e016d5419d76d14387e56d78220a788aae7fb3770f2a",
-    ".opencode/agents/bkit-utility-update-roadmap.md": "d5748c5ae22dd5401af2f3e72b97ac09e017e3a4635e7b4726c0ad92af38f5d2",
-    ".codex/agents/bkit-utility-update-roadmap.toml": "f1e26e2b5508674f0ffa4d0d84e68c389fc0e530b37ab833e201cdb829f005a3",
+    ".opencode/agents/bkit-utility-update-roadmap.md": "8ed1422f62edebd823bba24cf9f25c28c3038cebc321a17c28ecc019fad91e51",
+    ".codex/agents/bkit-utility-update-roadmap.toml": "b44757d2b03f3862635951f3d151ed6dfc2ec92f510721da711773dc62359091",
     "docs/templates/bkit-audit-aio-seo.md": "33dca22475665efd6d93dc44cb72174289d3bef4a8e2236bf8a5ddce5fbfcb0d",
     "docs/templates/bkit-audit-analytics.md": "7b665742713217ee8148ce12416e091ecabf70a59b2fe8208eebcfdc02060555",
     "docs/templates/bkit-audit-annotations.md": "ac33f7584c4087a5bc2e7c83b79f0b60195277ce6349b256bd3d2cdc38683311",
@@ -201,20 +201,20 @@
     "docs/templates/bkit-audit-logs.md": "36b1e7c3ee44346f71d3a14c19645c1c84c9a842e797d02c0857204e0a8a7c46",
     "docs/templates/bkit-audit-models.md": "61bac45e1ef8c433d59aee178b349be314fbfa5e021b2e3e87dff98fc5bf535c",
     "docs/templates/bkit-audit-reliability.md": "8b49b460b5655a5973a006fdb62940605e618a1f743148eaae49ed01e2a495fc",
-    ".claude/agents/bkit-utility-update-roadmap.md": "be3e5a857ac14c6d24ffdf44e95c5c39e6232024ba1b286e7c0218734c394354",
-    ".cursor/agents/bkit-utility-update-roadmap.md": "55509636caed7293659d97f6939af8bb4e36a35bd4c82b9f79e7613f887ffccc",
+    ".claude/agents/bkit-utility-update-roadmap.md": "b1bf33f94eaa198e0fd62fdca23a4e652746d9beb8350a4dbd1a4b7541cf70f4",
+    ".cursor/agents/bkit-utility-update-roadmap.md": "d71b5fb0d3b1224e22c6de4944021d8571fdd8c003f1d6c2be9dd77334b13b10",
     "docs/templates/bkit-audit-agents.md": "19cbbfd8479e5279bfb8ff1dae9beb5c6a790d68f95bb512318e38ce2da391f4",
     "docs/templates/bkit-audit-prompts.md": "74f1b59249dc4278506a0b6c9d21f8cef6fa8cb403ea8fbc558995357fc360da",
     ".bkit/templates.md": "45bb276aa1fc4a7a691718e9c3fd57baadd230647fc37c9097f1f46ec013cb38",
-    "docs/templates/bkit-audit-adoption.md": "e7989349039bc903c704ad4613f45cddda9807f33a75acd3f466fbe8cd8b4145",
+    "docs/templates/bkit-audit-adoption.md": "3b4233b174e998446818b0a1000932d141663f25488ca61b810b6eb5a5d82aa1",
     ".bkit/cloud.md": "4b3fbcae7dcfdf991aa78774f4c487d3aff343b90fc27bbdf3f4aa492320dd4c",
     ".bkit/comparison.md": "48845a4c08abe236dcb5af4947db755a10aad06996a87c5d5b1bed07528514de",
     ".bkit/install.md": "42dc98ac1962ce9acd03d5c0777e88f3b7afe9b600a53398ee4b26673d7d1e86",
     ".bkit/jsonl.md": "1c0d5597648167929c2098fa0176ac2daa5eaca7b198bd040f2fa79b1b5b40ab",
     ".bkit/providers.md": "e87503c7cc4d045997c30ea315f76438589abc9bcf038f63ce291ca85b8f1e1f",
-    ".bkit/prompts.md": "49cd332bab1495fb6f6c93d7685c4c8cfddd27820641af3c9483ab0806af5243",
+    ".bkit/prompts.md": "1042b43fc528b1720e8a3a96b319b65a9bf7585735d6a333926dc9556847fac1",
     ".bkit/trackers.md": "c3b91b7ffcf75333bc2d09af7c9d887397850539b87b964441025e8978f41803",
-    ".bkit/workflows.md": "f9567378ea9017d54cff7191d6f960715b97a38620f56ac2c2dabebdee05e9f6",
+    ".bkit/workflows.md": "fb542d42e9bc58c88ed66875083b0ffe45b328877df25e6b77904aec2e1b1729",
     ".bkit/README.md": "7e46439319d2c1befb9ee4f1ff7fb2d4ffdf442bc7bc0f45217704b1cc4dceb5",
     ".cursor/rules/bkit-rules.mdc": "0c15e475a322bd66f4f2258b5ffc2a6700bb9c9d217a75fa18d8168c9e1106e8",
     ".claude/hooks/bkit-gateguard.cjs": "b2d0fc8c1a5df9c2e2bc365127d2043acc886658cd710c563827ae10c132c60f",
@@ -233,36 +233,36 @@
     ".opencode/plugin/bkit-readguard.js": "cd784ceb8d319e95a562401df6f6d9ed862ba1b7769ab08be8c4e7c29d6b656f",
     ".codex/hooks/bkit-readguard.cjs": "140ae68164c31e349c9122d2b86bc88ddd58461b6de8f5d4bdbced6965dce5f1",
     ".bkit/pipeline.md": "85977f1698328d4a081ed19303386ae29ecaff0dfdd52ccdc731393418d16c35",
-    ".claude/agents/bkit-debug-failure-reproduce.md": "d78e15482ef7a777866405c3550afe1c3f6ff067254c1d64cd9b433c1bc23707",
-    ".cursor/agents/bkit-debug-failure-reproduce.md": "38e749b2c5197f455c0a7563869c26c2de5b3fd668ed2303731c85a901884be4",
-    ".opencode/agents/bkit-debug-failure-reproduce.md": "779370ae5055ef3a5823c52c63d3430cf4c0e52212f0777c3344ce209bc52279",
-    ".codex/agents/bkit-debug-failure-reproduce.toml": "55c7c2af090b323f2a5f77c0ec5d1f20f74f26b73591407b279c768a45571cec",
+    ".claude/agents/bkit-debug-failure-reproduce.md": "58319110e9aaa7e71a7d8fd91f4b7f8206a7a723048e34c1fb28370ac8e7cb09",
+    ".cursor/agents/bkit-debug-failure-reproduce.md": "780c186e55eba327ab987fa0b80bd70e875e1d11469744c98f49903f1c635a81",
+    ".opencode/agents/bkit-debug-failure-reproduce.md": "6cd39f10bf5d7cfb27a30ff091f8f12ca142f27382007fe3e7d074f308d8daf6",
+    ".codex/agents/bkit-debug-failure-reproduce.toml": "3fd9ec2c8031a0ea6b270d9062a46c70047ce15d302a52c85c0f6f2c572ffe69",
     ".bkit/allowlist.json": "47f68886cd8488cd0ff0b77ac7bd985b9e33bc0484db2c4cbfca3b84c694fbce",
-    ".claude/agents/bkit-utility-update-tracker.md": "ef77530a85f2373186c8276c52c5f5aad471e16f4059bec6f84e18c384807c68",
-    ".cursor/agents/bkit-utility-update-tracker.md": "1b3aa1a1351ed165d2e326f96fe2dd8848dcb83a263311c8856fe39128917d33",
-    ".opencode/agents/bkit-utility-update-tracker.md": "0813b54c8b5bcda65b98f3baf79f8882a53a5594543eb090b2bd5b509e3e4ff7",
-    ".codex/agents/bkit-utility-update-tracker.toml": "9848daecb2e87f4502f3196dcf104563fd1b5fa1176de0f21dd4252312fc346a",
-    ".claude/agents/bkit-plan-scope-check.md": "4c1312025295229e5951a888dc33e1e4326f9534a486632cca603df5796025ad",
-    ".cursor/agents/bkit-plan-scope-check.md": "bbe10f0434c93910a97e2c966fe69d7332a294019b0258bbe4d8a42ff1c4d677",
-    ".opencode/agents/bkit-plan-scope-check.md": "1173e9d0174efeef4796d5fde9e91d0e242fd9c03a45a6cfe54787a9342f2811",
-    ".codex/agents/bkit-plan-scope-check.toml": "70525017fc361af5ff3455d14d77d10fb28e70a6b8494138855fbea67dbcd66d",
-    ".claude/agents/bkit-build-plan-convert.md": "7f428a1f44452fe8f57f6da9a53e92326e242f8e115d92b3ef9646c83c3933f2",
-    ".cursor/agents/bkit-build-plan-convert.md": "a47376dbae247dd40540c54a7a7e7b97033b255ce43d064fec4436b85daa3862",
-    ".opencode/agents/bkit-build-plan-convert.md": "74d4defed8d6fb3e5be14daf946f8f60777dcc93f507ac39d1b300a19a1003a1",
-    ".codex/agents/bkit-build-plan-convert.toml": "ee620367a97eb62208507d1b60a01de285aafe23c0daec86559ab6dba0e43ca3",
+    ".claude/agents/bkit-utility-update-tracker.md": "cdd834e0aa621a6b8c126084ff8d7fe9cfe6e0314dd975bfc0b0755a6054faf7",
+    ".cursor/agents/bkit-utility-update-tracker.md": "f1905b215eeb2c9df487fd737da6ca241e70d5499e07ed32d51c65e5c3c3adb9",
+    ".opencode/agents/bkit-utility-update-tracker.md": "4730b2373fe7ff540303828171b9b073a3aeb8ca340b69652e1fc22fb164f596",
+    ".codex/agents/bkit-utility-update-tracker.toml": "98c6127fb89b211b96f911e19ca464899e69b64b8b69897093d7a5c95993304f",
+    ".claude/agents/bkit-plan-scope-check.md": "cc35bf0568b144824658ca9022890a27fb4cb4a687efba995dd2978f7c335ee8",
+    ".cursor/agents/bkit-plan-scope-check.md": "7417d6b749e67ad17be81ecb8721705b544d01e6230cd01c8ac0e5ebf6d68acc",
+    ".opencode/agents/bkit-plan-scope-check.md": "edc241111edf7fceb2209bc02d06ffd9f43b3ab3bb157fb4384bcf532d29c1f0",
+    ".codex/agents/bkit-plan-scope-check.toml": "20e54d8ceac560887fff01579df7bc50471058734c4f5f3db03cde1763213eac",
+    ".claude/agents/bkit-build-plan-convert.md": "34105ec86af311b185b37390dc6ee14423707578a1da83562addbb5d55785241",
+    ".cursor/agents/bkit-build-plan-convert.md": "1d64267ea8e954dcb423b72f6d40922d2ca17b23d78031bd591d0a964b95dd6e",
+    ".opencode/agents/bkit-build-plan-convert.md": "0a89d28647a75b9838285313c8abe6cc50f46803af2f28507b13645e4f299003",
+    ".codex/agents/bkit-build-plan-convert.toml": "287ed06a51088a5092c24baa0607c70062243a4bbee97bb9d15da18576a3be8a",
     ".bkit/authoring.md": "de9369894e80de63673091f86d233cc70bb3f9232d136f2affd7cb2bf361bd85",
     ".codex/hooks/bkit-rules.cjs": "8aee2cde5448c083ae0dc07a4f1db86ce7e815a2a2eafe54b886b7f4393cab91",
     ".opencode/plugin/bkit-rules.js": "417d3ca107ebf005060953a17340620e1fcfb5bcdf491316a937e0c747b0377e",
     ".bkit/router.md": "c20d006757e350c173da94686d48500bc83e12d9f7bb6ff5911e47e332e45eab",
     ".bkit/cli.md": "00be8c3d28b5323276abc3d86b1de3a39f1475a71d04f54e062218ebc129e051",
-    ".claude/agents/bkit-build-plan-tests.md": "684dc705f2bd370bfdfea7e2d5ccc685571c94d4f14ea91e95d1021a8c26949d",
-    ".cursor/agents/bkit-build-plan-tests.md": "cd1d2f0ce0602f744de4438f448a078e6838c87609e77d6a62fe2c73dad388e6",
-    ".opencode/agents/bkit-build-plan-tests.md": "aa72d5668bcd54106b2d889a51c59dfa6136c9348087553234632a0270415ae0",
-    ".codex/agents/bkit-build-plan-tests.toml": "20cbc01a93cff822de9ff3dbd474019d11c8cd08b655ce9161c7f769cd1a0cdf",
-    ".claude/agents/bkit-build-plan-tasks.md": "190bc2fb6b2448f99a02a75259a92e672ab8fa497b60ae77adf42e3e78259875",
-    ".cursor/agents/bkit-build-plan-tasks.md": "4de61673e682fe5eb04b671bc0db9a05b1cce094992f0ac49c7d6f3259901952",
-    ".opencode/agents/bkit-build-plan-tasks.md": "a3159e27b0fd748a298c6b4d7b1e598baca08430127d74e8adad1341f5613348",
-    ".codex/agents/bkit-build-plan-tasks.toml": "ddbd238de5f83132999bdb57be7a239d683acee5690fdf3fd3f70273edd6fc0a"
+    ".claude/agents/bkit-build-plan-tests.md": "be39bd5adc8be2ae16f0505ae26d91a6fe958ae7f14b51014c30ca8ba03dc076",
+    ".cursor/agents/bkit-build-plan-tests.md": "5e48a01125f56c590dbd8e4726248a55bbb32604cf642bd318ae10dbf0953171",
+    ".opencode/agents/bkit-build-plan-tests.md": "380195671bad5f056b3e5391c9b8505007584f4e341d8dbe93f3fe6114c7d755",
+    ".codex/agents/bkit-build-plan-tests.toml": "074c63e85eef16049ef2475b23e9011a9a6a95106484920d50add62e2bede8e2",
+    ".claude/agents/bkit-build-plan-tasks.md": "185507eb02e99d9b9c820c1208158977e536e606035b529d8b8d3cb64e6686cf",
+    ".cursor/agents/bkit-build-plan-tasks.md": "0a956f5b2e4f379505366e2f5cdd5d98f8bc88ff8a5b2d9ca9ce2eff9a7ab713",
+    ".opencode/agents/bkit-build-plan-tasks.md": "08df3c456205b34449050ced08160ddf9f58c33e5fe1f03975147e237504b15f",
+    ".codex/agents/bkit-build-plan-tasks.toml": "a6ec390ecfd53719df6d4fa07285856da987a80ef0983da02e02792af6ff25db"
   },
   "claudeAllowDerived": [
     "WebFetch(domain:12factor.net)",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index d91fa8ebd..2c4c9bdf6 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -1160,6 +1160,44 @@ It writes only the report and the template's consumer-owned `Project Instruction
 
 **CI-class skip conditions:** one tracker no-op line, then exit 0. Only real failures (missing args, tracker unreachable, malformed state) → Failure Path. Loop bound: `/bkit-debug` enforces `debug.fix` and `debug.soak` `maxAttempts` across every debug run of the feature; cloud counts only `dev` dispatches.
 
+## Documentation Consultation Coverage
+
+Every rule group, workflow step and plan-template section was reviewed for the project documents it should consult. A project document path is a recommendation: read the `.agents/docs.md` index, use the recommended path or an indexed equivalent (`Equivalent to docs/{topic}.md` in the Scope cell), and **if** the index or a document is missing, empty or still the starter, warn and continue from repository evidence. Outcomes: `added` (a named reference or section was added), `retained` (the source already cited it), `corrected` (an inappropriate or silent-skip reference was fixed) and `not-applicable` (no project document applies, with the reason). Each producing prompt writes gaps as `jsonl` records under `## Documentation Warnings`, and `bkit workflows summary` lists the current run's records once per topic and gap without changing the verdict. `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` checks that every source has a record.
+
+<!-- prettier-ignore -->
+| Source | Recommended documents | Outcome | Applicability and reason |
+| --- | --- | --- | --- |
+| `.bkit/core/.agents/rules.md` § New files | `docs/architecture.md` | retained | Places new files per the architecture document when present; a missing or starter-only document warns and the nearest structure applies. |
+| `.bkit/core/.agents/rules.md` § UI design | `docs/design.md` | retained | Applies when the change touches UI; warns and follows existing UI conventions when the document is missing. |
+| `.bkit/core/.agents/rules.md` § Explicit logging | `docs/observability.md` | retained | Applies to logging changes; warns and follows existing logging conventions when the document is missing. |
+| `.bkit/core/.agents/rules.md` § CI and deployments | `docs/deployments.md` | retained | Pushes, tags and CI behaviour point at the deployments document; the managed guides carry the bkit mechanics. |
+| `.bkit/core/.agents/rules.md` § Server-side validation, security and schema | `docs/security.md`, `docs/data-schema.md` | retained | Boundary notes name the security and schema documents; applicability follows the changed surface. |
+| `.bkit/core/.agents/rules.md` § Testing | `docs/testing.md` | retained | Tier rules and file inventory point at the testing document; `Tests discriminate` and `Test-first` stay in force without it. |
+| `.bkit/core/.agents/rules.md` § all other rules | n/a | not-applicable | Ledger, git, tracker, authoring and tool rules govern bkit operations and have no project-document topic. |
+| `.bkit/core/docs/templates/bkit-plan.md` § Pre-Flight / Dependencies | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md`, `docs/deployments.md`, `docs/design.md`, `docs/observability.md`, `docs/data-schema.md` | added | Core and Conditional items name each document, with the warn-and-continue rule. |
+| `.bkit/core/docs/templates/bkit-plan.md` § Documentation Consultation | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md`, `docs/data-schema.md`, `docs/design.md`, `docs/observability.md`, `docs/deployments.md` | added | New section records topic, applicability, source used, coverage, gap and action for every plan. |
+| `.bkit/core/docs/templates/bkit-plan.md` § Documentation Warnings | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | New section holds the structured warning records that the workflow summary aggregates. |
+| `.bkit/core/docs/templates/bkit-plan.md` § Data Schema Integration | `docs/data-schema.md` | retained | Reads and writes of the schema document stay explicit; absent schema documents warn through the consultation table. |
+| `.bkit/core/docs/templates/bkit-plan.md` § Documentation Updates | `docs/architecture.md`, `docs/technology.md`, `docs/data-schema.md`, `docs/design.md`, `docs/testing.md`, `docs/observability.md` | retained | Lists the documents a change touches; the runbook carries each as an UPDATE line. |
+| `.bkit/core/docs/templates/bkit-plan.md` § Agent Execution Runbook | `docs/architecture.md`, `docs/testing.md` | added | Tasks that touch an assessed topic carry READ and UPDATE lines for its document. |
+| `.bkit/core/docs/templates/bkit-plan.md` § Verification Plan | `docs/testing.md`, `docs/observability.md` | retained | Gate items verify tests and logging against the named documents. |
+| `.bkit/core/docs/templates/bkit-plan.md` § all other sections | n/a | not-applicable | Context, scenario, matrix, scope and rollback sections describe the change itself and cite no project document. |
+| `.bkit/core/workflows/bkit-design.md` § Step 3 Grill and Step 5 Generate Design | `docs/architecture.md`, `docs/technology.md`, `docs/security.md` | added | A design needs no plan: the generator reads the index, consults the documents and records warnings. |
+| `.bkit/core/workflows/bkit-design.md` § Step 10 Summary | `docs/architecture.md` | added | The summary carries Documentation Warnings from the run unchanged. |
+| `.bkit/core/workflows/bkit-design.md` § all other steps | n/a | not-applicable | Worktree, review, spike, organise and close steps handle files and verdicts, not project facts. |
+| `.bkit/core/workflows/bkit-plan.md` § Step 3 Generate Plan | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Plan generation fills Documentation Consultation and Documentation Warnings. |
+| `.bkit/core/workflows/bkit-plan.md` § Step 7 Summary | `docs/testing.md` | added | Summary shows attributed warnings once per topic and gap, advisory only. |
+| `.bkit/core/workflows/bkit-plan.md` § all other steps | n/a | not-applicable | Start, fetch, review, apply and close steps move artifacts; reviewers consult through their prompts. |
+| `.bkit/core/workflows/bkit-build.md` § Step 4 Plan Convert | `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/testing.md` | added | Issue-to-plan conversion carries the same consultation contract as generation. |
+| `.bkit/core/workflows/bkit-build.md` § Step 15 Summary | `docs/testing.md` | added | Summary carries warnings from the applicable tasks without changing the verdict. |
+| `.bkit/core/workflows/bkit-build.md` § all other steps | n/a | not-applicable | Group loop, tests, diagnosis and PR steps follow the plan; task prompts consult their documents. |
+| `.bkit/core/workflows/bkit-debug.md` § Step 5 Failure Reproduce | `docs/testing.md`, `docs/noise.md` | added | A debug run has no plan: subagents consult the testing and noise documents and warn when missing. |
+| `.bkit/core/workflows/bkit-debug.md` § Step 10 Summary | `docs/testing.md` | added | Summary and handover keep unresolved warnings. |
+| `.bkit/core/workflows/bkit-debug.md` § all other steps | n/a | not-applicable | Run-tests, context, push and close steps are mechanical and read no project document. |
+| `.bkit/core/workflows/bkit-ship.md` § Step 6 Update Docs and Summary | `docs/architecture.md`, `docs/deployments.md`, `docs/testing.md` | added | Documentation maintenance findings stay in the ship summary next to the edits. |
+| `.bkit/core/workflows/bkit-ship.md` § all other steps | n/a | not-applicable | Verify, integrate, merge and update steps handle git and CI state, not project facts. |
+| `.bkit/core/workflows/bkit-auto.md` § Step 2 Dispatch | n/a | not-applicable | Dispatch only routes to a phase; it forwards the phase summary and its warnings unchanged. |
+
 ## Test and release mechanics
 
 These mechanics belong to bkit, so they live in this managed guide and do not depend on the project adopting `docs/testing.md` or `docs/deployments.md`. The project's own choices (its tiers, lanes, rollback and deploy decisions) go in those documents, copied from `.bkit/templates/docs/`. Test-first, `bkit:test:file`, `bkit:lint:file` and the JUnit failure count are described in § Local gate scripts and § Test-first above, and the wrapper script is in `.bkit/templates.md` § Local test sleep prevention.
diff --git a/.claude/agents/bkit-audit-generate.md b/.claude/agents/bkit-audit-generate.md
index 3f05b2465..d01cd7bb0 100644
--- a/.claude/agents/bkit-audit-generate.md
+++ b/.claude/agents/bkit-audit-generate.md
@@ -115,7 +115,20 @@ autoCompactWindow: 300000
      - **If** it exits non-zero → **STOP** and report the reason.
      - NEVER hand-write or edit the `bkit:anchor` block or the `bkit:outdated` line the stamp writes under it.
 3. Read every supplied input once at the start, and work from what it says, not from session memory. Do not re-read the template on every loop iteration.
-4. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+4. Read the `.agents/docs.md` index, and load the project documents the audit's surface needs, with or without a plan: `docs/architecture.md` for structure and boundaries, `docs/technology.md` for stack choices, `docs/security.md` for trust boundaries, `docs/testing.md` for test and gate rules, plus `docs/data-schema.md`, `docs/design.md`, `docs/observability.md`, `docs/deployments.md`, `docs/noise.md` or `docs/setup.md` when the audit's surface touches them.
+   - Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Mark an irrelevant topic not applicable, with the reason.
+   - Safeguards that need genuine evidence stay in force (secrets, permissions, untrusted input).
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "testing",
+       "gap": "missing",
+       "recommendedPath": "docs/testing.md",
+       "alternativeEvidence": "The CI workflow defines the lanes.",
+       "action": "Copy the testing starter and describe the project's tiers and lanes."
+     }
+     ```
 5. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
    - **If** a section has no content → `None`.
 6. Populate the template sections in template order, without changing the order. Take each section's shape from the template and every rule from this prompt, and verify every gate before you proceed:
diff --git a/.claude/agents/bkit-build-challenge-1.md b/.claude/agents/bkit-build-challenge-1.md
index 42d08a478..24ec32f7d 100644
--- a/.claude/agents/bkit-build-challenge-1.md
+++ b/.claude/agents/bkit-build-challenge-1.md
@@ -56,7 +56,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/security.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each finding: append the entry at EOF with Bash `echo {log entry} >> {output}`.
    - **If** the entry spans several lines → append it with a heredoc instead.
    - **If** any finding is `CRITICAL` → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
diff --git a/.claude/agents/bkit-build-challenge-2.md b/.claude/agents/bkit-build-challenge-2.md
index 25ddeed3e..fc8477687 100644
--- a/.claude/agents/bkit-build-challenge-2.md
+++ b/.claude/agents/bkit-build-challenge-2.md
@@ -60,7 +60,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/security.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/security.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each finding: append the entry at EOF with Bash `echo {log entry} >> {output}`.
    - **If** the entry spans several lines → append it with a heredoc instead.
    - **If** any finding is `CRITICAL` → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
diff --git a/.claude/agents/bkit-build-install-skills.md b/.claude/agents/bkit-build-install-skills.md
index 025205166..b1bd5bb47 100644
--- a/.claude/agents/bkit-build-install-skills.md
+++ b/.claude/agents/bkit-build-install-skills.md
@@ -50,7 +50,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Identify the technologies that the feature requires.
 4. List the folder names under `.agents/skills/`, without reading the folders' contents. Each folder name is the identity of one installed skill when you look for gaps.
 5. Identify each skill gap: a required technology that no folder name matches.
diff --git a/.claude/agents/bkit-build-plan-convert.md b/.claude/agents/bkit-build-plan-convert.md
index c1453b4e3..ee319aa4e 100644
--- a/.claude/agents/bkit-build-plan-convert.md
+++ b/.claude/agents/bkit-build-plan-convert.md
@@ -63,10 +63,24 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
+   - Read the `.agents/docs.md` index, and consult the project documents the converted tasks need: always assess `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md`; add `docs/data-schema.md` when a task changes the database, `docs/design.md` for UI work, `docs/observability.md` for logging, `docs/deployments.md` for release or CI work, and `docs/noise.md` or `docs/setup.md` when a task touches them.
+     - Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+     - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Mark an irrelevant topic not applicable, with the reason.
+     - Record each topic, the path and section used, coverage, gap and action in the plan's `Documentation Consultation`, and put each `READ` / `UPDATE` line for these documents in the task that needs it.
+     - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+       ```jsonl
+       {
+         "topic": "security",
+         "gap": "starter-only",
+         "recommendedPath": "docs/security.md",
+         "alternativeEvidence": "The CI configuration defines token permissions.",
+         "action": "Populate the security document with the project's credential and permission boundaries."
+       }
+       ```
 2. Read `docs/templates/bkit-plan.md` § `Agent Execution Runbook` for the shape of a group and of a task block. The rules for filling them are the **Runbook tasks**, **TEST FIRST** and **TEST EXCEPTION** clauses above.
 3. Set up the plan file:
-   - **If** the plan file exists → keep every section except `Agent Execution Runbook` as written, and rewrite the runbook.
-   - **Else** → create the plan with `# {title} Implementation Plan`, `## Context & Goals` (the goal in 1-3 lines), `## Reuse Inventory` and `## Agent Execution Runbook`.
+   - **If** the plan file exists → keep every section except `Agent Execution Runbook` as written (add or refresh `Documentation Consultation` and `Documentation Warnings` from step 1), and rewrite the runbook.
+   - **Else** → create the plan with `# {title} Implementation Plan`, `## Context & Goals` (the goal in 1-3 lines), `## Documentation Consultation`, `## Documentation Warnings`, `## Reuse Inventory` and `## Agent Execution Runbook`.
    - In both cases, carry over every end state and test that the inputs name, in their order. You may tighten them, but never weaken them.
 4. Split the work into tasks, each one a testable change, and group the tasks in build order:
    - Keep each group within the per-group plan caps that your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all).
diff --git a/.claude/agents/bkit-build-plan-current.md b/.claude/agents/bkit-build-plan-current.md
index 6018b5e3c..b5ca3af44 100644
--- a/.claude/agents/bkit-build-plan-current.md
+++ b/.claude/agents/bkit-build-plan-current.md
@@ -55,7 +55,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each affected task: append the entry at EOF with Bash `echo {log entry} >> {output}`.
    - **If** the entry spans several lines → append it with a heredoc instead.
    - **If** any task `Broken` → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
diff --git a/.claude/agents/bkit-build-plan-gaps-remediate.md b/.claude/agents/bkit-build-plan-gaps-remediate.md
index cbe994d7f..67a73ce34 100644
--- a/.claude/agents/bkit-build-plan-gaps-remediate.md
+++ b/.claude/agents/bkit-build-plan-gaps-remediate.md
@@ -81,7 +81,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/testing.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Read the inputs, and find where to resume:
    - **If** Context `Mode` = `Holistic` → read the holistic verify report and every log. Each line of its `Identified Gaps Log` is one gap. Read the plan's task block of each task a gap names; no group gate log is supplied.
    - **Else** → read the group's briefs (their task blocks), the plan gaps, the group gate log when one is supplied, and every log. Each failure in the group gate log is one gap. In the logs, `DONE` = done and `BLOCKED` = blocked.
diff --git a/.claude/agents/bkit-build-plan-tasks.md b/.claude/agents/bkit-build-plan-tasks.md
index 35f4e8e6c..42f9fa987 100644
--- a/.claude/agents/bkit-build-plan-tasks.md
+++ b/.claude/agents/bkit-build-plan-tasks.md
@@ -89,7 +89,7 @@ autoCompactWindow: 300000
    - **If** **Create** already exists → set its `Verdict` to `PENDING` with `Edit`, and keep every log line.
    - **Else** → Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Read the supplied brief (`build-brief-{GROUP}-{n}.md`):
    - Its task blocks are the work, in order.
    - Its earlier tasks are context only.
diff --git a/.claude/agents/bkit-build-plan-tests.md b/.claude/agents/bkit-build-plan-tests.md
index 29811394b..b8668ab1e 100644
--- a/.claude/agents/bkit-build-plan-tests.md
+++ b/.claude/agents/bkit-build-plan-tests.md
@@ -68,7 +68,7 @@ autoCompactWindow: 300000
    - **If** **Create** already exists → set its `Verdict` to `PENDING` with `Edit`, and keep every log line.
    - **Else** → Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Read the supplied brief (`build-brief-tests-{GROUP}-{n}.md`):
    - Its task blocks' `TEST FIRST` entries are the work, in order; the rest of each block says what the test is for.
    - Its `Derived Test Matrix rows` say what each test asserts.
diff --git a/.claude/agents/bkit-build-plan-verify.md b/.claude/agents/bkit-build-plan-verify.md
index cb7e10ba7..4fd4a529c 100644
--- a/.claude/agents/bkit-build-plan-verify.md
+++ b/.claude/agents/bkit-build-plan-verify.md
@@ -61,7 +61,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
    - For each gap, append the entry at EOF with Bash `echo {log entry} >> {output}`.
      - **If** the entry spans several lines → append it with a heredoc instead.
diff --git a/.claude/agents/bkit-debug-abort-handover.md b/.claude/agents/bkit-debug-abort-handover.md
index 3cdac7e9c..59c83c2fe 100644
--- a/.claude/agents/bkit-debug-abort-handover.md
+++ b/.claude/agents/bkit-debug-abort-handover.md
@@ -53,12 +53,13 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Extract `Rot Signals` from the diagnose attempts, and aggregate them into the handover: dedupe the slugs, and keep all the evidence.
 6. Extract `Out-of-Scope Recommendations` from the diagnose attempts, and aggregate them: dedupe the paths, and keep all the rationales.
-7. Append one row per failure to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
-8. Append one row per deferral to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
+7. Collect the `## Documentation Warnings` records from the diagnose, remediate and verify logs of the run, and copy them verbatim into the handover's `Documentation Warnings` section, dropping exact duplicates. Take no records from raw `*-input-*.md` files.
+8. Append one row per failure to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
+9. Append one row per deferral to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
 
 **Output format:**
 
@@ -101,6 +102,10 @@ autoCompactWindow: 300000
 
 [Which option to take, and why. Initially set to `PENDING`.]
 
+## Documentation Warnings
+
+[The deduped records of the run's `## Documentation Warnings` sections, verbatim, in one `jsonl` fence with one JSON object per record. **If** none → `None`. Initially set to `PENDING`.]
+
 ## Reference Docs
 
 [The prior diagnoses, prior remediations, CI runs and observability evidence. Initially set to `PENDING`.]
diff --git a/.claude/agents/bkit-debug-failure-diagnose.md b/.claude/agents/bkit-debug-failure-diagnose.md
index 94c36675d..4e83f15dd 100644
--- a/.claude/agents/bkit-debug-failure-diagnose.md
+++ b/.claude/agents/bkit-debug-failure-diagnose.md
@@ -63,7 +63,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory. The CI and runtime logs are the primary signal.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` and `docs/noise.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Read `Strategy` from the input Context. **If** it is missing → set `Verdict` = `FAIL` in **Create**, change no other file, and go straight to the final return. Apply the matching strategy:
    - `STANDARD` → run a targeted diagnosis.
diff --git a/.claude/agents/bkit-debug-failure-remediate.md b/.claude/agents/bkit-debug-failure-remediate.md
index b22e8504a..bd0918dba 100644
--- a/.claude/agents/bkit-debug-failure-remediate.md
+++ b/.claude/agents/bkit-debug-failure-remediate.md
@@ -60,7 +60,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each remediation: append `DONE|BLOCKED` at EOF with Bash `echo {log entry} >> {output}`.
 5. Read `Strategy` from the input Context. **If** it is missing → set `Verdict` = `FAIL` in **Create**, change no other file, and go straight to the final return. Apply the matching strategy:
    - `STANDARD` → apply the diagnosis as written.
diff --git a/.claude/agents/bkit-debug-failure-reproduce.md b/.claude/agents/bkit-debug-failure-reproduce.md
index b39e98a80..574067644 100644
--- a/.claude/agents/bkit-debug-failure-reproduce.md
+++ b/.claude/agents/bkit-debug-failure-reproduce.md
@@ -55,7 +55,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory. The bug report in `debug-input-*.md` is the primary signal.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Choose where the tests go:
    - Pick the lowest tier that reaches the reported behaviours: unit before integration before e2e.
    - Co-locate them with the tests that cover the affected areas, and match those tests' imports, helpers and naming.
diff --git a/.claude/agents/bkit-debug-failure-soak.md b/.claude/agents/bkit-debug-failure-soak.md
index cff734e31..0e067d6ff 100644
--- a/.claude/agents/bkit-debug-failure-soak.md
+++ b/.claude/agents/bkit-debug-failure-soak.md
@@ -64,7 +64,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Decide the single next step from the accumulated context:
    - **If** the cause is unknown → instrument the suspected surface: add `[DEBUG-OBSERVE]` logging, with no behaviour change.
    - **Else**:
diff --git a/.claude/agents/bkit-design-brainstorm-ideate-1.md b/.claude/agents/bkit-design-brainstorm-ideate-1.md
index fa4c56255..1cc19d8d3 100644
--- a/.claude/agents/bkit-design-brainstorm-ideate-1.md
+++ b/.claude/agents/bkit-design-brainstorm-ideate-1.md
@@ -48,7 +48,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/technology.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Propose 2-3 approaches from the current constraints: existing code, minimal new infrastructure and the fastest path to ship.
    - Lead with the recommended approach.
    - Keep each approach in the existing stack, with no greenfield build and no hypothetical infrastructure.
diff --git a/.claude/agents/bkit-design-brainstorm-ideate-2.md b/.claude/agents/bkit-design-brainstorm-ideate-2.md
index e16651b1a..1dd07359b 100644
--- a/.claude/agents/bkit-design-brainstorm-ideate-2.md
+++ b/.claude/agents/bkit-design-brainstorm-ideate-2.md
@@ -46,7 +46,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/technology.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Propose 2-3 approaches from first principles: the best long-term shape if the existing constraints did not matter.
    - Lead with the recommended approach.
    - Ignore "we already have X" as a default.
diff --git a/.claude/agents/bkit-design-brainstorm-ideate-3.md b/.claude/agents/bkit-design-brainstorm-ideate-3.md
index 347f91934..1fc155099 100644
--- a/.claude/agents/bkit-design-brainstorm-ideate-3.md
+++ b/.claude/agents/bkit-design-brainstorm-ideate-3.md
@@ -47,7 +47,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/security.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Propose 2-3 approaches framed by failure mode, not by happy-path shape.
    - Lead with the recommended approach.
    - For each approach, include additive risk-mitigation guidance to layer onto whichever approach is picked, not separate "safer" approaches.
diff --git a/.claude/agents/bkit-design-generate.md b/.claude/agents/bkit-design-generate.md
index ea8091f6f..b387ad0c2 100644
--- a/.claude/agents/bkit-design-generate.md
+++ b/.claude/agents/bkit-design-generate.md
@@ -60,7 +60,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Do not `cp` an existing input.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md`, `docs/technology.md` and `docs/security.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Identify the themes, complementary ideas, conflicts and related issues.
    - Layer the risk-premortem mitigations onto the selected approach. They are additive, not a separate approach.
diff --git a/.claude/agents/bkit-design-organise.md b/.claude/agents/bkit-design-organise.md
index 02bf5025d..3ef53fe8d 100644
--- a/.claude/agents/bkit-design-organise.md
+++ b/.claude/agents/bkit-design-organise.md
@@ -57,7 +57,7 @@ autoCompactWindow: 300000
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" steps stub --from="<Read>" --to="<Create>" --strip-header
    ```
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Identify the decomposition boundaries: domain boundaries, organisational structure and chronological dependencies. Do not use token or context-window size as a factor.
 5. Group the design work into workstreams at the identified boundaries.
 6. For each workstream:
diff --git a/.claude/agents/bkit-design-review-1.md b/.claude/agents/bkit-design-review-1.md
index 918fa1723..02495ba75 100644
--- a/.claude/agents/bkit-design-review-1.md
+++ b/.claude/agents/bkit-design-review-1.md
@@ -61,7 +61,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/technology.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. For each major capability the design requires, search for prior art:
    - Search the repo: text search for names, strings, near-miss helpers and sibling modules, symbol references through the language server when one is configured, and `docs/capabilities.md` when present.
diff --git a/.claude/agents/bkit-design-review-2.md b/.claude/agents/bkit-design-review-2.md
index 24afcc76e..e39537463 100644
--- a/.claude/agents/bkit-design-review-2.md
+++ b/.claude/agents/bkit-design-review-2.md
@@ -60,7 +60,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/observability.md` and `docs/deployments.md` when they are present (warn and continue if either is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/observability.md` and `docs/deployments.md` when they are present (warn and continue if either is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. For each major component or flow, enumerate its failure modes:
    - What fails: an upstream dependency, internal logic, resource exhaustion, data corruption or partial state.
diff --git a/.claude/agents/bkit-design-spike.md b/.claude/agents/bkit-design-spike.md
index 6d8082fac..00d84f41a 100644
--- a/.claude/agents/bkit-design-spike.md
+++ b/.claude/agents/bkit-design-spike.md
@@ -65,7 +65,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Restate each unknown in the review's `PoC Approach` and `Unknowns & Blockers` as one claim the design depends on and a probe could disprove:
    - Order the claims by blast radius.
diff --git a/.claude/agents/bkit-design-update.md b/.claude/agents/bkit-design-update.md
index 9f6bf82b3..5f5766d99 100644
--- a/.claude/agents/bkit-design-update.md
+++ b/.claude/agents/bkit-design-update.md
@@ -60,7 +60,7 @@ autoCompactWindow: 300000
    ```
    **If** the caller names **Update** and no **Create** → skip the seed: set the `Verdict` of **Update** to `PENDING`, and apply the findings to **Update** in place wherever the steps below name **Create**.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — apply findings via `Edit` as content becomes available.
 5. Apply every `CRITICAL` item. No consensus is required. **If** findings conflict → prefer the stricter wording.
 6. Apply each `OPTIONAL` item on merit. No consensus is required. **If** it conflicts with an applied `CRITICAL` item or expands scope → skip it.
diff --git a/.claude/agents/bkit-plan-generate.md b/.claude/agents/bkit-plan-generate.md
index 123cdabcc..975bb48ad 100644
--- a/.claude/agents/bkit-plan-generate.md
+++ b/.claude/agents/bkit-plan-generate.md
@@ -103,7 +103,21 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Take its sections from `docs/templates/bkit-plan.md`.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read the `.agents/docs.md` index, and consult the project documents the plan needs. Always assess `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md`. Consult `docs/data-schema.md` for database changes, `docs/design.md` for UI, `docs/observability.md` for logging, `docs/deployments.md` for release or CI behaviour, and `docs/noise.md` or `docs/setup.md` when relevant.
+   - Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently.
+   - Mark an irrelevant topic not applicable, with the reason.
+   - Record each topic, the path and section actually used, coverage, gap, action, alternative evidence and remaining uncertainty in `Documentation Consultation`.
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "security",
+       "gap": "starter-only",
+       "recommendedPath": "docs/security.md",
+       "alternativeEvidence": "The CI configuration defines token permissions.",
+       "action": "Populate the security document with the project's credential and permission boundaries."
+     }
+     ```
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
    - Write each section group below before you read for the next group. Do not leave the writing to a final pass.
    - **If** a section has nothing to hold → `None`.
@@ -117,6 +131,7 @@ autoCompactWindow: 300000
 7. Investigation & prerequisites:
    - `Open Questions & Assumptions`.
    - `Pre-Flight / Dependencies`.
+   - `Documentation Consultation` and `Documentation Warnings`, from step 3.
 8. Design:
    - `Alternative Approaches & Recommendations`.
    - `Data Schema Integration`.
@@ -140,6 +155,7 @@ autoCompactWindow: 300000
       - Keep each group and task within the plan caps your Context names (`bkit.workflows.tasks`: tasks and `TEST FIRST` tests per group, tests and test files per task).
       - Put the groups in build order: a group's `DEPENDS ON` names only tasks in earlier groups or in its own group.
       - `READ` / `UPDATE` / `DELETE` name only symbols and files you opened this session. Open an unopened one first, or leave it out.
+      - Give each task that touches an assessed topic a `READ` line for its recommended document (or the indexed equivalent), and an `UPDATE` line for each document the task changes. A gap that the task cannot close stays in `Documentation Warnings`.
       - NEVER write `TEST EXCEPTION` of your own; copy each `TEST EXCEPTION` field an input writes into its task, word for word.
     - `Verification Plan` from Test Matrix and Execution Runbook.
 
diff --git a/.claude/agents/bkit-plan-review-1.md b/.claude/agents/bkit-plan-review-1.md
index 39031091b..68db51c0e 100644
--- a/.claude/agents/bkit-plan-review-1.md
+++ b/.claude/agents/bkit-plan-review-1.md
@@ -65,7 +65,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Check that the plan reflects its source, with no drift, no omissions and no silent expansion:
    - Design-coverage: **If** a design artifact exists (`docs/plans/{YYYYMM}/{FID}-design.md`, or one the input references):
diff --git a/.claude/agents/bkit-plan-review-2.md b/.claude/agents/bkit-plan-review-2.md
index a9e49fa53..8b734cf4e 100644
--- a/.claude/agents/bkit-plan-review-2.md
+++ b/.claude/agents/bkit-plan-review-2.md
@@ -59,7 +59,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Trace the surface area of each `Agent Execution Runbook` task:
    - The files and modules it edits directly.
diff --git a/.claude/agents/bkit-plan-scope-check.md b/.claude/agents/bkit-plan-scope-check.md
index 47def4b3c..762e0bb41 100644
--- a/.claude/agents/bkit-plan-scope-check.md
+++ b/.claude/agents/bkit-plan-scope-check.md
@@ -65,7 +65,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Check that every section `docs/templates/bkit-plan.md` mandates is present and filled in. A missing or broken section → `CRITICAL`.
 6. Check the scenario sections and the open questions:
diff --git a/.claude/agents/bkit-plan-update.md b/.claude/agents/bkit-plan-update.md
index d1be40341..e531decb5 100644
--- a/.claude/agents/bkit-plan-update.md
+++ b/.claude/agents/bkit-plan-update.md
@@ -83,7 +83,19 @@ autoCompactWindow: 300000
    ```
    **If** the caller names **Update** and no **Create** → skip the seed: set the `Verdict` of **Update** to `PENDING`, and apply the findings to **Update** in place wherever the steps below name **Create**.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read the `.agents/docs.md` index, and load the docs it lists for this task. Keep the plan's `Documentation Consultation` and `Documentation Warnings` sources as recorded.
+   - **If** a finding changes a topic the plan covers (architecture, technology, security, testing, data schema, UI, logging, release or setup) → re-consult its recommended document or indexed equivalent, update that topic's source, coverage, gap and action, and carry any new `READ` / `UPDATE` line into the task it touches.
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "security",
+       "gap": "starter-only",
+       "recommendedPath": "docs/security.md",
+       "alternativeEvidence": "The CI configuration defines token permissions.",
+       "action": "Populate the security document with the project's credential and permission boundaries."
+     }
+     ```
+   - Never drop an earlier warning the review did not resolve.
 4. Update **Create** — apply findings via `Edit` as content becomes available.
 5. Keep every `Agent Execution Runbook` task's `DONE WHEN` and `TEST FIRST` intact through the merge:
    - A critique may edit the task text around them.
diff --git a/.claude/agents/bkit-ship-conflict-resolve.md b/.claude/agents/bkit-ship-conflict-resolve.md
index 5dea73650..2a9af1fb4 100644
--- a/.claude/agents/bkit-ship-conflict-resolve.md
+++ b/.claude/agents/bkit-ship-conflict-resolve.md
@@ -54,7 +54,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each substep: append the log entry at EOF with Bash `echo {log entry} >> {output}`.
 5. Confirm the merge state the caller left:
    - Record the branch head with `git rev-parse HEAD`, and append a log entry naming it.
diff --git a/.claude/agents/bkit-ship-deferred-sweep.md b/.claude/agents/bkit-ship-deferred-sweep.md
index 9273b0f52..f8be13d98 100644
--- a/.claude/agents/bkit-ship-deferred-sweep.md
+++ b/.claude/agents/bkit-ship-deferred-sweep.md
@@ -56,7 +56,7 @@ autoCompactWindow: 300000
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Settle which file is the plan, then scan it for declared out-of-scope, future-work or non-goal items:
    - **If** no plan file exists:
diff --git a/.claude/agents/bkit-ship-update-docs.md b/.claude/agents/bkit-ship-update-docs.md
index 00970ecf0..cfe8a4fc9 100644
--- a/.claude/agents/bkit-ship-update-docs.md
+++ b/.claude/agents/bkit-ship-update-docs.md
@@ -56,8 +56,12 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task.
    - Exclude `knowledge.jsonl` and `decisions.jsonl`.
+   - Check coverage before editing, for each of the ten recommended topics (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`) the shipped files touch: presence (absent or missing file), index accuracy (a row without a file, a file without a row, an `Equivalent to docs/{topic}.md` Scope cell), and project content (empty, or still the `.bkit/templates/docs/{topic}.md` starter).
+   - Mark an irrelevant topic not applicable, with the reason.
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Never report a clean sync while a relevant topic is absent or incomplete.
+   - Populate a relevant absent or starter-only document only within the ship's scope and from facts verified in the shipped files; otherwise report the gap.
 3. Read the history shipped this cycle:
    - Run `git rev-parse --is-shallow-repository`.
    - **If** it prints `true` → name the boundary commit in the output, and say that older history is unread.
@@ -68,6 +72,16 @@ autoCompactWindow: 300000
 7. Fill `Pending Items` from the `ship-pending-items.md` deferral scan supplied in your Read paths, one entry per line.
    - Do not write `docs/deferrals.jsonl`.
 8. Produce the **Create** output.
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "testing",
+       "gap": "starter-only",
+       "recommendedPath": "docs/testing.md",
+       "alternativeEvidence": "The test runner configuration names the available tiers",
+       "action": "Populate the testing document with the lane graph and tier rules."
+     }
+     ```
 
 **Output format:**
 
@@ -82,6 +96,14 @@ autoCompactWindow: 300000
 
 [For each file, which passes applied and which gaps closed. **If** none → `None`.]
 
+## Unresolved Coverage
+
+[Each topic that is absent, unindexed, empty, starter-only or undercovered after this run, with the evidence. Report it next to the edits above; it never makes the sync read as clean. **If** every relevant topic is covered → `None`.]
+
+## Documentation Warnings
+
+[The `jsonl` records from step 8. **If** no gaps → omit this section.]
+
 ## Pending Items
 
 [The `{FID}` matches from the `ship-pending-items.md` deferral scan, for human review. **If** no matches → `None`.]
diff --git a/.claude/agents/bkit-utility-update-decisions.md b/.claude/agents/bkit-utility-update-decisions.md
index 79c87fc6b..ba290303d 100644
--- a/.claude/agents/bkit-utility-update-decisions.md
+++ b/.claude/agents/bkit-utility-update-decisions.md
@@ -59,7 +59,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/decisions.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is `ACTIVE` or absent.
 4. Check each remaining entry against `docs/` and the codebase, never trusting the entry's own claims. Classify it, then apply its class:
    - `HOLDS` = docs or code confirm what the entry states, and none of them state otherwise → no change.
diff --git a/.claude/agents/bkit-utility-update-deferrals.md b/.claude/agents/bkit-utility-update-deferrals.md
index 1eb5d6cab..449d9f62e 100644
--- a/.claude/agents/bkit-utility-update-deferrals.md
+++ b/.claude/agents/bkit-utility-update-deferrals.md
@@ -56,7 +56,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/deferrals.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is not `CLOSED`.
 4. For each remaining entry, check in the codebase whether its work is done, never trusting the entry's own claims:
    - **If** it is done in code → set `status` to `CLOSED`, with `references` naming the evidence.
diff --git a/.claude/agents/bkit-utility-update-documentation.md b/.claude/agents/bkit-utility-update-documentation.md
index 8b846a0bd..c9f1680de 100644
--- a/.claude/agents/bkit-utility-update-documentation.md
+++ b/.claude/agents/bkit-utility-update-documentation.md
@@ -54,17 +54,33 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read the `.agents/docs.md` index as the full catalog of docs to check.
+2. Read the `.agents/docs.md` index as the catalog of docs to check, then check project documentation coverage before editing:
+   - **Presence:** for each of the ten recommended topics (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`), decide whether the change touched it (relevant) or not (not applicable, with the reason). Review every relevant topic, including one the index does not list and one whose file is absent or missing.
+   - **Index accuracy:** compare each `Project Documents` row with the repository. Report a row whose file is missing, a present file with no row, and an equivalent document (an indexed file whose Scope cell reads `Equivalent to docs/{topic}.md`).
+   - **Project content:** report a document that is empty or still the shipped starter (compare it with `.bkit/templates/docs/{topic}.md`); an irrelevant topic is not a gap. A document that differs from the starter is a candidate: assess its coverage against the code, and never call it complete from a mechanical check.
+   - **Populate** a relevant absent, empty or starter-only document only within the authorized scope and only with facts you verified in the repository; copy the starter from `.bkit/templates/docs/`, fill it in, and add its row to `Project Documents`. **If** the evidence is not there → leave the document alone and report the gap.
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Never report a clean sync while a relevant topic is absent or incomplete.
 3. Per doc, always follow its `Rules` headers when making edits.
 4. Per doc, four passes in order: Sync content (gaps vs implementation) → reorganize structure (dedupe, move misplaced) → compress wording (more token-efficient) → update cross-references (inline `docs/*.md` links).
-5. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory.
-6. Collect setup tips:
+5. Record the coverage result:
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "testing",
+       "gap": "starter-only",
+       "recommendedPath": "docs/testing.md",
+       "alternativeEvidence": "The test runner configuration names the available tiers",
+       "action": "Populate the testing document with the lane graph and tier rules."
+     }
+     ```
+6. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory.
+7. Collect setup tips:
    ```bash
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" tips --workflow=utility
    ```
    - Hold stdout as `BKIT_TIPS`. It is plain text, not JSON.
    - **If** it prints nothing or exits non-zero → `BKIT_TIPS` is empty.
-7. Final return: Display the output format verbatim as the final message to the user. Do not summarise or trim it.
+8. Final return: Display the output format verbatim as the final message to the user. Do not summarise or trim it.
    - Append a `## Suggested Replies` heading.
    - Append `Would you like me to explain any of this in plain English? Then write 'yes, explain in plain english'.`
    - **If** `BKIT_TIPS` is not empty:
@@ -84,6 +100,14 @@ autoCompactWindow: 300000
 
 [For each file, which passes applied and which gaps closed. **If** none → `None`.]
 
+## Project Documentation Coverage
+
+[One row per topic: recommended path, state (populated, starter-only, empty, absent or not-applicable), index accuracy, and evidence. A coverage gap here is never `None`.]
+
+## Documentation Warnings
+
+[The `jsonl` records from step 5. **If** no gaps → omit this section.]
+
 ## Memories
 
 [Each memory rewrite: memory path, pointer. **If** none → `None`.]
diff --git a/.claude/agents/bkit-utility-update-failures.md b/.claude/agents/bkit-utility-update-failures.md
index 676666c01..5175b5bcb 100644
--- a/.claude/agents/bkit-utility-update-failures.md
+++ b/.claude/agents/bkit-utility-update-failures.md
@@ -58,7 +58,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/failures.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is not `CLOSED`.
 4. For each remaining entry, check in the codebase whether its work is done, never trusting the entry's own claims:
    - For `category` `testing`, the winning row's `updates` is the flake count. Only a landed deterministic fix counts as done, never a recent green run.
diff --git a/.claude/agents/bkit-utility-update-knowledge.md b/.claude/agents/bkit-utility-update-knowledge.md
index 6f3f46531..a08a81e9a 100644
--- a/.claude/agents/bkit-utility-update-knowledge.md
+++ b/.claude/agents/bkit-utility-update-knowledge.md
@@ -60,7 +60,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/knowledge.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is `ACTIVE` or absent.
 4. Check each remaining entry against `docs/` and the codebase, never trusting the entry's own claims. Classify it, then apply its class:
    - `HOLDS` = docs or code confirm what the entry states, and none of them state otherwise → no change.
diff --git a/.claude/agents/bkit-utility-update-roadmap.md b/.claude/agents/bkit-utility-update-roadmap.md
index bd765d45e..dd7a41eea 100644
--- a/.claude/agents/bkit-utility-update-roadmap.md
+++ b/.claude/agents/bkit-utility-update-roadmap.md
@@ -60,7 +60,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Refresh `docs/roadmap.md` with `bkit roadmap fold` (the main checkout's `node_modules/.bin/bkit`):
    - **If** it fails → **STOP**.
    - Read the refreshed file in full. Its `bkit` block is a list of `FID`s.
diff --git a/.claude/agents/bkit-utility-update-tracker.md b/.claude/agents/bkit-utility-update-tracker.md
index 1117635e8..56038d3f9 100644
--- a/.claude/agents/bkit-utility-update-tracker.md
+++ b/.claude/agents/bkit-utility-update-tracker.md
@@ -64,7 +64,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Read repo facts:
    ```bash
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" repo info --allow-detached
diff --git a/.claude/agents/utility-new-release.md b/.claude/agents/utility-new-release.md
index bd33ec935..496e0681a 100644
--- a/.claude/agents/utility-new-release.md
+++ b/.claude/agents/utility-new-release.md
@@ -39,7 +39,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Track your turn budget throughout.
    - **If** ~80% of it is spent → **STOP**, and report the exact state in the Output format. Say what landed, what did not, and the next action that finishes the release.
 4. Confirm the inputs: `VERSION` (semver, required) and `FID` (credit issue, optional).
diff --git a/.claude/agents/utility-pre-release-check.md b/.claude/agents/utility-pre-release-check.md
index 3521f8ed4..52413db2b 100644
--- a/.claude/agents/utility-pre-release-check.md
+++ b/.claude/agents/utility-pre-release-check.md
@@ -41,7 +41,7 @@ autoCompactWindow: 300000
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `docs/testing.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `docs/testing.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Throughout the audit:
    - Read the file behind every search hit before you record a finding.
    - Track your turn budget.
diff --git a/.claude/commands/bkit-auto.md b/.claude/commands/bkit-auto.md
index b530db812..877fdbf10 100644
--- a/.claude/commands/bkit-auto.md
+++ b/.claude/commands/bkit-auto.md
@@ -116,6 +116,7 @@ description: "Auto — Phase-routed dispatch of any bkit phase"
 2. `REF` is the issue as `runs context` printed it (`#N` on GitHub, the key uppercased on Linear / Jira, empty with no tracker).
    - Never pass a bare `FID` or bare number: the dispatched workflow's Step 1 stops when no issue reference matches. It never creates an issue.
 3. Invoke the matching phase skill with the `Skill` tool, then exit.
+   The dispatched phase writes its own `## Documentation Warnings` in its summary. Forward that output as it is; do not collect or repeat it here.
    Route:
    - `PHASE` = `ship` → `/bkit-ship {FID} {REF}`
    - `PHASE` = `debug` → `/bkit-debug {FID} {REF} https://github.com/{OWNER_REPO}/actions/runs/{RUN_ID}` when `RUN_ID` is held; otherwise `/bkit-debug {FID} {REF}`.
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index 04a7f9beb..42f022508 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -459,6 +459,7 @@ description: "Build Feature — Autonomous implementation"
    Context: You are a subagent in the Build phase. Write the plan in task-block form. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. **If** `CONVERT_RETRY` is held → add `Your last plan failed the plan check: {CONVERT_RETRY}. Fix only those problems.` **If** `NEWER_COMMENTS` > 0 → add `{NEWER_COMMENTS} issue comments are newer than the plan; write what they change into it.` Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Check command: `"{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"`.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md` (if present), `docs/templates/bkit-plan.md`.
    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
+   Project documents: the converted plan carries `Documentation Consultation` and `Documentation Warnings`, and each task that touches an assessed topic names its `READ` / `UPDATE` documents. Later steps read those sources and warn from applicable tasks; a missing or starter-only document warns and the run continues.
 3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
@@ -1080,6 +1081,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" workflows summary --workflow=build --file="{STATUS}" --publish={PUBLISH}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 3. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --number=15 --post --title=Summary --link-ref={BRANCH} --comment-body --message="chore({FID}): summary"
diff --git a/.claude/commands/bkit-debug.md b/.claude/commands/bkit-debug.md
index eacc2e7bb..e38c6103f 100644
--- a/.claude/commands/bkit-debug.md
+++ b/.claude/commands/bkit-debug.md
@@ -460,6 +460,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    Read: `{CI_SELECTION_FILE}`, `docs/plans/{YYYYMM}/logs/{FID}/debug-input-{DEBUG_ATTEMPT}.md`, the current-generation `context-*` artifacts recorded in Step 4.
    Update: Test files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-reproduce-{NORMAL_ATTEMPT}.md`.
+   Project documents: a debug run has no plan, so the subagents read the `.agents/docs.md` index and consult `docs/testing.md` for the test tiers and `docs/noise.md` for registered signal downgrades (also `docs/observability.md` or `docs/architecture.md` when they are present and relevant to the failure). A missing index or a missing, empty or starter-only document is a warning: continue from repository evidence, and record the gap in `## Documentation Warnings`. A handover keeps the unresolved warnings.
 2. Finish — commits the test:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-failure-reproduce --field=ciGeneration={CI_GENERATION} --attempt-of=debug-run-tests:current --agent=bkit-debug-failure-reproduce --artifact="docs/plans/{YYYYMM}/logs/{FID}/debug-failure-reproduce-<attempt>.md" --message="test({FID}): reproduce reported failure" --number=5 --post --title="Failure Reproduce"
@@ -603,6 +604,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    "{BKIT}" workflows summary --workflow=debug --file="{STATUS}"
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 2. Finish:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md --message="chore({FID}): summary" --verbose-ci-local --number=10 --post --title="Summary" --link-ref={BRANCH} --comment-body
diff --git a/.claude/commands/bkit-design.md b/.claude/commands/bkit-design.md
index e2dd7a3e5..352b972b2 100644
--- a/.claude/commands/bkit-design.md
+++ b/.claude/commands/bkit-design.md
@@ -332,6 +332,7 @@ description: "Design Feature — Autonomous design phase"
    Context: You are a subagent in the Design phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Inputs carry distinct lenses. Merge across them, and do not collapse them to a consensus.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/design-input-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-1.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-2.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-3.md`, `docs/plans/{YYYYMM}/logs/{FID}/related-issues.md` (if present), `docs/plans/{YYYYMM}/{FID}-design.md` (if present — superseded design, context only, not a constraint).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md`.
+   Project documents: a design needs no plan, so the subagent reads the `.agents/docs.md` index and consults `docs/architecture.md` (boundaries and topology), plus `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/design.md`, `docs/observability.md` or `docs/deployments.md` when the design touches them. A missing index or a missing, empty or starter-only document is a warning: continue from repository evidence, and record the gap in `## Documentation Warnings` (one `jsonl` record per gap with `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action`).
 2. Finish:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=design --step=design-generate --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md --message="chore({FID}): design-generate" --number=5 --post --title="Generate Design" --link-ref=dev
@@ -451,6 +452,7 @@ description: "Design Feature — Autonomous design phase"
    "{BKIT}" workflows summary --workflow=design --file="{STATUS}"
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 3. Finish, then push with exactly one command:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=design --step=design-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/design-summary.md --message="chore({FID}): summary bkit [skip ci]" --number=10 --post --title=Summary --link-ref=dev --comment-body
diff --git a/.claude/commands/bkit-plan.md b/.claude/commands/bkit-plan.md
index e3970cc10..5bf5e0d01 100644
--- a/.claude/commands/bkit-plan.md
+++ b/.claude/commands/bkit-plan.md
@@ -220,6 +220,7 @@ description: "Plan Feature — Autonomous plan generation"
    Context: You are a subagent in the Plan phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. Workstreams this plan covers: {WORKSTREAMS}.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present — superseded plan, context only, not a constraint).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`.
+   Project documents: `@bkit-plan-generate` fills `Documentation Consultation` and `Documentation Warnings` in the plan. The review and apply-review steps keep those sources; a gap is a warning that continues the run, never a stop.
    **If** the draft still holds `PENDING` → invoke `@bkit-plan-generate` once more with Context `"Fill only the sections still marked PENDING and the empty groups; leave every finished section as it is."` and the plan caps and workstreams above, Read: the same inputs, Update: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`.
 2. Check the draft's groups and task blocks, and that every symbol it names exists:
    ```bash
@@ -387,6 +388,7 @@ description: "Plan Feature — Autonomous plan generation"
    "{BKIT}" workflows summary --workflow=plan --file="{STATUS}" --plan={PLAN_FINAL}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 4. Finish, then push the summary commit:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/plan-summary.md --message="chore({FID}): summary bkit [skip ci]" --number=7 --post --title=Summary --link-ref=dev --comment-body
diff --git a/.claude/commands/bkit-ship.md b/.claude/commands/bkit-ship.md
index 4b21863b5..60019584c 100644
--- a/.claude/commands/bkit-ship.md
+++ b/.claude/commands/bkit-ship.md
@@ -461,6 +461,7 @@ description: "Ship Feature — Autonomous merge and archive"
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`), `{OUTBOX}/ship-pending-items.md`.
    Update: Doc files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md`.
+   Documentation maintenance findings (unresolved coverage and the `## Documentation Warnings` records) stay in the ship summary next to the edits; a missing document is reported and the ship continues.
 3. Wait for the subagent to complete. Then append the `SHIPPED` row to the worktree ledger, re-render the mechanical `roadmap-status` board from it, and finish the step (bookkeeping to `$BOOK_ROOT`). The block exits 1 when the row did not land:
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
@@ -471,6 +472,7 @@ description: "Ship Feature — Autonomous merge and archive"
    "{BKIT}" workflows summary --workflow=ship --file="{STATUS}" --pr={PR_NUMBER}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 5. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --commit=none --number=6 --post --title="Update Docs & Summary" --link-ref=dev --comment-body
diff --git a/.codex/agents/bkit-audit-generate.toml b/.codex/agents/bkit-audit-generate.toml
index b44194fd0..8b7af874c 100644
--- a/.codex/agents/bkit-audit-generate.toml
+++ b/.codex/agents/bkit-audit-generate.toml
@@ -98,7 +98,20 @@ developer_instructions = """
      - **If** it exits non-zero → **STOP** and report the reason.
      - NEVER hand-write or edit the `bkit:anchor` block or the `bkit:outdated` line the stamp writes under it.
 3. Read every supplied input once at the start, and work from what it says, not from session memory. Do not re-read the template on every loop iteration.
-4. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+4. Read the `.agents/docs.md` index, and load the project documents the audit's surface needs, with or without a plan: `docs/architecture.md` for structure and boundaries, `docs/technology.md` for stack choices, `docs/security.md` for trust boundaries, `docs/testing.md` for test and gate rules, plus `docs/data-schema.md`, `docs/design.md`, `docs/observability.md`, `docs/deployments.md`, `docs/noise.md` or `docs/setup.md` when the audit's surface touches them.
+   - Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Mark an irrelevant topic not applicable, with the reason.
+   - Safeguards that need genuine evidence stay in force (secrets, permissions, untrusted input).
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "testing",
+       "gap": "missing",
+       "recommendedPath": "docs/testing.md",
+       "alternativeEvidence": "The CI workflow defines the lanes.",
+       "action": "Copy the testing starter and describe the project's tiers and lanes."
+     }
+     ```
 5. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
    - **If** a section has no content → `None`.
 6. Populate the template sections in template order, without changing the order. Take each section's shape from the template and every rule from this prompt, and verify every gate before you proceed:
diff --git a/.codex/agents/bkit-build-challenge-1.toml b/.codex/agents/bkit-build-challenge-1.toml
index 32c642074..ac2884f24 100644
--- a/.codex/agents/bkit-build-challenge-1.toml
+++ b/.codex/agents/bkit-build-challenge-1.toml
@@ -43,7 +43,7 @@ developer_instructions = """
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/security.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each finding: append the entry at EOF with Bash `echo {log entry} >> {output}`.
    - **If** the entry spans several lines → append it with a heredoc instead.
    - **If** any finding is `CRITICAL` → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
diff --git a/.codex/agents/bkit-build-challenge-2.toml b/.codex/agents/bkit-build-challenge-2.toml
index 3e012ffe7..9e22a1c6f 100644
--- a/.codex/agents/bkit-build-challenge-2.toml
+++ b/.codex/agents/bkit-build-challenge-2.toml
@@ -47,7 +47,7 @@ developer_instructions = """
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/security.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/security.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each finding: append the entry at EOF with Bash `echo {log entry} >> {output}`.
    - **If** the entry spans several lines → append it with a heredoc instead.
    - **If** any finding is `CRITICAL` → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
diff --git a/.codex/agents/bkit-build-install-skills.toml b/.codex/agents/bkit-build-install-skills.toml
index 236cf8f6b..542198b8e 100644
--- a/.codex/agents/bkit-build-install-skills.toml
+++ b/.codex/agents/bkit-build-install-skills.toml
@@ -39,7 +39,7 @@ developer_instructions = """
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Identify the technologies that the feature requires.
 4. List the folder names under `.agents/skills/`, without reading the folders' contents. Each folder name is the identity of one installed skill when you look for gaps.
 5. Identify each skill gap: a required technology that no folder name matches.
diff --git a/.codex/agents/bkit-build-plan-convert.toml b/.codex/agents/bkit-build-plan-convert.toml
index ebefc20b8..40512a163 100644
--- a/.codex/agents/bkit-build-plan-convert.toml
+++ b/.codex/agents/bkit-build-plan-convert.toml
@@ -50,10 +50,24 @@ developer_instructions = """
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
+   - Read the `.agents/docs.md` index, and consult the project documents the converted tasks need: always assess `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md`; add `docs/data-schema.md` when a task changes the database, `docs/design.md` for UI work, `docs/observability.md` for logging, `docs/deployments.md` for release or CI work, and `docs/noise.md` or `docs/setup.md` when a task touches them.
+     - Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+     - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Mark an irrelevant topic not applicable, with the reason.
+     - Record each topic, the path and section used, coverage, gap and action in the plan's `Documentation Consultation`, and put each `READ` / `UPDATE` line for these documents in the task that needs it.
+     - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+       ```jsonl
+       {
+         "topic": "security",
+         "gap": "starter-only",
+         "recommendedPath": "docs/security.md",
+         "alternativeEvidence": "The CI configuration defines token permissions.",
+         "action": "Populate the security document with the project's credential and permission boundaries."
+       }
+       ```
 2. Read `docs/templates/bkit-plan.md` § `Agent Execution Runbook` for the shape of a group and of a task block. The rules for filling them are the **Runbook tasks**, **TEST FIRST** and **TEST EXCEPTION** clauses above.
 3. Set up the plan file:
-   - **If** the plan file exists → keep every section except `Agent Execution Runbook` as written, and rewrite the runbook.
-   - **Else** → create the plan with `# {title} Implementation Plan`, `## Context & Goals` (the goal in 1-3 lines), `## Reuse Inventory` and `## Agent Execution Runbook`.
+   - **If** the plan file exists → keep every section except `Agent Execution Runbook` as written (add or refresh `Documentation Consultation` and `Documentation Warnings` from step 1), and rewrite the runbook.
+   - **Else** → create the plan with `# {title} Implementation Plan`, `## Context & Goals` (the goal in 1-3 lines), `## Documentation Consultation`, `## Documentation Warnings`, `## Reuse Inventory` and `## Agent Execution Runbook`.
    - In both cases, carry over every end state and test that the inputs name, in their order. You may tighten them, but never weaken them.
 4. Split the work into tasks, each one a testable change, and group the tasks in build order:
    - Keep each group within the per-group plan caps that your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all).
diff --git a/.codex/agents/bkit-build-plan-current.toml b/.codex/agents/bkit-build-plan-current.toml
index 4bc45e0d2..abc53b3e9 100644
--- a/.codex/agents/bkit-build-plan-current.toml
+++ b/.codex/agents/bkit-build-plan-current.toml
@@ -42,7 +42,7 @@ developer_instructions = """
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each affected task: append the entry at EOF with Bash `echo {log entry} >> {output}`.
    - **If** the entry spans several lines → append it with a heredoc instead.
    - **If** any task `Broken` → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
diff --git a/.codex/agents/bkit-build-plan-gaps-remediate.toml b/.codex/agents/bkit-build-plan-gaps-remediate.toml
index dd112d6cc..2f7d338ff 100644
--- a/.codex/agents/bkit-build-plan-gaps-remediate.toml
+++ b/.codex/agents/bkit-build-plan-gaps-remediate.toml
@@ -68,7 +68,7 @@ developer_instructions = """
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/testing.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Read the inputs, and find where to resume:
    - **If** Context `Mode` = `Holistic` → read the holistic verify report and every log. Each line of its `Identified Gaps Log` is one gap. Read the plan's task block of each task a gap names; no group gate log is supplied.
    - **Else** → read the group's briefs (their task blocks), the plan gaps, the group gate log when one is supplied, and every log. Each failure in the group gate log is one gap. In the logs, `DONE` = done and `BLOCKED` = blocked.
diff --git a/.codex/agents/bkit-build-plan-tasks.toml b/.codex/agents/bkit-build-plan-tasks.toml
index 4fb2790d2..36e03ce00 100644
--- a/.codex/agents/bkit-build-plan-tasks.toml
+++ b/.codex/agents/bkit-build-plan-tasks.toml
@@ -76,7 +76,7 @@ developer_instructions = """
    - **If** **Create** already exists → set its `Verdict` to `PENDING` with `Edit`, and keep every log line.
    - **Else** → Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Read the supplied brief (`build-brief-{GROUP}-{n}.md`):
    - Its task blocks are the work, in order.
    - Its earlier tasks are context only.
diff --git a/.codex/agents/bkit-build-plan-tests.toml b/.codex/agents/bkit-build-plan-tests.toml
index 7696e2e6a..21439a995 100644
--- a/.codex/agents/bkit-build-plan-tests.toml
+++ b/.codex/agents/bkit-build-plan-tests.toml
@@ -55,7 +55,7 @@ developer_instructions = """
    - **If** **Create** already exists → set its `Verdict` to `PENDING` with `Edit`, and keep every log line.
    - **Else** → Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Read the supplied brief (`build-brief-tests-{GROUP}-{n}.md`):
    - Its task blocks' `TEST FIRST` entries are the work, in order; the rest of each block says what the test is for.
    - Its `Derived Test Matrix rows` say what each test asserts.
diff --git a/.codex/agents/bkit-build-plan-verify.toml b/.codex/agents/bkit-build-plan-verify.toml
index fe6368f43..8e275e7f4 100644
--- a/.codex/agents/bkit-build-plan-verify.toml
+++ b/.codex/agents/bkit-build-plan-verify.toml
@@ -48,7 +48,7 @@ developer_instructions = """
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
    - For each gap, append the entry at EOF with Bash `echo {log entry} >> {output}`.
      - **If** the entry spans several lines → append it with a heredoc instead.
diff --git a/.codex/agents/bkit-debug-abort-handover.toml b/.codex/agents/bkit-debug-abort-handover.toml
index e8e188ff6..6529ee955 100644
--- a/.codex/agents/bkit-debug-abort-handover.toml
+++ b/.codex/agents/bkit-debug-abort-handover.toml
@@ -43,12 +43,13 @@ developer_instructions = """
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Extract `Rot Signals` from the diagnose attempts, and aggregate them into the handover: dedupe the slugs, and keep all the evidence.
 6. Extract `Out-of-Scope Recommendations` from the diagnose attempts, and aggregate them: dedupe the paths, and keep all the rationales.
-7. Append one row per failure to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
-8. Append one row per deferral to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
+7. Collect the `## Documentation Warnings` records from the diagnose, remediate and verify logs of the run, and copy them verbatim into the handover's `Documentation Warnings` section, dropping exact duplicates. Take no records from raw `*-input-*.md` files.
+8. Append one row per failure to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
+9. Append one row per deferral to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
 
 **Output format:**
 
@@ -91,6 +92,10 @@ developer_instructions = """
 
 [Which option to take, and why. Initially set to `PENDING`.]
 
+## Documentation Warnings
+
+[The deduped records of the run's `## Documentation Warnings` sections, verbatim, in one `jsonl` fence with one JSON object per record. **If** none → `None`. Initially set to `PENDING`.]
+
 ## Reference Docs
 
 [The prior diagnoses, prior remediations, CI runs and observability evidence. Initially set to `PENDING`.]
diff --git a/.codex/agents/bkit-debug-failure-diagnose.toml b/.codex/agents/bkit-debug-failure-diagnose.toml
index 4569ba816..dfae7bfbb 100644
--- a/.codex/agents/bkit-debug-failure-diagnose.toml
+++ b/.codex/agents/bkit-debug-failure-diagnose.toml
@@ -48,7 +48,7 @@ developer_instructions = """
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory. The CI and runtime logs are the primary signal.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` and `docs/noise.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Read `Strategy` from the input Context. **If** it is missing → set `Verdict` = `FAIL` in **Create**, change no other file, and go straight to the final return. Apply the matching strategy:
    - `STANDARD` → run a targeted diagnosis.
diff --git a/.codex/agents/bkit-debug-failure-remediate.toml b/.codex/agents/bkit-debug-failure-remediate.toml
index 54719a0c5..0869825f9 100644
--- a/.codex/agents/bkit-debug-failure-remediate.toml
+++ b/.codex/agents/bkit-debug-failure-remediate.toml
@@ -47,7 +47,7 @@ developer_instructions = """
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each remediation: append `DONE|BLOCKED` at EOF with Bash `echo {log entry} >> {output}`.
 5. Read `Strategy` from the input Context. **If** it is missing → set `Verdict` = `FAIL` in **Create**, change no other file, and go straight to the final return. Apply the matching strategy:
    - `STANDARD` → apply the diagnosis as written.
diff --git a/.codex/agents/bkit-debug-failure-reproduce.toml b/.codex/agents/bkit-debug-failure-reproduce.toml
index 427f8fc84..a313c3af9 100644
--- a/.codex/agents/bkit-debug-failure-reproduce.toml
+++ b/.codex/agents/bkit-debug-failure-reproduce.toml
@@ -42,7 +42,7 @@ developer_instructions = """
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory. The bug report in `debug-input-*.md` is the primary signal.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Choose where the tests go:
    - Pick the lowest tier that reaches the reported behaviours: unit before integration before e2e.
    - Co-locate them with the tests that cover the affected areas, and match those tests' imports, helpers and naming.
diff --git a/.codex/agents/bkit-debug-failure-soak.toml b/.codex/agents/bkit-debug-failure-soak.toml
index 5193f61d3..c26014410 100644
--- a/.codex/agents/bkit-debug-failure-soak.toml
+++ b/.codex/agents/bkit-debug-failure-soak.toml
@@ -49,7 +49,7 @@ developer_instructions = """
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Decide the single next step from the accumulated context:
    - **If** the cause is unknown → instrument the suspected surface: add `[DEBUG-OBSERVE]` logging, with no behaviour change.
    - **Else**:
diff --git a/.codex/agents/bkit-design-brainstorm-ideate-1.toml b/.codex/agents/bkit-design-brainstorm-ideate-1.toml
index 6220f827a..33d9688f2 100644
--- a/.codex/agents/bkit-design-brainstorm-ideate-1.toml
+++ b/.codex/agents/bkit-design-brainstorm-ideate-1.toml
@@ -37,7 +37,7 @@ developer_instructions = """
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/technology.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Propose 2-3 approaches from the current constraints: existing code, minimal new infrastructure and the fastest path to ship.
    - Lead with the recommended approach.
    - Keep each approach in the existing stack, with no greenfield build and no hypothetical infrastructure.
diff --git a/.codex/agents/bkit-design-brainstorm-ideate-2.toml b/.codex/agents/bkit-design-brainstorm-ideate-2.toml
index 26c46956d..bc86d726b 100644
--- a/.codex/agents/bkit-design-brainstorm-ideate-2.toml
+++ b/.codex/agents/bkit-design-brainstorm-ideate-2.toml
@@ -35,7 +35,7 @@ developer_instructions = """
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/technology.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Propose 2-3 approaches from first principles: the best long-term shape if the existing constraints did not matter.
    - Lead with the recommended approach.
    - Ignore "we already have X" as a default.
diff --git a/.codex/agents/bkit-design-brainstorm-ideate-3.toml b/.codex/agents/bkit-design-brainstorm-ideate-3.toml
index b8d694859..7f48f73bd 100644
--- a/.codex/agents/bkit-design-brainstorm-ideate-3.toml
+++ b/.codex/agents/bkit-design-brainstorm-ideate-3.toml
@@ -36,7 +36,7 @@ developer_instructions = """
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/security.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Propose 2-3 approaches framed by failure mode, not by happy-path shape.
    - Lead with the recommended approach.
    - For each approach, include additive risk-mitigation guidance to layer onto whichever approach is picked, not separate "safer" approaches.
diff --git a/.codex/agents/bkit-design-generate.toml b/.codex/agents/bkit-design-generate.toml
index 71f2619a2..9370c3d00 100644
--- a/.codex/agents/bkit-design-generate.toml
+++ b/.codex/agents/bkit-design-generate.toml
@@ -47,7 +47,7 @@ developer_instructions = """
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Do not `cp` an existing input.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md`, `docs/technology.md` and `docs/security.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Identify the themes, complementary ideas, conflicts and related issues.
    - Layer the risk-premortem mitigations onto the selected approach. They are additive, not a separate approach.
diff --git a/.codex/agents/bkit-design-organise.toml b/.codex/agents/bkit-design-organise.toml
index 0aee77e8d..63b8f8852 100644
--- a/.codex/agents/bkit-design-organise.toml
+++ b/.codex/agents/bkit-design-organise.toml
@@ -44,7 +44,7 @@ developer_instructions = """
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" steps stub --from="<Read>" --to="<Create>" --strip-header
    ```
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Identify the decomposition boundaries: domain boundaries, organisational structure and chronological dependencies. Do not use token or context-window size as a factor.
 5. Group the design work into workstreams at the identified boundaries.
 6. For each workstream:
diff --git a/.codex/agents/bkit-design-review-1.toml b/.codex/agents/bkit-design-review-1.toml
index dd6136834..ac45acee5 100644
--- a/.codex/agents/bkit-design-review-1.toml
+++ b/.codex/agents/bkit-design-review-1.toml
@@ -46,7 +46,7 @@ developer_instructions = """
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/technology.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. For each major capability the design requires, search for prior art:
    - Search the repo: text search for names, strings, near-miss helpers and sibling modules, symbol references through the language server when one is configured, and `docs/capabilities.md` when present.
diff --git a/.codex/agents/bkit-design-review-2.toml b/.codex/agents/bkit-design-review-2.toml
index 256a31694..b279445a8 100644
--- a/.codex/agents/bkit-design-review-2.toml
+++ b/.codex/agents/bkit-design-review-2.toml
@@ -45,7 +45,7 @@ developer_instructions = """
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/observability.md` and `docs/deployments.md` when they are present (warn and continue if either is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/observability.md` and `docs/deployments.md` when they are present (warn and continue if either is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. For each major component or flow, enumerate its failure modes:
    - What fails: an upstream dependency, internal logic, resource exhaustion, data corruption or partial state.
diff --git a/.codex/agents/bkit-design-spike.toml b/.codex/agents/bkit-design-spike.toml
index 2e4cd1fda..d1272d2ea 100644
--- a/.codex/agents/bkit-design-spike.toml
+++ b/.codex/agents/bkit-design-spike.toml
@@ -50,7 +50,7 @@ developer_instructions = """
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Restate each unknown in the review's `PoC Approach` and `Unknowns & Blockers` as one claim the design depends on and a probe could disprove:
    - Order the claims by blast radius.
diff --git a/.codex/agents/bkit-design-update.toml b/.codex/agents/bkit-design-update.toml
index dac0af930..c22db0900 100644
--- a/.codex/agents/bkit-design-update.toml
+++ b/.codex/agents/bkit-design-update.toml
@@ -48,7 +48,7 @@ developer_instructions = """
    ```
    **If** the caller names **Update** and no **Create** → skip the seed: set the `Verdict` of **Update** to `PENDING`, and apply the findings to **Update** in place wherever the steps below name **Create**.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — apply findings via `Edit` as content becomes available.
 5. Apply every `CRITICAL` item. No consensus is required. **If** findings conflict → prefer the stricter wording.
 6. Apply each `OPTIONAL` item on merit. No consensus is required. **If** it conflicts with an applied `CRITICAL` item or expands scope → skip it.
diff --git a/.codex/agents/bkit-plan-generate.toml b/.codex/agents/bkit-plan-generate.toml
index 3648fb2c3..c66c2ab4a 100644
--- a/.codex/agents/bkit-plan-generate.toml
+++ b/.codex/agents/bkit-plan-generate.toml
@@ -90,7 +90,21 @@ developer_instructions = """
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Take its sections from `docs/templates/bkit-plan.md`.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read the `.agents/docs.md` index, and consult the project documents the plan needs. Always assess `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md`. Consult `docs/data-schema.md` for database changes, `docs/design.md` for UI, `docs/observability.md` for logging, `docs/deployments.md` for release or CI behaviour, and `docs/noise.md` or `docs/setup.md` when relevant.
+   - Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently.
+   - Mark an irrelevant topic not applicable, with the reason.
+   - Record each topic, the path and section actually used, coverage, gap, action, alternative evidence and remaining uncertainty in `Documentation Consultation`.
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "security",
+       "gap": "starter-only",
+       "recommendedPath": "docs/security.md",
+       "alternativeEvidence": "The CI configuration defines token permissions.",
+       "action": "Populate the security document with the project's credential and permission boundaries."
+     }
+     ```
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
    - Write each section group below before you read for the next group. Do not leave the writing to a final pass.
    - **If** a section has nothing to hold → `None`.
@@ -104,6 +118,7 @@ developer_instructions = """
 7. Investigation & prerequisites:
    - `Open Questions & Assumptions`.
    - `Pre-Flight / Dependencies`.
+   - `Documentation Consultation` and `Documentation Warnings`, from step 3.
 8. Design:
    - `Alternative Approaches & Recommendations`.
    - `Data Schema Integration`.
@@ -127,6 +142,7 @@ developer_instructions = """
       - Keep each group and task within the plan caps your Context names (`bkit.workflows.tasks`: tasks and `TEST FIRST` tests per group, tests and test files per task).
       - Put the groups in build order: a group's `DEPENDS ON` names only tasks in earlier groups or in its own group.
       - `READ` / `UPDATE` / `DELETE` name only symbols and files you opened this session. Open an unopened one first, or leave it out.
+      - Give each task that touches an assessed topic a `READ` line for its recommended document (or the indexed equivalent), and an `UPDATE` line for each document the task changes. A gap that the task cannot close stays in `Documentation Warnings`.
       - NEVER write `TEST EXCEPTION` of your own; copy each `TEST EXCEPTION` field an input writes into its task, word for word.
     - `Verification Plan` from Test Matrix and Execution Runbook.
 
diff --git a/.codex/agents/bkit-plan-review-1.toml b/.codex/agents/bkit-plan-review-1.toml
index 3e5fad72b..1cae246fd 100644
--- a/.codex/agents/bkit-plan-review-1.toml
+++ b/.codex/agents/bkit-plan-review-1.toml
@@ -53,7 +53,7 @@ developer_instructions = """
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Check that the plan reflects its source, with no drift, no omissions and no silent expansion:
    - Design-coverage: **If** a design artifact exists (`docs/plans/{YYYYMM}/{FID}-design.md`, or one the input references):
diff --git a/.codex/agents/bkit-plan-review-2.toml b/.codex/agents/bkit-plan-review-2.toml
index d476d2e19..6dad9e52c 100644
--- a/.codex/agents/bkit-plan-review-2.toml
+++ b/.codex/agents/bkit-plan-review-2.toml
@@ -47,7 +47,7 @@ developer_instructions = """
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Trace the surface area of each `Agent Execution Runbook` task:
    - The files and modules it edits directly.
diff --git a/.codex/agents/bkit-plan-scope-check.toml b/.codex/agents/bkit-plan-scope-check.toml
index 977c71551..3f2fbf0e8 100644
--- a/.codex/agents/bkit-plan-scope-check.toml
+++ b/.codex/agents/bkit-plan-scope-check.toml
@@ -53,7 +53,7 @@ developer_instructions = """
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Check that every section `docs/templates/bkit-plan.md` mandates is present and filled in. A missing or broken section → `CRITICAL`.
 6. Check the scenario sections and the open questions:
diff --git a/.codex/agents/bkit-plan-update.toml b/.codex/agents/bkit-plan-update.toml
index 3a528d52d..96a62f57f 100644
--- a/.codex/agents/bkit-plan-update.toml
+++ b/.codex/agents/bkit-plan-update.toml
@@ -71,7 +71,19 @@ developer_instructions = """
    ```
    **If** the caller names **Update** and no **Create** → skip the seed: set the `Verdict` of **Update** to `PENDING`, and apply the findings to **Update** in place wherever the steps below name **Create**.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read the `.agents/docs.md` index, and load the docs it lists for this task. Keep the plan's `Documentation Consultation` and `Documentation Warnings` sources as recorded.
+   - **If** a finding changes a topic the plan covers (architecture, technology, security, testing, data schema, UI, logging, release or setup) → re-consult its recommended document or indexed equivalent, update that topic's source, coverage, gap and action, and carry any new `READ` / `UPDATE` line into the task it touches.
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "security",
+       "gap": "starter-only",
+       "recommendedPath": "docs/security.md",
+       "alternativeEvidence": "The CI configuration defines token permissions.",
+       "action": "Populate the security document with the project's credential and permission boundaries."
+     }
+     ```
+   - Never drop an earlier warning the review did not resolve.
 4. Update **Create** — apply findings via `Edit` as content becomes available.
 5. Keep every `Agent Execution Runbook` task's `DONE WHEN` and `TEST FIRST` intact through the merge:
    - A critique may edit the task text around them.
diff --git a/.codex/agents/bkit-ship-conflict-resolve.toml b/.codex/agents/bkit-ship-conflict-resolve.toml
index 542bc0ae8..782623769 100644
--- a/.codex/agents/bkit-ship-conflict-resolve.toml
+++ b/.codex/agents/bkit-ship-conflict-resolve.toml
@@ -41,7 +41,7 @@ developer_instructions = """
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each substep: append the log entry at EOF with Bash `echo {log entry} >> {output}`.
 5. Confirm the merge state the caller left:
    - Record the branch head with `git rev-parse HEAD`, and append a log entry naming it.
diff --git a/.codex/agents/bkit-ship-deferred-sweep.toml b/.codex/agents/bkit-ship-deferred-sweep.toml
index 5c667fa8a..539962e3e 100644
--- a/.codex/agents/bkit-ship-deferred-sweep.toml
+++ b/.codex/agents/bkit-ship-deferred-sweep.toml
@@ -43,7 +43,7 @@ developer_instructions = """
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Settle which file is the plan, then scan it for declared out-of-scope, future-work or non-goal items:
    - **If** no plan file exists:
diff --git a/.codex/agents/bkit-ship-update-docs.toml b/.codex/agents/bkit-ship-update-docs.toml
index e02813937..a8e974bec 100644
--- a/.codex/agents/bkit-ship-update-docs.toml
+++ b/.codex/agents/bkit-ship-update-docs.toml
@@ -43,8 +43,12 @@ developer_instructions = """
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task.
    - Exclude `knowledge.jsonl` and `decisions.jsonl`.
+   - Check coverage before editing, for each of the ten recommended topics (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`) the shipped files touch: presence (absent or missing file), index accuracy (a row without a file, a file without a row, an `Equivalent to docs/{topic}.md` Scope cell), and project content (empty, or still the `.bkit/templates/docs/{topic}.md` starter).
+   - Mark an irrelevant topic not applicable, with the reason.
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Never report a clean sync while a relevant topic is absent or incomplete.
+   - Populate a relevant absent or starter-only document only within the ship's scope and from facts verified in the shipped files; otherwise report the gap.
 3. Read the history shipped this cycle:
    - Run `git rev-parse --is-shallow-repository`.
    - **If** it prints `true` → name the boundary commit in the output, and say that older history is unread.
@@ -55,6 +59,16 @@ developer_instructions = """
 7. Fill `Pending Items` from the `ship-pending-items.md` deferral scan supplied in your Read paths, one entry per line.
    - Do not write `docs/deferrals.jsonl`.
 8. Produce the **Create** output.
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "testing",
+       "gap": "starter-only",
+       "recommendedPath": "docs/testing.md",
+       "alternativeEvidence": "The test runner configuration names the available tiers",
+       "action": "Populate the testing document with the lane graph and tier rules."
+     }
+     ```
 
 **Output format:**
 
@@ -69,6 +83,14 @@ developer_instructions = """
 
 [For each file, which passes applied and which gaps closed. **If** none → `None`.]
 
+## Unresolved Coverage
+
+[Each topic that is absent, unindexed, empty, starter-only or undercovered after this run, with the evidence. Report it next to the edits above; it never makes the sync read as clean. **If** every relevant topic is covered → `None`.]
+
+## Documentation Warnings
+
+[The `jsonl` records from step 8. **If** no gaps → omit this section.]
+
 ## Pending Items
 
 [The `{FID}` matches from the `ship-pending-items.md` deferral scan, for human review. **If** no matches → `None`.]
diff --git a/.codex/agents/bkit-utility-update-decisions.toml b/.codex/agents/bkit-utility-update-decisions.toml
index 21f35d289..7f5e4e1d8 100644
--- a/.codex/agents/bkit-utility-update-decisions.toml
+++ b/.codex/agents/bkit-utility-update-decisions.toml
@@ -46,7 +46,7 @@ developer_instructions = """
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/decisions.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is `ACTIVE` or absent.
 4. Check each remaining entry against `docs/` and the codebase, never trusting the entry's own claims. Classify it, then apply its class:
    - `HOLDS` = docs or code confirm what the entry states, and none of them state otherwise → no change.
diff --git a/.codex/agents/bkit-utility-update-deferrals.toml b/.codex/agents/bkit-utility-update-deferrals.toml
index 86522404e..1ee851175 100644
--- a/.codex/agents/bkit-utility-update-deferrals.toml
+++ b/.codex/agents/bkit-utility-update-deferrals.toml
@@ -43,7 +43,7 @@ developer_instructions = """
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/deferrals.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is not `CLOSED`.
 4. For each remaining entry, check in the codebase whether its work is done, never trusting the entry's own claims:
    - **If** it is done in code → set `status` to `CLOSED`, with `references` naming the evidence.
diff --git a/.codex/agents/bkit-utility-update-documentation.toml b/.codex/agents/bkit-utility-update-documentation.toml
index 9c23d0228..96c4829fe 100644
--- a/.codex/agents/bkit-utility-update-documentation.toml
+++ b/.codex/agents/bkit-utility-update-documentation.toml
@@ -41,17 +41,33 @@ developer_instructions = """
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read the `.agents/docs.md` index as the full catalog of docs to check.
+2. Read the `.agents/docs.md` index as the catalog of docs to check, then check project documentation coverage before editing:
+   - **Presence:** for each of the ten recommended topics (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`), decide whether the change touched it (relevant) or not (not applicable, with the reason). Review every relevant topic, including one the index does not list and one whose file is absent or missing.
+   - **Index accuracy:** compare each `Project Documents` row with the repository. Report a row whose file is missing, a present file with no row, and an equivalent document (an indexed file whose Scope cell reads `Equivalent to docs/{topic}.md`).
+   - **Project content:** report a document that is empty or still the shipped starter (compare it with `.bkit/templates/docs/{topic}.md`); an irrelevant topic is not a gap. A document that differs from the starter is a candidate: assess its coverage against the code, and never call it complete from a mechanical check.
+   - **Populate** a relevant absent, empty or starter-only document only within the authorized scope and only with facts you verified in the repository; copy the starter from `.bkit/templates/docs/`, fill it in, and add its row to `Project Documents`. **If** the evidence is not there → leave the document alone and report the gap.
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Never report a clean sync while a relevant topic is absent or incomplete.
 3. Per doc, always follow its `Rules` headers when making edits.
 4. Per doc, four passes in order: Sync content (gaps vs implementation) → reorganize structure (dedupe, move misplaced) → compress wording (more token-efficient) → update cross-references (inline `docs/*.md` links).
-5. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory.
-6. Collect setup tips:
+5. Record the coverage result:
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "testing",
+       "gap": "starter-only",
+       "recommendedPath": "docs/testing.md",
+       "alternativeEvidence": "The test runner configuration names the available tiers",
+       "action": "Populate the testing document with the lane graph and tier rules."
+     }
+     ```
+6. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory.
+7. Collect setup tips:
    ```bash
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" tips --workflow=utility
    ```
    - Hold stdout as `BKIT_TIPS`. It is plain text, not JSON.
    - **If** it prints nothing or exits non-zero → `BKIT_TIPS` is empty.
-7. Final return: Display the output format verbatim as the final message to the user. Do not summarise or trim it.
+8. Final return: Display the output format verbatim as the final message to the user. Do not summarise or trim it.
    - Append a `## Suggested Replies` heading.
    - Append `Would you like me to explain any of this in plain English? Then write 'yes, explain in plain english'.`
    - **If** `BKIT_TIPS` is not empty:
@@ -71,6 +87,14 @@ developer_instructions = """
 
 [For each file, which passes applied and which gaps closed. **If** none → `None`.]
 
+## Project Documentation Coverage
+
+[One row per topic: recommended path, state (populated, starter-only, empty, absent or not-applicable), index accuracy, and evidence. A coverage gap here is never `None`.]
+
+## Documentation Warnings
+
+[The `jsonl` records from step 5. **If** no gaps → omit this section.]
+
 ## Memories
 
 [Each memory rewrite: memory path, pointer. **If** none → `None`.]
diff --git a/.codex/agents/bkit-utility-update-failures.toml b/.codex/agents/bkit-utility-update-failures.toml
index 73f15044a..e786ec9fc 100644
--- a/.codex/agents/bkit-utility-update-failures.toml
+++ b/.codex/agents/bkit-utility-update-failures.toml
@@ -45,7 +45,7 @@ developer_instructions = """
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/failures.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is not `CLOSED`.
 4. For each remaining entry, check in the codebase whether its work is done, never trusting the entry's own claims:
    - For `category` `testing`, the winning row's `updates` is the flake count. Only a landed deterministic fix counts as done, never a recent green run.
diff --git a/.codex/agents/bkit-utility-update-knowledge.toml b/.codex/agents/bkit-utility-update-knowledge.toml
index 019c2c869..7de8c7d56 100644
--- a/.codex/agents/bkit-utility-update-knowledge.toml
+++ b/.codex/agents/bkit-utility-update-knowledge.toml
@@ -47,7 +47,7 @@ developer_instructions = """
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/knowledge.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is `ACTIVE` or absent.
 4. Check each remaining entry against `docs/` and the codebase, never trusting the entry's own claims. Classify it, then apply its class:
    - `HOLDS` = docs or code confirm what the entry states, and none of them state otherwise → no change.
diff --git a/.codex/agents/bkit-utility-update-roadmap.toml b/.codex/agents/bkit-utility-update-roadmap.toml
index fad969f76..b973857c5 100644
--- a/.codex/agents/bkit-utility-update-roadmap.toml
+++ b/.codex/agents/bkit-utility-update-roadmap.toml
@@ -45,7 +45,7 @@ developer_instructions = """
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Refresh `docs/roadmap.md` with `bkit roadmap fold` (the main checkout's `node_modules/.bin/bkit`):
    - **If** it fails → **STOP**.
    - Read the refreshed file in full. Its `bkit` block is a list of `FID`s.
diff --git a/.codex/agents/bkit-utility-update-tracker.toml b/.codex/agents/bkit-utility-update-tracker.toml
index fb5d28bdb..c26d74006 100644
--- a/.codex/agents/bkit-utility-update-tracker.toml
+++ b/.codex/agents/bkit-utility-update-tracker.toml
@@ -46,7 +46,7 @@ developer_instructions = """
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Read repo facts:
    ```bash
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" repo info --allow-detached
diff --git a/.codex/agents/utility-new-release.toml b/.codex/agents/utility-new-release.toml
index 1e948d1f6..42536eb53 100644
--- a/.codex/agents/utility-new-release.toml
+++ b/.codex/agents/utility-new-release.toml
@@ -28,7 +28,7 @@ developer_instructions = """
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Track your turn budget throughout.
    - **If** ~80% of it is spent → **STOP**, and report the exact state in the Output format. Say what landed, what did not, and the next action that finishes the release.
 4. Confirm the inputs: `VERSION` (semver, required) and `FID` (credit issue, optional).
diff --git a/.codex/agents/utility-pre-release-check.toml b/.codex/agents/utility-pre-release-check.toml
index 783356e5e..e18376d27 100644
--- a/.codex/agents/utility-pre-release-check.toml
+++ b/.codex/agents/utility-pre-release-check.toml
@@ -28,7 +28,7 @@ developer_instructions = """
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `docs/testing.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `docs/testing.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Throughout the audit:
    - Read the file behind every search hit before you record a finding.
    - Track your turn budget.
diff --git a/.cursor/agents/bkit-audit-generate.md b/.cursor/agents/bkit-audit-generate.md
index 92b290350..94ce651cd 100644
--- a/.cursor/agents/bkit-audit-generate.md
+++ b/.cursor/agents/bkit-audit-generate.md
@@ -112,7 +112,20 @@ tools:
      - **If** it exits non-zero → **STOP** and report the reason.
      - NEVER hand-write or edit the `bkit:anchor` block or the `bkit:outdated` line the stamp writes under it.
 3. Read every supplied input once at the start, and work from what it says, not from session memory. Do not re-read the template on every loop iteration.
-4. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+4. Read the `.agents/docs.md` index, and load the project documents the audit's surface needs, with or without a plan: `docs/architecture.md` for structure and boundaries, `docs/technology.md` for stack choices, `docs/security.md` for trust boundaries, `docs/testing.md` for test and gate rules, plus `docs/data-schema.md`, `docs/design.md`, `docs/observability.md`, `docs/deployments.md`, `docs/noise.md` or `docs/setup.md` when the audit's surface touches them.
+   - Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Mark an irrelevant topic not applicable, with the reason.
+   - Safeguards that need genuine evidence stay in force (secrets, permissions, untrusted input).
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "testing",
+       "gap": "missing",
+       "recommendedPath": "docs/testing.md",
+       "alternativeEvidence": "The CI workflow defines the lanes.",
+       "action": "Copy the testing starter and describe the project's tiers and lanes."
+     }
+     ```
 5. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
    - **If** a section has no content → `None`.
 6. Populate the template sections in template order, without changing the order. Take each section's shape from the template and every rule from this prompt, and verify every gate before you proceed:
diff --git a/.cursor/agents/bkit-build-challenge-1.md b/.cursor/agents/bkit-build-challenge-1.md
index fa1a08ee6..00b4be363 100644
--- a/.cursor/agents/bkit-build-challenge-1.md
+++ b/.cursor/agents/bkit-build-challenge-1.md
@@ -53,7 +53,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/security.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each finding: append the entry at EOF with Bash `echo {log entry} >> {output}`.
    - **If** the entry spans several lines → append it with a heredoc instead.
    - **If** any finding is `CRITICAL` → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
diff --git a/.cursor/agents/bkit-build-challenge-2.md b/.cursor/agents/bkit-build-challenge-2.md
index 690b180db..9a1deafef 100644
--- a/.cursor/agents/bkit-build-challenge-2.md
+++ b/.cursor/agents/bkit-build-challenge-2.md
@@ -57,7 +57,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/security.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/security.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each finding: append the entry at EOF with Bash `echo {log entry} >> {output}`.
    - **If** the entry spans several lines → append it with a heredoc instead.
    - **If** any finding is `CRITICAL` → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
diff --git a/.cursor/agents/bkit-build-install-skills.md b/.cursor/agents/bkit-build-install-skills.md
index 0942658a8..b2f094d9c 100644
--- a/.cursor/agents/bkit-build-install-skills.md
+++ b/.cursor/agents/bkit-build-install-skills.md
@@ -47,7 +47,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Identify the technologies that the feature requires.
 4. List the folder names under `.agents/skills/`, without reading the folders' contents. Each folder name is the identity of one installed skill when you look for gaps.
 5. Identify each skill gap: a required technology that no folder name matches.
diff --git a/.cursor/agents/bkit-build-plan-convert.md b/.cursor/agents/bkit-build-plan-convert.md
index b1dcf9239..e6a476549 100644
--- a/.cursor/agents/bkit-build-plan-convert.md
+++ b/.cursor/agents/bkit-build-plan-convert.md
@@ -60,10 +60,24 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
+   - Read the `.agents/docs.md` index, and consult the project documents the converted tasks need: always assess `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md`; add `docs/data-schema.md` when a task changes the database, `docs/design.md` for UI work, `docs/observability.md` for logging, `docs/deployments.md` for release or CI work, and `docs/noise.md` or `docs/setup.md` when a task touches them.
+     - Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+     - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Mark an irrelevant topic not applicable, with the reason.
+     - Record each topic, the path and section used, coverage, gap and action in the plan's `Documentation Consultation`, and put each `READ` / `UPDATE` line for these documents in the task that needs it.
+     - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+       ```jsonl
+       {
+         "topic": "security",
+         "gap": "starter-only",
+         "recommendedPath": "docs/security.md",
+         "alternativeEvidence": "The CI configuration defines token permissions.",
+         "action": "Populate the security document with the project's credential and permission boundaries."
+       }
+       ```
 2. Read `docs/templates/bkit-plan.md` § `Agent Execution Runbook` for the shape of a group and of a task block. The rules for filling them are the **Runbook tasks**, **TEST FIRST** and **TEST EXCEPTION** clauses above.
 3. Set up the plan file:
-   - **If** the plan file exists → keep every section except `Agent Execution Runbook` as written, and rewrite the runbook.
-   - **Else** → create the plan with `# {title} Implementation Plan`, `## Context & Goals` (the goal in 1-3 lines), `## Reuse Inventory` and `## Agent Execution Runbook`.
+   - **If** the plan file exists → keep every section except `Agent Execution Runbook` as written (add or refresh `Documentation Consultation` and `Documentation Warnings` from step 1), and rewrite the runbook.
+   - **Else** → create the plan with `# {title} Implementation Plan`, `## Context & Goals` (the goal in 1-3 lines), `## Documentation Consultation`, `## Documentation Warnings`, `## Reuse Inventory` and `## Agent Execution Runbook`.
    - In both cases, carry over every end state and test that the inputs name, in their order. You may tighten them, but never weaken them.
 4. Split the work into tasks, each one a testable change, and group the tasks in build order:
    - Keep each group within the per-group plan caps that your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all).
diff --git a/.cursor/agents/bkit-build-plan-current.md b/.cursor/agents/bkit-build-plan-current.md
index 6285386d8..b62df7131 100644
--- a/.cursor/agents/bkit-build-plan-current.md
+++ b/.cursor/agents/bkit-build-plan-current.md
@@ -52,7 +52,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each affected task: append the entry at EOF with Bash `echo {log entry} >> {output}`.
    - **If** the entry spans several lines → append it with a heredoc instead.
    - **If** any task `Broken` → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
diff --git a/.cursor/agents/bkit-build-plan-gaps-remediate.md b/.cursor/agents/bkit-build-plan-gaps-remediate.md
index ee0464f85..e14e15510 100644
--- a/.cursor/agents/bkit-build-plan-gaps-remediate.md
+++ b/.cursor/agents/bkit-build-plan-gaps-remediate.md
@@ -78,7 +78,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/testing.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Read the inputs, and find where to resume:
    - **If** Context `Mode` = `Holistic` → read the holistic verify report and every log. Each line of its `Identified Gaps Log` is one gap. Read the plan's task block of each task a gap names; no group gate log is supplied.
    - **Else** → read the group's briefs (their task blocks), the plan gaps, the group gate log when one is supplied, and every log. Each failure in the group gate log is one gap. In the logs, `DONE` = done and `BLOCKED` = blocked.
diff --git a/.cursor/agents/bkit-build-plan-tasks.md b/.cursor/agents/bkit-build-plan-tasks.md
index 918793741..4e49f6868 100644
--- a/.cursor/agents/bkit-build-plan-tasks.md
+++ b/.cursor/agents/bkit-build-plan-tasks.md
@@ -86,7 +86,7 @@ tools:
    - **If** **Create** already exists → set its `Verdict` to `PENDING` with `Edit`, and keep every log line.
    - **Else** → Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Read the supplied brief (`build-brief-{GROUP}-{n}.md`):
    - Its task blocks are the work, in order.
    - Its earlier tasks are context only.
diff --git a/.cursor/agents/bkit-build-plan-tests.md b/.cursor/agents/bkit-build-plan-tests.md
index 2d80840c3..ef646320a 100644
--- a/.cursor/agents/bkit-build-plan-tests.md
+++ b/.cursor/agents/bkit-build-plan-tests.md
@@ -65,7 +65,7 @@ tools:
    - **If** **Create** already exists → set its `Verdict` to `PENDING` with `Edit`, and keep every log line.
    - **Else** → Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Read the supplied brief (`build-brief-tests-{GROUP}-{n}.md`):
    - Its task blocks' `TEST FIRST` entries are the work, in order; the rest of each block says what the test is for.
    - Its `Derived Test Matrix rows` say what each test asserts.
diff --git a/.cursor/agents/bkit-build-plan-verify.md b/.cursor/agents/bkit-build-plan-verify.md
index 30f714222..4ae5bb752 100644
--- a/.cursor/agents/bkit-build-plan-verify.md
+++ b/.cursor/agents/bkit-build-plan-verify.md
@@ -58,7 +58,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
    - For each gap, append the entry at EOF with Bash `echo {log entry} >> {output}`.
      - **If** the entry spans several lines → append it with a heredoc instead.
diff --git a/.cursor/agents/bkit-debug-abort-handover.md b/.cursor/agents/bkit-debug-abort-handover.md
index e94488f60..981d34517 100644
--- a/.cursor/agents/bkit-debug-abort-handover.md
+++ b/.cursor/agents/bkit-debug-abort-handover.md
@@ -50,12 +50,13 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Extract `Rot Signals` from the diagnose attempts, and aggregate them into the handover: dedupe the slugs, and keep all the evidence.
 6. Extract `Out-of-Scope Recommendations` from the diagnose attempts, and aggregate them: dedupe the paths, and keep all the rationales.
-7. Append one row per failure to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
-8. Append one row per deferral to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
+7. Collect the `## Documentation Warnings` records from the diagnose, remediate and verify logs of the run, and copy them verbatim into the handover's `Documentation Warnings` section, dropping exact duplicates. Take no records from raw `*-input-*.md` files.
+8. Append one row per failure to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
+9. Append one row per deferral to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
 
 **Output format:**
 
@@ -98,6 +99,10 @@ tools:
 
 [Which option to take, and why. Initially set to `PENDING`.]
 
+## Documentation Warnings
+
+[The deduped records of the run's `## Documentation Warnings` sections, verbatim, in one `jsonl` fence with one JSON object per record. **If** none → `None`. Initially set to `PENDING`.]
+
 ## Reference Docs
 
 [The prior diagnoses, prior remediations, CI runs and observability evidence. Initially set to `PENDING`.]
diff --git a/.cursor/agents/bkit-debug-failure-diagnose.md b/.cursor/agents/bkit-debug-failure-diagnose.md
index 2623b0062..010c124df 100644
--- a/.cursor/agents/bkit-debug-failure-diagnose.md
+++ b/.cursor/agents/bkit-debug-failure-diagnose.md
@@ -60,7 +60,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory. The CI and runtime logs are the primary signal.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` and `docs/noise.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Read `Strategy` from the input Context. **If** it is missing → set `Verdict` = `FAIL` in **Create**, change no other file, and go straight to the final return. Apply the matching strategy:
    - `STANDARD` → run a targeted diagnosis.
diff --git a/.cursor/agents/bkit-debug-failure-remediate.md b/.cursor/agents/bkit-debug-failure-remediate.md
index d212c51fa..f8bd9a140 100644
--- a/.cursor/agents/bkit-debug-failure-remediate.md
+++ b/.cursor/agents/bkit-debug-failure-remediate.md
@@ -57,7 +57,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each remediation: append `DONE|BLOCKED` at EOF with Bash `echo {log entry} >> {output}`.
 5. Read `Strategy` from the input Context. **If** it is missing → set `Verdict` = `FAIL` in **Create**, change no other file, and go straight to the final return. Apply the matching strategy:
    - `STANDARD` → apply the diagnosis as written.
diff --git a/.cursor/agents/bkit-debug-failure-reproduce.md b/.cursor/agents/bkit-debug-failure-reproduce.md
index b64c12aa6..abd04f1ac 100644
--- a/.cursor/agents/bkit-debug-failure-reproduce.md
+++ b/.cursor/agents/bkit-debug-failure-reproduce.md
@@ -52,7 +52,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory. The bug report in `debug-input-*.md` is the primary signal.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Choose where the tests go:
    - Pick the lowest tier that reaches the reported behaviours: unit before integration before e2e.
    - Co-locate them with the tests that cover the affected areas, and match those tests' imports, helpers and naming.
diff --git a/.cursor/agents/bkit-debug-failure-soak.md b/.cursor/agents/bkit-debug-failure-soak.md
index 4dc3f12c4..47c7b5089 100644
--- a/.cursor/agents/bkit-debug-failure-soak.md
+++ b/.cursor/agents/bkit-debug-failure-soak.md
@@ -61,7 +61,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Decide the single next step from the accumulated context:
    - **If** the cause is unknown → instrument the suspected surface: add `[DEBUG-OBSERVE]` logging, with no behaviour change.
    - **Else**:
diff --git a/.cursor/agents/bkit-design-brainstorm-ideate-1.md b/.cursor/agents/bkit-design-brainstorm-ideate-1.md
index 9e72e8615..0011492ed 100644
--- a/.cursor/agents/bkit-design-brainstorm-ideate-1.md
+++ b/.cursor/agents/bkit-design-brainstorm-ideate-1.md
@@ -45,7 +45,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/technology.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Propose 2-3 approaches from the current constraints: existing code, minimal new infrastructure and the fastest path to ship.
    - Lead with the recommended approach.
    - Keep each approach in the existing stack, with no greenfield build and no hypothetical infrastructure.
diff --git a/.cursor/agents/bkit-design-brainstorm-ideate-2.md b/.cursor/agents/bkit-design-brainstorm-ideate-2.md
index 30fd46e1e..3a384d636 100644
--- a/.cursor/agents/bkit-design-brainstorm-ideate-2.md
+++ b/.cursor/agents/bkit-design-brainstorm-ideate-2.md
@@ -43,7 +43,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/technology.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Propose 2-3 approaches from first principles: the best long-term shape if the existing constraints did not matter.
    - Lead with the recommended approach.
    - Ignore "we already have X" as a default.
diff --git a/.cursor/agents/bkit-design-brainstorm-ideate-3.md b/.cursor/agents/bkit-design-brainstorm-ideate-3.md
index c65a58299..78bd12ba9 100644
--- a/.cursor/agents/bkit-design-brainstorm-ideate-3.md
+++ b/.cursor/agents/bkit-design-brainstorm-ideate-3.md
@@ -44,7 +44,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/security.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Propose 2-3 approaches framed by failure mode, not by happy-path shape.
    - Lead with the recommended approach.
    - For each approach, include additive risk-mitigation guidance to layer onto whichever approach is picked, not separate "safer" approaches.
diff --git a/.cursor/agents/bkit-design-generate.md b/.cursor/agents/bkit-design-generate.md
index f9b4845f5..e2503b6c7 100644
--- a/.cursor/agents/bkit-design-generate.md
+++ b/.cursor/agents/bkit-design-generate.md
@@ -57,7 +57,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Do not `cp` an existing input.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md`, `docs/technology.md` and `docs/security.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Identify the themes, complementary ideas, conflicts and related issues.
    - Layer the risk-premortem mitigations onto the selected approach. They are additive, not a separate approach.
diff --git a/.cursor/agents/bkit-design-organise.md b/.cursor/agents/bkit-design-organise.md
index d891f088c..07dc172ac 100644
--- a/.cursor/agents/bkit-design-organise.md
+++ b/.cursor/agents/bkit-design-organise.md
@@ -54,7 +54,7 @@ tools:
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" steps stub --from="<Read>" --to="<Create>" --strip-header
    ```
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Identify the decomposition boundaries: domain boundaries, organisational structure and chronological dependencies. Do not use token or context-window size as a factor.
 5. Group the design work into workstreams at the identified boundaries.
 6. For each workstream:
diff --git a/.cursor/agents/bkit-design-review-1.md b/.cursor/agents/bkit-design-review-1.md
index adaca76c5..7f0853842 100644
--- a/.cursor/agents/bkit-design-review-1.md
+++ b/.cursor/agents/bkit-design-review-1.md
@@ -58,7 +58,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/technology.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. For each major capability the design requires, search for prior art:
    - Search the repo: text search for names, strings, near-miss helpers and sibling modules, symbol references through the language server when one is configured, and `docs/capabilities.md` when present.
diff --git a/.cursor/agents/bkit-design-review-2.md b/.cursor/agents/bkit-design-review-2.md
index 503618d23..0f20ad20f 100644
--- a/.cursor/agents/bkit-design-review-2.md
+++ b/.cursor/agents/bkit-design-review-2.md
@@ -57,7 +57,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/observability.md` and `docs/deployments.md` when they are present (warn and continue if either is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/observability.md` and `docs/deployments.md` when they are present (warn and continue if either is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. For each major component or flow, enumerate its failure modes:
    - What fails: an upstream dependency, internal logic, resource exhaustion, data corruption or partial state.
diff --git a/.cursor/agents/bkit-design-spike.md b/.cursor/agents/bkit-design-spike.md
index c577ed0aa..d6294430c 100644
--- a/.cursor/agents/bkit-design-spike.md
+++ b/.cursor/agents/bkit-design-spike.md
@@ -62,7 +62,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Restate each unknown in the review's `PoC Approach` and `Unknowns & Blockers` as one claim the design depends on and a probe could disprove:
    - Order the claims by blast radius.
diff --git a/.cursor/agents/bkit-design-update.md b/.cursor/agents/bkit-design-update.md
index 9c3af1c7e..fbb045cbc 100644
--- a/.cursor/agents/bkit-design-update.md
+++ b/.cursor/agents/bkit-design-update.md
@@ -57,7 +57,7 @@ tools:
    ```
    **If** the caller names **Update** and no **Create** → skip the seed: set the `Verdict` of **Update** to `PENDING`, and apply the findings to **Update** in place wherever the steps below name **Create**.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — apply findings via `Edit` as content becomes available.
 5. Apply every `CRITICAL` item. No consensus is required. **If** findings conflict → prefer the stricter wording.
 6. Apply each `OPTIONAL` item on merit. No consensus is required. **If** it conflicts with an applied `CRITICAL` item or expands scope → skip it.
diff --git a/.cursor/agents/bkit-plan-generate.md b/.cursor/agents/bkit-plan-generate.md
index 8f9f47d08..d1d51029b 100644
--- a/.cursor/agents/bkit-plan-generate.md
+++ b/.cursor/agents/bkit-plan-generate.md
@@ -100,7 +100,21 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Take its sections from `docs/templates/bkit-plan.md`.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read the `.agents/docs.md` index, and consult the project documents the plan needs. Always assess `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md`. Consult `docs/data-schema.md` for database changes, `docs/design.md` for UI, `docs/observability.md` for logging, `docs/deployments.md` for release or CI behaviour, and `docs/noise.md` or `docs/setup.md` when relevant.
+   - Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently.
+   - Mark an irrelevant topic not applicable, with the reason.
+   - Record each topic, the path and section actually used, coverage, gap, action, alternative evidence and remaining uncertainty in `Documentation Consultation`.
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "security",
+       "gap": "starter-only",
+       "recommendedPath": "docs/security.md",
+       "alternativeEvidence": "The CI configuration defines token permissions.",
+       "action": "Populate the security document with the project's credential and permission boundaries."
+     }
+     ```
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
    - Write each section group below before you read for the next group. Do not leave the writing to a final pass.
    - **If** a section has nothing to hold → `None`.
@@ -114,6 +128,7 @@ tools:
 7. Investigation & prerequisites:
    - `Open Questions & Assumptions`.
    - `Pre-Flight / Dependencies`.
+   - `Documentation Consultation` and `Documentation Warnings`, from step 3.
 8. Design:
    - `Alternative Approaches & Recommendations`.
    - `Data Schema Integration`.
@@ -137,6 +152,7 @@ tools:
       - Keep each group and task within the plan caps your Context names (`bkit.workflows.tasks`: tasks and `TEST FIRST` tests per group, tests and test files per task).
       - Put the groups in build order: a group's `DEPENDS ON` names only tasks in earlier groups or in its own group.
       - `READ` / `UPDATE` / `DELETE` name only symbols and files you opened this session. Open an unopened one first, or leave it out.
+      - Give each task that touches an assessed topic a `READ` line for its recommended document (or the indexed equivalent), and an `UPDATE` line for each document the task changes. A gap that the task cannot close stays in `Documentation Warnings`.
       - NEVER write `TEST EXCEPTION` of your own; copy each `TEST EXCEPTION` field an input writes into its task, word for word.
     - `Verification Plan` from Test Matrix and Execution Runbook.
 
diff --git a/.cursor/agents/bkit-plan-review-1.md b/.cursor/agents/bkit-plan-review-1.md
index 099f558e2..3811063a2 100644
--- a/.cursor/agents/bkit-plan-review-1.md
+++ b/.cursor/agents/bkit-plan-review-1.md
@@ -62,7 +62,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Check that the plan reflects its source, with no drift, no omissions and no silent expansion:
    - Design-coverage: **If** a design artifact exists (`docs/plans/{YYYYMM}/{FID}-design.md`, or one the input references):
diff --git a/.cursor/agents/bkit-plan-review-2.md b/.cursor/agents/bkit-plan-review-2.md
index c315d7463..babd90a66 100644
--- a/.cursor/agents/bkit-plan-review-2.md
+++ b/.cursor/agents/bkit-plan-review-2.md
@@ -56,7 +56,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Trace the surface area of each `Agent Execution Runbook` task:
    - The files and modules it edits directly.
diff --git a/.cursor/agents/bkit-plan-scope-check.md b/.cursor/agents/bkit-plan-scope-check.md
index ad713d491..aa2ffb55c 100644
--- a/.cursor/agents/bkit-plan-scope-check.md
+++ b/.cursor/agents/bkit-plan-scope-check.md
@@ -62,7 +62,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Check that every section `docs/templates/bkit-plan.md` mandates is present and filled in. A missing or broken section → `CRITICAL`.
 6. Check the scenario sections and the open questions:
diff --git a/.cursor/agents/bkit-plan-update.md b/.cursor/agents/bkit-plan-update.md
index 859e15a08..dbff6f792 100644
--- a/.cursor/agents/bkit-plan-update.md
+++ b/.cursor/agents/bkit-plan-update.md
@@ -80,7 +80,19 @@ tools:
    ```
    **If** the caller names **Update** and no **Create** → skip the seed: set the `Verdict` of **Update** to `PENDING`, and apply the findings to **Update** in place wherever the steps below name **Create**.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read the `.agents/docs.md` index, and load the docs it lists for this task. Keep the plan's `Documentation Consultation` and `Documentation Warnings` sources as recorded.
+   - **If** a finding changes a topic the plan covers (architecture, technology, security, testing, data schema, UI, logging, release or setup) → re-consult its recommended document or indexed equivalent, update that topic's source, coverage, gap and action, and carry any new `READ` / `UPDATE` line into the task it touches.
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "security",
+       "gap": "starter-only",
+       "recommendedPath": "docs/security.md",
+       "alternativeEvidence": "The CI configuration defines token permissions.",
+       "action": "Populate the security document with the project's credential and permission boundaries."
+     }
+     ```
+   - Never drop an earlier warning the review did not resolve.
 4. Update **Create** — apply findings via `Edit` as content becomes available.
 5. Keep every `Agent Execution Runbook` task's `DONE WHEN` and `TEST FIRST` intact through the merge:
    - A critique may edit the task text around them.
diff --git a/.cursor/agents/bkit-ship-conflict-resolve.md b/.cursor/agents/bkit-ship-conflict-resolve.md
index 0c4f7b0bc..287105848 100644
--- a/.cursor/agents/bkit-ship-conflict-resolve.md
+++ b/.cursor/agents/bkit-ship-conflict-resolve.md
@@ -51,7 +51,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each substep: append the log entry at EOF with Bash `echo {log entry} >> {output}`.
 5. Confirm the merge state the caller left:
    - Record the branch head with `git rev-parse HEAD`, and append a log entry naming it.
diff --git a/.cursor/agents/bkit-ship-deferred-sweep.md b/.cursor/agents/bkit-ship-deferred-sweep.md
index fb1ee7aa7..016f9ba49 100644
--- a/.cursor/agents/bkit-ship-deferred-sweep.md
+++ b/.cursor/agents/bkit-ship-deferred-sweep.md
@@ -53,7 +53,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Settle which file is the plan, then scan it for declared out-of-scope, future-work or non-goal items:
    - **If** no plan file exists:
diff --git a/.cursor/agents/bkit-ship-update-docs.md b/.cursor/agents/bkit-ship-update-docs.md
index 19df11adc..234f46ac7 100644
--- a/.cursor/agents/bkit-ship-update-docs.md
+++ b/.cursor/agents/bkit-ship-update-docs.md
@@ -53,8 +53,12 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task.
    - Exclude `knowledge.jsonl` and `decisions.jsonl`.
+   - Check coverage before editing, for each of the ten recommended topics (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`) the shipped files touch: presence (absent or missing file), index accuracy (a row without a file, a file without a row, an `Equivalent to docs/{topic}.md` Scope cell), and project content (empty, or still the `.bkit/templates/docs/{topic}.md` starter).
+   - Mark an irrelevant topic not applicable, with the reason.
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Never report a clean sync while a relevant topic is absent or incomplete.
+   - Populate a relevant absent or starter-only document only within the ship's scope and from facts verified in the shipped files; otherwise report the gap.
 3. Read the history shipped this cycle:
    - Run `git rev-parse --is-shallow-repository`.
    - **If** it prints `true` → name the boundary commit in the output, and say that older history is unread.
@@ -65,6 +69,16 @@ tools:
 7. Fill `Pending Items` from the `ship-pending-items.md` deferral scan supplied in your Read paths, one entry per line.
    - Do not write `docs/deferrals.jsonl`.
 8. Produce the **Create** output.
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "testing",
+       "gap": "starter-only",
+       "recommendedPath": "docs/testing.md",
+       "alternativeEvidence": "The test runner configuration names the available tiers",
+       "action": "Populate the testing document with the lane graph and tier rules."
+     }
+     ```
 
 **Output format:**
 
@@ -79,6 +93,14 @@ tools:
 
 [For each file, which passes applied and which gaps closed. **If** none → `None`.]
 
+## Unresolved Coverage
+
+[Each topic that is absent, unindexed, empty, starter-only or undercovered after this run, with the evidence. Report it next to the edits above; it never makes the sync read as clean. **If** every relevant topic is covered → `None`.]
+
+## Documentation Warnings
+
+[The `jsonl` records from step 8. **If** no gaps → omit this section.]
+
 ## Pending Items
 
 [The `{FID}` matches from the `ship-pending-items.md` deferral scan, for human review. **If** no matches → `None`.]
diff --git a/.cursor/agents/bkit-utility-update-decisions.md b/.cursor/agents/bkit-utility-update-decisions.md
index d257d922d..d356f6d91 100644
--- a/.cursor/agents/bkit-utility-update-decisions.md
+++ b/.cursor/agents/bkit-utility-update-decisions.md
@@ -56,7 +56,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/decisions.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is `ACTIVE` or absent.
 4. Check each remaining entry against `docs/` and the codebase, never trusting the entry's own claims. Classify it, then apply its class:
    - `HOLDS` = docs or code confirm what the entry states, and none of them state otherwise → no change.
diff --git a/.cursor/agents/bkit-utility-update-deferrals.md b/.cursor/agents/bkit-utility-update-deferrals.md
index d747cba89..e23621e43 100644
--- a/.cursor/agents/bkit-utility-update-deferrals.md
+++ b/.cursor/agents/bkit-utility-update-deferrals.md
@@ -53,7 +53,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/deferrals.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is not `CLOSED`.
 4. For each remaining entry, check in the codebase whether its work is done, never trusting the entry's own claims:
    - **If** it is done in code → set `status` to `CLOSED`, with `references` naming the evidence.
diff --git a/.cursor/agents/bkit-utility-update-documentation.md b/.cursor/agents/bkit-utility-update-documentation.md
index 074ec20b8..4ab9d1ef8 100644
--- a/.cursor/agents/bkit-utility-update-documentation.md
+++ b/.cursor/agents/bkit-utility-update-documentation.md
@@ -51,17 +51,33 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read the `.agents/docs.md` index as the full catalog of docs to check.
+2. Read the `.agents/docs.md` index as the catalog of docs to check, then check project documentation coverage before editing:
+   - **Presence:** for each of the ten recommended topics (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`), decide whether the change touched it (relevant) or not (not applicable, with the reason). Review every relevant topic, including one the index does not list and one whose file is absent or missing.
+   - **Index accuracy:** compare each `Project Documents` row with the repository. Report a row whose file is missing, a present file with no row, and an equivalent document (an indexed file whose Scope cell reads `Equivalent to docs/{topic}.md`).
+   - **Project content:** report a document that is empty or still the shipped starter (compare it with `.bkit/templates/docs/{topic}.md`); an irrelevant topic is not a gap. A document that differs from the starter is a candidate: assess its coverage against the code, and never call it complete from a mechanical check.
+   - **Populate** a relevant absent, empty or starter-only document only within the authorized scope and only with facts you verified in the repository; copy the starter from `.bkit/templates/docs/`, fill it in, and add its row to `Project Documents`. **If** the evidence is not there → leave the document alone and report the gap.
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Never report a clean sync while a relevant topic is absent or incomplete.
 3. Per doc, always follow its `Rules` headers when making edits.
 4. Per doc, four passes in order: Sync content (gaps vs implementation) → reorganize structure (dedupe, move misplaced) → compress wording (more token-efficient) → update cross-references (inline `docs/*.md` links).
-5. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory.
-6. Collect setup tips:
+5. Record the coverage result:
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "testing",
+       "gap": "starter-only",
+       "recommendedPath": "docs/testing.md",
+       "alternativeEvidence": "The test runner configuration names the available tiers",
+       "action": "Populate the testing document with the lane graph and tier rules."
+     }
+     ```
+6. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory.
+7. Collect setup tips:
    ```bash
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" tips --workflow=utility
    ```
    - Hold stdout as `BKIT_TIPS`. It is plain text, not JSON.
    - **If** it prints nothing or exits non-zero → `BKIT_TIPS` is empty.
-7. Final return: Display the output format verbatim as the final message to the user. Do not summarise or trim it.
+8. Final return: Display the output format verbatim as the final message to the user. Do not summarise or trim it.
    - Append a `## Suggested Replies` heading.
    - Append `Would you like me to explain any of this in plain English? Then write 'yes, explain in plain english'.`
    - **If** `BKIT_TIPS` is not empty:
@@ -81,6 +97,14 @@ tools:
 
 [For each file, which passes applied and which gaps closed. **If** none → `None`.]
 
+## Project Documentation Coverage
+
+[One row per topic: recommended path, state (populated, starter-only, empty, absent or not-applicable), index accuracy, and evidence. A coverage gap here is never `None`.]
+
+## Documentation Warnings
+
+[The `jsonl` records from step 5. **If** no gaps → omit this section.]
+
 ## Memories
 
 [Each memory rewrite: memory path, pointer. **If** none → `None`.]
diff --git a/.cursor/agents/bkit-utility-update-failures.md b/.cursor/agents/bkit-utility-update-failures.md
index 2dba3120d..c74d2c60a 100644
--- a/.cursor/agents/bkit-utility-update-failures.md
+++ b/.cursor/agents/bkit-utility-update-failures.md
@@ -55,7 +55,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/failures.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is not `CLOSED`.
 4. For each remaining entry, check in the codebase whether its work is done, never trusting the entry's own claims:
    - For `category` `testing`, the winning row's `updates` is the flake count. Only a landed deterministic fix counts as done, never a recent green run.
diff --git a/.cursor/agents/bkit-utility-update-knowledge.md b/.cursor/agents/bkit-utility-update-knowledge.md
index 052ec9616..b03f41bad 100644
--- a/.cursor/agents/bkit-utility-update-knowledge.md
+++ b/.cursor/agents/bkit-utility-update-knowledge.md
@@ -57,7 +57,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/knowledge.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is `ACTIVE` or absent.
 4. Check each remaining entry against `docs/` and the codebase, never trusting the entry's own claims. Classify it, then apply its class:
    - `HOLDS` = docs or code confirm what the entry states, and none of them state otherwise → no change.
diff --git a/.cursor/agents/bkit-utility-update-roadmap.md b/.cursor/agents/bkit-utility-update-roadmap.md
index 489fe5533..4eaa3e9af 100644
--- a/.cursor/agents/bkit-utility-update-roadmap.md
+++ b/.cursor/agents/bkit-utility-update-roadmap.md
@@ -57,7 +57,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Refresh `docs/roadmap.md` with `bkit roadmap fold` (the main checkout's `node_modules/.bin/bkit`):
    - **If** it fails → **STOP**.
    - Read the refreshed file in full. Its `bkit` block is a list of `FID`s.
diff --git a/.cursor/agents/bkit-utility-update-tracker.md b/.cursor/agents/bkit-utility-update-tracker.md
index cb1527010..f98f62fb9 100644
--- a/.cursor/agents/bkit-utility-update-tracker.md
+++ b/.cursor/agents/bkit-utility-update-tracker.md
@@ -61,7 +61,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Read repo facts:
    ```bash
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" repo info --allow-detached
diff --git a/.cursor/commands/bkit-auto.md b/.cursor/commands/bkit-auto.md
index 4d1a1a45e..97198b6db 100644
--- a/.cursor/commands/bkit-auto.md
+++ b/.cursor/commands/bkit-auto.md
@@ -115,6 +115,7 @@ Auto — Phase-routed dispatch of any bkit phase
 2. `REF` is the issue as `runs context` printed it (`#N` on GitHub, the key uppercased on Linear / Jira, empty with no tracker).
    - Never pass a bare `FID` or bare number: the dispatched workflow's Step 1 stops when no issue reference matches. It never creates an issue.
 3. Invoke the matching phase skill with the `Task` tool, then exit.
+   The dispatched phase writes its own `## Documentation Warnings` in its summary. Forward that output as it is; do not collect or repeat it here.
    Route:
    - `PHASE` = `ship` → `/bkit-ship {FID} {REF}`
    - `PHASE` = `debug` → `/bkit-debug {FID} {REF} https://github.com/{OWNER_REPO}/actions/runs/{RUN_ID}` when `RUN_ID` is held; otherwise `/bkit-debug {FID} {REF}`.
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index c6457bba9..99eeb15ec 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -458,6 +458,7 @@ Build Feature — Autonomous implementation
    Context: You are a subagent in the Build phase. Write the plan in task-block form. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. **If** `CONVERT_RETRY` is held → add `Your last plan failed the plan check: {CONVERT_RETRY}. Fix only those problems.` **If** `NEWER_COMMENTS` > 0 → add `{NEWER_COMMENTS} issue comments are newer than the plan; write what they change into it.` Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Check command: `"{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"`.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md` (if present), `docs/templates/bkit-plan.md`.
    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
+   Project documents: the converted plan carries `Documentation Consultation` and `Documentation Warnings`, and each task that touches an assessed topic names its `READ` / `UPDATE` documents. Later steps read those sources and warn from applicable tasks; a missing or starter-only document warns and the run continues.
 3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
@@ -1079,6 +1080,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" workflows summary --workflow=build --file="{STATUS}" --publish={PUBLISH}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 3. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --number=15 --post --title=Summary --link-ref={BRANCH} --comment-body --message="chore({FID}): summary"
diff --git a/.cursor/commands/bkit-debug.md b/.cursor/commands/bkit-debug.md
index d97535d79..622394eb6 100644
--- a/.cursor/commands/bkit-debug.md
+++ b/.cursor/commands/bkit-debug.md
@@ -459,6 +459,7 @@ Debug Feature — Autonomous diagnosis and remediation
    Read: `{CI_SELECTION_FILE}`, `docs/plans/{YYYYMM}/logs/{FID}/debug-input-{DEBUG_ATTEMPT}.md`, the current-generation `context-*` artifacts recorded in Step 4.
    Update: Test files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-reproduce-{NORMAL_ATTEMPT}.md`.
+   Project documents: a debug run has no plan, so the subagents read the `.agents/docs.md` index and consult `docs/testing.md` for the test tiers and `docs/noise.md` for registered signal downgrades (also `docs/observability.md` or `docs/architecture.md` when they are present and relevant to the failure). A missing index or a missing, empty or starter-only document is a warning: continue from repository evidence, and record the gap in `## Documentation Warnings`. A handover keeps the unresolved warnings.
 2. Finish — commits the test:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-failure-reproduce --field=ciGeneration={CI_GENERATION} --attempt-of=debug-run-tests:current --agent=bkit-debug-failure-reproduce --artifact="docs/plans/{YYYYMM}/logs/{FID}/debug-failure-reproduce-<attempt>.md" --message="test({FID}): reproduce reported failure" --number=5 --post --title="Failure Reproduce"
@@ -602,6 +603,7 @@ Debug Feature — Autonomous diagnosis and remediation
    "{BKIT}" workflows summary --workflow=debug --file="{STATUS}"
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 2. Finish:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md --message="chore({FID}): summary" --verbose-ci-local --number=10 --post --title="Summary" --link-ref={BRANCH} --comment-body
diff --git a/.cursor/commands/bkit-design.md b/.cursor/commands/bkit-design.md
index 83c8a7258..83f465bc4 100644
--- a/.cursor/commands/bkit-design.md
+++ b/.cursor/commands/bkit-design.md
@@ -331,6 +331,7 @@ Design Feature — Autonomous design phase
    Context: You are a subagent in the Design phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Inputs carry distinct lenses. Merge across them, and do not collapse them to a consensus.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/design-input-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-1.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-2.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-3.md`, `docs/plans/{YYYYMM}/logs/{FID}/related-issues.md` (if present), `docs/plans/{YYYYMM}/{FID}-design.md` (if present — superseded design, context only, not a constraint).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md`.
+   Project documents: a design needs no plan, so the subagent reads the `.agents/docs.md` index and consults `docs/architecture.md` (boundaries and topology), plus `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/design.md`, `docs/observability.md` or `docs/deployments.md` when the design touches them. A missing index or a missing, empty or starter-only document is a warning: continue from repository evidence, and record the gap in `## Documentation Warnings` (one `jsonl` record per gap with `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action`).
 2. Finish:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=design --step=design-generate --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md --message="chore({FID}): design-generate" --number=5 --post --title="Generate Design" --link-ref=dev
@@ -450,6 +451,7 @@ Design Feature — Autonomous design phase
    "{BKIT}" workflows summary --workflow=design --file="{STATUS}"
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 3. Finish, then push with exactly one command:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=design --step=design-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/design-summary.md --message="chore({FID}): summary bkit [skip ci]" --number=10 --post --title=Summary --link-ref=dev --comment-body
diff --git a/.cursor/commands/bkit-plan.md b/.cursor/commands/bkit-plan.md
index abafa0007..f2779d5c4 100644
--- a/.cursor/commands/bkit-plan.md
+++ b/.cursor/commands/bkit-plan.md
@@ -219,6 +219,7 @@ Plan Feature — Autonomous plan generation
    Context: You are a subagent in the Plan phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. Workstreams this plan covers: {WORKSTREAMS}.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present — superseded plan, context only, not a constraint).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`.
+   Project documents: `@bkit-plan-generate` fills `Documentation Consultation` and `Documentation Warnings` in the plan. The review and apply-review steps keep those sources; a gap is a warning that continues the run, never a stop.
    **If** the draft still holds `PENDING` → invoke `@bkit-plan-generate` once more with Context `"Fill only the sections still marked PENDING and the empty groups; leave every finished section as it is."` and the plan caps and workstreams above, Read: the same inputs, Update: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`.
 2. Check the draft's groups and task blocks, and that every symbol it names exists:
    ```bash
@@ -386,6 +387,7 @@ Plan Feature — Autonomous plan generation
    "{BKIT}" workflows summary --workflow=plan --file="{STATUS}" --plan={PLAN_FINAL}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 4. Finish, then push the summary commit:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/plan-summary.md --message="chore({FID}): summary bkit [skip ci]" --number=7 --post --title=Summary --link-ref=dev --comment-body
diff --git a/.cursor/commands/bkit-ship.md b/.cursor/commands/bkit-ship.md
index 3fad05cca..eb847c299 100644
--- a/.cursor/commands/bkit-ship.md
+++ b/.cursor/commands/bkit-ship.md
@@ -460,6 +460,7 @@ Ship Feature — Autonomous merge and archive
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`), `{OUTBOX}/ship-pending-items.md`.
    Update: Doc files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md`.
+   Documentation maintenance findings (unresolved coverage and the `## Documentation Warnings` records) stay in the ship summary next to the edits; a missing document is reported and the ship continues.
 3. Wait for the subagent to complete. Then append the `SHIPPED` row to the worktree ledger, re-render the mechanical `roadmap-status` board from it, and finish the step (bookkeeping to `$BOOK_ROOT`). The block exits 1 when the row did not land:
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
@@ -470,6 +471,7 @@ Ship Feature — Autonomous merge and archive
    "{BKIT}" workflows summary --workflow=ship --file="{STATUS}" --pr={PR_NUMBER}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 5. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --commit=none --number=6 --post --title="Update Docs & Summary" --link-ref=dev --comment-body
diff --git a/.opencode/agents/bkit-audit-generate.md b/.opencode/agents/bkit-audit-generate.md
index 090ae4f3c..b4f00033d 100644
--- a/.opencode/agents/bkit-audit-generate.md
+++ b/.opencode/agents/bkit-audit-generate.md
@@ -113,7 +113,20 @@ tools:
      - **If** it exits non-zero → **STOP** and report the reason.
      - NEVER hand-write or edit the `bkit:anchor` block or the `bkit:outdated` line the stamp writes under it.
 3. Read every supplied input once at the start, and work from what it says, not from session memory. Do not re-read the template on every loop iteration.
-4. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+4. Read the `.agents/docs.md` index, and load the project documents the audit's surface needs, with or without a plan: `docs/architecture.md` for structure and boundaries, `docs/technology.md` for stack choices, `docs/security.md` for trust boundaries, `docs/testing.md` for test and gate rules, plus `docs/data-schema.md`, `docs/design.md`, `docs/observability.md`, `docs/deployments.md`, `docs/noise.md` or `docs/setup.md` when the audit's surface touches them.
+   - Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Mark an irrelevant topic not applicable, with the reason.
+   - Safeguards that need genuine evidence stay in force (secrets, permissions, untrusted input).
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "testing",
+       "gap": "missing",
+       "recommendedPath": "docs/testing.md",
+       "alternativeEvidence": "The CI workflow defines the lanes.",
+       "action": "Copy the testing starter and describe the project's tiers and lanes."
+     }
+     ```
 5. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
    - **If** a section has no content → `None`.
 6. Populate the template sections in template order, without changing the order. Take each section's shape from the template and every rule from this prompt, and verify every gate before you proceed:
diff --git a/.opencode/agents/bkit-build-challenge-1.md b/.opencode/agents/bkit-build-challenge-1.md
index 3f68a5328..18be51cbe 100644
--- a/.opencode/agents/bkit-build-challenge-1.md
+++ b/.opencode/agents/bkit-build-challenge-1.md
@@ -54,7 +54,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/security.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each finding: append the entry at EOF with Bash `echo {log entry} >> {output}`.
    - **If** the entry spans several lines → append it with a heredoc instead.
    - **If** any finding is `CRITICAL` → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
diff --git a/.opencode/agents/bkit-build-challenge-2.md b/.opencode/agents/bkit-build-challenge-2.md
index 1e788bbbe..df3e4b14d 100644
--- a/.opencode/agents/bkit-build-challenge-2.md
+++ b/.opencode/agents/bkit-build-challenge-2.md
@@ -58,7 +58,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/security.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/security.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each finding: append the entry at EOF with Bash `echo {log entry} >> {output}`.
    - **If** the entry spans several lines → append it with a heredoc instead.
    - **If** any finding is `CRITICAL` → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
diff --git a/.opencode/agents/bkit-build-install-skills.md b/.opencode/agents/bkit-build-install-skills.md
index 7c16c0e1b..236b4eaed 100644
--- a/.opencode/agents/bkit-build-install-skills.md
+++ b/.opencode/agents/bkit-build-install-skills.md
@@ -48,7 +48,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Identify the technologies that the feature requires.
 4. List the folder names under `.agents/skills/`, without reading the folders' contents. Each folder name is the identity of one installed skill when you look for gaps.
 5. Identify each skill gap: a required technology that no folder name matches.
diff --git a/.opencode/agents/bkit-build-plan-convert.md b/.opencode/agents/bkit-build-plan-convert.md
index 347ce0377..8be66808c 100644
--- a/.opencode/agents/bkit-build-plan-convert.md
+++ b/.opencode/agents/bkit-build-plan-convert.md
@@ -61,10 +61,24 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
+   - Read the `.agents/docs.md` index, and consult the project documents the converted tasks need: always assess `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md`; add `docs/data-schema.md` when a task changes the database, `docs/design.md` for UI work, `docs/observability.md` for logging, `docs/deployments.md` for release or CI work, and `docs/noise.md` or `docs/setup.md` when a task touches them.
+     - Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+     - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Mark an irrelevant topic not applicable, with the reason.
+     - Record each topic, the path and section used, coverage, gap and action in the plan's `Documentation Consultation`, and put each `READ` / `UPDATE` line for these documents in the task that needs it.
+     - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+       ```jsonl
+       {
+         "topic": "security",
+         "gap": "starter-only",
+         "recommendedPath": "docs/security.md",
+         "alternativeEvidence": "The CI configuration defines token permissions.",
+         "action": "Populate the security document with the project's credential and permission boundaries."
+       }
+       ```
 2. Read `docs/templates/bkit-plan.md` § `Agent Execution Runbook` for the shape of a group and of a task block. The rules for filling them are the **Runbook tasks**, **TEST FIRST** and **TEST EXCEPTION** clauses above.
 3. Set up the plan file:
-   - **If** the plan file exists → keep every section except `Agent Execution Runbook` as written, and rewrite the runbook.
-   - **Else** → create the plan with `# {title} Implementation Plan`, `## Context & Goals` (the goal in 1-3 lines), `## Reuse Inventory` and `## Agent Execution Runbook`.
+   - **If** the plan file exists → keep every section except `Agent Execution Runbook` as written (add or refresh `Documentation Consultation` and `Documentation Warnings` from step 1), and rewrite the runbook.
+   - **Else** → create the plan with `# {title} Implementation Plan`, `## Context & Goals` (the goal in 1-3 lines), `## Documentation Consultation`, `## Documentation Warnings`, `## Reuse Inventory` and `## Agent Execution Runbook`.
    - In both cases, carry over every end state and test that the inputs name, in their order. You may tighten them, but never weaken them.
 4. Split the work into tasks, each one a testable change, and group the tasks in build order:
    - Keep each group within the per-group plan caps that your Context names (`bkit.workflows.tasks`: tasks, and `TEST FIRST` tests in all).
diff --git a/.opencode/agents/bkit-build-plan-current.md b/.opencode/agents/bkit-build-plan-current.md
index ab99d935a..9d7d5e81b 100644
--- a/.opencode/agents/bkit-build-plan-current.md
+++ b/.opencode/agents/bkit-build-plan-current.md
@@ -53,7 +53,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each affected task: append the entry at EOF with Bash `echo {log entry} >> {output}`.
    - **If** the entry spans several lines → append it with a heredoc instead.
    - **If** any task `Broken` → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
diff --git a/.opencode/agents/bkit-build-plan-gaps-remediate.md b/.opencode/agents/bkit-build-plan-gaps-remediate.md
index 7a344ca53..dbedcec9a 100644
--- a/.opencode/agents/bkit-build-plan-gaps-remediate.md
+++ b/.opencode/agents/bkit-build-plan-gaps-remediate.md
@@ -79,7 +79,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/testing.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Read the inputs, and find where to resume:
    - **If** Context `Mode` = `Holistic` → read the holistic verify report and every log. Each line of its `Identified Gaps Log` is one gap. Read the plan's task block of each task a gap names; no group gate log is supplied.
    - **Else** → read the group's briefs (their task blocks), the plan gaps, the group gate log when one is supplied, and every log. Each failure in the group gate log is one gap. In the logs, `DONE` = done and `BLOCKED` = blocked.
diff --git a/.opencode/agents/bkit-build-plan-tasks.md b/.opencode/agents/bkit-build-plan-tasks.md
index 2975748d6..c2d1a9991 100644
--- a/.opencode/agents/bkit-build-plan-tasks.md
+++ b/.opencode/agents/bkit-build-plan-tasks.md
@@ -87,7 +87,7 @@ tools:
    - **If** **Create** already exists → set its `Verdict` to `PENDING` with `Edit`, and keep every log line.
    - **Else** → Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Read the supplied brief (`build-brief-{GROUP}-{n}.md`):
    - Its task blocks are the work, in order.
    - Its earlier tasks are context only.
diff --git a/.opencode/agents/bkit-build-plan-tests.md b/.opencode/agents/bkit-build-plan-tests.md
index 9a3032752..d7abc5f0f 100644
--- a/.opencode/agents/bkit-build-plan-tests.md
+++ b/.opencode/agents/bkit-build-plan-tests.md
@@ -66,7 +66,7 @@ tools:
    - **If** **Create** already exists → set its `Verdict` to `PENDING` with `Edit`, and keep every log line.
    - **Else** → Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Read the supplied brief (`build-brief-tests-{GROUP}-{n}.md`):
    - Its task blocks' `TEST FIRST` entries are the work, in order; the rest of each block says what the test is for.
    - Its `Derived Test Matrix rows` say what each test asserts.
diff --git a/.opencode/agents/bkit-build-plan-verify.md b/.opencode/agents/bkit-build-plan-verify.md
index e54e8b39c..b1afb0402 100644
--- a/.opencode/agents/bkit-build-plan-verify.md
+++ b/.opencode/agents/bkit-build-plan-verify.md
@@ -59,7 +59,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
    - For each gap, append the entry at EOF with Bash `echo {log entry} >> {output}`.
      - **If** the entry spans several lines → append it with a heredoc instead.
diff --git a/.opencode/agents/bkit-debug-abort-handover.md b/.opencode/agents/bkit-debug-abort-handover.md
index caebcebbb..94159e913 100644
--- a/.opencode/agents/bkit-debug-abort-handover.md
+++ b/.opencode/agents/bkit-debug-abort-handover.md
@@ -51,12 +51,13 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Extract `Rot Signals` from the diagnose attempts, and aggregate them into the handover: dedupe the slugs, and keep all the evidence.
 6. Extract `Out-of-Scope Recommendations` from the diagnose attempts, and aggregate them: dedupe the paths, and keep all the rationales.
-7. Append one row per failure to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
-8. Append one row per deferral to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
+7. Collect the `## Documentation Warnings` records from the diagnose, remediate and verify logs of the run, and copy them verbatim into the handover's `Documentation Warnings` section, dropping exact duplicates. Take no records from raw `*-input-*.md` files.
+8. Append one row per failure to `docs/failures.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
+9. Append one row per deferral to `docs/deferrals.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom), reusing the `key` of any existing entry for the same item.
 
 **Output format:**
 
@@ -99,6 +100,10 @@ tools:
 
 [Which option to take, and why. Initially set to `PENDING`.]
 
+## Documentation Warnings
+
+[The deduped records of the run's `## Documentation Warnings` sections, verbatim, in one `jsonl` fence with one JSON object per record. **If** none → `None`. Initially set to `PENDING`.]
+
 ## Reference Docs
 
 [The prior diagnoses, prior remediations, CI runs and observability evidence. Initially set to `PENDING`.]
diff --git a/.opencode/agents/bkit-debug-failure-diagnose.md b/.opencode/agents/bkit-debug-failure-diagnose.md
index 68fc4751c..e64d53b4f 100644
--- a/.opencode/agents/bkit-debug-failure-diagnose.md
+++ b/.opencode/agents/bkit-debug-failure-diagnose.md
@@ -61,7 +61,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory. The CI and runtime logs are the primary signal.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` and `docs/noise.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Read `Strategy` from the input Context. **If** it is missing → set `Verdict` = `FAIL` in **Create**, change no other file, and go straight to the final return. Apply the matching strategy:
    - `STANDARD` → run a targeted diagnosis.
diff --git a/.opencode/agents/bkit-debug-failure-remediate.md b/.opencode/agents/bkit-debug-failure-remediate.md
index 453903b2b..560df7841 100644
--- a/.opencode/agents/bkit-debug-failure-remediate.md
+++ b/.opencode/agents/bkit-debug-failure-remediate.md
@@ -58,7 +58,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each remediation: append `DONE|BLOCKED` at EOF with Bash `echo {log entry} >> {output}`.
 5. Read `Strategy` from the input Context. **If** it is missing → set `Verdict` = `FAIL` in **Create**, change no other file, and go straight to the final return. Apply the matching strategy:
    - `STANDARD` → apply the diagnosis as written.
diff --git a/.opencode/agents/bkit-debug-failure-reproduce.md b/.opencode/agents/bkit-debug-failure-reproduce.md
index 576c83808..92fc810df 100644
--- a/.opencode/agents/bkit-debug-failure-reproduce.md
+++ b/.opencode/agents/bkit-debug-failure-reproduce.md
@@ -53,7 +53,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory. The bug report in `debug-input-*.md` is the primary signal.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Choose where the tests go:
    - Pick the lowest tier that reaches the reported behaviours: unit before integration before e2e.
    - Co-locate them with the tests that cover the affected areas, and match those tests' imports, helpers and naming.
diff --git a/.opencode/agents/bkit-debug-failure-soak.md b/.opencode/agents/bkit-debug-failure-soak.md
index acb036d91..e3e3c0194 100644
--- a/.opencode/agents/bkit-debug-failure-soak.md
+++ b/.opencode/agents/bkit-debug-failure-soak.md
@@ -62,7 +62,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Decide the single next step from the accumulated context:
    - **If** the cause is unknown → instrument the suspected surface: add `[DEBUG-OBSERVE]` logging, with no behaviour change.
    - **Else**:
diff --git a/.opencode/agents/bkit-design-brainstorm-ideate-1.md b/.opencode/agents/bkit-design-brainstorm-ideate-1.md
index bf1bc3ff7..a9d6eee4f 100644
--- a/.opencode/agents/bkit-design-brainstorm-ideate-1.md
+++ b/.opencode/agents/bkit-design-brainstorm-ideate-1.md
@@ -46,7 +46,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/technology.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Propose 2-3 approaches from the current constraints: existing code, minimal new infrastructure and the fastest path to ship.
    - Lead with the recommended approach.
    - Keep each approach in the existing stack, with no greenfield build and no hypothetical infrastructure.
diff --git a/.opencode/agents/bkit-design-brainstorm-ideate-2.md b/.opencode/agents/bkit-design-brainstorm-ideate-2.md
index be073d395..4807805d8 100644
--- a/.opencode/agents/bkit-design-brainstorm-ideate-2.md
+++ b/.opencode/agents/bkit-design-brainstorm-ideate-2.md
@@ -44,7 +44,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/technology.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Propose 2-3 approaches from first principles: the best long-term shape if the existing constraints did not matter.
    - Lead with the recommended approach.
    - Ignore "we already have X" as a default.
diff --git a/.opencode/agents/bkit-design-brainstorm-ideate-3.md b/.opencode/agents/bkit-design-brainstorm-ideate-3.md
index 56e3cf896..e63482a2e 100644
--- a/.opencode/agents/bkit-design-brainstorm-ideate-3.md
+++ b/.opencode/agents/bkit-design-brainstorm-ideate-3.md
@@ -45,7 +45,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/security.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Propose 2-3 approaches framed by failure mode, not by happy-path shape.
    - Lead with the recommended approach.
    - For each approach, include additive risk-mitigation guidance to layer onto whichever approach is picked, not separate "safer" approaches.
diff --git a/.opencode/agents/bkit-design-generate.md b/.opencode/agents/bkit-design-generate.md
index 1f54008eb..ceb4fa022 100644
--- a/.opencode/agents/bkit-design-generate.md
+++ b/.opencode/agents/bkit-design-generate.md
@@ -58,7 +58,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Do not `cp` an existing input.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md`, `docs/technology.md` and `docs/security.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Identify the themes, complementary ideas, conflicts and related issues.
    - Layer the risk-premortem mitigations onto the selected approach. They are additive, not a separate approach.
diff --git a/.opencode/agents/bkit-design-organise.md b/.opencode/agents/bkit-design-organise.md
index 03b67d80f..6cc8de206 100644
--- a/.opencode/agents/bkit-design-organise.md
+++ b/.opencode/agents/bkit-design-organise.md
@@ -55,7 +55,7 @@ tools:
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" steps stub --from="<Read>" --to="<Create>" --strip-header
    ```
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Identify the decomposition boundaries: domain boundaries, organisational structure and chronological dependencies. Do not use token or context-window size as a factor.
 5. Group the design work into workstreams at the identified boundaries.
 6. For each workstream:
diff --git a/.opencode/agents/bkit-design-review-1.md b/.opencode/agents/bkit-design-review-1.md
index 10d7ef31e..c6c5bd691 100644
--- a/.opencode/agents/bkit-design-review-1.md
+++ b/.opencode/agents/bkit-design-review-1.md
@@ -59,7 +59,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` and `docs/technology.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. For each major capability the design requires, search for prior art:
    - Search the repo: text search for names, strings, near-miss helpers and sibling modules, symbol references through the language server when one is configured, and `docs/capabilities.md` when present.
diff --git a/.opencode/agents/bkit-design-review-2.md b/.opencode/agents/bkit-design-review-2.md
index 56718ff3a..c26048a9e 100644
--- a/.opencode/agents/bkit-design-review-2.md
+++ b/.opencode/agents/bkit-design-review-2.md
@@ -58,7 +58,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/observability.md` and `docs/deployments.md` when they are present (warn and continue if either is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/observability.md` and `docs/deployments.md` when they are present (warn and continue if either is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. For each major component or flow, enumerate its failure modes:
    - What fails: an upstream dependency, internal logic, resource exhaustion, data corruption or partial state.
diff --git a/.opencode/agents/bkit-design-spike.md b/.opencode/agents/bkit-design-spike.md
index 6a901f77b..467daddfc 100644
--- a/.opencode/agents/bkit-design-spike.md
+++ b/.opencode/agents/bkit-design-spike.md
@@ -63,7 +63,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Restate each unknown in the review's `PoC Approach` and `Unknowns & Blockers` as one claim the design depends on and a probe could disprove:
    - Order the claims by blast radius.
diff --git a/.opencode/agents/bkit-design-update.md b/.opencode/agents/bkit-design-update.md
index 290780df3..e427cc4ed 100644
--- a/.opencode/agents/bkit-design-update.md
+++ b/.opencode/agents/bkit-design-update.md
@@ -58,7 +58,7 @@ tools:
    ```
    **If** the caller names **Update** and no **Create** → skip the seed: set the `Verdict` of **Update** to `PENDING`, and apply the findings to **Update** in place wherever the steps below name **Create**.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — apply findings via `Edit` as content becomes available.
 5. Apply every `CRITICAL` item. No consensus is required. **If** findings conflict → prefer the stricter wording.
 6. Apply each `OPTIONAL` item on merit. No consensus is required. **If** it conflicts with an applied `CRITICAL` item or expands scope → skip it.
diff --git a/.opencode/agents/bkit-plan-generate.md b/.opencode/agents/bkit-plan-generate.md
index 9c7df0b75..355479368 100644
--- a/.opencode/agents/bkit-plan-generate.md
+++ b/.opencode/agents/bkit-plan-generate.md
@@ -101,7 +101,21 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Take its sections from `docs/templates/bkit-plan.md`.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read the `.agents/docs.md` index, and consult the project documents the plan needs. Always assess `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md`. Consult `docs/data-schema.md` for database changes, `docs/design.md` for UI, `docs/observability.md` for logging, `docs/deployments.md` for release or CI behaviour, and `docs/noise.md` or `docs/setup.md` when relevant.
+   - Read the recommended path or a valid indexed equivalent (`Equivalent to docs/{topic}.md` in its Scope cell).
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently.
+   - Mark an irrelevant topic not applicable, with the reason.
+   - Record each topic, the path and section actually used, coverage, gap, action, alternative evidence and remaining uncertainty in `Documentation Consultation`.
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "security",
+       "gap": "starter-only",
+       "recommendedPath": "docs/security.md",
+       "alternativeEvidence": "The CI configuration defines token permissions.",
+       "action": "Populate the security document with the project's credential and permission boundaries."
+     }
+     ```
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
    - Write each section group below before you read for the next group. Do not leave the writing to a final pass.
    - **If** a section has nothing to hold → `None`.
@@ -115,6 +129,7 @@ tools:
 7. Investigation & prerequisites:
    - `Open Questions & Assumptions`.
    - `Pre-Flight / Dependencies`.
+   - `Documentation Consultation` and `Documentation Warnings`, from step 3.
 8. Design:
    - `Alternative Approaches & Recommendations`.
    - `Data Schema Integration`.
@@ -138,6 +153,7 @@ tools:
       - Keep each group and task within the plan caps your Context names (`bkit.workflows.tasks`: tasks and `TEST FIRST` tests per group, tests and test files per task).
       - Put the groups in build order: a group's `DEPENDS ON` names only tasks in earlier groups or in its own group.
       - `READ` / `UPDATE` / `DELETE` name only symbols and files you opened this session. Open an unopened one first, or leave it out.
+      - Give each task that touches an assessed topic a `READ` line for its recommended document (or the indexed equivalent), and an `UPDATE` line for each document the task changes. A gap that the task cannot close stays in `Documentation Warnings`.
       - NEVER write `TEST EXCEPTION` of your own; copy each `TEST EXCEPTION` field an input writes into its task, word for word.
     - `Verification Plan` from Test Matrix and Execution Runbook.
 
diff --git a/.opencode/agents/bkit-plan-review-1.md b/.opencode/agents/bkit-plan-review-1.md
index 3c02b7099..0d2d09dc5 100644
--- a/.opencode/agents/bkit-plan-review-1.md
+++ b/.opencode/agents/bkit-plan-review-1.md
@@ -63,7 +63,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Check that the plan reflects its source, with no drift, no omissions and no silent expansion:
    - Design-coverage: **If** a design artifact exists (`docs/plans/{YYYYMM}/{FID}-design.md`, or one the input references):
diff --git a/.opencode/agents/bkit-plan-review-2.md b/.opencode/agents/bkit-plan-review-2.md
index dae685a51..7fd419110 100644
--- a/.opencode/agents/bkit-plan-review-2.md
+++ b/.opencode/agents/bkit-plan-review-2.md
@@ -57,7 +57,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/testing.md` when it is present (warn and continue if it is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Trace the surface area of each `Agent Execution Runbook` task:
    - The files and modules it edits directly.
diff --git a/.opencode/agents/bkit-plan-scope-check.md b/.opencode/agents/bkit-plan-scope-check.md
index 176b0ab22..a840065ce 100644
--- a/.opencode/agents/bkit-plan-scope-check.md
+++ b/.opencode/agents/bkit-plan-scope-check.md
@@ -63,7 +63,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task, also `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` when they are present (warn and continue if any is missing). If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Check that every section `docs/templates/bkit-plan.md` mandates is present and filled in. A missing or broken section → `CRITICAL`.
 6. Check the scenario sections and the open questions:
diff --git a/.opencode/agents/bkit-plan-update.md b/.opencode/agents/bkit-plan-update.md
index df77c4399..7d6363ae3 100644
--- a/.opencode/agents/bkit-plan-update.md
+++ b/.opencode/agents/bkit-plan-update.md
@@ -81,7 +81,19 @@ tools:
    ```
    **If** the caller names **Update** and no **Create** → skip the seed: set the `Verdict` of **Update** to `PENDING`, and apply the findings to **Update** in place wherever the steps below name **Create**.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read the `.agents/docs.md` index, and load the docs it lists for this task. Keep the plan's `Documentation Consultation` and `Documentation Warnings` sources as recorded.
+   - **If** a finding changes a topic the plan covers (architecture, technology, security, testing, data schema, UI, logging, release or setup) → re-consult its recommended document or indexed equivalent, update that topic's source, coverage, gap and action, and carry any new `READ` / `UPDATE` line into the task it touches.
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "security",
+       "gap": "starter-only",
+       "recommendedPath": "docs/security.md",
+       "alternativeEvidence": "The CI configuration defines token permissions.",
+       "action": "Populate the security document with the project's credential and permission boundaries."
+     }
+     ```
+   - Never drop an earlier warning the review did not resolve.
 4. Update **Create** — apply findings via `Edit` as content becomes available.
 5. Keep every `Agent Execution Runbook` task's `DONE WHEN` and `TEST FIRST` intact through the merge:
    - A critique may edit the task text around them.
diff --git a/.opencode/agents/bkit-ship-conflict-resolve.md b/.opencode/agents/bkit-ship-conflict-resolve.md
index bebcc953d..bc7f9cd49 100644
--- a/.opencode/agents/bkit-ship-conflict-resolve.md
+++ b/.opencode/agents/bkit-ship-conflict-resolve.md
@@ -52,7 +52,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder. Leave the log section empty.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** after each substep: append the log entry at EOF with Bash `echo {log entry} >> {output}`.
 5. Confirm the merge state the caller left:
    - Record the branch head with `git rev-parse HEAD`, and append a log entry naming it.
diff --git a/.opencode/agents/bkit-ship-deferred-sweep.md b/.opencode/agents/bkit-ship-deferred-sweep.md
index 25de83b1c..171797a7b 100644
--- a/.opencode/agents/bkit-ship-deferred-sweep.md
+++ b/.opencode/agents/bkit-ship-deferred-sweep.md
@@ -54,7 +54,7 @@ tools:
 
 1. Write the **Create** output stub, with `PENDING` in every placeholder.
 2. Read every supplied input once at the start, and work from what it says, not from session memory.
-3. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+3. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 4. Update **Create** — replace each `PENDING` via `Edit` as content becomes available.
 5. Settle which file is the plan, then scan it for declared out-of-scope, future-work or non-goal items:
    - **If** no plan file exists:
diff --git a/.opencode/agents/bkit-ship-update-docs.md b/.opencode/agents/bkit-ship-update-docs.md
index d869c6615..b58af8c19 100644
--- a/.opencode/agents/bkit-ship-update-docs.md
+++ b/.opencode/agents/bkit-ship-update-docs.md
@@ -54,8 +54,12 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task.
    - Exclude `knowledge.jsonl` and `decisions.jsonl`.
+   - Check coverage before editing, for each of the ten recommended topics (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`) the shipped files touch: presence (absent or missing file), index accuracy (a row without a file, a file without a row, an `Equivalent to docs/{topic}.md` Scope cell), and project content (empty, or still the `.bkit/templates/docs/{topic}.md` starter).
+   - Mark an irrelevant topic not applicable, with the reason.
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Never report a clean sync while a relevant topic is absent or incomplete.
+   - Populate a relevant absent or starter-only document only within the ship's scope and from facts verified in the shipped files; otherwise report the gap.
 3. Read the history shipped this cycle:
    - Run `git rev-parse --is-shallow-repository`.
    - **If** it prints `true` → name the boundary commit in the output, and say that older history is unread.
@@ -66,6 +70,16 @@ tools:
 7. Fill `Pending Items` from the `ship-pending-items.md` deferral scan supplied in your Read paths, one entry per line.
    - Do not write `docs/deferrals.jsonl`.
 8. Produce the **Create** output.
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "testing",
+       "gap": "starter-only",
+       "recommendedPath": "docs/testing.md",
+       "alternativeEvidence": "The test runner configuration names the available tiers",
+       "action": "Populate the testing document with the lane graph and tier rules."
+     }
+     ```
 
 **Output format:**
 
@@ -80,6 +94,14 @@ tools:
 
 [For each file, which passes applied and which gaps closed. **If** none → `None`.]
 
+## Unresolved Coverage
+
+[Each topic that is absent, unindexed, empty, starter-only or undercovered after this run, with the evidence. Report it next to the edits above; it never makes the sync read as clean. **If** every relevant topic is covered → `None`.]
+
+## Documentation Warnings
+
+[The `jsonl` records from step 8. **If** no gaps → omit this section.]
+
 ## Pending Items
 
 [The `{FID}` matches from the `ship-pending-items.md` deferral scan, for human review. **If** no matches → `None`.]
diff --git a/.opencode/agents/bkit-utility-update-decisions.md b/.opencode/agents/bkit-utility-update-decisions.md
index 6793ee297..41f721324 100644
--- a/.opencode/agents/bkit-utility-update-decisions.md
+++ b/.opencode/agents/bkit-utility-update-decisions.md
@@ -57,7 +57,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/decisions.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is `ACTIVE` or absent.
 4. Check each remaining entry against `docs/` and the codebase, never trusting the entry's own claims. Classify it, then apply its class:
    - `HOLDS` = docs or code confirm what the entry states, and none of them state otherwise → no change.
diff --git a/.opencode/agents/bkit-utility-update-deferrals.md b/.opencode/agents/bkit-utility-update-deferrals.md
index 69d79dd53..b5a391637 100644
--- a/.opencode/agents/bkit-utility-update-deferrals.md
+++ b/.opencode/agents/bkit-utility-update-deferrals.md
@@ -54,7 +54,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/deferrals.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is not `CLOSED`.
 4. For each remaining entry, check in the codebase whether its work is done, never trusting the entry's own claims:
    - **If** it is done in code → set `status` to `CLOSED`, with `references` naming the evidence.
diff --git a/.opencode/agents/bkit-utility-update-documentation.md b/.opencode/agents/bkit-utility-update-documentation.md
index ff863b072..5d613836d 100644
--- a/.opencode/agents/bkit-utility-update-documentation.md
+++ b/.opencode/agents/bkit-utility-update-documentation.md
@@ -52,17 +52,33 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read the `.agents/docs.md` index as the full catalog of docs to check.
+2. Read the `.agents/docs.md` index as the catalog of docs to check, then check project documentation coverage before editing:
+   - **Presence:** for each of the ten recommended topics (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`), decide whether the change touched it (relevant) or not (not applicable, with the reason). Review every relevant topic, including one the index does not list and one whose file is absent or missing.
+   - **Index accuracy:** compare each `Project Documents` row with the repository. Report a row whose file is missing, a present file with no row, and an equivalent document (an indexed file whose Scope cell reads `Equivalent to docs/{topic}.md`).
+   - **Project content:** report a document that is empty or still the shipped starter (compare it with `.bkit/templates/docs/{topic}.md`); an irrelevant topic is not a gap. A document that differs from the starter is a candidate: assess its coverage against the code, and never call it complete from a mechanical check.
+   - **Populate** a relevant absent, empty or starter-only document only within the authorized scope and only with facts you verified in the repository; copy the starter from `.bkit/templates/docs/`, fill it in, and add its row to `Project Documents`. **If** the evidence is not there → leave the document alone and report the gap.
+   - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Never report a clean sync while a relevant topic is absent or incomplete.
 3. Per doc, always follow its `Rules` headers when making edits.
 4. Per doc, four passes in order: Sync content (gaps vs implementation) → reorganize structure (dedupe, move misplaced) → compress wording (more token-efficient) → update cross-references (inline `docs/*.md` links).
-5. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory.
-6. Collect setup tips:
+5. Record the coverage result:
+   - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+     ```jsonl
+     {
+       "topic": "testing",
+       "gap": "starter-only",
+       "recommendedPath": "docs/testing.md",
+       "alternativeEvidence": "The test runner configuration names the available tiers",
+       "action": "Populate the testing document with the lane graph and tier rules."
+     }
+     ```
+6. Ensure agent memories (`MEMORY.md` / `memory/*.md`) do not duplicate content and only contain pointers (path, section, one-line hook) to relevant `docs/*.md` sections / `docs/*.jsonl` entries. **If** memory contains duplicate / stale content → update memory.
+7. Collect setup tips:
    ```bash
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" tips --workflow=utility
    ```
    - Hold stdout as `BKIT_TIPS`. It is plain text, not JSON.
    - **If** it prints nothing or exits non-zero → `BKIT_TIPS` is empty.
-7. Final return: Display the output format verbatim as the final message to the user. Do not summarise or trim it.
+8. Final return: Display the output format verbatim as the final message to the user. Do not summarise or trim it.
    - Append a `## Suggested Replies` heading.
    - Append `Would you like me to explain any of this in plain English? Then write 'yes, explain in plain english'.`
    - **If** `BKIT_TIPS` is not empty:
@@ -82,6 +98,14 @@ tools:
 
 [For each file, which passes applied and which gaps closed. **If** none → `None`.]
 
+## Project Documentation Coverage
+
+[One row per topic: recommended path, state (populated, starter-only, empty, absent or not-applicable), index accuracy, and evidence. A coverage gap here is never `None`.]
+
+## Documentation Warnings
+
+[The `jsonl` records from step 5. **If** no gaps → omit this section.]
+
 ## Memories
 
 [Each memory rewrite: memory path, pointer. **If** none → `None`.]
diff --git a/.opencode/agents/bkit-utility-update-failures.md b/.opencode/agents/bkit-utility-update-failures.md
index af3155484..758a22e68 100644
--- a/.opencode/agents/bkit-utility-update-failures.md
+++ b/.opencode/agents/bkit-utility-update-failures.md
@@ -56,7 +56,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/failures.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is not `CLOSED`.
 4. For each remaining entry, check in the codebase whether its work is done, never trusting the entry's own claims:
    - For `category` `testing`, the winning row's `updates` is the flake count. Only a landed deterministic fix counts as done, never a recent green run.
diff --git a/.opencode/agents/bkit-utility-update-knowledge.md b/.opencode/agents/bkit-utility-update-knowledge.md
index 56233935c..11b3bad66 100644
--- a/.opencode/agents/bkit-utility-update-knowledge.md
+++ b/.opencode/agents/bkit-utility-update-knowledge.md
@@ -58,7 +58,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Fold `docs/knowledge.jsonl` ledger by `key`, highest `ts` wins → read only the winning rows where `status` is `ACTIVE` or absent.
 4. Check each remaining entry against `docs/` and the codebase, never trusting the entry's own claims. Classify it, then apply its class:
    - `HOLDS` = docs or code confirm what the entry states, and none of them state otherwise → no change.
diff --git a/.opencode/agents/bkit-utility-update-roadmap.md b/.opencode/agents/bkit-utility-update-roadmap.md
index 6f069f697..f8fa5e524 100644
--- a/.opencode/agents/bkit-utility-update-roadmap.md
+++ b/.opencode/agents/bkit-utility-update-roadmap.md
@@ -58,7 +58,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/jsonl.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Refresh `docs/roadmap.md` with `bkit roadmap fold` (the main checkout's `node_modules/.bin/bkit`):
    - **If** it fails → **STOP**.
    - Read the refreshed file in full. Its `bkit` block is a list of `FID`s.
diff --git a/.opencode/agents/bkit-utility-update-tracker.md b/.opencode/agents/bkit-utility-update-tracker.md
index 7636ef769..8adb3b8dc 100644
--- a/.opencode/agents/bkit-utility-update-tracker.md
+++ b/.opencode/agents/bkit-utility-update-tracker.md
@@ -62,7 +62,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `.bkit/trackers.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Read repo facts:
    ```bash
    "$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit" repo info --allow-detached
diff --git a/.opencode/agents/utility-new-release.md b/.opencode/agents/utility-new-release.md
index f7076854d..75c06e60c 100644
--- a/.opencode/agents/utility-new-release.md
+++ b/.opencode/agents/utility-new-release.md
@@ -37,7 +37,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Track your turn budget throughout.
    - **If** ~80% of it is spent → **STOP**, and report the exact state in the Output format. Say what landed, what did not, and the next action that finishes the release.
 4. Confirm the inputs: `VERSION` (semver, required) and `FID` (credit issue, optional).
diff --git a/.opencode/agents/utility-pre-release-check.md b/.opencode/agents/utility-pre-release-check.md
index d0326a871..967bec56e 100644
--- a/.opencode/agents/utility-pre-release-check.md
+++ b/.opencode/agents/utility-pre-release-check.md
@@ -39,7 +39,7 @@ tools:
 **Process:**
 
 1. Read every supplied input once at the start, and work from what it says, not from session memory.
-2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `docs/testing.md`. Skip any listed doc that does not exist.
+2. Read `.agents/docs.md`, and load the docs it lists for this task, always including `docs/testing.md`. If the index or a listed doc is missing, empty or still the starter, warn and continue; never skip it silently.
 3. Throughout the audit:
    - Read the file behind every search hit before you record a finding.
    - Track your turn budget.
diff --git a/.opencode/commands/bkit-auto.md b/.opencode/commands/bkit-auto.md
index dbb5f0e1d..55f317c57 100644
--- a/.opencode/commands/bkit-auto.md
+++ b/.opencode/commands/bkit-auto.md
@@ -119,6 +119,7 @@ $ARGUMENTS
 2. `REF` is the issue as `runs context` printed it (`#N` on GitHub, the key uppercased on Linear / Jira, empty with no tracker).
    - Never pass a bare `FID` or bare number: the dispatched workflow's Step 1 stops when no issue reference matches. It never creates an issue.
 3. Invoke the matching phase skill with the `skill` tool, then exit.
+   The dispatched phase writes its own `## Documentation Warnings` in its summary. Forward that output as it is; do not collect or repeat it here.
    Route:
    - `PHASE` = `ship` → `/bkit-ship {FID} {REF}`
    - `PHASE` = `debug` → `/bkit-debug {FID} {REF} https://github.com/{OWNER_REPO}/actions/runs/{RUN_ID}` when `RUN_ID` is held; otherwise `/bkit-debug {FID} {REF}`.
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index bf4834e78..167ecb280 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -462,6 +462,7 @@ $ARGUMENTS
    Context: You are a subagent in the Build phase. Write the plan in task-block form. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. **If** `CONVERT_RETRY` is held → add `Your last plan failed the plan check: {CONVERT_RETRY}. Fix only those problems.` **If** `NEWER_COMMENTS` > 0 → add `{NEWER_COMMENTS} issue comments are newer than the plan; write what they change into it.` Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Check command: `"{BKIT}" tests plan-check --plan="docs/plans/{YYYYMM}/{FID}-plan.md" --existence=report --log="docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md"`.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/build-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md` (if present), `docs/templates/bkit-plan.md`.
    Create or Update: `docs/plans/{YYYYMM}/{FID}-plan.md`.
+   Project documents: the converted plan carries `Documentation Consultation` and `Documentation Warnings`, and each task that touches an assessed topic names its `READ` / `UPDATE` documents. Later steps read those sources and warn from applicable tasks; a missing or starter-only document warns and the run continues.
 3. Finish, then re-run sub-step 1 with `CONVERTED` = true:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-plan-convert --file="{STATUS}" --attempt-of=build-plan-convert:next --artifact=docs/plans/{YYYYMM}/{FID}-plan.md --optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-check.md --number=4 --post --title="Plan Convert" --message="chore({FID}): plan-convert attempt <attempt>"
@@ -1083,6 +1084,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" workflows summary --workflow=build --file="{STATUS}" --publish={PUBLISH}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 3. Finish:
    ```bash
    "{BKIT}" steps finish --workflow=build --step=build-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-summary.md --number=15 --post --title=Summary --link-ref={BRANCH} --comment-body --message="chore({FID}): summary"
diff --git a/.opencode/commands/bkit-debug.md b/.opencode/commands/bkit-debug.md
index 9edfa539a..556223ae9 100644
--- a/.opencode/commands/bkit-debug.md
+++ b/.opencode/commands/bkit-debug.md
@@ -463,6 +463,7 @@ $ARGUMENTS
    Read: `{CI_SELECTION_FILE}`, `docs/plans/{YYYYMM}/logs/{FID}/debug-input-{DEBUG_ATTEMPT}.md`, the current-generation `context-*` artifacts recorded in Step 4.
    Update: Test files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/debug-failure-reproduce-{NORMAL_ATTEMPT}.md`.
+   Project documents: a debug run has no plan, so the subagents read the `.agents/docs.md` index and consult `docs/testing.md` for the test tiers and `docs/noise.md` for registered signal downgrades (also `docs/observability.md` or `docs/architecture.md` when they are present and relevant to the failure). A missing index or a missing, empty or starter-only document is a warning: continue from repository evidence, and record the gap in `## Documentation Warnings`. A handover keeps the unresolved warnings.
 2. Finish — commits the test:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-failure-reproduce --field=ciGeneration={CI_GENERATION} --attempt-of=debug-run-tests:current --agent=bkit-debug-failure-reproduce --artifact="docs/plans/{YYYYMM}/logs/{FID}/debug-failure-reproduce-<attempt>.md" --message="test({FID}): reproduce reported failure" --number=5 --post --title="Failure Reproduce"
@@ -606,6 +607,7 @@ $ARGUMENTS
    "{BKIT}" workflows summary --workflow=debug --file="{STATUS}"
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 2. Finish:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=debug --step=debug-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md --message="chore({FID}): summary" --verbose-ci-local --number=10 --post --title="Summary" --link-ref={BRANCH} --comment-body
diff --git a/.opencode/commands/bkit-design.md b/.opencode/commands/bkit-design.md
index 8b7b62af0..f8226f19c 100644
--- a/.opencode/commands/bkit-design.md
+++ b/.opencode/commands/bkit-design.md
@@ -335,6 +335,7 @@ $ARGUMENTS
    Context: You are a subagent in the Design phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Inputs carry distinct lenses. Merge across them, and do not collapse them to a consensus.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/design-input-{RUN}.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-1.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-2.md`, `docs/plans/{YYYYMM}/logs/{FID}/design-brainstorm-ideate-3.md`, `docs/plans/{YYYYMM}/logs/{FID}/related-issues.md` (if present), `docs/plans/{YYYYMM}/{FID}-design.md` (if present — superseded design, context only, not a constraint).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md`.
+   Project documents: a design needs no plan, so the subagent reads the `.agents/docs.md` index and consults `docs/architecture.md` (boundaries and topology), plus `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/design.md`, `docs/observability.md` or `docs/deployments.md` when the design touches them. A missing index or a missing, empty or starter-only document is a warning: continue from repository evidence, and record the gap in `## Documentation Warnings` (one `jsonl` record per gap with `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action`).
 2. Finish:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=design --step=design-generate --attempt=1 --artifact=docs/plans/{YYYYMM}/logs/{FID}/design-v1-draft.md --message="chore({FID}): design-generate" --number=5 --post --title="Generate Design" --link-ref=dev
@@ -454,6 +455,7 @@ $ARGUMENTS
    "{BKIT}" workflows summary --workflow=design --file="{STATUS}"
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 3. Finish, then push with exactly one command:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=design --step=design-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/design-summary.md --message="chore({FID}): summary bkit [skip ci]" --number=10 --post --title=Summary --link-ref=dev --comment-body
diff --git a/.opencode/commands/bkit-plan.md b/.opencode/commands/bkit-plan.md
index 3a5e9f9d0..016a24110 100644
--- a/.opencode/commands/bkit-plan.md
+++ b/.opencode/commands/bkit-plan.md
@@ -223,6 +223,7 @@ $ARGUMENTS
    Context: You are a subagent in the Plan phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows. Plan caps (`bkit.workflows.tasks`): {MAX_TASKS_PER_GROUP} tasks and {MAX_TESTS_PER_GROUP} `TEST FIRST` tests per group; {MAX_TESTS_PER_TASK} tests across {MAX_TEST_FILES_PER_TASK} test files per task. Workstreams this plan covers: {WORKSTREAMS}.
    Read: `docs/plans/{YYYYMM}/logs/{FID}/plan-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present — superseded plan, context only, not a constraint).
    Create: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`.
+   Project documents: `@bkit-plan-generate` fills `Documentation Consultation` and `Documentation Warnings` in the plan. The review and apply-review steps keep those sources; a gap is a warning that continues the run, never a stop.
    **If** the draft still holds `PENDING` → invoke `@bkit-plan-generate` once more with Context `"Fill only the sections still marked PENDING and the empty groups; leave every finished section as it is."` and the plan caps and workstreams above, Read: the same inputs, Update: `docs/plans/{YYYYMM}/logs/{FID}/plan-v1-draft.md`.
 2. Check the draft's groups and task blocks, and that every symbol it names exists:
    ```bash
@@ -390,6 +391,7 @@ $ARGUMENTS
    "{BKIT}" workflows summary --workflow=plan --file="{STATUS}" --plan={PLAN_FINAL}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 4. Finish, then push the summary commit:
    ```bash
    "{BKIT}" steps finish --file="{STATUS}" --workflow=plan --step=plan-summary --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact=docs/plans/{YYYYMM}/logs/{FID}/plan-summary.md --message="chore({FID}): summary bkit [skip ci]" --number=7 --post --title=Summary --link-ref=dev --comment-body
diff --git a/.opencode/commands/bkit-ship.md b/.opencode/commands/bkit-ship.md
index 5a6f29154..80afb8f49 100644
--- a/.opencode/commands/bkit-ship.md
+++ b/.opencode/commands/bkit-ship.md
@@ -464,6 +464,7 @@ $ARGUMENTS
    Read: `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), glob `docs/plans/{YYYYMM}/logs/{FID}/*.md` (excluding `*-summary.md` / `*-handover.md`), `{OUTBOX}/ship-pending-items.md`.
    Update: Doc files.
    Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md`.
+   Documentation maintenance findings (unresolved coverage and the `## Documentation Warnings` records) stay in the ship summary next to the edits; a missing document is reported and the ship continues.
 3. Wait for the subagent to complete. Then append the `SHIPPED` row to the worktree ledger, re-render the mechanical `roadmap-status` board from it, and finish the step (bookkeeping to `$BOOK_ROOT`). The block exits 1 when the row did not land:
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
@@ -474,6 +475,7 @@ $ARGUMENTS
    "{BKIT}" workflows summary --workflow=ship --file="{STATUS}" --pr={PR_NUMBER}
    ```
    **If** exit non-zero → **Failure Path**. Hold `verdict` as `SUMMARY_VERDICT`, `failures` as `SUMMARY_FAILURES`.
+   The summary's `## Documentation Warnings` section lists this run's attributed documentation gaps once per topic and gap, with the evidence and action each agent gave. It is advisory: it changes no verdict. Show it in the final return and do not re-aggregate it.
 5. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-summary --file="{STATUS}" --attempt=1 --verdict={SUMMARY_VERDICT} --failures={SUMMARY_FAILURES} --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --commit=none --number=6 --post --title="Update Docs & Summary" --link-ref=dev --comment-body
diff --git a/DETAILS.md b/DETAILS.md
index 919cf7d4e..ce78b6161 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -60,7 +60,7 @@ Everything a senior team would otherwise write down over years, in files you can
 | [Writing rules](.bkit/authoring.md) | 50+ | How every prompt, workflow, rule and doc is worded, [matched practice by practice](.bkit/authoring.md#who-says-what) against Anthropic's, OpenAI's and Google's prompting guides, so one text works on every model. |
 | [Guardrails](.bkit/providers.md#guardrails) | 10+ hook files | Block dangerous commands and secret reads, and make agents investigate before they edit, on all five AI tools. |
 | [Audits](.bkit/pipeline.md#audits) | 35 | Security, privacy, accessibility, performance, reliability, database, LLM usage, cost and more. Findings feed straight into a plan. |
-| [Project docs](.bkit/templates/docs/) | 10 + [index](.agents/docs.md) | Architecture, data schema, deployments, testing, security, monitoring, design system, tech stack, setup, and an index telling each agent what to read at each step. |
+| [Project docs](.bkit/templates/docs/) | 10 + [index](.agents/docs.md) | Starters for architecture, data schema, deployments, testing, security, monitoring, design system, tech stack, noise and setup. You copy and own them, and bkit warns without blocking when one is missing or still the starter. An index tells each agent what to read at each step. |
 | [Templates](.bkit/templates.md) | 60+ | A full CI pipeline, cloud agents, git hooks, linters, dependency updates, secrets sync, code search, a map of your code that marks likely problems, and 10+ ready-made connectors for your platforms. |
 
 **These are the files your agents read, so they're written for agents,** to the writing rules above: short, dense, tables over prose. For day-to-day use, start with [`.bkit/README.md`](.bkit/README.md); for every agent in the order it runs, see the [pipeline reference](.bkit/pipeline.md).
@@ -345,23 +345,23 @@ config:
 flowchart LR
   %% Generated by bkit-graphify-rollup.py — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
-    n_bkit_core_engine_checks["checks<br/>253 symbols · 18 files"]
+    n_bkit_core_engine_checks["checks<br/>258 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1718 symbols · 51 files"]
+    n_bkit_core_engine_commands["commands<br/>1722 symbols · 51 files"]
     n_bkit_core_engine_install["install<br/>340 symbols · 21 files<br/>1 open finding"]
     n_bkit_core_engine_ledgers["ledgers<br/>187 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>150 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands -->|386| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|389| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|384| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|210| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|174| n_bkit_core_engine_shared
-  n_bkit_core_engine_checks -->|138| n_bkit_core_engine_shared
+  n_bkit_core_engine_checks -->|145| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|83| n_bkit_core_engine_checks
+  n_bkit_core_engine_checks -->|74| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|64| n_bkit_core_engine_render
-  n_bkit_core_engine_checks -->|56| n_bkit_core_engine_install
   n_bkit_core_engine_commands -->|42| n_bkit_core_engine_render
   n_bkit_core_engine_cli -->|34| n_bkit_core_engine_commands
   n_bkit_core_engine_checks -->|18| n_bkit_core_engine_commands
diff --git a/README.md b/README.md
index 373e23b48..34bc49483 100644
--- a/README.md
+++ b/README.md
@@ -96,7 +96,7 @@ Each phase has its own command. Start where your work needs it. [Full workflow,
 
 ## What comes with it?
 
-Installation provides the agents, workflows, rules, guardrails, audit checklists and project-document structure. It also supplies [optional templates](DETAILS.md#templates) for CI, code search, quality checks, cloud agents, service connectors and dependency updates. Copy the templates you want and adapt them to your project.
+Installation provides the agents, workflows, rules, guardrails and audit checklists, plus starter templates for ten project documents that you copy, fill in and own. bkit warns, without blocking, when a document your agents need is missing or still the starter. It also supplies [optional templates](DETAILS.md#templates) for CI, code search, quality checks, cloud agents, service connectors and dependency updates. Copy the templates you want and adapt them to your project.
 
 See [other capabilities](DETAILS.md#what-else-you-get) for switching tools, running features in parallel and keeping your tracker organised.
 
diff --git a/dist/checks/after/index.js b/dist/checks/after/index.js
index b5e8244bc..a2d57dbfa 100644
--- a/dist/checks/after/index.js
+++ b/dist/checks/after/index.js
@@ -11,7 +11,7 @@ import { detectOpencodeYmlProviderDrift } from "../../install/modules/opencode.j
 import { detectManagedDuplicate, detectManagedStale } from "./managed.js";
 import { buildCloudDashboardsAdvisory, detectCiRouterSecrets, detectGhMcpToken } from "./auth.js";
 import { buildCloudSetupAdvisory, buildGithubProjectAdvisory, buildGithubProjectTokenScopeAdvisory, buildTrackerSetupAdvisory, buildTrivyProtectionAdvisory, detectActionsWritePermissions, detectMainBranchProtection, } from "./github.js";
-import { buildDepUpdaterSetupAdvisory, detectBkitStubs, detectValeMissing, detectValePackageNotSynced, detectWorkflowLintToolsMissing, } from "./tools.js";
+import { buildDepUpdaterSetupAdvisory, detectBkitStubs, detectProjectDocs, detectValeMissing, detectValePackageNotSynced, detectWorkflowLintToolsMissing, } from "./tools.js";
 import { detectBkitCloudYmlAlwaysTrueGate, detectCiScriptsOldNames, detectCiYmlCapstoneContractDrift, detectCiYmlMissingActionlint, detectCiYmlRunInjection, detectGhaFloatingTags, detectRunLevelsNotComposed, detectTaggedTestsWithoutCiHome, detectTestIntegrationEnv, detectTurboIntegrationInputs, } from "./ci-yml.js";
 import { dropTipSilencedAdvisories, setupTipsChecklistLines, setupTipsMarkdownLines, } from "../tips/index.js";
 // ---------------------------------------------------------------------------
@@ -371,6 +371,9 @@ export function runPostInstallCheck(preflightAdvisories, cwd = process.cwd(), su
     // bkit-stub sentinels in shipped templates — one advisory per still-commented stub.
     for (const stub of detectBkitStubs(cwd))
         phase3.push(stub);
+    // Project documents (docs/*.md): missing, empty, starter-only or unindexed. Advisory only.
+    for (const f of detectProjectDocs(cwd, onSuppressed))
+        phase3.push(f);
     // turbo.json inputs for cache-replay safety (KN-24).
     for (const f of detectTurboIntegrationInputs(cwd))
         phase3.push(f);
diff --git a/dist/checks/after/tools.js b/dist/checks/after/tools.js
index 9284c03cc..ef184d4c1 100644
--- a/dist/checks/after/tools.js
+++ b/dist/checks/after/tools.js
@@ -4,6 +4,10 @@ import * as fs from "node:fs";
 import * as path from "node:path";
 import { spawnSync } from "node:child_process";
 import { readPackageJson } from "../../shared/package-json.js";
+import { readTextFile } from "../../shared/json.js";
+import { getPkgRoot } from "../../shared/package-roots.js";
+import { PROJECT_DOC_TOPICS, PROJECT_INDEX_PATH, findIndexedEquivalent, inspectRepoFile, legacyStarterTopic, normalizeLegacyText, projectDocPath, readProjectIndex, starterPath, } from "../../install/project-docs.js";
+import { isAdvisorySuppressed } from "./suppression.js";
 import { ciWorkflowPath, readBkitConfig } from "../../shared/settings.js";
 import { DEP_UPDATER_NAMES, findDepUpdaterConfigs, } from "../../shared/dep-updater.js";
 /** True when `cmd --version` runs (binary on PATH, exits 0). */
@@ -333,3 +337,153 @@ export function buildDepUpdaterSetupAdvisory(cwd) {
             'Use one updater, not both, and set `bkit.dependencies.updater` to its name (`"renovate"` or `"dependabot"`) in package.json. To silence this advisory, set it to `"none"`. See .bkit/templates.md.',
     };
 }
+// ---------------------------------------------------------------------------
+// Project documentation adoption and population
+// ---------------------------------------------------------------------------
+/** Text of a topic's current starter: the package copy first, then the consumer's own copy. */
+function readStarterText(cwd, topic) {
+    for (const base of [getPkgRoot(), cwd]) {
+        const read = readTextFile(path.join(base, starterPath(topic)));
+        if (read.ok)
+            return read.text;
+    }
+    return null;
+}
+/** True when `rel` is a repo-relative path with no parent or absolute segments. */
+function isInTreePath(rel) {
+    if (rel === "" || path.isAbsolute(rel) || /^[A-Za-z]:/.test(rel))
+        return false;
+    return !rel.split(/[\\/]/).includes("..");
+}
+/** Mechanical read of a project document: empty, an untouched starter, or a candidate. */
+function assessDocText(cwd, topic, text) {
+    if (text.trim() === "")
+        return "empty";
+    const normalized = normalizeLegacyText(text);
+    const legacy = legacyStarterTopic(text);
+    if (legacy === topic)
+        return "unpopulated";
+    const starter = readStarterText(cwd, topic);
+    if (starter !== null && normalizeLegacyText(starter) === normalized)
+        return "unpopulated";
+    // Headings, comments and rules only: nothing a project wrote.
+    const meaningful = normalized
+        .split("\n")
+        .map((l) => l.trim())
+        .filter((l) => l !== "" && !l.startsWith("#") && !/^<!--.*-->$/.test(l) && !/^[-*_|: ]+$/.test(l));
+    return meaningful.length === 0 ? "unpopulated" : "candidate";
+}
+/**
+ * Report the state of the ten project documents (`docs/architecture.md` ... `docs/setup.md`):
+ * the index missing, a document absent, empty, an untouched starter, present but unindexed, or
+ * unreadable. A document the index lists at another path (same basename, or a Scope cell
+ * `Equivalent to docs/<topic>.md`) counts for its topic. Findings are advisories only and read no
+ * file outside the repository. A document that differs from every starter is a candidate for
+ * the agent to assess; the mechanical read makes no claim about what it covers.
+ */
+export function detectProjectDocs(cwd, onSuppressed) {
+    const index = readProjectIndex(cwd);
+    const rows = index.status === "ok" ? index.rows : [];
+    const indexedPaths = new Set(rows.map((r) => r.path));
+    const missing = [];
+    const empty = [];
+    const unpopulated = [];
+    const unindexed = [];
+    const ambiguous = [];
+    for (const topic of PROJECT_DOC_TOPICS) {
+        const recommended = projectDocPath(topic);
+        const equivalent = findIndexedEquivalent(rows, topic);
+        const defaultState = inspectRepoFile(cwd, recommended);
+        let target = recommended;
+        if (defaultState === "absent") {
+            if (equivalent === null) {
+                missing.push(recommended);
+                continue;
+            }
+            target = equivalent;
+        }
+        if (!isInTreePath(target)) {
+            ambiguous.push(`${target} (${recommended}: it resolves outside the repository)`);
+            continue;
+        }
+        const state = target === recommended ? defaultState : inspectRepoFile(cwd, target);
+        if (state === "absent") {
+            missing.push(recommended);
+            continue;
+        }
+        if (state !== "regular") {
+            ambiguous.push(`${target} (${state.unsafe})`);
+            continue;
+        }
+        const read = readTextFile(path.join(cwd, target));
+        if (!read.ok) {
+            ambiguous.push(`${target} (it could not be read)`);
+            continue;
+        }
+        const assessed = assessDocText(cwd, topic, read.text);
+        if (assessed === "empty")
+            empty.push(target);
+        else if (assessed === "unpopulated")
+            unpopulated.push(target);
+        else if (index.status === "ok" && !indexedPaths.has(target))
+            unindexed.push(target);
+    }
+    const findings = [];
+    if (index.status === "missing") {
+        findings.push({
+            id: "project-docs-index-missing",
+            severity: "advisory",
+            detect: `${PROJECT_INDEX_PATH} is absent, so agents have no list of the project's own documents to consult.`,
+            action: `Run \`bkit install\` to write ${PROJECT_INDEX_PATH}, then add a row under \`## Project Documents\` for each project document you keep. Until then agents warn and fall back to repository evidence.`,
+        });
+    }
+    else if (index.status === "unreadable") {
+        ambiguous.push(`${PROJECT_INDEX_PATH} (${index.reason})`);
+    }
+    if (missing.length > 0) {
+        findings.push({
+            id: "project-docs-missing",
+            severity: "advisory",
+            detect: `No project document covers: ${missing.join(", ")}.`,
+            action: `Copy the starter for each topic you want from \`.bkit/templates/docs/\` into \`docs/\`, fill it in from the repository, and add its row to \`## Project Documents\` in ${PROJECT_INDEX_PATH}. A document you already keep elsewhere counts: index it with \`Equivalent to <recommended path>\` in its Scope cell. Skip topics that do not apply.`,
+        });
+    }
+    if (empty.length > 0) {
+        findings.push({
+            id: "project-docs-empty",
+            severity: "advisory",
+            detect: `These project documents are empty: ${empty.join(", ")}.`,
+            action: `Write the project's facts into each file, or delete it and remove its row from ${PROJECT_INDEX_PATH}. Agents cannot use an empty document.`,
+        });
+    }
+    if (unpopulated.length > 0) {
+        findings.push({
+            id: "project-docs-unpopulated",
+            severity: "advisory",
+            detect: `These project documents still hold only the shipped starter text: ${unpopulated.join(", ")}.`,
+            action: `Replace the placeholders in ${unpopulated.join(", ")} with project facts taken from the repository, or index an equivalent document that already holds them (\`Equivalent to <recommended path>\` in the Scope cell of ${PROJECT_INDEX_PATH}). Agents warn about these topics until the text changes.`,
+        });
+    }
+    if (unindexed.length > 0) {
+        findings.push({
+            id: "project-docs-unindexed",
+            severity: "advisory",
+            detect: `These project documents exist but ${PROJECT_INDEX_PATH} does not list them: ${unindexed.join(", ")}.`,
+            action: `Add a row for each to \`## Project Documents\` in ${PROJECT_INDEX_PATH}, or run \`bkit upgrade\` to register the default paths.`,
+        });
+    }
+    if (ambiguous.length > 0) {
+        findings.push({
+            id: "project-docs-ambiguous",
+            severity: "advisory",
+            detect: `bkit did not read these project documents or the index: ${ambiguous.join("; ")}.`,
+            action: `Replace each with a regular file inside the repository (no symbolic link, no \`..\` path), or repair the \`## Project Documents\` table in ${PROJECT_INDEX_PATH}. bkit changes none of them itself.`,
+        });
+    }
+    return findings.filter((f) => {
+        if (!isAdvisorySuppressed(cwd, f.id, f.severity))
+            return true;
+        onSuppressed?.({ id: f.id, scope: "." });
+        return false;
+    });
+}
diff --git a/dist/commands/workflow/summary.js b/dist/commands/workflow/summary.js
index c6784d45a..6bc4c428e 100644
--- a/dist/commands/workflow/summary.js
+++ b/dist/commands/workflow/summary.js
@@ -6,6 +6,7 @@ import { coversList } from "./plans.js";
 import { issueIdOf } from "./fids.js";
 import { parseDecisionItems } from "./decisions.js";
 import { parsePlanBlocks } from "./plan-blocks.js";
+import { parseJson } from "../../shared/json.js";
 import { challengeResolution, taskVerified } from "./summary-findings.js";
 export const SUMMARY_WORKFLOWS = ["plan", "design", "build", "debug", "ship"];
 /** Per workflow and verdict, the next command the summary recommends. */
@@ -67,6 +68,110 @@ const taskGroupOf = (r) => {
     const taskGroup = r.group ?? r.subPlan;
     return typeof taskGroup === "number" ? taskGroup : undefined;
 };
+const WARNING_FIELDS = [
+    "topic",
+    "gap",
+    "recommendedPath",
+    "alternativeEvidence",
+    "action",
+];
+/** Raw inputs (`*-input-N.md`) are untrusted: never a source of warnings. */
+const isRawInput = (rel) => /(^|\/)[a-z-]*-?input-[^/]*$/.test(rel);
+/**
+ * The top-level `{...}` objects in a fence body, in order. Each may span several lines (prettier
+ * rewrites a one-line record into that shape); braces inside strings are ignored. Text outside
+ * an object and an unterminated object are dropped.
+ */
+function jsonObjectChunks(body) {
+    const chunks = [];
+    let depth = 0;
+    let start = -1;
+    let inString = false;
+    let escaped = false;
+    for (let i = 0; i < body.length; i++) {
+        const ch = body[i];
+        if (inString) {
+            if (escaped)
+                escaped = false;
+            else if (ch === "\\")
+                escaped = true;
+            else if (ch === '"')
+                inString = false;
+            continue;
+        }
+        if (ch === '"' && depth > 0)
+            inString = true;
+        else if (ch === "{") {
+            if (depth === 0)
+                start = i;
+            depth++;
+        }
+        else if (ch === "}" && depth > 0) {
+            depth--;
+            if (depth === 0)
+                chunks.push(body.slice(start, i + 1));
+        }
+    }
+    if (depth > 0) {
+        // An unterminated object must not swallow the records after it: rescan after its first line.
+        const nl = body.indexOf("\n", start);
+        if (nl !== -1)
+            chunks.push(...jsonObjectChunks(body.slice(nl + 1)));
+    }
+    return chunks;
+}
+/**
+ * The structured records under `## Documentation Warnings` (JSON objects, one per line or pretty-printed, in a
+ * `jsonl` fence) of the run's own step artifacts, merged by normalised topic and gap. A missing
+ * section, a malformed line or a record without all five non-empty fields is skipped.
+ */
+function documentationWarnings(rows, read) {
+    const merged = new Map();
+    const seenFiles = new Set();
+    for (const row of rows) {
+        if (row.type !== "step-done")
+            continue;
+        for (const rel of artifactsOf(row)) {
+            if (!rel.endsWith(".md") || isRawInput(rel) || seenFiles.has(rel))
+                continue;
+            seenFiles.add(rel);
+            const text = read(rel);
+            if (text === null)
+                continue;
+            const section = /^## Documentation Warnings[ \t]*\r?\n([\s\S]*?)(?=^## |(?![\s\S]))/m.exec(text);
+            const fence = section === null ? null : /```jsonl[ \t]*\r?\n([\s\S]*?)```/.exec(section[1]);
+            if (fence === null)
+                continue;
+            for (const chunk of jsonObjectChunks(fence[1])) {
+                const parsed = parseJson(chunk);
+                if (!parsed.ok)
+                    continue;
+                const value = parsed.value;
+                if (typeof value !== "object" || value === null || Array.isArray(value))
+                    continue;
+                const rec = value;
+                const fields = WARNING_FIELDS.map((f) => rec[f]);
+                if (!fields.every((f) => typeof f === "string" && f.trim() !== ""))
+                    continue;
+                const [topic, gap, recommendedPath, evidence, action] = fields.map((f) => f.trim());
+                const key = `${topic.toLowerCase()}\u0000${gap.toLowerCase()}`;
+                const found = merged.get(key) ?? {
+                    topic: topic.toLowerCase(),
+                    gap: gap.toLowerCase(),
+                    recommendedPath: recommendedPath,
+                    evidence: [],
+                    actions: [],
+                };
+                if (!found.evidence.includes(evidence))
+                    found.evidence.push(evidence);
+                if (!found.actions.includes(action))
+                    found.actions.push(action);
+                merged.set(key, found);
+            }
+        }
+    }
+    return [...merged.values()];
+}
 /** The run's step rows grouped per step (and task group), in first-seen order. */
 function stepGroups(rows) {
     const groups = new Map();
@@ -341,6 +446,18 @@ export function buildSummary(input) {
     }
     if (unconfirmed.length > 0)
         out.push("", "## Ship Completed with Assumed Items", "", "Accepted without the owner and not confirmed; each is a `needs-decision` deferral.", "", ...unconfirmed.map((u) => `- ${u}`));
+    // Documentation warnings: advisory only, never part of the verdict.
+    const docWarnings = documentationWarnings(input.rows, read);
+    if (docWarnings.length > 0) {
+        out.push("", "## Documentation Warnings", "");
+        for (const w of docWarnings) {
+            out.push(`- **${w.topic}** (${w.gap}) — \`${w.recommendedPath}\``);
+            for (const e of w.evidence)
+                out.push(`  - Evidence: ${e}`);
+            for (const a of w.actions)
+                out.push(`  - Action: ${a}`);
+        }
+    }
     // Risks and action items.
     const items = [];
     for (const g of groups) {
diff --git a/docs/architecture.md b/docs/architecture.md
index 6682179ba..52c5edc00 100644
--- a/docs/architecture.md
+++ b/docs/architecture.md
@@ -26,6 +26,10 @@ The purpose-based view lives in [Components](components.md): what each major par
 
 Workflow commands pass explicit session or exact-run ownership into the shared tracker helper. Provider adapters own reading, creating and updating comments; workflows consume a common delivery result and an optional fallback file. A Git-common `bkit-outbox` directory holds optional progress source and run associations across linked worktrees. Deleting it starts a fresh progress comment without changing authoritative workflow status. Remote comment text is recognition evidence, never the source for reconstructing a body.
 
+## Project documents boundary
+
+The ten project documents (`docs/architecture.md` ... `docs/setup.md`) are consumer-owned. Their starters ship in `.bkit/templates/docs/`, which `bkit install` and `bkit upgrade` refresh as plain template copies. The installer never creates a project document. `.bkit/core/engine/install/project-docs.ts` holds the one topic catalog, the legacy-starter digests and two surgical edits: remove the ownership wrapper lines of a document an older release installed as a managed block (every other byte stays), and insert a `Project Documents` row in `.agents/docs.md` below the closing `bkit:end`. An ambiguous wrapper, an unsafe path or an unreadable index is left as it is and reported. `bkit check` and `bkit doctor` only detect: `detectProjectDocs` in `.bkit/core/engine/checks/after/tools.ts` raises advisories through the shared checklist and the `bkit.advisories.ignore` opt-out. Uninstall removes the template folder and keeps every adopted document.
+
 ## Package Boundaries
 
 ```
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 8b02f7629..8235259f3 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -84,11 +84,11 @@ Not scanned; run the rollup with `--reachability`.
 <!-- prettier-ignore -->
 | File | Evaluates at import | Downstream files | of which tests |
 | --- | --- | --- | --- |
-| `.bkit/core/engine/shared/text.ts` | `Symbol` | 199 | 119 |
-| `.bkit/core/engine/checks/after/ci-yml.ts` | `CI_SCRIPT_UNITS.flat` | 187 | 112 |
-| `.bkit/core/engine/checks/tips/index.ts` | `STAR_TIP.replace` | 187 | 112 |
-| `.bkit/core/engine/commands/workflow/branches.ts` | `LEDGERS.map` | 187 | 112 |
-| `.bkit/core/engine/commands/workflow/workflows.ts` | `Error` | 187 | 112 |
+| `.bkit/core/engine/shared/text.ts` | `Symbol` | 200 | 120 |
+| `.bkit/core/engine/checks/after/ci-yml.ts` | `CI_SCRIPT_UNITS.flat` | 188 | 113 |
+| `.bkit/core/engine/checks/tips/index.ts` | `STAR_TIP.replace` | 188 | 113 |
+| `.bkit/core/engine/commands/workflow/branches.ts` | `LEDGERS.map` | 188 | 113 |
+| `.bkit/core/engine/commands/workflow/workflows.ts` | `Error` | 188 | 113 |
 
 1 further file nothing imports, though an entrypoint is supposed to do work when it loads. In the JSON report only.
 
@@ -162,23 +162,23 @@ config:
 flowchart LR
   %% Generated by bkit-graphify-rollup.py — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
-    n_bkit_core_engine_checks["checks<br/>253 symbols · 18 files"]
+    n_bkit_core_engine_checks["checks<br/>258 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1718 symbols · 51 files"]
+    n_bkit_core_engine_commands["commands<br/>1722 symbols · 51 files"]
     n_bkit_core_engine_install["install<br/>340 symbols · 21 files<br/>1 open finding"]
     n_bkit_core_engine_ledgers["ledgers<br/>187 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
     n_bkit_core_engine_shared["shared<br/>150 symbols · 13 files<br/>1 open finding"]
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands -->|386| n_bkit_core_engine_shared
+  n_bkit_core_engine_commands -->|389| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|384| n_bkit_core_engine_ledgers
   n_bkit_core_engine_commands -->|210| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|174| n_bkit_core_engine_shared
-  n_bkit_core_engine_checks -->|138| n_bkit_core_engine_shared
+  n_bkit_core_engine_checks -->|145| n_bkit_core_engine_shared
   n_bkit_core_engine_commands -->|83| n_bkit_core_engine_checks
+  n_bkit_core_engine_checks -->|74| n_bkit_core_engine_install
   n_bkit_core_engine_install -->|64| n_bkit_core_engine_render
-  n_bkit_core_engine_checks -->|56| n_bkit_core_engine_install
   n_bkit_core_engine_commands -->|42| n_bkit_core_engine_render
   n_bkit_core_engine_cli -->|34| n_bkit_core_engine_commands
   n_bkit_core_engine_checks -->|18| n_bkit_core_engine_commands
@@ -281,7 +281,7 @@ flowchart LR
         n_bkit_core_engine_checks_after_github["github<br/>12 symbols · 1 files"]
         n_bkit_core_engine_checks_after_managed["managed<br/>11 symbols · 1 files"]
         n_bkit_core_engine_checks_after_suppression["suppression<br/>5 symbols · 1 files"]
-        n_bkit_core_engine_checks_after_tools["tools<br/>11 symbols · 1 files"]
+        n_bkit_core_engine_checks_after_tools["tools<br/>16 symbols · 1 files"]
       end
       subgraph gn_bkit_core_engine_checks_before[".bkit/core/engine/checks/before"]
         n_bkit_core_engine_checks_before_context_fetch["context-fetch<br/>20 symbols · 1 files"]
@@ -329,7 +329,7 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_status["status<br/>39 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_step_table["step-table<br/>14 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_steps["steps<br/>65 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_summary["summary<br/>21 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_summary["summary<br/>25 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_summary_findings["summary-findings<br/>6 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tasks["tasks<br/>11 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_tests["tests<br/>108 symbols · 1 files"]
@@ -404,6 +404,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_locks -->|19| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_steps -->|19| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_workflows -->|19| n_bkit_core_engine_commands_workflow_issues
+  n_bkit_core_engine_checks_after_tools -->|18| n_bkit_core_engine_install_project_docs
   n_bkit_core_engine_commands_workflow_branches -->|18| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_prs -->|18| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_commands_workflow_roadmap -->|18| n_bkit_core_engine_commands_lib
@@ -434,6 +435,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_branches -->|14| n_bkit_core_engine_commands_workflow_prs
   n_bkit_core_engine_commands_workflow_tests -->|14| n_bkit_core_engine_commands_lib
   nscripts_harvest -->|14| n_bkit_core_engine_ledgers_telemetry
+  n_bkit_core_engine_checks_after_index -->|13| n_bkit_core_engine_checks_after_tools
   n_bkit_core_engine_commands_ci_push_gate -->|13| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_context -->|13| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_run_facts -->|13| n_bkit_core_engine_ledgers_telemetry
@@ -452,7 +454,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_runtime -->|12| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_tracker -->|12| n_bkit_core_engine_shared_json
   n_bkit_core_engine_install_modules_core -->|12| n_bkit_core_engine_shared_json
-  n_bkit_core_engine_checks_after_index -->|11| n_bkit_core_engine_checks_after_tools
   n_bkit_core_engine_commands_analysis -->|11| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_install_uninstall -->|11| n_bkit_core_engine_install_write
   n_bkit_core_engine_commands_workflow_branches -->|11| n_bkit_core_engine_commands_workflow_ledgers
@@ -491,6 +492,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_run_facts -->|9| n_bkit_core_engine_shared_json
   n_bkit_core_engine_commands_workflow_runs -->|9| n_bkit_core_engine_shared_settings
   n_bkit_core_engine_commands_workflow_steps -->|9| n_bkit_core_engine_commands_workflow_tracker
+  n_bkit_core_engine_commands_workflow_summary -->|9| n_bkit_core_engine_commands_workflow_plans
   n_bkit_core_engine_commands_workflow_tasks -->|9| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_tasks -->|9| n_bkit_core_engine_commands_workflow_plan_blocks
   n_bkit_core_engine_commands_workflow_tests -->|9| n_bkit_core_engine_ledgers_status
@@ -507,7 +509,6 @@ flowchart LR
   n_bkit_core_engine_commands_install_upgrade -->|8| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_commands_workflow_challenge -->|8| n_bkit_core_engine_commands_workflow_plan_blocks
   n_bkit_core_engine_commands_workflow_context -->|8| n_bkit_core_engine_commands_workflow_tests
-  n_bkit_core_engine_commands_workflow_summary -->|8| n_bkit_core_engine_commands_workflow_plans
   n_bkit_core_engine_commands_workflow_workflows -->|8| n_bkit_core_engine_commands_workflow_worktrees
   n_bkit_core_engine_install_modules_antigravity -->|8| n_bkit_core_engine_install_write
   n_bkit_core_engine_install_modules_codex -->|8| n_bkit_core_engine_install_write
@@ -755,8 +756,8 @@ flowchart LR
   linkStyle 66 stroke:#59636e,stroke-width:6px
   linkStyle 67 stroke:#59636e,stroke-width:6px
   linkStyle 68 stroke:#59636e,stroke-width:6px
-  linkStyle 69 stroke:#59636eb3,stroke-width:3px
-  linkStyle 70 stroke:#59636eb3,stroke-width:3px
+  linkStyle 69 stroke:#59636e,stroke-width:6px
+  linkStyle 70 stroke:#59636e,stroke-width:6px
   linkStyle 71 stroke:#59636eb3,stroke-width:3px
   linkStyle 72 stroke:#59636eb3,stroke-width:3px
   linkStyle 73 stroke:#59636eb3,stroke-width:3px
@@ -823,7 +824,7 @@ flowchart LR
   linkStyle 134 stroke:#59636eb3,stroke-width:3px
   linkStyle 135 stroke:#59636eb3,stroke-width:3px
   linkStyle 136 stroke:#59636eb3,stroke-width:3px
-  linkStyle 137 stroke:#59636e80,stroke-width:2px
+  linkStyle 137 stroke:#59636eb3,stroke-width:3px
   linkStyle 138 stroke:#59636e80,stroke-width:2px
   linkStyle 139 stroke:#59636e80,stroke-width:2px
   linkStyle 140 stroke:#59636e80,stroke-width:2px
@@ -891,4 +892,5 @@ flowchart LR
   linkStyle 202 stroke:#59636e80,stroke-width:2px
   linkStyle 203 stroke:#59636e80,stroke-width:2px
   linkStyle 204 stroke:#59636e80,stroke-width:2px
+  linkStyle 205 stroke:#59636e80,stroke-width:2px
 ```
diff --git a/docs/observability.md b/docs/observability.md
index d603f7544..12c051c03 100644
--- a/docs/observability.md
+++ b/docs/observability.md
@@ -193,6 +193,26 @@ Post-install findings via `formatChecklist(ctx.advisories)` (`.bkit/core/engine/
 - Advisories (Phase 1 + Phase 3) → numbered checklist after install.
 - `bkit check` (dry-run) → Phase 1 + Phase 3 advisories (read-only); exit 1 on Tier-1 / Tier-2 drift. No writes.
 
+## Project documentation advisories
+
+`detectProjectDocs` (`checks/after/tools.ts`) runs in Phase 3 and returns advisories only; none blocks install, upgrade, check or doctor. A document an indexed row covers at another path (same basename, or a Scope cell `Equivalent to docs/{topic}.md`) counts for its topic. The detector never reads a symbolic link or a path outside the repository.
+
+<!-- prettier-ignore -->
+| Finding id | Raised when |
+| --- | --- |
+| `project-docs-index-missing` | `.agents/docs.md` is absent |
+| `project-docs-missing` | A recommended topic has no document and no indexed equivalent |
+| `project-docs-empty` | A covering document is empty |
+| `project-docs-unpopulated` | A covering document is still a current or legacy starter, or only headings |
+| `project-docs-unindexed` | A populated candidate exists but the index does not list it |
+| `project-docs-ambiguous` | An index row or target is unsafe, unreadable or malformed |
+
+A document that differs from every starter is a candidate for agent assessment; the check does not claim it is complete.
+
+## Phase documentation warnings
+
+Agents that consult project documents write gaps as `jsonl` records (`topic`, `gap`, `recommendedPath`, `alternativeEvidence`, `action`) under `## Documentation Warnings`. `bkit workflows summary` (`commands/workflow/summary.ts`) reads those records only from the active run's step artifacts, skips raw `*-input-*` files and malformed lines, merges records by topic and gap, and prints one `## Documentation Warnings` section in the summary. The section is advisory and never changes the verdict or failure count.
+
 ## Phase 3 Credential + Migration Findings
 
 Phase 3 emits credential findings as advisory text. Finding ids = audit trail:
diff --git a/docs/templates/bkit-audit-adoption.md b/docs/templates/bkit-audit-adoption.md
index 66aee6795..6943c4f0c 100644
--- a/docs/templates/bkit-audit-adoption.md
+++ b/docs/templates/bkit-audit-adoption.md
@@ -28,10 +28,10 @@ bkit ships three folders. A file's path inside its folder is the path it lands a

<!-- prettier-ignore -->
 | Package folder | Install does | Repo gets |
 | --- | --- | --- |
 | `.bkit/core/` | Writes its files and keeps them current. It never writes `engine/`, `workflows/` or `prompts/` as they are: workflows and prompts render to host agent and command copies | Whole files, managed blocks, hooks, reference docs in `.bkit/`, audit and plan templates |
-| `.bkit/shared/` | Writes its files and keeps them current | bkit blocks and keys inside files you also edit (`docs/*.md`, `.gitignore`, settings, tool-server config) |
+| `.bkit/shared/` | Writes its files and keeps them current | bkit blocks and keys inside files you also edit (`.agents/docs.md`, `.gitignore`, settings, tool-server config) |
 | `.bkit/templates/` | Never writes them into the repo. It keeps a raw copy at `.bkit/templates/`, and `bkit upgrade` lists the changed paths | Nothing until you copy one and own it |
 
-`bkit check` proves that the written files match the package. Nothing proves the rest: a template never copied, a copy whose tool never runs, a written doc that holds only bkit's block, or a shipped audit never run. The failure this audit targets is a shipped piece that would have caught something but sits unused or half-wired, while every check stays green. Examples: `.husky/pre-push` was never copied, so tests run only in CI; `.lintstagedrc.json` was copied, but `pre-commit` never calls lint-staged; `{{NODE_VERSION}}` was left raw in `bkit-ci.yml`; `bkit-cloud.yml` waits on a workflow name that no longer exists; `docs/security.md` holds bkit's block and nothing else; `bkit-audit-security` was never run; or the install is three releases behind, with hand edits inside managed blocks.
+`bkit check` proves that the written files match the package. Nothing proves the rest: a template never copied, a copy whose tool never runs, a project document (`docs/*.md`) never copied from its starter or left as the untouched starter, or a shipped audit never run. The failure this audit targets is a shipped piece that would have caught something but sits unused or half-wired, while every check stays green. Examples: `.husky/pre-push` was never copied, so tests run only in CI; `.lintstagedrc.json` was copied, but `pre-commit` never calls lint-staged; `{{NODE_VERSION}}` was left raw in `bkit-ci.yml`; `bkit-cloud.yml` waits on a workflow name that no longer exists; `docs/security.md` is still the starter text, or the document exists but `Project Documents` does not list it; `bkit-audit-security` was never run; or the install is three releases behind, with hand edits inside managed blocks.
 
 **Applies when:** `.bkit/version` is present. **If** it is absent → write one `N/A` row with its evidence, and never report the surface as "clean".
 
@@ -98,7 +98,25 @@ bkit ships three folders. A file's path inside its folder is the path it lands a
 - [ ] **Step 3 — Version:** Compare `pinnedVersion`, the installed package and the registry latest. **If** pinned != installed → the package was bumped without `bkit upgrade`. **If** the repo is behind → record the release count, the release-note changes that touch this repo, and the template paths changed since the pinned version. **Done when:** `Version` names all three versions and every relevant release-note change.
 - [ ] **Step 4 — Check and Doctor:** Run `bkit check`, and record its exit code and the cause of each drift line. Run `bkit doctor`, and mark each advisory adopt, reject (saying why) or not applicable. Carry the previous report's rejects forward, and re-raise one only when the advisory text changed. **Done when:** `Check and Doctor` holds one row per drift line and per advisory.
 - [ ] **Step 5 — Hosts:** Compare the agent hosts in use with the bkit hosts installed. Find the hosts in use from the repo's config directories and from team use. Use the `Hosts` section of the newest `bkit-audit-agents` report as a cross-check, not as the source. For each installed host, check for one agent copy per `core/prompts/` source, one command copy per `core/workflows/` source, and every `core/` hook file present, executable and wired in that host's settings. Record these as findings: a host in use with no bkit install, because agents there run without bkit gates; a missing or extra copy; and a hook file present but unwired, or wired but absent. Whether hooks fire and agree across hosts goes to `bkit-audit-agents`. **Done when:** `Hosts` holds one row per host: in use · installed · agent copies · command copies · hooks wired.
-- [ ] **Step 6 — Written Files:** (a) Check that every `bkit:start` / `bkit:end` block and owned key is untouched (the Step 4 drift). **If** one holds a hand edit → the fix moves the edit below `bkit:end` or to `Project Instructions`. **If** the defect is in what bkit shipped → the fix is upstream in bkit. (b) In each file bkit shares with you (`AGENTS.md`, `CLAUDE.md`, `.agents/*.md`, `.gitignore`, `.gitattributes`, settings, tool-server config), check that your part is present for every block that expects one. A shared file that holds only bkit's block is unadopted. The ten project documents belong to you, so check them against their starters in `.bkit/templates/docs/` and `Project Documents` in `.agents/docs.md`. **If** `.bkit/.env.example` exists → check that `.bkit/.env` is present and git-ignored, and that every listed key is set (names only). **If** bkit wrote a tracker or tool-server entry → check that the credential env var it names is set. Whether your part is true goes to `bkit-audit-documentation`. **Done when:** `Written Files` holds one row per shared file: block untouched · your part present · verdict.
+- [ ] **Step 6 — Written Files:** (a) Check that every `bkit:start` / `bkit:end` block and owned key is untouched (the Step 4 drift). **If** one holds a hand edit → the fix moves the edit below `bkit:end` or to `Project Instructions`. **If** the defect is in what bkit shipped → the fix is upstream in bkit. (b) In each file bkit shares with you (`AGENTS.md`, `CLAUDE.md`, `.agents/*.md`, `.gitignore`, `.gitattributes`, settings, tool-server config), check that your part is present for every block that expects one. A shared file that holds only bkit's block is unadopted. The ten project documents belong to you, so check them against their starters in `.bkit/templates/docs/` and `Project Documents` in `.agents/docs.md`, topic by topic:
+  - **Presence:** a relevant topic with no file (absent or missing) is a finding. An indexed equivalent document counts (`Equivalent to docs/{topic}.md` in its Scope cell).
+  - **Index accuracy:** a file with no row, and a row with no file, are findings.
+  - **Content:** an empty file, or a file that still matches its starter, is a finding; a file that differs is a candidate for assessment, never proof of coverage. A topic that does not apply (no UI, no database) is irrelevant and recorded as not applicable with the reason.
+  - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Never mark the surface adopted.
+  - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+
+    ```jsonl
+    {
+      "topic": "testing",
+      "gap": "starter-only",
+      "recommendedPath": "docs/testing.md",
+      "alternativeEvidence": "CI lanes are defined in the bkit CI workflow.",
+      "action": "Populate the testing document with the project's tiers and lanes."
+    }
+    ```
+
+  **If** `.bkit/.env.example` exists → check that `.bkit/.env` is present and git-ignored, and that every listed key is set (names only). **If** bkit wrote a tracker or tool-server entry → check that the credential env var it names is set. Whether your part is true goes to `bkit-audit-documentation`. **Done when:** `Written Files` holds one row per shared file and per project document topic: block untouched · your part present · state (populated, starter-only, empty, absent or not applicable) · verdict.
+
 - [ ] **Step 7 — Audits:** For each `docs/templates/bkit-audit-*.md`, record whether its `**Applies when:**` is met, yes or no, with evidence; its `**Cadence:**`; and its newest report under `docs/audits/` by commit date. An audit never run is due, by the same rule as `bkit-utility-update-roadmap`. An `N/A` report with evidence counts as a run. Record these as findings: an audit that applies and was never run; an audit overdue by more than one cadence; and `Process Improvements` `Project` edits that a report proposed and that are absent from that template's `Project Instructions`. **Done when:** `Audits` holds one row per template: applies · cadence · last run · overdue by · verdict.
 - [ ] **Step 8 — Adoption:** Join each file in the package's `templates/` to `.bkit/templates.md` § Contract.
   - **If** a file is missing from the Contract → the fix is an upstream bkit doc fix.
@@ -155,6 +173,12 @@ Within a severity, list missing gates first, then unwired copies, then drift.
 
 **If** the run finds nothing → write one row: `None`.
 
+## Documentation Warnings
+
+PENDING
+
+Write `None` when the adoption check found no project-document gap; the records of Step 6 go here otherwise.
+
 ## Report
 
 ### Summary
diff --git a/docs/templates/bkit-audit-database.md b/docs/templates/bkit-audit-database.md
index 78caa5abb..e6dd00b49 100644
--- a/docs/templates/bkit-audit-database.md
+++ b/docs/templates/bkit-audit-database.md
@@ -41,7 +41,7 @@ Migrations and integration tests exercise queries, but neither checks that privi
 - Platform serverless connection guidance.
 - DB routine-maintenance docs, edition = hosted major (e.g., PostgreSQL Routine Database Maintenance Tasks).
 - Safe-migration rule set (e.g., Squawk); record version.
-- bkit block of `docs/setup.md` (bkit version from `.bkit/version`): Rules
+- The project's `docs/setup.md` (local database setup and reset) and `docs/data-schema.md` (documented schema), when present; a missing or starter-only document is a warning, not a stop.
 
 ### Scope
 
diff --git a/docs/templates/bkit-audit-documentation.md b/docs/templates/bkit-audit-documentation.md
index 66e5826b7..528b4eb68 100644
--- a/docs/templates/bkit-audit-documentation.md
+++ b/docs/templates/bkit-audit-documentation.md
@@ -88,7 +88,26 @@ The failure this audit targets is a claim the code has left behind. Examples: a
 
 - [ ] **Step 1 — Previous Run:** **Done when:** `Previous Run` holds the closure rate, or the run is marked baseline.
 - [ ] **Step 2 — Scope:** **If** there are no live docs → write one `N/A` row with evidence, then **STOP**. Otherwise take every live doc, and rank them by drift: for each live doc, count the commits to the repo paths it cites since the doc last changed, and add a column for the cited paths that no longer resolve. Record the ranking. Start from an up-to-date default branch with a clean `git status`. Historical records are citers. A pointer in one that leads nowhere is a finding, fixed at the target. A stale fact inside one is history, not a defect. **Done when:** `Scope` holds every live doc and the drift ranking.
-- [ ] **Step 3 — Catalogue:** Check `.agents/docs.md`. Every file on disk under `docs/`, outside `plans/`, `archive/` and `audits/`, has a row, and every row's file exists. No doc is listed twice. Two docs on one topic is a bug, and that includes one doc in both tables with different reading columns. Each row's one-line scope still matches the doc. The root `README.md` works as the entry point: it says what the project is, links the setup doc, the architecture doc and `.agents/docs.md`, and says how to report a security issue. A missing community-health file with no README substitute is a finding. **Done when:** `Catalogue` names every mismatch, and every clean check.
+- [ ] **Step 3 — Catalogue:** Check `.agents/docs.md`. Every file on disk under `docs/`, outside `plans/`, `archive/` and `audits/`, has a row, and every row's file exists. No doc is listed twice. Two docs on one topic is a bug, and that includes one doc in both tables with different reading columns. Each row's one-line scope still matches the doc. The root `README.md` works as the entry point: it says what the project is, links the setup doc, the architecture doc and `.agents/docs.md`, and says how to report a security issue. A missing community-health file with no README substitute is a finding. Then check the project's own documentation, topic by topic, for the ten recommended documents (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`) and `docs/components.md` when the project has shared UI components:
+  - **Presence:** a topic the project needs with no file (absent or missing) is a finding. An equivalent document counts when its `Project Documents` row names the recommended path in its Scope cell (`Equivalent to docs/{topic}.md`).
+  - **Index accuracy:** a present file with no `Project Documents` row, and a row whose file is missing, are findings.
+  - **Project content:** compare each file with `.bkit/templates/docs/{topic}.md`. An empty file or one that still matches the starter is a finding. A file that differs is a candidate: read it against the code and name the undercovered topics. Never call a topic covered from a mechanical comparison alone.
+  - **Not applicable:** a topic the project does not need (for example `docs/design.md` for a project with no UI) is irrelevant and recorded as not applicable with the reason. Absence, incomplete coverage and an irrelevant topic are three different outcomes; report each one apart.
+  - **If** the index or a document is missing, empty or still the starter → warn and continue from repository evidence; never skip the topic silently. Never report the surface as clean.
+  - Write each gap as one JSON object per line in a fenced `jsonl` block under `## Documentation Warnings`, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action` (all non-empty; `"None available"` when no alternative evidence exists):
+
+    ```jsonl
+    {
+      "topic": "security",
+      "gap": "starter-only",
+      "recommendedPath": "docs/security.md",
+      "alternativeEvidence": "The CI configuration defines token permissions.",
+      "action": "Populate the security document with the project's credential and permission boundaries."
+    }
+    ```
+
+  **Done when:** `Catalogue` names every mismatch and every clean check, and `Project Documentation` holds one row per topic: path, state (populated, starter-only, empty, absent or not applicable), index accuracy and evidence.
+
 - [ ] **Step 4 — Mechanical:** Run prose lint, the format check and the managed-block check. Then:
   - Check that every backticked repo path in a live doc exists, and that every `*.md` name in a live doc resolves, backticked or not. The output is candidates. A path named on purpose as removed is not a finding. A path that moved is a finding. Section anchors and `file:line` wait for `Claims`.
   - Check relative links and heading anchors offline across every doc, plans and archive included, because they are citers. Then check external URLs in live docs, with a cache. The anchor builder must match the host (e.g., GitHub). Open a failed fragment before calling it broken. The path check cannot see Markdown links.
@@ -190,6 +209,12 @@ Within a severity, list destructive steps and contradictions first.
 
 **If** the run finds nothing → write one row: `None`.
 
+## Documentation Warnings
+
+PENDING
+
+**If** every topic is covered and indexed → write `None`; Step 3's records belong in this section.
+
 ## Report
 
 ### Summary
@@ -208,6 +233,10 @@ PENDING
 
 PENDING
 
+### Project Documentation
+
+PENDING
+
 ### Mechanical
 
 PENDING
@@ -278,6 +307,7 @@ PENDING
 ### 🔒 Gate 3: Report Check
 
 - [ ] **No placeholders:** no `PENDING` is left.
+- [ ] **Project documents:** `Project Documentation` has a row for every topic, and no absent, starter-only or undercovered topic reads as clean.
 - [ ] **Summary:** `Summary` gives the count per severity.
 - [ ] **Series:** the report shows load size, and setup-walk times when the walk ran, beside the previous report's numbers, or marks the run as baseline.
 - [ ] **Writes:** this run changed only this report, the template's `Project Instructions` and its own `docs/failures.jsonl` rows.
diff --git a/docs/templates/bkit-plan.md b/docs/templates/bkit-plan.md
index a3d3cf988..544982cad 100644
--- a/docs/templates/bkit-plan.md
+++ b/docs/templates/bkit-plan.md
@@ -158,7 +158,7 @@ _e.g.,_ **WHEN** a user submits the form with a valid file **→ THEN** it is qu
 - [ ] **Existing-Solution Search (reuse over duplicate):** the in-repo, dependency and ecosystem searches are recorded in `Reuse Inventory`.
 - [ ] **User Context:** access to the files is confirmed, and missing user information is requested.
 - [ ] **Project Context:** the relevant `docs/knowledge.jsonl` and `docs/decisions.jsonl` rows are read.
-- [ ] **Testing & Quality:** the testing strategy matches `docs/testing.md`.
+- [ ] **Project Documents:** `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md` are assessed through the `.agents/docs.md` index (a missing or starter-only document is a warning, not a stop), and the plan's strategy matches `docs/testing.md`. Record each source in `Documentation Consultation`.
 - [ ] **Prerequisite Plans:** [the plans to finish first. **If** none → `None`.]
 
 ### Conditional
@@ -167,6 +167,7 @@ _e.g.,_ **WHEN** a user submits the form with a valid file **→ THEN** it is qu
 - [ ] **Schema State:** the database state is confirmed against `docs/data-schema.md`.
 - [ ] **Architecture & UI:** the topology is checked against `docs/architecture.md`, and any UI against `docs/design.md`.
 - [ ] **Observability:** logs, audit tables and traces follow `docs/observability.md`.
+- [ ] **Deployments & Setup:** release, CI and branch behaviour follows `docs/deployments.md`, and local-setup changes follow `docs/setup.md`.
 - [ ] **Notifications:** the alert or toast tier follows the notifications doc.
 
 ### 🔒 Gate 1: Prerequisites Check
@@ -179,6 +180,31 @@ _e.g.,_ **WHEN** a user submits the form with a valid file **→ THEN** it is qu
 - [ ] **Reuse reasons:** every `NEW` row cites its reason.
 - [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.
 
+## Documentation Consultation
+
+[Read the `.agents/docs.md` index when it exists, and consult each applicable topic's recommended document or a valid indexed equivalent. Always assess `docs/architecture.md`, `docs/technology.md`, `docs/security.md` and `docs/testing.md`. Consult `docs/data-schema.md` for database changes, `docs/design.md` for UI, `docs/observability.md` for logging, `docs/deployments.md` for release or CI behaviour, and `docs/noise.md` or `docs/setup.md` when relevant. A missing index, a missing or empty document, or a starter-only document is a warning: continue from repository evidence, and never stop the plan. Mark an irrelevant topic not applicable with the reason. Initially set to `PENDING`.]
+
+<!-- prettier-ignore -->
+| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
+| --- | --- | --- | --- | --- | --- |
+| [architecture] | `docs/architecture.md` | [yes / no — reason] | [the path and section actually read, or `none`] | [covered / partial / none] | [the gap, the alternative evidence, the action. **If** none → `None`.] |
+
+Carry each required read and each doc update into the runbook task that needs it (`READ:` and `UPDATE:` lines).
+
+## Documentation Warnings
+
+[One JSON object per line in a fenced `jsonl` block, with the fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence` and `action`, all non-empty (`"None available"` when no alternative evidence exists). **If** every applicable topic is covered → write `None`. A warning never blocks the plan. Initially set to `PENDING`.]
+
+```jsonl
+{
+  "topic": "security",
+  "gap": "starter-only",
+  "recommendedPath": "docs/security.md",
+  "alternativeEvidence": "The CI configuration defines token permissions.",
+  "action": "Populate the security document with the project's credential and permission boundaries."
+}
+```
+
 ## Data Schema Integration
 
 [How this feature uses the existing schema, and what changes. Initially set to `PENDING`.]
diff --git a/docs/testing.md b/docs/testing.md
index 12ff5a322..5ee530195 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -693,6 +693,13 @@ Replay a stored verdict: each `completeness` row carries `sourceSha` (the sha256
 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | Unit (markdown-invariant) | No `git add -A`; staging only through `bkit ledgers`; every status write targets `{STATUS}`; the merge pinned to the gate's head (`runs gate --pr` before `prs merge --match-head`); canonical 14 step keys; Step 2 runs `status path` after the `cd` into the worktree; pre-merge pushes confined to Steps 2, 3, 4, Commit + Push Bookkeeping, 10 and Failure Remediate, none forced; no fence checks out or pushes `dev` by hand, `branches sync-dev` brings it level; Failure Path = one `workflows fail` + one `workflows handover --flush`; issue-less runs and the main guard — a ship of `dev` / `main` prints the engine refusal, releases the lock and stops, the naming warning fires when the branch lacks `{FID}` and `ISSUE_ID` is empty, the Step 10 label re-read and Step 14 label calls skip when `ISSUE_ID` is empty, and the MCP merge asserts base `dev` |
 | `.bkit/core/engine/checks/status-holes.test.ts` | Unit | Expected steps and commands derived from each of the five workflow mds (no parallel table); step / evidence / unexercised / unexpected classification; no orphan rows in any workflow, build's pause and sub-rows named by the contract; verdict metadata; advisory exit 0 on holey fixture; sweep summary line counting holey runs |
 
+## Project documentation lifecycle coverage
+
+- `install/project-docs.test.ts` and the install and upgrade integration tests cover template refresh, the ownership migration, index registration and uninstall preserving adopted documents.
+- `checks/after/tools.test.ts` and `checks/after/index.test.ts` cover `detectProjectDocs` states, equivalents, unsafe paths, suppression and the advisory-only severity.
+- `commands/workflow/summary.test.ts` and `commands/workflow/workflows.integration.test.ts` cover warning aggregation for the active run through the real `workflows summary` command.
+- `audits/repo/shipped-docs-refs.test.ts` covers the responsibility inventory in the workflow and prompt catalogs, the named references and the warning contracts.
+
 ## Key test files
 
 Workflow progress has focused Unit coverage for position math and command output, Integration coverage for real saved status/plan files and completion producers, and renderer coverage for each supported host. The external Claude app's 375px layout is an owner-run check: `docs/plans/202611/logs/825-show-progress-bar/phone-verification.md` records its procedure, screenshots and explicit outcome. A character-count assertion does not verify app typography.
