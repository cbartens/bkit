<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# Vercel — runtime logs

Fits: apps deployed on Vercel. `context=runtime`: error and fatal lines from serverless and edge functions in a time window (default last 4 h, preview environment), PII-safe projection with `traceId` to stitch to the `sentry` block.

- Secret: `VERCEL_TOKEN` (local env; cloud dashboard). No `vercel login` — headless agents cannot run it.
- Non-secret: `VERCEL_SCOPE` (team slug) — uncomment the line in the block so cloud agents inherit it. `VERCEL_ENV` (`preview` default, `production`), `SINCE` / `UNTIL` (ISO-8601 or relative), `VERCEL_MAX_PAGES` (pages of 50 lines, default 20).
- CLI: `vercel`; the provision block installs it in cloud.
- Each call returns at most 50 lines, the newest inside the window, whatever `--limit` says; the block pages backwards with `--until` up to `VERCEL_MAX_PAGES`. `--no-branch` is required: without it CLI 50.x reads only the checked-out git branch. `--level error` also returns `info` lines, so jq filters `.level`. For counts over a wide window, the Vercel MCP `get_runtime_logs` with `group_by` beats lines.

Copy the blocks below into `.agents/context.md`, below `<!-- bkit:end -->`.

<!-- context-fetch:start vercel context=runtime -->

```bash
# Vercel errors (read-only). Headless: set VERCEL_TOKEN + VERCEL_SCOPE (team slug);
# no `vercel login`. Targets the PREVIEW env by default (--environment below) —
# set VERCEL_ENV=production to fetch production logs instead.
# VERCEL_SCOPE is non-secret — uncomment + set the line below so local AND cloud
# agents inherit it (headless cloud agents never read .bkit/.env):
# VERCEL_SCOPE="your-team-slug"
# --no-branch: CLI 50.x otherwise filters to the checked-out git branch; any other branch reads 0
# lines. Each call returns at most 50 lines, the NEWEST in the window, whatever --limit says → loop
# pages backwards with --until until a page comes back short. --level error lets `info` through →
# jq keeps error / fatal only. SINCE / UNTIL: ISO-8601 (2026-01-31T22:50:00Z) or relative (4h).
# Failed first call → `skipped`; failed later page or page cap → TRUNCATED line naming the unread part.
# Customise: VERCEL_ENV; SINCE / UNTIL; VERCEL_MAX_PAGES (x 50 lines); --source; path or status filter; jq keys to the log shape. Positive control (suggested): run once over a window holding a known error (e.g. a 5xx seen in the dashboard); nothing back = reader broken, not clean.
command -v vercel >/dev/null && [ -n "${VERCEL_TOKEN:-}" ] && [ -n "${VERCEL_SCOPE:-}" ] \
  || { echo "[context-fetch:vercel] skipped — vercel CLI / VERCEL_TOKEN / VERCEL_SCOPE missing" >&2; exit 0; }
VERCEL_PAGE=50
VERCEL_ALL=$(mktemp); VERCEL_CHUNK=$(mktemp)
trap 'rm -f "$VERCEL_ALL" "$VERCEL_CHUNK"' EXIT
VERCEL_UNTIL="${UNTIL:-}"; VERCEL_PAGES=0; VERCEL_NOTE=""
while [ "$VERCEL_PAGES" -lt "${VERCEL_MAX_PAGES:-20}" ]; do
  VERCEL_PAGES=$((VERCEL_PAGES + 1))
  if ! vercel logs \
      --token "$VERCEL_TOKEN" \
      --scope "$VERCEL_SCOPE" \
      --no-branch \
      --environment "${VERCEL_ENV:-preview}" \
      --level error --level fatal \
      --source serverless --source edge-function \
      --since "${SINCE:-4h}" \
      ${VERCEL_UNTIL:+--until "$VERCEL_UNTIL"} \
      --limit "$VERCEL_PAGE" \
      --json > "$VERCEL_CHUNK" 2>/dev/null; then
    [ "$VERCEL_PAGES" -gt 1 ] \
      || { echo "[context-fetch:vercel] skipped — vercel logs exited non-zero (bad token, scope or project, or host unreachable)" >&2; exit 0; }
    VERCEL_NOTE="page $VERCEL_PAGES failed — lines older than $VERCEL_UNTIL NOT read"; break
  fi
  cat "$VERCEL_CHUNK" >> "$VERCEL_ALL"
  [ "$(grep -c . "$VERCEL_CHUNK")" -ge "$VERCEL_PAGE" ] || break
  # Next page ends 1 s after this page's oldest line (overlap, de-duplicated by id below).
  VERCEL_NEXT=$(jq -rs 'map(.timestamp) | min / 1000 | floor + 1 | todate' "$VERCEL_CHUNK")
  [ "$VERCEL_NEXT" != "$VERCEL_UNTIL" ] \
    || { VERCEL_NOTE="over $VERCEL_PAGE lines inside one second at $VERCEL_NEXT — narrow --source or the window"; break; }
  VERCEL_UNTIL="$VERCEL_NEXT"
  [ "$VERCEL_PAGES" -lt "${VERCEL_MAX_PAGES:-20}" ] \
    || VERCEL_NOTE="stopped at VERCEL_MAX_PAGES=${VERCEL_MAX_PAGES:-20} — lines older than $VERCEL_UNTIL NOT read"
done
VERCEL_LINES=$(jq -c 'select(.level == "error" or .level == "fatal")' "$VERCEL_ALL" | jq -sc 'unique_by(.id) | sort_by(-.timestamp) | .[]')
printf '===== vercel %s error/fatal lines, since %s%s — %s lines, %s page(s) =====\n' \
  "${VERCEL_ENV:-preview}" "${SINCE:-4h}" "${UNTIL:+ until $UNTIL}" "$(printf '%s' "$VERCEL_LINES" | grep -c .)" "$VERCEL_PAGES"
[ -z "$VERCEL_NOTE" ] || { printf '===== TRUNCATED: %s =====\n' "$VERCEL_NOTE"; echo "[context-fetch:vercel] truncated — $VERCEL_NOTE" >&2; }
printf '%s\n' "$VERCEL_LINES" | grep . \
  | jq -c '{time: (.timestamp / 1000 | floor | todate), level, source, requestPath, responseStatusCode, traceId, message}'  # PII-safe projection; traceId stitches to the sentry block, message is free-text — adjust keys to your log shape
```

<!-- context-fetch:end -->

<!-- context-fetch:provision vercel -->

```bash
# Install the vercel CLI in cloud if absent (self-guarded; no-op when present).
command -v vercel >/dev/null 2>&1 || pnpm add -g vercel
```

<!-- context-fetch:end -->

<!-- allowed-domains:start -->

vercel.com

<!-- allowed-domains:end -->

<!-- mcp-servers:start -->

vercel
Vercel

<!-- mcp-servers:end -->
