<!-- bkit:start -->

# Config

> [!CAUTION]
> **Purpose:** Agent/tooling configuration that bkit tooling PARSES and executes — currently the `debug-fetch` runtime-log contract (`/bkit-debug`) and its cloud CLI provisioning. Distinct from `docs/observability.md`, which is logging _doctrine_, not parsed config.
>
> **Rules:**
>
> - Blocks below `<!-- bkit:end -->` are consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add yours there.
> - Read-only + idempotent. **Never log PII.**
> - Token-efficient dense phrasing; agent readers only.

## Debug Fetch

`/bkit-debug` runs **every** `bash` fenced block between `<!-- debug-fetch:start [name] -->` / `<!-- debug-fetch:end -->` that appears **after** `<!-- bkit:end -->` (this consumer-owned section). The bkit-shipped examples _inside_ the managed block above are reference-only and never executed. Per block the agent customises (severity / freshness / limit), executes, and writes stdout to `docs/plans/{YYYYMM}/logs/{FID}/debug-context-runtime-<name>-{DEBUG_ATTEMPT}.md` (unnamed block => `debug-context-runtime-{DEBUG_ATTEMPT}.md`).

**Enabling:** copy an example block below to **after** `<!-- bkit:end -->`, then set its env vars. **Where to set the tokens (local):** put them wherever your repo already exposes env — typically an app env file such as `apps/web/.env.local` sourced by `.envrc` (the exact path varies by stack/consumer). These are app/stack observability creds, **not** bkit tooling, so they do **not** belong in `.bkit/.env`. Each block self-gates — missing CLI / token prints a one-line `[debug-fetch:<name>] skipped — …` breadcrumb to stderr and exits 0 — so enable only the sources you use, and an empty source reads as "not wired up", not "no errors". Re-check after each upgrade: a freshly shipped example (e.g. a new `supabase` block) is inert until copied down. To intentionally enable none, add `<!-- debug-fetch:none intentional -->` after `<!-- bkit:end -->` to dismiss the bkit advisory.

**Cloud agents:** `/bkit-debug` also runs in Claude/Cursor cloud agents, which are headless and never see `.bkit/.env`. Authenticate non-interactively — set env tokens (`VERCEL_TOKEN`, `SUPABASE_ACCESS_TOKEN`) in the dashboard, never `vercel login`. Put each secret token in the cloud agent's dashboard env; non-secret selectors (scope / project ref / `--environment`) can be committed directly in your copied block so cloud agents inherit them. The token is identical across preview/prod — only the selector changes. (Authoring a block for another backend — `gcloud` / `aws` / `datadog` — self-gate on whatever credential it needs.)

**Authoring your own:** tool-agnostic (`gcloud` / `aws` / `datadog` / …). Read-only + idempotent. Self-gate on the credential/tool you need (`command -v <tool>` + token check; on a miss, emit one `[debug-fetch:<name>] skipped — …` line to stderr, then `exit 0`). Cover severity, time window, log name / stream, label filters. Empty output = no signal.

**Formatting output (`jq`):** every example pipes JSON through `jq` to filter to failures and project a **PII-safe** field subset (never dump raw rows — the projection is what keeps PII out of the run artifact). bkit provisions `jq` as a base tool (macOS dev, Cursor container, and the Claude-web cloud setup script), so a block may assume it is present and does **not** self-gate on it. **Without `jq`** on your stack: substitute an already-present interpreter (`… | node -e '…'` or `… | python3 -c '…'` — same filter/project, no new dependency), or emit the source's own `--json` / raw response unfiltered — but raw output writes whatever the source returns (possibly PII) into the artifact, so prefer in-block projection.

### CLI provisioning (cloud)

A fetch block only _runs_ in the cloud if its CLI is present — otherwise it self-skips and the cloud `/bkit-debug` gets **no** runtime logs (a silent `exit 0`, not an error). bkit installs no stack CLIs itself (that would name a stack); instead you **declare** each block's install recipe in a sibling `<!-- debug-fetch:provision <name> --> … <!-- debug-fetch:end -->` block, and bkit's stack-agnostic tooling runs it in both cloud paths:

- `.claude/hooks/cloud-bootstrap.sh` runs every `debug-fetch:provision` block on session start (gh-runner + resumed web sessions),
- `bkit install` injects the same recipes into the generated `.claude/cloud.md` setup script (web snapshot — fast, install-once).

Rules for a provision block: **self-guard** it (`command -v <cli> >/dev/null 2>&1 || <install>`) so a re-run is a no-op, keep it install-only (no fetching), and give it the **same name** as its fetch block. A block that fetches via an **MCP** tool or a plain `curl`/API call needs no CLI — omit its provision block entirely. Only a block that shells out to a stack CLI needs one: the `vercel` example below ships a provision block (it calls the `vercel` CLI); the curl-based `supabase` example does not.

