<!-- bkit:start -->

# Deployments

> [!CAUTION]
> **Purpose:** Deployment / environment config / CI/CD pipeline rules — secrets sync, branch protection, run-level tiers.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Pre-push runs the project's gate set locally (see "Pre-push checklist" below); never `--no-verify`.

## Production rollback runbook

> Triggered when a bad commit reaches `main` (production) and must be unwound to a prior known-good SHA. Vercel deployments are assumed; adjust the deploy-side step for other hosting.

### Preconditions

- A known-good SHA on `main` to roll back to. Confirm via `gh run list --branch main --status success --limit 5` (must include the target SHA in green state).
- Local repo on `main`, working tree clean, `gh auth status` green.
- `jq` installed (`brew install jq` / system package manager).

### Playbook

1. **Save current protection JSON** so it can be restored verbatim. The GET and PUT shapes differ; capturing the raw GET response avoids hand-mapping fields.
   ```bash
   gh api repos/{OWNER}/{REPO}/branches/main/protection > /tmp/main-protection.json
   ```
2. **Disable protection** so the force-reset is accepted.
   ```bash
   gh api -X DELETE repos/{OWNER}/{REPO}/branches/main/protection
   ```
3. **Force-reset the `main` ref** to the known-good SHA.
   ```bash
   gh api -X PATCH repos/{OWNER}/{REPO}/git/refs/heads/main -f sha=<green-sha> -F force=true
   ```
4. **Restore protection** from the saved JSON. Note the GET → PUT shape mismatch: required-status-checks → required_status_checks, contexts list, etc. Inspect the saved JSON and PUT the equivalent shape.
   ```bash
   gh api -X PUT repos/{OWNER}/{REPO}/branches/main/protection --input /tmp/main-protection.json
   ```
5. **Re-point the production deployment** (Vercel does NOT auto-rollback on git ref rewrites — the deployment alias remains on the most-recently-pushed deployment until manually promoted). Look up the prior good deployment by commit SHA and promote it:
   ```bash
   vercel ls --meta githubCommitSha=<green-sha>
   vercel promote <prior-deployment-url>
   ```
   Without this step the git ref is rolled back but production traffic still serves the bad build.

### Why force-push on `main` alone is not enough

- `git revert` of a cross-branch squash (e.g. a `feat/*` branch that landed directly on `main` instead of `dev`) can delete files that surviving code in `main` still references. The result is a tree that fails CI even though git history is "clean".
- The `feat/*`-onto-`main` path is the root cause that makes recovery destructive; production merges MUST come from `dev` to keep the squash diff scoped to a single feature.
- The pre-push hook is bypassed on `revert-*` branches (test suite skipped — only typecheck + format:check run) so a revert PR can be pushed even when its source state is transitionally inconsistent.

### Post-rollback verification

- `gh api repos/{OWNER}/{REPO}/git/refs/heads/main --jq .object.sha` must equal the green SHA.
- `curl -sI https://{prod-alias}` headers report the rolled-back deployment id.
- Run the production smoke suite to confirm the rolled-back app behaves as expected.

## Dev rollback runbook

> Triggered when a bad commit reaches `dev` and must be unwound to a prior known-good SHA. Use when the rolled-out range included applied migrations — code rollback alone leaves the linked dev DB ahead of the code, and schema-aware tests (cdc-schema, schema-introspection, RLS-aware integration) fail on the otherwise-clean tree. Supabase is assumed; adjust the DB step for other providers.

### Preconditions

- A known-good SHA on `dev` to roll back to. Confirm via `gh run list --branch dev --status success --limit 5` (must include the target SHA in green state).
- Local repo on `dev`, working tree clean, `gh auth status` green.
- `supabase` CLI installed and linked to the dev project (`supabase link --project-ref <dev-ref>`).
- Service-role connection string for the dev DB available in the local env (`SUPABASE_DB_URL` or equivalent).

### Playbook

1. **Force-reset the `dev` ref** to the known-good SHA. `dev` is typically unprotected; if protection is on, follow the production-rollback save/disable/restore pattern.
   ```bash
   git reset --hard <green-sha>
   git push --force-with-lease origin dev
   ```
