<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# GitHub Actions — diff since the last green run

Fits: any repo whose CI runs on GitHub Actions. `context=diff`: `git diff --stat` from the last commit where your CI workflow passed on trunk to `HEAD`.

- Secret: `GH_TOKEN` in cloud (local `gh auth login` works too).
- Non-secret: `BASELINE_BRANCH` (your trunk, default `dev`) and `BASELINE_WORKFLOW` (your CI workflow file, default `ci.yml`). Edit the defaults in the block so cloud agents inherit them.
- CLI: `gh` — base tooling, no provision block.
- Domains: none beyond bkit's derived set (`github.com`).
- Needs the last-passing commit locally: a shallow clone self-skips, naming the SHA.

Copy the block below into `.agents/context.md`, below `<!-- bkit:end -->`.

<!-- context-fetch:start github context=diff -->

```bash
# GitHub Actions: diff HEAD vs last-passing CI on trunk.
# Set BASELINE_BRANCH / BASELINE_WORKFLOW to YOUR trunk and workflow file; commit them here.
# Customise: BASELINE_BRANCH / BASELINE_WORKFLOW; last-passing `--limit`; `git diff` pathspec / `--stat` vs full patch.
BASELINE_BRANCH="${BASELINE_BRANCH:-dev}"
BASELINE_WORKFLOW="${BASELINE_WORKFLOW:-ci.yml}"
command -v gh >/dev/null 2>&1 \
  || { echo "[context-fetch:github] skipped — gh CLI not installed" >&2; exit 0; }
LAST_PASS_SHA=$(gh run list --branch "$BASELINE_BRANCH" --workflow "$BASELINE_WORKFLOW" \
  --status success --limit 5 --json headSha --jq '.[0].headSha // ""' 2>/dev/null)
[ -n "$LAST_PASS_SHA" ] \
  || { echo "[context-fetch:github] skipped — no successful $BASELINE_WORKFLOW run on $BASELINE_BRANCH (check both names)" >&2; exit 0; }
git cat-file -e "${LAST_PASS_SHA}^{commit}" 2>/dev/null \
  || { echo "[context-fetch:github] skipped — last-passing SHA $LAST_PASS_SHA not present locally (shallow clone?)" >&2; exit 0; }
DIFF_STAT=$(git diff "$LAST_PASS_SHA..HEAD" --stat 2>/dev/null)
[ -n "$DIFF_STAT" ] \
  || { echo "[context-fetch:github] skipped — no diff between HEAD and last-passing $LAST_PASS_SHA" >&2; exit 0; }
printf '===== diff vs last-passing CI on %s (last-passing-sha: %s) =====\n\n%s\n' \
  "$BASELINE_BRANCH" "$LAST_PASS_SHA" "$DIFF_STAT"
```

<!-- context-fetch:end -->
