#!/usr/bin/env sh
# bkit-roadmap-fold.sh — deterministic docs/roadmap.md projection from
# docs/roadmap.jsonl (#380 Addendum 3 § O). FULL REGENERATE of the
# `roadmap-status` marker block ONLY — never an upsert. docs/roadmap.jsonl is
# the SOLE per-close input; the on-disk `docs/plans/**` scan is a one-time
# bootstrap seed performed by `bkit telemetry migrate`, not read here.
#
# Marker-pair invariant (Addendum 3 § P): bkit rewrites ONLY the bytes
# strictly between a start/end marker pair. Everything else in docs/roadmap.md
# — above the first marker, between the two marker blocks, and below the last
# marker (incl. the consumer `## Backlog / Ideas` region) — is NEVER touched.
#
# Usage (sourced by a workflow orchestrator, which knows REPO_ROOT):
#   . "$REPO_ROOT/.bkit/scripts/bkit-roadmap-fold.sh" || { echo "[bkit-roadmap] missing bkit-roadmap-fold.sh — run 'bkit install'" >&2; }
#   bkit_roadmap_fold "$REPO_ROOT"
#
# Fail-open: every branch (jq absent, ledger absent/empty/malformed, marker
# repair) logs one `[bkit-roadmap]` stderr line and returns 0 — this script
# NEVER exits non-zero and NEVER gates the caller's workflow close.

BKIT_ROADMAP_STATUS_START='<!-- bkit:roadmap-status start -->'
BKIT_ROADMAP_STATUS_END='<!-- bkit:roadmap-status end -->'
BKIT_ROADMAP_ANALYSIS_START='<!-- bkit:roadmap-analysis start -->'
BKIT_ROADMAP_ANALYSIS_END='<!-- bkit:roadmap-analysis end -->'

# Sources BKIT_STATUS_FOLD (single-source #58 reducer) — used ONLY by the
# one-time bootstrap seed in bkit-telemetry-migrate.ts, NOT by this per-close
# projection (which reads docs/roadmap.jsonl exclusively). Exposed here so a
# caller that wants both can source this one file. Fail-closed per the
# existing bkit-status-fold.sh contract: absent file returns non-zero, caller
# decides whether that is fatal for ITS use of BKIT_STATUS_FOLD.
bkit_roadmap_source_status_fold() {
  _bkit_roadmap_root="${1:-.}"
  # shellcheck disable=SC1090
  . "${_bkit_roadmap_root}/.bkit/scripts/bkit-status-fold.sh" 2>/dev/null || {
    echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2
    return 2
  }
}

