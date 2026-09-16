#!/usr/bin/env sh
# bkit-roadmap-fold.sh — deterministic docs/roadmap.md projection.
#
# `bkit_roadmap_fold` writes the generated region of docs/roadmap.md in one
# pass: three consumer `## Notes` blocks carried through verbatim, the
# `roadmap-status` block from docs/roadmap.jsonl, the `tracker` block from
# docs/tracker.jsonl, and the `roadmap-analysis` block carried through
# verbatim. docs/roadmap.jsonl is the SOLE input to the status block; the
# on-disk `docs/plans/**` scan is a one-time bootstrap seed performed by
# `bkit telemetry migrate`, not read here.
#
# Two blocks, two axes, deliberately NOT reconciled:
#   roadmap-status  — what bkit has done, from the ledger. Rewritten by every
#                     phase close AND by /bkit-roadmap.
#   tracker         — what the team says, from docs/tracker.jsonl. Refreshed
#                     ONLY by /bkit-roadmap; a phase close re-renders it from
#                     the same rows and carries its timestamp forward.
# Each block renders its own "refreshed" stamp, because the two move at
# different cadences and a reader must be able to see which half is current.
#
# The status block is a PURE PROJECTION of docs/roadmap.jsonl — tracker rows
# live in their own block — so a close never needs to parse the on-disk board
# to preserve foreign STATUS rows. It re-renders the tables in full. Notes
# and analysis are extracted and re-emitted unchanged.
#
# Region invariant: bkit rewrites the mechanical `roadmap-status` and
# `tracker` tables each run. The three `roadmap-notes-*` blocks and the
# `roadmap-analysis` block are carried through verbatim. `roadmap-notes-post`
# is last. Everything ABOVE the first marker — the title head — is
# preserved verbatim. A missing notes pair is seeded with a placeholder on
# the next fold; existing notes are never overwritten. A legacy
# `## Backlog / Ideas` tail is folded into notes-post and not re-emitted.
#
# Usage (sourced by a workflow orchestrator, which knows REPO_ROOT):
#   . "$REPO_ROOT/.bkit/scripts/bkit-roadmap-fold.sh" || { echo "[bkit-roadmap] missing bkit-roadmap-fold.sh — run 'bkit install'" >&2; }
#   bkit_roadmap_fold "$REPO_ROOT"
#
# Fail-open: every branch (jq absent, ledger absent/empty/malformed) logs one
# `[bkit-roadmap]` stderr line and returns 0 — this script NEVER exits non-zero
# and NEVER gates the caller's workflow close.

BKIT_ROADMAP_NOTES_PRE_START='<!-- bkit:roadmap-notes-pre start -->'
BKIT_ROADMAP_NOTES_PRE_END='<!-- bkit:roadmap-notes-pre end -->'
BKIT_ROADMAP_STATUS_START='<!-- bkit:roadmap-status start -->'
BKIT_ROADMAP_STATUS_END='<!-- bkit:roadmap-status end -->'
BKIT_ROADMAP_NOTES_MID_START='<!-- bkit:roadmap-notes-mid start -->'
BKIT_ROADMAP_NOTES_MID_END='<!-- bkit:roadmap-notes-mid end -->'
BKIT_ROADMAP_TRACKER_START='<!-- bkit:tracker start -->'
BKIT_ROADMAP_TRACKER_END='<!-- bkit:tracker end -->'
BKIT_ROADMAP_NOTES_POST_START='<!-- bkit:roadmap-notes-post start -->'
BKIT_ROADMAP_NOTES_POST_END='<!-- bkit:roadmap-notes-post end -->'
BKIT_ROADMAP_ANALYSIS_START='<!-- bkit:roadmap-analysis start -->'
BKIT_ROADMAP_ANALYSIS_END='<!-- bkit:roadmap-analysis end -->'

