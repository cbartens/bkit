#!/usr/bin/env bash
# rollback-main.sh — Force-reset `main` to a prior known-good SHA via the GitHub API.
#
# Save protection JSON → disable protection → reset ref → restore protection.
# Vercel deployments are NOT promoted here; that step is manual (see docs/deployments.md).
#
# Usage:
#   bash scripts/rollback-main.sh <green-sha>
#   bash scripts/rollback-main.sh --dry-run <green-sha>
#
# Requires: gh, jq.

set -euo pipefail

DRY_RUN=0
SHA=""

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    -h|--help)
      sed -n '2,12p' "$0"
      exit 0
      ;;
    -*)
      echo "Unknown flag: $arg" >&2
      exit 2
      ;;
    *)
      [ -n "$SHA" ] && { echo "Multiple SHAs given: $SHA, $arg" >&2; exit 2; }
      SHA="$arg"
      ;;
  esac
done

[ -z "$SHA" ] && { echo "Usage: $0 [--dry-run] <green-sha>" >&2; exit 2; }
command -v gh >/dev/null || { echo "gh CLI not found" >&2; exit 1; }
command -v jq >/dev/null || { echo "jq not found (install via your package manager)" >&2; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "gh not authenticated; run: gh auth login" >&2; exit 1; }

OWNER_REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
[ -z "$OWNER_REPO" ] && { echo "Could not resolve owner/repo" >&2; exit 1; }

# Resolve possibly-short SHA via the API; abort if it doesn't exist on main's
# reachable history. We check existence by fetching the commit object.
SHA_FULL=$(gh api "repos/$OWNER_REPO/commits/$SHA" --jq .sha 2>/dev/null || true)
[ -z "$SHA_FULL" ] && { echo "SHA $SHA not found in $OWNER_REPO" >&2; exit 1; }

# Confirm the SHA has a green CI run on main (best-effort — non-fatal if absent
# because some repos run checks on PR only). Warn loudly.
GREEN_COUNT=$(gh run list --branch main --status success --limit 50 \
  --json headSha --jq "[.[] | select(.headSha == \"$SHA_FULL\")] | length" 2>/dev/null || echo 0)
if [ "$GREEN_COUNT" -eq 0 ]; then
  echo "WARNING: no successful CI run found for $SHA_FULL on main." >&2
  echo "         Continuing in 5s — Ctrl-C to abort." >&2
  sleep 5
fi

TMP_GET=$(mktemp)
TMP_PUT=$(mktemp)
trap 'rm -f "$TMP_GET" "$TMP_PUT"' EXIT

run() {
  if [ "$DRY_RUN" = "1" ]; then
    echo "DRY: $*"
  else
    eval "$@"
  fi
}

echo "[1/4] Save current branch protection for $OWNER_REPO:main → $TMP_GET"
if ! gh api "repos/$OWNER_REPO/branches/main/protection" > "$TMP_GET" 2>/dev/null; then
  echo "       (no protection currently set — proceeding without save/restore)"
  HAS_PROTECTION=0
else
  HAS_PROTECTION=1
  # Transform GET shape → PUT shape. GET wraps booleans in {enabled: bool}; PUT
  # wants plain booleans for these keys. Keys absent from GET are emitted as
  # null (or omitted) because PUT rejects unknown keys.
  jq '{
        required_status_checks: (.required_status_checks // null),
        enforce_admins:         (.enforce_admins.enabled // false),
        required_pull_request_reviews: (.required_pull_request_reviews // null),
        restrictions:           (.restrictions // null),
        required_linear_history:        (.required_linear_history.enabled // false),
        allow_force_pushes:             (.allow_force_pushes.enabled // false),
        allow_deletions:                (.allow_deletions.enabled // false),
        block_creations:                (.block_creations.enabled // false),
        required_conversation_resolution: (.required_conversation_resolution.enabled // false),
        lock_branch:            (.lock_branch.enabled // false),
        allow_fork_syncing:     (.allow_fork_syncing.enabled // false)
      }' "$TMP_GET" > "$TMP_PUT"
fi

# Restore protection on any exit after this point.
restore_protection() {
  [ "$HAS_PROTECTION" = "1" ] || return 0
  echo "[restore] Re-enabling branch protection on main"
  if [ "$DRY_RUN" = "1" ]; then
    echo "DRY: gh api -X PUT repos/$OWNER_REPO/branches/main/protection --input $TMP_PUT"
  else
    gh api -X PUT "repos/$OWNER_REPO/branches/main/protection" --input "$TMP_PUT" >/dev/null \
      || echo "WARNING: protection restore FAILED — review repo settings manually." >&2
  fi
}
trap 'restore_protection; rm -f "$TMP_GET" "$TMP_PUT"' EXIT

if [ "$HAS_PROTECTION" = "1" ]; then
  echo "[2/4] Disable branch protection"
  run "gh api -X DELETE \"repos/$OWNER_REPO/branches/main/protection\" >/dev/null"
else
  echo "[2/4] (skipped — no protection)"
fi

echo "[3/4] Force-reset main → $SHA_FULL"
run "gh api -X PATCH \"repos/$OWNER_REPO/git/refs/heads/main\" -f sha=\"$SHA_FULL\" -F force=true >/dev/null"

echo "[4/4] Restore protection (via EXIT trap)"
# Trap will restore. Print a final confirmation.
if [ "$DRY_RUN" = "0" ]; then
  NEW_HEAD=$(gh api "repos/$OWNER_REPO/git/refs/heads/main" --jq .object.sha)
  if [ "$NEW_HEAD" = "$SHA_FULL" ]; then
    echo "OK: main is now at $SHA_FULL"
  else
    echo "ERROR: main HEAD = $NEW_HEAD, expected $SHA_FULL" >&2
    exit 1
  fi
fi

echo
echo "Next: re-point production deployment (Vercel does NOT auto-rollback on git rewrites)."
echo "      vercel ls --meta githubCommitSha=$SHA_FULL"
echo "      vercel promote <prior-deployment-url>"
