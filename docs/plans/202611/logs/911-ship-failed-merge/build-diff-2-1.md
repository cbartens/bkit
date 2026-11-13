diff --git a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
index c5864a2f9..482e809c9 100644
--- a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
@@ -78,9 +78,11 @@ description: "Ship Feature — Autonomous merge and archive"
 
 1. Write the error message / tool response to `{OUTBOX_ROOT}/error.md` (`--error-file` dropped while `{OUTBOX_ROOT}` is not held). `{STDERR_FILE}` = `{OUTBOX}/stderr.log` holding the failed shell command's stderr — drop `--stderr-file` when the failure was not a shell command or `{OUTBOX}` is not set yet; drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when a `counters route` exit 1 (a `MAX_*` limit) sent the run here; `{LABEL_FLAGS}` = one `--label=<name>` per current `LABELS` entry. Abort any in-progress rebase or merge, record the failure, release the lock, delete the session folder (drop `--session-dir` while `{SESSION_DIR}` is not held), clear sentinels — **state only, no `add` / `commit` / `push`**; a MERGED PR moves the issue to `bkit:merged` plus `bkit:failed`, else the prior phase label persists:
    ```bash
-   "{BKIT}" workflows fail --post --issue="{ISSUE_ID}" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}" --session-dir="{SESSION_DIR}"
+   "{BKIT}" workflows fail --post --issue="{ISSUE_ID}" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}" --next-step="{NEXT_STEP}" --session-dir="{SESSION_DIR}"
    ```
+   Drop `--next-step` when `NEXT_STEP` is not held.
    Hold `handoverNeeded` as `HANDOVER_NEEDED`, `labels` as `LABELS` and `trackerState` as `TRACKER_STATE`.
+   **If** exit 2 **and** `--next-step` was passed → the value was refused before any write: clear `NEXT_STEP` and run the block again without `--next-step`, then route on that exit.
    **If** exit non-zero → log `Lock removal failed` with the printed `lock` to stderr, then continue.
 2. **Skip if** `ISSUE_ID` empty. **If** `tracker.done` = false → post `comment` via the tracker MCP per the header's fallback section. **If** `labelsWrite.done` = false → apply the printed `labels` / `trackerState` via the tracker MCP (**Labels** fallback).
 3. **If** `HANDOVER_NEEDED` = true → step 4. **Else** → step 5.
@@ -100,7 +102,7 @@ description: "Ship Feature — Autonomous merge and archive"
    The block posts a non-null `comment`, which links the handover only where the flush pushed it.
    **If** `tracker.done` = false → post `comment` via the tracker MCP per the header's fallback section.
    **If** the push failed → do not claim success on the tracker.
-6. **STOP**, no further downstream steps. **If** `SUMMARY_VERDICT` = FAIL → the final message is `ship-summary.md` content verbatim. Line 1 of the final message = the no-issue warning, when one was emitted.
+6. **STOP**, no further downstream steps. **If** `SUMMARY_VERDICT` = FAIL → the final message is `ship-summary.md` content verbatim. Line 1 of the final message = the no-issue warning, when one was emitted. **If** `NEXT_STEP` is held → the final message's last line is `Next step: {NEXT_STEP}`, after any verbatim summary.
 
 ---
 
@@ -292,14 +294,16 @@ description: "Ship Feature — Autonomous merge and archive"
    ```bash
    "{BKIT}" runs wait --pr="{PR_NUMBER}" --until=present --budget-s=120 || exit 1
    "{BKIT}" runs wait --pr="{PR_NUMBER}" --until=completed
-   "{BKIT}" prs checks --number="{PR_NUMBER}" >/dev/null
+   "{BKIT}" prs checks --number="{PR_NUMBER}"
    ```
-   Route:
+   Hold `failed` as `CHECKS_FAILED`. Route:
    - **If** exit 0 → next sub-step.
+   - **If** exit 1 **and** `CHECKS_FAILED` > 0 (any check failed: the CI run is red) → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
    - **If** exit 80 → read the checks with `pull_request_read` (`get_status`):
-     - **If** there is no check, **or** any check failed or is pending → **Failure Path**.
+     - **If** any check failed → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
+     - **If** there is no check, **or** any check is pending → **Failure Path**.
      - **Else** → next sub-step.
-   - **Else** → **Failure Path**.
+   - **Else** (the rollup is unreadable) → **Failure Path**.
 6. Finish (bookkeeping to `$BOOK_ROOT`, no branch commit):
    ```bash
    "{BKIT}" steps done --workflow=ship --step=ship-worktree-setup --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md" --commit=none >/dev/null || exit 1
@@ -678,6 +682,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
      - **If** exit 0 → set `{REVALIDATE_REASON}` = `gate-refusal` → Step 9.
      - **If** exit 1 **and** `MERGE_ASK` = true → set `{REVALIDATE_REASON}` = `gate-refusal`, `LIMIT_NEXT` = Step 9 → **Merge Question**.
      - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
+   - **If** exit 12 **and** `regenerable` = false → the CI run is red and regenerating cannot fix it. Hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
    - **If** exit 12 **and** `regenerable` = true → every failed CI step is one `bkit:generate` fixes (`bkit.testing.ciGenerated`). Route on the failed arrivals at Step 10, without asking:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
@@ -701,10 +706,10 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
 
          Then set `REVALIDATE_REASON` empty → Step 9 (re-validate at the regenerated head, then re-run the merge gate).
 
-       - **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed).
-     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
-     - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
-   - **Else** (12, 13, 15, 16, 18 or 20) → **Failure Path**.
+       - **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed). **If** `REGEN_OUTCOME` = `unchanged` **or** `undeclared` → hold `/bkit-debug {FID}` as `NEXT_STEP` first.
+     - **If** exit 1 **and** `MERGE_ASK` = true → hold `/bkit-debug {FID}` as `NEXT_STEP`, `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
+     - **Else** → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
+   - **Else** (13, 15, 16, 18 or 20) → **Failure Path**.
 2. Merge with an empty body and `--match-head`, so GitHub refuses when the head moved. Re-read the labels from the tracker, so that ` bkit [auto route]` rides the squash subject on `bkit:auto`. The labels are never carried forward from Step 1's `{LABELS}`. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when no tracker is wired or `ISSUE_ID` is empty:
    **Skip if** `ISSUE_ID` empty. Re-read the issue:
    ```bash
@@ -781,11 +786,12 @@ Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NE
    ```
 
    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
-   - **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
+   - **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and `NEXT_STEP` and go to the step `LIMIT_NEXT` named:
      ```bash
      "{BKIT}" counters grant --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --point=ship.merge --file="{STATUS}" --workflow=ship >/dev/null || exit 1
      ```
    - **If** the answer is `Stop` → create `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md` with the question, the answer and the line `Stopped by the owner; run stays IN_PROGRESS. /bkit-ship {FID} resumes at Step 10.`
+     **If** `NEXT_STEP` is held → add the line `Next step: {NEXT_STEP}` to the handover after the resume line, and end the final message with the same line.
      Then push it and release the lock. NEVER run `workflows fail`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=ship --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
@@ -830,7 +836,10 @@ Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NE
    ```bash
    "{BKIT}" runs gate --squash-of="{PR_NUMBER}" --repo="{OWNER_REPO}" --capstone-only --record="{STATUS}"
    ```
-   Hold `head` as `SQUASH_SHA`.
+   Route:
+   - **If** exit 0 → hold `head` as `SQUASH_SHA` → sub-step 2.
+   - **If** exit 12 → the squash commit's CI is red. Hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
+   - **Else** → **Failure Path**.
 2. Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is deleted only at its inspected landed tip and retained when origin refuses that conditional deletion; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    ```bash
diff --git a/.agents/skills/bkit-ship/SKILL.md b/.agents/skills/bkit-ship/SKILL.md
index 2c0f2ad3f..afbdda807 100644
--- a/.agents/skills/bkit-ship/SKILL.md
+++ b/.agents/skills/bkit-ship/SKILL.md
@@ -78,9 +78,11 @@ description: "Ship Feature — Autonomous merge and archive"
 
 1. Write the error message / tool response to `{OUTBOX_ROOT}/error.md` (`--error-file` dropped while `{OUTBOX_ROOT}` is not held). `{STDERR_FILE}` = `{OUTBOX}/stderr.log` holding the failed shell command's stderr — drop `--stderr-file` when the failure was not a shell command or `{OUTBOX}` is not set yet; drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when a `counters route` exit 1 (a `MAX_*` limit) sent the run here; `{LABEL_FLAGS}` = one `--label=<name>` per current `LABELS` entry. Abort any in-progress rebase or merge, record the failure, release the lock, delete the session folder (drop `--session-dir` while `{SESSION_DIR}` is not held), clear sentinels — **state only, no `add` / `commit` / `push`**; a MERGED PR moves the issue to `bkit:merged` plus `bkit:failed`, else the prior phase label persists:
    ```bash
-   "{BKIT}" workflows fail --post --issue="{ISSUE_ID}" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}" --session-dir="{SESSION_DIR}"
+   "{BKIT}" workflows fail --post --issue="{ISSUE_ID}" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}" --next-step="{NEXT_STEP}" --session-dir="{SESSION_DIR}"
    ```
+   Drop `--next-step` when `NEXT_STEP` is not held.
    Hold `handoverNeeded` as `HANDOVER_NEEDED`, `labels` as `LABELS` and `trackerState` as `TRACKER_STATE`.
+   **If** exit 2 **and** `--next-step` was passed → the value was refused before any write: clear `NEXT_STEP` and run the block again without `--next-step`, then route on that exit.
    **If** exit non-zero → log `Lock removal failed` with the printed `lock` to stderr, then continue.
 2. **Skip if** `ISSUE_ID` empty. **If** `tracker.done` = false → post `comment` via the tracker MCP per the header's fallback section. **If** `labelsWrite.done` = false → apply the printed `labels` / `trackerState` via the tracker MCP (**Labels** fallback).
 3. **If** `HANDOVER_NEEDED` = true → step 4. **Else** → step 5.
@@ -100,7 +102,7 @@ description: "Ship Feature — Autonomous merge and archive"
    The block posts a non-null `comment`, which links the handover only where the flush pushed it.
    **If** `tracker.done` = false → post `comment` via the tracker MCP per the header's fallback section.
    **If** the push failed → do not claim success on the tracker.
-6. **STOP**, no further downstream steps. **If** `SUMMARY_VERDICT` = FAIL → the final message is `ship-summary.md` content verbatim. Line 1 of the final message = the no-issue warning, when one was emitted.
+6. **STOP**, no further downstream steps. **If** `SUMMARY_VERDICT` = FAIL → the final message is `ship-summary.md` content verbatim. Line 1 of the final message = the no-issue warning, when one was emitted. **If** `NEXT_STEP` is held → the final message's last line is `Next step: {NEXT_STEP}`, after any verbatim summary.
 
 ---
 
@@ -292,14 +294,16 @@ description: "Ship Feature — Autonomous merge and archive"
    ```bash
    "{BKIT}" runs wait --pr="{PR_NUMBER}" --until=present --budget-s=120 || exit 1
    "{BKIT}" runs wait --pr="{PR_NUMBER}" --until=completed
