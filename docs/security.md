<!-- bkit:start -->

<!-- bkit:managed v4.1.5 — do NOT edit; run `bkit upgrade` to refresh -->

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

Action SHA-pinning and the dependency-update pipeline — Renovate / Dependabot activation, private-registry read-auth, consumer customization (`renovate-local.json5`), and CVE handling — are CI/CD pipeline rules. Their canonical home is `deployments.md` § GitHub Actions pinning; this section keeps only the security-relevant invariant.

**Token isolation:** Renovate PRs run with a restricted `GITHUB_TOKEN` and have no access to `secrets.ANTHROPIC_API_KEY` / `secrets.LINEAR_API_KEY` — `bkit-auto` will not dispatch on them by design. A compromised or malicious dependency PR therefore cannot reach the agent's API credentials.

<!-- bkit:end -->

## Scope

bkit has no database, no server, no user-authentication surface. Security concerns: secrets management (tokens), supply-chain (action pinning), shell-injection guards, PII avoidance in logs.

## Secrets Management

### `GH_BKIT_TOKEN`

Sole credential bkit depends on. Must be a GitHub PAT with `read:packages` scope (classic) or `Packages: read` (fine-grained). Required at four surfaces — see `docs/deployments.md` for the full presence matrix.

- NEVER commit the token as a literal value anywhere. The committed `.npmrc` carries ONLY the registry mapping; the token goes into pnpm's user-level config via `pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN"` (not the project `.npmrc` — pnpm >=10.34.3 401s on a project-`.npmrc` env-substitution; see `docs/knowledge.md` KN-CORE-7).
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

## CI Auto-Route Trust (bkit-cloud)

**PR-body marker trust:** The `bkit-cloud.yml` SHARED-DERIV block parses `bkit:issue=#N` / `bkit:fid=X` from the PR body to resolve which issue's `bkit:auto` label to re-check (kill switch). The PR body is editable by anyone with triage/write on the PR — it is collaborator-trusted, not commit-signed. A collaborator who edits the PR body to point at a different issue could defeat the live kill switch for the original issue (if the replacement issue still carries `bkit:auto`). Mitigation: the `bkit [auto route]` commit marker (free tier) must still be present on HEAD; editing the PR body cannot forge a commit marker. The trust gap is collaborator-vs-collaborator only (not external), and the branch-derived FID fallback fires when body markers are absent. Future hardening: cross-check `bkit:issue` against `gh pr view --json closingIssuesReferences`.

## PII

bkit does not process, store, or transmit user PII. Log lines use the `[bkit-*]` prefix format per the naming convention. Never log consumer repo content verbatim in production output paths.

## RLS

Not applicable — bkit has no database.
