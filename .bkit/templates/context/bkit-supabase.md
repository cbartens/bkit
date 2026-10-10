<!-- Example. Copy into the repo and own it. -->
<!-- bkit install does not write this file and does not overwrite a copy. -->

# Supabase — Postgres errors

Fits: apps on a hosted Supabase project. `context=runtime`: Postgres `ERROR` / `FATAL` / `PANIC` log lines from the Management API analytics endpoint (window <= 24 h, default last 4 h). Swap the SQL to `edge_logs` with `status_code >= 400` for API 4xx/5xx.

- Secret: `SUPABASE_ACCESS_TOKEN` (personal access token; one token covers preview and production).
- Non-secret: `SUPABASE_PROJECT_ID` (project ref) — uncomment the line in the block so cloud agents inherit it. Preview and production are separate projects: use the ref whose logs you want. `SINCE_ISO` overrides the window start.
- CLI: none (`curl` + `jq`), no provision block.

Copy the block below into `.agents/context.md`, below `<!-- bkit:end -->`.

<!-- context-fetch:start supabase context=runtime -->

```bash
# Supabase Postgres errors (Management API; window <= 24h).
# Enable: set SUPABASE_PROJECT_ID + SUPABASE_ACCESS_TOKEN. API 4xx/5xx: edge_logs status_code >= 400.
# SUPABASE_PROJECT_ID is non-secret — uncomment + set the line below so local AND
# cloud agents inherit it (headless cloud agents never read .bkit/.env). Preview and
# production are SEPARATE projects — use the ref for the env whose logs you want:
# SUPABASE_PROJECT_ID="your-project-ref"
# Customise: SUPABASE_PROJECT_ID (preview vs prod); SINCE_ISO window; SQL severity / limit; postgres_logs vs edge_logs.
[ -n "${SUPABASE_PROJECT_ID:-}" ] && [ -n "${SUPABASE_ACCESS_TOKEN:-}" ] \
  || { echo "[context-fetch:supabase] skipped — SUPABASE_PROJECT_ID or SUPABASE_ACCESS_TOKEN unset" >&2; exit 0; }
START="${SINCE_ISO:-$(date -u -v-4H +%FT%TZ 2>/dev/null || date -u -d '4 hours ago' +%FT%TZ)}"
END="$(date -u +%FT%TZ)"
SQL=$(cat <<'SQL_EOF'
select t.timestamp, p.error_severity, event_message
from postgres_logs t
cross join unnest(metadata) m
cross join unnest(m.parsed) p
where p.error_severity in ('ERROR', 'FATAL', 'PANIC')
order by t.timestamp desc
limit 100
SQL_EOF
)
curl -sG "https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_ID}/analytics/endpoints/logs.all" \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  --data-urlencode "sql=${SQL}" \
  --data-urlencode "iso_timestamp_start=${START}" \
  --data-urlencode "iso_timestamp_end=${END}" \
  | jq '[.result[] | {timestamp, error_severity, event_message}]'
```

<!-- context-fetch:end -->

<!-- allowed-domains:start -->

supabase.com

<!-- allowed-domains:end -->

<!-- mcp-servers:start -->

supabase
Supabase

<!-- mcp-servers:end -->