-   "{BKIT}" prs checks --number="{PR_NUMBER}" >/dev/null
+   "{BKIT}" prs checks --number="{PR_NUMBER}"
    ```
-   Route:
+   Hold `failed` as `CHECKS_FAILED`. Route:
    - **If** exit 0 → next sub-step.
+   - **If** exit 1 **and** `CHECKS_FAILED` > 0 (any check failed: the CI run is red) → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
    - **If** exit 80 → read the checks with `pull_request_read` (`get_status`):
-     - **If** there is no check, **or** any check failed or is pending → **Failure Path**.
+     - **If** any check failed → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
+     - **If** there is no check, **or** any check is pending → **Failure Path**.
      - **Else** → next sub-step.
-   - **Else** → **Failure Path**.
+   - **Else** (the rollup is unreadable) → **Failure Path**.
 6. Finish (bookkeeping to `$BOOK_ROOT`, no branch commit):
    ```bash
    "{BKIT}" steps done --workflow=ship --step=ship-worktree-setup --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md" --commit=none >/dev/null || exit 1
@@ -678,6 +682,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
      - **If** exit 0 → set `{REVALIDATE_REASON}` = `gate-refusal` → Step 9.
      - **If** exit 1 **and** `MERGE_ASK` = true → set `{REVALIDATE_REASON}` = `gate-refusal`, `LIMIT_NEXT` = Step 9 → **Merge Question**.
      - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
+   - **If** exit 12 **and** `regenerable` = false → the CI run is red and regenerating cannot fix it. Hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
    - **If** exit 12 **and** `regenerable` = true → every failed CI step is one `bkit:generate` fixes (`bkit.testing.ciGenerated`). Route on the failed arrivals at Step 10, without asking:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
@@ -701,10 +706,10 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
 
          Then set `REVALIDATE_REASON` empty → Step 9 (re-validate at the regenerated head, then re-run the merge gate).
 
-       - **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed).
-     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
-     - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
-   - **Else** (12, 13, 15, 16, 18 or 20) → **Failure Path**.
+       - **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed). **If** `REGEN_OUTCOME` = `unchanged` **or** `undeclared` → hold `/bkit-debug {FID}` as `NEXT_STEP` first.
+     - **If** exit 1 **and** `MERGE_ASK` = true → hold `/bkit-debug {FID}` as `NEXT_STEP`, `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
+     - **Else** → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
+   - **Else** (13, 15, 16, 18 or 20) → **Failure Path**.
 2. Merge with an empty body and `--match-head`, so GitHub refuses when the head moved. Re-read the labels from the tracker, so that ` bkit [auto route]` rides the squash subject on `bkit:auto`. The labels are never carried forward from Step 1's `{LABELS}`. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when no tracker is wired or `ISSUE_ID` is empty:
    **Skip if** `ISSUE_ID` empty. Re-read the issue:
    ```bash
@@ -781,11 +786,12 @@ Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NE
    ```
 
    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
-   - **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
+   - **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and `NEXT_STEP` and go to the step `LIMIT_NEXT` named:
      ```bash
      "{BKIT}" counters grant --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --point=ship.merge --file="{STATUS}" --workflow=ship >/dev/null || exit 1
      ```
    - **If** the answer is `Stop` → create `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md` with the question, the answer and the line `Stopped by the owner; run stays IN_PROGRESS. /bkit-ship {FID} resumes at Step 10.`
+     **If** `NEXT_STEP` is held → add the line `Next step: {NEXT_STEP}` to the handover after the resume line, and end the final message with the same line.
      Then push it and release the lock. NEVER run `workflows fail`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=ship --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
@@ -830,7 +836,10 @@ Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NE
    ```bash
    "{BKIT}" runs gate --squash-of="{PR_NUMBER}" --repo="{OWNER_REPO}" --capstone-only --record="{STATUS}"
    ```
-   Hold `head` as `SQUASH_SHA`.
+   Route:
+   - **If** exit 0 → hold `head` as `SQUASH_SHA` → sub-step 2.
+   - **If** exit 12 → the squash commit's CI is red. Hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
+   - **Else** → **Failure Path**.
 2. Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is deleted only at its inspected landed tip and retained when origin refuses that conditional deletion; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    ```bash
diff --git a/.bkit/cli.md b/.bkit/cli.md
index 9ade18b70..83374ff93 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -393,7 +393,7 @@ Start, fail, hand over, summarize and close a phase workflow run; promote and li

<!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
 | `start` | workflow | **`--workflow`** **`--fid`** `--month` `--file` `--session-dir` `--lock-held` `--token` `--branch` | Take the feature lock and open a run (workflow-started unless resuming). |
-| `fail` | workflow | **`--workflow`** `--fid` `--month` `--file` `--token` `--max-exceeded` `--label` `--pr` `--step-number` `--step-title` `--sub-step` `--error-file` `--error` `--stderr-file` `--post` `--issue` `--session-dir` | Failure Path: workflow-failed row, abort rebase, release lock, clear sentinels (with --token); the bkit:failed labels and the failure comment. |
+| `fail` | workflow | **`--workflow`** `--fid` `--month` `--file` `--token` `--max-exceeded` `--label` `--pr` `--step-number` `--step-title` `--sub-step` `--error-file` `--error` `--stderr-file` `--next-step` `--post` `--issue` `--session-dir` | Failure Path: workflow-failed row, abort rebase, release lock, clear sentinels (with --token); the bkit:failed labels and the failure comment. |
 | `handover` | workflow | **`--workflow`** **`--fid`** `--month` `--push` `--flush` `--open-pr` `--ref` `--list-stray` `--worktree` `--owner-repo` `--post` | Keep a failed run's record: commit and push it on the feature branch, or land its logs and ledgers on dev (--push from dev / main, ship's --flush); print the handover comment. |
 | `close` | workflow | **`--workflow`** **`--fid`** `--month` `--file` `--pr-number` `--squash-sha` `--ref` `--owner-repo` `--outbox` `--record-step` `--message` `--label` `--verbose-ci-local` `--number` `--title` `--post` `--tree` `--ending` `--publish` `--flush` `--token` `--branch` `--session-dir` `--final-return` `--summary-file` `--summary` `--summary-missing` `--warning` `--line` `--suggest` | Grade compliance, workflow-done row, counter + outcome telemetry, report, artifact links; --flush lands ship's close on dev. |
 | `input` | workflow | **`--workflow`** **`--fid`** `--month` `--file` **`--run`** **`--prompt-file`** `--description-file` `--comments-file` `--plan` `--design` `--audit` | Write logs/{FID}/{workflow}-input-{run}.md: the session prompt, the issue description and each human comment, then the plan, design and audit reports, each section dated. |
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index 922e79d82..81dc29e03 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -393,7 +393,7 @@ Start, fail, hand over, summarize and close a phase workflow run; promote and li

<!-- prettier-ignore -->
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
 | `start` | workflow | **`--workflow`** **`--fid`** `--month` `--file` `--session-dir` `--lock-held` `--token` `--branch` | Take the feature lock and open a run (workflow-started unless resuming). |
-| `fail` | workflow | **`--workflow`** `--fid` `--month` `--file` `--token` `--max-exceeded` `--label` `--pr` `--step-number` `--step-title` `--sub-step` `--error-file` `--error` `--stderr-file` `--post` `--issue` `--session-dir` | Failure Path: workflow-failed row, abort rebase, release lock, clear sentinels (with --token); the bkit:failed labels and the failure comment. |
+| `fail` | workflow | **`--workflow`** `--fid` `--month` `--file` `--token` `--max-exceeded` `--label` `--pr` `--step-number` `--step-title` `--sub-step` `--error-file` `--error` `--stderr-file` `--next-step` `--post` `--issue` `--session-dir` | Failure Path: workflow-failed row, abort rebase, release lock, clear sentinels (with --token); the bkit:failed labels and the failure comment. |
 | `handover` | workflow | **`--workflow`** **`--fid`** `--month` `--push` `--flush` `--open-pr` `--ref` `--list-stray` `--worktree` `--owner-repo` `--post` | Keep a failed run's record: commit and push it on the feature branch, or land its logs and ledgers on dev (--push from dev / main, ship's --flush); print the handover comment. |
 | `close` | workflow | **`--workflow`** **`--fid`** `--month` `--file` `--pr-number` `--squash-sha` `--ref` `--owner-repo` `--outbox` `--record-step` `--message` `--label` `--verbose-ci-local` `--number` `--title` `--post` `--tree` `--ending` `--publish` `--flush` `--token` `--branch` `--session-dir` `--final-return` `--summary-file` `--summary` `--summary-missing` `--warning` `--line` `--suggest` | Grade compliance, workflow-done row, counter + outcome telemetry, report, artifact links; --flush lands ship's close on dev. |
 | `input` | workflow | **`--workflow`** **`--fid`** `--month` `--file` **`--run`** **`--prompt-file`** `--description-file` `--comments-file` `--plan` `--design` `--audit` | Write logs/{FID}/{workflow}-input-{run}.md: the session prompt, the issue description and each human comment, then the plan, design and audit reports, each section dated. |
diff --git a/.bkit/core/engine/audits/workflows/ship-invariants.test.ts b/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
index 48edca1eb..b37937899 100644
--- a/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
+++ b/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
@@ -941,3 +941,124 @@ describe("bkit-ship.md — issue-less runs and the main guard", () => {
     expect(route).toContain('"{BKIT}" locks release --kind=workflow --workflow=ship');
   });
 });
