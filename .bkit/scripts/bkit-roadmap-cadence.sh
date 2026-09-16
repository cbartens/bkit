#!/usr/bin/env sh
# bkit-roadmap-cadence.sh — deterministic threshold evaluator for the #380
# ledger/audit-injection cadence (design Addendum 3 § Q). A discrete,
# sourceable jq/shell expression — NEVER inline orchestrator prose — so a
# bats test can exercise the real logic instead of grepping text.
#
# Fires when EITHER:
#   (a) distinct FIDs reaching `BUILT` in docs/roadmap.jsonl SINCE the last
#       `ROADMAP_CADENCE_FIRE` counter row (repeat BUILT rows for one FID do
#       NOT advance the count — dedup by `key`), crosses buildCycles; OR
#   (b) stalenessDays have elapsed since that same fire row's `ts`.
#
# Anchored on the last FIRE, never the last analysis-refresh `ts` — every
# `/bkit-roadmap` run refreshes the analysis block, so a refresh-anchored
# counter would reset on each run and never reach the threshold.
#
# When no ROADMAP_CADENCE_FIRE row has EVER been written, the baseline is the
# EARLIEST row's `ts` in docs/roadmap.jsonl (the repo's own roadmap-tracking
# genesis) rather than epoch 0 — an epoch-0 baseline would make the staleness
# fallback fire immediately on every fresh install.
#
# Usage (sourced by a workflow orchestrator):
#   . "$REPO_ROOT/.bkit/scripts/bkit-roadmap-cadence.sh" || echo "[bkit-roadmap] missing bkit-roadmap-cadence.sh — run 'bkit install'" >&2
#   bkit_roadmap_cadence_eval "$ROADMAP_JSONL" "$STATS_JSONL" "$BUILD_CYCLES" "$STALENESS_DAYS"
#   # stdout: "FIRE <count>" or "SKIP <count>"
#
# Fail-open: absent/empty/malformed inputs never abort — they resolve to a
# SKIP with count 0. This script never exits non-zero.

# bkit_roadmap_cadence_eval ROADMAP_JSONL STATS_JSONL BUILD_CYCLES STALENESS_DAYS
bkit_roadmap_cadence_eval() {
  _ce_roadmap="$1"
  _ce_stats="$2"
  _ce_build_cycles="${3:-10}"
  _ce_staleness_days="${4:-90}"

  if ! command -v jq >/dev/null 2>&1; then
    echo "[bkit-roadmap] jq not found — cadence evaluation skipped" >&2
    echo "SKIP 0"
    return 0
  fi

  case "$_ce_build_cycles" in '' | *[!0-9]*) _ce_build_cycles=10 ;; esac
  case "$_ce_staleness_days" in '' | *[!0-9]*) _ce_staleness_days=90 ;; esac

  _ce_last_fire_ts=""
  if [ -f "$_ce_stats" ] && [ -s "$_ce_stats" ]; then
    _ce_last_fire_ts="$(jq -s '[.[] | select(.kind=="counter" and .counterName=="ROADMAP_CADENCE_FIRE")] | sort_by(.ts) | last | .ts' "$_ce_stats" 2>/dev/null)"
  fi
  if [ -z "$_ce_last_fire_ts" ] || [ "$_ce_last_fire_ts" = "null" ]; then
    # Never fired: baseline at the ledger's own genesis, not epoch 0.
    if [ -f "$_ce_roadmap" ] && [ -s "$_ce_roadmap" ]; then
      # `- 1`: the comparison below is strictly `> lastFire`, so the genesis
      # row itself (a legitimate BUILT candidate) must not be excluded by its
      # own timestamp being used as the baseline.
      _ce_last_fire_ts="$(jq -s '[.[] | select(.kind=="feature") | .ts] | min' "$_ce_roadmap" 2>/dev/null)"
      if [ -n "$_ce_last_fire_ts" ] && [ "$_ce_last_fire_ts" != "null" ]; then
        _ce_last_fire_ts=$((_ce_last_fire_ts - 1))
      fi
    fi
    if [ -z "$_ce_last_fire_ts" ] || [ "$_ce_last_fire_ts" = "null" ]; then
      # No ledger genesis either (empty/absent docs/roadmap.jsonl): baseline
      # at "now" — an empty ledger has nothing to be stale ABOUT, so the
      # staleness fallback must not fire on its very first evaluation.
      _ce_last_fire_ts=$(($(date -u +%s) * 1000))
    fi
  fi

  _ce_built_count=0
  if [ -f "$_ce_roadmap" ] && [ -s "$_ce_roadmap" ]; then
    _ce_built_count="$(jq -s --argjson lastFire "$_ce_last_fire_ts" '[.[] | select(.kind=="feature" and .status=="BUILT" and .ts > $lastFire) | .key] | unique | length' "$_ce_roadmap" 2>/dev/null)"
    [ -z "$_ce_built_count" ] && _ce_built_count=0
  fi

  _ce_now_ms=$(($(date -u +%s) * 1000))
  _ce_stale_ms=$((_ce_staleness_days * 86400 * 1000))
  _ce_elapsed_ms=$((_ce_now_ms - _ce_last_fire_ts))

  if [ "$_ce_built_count" -ge "$_ce_build_cycles" ] 2>/dev/null || [ "$_ce_elapsed_ms" -ge "$_ce_stale_ms" ] 2>/dev/null; then
    echo "FIRE $_ce_built_count"
  else
    echo "SKIP $_ce_built_count"
  fi
  return 0
}
