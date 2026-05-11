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

<!-- bkit:end -->

## Scope

bkit has no server-side telemetry pipeline, log drains, or tracing infrastructure. Observability is limited to CLI stdout/stderr output during `bkit install` / `bkit check` runs in consumer environments.

## Log Format

All bkit CLI output uses bracketed context prefixes:

```
console.error("[bkit-install] {Message}", {payload})
console.error("[bkit-preflight] {Message}", {payload})
console.error("[bkit-modules] {Message}", {payload})
```

The `[{Context}]` brackets are load-bearing — any log-drain or grep-based alerting in consumer CI pipelines that parses bkit output depends on this pattern. NEVER drop the brackets.

## Advisory Checklist Output

Post-install findings are rendered via `formatChecklist(ctx.advisories)` (exported from `bkit-postinstall.ts`). Each finding is a `PreflightFinding` with shape `{ id, severity, detect, action }`. The formatted output is the primary human-readable observability surface for bkit consumers.

- Blockers (Phase 1) print to `stderr` and exit 1 before any writes.
- Advisories (Phase 1 + Phase 3) print as a numbered checklist after install completes.
- `bkit check` (dry-run) renders Phase 1 advisories only; exits 1 if any drift detected.

## Phase 3 Token-Surface Detectors

Phase 3 detects missing/misconfigured `GH_BKIT_TOKEN` at four surfaces and emits actionable advisory text. Detector names are the audit trail:

| Detector           | Surface                              |
| ------------------ | ------------------------------------ |
| `detectShellToken` | Local shell env var                  |
| `detectNpmrcAuth`  | `.npmrc` auth token line             |
| `detectGhSecret`   | GitHub Actions secret                |
| `detectVercelEnv`  | Vercel preview + production env vars |

See `docs/deployments.md` for the full presence matrix and `docs/security.md` for token-handling rules.