# jq projection: fold docs/roadmap.jsonl by `key` last-wins (highest `ts`),
# bucket by folded status. ABANDONED rows are excluded from every bucket
# (hidden from the whole board). SHIPPED capped at the newest 10 by ts desc;
# older SHIPPED rows stay in the ledger and simply fall off the board.
#
# Tracker enrichment (#380 matrix row 20): `--argjson tracker` is an ARRAY of
# `{key, status, title?, category?, ts?, milestone?, blockedBy?}` rows supplied
# by the calling workflow's orchestrator-mediated `list_issues` MCP read (never
# `gh`/`search_issues`) — empty `[]` when no tracker is wired or the read
# failed/returned nothing (treated inconclusive, never blocks). Tracker rows
# are ADDITIVE ONLY: a `key` already present from the ledger always wins (the
# ledger is canonical, Addendum 3 § O) — a tracker row only fills a bucket when
# its FID has no ledger row at all. Human-confirmed naming: this is the
# `BKIT_ROADMAP_FOLD` sourced-helper symbol from the Naming Review.
#
# `tid` normalises the two key NAMESPACES to one tracker identity before that
# additive-only test runs. Ledger keys are FIDs (`{ISSUE_ID}-{slug}` —
# `412-export-csv`, `TEAM-42-delta`); tracker rows are keyed by raw issue id
# (`#412`, `TEAM-42`). Comparing them raw never matched, so every ledger-backed
# FID ALSO rendered as a second tracker row in the same section. Extraction
# mirrors the ship reverse-sync convention (`^[0-9]+` github, `^[A-Za-z]+-[0-9]+`
# linear). Keys matching neither shape — e.g. migrated `completed-<slug>-<hash>`
# rows — pass through unchanged, so they can never falsely collapse together.
# shellcheck disable=SC2016
BKIT_ROADMAP_FOLD='def tid: ((. // "") | ltrimstr("#") | ascii_downcase) as $tk | ($tk | split("-")) as $tp | if (($tp|length) >= 1) and ($tp[0] | test("^[0-9]+$")) then $tp[0] elif (($tp|length) >= 2) and ($tp[0] | test("^[a-z]+$")) and ($tp[1] | test("^[0-9]+$")) then ($tp[0] + "-" + $tp[1]) else $tk end; def latest_by_key: group_by(.key) | map(sort_by(.ts) | last); latest_by_key as $folded | ($folded | map(.key | tid)) as $known | ($tracker | map(select(.key and .status)) | map(select(.status as $s | (["DESIGNED","PLANNED","BUILT","DEBUGGED","SHIPPED"] | index($s)) != null)) | map(select((.key | tid) as $k | ($known | index($k)) == null)) | map(. + {category: (.category // "tracker"), summary: (.summary // .title // .key), ts: (.ts // 0), source: "tracker"})) as $extra | ($folded + $extra) as $rows | { designed: ($rows | map(select(.status=="DESIGNED"))), planned: ($rows | map(select(.status=="PLANNED"))), built: ($rows | map(select(.status=="BUILT"))), debugged: ($rows | map(select(.status=="DEBUGGED"))), shipped: ($rows | map(select(.status=="SHIPPED")) | sort_by(-.ts) | .[0:10]) }'

# Render one phase-section's rows (a jq-encoded JSON array, on stdin via $1)
# as a markdown table, or an italic placeholder when empty. Columns match the
# plan's Data Schema Changes contract (`FID | Title | Milestone | Blocked-by |
# Last-transition ts`); ledger-only rows have no milestone/blocked-by data (em
# dash), tracker-enriched rows populate them from the wired MCP read.
_bkit_roadmap_render_rows() {
  _rows_json="$1"
  _count="$(printf '%s' "$_rows_json" | jq 'length' 2>/dev/null)"
  if [ -z "$_count" ] || [ "$_count" = "0" ]; then
    printf '%s\n' "_(none)_"
    return 0
  fi
  printf '%s\n' "| FID | Title | Milestone | Blocked-by | Last-transition (ts) |"
  printf '%s\n' "| --- | --- | --- | --- | --- |"
  printf '%s' "$_rows_json" | jq -r '.[] | "| \(.key) | \(.summary // .key) | \(.milestone // "—") | \(.blockedBy // "—") | \(.ts) |"'
}

# Rewrite ONLY the bytes strictly between `$2`/`$3` in file `$1` with `$4`.
# When the pair is absent or mangled (start found without end, or out of
# order), APPEND a fresh pair at EOF — this NEVER removes an existing byte,
# so a self-heal can never swallow adjacent consumer text (matrix row 25).
_bkit_roadmap_write_block() {
  _wb_file="$1"
  _wb_start="$2"
  _wb_end="$3"
  _wb_new="$4"

  _wb_start_line=""
  _wb_end_line=""
  if [ -f "$_wb_file" ]; then
    _wb_start_line="$(grep -nF "$_wb_start" "$_wb_file" 2>/dev/null | head -1 | cut -d: -f1)"
    _wb_end_line="$(grep -nF "$_wb_end" "$_wb_file" 2>/dev/null | tail -1 | cut -d: -f1)"
  fi

  if [ -n "$_wb_start_line" ] && [ -n "$_wb_end_line" ] && [ "$_wb_start_line" -lt "$_wb_end_line" ] 2>/dev/null; then
    _wb_tmp="${_wb_file}.roadmap-tmp.$$"
    {
      sed -n "1,${_wb_start_line}p" "$_wb_file"
      printf '%s\n' "$_wb_new"
      sed -n "${_wb_end_line},\$p" "$_wb_file"
    } >"$_wb_tmp" && mv "$_wb_tmp" "$_wb_file"
    return 0
  fi

  echo "[bkit-roadmap] repairing missing/mangled marker pair ($_wb_start) — appending, existing content preserved" >&2
  _wb_tmp="${_wb_file}.roadmap-tmp.$$"
  {
    [ -f "$_wb_file" ] && cat "$_wb_file"
    printf '\n%s\n%s\n%s\n' "$_wb_start" "$_wb_new" "$_wb_end"
  } >"$_wb_tmp" && mv "$_wb_tmp" "$_wb_file"
}

