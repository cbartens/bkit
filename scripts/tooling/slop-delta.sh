#!/usr/bin/env bash
# slop:delta — the ENFORCING slop gate (vs `lint:slop` = `slop-scan scan`, which only
# reports and never fails). Materialises the base ref as a detached worktree and runs
# `slop-scan delta --fail-on added,worsened`, so a push/CI fails when THIS change adds or
# worsens a finding — without blocking on the repo's pre-existing slop baseline.
#
# Usage:  slop-delta.sh [base-ref]
#   base-ref defaults to: $SLOP_BASE_REF, else merge-base(HEAD, origin/dev|origin/main),
#   else HEAD~1. If the base resolves to HEAD (nothing to diff) the gate is a no-op pass.
#
# Requires: slop-scan on PATH (node_modules/.bin via the pnpm script) and a base ref that
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

echo "[slop:delta] base $base_sha (${base_ref}) vs working tree — failing on added/worsened findings"
"${slop[@]}" delta --base "$wt" --head . --fail-on added,worsened