+
+// ---------------------------------------------------------------------------
+// Red CI names /bkit-debug (#911)
+// ---------------------------------------------------------------------------
+
+/** A list bullet with the continuation lines that follow it, up to the next bullet. */
+function bullets(block: string): string[] {
+  const out: string[] = [];
+  for (const line of block.split("\n")) {
+    if (/^\s*- /.test(line) || out.length === 0) out.push(line);
+    else out[out.length - 1] += `\n${line}`;
+  }
+  return out;
+}
+
+/** Top-level route arms (three-space `- **If**` / `- **Else**` bullets) of one block. */
+function routeArms(block: string): string[] {
+  const out: string[] = [];
+  for (const line of block.split("\n")) {
+    if (/^ {3}- \*\*(If|Else)\*\*/.test(line)) out.push(line);
+    else if (out.length > 0) out[out.length - 1] += `\n${line}`;
+  }
+  return out;
+}
+
+/** Bullets that end in the Failure Path or the Merge Question, bar a bare `Else` fall-through. */
+function redRouteBullets(arm: string): string[] {
+  return bullets(arm).filter(
+    (x) =>
+      /Failure Path|Merge Question/.test(x) &&
+      !/^\s*- \*\*Else\*\* → \*\*Failure Path\*\*\.?\s*$/m.test(x),
+  );
+}
+
+const HOLDS_DEBUG = /\/bkit-debug \{FID\}/;
+
+describe("bkit-ship.md — red CI names /bkit-debug", () => {
+  it("Step 10 holds /bkit-debug {FID} as NEXT_STEP on every red-run route to the Failure Path or the Merge Question, and on no other", () => {
+    const step10 = section(readShip(), /^## .*Step 10 — /, /^## /);
+    const sub1 = section(step10, /^1\. Assert the gate/, /^2\. /);
+    const arms = routeArms(sub1);
+    const red = arms.filter((a) => /^ {3}- \*\*If\*\* exit 12\b/.test(a));
+    expect(
+      red.length,
+      "need a regenerable and a non-regenerable exit 12 arm",
+    ).toBeGreaterThanOrEqual(2);
+    for (const arm of red) {
+      expect(arm, "exit 12 arm holds no NEXT_STEP").toMatch(/NEXT_STEP/);
+      expect(arm).toMatch(HOLDS_DEBUG);
+      const redRoutes = redRouteBullets(arm);
+      for (const b of redRoutes) {
+        expect(b, `no NEXT_STEP held on: ${b.split("\n")[0]}`).toMatch(/NEXT_STEP/);
+      }
+    }
+    const regenerable = red.find((a) => /regenerable.*= true/.test(a))!;
+    expect(regenerable).toMatch(/unchanged[^\n]*NEXT_STEP|NEXT_STEP[^\n]*unchanged/);
+    expect(regenerable).toMatch(/MERGE_ASK[^\n]*NEXT_STEP|NEXT_STEP[^\n]*MERGE_ASK/);
+    for (const arm of arms.filter((a) => !red.includes(a))) {
+      expect(arm, "a non-red arm holds NEXT_STEP").not.toMatch(/NEXT_STEP/);
+    }
+  });
+
+  it("Step 2 holds NEXT_STEP on a failed check in the CI wait of a PR ship opened", () => {
+    const step2 = section(readShip(), /^## .*Step 2 — /, /^## /);
+    const sub5 = section(step2, /^5\. \*\*If\*\* `SHIP_OPENED_PR` = true/, /^6\. /);
+    expect(sub5).not.toBe("");
+    const route = sub5.slice(sub5.indexOf("Route:"));
+    const failedArms = bullets(route).filter((b) =>
+      /any check failed|^\s*- \*\*Else\*\* → \*\*Failure Path\*\*/.test(b),
+    );
+    expect(failedArms.length).toBeGreaterThanOrEqual(2);
+    for (const b of failedArms) {
+      expect(b, "Step 2 failed check holds no NEXT_STEP").toMatch(/NEXT_STEP/);
+      expect(sub5).toMatch(HOLDS_DEBUG);
+    }
+  });
+
+  it("the Merge Question's Stop arm names NEXT_STEP when held and Try again clears it", () => {
+    const mq = section(readShip(), /^## .*Merge Question$/, /^### /);
+    const tryAgain = section(
+      mq,
+      /^ {3}- \*\*If\*\* the answer is `Try again`/,
+      /^ {3}- \*\*If\*\* the answer is `Stop`/,
+    );
+    expect(tryAgain).toMatch(/clear[^.\n]*NEXT_STEP/);
+    const stop = section(mq, /^ {3}- \*\*If\*\* the answer is `Stop`/, /^ {3}- \*\*Else\*\*/);
+    expect(stop, "Stop handover lacks Next step line").toMatch(/Next step: \{NEXT_STEP\}/);
+    expect(stop).toMatch(/final message/);
+    expect(stop).toMatch(/NEXT_STEP[^\n]*held|held[^\n]*NEXT_STEP/);
+  });
+
+  it("Close Workflow routes a red squash capstone to the Failure Path holding NEXT_STEP", () => {
+    const step12 = section(readShip(), /^## .*Step 12 — /, /^## /);
+    const sub1 = section(step12, /^1\. Assert that the capstone/, /^2\. /);
+    expect(sub1, "no Route: after runs gate --capstone-only").toMatch(/Route:/);
+    const route = sub1.slice(sub1.indexOf("Route:"));
+    expect(route).toMatch(/Failure Path/);
+    expect(route).toMatch(/NEXT_STEP/);
+    expect(route).toMatch(HOLDS_DEBUG);
+  });
+
+  it("the Failure Path passes --next-step only when NEXT_STEP is held and ends the final message with it", () => {
+    const block = failurePathBlock(readShip());
+    const fence = fences(block).find((f) => /workflows fail --post/.test(f));
+    expect(fence, "workflows fail fence lacks --next-step=").toMatch(/--next-step=/);
+    const step1 = section(block, /^1\. /, /^2\. /);
+    expect(step1.replace(/```bash[\s\S]*?```/g, "")).toMatch(
+      /--next-step[^\n]*NEXT_STEP|NEXT_STEP[^\n]*--next-step/,
+    );
+    const step6 = block.slice(block.search(/^6\. /m));
+    expect(step6).toMatch(/Next step:/);
+    expect(step6.indexOf("Next step:")).toBeGreaterThan(step6.indexOf("ship-summary.md"));
+  });
+
+  it("the Failure Path re-runs workflows fail without --next-step on exit 2", () => {
+    const block = failurePathBlock(readShip());
+    const step1 = section(block, /^1\. /, /^2\. /);
+    expect(step1, "no exit 2 retry without --next-step").toMatch(/exit 2/);
+    expect(step1).toMatch(/without `?--next-step/);
+  });
+});
diff --git a/.bkit/core/engine/commands/workflow/workflows.test.ts b/.bkit/core/engine/commands/workflow/workflows.test.ts
index e95fcaf90..bcab5aae5 100644
--- a/.bkit/core/engine/commands/workflow/workflows.test.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -851,6 +851,60 @@ describe("bkit workflows fail", () => {
     expect((await run(cwd, wf("fail", "build"))).json.comment).toBeNull();
   });
 
+  it("bkit workflows fail --next-step adds a Next step line to the failure comment and prints nextStep", async () => {
+    const cwd = repo();
+    write(cwd, "tmp/error.md", "CI is red\n\n");
+    const r = await run(
+      cwd,
+      wf(
+        "fail",
+        "ship",
+        "--step-number=10",
+        "--step-title=Merge Gate + Merge PR",
+        "--error-file=tmp/error.md",
+        "--next-step=/bkit-debug 911-ship-failed-merge",
+      ),
+    );
+    expect(r.code).toBe(0);
+    expect(r.json.nextStep).toBe("/bkit-debug 911-ship-failed-merge");
+    expect(r.json.comment).toContain("Next step: `/bkit-debug 911-ship-failed-merge`");
+    expect(r.json.comment).toContain("Error: CI is red");
+  });
+
+  it("bkit workflows fail refuses a multi-line or non-/bkit- --next-step before any write", async () => {
+    const cwd = repo();
+    const started = await run(cwd, wf("start", "build"));
+    const token = `--token=${started.json.lock.token}`;
+    const before = fs.readFileSync(statusOf(cwd), "utf-8");
+    for (const bad of ["/bkit-debug a\n/bkit-debug b", "rm -rf /", "bkit-debug x"]) {
+      const r = await run(cwd, wf("fail", "build", `--month=${M}`, token, `--next-step=${bad}`));
+      expect(r.code).toBe(2);
+      expect(r.err).toContain("--next-step must be one /bkit-* command line");
+    }
+    expect(fs.readFileSync(statusOf(cwd), "utf-8")).toBe(before);
+    expect(rows(statusOf(cwd)).some((x) => x.type === "workflow-failed")).toBe(false);
+    expect(fs.existsSync(path.join(cwd, REL, ".lock"))).toBe(true);
+  });
+
+  it("bkit workflows fail treats an empty --next-step as absent", async () => {
+    const cwd = repo();
+    write(cwd, "tmp/error.md", "CI is red\n\n");
+    const r = await run(
+      cwd,
+      wf(
+        "fail",
+        "ship",
+        "--step-number=10",
+        "--step-title=Merge Gate + Merge PR",
+        "--error-file=tmp/error.md",
+        "--next-step=",
+      ),
+    );
+    expect(r.code).toBe(0);
+    expect(r.json.nextStep).toBeNull();
+    expect(r.json.comment).not.toContain("Next step:");
+  });
+
   it("a debug run in SOAK mode always needs a handover", async () => {
     const cwd = repo();
     write(
diff --git a/.bkit/core/engine/commands/workflow/workflows.ts b/.bkit/core/engine/commands/workflow/workflows.ts
index d17858d63..3c15129ff 100644
--- a/.bkit/core/engine/commands/workflow/workflows.ts
+++ b/.bkit/core/engine/commands/workflow/workflows.ts
@@ -403,6 +403,10 @@ async function failVerb(ctx: RunContext): Promise<number> {
   const token = str(ctx.flags.token) || undefined;
   if (token !== undefined && fid === undefined)
     throw new CommandError(EXIT.USAGE, "--token needs --fid");
+  // Empty is absent; anything else is one /bkit-* command line, checked before any write.
+  const nextStep = str(ctx.flags.nextStep) || undefined;
+  if (nextStep !== undefined && (/[\r\n]/.test(nextStep) || !nextStep.startsWith("/bkit-")))
+    throw new CommandError(EXIT.USAGE, "--next-step must be one /bkit-* command line");
 
   // State only for a run that took the lock: without the token the failure came
   // before Step 1 locked, and nothing here is this run's to change.
@@ -452,6 +456,7 @@ async function failVerb(ctx: RunContext): Promise<number> {
       subStep: str(ctx.flags.subStep),
       error: state.removeFailed ? `${error}; Lock removal failed` : error,
       stderrFile: str(ctx.flags.stderrFile) || undefined,
+      ...(nextStep === undefined ? {} : { lines: [`Next step: \`${nextStep}\``] }),
     });
   }
   if (ctx.flags.post === true && comment === null)
@@ -489,6 +494,7 @@ async function failVerb(ctx: RunContext): Promise<number> {
     trackerState: failedState,
     prState,
     comment,
+    nextStep: nextStep ?? null,
     commentFile: commentFileOf(ctx.cwd, comment, ctx),
     ...(tracker === undefined ? {} : { tracker }),
     ...(labelsWrite === undefined ? {} : { labelsWrite }),
@@ -2237,6 +2243,11 @@ export const workflowsCommand: CommandSpec = {
           type: "string",
           help: "the failed shell command's stderr (last 20 lines kept)",
         },
+        {
+          name: "next-step",
+          type: "string",
+          help: "one /bkit-* command line to name as the next step: adds a `Next step:` line to the failure comment (empty = none)",
+        },
         {
           ...POST_FLAG,
           help: "post the failure comment (needs --step-number) to the --fid / --issue issue and write its failed labels; prints `tracker` and `labelsWrite`",
@@ -2261,6 +2272,7 @@ export const workflowsCommand: CommandSpec = {
         trackerState: "the Linear or Jira state for the failed issue (null under github, none)",
         prState: "the --pr PR's state, or null",
         comment: "the failure comment body (with --step-number), else null",
+        nextStep: "the --next-step command line, or null",
         commentFile: COMMENT_FILE_OUTPUT,
         tracker: TRACKER_OUTPUT,
         labelsWrite:
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
index bd513a73e..bab18b703 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
@@ -69,9 +69,11 @@ _No tracker connected, skip step._
 
 1. Write the error message / tool response to `{OUTBOX_ROOT}/error.md` (`--error-file` dropped while `{OUTBOX_ROOT}` is not held). `{STDERR_FILE}` = `{OUTBOX}/stderr.log` holding the failed shell command's stderr — drop `--stderr-file` when the failure was not a shell command or `{OUTBOX}` is not set yet; drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when a `counters route` exit 1 (a `MAX_*` limit) sent the run here; `{LABEL_FLAGS}` = one `--label=<name>` per current `LABELS` entry. Abort any in-progress rebase or merge, record the failure, release the lock, delete the session folder (drop `--session-dir` while `{SESSION_DIR}` is not held), clear sentinels — **state only, no `add` / `commit` / `push`**; a MERGED PR moves the issue to `bkit:merged` plus `bkit:failed`, else the prior phase label persists:
    ```bash
-   "{BKIT}" workflows fail --post --issue="{ISSUE_ID}" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}" --session-dir="{SESSION_DIR}"
+   "{BKIT}" workflows fail --post --issue="{ISSUE_ID}" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}" --next-step="{NEXT_STEP}" --session-dir="{SESSION_DIR}"
    ```
+   Drop `--next-step` when `NEXT_STEP` is not held.
    Hold `handoverNeeded` as `HANDOVER_NEEDED`, `labels` as `LABELS` and `trackerState` as `TRACKER_STATE`.
+   **If** exit 2 **and** `--next-step` was passed → the value was refused before any write: clear `NEXT_STEP` and run the block again without `--next-step`, then route on that exit.
    **If** exit non-zero → log `Lock removal failed` with the printed `lock` to stderr, then continue.
 2.
 3. **If** `HANDOVER_NEEDED` = true → step 4. **Else** → step 5.
@@ -91,7 +93,7 @@ _No tracker connected, skip step._
    The block posts a non-null `comment`, which links the handover only where the flush pushed it.
    **If** `tracker.done` = false → post `comment` via the tracker MCP per the header's fallback section.
    **If** the push failed → do not claim success on the tracker.
-6. **STOP**, no further downstream steps. **If** `SUMMARY_VERDICT` = FAIL → the final message is `ship-summary.md` content verbatim.
+6. **STOP**, no further downstream steps. **If** `SUMMARY_VERDICT` = FAIL → the final message is `ship-summary.md` content verbatim. **If** `NEXT_STEP` is held → the final message's last line is `Next step: {NEXT_STEP}`, after any verbatim summary.
 
 ---
 
@@ -256,14 +258,16 @@ _No tracker connected, skip step._
    ```bash
    "{BKIT}" runs wait --pr="{PR_NUMBER}" --until=present --budget-s=120 || exit 1
    "{BKIT}" runs wait --pr="{PR_NUMBER}" --until=completed
-   "{BKIT}" prs checks --number="{PR_NUMBER}" >/dev/null
+   "{BKIT}" prs checks --number="{PR_NUMBER}"
    ```
-   Route:
+   Hold `failed` as `CHECKS_FAILED`. Route:
    - **If** exit 0 → next sub-step.
+   - **If** exit 1 **and** `CHECKS_FAILED` > 0 (any check failed: the CI run is red) → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
    - **If** exit 80 → read the checks with `pull_request_read` (`get_status`):
-     - **If** there is no check, **or** any check failed or is pending → **Failure Path**.
+     - **If** any check failed → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
+     - **If** there is no check, **or** any check is pending → **Failure Path**.
      - **Else** → next sub-step.
-   - **Else** → **Failure Path**.
+   - **Else** (the rollup is unreadable) → **Failure Path**.
 6. Finish (bookkeeping to `$BOOK_ROOT`, no branch commit):
    ```bash
    "{BKIT}" steps done --workflow=ship --step=ship-worktree-setup --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md" --commit=none >/dev/null || exit 1
@@ -642,6 +646,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
      - **If** exit 0 → set `{REVALIDATE_REASON}` = `gate-refusal` → Step 9.
      - **If** exit 1 **and** `MERGE_ASK` = true → set `{REVALIDATE_REASON}` = `gate-refusal`, `LIMIT_NEXT` = Step 9 → **Merge Question**.
      - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
+   - **If** exit 12 **and** `regenerable` = false → the CI run is red and regenerating cannot fix it. Hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
    - **If** exit 12 **and** `regenerable` = true → every failed CI step is one `bkit:generate` fixes (`bkit.testing.ciGenerated`). Route on the failed arrivals at Step 10, without asking:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
@@ -665,10 +670,10 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
 
          Then set `REVALIDATE_REASON` empty → Step 9 (re-validate at the regenerated head, then re-run the merge gate).
 
-       - **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed).
-     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
-     - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
-   - **Else** (12, 13, 15, 16, 18 or 20) → **Failure Path**.
+       - **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed). **If** `REGEN_OUTCOME` = `unchanged` **or** `undeclared` → hold `/bkit-debug {FID}` as `NEXT_STEP` first.
+     - **If** exit 1 **and** `MERGE_ASK` = true → hold `/bkit-debug {FID}` as `NEXT_STEP`, `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
+     - **Else** → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
+   - **Else** (13, 15, 16, 18 or 20) → **Failure Path**.
 2. Merge with an empty body and `--match-head`, so GitHub refuses when the head moved. Re-read the labels from the tracker, so that ` bkit [auto route]` rides the squash subject on `bkit:auto`. The labels are never carried forward from Step 1's `{LABELS}`. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when no tracker is wired:
    ```bash
    "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --ship-retry --owner-repo="{OWNER_REPO}" {LABEL_FLAGS} --expect-merged
@@ -740,11 +745,12 @@ Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NE
    ```
 
    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
-   - **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
+   - **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and `NEXT_STEP` and go to the step `LIMIT_NEXT` named:
      ```bash
      "{BKIT}" counters grant --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --point=ship.merge --file="{STATUS}" --workflow=ship >/dev/null || exit 1
      ```
    - **If** the answer is `Stop` → create `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md` with the question, the answer and the line `Stopped by the owner; run stays IN_PROGRESS. /bkit-ship {FID} resumes at Step 10.`
+     **If** `NEXT_STEP` is held → add the line `Next step: {NEXT_STEP}` to the handover after the resume line, and end the final message with the same line.
      Then push it and release the lock. NEVER run `workflows fail`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=ship --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
@@ -789,7 +795,10 @@ Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NE
    ```bash
    "{BKIT}" runs gate --squash-of="{PR_NUMBER}" --repo="{OWNER_REPO}" --capstone-only --record="{STATUS}"
    ```
-   Hold `head` as `SQUASH_SHA`.
+   Route:
+   - **If** exit 0 → hold `head` as `SQUASH_SHA` → sub-step 2.
+   - **If** exit 12 → the squash commit's CI is red. Hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
+   - **Else** → **Failure Path**.
 2. Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is deleted only at its inspected landed tip and retained when origin refuses that conditional deletion; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
    ```bash
    "{BKIT}" workflows close --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --pr-number="{PR_NUMBER}" --squash-sha="{SQUASH_SHA}" --owner-repo="{OWNER_REPO}" --outbox="{OUTBOX}" --flush --token="{LOCK_TOKEN}" --branch="{SHIP_BRANCH}" --number=12 --post --title="Close Workflow" --final-return --summary="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --summary-missing="PR was already merged — no ship summary this run." --session-dir="{SESSION_DIR}"; rc=$?
diff --git a/.bkit/core/workflows/bkit-ship.md b/.bkit/core/workflows/bkit-ship.md
index 92e7725a9..ec0bf6b5b 100644
--- a/.bkit/core/workflows/bkit-ship.md
+++ b/.bkit/core/workflows/bkit-ship.md
@@ -94,9 +94,11 @@ description: "Ship Feature — Autonomous merge and archive"
 
 1. Write the error message / tool response to `{OUTBOX_ROOT}/error.md` (`--error-file` dropped while `{OUTBOX_ROOT}` is not held). `{STDERR_FILE}` = `{OUTBOX}/stderr.log` holding the failed shell command's stderr — drop `--stderr-file` when the failure was not a shell command or `{OUTBOX}` is not set yet; drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when a `counters route` exit 1 (a `MAX_*` limit) sent the run here; `{LABEL_FLAGS}` = one `--label=<name>` per current `LABELS` entry. Abort any in-progress rebase or merge, record the failure, release the lock, delete the session folder (drop `--session-dir` while `{SESSION_DIR}` is not held), clear sentinels — **state only, no `add` / `commit` / `push`**; a MERGED PR moves the issue to `bkit:merged` plus `bkit:failed`, else the prior phase label persists:
    ```bash
-   "{BKIT}" workflows fail --post --issue="{ISSUE_ID}" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}" --session-dir="{SESSION_DIR}"
+   "{BKIT}" workflows fail --post --issue="{ISSUE_ID}" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}" --next-step="{NEXT_STEP}" --session-dir="{SESSION_DIR}"
    ```
+   Drop `--next-step` when `NEXT_STEP` is not held.
    Hold `handoverNeeded` as `HANDOVER_NEEDED`, `labels` as `LABELS` and `trackerState` as `TRACKER_STATE`.
+   **If** exit 2 **and** `--next-step` was passed → the value was refused before any write: clear `NEXT_STEP` and run the block again without `--next-step`, then route on that exit.
    **If** exit non-zero → log `Lock removal failed` with the printed `lock` to stderr, then continue.
 2. <!-- bkit:tracker true start -->
    **Skip if** `ISSUE_ID` empty. **If** `tracker.done` = false → post `comment` via the tracker MCP per the header's fallback section. **If** `labelsWrite.done` = false → apply the printed `labels` / `trackerState` via the tracker MCP (**Labels** fallback).
@@ -118,7 +120,7 @@ description: "Ship Feature — Autonomous merge and archive"
    The block posts a non-null `comment`, which links the handover only where the flush pushed it.
    **If** `tracker.done` = false → post `comment` via the tracker MCP per the header's fallback section.
    **If** the push failed → do not claim success on the tracker.
-6. **STOP**, no further downstream steps. **If** `SUMMARY_VERDICT` = FAIL → the final message is `ship-summary.md` content verbatim.<!-- bkit:tracker true start --> Line 1 of the final message = the no-issue warning, when one was emitted.<!-- bkit:tracker true end -->
+6. **STOP**, no further downstream steps. **If** `SUMMARY_VERDICT` = FAIL → the final message is `ship-summary.md` content verbatim.<!-- bkit:tracker true start --> Line 1 of the final message = the no-issue warning, when one was emitted.<!-- bkit:tracker true end --> **If** `NEXT_STEP` is held → the final message's last line is `Next step: {NEXT_STEP}`, after any verbatim summary.
 
 ---
 
@@ -336,14 +338,16 @@ description: "Ship Feature — Autonomous merge and archive"
    ```bash
    "{BKIT}" runs wait --pr="{PR_NUMBER}" --until=present --budget-s=120 || exit 1
    "{BKIT}" runs wait --pr="{PR_NUMBER}" --until=completed
-   "{BKIT}" prs checks --number="{PR_NUMBER}" >/dev/null
+   "{BKIT}" prs checks --number="{PR_NUMBER}"
    ```
-   Route:
+   Hold `failed` as `CHECKS_FAILED`. Route:
    - **If** exit 0 → next sub-step.
+   - **If** exit 1 **and** `CHECKS_FAILED` > 0 (any check failed: the CI run is red) → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
    - **If** exit 80 → read the checks with `pull_request_read` (`get_status`):
-     - **If** there is no check, **or** any check failed or is pending → **Failure Path**.
+     - **If** any check failed → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
+     - **If** there is no check, **or** any check is pending → **Failure Path**.
      - **Else** → next sub-step.
-   - **Else** → **Failure Path**.
+   - **Else** (the rollup is unreadable) → **Failure Path**.
 6. Finish (bookkeeping to `$BOOK_ROOT`, no branch commit):
    ```bash
    "{BKIT}" steps done --workflow=ship --step=ship-worktree-setup --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md" --commit=none >/dev/null || exit 1
@@ -722,6 +726,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
      - **If** exit 0 → set `{REVALIDATE_REASON}` = `gate-refusal` → Step 9.
      - **If** exit 1 **and** `MERGE_ASK` = true → set `{REVALIDATE_REASON}` = `gate-refusal`, `LIMIT_NEXT` = Step 9 → **Merge Question**.
      - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
+   - **If** exit 12 **and** `regenerable` = false → the CI run is red and regenerating cannot fix it. Hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
    - **If** exit 12 **and** `regenerable` = true → every failed CI step is one `bkit:generate` fixes (`bkit.testing.ciGenerated`). Route on the failed arrivals at Step 10, without asking:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
@@ -745,10 +750,10 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
 
          Then set `REVALIDATE_REASON` empty → Step 9 (re-validate at the regenerated head, then re-run the merge gate).
 
-       - **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed).
-     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
-     - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
-   - **Else** (12, 13, 15, 16, 18 or 20) → **Failure Path**.
+       - **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed). **If** `REGEN_OUTCOME` = `unchanged` **or** `undeclared` → hold `/bkit-debug {FID}` as `NEXT_STEP` first.
+     - **If** exit 1 **and** `MERGE_ASK` = true → hold `/bkit-debug {FID}` as `NEXT_STEP`, `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
+     - **Else** → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
+   - **Else** (13, 15, 16, 18 or 20) → **Failure Path**.
 2. Merge with an empty body and `--match-head`, so GitHub refuses when the head moved. Re-read the labels from the tracker, so that ` bkit [auto route]` rides the squash subject on `bkit:auto`. The labels are never carried forward from Step 1's `{LABELS}`. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when no tracker is wired<!-- bkit:tracker true start --> or `ISSUE_ID` is empty<!-- bkit:tracker true end -->:
    <!-- bkit:tracker true start -->
    **Skip if** `ISSUE_ID` empty. Re-read the issue:
@@ -827,11 +832,12 @@ Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NE
    ```
 
    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
-   - **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
+   - **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and `NEXT_STEP` and go to the step `LIMIT_NEXT` named:
      ```bash
      "{BKIT}" counters grant --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --point=ship.merge --file="{STATUS}" --workflow=ship >/dev/null || exit 1
      ```
    - **If** the answer is `Stop` → create `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md` with the question, the answer and the line `Stopped by the owner; run stays IN_PROGRESS. /bkit-ship {FID} resumes at Step 10.`
+     **If** `NEXT_STEP` is held → add the line `Next step: {NEXT_STEP}` to the handover after the resume line, and end the final message with the same line.
      Then push it and release the lock. NEVER run `workflows fail`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=ship --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
@@ -876,7 +882,10 @@ Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NE
    ```bash
    "{BKIT}" runs gate --squash-of="{PR_NUMBER}" --repo="{OWNER_REPO}" --capstone-only --record="{STATUS}"
    ```
-   Hold `head` as `SQUASH_SHA`.
+   Route:
+   - **If** exit 0 → hold `head` as `SQUASH_SHA` → sub-step 2.
+   - **If** exit 12 → the squash commit's CI is red. Hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
+   - **Else** → **Failure Path**.
 2. Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is deleted only at its inspected landed tip and retained when origin refuses that conditional deletion; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
    <!-- bkit:tracker true start -->
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index dcdc50354..535193ae1 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -1372,7 +1372,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-annotations`, `bkit-audit-ci-performance`
 - drift:
-  - `bkit-ship:656`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
+  - `bkit-ship:660`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
     - kept: Re-validate probes for an existing run first and dispatches only when the head has none, which happens when the head commit carries `[skip ci]` or GitHub started no run
 
 ```text
@@ -1685,7 +1685,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-ci-performance`
 - drift:
-  - `bkit-ship:656`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
+  - `bkit-ship:660`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
     - kept: Re-validate probes for an existing run first and dispatches only when the head has none, which happens when the head commit carries `[skip ci]` or GitHub started no run
 
 ```text
@@ -10540,6 +10540,7 @@ Save the active knowledge rows for the reviewers, who have no shell:
 [prs] **Scope:** Merge the feature's PR into the default integration branch.
 [commits; docs-commits; workflow-pushes] **Status branch:** From Step 2 all steps write `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (`{STATUS}`); `BOOK_ROOT` = `{WORKTREE_PATH}`. Stage path-scoped via `bkit ledgers commit`; NEVER stage all files (`-A`) or blanket `docs/`. One commit per flush block: Commit + Push Bookkeeping → `docs({FID}): ship bookkeeping bkit [skip ci]` → push `{SHIP_BRANCH}` (pre-merge: docs, logs, ledgers, skill removals); Close Workflow → `docs({FID}): ship DONE bkit [skip ci]`, **Failure Path** → `chore({FID}): ship FAILED bkit [skip ci]` → push `dev` from a throwaway `origin/dev` checkout; a refused close push → close PR.
 **Single-write contract:** Every step before the flush creates no git object. Never route back to the **Failure Path**: log the error and continue to the flush.
+**If** exit 2 **and** `--next-step` was passed → the value was refused before any write: clear `NEXT_STEP` and run the block again without `--next-step`, then route on that exit.
 **If** exit non-zero → log `Lock removal failed` with the printed `lock` to stderr, then continue.
 **If** `SUMMARY_VERDICT` = FAIL → read `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md` now, because the flush removes the worktree.
 **If** the push failed → do not claim success on the tracker.
@@ -10557,8 +10558,10 @@ Assert `PR_NUMBER` non-empty and `PR_BASE` = dev. **If** the assertion fails →
 **Else** → next sub-step.
 Read the PR's head SHA:
 [honest-reporting] **If** `SHIP_OPENED_PR` = true → wait for CI on the new PR first, then assert its check rollup green:
+**If** exit 1 **and** `CHECKS_FAILED` > 0 (any check failed: the CI run is red) → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
 **If** exit 80 → read the checks with `pull_request_read` (`get_status`):
-**If** there is no check, **or** any check failed or is pending → **Failure Path**.
+**If** any check failed → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
+**If** there is no check, **or** any check is pending → **Failure Path**.
 Finish (bookkeeping to `$BOOK_ROOT`, no branch commit):
 Run **Confirm Assumed Items** → Step 3.
 Mechanical checks passed (`steps gate`, `steps finish`)
@@ -10616,11 +10619,13 @@ CI re-validated (`runs revalidate`)
 [polls-loops] **If** exit 17 (non-bookkeeping change past `VALIDATED_HEAD`) → set `RECONCILE_REQUIRED` = true → route the recorded failed arrival to reconciliation:
 [polls-loops] **If** exit 11 (in progress — poll), 14 (stale green) **or** 10 (no run) → route on the failed arrivals at Step 10, without asking:
 **If** exit 1 **and** `MERGE_ASK` = true → set `{REVALIDATE_REASON}` = `gate-refusal`, `LIMIT_NEXT` = Step 9 → **Merge Question**.
+**If** exit 12 **and** `regenerable` = false → the CI run is red and regenerating cannot fix it. Hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
 **If** exit 12 **and** `regenerable` = true → every failed CI step is one `bkit:generate` fixes (`bkit.testing.ciGenerated`). Route on the failed arrivals at Step 10, without asking:
 **If** exit 0 **and** `REGEN_OUTCOME` = committed → push the fix, and NEVER force:
 Then set `REVALIDATE_REASON` empty → Step 9 (re-validate at the regenerated head, then re-run the merge gate).
-**Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed).
-**If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
+**Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed). **If** `REGEN_OUTCOME` = `unchanged` **or** `undeclared` → hold `/bkit-debug {FID}` as `NEXT_STEP` first.
+**If** exit 1 **and** `MERGE_ASK` = true → hold `/bkit-debug {FID}` as `NEXT_STEP`, `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
+**Else** → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
 [integration-merge] Merge with an empty body and `--match-head`, so GitHub refuses when the head moved. Re-read the labels from the tracker, so that ` bkit [auto route]` rides the squash subject on `bkit:auto`. The labels are never carried forward from Step 1's `{LABELS}`. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when no tracker is wired<!-- bkit:tracker true start --> or `ISSUE_ID` is empty<!-- bkit:tracker true end -->:
 Merge gate asserted (`runs gate`)
 Failed arrivals counted against `ship.merge.maxAttempts` (`counters route`)
@@ -10635,6 +10640,7 @@ Used-up limit given one more allowance only on `Try again` (`counters grant`)
 Fast-forward local `dev` to `origin/dev`, then finish:
 Local `dev` synced (`branches sync-dev`)
 Assert that the capstone passed at the squash commit. The block records the squash-merge CI verdict (`ship-merge-ci`) before routing:
+**If** exit 12 → the squash commit's CI is red. Hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
 **If** `CLOSE_VIA` = close-pr-open → drop `--ref`, and gate with `--file="{STATUS}"`.
 Squash-merge CI capstone green (`runs gate`)
 Close landed (`workflows close`)
@@ -10668,7 +10674,8 @@ Guarded cleanup and retained paths/refs reported, back in the repo root
 **If** `state` = MERGED → record the resume marker → Step 11:
 **If** `state` = MERGED → Step 11.
 **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
-**If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
+**If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and `NEXT_STEP` and go to the step `LIMIT_NEXT` named:
+**If** `NEXT_STEP` is held → add the line `Next step: {NEXT_STEP}` to the handover after the resume line, and end the final message with the same line.
 ```
 
 ### Prompts
diff --git a/.bkit/version b/.bkit/version
index 79bf5282c..e5df4bad0 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -19,7 +19,7 @@
     ".claude/commands/bkit-debug.md": "374d4520e78a4421fa1e3227e3c5e184feb08706b2aaafdc290c6e0835c78333",
     ".claude/commands/bkit-design.md": "19fc3688e1f0063c2ff02b61921c6c3153f5d3892eb08c812643507539f8790a",
     ".claude/commands/bkit-plan.md": "21e65d37fb3fede54a1edbb0d6a71e589178a0d6991b007b24770aedf818afde",
-    ".claude/commands/bkit-ship.md": "cd5d74a47ab60997bd3febe65058f6104a0444ae7676e87827d87d6065c06f13",
+    ".claude/commands/bkit-ship.md": "af43cc8f33a28130a46239ee43e515da6ca6ca90cdd96135bd5123896800a1c0",
     ".claude/agents/bkit-build-challenge-1.md": "20ff6fcaf48d5a6418c696c88e796101c34083326b8353bf6ec766422c4c734f",
     ".claude/agents/bkit-build-challenge-2.md": "0ef8a829af9b89602a75ac257a093e4a47169ca9c2a4c216d6f11937e2e9c48f",
     ".claude/agents/bkit-build-install-skills.md": "0249b5fe6550c45afe95972d1d3f4a65f7e159a74038ce9179ca1fceb29e1d12",
@@ -51,7 +51,7 @@
     ".cursor/commands/bkit-debug.md": "0c431c1245effbc9d70ab3d928cc739c8c6eb72807c6afcf51889dd16c2b83f6",
     ".cursor/commands/bkit-design.md": "50503d506d3be97b176612647f202e4428e43446a3e29c9f63c931ebdc32f2c1",
     ".cursor/commands/bkit-plan.md": "3ce05ec47616b860b785c128c5a80e3e81dda9951d84744a8f8c93063c3a91ed",
-    ".cursor/commands/bkit-ship.md": "34039286cfd30515dbcabdc2b0de3168ed02a835b317821b7804dcebaed65b05",
+    ".cursor/commands/bkit-ship.md": "8c49ca8b59ef6a7ac2042fb242239705279e84763386f1bb68344aeb6a998333",
     ".cursor/agents/bkit-build-challenge-1.md": "91f6446c505416d377dcbabcc49030e704384980f3ed232694069108504c2dab",
     ".cursor/agents/bkit-build-challenge-2.md": "6399d8b34ff1be2a63b77b911fd8321f80bd0bf64550103f809cdf5194820c24",
     ".cursor/agents/bkit-build-install-skills.md": "9f77d5ce2bc7e5d1c60d8860b5a06d81091f9194522607151a76838fc895da6d",
@@ -109,7 +109,7 @@
     ".opencode/commands/bkit-debug.md": "22160c578bd2f06c9e674fe524accae793a977d206185814d04ccd99e75bbc6d",
     ".opencode/commands/bkit-design.md": "43ef687878db97f39336b4e91ffe1adb845048999b5b686864898b4cc58a09a7",
     ".opencode/commands/bkit-plan.md": "afd4b5bb5a1c7d14ec9d4257ebe2f415e57c2e6ad625ec8c993c429acc886a42",
-    ".opencode/commands/bkit-ship.md": "c1d9cbcd11e7ea6cd6fd628080f514b396383b8f2a2e9078dbbdb88b8d9a546d",
+    ".opencode/commands/bkit-ship.md": "a68f921807dfa49cde8e480f5644540ce8030bb7da427c22ed8cfa3befcf8f1c",
     ".claude/agents/bkit-design-spike.md": "334a96f4f3fdb0a190c8d4cca32c38bee577138fd4acf51036302b325964e889",
     ".cursor/agents/bkit-design-spike.md": "06729e7a0ffa9f98b109433b56dcfc1e3d0afad12c55250a28eee91549ea45a3",
     ".opencode/agents/bkit-design-spike.md": "28e5d35f911887fe7b08a74983a48fc131cd5693b7546af8623e9bc75f8e54f4",
@@ -254,7 +254,7 @@
     ".codex/hooks/bkit-rules.cjs": "8aee2cde5448c083ae0dc07a4f1db86ce7e815a2a2eafe54b886b7f4393cab91",
     ".opencode/plugin/bkit-rules.js": "417d3ca107ebf005060953a17340620e1fcfb5bcdf491316a937e0c747b0377e",
     ".bkit/router.md": "c20d006757e350c173da94686d48500bc83e12d9f7bb6ff5911e47e332e45eab",
-    ".bkit/cli.md": "c4c393884cb5856641b5f3ac49fd668d440f9e12d629461a78e4d674fb9d7ab4",
+    ".bkit/cli.md": "8b4ccd2af5ff2f83401ef1b071515e5f75cee7972dd5333ea5d2b730e106836b",
     ".claude/agents/bkit-build-plan-tests.md": "be39bd5adc8be2ae16f0505ae26d91a6fe958ae7f14b51014c30ca8ba03dc076",
     ".cursor/agents/bkit-build-plan-tests.md": "5e48a01125f56c590dbd8e4726248a55bbb32604cf642bd318ae10dbf0953171",
     ".opencode/agents/bkit-build-plan-tests.md": "380195671bad5f056b3e5391c9b8505007584f4e341d8dbe93f3fe6114c7d755",
diff --git a/.claude/commands/bkit-ship.md b/.claude/commands/bkit-ship.md
index eeef0674e..b1df16a65 100644
--- a/.claude/commands/bkit-ship.md
+++ b/.claude/commands/bkit-ship.md
@@ -77,9 +77,11 @@ description: "Ship Feature — Autonomous merge and archive"
 
 1. Write the error message / tool response to `{OUTBOX_ROOT}/error.md` (`--error-file` dropped while `{OUTBOX_ROOT}` is not held). `{STDERR_FILE}` = `{OUTBOX}/stderr.log` holding the failed shell command's stderr — drop `--stderr-file` when the failure was not a shell command or `{OUTBOX}` is not set yet; drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when a `counters route` exit 1 (a `MAX_*` limit) sent the run here; `{LABEL_FLAGS}` = one `--label=<name>` per current `LABELS` entry. Abort any in-progress rebase or merge, record the failure, release the lock, delete the session folder (drop `--session-dir` while `{SESSION_DIR}` is not held), clear sentinels — **state only, no `add` / `commit` / `push`**; a MERGED PR moves the issue to `bkit:merged` plus `bkit:failed`, else the prior phase label persists:
    ```bash
-   "{BKIT}" workflows fail --post --issue="{ISSUE_ID}" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}" --session-dir="{SESSION_DIR}"
+   "{BKIT}" workflows fail --post --issue="{ISSUE_ID}" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}" --next-step="{NEXT_STEP}" --session-dir="{SESSION_DIR}"
    ```
+   Drop `--next-step` when `NEXT_STEP` is not held.
    Hold `handoverNeeded` as `HANDOVER_NEEDED`, `labels` as `LABELS` and `trackerState` as `TRACKER_STATE`.
+   **If** exit 2 **and** `--next-step` was passed → the value was refused before any write: clear `NEXT_STEP` and run the block again without `--next-step`, then route on that exit.
    **If** exit non-zero → log `Lock removal failed` with the printed `lock` to stderr, then continue.
 2. **Skip if** `ISSUE_ID` empty. **If** `tracker.done` = false → post `comment` via the tracker MCP per the header's fallback section. **If** `labelsWrite.done` = false → apply the printed `labels` / `trackerState` via the tracker MCP (**Labels** fallback).
 3. **If** `HANDOVER_NEEDED` = true → step 4. **Else** → step 5.
@@ -99,7 +101,7 @@ description: "Ship Feature — Autonomous merge and archive"
    The block posts a non-null `comment`, which links the handover only where the flush pushed it.
    **If** `tracker.done` = false → post `comment` via the tracker MCP per the header's fallback section.
    **If** the push failed → do not claim success on the tracker.
-6. **STOP**, no further downstream steps. **If** `SUMMARY_VERDICT` = FAIL → the final message is `ship-summary.md` content verbatim. Line 1 of the final message = the no-issue warning, when one was emitted.
+6. **STOP**, no further downstream steps. **If** `SUMMARY_VERDICT` = FAIL → the final message is `ship-summary.md` content verbatim. Line 1 of the final message = the no-issue warning, when one was emitted. **If** `NEXT_STEP` is held → the final message's last line is `Next step: {NEXT_STEP}`, after any verbatim summary.
 
 ---
 
@@ -291,14 +293,16 @@ description: "Ship Feature — Autonomous merge and archive"
    ```bash
    "{BKIT}" runs wait --pr="{PR_NUMBER}" --until=present --budget-s=120 || exit 1
    "{BKIT}" runs wait --pr="{PR_NUMBER}" --until=completed
