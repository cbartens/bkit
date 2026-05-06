Verdict: CONCERNS
Failures: 5

<!-- verdict:end -->

# Build Challenge

## Findings

All findings are LOW severity supply-chain / hygiene concerns. None block the v0.4.0 ship; all are addressable by remediate-loop or follow-up. The core distribution implementation correctly addresses BAR-138 success criteria, tests cover the structural invariants, and no CRITICAL or HIGH issues were identified.

### 1. LOW — Missing `concurrency` guard on release workflow

- **Location:** `.github/workflows/release.yml:1-12` (top-level keys)
- **Exploit / failure scenario:** A maintainer accidentally pushes the same tag twice in quick succession (or force-deletes and re-pushes a `pre.*` tag while a publish run is in flight) → two `release` runs race against the registry. The second `npm publish` fails ("cannot publish over existing version") so no silent overwrite, but you waste a runner, get a red-X notification, and the failure looks like a regression rather than a duplicate-tag artefact. Plan's Edge Cases table calls out the no-silent-overwrite behaviour but does not call out the wasted-run case.
- **Suggested fix:** Add a `concurrency` block at the workflow root:
  ```yaml
  concurrency:
    group: release-${{ github.ref }}
    cancel-in-progress: false
  ```
  `cancel-in-progress: false` is deliberate — you want the in-flight publish to finish, not be killed mid-`npm publish`.

### 2. LOW — Action references use floating major-version tags, not pinned commit SHAs

- **Location:** `.github/workflows/release.yml:16,18,26` (`actions/checkout@v4`, `actions/setup-node@v4`, `pnpm/action-setup@v4`)
- **Exploit scenario:** A compromised upstream action repo (or a malicious tag re-point on `@v4`) executes attacker code inside the publish job, which has `packages: write` on the `GITHUB_TOKEN`. Risk is low (these are widely-used official actions / well-known orgs) but supply-chain best practice for *publishing* workflows is SHA-pinning. OpenSSF Scorecard flags this; Dependabot can keep SHAs current.
- **Suggested fix:** Pin to commit SHAs with version comment, e.g. `uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1`. Consistency note: `.github/workflows/ci.yml` and the consumer template `.agents/templates/.github/workflows/ci.yml` use the same floating refs, so a fix here should propagate (or accept that this is project-wide style).

### 3. LOW — Published tarball includes test sources and snapshot files

- **Location:** `package.json:10-14` (`files: ["dist", ".agents", "README.md"]`)
- **Failure scenario:** The `.agents/` allowlist entry is recursive, so `npm publish` ships `.agents/scripts/bkit-modules.test.ts`, `.agents/scripts/release-workflow.test.ts`, `.agents/scripts/templates.test.ts`, and `.agents/scripts/__snapshots__/templates.test.ts.snap` to every consumer. No security leak (tests contain no credentials), but each consumer install carries dead bytes and the test files reference tooling (`vitest`) consumers don't have. If a consumer ever did `find node_modules/@cbartens/bkit -name "*.test.ts"` for any reason they'd see them.
- **Suggested fix:** Add `.npmignore` (or tighten `files`) to exclude `.agents/scripts/*.test.ts`, `.agents/scripts/__snapshots__/`, and `.agents/scripts/*.ts` source (only `dist/*.js` is needed at runtime; `.agents/templates/**` and `.agents/*.md` are the only `.agents/` payload runtime needs). Verify with `npm publish --dry-run` before tightening — a tightening that drops a path the runtime resolves via `getPkgRoot()` would break consumers.

### 4. LOW — `publishConfig.access: restricted` is silently ignored by GitHub Packages