2. **Reset the linked dev DB.** Drop all consumer-managed schemas with `CASCADE`, truncate the migrations ledger, then replay the surviving migration files. Substitute schema names for the consumer's actual managed set.
   ```bash
   psql "$SUPABASE_DB_URL" -c 'DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS stripe CASCADE;'
   psql "$SUPABASE_DB_URL" -c 'TRUNCATE supabase_migrations.schema_migrations;'
   supabase db push --linked --include-all
   ```
3. **Re-seed fixtures** (if the consumer runs a seed script on dev).
   ```bash
   pnpm db:seed
   ```
4. **Re-trigger CI** on the rolled-back `dev` ref to confirm the green-on-rollback baseline.
   ```bash
   git commit --allow-empty -m "chore: trigger CI after dev rollback"
   git push origin dev
   ```

### Why code-only rollback is not enough

- `git reset` rewinds the source tree; Supabase migrations applied during the rolled-out range remain materialised. The DB has no "unapply" semantics for code-driven migrations.
- Any test that introspects the live schema (column lists, RLS policies, table presence) sees structure the code no longer declares and flags the drift as a failure.
- Re-running `supabase db push --linked --include-all` after truncating the ledger reapplies only the migrations present in the rolled-back tree — bringing the DB back into alignment with the code.

### Post-rollback verification

