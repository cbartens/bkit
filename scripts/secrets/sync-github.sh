#!/bin/bash
# sync-github.sh — Push the minimal CI-required secrets to GitHub Actions.
#
# Usage:
#   bash scripts/secrets/sync-github.sh                  # reads from apps/web/.env.preview
#   bash scripts/secrets/sync-github.sh --dry-run         # show what would be pushed
#
# Config-driven (scripts/secrets/sync.config.sh): the curated CI scope is
# GITHUB_KEYS (which now includes VERCEL_ORG_ID/VERCEL_PROJECT_ID). Every value
# resolves from the env files via get_val — nothing is read from outside the env
# files, so this script is portable across repos. This is intentionally a SMALL
# list — see docs/knowledge.jsonl §"Secrets Management Architecture".
#
# Two sources, by tier (get_val prefers AGENT_ENV_FILES, then falls back to the
# web env file):
#   - .bkit/.env              → agent/CI-tier secrets (BKIT_GH_TOKEN_INSTALL, BKIT_GH_TOKEN,
#                               BKIT_ANTHROPIC_API_KEY, BKIT_CURSOR_API_KEY)
#   - apps/web/.env.preview   → deploy-infra tokens (VERCEL_*, SUPABASE_ACCESS_TOKEN)
#
# Mirror semantics within the curated scope:
#   - GITHUB_KEYS entry present + non-empty in source → upsert on the repo
#   - GITHUB_KEYS entry empty/absent in source        → deleted in reconcile phase
#   - PROTECTED_KEYS                                   → never pushed, never deleted

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
# shellcheck source=sync.config.sh
source "$SCRIPT_DIR/sync.config.sh"

ENV_FILE="$REPO_ROOT/$PREVIEW_ENV_FILE"
DRY_RUN=false

for arg in "$@"; do
  [[ "$arg" == "--dry-run" ]] && DRY_RUN=true
done

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ $ENV_FILE not found. Run from repo root."
  exit 1
fi

# Strip GH_TOKEN from gh's process env so it falls back to the gh CLI's stored
# OAuth auth. The shell may have GH_TOKEN set to the fine-grained PAT from
# .env.preview (we sync it as a secret), and fine-grained PATs 403 on
# /actions/secrets/public-key — silently breaking secret writes. See KN-41.
GH="env -u GH_TOKEN gh"

# Target repo — derived from the checkout so this script is repo-portable:
# copy it + sync.config.sh into any repo, no hardcoded owner/name to edit.
REPO="$($GH repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)"
if [ -z "$REPO" ]; then
  echo "❌ Could not resolve GitHub repo — run from a checkout with gh access."
  exit 1
fi

# Resolve a key's value: AGENT_ENV_FILES (in order, first non-empty wins) then
# this script's $ENV_FILE. Each grep is `2>/dev/null ... || true` so a missing
# key resolves to empty instead of aborting under `set -euo pipefail`.
get_val() {
  local search_key
  search_key="$(github_source_key "$1")"
  local val=""
  local f
  for f in "${AGENT_ENV_FILES[@]}"; do
    local path="$REPO_ROOT/$f"
    [ -f "$path" ] || continue
    val=$(grep "^${search_key}=" "$path" 2>/dev/null | head -1 | sed 's/^[^=]*=//' | sed 's/^"//' | sed 's/"$//' || true)
    [ -n "$val" ] && { printf '%s' "$val"; return; }
  done
  if [ -f "$ENV_FILE" ]; then
    val=$(grep "^${search_key}=" "$ENV_FILE" 2>/dev/null | head -1 | sed 's/^[^=]*=//' | sed 's/^"//' | sed 's/"$//' || true)
  fi
  printf '%s' "$val"
}

is_protected() {
  local key=$1 p
  for p in "${PROTECTED_KEYS[@]}"; do
    [[ "$key" == "$p" ]] && return 0
  done
  return 1
}

echo "GitHub Actions Secrets (from $(basename "$ENV_FILE") + agent env)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📤 Phase 1: Pushing ${#GITHUB_KEYS[@]} configured keys to $REPO..."

# KEEP set: secrets that must remain on the repo (everything we pushed +
# the two Vercel ids + PROTECTED_KEYS). Anything live but not in KEEP is deleted
# in the reconcile phase — this also covers empty/absent GITHUB_KEYS entries,
# which never get pushed and therefore fall out of KEEP.
declare -a KEEP=()

for key in "${GITHUB_KEYS[@]}"; do
  if is_protected "$key"; then
    echo "  ✅ $key (protected — never pushed)"
    continue
  fi
  val=$(get_val "$key")
  if [ -z "$val" ]; then
    echo "  ⚠️  $key (EMPTY — will reconcile-delete if present remotely)"
    continue
  fi

  if [ "$DRY_RUN" = true ]; then
    echo "  ✅ $key = ${val:0:8}..."
  else
    echo -n "$val" | $GH secret set "$key" --repo "$REPO"
    echo "  ✅ $key"
  fi
  KEEP+=("$key")
done

# PROTECTED keys are never deleted — keep them.
for p in "${PROTECTED_KEYS[@]}"; do
  KEEP+=("$p")
done

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Reconcile Phase: delete any live secret not in KEEP
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "🧹 Phase 2: Reconciling GitHub secrets against scope..."

# A failed API call must NOT degrade to "no live secrets" — that printed a reassuring
# "✅ All clean. Nothing to delete." while nothing had actually been checked.
if ! CURRENT_SECRETS=$($GH api "/repos/$REPO/actions/secrets" --jq '.secrets[].name'); then
  echo "  ❌ Could not list live secrets on $REPO — refusing to report a clean reconcile."
  exit 1
fi
CLEANUP_COUNT=0

for secret in $CURRENT_SECRETS; do
  FOUND=false
  for keep in "${KEEP[@]}"; do
    if [ "$secret" == "$keep" ]; then
      FOUND=true
      break
    fi
  done

  if [ "$FOUND" = false ]; then
    if [ "$DRY_RUN" = true ]; then
      echo "  ⚠️  would DELETE $secret (not in scope)"
    else
      $GH secret remove "$secret" --repo "$REPO"
      echo "  ⚠️  Deleted: $secret"
    fi
    CLEANUP_COUNT=$((CLEANUP_COUNT + 1))
  fi
done

if [ "$CLEANUP_COUNT" -eq 0 ]; then
  echo "  ✅ All clean. Nothing to delete."
fi

echo ""
if [ "$DRY_RUN" = true ]; then
  echo "🔍 DRY RUN complete."
else
  echo "✅ GitHub Secrets sync complete!"
fi