BKIT_ROADMAP_ANALYSIS_PLACEHOLDER='_(no analysis yet — run /bkit-roadmap to populate)_'
BKIT_ROADMAP_NOTES_PRE_PLACEHOLDER='## Notes

_(above the bkit list — yours, never overwritten)_'
BKIT_ROADMAP_NOTES_MID_PLACEHOLDER='## Notes

_(between bkit and tracker — yours, never overwritten)_'
BKIT_ROADMAP_NOTES_POST_PLACEHOLDER='## Notes

_(below the tracker list — yours, never overwritten)_'

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
# (hidden from the whole board). SHIPPED capped at the newest 10 by
# `shippedAt // ts` desc; older SHIPPED rows stay in the ledger and simply fall
# off the board.
#
# Ranking on `shippedAt` with a `ts` fallback is what keeps a BACKFILL honest.
# `ts` is append time and `.bkit/jsonl.md` § Write Idiom forbids a literal, so
# rows written today for work that shipped months ago would otherwise sort as
# the newest ships and evict the real ones. `shippedAt` is not part of the row
# identity, so it MAY hold a historic value (an issue's `closed_at`, a migrated
# `docs/completed.md` entry's date). A live phase close omits it — there `ts`
# already IS the ship time, and the fallback covers every pre-existing row.
#
# No tracker input: tracker issues render in their own block from
# docs/tracker.jsonl, so this projection takes no `$tracker` argument, performs
# no additive merge, and has no key-namespace normalisation to do.
# shellcheck disable=SC2016
BKIT_ROADMAP_FOLD='def latest_by_key: group_by(.key) | map(sort_by(.ts) | last); latest_by_key as $rows | { designed: ($rows | map(select(.status=="DESIGNED"))), planned: ($rows | map(select(.status=="PLANNED"))), built: ($rows | map(select(.status=="BUILT"))), debugged: ($rows | map(select(.status=="DEBUGGED"))), shipped: ($rows | map(select(.status=="SHIPPED")) | sort_by(-(.shippedAt // .ts)) | .[0:10]) }'

# Render one phase-section's rows (a jq-encoded JSON array, on stdin via $1)
# as a markdown table, or an italic placeholder when empty.
#
# Columns are `FID | Title | Last-transition (ts)`. Milestone and Blocked-by
# were dropped: neither is carried on a docs/roadmap.jsonl feature row (see
# `.bkit/jsonl.md`), and the only thing that ever populated them was tracker
# enrichment, which now renders in its own block. They emitted an em dash on
# every row of every board.
_bkit_roadmap_render_rows() {
  _rows_json="$1"
  _count="$(printf '%s' "$_rows_json" | jq 'length' 2>/dev/null)"
  if [ -z "$_count" ] || [ "$_count" = "0" ]; then
    printf '%s\n' "_(none)_"
    return 0
  fi
  printf '%s\n' "| FID | Title | Last-transition (ts) |"
  printf '%s\n' "| --- | --- | --- |"
  printf '%s' "$_rows_json" | jq -r '.[] | "| \(.key) | \(.summary // .key) | \(.shippedAt // .ts) |"'
}

