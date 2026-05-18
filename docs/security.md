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

## Supply-Chain (GitHub Actions)

Workflows with elevated permissions (`packages: write`, `id-token: write`, `contents: write`, or deploy credentials) MUST pin `uses:` to a 40-character commit SHA — never `@v{N}` floating tags. Floating tags are forgeable: a compromised maintainer can re-point `v4` at malicious code that runs on the next push.

Resolve a SHA with `git ls-remote https://github.com/<owner>/<repo>.git 'refs/tags/vX.Y.Z'`. Append a `# vX.Y.Z` comment so the version stays human-readable:

```yaml
- uses: actions/checkout@a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e # v4.2.1
```

**Pair with `.github/dependabot.yml`.** SHA-pinning freezes the workflow on the pinned version — without an updater, CVEs in those actions stay un-patched indefinitely. Minimal config:

```yaml
version: 2
updates:
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: weekly
```

Dependabot scans every `uses:` line in `.github/workflows/*.yml` weekly and opens one PR per outdated action with release notes attached; CVE-driven PRs fire immediately regardless of schedule.

<!-- bkit:end -->

## Scope

bkit has no database, no server, no user-authentication surface. Security concerns: secrets management (tokens), supply-chain (action pinning), shell-injection guards, PII avoidance in logs.

## Secrets Management

### `GH_BKIT_TOKEN`

Sole credential bkit depends on. Must be a GitHub PAT with `read:packages` scope (classic) or `Packages: read` (fine-grained). Required at four surfaces — see `docs/deployments.md` for the full presence matrix.

- NEVER commit as a literal value in `.npmrc`. Always use `${GH_BKIT_TOKEN}` env-var reference.
- NEVER log or print the token value. `detectShellToken` (Phase 3) reads the env var's presence; it does NOT log its value.
- `git status` review before every commit — `.env*` files are in `.gitignore` and must never be staged.

### `NODE_AUTH_TOKEN`

Used in `.github/workflows/release.yml` for `npm publish`. Set from `${{ secrets.GITHUB_TOKEN }}` (auto-injected) with `permissions: packages: write`. Never persisted outside the CI job.

## Shell Injection

All subprocess calls from bkit scripts that interpolate variables MUST use `execFileSync` (not `execSync`) to bypass shell metacharacter interpretation. Pattern:

```ts
execFileSync("vercel", ["env", "ls", env]); // correct
execSync(`vercel env ls ${env}`); // PROHIBITED
```

Add runtime type-guards for any string passed to subprocess arguments, even TypeScript-typed ones (type erasure at runtime). See `docs/knowledge.md` KN-6.

## PII

bkit does not process, store, or transmit user PII. Log lines use the `[bkit-*]` prefix format per the naming convention. Never log consumer repo content verbatim in production output paths.

## RLS

Not applicable — bkit has no database.
