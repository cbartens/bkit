diff --git a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
index f8e00a47f..c99f7d503 100644
--- a/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
+++ b/.agents/plugins/bkit/skills/bkit-ship/SKILL.md
@@ -601,9 +601,25 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
 **If** `RECONCILE_REQUIRED` = true → clear it → Step 3 before validation. A previous `DONE` row alone never proves coverage of imported feature code.
 
 1. Resolve the head CI must pass at. The block re-validates when the code moved **or** `REVALIDATE_REASON` = `gate-refusal`: it probes for a run at it first, dispatches only when none, and waits for it to complete. Drop `--reason` when `REVALIDATE_REASON` is empty:
+
    ```bash
-   "{BKIT}" runs revalidate --pr="{PR_NUMBER}" --entry-head="{ENTRY_HEAD}" --code-head="{CODE_HEAD}" --branch="{SHIP_BRANCH}" --month="{YYYYMM}" --fid="{FID}" --file="{STATUS}" --reason="{REVALIDATE_REASON}" --repo="{OWNER_REPO}"
+   "{BKIT}" runs revalidate --pr="{PR_NUMBER}" --require-reconciled --entry-head="{ENTRY_HEAD}" --code-head="{CODE_HEAD}" --branch="{SHIP_BRANCH}" --month="{YYYYMM}" --fid="{FID}" --file="{STATUS}" --reason="{REVALIDATE_REASON}" --repo="{OWNER_REPO}"
    ```
+
+   Hold `reconcileRequired` as `RECONCILE_REQUIRED`.
+   Route:
+   - **If** exit 21 → set `RECONCILE_REQUIRED` = true → route the recorded failed arrival to reconciliation:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path**.
+   - **If** exit 0 → continue with the next instruction.
+   - **If** exit 81 → end turn, re-run this block.
+   - **Else** → **Failure Path**.
+
    Hold `validatedHead` as `VALIDATED_HEAD`.
 
 ### 🔒 Gate 9 — Re-validate
@@ -623,7 +639,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
    ```bash
    "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fetch --fresh-base --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
    ```
-   **If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
+   **If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Each run must carry its positive integer `id`, `repository.full_name`, `head_repository.full_name`, configured workflow `path` (or matching numeric `workflow_id`), `head_sha`, `head_branch` and repository-scoped `html_url`. Both repositories must match `ownerRepo`; the head must match `VALIDATED_HEAD` and `headRefName`. Each job must carry `run_id`, `run_url` and `head_sha` matching its selected run and repository. Retain every jobs page in the paginated array. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
    ```bash
    "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fresh-base --facts-file="{OUTBOX}/ship-gate-facts.json" --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
    ```
@@ -637,7 +653,15 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
      - **If** exit 0 → Step 3.
      - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
      - **Else** → **Failure Path**, preserving the branch and worktree on exhaustion.
-   - **If** exit 11 (in progress — poll), 14 (stale green), 10 (no run) **or** 17 (non-bookkeeping change past `VALIDATED_HEAD`) → route on the failed arrivals at Step 10, without asking:
+   - **If** exit 17 (non-bookkeeping change past `VALIDATED_HEAD`) → set `RECONCILE_REQUIRED` = true → route the recorded failed arrival to reconciliation:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path**.
+   - **If** exit 11 (in progress — poll), 14 (stale green) **or** 10 (no run) → route on the failed arrivals at Step 10, without asking:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
      ```
diff --git a/.agents/skills/bkit-ship/SKILL.md b/.agents/skills/bkit-ship/SKILL.md
index 2a8ca0c9c..1e03fe571 100644
--- a/.agents/skills/bkit-ship/SKILL.md
+++ b/.agents/skills/bkit-ship/SKILL.md
@@ -601,9 +601,25 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
 **If** `RECONCILE_REQUIRED` = true → clear it → Step 3 before validation. A previous `DONE` row alone never proves coverage of imported feature code.
 
 1. Resolve the head CI must pass at. The block re-validates when the code moved **or** `REVALIDATE_REASON` = `gate-refusal`: it probes for a run at it first, dispatches only when none, and waits for it to complete. Drop `--reason` when `REVALIDATE_REASON` is empty:
+
    ```bash
-   "{BKIT}" runs revalidate --pr="{PR_NUMBER}" --entry-head="{ENTRY_HEAD}" --code-head="{CODE_HEAD}" --branch="{SHIP_BRANCH}" --month="{YYYYMM}" --fid="{FID}" --file="{STATUS}" --reason="{REVALIDATE_REASON}" --repo="{OWNER_REPO}"
+   "{BKIT}" runs revalidate --pr="{PR_NUMBER}" --require-reconciled --entry-head="{ENTRY_HEAD}" --code-head="{CODE_HEAD}" --branch="{SHIP_BRANCH}" --month="{YYYYMM}" --fid="{FID}" --file="{STATUS}" --reason="{REVALIDATE_REASON}" --repo="{OWNER_REPO}"
    ```
+
+   Hold `reconcileRequired` as `RECONCILE_REQUIRED`.
+   Route:
+   - **If** exit 21 → set `RECONCILE_REQUIRED` = true → route the recorded failed arrival to reconciliation:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path**.
+   - **If** exit 0 → continue with the next instruction.
+   - **If** exit 81 → end turn, re-run this block.
+   - **Else** → **Failure Path**.
+
    Hold `validatedHead` as `VALIDATED_HEAD`.
 
 ### 🔒 Gate 9 — Re-validate
@@ -623,7 +639,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
    ```bash
    "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fetch --fresh-base --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
    ```
-   **If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
+   **If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Each run must carry its positive integer `id`, `repository.full_name`, `head_repository.full_name`, configured workflow `path` (or matching numeric `workflow_id`), `head_sha`, `head_branch` and repository-scoped `html_url`. Both repositories must match `ownerRepo`; the head must match `VALIDATED_HEAD` and `headRefName`. Each job must carry `run_id`, `run_url` and `head_sha` matching its selected run and repository. Retain every jobs page in the paginated array. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
    ```bash
    "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fresh-base --facts-file="{OUTBOX}/ship-gate-facts.json" --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
    ```
@@ -637,7 +653,15 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
      - **If** exit 0 → Step 3.
      - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
      - **Else** → **Failure Path**, preserving the branch and worktree on exhaustion.
-   - **If** exit 11 (in progress — poll), 14 (stale green), 10 (no run) **or** 17 (non-bookkeeping change past `VALIDATED_HEAD`) → route on the failed arrivals at Step 10, without asking:
+   - **If** exit 17 (non-bookkeeping change past `VALIDATED_HEAD`) → set `RECONCILE_REQUIRED` = true → route the recorded failed arrival to reconciliation:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path**.
+   - **If** exit 11 (in progress — poll), 14 (stale green) **or** 10 (no run) → route on the failed arrivals at Step 10, without asking:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
      ```
diff --git a/.bkit/cli.md b/.bkit/cli.md
index 10686d9b3..5015a513c 100644
--- a/.bkit/cli.md
+++ b/.bkit/cli.md
@@ -294,7 +294,7 @@ CI runs: wait for one, prove one was dispatched, re-validate and gate a merge on
 | `wait` | by hand | `--pr` `--head` `--branch` `--until` `--budget-s` `--interval-s` `--once` `--dispatch-if-absent` | Bounded poll for a CI check on a PR (--pr) or a CI run at a head (--head --branch), present or completed. |
 | `dispatch` | workflow | `--pr` `--sha` **`--fid`** `--label` `--file` `--workflow` `--step` `--artifact` `--field` `--budget-s` `--interval-s` `--poll-result` `--attempts` `--all-errored` `--retriggered` | CI-Dispatch Gate after the last push: poll, one clean re-trigger, the ciDispatch verdict, and the body scan. A run in place on dev has no PR: it polls the push-event run at the pushed sha, and its re-trigger commits and pushes only the run's own work. |
 | `gate` | workflow | `--ci-selection-file` `--fresh-base` `--facts-file` `--head` `--pr` `--squash-of` `--snapshot` `--record` `--validated` `--month` `--fid` `--repo` `--branch` `--fetch` `--event` `--file` `--capstone-only` | Ship merge gate: the capstone job present and green at the head (exit 0), or why not. |
-| `revalidate` | workflow | **`--pr`** **`--entry-head`** **`--code-head`** **`--branch`** **`--month`** **`--fid`** **`--file`** `--reason` `--repo` | Ship: pick the head CI must pass at, probe for a run there, dispatch only when none, wait for it to complete. |
+| `revalidate` | workflow | `--require-reconciled` **`--pr`** **`--entry-head`** **`--code-head`** **`--branch`** **`--month`** **`--fid`** **`--file`** `--reason` `--repo` | Ship: pick the head CI must pass at, probe for a run there, dispatch only when none, wait for it to complete. |
 | `mirror` | workflow | **`--head`** `--branch` `--repo` `--ci-workflow` `--capstone` `--absent-minutes` `--max-minutes` `--interval-s` | Release PR: wait for the branch's push run at the head and copy its capstone verdict. |
 | `context` | workflow | **`--phase`** **`--arg`** `--marker` | /bkit-auto Step 1: the phase and mode, the repo, and the issue / FID / PR / run the dispatch carries. |
 | `declared` | by hand | — | Whether the repo declares a CI workflow: .github/workflows/<bkit.testing.ciWorkflow> exists (exit 0) or not (exit 1). |
diff --git a/.bkit/core/.bkit/cli.md b/.bkit/core/.bkit/cli.md
index aaf13d1ce..1c2e397c4 100644
--- a/.bkit/core/.bkit/cli.md
+++ b/.bkit/core/.bkit/cli.md
@@ -294,7 +294,7 @@ CI runs: wait for one, prove one was dispatched, re-validate and gate a merge on
 | `wait` | by hand | `--pr` `--head` `--branch` `--until` `--budget-s` `--interval-s` `--once` `--dispatch-if-absent` | Bounded poll for a CI check on a PR (--pr) or a CI run at a head (--head --branch), present or completed. |
 | `dispatch` | workflow | `--pr` `--sha` **`--fid`** `--label` `--file` `--workflow` `--step` `--artifact` `--field` `--budget-s` `--interval-s` `--poll-result` `--attempts` `--all-errored` `--retriggered` | CI-Dispatch Gate after the last push: poll, one clean re-trigger, the ciDispatch verdict, and the body scan. A run in place on dev has no PR: it polls the push-event run at the pushed sha, and its re-trigger commits and pushes only the run's own work. |
 | `gate` | workflow | `--ci-selection-file` `--fresh-base` `--facts-file` `--head` `--pr` `--squash-of` `--snapshot` `--record` `--validated` `--month` `--fid` `--repo` `--branch` `--fetch` `--event` `--file` `--capstone-only` | Ship merge gate: the capstone job present and green at the head (exit 0), or why not. |
-| `revalidate` | workflow | **`--pr`** **`--entry-head`** **`--code-head`** **`--branch`** **`--month`** **`--fid`** **`--file`** `--reason` `--repo` | Ship: pick the head CI must pass at, probe for a run there, dispatch only when none, wait for it to complete. |
+| `revalidate` | workflow | `--require-reconciled` **`--pr`** **`--entry-head`** **`--code-head`** **`--branch`** **`--month`** **`--fid`** **`--file`** `--reason` `--repo` | Ship: pick the head CI must pass at, probe for a run there, dispatch only when none, wait for it to complete. |
 | `mirror` | workflow | **`--head`** `--branch` `--repo` `--ci-workflow` `--capstone` `--absent-minutes` `--max-minutes` `--interval-s` | Release PR: wait for the branch's push run at the head and copy its capstone verdict. |
 | `context` | workflow | **`--phase`** **`--arg`** `--marker` | /bkit-auto Step 1: the phase and mode, the repo, and the issue / FID / PR / run the dispatch carries. |
 | `declared` | by hand | — | Whether the repo declares a CI workflow: .github/workflows/<bkit.testing.ciWorkflow> exists (exit 0) or not (exit 1). |
diff --git a/.bkit/core/.bkit/workflows.md b/.bkit/core/.bkit/workflows.md
index ada5e0a10..41e8adbcd 100644
--- a/.bkit/core/.bkit/workflows.md
+++ b/.bkit/core/.bkit/workflows.md
@@ -109,7 +109,7 @@ Rendering can be re-run: the source carries every wired variant, so a tracker sw
 - **Ship Step 6 fold runs after the two subagents and stages nothing itself:** the same fence runs `bkit roadmap feature --root="$WT" --step=ship-update-docs` (`$WT` = `{WORKTREE_PATH}`), which appends the `SHIPPED` row and folds. Both paths ride the PR in Step 8's `--scope=pr` commit (§ `/bkit-ship` — Docs and bookkeeping ride the PR). `DOCS_VERDICT` requires the command to report the row appended with `status` = `SHIPPED`. A `BUILT` row from the build close must not turn it green.
 - **Phase closes are mechanical-tier only:** a ship close writes its own feature's ledger row and re-renders the `roadmap-status` board. It runs no analysis, because analysis is a review a human invokes, never a cost paid on every ship.
 - **Ship re-validate probes before dispatching:** the head move already fires `pull_request` at that SHA. `bkit-ci.yml` keys `pull_request` concurrency by PR number and `workflow_dispatch` by ref. These are separate groups, so a duplicate is never cancelled and burns a full run. `bkit runs wait --head=<VALIDATED_HEAD> --until=present --dispatch-if-absent` probes for a run at that SHA (6 polls) and dispatches only when there is no run. The probe is never a pass condition. It uses `--head`, not `--pr`: a PR target reads the PR head's `statusCheckRollup`, and the PR head (ship's `[skip ci]` bookkeeping commit) never gets a run. Run targets are anchored to the head, because the newest run on the branch can be a COMPLETED run from a superseded head.
