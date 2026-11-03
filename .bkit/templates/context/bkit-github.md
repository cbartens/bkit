<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# GitHub Actions — failing CI run and diff since the last green run

Fits: any repo whose CI runs on GitHub Actions.

- The `context=ci` block reads the selected run and attempt, then returns bounded logs for every failed job. Without a selection it discovers the configured workflow's latest completed run on the current branch.
- The `context=diff` block compares the selected failing commit with an ancestral successful commit of the same workflow on the baseline branch. Without a selection it compares the configured workflow's last successful commit with `HEAD`.

The settings:

- Secret: `GH_TOKEN` in cloud. A local `gh auth login` works too.
- Optional inputs: `BKIT_CI_RUN_ID`, `BKIT_CI_RUN_ATTEMPT`, `BKIT_CI_REPO` and `BKIT_CI_HEAD_SHA`, supplied together by `context fetch --ci-selection-file`.
- Workflow: `package.json` `bkit.testing.ciWorkflow`; `BASELINE_WORKFLOW` may override the unpinned diff selector.
- Baseline branch: `BASELINE_BRANCH` (default `dev`). Commit your trunk selector in the copied block so cloud agents inherit it.
- CLI: `gh`. It is base tooling, so there is no provision block.
- Domains: none beyond bkit's derived set (`github.com`).
- The diff needs both commits locally. Missing history or an unavailable baseline is reported as unchecked evidence.

Copy the blocks below into `.agents/context.md`, below `<!-- bkit:end -->`. The blocks are independent: copy one or both.

## `context=ci` — failing CI run

<!-- context-fetch:start github context=ci -->

