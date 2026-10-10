<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# Vercel — runtime logs

Fits: apps deployed on Vercel. `context=runtime`: error and fatal lines from serverless and edge functions in a time window (default last 4 h, preview environment), PII-safe projection with `traceId` to stitch to the `sentry` block.

- Secret: `VERCEL_TOKEN` (local env; cloud dashboard). No `vercel login` — headless agents cannot run it.
- Non-secret: `VERCEL_SCOPE` (team slug) — uncomment the line in the block so cloud agents inherit it. `VERCEL_ENV` (`preview` default, `production`), `SINCE` / `UNTIL` (ISO-8601 or relative), `VERCEL_N`.
- CLI: `vercel`; the provision block installs it in cloud.
- `--limit` returns the NEWEST N lines inside the window, so a wide window on a busy deployment reads like a tail: narrow the window or raise `VERCEL_N`. For counts over a wide window, the Vercel MCP `get_runtime_logs` with `group_by` beats lines.

Copy the blocks below into `.agents/context.md`, below `<!-- bkit:end -->`.

<!-- context-fetch:start vercel context=runtime -->

```bash
# Vercel errors (read-only). Headless: set VERCEL_TOKEN + VERCEL_SCOPE (team slug);
# no `vercel login`. Targets the PREVIEW env by default (--environment below) —
# set VERCEL_ENV=production to fetch production logs instead.
# VERCEL_SCOPE is non-secret — uncomment + set the line below so local AND cloud
# agents inherit it (headless cloud agents never read .bkit/.env):
# VERCEL_SCOPE="your-team-slug"
# SINCE / UNTIL take ISO-8601 (2026-01-31T22:50:00Z) or relative (4h). --limit keeps the NEWEST
# N lines inside the window: narrow the window or raise VERCEL_N before widening --level.
# Customise: VERCEL_ENV; SINCE / UNTIL; VERCEL_N; --level / --source; path or status filter; jq keys to the log shape.
command -v vercel >/dev/null && [ -n "${VERCEL_TOKEN:-}" ] && [ -n "${VERCEL_SCOPE:-}" ] \
  || { echo "[context-fetch:vercel] skipped — vercel CLI / VERCEL_TOKEN / VERCEL_SCOPE missing" >&2; exit 0; }
vercel logs \
  --token "$VERCEL_TOKEN" \
  --scope "$VERCEL_SCOPE" \
  --environment "${VERCEL_ENV:-preview}" \
  --level error --level fatal \
  --source serverless --source edge-function \
  --since "${SINCE:-4h}" \
  ${UNTIL:+--until "$UNTIL"} \
  --limit "${VERCEL_N:-100}" \
  --json \
  | jq -c '{timestamp, level, source, requestPath, responseStatusCode, traceId, message}'  # PII-safe projection; traceId stitches to the sentry block, message is free-text — adjust keys to your log shape
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