-   "{BKIT}" prs checks --number="{PR_NUMBER}" >/dev/null
+   "{BKIT}" prs checks --number="{PR_NUMBER}"
    ```
-   Route:
+   Hold `failed` as `CHECKS_FAILED`. Route:
    - **If** exit 0 → next sub-step.
+   - **If** exit 1 **and** `CHECKS_FAILED` > 0 (any check failed: the CI run is red) → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
    - **If** exit 80 → read the checks with `pull_request_read` (`get_status`):
-     - **If** there is no check, **or** any check failed or is pending → **Failure Path**.
+     - **If** any check failed → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
+     - **If** there is no check, **or** any check is pending → **Failure Path**.
      - **Else** → next sub-step.
-   - **Else** → **Failure Path**.
+   - **Else** (the rollup is unreadable) → **Failure Path**.
 6. Finish (bookkeeping to `$BOOK_ROOT`, no branch commit):
    ```bash
    "{BKIT}" steps done --workflow=ship --step=ship-worktree-setup --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md" --commit=none >/dev/null || exit 1
@@ -677,6 +681,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
      - **If** exit 0 → set `{REVALIDATE_REASON}` = `gate-refusal` → Step 9.
      - **If** exit 1 **and** `MERGE_ASK` = true → set `{REVALIDATE_REASON}` = `gate-refusal`, `LIMIT_NEXT` = Step 9 → **Merge Question**.
      - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
