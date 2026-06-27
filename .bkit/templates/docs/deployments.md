<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

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
- On `revert-*` branches the pre-push hook skips only the **test suite** — typecheck, format:check, prose, slop:delta and the bkit drift gate still run — so a revert PR can be pushed even when its source state is transitionally inconsistent.

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
| `[force build]` | The lighter hammer. Exposes `should_force_build=true` + `run_level=full`; does **not** bypass `web_affected`, so no integration / e2e / @live unless web is genuinely affected. Rebuild without paying @live's side effects. No effect unless the consumer's deploy steps gate on the output. | Read by `Detect Direct Push` step |
| `[force full]` | The hammer. Exposes `should_run_full=true` → `run_level=full` **and** bypasses `web_affected` (the `bkit-stub:e2e` / integration / `bkit-tests-live` blocks run on **any** commit, incl. docs-only / empty), greening the non-hollow capstone (the forced lanes must genuinely run). On a PR it upgrades the local e2e lane to the full suite; `@live` stays **push-only** (reached on a docs-only/empty `[force full]` push via the effective `web_affected`, never off a PR / dispatch — real LLM + email side effects). Replaces the removed `[force e2e]` / `[force live]`. | Read by `Detect Direct Push` step |
| `[verbose ci]` | Escalates log detail for one run: `TURBO_LOG_LEVEL=full`, `NODE_OPTIONS=--trace-warnings --trace-deprecation`, `DEBUG=vercel:*,supabase:*`, plus Playwright `--trace=on` (when E2E stub enabled). Use when `bkit-debug` diagnose returns thin evidence; never for routine pushes (trace.zip files are MB-scale). See `testing.md` for the full knob list and the `--reporter=line` hostile gap. | Read by `bkit:start verbose-ci-env` env block (top of `bkit-tests` job) |
| `[skip ci]` / `[skip actions]` | Honoured natively by GitHub Actions — suppresses workflow dispatch entirely. Use sparingly: the suppressed run will not appear in `gh run list`, and downstream `workflow_run` triggers will not fire. | Native GitHub behaviour, not a bkit-level toggle |