**Examples (reference only — copy below `<!-- bkit:end -->` to enable):**

<!-- debug-fetch:start vercel -->

```bash
# Vercel errors (read-only). Headless: set VERCEL_TOKEN + VERCEL_SCOPE (team slug);
# no `vercel login`. Targets the PREVIEW env by default (--environment below) —
# set VERCEL_ENV=production to fetch production logs instead.
# VERCEL_SCOPE is non-secret — uncomment + set the line below so local AND cloud
# agents inherit it (headless cloud agents never read .bkit/.env):
# VERCEL_SCOPE="your-team-slug"
command -v vercel >/dev/null && [ -n "${VERCEL_TOKEN:-}" ] && [ -n "${VERCEL_SCOPE:-}" ] \
  || { echo "[debug-fetch:vercel] skipped — vercel CLI / VERCEL_TOKEN / VERCEL_SCOPE missing" >&2; exit 0; }
vercel logs \
  --token "$VERCEL_TOKEN" \
  --scope "$VERCEL_SCOPE" \
  --environment "${VERCEL_ENV:-preview}" \
  --level error --level fatal \
  --source serverless --source edge-function \
  --since "${SINCE:-4h}" \
  --limit "${VERCEL_N:-100}" \
  --json \
  | jq -c '{timestamp, level, source, requestPath, responseStatusCode, traceId, message}'  # PII-safe projection; traceId stitches to the sentry block, message is free-text — adjust keys to your log shape
```

<!-- debug-fetch:end -->

<!-- debug-fetch:provision vercel -->

```bash
# Install the vercel CLI in cloud if absent (self-guarded; no-op when present).
command -v vercel >/dev/null 2>&1 || pnpm add -g vercel
```

<!-- debug-fetch:end -->

<!-- debug-fetch:start supabase -->

```bash
# Supabase Postgres errors (Management API; window <= 24h).
# Enable: set SUPABASE_PROJECT_ID + SUPABASE_ACCESS_TOKEN. API 4xx/5xx: edge_logs status_code >= 400.
# SUPABASE_PROJECT_ID is non-secret — uncomment + set the line below so local AND
# cloud agents inherit it (headless cloud agents never read .bkit/.env). Preview and
# production are SEPARATE projects — use the ref for the env whose logs you want:
# SUPABASE_PROJECT_ID="your-project-ref"
[ -n "${SUPABASE_PROJECT_ID:-}" ] && [ -n "${SUPABASE_ACCESS_TOKEN:-}" ] \
  || { echo "[debug-fetch:supabase] skipped — SUPABASE_PROJECT_ID or SUPABASE_ACCESS_TOKEN unset" >&2; exit 0; }
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

<!-- debug-fetch:end -->

<!-- No debug-fetch:provision block: this is a curl/API fetch (no stack CLI), so
     nothing to install. Contrast the vercel example above, which shells out to the
     `vercel` CLI and therefore ships a matching provision block. -->

## Cloud allowed domains

Cloud sessions (Claude Code on the web, Cursor background agents) run behind an egress proxy. Under **Trusted** network access only package registries + common SDK hosts are reachable — your log-backend / observability API hosts and your app's own domains are **not**, so cloud `/bkit-debug` gets no runtime logs and e2e can't reach a deployment. Declare the domains those flows need in a `<!-- allowed-domains:start --> … <!-- allowed-domains:end -->` block **after** `<!-- bkit:end -->`; `bkit install` expands each to `<domain>` + `*.<domain>` and renders a copy-paste **Custom** allowlist into `.claude/cloud.md` § Network access (set Custom, tick "Also include default list of common package managers", paste — this EXTENDS the defaults, never replaces them).

Declare **apex domains only**, one per line — bkit adds the `*.` wildcard so the WHOLE domain is allowed and you never list specific subdomains. Include every host your debug-fetch blocks reach (incl. the implicit hosts of CLI blocks like `vercel` / `gcloud`) plus your app's production + preview/dev domains. To intentionally declare none, add `<!-- allowed-domains:none intentional -->` after `<!-- bkit:end -->`.

**Example (reference only — copy below `<!-- bkit:end -->` and edit):**

<!-- allowed-domains:start -->

# observability / API hosts your debug-fetch blocks call

sentry.io
supabase.com

# app production + preview/dev domains

your-app.com
<!-- allowed-domains:end -->

<!-- bkit:end -->

## Enabled blocks

<!-- Copy the example fetch (and provision) blocks from the managed section above to
     here, then set each block's env vars. Blocks in THIS section are what
     `/bkit-debug` runs and what cloud provisioning installs. -->
