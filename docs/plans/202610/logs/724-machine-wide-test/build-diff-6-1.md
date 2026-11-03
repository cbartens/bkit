diff --git a/.agents/plugins/bkit/skills/bkit-build/SKILL.md b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
index f04fdea60..606a90cd4 100644
--- a/.agents/plugins/bkit/skills/bkit-build/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-build/SKILL.md
@@ -1098,7 +1098,7 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 0 → `FORCE_BUILD` = true → sub-step 3.
    - **If** exit 1 → `FORCE_BUILD` = false → sub-step 3.
    - **Else** → **Failure Path**.
-3. Re-read the labels, then close the run with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. It then pushes with the HEAD-Subject Assertion and releases the lock. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
+3. Re-read the labels, then close the run once with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. Retain its outputs before the push so a push retry preserves the original final return. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
    
    **Skip if** `ISSUE_ID` empty. Re-read the issue:
 
@@ -1112,8 +1112,18 @@ This block appends the roadmap row in the worktree only, closes and commits the
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
+   ```
+
+   Route:
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
+
+   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+
+   Push with the HEAD-Subject Assertion:
+
+   ```bash
    "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit "$?"
-   "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
    ```
 
    Route:
@@ -1121,7 +1131,15 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 0 → continue with the next instruction.
    - **Else** → **Failure Path**.
 
-   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+   Release the workflow lock after the push succeeds:
+
+   ```bash
+   "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
+   ```
+
+   Route:
+   - **If** exit 0 → sub-step 4.
+   - **Else** → **Failure Path**.
 
 4. Create the PR. Its body names `docs/plans/{YYYYMM}/{FID}-plan.md` when the plan exists:
 
diff --git a/.agents/plugins/bkit/skills/bkit-debug/SKILL.md b/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
index d8c52b7b1..328e9639a 100644
--- a/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-debug/SKILL.md
@@ -328,6 +328,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    Decide `TEST_VERDICT`:
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown): `{CLAMP_FLAG}` = `--clamp-log=debug-run-tests:{NORMAL_ATTEMPT}` only when `source` = `local`; otherwise empty:
    ```bash
@@ -571,6 +572,10 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 9 — Push Remediation
 
@@ -598,6 +603,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    "{BKIT}" branches push --mode=feature
    ```
 3. Route:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
@@ -661,11 +667,13 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
    Release and push:
    - **If** `BRANCH` != `dev`:
+
      ```bash
      "{BKIT}" locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
      "{BKIT}" branches push --mode=feature --require-ci
      ```
      Route:
+     - **If** exit 81 → end turn, re-run this block.
      - **If** exit 0 **and** `pushed` = true **and** `sha` non-empty → hold `sha` as `VERIFY_HEAD`.
      - **Else** → **Failure Path** with the missing pushed verification head.
    - **If** `BRANCH` = `dev`:
@@ -674,6 +682,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
      "{BKIT}" branches push --mode=dev --require-ci --fid={FID}
      ```
      Route:
+     - **If** exit 81 → end turn, re-run this block.
      - **If** exit 0 **and** `skipped` null → hold `sha` as `DEV_SHA` (never the local HEAD); `BRANCH` = `dev` → `{CLOSE_PARENT}` = `{DEV_SHA}`; `DEV_PUSHED` = true.
      - **If** exit 0 **and** `skipped` = `no-run-commits` → narrate `[bkit-debug] dev push: every run commit is already on origin/dev; nothing pushed, no CI run to gate` → `DEV_PUSHED` = false. With a saved CI selection and no held pushed SHA, take **Failure Path** with the missing verification reference.
      - **If** exit 8 (push failed or refused), exit 10 (fetch failed), exit 11 (replay conflict, the conflicting paths printed) or exit 20 (the run's record is gone, nothing pushed) → **Failure Path**.
@@ -697,9 +706,16 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
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
 7. **Run only if** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 **or** `BRANCH` = `dev` **or** CI is selected.
    **If** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 → run the CI-Dispatch Gate on the pushed head. It records `{DISPATCH_ROW}`, cross-checks the transport and records the close transport. `{DISPATCH_ROW}` = `--step=debug-close-workflow {LIVE_SKIPPED}` when `{PR_OPEN}` = 1, `--step=debug-create-pr --artifact={PR_URL}` after a created PR. `{LABEL_FLAGS}` as in sub-step 6:
 
diff --git a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
index 0c1a45a8e..ab1d0b883 100644
--- a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
@@ -215,6 +215,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **If** exit 0 **and** `PR_BASE` != dev → **Failure Path**.
    - **If** exit 0 → sub-step 3.
    - **If** exit 1 → open a PR and set `SHIP_OPENED_PR` = true. **If** `docs/plans/{YYYYMM}/{FID}-plan.md` exists → the block names it in the PR body:
+
      ```bash
      "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
      OPEN_EXIT=0
@@ -222,11 +223,17 @@ description: "Ship Feature — Autonomous merge and archive"
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
@@ -374,6 +381,10 @@ description: "Ship Feature — Autonomous merge and archive"
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 4 — Integrate
 
@@ -501,6 +512,10 @@ description: "Ship Feature — Autonomous merge and archive"
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 8 — Commit + Push Bookkeeping
 
@@ -556,10 +571,18 @@ description: "Ship Feature — Autonomous merge and archive"
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
@@ -706,11 +729,18 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
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
index 4f3bd64b8..4512b94e8 100644
--- a/.agents/skills/bkit-build/SKILL.md
+++ b/.agents/skills/bkit-build/SKILL.md
@@ -1098,7 +1098,7 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 0 → `FORCE_BUILD` = true → sub-step 3.
    - **If** exit 1 → `FORCE_BUILD` = false → sub-step 3.
    - **Else** → **Failure Path**.
-3. Re-read the labels, then close the run with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. It then pushes with the HEAD-Subject Assertion and releases the lock. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
+3. Re-read the labels, then close the run once with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. Retain its outputs before the push so a push retry preserves the original final return. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
    
    **Skip if** `ISSUE_ID` empty. Re-read the issue:
 
@@ -1112,8 +1112,18 @@ This block appends the roadmap row in the worktree only, closes and commits the
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
+   ```
+
+   Route:
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
+
+   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+
+   Push with the HEAD-Subject Assertion:
+
+   ```bash
    "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit "$?"
-   "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
    ```
 
    Route:
@@ -1121,7 +1131,15 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 0 → continue with the next instruction.
    - **Else** → **Failure Path**.
 
-   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+   Release the workflow lock after the push succeeds:
+
+   ```bash
+   "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
+   ```
+
+   Route:
+   - **If** exit 0 → sub-step 4.
+   - **Else** → **Failure Path**.
 
 4. Create the PR. Its body names `docs/plans/{YYYYMM}/{FID}-plan.md` when the plan exists:
 
diff --git a/.agents/skills/bkit-debug/SKILL.md b/.agents/skills/bkit-debug/SKILL.md
index 2c10ec273..62de435d1 100644
--- a/.agents/skills/bkit-debug/SKILL.md
+++ b/.agents/skills/bkit-debug/SKILL.md
@@ -328,6 +328,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    Decide `TEST_VERDICT`:
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown): `{CLAMP_FLAG}` = `--clamp-log=debug-run-tests:{NORMAL_ATTEMPT}` only when `source` = `local`; otherwise empty:
    ```bash
@@ -571,6 +572,10 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 9 — Push Remediation
 
@@ -598,6 +603,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    "{BKIT}" branches push --mode=feature
    ```
 3. Route:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
@@ -661,11 +667,13 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
    Release and push:
    - **If** `BRANCH` != `dev`:
+
      ```bash
      "{BKIT}" locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
      "{BKIT}" branches push --mode=feature --require-ci
      ```
      Route:
+     - **If** exit 81 → end turn, re-run this block.
      - **If** exit 0 **and** `pushed` = true **and** `sha` non-empty → hold `sha` as `VERIFY_HEAD`.
      - **Else** → **Failure Path** with the missing pushed verification head.
    - **If** `BRANCH` = `dev`:
@@ -674,6 +682,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
      "{BKIT}" branches push --mode=dev --require-ci --fid={FID}
      ```
      Route:
+     - **If** exit 81 → end turn, re-run this block.
      - **If** exit 0 **and** `skipped` null → hold `sha` as `DEV_SHA` (never the local HEAD); `BRANCH` = `dev` → `{CLOSE_PARENT}` = `{DEV_SHA}`; `DEV_PUSHED` = true.
      - **If** exit 0 **and** `skipped` = `no-run-commits` → narrate `[bkit-debug] dev push: every run commit is already on origin/dev; nothing pushed, no CI run to gate` → `DEV_PUSHED` = false. With a saved CI selection and no held pushed SHA, take **Failure Path** with the missing verification reference.
      - **If** exit 8 (push failed or refused), exit 10 (fetch failed), exit 11 (replay conflict, the conflicting paths printed) or exit 20 (the run's record is gone, nothing pushed) → **Failure Path**.
@@ -697,9 +706,16 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
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
 7. **Run only if** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 **or** `BRANCH` = `dev` **or** CI is selected.
    **If** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 → run the CI-Dispatch Gate on the pushed head. It records `{DISPATCH_ROW}`, cross-checks the transport and records the close transport. `{DISPATCH_ROW}` = `--step=debug-close-workflow {LIVE_SKIPPED}` when `{PR_OPEN}` = 1, `--step=debug-create-pr --artifact={PR_URL}` after a created PR. `{LABEL_FLAGS}` as in sub-step 6:
 
diff --git a/.agents/skills/bkit-ship/SKILL.md b/.agents/skills/bkit-ship/SKILL.md
index 37e1995e4..7d22caab2 100644
--- a/.agents/skills/bkit-ship/SKILL.md
+++ b/.agents/skills/bkit-ship/SKILL.md
@@ -215,6 +215,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **If** exit 0 **and** `PR_BASE` != dev → **Failure Path**.
    - **If** exit 0 → sub-step 3.
    - **If** exit 1 → open a PR and set `SHIP_OPENED_PR` = true. **If** `docs/plans/{YYYYMM}/{FID}-plan.md` exists → the block names it in the PR body:
+
      ```bash
      "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
      OPEN_EXIT=0
@@ -222,11 +223,17 @@ description: "Ship Feature — Autonomous merge and archive"
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
@@ -374,6 +381,10 @@ description: "Ship Feature — Autonomous merge and archive"
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 4 — Integrate
 
@@ -501,6 +512,10 @@ description: "Ship Feature — Autonomous merge and archive"
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 8 — Commit + Push Bookkeeping
 
