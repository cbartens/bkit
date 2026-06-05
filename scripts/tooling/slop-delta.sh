#!/usr/bin/env bash
# slop:delta — the ENFORCING slop gate (vs `lint:slop` = `slop-scan scan`, which only
# reports and never fails). Materialises the base ref as a detached worktree, compares it to
# the working tree, and fails when THIS change makes the repo WORSE on net — more findings or
# a higher slop score.
#
# It gates on slop-scan's NET delta (netFindingCount / netRepoScore), NOT raw "added"
# occurrences. slop-scan 0.3.0's delta is position-keyed, so a pure line-shift of a
# pre-existing finding (you edited above it) shows up as resolved+added at net zero — that
# must NOT fail the gate. The pre-existing baseline is never yours to fix on the way out.
#
# Usage:  slop-delta.sh [base-ref]
#   base-ref defaults to: $SLOP_BASE_REF, else merge-base(HEAD, origin/dev|origin/main),
#   else HEAD~1. If the base resolves to HEAD (nothing to diff) the gate is a no-op pass.
#
# Requires: slop-scan + node on PATH (both present via the pnpm project) and a base ref that
# is present locally — CI must fetch it (fetch-depth: 0 or an explicit base fetch).
set -euo pipefail

base_ref="${1:-${SLOP_BASE_REF:-}}"

if [ -z "$base_ref" ]; then
  for cand in origin/dev origin/main; do
    if git rev-parse --verify --quiet "$cand" >/dev/null; then
      base_ref="$(git merge-base HEAD "$cand" 2>/dev/null || true)"
      [ -n "$base_ref" ] && break
    fi
  done
  [ -z "$base_ref" ] && base_ref="$(git rev-parse --verify --quiet HEAD~1 || git rev-parse HEAD)"
fi

if ! base_sha="$(git rev-parse --verify --quiet "$base_ref^{commit}")"; then
  echo "[slop:delta] base ref '$base_ref' not found locally — fetch it (CI needs fetch-depth: 0). Skipping." >&2
  exit 0
fi

if [ "$base_sha" = "$(git rev-parse HEAD)" ]; then
  echo "[slop:delta] base resolves to HEAD — no committed delta to check; skipping."
  exit 0
fi

# Resolve the slop-scan binary: bare on PATH when invoked via `pnpm slop:delta`
# (node_modules/.bin is prepended); fall back to the locally-installed package
# (--no-install never reaches the network) for direct invocation.
if command -v slop-scan >/dev/null 2>&1; then
  slop=(slop-scan)
else
  slop=(npx --no-install slop-scan)
fi

wt="$(mktemp -d "${TMPDIR:-/tmp}/slop-delta.XXXXXX")"
cleanup() {
  git worktree remove --force "$wt" >/dev/null 2>&1 || true
  rm -rf "$wt" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

git worktree add -q --detach "$wt" "$base_sha"

echo "[slop:delta] base $base_sha (${base_ref}) vs working tree"
"${slop[@]}" delta --base "$wt" --head . --json | node -e '
const d = JSON.parse(require("fs").readFileSync(0, "utf8"));
const s = d.summary || {};
const added = s.addedCount || 0, resolved = s.resolvedCount || 0, worsened = s.worsenedCount || 0;
const netCount = s.netFindingCount || 0, netScore = s.netRepoScore || 0;
console.error(`[slop:delta] added ${added}, resolved ${resolved}, worsened ${worsened}; net findings ${netCount}, net score ${netScore.toFixed(2)}`);
// Fail only on NET worsening — pure line-shifts of the existing baseline net to zero.
if (netCount > 0 || netScore > 0.001) {
  console.error("[slop:delta] FAIL — this change adds or worsens slop on net. Inspect: slop-scan delta --base <base-worktree> --head .");
  process.exit(1);
}
console.error("[slop:delta] OK — no net-new or worsened findings (baseline line-shifts ignored).");
'
