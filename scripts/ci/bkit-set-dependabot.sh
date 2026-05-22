#!/usr/bin/env bash
# bkit-set-dependabot.sh — Enable / sanity-check the repo-level state that
# Dependabot version updates (.github/dependabot.yml) silently depend on.
#
# Policy: bkit consumers NEVER want Dependabot auto-PRs against `main`. Bkit
# branch protection only accepts PRs from `dev`, so any security-update PR
# routed to the default branch (which is what `automated-security-fixes`
# produces) is dead-on-arrival at best and a policy violation at worst.
# This script therefore:
#   ✓ ENABLES  vulnerability-alerts          — required for dependabot.yml to fire;
#                                              alerts are visibility-only (no auto-PRs).
#   ✗ DISABLES automated-security-fixes     — defensively turned OFF so the auto-PRs
#                                              to `main` never appear. CVE handling stays
#                                              human: read the Security tab, open a PR
#                                              against `dev` yourself if needed.
#
# Dependabot version updates (the .github/dependabot.yml file) still fire
# normally — they honour `target-branch: dev` and land on dev as expected.
#
# What this does NOT toggle:
#   - Dependency graph (UI-only on private repos; no API surface). Verify at
#     Settings → Code security and analysis if the config still isn't recognised.
#
# Usage:
#   bash scripts/ci/bkit-set-dependabot.sh             # apply (idempotent)
#   bash scripts/ci/bkit-set-dependabot.sh --dry-run   # print every gh api call without executing
#   bash scripts/ci/bkit-set-dependabot.sh --print     # print current Dependabot state and exit
#
# Requires: gh (authenticated). Run from repo root.

set -euo pipefail

DRY_RUN=0
PRINT_ONLY=0

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --print) PRINT_ONLY=1 ;;
    -h|--help)
      sed -n '2,32p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown flag: $arg" >&2
      exit 2
      ;;
  esac
done

command -v gh >/dev/null 2>&1 || { echo "gh CLI not installed" >&2; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "gh auth status failed — run 'gh auth login'" >&2; exit 1; }

OWNER_REPO=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
[ -n "$OWNER_REPO" ] || { echo "Could not resolve repo nameWithOwner via 'gh repo view'" >&2; exit 1; }

probe_alerts() {
  # 204 = enabled, 404 = disabled, other = unknown
  if gh api "repos/$OWNER_REPO/vulnerability-alerts" --silent 2>/dev/null; then
    echo enabled
  else
    echo disabled
  fi
}

probe_security_fixes() {
  # Endpoint returns 200 with {"enabled": bool, "paused": bool}
  local body
  body=$(gh api "repos/$OWNER_REPO/automated-security-fixes" 2>/dev/null || echo '{"enabled":null}')
  if echo "$body" | grep -q '"enabled":true'; then
    echo enabled
  elif echo "$body" | grep -q '"enabled":false'; then
    echo disabled
  else
    echo unknown
  fi
}

if [ "$PRINT_ONLY" = "1" ]; then
  echo "[bkit-set-dependabot] Repo: $OWNER_REPO"
  echo "  Dependabot alerts (vulnerability-alerts):              $(probe_alerts)        (target: enabled)"
  echo "  Dependabot security updates (automated-security-fixes): $(probe_security_fixes)       (target: disabled — never auto-PR to main)"
  echo ""
  echo "  Note: This script cannot probe whether Dependency graph itself is enabled."
  echo "  Verify at: https://github.com/$OWNER_REPO/network/updates"
  exit 0
fi

if [ "$DRY_RUN" = "1" ]; then
  echo "[bkit-set-dependabot] DRY RUN — no changes applied"
  echo "  Would PUT    repos/$OWNER_REPO/vulnerability-alerts          (enable)"
  echo "  Would DELETE repos/$OWNER_REPO/automated-security-fixes      (disable — bkit policy: never auto on main)"
  exit 0
fi

echo "[bkit-set-dependabot] Applying bkit policy on $OWNER_REPO"

gh api -X PUT "repos/$OWNER_REPO/vulnerability-alerts" --silent \
  && echo "  ✓ Dependabot alerts enabled (visibility only)" \
  || { echo "  ✗ Failed to enable Dependabot alerts (check token scopes: needs admin:repo or repo)" >&2; exit 1; }

gh api -X DELETE "repos/$OWNER_REPO/automated-security-fixes" --silent \
  && echo "  ✓ Dependabot automated security fixes disabled (no auto-PRs to main)" \
  || { echo "  ✗ Failed to disable Dependabot automated security fixes (the endpoint returns 204 on success and 404 if already off — re-run with --print to verify)" >&2; exit 1; }

echo ""
echo "[bkit-set-dependabot] Done."
echo ""
echo "Next steps:"
echo "  1. Confirm .github/dependabot.yml is on the default branch."
echo "  2. Open https://github.com/$OWNER_REPO/network/updates and verify the config is listed as Active."
echo "  3. If the page reports 'Dependency graph is disabled', toggle it on at"
echo "     https://github.com/$OWNER_REPO/settings/security_analysis"
echo "     (this script cannot do it for you — GitHub does not expose an API for the toggle)."
echo ""
echo "  4. CVE alerts will still appear in the Security tab — handle them by opening"
echo "     a PR against 'dev' yourself when needed. Dependabot version updates"
echo "     (weekly .github/dependabot.yml schedule) continue to fire normally against dev."
