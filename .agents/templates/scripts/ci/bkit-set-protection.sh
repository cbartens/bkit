#!/usr/bin/env bash
# bkit-set-protection.sh — Apply bkit's branch protection policy to main.
#
# Policy (aligns with the bkit release flow — main only ever moves via a
# release PR; build/ship keep all feat/* PRs on dev):
#   - main: require PR, require the `bkit-tests` status check, enforce for
#     admins (no bypass), linear history, no force-push, no deletion.
#
# `dev` is intentionally left UNPROTECTED. Operators choose direct-push or
# feat/PR and own that tests ran (either on dev directly or on the branch/PR).
#
# enforce-for-admins is load-bearing: agents act with the owner's admin token,
# so an admin-bypass exemption means the agent itself is the bypass. Covering
# admins is the only way protection actually constrains agents.
#
# Before requiring `bkit-tests`, the script verifies a job by that name exists
# in .github/workflows/ci.yml — requiring a status check that no CI job
# produces would wedge every PR (the context stays "Expected" forever).
#
# Usage:
#   bash scripts/ci/bkit-set-protection.sh             # apply main policy
#   bash scripts/ci/bkit-set-protection.sh --dry-run   # print the gh api call without executing
#   bash scripts/ci/bkit-set-protection.sh --print     # print current protection JSON for main and exit
#
# Requires: gh, jq. Run from repo root. Override policy by editing the payload
# below — the defaults match the bkit release flow's expectations.

set -euo pipefail

DRY_RUN=0
PRINT_ONLY=0
REQUIRED_JOB="bkit-tests"
CI_YML=".github/workflows/ci.yml"

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --print) PRINT_ONLY=1 ;;
    -h|--help)
      sed -n '2,24p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown flag: $arg" >&2
      exit 2
      ;;
  esac
done

command -v gh >/dev/null 2>&1 || { echo "gh CLI not installed" >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "jq not installed" >&2; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "gh auth status failed — run 'gh auth login'" >&2; exit 1; }

OWNER_REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
[ -n "$OWNER_REPO" ] || { echo "Could not resolve repo nameWithOwner via 'gh repo view'" >&2; exit 1; }

if [ "$PRINT_ONLY" = "1" ]; then
  gh api "repos/$OWNER_REPO/branches/main/protection" 2>/dev/null \
    || echo '{"error": "main has no protection rule"}'
  exit 0
fi

# Pre-flight: the required status check must correspond to a real CI job, or
# branch protection blocks every PR waiting on a context that never reports.
[ -f "$CI_YML" ] || {
  echo "[bkit-set-protection] $CI_YML not found — cannot verify the '$REQUIRED_JOB' status check exists. Aborting." >&2
  exit 1
}
if ! grep -qE "^[[:space:]]+${REQUIRED_JOB}:" "$CI_YML"; then
  echo "[bkit-set-protection] No job named '$REQUIRED_JOB' found in $CI_YML." >&2
  echo "[bkit-set-protection] Requiring a status check that no CI job produces would wedge every PR. Aborting." >&2
  exit 1
fi

apply_protection() {
  local BRANCH="$1"
  local PAYLOAD="$2"

  echo "[bkit-set-protection] Applying protection to $BRANCH on $OWNER_REPO"
  if [ "$DRY_RUN" = "1" ]; then
    echo "  gh api -X PUT repos/$OWNER_REPO/branches/$BRANCH/protection --input -"
    echo "$PAYLOAD" | jq .
    return 0
  fi

  echo "$PAYLOAD" | gh api -X PUT "repos/$OWNER_REPO/branches/$BRANCH/protection" --input -
}

# main: require PR, require the bkit-tests check, enforce for admins (no bypass),
# linear history, no force-push, no deletion.
MAIN_PAYLOAD=$(cat <<JSON
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["$REQUIRED_JOB"]
  },
  "enforce_admins": true,
  "required_pull_request_reviews": {
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 0
  },
  "restrictions": null,
  "required_linear_history": true,
  "allow_force_pushes": false,
  "allow_deletions": false
}
JSON
)

apply_protection main "$MAIN_PAYLOAD"

echo "[bkit-set-protection] Done. Verify with: gh api repos/$OWNER_REPO/branches/main/protection | jq ."
