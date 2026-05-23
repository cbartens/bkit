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

**Pair with `.github/renovate.json5`.** SHA-pinning freezes the workflow on the pinned version — without an updater, CVEs in those actions stay un-patched indefinitely. `bkit install --ci` writes the canonical config (bkit-managed, auto-overwrite) — single source of truth is `.agents/templates/.github/renovate.json5`. The shipped config:

- Sets `baseBranches: ["dev"]` — bkit consumers gate `main` to PRs-from-`dev`-only, so Renovate PRs must land on `dev`. Mandatory; not optional.
- Runs weekly (`schedule: ["before 6am on Monday"]`) with grouped non-major bumps, lockfile maintenance, and `automerge: true` for devDependencies + patch updates.
- Enables `osvVulnerabilityAlerts: true` so CVE-driven PRs fire immediately regardless of schedule.
- For the `github-actions` ecosystem: `pinDigests: true` keeps every `uses:` line on a 40-character SHA + tag comment, refreshed on upstream releases and CVE disclosures.
- For bkit-managed workflow files (`bkit-ci-router.yml`): a packageRule with `matchFileNames` + `enabled: false` suppresses consumer-side bumps — new SHAs/versions arrive via `bkit install`, not consumer Renovate.

The Renovate GitHub App must be installed once per repo (one-click at https://github.com/apps/renovate — Mend Community Cloud, free). No `gh api` equivalent exists; this is the one manual step. Within ~5 minutes of install, Renovate opens an onboarding PR pointing at `.github/renovate.json5`; merge it and the first batch of grouped update PRs follows on the next scheduled run.

> **Why Renovate over Dependabot:** Renovate is monorepo-aware (one PR per dependency group, not one per package), supports lockfile maintenance, scopes bumps per file via `matchFileNames`, and respects `baseBranches` natively — no equivalent of Dependabot's silent-inert behaviour when the config sits anywhere other than the default branch. Renovate is Apache-2.0 OSS; the Mend Community Cloud App is a free hosted instance, self-hostable via `renovatebot/github-action` if you ever want to drop the Mend dependency.

Renovate PRs run with a restricted `GITHUB_TOKEN` and no access to `secrets.ANTHROPIC_API_KEY` / `secrets.LINEAR_API_KEY` — the `bkit-ci-router` will not dispatch on them by design.

### Manual CVE handling (when an alert fires)

Renovate's `osvVulnerabilityAlerts: true` opens CVE-driven PRs immediately against `dev`. If you also want to keep GitHub's Dependabot **alerts** on (Settings → Code security → Dependabot alerts), the Security tab continues to surface advisories — useful as a parallel signal, not required. Handle each alert against `dev`:

1. Read the alert — note `vulnerable_version_range` and `first_patched_version`. Check `pnpm why <pkg>` to see the import chain (direct vs transitive; dev vs prod scope).
2. **Direct dep**: bump in `package.json`, run `pnpm install` + `pnpm typecheck` + `pnpm test`.
3. **Transitive dep**: bump the parent that pins it (e.g. bump `vitest` to pull in a CVE-fixed `vite`). If the parent itself cannot upgrade, add a `pnpm.overrides` entry pinning the transitive to a fixed version — or add the transitive directly to `devDependencies` to force the resolution.
4. Open a PR against `dev` titled `fix(security): bump <pkg> >=<fixed-version> (CVE-XXXX-YYYY)`. After merge to `dev → main`, the alert auto-closes once GitHub re-scans the default branch.
5. If a CVE has no impact on your usage pattern (e.g. dev-server-only vuln in a build tool that you never run as a server), dismiss in the GitHub UI with the **"Vulnerable code is not actually used"** reason and a one-line justification. Don't dismiss without documenting why.

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
