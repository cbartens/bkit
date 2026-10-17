<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# Supabase — Postgres errors

Fits: apps on a hosted Supabase project. `context=runtime`: Postgres `ERROR` / `FATAL` / `PANIC` counts per hour, severity, SQLSTATE and role from the Management API logs endpoint (default last 4 h; any longer window is read one day per call, the API's limit). No message text is read. Swap the SQL to `source = 'edge_logs'` for API 5xx.

- Secret: `SUPABASE_ACCESS_TOKEN` (personal access token; one token covers preview and production).
- Non-secret: `SUPABASE_PROJECT_ID` (project ref) — uncomment the line in the block so cloud agents inherit it. Preview and production are separate projects: use the ref whose logs you want. `SINCE_ISO` / `UNTIL_ISO` set the window.
- CLI: none (`curl` + `jq`), no provision block.

Copy the block below into `.agents/context.md`, below `<!-- bkit:end -->`.

<!-- context-fetch:start supabase context=runtime -->

```bash
# Supabase Postgres errors — Management API `GET /v1/projects/{ref}/analytics/endpoints/logs`
# (`logs.all` removed). ClickHouse SQL over one `logs` table; fields via log_attributes['…']
# (strings). One call covers at most 24 h, silently drops the rest → loop walks the window a day at
# a time. Counts per hour + severity + SQLSTATE + role; message text never read. Rejected query =
# HTTP 200 with `.error`; both checked, either → `skipped`.
# API 5xx instead: source = 'edge_logs' and toInt32OrZero(log_attributes['response.status_code']) >= 500.
# SUPABASE_PROJECT_ID is non-secret — uncomment + set the line below so local AND
# cloud agents inherit it (headless cloud agents never read .bkit/.env). Preview and
# production are SEPARATE projects — use the ref for the env whose logs you want:
# SUPABASE_PROJECT_ID="your-project-ref"
# Customise: SUPABASE_PROJECT_ID (preview vs prod); SINCE_ISO / UNTIL_ISO (window, default last 4 h); the SQL (source, severities, grouping). Positive control (suggested): run once over a window holding a known error (e.g. a test triggering permission-denied 42501); nothing back = reader broken, not clean.
[ -n "${SUPABASE_PROJECT_ID:-}" ] && [ -n "${SUPABASE_ACCESS_TOKEN:-}" ] \
  || { echo "[context-fetch:supabase] skipped — SUPABASE_PROJECT_ID or SUPABASE_ACCESS_TOKEN unset" >&2; exit 0; }
SUPA_NOW=$(date -u +%s)
SUPA_FROM=$(jq -rn --arg t "${SINCE_ISO:-}" --argjson d "$((SUPA_NOW - 14400))" 'if $t == "" then $d else ($t | sub("\\.[0-9]+"; "") | fromdateiso8601) end' 2>/dev/null)
SUPA_END=$(jq -rn --arg t "${UNTIL_ISO:-}" --argjson d "$SUPA_NOW" 'if $t == "" then $d else ($t | sub("\\.[0-9]+"; "") | fromdateiso8601) end' 2>/dev/null)
[ -n "$SUPA_FROM" ] && [ -n "$SUPA_END" ] && [ "$SUPA_FROM" -lt "$SUPA_END" ] \
  || { echo "[context-fetch:supabase] skipped — SINCE_ISO / UNTIL_ISO not ISO-8601 (2026-01-31T00:00:00Z) or window empty" >&2; exit 0; }
SQL=$(cat <<'SQL_EOF'
select toStartOfHour(timestamp) as hour,
  log_attributes['parsed.error_severity'] as severity,
  log_attributes['parsed.sql_state_code'] as sqlstate,
  log_attributes['parsed.user_name'] as role,
  count() as n
from logs
where source = 'postgres_logs'
  and log_attributes['parsed.error_severity'] in ('ERROR', 'FATAL', 'PANIC')
group by hour, severity, sqlstate, role
order by hour desc
limit 1000
SQL_EOF
)
SUPA_RESP=$(mktemp); SUPA_ROWS=$(mktemp)
trap 'rm -f "$SUPA_RESP" "$SUPA_ROWS"' EXIT
SUPA_CALLS=0
while [ "$SUPA_FROM" -lt "$SUPA_END" ]; do
  SUPA_TO=$((SUPA_FROM + 86400)); [ "$SUPA_TO" -le "$SUPA_END" ] || SUPA_TO="$SUPA_END"
  SUPA_CALLS=$((SUPA_CALLS + 1))
  SUPA_CODE=$(curl -sG -o "$SUPA_RESP" -w '%{http_code}' \
    "https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_ID}/analytics/endpoints/logs" \
    -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
    --data-urlencode "sql=${SQL}" \
    --data-urlencode "iso_timestamp_start=$(jq -rn --argjson s "$SUPA_FROM" '$s | todate')" \
    --data-urlencode "iso_timestamp_end=$(jq -rn --argjson s "$SUPA_TO" '$s | todate')")
  [ "$SUPA_CODE" = "200" ] && jq -e '.error == null and (.result | type == "array")' "$SUPA_RESP" >/dev/null 2>&1 \
    || { echo "[context-fetch:supabase] skipped — logs endpoint HTTP ${SUPA_CODE:-000} on call $SUPA_CALLS$( [ "$SUPA_CODE" = "200" ] && echo ' (query rejected: .error set)') — 401 = bad token, 403/404 = wrong project ref, 000 = unreachable" >&2; exit 0; }
  jq -c '.result[]' "$SUPA_RESP" >> "$SUPA_ROWS"
  SUPA_FROM="$SUPA_TO"
done
printf '===== supabase %s postgres ERROR/FATAL/PANIC per hour, %s → %s — %s row(s), %s call(s) =====\n' \
  "$SUPABASE_PROJECT_ID" "${SINCE_ISO:-last 4 h}" "${UNTIL_ISO:-now}" "$(grep -c . "$SUPA_ROWS")" "$SUPA_CALLS"
jq -rs 'sort_by(.hour) | reverse | .[] | [.hour, .severity, .sqlstate, .role, .n] | @tsv' "$SUPA_ROWS"
```

<!-- context-fetch:end -->

<!-- allowed-domains:start -->

supabase.com

<!-- allowed-domains:end -->

<!-- mcp-servers:start -->

supabase
Supabase

<!-- mcp-servers:end -->