- `git rev-parse origin/dev` must equal the green SHA.
- `psql "$SUPABASE_DB_URL" -c 'SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;'` must match `ls supabase/migrations/` on the rolled-back tree.
- Re-run the schema-aware test suite (`pnpm test:integration` or the consumer's equivalent) to confirm DB and code agree.

## Commit-message force tags

Bkit's shipped `ci.yml` recognises the tags below in commit messages (push events) and PR titles (pull_request events). Tags are case-sensitive, must be literal square-bracket form, and may appear anywhere in the message.

<!-- prettier-ignore -->
| Tag | Effect | Scope |
| --- | --- | --- |
| `[force cache]` | Sets `TURBO_FORCE=1` for the run — turbo recomputes instead of replaying cache hits. Use when investigating suspected ghost-greens. | Read by `Detect Direct Push` step |
| `[force build]` | Exposes `should_force_build=true` step output for downstream deploy gates. Has no effect unless the consumer's deploy steps gate on it. | Read by `Detect Direct Push` step |
| `[force e2e]` | Exposes `should_run_e2e=true` step output. The `bkit-stub:e2e` block (when uncommented) runs E2E on this signal. | Read by `Detect Direct Push` step |
| `[skip ci]` / `[skip actions]` | Honoured natively by GitHub Actions — suppresses workflow dispatch entirely. Use sparingly: the suppressed run will not appear in `gh run list`, and downstream `workflow_run` triggers will not fire. | Native GitHub behaviour, not a bkit-level toggle |
| `[skip build]` | Consumer-defined: bkit does not interpret this tag in `ci.yml`. Consumers wiring it into deploy steps add the gate themselves. | Consumer-controlled |

Direct push to `dev` (no merged PR ancestry) auto-sets `TURBO_FORCE=1` regardless of tags. See `bkit-debug` runbook for the cache-bust rationale.

## Run-level decision matrix

Bkit's shipped `ci.yml` ships _primitives_ (cache check, direct-push detect, tag parsing, integration gate) and does not impose a fixed run-level tier system. Consumers composing tiers on top should align with the table below — it defines a `none` / `partial` / `full` shape that bkit's force tags + auto-detection plug into cleanly.

<!-- prettier-ignore -->
| Run level | When | Runs | Defers |
| --- | --- | --- | --- |
| `none` | HEAD has `[skip ci]` / `[skip actions]`; or `cache.outputs.skip == 'true'` (SHA passed in last 7 days). | Nothing (workflow skipped entirely or short-circuited after the cache check). | All gates |
| `partial` | Push to `dev` from a merged PR; routine chore commits without `[force build]`. | Typecheck, unit tests, integration tests, format check, prose + slop lint, bkit check. | Deploy, smoke, E2E. |
| `full` | Push to `main`; PR runs; or any commit with `[force build]` / `[force e2e]`. | Partial + deploy gate + (optional) Vercel preview await + E2E. | Smoke (runs as `workflow_run` after CI). |

Composition guidance:

- Treat `cache.outputs.skip` as the `none` gate — every step gates on `if: steps.cache.outputs.skip != 'true'`.
- Treat `steps.detect.outputs.should_force_build` / `should_run_e2e` as escalation flags into `full`.
- Treat the absence of a merged PR for a `dev` push (auto-set `TURBO_FORCE=1`) as the recovery signal — partial CI runs with cache busted.
- Smoke lives in a separate workflow (see `bkit-stub:smoke` in `ci.yml`) keyed to `workflow_run` so it does not block PR merges but still gates production observability.

<!-- bkit:end -->

## Project

### `GH_BKIT_TOKEN` — four-surface presence matrix

`GH_BKIT_TOKEN` is required at four surfaces; missing any one breaks an install or CI run. Detector coverage in `bkit install` Phase 3 mirrors this matrix.

<!-- prettier-ignore -->
| Surface | Where to set | Symptom if missing | bkit detector |
| --- | --- | --- | --- |
| Local shell | `~/.zshrc` / `~/.bashrc` → `export GH_BKIT_TOKEN=<classic PAT>` | `pnpm install` 401 against `npm.pkg.github.com` (sometimes opaque against `npmjs.org` — see KN-1) | `detectShellToken` (Phase 3) |
| `.npmrc` | `//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}` (env-var ref, **never** literal) plus `@cbartens:registry=https://npm.pkg.github.com` | Same 401, more opaque (pnpm v7.20+ silently ignores entire `.npmrc` — see KN-1) | `detectNpmrcAuth` (Phase 3) |
| GitHub Actions secret | `gh secret set GH_BKIT_TOKEN --body=$GH_BKIT_TOKEN` AND `env: { GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }} }` on every install step | CI 401 on `@cbartens/bkit` fetch on next push | `detectGhSecret` + `detectCiYmlMissingTokenEnv` (Phase 3, blocker when `.npmrc` references `${GH_BKIT_TOKEN}`) |
| Vercel env (preview + production) | `vercel env add GH_BKIT_TOKEN preview` and `vercel env add GH_BKIT_TOKEN production` | Vercel preview / production deploy 401 — Vercel runs `pnpm install` in a separate container, no GH-secret inheritance | `detectVercelEnv("preview" \ | "production")` (Phase 3) |

Token must be a GitHub PAT with `read:packages` scope (classic) or `Packages: read` permission (fine-grained). Generate at <https://github.com/settings/tokens>.

### Pre-push checklist

Every push to a feature branch must pass the same gates CI runs. The husky pre-push hook (`.husky/pre-push`) enforces them mechanically — running `--no-verify` is a violation. Order matches `.github/workflows/ci.yml`'s `run-tests` job:

<!-- prettier-ignore -->
| # | Gate | Command | Hook block | Failure mode |
| --- | --- | --- | --- | --- |
| 1 | Typecheck | `pnpm typecheck` | bkit-managed | TS error → fix source. |
| 2 | Unit + integration tests | `pnpm test` | bkit-managed | Test failure → fix code, never delete the test. |
| 3 | Prettier format check | `pnpm format:check` | bkit-managed | Unformatted file → run `pnpm exec prettier --write <path>` (or `pnpm format`) and re-stage. Mirrors CI step "Run Prettier Format Check"; without this gate, formatting failures only surface in CI after push. |
| 4 | bkit self-check | `pnpm bkit check` | source-repo only (outside bkit:start..bkit:end) | Drift detected (writes > 0) → run `pnpm bkit install` and commit the result. Advisories alone don't fail; only writes do. Consumers do not have this gate. |
| 5 | Dist freshness | `pnpm check:dist` | source-repo only (outside bkit:start..bkit:end so `bkit install` does not strip it) | dist drift → run `pnpm build` and commit `dist/`. Consumers do not have this gate. |

**Revert-branch bypass (BAR-170):** on branches named `revert-*` or whose HEAD commit subject starts with `Revert "`, the pre-push hook skips `pnpm test` and runs only `pnpm typecheck && pnpm format:check`. Rationale: rollback source trees are intentionally inconsistent — surviving tests can reference deleted files, blocking a legitimate recovery push. Gates 4 and 5 (`pnpm bkit check`, `pnpm check:dist`) still run. Non-revert branches always run all five gates.

Pre-commit (`.husky/pre-commit`) runs `pnpm lint:prose && pnpm lint:slop` — those gates fire earlier in the cycle, not at push time. CI runs them again as steps 4 + 5 of the `run-tests` job for belt-and-braces.

When a gate fails locally, fix the cause and re-stage; do NOT bypass with `--no-verify` and do NOT amend over a failed hook (see auto-memory: "skip-ci commits must not be HEAD when PR is created"). If the gate is genuinely broken (e.g. flaky external call), STOP and document the blocker — do not push.

### `dist/` commit policy

Source-repo only. Any TypeScript change under `.agents/scripts/*.ts` MUST be accompanied by `pnpm build && git add dist/` in the same commit.

- Pre-commit and pre-push hooks run `typecheck` + `test` only — they do NOT run `pnpm build`. Run `pnpm build` manually (or `pnpm check:dist` to validate without committing) before pushing any TS source change.
- CI's `run-tests` job has a "Verify Dist Freshness" step (`pnpm check:dist` → `rm -rf dist && tsc && git diff --exit-code dist/`) that fails the build if shipped artefacts drift from source. Lives only at `.github/workflows/ci.yml` (this repo).
- Consumer repos install the published tarball and never recompile, so the consumer `ci.yml` template at `.agents/templates/.github/workflows/ci.yml` deliberately omits the freshness step. Do not add it there.
- See KN-7 for failure-mode and recurrence history.

### `.husky/pre-push` mirror-drift gate (bkit repo only)

The bkit repo's `.husky/pre-push` runs `pnpm bkit check` AFTER the templated `# bkit:end` marker, guarded by `set -e` above `# bkit:start`. Failing exit aborts the push when `.agents/*` was edited without `bkit install` regenerating `.claude/*` / `.cursor/*` / `.husky/*` mirrors.

- Lives **outside** the bkit:start/end block so markered-text re-install preserves it AND it does not leak into consumer repos via `.agents/templates/.husky/pre-push`.
- Consumers don't get this gate — they don't typically edit `.agents/*` source, so adding it to the template is pure ~1s push overhead with no detected pain.
- Fix on failure: run `pnpm bkit install`, stage the regenerated `.claude/*` / `.cursor/*` / `.husky/*` files, commit, push. `--no-verify` remains PROHIBITED per the universal pre-push rule.

### CI trigger on final workflow push

GitHub Actions suppresses both `pull_request` and `push` workflow runs when the HEAD commit message contains `[skip ci]` (or `[skip actions]`). When that happens on a PR branch, `gh pr view --json statusCheckRollup` returns empty — downstream fail-fast gates that check rollup status will admit a vacuously green PR.

**Rule:** every workflow's last push to a CI-validated ref MUST leave HEAD without `[skip ci]`.

<!-- prettier-ignore -->
| Surface | Mechanic |
| --- | --- |
| build / debug PR push (final) | Final commit `chore({FID}): close-workflow status trigger CI` — drops `[skip build] [skip ci]` from the existing close-workflow status commit. Push happens at end of close-workflow step. |
| ship squash merge | `gh pr merge --squash --body ""` — empty body strips `[skip ci]` from the squash subject so `dev`'s merge HEAD is clean. Followed by post-merge `gh run list --branch dev --limit 5` gate that captures `RUN_ID` and fails if no run registered within 60s of the push. |

All other docs-only intermediate commits (start-workflow, summary, create-pr, install-skills, switch-to-dev, update-docs, archive, worktree-cleanup) retain `[skip build] [skip ci]` to save CI minutes. Only the trailing `close-workflow status trigger CI` commit (build/debug) and the squash-merge subject (ship) are unmarked.

### Manual CI trigger on feat branches (`workflow_dispatch`)

`ci.yml` includes `workflow_dispatch:` with no inputs. CI only auto-fires on push to `main`/`dev` or on a PR targeting those branches — feat branches without an open PR (or with a conflicted PR) produce no automatic run.

**To trigger CI manually on a feat branch:**

```bash
gh workflow run ci.yml --ref feat/{FID}
# then watch:
gh run list --branch feat/{FID} --limit 3
```

Or use the GitHub Actions tab → "CI" → "Run workflow" → select the branch.

This mirrors the same workflow_dispatch + branch-select pattern used in bkit consumer repos.

### `bkit install` three-phase contract

bkit's installer runs in three phases:

1. **Phase 1 — Preflight (read-only).** Runs blocker + advisory detectors. Blockers exit 1 before any writes (e.g. malformed `package.json`, no git repo). Advisories accumulate in `ctx.advisories`. Note: `detectHooksConfigOverwriteRisk` was removed in v0.8.0 — deep-containment merge guarantees consumer-key survival without a preflight gate (see KN-8, DE-8).
2. **Phase 2 — Install (writes — staged).** Module dispatch writes to `.bkit-staging/<module>/` (v0.9.0+). Modules append further structured advisories to `ctx.advisories`. On any error before commit, `discardAllStaging` removes staging dirs — consumer files left byte-identical to pre-install state (see KN-12, DE-9).
3. **Phase 3 — Post-install (re-detect + commit).** Re-runs token-surface, `ci.yml`, vale-sync, devDeps detectors after writes. Cross-phase dedupe: Phase 3 wins on id conflict. Skipped in `bkit check` (dry-run) — only Phase 1 advisories render. See KN-4. **Phase 3 blockers exit 1** (v0.7.0+) with a single-line recovery command (`pnpm bkit uninstall <flags> && <fix> && pnpm bkit install <flags>`); pass `--auto-revert` to in-process invoke `runUninstall` before exit.

`pnpm bkit install` always runs all three phases. `pnpm bkit check` runs only Phase 1; if any drift is detected, exits 1 with Phase 1 advisories rendered. `pnpm bkit doctor` (v0.6.0+) runs Phase 1 + Phase 3 detection without writing — read-only diagnostic. `pnpm bkit upgrade` (v0.9.0+) compares old vs new template content against `canonicalHashes` to detect consumer drift; non-conflicting changes apply automatically, conflicts emit to stderr (`--non-interactive` exits non-zero on any conflict).

### Consumer CI auth — env-var pattern (canonical)

Consumer CI workflows authenticate `@cbartens/bkit` via the `GH_BKIT_TOKEN` env var on the `pnpm install` step. The consumer's `.npmrc` (`//npm.pkg.github.com/:_authToken=${GH_BKIT_TOKEN}`) picks it up at registry-resolution time. No composite action, no cross-org `uses:` reference — `bkit` stays private without affecting any consumer's auth context. See README §"Adding a new consumer — checklist" and §"Consumer CI auth" for the consumer-side detail; the canonical `ci.yml` template at `.agents/templates/.github/workflows/ci.yml` is the authoritative source for the install-step shape (BAR-164).

### Sliding major-version tag

`.github/workflows/release.yml` re-points the `v{N}` tag (e.g. `v1`) at the freshly-published `v{N}.x.y` immutable tag on every successful release. Matches the GitHub Actions community convention used by `actions/checkout@v4`, `actions/setup-node@v4`, etc. Reference: [actions/toolkit § action-versioning](https://github.com/actions/toolkit/blob/main/docs/action-versioning.md).

**Consumer contract:**

<!-- prettier-ignore -->
| Pin form | Behaviour | Use when |
| --- | --- | --- |
| `@v1` (sliding) | Auto-receives non-breaking `v1.x.y` patches | DEFAULT — every consumer should use this |
| `@v1.0.2` (immutable) | Frozen on a specific patch | Reproducibility-critical pipelines, or temporary unblock if `v1` is broken |
| `@<sha>` | Frozen on a specific commit | High-security supply-chain contexts only |

Breaking changes ship as `v2.0.0` and the workflow auto-creates a separate `v2` sliding tag — `v1` consumers stay on `v1.x.y` until they explicitly opt in.

**Mechanics:**

- Workflow step "Update sliding major-version tag" runs after `npm publish` succeeds, so a failed publish never advances `v{N}`.
- Major number extracted from `github.ref_name` via `sed -E 's/^v([0-9]+)\..*/\1/'`, so `v1.0.3` → `v1`, `v2.4.0` → `v2`. No hard-coded major.
- Prerelease tags (any tag containing `-`, e.g. `v1.0.3-rc.1`) are skipped — sliding tags only advance on stable releases.
- Requires `permissions: contents: write` at the workflow level (set in `release.yml`); the default `GITHUB_TOKEN` is sufficient — no PAT needed.
- Bootstrap: the first `v{N}.x.y` release after this workflow ships creates `v{N}` automatically. No manual `git tag -a v1` step required.
