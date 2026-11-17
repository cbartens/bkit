diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-verify.md b/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
index 927e992d7..555747356 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-verify.md
@@ -81,7 +81,7 @@ tools:
      - The API contracts match.
      - Shared state is consistent.
      - Cross-domain boundaries are respected.
-   - Run `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`. Your Context names `Test base`: the commit the last clean holistic check tested up to, or `origin/dev` for the first check.
+   - Run `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`. Your Context names `Test base`: the commit the last clean holistic check tested up to, or the feature's start commit for the first check.
      - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - Log each integration gap and each failing test as one gap: append `INTEGRATION: {what does not work together, naming the groups or tasks} — Fixable: true|false` with Bash `echo >>`, and describe it under `Integration Gaps`.
      - `Fixable: false` only when closing the gap needs a choice the plan does not make; the owner then decides. Every other gap is `Fixable: true`, because the holistic fix round closes it.
diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index ce8b3106e..a5900bb83 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -841,7 +841,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic --position=next
    ```
    Hold `value` as `HOLISTIC_ATTEMPT`.
-   Read the commit the last clean holistic check tested up to, `origin/dev` when there is none:
+   Read the commit the last clean holistic check tested up to, the feature's start commit when there is none:
    ```bash
    "{BKIT}" status route --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic
    ```
@@ -1229,7 +1229,7 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **Else** → sub-step 2.
 2. Scan the branch for migrations:
    ```bash
-   "{BKIT}" branches scan-diff --base=origin/dev --paths='(^|/)(migrations|migrate)/' >/dev/null
+   "{BKIT}" branches scan-diff --paths='(^|/)(migrations|migrate)/' >/dev/null
    ```
    Route:
    - **If** exit 0 → `FORCE_BUILD` = true → sub-step 3.
diff --git a/.agents/plugins/bkit/skills/bkit-debug/SKILL.md b/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
index 5730873ea..8ad0575b5 100644
--- a/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
@@ -88,7 +88,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 3. **If** `HANDOVER_NEEDED` = true → step 4. **Else** → step 5. Gate on failure shape only; never on worktree presence.
 4. **Skip if** `{WORKTREE_PATH}` is not set. Write the run's diff to the file the agent reads (a failure leaves it out):
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --base={DIFF_BASE} --fid={FID} --step=abort-handover >/dev/null
+   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" {BASE_FLAG} --fid={FID} --step=abort-handover >/dev/null
    ```
    **Subagent:** Invoke `view_file` `.agents/plugins/bkit/agents/bkit-debug-abort-handover.md` using `view_file` tool:
    Context: You are a subagent in the Debug phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
@@ -266,7 +266,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```bash
    "{BKIT}" worktrees setup --workflow=debug --fid={FID} --month={YYYYMM} --detect {BRANCH_FLAG}
    ```
-   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `DIFF_BASE` (`origin/dev` when null).
+   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `START_SHA`; `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty.
    Route:
    - **If** exit 0 → `cd "{WORKTREE_PATH}"` → verify with `pwd` → sub-step 2.
    - **If** exit 3 → resolve the rebase:
@@ -678,7 +678,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    PR_OPEN="{PR_OPEN}"
    "{BKIT}" status meta --file="{STATUS}" --workflow=debug --push-mode={PUSH_MODE} >/dev/null || exit 1
    if [ "$PR_OPEN" = 1 ]; then "{BKIT}" prs verbose-ci --number={PR_NUMBER} --state=off; fi
-   "{BKIT}" branches scan-diff --base={DIFF_BASE} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
+   "{BKIT}" branches scan-diff {BASE_FLAG} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
    "{BKIT}" roadmap mirror --workflow=debug --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=debug --fid={FID} --month={YYYYMM} --file="{STATUS}" --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" --verbose-ci-local {LABEL_FLAGS} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md" --session-dir="{SESSION_DIR}" || exit $?
    ```
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index 77f216d80..7b747696e 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -841,7 +841,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic --position=next
    ```
    Hold `value` as `HOLISTIC_ATTEMPT`.
-   Read the commit the last clean holistic check tested up to, `origin/dev` when there is none:
+   Read the commit the last clean holistic check tested up to, the feature's start commit when there is none:
    ```bash
    "{BKIT}" status route --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic
    ```
@@ -1229,7 +1229,7 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **Else** → sub-step 2.
 2. Scan the branch for migrations:
    ```bash
-   "{BKIT}" branches scan-diff --base=origin/dev --paths='(^|/)(migrations|migrate)/' >/dev/null
+   "{BKIT}" branches scan-diff --paths='(^|/)(migrations|migrate)/' >/dev/null
    ```
    Route:
    - **If** exit 0 → `FORCE_BUILD` = true → sub-step 3.
diff --git a/.agents/skills/bkit-debug/SKILL.md b/.agents/skills/bkit-debug/SKILL.md
index 98dbcd5d6..6bc61bcb9 100644
--- a/.agents/skills/bkit-debug/SKILL.md
+++ b/.agents/skills/bkit-debug/SKILL.md
@@ -88,7 +88,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 3. **If** `HANDOVER_NEEDED` = true → step 4. **Else** → step 5. Gate on failure shape only; never on worktree presence.
 4. **Skip if** `{WORKTREE_PATH}` is not set. Write the run's diff to the file the agent reads (a failure leaves it out):
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --base={DIFF_BASE} --fid={FID} --step=abort-handover >/dev/null
+   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" {BASE_FLAG} --fid={FID} --step=abort-handover >/dev/null
    ```
    **Subagent:** Invoke `@bkit-debug-abort-handover` using `Agent` tool:
    Context: You are a subagent in the Debug phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
@@ -266,7 +266,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```bash
    "{BKIT}" worktrees setup --workflow=debug --fid={FID} --month={YYYYMM} --detect {BRANCH_FLAG}
    ```
-   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `DIFF_BASE` (`origin/dev` when null).
+   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `START_SHA`; `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty.
    Route:
    - **If** exit 0 → `cd "{WORKTREE_PATH}"` → verify with `pwd` → sub-step 2.
    - **If** exit 3 → resolve the rebase:
@@ -678,7 +678,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    PR_OPEN="{PR_OPEN}"
    "{BKIT}" status meta --file="{STATUS}" --workflow=debug --push-mode={PUSH_MODE} >/dev/null || exit 1
    if [ "$PR_OPEN" = 1 ]; then "{BKIT}" prs verbose-ci --number={PR_NUMBER} --state=off; fi
-   "{BKIT}" branches scan-diff --base={DIFF_BASE} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
+   "{BKIT}" branches scan-diff {BASE_FLAG} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
    "{BKIT}" roadmap mirror --workflow=debug --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=debug --fid={FID} --month={YYYYMM} --file="{STATUS}" --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" --verbose-ci-local {LABEL_FLAGS} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md" --session-dir="{SESSION_DIR}" || exit $?
    ```
diff --git a/.bkit/cli.md b/.bkit/cli.md
index 5136dd384..d4e768a95 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -89,7 +89,7 @@ Sync, push, land and rebase branches; stamp and read a doc's base-commit anchor.
 | `regenerate` | workflow | `--fid` `--attempt` `--file` | Run a declared bkit:generate on the feature branch and commit only the paths it changed (ship Step 10's fix round). |
 | `push` | workflow | **`--mode`** `--set-upstream` `--ahead-of` `--commit` `--label` `--file` `--workflow` `--require-ci` `--open-pr` `--fid` | Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise; 81 tests lock held. |
 | `fast-forward` | workflow | **`--onto`** | Fetch a remote branch and fast-forward the checkout onto it; refuse when diverged. |
-| `scan-diff` | by hand | **`--base`** `--paths` `--marker` `--code` `--disabled-tests` `--expect-none` | Exit 0 when the branch's diff from --base matches (paths, an added marker line, a source change, or a disabled test); 1 when not — --disabled-tests turns that round: 1 when a test was disabled or lost an assertion, 0 when none was. |
+| `scan-diff` | by hand | `--base` `--paths` `--marker` `--code` `--disabled-tests` `--expect-none` | Exit 0 when the branch's diff from --base matches (paths, an added marker line, a source change, or a disabled test); 1 when not — --disabled-tests turns that round: 1 when a test was disabled or lost an assertion, 0 when none was. |
 | `force-build` | workflow | **`--fid`** **`--file`** **`--workflow`** `--label` `--open-pr` `--title-set` | Force a full CI build: put [force build] on the open PR's title, then push an empty marker commit (once per run). |
 | `rebase` | workflow | `--log-file` `--sentinel` `--file` | Drive a rebase to completion, auto-resolving ledger (union), lockfile (regenerate), generated-register (take the target's copy, rebuild after), embedded generated-block (take the target's block, merge the rest, rebuild after) and install-record (merge entry by entry, the target's value where both changed) conflicts; refuse and abort on anything else. |
 | `sync-dev` | workflow | — | After a merge, fast-forward local dev to origin/dev without checking it out or pushing; frozen install when the main checkout is on dev and moved. |
diff --git a/.bkit/core/.bkit/prompts.md b/.bkit/core/.bkit/prompts.md
index c8df89780..d2616c883 100644
--- a/.bkit/core/.bkit/prompts.md
+++ b/.bkit/core/.bkit/prompts.md
@@ -336,7 +336,7 @@ Cursor Cloud automation uses `composer-2.5` for metadata / API plumbing, and the
 | `bkit-build-plan-tasks` | Execute one task group — the task blocks in the brief `bkit context brief --next` writes; earlier tasks in the brief are context only; the brief's `Deviations` section, when present, is the owner's run instruction, applied to the tasks it names. An existing log is kept and its `Verdict` reset to `PENDING`. Verdict PASS / HANDOVER / FAIL: `HANDOVER` = turn cap near with tasks neither `DONE` nor `BLOCKED` → stop after the current task's log line; the workflow re-runs the group once with a fresh brief, not as a failed attempt. The group's `TEST FIRST` tests are already on disk, written by `bkit-build-plan-tests` and recorded red by the engine before this step: makes them pass and never edits, renames, moves or deletes a planned test or a `TEST EXCEPTION` field (`steps finish` refuses the step when a planned test file differs from its red blob, exit 11); a test recorded `passed-accepted` → `DONE — TASK {N}: already landed` when `DONE WHEN` already holds with no task code written; never undoes code to force a red (`.bkit/workflows.md` § Test-first). Honours the brief's `Reuse Inventory` rows and `Architecture` entries at the only point the decision can still be quietly discarded — `EXTEND` row modifies named artifact, never a parallel file; rows or entries the brief left out (8 KB work cap) → reads the plan section it names; reusable artifact found mid-build folds in, never forks; reads each task's `DONE WHEN` field as the completion criterion to satisfy; modify source; write stub artifact first then incremental `Task Log` entries — one `DONE — TASK {N}:` or `BLOCKED — TASK {N}:` line per task at line start, which the next brief reads to skip finished tasks. Reads `build-plan-current.md` when present: findings are fact, plan is intent — `Reword` tasks build at the paths the report names as current, `Broken` tasks whose work already landed log `DONE — TASK {N}: already landed`, the rest build the intent against current code. Never edits the plan file; tasks absent from the findings follow plan wording verbatim. Does not tick plan checkboxes (verify owns that). Does not write `docs/deferrals.jsonl` — a blocked task is a `BLOCKED` log line for verify to catch, not a deferral. |
 | `bkit-build-plan-verify` | Verify implementation vs plan; writes Plan Verification log. `Group` mode judges one group's briefs against the group diff (changes since the group's start commit); `Holistic` mode runs after the last group, and again after later groups, across every group, plus integration; it logs each integration gap and each failing test as an `INTEGRATION:` gap line ending `— Fixable: true`, or `— Fixable: false` only when closing it needs a choice the plan does not make. Ticks are the engine's: the header's `Tasks` line names the task numbers the codebase satisfies and `bkit tasks tick --green=` writes the `[x]`; the prompt edits no plan and never ticks a box. `bkit tests green` prints `verdict` and a `fixable` per gap, so the prompt holds no kind→`Fixable` table and no verdict mapping. Its reads decide only a `null` gap: `delete-still-referenced` → each hit read, a different thing with the same name → no gap, else `Fixable: true`; each `Updated tests` entry → the test's diff since its `base` read: only added expectations → no gap, a removed or loosened expectation → a `Fixable: false` gap; `Unproven` tests → `Notes`, no gap, because the owner answers them once at the build's end. Each gap is appended as the report's `logLine` with the decided `Fixable` in place of `null`; every other gap keeps its printed `fixable`; header `Failures` = unresolved gap count and `Fixable` = `true` when any is (build → fixable-only remediate, then Decision Pause); a test a task's `TEST EXCEPTION` field names is no gap; `Already landed` tests → `Notes` — a `BLOCKED` log line or a deferral row never discharges a task, so unfinished work routes to `@bkit-build-plan-gaps-remediate` in-loop instead of surfacing at ship. Missing `DONE WHEN` on any task → FAIL (template structure broken; remediation cannot recover). |
 | `bkit-build-plan-gaps-remediate` | Fix specific gaps from the group's latest verify log + group gate log failures, or, with Context `Mode: Holistic`, the holistic verify report's gap lines (reading the plan task blocks they name; no group gate) (the tests of the groups so far); a Context `Group gate` command is re-run after each fix until exit 0 — each newly exposed failure is a gap of the same round, other tests built on the same failing assumption are swept first — and logged `DONE — Group gate: exit 0`, which `PASS` needs; reads the group's briefs for its task blocks; Standard / Pivot / Final escalation. Context `Scope: fixable only` → `— Fixable: false` gaps out of scope. Header `Fixed` = `DONE — Gap` lines this attempt (0 → build Decision Pause). A supplied decision record → the owner's `Decision:` words steer the round. No strategy records a red by undoing or swapping out code, or rewrites a planned test case (`steps finish` exit 11 names the case); other tests in the same file are its to change; never touches a `TEST EXCEPTION` field (`.bkit/workflows.md` § Test-first). |
-| `bkit-build-challenge-1` | Adversarial review of `git diff origin/dev...HEAD` — bug-hunting lens; effort slot 1 (`high`). Parallel with `-2`. Writes each finding as one task block — `Severity`, `Class` (`mechanical\|architectural`), `Fixable`, `Location`, `DONE WHEN`, `TEST FIRST` within the per-task `bkit.workflows.tasks` caps the workflow passes in Context — that `bkit challenge merge` appends to the plan as a new last group. Reads each `TEST FIRST` test's logic against the code the diff leaves: it must fail there, or `tests red` refuses it as `passed` and the fix task blocks; a finding an existing plan task or test already covers gets no block. Never references sibling output (circular reasoning guard). |
+| `bkit-build-challenge-1` | Adversarial review of the run's diff — bug-hunting lens; effort slot 1 (`high`). Parallel with `-2`. Writes each finding as one task block — `Severity`, `Class` (`mechanical\|architectural`), `Fixable`, `Location`, `DONE WHEN`, `TEST FIRST` within the per-task `bkit.workflows.tasks` caps the workflow passes in Context — that `bkit challenge merge` appends to the plan as a new last group. Reads each `TEST FIRST` test's logic against the code the diff leaves: it must fail there, or `tests red` refuses it as `passed` and the fix task blocks; a finding an existing plan task or test already covers gets no block. Never references sibling output (circular reasoning guard). |
 | `bkit-build-challenge-2` | Same as `-1` — security lens; effort slot 2 (`high` on Claude / opus — depth-sensitive; Grok on Cursor — first-party depth, same native pool as `-1`). |
 
 > **Cross-phase reuse:** Build Steps 13-14 invoke `bkit-debug-failure-diagnose` / `bkit-debug-failure-remediate` (in-build test failures). See the Debug Phase entries.
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index c2080a22f..f095f6052 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -256,7 +256,7 @@ The table lists the header bullets of the 6 workflow files, block by block, in f
 <!-- prettier-ignore -->
 | Invariant | Rule |
 | --- | --- |
-| **Diff per reader** | build, debug, ship: Every agent that reads the run's diff gets `tmp/bkit-diff-{FID}.md`, written by `bkit context diff --reset-log` in the same sub-step, just before it: build Steps 10, 11 and the Failure Path; debug Step 10 and the Failure Path; ship Step 5 and the Failure Path. Build's group verify (Step 8) reads `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md` instead: `bkit context diff --base=` the group's start commit (`status route --step=build-group-start --group=N` `parentSha`), so a group's review reads only that group's commits. Past 10000 lines the file is a per-file budget: line 1 says `partial diff coverage`, line 2 lists the files not shown whole, and the whole diff stays in `{OUTBOX}` (§ Context artifact clamping). Debug passes `--base={DIFF_BASE}` (run start commit). |
+| **Diff per reader** | build, debug, ship: Every agent that reads the run's diff gets `tmp/bkit-diff-{FID}.md`, written by `bkit context diff --reset-log` in the same sub-step, just before it: build Steps 10, 11 and the Failure Path; debug Step 10 and the Failure Path; ship Step 5 and the Failure Path. Build's group verify (Step 8) reads `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md` instead: `bkit context diff --base=` the group's start commit (`status route --step=build-group-start --group=N` `parentSha`), so a group's review reads only that group's commits. Past 10000 lines the file is a per-file budget: line 1 says `partial diff coverage`, line 2 lists the files not shown whole, and the whole diff stays in `{OUTBOX}` (§ Context artifact clamping). Debug passes `{BASE_FLAG}` (`--base={startSha}` when the run has a start commit, else empty). |
 | **Locks** | Step 1 takes the per-feature `.lock` with `bkit locks acquire --kind=workflow` once `FID` is resolved; hold `token` as `{LOCK_TOKEN}`. The lock path is absolute (`$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock`, ship included, because the lock file is gitignored and never rides a commit), so acquire / release resolve to the same inode whatever the cwd. Lock line `{at} {workflow} {fid} {token}`. Existing lock → its owning workflow's folded status.jsonl decides: `IN_PROGRESS` + last step <30min → refused (`workflow already running for {FID}`) → Failure Path; any other holder (`DONE` / `FAILED`, idle `IN_PROGRESS`, no run in the log) is reclaimed as soon as it is idle; the lock file's own age is not checked. Released in Close Workflow (`bkit locks release --token=`) and Failure Path (`bkit workflows fail --token=`, skipped when `{LOCK_TOKEN}` is empty — the run never took the lock). Release removes only the caller's own lock (another owner's stays, exit 4); a lock file that survives removal exits 5 → `Lock removal failed`. |
 | **Pre-merge CI** | Ship re-resolves CI against the PR head it is about to merge (`bkit runs gate` at Step 10), not the read taken at Step 2: on Path B the Step 4 merge of `origin/dev` moves the head before `gh pr merge`, so the earlier read describes a SHA that is no longer being merged. A failed query is not a pass — an API error (403 on PAT scope, for one) is gate code 20, never green. Anything short of a `completed` run whose capstone concluded `success` refuses the merge. |
 | **Artifact tree** | A subagent's artifact is asserted under the working directory its dispatch supplied: `{WORKTREE_PATH}` for every worktree-phase agent, ship's included. The subagent's reported path is not evidence: the `cd` and `pwd` line in the dispatch Context is prose, and agents have written to the main checkout despite it. design / plan additionally assert no `{FID}` artifact is left untracked in the main checkout before the close squash — an untracked file at the same path makes `git merge --squash` fail with `untracked working tree files would be overwritten`. |
