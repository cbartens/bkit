diff --git a/.agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md b/.agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
index 48aa78eb5..37fffa436 100644
--- a/.agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
+++ b/.agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md
@@ -56,7 +56,9 @@ tools:
 5. Confirm the merge state the caller left:
    - Record the branch head with `git rev-parse HEAD`, and append a log entry naming it.
    - Run `git rev-parse -q --verify MERGE_HEAD`.
-   - **If** it prints nothing → no merge of `origin/dev` is in progress, so there is no conflict here to resolve:
+   - Resolve the caller's engine-recorded `{MERGE_TARGET}` with `git rev-parse --verify "{MERGE_TARGET}^{commit}"` and compare it with `MERGE_HEAD`.
+   - **If** either value is unreadable or the values differ → set `Verdict` = `FAIL` with `Edit`, name the target mismatch in the log and go straight to setting `Verdict`.
+   - **If** it prints nothing → no merge of the recorded target is in progress, so there is no conflict here to resolve:
      - Set `Verdict` = `FAIL` with `Edit`.
      - Go straight to setting `Verdict`.
    - Append a log entry.
@@ -64,7 +66,7 @@ tools:
    ```bash
    BKIT="$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"
    [ -x "$BKIT" ] || BKIT="$(command -v bkit || echo "$BKIT")"
-   "$BKIT" branches sync --merge --file="{STATUS}"
+   "$BKIT" branches sync --merge --target="{MERGE_TARGET}" --file="{STATUS}"
    case $? in
      0) echo "MERGE_COMPLETE" ;;
      24) echo "HAND_RESOLVE" ;;
@@ -79,11 +81,11 @@ tools:
      - Go straight to setting `Verdict`.
 7. Classify the conflicts:
    - List the conflicted files with `git diff --name-only --diff-filter=U`.
-   - List each side's recent commits with `git log -5 --oneline HEAD` and `git log -5 --oneline origin/dev`, then append a log entry.
+   - List each side's recent commits with `git log -5 --oneline HEAD` and `git log -5 --oneline "{MERGE_TARGET}"`, then append a log entry.
    - Classify each conflicted file against these two lists, then append a log entry:
      - `Allowed resolutions`:
        - Non-overlapping additive edits to the same file → concatenate them, keeping both sides.
-       - Formatting-only drift (whitespace, trailing newline, prettier output) → take `origin/dev`'s format.
+       - Formatting-only drift (whitespace, trailing newline, prettier output) → take the recorded target's format.
        - A dependency manifest bump on one side only (`package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`) → take the bump.
        - Additive JSON array entries or object property additions with no key or position overlap → concatenate them.
      - `Refused resolutions`:
@@ -106,7 +108,7 @@ tools:
    - Append a log entry with its exit code.
    - **If** it exits non-zero → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
 10. Set `Verdict` in **Create** with `Edit`:
-    - `PASS` = a merge of `origin/dev` was in progress, every conflicted file was resolved by the auto-resolver or classified `Allowed resolutions` and resolved, the merge is committed, and `pnpm bkit:gate:install-static-unit-build` exited 0.
+    - `PASS` = a merge of the recorded target was in progress, every conflicted file was resolved by the auto-resolver or classified `Allowed resolutions` and resolved, the merge is committed, and `pnpm bkit:gate:install-static-unit-build` exited 0.
     - `FAIL` = no merge was in progress, **or** any conflicted file was classified `Refused resolutions`, **or** the auto-resolver aborted the merge, **or** any verify command exited non-zero.
 11. **If** `Verdict` = `FAIL`:
     - **If** `git rev-parse -q --verify MERGE_HEAD` prints a SHA:
diff --git a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
index 38d060955..f8e00a47f 100644
--- a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
@@ -41,7 +41,7 @@ description: "Ship Feature — Autonomous merge and archive"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path becomes it), checks artifacts and row, writes the row (ship: `--commit=none`, bookkeeping to `$BOOK_ROOT`), prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS.
+- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`. For `number` from 3 through 10, return to Step 3 instead, which compares recorded feature coverage before reusing completed agents. `after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS.
 - **Status:** `$BOOK_ROOT/.../status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Step 14 releases it via `bkit workflows close --flush --token=`, the **Failure Path** via `bkit workflows fail --token=`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
 - **Status branch:** From Step 2 all steps write `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (`{STATUS}`); `BOOK_ROOT` = `{WORKTREE_PATH}`. Stage path-scoped via `bkit ledgers commit`; NEVER stage all files (`-A`) or blanket `docs/`. One commit per flush block: Commit + Push Bookkeeping → `docs({FID}): ship bookkeeping bkit [skip ci]` → push `{SHIP_BRANCH}` (pre-merge: docs, logs, ledgers, skill removals); Close Workflow → `docs({FID}): ship DONE bkit [skip ci]`, **Failure Path** → `chore({FID}): ship FAILED bkit [skip ci]` → push `dev` from a throwaway `origin/dev` checkout; a refused close push → close PR.
@@ -216,10 +216,34 @@ description: "Ship Feature — Autonomous merge and archive"
    "{BKIT}" workflows input --workflow=ship --fid={FID} --run={RUN} --file="{STATUS}" --prompt-file="{SESSION_DIR}/prompt.md" --description-file="{SESSION_DIR}/issue-description.md" --comments-file="{SESSION_DIR}/issue-comments.json" --plan="docs/plans/{YYYYMM}/{FID}-plan.md" || exit 1
    ```
 2. Find the branch's PR — open first, then merged:
+   Reconcile and publish before probing or opening a PR, including on resume:
+
+   ```bash
+   "{BKIT}" branches sync --reconcile-feature --fid="{FID}" --file="{STATUS}"
+   ```
+
+   Route — first match wins:
+   - **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 2 → Step 4 sub-step 2.
+   - **If** exit 0 → hold `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD` → publish the resulting local head before sweep/docs bookkeeping.
+     ```bash
+     "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+     ```
+     Route:
+     **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
+   - **Else** → **Failure Path**.
+
    ```bash
-   "{BKIT}" prs probe --head="{SHIP_BRANCH}" --state=all
+   "{BKIT}" prs probe --head="{SHIP_BRANCH}" --base=dev --state=all --ship-entry --owner-repo="{OWNER_REPO}"
    ```
+
    Hold `number` as `PR_NUMBER`, `baseRefName` as `PR_BASE`, and hold `state`.
+   **If** exit 80 **or** `runtimeGithubCli` = false → read open PRs first, then merged PRs through MCP, independently reread the selected PR, and write `{ ownerRepo, headRefName, baseRefName: "dev", pr }` to `{OUTBOX}/ship-entry-facts.json`. `pr` is the complete `PrInfo` shape (`number`, `url`, `state`, `baseRefName`, `headRefName`, `headRefOid`, `title`, `mergeCommit`, `mergeable`), or null when neither exists. Record the single transport transition under **gh MCP fallback**, then use the engine's result:
+
+   ```bash
+   "{BKIT}" prs probe --head="{SHIP_BRANCH}" --base=dev --state=all --ship-entry --owner-repo="{OWNER_REPO}" --facts-file="{OUTBOX}/ship-entry-facts.json"
+   ```
+
+   Missing or mismatched facts → **Failure Path** before opening or merging anything. A merged PR with extra feature work returns exit 1: open a new PR, preserving that work.
    Route — first match wins:
    - **If** exit 0 **and** `PR_BASE` != dev → **Failure Path**.
    - **If** exit 0 → sub-step 3.
@@ -244,6 +268,7 @@ description: "Ship Feature — Autonomous merge and archive"
      Assert `PR_NUMBER` non-empty and `PR_BASE` = dev. **If** the assertion fails → **Failure Path**.
 
    - **Else** → **Failure Path**.
+
 3. Route:
    - **If** `state` = MERGED → record the resume marker → Step 13:
      ```bash
@@ -340,11 +365,21 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🤖 Step 3 — Base Check
 
-1. Determine whether `origin/dev` is an ancestor of the PR head:
+1. Reconcile again on every integration retry, then publish before selecting `BASE_PATH`:
+   ```bash
+   "{BKIT}" branches sync --reconcile-feature --fid="{FID}" --file="{STATUS}"
+   ```
+   Hold `basePath` as `BASE_PATH`, `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD`. **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 3 → Step 4 sub-step 2. **If** another non-zero exit → **Failure Path**.
+   ```bash
+   "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+   ```
+   Route:
+   **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
+   Compute the merge-aware feature coverage state:
    ```bash
-   "{BKIT}" branches sync --head="{ENTRY_HEAD}"
+   "{BKIT}" branches sync --feature-state --month="{YYYYMM}" --fid="{FID}"
    ```
-   Hold `basePath` as `BASE_PATH`.
+   Hold `featureCodeState` as `FEATURE_CODE_STATE`. Non-zero exit → **Failure Path**. Bookkeeping commits and proven automatic base-only merges retain coverage. New feature commits, imported feature merges and semantic conflict resolutions invalidate coverage. Unproven merge results remain in the state. Record this exact state with each successful sweep/docs completion below; read those rows from `{STATUS}` on resume.
 2. Route:
    - **If** `BASE_PATH` = A → Step 5 (skip integration — dev has not moved; no `bkit:generate`, because CI fails on a stale generated file and Step 10 regenerates when that is the only failure).
    - **If** `BASE_PATH` = B → Step 4 (integration required; its merge runs `bkit:generate`).
@@ -362,13 +397,17 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🧠 Step 4 — Integrate (Path B only)
 
-**Run only if** `BASE_PATH` = B.
+**Run only if** `BASE_PATH` = B **or** a feature reconciliation left `PENDING` conflicts.
 
 1. Merge `origin/dev` into `SHIP_BRANCH` locally. The block commits the run's uncommitted work first, unions the append-only ledgers, regenerates a conflicted lockfile from `dev`'s copy, rebuilds a conflicted generated register from `dev`'s copy, takes `dev`'s copy of the generated block in a conflicted embedding doc (a doc the register's script copies that block into) and merges the rest of that doc, merges a conflicted install record (`.bkit/version`) entry by entry with `dev`'s value where both sides changed an entry, runs a declared `bkit:generate`, and leaves every other conflict in the tree for sub-step 2. GitHub ignores `merge=union`, so the merged commit, not a server-side update or a rebase, is what makes the PR mergeable. No commit the block makes carries a skip token, so the sub-step 3 push starts CI at the merged head and Step 9 waits on that run:
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" branches sync --merge --fid="{FID}" --file="{STATUS}" --sentinel="docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"
+   git rev-parse --verify origin/dev
    ```
-   Hold `outcome` as `MERGE_OUTCOME`, `pending` as `PENDING`.
+   Hold the printed commit as `MERGE_TARGET`.
+   ```bash
+   cd "{WORKTREE_PATH}" && "{BKIT}" branches sync --merge --fid="{FID}" --file="{STATUS}" --target="{MERGE_TARGET}" --sentinel="docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"
+   ```
+   Hold `outcome` as `MERGE_OUTCOME`, `pending` as `PENDING`, `target` as `MERGE_TARGET`, and `head` as `CODE_HEAD` and `ENTRY_HEAD`. Set `RECONCILE_NEXT` empty for this dev integration.
    Route:
    - **If** exit 0 **and** `MERGE_OUTCOME` = merged → sub-step 3.
    - **If** exit 0 **and** `MERGE_OUTCOME` = current → Step 5. `dev` has not moved since Step 3.
@@ -376,7 +415,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **Else** → **Failure Path**. The block aborted the merge and wrote the sentinel.
 2. Resolve the conflicts the block left:
    1. **Subagent:** Invoke `view_file` `.agents/plugins/bkit/agents/bkit-ship-conflict-resolve.md` using `view_file` tool:
-      Context: You are a subagent in the Ship phase. A merge of `origin/dev` is in progress with conflicts outside the ledgers, the lockfile, the generated register, the embedding docs and the install record: `{PENDING}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
+      Context: You are a subagent in the Ship phase. A merge of the engine-recorded target `{MERGE_TARGET}` is in progress with conflicts outside the ledgers, the lockfile, the generated register, the embedding docs and the install record: `{PENDING}`. Continue only this target. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
       Read: `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `{STATUS}`.
       Update: Conflicted source files.
       Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-conflict-resolve.md`.
@@ -387,14 +426,18 @@ description: "Ship Feature — Autonomous merge and archive"
    3. **If** `verdict` = PASS → sub-step 3. The subagent's re-run of the block committed the merge.
       **Else** → **Failure Path** (non-mechanical conflict → handover).
 3. Push the merged branch. The merge adds commits on top of the pushed head, so the push is plain, NEVER forced:
+
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+
    Route:
    - **If** exit 81 → end turn, re-run this block.
    - **If** exit 0 → continue with the next instruction.
    - **Else** → **Failure Path**.
 
+   **If** `RECONCILE_NEXT` is held → return there and reconcile again. **Else** → refresh `ENTRY_HEAD` and `CODE_HEAD` with `git rev-parse HEAD` → Step 5, which recomputes coverage after the integration and any conflict resolution.
+
 ### 🔒 Gate 4 — Integrate
 
 - [ ] Path classified
@@ -407,10 +450,15 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🤖 Step 5 — Deferred Sweep
 
-1. Fast-forward to the PR head, never onto a diverged branch:
-   ```bash
-   "{BKIT}" branches fast-forward --onto="origin/{SHIP_BRANCH}" >/dev/null || exit $?
-   ```
+Recompute coverage immediately before deciding whether to reuse the sweep:
+
+```bash
+"{BKIT}" branches sync --feature-state --month="{YYYYMM}" --fid="{FID}"
+```
+
+Refresh `FEATURE_CODE_STATE` from `featureCodeState`; non-zero exit → **Failure Path**.
+
+1. Read the latest successful `ship-feature-coverage` row for `step=ship-deferred-sweep` from `{STATUS}`. **If** its recorded feature-code state matches `FEATURE_CODE_STATE` and its artifact still exists → reuse it and skip to Step 6. **If** the state changed, differs or is missing → invoke the sweep again below. Never reuse a completion from a different feature state.
 2. Check for the plan:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" fids plans --fid="{FID}" --month="{YYYYMM}"
@@ -435,7 +483,10 @@ description: "Ship Feature — Autonomous merge and archive"
    "{BKIT}" steps finish --workflow=ship --step=ship-deferred-sweep --file="{STATUS}" --agent=bkit-ship-deferred-sweep --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md" --commit=none --number=5 --post --title="Deferred Sweep"
    ```
 4. Route:
-   - **If** `verdict` = PASS → Step 6.
+   - **If** `verdict` = PASS → record the covered feature-code state → Step 6:
+     ```bash
+     "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=ship-feature-coverage --field=step=ship-deferred-sweep --field="featureCodeState={FEATURE_CODE_STATE}" >/dev/null || exit 1
+     ```
    - **If** `verdict` = FAIL → write the `.deferred-blocked` sentinel below under `BOOK_ROOT`, then **Failure Path**.
      ```bash
      touch "{BOOK_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/.deferred-blocked"
@@ -444,7 +495,7 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ### 🔒 Gate 5 — Deferred Sweep
 
-- [ ] Worktree fast-forwarded
+- [ ] Reconciled feature-code state compared with recorded sweep coverage
 - [ ] Subagent invoked (`@bkit-ship-deferred-sweep`, no inline work)
 - [ ] Mechanical checks passed (`steps finish`)
 
@@ -452,6 +503,16 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🧠 Step 6 — Update Docs & Summary
 
+Refresh coverage again before deciding whether to reuse the docs artifact:
+
+```bash
+"{BKIT}" branches sync --feature-state --month="{YYYYMM}" --fid="{FID}"
+```
+
+Hold the current `featureCodeState` as `FEATURE_CODE_STATE`; non-zero exit → **Failure Path**.
+
+Read the latest successful `ship-feature-coverage` row for `step=ship-update-docs` from `{STATUS}`. **If** its recorded feature-code state matches `FEATURE_CODE_STATE` and the docs artifact exists → reuse it and skip sub-steps 1–3. **If** the state changed, differs or is missing → run the docs agent again. Always refresh the summary in sub-step 4.
+
 1. Write the FID's deferral lines to the artifact the docs agent reads `Pending Items` from:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" context ledger-scan --terms="{FID}" --source=docs/deferrals.jsonl --artifact="{OUTBOX}/ship-pending-items.md" --fid={FID} --step=ship-update-docs --reset-log >/dev/null || exit 1
@@ -465,6 +526,7 @@ description: "Ship Feature — Autonomous merge and archive"
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
    "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none || exit 1
+   "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=ship-feature-coverage --field=step=ship-update-docs --field="featureCodeState={FEATURE_CODE_STATE}" >/dev/null || exit 1
    ```
 4. Write `ship-summary.md` from this run's status rows and the PR's size:
    ```bash
@@ -536,6 +598,8 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🤖 Step 9 — Re-validate
 
+**If** `RECONCILE_REQUIRED` = true → clear it → Step 3 before validation. A previous `DONE` row alone never proves coverage of imported feature code.
+
 1. Resolve the head CI must pass at. The block re-validates when the code moved **or** `REVALIDATE_REASON` = `gate-refusal`: it probes for a run at it first, dispatches only when none, and waits for it to complete. Drop `--reason` when `REVALIDATE_REASON` is empty:
    ```bash
    "{BKIT}" runs revalidate --pr="{PR_NUMBER}" --entry-head="{ENTRY_HEAD}" --code-head="{CODE_HEAD}" --branch="{SHIP_BRANCH}" --month="{YYYYMM}" --fid="{FID}" --file="{STATUS}" --reason="{REVALIDATE_REASON}" --repo="{OWNER_REPO}"
@@ -557,10 +621,22 @@ description: "Ship Feature — Autonomous merge and archive"
 
 1. Assert the gate at the PR's current head, with CI checked at `VALIDATED_HEAD`. This gate is the ONLY merge precondition. The block writes the pre-merge snapshot to the outbox before the gate decides, refuses a title that carries a skip token (18), and records a refusal in `{STATUS}`:
    ```bash
-   "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fetch --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
+   "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fetch --fresh-base --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
+   ```
+   **If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
+   ```bash
+   "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fresh-base --facts-file="{OUTBOX}/ship-gate-facts.json" --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
    ```
    Route:
    - **If** exit 0 → hold `mergeHead` as `GATE_HEAD` → sub-step 2.
+   - **If** exit 19 (stale base) → the gate already recorded one failed arrival; route to integration:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path**, preserving the branch and worktree on exhaustion.
    - **If** exit 11 (in progress — poll), 14 (stale green), 10 (no run) **or** 17 (non-bookkeeping change past `VALIDATED_HEAD`) → route on the failed arrivals at Step 10, without asking:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
@@ -603,12 +679,16 @@ description: "Ship Feature — Autonomous merge and archive"
    ```
    Hold `state` as `STATE`, `labels` as `LABELS`. **If** exit 80 → read them via the tracker MCP (**Tracker**).
    ```bash
-   "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --delete-branch {LABEL_FLAGS} --expect-merged
+   "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --ship-retry --owner-repo="{OWNER_REPO}" {LABEL_FLAGS} --expect-merged
    ```
    Route:
-   - **If** exit 0 **or** 7 → hold `verdict` as `MERGE_VERDICT`, `failures` as `MERGE_FAILURES`, and hold `state`.
-   - **If** exit 80 → `pull_request_read` (`get`) and assert `base.ref` = `dev`; mismatch → **Failure Path** with nothing merged; then `merge_pull_request` and read `state` back through `pull_request_read` → `MERGE_VERDICT` = PASS and `MERGE_FAILURES` = 0 when merged, else FAIL and 1.
-   - **Else** (8: the PR's base is not `dev`, nothing merged) → **Failure Path**.
+   - **If** exit 0, 5, 7, 8, 9 **or** 10 → hold `route` as `MERGE_ROUTE`, `reason` as `MERGE_REASON`, `verdict` as `MERGE_VERDICT`, `failures` as `MERGE_FAILURES`, and hold `state` → sub-step 3. Missing output fields → **Failure Path**.
+   - **If** exit 80 **or** `runtimeGithubCli` = false → read fresh pre-attempt PR facts through `pull_request_read` (`get`). Refresh the scoped gate facts above with this PR, fresh CI and base evidence, and run that engine gate again before mutation. Only exit 0 authorizes `merge_pull_request`, with `sha` = the newly printed `GATE_HEAD`, the skip-token-free PR subject and an empty body. A gate refusal takes sub-step 1's route and consumes only its existing refusal row. After the attempt, independently reread post-attempt PR state through `pull_request_read`; never copy the mutation response or pre-attempt facts into `after`. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", matchHead, before, after }` to `{OUTBOX}/ship-merge-facts.json`, with complete `PrInfo` values for both reads and `matchHead` = `GATE_HEAD`. Missing or mismatched evidence → **Failure Path**. Record the single transport transition under **gh MCP fallback**, then classify without a second mutation:
+     ```bash
+     "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --ship-retry --owner-repo="{OWNER_REPO}" --facts-file="{OUTBOX}/ship-merge-facts.json" {LABEL_FLAGS} --expect-merged
+     ```
+     Hold the same route, reason, verdict, failures and state as the gh-backed result → sub-step 3.
+   - **Else** → **Failure Path**.
 3. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-merge-pr --file="{STATUS}" --verdict={MERGE_VERDICT} --failures={MERGE_FAILURES} --attempt=next --commit=none --number=10 --post --title="Merge Gate + Merge PR"
@@ -616,15 +696,24 @@ description: "Ship Feature — Autonomous merge and archive"
    Hold `attempt` as `MERGE_ATTEMPT`.
 4. Route:
    - **If** `state` = MERGED → Step 13.
-   - **If** `state` != MERGED → run counter routing:
+   - **If** `MERGE_ROUTE` = revalidate (exit 9) → Step 9 through the durable counter:
      ```bash
-     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-11 --exceeded=failure-path
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
      ```
      Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
-     - **If** exit 0 → Step 11.
-     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 11 → **Merge Question**.
+     Set `RECONCILE_REQUIRED` = true and `REVALIDATE_REASON` = gate-refusal, so imported feature work passes the state comparison and sweep/docs gates before CI.
+     - **If** exit 0 → Step 9.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 9 → **Merge Question**.
      - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
-   - **Else** → **Failure Path**.
+   - **If** `MERGE_ROUTE` = integrate (exit 10) → Step 3 through the same durable counter:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path** on exhaustion.
+   - **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Recoverable merge refusals never enter Steps 11–12. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
 
 ### 🔒 Gate 10 — Merge Gate + Merge PR
 
@@ -785,7 +874,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
    "{BKIT}" runs gate --squash-of="{PR_NUMBER}" --repo="{OWNER_REPO}" --capstone-only --record="{STATUS}"
    ```
    Hold `head` as `SQUASH_SHA`.
-2. Close the run. The block keeps the summary in the outbox (the close removes the worktree it lives in), lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, removes the worktree and `SHIP_BRANCH`, and returns to `REPO_ROOT`:
+2. Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is retained when conditional deletion cannot be guaranteed; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    ```bash
    "{BKIT}" workflows close --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --pr-number="{PR_NUMBER}" --squash-sha="{SQUASH_SHA}" --owner-repo="{OWNER_REPO}" --outbox="{OUTBOX}" --flush --token="{LOCK_TOKEN}" --branch="{SHIP_BRANCH}" --number=14 --post --title="Close Workflow" --final-return --summary="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --summary-missing="PR was already merged — no ship summary this run." --session-dir="{SESSION_DIR}"; rc=$?
@@ -811,7 +900,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 
 - [ ] Squash-merge CI capstone green (`runs gate`)
 - [ ] Close landed (`workflows close`)
-- [ ] Worktree removed and feature branch deleted, back in the repo root
+- [ ] Guarded cleanup and retained paths/refs reported, back in the repo root
 - [ ] Mechanical checks passed (`steps gate`)
 - [ ] Logs retained
 - [ ] Final return displayed
diff --git a/.agents/skills/bkit-ship/SKILL.md b/.agents/skills/bkit-ship/SKILL.md
index 9c17c3a76..2a8ca0c9c 100644
--- a/.agents/skills/bkit-ship/SKILL.md
+++ b/.agents/skills/bkit-ship/SKILL.md
@@ -41,7 +41,7 @@ description: "Ship Feature — Autonomous merge and archive"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path becomes it), checks artifacts and row, writes the row (ship: `--commit=none`, bookkeeping to `$BOOK_ROOT`), prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS.
+- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`. For `number` from 3 through 10, return to Step 3 instead, which compares recorded feature coverage before reusing completed agents. `after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS.
 - **Status:** `$BOOK_ROOT/.../status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Step 14 releases it via `bkit workflows close --flush --token=`, the **Failure Path** via `bkit workflows fail --token=`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
 - **Status branch:** From Step 2 all steps write `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (`{STATUS}`); `BOOK_ROOT` = `{WORKTREE_PATH}`. Stage path-scoped via `bkit ledgers commit`; NEVER stage all files (`-A`) or blanket `docs/`. One commit per flush block: Commit + Push Bookkeeping → `docs({FID}): ship bookkeeping bkit [skip ci]` → push `{SHIP_BRANCH}` (pre-merge: docs, logs, ledgers, skill removals); Close Workflow → `docs({FID}): ship DONE bkit [skip ci]`, **Failure Path** → `chore({FID}): ship FAILED bkit [skip ci]` → push `dev` from a throwaway `origin/dev` checkout; a refused close push → close PR.
@@ -216,10 +216,34 @@ description: "Ship Feature — Autonomous merge and archive"
    "{BKIT}" workflows input --workflow=ship --fid={FID} --run={RUN} --file="{STATUS}" --prompt-file="{SESSION_DIR}/prompt.md" --description-file="{SESSION_DIR}/issue-description.md" --comments-file="{SESSION_DIR}/issue-comments.json" --plan="docs/plans/{YYYYMM}/{FID}-plan.md" || exit 1
    ```
 2. Find the branch's PR — open first, then merged:
+   Reconcile and publish before probing or opening a PR, including on resume:
+
+   ```bash
+   "{BKIT}" branches sync --reconcile-feature --fid="{FID}" --file="{STATUS}"
+   ```
+
+   Route — first match wins:
+   - **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 2 → Step 4 sub-step 2.
+   - **If** exit 0 → hold `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD` → publish the resulting local head before sweep/docs bookkeeping.
+     ```bash
+     "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+     ```
+     Route:
+     **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
+   - **Else** → **Failure Path**.
+
    ```bash
-   "{BKIT}" prs probe --head="{SHIP_BRANCH}" --state=all
+   "{BKIT}" prs probe --head="{SHIP_BRANCH}" --base=dev --state=all --ship-entry --owner-repo="{OWNER_REPO}"
    ```
+
    Hold `number` as `PR_NUMBER`, `baseRefName` as `PR_BASE`, and hold `state`.
+   **If** exit 80 **or** `runtimeGithubCli` = false → read open PRs first, then merged PRs through MCP, independently reread the selected PR, and write `{ ownerRepo, headRefName, baseRefName: "dev", pr }` to `{OUTBOX}/ship-entry-facts.json`. `pr` is the complete `PrInfo` shape (`number`, `url`, `state`, `baseRefName`, `headRefName`, `headRefOid`, `title`, `mergeCommit`, `mergeable`), or null when neither exists. Record the single transport transition under **gh MCP fallback**, then use the engine's result:
+
+   ```bash
+   "{BKIT}" prs probe --head="{SHIP_BRANCH}" --base=dev --state=all --ship-entry --owner-repo="{OWNER_REPO}" --facts-file="{OUTBOX}/ship-entry-facts.json"
+   ```
+
+   Missing or mismatched facts → **Failure Path** before opening or merging anything. A merged PR with extra feature work returns exit 1: open a new PR, preserving that work.
    Route — first match wins:
    - **If** exit 0 **and** `PR_BASE` != dev → **Failure Path**.
    - **If** exit 0 → sub-step 3.
@@ -244,6 +268,7 @@ description: "Ship Feature — Autonomous merge and archive"
      Assert `PR_NUMBER` non-empty and `PR_BASE` = dev. **If** the assertion fails → **Failure Path**.
 
    - **Else** → **Failure Path**.
+
 3. Route:
    - **If** `state` = MERGED → record the resume marker → Step 13:
      ```bash
@@ -340,11 +365,21 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🤖 Step 3 — Base Check
 
-1. Determine whether `origin/dev` is an ancestor of the PR head:
+1. Reconcile again on every integration retry, then publish before selecting `BASE_PATH`:
+   ```bash
+   "{BKIT}" branches sync --reconcile-feature --fid="{FID}" --file="{STATUS}"
+   ```
+   Hold `basePath` as `BASE_PATH`, `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD`. **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 3 → Step 4 sub-step 2. **If** another non-zero exit → **Failure Path**.
+   ```bash
+   "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+   ```
+   Route:
+   **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
+   Compute the merge-aware feature coverage state:
    ```bash
-   "{BKIT}" branches sync --head="{ENTRY_HEAD}"
+   "{BKIT}" branches sync --feature-state --month="{YYYYMM}" --fid="{FID}"
    ```
-   Hold `basePath` as `BASE_PATH`.
+   Hold `featureCodeState` as `FEATURE_CODE_STATE`. Non-zero exit → **Failure Path**. Bookkeeping commits and proven automatic base-only merges retain coverage. New feature commits, imported feature merges and semantic conflict resolutions invalidate coverage. Unproven merge results remain in the state. Record this exact state with each successful sweep/docs completion below; read those rows from `{STATUS}` on resume.
 2. Route:
    - **If** `BASE_PATH` = A → Step 5 (skip integration — dev has not moved; no `bkit:generate`, because CI fails on a stale generated file and Step 10 regenerates when that is the only failure).
    - **If** `BASE_PATH` = B → Step 4 (integration required; its merge runs `bkit:generate`).
@@ -362,13 +397,17 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🧠 Step 4 — Integrate (Path B only)
 
-**Run only if** `BASE_PATH` = B.
+**Run only if** `BASE_PATH` = B **or** a feature reconciliation left `PENDING` conflicts.
 
 1. Merge `origin/dev` into `SHIP_BRANCH` locally. The block commits the run's uncommitted work first, unions the append-only ledgers, regenerates a conflicted lockfile from `dev`'s copy, rebuilds a conflicted generated register from `dev`'s copy, takes `dev`'s copy of the generated block in a conflicted embedding doc (a doc the register's script copies that block into) and merges the rest of that doc, merges a conflicted install record (`.bkit/version`) entry by entry with `dev`'s value where both sides changed an entry, runs a declared `bkit:generate`, and leaves every other conflict in the tree for sub-step 2. GitHub ignores `merge=union`, so the merged commit, not a server-side update or a rebase, is what makes the PR mergeable. No commit the block makes carries a skip token, so the sub-step 3 push starts CI at the merged head and Step 9 waits on that run:
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" branches sync --merge --fid="{FID}" --file="{STATUS}" --sentinel="docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"
+   git rev-parse --verify origin/dev
    ```
-   Hold `outcome` as `MERGE_OUTCOME`, `pending` as `PENDING`.
+   Hold the printed commit as `MERGE_TARGET`.
+   ```bash
+   cd "{WORKTREE_PATH}" && "{BKIT}" branches sync --merge --fid="{FID}" --file="{STATUS}" --target="{MERGE_TARGET}" --sentinel="docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"
+   ```
+   Hold `outcome` as `MERGE_OUTCOME`, `pending` as `PENDING`, `target` as `MERGE_TARGET`, and `head` as `CODE_HEAD` and `ENTRY_HEAD`. Set `RECONCILE_NEXT` empty for this dev integration.
    Route:
    - **If** exit 0 **and** `MERGE_OUTCOME` = merged → sub-step 3.
    - **If** exit 0 **and** `MERGE_OUTCOME` = current → Step 5. `dev` has not moved since Step 3.
@@ -376,7 +415,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **Else** → **Failure Path**. The block aborted the merge and wrote the sentinel.
 2. Resolve the conflicts the block left:
    1. **Subagent:** Invoke `@bkit-ship-conflict-resolve` using `Agent` tool:
-      Context: You are a subagent in the Ship phase. A merge of `origin/dev` is in progress with conflicts outside the ledgers, the lockfile, the generated register, the embedding docs and the install record: `{PENDING}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
+      Context: You are a subagent in the Ship phase. A merge of the engine-recorded target `{MERGE_TARGET}` is in progress with conflicts outside the ledgers, the lockfile, the generated register, the embedding docs and the install record: `{PENDING}`. Continue only this target. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
       Read: `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `{STATUS}`.
       Update: Conflicted source files.
       Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-conflict-resolve.md`.
@@ -387,14 +426,18 @@ description: "Ship Feature — Autonomous merge and archive"
    3. **If** `verdict` = PASS → sub-step 3. The subagent's re-run of the block committed the merge.
       **Else** → **Failure Path** (non-mechanical conflict → handover).
 3. Push the merged branch. The merge adds commits on top of the pushed head, so the push is plain, NEVER forced:
+
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+
    Route:
    - **If** exit 81 → end turn, re-run this block.
    - **If** exit 0 → continue with the next instruction.
    - **Else** → **Failure Path**.
 
+   **If** `RECONCILE_NEXT` is held → return there and reconcile again. **Else** → refresh `ENTRY_HEAD` and `CODE_HEAD` with `git rev-parse HEAD` → Step 5, which recomputes coverage after the integration and any conflict resolution.
+
 ### 🔒 Gate 4 — Integrate
 
 - [ ] Path classified
@@ -407,10 +450,15 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🤖 Step 5 — Deferred Sweep
 
-1. Fast-forward to the PR head, never onto a diverged branch:
-   ```bash
-   "{BKIT}" branches fast-forward --onto="origin/{SHIP_BRANCH}" >/dev/null || exit $?
-   ```
+Recompute coverage immediately before deciding whether to reuse the sweep:
+
+```bash
+"{BKIT}" branches sync --feature-state --month="{YYYYMM}" --fid="{FID}"
+```
+
+Refresh `FEATURE_CODE_STATE` from `featureCodeState`; non-zero exit → **Failure Path**.
+
+1. Read the latest successful `ship-feature-coverage` row for `step=ship-deferred-sweep` from `{STATUS}`. **If** its recorded feature-code state matches `FEATURE_CODE_STATE` and its artifact still exists → reuse it and skip to Step 6. **If** the state changed, differs or is missing → invoke the sweep again below. Never reuse a completion from a different feature state.
 2. Check for the plan:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" fids plans --fid="{FID}" --month="{YYYYMM}"
@@ -435,7 +483,10 @@ description: "Ship Feature — Autonomous merge and archive"
    "{BKIT}" steps finish --workflow=ship --step=ship-deferred-sweep --file="{STATUS}" --agent=bkit-ship-deferred-sweep --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md" --commit=none --number=5 --post --title="Deferred Sweep"
    ```
 4. Route:
-   - **If** `verdict` = PASS → Step 6.
+   - **If** `verdict` = PASS → record the covered feature-code state → Step 6:
+     ```bash
+     "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=ship-feature-coverage --field=step=ship-deferred-sweep --field="featureCodeState={FEATURE_CODE_STATE}" >/dev/null || exit 1
+     ```
    - **If** `verdict` = FAIL → write the `.deferred-blocked` sentinel below under `BOOK_ROOT`, then **Failure Path**.
      ```bash
      touch "{BOOK_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/.deferred-blocked"
@@ -444,7 +495,7 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ### 🔒 Gate 5 — Deferred Sweep
 
-- [ ] Worktree fast-forwarded
+- [ ] Reconciled feature-code state compared with recorded sweep coverage
 - [ ] Subagent invoked (`@bkit-ship-deferred-sweep`, no inline work)
 - [ ] Mechanical checks passed (`steps finish`)
 
@@ -452,6 +503,16 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🧠 Step 6 — Update Docs & Summary
 
+Refresh coverage again before deciding whether to reuse the docs artifact:
+
+```bash
+"{BKIT}" branches sync --feature-state --month="{YYYYMM}" --fid="{FID}"
+```
+
+Hold the current `featureCodeState` as `FEATURE_CODE_STATE`; non-zero exit → **Failure Path**.
+
+Read the latest successful `ship-feature-coverage` row for `step=ship-update-docs` from `{STATUS}`. **If** its recorded feature-code state matches `FEATURE_CODE_STATE` and the docs artifact exists → reuse it and skip sub-steps 1–3. **If** the state changed, differs or is missing → run the docs agent again. Always refresh the summary in sub-step 4.
+
 1. Write the FID's deferral lines to the artifact the docs agent reads `Pending Items` from:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" context ledger-scan --terms="{FID}" --source=docs/deferrals.jsonl --artifact="{OUTBOX}/ship-pending-items.md" --fid={FID} --step=ship-update-docs --reset-log >/dev/null || exit 1
@@ -465,6 +526,7 @@ description: "Ship Feature — Autonomous merge and archive"
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
    "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none || exit 1
+   "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=ship-feature-coverage --field=step=ship-update-docs --field="featureCodeState={FEATURE_CODE_STATE}" >/dev/null || exit 1
    ```
 4. Write `ship-summary.md` from this run's status rows and the PR's size:
    ```bash
@@ -536,6 +598,8 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🤖 Step 9 — Re-validate
 
+**If** `RECONCILE_REQUIRED` = true → clear it → Step 3 before validation. A previous `DONE` row alone never proves coverage of imported feature code.
+
 1. Resolve the head CI must pass at. The block re-validates when the code moved **or** `REVALIDATE_REASON` = `gate-refusal`: it probes for a run at it first, dispatches only when none, and waits for it to complete. Drop `--reason` when `REVALIDATE_REASON` is empty:
    ```bash
    "{BKIT}" runs revalidate --pr="{PR_NUMBER}" --entry-head="{ENTRY_HEAD}" --code-head="{CODE_HEAD}" --branch="{SHIP_BRANCH}" --month="{YYYYMM}" --fid="{FID}" --file="{STATUS}" --reason="{REVALIDATE_REASON}" --repo="{OWNER_REPO}"
@@ -557,10 +621,22 @@ description: "Ship Feature — Autonomous merge and archive"
 
 1. Assert the gate at the PR's current head, with CI checked at `VALIDATED_HEAD`. This gate is the ONLY merge precondition. The block writes the pre-merge snapshot to the outbox before the gate decides, refuses a title that carries a skip token (18), and records a refusal in `{STATUS}`:
    ```bash
-   "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fetch --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
+   "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fetch --fresh-base --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
+   ```
+   **If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
+   ```bash
+   "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fresh-base --facts-file="{OUTBOX}/ship-gate-facts.json" --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
    ```
    Route:
    - **If** exit 0 → hold `mergeHead` as `GATE_HEAD` → sub-step 2.
+   - **If** exit 19 (stale base) → the gate already recorded one failed arrival; route to integration:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path**, preserving the branch and worktree on exhaustion.
    - **If** exit 11 (in progress — poll), 14 (stale green), 10 (no run) **or** 17 (non-bookkeeping change past `VALIDATED_HEAD`) → route on the failed arrivals at Step 10, without asking:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
@@ -603,12 +679,16 @@ description: "Ship Feature — Autonomous merge and archive"
    ```
    Hold `state` as `STATE`, `labels` as `LABELS`. **If** exit 80 → read them via the tracker MCP (**Tracker**).
    ```bash
-   "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --delete-branch {LABEL_FLAGS} --expect-merged
+   "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --ship-retry --owner-repo="{OWNER_REPO}" {LABEL_FLAGS} --expect-merged
    ```
    Route:
-   - **If** exit 0 **or** 7 → hold `verdict` as `MERGE_VERDICT`, `failures` as `MERGE_FAILURES`, and hold `state`.
-   - **If** exit 80 → `pull_request_read` (`get`) and assert `base.ref` = `dev`; mismatch → **Failure Path** with nothing merged; then `merge_pull_request` and read `state` back through `pull_request_read` → `MERGE_VERDICT` = PASS and `MERGE_FAILURES` = 0 when merged, else FAIL and 1.
-   - **Else** (8: the PR's base is not `dev`, nothing merged) → **Failure Path**.
+   - **If** exit 0, 5, 7, 8, 9 **or** 10 → hold `route` as `MERGE_ROUTE`, `reason` as `MERGE_REASON`, `verdict` as `MERGE_VERDICT`, `failures` as `MERGE_FAILURES`, and hold `state` → sub-step 3. Missing output fields → **Failure Path**.
+   - **If** exit 80 **or** `runtimeGithubCli` = false → read fresh pre-attempt PR facts through `pull_request_read` (`get`). Refresh the scoped gate facts above with this PR, fresh CI and base evidence, and run that engine gate again before mutation. Only exit 0 authorizes `merge_pull_request`, with `sha` = the newly printed `GATE_HEAD`, the skip-token-free PR subject and an empty body. A gate refusal takes sub-step 1's route and consumes only its existing refusal row. After the attempt, independently reread post-attempt PR state through `pull_request_read`; never copy the mutation response or pre-attempt facts into `after`. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", matchHead, before, after }` to `{OUTBOX}/ship-merge-facts.json`, with complete `PrInfo` values for both reads and `matchHead` = `GATE_HEAD`. Missing or mismatched evidence → **Failure Path**. Record the single transport transition under **gh MCP fallback**, then classify without a second mutation:
+     ```bash
+     "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --ship-retry --owner-repo="{OWNER_REPO}" --facts-file="{OUTBOX}/ship-merge-facts.json" {LABEL_FLAGS} --expect-merged
+     ```
+     Hold the same route, reason, verdict, failures and state as the gh-backed result → sub-step 3.
+   - **Else** → **Failure Path**.
 3. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-merge-pr --file="{STATUS}" --verdict={MERGE_VERDICT} --failures={MERGE_FAILURES} --attempt=next --commit=none --number=10 --post --title="Merge Gate + Merge PR"
@@ -616,15 +696,24 @@ description: "Ship Feature — Autonomous merge and archive"
    Hold `attempt` as `MERGE_ATTEMPT`.
 4. Route:
    - **If** `state` = MERGED → Step 13.
-   - **If** `state` != MERGED → run counter routing:
+   - **If** `MERGE_ROUTE` = revalidate (exit 9) → Step 9 through the durable counter:
      ```bash
-     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-11 --exceeded=failure-path
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
      ```
      Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
-     - **If** exit 0 → Step 11.
-     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 11 → **Merge Question**.
+     Set `RECONCILE_REQUIRED` = true and `REVALIDATE_REASON` = gate-refusal, so imported feature work passes the state comparison and sweep/docs gates before CI.
+     - **If** exit 0 → Step 9.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 9 → **Merge Question**.
      - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
-   - **Else** → **Failure Path**.
+   - **If** `MERGE_ROUTE` = integrate (exit 10) → Step 3 through the same durable counter:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path** on exhaustion.
+   - **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Recoverable merge refusals never enter Steps 11–12. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
 
 ### 🔒 Gate 10 — Merge Gate + Merge PR
 
@@ -785,7 +874,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
    "{BKIT}" runs gate --squash-of="{PR_NUMBER}" --repo="{OWNER_REPO}" --capstone-only --record="{STATUS}"
    ```
    Hold `head` as `SQUASH_SHA`.
-2. Close the run. The block keeps the summary in the outbox (the close removes the worktree it lives in), lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, removes the worktree and `SHIP_BRANCH`, and returns to `REPO_ROOT`:
+2. Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is retained when conditional deletion cannot be guaranteed; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    ```bash
    "{BKIT}" workflows close --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --pr-number="{PR_NUMBER}" --squash-sha="{SQUASH_SHA}" --owner-repo="{OWNER_REPO}" --outbox="{OUTBOX}" --flush --token="{LOCK_TOKEN}" --branch="{SHIP_BRANCH}" --number=14 --post --title="Close Workflow" --final-return --summary="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --summary-missing="PR was already merged — no ship summary this run." --session-dir="{SESSION_DIR}"; rc=$?
@@ -811,7 +900,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 
 - [ ] Squash-merge CI capstone green (`runs gate`)
 - [ ] Close landed (`workflows close`)
-- [ ] Worktree removed and feature branch deleted, back in the repo root
+- [ ] Guarded cleanup and retained paths/refs reported, back in the repo root
 - [ ] Mechanical checks passed (`steps gate`)
 - [ ] Logs retained
 - [ ] Final return displayed
diff --git a/.bkit/cli.md b/.bkit/cli.md
index 9aa794e33..10686d9b3 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -83,7 +83,7 @@ Sync, push, land and rebase branches; stamp and read a doc's base-commit anchor.
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
 | `parse` | workflow | **`--prompt-file`** `--workflow` | Read an explicitly named or existing branch from the session prompt. |
-| `sync` | workflow | `--reconcile-feature` `--head` `--merge` `--merge-docs` `--fid` `--file` `--sentinel` | Fetch origin/dev; report whether it is an ancestor of HEAD (Path A/B) and how far docs/ and the ledgers are behind; optionally merge it in. |
+| `sync` | workflow | `--feature-state` `--month` `--reconcile-feature` `--head` `--merge` `--target` `--merge-docs` `--fid` `--file` `--sentinel` | Fetch origin/dev; report whether it is an ancestor of HEAD (Path A/B) and how far docs/ and the ledgers are behind; optionally merge it in. |
 | `regenerate` | workflow | `--fid` `--attempt` `--file` | Run a declared bkit:generate on the feature branch and commit only the paths it changed (ship Step 10's fix round). |
 | `push` | workflow | **`--mode`** `--set-upstream` `--ahead-of` `--commit` `--label` `--file` `--workflow` `--require-ci` `--open-pr` `--fid` | Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise; 81 tests lock held. |
 | `fast-forward` | workflow | **`--onto`** | Fetch a remote branch and fast-forward the checkout onto it; refuse when diverged. |
@@ -254,7 +254,7 @@ Open and probe pull requests, and audit the close transport.
 | --- | --- | --- | --- |
 | `open` | workflow | **`--fid`** **`--title`** `--issue` `--base` `--head` `--plan` `--note` `--existing` `--file` `--workflow` | Open a PR whose body carries the bkit:issue / bkit:fid marker (exit 80: use MCP). |
 | `probe` | by hand | `--head` `--base` `--state` `--number` `--ship-entry` `--owner-repo` `--facts-file` | The open (or open-then-merged) PR for a branch, or one PR by number. |
-| `merge` | workflow | **`--number`** `--subject` `--match-head` `--delete-branch` `--label` `--expect-merged` | Squash-merge a PR with an empty body (skipped when already MERGED) and read its state back. |
+| `merge` | workflow | `--ship-retry` `--facts-file` `--owner-repo` **`--number`** `--subject` `--match-head` `--delete-branch` `--label` `--expect-merged` | Squash-merge a PR with an empty body (skipped when already MERGED) and read its state back. |
 | `update-branch` | workflow | **`--number`** `--only-if-required` | Refresh a PR's head from its base server-side (exit 80: use update_pull_request_branch). |
 | `checks` | by hand | **`--number`** | A PR's check rollup, classified: green when present and none failed or pending (exit 80: use MCP). |
 | `verbose-ci` | workflow | **`--number`** **`--state`** | Add ` bkit [verbose ci]` to a PR title, or strip it (with an optional `bkit ` prefix); a no-op when already so. |
@@ -293,7 +293,7 @@ CI runs: wait for one, prove one was dispatched, re-validate and gate a merge on
 | `locate` | workflow | **`--prompt-file`** `--issue-text-file` **`--branch`** **`--repo`** `--file` **`--selection-out`** `--evidence-file` | Select and validate the red CI run for the adopted debug branch before local discovery: exit 0 selects red CI, 1 selects local discovery, 2 rejects arguments, 8 rejects ambiguous references, 80 requests read fallback, and 82 requires owner action for unavailable or mismatched evidence. |
 | `wait` | by hand | `--pr` `--head` `--branch` `--until` `--budget-s` `--interval-s` `--once` `--dispatch-if-absent` | Bounded poll for a CI check on a PR (--pr) or a CI run at a head (--head --branch), present or completed. |
 | `dispatch` | workflow | `--pr` `--sha` **`--fid`** `--label` `--file` `--workflow` `--step` `--artifact` `--field` `--budget-s` `--interval-s` `--poll-result` `--attempts` `--all-errored` `--retriggered` | CI-Dispatch Gate after the last push: poll, one clean re-trigger, the ciDispatch verdict, and the body scan. A run in place on dev has no PR: it polls the push-event run at the pushed sha, and its re-trigger commits and pushes only the run's own work. |
-| `gate` | workflow | `--ci-selection-file` `--head` `--pr` `--squash-of` `--snapshot` `--record` `--validated` `--month` `--fid` `--repo` `--branch` `--fetch` `--event` `--file` `--capstone-only` | Ship merge gate: the capstone job present and green at the head (exit 0), or why not. |
+| `gate` | workflow | `--ci-selection-file` `--fresh-base` `--facts-file` `--head` `--pr` `--squash-of` `--snapshot` `--record` `--validated` `--month` `--fid` `--repo` `--branch` `--fetch` `--event` `--file` `--capstone-only` | Ship merge gate: the capstone job present and green at the head (exit 0), or why not. |
 | `revalidate` | workflow | **`--pr`** **`--entry-head`** **`--code-head`** **`--branch`** **`--month`** **`--fid`** **`--file`** `--reason` `--repo` | Ship: pick the head CI must pass at, probe for a run there, dispatch only when none, wait for it to complete. |
 | `mirror` | workflow | **`--head`** `--branch` `--repo` `--ci-workflow` `--capstone` `--absent-minutes` `--max-minutes` `--interval-s` | Release PR: wait for the branch's push run at the head and copy its capstone verdict. |
 | `context` | workflow | **`--phase`** **`--arg`** `--marker` | /bkit-auto Step 1: the phase and mode, the repo, and the issue / FID / PR / run the dispatch carries. |
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index d0d3ada18..aaf13d1ce 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -83,7 +83,7 @@ Sync, push, land and rebase branches; stamp and read a doc's base-commit anchor.
 | Verb | Use | Flags | What it does |
 | --- | --- | --- | --- |
 | `parse` | workflow | **`--prompt-file`** `--workflow` | Read an explicitly named or existing branch from the session prompt. |
-| `sync` | workflow | `--reconcile-feature` `--head` `--merge` `--merge-docs` `--fid` `--file` `--sentinel` | Fetch origin/dev; report whether it is an ancestor of HEAD (Path A/B) and how far docs/ and the ledgers are behind; optionally merge it in. |
+| `sync` | workflow | `--feature-state` `--month` `--reconcile-feature` `--head` `--merge` `--target` `--merge-docs` `--fid` `--file` `--sentinel` | Fetch origin/dev; report whether it is an ancestor of HEAD (Path A/B) and how far docs/ and the ledgers are behind; optionally merge it in. |
 | `regenerate` | workflow | `--fid` `--attempt` `--file` | Run a declared bkit:generate on the feature branch and commit only the paths it changed (ship Step 10's fix round). |
 | `push` | workflow | **`--mode`** `--set-upstream` `--ahead-of` `--commit` `--label` `--file` `--workflow` `--require-ci` `--open-pr` `--fid` | Push the current branch with exactly one git push: plain for dev/main, --force-with-lease otherwise; 81 tests lock held. |
 | `fast-forward` | workflow | **`--onto`** | Fetch a remote branch and fast-forward the checkout onto it; refuse when diverged. |
@@ -254,7 +254,7 @@ Open and probe pull requests, and audit the close transport.
 | --- | --- | --- | --- |
 | `open` | workflow | **`--fid`** **`--title`** `--issue` `--base` `--head` `--plan` `--note` `--existing` `--file` `--workflow` | Open a PR whose body carries the bkit:issue / bkit:fid marker (exit 80: use MCP). |
 | `probe` | by hand | `--head` `--base` `--state` `--number` `--ship-entry` `--owner-repo` `--facts-file` | The open (or open-then-merged) PR for a branch, or one PR by number. |
-| `merge` | workflow | **`--number`** `--subject` `--match-head` `--delete-branch` `--label` `--expect-merged` | Squash-merge a PR with an empty body (skipped when already MERGED) and read its state back. |
+| `merge` | workflow | `--ship-retry` `--facts-file` `--owner-repo` **`--number`** `--subject` `--match-head` `--delete-branch` `--label` `--expect-merged` | Squash-merge a PR with an empty body (skipped when already MERGED) and read its state back. |
 | `update-branch` | workflow | **`--number`** `--only-if-required` | Refresh a PR's head from its base server-side (exit 80: use update_pull_request_branch). |
 | `checks` | by hand | **`--number`** | A PR's check rollup, classified: green when present and none failed or pending (exit 80: use MCP). |
 | `verbose-ci` | workflow | **`--number`** **`--state`** | Add ` bkit [verbose ci]` to a PR title, or strip it (with an optional `bkit ` prefix); a no-op when already so. |
@@ -293,7 +293,7 @@ CI runs: wait for one, prove one was dispatched, re-validate and gate a merge on
 | `locate` | workflow | **`--prompt-file`** `--issue-text-file` **`--branch`** **`--repo`** `--file` **`--selection-out`** `--evidence-file` | Select and validate the red CI run for the adopted debug branch before local discovery: exit 0 selects red CI, 1 selects local discovery, 2 rejects arguments, 8 rejects ambiguous references, 80 requests read fallback, and 82 requires owner action for unavailable or mismatched evidence. |
 | `wait` | by hand | `--pr` `--head` `--branch` `--until` `--budget-s` `--interval-s` `--once` `--dispatch-if-absent` | Bounded poll for a CI check on a PR (--pr) or a CI run at a head (--head --branch), present or completed. |
 | `dispatch` | workflow | `--pr` `--sha` **`--fid`** `--label` `--file` `--workflow` `--step` `--artifact` `--field` `--budget-s` `--interval-s` `--poll-result` `--attempts` `--all-errored` `--retriggered` | CI-Dispatch Gate after the last push: poll, one clean re-trigger, the ciDispatch verdict, and the body scan. A run in place on dev has no PR: it polls the push-event run at the pushed sha, and its re-trigger commits and pushes only the run's own work. |
-| `gate` | workflow | `--ci-selection-file` `--head` `--pr` `--squash-of` `--snapshot` `--record` `--validated` `--month` `--fid` `--repo` `--branch` `--fetch` `--event` `--file` `--capstone-only` | Ship merge gate: the capstone job present and green at the head (exit 0), or why not. |
+| `gate` | workflow | `--ci-selection-file` `--fresh-base` `--facts-file` `--head` `--pr` `--squash-of` `--snapshot` `--record` `--validated` `--month` `--fid` `--repo` `--branch` `--fetch` `--event` `--file` `--capstone-only` | Ship merge gate: the capstone job present and green at the head (exit 0), or why not. |
 | `revalidate` | workflow | **`--pr`** **`--entry-head`** **`--code-head`** **`--branch`** **`--month`** **`--fid`** **`--file`** `--reason` `--repo` | Ship: pick the head CI must pass at, probe for a run there, dispatch only when none, wait for it to complete. |
 | `mirror` | workflow | **`--head`** `--branch` `--repo` `--ci-workflow` `--capstone` `--absent-minutes` `--max-minutes` `--interval-s` | Release PR: wait for the branch's push run at the head and copy its capstone verdict. |
 | `context` | workflow | **`--phase`** **`--arg`** `--marker` | /bkit-auto Step 1: the phase and mode, the repo, and the issue / FID / PR / run the dispatch carries. |
diff --git a/.bkit/core/.bkit/prompts.md b/.bkit/core/.bkit/prompts.md
index 1438aa26c..2f9d05c9d 100644
--- a/.bkit/core/.bkit/prompts.md
+++ b/.bkit/core/.bkit/prompts.md
@@ -357,7 +357,7 @@ Cursor Cloud automation uses `composer-2.5` for metadata / API plumbing, and the
 <!-- prettier-ignore -->
 | Agent | Scope |
 | --- | --- |
-| `bkit-ship-conflict-resolve` | Mid-merge mechanical conflict resolver. Invoked from `/bkit-ship` Step 4 when `bkit branches sync --merge` exits 24: the merge of `origin/dev` is in progress with its ledgers, lockfile, generated register, embedding docs and install record already resolved, and the agent hand-resolves only the paths left conflicted, then re-runs the block, which commits the merge. Allowed: non-overlapping additive edits, formatting drift, dep-version supersedes, additive JSON entries. Refused: same-function edits, semantic overlaps, ambiguous intent — FAIL aborts the merge cleanly and routes to `bkit-debug-abort-handover`. Verifies via `bkit:gate:install-static-unit-build` before PASS. |
+| `bkit-ship-conflict-resolve` | Mid-merge mechanical conflict resolver. Invoked from `/bkit-ship` Step 4 when `bkit branches sync --merge --target={sha}` exits 24. The supplied target is the pinned merge target, which must equal `MERGE_HEAD`; it may be the reconciled feature tip or fetched `dev` tip. The engine has already resolved ledgers, the lockfile, generated register, embedding docs and install record. The agent resolves only the remaining paths and re-runs the same target, which commits the merge. Allowed: non-overlapping additive edits, formatting drift, dep-version supersedes, additive JSON entries. Refused: same-function edits, semantic overlaps, ambiguous intent — FAIL aborts the merge cleanly and routes to `bkit-debug-abort-handover`. Verifies via `bkit:gate:install-static-unit-build` before PASS. |
 | `bkit-ship-deferred-sweep` | Pre-merge completeness gate. Builds the intended-delivery set from plan `Acceptance Scenario` sections + `DONE WHEN` fields and asserts each against the codebase. No plan file → `ship-input-*.md` is the plan; intended-delivery set = its requested outcomes. An unmet / unplanned gap → FAIL → Failure Path (merge never happens) only on >=1 of four blocking tests, each asserted against source, never inferred from a plan sentence: behaviour (absent / stub / wrong result), safety (guard weakened, known-broken path ships), false green (`bkit branches scan-diff --disabled-tests` names candidates; every hit is adjudicated against the base diff and current source), consumer break (shipped surface fails at runtime). Removed assertions need precise evidence of enabled equivalent coverage or an owner-approved retirement that leaves no current requirement uncovered; record each disposition under `Test Coverage Review`. Scan errors, actual disabling markers and missing or inconclusive coverage stay blocking, never exempt or lazy. Lane results are not evidence — bkit lanes are event-scoped, some push-to-`dev` only, so a pre-merge sweep reading them re-creates the unsatisfiable refusal that made gate code 16 opt-in; the gate + capstone own green. A gap passing none is `Lazy`: stale prose / comment / name, doc drift, unwritten ledger row, formatting, future-enhancement `TODO`, `DONE WHEN` met in substance not literal wording. Branch is green by this step, so aborting on a record-keeping gap leaves the work unmerged and the record unwritten. Declared deferrals (out-of-scope / future-work / non-goals across design, plan, `docs/deferrals.jsonl`, summaries) form the exempt set — never block, resurfaced verbatim in the ship summary's `Deferred & Out-of-Scope (Resurfaced)` section. Exemption is earned, not self-granted: the prompt holds no reason test — `bkit ledgers triage --fid= --plan=` applies the deferral tests and writes every `unjustified` / `TRIAGED` row itself, printing each plan-related row's `key`, `bucket` and test result, and one that fails moves to that third track `Lazy (unjustified)`, resurfaced as follow-up, never blocking the merge (a bounded fix is cheaper than an aborted ship). Both `Lazy` sources share one append shape; every item carries its row before the verdict is set. The intended-delivery set is those two sources and nothing else — every precondition, build process step and merge condition a plan states is advisory, never a gate: plan `Gate N` checkboxes, `Verification Plan` boxes and `Manual Verification` steps are build-phase process, never deliverables, and no phrasing in a plan, log or phase summary makes one blocking (the gate reaches only what the repo can be made to prove; the plan template carries the matching authoring rule). Invoked from `/bkit-ship` Step 5 (after Conflict Resolve, before Merge). |
 | `bkit-ship-update-docs` | Cross-reference changed files against every doc in `docs.md`; update stale. `Pending Items` comes from the `ship-pending-items.md` deferral scan the workflow writes with `bkit context ledger-scan --terms={FID} --source=docs/deferrals.jsonl`; the agent writes no ledger row and reads no `docs/deferrals.jsonl` directly. |
 
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index d093f2643..ada5e0a10 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -109,7 +109,7 @@ Rendering can be re-run: the source carries every wired variant, so a tracker sw
 - **Ship Step 6 fold runs after the two subagents and stages nothing itself:** the same fence runs `bkit roadmap feature --root="$WT" --step=ship-update-docs` (`$WT` = `{WORKTREE_PATH}`), which appends the `SHIPPED` row and folds. Both paths ride the PR in Step 8's `--scope=pr` commit (§ `/bkit-ship` — Docs and bookkeeping ride the PR). `DOCS_VERDICT` requires the command to report the row appended with `status` = `SHIPPED`. A `BUILT` row from the build close must not turn it green.
 - **Phase closes are mechanical-tier only:** a ship close writes its own feature's ledger row and re-renders the `roadmap-status` board. It runs no analysis, because analysis is a review a human invokes, never a cost paid on every ship.
 - **Ship re-validate probes before dispatching:** the head move already fires `pull_request` at that SHA. `bkit-ci.yml` keys `pull_request` concurrency by PR number and `workflow_dispatch` by ref. These are separate groups, so a duplicate is never cancelled and burns a full run. `bkit runs wait --head=<VALIDATED_HEAD> --until=present --dispatch-if-absent` probes for a run at that SHA (6 polls) and dispatches only when there is no run. The probe is never a pass condition. It uses `--head`, not `--pr`: a PR target reads the PR head's `statusCheckRollup`, and the PR head (ship's `[skip ci]` bookkeeping commit) never gets a run. Run targets are anchored to the head, because the newest run on the branch can be a COMPLETED run from a superseded head.
-- **Gate refusal re-enters the poll, not the sweep:** codes 10 / 11 / 14 / 17 are CI state, which the sweep cannot change. The sweep's verdict is a function of branch content, and it is a high-effort leaf. If head movement were the only trigger, code 10 would have no path to dispatch and would refuse forever. Re-entry carries `REVALIDATE_REASON=gate-refusal` and only probes and polls. It is bounded by `ship.merge.maxAttempts`, which counts `ship-gate-refusal` rows plus `ship-merge-pr` rows (`counters route --of=ship-merge-pr:count --rows=ship-gate-refusal:count`). A refusal writes no `step-done` row, so its audit row is what counts it.
+- **Ship retries reuse only matching feature coverage:** gate codes 10 / 11 / 14 / 17 return to CI validation, and fresh-base code 19 returns to reconciliation and integration. Merge refusals use `route=revalidate` when the head moved and `route=integrate` for a conflict with dev. Each gate refusal or attempted merge consumes one arrival in `ship.merge.maxAttempts`. `branches sync --feature-state` recomputes coverage before each sweep/docs reuse decision. Imported feature merges and semantic conflict resolutions invalidate coverage; bookkeeping and proven automatic dev-only merges retain it.
 - **Build close-workflow push does not trigger CI:** there is no PR yet. `bkit prs open` on the pushed HEAD is the single CI trigger.
 - **Design / plan close on HARD STOP:** a human must review before the next phase.
 - **No archive step in ship:** artifacts sit at the canonical `docs/plans/{YYYYMM}/` from the start of design, so there is nothing to move at close.
@@ -1066,21 +1066,21 @@ The following table describes the local discovery route and shared step mechanic
 
 ### `/bkit-ship` — 14 steps
 
-**Goal:** verify the PR, land docs and bookkeeping on it, merge to `dev`, and clean up the worktree. Staging is path-scoped via `bkit ledgers commit` (frozen allow-list). `BOOK_ROOT` = `{WORKTREE_PATH}` resolves the single tree every status write targets. `{OUTBOX}` (`.bkit/cli.md`) survives the Step 14 worktree removal.
+**Goal:** reconcile the local and remote feature branches, verify the resulting PR, land docs and bookkeeping on it, merge to `dev`, and remove only landed work. Staging is path-scoped via `bkit ledgers commit` (frozen allow-list). `BOOK_ROOT` = `{WORKTREE_PATH}` resolves the single tree every status write targets. `{OUTBOX}` (`.bkit/cli.md`) survives guarded cleanup.
 
 **Summary is displayed verbatim before the Failure Path.** A FAIL summary's `Recommended Next Step` is the only handoff that reaches a human on that route, because the Close Workflow step's final return is unreachable once the run enters the Failure Path. All five phase workflows carry it.
 
 **One `git push` per standalone push step.** The permission layer reads the whole command string, so an unexecuted `--force-with-lease` arm in a `case`/`||` chain makes a plain push read as a force-push and the call is refused. Carried in the `Git:` caution bullet of all five phase workflows.
 
-**`ship-merged-on-entry` marks the resume route.** Sub-step 8 is skipped when the PR is already MERGED, so without the row an auditor cannot separate that route from a run that dropped `ship-worktree-setup` / `ship-regression-guard` rows. The route goes to Step 13: Steps 3-12 ride or merge the PR, and a merged PR carries nothing more. On a resume after a crash past the merge, the docs are already on `dev`. When the PR was merged by hand before ship, there is no docs sync and no summary.
+**`ship-merged-on-entry` requires current feature evidence.** `prs probe --ship-entry` checks local and freshly fetched remote feature work against dev before accepting a merged PR. Extra work returns the no-PR route so ship opens a new PR. Unreadable evidence refuses the shortcut. Only a branch with no remaining feature work records the marker and goes to Step 13; that route runs no docs sync and may have no summary.
 
 **Gate asserts carry `--branch`.** The gate's head-keyed run query is filtered server-side, so a moved head returns an empty list whether CI never ran or ran at a superseded SHA; only a second, branch-scoped query separates exit 14 from exit 10. Ship passes `--file={STATUS}` so an override audit row lands in the run's own `BOOK_ROOT` log. When the file is absent or unwritable, the row goes to stderr, so it is never invisible.
 
 **Docs and bookkeeping ride the PR (Steps 5-8):**
 
 - Sweep → docs sync + summary → skill prune → one `--scope=pr` `[skip ci]` commit → plain push to `{SHIP_BRANCH}`; all in the feature worktree, before the merge. The merge carries docs, logs, ledgers, the `SHIPPED` row (`$WT/.bkit/issues.jsonl`) and skill removals to `dev`.
-- Pre-merge, every ship write has a publish channel on every runtime: post-merge, a cloud runtime cannot push `dev`, and the merge's `--delete-branch` removes the only branch it can.
-- Pre-merge pushes to `{SHIP_BRANCH}` happen only in these steps, none forced: opening a missing PR (Step 2), the Path B merge push (Step 4), Commit + Push Bookkeeping (Step 8), the regenerate round (Step 10) and a Failure Remediate fix (Step 12) (`.bkit/core/engine/audits/workflows/ship-invariants.test.ts`).
+- Pre-merge, every ship write has a publish channel on every runtime. The merge leaves branch deletion to guarded close, so newer feature work remains available after the PR lands.
+- Pre-merge pushes to `{SHIP_BRANCH}` happen only in these steps, none forced: feature reconciliation and a missing PR (Step 2), reconciliation before base classification (Step 3), integration (Step 4), Commit + Push Bookkeeping (Step 8), regeneration (Step 10) and Failure Remediate (Step 12). Reconciled unpublished work has a CI-running head before the bookkeeping commit.
 - A Summary FAIL stops the merge. `@bkit-ship-update-docs` reads `git log origin/dev..HEAD` against the unmerged branch, so it sees the shipped commits. `ship-deferred-sweep.md` rides the same commit.
 
 **Validated-head carry-forward (Step 9 + gate `--validated`):**
@@ -1089,7 +1089,9 @@ The following table describes the local discovery route and shared step mechanic
 - The `--scope=pr` allow-list is the frozen list, top-level `docs/*.md` and the globs in the repo's `bkit.testing.ciSkipPaths`. A repo lists in `ciSkipPaths` the project docs it keeps outside `docs/`, such as a `CHANGELOG.md`. The globs work as in `bkit.testing.minPushPaths` (`.bkit/templates.md` § Git hooks — Husky), and install seeds `[]`. The engine names no such file itself, and a glob that matches nothing selects nothing.
 - This is the one definition of ship's bookkeeping. Ship's Step 8 commit, `bkit ledgers only-bookkeeping`, the merge gate's carry-forward, `bkit ci min-push` and the pre-push hook's `bkit ci bookkeeping-push` all read it, so ship's `[skip ci]` bookkeeping push reaches the open PR.
 - CI is awaited only when `VALIDATED_HEAD` != `ENTRY_HEAD`, or on gate-refusal re-entry, so a PR that arrives green costs zero extra runs. Path B pays one run: the Step 4 merge of `origin/dev` moves the head, and Step 9 dispatches CI at the merged head, so a clash between the branch and newer `dev` commits surfaces as a red PR before the merge, not as a red `dev` push run after it.
-- GitHub's `mergeable` can be wrong on large diffs, and it ignores `merge=union`, so ship never reads it: Step 4 merges locally, and a merge GitHub still refuses goes through Steps 11-12 like any refused merge.
+- Step 4 integrates dev locally because GitHub ignores `merge=union`. After an attempted merge, `prs merge --ship-retry` independently rereads the PR: moved head returns to validation, a new conflict returns to integration, and other refusals stop with a reason. These refusals do not enter CI diagnosis or remediation.
+- `runs gate --fresh-base` reads fresh dev evidence and requires dev to be an ancestor of the validated code head, before accepting a CI override or bookkeeping carry-forward. Stale dev exits 19 and returns to integration within the merge allowance; missing or mismatched evidence exits 20. Scoped MCP fact files go through the same engine decisions.
+- The freshness check and GitHub's merge request are separate API operations. The request pins the feature head but cannot atomically pin the base. Dev may move in that interval; the post-merge squash capstone remains the detection boundary for that residual race.
 - `bkit runs gate --head=<PR head> --validated=<VALIDATED_HEAD> --month= --fid=` re-checks the relation itself (non-bookkeeping change or non-ancestor → code 17), then runs every check at the validated SHA. `--match-head-commit <PR head>` still pins what merges.
 - The bookkeeping commit merges untested. `lint-staged` formats it at commit, and post-merge `dev` CI (`ship-merge-ci` row) is the backstop.
 - When `dev` requires status checks (classic protection or ruleset), GitHub refuses a head with no run, so Step 9 probes both and validates at the PR head.
@@ -1098,7 +1100,8 @@ The following table describes the local discovery route and shared step mechanic
 
 - The `ship-merge-ci` row (verdict + reason) is written before a red result routes to **Failure Path**. A red merge is recorded, never inferred from a missing close row.
 - Close commit built in a throwaway `.worktrees/_land-{FID}` off `origin/dev` (book's logs copied, ledgers via `bkit ledgers union`) → push `dev`; `dev` moved → rebuilt, pushed again; refused → `ship-close/{FID}` PR, squash subject `[skip ci]`; a PR GitHub refuses to merge stays open for a human, worktree kept.
-- The feature worktree and `{SHIP_BRANCH}` are removed only once the close is on `dev`, because the book lives there until then.
+- Cleanup runs only after the close record reaches `dev`. The shared landed comparison checks file content, mode and type, and cleanup separately proves index and working-tree state. Dirty, unlanded, changed or unreadable evidence preserves the worktree/ref and reports the reason; a local ref deletion is bound to the inspected tip.
+- The remote feature ref is retained when conditional deletion cannot be guaranteed under the no-force-push policy. This does not block close-record landing or lock release. GitHub's repository-managed automatic branch deletion is a separate setting outside this guarantee.
 - `bkit ledgers union` never carries `.bkit/issues.jsonl`: the `SHIPPED` row is pre-merge, so unioning it into `dev` after a pre-merge failure would mark an unmerged feature shipped.
 
 **Tier-1 carrier:** `bkit runs gate` + `bkit ledgers` + the `TIMEOUTS` table (`commands/workflow/runs.test.ts`, `commands/workflow/ledgers.test.ts`, `.bkit/core/engine/shared/timeouts.test.ts`). **Tier-2 carrier:** `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` (no `git add -A`, `bkit ledgers` staging, `BOOK_ROOT` status writes, `--match-head-commit`, canonical 14 step keys, pre-merge pushes confined to Step 2 PR open + Step 4 merge push + Commit + Push Bookkeeping, none forced, no hand-written `dev` checkout or push, `.deferred-blocked` writer under `BOOK_ROOT`). **Tier-3 carrier:** detector corpus.
@@ -1107,20 +1110,20 @@ The following table describes the local discovery route and shared step mechanic
 | Step | Subagent(s) | Notes |
 | --- | --- | --- |
 | 1 — Start Workflow | — | Resolve `FID` (issue recovery as in design Step 1; issue-less: tracker reads, labels and comments skipped); `bkit runtime detect` → `RUNTIME_WORKTREES`; `bkit locks acquire` (main checkout; missing month bucket → current UTC month); straight after the lock, before any tracker write, `bkit worktrees setup --workflow=ship [--branch=] [--issue=]` resolves `SHIP_BRANCH` (see Branch eligibility), creates / resumes (no rebase) / adopts, writes the `.worktree-owned` marker to the outbox only for a worktree it created, and prints `branchWarning`; in the worktree `bkit status path` → `BOOK_ROOT`, `bkit workflows start --branch={SHIP_BRANCH}` refuses a checkout on another branch (exit 15, before any row), clears the stale `.deferred-blocked` / `.rebase-failed` sentinels and opens the run (its log lives in the worktree), `bkit runtime row` — so every later failure has a book to keep its record in; create `{OUTBOX}`; preflight `actions: write` once; set label `Ship`, `In Progress`. no commits on `dev`. |
-| 2 — Verify PR (Worktree Setup + Regression Guard) | — | `ship-input-{RUN}.md` in the worktree (includes the plan when there is one). `bkit prs probe --head={SHIP_BRANCH} --state=all` → `PR_NUMBER`, `ENTRY_HEAD`. No PR → `bkit branches push --mode=plain --set-upstream --ahead-of=origin/dev` (feature branch only, never forced; nothing ahead or on `dev` / `main` → exit 21 `Nothing to ship` → Failure Path), `bkit prs open --file={STATUS} --workflow=ship` into `dev` (an `engine-action` row makes a re-run reuse the PR, never open a second; `workflow-meta` `openedPr:true`), wait for its CI, `bkit prs checks` (not green → Failure Path). Already MERGED → `ship-merged-on-entry` → Step 13. Regression guard: `bkit runs wait --pr= --until=present` (no CI run for PR HEAD → FAIL), then `--until=completed`. |
+| 2 — Verify PR (Worktree Setup + Regression Guard) | — | Reconcile through `branches sync --reconcile-feature` before PR lookup, then plain-push the reconciled CI-running head. Setup and each reconciliation candidate refuse inherited unpublished dev commits. `prs probe --ship-entry` qualifies open/merged PRs against fresh feature evidence; no PR or extra work beyond a merged PR opens a new PR into dev. Scoped MCP facts pass through the same engine classifier. Record `ENTRY_HEAD`, then check the PR's CI. A safely qualified merged PR records `ship-merged-on-entry` and goes to Step 13. |
 | Confirm Assumed Items | — | `bkit decisions pending` lists the build's `Decision: Accept (assumed)` items nobody confirmed. In a session (never headless; `ship.merge.ask` does not apply) the orchestrator asks `Confirm` / `Reject` per item; `bkit decisions apply --by=owner` writes the answer (confirm → the real acceptance, a `docs/decisions.jsonl` row). Then `pending --defer` writes one `needs-decision` deferral per item still unconfirmed, and ship carries on and merges; `bkit workflows summary` adds a `## Ship Completed with Assumed Items` heading listing them. |
-| 3 — Base Check | — | `bkit branches sync --head=<ENTRY_HEAD>` → `basePath`: A (`origin/dev` is an ancestor) → Step 5; B → Step 4. Path A runs no `bkit:generate` and pushes nothing: CI fails on a stale generated file (`CI_GENERATED_FLOOR` plus `bkit.testing.ciGenerated`), and Step 10's regenerate round runs only when every failed CI step is one of those. |
-| 4 — Integrate (Path B only) | `@bkit-ship-conflict-resolve` (exit 24 only) | `bkit branches sync --merge --fid= --file={STATUS} --sentinel=` merges `origin/dev` into `SHIP_BRANCH` locally: it commits the run's uncommitted work first (`chore({FID}): carry uncommitted work before merging dev`), merges (`chore({FID}): merge dev`), unions the append-only ledgers, takes a conflicted lockfile from `dev` and regenerates it, takes a conflicted generated register from `dev` with the branch's edit to its hand-written region, takes a conflicted embedding doc's generated block from `dev` and merges the rest of that doc, merges a conflicted install record entry by entry with `dev`'s value where both sides changed an entry, then rebuilds the register and commits it, runs a declared `bkit:generate` and commits its output, and records an `engine-action` `merge` row. `outcome` merged → `bkit branches push --mode=plain` → Step 5; `current` (`dev` has not moved since Step 3) → Step 5; exit 24 (`pending`: conflicts outside the ledgers, lockfile, generated register, embedding docs and install record, merge left in progress) → `@bkit-ship-conflict-resolve` resolves them by hand and re-runs the block, which commits the merge: PASS → plain push → Step 5, FAIL → `git merge --abort` → Failure Path; any other exit → the block aborted the merge and wrote `.rebase-failed` → Failure Path. GitHub's `mergeable` is never read, because it ignores `merge=union`. |
-| 5 — Deferred Sweep | `@bkit-ship-deferred-sweep` | `bkit branches fast-forward --onto=origin/{SHIP_BRANCH}` (fetch failed → exit 10, diverged → exit 22; both → Failure Path). No `{FID}-plan.md` → warning: every build writes one, so the branch was not built by `/bkit-build`. Two engine verbs settle the sweep's mechanical facts: `bkit branches scan-diff --disabled-tests --base=origin/dev` (exit 1 → its `disabled` list holds each hit's `file:line` and test name → `Blocking Deferrals` → FAIL) and `bkit ledgers triage --fid= --plan=` (applies the deferral tests, writes each `unjustified` / `TRIAGED` row, prints each row's `key`, `bucket` and test result). `@bkit-ship-deferred-sweep`: PASS → Step 6; FAIL touches `$BOOK_ROOT/.../logs/{FID}/.deferred-blocked` → Failure Path (merge never happens). First pass only — gate-refusal re-entry lands at Step 9. |
-| 6 — Update Docs & Summary | `@bkit-ship-update-docs`, then `bkit workflows summary --pr={PR_NUMBER}` | `bkit context ledger-scan --terms={FID} --source=docs/deferrals.jsonl --artifact={OUTBOX}/ship-pending-items.md` writes the deferral scan the docs agent fills `Pending Items` from — the agent reads that artifact, never `docs/deferrals.jsonl`, and writes no ledger row. `update-docs` runs in `{WORKTREE_PATH}`, writes `ship-update-docs.md` + edits cataloged docs. Then `bkit roadmap feature --root=$WT` appends the `SHIPPED` row and folds the board — `DOCS_VERDICT` requires it appended with `status` = `SHIPPED`. The summary writes `ship-summary.md` with the PR's size from `gh pr view` (line dropped when `gh` fails). Summary FAIL → Failure Path before any merge. |
+| 3 — Base Check | — | Reconcile and plain-push again on every integration retry before selecting `basePath`: A → Step 5; B → Step 4. `branches sync --feature-state` computes merge-aware coverage, excluding proven automatic dev-only merges and bookkeeping. New local or imported feature work invalidates prior sweep/docs coverage. A pending feature merge passes the engine's actual target to Step 4 and returns here after resolution. |
+| 4 — Integrate (Path B only) | `@bkit-ship-conflict-resolve` (exit 24 only) | `branches sync --merge --target=<pinned target>` integrates dev locally, or continues the recorded feature merge. Existing mechanical settlement handles ledgers, lockfile, generated register, embedding docs and install record, then generation. Unresolved semantic paths remain in progress for the resolver, which verifies `MERGE_HEAD` equals the caller's target. Success plain-pushes, then returns to the recorded reconciliation step or Step 5. Other failures preserve/report the existing failure evidence. |
+| 5 — Deferred Sweep | `@bkit-ship-deferred-sweep` | Recompute feature coverage after integration, then compare the recorded successful `ship-feature-coverage` state and artifact before reuse; changed or missing state reruns the sweep. The sweep uses `branches scan-diff --disabled-tests` and `ledgers triage` for mechanical facts. PASS records the covered state; FAIL writes `.deferred-blocked` and stops before merge. Missing plans are warned and the ship input supplies intended outcomes. |
+| 6 — Update Docs & Summary | `@bkit-ship-update-docs`, then `bkit workflows summary --pr={PR_NUMBER}` | Recompute coverage and reuse docs work only with matching recorded feature coverage and an existing artifact; otherwise rerun the docs agent. `context ledger-scan` supplies its pending-item artifact. `roadmap feature` appends `SHIPPED` and folds the board before recording successful docs coverage. Refresh the summary on every pass; a FAIL summary stops the merge. |
 | 7 — Prune Skills | — | `bkit skills prune` in the worktree: uninstalls every non-`bkit-*` skill `.agents/skills.md` does not list (whole-name match). Warns and carries on: a missing registry skips the prune, a failed uninstall is listed in `failed`. Reconciles the union of on-disk `.agents/skills/` directories and `skills-lock.json` keys — a disk-only scan strands lock entries whose directory was removed out-of-band. |
 | 8 — Commit + Push Bookkeeping | — | Record `CODE_HEAD`; `ship-bookkeeping-push` row first; one `bkit ledgers commit --scope=pr` commit `docs({FID}): ship bookkeeping bkit [skip ci]` (docs, FID logs, ledgers, skill removals; refuses on `dev`, `main` or a detached HEAD, exit 12); `bkit branches push --mode=plain` to `{SHIP_BRANCH}` only when `outcome` = committed — an unconditional push would start a CI run on every ship. |
 | 9 — Re-validate | — | Resolve `VALIDATED_HEAD` (carry-forward above). Wait only when `VALIDATED_HEAD` != `ENTRY_HEAD` **or** `REVALIDATE_REASON` = `gate-refusal`: `bkit runs wait --head=<VALIDATED_HEAD> --until=present --dispatch-if-absent` (6 polls; `gh workflow run {bkit.testing.ciWorkflow}` only on no-run, then `VALIDATED_HEAD` = PR head) → `ship-revalidate-dispatch` row → head-anchored `--until=completed` (`SHIP_CI_WAIT_TIMEOUT_S`; budget exhausted → `ship-revalidate-timeout` row → Failure Path) → Step 10. |
-| 10 — Merge Gate + Merge PR | — | `bkit runs gate --pr= --validated=<VALIDATED_HEAD> --branch= --fetch --file= --snapshot={OUTBOX}/pre-merge-snapshot.jsonl --record={STATUS}` — the only merge precondition: the snapshot (PR head, `VALIDATED_HEAD`, dev SHA, ancestor, capstone run, mergeable) is written before it decides, a skip token in the PR title refuses (18), a refusal is recorded as `ship-gate-refusal`. `bkit prs merge --match-head=<gate mergeHead> --delete-branch {LABEL_FLAGS} --expect-merged` (empty body). `state` = MERGED → Step 13. `prs merge` refuses a non-`dev` base (exit 8, nothing merged → Failure Path); the exit 80 MCP route asserts `base.ref` = `dev` before `merge_pull_request`. `ISSUE_ID` empty → no label re-read, `{LABEL_FLAGS}` empty. Non-zero gate: 10/11/14/17 → bounded Step 9 (poll only; `bkit counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --point=ship.merge` counts failed merges plus gate refusals); 12 with `regenerable` = true → the regenerate round (below); else Failure Path. **Regenerate round:** on exit 12 the gate reads the run's jobs and prints `failedSteps`, each failed step outside the capstone as `{job}/{step}` (`{job}/` for a job that failed with no failed step), and `regenerable` = true when every one is on `CI_GENERATED_FLOOR` (`bkit-tests-static/Check Capability Register`, `bkit-tests-static/Run bkit Check`) plus `bkit.testing.ciGenerated`. The engine decides, never a model: one failed step off the list makes the whole result a Failure Path, because fixing half of it still leaves CI red. The round takes the same `ship.merge` count without asking → `bkit branches regenerate --attempt={MERGE_ROUNDS}` commits only what `bkit:generate` changed as `fix({FID}): regenerate attempt {N}` → `CODE_HEAD` = its `head` → plain push → Step 9 re-validates at that head. `unchanged` (regenerating fixes none of the failed steps), `undeclared` or a failing `bkit:generate` → Failure Path. CI's re-run is the only re-check: a local one would need a local command per list entry. Non-merged: `bkit counters route --point=ship.merge` (failed merges plus gate refusals) → Step 11, asked before the Step 12 fix round when `ship.merge.ask`, or Failure Path. |
+| 10 — Merge Gate + Merge PR | — | `runs gate --pr= --validated= --fresh-base` writes the snapshot before deciding and records each refusal once. Code 19 returns to Step 3; 10/11/14/17 return to Step 9; unavailable evidence or a title skip token stops. `prs merge --ship-retry --match-head=<gate mergeHead> --expect-merged` uses an empty body and leaves deletion to guarded close. Independent rereads return merged → Step 13, moved head (9) → validation, new conflict (10) → integration, or another explicit reason → terminal stop. The same durable allowance counts gate refusals and merge attempts. MCP fallback validates scoped pre/post facts through the engine before taking these routes. Red CI runs regenerate only when every failed step is on `CI_GENERATED_FLOOR` or `bkit.testing.ciGenerated`; committed regeneration plain-pushes and revalidates, while unchanged/undeclared/failed regeneration stops. |
 | 11 — Failure Diagnose | `@bkit-debug-failure-diagnose` (only if not merged) | Writes `ship-failure-diagnose-{MERGE_ATTEMPT}.md`. |
 | 12 — Failure Remediate | `@bkit-debug-failure-remediate` (only if not merged) | Writes `ship-failure-remediate-{MERGE_ATTEMPT}-log.md`. `Strategy` ladder (`STANDARD → PIVOT → FINAL`). PASS → `bkit ledgers commit --scope=full --stage-tracked-updates` commits the fix as `fix({FID}): failure-remediate attempt {MERGE_ATTEMPT}` (no skip token, so CI runs), `bkit branches push --mode=plain` pushes it unforced (ship never forces), → Step 9, which re-validates CI at the new head, then Step 10 re-merges. Resumed after the remediate row (`after` = `ship-failure-remediate`) → sub-step 4 with `verdict` = PASS; `MERGE_ATTEMPT` not held → read back first with `counters derive --step=ship-merge-pr --position=current`. FAIL → Failure Path: its handover sends code-level failures back to build, since a source-file retry loop would re-merge identical remote content. |
 | 13 — Update Local Dev | — | `bkit branches sync-dev`: fetch + fast-forward local `dev` to `origin/dev`, no checkout (`merge --ff-only` + frozen install when the main checkout is on `dev` and `dev` moved; install failure → exit 16 → **Failure Path**). Local-only `dev` commits → logged with the publish command, never pushed; step still passes. Step key `ship-switch-to-dev`. |
-| 14 — Close Workflow | — | `bkit runs gate --squash-of=<PR> --capstone-only --record={STATUS}` → records `ship-merge-ci`, then refuses unless the capstone passed at the squash commit. The capstone job's result alone decides: the run's conclusion and other jobs (deploys, notifications) never fail the close of a merged PR. `bkit workflows close --flush --pr-number= --squash-sha= --outbox= --token=` grades compliance, records `ship-close-workflow`, writes telemetry in the worktree, lands the single path-scoped `[skip ci]` close commit on `dev` via the throwaway checkout (refused → `ship-close/{FID}` PR) — a close that did not land keeps the lock and exits non-zero for the Failure Path; once on `dev`, `--branch={SHIP_BRANCH}` removes a workflow-created worktree only (`.worktree-owned` marker in the outbox), prunes, deletes local + remote branch (a worktree holding it blocks both → `branchBlockedBy`; `dev` / `main` refused); then the lock is released; step returns to `REPO_ROOT`. Gate 14 reads `status.jsonl` from `origin/dev`. Add `bkit:merged` label, drop `bkit:failed`. `--summary=<ship-summary.md> --summary-missing=<line>` reads the summary before the close removes the worktree holding it (absent — PR merged on entry → the missing line) and copies it to `{OUTBOX}`; final return displays it verbatim, appends what `bkit tips --workflow=<name>` prints (one tip, the star line, then how to silence both) as `## bkit Tips`, then offers a plain-English explanation on request. **HARD STOP**. |
+| 14 — Close Workflow | — | `runs gate --squash-of= --capstone-only --record=` records the post-merge verdict; only the squash capstone decides. `workflows close --flush` lands the path-scoped close record through the throwaway dev checkout, or a close PR when refused. Guarded cleanup removes a clean workflow-owned worktree and landed local ref only with fresh, matching evidence; dirty/index/unlanded work and changed refs are reported and retained. The remote ref remains when conditional deletion is unavailable. Record landing and lock release continue independently of retained work. Gate 14 reads status from dev. Copy/display the summary and tips, update the issue to review, then stop. |
 
 **Failure Path** books in `BOOK_ROOT` (not `--git-common-dir`), runs `bkit workflows fail` (aborts a rebase or merge, appends `workflow-failed`, releases the lock, clears `.deferred-blocked`), and includes conditional handover via `@bkit-debug-abort-handover` writing `ship-handover.md` when max-retry exhausted.
 
diff --git a/.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts b/.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts
index bb16c8766..ecac690a1 100644
--- a/.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts
+++ b/.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts
@@ -258,8 +258,8 @@ describe("bkit-ship.md — Step 10 gate-refusal re-entry is a bounded poll", ()
     const blocks = fences(shipMd).filter((f) =>
       /"\{BKIT\}" counters route --name=MERGE_ATTEMPT\b/.test(f),
     );
-    // Step 10: the poll re-entry, the regenerate round and the non-merged route.
-    expect(blocks.length, "MERGE_ATTEMPT routing blocks").toBe(3);
+    // Step 10: stale-base integration, polling, regeneration and both merge transports.
+    expect(blocks.length, "MERGE_ATTEMPT routing blocks").toBe(5);
     for (const block of blocks) {
       expect(block).toContain("--of=ship-merge-pr:count --rows=ship-gate-refusal:count");
       expect(block).not.toMatch(/MERGE_ATTEMPT=|\bjq\b/);
diff --git a/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts b/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
index acd3cc4c7..501037e67 100644
--- a/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
+++ b/.bkit/core/engine/audits/workflows/local-gate-audit.test.ts
@@ -270,7 +270,7 @@ describe("bkit-local-gate-audit (#437)", () => {
       { workflow: "bkit-plan.md", sites: 1 },
       { workflow: "bkit-build.md", sites: 2 },
       { workflow: "bkit-debug.md", sites: 5 },
-      { workflow: "bkit-ship.md", sites: 5 },
+      { workflow: "bkit-ship.md", sites: 7 },
     ];
     for (const { workflow, sites } of pushProbes) {
       const body = fs.readFileSync(path.join(WORKFLOWS_DIR, workflow), "utf-8");
diff --git a/.bkit/core/engine/audits/workflows/ship-invariants.test.ts b/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
index b0b6f168a..978f2d85c 100644
--- a/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
+++ b/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
@@ -95,7 +95,7 @@ function ledgersBlocks(ship: string): string[] {
   }
   return blocks
     .map((block) => block.join("\n"))
-    .filter((block) => /"\{BKIT\}" ledgers /.test(block));
+    .filter((block) => /"\{BKIT\}" ledgers (?:stage|commit)\b/.test(block));
 }
 
 /** True for a line that appends a hand-built `type:"..."` jq row to a file. */
@@ -163,6 +163,132 @@ function fencedLinesByStep(ship: string): Array<{ step: string; line: string }>
   return out;
 }
 
+// ---------------------------------------------------------------------------
+// Ship reconciliation and concurrent-change recovery.
+// ---------------------------------------------------------------------------
+
+describe("ship reconciliation and retry contracts", () => {
+  const step = (ship: string, number: number) =>
+    section(ship, new RegExp(`^## .*Step ${number} —`), /^## /);
+
+  it("reconciles and publishes feature code before bookkeeping on every ship path", () => {
+    const ship = readShip();
+    const beforeSweep = ship.slice(ship.indexOf("## 🤖 Step 2 —"), ship.indexOf("## 🤖 Step 5 —"));
+    const reconcile = beforeSweep.indexOf("branches sync --reconcile-feature");
+    const open = beforeSweep.indexOf("prs open");
+    expect(reconcile).toBeGreaterThan(-1);
+    expect(reconcile).toBeLessThan(open);
+    expect(beforeSweep.slice(reconcile)).toMatch(/branches push --mode=plain/);
+    expect(beforeSweep).toMatch(/prs probe[^\n]*--ship-entry/);
+    expect(beforeSweep).toMatch(/(?:resulting|reconciled|local)[^\n]*head|`head`[^\n]*ENTRY_HEAD/i);
+    expect(step(ship, 3)).toContain("--reconcile-feature");
+    expect(step(ship, 3)).toMatch(/basePath[\s\S]*BASE_PATH/);
+    expect(step(ship, 3)).toMatch(/(?:publish|push)[\s\S]*BASE_PATH/i);
+    expect(step(ship, 5)).not.toContain('branches fast-forward --onto="origin/{SHIP_BRANCH}"');
+  });
+
+  it("routes stale bases and refused merges through the bounded integration or validation loop", () => {
+    const merge = step(readShip(), 10);
+    expect(merge).toMatch(/runs gate[^\n]*--fresh-base/);
+    expect(merge).toMatch(/prs merge[^\n]*--ship-retry/);
+    expect(merge).toMatch(/(?:exit|code)[^\n]*19[^\n]*(?:stale|base)|(?:stale|base)[^\n]*19/i);
+    for (const destination of ["step-3", "step-9"]) {
+      const routes = fencedLinesByStep(merge)
+        .filter(({ line }) => line.includes("counters route"))
+        .filter(({ line }) => line.includes(`--continue=${destination}`));
+      expect(routes.length, destination).toBeGreaterThan(0);
+      for (const { line } of routes) {
+        expect(line).toContain("--name=MERGE_ATTEMPT");
+        expect(line).toContain("--of=ship-merge-pr:count");
+        expect(line).toContain("--rows=ship-gate-refusal:count");
+        expect(line).toContain("--exceeded=failure-path");
+      }
+    }
+    expect(merge).toMatch(/(?:exit[^\n]*9|revalidate)[^\n]*(?:Step 9|step-9)/i);
+    expect(merge).toMatch(/(?:exit[^\n]*10|integrate)[^\n]*(?:Step 3|step-3)/i);
+    expect(merge).not.toContain("--continue=step-11");
+    expect(merge).toMatch(/(?:terminal|stop)[^\n]*Failure Path/i);
+  });
+
+  it("passes the actual merge target and defers branch deletion to guarded close", () => {
+    const ship = readShip();
+    const resolver = fs.readFileSync(
+      path.join(REPO_ROOT, ".bkit/core/prompts/bkit-ship-conflict-resolve.md"),
+      "utf-8",
+    );
+    expect(ship).toMatch(/`target`[^\n]*MERGE_TARGET/);
+    expect(ship).toMatch(/Context:[^\n]*\{MERGE_TARGET\}/);
+    expect(resolver).toContain('branches sync --merge --target="{MERGE_TARGET}"');
+    expect(resolver).toMatch(/MERGE_HEAD[\s\S]*(?:MERGE_TARGET|recorded target)/);
+    expect(resolver).not.toContain("git log -5 --oneline origin/dev");
+    expect(resolver).toContain("Refused resolutions");
+    const mergeCommands = fencedLinesByStep(ship).filter(({ line }) => /prs merge\b/.test(line));
+    expect(mergeCommands.length).toBeGreaterThan(0);
+    for (const { line } of mergeCommands) expect(line).not.toContain("--delete-branch");
+    expect(step(ship, 14)).toMatch(/workflows close[^\n]*--flush[^\n]*--branch=/);
+  });
+
+  it("routes MCP safety facts through engine decisions with transport accounting", () => {
+    const ship = readShip();
+    expect(ship).toMatch(/exits 80[\s\S]*runtimeGithubCli` = false/);
+    expect(ship).toContain("prs transport-row");
+    expect(ship).toContain("--asserted-by=");
+    expect(ship).toMatch(/Max 1 transition per run/);
+    for (const command of ["prs probe", "runs gate", "prs merge"]) {
+      const factCommands = fencedLinesByStep(ship)
+        .filter(({ line }) => line.includes(command))
+        .filter(({ line }) => line.includes("--facts-file="));
+      expect(factCommands.length, command).toBeGreaterThan(0);
+      for (const { line } of factCommands) {
+        expect(line).toMatch(/--(?:owner-repo|repo)="\{OWNER_REPO\}"/);
+      }
+    }
+    const merge = step(ship, 10);
+    expect(merge).toMatch(
+      /(?:independent|re-read|reread)[^\n]*(?:post-attempt|after|state|facts)/i,
+    );
+    expect(merge).toMatch(/(?:missing|unavailable|mismatch)[^\n]*(?:Failure Path|refus|stop)/i);
+    expect(merge).not.toMatch(/else FAIL and 1/);
+    expect(merge).toMatch(
+      /(?:before|pre-attempt)[^\n]*(?:facts|read)|(?:facts|read)[^\n]*(?:before|pre-attempt)/i,
+    );
+  });
+
+  it("refreshes merge-aware feature coverage immediately before both reuse decisions", () => {
+    const ship = readShip();
+    for (const number of [5, 6]) {
+      const block = step(ship, number);
+      const refresh = block.indexOf("branches sync --feature-state");
+      const reuse = block.indexOf("Read the latest successful");
+      expect(refresh).toBeGreaterThanOrEqual(0);
+      expect(reuse).toBeGreaterThan(refresh);
+      expect(block.slice(refresh, reuse)).toContain("FEATURE_CODE_STATE");
+      expect(block.slice(refresh, reuse)).toContain("Failure Path");
+    }
+    expect(ship).not.toContain("rev-list --no-merges");
+  });
+
+  it("ties deferred sweep and docs reuse to the recorded feature code state", () => {
+    const ship = readShip();
+    const state = /feature[- ]code (?:state|fingerprint)|FEATURE_CODE_(?:STATE|FINGERPRINT)/i;
+    expect(ship).toMatch(state);
+    for (const number of [5, 6]) {
+      const block = step(ship, number);
+      expect(block).toMatch(state);
+      expect(block).toMatch(
+        /(?:record|status)[\s\S]*(?:match|same|unchanged)[\s\S]*(?:reuse|skip)/i,
+      );
+      expect(block).toMatch(/(?:chang|differ|mismatch|invalidat)[\s\S]*(?:run|invoke|repeat)/i);
+    }
+    expect(ship).toMatch(
+      /base-only[^\n]*(?:reuse|retain|unchanged)|(?:reuse|retain)[^\n]*base-only/i,
+    );
+    expect(ship).toMatch(
+      /(?:import|new|changed) feature[^\n]*(?:invalidat|repeat|rerun)|invalidat[^\n]*feature/i,
+    );
+  });
+});
+
 // ---------------------------------------------------------------------------
 // FROZEN — canonical 14 ship-* step-key set
 // ---------------------------------------------------------------------------
@@ -243,9 +369,10 @@ describe("bkit-ship.md — push-timing invariant (feature-branch pushes before m
       ),
     ].sort();
 
-  it("pushes the feature branch only to open a missing PR, in Integrate (Path B), in Commit + Push Bookkeeping, after a Merge Gate regenerate and after a Failure Remediate fix", () => {
+  it("pushes feature code during entry and base reconciliation, integration, bookkeeping and fixes", () => {
     expect(stepsWhere(isFeaturePush)).toEqual(
       [
+        "Base Check",
         "Commit + Push Bookkeeping",
         "Failure Remediate",
         "Integrate (Path B only)",
@@ -372,7 +499,9 @@ describe("bkit-ship.md — bookkeeping and status writes", () => {
     const recorded = lines.filter((l) =>
       /"\{BKIT\}" runs gate [^\n]*--record="\{STATUS\}"/.test(l),
     );
-    expect(recorded).toHaveLength(2);
+    expect(recorded).toHaveLength(3);
+    expect(recorded.filter((l) => /--fresh-base/.test(l))).toHaveLength(2);
+    expect(recorded.some((l) => /--facts-file=/.test(l))).toBe(true);
     expect(recorded.some((l) => /--capstone-only/.test(l))).toBe(true);
     // A hand-built jq row may only land in an outbox file, never status.jsonl.
     const handBuilt = lines.filter(isHandBuiltRowAppend);
diff --git a/.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts b/.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts
index 5749052dc..37aaacaee 100644
--- a/.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts
+++ b/.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts
@@ -156,6 +156,16 @@ else if (a === "pr" && b === "merge") {
   fs.writeFileSync(stateFile, JSON.stringify(s));
 }
 else if (a === "run" && b === "list") console.log("[]");
+else if (a === "api" && b === "repos/example/example/commits/dev") {
+  const dev = cp.spawnSync("git", ["--git-dir=" + process.env.SHIM_BARE, "rev-parse", "refs/heads/dev"], { encoding: "utf-8" });
+  process.stdout.write(dev.stdout); process.exit(dev.status ?? 1);
+}
+else if (a === "api" && b.startsWith("repos/example/example/compare/")) {
+  const [base, head] = b.split("/compare/")[1].split("...");
+  const compared = cp.spawnSync("git", ["--git-dir=" + process.env.SHIM_BARE, "merge-base", "--is-ancestor", base, head]);
+  if (compared.status !== 0 && compared.status !== 1) process.exit(compared.status ?? 1);
+  console.log(compared.status === 0 ? (base === head ? "identical" : "ahead") : "diverged");
+}
 else if (a === "api") {
   const res = cp.spawnSync("${path.join(GH_FIXTURE, "bin", "gh")}", argv, { stdio: "inherit", env: { ...process.env, BKIT_FAKE_GH_FIXTURE_ROOT: process.env.SHIM_FIXTURES } });
   process.exit(res.status ?? 1);
@@ -329,6 +339,9 @@ describe("deferred landing of a held build (ship, matrix: held → landed)", ()
     expect(merged.status, `${merged.stdout}\n${merged.stderr}`).toBe(0);
 
     expect(ghApiUrls().some((u) => u.includes(`head_sha=${head}`))).toBe(true);
+    const dev = sh(repo, "rev-parse", "origin/dev");
+    expect(ghApiUrls()).toContain("repos/example/example/commits/dev");
+    expect(ghApiUrls()).toContain(`repos/example/example/compare/${dev}...${head}`);
     const mergeCall = ghCall("pr", "merge");
     expect(flagValue(mergeCall, "--match-head-commit")).toBe(head);
     expect(mergeCall).toContain("--squash");
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 7e77e62ce..03f8ecbc6 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -1636,12 +1636,17 @@ describe("issue-less runs", () => {
     },
   );
 
-  it("ship's merge MCP fallback asserts base.ref = dev before merging", () => {
-    const line = workflow("ship")
-      .split("\n")
-      .find((l) => l.includes("`pull_request_read` (`get`) and assert `base.ref` = `dev`"));
-    expect(line).toBeDefined();
-    expect(line!.indexOf("assert")).toBeLessThan(line!.indexOf("merge_pull_request"));
+  it("ship's merge MCP fallback proves the scoped dev base through the engine before merging", () => {
+    const ship = workflow("ship");
+    const baseProof = ship.indexOf("The engine must establish `base.ref` = `dev`");
+    const mergeProof = ship.indexOf("run that engine gate again before mutation");
+    const mutation = ship.indexOf("Only exit 0 authorizes `merge_pull_request`");
+    expect(baseProof).toBeGreaterThan(-1);
+    expect(mergeProof).toBeGreaterThan(baseProof);
+    expect(mutation).toBeGreaterThan(mergeProof);
+    expect(ship.slice(baseProof, mergeProof)).toContain(
+      '--facts-file="{OUTBOX}/ship-gate-facts.json"',
+    );
   });
 
   it.each(PHASES)("%s: Placeholders rule lets ISSUE_ID be empty in every workflow", (name) => {
diff --git a/.bkit/core/engine/commands/workflow/branches.test.ts b/.bkit/core/engine/commands/workflow/branches.test.ts
index 3c6e2e8a0..a2f8b3e0b 100644
--- a/.bkit/core/engine/commands/workflow/branches.test.ts
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -2634,6 +2634,66 @@ describe("branches force-build", { timeout: GIT_TIMEOUT }, () => {
   });
 });
 
+describe("branches sync feature coverage", { timeout: GIT_TIMEOUT }, () => {
+  const coverage = async (cwd: string) => {
+    const result = await run(cwd, ["sync", "--feature-state", "--month=202611", "--fid=1-x"]);
+    expect(result.code, result.err).toBe(0);
+    expect(typeof result.json?.featureCodeState).toBe("string");
+    return result.json?.featureCodeState;
+  };
+
+  it("invalidates coverage when only an imported merge result changes", async () => {
+    const { clone } = withOrigin("coverage-imported-merge");
+    git(clone, "switch", "-q", "-c", "feat/1-x");
+    commit(clone, { "feature.txt": "feature\n" }, "feature");
+    git(clone, "switch", "-q", "-c", "side", "origin/dev");
+    commit(clone, { "side.txt": "side\n" }, "side");
+    git(clone, "switch", "-q", "feat/1-x");
+    expect(git(clone, "merge", "-q", "--no-ff", "-m", "feature merge", "side").ok).toBe(true);
+    const ancestors = git(clone, "rev-list", "--no-merges", "origin/dev..HEAD").out;
+    const before = await coverage(clone);
+    write(clone, "merge-only.txt", "feature semantics introduced only by the merge\n");
+    expect(git(clone, "add", "merge-only.txt").ok).toBe(true);
+    expect(git(clone, "commit", "-q", "--amend", "--no-edit").ok).toBe(true);
+    expect(git(clone, "rev-list", "--no-merges", "origin/dev..HEAD").out).toBe(ancestors);
+    expect(await coverage(clone)).not.toBe(before);
+  });
+
+  it("retains coverage across proven automatic dev integration and bookkeeping", async () => {
+    const { origin, clone } = withOrigin("coverage-base-only");
+    git(clone, "switch", "-q", "-c", "feat/1-x");
+    commit(clone, { "feature.txt": "feature\n" }, "feature");
+    const before = await coverage(clone);
+    commit(clone, { "docs/plans/202611/logs/1-x/status.jsonl": "{}\n" }, "bookkeeping");
+    expect(await coverage(clone)).toBe(before);
+    landOnDev(origin, { "base-only.txt": "new base content\n" });
+    expect(git(clone, "fetch", "-q", "origin", "dev").ok).toBe(true);
+    expect(git(clone, "merge", "-q", "--no-ff", "-m", "integrate dev", "origin/dev").ok).toBe(true);
+    expect(await coverage(clone)).toBe(before);
+    git(clone, "switch", "-q", "-c", "imported", "origin/dev");
+    commit(clone, { "imported-feature.txt": "new feature\n" }, "imported feature");
+    git(clone, "switch", "-q", "feat/1-x");
+    expect(git(clone, "merge", "-q", "--no-ff", "-m", "import feature", "imported").ok).toBe(true);
+    expect(await coverage(clone)).not.toBe(before);
+  });
+
+  it("invalidates coverage for feature content resolved inside a dev merge", async () => {
+    const { origin, clone } = withOrigin("coverage-resolved-dev");
+    git(clone, "switch", "-q", "-c", "feat/1-x");
+    write(clone, "src.txt", "feature version\n");
+    git(clone, "add", "src.txt");
+    git(clone, "commit", "-q", "-m", "feature");
+    const before = await coverage(clone);
+    landOnDev(origin, { "src.txt": "dev version\n" });
+    git(clone, "fetch", "-q", "origin", "dev");
+    expect(git(clone, "merge", "--no-ff", "-m", "integrate dev", "origin/dev").ok).toBe(false);
+    write(clone, "src.txt", "resolved feature semantics\n");
+    git(clone, "add", "src.txt");
+    expect(git(clone, "commit", "-q", "--no-edit").ok).toBe(true);
+    expect(await coverage(clone)).not.toBe(before);
+  });
+});
+
 describe("branches sync feature reconciliation", { timeout: GIT_TIMEOUT }, () => {
   function published(name: string) {
     const { origin, clone } = withOrigin(name);
@@ -2654,6 +2714,54 @@ describe("branches sync feature reconciliation", { timeout: GIT_TIMEOUT }, () =>
   const reconcile = (cwd: string, ...flags: string[]) =>
     run(cwd, ["sync", "--reconcile-feature", "--fid=1-x", ...flags]);
 
+  it("reconciles with tracked workflow bookkeeping but refuses unrelated dirty code", async () => {
+    const status = "docs/plans/202611/logs/1-x/status.jsonl";
+    const clean = published("feature-run-bookkeeping");
+    commit(clean.clone, { [status]: '{"type":"workflow-started"}\n' }, "docs: run");
+    const cloud = cloudCommit(clean.other, { "cloud.txt": "cloud work\n" });
+    fs.appendFileSync(path.join(clean.clone, status), '{"type":"runtime-resolved"}\n');
+    const result = await reconcile(clean.clone, `--file=${status}`);
+    expect(result.code, result.err).toBe(0);
+    expect(git(clean.clone, "merge-base", "--is-ancestor", cloud, "HEAD").ok).toBe(true);
+    expect(read(clean.clone, status)).toContain('"runtime-resolved"');
+    expect(git(clean.clone, "status", "--porcelain").out).toBe(`M ${status}`);
+    expect(git(clean.clone, "show", `HEAD:${status}`).out).toContain('"runtime-resolved"');
+    expect(git(clean.clone, "log", "-2", "--format=%s").out).not.toMatch(/\[skip ci\]/i);
+
+    const dirty = published("feature-run-dirty-code");
+    commit(dirty.clone, { [status]: '{"type":"workflow-started"}\n' }, "docs: run");
+    fs.appendFileSync(path.join(dirty.clone, status), '{"type":"runtime-resolved"}\n');
+    write(dirty.clone, "src.txt", "uncommitted code\n");
+    expect(git(dirty.clone, "add", "src.txt").ok).toBe(true);
+    const before = sha(dirty.clone);
+    const index = git(dirty.clone, "diff", "--cached", "--binary").out;
+    const refused = await reconcile(dirty.clone, `--file=${status}`);
+    expect(refused.code).not.toBe(0);
+    expect(sha(dirty.clone)).toBe(before);
+    expect(read(dirty.clone, status)).toContain('"runtime-resolved"');
+    expect(git(dirty.clone, "diff", "--cached", "--binary").out).toBe(index);
+    expect(read(dirty.clone, "src.txt")).toBe("uncommitted code\n");
+  });
+
+  it("continues only the explicitly recorded target through the public merge command", async () => {
+    const { clone, other } = published("feature-public-target");
+    commit(clone, { "src.txt": "laptop\n" }, "feat: laptop");
+    const remote = cloudCommit(other, { "src.txt": "cloud\n" });
+    expect((await reconcile(clone)).code).toBe(24);
+    expect(git(clone, "rev-parse", "MERGE_HEAD").out).toBe(remote);
+    const wrong = await run(clone, ["sync", "--merge", "--target=origin/dev"]);
+    expect(wrong.code).not.toBe(0);
+    expect(git(clone, "rev-parse", "MERGE_HEAD").out).toBe(remote);
+    write(clone, "src.txt", "laptop\ncloud\n");
+    expect(git(clone, "add", "src.txt").ok).toBe(true);
+    const result = await run(clone, ["sync", "--merge", `--target=${remote}`, "--fid=1-x"]);
+    expect(result.code, result.err).toBe(0);
+    expect(result.json).toMatchObject({ target: remote, outcome: "merged" });
+    expect(sha(clone, "HEAD^2")).toBe(remote);
+    expect(git(clone, "rev-parse", "--verify", "MERGE_HEAD").ok).toBe(false);
+    expect(read(clone, "src.txt")).toBe("laptop\ncloud\n");
+  });
+
   it("fetches the unseen feature head before classifying the base", async () => {
     const { clone, other } = published("feature-unseen");
     git(clone, "config", "remote.origin.fetch", "+refs/heads/dev:refs/remotes/origin/dev");
diff --git a/.bkit/core/engine/commands/workflow/branches.ts b/.bkit/core/engine/commands/workflow/branches.ts
index e59291b9a..e58ff31c0 100644
--- a/.bkit/core/engine/commands/workflow/branches.ts
+++ b/.bkit/core/engine/commands/workflow/branches.ts
@@ -50,6 +50,8 @@ import { DEV_REFSPEC, fetchDev, landBackoffMs, landDir, pushToDev, sleep } from
 import { TIMEOUTS } from "../../shared/timeouts.js";
 import {
   activeRecord,
+  bookPathspecs,
+  checkOnlyBookkeeping,
   commitBookkeeping,
   markRecordPushed,
   recordOnBranch,
@@ -2385,8 +2387,46 @@ function reconcileFeature(
     throw new CommandError(EXIT.USAGE, `--head ${headFlag} does not name a commit`);
   }
   if (!mergeInProgress(top) && hasLeftovers(top)) {
-    ctx.log("feature branch has uncommitted work — commit that work before reconciliation");
-    return EXIT_REFUSED;
+    const statusFile = str(ctx.flags.file);
+    const relative =
+      statusFile && path.relative(top, path.resolve(ctx.cwd, statusFile)).split(path.sep).join("/");
+    const scope = relative && /^docs\/plans\/(\d{6})\/logs\/([^/]+)\/status\.jsonl$/.exec(relative);
+    const fid = str(ctx.flags.fid) || branch.replace(/^feat\//, "");
+    if (!scope || scope[2] !== fid) {
+      ctx.log("feature branch has uncommitted work — commit that work before reconciliation");
+      return EXIT_REFUSED;
+    }
+    const outside = runGit(top, [
+      "status",
+      "--porcelain=v1",
+      "-z",
+      "--untracked-files=all",
+      "--",
+      ".",
+      ...copyExcludes(top),
+      ...bookPathspecs(scope[1]!, fid, "core").map((spec) => `:(exclude)${spec}`),
+    ]);
+    if (!outside.ok || outside.stdout !== "") {
+      ctx.log(
+        "feature branch has unrelated uncommitted work — commit that work before reconciliation",
+      );
+      return EXIT_REFUSED;
+    }
+    const carried = commitBookkeeping(
+      {
+        root: top,
+        month: scope[1]!,
+        fid,
+        scope: "core",
+        mode: "commit",
+        message: `chore(${fid}): carry ship bookkeeping before reconciliation`,
+      },
+      ctx.log,
+    );
+    if (carried.outcome !== "committed") {
+      ctx.log("the workflow bookkeeping could not be committed before reconciliation");
+      return EXIT_REFUSED;
+    }
   }
   const fid = str(ctx.flags.fid) || branch.replace(/^feat\//, "");
   const merge = (target: string, current: boolean) => {
@@ -2460,10 +2500,53 @@ function reconcileFeature(
   return EXIT.OK;
 }
 
+/** Merge-aware coverage identity; omit a dev merge only when Git proves its result automatic. */
+function featureCodeState(top: string, head: string, month: string, fid: string): string {
+  const commits = runGit(top, ["rev-list", "--parents", `${UPSTREAM}..${head}`]);
+  if (!commits.ok) throw new CommandError(EXIT_DIFF_FAILED, commits.stderr);
+  const retained: string[] = [];
+  for (const line of commits.stdout.split("\n").filter(Boolean)) {
+    const [sha, first, second, ...other] = line.split(" ");
+    if (!sha || !first)
+      throw new CommandError(EXIT_DIFF_FAILED, "feature coverage needs readable commit parents");
+    const bookkeeping = checkOnlyBookkeeping(top, { month, fid, from: first, to: sha });
+    if (bookkeeping.kind === "ok") continue;
+    if (bookkeeping.kind !== "outside")
+      throw new CommandError(
+        EXIT_DIFF_FAILED,
+        `feature coverage classification: ${bookkeeping.kind}`,
+      );
+    if (second && other.length === 0) {
+      const devParent = runGit(top, ["merge-base", "--is-ancestor", second, UPSTREAM]);
+      if (devParent.ok) {
+        const automatic = git(top, ["merge-tree", "--write-tree", first, second]);
+        const tree = git(top, ["rev-parse", `${sha}^{tree}`]);
+        if (automatic && tree && automatic.split("\n")[0] === tree) continue;
+      }
+    }
+    retained.push(sha);
+  }
+  return `v1:${retained.sort().join(",")}`;
+}
+
 function syncVerb(ctx: RunContext): number {
   const mergeDocs = ctx.flags.mergeDocs === true;
   const merge = ctx.flags.merge === true;
   const reconcile = ctx.flags.reconcileFeature === true;
+  const featureState = ctx.flags.featureState === true;
+  const month = str(ctx.flags.month);
+  const coverageFid = str(ctx.flags.fid);
+  if (
+    featureState &&
+    (mergeDocs || merge || reconcile || !month || !/^\d{6}$/.test(month) || !coverageFid)
+  )
+    throw new CommandError(
+      EXIT.USAGE,
+      "--feature-state needs --month=YYYYMM and --fid, separately from reconciliation or merging",
+    );
+  const targetFlag = str(ctx.flags.target);
+  if (targetFlag !== undefined && (!merge || targetFlag === "" || targetFlag.startsWith("-")))
+    throw new CommandError(EXIT.USAGE, "--target needs --merge and a commit ref");
   if (reconcile && (mergeDocs || merge))
     throw new CommandError(
       EXIT.USAGE,
@@ -2482,6 +2565,12 @@ function syncVerb(ctx: RunContext): number {
   const sentinelPath = sentinel === undefined ? undefined : path.resolve(ctx.cwd, sentinel);
   if (merge && sentinelPath) fs.rmSync(sentinelPath, { force: true });
   const top = topLevel(ctx.cwd);
+  const target =
+    targetFlag === undefined
+      ? undefined
+      : git(top, ["rev-parse", "--verify", "--quiet", `${targetFlag}^{commit}`]);
+  if (targetFlag !== undefined && !target)
+    throw new CommandError(EXIT.USAGE, `--target ${targetFlag} does not name a commit`);
   const fetch = fetchDev(top);
   if (!fetch.ok) {
     ctx.log(`git fetch ${REMOTE} ${DEV} failed: ${fetch.stderr}`);
@@ -2519,6 +2608,9 @@ function syncVerb(ctx: RunContext): number {
     branch: branch === "" ? null : branch,
     head,
     ...(reconcile ? { remoteHead: observed.remoteHead, reconciledHead: head } : {}),
+    ...(featureState
+      ? { featureCodeState: featureCodeState(top, head, month!, coverageFid!) }
+      : {}),
     basePath: ancestor.status === 0 ? "A" : "B",
     behind,
     docsBehind,
@@ -2557,7 +2649,16 @@ function syncVerb(ctx: RunContext): number {
     const fid = str(ctx.flags.fid) || branch.replace(/^feat\//, "");
     const m = mergeDev(
       top,
-      { branch, policy: "full", fid, generate: true, current: out.basePath === "A" },
+      {
+        branch,
+        policy: "full",
+        fid,
+        generate: true,
+        ...(target ? { target } : {}),
+        current: target
+          ? runGit(top, ["merge-base", "--is-ancestor", target, "HEAD"]).ok
+          : out.basePath === "A",
+      },
       ctx.log,
     );
     const refused = m.outcome === "refused";
@@ -2568,6 +2669,7 @@ function syncVerb(ctx: RunContext): number {
     const newHead = git(top, ["rev-parse", "HEAD"]) ?? head;
     ctx.emit({
       ...out,
+      ...(target ? { target } : {}),
       head: newHead,
       merged: m.merged,
       resolved: m.resolved,
@@ -3353,6 +3455,12 @@ export const branchesCommand: CommandSpec = {
       summary: `Fetch ${UPSTREAM}; report whether it is an ancestor of HEAD (Path A/B) and how far docs/ and the ledgers are behind; optionally merge it in.`,
       use: "workflow",
       flags: [
+        {
+          name: "feature-state",
+          type: "boolean",
+          help: "report merge-aware feature coverage, excluding bookkeeping and proven automatic dev-only merges; needs --month and --fid",
+        },
+        { name: "month", type: "string", help: "--feature-state: bookkeeping month YYYYMM" },
         {
           name: "reconcile-feature",
           type: "boolean",
@@ -3368,6 +3476,11 @@ export const branchesCommand: CommandSpec = {
           type: "boolean",
           help: `ship Step 4: merge ${UPSTREAM} into the checked-out feature branch — the run's uncommitted work is committed first, ledger conflicts union, a lockfile regenerates from ${DEV}'s copy, a generated register takes ${DEV}'s copy and is rebuilt after the merge, a doc embedding the register's generated block takes ${DEV}'s block and merges the rest, the install record (.bkit/version) merges entry by entry with ${DEV}'s value where both changed, any other conflict stays in the tree with the merge in progress for a hand resolution (exit 24; run again after git add), then a declared bkit:generate runs and its output is committed; never a rebase or force-push, never on ${DEV} / main`,
         },
+        {
+          name: "target",
+          type: "string",
+          help: "--merge: exact recorded merge target (default origin/dev); continuation refuses a different MERGE_HEAD",
+        },
         {
           name: "merge-docs",
           type: "boolean",
@@ -3396,6 +3509,9 @@ export const branchesCommand: CommandSpec = {
           "--reconcile-feature: the freshly observed remote feature commit, or null when absent",
         reconciledHead:
           "--reconcile-feature: the resulting local feature commit used for base classification",
+        featureCodeState:
+          "--feature-state: versioned identity of feature commits and semantic merge results",
+        target: "--merge --target: the resolved commit being merged or continued",
         basePath: `A when ${UPSTREAM} is an ancestor of head (nothing to integrate), else B`,
         behind: `commits on ${UPSTREAM} not in head`,
         docsBehind: `of those, commits touching docs/ or a ledger path (LEDGERS)`,
@@ -3414,6 +3530,8 @@ export const branchesCommand: CommandSpec = {
         sentinel: "--merge: the sentinel written on refusal (null otherwise)",
       },
       exitCodes: {
+        [EXIT_DIFF_FAILED]:
+          "--feature-state: commit ancestry or bookkeeping classification could not be read",
         [EXIT_REFUSED]: "--merge: the uncommitted work could not be committed before the merge",
         [EXIT_DETACHED]: "--merge / --merge-docs with no branch checked out",
         [EXIT_FETCH_FAILED]: `git fetch ${REMOTE} ${DEV} failed`,
diff --git a/.bkit/core/engine/commands/workflow/prs.test.ts b/.bkit/core/engine/commands/workflow/prs.test.ts
index b6bdc900f..6d43acde9 100644
--- a/.bkit/core/engine/commands/workflow/prs.test.ts
+++ b/.bkit/core/engine/commands/workflow/prs.test.ts
@@ -36,7 +36,13 @@ if [ "$1" = "api" ]; then
   exit 0
 fi
 verb="$2"
-if [ -f "$d/$verb-exit" ]; then echo "gh $verb failed" >&2; exit "$(cat "$d/$verb-exit")"; fi
+if [ -f "$d/$verb-exit" ]; then
+  if [ "$verb" = merge ]; then
+    [ ! -f "$d/view-after.json" ] || cp "$d/view-after.json" "$d/view.json"
+    [ ! -f "$d/after-view-exit" ] || cp "$d/after-view-exit" "$d/view-exit"
+  fi
+  echo "gh $verb failed" >&2; exit "$(cat "$d/$verb-exit")"
+fi
 case "$verb" in
   list) cat "$d/list.json" ;;
   view) cat "$d/view.json" ;;
@@ -792,6 +798,116 @@ describe("bkit prs transport-row", () => {
 // merge
 // ---------------------------------------------------------------------------
 
+describe("bkit prs merge ship retry", () => {
+  const pinned = "a".repeat(40);
+  const moved = "b".repeat(40);
+  function refusal(after: Record<string, unknown>) {
+    for (const file of ["view-exit", "merge-exit", "after-view-exit", "view-after.json", "calls"]) {
+      fs.rmSync(path.join(fake, file), { force: true });
+    }
+    gh.view(pr({ headRefOid: pinned, mergeable: "MERGEABLE" }));
+    gh.viewAfterMerge(pr({ headRefOid: pinned, mergeable: "MERGEABLE", ...after }));
+    gh.exit("merge", 1);
+  }
+  const shipMerge = (cwd: string, ...extra: string[]) =>
+    run(cwd, [
+      "prs",
+      "merge",
+      "--number=7",
+      `--match-head=${pinned}`,
+      "--subject=feat(12-x): ship",
+      "--expect-merged",
+      "--ship-retry",
+      ...extra,
+    ]);
+
+  it("classifies a refused merge whose pinned head moved as revalidation", async () => {
+    refusal({ headRefOid: moved, mergeable: "CONFLICTING" });
+    const result = await shipMerge(repo());
+    expect(result.code, result.err).toBe(9);
+    expect(result.json).toMatchObject({ merged: false, state: "OPEN", route: "revalidate" });
+    expect(result.json.reason).toMatch(/head|mov/i);
+    expect(gh.calls().filter((call) => call.startsWith("pr view"))).toHaveLength(2);
+    expect(gh.calls().filter((call) => call.startsWith("pr merge"))).toHaveLength(1);
+    expect(gh.calls().find((call) => call.startsWith("pr merge"))).toContain(
+      `--match-head-commit ${pinned}`,
+    );
+    expect(gh.calls().find((call) => call.startsWith("pr merge"))).not.toContain("--delete-branch");
+  });
+
+  it("classifies a refused merge with a new dev conflict as integration", async () => {
+    refusal({ mergeable: "CONFLICTING" });
+    const result = await shipMerge(repo());
+    expect(result.code, result.err).toBe(10);
+    expect(result.json).toMatchObject({ merged: false, state: "OPEN", route: "integrate" });
+    expect(result.json.reason).toMatch(/conflict|dev|base/i);
+    expect(gh.calls().filter((call) => call.startsWith("pr merge"))).toHaveLength(1);
+    expect(gh.calls().filter((call) => call.startsWith("pr view"))).toHaveLength(2);
+  });
+
+  it("returns an explicit terminal reason for other merge refusals", async () => {
+    refusal({ mergeable: "MERGEABLE" });
+    const result = await shipMerge(repo());
+    expect(result.code, result.err).toBe(7);
+    expect(result.json).toMatchObject({ merged: false, route: "stop" });
+    expect(result.json.reason).toMatch(/refus|merge/i);
+
+    refusal({ mergeable: "MERGEABLE" });
+    fs.writeFileSync(path.join(fake, "after-view-exit"), "1");
+    const unreadable = await shipMerge(repo());
+    expect(unreadable.code).toBe(5);
+    expect(unreadable.json).toMatchObject({ merged: false, route: "stop" });
+    expect(unreadable.json.reason).toMatch(/read|unavailable|view/i);
+
+    refusal({ mergeable: "MERGEABLE" });
+    gh.view(pr({ baseRefName: "main", headRefOid: pinned }));
+    const wrongBase = await shipMerge(repo());
+    expect(wrongBase.code).toBe(EXIT_BASE_NOT_DEV);
+    expect(gh.calls().filter((call) => call.startsWith("pr merge"))).toEqual([]);
+  });
+
+  it("classifies independent MCP merge refusal facts without gh", async () => {
+    const cwd = repo();
+    const facts = path.join(fake, "merge-facts.json");
+    const scope = {
+      ownerRepo: "o/r",
+      prNumber: 7,
+      headRefName: "feat/12-x",
+      baseRefName: "dev",
+      matchHead: pinned,
+      before: pr({ headRefOid: pinned, mergeable: "MERGEABLE" }),
+    };
+    gh.exit("view", 127);
+    fs.writeFileSync(
+      facts,
+      JSON.stringify({ ...scope, after: pr({ headRefOid: moved, mergeable: "CONFLICTING" }) }),
+    );
+    const headMoved = await shipMerge(cwd, "--owner-repo=o/r", `--facts-file=${facts}`);
+    expect(headMoved.code, headMoved.err).toBe(9);
+    expect(headMoved.json.route).toBe("revalidate");
+    fs.writeFileSync(
+      facts,
+      JSON.stringify({ ...scope, after: pr({ headRefOid: pinned, mergeable: "CONFLICTING" }) }),
+    );
+    const conflict = await shipMerge(cwd, "--owner-repo=o/r", `--facts-file=${facts}`);
+    expect(conflict.code, conflict.err).toBe(10);
+    expect(conflict.json.route).toBe("integrate");
+    fs.writeFileSync(facts, JSON.stringify(scope));
+    const noReread = await shipMerge(cwd, "--owner-repo=o/r", `--facts-file=${facts}`);
+    expect(noReread.code).not.toBe(0);
+    expect(["integrate", "revalidate"]).not.toContain(noReread.json?.route);
+    fs.writeFileSync(
+      facts,
+      JSON.stringify({ ...scope, ownerRepo: "other/repo", after: pr({ headRefOid: moved }) }),
+    );
+    const wrongScope = await shipMerge(cwd, "--owner-repo=o/r", `--facts-file=${facts}`);
+    expect(wrongScope.code).not.toBe(0);
+    expect(["integrate", "revalidate"]).not.toContain(wrongScope.json?.route);
+    expect(wrongScope.err).toMatch(/scope|repository|ownerRepo/i);
+    expect(gh.calls()).toEqual([]);
+  });
+});
+
 describe("bkit prs merge", () => {
   const merge = (...extra: string[]) => run(repo(), ["prs", "merge", "--number=7", ...extra]);
   const mergeCall = () => gh.calls().find((c) => c.startsWith("pr merge")) ?? "";
diff --git a/.bkit/core/engine/commands/workflow/prs.ts b/.bkit/core/engine/commands/workflow/prs.ts
index ce07e53a3..4fee43b05 100644
--- a/.bkit/core/engine/commands/workflow/prs.ts
+++ b/.bkit/core/engine/commands/workflow/prs.ts
@@ -168,7 +168,7 @@ export function probePr(
   return qualify(pr);
 }
 
-function validPrFacts(value: unknown): value is PrInfo {
+export function validPrFacts(value: unknown): value is PrInfo {
   if (typeof value !== "object" || value === null) return false;
   return (
     "number" in value &&
@@ -550,6 +550,9 @@ export interface MergeInput {
   /** `--match-head-commit`: the server refuses when the head moved. */
   matchHead?: string;
   deleteBranch?: boolean;
+  shipRetry?: boolean;
+  repo?: string;
+  facts?: unknown;
 }
 
 export interface MergeResult {
@@ -562,6 +565,8 @@ export interface MergeResult {
     subject: string;
     verdict: "PASS" | "FAIL";
     failures: number;
+    route?: "merged" | "revalidate" | "integrate" | "stop";
+    reason?: string;
   };
 }
 
@@ -573,7 +578,14 @@ export interface MergeResult {
  * EXIT.USE_MCP (merge through `merge_pull_request` with `subject`).
  */
 export function mergePr(cwd: string, o: MergeInput, log: (m: string) => void): MergeResult {
-  const read = () => probePr(cwd, { number: o.number, state: "open" });
+  if (o.shipRetry && !o.matchHead)
+    throw new CommandError(EXIT.USAGE, "--ship-retry requires --match-head");
+  if (o.shipRetry && o.deleteBranch)
+    throw new CommandError(
+      EXIT.USAGE,
+      "--ship-retry leaves branch cleanup to guarded workflow close",
+    );
+  const read = () => probePr(cwd, { number: o.number, state: "open", repo: o.repo });
   const result = (code: number, pr: PrInfo | undefined, already: boolean): MergeResult => {
     const merged = pr?.state === "MERGED";
     return {
@@ -586,17 +598,84 @@ export function mergePr(cwd: string, o: MergeInput, log: (m: string) => void): M
         subject: o.subject,
         verdict: merged ? "PASS" : "FAIL",
         failures: merged ? 0 : 1,
+        ...(o.shipRetry
+          ? {
+              route: merged ? ("merged" as const) : ("stop" as const),
+              reason: merged ? "PR merged" : "merge refused",
+            }
+          : {}),
       },
     };
   };
-  const before = read();
+  const stop = (code: number, reason: string, pr?: PrInfo): MergeResult => {
+    log(reason);
+    const r = result(code, pr, false);
+    return o.shipRetry ? { ...r, out: { ...r.out, route: "stop", reason } } : r;
+  };
+  const classify = (pr: PrInfo | undefined): MergeResult => {
+    if (!o.shipRetry || pr?.state === "MERGED") return result(EXIT.OK, pr, false);
+    if (pr?.baseRefName !== DEV) return stop(EXIT_BASE_NOT_DEV, "merge reread base is not dev", pr);
+    if (pr.state !== "OPEN") return stop(EXIT_NOT_MERGED, "merge refused: PR is not open", pr);
+    if (!/^[0-9a-f]{40,64}$/i.test(pr.headRefOid))
+      return stop(EXIT_GH_FAILED, "merge head reread is unavailable", pr);
+    const moved = pr.headRefOid !== o.matchHead;
+    const conflict = pr.mergeable === "CONFLICTING";
+    if (!moved && !conflict)
+      return stop(EXIT_NOT_MERGED, "merge refused without a moved head or new dev conflict", pr);
+    const reason = moved
+      ? "PR head moved after validation; revalidate the new head"
+      : "PR conflicts with dev; integrate the fresh base";
+    log(reason);
+    const r = result(moved ? 9 : 10, pr, false);
+    return { ...r, out: { ...r.out, route: moved ? "revalidate" : "integrate", reason } };
+  };
+  let before: Probe;
+  let afterFacts: PrInfo | undefined;
+  if (o.facts !== undefined) {
+    const facts = o.facts;
+    if (
+      !o.shipRetry ||
+      !o.repo ||
+      typeof facts !== "object" ||
+      facts === null ||
+      !("ownerRepo" in facts) ||
+      facts.ownerRepo !== o.repo ||
+      !("prNumber" in facts) ||
+      facts.prNumber !== Number(o.number) ||
+      !("matchHead" in facts) ||
+      facts.matchHead !== o.matchHead ||
+      !("headRefName" in facts) ||
+      typeof facts.headRefName !== "string" ||
+      !("baseRefName" in facts) ||
+      facts.baseRefName !== DEV ||
+      !("before" in facts) ||
+      !validPrFacts(facts.before) ||
+      !("after" in facts) ||
+      !validPrFacts(facts.after) ||
+      [facts.before, facts.after].some(
+        (pr) =>
+          pr.number !== Number(o.number) ||
+          prRepoSlug(pr.url) !== o.repo ||
+          pr.headRefName !== facts.headRefName ||
+          pr.baseRefName !== DEV,
+      ) ||
+      facts.before.headRefOid !== o.matchHead ||
+      facts.before.state !== "OPEN"
+    )
+      return stop(
+        EXIT_GH_FAILED,
+        "merge facts scope or independent post-attempt reread is unavailable or mismatched",
+      );
+    before = { kind: "ok", pr: facts.before };
+    afterFacts = facts.after;
+  } else before = read();
   if (before.kind === "unavailable") {
     log(`${before.message} — merge through merge_pull_request with this subject and an empty body`);
     return result(EXIT.USE_MCP, undefined, false);
   }
   if (before.kind === "failed") {
     log(before.message);
-    return result(EXIT_GH_FAILED, undefined, false);
+    return stop(EXIT_GH_FAILED, before.message);
   }
   if (before.pr?.state === "MERGED") return result(EXIT.OK, before.pr, true);
   if (before.pr?.baseRefName !== DEV) {
@@ -605,7 +684,20 @@ export function mergePr(cwd: string, o: MergeInput, log: (m: string) => void): M
     );
     return result(EXIT_BASE_NOT_DEV, before.pr, false);
   }
+  if (
+    o.shipRetry &&
+    (before.pr.number !== Number(o.number) ||
+      (o.repo !== undefined && prRepoSlug(before.pr.url) !== o.repo))
+  )
+    return stop(
+      EXIT_GH_FAILED,
+      "merge pre-attempt PR repository or number scope mismatch",
+      before.pr,
+    );
+  if (o.shipRetry && before.pr.headRefOid !== o.matchHead) return classify(before.pr);
+  if (afterFacts !== undefined) return classify(afterFacts);
   const args = ["pr", "merge", o.number, "--squash", "--subject", o.subject, "--body", ""];
+  if (o.repo !== undefined) args.push("--repo", o.repo);
   if (o.deleteBranch === true) args.push("--delete-branch");
   if (o.matchHead !== undefined) args.push("--match-head-commit", o.matchHead);
   const merged = runGh(cwd, args);
@@ -619,9 +711,19 @@ export function mergePr(cwd: string, o: MergeInput, log: (m: string) => void): M
     log(`gh pr merge ${o.number} failed: ${merged.stderr || `exit ${String(merged.status)}`}`);
   const after = read();
   if (after.kind !== "ok") {
-    log(after.message);
-    return result(EXIT_GH_FAILED, undefined, false);
+    return stop(EXIT_GH_FAILED, `merge state reread unavailable: ${after.message}`);
   }
+  if (
+    o.shipRetry &&
+    (after.pr?.number !== Number(o.number) ||
+      after.pr.headRefName !== before.pr.headRefName ||
+      (o.repo !== undefined && prRepoSlug(after.pr.url) !== o.repo))
+  )
+    return stop(
+      EXIT_GH_FAILED,
+      "merge post-attempt PR repository, number or branch scope mismatch",
+      after.pr,
+    );
   // A retarget between the base check and the merge is caught here, loudly.
   if (after.pr?.state === "MERGED" && after.pr.baseRefName !== DEV) {
     log(
@@ -630,7 +732,7 @@ export function mergePr(cwd: string, o: MergeInput, log: (m: string) => void): M
     const r = result(EXIT_BASE_NOT_DEV, after.pr, false);
     return { ...r, out: { ...r.out, verdict: "FAIL", failures: 1 } };
   }
-  return result(EXIT.OK, after.pr, false);
+  return classify(after.pr);
 }
 
 // ---------------------------------------------------------------------------
@@ -1144,6 +1246,21 @@ export const prsCommand: CommandSpec = {
         "Squash-merge a PR with an empty body (skipped when already MERGED) and read its state back.",
       use: "workflow",
       flags: [
+        {
+          name: "ship-retry",
+          type: "boolean",
+          help: "ship only: classify independently re-read merge refusals as revalidate (9), integrate (10), or stop (7)",
+        },
+        {
+          name: "facts-file",
+          type: "string",
+          help: "with --ship-retry: scoped pre-attempt and independent post-attempt MCP PR facts; classify without another mutation",
+        },
+        {
+          name: "owner-repo",
+          type: "string",
+          help: "owner/repo for the merge and scoped MCP facts",
+        },
         { name: "number", type: "string", required: true, help: "the PR number" },
         {
           name: "subject",
@@ -1176,19 +1293,40 @@ export const prsCommand: CommandSpec = {
         subject: "the squash subject used",
         verdict: "PASS when merged, else FAIL",
         failures: "0 when merged, else 1",
+        route: "--ship-retry: merged | revalidate | integrate | stop",
+        reason: "--ship-retry: the reread decision or refusal",
       },
       exitCodes: {
         [EXIT_GH_FAILED]: "gh could not read the PR",
         [EXIT_NOT_MERGED]: "--expect-merged and the PR did not reach MERGED",
         [EXIT_BASE_NOT_DEV]: `the PR's base is not ${DEV}, or could not be read — nothing merged`,
+        9: "--ship-retry: PR head moved; revalidate",
+        10: "--ship-retry: new dev conflict; integrate",
       },
       run: (ctx) => {
         const number = String(ctx.flags.number);
         if (!/^[1-9][0-9]*$/.test(number))
           throw new CommandError(EXIT.USAGE, "--number must be a PR number");
+        const factsPath = str(ctx.flags.factsFile);
+        const parsed =
+          factsPath === undefined
+            ? undefined
+            : parseJson(fs.readFileSync(path.resolve(ctx.cwd, factsPath), "utf-8"));
+        if (parsed !== undefined && !parsed.ok)
+          throw new CommandError(EXIT.USAGE, "merge facts JSON is unreadable");
+        const facts = parsed?.ok ? parsed.value : undefined;
         let subject = str(ctx.flags.subject);
         if (subject === undefined) {
-          const pr = probePr(ctx.cwd, { number, state: "open" });
+          const candidate =
+            typeof facts === "object" && facts !== null && "before" in facts
+              ? facts.before
+              : undefined;
+          const pr: Probe =
+            facts !== undefined
+              ? validPrFacts(candidate)
+                ? { kind: "ok", pr: candidate }
+                : { kind: "failed", message: "merge facts pre-attempt PR is unreadable" }
+              : probePr(ctx.cwd, { number, state: "open", repo: str(ctx.flags.ownerRepo) });
           if (pr.kind === "unavailable") {
             ctx.log(`${pr.message} — merge through merge_pull_request`);
             return EXIT.USE_MCP;
@@ -1208,6 +1346,9 @@ export const prsCommand: CommandSpec = {
             subject,
             matchHead: str(ctx.flags.matchHead),
             deleteBranch: ctx.flags.deleteBranch === true,
+            shipRetry: ctx.flags.shipRetry === true,
+            repo: str(ctx.flags.ownerRepo),
+            facts,
           },
           ctx.log,
         );
diff --git a/.bkit/core/engine/commands/workflow/runs.test.ts b/.bkit/core/engine/commands/workflow/runs.test.ts
index c7b7a11ae..e75bf2357 100644
--- a/.bkit/core/engine/commands/workflow/runs.test.ts
+++ b/.bkit/core/engine/commands/workflow/runs.test.ts
@@ -866,6 +866,223 @@ describe("bkit runs gate", () => {
   });
   const deployFailed: Job = { name: "deploy", status: "completed", conclusion: "failure" };
 
+  function freshBaseFixture() {
+    const origin = tmp("bkit-fresh-base-origin-");
+    gitIn(origin, "init", "-q", "--bare", "-b", "dev");
+    const cwd = tmp("bkit-fresh-base-local-");
+    gitIn(cwd, "init", "-q", "-b", "dev");
+    fs.mkdirSync(path.join(cwd, "docs"));
+    fs.writeFileSync(path.join(cwd, "docs/architecture.md"), "base docs\n");
+    gitIn(cwd, "add", "docs/architecture.md");
+    gitIn(cwd, "commit", "-qm", "base");
+    gitIn(cwd, "remote", "add", "origin", origin);
+    gitIn(cwd, "push", "-q", "origin", "dev");
+    gitIn(cwd, "switch", "-q", "-c", "feat/842-gate");
+    fs.writeFileSync(path.join(cwd, "feature.ts"), "export const feature = true;\n");
+    gitIn(cwd, "add", "feature.ts");
+    gitIn(cwd, "commit", "-qm", "feat: validated code");
+    const head = gitIn(cwd, "rev-parse", "HEAD");
+    const seed = tmp("bkit-fresh-base-seed-");
+    gitIn(seed, "clone", "-q", "-b", "dev", origin, ".");
+    fixtureRun(head, { status: "completed", conclusion: "success" }, [
+      capstone("completed", "success"),
+    ]);
+    const fixtureRoot = String(process.env.BKIT_FAKE_GH_FIXTURE_ROOT);
+    const pr = (ownerRepo: string, tip = head) => ({
+      number: 7,
+      url: `https://github.com/${ownerRepo}/pull/7`,
+      state: "OPEN",
+      baseRefName: "dev",
+      headRefName: "feat/842-gate",
+      headRefOid: tip,
+      title: "feat: validated feature",
+      mergeCommit: { oid: head },
+      mergeable: "MERGEABLE",
+    });
+    const configurePr = (ownerRepo = "example/example", tip = head) => {
+      fs.writeFileSync(
+        path.join(fixtureRoot, "prs", `${ownerRepo.replaceAll("/", "_")}__7.json`),
+        JSON.stringify(pr(ownerRepo, tip)),
+      );
+    };
+    configurePr();
+    configurePr("foreign/repo");
+    const bin = tmp("bkit-fresh-base-gh-");
+    fs.symlinkSync(FIXTURE_GH, path.join(bin, "gh"));
+    const calls = path.join(bin, "calls");
+    const body = path.join(bin, "body.sh");
+    fs.writeFileSync(
+      body,
+      [
+        `printf '%s\\n' "$*" >> '${calls}'`,
+        `[ ! -f '${bin}/unavailable' ] || exit 127`,
+        `case "$1 $2" in`,
+        `  'repo view') echo example/example; exit 0 ;;`,
+        `esac`,
+        `case "$2" in`,
+        `  *'/commits/dev') [ ! -f '${bin}/missing-base' ] || exit 1; cat '${bin}/dev-sha'; exit 0 ;;`,
+        `  *'/compare/'*) [ ! -f '${bin}/missing-base' ] || exit 1; cat '${bin}/comparison'; exit 0 ;;`,
+        `esac`,
+        `exec '${FIXTURE_GH}' "$@"`,
+      ].join("\n"),
+    );
+    env({ PATH: `${bin}${path.delimiter}${process.env.PATH}`, BKIT_FAKE_TOOL_SCRIPT: body });
+    const record = path.join(cwd, "gate-status.jsonl");
+    const snapshot = path.join(cwd, "snapshot.jsonl");
+    fs.writeFileSync(record, "");
+    const advance = (file = "dev.ts") => {
+      fs.writeFileSync(path.join(seed, file), "new dev work\n");
+      gitIn(seed, "add", file);
+      gitIn(seed, "commit", "-qm", "feat: dev advanced");
+      gitIn(seed, "push", "-q", "origin", "dev");
+      const tip = gitIn(seed, "rev-parse", "HEAD");
+      fs.writeFileSync(path.join(bin, "dev-sha"), tip);
+      fs.writeFileSync(path.join(bin, "comparison"), "diverged\n");
+      return tip;
+    };
+    fs.writeFileSync(path.join(bin, "dev-sha"), gitIn(cwd, "rev-parse", "origin/dev"));
+    fs.writeFileSync(path.join(bin, "comparison"), "ahead\n");
+    const run = (...extra: string[]) =>
+      gate(cwd, "--pr=7", `--validated=${head}`, "--month=202610", "--fid=842-gate", ...extra);
+    return {
+      cwd,
+      origin,
+      seed,
+      head,
+      bin,
+      fixtureRoot,
+      pr,
+      configurePr,
+      calls,
+      record,
+      snapshot,
+      advance,
+      run,
+    };
+  }
+
+  it("refuses green CI when dev advanced beyond the validated code head", async () => {
+    const f = freshBaseFixture();
+    expect((await f.run()).code).toBe(0);
+    const oldDev = gitIn(f.cwd, "rev-parse", "origin/dev");
+    const dev = f.advance();
+    expect(gitIn(f.cwd, "rev-parse", "origin/dev")).toBe(oldDev);
+    const result = await f.run("--fresh-base", `--record=${f.record}`, `--snapshot=${f.snapshot}`);
+    expect(result.code, result.err).toBe(19);
+    expect(result.json).toMatchObject({ code: 19, passed: false, overridden: false });
+    expect(result.json.reason).toMatch(/dev|base/i);
+    expect(gitIn(f.cwd, "rev-parse", "origin/dev")).toBe(dev);
+    const snapshot = fs
+      .readFileSync(f.snapshot, "utf-8")
+      .trim()
+      .split("\n")
+      .map((row) => JSON.parse(row));
+    expect(snapshot.at(-1)).toMatchObject({
+      gateHead: f.head,
+      validatedHead: f.head,
+      devSha: dev,
+      ancestor: "false",
+    });
+    const rows = fs
+      .readFileSync(f.record, "utf-8")
+      .trim()
+      .split("\n")
+      .map((row) => JSON.parse(row));
+    expect(rows.at(-1)).toMatchObject({ type: "ship-gate-refusal", exitCode: 19 });
+  });
+
+  it("does not let bookkeeping or a CI override waive stale dev ancestry", async () => {
+    const f = freshBaseFixture();
+    const dev = f.advance("docs/architecture.md");
+    gitIn(f.cwd, "fetch", "-q", "origin", "dev");
+    gitIn(f.cwd, "merge", "--no-edit", "-m", "docs: integrate documentation", "origin/dev");
+    const bookkeepingHead = gitIn(f.cwd, "rev-parse", "HEAD");
+    f.configurePr("example/example", bookkeepingHead);
+    const carried = await f.run();
+    expect(carried.code, carried.err).toBe(0);
+    expect(carried.json).toMatchObject({ head: f.head, mergeHead: bookkeepingHead });
+    env({ BKIT_SHIP_GATE_OVERRIDE: f.head });
+    const result = await f.run("--fresh-base");
+    expect(result.code, result.err).toBe(19);
+    expect(result.json).toMatchObject({ passed: false, overridden: false });
+    expect(result.json.reason).toMatch(/dev|base/i);
+    expect(gitIn(f.cwd, "merge-base", dev, bookkeepingHead)).toBe(dev);
+    env({ BKIT_SHIP_GATE_OVERRIDE: bookkeepingHead });
+    expect((await f.run("--fresh-base")).code).toBe(19);
+  });
+
+  it("checks the named repository base and fails closed on missing evidence", async () => {
+    const f = freshBaseFixture();
+    const foreignDev = "d".repeat(40);
+    fs.writeFileSync(path.join(f.bin, "dev-sha"), foreignDev);
+    fs.writeFileSync(path.join(f.bin, "comparison"), "diverged\n");
+    const result = await cli(f.cwd, [
+      "gate",
+      "--pr=7",
+      "--repo=foreign/repo",
+      "--fresh-base",
+      `--snapshot=${f.snapshot}`,
+    ]);
+    expect(result.code, result.err).toBe(19);
+    expect(result.json).toMatchObject({ passed: false, repo: "foreign/repo" });
+    const calls = fs.readFileSync(f.calls, "utf-8");
+    expect(calls).toMatch(/(?:\/)?repos\/foreign\/repo\/commits\/dev/);
+    expect(calls).toMatch(/(?:\/)?repos\/foreign\/repo\/compare\//);
+    expect(calls).not.toMatch(/repos\/example\/example\/(?:commits|compare)/);
+    fs.writeFileSync(path.join(f.bin, "missing-base"), "");
+    const missing = await cli(f.cwd, ["gate", "--pr=7", "--repo=foreign/repo", "--fresh-base"]);
+    expect(missing.code, missing.err).toBe(20);
+    expect(missing.json.passed).toBe(false);
+    expect(missing.json.reason).toMatch(/base|dev|evidence/i);
+  });
+
+  it("refuses stale or missing MCP base evidence despite green CI without gh", async () => {
+    const f = freshBaseFixture();
+    const dev = f.advance();
+    const facts = path.join(f.bin, "gate-facts.json");
+    const ci = {
+      workflowRuns: JSON.parse(
+        fs.readFileSync(path.join(f.fixtureRoot, "runs", `${f.head}.json`), "utf-8"),
+      ),
+      jobs: JSON.parse(fs.readFileSync(path.join(f.fixtureRoot, "jobs", "1900.json"), "utf-8")),
+    };
+    const scope = {
+      ownerRepo: "example/example",
+      prNumber: 7,
+      headRefName: "feat/842-gate",
+      baseRefName: "dev",
+      pr: f.pr("example/example"),
+      ci,
+    };
+    fs.writeFileSync(
+      facts,
+      JSON.stringify({
+        ...scope,
+        base: { ref: "dev", sha: dev, comparedHead: f.head, status: "diverged" },
+      }),
+    );
+    fs.writeFileSync(path.join(f.bin, "unavailable"), "");
+    const stale = await f.run("--fresh-base", `--facts-file=${facts}`);
+    expect(stale.code, stale.err).toBe(19);
+    expect(stale.json).toMatchObject({ passed: false, overridden: false, repo: "example/example" });
+    fs.writeFileSync(facts, JSON.stringify(scope));
+    const missing = await f.run("--fresh-base", `--facts-file=${facts}`);
+    expect(missing.code, missing.err).toBe(20);
+    expect(missing.json.passed).toBe(false);
+    fs.writeFileSync(
+      facts,
+      JSON.stringify({
+        ...scope,
+        ownerRepo: "foreign/repo",
+        base: { ref: "dev", sha: dev, comparedHead: f.head, status: "ahead" },
+      }),
+    );
+    const foreign = await f.run("--fresh-base", `--facts-file=${facts}`);
+    expect(foreign.code).not.toBe(0);
+    expect(foreign.json?.passed).not.toBe(true);
+    expect(foreign.err).toMatch(/scope|repository|ownerRepo/i);
+  });
+
   it("accepts a green capstone at the head (exit 0) and says so", async () => {
     fixtureGh();
     const r = await gate(tmp(), "--head=green-capstone");
diff --git a/.bkit/core/engine/commands/workflow/runs.ts b/.bkit/core/engine/commands/workflow/runs.ts
index a1b2bf1fa..85db107e0 100644
--- a/.bkit/core/engine/commands/workflow/runs.ts
+++ b/.bkit/core/engine/commands/workflow/runs.ts
@@ -65,6 +65,7 @@ import {
   devRequiresChecks,
   prRepoSlug,
   probePr,
+  validPrFacts,
   type PrInfo,
 } from "./prs.js";
 import { resolveOwnerRepo, splitSlug } from "./repo.js";
@@ -952,6 +953,8 @@ export const GATE = {
   NOT_BOOKKEEPING: 17,
   /** --pr: the PR title carries a CI-suppressing token (its squash would skip CI on dev). */
   TITLE_SKIP: 18,
+  /** The current dev is absent from the validated code head. */
+  STALE_BASE: 19,
   /** API error, rate limit, or auth — distinct from "no run". */
   API_ERROR: 20,
 } as const;
@@ -1957,6 +1960,31 @@ function logResolvedPrRepo(
 
 function runGate(ctx: RunContext): number {
   const f = ctx.flags;
+  const freshBase = f.freshBase === true;
+  if (freshBase && (f.pr === undefined || f.capstoneOnly === true))
+    throw new CommandError(EXIT.USAGE, "--fresh-base requires --pr without --capstone-only");
+  const factsPath = str(f.factsFile);
+  let facts: Record<string, unknown> | undefined;
+  if (factsPath !== undefined) {
+    if (!freshBase) throw new CommandError(EXIT.USAGE, "--facts-file requires --fresh-base");
+    const parsed = readJsonFile(path.resolve(ctx.cwd, factsPath));
+    if (!parsed.ok) throw new CommandError(EXIT.USAGE, "cannot read scoped gate facts");
+    facts = obj(parsed.value);
+    const info = facts.pr;
+    if (
+      !validPrFacts(info) ||
+      facts.ownerRepo !== prRepoSlug(info.url) ||
+      (str(f.repo) !== undefined && facts.ownerRepo !== str(f.repo)) ||
+      facts.prNumber !== Number(f.pr) ||
+      info.number !== Number(f.pr) ||
+      facts.headRefName !== info.headRefName ||
+      (str(f.branch) !== undefined && facts.headRefName !== str(f.branch)) ||
+      facts.baseRefName !== DEV ||
+      info.baseRefName !== DEV ||
+      info.state !== "OPEN"
+    )
+      throw new CommandError(EXIT.USAGE, "gate facts repository, PR, head or base scope mismatch");
+  }
   let selection: CiSelection | undefined;
   const selectionFile = str(f.ciSelectionFile);
   if (selectionFile !== undefined) {
@@ -1980,7 +2008,43 @@ function runGate(ctx: RunContext): number {
       ctx.log(`fetch of origin/${branch} failed: ${fetched.stderr.trim()}`);
   }
   const root = checkoutRoot(ctx.cwd);
-  const gh: Gh = (args) => runGh(ctx.cwd, args);
+  const gh: Gh =
+    facts === undefined
+      ? (args) => runGh(ctx.cwd, args)
+      : (args) => {
+          const reply = (value: unknown): GhResult => ({
+            ok: true,
+            stdout: JSON.stringify(value),
+            stderr: "",
+            missing: false,
+          });
+          const ci = obj(facts.ci);
+          const repo = text(facts.ownerRepo);
+          const endpoint = args[1]?.replace(/^\//, "") ?? "";
+          if (args[0] === "repo" && args[1] === "view")
+            return { ok: true, stdout: repo, stderr: "", missing: false };
+          const workflow = readBkitConfig(checkoutRoot(ctx.cwd)).ciWorkflow;
+          if (
+            args[0] === "api" &&
+            endpoint.startsWith(`repos/${repo}/actions/workflows/${workflow}/runs?`)
+          )
+            return reply(ci.workflowRuns);
+          const jobMatch = new RegExp(`^repos/${repo}/actions/runs/([0-9]+)/jobs$`).exec(endpoint);
+          if (
+            args[0] === "api" &&
+            jobMatch &&
+            arr(obj(ci.workflowRuns).workflow_runs).some(
+              (run) => String(obj(run).id) === jobMatch[1],
+            )
+          )
+            return reply(ci.jobs);
+          return {
+            ok: false,
+            stdout: "",
+            stderr: "scoped gate facts do not contain this API evidence",
+            missing: false,
+          };
+        };
   const record = str(f.record);
   const recordFile = record === undefined ? undefined : path.resolve(ctx.cwd, record);
   const prNumber = str(f.pr) ?? str(f.squashOf);
@@ -1991,7 +2055,10 @@ function runGate(ctx: RunContext): number {
   if (prNumber !== undefined) {
     if (!/^[1-9][0-9]*$/.test(prNumber))
       throw new CommandError(EXIT.USAGE, "--pr / --squash-of take a PR number");
-    pr = probePr(ctx.cwd, { number: prNumber, state: "open", repo: str(f.repo) });
+    pr =
+      facts !== undefined && validPrFacts(facts.pr)
+        ? { kind: "ok", pr: facts.pr }
+        : probePr(ctx.cwd, { number: prNumber, state: "open", repo: str(f.repo) });
     if (pr.kind === "unavailable") {
       ctx.log(pr.message);
       return EXIT.USE_MCP;
@@ -2015,6 +2082,54 @@ function runGate(ctx: RunContext): number {
   }
   if (head === "") throw new CommandError(EXIT.USAGE, "--head needs a non-empty value");
 
+  const info = pr?.kind === "ok" ? pr.pr : undefined;
+  const repo = str(f.repo) ?? prRepoSlug(info?.url);
+  const codeHead = str(f.validated) ?? head;
+  let baseEvidence: { devSha: string; comparedHead: string; ancestor: boolean | null } | undefined;
+  if (freshBase) {
+    baseEvidence = { devSha: "", comparedHead: codeHead, ancestor: null };
+    if (facts !== undefined) {
+      const base = obj(facts.base);
+      if (
+        base.ref === DEV &&
+        /^[0-9a-f]{40,64}$/i.test(text(base.sha)) &&
+        base.comparedHead === codeHead &&
+        ["ahead", "identical", "behind", "diverged"].includes(text(base.status))
+      ) {
+        baseEvidence.devSha = text(base.sha);
+        baseEvidence.ancestor = ["ahead", "identical"].includes(text(base.status));
+      }
+    } else if (repo !== undefined && isForeignRepo(ctx.cwd, repo)) {
+      const dev = gh(["api", `repos/${repo}/commits/dev`, "--jq", ".sha"]);
+      if (dev.ok && /^[0-9a-f]{40,64}$/i.test(dev.stdout.trim())) {
+        baseEvidence.devSha = dev.stdout.trim();
+        const compare = gh([
+          "api",
+          `repos/${repo}/compare/${baseEvidence.devSha}...${codeHead}`,
+          "--jq",
+          ".status",
+        ]);
+        if (
+          compare.ok &&
+          ["ahead", "identical", "behind", "diverged"].includes(compare.stdout.trim())
+        )
+          baseEvidence.ancestor = ["ahead", "identical"].includes(compare.stdout.trim());
+      }
+    } else {
+      const fetched = fetchRemoteRef(ctx.cwd, "origin/dev");
+      if (fetched?.ok) {
+        baseEvidence.devSha = git(ctx.cwd, ["rev-parse", "--verify", "origin/dev^{commit}"]) ?? "";
+        const compared = runTool(
+          "git",
+          ["merge-base", "--is-ancestor", baseEvidence.devSha, codeHead],
+          ctx.cwd,
+        );
+        if (compared.status === 0 || compared.status === 1)
+          baseEvidence.ancestor = compared.status === 0;
+      }
+    }
+  }
+
   // The pre-merge snapshot, written BEFORE the gate decides.
   const snapshot = str(f.snapshot);
   if (snapshot !== undefined) {
@@ -2024,7 +2139,10 @@ function runGate(ctx: RunContext): number {
     // A foreign repo's dev and ancestry come from the API: the checkout's origin/dev is another repo's.
     let dev: string;
     let ancestor: boolean;
-    if (foreign && repoFlag !== undefined) {
+    if (baseEvidence !== undefined) {
+      dev = baseEvidence.devSha;
+      ancestor = baseEvidence.ancestor === true;
+    } else if (foreign && repoFlag !== undefined) {
       const devRes = gh(["api", `repos/${repoFlag}/commits/dev`, "--jq", ".sha"]);
       dev = devRes.ok ? devRes.stdout.trim() : "";
       const cmp = gh(["api", `repos/${repoFlag}/compare/dev...${head}`, "--jq", ".status"]);
@@ -2061,6 +2179,12 @@ function runGate(ctx: RunContext): number {
         validatedHead: str(f.validated) ?? "",
         devSha: dev,
         ancestor: String(ancestor),
+        ...(baseEvidence === undefined
+          ? {}
+          : {
+              comparedHead: baseEvidence.comparedHead,
+              baseEvidenceAvailable: baseEvidence.ancestor !== null,
+            }),
         capstone,
         mergeable: info?.mergeable ?? "",
       })}\n`,
@@ -2070,10 +2194,22 @@ function runGate(ctx: RunContext): number {
   // A title carrying a skip token would squash into a dev commit CI never runs on.
   const title = pr?.kind === "ok" ? (pr.pr?.title ?? "") : "";
   const titleToken = f.pr !== undefined ? SKIP_CI_TOKEN.exec(title)?.[0] : undefined;
+  const baseUnavailable =
+    baseEvidence?.ancestor === null || (freshBase && info?.baseRefName !== DEV);
+  const baseRefused = freshBase && (baseEvidence?.ancestor !== true || baseUnavailable);
+  const safetyReason = baseRefused
+    ? baseUnavailable
+      ? "fresh dev base evidence is unavailable or the PR base is not dev"
+      : `dev base ${baseEvidence?.devSha ?? ""} is absent from validated code head ${codeHead}; integrate dev and revalidate`
+    : `PR title '${title}' contains the CI-suppressing token ${titleToken ?? ""}`;
   let r: GateResult =
-    titleToken !== undefined
+    baseRefused || titleToken !== undefined
       ? {
-          code: GATE.TITLE_SKIP,
+          code: baseRefused
+            ? baseUnavailable
+              ? GATE.API_ERROR
+              : GATE.STALE_BASE
+            : GATE.TITLE_SKIP,
           passed: false,
           overridden: false,
           head,
@@ -2084,12 +2220,12 @@ function runGate(ctx: RunContext): number {
           conclusion: null,
           capstone: "",
           ciWorkflow: "",
-          repo: str(f.repo) ?? null,
+          repo: repo ?? null,
           skippedLanes: [],
           nonBookkeepingPaths: [],
           failedSteps: [],
           regenerable: false,
-          reason: `PR title '${title}' contains the CI-suppressing token ${titleToken}`,
+          reason: safetyReason,
         }
       : shipGate(
           {
@@ -2108,7 +2244,7 @@ function runGate(ctx: RunContext): number {
           gh,
           ctx.log,
         );
-  if (titleToken !== undefined) ctx.log(r.reason);
+  if (baseRefused || titleToken !== undefined) ctx.log(r.reason);
 
   // Debug retains the configured gate above and also proves the original
   // selected workflow at the pushed head. A different workflow need not contain
@@ -2702,6 +2838,16 @@ export const runsCommand: CommandSpec = {
           type: "string",
           help: "validated original debug selection: additionally require its workflow to succeed at the exact pushed head",
         },
+        {
+          name: "fresh-base",
+          type: "boolean",
+          help: "ship pre-merge: require fresh dev ancestry in the validated code head; CI overrides cannot waive it",
+        },
+        {
+          name: "facts-file",
+          type: "string",
+          help: "with --fresh-base: scoped independently read PR, CI and dev comparison facts, without gh calls",
+        },
         { ...HEAD_FLAG, help: "the PR head to merge (or --pr / --squash-of)" },
         {
           name: "pr",
@@ -2792,6 +2938,8 @@ export const runsCommand: CommandSpec = {
         [GATE.LANE_SKIPPED]: "a required lane concluded skipped",
         [GATE.NOT_BOOKKEEPING]: "non-bookkeeping change past --validated, or not its descendant",
         [GATE.TITLE_SKIP]: "--pr: the PR title carries a CI-suppressing token",
+        [GATE.STALE_BASE]:
+          "fresh dev is absent from the validated code head; integrate and revalidate",
         [GATE.API_ERROR]:
           "API error / rate limit / auth, or the PR head / squash commit unreadable",
       },
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
index fc0f8af71..4344a5de4 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
@@ -39,7 +39,7 @@ description: "Ship Feature — Autonomous merge and archive"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path becomes it), checks artifacts and row, writes the row (ship: `--commit=none`, bookkeeping to `$BOOK_ROOT`), prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS.
+- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`. For `number` from 3 through 10, return to Step 3 instead, which compares recorded feature coverage before reusing completed agents. `after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS.
 - **Status:** `$BOOK_ROOT/.../status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Step 14 releases it via `bkit workflows close --flush --token=`, the **Failure Path** via `bkit workflows fail --token=`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
 - **Status branch:** From Step 2 all steps write `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (`{STATUS}`); `BOOK_ROOT` = `{WORKTREE_PATH}`. Stage path-scoped via `bkit ledgers commit`; NEVER stage all files (`-A`) or blanket `docs/`. One commit per flush block: Commit + Push Bookkeeping → `docs({FID}): ship bookkeeping bkit [skip ci]` → push `{SHIP_BRANCH}` (pre-merge: docs, logs, ledgers, skill removals); Close Workflow → `docs({FID}): ship DONE bkit [skip ci]`, **Failure Path** → `chore({FID}): ship FAILED bkit [skip ci]` → push `dev` from a throwaway `origin/dev` checkout; a refused close push → close PR.
@@ -180,10 +180,34 @@ _No tracker connected, skip step._
    "{BKIT}" workflows input --workflow=ship --fid={FID} --run={RUN} --file="{STATUS}" --prompt-file="{SESSION_DIR}/prompt.md" --plan="docs/plans/{YYYYMM}/{FID}-plan.md" || exit 1
    ```
 2. Find the branch's PR — open first, then merged:
+   Reconcile and publish before probing or opening a PR, including on resume:
+
+   ```bash
+   "{BKIT}" branches sync --reconcile-feature --fid="{FID}" --file="{STATUS}"
+   ```
+
+   Route — first match wins:
+   - **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 2 → Step 4 sub-step 2.
+   - **If** exit 0 → hold `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD` → publish the resulting local head before sweep/docs bookkeeping.
+     ```bash
+     "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+     ```
+     Route:
+     **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
+   - **Else** → **Failure Path**.
+
    ```bash
-   "{BKIT}" prs probe --head="{SHIP_BRANCH}" --state=all
+   "{BKIT}" prs probe --head="{SHIP_BRANCH}" --base=dev --state=all --ship-entry --owner-repo="{OWNER_REPO}"
    ```
+
    Hold `number` as `PR_NUMBER`, `baseRefName` as `PR_BASE`, and hold `state`.
+   **If** exit 80 **or** `runtimeGithubCli` = false → read open PRs first, then merged PRs through MCP, independently reread the selected PR, and write `{ ownerRepo, headRefName, baseRefName: "dev", pr }` to `{OUTBOX}/ship-entry-facts.json`. `pr` is the complete `PrInfo` shape (`number`, `url`, `state`, `baseRefName`, `headRefName`, `headRefOid`, `title`, `mergeCommit`, `mergeable`), or null when neither exists. Record the single transport transition under **gh MCP fallback**, then use the engine's result:
+
+   ```bash
+   "{BKIT}" prs probe --head="{SHIP_BRANCH}" --base=dev --state=all --ship-entry --owner-repo="{OWNER_REPO}" --facts-file="{OUTBOX}/ship-entry-facts.json"
+   ```
+
+   Missing or mismatched facts → **Failure Path** before opening or merging anything. A merged PR with extra feature work returns exit 1: open a new PR, preserving that work.
    Route — first match wins:
    - **If** exit 0 **and** `PR_BASE` != dev → **Failure Path**.
    - **If** exit 0 → sub-step 3.
@@ -208,6 +232,7 @@ _No tracker connected, skip step._
      Assert `PR_NUMBER` non-empty and `PR_BASE` = dev. **If** the assertion fails → **Failure Path**.
 
    - **Else** → **Failure Path**.
+
 3. Route:
    - **If** `state` = MERGED → record the resume marker → Step 13:
      ```bash
@@ -304,11 +329,21 @@ _No tracker connected, skip step._
 
 ## 🤖 Step 3 — Base Check
 
-1. Determine whether `origin/dev` is an ancestor of the PR head:
+1. Reconcile again on every integration retry, then publish before selecting `BASE_PATH`:
+   ```bash
+   "{BKIT}" branches sync --reconcile-feature --fid="{FID}" --file="{STATUS}"
+   ```
+   Hold `basePath` as `BASE_PATH`, `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD`. **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 3 → Step 4 sub-step 2. **If** another non-zero exit → **Failure Path**.
+   ```bash
+   "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+   ```
+   Route:
+   **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
+   Compute the merge-aware feature coverage state:
    ```bash
-   "{BKIT}" branches sync --head="{ENTRY_HEAD}"
+   "{BKIT}" branches sync --feature-state --month="{YYYYMM}" --fid="{FID}"
    ```
-   Hold `basePath` as `BASE_PATH`.
+   Hold `featureCodeState` as `FEATURE_CODE_STATE`. Non-zero exit → **Failure Path**. Bookkeeping commits and proven automatic base-only merges retain coverage. New feature commits, imported feature merges and semantic conflict resolutions invalidate coverage. Unproven merge results remain in the state. Record this exact state with each successful sweep/docs completion below; read those rows from `{STATUS}` on resume.
 2. Route:
    - **If** `BASE_PATH` = A → Step 5 (skip integration — dev has not moved; no `bkit:generate`, because CI fails on a stale generated file and Step 10 regenerates when that is the only failure).
    - **If** `BASE_PATH` = B → Step 4 (integration required; its merge runs `bkit:generate`).
@@ -326,13 +361,17 @@ _No tracker connected, skip step._
 
 ## 🧠 Step 4 — Integrate (Path B only)
 
-**Run only if** `BASE_PATH` = B.
+**Run only if** `BASE_PATH` = B **or** a feature reconciliation left `PENDING` conflicts.
 
 1. Merge `origin/dev` into `SHIP_BRANCH` locally. The block commits the run's uncommitted work first, unions the append-only ledgers, regenerates a conflicted lockfile from `dev`'s copy, rebuilds a conflicted generated register from `dev`'s copy, takes `dev`'s copy of the generated block in a conflicted embedding doc (a doc the register's script copies that block into) and merges the rest of that doc, merges a conflicted install record (`.bkit/version`) entry by entry with `dev`'s value where both sides changed an entry, runs a declared `bkit:generate`, and leaves every other conflict in the tree for sub-step 2. GitHub ignores `merge=union`, so the merged commit, not a server-side update or a rebase, is what makes the PR mergeable. No commit the block makes carries a skip token, so the sub-step 3 push starts CI at the merged head and Step 9 waits on that run:
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" branches sync --merge --fid="{FID}" --file="{STATUS}" --sentinel="docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"
+   git rev-parse --verify origin/dev
    ```
-   Hold `outcome` as `MERGE_OUTCOME`, `pending` as `PENDING`.
+   Hold the printed commit as `MERGE_TARGET`.
+   ```bash
+   cd "{WORKTREE_PATH}" && "{BKIT}" branches sync --merge --fid="{FID}" --file="{STATUS}" --target="{MERGE_TARGET}" --sentinel="docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"
+   ```
+   Hold `outcome` as `MERGE_OUTCOME`, `pending` as `PENDING`, `target` as `MERGE_TARGET`, and `head` as `CODE_HEAD` and `ENTRY_HEAD`. Set `RECONCILE_NEXT` empty for this dev integration.
    Route:
    - **If** exit 0 **and** `MERGE_OUTCOME` = merged → sub-step 3.
    - **If** exit 0 **and** `MERGE_OUTCOME` = current → Step 5. `dev` has not moved since Step 3.
@@ -340,7 +379,7 @@ _No tracker connected, skip step._
    - **Else** → **Failure Path**. The block aborted the merge and wrote the sentinel.
 2. Resolve the conflicts the block left:
    1. **Subagent:** Invoke `@bkit-ship-conflict-resolve` using `Agent` tool:
-      Context: You are a subagent in the Ship phase. A merge of `origin/dev` is in progress with conflicts outside the ledgers, the lockfile, the generated register, the embedding docs and the install record: `{PENDING}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
+      Context: You are a subagent in the Ship phase. A merge of the engine-recorded target `{MERGE_TARGET}` is in progress with conflicts outside the ledgers, the lockfile, the generated register, the embedding docs and the install record: `{PENDING}`. Continue only this target. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
       Read: `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `{STATUS}`.
       Update: Conflicted source files.
       Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-conflict-resolve.md`.
@@ -351,14 +390,18 @@ _No tracker connected, skip step._
    3. **If** `verdict` = PASS → sub-step 3. The subagent's re-run of the block committed the merge.
       **Else** → **Failure Path** (non-mechanical conflict → handover).
 3. Push the merged branch. The merge adds commits on top of the pushed head, so the push is plain, NEVER forced:
+
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+
    Route:
    - **If** exit 81 → end turn, re-run this block.
    - **If** exit 0 → continue with the next instruction.
    - **Else** → **Failure Path**.
 
+   **If** `RECONCILE_NEXT` is held → return there and reconcile again. **Else** → refresh `ENTRY_HEAD` and `CODE_HEAD` with `git rev-parse HEAD` → Step 5, which recomputes coverage after the integration and any conflict resolution.
+
 ### 🔒 Gate 4 — Integrate
 
 - [ ] Path classified
@@ -371,10 +414,15 @@ _No tracker connected, skip step._
 
 ## 🤖 Step 5 — Deferred Sweep
 
-1. Fast-forward to the PR head, never onto a diverged branch:
-   ```bash
-   "{BKIT}" branches fast-forward --onto="origin/{SHIP_BRANCH}" >/dev/null || exit $?
-   ```
+Recompute coverage immediately before deciding whether to reuse the sweep:
+
+```bash
+"{BKIT}" branches sync --feature-state --month="{YYYYMM}" --fid="{FID}"
+```
+
+Refresh `FEATURE_CODE_STATE` from `featureCodeState`; non-zero exit → **Failure Path**.
+
+1. Read the latest successful `ship-feature-coverage` row for `step=ship-deferred-sweep` from `{STATUS}`. **If** its recorded feature-code state matches `FEATURE_CODE_STATE` and its artifact still exists → reuse it and skip to Step 6. **If** the state changed, differs or is missing → invoke the sweep again below. Never reuse a completion from a different feature state.
 2. Check for the plan:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" fids plans --fid="{FID}" --month="{YYYYMM}"
@@ -399,7 +447,10 @@ _No tracker connected, skip step._
    "{BKIT}" steps finish --workflow=ship --step=ship-deferred-sweep --file="{STATUS}" --agent=bkit-ship-deferred-sweep --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md" --commit=none --number=5 --post --title="Deferred Sweep"
    ```
 4. Route:
-   - **If** `verdict` = PASS → Step 6.
+   - **If** `verdict` = PASS → record the covered feature-code state → Step 6:
+     ```bash
+     "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=ship-feature-coverage --field=step=ship-deferred-sweep --field="featureCodeState={FEATURE_CODE_STATE}" >/dev/null || exit 1
+     ```
    - **If** `verdict` = FAIL → write the `.deferred-blocked` sentinel below under `BOOK_ROOT`, then **Failure Path**.
      ```bash
      touch "{BOOK_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/.deferred-blocked"
@@ -408,7 +459,7 @@ _No tracker connected, skip step._
 
 ### 🔒 Gate 5 — Deferred Sweep
 
-- [ ] Worktree fast-forwarded
+- [ ] Reconciled feature-code state compared with recorded sweep coverage
 - [ ] Subagent invoked (`@bkit-ship-deferred-sweep`, no inline work)
 - [ ] Mechanical checks passed (`steps finish`)
 
@@ -416,6 +467,16 @@ _No tracker connected, skip step._
 
 ## 🧠 Step 6 — Update Docs & Summary
 
+Refresh coverage again before deciding whether to reuse the docs artifact:
+
+```bash
+"{BKIT}" branches sync --feature-state --month="{YYYYMM}" --fid="{FID}"
+```
+
+Hold the current `featureCodeState` as `FEATURE_CODE_STATE`; non-zero exit → **Failure Path**.
+
+Read the latest successful `ship-feature-coverage` row for `step=ship-update-docs` from `{STATUS}`. **If** its recorded feature-code state matches `FEATURE_CODE_STATE` and the docs artifact exists → reuse it and skip sub-steps 1–3. **If** the state changed, differs or is missing → run the docs agent again. Always refresh the summary in sub-step 4.
+
 1. Write the FID's deferral lines to the artifact the docs agent reads `Pending Items` from:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" context ledger-scan --terms="{FID}" --source=docs/deferrals.jsonl --artifact="{OUTBOX}/ship-pending-items.md" --fid={FID} --step=ship-update-docs --reset-log >/dev/null || exit 1
@@ -429,6 +490,7 @@ _No tracker connected, skip step._
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
    "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none || exit 1
+   "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=ship-feature-coverage --field=step=ship-update-docs --field="featureCodeState={FEATURE_CODE_STATE}" >/dev/null || exit 1
    ```
 4. Write `ship-summary.md` from this run's status rows and the PR's size:
    ```bash
@@ -500,6 +562,8 @@ _No tracker connected, skip step._
 
 ## 🤖 Step 9 — Re-validate
 
+**If** `RECONCILE_REQUIRED` = true → clear it → Step 3 before validation. A previous `DONE` row alone never proves coverage of imported feature code.
+
 1. Resolve the head CI must pass at. The block re-validates when the code moved **or** `REVALIDATE_REASON` = `gate-refusal`: it probes for a run at it first, dispatches only when none, and waits for it to complete. Drop `--reason` when `REVALIDATE_REASON` is empty:
    ```bash
    "{BKIT}" runs revalidate --pr="{PR_NUMBER}" --entry-head="{ENTRY_HEAD}" --code-head="{CODE_HEAD}" --branch="{SHIP_BRANCH}" --month="{YYYYMM}" --fid="{FID}" --file="{STATUS}" --reason="{REVALIDATE_REASON}" --repo="{OWNER_REPO}"
@@ -521,10 +585,22 @@ _No tracker connected, skip step._
 
 1. Assert the gate at the PR's current head, with CI checked at `VALIDATED_HEAD`. This gate is the ONLY merge precondition. The block writes the pre-merge snapshot to the outbox before the gate decides, refuses a title that carries a skip token (18), and records a refusal in `{STATUS}`:
    ```bash
-   "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fetch --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
+   "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fetch --fresh-base --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
+   ```
+   **If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
+   ```bash
+   "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fresh-base --facts-file="{OUTBOX}/ship-gate-facts.json" --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
    ```
    Route:
    - **If** exit 0 → hold `mergeHead` as `GATE_HEAD` → sub-step 2.
+   - **If** exit 19 (stale base) → the gate already recorded one failed arrival; route to integration:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path**, preserving the branch and worktree on exhaustion.
    - **If** exit 11 (in progress — poll), 14 (stale green), 10 (no run) **or** 17 (non-bookkeeping change past `VALIDATED_HEAD`) → route on the failed arrivals at Step 10, without asking:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
@@ -562,12 +638,16 @@ _No tracker connected, skip step._
    - **Else** (12, 13, 15, 16, 18 or 20) → **Failure Path**.
 2. Merge with an empty body and `--match-head`, so GitHub refuses when the head moved. Re-read the labels from the tracker, so that ` bkit [auto route]` rides the squash subject on `bkit:auto`. The labels are never carried forward from Step 1's `{LABELS}`. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when no tracker is wired:
    ```bash
-   "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --delete-branch {LABEL_FLAGS} --expect-merged
+   "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --ship-retry --owner-repo="{OWNER_REPO}" {LABEL_FLAGS} --expect-merged
    ```
    Route:
-   - **If** exit 0 **or** 7 → hold `verdict` as `MERGE_VERDICT`, `failures` as `MERGE_FAILURES`, and hold `state`.
-   - **If** exit 80 → `pull_request_read` (`get`) and assert `base.ref` = `dev`; mismatch → **Failure Path** with nothing merged; then `merge_pull_request` and read `state` back through `pull_request_read` → `MERGE_VERDICT` = PASS and `MERGE_FAILURES` = 0 when merged, else FAIL and 1.
-   - **Else** (8: the PR's base is not `dev`, nothing merged) → **Failure Path**.
+   - **If** exit 0, 5, 7, 8, 9 **or** 10 → hold `route` as `MERGE_ROUTE`, `reason` as `MERGE_REASON`, `verdict` as `MERGE_VERDICT`, `failures` as `MERGE_FAILURES`, and hold `state` → sub-step 3. Missing output fields → **Failure Path**.
+   - **If** exit 80 **or** `runtimeGithubCli` = false → read fresh pre-attempt PR facts through `pull_request_read` (`get`). Refresh the scoped gate facts above with this PR, fresh CI and base evidence, and run that engine gate again before mutation. Only exit 0 authorizes `merge_pull_request`, with `sha` = the newly printed `GATE_HEAD`, the skip-token-free PR subject and an empty body. A gate refusal takes sub-step 1's route and consumes only its existing refusal row. After the attempt, independently reread post-attempt PR state through `pull_request_read`; never copy the mutation response or pre-attempt facts into `after`. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", matchHead, before, after }` to `{OUTBOX}/ship-merge-facts.json`, with complete `PrInfo` values for both reads and `matchHead` = `GATE_HEAD`. Missing or mismatched evidence → **Failure Path**. Record the single transport transition under **gh MCP fallback**, then classify without a second mutation:
+     ```bash
+     "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --ship-retry --owner-repo="{OWNER_REPO}" --facts-file="{OUTBOX}/ship-merge-facts.json" {LABEL_FLAGS} --expect-merged
+     ```
+     Hold the same route, reason, verdict, failures and state as the gh-backed result → sub-step 3.
+   - **Else** → **Failure Path**.
 3. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-merge-pr --file="{STATUS}" --verdict={MERGE_VERDICT} --failures={MERGE_FAILURES} --attempt=next --commit=none --number=10 --post --title="Merge Gate + Merge PR"
@@ -575,15 +655,24 @@ _No tracker connected, skip step._
    Hold `attempt` as `MERGE_ATTEMPT`.
 4. Route:
    - **If** `state` = MERGED → Step 13.
-   - **If** `state` != MERGED → run counter routing:
+   - **If** `MERGE_ROUTE` = revalidate (exit 9) → Step 9 through the durable counter:
      ```bash
-     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-11 --exceeded=failure-path
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
      ```
      Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
-     - **If** exit 0 → Step 11.
-     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 11 → **Merge Question**.
+     Set `RECONCILE_REQUIRED` = true and `REVALIDATE_REASON` = gate-refusal, so imported feature work passes the state comparison and sweep/docs gates before CI.
+     - **If** exit 0 → Step 9.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 9 → **Merge Question**.
      - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
-   - **Else** → **Failure Path**.
+   - **If** `MERGE_ROUTE` = integrate (exit 10) → Step 3 through the same durable counter:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path** on exhaustion.
+   - **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Recoverable merge refusals never enter Steps 11–12. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
 
 ### 🔒 Gate 10 — Merge Gate + Merge PR
 
@@ -744,7 +833,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
    "{BKIT}" runs gate --squash-of="{PR_NUMBER}" --repo="{OWNER_REPO}" --capstone-only --record="{STATUS}"
    ```
    Hold `head` as `SQUASH_SHA`.
-2. Close the run. The block keeps the summary in the outbox (the close removes the worktree it lives in), lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, removes the worktree and `SHIP_BRANCH`, and returns to `REPO_ROOT`:
+2. Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is retained when conditional deletion cannot be guaranteed; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
    ```bash
    "{BKIT}" workflows close --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --pr-number="{PR_NUMBER}" --squash-sha="{SQUASH_SHA}" --owner-repo="{OWNER_REPO}" --outbox="{OUTBOX}" --flush --token="{LOCK_TOKEN}" --branch="{SHIP_BRANCH}" --number=14 --post --title="Close Workflow" --final-return --summary="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --summary-missing="PR was already merged — no ship summary this run." --session-dir="{SESSION_DIR}"; rc=$?
    cd "{REPO_ROOT}"; exit $rc
@@ -764,7 +853,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 
 - [ ] Squash-merge CI capstone green (`runs gate`)
 - [ ] Close landed (`workflows close`)
-- [ ] Worktree removed and feature branch deleted, back in the repo root
+- [ ] Guarded cleanup and retained paths/refs reported, back in the repo root
 - [ ] Mechanical checks passed (`steps gate`)
 - [ ] Logs retained
 - [ ] Final return displayed
diff --git a/.bkit/core/prompts/bkit-ship-conflict-resolve.md b/.bkit/core/prompts/bkit-ship-conflict-resolve.md
index d56e1ed43..6f5f7513b 100644
--- a/.bkit/core/prompts/bkit-ship-conflict-resolve.md
+++ b/.bkit/core/prompts/bkit-ship-conflict-resolve.md
@@ -58,7 +58,9 @@ autoCompactWindow: 300000
 5. Confirm the merge state the caller left:
    - Record the branch head with `git rev-parse HEAD`, and append a log entry naming it.
    - Run `git rev-parse -q --verify MERGE_HEAD`.
-   - **If** it prints nothing → no merge of `origin/dev` is in progress, so there is no conflict here to resolve:
+   - Resolve the caller's engine-recorded `{MERGE_TARGET}` with `git rev-parse --verify "{MERGE_TARGET}^{commit}"` and compare it with `MERGE_HEAD`.
+   - **If** either value is unreadable or the values differ → set `Verdict` = `FAIL` with `Edit`, name the target mismatch in the log and go straight to setting `Verdict`.
+   - **If** it prints nothing → no merge of the recorded target is in progress, so there is no conflict here to resolve:
      - Set `Verdict` = `FAIL` with `Edit`.
      - Go straight to setting `Verdict`.
    - Append a log entry.
@@ -66,7 +68,7 @@ autoCompactWindow: 300000
    ```bash
    BKIT="$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"
    [ -x "$BKIT" ] || BKIT="$(command -v bkit || echo "$BKIT")"
-   "$BKIT" branches sync --merge --file="{STATUS}"
+   "$BKIT" branches sync --merge --target="{MERGE_TARGET}" --file="{STATUS}"
    case $? in
      0) echo "MERGE_COMPLETE" ;;
      24) echo "HAND_RESOLVE" ;;
@@ -81,11 +83,11 @@ autoCompactWindow: 300000
      - Go straight to setting `Verdict`.
 7. Classify the conflicts:
    - List the conflicted files with `git diff --name-only --diff-filter=U`.
-   - List each side's recent commits with `git log -5 --oneline HEAD` and `git log -5 --oneline origin/dev`, then append a log entry.
+   - List each side's recent commits with `git log -5 --oneline HEAD` and `git log -5 --oneline "{MERGE_TARGET}"`, then append a log entry.
    - Classify each conflicted file against these two lists, then append a log entry:
      - `Allowed resolutions`:
        - Non-overlapping additive edits to the same file → concatenate them, keeping both sides.
-       - Formatting-only drift (whitespace, trailing newline, prettier output) → take `origin/dev`'s format.
+       - Formatting-only drift (whitespace, trailing newline, prettier output) → take the recorded target's format.
        - A dependency manifest bump on one side only (`package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`) → take the bump.
        - Additive JSON array entries or object property additions with no key or position overlap → concatenate them.
      - `Refused resolutions`:
@@ -108,7 +110,7 @@ autoCompactWindow: 300000
    - Append a log entry with its exit code.
    - **If** it exits non-zero → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
 10. Set `Verdict` in **Create** with `Edit`:
-    - `PASS` = a merge of `origin/dev` was in progress, every conflicted file was resolved by the auto-resolver or classified `Allowed resolutions` and resolved, the merge is committed, and `pnpm bkit:gate:install-static-unit-build` exited 0.
+    - `PASS` = a merge of the recorded target was in progress, every conflicted file was resolved by the auto-resolver or classified `Allowed resolutions` and resolved, the merge is committed, and `pnpm bkit:gate:install-static-unit-build` exited 0.
     - `FAIL` = no merge was in progress, **or** any conflicted file was classified `Refused resolutions`, **or** the auto-resolver aborted the merge, **or** any verify command exited non-zero.
 11. **If** `Verdict` = `FAIL`:
     - **If** `git rev-parse -q --verify MERGE_HEAD` prints a SHA:
diff --git a/.bkit/core/workflows/bkit-ship.md b/.bkit/core/workflows/bkit-ship.md
index ffc23d320..ac74b0cdd 100644
--- a/.bkit/core/workflows/bkit-ship.md
+++ b/.bkit/core/workflows/bkit-ship.md
@@ -39,7 +39,7 @@ description: "Ship Feature — Autonomous merge and archive"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path becomes it), checks artifacts and row, writes the row (ship: `--commit=none`, bookkeeping to `$BOOK_ROOT`), prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS.
+- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`. For `number` from 3 through 10, return to Step 3 instead, which compares recorded feature coverage before reusing completed agents. `after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS.
 - **Status:** `$BOOK_ROOT/.../status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Step 14 releases it via `bkit workflows close --flush --token=`, the **Failure Path** via `bkit workflows fail --token=`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
 - **Status branch:** From Step 2 all steps write `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (`{STATUS}`); `BOOK_ROOT` = `{WORKTREE_PATH}`. Stage path-scoped via `bkit ledgers commit`; NEVER stage all files (`-A`) or blanket `docs/`. One commit per flush block: Commit + Push Bookkeeping → `docs({FID}): ship bookkeeping bkit [skip ci]` → push `{SHIP_BRANCH}` (pre-merge: docs, logs, ledgers, skill removals); Close Workflow → `docs({FID}): ship DONE bkit [skip ci]`, **Failure Path** → `chore({FID}): ship FAILED bkit [skip ci]` → push `dev` from a throwaway `origin/dev` checkout; a refused close push → close PR.
@@ -260,10 +260,34 @@ description: "Ship Feature — Autonomous merge and archive"
    "{BKIT}" workflows input --workflow=ship --fid={FID} --run={RUN} --file="{STATUS}" --prompt-file="{SESSION_DIR}/prompt.md"<!-- bkit:tracker true start --> --description-file="{SESSION_DIR}/issue-description.md" --comments-file="{SESSION_DIR}/issue-comments.json"<!-- bkit:tracker true end --> --plan="docs/plans/{YYYYMM}/{FID}-plan.md" || exit 1
    ```
 2. Find the branch's PR — open first, then merged:
+   Reconcile and publish before probing or opening a PR, including on resume:
+
+   ```bash
+   "{BKIT}" branches sync --reconcile-feature --fid="{FID}" --file="{STATUS}"
+   ```
+
+   Route — first match wins:
+   - **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 2 → Step 4 sub-step 2.
+   - **If** exit 0 → hold `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD` → publish the resulting local head before sweep/docs bookkeeping.
+     ```bash
+     "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+     ```
+     Route:
+     **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
+   - **Else** → **Failure Path**.
+
    ```bash
-   "{BKIT}" prs probe --head="{SHIP_BRANCH}" --state=all
+   "{BKIT}" prs probe --head="{SHIP_BRANCH}" --base=dev --state=all --ship-entry --owner-repo="{OWNER_REPO}"
    ```
+
    Hold `number` as `PR_NUMBER`, `baseRefName` as `PR_BASE`, and hold `state`.
+   **If** exit 80 **or** `runtimeGithubCli` = false → read open PRs first, then merged PRs through MCP, independently reread the selected PR, and write `{ ownerRepo, headRefName, baseRefName: "dev", pr }` to `{OUTBOX}/ship-entry-facts.json`. `pr` is the complete `PrInfo` shape (`number`, `url`, `state`, `baseRefName`, `headRefName`, `headRefOid`, `title`, `mergeCommit`, `mergeable`), or null when neither exists. Record the single transport transition under **gh MCP fallback**, then use the engine's result:
+
+   ```bash
+   "{BKIT}" prs probe --head="{SHIP_BRANCH}" --base=dev --state=all --ship-entry --owner-repo="{OWNER_REPO}" --facts-file="{OUTBOX}/ship-entry-facts.json"
+   ```
+
+   Missing or mismatched facts → **Failure Path** before opening or merging anything. A merged PR with extra feature work returns exit 1: open a new PR, preserving that work.
    Route — first match wins:
    - **If** exit 0 **and** `PR_BASE` != dev → **Failure Path**.
    - **If** exit 0 → sub-step 3.
@@ -288,6 +312,7 @@ description: "Ship Feature — Autonomous merge and archive"
      Assert `PR_NUMBER` non-empty and `PR_BASE` = dev. **If** the assertion fails → **Failure Path**.
 
    - **Else** → **Failure Path**.
+
 3. Route:
    - **If** `state` = MERGED → record the resume marker → Step 13:
      ```bash
@@ -384,11 +409,21 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🤖 Step 3 — Base Check
 
-1. Determine whether `origin/dev` is an ancestor of the PR head:
+1. Reconcile again on every integration retry, then publish before selecting `BASE_PATH`:
+   ```bash
+   "{BKIT}" branches sync --reconcile-feature --fid="{FID}" --file="{STATUS}"
+   ```
+   Hold `basePath` as `BASE_PATH`, `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD`. **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 3 → Step 4 sub-step 2. **If** another non-zero exit → **Failure Path**.
+   ```bash
+   "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+   ```
+   Route:
+   **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
+   Compute the merge-aware feature coverage state:
    ```bash
-   "{BKIT}" branches sync --head="{ENTRY_HEAD}"
+   "{BKIT}" branches sync --feature-state --month="{YYYYMM}" --fid="{FID}"
    ```
-   Hold `basePath` as `BASE_PATH`.
+   Hold `featureCodeState` as `FEATURE_CODE_STATE`. Non-zero exit → **Failure Path**. Bookkeeping commits and proven automatic base-only merges retain coverage. New feature commits, imported feature merges and semantic conflict resolutions invalidate coverage. Unproven merge results remain in the state. Record this exact state with each successful sweep/docs completion below; read those rows from `{STATUS}` on resume.
 2. Route:
    - **If** `BASE_PATH` = A → Step 5 (skip integration — dev has not moved; no `bkit:generate`, because CI fails on a stale generated file and Step 10 regenerates when that is the only failure).
    - **If** `BASE_PATH` = B → Step 4 (integration required; its merge runs `bkit:generate`).
@@ -406,13 +441,17 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🧠 Step 4 — Integrate (Path B only)
 
-**Run only if** `BASE_PATH` = B.
+**Run only if** `BASE_PATH` = B **or** a feature reconciliation left `PENDING` conflicts.
 
 1. Merge `origin/dev` into `SHIP_BRANCH` locally. The block commits the run's uncommitted work first, unions the append-only ledgers, regenerates a conflicted lockfile from `dev`'s copy, rebuilds a conflicted generated register from `dev`'s copy, takes `dev`'s copy of the generated block in a conflicted embedding doc (a doc the register's script copies that block into) and merges the rest of that doc, merges a conflicted install record (`.bkit/version`) entry by entry with `dev`'s value where both sides changed an entry, runs a declared `bkit:generate`, and leaves every other conflict in the tree for sub-step 2. GitHub ignores `merge=union`, so the merged commit, not a server-side update or a rebase, is what makes the PR mergeable. No commit the block makes carries a skip token, so the sub-step 3 push starts CI at the merged head and Step 9 waits on that run:
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" branches sync --merge --fid="{FID}" --file="{STATUS}" --sentinel="docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"
+   git rev-parse --verify origin/dev
    ```
-   Hold `outcome` as `MERGE_OUTCOME`, `pending` as `PENDING`.
+   Hold the printed commit as `MERGE_TARGET`.
+   ```bash
+   cd "{WORKTREE_PATH}" && "{BKIT}" branches sync --merge --fid="{FID}" --file="{STATUS}" --target="{MERGE_TARGET}" --sentinel="docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"
+   ```
+   Hold `outcome` as `MERGE_OUTCOME`, `pending` as `PENDING`, `target` as `MERGE_TARGET`, and `head` as `CODE_HEAD` and `ENTRY_HEAD`. Set `RECONCILE_NEXT` empty for this dev integration.
    Route:
    - **If** exit 0 **and** `MERGE_OUTCOME` = merged → sub-step 3.
    - **If** exit 0 **and** `MERGE_OUTCOME` = current → Step 5. `dev` has not moved since Step 3.
@@ -420,7 +459,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **Else** → **Failure Path**. The block aborted the merge and wrote the sentinel.
 2. Resolve the conflicts the block left:
    1. **Subagent:** Invoke `@bkit-ship-conflict-resolve` using `Agent` tool:
-      Context: You are a subagent in the Ship phase. A merge of `origin/dev` is in progress with conflicts outside the ledgers, the lockfile, the generated register, the embedding docs and the install record: `{PENDING}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
+      Context: You are a subagent in the Ship phase. A merge of the engine-recorded target `{MERGE_TARGET}` is in progress with conflicts outside the ledgers, the lockfile, the generated register, the embedding docs and the install record: `{PENDING}`. Continue only this target. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
       Read: `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `{STATUS}`.
       Update: Conflicted source files.
       Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-conflict-resolve.md`.
@@ -431,14 +470,18 @@ description: "Ship Feature — Autonomous merge and archive"
    3. **If** `verdict` = PASS → sub-step 3. The subagent's re-run of the block committed the merge.
       **Else** → **Failure Path** (non-mechanical conflict → handover).
 3. Push the merged branch. The merge adds commits on top of the pushed head, so the push is plain, NEVER forced:
+
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+
    Route:
    - **If** exit 81 → end turn, re-run this block.
    - **If** exit 0 → continue with the next instruction.
    - **Else** → **Failure Path**.
 
+   **If** `RECONCILE_NEXT` is held → return there and reconcile again. **Else** → refresh `ENTRY_HEAD` and `CODE_HEAD` with `git rev-parse HEAD` → Step 5, which recomputes coverage after the integration and any conflict resolution.
+
 ### 🔒 Gate 4 — Integrate
 
 - [ ] Path classified
@@ -451,10 +494,15 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🤖 Step 5 — Deferred Sweep
 
-1. Fast-forward to the PR head, never onto a diverged branch:
-   ```bash
-   "{BKIT}" branches fast-forward --onto="origin/{SHIP_BRANCH}" >/dev/null || exit $?
-   ```
+Recompute coverage immediately before deciding whether to reuse the sweep:
+
+```bash
+"{BKIT}" branches sync --feature-state --month="{YYYYMM}" --fid="{FID}"
+```
+
+Refresh `FEATURE_CODE_STATE` from `featureCodeState`; non-zero exit → **Failure Path**.
+
+1. Read the latest successful `ship-feature-coverage` row for `step=ship-deferred-sweep` from `{STATUS}`. **If** its recorded feature-code state matches `FEATURE_CODE_STATE` and its artifact still exists → reuse it and skip to Step 6. **If** the state changed, differs or is missing → invoke the sweep again below. Never reuse a completion from a different feature state.
 2. Check for the plan:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" fids plans --fid="{FID}" --month="{YYYYMM}"
@@ -479,7 +527,10 @@ description: "Ship Feature — Autonomous merge and archive"
    "{BKIT}" steps finish --workflow=ship --step=ship-deferred-sweep --file="{STATUS}" --agent=bkit-ship-deferred-sweep --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md" --commit=none --number=5 --post --title="Deferred Sweep"
    ```
 4. Route:
-   - **If** `verdict` = PASS → Step 6.
+   - **If** `verdict` = PASS → record the covered feature-code state → Step 6:
+     ```bash
+     "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=ship-feature-coverage --field=step=ship-deferred-sweep --field="featureCodeState={FEATURE_CODE_STATE}" >/dev/null || exit 1
+     ```
    - **If** `verdict` = FAIL → write the `.deferred-blocked` sentinel below under `BOOK_ROOT`, then **Failure Path**.
      ```bash
      touch "{BOOK_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/.deferred-blocked"
@@ -488,7 +539,7 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ### 🔒 Gate 5 — Deferred Sweep
 
-- [ ] Worktree fast-forwarded
+- [ ] Reconciled feature-code state compared with recorded sweep coverage
 - [ ] Subagent invoked (`@bkit-ship-deferred-sweep`, no inline work)
 - [ ] Mechanical checks passed (`steps finish`)
 
@@ -496,6 +547,16 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🧠 Step 6 — Update Docs & Summary
 
+Refresh coverage again before deciding whether to reuse the docs artifact:
+
+```bash
+"{BKIT}" branches sync --feature-state --month="{YYYYMM}" --fid="{FID}"
+```
+
+Hold the current `featureCodeState` as `FEATURE_CODE_STATE`; non-zero exit → **Failure Path**.
+
+Read the latest successful `ship-feature-coverage` row for `step=ship-update-docs` from `{STATUS}`. **If** its recorded feature-code state matches `FEATURE_CODE_STATE` and the docs artifact exists → reuse it and skip sub-steps 1–3. **If** the state changed, differs or is missing → run the docs agent again. Always refresh the summary in sub-step 4.
+
 1. Write the FID's deferral lines to the artifact the docs agent reads `Pending Items` from:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" context ledger-scan --terms="{FID}" --source=docs/deferrals.jsonl --artifact="{OUTBOX}/ship-pending-items.md" --fid={FID} --step=ship-update-docs --reset-log >/dev/null || exit 1
@@ -509,6 +570,7 @@ description: "Ship Feature — Autonomous merge and archive"
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
    "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none || exit 1
+   "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=ship-feature-coverage --field=step=ship-update-docs --field="featureCodeState={FEATURE_CODE_STATE}" >/dev/null || exit 1
    ```
 4. Write `ship-summary.md` from this run's status rows and the PR's size:
    ```bash
@@ -580,6 +642,8 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🤖 Step 9 — Re-validate
 
+**If** `RECONCILE_REQUIRED` = true → clear it → Step 3 before validation. A previous `DONE` row alone never proves coverage of imported feature code.
+
 1. Resolve the head CI must pass at. The block re-validates when the code moved **or** `REVALIDATE_REASON` = `gate-refusal`: it probes for a run at it first, dispatches only when none, and waits for it to complete. Drop `--reason` when `REVALIDATE_REASON` is empty:
    ```bash
    "{BKIT}" runs revalidate --pr="{PR_NUMBER}" --entry-head="{ENTRY_HEAD}" --code-head="{CODE_HEAD}" --branch="{SHIP_BRANCH}" --month="{YYYYMM}" --fid="{FID}" --file="{STATUS}" --reason="{REVALIDATE_REASON}" --repo="{OWNER_REPO}"
@@ -601,10 +665,22 @@ description: "Ship Feature — Autonomous merge and archive"
 
 1. Assert the gate at the PR's current head, with CI checked at `VALIDATED_HEAD`. This gate is the ONLY merge precondition. The block writes the pre-merge snapshot to the outbox before the gate decides, refuses a title that carries a skip token (18), and records a refusal in `{STATUS}`:
    ```bash
-   "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fetch --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
+   "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fetch --fresh-base --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
+   ```
+   **If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
+   ```bash
+   "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fresh-base --facts-file="{OUTBOX}/ship-gate-facts.json" --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
    ```
    Route:
    - **If** exit 0 → hold `mergeHead` as `GATE_HEAD` → sub-step 2.
+   - **If** exit 19 (stale base) → the gate already recorded one failed arrival; route to integration:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path**, preserving the branch and worktree on exhaustion.
    - **If** exit 11 (in progress — poll), 14 (stale green), 10 (no run) **or** 17 (non-bookkeeping change past `VALIDATED_HEAD`) → route on the failed arrivals at Step 10, without asking:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
@@ -649,12 +725,16 @@ description: "Ship Feature — Autonomous merge and archive"
    Hold `state` as `STATE`, `labels` as `LABELS`. **If** exit 80 → read them via the tracker MCP (**Tracker**).
    <!-- bkit:tracker true end -->
    ```bash
-   "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --delete-branch {LABEL_FLAGS} --expect-merged
+   "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --ship-retry --owner-repo="{OWNER_REPO}" {LABEL_FLAGS} --expect-merged
    ```
    Route:
-   - **If** exit 0 **or** 7 → hold `verdict` as `MERGE_VERDICT`, `failures` as `MERGE_FAILURES`, and hold `state`.
-   - **If** exit 80 → `pull_request_read` (`get`) and assert `base.ref` = `dev`; mismatch → **Failure Path** with nothing merged; then `merge_pull_request` and read `state` back through `pull_request_read` → `MERGE_VERDICT` = PASS and `MERGE_FAILURES` = 0 when merged, else FAIL and 1.
-   - **Else** (8: the PR's base is not `dev`, nothing merged) → **Failure Path**.
+   - **If** exit 0, 5, 7, 8, 9 **or** 10 → hold `route` as `MERGE_ROUTE`, `reason` as `MERGE_REASON`, `verdict` as `MERGE_VERDICT`, `failures` as `MERGE_FAILURES`, and hold `state` → sub-step 3. Missing output fields → **Failure Path**.
+   - **If** exit 80 **or** `runtimeGithubCli` = false → read fresh pre-attempt PR facts through `pull_request_read` (`get`). Refresh the scoped gate facts above with this PR, fresh CI and base evidence, and run that engine gate again before mutation. Only exit 0 authorizes `merge_pull_request`, with `sha` = the newly printed `GATE_HEAD`, the skip-token-free PR subject and an empty body. A gate refusal takes sub-step 1's route and consumes only its existing refusal row. After the attempt, independently reread post-attempt PR state through `pull_request_read`; never copy the mutation response or pre-attempt facts into `after`. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", matchHead, before, after }` to `{OUTBOX}/ship-merge-facts.json`, with complete `PrInfo` values for both reads and `matchHead` = `GATE_HEAD`. Missing or mismatched evidence → **Failure Path**. Record the single transport transition under **gh MCP fallback**, then classify without a second mutation:
+     ```bash
+     "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --ship-retry --owner-repo="{OWNER_REPO}" --facts-file="{OUTBOX}/ship-merge-facts.json" {LABEL_FLAGS} --expect-merged
+     ```
+     Hold the same route, reason, verdict, failures and state as the gh-backed result → sub-step 3.
+   - **Else** → **Failure Path**.
 3. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-merge-pr --file="{STATUS}" --verdict={MERGE_VERDICT} --failures={MERGE_FAILURES} --attempt=next --commit=none --number=10 --post --title="Merge Gate + Merge PR"
@@ -662,15 +742,24 @@ description: "Ship Feature — Autonomous merge and archive"
    Hold `attempt` as `MERGE_ATTEMPT`.
 4. Route:
    - **If** `state` = MERGED → Step 13.
-   - **If** `state` != MERGED → run counter routing:
+   - **If** `MERGE_ROUTE` = revalidate (exit 9) → Step 9 through the durable counter:
      ```bash
-     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-11 --exceeded=failure-path
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
      ```
      Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
-     - **If** exit 0 → Step 11.
-     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 11 → **Merge Question**.
+     Set `RECONCILE_REQUIRED` = true and `REVALIDATE_REASON` = gate-refusal, so imported feature work passes the state comparison and sweep/docs gates before CI.
+     - **If** exit 0 → Step 9.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 9 → **Merge Question**.
      - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
-   - **Else** → **Failure Path**.
+   - **If** `MERGE_ROUTE` = integrate (exit 10) → Step 3 through the same durable counter:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path** on exhaustion.
+   - **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Recoverable merge refusals never enter Steps 11–12. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
 
 ### 🔒 Gate 10 — Merge Gate + Merge PR
 
@@ -831,7 +920,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
    "{BKIT}" runs gate --squash-of="{PR_NUMBER}" --repo="{OWNER_REPO}" --capstone-only --record="{STATUS}"
    ```
    Hold `head` as `SQUASH_SHA`.
-2. Close the run. The block keeps the summary in the outbox (the close removes the worktree it lives in), lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, removes the worktree and `SHIP_BRANCH`, and returns to `REPO_ROOT`:
+2. Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is retained when conditional deletion cannot be guaranteed; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
    <!-- bkit:tracker true start -->
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    <!-- bkit:tracker true end -->
@@ -861,7 +950,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 
 - [ ] Squash-merge CI capstone green (`runs gate`)
 - [ ] Close landed (`workflows close`)
-- [ ] Worktree removed and feature branch deleted, back in the repo root
+- [ ] Guarded cleanup and retained paths/refs reported, back in the repo root
 - [ ] Mechanical checks passed (`steps gate`)
 - [ ] Logs retained
 - [ ] Final return displayed
diff --git a/.bkit/friction.jsonl b/.bkit/friction.jsonl
index 1ecaac7e5..230ccdf74 100644
--- a/.bkit/friction.jsonl
+++ b/.bkit/friction.jsonl
@@ -75,3 +75,4 @@
 {"schema":3,"ts":1793862830767,"kind":"friction","key":"842-skills-sandbox-dns","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-install-skills"},"references":["842-ship-fails-local"],"category":"tool-failure","scope":"universal","severity":"LOW","description":"Five skill discovery searches failed with sandbox DNS ENOTFOUND and succeeded after one approved retry each."}
 {"schema":3,"ts":1793862830768,"kind":"friction","key":"842-node-skill-selection","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-install-skills"},"references":["842-ship-fails-local"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","description":"The skills agent replaced its initial nodejs-core selection after review showed it targeted Node core contributions rather than general Node development."}
 {"schema":3,"ts":1793869337940,"kind":"friction","key":"842-shared-test-lock-wait","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["842-ship-fails-local"],"category":"tool-failure","scope":"bkit-repo","severity":"MEDIUM","description":"Group 1 generation rebuilt dist and refreshed mirrors, but render tests failed waiting for the shared machine tests lock (exit 75). The changed check returned 81 on repeated approved attempts for the same live holder. No lock bypass or process changes were made."}
+{"schema":3,"ts":1793880757500,"kind":"friction","key":"842-generation-registry-rework","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["842-ship-fails-local"],"category":"agent-rework","scope":"bkit-repo","severity":"LOW","description":"Group2 generation required canonical shared-template corrections and manual local instruction-registry maintenance after workflow edits; later broad gates exposed outdated compatibility fixtures and missing explicit push Route labels. Corrected source/fixtures and regenerated, preserving all planned tests; final changed gate passed."}
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index 1580435f5..ef56ce667 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -331,7 +331,7 @@ Clause section lines:
   - specialised: all except `bkit-audit-adoption`, `bkit-audit-analytics`, `bkit-audit-config`, `bkit-audit-security`, `bkit-audit-slop`
   - applies: `bkit-audit-agents`, `bkit-audit-dead-code`, `bkit-audit-deferrals`, `bkit-audit-models`
 - drift:
-  - `bkit-ship-conflict-resolve:107`: "Run `pnpm bkit:gate:install-static-unit-build`." Runs `pnpm bkit:gate:install-static-unit-build`, not the push gate the pre-push hook runs
+  - `bkit-ship-conflict-resolve:109`: "Run `pnpm bkit:gate:install-static-unit-build`." Runs `pnpm bkit:gate:install-static-unit-build`, not the push gate the pre-push hook runs
     - kept: subagents never push; they run their own lighter gate (`local-pre-commit`: `/bkit-*` steps run their own gates) and the pre-push hook runs the push gate
 
 ```text
@@ -1369,7 +1369,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-annotations`, `bkit-audit-ci-performance`
 - drift:
-  - `bkit-ship:583`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
+  - `bkit-ship:647`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
     - kept: Re-validate probes for an existing run first and dispatches only when the head has none, which happens when the head commit carries `[skip ci]` or GitHub started no run
 
 ```text
@@ -1668,7 +1668,7 @@ Clause section lines:
 - audit:
   - specialised: `bkit-audit-ci-performance`
 - drift:
-  - `bkit-ship:583`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
+  - `bkit-ship:647`: "probes for a run at it first, dispatches only when none" Dispatches CI by hand (gh workflow run via --dispatch-if-absent per `.bkit/workflows.md` § CI-Dispatch Gate (shared, single source)) when no run is found; `ci` says pushes auto-trigger CI, NEVER manually
     - kept: Re-validate probes for an existing run first and dispatches only when the head has none, which happens when the head commit carries `[skip ci]` or GitHub started no run
 
 ```text
@@ -6549,7 +6549,7 @@ skipped when `ISSUE_ID` empty)
 ### workflow-merge-base-mismatch
 
 - workflow: where-used
-- carriers: workflow `bkit-design`, `bkit-plan`, `bkit-ship`
+- carriers: workflow `bkit-design`, `bkit-plan`
 
 ```text
 mismatch → **Failure Path** with nothing merged
@@ -7120,7 +7120,7 @@ Kill-switch propagation checked
 ### workflow-gate-worktree-removed
 
 - workflow: where-used
-- carriers: workflow `bkit-design`, `bkit-plan`, `bkit-ship`
+- carriers: workflow `bkit-design`, `bkit-plan`
 
 ```text
 Worktree removed and feature branch deleted
@@ -10355,7 +10355,6 @@ Assumed items listed (`decisions pending`)
 Asked in the session, never headless
 Confirmations and rejections written (`decisions apply --by=owner`)
 Each unconfirmed item deferred (`decisions pending --defer`)
-Determine whether `origin/dev` is an ancestor of the PR head:
 **If** `BASE_PATH` = A → Step 5 (skip integration — dev has not moved; no `bkit:generate`, because CI fails on a stale generated file and Step 10 regenerates when that is the only failure).
 **If** `BASE_PATH` = B → Step 4 (integration required; its merge runs `bkit:generate`).
 Ancestor verdict determined
@@ -10371,10 +10370,7 @@ Finish (bookkeeping to `$BOOK_ROOT`):
 Path classified
 `origin/dev` merged locally (`branches sync --merge`), never rebased
 Merged branch pushed plain
-Fast-forward to the PR head, never onto a diverged branch:
 Check for the plan:
-[fit `workflow-summary-route` 0.62; keep: routes on PASS alone, not PASS or CONCERNS] **If** `verdict` = PASS → Step 6.
-Worktree fast-forwarded
 Write the FID's deferral lines to the artifact the docs agent reads `Pending Items` from:
 Wait for the subagent to complete. Then append the `SHIPPED` row to the worktree ledger, re-render the mechanical `roadmap-status` board from it, and finish the step (bookkeeping to `$BOOK_ROOT`). The block exits 1 when the row did not land:
 Write `ship-summary.md` from this run's status rows and the PR's size:
@@ -10399,10 +10395,7 @@ Then set `REVALIDATE_REASON` empty → Step 9 (re-validate at the regenerated he
 **Else** → **Failure Path** (`unchanged`: regenerating does not fix the failed steps; `undeclared`; or the block failed).
 **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = sub-step 1, which routes the red run again within the new allowance → **Merge Question**.
 [integration-merge] Merge with an empty body and `--match-head`, so GitHub refuses when the head moved. Re-read the labels from the tracker, so that ` bkit [auto route]` rides the squash subject on `bkit:auto`. The labels are never carried forward from Step 1's `{LABELS}`. `{LABEL_FLAGS}` = one `--label=<name>` per re-read `LABELS` entry, empty when no tracker is wired<!-- bkit:tracker true start --> or `ISSUE_ID` is empty<!-- bkit:tracker true end -->:
-**If** exit 0 **or** 7 → hold `verdict` as `MERGE_VERDICT`, `failures` as `MERGE_FAILURES`, and hold `state`.
 **If** `state` = MERGED → Step 13.
-**If** `state` != MERGED → run counter routing:
-**If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 11 → **Merge Question**.
 Merge gate asserted (`runs gate`)
 Failed arrivals counted against `ship.merge.maxAttempts` (`counters route`)
 Used-up merge step sent to the **Merge Question** in a session, or to the Failure Path
@@ -10430,10 +10423,37 @@ Fix committed and pushed
 Fast-forward local `dev` to `origin/dev`, then finish:
 Local `dev` synced (`branches sync-dev`)
 Assert that the capstone passed at the squash commit. The block records the squash-merge CI verdict (`ship-merge-ci`) before routing:
-Close the run. The block keeps the summary in the outbox (the close removes the worktree it lives in), lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, removes the worktree and `SHIP_BRANCH`, and returns to `REPO_ROOT`:
 **If** `CLOSE_VIA` = close-pr-open → drop `--ref`, and gate with `--file="{STATUS}"`.
 Squash-merge CI capstone green (`runs gate`)
 Close landed (`workflows close`)
+**If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 2 → Step 4 sub-step 2.
+**If** exit 80 **or** `runtimeGithubCli` = false → read open PRs first, then merged PRs through MCP, independently reread the selected PR, and write `{ ownerRepo, headRefName, baseRefName: "dev", pr }` to `{OUTBOX}/ship-entry-facts.json`. `pr` is the complete `PrInfo` shape (`number`, `url`, `state`, `baseRefName`, `headRefName`, `headRefOid`, `title`, `mergeCommit`, `mergeable`), or null when neither exists. Record the single transport transition under **gh MCP fallback**, then use the engine's result:
+Missing or mismatched facts → **Failure Path** before opening or merging anything. A merged PR with extra feature work returns exit 1: open a new PR, preserving that work.
+Reconcile again on every integration retry, then publish before selecting `BASE_PATH`:
+Hold `basePath` as `BASE_PATH`, `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD`. **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 3 → Step 4 sub-step 2. **If** another non-zero exit → **Failure Path**.
+Hold `featureCodeState` as `FEATURE_CODE_STATE`. Non-zero exit → **Failure Path**. Bookkeeping commits and proven automatic base-only merges retain coverage. New feature commits, imported feature merges and semantic conflict resolutions invalidate coverage. Unproven merge results remain in the state. Record this exact state with each successful sweep/docs completion below; read those rows from `{STATUS}` on resume.
+**If** `RECONCILE_NEXT` is held → return there and reconcile again. **Else** → refresh `ENTRY_HEAD` and `CODE_HEAD` with `git rev-parse HEAD` → Step 5, which recomputes coverage after the integration and any conflict resolution.
+Refresh `FEATURE_CODE_STATE` from `featureCodeState`; non-zero exit → **Failure Path**.
+Hold the current `featureCodeState` as `FEATURE_CODE_STATE`; non-zero exit → **Failure Path**.
+Read the latest successful `ship-feature-coverage` row for `step=ship-deferred-sweep` from `{STATUS}`. **If** its recorded feature-code state matches `FEATURE_CODE_STATE` and its artifact still exists → reuse it and skip to Step 6. **If** the state changed, differs or is missing → invoke the sweep again below. Never reuse a completion from a different feature state.
+**If** `verdict` = PASS → record the covered feature-code state → Step 6:
+Reconciled feature-code state compared with recorded sweep coverage
+Read the latest successful `ship-feature-coverage` row for `step=ship-update-docs` from `{STATUS}`. **If** its recorded feature-code state matches `FEATURE_CODE_STATE` and the docs artifact exists → reuse it and skip sub-steps 1–3. **If** the state changed, differs or is missing → run the docs agent again. Always refresh the summary in sub-step 4.
+**If** `RECONCILE_REQUIRED` = true → clear it → Step 3 before validation. A previous `DONE` row alone never proves coverage of imported feature code.
+**If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
+**If** exit 19 (stale base) → the gate already recorded one failed arrival; route to integration:
+**If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+**Else** → **Failure Path**, preserving the branch and worktree on exhaustion.
+**If** exit 0, 5, 7, 8, 9 **or** 10 → hold `route` as `MERGE_ROUTE`, `reason` as `MERGE_REASON`, `verdict` as `MERGE_VERDICT`, `failures` as `MERGE_FAILURES`, and hold `state` → sub-step 3. Missing output fields → **Failure Path**.
+**If** exit 80 **or** `runtimeGithubCli` = false → read fresh pre-attempt PR facts through `pull_request_read` (`get`). Refresh the scoped gate facts above with this PR, fresh CI and base evidence, and run that engine gate again before mutation. Only exit 0 authorizes `merge_pull_request`, with `sha` = the newly printed `GATE_HEAD`, the skip-token-free PR subject and an empty body. A gate refusal takes sub-step 1's route and consumes only its existing refusal row. After the attempt, independently reread post-attempt PR state through `pull_request_read`; never copy the mutation response or pre-attempt facts into `after`. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", matchHead, before, after }` to `{OUTBOX}/ship-merge-facts.json`, with complete `PrInfo` values for both reads and `matchHead` = `GATE_HEAD`. Missing or mismatched evidence → **Failure Path**. Record the single transport transition under **gh MCP fallback**, then classify without a second mutation:
+Hold the same route, reason, verdict, failures and state as the gh-backed result → sub-step 3.
+**If** `MERGE_ROUTE` = revalidate (exit 9) → Step 9 through the durable counter:
+**If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 9 → **Merge Question**.
+**If** `MERGE_ROUTE` = integrate (exit 10) → Step 3 through the same durable counter:
+**Else** → **Failure Path** on exhaustion.
+**Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Recoverable merge refusals never enter Steps 11–12. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
+Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is retained when conditional deletion cannot be guaranteed; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
+Guarded cleanup and retained paths/refs reported, back in the repo root
 ```
 
 ### Prompts
@@ -11344,7 +11364,6 @@ Remove the answered question from `Open Questions & Assumptions`.
 Confirm the merge state the caller left:
 Record the branch head with `git rev-parse HEAD`, and append a log entry naming it.
 Run `git rev-parse -q --verify MERGE_HEAD`.
-**If** it prints nothing → no merge of `origin/dev` is in progress, so there is no conflict here to resolve:
 Go straight to setting `Verdict`.
 Append a log entry.
 Run the auto-resolver before any hand-classification. It resolves every append-only ledger, the dependency lockfile, a generated register, the generated block of an embedding doc (a doc the register's script copies that block into) and the install record (`.bkit/version`), commits the merge once no conflicted path is left, runs a declared `bkit:generate`, and stops with the merge still in progress when a conflict needs judgement. `{STATUS}` is the `status.jsonl` path the Read list names:
@@ -11356,11 +11375,9 @@ Set `Verdict` = `FAIL` with `Edit`.
 Go straight to setting `Verdict`.
 Classify the conflicts:
 List the conflicted files with `git diff --name-only --diff-filter=U`.
-List each side's recent commits with `git log -5 --oneline HEAD` and `git log -5 --oneline origin/dev`, then append a log entry.
 Classify each conflicted file against these two lists, then append a log entry:
 `Allowed resolutions`:
 Non-overlapping additive edits to the same file → concatenate them, keeping both sides.
-Formatting-only drift (whitespace, trailing newline, prettier output) → take `origin/dev`'s format.
 A dependency manifest bump on one side only (`package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`) → take the bump.
 Additive JSON array entries or object property additions with no key or position overlap → concatenate them.
 `Refused resolutions`:
@@ -11380,7 +11397,6 @@ Run the auto-resolver again. With no conflicted path left it commits the merge a
 **If** `Verdict` != `FAIL` → run the verify gate:
 Run `pnpm bkit:gate:install-static-unit-build`.
 Append a log entry with its exit code.
-[honest-reporting] `PASS` = a merge of `origin/dev` was in progress, every conflicted file was resolved by the auto-resolver or classified `Allowed resolutions` and resolved, the merge is committed, and `pnpm bkit:gate:install-static-unit-build` exited 0.
 `FAIL` = no merge was in progress, **or** any conflicted file was classified `Refused resolutions`, **or** the auto-resolver aborted the merge, **or** any verify command exited non-zero.
 **If** `Verdict` = `FAIL`:
 **If** `git rev-parse -q --verify MERGE_HEAD` prints a SHA:
@@ -11389,6 +11405,12 @@ Run `git merge --abort`.
 Confirm that the working tree is clean with `git status --short`.
 Leave the sentinel in place.
 Append the log entry `ABORTED — clean tree restored`.
+Resolve the caller's engine-recorded `{MERGE_TARGET}` with `git rev-parse --verify "{MERGE_TARGET}^{commit}"` and compare it with `MERGE_HEAD`.
+**If** either value is unreadable or the values differ → set `Verdict` = `FAIL` with `Edit`, name the target mismatch in the log and go straight to setting `Verdict`.
+**If** it prints nothing → no merge of the recorded target is in progress, so there is no conflict here to resolve:
+List each side's recent commits with `git log -5 --oneline HEAD` and `git log -5 --oneline "{MERGE_TARGET}"`, then append a log entry.
+Formatting-only drift (whitespace, trailing newline, prettier output) → take the recorded target's format.
+[honest-reporting] `PASS` = a merge of the recorded target was in progress, every conflicted file was resolved by the auto-resolver or classified `Allowed resolutions` and resolved, the merge is committed, and `pnpm bkit:gate:install-static-unit-build` exited 0.
 ```
 
 #### bkit-ship-deferred-sweep
diff --git a/.bkit/prompts.md b/.bkit/prompts.md
index 039ad57be..ab78cf464 100644
--- a/.bkit/prompts.md
+++ b/.bkit/prompts.md
@@ -357,7 +357,7 @@ Cursor Cloud automation uses `composer-2.5` for metadata / API plumbing, and the
 <!-- prettier-ignore -->
 | Agent | Scope |
 | --- | --- |
-| `bkit-ship-conflict-resolve` | Mid-merge mechanical conflict resolver. Invoked from `/bkit-ship` Step 4 when `bkit branches sync --merge` exits 24: the merge of `origin/dev` is in progress with its ledgers, lockfile, generated register, embedding docs and install record already resolved, and the agent hand-resolves only the paths left conflicted, then re-runs the block, which commits the merge. Allowed: non-overlapping additive edits, formatting drift, dep-version supersedes, additive JSON entries. Refused: same-function edits, semantic overlaps, ambiguous intent — FAIL aborts the merge cleanly and routes to `bkit-debug-abort-handover`. Verifies via `bkit:gate:install-static-unit-build` before PASS. |
+| `bkit-ship-conflict-resolve` | Mid-merge mechanical conflict resolver. Invoked from `/bkit-ship` Step 4 when `bkit branches sync --merge --target={sha}` exits 24. The supplied target is the pinned merge target, which must equal `MERGE_HEAD`; it may be the reconciled feature tip or fetched `dev` tip. The engine has already resolved ledgers, the lockfile, generated register, embedding docs and install record. The agent resolves only the remaining paths and re-runs the same target, which commits the merge. Allowed: non-overlapping additive edits, formatting drift, dep-version supersedes, additive JSON entries. Refused: same-function edits, semantic overlaps, ambiguous intent — FAIL aborts the merge cleanly and routes to `bkit-debug-abort-handover`. Verifies via `bkit:gate:install-static-unit-build` before PASS. |
 | `bkit-ship-deferred-sweep` | Pre-merge completeness gate. Builds the intended-delivery set from plan `Acceptance Scenario` sections + `DONE WHEN` fields and asserts each against the codebase. No plan file → `ship-input-*.md` is the plan; intended-delivery set = its requested outcomes. An unmet / unplanned gap → FAIL → Failure Path (merge never happens) only on >=1 of four blocking tests, each asserted against source, never inferred from a plan sentence: behaviour (absent / stub / wrong result), safety (guard weakened, known-broken path ships), false green (`bkit branches scan-diff --disabled-tests` names candidates; every hit is adjudicated against the base diff and current source), consumer break (shipped surface fails at runtime). Removed assertions need precise evidence of enabled equivalent coverage or an owner-approved retirement that leaves no current requirement uncovered; record each disposition under `Test Coverage Review`. Scan errors, actual disabling markers and missing or inconclusive coverage stay blocking, never exempt or lazy. Lane results are not evidence — bkit lanes are event-scoped, some push-to-`dev` only, so a pre-merge sweep reading them re-creates the unsatisfiable refusal that made gate code 16 opt-in; the gate + capstone own green. A gap passing none is `Lazy`: stale prose / comment / name, doc drift, unwritten ledger row, formatting, future-enhancement `TODO`, `DONE WHEN` met in substance not literal wording. Branch is green by this step, so aborting on a record-keeping gap leaves the work unmerged and the record unwritten. Declared deferrals (out-of-scope / future-work / non-goals across design, plan, `docs/deferrals.jsonl`, summaries) form the exempt set — never block, resurfaced verbatim in the ship summary's `Deferred & Out-of-Scope (Resurfaced)` section. Exemption is earned, not self-granted: the prompt holds no reason test — `bkit ledgers triage --fid= --plan=` applies the deferral tests and writes every `unjustified` / `TRIAGED` row itself, printing each plan-related row's `key`, `bucket` and test result, and one that fails moves to that third track `Lazy (unjustified)`, resurfaced as follow-up, never blocking the merge (a bounded fix is cheaper than an aborted ship). Both `Lazy` sources share one append shape; every item carries its row before the verdict is set. The intended-delivery set is those two sources and nothing else — every precondition, build process step and merge condition a plan states is advisory, never a gate: plan `Gate N` checkboxes, `Verification Plan` boxes and `Manual Verification` steps are build-phase process, never deliverables, and no phrasing in a plan, log or phase summary makes one blocking (the gate reaches only what the repo can be made to prove; the plan template carries the matching authoring rule). Invoked from `/bkit-ship` Step 5 (after Conflict Resolve, before Merge). |
 | `bkit-ship-update-docs` | Cross-reference changed files against every doc in `docs.md`; update stale. `Pending Items` comes from the `ship-pending-items.md` deferral scan the workflow writes with `bkit context ledger-scan --terms={FID} --source=docs/deferrals.jsonl`; the agent writes no ledger row and reads no `docs/deferrals.jsonl` directly. |
 
diff --git a/.bkit/version b/.bkit/version
index 1774a1409..51e989bfe 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -3,7 +3,7 @@
   "canonicalHashes": {
     ".cursor/mcp.json": "355e01cadabed3b924ebe339dc07ecbf7179397ebc9accf8618d5d7d6af6c438",
     "docs/deployments.md": "f618c8d0f207e811d4b179f2827480751fadc2058f29712657b48055d94501b6",
-    "docs/testing.md": "c565fe832a59a265700b7de9bddd6c25697c98d598eb92ef44029955ac4dba1d",
+    "docs/testing.md": "81112b86a5cfe86054c3d54f0c6568dbaee00add149b2651cbc8690a7848ed19",
     ".claude/settings.json": "34cfc63ef7bfb248ce3f27116ad3f6f89fd75678c599d2cd8e702c43f6958587",
     ".agents/context.md": "5cf54b91ffaa5d9372415a24dd1acfe0910c7def1f4434e25ccf110e3eaed013",
     ".agents/docs.md": "bfbddbf98bc4238c6a01dbd68fbe515ba01db2371c440d868fe12a8db6c96df0",
@@ -14,7 +14,7 @@
     "docs/data-schema.md": "04a3b4453f53ee349c774c5bf28ef439d2488ed8ee17a0e0840f98911f530a2c",
     ".gitattributes": "33399602be95aaa41c6539ffea6dc408358af3b4358201a97938b434a945d35f",
     ".cursor/hooks.json": "cf9861764a08d8ad4a4892f4d097811f8f77838b16e27c140a544903a8d4bf05",
-    "docs/observability.md": "ab988ffbfa7d7c2298dc48b52ae50d2966874009580783feda910115704acb7f",
+    "docs/observability.md": "282237094c6c5eefb6ebf7c7b2e38d61d8f494f08245cd02b58afce55e55b57c",
     ".gitignore": "7b18419d0469def99a4a9c05f28e734f6258b2e60755c640a041a84b4d60275b",
     "docs/security.md": "ccf6c376c8a347972a335a43232f3d5db49acb9d0c9083f6c52c73de3013cb10",
     ".mcp.json": "65b29f1bb28dd6296d1dc8ea34aca4826d9ca072d7cef9d2971a7045280505d9",
@@ -28,7 +28,7 @@
     ".claude/commands/bkit-debug.md": "f823954f3304334ed8be9f42e24e2a47134ec45bbc278620d52a261dd9e60e16",
     ".claude/commands/bkit-design.md": "19a95a441ac6dba3b45982fb284817a7c908bf8a94b7f7a99e31ff46b1f7622a",
     ".claude/commands/bkit-plan.md": "0341314c76583e079ea635940d45c4da20ce4725d963d28aa4678adbff4eba6e",
-    ".claude/commands/bkit-ship.md": "8c4f9c0c2f5c08b5e61eea82bee4d4c3dd684ab7bda0124bfda1aa3a003e4f47",
+    ".claude/commands/bkit-ship.md": "bb7a8e50e9ede87544cfac75c555cb0e7301d147e516d44fe38378aa3523d78c",
     ".claude/agents/bkit-build-challenge-1.md": "1f0761c059842a1dcefff95f27fe3cc68e41155f03c8929d88ccc0c83461d290",
     ".claude/agents/bkit-build-challenge-2.md": "1ec51a399c91f576f95af0e0625983ded825282f0050540007a288c364777227",
     ".claude/agents/bkit-build-install-skills.md": "4da65c11fa042e5b578717c510dfaf3e8fe51466c04adc63cb16a8215913b817",
@@ -50,7 +50,7 @@
     ".claude/agents/bkit-plan-review-1.md": "1aabc9050ee1e6e61ccc91a72593651c7414dcc8636af29c308357368657a450",
     ".claude/agents/bkit-plan-review-2.md": "57ff895a2dc68deacd71d5ff39021e3c7de5c13cd510d87bcb9325fcdea2d10f",
     ".claude/agents/bkit-plan-update.md": "5b346e5936a76cf78b29caafa380107c2ebee906255c398668192e31b4bf1fe4",
-    ".claude/agents/bkit-ship-conflict-resolve.md": "f2ef825d7030231947c541a7f7e3c561afe3708ce9436d8585bb466911bf6b28",
+    ".claude/agents/bkit-ship-conflict-resolve.md": "70e7bb37c69772766e0f4a57e8f5d85aeb1e95bbe496f8e12979f93d9bd1749e",
     ".claude/agents/bkit-ship-deferred-sweep.md": "4eb74e02b7438e72818cd735b07af1f0a964dae7bfa42779ecd93d294e632b0a",
     ".claude/agents/bkit-ship-update-docs.md": "f10a697f8f4d98b22b220c4405d64c7f31d78d32384ef0a64102b6da6a67c9e9",
     ".claude/agents/bkit-utility-compress-markdown.md": "48aee178590ac282a2de281a33454833d3df07065d2e174a73373e1f74dd2be3",
@@ -60,7 +60,7 @@
     ".cursor/commands/bkit-debug.md": "5c9c0b07c266086fc0081f185931cf23199dc11598a53214ccaf55dcc11fc465",
     ".cursor/commands/bkit-design.md": "37c549d2480700d1560e84f75cf7303de22e4e1b3e4d344c011b980d3df04ef7",
     ".cursor/commands/bkit-plan.md": "a20499d7f63bd6927bbf8615b4363e0b52ab5328e3ec588399c9ee76ff45633b",
-    ".cursor/commands/bkit-ship.md": "8e2e9a15dc18ca273b3ca78c8ec52a1b0a6b3fd2df1dac6457f286fa74c847fc",
+    ".cursor/commands/bkit-ship.md": "3ab4feb9a5f686982d263356dfd2a272cadb401cc07f97a5f50198385e8f84da",
     ".cursor/agents/bkit-build-challenge-1.md": "38fb30e36724318e5e986f69ad598e5f5b4b087b084101e68d330d9353287ff2",
     ".cursor/agents/bkit-build-challenge-2.md": "de62e52353593d44629e9b32d824578e629815566c7e7cf81336d2ec396fbe69",
     ".cursor/agents/bkit-build-install-skills.md": "823ebd00f4d9e732796520677b2d2b5aa17fbd72dcbc9a92ff78bf141c44af95",
@@ -82,7 +82,7 @@
     ".cursor/agents/bkit-plan-review-1.md": "a7daed5f78dac1e9d3bce8f5b264380c3ca1ba30e9ad43390bece6edc33f3c26",
     ".cursor/agents/bkit-plan-review-2.md": "d802d238f6895adc5e8e850456936a3403c7f17a87eaaabd9ad0e72eacaecce0",
     ".cursor/agents/bkit-plan-update.md": "5c98dbf4c94b4e44746e6dacae5ef74872d484ec151e3d2f1203c9592a5825bb",
-    ".cursor/agents/bkit-ship-conflict-resolve.md": "b91a0960d061ecc7b7172358381928c6169731be546fcb869e97ab20c19e7ca6",
+    ".cursor/agents/bkit-ship-conflict-resolve.md": "b0605c4da2fd0420b1482cd9d3c955fa77130b35008409c12c509a8cfe051e35",
     ".cursor/agents/bkit-ship-deferred-sweep.md": "c365eaa6eb3cf2233707f8e1f9820c10a9a32e3b2ecbe647c21eaee5260f62d3",
     ".cursor/agents/bkit-ship-update-docs.md": "548fd12739db4f16092559dccd8035d40f8d03b7f0f1004996549b6ac284fe88",
     ".cursor/agents/bkit-utility-compress-markdown.md": "ba6102d4527422e8b0b6a3920bc2ec98918338e3c06fc7f310f5ef5bea734634",
@@ -108,7 +108,7 @@
     ".opencode/agents/bkit-plan-review-1.md": "e7b57391bd28c73c272fd0388d44138d70f837e98dc2677f6224344b0196cb68",
     ".opencode/agents/bkit-plan-review-2.md": "f8b53b3c52d740af95fd069034dd0b943795eb2a5318fa1f21f57ff6a5034b71",
     ".opencode/agents/bkit-plan-update.md": "7256f0611dd0af1cd9cba67d550fa4d6d6845ba25a2cfc9c7730b022adaba004",
-    ".opencode/agents/bkit-ship-conflict-resolve.md": "afcf5b68e41a78bca50db2bf89d5789070d3fd8849ae9ead377dad48420610b4",
+    ".opencode/agents/bkit-ship-conflict-resolve.md": "628a99550804d4e94f47d8912790a0215e2d07e58e5439aaa695001e0129387e",
     ".opencode/agents/bkit-ship-deferred-sweep.md": "bbfb1b8cb1c1ed05476bf4dddbd3a17ec362ff5c66661b8f616f7ffef866459c",
     ".opencode/agents/bkit-ship-update-docs.md": "ca9cd4fd12e76d787b7ad00717fb91732e183cff35d8fc7ea9b97ce084c0d09e",
     ".opencode/agents/bkit-utility-compress-markdown.md": "6eeac027ab801c0ad404351a6b1ee043a45442c0cf268f444a028071a8bafd7a",
@@ -118,7 +118,7 @@
     ".opencode/commands/bkit-debug.md": "fd6fb51723987c3207200d2dd3c80bd2baedca303321ca1d1afbd32b591cc30d",
     ".opencode/commands/bkit-design.md": "dc44ed4aa15a92ec39321cb6771447e6e33665dbb8bced3f74c5bde487d8ddec",
     ".opencode/commands/bkit-plan.md": "5ef51aac5d84bc5fbdde4a2809186cada12ef9e0ed902ce50c21d4e93aebf380",
-    ".opencode/commands/bkit-ship.md": "25dd5c4829173dc82f91eec485d690e0ea94f7861269aed859956dc519c7aa24",
+    ".opencode/commands/bkit-ship.md": "99873baf3abf8f122b49f3252efad6a9b31bfe712f18f45a0fb529d9ad2cd4ad",
     ".claude/agents/bkit-design-spike.md": "6ebe2fa4b367cf183bf1fe766e95afff9ebcbfd5b25f86bd3e74af7c43833861",
     ".cursor/agents/bkit-design-spike.md": "996a40f60dde3f1c3cc8ce47cdf13e1bf3524aadc73b29ae7bdfb12cd120b7b2",
     ".opencode/agents/bkit-design-spike.md": "1b809bb8969f4b9e667c353acc28c673af0163486770aa9054027af638fb173d",
@@ -150,7 +150,7 @@
     ".codex/agents/bkit-plan-review-1.toml": "c8f5226bec2b269114a3c0cc6b4cdc32d8a7b96afb04abcf6241c408bbab461c",
     ".codex/agents/bkit-plan-review-2.toml": "3abe82879f58c2f347b523d9d6b670a9336c70e26dc1cef37890aeaa1efddc46",
     ".codex/agents/bkit-plan-update.toml": "e3ec4298bca1fe039e7056d326f34a9b349f830139ea0448a6d32a3744642fde",
-    ".codex/agents/bkit-ship-conflict-resolve.toml": "b5e3e9639783480fea0aada2f2a564867ddbe7b928e9d17b2440abdb71603f37",
+    ".codex/agents/bkit-ship-conflict-resolve.toml": "935c68fe8b68ea0a208b00edf03d69361aa4f9f09476e8717931879cf6795bee",
     ".codex/agents/bkit-ship-deferred-sweep.toml": "00ee52c43f7e07e190659fc9626d7611fd986bca1489cc973fa65befdbe724d8",
     ".codex/agents/bkit-ship-update-docs.toml": "e12624a03a32dd08116da17f468517cace60465ecdf8637ccf71e1d513945ab3",
     ".codex/agents/bkit-utility-compress-markdown.toml": "71078f4ca0b7522426f8618cbbe80e3d778f5355221f972ac3b04b31353cedcd",
@@ -222,9 +222,9 @@
     ".bkit/install.md": "9c2d2f6cffce3f72388e0bf12ba1a652cc92a61a7631bbfeb9986e56af09e6b3",
     ".bkit/jsonl.md": "1c0d5597648167929c2098fa0176ac2daa5eaca7b198bd040f2fa79b1b5b40ab",
     ".bkit/providers.md": "556318e0b5573604d0d56acfa315af47ea45c26a71e2e59600514d2cb3c431fc",
-    ".bkit/prompts.md": "5c584b31cb1349e80e073b44ee9ab497fbc316ed75ffbca4a58dac787e34b49b",
+    ".bkit/prompts.md": "3151fa666e4cbfb6f0634c3a162d4d363cdecceffd61584371ba80f2c477095e",
     ".bkit/trackers.md": "9db8826f990a21a46a8f70a2022d5a2e0e21c64fc50b3b5aecf84d146b6e094a",
-    ".bkit/workflows.md": "e89af18e6bbdf5dcc79b371e945315db29d85d8f2f802e8e716e0cb24ebc99b1",
+    ".bkit/workflows.md": "536446223c2feac409d0f397ad3b953c2bb6b28ee6d610dbe81f9d280da29fec",
     ".bkit/README.md": "30c3136159e0a5e8a1fa49c88de861147db7c63914fd319c52e1e7ea87437b25",
     ".cursor/rules/bkit-rules.mdc": "0c15e475a322bd66f4f2258b5ffc2a6700bb9c9d217a75fa18d8168c9e1106e8",
     ".claude/hooks/bkit-gateguard.cjs": "804315c40da562f88628d751ca75bdc27707f295a9346fed1c0db7d4ddb56d84",
@@ -264,7 +264,7 @@
     ".codex/hooks/bkit-rules.cjs": "8aee2cde5448c083ae0dc07a4f1db86ce7e815a2a2eafe54b886b7f4393cab91",
     ".opencode/plugin/bkit-rules.js": "417d3ca107ebf005060953a17340620e1fcfb5bcdf491316a937e0c747b0377e",
     ".bkit/router.md": "c20d006757e350c173da94686d48500bc83e12d9f7bb6ff5911e47e332e45eab",
-    ".bkit/cli.md": "fb607fac271507a0ccdc436188f2dfae8f24aa623872892b8ea544bea437079c",
+    ".bkit/cli.md": "db3789f5093947588dc048de5113aee7fcd3925a6563ba98a99f0aeede011a79",
     ".claude/agents/bkit-build-plan-tests.md": "f7b4e6be48b6950d27256c42d5d2c48b20bd23b90d66b0d1f59745a33ad251b5",
     ".cursor/agents/bkit-build-plan-tests.md": "57996d02186862b35c6e22dd150e0b1d19a243f10fddb16002feefd7d42c7838",
     ".opencode/agents/bkit-build-plan-tests.md": "896af5e894b0ae4c9911cc5ee3f54e5426efdf2e4f8ec5c758ed990b82fac6d4",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index b4d022c8e..7e1134565 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -109,7 +109,7 @@ Rendering can be re-run: the source carries every wired variant, so a tracker sw
 - **Ship Step 6 fold runs after the two subagents and stages nothing itself:** the same fence runs `bkit roadmap feature --root="$WT" --step=ship-update-docs` (`$WT` = `{WORKTREE_PATH}`), which appends the `SHIPPED` row and folds. Both paths ride the PR in Step 8's `--scope=pr` commit (§ `/bkit-ship` — Docs and bookkeeping ride the PR). `DOCS_VERDICT` requires the command to report the row appended with `status` = `SHIPPED`. A `BUILT` row from the build close must not turn it green.
 - **Phase closes are mechanical-tier only:** a ship close writes its own feature's ledger row and re-renders the `roadmap-status` board. It runs no analysis, because analysis is a review a human invokes, never a cost paid on every ship.
 - **Ship re-validate probes before dispatching:** the head move already fires `pull_request` at that SHA. `bkit-ci.yml` keys `pull_request` concurrency by PR number and `workflow_dispatch` by ref. These are separate groups, so a duplicate is never cancelled and burns a full run. `bkit runs wait --head=<VALIDATED_HEAD> --until=present --dispatch-if-absent` probes for a run at that SHA (6 polls) and dispatches only when there is no run. The probe is never a pass condition. It uses `--head`, not `--pr`: a PR target reads the PR head's `statusCheckRollup`, and the PR head (ship's `[skip ci]` bookkeeping commit) never gets a run. Run targets are anchored to the head, because the newest run on the branch can be a COMPLETED run from a superseded head.
-- **Gate refusal re-enters the poll, not the sweep:** codes 10 / 11 / 14 / 17 are CI state, which the sweep cannot change. The sweep's verdict is a function of branch content, and it is a high-effort leaf. If head movement were the only trigger, code 10 would have no path to dispatch and would refuse forever. Re-entry carries `REVALIDATE_REASON=gate-refusal` and only probes and polls. It is bounded by `ship.merge.maxAttempts`, which counts `ship-gate-refusal` rows plus `ship-merge-pr` rows (`counters route --of=ship-merge-pr:count --rows=ship-gate-refusal:count`). A refusal writes no `step-done` row, so its audit row is what counts it.
+- **Ship retries reuse only matching feature coverage:** gate codes 10 / 11 / 14 / 17 return to CI validation, and fresh-base code 19 returns to reconciliation and integration. Merge refusals use `route=revalidate` when the head moved and `route=integrate` for a conflict with dev. Each gate refusal or attempted merge consumes one arrival in `ship.merge.maxAttempts`. `branches sync --feature-state` recomputes coverage before each sweep/docs reuse decision. Imported feature merges and semantic conflict resolutions invalidate coverage; bookkeeping and proven automatic dev-only merges retain it.
 - **Build close-workflow push does not trigger CI:** there is no PR yet. `bkit prs open` on the pushed HEAD is the single CI trigger.
 - **Design / plan close on HARD STOP:** a human must review before the next phase.
 - **No archive step in ship:** artifacts sit at the canonical `docs/plans/{YYYYMM}/` from the start of design, so there is nothing to move at close.
@@ -1066,21 +1066,21 @@ The following table describes the local discovery route and shared step mechanic
 
 ### `/bkit-ship` — 14 steps
 
-**Goal:** verify the PR, land docs and bookkeeping on it, merge to `dev`, and clean up the worktree. Staging is path-scoped via `bkit ledgers commit` (frozen allow-list). `BOOK_ROOT` = `{WORKTREE_PATH}` resolves the single tree every status write targets. `{OUTBOX}` (`.bkit/cli.md`) survives the Step 14 worktree removal.
+**Goal:** reconcile the local and remote feature branches, verify the resulting PR, land docs and bookkeeping on it, merge to `dev`, and remove only landed work. Staging is path-scoped via `bkit ledgers commit` (frozen allow-list). `BOOK_ROOT` = `{WORKTREE_PATH}` resolves the single tree every status write targets. `{OUTBOX}` (`.bkit/cli.md`) survives guarded cleanup.
 
 **Summary is displayed verbatim before the Failure Path.** A FAIL summary's `Recommended Next Step` is the only handoff that reaches a human on that route, because the Close Workflow step's final return is unreachable once the run enters the Failure Path. All five phase workflows carry it.
 
 **One `git push` per standalone push step.** The permission layer reads the whole command string, so an unexecuted `--force-with-lease` arm in a `case`/`||` chain makes a plain push read as a force-push and the call is refused. Carried in the `Git:` caution bullet of all five phase workflows.
 
-**`ship-merged-on-entry` marks the resume route.** Sub-step 8 is skipped when the PR is already MERGED, so without the row an auditor cannot separate that route from a run that dropped `ship-worktree-setup` / `ship-regression-guard` rows. The route goes to Step 13: Steps 3-12 ride or merge the PR, and a merged PR carries nothing more. On a resume after a crash past the merge, the docs are already on `dev`. When the PR was merged by hand before ship, there is no docs sync and no summary.
+**`ship-merged-on-entry` requires current feature evidence.** `prs probe --ship-entry` checks local and freshly fetched remote feature work against dev before accepting a merged PR. Extra work returns the no-PR route so ship opens a new PR. Unreadable evidence refuses the shortcut. Only a branch with no remaining feature work records the marker and goes to Step 13; that route runs no docs sync and may have no summary.
 
 **Gate asserts carry `--branch`.** The gate's head-keyed run query is filtered server-side, so a moved head returns an empty list whether CI never ran or ran at a superseded SHA; only a second, branch-scoped query separates exit 14 from exit 10. Ship passes `--file={STATUS}` so an override audit row lands in the run's own `BOOK_ROOT` log. When the file is absent or unwritable, the row goes to stderr, so it is never invisible.
 
 **Docs and bookkeeping ride the PR (Steps 5-8):**
 
 - Sweep → docs sync + summary → skill prune → one `--scope=pr` `[skip ci]` commit → plain push to `{SHIP_BRANCH}`; all in the feature worktree, before the merge. The merge carries docs, logs, ledgers, the `SHIPPED` row (`$WT/.bkit/issues.jsonl`) and skill removals to `dev`.
-- Pre-merge, every ship write has a publish channel on every runtime: post-merge, a cloud runtime cannot push `dev`, and the merge's `--delete-branch` removes the only branch it can.
-- Pre-merge pushes to `{SHIP_BRANCH}` happen only in these steps, none forced: opening a missing PR (Step 2), the Path B merge push (Step 4), Commit + Push Bookkeeping (Step 8), the regenerate round (Step 10) and a Failure Remediate fix (Step 12) (`.bkit/core/engine/audits/workflows/ship-invariants.test.ts`).
+- Pre-merge, every ship write has a publish channel on every runtime. The merge leaves branch deletion to guarded close, so newer feature work remains available after the PR lands.
+- Pre-merge pushes to `{SHIP_BRANCH}` happen only in these steps, none forced: feature reconciliation and a missing PR (Step 2), reconciliation before base classification (Step 3), integration (Step 4), Commit + Push Bookkeeping (Step 8), regeneration (Step 10) and Failure Remediate (Step 12). Reconciled unpublished work has a CI-running head before the bookkeeping commit.
 - A Summary FAIL stops the merge. `@bkit-ship-update-docs` reads `git log origin/dev..HEAD` against the unmerged branch, so it sees the shipped commits. `ship-deferred-sweep.md` rides the same commit.
 
 **Validated-head carry-forward (Step 9 + gate `--validated`):**
@@ -1089,7 +1089,9 @@ The following table describes the local discovery route and shared step mechanic
 - The `--scope=pr` allow-list is the frozen list, top-level `docs/*.md` and the globs in the repo's `bkit.testing.ciSkipPaths`. A repo lists in `ciSkipPaths` the project docs it keeps outside `docs/`, such as a `CHANGELOG.md`. The globs work as in `bkit.testing.minPushPaths` (`.bkit/templates.md` § Git hooks — Husky), and install seeds `[]`. The engine names no such file itself, and a glob that matches nothing selects nothing.
 - This is the one definition of ship's bookkeeping. Ship's Step 8 commit, `bkit ledgers only-bookkeeping`, the merge gate's carry-forward, `bkit ci min-push` and the pre-push hook's `bkit ci bookkeeping-push` all read it, so ship's `[skip ci]` bookkeeping push reaches the open PR.
 - CI is awaited only when `VALIDATED_HEAD` != `ENTRY_HEAD`, or on gate-refusal re-entry, so a PR that arrives green costs zero extra runs. Path B pays one run: the Step 4 merge of `origin/dev` moves the head, and Step 9 dispatches CI at the merged head, so a clash between the branch and newer `dev` commits surfaces as a red PR before the merge, not as a red `dev` push run after it.
-- GitHub's `mergeable` can be wrong on large diffs, and it ignores `merge=union`, so ship never reads it: Step 4 merges locally, and a merge GitHub still refuses goes through Steps 11-12 like any refused merge.
+- Step 4 integrates dev locally because GitHub ignores `merge=union`. After an attempted merge, `prs merge --ship-retry` independently rereads the PR: moved head returns to validation, a new conflict returns to integration, and other refusals stop with a reason. These refusals do not enter CI diagnosis or remediation.
+- `runs gate --fresh-base` reads fresh dev evidence and requires dev to be an ancestor of the validated code head, before accepting a CI override or bookkeeping carry-forward. Stale dev exits 19 and returns to integration within the merge allowance; missing or mismatched evidence exits 20. Scoped MCP fact files go through the same engine decisions.
+- The freshness check and GitHub's merge request are separate API operations. The request pins the feature head but cannot atomically pin the base. Dev may move in that interval; the post-merge squash capstone remains the detection boundary for that residual race.
 - `bkit runs gate --head=<PR head> --validated=<VALIDATED_HEAD> --month= --fid=` re-checks the relation itself (non-bookkeeping change or non-ancestor → code 17), then runs every check at the validated SHA. `--match-head-commit <PR head>` still pins what merges.
 - The bookkeeping commit merges untested. `lint-staged` formats it at commit, and post-merge `dev` CI (`ship-merge-ci` row) is the backstop.
 - When `dev` requires status checks (classic protection or ruleset), GitHub refuses a head with no run, so Step 9 probes both and validates at the PR head.
@@ -1098,7 +1100,8 @@ The following table describes the local discovery route and shared step mechanic
 
 - The `ship-merge-ci` row (verdict + reason) is written before a red result routes to **Failure Path**. A red merge is recorded, never inferred from a missing close row.
 - Close commit built in a throwaway `.worktrees/_land-{FID}` off `origin/dev` (book's logs copied, ledgers via `bkit ledgers union`) → push `dev`; `dev` moved → rebuilt, pushed again; refused → `ship-close/{FID}` PR, squash subject `[skip ci]`; a PR GitHub refuses to merge stays open for a human, worktree kept.
-- The feature worktree and `{SHIP_BRANCH}` are removed only once the close is on `dev`, because the book lives there until then.
+- Cleanup runs only after the close record reaches `dev`. The shared landed comparison checks file content, mode and type, and cleanup separately proves index and working-tree state. Dirty, unlanded, changed or unreadable evidence preserves the worktree/ref and reports the reason; a local ref deletion is bound to the inspected tip.
+- The remote feature ref is retained when conditional deletion cannot be guaranteed under the no-force-push policy. This does not block close-record landing or lock release. GitHub's repository-managed automatic branch deletion is a separate setting outside this guarantee.
 - `bkit ledgers union` never carries `.bkit/issues.jsonl`: the `SHIPPED` row is pre-merge, so unioning it into `dev` after a pre-merge failure would mark an unmerged feature shipped.
 
 **Tier-1 carrier:** `bkit runs gate` + `bkit ledgers` + the `TIMEOUTS` table (`commands/workflow/runs.test.ts`, `commands/workflow/ledgers.test.ts`, `.bkit/core/engine/shared/timeouts.test.ts`). **Tier-2 carrier:** `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` (no `git add -A`, `bkit ledgers` staging, `BOOK_ROOT` status writes, `--match-head-commit`, canonical 14 step keys, pre-merge pushes confined to Step 2 PR open + Step 4 merge push + Commit + Push Bookkeeping, none forced, no hand-written `dev` checkout or push, `.deferred-blocked` writer under `BOOK_ROOT`). **Tier-3 carrier:** detector corpus.
@@ -1107,20 +1110,20 @@ The following table describes the local discovery route and shared step mechanic

<!-- prettier-ignore -->
 | Step | Subagent(s) | Notes |
 | --- | --- | --- |
 | 1 — Start Workflow | — | Resolve `FID` (issue recovery as in design Step 1; issue-less: tracker reads, labels and comments skipped); `bkit runtime detect` → `RUNTIME_WORKTREES`; `bkit locks acquire` (main checkout; missing month bucket → current UTC month); straight after the lock, before any tracker write, `bkit worktrees setup --workflow=ship [--branch=] [--issue=]` resolves `SHIP_BRANCH` (see Branch eligibility), creates / resumes (no rebase) / adopts, writes the `.worktree-owned` marker to the outbox only for a worktree it created, and prints `branchWarning`; in the worktree `bkit status path` → `BOOK_ROOT`, `bkit workflows start --branch={SHIP_BRANCH}` refuses a checkout on another branch (exit 15, before any row), clears the stale `.deferred-blocked` / `.rebase-failed` sentinels and opens the run (its log lives in the worktree), `bkit runtime row` — so every later failure has a book to keep its record in; create `{OUTBOX}`; preflight `actions: write` once; set label `Ship`, `In Progress`. no commits on `dev`. |
-| 2 — Verify PR (Worktree Setup + Regression Guard) | — | `ship-input-{RUN}.md` in the worktree (includes the plan when there is one). `bkit prs probe --head={SHIP_BRANCH} --state=all` → `PR_NUMBER`, `ENTRY_HEAD`. No PR → `bkit branches push --mode=plain --set-upstream --ahead-of=origin/dev` (feature branch only, never forced; nothing ahead or on `dev` / `main` → exit 21 `Nothing to ship` → Failure Path), `bkit prs open --file={STATUS} --workflow=ship` into `dev` (an `engine-action` row makes a re-run reuse the PR, never open a second; `workflow-meta` `openedPr:true`), wait for its CI, `bkit prs checks` (not green → Failure Path). Already MERGED → `ship-merged-on-entry` → Step 13. Regression guard: `bkit runs wait --pr= --until=present` (no CI run for PR HEAD → FAIL), then `--until=completed`. |
+| 2 — Verify PR (Worktree Setup + Regression Guard) | — | Reconcile through `branches sync --reconcile-feature` before PR lookup, then plain-push the reconciled CI-running head. Setup and each reconciliation candidate refuse inherited unpublished dev commits. `prs probe --ship-entry` qualifies open/merged PRs against fresh feature evidence; no PR or extra work beyond a merged PR opens a new PR into dev. Scoped MCP facts pass through the same engine classifier. Record `ENTRY_HEAD`, then check the PR's CI. A safely qualified merged PR records `ship-merged-on-entry` and goes to Step 13. |
 | Confirm Assumed Items | — | `bkit decisions pending` lists the build's `Decision: Accept (assumed)` items nobody confirmed. In a session (never headless; `ship.merge.ask` does not apply) the orchestrator asks `Confirm` / `Reject` per item; `bkit decisions apply --by=owner` writes the answer (confirm → the real acceptance, a `docs/decisions.jsonl` row). Then `pending --defer` writes one `needs-decision` deferral per item still unconfirmed, and ship carries on and merges; `bkit workflows summary` adds a `## Ship Completed with Assumed Items` heading listing them. |
-| 3 — Base Check | — | `bkit branches sync --head=<ENTRY_HEAD>` → `basePath`: A (`origin/dev` is an ancestor) → Step 5; B → Step 4. Path A runs no `bkit:generate` and pushes nothing: CI fails on a stale generated file (`CI_GENERATED_FLOOR` plus `bkit.testing.ciGenerated`), and Step 10's regenerate round runs only when every failed CI step is one of those. |
-| 4 — Integrate (Path B only) | `@bkit-ship-conflict-resolve` (exit 24 only) | `bkit branches sync --merge --fid= --file={STATUS} --sentinel=` merges `origin/dev` into `SHIP_BRANCH` locally: it commits the run's uncommitted work first (`chore({FID}): carry uncommitted work before merging dev`), merges (`chore({FID}): merge dev`), unions the append-only ledgers, takes a conflicted lockfile from `dev` and regenerates it, takes a conflicted generated register from `dev` with the branch's edit to its hand-written region, takes a conflicted embedding doc's generated block from `dev` and merges the rest of that doc, merges a conflicted install record entry by entry with `dev`'s value where both sides changed an entry, then rebuilds the register and commits it, runs a declared `bkit:generate` and commits its output, and records an `engine-action` `merge` row. `outcome` merged → `bkit branches push --mode=plain` → Step 5; `current` (`dev` has not moved since Step 3) → Step 5; exit 24 (`pending`: conflicts outside the ledgers, lockfile, generated register, embedding docs and install record, merge left in progress) → `@bkit-ship-conflict-resolve` resolves them by hand and re-runs the block, which commits the merge: PASS → plain push → Step 5, FAIL → `git merge --abort` → Failure Path; any other exit → the block aborted the merge and wrote `.rebase-failed` → Failure Path. GitHub's `mergeable` is never read, because it ignores `merge=union`. |
-| 5 — Deferred Sweep | `@bkit-ship-deferred-sweep` | `bkit branches fast-forward --onto=origin/{SHIP_BRANCH}` (fetch failed → exit 10, diverged → exit 22; both → Failure Path). No `{FID}-plan.md` → warning: every build writes one, so the branch was not built by `/bkit-build`. Two engine verbs settle the sweep's mechanical facts: `bkit branches scan-diff --disabled-tests --base=origin/dev` (exit 1 → its `disabled` list holds each hit's `file:line` and test name → `Blocking Deferrals` → FAIL) and `bkit ledgers triage --fid= --plan=` (applies the deferral tests, writes each `unjustified` / `TRIAGED` row, prints each row's `key`, `bucket` and test result). `@bkit-ship-deferred-sweep`: PASS → Step 6; FAIL touches `$BOOK_ROOT/.../logs/{FID}/.deferred-blocked` → Failure Path (merge never happens). First pass only — gate-refusal re-entry lands at Step 9. |
-| 6 — Update Docs & Summary | `@bkit-ship-update-docs`, then `bkit workflows summary --pr={PR_NUMBER}` | `bkit context ledger-scan --terms={FID} --source=docs/deferrals.jsonl --artifact={OUTBOX}/ship-pending-items.md` writes the deferral scan the docs agent fills `Pending Items` from — the agent reads that artifact, never `docs/deferrals.jsonl`, and writes no ledger row. `update-docs` runs in `{WORKTREE_PATH}`, writes `ship-update-docs.md` + edits cataloged docs. Then `bkit roadmap feature --root=$WT` appends the `SHIPPED` row and folds the board — `DOCS_VERDICT` requires it appended with `status` = `SHIPPED`. The summary writes `ship-summary.md` with the PR's size from `gh pr view` (line dropped when `gh` fails). Summary FAIL → Failure Path before any merge. |
+| 3 — Base Check | — | Reconcile and plain-push again on every integration retry before selecting `basePath`: A → Step 5; B → Step 4. `branches sync --feature-state` computes merge-aware coverage, excluding proven automatic dev-only merges and bookkeeping. New local or imported feature work invalidates prior sweep/docs coverage. A pending feature merge passes the engine's actual target to Step 4 and returns here after resolution. |
+| 4 — Integrate (Path B only) | `@bkit-ship-conflict-resolve` (exit 24 only) | `branches sync --merge --target=<pinned target>` integrates dev locally, or continues the recorded feature merge. Existing mechanical settlement handles ledgers, lockfile, generated register, embedding docs and install record, then generation. Unresolved semantic paths remain in progress for the resolver, which verifies `MERGE_HEAD` equals the caller's target. Success plain-pushes, then returns to the recorded reconciliation step or Step 5. Other failures preserve/report the existing failure evidence. |
+| 5 — Deferred Sweep | `@bkit-ship-deferred-sweep` | Recompute feature coverage after integration, then compare the recorded successful `ship-feature-coverage` state and artifact before reuse; changed or missing state reruns the sweep. The sweep uses `branches scan-diff --disabled-tests` and `ledgers triage` for mechanical facts. PASS records the covered state; FAIL writes `.deferred-blocked` and stops before merge. Missing plans are warned and the ship input supplies intended outcomes. |
+| 6 — Update Docs & Summary | `@bkit-ship-update-docs`, then `bkit workflows summary --pr={PR_NUMBER}` | Recompute coverage and reuse docs work only with matching recorded feature coverage and an existing artifact; otherwise rerun the docs agent. `context ledger-scan` supplies its pending-item artifact. `roadmap feature` appends `SHIPPED` and folds the board before recording successful docs coverage. Refresh the summary on every pass; a FAIL summary stops the merge. |
 | 7 — Prune Skills | — | `bkit skills prune` in the worktree: uninstalls every non-`bkit-*` skill `.agents/skills.md` does not list (whole-name match). Warns and carries on: a missing registry skips the prune, a failed uninstall is listed in `failed`. Reconciles the union of on-disk `.agents/skills/` directories and `skills-lock.json` keys — a disk-only scan strands lock entries whose directory was removed out-of-band. |
 | 8 — Commit + Push Bookkeeping | — | Record `CODE_HEAD`; `ship-bookkeeping-push` row first; one `bkit ledgers commit --scope=pr` commit `docs({FID}): ship bookkeeping bkit [skip ci]` (docs, FID logs, ledgers, skill removals; refuses on `dev`, `main` or a detached HEAD, exit 12); `bkit branches push --mode=plain` to `{SHIP_BRANCH}` only when `outcome` = committed — an unconditional push would start a CI run on every ship. |
 | 9 — Re-validate | — | Resolve `VALIDATED_HEAD` (carry-forward above). Wait only when `VALIDATED_HEAD` != `ENTRY_HEAD` **or** `REVALIDATE_REASON` = `gate-refusal`: `bkit runs wait --head=<VALIDATED_HEAD> --until=present --dispatch-if-absent` (6 polls; `gh workflow run {bkit.testing.ciWorkflow}` only on no-run, then `VALIDATED_HEAD` = PR head) → `ship-revalidate-dispatch` row → head-anchored `--until=completed` (`SHIP_CI_WAIT_TIMEOUT_S`; budget exhausted → `ship-revalidate-timeout` row → Failure Path) → Step 10. |
-| 10 — Merge Gate + Merge PR | — | `bkit runs gate --pr= --validated=<VALIDATED_HEAD> --branch= --fetch --file= --snapshot={OUTBOX}/pre-merge-snapshot.jsonl --record={STATUS}` — the only merge precondition: the snapshot (PR head, `VALIDATED_HEAD`, dev SHA, ancestor, capstone run, mergeable) is written before it decides, a skip token in the PR title refuses (18), a refusal is recorded as `ship-gate-refusal`. `bkit prs merge --match-head=<gate mergeHead> --delete-branch {LABEL_FLAGS} --expect-merged` (empty body). `state` = MERGED → Step 13. `prs merge` refuses a non-`dev` base (exit 8, nothing merged → Failure Path); the exit 80 MCP route asserts `base.ref` = `dev` before `merge_pull_request`. `ISSUE_ID` empty → no label re-read, `{LABEL_FLAGS}` empty. Non-zero gate: 10/11/14/17 → bounded Step 9 (poll only; `bkit counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --point=ship.merge` counts failed merges plus gate refusals); 12 with `regenerable` = true → the regenerate round (below); else Failure Path. **Regenerate round:** on exit 12 the gate reads the run's jobs and prints `failedSteps`, each failed step outside the capstone as `{job}/{step}` (`{job}/` for a job that failed with no failed step), and `regenerable` = true when every one is on `CI_GENERATED_FLOOR` (`bkit-tests-static/Check Capability Register`, `bkit-tests-static/Run bkit Check`) plus `bkit.testing.ciGenerated`. The engine decides, never a model: one failed step off the list makes the whole result a Failure Path, because fixing half of it still leaves CI red. The round takes the same `ship.merge` count without asking → `bkit branches regenerate --attempt={MERGE_ROUNDS}` commits only what `bkit:generate` changed as `fix({FID}): regenerate attempt {N}` → `CODE_HEAD` = its `head` → plain push → Step 9 re-validates at that head. `unchanged` (regenerating fixes none of the failed steps), `undeclared` or a failing `bkit:generate` → Failure Path. CI's re-run is the only re-check: a local one would need a local command per list entry. Non-merged: `bkit counters route --point=ship.merge` (failed merges plus gate refusals) → Step 11, asked before the Step 12 fix round when `ship.merge.ask`, or Failure Path. |
+| 10 — Merge Gate + Merge PR | — | `runs gate --pr= --validated= --fresh-base` writes the snapshot before deciding and records each refusal once. Code 19 returns to Step 3; 10/11/14/17 return to Step 9; unavailable evidence or a title skip token stops. `prs merge --ship-retry --match-head=<gate mergeHead> --expect-merged` uses an empty body and leaves deletion to guarded close. Independent rereads return merged → Step 13, moved head (9) → validation, new conflict (10) → integration, or another explicit reason → terminal stop. The same durable allowance counts gate refusals and merge attempts. MCP fallback validates scoped pre/post facts through the engine before taking these routes. Red CI runs regenerate only when every failed step is on `CI_GENERATED_FLOOR` or `bkit.testing.ciGenerated`; committed regeneration plain-pushes and revalidates, while unchanged/undeclared/failed regeneration stops. |
 | 11 — Failure Diagnose | `@bkit-debug-failure-diagnose` (only if not merged) | Writes `ship-failure-diagnose-{MERGE_ATTEMPT}.md`. |
 | 12 — Failure Remediate | `@bkit-debug-failure-remediate` (only if not merged) | Writes `ship-failure-remediate-{MERGE_ATTEMPT}-log.md`. `Strategy` ladder (`STANDARD → PIVOT → FINAL`). PASS → `bkit ledgers commit --scope=full --stage-tracked-updates` commits the fix as `fix({FID}): failure-remediate attempt {MERGE_ATTEMPT}` (no skip token, so CI runs), `bkit branches push --mode=plain` pushes it unforced (ship never forces), → Step 9, which re-validates CI at the new head, then Step 10 re-merges. Resumed after the remediate row (`after` = `ship-failure-remediate`) → sub-step 4 with `verdict` = PASS; `MERGE_ATTEMPT` not held → read back first with `counters derive --step=ship-merge-pr --position=current`. FAIL → Failure Path: its handover sends code-level failures back to build, since a source-file retry loop would re-merge identical remote content. |
 | 13 — Update Local Dev | — | `bkit branches sync-dev`: fetch + fast-forward local `dev` to `origin/dev`, no checkout (`merge --ff-only` + frozen install when the main checkout is on `dev` and `dev` moved; install failure → exit 16 → **Failure Path**). Local-only `dev` commits → logged with the publish command, never pushed; step still passes. Step key `ship-switch-to-dev`. |
-| 14 — Close Workflow | — | `bkit runs gate --squash-of=<PR> --capstone-only --record={STATUS}` → records `ship-merge-ci`, then refuses unless the capstone passed at the squash commit. The capstone job's result alone decides: the run's conclusion and other jobs (deploys, notifications) never fail the close of a merged PR. `bkit workflows close --flush --pr-number= --squash-sha= --outbox= --token=` grades compliance, records `ship-close-workflow`, writes telemetry in the worktree, lands the single path-scoped `[skip ci]` close commit on `dev` via the throwaway checkout (refused → `ship-close/{FID}` PR) — a close that did not land keeps the lock and exits non-zero for the Failure Path; once on `dev`, `--branch={SHIP_BRANCH}` removes a workflow-created worktree only (`.worktree-owned` marker in the outbox), prunes, deletes local + remote branch (a worktree holding it blocks both → `branchBlockedBy`; `dev` / `main` refused); then the lock is released; step returns to `REPO_ROOT`. Gate 14 reads `status.jsonl` from `origin/dev`. Add `bkit:merged` label, drop `bkit:failed`. `--summary=<ship-summary.md> --summary-missing=<line>` reads the summary before the close removes the worktree holding it (absent — PR merged on entry → the missing line) and copies it to `{OUTBOX}`; final return displays it verbatim, appends what `bkit tips --workflow=<name>` prints (one tip, the star line, then how to silence both) as `## bkit Tips`, then offers a plain-English explanation on request. **HARD STOP**. |
+| 14 — Close Workflow | — | `runs gate --squash-of= --capstone-only --record=` records the post-merge verdict; only the squash capstone decides. `workflows close --flush` lands the path-scoped close record through the throwaway dev checkout, or a close PR when refused. Guarded cleanup removes a clean workflow-owned worktree and landed local ref only with fresh, matching evidence; dirty/index/unlanded work and changed refs are reported and retained. The remote ref remains when conditional deletion is unavailable. Record landing and lock release continue independently of retained work. Gate 14 reads status from dev. Copy/display the summary and tips, update the issue to review, then stop. |
 
 **Failure Path** books in `BOOK_ROOT` (not `--git-common-dir`), runs `bkit workflows fail` (aborts a rebase or merge, appends `workflow-failed`, releases the lock, clears `.deferred-blocked`), and includes conditional handover via `@bkit-debug-abort-handover` writing `ship-handover.md` when max-retry exhausted.
 
diff --git a/.claude/agents/bkit-ship-conflict-resolve.md b/.claude/agents/bkit-ship-conflict-resolve.md
index 5dea73650..488af34b4 100644
--- a/.claude/agents/bkit-ship-conflict-resolve.md
+++ b/.claude/agents/bkit-ship-conflict-resolve.md
@@ -59,7 +59,9 @@ autoCompactWindow: 300000
 5. Confirm the merge state the caller left:
    - Record the branch head with `git rev-parse HEAD`, and append a log entry naming it.
    - Run `git rev-parse -q --verify MERGE_HEAD`.
-   - **If** it prints nothing → no merge of `origin/dev` is in progress, so there is no conflict here to resolve:
+   - Resolve the caller's engine-recorded `{MERGE_TARGET}` with `git rev-parse --verify "{MERGE_TARGET}^{commit}"` and compare it with `MERGE_HEAD`.
+   - **If** either value is unreadable or the values differ → set `Verdict` = `FAIL` with `Edit`, name the target mismatch in the log and go straight to setting `Verdict`.
+   - **If** it prints nothing → no merge of the recorded target is in progress, so there is no conflict here to resolve:
      - Set `Verdict` = `FAIL` with `Edit`.
      - Go straight to setting `Verdict`.
    - Append a log entry.
@@ -67,7 +69,7 @@ autoCompactWindow: 300000
    ```bash
    BKIT="$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"
    [ -x "$BKIT" ] || BKIT="$(command -v bkit || echo "$BKIT")"
-   "$BKIT" branches sync --merge --file="{STATUS}"
+   "$BKIT" branches sync --merge --target="{MERGE_TARGET}" --file="{STATUS}"
    case $? in
      0) echo "MERGE_COMPLETE" ;;
      24) echo "HAND_RESOLVE" ;;
@@ -82,11 +84,11 @@ autoCompactWindow: 300000
      - Go straight to setting `Verdict`.
 7. Classify the conflicts:
    - List the conflicted files with `git diff --name-only --diff-filter=U`.
-   - List each side's recent commits with `git log -5 --oneline HEAD` and `git log -5 --oneline origin/dev`, then append a log entry.
+   - List each side's recent commits with `git log -5 --oneline HEAD` and `git log -5 --oneline "{MERGE_TARGET}"`, then append a log entry.
    - Classify each conflicted file against these two lists, then append a log entry:
      - `Allowed resolutions`:
        - Non-overlapping additive edits to the same file → concatenate them, keeping both sides.
-       - Formatting-only drift (whitespace, trailing newline, prettier output) → take `origin/dev`'s format.
+       - Formatting-only drift (whitespace, trailing newline, prettier output) → take the recorded target's format.
        - A dependency manifest bump on one side only (`package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`) → take the bump.
        - Additive JSON array entries or object property additions with no key or position overlap → concatenate them.
      - `Refused resolutions`:
@@ -109,7 +111,7 @@ autoCompactWindow: 300000
    - Append a log entry with its exit code.
    - **If** it exits non-zero → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
 10. Set `Verdict` in **Create** with `Edit`:
-    - `PASS` = a merge of `origin/dev` was in progress, every conflicted file was resolved by the auto-resolver or classified `Allowed resolutions` and resolved, the merge is committed, and `pnpm bkit:gate:install-static-unit-build` exited 0.
+    - `PASS` = a merge of the recorded target was in progress, every conflicted file was resolved by the auto-resolver or classified `Allowed resolutions` and resolved, the merge is committed, and `pnpm bkit:gate:install-static-unit-build` exited 0.
     - `FAIL` = no merge was in progress, **or** any conflicted file was classified `Refused resolutions`, **or** the auto-resolver aborted the merge, **or** any verify command exited non-zero.
 11. **If** `Verdict` = `FAIL`:
     - **If** `git rev-parse -q --verify MERGE_HEAD` prints a SHA:
diff --git a/.claude/commands/bkit-ship.md b/.claude/commands/bkit-ship.md
index 27819a880..1b9a7f98e 100644
--- a/.claude/commands/bkit-ship.md
+++ b/.claude/commands/bkit-ship.md
@@ -40,7 +40,7 @@ description: "Ship Feature — Autonomous merge and archive"
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path becomes it), checks artifacts and row, writes the row (ship: `--commit=none`, bookkeeping to `$BOOK_ROOT`), prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS.
+- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`. For `number` from 3 through 10, return to Step 3 instead, which compares recorded feature coverage before reusing completed agents. `after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS.
 - **Status:** `$BOOK_ROOT/.../status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Step 14 releases it via `bkit workflows close --flush --token=`, the **Failure Path** via `bkit workflows fail --token=`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
 - **Status branch:** From Step 2 all steps write `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (`{STATUS}`); `BOOK_ROOT` = `{WORKTREE_PATH}`. Stage path-scoped via `bkit ledgers commit`; NEVER stage all files (`-A`) or blanket `docs/`. One commit per flush block: Commit + Push Bookkeeping → `docs({FID}): ship bookkeeping bkit [skip ci]` → push `{SHIP_BRANCH}` (pre-merge: docs, logs, ledgers, skill removals); Close Workflow → `docs({FID}): ship DONE bkit [skip ci]`, **Failure Path** → `chore({FID}): ship FAILED bkit [skip ci]` → push `dev` from a throwaway `origin/dev` checkout; a refused close push → close PR.
@@ -215,10 +215,34 @@ description: "Ship Feature — Autonomous merge and archive"
    "{BKIT}" workflows input --workflow=ship --fid={FID} --run={RUN} --file="{STATUS}" --prompt-file="{SESSION_DIR}/prompt.md" --description-file="{SESSION_DIR}/issue-description.md" --comments-file="{SESSION_DIR}/issue-comments.json" --plan="docs/plans/{YYYYMM}/{FID}-plan.md" || exit 1
    ```
 2. Find the branch's PR — open first, then merged:
+   Reconcile and publish before probing or opening a PR, including on resume:
+
+   ```bash
+   "{BKIT}" branches sync --reconcile-feature --fid="{FID}" --file="{STATUS}"
+   ```
+
+   Route — first match wins:
+   - **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 2 → Step 4 sub-step 2.
+   - **If** exit 0 → hold `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD` → publish the resulting local head before sweep/docs bookkeeping.
+     ```bash
+     "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+     ```
+     Route:
+     **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
+   - **Else** → **Failure Path**.
+
    ```bash
-   "{BKIT}" prs probe --head="{SHIP_BRANCH}" --state=all
+   "{BKIT}" prs probe --head="{SHIP_BRANCH}" --base=dev --state=all --ship-entry --owner-repo="{OWNER_REPO}"
    ```
+
    Hold `number` as `PR_NUMBER`, `baseRefName` as `PR_BASE`, and hold `state`.
+   **If** exit 80 **or** `runtimeGithubCli` = false → read open PRs first, then merged PRs through MCP, independently reread the selected PR, and write `{ ownerRepo, headRefName, baseRefName: "dev", pr }` to `{OUTBOX}/ship-entry-facts.json`. `pr` is the complete `PrInfo` shape (`number`, `url`, `state`, `baseRefName`, `headRefName`, `headRefOid`, `title`, `mergeCommit`, `mergeable`), or null when neither exists. Record the single transport transition under **gh MCP fallback**, then use the engine's result:
+
+   ```bash
+   "{BKIT}" prs probe --head="{SHIP_BRANCH}" --base=dev --state=all --ship-entry --owner-repo="{OWNER_REPO}" --facts-file="{OUTBOX}/ship-entry-facts.json"
+   ```
+
+   Missing or mismatched facts → **Failure Path** before opening or merging anything. A merged PR with extra feature work returns exit 1: open a new PR, preserving that work.
    Route — first match wins:
    - **If** exit 0 **and** `PR_BASE` != dev → **Failure Path**.
    - **If** exit 0 → sub-step 3.
@@ -243,6 +267,7 @@ description: "Ship Feature — Autonomous merge and archive"
      Assert `PR_NUMBER` non-empty and `PR_BASE` = dev. **If** the assertion fails → **Failure Path**.
 
    - **Else** → **Failure Path**.
+
 3. Route:
    - **If** `state` = MERGED → record the resume marker → Step 13:
      ```bash
@@ -339,11 +364,21 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🤖 Step 3 — Base Check
 
-1. Determine whether `origin/dev` is an ancestor of the PR head:
+1. Reconcile again on every integration retry, then publish before selecting `BASE_PATH`:
+   ```bash
+   "{BKIT}" branches sync --reconcile-feature --fid="{FID}" --file="{STATUS}"
+   ```
+   Hold `basePath` as `BASE_PATH`, `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD`. **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 3 → Step 4 sub-step 2. **If** another non-zero exit → **Failure Path**.
+   ```bash
+   "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+   ```
+   Route:
+   **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
+   Compute the merge-aware feature coverage state:
    ```bash
-   "{BKIT}" branches sync --head="{ENTRY_HEAD}"
+   "{BKIT}" branches sync --feature-state --month="{YYYYMM}" --fid="{FID}"
    ```
-   Hold `basePath` as `BASE_PATH`.
+   Hold `featureCodeState` as `FEATURE_CODE_STATE`. Non-zero exit → **Failure Path**. Bookkeeping commits and proven automatic base-only merges retain coverage. New feature commits, imported feature merges and semantic conflict resolutions invalidate coverage. Unproven merge results remain in the state. Record this exact state with each successful sweep/docs completion below; read those rows from `{STATUS}` on resume.
 2. Route:
    - **If** `BASE_PATH` = A → Step 5 (skip integration — dev has not moved; no `bkit:generate`, because CI fails on a stale generated file and Step 10 regenerates when that is the only failure).
    - **If** `BASE_PATH` = B → Step 4 (integration required; its merge runs `bkit:generate`).
@@ -361,13 +396,17 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🧠 Step 4 — Integrate (Path B only)
 
-**Run only if** `BASE_PATH` = B.
+**Run only if** `BASE_PATH` = B **or** a feature reconciliation left `PENDING` conflicts.
 
 1. Merge `origin/dev` into `SHIP_BRANCH` locally. The block commits the run's uncommitted work first, unions the append-only ledgers, regenerates a conflicted lockfile from `dev`'s copy, rebuilds a conflicted generated register from `dev`'s copy, takes `dev`'s copy of the generated block in a conflicted embedding doc (a doc the register's script copies that block into) and merges the rest of that doc, merges a conflicted install record (`.bkit/version`) entry by entry with `dev`'s value where both sides changed an entry, runs a declared `bkit:generate`, and leaves every other conflict in the tree for sub-step 2. GitHub ignores `merge=union`, so the merged commit, not a server-side update or a rebase, is what makes the PR mergeable. No commit the block makes carries a skip token, so the sub-step 3 push starts CI at the merged head and Step 9 waits on that run:
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" branches sync --merge --fid="{FID}" --file="{STATUS}" --sentinel="docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"
+   git rev-parse --verify origin/dev
    ```
-   Hold `outcome` as `MERGE_OUTCOME`, `pending` as `PENDING`.
+   Hold the printed commit as `MERGE_TARGET`.
+   ```bash
+   cd "{WORKTREE_PATH}" && "{BKIT}" branches sync --merge --fid="{FID}" --file="{STATUS}" --target="{MERGE_TARGET}" --sentinel="docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"
+   ```
+   Hold `outcome` as `MERGE_OUTCOME`, `pending` as `PENDING`, `target` as `MERGE_TARGET`, and `head` as `CODE_HEAD` and `ENTRY_HEAD`. Set `RECONCILE_NEXT` empty for this dev integration.
    Route:
    - **If** exit 0 **and** `MERGE_OUTCOME` = merged → sub-step 3.
    - **If** exit 0 **and** `MERGE_OUTCOME` = current → Step 5. `dev` has not moved since Step 3.
@@ -375,7 +414,7 @@ description: "Ship Feature — Autonomous merge and archive"
    - **Else** → **Failure Path**. The block aborted the merge and wrote the sentinel.
 2. Resolve the conflicts the block left:
    1. **Subagent:** Invoke `@bkit-ship-conflict-resolve` using `Agent` tool:
-      Context: You are a subagent in the Ship phase. A merge of `origin/dev` is in progress with conflicts outside the ledgers, the lockfile, the generated register, the embedding docs and the install record: `{PENDING}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
+      Context: You are a subagent in the Ship phase. A merge of the engine-recorded target `{MERGE_TARGET}` is in progress with conflicts outside the ledgers, the lockfile, the generated register, the embedding docs and the install record: `{PENDING}`. Continue only this target. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
       Read: `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `{STATUS}`.
       Update: Conflicted source files.
       Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-conflict-resolve.md`.
@@ -386,14 +425,18 @@ description: "Ship Feature — Autonomous merge and archive"
    3. **If** `verdict` = PASS → sub-step 3. The subagent's re-run of the block committed the merge.
       **Else** → **Failure Path** (non-mechanical conflict → handover).
 3. Push the merged branch. The merge adds commits on top of the pushed head, so the push is plain, NEVER forced:
+
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+
    Route:
    - **If** exit 81 → end turn, re-run this block.
    - **If** exit 0 → continue with the next instruction.
    - **Else** → **Failure Path**.
 
+   **If** `RECONCILE_NEXT` is held → return there and reconcile again. **Else** → refresh `ENTRY_HEAD` and `CODE_HEAD` with `git rev-parse HEAD` → Step 5, which recomputes coverage after the integration and any conflict resolution.
+
 ### 🔒 Gate 4 — Integrate
 
 - [ ] Path classified
@@ -406,10 +449,15 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🤖 Step 5 — Deferred Sweep
 
-1. Fast-forward to the PR head, never onto a diverged branch:
-   ```bash
-   "{BKIT}" branches fast-forward --onto="origin/{SHIP_BRANCH}" >/dev/null || exit $?
-   ```
+Recompute coverage immediately before deciding whether to reuse the sweep:
+
+```bash
+"{BKIT}" branches sync --feature-state --month="{YYYYMM}" --fid="{FID}"
+```
+
+Refresh `FEATURE_CODE_STATE` from `featureCodeState`; non-zero exit → **Failure Path**.
+
+1. Read the latest successful `ship-feature-coverage` row for `step=ship-deferred-sweep` from `{STATUS}`. **If** its recorded feature-code state matches `FEATURE_CODE_STATE` and its artifact still exists → reuse it and skip to Step 6. **If** the state changed, differs or is missing → invoke the sweep again below. Never reuse a completion from a different feature state.
 2. Check for the plan:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" fids plans --fid="{FID}" --month="{YYYYMM}"
@@ -434,7 +482,10 @@ description: "Ship Feature — Autonomous merge and archive"
    "{BKIT}" steps finish --workflow=ship --step=ship-deferred-sweep --file="{STATUS}" --agent=bkit-ship-deferred-sweep --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md" --commit=none --number=5 --post --title="Deferred Sweep"
    ```
 4. Route:
-   - **If** `verdict` = PASS → Step 6.
+   - **If** `verdict` = PASS → record the covered feature-code state → Step 6:
+     ```bash
+     "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=ship-feature-coverage --field=step=ship-deferred-sweep --field="featureCodeState={FEATURE_CODE_STATE}" >/dev/null || exit 1
+     ```
    - **If** `verdict` = FAIL → write the `.deferred-blocked` sentinel below under `BOOK_ROOT`, then **Failure Path**.
      ```bash
      touch "{BOOK_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/.deferred-blocked"
@@ -443,7 +494,7 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ### 🔒 Gate 5 — Deferred Sweep
 
-- [ ] Worktree fast-forwarded
+- [ ] Reconciled feature-code state compared with recorded sweep coverage
 - [ ] Subagent invoked (`@bkit-ship-deferred-sweep`, no inline work)
 - [ ] Mechanical checks passed (`steps finish`)
 
@@ -451,6 +502,16 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🧠 Step 6 — Update Docs & Summary
 
+Refresh coverage again before deciding whether to reuse the docs artifact:
+
+```bash
+"{BKIT}" branches sync --feature-state --month="{YYYYMM}" --fid="{FID}"
+```
+
+Hold the current `featureCodeState` as `FEATURE_CODE_STATE`; non-zero exit → **Failure Path**.
+
+Read the latest successful `ship-feature-coverage` row for `step=ship-update-docs` from `{STATUS}`. **If** its recorded feature-code state matches `FEATURE_CODE_STATE` and the docs artifact exists → reuse it and skip sub-steps 1–3. **If** the state changed, differs or is missing → run the docs agent again. Always refresh the summary in sub-step 4.
+
 1. Write the FID's deferral lines to the artifact the docs agent reads `Pending Items` from:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" context ledger-scan --terms="{FID}" --source=docs/deferrals.jsonl --artifact="{OUTBOX}/ship-pending-items.md" --fid={FID} --step=ship-update-docs --reset-log >/dev/null || exit 1
@@ -464,6 +525,7 @@ description: "Ship Feature — Autonomous merge and archive"
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
    "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none || exit 1
+   "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=ship-feature-coverage --field=step=ship-update-docs --field="featureCodeState={FEATURE_CODE_STATE}" >/dev/null || exit 1
    ```
 4. Write `ship-summary.md` from this run's status rows and the PR's size:
    ```bash
@@ -535,6 +597,8 @@ description: "Ship Feature — Autonomous merge and archive"
 
 ## 🤖 Step 9 — Re-validate
 
+**If** `RECONCILE_REQUIRED` = true → clear it → Step 3 before validation. A previous `DONE` row alone never proves coverage of imported feature code.
+
 1. Resolve the head CI must pass at. The block re-validates when the code moved **or** `REVALIDATE_REASON` = `gate-refusal`: it probes for a run at it first, dispatches only when none, and waits for it to complete. Drop `--reason` when `REVALIDATE_REASON` is empty:
    ```bash
    "{BKIT}" runs revalidate --pr="{PR_NUMBER}" --entry-head="{ENTRY_HEAD}" --code-head="{CODE_HEAD}" --branch="{SHIP_BRANCH}" --month="{YYYYMM}" --fid="{FID}" --file="{STATUS}" --reason="{REVALIDATE_REASON}" --repo="{OWNER_REPO}"
@@ -556,10 +620,22 @@ description: "Ship Feature — Autonomous merge and archive"
 
 1. Assert the gate at the PR's current head, with CI checked at `VALIDATED_HEAD`. This gate is the ONLY merge precondition. The block writes the pre-merge snapshot to the outbox before the gate decides, refuses a title that carries a skip token (18), and records a refusal in `{STATUS}`:
    ```bash
-   "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fetch --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
+   "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fetch --fresh-base --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
+   ```
+   **If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
+   ```bash
+   "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fresh-base --facts-file="{OUTBOX}/ship-gate-facts.json" --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
    ```
    Route:
    - **If** exit 0 → hold `mergeHead` as `GATE_HEAD` → sub-step 2.
+   - **If** exit 19 (stale base) → the gate already recorded one failed arrival; route to integration:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path**, preserving the branch and worktree on exhaustion.
    - **If** exit 11 (in progress — poll), 14 (stale green), 10 (no run) **or** 17 (non-bookkeeping change past `VALIDATED_HEAD`) → route on the failed arrivals at Step 10, without asking:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
@@ -602,12 +678,16 @@ description: "Ship Feature — Autonomous merge and archive"
    ```
    Hold `state` as `STATE`, `labels` as `LABELS`. **If** exit 80 → read them via the tracker MCP (**Tracker**).
    ```bash
-   "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --delete-branch {LABEL_FLAGS} --expect-merged
+   "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --ship-retry --owner-repo="{OWNER_REPO}" {LABEL_FLAGS} --expect-merged
    ```
    Route:
-   - **If** exit 0 **or** 7 → hold `verdict` as `MERGE_VERDICT`, `failures` as `MERGE_FAILURES`, and hold `state`.
-   - **If** exit 80 → `pull_request_read` (`get`) and assert `base.ref` = `dev`; mismatch → **Failure Path** with nothing merged; then `merge_pull_request` and read `state` back through `pull_request_read` → `MERGE_VERDICT` = PASS and `MERGE_FAILURES` = 0 when merged, else FAIL and 1.
-   - **Else** (8: the PR's base is not `dev`, nothing merged) → **Failure Path**.
+   - **If** exit 0, 5, 7, 8, 9 **or** 10 → hold `route` as `MERGE_ROUTE`, `reason` as `MERGE_REASON`, `verdict` as `MERGE_VERDICT`, `failures` as `MERGE_FAILURES`, and hold `state` → sub-step 3. Missing output fields → **Failure Path**.
+   - **If** exit 80 **or** `runtimeGithubCli` = false → read fresh pre-attempt PR facts through `pull_request_read` (`get`). Refresh the scoped gate facts above with this PR, fresh CI and base evidence, and run that engine gate again before mutation. Only exit 0 authorizes `merge_pull_request`, with `sha` = the newly printed `GATE_HEAD`, the skip-token-free PR subject and an empty body. A gate refusal takes sub-step 1's route and consumes only its existing refusal row. After the attempt, independently reread post-attempt PR state through `pull_request_read`; never copy the mutation response or pre-attempt facts into `after`. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", matchHead, before, after }` to `{OUTBOX}/ship-merge-facts.json`, with complete `PrInfo` values for both reads and `matchHead` = `GATE_HEAD`. Missing or mismatched evidence → **Failure Path**. Record the single transport transition under **gh MCP fallback**, then classify without a second mutation:
+     ```bash
+     "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --ship-retry --owner-repo="{OWNER_REPO}" --facts-file="{OUTBOX}/ship-merge-facts.json" {LABEL_FLAGS} --expect-merged
+     ```
+     Hold the same route, reason, verdict, failures and state as the gh-backed result → sub-step 3.
+   - **Else** → **Failure Path**.
 3. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-merge-pr --file="{STATUS}" --verdict={MERGE_VERDICT} --failures={MERGE_FAILURES} --attempt=next --commit=none --number=10 --post --title="Merge Gate + Merge PR"
@@ -615,15 +695,24 @@ description: "Ship Feature — Autonomous merge and archive"
    Hold `attempt` as `MERGE_ATTEMPT`.
 4. Route:
    - **If** `state` = MERGED → Step 13.
-   - **If** `state` != MERGED → run counter routing:
+   - **If** `MERGE_ROUTE` = revalidate (exit 9) → Step 9 through the durable counter:
      ```bash
-     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-11 --exceeded=failure-path
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
      ```
      Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
-     - **If** exit 0 → Step 11.
-     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 11 → **Merge Question**.
+     Set `RECONCILE_REQUIRED` = true and `REVALIDATE_REASON` = gate-refusal, so imported feature work passes the state comparison and sweep/docs gates before CI.
+     - **If** exit 0 → Step 9.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 9 → **Merge Question**.
      - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
-   - **Else** → **Failure Path**.
+   - **If** `MERGE_ROUTE` = integrate (exit 10) → Step 3 through the same durable counter:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path** on exhaustion.
+   - **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Recoverable merge refusals never enter Steps 11–12. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
 
 ### 🔒 Gate 10 — Merge Gate + Merge PR
 
@@ -784,7 +873,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
    "{BKIT}" runs gate --squash-of="{PR_NUMBER}" --repo="{OWNER_REPO}" --capstone-only --record="{STATUS}"
    ```
    Hold `head` as `SQUASH_SHA`.
-2. Close the run. The block keeps the summary in the outbox (the close removes the worktree it lives in), lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, removes the worktree and `SHIP_BRANCH`, and returns to `REPO_ROOT`:
+2. Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is retained when conditional deletion cannot be guaranteed; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    ```bash
    "{BKIT}" workflows close --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --pr-number="{PR_NUMBER}" --squash-sha="{SQUASH_SHA}" --owner-repo="{OWNER_REPO}" --outbox="{OUTBOX}" --flush --token="{LOCK_TOKEN}" --branch="{SHIP_BRANCH}" --number=14 --post --title="Close Workflow" --final-return --summary="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --summary-missing="PR was already merged — no ship summary this run." --session-dir="{SESSION_DIR}"; rc=$?
@@ -810,7 +899,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 
 - [ ] Squash-merge CI capstone green (`runs gate`)
 - [ ] Close landed (`workflows close`)
-- [ ] Worktree removed and feature branch deleted, back in the repo root
+- [ ] Guarded cleanup and retained paths/refs reported, back in the repo root
 - [ ] Mechanical checks passed (`steps gate`)
 - [ ] Logs retained
 - [ ] Final return displayed
diff --git a/.codex/agents/bkit-ship-conflict-resolve.toml b/.codex/agents/bkit-ship-conflict-resolve.toml
index 542bc0ae8..45a907066 100644
--- a/.codex/agents/bkit-ship-conflict-resolve.toml
+++ b/.codex/agents/bkit-ship-conflict-resolve.toml
@@ -46,7 +46,9 @@ developer_instructions = """
 5. Confirm the merge state the caller left:
    - Record the branch head with `git rev-parse HEAD`, and append a log entry naming it.
    - Run `git rev-parse -q --verify MERGE_HEAD`.
-   - **If** it prints nothing → no merge of `origin/dev` is in progress, so there is no conflict here to resolve:
+   - Resolve the caller's engine-recorded `{MERGE_TARGET}` with `git rev-parse --verify "{MERGE_TARGET}^{commit}"` and compare it with `MERGE_HEAD`.
+   - **If** either value is unreadable or the values differ → set `Verdict` = `FAIL` with `Edit`, name the target mismatch in the log and go straight to setting `Verdict`.
+   - **If** it prints nothing → no merge of the recorded target is in progress, so there is no conflict here to resolve:
      - Set `Verdict` = `FAIL` with `Edit`.
      - Go straight to setting `Verdict`.
    - Append a log entry.
@@ -54,7 +56,7 @@ developer_instructions = """
    ```bash
    BKIT="$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"
    [ -x "$BKIT" ] || BKIT="$(command -v bkit || echo "$BKIT")"
-   "$BKIT" branches sync --merge --file="{STATUS}"
+   "$BKIT" branches sync --merge --target="{MERGE_TARGET}" --file="{STATUS}"
    case $? in
      0) echo "MERGE_COMPLETE" ;;
      24) echo "HAND_RESOLVE" ;;
@@ -69,11 +71,11 @@ developer_instructions = """
      - Go straight to setting `Verdict`.
 7. Classify the conflicts:
    - List the conflicted files with `git diff --name-only --diff-filter=U`.
-   - List each side's recent commits with `git log -5 --oneline HEAD` and `git log -5 --oneline origin/dev`, then append a log entry.
+   - List each side's recent commits with `git log -5 --oneline HEAD` and `git log -5 --oneline "{MERGE_TARGET}"`, then append a log entry.
    - Classify each conflicted file against these two lists, then append a log entry:
      - `Allowed resolutions`:
        - Non-overlapping additive edits to the same file → concatenate them, keeping both sides.
-       - Formatting-only drift (whitespace, trailing newline, prettier output) → take `origin/dev`'s format.
+       - Formatting-only drift (whitespace, trailing newline, prettier output) → take the recorded target's format.
        - A dependency manifest bump on one side only (`package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`) → take the bump.
        - Additive JSON array entries or object property additions with no key or position overlap → concatenate them.
      - `Refused resolutions`:
@@ -96,7 +98,7 @@ developer_instructions = """
    - Append a log entry with its exit code.
    - **If** it exits non-zero → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
 10. Set `Verdict` in **Create** with `Edit`:
-    - `PASS` = a merge of `origin/dev` was in progress, every conflicted file was resolved by the auto-resolver or classified `Allowed resolutions` and resolved, the merge is committed, and `pnpm bkit:gate:install-static-unit-build` exited 0.
+    - `PASS` = a merge of the recorded target was in progress, every conflicted file was resolved by the auto-resolver or classified `Allowed resolutions` and resolved, the merge is committed, and `pnpm bkit:gate:install-static-unit-build` exited 0.
     - `FAIL` = no merge was in progress, **or** any conflicted file was classified `Refused resolutions`, **or** the auto-resolver aborted the merge, **or** any verify command exited non-zero.
 11. **If** `Verdict` = `FAIL`:
     - **If** `git rev-parse -q --verify MERGE_HEAD` prints a SHA:
diff --git a/.cursor/agents/bkit-ship-conflict-resolve.md b/.cursor/agents/bkit-ship-conflict-resolve.md
index 0c4f7b0bc..a20e2fb03 100644
--- a/.cursor/agents/bkit-ship-conflict-resolve.md
+++ b/.cursor/agents/bkit-ship-conflict-resolve.md
@@ -56,7 +56,9 @@ tools:
 5. Confirm the merge state the caller left:
    - Record the branch head with `git rev-parse HEAD`, and append a log entry naming it.
    - Run `git rev-parse -q --verify MERGE_HEAD`.
-   - **If** it prints nothing → no merge of `origin/dev` is in progress, so there is no conflict here to resolve:
+   - Resolve the caller's engine-recorded `{MERGE_TARGET}` with `git rev-parse --verify "{MERGE_TARGET}^{commit}"` and compare it with `MERGE_HEAD`.
+   - **If** either value is unreadable or the values differ → set `Verdict` = `FAIL` with `Edit`, name the target mismatch in the log and go straight to setting `Verdict`.
+   - **If** it prints nothing → no merge of the recorded target is in progress, so there is no conflict here to resolve:
      - Set `Verdict` = `FAIL` with `Edit`.
      - Go straight to setting `Verdict`.
    - Append a log entry.
@@ -64,7 +66,7 @@ tools:
    ```bash
    BKIT="$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"
    [ -x "$BKIT" ] || BKIT="$(command -v bkit || echo "$BKIT")"
-   "$BKIT" branches sync --merge --file="{STATUS}"
+   "$BKIT" branches sync --merge --target="{MERGE_TARGET}" --file="{STATUS}"
    case $? in
      0) echo "MERGE_COMPLETE" ;;
      24) echo "HAND_RESOLVE" ;;
@@ -79,11 +81,11 @@ tools:
      - Go straight to setting `Verdict`.
 7. Classify the conflicts:
    - List the conflicted files with `git diff --name-only --diff-filter=U`.
-   - List each side's recent commits with `git log -5 --oneline HEAD` and `git log -5 --oneline origin/dev`, then append a log entry.
+   - List each side's recent commits with `git log -5 --oneline HEAD` and `git log -5 --oneline "{MERGE_TARGET}"`, then append a log entry.
    - Classify each conflicted file against these two lists, then append a log entry:
      - `Allowed resolutions`:
        - Non-overlapping additive edits to the same file → concatenate them, keeping both sides.
-       - Formatting-only drift (whitespace, trailing newline, prettier output) → take `origin/dev`'s format.
+       - Formatting-only drift (whitespace, trailing newline, prettier output) → take the recorded target's format.
        - A dependency manifest bump on one side only (`package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`) → take the bump.
        - Additive JSON array entries or object property additions with no key or position overlap → concatenate them.
      - `Refused resolutions`:
@@ -106,7 +108,7 @@ tools:
    - Append a log entry with its exit code.
    - **If** it exits non-zero → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
 10. Set `Verdict` in **Create** with `Edit`:
-    - `PASS` = a merge of `origin/dev` was in progress, every conflicted file was resolved by the auto-resolver or classified `Allowed resolutions` and resolved, the merge is committed, and `pnpm bkit:gate:install-static-unit-build` exited 0.
+    - `PASS` = a merge of the recorded target was in progress, every conflicted file was resolved by the auto-resolver or classified `Allowed resolutions` and resolved, the merge is committed, and `pnpm bkit:gate:install-static-unit-build` exited 0.
     - `FAIL` = no merge was in progress, **or** any conflicted file was classified `Refused resolutions`, **or** the auto-resolver aborted the merge, **or** any verify command exited non-zero.
 11. **If** `Verdict` = `FAIL`:
     - **If** `git rev-parse -q --verify MERGE_HEAD` prints a SHA:
diff --git a/.cursor/commands/bkit-ship.md b/.cursor/commands/bkit-ship.md
index 230742860..ab739852b 100644
--- a/.cursor/commands/bkit-ship.md
+++ b/.cursor/commands/bkit-ship.md
@@ -39,7 +39,7 @@ Ship Feature — Autonomous merge and archive
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path becomes it), checks artifacts and row, writes the row (ship: `--commit=none`, bookkeeping to `$BOOK_ROOT`), prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS.
+- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`. For `number` from 3 through 10, return to Step 3 instead, which compares recorded feature coverage before reusing completed agents. `after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS.
 - **Status:** `$BOOK_ROOT/.../status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Step 14 releases it via `bkit workflows close --flush --token=`, the **Failure Path** via `bkit workflows fail --token=`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
 - **Status branch:** From Step 2 all steps write `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (`{STATUS}`); `BOOK_ROOT` = `{WORKTREE_PATH}`. Stage path-scoped via `bkit ledgers commit`; NEVER stage all files (`-A`) or blanket `docs/`. One commit per flush block: Commit + Push Bookkeeping → `docs({FID}): ship bookkeeping bkit [skip ci]` → push `{SHIP_BRANCH}` (pre-merge: docs, logs, ledgers, skill removals); Close Workflow → `docs({FID}): ship DONE bkit [skip ci]`, **Failure Path** → `chore({FID}): ship FAILED bkit [skip ci]` → push `dev` from a throwaway `origin/dev` checkout; a refused close push → close PR.
@@ -214,10 +214,34 @@ Ship Feature — Autonomous merge and archive
    "{BKIT}" workflows input --workflow=ship --fid={FID} --run={RUN} --file="{STATUS}" --prompt-file="{SESSION_DIR}/prompt.md" --description-file="{SESSION_DIR}/issue-description.md" --comments-file="{SESSION_DIR}/issue-comments.json" --plan="docs/plans/{YYYYMM}/{FID}-plan.md" || exit 1
    ```
 2. Find the branch's PR — open first, then merged:
+   Reconcile and publish before probing or opening a PR, including on resume:
+
+   ```bash
+   "{BKIT}" branches sync --reconcile-feature --fid="{FID}" --file="{STATUS}"
+   ```
+
+   Route — first match wins:
+   - **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 2 → Step 4 sub-step 2.
+   - **If** exit 0 → hold `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD` → publish the resulting local head before sweep/docs bookkeeping.
+     ```bash
+     "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+     ```
+     Route:
+     **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
+   - **Else** → **Failure Path**.
+
    ```bash
-   "{BKIT}" prs probe --head="{SHIP_BRANCH}" --state=all
+   "{BKIT}" prs probe --head="{SHIP_BRANCH}" --base=dev --state=all --ship-entry --owner-repo="{OWNER_REPO}"
    ```
+
    Hold `number` as `PR_NUMBER`, `baseRefName` as `PR_BASE`, and hold `state`.
+   **If** exit 80 **or** `runtimeGithubCli` = false → read open PRs first, then merged PRs through MCP, independently reread the selected PR, and write `{ ownerRepo, headRefName, baseRefName: "dev", pr }` to `{OUTBOX}/ship-entry-facts.json`. `pr` is the complete `PrInfo` shape (`number`, `url`, `state`, `baseRefName`, `headRefName`, `headRefOid`, `title`, `mergeCommit`, `mergeable`), or null when neither exists. Record the single transport transition under **gh MCP fallback**, then use the engine's result:
+
+   ```bash
+   "{BKIT}" prs probe --head="{SHIP_BRANCH}" --base=dev --state=all --ship-entry --owner-repo="{OWNER_REPO}" --facts-file="{OUTBOX}/ship-entry-facts.json"
+   ```
+
+   Missing or mismatched facts → **Failure Path** before opening or merging anything. A merged PR with extra feature work returns exit 1: open a new PR, preserving that work.
    Route — first match wins:
    - **If** exit 0 **and** `PR_BASE` != dev → **Failure Path**.
    - **If** exit 0 → sub-step 3.
@@ -242,6 +266,7 @@ Ship Feature — Autonomous merge and archive
      Assert `PR_NUMBER` non-empty and `PR_BASE` = dev. **If** the assertion fails → **Failure Path**.
 
    - **Else** → **Failure Path**.
+
 3. Route:
    - **If** `state` = MERGED → record the resume marker → Step 13:
      ```bash
@@ -338,11 +363,21 @@ Ship Feature — Autonomous merge and archive
 
 ## 🤖 Step 3 — Base Check
 
-1. Determine whether `origin/dev` is an ancestor of the PR head:
+1. Reconcile again on every integration retry, then publish before selecting `BASE_PATH`:
+   ```bash
+   "{BKIT}" branches sync --reconcile-feature --fid="{FID}" --file="{STATUS}"
+   ```
+   Hold `basePath` as `BASE_PATH`, `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD`. **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 3 → Step 4 sub-step 2. **If** another non-zero exit → **Failure Path**.
+   ```bash
+   "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+   ```
+   Route:
+   **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
+   Compute the merge-aware feature coverage state:
    ```bash
-   "{BKIT}" branches sync --head="{ENTRY_HEAD}"
+   "{BKIT}" branches sync --feature-state --month="{YYYYMM}" --fid="{FID}"
    ```
-   Hold `basePath` as `BASE_PATH`.
+   Hold `featureCodeState` as `FEATURE_CODE_STATE`. Non-zero exit → **Failure Path**. Bookkeeping commits and proven automatic base-only merges retain coverage. New feature commits, imported feature merges and semantic conflict resolutions invalidate coverage. Unproven merge results remain in the state. Record this exact state with each successful sweep/docs completion below; read those rows from `{STATUS}` on resume.
 2. Route:
    - **If** `BASE_PATH` = A → Step 5 (skip integration — dev has not moved; no `bkit:generate`, because CI fails on a stale generated file and Step 10 regenerates when that is the only failure).
    - **If** `BASE_PATH` = B → Step 4 (integration required; its merge runs `bkit:generate`).
@@ -360,13 +395,17 @@ Ship Feature — Autonomous merge and archive
 
 ## 🧠 Step 4 — Integrate (Path B only)
 
-**Run only if** `BASE_PATH` = B.
+**Run only if** `BASE_PATH` = B **or** a feature reconciliation left `PENDING` conflicts.
 
 1. Merge `origin/dev` into `SHIP_BRANCH` locally. The block commits the run's uncommitted work first, unions the append-only ledgers, regenerates a conflicted lockfile from `dev`'s copy, rebuilds a conflicted generated register from `dev`'s copy, takes `dev`'s copy of the generated block in a conflicted embedding doc (a doc the register's script copies that block into) and merges the rest of that doc, merges a conflicted install record (`.bkit/version`) entry by entry with `dev`'s value where both sides changed an entry, runs a declared `bkit:generate`, and leaves every other conflict in the tree for sub-step 2. GitHub ignores `merge=union`, so the merged commit, not a server-side update or a rebase, is what makes the PR mergeable. No commit the block makes carries a skip token, so the sub-step 3 push starts CI at the merged head and Step 9 waits on that run:
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" branches sync --merge --fid="{FID}" --file="{STATUS}" --sentinel="docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"
+   git rev-parse --verify origin/dev
    ```
-   Hold `outcome` as `MERGE_OUTCOME`, `pending` as `PENDING`.
+   Hold the printed commit as `MERGE_TARGET`.
+   ```bash
+   cd "{WORKTREE_PATH}" && "{BKIT}" branches sync --merge --fid="{FID}" --file="{STATUS}" --target="{MERGE_TARGET}" --sentinel="docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"
+   ```
+   Hold `outcome` as `MERGE_OUTCOME`, `pending` as `PENDING`, `target` as `MERGE_TARGET`, and `head` as `CODE_HEAD` and `ENTRY_HEAD`. Set `RECONCILE_NEXT` empty for this dev integration.
    Route:
    - **If** exit 0 **and** `MERGE_OUTCOME` = merged → sub-step 3.
    - **If** exit 0 **and** `MERGE_OUTCOME` = current → Step 5. `dev` has not moved since Step 3.
@@ -374,7 +413,7 @@ Ship Feature — Autonomous merge and archive
    - **Else** → **Failure Path**. The block aborted the merge and wrote the sentinel.
 2. Resolve the conflicts the block left:
    1. **Subagent:** Invoke `/bkit-ship-conflict-resolve` using `Task` tool:
-      Context: You are a subagent in the Ship phase. A merge of `origin/dev` is in progress with conflicts outside the ledgers, the lockfile, the generated register, the embedding docs and the install record: `{PENDING}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
+      Context: You are a subagent in the Ship phase. A merge of the engine-recorded target `{MERGE_TARGET}` is in progress with conflicts outside the ledgers, the lockfile, the generated register, the embedding docs and the install record: `{PENDING}`. Continue only this target. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
       Read: `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `{STATUS}`.
       Update: Conflicted source files.
       Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-conflict-resolve.md`.
@@ -385,14 +424,18 @@ Ship Feature — Autonomous merge and archive
    3. **If** `verdict` = PASS → sub-step 3. The subagent's re-run of the block committed the merge.
       **Else** → **Failure Path** (non-mechanical conflict → handover).
 3. Push the merged branch. The merge adds commits on top of the pushed head, so the push is plain, NEVER forced:
+
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+
    Route:
    - **If** exit 81 → end turn, re-run this block.
    - **If** exit 0 → continue with the next instruction.
    - **Else** → **Failure Path**.
 
+   **If** `RECONCILE_NEXT` is held → return there and reconcile again. **Else** → refresh `ENTRY_HEAD` and `CODE_HEAD` with `git rev-parse HEAD` → Step 5, which recomputes coverage after the integration and any conflict resolution.
+
 ### 🔒 Gate 4 — Integrate
 
 - [ ] Path classified
@@ -405,10 +448,15 @@ Ship Feature — Autonomous merge and archive
 
 ## 🤖 Step 5 — Deferred Sweep
 
-1. Fast-forward to the PR head, never onto a diverged branch:
-   ```bash
-   "{BKIT}" branches fast-forward --onto="origin/{SHIP_BRANCH}" >/dev/null || exit $?
-   ```
+Recompute coverage immediately before deciding whether to reuse the sweep:
+
+```bash
+"{BKIT}" branches sync --feature-state --month="{YYYYMM}" --fid="{FID}"
+```
+
+Refresh `FEATURE_CODE_STATE` from `featureCodeState`; non-zero exit → **Failure Path**.
+
+1. Read the latest successful `ship-feature-coverage` row for `step=ship-deferred-sweep` from `{STATUS}`. **If** its recorded feature-code state matches `FEATURE_CODE_STATE` and its artifact still exists → reuse it and skip to Step 6. **If** the state changed, differs or is missing → invoke the sweep again below. Never reuse a completion from a different feature state.
 2. Check for the plan:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" fids plans --fid="{FID}" --month="{YYYYMM}"
@@ -433,7 +481,10 @@ Ship Feature — Autonomous merge and archive
    "{BKIT}" steps finish --workflow=ship --step=ship-deferred-sweep --file="{STATUS}" --agent=bkit-ship-deferred-sweep --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md" --commit=none --number=5 --post --title="Deferred Sweep"
    ```
 4. Route:
-   - **If** `verdict` = PASS → Step 6.
+   - **If** `verdict` = PASS → record the covered feature-code state → Step 6:
+     ```bash
+     "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=ship-feature-coverage --field=step=ship-deferred-sweep --field="featureCodeState={FEATURE_CODE_STATE}" >/dev/null || exit 1
+     ```
    - **If** `verdict` = FAIL → write the `.deferred-blocked` sentinel below under `BOOK_ROOT`, then **Failure Path**.
      ```bash
      touch "{BOOK_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/.deferred-blocked"
@@ -442,7 +493,7 @@ Ship Feature — Autonomous merge and archive
 
 ### 🔒 Gate 5 — Deferred Sweep
 
-- [ ] Worktree fast-forwarded
+- [ ] Reconciled feature-code state compared with recorded sweep coverage
 - [ ] Subagent invoked (`@bkit-ship-deferred-sweep`, no inline work)
 - [ ] Mechanical checks passed (`steps finish`)
 
@@ -450,6 +501,16 @@ Ship Feature — Autonomous merge and archive
 
 ## 🧠 Step 6 — Update Docs & Summary
 
+Refresh coverage again before deciding whether to reuse the docs artifact:
+
+```bash
+"{BKIT}" branches sync --feature-state --month="{YYYYMM}" --fid="{FID}"
+```
+
+Hold the current `featureCodeState` as `FEATURE_CODE_STATE`; non-zero exit → **Failure Path**.
+
+Read the latest successful `ship-feature-coverage` row for `step=ship-update-docs` from `{STATUS}`. **If** its recorded feature-code state matches `FEATURE_CODE_STATE` and the docs artifact exists → reuse it and skip sub-steps 1–3. **If** the state changed, differs or is missing → run the docs agent again. Always refresh the summary in sub-step 4.
+
 1. Write the FID's deferral lines to the artifact the docs agent reads `Pending Items` from:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" context ledger-scan --terms="{FID}" --source=docs/deferrals.jsonl --artifact="{OUTBOX}/ship-pending-items.md" --fid={FID} --step=ship-update-docs --reset-log >/dev/null || exit 1
@@ -463,6 +524,7 @@ Ship Feature — Autonomous merge and archive
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
    "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none || exit 1
+   "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=ship-feature-coverage --field=step=ship-update-docs --field="featureCodeState={FEATURE_CODE_STATE}" >/dev/null || exit 1
    ```
 4. Write `ship-summary.md` from this run's status rows and the PR's size:
    ```bash
@@ -534,6 +596,8 @@ Ship Feature — Autonomous merge and archive
 
 ## 🤖 Step 9 — Re-validate
 
+**If** `RECONCILE_REQUIRED` = true → clear it → Step 3 before validation. A previous `DONE` row alone never proves coverage of imported feature code.
+
 1. Resolve the head CI must pass at. The block re-validates when the code moved **or** `REVALIDATE_REASON` = `gate-refusal`: it probes for a run at it first, dispatches only when none, and waits for it to complete. Drop `--reason` when `REVALIDATE_REASON` is empty:
    ```bash
    "{BKIT}" runs revalidate --pr="{PR_NUMBER}" --entry-head="{ENTRY_HEAD}" --code-head="{CODE_HEAD}" --branch="{SHIP_BRANCH}" --month="{YYYYMM}" --fid="{FID}" --file="{STATUS}" --reason="{REVALIDATE_REASON}" --repo="{OWNER_REPO}"
@@ -555,10 +619,22 @@ Ship Feature — Autonomous merge and archive
 
 1. Assert the gate at the PR's current head, with CI checked at `VALIDATED_HEAD`. This gate is the ONLY merge precondition. The block writes the pre-merge snapshot to the outbox before the gate decides, refuses a title that carries a skip token (18), and records a refusal in `{STATUS}`:
    ```bash
-   "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fetch --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
+   "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fetch --fresh-base --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
+   ```
+   **If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
+   ```bash
+   "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fresh-base --facts-file="{OUTBOX}/ship-gate-facts.json" --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
    ```
    Route:
    - **If** exit 0 → hold `mergeHead` as `GATE_HEAD` → sub-step 2.
+   - **If** exit 19 (stale base) → the gate already recorded one failed arrival; route to integration:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path**, preserving the branch and worktree on exhaustion.
    - **If** exit 11 (in progress — poll), 14 (stale green), 10 (no run) **or** 17 (non-bookkeeping change past `VALIDATED_HEAD`) → route on the failed arrivals at Step 10, without asking:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
@@ -601,12 +677,16 @@ Ship Feature — Autonomous merge and archive
    ```
    Hold `state` as `STATE`, `labels` as `LABELS`. **If** exit 80 → read them via the tracker MCP (**Tracker**).
    ```bash
-   "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --delete-branch {LABEL_FLAGS} --expect-merged
+   "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --ship-retry --owner-repo="{OWNER_REPO}" {LABEL_FLAGS} --expect-merged
    ```
    Route:
-   - **If** exit 0 **or** 7 → hold `verdict` as `MERGE_VERDICT`, `failures` as `MERGE_FAILURES`, and hold `state`.
-   - **If** exit 80 → `pull_request_read` (`get`) and assert `base.ref` = `dev`; mismatch → **Failure Path** with nothing merged; then `merge_pull_request` and read `state` back through `pull_request_read` → `MERGE_VERDICT` = PASS and `MERGE_FAILURES` = 0 when merged, else FAIL and 1.
-   - **Else** (8: the PR's base is not `dev`, nothing merged) → **Failure Path**.
+   - **If** exit 0, 5, 7, 8, 9 **or** 10 → hold `route` as `MERGE_ROUTE`, `reason` as `MERGE_REASON`, `verdict` as `MERGE_VERDICT`, `failures` as `MERGE_FAILURES`, and hold `state` → sub-step 3. Missing output fields → **Failure Path**.
+   - **If** exit 80 **or** `runtimeGithubCli` = false → read fresh pre-attempt PR facts through `pull_request_read` (`get`). Refresh the scoped gate facts above with this PR, fresh CI and base evidence, and run that engine gate again before mutation. Only exit 0 authorizes `merge_pull_request`, with `sha` = the newly printed `GATE_HEAD`, the skip-token-free PR subject and an empty body. A gate refusal takes sub-step 1's route and consumes only its existing refusal row. After the attempt, independently reread post-attempt PR state through `pull_request_read`; never copy the mutation response or pre-attempt facts into `after`. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", matchHead, before, after }` to `{OUTBOX}/ship-merge-facts.json`, with complete `PrInfo` values for both reads and `matchHead` = `GATE_HEAD`. Missing or mismatched evidence → **Failure Path**. Record the single transport transition under **gh MCP fallback**, then classify without a second mutation:
+     ```bash
+     "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --ship-retry --owner-repo="{OWNER_REPO}" --facts-file="{OUTBOX}/ship-merge-facts.json" {LABEL_FLAGS} --expect-merged
+     ```
+     Hold the same route, reason, verdict, failures and state as the gh-backed result → sub-step 3.
+   - **Else** → **Failure Path**.
 3. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-merge-pr --file="{STATUS}" --verdict={MERGE_VERDICT} --failures={MERGE_FAILURES} --attempt=next --commit=none --number=10 --post --title="Merge Gate + Merge PR"
@@ -614,15 +694,24 @@ Ship Feature — Autonomous merge and archive
    Hold `attempt` as `MERGE_ATTEMPT`.
 4. Route:
    - **If** `state` = MERGED → Step 13.
-   - **If** `state` != MERGED → run counter routing:
+   - **If** `MERGE_ROUTE` = revalidate (exit 9) → Step 9 through the durable counter:
      ```bash
-     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-11 --exceeded=failure-path
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
      ```
      Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
-     - **If** exit 0 → Step 11.
-     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 11 → **Merge Question**.
+     Set `RECONCILE_REQUIRED` = true and `REVALIDATE_REASON` = gate-refusal, so imported feature work passes the state comparison and sweep/docs gates before CI.
+     - **If** exit 0 → Step 9.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 9 → **Merge Question**.
      - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
-   - **Else** → **Failure Path**.
+   - **If** `MERGE_ROUTE` = integrate (exit 10) → Step 3 through the same durable counter:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path** on exhaustion.
+   - **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Recoverable merge refusals never enter Steps 11–12. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
 
 ### 🔒 Gate 10 — Merge Gate + Merge PR
 
@@ -783,7 +872,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
    "{BKIT}" runs gate --squash-of="{PR_NUMBER}" --repo="{OWNER_REPO}" --capstone-only --record="{STATUS}"
    ```
    Hold `head` as `SQUASH_SHA`.
-2. Close the run. The block keeps the summary in the outbox (the close removes the worktree it lives in), lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, removes the worktree and `SHIP_BRANCH`, and returns to `REPO_ROOT`:
+2. Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is retained when conditional deletion cannot be guaranteed; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    ```bash
    "{BKIT}" workflows close --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --pr-number="{PR_NUMBER}" --squash-sha="{SQUASH_SHA}" --owner-repo="{OWNER_REPO}" --outbox="{OUTBOX}" --flush --token="{LOCK_TOKEN}" --branch="{SHIP_BRANCH}" --number=14 --post --title="Close Workflow" --final-return --summary="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --summary-missing="PR was already merged — no ship summary this run." --session-dir="{SESSION_DIR}"; rc=$?
@@ -809,7 +898,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 
 - [ ] Squash-merge CI capstone green (`runs gate`)
 - [ ] Close landed (`workflows close`)
-- [ ] Worktree removed and feature branch deleted, back in the repo root
+- [ ] Guarded cleanup and retained paths/refs reported, back in the repo root
 - [ ] Mechanical checks passed (`steps gate`)
 - [ ] Logs retained
 - [ ] Final return displayed
diff --git a/.opencode/agents/bkit-ship-conflict-resolve.md b/.opencode/agents/bkit-ship-conflict-resolve.md
index bebcc953d..e4e4e0749 100644
--- a/.opencode/agents/bkit-ship-conflict-resolve.md
+++ b/.opencode/agents/bkit-ship-conflict-resolve.md
@@ -57,7 +57,9 @@ tools:
 5. Confirm the merge state the caller left:
    - Record the branch head with `git rev-parse HEAD`, and append a log entry naming it.
    - Run `git rev-parse -q --verify MERGE_HEAD`.
-   - **If** it prints nothing → no merge of `origin/dev` is in progress, so there is no conflict here to resolve:
+   - Resolve the caller's engine-recorded `{MERGE_TARGET}` with `git rev-parse --verify "{MERGE_TARGET}^{commit}"` and compare it with `MERGE_HEAD`.
+   - **If** either value is unreadable or the values differ → set `Verdict` = `FAIL` with `Edit`, name the target mismatch in the log and go straight to setting `Verdict`.
+   - **If** it prints nothing → no merge of the recorded target is in progress, so there is no conflict here to resolve:
      - Set `Verdict` = `FAIL` with `Edit`.
      - Go straight to setting `Verdict`.
    - Append a log entry.
@@ -65,7 +67,7 @@ tools:
    ```bash
    BKIT="$(dirname "$(git rev-parse --path-format=absolute --git-common-dir)")/node_modules/.bin/bkit"
    [ -x "$BKIT" ] || BKIT="$(command -v bkit || echo "$BKIT")"
-   "$BKIT" branches sync --merge --file="{STATUS}"
+   "$BKIT" branches sync --merge --target="{MERGE_TARGET}" --file="{STATUS}"
    case $? in
      0) echo "MERGE_COMPLETE" ;;
      24) echo "HAND_RESOLVE" ;;
@@ -80,11 +82,11 @@ tools:
      - Go straight to setting `Verdict`.
 7. Classify the conflicts:
    - List the conflicted files with `git diff --name-only --diff-filter=U`.
-   - List each side's recent commits with `git log -5 --oneline HEAD` and `git log -5 --oneline origin/dev`, then append a log entry.
+   - List each side's recent commits with `git log -5 --oneline HEAD` and `git log -5 --oneline "{MERGE_TARGET}"`, then append a log entry.
    - Classify each conflicted file against these two lists, then append a log entry:
      - `Allowed resolutions`:
        - Non-overlapping additive edits to the same file → concatenate them, keeping both sides.
-       - Formatting-only drift (whitespace, trailing newline, prettier output) → take `origin/dev`'s format.
+       - Formatting-only drift (whitespace, trailing newline, prettier output) → take the recorded target's format.
        - A dependency manifest bump on one side only (`package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`) → take the bump.
        - Additive JSON array entries or object property additions with no key or position overlap → concatenate them.
      - `Refused resolutions`:
@@ -107,7 +109,7 @@ tools:
    - Append a log entry with its exit code.
    - **If** it exits non-zero → set `Verdict` = `FAIL` with `Edit` immediately, without waiting for the final pass.
 10. Set `Verdict` in **Create** with `Edit`:
-    - `PASS` = a merge of `origin/dev` was in progress, every conflicted file was resolved by the auto-resolver or classified `Allowed resolutions` and resolved, the merge is committed, and `pnpm bkit:gate:install-static-unit-build` exited 0.
+    - `PASS` = a merge of the recorded target was in progress, every conflicted file was resolved by the auto-resolver or classified `Allowed resolutions` and resolved, the merge is committed, and `pnpm bkit:gate:install-static-unit-build` exited 0.
     - `FAIL` = no merge was in progress, **or** any conflicted file was classified `Refused resolutions`, **or** the auto-resolver aborted the merge, **or** any verify command exited non-zero.
 11. **If** `Verdict` = `FAIL`:
     - **If** `git rev-parse -q --verify MERGE_HEAD` prints a SHA:
diff --git a/.opencode/commands/bkit-ship.md b/.opencode/commands/bkit-ship.md
index a27744883..4238dd010 100644
--- a/.opencode/commands/bkit-ship.md
+++ b/.opencode/commands/bkit-ship.md
@@ -43,7 +43,7 @@ $ARGUMENTS
 
 - **Friction:** Watch own context and subagent returns for manual installs, agent rework, repeated tool failures, destructive backouts → append rows to `.bkit/friction.jsonl` with `bkit ledgers append` (`.bkit/jsonl.md` § Write Idiom) → continue or escalate; `status row --type=owner-pause` logs each owner pause itself, so do not log one; logging does not replace **Failure Path**.
 - **Finish:** `bkit steps finish` reads each `--agent`'s header from the `--artifact` in the same position, derives the attempt (`--attempt-of`; `<attempt>` in a path becomes it), checks artifacts and row, writes the row (ship: `--commit=none`, bookkeeping to `$BOOK_ROOT`), prints `comment`. Exit 5 **or** 6 → invoke `reask.agent` again with `"Your prior output '<reask.artifact>' has an invalid header. Re-emit only its header fields + '<!-- verdict:end -->' at top of that file. Do not redo work."` → wait for subagent and re-run the block → **If** still non-zero → **Failure Path**. Exit 8 → nothing written, nothing committed: fix what the hook's message names, then re-run this block — the step's attempt is unchanged. Hold `verdict` as the step's verdict, `fields` as its other header fields, `attempt` as its attempt.
-- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`; `after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS.
+- **Resume:** After Step 2, unless Step 1 or 2 routed elsewhere, `"{BKIT}" status resume --workflow=ship --file="{STATUS}"` names where the active `IN_PROGRESS` run picks up — after its last `DONE` step; Steps 1-2 ALWAYS run again and rows of steps this workflow no longer has are ignored → continue at Step `number`. For `number` from 3 through 10, return to Step 3 instead, which compares recorded feature coverage before reusing completed agents. `after` = `ship-failure-remediate` → Step 12 sub-step 4 with `verdict` = PASS.
 - **Status:** `$BOOK_ROOT/.../status.jsonl` = append-only NDJSON event log, one event per line. `step-done` carries `parentSha` captured at step START, optional `verdict` (`PASS|CONCERNS|FAIL`, or a word the step's agent adds, e.g. execute's `HANDOVER`), `failures`, `attempt`, `strategy` (`STANDARD|PIVOT|FINAL`). **If** `failures` present → `PASS => failures=0`, `FAIL => failures>0`, `CONCERNS => failures>=0`.
 - **Locks:** Step 1 takes `$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.lock` with `bkit locks acquire --kind=workflow` (hold `token`); Step 14 releases it via `bkit workflows close --flush --token=`, the **Failure Path** via `bkit workflows fail --token=`. **If** existing lock — its owning workflow's folded status.jsonl decides: `IN_PROGRESS` and last step <30min idle → **Failure Path**; any other holder (`DONE`, `FAILED`, `IN_PROGRESS` idle >=30min, no run) → reclaimed.
 - **Status branch:** From Step 2 all steps write `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (`{STATUS}`); `BOOK_ROOT` = `{WORKTREE_PATH}`. Stage path-scoped via `bkit ledgers commit`; NEVER stage all files (`-A`) or blanket `docs/`. One commit per flush block: Commit + Push Bookkeeping → `docs({FID}): ship bookkeeping bkit [skip ci]` → push `{SHIP_BRANCH}` (pre-merge: docs, logs, ledgers, skill removals); Close Workflow → `docs({FID}): ship DONE bkit [skip ci]`, **Failure Path** → `chore({FID}): ship FAILED bkit [skip ci]` → push `dev` from a throwaway `origin/dev` checkout; a refused close push → close PR.
@@ -218,10 +218,34 @@ $ARGUMENTS
    "{BKIT}" workflows input --workflow=ship --fid={FID} --run={RUN} --file="{STATUS}" --prompt-file="{SESSION_DIR}/prompt.md" --description-file="{SESSION_DIR}/issue-description.md" --comments-file="{SESSION_DIR}/issue-comments.json" --plan="docs/plans/{YYYYMM}/{FID}-plan.md" || exit 1
    ```
 2. Find the branch's PR — open first, then merged:
+   Reconcile and publish before probing or opening a PR, including on resume:
+
+   ```bash
+   "{BKIT}" branches sync --reconcile-feature --fid="{FID}" --file="{STATUS}"
+   ```
+
+   Route — first match wins:
+   - **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 2 → Step 4 sub-step 2.
+   - **If** exit 0 → hold `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD` → publish the resulting local head before sweep/docs bookkeeping.
+     ```bash
+     "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+     ```
+     Route:
+     **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
+   - **Else** → **Failure Path**.
+
    ```bash
-   "{BKIT}" prs probe --head="{SHIP_BRANCH}" --state=all
+   "{BKIT}" prs probe --head="{SHIP_BRANCH}" --base=dev --state=all --ship-entry --owner-repo="{OWNER_REPO}"
    ```
+
    Hold `number` as `PR_NUMBER`, `baseRefName` as `PR_BASE`, and hold `state`.
+   **If** exit 80 **or** `runtimeGithubCli` = false → read open PRs first, then merged PRs through MCP, independently reread the selected PR, and write `{ ownerRepo, headRefName, baseRefName: "dev", pr }` to `{OUTBOX}/ship-entry-facts.json`. `pr` is the complete `PrInfo` shape (`number`, `url`, `state`, `baseRefName`, `headRefName`, `headRefOid`, `title`, `mergeCommit`, `mergeable`), or null when neither exists. Record the single transport transition under **gh MCP fallback**, then use the engine's result:
+
+   ```bash
+   "{BKIT}" prs probe --head="{SHIP_BRANCH}" --base=dev --state=all --ship-entry --owner-repo="{OWNER_REPO}" --facts-file="{OUTBOX}/ship-entry-facts.json"
+   ```
+
+   Missing or mismatched facts → **Failure Path** before opening or merging anything. A merged PR with extra feature work returns exit 1: open a new PR, preserving that work.
    Route — first match wins:
    - **If** exit 0 **and** `PR_BASE` != dev → **Failure Path**.
    - **If** exit 0 → sub-step 3.
@@ -246,6 +270,7 @@ $ARGUMENTS
      Assert `PR_NUMBER` non-empty and `PR_BASE` = dev. **If** the assertion fails → **Failure Path**.
 
    - **Else** → **Failure Path**.
+
 3. Route:
    - **If** `state` = MERGED → record the resume marker → Step 13:
      ```bash
@@ -342,11 +367,21 @@ $ARGUMENTS
 
 ## 🤖 Step 3 — Base Check
 
-1. Determine whether `origin/dev` is an ancestor of the PR head:
+1. Reconcile again on every integration retry, then publish before selecting `BASE_PATH`:
+   ```bash
+   "{BKIT}" branches sync --reconcile-feature --fid="{FID}" --file="{STATUS}"
+   ```
+   Hold `basePath` as `BASE_PATH`, `reconciledHead` as `ENTRY_HEAD` and `CODE_HEAD`. **If** exit 24 → hold `target` as `MERGE_TARGET`, `pending` as `PENDING`, set `RECONCILE_NEXT` = Step 3 → Step 4 sub-step 2. **If** another non-zero exit → **Failure Path**.
+   ```bash
+   "{BKIT}" branches push --mode=plain --set-upstream --ahead-of=origin/dev >/dev/null
+   ```
+   Route:
+   **If** exit 81 → end turn, re-run this block. **If** another non-zero exit → **Failure Path**.
+   Compute the merge-aware feature coverage state:
    ```bash
-   "{BKIT}" branches sync --head="{ENTRY_HEAD}"
+   "{BKIT}" branches sync --feature-state --month="{YYYYMM}" --fid="{FID}"
    ```
-   Hold `basePath` as `BASE_PATH`.
+   Hold `featureCodeState` as `FEATURE_CODE_STATE`. Non-zero exit → **Failure Path**. Bookkeeping commits and proven automatic base-only merges retain coverage. New feature commits, imported feature merges and semantic conflict resolutions invalidate coverage. Unproven merge results remain in the state. Record this exact state with each successful sweep/docs completion below; read those rows from `{STATUS}` on resume.
 2. Route:
    - **If** `BASE_PATH` = A → Step 5 (skip integration — dev has not moved; no `bkit:generate`, because CI fails on a stale generated file and Step 10 regenerates when that is the only failure).
    - **If** `BASE_PATH` = B → Step 4 (integration required; its merge runs `bkit:generate`).
@@ -364,13 +399,17 @@ $ARGUMENTS
 
 ## 🧠 Step 4 — Integrate (Path B only)
 
-**Run only if** `BASE_PATH` = B.
+**Run only if** `BASE_PATH` = B **or** a feature reconciliation left `PENDING` conflicts.
 
 1. Merge `origin/dev` into `SHIP_BRANCH` locally. The block commits the run's uncommitted work first, unions the append-only ledgers, regenerates a conflicted lockfile from `dev`'s copy, rebuilds a conflicted generated register from `dev`'s copy, takes `dev`'s copy of the generated block in a conflicted embedding doc (a doc the register's script copies that block into) and merges the rest of that doc, merges a conflicted install record (`.bkit/version`) entry by entry with `dev`'s value where both sides changed an entry, runs a declared `bkit:generate`, and leaves every other conflict in the tree for sub-step 2. GitHub ignores `merge=union`, so the merged commit, not a server-side update or a rebase, is what makes the PR mergeable. No commit the block makes carries a skip token, so the sub-step 3 push starts CI at the merged head and Step 9 waits on that run:
    ```bash
-   cd "{WORKTREE_PATH}" && "{BKIT}" branches sync --merge --fid="{FID}" --file="{STATUS}" --sentinel="docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"
+   git rev-parse --verify origin/dev
    ```
-   Hold `outcome` as `MERGE_OUTCOME`, `pending` as `PENDING`.
+   Hold the printed commit as `MERGE_TARGET`.
+   ```bash
+   cd "{WORKTREE_PATH}" && "{BKIT}" branches sync --merge --fid="{FID}" --file="{STATUS}" --target="{MERGE_TARGET}" --sentinel="docs/plans/{YYYYMM}/logs/{FID}/.rebase-failed"
+   ```
+   Hold `outcome` as `MERGE_OUTCOME`, `pending` as `PENDING`, `target` as `MERGE_TARGET`, and `head` as `CODE_HEAD` and `ENTRY_HEAD`. Set `RECONCILE_NEXT` empty for this dev integration.
    Route:
    - **If** exit 0 **and** `MERGE_OUTCOME` = merged → sub-step 3.
    - **If** exit 0 **and** `MERGE_OUTCOME` = current → Step 5. `dev` has not moved since Step 3.
@@ -378,7 +417,7 @@ $ARGUMENTS
    - **Else** → **Failure Path**. The block aborted the merge and wrote the sentinel.
 2. Resolve the conflicts the block left:
    1. **Subagent:** Invoke `/bkit-ship-conflict-resolve` using `subagent` tool:
-      Context: You are a subagent in the Ship phase. A merge of `origin/dev` is in progress with conflicts outside the ledgers, the lockfile, the generated register, the embedding docs and the install record: `{PENDING}`. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
+      Context: You are a subagent in the Ship phase. A merge of the engine-recorded target `{MERGE_TARGET}` is in progress with conflicts outside the ledgers, the lockfile, the generated register, the embedding docs and the install record: `{PENDING}`. Continue only this target. Switch into the working directory with `cd "{WORKTREE_PATH}"`, check it with `pwd`, and use it for every file operation that follows.
       Read: `docs/plans/{YYYYMM}/logs/{FID}/ship-input-{RUN}.md`, `docs/plans/{YYYYMM}/{FID}-plan.md` (if present), `{STATUS}`.
       Update: Conflicted source files.
       Create: `docs/plans/{YYYYMM}/logs/{FID}/ship-conflict-resolve.md`.
@@ -389,14 +428,18 @@ $ARGUMENTS
    3. **If** `verdict` = PASS → sub-step 3. The subagent's re-run of the block committed the merge.
       **Else** → **Failure Path** (non-mechanical conflict → handover).
 3. Push the merged branch. The merge adds commits on top of the pushed head, so the push is plain, NEVER forced:
+
    ```bash
    "{BKIT}" branches push --mode=plain >/dev/null
    ```
+
    Route:
    - **If** exit 81 → end turn, re-run this block.
    - **If** exit 0 → continue with the next instruction.
    - **Else** → **Failure Path**.
 
+   **If** `RECONCILE_NEXT` is held → return there and reconcile again. **Else** → refresh `ENTRY_HEAD` and `CODE_HEAD` with `git rev-parse HEAD` → Step 5, which recomputes coverage after the integration and any conflict resolution.
+
 ### 🔒 Gate 4 — Integrate
 
 - [ ] Path classified
@@ -409,10 +452,15 @@ $ARGUMENTS
 
 ## 🤖 Step 5 — Deferred Sweep
 
-1. Fast-forward to the PR head, never onto a diverged branch:
-   ```bash
-   "{BKIT}" branches fast-forward --onto="origin/{SHIP_BRANCH}" >/dev/null || exit $?
-   ```
+Recompute coverage immediately before deciding whether to reuse the sweep:
+
+```bash
+"{BKIT}" branches sync --feature-state --month="{YYYYMM}" --fid="{FID}"
+```
+
+Refresh `FEATURE_CODE_STATE` from `featureCodeState`; non-zero exit → **Failure Path**.
+
+1. Read the latest successful `ship-feature-coverage` row for `step=ship-deferred-sweep` from `{STATUS}`. **If** its recorded feature-code state matches `FEATURE_CODE_STATE` and its artifact still exists → reuse it and skip to Step 6. **If** the state changed, differs or is missing → invoke the sweep again below. Never reuse a completion from a different feature state.
 2. Check for the plan:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" fids plans --fid="{FID}" --month="{YYYYMM}"
@@ -437,7 +485,10 @@ $ARGUMENTS
    "{BKIT}" steps finish --workflow=ship --step=ship-deferred-sweep --file="{STATUS}" --agent=bkit-ship-deferred-sweep --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-deferred-sweep.md" --commit=none --number=5 --post --title="Deferred Sweep"
    ```
 4. Route:
-   - **If** `verdict` = PASS → Step 6.
+   - **If** `verdict` = PASS → record the covered feature-code state → Step 6:
+     ```bash
+     "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=ship-feature-coverage --field=step=ship-deferred-sweep --field="featureCodeState={FEATURE_CODE_STATE}" >/dev/null || exit 1
+     ```
    - **If** `verdict` = FAIL → write the `.deferred-blocked` sentinel below under `BOOK_ROOT`, then **Failure Path**.
      ```bash
      touch "{BOOK_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/.deferred-blocked"
@@ -446,7 +497,7 @@ $ARGUMENTS
 
 ### 🔒 Gate 5 — Deferred Sweep
 
-- [ ] Worktree fast-forwarded
+- [ ] Reconciled feature-code state compared with recorded sweep coverage
 - [ ] Subagent invoked (`@bkit-ship-deferred-sweep`, no inline work)
 - [ ] Mechanical checks passed (`steps finish`)
 
@@ -454,6 +505,16 @@ $ARGUMENTS
 
 ## 🧠 Step 6 — Update Docs & Summary
 
+Refresh coverage again before deciding whether to reuse the docs artifact:
+
+```bash
+"{BKIT}" branches sync --feature-state --month="{YYYYMM}" --fid="{FID}"
+```
+
+Hold the current `featureCodeState` as `FEATURE_CODE_STATE`; non-zero exit → **Failure Path**.
+
+Read the latest successful `ship-feature-coverage` row for `step=ship-update-docs` from `{STATUS}`. **If** its recorded feature-code state matches `FEATURE_CODE_STATE` and the docs artifact exists → reuse it and skip sub-steps 1–3. **If** the state changed, differs or is missing → run the docs agent again. Always refresh the summary in sub-step 4.
+
 1. Write the FID's deferral lines to the artifact the docs agent reads `Pending Items` from:
    ```bash
    cd "{WORKTREE_PATH}" && "{BKIT}" context ledger-scan --terms="{FID}" --source=docs/deferrals.jsonl --artifact="{OUTBOX}/ship-pending-items.md" --fid={FID} --step=ship-update-docs --reset-log >/dev/null || exit 1
@@ -467,6 +528,7 @@ $ARGUMENTS
    ```bash
    "{BKIT}" roadmap feature --root="{WORKTREE_PATH}" --workflow=ship --fid="{FID}" --step=ship-update-docs --strict >/dev/null || exit 1
    "{BKIT}" steps finish --workflow=ship --step=ship-update-docs --file="{STATUS}" --artifact="docs/plans/{YYYYMM}/logs/{FID}/ship-update-docs.md" --commit=none || exit 1
+   "{BKIT}" status row --file="{STATUS}" --workflow=ship --type=ship-feature-coverage --field=step=ship-update-docs --field="featureCodeState={FEATURE_CODE_STATE}" >/dev/null || exit 1
    ```
 4. Write `ship-summary.md` from this run's status rows and the PR's size:
    ```bash
@@ -538,6 +600,8 @@ $ARGUMENTS
 
 ## 🤖 Step 9 — Re-validate
 
+**If** `RECONCILE_REQUIRED` = true → clear it → Step 3 before validation. A previous `DONE` row alone never proves coverage of imported feature code.
+
 1. Resolve the head CI must pass at. The block re-validates when the code moved **or** `REVALIDATE_REASON` = `gate-refusal`: it probes for a run at it first, dispatches only when none, and waits for it to complete. Drop `--reason` when `REVALIDATE_REASON` is empty:
    ```bash
    "{BKIT}" runs revalidate --pr="{PR_NUMBER}" --entry-head="{ENTRY_HEAD}" --code-head="{CODE_HEAD}" --branch="{SHIP_BRANCH}" --month="{YYYYMM}" --fid="{FID}" --file="{STATUS}" --reason="{REVALIDATE_REASON}" --repo="{OWNER_REPO}"
@@ -559,10 +623,22 @@ $ARGUMENTS
 
 1. Assert the gate at the PR's current head, with CI checked at `VALIDATED_HEAD`. This gate is the ONLY merge precondition. The block writes the pre-merge snapshot to the outbox before the gate decides, refuses a title that carries a skip token (18), and records a refusal in `{STATUS}`:
    ```bash
-   "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fetch --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
+   "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fetch --fresh-base --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
+   ```
+   **If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
+   ```bash
+   "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fresh-base --facts-file="{OUTBOX}/ship-gate-facts.json" --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
    ```
    Route:
    - **If** exit 0 → hold `mergeHead` as `GATE_HEAD` → sub-step 2.
+   - **If** exit 19 (stale base) → the gate already recorded one failed arrival; route to integration:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path**, preserving the branch and worktree on exhaustion.
    - **If** exit 11 (in progress — poll), 14 (stale green), 10 (no run) **or** 17 (non-bookkeeping change past `VALIDATED_HEAD`) → route on the failed arrivals at Step 10, without asking:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
@@ -605,12 +681,16 @@ $ARGUMENTS
    ```
    Hold `state` as `STATE`, `labels` as `LABELS`. **If** exit 80 → read them via the tracker MCP (**Tracker**).
    ```bash
-   "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --delete-branch {LABEL_FLAGS} --expect-merged
+   "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --ship-retry --owner-repo="{OWNER_REPO}" {LABEL_FLAGS} --expect-merged
    ```
    Route:
-   - **If** exit 0 **or** 7 → hold `verdict` as `MERGE_VERDICT`, `failures` as `MERGE_FAILURES`, and hold `state`.
-   - **If** exit 80 → `pull_request_read` (`get`) and assert `base.ref` = `dev`; mismatch → **Failure Path** with nothing merged; then `merge_pull_request` and read `state` back through `pull_request_read` → `MERGE_VERDICT` = PASS and `MERGE_FAILURES` = 0 when merged, else FAIL and 1.
-   - **Else** (8: the PR's base is not `dev`, nothing merged) → **Failure Path**.
+   - **If** exit 0, 5, 7, 8, 9 **or** 10 → hold `route` as `MERGE_ROUTE`, `reason` as `MERGE_REASON`, `verdict` as `MERGE_VERDICT`, `failures` as `MERGE_FAILURES`, and hold `state` → sub-step 3. Missing output fields → **Failure Path**.
+   - **If** exit 80 **or** `runtimeGithubCli` = false → read fresh pre-attempt PR facts through `pull_request_read` (`get`). Refresh the scoped gate facts above with this PR, fresh CI and base evidence, and run that engine gate again before mutation. Only exit 0 authorizes `merge_pull_request`, with `sha` = the newly printed `GATE_HEAD`, the skip-token-free PR subject and an empty body. A gate refusal takes sub-step 1's route and consumes only its existing refusal row. After the attempt, independently reread post-attempt PR state through `pull_request_read`; never copy the mutation response or pre-attempt facts into `after`. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", matchHead, before, after }` to `{OUTBOX}/ship-merge-facts.json`, with complete `PrInfo` values for both reads and `matchHead` = `GATE_HEAD`. Missing or mismatched evidence → **Failure Path**. Record the single transport transition under **gh MCP fallback**, then classify without a second mutation:
+     ```bash
+     "{BKIT}" prs merge --number="{PR_NUMBER}" --match-head="{GATE_HEAD}" --ship-retry --owner-repo="{OWNER_REPO}" --facts-file="{OUTBOX}/ship-merge-facts.json" {LABEL_FLAGS} --expect-merged
+     ```
+     Hold the same route, reason, verdict, failures and state as the gh-backed result → sub-step 3.
+   - **Else** → **Failure Path**.
 3. Finish (bookkeeping to `$BOOK_ROOT`):
    ```bash
    "{BKIT}" steps finish --workflow=ship --step=ship-merge-pr --file="{STATUS}" --verdict={MERGE_VERDICT} --failures={MERGE_FAILURES} --attempt=next --commit=none --number=10 --post --title="Merge Gate + Merge PR"
@@ -618,15 +698,24 @@ $ARGUMENTS
    Hold `attempt` as `MERGE_ATTEMPT`.
 4. Route:
    - **If** `state` = MERGED → Step 13.
-   - **If** `state` != MERGED → run counter routing:
+   - **If** `MERGE_ROUTE` = revalidate (exit 9) → Step 9 through the durable counter:
      ```bash
-     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-11 --exceeded=failure-path
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
      ```
      Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
-     - **If** exit 0 → Step 11.
-     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 11 → **Merge Question**.
+     Set `RECONCILE_REQUIRED` = true and `REVALIDATE_REASON` = gate-refusal, so imported feature work passes the state comparison and sweep/docs gates before CI.
+     - **If** exit 0 → Step 9.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 9 → **Merge Question**.
      - **Else** → **Failure Path** (exit 1: `ship.merge.maxAttempts` used up, max-retry exhaustion).
-   - **Else** → **Failure Path**.
+   - **If** `MERGE_ROUTE` = integrate (exit 10) → Step 3 through the same durable counter:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path** on exhaustion.
+   - **Else** → terminal stop → **Failure Path**, naming `MERGE_REASON`. Recoverable merge refusals never enter Steps 11–12. Each attempted merge is counted by its one `ship-merge-pr` row; each refused gate is counted by its one `ship-gate-refusal` row. Do not add another refusal row for either event.
 
 ### 🔒 Gate 10 — Merge Gate + Merge PR
 
@@ -787,7 +876,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
    "{BKIT}" runs gate --squash-of="{PR_NUMBER}" --repo="{OWNER_REPO}" --capstone-only --record="{STATUS}"
    ```
    Hold `head` as `SQUASH_SHA`.
-2. Close the run. The block keeps the summary in the outbox (the close removes the worktree it lives in), lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, removes the worktree and `SHIP_BRANCH`, and returns to `REPO_ROOT`:
+2. Close the run. The block keeps the summary in the outbox, lands `docs({FID}): ship DONE bkit [skip ci]` on `dev` (a refused push opens a `ship-close/{FID}` PR), releases the lock, and returns to `REPO_ROOT`. Guarded cleanup removes only a clean worktree and a local branch whose inspected content is landed, binding local deletion to the inspected tip. It preserves dirty or unlanded work and reports retained paths/refs. The remote feature branch is retained when conditional deletion cannot be guaranteed; this does not block close-record landing or lock release. Repository-managed automatic branch deletion is a separate GitHub setting outside this cleanup guarantee:
    **If** the no-issue warning was emitted → add `--warning="<that warning>"`.
    ```bash
    "{BKIT}" workflows close --workflow=ship --fid="{FID}" --month="{YYYYMM}" --file="{STATUS}" --pr-number="{PR_NUMBER}" --squash-sha="{SQUASH_SHA}" --owner-repo="{OWNER_REPO}" --outbox="{OUTBOX}" --flush --token="{LOCK_TOKEN}" --branch="{SHIP_BRANCH}" --number=14 --post --title="Close Workflow" --final-return --summary="docs/plans/{YYYYMM}/logs/{FID}/ship-summary.md" --summary-missing="PR was already merged — no ship summary this run." --session-dir="{SESSION_DIR}"; rc=$?
@@ -813,7 +902,7 @@ Asked from Step 10 when `ship.merge.maxAttempts` is used up (`LIMIT_NEXT` held)
 
 - [ ] Squash-merge CI capstone green (`runs gate`)
 - [ ] Close landed (`workflows close`)
-- [ ] Worktree removed and feature branch deleted, back in the repo root
+- [ ] Guarded cleanup and retained paths/refs reported, back in the repo root
 - [ ] Mechanical checks passed (`steps gate`)
 - [ ] Logs retained
 - [ ] Final return displayed
diff --git a/dist/commands/workflow/branches.js b/dist/commands/workflow/branches.js
index b54bbe08b..2c1841f86 100644
--- a/dist/commands/workflow/branches.js
+++ b/dist/commands/workflow/branches.js
@@ -23,7 +23,7 @@ import { bkitVersionStatus } from "../../shared/bkit-latest.js";
 import { parseBkitVersion, serializeBkitVersion, } from "../../install/version-file.js";
 import { DEV_REFSPEC, fetchDev, landBackoffMs, landDir, pushToDev, sleep } from "../land.js";
 import { TIMEOUTS } from "../../shared/timeouts.js";
-import { activeRecord, commitBookkeeping, markRecordPushed, recordOnBranch, } from "./ledgers.js";
+import { activeRecord, bookPathspecs, checkOnlyBookkeeping, commitBookkeeping, markRecordPushed, recordOnBranch, } from "./ledgers.js";
 import { releaseLock, resolveMonth, workflowLockPath } from "./locks.js";
 import { EXIT_BASE_NOT_DEV, FORCE_BUILD, closeTransportRow, crossCheckRows, mergePr, openPrFor, probePr, } from "./prs.js";
 import { AUTO_LABEL, AUTO_ROUTE_SUFFIX } from "./issues.js";
@@ -1954,8 +1954,40 @@ function reconcileFeature(ctx, top, branch, observed) {
         throw new CommandError(EXIT.USAGE, `--head ${headFlag} does not name a commit`);
     }
     if (!mergeInProgress(top) && hasLeftovers(top)) {
-        ctx.log("feature branch has uncommitted work — commit that work before reconciliation");
-        return EXIT_REFUSED;
+        const statusFile = str(ctx.flags.file);
+        const relative = statusFile && path.relative(top, path.resolve(ctx.cwd, statusFile)).split(path.sep).join("/");
+        const scope = relative && /^docs\/plans\/(\d{6})\/logs\/([^/]+)\/status\.jsonl$/.exec(relative);
+        const fid = str(ctx.flags.fid) || branch.replace(/^feat\//, "");
+        if (!scope || scope[2] !== fid) {
+            ctx.log("feature branch has uncommitted work — commit that work before reconciliation");
+            return EXIT_REFUSED;
+        }
+        const outside = runGit(top, [
+            "status",
+            "--porcelain=v1",
+            "-z",
+            "--untracked-files=all",
+            "--",
+            ".",
+            ...copyExcludes(top),
+            ...bookPathspecs(scope[1], fid, "core").map((spec) => `:(exclude)${spec}`),
+        ]);
+        if (!outside.ok || outside.stdout !== "") {
+            ctx.log("feature branch has unrelated uncommitted work — commit that work before reconciliation");
+            return EXIT_REFUSED;
+        }
+        const carried = commitBookkeeping({
+            root: top,
+            month: scope[1],
+            fid,
+            scope: "core",
+            mode: "commit",
+            message: `chore(${fid}): carry ship bookkeeping before reconciliation`,
+        }, ctx.log);
+        if (carried.outcome !== "committed") {
+            ctx.log("the workflow bookkeeping could not be committed before reconciliation");
+            return EXIT_REFUSED;
+        }
     }
     const fid = str(ctx.flags.fid) || branch.replace(/^feat\//, "");
     const merge = (target, current) => {
@@ -2024,10 +2056,47 @@ function reconcileFeature(ctx, top, branch, observed) {
     }
     return EXIT.OK;
 }
+/** Merge-aware coverage identity; omit a dev merge only when Git proves its result automatic. */
+function featureCodeState(top, head, month, fid) {
+    const commits = runGit(top, ["rev-list", "--parents", `${UPSTREAM}..${head}`]);
+    if (!commits.ok)
+        throw new CommandError(EXIT_DIFF_FAILED, commits.stderr);
+    const retained = [];
+    for (const line of commits.stdout.split("\n").filter(Boolean)) {
+        const [sha, first, second, ...other] = line.split(" ");
+        if (!sha || !first)
+            throw new CommandError(EXIT_DIFF_FAILED, "feature coverage needs readable commit parents");
+        const bookkeeping = checkOnlyBookkeeping(top, { month, fid, from: first, to: sha });
+        if (bookkeeping.kind === "ok")
+            continue;
+        if (bookkeeping.kind !== "outside")
+            throw new CommandError(EXIT_DIFF_FAILED, `feature coverage classification: ${bookkeeping.kind}`);
+        if (second && other.length === 0) {
+            const devParent = runGit(top, ["merge-base", "--is-ancestor", second, UPSTREAM]);
+            if (devParent.ok) {
+                const automatic = git(top, ["merge-tree", "--write-tree", first, second]);
+                const tree = git(top, ["rev-parse", `${sha}^{tree}`]);
+                if (automatic && tree && automatic.split("\n")[0] === tree)
+                    continue;
+            }
+        }
+        retained.push(sha);
+    }
+    return `v1:${retained.sort().join(",")}`;
+}
 function syncVerb(ctx) {
     const mergeDocs = ctx.flags.mergeDocs === true;
     const merge = ctx.flags.merge === true;
     const reconcile = ctx.flags.reconcileFeature === true;
+    const featureState = ctx.flags.featureState === true;
+    const month = str(ctx.flags.month);
+    const coverageFid = str(ctx.flags.fid);
+    if (featureState &&
+        (mergeDocs || merge || reconcile || !month || !/^\d{6}$/.test(month) || !coverageFid))
+        throw new CommandError(EXIT.USAGE, "--feature-state needs --month=YYYYMM and --fid, separately from reconciliation or merging");
+    const targetFlag = str(ctx.flags.target);
+    if (targetFlag !== undefined && (!merge || targetFlag === "" || targetFlag.startsWith("-")))
+        throw new CommandError(EXIT.USAGE, "--target needs --merge and a commit ref");
     if (reconcile && (mergeDocs || merge))
         throw new CommandError(EXIT.USAGE, "give --reconcile-feature separately from --merge or --merge-docs");
     const headFlag = str(ctx.flags.head);
@@ -2041,6 +2110,11 @@ function syncVerb(ctx) {
     if (merge && sentinelPath)
         fs.rmSync(sentinelPath, { force: true });
     const top = topLevel(ctx.cwd);
+    const target = targetFlag === undefined
+        ? undefined
+        : git(top, ["rev-parse", "--verify", "--quiet", `${targetFlag}^{commit}`]);
+    if (targetFlag !== undefined && !target)
+        throw new CommandError(EXIT.USAGE, `--target ${targetFlag} does not name a commit`);
     const fetch = fetchDev(top);
     if (!fetch.ok) {
         ctx.log(`git fetch ${REMOTE} ${DEV} failed: ${fetch.stderr}`);
@@ -2075,6 +2149,9 @@ function syncVerb(ctx) {
         branch: branch === "" ? null : branch,
         head,
         ...(reconcile ? { remoteHead: observed.remoteHead, reconciledHead: head } : {}),
+        ...(featureState
+            ? { featureCodeState: featureCodeState(top, head, month, coverageFid) }
+            : {}),
         basePath: ancestor.status === 0 ? "A" : "B",
         behind,
         docsBehind,
@@ -2109,7 +2186,16 @@ function syncVerb(ctx) {
             throw new CommandError(EXIT.USAGE, `--merge merges ${UPSTREAM} into a feature branch, never into ${branch}`);
         }
         const fid = str(ctx.flags.fid) || branch.replace(/^feat\//, "");
-        const m = mergeDev(top, { branch, policy: "full", fid, generate: true, current: out.basePath === "A" }, ctx.log);
+        const m = mergeDev(top, {
+            branch,
+            policy: "full",
+            fid,
+            generate: true,
+            ...(target ? { target } : {}),
+            current: target
+                ? runGit(top, ["merge-base", "--is-ancestor", target, "HEAD"]).ok
+                : out.basePath === "A",
+        }, ctx.log);
         const refused = m.outcome === "refused";
         if (refused && sentinelPath) {
             fs.mkdirSync(path.dirname(sentinelPath), { recursive: true });
@@ -2118,6 +2204,7 @@ function syncVerb(ctx) {
         const newHead = git(top, ["rev-parse", "HEAD"]) ?? head;
         ctx.emit({
             ...out,
+            ...(target ? { target } : {}),
             head: newHead,
             merged: m.merged,
             resolved: m.resolved,
@@ -2754,6 +2841,12 @@ export const branchesCommand = {
             summary: `Fetch ${UPSTREAM}; report whether it is an ancestor of HEAD (Path A/B) and how far docs/ and the ledgers are behind; optionally merge it in.`,
             use: "workflow",
             flags: [
+                {
+                    name: "feature-state",
+                    type: "boolean",
+                    help: "report merge-aware feature coverage, excluding bookkeeping and proven automatic dev-only merges; needs --month and --fid",
+                },
+                { name: "month", type: "string", help: "--feature-state: bookkeeping month YYYYMM" },
                 {
                     name: "reconcile-feature",
                     type: "boolean",
@@ -2769,6 +2862,11 @@ export const branchesCommand = {
                     type: "boolean",
                     help: `ship Step 4: merge ${UPSTREAM} into the checked-out feature branch — the run's uncommitted work is committed first, ledger conflicts union, a lockfile regenerates from ${DEV}'s copy, a generated register takes ${DEV}'s copy and is rebuilt after the merge, a doc embedding the register's generated block takes ${DEV}'s block and merges the rest, the install record (.bkit/version) merges entry by entry with ${DEV}'s value where both changed, any other conflict stays in the tree with the merge in progress for a hand resolution (exit 24; run again after git add), then a declared bkit:generate runs and its output is committed; never a rebase or force-push, never on ${DEV} / main`,
                 },
+                {
+                    name: "target",
+                    type: "string",
+                    help: "--merge: exact recorded merge target (default origin/dev); continuation refuses a different MERGE_HEAD",
+                },
                 {
                     name: "merge-docs",
                     type: "boolean",
@@ -2795,6 +2893,8 @@ export const branchesCommand = {
                 head: "commit compared (after a merge: the new HEAD)",
                 remoteHead: "--reconcile-feature: the freshly observed remote feature commit, or null when absent",
                 reconciledHead: "--reconcile-feature: the resulting local feature commit used for base classification",
+                featureCodeState: "--feature-state: versioned identity of feature commits and semantic merge results",
+                target: "--merge --target: the resolved commit being merged or continued",
                 basePath: `A when ${UPSTREAM} is an ancestor of head (nothing to integrate), else B`,
                 behind: `commits on ${UPSTREAM} not in head`,
                 docsBehind: `of those, commits touching docs/ or a ledger path (LEDGERS)`,
@@ -2809,6 +2909,7 @@ export const branchesCommand = {
                 sentinel: "--merge: the sentinel written on refusal (null otherwise)",
             },
             exitCodes: {
+                [EXIT_DIFF_FAILED]: "--feature-state: commit ancestry or bookkeeping classification could not be read",
                 [EXIT_REFUSED]: "--merge: the uncommitted work could not be committed before the merge",
                 [EXIT_DETACHED]: "--merge / --merge-docs with no branch checked out",
                 [EXIT_FETCH_FAILED]: `git fetch ${REMOTE} ${DEV} failed`,
diff --git a/dist/commands/workflow/prs.js b/dist/commands/workflow/prs.js
index 3560e2712..9d2db0106 100644
--- a/dist/commands/workflow/prs.js
+++ b/dist/commands/workflow/prs.js
@@ -103,7 +103,7 @@ export function probePr(cwd, opts) {
         : (prs.find((p) => p.state === "OPEN") ?? prs.find((p) => p.state === "MERGED"));
     return qualify(pr);
 }
-function validPrFacts(value) {
+export function validPrFacts(value) {
     if (typeof value !== "object" || value === null)
         return false;
     return ("number" in value &&
@@ -430,7 +430,11 @@ export const EXIT_BASE_NOT_DEV = 8;
  * EXIT.USE_MCP (merge through `merge_pull_request` with `subject`).
  */
 export function mergePr(cwd, o, log) {
-    const read = () => probePr(cwd, { number: o.number, state: "open" });
+    if (o.shipRetry && !o.matchHead)
+        throw new CommandError(EXIT.USAGE, "--ship-retry requires --match-head");
+    if (o.shipRetry && o.deleteBranch)
+        throw new CommandError(EXIT.USAGE, "--ship-retry leaves branch cleanup to guarded workflow close");
+    const read = () => probePr(cwd, { number: o.number, state: "open", repo: o.repo });
     const result = (code, pr, already) => {
         const merged = pr?.state === "MERGED";
         return {
@@ -443,17 +447,81 @@ export function mergePr(cwd, o, log) {
                 subject: o.subject,
                 verdict: merged ? "PASS" : "FAIL",
                 failures: merged ? 0 : 1,
+                ...(o.shipRetry
+                    ? {
+                        route: merged ? "merged" : "stop",
+                        reason: merged ? "PR merged" : "merge refused",
+                    }
+                    : {}),
             },
         };
     };
-    const before = read();
+    const stop = (code, reason, pr) => {
+        log(reason);
+        const r = result(code, pr, false);
+        return o.shipRetry ? { ...r, out: { ...r.out, route: "stop", reason } } : r;
+    };
+    const classify = (pr) => {
+        if (!o.shipRetry || pr?.state === "MERGED")
+            return result(EXIT.OK, pr, false);
+        if (pr?.baseRefName !== DEV)
+            return stop(EXIT_BASE_NOT_DEV, "merge reread base is not dev", pr);
+        if (pr.state !== "OPEN")
+            return stop(EXIT_NOT_MERGED, "merge refused: PR is not open", pr);
+        if (!/^[0-9a-f]{40,64}$/i.test(pr.headRefOid))
+            return stop(EXIT_GH_FAILED, "merge head reread is unavailable", pr);
+        const moved = pr.headRefOid !== o.matchHead;
+        const conflict = pr.mergeable === "CONFLICTING";
+        if (!moved && !conflict)
+            return stop(EXIT_NOT_MERGED, "merge refused without a moved head or new dev conflict", pr);
+        const reason = moved
+            ? "PR head moved after validation; revalidate the new head"
+            : "PR conflicts with dev; integrate the fresh base";
+        log(reason);
+        const r = result(moved ? 9 : 10, pr, false);
+        return { ...r, out: { ...r.out, route: moved ? "revalidate" : "integrate", reason } };
+    };
+    let before;
+    let afterFacts;
+    if (o.facts !== undefined) {
+        const facts = o.facts;
+        if (!o.shipRetry ||
+            !o.repo ||
+            typeof facts !== "object" ||
+            facts === null ||
+            !("ownerRepo" in facts) ||
+            facts.ownerRepo !== o.repo ||
+            !("prNumber" in facts) ||
+            facts.prNumber !== Number(o.number) ||
+            !("matchHead" in facts) ||
+            facts.matchHead !== o.matchHead ||
+            !("headRefName" in facts) ||
+            typeof facts.headRefName !== "string" ||
+            !("baseRefName" in facts) ||
+            facts.baseRefName !== DEV ||
+            !("before" in facts) ||
+            !validPrFacts(facts.before) ||
+            !("after" in facts) ||
+            !validPrFacts(facts.after) ||
+            [facts.before, facts.after].some((pr) => pr.number !== Number(o.number) ||
+                prRepoSlug(pr.url) !== o.repo ||
+                pr.headRefName !== facts.headRefName ||
+                pr.baseRefName !== DEV) ||
+            facts.before.headRefOid !== o.matchHead ||
+            facts.before.state !== "OPEN")
+            return stop(EXIT_GH_FAILED, "merge facts scope or independent post-attempt reread is unavailable or mismatched");
+        before = { kind: "ok", pr: facts.before };
+        afterFacts = facts.after;
+    }
+    else
+        before = read();
     if (before.kind === "unavailable") {
         log(`${before.message} — merge through merge_pull_request with this subject and an empty body`);
         return result(EXIT.USE_MCP, undefined, false);
     }
     if (before.kind === "failed") {
         log(before.message);
-        return result(EXIT_GH_FAILED, undefined, false);
+        return stop(EXIT_GH_FAILED, before.message);
     }
     if (before.pr?.state === "MERGED")
         return result(EXIT.OK, before.pr, true);
@@ -461,7 +529,17 @@ export function mergePr(cwd, o, log) {
         log(`refusing to merge PR ${o.number}: its base is ${before.pr?.baseRefName ?? "unknown"}, not ${DEV} — bkit merges into ${DEV} only, releases stay manual`);
         return result(EXIT_BASE_NOT_DEV, before.pr, false);
     }
+    if (o.shipRetry &&
+        (before.pr.number !== Number(o.number) ||
+            (o.repo !== undefined && prRepoSlug(before.pr.url) !== o.repo)))
+        return stop(EXIT_GH_FAILED, "merge pre-attempt PR repository or number scope mismatch", before.pr);
+    if (o.shipRetry && before.pr.headRefOid !== o.matchHead)
+        return classify(before.pr);
+    if (afterFacts !== undefined)
+        return classify(afterFacts);
     const args = ["pr", "merge", o.number, "--squash", "--subject", o.subject, "--body", ""];
+    if (o.repo !== undefined)
+        args.push("--repo", o.repo);
     if (o.deleteBranch === true)
         args.push("--delete-branch");
     if (o.matchHead !== undefined)
@@ -475,16 +553,20 @@ export function mergePr(cwd, o, log) {
         log(`gh pr merge ${o.number} failed: ${merged.stderr || `exit ${String(merged.status)}`}`);
     const after = read();
     if (after.kind !== "ok") {
-        log(after.message);
-        return result(EXIT_GH_FAILED, undefined, false);
+        return stop(EXIT_GH_FAILED, `merge state reread unavailable: ${after.message}`);
     }
+    if (o.shipRetry &&
+        (after.pr?.number !== Number(o.number) ||
+            after.pr.headRefName !== before.pr.headRefName ||
+            (o.repo !== undefined && prRepoSlug(after.pr.url) !== o.repo)))
+        return stop(EXIT_GH_FAILED, "merge post-attempt PR repository, number or branch scope mismatch", after.pr);
     // A retarget between the base check and the merge is caught here, loudly.
     if (after.pr?.state === "MERGED" && after.pr.baseRefName !== DEV) {
         log(`INTEGRITY FAILURE: PR ${o.number} merged into ${after.pr.baseRefName ?? "an unknown base"}, not ${DEV} — its base changed after the check; revert the merge`);
         const r = result(EXIT_BASE_NOT_DEV, after.pr, false);
         return { ...r, out: { ...r.out, verdict: "FAIL", failures: 1 } };
     }
-    return result(EXIT.OK, after.pr, false);
+    return classify(after.pr);
 }
 /** Whether dev demands status checks (ruleset or branch protection): CI must then pass at the PR head. */
 export function devRequiresChecks(gh, repo) {
@@ -914,6 +996,21 @@ export const prsCommand = {
             summary: "Squash-merge a PR with an empty body (skipped when already MERGED) and read its state back.",
             use: "workflow",
             flags: [
+                {
+                    name: "ship-retry",
+                    type: "boolean",
+                    help: "ship only: classify independently re-read merge refusals as revalidate (9), integrate (10), or stop (7)",
+                },
+                {
+                    name: "facts-file",
+                    type: "string",
+                    help: "with --ship-retry: scoped pre-attempt and independent post-attempt MCP PR facts; classify without another mutation",
+                },
+                {
+                    name: "owner-repo",
+                    type: "string",
+                    help: "owner/repo for the merge and scoped MCP facts",
+                },
                 { name: "number", type: "string", required: true, help: "the PR number" },
                 {
                     name: "subject",
@@ -946,19 +1043,37 @@ export const prsCommand = {
                 subject: "the squash subject used",
                 verdict: "PASS when merged, else FAIL",
                 failures: "0 when merged, else 1",
+                route: "--ship-retry: merged | revalidate | integrate | stop",
+                reason: "--ship-retry: the reread decision or refusal",
             },
             exitCodes: {
                 [EXIT_GH_FAILED]: "gh could not read the PR",
                 [EXIT_NOT_MERGED]: "--expect-merged and the PR did not reach MERGED",
                 [EXIT_BASE_NOT_DEV]: `the PR's base is not ${DEV}, or could not be read — nothing merged`,
+                9: "--ship-retry: PR head moved; revalidate",
+                10: "--ship-retry: new dev conflict; integrate",
             },
             run: (ctx) => {
                 const number = String(ctx.flags.number);
                 if (!/^[1-9][0-9]*$/.test(number))
                     throw new CommandError(EXIT.USAGE, "--number must be a PR number");
+                const factsPath = str(ctx.flags.factsFile);
+                const parsed = factsPath === undefined
+                    ? undefined
+                    : parseJson(fs.readFileSync(path.resolve(ctx.cwd, factsPath), "utf-8"));
+                if (parsed !== undefined && !parsed.ok)
+                    throw new CommandError(EXIT.USAGE, "merge facts JSON is unreadable");
+                const facts = parsed?.ok ? parsed.value : undefined;
                 let subject = str(ctx.flags.subject);
                 if (subject === undefined) {
-                    const pr = probePr(ctx.cwd, { number, state: "open" });
+                    const candidate = typeof facts === "object" && facts !== null && "before" in facts
+                        ? facts.before
+                        : undefined;
+                    const pr = facts !== undefined
+                        ? validPrFacts(candidate)
+                            ? { kind: "ok", pr: candidate }
+                            : { kind: "failed", message: "merge facts pre-attempt PR is unreadable" }
+                        : probePr(ctx.cwd, { number, state: "open", repo: str(ctx.flags.ownerRepo) });
                     if (pr.kind === "unavailable") {
                         ctx.log(`${pr.message} — merge through merge_pull_request`);
                         return EXIT.USE_MCP;
@@ -976,6 +1091,9 @@ export const prsCommand = {
                     subject,
                     matchHead: str(ctx.flags.matchHead),
                     deleteBranch: ctx.flags.deleteBranch === true,
+                    shipRetry: ctx.flags.shipRetry === true,
+                    repo: str(ctx.flags.ownerRepo),
+                    facts,
                 }, ctx.log);
                 ctx.emit(r.out);
                 if (r.code !== EXIT.OK)
diff --git a/dist/commands/workflow/runs.js b/dist/commands/workflow/runs.js
index 2cf36dfc2..8a73d2d2b 100644
--- a/dist/commands/workflow/runs.js
+++ b/dist/commands/workflow/runs.js
@@ -30,7 +30,7 @@ import { FID_PATTERNS, fromBranch, fromMarker, issueIdOf, readIssueTracker } fro
 import { AUTO_LABEL, AUTO_ROUTE_SUFFIX } from "./issues.js";
 import { fetchRemoteRef, pushBranch } from "./branches.js";
 import { activeRecord, checkOnlyBookkeeping, retriggerCommit } from "./ledgers.js";
-import { closeTransportRow, crossCheckFile, devRequiresChecks, prRepoSlug, probePr, } from "./prs.js";
+import { closeTransportRow, crossCheckFile, devRequiresChecks, prRepoSlug, probePr, validPrFacts, } from "./prs.js";
 import { resolveOwnerRepo, splitSlug } from "./repo.js";
 import { restateOutcome } from "./run-facts.js";
 import { extraField, readRuns, str } from "./status.js";
@@ -685,6 +685,8 @@ export const GATE = {
     NOT_BOOKKEEPING: 17,
     /** --pr: the PR title carries a CI-suppressing token (its squash would skip CI on dev). */
     TITLE_SKIP: 18,
+    /** The current dev is absent from the validated code head. */
+    STALE_BASE: 19,
     /** API error, rate limit, or auth — distinct from "no run". */
     API_ERROR: 20,
 };
@@ -1438,6 +1440,31 @@ function logResolvedPrRepo(repoFlag, prNumber, pr, log) {
 }
 function runGate(ctx) {
     const f = ctx.flags;
+    const freshBase = f.freshBase === true;
+    if (freshBase && (f.pr === undefined || f.capstoneOnly === true))
+        throw new CommandError(EXIT.USAGE, "--fresh-base requires --pr without --capstone-only");
+    const factsPath = str(f.factsFile);
+    let facts;
+    if (factsPath !== undefined) {
+        if (!freshBase)
+            throw new CommandError(EXIT.USAGE, "--facts-file requires --fresh-base");
+        const parsed = readJsonFile(path.resolve(ctx.cwd, factsPath));
+        if (!parsed.ok)
+            throw new CommandError(EXIT.USAGE, "cannot read scoped gate facts");
+        facts = obj(parsed.value);
+        const info = facts.pr;
+        if (!validPrFacts(info) ||
+            facts.ownerRepo !== prRepoSlug(info.url) ||
+            (str(f.repo) !== undefined && facts.ownerRepo !== str(f.repo)) ||
+            facts.prNumber !== Number(f.pr) ||
+            info.number !== Number(f.pr) ||
+            facts.headRefName !== info.headRefName ||
+            (str(f.branch) !== undefined && facts.headRefName !== str(f.branch)) ||
+            facts.baseRefName !== DEV ||
+            info.baseRefName !== DEV ||
+            info.state !== "OPEN")
+            throw new CommandError(EXIT.USAGE, "gate facts repository, PR, head or base scope mismatch");
+    }
     let selection;
     const selectionFile = str(f.ciSelectionFile);
     if (selectionFile !== undefined) {
@@ -1459,7 +1486,36 @@ function runGate(ctx) {
             ctx.log(`fetch of origin/${branch} failed: ${fetched.stderr.trim()}`);
     }
     const root = checkoutRoot(ctx.cwd);
-    const gh = (args) => runGh(ctx.cwd, args);
+    const gh = facts === undefined
+        ? (args) => runGh(ctx.cwd, args)
+        : (args) => {
+            const reply = (value) => ({
+                ok: true,
+                stdout: JSON.stringify(value),
+                stderr: "",
+                missing: false,
+            });
+            const ci = obj(facts.ci);
+            const repo = text(facts.ownerRepo);
+            const endpoint = args[1]?.replace(/^\//, "") ?? "";
+            if (args[0] === "repo" && args[1] === "view")
+                return { ok: true, stdout: repo, stderr: "", missing: false };
+            const workflow = readBkitConfig(checkoutRoot(ctx.cwd)).ciWorkflow;
+            if (args[0] === "api" &&
+                endpoint.startsWith(`repos/${repo}/actions/workflows/${workflow}/runs?`))
+                return reply(ci.workflowRuns);
+            const jobMatch = new RegExp(`^repos/${repo}/actions/runs/([0-9]+)/jobs$`).exec(endpoint);
+            if (args[0] === "api" &&
+                jobMatch &&
+                arr(obj(ci.workflowRuns).workflow_runs).some((run) => String(obj(run).id) === jobMatch[1]))
+                return reply(ci.jobs);
+            return {
+                ok: false,
+                stdout: "",
+                stderr: "scoped gate facts do not contain this API evidence",
+                missing: false,
+            };
+        };
     const record = str(f.record);
     const recordFile = record === undefined ? undefined : path.resolve(ctx.cwd, record);
     const prNumber = str(f.pr) ?? str(f.squashOf);
@@ -1469,7 +1525,10 @@ function runGate(ctx) {
     if (prNumber !== undefined) {
         if (!/^[1-9][0-9]*$/.test(prNumber))
             throw new CommandError(EXIT.USAGE, "--pr / --squash-of take a PR number");
-        pr = probePr(ctx.cwd, { number: prNumber, state: "open", repo: str(f.repo) });
+        pr =
+            facts !== undefined && validPrFacts(facts.pr)
+                ? { kind: "ok", pr: facts.pr }
+                : probePr(ctx.cwd, { number: prNumber, state: "open", repo: str(f.repo) });
         if (pr.kind === "unavailable") {
             ctx.log(pr.message);
             return EXIT.USE_MCP;
@@ -1491,6 +1550,47 @@ function runGate(ctx) {
     }
     if (head === "")
         throw new CommandError(EXIT.USAGE, "--head needs a non-empty value");
+    const info = pr?.kind === "ok" ? pr.pr : undefined;
+    const repo = str(f.repo) ?? prRepoSlug(info?.url);
+    const codeHead = str(f.validated) ?? head;
+    let baseEvidence;
+    if (freshBase) {
+        baseEvidence = { devSha: "", comparedHead: codeHead, ancestor: null };
+        if (facts !== undefined) {
+            const base = obj(facts.base);
+            if (base.ref === DEV &&
+                /^[0-9a-f]{40,64}$/i.test(text(base.sha)) &&
+                base.comparedHead === codeHead &&
+                ["ahead", "identical", "behind", "diverged"].includes(text(base.status))) {
+                baseEvidence.devSha = text(base.sha);
+                baseEvidence.ancestor = ["ahead", "identical"].includes(text(base.status));
+            }
+        }
+        else if (repo !== undefined && isForeignRepo(ctx.cwd, repo)) {
+            const dev = gh(["api", `repos/${repo}/commits/dev`, "--jq", ".sha"]);
+            if (dev.ok && /^[0-9a-f]{40,64}$/i.test(dev.stdout.trim())) {
+                baseEvidence.devSha = dev.stdout.trim();
+                const compare = gh([
+                    "api",
+                    `repos/${repo}/compare/${baseEvidence.devSha}...${codeHead}`,
+                    "--jq",
+                    ".status",
+                ]);
+                if (compare.ok &&
+                    ["ahead", "identical", "behind", "diverged"].includes(compare.stdout.trim()))
+                    baseEvidence.ancestor = ["ahead", "identical"].includes(compare.stdout.trim());
+            }
+        }
+        else {
+            const fetched = fetchRemoteRef(ctx.cwd, "origin/dev");
+            if (fetched?.ok) {
+                baseEvidence.devSha = git(ctx.cwd, ["rev-parse", "--verify", "origin/dev^{commit}"]) ?? "";
+                const compared = runTool("git", ["merge-base", "--is-ancestor", baseEvidence.devSha, codeHead], ctx.cwd);
+                if (compared.status === 0 || compared.status === 1)
+                    baseEvidence.ancestor = compared.status === 0;
+            }
+        }
+    }
     // The pre-merge snapshot, written BEFORE the gate decides.
     const snapshot = str(f.snapshot);
     if (snapshot !== undefined) {
@@ -1500,7 +1600,11 @@ function runGate(ctx) {
         // A foreign repo's dev and ancestry come from the API: the checkout's origin/dev is another repo's.
         let dev;
         let ancestor;
-        if (foreign && repoFlag !== undefined) {
+        if (baseEvidence !== undefined) {
+            dev = baseEvidence.devSha;
+            ancestor = baseEvidence.ancestor === true;
+        }
+        else if (foreign && repoFlag !== undefined) {
             const devRes = gh(["api", `repos/${repoFlag}/commits/dev`, "--jq", ".sha"]);
             dev = devRes.ok ? devRes.stdout.trim() : "";
             const cmp = gh(["api", `repos/${repoFlag}/compare/dev...${head}`, "--jq", ".status"]);
@@ -1533,6 +1637,12 @@ function runGate(ctx) {
             validatedHead: str(f.validated) ?? "",
             devSha: dev,
             ancestor: String(ancestor),
+            ...(baseEvidence === undefined
+                ? {}
+                : {
+                    comparedHead: baseEvidence.comparedHead,
+                    baseEvidenceAvailable: baseEvidence.ancestor !== null,
+                }),
             capstone,
             mergeable: info?.mergeable ?? "",
         })}\n`);
@@ -1540,9 +1650,20 @@ function runGate(ctx) {
     // A title carrying a skip token would squash into a dev commit CI never runs on.
     const title = pr?.kind === "ok" ? (pr.pr?.title ?? "") : "";
     const titleToken = f.pr !== undefined ? SKIP_CI_TOKEN.exec(title)?.[0] : undefined;
-    let r = titleToken !== undefined
+    const baseUnavailable = baseEvidence?.ancestor === null || (freshBase && info?.baseRefName !== DEV);
+    const baseRefused = freshBase && (baseEvidence?.ancestor !== true || baseUnavailable);
+    const safetyReason = baseRefused
+        ? baseUnavailable
+            ? "fresh dev base evidence is unavailable or the PR base is not dev"
+            : `dev base ${baseEvidence?.devSha ?? ""} is absent from validated code head ${codeHead}; integrate dev and revalidate`
+        : `PR title '${title}' contains the CI-suppressing token ${titleToken ?? ""}`;
+    let r = baseRefused || titleToken !== undefined
         ? {
-            code: GATE.TITLE_SKIP,
+            code: baseRefused
+                ? baseUnavailable
+                    ? GATE.API_ERROR
+                    : GATE.STALE_BASE
+                : GATE.TITLE_SKIP,
             passed: false,
             overridden: false,
             head,
@@ -1553,12 +1674,12 @@ function runGate(ctx) {
             conclusion: null,
             capstone: "",
             ciWorkflow: "",
-            repo: str(f.repo) ?? null,
+            repo: repo ?? null,
             skippedLanes: [],
             nonBookkeepingPaths: [],
             failedSteps: [],
             regenerable: false,
-            reason: `PR title '${title}' contains the CI-suppressing token ${titleToken}`,
+            reason: safetyReason,
         }
         : shipGate({
             root,
@@ -1573,7 +1694,7 @@ function runGate(ctx) {
             override: process.env.BKIT_SHIP_GATE_OVERRIDE || undefined,
             statusFile: f.file === undefined ? undefined : path.resolve(ctx.cwd, String(f.file)),
         }, gh, ctx.log);
-    if (titleToken !== undefined)
+    if (baseRefused || titleToken !== undefined)
         ctx.log(r.reason);
     // Debug retains the configured gate above and also proves the original
     // selected workflow at the pushed head. A different workflow need not contain
@@ -2131,6 +2252,16 @@ export const runsCommand = {
                     type: "string",
                     help: "validated original debug selection: additionally require its workflow to succeed at the exact pushed head",
                 },
+                {
+                    name: "fresh-base",
+                    type: "boolean",
+                    help: "ship pre-merge: require fresh dev ancestry in the validated code head; CI overrides cannot waive it",
+                },
+                {
+                    name: "facts-file",
+                    type: "string",
+                    help: "with --fresh-base: scoped independently read PR, CI and dev comparison facts, without gh calls",
+                },
                 { ...HEAD_FLAG, help: "the PR head to merge (or --pr / --squash-of)" },
                 {
                     name: "pr",
@@ -2217,6 +2348,7 @@ export const runsCommand = {
                 [GATE.LANE_SKIPPED]: "a required lane concluded skipped",
                 [GATE.NOT_BOOKKEEPING]: "non-bookkeeping change past --validated, or not its descendant",
                 [GATE.TITLE_SKIP]: "--pr: the PR title carries a CI-suppressing token",
+                [GATE.STALE_BASE]: "fresh dev is absent from the validated code head; integrate and revalidate",
                 [GATE.API_ERROR]: "API error / rate limit / auth, or the PR head / squash commit unreadable",
             },
             run: runGate,
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 580ab1721..16e3df81c 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -373,10 +373,10 @@ flowchart LR
     end
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands_workflow_branches -->|136| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_branches -->|137| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_workflows -->|79| n_bkit_core_engine_commands_lib
-  n_bkit_core_engine_commands_workflow_runs -->|69| n_bkit_core_engine_commands_lib
-  n_bkit_core_engine_commands_workflow_prs -->|55| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_runs -->|70| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_prs -->|56| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_worktrees -->|43| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_ci_ci -->|38| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_ledgers -->|38| n_bkit_core_engine_commands_lib
@@ -392,11 +392,11 @@ flowchart LR
   n_bkit_core_engine_commands_workflow_status -->|23| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_ledgers -->|22| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_checks_after_index -->|21| n_bkit_core_engine_checks_after_ci_yml
+  n_bkit_core_engine_commands_workflow_branches -->|21| n_bkit_core_engine_commands_workflow_worktrees
   n_bkit_core_engine_commands_workflow_counters -->|21| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_workflows -->|21| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_workflow_workflows -->|21| n_bkit_core_engine_commands_workflow_locks
   n_bkit_core_engine_tools_instructions -->|21| n_bkit_core_engine_tools_instructions_sources
-  n_bkit_core_engine_commands_workflow_branches -->|20| n_bkit_core_engine_commands_workflow_worktrees
   n_bkit_core_engine_commands_workflow_branches -->|20| n_bkit_core_engine_commands_land
   n_bkit_core_engine_commands_workflow_workflows -->|20| n_bkit_core_engine_ledgers_status
   n_bkit_core_engine_checks_before_index -->|19| n_bkit_core_engine_checks_before_repo
@@ -409,6 +409,7 @@ flowchart LR
   n_bkit_core_engine_commands_lib -->|17| n_bkit_core_engine_ledgers_journal
   n_bkit_core_engine_ledgers_journal -->|17| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_land -->|16| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_runs -->|16| n_bkit_core_engine_commands_workflow_prs
   n_bkit_core_engine_commands_workflow_tests -->|16| n_bkit_core_engine_commands_workflow_plan_blocks
   n_bkit_core_engine_install_modules_claude -->|16| n_bkit_core_engine_install_write
   n_bkit_core_engine_install_write -->|16| n_bkit_core_engine_install_managed_block
@@ -427,6 +428,7 @@ flowchart LR
   n_bkit_core_engine_checks_before_repo -->|14| n_bkit_core_engine_shared_settings
   n_bkit_core_engine_commands_install_install -->|14| n_bkit_core_engine_render_models
   n_bkit_core_engine_commands_install_upgrade -->|14| n_bkit_core_engine_install_version_file
+  n_bkit_core_engine_commands_workflow_branches -->|14| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_workflow_branches -->|14| n_bkit_core_engine_commands_workflow_prs
   n_bkit_core_engine_commands_workflow_tests -->|14| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_tracker -->|14| n_bkit_core_engine_ledgers_status
@@ -434,7 +436,6 @@ flowchart LR
   n_bkit_core_engine_commands_ci_push_gate -->|13| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_context -->|13| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_run_facts -->|13| n_bkit_core_engine_ledgers_telemetry
-  n_bkit_core_engine_commands_workflow_runs -->|13| n_bkit_core_engine_commands_workflow_prs
   n_bkit_core_engine_commands_workflow_tests -->|13| n_bkit_core_engine_commands_workflow_status
   n_bkit_core_engine_commands_workflow_worktrees -->|13| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_install_modules_core -->|13| n_bkit_core_engine_install_version_file
@@ -453,7 +454,6 @@ flowchart LR
   n_bkit_core_engine_commands_analysis -->|11| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_install_uninstall -->|11| n_bkit_core_engine_shared_package_roots
   n_bkit_core_engine_commands_install_uninstall -->|11| n_bkit_core_engine_install_write
-  n_bkit_core_engine_commands_workflow_branches -->|11| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_workflow_steps -->|11| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_workflow_tracker -->|11| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_install_modules_core -->|11| n_bkit_core_engine_shared_package_roots
@@ -750,14 +750,14 @@ flowchart LR
   linkStyle 65 stroke:#59636e,stroke-width:6px
   linkStyle 66 stroke:#59636e,stroke-width:6px
   linkStyle 67 stroke:#59636e,stroke-width:6px
-  linkStyle 68 stroke:#59636e,stroke-width:6px
-  linkStyle 69 stroke:#59636e,stroke-width:6px
-  linkStyle 70 stroke:#59636e,stroke-width:6px
-  linkStyle 71 stroke:#59636e,stroke-width:6px
-  linkStyle 72 stroke:#59636e,stroke-width:6px
-  linkStyle 73 stroke:#59636e,stroke-width:6px
-  linkStyle 74 stroke:#59636e,stroke-width:6px
-  linkStyle 75 stroke:#59636e,stroke-width:6px
+  linkStyle 68 stroke:#59636eb3,stroke-width:3px
+  linkStyle 69 stroke:#59636eb3,stroke-width:3px
+  linkStyle 70 stroke:#59636eb3,stroke-width:3px
+  linkStyle 71 stroke:#59636eb3,stroke-width:3px
+  linkStyle 72 stroke:#59636eb3,stroke-width:3px
+  linkStyle 73 stroke:#59636eb3,stroke-width:3px
+  linkStyle 74 stroke:#59636eb3,stroke-width:3px
+  linkStyle 75 stroke:#59636eb3,stroke-width:3px
   linkStyle 76 stroke:#59636eb3,stroke-width:3px
   linkStyle 77 stroke:#59636eb3,stroke-width:3px
   linkStyle 78 stroke:#59636eb3,stroke-width:3px
diff --git a/docs/failures.jsonl b/docs/failures.jsonl
index dd1ebf873..54364c030 100644
--- a/docs/failures.jsonl
+++ b/docs/failures.jsonl
@@ -263,3 +263,7 @@
 {"schema":3,"ts":1793862177350,"firstTs":1793862177350,"updates":1,"kind":"failure","key":"audit-deterministic-bookkeeping-ledger-append-replay-receipts","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"audit","step":"audit-deterministic-bookkeeping","subagent":"bkit-audit-generate","model":"gpt-6.1-sol"},"references":["docs/audits/202611/deterministic-bookkeeping.md","deterministic-bookkeeping-7","2d20c6522612e0bde8ce392a335d7d6ff9522988"],"category":"agentic","severity":"MEDIUM","summary":"Generic ledger append lacks operation identity for safe replay after an uncertain outcome","description":"Source opportunity at .bkit/core/engine/commands/workflow/ledgers.ts:1279 and :1336: another append mints another timestamp/event with no operation replay token; .bkit/core/engine/ledgers/status.ts:375 already provides key/hash/ref engine-action dedup for other effects. No duplicate-write incident was reproduced.","remediation":"Design scoped operation identities and effect receipts using existing primitives; reconcile uncertain outcomes before retry, distinguish a replay from a deliberate same-key update, and avoid global content deduplication.","status":"OPEN"}
 {"schema":3,"ts":1793862177351,"firstTs":1793862177351,"updates":1,"kind":"failure","key":"audit-deterministic-bookkeeping-validation-rejection-hard-stop","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"audit","step":"audit-deterministic-bookkeeping","subagent":"bkit-audit-generate","model":"gpt-6.1-sol"},"references":["docs/audits/202611/deterministic-bookkeeping.md","deterministic-bookkeeping-8","2d20c6522612e0bde8ce392a335d7d6ff9522988"],"category":"agentic","severity":"HIGH","summary":"Shared workflow recovery excludes correctable bookkeeping validation rejections","description":"Source-contract finding at .bkit/core/workflows/bkit-plan.md:16, :26 and :34, present across all six workflows: only named recovery applies before Failure Path. Ledger contract .bkit/core/.bkit/jsonl.md:65 guarantees validation exit 8 writes nothing, but generic ledger rejection has no correction route.","remediation":"Update shared clauses and six workflows: engine fills verified metadata first; after explicit recovery, correct guaranteed-no-write validation inputs with at most two retries across rewrites/tool switches/resume, verify and resume the same substep; reconcile uncertain effects and preserve authorization, semantic validation and required gates.","status":"OPEN"}
 {"schema":3,"ts":1793873719589,"firstTs":1793873719589,"updates":1,"kind":"failure","key":"landed-cleanup-discards-staged-index-content","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":[".bkit/core/engine/commands/workflow/worktrees.ts",".bkit/core/engine/commands/workflow/worktrees.test.ts"],"severity":"HIGH","summary":"Landed cleanup discarded staged work hidden by working-tree bytes matching dev","description":"Real Git regressions staged distinct content, executable mode, symlink type or deletion, then restored working-tree content and mode to origin/dev. Landed cleanup previously removed the worktree and deleted its branch in all four cases.","rootCause":"dirtyWork checked filesystem state without independently checking staged index state.","remediation":"For each staged status path, compare the index against origin/dev before the working-tree proof. A difference or unreadable comparison preserves the worktree. Four red-to-green regressions and the safe landed-index case pass.","status":"CLOSED"}
+{"schema":3,"ts":1793878456905,"firstTs":1793878456905,"updates":1,"kind":"failure","key":"ship-reconciliation-refuses-tracked-run-bookkeeping","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["842",".bkit/core/engine/commands/workflow/branches.ts",".bkit/core/engine/commands/workflow/branches.test.ts"],"category":"tooling","summary":"Ship feature reconciliation refused its tracked workflow status changes","severity":"HIGH","description":"A real Git regression returned exit 3 instead of reconciling after a runtime-resolved row was appended to tracked status.jsonl.","rootCause":"reconcileFeature used hasLeftovers as an unconditional refusal before distinguishing workflow bookkeeping from unrelated dirty code.","remediation":"Use the existing core bookkeeping allow-list and commitBookkeeping only after an outside-path preflight. The regression passes and proves unrelated staged code, HEAD and index are preserved on refusal; the full 331-test branch/workflow run passes.","status":"CLOSED"}
+{"schema":3,"ts":1793878456907,"firstTs":1793878456907,"updates":1,"kind":"failure","key":"ship-resolver-merge-target-flag-missing","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["842",".bkit/core/engine/commands/workflow/branches.ts",".bkit/core/engine/commands/workflow/branches.test.ts"],"category":"tooling","summary":"Conflict resolver's recorded target could not pass through the public command","severity":"HIGH","description":"A real pending feature merge regression returned unknown flag --target (exit 2) from branches sync --merge.","rootCause":"The internal target parameter and MERGE_HEAD check existed without a command flag or dispatch plumbing.","remediation":"Declare and resolve --target, pass its pinned commit to mergeDev, emit the target and retain the existing merge on mismatches. The public-command continuation regression passes; the full 331-test branch/workflow run passes.","status":"CLOSED"}
+{"schema":3,"ts":1793879876561,"firstTs":1793879876561,"updates":1,"kind":"failure","key":"test-file-script-awake-nested-signal-json","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["842-ship-fails-local",".bkit/core/engine/audits/repo/test-file-script.integration.test.ts","scripts/ci/bkit-test-awake.test.mjs"],"category":"testing","severity":"LOW","summary":"Intermittent JSON readiness read failure in test-file wrapper integration","description":"The pre-generation group2 changed gate reported test-file-script.integration.test.ts:100 failing when the nested signal cleanup child read incomplete readiness JSON (Unexpected end of JSON input). The fresh targeted wrapper integration rerun passed, with 47 focused audit/wrapper tests passing and two existing skips. No speculative production fix or test weakening was applied.","rootCause":"Unconfirmed; observed once under the broad changed gate and not reproduced by the isolated rerun.","status":"OPEN"}
+{"schema":3,"ts":1793881336779,"firstTs":1793881336779,"updates":1,"kind":"failure","key":"ship-coverage-omits-semantic-merge-results","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"claude-sonnet-5-5"},"references":["842-ship-fails-local",".bkit/core/engine/commands/workflow/branches.test.ts",".bkit/core/workflows/bkit-ship.md"],"severity":"HIGH","status":"CLOSED","summary":"Ship coverage ignored semantic merge results.","description":"The feature coverage list excluded all merge commits and was not recomputed after integration, allowing sweep and docs artifacts to cover an earlier semantic state.","rootCause":"The workflow used rev-list --no-merges and retained its pre-integration state.","remediation":"Compute merge-aware coverage through branches sync --feature-state, exclude only proven automatic dev integrations, and refresh before both artifact reuse decisions. Real-Git tests cover merge-only changes, imported features, conflict resolutions and valid reuse."}
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index 4e44daee2..323cd192d 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -153,3 +153,6 @@
 {"schema":3,"ts":1793677148482,"firstTs":1793677148482,"updates":1,"kind":"knowledge","key":"workflow-push-retry-keeps-close-effects-and-original-return-once","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":[".bkit/core/workflows/bkit-build.md",".bkit/core/engine/audits/workflows/local-gate-audit.test.ts"],"summary":"Keep workflow close effects outside a retryable push block","rootCause":"Retrying a fence that closes the workflow before pushing repeats append-only status and publishing effects. Close also removes its session, so a repeated close can lose the original final-return issue facts.","remediation":"Close once, retain commentFile, tracker and finalReturn immediately, retry only the push on exit 81, and release the workflow lock after push success.","status":"ACTIVE"}
 {"schema":3,"ts":1793868900526,"firstTs":1793868900526,"updates":1,"kind":"knowledge","key":"git-status-cleanup-reads-must-preserve-raw-output","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-tasks","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":[".bkit/core/engine/commands/workflow/worktrees.ts",".bkit/core/engine/commands/workflow/worktrees.test.ts"],"summary":"Git cleanup reads must preserve status columns and NUL-delimited path bytes","description":"runGit and git trim stdout. Trimming porcelain status removes its leading status column, and trimming a NUL-delimited path list can alter a leading-whitespace filename. Cleanup proofs that parse those outputs can inspect the wrong path and misclassify work as safe.","rootCause":"The general Git helpers trim stdout for scalar reads, while cleanup parses byte-sensitive status and path protocols.","remediation":"Use the worktree module's cleanupRead for raw status, ls-tree, diff path and committed-line evidence. Keep scalar ref reads on the existing helpers. The marked-worktree unit regression covers a tracked-only unstaged edit.","status":"ACTIVE"}
 {"schema":3,"ts":1793875198578,"firstTs":1793875198578,"updates":1,"kind":"knowledge","key":"cleanup-index-and-working-tree-are-independent","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"gpt-6.1-sol"},"references":[".bkit/core/engine/commands/workflow/worktrees.ts",".bkit/core/engine/commands/workflow/worktrees.test.ts"],"summary":"Landed cleanup must prove index state independently from working-tree state","description":"A tracked path can contain unlanded staged content, mode, type or deletion while its filesystem contents match dev. Comparing only filesystem bytes loses the staged version when a worktree is removed.","rootCause":"The index and working tree are separate Git data states; porcelain status can report differences in both columns.","remediation":"For each staged status path, compare the index with origin/dev before allowing the working-tree landed proof. Any difference or unreadable comparison preserves the worktree. Keep a positive case where both states match dev, alongside the four preservation regressions.","status":"ACTIVE"}
+{"schema":3,"ts":1793878456619,"firstTs":1793878456619,"updates":1,"kind":"knowledge","key":"ship-reconciliation-must-accept-its-own-bookkeeping","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["842",".bkit/core/engine/commands/workflow/branches.ts",".bkit/core/engine/commands/workflow/branches.test.ts"],"summary":"Ship reconciliation runs after status and input artifacts are dirty","rootCause":"A blanket dirty-tree refusal made the new reconciliation command unusable after workflows start appended tracked status rows.","remediation":"Carry only the existing core bookkeeping allow-list after proving no unrelated dirty path exists. Keep staged unrelated code unchanged and refuse it. Test reconciliation with real tracked workflow rows, not only clean fixture branches.","status":"ACTIVE"}
+{"schema":3,"ts":1793878456621,"firstTs":1793878456621,"updates":1,"kind":"knowledge","key":"merge-target-contract-needs-public-cli-continuation-test","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["842",".bkit/core/engine/commands/workflow/branches.test.ts",".bkit/core/prompts/bkit-ship-conflict-resolve.md"],"summary":"An internal merge target parameter does not establish the resolver CLI contract","rootCause":"mergeDev accepted a target internally while branches sync did not declare or pass --target, so the resolver's planned command exited usage.","remediation":"Exercise the public command against a real pending feature merge. Resolve the target to a commit, compare it with MERGE_HEAD, refuse a mismatched target without aborting the existing merge, and continue only the recorded target.","status":"ACTIVE"}
+{"schema":3,"ts":1793881497760,"firstTs":1793881497760,"updates":1,"kind":"knowledge","key":"ship-coverage-must-account-for-merge-results","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"claude-sonnet-5-5"},"references":["842-ship-fails-local",".bkit/core/engine/commands/workflow/branches.ts","ship-coverage-omits-semantic-merge-results"],"status":"ACTIVE","summary":"Feature coverage must include semantic changes introduced by merge results.","description":"A merge commit can change feature semantics without changing any nonmerge ancestor. Ship coverage therefore retains merge commits unless the result is proven to match Git's clean automatic merge of a feature parent and a dev ancestor. Unavailable proof conservatively requires fresh coverage. Recompute the state after integration and before each artifact reuse decision."}
diff --git a/docs/observability.md b/docs/observability.md
index b47e20b86..a87951a68 100644
--- a/docs/observability.md
+++ b/docs/observability.md
@@ -130,7 +130,8 @@ Run-completeness check (`checks/status-holes.ts`, `bkit completeness check`). Ad
 | 15 | Selected run concluded `cancelled` | refuse |
 | 16 | A lane named in `bkit.testing.ciRequired` concluded `skipped` | refuse |
 | 17 | Non-bookkeeping change past `--validated`, or not its descendant | refuse → Step 9 (re-validate at head) |
-| 20 | API error / rate limit / auth | refuse |
+| 19 | Fresh `dev` is not an ancestor of the validated code head | refuse → Step 4 (integrate and revalidate) |
+| 20 | API error / rate limit / auth, or missing/mismatched fresh-base evidence | refuse |
 | 80 | `gh` not on PATH | do it via the MCP fallback |
 
 The refusal itself is signalled by the process exit code; every refusal ends with the `required head:` block. Canonical grep patterns:
@@ -148,6 +149,12 @@ The refusal itself is signalled by the process exit code; every refusal ends wit
 
 The override is honoured ONLY when `BKIT_SHIP_GATE_OVERRIDE=<sha>` equals the exact head being refused, so a SHA mismatch is ignored and the refusal stands. Audit the override rows (`status.jsonl` `type:"ship-gate-override"`) as part of consumer rollback (see `docs/deployments.md` § Ship gate + bookkeeping).
 
+With `--fresh-base`, ancestry is checked before the override or bookkeeping carry-forward. The gate snapshot records the fetched `devSha`, `comparedHead` and `ancestor` evidence; unavailable evidence refuses rather than assuming freshness. MCP facts are scoped to `ownerRepo`, `prNumber`, `headRefName` and `baseRefName`, with the comparison in `base` (`ref`, `sha`, `comparedHead`, `status`). A mismatched envelope cannot authorize a merge.
+
+`bkit prs merge --ship-retry` distinguishes a moved head (exit 9, return to validation) from a new conflict (exit 10, return to integration). Other merge refusals remain terminal (exit 7). A successful head-pinned merge still has a residual race with a later base update because the merge API does not pin the base SHA.
+
+Cleanup reports preservation explicitly. `local {branch} changed after its cleanup proof — preserved` means the expected-tip delete refused; `carries work origin/dev does not — preserved` means landed-work evidence failed. `cleanup evidence unavailable — preserved` names an unreadable local or remote ref. `remote origin/{branch} retained: conditional deletion is unavailable under the no-force-push policy` records the retained remote branch. Cleanup proves the index and working tree separately before removing either, and these diagnostics are independent of GitHub's repository-level automatic branch deletion setting.
+
 The same prefix carries the CI waits (`bkit runs wait`: one `attempt N: …` line per poll) and the CI-Dispatch Gate (`bkit runs dispatch`: `re-trigger commit or push failed — no verdict; route to the Failure Path`, `landed commit … inherited a CI-suppression token in its body`).
 
 ### `bkit runs mirror` (under `[bkit-runs]`)
diff --git a/docs/testing.md b/docs/testing.md
index e8821c338..4cd6cf609 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -695,8 +695,11 @@ Replay a stored verdict: each `completeness` row carries `sourceSha` (the sha256
 <!-- prettier-ignore -->
 | File | Tier | Scope |
 | --- | --- | --- |
-| `commands/workflow/runs.test.ts` | Unit (`tests/fixtures/gh/` stub + `PATH` shim) | `bkit runs gate`: every exit code (0/2/10/11/12/13/14/15/16/17/20/80); `--validated` carry-forward; `--capstone-only` (red run with green capstone passes, capstone still running polls); full mode refuses a green run whose capstone concluded `cancelled` / `skipped` / `timed_out` / `neutral` / `action_required` / `stale` / `startup_failure` (12); override honoured-vs-ignored; config resolution; code 16 opt-in via `bkit.testing.ciRequired`; code 12's `failedSteps` (`{job}/{step}` outside the capstone, `{job}/` for a failed, timed-out or cancelled job with no failed step) and `regenerable` (true only when every failed step is on the floor or `bkit.testing.ciGenerated`, a step name matched in its own job only); `--event` filter. Also `runs mirror`, `runs wait`, `runs dispatch`, `runs declared` |
+| `commands/workflow/runs.test.ts` | Unit (`tests/fixtures/gh/` stub + `PATH` shim) | `bkit runs gate`: every exit code (0/2/10/11/12/13/14/15/16/17/19/20/80); `--fresh-base` ancestry before overrides and bookkeeping carry-forward; repository/PR/head/base-scoped MCP facts; `--validated` carry-forward; `--capstone-only` (red run with green capstone passes, capstone still running polls); full mode refuses a green run whose capstone concluded `cancelled` / `skipped` / `timed_out` / `neutral` / `action_required` / `stale` / `startup_failure` (12); override honoured-vs-ignored; config resolution; code 16 opt-in via `bkit.testing.ciRequired`; code 12's `failedSteps` (`{job}/{step}` outside the capstone, `{job}/` for a failed, timed-out or cancelled job with no failed step) and `regenerable` (true only when every failed step is on the floor or `bkit.testing.ciGenerated`, a step name matched in its own job only); `--event` filter. Also `runs mirror`, `runs wait`, `runs dispatch`, `runs declared` |
 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | Unit (markdown-invariant) | No `git add -A`; staging only through `bkit ledgers`; every status write targets `{STATUS}`; the merge pinned to the gate's head (`runs gate --pr` before `prs merge --match-head`); canonical 14 step keys; Step 2 runs `status path` after the `cd` into the worktree; pre-merge pushes confined to Steps 2, 3, 4, Commit + Push Bookkeeping, 10 and Failure Remediate, none forced; no fence checks out or pushes `dev` by hand, `branches sync-dev` brings it level; Failure Path = one `workflows fail` + one `workflows handover --flush`; issue-less runs and the main guard — a ship of `dev` / `main` prints the engine refusal, releases the lock and stops, the naming warning fires when the branch lacks `{FID}` and `ISSUE_ID` is empty, the Step 10 label re-read and Step 14 label calls skip when `ISSUE_ID` is empty, and the MCP merge asserts base `dev` |
+| `.bkit/core/engine/commands/workflow/branches.test.ts` | Unit with real Git repositories | Local/remote feature reconciliation, inherited `dev` guards, unrelated staged/unstaged work preservation, and a pinned public merge target checked against the actual pending merge. |
+| `.bkit/core/engine/commands/workflow/prs.test.ts` | Unit (`gh` process stub) | Merged-on-entry coverage and `--ship-retry` classification: moved head revalidates, a new conflict reintegrates, and other merge refusals remain terminal. Scoped MCP facts follow the same routes. |
+| `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts` | Integration with real remote refs and worktrees | Landed-work proof for squash merges, independent index and working-tree content, modes, types and deletions; expected-tip deletion and preservation when evidence is missing or a ref moves. |
 | `.bkit/core/engine/checks/status-holes.test.ts` | Unit | Expected steps and commands derived from each of the five workflow mds (no parallel table); step / evidence / unexercised / unexpected classification; no orphan rows in any workflow, build's pause and sub-rows named by the contract; verdict metadata; advisory exit 0 on holey fixture; sweep summary line counting holey runs |
 
 ## Key test files
