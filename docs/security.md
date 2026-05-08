<!-- bkit:start -->

# Security

> [!CAUTION]
> **Purpose:** Authentication, authorization, input validation, rate limiting, secrets management, PII handling.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Auth standards live ONLY here. Other docs link, do not restate.

<!-- bkit:end -->

## Scope

bkit has no database, no server, and no user-authentication surface. Security concerns are limited to: secrets management (tokens), supply-chain (action pinning), shell-injection guards, and PII avoidance in logs.

## Secrets Management

### `GH_BKIT_TOKEN`

The sole credential bkit depends on. Must be a GitHub PAT with `read:packages` scope (classic) or `Packages: read` (fine-grained). Required at four surfaces — see `docs/deployments.md` for the full presence matrix.

- NEVER commit as a literal value in `.npmrc`. Always use `${GH_BKIT_TOKEN}` env-var reference.
- NEVER log or print the token value. `detectShellToken` (Phase 3) reads the env var's presence; it does NOT log its value.
- `git status` review before every commit — `.env*` files are in `.gitignore` and must never be staged.

### `NODE_AUTH_TOKEN`

Used in `.github/workflows/release.yml` for `npm publish`. Set from `${{ secrets.GITHUB_TOKEN }}` (auto-injected) with `permissions: packages: write`. Never persisted outside the CI job.

## Shell Injection

All subprocess calls from bkit scripts that interpolate variables MUST use `execFileSync` (not `execSync`) to bypass shell metacharacter interpretation. Pattern:

```ts
execFileSync("vercel", ["env", "ls", env]);  // correct
execSync(`vercel env ls ${env}`);            // PROHIBITED
```

Add runtime type-guards for any string passed to subprocess arguments, even TypeScript-typed ones (type erasure at runtime). See `docs/knowledge.md` KN-6.

## Supply-Chain (GitHub Actions)

Publishing workflows (`.github/workflows/release.yml`) must pin `uses:` to 40-character commit SHAs, not floating `@v{N}` tags. Floating tags on jobs with `packages: write` are a supply-chain vector. See `docs/knowledge.md` KN-3.

## PII

bkit does not process, store, or transmit user PII. Log lines use the `[bkit-*]` prefix format per the naming convention. Never log consumer repo content verbatim in production output paths.

## RLS

Not applicable — bkit has no database.
