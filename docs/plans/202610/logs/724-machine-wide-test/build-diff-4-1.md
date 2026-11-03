diff --git a/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md b/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
index 172f97f19..c431d4cfe 100644
--- a/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
+++ b/.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md
@@ -99,6 +99,7 @@ tools:
 8. **If** `package.json` declares a `bkit:generate` script → run `pnpm bkit:generate` once, after your last code edit. It rewrites the generated files and saved baselines from your code, so the caller commits them with it.
    - **If** it exits non-zero → append `BLOCKED — bkit:generate: {first error line}` with Bash `echo >>`. The verdict is then `FAIL`, whatever the tasks and tests show.
 9. Run `bkit tests changed --fallback=bkit:gate:static-unit`. Every local test must pass. **If** Context names a group gate → run that command after the fixes, and again after each further fix, until it exits 0:
+   - **If** the group gate exits 81 → another run holds the machine-wide tests lock: run the same command again. Count the wait as no gap and no reason to edit code.
    - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - The gate stops at its first failing stage, so treat each new failure that a later run shows as another gap of this round.
    - Before you fix a failure, search for every other test and source file built on the same failing assumption.
diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index c5d3ccedf..48217c83c 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -644,6 +644,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```
    Route:
    - **If** exit 0 **or** 1 → hold `verdict` as `GATE_VERDICT` and `scope` as `TEST_SCOPE` → sub-step 9.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 9. Finish:
    ```bash
@@ -885,6 +886,7 @@ This step runs once, after the last group. Challenge fix groups pass through it
    Decide `TEST_VERDICT`:
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 3. Finish — `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown):
    ```bash
@@ -1018,6 +1020,7 @@ This step runs once, after the last group. Challenge fix groups pass through it
    "{BKIT}" branches push --mode=feature --set-upstream
    ```
 5. Route:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 16.
    - **Else** → **Failure Path**.
 
@@ -1085,19 +1088,30 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 1 → `FORCE_BUILD` = false → sub-step 3.
    - **Else** → **Failure Path**.
 3. Re-read the labels, then close the run with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. It then pushes with the HEAD-Subject Assertion and releases the lock. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
+   
    **Skip if** `ISSUE_ID` empty. Re-read the issue:
+
    ```bash
    "{BKIT}" issues fetch --issue="{ISSUE_ID}" --outbox="{OUTBOX}"
    ```
+
    Hold `state` as `STATE`, `labels` as `LABELS`. **If** exit 80 → read them via the tracker MCP (**Tracker**).
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
+
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
-   "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit 1
+   "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit "$?"
    "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
    ```
+
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
+
    Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+
 4. Create the PR. Its body names `docs/plans/{YYYYMM}/{FID}-plan.md` when the plan exists:
 
    ```bash
diff --git a/.agents/plugins/bkit/skills/bkit-debug/SKILL.md b/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
index 729f41e00..0d4880e0c 100644
--- a/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
@@ -283,6 +283,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    Decide `TEST_VERDICT`:
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown):
    ```bash
@@ -522,6 +523,10 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 9 — Push Remediation
 
@@ -549,6 +554,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    "{BKIT}" branches push --mode=feature
    ```
 3. Route:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
@@ -612,16 +618,24 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
    Release and push:
    - **If** `BRANCH` != `dev`:
+
      ```bash
      "{BKIT}" locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
      "{BKIT}" branches push --mode=feature --require-ci >/dev/null
      ```
+
+     Route:
+     - **If** exit 81 → end turn, re-run this block.
+     - **If** exit 0 → continue with the next instruction.
+     - **Else** → **Failure Path**.
+
    - **If** `BRANCH` = `dev`:
      Push ONLY the run's own commits, and keep the lock:
      ```bash
      "{BKIT}" branches push --mode=dev --require-ci --fid={FID}
      ```
      Route:
+     - **If** exit 81 → end turn, re-run this block.
      - **If** exit 0 **and** `skipped` null → hold `sha` as `DEV_SHA` (never the local HEAD); `BRANCH` = `dev` → `{CLOSE_PARENT}` = `{DEV_SHA}`; `DEV_PUSHED` = true.
      - **If** exit 0 **and** `skipped` = `no-run-commits` → narrate `[bkit-debug] dev push: every run commit is already on origin/dev; nothing pushed, no CI run to gate` → `DEV_PUSHED` = false.
      - **If** exit 8 (push failed or refused), exit 10 (fetch failed), exit 11 (replay conflict, the conflicting paths printed) or exit 20 (the run's record is gone, nothing pushed) → **Failure Path**.
@@ -645,9 +659,16 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    - **If** exit 80 → `create_pull_request` with the printed `title` / `body` / `base` / `head` → hold its number as `PR_NUMBER` and its URL as `PR_URL`.
    - **Else** → **Failure Path**.
 6. **If** `TRIGGER_PR` = 1 → commit and push the CI-triggering head. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when `ISSUE_ID` is empty:
+
    ```bash
    "{BKIT}" branches push --mode=feature --require-ci --commit="chore({FID}): create-pr bkit [verbose ci]" {LABEL_FLAGS} --file="{STATUS}" --workflow=debug
    ```
+
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
+
 7. **Run only if** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 **or** `BRANCH` = `dev`.
    **If** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 → run the CI-Dispatch Gate on the pushed head. It records `{DISPATCH_ROW}`, cross-checks the transport and records the close transport. `{DISPATCH_ROW}` = `--step=debug-close-workflow {LIVE_SKIPPED}` when `{PR_OPEN}` = 1, `--step=debug-create-pr --artifact={PR_URL}` after a created PR. `{LABEL_FLAGS}` as in sub-step 6:
 
diff --git a/.agents/plugins/bkit/skills/bkit-design/SKILL.md b/.agents/plugins/bkit/skills/bkit-design/SKILL.md
index 0de8ab3ff..5c9e795d7 100644
--- a/.agents/plugins/bkit/skills/bkit-design/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-design/SKILL.md
@@ -439,7 +439,8 @@ description: "Design Feature — Autonomous design phase"
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
-4. Route:
+4. Route — first match wins:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
diff --git a/.agents/plugins/bkit/skills/bkit-plan/SKILL.md b/.agents/plugins/bkit/skills/bkit-plan/SKILL.md
index ad300ae9d..bca376358 100644
--- a/.agents/plugins/bkit/skills/bkit-plan/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-plan/SKILL.md
@@ -370,7 +370,8 @@ description: "Plan Feature — Autonomous plan generation"
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
-5. Route:
+5. Route — first match wins:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 8.
    - **Else** → **Failure Path**.
 
diff --git a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
index 8f1042103..abc956809 100644
--- a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
@@ -205,6 +205,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **If** exit 0 **and** `PR_BASE` != dev → **Failure Path**.
    - **If** exit 0 → sub-step 3.
    - **If** exit 1 → open a PR and set `SHIP_OPENED_PR` = true. **If** `docs/plans/{YYYYMM}/{FID}-plan.md` exists → the block names it in the PR body:
+
      ```bash
      "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
      OPEN_EXIT=0
@@ -212,11 +213,17 @@ description: "Ship Feature — Autonomous merge and archive"
      case "$OPEN_EXIT" in 0 | 80) "{BKIT}" status meta --file="{STATUS}" --workflow=ship --opened-pr >/dev/null || exit 1 ;; esac
      exit "$OPEN_EXIT"
      ```
-     **If** exit 80 → `create_pull_request` with the printed `title`, `body`, `base` and `head`.
-     **If** any other non-zero exit → **Failure Path**.
+
+     Route:
+     - **If** exit 81 → end turn, re-run this block.
+     - **If** exit 0 → continue with the next instruction.
+     - **If** exit 80 → `create_pull_request` with the printed `title`, `body`, `base` and `head`.
+     - **Else** → **Failure Path**.
+
      Re-run the `bkit prs probe` above.
      Hold `number` as `PR_NUMBER`, `baseRefName` as `PR_BASE`, and hold `state`.
      Assert `PR_NUMBER` non-empty and `PR_BASE` = dev. **If** the assertion fails → **Failure Path**.
+
    - **Else** → **Failure Path**.
 3. Route:
    - **If** `state` = MERGED → record the resume marker → Step 13:
@@ -330,10 +337,18 @@ description: "Ship Feature — Autonomous merge and archive"
    Hold `outcome` as `REGEN_OUTCOME`.
    Route:
    - **If** exit 0 **and** `REGEN_OUTCOME` = committed → push it, so CI starts at the regenerated head; NEVER force:
+
      ```bash
      "{BKIT}" branches push --mode=plain >/dev/null
      ```
+
+     Route:
+     - **If** exit 81 → end turn, re-run this block.
+     - **If** exit 0 → continue with the next instruction.
+     - **Else** → **Failure Path**.
+
      Then Step 5.
+
    - **If** exit 0 **and** `REGEN_OUTCOME` = unchanged **or** undeclared → Step 5. Nothing was committed.
    - **Else** → **Failure Path**.
 
@@ -378,6 +393,10 @@ description: "Ship Feature — Autonomous merge and archive"
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 4 — Integrate
 
@@ -505,6 +524,10 @@ description: "Ship Feature — Autonomous merge and archive"
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 8 — Commit + Push Bookkeeping
 
@@ -560,10 +583,18 @@ description: "Ship Feature — Autonomous merge and archive"
        ```
        Hold `outcome` as `REGEN_OUTCOME` and `head` as `CODE_HEAD`.
        - **If** exit 0 **and** `REGEN_OUTCOME` = committed → push the fix, and NEVER force:
+
          ```bash
          "{BKIT}" branches push --mode=plain >/dev/null
          ```
+
+         Route:
+         - **If** exit 81 → end turn, re-run this block.
+         - **If** exit 0 → continue with the next instruction.
+         - **Else** → **Failure Path**.
+
          Then set `REVALIDATE_REASON` empty → Step 9 (re-validate at the regenerated head, then re-run the merge gate).
+
        - **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed).
      - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
      - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
@@ -710,11 +741,18 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
        ```
        Hold `value` as `MERGE_ATTEMPT`.
      - Commit and push the fix, and NEVER force:
+
        ```bash
        "{BKIT}" ledgers commit --month="{YYYYMM}" --fid="{FID}" --scope=full --mode=commit --stage-tracked-updates --message="fix({FID}): failure-remediate attempt {MERGE_ATTEMPT}" >/dev/null \
          || { echo "[bkit-ship] failure-remediate commit failed" >&2; exit 1; }
        "{BKIT}" branches push --mode=plain >/dev/null
        ```
+
+       Route:
+       - **If** exit 81 → end turn, re-run this block.
+       - **If** exit 0 → continue with the next instruction.
+       - **Else** → **Failure Path**.
+
      - Set `REVALIDATE_REASON` empty → Step 9 (re-validate, then re-run the merge).
    - **Else** → **Failure Path**.
 
diff --git a/.agents/skills/bkit-build/SKILL.md b/.agents/skills/bkit-build/SKILL.md
index 803bd71f1..5b104f141 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -644,6 +644,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```
    Route:
    - **If** exit 0 **or** 1 → hold `verdict` as `GATE_VERDICT` and `scope` as `TEST_SCOPE` → sub-step 9.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 9. Finish:
    ```bash
@@ -885,6 +886,7 @@ This step runs once, after the last group. Challenge fix groups pass through it
    Decide `TEST_VERDICT`:
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 3. Finish — `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown):
    ```bash
@@ -1018,6 +1020,7 @@ This step runs once, after the last group. Challenge fix groups pass through it
    "{BKIT}" branches push --mode=feature --set-upstream
    ```
 5. Route:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 16.
    - **Else** → **Failure Path**.
 
@@ -1085,19 +1088,30 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 1 → `FORCE_BUILD` = false → sub-step 3.
    - **Else** → **Failure Path**.
 3. Re-read the labels, then close the run with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. It then pushes with the HEAD-Subject Assertion and releases the lock. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
+   
    **Skip if** `ISSUE_ID` empty. Re-read the issue:
+
    ```bash
    "{BKIT}" issues fetch --issue="{ISSUE_ID}" --outbox="{OUTBOX}"
    ```
+
    Hold `state` as `STATE`, `labels` as `LABELS`. **If** exit 80 → read them via the tracker MCP (**Tracker**).
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
+
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
-   "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit 1
+   "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit "$?"
    "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
    ```
+
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
+
    Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+
 4. Create the PR. Its body names `docs/plans/{YYYYMM}/{FID}-plan.md` when the plan exists:
 
    ```bash
diff --git a/.agents/skills/bkit-debug/SKILL.md b/.agents/skills/bkit-debug/SKILL.md
index 4c51b04b9..eda4a1fec 100644
--- a/.agents/skills/bkit-debug/SKILL.md
+++ b/.agents/skills/bkit-debug/SKILL.md
@@ -283,6 +283,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    Decide `TEST_VERDICT`:
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown):
    ```bash
@@ -522,6 +523,10 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 9 — Push Remediation
 
@@ -549,6 +554,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    "{BKIT}" branches push --mode=feature
    ```
 3. Route:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
@@ -612,16 +618,24 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
    Release and push:
    - **If** `BRANCH` != `dev`:
+
      ```bash
      "{BKIT}" locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
      "{BKIT}" branches push --mode=feature --require-ci >/dev/null
      ```
+
+     Route:
+     - **If** exit 81 → end turn, re-run this block.
+     - **If** exit 0 → continue with the next instruction.
+     - **Else** → **Failure Path**.
+
    - **If** `BRANCH` = `dev`:
      Push ONLY the run's own commits, and keep the lock:
      ```bash
      "{BKIT}" branches push --mode=dev --require-ci --fid={FID}
      ```
      Route:
