<!-- bkit:start -->

# Config

> [!CAUTION]
> **Purpose:** Agent/tooling configuration bkit tooling PARSES and executes — currently `debug-fetch` runtime-log contract (`/bkit-debug`) and cloud CLI provisioning. Distinct from `docs/observability.md` (logging _doctrine_, not parsed config).
>
> **Rules:**
>
> - Blocks below `<!-- bkit:end -->` = consumer-owned — `bkit install` never overwrites them, `bkit check` drift stays clean. Add yours there.
> - Read-only + idempotent. **Never log PII.**
> - Token-efficient dense phrasing; agent readers only.
> - Describe current state / rules, NOT reasons / history; state what to do; NOT why.

## Debug Fetch

`/bkit-debug` runs **every** `bash` fenced block between `<!-- debug-fetch:start [name] -->` / `<!-- debug-fetch:end -->` **after** `<!-- bkit:end -->` (consumer-owned section). bkit-shipped examples _inside_ managed block above = reference-only, never executed. Per block: agent customises (severity / freshness / limit), executes, writes stdout to `docs/plans/{YYYYMM}/logs/{FID}/debug-context-runtime-<name>-{DEBUG_ATTEMPT}.md` (unnamed block => `debug-context-runtime-{DEBUG_ATTEMPT}.md`).

**Loudness:** a block's `exit 0` self-skip (missing CLI/token, or the host unreachable behind a cloud Trusted-egress allowlist — § Cloud allowed domains below) is NEVER evidence of "no runtime errors" — it means this source was **not checked**. `/bkit-debug` narrates each block's outcome as `CHECKED` / `SELF-SKIPPED` / `NO BLOCKS CONFIGURED`, distinctly, every attempt; downstream diagnosis must read a self-skip as "unavailable", never fold it into a clean result.

**Enabling:** copy example block below to **after** `<!-- bkit:end -->`, set env vars. **Where to set tokens (local):** repo env exposure — typically `apps/web/.env.local` via `.envrc` (path varies by stack/consumer). App/stack observability creds, **not** bkit tooling — **not** `.bkit/.env`. Each block self-gates — missing CLI / token → one-line `[debug-fetch:<name>] skipped — …` stderr, exit 0 — enable only sources you use; empty source = "not wired up", not "no errors". Re-check after upgrade: freshly shipped example inert until copied down. Enable none → `<!-- debug-fetch:none intentional -->` after `<!-- bkit:end -->`.

**Cloud agents:** `/bkit-debug` also runs in Claude/Cursor cloud (headless, never see `.bkit/.env`). Non-interactive auth — dashboard env tokens (`VERCEL_TOKEN`, `SUPABASE_ACCESS_TOKEN`), never `vercel login`. Secret tokens → cloud dashboard; non-secret selectors (scope / project ref / `--environment`) commit in copied block so cloud agents inherit them. Token identical preview/prod — selector only changes. Other backends (`gcloud` / `aws` / `datadog`) self-gate on needed credential.

**Authoring your own:** tool-agnostic (`gcloud` / `aws` / `datadog` / …). Read-only + idempotent. Self-gate on credential/tool (`command -v <tool>` + token check; miss → `[debug-fetch:<name>] skipped — …` stderr, `exit 0`). Cover severity, time window, log name / stream, label filters. Empty output = no signal.

**Formatting output (`jq`):** every example pipes JSON through `jq` → **PII-safe** field subset (projection keeps PII out of run artifact). bkit provisions `jq` (macOS dev, Cursor container, Claude-web cloud setup) — assume present, no self-gate. **Without `jq`:** substitute present interpreter (`… | node -e '…'` or `… | python3 -c '…'` — same filter/project) or source `--json` / raw unfiltered — raw writes whatever source returns (possibly PII) into artifact; prefer in-block projection.

### CLI provisioning (cloud)

Fetch block _runs_ in cloud only if CLI present — else self-skips, cloud `/bkit-debug` gets **no** runtime logs (silent `exit 0`, not error). bkit installs no stack CLIs; **declare** each block's install recipe in sibling `<!-- debug-fetch:provision <name> --> … <!-- debug-fetch:end -->`; bkit stack-agnostic tooling runs both cloud paths:

- `.claude/hooks/cloud-bootstrap.sh` — every `debug-fetch:provision` block on session start (gh-runner + resumed web sessions),
- `bkit install` — same recipes into generated `.claude/cloud.md` setup script (web snapshot — install-once).

Provision block rules: **self-guard** (`command -v <cli> >/dev/null 2>&1 || <install>`) → re-run no-op; install-only (no fetching); **same name** as fetch block. MCP / `curl`/API fetch needs no CLI — omit provision. Only stack-CLI blocks need one: `vercel` example ships provision; curl `supabase` example does not.

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

Cloud sessions (Claude Code on the web, Cursor background agents) run behind egress proxy. **Trusted** network: package registries + common SDK hosts only — log-backend / observability API hosts and app domains **not** reachable → cloud `/bkit-debug` no runtime logs, e2e can't reach deployment. Declare domains in `<!-- allowed-domains:start --> … <!-- allowed-domains:end -->` **after** `<!-- bkit:end -->`; `bkit install` expands each to `<domain>` + `*.<domain>`, then:

1. Renders copy-paste **Custom** allowlist into `.claude/cloud.md` / `.cursor/cloud.md` § Network access (set Custom, tick "Also include default list of common package managers", paste — EXTENDS defaults, never replaces).
2. Merges those **consumer** domains with stack-agnostic tooling defaults into host local permissions on **`bkit install` and `bkit upgrade`**: OpenCode `curl`/`wget` allows (in `opencode.json`), Claude `WebFetch` (in `settings.json`), and — **Cursor only** — `.cursor/allowlist.json` for `guardrails.cjs`. Same policy; Cursor needs a runtime file because it has no settings-native curl host map (hook instead of baked config). Full matrix: `.bkit/providers.md` § Network allowlist. bkit never ships Vercel/Supabase/Sentry/etc. into every consumer — only what you list here.

**Apex domains only**, one per line — bkit adds `*.` wildcard (whole domain; never list subdomains). Include every host debug-fetch blocks reach (incl. implicit CLI hosts `vercel` / `gcloud`) + app production + preview/dev domains. Declare none → `<!-- allowed-domains:none intentional -->` after `<!-- bkit:end -->`.

**Example (reference only — copy below `<!-- bkit:end -->` and edit):**

<!-- allowed-domains:start -->

# observability / API hosts your debug-fetch blocks call

sentry.io
supabase.com
vercel.com

# app production + preview/dev domains

your-app.com
<!-- allowed-domains:end -->

<!-- bkit:end -->

## Enabled blocks

<!-- Copy the example fetch (and provision) blocks from the managed section above to
     here, then set each block's env vars. Blocks in THIS section are what
     `/bkit-debug` runs and what cloud provisioning installs. -->