+   - **If** exit 12 **and** `regenerable` = false → the CI run is red and regenerating cannot fix it. Hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
    - **If** exit 12 **and** `regenerable` = true → every failed CI step is one `bkit:generate` fixes (`bkit.testing.ciGenerated`). Route on the failed arrivals at Step 10, without asking:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
@@ -700,10 +705,10 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
 
          Then set `REVALIDATE_REASON` empty → Step 9 (re-validate at the regenerated head, then re-run the merge gate).
 
-       - **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed).
-     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
-     - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
-   - **Else** (12, 13, 15, 16, 18 or 20) → **Failure Path**.
+       - **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed). **If** `REGEN_OUTCOME` = `unchanged` **or** `undeclared` → hold `/bkit-debug {FID}` as `NEXT_STEP` first.
+     - **If** exit 1 **and** `MERGE_ASK` = true → hold `/bkit-debug {FID}` as `NEXT_STEP`, `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
+     - **Else** → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
+   - **Else** (13, 15, 16, 18 or 20) → **Failure Path**.
 2. Merge with an empty body and `--match-head`, so GitHub refuses when the head moved. Re-read the labels from the tracker, so that ` bkit [auto route]` rides the squash subject on `bkit:auto`. The labels are never carried forward from Step 1's `{LABELS}`. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when no tracker is wired or `ISSUE_ID` is empty:
    **Skip if** `ISSUE_ID` empty. Re-read the issue:
    ```bash