**Two deploy-forcing markers only (#291): `[force build]` + `[force full]`.** The granular `[force e2e]` / `[force live]` were removed — they were silent no-ops on an unchanged tree (named "force" but gated behind `web_affected`). `[force full]` is the single gate-bypass: it means "validate everything," so one effective `web_affected` drives integration + e2e + @live uniformly.

- **Precedence — `[skip ci]` / `[skip actions]` is a hard veto over any force marker.** A push commit carrying `[skip ci]` is never dispatched as a workflow run (native GitHub suppression, before any `ci.yml` code) — no force marker can un-suppress it. To validate a would-be-skipped commit, drop the `[skip ci]` and push with `[force full]`.
- **`[force cache]` is orthogonal** — it busts turbo _replay_ (`TURBO_FORCE=1`), a different axis from _which lanes run_. Never folded into `[force full]`. Combine `[force full] [force cache]` for "everything, fresh."
- **Marker parity (deploy-forcing set).** The e2e / @live lanes resolve a per-SHA deployment, so any marker that force-runs them must **also** force the host build, or the lane force-runs then dies at "resolve deployment URL" — worse than skipping. If you wire a host build-cancel script (e.g. Vercel `ignoreCommand`), it MUST honor **both** `[force build]` and `[force full]`; assert it in CI (a `grep -qF` guard over the cancel script). `[force cache]` / `[verbose ci]` / `[skip ci]` are test-plane-only and intentionally NOT honored by the cancel script.

Direct push to `dev` (no merged PR ancestry) auto-sets `TURBO_FORCE=1` regardless of tags. See `bkit-debug` runbook for the cache-bust rationale.

## Run-level decision matrix

Bkit ships a 4-job scaffold — `bkit-decide` (always-on; reads markers, computes `run_level`, emits the `bkit-test-plan` JSON contract) → `bkit-tests` → `bkit-tests-live` → `bkit-tests-check` (the always-on capstone that asserts every tier the plan _expected_ actually ran and passed). An optional `bkit-tests-migrate` sibling (DB repos) runs in parallel with `bkit-tests` — proving every migration replays from an empty database + the seed loads on a fresh instance — and folds into the capstone's `needs:`; it always runs but self-skips the heavy steps when no migration/seed source changed (`bkit-stub:bkit-tests-migrate` in the scaffold reference). The single-job starter `ci.yml` ships the primitives (cache check, marker parsing, direct-push detect, integration gate); the **FULL CI SCAFFOLD REFERENCE** at the end of `.github/workflows/ci.yml` reproduces every step, in execution order, for adopting the tiers. The table below defines the `none` / `partial` / `full` shape those primitives + the plan plug into.

<!-- prettier-ignore -->
| Run level | When | Runs | Defers |
| --- | --- | --- | --- |
| `none` | HEAD has `[skip ci]` / `[skip actions]`; or `cache.outputs.skip == 'true'` (SHA passed in last 7 days). | Nothing (workflow skipped entirely or short-circuited after the cache check). | All gates |
| `partial` | Push to `dev` from a merged PR; routine chore commits without `[force build]`. | Typecheck, unit tests, integration tests, format check, prose + slop lint, bkit check. | Deploy, smoke, E2E. |
| `full` | Push to `{{DEFAULT_BRANCH}}`; PR runs; or any commit with `[force build]` / `[force full]`. | Partial + deploy gate + (optional) Vercel preview await + E2E. | Smoke (runs as `workflow_run` after CI). |

Composition guidance:

- Treat `cache.outputs.skip` as the `none` gate — every step gates on `if: steps.cache.outputs.skip != 'true'`.
- Treat `steps.detect.outputs.should_force_build` / `should_run_full` as escalation flags into `full`.
- Treat the absence of a merged PR for a `dev` push (auto-set `TURBO_FORCE=1`) as the recovery signal — partial CI runs with cache busted.
- Smoke lives in a separate workflow (see `bkit-stub:smoke` in `ci.yml`) keyed to `workflow_run` so it does not block PR merges but still gates production observability.
- The capstone `bkit-tests-check` is the SOLE branch-protection required check (apply via `.bkit/scripts/bkit-protect-main.sh`). Green there means the tiers the plan _expected_ actually ran and passed — `green == validated`, not merely "the tests job did not fail". A light / cached / partial run is green by construction, so confirm a `full` run before treating green as validation.

### Parallel test lanes (scaling `bkit-tests`)

`bkit-tests` is one job, so its tiers run **serially** — wall-clock is the **sum** of steps. On a monorepo where that dominates, split it into parallel sibling lanes (`bkit-tests-static` / `-unit` / `-integration` / `-e2e`) so wall-clock becomes `max(lane)` not the sum. Cost: each lane re-runs setup (checkout / install) and any shared infra (e.g. a local DB), so setup duplicates per lane — mitigate with the turbo remote cache + a DB service container. The capstone then `needs:` **all** lanes, and **each** lane emits its own executed-count output for the non-hollow assertion (see `testing.md` § Validated means executed). Keep the single-job form until serial CI time actually hurts — the split adds runner cost + wiring. For the E2E lane's PR-subset tiering and local-vs-preview DB routing, see `testing.md` § "E2E on PRs".

### Promotion-lag warning (`Check Main Lags Dev`)

CI on `dev` proves the code is good; nothing otherwise checks that good code ever reached the default branch. That gap bites because several surfaces are read LIVE from the default branch, not from `dev` and not from the validated tip:

- **Renovate** resolves its config only from the default branch (see § Customizing Renovate). A `renovate.json5` edit on `dev` is inert until promoted — `useBaseBranchConfig: "merge"` softens this for the config file but is itself read from the default branch.
- **Scheduled / default-branch-triggered Actions** run the default-branch copy of each workflow, so a `.github/workflows/` fix on `dev` does not take effect on those runs until promoted.
- **The published package / production deploy** are cut from the default branch, so unpromoted `dev` work is invisible to consumers.

The `Check Main Lags Dev` step (in `bkit-tests`) closes that blind spot: on every push to `dev` it diffs `renovate.json5`, `renovate.json`, and `.github/workflows/**` between the default branch and `dev`, and if any differ it emits a `::warning::` plus a `$GITHUB_STEP_SUMMARY` block naming the stale files and how far the default branch lags. It is **non-blocking** (a nudge — those surfaces may legitimately sit on `dev` between releases) and keys ONLY on those consumed-from-default-branch surfaces, so ordinary app-code `dev` pushes stay quiet. Clear it by opening a `dev` → default-branch PR.

The step reads the default branch from the Actions context at runtime, so it is identical for every repo. It ships as the bkit-managed `main-lag-warning` block (between `# bkit:start main-lag-warning` / `# bkit:end main-lag-warning`): `bkit check` raises a non-blocking `tier2-text-drift` advisory if that block is **missing or drifted** — so adoption is nudged everywhere; keep it in sync from the template and do not hand-edit. It is safe to keep in any repo even if you do not gate the default branch behind `dev`: it only runs on `dev` pushes and self-skips when the default branch is `dev`/unset, so it never fires where the flow does not apply.

## Smoke trigger plumbing

Smoke runs **after** deploy, in its own workflow, off the merge gate (what it actually probes → `testing.md` § Smoke). Pick the trigger by **where the deploy happens**, not by habit:

- **Deploy happens inside CI** → key smoke to **`workflow_run`** (the CI workflow `completed` + `conclusion == 'success'`). Mind the 3-level `workflow_run` chain cap — a fourth chained workflow will not fire.
- **An external platform deploys after merge** (Vercel / Netlify-style Git integration) → key to a **post-_deploy_** signal — `deployment_status` (`state == 'success'`) or the platform's `repository_dispatch` event — so smoke fires when the deploy is actually **live**, not merely when CI finished. `workflow_run` here smokes a not-yet-serving (or about-to-be-replaced) deployment.
- Either way: separate workflow, **non-blocking** (never a required check), and wait for the target to be **serving** before probing — READY ≠ serving (`testing.md` § Deploy-reachability).
- **Not:** smoke wired into branch protection (it gates observability, not merges), or a `workflow_run`-keyed smoke against an externally-deployed app that probes the old build.

## Applying migrations at deploy time

The deploy-time **apply** and the test-time **replay** gate are different jobs with different guarantees — keep both:

- **Apply (deploy path):** push only the **new** migrations onto the already-migrated remote — idempotent (applies what's not yet in the ledger; safe to retry), and it **never** replays from empty or runs the seed.
- **Replay (test path):** the fresh-DB gate proves from-empty replay + seed load (`testing.md` § Migration-replay + seed). Passing one is not passing the other.
- **Immutability:** once a migration is merged, never edit it — ship a new corrective migration. Flag any modification to an already-merged migration file in review.
- **Multiple chains:** apply **every** migration system (e.g. a SQL chain + an ORM / CMS chain), each idempotent and retried independently.
- **Transient-pooler hardening:** remote applies over a connection pooler can blip (e.g. an IPv4 session pooler's `i/o timeout`); wrap link + apply in a bounded retry — idempotency makes a re-attempt after a mid-apply drop safe.
- Ordering of apply vs the deploy's build is a **separate** hazard — § Build-vs-migration race.
- **Not:** assuming the deploy-time apply also validates a clean from-scratch install or the seed — it does neither.

## Build-vs-migration race

If your host auto-deploys on push (Vercel / Netlify Git integration) while CI applies migrations as a **separate, unordered** step, the deploy's build and the migration race. A build-time DB read that lands **before** the migration creates its object hard-ERRORs the **first** deploy shipping it. Build-time reads come from: `sitemap.ts` / `robots.ts`, `generateStaticParams` / `generateMetadata`, an OG-image route, a static (non-dynamic) page's server read, or marking a DB route `force-static` / ISR. Postgres signatures: `42P01` (relation), `42703` (column), `42704` (type), `3F000` (schema).

**Fingerprint:** prod keeps serving the prior deployment, and a redeploy of the **same SHA** clears it — a genuine bad migration would not self-heal on redeploy.

**Fix, strongest first:**

1. **Serialise migrate → deploy.** Disable host auto-deploy for the production branch (keep preview auto-deploys); have CI trigger the prod deploy **after** the migration step succeeds. Schema-before-build by construction.
2. **Belt-and-braces.** Narrowly catch those PG codes in build-time queries (return empty + `dynamicParams` / ISR so the route self-heals on first request) while keeping request-time reads strict (a missing object at request time is a real incident, not a race).

Latent until the first build-time DB read lands, so flag it in review when one is added. Note `bkit-tests-migrate` proves migrations _replay_ from empty; it does nothing for build-vs-deploy _ordering_ — this race is orthogonal to that gate.

## Vercel Deployment Checks — hold production promotion until CI passes

Vercel **Deployment Checks** (Project Settings → Build & Deployment → Deployment Checks) hold production promotion until a named GitHub Actions check reports success. The build starts immediately on push (in parallel with CI), but the production alias is NOT updated until the check passes.

### Setup

1. **Dashboard:** Vercel Dashboard → Project → Settings → Build & Deployment → Deployment Checks. Add a check matching the capstone job name (e.g. `bkit-tests-check`).

2. **CI workflow:** Add the `vercel/repository-dispatch/actions/status@v1` action as the last step in the capstone job. This reports the job outcome back to Vercel so the deployment check resolves:

```yaml
- name: Notify Vercel Deployment Check
  if: always()
  uses: vercel/repository-dispatch/actions/status@v1
  with:
    name: "Vercel - <project-name>: <capstone-job-name>"
```

## GitHub Actions pinning

Workflows with elevated permissions (`packages: write`, `id-token: write`, `contents: write`, or deploy credentials) MUST pin `uses:` to a 40-character commit SHA — never `@v{N}` floating tags. Floating tags are forgeable: a compromised maintainer can re-point `v4` at malicious code that runs on the next push.

Resolve a SHA with `git ls-remote https://github.com/<owner>/<repo>.git 'refs/tags/vX.Y.Z'`. Append a `# vX.Y.Z` comment so the version stays human-readable:

```yaml
- uses: actions/checkout@a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e # v4.2.1
```

**Pair with an updater.** SHA-pinning freezes the workflow on the pinned version — without an updater, CVEs in those actions stay un-patched indefinitely. Pinning without an updater is worse than not pinning. bkit ships two opt-in, mutually-exclusive paths: `pnpm bkit install --dependency=renovate` (recommended — phase-gated, monorepo-aware, lockfile maintenance) or `pnpm bkit install --dependency=dependabot` (alternative — first-party GitHub, no third-party trust surface, no App install). The canonical Renovate config (bkit-managed, auto-overwrite when opted in) lives at `.bkit/templates/.github/renovate.json5`. The shipped config:

- Sets `baseBranches: ["dev"]` — bkit consumers gate `main` to PRs-from-`dev`-only, so Renovate PRs must land on `dev`. Mandatory; not optional. Paired with `useBaseBranchConfig: "merge"` so config edits committed to `dev` are honored for dev-targeted runs — **without it Renovate reads config only from the default branch (`main`), so any `renovate.json5` change on `dev` is silently ignored until released to `main`.** Bootstrap caveat: `useBaseBranchConfig` is itself read from `main`, so it needs one merge to `main` before dev-side config takes effect (see § Renovate activation below).
- Runs weekly (`schedule: ["before 6am on Monday"]`) with lockfile maintenance. **All auto-mergeable non-major bumps collapse into a single `automerge: true` PR** (`groupName: "bkit: renovate non-major dependencies"`): devDependency minor+patch, production patches, `@types/*`, the eslint family, and the non-major bumps of the multi-package ecosystems (`@tanstack/*`, `vitest`/`@vitest/*`, `@playwright/*`). Rationale: every Renovate PR rewrites `pnpm-lock.yaml`, so several auto-merge PRs firing in one window force a serial rebase cascade that stalls `platformAutomerge` — one shared group means one lockfile mutation, one merge, no cascade. Reviewed separately, never auto-merged: production **minor** bumps; **all majors** (one PR each, `dep-major` label); and **ecosystem majors** — `@tanstack/*`, `vitest`/`@vitest/*`, `@playwright/*` are each grouped at the major level so a coordinated breaking bump lands in one reviewed PR (otherwise the peer-coupled halves split into separate per-package PRs and fail CI against each other).
- Enables `osvVulnerabilityAlerts: true` so CVE-driven PRs fire immediately regardless of schedule.
- For the `github-actions` ecosystem: `pinDigests: true` keeps every `uses:` line on a 40-character SHA + tag comment, refreshed on upstream releases and CVE disclosures.
- For bkit-managed workflow files (`bkit-cloud.yml`): the file is listed in `ignorePaths` so Renovate never scans it — new SHAs/versions arrive via `bkit install`, not consumer Renovate. The `ignorePaths` entry is load-bearing: a packageRule `enabled: false` alone only suppresses _version updates_, but the `github-actions` manager still scans the file and applies tag→SHA `pinDigests`, which recreates a `chore(deps): Pin dependencies` PR on every scan. A `matchFileNames` + `enabled: false` packageRule is kept as a secondary guard.
- Carries no private-registry token itself — the `hostRules` token anchor for `npm.pkg.github.com` is seeded into the consumer-owned `renovate-local.json5` instead, so it survives `bkit upgrade` (this file is canonical-overwrite and would clobber a token added here). You must provision a read token there to make Renovate's lockfile regeneration work (see § Renovate read-auth below). Without it, every dependency PR fails CI.
- `extends` a consumer-owned local preset (`local>{{REPO_SLUG}}//.github/renovate-local.json5`) so you can add repo-specific rules that survive `bkit install`/`bkit upgrade` (see § Customizing Renovate below). `renovate.json5` itself is bkit-managed and rewritten on every `bkit install` — hand-edits there are clobbered.

**Exemption — `bkit-cloud.yml`:** The bkit-canonical `bkit-cloud.yml` uses floating major-version tags (e.g. `actions/checkout@v4`, `anthropics/claude-code-action@v1`) rather than SHA pins. The `ignorePaths` entry above keeps consumer-side Renovate out of this file entirely. New SHAs/versions arrive via `bkit install` when consumers bump the bkit package, not via consumer Renovate. SHA-pinning applies to your own CI workflows (`ci.yml` and any custom workflows), not to `bkit-cloud.yml`.

**Renovate activation (phase-gated).** Renovate is opt-in via `pnpm bkit install --dependency=renovate`. The Renovate App's first scan reads the default branch — installing the App before the config reaches `main` produces a broken onboarding PR (wrong base branch, ungrouped, redundant root `renovate.json`). bkit-install enforces the order via a two-phase flow:

1. **Phase A** (first run, config not yet on `origin/<default-branch>`): writes `.github/renovate.json5` to the working tree and prints a prompt to commit, open a PR to your integration branch, and merge through to the default branch. Do NOT install the Renovate App yet.
2. **Phase B** (re-run after merge to default branch): bkit detects the file on `origin/<default-branch>` and prints the App install URL https://github.com/apps/renovate (Mend Community Cloud, one-click, free — no `gh api` equivalent) plus the activation checklist (verify onboarding PR base branch, disable Dependabot version updates, merge onboarding PR). Within ~5 minutes of install, Renovate opens its onboarding PR; merge it and the first batch of grouped update PRs follows on the next scheduled run.

> **Why Renovate over Dependabot:** Renovate is monorepo-aware (one PR per dependency group, not one per package), supports lockfile maintenance, scopes bumps per file via `matchFileNames`, and respects `baseBranches` natively — no equivalent of Dependabot's silent-inert behaviour when the config sits anywhere other than the default branch. Renovate is Apache-2.0 OSS; the Mend Community Cloud App is a free hosted instance, self-hostable via `renovatebot/github-action` if you ever want to drop the Mend dependency.

(Security invariant: Renovate PRs run with a restricted `GITHUB_TOKEN` and no access to `secrets.ANTHROPIC_API_KEY` / `secrets.LINEAR_API_KEY` — `bkit-auto` will not dispatch on them by design. See `security.md` § Supply-Chain.)

### Renovate read-auth for the private package

`@cbartens/bkit` lives on GitHub Packages (`npm.pkg.github.com`, restricted). To regenerate `pnpm-lock.yaml` after bumping **any** dependency, Renovate resolves the whole workspace — including `@cbartens/bkit` — so it needs read auth to that registry. Without it, lockfile regeneration fails, every dependency PR lands with a stale lockfile, and CI fails `pnpm install --frozen-lockfile` with `ERR_PNPM_OUTDATED_LOCKFILE`. Disabling _updates_ to `@cbartens/bkit` does not help — the regen for unrelated deps still resolves it.

**Critical:** the `GH_BKIT_TOKEN` you set as a GitHub Actions secret for CI is **not** visible to Mend's hosted Renovate runner. The token must be provisioned on Renovate's side. Your consumer-owned `.github/renovate-local.json5` ships a commented `hostRules` anchor for `npm.pkg.github.com`; finish it via the path matching your setup. (It lives in `renovate-local.json5`, not the canonical `renovate.json5`, so it survives `bkit upgrade` — Renovate merges `hostRules` across extended presets, and a secret-bearing token in the local preset is honored.)

- **Mend Community Cloud (hosted, default):** Add `GH_BKIT_TOKEN` (a PAT with `read:packages`) as a **Mend repository secret** at https://developer.mend.io/github/<owner>/<repo> → Settings → Secrets. **In the secret dialog, tick the "If checked - secret will be used during the scan as an environment variable." box** — this is required: without it the secret exists but is never exposed to the scan, so lockfile regeneration still 401s exactly as if no token were set. Then uncomment the `token: "{{ secrets.GH_BKIT_TOKEN }}"` line in `.github/renovate-local.json5` so the `hostRules` entry resolves the secret. (Do not commit a literal token; `{{ secrets.* }}` references the dashboard secret.)
- **Self-hosted Renovate:** Inject the token via the `RENOVATE_HOST_RULES` env var, the bot's `config.js`, or an `encrypted: { token: "<blob>" }` field encrypted with your own bot key — no edit to the committed `token` line needed.

Do **not** use an `encrypted` block on Mend hosted: the Mend cloud apps no longer read `encrypted` secrets from repo config — only dashboard secrets (the path above). The `encrypted` route is self-hosted only.

This is part of Phase B activation; `pnpm bkit install --dependency=renovate` prints it in the activation checklist. The `hostRules` anchor in `renovate-local.json5` is inert (no-op) until you uncomment the token, so it never breaks consumers who have not provisioned it yet — and because that file is consumer-owned (never overwritten), your activation is not clobbered on the next `bkit upgrade`.

### Customizing Renovate (renovate-local.json5)

`.github/renovate.json5` is bkit-managed: `bkit install` rewrites the whole file, so any hand-edit there is clobbered on the next install. For repo-specific Renovate rules, edit **`.github/renovate-local.json5`** instead — a consumer-owned file bkit seeds once and never touches again (it is not a managed template, so neither `install` nor `upgrade` overwrites it). The bkit config pulls it in via `extends: ["local>{{REPO_SLUG}}//.github/renovate-local.json5"]` (the `{{REPO_SLUG}}` token resolves to your `owner/repo` from the `origin` remote at install time; the explicit `.json5` extension is required — an extensionless local preset resolves to `.json` and 404s, disabling the whole config).

**Precedence — read this before relying on it.** Renovate evaluates `extends`-preset packageRules **before** the host config's own inline rules, and for any given setting the later (bkit's inline) rule wins. This means `renovate-local.json5` can:

- ✅ **Add** rules for packages or managers bkit doesn't already configure.
- ✅ **Set keys bkit leaves unset** — notably `enabled: false` to fence a package. bkit never sets `enabled: true` on a matching rule, so a fence here holds.
- ❌ **NOT override a key bkit sets explicitly** (e.g. `automerge`, `groupName`) — bkit's inline rule wins for those.

**Grouping and auto-merge are intentionally bkit-enforced, not tunable.** The single `bkit: renovate non-major dependencies` group and its `automerge: true` are a _correctness_ property — they prevent the lockfile rebase cascade described under § GitHub Actions pinning — not a default you adjust per-repo. Per the precedence rule above, `renovate-local.json5` cannot re-split the group or turn its auto-merge off. If you need a different posture: fence a specific package you would rather bump by hand with `enabled: false` (below); or, if your policy is _review every dependency and auto-merge nothing_, install the Dependabot module instead (`pnpm bkit install --dependency=dependabot`, § below) — it opens one PR per package and never auto-merges.

**Canonical use case — fence a `pnpm.overrides`-pinned package.** If you pin a package in root `pnpm.overrides` (e.g. to stop cross-package version skew), Renovate's hosted lockfile regeneration does **not** reconcile against `pnpm.overrides`: it rewrites the locked version on an eligible bump while leaving your override in place, producing an inconsistent `pnpm-lock.yaml` that fails CI's `pnpm install --frozen-lockfile` (`ERR_PNPM_OUTDATED_LOCKFILE … doesn't satisfy range`). Fence the pinned package so Renovate leaves it alone:

```json5
// .github/renovate-local.json5
{
  packageRules: [
    { matchPackageNames: ["react", "react-dom", "react-test-renderer"], enabled: false },
  ],
}
```

**Branch resolution.** Renovate resolves the local preset from your **default branch** (`main`), not from `dev` — `useBaseBranchConfig: "merge"` applies to `renovate.json5` itself, not to its extended presets. Commit `renovate-local.json5` alongside `renovate.json5` and land both on the default branch (the Phase A flow already requires this; the `extends` target must exist or Renovate raises a config error). To resolve it from a different branch instead, append `#<branch>` to the extends entry (e.g. `…/renovate-local.json5#dev`).

### Dependabot alternative (opt-in, mutually exclusive with Renovate)

If you have specific reasons to prefer Dependabot — first-party GitHub feature, no third-party App install, no Mend dependency in the trust surface, no Phase A/B race — bkit ships a Dependabot module as an alternative. Run `pnpm bkit install --dependency=dependabot` (NOT `--renovate`; the two are mutually exclusive and bkit will refuse to install both).

Trade-offs to accept if you pick this path:

- **One PR per package, not per group** — Dependabot's `groups:` support is newer and weaker than Renovate's. Expect more PR volume per scheduled run.
- **Per-workspace coverage is manual** — bkit's shipped `dependabot.yml` ships the `github-actions` ecosystem enabled and `npm` commented out. For pnpm monorepos with explicit per-workspace coverage, you'll edit the file to add `directories: ["/", "/apps/*", "/packages/*"]` (Dependabot v2.1+) or stamp out one `package-ecosystem: npm` block per path.
- **No lockfile maintenance** — Renovate's weekly `lockFileMaintenance` job refreshes transitive deps; Dependabot has no equivalent.
- **No `osvVulnerabilityAlerts: true` analogue in the config** — CVE-driven PRs come from GitHub's security advisory pipeline (enabled via the helper script's `automated-security-fixes` toggle, not the YAML).

The bkit-shipped `.bkit/scripts/bkit-set-dependabot.sh` handles the repo-level setup that `.github/dependabot.yml` alone does not (auto-fixes-enabled, vulnerability-alerts, never-auto-merge-on-main policy). Run once after install:

    bash .bkit/scripts/bkit-set-dependabot.sh        # apply (idempotent)
    bash .bkit/scripts/bkit-set-dependabot.sh --dry-run    # preview
    bash .bkit/scripts/bkit-set-dependabot.sh --print      # inspect current state

The script is bkit-owned and consumers do not edit it. New policy changes ship via `bkit install --dependency=dependabot`.

### Manual CVE handling (when an alert fires)

Renovate's `osvVulnerabilityAlerts: true` opens CVE-driven PRs immediately against `dev`. If you also want to keep GitHub's Dependabot **alerts** on (Settings → Code security → Dependabot alerts), the Security tab continues to surface advisories — useful as a parallel signal, not required. Handle each alert against `dev`:

1. Read the alert — note `vulnerable_version_range` and `first_patched_version`. Check `pnpm why <pkg>` to see the import chain (direct vs transitive; dev vs prod scope).
2. **Direct dep**: bump in `package.json`, run `pnpm install` + `pnpm typecheck` + `pnpm test`.
3. **Transitive dep**: bump the parent that pins it (e.g. bump `vitest` to pull in a CVE-fixed `vite`). If the parent itself cannot upgrade, add a `pnpm.overrides` entry pinning the transitive to a fixed version — or add the transitive directly to `devDependencies` to force the resolution.
4. Open a PR against `dev` titled `fix(security): bump <pkg> >=<fixed-version> (CVE-XXXX-YYYY)`. After merge to `dev → main`, the alert auto-closes once GitHub re-scans the default branch.
5. If a CVE has no impact on your usage pattern (e.g. dev-server-only vuln in a build tool that you never run as a server), dismiss in the GitHub UI with the **"Vulnerable code is not actually used"** reason and a one-line justification. Don't dismiss without documenting why.

<!-- bkit:end -->
