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

**Pair with `.github/renovate.json5`.** SHA-pinning freezes the workflow on the pinned version — without an updater, CVEs in those actions stay un-patched indefinitely. Renovate is opt-in via `pnpm bkit install --renovate` (phase-gated against the default branch — see § Renovate activation below). The canonical config (bkit-managed, auto-overwrite when opted in) lives at `.agents/templates/.github/renovate.json5`. The shipped config:

- Sets `baseBranches: ["dev"]` — bkit consumers gate `main` to PRs-from-`dev`-only, so Renovate PRs must land on `dev`. Mandatory; not optional.
- Runs weekly (`schedule: ["before 6am on Monday"]`) with grouped non-major bumps, lockfile maintenance, and `automerge: true` for devDependencies + patch updates.
- Enables `osvVulnerabilityAlerts: true` so CVE-driven PRs fire immediately regardless of schedule.
- For the `github-actions` ecosystem: `pinDigests: true` keeps every `uses:` line on a 40-character SHA + tag comment, refreshed on upstream releases and CVE disclosures.
- For bkit-managed workflow files (`bkit-ci-router.yml`): a packageRule with `matchFileNames` + `enabled: false` suppresses consumer-side bumps — new SHAs/versions arrive via `bkit install`, not consumer Renovate.

**Renovate activation (phase-gated).** Renovate is opt-in via `pnpm bkit install --renovate`. The Renovate App's first scan reads the default branch — installing the App before the config reaches `main` produces a broken onboarding PR (wrong base branch, ungrouped, redundant root `renovate.json`). bkit-install enforces the order via a two-phase flow:

1. **Phase A** (first run, config not yet on `origin/<default-branch>`): writes `.github/renovate.json5` to the working tree and prints a prompt to commit, open a PR to your integration branch, and merge through to the default branch. Do NOT install the Renovate App yet.
2. **Phase B** (re-run after merge to default branch): bkit detects the file on `origin/<default-branch>` and prints the App install URL https://github.com/apps/renovate (Mend Community Cloud, one-click, free — no `gh api` equivalent) plus the activation checklist (verify onboarding PR base branch, disable Dependabot version updates, merge onboarding PR). Within ~5 minutes of install, Renovate opens its onboarding PR; merge it and the first batch of grouped update PRs follows on the next scheduled run.

> **Why Renovate over Dependabot:** Renovate is monorepo-aware (one PR per dependency group, not one per package), supports lockfile maintenance, scopes bumps per file via `matchFileNames`, and respects `baseBranches` natively — no equivalent of Dependabot's silent-inert behaviour when the config sits anywhere other than the default branch. Renovate is Apache-2.0 OSS; the Mend Community Cloud App is a free hosted instance, self-hostable via `renovatebot/github-action` if you ever want to drop the Mend dependency.

Renovate PRs run with a restricted `GITHUB_TOKEN` and no access to `secrets.ANTHROPIC_API_KEY` / `secrets.LINEAR_API_KEY` — the `bkit-ci-router` will not dispatch on them by design.

### Dependabot alternative (opt-in, mutually exclusive with Renovate)

If you have specific reasons to prefer Dependabot — first-party GitHub feature, no third-party App install, no Mend dependency in the trust surface, no Phase A/B race — bkit ships a Dependabot module as an alternative. Run `pnpm bkit install --dependabot` (NOT `--renovate`; the two are mutually exclusive and bkit will refuse to install both).

Trade-offs to accept if you pick this path:

- **One PR per package, not per group** — Dependabot's `groups:` support is newer and weaker than Renovate's. Expect more PR volume per scheduled run.
- **Per-workspace coverage is manual** — bkit's shipped `dependabot.yml` ships the `github-actions` ecosystem enabled and `npm` commented out. For pnpm monorepos with explicit per-workspace coverage, you'll edit the file to add `directories: ["/", "/apps/*", "/packages/*"]` (Dependabot v2.1+) or stamp out one `package-ecosystem: npm` block per path.
- **No lockfile maintenance** — Renovate's weekly `lockFileMaintenance` job refreshes transitive deps; Dependabot has no equivalent.
- **No `osvVulnerabilityAlerts: true` analogue in the config** — CVE-driven PRs come from GitHub's security advisory pipeline (enabled via the helper script's `automated-security-fixes` toggle, not the YAML).

The bkit-shipped `scripts/ci/bkit-set-dependabot.sh` handles the repo-level setup that `.github/dependabot.yml` alone does not (auto-fixes-enabled, vulnerability-alerts, never-auto-merge-on-main policy). Run once after install:

    bash scripts/ci/bkit-set-dependabot.sh        # apply (idempotent)
    bash scripts/ci/bkit-set-dependabot.sh --dry-run    # preview
    bash scripts/ci/bkit-set-dependabot.sh --print      # inspect current state

The script is Tier 1 canonical — bkit owns it; consumers do not edit. New policy changes ship via `bkit install --dependabot`. See issue #109 for the original design.

### Manual CVE handling (when an alert fires)

Renovate's `osvVulnerabilityAlerts: true` opens CVE-driven PRs immediately against `dev`. If you also want to keep GitHub's Dependabot **alerts** on (Settings → Code security → Dependabot alerts), the Security tab continues to surface advisories — useful as a parallel signal, not required. Handle each alert against `dev`:

1. Read the alert — note `vulnerable_version_range` and `first_patched_version`. Check `pnpm why <pkg>` to see the import chain (direct vs transitive; dev vs prod scope).
2. **Direct dep**: bump in `package.json`, run `pnpm install` + `pnpm typecheck` + `pnpm test`.
3. **Transitive dep**: bump the parent that pins it (e.g. bump `vitest` to pull in a CVE-fixed `vite`). If the parent itself cannot upgrade, add a `pnpm.overrides` entry pinning the transitive to a fixed version — or add the transitive directly to `devDependencies` to force the resolution.
4. Open a PR against `dev` titled `fix(security): bump <pkg> >=<fixed-version> (CVE-XXXX-YYYY)`. After merge to `dev → main`, the alert auto-closes once GitHub re-scans the default branch.
5. If a CVE has no impact on your usage pattern (e.g. dev-server-only vuln in a build tool that you never run as a server), dismiss in the GitHub UI with the **"Vulnerable code is not actually used"** reason and a one-line justification. Don't dismiss without documenting why.

<!-- bkit:end -->
