#!/bin/bash
# sync-github.sh — Push the minimal CI-required secrets to GitHub Actions.
#
# Usage:
#   bash scripts/secrets/sync-github.sh                  # reads from .env.local
#   bash scripts/secrets/sync-github.sh --dry-run        # show what would be pushed
#
# Pushes only the three secrets the post-CI router needs (see .bkit/docs/cloud.md
# "Claude — required GitHub repo secrets"). Phase 2 removes any other secrets
# from the repo to keep the surface tight.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
REPO="cbartens/bkit"
ENV_FILE="$REPO_ROOT/.env.local"
DRY_RUN=false

# Strip GH_TOKEN from gh's env: if the caller has a fine-grained PAT exported
# (e.g. sourced from an env file), gh prefers it over the `gh auth login`
# session and 403s on actions/secrets/public-key. Use the auth-login user.
gh_clean() { env -u GH_TOKEN gh "$@"; }

for arg in "$@"; do
  [[ "$arg" == "--dry-run" ]] && DRY_RUN=true
done

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ $ENV_FILE not found. Run from repo root."
  exit 1
fi

GITHUB_KEYS=(
  "ANTHROPIC_API_KEY"
  "LINEAR_API_KEY"
  "GH_BKIT_TOKEN"
)

get_val() {
  local search_key="$1"
  grep "^${search_key}=" "$ENV_FILE" 2>/dev/null | head -1 | sed 's/^[^=]*=//' | sed 's/^"//' | sed 's/"$//' || true
}

echo "📤 GitHub Actions Secrets (from $(basename "$ENV_FILE") → $REPO)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ERRORS=0
for key in "${GITHUB_KEYS[@]}"; do
  val=$(get_val "$key")
  if [ -z "$val" ]; then
    echo "  ⚠️  $key (EMPTY — skipping)"
    ERRORS=$((ERRORS + 1))
    continue
  fi

  if [ "$DRY_RUN" = true ]; then
    echo "  🔍 $key = ${val:0:8}..."
  else
    printf '%s' "$val" | gh_clean secret set "$key" --repo "$REPO"
    echo "  ✅ $key"
  fi
done

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Cleanup Phase: Remove undocumented Secrets
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ""
echo "🧹 Phase 2: Cleaning unused GitHub secrets..."

CURRENT_SECRETS=$(gh_clean api "/repos/$REPO/actions/secrets" --jq '.secrets[].name' 2>/dev/null || echo "")
CLEANUP_COUNT=0

for secret in $CURRENT_SECRETS; do
  FOUND=false
  for expected in "${GITHUB_KEYS[@]}"; do
    if [ "$secret" == "$expected" ]; then
      FOUND=true
      break
    fi
  done

  if [ "$FOUND" = false ]; then
    if [ "$DRY_RUN" = true ]; then
      echo "  🔍 Would remove: $secret (not in GITHUB_KEYS)"
    else
      gh_clean secret remove "$secret" --repo "$REPO"
      echo "  🗑️  Removed: $secret"
    fi
    CLEANUP_COUNT=$((CLEANUP_COUNT + 1))
  fi
done

if [ "$CLEANUP_COUNT" -eq 0 ]; then
  echo "  ✅ All clean. No unused secrets found."
fi

echo ""
if [ "$DRY_RUN" = true ]; then
  echo "🔍 DRY RUN complete."
elif [ $ERRORS -gt 0 ]; then
  echo "⚠️  $ERRORS secrets were empty."
else
  echo "✅ GitHub Secrets sync complete!"
fi
