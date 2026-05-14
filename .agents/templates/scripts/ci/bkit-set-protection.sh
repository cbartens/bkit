#!/usr/bin/env bash
# bkit-set-protection.sh — Apply default branch protection to main (and optionally dev).
#
# Default policy aligns with bkit's ship workflow:
#   - main: require PR, require ci.yml#run-tests status, linear history, no force-push, no deletion.
#   - dev (--dev): no required PR (chore commits allowed) but require ci.yml#run-tests; no force-push.
#
# Usage:
#   bash scripts/ci/bkit-set-protection.sh             # main only, default policy
#   bash scripts/ci/bkit-set-protection.sh --dev       # also configure dev with chore-allowed policy
#   bash scripts/ci/bkit-set-protection.sh --dry-run   # print every gh api call without executing
#   bash scripts/ci/bkit-set-protection.sh --print     # print current protection JSON for main and exit
#
# Requires: gh, jq. Run from repo root. Override policy by editing the protection
# payload below — the defaults match the bkit-ship workflow's expectations.

set -euo pipefail

DRY_RUN=0
PRINT_ONLY=0
DO_DEV=0

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --dev) DO_DEV=1 ;;
    --print) PRINT_ONLY=1 ;;
    -h|--help)
      sed -n '2,16p' "$0"
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

# Default policy for main: require PR, require ci.yml#run-tests, linear history, no force-push, no deletion.
MAIN_PAYLOAD=$(cat <<'JSON'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["run-tests"]
  },
  "enforce_admins": false,
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

if [ "$DO_DEV" = "1" ]; then
  # Looser policy for dev: chore commits allowed (no required PR), but status check + no force-push.
  DEV_PAYLOAD=$(cat <<'JSON'
{
  "required_status_checks": {
    "strict": false,
    "contexts": ["run-tests"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": true,
  "allow_deletions": false
}
JSON
)
  apply_protection dev "$DEV_PAYLOAD"
fi

echo "[bkit-set-protection] Done. Verify with: gh api repos/$OWNER_REPO/branches/main/protection | jq ."
