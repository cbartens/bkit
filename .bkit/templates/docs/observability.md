<!-- bkit:start -->

# Observability

> [!CAUTION]
> **Purpose:** Logging architecture, correlation tracing, telemetry pipelines, log drains.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - **Never log PII.** Scrub sensitive fields at the source.
> - Observability never blocks business logic.

## Debug Fetch

`/bkit-debug` runs **every** `bash` fenced block between `<!-- debug-fetch:start [name] -->` / `<!-- debug-fetch:end -->` that appears **after** `<!-- bkit:end -->` (this consumer-owned section). The bkit-shipped examples _inside_ the managed block above are reference-only and never executed. Per block the agent customises (severity / freshness / limit), executes, and writes stdout to `docs/plans/{YYYYMM}/logs/{FID}/debug-context-runtime-<name>-{DEBUG_ATTEMPT}.md` (unnamed block => `debug-context-runtime-{DEBUG_ATTEMPT}.md`).

**Enabling:** copy an example block below to **after** `<!-- bkit:end -->`, then set its env vars. Each block self-gates — missing CLI / token prints nothing and exits 0 — so enable only the sources you use.

**Authoring your own:** tool-agnostic (`gcloud` / `aws` / `datadog` / …). Read-only + idempotent. Self-gate on the credential/tool you need (`command -v <tool>` + token check `|| exit 0`). Cover severity, time window, log name / stream, label filters. Empty output = no signal.

**Examples (reference only — copy below `<!-- bkit:end -->` to enable):**

<!-- debug-fetch:start vercel -->

```bash
# Vercel errors. Enable: `vercel login` + set VERCEL_SCOPE (team slug).
command -v vercel >/dev/null && [ -n "${VERCEL_SCOPE:-}" ] || exit 0
vercel logs \
  --scope "$VERCEL_SCOPE" \
  --environment "${VERCEL_ENV:-preview}" \
  --level error --level fatal \
  --source serverless --source edge-function \
  --since "${SINCE:-4h}" \
  --limit "${VERCEL_N:-100}" \
  --json
```

<!-- debug-fetch:end -->

<!-- debug-fetch:start supabase -->

```bash
# Supabase Postgres errors (Management API; window <= 24h).
# Enable: set SUPABASE_PROJECT_ID + SUPABASE_ACCESS_TOKEN. API 4xx/5xx: edge_logs status_code >= 400.
[ -n "${SUPABASE_PROJECT_ID:-}" ] && [ -n "${SUPABASE_ACCESS_TOKEN:-}" ] || exit 0
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
  --data-urlencode "iso_timestamp_end=${END}"
```

<!-- debug-fetch:end -->

<!-- bkit:end -->