+     - **If** exit 81 → end turn, re-run this block.
      - **If** exit 0 **and** `skipped` null → hold `sha` as `DEV_SHA` (never the local HEAD); `BRANCH` = `dev` → `{CLOSE_PARENT}` = `{DEV_SHA}`; `DEV_PUSHED` = true.
      - **If** exit 0 **and** `skipped` = `no-run-commits` → narrate `[bkit-debug] dev push: every run commit is already on origin/dev; nothing pushed, no CI run to gate` → `DEV_PUSHED` = false.
      - **If** exit 8 (push failed or refused), exit 10 (fetch failed), exit 11 (replay conflict, the conflicting paths printed) or exit 20 (the run's record is gone, nothing pushed) → **Failure Path**.
@@ -645,9 +659,16 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    - **If** exit 80 → `create_pull_request` with the printed `title` / `body` / `base` / `head` → hold its number as `PR_NUMBER` and its URL as `PR_URL`.
    - **Else** → **Failure Path**.
 6. **If** `TRIGGER_PR` = 1 → commit and push the CI-triggering head. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when `ISSUE_ID` is empty:
+
    ```bash
    "{BKIT}" branches push --mode=feature --require-ci --commit="chore({FID}): create-pr bkit [verbose ci]" {LABEL_FLAGS} --file="{STATUS}" --workflow=debug
    ```
+
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
+
 7. **Run only if** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 **or** `BRANCH` = `dev`.
    **If** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 → run the CI-Dispatch Gate on the pushed head. It records `{DISPATCH_ROW}`, cross-checks the transport and records the close transport. `{DISPATCH_ROW}` = `--step=debug-close-workflow {LIVE_SKIPPED}` when `{PR_OPEN}` = 1, `--step=debug-create-pr --artifact={PR_URL}` after a created PR. `{LABEL_FLAGS}` as in sub-step 6:
 
diff --git a/.agents/skills/bkit-design/SKILL.md b/.agents/skills/bkit-design/SKILL.md
index 95e1ad522..6d0776766 100644
--- a/.agents/skills/bkit-design/SKILL.md
+++ b/.agents/skills/bkit-design/SKILL.md
@@ -439,7 +439,8 @@ description: "Design Feature — Autonomous design phase"
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
-4. Route:
+4. Route — first match wins:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
diff --git a/.agents/skills/bkit-plan/SKILL.md b/.agents/skills/bkit-plan/SKILL.md
index 1cdce1d85..49455416c 100644
--- a/.agents/skills/bkit-plan/SKILL.md
+++ b/.agents/skills/bkit-plan/SKILL.md
@@ -370,7 +370,8 @@ description: "Plan Feature — Autonomous plan generation"
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
-5. Route:
+5. Route — first match wins:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 8.
    - **Else** → **Failure Path**.
 
diff --git a/.agents/skills/bkit-ship/SKILL.md b/.agents/skills/bkit-ship/SKILL.md
index 6c37356cd..0a2270df6 100644
--- a/.agents/skills/bkit-ship/SKILL.md
+++ b/.agents/skills/bkit-ship/SKILL.md
@@ -205,6 +205,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **If** exit 0 **and** `PR_BASE` != dev → **Failure Path**.
    - **If** exit 0 → sub-step 3.
    - **If** exit 1 → open a PR and set `SHIP_OPENED_PR` = true. **If** `docs/plans/{YYYYMM}/{FID}-plan.md` exists → the block names it in the PR body:
+
      ```bash
      "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
      OPEN_EXIT=0
@@ -212,11 +213,17 @@ description: "Ship Feature — Autonomous merge and archive"
      case "$OPEN_EXIT" in 0 | 80) "{BKIT}" status meta --file="{STATUS}" --workflow=ship --opened-pr >/dev/null || exit 1 ;; esac
      exit "$OPEN_EXIT"
      ```
-     **If** exit 80 → `create_pull_request` with the printed `title`, `body`, `base` and `head`.
-     **If** any other non-zero exit → **Failure Path**.
+
+     Route:
+     - **If** exit 81 → end turn, re-run this block.
+     - **If** exit 0 → continue with the next instruction.
+     - **If** exit 80 → `create_pull_request` with the printed `title`, `body`, `base` and `head`.
+     - **Else** → **Failure Path**.
+
      Re-run the `bkit prs probe` above.
      Hold `number` as `PR_NUMBER`, `baseRefName` as `PR_BASE`, and hold `state`.
      Assert `PR_NUMBER` non-empty and `PR_BASE` = dev. **If** the assertion fails → **Failure Path**.
+
    - **Else** → **Failure Path**.
 3. Route:
    - **If** `state` = MERGED → record the resume marker → Step 13:
@@ -330,10 +337,18 @@ description: "Ship Feature — Autonomous merge and archive"
    Hold `outcome` as `REGEN_OUTCOME`.
    Route:
    - **If** exit 0 **and** `REGEN_OUTCOME` = committed → push it, so CI starts at the regenerated head; NEVER force:
+
      ```bash
      "{BKIT}" branches push --mode=plain >/dev/null
      ```
+
+     Route:
+     - **If** exit 81 → end turn, re-run this block.
+     - **If** exit 0 → continue with the next instruction.
+     - **Else** → **Failure Path**.
+
      Then Step 5.
+
    - **If** exit 0 **and** `REGEN_OUTCOME` = unchanged **or** undeclared → Step 5. Nothing was committed.
    - **Else** → **Failure Path**.
 
@@ -378,6 +393,10 @@ description: "Ship Feature — Autonomous merge and archive"
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 4 — Integrate
 
@@ -505,6 +524,10 @@ description: "Ship Feature — Autonomous merge and archive"
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 8 — Commit + Push Bookkeeping
 
@@ -560,10 +583,18 @@ description: "Ship Feature — Autonomous merge and archive"
        ```
        Hold `outcome` as `REGEN_OUTCOME` and `head` as `CODE_HEAD`.
        - **If** exit 0 **and** `REGEN_OUTCOME` = committed → push the fix, and NEVER force:
+
          ```bash
          "{BKIT}" branches push --mode=plain >/dev/null
          ```
+
+         Route:
+         - **If** exit 81 → end turn, re-run this block.
+         - **If** exit 0 → continue with the next instruction.
+         - **Else** → **Failure Path**.
+
          Then set `REVALIDATE_REASON` empty → Step 9 (re-validate at the regenerated head, then re-run the merge gate).
+
        - **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed).
      - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
      - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
@@ -710,11 +741,18 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
        ```
        Hold `value` as `MERGE_ATTEMPT`.
      - Commit and push the fix, and NEVER force:
+
        ```bash
        "{BKIT}" ledgers commit --month="{YYYYMM}" --fid="{FID}" --scope=full --mode=commit --stage-tracked-updates --message="fix({FID}): failure-remediate attempt {MERGE_ATTEMPT}" >/dev/null \
          || { echo "[bkit-ship] failure-remediate commit failed" >&2; exit 1; }
        "{BKIT}" branches push --mode=plain >/dev/null
        ```
+
+       Route:
+       - **If** exit 81 → end turn, re-run this block.
+       - **If** exit 0 → continue with the next instruction.
+       - **Else** → **Failure Path**.
+
      - Set `REVALIDATE_REASON` empty → Step 9 (re-validate, then re-run the merge).
    - **Else** → **Failure Path**.
 
diff --git a/.bkit/cli.md b/.bkit/cli.md
index 3ae5c037d..4963b8178 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -82,7 +82,7 @@ Sync, push, land and rebase branches; stamp and read a doc's base-commit anchor.
 | --- | --- | --- | --- |
 | `sync` | workflow | `--head` `--merge` `--merge-docs` `--fid` `--file` `--sentinel` | Fetch origin/dev; report whether it is an ancestor of HEAD (Path A/B) and how far docs/ and the ledgers are behind; optionally merge it in. |
 | `regenerate` | workflow | `--fid` `--attempt` `--file` | Run a declared bkit:generate on the feature branch and commit only the paths it changed (ship Step 3, and Step 10's fix round). |
-| `push` | workflow | **`--mode`** `--set-upstream` `--ahead-of` `--commit` `--label` `--file` `--workflow` `--require-ci` `--open-pr` `--fid` | Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise. |
+| `push` | workflow | **`--mode`** `--set-upstream` `--ahead-of` `--commit` `--label` `--file` `--workflow` `--require-ci` `--open-pr` `--fid` | Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise; 81 tests lock held. |
 | `fast-forward` | workflow | **`--onto`** | Fetch a remote branch and fast-forward the checkout onto it; refuse when diverged. |
 | `scan-diff` | by hand | **`--base`** `--paths` `--marker` `--code` `--disabled-tests` `--expect-none` | Exit 0 when the branch's diff from --base matches (paths, an added marker line, a source change, or a disabled test); 1 when not — --disabled-tests turns that round: 1 when a test was disabled or lost an assertion, 0 when none was. |
 | `force-build` | workflow | **`--fid`** **`--file`** **`--workflow`** `--label` `--open-pr` `--title-set` | Force a full CI build: put [force build] on the open PR's title, then push an empty marker commit (once per run). |
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 1e6ddbaaa..e7a507599 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -82,7 +82,7 @@ Sync, push, land and rebase branches; stamp and read a doc's base-commit anchor.
 | --- | --- | --- | --- |
 | `sync` | workflow | `--head` `--merge` `--merge-docs` `--fid` `--file` `--sentinel` | Fetch origin/dev; report whether it is an ancestor of HEAD (Path A/B) and how far docs/ and the ledgers are behind; optionally merge it in. |
 | `regenerate` | workflow | `--fid` `--attempt` `--file` | Run a declared bkit:generate on the feature branch and commit only the paths it changed (ship Step 3, and Step 10's fix round). |
-| `push` | workflow | **`--mode`** `--set-upstream` `--ahead-of` `--commit` `--label` `--file` `--workflow` `--require-ci` `--open-pr` `--fid` | Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise. |
+| `push` | workflow | **`--mode`** `--set-upstream` `--ahead-of` `--commit` `--label` `--file` `--workflow` `--require-ci` `--open-pr` `--fid` | Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise; 81 tests lock held. |
 | `fast-forward` | workflow | **`--onto`** | Fetch a remote branch and fast-forward the checkout onto it; refuse when diverged. |
 | `scan-diff` | by hand | **`--base`** `--paths` `--marker` `--code` `--disabled-tests` `--expect-none` | Exit 0 when the branch's diff from --base matches (paths, an added marker line, a source change, or a disabled test); 1 when not — --disabled-tests turns that round: 1 when a test was disabled or lost an assertion, 0 when none was. |
 | `force-build` | workflow | **`--fid`** **`--file`** **`--workflow`** `--label` `--open-pr` `--title-set` | Force a full CI build: put [force build] on the open PR's title, then push an empty marker commit (once per run). |
diff --git a/.bkit/core/.bkit/prompts.md b/.bkit/core/.bkit/prompts.md
index 2120c078d..5f3d425cb 100644
--- a/.bkit/core/.bkit/prompts.md
+++ b/.bkit/core/.bkit/prompts.md
@@ -204,7 +204,7 @@ Canonical per-agent metadata, and the single source of truth for each agent's mo
 | `bkit-build-plan-tests` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 100 | writes one task group's planned tests before its code (test files only); uses the machine lock for shared services |
 | `bkit-build-plan-tasks` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 100 | task executor for one task group (source modifier with test loop); uses the machine lock for shared services; re-runs tests-lock waits |
 | `bkit-build-plan-verify` | `claude-opus-5-5` | `gpt-6-astra` | `gemini-4-argon` | `cursor-grok-4.5-high` | `openai/gpt-6.1-sol` | `deepseek-v4.1-flash:1017` | `gpt-6.1-sol` | `gemini-4-argon` | `high` | 100 | verify one group, or the whole plan once, vs the plan; re-runs tests-lock waits |
-| `bkit-build-plan-gaps-remediate` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 100 | fix one group's verification gaps (source modifier with test loop); uses the machine lock for shared services; re-runs tests-lock waits |
+| `bkit-build-plan-gaps-remediate` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 100 | fix one group's verification gaps (source modifier with test loop); uses the machine lock for shared services; re-runs group-gate and changed-test lock waits |
 | `bkit-build-challenge-1` | `claude-opus-5-5` | `gpt-6-astra` | `gemini-4-argon` | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `high` | 200 | parallel slot 1 (bug-hunting lens) |
 | `bkit-build-challenge-2` | `claude-opus-5-5` | `gpt-6-astra` | `gemini-4-argon` | `cursor-grok-4.5-high` | `openai/gpt-6.1-sol` | `deepseek-v4.1-flash:1017` | `gpt-6.1-sol` | `gemini-4-argon` | `high` | 200 | parallel slot 2 (security lens; depth-sensitive — both opus) |
 | `bkit-debug-failure-reproduce` | `claude-opus-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `high` | 200 | failing tests from a bug report, no fix; opus over the sonnet test-writer tier — an off-symptom test sends the fix loop after the wrong bug |
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index 2c17d5ce9..9e91732eb 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -90,6 +90,8 @@ Rendering can be re-run: the source carries every wired variant, so a tracker sw
 
 **Rationale for the workflow files** (kept here, not in them, per `.bkit/authoring.md` § Prompts and Workflows):
 
+- **Tests-lock wait:** `bkit tests run` and `bkit branches push` exit 81 when the machine-wide tests lock stays held past the host's wait budget (`--lock-wait-s` for `tests run`; `BKIT_LOCK_WAIT_S` for both commands). Design, plan, build, debug and ship end the turn and re-run every test or push block on 81, and a subagent handed a group gate command runs the same command again. There is no re-run ceiling. A holder held past three times the last run duration its line names is stale: report its pid, since time and last run duration instead of re-running.
+
 - **`bkit branches push` leases a personal branch:** Step 2's rebase onto `origin/dev` rewrites SHAs, so a plain push is non-fast-forward. `--mode=feature` / `--mode=abort` push with `--force-with-lease`. `dev` / `main` push plain and are never forced. Each call makes exactly one `git push`. This mirrors `rules.md` § Force push.
 - **`BKIT_VER` reads `pinnedVersion`, not `version`:** the fallback is `[ -z … ] &&`, not a piped one. A pipeline's status is the last command's, so a `| tr … || echo` fallback never fires when the grep fails.
 - **`deferrals` / `failures` on the `outcome` row are a cumulative count of distinct `key`s, not of lines:** a row is updated by appending a line with the same `key` (§ Updating a Row in `.bkit/jsonl.md`), so `wc -l` double-counts closed deferrals. Readers derive one cycle's count from the change against the prior outcome row (`newFailuresThisRun` in `.bkit/core/engine/commands/analysis.ts`).
diff --git a/.bkit/core/engine/audits/repo/package-json.test.ts b/.bkit/core/engine/audits/repo/package-json.test.ts
index 6907480b3..176670f71 100644
--- a/.bkit/core/engine/audits/repo/package-json.test.ts
+++ b/.bkit/core/engine/audits/repo/package-json.test.ts
@@ -10,6 +10,23 @@ import { describe, expect, it } from "vitest";
 // ---------------------------------------------------------------------------
 
 describe("package.json manifest invariants (BAR-138)", () => {
+  it("bkit's root package.json wraps every test-running bkit:gate script in the tests lock", () => {
+    const manifest = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf-8")) as {
+      scripts: Record<string, string>;
+    };
+    const prefix = "bash scripts/ci/bkit-machine-lock.sh run --lock tests -- ";
+    expect(manifest.scripts["bkit:gate:static-unit"]).toMatch(new RegExp(`^${prefix}sh -c '`));
+    expect(manifest.scripts["bkit:gate:static-unit-integration"]).toMatch(
+      new RegExp(`^${prefix}sh -c '`),
+    );
+    expect(manifest.scripts["bkit:gate:install-static-unit-build"]).toMatch(
+      new RegExp(`^${prefix}sh -c '`),
+    );
+    expect(manifest.scripts["bkit:gate:changed"]).toBe(
+      prefix + "node scripts/gate/bkit-gate-changed.mjs",
+    );
+  });
+
   const pkgPath = path.resolve("package.json");
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   let pkg: Record<string, any>;
diff --git a/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts b/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
index fc826b2ef..4970359a0 100644
--- a/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
+++ b/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
@@ -69,6 +69,29 @@ function isExempt(rel: string, pattern: string): boolean {
   return EXEMPT.some((e) => e.rel === rel && e.pattern === pattern);
 }
 
+/** Keep each command fence together with its own following decision list. */
+function commandRoutes(body: string, call: RegExp): Array<{ block: string; route: string }> {
+  return [...body.matchAll(/^[ \t]*```bash\n([\s\S]*?)^[ \t]*```/gm)]
+    .filter((match) => call.test(match[1]!))
+    .map((match) => ({
+      block: match[1]!,
+      route: body.slice(match.index + match[0].length).split(/^[ \t]*```|^#{1,6} /m)[0]!,
+    }));
+}
+
+function expectWaitRoute(route: string, site: string): void {
+  expect(route, site).toMatch(/(?:Route|Decide)[^\n]*:/);
+  const wait = route.split("\n").find((line) => /exit\s+`?81\b/i.test(line));
+  expect(wait, site).toBeDefined();
+  expect(wait, site).toMatch(/end (?:the )?turn/i);
+  expect(wait, site).toMatch(/re-run (?:this |the )?block/i);
+  const otherwise = route.indexOf("**Else**");
+  expect(
+    otherwise < 0 || route.indexOf(wait ?? "") < otherwise,
+    `${site}: wait precedes Else`,
+  ).toBe(true);
+}
+
 /** Canonical files that contain a banned pattern without an exemption for it. */
 function unexemptedHits(pattern: string): string[] {
   return canonicalFiles()
@@ -195,6 +218,83 @@ describe("bkit-local-gate-audit (#437)", () => {
     { workflow: "bkit-debug.md", step: "", gates: BKIT_DEBUG_GATES, stopsAt: "live", sites: 1 },
   ] as const;
 
+  it("every tests run call site routes exit 81 to a re-run of its block", () => {
+    for (const { workflow, step, sites } of PROBES) {
+      const body = fs.readFileSync(path.join(WORKFLOWS_DIR, workflow), "utf-8");
+      const routes = commandRoutes(body, /\btests run\b/).filter(({ block }) =>
+        block.includes(`--step=${step}`),
+      );
+      expect(routes, `${workflow} ${step}`).toHaveLength(sites);
+      for (const { route } of routes) expectWaitRoute(route, `${workflow} ${step}`);
+    }
+    const all = canonicalFiles().filter(({ rel }) => rel.startsWith(".bkit/core/workflows/"));
+    expect(all.flatMap(({ body }) => commandRoutes(body, /\btests run\b/))).toHaveLength(
+      PROBES.reduce((total, probe) => total + probe.sites, 0),
+    );
+  });
+
+  it("every branches push call site routes exit 81 to a re-run of its block", () => {
+    const pushProbes = [
+      { workflow: "bkit-design.md", sites: 1 },
+      { workflow: "bkit-plan.md", sites: 1 },
+      { workflow: "bkit-build.md", sites: 2 },
+      { workflow: "bkit-debug.md", sites: 5 },
+      { workflow: "bkit-ship.md", sites: 6 },
+    ];
+    for (const { workflow, sites } of pushProbes) {
+      const body = fs.readFileSync(path.join(WORKFLOWS_DIR, workflow), "utf-8");
+      const routes = commandRoutes(body, /\bbranches push\b/);
+      expect(routes, workflow).toHaveLength(sites);
+      for (const { block, route } of routes) {
+        expectWaitRoute(
+          route,
+          `${workflow}: ${block
+            .trim()
+            .split("\n")
+            .find((line) => line.includes("branches push"))}`,
+        );
+        expect(block, `${workflow}: chained push preserves exit 81`).not.toMatch(
+          /branches push[^\n]*\|\|\s*exit\s+1\b/,
+        );
+      }
+    }
+    const all = canonicalFiles().filter(({ rel }) => rel.startsWith(".bkit/core/workflows/"));
+    expect(all.flatMap(({ body }) => commandRoutes(body, /\bbranches push\b/))).toHaveLength(
+      pushProbes.reduce((total, probe) => total + probe.sites, 0),
+    );
+  });
+
+  it("a tests run command a workflow hands a subagent in Context is re-run on exit 81 by that subagent's prompt", () => {
+    const contexts = canonicalFiles()
+      .filter(({ rel }) => rel.startsWith(".bkit/core/workflows/"))
+      .flatMap(({ rel, body }) =>
+        [...body.matchAll(/^\s*Context:.*\btests run\b.*$/gm)].map((match) => ({
+          rel,
+          body,
+          match,
+        })),
+      );
+    expect(contexts.length).toBeGreaterThan(0);
+    for (const { rel, body, match } of contexts) {
+      const step = body
+        .slice(0, match.index)
+        .split(/\n(?=\d+\. )/)
+        .at(-1)!;
+      const agent = [...step.matchAll(/Invoke `@([^`]+)`/g)].at(-1)?.[1];
+      expect(agent, rel).toBeDefined();
+      const prompt = fs.readFileSync(path.join(PROMPTS_DIR, `${agent}.md`), "utf-8");
+      const gateStep = prompt
+        .split(/\n(?=\d+\. )/)
+        .find((part) => part.includes("Context names a group gate"));
+      expect(gateStep, `${agent}: group gate step`).toBeDefined();
+      const retry = gateStep
+        ?.split("\n")
+        .find((line) => /group gate.*exit(?:s)?\s+`?81\b/i.test(line));
+      expect(retry, `${agent}: group gate's own retry`).toBeDefined();
+      expect(retry).toMatch(/run (?:the same |that |the )?command again|re-run/i);
+    }
+  });
+
   /** The ```bash blocks of a workflow that call `bkit tests run`. */
   const testBlocks = (body: string) =>
     [...body.matchAll(/```bash\n([\s\S]*?)```/g)]
diff --git a/.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts b/.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts
new file mode 100644
index 000000000..53997f0af
--- /dev/null
+++ b/.bkit/core/engine/commands/workflow/branches-lock.integration.test.ts
@@ -0,0 +1,159 @@
+import { type ChildProcess, spawn, spawnSync } from "node:child_process";
+import * as fs from "node:fs";
+import * as os from "node:os";
+import * as path from "node:path";
+import { setTimeout as delay } from "node:timers/promises";
+
+import { afterEach, beforeEach, describe, expect, it } from "vitest";
+
+import { tierTimeouts } from "../../../../../vitest.timeout-budget";
+import { requireTsx } from "../../../../../vitest.tsx-bin";
+
+const BUDGET = tierTimeouts(true);
+const CLI = path.resolve(".bkit/core/engine/cli.ts");
+const TEMPLATE = path.resolve(".bkit/templates/scripts/ci/bkit-machine-lock.sh");
+const SHELL_DISPATCHER = path.resolve("tests/fixtures/gh/bin/gh");
+const BRANCH = "feat/tests-lock";
+let tmp: string;
+let cwd: string;
+let origin: string;
+let cache: string;
+let env: NodeJS.ProcessEnv;
+let children: ChildProcess[];
+
+function git(...args: string[]) {
+  return spawnSync(
+    "git",
+    [
+      "-c",
+      "user.name=Test",
+      "-c",
+      "user.email=test@example.invalid",
+      "-c",
+      "commit.gpgsign=false",
+      ...args,
+    ],
+    { cwd, env, encoding: "utf-8" },
+  );
+}
+
+function checkedGit(...args: string[]): void {
+  const result = git(...args);
+  expect(result.status, result.stderr).toBe(0);
+}
+
+beforeEach(() => {
+  tmp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-branches-lock-")));
+  cwd = path.join(tmp, "consumer");
+  origin = path.join(tmp, "origin.git");
+  cache = path.join(tmp, "cache");
+  children = [];
+  env = { ...process.env, XDG_CACHE_HOME: cache, BKIT_ENGINE_JOURNAL: "off" };
+  for (const key of Object.keys(env)) {
+    if (
+      key.startsWith("GIT_") ||
+      key.startsWith("LOCAL_STACK_LOCK_") ||
+      key.startsWith("BKIT_TEST_") ||
+      key === "CI" ||
+      key === "BKIT_LOCK_WAIT_S"
+    )
+      delete env[key];
+  }
+  fs.mkdirSync(path.join(cwd, "scripts", "ci"), { recursive: true });
+  fs.copyFileSync(TEMPLATE, path.join(cwd, "scripts", "ci", "bkit-machine-lock.sh"));
+  fs.writeFileSync(
+    path.join(cwd, "hook-gate.mjs"),
+    [
+      'import fs from "node:fs";',
+      'const values = {wait: process.env.LOCAL_STACK_LOCK_WAIT_S || "", who: process.env.LOCAL_STACK_LOCK_WHO || ""};',
+      "fs.writeFileSync(process.env.HOOK_ENV, JSON.stringify(values));",
+      'console.log("wait=" + values.wait + " who=" + values.who);',
+    ].join("\n"),
+  );
+  checkedGit("init", "-q", "-b", BRANCH);
+  checkedGit("init", "-q", "--bare", origin);
+  checkedGit("remote", "add", "origin", origin);
+  checkedGit("add", "--all");
+  checkedGit("commit", "-q", "-m", "fixture");
+  // Git invokes a stable executable; its existing shell dispatcher runs this hook body.
+  const hook = path.join(tmp, "pre-push.sh");
+  fs.writeFileSync(
+    hook,
+    "exec bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node hook-gate.mjs\n",
+  );
+  fs.symlinkSync(SHELL_DISPATCHER, path.join(cwd, ".git", "hooks", "pre-push"));
+  env.BKIT_FAKE_TOOL_SCRIPT = hook;
+  env.HOOK_ENV = path.join(tmp, "hook-env.json");
+});
+
+afterEach(() => {
+  for (const child of children) child.kill("SIGKILL");
+  fs.rmSync(tmp, { recursive: true, force: true });
+});
+
+async function hold(): Promise<ChildProcess> {
+  const child = spawn(
+    "bash",
+    [
+      "-c",
+      '. scripts/ci/bkit-machine-lock.sh; take_local_stack_lock "external push holder" tests || exit 1; exec sleep 30',
+    ],
+    { cwd, env, stdio: "ignore" },
+  );
+  children.push(child);
+  const file = path.join(cache, "bkit", "machine-lock", "tests.lock.holder");
+  const until = Date.now() + BUDGET.hookTimeout;
+  while (Date.now() < until) {
+    if (fs.existsSync(file) && fs.readFileSync(file, "utf-8").includes("external push holder"))
+      return child;
+    if (child.exitCode !== null || child.signalCode !== null)
+      throw new Error("holder exited before taking the lock");
+    await delay(20);
+  }
+  throw new Error("holder did not take the lock");
+}
+
+function push(extra: Record<string, string>) {
+  const result = spawnSync(
+    requireTsx(),
+    [CLI, "branches", "push", "--mode=plain", "--set-upstream", "--json"],
+    { cwd, env: { ...env, ...extra }, encoding: "utf-8", timeout: BUDGET.testTimeout },
+  );
+  return {
+    status: result.status,
+    stderr: result.stderr,
+    json: JSON.parse(result.stdout) as Record<string, unknown>,
+  };
+}
+
+describe("branches push through a real pre-push lock", () => {
+  it("branches push exits 81 naming the holder when the pre-push hook's gate gave up on the tests lock", async () => {
+    const holder = await hold();
+    const result = push({ BKIT_LOCK_WAIT_S: "0", LOCAL_STACK_LOCK_WAIT_S: "0" });
+    expect(result.status, result.stderr).toBe(81);
+    expect(result.json).toMatchObject({
+      pushed: false,
+      ref: null,
+      lockHolder: expect.stringContaining("external push holder"),
+    });
+    expect(result.stderr).toContain("external push holder");
+    expect(holder.exitCode).toBeNull();
+    expect(
+      git("--git-dir", origin, "show-ref", "--verify", "--quiet", `refs/heads/${BRANCH}`).status,
+    ).toBe(1);
+    expect(fs.existsSync(path.join(tmp, "hook-env.json"))).toBe(false);
+  });
+
+  it("branches push passes LOCAL_STACK_LOCK_WAIT_S and LOCAL_STACK_LOCK_WHO to git push", () => {
+    const result = push({ BKIT_LOCK_WAIT_S: "2" });
+    expect(result.status, result.stderr).toBe(0);
+    expect(result.json).toMatchObject({ pushed: true, ref: BRANCH });
+    expect(JSON.parse(fs.readFileSync(path.join(tmp, "hook-env.json"), "utf-8"))).toEqual({
+      wait: "2",
+      who: `bkit branches push ${BRANCH}`,
+    });
+    expect(git("--git-dir", origin, "rev-parse", `refs/heads/${BRANCH}`).stdout.trim()).toBe(
+      git("rev-parse", "HEAD").stdout.trim(),
+    );
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/branches.test.ts b/.bkit/core/engine/commands/workflow/branches.test.ts
index b90501fe0..02fefaa75 100644
--- a/.bkit/core/engine/commands/workflow/branches.test.ts
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -976,6 +976,7 @@ describe("branches push", { timeout: GIT_TIMEOUT }, () => {
       pushed: true,
       ref: "feat/1-x",
       sha: sha(clone),
+      lockHolder: null,
       forced: true,
       skipped: null,
       prNumber: null,
@@ -1140,6 +1141,7 @@ describe("branches push", { timeout: GIT_TIMEOUT }, () => {
       sha: null,
       forced: false,
       skipped: "open-pr",
+      lockHolder: null,
       prNumber: 12,
       replayed: false,
       mergedDev: false,
diff --git a/.bkit/core/engine/commands/workflow/branches.ts b/.bkit/core/engine/commands/workflow/branches.ts
index ed86f8917..b09cdf75a 100644
--- a/.bkit/core/engine/commands/workflow/branches.ts
+++ b/.bkit/core/engine/commands/workflow/branches.ts
@@ -22,6 +22,7 @@ import { gitEnv } from "../../ledgers/telemetry.js";
 import { actionHash, actionKey, alreadyDone, recordAction } from "../../ledgers/status.js";
 import {
   bodySkipToken,
+  classifyLockExit,
   CommandError,
   DEV,
   EXIT,
@@ -34,6 +35,8 @@ import {
   runGh,
   runGit,
   SKIP_CI_TOKEN,
+  testsLockHolder,
+  wholeNumber,
   type CommandSpec,
   type RunContext,
 } from "../lib.js";
@@ -595,6 +598,27 @@ export interface PushOutcome {
     replayed: boolean;
     /** origin/dev's docs and ledger commits were merged in before the push. */
     mergedDev: boolean;
+    lockHolder?: string | null;
+  };
+}
+
+/** Git collapses a failing pre-push hook's status; classify its exact tests-lock markers. */
+function runPush(cwd: string, args: string[], branch: string) {
+  const who = `bkit branches push ${branch}`;
+  const wait = wholeNumber(process.env.BKIT_LOCK_WAIT_S, "BKIT_LOCK_WAIT_S", 60);
+  const res = runGit(cwd, args, {
+    LOCAL_STACK_LOCK_WAIT_S: String(wait),
+    LOCAL_STACK_LOCK_WHO: who,
+  });
+  const log = [res.stdout, res.stderr].filter(Boolean).join("\n");
+  const lockHolder = res.ok ? null : testsLockHolder(log, who);
+  const outcome = res.ok
+    ? "gate"
+    : classifyLockExit({ exitCode: lockHolder === null ? 73 : 75, log, who });
+  return {
+    ...res,
+    lockHolder,
+    lockExit: outcome === "lock-wait" ? EXIT.AGENT_WAIT : outcome === "could-not-run" ? 4 : null,
   };
 }
 
@@ -709,10 +733,10 @@ export async function pushBranch(
     REMOTE,
     branch,
   ];
-  const res = runGit(cwd, args);
+  const res = runPush(cwd, args, branch);
   if (!res.ok) {
     log(`git ${args.join(" ")} failed: ${res.stderr}`);
-    return notPushed(EXIT_PUSH_FAILED);
+    return notPushed(res.lockExit ?? EXIT_PUSH_FAILED, { lockHolder: res.lockHolder });
   }
   log(`pushed ${branch}${shared ? "" : " (--force-with-lease)"}`);
   return {
@@ -778,10 +802,10 @@ function pushPlain(
     return notPushed(EXIT_SKIP_CI, { skipped: "skip-ci" });
   }
   const args = ["push", ...(o.setUpstream === true ? ["-u"] : []), REMOTE, branch];
-  const res = runGit(cwd, args);
+  const res = runPush(cwd, args, branch);
   if (!res.ok) {
     log(`git ${args.join(" ")} failed: ${res.stderr}`);
-    return notPushed(EXIT_PUSH_FAILED);
+    return notPushed(res.lockExit ?? EXIT_PUSH_FAILED, { lockHolder: res.lockHolder });
   }
   log(`pushed ${branch}`);
   return {
@@ -928,7 +952,7 @@ async function pushOwnCommits(
       REMOTE,
       `${last}:refs/heads/${rec.branch}`,
     ];
-    const res = runGit(cwd, args);
+    const res = runPush(cwd, args, rec.branch);
     if (res.ok) {
       log(`pushed ${rec.branch}: the run's ${pending.length} commit(s) are all local dev holds`);
       return {
@@ -945,6 +969,10 @@ async function pushOwnCommits(
         },
       };
     }
+    if (res.lockExit !== null) {
+      log(`git ${args.join(" ")} failed: ${res.stderr}`);
+      return notPushed(res.lockExit, { lockHolder: res.lockHolder });
+    }
     log(`git ${args.join(" ")} failed: ${res.stderr} — replaying onto a fresh ${UPSTREAM}`);
   }
 
@@ -1071,7 +1099,9 @@ async function pushVerb(ctx: RunContext): Promise<number> {
   // A detached HEAD and a wrong checkout print nothing, as the push never got to run.
   if (r.code !== EXIT_DETACHED && r.code !== EXIT_NOT_DEV) {
     ctx.emit(
-      marker === undefined ? r.out : { ...r.out, commit: marker.sha, deduped: marker.deduped },
+      marker === undefined
+        ? { lockHolder: null, ...r.out }
+        : { lockHolder: null, ...r.out, commit: marker.sha, deduped: marker.deduped },
     );
   }
   return r.code;
@@ -2798,7 +2828,7 @@ export const branchesCommand: CommandSpec = {
     },
     push: {
       summary:
-        "Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise.",
+        "Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise; 81 tests lock held.",
       use: "workflow",
       flags: [
         {
@@ -2844,6 +2874,7 @@ export const branchesCommand: CommandSpec = {
       ],
       output: {
         pushed: "true when the push ran and succeeded",
+        lockHolder: "the tests-lock holder on exit 81 (null otherwise)",
         replayed:
           "true when the run's commits went out as copies cherry-picked onto a fresh origin/dev (an in-place run on dev whose local dev holds other commits); sha is then the landed origin/dev commit",
         ref: "the branch pushed — link handover artifacts to this ref; null when nothing was pushed",
@@ -2857,6 +2888,7 @@ export const branchesCommand: CommandSpec = {
         deduped: "--commit: the marker commit was already made this run (not made again)",
       },
       exitCodes: {
+        4: "the pre-push hook could not acquire the tests lock",
         [EXIT_DETACHED]: "no branch checked out",
         [EXIT_NOTHING_TO_PUSH]:
           "--mode=plain or --commit on dev / main, or --ahead-of and HEAD has no commits beyond it",
diff --git a/.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts b/.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts
index e54a50a42..45e1bae85 100644
--- a/.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts
+++ b/.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts
@@ -217,7 +217,60 @@ const events = (): GateEvent[] =>
         .map((line) => JSON.parse(line) as GateEvent)
     : [];
 
+/** Replace the gate's work with a fixture while retaining its actual lock prefix. */
+function gatePrefix(value: string): string {
+  return value.match(/^bash scripts\/ci\/bkit-machine-lock\.sh run --lock tests -- /)?.[0] ?? "";
+}
+
 describe("tests lock through a consumer's wrapped gate", () => {
+  it("a wrapped gate that runs another wrapped gate runs the inner one unlocked, never waiting on itself", async () => {
+    const own = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf-8")) as {
+      scripts: Record<string, string>;
+    };
+    const outer = "bkit:gate:static-unit-integration";
+    const ready = path.join(tmp, "outer-ready");
+    const release = path.join(tmp, "outer-release");
+    const manifest = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf-8")) as {
+      scripts: Record<string, string>;
+    };
+    manifest.scripts[outer] = gatePrefix(own.scripts[outer]!) + "node outer.mjs";
+    manifest.scripts[GATE] = gatePrefix(own.scripts[GATE]!) + "node gate.mjs";
+    fs.writeFileSync(path.join(cwd, "package.json"), JSON.stringify(manifest));
+    fs.writeFileSync(
+      path.join(cwd, "outer.mjs"),
+      [
+        'import fs from "node:fs";',
+        'import { spawnSync } from "node:child_process";',
+        'import { setTimeout as delay } from "node:timers/promises";',
+        `const result = spawnSync("pnpm", ["${GATE}"], { stdio: "inherit", timeout: 5000 });`,
+        'fs.writeFileSync(process.env.OUTER_READY, JSON.stringify({owner: process.env.LOCAL_STACK_LOCK_OWNER_tests || "", nested: result.status}));',
+        'const until = Date.now() + 30000; while (!fs.existsSync(process.env.OUTER_RELEASE)) { if (Date.now() > until) throw new Error("release timed out"); await delay(20); }',
+        "process.exit(result.status ?? 1);",
+      ].join("\n"),
+    );
+    const first = start(["run", `--gate=${outer}`, "--log=logs/outer.md", "--lock-wait-s=2"], {
+      OUTER_READY: ready,
+      OUTER_RELEASE: release,
+    });
+    await waitForFile(ready, "nested", first.child);
+    const ownership = JSON.parse(fs.readFileSync(ready, "utf-8")) as {
+      owner: string;
+      nested: number;
+    };
+    const contrast = execute([...runArgs("logs/contrast.md"), "--lock-wait-s=0"]);
+    fs.writeFileSync(release, "release");
+    const result = await first.done;
+    expect(contrast.status, contrast.stderr).toBe(81);
+    expect(result.status, result.stderr).toBe(0);
+    expect(ownership.nested).toBe(0);
+    expect(ownership.owner).toMatch(/^[1-9][0-9]*$/);
+    expect(events().map((event) => event.event)).toEqual(["start", "end"]);
+    expect(events()[0]!.env.LOCAL_STACK_LOCK_OWNER_tests).toBe(ownership.owner);
+    expect(fs.readFileSync(path.join(cwd, "logs/outer.md"), "utf-8")).not.toContain(
+      "waiting for tests",
+    );
+  });
+
   it("tests run --file appends no test-run row when it exits 81 on a held tests lock", async () => {
     await hold();
     const result = execute([
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index 2e3f658e0..0900318a4 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -600,6 +600,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```
    Route:
    - **If** exit 0 **or** 1 → hold `verdict` as `GATE_VERDICT` and `scope` as `TEST_SCOPE` → sub-step 9.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 9. Finish:
    ```bash
@@ -841,6 +842,7 @@ This step runs once, after the last group. Challenge fix groups pass through it
    Decide `TEST_VERDICT`:
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 3. Finish — `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown):
    ```bash
@@ -974,6 +976,7 @@ This step runs once, after the last group. Challenge fix groups pass through it
    "{BKIT}" branches push --mode=feature --set-upstream
    ```
 5. Route:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 16.
    - **Else** → **Failure Path**.
 
@@ -1030,13 +1033,21 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 1 → `FORCE_BUILD` = false → sub-step 3.
    - **Else** → **Failure Path**.
 3. Re-read the labels, then close the run with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. It then pushes with the HEAD-Subject Assertion and releases the lock. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
+
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
-   "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit 1
+   "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit "$?"
    "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
    ```
+
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
+
    Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+
 4. Create the PR. Its body names `docs/plans/{YYYYMM}/{FID}-plan.md` when the plan exists:
 
    ```bash
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
index b3f4f0639..04ea9e112 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
@@ -248,6 +248,7 @@ _No tracker connected, skip step._
    Decide `TEST_VERDICT`:
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown):
    ```bash
@@ -479,6 +480,10 @@ _No tracker connected, skip step._
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 9 — Push Remediation
 
@@ -506,6 +511,7 @@ _No tracker connected, skip step._
    "{BKIT}" branches push --mode=feature
    ```
 3. Route:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
@@ -560,16 +566,24 @@ _No tracker connected, skip step._
 
    Release and push:
    - **If** `BRANCH` != `dev`:
+
      ```bash
      "{BKIT}" locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
      "{BKIT}" branches push --mode=feature --require-ci >/dev/null
      ```
+
+     Route:
+     - **If** exit 81 → end turn, re-run this block.
+     - **If** exit 0 → continue with the next instruction.
+     - **Else** → **Failure Path**.
+
    - **If** `BRANCH` = `dev`:
      Push ONLY the run's own commits, and keep the lock:
      ```bash
      "{BKIT}" branches push --mode=dev --require-ci --fid={FID}
      ```
      Route:
+     - **If** exit 81 → end turn, re-run this block.
      - **If** exit 0 **and** `skipped` null → hold `sha` as `DEV_SHA` (never the local HEAD); `BRANCH` = `dev` → `{CLOSE_PARENT}` = `{DEV_SHA}`; `DEV_PUSHED` = true.
      - **If** exit 0 **and** `skipped` = `no-run-commits` → narrate `[bkit-debug] dev push: every run commit is already on origin/dev; nothing pushed, no CI run to gate` → `DEV_PUSHED` = false.
      - **If** exit 8 (push failed or refused), exit 10 (fetch failed), exit 11 (replay conflict, the conflicting paths printed) or exit 20 (the run's record is gone, nothing pushed) → **Failure Path**.
@@ -593,9 +607,16 @@ _No tracker connected, skip step._
    - **If** exit 80 → `create_pull_request` with the printed `title` / `body` / `base` / `head` → hold its number as `PR_NUMBER` and its URL as `PR_URL`.
    - **Else** → **Failure Path**.
 6. **If** `TRIGGER_PR` = 1 → commit and push the CI-triggering head. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry:
+
    ```bash
    "{BKIT}" branches push --mode=feature --require-ci --commit="chore({FID}): create-pr bkit [verbose ci]" {LABEL_FLAGS} --file="{STATUS}" --workflow=debug
    ```
+
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
+
 7. **Run only if** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 **or** `BRANCH` = `dev`.
    **If** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 → run the CI-Dispatch Gate on the pushed head. It records `{DISPATCH_ROW}`, cross-checks the transport and records the close transport. `{DISPATCH_ROW}` = `--step=debug-close-workflow {LIVE_SKIPPED}` when `{PR_OPEN}` = 1, `--step=debug-create-pr --artifact={PR_URL}` after a created PR. `{LABEL_FLAGS}` as in sub-step 6:
 
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt
index 1633013be..21d55f964 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-design.none.txt
@@ -396,7 +396,8 @@ _No tracker connected, skip step._
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
-4. Route:
+4. Route — first match wins:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
index bcc91e336..e3c4d8252 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt
@@ -325,7 +325,8 @@ _No tracker connected, skip step._
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
-5. Route:
+5. Route — first match wins:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 8.
    - **Else** → **Failure Path**.
 
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
index 7f894228a..dda2000ed 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
@@ -169,6 +169,7 @@ _No tracker connected, skip step._
    - **If** exit 0 **and** `PR_BASE` != dev → **Failure Path**.
    - **If** exit 0 → sub-step 3.
    - **If** exit 1 → open a PR and set `SHIP_OPENED_PR` = true. **If** `docs/plans/{YYYYMM}/{FID}-plan.md` exists → the block names it in the PR body:
+
      ```bash
      "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
      OPEN_EXIT=0
@@ -176,11 +177,17 @@ _No tracker connected, skip step._
      case "$OPEN_EXIT" in 0 | 80) "{BKIT}" status meta --file="{STATUS}" --workflow=ship --opened-pr >/dev/null || exit 1 ;; esac
      exit "$OPEN_EXIT"
      ```
-     **If** exit 80 → `create_pull_request` with the printed `title`, `body`, `base` and `head`.
-     **If** any other non-zero exit → **Failure Path**.
+
+     Route:
+     - **If** exit 81 → end turn, re-run this block.
+     - **If** exit 0 → continue with the next instruction.
+     - **If** exit 80 → `create_pull_request` with the printed `title`, `body`, `base` and `head`.
+     - **Else** → **Failure Path**.
+
      Re-run the `bkit prs probe` above.
      Hold `number` as `PR_NUMBER`, `baseRefName` as `PR_BASE`, and hold `state`.
      Assert `PR_NUMBER` non-empty and `PR_BASE` = dev. **If** the assertion fails → **Failure Path**.
+
    - **Else** → **Failure Path**.
 3. Route:
    - **If** `state` = MERGED → record the resume marker → Step 13:
@@ -294,10 +301,18 @@ _No tracker connected, skip step._
    Hold `outcome` as `REGEN_OUTCOME`.
    Route:
    - **If** exit 0 **and** `REGEN_OUTCOME` = committed → push it, so CI starts at the regenerated head; NEVER force:
+
      ```bash
      "{BKIT}" branches push --mode=plain >/dev/null
      ```
+
+     Route:
+     - **If** exit 81 → end turn, re-run this block.
+     - **If** exit 0 → continue with the next instruction.
+     - **Else** → **Failure Path**.
+
      Then Step 5.
+
    - **If** exit 0 **and** `REGEN_OUTCOME` = unchanged **or** undeclared → Step 5. Nothing was committed.
    - **Else** → **Failure Path**.
 
@@ -342,6 +357,10 @@ _No tracker connected, skip step._
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 4 — Integrate
 
@@ -469,6 +488,10 @@ _No tracker connected, skip step._
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 8 — Commit + Push Bookkeeping
 
@@ -524,10 +547,18 @@ _No tracker connected, skip step._
        ```
        Hold `outcome` as `REGEN_OUTCOME` and `head` as `CODE_HEAD`.
        - **If** exit 0 **and** `REGEN_OUTCOME` = committed → push the fix, and NEVER force:
+
          ```bash
          "{BKIT}" branches push --mode=plain >/dev/null
          ```
+
+         Route:
+         - **If** exit 81 → end turn, re-run this block.
+         - **If** exit 0 → continue with the next instruction.
+         - **Else** → **Failure Path**.
+
          Then set `REVALIDATE_REASON` empty → Step 9 (re-validate at the regenerated head, then re-run the merge gate).
+
        - **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed).
      - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
      - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
@@ -669,11 +700,18 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
        ```
        Hold `value` as `MERGE_ATTEMPT`.
      - Commit and push the fix, and NEVER force:
+
        ```bash
        "{BKIT}" ledgers commit --month="{YYYYMM}" --fid="{FID}" --scope=full --mode=commit --stage-tracked-updates --message="fix({FID}): failure-remediate attempt {MERGE_ATTEMPT}" >/dev/null \
          || { echo "[bkit-ship] failure-remediate commit failed" >&2; exit 1; }
        "{BKIT}" branches push --mode=plain >/dev/null
        ```
+
+       Route:
+       - **If** exit 81 → end turn, re-run this block.
+       - **If** exit 0 → continue with the next instruction.
+       - **Else** → **Failure Path**.
+
      - Set `REVALIDATE_REASON` empty → Step 9 (re-validate, then re-run the merge).
    - **Else** → **Failure Path**.
 
diff --git a/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md b/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
index b61ead94d..b3d25b6cd 100644
--- a/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
+++ b/.bkit/core/prompts/bkit-build-plan-gaps-remediate.md
@@ -101,6 +101,7 @@ autoCompactWindow: 300000
 8. **If** `package.json` declares a `bkit:generate` script → run `pnpm bkit:generate` once, after your last code edit. It rewrites the generated files and saved baselines from your code, so the caller commits them with it.
    - **If** it exits non-zero → append `BLOCKED — bkit:generate: {first error line}` with Bash `echo >>`. The verdict is then `FAIL`, whatever the tasks and tests show.
 9. Run `bkit tests changed --fallback=bkit:gate:static-unit`. Every local test must pass. **If** Context names a group gate → run that command after the fixes, and again after each further fix, until it exits 0:
+   - **If** the group gate exits 81 → another run holds the machine-wide tests lock: run the same command again. Count the wait as no gap and no reason to edit code.
    - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - The gate stops at its first failing stage, so treat each new failure that a later run shows as another gap of this round.
    - Before you fix a failure, search for every other test and source file built on the same failing assumption.
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index 8e5d44d80..4a234fd25 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -685,6 +685,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```
    Route:
    - **If** exit 0 **or** 1 → hold `verdict` as `GATE_VERDICT` and `scope` as `TEST_SCOPE` → sub-step 9.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 9. Finish:
    ```bash
@@ -926,6 +927,7 @@ This step runs once, after the last group. Challenge fix groups pass through it
    Decide `TEST_VERDICT`:
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 3. Finish — `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown):
    ```bash
@@ -1059,6 +1061,7 @@ This step runs once, after the last group. Challenge fix groups pass through it
    "{BKIT}" branches push --mode=feature --set-upstream
    ```
 5. Route:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 16.
    - **Else** → **Failure Path**.
 
@@ -1131,20 +1134,31 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **Else** → **Failure Path**.
 3. Re-read the labels, then close the run with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. It then pushes with the HEAD-Subject Assertion and releases the lock. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
    <!-- bkit:tracker true start -->
+
    **Skip if** `ISSUE_ID` empty. Re-read the issue:
+
    ```bash
    "{BKIT}" issues fetch --issue="{ISSUE_ID}" --outbox="{OUTBOX}"
    ```
+
    Hold `state` as `STATE`, `labels` as `LABELS`. **If** exit 80 → read them via the tracker MCP (**Tracker**).
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    <!-- bkit:tracker true end -->
+
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
-   "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit 1
+   "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit "$?"
    "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
    ```
+
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
+
    Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+
 4. Create the PR. Its body names `docs/plans/{YYYYMM}/{FID}-plan.md` when the plan exists:
 
    ```bash
diff --git a/.bkit/core/workflows/bkit-debug.md b/.bkit/core/workflows/bkit-debug.md
index 7e2a4227c..0094a262a 100644
--- a/.bkit/core/workflows/bkit-debug.md
+++ b/.bkit/core/workflows/bkit-debug.md
@@ -325,6 +325,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    Decide `TEST_VERDICT`:
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown):
    ```bash
@@ -576,6 +577,10 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 9 — Push Remediation
 
@@ -603,6 +608,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    "{BKIT}" branches push --mode=feature
    ```
 3. Route:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
@@ -668,16 +674,24 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
    Release and push:
    - **If** `BRANCH` != `dev`:
+
      ```bash
      "{BKIT}" locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
      "{BKIT}" branches push --mode=feature --require-ci >/dev/null
      ```
+
+     Route:
+     - **If** exit 81 → end turn, re-run this block.
+     - **If** exit 0 → continue with the next instruction.
+     - **Else** → **Failure Path**.
+
    - **If** `BRANCH` = `dev`:
      Push ONLY the run's own commits, and keep the lock:
      ```bash
      "{BKIT}" branches push --mode=dev --require-ci --fid={FID}
      ```
      Route:
+     - **If** exit 81 → end turn, re-run this block.
      - **If** exit 0 **and** `skipped` null → hold `sha` as `DEV_SHA` (never the local HEAD); `BRANCH` = `dev` → `{CLOSE_PARENT}` = `{DEV_SHA}`; `DEV_PUSHED` = true.
      - **If** exit 0 **and** `skipped` = `no-run-commits` → narrate `[bkit-debug] dev push: every run commit is already on origin/dev; nothing pushed, no CI run to gate` → `DEV_PUSHED` = false.
      - **If** exit 8 (push failed or refused), exit 10 (fetch failed), exit 11 (replay conflict, the conflicting paths printed) or exit 20 (the run's record is gone, nothing pushed) → **Failure Path**.
@@ -701,9 +715,16 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    - **If** exit 80 → `create_pull_request` with the printed `title` / `body` / `base` / `head` → hold its number as `PR_NUMBER` and its URL as `PR_URL`.
    - **Else** → **Failure Path**.
 6. **If** `TRIGGER_PR` = 1 → commit and push the CI-triggering head. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry<!-- bkit:tracker true start -->, empty when `ISSUE_ID` is empty<!-- bkit:tracker true end -->:
+
    ```bash
    "{BKIT}" branches push --mode=feature --require-ci --commit="chore({FID}): create-pr bkit [verbose ci]" {LABEL_FLAGS} --file="{STATUS}" --workflow=debug
    ```
+
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
+
 7. **Run only if** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 **or** `BRANCH` = `dev`.
    **If** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 → run the CI-Dispatch Gate on the pushed head. It records `{DISPATCH_ROW}`, cross-checks the transport and records the close transport. `{DISPATCH_ROW}` = `--step=debug-close-workflow {LIVE_SKIPPED}` when `{PR_OPEN}` = 1, `--step=debug-create-pr --artifact={PR_URL}` after a created PR. `{LABEL_FLAGS}` as in sub-step 6:
 
diff --git a/.bkit/core/workflows/bkit-design.md b/.bkit/core/workflows/bkit-design.md
index 7930a215a..eef8d1d8c 100644
--- a/.bkit/core/workflows/bkit-design.md
+++ b/.bkit/core/workflows/bkit-design.md
@@ -493,7 +493,8 @@ description: "Design Feature — Autonomous design phase"
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
-4. Route:
+4. Route — first match wins:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
diff --git a/.bkit/core/workflows/bkit-plan.md b/.bkit/core/workflows/bkit-plan.md
index 1ec5d418e..299793756 100644
--- a/.bkit/core/workflows/bkit-plan.md
+++ b/.bkit/core/workflows/bkit-plan.md
@@ -426,7 +426,8 @@ description: "Plan Feature — Autonomous plan generation"
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
-5. Route:
+5. Route — first match wins:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 8.
    - **Else** → **Failure Path**.
 
diff --git a/.bkit/core/workflows/bkit-ship.md b/.bkit/core/workflows/bkit-ship.md
index 63b054e13..305eb56d3 100644
--- a/.bkit/core/workflows/bkit-ship.md
+++ b/.bkit/core/workflows/bkit-ship.md
@@ -249,6 +249,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **If** exit 0 **and** `PR_BASE` != dev → **Failure Path**.
    - **If** exit 0 → sub-step 3.
    - **If** exit 1 → open a PR and set `SHIP_OPENED_PR` = true. **If** `docs/plans/{YYYYMM}/{FID}-plan.md` exists → the block names it in the PR body:
+
      ```bash
      "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
      OPEN_EXIT=0
@@ -256,11 +257,17 @@ description: "Ship Feature — Autonomous merge and archive"
      case "$OPEN_EXIT" in 0 | 80) "{BKIT}" status meta --file="{STATUS}" --workflow=ship --opened-pr >/dev/null || exit 1 ;; esac
      exit "$OPEN_EXIT"
      ```
-     **If** exit 80 → `create_pull_request` with the printed `title`, `body`, `base` and `head`.
-     **If** any other non-zero exit → **Failure Path**.
+
+     Route:
+     - **If** exit 81 → end turn, re-run this block.
+     - **If** exit 0 → continue with the next instruction.
+     - **If** exit 80 → `create_pull_request` with the printed `title`, `body`, `base` and `head`.
+     - **Else** → **Failure Path**.
+
      Re-run the `bkit prs probe` above.
      Hold `number` as `PR_NUMBER`, `baseRefName` as `PR_BASE`, and hold `state`.
      Assert `PR_NUMBER` non-empty and `PR_BASE` = dev. **If** the assertion fails → **Failure Path**.
+
    - **Else** → **Failure Path**.
 3. Route:
    - **If** `state` = MERGED → record the resume marker → Step 13:
@@ -374,10 +381,18 @@ description: "Ship Feature — Autonomous merge and archive"
    Hold `outcome` as `REGEN_OUTCOME`.
    Route:
    - **If** exit 0 **and** `REGEN_OUTCOME` = committed → push it, so CI starts at the regenerated head; NEVER force:
+
      ```bash
      "{BKIT}" branches push --mode=plain >/dev/null
      ```
+
+     Route:
+     - **If** exit 81 → end turn, re-run this block.
+     - **If** exit 0 → continue with the next instruction.
+     - **Else** → **Failure Path**.
+
      Then Step 5.
+
    - **If** exit 0 **and** `REGEN_OUTCOME` = unchanged **or** undeclared → Step 5. Nothing was committed.
    - **Else** → **Failure Path**.
 
@@ -422,6 +437,10 @@ description: "Ship Feature — Autonomous merge and archive"
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 4 — Integrate
 
@@ -549,6 +568,10 @@ description: "Ship Feature — Autonomous merge and archive"
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 8 — Commit + Push Bookkeeping
 
@@ -604,10 +627,18 @@ description: "Ship Feature — Autonomous merge and archive"
        ```
        Hold `outcome` as `REGEN_OUTCOME` and `head` as `CODE_HEAD`.
        - **If** exit 0 **and** `REGEN_OUTCOME` = committed → push the fix, and NEVER force:
+
          ```bash
          "{BKIT}" branches push --mode=plain >/dev/null
          ```
+
+         Route:
+         - **If** exit 81 → end turn, re-run this block.
+         - **If** exit 0 → continue with the next instruction.
+         - **Else** → **Failure Path**.
+
          Then set `REVALIDATE_REASON` empty → Step 9 (re-validate at the regenerated head, then re-run the merge gate).
+
        - **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed).
      - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
      - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
@@ -756,11 +787,18 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
        ```
        Hold `value` as `MERGE_ATTEMPT`.
      - Commit and push the fix, and NEVER force:
+
        ```bash
        "{BKIT}" ledgers commit --month="{YYYYMM}" --fid="{FID}" --scope=full --mode=commit --stage-tracked-updates --message="fix({FID}): failure-remediate attempt {MERGE_ATTEMPT}" >/dev/null \
          || { echo "[bkit-ship] failure-remediate commit failed" >&2; exit 1; }
        "{BKIT}" branches push --mode=plain >/dev/null
        ```
+
+       Route:
+       - **If** exit 81 → end turn, re-run this block.
+       - **If** exit 0 → continue with the next instruction.
+       - **Else** → **Failure Path**.
+
      - Set `REVALIDATE_REASON` empty → Step 9 (re-validate, then re-run the merge).
    - **Else** → **Failure Path**.
 
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index 30e1d33e2..a61bfdcd7 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -34,3 +34,4 @@
 {"schema":3,"ts":1793615559505,"kind":"friction","key":"825-plan-update-format-rework","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-apply-review"},"references":["docs/plans/202611/logs/825-show-progress-bar/plan-update-check.md"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","description":"The reviewed plan required one correction pass after plan-check found two missing parsed NEW inventory rows and one malformed UPDATE field.","remediation":"Correct the named inventory and task field lines and rerun the required plan check.","source":"orchestrator","status":"OPEN"}
 {"schema":3,"ts":1793605813975,"kind":"friction","key":"build-724-tracker-auth-and-handover-drift","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-convert"},"references":["docs/plans/202610/logs/724-machine-wide-test/build-plan-check.md"],"category":"tool-failure","scope":"bkit-repo","severity":"HIGH","summary":"Build tracker writes failed and failure record push was blocked","description":"GitHub CLI issue requests returned 401 Bad credentials; GitHub connector writes returned 403 Resource not accessible by integration. Plan check refused TASK 11 with three format problems and one missing reuse inventory row. Failure handover push was rejected by pre-push bkit check: generated .bkit/templates.md drift (2 writes would occur).","status":"OPEN"}
 {"schema":3,"ts":1793610048113,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"ff8d9e7f31a912126c2afc5d464e79dda471b56a"},"recurrenceCount":1}
+{"schema":3,"ts":1793666390329,"kind":"friction","key":"build-724-push-probe-plan-scope","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["docs/plans/202610/logs/724-machine-wide-test/build-tests-red-4-2.md","docs/plans/202610/logs/724-machine-wide-test/build-plan-tasks-4-log.md"],"category":"agent-rework","scope":"bkit-repo","severity":"MEDIUM","summary":"Push route guard counted a broader workflow scope than its probes","description":"Task 11 named three workflows while the generated guard counted push fences across five. Thirteen scoped routes passed but the global inventory contained fifteen. Partial task validation entries also used DONE and caused the next brief to omit blocked work.","remediation":"Corrected the plan to cover all five workflows, strengthened the guard through the tests step, recorded new red evidence, implemented the two missing retry routes, and corrected partial log entries to NOTE. Final contract, full gate, argument forwarding and changed-file checks passed.","source":"orchestrator","status":"CLOSED"}
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 4c5961cc5..838c8408b 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -1179,7 +1179,7 @@ Clause section lines:
   - specialised: `bkit-ship`
   - applies: `bkit-plan`, `bkit-ship`
 - drift:
-  - `bkit-ship:399`: "Each commit the block makes carries `bkit [skip ci]`" The Step 4 merge commit brings `dev`'s code onto the branch under `[skip ci]`; `docs-commits` says the tag goes ONLY on a commit that carries no code
+  - `bkit-ship:414`: "Each commit the block makes carries `bkit [skip ci]`" The Step 4 merge commit brings `dev`'s code onto the branch under `[skip ci]`; `docs-commits` says the tag goes ONLY on a commit that carries no code
     - kept: a push trigger would validate nothing a run has not already validated on `dev`; Step 9 `runs revalidate` dispatches CI at the merged head itself, so the code is validated by a run the workflow starts
 
 ```text
@@ -1371,7 +1371,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-annotations`, `bkit-audit-ci-performance`
 - drift:
-  - `bkit-ship:563`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
+  - `bkit-ship:586`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
     - kept: Re-validate probes for an existing run first and dispatches only when the head has none, which happens when the head commit carries `[skip ci]` or GitHub started no run
 
 ```text
@@ -1670,7 +1670,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-ci-performance`
 - drift:
-  - `bkit-ship:563`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
+  - `bkit-ship:586`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
     - kept: Re-validate probes for an existing run first and dispatches only when the head has none, which happens when the head commit carries `[skip ci]` or GitHub started no run
 
 ```text
@@ -5434,6 +5434,15 @@ A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that l
 Write the session prompt verbatim to `{SESSION_DIR}/prompt.md` → read the issue and the `FID` it names:
 ```
 
+### workflow-tests-lock-wait
+
+- workflow: repeatable
+- carriers: workflow all except `bkit-auto`
+
+```text
+**If** exit 81 → end turn, re-run this block.
+```
+
 ### workflow-fid-named-held
 
 - workflow: where-used
@@ -9435,7 +9444,7 @@ Same text in 2+ files. `- carriers:` names them per surface; `pnpm instructions:
   Finish:
   ```
 
-- carriers: workflow `bkit-build`, `bkit-plan`
+- carriers: workflow `bkit-build`, `bkit-design`, `bkit-plan`
 
   ```text
   Route — first match wins:
@@ -10025,7 +10034,6 @@ Find the branch's PR — open first, then merged:
 [prs] **If** exit 0 **and** `PR_BASE` != dev → **Failure Path**.
 **If** exit 1 → open a PR and set `SHIP_OPENED_PR` = true. **If** `docs/plans/{YYYYMM}/{FID}-plan.md` exists → the block names it in the PR body:
 **If** exit 80 → `create_pull_request` with the printed `title`, `body`, `base` and `head`.
-**If** any other non-zero exit → **Failure Path**.
 Assert `PR_NUMBER` non-empty and `PR_BASE` = dev. **If** the assertion fails → **Failure Path**.
 **If** `state` = MERGED → record the resume marker → Step 13:
 **Else** → next sub-step.
@@ -10442,6 +10450,7 @@ Apply a targeted fix by editing or creating source.
 **If** the gap suggests missing tests → implement them.
 Check that the gap's acceptance criteria hold.
 Append the gap's `DONE` or `BLOCKED` line before you take the next gap.
+**If** the group gate exits 81 → another run holds the machine-wide tests lock: run the same command again. Count the wait as no gap and no reason to edit code.
 The gate stops at its first failing stage, so treat each new failure that a later run shows as another gap of this round.
 Before you fix a failure, search for every other test and source file built on the same failing assumption.
 Fix those files in the same pass as the failure.
diff --git a/.bkit/prompts.md b/.bkit/prompts.md
index a67b07305..184a4d20f 100644
--- a/.bkit/prompts.md
+++ b/.bkit/prompts.md
@@ -204,7 +204,7 @@ Canonical per-agent metadata, and the single source of truth for each agent's mo
 | `bkit-build-plan-tests` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 100 | writes one task group's planned tests before its code (test files only); uses the machine lock for shared services |
 | `bkit-build-plan-tasks` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 100 | task executor for one task group (source modifier with test loop); uses the machine lock for shared services; re-runs tests-lock waits |
 | `bkit-build-plan-verify` | `claude-opus-5-5` | `gpt-6-astra` | `gemini-4-argon` | `cursor-grok-4.5-high` | `openai/gpt-6.1-sol` | `deepseek-v4.1-flash:1017` | `gpt-6.1-sol` | `gemini-4-argon` | `high` | 100 | verify one group, or the whole plan once, vs the plan; re-runs tests-lock waits |
-| `bkit-build-plan-gaps-remediate` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 100 | fix one group's verification gaps (source modifier with test loop); uses the machine lock for shared services; re-runs tests-lock waits |
+| `bkit-build-plan-gaps-remediate` | `claude-sonnet-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `composer-2.5` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `medium` | 100 | fix one group's verification gaps (source modifier with test loop); uses the machine lock for shared services; re-runs group-gate and changed-test lock waits |
 | `bkit-build-challenge-1` | `claude-opus-5-5` | `gpt-6-astra` | `gemini-4-argon` | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `high` | 200 | parallel slot 1 (bug-hunting lens) |
 | `bkit-build-challenge-2` | `claude-opus-5-5` | `gpt-6-astra` | `gemini-4-argon` | `cursor-grok-4.5-high` | `openai/gpt-6.1-sol` | `deepseek-v4.1-flash:1017` | `gpt-6.1-sol` | `gemini-4-argon` | `high` | 200 | parallel slot 2 (security lens; depth-sensitive — both opus) |
 | `bkit-debug-failure-reproduce` | `claude-opus-5-5` | `gpt-6.1-sol` | `gemini-4-argon` | `cursor-grok-4.5-high` | `deepseek/deepseek-v4.1-flash-1017` | `deepseek-v4.1-flash:1017` | `deepseek-v4.1-flash` | `deepseek-v4.1-flash` | `high` | 200 | failing tests from a bug report, no fix; opus over the sonnet test-writer tier — an off-symptom test sends the fix loop after the wrong bug |
diff --git a/.bkit/shared/docs/testing.md b/.bkit/shared/docs/testing.md
index a9a5713cd..db430520a 100644
--- a/.bkit/shared/docs/testing.md
+++ b/.bkit/shared/docs/testing.md
@@ -310,6 +310,7 @@ A plan's `Derived Test Matrix` (`docs/templates/bkit-plan.md`) applies this rubr
 Wrap each test-running `bkit:gate:*` script with the adopted machine lock (`.bkit/templates.md` § Machine lock). The wrapped script holds the `tests` lock for the whole gate, across repositories. An unwired repository takes no lock.
 
 - `bkit tests run` and `bkit tests changed` pass `--lock-wait-s` as `LOCAL_STACK_LOCK_WAIT_S` and their run name as `LOCAL_STACK_LOCK_WHO`; they run the declared gate without executing the lock script itself.
+- `bkit branches push` passes the same wait budget and its run name to Git. When its pre-push hook's gate gives up on the tests lock, it exits 81 with `lockHolder` and reports nothing pushed; the workflow ends the turn and re-runs the block.
 - A tests-lock give-up of this run becomes exit 81 with `lockHolder`, and a tests-lock refusal becomes exit 4. A lock wait writes no `test-run` status row. A gate's own failure or a nested lock's give-up remains a test failure. A raw gate caller sees exit 75 and the holder line.
 - Light runs (`bkit tests red`, `green` and `bkit:test:file`) take no tests lock. Nested wraps reuse the live parent's tests lock. `CI=true` / `CI=1` bypasses locking.
 - `BKIT_TEST_SLOTS` sets the number of tests slots (default 1). The lock exports `BKIT_TEST_WORKERS` for the consumer to pass to its runner.
diff --git a/.bkit/version b/.bkit/version
index 3953b7373..d3bd53bb9 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -3,7 +3,7 @@
   "canonicalHashes": {
     ".cursor/mcp.json": "355e01cadabed3b924ebe339dc07ecbf7179397ebc9accf8618d5d7d6af6c438",
     "docs/deployments.md": "b7a8014afb7da246d615894519d87d5def6d0c6c7be8e714fb634157cdd7580f",
-    "docs/testing.md": "e7b70b85e058c0558a3205fdafa982a84915433e2b57d2b2369805229b164cff",
+    "docs/testing.md": "5a97bd9588e26caec1efda103d11aa3b7a605bf76e48630183604773350fd040",
     ".claude/settings.json": "34cfc63ef7bfb248ce3f27116ad3f6f89fd75678c599d2cd8e702c43f6958587",
     ".agents/context.md": "5cf54b91ffaa5d9372415a24dd1acfe0910c7def1f4434e25ccf110e3eaed013",
     ".agents/docs.md": "bfbddbf98bc4238c6a01dbd68fbe515ba01db2371c440d868fe12a8db6c96df0",
@@ -24,15 +24,15 @@
     ".opencode/opencode.json": "06b3702dcb8968463c164b36fbc340428591f6601420cb48e95371db1d1ac958",
     "docs/design.md": "05d888d6188c44f518bd1d10b4c01ae6af373a6ce79da72fbaf10d5d45154e15",
     ".claude/commands/bkit-auto.md": "791c511a2618c575c4b7eec06b5ea880fb990adc3099fef69b58dfc9654617b3",
-    ".claude/commands/bkit-build.md": "770994ae048a2e6cdfc42f99518aa0da0d7b9ee0ba4bef8b7e92f70d8a39c946",
-    ".claude/commands/bkit-debug.md": "1994fbdff23e2e38349047c6b1326c990fc84c4b1ef9614d4b8d54ab813a4072",
-    ".claude/commands/bkit-design.md": "47ebc840d1b82c4d002ea72b2f56119f3398abf701ae2a1e6fe02d7658947c66",
-    ".claude/commands/bkit-plan.md": "5d7b72d4511208f7298115d9a5351d1649d2b697c1ad7fb461c38c895c18b2eb",
-    ".claude/commands/bkit-ship.md": "6002b9ac4093390a5ed374775a53e9901c93b6a43190b4472c8120140af504d5",
+    ".claude/commands/bkit-build.md": "ec24f64f1ec0a214955c4d0ba6abb5093dfa5895ce3ff645a64ee2d5f5cde6c8",
+    ".claude/commands/bkit-debug.md": "0e8af52136c8a75befa8329d222a43ff1697bbf207e382f4eab41ce809d69d7c",
+    ".claude/commands/bkit-design.md": "2fdd100324831ff19647460fcf21e89c8733aa41a615b692e5612cfeb64e409c",
+    ".claude/commands/bkit-plan.md": "10a864fc36c3fac1d6e8564b7c6ad9f363e6c54add5539ebe8bee2f78f78f8a9",
+    ".claude/commands/bkit-ship.md": "242dde0032c0ce6b8d6038b35bc5e56d24be64a983b3c323d6f24de72fbb51dd",
     ".claude/agents/bkit-build-challenge-1.md": "cdd3c2ac8dff17591adacf9cccae4162fa5b8d1fdb02f409e50acff40f8826f3",
     ".claude/agents/bkit-build-challenge-2.md": "05bd003c57e9d176ab68484d0356f730db95fb7d62536cbe2bc995c1524c349b",
     ".claude/agents/bkit-build-install-skills.md": "6e933518e6be37d8a384b9592293b47c8683247e6e96cda82e6c0bfff1fd641b",
-    ".claude/agents/bkit-build-plan-gaps-remediate.md": "b284b8088024df6d19cafc1fb63a76c2aa8ef2dca0190c776f6ea8968f1f8b8a",
+    ".claude/agents/bkit-build-plan-gaps-remediate.md": "9336fae3010effbdcc86ced62821aea441c278bfceff4bc255108237533402af",
     ".claude/agents/bkit-build-plan-verify.md": "e69b3d3e3cbc6b3d75b788d6b85b3c861fdd5f5bf3e5cc2265c12582d8f2b02e",
     ".claude/agents/bkit-debug-abort-handover.md": "d5c3192877fa3e83be3a753dfa67732de465350b2ffb50588ee1bf9f8953619a",
     ".claude/agents/bkit-debug-failure-diagnose.md": "465fbe537f5193bb702fc65895c306ff602426c785506b208abd0742ace33d46",
@@ -56,15 +56,15 @@
     ".claude/agents/bkit-utility-compress-markdown.md": "b43e14949abd2218e1407fa587ee542bd5951caf543c4bd0718b7a78eea128c7",
     ".claude/agents/bkit-utility-update-documentation.md": "0b3d4145acaf8ce46ace5328fe2e13f904d3c8aba8823aa1c2bff6a4cc5f7d3e",
     ".cursor/commands/bkit-auto.md": "33ad52f5f03d107b8e7d54888737c6d887d7de74083dd736726e69c49ccf6c46",
-    ".cursor/commands/bkit-build.md": "99a3c60a26f7c01361b30a54845b12b157371a927919d0c756a902005911740c",
-    ".cursor/commands/bkit-debug.md": "7208fddc6c448bab4fa0059f9fe9405aed1e6e428a5a8aa528744b3a0cc38f82",
-    ".cursor/commands/bkit-design.md": "84428fe9d3039142380f6c8bbf10cdb4dde8701673cebe85d439761ab9520c83",
-    ".cursor/commands/bkit-plan.md": "310a1229b9bd29c688794e5fb86582cf4e2830a3eb51b3c05344b42ffc1d77d8",
-    ".cursor/commands/bkit-ship.md": "dcb346086646617fcd7b68e59cc3f7f13b5a6081790997afb6f67f996aee4ea4",
+    ".cursor/commands/bkit-build.md": "f14af5df0867b0dd9d59ebdab255a011d2a9ec054d77b1b2d46dfc989c962ada",
+    ".cursor/commands/bkit-debug.md": "811c22a73ff23f14230fdd900a6a184a05397c3427af358432b2278976c4a3d4",
+    ".cursor/commands/bkit-design.md": "6967dbcfde58fe28b49f82624d3928e438419188bf34735e280930134e7f7c78",
+    ".cursor/commands/bkit-plan.md": "3d14e905afb59f28627155077e6586aa2a5984b923203edd80dab4a6b93fc885",
+    ".cursor/commands/bkit-ship.md": "fa4380339c054a7c8861944a10e7a68127cf0d54837cbdb360309e8e7578d32e",
     ".cursor/agents/bkit-build-challenge-1.md": "093141086374b85fd0fc944cafb575ec60a80df88fed1e471ac18640bc5cbe61",
     ".cursor/agents/bkit-build-challenge-2.md": "b4998b1d36bff4fc827cbd8310650fe9c4f2f9647685e243bca33984ddde9ef6",
     ".cursor/agents/bkit-build-install-skills.md": "b1a9b1ebb7272c08186f150fee495808bec6a2c98dd840724bf2e92ad3df5dd9",
-    ".cursor/agents/bkit-build-plan-gaps-remediate.md": "14b3e665ad7ab847a47b9556c04804a46468d9452425b2d906bfc8bf40b2b892",
+    ".cursor/agents/bkit-build-plan-gaps-remediate.md": "d728bda4f74d0d331f54bb154e67826dc04c37294804b6e7e5e11a658dca3823",
     ".cursor/agents/bkit-build-plan-verify.md": "e3fae7b4e7a6dba151cb55fd29194eb2f3a28df10d3acd5621c0dbae17812fe6",
     ".cursor/agents/bkit-debug-abort-handover.md": "ba64fff85fe057551119face8d3198d0b9c4a4d2566cbb7f7909a12cfa522b0f",
     ".cursor/agents/bkit-debug-failure-diagnose.md": "b9745705caf0edd43ce394aacf72d09eb50814ca4a52e564adb485b4930a3874",
@@ -90,7 +90,7 @@
     ".opencode/agents/bkit-build-challenge-1.md": "17e547063a83c16d99741be6a50483a6a4e384472bda7b13e18c97d93059a4ab",
     ".opencode/agents/bkit-build-challenge-2.md": "7e5a0830fb1423a0e3ac8ec8f6444c8ca2521c2214c61edd345de116a82b6ed8",
     ".opencode/agents/bkit-build-install-skills.md": "57b9f5432fb2b270dcd6074c8ea6a634c284131f2d4befede879e25aec9581f9",
-    ".opencode/agents/bkit-build-plan-gaps-remediate.md": "ef34136b03642b5b75976a7e27be0be6660e4790640904c71177f40a2ad3194d",
+    ".opencode/agents/bkit-build-plan-gaps-remediate.md": "cb84f22a4260aa20490ab5cba5292896df150e289c47299c62e8e59c9642b439",
     ".opencode/agents/bkit-build-plan-verify.md": "d3e21f98d9a5ff8d113ed40e9198d4d7392ed593f8dbe4232f020b84ebee5e51",
     ".opencode/agents/bkit-debug-abort-handover.md": "1109c9c685682613cf7e694ffaa58a6b3bd769b15de0570ce6852c6627f18ceb",
     ".opencode/agents/bkit-debug-failure-diagnose.md": "8e7941906f8d01025c1ed34a12f9ac3625a0302d0c6cb2059da7e99dc00984c7",
@@ -114,11 +114,11 @@
     ".opencode/agents/bkit-utility-compress-markdown.md": "8265357e11e5bd3d358281b2f712e09dff81cb5d278436ab7584355784b09f7f",
     ".opencode/agents/bkit-utility-update-documentation.md": "e494bd347aa52ca97786a094d9083721ad264070f1e3a0c90efeac23789dcc2a",
     ".opencode/commands/bkit-auto.md": "a4defb7da6655281048a25473bd2207cd553e4363ac9d3ff798022cb79d3e19f",
-    ".opencode/commands/bkit-build.md": "92552e76f2d572488aae32b5e77c66ce403817b9501d521b9eb18d89693a86cd",
-    ".opencode/commands/bkit-debug.md": "95a6d196aa2d4d592006a2ea4c37bb9d68727d8f2d588a96146911f35821e3c5",
-    ".opencode/commands/bkit-design.md": "79fbcbf63fd2fe85d0f3a3774e112a0db311145815cd11c0d86c4b6bb276261c",
-    ".opencode/commands/bkit-plan.md": "61c3574e63416079f888bcb64ae004a40c014e3ba27568f38daa7e47ba625881",
-    ".opencode/commands/bkit-ship.md": "4dc7491ee275d1327bf3fee192dc83c1eccf92d16cf8520937557dd95a7cb613",
+    ".opencode/commands/bkit-build.md": "725a6e6f2be407bc569e4b003c8b7a8af776136bedae5c6b5c1735e122ccfb44",
+    ".opencode/commands/bkit-debug.md": "6b73160bf8aeaf5475e411d83bb94a867d24e48df5e802d83b5d2df09b1b1e27",
+    ".opencode/commands/bkit-design.md": "0ac8c915206e7bd359c429575b4691872717fe355b89c69d8a4cb577ebbf02ce",
+    ".opencode/commands/bkit-plan.md": "41be3028a46fdbb42f5121e0f94fc87580f69debff86107cb3706bbadd8a3c59",
+    ".opencode/commands/bkit-ship.md": "91edf384c21cf473bbf33d9bbb77114c40841490f05a151657b4e06803452529",
     ".claude/agents/bkit-design-spike.md": "179985ceaeac1d1105321e1b44774830372e715fab2d2bff3eeb306d2b87506a",
     ".cursor/agents/bkit-design-spike.md": "748e208e6debd4ef6253bcbe775c153a004940fbc710a85c1df1ea07bffedd74",
     ".opencode/agents/bkit-design-spike.md": "a57d8e46156607813cb72addbb58b38cf5b5e73fbc9f4b37d833abd84d2e347d",
@@ -131,7 +131,7 @@
     ".codex/agents/bkit-build-challenge-2.toml": "6af86e33a2d74882073456bcf2881c7851d380856b04b7db8bfca7f71b323c15",
     ".codex/agents/bkit-build-install-skills.toml": "ca2c193fcdc970c5ed2045b01b873035b286a4bf0892f6231ef78412a3af2517",
     ".codex/agents/bkit-build-plan-current.toml": "f5c7afff5d03e45bff26fc041743061580a04abb602213c2cad328f013487d2f",
-    ".codex/agents/bkit-build-plan-gaps-remediate.toml": "d3bcec5ba8792d88b413f6487f0d7594bb162485adae2d9281e60617eeb4e5b3",
+    ".codex/agents/bkit-build-plan-gaps-remediate.toml": "95bb2e1096b699888d483fd736e27e8e5572a98a7168c36125f0ab01455641fa",
     ".codex/agents/bkit-build-plan-verify.toml": "0d103e2975b21b4c93b5ef09dd34e6bd841cdc8b84d5df7b5e8e576ac3ba1a15",
     ".codex/agents/bkit-debug-abort-handover.toml": "8200295a4f88a4aca5f679ba1a685ea09335113a50bf9e3301a26e292d841acd",
     ".codex/agents/bkit-debug-failure-diagnose.toml": "4d9787753d5e242a9b86403070be7431f640afe28eaeb685ca1e0d3607657386",
@@ -222,9 +222,9 @@
     ".bkit/install.md": "a7b498987af7aeb1a05b019033256f81af218db1e56f3c675cb869764f5b2e2f",
     ".bkit/jsonl.md": "e2f0b02be4edceb5bbd338e4f0d3fb00cb0654cb3b8df447f7b81b9de09561fb",
     ".bkit/providers.md": "f55e9e3e06f53afec0ba2aed6d0981307469cfc4c1aba7b99f176cc3a8cde6eb",
-    ".bkit/prompts.md": "1be56eab2c975275c7c494594fdd4b99468edc3fed33ac38febc33bb7ce95a96",
+    ".bkit/prompts.md": "26cc51e0731b0052dbb8f37711aecba3b9bd0aad30061e3818484d75d118f291",
     ".bkit/trackers.md": "3a3b60d2de7e69a8a59a7567159457afa6c5787a1f066b1399f6ed7499b49d96",
-    ".bkit/workflows.md": "33b831d38b516c045dc8fbb4353d68bc0ddd651058ea776377faec89eb0ee2a5",
+    ".bkit/workflows.md": "7701f159ab6797030e27e215017a439af0445f5f531307e26eb33c77202ee614",
     ".bkit/README.md": "1037df0251190241d83d900a9e3e5e2bf8e6dbfd3d9cb7d5f7948a73ab9732a4",
     ".cursor/rules/bkit-rules.mdc": "164c1bc7aed517d5eca01abac2f0c0e87a1102ceb1700eae02e340ef6f9ce797",
     ".claude/hooks/bkit-gateguard.cjs": "e13200a179c654f32e2a91f79be766c1755dd814d7d025bffd707ba6e91b965e",
@@ -264,7 +264,7 @@
     ".codex/hooks/bkit-rules.cjs": "37b3c590ada277b78a246908dadddbb31c64798ca5d300e57b193e314620da67",
     ".opencode/plugin/bkit-rules.js": "6769eacc40fc2856faa9265c5665d5e4426b23c21e3df1e4f177ed6422221824",
     ".bkit/router.md": "86d116ff31947df4b7f52b76b3e3928bc3ac5bfad54ddf7c4a9ae53d2b0cf18a",
-    ".bkit/cli.md": "db85ca950e6c33bf58e02b26e1e81d1967dab3a3aa86aa6dc9ecf4fc3c732414",
+    ".bkit/cli.md": "7e039c9d216619fde5acd142c0f7280ecd48531a95f0b1e20db0ac86d51a944f",
     ".claude/agents/bkit-build-plan-tests.md": "bde2d105b742a40d6d0271ba5849fd19bc0ab5b02c9a97c5452fda328a3262b2",
     ".cursor/agents/bkit-build-plan-tests.md": "ddd04c0aa5c0afa58baa3ba27c811e85c8811cd01f1da373973488e8d5868af4",
     ".opencode/agents/bkit-build-plan-tests.md": "5c2f3a89e3b0472cf66f2c754e73d883ff140100ed1b282d53e164381e30065c",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 3ade4d66a..c97641a25 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -90,6 +90,8 @@ Rendering can be re-run: the source carries every wired variant, so a tracker sw
 
 **Rationale for the workflow files** (kept here, not in them, per `.bkit/authoring.md` § Prompts and Workflows):
 
+- **Tests-lock wait:** `bkit tests run` and `bkit branches push` exit 81 when the machine-wide tests lock stays held past the host's wait budget (`--lock-wait-s` for `tests run`; `BKIT_LOCK_WAIT_S` for both commands). Design, plan, build, debug and ship end the turn and re-run every test or push block on 81, and a subagent handed a group gate command runs the same command again. There is no re-run ceiling. A holder held past three times the last run duration its line names is stale: report its pid, since time and last run duration instead of re-running.
+
 - **`bkit branches push` leases a personal branch:** Step 2's rebase onto `origin/dev` rewrites SHAs, so a plain push is non-fast-forward. `--mode=feature` / `--mode=abort` push with `--force-with-lease`. `dev` / `main` push plain and are never forced. Each call makes exactly one `git push`. This mirrors `rules.md` § Force push.
 - **`BKIT_VER` reads `pinnedVersion`, not `version`:** the fallback is `[ -z … ] &&`, not a piped one. A pipeline's status is the last command's, so a `| tr … || echo` fallback never fires when the grep fails.
 - **`deferrals` / `failures` on the `outcome` row are a cumulative count of distinct `key`s, not of lines:** a row is updated by appending a line with the same `key` (§ Updating a Row in `.bkit/jsonl.md`), so `wc -l` double-counts closed deferrals. Readers derive one cycle's count from the change against the prior outcome row (`newFailuresThisRun` in `.bkit/core/engine/commands/analysis.ts`).
diff --git a/.claude/agents/bkit-build-plan-gaps-remediate.md b/.claude/agents/bkit-build-plan-gaps-remediate.md
index 9cc9d9ce7..1d7670e89 100644
--- a/.claude/agents/bkit-build-plan-gaps-remediate.md
+++ b/.claude/agents/bkit-build-plan-gaps-remediate.md
@@ -102,6 +102,7 @@ autoCompactWindow: 300000
 8. **If** `package.json` declares a `bkit:generate` script → run `pnpm bkit:generate` once, after your last code edit. It rewrites the generated files and saved baselines from your code, so the caller commits them with it.
    - **If** it exits non-zero → append `BLOCKED — bkit:generate: {first error line}` with Bash `echo >>`. The verdict is then `FAIL`, whatever the tasks and tests show.
 9. Run `bkit tests changed --fallback=bkit:gate:static-unit`. Every local test must pass. **If** Context names a group gate → run that command after the fixes, and again after each further fix, until it exits 0:
+   - **If** the group gate exits 81 → another run holds the machine-wide tests lock: run the same command again. Count the wait as no gap and no reason to edit code.
    - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - The gate stops at its first failing stage, so treat each new failure that a later run shows as another gap of this round.
    - Before you fix a failure, search for every other test and source file built on the same failing assumption.
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index 9845f890d..2dfc84076 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -643,6 +643,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```
    Route:
    - **If** exit 0 **or** 1 → hold `verdict` as `GATE_VERDICT` and `scope` as `TEST_SCOPE` → sub-step 9.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 9. Finish:
    ```bash
@@ -884,6 +885,7 @@ This step runs once, after the last group. Challenge fix groups pass through it
    Decide `TEST_VERDICT`:
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 3. Finish — `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown):
    ```bash
@@ -1017,6 +1019,7 @@ This step runs once, after the last group. Challenge fix groups pass through it
    "{BKIT}" branches push --mode=feature --set-upstream
    ```
 5. Route:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 16.
    - **Else** → **Failure Path**.
 
@@ -1084,19 +1087,30 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 1 → `FORCE_BUILD` = false → sub-step 3.
    - **Else** → **Failure Path**.
 3. Re-read the labels, then close the run with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. It then pushes with the HEAD-Subject Assertion and releases the lock. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
+   
    **Skip if** `ISSUE_ID` empty. Re-read the issue:
+
    ```bash
    "{BKIT}" issues fetch --issue="{ISSUE_ID}" --outbox="{OUTBOX}"
    ```
+
    Hold `state` as `STATE`, `labels` as `LABELS`. **If** exit 80 → read them via the tracker MCP (**Tracker**).
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
+
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
-   "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit 1
+   "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit "$?"
    "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
    ```
+
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
+
    Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+
 4. Create the PR. Its body names `docs/plans/{YYYYMM}/{FID}-plan.md` when the plan exists:
 
    ```bash
diff --git a/.claude/commands/bkit-debug.md b/.claude/commands/bkit-debug.md
index c7db75f44..019a340c7 100644
--- a/.claude/commands/bkit-debug.md
+++ b/.claude/commands/bkit-debug.md
@@ -282,6 +282,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    Decide `TEST_VERDICT`:
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown):
    ```bash
@@ -521,6 +522,10 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 9 — Push Remediation
 
@@ -548,6 +553,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    "{BKIT}" branches push --mode=feature
    ```
 3. Route:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
@@ -611,16 +617,24 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
    Release and push:
    - **If** `BRANCH` != `dev`:
+
      ```bash
      "{BKIT}" locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
      "{BKIT}" branches push --mode=feature --require-ci >/dev/null
      ```
+
+     Route:
+     - **If** exit 81 → end turn, re-run this block.
+     - **If** exit 0 → continue with the next instruction.
+     - **Else** → **Failure Path**.
+
    - **If** `BRANCH` = `dev`:
      Push ONLY the run's own commits, and keep the lock:
      ```bash
      "{BKIT}" branches push --mode=dev --require-ci --fid={FID}
      ```
      Route:
+     - **If** exit 81 → end turn, re-run this block.
      - **If** exit 0 **and** `skipped` null → hold `sha` as `DEV_SHA` (never the local HEAD); `BRANCH` = `dev` → `{CLOSE_PARENT}` = `{DEV_SHA}`; `DEV_PUSHED` = true.
      - **If** exit 0 **and** `skipped` = `no-run-commits` → narrate `[bkit-debug] dev push: every run commit is already on origin/dev; nothing pushed, no CI run to gate` → `DEV_PUSHED` = false.
      - **If** exit 8 (push failed or refused), exit 10 (fetch failed), exit 11 (replay conflict, the conflicting paths printed) or exit 20 (the run's record is gone, nothing pushed) → **Failure Path**.
@@ -644,9 +658,16 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    - **If** exit 80 → `create_pull_request` with the printed `title` / `body` / `base` / `head` → hold its number as `PR_NUMBER` and its URL as `PR_URL`.
    - **Else** → **Failure Path**.
 6. **If** `TRIGGER_PR` = 1 → commit and push the CI-triggering head. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when `ISSUE_ID` is empty:
+
    ```bash
    "{BKIT}" branches push --mode=feature --require-ci --commit="chore({FID}): create-pr bkit [verbose ci]" {LABEL_FLAGS} --file="{STATUS}" --workflow=debug
    ```
+
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
+
 7. **Run only if** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 **or** `BRANCH` = `dev`.
    **If** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 → run the CI-Dispatch Gate on the pushed head. It records `{DISPATCH_ROW}`, cross-checks the transport and records the close transport. `{DISPATCH_ROW}` = `--step=debug-close-workflow {LIVE_SKIPPED}` when `{PR_OPEN}` = 1, `--step=debug-create-pr --artifact={PR_URL}` after a created PR. `{LABEL_FLAGS}` as in sub-step 6:
 
diff --git a/.claude/commands/bkit-design.md b/.claude/commands/bkit-design.md
index 7977084f4..44580c7eb 100644
--- a/.claude/commands/bkit-design.md
+++ b/.claude/commands/bkit-design.md
@@ -438,7 +438,8 @@ description: "Design Feature — Autonomous design phase"
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
-4. Route:
+4. Route — first match wins:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
diff --git a/.claude/commands/bkit-plan.md b/.claude/commands/bkit-plan.md
index 50dd4aaff..027709465 100644
--- a/.claude/commands/bkit-plan.md
+++ b/.claude/commands/bkit-plan.md
@@ -369,7 +369,8 @@ description: "Plan Feature — Autonomous plan generation"
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
-5. Route:
+5. Route — first match wins:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 8.
    - **Else** → **Failure Path**.
 
diff --git a/.claude/commands/bkit-ship.md b/.claude/commands/bkit-ship.md
index a26706cbc..1a6ceefd4 100644
--- a/.claude/commands/bkit-ship.md
+++ b/.claude/commands/bkit-ship.md
@@ -204,6 +204,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **If** exit 0 **and** `PR_BASE` != dev → **Failure Path**.
    - **If** exit 0 → sub-step 3.
    - **If** exit 1 → open a PR and set `SHIP_OPENED_PR` = true. **If** `docs/plans/{YYYYMM}/{FID}-plan.md` exists → the block names it in the PR body:
+
      ```bash
      "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
      OPEN_EXIT=0
@@ -211,11 +212,17 @@ description: "Ship Feature — Autonomous merge and archive"
      case "$OPEN_EXIT" in 0 | 80) "{BKIT}" status meta --file="{STATUS}" --workflow=ship --opened-pr >/dev/null || exit 1 ;; esac
      exit "$OPEN_EXIT"
      ```
-     **If** exit 80 → `create_pull_request` with the printed `title`, `body`, `base` and `head`.
-     **If** any other non-zero exit → **Failure Path**.
+
+     Route:
+     - **If** exit 81 → end turn, re-run this block.
+     - **If** exit 0 → continue with the next instruction.
+     - **If** exit 80 → `create_pull_request` with the printed `title`, `body`, `base` and `head`.
+     - **Else** → **Failure Path**.
+
      Re-run the `bkit prs probe` above.
      Hold `number` as `PR_NUMBER`, `baseRefName` as `PR_BASE`, and hold `state`.
      Assert `PR_NUMBER` non-empty and `PR_BASE` = dev. **If** the assertion fails → **Failure Path**.
+
    - **Else** → **Failure Path**.
 3. Route:
    - **If** `state` = MERGED → record the resume marker → Step 13:
@@ -329,10 +336,18 @@ description: "Ship Feature — Autonomous merge and archive"
    Hold `outcome` as `REGEN_OUTCOME`.
    Route:
    - **If** exit 0 **and** `REGEN_OUTCOME` = committed → push it, so CI starts at the regenerated head; NEVER force:
+
      ```bash
      "{BKIT}" branches push --mode=plain >/dev/null
      ```
+
+     Route:
+     - **If** exit 81 → end turn, re-run this block.
+     - **If** exit 0 → continue with the next instruction.
+     - **Else** → **Failure Path**.
+
      Then Step 5.
+
    - **If** exit 0 **and** `REGEN_OUTCOME` = unchanged **or** undeclared → Step 5. Nothing was committed.
    - **Else** → **Failure Path**.
 
@@ -377,6 +392,10 @@ description: "Ship Feature — Autonomous merge and archive"
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 4 — Integrate
 
@@ -504,6 +523,10 @@ description: "Ship Feature — Autonomous merge and archive"
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 8 — Commit + Push Bookkeeping
 
@@ -559,10 +582,18 @@ description: "Ship Feature — Autonomous merge and archive"
        ```
        Hold `outcome` as `REGEN_OUTCOME` and `head` as `CODE_HEAD`.
        - **If** exit 0 **and** `REGEN_OUTCOME` = committed → push the fix, and NEVER force:
+
          ```bash
          "{BKIT}" branches push --mode=plain >/dev/null
          ```
+
+         Route:
+         - **If** exit 81 → end turn, re-run this block.
+         - **If** exit 0 → continue with the next instruction.
+         - **Else** → **Failure Path**.
+
          Then set `REVALIDATE_REASON` empty → Step 9 (re-validate at the regenerated head, then re-run the merge gate).
+
        - **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed).
      - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
      - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
@@ -709,11 +740,18 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
        ```
        Hold `value` as `MERGE_ATTEMPT`.
      - Commit and push the fix, and NEVER force:
+
        ```bash
        "{BKIT}" ledgers commit --month="{YYYYMM}" --fid="{FID}" --scope=full --mode=commit --stage-tracked-updates --message="fix({FID}): failure-remediate attempt {MERGE_ATTEMPT}" >/dev/null \
          || { echo "[bkit-ship] failure-remediate commit failed" >&2; exit 1; }
        "{BKIT}" branches push --mode=plain >/dev/null
        ```
+
+       Route:
+       - **If** exit 81 → end turn, re-run this block.
+       - **If** exit 0 → continue with the next instruction.
+       - **Else** → **Failure Path**.
+
      - Set `REVALIDATE_REASON` empty → Step 9 (re-validate, then re-run the merge).
    - **Else** → **Failure Path**.
 
diff --git a/.codex/agents/bkit-build-plan-gaps-remediate.toml b/.codex/agents/bkit-build-plan-gaps-remediate.toml
index cee360fec..3e5537b93 100644
--- a/.codex/agents/bkit-build-plan-gaps-remediate.toml
+++ b/.codex/agents/bkit-build-plan-gaps-remediate.toml
@@ -89,6 +89,7 @@ developer_instructions = """
 8. **If** `package.json` declares a `bkit:generate` script → run `pnpm bkit:generate` once, after your last code edit. It rewrites the generated files and saved baselines from your code, so the caller commits them with it.
    - **If** it exits non-zero → append `BLOCKED — bkit:generate: {first error line}` with Bash `echo >>`. The verdict is then `FAIL`, whatever the tasks and tests show.
 9. Run `bkit tests changed --fallback=bkit:gate:static-unit`. Every local test must pass. **If** Context names a group gate → run that command after the fixes, and again after each further fix, until it exits 0:
+   - **If** the group gate exits 81 → another run holds the machine-wide tests lock: run the same command again. Count the wait as no gap and no reason to edit code.
    - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - The gate stops at its first failing stage, so treat each new failure that a later run shows as another gap of this round.
    - Before you fix a failure, search for every other test and source file built on the same failing assumption.
diff --git a/.cursor/agents/bkit-build-plan-gaps-remediate.md b/.cursor/agents/bkit-build-plan-gaps-remediate.md
index 12a485e10..9d2b4533c 100644
--- a/.cursor/agents/bkit-build-plan-gaps-remediate.md
+++ b/.cursor/agents/bkit-build-plan-gaps-remediate.md
@@ -99,6 +99,7 @@ tools:
 8. **If** `package.json` declares a `bkit:generate` script → run `pnpm bkit:generate` once, after your last code edit. It rewrites the generated files and saved baselines from your code, so the caller commits them with it.
    - **If** it exits non-zero → append `BLOCKED — bkit:generate: {first error line}` with Bash `echo >>`. The verdict is then `FAIL`, whatever the tasks and tests show.
 9. Run `bkit tests changed --fallback=bkit:gate:static-unit`. Every local test must pass. **If** Context names a group gate → run that command after the fixes, and again after each further fix, until it exits 0:
+   - **If** the group gate exits 81 → another run holds the machine-wide tests lock: run the same command again. Count the wait as no gap and no reason to edit code.
    - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - The gate stops at its first failing stage, so treat each new failure that a later run shows as another gap of this round.
    - Before you fix a failure, search for every other test and source file built on the same failing assumption.
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index 92ed0d0a9..e9fca771f 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -642,6 +642,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```
    Route:
    - **If** exit 0 **or** 1 → hold `verdict` as `GATE_VERDICT` and `scope` as `TEST_SCOPE` → sub-step 9.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 9. Finish:
    ```bash
@@ -883,6 +884,7 @@ This step runs once, after the last group. Challenge fix groups pass through it
    Decide `TEST_VERDICT`:
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 3. Finish — `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown):
    ```bash
@@ -1016,6 +1018,7 @@ This step runs once, after the last group. Challenge fix groups pass through it
    "{BKIT}" branches push --mode=feature --set-upstream
    ```
 5. Route:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 16.
    - **Else** → **Failure Path**.
 
@@ -1083,19 +1086,30 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 1 → `FORCE_BUILD` = false → sub-step 3.
    - **Else** → **Failure Path**.
 3. Re-read the labels, then close the run with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. It then pushes with the HEAD-Subject Assertion and releases the lock. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
+   
    **Skip if** `ISSUE_ID` empty. Re-read the issue:
+
    ```bash
    "{BKIT}" issues fetch --issue="{ISSUE_ID}" --outbox="{OUTBOX}"
    ```
+
    Hold `state` as `STATE`, `labels` as `LABELS`. **If** exit 80 → read them via the tracker MCP (**Tracker**).
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
+
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
-   "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit 1
+   "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit "$?"
    "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
    ```
+
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
+
    Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+
 4. Create the PR. Its body names `docs/plans/{YYYYMM}/{FID}-plan.md` when the plan exists:
 
    ```bash
diff --git a/.cursor/commands/bkit-debug.md b/.cursor/commands/bkit-debug.md
index 7c0dabaca..647c0d9a7 100644
--- a/.cursor/commands/bkit-debug.md
+++ b/.cursor/commands/bkit-debug.md
@@ -281,6 +281,7 @@ Debug Feature — Autonomous diagnosis and remediation
    Decide `TEST_VERDICT`:
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown):
    ```bash
@@ -520,6 +521,10 @@ Debug Feature — Autonomous diagnosis and remediation
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 9 — Push Remediation
 
@@ -547,6 +552,7 @@ Debug Feature — Autonomous diagnosis and remediation
    "{BKIT}" branches push --mode=feature
    ```
 3. Route:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
@@ -610,16 +616,24 @@ Debug Feature — Autonomous diagnosis and remediation
 
    Release and push:
    - **If** `BRANCH` != `dev`:
+
      ```bash
      "{BKIT}" locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
      "{BKIT}" branches push --mode=feature --require-ci >/dev/null
      ```
+
+     Route:
+     - **If** exit 81 → end turn, re-run this block.
+     - **If** exit 0 → continue with the next instruction.
+     - **Else** → **Failure Path**.
+
    - **If** `BRANCH` = `dev`:
      Push ONLY the run's own commits, and keep the lock:
      ```bash
      "{BKIT}" branches push --mode=dev --require-ci --fid={FID}
      ```
      Route:
+     - **If** exit 81 → end turn, re-run this block.
      - **If** exit 0 **and** `skipped` null → hold `sha` as `DEV_SHA` (never the local HEAD); `BRANCH` = `dev` → `{CLOSE_PARENT}` = `{DEV_SHA}`; `DEV_PUSHED` = true.
      - **If** exit 0 **and** `skipped` = `no-run-commits` → narrate `[bkit-debug] dev push: every run commit is already on origin/dev; nothing pushed, no CI run to gate` → `DEV_PUSHED` = false.
      - **If** exit 8 (push failed or refused), exit 10 (fetch failed), exit 11 (replay conflict, the conflicting paths printed) or exit 20 (the run's record is gone, nothing pushed) → **Failure Path**.
@@ -643,9 +657,16 @@ Debug Feature — Autonomous diagnosis and remediation
    - **If** exit 80 → `create_pull_request` with the printed `title` / `body` / `base` / `head` → hold its number as `PR_NUMBER` and its URL as `PR_URL`.
    - **Else** → **Failure Path**.
 6. **If** `TRIGGER_PR` = 1 → commit and push the CI-triggering head. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when `ISSUE_ID` is empty:
+
    ```bash
    "{BKIT}" branches push --mode=feature --require-ci --commit="chore({FID}): create-pr bkit [verbose ci]" {LABEL_FLAGS} --file="{STATUS}" --workflow=debug
    ```
+
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
+
 7. **Run only if** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 **or** `BRANCH` = `dev`.
    **If** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 → run the CI-Dispatch Gate on the pushed head. It records `{DISPATCH_ROW}`, cross-checks the transport and records the close transport. `{DISPATCH_ROW}` = `--step=debug-close-workflow {LIVE_SKIPPED}` when `{PR_OPEN}` = 1, `--step=debug-create-pr --artifact={PR_URL}` after a created PR. `{LABEL_FLAGS}` as in sub-step 6:
 
diff --git a/.cursor/commands/bkit-design.md b/.cursor/commands/bkit-design.md
index c62e1cf49..db39a9314 100644
--- a/.cursor/commands/bkit-design.md
+++ b/.cursor/commands/bkit-design.md
@@ -437,7 +437,8 @@ Design Feature — Autonomous design phase
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
-4. Route:
+4. Route — first match wins:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
diff --git a/.cursor/commands/bkit-plan.md b/.cursor/commands/bkit-plan.md
index c55d2f112..4a44f89d0 100644
--- a/.cursor/commands/bkit-plan.md
+++ b/.cursor/commands/bkit-plan.md
@@ -368,7 +368,8 @@ Plan Feature — Autonomous plan generation
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
-5. Route:
+5. Route — first match wins:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 8.
    - **Else** → **Failure Path**.
 
diff --git a/.cursor/commands/bkit-ship.md b/.cursor/commands/bkit-ship.md
index 8931b89ab..2d6963873 100644
--- a/.cursor/commands/bkit-ship.md
+++ b/.cursor/commands/bkit-ship.md
@@ -203,6 +203,7 @@ Ship Feature — Autonomous merge and archive
    - **If** exit 0 **and** `PR_BASE` != dev → **Failure Path**.
    - **If** exit 0 → sub-step 3.
    - **If** exit 1 → open a PR and set `SHIP_OPENED_PR` = true. **If** `docs/plans/{YYYYMM}/{FID}-plan.md` exists → the block names it in the PR body:
+
      ```bash
      "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
      OPEN_EXIT=0
@@ -210,11 +211,17 @@ Ship Feature — Autonomous merge and archive
      case "$OPEN_EXIT" in 0 | 80) "{BKIT}" status meta --file="{STATUS}" --workflow=ship --opened-pr >/dev/null || exit 1 ;; esac
      exit "$OPEN_EXIT"
      ```
-     **If** exit 80 → `create_pull_request` with the printed `title`, `body`, `base` and `head`.
-     **If** any other non-zero exit → **Failure Path**.
+
+     Route:
+     - **If** exit 81 → end turn, re-run this block.
+     - **If** exit 0 → continue with the next instruction.
+     - **If** exit 80 → `create_pull_request` with the printed `title`, `body`, `base` and `head`.
+     - **Else** → **Failure Path**.
+
      Re-run the `bkit prs probe` above.
      Hold `number` as `PR_NUMBER`, `baseRefName` as `PR_BASE`, and hold `state`.
      Assert `PR_NUMBER` non-empty and `PR_BASE` = dev. **If** the assertion fails → **Failure Path**.
+
    - **Else** → **Failure Path**.
 3. Route:
    - **If** `state` = MERGED → record the resume marker → Step 13:
@@ -328,10 +335,18 @@ Ship Feature — Autonomous merge and archive
    Hold `outcome` as `REGEN_OUTCOME`.
    Route:
    - **If** exit 0 **and** `REGEN_OUTCOME` = committed → push it, so CI starts at the regenerated head; NEVER force:
+
      ```bash
      "{BKIT}" branches push --mode=plain >/dev/null
      ```
+
+     Route:
+     - **If** exit 81 → end turn, re-run this block.
+     - **If** exit 0 → continue with the next instruction.
+     - **Else** → **Failure Path**.
+
      Then Step 5.
+
    - **If** exit 0 **and** `REGEN_OUTCOME` = unchanged **or** undeclared → Step 5. Nothing was committed.
    - **Else** → **Failure Path**.
 
@@ -376,6 +391,10 @@ Ship Feature — Autonomous merge and archive
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 4 — Integrate
 
@@ -503,6 +522,10 @@ Ship Feature — Autonomous merge and archive
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 8 — Commit + Push Bookkeeping
 
@@ -558,10 +581,18 @@ Ship Feature — Autonomous merge and archive
        ```
        Hold `outcome` as `REGEN_OUTCOME` and `head` as `CODE_HEAD`.
        - **If** exit 0 **and** `REGEN_OUTCOME` = committed → push the fix, and NEVER force:
+
          ```bash
          "{BKIT}" branches push --mode=plain >/dev/null
          ```
+
+         Route:
+         - **If** exit 81 → end turn, re-run this block.
+         - **If** exit 0 → continue with the next instruction.
+         - **Else** → **Failure Path**.
+
          Then set `REVALIDATE_REASON` empty → Step 9 (re-validate at the regenerated head, then re-run the merge gate).
+
        - **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed).
      - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
      - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
@@ -708,11 +739,18 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
        ```
        Hold `value` as `MERGE_ATTEMPT`.
      - Commit and push the fix, and NEVER force:
+
        ```bash
        "{BKIT}" ledgers commit --month="{YYYYMM}" --fid="{FID}" --scope=full --mode=commit --stage-tracked-updates --message="fix({FID}): failure-remediate attempt {MERGE_ATTEMPT}" >/dev/null \
          || { echo "[bkit-ship] failure-remediate commit failed" >&2; exit 1; }
        "{BKIT}" branches push --mode=plain >/dev/null
        ```
+
+       Route:
+       - **If** exit 81 → end turn, re-run this block.
+       - **If** exit 0 → continue with the next instruction.
+       - **Else** → **Failure Path**.
+
      - Set `REVALIDATE_REASON` empty → Step 9 (re-validate, then re-run the merge).
    - **Else** → **Failure Path**.
 
diff --git a/.opencode/agents/bkit-build-plan-gaps-remediate.md b/.opencode/agents/bkit-build-plan-gaps-remediate.md
index 6681ff46a..3151bbf03 100644
--- a/.opencode/agents/bkit-build-plan-gaps-remediate.md
+++ b/.opencode/agents/bkit-build-plan-gaps-remediate.md
@@ -100,6 +100,7 @@ tools:
 8. **If** `package.json` declares a `bkit:generate` script → run `pnpm bkit:generate` once, after your last code edit. It rewrites the generated files and saved baselines from your code, so the caller commits them with it.
    - **If** it exits non-zero → append `BLOCKED — bkit:generate: {first error line}` with Bash `echo >>`. The verdict is then `FAIL`, whatever the tasks and tests show.
 9. Run `bkit tests changed --fallback=bkit:gate:static-unit`. Every local test must pass. **If** Context names a group gate → run that command after the fixes, and again after each further fix, until it exits 0:
+   - **If** the group gate exits 81 → another run holds the machine-wide tests lock: run the same command again. Count the wait as no gap and no reason to edit code.
    - **If** `bkit tests changed` exits 81 → another run holds the machine-wide tests lock: run the command again. A wait is not a failure or a reason to edit code.
    - The gate stops at its first failing stage, so treat each new failure that a later run shows as another gap of this round.
    - Before you fix a failure, search for every other test and source file built on the same failing assumption.
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index 443c5944d..05a0a22d8 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -646,6 +646,7 @@ Each task group gets its own pass of Steps 7-9, in group order. Step 7 briefs th
    ```
    Route:
    - **If** exit 0 **or** 1 → hold `verdict` as `GATE_VERDICT` and `scope` as `TEST_SCOPE` → sub-step 9.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 9. Finish:
    ```bash
@@ -887,6 +888,7 @@ This step runs once, after the last group. Challenge fix groups pass through it
    Decide `TEST_VERDICT`:
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 3. Finish — `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown):
    ```bash
@@ -1020,6 +1022,7 @@ This step runs once, after the last group. Challenge fix groups pass through it
    "{BKIT}" branches push --mode=feature --set-upstream
    ```
 5. Route:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 16.
    - **Else** → **Failure Path**.
 
@@ -1087,19 +1090,30 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 1 → `FORCE_BUILD` = false → sub-step 3.
    - **Else** → **Failure Path**.
 3. Re-read the labels, then close the run with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. It then pushes with the HEAD-Subject Assertion and releases the lock. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
+   
    **Skip if** `ISSUE_ID` empty. Re-read the issue:
+
    ```bash
    "{BKIT}" issues fetch --issue="{ISSUE_ID}" --outbox="{OUTBOX}"
    ```
+
    Hold `state` as `STATE`, `labels` as `LABELS`. **If** exit 80 → read them via the tracker MCP (**Tracker**).
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
+
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
-   "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit 1
+   "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit "$?"
    "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
    ```
+
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
+
    Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+
 4. Create the PR. Its body names `docs/plans/{YYYYMM}/{FID}-plan.md` when the plan exists:
 
    ```bash
diff --git a/.opencode/commands/bkit-debug.md b/.opencode/commands/bkit-debug.md
index 11c22468d..9a22c9138 100644
--- a/.opencode/commands/bkit-debug.md
+++ b/.opencode/commands/bkit-debug.md
@@ -285,6 +285,7 @@ $ARGUMENTS
    Decide `TEST_VERDICT`:
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown):
    ```bash
@@ -524,6 +525,10 @@ $ARGUMENTS
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 9 — Push Remediation
 
@@ -551,6 +556,7 @@ $ARGUMENTS
    "{BKIT}" branches push --mode=feature
    ```
 3. Route:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
@@ -614,16 +620,24 @@ $ARGUMENTS
 
    Release and push:
    - **If** `BRANCH` != `dev`:
+
      ```bash
      "{BKIT}" locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
      "{BKIT}" branches push --mode=feature --require-ci >/dev/null
      ```
+
+     Route:
+     - **If** exit 81 → end turn, re-run this block.
+     - **If** exit 0 → continue with the next instruction.
+     - **Else** → **Failure Path**.
+
    - **If** `BRANCH` = `dev`:
      Push ONLY the run's own commits, and keep the lock:
      ```bash
      "{BKIT}" branches push --mode=dev --require-ci --fid={FID}
      ```
      Route:
+     - **If** exit 81 → end turn, re-run this block.
      - **If** exit 0 **and** `skipped` null → hold `sha` as `DEV_SHA` (never the local HEAD); `BRANCH` = `dev` → `{CLOSE_PARENT}` = `{DEV_SHA}`; `DEV_PUSHED` = true.
      - **If** exit 0 **and** `skipped` = `no-run-commits` → narrate `[bkit-debug] dev push: every run commit is already on origin/dev; nothing pushed, no CI run to gate` → `DEV_PUSHED` = false.
      - **If** exit 8 (push failed or refused), exit 10 (fetch failed), exit 11 (replay conflict, the conflicting paths printed) or exit 20 (the run's record is gone, nothing pushed) → **Failure Path**.
@@ -647,9 +661,16 @@ $ARGUMENTS
    - **If** exit 80 → `create_pull_request` with the printed `title` / `body` / `base` / `head` → hold its number as `PR_NUMBER` and its URL as `PR_URL`.
    - **Else** → **Failure Path**.
 6. **If** `TRIGGER_PR` = 1 → commit and push the CI-triggering head. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when `ISSUE_ID` is empty:
+
    ```bash
    "{BKIT}" branches push --mode=feature --require-ci --commit="chore({FID}): create-pr bkit [verbose ci]" {LABEL_FLAGS} --file="{STATUS}" --workflow=debug
    ```
+
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
+
 7. **Run only if** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 **or** `BRANCH` = `dev`.
    **If** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 → run the CI-Dispatch Gate on the pushed head. It records `{DISPATCH_ROW}`, cross-checks the transport and records the close transport. `{DISPATCH_ROW}` = `--step=debug-close-workflow {LIVE_SKIPPED}` when `{PR_OPEN}` = 1, `--step=debug-create-pr --artifact={PR_URL}` after a created PR. `{LABEL_FLAGS}` as in sub-step 6:
 
diff --git a/.opencode/commands/bkit-design.md b/.opencode/commands/bkit-design.md
index 5745602d1..037c58a03 100644
--- a/.opencode/commands/bkit-design.md
+++ b/.opencode/commands/bkit-design.md
@@ -441,7 +441,8 @@ $ARGUMENTS
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
-4. Route:
+4. Route — first match wins:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
diff --git a/.opencode/commands/bkit-plan.md b/.opencode/commands/bkit-plan.md
index ad67a6d57..577b5e82b 100644
--- a/.opencode/commands/bkit-plan.md
+++ b/.opencode/commands/bkit-plan.md
@@ -372,7 +372,8 @@ $ARGUMENTS
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
-5. Route:
+5. Route — first match wins:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 8.
    - **Else** → **Failure Path**.
 
diff --git a/.opencode/commands/bkit-ship.md b/.opencode/commands/bkit-ship.md
index d64ca8606..3c70bafbb 100644
--- a/.opencode/commands/bkit-ship.md
+++ b/.opencode/commands/bkit-ship.md
@@ -207,6 +207,7 @@ $ARGUMENTS
    - **If** exit 0 **and** `PR_BASE` != dev → **Failure Path**.
    - **If** exit 0 → sub-step 3.
    - **If** exit 1 → open a PR and set `SHIP_OPENED_PR` = true. **If** `docs/plans/{YYYYMM}/{FID}-plan.md` exists → the block names it in the PR body:
+
      ```bash
      "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
      OPEN_EXIT=0
@@ -214,11 +215,17 @@ $ARGUMENTS
      case "$OPEN_EXIT" in 0 | 80) "{BKIT}" status meta --file="{STATUS}" --workflow=ship --opened-pr >/dev/null || exit 1 ;; esac
      exit "$OPEN_EXIT"
      ```
-     **If** exit 80 → `create_pull_request` with the printed `title`, `body`, `base` and `head`.
-     **If** any other non-zero exit → **Failure Path**.
+
+     Route:
+     - **If** exit 81 → end turn, re-run this block.
+     - **If** exit 0 → continue with the next instruction.
+     - **If** exit 80 → `create_pull_request` with the printed `title`, `body`, `base` and `head`.
+     - **Else** → **Failure Path**.
+
      Re-run the `bkit prs probe` above.
      Hold `number` as `PR_NUMBER`, `baseRefName` as `PR_BASE`, and hold `state`.
      Assert `PR_NUMBER` non-empty and `PR_BASE` = dev. **If** the assertion fails → **Failure Path**.
+
    - **Else** → **Failure Path**.
 3. Route:
    - **If** `state` = MERGED → record the resume marker → Step 13:
@@ -332,10 +339,18 @@ $ARGUMENTS
    Hold `outcome` as `REGEN_OUTCOME`.
    Route:
    - **If** exit 0 **and** `REGEN_OUTCOME` = committed → push it, so CI starts at the regenerated head; NEVER force:
+
      ```bash
      "{BKIT}" branches push --mode=plain >/dev/null
      ```
+
+     Route:
+     - **If** exit 81 → end turn, re-run this block.
+     - **If** exit 0 → continue with the next instruction.
+     - **Else** → **Failure Path**.
+
      Then Step 5.
+
    - **If** exit 0 **and** `REGEN_OUTCOME` = unchanged **or** undeclared → Step 5. Nothing was committed.
    - **Else** → **Failure Path**.
 
@@ -380,6 +395,10 @@ $ARGUMENTS
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 4 — Integrate
 
@@ -507,6 +526,10 @@ $ARGUMENTS
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 8 — Commit + Push Bookkeeping
 
@@ -562,10 +585,18 @@ $ARGUMENTS
        ```
        Hold `outcome` as `REGEN_OUTCOME` and `head` as `CODE_HEAD`.
        - **If** exit 0 **and** `REGEN_OUTCOME` = committed → push the fix, and NEVER force:
+
          ```bash
          "{BKIT}" branches push --mode=plain >/dev/null
          ```
+
+         Route:
+         - **If** exit 81 → end turn, re-run this block.
+         - **If** exit 0 → continue with the next instruction.
+         - **Else** → **Failure Path**.
+
          Then set `REVALIDATE_REASON` empty → Step 9 (re-validate at the regenerated head, then re-run the merge gate).
+
        - **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed).
      - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
      - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
@@ -712,11 +743,18 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
        ```
        Hold `value` as `MERGE_ATTEMPT`.
      - Commit and push the fix, and NEVER force:
+
        ```bash
        "{BKIT}" ledgers commit --month="{YYYYMM}" --fid="{FID}" --scope=full --mode=commit --stage-tracked-updates --message="fix({FID}): failure-remediate attempt {MERGE_ATTEMPT}" >/dev/null \
          || { echo "[bkit-ship] failure-remediate commit failed" >&2; exit 1; }
        "{BKIT}" branches push --mode=plain >/dev/null
        ```
+
+       Route:
+       - **If** exit 81 → end turn, re-run this block.
+       - **If** exit 0 → continue with the next instruction.
+       - **Else** → **Failure Path**.
+
      - Set `REVALIDATE_REASON` empty → Step 9 (re-validate, then re-run the merge).
    - **Else** → **Failure Path**.
 
diff --git a/CHANGELOG.md b/CHANGELOG.md
index 8a8802eda..aac50d0d6 100644
--- a/CHANGELOG.md
+++ b/CHANGELOG.md
@@ -10,6 +10,8 @@ Format: `## [version] — YYYY-MM-DD`
 
 ### Added
 
+- **`bkit branches push` hands pre-push tests-lock waits back to the agent.** It passes the host's lock wait budget and its run name to Git, and exits 81 with `lockHolder` when the hook's gate gives up waiting. Build, debug and ship re-run their push blocks on 81.
+
 - **`bkit tests changed` recognizes the same tests-lock outcomes as `tests run`.** It accepts `--lock-wait-s`, passes the budget and its run name to the selected gate, and exits 81 with `lockHolder` when that gate gives up on the tests lock. Both commands keep a wait separate from a failing test run; `tests run --file` appends no `test-run` status row for a wait. The caller prompts re-run the command on exit 81.
 - **`bkit tests run` hands tests-lock waits back to the agent.** It passes `--lock-wait-s` and its run name to a wrapped gate, and exits 81 with `lockHolder` when that gate gives up on the tests lock. A refusal exits 4; gate failures keep their normal verdict. The wait defaults to `BKIT_LOCK_WAIT_S`, else 60 seconds; Claude Code ships a 1200-second budget. Light test-first runs stay unwrapped.
 - **The machine lock queues test gates across repositories.** The template is renamed `bkit-machine-lock.sh` and adds named machine-wide locks, configurable test slots, worker limits and enforced lock order. `run` exits 73 when a lock cannot be taken and 75 when its wait gives up; without a TTY, the default wait is 60 seconds. Adopted stack-lock copies keep working. To adopt the tests lock, copy `.bkit/templates/scripts/ci/bkit-machine-lock.sh` to `scripts/ci/` and wrap each test-running `bkit:gate:*` script with `bash scripts/ci/bkit-machine-lock.sh run --lock tests -- <gate command>`. Put chained commands in one `sh -c` string. See `.bkit/templates.md` § Machine lock.
diff --git a/README.md b/README.md
index 9209e7d79..7992a5631 100644
--- a/README.md
+++ b/README.md
@@ -354,11 +354,11 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from ff96751a88626b0e8ae0847fc6992f91c2ef4f15 — do not edit
+  %% Generated by bkit-graphify-rollup.py from f83d12b72366ff2584da7b29038544915d9ec816 — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1649 symbols · 49 files"]
+    n_bkit_core_engine_commands["commands<br/>1650 symbols · 49 files"]
     n_bkit_core_engine_install["install<br/>280 symbols · 19 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>176 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>62 symbols · 4 files"]
diff --git a/dist/commands/workflow/branches.js b/dist/commands/workflow/branches.js
index 996a4f533..9ec9a73fe 100644
--- a/dist/commands/workflow/branches.js
+++ b/dist/commands/workflow/branches.js
@@ -18,7 +18,7 @@ import * as os from "node:os";
 import * as path from "node:path";
 import { gitEnv } from "../../ledgers/telemetry.js";
 import { actionHash, actionKey, alreadyDone, recordAction } from "../../ledgers/status.js";
-import { bodySkipToken, CommandError, DEV, EXIT, ghUnavailable, git, isSharedBranch, OUTPUT_LIMIT, parseJson, repoRoot, runGh, runGit, SKIP_CI_TOKEN, } from "../lib.js";
+import { bodySkipToken, classifyLockExit, CommandError, DEV, EXIT, ghUnavailable, git, isSharedBranch, OUTPUT_LIMIT, parseJson, repoRoot, runGh, runGit, SKIP_CI_TOKEN, testsLockHolder, wholeNumber, } from "../lib.js";
 import { bkitVersionStatus } from "../../shared/bkit-latest.js";
 import { DEV_REFSPEC, fetchDev, landBackoffMs, landDir, pushToDev, sleep } from "../land.js";
 import { TIMEOUTS } from "../../shared/timeouts.js";
@@ -459,6 +459,25 @@ function rebaseOrigHead(top) {
     }
     return null;
 }
+/** Git collapses a failing pre-push hook's status; classify its exact tests-lock markers. */
+function runPush(cwd, args, branch) {
+    const who = `bkit branches push ${branch}`;
+    const wait = wholeNumber(process.env.BKIT_LOCK_WAIT_S, "BKIT_LOCK_WAIT_S", 60);
+    const res = runGit(cwd, args, {
+        LOCAL_STACK_LOCK_WAIT_S: String(wait),
+        LOCAL_STACK_LOCK_WHO: who,
+    });
+    const log = [res.stdout, res.stderr].filter(Boolean).join("\n");
+    const lockHolder = res.ok ? null : testsLockHolder(log, who);
+    const outcome = res.ok
+        ? "gate"
+        : classifyLockExit({ exitCode: lockHolder === null ? 73 : 75, log, who });
+    return {
+        ...res,
+        lockHolder,
+        lockExit: outcome === "lock-wait" ? EXIT.AGENT_WAIT : outcome === "could-not-run" ? 4 : null,
+    };
+}
 /**
  * Push the current branch with exactly one `git push`: plain for dev / main,
  * `--force-with-lease` otherwise. `abort` never pushes into an open PR (`openPr`:
@@ -552,10 +571,10 @@ export async function pushBranch(cwd, o, log) {
         REMOTE,
         branch,
     ];
-    const res = runGit(cwd, args);
+    const res = runPush(cwd, args, branch);
     if (!res.ok) {
         log(`git ${args.join(" ")} failed: ${res.stderr}`);
-        return notPushed(EXIT_PUSH_FAILED);
+        return notPushed(res.lockExit ?? EXIT_PUSH_FAILED, { lockHolder: res.lockHolder });
     }
     log(`pushed ${branch}${shared ? "" : " (--force-with-lease)"}`);
     return {
@@ -611,10 +630,10 @@ function pushPlain(cwd, branch, o, log, notPushed) {
         return notPushed(EXIT_SKIP_CI, { skipped: "skip-ci" });
     }
     const args = ["push", ...(o.setUpstream === true ? ["-u"] : []), REMOTE, branch];
-    const res = runGit(cwd, args);
+    const res = runPush(cwd, args, branch);
     if (!res.ok) {
         log(`git ${args.join(" ")} failed: ${res.stderr}`);
-        return notPushed(EXIT_PUSH_FAILED);
+        return notPushed(res.lockExit ?? EXIT_PUSH_FAILED, { lockHolder: res.lockHolder });
     }
     log(`pushed ${branch}`);
     return {
@@ -737,7 +756,7 @@ async function pushOwnCommits(cwd, rec, o, log, notPushed) {
             REMOTE,
             `${last}:refs/heads/${rec.branch}`,
         ];
-        const res = runGit(cwd, args);
+        const res = runPush(cwd, args, rec.branch);
         if (res.ok) {
             log(`pushed ${rec.branch}: the run's ${pending.length} commit(s) are all local dev holds`);
             return {
@@ -754,6 +773,10 @@ async function pushOwnCommits(cwd, rec, o, log, notPushed) {
                 },
             };
         }
+        if (res.lockExit !== null) {
+            log(`git ${args.join(" ")} failed: ${res.stderr}`);
+            return notPushed(res.lockExit, { lockHolder: res.lockHolder });
+        }
         log(`git ${args.join(" ")} failed: ${res.stderr} — replaying onto a fresh ${UPSTREAM}`);
     }
     const root = repoRoot(cwd);
@@ -866,7 +889,9 @@ async function pushVerb(ctx) {
     }, ctx.log);
     // A detached HEAD and a wrong checkout print nothing, as the push never got to run.
     if (r.code !== EXIT_DETACHED && r.code !== EXIT_NOT_DEV) {
-        ctx.emit(marker === undefined ? r.out : { ...r.out, commit: marker.sha, deduped: marker.deduped });
+        ctx.emit(marker === undefined
+            ? { lockHolder: null, ...r.out }
+            : { lockHolder: null, ...r.out, commit: marker.sha, deduped: marker.deduped });
     }
     return r.code;
 }
@@ -2326,7 +2351,7 @@ export const branchesCommand = {
             run: regenerateVerb,
         },
         push: {
-            summary: "Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise.",
+            summary: "Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise; 81 tests lock held.",
             use: "workflow",
             flags: [
                 {
@@ -2372,6 +2397,7 @@ export const branchesCommand = {
             ],
             output: {
                 pushed: "true when the push ran and succeeded",
+                lockHolder: "the tests-lock holder on exit 81 (null otherwise)",
                 replayed: "true when the run's commits went out as copies cherry-picked onto a fresh origin/dev (an in-place run on dev whose local dev holds other commits); sha is then the landed origin/dev commit",
                 ref: "the branch pushed — link handover artifacts to this ref; null when nothing was pushed",
                 sha: "HEAD commit pushed (null when not pushed)",
@@ -2383,6 +2409,7 @@ export const branchesCommand = {
                 deduped: "--commit: the marker commit was already made this run (not made again)",
             },
             exitCodes: {
+                4: "the pre-push hook could not acquire the tests lock",
                 [EXIT_DETACHED]: "no branch checked out",
                 [EXIT_NOTHING_TO_PUSH]: "--mode=plain or --commit on dev / main, or --ahead-of and HEAD has no commits beyond it",
                 [EXIT_SKIP_CI]: "--require-ci and the HEAD message carries a skip-CI token",
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 109e55fbb..6be262930 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -30,7 +30,7 @@
 > - `budgeted` = solid amber border + a faint amber box. Still drawn, because a declared bypass is still a bypass, but it is settled, not an open question.
 > - Which status is which: `split` fine dash · `bypassed` long dash · `dead` even dash · `gap` dotted · `budgeted` no dash.
 > - A fetched URL is a STRING, never an edge, because the reachability scan (§ Unreachable API calls) is the only check that sees it.
-> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `ff96751a8`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
+> - Table rescanned every run, never stale. Diagrams from `graph.json` @ `f83d12b72`; when that differs from HEAD ⇒ run `pnpm graph:update` first.
 > - Detail-level module graph → `pnpm graph`. This doc is the altitude above that: capabilities, not files.
 
 ## Status Vocabulary
@@ -159,11 +159,11 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from ff96751a88626b0e8ae0847fc6992f91c2ef4f15 — do not edit
+  %% Generated by bkit-graphify-rollup.py from f83d12b72366ff2584da7b29038544915d9ec816 — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>248 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1649 symbols · 49 files"]
+    n_bkit_core_engine_commands["commands<br/>1650 symbols · 49 files"]
     n_bkit_core_engine_install["install<br/>280 symbols · 19 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>176 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>62 symbols · 4 files"]
@@ -248,7 +248,7 @@ config:
     useMaxWidth: false
 ---
 flowchart LR
-  %% Generated by bkit-graphify-rollup.py from ff96751a88626b0e8ae0847fc6992f91c2ef4f15 — do not edit
+  %% Generated by bkit-graphify-rollup.py from f83d12b72366ff2584da7b29038544915d9ec816 — do not edit
   subgraph gncustom_health_checks["Health checks"]
     n_bkit_core_engine_checks_after_index[".bkit/core/engine/checks/after/index<br/>11 symbols · 1 files"]
     n_bkit_core_engine_checks_before_index[".bkit/core/engine/checks/before/index<br/>4 symbols · 1 files"]
@@ -305,7 +305,7 @@ flowchart LR
       n_bkit_core_engine_commands_lib["lib<br/>67 symbols · 1 files"]
       n_bkit_core_engine_commands_setup_setup[".bkit/core/engine/commands/setup/setup<br/>11 symbols · 1 files"]
       subgraph gn_bkit_core_engine_commands_workflow[".bkit/core/engine/commands/workflow"]
-        n_bkit_core_engine_commands_workflow_branches["branches<br/>116 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_branches["branches<br/>117 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_challenge["challenge<br/>34 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_completeness["completeness<br/>4 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_context["context<br/>90 symbols · 1 files"]
@@ -369,7 +369,7 @@ flowchart LR
     end
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands_workflow_branches -->|122| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_branches -->|127| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_workflows -->|79| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_runs -->|57| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_prs -->|53| n_bkit_core_engine_commands_lib
diff --git a/docs/testing.md b/docs/testing.md
index 05e61cd5c..1a5874833 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -310,6 +310,7 @@ A plan's `Derived Test Matrix` (`docs/templates/bkit-plan.md`) applies this rubr
 Wrap each test-running `bkit:gate:*` script with the adopted machine lock (`.bkit/templates.md` § Machine lock). The wrapped script holds the `tests` lock for the whole gate, across repositories. An unwired repository takes no lock.
 
 - `bkit tests run` and `bkit tests changed` pass `--lock-wait-s` as `LOCAL_STACK_LOCK_WAIT_S` and their run name as `LOCAL_STACK_LOCK_WHO`; they run the declared gate without executing the lock script itself.
+- `bkit branches push` passes the same wait budget and its run name to Git. When its pre-push hook's gate gives up on the tests lock, it exits 81 with `lockHolder` and reports nothing pushed; the workflow ends the turn and re-runs the block.
 - A tests-lock give-up of this run becomes exit 81 with `lockHolder`, and a tests-lock refusal becomes exit 4. A lock wait writes no `test-run` status row. A gate's own failure or a nested lock's give-up remains a test failure. A raw gate caller sees exit 75 and the holder line.
 - Light runs (`bkit tests red`, `green` and `bkit:test:file`) take no tests lock. Nested wraps reuse the live parent's tests lock. `CI=true` / `CI=1` bypasses locking.
 - `BKIT_TEST_SLOTS` sets the number of tests slots (default 1). The lock exports `BKIT_TEST_WORKERS` for the consumer to pass to its runner.
@@ -544,7 +545,8 @@ See `deployments.md` § Commit-message force tags for the marker mechanics. That
 
 - **Runner:** Vitest 5 (`pnpm test` → `vitest run`). Shell: bats (`pnpm bkit:test:bats`). Harvest: `node:test` (`pnpm test:harvest`).
 - **One test file:** `pnpm bkit:test:file {file}` → `scripts/ci/bkit-test-file.mjs` picks the runner by file type (`.bats` → bats, `.mjs` → `node --test`, else Vitest); JUnit report only when `$BKIT_TEST_REPORT` is set.
-- **Changed files:** `pnpm bkit:gate:changed {file}...` → `scripts/gate/bkit-gate-changed.mjs`, which `bkit tests changed` calls for build and debug agents: `vitest related --run` on the changed files, every test file that names a changed path (Vitest, `node --test` or bats by file type), Oxlint on changed engine `.ts`, Prettier on every changed file, and `pnpm typecheck` when a `.ts` file changed. Runs every stage, and exits 1 when any fails.
+- **Changed files:** `pnpm bkit:gate:changed {file}...` holds the `tests` lock through `scripts/ci/bkit-machine-lock.sh` and passes the file arguments to `scripts/gate/bkit-gate-changed.mjs`, which `bkit tests changed` calls for build and debug agents: `vitest related --run` on the changed files, every test file that names a changed path (Vitest, `node --test` or bats by file type), Oxlint on changed engine `.ts`, Prettier on every changed file, and `pnpm typecheck` when a `.ts` file changed. Runs every stage, and exits 1 when any fails.
+- **Test gates:** `bkit:gate:static-unit`, `bkit:gate:static-unit-integration` and `bkit:gate:install-static-unit-build` hold the same `tests` lock for their whole run. A nested gate inherits its parent's live lock owner and runs unlocked.
 - **Test files** sit next to the file they test under `.bkit/core/engine/`; tests that read shipped text (workflows, templates, hooks, this repo's own docs and ledgers) sit in `.bkit/core/engine/audits/{workflows,templates,hooks,repo}/`. `tests/` = bats (`tests/*.bats`) + fixtures (`tests/fixtures/`).
 - **Real-repo guard:** both tiers run from `.husky/pre-push`, whose git exports `GIT_DIR` (from a linked worktree `<main>/.git/worktrees/<name>`, which beats a child's cwd and `-C`). `vitest.setup.ts` and `tests/setup_suite.bash` clear every `GIT_*` variable before any test runs, then read `user.name` / `user.email` / `core.bare` / `core.worktree` of the repo the run starts from; a change fails the test (vitest, after each test, `vitest.repo-config-guard.ts`) or the run (bats `teardown_suite`) and puts the old values back. Pinned by `.bkit/core/engine/audits/repo/vitest-repo-config-guard.test.ts` and `.bkit/core/engine/audits/repo/bats-setup-suite.integration.test.ts`.
 - **Test lint:** Oxlint (`.oxlintrc.json`, the adopted copy of the `.bkit/templates/.oxlintrc.json` template; `pnpm lint`, inside `bkit:gate:static`) lints `**/*.test.ts` with only these rules, all `error`: `vitest/expect-expect`, `vitest/no-conditional-in-test`, `vitest/no-conditional-expect`, `vitest/valid-expect` (`maxArgs: 2` — `expect(value, message)` is legal), `typescript/no-floating-promises` (type-aware against `tsconfig.test.json`). A hit is fixed in the test: no baseline, no ignore list, no disable comment. Branch on state by splitting into one `it` per case (`it.each` for tables); never `if (…) return;`.
diff --git a/package.json b/package.json
index 9b8decd95..ed4351bfa 100644
--- a/package.json
+++ b/package.json
@@ -56,13 +56,13 @@
     "bkit:gate:format": "pnpm lint-staged",
     "bkit:gate:min": "pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta && vitest run .bkit/core/engine/audits/repo/ledger-integrity.test.ts",
     "bkit:gate:static": "pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm lint:prose && pnpm slop:delta",
-    "bkit:gate:static-unit": "pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats",
-    "bkit:gate:static-unit-integration": "pnpm bkit:gate:static-unit && pnpm test:integration",
-    "bkit:gate:install-static-unit-build": "pnpm install --frozen-lockfile && pnpm bkit:gate:static-unit && pnpm build",
+    "bkit:gate:static-unit": "bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats'",
+    "bkit:gate:static-unit-integration": "bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm bkit:gate:static-unit && pnpm test:integration'",
+    "bkit:gate:install-static-unit-build": "bash scripts/ci/bkit-machine-lock.sh run --lock tests -- sh -c 'pnpm install --frozen-lockfile && pnpm bkit:gate:static-unit && pnpm build'",
     "bkit:deps:outdated": "pnpm outdated",
     "bkit:deps:audit": "pnpm audit",
     "bkit:test:file": "node scripts/ci/bkit-test-file.mjs",
-    "bkit:gate:changed": "node scripts/gate/bkit-gate-changed.mjs",
+    "bkit:gate:changed": "bash scripts/ci/bkit-machine-lock.sh run --lock tests -- node scripts/gate/bkit-gate-changed.mjs",
     "bkit:generate": "pnpm build && pnpm cli:sync && pnpm instructions:sync && pnpm bkit upgrade && vitest run .bkit/core/engine/render -u && bash -c 'if command -v graphify >/dev/null 2>&1; then pnpm graph:refresh; else echo \"[bkit] graphify missing — skipping the capability register (install graphify to rebuild docs/capabilities.md)\"; fi'",
     "bkit:lint:file": "oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern",
     "bkit": "node dist/cli.js",