```bash
# GitHub Actions: selected-attempt metadata and bounded logs of every failed job.
# Customise: CI_LOG_TAIL (lines kept per failed job); configured workflow; job/step filters.
set -o pipefail
skip() { echo "[context-fetch:github] skipped — $*" >&2; exit 0; }
command -v gh >/dev/null 2>&1 || skip "gh CLI not installed"
gh auth status >/dev/null 2>&1 || skip "gh not authenticated (set GH_TOKEN)"
CI_LOG_TAIL=2000
RUN_ID="${BKIT_CI_RUN_ID:-}"
RUN_ATTEMPT="${BKIT_CI_RUN_ATTEMPT:-}"
RUN_REPO="${BKIT_CI_REPO:-}"
if [ -z "$RUN_ID" ]; then
  CI_WORKFLOW=$(node -p 'require(process.cwd()+"/package.json").bkit?.testing?.ciWorkflow || ""' 2>/dev/null) || skip "workflow configuration unavailable"
  [ -n "$CI_WORKFLOW" ] || skip "no configured CI workflow"
  RUN_LIST=$(gh run list --workflow "$CI_WORKFLOW" --branch "$(git branch --show-current)" --status completed --limit 1 --json databaseId,attempt 2>/dev/null) || skip "CI discovery unavailable"
  RUN_ID=$(printf '%s' "$RUN_LIST" | jq -er '.[0].databaseId | select(type=="number" and .>0)') || skip "no completed CI run found"
  RUN_ATTEMPT=$(printf '%s' "$RUN_LIST" | jq -er '.[0].attempt | select(type=="number" and .>0)') || skip "run attempt unavailable"
  RUN_REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner' 2>/dev/null) || skip "repository identity unavailable"
fi
printf '%s\n' "$RUN_ID" "$RUN_ATTEMPT" | command grep -Eqv '^[1-9][0-9]*$' && skip "invalid selected run or attempt"
printf '%s' "$RUN_REPO" | command grep -Eq '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$' || skip "invalid selected repository"
RUN_META=$(gh api "/repos/$RUN_REPO/actions/runs/$RUN_ID/attempts/$RUN_ATTEMPT" 2>/dev/null) || skip "selected run metadata unavailable"
printf '%s' "$RUN_META" | jq -e --arg id "$RUN_ID" --argjson attempt "$RUN_ATTEMPT" --arg repo "$RUN_REPO" --arg sha "${BKIT_CI_HEAD_SHA:-}" '
  (.id|tostring)==$id and .run_attempt==$attempt and .repository.full_name==$repo and .head_repository.full_name==$repo
  and (.head_sha|test("^([0-9a-f]{40}|[0-9a-f]{64})$")) and ($sha=="" or .head_sha==$sha)
  and (.workflow_id|type=="number" and .>0) and .status=="completed"
  and (.conclusion=="failure" or .conclusion=="timed_out" or .conclusion=="startup_failure")' >/dev/null || skip "selected run identity or failure does not match"
RUN_SHA=$(printf '%s' "$RUN_META" | jq -r '.head_sha')
WORKFLOW_ID=$(printf '%s' "$RUN_META" | jq -r '.workflow_id')
JOB_PAGES=$(gh api "/repos/$RUN_REPO/actions/runs/$RUN_ID/attempts/$RUN_ATTEMPT/jobs?per_page=100" --paginate --slurp 2>/dev/null) || skip "selected job pages unavailable"
printf '%s' "$JOB_PAGES" | jq -e '
  type=="array" and length>0 and all(.[]; (.total_count|type=="number" and .>=0 and floor==.) and (.jobs|type=="array"))
  and ([.[].total_count]|unique|length)==1 and ([.[].jobs[]]|length)==.[0].total_count
  and ([.[].jobs[].id]|unique|length)==.[0].total_count' >/dev/null || skip "selected job pages incomplete"
FAILED_JOBS=$(printf '%s' "$JOB_PAGES" | jq -r '.[].jobs[] | select(.conclusion=="failure" or .conclusion=="timed_out" or .conclusion=="startup_failure") | [.id,.name] | @tsv') || skip "failed job list unavailable"
[ -n "$FAILED_JOBS" ] || skip "no failed job logs available"
CI_LOGS=""
TAB=$(printf '\t')
while IFS="$TAB" read -r JOB JOB_NAME; do
  printf '%s' "$JOB" | command grep -Eq '^[1-9][0-9]*$' || skip "invalid failed job identity"
  JOB_LOG=$(gh run view "$RUN_ID" --repo "$RUN_REPO" --attempt "$RUN_ATTEMPT" --job "$JOB" --log-failed 2>/dev/null | tail -n "$CI_LOG_TAIL") || skip "selected job log unavailable"
  [ -n "$JOB_LOG" ] || skip "selected job log empty"
  CI_LOGS="${CI_LOGS}===== job ${JOB_NAME} =====
${JOB_LOG}
"
done <<EOF_JOBS
$FAILED_JOBS
EOF_JOBS
jq -cn --arg repo "$RUN_REPO" --arg runId "$RUN_ID" --argjson runAttempt "$RUN_ATTEMPT" --arg headSha "$RUN_SHA" --arg workflowId "$WORKFLOW_ID" '{provider:"github",repo:$repo,runId:$runId,runAttempt:$runAttempt,headSha:$headSha,workflowId:$workflowId,complete:true}' | sed 's/^/bkit-ci-evidence: /'
printf '===== run %s attempt %s (headSha %s) =====\n%s\n' "$RUN_ID" "$RUN_ATTEMPT" "$RUN_SHA" "$CI_LOGS"
```

<!-- context-fetch:end -->

## `context=diff` — diff since the last green run on trunk

<!-- context-fetch:start github context=diff -->