@@ -780,11 +785,12 @@ Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NE
    ```
 
    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
-   - **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
+   - **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and `NEXT_STEP` and go to the step `LIMIT_NEXT` named:
      ```bash
      "{BKIT}" counters grant --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --point=ship.merge --file="{STATUS}" --workflow=ship >/dev/null || exit 1
      ```
    - **If** the answer is `Stop` → create `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md` with the question, the answer and the line `Stopped by the owner; run stays IN_PROGRESS. /bkit-ship {FID} resumes at Step 10.`
+     **If** `NEXT_STEP` is held → add the line `Next step: {NEXT_STEP}` to the handover after the resume line, and end the final message with the same line.
      Then push it and release the lock. NEVER run `workflows fail`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=ship --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
@@ -829,7 +835,10 @@ Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NE
    ```bash
    "{BKIT}" runs gate --squash-of="{PR_NUMBER}" --repo="{OWNER_REPO}" --capstone-only --record="{STATUS}"
    ```
-   Hold `head` as `SQUASH_SHA`.
+   Route:
+   - **If** exit 0 → hold `head` as `SQUASH_SHA` → sub-step 2.
+   - **If** exit 12 → the squash commit's CI is red. Hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
+   - **Else** → **Failure Path**.
 2. Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is deleted only at its inspected landed tip and retained when origin refuses that conditional deletion; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    ```bash