@@ -972,12 +972,12 @@ Each subsection documents a command's behaviour: steps, subagents, artifacts, ve
 | 8 — Verify Plan | `@bkit-build-plan-verify` | `bkit tests green --group` first (§ Test-first) → `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, read by verify and remediate; exit >= 2 → Failure Path. `bkit context diff --base=` the group's start commit → `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, the changes since the group started. Per group, attempt-numbered: `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Reads the group's briefs, the diff, the execute log's `DONE —` lines, `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md` and `build-plan-current.md` (already-landed tasks). The tick is the engine's: the agent names the task numbers the codebase satisfies on the header's `Tasks` line and `bkit tasks tick --plan= --group= --tasks="<numbers>" --green=<tests-green artifact>` writes the `[x]` — a task is satisfied only when its `DONE WHEN` field is satisfied in the codebase and the green report shows no gap for it (never on a `DONE —` claim alone). `tests green` prints `verdict` and a `fixable` per gap, so the prompt keeps only its diff reads, the `Updated tests` diff check among them, and notes the `Unproven` section without a gap. Missing `DONE WHEN` on any task → FAIL (template structure broken — remediation cannot recover, routes via Failure Path). `VERIFY_VERDICT` in `PASS\|CONCERNS\|FAIL`. PASS → `bkit tests plan-check --existence=report` lists the plan's groups: exit 1 with a `matrix` / `supersession` problem → one convert retry at Step 4 sub-step 2 (still failing → Failure Path); a group numbered above `GROUP` → group gate (§ Group gate) → `build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` + row; none → `GATE_VERDICT` = SKIPPED. `GATE_VERDICT` in `PASS\|FAIL\|SKIPPED`; PASS + gate != FAIL → Step 7. Header `Fixable` = `true` when gap-remediate can fix any gap (each `Identified Gaps Log` line ends `— Fixable: true` / `— Fixable: false`); a test a task's `TEST EXCEPTION` field names is no gap. Every non-PASS first checks the group's verify rounds against `build.verify.maxAttempts` (`counters route --point=build.verify`; used up → § Decision Pause with the loop question when `ask` is true in a session, else Failure Path). FAIL → one fixable-only Step 9 attempt (`Scope: fixable only`) when `Fixable` = `true` and a round is left, else § Decision Pause (`VERIFY_GAPS`). Group gate FAIL alone → Step 9 while a round is left; used up → the same pause when `ask` is true in a session, else Failure Path. A pause after a red gate runs the base check first (§ Decision Pause) and carries `Gate: FAIL` in its header. Other CONCERNS → Step 9 while a round is left, never asked; else § Decision Pause (`VERIFY_GAPS`). Reads prior verify and remediate logs to know what was already verified. |
 | 9 — Remediate Gaps | `@bkit-build-plan-gaps-remediate` (only if Step 8 CONCERNS, group gate FAIL, or the fixable-only attempt) | The verify header's `Loosened` line (`VERIFY_LOOSENED`) not `none` → no fixer this round: `@bkit-build-plan-tests` restores each named test (removed or loosened expectations back as at `base`, additions kept, a `WROTE` log line), `steps finish --step=build-plan-tests` commits it, `tests red --group` records it again, Step 8 re-runs. Else attempt-numbered: `build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`; reads the group's briefs for its task blocks. Group gate FAIL → Context hands the agent the group gate command (`tests run`, log `{OUTBOX}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-gate.log`): it re-runs it after each fix until exit 0, treats each newly exposed failure as a gap of the same round, sweeps for other tests built on the same failing assumption, and logs `DONE — Group gate: exit 0` (or `BLOCKED — Group gate`); `PASS` needs that line. Prompt-enforced only: Step 8's re-run is the check. Stub-first artifact + flat append-only log (`DONE —` per gap fixed; `BLOCKED —` per blocked gap, appended via `Bash echo >>`); reads glob of own prior attempts to skip already-fixed gaps. Header `Fixed` = gaps with `DONE` this attempt. Resumed into this step (a `retry` decision) → the group's last verify round is read back first: `VERIFY_ATTEMPT` (`counters derive --position=current`), `VERIFY_VERDICT` and the group gate's verdict (`status route`), the gate counted SKIPPED when that round wrote no gate log. No progress — `bkit branches scan-diff --base=HEAD~1 --code` exit 1 (nothing changed outside `docs/plans`, `docs/*.jsonl`, `.bkit/*.jsonl`: only logs and ledgers), or `Fixed` = 0 → § Decision Pause; verify never re-runs on unchanged code. Else re-run Step 8 (its next row is the next `VERIFY_ATTEMPT`). No progress after a red gate → the loop question with the base-check verdict, not a bare stop. Over `build.verify.maxAttempts` → Failure Path. |
 | 10 — Holistic Verification | `@bkit-build-plan-verify` (holistic mode), then `@bkit-build-plan-gaps-remediate` (holistic mode) on gaps | After the last group, and again each time later groups ran (challenge fix groups coming back through the loop): every group of the plan plus cross-group integration, cross-checked against every group's execute log; its tests run only for the files changed since the last holistic check that found no problems (`origin/dev` for the first check, so the first covers the whole feature diff); run-and-attempt-numbered `build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md` (`counters derive --step=build-plan-verify-holistic --position=next`). Each integration gap and each failing test is an `INTEGRATION:` line of the `Identified Gaps Log`, ending `— Fixable: true` unless closing it needs a choice the plan does not make. The agent names the satisfied task numbers per group on the header's `Tasks` line and the workflow ticks them — one `bkit tasks tick --plan= --group= --tasks="<numbers>"` call per task group; the agent edits no plan. PASS, or CONCERNS with 0 failures (a group-count concern) → Step 11. Else the run's holistic fix rounds (`counters route --of=build-plan-gaps-remediate-holistic:next --point=build.holistic`, one allowance per run with no reset after a clean check) decide, as at Step 8: used up → § Decision Pause with the loop question (`--loop=holistic`) when `ask` is true in a session, else Failure Path; `Fixable` = `false`, or the last round → § Decision Pause (`VERIFY_GAPS`, `From: holistic`); else a fix round in the same step: `@bkit-build-plan-gaps-remediate` with Context `Mode: Holistic` and `Scope: fixable only` reads the holistic report and the plan task blocks its gaps name, and writes `build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-log.md` (row `build-plan-gaps-remediate-holistic`, `--attempt-of=build-plan-verify-holistic:current`, strategy from `status route --step=build-plan-gaps-remediate-holistic`). No progress (`branches scan-diff --base=HEAD~1 --code` exit 1, or `Fixed` = 0) → § Decision Pause; else Step 10 runs again. Resume: a holistic verify row with CONCERNS or FAIL resumes at Step 10; a `retry` decision from holistic, or a done holistic fix row, resumes at the fix round, which reads `HOLISTIC_ATTEMPT` back (`--position=current`). |
-| 11 — Build Challenge | `@bkit-build-challenge-2`, plus `@bkit-build-challenge-1` on a large change (parallel) | At most `build.challenge.maxAttempts` rounds (`CHALLENGE_MAX`, `counters max --point=build.challenge`; `challenge merge --round` refuses a round over it, exit 2 → Failure Path): `CHALLENGE_DONE` (`bkit status resume` `challengeDone`, the last round already merged) → Step 12 without reviewing again. `bkit challenge gate` fetches `origin dev` (offline → the last fetch, logged), then sizes `origin/dev...HEAD`, on every pass (`docs/plans/**` excluded): under 300 lines and 10 files is small → the security reviewer (`-2`) runs alone and the finish and merge drop challenge-1's artifact and report; else both run. Each reviewer reads the same `tmp/bkit-diff-{FID}.md`, written just before (§ Diff per reader); on `partial diff coverage` challenge-2 runs a targeted `git diff` on each omitted file touching a security-relevant path. Reviewers read the plan and the diff only. Each writes every finding as one task block under `Findings Log` (`build-challenge-1.md`, `build-challenge-2.md`): severity, class, `Fixable`, `Location`, `DONE WHEN`, and a `TEST FIRST` for every finding. `bkit challenge merge --plan={FID}-plan.md` then appends the `CRITICAL\|HIGH\|MEDIUM` findings to the plan as task blocks stamped `**Round:** N`, in new last groups of <= `bkit.workflows.tasks.maxPerGroup` tasks, plus one `Derived Test Matrix` row per appended task's test when the plan carries the table; a finding at the `Location` and severity of an earlier challenge task that is still open reopens that task instead (its `**Round:**` line gains the round, e.g. `1, 2`; listed in `reopened` and `fixTasks`), one already done in an earlier round gets a new task; writes each `LOW` one as a `docs/deferrals.jsonl` row (`reason` `low-severity`), drops findings a `build-decision-*.md` item accepted, and prints the route: `none` → Step 12; `fix` (every task fixable, in any round) → Step 7, whose brief takes the first new group, `CHALLENGE_ROUND` + 1 before the last round, `CHALLENGE_DONE` = true in it; `pause` (a `**Fixable:** false` task, or more findings than one merge takes, which writes nothing) → § Decision Pause. A re-run on the same reports appends nothing. Exit 22 (a report not in task-block form) or exit 23 (the findings fail `plan-check`: a missing `TEST FIRST`, a test cap passed; `problems` printed) → reviewers re-run once with the reason in their Context, then Failure Path. Resumed into an open challenge Decision Pause → the limit read (`CHALLENGE_MAX`) and sub-steps 2 and 5 run again (the merge finds its tasks in the plan, writes nothing and prints the round's open tasks as `fixTasks`) → back to the pause's question. The challenge row carries the `round` it ran as (`--field=round=`); `bkit status resume` reads it back as `challengeRound` — one more once a challenge's merge wrote tasks (its next row is `build-plan-tasks` or `build-decision`, not `build-run-tests`), at most `CHALLENGE_MAX`; `challengeDone` = true once a last-round challenge row has a route row after it. |
+| 11 — Build Challenge | `@bkit-build-challenge-2`, plus `@bkit-build-challenge-1` on a large change (parallel) | At most `build.challenge.maxAttempts` rounds (`CHALLENGE_MAX`, `counters max --point=build.challenge`; `challenge merge --round` refuses a round over it, exit 2 → Failure Path): `CHALLENGE_DONE` (`bkit status resume` `challengeDone`, the last round already merged) → Step 12 without reviewing again. `bkit challenge gate` fetches `origin dev` (offline → the last fetch, logged), then sizes the diff from the feature's start commit, on every pass (`docs/plans/**` excluded): under 300 lines and 10 files is small → the security reviewer (`-2`) runs alone and the finish and merge drop challenge-1's artifact and report; else both run. Each reviewer reads the same `tmp/bkit-diff-{FID}.md`, written just before (§ Diff per reader); on `partial diff coverage` challenge-2 runs a targeted `git diff` on each omitted file touching a security-relevant path. Reviewers read the plan and the diff only. Each writes every finding as one task block under `Findings Log` (`build-challenge-1.md`, `build-challenge-2.md`): severity, class, `Fixable`, `Location`, `DONE WHEN`, and a `TEST FIRST` for every finding. `bkit challenge merge --plan={FID}-plan.md` then appends the `CRITICAL\|HIGH\|MEDIUM` findings to the plan as task blocks stamped `**Round:** N`, in new last groups of <= `bkit.workflows.tasks.maxPerGroup` tasks, plus one `Derived Test Matrix` row per appended task's test when the plan carries the table; a finding at the `Location` and severity of an earlier challenge task that is still open reopens that task instead (its `**Round:**` line gains the round, e.g. `1, 2`; listed in `reopened` and `fixTasks`), one already done in an earlier round gets a new task; writes each `LOW` one as a `docs/deferrals.jsonl` row (`reason` `low-severity`), drops findings a `build-decision-*.md` item accepted, and prints the route: `none` → Step 12; `fix` (every task fixable, in any round) → Step 7, whose brief takes the first new group, `CHALLENGE_ROUND` + 1 before the last round, `CHALLENGE_DONE` = true in it; `pause` (a `**Fixable:** false` task, or more findings than one merge takes, which writes nothing) → § Decision Pause. A re-run on the same reports appends nothing. Exit 22 (a report not in task-block form) or exit 23 (the findings fail `plan-check`: a missing `TEST FIRST`, a test cap passed; `problems` printed) → reviewers re-run once with the reason in their Context, then Failure Path. Resumed into an open challenge Decision Pause → the limit read (`CHALLENGE_MAX`) and sub-steps 2 and 5 run again (the merge finds its tasks in the plan, writes nothing and prints the round's open tasks as `fixTasks`) → back to the pause's question. The challenge row carries the `round` it ran as (`--field=round=`); `bkit status resume` reads it back as `challengeRound` — one more once a challenge's merge wrote tasks (its next row is `build-plan-tasks` or `build-decision`, not `build-run-tests`), at most `CHALLENGE_MAX`; `challengeDone` = true once a last-round challenge row has a route row after it. |
 | 12 — Run Tests | — | `bkit tests run` runs the deepest `bkit:gate:*` the consumer declares — descending `static-unit-integration`, `static-unit` (§ Local gate scripts) — and saves the full output to `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log`; `--artifact` writes a copy clamped with `debug-evidence` to `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, which rides the step's commit (row `artifacts` + `clamped`), so the log survives the worktree. `.md`, not `.log`: `*.log` is gitignored. Exit 3 (no gate declared) / 4 (gate could not run, 126 / 127) → Failure Path, never a FAIL verdict. Pre-PR: no E2E (CI covers it on the resulting PR). Build does not run the live tier — the @live boundary needs a deployed URL, so it is validated post-merge by the push-only `bkit-tests-live` CI canary and reproduced on demand via `/bkit-debug`; build gates on local tiers only and records no `testsLiveSkipped` (out of build's scope by design, not skipped). A repo gating unit branch-coverage puts `test:coverage:unit` in `bkit:lane:unit`, so this gate and the CI unit lane run the same `package.json` script (one source for the threshold) and a coverage regression fails in the worktree here instead of only on the PR. `TEST_VERDICT` = PASS → Step 15. FAIL with a round left under `build.tests.maxAttempts` → `counters progress --check=build-run-tests --fix=build-failure-remediate`: `trend` `stuck` or `worse` → § Decision Pause (`TESTS_LOOP`: Stop / Try again), else Step 13 without asking; none left → § Decision Pause (`TESTS_LOOP`) when `ask` is true in a session, else Failure Path. |
 | 13 — Diagnose Failure | `@bkit-debug-failure-diagnose` (only if Step 12 FAIL) | Reads the committed Step 12 test log `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`. Writes `build-failure-diagnose-{TEST_ATTEMPT}.md`. Resumed into Steps 13-14 → `TEST_ATTEMPT` is read back (`counters derive --step=build-run-tests --position=current`). |
 | 14 — Remediate Failure | `@bkit-debug-failure-remediate` (only if Step 12 FAIL) | Gets the diagnosis's `Strategy` in its Context (`status route --step=build-failure-diagnose` `strategy`). Writes `build-failure-remediate-{TEST_ATTEMPT}-log.md`. Stub-first artifact + flat append-only log (`DONE —` per fix step; `BLOCKED —` per blocked step, appended via `Bash echo >>`). No skip-done — each attempt is diagnosis-driven and may pick a different strategy. Re-run Step 12 (its next row is the next `TEST_ATTEMPT`). |
 | 15 — Summary | `bkit workflows summary` | Unticked plan tasks, or no plan file (`No plan file`) → FAIL. A group's execute or gaps-fix FAIL answered by that group's later non-FAIL verify, or a challenge FAIL answered by its fix tasks or a Decision Pause, is a CONCERNS reason. A group's verify FAIL is resolved by a later passing holistic verify, and a group-gate FAIL by a later passing Step 12 run, because a Decision Pause `Fix now` can move the fix into a new group so the failed group is never checked again. Commit `chore({FID}): summary` → open-PR probe → push (`-u origin {BRANCH}`). PR already open (resumed build) → push would fire CI + cloud auto-router on a branch build is still writing → probe stops run first (same probe as Step 16). `bkit-cloud.yml` backstop: no-op while build runs (`.bkit/cloud.md` § Branch-aware routing). |
-| 16 — Close Workflow & Create PR | — | `bkit:auto` re-read before close-workflow commit; open-PR probe; `bkit branches scan-diff --base=origin/dev --paths='(^\|/)(migrations\|migrate)/'` (case-insensitive, any depth — covers Supabase, Prisma, Drizzle, Rails) → `FORCE_BUILD`. `bkit prs open` (base pinned `dev`; body = the `bkit:issue` / `bkit:fid` marker + plan path; retries the create once; reads the base back → exit 6 when it is not `dev`, guarding repos whose default base is `main`); exit 80 → `create_pull_request` with the printed `title` / `body` / `base` / `head`. `FORCE_BUILD` → `bkit branches force-build --open-pr=<n>` after the PR opens: ` bkit [force build]` into the PR title (`gh pr edit`; exit 80 → `update_pull_request`, re-run `--title-set`), then an empty `chore({FID}): force build bkit [force build]` commit (auto-route suffix from `--label`) pushed — its `synchronize` event starts the run that reads the new title. Never amends; an `engine-action` row skips the commit on a re-run. Then CI-Dispatch Gate (`bkit runs dispatch`). Set state `In Review`; phase label `Build` persists. Worktree persists for follow-up `/bkit-debug` or `/bkit-ship`. Final return displays `build-summary.md` verbatim, appends what `bkit tips --workflow=<name>` prints (one tip, the star line, then how to silence both) as `## bkit Tips`, then offers a plain-English explanation on request. |
+| 16 — Close Workflow & Create PR | — | `bkit:auto` re-read before close-workflow commit; open-PR probe; `bkit branches scan-diff --paths='(^\|/)(migrations\|migrate)/'` (case-insensitive, any depth — covers Supabase, Prisma, Drizzle, Rails) → `FORCE_BUILD`. `bkit prs open` (base pinned `dev`; body = the `bkit:issue` / `bkit:fid` marker + plan path; retries the create once; reads the base back → exit 6 when it is not `dev`, guarding repos whose default base is `main`); exit 80 → `create_pull_request` with the printed `title` / `body` / `base` / `head`. `FORCE_BUILD` → `bkit branches force-build --open-pr=<n>` after the PR opens: ` bkit [force build]` into the PR title (`gh pr edit`; exit 80 → `update_pull_request`, re-run `--title-set`), then an empty `chore({FID}): force build bkit [force build]` commit (auto-route suffix from `--label`) pushed — its `synchronize` event starts the run that reads the new title. Never amends; an `engine-action` row skips the commit on a re-run. Then CI-Dispatch Gate (`bkit runs dispatch`). Set state `In Review`; phase label `Build` persists. Worktree persists for follow-up `/bkit-debug` or `/bkit-ship`. Final return displays `build-summary.md` verbatim, appends what `bkit tips --workflow=<name>` prints (one tip, the star line, then how to silence both) as `## bkit Tips`, then offers a plain-English explanation on request. |
 
 **Failure Path includes handover:** when exhausted retry counts trigger it, it invokes `@bkit-debug-abort-handover` and posts the `Workflow Handover` comment.
 
@@ -1069,7 +1069,7 @@ The following table describes the local discovery route and shared step mechanic

<!-- prettier-ignore -->
 | Step | Subagent(s) | Notes |
 | --- | --- | --- |
 | 1 — Start Workflow | — | Pre-flight: `bkit repo info --fetch`. Issue recovery as in design Step 1 (issue-less: tracker reads, labels and comments skipped). `bkit issues labels --phase=debug`: sets `bkit:debug`, drops the prior phase label, `next:*` and `bkit:failed`; state `In Progress`. PR-mode: `PR_NUMBER` → `PUSH_MODE`; on `dev` / `main` no `prs probe`, `PUSH_MODE` = LOCAL. `DEBUG_ATTEMPT` + `DEBUG_MODE` per Mode detection above. No commits on `dev`: the `start-workflow` step entry waits for Step 2, inside the worktree. |
-| 2 — Worktree Setup | — | Debug creates no branch. An explicit `--branch` safely adopts the named existing branch; otherwise resume `.worktrees/{FID}`, adopt an existing `feat/{FID}`, or adopt the current branch in place. `main` is ineligible. Another feature's in-place run blocks adoption. Hold `startSha` as `DIFF_BASE`, or `origin/dev` when null. Write the debug input and persist the attempt, modes and validated evidence selection before downstream resume. |
+| 2 — Worktree Setup | — | Debug creates no branch. An explicit `--branch` safely adopts the named existing branch; otherwise resume `.worktrees/{FID}`, adopt an existing `feat/{FID}`, or adopt the current branch in place. `main` is ineligible. Another feature's in-place run blocks adoption. Hold `startSha` as `START_SHA`; `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty. Write the debug input and persist the attempt, modes and validated evidence selection before downstream resume. |
 | 3 — Run Tests | — | **Loop head (both modes).** `NORMAL_ATTEMPT` = this row's `attempt` (`steps done --attempt=next`). `bkit tests run` runs the deepest `bkit:gate:*` the consumer declares — descending `static-unit-integration-e2e-live`, `static-unit-integration-e2e`, `static-unit-integration`, `static-unit`; `[live=off]` drops the live candidate (§ Local gate scripts). Iteration 1 = reproduce. Records `verdict` + `failures` + `scope` (the gate script name; ends `:live` only when the live gate ran); writes the status row but does not commit it — a `chore(...)` HEAD here would let a preview host's `^chore:` ignore rule cancel the preview and demote CI to a partial tier, skipping the suites the loop is proving; `parentSha` advances transitively through Steps 4-7. PASS routes on active-run rows, not the attempt count: a fix step ran (`debug-failure-remediate` / `debug-failure-soak`, one `counters route --of=<step>,<step>:count`) → Step 9; Failure Reproduce ran, no fix since (reproduce tests passed on the re-run — intermittent) → Step 10 (CONCERNS); neither + `REPRO` → Step 4; neither → Step 10; FAIL + NORMAL + `FIX_ATTEMPT` (`counters route --of=debug-failure-remediate:next --all-runs --point=debug.fix`) within the limit → Loop Question (from the second attempt; asks only when `counters progress` `trend` is `stuck` or `worse`) → Step 4; FAIL + NORMAL + used up → `bkit status meta --debug-mode=SOAK` → the SOAK check; FAIL + SOAK + `SOAK_ATTEMPT` (`--of=debug-failure-soak:next --all-runs --point=debug.soak`) within the limit → Loop Question → Step 4; used up with `debug.soak.ask` true in a session → Loop Question (`LOOP_LIMIT`) → Step 4; else → Failure Path. |
 | 4 — Fetch Context | — | (on FAIL with budget, or before Reproduce) Mode-agnostic. Every consumer `context-fetch` block (`bkit context list-blocks` → `fetch`, fenced + clamped) + a related-issues tracker search → per-context `context-*-{DEBUG_ATTEMPT}.md` written only when content exists; `bkit context finalise` → `FETCH_VERDICT`, `contextsConfigured`, `clamped`. Routes: PASS → Step 5; SOAK → Step 8; else → Step 6. |
 | 5 — Failure Reproduce | `@bkit-debug-failure-reproduce` (only if `REPRO` and first Run Tests PASS) | Writes `debug-failure-reproduce-{NORMAL_ATTEMPT}.md` + tests failing on the reported symptoms (`Mode: SOAK` → they repeat the scenario until they fail reliably); no implementation changes. `steps finish` commits `test({FID}): reproduce reported failure`, holds `Reproduced`. `YES` → Step 3 (its FAIL row = the red; its PASS row with no fix since → Step 10); `NO` → test changes removed → Step 10. |
@@ -1078,7 +1078,7 @@ The following table describes the local discovery route and shared step mechanic
 | 8 — Failure Remediate Soak | `@bkit-debug-failure-soak` (only if `DEBUG_MODE` = SOAK) | `SOAK_ATTEMPT` = soak rows across every debug run of the feature + 1 (`--count-field=soakAttempt=debug-failure-soak:next:all`). One accumulating context (reads its prior `debug-failure-soak-*-log.md`) applies the single next instrument-or-fix step against the failing boundary (the real model/DB/stream behind a live tier when one ran, else the failing tier the run surfaced); adds `[DEBUG-OBSERVE]` scaffolding and strips every marker before any declared fix (no-leak); commits `fix({FID}): soak {description}`. → loop to Step 3. Bounded by `debug.soak.maxAttempts`, counted across the feature's debug runs. |
 | 9 — Push Remediation | — | (PASS after a fix) Status file-only (no intermediate commit so Step 7/8's `fix(...)` stays HEAD at push). PR-mode: append `bkit [verbose ci]` to PR title if absent. Push (skipped on `dev`: the Step 11 close pushes). → Step 10. |
 | 10 — Summary | `bkit workflows summary` | Commit `chore({FID}): summary{VERBOSE_SUFFIX}` → push (skipped on `dev`). `SUMMARY_VERDICT` = PASS / CONCERNS → Step 11; FAIL → Failure Path. |
-| 11 — Close Workflow | — | A live `prs probe --head` (any base; skipped on `dev` / `main`) sets `{PR_OPEN}` and re-records `PUSH_MODE` (`bkit status meta --push-mode`); labels, the subject suffix, the title strip and `TRIGGER_PR` all key on it, not on the Step-1 value. No-leak assertion: fails the run if any added `[DEBUG-OBSERVE]` line survives the debug diff (`bkit branches scan-diff --base={DIFF_BASE} --marker="[DEBUG-OBSERVE]" --expect-none`, exit 1 on a hit: added lines of `{DIFF_BASE}...HEAD`, excluding `docs/plans/`) before the CI-triggering push — diff-scoped, not a tree-wide `git grep`, so the bkit-managed prompt / command files that quote the literal marker never false-trip (the soak agent's own `git grep '[DEBUG-OBSERVE]'` self-check in `bkit-debug-failure-soak.md` is the first layer). Else Failure Path. PR open: strip `bkit [verbose ci]` from PR title. Commit `chore({FID}): close-workflow{VERBOSE_SUFFIX}` → push + (LOCAL, no PR) `chore({FID}): create-pr{VERBOSE_SUFFIX}` (`VERBOSE_SUFFIX = " bkit [verbose ci]"` iff `PUSH_MODE = LOCAL`) via `bkit branches push --commit= --label=` (one per run, `engine-action` row). Auto-route marker `bkit [auto route]` on the CI-triggering HEAD when `bkit:auto`. Records `testsLiveSkipped` when no live tier ran (no `test:...:live` task in `scope`). Set state `In Review`; phase label `Debug` persists. Worktree persists. On `dev` the close pushes through `bkit branches push --mode=dev --require-ci` (the run's own commits; the pushed `sha` is `{DEV_SHA}` and the close is recorded against it), then `runs dispatch --sha`, `runs wait --until=completed` and `runs gate --capstone-only` on that sha run before `locks release`; `skipped: no-run-commits` (every run commit already on `origin/dev`) → narrated, no CI run gated, lock released; a red run, a refused push or a replay conflict → Failure Path naming the run. The handover path runs via Failure Path. Final return displays `debug-summary.md` verbatim, appends what `bkit tips --workflow=<name>` prints (one tip, the star line, then how to silence both) as `## bkit Tips`, then offers a plain-English explanation on request. |
+| 11 — Close Workflow | — | A live `prs probe --head` (any base; skipped on `dev` / `main`) sets `{PR_OPEN}` and re-records `PUSH_MODE` (`bkit status meta --push-mode`); labels, the subject suffix, the title strip and `TRIGGER_PR` all key on it, not on the Step-1 value. No-leak assertion: fails the run if any added `[DEBUG-OBSERVE]` line survives the debug diff (`bkit branches scan-diff {BASE_FLAG} --marker="[DEBUG-OBSERVE]" --expect-none`, exit 1 on a hit: added lines of the run's diff, excluding `docs/plans/`) before the CI-triggering push — diff-scoped, not a tree-wide `git grep`, so the bkit-managed prompt / command files that quote the literal marker never false-trip (the soak agent's own `git grep '[DEBUG-OBSERVE]'` self-check in `bkit-debug-failure-soak.md` is the first layer). Else Failure Path. PR open: strip `bkit [verbose ci]` from PR title. Commit `chore({FID}): close-workflow{VERBOSE_SUFFIX}` → push + (LOCAL, no PR) `chore({FID}): create-pr{VERBOSE_SUFFIX}` (`VERBOSE_SUFFIX = " bkit [verbose ci]"` iff `PUSH_MODE = LOCAL`) via `bkit branches push --commit= --label=` (one per run, `engine-action` row). Auto-route marker `bkit [auto route]` on the CI-triggering HEAD when `bkit:auto`. Records `testsLiveSkipped` when no live tier ran (no `test:...:live` task in `scope`). Set state `In Review`; phase label `Debug` persists. Worktree persists. On `dev` the close pushes through `bkit branches push --mode=dev --require-ci` (the run's own commits; the pushed `sha` is `{DEV_SHA}` and the close is recorded against it), then `runs dispatch --sha`, `runs wait --until=completed` and `runs gate --capstone-only` on that sha run before `locks release`; `skipped: no-run-commits` (every run commit already on `origin/dev`) → narrated, no CI run gated, lock released; a red run, a refused push or a replay conflict → Failure Path naming the run. The handover path runs via Failure Path. Final return displays `debug-summary.md` verbatim, appends what `bkit tips --workflow=<name>` prints (one tip, the star line, then how to silence both) as `## bkit Tips`, then offers a plain-English explanation on request. |
 
 **Failure Path** includes a conditional handover via `@bkit-debug-abort-handover` when max-retry is exhausted → `debug-handover.md`. In PR mode `bkit [verbose ci]` is kept (not stripped), because the investigator wants verbose CI to continue (§ `bkit [verbose ci]` Marker Propagation, cleanup invariant).
 
diff --git a/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts b/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
index 9df54ff31..c3a39bfe6 100644
--- a/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
+++ b/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
@@ -445,6 +445,18 @@ describe("holistic verify prompt test base", () => {
   });
 });
 
+describe("diff and test base", () => {
+  it("build workflow and verify prompt name no origin/dev diff or test base", () => {
+    const build = fs.readFileSync(path.join(WORKFLOWS_DIR, "bkit-build.md"), "utf-8");
+    const verify = fs.readFileSync(path.join(PROMPTS_DIR, "bkit-build-plan-verify.md"), "utf-8");
+    expect(build).not.toContain("--base=origin/dev");
+    expect(build).toContain("branches scan-diff --paths=");
+    const testBase = verify.split("\n").find((l) => l.includes("Your Context names `Test base`"))!;
+    expect(testBase).not.toContain("origin/dev");
+    expect(testBase).toContain("start commit");
+  });
+});
+
 describe("group gate scope", () => {
   const SINCE = "--changed-since={GROUP_BASE}";
   const DERIVE = "status route --step=build-group-start --group=";
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 209de1bff..7696d2cf7 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -1187,7 +1187,7 @@ describe("diff per reader", () => {
   // Every agent that reads the run's diff gets a fresh `tmp/bkit-diff-{FID}.md`,
   // written by `context diff` in the same sub-step, just before the agent.
   // Debug runs on dev, so its diff names the base the run started from.
-  const BASE_FLAG: Record<string, string> = { build: "", debug: " --base={DIFF_BASE}", ship: "" };
+  const BASE_FLAG: Record<string, string> = { build: "", debug: " {BASE_FLAG}", ship: "" };
   const READERS: Array<[string, RegExp, string, string[]]> = [
     ["build", /Failure Path/, "abort-handover", ["bkit-debug-abort-handover"]],
     ["build", /Step 10 — /, "build-plan-verify-holistic", ["bkit-build-plan-verify"]],
@@ -2045,13 +2045,15 @@ describe("workflow routing", () => {
 describe("debug on dev", () => {
   const debug = workflow("debug");
 
-  it("debug diffs against DIFF_BASE on dev", () => {
+  it("debug passes --base only when it runs in place on dev", () => {
     expect(debug).not.toContain("origin/dev..HEAD");
-    for (const line of commandLines(debug, "context diff"))
-      expect(line).toContain("--base={DIFF_BASE}");
+    expect(debug).not.toContain("DIFF_BASE");
+    for (const line of commandLines(debug, "context diff")) expect(line).toContain("{BASE_FLAG}");
+    for (const line of commandLines(debug, "branches scan-diff"))
+      expect(line).toContain("{BASE_FLAG}");
     const step2 = section(debug, /Step 2 — Worktree Setup/);
-    expect(step2).toContain("`startSha` as `DIFF_BASE`");
-    expect(step2).toContain("`origin/dev` when null");
+    expect(step2).toContain("`{BASE_FLAG}` = `--base={startSha}` when `startSha` is present");
+    expect(step2).not.toContain("`origin/dev` when null");
   });
 
   it("debug Steps 9 and 10 push nothing on dev", () => {
diff --git a/.bkit/core/prompts/bkit-build-plan-verify.md b/.bkit/core/prompts/bkit-build-plan-verify.md
index 099bfc56f..84b57c862 100644
--- a/.bkit/core/prompts/bkit-build-plan-verify.md
+++ b/.bkit/core/prompts/bkit-build-plan-verify.md
@@ -83,7 +83,7 @@ autoCompactWindow: 300000
      - The API contracts match.
      - Shared state is consistent.
      - Cross-domain boundaries are respected.
-   - Run `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`. Your Context names `Test base`: the commit the last clean holistic check tested up to, or `origin/dev` for the first check.
+   - Run `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`. Your Context names `Test base`: the commit the last clean holistic check tested up to, or the feature's start commit for the first check.
      - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - Log each integration gap and each failing test as one gap: append `INTEGRATION: {what does not work together, naming the groups or tasks} — Fixable: true|false` with Bash `echo >>`, and describe it under `Integration Gaps`.
      - `Fixable: false` only when closing the gap needs a choice the plan does not make; the owner then decides. Every other gap is `Fixable: true`, because the holistic fix round closes it.
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index 1f5755894..3f3b42008 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -882,7 +882,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic --position=next
    ```
    Hold `value` as `HOLISTIC_ATTEMPT`.
-   Read the commit the last clean holistic check tested up to, `origin/dev` when there is none:
+   Read the commit the last clean holistic check tested up to, the feature's start commit when there is none:
    ```bash
    "{BKIT}" status route --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic
    ```
@@ -1274,7 +1274,7 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **Else** → sub-step 2.
 2. Scan the branch for migrations:
    ```bash
-   "{BKIT}" branches scan-diff --base=origin/dev --paths='(^|/)(migrations|migrate)/' >/dev/null
+   "{BKIT}" branches scan-diff --paths='(^|/)(migrations|migrate)/' >/dev/null
    ```
    Route:
    - **If** exit 0 → `FORCE_BUILD` = true → sub-step 3.
diff --git a/.bkit/core/workflows/bkit-debug.md b/.bkit/core/workflows/bkit-debug.md
index 5f1dc9465..f148d6ef1 100644
--- a/.bkit/core/workflows/bkit-debug.md
+++ b/.bkit/core/workflows/bkit-debug.md
@@ -106,7 +106,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 3. **If** `HANDOVER_NEEDED` = true → step 4. **Else** → step 5. Gate on failure shape only; never on worktree presence.
 4. **Skip if** `{WORKTREE_PATH}` is not set. Write the run's diff to the file the agent reads (a failure leaves it out):
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --base={DIFF_BASE} --fid={FID} --step=abort-handover >/dev/null
+   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" {BASE_FLAG} --fid={FID} --step=abort-handover >/dev/null
    ```
    **Subagent:** Invoke `@bkit-debug-abort-handover` using `Agent` tool:
    Context: You are a subagent in the Debug phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
@@ -306,7 +306,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```bash
    "{BKIT}" worktrees setup --workflow=debug --fid={FID} --month={YYYYMM} --detect {BRANCH_FLAG}
    ```
-   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `DIFF_BASE` (`origin/dev` when null).
+   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `START_SHA`; `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty.
    Route:
    - **If** exit 0 → `cd "{WORKTREE_PATH}"` → verify with `pwd` → sub-step 2.
    - **If** exit 3 → resolve the rebase:
@@ -734,7 +734,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    PR_OPEN="{PR_OPEN}"
    "{BKIT}" status meta --file="{STATUS}" --workflow=debug --push-mode={PUSH_MODE} >/dev/null || exit 1
    if [ "$PR_OPEN" = 1 ]; then "{BKIT}" prs verbose-ci --number={PR_NUMBER} --state=off; fi
-   "{BKIT}" branches scan-diff --base={DIFF_BASE} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
+   "{BKIT}" branches scan-diff {BASE_FLAG} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
    "{BKIT}" roadmap mirror --workflow=debug --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=debug --fid={FID} --month={YYYYMM} --file="{STATUS}" --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" --verbose-ci-local {LABEL_FLAGS} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md" --session-dir="{SESSION_DIR}" || exit $?
    ```
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 65a5eedf2..4d4754446 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -9747,7 +9747,7 @@ The table lists the header bullets of the 6 workflow files, block by block, in f
 <!-- prettier-ignore -->
 | Invariant | Rule |
 | --- | --- |
-| **Diff per reader** | build, debug, ship: Every agent that reads the run's diff gets `tmp/bkit-diff-{FID}.md`, written by `bkit context diff --reset-log` in the same sub-step, just before it: build Steps 10, 11 and the Failure Path; debug Step 10 and the Failure Path; ship Step 5 and the Failure Path. Build's group verify (Step 8) reads `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md` instead: `bkit context diff --base=` the group's start commit (`status route --step=build-group-start --group=N` `parentSha`), so a group's review reads only that group's commits. Past 10000 lines the file is a per-file budget: line 1 says `partial diff coverage`, line 2 lists the files not shown whole, and the whole diff stays in `{OUTBOX}` (§ Context artifact clamping). Debug passes `--base={DIFF_BASE}` (run start commit). |
+| **Diff per reader** | build, debug, ship: Every agent that reads the run's diff gets `tmp/bkit-diff-{FID}.md`, written by `bkit context diff --reset-log` in the same sub-step, just before it: build Steps 10, 11 and the Failure Path; debug Step 10 and the Failure Path; ship Step 5 and the Failure Path. Build's group verify (Step 8) reads `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md` instead: `bkit context diff --base=` the group's start commit (`status route --step=build-group-start --group=N` `parentSha`), so a group's review reads only that group's commits. Past 10000 lines the file is a per-file budget: line 1 says `partial diff coverage`, line 2 lists the files not shown whole, and the whole diff stays in `{OUTBOX}` (§ Context artifact clamping). Debug passes `{BASE_FLAG}` (`--base={startSha}` when the run has a start commit, else empty). |
 | **Locks** | Step 1 takes the per-feature `.lock` with `bkit locks acquire --kind=workflow` once `FID` is resolved; hold `token` as `{LOCK_TOKEN}`. The lock path is absolute (`$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock`, ship included, because the lock file is gitignored and never rides a commit), so acquire / release resolve to the same inode whatever the cwd. Lock line `{at} {workflow} {fid} {token}`. Existing lock → its owning workflow's folded status.jsonl decides: `IN_PROGRESS` + last step <30min → refused (`workflow already running for {FID}`) → Failure Path; any other holder (`DONE` / `FAILED`, idle `IN_PROGRESS`, no run in the log) is reclaimed as soon as it is idle; the lock file's own age is not checked. Released in Close Workflow (`bkit locks release --token=`) and Failure Path (`bkit workflows fail --token=`, skipped when `{LOCK_TOKEN}` is empty — the run never took the lock). Release removes only the caller's own lock (another owner's stays, exit 4); a lock file that survives removal exits 5 → `Lock removal failed`. |
 | **Pre-merge CI** | Ship re-resolves CI against the PR head it is about to merge (`bkit runs gate` at Step 10), not the read taken at Step 2: on Path B the Step 4 merge of `origin/dev` moves the head before `gh pr merge`, so the earlier read describes a SHA that is no longer being merged. A failed query is not a pass — an API error (403 on PAT scope, for one) is gate code 20, never green. Anything short of a `completed` run whose capstone concluded `success` refuses the merge. |
 | **Artifact tree** | A subagent's artifact is asserted under the working directory its dispatch supplied: `{WORKTREE_PATH}` for every worktree-phase agent, ship's included. The subagent's reported path is not evidence: the `cd` and `pwd` line in the dispatch Context is prose, and agents have written to the main checkout despite it. design / plan additionally assert no `{FID}` artifact is left untracked in the main checkout before the close squash — an untracked file at the same path makes `git merge --squash` fail with `untracked working tree files would be overwritten`. |
@@ -11139,7 +11139,7 @@ The groups' components work together.
 The API contracts match.
 Shared state is consistent.
 Cross-domain boundaries are respected.
-[local-pre-commit] Run `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`. Your Context names `Test base`: the commit the last clean holistic check tested up to, or `origin/dev` for the first check.
+[local-pre-commit] Run `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`. Your Context names `Test base`: the commit the last clean holistic check tested up to, or the feature's start commit for the first check.
 Log each integration gap and each failing test as one gap: append `INTEGRATION: {what does not work together, naming the groups or tasks} — Fixable: true|false` with Bash `echo >>`, and describe it under `Integration Gaps`.
 `Fixable: false` only when closing the gap needs a choice the plan does not make; the owner then decides. Every other gap is `Fixable: true`, because the holistic fix round closes it.
 **If** a supplied decision record accepts the gap → no gap. Name the record in `Notes`.
diff --git a/.bkit/prompts.md b/.bkit/prompts.md
index 7571cda4e..b79233402 100644
--- a/.bkit/prompts.md
+++ b/.bkit/prompts.md
@@ -336,7 +336,7 @@ Cursor Cloud automation uses `composer-2.5` for metadata / API plumbing, and the
 | `bkit-build-plan-tasks` | Execute one task group — the task blocks in the brief `bkit context brief --next` writes; earlier tasks in the brief are context only; the brief's `Deviations` section, when present, is the owner's run instruction, applied to the tasks it names. An existing log is kept and its `Verdict` reset to `PENDING`. Verdict PASS / HANDOVER / FAIL: `HANDOVER` = turn cap near with tasks neither `DONE` nor `BLOCKED` → stop after the current task's log line; the workflow re-runs the group once with a fresh brief, not as a failed attempt. The group's `TEST FIRST` tests are already on disk, written by `bkit-build-plan-tests` and recorded red by the engine before this step: makes them pass and never edits, renames, moves or deletes a planned test or a `TEST EXCEPTION` field (`steps finish` refuses the step when a planned test file differs from its red blob, exit 11); a test recorded `passed-accepted` → `DONE — TASK {N}: already landed` when `DONE WHEN` already holds with no task code written; never undoes code to force a red (`.bkit/workflows.md` § Test-first). Honours the brief's `Reuse Inventory` rows and `Architecture` entries at the only point the decision can still be quietly discarded — `EXTEND` row modifies named artifact, never a parallel file; rows or entries the brief left out (8 KB work cap) → reads the plan section it names; reusable artifact found mid-build folds in, never forks; reads each task's `DONE WHEN` field as the completion criterion to satisfy; modify source; write stub artifact first then incremental `Task Log` entries — one `DONE — TASK {N}:` or `BLOCKED — TASK {N}:` line per task at line start, which the next brief reads to skip finished tasks. Reads `build-plan-current.md` when present: findings are fact, plan is intent — `Reword` tasks build at the paths the report names as current, `Broken` tasks whose work already landed log `DONE — TASK {N}: already landed`, the rest build the intent against current code. Never edits the plan file; tasks absent from the findings follow plan wording verbatim. Does not tick plan checkboxes (verify owns that). Does not write `docs/deferrals.jsonl` — a blocked task is a `BLOCKED` log line for verify to catch, not a deferral. |
 | `bkit-build-plan-verify` | Verify implementation vs plan; writes Plan Verification log. `Group` mode judges one group's briefs against the group diff (changes since the group's start commit); `Holistic` mode runs after the last group, and again after later groups, across every group, plus integration; it logs each integration gap and each failing test as an `INTEGRATION:` gap line ending `— Fixable: true`, or `— Fixable: false` only when closing it needs a choice the plan does not make. Ticks are the engine's: the header's `Tasks` line names the task numbers the codebase satisfies and `bkit tasks tick --green=` writes the `[x]`; the prompt edits no plan and never ticks a box. `bkit tests green` prints `verdict` and a `fixable` per gap, so the prompt holds no kind→`Fixable` table and no verdict mapping. Its reads decide only a `null` gap: `delete-still-referenced` → each hit read, a different thing with the same name → no gap, else `Fixable: true`; each `Updated tests` entry → the test's diff since its `base` read: only added expectations → no gap, a removed or loosened expectation → a `Fixable: false` gap; `Unproven` tests → `Notes`, no gap, because the owner answers them once at the build's end. Each gap is appended as the report's `logLine` with the decided `Fixable` in place of `null`; every other gap keeps its printed `fixable`; header `Failures` = unresolved gap count and `Fixable` = `true` when any is (build → fixable-only remediate, then Decision Pause); a test a task's `TEST EXCEPTION` field names is no gap; `Already landed` tests → `Notes` — a `BLOCKED` log line or a deferral row never discharges a task, so unfinished work routes to `@bkit-build-plan-gaps-remediate` in-loop instead of surfacing at ship. Missing `DONE WHEN` on any task → FAIL (template structure broken; remediation cannot recover). |
 | `bkit-build-plan-gaps-remediate` | Fix specific gaps from the group's latest verify log + group gate log failures, or, with Context `Mode: Holistic`, the holistic verify report's gap lines (reading the plan task blocks they name; no group gate) (the tests of the groups so far); a Context `Group gate` command is re-run after each fix until exit 0 — each newly exposed failure is a gap of the same round, other tests built on the same failing assumption are swept first — and logged `DONE — Group gate: exit 0`, which `PASS` needs; reads the group's briefs for its task blocks; Standard / Pivot / Final escalation. Context `Scope: fixable only` → `— Fixable: false` gaps out of scope. Header `Fixed` = `DONE — Gap` lines this attempt (0 → build Decision Pause). A supplied decision record → the owner's `Decision:` words steer the round. No strategy records a red by undoing or swapping out code, or rewrites a planned test case (`steps finish` exit 11 names the case); other tests in the same file are its to change; never touches a `TEST EXCEPTION` field (`.bkit/workflows.md` § Test-first). |
-| `bkit-build-challenge-1` | Adversarial review of `git diff origin/dev...HEAD` — bug-hunting lens; effort slot 1 (`high`). Parallel with `-2`. Writes each finding as one task block — `Severity`, `Class` (`mechanical\|architectural`), `Fixable`, `Location`, `DONE WHEN`, `TEST FIRST` within the per-task `bkit.workflows.tasks` caps the workflow passes in Context — that `bkit challenge merge` appends to the plan as a new last group. Reads each `TEST FIRST` test's logic against the code the diff leaves: it must fail there, or `tests red` refuses it as `passed` and the fix task blocks; a finding an existing plan task or test already covers gets no block. Never references sibling output (circular reasoning guard). |
+| `bkit-build-challenge-1` | Adversarial review of the run's diff — bug-hunting lens; effort slot 1 (`high`). Parallel with `-2`. Writes each finding as one task block — `Severity`, `Class` (`mechanical\|architectural`), `Fixable`, `Location`, `DONE WHEN`, `TEST FIRST` within the per-task `bkit.workflows.tasks` caps the workflow passes in Context — that `bkit challenge merge` appends to the plan as a new last group. Reads each `TEST FIRST` test's logic against the code the diff leaves: it must fail there, or `tests red` refuses it as `passed` and the fix task blocks; a finding an existing plan task or test already covers gets no block. Never references sibling output (circular reasoning guard). |
 | `bkit-build-challenge-2` | Same as `-1` — security lens; effort slot 2 (`high` on Claude / opus — depth-sensitive; Grok on Cursor — first-party depth, same native pool as `-1`). |
 
 > **Cross-phase reuse:** Build Steps 13-14 invoke `bkit-debug-failure-diagnose` / `bkit-debug-failure-remediate` (in-build test failures). See the Debug Phase entries.
diff --git a/.bkit/version b/.bkit/version
index 6a64f6125..2fd83a0d1 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -15,8 +15,8 @@
     ".bkit/.env.example": "33195c635ab4b35dea8990a278bb28193f4b5f331dcbdc5c975aeb5f51743e41",
     ".opencode/opencode.json": "83dbad6e236be57944702da355ea2d823db481408f14a4b9f522225d2ed27d75",
     ".claude/commands/bkit-auto.md": "2fb94062947b55466f7baed87ee27347e2626d6a43200691ff68cb7f62a0947f",
-    ".claude/commands/bkit-build.md": "f4472c83a15b4a1b5efd281d69f0e2f4edec0388b6ec15c593dd67e8c41e6d20",
-    ".claude/commands/bkit-debug.md": "025f3de595d6365f43d4f986b5e06e36c8ffa6441c7eb61be34f05150a3f7912",
+    ".claude/commands/bkit-build.md": "e19fa533661b28c1b1f9caed5df63ba06de79106b3087657a1af821fdc93f42c",
+    ".claude/commands/bkit-debug.md": "4f41cd5826ef2a880dd8f3cba9de9bfe3d4fd7d114969a89f684951e05a488d0",
     ".claude/commands/bkit-design.md": "0757693c8e91c830aa36220a928a72d81aedb72cc51207364319214bd3902c6a",
     ".claude/commands/bkit-plan.md": "10d26eccf148db714a03d5883f1a95722dcab09d29c34d3532245e188ff4abe2",
     ".claude/commands/bkit-ship.md": "ef1dbe5e65a0d289cf6a4014f0bc016667276a0658fe90b969bc6f78ef847e5e",
@@ -24,7 +24,7 @@
     ".claude/agents/bkit-build-challenge-2.md": "0ef8a829af9b89602a75ac257a093e4a47169ca9c2a4c216d6f11937e2e9c48f",
     ".claude/agents/bkit-build-install-skills.md": "0249b5fe6550c45afe95972d1d3f4a65f7e159a74038ce9179ca1fceb29e1d12",
     ".claude/agents/bkit-build-plan-gaps-remediate.md": "62f9aa0a792e7adb01a83b29ea51e6ea4d2e1530923ddc2f0fa98ce4c8b1ca03",
-    ".claude/agents/bkit-build-plan-verify.md": "4579dc2cf9db1efb0a3e3361efc2ac60b3889f3914f4e699b46d97a9c5c9e7ef",
+    ".claude/agents/bkit-build-plan-verify.md": "83cff5763fbfdb0106281831796909482f56fb715eef7915e98ab6658528fa30",
     ".claude/agents/bkit-debug-abort-handover.md": "4d2ed067a5933578768325379269f51357365d7740986a2de580f022bace0a26",
     ".claude/agents/bkit-debug-failure-diagnose.md": "9169cb6210ffbe5a0d6237e81da9f7299067a0db2bdff6a35af6961ce608caa9",
     ".claude/agents/bkit-debug-failure-remediate.md": "0711217d55056389f25a82431d04bbb587c3124da45d5ea0f1d6f6bcbead04f5",
@@ -47,8 +47,8 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "1b7656fc438127f67b566c9f532e6a39649c79e1bda1814608a4f3d44daed45b",
     ".claude/agents/bkit-utility-update-documentation.md": "58eef51a24cbbd53a16c12cf603888fc4a98963bb7dadbde0b60a7e3207eb43c",
     ".cursor/commands/bkit-auto.md": "f363b93008d334ca20e3825f5a734cd5cd0b5ad27e4287c0231985702653826a",
-    ".cursor/commands/bkit-build.md": "caa2613cae28cf7e76077f6e1bc6920474bb098a2fafe5e413caadf990f2a145",
-    ".cursor/commands/bkit-debug.md": "c59d2b8a4f7577d5ac23d9454718097943831916340f87655b1cfdca6641305b",
+    ".cursor/commands/bkit-build.md": "62c0411e745aa287505e1c369d3f7ed74487231de0986c425bb3d8a02c50ab11",
+    ".cursor/commands/bkit-debug.md": "eec74fe3cee1540f24731402df37503604243edc7c61e200380287bfbf950d46",
     ".cursor/commands/bkit-design.md": "8129e74e460ed742c62fb07830d099d365b6981c7094960eaeecd27811803e2b",
     ".cursor/commands/bkit-plan.md": "54493f905560e350148948e666c12b5f92b328bcab6af88608fdcee9006458c8",
     ".cursor/commands/bkit-ship.md": "47102397a3c914fdcff5066b5c57de059b8607f4a85f0ea2c5c2f852e47cba0d",
@@ -56,7 +56,7 @@
     ".cursor/agents/bkit-build-challenge-2.md": "6399d8b34ff1be2a63b77b911fd8321f80bd0bf64550103f809cdf5194820c24",
     ".cursor/agents/bkit-build-install-skills.md": "9f77d5ce2bc7e5d1c60d8860b5a06d81091f9194522607151a76838fc895da6d",
     ".cursor/agents/bkit-build-plan-gaps-remediate.md": "4067031d8aa4cc868b2401b95d4c2421ecf005ae0df29da400decc25c4254bae",
-    ".cursor/agents/bkit-build-plan-verify.md": "a86d722b0c7fb0a099637000572be9212a0351f5ccb15653ff8317da1c2db92b",
+    ".cursor/agents/bkit-build-plan-verify.md": "3c9796949e476baabd6c049db94875388849eb07c384f55138355fae4ca3bf19",
     ".cursor/agents/bkit-debug-abort-handover.md": "dbe3697156bb2068701efe79242d9e7d3554206fa266e26772bc74537c946ea9",
     ".cursor/agents/bkit-debug-failure-diagnose.md": "83da231f51d4526c7a6235475b2c40c872dc58e973e9ac30b5c9e85c98377229",
     ".cursor/agents/bkit-debug-failure-remediate.md": "597d997785131366a3bd240ffa29b82dce9be80f7bad283dd59a480e7ea9f2d4",
@@ -82,7 +82,7 @@
     ".opencode/agents/bkit-build-challenge-2.md": "9c8bdb5092b44f070468b82d88d9457ab58193d7f5697300877fc96779400e9d",
     ".opencode/agents/bkit-build-install-skills.md": "56687e9967e11c8e3ddc0c965a4818898d2ad61cc279af30ea862390eb245b8d",
     ".opencode/agents/bkit-build-plan-gaps-remediate.md": "b348e0cb7ebf3e9457dca5e071127e34068a3fec67c8a4cae4bd6486a9f571b0",
-    ".opencode/agents/bkit-build-plan-verify.md": "c3c02f1af17b77b324f767d903b5632cc3608bd3376c88d772d5834dc4b6105c",
+    ".opencode/agents/bkit-build-plan-verify.md": "bd060ff0b907dac6254682f66421751f36e1ee9c5f363ab5849837305a476ebb",
     ".opencode/agents/bkit-debug-abort-handover.md": "924dddce677e294ff9391e38e9d563b16ce14ca527db0167386dfb0898ea44a9",
     ".opencode/agents/bkit-debug-failure-diagnose.md": "341bbb7bc59750b9fd5979eb1fc715bf8a289c6b3ed86a61a976e4d6d770977f",
     ".opencode/agents/bkit-debug-failure-remediate.md": "6f7707a6a7266249350315ed6e505fa8522d1bac8ad56af1f28919c2287b48c9",
@@ -105,8 +105,8 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "f2f08f6e4de6311dd5f6a4f0573b234d31bae1e0f5d1c4c071969ca978140ee9",
     ".opencode/agents/bkit-utility-update-documentation.md": "5b274f7a0f331ee4c1ea2bcfc44a5d7855e0756e94e99dafd3d17ef942f3a032",
     ".opencode/commands/bkit-auto.md": "973d91ed58716f8b8be1009c3f2f686051cf1c8a617b14c3775814e7b356debb",
-    ".opencode/commands/bkit-build.md": "6a93755b1a88f8b0f980dc4512cacd6e1e4683319415d232f5c6899f0a5c8546",
-    ".opencode/commands/bkit-debug.md": "6a54040b8fb2bb18f98eac785ef39463ef216726e9660890eb6aab9b99cb3ee6",
+    ".opencode/commands/bkit-build.md": "0a87ef848c78dc50fcdfc13b3f1b03bea09fab231b48059a71d3cdbec8dee864",
+    ".opencode/commands/bkit-debug.md": "bce88564ceb9b4795c44e827f6a44cc78dbab7f3b61aba648d68a354fb9615e4",
     ".opencode/commands/bkit-design.md": "0d78ce47215552943f6628ddb8fadcae403ab219413e331289349b65e9955953",
     ".opencode/commands/bkit-plan.md": "d7d6d757dec7dfefe9630b273ab0348de156e2af4dc723519ce33f2db751b0b8",
     ".opencode/commands/bkit-ship.md": "da35e57e9df035ab93a8891c4b197fe1972eff5e003cecbbad6a208ec3f68d90",
@@ -122,7 +122,7 @@
     ".codex/agents/bkit-build-install-skills.toml": "ed158a6f987f24f5b0f83919e610cd7574605d2f794ffcd748eec6b12e314a76",
     ".codex/agents/bkit-build-plan-current.toml": "339cd3e95a5a7e23caf8c21de8b04866a96d47cd494c4e2f6766aeb202c355b2",
     ".codex/agents/bkit-build-plan-gaps-remediate.toml": "7559cc695ce2816a2a87402ad2e996f688004208642e1273a0ab63c394bbdb4e",
-    ".codex/agents/bkit-build-plan-verify.toml": "a304ce20d5c46377a5c65d98cff754222678ff39e124de4f8f37350caeb41edd",
+    ".codex/agents/bkit-build-plan-verify.toml": "3410a5e791fa0d2b1ab64203055565ffd05df27652c3fe0649bd3b530a1c1268",
     ".codex/agents/bkit-debug-abort-handover.toml": "1683aa233cc3b353fc32f5e73699961b326fa9466133b1ced2d674c95fd0bd7f",
     ".codex/agents/bkit-debug-failure-diagnose.toml": "4542279af7a5585e4bd711a0bae836f398a644b0cac09519aed8251a78249a36",
     ".codex/agents/bkit-debug-failure-remediate.toml": "c3230461bfbe5c85732462654780f2cbf4df8ea3cf4ff53a08307f9becfdc06d",
@@ -254,7 +254,7 @@
     ".codex/hooks/bkit-rules.cjs": "8aee2cde5448c083ae0dc07a4f1db86ce7e815a2a2eafe54b886b7f4393cab91",
     ".opencode/plugin/bkit-rules.js": "417d3ca107ebf005060953a17340620e1fcfb5bcdf491316a937e0c747b0377e",
     ".bkit/router.md": "c20d006757e350c173da94686d48500bc83e12d9f7bb6ff5911e47e332e45eab",
-    ".bkit/cli.md": "17463466f345c5c085be58ae9b0d05d447080409fc26b069e5c92fc876417a7c",
+    ".bkit/cli.md": "a537cf098bfc91c5fec5881f211a85f7cb39364b826b5e3f3aeb9d61d209287a",
     ".claude/agents/bkit-build-plan-tests.md": "048eedc214f02c1c72cdf460bf1aecea0b38836420181796cb8112e9b8eb74da",
     ".cursor/agents/bkit-build-plan-tests.md": "d8090b4065d6ba337ea522926c254a5f4a11681d7afaa47090056b71952e4dc7",
     ".opencode/agents/bkit-build-plan-tests.md": "92d4a922d62cf7d913dedf18bc3910f9333fbba3b93ba23ea341e6971b1aa6b6",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 1d1a78870..21c343aa1 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -256,7 +256,7 @@ The table lists the header bullets of the 6 workflow files, block by block, in f
 <!-- prettier-ignore -->
 | Invariant | Rule |
 | --- | --- |
-| **Diff per reader** | build, debug, ship: Every agent that reads the run's diff gets `tmp/bkit-diff-{FID}.md`, written by `bkit context diff --reset-log` in the same sub-step, just before it: build Steps 10, 11 and the Failure Path; debug Step 10 and the Failure Path; ship Step 5 and the Failure Path. Build's group verify (Step 8) reads `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md` instead: `bkit context diff --base=` the group's start commit (`status route --step=build-group-start --group=N` `parentSha`), so a group's review reads only that group's commits. Past 10000 lines the file is a per-file budget: line 1 says `partial diff coverage`, line 2 lists the files not shown whole, and the whole diff stays in `{OUTBOX}` (§ Context artifact clamping). Debug passes `--base={DIFF_BASE}` (run start commit). |
+| **Diff per reader** | build, debug, ship: Every agent that reads the run's diff gets `tmp/bkit-diff-{FID}.md`, written by `bkit context diff --reset-log` in the same sub-step, just before it: build Steps 10, 11 and the Failure Path; debug Step 10 and the Failure Path; ship Step 5 and the Failure Path. Build's group verify (Step 8) reads `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md` instead: `bkit context diff --base=` the group's start commit (`status route --step=build-group-start --group=N` `parentSha`), so a group's review reads only that group's commits. Past 10000 lines the file is a per-file budget: line 1 says `partial diff coverage`, line 2 lists the files not shown whole, and the whole diff stays in `{OUTBOX}` (§ Context artifact clamping). Debug passes `{BASE_FLAG}` (`--base={startSha}` when the run has a start commit, else empty). |
 | **Locks** | Step 1 takes the per-feature `.lock` with `bkit locks acquire --kind=workflow` once `FID` is resolved; hold `token` as `{LOCK_TOKEN}`. The lock path is absolute (`$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock`, ship included, because the lock file is gitignored and never rides a commit), so acquire / release resolve to the same inode whatever the cwd. Lock line `{at} {workflow} {fid} {token}`. Existing lock → its owning workflow's folded status.jsonl decides: `IN_PROGRESS` + last step <30min → refused (`workflow already running for {FID}`) → Failure Path; any other holder (`DONE` / `FAILED`, idle `IN_PROGRESS`, no run in the log) is reclaimed as soon as it is idle; the lock file's own age is not checked. Released in Close Workflow (`bkit locks release --token=`) and Failure Path (`bkit workflows fail --token=`, skipped when `{LOCK_TOKEN}` is empty — the run never took the lock). Release removes only the caller's own lock (another owner's stays, exit 4); a lock file that survives removal exits 5 → `Lock removal failed`. |
 | **Pre-merge CI** | Ship re-resolves CI against the PR head it is about to merge (`bkit runs gate` at Step 10), not the read taken at Step 2: on Path B the Step 4 merge of `origin/dev` moves the head before `gh pr merge`, so the earlier read describes a SHA that is no longer being merged. A failed query is not a pass — an API error (403 on PAT scope, for one) is gate code 20, never green. Anything short of a `completed` run whose capstone concluded `success` refuses the merge. |
 | **Artifact tree** | A subagent's artifact is asserted under the working directory its dispatch supplied: `{WORKTREE_PATH}` for every worktree-phase agent, ship's included. The subagent's reported path is not evidence: the `cd` and `pwd` line in the dispatch Context is prose, and agents have written to the main checkout despite it. design / plan additionally assert no `{FID}` artifact is left untracked in the main checkout before the close squash — an untracked file at the same path makes `git merge --squash` fail with `untracked working tree files would be overwritten`. |
@@ -972,12 +972,12 @@ Each subsection documents a command's behaviour: steps, subagents, artifacts, ve
 | 8 — Verify Plan | `@bkit-build-plan-verify` | `bkit tests green --group` first (§ Test-first) → `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md`, read by verify and remediate; exit >= 2 → Failure Path. `bkit context diff --base=` the group's start commit → `build-diff-{GROUP}-{VERIFY_ATTEMPT}.md`, the changes since the group started. Per group, attempt-numbered: `build-plan-verify-{GROUP}-{VERIFY_ATTEMPT}.md`. Reads the group's briefs, the diff, the execute log's `DONE —` lines, `build-tests-green-{GROUP}-{VERIFY_ATTEMPT}.md` and `build-plan-current.md` (already-landed tasks). The tick is the engine's: the agent names the task numbers the codebase satisfies on the header's `Tasks` line and `bkit tasks tick --plan= --group= --tasks="<numbers>" --green=<tests-green artifact>` writes the `[x]` — a task is satisfied only when its `DONE WHEN` field is satisfied in the codebase and the green report shows no gap for it (never on a `DONE —` claim alone). `tests green` prints `verdict` and a `fixable` per gap, so the prompt keeps only its diff reads, the `Updated tests` diff check among them, and notes the `Unproven` section without a gap. Missing `DONE WHEN` on any task → FAIL (template structure broken — remediation cannot recover, routes via Failure Path). `VERIFY_VERDICT` in `PASS\|CONCERNS\|FAIL`. PASS → `bkit tests plan-check --existence=report` lists the plan's groups: exit 1 with a `matrix` / `supersession` problem → one convert retry at Step 4 sub-step 2 (still failing → Failure Path); a group numbered above `GROUP` → group gate (§ Group gate) → `build-group-gate-{GROUP}-{VERIFY_ATTEMPT}.md` + row; none → `GATE_VERDICT` = SKIPPED. `GATE_VERDICT` in `PASS\|FAIL\|SKIPPED`; PASS + gate != FAIL → Step 7. Header `Fixable` = `true` when gap-remediate can fix any gap (each `Identified Gaps Log` line ends `— Fixable: true` / `— Fixable: false`); a test a task's `TEST EXCEPTION` field names is no gap. Every non-PASS first checks the group's verify rounds against `build.verify.maxAttempts` (`counters route --point=build.verify`; used up → § Decision Pause with the loop question when `ask` is true in a session, else Failure Path). FAIL → one fixable-only Step 9 attempt (`Scope: fixable only`) when `Fixable` = `true` and a round is left, else § Decision Pause (`VERIFY_GAPS`). Group gate FAIL alone → Step 9 while a round is left; used up → the same pause when `ask` is true in a session, else Failure Path. A pause after a red gate runs the base check first (§ Decision Pause) and carries `Gate: FAIL` in its header. Other CONCERNS → Step 9 while a round is left, never asked; else § Decision Pause (`VERIFY_GAPS`). Reads prior verify and remediate logs to know what was already verified. |
 | 9 — Remediate Gaps | `@bkit-build-plan-gaps-remediate` (only if Step 8 CONCERNS, group gate FAIL, or the fixable-only attempt) | The verify header's `Loosened` line (`VERIFY_LOOSENED`) not `none` → no fixer this round: `@bkit-build-plan-tests` restores each named test (removed or loosened expectations back as at `base`, additions kept, a `WROTE` log line), `steps finish --step=build-plan-tests` commits it, `tests red --group` records it again, Step 8 re-runs. Else attempt-numbered: `build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-log.md`; reads the group's briefs for its task blocks. Group gate FAIL → Context hands the agent the group gate command (`tests run`, log `{OUTBOX}/build-plan-gaps-remediate-{GROUP}-{VERIFY_ATTEMPT}-gate.log`): it re-runs it after each fix until exit 0, treats each newly exposed failure as a gap of the same round, sweeps for other tests built on the same failing assumption, and logs `DONE — Group gate: exit 0` (or `BLOCKED — Group gate`); `PASS` needs that line. Prompt-enforced only: Step 8's re-run is the check. Stub-first artifact + flat append-only log (`DONE —` per gap fixed; `BLOCKED —` per blocked gap, appended via `Bash echo >>`); reads glob of own prior attempts to skip already-fixed gaps. Header `Fixed` = gaps with `DONE` this attempt. Resumed into this step (a `retry` decision) → the group's last verify round is read back first: `VERIFY_ATTEMPT` (`counters derive --position=current`), `VERIFY_VERDICT` and the group gate's verdict (`status route`), the gate counted SKIPPED when that round wrote no gate log. No progress — `bkit branches scan-diff --base=HEAD~1 --code` exit 1 (nothing changed outside `docs/plans`, `docs/*.jsonl`, `.bkit/*.jsonl`: only logs and ledgers), or `Fixed` = 0 → § Decision Pause; verify never re-runs on unchanged code. Else re-run Step 8 (its next row is the next `VERIFY_ATTEMPT`). No progress after a red gate → the loop question with the base-check verdict, not a bare stop. Over `build.verify.maxAttempts` → Failure Path. |
 | 10 — Holistic Verification | `@bkit-build-plan-verify` (holistic mode), then `@bkit-build-plan-gaps-remediate` (holistic mode) on gaps | After the last group, and again each time later groups ran (challenge fix groups coming back through the loop): every group of the plan plus cross-group integration, cross-checked against every group's execute log; its tests run only for the files changed since the last holistic check that found no problems (`origin/dev` for the first check, so the first covers the whole feature diff); run-and-attempt-numbered `build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md` (`counters derive --step=build-plan-verify-holistic --position=next`). Each integration gap and each failing test is an `INTEGRATION:` line of the `Identified Gaps Log`, ending `— Fixable: true` unless closing it needs a choice the plan does not make. The agent names the satisfied task numbers per group on the header's `Tasks` line and the workflow ticks them — one `bkit tasks tick --plan= --group= --tasks="<numbers>"` call per task group; the agent edits no plan. PASS, or CONCERNS with 0 failures (a group-count concern) → Step 11. Else the run's holistic fix rounds (`counters route --of=build-plan-gaps-remediate-holistic:next --point=build.holistic`, one allowance per run with no reset after a clean check) decide, as at Step 8: used up → § Decision Pause with the loop question (`--loop=holistic`) when `ask` is true in a session, else Failure Path; `Fixable` = `false`, or the last round → § Decision Pause (`VERIFY_GAPS`, `From: holistic`); else a fix round in the same step: `@bkit-build-plan-gaps-remediate` with Context `Mode: Holistic` and `Scope: fixable only` reads the holistic report and the plan task blocks its gaps name, and writes `build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-log.md` (row `build-plan-gaps-remediate-holistic`, `--attempt-of=build-plan-verify-holistic:current`, strategy from `status route --step=build-plan-gaps-remediate-holistic`). No progress (`branches scan-diff --base=HEAD~1 --code` exit 1, or `Fixed` = 0) → § Decision Pause; else Step 10 runs again. Resume: a holistic verify row with CONCERNS or FAIL resumes at Step 10; a `retry` decision from holistic, or a done holistic fix row, resumes at the fix round, which reads `HOLISTIC_ATTEMPT` back (`--position=current`). |
-| 11 — Build Challenge | `@bkit-build-challenge-2`, plus `@bkit-build-challenge-1` on a large change (parallel) | At most `build.challenge.maxAttempts` rounds (`CHALLENGE_MAX`, `counters max --point=build.challenge`; `challenge merge --round` refuses a round over it, exit 2 → Failure Path): `CHALLENGE_DONE` (`bkit status resume` `challengeDone`, the last round already merged) → Step 12 without reviewing again. `bkit challenge gate` fetches `origin dev` (offline → the last fetch, logged), then sizes `origin/dev...HEAD`, on every pass (`docs/plans/**` excluded): under 300 lines and 10 files is small → the security reviewer (`-2`) runs alone and the finish and merge drop challenge-1's artifact and report; else both run. Each reviewer reads the same `tmp/bkit-diff-{FID}.md`, written just before (§ Diff per reader); on `partial diff coverage` challenge-2 runs a targeted `git diff` on each omitted file touching a security-relevant path. Reviewers read the plan and the diff only. Each writes every finding as one task block under `Findings Log` (`build-challenge-1.md`, `build-challenge-2.md`): severity, class, `Fixable`, `Location`, `DONE WHEN`, and a `TEST FIRST` for every finding. `bkit challenge merge --plan={FID}-plan.md` then appends the `CRITICAL\|HIGH\|MEDIUM` findings to the plan as task blocks stamped `**Round:** N`, in new last groups of <= `bkit.workflows.tasks.maxPerGroup` tasks, plus one `Derived Test Matrix` row per appended task's test when the plan carries the table; a finding at the `Location` and severity of an earlier challenge task that is still open reopens that task instead (its `**Round:**` line gains the round, e.g. `1, 2`; listed in `reopened` and `fixTasks`), one already done in an earlier round gets a new task; writes each `LOW` one as a `docs/deferrals.jsonl` row (`reason` `low-severity`), drops findings a `build-decision-*.md` item accepted, and prints the route: `none` → Step 12; `fix` (every task fixable, in any round) → Step 7, whose brief takes the first new group, `CHALLENGE_ROUND` + 1 before the last round, `CHALLENGE_DONE` = true in it; `pause` (a `**Fixable:** false` task, or more findings than one merge takes, which writes nothing) → § Decision Pause. A re-run on the same reports appends nothing. Exit 22 (a report not in task-block form) or exit 23 (the findings fail `plan-check`: a missing `TEST FIRST`, a test cap passed; `problems` printed) → reviewers re-run once with the reason in their Context, then Failure Path. Resumed into an open challenge Decision Pause → the limit read (`CHALLENGE_MAX`) and sub-steps 2 and 5 run again (the merge finds its tasks in the plan, writes nothing and prints the round's open tasks as `fixTasks`) → back to the pause's question. The challenge row carries the `round` it ran as (`--field=round=`); `bkit status resume` reads it back as `challengeRound` — one more once a challenge's merge wrote tasks (its next row is `build-plan-tasks` or `build-decision`, not `build-run-tests`), at most `CHALLENGE_MAX`; `challengeDone` = true once a last-round challenge row has a route row after it. |
+| 11 — Build Challenge | `@bkit-build-challenge-2`, plus `@bkit-build-challenge-1` on a large change (parallel) | At most `build.challenge.maxAttempts` rounds (`CHALLENGE_MAX`, `counters max --point=build.challenge`; `challenge merge --round` refuses a round over it, exit 2 → Failure Path): `CHALLENGE_DONE` (`bkit status resume` `challengeDone`, the last round already merged) → Step 12 without reviewing again. `bkit challenge gate` fetches `origin dev` (offline → the last fetch, logged), then sizes the diff from the feature's start commit, on every pass (`docs/plans/**` excluded): under 300 lines and 10 files is small → the security reviewer (`-2`) runs alone and the finish and merge drop challenge-1's artifact and report; else both run. Each reviewer reads the same `tmp/bkit-diff-{FID}.md`, written just before (§ Diff per reader); on `partial diff coverage` challenge-2 runs a targeted `git diff` on each omitted file touching a security-relevant path. Reviewers read the plan and the diff only. Each writes every finding as one task block under `Findings Log` (`build-challenge-1.md`, `build-challenge-2.md`): severity, class, `Fixable`, `Location`, `DONE WHEN`, and a `TEST FIRST` for every finding. `bkit challenge merge --plan={FID}-plan.md` then appends the `CRITICAL\|HIGH\|MEDIUM` findings to the plan as task blocks stamped `**Round:** N`, in new last groups of <= `bkit.workflows.tasks.maxPerGroup` tasks, plus one `Derived Test Matrix` row per appended task's test when the plan carries the table; a finding at the `Location` and severity of an earlier challenge task that is still open reopens that task instead (its `**Round:**` line gains the round, e.g. `1, 2`; listed in `reopened` and `fixTasks`), one already done in an earlier round gets a new task; writes each `LOW` one as a `docs/deferrals.jsonl` row (`reason` `low-severity`), drops findings a `build-decision-*.md` item accepted, and prints the route: `none` → Step 12; `fix` (every task fixable, in any round) → Step 7, whose brief takes the first new group, `CHALLENGE_ROUND` + 1 before the last round, `CHALLENGE_DONE` = true in it; `pause` (a `**Fixable:** false` task, or more findings than one merge takes, which writes nothing) → § Decision Pause. A re-run on the same reports appends nothing. Exit 22 (a report not in task-block form) or exit 23 (the findings fail `plan-check`: a missing `TEST FIRST`, a test cap passed; `problems` printed) → reviewers re-run once with the reason in their Context, then Failure Path. Resumed into an open challenge Decision Pause → the limit read (`CHALLENGE_MAX`) and sub-steps 2 and 5 run again (the merge finds its tasks in the plan, writes nothing and prints the round's open tasks as `fixTasks`) → back to the pause's question. The challenge row carries the `round` it ran as (`--field=round=`); `bkit status resume` reads it back as `challengeRound` — one more once a challenge's merge wrote tasks (its next row is `build-plan-tasks` or `build-decision`, not `build-run-tests`), at most `CHALLENGE_MAX`; `challengeDone` = true once a last-round challenge row has a route row after it. |
 | 12 — Run Tests | — | `bkit tests run` runs the deepest `bkit:gate:*` the consumer declares — descending `static-unit-integration`, `static-unit` (§ Local gate scripts) — and saves the full output to `{OUTBOX}/run-tests-{TEST_ATTEMPT}.log`; `--artifact` writes a copy clamped with `debug-evidence` to `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`, which rides the step's commit (row `artifacts` + `clamped`), so the log survives the worktree. `.md`, not `.log`: `*.log` is gitignored. Exit 3 (no gate declared) / 4 (gate could not run, 126 / 127) → Failure Path, never a FAIL verdict. Pre-PR: no E2E (CI covers it on the resulting PR). Build does not run the live tier — the @live boundary needs a deployed URL, so it is validated post-merge by the push-only `bkit-tests-live` CI canary and reproduced on demand via `/bkit-debug`; build gates on local tiers only and records no `testsLiveSkipped` (out of build's scope by design, not skipped). A repo gating unit branch-coverage puts `test:coverage:unit` in `bkit:lane:unit`, so this gate and the CI unit lane run the same `package.json` script (one source for the threshold) and a coverage regression fails in the worktree here instead of only on the PR. `TEST_VERDICT` = PASS → Step 15. FAIL with a round left under `build.tests.maxAttempts` → `counters progress --check=build-run-tests --fix=build-failure-remediate`: `trend` `stuck` or `worse` → § Decision Pause (`TESTS_LOOP`: Stop / Try again), else Step 13 without asking; none left → § Decision Pause (`TESTS_LOOP`) when `ask` is true in a session, else Failure Path. |
 | 13 — Diagnose Failure | `@bkit-debug-failure-diagnose` (only if Step 12 FAIL) | Reads the committed Step 12 test log `docs/plans/{YYYYMM}/logs/{FID}/run-tests-{TEST_ATTEMPT}.md`. Writes `build-failure-diagnose-{TEST_ATTEMPT}.md`. Resumed into Steps 13-14 → `TEST_ATTEMPT` is read back (`counters derive --step=build-run-tests --position=current`). |
 | 14 — Remediate Failure | `@bkit-debug-failure-remediate` (only if Step 12 FAIL) | Gets the diagnosis's `Strategy` in its Context (`status route --step=build-failure-diagnose` `strategy`). Writes `build-failure-remediate-{TEST_ATTEMPT}-log.md`. Stub-first artifact + flat append-only log (`DONE —` per fix step; `BLOCKED —` per blocked step, appended via `Bash echo >>`). No skip-done — each attempt is diagnosis-driven and may pick a different strategy. Re-run Step 12 (its next row is the next `TEST_ATTEMPT`). |
 | 15 — Summary | `bkit workflows summary` | Unticked plan tasks, or no plan file (`No plan file`) → FAIL. A group's execute or gaps-fix FAIL answered by that group's later non-FAIL verify, or a challenge FAIL answered by its fix tasks or a Decision Pause, is a CONCERNS reason. A group's verify FAIL is resolved by a later passing holistic verify, and a group-gate FAIL by a later passing Step 12 run, because a Decision Pause `Fix now` can move the fix into a new group so the failed group is never checked again. Commit `chore({FID}): summary` → open-PR probe → push (`-u origin {BRANCH}`). PR already open (resumed build) → push would fire CI + cloud auto-router on a branch build is still writing → probe stops run first (same probe as Step 16). `bkit-cloud.yml` backstop: no-op while build runs (`.bkit/cloud.md` § Branch-aware routing). |
-| 16 — Close Workflow & Create PR | — | `bkit:auto` re-read before close-workflow commit; open-PR probe; `bkit branches scan-diff --base=origin/dev --paths='(^\|/)(migrations\|migrate)/'` (case-insensitive, any depth — covers Supabase, Prisma, Drizzle, Rails) → `FORCE_BUILD`. `bkit prs open` (base pinned `dev`; body = the `bkit:issue` / `bkit:fid` marker + plan path; retries the create once; reads the base back → exit 6 when it is not `dev`, guarding repos whose default base is `main`); exit 80 → `create_pull_request` with the printed `title` / `body` / `base` / `head`. `FORCE_BUILD` → `bkit branches force-build --open-pr=<n>` after the PR opens: ` bkit [force build]` into the PR title (`gh pr edit`; exit 80 → `update_pull_request`, re-run `--title-set`), then an empty `chore({FID}): force build bkit [force build]` commit (auto-route suffix from `--label`) pushed — its `synchronize` event starts the run that reads the new title. Never amends; an `engine-action` row skips the commit on a re-run. Then CI-Dispatch Gate (`bkit runs dispatch`). Set state `In Review`; phase label `Build` persists. Worktree persists for follow-up `/bkit-debug` or `/bkit-ship`. Final return displays `build-summary.md` verbatim, appends what `bkit tips --workflow=<name>` prints (one tip, the star line, then how to silence both) as `## bkit Tips`, then offers a plain-English explanation on request. |
+| 16 — Close Workflow & Create PR | — | `bkit:auto` re-read before close-workflow commit; open-PR probe; `bkit branches scan-diff --paths='(^\|/)(migrations\|migrate)/'` (case-insensitive, any depth — covers Supabase, Prisma, Drizzle, Rails) → `FORCE_BUILD`. `bkit prs open` (base pinned `dev`; body = the `bkit:issue` / `bkit:fid` marker + plan path; retries the create once; reads the base back → exit 6 when it is not `dev`, guarding repos whose default base is `main`); exit 80 → `create_pull_request` with the printed `title` / `body` / `base` / `head`. `FORCE_BUILD` → `bkit branches force-build --open-pr=<n>` after the PR opens: ` bkit [force build]` into the PR title (`gh pr edit`; exit 80 → `update_pull_request`, re-run `--title-set`), then an empty `chore({FID}): force build bkit [force build]` commit (auto-route suffix from `--label`) pushed — its `synchronize` event starts the run that reads the new title. Never amends; an `engine-action` row skips the commit on a re-run. Then CI-Dispatch Gate (`bkit runs dispatch`). Set state `In Review`; phase label `Build` persists. Worktree persists for follow-up `/bkit-debug` or `/bkit-ship`. Final return displays `build-summary.md` verbatim, appends what `bkit tips --workflow=<name>` prints (one tip, the star line, then how to silence both) as `## bkit Tips`, then offers a plain-English explanation on request. |
 
 **Failure Path includes handover:** when exhausted retry counts trigger it, it invokes `@bkit-debug-abort-handover` and posts the `Workflow Handover` comment.
 
@@ -1069,7 +1069,7 @@ The following table describes the local discovery route and shared step mechanic

<!-- prettier-ignore -->
 | Step | Subagent(s) | Notes |
 | --- | --- | --- |
 | 1 — Start Workflow | — | Pre-flight: `bkit repo info --fetch`. Issue recovery as in design Step 1 (issue-less: tracker reads, labels and comments skipped). `bkit issues labels --phase=debug`: sets `bkit:debug`, drops the prior phase label, `next:*` and `bkit:failed`; state `In Progress`. PR-mode: `PR_NUMBER` → `PUSH_MODE`; on `dev` / `main` no `prs probe`, `PUSH_MODE` = LOCAL. `DEBUG_ATTEMPT` + `DEBUG_MODE` per Mode detection above. No commits on `dev`: the `start-workflow` step entry waits for Step 2, inside the worktree. |
-| 2 — Worktree Setup | — | Debug creates no branch. An explicit `--branch` safely adopts the named existing branch; otherwise resume `.worktrees/{FID}`, adopt an existing `feat/{FID}`, or adopt the current branch in place. `main` is ineligible. Another feature's in-place run blocks adoption. Hold `startSha` as `DIFF_BASE`, or `origin/dev` when null. Write the debug input and persist the attempt, modes and validated evidence selection before downstream resume. |
+| 2 — Worktree Setup | — | Debug creates no branch. An explicit `--branch` safely adopts the named existing branch; otherwise resume `.worktrees/{FID}`, adopt an existing `feat/{FID}`, or adopt the current branch in place. `main` is ineligible. Another feature's in-place run blocks adoption. Hold `startSha` as `START_SHA`; `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty. Write the debug input and persist the attempt, modes and validated evidence selection before downstream resume. |
 | 3 — Run Tests | — | **Loop head (both modes).** `NORMAL_ATTEMPT` = this row's `attempt` (`steps done --attempt=next`). `bkit tests run` runs the deepest `bkit:gate:*` the consumer declares — descending `static-unit-integration-e2e-live`, `static-unit-integration-e2e`, `static-unit-integration`, `static-unit`; `[live=off]` drops the live candidate (§ Local gate scripts). Iteration 1 = reproduce. Records `verdict` + `failures` + `scope` (the gate script name; ends `:live` only when the live gate ran); writes the status row but does not commit it — a `chore(...)` HEAD here would let a preview host's `^chore:` ignore rule cancel the preview and demote CI to a partial tier, skipping the suites the loop is proving; `parentSha` advances transitively through Steps 4-7. PASS routes on active-run rows, not the attempt count: a fix step ran (`debug-failure-remediate` / `debug-failure-soak`, one `counters route --of=<step>,<step>:count`) → Step 9; Failure Reproduce ran, no fix since (reproduce tests passed on the re-run — intermittent) → Step 10 (CONCERNS); neither + `REPRO` → Step 4; neither → Step 10; FAIL + NORMAL + `FIX_ATTEMPT` (`counters route --of=debug-failure-remediate:next --all-runs --point=debug.fix`) within the limit → Loop Question (from the second attempt; asks only when `counters progress` `trend` is `stuck` or `worse`) → Step 4; FAIL + NORMAL + used up → `bkit status meta --debug-mode=SOAK` → the SOAK check; FAIL + SOAK + `SOAK_ATTEMPT` (`--of=debug-failure-soak:next --all-runs --point=debug.soak`) within the limit → Loop Question → Step 4; used up with `debug.soak.ask` true in a session → Loop Question (`LOOP_LIMIT`) → Step 4; else → Failure Path. |
 | 4 — Fetch Context | — | (on FAIL with budget, or before Reproduce) Mode-agnostic. Every consumer `context-fetch` block (`bkit context list-blocks` → `fetch`, fenced + clamped) + a related-issues tracker search → per-context `context-*-{DEBUG_ATTEMPT}.md` written only when content exists; `bkit context finalise` → `FETCH_VERDICT`, `contextsConfigured`, `clamped`. Routes: PASS → Step 5; SOAK → Step 8; else → Step 6. |
 | 5 — Failure Reproduce | `@bkit-debug-failure-reproduce` (only if `REPRO` and first Run Tests PASS) | Writes `debug-failure-reproduce-{NORMAL_ATTEMPT}.md` + tests failing on the reported symptoms (`Mode: SOAK` → they repeat the scenario until they fail reliably); no implementation changes. `steps finish` commits `test({FID}): reproduce reported failure`, holds `Reproduced`. `YES` → Step 3 (its FAIL row = the red; its PASS row with no fix since → Step 10); `NO` → test changes removed → Step 10. |
@@ -1078,7 +1078,7 @@ The following table describes the local discovery route and shared step mechanic
 | 8 — Failure Remediate Soak | `@bkit-debug-failure-soak` (only if `DEBUG_MODE` = SOAK) | `SOAK_ATTEMPT` = soak rows across every debug run of the feature + 1 (`--count-field=soakAttempt=debug-failure-soak:next:all`). One accumulating context (reads its prior `debug-failure-soak-*-log.md`) applies the single next instrument-or-fix step against the failing boundary (the real model/DB/stream behind a live tier when one ran, else the failing tier the run surfaced); adds `[DEBUG-OBSERVE]` scaffolding and strips every marker before any declared fix (no-leak); commits `fix({FID}): soak {description}`. → loop to Step 3. Bounded by `debug.soak.maxAttempts`, counted across the feature's debug runs. |
 | 9 — Push Remediation | — | (PASS after a fix) Status file-only (no intermediate commit so Step 7/8's `fix(...)` stays HEAD at push). PR-mode: append `bkit [verbose ci]` to PR title if absent. Push (skipped on `dev`: the Step 11 close pushes). → Step 10. |
 | 10 — Summary | `bkit workflows summary` | Commit `chore({FID}): summary{VERBOSE_SUFFIX}` → push (skipped on `dev`). `SUMMARY_VERDICT` = PASS / CONCERNS → Step 11; FAIL → Failure Path. |
-| 11 — Close Workflow | — | A live `prs probe --head` (any base; skipped on `dev` / `main`) sets `{PR_OPEN}` and re-records `PUSH_MODE` (`bkit status meta --push-mode`); labels, the subject suffix, the title strip and `TRIGGER_PR` all key on it, not on the Step-1 value. No-leak assertion: fails the run if any added `[DEBUG-OBSERVE]` line survives the debug diff (`bkit branches scan-diff --base={DIFF_BASE} --marker="[DEBUG-OBSERVE]" --expect-none`, exit 1 on a hit: added lines of `{DIFF_BASE}...HEAD`, excluding `docs/plans/`) before the CI-triggering push — diff-scoped, not a tree-wide `git grep`, so the bkit-managed prompt / command files that quote the literal marker never false-trip (the soak agent's own `git grep '[DEBUG-OBSERVE]'` self-check in `bkit-debug-failure-soak.md` is the first layer). Else Failure Path. PR open: strip `bkit [verbose ci]` from PR title. Commit `chore({FID}): close-workflow{VERBOSE_SUFFIX}` → push + (LOCAL, no PR) `chore({FID}): create-pr{VERBOSE_SUFFIX}` (`VERBOSE_SUFFIX = " bkit [verbose ci]"` iff `PUSH_MODE = LOCAL`) via `bkit branches push --commit= --label=` (one per run, `engine-action` row). Auto-route marker `bkit [auto route]` on the CI-triggering HEAD when `bkit:auto`. Records `testsLiveSkipped` when no live tier ran (no `test:...:live` task in `scope`). Set state `In Review`; phase label `Debug` persists. Worktree persists. On `dev` the close pushes through `bkit branches push --mode=dev --require-ci` (the run's own commits; the pushed `sha` is `{DEV_SHA}` and the close is recorded against it), then `runs dispatch --sha`, `runs wait --until=completed` and `runs gate --capstone-only` on that sha run before `locks release`; `skipped: no-run-commits` (every run commit already on `origin/dev`) → narrated, no CI run gated, lock released; a red run, a refused push or a replay conflict → Failure Path naming the run. The handover path runs via Failure Path. Final return displays `debug-summary.md` verbatim, appends what `bkit tips --workflow=<name>` prints (one tip, the star line, then how to silence both) as `## bkit Tips`, then offers a plain-English explanation on request. |
+| 11 — Close Workflow | — | A live `prs probe --head` (any base; skipped on `dev` / `main`) sets `{PR_OPEN}` and re-records `PUSH_MODE` (`bkit status meta --push-mode`); labels, the subject suffix, the title strip and `TRIGGER_PR` all key on it, not on the Step-1 value. No-leak assertion: fails the run if any added `[DEBUG-OBSERVE]` line survives the debug diff (`bkit branches scan-diff {BASE_FLAG} --marker="[DEBUG-OBSERVE]" --expect-none`, exit 1 on a hit: added lines of the run's diff, excluding `docs/plans/`) before the CI-triggering push — diff-scoped, not a tree-wide `git grep`, so the bkit-managed prompt / command files that quote the literal marker never false-trip (the soak agent's own `git grep '[DEBUG-OBSERVE]'` self-check in `bkit-debug-failure-soak.md` is the first layer). Else Failure Path. PR open: strip `bkit [verbose ci]` from PR title. Commit `chore({FID}): close-workflow{VERBOSE_SUFFIX}` → push + (LOCAL, no PR) `chore({FID}): create-pr{VERBOSE_SUFFIX}` (`VERBOSE_SUFFIX = " bkit [verbose ci]"` iff `PUSH_MODE = LOCAL`) via `bkit branches push --commit= --label=` (one per run, `engine-action` row). Auto-route marker `bkit [auto route]` on the CI-triggering HEAD when `bkit:auto`. Records `testsLiveSkipped` when no live tier ran (no `test:...:live` task in `scope`). Set state `In Review`; phase label `Debug` persists. Worktree persists. On `dev` the close pushes through `bkit branches push --mode=dev --require-ci` (the run's own commits; the pushed `sha` is `{DEV_SHA}` and the close is recorded against it), then `runs dispatch --sha`, `runs wait --until=completed` and `runs gate --capstone-only` on that sha run before `locks release`; `skipped: no-run-commits` (every run commit already on `origin/dev`) → narrated, no CI run gated, lock released; a red run, a refused push or a replay conflict → Failure Path naming the run. The handover path runs via Failure Path. Final return displays `debug-summary.md` verbatim, appends what `bkit tips --workflow=<name>` prints (one tip, the star line, then how to silence both) as `## bkit Tips`, then offers a plain-English explanation on request. |
 
 **Failure Path** includes a conditional handover via `@bkit-debug-abort-handover` when max-retry is exhausted → `debug-handover.md`. In PR mode `bkit [verbose ci]` is kept (not stripped), because the investigator wants verbose CI to continue (§ `bkit [verbose ci]` Marker Propagation, cleanup invariant).
 
diff --git a/.claude/agents/bkit-build-plan-verify.md b/.claude/agents/bkit-build-plan-verify.md
index d6bd9720e..06b938873 100644
--- a/.claude/agents/bkit-build-plan-verify.md
+++ b/.claude/agents/bkit-build-plan-verify.md
@@ -84,7 +84,7 @@ autoCompactWindow: 300000
      - The API contracts match.
      - Shared state is consistent.
      - Cross-domain boundaries are respected.
-   - Run `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`. Your Context names `Test base`: the commit the last clean holistic check tested up to, or `origin/dev` for the first check.
+   - Run `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`. Your Context names `Test base`: the commit the last clean holistic check tested up to, or the feature's start commit for the first check.
      - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - Log each integration gap and each failing test as one gap: append `INTEGRATION: {what does not work together, naming the groups or tasks} — Fixable: true|false` with Bash `echo >>`, and describe it under `Integration Gaps`.
      - `Fixable: false` only when closing the gap needs a choice the plan does not make; the owner then decides. Every other gap is `Fixable: true`, because the holistic fix round closes it.
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index 5f3b758f3..bafca1f72 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -840,7 +840,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic --position=next
    ```
    Hold `value` as `HOLISTIC_ATTEMPT`.
-   Read the commit the last clean holistic check tested up to, `origin/dev` when there is none:
+   Read the commit the last clean holistic check tested up to, the feature's start commit when there is none:
    ```bash
    "{BKIT}" status route --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic
    ```
@@ -1228,7 +1228,7 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **Else** → sub-step 2.
 2. Scan the branch for migrations:
    ```bash
-   "{BKIT}" branches scan-diff --base=origin/dev --paths='(^|/)(migrations|migrate)/' >/dev/null
+   "{BKIT}" branches scan-diff --paths='(^|/)(migrations|migrate)/' >/dev/null
    ```
    Route:
    - **If** exit 0 → `FORCE_BUILD` = true → sub-step 3.
diff --git a/.claude/commands/bkit-debug.md b/.claude/commands/bkit-debug.md
index 9533be6d0..6c83a6e68 100644
--- a/.claude/commands/bkit-debug.md
+++ b/.claude/commands/bkit-debug.md
@@ -87,7 +87,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 3. **If** `HANDOVER_NEEDED` = true → step 4. **Else** → step 5. Gate on failure shape only; never on worktree presence.
 4. **Skip if** `{WORKTREE_PATH}` is not set. Write the run's diff to the file the agent reads (a failure leaves it out):
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --base={DIFF_BASE} --fid={FID} --step=abort-handover >/dev/null
+   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" {BASE_FLAG} --fid={FID} --step=abort-handover >/dev/null
    ```
    **Subagent:** Invoke `@bkit-debug-abort-handover` using `Agent` tool:
    Context: You are a subagent in the Debug phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
@@ -265,7 +265,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```bash
    "{BKIT}" worktrees setup --workflow=debug --fid={FID} --month={YYYYMM} --detect {BRANCH_FLAG}
    ```
-   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `DIFF_BASE` (`origin/dev` when null).
+   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `START_SHA`; `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty.
    Route:
    - **If** exit 0 → `cd "{WORKTREE_PATH}"` → verify with `pwd` → sub-step 2.
    - **If** exit 3 → resolve the rebase:
@@ -677,7 +677,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    PR_OPEN="{PR_OPEN}"
    "{BKIT}" status meta --file="{STATUS}" --workflow=debug --push-mode={PUSH_MODE} >/dev/null || exit 1
    if [ "$PR_OPEN" = 1 ]; then "{BKIT}" prs verbose-ci --number={PR_NUMBER} --state=off; fi
-   "{BKIT}" branches scan-diff --base={DIFF_BASE} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
+   "{BKIT}" branches scan-diff {BASE_FLAG} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
    "{BKIT}" roadmap mirror --workflow=debug --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=debug --fid={FID} --month={YYYYMM} --file="{STATUS}" --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" --verbose-ci-local {LABEL_FLAGS} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md" --session-dir="{SESSION_DIR}" || exit $?
    ```
diff --git a/.codex/agents/bkit-build-plan-verify.toml b/.codex/agents/bkit-build-plan-verify.toml
index 5029c2f65..d1b96682c 100644
--- a/.codex/agents/bkit-build-plan-verify.toml
+++ b/.codex/agents/bkit-build-plan-verify.toml
@@ -71,7 +71,7 @@ developer_instructions = """
      - The API contracts match.
      - Shared state is consistent.
      - Cross-domain boundaries are respected.
-   - Run `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`. Your Context names `Test base`: the commit the last clean holistic check tested up to, or `origin/dev` for the first check.
+   - Run `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`. Your Context names `Test base`: the commit the last clean holistic check tested up to, or the feature's start commit for the first check.
      - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - Log each integration gap and each failing test as one gap: append `INTEGRATION: {what does not work together, naming the groups or tasks} — Fixable: true|false` with Bash `echo >>`, and describe it under `Integration Gaps`.
      - `Fixable: false` only when closing the gap needs a choice the plan does not make; the owner then decides. Every other gap is `Fixable: true`, because the holistic fix round closes it.
diff --git a/.cursor/agents/bkit-build-plan-verify.md b/.cursor/agents/bkit-build-plan-verify.md
index 0d692e587..09e94ddd2 100644
--- a/.cursor/agents/bkit-build-plan-verify.md
+++ b/.cursor/agents/bkit-build-plan-verify.md
@@ -81,7 +81,7 @@ tools:
      - The API contracts match.
      - Shared state is consistent.
      - Cross-domain boundaries are respected.
-   - Run `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`. Your Context names `Test base`: the commit the last clean holistic check tested up to, or `origin/dev` for the first check.
+   - Run `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`. Your Context names `Test base`: the commit the last clean holistic check tested up to, or the feature's start commit for the first check.
      - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - Log each integration gap and each failing test as one gap: append `INTEGRATION: {what does not work together, naming the groups or tasks} — Fixable: true|false` with Bash `echo >>`, and describe it under `Integration Gaps`.
      - `Fixable: false` only when closing the gap needs a choice the plan does not make; the owner then decides. Every other gap is `Fixable: true`, because the holistic fix round closes it.
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index e6e112df1..291de32de 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -839,7 +839,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic --position=next
    ```
    Hold `value` as `HOLISTIC_ATTEMPT`.
-   Read the commit the last clean holistic check tested up to, `origin/dev` when there is none:
+   Read the commit the last clean holistic check tested up to, the feature's start commit when there is none:
    ```bash
    "{BKIT}" status route --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic
    ```
@@ -1227,7 +1227,7 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **Else** → sub-step 2.
 2. Scan the branch for migrations:
    ```bash
-   "{BKIT}" branches scan-diff --base=origin/dev --paths='(^|/)(migrations|migrate)/' >/dev/null
+   "{BKIT}" branches scan-diff --paths='(^|/)(migrations|migrate)/' >/dev/null
    ```
    Route:
    - **If** exit 0 → `FORCE_BUILD` = true → sub-step 3.
diff --git a/.cursor/commands/bkit-debug.md b/.cursor/commands/bkit-debug.md
index c41b29587..146e1eb77 100644
--- a/.cursor/commands/bkit-debug.md
+++ b/.cursor/commands/bkit-debug.md
@@ -86,7 +86,7 @@ Debug Feature — Autonomous diagnosis and remediation
 3. **If** `HANDOVER_NEEDED` = true → step 4. **Else** → step 5. Gate on failure shape only; never on worktree presence.
 4. **Skip if** `{WORKTREE_PATH}` is not set. Write the run's diff to the file the agent reads (a failure leaves it out):
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --base={DIFF_BASE} --fid={FID} --step=abort-handover >/dev/null
+   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" {BASE_FLAG} --fid={FID} --step=abort-handover >/dev/null
    ```
    **Subagent:** Invoke `/bkit-debug-abort-handover` using `Task` tool:
    Context: You are a subagent in the Debug phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
@@ -264,7 +264,7 @@ Debug Feature — Autonomous diagnosis and remediation
    ```bash
    "{BKIT}" worktrees setup --workflow=debug --fid={FID} --month={YYYYMM} --detect {BRANCH_FLAG}
    ```
-   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `DIFF_BASE` (`origin/dev` when null).
+   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `START_SHA`; `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty.
    Route:
    - **If** exit 0 → `cd "{WORKTREE_PATH}"` → verify with `pwd` → sub-step 2.
    - **If** exit 3 → resolve the rebase:
@@ -676,7 +676,7 @@ Debug Feature — Autonomous diagnosis and remediation
    PR_OPEN="{PR_OPEN}"
    "{BKIT}" status meta --file="{STATUS}" --workflow=debug --push-mode={PUSH_MODE} >/dev/null || exit 1
    if [ "$PR_OPEN" = 1 ]; then "{BKIT}" prs verbose-ci --number={PR_NUMBER} --state=off; fi
-   "{BKIT}" branches scan-diff --base={DIFF_BASE} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
+   "{BKIT}" branches scan-diff {BASE_FLAG} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
    "{BKIT}" roadmap mirror --workflow=debug --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=debug --fid={FID} --month={YYYYMM} --file="{STATUS}" --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" --verbose-ci-local {LABEL_FLAGS} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md" --session-dir="{SESSION_DIR}" || exit $?
    ```
diff --git a/.opencode/agents/bkit-build-plan-verify.md b/.opencode/agents/bkit-build-plan-verify.md
index fbfd640d3..100a7fdb3 100644
--- a/.opencode/agents/bkit-build-plan-verify.md
+++ b/.opencode/agents/bkit-build-plan-verify.md
@@ -82,7 +82,7 @@ tools:
      - The API contracts match.
      - Shared state is consistent.
      - Cross-domain boundaries are respected.
-   - Run `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`. Your Context names `Test base`: the commit the last clean holistic check tested up to, or `origin/dev` for the first check.
+   - Run `bkit tests changed --base={Test base} --fallback=bkit:gate:static-unit`. Your Context names `Test base`: the commit the last clean holistic check tested up to, or the feature's start commit for the first check.
      - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - Log each integration gap and each failing test as one gap: append `INTEGRATION: {what does not work together, naming the groups or tasks} — Fixable: true|false` with Bash `echo >>`, and describe it under `Integration Gaps`.
      - `Fixable: false` only when closing the gap needs a choice the plan does not make; the owner then decides. Every other gap is `Fixable: true`, because the holistic fix round closes it.
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index f5a12f930..a437e5237 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -843,7 +843,7 @@ This step checks the whole feature against the plan after the last group, and ag
    "{BKIT}" counters derive --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic --position=next
    ```
    Hold `value` as `HOLISTIC_ATTEMPT`.
-   Read the commit the last clean holistic check tested up to, `origin/dev` when there is none:
+   Read the commit the last clean holistic check tested up to, the feature's start commit when there is none:
    ```bash
    "{BKIT}" status route --file="{STATUS}" --workflow=build --step=build-plan-verify-holistic
    ```
@@ -1231,7 +1231,7 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **Else** → sub-step 2.
 2. Scan the branch for migrations:
    ```bash
-   "{BKIT}" branches scan-diff --base=origin/dev --paths='(^|/)(migrations|migrate)/' >/dev/null
+   "{BKIT}" branches scan-diff --paths='(^|/)(migrations|migrate)/' >/dev/null
    ```
    Route:
    - **If** exit 0 → `FORCE_BUILD` = true → sub-step 3.
diff --git a/.opencode/commands/bkit-debug.md b/.opencode/commands/bkit-debug.md
index 56c78d919..56e3e4565 100644
--- a/.opencode/commands/bkit-debug.md
+++ b/.opencode/commands/bkit-debug.md
@@ -90,7 +90,7 @@ $ARGUMENTS
 3. **If** `HANDOVER_NEEDED` = true → step 4. **Else** → step 5. Gate on failure shape only; never on worktree presence.
 4. **Skip if** `{WORKTREE_PATH}` is not set. Write the run's diff to the file the agent reads (a failure leaves it out):
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" --base={DIFF_BASE} --fid={FID} --step=abort-handover >/dev/null
+   cd "{WORKTREE_PATH}" && "{BKIT}" context diff --reset-log --artifact="tmp/bkit-diff-{FID}.md" {BASE_FLAG} --fid={FID} --step=abort-handover >/dev/null
    ```
    **Subagent:** Invoke `/bkit-debug-abort-handover` using `subagent` tool:
    Context: You are a subagent in the Debug phase. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
@@ -268,7 +268,7 @@ $ARGUMENTS
    ```bash
    "{BKIT}" worktrees setup --workflow=debug --fid={FID} --month={YYYYMM} --detect {BRANCH_FLAG}
    ```
-   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `DIFF_BASE` (`origin/dev` when null).
+   Hold `worktreePath` as `WORKTREE_PATH`, `{OUTBOX_ROOT}/{FID}` as `OUTBOX`, `branch` as `BRANCH`, `sentinel` as `SENTINEL`, `logDir` as `LOG_DIR`, `startSha` as `START_SHA`; `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty.
    Route:
    - **If** exit 0 → `cd "{WORKTREE_PATH}"` → verify with `pwd` → sub-step 2.
    - **If** exit 3 → resolve the rebase:
@@ -680,7 +680,7 @@ $ARGUMENTS
    PR_OPEN="{PR_OPEN}"
    "{BKIT}" status meta --file="{STATUS}" --workflow=debug --push-mode={PUSH_MODE} >/dev/null || exit 1
    if [ "$PR_OPEN" = 1 ]; then "{BKIT}" prs verbose-ci --number={PR_NUMBER} --state=off; fi
-   "{BKIT}" branches scan-diff --base={DIFF_BASE} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
+   "{BKIT}" branches scan-diff {BASE_FLAG} --marker="[DEBUG-OBSERVE]" --expect-none >/dev/null || exit 1
    "{BKIT}" roadmap mirror --workflow=debug --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=debug --fid={FID} --month={YYYYMM} --file="{STATUS}" --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" --verbose-ci-local {LABEL_FLAGS} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/debug-summary.md" --session-dir="{SESSION_DIR}" || exit $?
    ```
diff --git a/docs/decisions.jsonl b/docs/decisions.jsonl
index e4f1b9dc9..a6e79c237 100644
--- a/docs/decisions.jsonl
+++ b/docs/decisions.jsonl
@@ -862,3 +862,4 @@
 {"schema":3,"ts":1794718141563,"firstTs":1794718141563,"updates":1,"kind":"decision","key":"951-holistic-file-names-carry-run","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"utility","step":"manual"},"references":["951","https://github.com/cbartens/bkit/issues/951",".bkit/core/workflows/bkit-build.md",".bkit/core/.bkit/workflows.md","951-holistic-report-numbers-all-runs","docs/plans/202611/951-build-repeat-whole-plan.md"],"summary":"Holistic report and fix-log names carry the run number: `build-plan-verify-holistic-{RUN}-{HOLISTIC_ATTEMPT}.md` and `build-plan-gaps-remediate-holistic-{RUN}-{HOLISTIC_ATTEMPT}-log.md`","description":"Step 10 and the Decision Pause name holistic files with the `{RUN}` that Step 2 holds, like `build-decision-{RUN}-*`; `counters derive` and `steps finish --attempt-of` keep counting the active run, and the fix-log globs read `build-plan-gaps-remediate-holistic-{RUN}-*-log.md`, so a restart writes new files and overwrites none.","rationale":"923's restart counted from 1 again and overwrote build-plan-verify-holistic-1.md and -2.md. The issue body (edited after the comment that called this a separate bug) puts it in scope. Naming by run keeps every count per run, matching the other build limits.","alternatives":"Number reports across every run with `--all-runs` and `:all` (keeps one number sequence, but the report number would count differently from every other build count); leave numbering per run with no run in the name (a restart overwrites earlier reports)","status":"ACTIVE"}
 {"schema":3,"ts":1794743587133,"firstTs":1793237760995,"updates":3,"kind":"decision","key":"724-tests-lock-fixed-slots-not-live-load","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["724","921","docs/plans/202611/921-tests-lock-default-plan.md","724-test-workers-leave-one-core"],"status":"ACTIVE","summary":"The machine-wide tests lock admits a fixed number of heavy runs, defaulted from the core count; live load never decides who runs","description":"The default slot count comes from the core count: 2 slots on 8 or more cores, else 1. BKIT_TEST_SLOTS overrides it, and an invalid value falls back to that default with one stderr note. Each holder exports BKIT_TEST_WORKERS = max(1, floor(cores / slots) - 1) for the chosen slot count. Slot 1 is tests.lock and later slots use tests.<k>.lock, so runs with different slot settings still meet on slot 1. Live load never decides who runs (#921).","rationale":"Load average lags, counts unrelated work and differs across hosts; a core-count default is fixed per machine, predictable and explainable.","alternatives":"A live load-average or memory-pressure gate; a default of one slot on every machine."}
 {"schema":3,"ts":1794745755046,"firstTs":1793237760995,"updates":4,"kind":"decision","key":"724-tests-lock-fixed-slots-not-live-load","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["724","921","docs/plans/202611/921-tests-lock-default-plan.md","724-test-workers-leave-one-core"],"status":"ACTIVE","summary":"The machine-wide tests lock admits a fixed number of heavy runs, defaulted from the core count; live load never decides who runs","description":"The default slot count comes from the core count: 2 slots on 8 or more cores, else 1. BKIT_TEST_SLOTS overrides it, and an invalid value falls back to that default with one stderr note. The slot count stays per process, so an override must reach every process on the machine (the shell profile and each host's user-level settings) or be left out, because runs that read different values can hold tests slots at once. Each holder exports BKIT_TEST_WORKERS = max(1, floor(cores / slots) - 1) for the chosen slot count. Slot 1 is tests.lock and later slots use tests.<k>.lock, so runs with different slot settings still meet on slot 1. Live load never decides who runs (#921).","rationale":"Load average lags, counts unrelated work and differs across hosts; a core-count default is fixed per machine, predictable and explainable.","alternatives":"A live load-average or memory-pressure gate; a default of one slot on every machine."}
+{"schema":3,"ts":1794776238974,"firstTs":1794776238974,"updates":1,"kind":"decision","key":"960-feature-base-start-commit","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["960","https://github.com/cbartens/bkit/issues/960","665-challenge-small-change-threshold",".bkit/core/engine/commands/workflow/context.ts"],"status":"ACTIVE","summary":"Diff readers measure from featureBase, the feature's start commit, not origin/dev, so unpushed local dev commits do not count as the feature's","description":"featureBase (context.ts) returns the commit the feature branch was cut from. bkit context diff, bkit challenge gate, bkit branches scan-diff, the holistic test base fallback (cleanBase) and /bkit-debug ({BASE_FLAG}, empty when no startSha) default to it. This revises 665-challenge-small-change-threshold: the size gate measures from the feature's start commit instead of origin/dev...HEAD."}
