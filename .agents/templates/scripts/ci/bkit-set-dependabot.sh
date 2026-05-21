#!/usr/bin/env bash
# bkit-set-dependabot.sh — Enable repo-level prerequisites that Dependabot
# version updates (`.github/dependabot.yml`) silently depend on. Without
# these, GitHub will not read the config file and no PRs will fire.
#
# What this enables (idempotent):
#   - Dependabot alerts (PUT /repos/{o}/{r}/vulnerability-alerts) — surfaces
#     CVE matches against your dependency graph; also implicitly enables the
#     Dependency graph for the repo on personal/private plans.
#   - Dependabot security updates (PUT /repos/{o}/{r}/automated-security-fixes) —
#     auto-PRs for known CVEs in pinned dependencies. Requires alerts to be on.
#
# What this does NOT enable:
#   - Dependency graph itself for some private-repo / org configurations may
#     require a manual toggle at Settings → Code security and analysis. The
#     `vulnerability-alerts` PUT covers most personal/private setups; if your
#     repo still does not show dependabot.yml as "Active" under Insights →
#     Dependency graph → Dependabot, flip the Dependency graph toggle in the
#     UI and re-run this script.
#
# Why this exists: GitHub requires THREE conditions for Dependabot version
# updates to fire — (a) dependabot.yml on the default branch, (b) Dependency
# graph enabled, (c) Dependabot recognising the repo. Bkit's `bkit install --ci`
# handles (a) by seeding the file. This script handles (b)/(c) for the common
# personal/private-repo case.
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
      sed -n '2,30p' "$0"
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
  if gh api "repos/$OWNER_REPO/automated-security-fixes" --silent 2>/dev/null; then
    echo enabled
  else
    echo disabled
  fi
}

if [ "$PRINT_ONLY" = "1" ]; then
  echo "[bkit-set-dependabot] Repo: $OWNER_REPO"
  echo "  Dependabot alerts (vulnerability-alerts):     $(probe_alerts)"
  echo "  Dependabot security updates (automated-fixes): $(probe_security_fixes)"
  echo ""
  echo "  Note: This script cannot probe whether Dependency graph itself is enabled."
  echo "  Verify at: https://github.com/$OWNER_REPO/network/updates"
  exit 0
fi

if [ "$DRY_RUN" = "1" ]; then
  echo "[bkit-set-dependabot] DRY RUN — no changes applied"
  echo "  Would PUT repos/$OWNER_REPO/vulnerability-alerts"
  echo "  Would PUT repos/$OWNER_REPO/automated-security-fixes"
  exit 0
fi

echo "[bkit-set-dependabot] Enabling Dependabot prerequisites on $OWNER_REPO"

# Both PUT endpoints return 204 No Content on success; idempotent (no-op if already on).
gh api -X PUT "repos/$OWNER_REPO/vulnerability-alerts" --silent \
  && echo "  ✓ Dependabot alerts enabled" \
  || { echo "  ✗ Failed to enable Dependabot alerts (check token scopes: needs admin:repo or repo)" >&2; exit 1; }

gh api -X PUT "repos/$OWNER_REPO/automated-security-fixes" --silent \
  && echo "  ✓ Dependabot security updates enabled" \
  || { echo "  ✗ Failed to enable Dependabot security updates" >&2; exit 1; }

echo ""
echo "[bkit-set-dependabot] Done."
echo ""
echo "Next steps:"
echo "  1. Confirm .github/dependabot.yml is on the default branch."
echo "  2. Open https://github.com/$OWNER_REPO/network/updates and verify the config is listed as Active."
echo "  3. If the page reports 'Dependency graph is disabled', toggle it on at"
echo "     https://github.com/$OWNER_REPO/settings/security_analysis"
echo "     (this script cannot do it for you — GitHub does not expose an API for the toggle)."