diff --git a/.cursor/commands/bkit-ship.md b/.cursor/commands/bkit-ship.md
index 7fb73e330..3a2a9c438 100644
--- a/.cursor/commands/bkit-ship.md
+++ b/.cursor/commands/bkit-ship.md
@@ -76,9 +76,11 @@ Ship Feature — Autonomous merge and archive
 
 1. Write the error message / tool response to `{OUTBOX_ROOT}/error.md` (`--error-file` dropped while `{OUTBOX_ROOT}` is not held). `{STDERR_FILE}` = `{OUTBOX}/stderr.log` holding the failed shell command's stderr — drop `--stderr-file` when the failure was not a shell command or `{OUTBOX}` is not set yet; drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when a `counters route` exit 1 (a `MAX_*` limit) sent the run here; `{LABEL_FLAGS}` = one `--label=<name>` per current `LABELS` entry. Abort any in-progress rebase or merge, record the failure, release the lock, delete the session folder (drop `--session-dir` while `{SESSION_DIR}` is not held), clear sentinels — **state only, no `add` / `commit` / `push`**; a MERGED PR moves the issue to `bkit:merged` plus `bkit:failed`, else the prior phase label persists:
    ```bash
-   "{BKIT}" workflows fail --post --issue="{ISSUE_ID}" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}" --session-dir="{SESSION_DIR}"
+   "{BKIT}" workflows fail --post --issue="{ISSUE_ID}" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}" --next-step="{NEXT_STEP}" --session-dir="{SESSION_DIR}"
    ```
+   Drop `--next-step` when `NEXT_STEP` is not held.
    Hold `handoverNeeded` as `HANDOVER_NEEDED`, `labels` as `LABELS` and `trackerState` as `TRACKER_STATE`.
+   **If** exit 2 **and** `--next-step` was passed → the value was refused before any write: clear `NEXT_STEP` and run the block again without `--next-step`, then route on that exit.
    **If** exit non-zero → log `Lock removal failed` with the printed `lock` to stderr, then continue.
 2. **Skip if** `ISSUE_ID` empty. **If** `tracker.done` = false → post `comment` via the tracker MCP per the header's fallback section. **If** `labelsWrite.done` = false → apply the printed `labels` / `trackerState` via the tracker MCP (**Labels** fallback).
 3. **If** `HANDOVER_NEEDED` = true → step 4. **Else** → step 5.
@@ -98,7 +100,7 @@ Ship Feature — Autonomous merge and archive
    The block posts a non-null `comment`, which links the handover only where the flush pushed it.
    **If** `tracker.done` = false → post `comment` via the tracker MCP per the header's fallback section.
    **If** the push failed → do not claim success on the tracker.
-6. **STOP**, no further downstream steps. **If** `SUMMARY_VERDICT` = FAIL → the final message is `ship-summary.md` content verbatim. Line 1 of the final message = the no-issue warning, when one was emitted.
+6. **STOP**, no further downstream steps. **If** `SUMMARY_VERDICT` = FAIL → the final message is `ship-summary.md` content verbatim. Line 1 of the final message = the no-issue warning, when one was emitted. **If** `NEXT_STEP` is held → the final message's last line is `Next step: {NEXT_STEP}`, after any verbatim summary.
 
 ---
 
@@ -290,14 +292,16 @@ Ship Feature — Autonomous merge and archive
    ```bash
    "{BKIT}" runs wait --pr="{PR_NUMBER}" --until=present --budget-s=120 || exit 1
    "{BKIT}" runs wait --pr="{PR_NUMBER}" --until=completed
-   "{BKIT}" prs checks --number="{PR_NUMBER}" >/dev/null
+   "{BKIT}" prs checks --number="{PR_NUMBER}"
    ```
-   Route:
+   Hold `failed` as `CHECKS_FAILED`. Route:
    - **If** exit 0 → next sub-step.
+   - **If** exit 1 **and** `CHECKS_FAILED` > 0 (any check failed: the CI run is red) → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
    - **If** exit 80 → read the checks with `pull_request_read` (`get_status`):
-     - **If** there is no check, **or** any check failed or is pending → **Failure Path**.
+     - **If** any check failed → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
+     - **If** there is no check, **or** any check is pending → **Failure Path**.
      - **Else** → next sub-step.
-   - **Else** → **Failure Path**.
+   - **Else** (the rollup is unreadable) → **Failure Path**.
 6. Finish (bookkeeping to `$BOOK_ROOT`, no branch commit):
    ```bash
    "{BKIT}" steps done --workflow=ship --step=ship-worktree-setup --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md" --commit=none >/dev/null || exit 1
@@ -676,6 +680,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
      - **If** exit 0 → set `{REVALIDATE_REASON}` = `gate-refusal` → Step 9.
      - **If** exit 1 **and** `MERGE_ASK` = true → set `{REVALIDATE_REASON}` = `gate-refusal`, `LIMIT_NEXT` = Step 9 → **Merge Question**.
      - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
+   - **If** exit 12 **and** `regenerable` = false → the CI run is red and regenerating cannot fix it. Hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
    - **If** exit 12 **and** `regenerable` = true → every failed CI step is one `bkit:generate` fixes (`bkit.testing.ciGenerated`). Route on the failed arrivals at Step 10, without asking:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
@@ -699,10 +704,10 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
 
          Then set `REVALIDATE_REASON` empty → Step 9 (re-validate at the regenerated head, then re-run the merge gate).
 
-       - **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed).
-     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
-     - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
-   - **Else** (12, 13, 15, 16, 18 or 20) → **Failure Path**.
+       - **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed). **If** `REGEN_OUTCOME` = `unchanged` **or** `undeclared` → hold `/bkit-debug {FID}` as `NEXT_STEP` first.
+     - **If** exit 1 **and** `MERGE_ASK` = true → hold `/bkit-debug {FID}` as `NEXT_STEP`, `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
+     - **Else** → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
+   - **Else** (13, 15, 16, 18 or 20) → **Failure Path**.
 2. Merge with an empty body and `--match-head`, so GitHub refuses when the head moved. Re-read the labels from the tracker, so that ` bkit [auto route]` rides the squash subject on `bkit:auto`. The labels are never carried forward from Step 1's `{LABELS}`. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when no tracker is wired or `ISSUE_ID` is empty:
    **Skip if** `ISSUE_ID` empty. Re-read the issue:
    ```bash
@@ -779,11 +784,12 @@ Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NE
    ```
 
    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
-   - **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
+   - **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and `NEXT_STEP` and go to the step `LIMIT_NEXT` named:
      ```bash
      "{BKIT}" counters grant --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --point=ship.merge --file="{STATUS}" --workflow=ship >/dev/null || exit 1
      ```
    - **If** the answer is `Stop` → create `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md` with the question, the answer and the line `Stopped by the owner; run stays IN_PROGRESS. /bkit-ship {FID} resumes at Step 10.`
+     **If** `NEXT_STEP` is held → add the line `Next step: {NEXT_STEP}` to the handover after the resume line, and end the final message with the same line.
      Then push it and release the lock. NEVER run `workflows fail`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=ship --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
@@ -828,7 +834,10 @@ Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NE
    ```bash
    "{BKIT}" runs gate --squash-of="{PR_NUMBER}" --repo="{OWNER_REPO}" --capstone-only --record="{STATUS}"
    ```
-   Hold `head` as `SQUASH_SHA`.
+   Route:
+   - **If** exit 0 → hold `head` as `SQUASH_SHA` → sub-step 2.
+   - **If** exit 12 → the squash commit's CI is red. Hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
+   - **Else** → **Failure Path**.
 2. Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is deleted only at its inspected landed tip and retained when origin refuses that conditional deletion; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    ```bash
diff --git a/.opencode/commands/bkit-ship.md b/.opencode/commands/bkit-ship.md
index 51408ebb8..5937e4fe3 100644
--- a/.opencode/commands/bkit-ship.md
+++ b/.opencode/commands/bkit-ship.md
@@ -80,9 +80,11 @@ $ARGUMENTS
 
 1. Write the error message / tool response to `{OUTBOX_ROOT}/error.md` (`--error-file` dropped while `{OUTBOX_ROOT}` is not held). `{STDERR_FILE}` = `{OUTBOX}/stderr.log` holding the failed shell command's stderr — drop `--stderr-file` when the failure was not a shell command or `{OUTBOX}` is not set yet; drop `--token` when `{LOCK_TOKEN}` is empty, `--pr` when `{PR_NUMBER}` is empty; `--max-exceeded` only when a `counters route` exit 1 (a `MAX_*` limit) sent the run here; `{LABEL_FLAGS}` = one `--label=<name>` per current `LABELS` entry. Abort any in-progress rebase or merge, record the failure, release the lock, delete the session folder (drop `--session-dir` while `{SESSION_DIR}` is not held), clear sentinels — **state only, no `add` / `commit` / `push`**; a MERGED PR moves the issue to `bkit:merged` plus `bkit:failed`, else the prior phase label persists:
    ```bash