@@ -556,10 +571,18 @@ description: "Ship Feature — Autonomous merge and archive"
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
@@ -706,11 +729,18 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
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
index 4f050388e..40cb14fd1 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -85,7 +85,7 @@ Sync, push, land and rebase branches; stamp and read a doc's base-commit anchor.
 | `parse` | workflow | **`--prompt-file`** `--workflow` | Read an explicitly named or existing branch from the session prompt. |
 | `sync` | workflow | `--head` `--merge` `--merge-docs` `--fid` `--file` `--sentinel` | Fetch origin/dev; report whether it is an ancestor of HEAD (Path A/B) and how far docs/ and the ledgers are behind; optionally merge it in. |
 | `regenerate` | workflow | `--fid` `--attempt` `--file` | Run a declared bkit:generate on the feature branch and commit only the paths it changed (ship Step 10's fix round). |
-| `push` | workflow | **`--mode`** `--set-upstream` `--ahead-of` `--commit` `--label` `--file` `--workflow` `--require-ci` `--open-pr` `--fid` | Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise. |
+| `push` | workflow | **`--mode`** `--set-upstream` `--ahead-of` `--commit` `--label` `--file` `--workflow` `--require-ci` `--open-pr` `--fid` | Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise; 81 tests lock held. |
 | `fast-forward` | workflow | **`--onto`** | Fetch a remote branch and fast-forward the checkout onto it; refuse when diverged. |
 | `scan-diff` | by hand | **`--base`** `--paths` `--marker` `--code` `--disabled-tests` `--expect-none` | Exit 0 when the branch's diff from --base matches (paths, an added marker line, a source change, or a disabled test); 1 when not — --disabled-tests turns that round: 1 when a test was disabled or lost an assertion, 0 when none was. |
 | `force-build` | workflow | **`--fid`** **`--file`** **`--workflow`** `--label` `--open-pr` `--title-set` | Force a full CI build: put [force build] on the open PR's title, then push an empty marker commit (once per run). |
@@ -371,8 +371,8 @@ Run the deepest declared local gate, or one test file to record a red and audit
 <!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
-| `changed` | by hand | `--base` `--fallback` | Check only the files changed since --base: run `bkit:gate:changed` with them as arguments, else the --fallback gate; exit 0 PASS or nothing changed, 1 FAIL, 4 could not run. |
-| `run` | by hand | **`--gate`** **`--log`** `--tail` `--artifact` `--fid` `--step` `--attempt` `--file` `--workflow` `--ci-run` `--ci-url` | Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run. |
+| `changed` | by hand | `--lock-wait-s` `--base` `--fallback` | Check only the files changed since --base: run `bkit:gate:changed` with them as arguments, else the --fallback gate; exit 0 PASS or nothing changed, 1 FAIL, 4 could not run, 81 tests lock held. |
+| `run` | by hand | **`--gate`** **`--log`** `--tail` `--lock-wait-s` `--artifact` `--fid` `--step` `--attempt` `--file` `--workflow` `--ci-run` `--ci-url` | Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run, 81 tests lock held. |
 | `red` | workflow | **`--file`** **`--workflow`** **`--group`** **`--plan`** **`--log`** `--writer-log` | Run every TEST FIRST test of one group's open tasks before any task code exists, and write one build-tests-red row holding a state and blob per planned test; a test an earlier row of the group proved red, its file unchanged since, is not run again. Exit 0 every test red, 1 a gap (a test passing, absent from its report, failing lint, or its file missing), 3 bkit:test:file undeclared (blobs recorded, nothing ran), 4 a script could not run. |
 | `green` | workflow | **`--file`** **`--workflow`** `--group` **`--plan`** **`--log`** | Audit a plan's test-first evidence (each TEST FIRST test red at its group's tests step, by the build-tests-red row, or accepted there as passing before any task code; the named test passing now); exit 0 no gaps, 1 gaps or a plan with no task markers. |
 | `plan-check` | by hand | **`--plan`** `--existence` **`--log`** | Check a plan's group and task blocks: the block format, DONE WHEN and TEST FIRST on every task, DEPENDS ON order, the caps from package.json `bkit.workflows.tasks` (defaults: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task), a Reuse Inventory NEW row per CREATE file, a Supersession Inventory row per DELETE, a `Task` on every Derived Test Matrix row and a row per test-bearing task, and that each READ / UPDATE / DELETE file and symbol exists; exit 0 no problems, 1 refused. |
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 6e10b61a9..dcb17403e 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -85,7 +85,7 @@ Sync, push, land and rebase branches; stamp and read a doc's base-commit anchor.
 | `parse` | workflow | **`--prompt-file`** `--workflow` | Read an explicitly named or existing branch from the session prompt. |
 | `sync` | workflow | `--head` `--merge` `--merge-docs` `--fid` `--file` `--sentinel` | Fetch origin/dev; report whether it is an ancestor of HEAD (Path A/B) and how far docs/ and the ledgers are behind; optionally merge it in. |
 | `regenerate` | workflow | `--fid` `--attempt` `--file` | Run a declared bkit:generate on the feature branch and commit only the paths it changed (ship Step 10's fix round). |
-| `push` | workflow | **`--mode`** `--set-upstream` `--ahead-of` `--commit` `--label` `--file` `--workflow` `--require-ci` `--open-pr` `--fid` | Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise. |
+| `push` | workflow | **`--mode`** `--set-upstream` `--ahead-of` `--commit` `--label` `--file` `--workflow` `--require-ci` `--open-pr` `--fid` | Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise; 81 tests lock held. |
 | `fast-forward` | workflow | **`--onto`** | Fetch a remote branch and fast-forward the checkout onto it; refuse when diverged. |
 | `scan-diff` | by hand | **`--base`** `--paths` `--marker` `--code` `--disabled-tests` `--expect-none` | Exit 0 when the branch's diff from --base matches (paths, an added marker line, a source change, or a disabled test); 1 when not — --disabled-tests turns that round: 1 when a test was disabled or lost an assertion, 0 when none was. |
 | `force-build` | workflow | **`--fid`** **`--file`** **`--workflow`** `--label` `--open-pr` `--title-set` | Force a full CI build: put [force build] on the open PR's title, then push an empty marker commit (once per run). |
@@ -371,8 +371,8 @@ Run the deepest declared local gate, or one test file to record a red and audit
 <!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
-| `changed` | by hand | `--base` `--fallback` | Check only the files changed since --base: run `bkit:gate:changed` with them as arguments, else the --fallback gate; exit 0 PASS or nothing changed, 1 FAIL, 4 could not run. |
-| `run` | by hand | **`--gate`** **`--log`** `--tail` `--artifact` `--fid` `--step` `--attempt` `--file` `--workflow` `--ci-run` `--ci-url` | Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run. |
+| `changed` | by hand | `--lock-wait-s` `--base` `--fallback` | Check only the files changed since --base: run `bkit:gate:changed` with them as arguments, else the --fallback gate; exit 0 PASS or nothing changed, 1 FAIL, 4 could not run, 81 tests lock held. |
+| `run` | by hand | **`--gate`** **`--log`** `--tail` `--lock-wait-s` `--artifact` `--fid` `--step` `--attempt` `--file` `--workflow` `--ci-run` `--ci-url` | Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run, 81 tests lock held. |
 | `red` | workflow | **`--file`** **`--workflow`** **`--group`** **`--plan`** **`--log`** `--writer-log` | Run every TEST FIRST test of one group's open tasks before any task code exists, and write one build-tests-red row holding a state and blob per planned test; a test an earlier row of the group proved red, its file unchanged since, is not run again. Exit 0 every test red, 1 a gap (a test passing, absent from its report, failing lint, or its file missing), 3 bkit:test:file undeclared (blobs recorded, nothing ran), 4 a script could not run. |
 | `green` | workflow | **`--file`** **`--workflow`** `--group` **`--plan`** **`--log`** | Audit a plan's test-first evidence (each TEST FIRST test red at its group's tests step, by the build-tests-red row, or accepted there as passing before any task code; the named test passing now); exit 0 no gaps, 1 gaps or a plan with no task markers. |
 | `plan-check` | by hand | **`--plan`** `--existence` **`--log`** | Check a plan's group and task blocks: the block format, DONE WHEN and TEST FIRST on every task, DEPENDS ON order, the caps from package.json `bkit.workflows.tasks` (defaults: 5 tasks and 25 TEST FIRST tests per group; 10 tests across 3 test files per task), a Reuse Inventory NEW row per CREATE file, a Supersession Inventory row per DELETE, a `Task` on every Derived Test Matrix row and a row per test-bearing task, and that each READ / UPDATE / DELETE file and symbol exists; exit 0 no problems, 1 refused. |
diff --git a/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts b/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts
index 5a3d585c3..2b9c5c208 100644
--- a/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts
+++ b/.bkit/core/engine/audits/templates/machine-lock.integration.test.ts
@@ -438,7 +438,77 @@ function commandRun(
   };
 }
 