# Render the tracker block body from docs/tracker.jsonl. Returns non-zero when
# there is nothing to render, so the caller omits the block entirely — that is
# what "skipped no-op under tracker: none" means, since a `none` install never
# writes the file.
#
# Sections are the tracker's OWN state values, discovered from the rows present
# — never a fixed list, because both GitHub project columns and Linear workflow
# states are user-defined. Section ORDER is first-appearance order in the file,
# so the sync controls it by writing rows in the tracker's own column order.
# Rows with no state land under `### Other` (an issue not on the project board,
# or on it with Status unset) — without that catch-all they would vanish, which
# would defeat the point of listing every open issue.
_bkit_roadmap_render_tracker() {
  _rt_file="$1"
  [ -n "$_rt_file" ] && [ -f "$_rt_file" ] && [ -s "$_rt_file" ] || return 1

  _rt_rows="$(jq -c -s '[.[] | select(.kind=="tracker" and .key)]' "$_rt_file" 2>/dev/null)"
  if [ -z "$_rt_rows" ] || [ "$_rt_rows" = "[]" ]; then
    echo "[bkit-roadmap] docs/tracker.jsonl empty or unparsable — tracker block omitted (fail-open)" >&2
    return 1
  fi

  # Ordered, de-duplicated state list, "Other" forced last.
  _rt_states="$(printf '%s' "$_rt_rows" | jq -r '
    [.[] | (.status // "") | if . == "" then "Other" else . end]
    | reduce .[] as $s ([]; if (index($s) | type) == "number" then . else . + [$s] end)
    | (map(select(. != "Other")) + (if (map(select(. == "Other")) | length) > 0 then ["Other"] else [] end))
    | .[]' 2>/dev/null)"
  [ -n "$_rt_states" ] || return 1

  printf '%s\n' "$_rt_states" | while IFS= read -r _rt_state; do
    [ -n "$_rt_state" ] || continue
    _rt_sec="$(printf '%s' "$_rt_rows" | jq -c --arg s "$_rt_state" '[.[] | select((((.status // "") | if . == "" then "Other" else . end)) == $s)]' 2>/dev/null)"
    printf '### %s\n\n' "$_rt_state"
    if [ -z "$_rt_sec" ] || [ "$_rt_sec" = "[]" ]; then
      printf '%s\n\n' "_(none)_"
      continue
    fi
    printf '%s\n' "| Issue | Title | Labels | Priority | Updated |"
    printf '%s\n' "| --- | --- | --- | --- | --- |"
    printf '%s' "$_rt_sec" | jq -r '.[] | "| \(.key) | \(.title // .key) | \((.labels // []) | join(", ")) | \(.priority // "—") | \(.updatedAt // "—") |"'
    printf '\n'
  done
}

# Strip leading and trailing blank lines from stdin. Command substitution eats
# trailing newlines but not leading ones, so a region read back off disk would
# otherwise gain a blank line on every regenerate and never converge.
_bkit_roadmap_trim_blanks() {
  awk 'BEGIN{s=0} { if (!s && $0 ~ /^[[:space:]]*$/) next; s=1; buf[n++]=$0 }
       END { last=-1; for (i=0;i<n;i++) if (buf[i] !~ /^[[:space:]]*$/) last=i;
             for (i=0;i<=last;i++) print buf[i] }'
}

# Print the earliest (`first`) or latest (`last`) 1-based line of any of the
# remaining marker arguments in file `$1`. Empty when none are present.
_bkit_roadmap_marker_line() {
  _ml_file="$1"
  _ml_mode="$2"
  shift 2
  _ml_best=""
  for _ml_m in "$@"; do
    if [ "$_ml_mode" = "last" ]; then
      _ml_n="$(grep -nF "$_ml_m" "$_ml_file" 2>/dev/null | tail -1 | cut -d: -f1)"
    else
      _ml_n="$(grep -nF "$_ml_m" "$_ml_file" 2>/dev/null | head -1 | cut -d: -f1)"
    fi
    [ -n "$_ml_n" ] || continue
    if [ -z "$_ml_best" ]; then
      _ml_best="$_ml_n"
    elif [ "$_ml_mode" = "last" ]; then
      [ "$_ml_n" -gt "$_ml_best" ] 2>/dev/null && _ml_best="$_ml_n"
    else
      [ "$_ml_n" -lt "$_ml_best" ] 2>/dev/null && _ml_best="$_ml_n"
    fi
  done
  printf '%s' "$_ml_best"
}

# Drop a legacy `## Backlog / Ideas` heading and its default italic from stdin.
# Remaining consumer lines are printed; the default seed alone yields nothing.
_bkit_roadmap_strip_legacy_backlog() {
  awk '
    $0 == "## Backlog / Ideas" { next }
    $0 == "_(consumer-owned — never regenerated; add free-form ideas below)_" { next }
    { print }
  ' | _bkit_roadmap_trim_blanks
}

# Append `$2` under `$1` when `$2` is non-blank. Never drops `$1`.
_bkit_roadmap_append_notes() {
  _an_base="$1"
  _an_extra="$2"
  if [ -z "$(printf '%s' "$_an_extra" | tr -d '[:space:]')" ]; then
    printf '%s' "$_an_base"
    return 0
  fi
  if [ -z "$(printf '%s' "$_an_base" | tr -d '[:space:]')" ]; then
    printf '%s' "$_an_extra"
    return 0
  fi
  printf '%s\n\n%s' "$_an_base" "$_an_extra"
}

# Bytes strictly between `$2`/`$3` in `$1`, or `$4` when the pair is absent or
# the body is whitespace-only. Never overwrites a non-empty body.
_bkit_roadmap_carried_or_placeholder() {
  _cp_file="$1"
  _cp_start="$2"
  _cp_end="$3"
  _cp_ph="$4"
  _cp_body="$(_bkit_roadmap_extract_block "$_cp_file" "$_cp_start" "$_cp_end" 2>/dev/null)"
  if [ -z "$(printf '%s' "$_cp_body" | tr -d '[:space:]')" ]; then
    printf '%s' "$_cp_ph"
  else
    printf '%s' "$_cp_body"
  fi
}

# Extract the bytes strictly between `$2` and `$3` in file `$1`. Non-zero when
# the file or either marker is absent, or when they sit out of order.
_bkit_roadmap_extract_block() {
  _eb_file="$1"
  _eb_start="$2"
  _eb_end="$3"
  [ -f "$_eb_file" ] || return 1
  _eb_s="$(grep -nF "$_eb_start" "$_eb_file" 2>/dev/null | head -1 | cut -d: -f1)"
  _eb_e="$(grep -nF "$_eb_end" "$_eb_file" 2>/dev/null | tail -1 | cut -d: -f1)"
  [ -n "$_eb_s" ] && [ -n "$_eb_e" ] || return 1
  [ "$_eb_s" -lt "$_eb_e" ] 2>/dev/null || return 1
  [ "$((_eb_e - _eb_s))" -gt 1 ] || return 0
  sed -n "$((_eb_s + 1)),$((_eb_e - 1))p" "$_eb_file"
}

# bkit_roadmap_fold REPO_ROOT — rewrite the whole generated region of
# docs/roadmap.md. Bootstraps a brand new file, adopts a consumer's
# hand-authored one (its content is carried into notes-post, never
# clobbered), introduces a newly-added marker block on an existing board with
# no upgrade migration, and self-heals a mangled pair — all through this one
# path. Fail-open throughout: never returns non-zero, never gates the caller.
#
# Set BKIT_ROADMAP_TRACKER_REFRESHED=1 when docs/tracker.jsonl was just synced
# (i.e. from /bkit-roadmap) so the tracker block takes a fresh stamp. A phase
# close leaves it unset and the previous stamp carries forward, because a close
# re-renders the tracker block without re-fetching it.
bkit_roadmap_fold() {
  _rf_root="${1:-.}"
  _rf_md="${_rf_root}/docs/roadmap.md"
  _rf_jsonl="${_rf_root}/docs/roadmap.jsonl"
  _rf_tracker="${_rf_root}/docs/tracker.jsonl"

  if ! command -v jq >/dev/null 2>&1; then
    echo "[bkit-roadmap] jq not found — skipping roadmap fold" >&2
    return 0
  fi

  _rf_now="$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null)"
  [ -n "$_rf_now" ] || _rf_now="unknown"

  _rf_plans_nonempty=0
  if [ -d "${_rf_root}/docs/plans" ]; then
    if [ -n "$(find "${_rf_root}/docs/plans" -maxdepth 2 -name '*.md' -print -quit 2>/dev/null)" ]; then
      _rf_plans_nonempty=1
    fi
  fi

  # --- status block: from the ledger, and only the ledger -------------------
  if [ ! -f "$_rf_jsonl" ] || [ ! -s "$_rf_jsonl" ]; then
    echo "[bkit-roadmap] docs/roadmap.jsonl absent or empty — status board will be empty (never blocked)" >&2
    if [ "$_rf_plans_nonempty" = "1" ]; then
      echo "[bkit-roadmap] docs/plans/** has in-flight artifacts but the ledger is empty — run 'bkit telemetry migrate' to bootstrap-seed it" >&2
    fi
    _rf_proj='{"designed":[],"planned":[],"built":[],"debugged":[],"shipped":[]}'
  else
    _rf_proj="$(jq -c -s "$BKIT_ROADMAP_FOLD" "$_rf_jsonl" 2>/dev/null)"
  fi
  if [ -z "$_rf_proj" ]; then
    echo "[bkit-roadmap] docs/roadmap.jsonl failed to parse — status board will be empty (never blocked)" >&2
    _rf_proj='{"designed":[],"planned":[],"built":[],"debugged":[],"shipped":[]}'
  fi

  _rf_status_content="$(
    printf '> Generated tables — do NOT hand-edit the `bkit` or `Tracker` tables; append to `docs/roadmap.jsonl` instead (an `ABANDONED` row hides a FID from every section). `## Notes` blocks are yours and are never overwritten. Everything above the first marker is also yours. notes-post is last.\n\n'
    printf '## bkit\n\n'
    printf '_(refreshed %s)_\n\n' "$_rf_now"
    printf '### Design\n\n'
    _bkit_roadmap_render_rows "$(printf '%s' "$_rf_proj" | jq -c '.designed')"
    printf '\n### Plan\n\n'
    _bkit_roadmap_render_rows "$(printf '%s' "$_rf_proj" | jq -c '.planned')"
    printf '\n### Build\n\n'
    _bkit_roadmap_render_rows "$(printf '%s' "$_rf_proj" | jq -c '.built')"
    printf '\n### Debug\n\n'
    _bkit_roadmap_render_rows "$(printf '%s' "$_rf_proj" | jq -c '.debugged')"
    printf '\n### Shipped _(last 10)_\n\n'
    _bkit_roadmap_render_rows "$(printf '%s' "$_rf_proj" | jq -c '.shipped')"
  )"

  # --- tracker block: from docs/tracker.jsonl, stamp carried on a close -----
  _rf_tracker_content=""
  if _rf_tracker_body="$(_bkit_roadmap_render_tracker "$_rf_tracker")"; then
    _rf_tracker_stamp=""
    if [ "${BKIT_ROADMAP_TRACKER_REFRESHED:-0}" != "1" ]; then
      _rf_tracker_stamp="$(_bkit_roadmap_extract_block "$_rf_md" "$BKIT_ROADMAP_TRACKER_START" "$BKIT_ROADMAP_TRACKER_END" 2>/dev/null | grep -o '_(refreshed [^)]*)_' | head -1)"
    fi
    [ -n "$_rf_tracker_stamp" ] || _rf_tracker_stamp="_(refreshed $_rf_now)_"
    _rf_tracker_content="$(
      printf '## Tracker\n\n'
      printf '%s\n\n' "$_rf_tracker_stamp"
      printf '%s' "$_rf_tracker_body"
    )"
  fi

  # --- notes + analysis: carried through verbatim ---------------------------
  # Notes are consumer-owned. Analysis is written by the analysis leaf, NOT
  # here. A phase close runs this fold and does NOT run the leaf, so
  # regenerating this block would blank the analysis on every close and never
  # refill it. Missing notes pairs seed a placeholder; a non-empty body is
  # never overwritten.
  _rf_notes_pre="$(_bkit_roadmap_carried_or_placeholder "$_rf_md" "$BKIT_ROADMAP_NOTES_PRE_START" "$BKIT_ROADMAP_NOTES_PRE_END" "$BKIT_ROADMAP_NOTES_PRE_PLACEHOLDER")"
  _rf_notes_mid="$(_bkit_roadmap_carried_or_placeholder "$_rf_md" "$BKIT_ROADMAP_NOTES_MID_START" "$BKIT_ROADMAP_NOTES_MID_END" "$BKIT_ROADMAP_NOTES_MID_PLACEHOLDER")"
  _rf_notes_post="$(_bkit_roadmap_carried_or_placeholder "$_rf_md" "$BKIT_ROADMAP_NOTES_POST_START" "$BKIT_ROADMAP_NOTES_POST_END" "$BKIT_ROADMAP_NOTES_POST_PLACEHOLDER")"
  _rf_analysis_content="$(_bkit_roadmap_extract_block "$_rf_md" "$BKIT_ROADMAP_ANALYSIS_START" "$BKIT_ROADMAP_ANALYSIS_END" 2>/dev/null)"
  if [ -z "$(printf '%s' "$_rf_analysis_content" | tr -d '[:space:]')" ]; then
    _rf_analysis_content="$BKIT_ROADMAP_ANALYSIS_PLACEHOLDER"
  fi

  # --- consumer head and leftover tail: outside the first / last marker -----
  # Head is preserved verbatim. Leftover after the last marker (legacy Backlog
  # or free-form scratch) is folded into notes-post so that block stays last.
  _rf_head=""
  _rf_tail=""
  _rf_adopted=""
  if [ -f "$_rf_md" ]; then
    _rf_first_start="$(_bkit_roadmap_marker_line "$_rf_md" first \
      "$BKIT_ROADMAP_NOTES_PRE_START" \
      "$BKIT_ROADMAP_STATUS_START" \
      "$BKIT_ROADMAP_NOTES_MID_START" \
      "$BKIT_ROADMAP_TRACKER_START" \
      "$BKIT_ROADMAP_NOTES_POST_START" \
      "$BKIT_ROADMAP_ANALYSIS_START")"

    _rf_last_end="$(_bkit_roadmap_marker_line "$_rf_md" last \
      "$BKIT_ROADMAP_NOTES_PRE_END" \
      "$BKIT_ROADMAP_STATUS_END" \
      "$BKIT_ROADMAP_NOTES_MID_END" \
      "$BKIT_ROADMAP_TRACKER_END" \
      "$BKIT_ROADMAP_NOTES_POST_END" \
      "$BKIT_ROADMAP_ANALYSIS_END")"

    if [ -n "$_rf_first_start" ] && [ "$_rf_first_start" -gt 1 ] 2>/dev/null; then
      _rf_head="$(sed -n "1,$((_rf_first_start - 1))p" "$_rf_md" | _bkit_roadmap_trim_blanks)"
    fi
    if [ -n "$_rf_last_end" ]; then
      _rf_tail="$(sed -n "$((_rf_last_end + 1)),\$p" "$_rf_md" | _bkit_roadmap_trim_blanks)"
    elif [ -n "$_rf_first_start" ]; then
      # Start marker present, end marker missing or out of order. We cannot
      # tell where bkit's region stops, so everything after the orphaned start
      # is treated as consumer content and carried into the region bkit never
      # regenerates. A self-heal NEVER removes a byte.
      _rf_adopted="$(sed -n "$((_rf_first_start + 1)),\$p" "$_rf_md" | _bkit_roadmap_trim_blanks)"
      echo "[bkit-roadmap] repairing mangled marker pair — content below the orphaned start marker preserved under notes-post" >&2
    fi
    if [ -z "$_rf_first_start" ] && [ -z "$_rf_last_end" ]; then
      # No marker anywhere: a consumer board that predates adoption. Its
      # content moves into the region bkit never regenerates, never lost.
      _rf_adopted="$(cat "$_rf_md")"
      echo "[bkit-roadmap] pre-existing docs/roadmap.md had no marker pair — its content is preserved under notes-post" >&2
    fi
  else
    echo "[bkit-roadmap] bootstrapping docs/roadmap.md" >&2
  fi

  # The head is consumer territory once the file exists, so bkit seeds a title
  # here and never rewrites it. The "generated" warning does NOT live here — it
  # renders inside the status block so its wording stays accurate as the
  # region's rules change; a warning stranded in a never-rewritten head would
  # go on describing whatever was true the day the file was created.
  if [ -z "$(printf '%s' "$_rf_head" | tr -d '[:space:]')" ]; then
    _rf_head="$(printf '# Roadmap')"
  fi

  # notes-post is last. Adopt a pre-bkit board and any leftover after the last
  # marker into it. Strip the default Backlog seed so it is not re-emitted.
  _rf_merge=""
  if [ -n "$_rf_adopted" ]; then
    _rf_merge="$_rf_adopted"
  fi
  if [ -n "$(printf '%s' "$_rf_tail" | tr -d '[:space:]')" ]; then
    _rf_stripped="$(printf '%s\n' "$_rf_tail" | _bkit_roadmap_strip_legacy_backlog)"
    if [ -n "$(printf '%s' "$_rf_stripped" | tr -d '[:space:]')" ]; then
      _rf_merge="$(_bkit_roadmap_append_notes "$_rf_merge" "$_rf_stripped")"
    fi
  fi
  if [ -n "$(printf '%s' "$_rf_merge" | tr -d '[:space:]')" ]; then
    _rf_notes_post="$(_bkit_roadmap_append_notes "$_rf_notes_post" "$_rf_merge")"
  fi

  # --- write the region -----------------------------------------------------
  mkdir -p "$(dirname "$_rf_md")" 2>/dev/null
  _rf_tmp="${_rf_md}.roadmap-tmp.$$"
  {
    printf '%s\n\n' "$_rf_head"
    printf '%s\n' "$BKIT_ROADMAP_NOTES_PRE_START"
    printf '%s\n' "$_rf_notes_pre"
    printf '%s\n\n' "$BKIT_ROADMAP_NOTES_PRE_END"
    printf '%s\n' "$BKIT_ROADMAP_STATUS_START"
    printf '%s\n' "$_rf_status_content"
    printf '%s\n\n' "$BKIT_ROADMAP_STATUS_END"
    printf '%s\n' "$BKIT_ROADMAP_NOTES_MID_START"
    printf '%s\n' "$_rf_notes_mid"
    printf '%s\n\n' "$BKIT_ROADMAP_NOTES_MID_END"
    if [ -n "$_rf_tracker_content" ]; then
      printf '%s\n' "$BKIT_ROADMAP_TRACKER_START"
      printf '%s\n' "$_rf_tracker_content"
      printf '%s\n\n' "$BKIT_ROADMAP_TRACKER_END"
    fi
    printf '%s\n' "$BKIT_ROADMAP_ANALYSIS_START"
    printf '%s\n' "$_rf_analysis_content"
    printf '%s\n\n' "$BKIT_ROADMAP_ANALYSIS_END"
    printf '%s\n' "$BKIT_ROADMAP_NOTES_POST_START"
    printf '%s\n' "$_rf_notes_post"
    printf '%s\n' "$BKIT_ROADMAP_NOTES_POST_END"
  } >"$_rf_tmp" 2>/dev/null && mv "$_rf_tmp" "$_rf_md" 2>/dev/null || {
    rm -f "$_rf_tmp" 2>/dev/null
    echo "[bkit-roadmap] could not write $_rf_md — board left as-is (fail-open)" >&2
  }
  return 0
}