- **Location:** `package.json:23-26`
- **Failure scenario:** A future maintainer reads `"access": "restricted"` and assumes GH Packages enforces it. GH Packages derives package visibility from the *linked repository's* visibility (private repo → private package), NOT from the npm `access` field. If `cbartens/bkit` repo is ever made public, the package becomes public regardless of `access: restricted`. The plan's Edge Cases row notes the ADR fallback to `access: public` if needed, so the maintainer is aware, but the field's no-op nature on GH Packages is not documented in code.
- **Suggested fix:** Add an inline comment in `package.json` is not feasible (no JSON comments), but ADR `DE-3` should explicitly note that on GH Packages the `access` field is informational and visibility tracks repo visibility. Confirm `cbartens/bkit` repo is private before the v0.4.0 production tag publishes.

### 5. LOW — Publish job has no `environment:` protection / required reviewer

- **Location:** `.github/workflows/release.yml:13-15` (`jobs.release`)
- **Failure scenario:** Anyone with `push` access to a tag matching `v*` can trigger an immediate `npm publish` to GH Packages with the auto-issued `GITHUB_TOKEN` carrying `packages: write`. For a single-maintainer project this matches the threat model; for a future multi-maintainer scenario it means a compromised contributor PAT (with tag-push permission) can publish without secondary approval. GH Packages cannot delete published versions — only deprecate — so a malicious publish is sticky.
- **Suggested fix:** When the project ever onboards a second maintainer, gate the publish step behind `environment: production` with required-reviewer protection in the GitHub repo settings. Not required for v0.4.0 ship.

## Out-of-scope checks performed (no findings)

- **Command injection in `checkBkitTokenSecret`** — `gh secret list --json name -q '.[].name'` is a static command string; `secretName` is consumed via `Array.includes`, not in the shell. Safe.
- **Token leak in print constants** — `GH_BKIT_TOKEN_MISSING_INSTRUCTIONS`, `GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS`, `VERCEL_AUTH_INSTRUCTIONS`, `CI_YML_MERGE_INSTRUCTIONS`: all use the literal `\${GH_BKIT_TOKEN}` env-interpolation form, never echo a real token, never embed `secrets.*` outside YAML examples. Safe.
- **NODE_AUTH_TOKEN handling** — `release.yml:51-52` uses the canonical `setup-node` + `NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` pattern. Token is masked, ephemeral, and scoped via `permissions: packages: write`. Safe.
- **Tag-trigger scope `'v*'`** — Glob is intentionally broad to cover `v0.4.0-pre.1`, `v0.4.0-pre.2`, `v0.4.0`, etc. Invalid versions (e.g. `vfoo`) would fail `npm publish` after running the full check suite — wasteful but not exploitable.
- **`access: restricted` quoting** — Both `'@cbartens'` (single-quoted) and `https://npm.pkg.github.com` (unquoted scalar) are valid YAML. Safe.
- **Test-file cwd dependency** — `release-workflow.test.ts:12` uses `path.resolve(".github/workflows/release.yml")`; Vitest runs from project root by convention. Same pattern as the existing `bkit-modules.test.ts`. Safe.
- **`pnpm/action-setup@v4` without `with: version:`** — Comments at `release.yml:24-25` and `.agents/templates/.github/workflows/ci.yml:19-20` correctly call out that `packageManager` field is the SoT. Safe.
- **Consumer template `GH_BKIT_TOKEN` env propagation** — `.agents/templates/.github/workflows/ci.yml:23-26` correctly attaches `env: GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}` only to the install step, not the whole job. Snapshot (`__snapshots__/templates.test.ts.snap`) is consistent with template source. Safe.
- **Test coverage for plan acceptance criteria** — All five Success Criteria items map to assertions in `bkit-modules.test.ts` (manifest + print constants), `release-workflow.test.ts` (workflow structural), or `templates.test.ts` (consumer template). Adequate.
- **Token interpolation `${GH_BKIT_TOKEN}` in `.npmrc` examples** — Print constants use backslash-escaped `\${GH_BKIT_TOKEN}` template-literal form so the rendered output preserves the literal `${...}` for pnpm's env interpolation. Verified at `bkit-modules.ts:559,617,663,708`. Safe.