+function stopGate(pid: number): void {
+  try {
+    process.kill(pid, "SIGKILL");
+  } catch (error) {
+    if (!(error instanceof Error && "code" in error && error.code === "ESRCH")) throw error;
+  }
+}
+
 describe("bkit-machine-lock.sh", { timeout: BUDGET.testTimeout }, () => {
+  it("terminating a run wrapper stops its gate before another run acquires the tests lock", async () => {
+    const env = envFor({ BKIT_TEST_SLOTS: "1", LOCAL_STACK_LOCK_WAIT_S: "0" });
+    const pidFile = path.join(tmp, "gate.pid");
+    const wrapper = spawn(
+      "bash",
+      [
+        SCRIPT,
+        "run",
+        "cancelled gate",
+        "--lock",
+        "tests",
+        "--",
+        "sh",
+        "-c",
+        'echo $$ > "$1"; exec sleep 30',
+        "sh",
+        pidFile,
+      ],
+      { env, stdio: "ignore" },
+    );
+    children.push(wrapper);
+    await expect.poll(() => fs.existsSync(pidFile), { timeout: BUDGET.hookTimeout }).toBe(true);
+    const gatePid = Number(fs.readFileSync(pidFile, "utf-8").trim());
+    expect(gatePid).toBeGreaterThan(0);
+    try {
+      expect(commandRun(["before cancellation", "--lock", "tests", "--", "true"], env).status).toBe(
+        75,
+      );
+      expect(wrapper.kill("SIGTERM")).toBe(true);
+      // The current holder checks its owner's liveness once per second.
+      await delay(1200);
+      const next = commandRun(
+        [
+          "after cancellation",
+          "--lock",
+          "tests",
+          "--",
+          "sh",
+          "-c",
+          'if kill -0 "$1" 2>/dev/null; then echo gate-still-alive; fi; echo acquired',
+          "sh",
+          String(gatePid),
+        ],
+        env,
+      );
+      // Keeping the lock until the gate stops and cancelling the gate are both safe.
+      expect([0, 75], next.stderr).toContain(next.status);
+      expect(next.stdout).not.toContain("gate-still-alive");
+      const expectedOutput: Record<string, string> = { "0": "acquired\n", "75": "" };
+      expect(next.stdout).toBe(expectedOutput[String(next.status)]);
+    } finally {
+      stopGate(gatePid);
+    }
+    await expect
+      .poll(
+        () =>
+          commandRun(["after gate stops", "--lock", "tests", "--", "echo", "released"], env).status,
+        { timeout: BUDGET.hookTimeout },
+      )
+      .toBe(0);
+  });
+
   it("punctuation in distinct named locks keeps acquisition and release state separate", () => {
     const result = run(
       'take_local_stack_lock "hyphen holder" a-b || exit 11\n' +
diff --git a/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts b/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
index 4970359a0..4db32dadc 100644
--- a/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
+++ b/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
@@ -146,6 +146,35 @@ const GATE_CALLERS: ReadonlyArray<readonly [string, string]> = [
 ];
 
 describe("bkit-local-gate-audit (#437)", () => {
+  it("a build close push retry does not repeat workflow close or lose its outputs", () => {
+    const body = fs.readFileSync(path.join(WORKFLOWS_DIR, "bkit-build.md"), "utf-8");
+    const closeBlocks = commandRoutes(body, /\bworkflows close\b/).filter(
+      ({ block }) => !block.includes("--ending=held"),
+    );
+    expect(closeBlocks).toHaveLength(1);
+    const close = closeBlocks[0]!;
+    expect(close.block).toContain("--final-return");
+    expect(close.block).not.toMatch(/\bbranches push\b|\blocks release\b/);
+    const closeAt = body.indexOf(close.block);
+    const pushBlocks = commandRoutes(body.slice(closeAt), /\bbranches push\b/);
+    expect(pushBlocks).toHaveLength(1);
+    const push = pushBlocks[0]!;
+    expect(push.block).not.toMatch(/\broadmap mirror\b|\bworkflows close\b|\blocks release\b/);
+    expectWaitRoute(push.route, "build close push-only retry");
+    const pushAt = body.indexOf(push.block, closeAt);
+    expect(body.lastIndexOf("roadmap mirror", pushAt)).toBeGreaterThanOrEqual(0);
+    const retained = body.slice(closeAt + close.block.length, pushAt);
+    expect(retained).toMatch(/`commentFile`[^\n]*`CLOSE_COMMENT_FILE`/);
+    expect(retained).toMatch(/`tracker`[^\n]*`CLOSE_TRACKER`/);
+    expect(retained).toMatch(/`finalReturn`[^\n]*`FINAL_RETURN`/);
+    const release = commandRoutes(body.slice(pushAt), /\blocks release\b/);
+    expect(release).toHaveLength(1);
+    expect(body.indexOf(release[0]!.block, pushAt)).toBeGreaterThan(
+      pushAt + push.block.length + push.route.length,
+    );
+    expect(push.route).toMatch(/exit 0[^\n]*(?:continue|next|release)/i);
+  });
+
   it("every prompt that runs bkit tests changed routes exit 81 to a re-run of the command", () => {
     const callers = GATE_CALLERS.filter(([, call]) => call.startsWith("--fallback=bkit:gate:"));
     expect(callers).toHaveLength(4);
@@ -239,7 +268,7 @@ describe("bkit-local-gate-audit (#437)", () => {
       { workflow: "bkit-plan.md", sites: 1 },
       { workflow: "bkit-build.md", sites: 2 },
       { workflow: "bkit-debug.md", sites: 5 },
-      { workflow: "bkit-ship.md", sites: 6 },
+      { workflow: "bkit-ship.md", sites: 5 },
     ];
     for (const { workflow, sites } of pushProbes) {
       const body = fs.readFileSync(path.join(WORKFLOWS_DIR, workflow), "utf-8");
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
index ccc7364c9..d09e7abb7 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-build.none.txt
@@ -1043,13 +1043,23 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 0 → `FORCE_BUILD` = true → sub-step 3.
    - **If** exit 1 → `FORCE_BUILD` = false → sub-step 3.
    - **Else** → **Failure Path**.
-3. Re-read the labels, then close the run with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. It then pushes with the HEAD-Subject Assertion and releases the lock. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
+3. Re-read the labels, then close the run once with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. Retain its outputs before the push so a push retry preserves the original final return. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
 
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
+   ```
+
+   Route:
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
+
+   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+
+   Push with the HEAD-Subject Assertion:
+
+   ```bash
    "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit "$?"
-   "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
    ```
 
    Route:
@@ -1057,7 +1067,15 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 0 → continue with the next instruction.
    - **Else** → **Failure Path**.
 
-   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+   Release the workflow lock after the push succeeds:
+
+   ```bash
+   "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
+   ```
+
+   Route:
+   - **If** exit 0 → sub-step 4.
+   - **Else** → **Failure Path**.
 
 4. Create the PR. Its body names `docs/plans/{YYYYMM}/{FID}-plan.md` when the plan exists:
 
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
index 5c0b1ea2b..226f06ba8 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-debug.none.txt
@@ -293,6 +293,7 @@ _No tracker connected, skip step._
    Decide `TEST_VERDICT`:
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown): `{CLAMP_FLAG}` = `--clamp-log=debug-run-tests:{NORMAL_ATTEMPT}` only when `source` = `local`; otherwise empty:
    ```bash
@@ -528,6 +529,10 @@ _No tracker connected, skip step._
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 9 — Push Remediation
 
@@ -555,6 +560,7 @@ _No tracker connected, skip step._
    "{BKIT}" branches push --mode=feature
    ```
 3. Route:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
@@ -609,11 +615,13 @@ _No tracker connected, skip step._
 
    Release and push:
    - **If** `BRANCH` != `dev`:
+
      ```bash
      "{BKIT}" locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
      "{BKIT}" branches push --mode=feature --require-ci
      ```
      Route:
+     - **If** exit 81 → end turn, re-run this block.
      - **If** exit 0 **and** `pushed` = true **and** `sha` non-empty → hold `sha` as `VERIFY_HEAD`.
      - **Else** → **Failure Path** with the missing pushed verification head.
    - **If** `BRANCH` = `dev`:
@@ -622,6 +630,7 @@ _No tracker connected, skip step._
      "{BKIT}" branches push --mode=dev --require-ci --fid={FID}
      ```
      Route:
+     - **If** exit 81 → end turn, re-run this block.
      - **If** exit 0 **and** `skipped` null → hold `sha` as `DEV_SHA` (never the local HEAD); `BRANCH` = `dev` → `{CLOSE_PARENT}` = `{DEV_SHA}`; `DEV_PUSHED` = true.
      - **If** exit 0 **and** `skipped` = `no-run-commits` → narrate `[bkit-debug] dev push: every run commit is already on origin/dev; nothing pushed, no CI run to gate` → `DEV_PUSHED` = false. With a saved CI selection and no held pushed SHA, take **Failure Path** with the missing verification reference.
      - **If** exit 8 (push failed or refused), exit 10 (fetch failed), exit 11 (replay conflict, the conflicting paths printed) or exit 20 (the run's record is gone, nothing pushed) → **Failure Path**.
@@ -645,9 +654,16 @@ _No tracker connected, skip step._
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
 7. **Run only if** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 **or** `BRANCH` = `dev` **or** CI is selected.
    **If** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 → run the CI-Dispatch Gate on the pushed head. It records `{DISPATCH_ROW}`, cross-checks the transport and records the close transport. `{DISPATCH_ROW}` = `--step=debug-close-workflow {LIVE_SKIPPED}` when `{PR_OPEN}` = 1, `--step=debug-create-pr --artifact={PR_URL}` after a created PR. `{LABEL_FLAGS}` as in sub-step 6:
 
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
index c03281cc7..1e3cbe9b4 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
@@ -179,6 +179,7 @@ _No tracker connected, skip step._
    - **If** exit 0 **and** `PR_BASE` != dev → **Failure Path**.
    - **If** exit 0 → sub-step 3.
    - **If** exit 1 → open a PR and set `SHIP_OPENED_PR` = true. **If** `docs/plans/{YYYYMM}/{FID}-plan.md` exists → the block names it in the PR body:
+
      ```bash
      "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
      OPEN_EXIT=0
@@ -186,11 +187,17 @@ _No tracker connected, skip step._
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
@@ -338,6 +345,10 @@ _No tracker connected, skip step._
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 4 — Integrate
 
@@ -465,6 +476,10 @@ _No tracker connected, skip step._
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 8 — Commit + Push Bookkeeping
 
@@ -520,10 +535,18 @@ _No tracker connected, skip step._
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
@@ -665,11 +688,18 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
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
 
diff --git a/.bkit/core/workflows/bkit-build.md b/.bkit/core/workflows/bkit-build.md
index 7ba2d1137..44b0f24ab 100644
--- a/.bkit/core/workflows/bkit-build.md
+++ b/.bkit/core/workflows/bkit-build.md
@@ -1143,7 +1143,7 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 0 → `FORCE_BUILD` = true → sub-step 3.
    - **If** exit 1 → `FORCE_BUILD` = false → sub-step 3.
    - **Else** → **Failure Path**.
-3. Re-read the labels, then close the run with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. It then pushes with the HEAD-Subject Assertion and releases the lock. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
+3. Re-read the labels, then close the run once with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. Retain its outputs before the push so a push retry preserves the original final return. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
    <!-- bkit:tracker true start -->
 
    **Skip if** `ISSUE_ID` empty. Re-read the issue:
@@ -1159,8 +1159,18 @@ This block appends the roadmap row in the worktree only, closes and commits the
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
+   ```
+
+   Route:
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
+
+   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+
+   Push with the HEAD-Subject Assertion:
+
+   ```bash
    "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit "$?"
-   "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
    ```
 
    Route:
@@ -1168,7 +1178,15 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 0 → continue with the next instruction.
    - **Else** → **Failure Path**.
 
-   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+   Release the workflow lock after the push succeeds:
+
+   ```bash
+   "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
+   ```
+
+   Route:
+   - **If** exit 0 → sub-step 4.
+   - **Else** → **Failure Path**.
 
 4. Create the PR. Its body names `docs/plans/{YYYYMM}/{FID}-plan.md` when the plan exists:
 
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index f54c576c3..4686a58f6 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -55,3 +55,5 @@
 {"schema":3,"ts":1793605813975,"kind":"friction","key":"build-724-tracker-auth-and-handover-drift","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-convert"},"references":["docs/plans/202610/logs/724-machine-wide-test/build-plan-check.md"],"category":"tool-failure","scope":"bkit-repo","severity":"HIGH","summary":"Build tracker writes failed and failure record push was blocked","description":"GitHub CLI issue requests returned 401 Bad credentials; GitHub connector writes returned 403 Resource not accessible by integration. Plan check refused TASK 11 with three format problems and one missing reuse inventory row. Failure handover push was rejected by pre-push bkit check: generated .bkit/templates.md drift (2 writes would occur).","status":"OPEN"}
 {"schema":3,"ts":1793610048113,"kind":"friction","key":"owner-pause/build.decision","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"owner-pause"},"category":"human-confirm","scope":"bkit-repo","severity":"LOW","summary":"build paused for the owner at build.decision","description":"The build workflow stopped and asked the owner (`owner-pause` at build.decision).","source":"orchestrator","status":"OPEN","run":{"parentSha":"ff8d9e7f31a912126c2afc5d464e79dda471b56a"},"recurrenceCount":1}
 {"schema":3,"ts":1793666390329,"kind":"friction","key":"build-724-push-probe-plan-scope","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["docs/plans/202610/logs/724-machine-wide-test/build-tests-red-4-2.md","docs/plans/202610/logs/724-machine-wide-test/build-plan-tasks-4-log.md"],"category":"agent-rework","scope":"bkit-repo","severity":"MEDIUM","summary":"Push route guard counted a broader workflow scope than its probes","description":"Task 11 named three workflows while the generated guard counted push fences across five. Thirteen scoped routes passed but the global inventory contained fifteen. Partial task validation entries also used DONE and caused the next brief to omit blocked work.","remediation":"Corrected the plan to cover all five workflows, strengthened the guard through the tests step, recorded new red evidence, implemented the two missing retry routes, and corrected partial log entries to NOTE. Final contract, full gate, argument forwarding and changed-file checks passed.","source":"orchestrator","status":"CLOSED"}
+{"schema":3,"ts":1793675784672,"kind":"friction","key":"build-724-challenge-capacity","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["docs/plans/202610/logs/724-machine-wide-test/build-challenge-1.md","docs/plans/202610/logs/724-machine-wide-test/build-challenge-2.md"],"category":"tool-failure","scope":"bkit-repo","severity":"LOW","summary":"Both challenge agents interrupted by model capacity","description":"The mandatory parallel reviewers returned model-capacity errors after collecting evidence.","remediation":"Resumed the same agents from their existing evidence; both completed reports without repeating the completed review.","source":"orchestrator","status":"CLOSED"}
+{"schema":3,"ts":1793693497981,"kind":"friction","key":"build-724-local-dev-rebase-recovery","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-worktree-setup"},"references":["docs/plans/202610/logs/724-machine-wide-test/build-plan-tests-4-log.md","docs/plans/202610/logs/724-machine-wide-test/build-plan-tasks-6-log.md"],"category":"agent-rework","scope":"bkit-repo","severity":"MEDIUM","summary":"Local dev rebase required source reconciliation and generated-file recovery","description":"The automatic rebase resolver refused a generated template-catalog conflict and restored the branch. Explicit source merges preserved dev progress reporting, branded commands, relocated shell tests and removed ship push path alongside the feature lock behavior. The removed push site made the previous test inventory stale.","remediation":"Completed the requested rebase with source conflicts reviewed, regenerated derived outputs, and repaired the push inventory through the tests step without removing routing assertions. Required post-rebase validation is recorded in the Group 6 code log.","source":"orchestrator","status":"CLOSED"}
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 35041fd0d..f26e9fb28 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -1368,7 +1368,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-annotations`, `bkit-audit-ci-performance`
 - drift:
-  - `bkit-ship:559`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
+  - `bkit-ship:574`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
     - kept: Re-validate probes for an existing run first and dispatches only when the head has none, which happens when the head commit carries `[skip ci]` or GitHub started no run
 
 ```text
@@ -1667,7 +1667,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-ci-performance`
 - drift:
-  - `bkit-ship:559`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
+  - `bkit-ship:574`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
     - kept: Re-validate probes for an existing run first and dispatches only when the head has none, which happens when the head commit carries `[skip ci]` or GitHub started no run
 
 ```text
@@ -9860,7 +9860,7 @@ Open-PR probe ran
 Before creating the PR, probe for an open PR that already exists on `{BRANCH}`:
 Scan the branch for migrations:
 **If** exit 1 → `FORCE_BUILD` = false → sub-step 3.
-[commits] Re-read the labels, then close the run with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. It then pushes with the HEAD-Subject Assertion and releases the lock. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
+[commits] Re-read the labels, then close the run once with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. Retain its outputs before the push so a push retry preserves the original final return. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
 Create the PR. Its body names `docs/plans/{YYYYMM}/{FID}-plan.md` when the plan exists:
 [prs] Call `create_pull_request` with the printed `title`, `body`, `base` and `head`.
 Hold its URL as `PR_URL` and its number as `PR_NUMBER`.
diff --git a/.bkit/templates/scripts/ci/bkit-machine-lock.sh b/.bkit/templates/scripts/ci/bkit-machine-lock.sh
index db451ff05..d24609edd 100644
--- a/.bkit/templates/scripts/ci/bkit-machine-lock.sh
+++ b/.bkit/templates/scripts/ci/bkit-machine-lock.sh
@@ -16,6 +16,8 @@
 # run ["<who>"] [--lock <name>] -- <command> exits with the command's status:
 # 2 usage, 73 the lock could not be taken, 75 the wait gave up.
 # The run name defaults to LOCAL_STACK_LOCK_WHO, npm_lifecycle_event, then run.
+# TERM, INT and HUP defer cancellation until the foreground command ends, keeping
+# its lock held throughout; the wrapper then returns the signal's exit status.
 #
 # Named locks live in ${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/ with no
 # repository prefix. The unnamed stack lock keeps its local-stack-lock/ path and
@@ -367,8 +369,19 @@ if [ "${BASH_SOURCE[0]}" = "$0" ]; then
   shift
   [ "$#" -gt 0 ] || _lsl_run_usage
   take_local_stack_lock "$_lsl_run_who" "$_lsl_run_name" || exit "$_LOCAL_STACK_LOCK_EXIT"
+  _lsl_run_signal_status=0
+  _lsl_run_cancel() {
+    _lsl_run_signal_status="$1"
+    echo "[machine-lock] cancellation requested; waiting for $_lsl_run_who to finish before releasing its lock" >&2
+  }
+  # Bash runs these traps after its foreground command ends. Keeping this owner
+  # alive also keeps the Perl holder alive while that command finishes naturally.
+  trap '_lsl_run_cancel 143' TERM
+  trap '_lsl_run_cancel 130' INT
+  trap '_lsl_run_cancel 129' HUP
   "$@"
   _lsl_run_status=$?
   release_local_stack_lock "$_lsl_run_name"
+  [ "$_lsl_run_signal_status" -eq 0 ] || _lsl_run_status="$_lsl_run_signal_status"
   exit "$_lsl_run_status"
 fi
diff --git a/.bkit/version b/.bkit/version
index 91a2d1990..48818776b 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -3,8 +3,8 @@
   "canonicalHashes": {
     ".cursor/mcp.json": "355e01cadabed3b924ebe339dc07ecbf7179397ebc9accf8618d5d7d6af6c438",
     "docs/deployments.md": "9d8f5d1ee8b76a6c60b4909c50ac8987ff5f3b65714b1e144955347dc53101aa",
-    "docs/testing.md": "e6c06c455de0d5b982909e6205a530dc26e0cc9be933d30cda99e1ce6c4be58f",
-    ".claude/settings.json": "f6c41bd5f3d1f6a10d456543c0653a82c9432bd6f3a6a8aa1b3e9a78eb72a3b7",
+    "docs/testing.md": "7020847b65fd85a4fcf50470276d37dbdc16948b592e80d43899f3f12609216c",
+    ".claude/settings.json": "34cfc63ef7bfb248ce3f27116ad3f6f89fd75678c599d2cd8e702c43f6958587",
     ".agents/context.md": "5cf54b91ffaa5d9372415a24dd1acfe0910c7def1f4434e25ccf110e3eaed013",
     ".agents/docs.md": "bfbddbf98bc4238c6a01dbd68fbe515ba01db2371c440d868fe12a8db6c96df0",
     ".agents/skills.md": "71dc53bcab370fbe1aacc3239edc3395e3cf9ff9f507c9cda49669846cf7f14b",
@@ -18,17 +18,17 @@
     ".gitignore": "d4b034fa3719fd2418ada1eb01c4b396f84c5539cc245f41394144d4ec84fe8f",
     "docs/security.md": "ce74a14213141c8508d6325d5677bbde0e5a297730f1c5906f86b89ef2c5d2c0",
     ".mcp.json": "65b29f1bb28dd6296d1dc8ea34aca4826d9ca072d7cef9d2971a7045280505d9",
-    "docs/architecture.md": "68e8af0663da9df6a449e941d0a2330cdb24d5038e75dd10dd6aeb575f9cc6c2",
+    "docs/architecture.md": "2a4db58b4315264d77535395fe5582aa2e8ed057dc0d4c2e1e199ecdae5928d5",
     "docs/technology.md": "0ff07c1230f2eaf729cb7dbedf1f4cf3b28ba9db89e72736f929759a14ee9cf7",
     ".bkit/.env.example": "3eae6dd3d96a33aed1745fc6b069000ae7272fbdab99617250015e9c233e6200",
     ".opencode/opencode.json": "06b3702dcb8968463c164b36fbc340428591f6601420cb48e95371db1d1ac958",
     "docs/design.md": "05d888d6188c44f518bd1d10b4c01ae6af373a6ce79da72fbaf10d5d45154e15",
     ".claude/commands/bkit-auto.md": "2d0b48c8b971226a64425527666d293dcffa041030bf8b090e7a4ed312379399",
     ".claude/commands/bkit-build.md": "d475c99bf4cf710ac6c2520cfa816277a3c062f0e9767ed78cdf5976b142ffcf",
-    ".claude/commands/bkit-debug.md": "1b5d31f51e86e5bb2dbbea3dd38bb116f39d9ee58dd7803b52ded664cae2e3e7",
+    ".claude/commands/bkit-debug.md": "886d21cb89932c49205739da0929de58e40209335496a5b0bc340900e5f1dc28",
     ".claude/commands/bkit-design.md": "88a3965d1f3141b4047a55876fabbadecd08b3c092d35668de877f067d9b5f33",
     ".claude/commands/bkit-plan.md": "cac19973994dbcca98c9cdb5d4a10375de8754df1faaa3ab8328d63cccce9a07",
-    ".claude/commands/bkit-ship.md": "b7b99f806558a8a49bf91d460bb653fdfdd1c8f4cf33bd3c86f2b33d28966d7d",
+    ".claude/commands/bkit-ship.md": "ec6d275248e2ef96ac9ea7f1cce8d63bdec3a4b0a242c5a04eaf1bea4932b868",
     ".claude/agents/bkit-build-challenge-1.md": "cdd3c2ac8dff17591adacf9cccae4162fa5b8d1fdb02f409e50acff40f8826f3",
     ".claude/agents/bkit-build-challenge-2.md": "05bd003c57e9d176ab68484d0356f730db95fb7d62536cbe2bc995c1524c349b",
     ".claude/agents/bkit-build-install-skills.md": "6e933518e6be37d8a384b9592293b47c8683247e6e96cda82e6c0bfff1fd641b",
@@ -57,10 +57,10 @@
     ".claude/agents/bkit-utility-update-documentation.md": "0b3d4145acaf8ce46ace5328fe2e13f904d3c8aba8823aa1c2bff6a4cc5f7d3e",
     ".cursor/commands/bkit-auto.md": "81218612a827260ad5b64acbf17507ae028cef4baf4c7a98c297879b44e979b3",
     ".cursor/commands/bkit-build.md": "61c7eb0b01ce2f5be37b7f97c10bd1f66aec745829d26d43472d68494c54cf22",
-    ".cursor/commands/bkit-debug.md": "88dab2bcca38a3c71aecf1354313cc2c937ad80aa2773ec667123b2cca35fdce",
+    ".cursor/commands/bkit-debug.md": "d748cb9cb4e7964b5d427e355dc195c2fde17209252ff9c2092ff9f88f8e5537",
     ".cursor/commands/bkit-design.md": "b1929be4714b2670846242d6d0bc348e745d5600bf759aa003efeb378819215f",
     ".cursor/commands/bkit-plan.md": "21406a5901fa30bc8c5fac7d4f7d32d3065233dc9682335ec0a310f48baaabff",
-    ".cursor/commands/bkit-ship.md": "408061707d40af99eebb6b880c26b08a06ec4b2818bdb5ffcf7cd5f8f50795b7",
+    ".cursor/commands/bkit-ship.md": "4fb61b913817d0558ef0e4e346166978a083a36930f2198472dfa4372ea78823",
     ".cursor/agents/bkit-build-challenge-1.md": "093141086374b85fd0fc944cafb575ec60a80df88fed1e471ac18640bc5cbe61",
     ".cursor/agents/bkit-build-challenge-2.md": "b4998b1d36bff4fc827cbd8310650fe9c4f2f9647685e243bca33984ddde9ef6",
     ".cursor/agents/bkit-build-install-skills.md": "b1a9b1ebb7272c08186f150fee495808bec6a2c98dd840724bf2e92ad3df5dd9",
@@ -115,10 +115,10 @@
     ".opencode/agents/bkit-utility-update-documentation.md": "e494bd347aa52ca97786a094d9083721ad264070f1e3a0c90efeac23789dcc2a",
     ".opencode/commands/bkit-auto.md": "5c9a6cc5f49a2e07602a3d440a6b901782e45f71290e60c0baa1416fb1302625",
     ".opencode/commands/bkit-build.md": "624e9ef674c0ebb60d693e247b70d08d11b8432ebdb9782b40594052bfbbaeb5",
-    ".opencode/commands/bkit-debug.md": "495e9ceafe4aa182fe3ab442882c744e146beff4642afe88d13fc5f2e5ce271c",
+    ".opencode/commands/bkit-debug.md": "30f87176cba726b3a913f97b33b6e1fd853bc501b03f15be774b3209f56c3291",
     ".opencode/commands/bkit-design.md": "7d6969574ed23ca8ec76f4b060eedc0ef050e3fb68242b89e63427d4fb47dab8",
     ".opencode/commands/bkit-plan.md": "61114ab1751ffa67bfe5ab1e45eba562489b4cf71e3f63dd96747ab484b4b3e9",
-    ".opencode/commands/bkit-ship.md": "d50b5d10baf53464c542ba0744a140560edb1b2285c01e06f31dcac12b17ae4d",
+    ".opencode/commands/bkit-ship.md": "2926d528bd796e45024ba9c63566a23e73a0210f51623afa707824588e05b5de",
     ".claude/agents/bkit-design-spike.md": "179985ceaeac1d1105321e1b44774830372e715fab2d2bff3eeb306d2b87506a",
     ".cursor/agents/bkit-design-spike.md": "748e208e6debd4ef6253bcbe775c153a004940fbc710a85c1df1ea07bffedd74",
     ".opencode/agents/bkit-design-spike.md": "a57d8e46156607813cb72addbb58b38cf5b5e73fbc9f4b37d833abd84d2e347d",
@@ -192,7 +192,7 @@
     "docs/templates/bkit-audit-security.md": "cf8b47d59a345fa8548a54e2bc7d1e211b762d94f85975044dedd9e1af3c8700",
     "docs/templates/bkit-audit-slop.md": "ed2f455d8d15f5324127a91f15958838589110098265fc58e7c6b4b2751316b5",
     "docs/templates/bkit-audit-usability.md": "4beca4d9e7c6e9599a41c99f15a97668c13ebb315f44c7cd1ed6a417c61d4b80",
-    "docs/templates/bkit-audit-testing.md": "fde830065e3de67daf7040a407da5ccba2b2a198721820622bc1953fc9ad3b10",
+    "docs/templates/bkit-audit-testing.md": "0609f4d728a7e73b21f356c6bb8d7bba2e415b487c4540125fc99ebb1dc7f2a3",
     ".opencode/agents/bkit-utility-update-roadmap.md": "ac6954d757cd5b17c83aa70c6a75450e42416b86035a2224dba5b5cdb06972a9",
     ".codex/agents/bkit-utility-update-roadmap.toml": "97bd0914205aa56e0bf99f3b5358dc50fae4f16164b37419a680837e3afe9e88",
     "docs/templates/bkit-audit-aio-seo.md": "e4c534912e661050887d5a1d1adf31798710a95bc27ecd27aa842a69e07c981c",
@@ -224,7 +224,7 @@
     ".bkit/providers.md": "79d0a075497d133abc844f2210a42e131b9125307778c8e8cc1fe3113777dcf1",
     ".bkit/prompts.md": "37264af5eae0c1d8f7371ef4599a0420a2bf6a3974c8d5a2dbdcda9cd6d0abba",
     ".bkit/trackers.md": "3a3b60d2de7e69a8a59a7567159457afa6c5787a1f066b1399f6ed7499b49d96",
-    ".bkit/workflows.md": "de8d50aea98b672457455c6b1c2d88c94581fd41a767c5595bfc66b775086812",
+    ".bkit/workflows.md": "f9f4c6a3bb3af80018896f7e1cc139fedc7b5304ee145969454c442d8581cb15",
     ".bkit/README.md": "1037df0251190241d83d900a9e3e5e2bf8e6dbfd3d9cb7d5f7948a73ab9732a4",
     ".cursor/rules/bkit-rules.mdc": "164c1bc7aed517d5eca01abac2f0c0e87a1102ceb1700eae02e340ef6f9ce797",
     ".claude/hooks/bkit-gateguard.cjs": "e13200a179c654f32e2a91f79be766c1755dd814d7d025bffd707ba6e91b965e",
@@ -264,7 +264,7 @@
     ".codex/hooks/bkit-rules.cjs": "37b3c590ada277b78a246908dadddbb31c64798ca5d300e57b193e314620da67",
     ".opencode/plugin/bkit-rules.js": "6769eacc40fc2856faa9265c5665d5e4426b23c21e3df1e4f177ed6422221824",
     ".bkit/router.md": "86d116ff31947df4b7f52b76b3e3928bc3ac5bfad54ddf7c4a9ae53d2b0cf18a",
-    ".bkit/cli.md": "d01ee6dfb411dfab3a8dc9d7c89f971d1c6b036ade8d963cd5766eaf2a752864",
+    ".bkit/cli.md": "818143c7bc3aa8a758d5a243da2df8da5721d6d770aba038db809bea523bde6b",
     ".claude/agents/bkit-build-plan-tests.md": "eda75f0bbc0c1ddc3e69a2cdaef8c3b00a8fff7153b968eb7db24ae5dd98b58f",
     ".cursor/agents/bkit-build-plan-tests.md": "50a613fa58a0c00db0c3f79f5e908c955515234b5ec0676c1348a3bfe188b37a",
     ".opencode/agents/bkit-build-plan-tests.md": "9e654f6a332ec5659059158a0dee0853e487a4bd55f9063c86e82aa5791a03ee",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 4c49b2ea6..812365d63 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -91,6 +91,8 @@ Rendering can be re-run: the source carries every wired variant, so a tracker sw
 **Rationale for the workflow files** (kept here, not in them, per `.bkit/authoring.md` § Prompts and Workflows):
 
 - **Sandbox recovery precedes failure routing:** A host permission denial can be resolved through its permitted approval mechanism. A successful retry with verified outputs resumes the interrupted sub-step, including startup writes under `.git`; it does not trigger failure bookkeeping. Pending approval pauses that operation. Denied or unavailable approval, a failed retry without another explicit route, and command logic, test or gate failures retain their failure routes.
+- **Tests-lock wait:** `bkit tests run` and `bkit branches push` exit 81 when the machine-wide tests lock stays held past the host's wait budget (`--lock-wait-s` for `tests run`; `BKIT_LOCK_WAIT_S` for both commands). Design, plan, build, debug and ship end the turn and re-run every test or push block on 81, and a subagent handed a group gate command runs the same command again. There is no re-run ceiling. A holder held past three times the last run duration its line names is stale: report its pid, since time and last run duration instead of re-running.
+
 - **`bkit branches push` leases a personal branch:** Step 2's rebase onto `origin/dev` rewrites SHAs, so a plain push is non-fast-forward. `--mode=feature` / `--mode=abort` push with `--force-with-lease`. `dev` / `main` push plain and are never forced. Each call makes exactly one `git push`. This mirrors `rules.md` § Force push.
 - **`BKIT_VER` reads `pinnedVersion`, not `version`:** the fallback is `[ -z … ] &&`, not a piped one. A pipeline's status is the last command's, so a `| tr … || echo` fallback never fires when the grep fails.
 - **`deferrals` / `failures` on the `outcome` row are a cumulative count of distinct `key`s, not of lines:** a row is updated by appending a line with the same `key` (§ Updating a Row in `.bkit/jsonl.md`), so `wc -l` double-counts closed deferrals. Readers derive one cycle's count from the change against the prior outcome row (`newFailuresThisRun` in `.bkit/core/engine/commands/analysis.ts`).
@@ -285,7 +287,7 @@ Rationale: keeping per-run state on `feat/{FID}` removes the divergence between
 | `session` | `{type, workflow, at, platform, session}` | The chat running the run: `bkit workflows start` (resume too) writes it when the chat differs from the run's last `session` row; `session` = `fp:` + 12 hex of sha256(`<platform>:<chat id>`). The close reads subagent context from every chat named; the harvest matches chats to runs by it. Claude Code only. Step minutes skip it. |
 | `owner-pause` | `{type, workflow, at, reason}` | The workflow ends its turn to wait for the owner: `reason` `decision` (build Decision Pause), `grill` / `draft` (design), `loop` (debug fix or soak question), `assumed` / `merge` (ship Confirm Assumed Items, merge fix round). Written by `bkit status row` before the turn ends. Step minutes skip it. |
 | `owner-answer` | `{type, workflow, at}` | The owner's reply to an `owner-pause`, written before anything else. The harvest times each stop from pause to answer (run `owner`). Step minutes skip it. |
-| `test-run` | `{type, workflow, at, step, attempt?, run, verdict, exitCode, failures, scope, log, artifact?}` | One `bkit tests run --file=` gate run, pass or fail, written just before the step's own row: `run` counts that step's `test-run` rows in the active run (1 first), `verdict` `PASS\|FAIL`, null when the gate could not run. Not folded, never a step's finish row. Step minutes skip it. |
+| `test-run` | `{type, workflow, at, step, attempt?, run, verdict, exitCode, failures, scope, log, artifact?}` | One `bkit tests run --file=` gate run, pass or fail, written just before the step's own row: `run` counts that step's `test-run` rows in the active run (1 first), `verdict` `PASS\|FAIL`, null when the gate could not run. A tests-lock wait (exit 81) writes no row. Not folded, never a step's finish row. Step minutes skip it. |
 | `engine-call` | `{type, workflow, at, noun, verb, flags}` | One bkit command dispatched while the run is active: `noun` + `verb` and the flag names (never values). Records the attempt at dispatch entry, not its success. A command git launched (a hook, seen by `GIT_EXEC_PATH` in its environment) writes none, so a hook never leaves the tracked status file dirty after a commit. A command run while the run's repo has a rebase paused writes none either, because `git rebase --continue` refuses a tracked file with an unstaged change. Not folded; step minutes skip it. |
 | `completeness` | `{type, workflow, at, verdict, preJournal, journalSuspect, observed, evidenceHoles, stepHoles, unexercised, unexpected, unattributable, sourceSha}` | The run's completeness verdict, appended at close. `verdict` `CLEAN\|HOLEY` (evidence + step holes only); `preJournal` = the run has no `engine-call` rows (steps-only); `journalSuspect` = closing engine journals but recorded none. A run that closes twice carries one per close; the read path takes the last. Not folded; step minutes skip it. |
 | `ship-gate-refusal` | `{type, workflow, at, exitCode, head}` | One `bkit runs gate` refusal at Step 10, with the gate's exit code and the head it asserted against. Not folded. |
diff --git a/.claude/commands/bkit-build.md b/.claude/commands/bkit-build.md
index 21566106a..5121256da 100644
--- a/.claude/commands/bkit-build.md
+++ b/.claude/commands/bkit-build.md
@@ -1097,7 +1097,7 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 0 → `FORCE_BUILD` = true → sub-step 3.
    - **If** exit 1 → `FORCE_BUILD` = false → sub-step 3.
    - **Else** → **Failure Path**.
-3. Re-read the labels, then close the run with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. It then pushes with the HEAD-Subject Assertion and releases the lock. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
+3. Re-read the labels, then close the run once with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. Retain its outputs before the push so a push retry preserves the original final return. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
    
    **Skip if** `ISSUE_ID` empty. Re-read the issue:
 
@@ -1111,8 +1111,18 @@ This block appends the roadmap row in the worktree only, closes and commits the
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
+   ```
+
+   Route:
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
+
+   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+
+   Push with the HEAD-Subject Assertion:
+
+   ```bash
    "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit "$?"
-   "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
    ```
 
    Route:
@@ -1120,7 +1130,15 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 0 → continue with the next instruction.
    - **Else** → **Failure Path**.
 
-   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+   Release the workflow lock after the push succeeds:
+
+   ```bash
+   "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
+   ```
+
+   Route:
+   - **If** exit 0 → sub-step 4.
+   - **Else** → **Failure Path**.
 
 4. Create the PR. Its body names `docs/plans/{YYYYMM}/{FID}-plan.md` when the plan exists:
 
diff --git a/.claude/commands/bkit-debug.md b/.claude/commands/bkit-debug.md
index bf4c6ad67..995498da3 100644
--- a/.claude/commands/bkit-debug.md
+++ b/.claude/commands/bkit-debug.md
@@ -327,6 +327,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    Decide `TEST_VERDICT`:
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown): `{CLAMP_FLAG}` = `--clamp-log=debug-run-tests:{NORMAL_ATTEMPT}` only when `source` = `local`; otherwise empty:
    ```bash
@@ -570,6 +571,10 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 9 — Push Remediation
 
@@ -597,6 +602,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
    "{BKIT}" branches push --mode=feature
    ```
 3. Route:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
@@ -660,11 +666,13 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
 
    Release and push:
    - **If** `BRANCH` != `dev`:
+
      ```bash
      "{BKIT}" locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
      "{BKIT}" branches push --mode=feature --require-ci
      ```
      Route:
+     - **If** exit 81 → end turn, re-run this block.
      - **If** exit 0 **and** `pushed` = true **and** `sha` non-empty → hold `sha` as `VERIFY_HEAD`.
      - **Else** → **Failure Path** with the missing pushed verification head.
    - **If** `BRANCH` = `dev`:
@@ -673,6 +681,7 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
      "{BKIT}" branches push --mode=dev --require-ci --fid={FID}
      ```
      Route:
+     - **If** exit 81 → end turn, re-run this block.
      - **If** exit 0 **and** `skipped` null → hold `sha` as `DEV_SHA` (never the local HEAD); `BRANCH` = `dev` → `{CLOSE_PARENT}` = `{DEV_SHA}`; `DEV_PUSHED` = true.
      - **If** exit 0 **and** `skipped` = `no-run-commits` → narrate `[bkit-debug] dev push: every run commit is already on origin/dev; nothing pushed, no CI run to gate` → `DEV_PUSHED` = false. With a saved CI selection and no held pushed SHA, take **Failure Path** with the missing verification reference.
      - **If** exit 8 (push failed or refused), exit 10 (fetch failed), exit 11 (replay conflict, the conflicting paths printed) or exit 20 (the run's record is gone, nothing pushed) → **Failure Path**.
@@ -696,9 +705,16 @@ description: "Debug Feature — Autonomous diagnosis and remediation"
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
 7. **Run only if** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 **or** `BRANCH` = `dev` **or** CI is selected.
    **If** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 → run the CI-Dispatch Gate on the pushed head. It records `{DISPATCH_ROW}`, cross-checks the transport and records the close transport. `{DISPATCH_ROW}` = `--step=debug-close-workflow {LIVE_SKIPPED}` when `{PR_OPEN}` = 1, `--step=debug-create-pr --artifact={PR_URL}` after a created PR. `{LABEL_FLAGS}` as in sub-step 6:
 
diff --git a/.claude/commands/bkit-ship.md b/.claude/commands/bkit-ship.md
index 03c398ddb..492037076 100644
--- a/.claude/commands/bkit-ship.md
+++ b/.claude/commands/bkit-ship.md
@@ -214,6 +214,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **If** exit 0 **and** `PR_BASE` != dev → **Failure Path**.
    - **If** exit 0 → sub-step 3.
    - **If** exit 1 → open a PR and set `SHIP_OPENED_PR` = true. **If** `docs/plans/{YYYYMM}/{FID}-plan.md` exists → the block names it in the PR body:
+
      ```bash
      "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
      OPEN_EXIT=0
@@ -221,11 +222,17 @@ description: "Ship Feature — Autonomous merge and archive"
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
@@ -373,6 +380,10 @@ description: "Ship Feature — Autonomous merge and archive"
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 4 — Integrate
 
@@ -500,6 +511,10 @@ description: "Ship Feature — Autonomous merge and archive"
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 8 — Commit + Push Bookkeeping
 
@@ -555,10 +570,18 @@ description: "Ship Feature — Autonomous merge and archive"
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
@@ -705,11 +728,18 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
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
 
diff --git a/.cursor/commands/bkit-build.md b/.cursor/commands/bkit-build.md
index 070e01c2a..5cb82b093 100644
--- a/.cursor/commands/bkit-build.md
+++ b/.cursor/commands/bkit-build.md
@@ -1096,7 +1096,7 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 0 → `FORCE_BUILD` = true → sub-step 3.
    - **If** exit 1 → `FORCE_BUILD` = false → sub-step 3.
    - **Else** → **Failure Path**.
-3. Re-read the labels, then close the run with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. It then pushes with the HEAD-Subject Assertion and releases the lock. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
+3. Re-read the labels, then close the run once with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. Retain its outputs before the push so a push retry preserves the original final return. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
    
    **Skip if** `ISSUE_ID` empty. Re-read the issue:
 
@@ -1110,8 +1110,18 @@ This block appends the roadmap row in the worktree only, closes and commits the
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
+   ```
+
+   Route:
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
+
+   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+
+   Push with the HEAD-Subject Assertion:
+
+   ```bash
    "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit "$?"
-   "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
    ```
 
    Route:
@@ -1119,7 +1129,15 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 0 → continue with the next instruction.
    - **Else** → **Failure Path**.
 
-   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+   Release the workflow lock after the push succeeds:
+
+   ```bash
+   "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
+   ```
+
+   Route:
+   - **If** exit 0 → sub-step 4.
+   - **Else** → **Failure Path**.
 
 4. Create the PR. Its body names `docs/plans/{YYYYMM}/{FID}-plan.md` when the plan exists:
 
diff --git a/.cursor/commands/bkit-debug.md b/.cursor/commands/bkit-debug.md
index 14bb8c32b..7e604b253 100644
--- a/.cursor/commands/bkit-debug.md
+++ b/.cursor/commands/bkit-debug.md
@@ -326,6 +326,7 @@ Debug Feature — Autonomous diagnosis and remediation
    Decide `TEST_VERDICT`:
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown): `{CLAMP_FLAG}` = `--clamp-log=debug-run-tests:{NORMAL_ATTEMPT}` only when `source` = `local`; otherwise empty:
    ```bash
@@ -569,6 +570,10 @@ Debug Feature — Autonomous diagnosis and remediation
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 9 — Push Remediation
 
@@ -596,6 +601,7 @@ Debug Feature — Autonomous diagnosis and remediation
    "{BKIT}" branches push --mode=feature
    ```
 3. Route:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
@@ -659,11 +665,13 @@ Debug Feature — Autonomous diagnosis and remediation
 
    Release and push:
    - **If** `BRANCH` != `dev`:
+
      ```bash
      "{BKIT}" locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
      "{BKIT}" branches push --mode=feature --require-ci
      ```
      Route:
+     - **If** exit 81 → end turn, re-run this block.
      - **If** exit 0 **and** `pushed` = true **and** `sha` non-empty → hold `sha` as `VERIFY_HEAD`.
      - **Else** → **Failure Path** with the missing pushed verification head.
    - **If** `BRANCH` = `dev`:
@@ -672,6 +680,7 @@ Debug Feature — Autonomous diagnosis and remediation
      "{BKIT}" branches push --mode=dev --require-ci --fid={FID}
      ```
      Route:
+     - **If** exit 81 → end turn, re-run this block.
      - **If** exit 0 **and** `skipped` null → hold `sha` as `DEV_SHA` (never the local HEAD); `BRANCH` = `dev` → `{CLOSE_PARENT}` = `{DEV_SHA}`; `DEV_PUSHED` = true.
      - **If** exit 0 **and** `skipped` = `no-run-commits` → narrate `[bkit-debug] dev push: every run commit is already on origin/dev; nothing pushed, no CI run to gate` → `DEV_PUSHED` = false. With a saved CI selection and no held pushed SHA, take **Failure Path** with the missing verification reference.
      - **If** exit 8 (push failed or refused), exit 10 (fetch failed), exit 11 (replay conflict, the conflicting paths printed) or exit 20 (the run's record is gone, nothing pushed) → **Failure Path**.
@@ -695,9 +704,16 @@ Debug Feature — Autonomous diagnosis and remediation
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
 7. **Run only if** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 **or** `BRANCH` = `dev` **or** CI is selected.
    **If** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 → run the CI-Dispatch Gate on the pushed head. It records `{DISPATCH_ROW}`, cross-checks the transport and records the close transport. `{DISPATCH_ROW}` = `--step=debug-close-workflow {LIVE_SKIPPED}` when `{PR_OPEN}` = 1, `--step=debug-create-pr --artifact={PR_URL}` after a created PR. `{LABEL_FLAGS}` as in sub-step 6:
 
diff --git a/.cursor/commands/bkit-ship.md b/.cursor/commands/bkit-ship.md
index 5ee0987de..60297aee3 100644
--- a/.cursor/commands/bkit-ship.md
+++ b/.cursor/commands/bkit-ship.md
@@ -213,6 +213,7 @@ Ship Feature — Autonomous merge and archive
    - **If** exit 0 **and** `PR_BASE` != dev → **Failure Path**.
    - **If** exit 0 → sub-step 3.
    - **If** exit 1 → open a PR and set `SHIP_OPENED_PR` = true. **If** `docs/plans/{YYYYMM}/{FID}-plan.md` exists → the block names it in the PR body:
+
      ```bash
      "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
      OPEN_EXIT=0
@@ -220,11 +221,17 @@ Ship Feature — Autonomous merge and archive
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
@@ -372,6 +379,10 @@ Ship Feature — Autonomous merge and archive
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 4 — Integrate
 
@@ -499,6 +510,10 @@ Ship Feature — Autonomous merge and archive
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 8 — Commit + Push Bookkeeping
 
@@ -554,10 +569,18 @@ Ship Feature — Autonomous merge and archive
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
@@ -704,11 +727,18 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
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
 
diff --git a/.opencode/commands/bkit-build.md b/.opencode/commands/bkit-build.md
index f461ed2a5..545b53887 100644
--- a/.opencode/commands/bkit-build.md
+++ b/.opencode/commands/bkit-build.md
@@ -1100,7 +1100,7 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 0 → `FORCE_BUILD` = true → sub-step 3.
    - **If** exit 1 → `FORCE_BUILD` = false → sub-step 3.
    - **Else** → **Failure Path**.
-3. Re-read the labels, then close the run with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. It then pushes with the HEAD-Subject Assertion and releases the lock. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
+3. Re-read the labels, then close the run once with the block below. The block mirrors the roadmap row to `dev`, closes the run (telemetry, report, artifact links) and commits it. Its commit subject carries ` bkit [auto route]` when the re-read labels hold `bkit:auto`. Retain its outputs before the push so a push retry preserves the original final return. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, and empty when no tracker is wired:
    
    **Skip if** `ISSUE_ID` empty. Re-read the issue:
 
@@ -1114,8 +1114,18 @@ This block appends the roadmap row in the worktree only, closes and commits the
    ```bash
    "{BKIT}" roadmap mirror --workflow=build --fid={FID} >/dev/null || exit 1
    "{BKIT}" workflows close --workflow=build --fid={FID} --month={YYYYMM} --owner-repo={OWNER_REPO} --outbox="{OUTBOX}" --message="chore({FID}): close-workflow" {LABEL_FLAGS} --number=16 --post --title="Close Workflow & Create PR" --tree={BRANCH} --final-return --summary-file="docs/plans/{YYYYMM}/logs/{FID}/build-summary.md" --session-dir="{SESSION_DIR}" --line="CI not awaited here — /bkit-ship gates on its result; red → /bkit-debug." || exit 1
+   ```
+
+   Route:
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
+
+   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+
+   Push with the HEAD-Subject Assertion:
+
+   ```bash
    "{BKIT}" branches push --mode=feature --require-ci >/dev/null || exit "$?"
-   "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
    ```
 
    Route:
@@ -1123,7 +1133,15 @@ This block appends the roadmap row in the worktree only, closes and commits the
    - **If** exit 0 → continue with the next instruction.
    - **Else** → **Failure Path**.
 
-   Hold the close's `commentFile` as `CLOSE_COMMENT_FILE`, `tracker` as `CLOSE_TRACKER`, `finalReturn` as `FINAL_RETURN`.
+   Release the workflow lock after the push succeeds:
+
+   ```bash
+   "{BKIT}" locks release --kind=workflow --workflow=build --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null
+   ```
+
+   Route:
+   - **If** exit 0 → sub-step 4.
+   - **Else** → **Failure Path**.
 
 4. Create the PR. Its body names `docs/plans/{YYYYMM}/{FID}-plan.md` when the plan exists:
 
diff --git a/.opencode/commands/bkit-debug.md b/.opencode/commands/bkit-debug.md
index f627304e4..c793cb05b 100644
--- a/.opencode/commands/bkit-debug.md
+++ b/.opencode/commands/bkit-debug.md
@@ -330,6 +330,7 @@ $ARGUMENTS
    Decide `TEST_VERDICT`:
    - **If** exit 0 → `TEST_VERDICT` = PASS.
    - **If** exit 1 → `TEST_VERDICT` = FAIL.
+   - **If** exit 81 → end turn, re-run this block.
    - **Else** → **Failure Path**.
 2. Finish, with no commit. `{FAILURES_FLAG}` = `--failures={TEST_FAILURES}`, empty when `TEST_FAILURES` = null (count unknown): `{CLAMP_FLAG}` = `--clamp-log=debug-run-tests:{NORMAL_ATTEMPT}` only when `source` = `local`; otherwise empty:
    ```bash
@@ -573,6 +574,10 @@ $ARGUMENTS
    ```bash
    "{BKIT}" branches push --mode=feature
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 9 — Push Remediation
 
@@ -600,6 +605,7 @@ $ARGUMENTS
    "{BKIT}" branches push --mode=feature
    ```
 3. Route:
+   - **If** exit 81 → end turn, re-run this block.
    - **If** `SUMMARY_VERDICT` = PASS **or** CONCERNS → Step 11.
    - **Else** → **Failure Path**.
 
@@ -663,11 +669,13 @@ $ARGUMENTS
 
    Release and push:
    - **If** `BRANCH` != `dev`:
+
      ```bash
      "{BKIT}" locks release --kind=workflow --workflow=debug --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} >/dev/null || exit 1
      "{BKIT}" branches push --mode=feature --require-ci
      ```
      Route:
+     - **If** exit 81 → end turn, re-run this block.
      - **If** exit 0 **and** `pushed` = true **and** `sha` non-empty → hold `sha` as `VERIFY_HEAD`.
      - **Else** → **Failure Path** with the missing pushed verification head.
    - **If** `BRANCH` = `dev`:
@@ -676,6 +684,7 @@ $ARGUMENTS
      "{BKIT}" branches push --mode=dev --require-ci --fid={FID}
      ```
      Route:
+     - **If** exit 81 → end turn, re-run this block.
      - **If** exit 0 **and** `skipped` null → hold `sha` as `DEV_SHA` (never the local HEAD); `BRANCH` = `dev` → `{CLOSE_PARENT}` = `{DEV_SHA}`; `DEV_PUSHED` = true.
      - **If** exit 0 **and** `skipped` = `no-run-commits` → narrate `[bkit-debug] dev push: every run commit is already on origin/dev; nothing pushed, no CI run to gate` → `DEV_PUSHED` = false. With a saved CI selection and no held pushed SHA, take **Failure Path** with the missing verification reference.
      - **If** exit 8 (push failed or refused), exit 10 (fetch failed), exit 11 (replay conflict, the conflicting paths printed) or exit 20 (the run's record is gone, nothing pushed) → **Failure Path**.
@@ -699,9 +708,16 @@ $ARGUMENTS
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
 7. **Run only if** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 **or** `BRANCH` = `dev` **or** CI is selected.
    **If** `{PR_OPEN}` = 1 **or** `TRIGGER_PR` = 1 → run the CI-Dispatch Gate on the pushed head. It records `{DISPATCH_ROW}`, cross-checks the transport and records the close transport. `{DISPATCH_ROW}` = `--step=debug-close-workflow {LIVE_SKIPPED}` when `{PR_OPEN}` = 1, `--step=debug-create-pr --artifact={PR_URL}` after a created PR. `{LABEL_FLAGS}` as in sub-step 6:
 
diff --git a/.opencode/commands/bkit-ship.md b/.opencode/commands/bkit-ship.md
index c509f9253..de8e0606f 100644
--- a/.opencode/commands/bkit-ship.md
+++ b/.opencode/commands/bkit-ship.md
@@ -217,6 +217,7 @@ $ARGUMENTS
    - **If** exit 0 **and** `PR_BASE` != dev → **Failure Path**.
    - **If** exit 0 → sub-step 3.
    - **If** exit 1 → open a PR and set `SHIP_OPENED_PR` = true. **If** `docs/plans/{YYYYMM}/{FID}-plan.md` exists → the block names it in the PR body:
+
      ```bash
      "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null || exit $?
      OPEN_EXIT=0
@@ -224,11 +225,17 @@ $ARGUMENTS
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
@@ -376,6 +383,10 @@ $ARGUMENTS
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 4 — Integrate
 
@@ -503,6 +514,10 @@ $ARGUMENTS
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+   Route:
+   - **If** exit 81 → end turn, re-run this block.
+   - **If** exit 0 → continue with the next instruction.
+   - **Else** → **Failure Path**.
 
 ### 🔒 Gate 8 — Commit + Push Bookkeeping
 
@@ -558,10 +573,18 @@ $ARGUMENTS
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
@@ -708,11 +731,18 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
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
 
diff --git a/README.md b/README.md
index d92ad2dd5..f66b64845 100644
--- a/README.md
+++ b/README.md
@@ -358,7 +358,7 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>251 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1670 symbols · 49 files"]
+    n_bkit_core_engine_commands["commands<br/>1673 symbols · 49 files"]
     n_bkit_core_engine_install["install<br/>307 symbols · 20 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>184 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>62 symbols · 4 files"]
diff --git a/dist/commands/workflow/runs.js b/dist/commands/workflow/runs.js
index 46efbaa47..2cf36dfc2 100644
--- a/dist/commands/workflow/runs.js
+++ b/dist/commands/workflow/runs.js
@@ -23,7 +23,7 @@ import * as fs from "node:fs";
 import * as path from "node:path";
 import { readJsonFile } from "../../shared/json.js";
 import { CI_TIERS, lastRun, statusTimestamp, validateCiSelection, } from "../../ledgers/status.js";
-import { bodySkipToken, commitMessage, CommandError, DEV, EXIT, git, isSharedBranch, parseJson, runGh, runGit, runTool, SKIP_CI_TOKEN, } from "../lib.js";
+import { bodySkipToken, commitMessage, CommandError, DEV, EXIT, git, isSharedBranch, parseJson, runGh, runGit, runTool, SKIP_CI_TOKEN, wholeNumber, } from "../lib.js";
 import { ciGeneratedSteps, readBkitConfig } from "../../shared/settings.js";
 import { TIMEOUTS } from "../../shared/timeouts.js";
 import { FID_PATTERNS, fromBranch, fromMarker, issueIdOf, readIssueTracker } from "./fids.js";
@@ -1131,15 +1131,6 @@ export const EXIT_TRIGGER_FAILED = 5;
 export const EXIT_SKIP_TOKEN = 4;
 /** Exit code: the pushed head's commit message could not be read for the body scan. */
 export const EXIT_SCAN_ERROR = 5;
-const wholeNumber = (v, flag, fallback, min = 0) => {
-    if (v === undefined)
-        return fallback;
-    const s = String(v);
-    if (!/^[0-9]+$/.test(s) || Number(s) < min) {
-        throw new CommandError(EXIT.USAGE, `--${flag} takes a whole number >= ${min} (got "${s}")`);
-    }
-    return Number(s);
-};
 const HEAD_FLAG = { name: "head", type: "string", help: "commit SHA" };
 const REPO_FLAG = {
     name: "repo",
diff --git a/dist/commands/workflow/tests.js b/dist/commands/workflow/tests.js
index 7d14f3044..97d80e6b6 100644
--- a/dist/commands/workflow/tests.js
+++ b/dist/commands/workflow/tests.js
@@ -23,7 +23,7 @@ import * as path from "node:path";
 import { BKIT_LINT_FILE_SCRIPT, BKIT_TEST_FILE_SCRIPT } from "../../install/manifest.js";
 import { clampLogPath } from "../../ledgers/clamp-log.js";
 import { appendLine, statusTimestamp, validateCiSelection, testRunProblem, } from "../../ledgers/status.js";
-import { CommandError, EXIT, git, runGit } from "../lib.js";
+import { classifyLockExit, CommandError, EXIT, git, runGit, testsLockHolder, wholeNumber, } from "../lib.js";
 import { parseJson } from "../../shared/json.js";
 import { readPackageJson } from "../../shared/package-json.js";
 import { COULD_NOT_RUN_EXIT_CODES, scriptCommand } from "../../shared/package-manager.js";
@@ -43,6 +43,7 @@ export const EXIT_ARTIFACT_STEP = 5;
 export const TEST_RUN_ROW = "test-run";
 /** The env var naming the folder every runner a gate calls writes its JUnit XML into. */
 export const REPORT_DIR_ENV = "BKIT_TEST_REPORT_DIR";
+export { classifyLockExit } from "../lib.js";
 const NO_REPORT_HINT = `no JUnit report in $${REPORT_DIR_ENV} — failures unknown; turn on each test runner's JUnit ` +
     `reporter in the gate and point its output into $${REPORT_DIR_ENV} ` +
     "(.bkit/workflows.md § Local gate scripts)";
@@ -1191,7 +1192,7 @@ export const testsCommand = {
     verbs: {
         changed: testsChangedVerb,
         run: {
-            summary: "Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run.",
+            summary: "Run the first declared --gate, and with --file append a test-run status row for the run; exit 0 PASS, 1 FAIL, 4 could not run, 81 tests lock held.",
             use: "by-hand",
             flags: [
                 {
@@ -1212,6 +1213,11 @@ export const testsCommand = {
                     type: "string",
                     help: `lines of the log echoed to stderr afterwards (default ${DEFAULT_TAIL}; 0 for none)`,
                 },
+                {
+                    name: "lock-wait-s",
+                    type: "string",
+                    help: "whole-number lock wait >= 0, passed as LOCAL_STACK_LOCK_WAIT_S (default BKIT_LOCK_WAIT_S, else 60)",
+                },
                 {
                     name: "artifact",
                     type: "string",
@@ -1257,7 +1263,8 @@ export const testsCommand = {
                 logBytes: "size of the saved output",
                 artifact: "--artifact as given, else null",
                 clamp: "the artifact's clamp record (raw = the log, source = scope), else null",
-                row: `the ${TEST_RUN_ROW} row appended to --file ({type, workflow, at, step, attempt?, run, verdict, exitCode, failures, scope, log, artifact?}; run = this step's test-run rows in the workflow's active run, this one included), else null`,
+                row: `the ${TEST_RUN_ROW} row appended to --file ({type, workflow, at, step, attempt?, run, verdict, exitCode, failures, scope, log, artifact?}; run = this step's test-run rows in the workflow's active run, this one included), else null; a tests-lock wait writes no row`,
+                lockHolder: "tests-lock holder when the wait gave up, else null",
             },
             textOmit: ["clamp", "row"],
             exitCodes: {
@@ -1266,6 +1273,10 @@ export const testsCommand = {
                 [EXIT_ARTIFACT_STEP]: "--artifact could not be written, trimmed or recorded",
             },
             run: (ctx) => {
+                const waitSource = ctx.flags.lockWaitS ?? process.env.BKIT_LOCK_WAIT_S;
+                const waitS = wholeNumber(waitSource, ctx.flags.lockWaitS === undefined && process.env.BKIT_LOCK_WAIT_S !== undefined
+                    ? "lock-wait-s (BKIT_LOCK_WAIT_S)"
+                    : "lock-wait-s", 60);
                 const candidates = ctx.flags.gate;
                 const logArg = String(ctx.flags.log);
                 if (logArg === "")
@@ -1388,20 +1399,34 @@ export const testsCommand = {
                 const reports = freshReportDir(log);
                 ctx.log(`running ${scope} — full output in ${logArg}`);
                 const fetchedAt = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
-                const exitCode = runToLog(scriptCommand(gate), top, log, { [REPORT_DIR_ENV]: reports });
-                for (const line of Number(tailRaw) > 0 ? tailLines(log, Number(tailRaw)) : [])
+                const who = ["bkit tests run", gate, fid, step].filter(Boolean).join(" ");
+                const exitCode = runToLog(scriptCommand(gate), top, log, {
+                    [REPORT_DIR_ENV]: reports,
+                    LOCAL_STACK_LOCK_WAIT_S: String(waitS),
+                    LOCAL_STACK_LOCK_WHO: who,
+                });
+                const logText = fs.readFileSync(log, "utf-8");
+                const lockExit = classifyLockExit({ exitCode, log: logText, who });
+                const lockWait = lockExit === "lock-wait";
+                const lockHolder = lockWait ? testsLockHolder(logText, who) : null;
+                const lines = lockExit === "gate"
+                    ? Number(tailRaw) > 0
+                        ? tailLines(log, Number(tailRaw))
+                        : []
+                    : logText.split(/\r?\n/).filter((line) => line.startsWith("[machine-lock]"));
+                for (const line of lines)
                     ctx.log(line);
-                const couldNotRun = COULD_NOT_RUN_EXIT_CODES.has(exitCode);
-                const verdict = couldNotRun ? null : exitCode === 0 ? "PASS" : "FAIL";
-                const counted = countReportFailures(reports);
-                if (counted === null)
+                const couldNotRun = lockExit === "could-not-run" || COULD_NOT_RUN_EXIT_CODES.has(exitCode);
+                const verdict = couldNotRun || lockWait ? null : exitCode === 0 ? "PASS" : "FAIL";
+                const counted = lockExit === "gate" ? countReportFailures(reports) : null;
+                if (counted === null && lockExit === "gate")
                     ctx.log(NO_REPORT_HINT);
                 else if (verdict === "FAIL" && counted === 0)
                     ctx.log(`the JUnit reports in $${REPORT_DIR_ENV} hold no failing case — the gate failed outside its reported tests; failures unknown`);
                 const failures = verdict === "PASS" ? 0 : counted !== null && counted > 0 ? counted : null;
                 let clamp = null;
                 let artifactFailed = null;
-                if (artifact !== undefined) {
+                if (artifact !== undefined && !lockWait) {
                     try {
                         const out = path.resolve(ctx.cwd, artifact);
                         fs.mkdirSync(path.dirname(out), { recursive: true });
@@ -1423,7 +1448,7 @@ export const testsCommand = {
                         artifactFailed = err.message;
                     }
                 }
-                const row = status === undefined
+                const row = status === undefined || lockWait
                     ? null
                     : appendTestRun(status, {
                         workflow: workflow,
@@ -1447,16 +1472,19 @@ export const testsCommand = {
                     reports: `${logArg}.reports`,
                     log: logArg,
                     logBytes: fs.statSync(log).size,
-                    artifact: artifact ?? null,
+                    artifact: lockWait ? null : (artifact ?? null),
                     clamp,
                     row,
+                    lockHolder,
                 });
                 if (artifactFailed !== null) {
                     ctx.log(`--artifact ${artifact}: ${artifactFailed}`);
                     return EXIT_ARTIFACT_STEP;
                 }
+                if (lockWait)
+                    return EXIT.AGENT_WAIT;
                 if (couldNotRun) {
-                    ctx.log(`${scope} could not run (exit ${exitCode}: ${exitCode === 126 ? "not executable" : "command not found"}) — no tests executed; this is not a FAIL verdict`);
+                    ctx.log(`${scope} could not run (exit ${exitCode}: ${lockExit === "could-not-run" ? "tests lock refused" : exitCode === 126 ? "not executable" : "command not found"}) — no tests executed; this is not a FAIL verdict`);
                     return EXIT_COULD_NOT_RUN;
                 }
                 ctx.log(`verdict ${verdict} (exit ${exitCode})`);
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 5c8b2a8da..6242e05b8 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -164,7 +164,7 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>251 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1670 symbols · 49 files"]
+    n_bkit_core_engine_commands["commands<br/>1673 symbols · 49 files"]
     n_bkit_core_engine_install["install<br/>307 symbols · 20 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>184 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>62 symbols · 4 files"]
@@ -303,10 +303,10 @@ flowchart LR
       end
       n_bkit_core_engine_commands_install_doctor[".bkit/core/engine/commands/install/doctor<br/>6 symbols · 1 files"]
       n_bkit_core_engine_commands_land["land<br/>14 symbols · 1 files"]
-      n_bkit_core_engine_commands_lib["lib<br/>64 symbols · 1 files"]
+      n_bkit_core_engine_commands_lib["lib<br/>67 symbols · 1 files"]
       n_bkit_core_engine_commands_setup_setup[".bkit/core/engine/commands/setup/setup<br/>11 symbols · 1 files"]
       subgraph gn_bkit_core_engine_commands_workflow[".bkit/core/engine/commands/workflow"]
-        n_bkit_core_engine_commands_workflow_branches["branches<br/>130 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_branches["branches<br/>131 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_challenge["challenge<br/>34 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_completeness["completeness<br/>4 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_context["context<br/>91 symbols · 1 files"]
@@ -323,7 +323,7 @@ flowchart LR
         n_bkit_core_engine_commands_workflow_repo["repo<br/>12 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_roadmap["roadmap<br/>39 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_run_facts["run-facts<br/>28 symbols · 1 files"]
-        n_bkit_core_engine_commands_workflow_runs["runs<br/>80 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_runs["runs<br/>79 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_runtime["runtime<br/>19 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_status["status<br/>39 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_step_table["step-table<br/>14 symbols · 1 files"]
@@ -371,9 +371,9 @@ flowchart LR
     end
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands_workflow_branches -->|127| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_branches -->|132| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_workflows -->|79| n_bkit_core_engine_commands_lib
-  n_bkit_core_engine_commands_workflow_runs -->|66| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_runs -->|69| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_prs -->|53| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_ledgers -->|38| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_worktrees -->|38| n_bkit_core_engine_commands_lib
@@ -424,6 +424,7 @@ flowchart LR
   n_bkit_core_engine_commands_install_install -->|14| n_bkit_core_engine_render_models
   n_bkit_core_engine_commands_install_upgrade -->|14| n_bkit_core_engine_install_version_file
   n_bkit_core_engine_commands_workflow_branches -->|14| n_bkit_core_engine_commands_workflow_prs
+  n_bkit_core_engine_commands_workflow_tests -->|14| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_tracker -->|14| n_bkit_core_engine_ledgers_status
   nscripts_harvest -->|14| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_checks_after_index -->|13| n_bkit_core_engine_checks_after_github
@@ -450,7 +451,6 @@ flowchart LR
   n_bkit_core_engine_commands_install_uninstall -->|11| n_bkit_core_engine_install_write
   n_bkit_core_engine_commands_workflow_branches -->|11| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_workflow_steps -->|11| n_bkit_core_engine_commands_workflow_ledgers
-  n_bkit_core_engine_commands_workflow_tests -->|11| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_tracker -->|11| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_install_modules_opencode -->|11| n_bkit_core_engine_render_models
   n_bkit_core_engine_install_modules_opencode -->|11| n_bkit_core_engine_shared_package_roots
@@ -461,6 +461,7 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_context -->|10| n_bkit_core_engine_commands_workflow_plan_blocks
   n_bkit_core_engine_commands_workflow_issues -->|10| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_runs -->|10| n_bkit_core_engine_commands_workflow_fids
+  n_bkit_core_engine_commands_workflow_tests_changed -->|10| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_tracker -->|10| n_bkit_core_engine_shared_json
   n_bkit_core_engine_commands_workflow_workflows -->|10| n_bkit_core_engine_commands_workflow_branches
   n_bkit_core_engine_commands_workflow_workflows -->|10| n_bkit_core_engine_checks_status_holes
@@ -535,7 +536,6 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_commands_workflow_fids
   n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_commands_workflow_locks
   n_bkit_core_engine_commands_workflow_steps -->|7| n_bkit_core_engine_ledgers_journal
-  n_bkit_core_engine_commands_workflow_tests_changed -->|7| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_workflows -->|7| n_bkit_core_engine_commands_workflow_summary
   n_bkit_core_engine_install_modules_cursor -->|7| n_bkit_core_engine_install_write
   n_bkit_core_engine_install_modules_cursor -->|7| n_bkit_core_engine_render_hosts
@@ -747,7 +747,7 @@ flowchart LR
   linkStyle 70 stroke:#59636e,stroke-width:6px
   linkStyle 71 stroke:#59636e,stroke-width:6px
   linkStyle 72 stroke:#59636e,stroke-width:6px
-  linkStyle 73 stroke:#59636eb3,stroke-width:3px
+  linkStyle 73 stroke:#59636e,stroke-width:6px
   linkStyle 74 stroke:#59636eb3,stroke-width:3px
   linkStyle 75 stroke:#59636eb3,stroke-width:3px
   linkStyle 76 stroke:#59636eb3,stroke-width:3px
@@ -807,7 +807,7 @@ flowchart LR
   linkStyle 130 stroke:#59636eb3,stroke-width:3px
   linkStyle 131 stroke:#59636eb3,stroke-width:3px
   linkStyle 132 stroke:#59636eb3,stroke-width:3px
-  linkStyle 133 stroke:#59636e80,stroke-width:2px
+  linkStyle 133 stroke:#59636eb3,stroke-width:3px
   linkStyle 134 stroke:#59636e80,stroke-width:2px
   linkStyle 135 stroke:#59636e80,stroke-width:2px
   linkStyle 136 stroke:#59636e80,stroke-width:2px
diff --git a/docs/decisions.jsonl b/docs/decisions.jsonl
index c3048d13a..b1baa64ae 100644
--- a/docs/decisions.jsonl
+++ b/docs/decisions.jsonl
@@ -612,3 +612,9 @@
 {"schema":3,"ts":1793687546914,"firstTs":1793686505393,"updates":2,"kind":"decision","key":"842-ship-reconciles-feature-before-base-check","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-apply-review","subagent":"bkit-plan-update","model":"gpt-6.1-sol"},"references":["842","799-ship-step4-merges-origin-dev-locally-never-server-side-or-rebase","docs/plans/202611/842-ship-fails-local-plan.md"],"summary":"Ship reconciles before base selection and rechecks publication eligibility whenever feature candidates change","description":"Extend branches sync with opt-in feature reconciliation and CI-running publication. Apply inheritedDevCommits to freshly fetched remote and reconciled heads before publication, including retries. Reuse deferred-sweep and docs completion only when durable evidence covers the same feature-code state; imported feature code invalidates that proof, while base-only integration may reuse it.","rationale":"Review found that an accepted setup tip does not prove an imported remote tip safe, and that completed agent work does not prove coverage of later feature code. The same branch-state facts must decide publication and retry reuse.","alternatives":["Trust the initial setup eligibility and completion rows after remote movement","Require manual reconciliation on every changed feature tip"],"status":"ACTIVE"}
 {"schema":3,"ts":1793687546918,"firstTs":1793686505399,"updates":2,"kind":"decision","key":"842-ship-preserves-unlanded-work","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-apply-review","subagent":"bkit-plan-update","model":"gpt-6.1-sol"},"references":["842","docs/plans/202611/842-ship-fails-local-plan.md"],"summary":"Ship cleanup compares landed tree entries and deletes only refs still at their proven tips","description":"Share notOnDev between land and ship with file additions, edits, deletions, entry mode/type and deliberate ledger-union equivalence. Bind local deletion atomically to the inspected old ref. Bind remote deletion to its inspected tip or retain/report the remote when that guarantee is unavailable under the no-force-push policy. A preserved branch still permits close-record landing and lock release. Remove eager client merge-time deletion; repository-managed automatic deletion remains a separate documented server policy.","rationale":"Content-only comparison misses executable and type changes, while a safety read followed by unconditional deletion loses late pushes. Squash equivalence still requires tree/ledger comparison instead of commit ancestry.","alternatives":["Read again immediately before unconditional deletion","Use force-push deletion despite the merge-only/no-force-push contract"],"status":"ACTIVE"}
 {"schema":3,"ts":1793687546919,"firstTs":1793687546919,"updates":1,"kind":"decision","key":"842-ship-mcp-facts-use-engine-safety-decisions","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-apply-review","subagent":"bkit-plan-update","model":"gpt-6.1-sol"},"references":["842","docs/plans/202611/842-ship-fails-local-plan.md"],"summary":"MCP fallback supplies scoped facts to the same deterministic ship safety decisions as gh","description":"Extend existing PR and gate commands with additive validated fact-file inputs. On exit 80 or runtimeGithubCli=false, the workflow gathers scoped MCP PR, CI and base/compare facts, preserves the single transport transition and independent reread, and invokes the engine eligibility, stale-base and post-refusal classifiers. Missing or mismatched evidence stops before mutation. A model does not judge safety or bypass the gate.","rationale":"Provider rendering alone does not cover the existing transport fallbacks, which return before the engine safety logic. Feeding facts back to the engine keeps reconciliation and refusal decisions consistent across runtimes.","alternatives":["Reimplement branch safety decisions as model judgment in fallback prose","Allow gh-unavailable routes to retain their old unchecked shortcuts"],"status":"ACTIVE"}
+{"schema":3,"ts":1793686119936,"firstTs":1793686119936,"updates":1,"kind":"decision","key":"724-lock-wait-is-host-budget-not-constant","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["724","docs/plans/202610/724-machine-wide-test-plan.md",".bkit/shared/.claude/settings.json",".bkit/providers.md"],"status":"ACTIVE","summary":"The tests-lock wait uses the host budget from BKIT_LOCK_WAIT_S, with a 60-second fallback","description":"The confirmed plan's Open Question 14 sets --lock-wait-s to BKIT_LOCK_WAIT_S when present, else 60. Claude Code ships BKIT_LOCK_WAIT_S=1200 because its long shell calls move to the background; other hosts keep the 60-second fallback and retry exit 81. An explicit --lock-wait-s overrides the environment. The script's raw-call policy stays 60 seconds without a TTY and 3600 seconds with a TTY unless LOCAL_STACK_LOCK_WAIT_S is set. Holder diagnostics include the last run duration recorded for that checkout.","rationale":"The wait must fit each host's shell execution model while reporting the holder and preserving a bounded retry on hosts that cannot keep a long call running.","alternatives":"A fixed 60-second engine wait on every host; host detection through runtime marker variables."}
+{"schema":3,"ts":1793686119938,"firstTs":1793686119938,"updates":1,"kind":"decision","key":"724-branches-push-maps-hook-lock-give-up-to-81","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["724","docs/plans/202610/724-machine-wide-test-plan.md",".bkit/core/engine/commands/workflow/branches.ts",".bkit/core/workflows/bkit-build.md"],"status":"ACTIVE","summary":"A workflow push passes the host wait budget to its hook and returns 81 for this run's tests-lock give-up","description":"The confirmed plan's Open Question 15 makes bkit branches push pass LOCAL_STACK_LOCK_WAIT_S from BKIT_LOCK_WAIT_S, else 60, and LOCAL_STACK_LOCK_WHO identifying the push to git push. A tests-lock give-up naming that run returns exit 81 and lockHolder before any pushed result or replay fallback; a tests-lock refusal returns 4. Ordinary hook failures and nested lock failures retain their existing failure meaning. Every workflow push site retries the push on 81; the build retains the original close outputs before its push-only retry and releases its workflow lock after success.","rationale":"Waiting for another gate is an execution wait rather than a failed push, and uses the same lock-outcome contract as the engine's test commands.","alternatives":"Treat the hook's lock wait as a failed push and enter the Failure Path."}
+{"schema":3,"ts":1793686119939,"firstTs":1793686119939,"updates":1,"kind":"decision","key":"724-test-workers-leave-one-core","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["724","docs/plans/202610/724-machine-wide-test-plan.md",".bkit/templates/scripts/ci/bkit-machine-lock.sh","724-tests-lock-fixed-slots-not-live-load"],"status":"ACTIVE","summary":"Each tests-lock slot leaves one core outside its worker allocation","description":"The owner's revised answer B to plan Open Question 10 sets BKIT_TEST_WORKERS to max(1, floor(cores / slots) - 1). BKIT_TEST_SLOTS still controls the fixed number of concurrent heavy runs and defaults to one; the worker allocation never drops below one.","rationale":"Reserve capacity for the agent and test subprocess orchestration while bounding each admitted heavy run's worker pool.","alternatives":"The earlier cores-divided-by-slots allocation without subtracting one."}
+{"schema":3,"ts":1793686119940,"firstTs":1793237760995,"updates":2,"kind":"decision","key":"724-tests-lock-fixed-slots-not-live-load","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["724","docs/plans/202610/724-machine-wide-test-plan.md","724-test-workers-leave-one-core"],"status":"ACTIVE","summary":"The machine-wide tests lock admits a fixed number of heavy runs; live load never decides who runs","description":"BKIT_TEST_SLOTS defaults to one and overrides the fixed number of tests-lock slots. Each holder exports BKIT_TEST_WORKERS = max(1, floor(cores / slots) - 1), as confirmed by the owner's revised answer B to Open Question 10. Slot 1 is tests.lock and later slots use tests.<k>.lock, so runs with different slot settings still meet on slot 1. An invalid BKIT_TEST_SLOTS falls back to one with one stderr note.","rationale":"Load average lags, counts unrelated work and differs across hosts; fixed slots are predictable and explainable.","alternatives":"A live load-average or memory-pressure gate; hardware-derived slot admission."}
+{"schema":3,"ts":1793686119941,"firstTs":1793237760998,"updates":3,"kind":"decision","key":"724-tests-run-lock-wait-exit-81","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["724","docs/plans/202610/724-machine-wide-test-plan.md",".bkit/core/engine/commands/workflow/tests.ts","724-lock-wait-is-host-budget-not-constant"],"status":"ACTIVE","summary":"bkit tests run waits for the host budget, then returns 81 naming the tests-lock holder","description":"--lock-wait-s uses an explicit whole number, otherwise BKIT_LOCK_WAIT_S, otherwise 60 seconds. Claude Code ships BKIT_LOCK_WAIT_S=1200; other hosts use the fallback. A give-up naming the tests lock and this run returns shared EXIT.AGENT_WAIT (81) with lockHolder, without a test verdict artifact or test-run status row. Workflows end the turn and rerun the same test command. Raw callers retain the script's TTY-sensitive default unless LOCAL_STACK_LOCK_WAIT_S is set.","rationale":"A wait for another runner must fit the host's tool budget and must not be reported as a test failure.","alternatives":"Use one constant for every host; wait for the full terminal default in every tool call; report lock contention as a failed gate."}
+{"schema":3,"ts":1793686119942,"firstTs":1793535555238,"updates":2,"kind":"decision","key":"724-tests-changed-lock-wait-exit-81","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["724","docs/plans/202610/724-machine-wide-test-plan.md",".bkit/core/engine/commands/workflow/tests-changed.ts","724-lock-wait-is-host-budget-not-constant"],"status":"ACTIVE","summary":"bkit tests changed shares the test command's host-budget and exit-81 lock contract","description":"testsChangedVerb passes LOCAL_STACK_LOCK_WAIT_S from an explicit --lock-wait-s, otherwise BKIT_LOCK_WAIT_S, otherwise 60, and LOCAL_STACK_LOCK_WHO identifying the changed-files gate. The shared classifier maps this run's tests-lock give-up to exit 81 plus lockHolder and a tests-lock refusal to exit 4; ordinary gate and nested-lock failures retain their existing meaning. The four prompts that call tests changed retry 81 without treating it as a code gap.","rationale":"The owner's answer A to Open Question 11 applies the same lock-wait behavior to both engine test callers; Open Question 14 supplies the host budget.","alternatives":"Ask prompts to parse a failed gate's output; keep lock contention indistinguishable from test failure."}
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index b83a401fd..00faadcd0 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -149,3 +149,5 @@
 {"schema":3,"ts":1793660763377,"firstTs":1793660763377,"updates":1,"kind":"knowledge","key":"tracker-post-unit-tests-clear-ambient-linear-credential","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["724",".bkit/core/engine/commands/workflow/issues.test.ts",".bkit/core/engine/commands/workflow/steps.test.ts"],"summary":"Tracker post unit tests must clear ambient Linear credentials before asserting missing-auth behavior","description":"With BKIT_LINEAR_API_KEY supplied by direnv, the existing failed-post cases called Linear and received not-found instead of the expected missing-auth reason. Both failures repeated in the related and named changed-gate stages.","rootCause":"The post suites restored the original credential after each test but did not clear it before cases that require no credential.","remediation":"Delete BKIT_LINEAR_API_KEY in each post suite's beforeEach and retain its existing afterEach restoration. Successful post cases explicitly set the stub credential and fake fetch. Keep missing-auth assertions independent of network responses.","status":"ACTIVE"}
 {"schema":3,"ts":1793663239824,"firstTs":1793663239824,"updates":1,"kind":"knowledge","key":"reuse-stable-executable-for-shell-fixture-bodies","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":["tests/fixtures/gh/bin/gh","tests/gh-stub-smoke.bats","docs/testing.md"],"summary":"Reuse a stable executable when shell fixtures change their response bodies","description":"On the local host, six fresh executable shell fixtures had a 109.25ms median startup; identical interpreted bodies had a 5.45ms median, and aliases to the stable dispatcher had a 7.5ms median. Broad unit coverage amplified this startup cost into test timeouts. Executable resolution tracing confirmed the intended fake pnpm/gh paths and zero fetch calls.","rootCause":"Generating a new executable for each response repeats first-execution overhead; the response data does not require a new executable identity.","remediation":"Symlink each temporary tool name to the existing fixture dispatcher, store the body as a non-executable file, and restore its environment selector after each case. Clear the selector before interpreting the body so nested fixture fallback cannot recurse. Keep PATH lookup, real subprocesses, original assertions, timeout budgets and worker settings.","status":"ACTIVE"}
 {"schema":3,"ts":1793668591094,"firstTs":1793668591094,"updates":1,"kind":"knowledge","key":"vitest-cli-filters-live-on-runner-filename-pattern","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["vitest.test-lock.ts","docs/testing.md"],"summary":"Read actual Vitest CLI filters when deciding whether a raw run needs the tests lock","description":"Vitest 5 stores CLI file filters on vitest.filenamePattern before global setup. Its resolved config does not carry config.filters. Reading config.filters alone treats an explicit existing-file run as an unfiltered heavy run and waits unnecessarily.","rootCause":"CLI run selection and the resolved test configuration are separate runner state.","remediation":"Preserve an explicit config.filters input and fall back to vitest.filenamePattern. Verify the real bkit:test:file command completes while another worktree holds the raw-run lock.","status":"ACTIVE"}
+{"schema":3,"ts":1793677148479,"firstTs":1793677148479,"updates":1,"kind":"knowledge","key":"machine-lock-wrapper-cancellation-keeps-foreground-owner-alive","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":[".bkit/templates/scripts/ci/bkit-machine-lock.sh",".bkit/core/engine/audits/templates/machine-lock.integration.test.ts"],"summary":"A lock wrapper must remain alive until its foreground gate stops","rootCause":"The Perl holder follows the wrapper owner. Terminating only that wrapper releases the lock while its foreground gate can continue running.","remediation":"Defer TERM, INT and HUP cancellation until the foreground command completes naturally; retain the lock owner until then and return the signal status after release. Verify a competing run stays excluded and preserve ordinary command statuses and inherited-owner reuse.","status":"ACTIVE"}
+{"schema":3,"ts":1793677148482,"firstTs":1793677148482,"updates":1,"kind":"knowledge","key":"workflow-push-retry-keeps-close-effects-and-original-return-once","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":[".bkit/core/workflows/bkit-build.md",".bkit/core/engine/audits/workflows/local-gate-audit.test.ts"],"summary":"Keep workflow close effects outside a retryable push block","rootCause":"Retrying a fence that closes the workflow before pushing repeats append-only status and publishing effects. Close also removes its session, so a repeated close can lose the original final-return issue facts.","remediation":"Close once, retain commentFile, tracker and finalReturn immediately, retry only the push on exit 81, and release the workflow lock after push success.","status":"ACTIVE"}
diff --git a/scripts/ci/bkit-machine-lock.sh b/scripts/ci/bkit-machine-lock.sh
index db451ff05..d24609edd 100644
--- a/scripts/ci/bkit-machine-lock.sh
+++ b/scripts/ci/bkit-machine-lock.sh
@@ -16,6 +16,8 @@
 # run ["<who>"] [--lock <name>] -- <command> exits with the command's status:
 # 2 usage, 73 the lock could not be taken, 75 the wait gave up.
 # The run name defaults to LOCAL_STACK_LOCK_WHO, npm_lifecycle_event, then run.
+# TERM, INT and HUP defer cancellation until the foreground command ends, keeping
+# its lock held throughout; the wrapper then returns the signal's exit status.
 #
 # Named locks live in ${XDG_CACHE_HOME:-$HOME/.cache}/bkit/machine-lock/ with no
 # repository prefix. The unnamed stack lock keeps its local-stack-lock/ path and
@@ -367,8 +369,19 @@ if [ "${BASH_SOURCE[0]}" = "$0" ]; then
   shift
   [ "$#" -gt 0 ] || _lsl_run_usage
   take_local_stack_lock "$_lsl_run_who" "$_lsl_run_name" || exit "$_LOCAL_STACK_LOCK_EXIT"
+  _lsl_run_signal_status=0
+  _lsl_run_cancel() {
+    _lsl_run_signal_status="$1"
+    echo "[machine-lock] cancellation requested; waiting for $_lsl_run_who to finish before releasing its lock" >&2
+  }
+  # Bash runs these traps after its foreground command ends. Keeping this owner
+  # alive also keeps the Perl holder alive while that command finishes naturally.
+  trap '_lsl_run_cancel 143' TERM
+  trap '_lsl_run_cancel 130' INT
+  trap '_lsl_run_cancel 129' HUP
   "$@"
   _lsl_run_status=$?
   release_local_stack_lock "$_lsl_run_name"
+  [ "$_lsl_run_signal_status" -eq 0 ] || _lsl_run_status="$_lsl_run_signal_status"
   exit "$_lsl_run_status"
 fi