```bash
# GitHub Actions: ancestral successful baseline to the selected failing commit.
# Customise: BASELINE_BRANCH; last-passing --limit; DIFF_STAT_N (files listed).
set -o pipefail
skip() { echo "[context-fetch:github] skipped — $*" >&2; exit 0; }
BASELINE_BRANCH="${BASELINE_BRANCH:-dev}"
command -v gh >/dev/null 2>&1 || skip "gh CLI not installed"
RUN_ID="${BKIT_CI_RUN_ID:-}"
END_SHA=HEAD
if [ -n "$RUN_ID" ]; then
  RUN_ATTEMPT="${BKIT_CI_RUN_ATTEMPT:-}"
  RUN_REPO="${BKIT_CI_REPO:-}"
  printf '%s\n' "$RUN_ID" "$RUN_ATTEMPT" | command grep -Eqv '^[1-9][0-9]*$' && skip "invalid selected run or attempt"
  printf '%s' "$RUN_REPO" | command grep -Eq '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$' || skip "invalid selected repository"
  RUN_META=$(gh api "/repos/$RUN_REPO/actions/runs/$RUN_ID/attempts/$RUN_ATTEMPT" 2>/dev/null) || skip "selected baseline metadata unavailable"
  printf '%s' "$RUN_META" | jq -e --arg id "$RUN_ID" --argjson attempt "$RUN_ATTEMPT" --arg repo "$RUN_REPO" --arg sha "${BKIT_CI_HEAD_SHA:-}" '
    (.id|tostring)==$id and .run_attempt==$attempt and .repository.full_name==$repo and .head_repository.full_name==$repo
    and .head_sha==$sha and (.workflow_id|type=="number" and .>0) and (.created_at|type=="string")' >/dev/null || skip "selected diff identity does not match"
  END_SHA=$(printf '%s' "$RUN_META" | jq -r '.head_sha')
  BASELINE_WORKFLOW=$(printf '%s' "$RUN_META" | jq -r '.workflow_id')
  FAIL_TIME=$(printf '%s' "$RUN_META" | jq -r '.created_at')
  BASELINES=$(gh run list --repo "$RUN_REPO" --branch "$BASELINE_BRANCH" --workflow "$BASELINE_WORKFLOW" --status success --limit 100 --json headSha,createdAt,workflowDatabaseId 2>/dev/null) || skip "successful baseline lookup unavailable"
  CANDIDATES=$(printf '%s' "$BASELINES" | jq -r --arg before "$FAIL_TIME" --arg workflow "$BASELINE_WORKFLOW" '[.[] | select(.createdAt<=$before and (.workflowDatabaseId|tostring)==$workflow)] | sort_by(.createdAt) | reverse | .[].headSha') || skip "baseline response unavailable"
else
  BASELINE_WORKFLOW="${BASELINE_WORKFLOW:-}"
  if [ -z "$BASELINE_WORKFLOW" ]; then
    BASELINE_WORKFLOW=$(node -p 'require(process.cwd()+"/package.json").bkit?.testing?.ciWorkflow || ""' 2>/dev/null) || skip "workflow configuration unavailable"
  fi
  [ -n "$BASELINE_WORKFLOW" ] || skip "no configured baseline workflow"
  CANDIDATES=$(gh run list --branch "$BASELINE_BRANCH" --workflow "$BASELINE_WORKFLOW" --status success --limit 100 --json headSha --jq '.[].headSha' 2>/dev/null) || skip "successful baseline lookup unavailable"
fi
git cat-file -e "${END_SHA}^{commit}" 2>/dev/null || skip "selected commit unavailable in local history"
LAST_PASS_SHA=""
while IFS= read -r CANDIDATE; do
  printf '%s' "$CANDIDATE" | command grep -Eq '^([0-9a-f]{40}|[0-9a-f]{64})$' || continue
  if git merge-base --is-ancestor "$CANDIDATE" "$END_SHA" 2>/dev/null; then LAST_PASS_SHA="$CANDIDATE"; break; fi
done <<EOF_BASELINES
$CANDIDATES
EOF_BASELINES
[ -n "$LAST_PASS_SHA" ] || skip "ancestral same-workflow baseline unavailable in the inspected window"
DIFF_STAT=$(git diff "$LAST_PASS_SHA..$END_SHA" --stat --stat-count="${DIFF_STAT_N:-200}" 2>/dev/null) || skip "selected diff unavailable"
[ -n "$DIFF_STAT" ] || skip "no diff from baseline to selected commit"
printf '===== diff baseline %s to selected commit %s =====\n%s\n' "$LAST_PASS_SHA" "$END_SHA" "$DIFF_STAT"
```

<!-- context-fetch:end -->
