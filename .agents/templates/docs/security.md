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

**Pair with `.github/dependabot.yml`.** SHA-pinning freezes the workflow on the pinned version — without an updater, CVEs in those actions stay un-patched indefinitely. `bkit install --ci` seeds the canonical config (Tier 3 seed-or-print) — single source of truth is `.agents/templates/.github/dependabot.yml`. Minimum shape:

```yaml
version: 2
updates:
  - package-ecosystem: github-actions
    directory: /
    target-branch: dev
    schedule:
      interval: weekly
    commit-message:
      prefix: "chore(deps)"
      include: scope
```

`target-branch: dev` is **mandatory**, not optional — bkit consumers gate `main` to PRs-from-dev-only, so Dependabot PRs without it hit `main` and are rejected by branch protection, silently breaking the update flow.

> **Important:** GitHub reads `.github/dependabot.yml` ONLY from the default branch (typically `main`). The config must be merged all the way through `dev → main` before any PR fires. A new config on a feature branch or sitting on `dev` alone is silently inert — no PRs will open. Verify under repo **Insights → Dependency graph → Dependabot** that the config is recognised after pushing to `main`.

Dependabot scans every `uses:` line in `.github/workflows/*.yml` weekly and opens one PR per outdated action with release notes attached; CVE-driven PRs fire immediately regardless of schedule. Dependabot PRs run with a restricted `GITHUB_TOKEN` and no access to `secrets.ANTHROPIC_API_KEY` / `secrets.LINEAR_API_KEY` — the `bkit-ci-router` will not dispatch on them by design.

<!-- bkit:end -->
