<!-- bkit:start -->

<!-- bkit:managed v4.3.1 — do NOT edit; run `bkit upgrade` to refresh -->

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

Runtime log fetching for `/bkit-debug` — the `debug-fetch:*` blocks it runs and their cloud CLI provisioning — is configured in `.agents/config.md`. Author and enable runtime-log sources there.

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
