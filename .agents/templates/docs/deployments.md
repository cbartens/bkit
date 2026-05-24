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

Bkit's shipped `ci.yml` recognises the tags below. Tags are case-sensitive, must be literal square-bracket form, and may appear anywhere in the source string. Tags compose freely — multiple tags on the same commit / PR title all fire independently.

**Where to put the tag — read carefully:**

- **Direct push to `dev` or `{{DEFAULT_BRANCH}}`** (no PR involved): tag goes in the **commit message**. Read from `github.event.head_commit.message`.
- **Push to a feature branch with an open PR** (or PR open / synchronize / edit): tag goes in the **PR title**. Read from `github.event.pull_request.title`. The commit message is NOT consulted — the workflow fires on `pull_request`, not `push`, for feature branches.
- **Both surfaces are checked** by `contains()` in the env block, so a marker in either location wins for its corresponding event. But you must pick the right one: putting `[verbose ci]` in a feature-branch commit message has no effect — only the PR title is read.
- **`workflow_dispatch`** (manual UI trigger): neither field is populated; tags don't apply. Use the workflow_dispatch input checkboxes if present.

<!-- prettier-ignore -->
| Tag | Effect | Scope |
| --- | --- | --- |
| `[force cache]` | Sets `TURBO_FORCE=1` for the run — turbo recomputes instead of replaying cache hits. Use when investigating suspected ghost-greens. | Read by `Detect Direct Push` step |
| `[force build]` | Exposes `should_force_build=true` step output for downstream deploy gates. Has no effect unless the consumer's deploy steps gate on it. | Read by `Detect Direct Push` step |
| `[force e2e]` | Exposes `should_run_e2e=true` step output. The `bkit-stub:e2e` block (when uncommented) runs E2E on this signal. | Read by `Detect Direct Push` step |
| `[verbose ci]` | Escalates log detail for one run: `TURBO_LOG_LEVEL=full`, `NODE_OPTIONS=--trace-warnings --trace-deprecation`, `DEBUG=vercel:*,supabase:*`, plus Playwright `--trace=on` (when E2E stub enabled). Use when `bkit-debug` diagnose returns thin evidence; never for routine pushes (trace.zip files are MB-scale). See `testing.md` for the full knob list and the `--reporter=line` hostile gap. | Read by `bkit:start verbose-ci-env` env block (top of `run-tests` job) |
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
| `full` | Push to `{{DEFAULT_BRANCH}}`; PR runs; or any commit with `[force build]` / `[force e2e]`. | Partial + deploy gate + (optional) Vercel preview await + E2E. | Smoke (runs as `workflow_run` after CI). |

Composition guidance:

- Treat `cache.outputs.skip` as the `none` gate — every step gates on `if: steps.cache.outputs.skip != 'true'`.
- Treat `steps.detect.outputs.should_force_build` / `should_run_e2e` as escalation flags into `full`.
- Treat the absence of a merged PR for a `dev` push (auto-set `TURBO_FORCE=1`) as the recovery signal — partial CI runs with cache busted.
- Smoke lives in a separate workflow (see `bkit-stub:smoke` in `ci.yml`) keyed to `workflow_run` so it does not block PR merges but still gates production observability.

## GitHub Actions pinning

Every `.github/workflows/*.yml` step using a third-party action MUST SHA-pin (40-character commit) and pair with an updater. Pinning without an updater is worse than not pinning — CVEs in pinned actions are never patched. bkit ships two opt-in paths (mutually exclusive): `pnpm bkit install --renovate` (recommended — phase-gated, monorepo-aware, lockfile maintenance) or `pnpm bkit install --dependabot` (alternative — first-party GitHub, no third-party trust surface, no App install). See `security.md` § Renovate activation and § Dependabot alternative for the trade-offs and step-by-step flow.

**Exemption — `bkit-cloud.yml`:** The bkit-canonical `bkit-cloud.yml` uses floating major-version tags (e.g. `actions/checkout@v4`, `anthropics/claude-code-action@v1`) rather than SHA pins. The bkit-shipped `renovate.json5` includes a packageRule with `matchFileNames: [".github/workflows/bkit-cloud.yml"]` + `enabled: false`, so consumer-side Renovate stays out of this file entirely. New SHAs/versions arrive via `bkit install` when consumers bump the bkit package, not via consumer Renovate. SHA-pinning applies to your own CI workflows (`ci.yml` and any custom workflows), not to `bkit-cloud.yml`.

<!-- bkit:end -->