# bkit_roadmap_fold REPO_ROOT [TRACKER_ROWS_FILE] — full regenerate of
# docs/roadmap.md's `roadmap-status` marker block from docs/roadmap.jsonl,
# additively enriched by TRACKER_ROWS_FILE when supplied (a JSON array written
# by the calling workflow's wired-tracker `list_issues` read; absent/empty/
# unparsable file is a no-op — this is what makes enrichment "skipped no-op
# under tracker: none", since a `none` install strips the MCP-call marker
# block that would have written the file at all, matrix row 20). Bootstraps a
# brand new file (banner + both empty marker blocks + `## Backlog / Ideas`)
# when absent; self-heals a missing/mangled `roadmap-status` pair in place.
# Fail-open throughout — never returns non-zero, never blanks an unrelated
# byte, never gates the caller.
bkit_roadmap_fold() {
  _rf_root="${1:-.}"
  _rf_tracker_file="${2:-}"
  _rf_md="${_rf_root}/docs/roadmap.md"
  _rf_jsonl="${_rf_root}/docs/roadmap.jsonl"

  if ! command -v jq >/dev/null 2>&1; then
    echo "[bkit-roadmap] jq not found — skipping roadmap fold" >&2
    return 0
  fi

  _rf_plans_nonempty=0
  if [ -d "${_rf_root}/docs/plans" ]; then
    if [ -n "$(find "${_rf_root}/docs/plans" -maxdepth 2 -name '*.md' -print -quit 2>/dev/null)" ]; then
      _rf_plans_nonempty=1
    fi
  fi

  _rf_tracker_json='[]'
  if [ -n "$_rf_tracker_file" ] && [ -f "$_rf_tracker_file" ] && [ -s "$_rf_tracker_file" ]; then
    _rf_tracker_parsed="$(jq -c '[.[] | select(.key and .status)]' "$_rf_tracker_file" 2>/dev/null)"
    if [ -n "$_rf_tracker_parsed" ]; then
      _rf_tracker_json="$_rf_tracker_parsed"
    else
      echo "[bkit-roadmap] tracker rows file failed to parse — enrichment skipped (fail-open)" >&2
    fi
  else
    echo "[bkit-roadmap] no tracker rows supplied — enrichment skipped (tracker: none, or a wired read returned nothing)" >&2
  fi

  if [ ! -f "$_rf_jsonl" ] || [ ! -s "$_rf_jsonl" ]; then
    echo "[bkit-roadmap] docs/roadmap.jsonl absent or empty — board built from tracker rows only, if any (never blocked)" >&2
    if [ "$_rf_plans_nonempty" = "1" ]; then
      echo "[bkit-roadmap] docs/plans/** has in-flight artifacts but the ledger is empty — run 'bkit telemetry migrate' to bootstrap-seed it" >&2
    fi
    _rf_proj="$(printf '' | jq -c -s --argjson tracker "$_rf_tracker_json" "$BKIT_ROADMAP_FOLD" 2>/dev/null)"
  else
    _rf_proj="$(jq -c -s --argjson tracker "$_rf_tracker_json" "$BKIT_ROADMAP_FOLD" "$_rf_jsonl" 2>/dev/null)"
  fi
  if [ -z "$_rf_proj" ]; then
    echo "[bkit-roadmap] docs/roadmap.jsonl failed to parse — board will be empty (never blocked)" >&2
    _rf_proj='{"designed":[],"planned":[],"built":[],"debugged":[],"shipped":[]}'
  fi

  _rf_designed="$(printf '%s' "$_rf_proj" | jq -c '.designed')"
  _rf_planned="$(printf '%s' "$_rf_proj" | jq -c '.planned')"
  _rf_built="$(printf '%s' "$_rf_proj" | jq -c '.built')"
  _rf_debugged="$(printf '%s' "$_rf_proj" | jq -c '.debugged')"
  _rf_shipped="$(printf '%s' "$_rf_proj" | jq -c '.shipped')"

  _rf_content="$(
    printf '### Design\n\n'
    _bkit_roadmap_render_rows "$_rf_designed"
    printf '\n### Plan\n\n'
    _bkit_roadmap_render_rows "$_rf_planned"
    printf '\n### Build\n\n'
    _bkit_roadmap_render_rows "$_rf_built"
    printf '\n### Debug\n\n'
    _bkit_roadmap_render_rows "$_rf_debugged"
    printf '\n### Shipped _(last 10)_\n\n'
    _bkit_roadmap_render_rows "$_rf_shipped"
  )"

  # First bootstrap. Two shapes reach it: no file at all, and a file the
  # consumer hand-authored BEFORE adopting the board — freeform content, no
  # marker pair. The second must never be clobbered (the file is consumer-owned),
  # so its content is carried into the `## Backlog / Ideas` region, the one part
  # of the board bkit never regenerates. Anything already carrying either marker
  # is an adopted board and falls through to the normal block rewrite below.
  _rf_bootstrap=0
  _rf_preexisting=""
  if [ ! -f "$_rf_md" ]; then
    _rf_bootstrap=1
  elif ! grep -qF "$BKIT_ROADMAP_STATUS_START" "$_rf_md" 2>/dev/null &&
    ! grep -qF "$BKIT_ROADMAP_ANALYSIS_START" "$_rf_md" 2>/dev/null; then
    _rf_bootstrap=1
    _rf_preexisting="$(cat "$_rf_md")"
  fi

  if [ "$_rf_bootstrap" = 1 ]; then
    echo "[bkit-roadmap] bootstrapping docs/roadmap.md" >&2
    [ -n "$_rf_preexisting" ] &&
      echo "[bkit-roadmap] pre-existing docs/roadmap.md had no marker pair — its content is preserved under '## Backlog / Ideas'" >&2
    mkdir -p "$(dirname "$_rf_md")"
    {
      printf '# Roadmap\n\n'
      printf '> Generated — do NOT hand-edit inside the marker blocks below; append to `docs/roadmap.jsonl` instead (an `ABANDONED` row hides a FID from every section). Edit anything OUTSIDE the marker blocks freely — it is never touched.\n\n'
      printf '%s\n' "$BKIT_ROADMAP_STATUS_START"
      printf '%s\n' "$_rf_content"
      printf '%s\n\n' "$BKIT_ROADMAP_STATUS_END"
      printf '%s\n\n' "$BKIT_ROADMAP_ANALYSIS_START"
      printf '_(no analysis yet — run /bkit-roadmap or ship to populate)_\n\n'
      printf '%s\n\n' "$BKIT_ROADMAP_ANALYSIS_END"
      printf '## Backlog / Ideas\n\n'
      printf '_(consumer-owned — never regenerated; add free-form ideas below)_\n'
      [ -n "$_rf_preexisting" ] && printf '\n%s\n' "$_rf_preexisting"
    } >"$_rf_md"
    return 0
  fi

  _bkit_roadmap_write_block "$_rf_md" "$BKIT_ROADMAP_STATUS_START" "$BKIT_ROADMAP_STATUS_END" "$_rf_content"
}
