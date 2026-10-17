<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# Sentry — unresolved issues

Fits: apps reporting errors to Sentry (web, server or native). `context=runtime`: one project's unresolved issues seen in a window (default last 24 h; optional environment), newest first (id, title, culprit, count, first / last seen, permalink). Commented recipes in the block pull one issue's `trace_id` (to stitch to the `vercel` block's `traceId`) and every event of one issue with timestamps (to count events inside a run's time window).

- Secret: `SENTRY_AUTH_TOKEN` (an internal-integration or user token with `project:read`, `event:read`).
- Non-secret: `SENTRY_ORG`, `SENTRY_PROJECT` (slugs) and `SENTRY_HOST` — uncomment the lines in the block so cloud agents inherit them. An EU-region org uses `de.sentry.io`: the global host 404s on its issue ids. Optional: `SENTRY_SINCE` (window, default `24h`), `SENTRY_ENV`, `SENTRY_N`.
- CLI: none (`curl` + `jq`), no provision block.
- An empty list is not "no errors": a spent quota drops events silently. Check the org's quota usage before reading silence as clean.

Copy the blocks below into `.agents/context.md`, below `<!-- bkit:end -->`.

<!-- context-fetch:start sentry context=runtime -->

```bash
# Sentry organization issues API — unresolved issues of one project seen in the window (default
# 24h), sorted by last seen (read-only). statsPeriod is the query window on this endpoint.
# Headless: SENTRY_AUTH_TOKEN (secret, from env). SENTRY_ORG / SENTRY_PROJECT / SENTRY_HOST are
# non-secret — uncomment + set the lines below so local AND cloud agents inherit them:
# SENTRY_ORG="your-org-slug"
# SENTRY_PROJECT="your-project-slug"
# SENTRY_HOST="de.sentry.io"   # EU-region org; the global host 404s on its issue ids
# An empty array is NOT "no errors": a spent quota drops events silently — check the org's
# quota usage (or /api/0/organizations/{org}/stats_v2/) before concluding silence = clean.
# Any non-200 answer, or a body that is not an array, prints a `skipped` line, never `[]`.
# Monitor / detector configs (`organizations/<org>/detectors/`) carry the request headers an
# uptime check sends, secrets included: strip them with jq `del(.[].dataSources[]?.queryObj.headers)`
# before printing.
# Customise: SENTRY_SINCE window (1h / 24h / 7d); SENTRY_ENV (environment name, e.g. production; unset = all); SENTRY_N (<= 100); jq keys. Positive control (suggested): before reading empty output as no errors, run once over a window holding an issue the Sentry UI shows unresolved and seen in it; nothing back = reader broken, not clean.
SENTRY_HOST="${SENTRY_HOST:-sentry.io}"
[ -n "${SENTRY_AUTH_TOKEN:-}" ] && [ -n "${SENTRY_ORG:-}" ] && [ -n "${SENTRY_PROJECT:-}" ] \
  || { echo "[context-fetch:sentry] skipped — SENTRY_AUTH_TOKEN / SENTRY_ORG / SENTRY_PROJECT unset" >&2; exit 0; }
SENTRY_RESP=$(mktemp)
trap 'rm -f "$SENTRY_RESP"' EXIT
SENTRY_CODE=$(curl -s -o "$SENTRY_RESP" -w '%{http_code}' \
  -H "Authorization: Bearer ${SENTRY_AUTH_TOKEN}" \
  "https://${SENTRY_HOST}/api/0/organizations/${SENTRY_ORG}/issues/?project=${SENTRY_PROJECT}&query=is%3Aunresolved&statsPeriod=${SENTRY_SINCE:-24h}&sort=date&limit=${SENTRY_N:-25}&collapse=stats${SENTRY_ENV:+&environment=${SENTRY_ENV}}")
[ "$SENTRY_CODE" = "200" ] && jq -e 'type == "array"' "$SENTRY_RESP" >/dev/null 2>&1 \
  || { echo "[context-fetch:sentry] skipped — ${SENTRY_HOST} HTTP ${SENTRY_CODE:-000} (000 = unreachable, 401/403 = bad token or scope, 404 = wrong org / project / region host)" >&2; exit 0; }
jq '[.[] | {id, title, culprit, count: .count, firstSeen, lastSeen, permalink}]' "$SENTRY_RESP"

# Trace correlation — one issue's latest event → its trace_id. The same id appears in the
# vercel block's `traceId` (the sentry-trace propagation header), linking the browser stack to
# the server handler.
#   ISSUE_ID="<issue-id-from-the-list-above>"
#   curl -s -H "Authorization: Bearer ${SENTRY_AUTH_TOKEN}" \
#     "https://${SENTRY_HOST}/api/0/issues/${ISSUE_ID}/events/latest/" \
#     | jq '{id, eventId: .eventID, trace_id: .contexts.trace.trace_id, title, culprit}'
#
# Window correlation — every event of one issue with its timestamp. An issue's firstSeen /
# lastSeen cannot say how many events landed INSIDE a run's time window; this can. Compare the
# timestamps against the run's own start / end (CI job times, or an EAS run's per-flow durations).
#   ISSUE_ID="<issue-id-from-the-list-above>"
#   curl -s -H "Authorization: Bearer ${SENTRY_AUTH_TOKEN}" \
#     "https://${SENTRY_HOST}/api/0/issues/${ISSUE_ID}/events/?full=false" \
#     | jq -r '.[] | "\(.dateCreated)  \(.eventID)"'
```

<!-- context-fetch:end -->

<!-- allowed-domains:start -->

sentry.io

<!-- allowed-domains:end -->

<!-- mcp-servers:start -->

sentry
Sentry

<!-- mcp-servers:end -->