-   "{BKIT}" workflows fail --post --issue="{ISSUE_ID}" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}" --session-dir="{SESSION_DIR}"
+   "{BKIT}" workflows fail --post --issue="{ISSUE_ID}" --workflow=ship --fid={FID} --month={YYYYMM} --token={LOCK_TOKEN} --max-exceeded --pr={PR_NUMBER} {LABEL_FLAGS} --step-number={N} --step-title="{Step Name}" --sub-step={M} --error-file="{OUTBOX_ROOT}/error.md" --stderr-file="{STDERR_FILE}" --next-step="{NEXT_STEP}" --session-dir="{SESSION_DIR}"
    ```
+   Drop `--next-step` when `NEXT_STEP` is not held.
    Hold `handoverNeeded` as `HANDOVER_NEEDED`, `labels` as `LABELS` and `trackerState` as `TRACKER_STATE`.
+   **If** exit 2 **and** `--next-step` was passed → the value was refused before any write: clear `NEXT_STEP` and run the block again without `--next-step`, then route on that exit.
    **If** exit non-zero → log `Lock removal failed` with the printed `lock` to stderr, then continue.
 2. **Skip if** `ISSUE_ID` empty. **If** `tracker.done` = false → post `comment` via the tracker MCP per the header's fallback section. **If** `labelsWrite.done` = false → apply the printed `labels` / `trackerState` via the tracker MCP (**Labels** fallback).
 3. **If** `HANDOVER_NEEDED` = true → step 4. **Else** → step 5.
@@ -102,7 +104,7 @@ $ARGUMENTS
    The block posts a non-null `comment`, which links the handover only where the flush pushed it.
    **If** `tracker.done` = false → post `comment` via the tracker MCP per the header's fallback section.
    **If** the push failed → do not claim success on the tracker.
-6. **STOP**, no further downstream steps. **If** `SUMMARY_VERDICT` = FAIL → the final message is `ship-summary.md` content verbatim. Line 1 of the final message = the no-issue warning, when one was emitted.
+6. **STOP**, no further downstream steps. **If** `SUMMARY_VERDICT` = FAIL → the final message is `ship-summary.md` content verbatim. Line 1 of the final message = the no-issue warning, when one was emitted. **If** `NEXT_STEP` is held → the final message's last line is `Next step: {NEXT_STEP}`, after any verbatim summary.
 
 ---
 
@@ -294,14 +296,16 @@ $ARGUMENTS
    ```bash
    "{BKIT}" runs wait --pr="{PR_NUMBER}" --until=present --budget-s=120 || exit 1
    "{BKIT}" runs wait --pr="{PR_NUMBER}" --until=completed
-   "{BKIT}" prs checks --number="{PR_NUMBER}" >/dev/null
+   "{BKIT}" prs checks --number="{PR_NUMBER}"
    ```
-   Route:
+   Hold `failed` as `CHECKS_FAILED`. Route:
    - **If** exit 0 → next sub-step.
+   - **If** exit 1 **and** `CHECKS_FAILED` > 0 (any check failed: the CI run is red) → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
    - **If** exit 80 → read the checks with `pull_request_read` (`get_status`):
-     - **If** there is no check, **or** any check failed or is pending → **Failure Path**.
+     - **If** any check failed → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
+     - **If** there is no check, **or** any check is pending → **Failure Path**.
      - **Else** → next sub-step.
-   - **Else** → **Failure Path**.
+   - **Else** (the rollup is unreadable) → **Failure Path**.
 6. Finish (bookkeeping to `$BOOK_ROOT`, no branch commit):
    ```bash
    "{BKIT}" steps done --workflow=ship --step=ship-worktree-setup --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md" --commit=none >/dev/null || exit 1
@@ -680,6 +684,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
      - **If** exit 0 → set `{REVALIDATE_REASON}` = `gate-refusal` → Step 9.
      - **If** exit 1 **and** `MERGE_ASK` = true → set `{REVALIDATE_REASON}` = `gate-refusal`, `LIMIT_NEXT` = Step 9 → **Merge Question**.
      - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
+   - **If** exit 12 **and** `regenerable` = false → the CI run is red and regenerating cannot fix it. Hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
    - **If** exit 12 **and** `regenerable` = true → every failed CI step is one `bkit:generate` fixes (`bkit.testing.ciGenerated`). Route on the failed arrivals at Step 10, without asking:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
@@ -703,10 +708,10 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
 
          Then set `REVALIDATE_REASON` empty → Step 9 (re-validate at the regenerated head, then re-run the merge gate).
 
-       - **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed).
-     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
-     - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
-   - **Else** (12, 13, 15, 16, 18 or 20) → **Failure Path**.
+       - **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed). **If** `REGEN_OUTCOME` = `unchanged` **or** `undeclared` → hold `/bkit-debug {FID}` as `NEXT_STEP` first.
+     - **If** exit 1 **and** `MERGE_ASK` = true → hold `/bkit-debug {FID}` as `NEXT_STEP`, `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
+     - **Else** → hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
+   - **Else** (13, 15, 16, 18 or 20) → **Failure Path**.
 2. Merge with an empty body and `--match-head`, so GitHub refuses when the head moved. Re-read the labels from the tracker, so that ` bkit [auto route]` rides the squash subject on `bkit:auto`. The labels are never carried forward from Step 1's `{LABELS}`. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when no tracker is wired or `ISSUE_ID` is empty:
    **Skip if** `ISSUE_ID` empty. Re-read the issue:
    ```bash
@@ -783,11 +788,12 @@ Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NE
    ```
 
    A reply that names a letter (`B`, `B)` or `B) {option}`) means the option that letter labels.
-   - **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and go to the step it named:
+   - **If** the answer is `Try again` → give the merge step one more full allowance, then clear `LIMIT_NEXT` and `NEXT_STEP` and go to the step `LIMIT_NEXT` named:
      ```bash
      "{BKIT}" counters grant --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --point=ship.merge --file="{STATUS}" --workflow=ship >/dev/null || exit 1
      ```
    - **If** the answer is `Stop` → create `docs/plans/{YYYYMM}/logs/{FID}/ship-handover.md` with the question, the answer and the line `Stopped by the owner; run stays IN_PROGRESS. /bkit-ship {FID} resumes at Step 10.`
+     **If** `NEXT_STEP` is held → add the line `Next step: {NEXT_STEP}` to the handover after the resume line, and end the final message with the same line.
      Then push it and release the lock. NEVER run `workflows fail`:
      ```bash
      "{BKIT}" workflows handover --post --workflow=ship --fid={FID} --month={YYYYMM} --push --worktree="{WORKTREE_PATH}"
@@ -832,7 +838,10 @@ Asked from Step 9 or Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NE
    ```bash
    "{BKIT}" runs gate --squash-of="{PR_NUMBER}" --repo="{OWNER_REPO}" --capstone-only --record="{STATUS}"
    ```
-   Hold `head` as `SQUASH_SHA`.
+   Route:
+   - **If** exit 0 → hold `head` as `SQUASH_SHA` → sub-step 2.
+   - **If** exit 12 → the squash commit's CI is red. Hold `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**.
+   - **Else** → **Failure Path**.
 2. Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is deleted only at its inspected landed tip and retained when origin refuses that conditional deletion; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    ```bash
diff --git a/DETAILS.md b/DETAILS.md
index 55fb30ffb..57ce10cfe 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -345,7 +345,7 @@ config:
 flowchart LR
   %% Generated by bkit-graphify-rollup.py — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
-    n_bkit_core_engine_checks["checks<br/>257 symbols · 18 files"]
+    n_bkit_core_engine_checks["checks<br/>256 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
     n_bkit_core_engine_commands["commands<br/>1819 symbols · 53 files"]
     n_bkit_core_engine_install["install<br/>351 symbols · 21 files"]
diff --git a/dist/commands/workflow/workflows.js b/dist/commands/workflow/workflows.js
index 9ef7ea735..97285b8b3 100644
--- a/dist/commands/workflow/workflows.js
+++ b/dist/commands/workflow/workflows.js
@@ -245,6 +245,10 @@ async function failVerb(ctx) {
     const token = str(ctx.flags.token) || undefined;
     if (token !== undefined && fid === undefined)
         throw new CommandError(EXIT.USAGE, "--token needs --fid");
+    // Empty is absent; anything else is one /bkit-* command line, checked before any write.
+    const nextStep = str(ctx.flags.nextStep) || undefined;
+    if (nextStep !== undefined && (/[\r\n]/.test(nextStep) || !nextStep.startsWith("/bkit-")))
+        throw new CommandError(EXIT.USAGE, "--next-step must be one /bkit-* command line");
     // State only for a run that took the lock: without the token the failure came
     // before Step 1 locked, and nothing here is this run's to change.
     const state = token === undefined || fid === undefined
@@ -290,6 +294,7 @@ async function failVerb(ctx) {
             subStep: str(ctx.flags.subStep),
             error: state.removeFailed ? `${error}; Lock removal failed` : error,
             stderrFile: str(ctx.flags.stderrFile) || undefined,
+            ...(nextStep === undefined ? {} : { lines: [`Next step: \`${nextStep}\``] }),
         });
     }
     if (ctx.flags.post === true && comment === null)
@@ -317,6 +322,7 @@ async function failVerb(ctx) {
         trackerState: failedState,
         prState,
         comment,
+        nextStep: nextStep ?? null,
         commentFile: commentFileOf(ctx.cwd, comment, ctx),
         ...(tracker === undefined ? {} : { tracker }),
         ...(labelsWrite === undefined ? {} : { labelsWrite }),
@@ -1842,6 +1848,11 @@ export const workflowsCommand = {
                     type: "string",
                     help: "the failed shell command's stderr (last 20 lines kept)",
                 },
+                {
+                    name: "next-step",
+                    type: "string",
+                    help: "one /bkit-* command line to name as the next step: adds a `Next step:` line to the failure comment (empty = none)",
+                },
                 {
                     ...POST_FLAG,
                     help: "post the failure comment (needs --step-number) to the --fid / --issue issue and write its failed labels; prints `tracker` and `labelsWrite`",
@@ -1864,6 +1875,7 @@ export const workflowsCommand = {
                 trackerState: "the Linear or Jira state for the failed issue (null under github, none)",
                 prState: "the --pr PR's state, or null",
                 comment: "the failure comment body (with --step-number), else null",
+                nextStep: "the --next-step command line, or null",
                 commentFile: COMMENT_FILE_OUTPUT,
                 tracker: TRACKER_OUTPUT,
                 labelsWrite: "with --post: the label and state write, read fresh from the issue: {done: true, action: labels} | {done: false, action, reason} (write `labels` / `trackerState` via the tracker MCP) | {skipped}",
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 07e9483c1..37b14d320 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -162,7 +162,7 @@ config:
 flowchart LR
   %% Generated by bkit-graphify-rollup.py — do not edit
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
-    n_bkit_core_engine_checks["checks<br/>257 symbols · 18 files"]
+    n_bkit_core_engine_checks["checks<br/>256 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
     n_bkit_core_engine_commands["commands<br/>1819 symbols · 53 files"]
     n_bkit_core_engine_install["install<br/>351 symbols · 21 files"]
@@ -289,7 +289,7 @@ flowchart LR
         n_bkit_core_engine_checks_before_files["files<br/>8 symbols · 1 files"]
         n_bkit_core_engine_checks_before_repo["repo<br/>13 symbols · 1 files"]
       end
-      n_bkit_core_engine_checks_status_holes["status-holes<br/>47 symbols · 1 files"]
+      n_bkit_core_engine_checks_status_holes["status-holes<br/>46 symbols · 1 files"]
       subgraph gn_bkit_core_engine_checks_tips[".bkit/core/engine/checks/tips"]
         n_bkit_core_engine_checks_tips_catalogue["catalogue<br/>7 symbols · 1 files"]
         n_bkit_core_engine_checks_tips_detect["detect<br/>25 symbols · 1 files"]