-- **Ship retries reuse only matching feature coverage:** gate codes 10 / 11 / 14 / 17 return to CI validation, and fresh-base code 19 returns to reconciliation and integration. Merge refusals use `route=revalidate` when the head moved and `route=integrate` for a conflict with dev. Each gate refusal or attempted merge consumes one arrival in `ship.merge.maxAttempts`. `branches sync --feature-state` recomputes coverage before each sweep/docs reuse decision. Imported feature merges and semantic conflict resolutions invalidate coverage; bookkeeping and proven automatic dev-only merges retain it.
+- **Ship retries reuse only matching feature coverage:** gate codes 10 / 11 / 14 return to CI validation; gate code 17 and revalidation code 21 return to reconciliation and refreshed feature coverage. Fresh-base code 19 returns to reconciliation and integration. Merge refusals use `route=revalidate` when the head moved and `route=integrate` for a conflict with dev. Each gate refusal or attempted merge consumes one arrival in `ship.merge.maxAttempts`. `branches sync --feature-state` recomputes coverage before each sweep/docs reuse decision. Imported feature merges and semantic conflict resolutions invalidate coverage; bookkeeping and proven automatic dev-only merges retain it.
 - **Build close-workflow push does not trigger CI:** there is no PR yet. `bkit prs open` on the pushed HEAD is the single CI trigger.
 - **Design / plan close on HARD STOP:** a human must review before the next phase.
 - **No archive step in ship:** artifacts sit at the canonical `docs/plans/{YYYYMM}/` from the start of design, so there is nothing to move at close.
@@ -1090,7 +1090,8 @@ The following table describes the local discovery route and shared step mechanic
 - This is the one definition of ship's bookkeeping. Ship's Step 8 commit, `bkit ledgers only-bookkeeping`, the merge gate's carry-forward, `bkit ci min-push` and the pre-push hook's `bkit ci bookkeeping-push` all read it, so ship's `[skip ci]` bookkeeping push reaches the open PR.
 - CI is awaited only when `VALIDATED_HEAD` != `ENTRY_HEAD`, or on gate-refusal re-entry, so a PR that arrives green costs zero extra runs. Path B pays one run: the Step 4 merge of `origin/dev` moves the head, and Step 9 dispatches CI at the merged head, so a clash between the branch and newer `dev` commits surfaces as a red PR before the merge, not as a red `dev` push run after it.
 - Step 4 integrates dev locally because GitHub ignores `merge=union`. After an attempted merge, `prs merge --ship-retry` independently rereads the PR: moved head returns to validation, a new conflict returns to integration, and other refusals stop with a reason. These refusals do not enter CI diagnosis or remediation.
-- `runs gate --fresh-base` reads fresh dev evidence and requires dev to be an ancestor of the validated code head, before accepting a CI override or bookkeeping carry-forward. Stale dev exits 19 and returns to integration within the merge allowance; missing or mismatched evidence exits 20. Scoped MCP fact files go through the same engine decisions.
+- `runs revalidate --require-reconciled` refuses newly observed feature code with exit 21 before CI validation. It records one `ship-gate-refusal` arrival and returns to Step 3 for reconciliation, inherited-dev checks and refreshed sweep/docs coverage. Bookkeeping-only descendants retain their covered head; callers without the flag retain generic revalidation.
+- `runs gate --fresh-base` reads fresh dev evidence and requires dev to be an ancestor of the validated code head, before accepting a CI override or bookkeeping carry-forward. Stale dev exits 19 and returns to integration within the merge allowance; missing or mismatched evidence exits 20. Scoped MCP fact files go through the same engine decisions. Their nested Actions runs must prove the requested repository, configured workflow, branch and validated head; every paginated job must prove its selected run, repository URL and head. Missing provenance refuses the gate.
 - The freshness check and GitHub's merge request are separate API operations. The request pins the feature head but cannot atomically pin the base. Dev may move in that interval; the post-merge squash capstone remains the detection boundary for that residual race.
 - `bkit runs gate --head=<PR head> --validated=<VALIDATED_HEAD> --month= --fid=` re-checks the relation itself (non-bookkeeping change or non-ancestor → code 17), then runs every check at the validated SHA. `--match-head-commit <PR head>` still pins what merges.
 - The bookkeeping commit merges untested. `lint-staged` formats it at commit, and post-merge `dev` CI (`ship-merge-ci` row) is the backstop.
@@ -1118,8 +1119,8 @@ The following table describes the local discovery route and shared step mechanic
 | 6 — Update Docs & Summary | `@bkit-ship-update-docs`, then `bkit workflows summary --pr={PR_NUMBER}` | Recompute coverage and reuse docs work only with matching recorded feature coverage and an existing artifact; otherwise rerun the docs agent. `context ledger-scan` supplies its pending-item artifact. `roadmap feature` appends `SHIPPED` and folds the board before recording successful docs coverage. Refresh the summary on every pass; a FAIL summary stops the merge. |
 | 7 — Prune Skills | — | `bkit skills prune` in the worktree: uninstalls every non-`bkit-*` skill `.agents/skills.md` does not list (whole-name match). Warns and carries on: a missing registry skips the prune, a failed uninstall is listed in `failed`. Reconciles the union of on-disk `.agents/skills/` directories and `skills-lock.json` keys — a disk-only scan strands lock entries whose directory was removed out-of-band. |
 | 8 — Commit + Push Bookkeeping | — | Record `CODE_HEAD`; `ship-bookkeeping-push` row first; one `bkit ledgers commit --scope=pr` commit `docs({FID}): ship bookkeeping bkit [skip ci]` (docs, FID logs, ledgers, skill removals; refuses on `dev`, `main` or a detached HEAD, exit 12); `bkit branches push --mode=plain` to `{SHIP_BRANCH}` only when `outcome` = committed — an unconditional push would start a CI run on every ship. |
-| 9 — Re-validate | — | Resolve `VALIDATED_HEAD` (carry-forward above). Wait only when `VALIDATED_HEAD` != `ENTRY_HEAD` **or** `REVALIDATE_REASON` = `gate-refusal`: `bkit runs wait --head=<VALIDATED_HEAD> --until=present --dispatch-if-absent` (6 polls; `gh workflow run {bkit.testing.ciWorkflow}` only on no-run, then `VALIDATED_HEAD` = PR head) → `ship-revalidate-dispatch` row → head-anchored `--until=completed` (`SHIP_CI_WAIT_TIMEOUT_S`; budget exhausted → `ship-revalidate-timeout` row → Failure Path) → Step 10. |
-| 10 — Merge Gate + Merge PR | — | `runs gate --pr= --validated= --fresh-base` writes the snapshot before deciding and records each refusal once. Code 19 returns to Step 3; 10/11/14/17 return to Step 9; unavailable evidence or a title skip token stops. `prs merge --ship-retry --match-head=<gate mergeHead> --expect-merged` uses an empty body and leaves deletion to guarded close. Independent rereads return merged → Step 13, moved head (9) → validation, new conflict (10) → integration, or another explicit reason → terminal stop. The same durable allowance counts gate refusals and merge attempts. MCP fallback validates scoped pre/post facts through the engine before taking these routes. Red CI runs regenerate only when every failed step is on `CI_GENERATED_FLOOR` or `bkit.testing.ciGenerated`; committed regeneration plain-pushes and revalidates, while unchanged/undeclared/failed regeneration stops. |
+| 9 — Re-validate | — | `runs revalidate --require-reconciled` returns newly observed feature code (21) to Step 3 within the merge allowance before resolving `VALIDATED_HEAD`. Bookkeeping retains its covered head. Wait only when `VALIDATED_HEAD` != `ENTRY_HEAD` **or** `REVALIDATE_REASON` = `gate-refusal`: probe for an existing run, dispatch only on absence, then wait at the validated head. Record `ship-revalidate-dispatch`; an exhausted CI wait records `ship-revalidate-timeout` and stops. Success → Step 10. |
+| 10 — Merge Gate + Merge PR | — | `runs gate --pr= --validated= --fresh-base` writes the snapshot before deciding and records each refusal once. Codes 17/19 return to Step 3; 10/11/14 return to Step 9; unavailable evidence or a title skip token stops. `prs merge --ship-retry --match-head=<gate mergeHead> --expect-merged` uses an empty body and leaves deletion to guarded close. Independent rereads return merged → Step 13, moved head (9) → validation, new conflict (10) → integration, or another explicit reason → terminal stop. The same durable allowance counts gate refusals and merge attempts. MCP fallback validates scoped pre/post facts through the engine before taking these routes. Red CI runs regenerate only when every failed step is on `CI_GENERATED_FLOOR` or `bkit.testing.ciGenerated`; committed regeneration plain-pushes and revalidates, while unchanged/undeclared/failed regeneration stops. |
 | 11 — Failure Diagnose | `@bkit-debug-failure-diagnose` (only if not merged) | Writes `ship-failure-diagnose-{MERGE_ATTEMPT}.md`. |
 | 12 — Failure Remediate | `@bkit-debug-failure-remediate` (only if not merged) | Writes `ship-failure-remediate-{MERGE_ATTEMPT}-log.md`. `Strategy` ladder (`STANDARD → PIVOT → FINAL`). PASS → `bkit ledgers commit --scope=full --stage-tracked-updates` commits the fix as `fix({FID}): failure-remediate attempt {MERGE_ATTEMPT}` (no skip token, so CI runs), `bkit branches push --mode=plain` pushes it unforced (ship never forces), → Step 9, which re-validates CI at the new head, then Step 10 re-merges. Resumed after the remediate row (`after` = `ship-failure-remediate`) → sub-step 4 with `verdict` = PASS; `MERGE_ATTEMPT` not held → read back first with `counters derive --step=ship-merge-pr --position=current`. FAIL → Failure Path: its handover sends code-level failures back to build, since a source-file retry loop would re-merge identical remote content. |
 | 13 — Update Local Dev | — | `bkit branches sync-dev`: fetch + fast-forward local `dev` to `origin/dev`, no checkout (`merge --ff-only` + frozen install when the main checkout is on `dev` and `dev` moved; install failure → exit 16 → **Failure Path**). Local-only `dev` commits → logged with the publish command, never pushed; step still passes. Step key `ship-switch-to-dev`. |
