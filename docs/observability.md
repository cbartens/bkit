<!-- bkit:start -->

<!-- bkit:managed v4.2.2 — do NOT edit; run `bkit upgrade` to refresh -->

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

**Enabling:** copy an example block below to **after** `<!-- bkit:end -->`, then set its env vars. **Where to set the tokens (local):** put them wherever your repo already exposes env — typically an app env file such as `apps/web/.env.local` sourced by `.envrc` (the exact path varies by stack/consumer). These are app/stack observability creds, **not** bkit tooling, so they do **not** belong in `.bkit/.env`. Each block self-gates — missing CLI / token prints a one-line `[debug-fetch:<name>] skipped — …` breadcrumb to stderr and exits 0 — so enable only the sources you use, and an empty source reads as "not wired up", not "no errors". Re-check after each upgrade: a freshly shipped example (e.g. a new `supabase` block) is inert until copied down. To intentionally enable none, add `<!-- debug-fetch:none intentional -->` after `<!-- bkit:end -->` to dismiss the bkit advisory.

**Cloud agents:** `/bkit-debug` also runs in Claude/Cursor cloud agents, which are headless and never see `.bkit/.env`. Authenticate non-interactively — set env tokens (`VERCEL_TOKEN`, `SUPABASE_ACCESS_TOKEN`) in the dashboard, never `vercel login`. Put each secret token in the cloud agent's dashboard env; non-secret selectors (scope / project ref / `--environment`) can be committed directly in your copied block so cloud agents inherit them. The token is identical across preview/prod — only the selector changes. (Authoring a block for another backend — `gcloud` / `aws` / `datadog` — self-gate on whatever credential it needs.)

**Authoring your own:** tool-agnostic (`gcloud` / `aws` / `datadog` / …). Read-only + idempotent. Self-gate on the credential/tool you need (`command -v <tool>` + token check; on a miss, emit one `[debug-fetch:<name>] skipped — …` line to stderr, then `exit 0`). Cover severity, time window, log name / stream, label filters. Empty output = no signal.

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
  --json
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
  --data-urlencode "iso_timestamp_end=${END}"
```

<!-- debug-fetch:end -->

<!-- bkit:end -->

## Scope

bkit has no server-side telemetry pipeline, log drains, or tracing infrastructure. Observability is limited to CLI stdout/stderr during `bkit install` / `bkit check` runs in consumer environments.

## Log Format

All bkit CLI output uses bracketed context prefixes:

```
console.error("[bkit-install] {Message}", {payload})
console.error("[bkit-preflight] {Message}", {payload})
console.error("[bkit-modules] {Message}", {payload})
console.error("[bkit-comply] {Message}", {payload})
console.error("[bkit-telemetry] {Message}", {payload})
```

The `[{Context}]` brackets are load-bearing — any log-drain or grep-based alerting in consumer CI pipelines parsing bkit output depends on this pattern. NEVER drop the brackets.

### `[bkit-comply]` prefix

The compliance grader uses the `[bkit-comply]` prefix for all stderr output. Two canonical grep-able patterns:

- `[bkit-comply] grader unavailable, skipping` — emitted when the grader is not available (missing `dist/`, grader crash, or any non-zero exit from `pnpm bkit comply`). The fail-open idiom `pnpm bkit comply --phase {p} || echo "[bkit-comply] grader unavailable, skipping"` guarantees this logs to stdout and exits 0.
- `[bkit-comply] append failed: {path}` — emitted when the compliance row append to `.bkit/stats.jsonl` fails (best-effort; exit 0).
- `[bkit-comply] internal error: {message}` — emitted when the grader dispatch catches an unhandled throw (top-level try/catch per DE-34; exit 0).

### `[bkit-telemetry]` prefix

The inline-jq telemetry writers in workflows use `[bkit-telemetry]` for append-failure messages: `[bkit-telemetry] append failed: {path}`.

### `[bkit-harvest]` prefix

The `bkit harvest` CLI uses the `[bkit-harvest]` prefix for all stderr log lines. Grep-able patterns:

- `[bkit-harvest] Found N consumer(s) in .bkit/consumers.md` — emitted at harvest start, confirms consumer list was read.
- `[bkit-harvest] Harvesting: {path}` — emitted per consumer as harvest begins.
- `[bkit-harvest] {path}/.bkit/{file} — copied N rows (malformed: M)` — per-file result for COPY ledgers.
- `[bkit-harvest] {path}/docs/{file} — count-only: N rows` — per-file result for COUNT-ONLY ledgers.
- `[bkit-harvest] SKIP {path} — {reason}` — consumer skipped (path not found, timeout, etc.).
- `[bkit-harvest] Done — total rows collected: N, after dedup: M` — harvest summary.
- `[bkit-harvest] harvest error (fail-open): {message}` — unhandled error in harvest dispatch (exits 0).

### `[bkit-analysis]` prefix

The `bkit analysis` CLI uses the `[bkit-analysis]` prefix for all log lines. Grep-able patterns:

- `[bkit-analysis] Telemetry rows: N | malformed: M` — analysis start summary.
- `[bkit-analysis] #183 Size↔outcome regression (dispatch-size threshold: N linesAdded):` — regression report header.
- `[bkit-analysis] counterSource trust: shell-bus=N (trusted) | model-self-report=N (untrusted, pre-P3)` — trust tier summary.
- `[bkit-analysis] Per-rule compliance rates:` — compliance rate report header.
- `[bkit-analysis] writeRollupShard: {message}` — rollup writer status (shard written or threshold not exceeded).

## Advisory Checklist Output

Post-install findings are rendered via `formatChecklist(ctx.advisories)` (exported from `bkit-postinstall.ts`). Each finding is a `PreflightFinding` with shape `{ id, severity, detect, action }`. Formatted output is the primary human-readable observability surface for bkit consumers.

- Blockers (Phase 1) print to `stderr` and exit 1 before any writes.
- Advisories (Phase 1 and Phase 3) print as a numbered checklist after install completes.
- `bkit check` (dry-run) renders Phase 1 and Phase 3 advisories (read-only paths); exits 1 if any Tier-1/Tier-2 drift detected. No writes. (v2.2.3+; prior versions rendered Phase 1 only.)

## Phase 3 Token-Surface Detectors

Phase 3 detects missing/misconfigured `GH_BKIT_TOKEN_INSTALL` at four surfaces and emits actionable advisory text. Detector names are the audit trail:

<!-- prettier-ignore -->
| Detector | Surface |
| --- | --- |
| `detectShellToken` | Local shell env var |
| `detectNpmrcAuth` | `.npmrc` `@cbartens` registry mapping (token lives in pnpm user-level config, not here) |
| `detectNpmrcLegacyAuthToken` | `.npmrc` legacy `_authToken` line — migration nudge (401s on pnpm >=10.34.3) |
| `detectGhSecret` | GitHub Actions secret |
| `detectVercelEnv` | Vercel preview and production env vars |

See `docs/deployments.md` for the full presence matrix and `docs/security.md` for token-handling rules.
