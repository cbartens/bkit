<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# GitHub Actions — failing CI run and diff since the last green run

Fits: any repo whose CI runs on GitHub Actions. `context=ci`: the failing run on the current branch — failed jobs and steps, `::error` annotations, failed-step logs per failed job, each tail-bounded (bounded whole-run tail when `--log-failed` returns nothing). `context=diff`: `git diff --stat` (capped at `DIFF_STAT_N` files) from the last commit where your CI workflow passed on trunk to `HEAD`.

- Secret: `GH_TOKEN` in cloud (local `gh auth login` works too).
- Non-secret: `context=ci` none, the block discovers its own run. `context=diff`: `BASELINE_BRANCH` (your trunk, default `dev`) and `BASELINE_WORKFLOW` (your CI workflow file, default `bkit-ci.yml`); edit the defaults in the block so cloud agents inherit them.
- CLI: `gh` — base tooling, no provision block.
- Domains: none beyond bkit's derived set (`github.com`).
- `context=diff` needs the last-passing commit locally: a shallow clone self-skips, naming the SHA.

Copy the blocks below into `.agents/context.md`, below `<!-- bkit:end -->`. The blocks are independent: copy one or both.

## `context=ci` — failing CI run

<!-- context-fetch:start github context=ci -->

```bash
# GitHub Actions: failing-run job/step failures + error annotations + failed-step logs.
# Discovers its own run. `gh` is base tooling — no context-fetch:provision sibling.
# Customise: run (`--branch`, `--limit`, pin RUN_ID); log slice (`--log-failed` vs `--log`); CI_LOG_TAIL (lines kept per failed job, and of the whole-run fallback); job/step name filter; annotation grep.
command -v gh >/dev/null 2>&1 \
  || { echo "[context-fetch:github] skipped — gh CLI not installed" >&2; exit 0; }
gh auth status >/dev/null 2>&1 \
  || { echo "[context-fetch:github] skipped — gh not authenticated (set GH_TOKEN)" >&2; exit 0; }
RUN_JSON=$(gh run list --branch "$(git branch --show-current)" --limit 1 \
  --json databaseId,conclusion,headSha 2>/dev/null || echo '[]')
RUN_ID=$(printf '%s' "$RUN_JSON" | jq -r '.[0].databaseId // ""')
RUN_SHA=$(printf '%s' "$RUN_JSON" | jq -r '.[0].headSha // ""')
RUN_CONCLUSION=$(printf '%s' "$RUN_JSON" | jq -r '.[0].conclusion // ""')
[ -n "$RUN_ID" ] \
  || { echo "[context-fetch:github] skipped — no CI run found for this branch" >&2; exit 0; }
[ "$RUN_CONCLUSION" != "success" ] \
  || { echo "[context-fetch:github] skipped — run $RUN_ID concluded success (nothing failing to fetch)" >&2; exit 0; }
FAILED_STEPS=$(gh run view "$RUN_ID" --json conclusion,jobs \
  --jq '[.jobs[] | select(.conclusion=="failure") | {job: .name, steps: [.steps[] | select(.conclusion=="failure") | .name]}]' 2>/dev/null)
# Failed-step logs, one tail-bounded section per failed job, so a second failing job keeps its
# lines. Raise CI_LOG_TAIL if the cause sits higher in a job's log.
CI_LOG_TAIL=2000
FAILED_JOBS=$(gh run view "$RUN_ID" --json jobs \
  --jq '.jobs[] | select(.conclusion=="failure") | "\(.databaseId)\t\(.name)"' 2>/dev/null)
CI_LOGS=""
TAB=$(printf '\t')
while IFS="$TAB" read -r JOB JOB_NAME; do
  [ -n "$JOB" ] || continue
  JOB_LOG=$(gh run view "$RUN_ID" --job "$JOB" --log-failed 2>/dev/null | tail -n "$CI_LOG_TAIL")
  [ -n "$JOB_LOG" ] && CI_LOGS="${CI_LOGS}===== job ${JOB_NAME} =====
${JOB_LOG}
"
done <<EOF_JOBS
$FAILED_JOBS
EOF_JOBS
# Whole-run fallback is tens of MB — bound it the same way.
[ -z "$CI_LOGS" ] && CI_LOGS=$(gh run view "$RUN_ID" --log 2>/dev/null | tail -n "$CI_LOG_TAIL")
[ -n "$CI_LOGS" ] \
  || { echo "[context-fetch:github] skipped — no logs returned for run $RUN_ID" >&2; exit 0; }
ERR_SUBSET=$(printf '%s' "$CI_LOGS" | grep -E '##\[error\]|::error' 2>/dev/null)
printf '===== run %s (headSha %s, conclusion %s) =====\n\n' "$RUN_ID" "${RUN_SHA:-unknown}" "$RUN_CONCLUSION"
printf '===== failed jobs/steps =====\n%s\n\n' "${FAILED_STEPS:-[]}"
[ -n "$ERR_SUBSET" ] && printf '===== error annotations =====\n%s\n\n' "$ERR_SUBSET"
printf '===== failed-step logs =====\n%s\n' "$CI_LOGS"
```

<!-- context-fetch:end -->

## `context=diff` — diff since the last green run on trunk

<!-- context-fetch:start github context=diff -->

```bash
# GitHub Actions: diff HEAD vs last-passing CI on trunk.
# Set BASELINE_BRANCH / BASELINE_WORKFLOW to YOUR trunk and workflow file; commit them here.
# Customise: BASELINE_BRANCH / BASELINE_WORKFLOW; last-passing `--limit`; `git diff` pathspec / `--stat` vs full patch; DIFF_STAT_N (files listed).
BASELINE_BRANCH="${BASELINE_BRANCH:-dev}"
BASELINE_WORKFLOW="${BASELINE_WORKFLOW:-bkit-ci.yml}"
command -v gh >/dev/null 2>&1 \
  || { echo "[context-fetch:github] skipped — gh CLI not installed" >&2; exit 0; }
LAST_PASS_SHA=$(gh run list --branch "$BASELINE_BRANCH" --workflow "$BASELINE_WORKFLOW" \
  --status success --limit 5 --json headSha --jq '.[0].headSha // ""' 2>/dev/null)
[ -n "$LAST_PASS_SHA" ] \
  || { echo "[context-fetch:github] skipped — no successful $BASELINE_WORKFLOW run on $BASELINE_BRANCH (check both names)" >&2; exit 0; }
git cat-file -e "${LAST_PASS_SHA}^{commit}" 2>/dev/null \
  || { echo "[context-fetch:github] skipped — last-passing SHA $LAST_PASS_SHA not present locally (shallow clone?)" >&2; exit 0; }
DIFF_STAT=$(git diff "$LAST_PASS_SHA..HEAD" --stat --stat-count="${DIFF_STAT_N:-200}" 2>/dev/null)
[ -n "$DIFF_STAT" ] \
  || { echo "[context-fetch:github] skipped — no diff between HEAD and last-passing $LAST_PASS_SHA" >&2; exit 0; }
printf '===== diff vs last-passing CI on %s (last-passing-sha: %s) =====\n\n%s\n' \
  "$BASELINE_BRANCH" "$LAST_PASS_SHA" "$DIFF_STAT"
```

<!-- context-fetch:end -->