diff --git a/.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts b/.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts
index ecac690a1..d0ed794af 100644
--- a/.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts
+++ b/.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts
@@ -258,8 +258,9 @@ describe("bkit-ship.md — Step 10 gate-refusal re-entry is a bounded poll", ()
     const blocks = fences(shipMd).filter((f) =>
       /"\{BKIT\}" counters route --name=MERGE_ATTEMPT\b/.test(f),
     );
-    // Step 10: stale-base integration, polling, regeneration and both merge transports.
-    expect(blocks.length, "MERGE_ATTEMPT routing blocks").toBe(5);
+    // Step 9: late-code reconciliation. Step 10: stale-base and late-code
+    // reconciliation, polling, regeneration and both merge transports.
+    expect(blocks.length, "MERGE_ATTEMPT routing blocks, including two late-code routes").toBe(7);
     for (const block of blocks) {
       expect(block).toContain("--of=ship-merge-pr:count --rows=ship-gate-refusal:count");
       expect(block).not.toMatch(/MERGE_ATTEMPT=|\bjq\b/);
diff --git a/.bkit/core/engine/audits/workflows/ship-invariants.test.ts b/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
index 978f2d85c..98c0582aa 100644
--- a/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
+++ b/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
@@ -210,6 +210,42 @@ describe("ship reconciliation and retry contracts", () => {
     expect(merge).toMatch(/(?:terminal|stop)[^\n]*Failure Path/i);
   });
 
+  it("routes late revalidation code and gate seventeen through reconciliation before merge", () => {
+    const ship = readShip();
+    const revalidate = step(ship, 9);
+    expect(revalidate).toMatch(/runs revalidate[^\n]*--require-reconciled/);
+    expect(revalidate).toMatch(/`reconcileRequired`[^\n]*RECONCILE_REQUIRED/);
+    const lateCode = section(revalidate, /^   - \*\*If\*\* exit 21\b/, /^   - \*\*(?:If|Else)\*\*/);
+    const gateMovement = section(
+      step(ship, 10),
+      /^   - \*\*If\*\* exit 17\b/,
+      /^   - \*\*(?:If|Else)\*\*/,
+    );
+    expect(lateCode.length).toBeGreaterThan(0);
+    expect(gateMovement.length).toBeGreaterThan(0);
+    for (const block of [lateCode, gateMovement]) {
+      expect(block).toMatch(/RECONCILE_REQUIRED[^\n]*true/);
+      expect(block).toMatch(
+        /counters route[^\n]*--name=MERGE_ATTEMPT[^\n]*--of=ship-merge-pr:count[^\n]*--rows=ship-gate-refusal:count/,
+      );
+      expect(block).toContain("--continue=step-3");
+      expect(block).toContain("--exceeded=failure-path");
+      expect(block).toContain("Step 3");
+      expect(block).not.toContain("--continue=step-9");
+      expect(block).not.toContain("Step 11");
+    }
+    expect(revalidate.indexOf("exit 21")).toBeLessThan(revalidate.indexOf("Hold `validatedHead`"));
+    expect(step(ship, 3)).toContain("branches sync --reconcile-feature");
+    for (const number of [5, 6]) {
+      const coverage = step(ship, number);
+      expect(coverage).toContain("FEATURE_CODE_STATE");
+      expect(coverage).toMatch(
+        /(?:record|status)[\s\S]*(?:match|same|unchanged)[\s\S]*(?:reuse|skip)/i,
+      );
+      expect(coverage).toMatch(/(?:chang|differ|mismatch|invalidat)[\s\S]*(?:run|invoke|repeat)/i);
+    }
+  });
+
   it("passes the actual merge target and defers branch deletion to guarded close", () => {
     const ship = readShip();
     const resolver = fs.readFileSync(
@@ -719,15 +755,14 @@ describe("bkit-ship.md — build-challenge remediation regressions", () => {
 
   // Finding 5 (MEDIUM): gate code 11 (in progress — poll) must route to the poll
   // step alongside the other poll-able codes, not fall through to Failure Path.
-  it("F5: gate code 11 (poll) routes to Step 9 alongside codes 10, 14 and 17", () => {
+  it("F5: gate code 11 (poll) routes to Step 9 alongside codes 10 and 14", () => {
     const lines = readShip().split("\n");
     const idx = lines.findIndex((l) => /\bexit 11\b/.test(l));
     expect(idx, "code 11 must have a routing lead-in").toBeGreaterThan(-1);
     expect(lines[idx]).toMatch(/\b14\b/);
     expect(lines[idx]).toMatch(/\b10\b/);
-    expect(lines[idx]).toMatch(/\b17\b/);
     const block = lines.slice(idx, idx + 12).join("\n");
-    expect(block, "codes 10/11/14/17 must route to Step 9, not Failure Path").toMatch(
+    expect(block, "codes 10/11/14 must route to Step 9, not Failure Path").toMatch(
       /"\{BKIT\}" counters route --name=MERGE_ATTEMPT .*--continue=step-9 /,
     );
   });
diff --git a/.bkit/core/engine/commands/workflow/runs.test.ts b/.bkit/core/engine/commands/workflow/runs.test.ts
index e75bf2357..3f5f847b2 100644
--- a/.bkit/core/engine/commands/workflow/runs.test.ts
+++ b/.bkit/core/engine/commands/workflow/runs.test.ts
@@ -1083,6 +1083,99 @@ describe("bkit runs gate", () => {
     expect(foreign.err).toMatch(/scope|repository|ownerRepo/i);
   });
 
+  function scopedMcpCiFixture() {
+    const f = freshBaseFixture();
+    const run = {
+      id: 1900,
+      workflow_id: 456,
+      path: ".github/workflows/bkit-ci.yml",
+      repository: { full_name: "example/example" },
+      head_repository: { full_name: "example/example" },
+      head_sha: f.head,
+      head_branch: "feat/842-gate",
+      event: "push",
+      status: "completed",
+      conclusion: "success",
+      html_url: "https://github.com/example/example/actions/runs/1900",
+    };
+    const job = {
+      id: 19001,
+      name: "bkit-tests-check",
+      status: "completed",
+      conclusion: "success",
+      run_id: run.id,
+      run_url: "https://api.github.com/repos/example/example/actions/runs/1900",
+      head_sha: f.head,
+    };
+    const facts = path.join(f.bin, "ci-provenance-facts.json");
+    const write = (runs: unknown[], jobs: unknown) =>
+      fs.writeFileSync(
+        facts,
+        JSON.stringify({
+          ownerRepo: "example/example",
+          prNumber: 7,
+          headRefName: "feat/842-gate",
+          baseRefName: "dev",
+          pr: f.pr("example/example"),
+          ci: { workflowRuns: { total_count: runs.length, workflow_runs: runs }, jobs },
+          base: {
+            ref: "dev",
+            sha: gitIn(f.cwd, "rev-parse", "origin/dev"),
+            comparedHead: f.head,
+            status: "ahead",
+          },
+        }),
+      );
+    fs.writeFileSync(path.join(f.bin, "unavailable"), "");
+    return { run, job, write, gate: () => f.run("--fresh-base", `--facts-file=${facts}`) };
+  }
+
+  it("rejects MCP green runs from another repository or workflow at the same head", async () => {
+    const f = scopedMcpCiFixture();
+    f.write([f.run], { total_count: 1, jobs: [f.job] });
+    const control = await f.gate();
+    expect(control.code, control.err).toBe(0);
+    expect(control.json.passed).toBe(true);
+    for (const run of [
+      { ...f.run, repository: { full_name: "foreign/repo" } },
+      { ...f.run, path: ".github/workflows/unrelated.yml" },
+      { ...f.run, repository: undefined },
+      { ...f.run, path: undefined, workflow_id: undefined },
+    ]) {
+      f.write([run], { total_count: 1, jobs: [f.job] });
+      const refused = await f.gate();
+      expect(refused.code, JSON.stringify(run)).not.toBe(0);
+      expect(refused.json).toMatchObject({ passed: false });
+    }
+  });
+
+  it("rejects MCP capstone jobs belonging to another run", async () => {
+    const f = scopedMcpCiFixture();
+    // Actions --paginate --slurp yields page objects; the capstone can be on page two.
+    const pages = (job: unknown) => [
+      { total_count: 2, jobs: [{ ...f.job, id: 19002, name: "bkit-tests-unit" }] },
+      { total_count: 2, jobs: [job] },
+    ];
+    f.write([f.run], pages(f.job));
+    const control = await f.gate();
+    expect(control.code, control.err).toBe(0);
+    expect(control.json).toMatchObject({ passed: true, runId: 1900 });
+    for (const job of [
+      { ...f.job, run_id: 9999 },
+      { ...f.job, run_url: "https://api.github.com/repos/example/example/actions/runs/9999" },
+      { ...f.job, head_sha: "a".repeat(40) },
+      { ...f.job, run_url: "https://api.github.com/repos/foreign/repo/actions/runs/1900" },
+      { ...f.job, run_id: undefined },
+      { ...f.job, run_url: undefined },
+      { ...f.job, head_sha: undefined },
+    ]) {
+      f.write([f.run], pages(job));
+      const refused = await f.gate();
+      expect(refused.code, JSON.stringify(job)).not.toBe(0);
+      expect(refused.json).toMatchObject({ passed: false });
+    }
+  });
+
   it("accepts a green capstone at the head (exit 0) and says so", async () => {
     fixtureGh();
     const r = await gate(tmp(), "--head=green-capstone");
@@ -2944,6 +3037,85 @@ describe("bkit runs revalidate", () => {
     });
   });
 
+  it("requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse", async () => {
+    const { cwd, code, file } = shipRepo();
+    const origin = tmp("bkit-revalidate-origin-");
+    gitIn(origin, "init", "-q", "--bare");
+    gitIn(cwd, "remote", "add", "origin", origin);
+    fs.mkdirSync(path.join(cwd, "docs"));
+    fs.writeFileSync(path.join(cwd, "docs/architecture.md"), "ship bookkeeping\n");
+    gitIn(cwd, "add", "docs/architecture.md");
+    gitIn(cwd, "commit", "-qm", "docs: ship bookkeeping");
+    const bookkeeping = gitIn(cwd, "rev-parse", "HEAD");
+    gitIn(cwd, "push", "-qu", "origin", "feat/7-x");
+    const collaborator = tmp("bkit-revalidate-collaborator-");
+    gitIn(collaborator, "clone", "-q", "-b", "feat/7-x", origin, ".");
+    fs.writeFileSync(
+      path.join(collaborator, "late-feature.ts"),
+      "export const lateFeature = true;\n",
+    );
+    gitIn(collaborator, "add", "late-feature.ts");
+    gitIn(collaborator, "commit", "-qm", "feat: late remote feature");
+    gitIn(collaborator, "push", "-q", "origin", "feat/7-x");
+    const remote = gitIn(collaborator, "rev-parse", "HEAD");
+    expect(gitIn(cwd, "rev-parse", "origin/feat/7-x")).toBe(bookkeeping);
+    const replies = {
+      "repo-view": "example/example",
+      "pr-view": JSON.stringify(openPr({ headRefOid: remote })),
+      "run-list": JSON.stringify([{ status: "completed", conclusion: "success", headSha: remote }]),
+    };
+    fakeGhBin(replies);
+    const generic = await revalidate(
+      cwd,
+      `--entry-head=${code}`,
+      `--code-head=${code}`,
+      `--file=${file}`,
+    );
+    expect(generic.code, generic.err).toBe(0);
+    expect(generic.json).toMatchObject({ validatedHead: remote, revalidated: true });
+    const fake = fakeGhBin(replies);
+    const late = await revalidate(
+      cwd,
+      `--entry-head=${code}`,
+      `--code-head=${code}`,
+      `--file=${file}`,
+      "--require-reconciled",
+    );
+    expect(late.code, late.err).toBe(21);
+    expect(late.json).toMatchObject({
+      reconcileRequired: true,
+      currentHead: remote,
+      validatedHead: null,
+      revalidated: false,
+      dispatched: false,
+      probe: null,
+      wait: null,
+    });
+    expect(gitIn(cwd, "rev-parse", "origin/feat/7-x")).toBe(remote);
+    expect(gitIn(cwd, "rev-parse", "HEAD")).toBe(bookkeeping);
+    expect(fake.calls()).not.toMatch(/run list|workflow run/);
+
+    fakeGhBin({
+      "repo-view": "example/example",
+      "pr-view": JSON.stringify(openPr({ headRefOid: bookkeeping })),
+    });
+    const control = await revalidate(
+      cwd,
+      `--entry-head=${code}`,
+      `--code-head=${code}`,
+      `--file=${file}`,
+      "--require-reconciled",
+    );
+    expect(control.code, control.err).toBe(0);
+    expect(control.json).toMatchObject({
+      validatedHead: code,
+      currentHead: bookkeeping,
+      reconcileRequired: false,
+      revalidated: false,
+      dispatched: false,
+    });
+  });
+
   it("an unmoved head needs no CI wait: validated at the code head, nothing dispatched", async () => {
     const { cwd, code, file } = shipRepo();
     prThenFixtureGh(openPr({ headRefOid: code }));
diff --git a/.bkit/core/engine/commands/workflow/runs.ts b/.bkit/core/engine/commands/workflow/runs.ts
index 85db107e0..4a3d3ff8e 100644
--- a/.bkit/core/engine/commands/workflow/runs.ts
+++ b/.bkit/core/engine/commands/workflow/runs.ts
@@ -2024,20 +2024,61 @@ function runGate(ctx: RunContext): number {
           if (args[0] === "repo" && args[1] === "view")
             return { ok: true, stdout: repo, stderr: "", missing: false };
           const workflow = readBkitConfig(checkoutRoot(ctx.cwd)).ciWorkflow;
+          const scopedRuns = arr(obj(ci.workflowRuns).workflow_runs).map(obj);
+          const workflowPath = workflow.startsWith(".github/workflows/")
+            ? workflow
+            : `.github/workflows/${workflow}`;
+          const validRun = (run: Record<string, unknown>) =>
+            Number.isSafeInteger(run.id) &&
+            Number(run.id) > 0 &&
+            text(obj(run.repository).full_name).toLowerCase() === repo.toLowerCase() &&
+            text(obj(run.head_repository).full_name).toLowerCase() === repo.toLowerCase() &&
+            (text(run.path) === workflowPath ||
+              (/^[1-9][0-9]*$/.test(workflow) && String(run.workflow_id) === workflow)) &&
+            run.head_sha === (str(f.validated) ?? obj(facts.pr).headRefOid) &&
+            run.head_branch === facts.headRefName &&
+            run.html_url === `https://github.com/${repo}/actions/runs/${run.id}`;
+          const invalidEvidence = (): GhResult => ({
+            ok: false,
+            stdout: "",
+            stderr: "scoped gate CI provenance is missing or mismatched",
+            missing: false,
+          });
           if (
             args[0] === "api" &&
             endpoint.startsWith(`repos/${repo}/actions/workflows/${workflow}/runs?`)
-          )
+          ) {
+            if (
+              !Array.isArray(obj(ci.workflowRuns).workflow_runs) ||
+              scopedRuns.some((run) => !validRun(run))
+            )
+              return invalidEvidence();
             return reply(ci.workflowRuns);
+          }
           const jobMatch = new RegExp(`^repos/${repo}/actions/runs/([0-9]+)/jobs$`).exec(endpoint);
-          if (
-            args[0] === "api" &&
-            jobMatch &&
-            arr(obj(ci.workflowRuns).workflow_runs).some(
-              (run) => String(obj(run).id) === jobMatch[1],
+          if (args[0] === "api" && jobMatch) {
+            const run = scopedRuns.find((candidate) => String(candidate.id) === jobMatch[1]);
+            const pages = Array.isArray(ci.jobs) ? ci.jobs : [ci.jobs];
+            if (
+              !run ||
+              !validRun(run) ||
+              pages.length === 0 ||
+              pages.some(
+                (page) =>
+                  !Array.isArray(obj(page).jobs) ||
+                  arr(obj(page).jobs).some((value) => {
+                    const job = obj(value);
+                    return (
+                      job.run_id !== run.id ||
+                      job.head_sha !== run.head_sha ||
+                      job.run_url !== `https://api.github.com/repos/${repo}/actions/runs/${run.id}`
+                    );
+                  }),
+              )
             )
-          )
+              return invalidEvidence();
             return reply(ci.jobs);
+          }
           return {
             ok: false,
             stdout: "",
@@ -2353,6 +2394,7 @@ async function runRevalidate(ctx: RunContext): Promise<number> {
   // CI must pass at the code head while the PR head adds bookkeeping only and dev
   // demands no status checks; otherwise at the PR head.
   let validated = codeHead;
+  let reconcileRequired = current !== codeHead;
   if (foreign) {
     // The bookkeeping diff reads the checkout's git, which is not the named repo's history.
     ctx.log(
@@ -2366,8 +2408,23 @@ async function runRevalidate(ctx: RunContext): Promise<number> {
       from: codeHead,
       to: current,
     });
+    reconcileRequired = !book.ok;
     if (!book.ok) validated = current;
   }
+  if (f.requireReconciled === true && reconcileRequired) {
+    auditRow(status, "ship-gate-refusal", { exitCode: 21, head: current });
+    ctx.log(`feature code changed at ${current} — reconcile before CI validation`);
+    ctx.emit({
+      reconcileRequired: true,
+      validatedHead: null,
+      currentHead: current,
+      revalidated: false,
+      probe: null,
+      dispatched: false,
+      wait: null,
+    });
+    return 21;
+  }
   const repo = repoFlag ?? resolveOwnerRepo(ctx.cwd)?.ownerRepo;
   if (repo !== undefined && devRequiresChecks(d.gh, repo)) {
     ctx.log(`dev requires status checks — validating at the PR head ${current}`);
@@ -2375,6 +2432,7 @@ async function runRevalidate(ctx: RunContext): Promise<number> {
   }
 
   const out: Record<string, unknown> = {
+    ...(f.requireReconciled === true ? { reconcileRequired: false } : {}),
     validatedHead: validated,
     currentHead: current,
     revalidated: false,
@@ -2950,6 +3008,11 @@ export const runsCommand: CommandSpec = {
         "Ship: pick the head CI must pass at, probe for a run there, dispatch only when none, wait for it to complete.",
       use: "workflow",
       flags: [
+        {
+          name: "require-reconciled",
+          type: "boolean",
+          help: "refuse newly observed feature code before CI validation",
+        },
         { name: "pr", type: "string", required: true, help: "the PR number" },
         { name: "entry-head", type: "string", required: true, help: "the PR head read at Step 2" },
         {
@@ -2986,13 +3049,18 @@ export const runsCommand: CommandSpec = {
       ],
       output: {
         validatedHead: "the head CI was (or must be) checked at",
+        reconcileRequired:
+          "with --require-reconciled, whether new feature code needs reconciliation",
         currentHead: "the PR head now",
         revalidated: "a probe / wait ran (the head moved, or a gate refusal re-entered)",
         probe: "the presence probe's wait result, or null",
         dispatched: "the probe found no run and dispatched one",
         wait: "the completion wait's result, or null",
       },
-      exitCodes: { [EXIT_TRIGGER_FAILED]: "no run and gh workflow run failed" },
+      exitCodes: {
+        [EXIT_TRIGGER_FAILED]: "no run and gh workflow run failed",
+        21: "--require-reconciled: new feature code needs reconciliation",
+      },
       run: runRevalidate,
     },
     mirror: {
diff --git a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
index 4344a5de4..57569aa40 100644
--- a/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
+++ b/.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt
@@ -565,9 +565,25 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
 **If** `RECONCILE_REQUIRED` = true → clear it → Step 3 before validation. A previous `DONE` row alone never proves coverage of imported feature code.
 
 1. Resolve the head CI must pass at. The block re-validates when the code moved **or** `REVALIDATE_REASON` = `gate-refusal`: it probes for a run at it first, dispatches only when none, and waits for it to complete. Drop `--reason` when `REVALIDATE_REASON` is empty:
+
    ```bash
-   "{BKIT}" runs revalidate --pr="{PR_NUMBER}" --entry-head="{ENTRY_HEAD}" --code-head="{CODE_HEAD}" --branch="{SHIP_BRANCH}" --month="{YYYYMM}" --fid="{FID}" --file="{STATUS}" --reason="{REVALIDATE_REASON}" --repo="{OWNER_REPO}"
+   "{BKIT}" runs revalidate --pr="{PR_NUMBER}" --require-reconciled --entry-head="{ENTRY_HEAD}" --code-head="{CODE_HEAD}" --branch="{SHIP_BRANCH}" --month="{YYYYMM}" --fid="{FID}" --file="{STATUS}" --reason="{REVALIDATE_REASON}" --repo="{OWNER_REPO}"
    ```
+
+   Hold `reconcileRequired` as `RECONCILE_REQUIRED`.
+   Route:
+   - **If** exit 21 → set `RECONCILE_REQUIRED` = true → route the recorded failed arrival to reconciliation:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path**.
+   - **If** exit 0 → continue with the next instruction.
+   - **If** exit 81 → end turn, re-run this block.
+   - **Else** → **Failure Path**.
+
    Hold `validatedHead` as `VALIDATED_HEAD`.
 
 ### 🔒 Gate 9 — Re-validate
@@ -587,7 +603,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
    ```bash
    "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fetch --fresh-base --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
    ```
-   **If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
+   **If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Each run must carry its positive integer `id`, `repository.full_name`, `head_repository.full_name`, configured workflow `path` (or matching numeric `workflow_id`), `head_sha`, `head_branch` and repository-scoped `html_url`. Both repositories must match `ownerRepo`; the head must match `VALIDATED_HEAD` and `headRefName`. Each job must carry `run_id`, `run_url` and `head_sha` matching its selected run and repository. Retain every jobs page in the paginated array. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
    ```bash
    "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fresh-base --facts-file="{OUTBOX}/ship-gate-facts.json" --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
    ```
@@ -601,7 +617,15 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
      - **If** exit 0 → Step 3.
      - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
      - **Else** → **Failure Path**, preserving the branch and worktree on exhaustion.
-   - **If** exit 11 (in progress — poll), 14 (stale green), 10 (no run) **or** 17 (non-bookkeeping change past `VALIDATED_HEAD`) → route on the failed arrivals at Step 10, without asking:
+   - **If** exit 17 (non-bookkeeping change past `VALIDATED_HEAD`) → set `RECONCILE_REQUIRED` = true → route the recorded failed arrival to reconciliation:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path**.
+   - **If** exit 11 (in progress — poll), 14 (stale green) **or** 10 (no run) → route on the failed arrivals at Step 10, without asking:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
      ```
diff --git a/.bkit/core/workflows/bkit-ship.md b/.bkit/core/workflows/bkit-ship.md
index ac74b0cdd..1ad04ba1b 100644
--- a/.bkit/core/workflows/bkit-ship.md
+++ b/.bkit/core/workflows/bkit-ship.md
@@ -645,9 +645,25 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
 **If** `RECONCILE_REQUIRED` = true → clear it → Step 3 before validation. A previous `DONE` row alone never proves coverage of imported feature code.
 
 1. Resolve the head CI must pass at. The block re-validates when the code moved **or** `REVALIDATE_REASON` = `gate-refusal`: it probes for a run at it first, dispatches only when none, and waits for it to complete. Drop `--reason` when `REVALIDATE_REASON` is empty:
+
    ```bash
-   "{BKIT}" runs revalidate --pr="{PR_NUMBER}" --entry-head="{ENTRY_HEAD}" --code-head="{CODE_HEAD}" --branch="{SHIP_BRANCH}" --month="{YYYYMM}" --fid="{FID}" --file="{STATUS}" --reason="{REVALIDATE_REASON}" --repo="{OWNER_REPO}"
+   "{BKIT}" runs revalidate --pr="{PR_NUMBER}" --require-reconciled --entry-head="{ENTRY_HEAD}" --code-head="{CODE_HEAD}" --branch="{SHIP_BRANCH}" --month="{YYYYMM}" --fid="{FID}" --file="{STATUS}" --reason="{REVALIDATE_REASON}" --repo="{OWNER_REPO}"
    ```
+
+   Hold `reconcileRequired` as `RECONCILE_REQUIRED`.
+   Route:
+   - **If** exit 21 → set `RECONCILE_REQUIRED` = true → route the recorded failed arrival to reconciliation:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path**.
+   - **If** exit 0 → continue with the next instruction.
+   - **If** exit 81 → end turn, re-run this block.
+   - **Else** → **Failure Path**.
+
    Hold `validatedHead` as `VALIDATED_HEAD`.
 
 ### 🔒 Gate 9 — Re-validate
@@ -667,7 +683,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
    ```bash
    "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fetch --fresh-base --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
    ```
-   **If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
+   **If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Each run must carry its positive integer `id`, `repository.full_name`, `head_repository.full_name`, configured workflow `path` (or matching numeric `workflow_id`), `head_sha`, `head_branch` and repository-scoped `html_url`. Both repositories must match `ownerRepo`; the head must match `VALIDATED_HEAD` and `headRefName`. Each job must carry `run_id`, `run_url` and `head_sha` matching its selected run and repository. Retain every jobs page in the paginated array. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
    ```bash
    "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fresh-base --facts-file="{OUTBOX}/ship-gate-facts.json" --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
    ```
@@ -681,7 +697,15 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
      - **If** exit 0 → Step 3.
      - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
      - **Else** → **Failure Path**, preserving the branch and worktree on exhaustion.
-   - **If** exit 11 (in progress — poll), 14 (stale green), 10 (no run) **or** 17 (non-bookkeeping change past `VALIDATED_HEAD`) → route on the failed arrivals at Step 10, without asking:
+   - **If** exit 17 (non-bookkeeping change past `VALIDATED_HEAD`) → set `RECONCILE_REQUIRED` = true → route the recorded failed arrival to reconciliation:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path**.
+   - **If** exit 11 (in progress — poll), 14 (stale green) **or** 10 (no run) → route on the failed arrivals at Step 10, without asking:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
      ```
diff --git a/.bkit/instructions.md b/.bkit/instructions.md
index ef56ce667..963f6ef23 100644
--- a/.bkit/instructions.md
+++ b/.bkit/instructions.md
@@ -10387,7 +10387,9 @@ Branch pushed
 Validated head resolved
 CI re-validated (`runs revalidate`)
 [merge-bodies] Assert the gate at the PR's current head, with CI checked at `VALIDATED_HEAD`. This gate is the ONLY merge precondition. The block writes the pre-merge snapshot to the outbox before the gate decides, refuses a title that carries a skip token (18), and records a refusal in `{STATUS}`:
-[polls-loops] **If** exit 11 (in progress — poll), 14 (stale green), 10 (no run) **or** 17 (non-bookkeeping change past `VALIDATED_HEAD`) → route on the failed arrivals at Step 10, without asking:
+[polls-loops] **If** exit 21 → set `RECONCILE_REQUIRED` = true → route the recorded failed arrival to reconciliation:
+[polls-loops] **If** exit 17 (non-bookkeeping change past `VALIDATED_HEAD`) → set `RECONCILE_REQUIRED` = true → route the recorded failed arrival to reconciliation:
+[polls-loops] **If** exit 11 (in progress — poll), 14 (stale green) **or** 10 (no run) → route on the failed arrivals at Step 10, without asking:
 **If** exit 1 **and** `MERGE_ASK` = true → set `{REVALIDATE_REASON}` = `gate-refusal`, `LIMIT_NEXT` = Step 9 → **Merge Question**.
 **If** exit 12 **and** `regenerable` = true → every failed CI step is one `bkit:generate` fixes (`bkit.testing.ciGenerated`). Route on the failed arrivals at Step 10, without asking:
 **If** exit 0 **and** `REGEN_OUTCOME` = committed → push the fix, and NEVER force:
@@ -10440,7 +10442,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-deferred-s
 Reconciled feature-code state compared with recorded sweep coverage
 Read the latest successful `ship-feature-coverage` row for `step=ship-update-docs` from `{STATUS}`. **If** its recorded feature-code state matches `FEATURE_CODE_STATE` and the docs artifact exists → reuse it and skip sub-steps 1–3. **If** the state changed, differs or is missing → run the docs agent again. Always refresh the summary in sub-step 4.
 **If** `RECONCILE_REQUIRED` = true → clear it → Step 3 before validation. A previous `DONE` row alone never proves coverage of imported feature code.
-**If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
+**If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Each run must carry its positive integer `id`, `repository.full_name`, `head_repository.full_name`, configured workflow `path` (or matching numeric `workflow_id`), `head_sha`, `head_branch` and repository-scoped `html_url`. Both repositories must match `ownerRepo`; the head must match `VALIDATED_HEAD` and `headRefName`. Each job must carry `run_id`, `run_url` and `head_sha` matching its selected run and repository. Retain every jobs page in the paginated array. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
 **If** exit 19 (stale base) → the gate already recorded one failed arrival; route to integration:
 **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
 **Else** → **Failure Path**, preserving the branch and worktree on exhaustion.
diff --git a/.bkit/version b/.bkit/version
index 51e989bfe..13040e9f1 100644
--- a/.bkit/version
+++ b/.bkit/version
@@ -14,7 +14,7 @@
     "docs/data-schema.md": "04a3b4453f53ee349c774c5bf28ef439d2488ed8ee17a0e0840f98911f530a2c",
     ".gitattributes": "33399602be95aaa41c6539ffea6dc408358af3b4358201a97938b434a945d35f",
     ".cursor/hooks.json": "cf9861764a08d8ad4a4892f4d097811f8f77838b16e27c140a544903a8d4bf05",
-    "docs/observability.md": "282237094c6c5eefb6ebf7c7b2e38d61d8f494f08245cd02b58afce55e55b57c",
+    "docs/observability.md": "91e2b42251a5f141239006c041ba3638ee213250714e27df1b1b8fc51eff7dc3",
     ".gitignore": "7b18419d0469def99a4a9c05f28e734f6258b2e60755c640a041a84b4d60275b",
     "docs/security.md": "ccf6c376c8a347972a335a43232f3d5db49acb9d0c9083f6c52c73de3013cb10",
     ".mcp.json": "65b29f1bb28dd6296d1dc8ea34aca4826d9ca072d7cef9d2971a7045280505d9",
@@ -28,7 +28,7 @@
     ".claude/commands/bkit-debug.md": "f823954f3304334ed8be9f42e24e2a47134ec45bbc278620d52a261dd9e60e16",
     ".claude/commands/bkit-design.md": "19a95a441ac6dba3b45982fb284817a7c908bf8a94b7f7a99e31ff46b1f7622a",
     ".claude/commands/bkit-plan.md": "0341314c76583e079ea635940d45c4da20ce4725d963d28aa4678adbff4eba6e",
-    ".claude/commands/bkit-ship.md": "bb7a8e50e9ede87544cfac75c555cb0e7301d147e516d44fe38378aa3523d78c",
+    ".claude/commands/bkit-ship.md": "4abe6b40e0d85b125b6a19a41d19bf29fff77a41ca222f1128f75f3619af5c60",
     ".claude/agents/bkit-build-challenge-1.md": "1f0761c059842a1dcefff95f27fe3cc68e41155f03c8929d88ccc0c83461d290",
     ".claude/agents/bkit-build-challenge-2.md": "1ec51a399c91f576f95af0e0625983ded825282f0050540007a288c364777227",
     ".claude/agents/bkit-build-install-skills.md": "4da65c11fa042e5b578717c510dfaf3e8fe51466c04adc63cb16a8215913b817",
@@ -60,7 +60,7 @@
     ".cursor/commands/bkit-debug.md": "5c9c0b07c266086fc0081f185931cf23199dc11598a53214ccaf55dcc11fc465",
     ".cursor/commands/bkit-design.md": "37c549d2480700d1560e84f75cf7303de22e4e1b3e4d344c011b980d3df04ef7",
     ".cursor/commands/bkit-plan.md": "a20499d7f63bd6927bbf8615b4363e0b52ab5328e3ec588399c9ee76ff45633b",
-    ".cursor/commands/bkit-ship.md": "3ab4feb9a5f686982d263356dfd2a272cadb401cc07f97a5f50198385e8f84da",
+    ".cursor/commands/bkit-ship.md": "9dc2f775e030710509a5d6b6ad323c2e8e4e7e6166e24bef3bf77be8c3fb5b31",
     ".cursor/agents/bkit-build-challenge-1.md": "38fb30e36724318e5e986f69ad598e5f5b4b087b084101e68d330d9353287ff2",
     ".cursor/agents/bkit-build-challenge-2.md": "de62e52353593d44629e9b32d824578e629815566c7e7cf81336d2ec396fbe69",
     ".cursor/agents/bkit-build-install-skills.md": "823ebd00f4d9e732796520677b2d2b5aa17fbd72dcbc9a92ff78bf141c44af95",
@@ -118,7 +118,7 @@
     ".opencode/commands/bkit-debug.md": "fd6fb51723987c3207200d2dd3c80bd2baedca303321ca1d1afbd32b591cc30d",
     ".opencode/commands/bkit-design.md": "dc44ed4aa15a92ec39321cb6771447e6e33665dbb8bced3f74c5bde487d8ddec",
     ".opencode/commands/bkit-plan.md": "5ef51aac5d84bc5fbdde4a2809186cada12ef9e0ed902ce50c21d4e93aebf380",
-    ".opencode/commands/bkit-ship.md": "99873baf3abf8f122b49f3252efad6a9b31bfe712f18f45a0fb529d9ad2cd4ad",
+    ".opencode/commands/bkit-ship.md": "4cb5abdb2a3c391a6799b221f928877cb234b5f7b95f136953a37bddeeed43c0",
     ".claude/agents/bkit-design-spike.md": "6ebe2fa4b367cf183bf1fe766e95afff9ebcbfd5b25f86bd3e74af7c43833861",
     ".cursor/agents/bkit-design-spike.md": "996a40f60dde3f1c3cc8ce47cdf13e1bf3524aadc73b29ae7bdfb12cd120b7b2",
     ".opencode/agents/bkit-design-spike.md": "1b809bb8969f4b9e667c353acc28c673af0163486770aa9054027af638fb173d",
@@ -224,7 +224,7 @@
     ".bkit/providers.md": "556318e0b5573604d0d56acfa315af47ea45c26a71e2e59600514d2cb3c431fc",
     ".bkit/prompts.md": "3151fa666e4cbfb6f0634c3a162d4d363cdecceffd61584371ba80f2c477095e",
     ".bkit/trackers.md": "9db8826f990a21a46a8f70a2022d5a2e0e21c64fc50b3b5aecf84d146b6e094a",
-    ".bkit/workflows.md": "536446223c2feac409d0f397ad3b953c2bb6b28ee6d610dbe81f9d280da29fec",
+    ".bkit/workflows.md": "c1f492aed4719408898cbc0c679490e349962fe1eaf08db720e549cb31a136c0",
     ".bkit/README.md": "30c3136159e0a5e8a1fa49c88de861147db7c63914fd319c52e1e7ea87437b25",
     ".cursor/rules/bkit-rules.mdc": "0c15e475a322bd66f4f2258b5ffc2a6700bb9c9d217a75fa18d8168c9e1106e8",
     ".claude/hooks/bkit-gateguard.cjs": "804315c40da562f88628d751ca75bdc27707f295a9346fed1c0db7d4ddb56d84",
@@ -264,7 +264,7 @@
     ".codex/hooks/bkit-rules.cjs": "8aee2cde5448c083ae0dc07a4f1db86ce7e815a2a2eafe54b886b7f4393cab91",
     ".opencode/plugin/bkit-rules.js": "417d3ca107ebf005060953a17340620e1fcfb5bcdf491316a937e0c747b0377e",
     ".bkit/router.md": "c20d006757e350c173da94686d48500bc83e12d9f7bb6ff5911e47e332e45eab",
-    ".bkit/cli.md": "db3789f5093947588dc048de5113aee7fcd3925a6563ba98a99f0aeede011a79",
+    ".bkit/cli.md": "f7c40f9d7e6a3a95f1e3ba3f8b92746baff6f08b384fbf50f45cdb603046a5ef",
     ".claude/agents/bkit-build-plan-tests.md": "f7b4e6be48b6950d27256c42d5d2c48b20bd23b90d66b0d1f59745a33ad251b5",
     ".cursor/agents/bkit-build-plan-tests.md": "57996d02186862b35c6e22dd150e0b1d19a243f10fddb16002feefd7d42c7838",
     ".opencode/agents/bkit-build-plan-tests.md": "896af5e894b0ae4c9911cc5ee3f54e5426efdf2e4f8ec5c758ed990b82fac6d4",
diff --git a/.bkit/workflows.md b/.bkit/workflows.md
index 7e1134565..ffcc0b7e0 100644
--- a/.bkit/workflows.md
+++ b/.bkit/workflows.md
@@ -109,7 +109,7 @@ Rendering can be re-run: the source carries every wired variant, so a tracker sw
 - **Ship Step 6 fold runs after the two subagents and stages nothing itself:** the same fence runs `bkit roadmap feature --root="$WT" --step=ship-update-docs` (`$WT` = `{WORKTREE_PATH}`), which appends the `SHIPPED` row and folds. Both paths ride the PR in Step 8's `--scope=pr` commit (§ `/bkit-ship` — Docs and bookkeeping ride the PR). `DOCS_VERDICT` requires the command to report the row appended with `status` = `SHIPPED`. A `BUILT` row from the build close must not turn it green.
 - **Phase closes are mechanical-tier only:** a ship close writes its own feature's ledger row and re-renders the `roadmap-status` board. It runs no analysis, because analysis is a review a human invokes, never a cost paid on every ship.
 - **Ship re-validate probes before dispatching:** the head move already fires `pull_request` at that SHA. `bkit-ci.yml` keys `pull_request` concurrency by PR number and `workflow_dispatch` by ref. These are separate groups, so a duplicate is never cancelled and burns a full run. `bkit runs wait --head=<VALIDATED_HEAD> --until=present --dispatch-if-absent` probes for a run at that SHA (6 polls) and dispatches only when there is no run. The probe is never a pass condition. It uses `--head`, not `--pr`: a PR target reads the PR head's `statusCheckRollup`, and the PR head (ship's `[skip ci]` bookkeeping commit) never gets a run. Run targets are anchored to the head, because the newest run on the branch can be a COMPLETED run from a superseded head.
-- **Ship retries reuse only matching feature coverage:** gate codes 10 / 11 / 14 / 17 return to CI validation, and fresh-base code 19 returns to reconciliation and integration. Merge refusals use `route=revalidate` when the head moved and `route=integrate` for a conflict with dev. Each gate refusal or attempted merge consumes one arrival in `ship.merge.maxAttempts`. `branches sync --feature-state` recomputes coverage before each sweep/docs reuse decision. Imported feature merges and semantic conflict resolutions invalidate coverage; bookkeeping and proven automatic dev-only merges retain it.
+- **Ship retries reuse only matching feature coverage:** gate codes 10 / 11 / 14 return to CI validation; gate code 17 and revalidation code 21 return to reconciliation and refreshed feature coverage. Fresh-base code 19 returns to reconciliation and integration. Merge refusals use `route=revalidate` when the head moved and `route=integrate` for a conflict with dev. Each gate refusal or attempted merge consumes one arrival in `ship.merge.maxAttempts`. `branches sync --feature-state` recomputes coverage before each sweep/docs reuse decision. Imported feature merges and semantic conflict resolutions invalidate coverage; bookkeeping and proven automatic dev-only merges retain it.
 - **Build close-workflow push does not trigger CI:** there is no PR yet. `bkit prs open` on the pushed HEAD is the single CI trigger.
 - **Design / plan close on HARD STOP:** a human must review before the next phase.
 - **No archive step in ship:** artifacts sit at the canonical `docs/plans/{YYYYMM}/` from the start of design, so there is nothing to move at close.
@@ -1090,7 +1090,8 @@ The following table describes the local discovery route and shared step mechanic
 - This is the one definition of ship's bookkeeping. Ship's Step 8 commit, `bkit ledgers only-bookkeeping`, the merge gate's carry-forward, `bkit ci min-push` and the pre-push hook's `bkit ci bookkeeping-push` all read it, so ship's `[skip ci]` bookkeeping push reaches the open PR.
 - CI is awaited only when `VALIDATED_HEAD` != `ENTRY_HEAD`, or on gate-refusal re-entry, so a PR that arrives green costs zero extra runs. Path B pays one run: the Step 4 merge of `origin/dev` moves the head, and Step 9 dispatches CI at the merged head, so a clash between the branch and newer `dev` commits surfaces as a red PR before the merge, not as a red `dev` push run after it.
 - Step 4 integrates dev locally because GitHub ignores `merge=union`. After an attempted merge, `prs merge --ship-retry` independently rereads the PR: moved head returns to validation, a new conflict returns to integration, and other refusals stop with a reason. These refusals do not enter CI diagnosis or remediation.
-- `runs gate --fresh-base` reads fresh dev evidence and requires dev to be an ancestor of the validated code head, before accepting a CI override or bookkeeping carry-forward. Stale dev exits 19 and returns to integration within the merge allowance; missing or mismatched evidence exits 20. Scoped MCP fact files go through the same engine decisions.
+- `runs revalidate --require-reconciled` refuses newly observed feature code with exit 21 before CI validation. It records one `ship-gate-refusal` arrival and returns to Step 3 for reconciliation, inherited-dev checks and refreshed sweep/docs coverage. Bookkeeping-only descendants retain their covered head; callers without the flag retain generic revalidation.
+- `runs gate --fresh-base` reads fresh dev evidence and requires dev to be an ancestor of the validated code head, before accepting a CI override or bookkeeping carry-forward. Stale dev exits 19 and returns to integration within the merge allowance; missing or mismatched evidence exits 20. Scoped MCP fact files go through the same engine decisions. Their nested Actions runs must prove the requested repository, configured workflow, branch and validated head; every paginated job must prove its selected run, repository URL and head. Missing provenance refuses the gate.
 - The freshness check and GitHub's merge request are separate API operations. The request pins the feature head but cannot atomically pin the base. Dev may move in that interval; the post-merge squash capstone remains the detection boundary for that residual race.
 - `bkit runs gate --head=<PR head> --validated=<VALIDATED_HEAD> --month= --fid=` re-checks the relation itself (non-bookkeeping change or non-ancestor → code 17), then runs every check at the validated SHA. `--match-head-commit <PR head>` still pins what merges.
 - The bookkeeping commit merges untested. `lint-staged` formats it at commit, and post-merge `dev` CI (`ship-merge-ci` row) is the backstop.
@@ -1118,8 +1119,8 @@ The following table describes the local discovery route and shared step mechanic
 | 6 — Update Docs & Summary | `@bkit-ship-update-docs`, then `bkit workflows summary --pr={PR_NUMBER}` | Recompute coverage and reuse docs work only with matching recorded feature coverage and an existing artifact; otherwise rerun the docs agent. `context ledger-scan` supplies its pending-item artifact. `roadmap feature` appends `SHIPPED` and folds the board before recording successful docs coverage. Refresh the summary on every pass; a FAIL summary stops the merge. |
 | 7 — Prune Skills | — | `bkit skills prune` in the worktree: uninstalls every non-`bkit-*` skill `.agents/skills.md` does not list (whole-name match). Warns and carries on: a missing registry skips the prune, a failed uninstall is listed in `failed`. Reconciles the union of on-disk `.agents/skills/` directories and `skills-lock.json` keys — a disk-only scan strands lock entries whose directory was removed out-of-band. |
 | 8 — Commit + Push Bookkeeping | — | Record `CODE_HEAD`; `ship-bookkeeping-push` row first; one `bkit ledgers commit --scope=pr` commit `docs({FID}): ship bookkeeping bkit [skip ci]` (docs, FID logs, ledgers, skill removals; refuses on `dev`, `main` or a detached HEAD, exit 12); `bkit branches push --mode=plain` to `{SHIP_BRANCH}` only when `outcome` = committed — an unconditional push would start a CI run on every ship. |
-| 9 — Re-validate | — | Resolve `VALIDATED_HEAD` (carry-forward above). Wait only when `VALIDATED_HEAD` != `ENTRY_HEAD` **or** `REVALIDATE_REASON` = `gate-refusal`: `bkit runs wait --head=<VALIDATED_HEAD> --until=present --dispatch-if-absent` (6 polls; `gh workflow run {bkit.testing.ciWorkflow}` only on no-run, then `VALIDATED_HEAD` = PR head) → `ship-revalidate-dispatch` row → head-anchored `--until=completed` (`SHIP_CI_WAIT_TIMEOUT_S`; budget exhausted → `ship-revalidate-timeout` row → Failure Path) → Step 10. |
-| 10 — Merge Gate + Merge PR | — | `runs gate --pr= --validated= --fresh-base` writes the snapshot before deciding and records each refusal once. Code 19 returns to Step 3; 10/11/14/17 return to Step 9; unavailable evidence or a title skip token stops. `prs merge --ship-retry --match-head=<gate mergeHead> --expect-merged` uses an empty body and leaves deletion to guarded close. Independent rereads return merged → Step 13, moved head (9) → validation, new conflict (10) → integration, or another explicit reason → terminal stop. The same durable allowance counts gate refusals and merge attempts. MCP fallback validates scoped pre/post facts through the engine before taking these routes. Red CI runs regenerate only when every failed step is on `CI_GENERATED_FLOOR` or `bkit.testing.ciGenerated`; committed regeneration plain-pushes and revalidates, while unchanged/undeclared/failed regeneration stops. |
+| 9 — Re-validate | — | `runs revalidate --require-reconciled` returns newly observed feature code (21) to Step 3 within the merge allowance before resolving `VALIDATED_HEAD`. Bookkeeping retains its covered head. Wait only when `VALIDATED_HEAD` != `ENTRY_HEAD` **or** `REVALIDATE_REASON` = `gate-refusal`: probe for an existing run, dispatch only on absence, then wait at the validated head. Record `ship-revalidate-dispatch`; an exhausted CI wait records `ship-revalidate-timeout` and stops. Success → Step 10. |
+| 10 — Merge Gate + Merge PR | — | `runs gate --pr= --validated= --fresh-base` writes the snapshot before deciding and records each refusal once. Codes 17/19 return to Step 3; 10/11/14 return to Step 9; unavailable evidence or a title skip token stops. `prs merge --ship-retry --match-head=<gate mergeHead> --expect-merged` uses an empty body and leaves deletion to guarded close. Independent rereads return merged → Step 13, moved head (9) → validation, new conflict (10) → integration, or another explicit reason → terminal stop. The same durable allowance counts gate refusals and merge attempts. MCP fallback validates scoped pre/post facts through the engine before taking these routes. Red CI runs regenerate only when every failed step is on `CI_GENERATED_FLOOR` or `bkit.testing.ciGenerated`; committed regeneration plain-pushes and revalidates, while unchanged/undeclared/failed regeneration stops. |
 | 11 — Failure Diagnose | `@bkit-debug-failure-diagnose` (only if not merged) | Writes `ship-failure-diagnose-{MERGE_ATTEMPT}.md`. |
 | 12 — Failure Remediate | `@bkit-debug-failure-remediate` (only if not merged) | Writes `ship-failure-remediate-{MERGE_ATTEMPT}-log.md`. `Strategy` ladder (`STANDARD → PIVOT → FINAL`). PASS → `bkit ledgers commit --scope=full --stage-tracked-updates` commits the fix as `fix({FID}): failure-remediate attempt {MERGE_ATTEMPT}` (no skip token, so CI runs), `bkit branches push --mode=plain` pushes it unforced (ship never forces), → Step 9, which re-validates CI at the new head, then Step 10 re-merges. Resumed after the remediate row (`after` = `ship-failure-remediate`) → sub-step 4 with `verdict` = PASS; `MERGE_ATTEMPT` not held → read back first with `counters derive --step=ship-merge-pr --position=current`. FAIL → Failure Path: its handover sends code-level failures back to build, since a source-file retry loop would re-merge identical remote content. |
 | 13 — Update Local Dev | — | `bkit branches sync-dev`: fetch + fast-forward local `dev` to `origin/dev`, no checkout (`merge --ff-only` + frozen install when the main checkout is on `dev` and `dev` moved; install failure → exit 16 → **Failure Path**). Local-only `dev` commits → logged with the publish command, never pushed; step still passes. Step key `ship-switch-to-dev`. |
diff --git a/.claude/commands/bkit-ship.md b/.claude/commands/bkit-ship.md
index 1b9a7f98e..c44d4b7de 100644
--- a/.claude/commands/bkit-ship.md
+++ b/.claude/commands/bkit-ship.md
@@ -600,9 +600,25 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
 **If** `RECONCILE_REQUIRED` = true → clear it → Step 3 before validation. A previous `DONE` row alone never proves coverage of imported feature code.
 
 1. Resolve the head CI must pass at. The block re-validates when the code moved **or** `REVALIDATE_REASON` = `gate-refusal`: it probes for a run at it first, dispatches only when none, and waits for it to complete. Drop `--reason` when `REVALIDATE_REASON` is empty:
+
    ```bash
-   "{BKIT}" runs revalidate --pr="{PR_NUMBER}" --entry-head="{ENTRY_HEAD}" --code-head="{CODE_HEAD}" --branch="{SHIP_BRANCH}" --month="{YYYYMM}" --fid="{FID}" --file="{STATUS}" --reason="{REVALIDATE_REASON}" --repo="{OWNER_REPO}"
+   "{BKIT}" runs revalidate --pr="{PR_NUMBER}" --require-reconciled --entry-head="{ENTRY_HEAD}" --code-head="{CODE_HEAD}" --branch="{SHIP_BRANCH}" --month="{YYYYMM}" --fid="{FID}" --file="{STATUS}" --reason="{REVALIDATE_REASON}" --repo="{OWNER_REPO}"
    ```
+
+   Hold `reconcileRequired` as `RECONCILE_REQUIRED`.
+   Route:
+   - **If** exit 21 → set `RECONCILE_REQUIRED` = true → route the recorded failed arrival to reconciliation:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path**.
+   - **If** exit 0 → continue with the next instruction.
+   - **If** exit 81 → end turn, re-run this block.
+   - **Else** → **Failure Path**.
+
    Hold `validatedHead` as `VALIDATED_HEAD`.
 
 ### 🔒 Gate 9 — Re-validate
@@ -622,7 +638,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
    ```bash
    "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fetch --fresh-base --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
    ```
-   **If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
+   **If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Each run must carry its positive integer `id`, `repository.full_name`, `head_repository.full_name`, configured workflow `path` (or matching numeric `workflow_id`), `head_sha`, `head_branch` and repository-scoped `html_url`. Both repositories must match `ownerRepo`; the head must match `VALIDATED_HEAD` and `headRefName`. Each job must carry `run_id`, `run_url` and `head_sha` matching its selected run and repository. Retain every jobs page in the paginated array. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
    ```bash
    "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fresh-base --facts-file="{OUTBOX}/ship-gate-facts.json" --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
    ```
@@ -636,7 +652,15 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
      - **If** exit 0 → Step 3.
      - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
      - **Else** → **Failure Path**, preserving the branch and worktree on exhaustion.
-   - **If** exit 11 (in progress — poll), 14 (stale green), 10 (no run) **or** 17 (non-bookkeeping change past `VALIDATED_HEAD`) → route on the failed arrivals at Step 10, without asking:
+   - **If** exit 17 (non-bookkeeping change past `VALIDATED_HEAD`) → set `RECONCILE_REQUIRED` = true → route the recorded failed arrival to reconciliation:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path**.
+   - **If** exit 11 (in progress — poll), 14 (stale green) **or** 10 (no run) → route on the failed arrivals at Step 10, without asking:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
      ```
diff --git a/.cursor/commands/bkit-ship.md b/.cursor/commands/bkit-ship.md
index ab739852b..45e4fe037 100644
--- a/.cursor/commands/bkit-ship.md
+++ b/.cursor/commands/bkit-ship.md
@@ -599,9 +599,25 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
 **If** `RECONCILE_REQUIRED` = true → clear it → Step 3 before validation. A previous `DONE` row alone never proves coverage of imported feature code.
 
 1. Resolve the head CI must pass at. The block re-validates when the code moved **or** `REVALIDATE_REASON` = `gate-refusal`: it probes for a run at it first, dispatches only when none, and waits for it to complete. Drop `--reason` when `REVALIDATE_REASON` is empty:
+
    ```bash
-   "{BKIT}" runs revalidate --pr="{PR_NUMBER}" --entry-head="{ENTRY_HEAD}" --code-head="{CODE_HEAD}" --branch="{SHIP_BRANCH}" --month="{YYYYMM}" --fid="{FID}" --file="{STATUS}" --reason="{REVALIDATE_REASON}" --repo="{OWNER_REPO}"
+   "{BKIT}" runs revalidate --pr="{PR_NUMBER}" --require-reconciled --entry-head="{ENTRY_HEAD}" --code-head="{CODE_HEAD}" --branch="{SHIP_BRANCH}" --month="{YYYYMM}" --fid="{FID}" --file="{STATUS}" --reason="{REVALIDATE_REASON}" --repo="{OWNER_REPO}"
    ```
+
+   Hold `reconcileRequired` as `RECONCILE_REQUIRED`.
+   Route:
+   - **If** exit 21 → set `RECONCILE_REQUIRED` = true → route the recorded failed arrival to reconciliation:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path**.
+   - **If** exit 0 → continue with the next instruction.
+   - **If** exit 81 → end turn, re-run this block.
+   - **Else** → **Failure Path**.
+
    Hold `validatedHead` as `VALIDATED_HEAD`.
 
 ### 🔒 Gate 9 — Re-validate
@@ -621,7 +637,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
    ```bash
    "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fetch --fresh-base --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
    ```
-   **If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
+   **If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Each run must carry its positive integer `id`, `repository.full_name`, `head_repository.full_name`, configured workflow `path` (or matching numeric `workflow_id`), `head_sha`, `head_branch` and repository-scoped `html_url`. Both repositories must match `ownerRepo`; the head must match `VALIDATED_HEAD` and `headRefName`. Each job must carry `run_id`, `run_url` and `head_sha` matching its selected run and repository. Retain every jobs page in the paginated array. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
    ```bash
    "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fresh-base --facts-file="{OUTBOX}/ship-gate-facts.json" --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
    ```
@@ -635,7 +651,15 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
      - **If** exit 0 → Step 3.
      - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
      - **Else** → **Failure Path**, preserving the branch and worktree on exhaustion.
-   - **If** exit 11 (in progress — poll), 14 (stale green), 10 (no run) **or** 17 (non-bookkeeping change past `VALIDATED_HEAD`) → route on the failed arrivals at Step 10, without asking:
+   - **If** exit 17 (non-bookkeeping change past `VALIDATED_HEAD`) → set `RECONCILE_REQUIRED` = true → route the recorded failed arrival to reconciliation:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path**.
+   - **If** exit 11 (in progress — poll), 14 (stale green) **or** 10 (no run) → route on the failed arrivals at Step 10, without asking:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
      ```
diff --git a/.opencode/commands/bkit-ship.md b/.opencode/commands/bkit-ship.md
index 4238dd010..1589d3e60 100644
--- a/.opencode/commands/bkit-ship.md
+++ b/.opencode/commands/bkit-ship.md
@@ -603,9 +603,25 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
 **If** `RECONCILE_REQUIRED` = true → clear it → Step 3 before validation. A previous `DONE` row alone never proves coverage of imported feature code.
 
 1. Resolve the head CI must pass at. The block re-validates when the code moved **or** `REVALIDATE_REASON` = `gate-refusal`: it probes for a run at it first, dispatches only when none, and waits for it to complete. Drop `--reason` when `REVALIDATE_REASON` is empty:
+
    ```bash
-   "{BKIT}" runs revalidate --pr="{PR_NUMBER}" --entry-head="{ENTRY_HEAD}" --code-head="{CODE_HEAD}" --branch="{SHIP_BRANCH}" --month="{YYYYMM}" --fid="{FID}" --file="{STATUS}" --reason="{REVALIDATE_REASON}" --repo="{OWNER_REPO}"
+   "{BKIT}" runs revalidate --pr="{PR_NUMBER}" --require-reconciled --entry-head="{ENTRY_HEAD}" --code-head="{CODE_HEAD}" --branch="{SHIP_BRANCH}" --month="{YYYYMM}" --fid="{FID}" --file="{STATUS}" --reason="{REVALIDATE_REASON}" --repo="{OWNER_REPO}"
    ```
+
+   Hold `reconcileRequired` as `RECONCILE_REQUIRED`.
+   Route:
+   - **If** exit 21 → set `RECONCILE_REQUIRED` = true → route the recorded failed arrival to reconciliation:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path**.
+   - **If** exit 0 → continue with the next instruction.
+   - **If** exit 81 → end turn, re-run this block.
+   - **Else** → **Failure Path**.
+
    Hold `validatedHead` as `VALIDATED_HEAD`.
 
 ### 🔒 Gate 9 — Re-validate
@@ -625,7 +641,7 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
    ```bash
    "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fetch --fresh-base --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
    ```
-   **If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
+   **If** exit 80 **or** `runtimeGithubCli` = false → use narrowly scoped MCP PR/Actions reads and compare `dev` against `VALIDATED_HEAD`. The engine must establish `base.ref` = `dev`; a mismatch takes the **Failure Path**. Write `{ ownerRepo, prNumber, headRefName, baseRefName: "dev", pr, ci: { workflowRuns, jobs }, base: { ref: "dev", sha, comparedHead, status } }` to `{OUTBOX}/ship-gate-facts.json`. `workflowRuns` and `jobs` use the Actions API payloads, and `base.sha` is the freshly read dev commit used by the compare API. Each run must carry its positive integer `id`, `repository.full_name`, `head_repository.full_name`, configured workflow `path` (or matching numeric `workflow_id`), `head_sha`, `head_branch` and repository-scoped `html_url`. Both repositories must match `ownerRepo`; the head must match `VALIDATED_HEAD` and `headRefName`. Each job must carry `run_id`, `run_url` and `head_sha` matching its selected run and repository. Retain every jobs page in the paginated array. Independently reread the PR and base before accepting the facts, and record the single transport transition under **gh MCP fallback**. Missing, unavailable or mismatched evidence → **Failure Path** before mutation. Return the facts to the same gate:
    ```bash
    "{BKIT}" runs gate --pr="{PR_NUMBER}" --validated="{VALIDATED_HEAD}" --month="{YYYYMM}" --fid="{FID}" --repo="{OWNER_REPO}" --branch="{SHIP_BRANCH}" --fresh-base --facts-file="{OUTBOX}/ship-gate-facts.json" --file="{STATUS}" --snapshot="{OUTBOX}/pre-merge-snapshot.jsonl" --record="{STATUS}"
    ```
@@ -639,7 +655,15 @@ Read the latest successful `ship-feature-coverage` row for `step=ship-update-doc
      - **If** exit 0 → Step 3.
      - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
      - **Else** → **Failure Path**, preserving the branch and worktree on exhaustion.
-   - **If** exit 11 (in progress — poll), 14 (stale green), 10 (no run) **or** 17 (non-bookkeeping change past `VALIDATED_HEAD`) → route on the failed arrivals at Step 10, without asking:
+   - **If** exit 17 (non-bookkeeping change past `VALIDATED_HEAD`) → set `RECONCILE_REQUIRED` = true → route the recorded failed arrival to reconciliation:
+     ```bash
+     "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-3 --exceeded=failure-path
+     ```
+     Hold `value` as `MERGE_ROUNDS`, `max` as `MERGE_MAX` and `ask` as `MERGE_ASK`.
+     - **If** exit 0 → Step 3.
+     - **If** exit 1 **and** `MERGE_ASK` = true → `LIMIT_NEXT` = Step 3 → **Merge Question**.
+     - **Else** → **Failure Path**.
+   - **If** exit 11 (in progress — poll), 14 (stale green) **or** 10 (no run) → route on the failed arrivals at Step 10, without asking:
      ```bash
      "{BKIT}" counters route --name=MERGE_ATTEMPT --of=ship-merge-pr:count --rows=ship-gate-refusal:count --file="{STATUS}" --workflow=ship --point=ship.merge --continue=step-9 --exceeded=failure-path
      ```
diff --git a/DETAILS.md b/DETAILS.md
index 81730289f..c03749306 100644
--- a/DETAILS.md
+++ b/DETAILS.md
@@ -347,7 +347,7 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>252 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1702 symbols · 51 files"]
+    n_bkit_core_engine_commands["commands<br/>1703 symbols · 51 files"]
     n_bkit_core_engine_install["install<br/>308 symbols · 20 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>184 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
diff --git a/dist/commands/workflow/runs.js b/dist/commands/workflow/runs.js
index 8a73d2d2b..e04a8175e 100644
--- a/dist/commands/workflow/runs.js
+++ b/dist/commands/workflow/runs.js
@@ -1501,14 +1501,49 @@ function runGate(ctx) {
             if (args[0] === "repo" && args[1] === "view")
                 return { ok: true, stdout: repo, stderr: "", missing: false };
             const workflow = readBkitConfig(checkoutRoot(ctx.cwd)).ciWorkflow;
+            const scopedRuns = arr(obj(ci.workflowRuns).workflow_runs).map(obj);
+            const workflowPath = workflow.startsWith(".github/workflows/")
+                ? workflow
+                : `.github/workflows/${workflow}`;
+            const validRun = (run) => Number.isSafeInteger(run.id) &&
+                Number(run.id) > 0 &&
+                text(obj(run.repository).full_name).toLowerCase() === repo.toLowerCase() &&
+                text(obj(run.head_repository).full_name).toLowerCase() === repo.toLowerCase() &&
+                (text(run.path) === workflowPath ||
+                    (/^[1-9][0-9]*$/.test(workflow) && String(run.workflow_id) === workflow)) &&
+                run.head_sha === (str(f.validated) ?? obj(facts.pr).headRefOid) &&
+                run.head_branch === facts.headRefName &&
+                run.html_url === `https://github.com/${repo}/actions/runs/${run.id}`;
+            const invalidEvidence = () => ({
+                ok: false,
+                stdout: "",
+                stderr: "scoped gate CI provenance is missing or mismatched",
+                missing: false,
+            });
             if (args[0] === "api" &&
-                endpoint.startsWith(`repos/${repo}/actions/workflows/${workflow}/runs?`))
+                endpoint.startsWith(`repos/${repo}/actions/workflows/${workflow}/runs?`)) {
+                if (!Array.isArray(obj(ci.workflowRuns).workflow_runs) ||
+                    scopedRuns.some((run) => !validRun(run)))
+                    return invalidEvidence();
                 return reply(ci.workflowRuns);
+            }
             const jobMatch = new RegExp(`^repos/${repo}/actions/runs/([0-9]+)/jobs$`).exec(endpoint);
-            if (args[0] === "api" &&
-                jobMatch &&
-                arr(obj(ci.workflowRuns).workflow_runs).some((run) => String(obj(run).id) === jobMatch[1]))
+            if (args[0] === "api" && jobMatch) {
+                const run = scopedRuns.find((candidate) => String(candidate.id) === jobMatch[1]);
+                const pages = Array.isArray(ci.jobs) ? ci.jobs : [ci.jobs];
+                if (!run ||
+                    !validRun(run) ||
+                    pages.length === 0 ||
+                    pages.some((page) => !Array.isArray(obj(page).jobs) ||
+                        arr(obj(page).jobs).some((value) => {
+                            const job = obj(value);
+                            return (job.run_id !== run.id ||
+                                job.head_sha !== run.head_sha ||
+                                job.run_url !== `https://api.github.com/repos/${repo}/actions/runs/${run.id}`);
+                        })))
+                    return invalidEvidence();
                 return reply(ci.jobs);
+            }
             return {
                 ok: false,
                 stdout: "",
@@ -1801,6 +1836,7 @@ async function runRevalidate(ctx) {
     // CI must pass at the code head while the PR head adds bookkeeping only and dev
     // demands no status checks; otherwise at the PR head.
     let validated = codeHead;
+    let reconcileRequired = current !== codeHead;
     if (foreign) {
         // The bookkeeping diff reads the checkout's git, which is not the named repo's history.
         ctx.log(`--repo ${repoFlag} is not this checkout's repo — bookkeeping diff skipped, validating at the PR head ${current}`);
@@ -1813,15 +1849,31 @@ async function runRevalidate(ctx) {
             from: codeHead,
             to: current,
         });
+        reconcileRequired = !book.ok;
         if (!book.ok)
             validated = current;
     }
+    if (f.requireReconciled === true && reconcileRequired) {
+        auditRow(status, "ship-gate-refusal", { exitCode: 21, head: current });
+        ctx.log(`feature code changed at ${current} — reconcile before CI validation`);
+        ctx.emit({
+            reconcileRequired: true,
+            validatedHead: null,
+            currentHead: current,
+            revalidated: false,
+            probe: null,
+            dispatched: false,
+            wait: null,
+        });
+        return 21;
+    }
     const repo = repoFlag ?? resolveOwnerRepo(ctx.cwd)?.ownerRepo;
     if (repo !== undefined && devRequiresChecks(d.gh, repo)) {
         ctx.log(`dev requires status checks — validating at the PR head ${current}`);
         validated = current;
     }
     const out = {
+        ...(f.requireReconciled === true ? { reconcileRequired: false } : {}),
         validatedHead: validated,
         currentHead: current,
         revalidated: false,
@@ -2357,6 +2409,11 @@ export const runsCommand = {
             summary: "Ship: pick the head CI must pass at, probe for a run there, dispatch only when none, wait for it to complete.",
             use: "workflow",
             flags: [
+                {
+                    name: "require-reconciled",
+                    type: "boolean",
+                    help: "refuse newly observed feature code before CI validation",
+                },
                 { name: "pr", type: "string", required: true, help: "the PR number" },
                 { name: "entry-head", type: "string", required: true, help: "the PR head read at Step 2" },
                 {
@@ -2393,13 +2450,17 @@ export const runsCommand = {
             ],
             output: {
                 validatedHead: "the head CI was (or must be) checked at",
+                reconcileRequired: "with --require-reconciled, whether new feature code needs reconciliation",
                 currentHead: "the PR head now",
                 revalidated: "a probe / wait ran (the head moved, or a gate refusal re-entered)",
                 probe: "the presence probe's wait result, or null",
                 dispatched: "the probe found no run and dispatched one",
                 wait: "the completion wait's result, or null",
             },
-            exitCodes: { [EXIT_TRIGGER_FAILED]: "no run and gh workflow run failed" },
+            exitCodes: {
+                [EXIT_TRIGGER_FAILED]: "no run and gh workflow run failed",
+                21: "--require-reconciled: new feature code needs reconciliation",
+            },
             run: runRevalidate,
         },
         mirror: {
diff --git a/docs/capabilities.md b/docs/capabilities.md
index 16e3df81c..337e396f4 100644
--- a/docs/capabilities.md
+++ b/docs/capabilities.md
@@ -164,7 +164,7 @@ flowchart LR
   subgraph gn_bkit_core_engine[".bkit/core/engine"]
     n_bkit_core_engine_checks["checks<br/>252 symbols · 18 files"]
     n_bkit_core_engine_cli["cli<br/>33 symbols · 1 files"]
-    n_bkit_core_engine_commands["commands<br/>1702 symbols · 51 files"]
+    n_bkit_core_engine_commands["commands<br/>1703 symbols · 51 files"]
     n_bkit_core_engine_install["install<br/>308 symbols · 20 files"]
     n_bkit_core_engine_ledgers["ledgers<br/>184 symbols · 6 files"]
     n_bkit_core_engine_render["render<br/>63 symbols · 4 files"]
@@ -307,7 +307,7 @@ flowchart LR
       n_bkit_core_engine_commands_lib["lib<br/>67 symbols · 1 files"]
       n_bkit_core_engine_commands_setup_setup[".bkit/core/engine/commands/setup/setup<br/>11 symbols · 1 files"]
       subgraph gn_bkit_core_engine_commands_workflow[".bkit/core/engine/commands/workflow"]
-        n_bkit_core_engine_commands_workflow_branches["branches<br/>130 symbols · 1 files"]
+        n_bkit_core_engine_commands_workflow_branches["branches<br/>131 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_challenge["challenge<br/>35 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_completeness["completeness<br/>4 symbols · 1 files"]
         n_bkit_core_engine_commands_workflow_context["context<br/>91 symbols · 1 files"]
@@ -373,7 +373,7 @@ flowchart LR
     end
   end
   nscripts_harvest["scripts/harvest<br/>199 symbols · 2 files"]
-  n_bkit_core_engine_commands_workflow_branches -->|137| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_branches -->|140| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_workflows -->|79| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_runs -->|70| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_prs -->|56| n_bkit_core_engine_commands_lib
@@ -409,6 +409,7 @@ flowchart LR
   n_bkit_core_engine_commands_lib -->|17| n_bkit_core_engine_ledgers_journal
   n_bkit_core_engine_ledgers_journal -->|17| n_bkit_core_engine_ledgers_telemetry
   n_bkit_core_engine_commands_land -->|16| n_bkit_core_engine_commands_lib
+  n_bkit_core_engine_commands_workflow_branches -->|16| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_workflow_runs -->|16| n_bkit_core_engine_commands_workflow_prs
   n_bkit_core_engine_commands_workflow_tests -->|16| n_bkit_core_engine_commands_workflow_plan_blocks
   n_bkit_core_engine_install_modules_claude -->|16| n_bkit_core_engine_install_write
@@ -428,7 +429,6 @@ flowchart LR
   n_bkit_core_engine_checks_before_repo -->|14| n_bkit_core_engine_shared_settings
   n_bkit_core_engine_commands_install_install -->|14| n_bkit_core_engine_render_models
   n_bkit_core_engine_commands_install_upgrade -->|14| n_bkit_core_engine_install_version_file
-  n_bkit_core_engine_commands_workflow_branches -->|14| n_bkit_core_engine_commands_workflow_ledgers
   n_bkit_core_engine_commands_workflow_branches -->|14| n_bkit_core_engine_commands_workflow_prs
   n_bkit_core_engine_commands_workflow_tests -->|14| n_bkit_core_engine_commands_lib
   n_bkit_core_engine_commands_workflow_tracker -->|14| n_bkit_core_engine_ledgers_status
diff --git a/docs/failures.jsonl b/docs/failures.jsonl
index 54364c030..0ddc0f4f1 100644
--- a/docs/failures.jsonl
+++ b/docs/failures.jsonl
@@ -267,3 +267,5 @@
 {"schema":3,"ts":1793878456907,"firstTs":1793878456907,"updates":1,"kind":"failure","key":"ship-resolver-merge-target-flag-missing","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["842",".bkit/core/engine/commands/workflow/branches.ts",".bkit/core/engine/commands/workflow/branches.test.ts"],"category":"tooling","summary":"Conflict resolver's recorded target could not pass through the public command","severity":"HIGH","description":"A real pending feature merge regression returned unknown flag --target (exit 2) from branches sync --merge.","rootCause":"The internal target parameter and MERGE_HEAD check existed without a command flag or dispatch plumbing.","remediation":"Declare and resolve --target, pass its pinned commit to mergeDev, emit the target and retain the existing merge on mismatches. The public-command continuation regression passes; the full 331-test branch/workflow run passes.","status":"CLOSED"}
 {"schema":3,"ts":1793879876561,"firstTs":1793879876561,"updates":1,"kind":"failure","key":"test-file-script-awake-nested-signal-json","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-tasks"},"references":["842-ship-fails-local",".bkit/core/engine/audits/repo/test-file-script.integration.test.ts","scripts/ci/bkit-test-awake.test.mjs"],"category":"testing","severity":"LOW","summary":"Intermittent JSON readiness read failure in test-file wrapper integration","description":"The pre-generation group2 changed gate reported test-file-script.integration.test.ts:100 failing when the nested signal cleanup child read incomplete readiness JSON (Unexpected end of JSON input). The fresh targeted wrapper integration rerun passed, with 47 focused audit/wrapper tests passing and two existing skips. No speculative production fix or test weakening was applied.","rootCause":"Unconfirmed; observed once under the broad changed gate and not reproduced by the isolated rerun.","status":"OPEN"}
 {"schema":3,"ts":1793881336779,"firstTs":1793881336779,"updates":1,"kind":"failure","key":"ship-coverage-omits-semantic-merge-results","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"claude-sonnet-5-5"},"references":["842-ship-fails-local",".bkit/core/engine/commands/workflow/branches.test.ts",".bkit/core/workflows/bkit-ship.md"],"severity":"HIGH","status":"CLOSED","summary":"Ship coverage ignored semantic merge results.","description":"The feature coverage list excluded all merge commits and was not recomputed after integration, allowing sweep and docs artifacts to cover an earlier semantic state.","rootCause":"The workflow used rev-list --no-merges and retained its pre-integration state.","remediation":"Compute merge-aware coverage through branches sync --feature-state, exclude only proven automatic dev integrations, and refresh before both artifact reuse decisions. Real-Git tests cover merge-only changes, imported features, conflict resolutions and valid reuse."}
+{"schema":3,"ts":1793884659271,"firstTs":1793884659271,"updates":1,"kind":"failure","key":"ship-late-feature-code-skips-reconciliation","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["842-ship-fails-local",".bkit/core/engine/commands/workflow/runs.ts",".bkit/core/workflows/bkit-ship.md"],"severity":"HIGH","status":"CLOSED","summary":"Late feature code could reach the merge gate without refreshed review.","description":"Revalidation accepted newly observed feature code as a CI target, and gate code 17 returned directly to CI validation without requiring reconciliation and renewed sweep/docs coverage.","rootCause":"Neither late-code route explicitly invalidated feature coverage before selecting a validated head.","remediation":"Ship opts into reconciliation-required revalidation; exit 21 and gate 17 consume bounded refusal arrivals and return through Step 3. Real-Git and workflow regression tests pass."}
+{"schema":3,"ts":1793884659273,"firstTs":1793884659273,"updates":1,"kind":"failure","key":"ship-mcp-gate-trusts-unscoped-nested-ci","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["842-ship-fails-local",".bkit/core/engine/commands/workflow/runs.ts",".bkit/core/engine/commands/workflow/runs.test.ts"],"severity":"HIGH","status":"CLOSED","summary":"Scoped MCP gate facts accepted unrelated nested Actions evidence.","description":"A valid PR/base envelope could contain a successful run from another repository or workflow, or a capstone job from another run, and authorize a merge.","rootCause":"The adapter bound API endpoint strings to the envelope without validating the returned nested run and job provenance.","remediation":"Validate each run's repository, configured workflow, branch and head, and every paginated job's run identity, repository URL and head before returning scoped evidence to the gate."}
diff --git a/docs/knowledge.jsonl b/docs/knowledge.jsonl
index 323cd192d..6339c3032 100644
--- a/docs/knowledge.jsonl
+++ b/docs/knowledge.jsonl
@@ -156,3 +156,5 @@
 {"schema":3,"ts":1793878456619,"firstTs":1793878456619,"updates":1,"kind":"knowledge","key":"ship-reconciliation-must-accept-its-own-bookkeeping","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["842",".bkit/core/engine/commands/workflow/branches.ts",".bkit/core/engine/commands/workflow/branches.test.ts"],"summary":"Ship reconciliation runs after status and input artifacts are dirty","rootCause":"A blanket dirty-tree refusal made the new reconciliation command unusable after workflows start appended tracked status rows.","remediation":"Carry only the existing core bookkeeping allow-list after proving no unrelated dirty path exists. Keep staged unrelated code unchanged and refuse it. Test reconciliation with real tracked workflow rows, not only clean fixture branches.","status":"ACTIVE"}
 {"schema":3,"ts":1793878456621,"firstTs":1793878456621,"updates":1,"kind":"knowledge","key":"merge-target-contract-needs-public-cli-continuation-test","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["842",".bkit/core/engine/commands/workflow/branches.test.ts",".bkit/core/prompts/bkit-ship-conflict-resolve.md"],"summary":"An internal merge target parameter does not establish the resolver CLI contract","rootCause":"mergeDev accepted a target internally while branches sync did not declare or pass --target, so the resolver's planned command exited usage.","remediation":"Exercise the public command against a real pending feature merge. Resolve the target to a commit, compare it with MERGE_HEAD, refuse a mismatched target without aborting the existing merge, and continue only the recorded target.","status":"ACTIVE"}
 {"schema":3,"ts":1793881497760,"firstTs":1793881497760,"updates":1,"kind":"knowledge","key":"ship-coverage-must-account-for-merge-results","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-gaps-remediate","subagent":"bkit-build-plan-gaps-remediate","model":"claude-sonnet-5-5"},"references":["842-ship-fails-local",".bkit/core/engine/commands/workflow/branches.ts","ship-coverage-omits-semantic-merge-results"],"status":"ACTIVE","summary":"Feature coverage must include semantic changes introduced by merge results.","description":"A merge commit can change feature semantics without changing any nonmerge ancestor. Ship coverage therefore retains merge commits unless the result is proven to match Git's clean automatic merge of a feature parent and a dev ancestor. Unavailable proof conservatively requires fresh coverage. Recompute the state after integration and before each artifact reuse decision."}
+{"schema":3,"ts":1793884659405,"firstTs":1793884659405,"updates":1,"kind":"knowledge","key":"ship-late-code-needs-feature-reconciliation","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["842-ship-fails-local",".bkit/core/engine/commands/workflow/runs.ts"],"status":"ACTIVE","summary":"A newly observed remote CI target also needs feature reconciliation and coverage.","description":"Keep generic revalidation reusable, but opt ship into --require-reconciled. Newly observed code must return to Step 3 before CI probing so inherited-dev checks and sweep/docs coverage see the imported state. Record the refusal once so reconciliation retries share the merge allowance."}
+{"schema":3,"ts":1793884659407,"firstTs":1793884659407,"updates":1,"kind":"knowledge","key":"mcp-ci-envelope-does-not-bind-nested-provenance","repo":"cbartens/bkit","bkit":{"version":"6.1.1"},"by":{"workflow":"build","step":"build-plan-execute","subagent":"bkit-build-plan-tasks","model":"gpt-6.1-sol"},"references":["842-ship-fails-local",".bkit/core/engine/commands/workflow/runs.ts"],"status":"ACTIVE","summary":"A scoped evidence envelope does not prove its nested CI provenance.","description":"Before adapting MCP facts to an API-shaped gate, validate each run's repository, workflow, branch and head plus every paginated job's run_id, run_url and head_sha. Endpoint scoping alone cannot establish that supplied payloads came from that endpoint."}
diff --git a/docs/observability.md b/docs/observability.md
index a87951a68..b6e7eff0c 100644
--- a/docs/observability.md
+++ b/docs/observability.md
@@ -129,13 +129,15 @@ Run-completeness check (`checks/status-holes.ts`, `bkit completeness check`). Ad
 | 14 | Green run exists, but at a SUPERSEDED SHA (needs `--branch`) | refuse → Step 9 (re-validate at new head) |
 | 15 | Selected run concluded `cancelled` | refuse |
 | 16 | A lane named in `bkit.testing.ciRequired` concluded `skipped` | refuse |
-| 17 | Non-bookkeeping change past `--validated`, or not its descendant | refuse → Step 9 (re-validate at head) |
+| 17 | Non-bookkeeping change past `--validated`, or not its descendant | refuse → Step 3 (reconcile and refresh feature coverage) |
 | 19 | Fresh `dev` is not an ancestor of the validated code head | refuse → Step 4 (integrate and revalidate) |
 | 20 | API error / rate limit / auth, or missing/mismatched fresh-base evidence | refuse |
 | 80 | `gh` not on PATH | do it via the MCP fallback |
 
 The refusal itself is signalled by the process exit code; every refusal ends with the `required head:` block. Canonical grep patterns:
 
+Ship's `runs revalidate --require-reconciled` returns 21 when newly observed feature code needs reconciliation. It emits `reconcileRequired: true` with no validated head and records one `ship-gate-refusal` row before any CI probe or dispatch. The bounded retry returns to Step 3, including inherited-dev checks and sweep/docs coverage. Bookkeeping-only descendants retain the covered head.
+
 - `[bkit-runs] capstone %s=success at head %s (run %s, %s)` — green at the checked head.
 - `[bkit-runs] head %s = validated %s + bookkeeping only — checking CI at the validated sha` — `--validated` carry-forward applied.
 - `[bkit-runs] required head:  %s` — refusal block (every non-zero route emits this); `merge head:` follows when the carry-forward applied.
