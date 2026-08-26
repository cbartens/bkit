#!/usr/bin/env sh
# bkit-roadmap-reconcile.sh — #380 Directive 4 (RESCOPED, design Addendum 3
# § O). The `docs/roadmap.md` board is a pure projection of
# docs/roadmap.jsonl, so a lost/corrupted board needs no recovery — rerunning
# the fold rebuilds it exactly. What remains is a DRIFT CHECK: warn when a
# live `feat/*` branch has NO row at all in docs/roadmap.jsonl (a close that
# never wrote its row). This NEVER mutates docs/roadmap.md and NEVER exits
# non-zero — warn-only, best-effort, fail-open throughout.
#
# Usage (sourced by a workflow orchestrator):
#   . "$REPO_ROOT/.bkit/scripts/bkit-roadmap-reconcile.sh" || echo "[bkit-roadmap] missing bkit-roadmap-reconcile.sh — run 'bkit install'" >&2
#   bkit_roadmap_drift_check "$REPO_ROOT" "$ROADMAP_JSONL"

# bkit_roadmap_drift_check REPO_ROOT ROADMAP_JSONL
bkit_roadmap_drift_check() {
  _dc_root="${1:-.}"
  _dc_roadmap="${2:-${_dc_root}/docs/roadmap.jsonl}"

  if ! command -v jq >/dev/null 2>&1; then
    echo "[bkit-roadmap] jq not found — drift check skipped" >&2
    return 0
  fi

  _dc_local_branches="$(git -C "$_dc_root" for-each-ref --format='%(refname:short)' 'refs/heads/feat/*' 2>/dev/null)"
  _dc_remote_branches="$(git -C "$_dc_root" ls-remote --heads origin 'feat/*' 2>/dev/null | sed -e 's#.*refs/heads/##')"

  _dc_all_branches="$(printf '%s\n%s\n' "$_dc_local_branches" "$_dc_remote_branches" | sort -u)"

  for _dc_branch in $_dc_all_branches; do
    [ -z "$_dc_branch" ] && continue
    case "$_dc_branch" in
      feat/*) _dc_fid="${_dc_branch#feat/}" ;;
      *) continue ;;
    esac
    [ -z "$_dc_fid" ] && continue

    if [ -f "$_dc_roadmap" ] && [ -s "$_dc_roadmap" ]; then
      _dc_hit="$(jq -c --arg fid "$_dc_fid" 'select(.kind=="feature" and .key==$fid)' "$_dc_roadmap" 2>/dev/null | wc -l | tr -d ' ')"
    else
      _dc_hit=0
    fi

    if [ "${_dc_hit:-0}" -eq 0 ]; then
      echo "[bkit-roadmap] drift: live feat/$_dc_fid has NO docs/roadmap.jsonl row — a close that never wrote" >&2
    fi
  done

  return 0
}
