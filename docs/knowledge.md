<!-- bkit:start -->

# Knowledge

> [!CAUTION]
> **Purpose:** Lessons, traps, post-mortems, gotchas (symptom → root cause → fix). Append-only.
> **ID:** `KN-{N}` — next = `max(grep 'KN-\d+') + 1`.
> **Categories:** `infra | agentic | backend | frontend | data | integrations | ai | testing | security | other`.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Append-only at EOF, do NOT overwrite.
> - Grep keywords/categories first → read only relevant, no dupes.
>
> **Format:**
>
> ```markdown
> ## KN-{N}: Title (YYYY-MM-DD)
>
> - **Category:** {one of above}
> - **Symptom:** observed (n/a for pattern/config)
> - **Root cause:** why
> - **Fix or rule:** action
> - **Type:** gotcha | pattern | config | dependency | workaround | post-mortem
> - **Confidence:** high | medium | low
> - **Severity:** critical | normal
> - **Source:** agent | human | phase
> - **Related:** {FID}, Linear IDs BAR-{N}, PRs PR-{N}, Commits {SHA}, Decisions DE-{N}, Knowledge KN-{N}, paths, etc
> ```

<!-- bkit:end -->

## KN-1: pnpm v7.20+ silently ignores entire `.npmrc` when `${VAR}` env-var is unset (2026-05-06)

- **Category:** infra
- **Symptom:** `pnpm install` fails with opaque 401 against npmjs.org (NOT against `npm.pkg.github.com`). Error reads as generic auth failure — no "token missing" language. `@cbartens/bkit` not found on npmjs.org.
- **Root cause:** When any `${VAR}` reference inside `.npmrc` resolves to an unset env-var, pnpm v7.20+ silently ignores the **entire** `.npmrc` file and falls back to defaults. The `@cbartens:registry=https://npm.pkg.github.com` line is dropped; pnpm hits npmjs.org instead; npmjs.org has no `@cbartens/bkit`; 401.
- **Fix or rule:** Ensure `GH_BKIT_TOKEN` is: (1) exported in the maintainer's shell before local `pnpm install`; (2) set as a GHA secret on the consumer repo; (3) set as a Vercel env var (preview + production) for any Vercel-deployed consumer. Verify with `echo "${GH_BKIT_TOKEN:-MISSING}"` before `pnpm install` when troubleshooting.
- **Type:** gotcha
- **Confidence:** high
- **Severity:** critical
- **Source:** phase
- **Related:** BAR-138, DE-3, `.agents/scripts/bkit-modules.ts` (installer print copy enumerates this verbatim in `GH_BKIT_TOKEN_MISSING_INSTRUCTIONS` and `GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS`)
