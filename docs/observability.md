<!-- bkit:start -->

<!-- bkit:managed v4.10.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Observability

> [!CAUTION]
> **Purpose:** Logging architecture, correlation tracing, telemetry pipelines, log drains.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Describe current state / rules, NOT reasons / history; state what to do; NOT why.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - **Never log PII.** Scrub sensitive fields at the source.
> - Observability never blocks business logic.

## Debug Fetch

Runtime log fetching for `/bkit-debug` (`debug-fetch:*` blocks + cloud CLI provisioning) → configure in `.agents/config.md`. Author and enable runtime-log sources there.

<!-- bkit:end -->

## Scope

No server-side telemetry pipeline, log drains, or tracing. Observability limited to CLI stdout/stderr during `bkit install` / `bkit check` in consumer environments.

## Log Format

All bkit CLI output uses bracketed context prefixes:

```
console.error("[bkit-install] {Message}", {payload})
console.error("[bkit-modules] {Message}", {payload})
console.error("[bkit-comply] {Message}", {payload})
console.error("[bkit-telemetry] {Message}", {payload})
```

`[{Context}]` brackets are load-bearing — consumer CI log-drain / grep alerting depends on this pattern. NEVER drop the brackets.

One prefix per verb/subsystem, named for module NOT phase: `[bkit-install]` · `[bkit-check]` · `[bkit-doctor]` · `[bkit-status]` · `[bkit-upgrade]` · `[bkit-uninstall]` · `[bkit-modules]` · `[bkit-tokens]` · `[bkit-comply]` · `[bkit-harvest]` · `[bkit-analysis]` · `[bkit-telemetry]`. New prefix only alongside new module; else reuse owning module's prefix.

### `[bkit-comply]` prefix

Compliance grader stderr. Canonical grep patterns:

- `[bkit-comply] grader unavailable, skipping` — grader unavailable (missing `dist/`, crash, non-zero `pnpm bkit comply`). Fail-open: `pnpm bkit comply --phase {p} || echo "[bkit-comply] grader unavailable, skipping"` → stdout, exit 0.
- `[bkit-comply] append failed: {path}` — compliance row append to `.bkit/stats.jsonl` failed (best-effort; exit 0).
- `[bkit-comply] internal error: {message}` — unhandled throw in dispatch (try/catch per DE-34; exit 0).

### `[bkit-telemetry]` prefix

Inline-jq workflow writers: `[bkit-telemetry] append failed: {path}`.

### `[bkit-harvest]` prefix

`bkit harvest` stderr. Grep patterns:

- `[bkit-harvest] Found N consumer(s) in .bkit/consumers.md` — harvest start; consumer list read.
- `[bkit-harvest] Harvesting: {path}` — per consumer start.
- `[bkit-harvest] {path}/.bkit/{file} — copied N rows (malformed: M)` — COPY ledger per-file.
- `[bkit-harvest] {path}/docs/{file} — count-only: N rows` — COUNT-ONLY ledger per-file.
- `[bkit-harvest] {path}/.bkit/{file} — pruned N harvested row(s)` — rows REMOVED from consumer after durable store (friction only).
- `[bkit-harvest] SKIP {path} — {reason}` — consumer skipped.
- `[bkit-harvest] Done — total rows collected: N, after dedup: M, pruned from consumers: P` — summary.
- `[bkit-harvest] N row(s) now exist ONLY in harvest/ — commit it to make them durable.` — when P > 0; uncommitted store is sole copy.
- `[bkit-harvest] harvest error (fail-open): {message}` — unhandled harvest error (exit 0).

`pruned` without preceding `copied` for same file → rows deleted without store — ordering enforced (copy → fsync → read back → prune); treat as bug, not noise.

### `[bkit-analysis]` prefix

`bkit analysis` log lines:

- `[bkit-analysis] Telemetry rows: N | malformed: M` — start summary.
- `[bkit-analysis] #183 Size↔outcome regression (dispatch-size threshold: N linesAdded):` — regression header.
- `[bkit-analysis] counterSource trust: shell-bus=N (trusted) | model-self-report=N (untrusted, pre-P3)` — trust tier.
- `[bkit-analysis] Per-rule compliance rates:` — compliance header.
- `[bkit-analysis] writeRollupShard: {message}` — rollup status.

## Advisory Checklist Output

Post-install findings via `formatChecklist(ctx.advisories)` (`bkit-postinstall.ts`). Each `PreflightFinding`: `{ id, severity, detect, action }`. Primary human-readable observability surface.

- Blockers (Phase 1) → `stderr`, exit 1 before writes.
- Advisories (Phase 1 + Phase 3) → numbered checklist after install.
- `bkit check` (dry-run) → Phase 1 + Phase 3 advisories (read-only); exit 1 on Tier-1/Tier-2 drift. No writes. (v2.2.3+; prior: Phase 1 only.)

## Phase 3 Token-Surface Detectors

Phase 3 detects missing/misconfigured `GH_BKIT_TOKEN_INSTALL` at four surfaces; actionable advisory text. Detector names = audit trail:

<!-- prettier-ignore -->
| Detector | Surface |
| --- | --- |
| `detectShellToken` | Local shell env var |
| `detectNpmrcAuth` | `.npmrc` `@cbartens` registry mapping (token lives in pnpm user-level config, not here) |
| `detectNpmrcLegacyAuthToken` | `.npmrc` legacy `_authToken` line — migration nudge (401s on pnpm >=10.34.3) |
| `detectGhSecret` | GitHub Actions secret |
| `detectCiYmlMissingTokenEnv` | `ci.yml` install step lacks the token `env:` wiring — blocker when `.npmrc` authenticates to GH Packages but the step is unwired |
| `detectVercelEnv` | Vercel preview and production env vars |

See `docs/deployments.md` for the full presence matrix and `docs/security.md` for token-handling rules.
