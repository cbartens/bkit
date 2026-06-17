<!-- bkit:start -->

<!-- bkit:managed v4.1.0 — do NOT edit; run `bkit upgrade` to refresh -->

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

- **Direct push to `dev` or `main`** (no PR involved): tag goes in the **commit message**. Read from `github.event.head_commit.message`.
- **Push to a feature branch with an open PR** (or PR open / synchronize / edit): tag goes in the **PR title**. Read from `github.event.pull_request.title`. The commit message is NOT consulted — the workflow fires on `pull_request`, not `push`, for feature branches.
- **Both surfaces are checked** by `contains()` in the env block, so a marker in either location wins for its corresponding event. But you must pick the right one: putting `[verbose ci]` in a feature-branch commit message has no effect — only the PR title is read.
- **`workflow_dispatch`** (manual UI trigger): neither field is populated; tags don't apply. Use the workflow_dispatch input checkboxes if present.

<!-- prettier-ignore -->
| Tag | Effect | Scope |
| --- | --- | --- |
| `[force cache]` | Sets `TURBO_FORCE=1` for the run — turbo recomputes instead of replaying cache hits. Use when investigating suspected ghost-greens. | Read by `Detect Direct Push` step |
| `[force build]` | Exposes `should_force_build=true` step output for downstream deploy gates. Has no effect unless the consumer's deploy steps gate on it. | Read by `Detect Direct Push` step |
| `[force e2e]` | Exposes `should_run_e2e=true` step output. The `bkit-stub:e2e` block (when uncommented) runs E2E on this signal. | Read by `Detect Direct Push` step |
| `[force live]` | Sets the plan's `run_live=true` so the `bkit-tests-live` @live job runs even off a non-dev/main-push event. No effect unless you have added the `bkit-tests-live` job (full scaffold). | Read by `bkit-decide` (Read Markers → Decide Run Live & E2E) |
| `[verbose ci]` | Escalates log detail for one run: `TURBO_LOG_LEVEL=full`, `NODE_OPTIONS=--trace-warnings --trace-deprecation`, `DEBUG=vercel:*,supabase:*`, plus Playwright `--trace=on` (when E2E stub enabled). Use when `bkit-debug` diagnose returns thin evidence; never for routine pushes (trace.zip files are MB-scale). See `testing.md` for the full knob list and the `--reporter=line` hostile gap. | Read by `bkit:start verbose-ci-env` env block (top of `bkit-tests` job) |
| `[skip ci]` / `[skip actions]` | Honoured natively by GitHub Actions — suppresses workflow dispatch entirely. Use sparingly: the suppressed run will not appear in `gh run list`, and downstream `workflow_run` triggers will not fire. | Native GitHub behaviour, not a bkit-level toggle |
| `[skip build]` | Consumer-defined: bkit does not interpret this tag in `ci.yml`. Consumers wiring it into deploy steps add the gate themselves. | Consumer-controlled |

Direct push to `dev` (no merged PR ancestry) auto-sets `TURBO_FORCE=1` regardless of tags. See `bkit-debug` runbook for the cache-bust rationale.

## Run-level decision matrix

Bkit ships a 4-job scaffold — `bkit-decide` (always-on; reads markers, computes `run_level`, emits the `bkit-test-plan` JSON contract) → `bkit-tests` → `bkit-tests-live` → `bkit-tests-check` (the always-on capstone that asserts every tier the plan _expected_ actually ran and passed). An optional `bkit-tests-migrate` sibling (DB repos) runs in parallel with `bkit-tests` — proving every migration replays from an empty database + the seed loads on a fresh instance — and folds into the capstone's `needs:`; it always runs but self-skips the heavy steps when no migration/seed source changed (`bkit-stub:bkit-tests-migrate` in the scaffold reference). The single-job starter `ci.yml` ships the primitives (cache check, marker parsing, direct-push detect, integration gate); the **FULL CI SCAFFOLD REFERENCE** at the end of `.github/workflows/ci.yml` reproduces every step, in execution order, for adopting the tiers. The table below defines the `none` / `partial` / `full` shape those primitives + the plan plug into.

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
- `extends` a consumer-owned local preset (`local>cbartens/bkit//.github/renovate-local.json5`) so you can add repo-specific rules that survive `bkit install`/`bkit upgrade` (see § Customizing Renovate below). `renovate.json5` itself is bkit-managed and rewritten on every `bkit install` — hand-edits there are clobbered.

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

`.github/renovate.json5` is bkit-managed: `bkit install` rewrites the whole file, so any hand-edit there is clobbered on the next install. For repo-specific Renovate rules, edit **`.github/renovate-local.json5`** instead — a consumer-owned file bkit seeds once and never touches again (it is not a managed template, so neither `install` nor `upgrade` overwrites it). The bkit config pulls it in via `extends: ["local>cbartens/bkit//.github/renovate-local.json5"]` (the `cbartens/bkit` token resolves to your `owner/repo` from the `origin` remote at install time; the explicit `.json5` extension is required — an extensionless local preset resolves to `.json` and 404s, disabling the whole config).

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

## Project

### `GH_BKIT_TOKEN` — presence matrix

`GH_BKIT_TOKEN` is required at four surfaces for every consumer; missing any one breaks an install or CI run. Detector coverage in `bkit install` Phase 3 mirrors those four. A fifth surface applies only when Renovate is enabled — bkit cannot detect it (it lives in Mend's dashboard, off-repo).

<!-- prettier-ignore -->
| Surface | Where to set | Symptom if missing | bkit detector |
| --- | --- | --- | --- |
| Local shell | `.bkit/.env` (gitignored, scaffolded by `bkit install`) → `GH_BKIT_TOKEN=<classic PAT>`; auto-loaded via direnv (`brew install direnv` + shell hook + `direnv allow`) | `pnpm install` 401 against `npm.pkg.github.com` (sometimes opaque against `npmjs.org` — see KN-1) | `detectShellToken` + `detectMissingDotenv` + `detectBlankDotenvKeys` (Phase 3) |
| `.npmrc` (registry mapping only) | `@cbartens:registry=https://npm.pkg.github.com` — the auth token is **NOT** stored here; write it once to pnpm's user-level config: `pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN"` (pnpm >=10.34.3 401s on a project-`.npmrc` `${GH_BKIT_TOKEN}` ref — see KN-CORE-7) | Missing registry mapping → 401; a leftover `_authToken` line → 401 + shadows the user-level token | `detectNpmrcAuth` + `detectNpmrcLegacyAuthToken` (Phase 3) |
| GitHub Actions secret | `gh secret set GH_BKIT_TOKEN --body=$GH_BKIT_TOKEN` AND an install step that runs `pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN"` before `pnpm install`, with `env: { GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }} }` | CI 401 on `@cbartens/bkit` fetch on next push | `detectGhSecret` + `detectCiYmlMissingTokenEnv` (Phase 3, blocker when `.npmrc` authenticates to GH Packages but the step is unwired) |
| Vercel env (preview + production) | `vercel env add GH_BKIT_TOKEN preview` and `vercel env add GH_BKIT_TOKEN production`, **plus** a `vercel.json` `installCommand: pnpm config set //npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN && pnpm install` (Vercel cannot run a pre-install shell step) | Vercel preview / production deploy 401 — Vercel runs `pnpm install` in a separate container, no GH-secret inheritance; without the installCommand the token never reaches pnpm's auth config | `detectVercelEnv("preview" \ | "production")` (Phase 3) |
| Renovate (Mend hosted, **only if `--renovate`**) | Mend repository secret at https://developer.mend.io/github/&lt;owner&gt;/&lt;repo&gt; → Settings → Secrets, then uncomment `token` in `renovate-local.json5`'s `hostRules` (consumer-owned, survives `bkit upgrade`). Self-hosted: `RENOVATE_HOST_RULES` env | Every Renovate dependency PR fails CI with `ERR_PNPM_OUTDATED_LOCKFILE` — Renovate can't regenerate `pnpm-lock.yaml` without resolving the private `@cbartens/bkit`. The CI Actions secret is NOT visible to Mend's runner | None — off-repo (Mend dashboard); surfaced in the `--renovate` Phase B checklist + § Renovate read-auth above |

Token must be a GitHub PAT with `read:packages` scope (classic) or `Packages: read` permission (fine-grained). Generate at <https://github.com/settings/tokens>.

### Pre-push checklist

Every push to a feature branch must pass the same gates CI runs. The husky pre-push hook (`.husky/pre-push`) enforces them mechanically — running `--no-verify` is a violation. Order matches `.github/workflows/ci.yml`'s `bkit-tests` job:

<!-- prettier-ignore -->
| # | Gate | Command | Hook block | Failure mode |
| --- | --- | --- | --- | --- |
| 1 | Typecheck | `pnpm typecheck` | bkit-managed | TS error → fix source. |
| 2 | Unit + integration tests | `pnpm test` | bkit-managed | Test failure → fix code, never delete the test. |
| 3 | Prettier format check | `pnpm format:check` | bkit-managed | Unformatted file → run `pnpm exec prettier --write <path>` (or `pnpm format`) and re-stage. Mirrors CI step "Run Prettier Format Check"; without this gate, formatting failures only surface in CI after push. |
| 4 | Prose lint | `pnpm lint:prose` | bkit-managed | Vale warning → fix the prose. Guard-skips when vale / write-good is absent (install vale to enforce locally); CI installs vale so it always enforces there. |
| 5 | Slop delta | `pnpm slop:delta` | bkit-managed | A finding this push ADDS or WORSENS the repo on NET → fix it (the pre-existing baseline is never yours to fix on the way out). `.bkit/scripts/bkit-slop-delta.sh` materialises the base ref as a worktree and gates on slop-scan's **net** delta (`netFindingCount` / `netRepoScore`), NOT raw `--fail-on added`: a pure line-shift of an existing finding (slop-scan 0.3.0's position-keyed delta reports it as resolved+added at net zero) must NOT fail the gate. Note `lint:slop` (`slop-scan scan`) is report-only and is NOT a gate. |
| 6 | bkit self-check | `pnpm bkit check` | consumer template (Tier 3 seed-or-print — bkit seeds the file once; consumer owns it thereafter); source-repo appends the same gate directly in its copy | Drift detected (writes > 0) → run `pnpm bkit install` and commit the result. Advisories alone don't fail; only writes do. |
| 7 | Dist freshness | `pnpm check:dist` | source-repo only (appended directly to the source-repo copy; not in the consumer template) | dist drift → run `pnpm build` and commit `dist/`. Consumers do not have this gate. |

**Revert-branch bypass:** on branches named `revert-*` or whose HEAD commit subject starts with `Revert "`, the pre-push hook skips `pnpm test` (Gate 2) and runs only `pnpm typecheck && pnpm format:check` from the test group. Gates 4–7 (prose, slop:delta, bkit check, and source-repo check:dist) still run in both variants — prose is unaffected by deleted code, and slop:delta reports removals as `resolved` (never `added`), so neither blocks a recovery push. Rationale: rollback source trees are intentionally inconsistent — surviving tests can reference deleted files, blocking a legitimate recovery push. Non-revert branches always run all applicable gates.

Pre-commit (`.husky/pre-commit`) runs `pnpm lint-staged && pnpm lint:prose` — fast staged-file gates that fire earlier in the cycle, not at push time. The enforcing slop gate moved to pre-push (`pnpm slop:delta`, Gate 5); `pnpm lint:slop` (`slop-scan scan`) is report-only and is no longer wired into a hook. CI re-runs prose + slop:delta in the `bkit-tests` job for belt-and-braces.

When a gate fails locally, fix the cause and re-stage; do NOT bypass with `--no-verify` and do NOT amend over a failed hook (see auto-memory: "skip-ci commits must not be HEAD when PR is created"). If the gate is genuinely broken (e.g. flaky external call), STOP and document the blocker — do not push.

### `dist/` commit policy

Source-repo only. Any TypeScript change under `.bkit/src/*.ts` MUST be accompanied by `pnpm build && git add dist/` in the same commit.

- Pre-commit and pre-push hooks run `typecheck` + `test` — they do NOT run `pnpm build`. The source-repo pre-push also runs `pnpm check:dist` (catches a stale `dist/` at push time), but this does NOT commit the freshened `dist/` — if stale, the push is blocked and you must run `pnpm build && git add dist/` manually before pushing.
- CI's `bkit-tests` job has a "Verify Dist Freshness" step (`pnpm check:dist` → `rm -rf dist && tsc && git diff --exit-code dist/`) that fails the build if shipped artefacts drift from source. Lives only at `.github/workflows/ci.yml` (this repo).
- Consumer repos install the published tarball and never recompile, so the consumer `ci.yml` template at `.bkit/templates/.github/workflows/ci.yml` deliberately omits the freshness step. Do not add it there.
- See KN-7 for failure-mode and recurrence history.

### `.husky/pre-push` bkit check gate

`.husky/pre-push` is **Tier 3 (seed-or-print)** — bkit writes the file once on first install and never overwrites it. It carries no `# bkit:start` / `# bkit:end` markers. The consumer template (`.bkit/templates/.husky/pre-push`) ships `pnpm bkit check < /dev/null` so consumers detect managed-file drift before push. The bkit source repo's `.husky/pre-push` additionally has `pnpm bkit check < /dev/null` and `pnpm check:dist < /dev/null` appended directly (not via markers) — those lines catch `.agents/*` edits that weren't mirrored via `bkit install` and verify `dist/` is not stale.

- The bkit-repo-only additions are plain lines at the bottom of the source-repo copy of the file; they are not in the consumer template and never reach consumer repos.
- Fix on failure: run `pnpm bkit install` (for drift), or `pnpm build && git add dist/` (for dist staleness); stage and commit; then push. `--no-verify` remains PROHIBITED per the universal pre-push rule.

### Renovate — fencing bkit's own footprint

The bkit-shipped `renovate.json5` fences Renovate off the bkit footprint that lands inside any repo using bkit. This repo dogfoods the **same** config (no divergence — `bkit check --renovate` enforces it). The fence has two parts:

- `ignorePaths` includes `.bkit/templates/**` and `.agents/skills/**` — bkit-owned mirrors written into the working tree by `bkit install`/`upgrade`. They are refreshed by bkit, not Renovate; scanning them only yields onboarding-PR noise.
- A packageRule disables the `@cbartens/bkit` package itself — bumped via `pnpm bkit upgrade` (which re-syncs templates + pin), never a bare Renovate version bump, and unauthable from Mend's runner anyway (`no-result`). Mirrors the existing `bkit-cloud.yml` exemption.

**Consequence for this repo (deliberate):** the SHA-pinned `uses:` inside the _template_ workflows (`.bkit/templates/.github/workflows/*.yml`) and the Cursor Dockerfile base image are **not** Renovate-bumped here — they sit under an ignored path. That is acceptable: they are seeds, and (a) this repo's _real_ `.github/workflows/*.yml` (outside `.bkit/templates/`) uses the same actions and stays Renovate-covered, so no CVE blind spot is introduced; (b) consumers' own Renovate maintains the installed copies post-install. Refresh the template pins by hand when revising CI.

See § Renovate activation above for consumer-reported dashboard noise.

### CI trigger on final workflow push

GitHub Actions suppresses both `pull_request` and `push` workflow runs when the HEAD commit message contains `[skip ci]` or `[skip actions]` (GitHub substring check). When that happens on a PR branch, `gh pr view --json statusCheckRollup` returns empty — downstream fail-fast gates that check rollup status will admit a vacuously green PR.

**Rule:** every workflow's last push to a CI-validated ref MUST leave HEAD without a CI-suppressing token AND must result in a confirmed `bkit-decide` CI run dispatched for the pushed HEAD. Enforcement: the **CI-Dispatch Gate** in `.bkit/workflows.md` § "CI-Dispatch Gate" — a two-part gate: (1) pre-push HEAD-subject deny-list fast-fail; (2) post-push outcome poll that confirms a `bkit-decide` run exists in `statusCheckRollup`, self-heals once with a clean `re-trigger` commit if none appears, and terminates with a named verdict (`dispatched`/`self-healed`/`no-ci`/`unresolved`). See KN-11 for the `[skip ci]` HEAD → empty rollup symptom.

**Gate sites (2, not 3):** build Gate 18 (close-workflow push); debug Gate 10 PR-mode (close-workflow push, sub-step 3) and LOCAL-mode (create-pr push, sub-step 9). Ship is OUT — ship keeps its pre-existing `SQUASH_SHA`-poll gate at Step 13; adding a CI-Dispatch Gate there would mask the "essential tests skipped" signal.

**EC-1 pre-flight (build Step 17):** before `gh pr create`, probe `gh pr list --head … --base dev`. Open PR found → Failure Path with named message (`EC-1: feat/{FID} already has open PR #N`). Probe failed → fall through to blind create (no regression). Prevents the blind-create → retry → Failure Path chain on build re-run.

**EC-2 abort-guard (build inline Failure Path + shared § Failure Path step 5):** before pushing the `[skip ci]` abort commit, probe `gh pr list --head … --base dev`. Open PR found (or probe failed) → **do NOT push**; preserve last validated remote HEAD. No open PR → push as today. Probe-failure inverts the safe default (pushing onto a live PR is the exact harm; not-pushing on a no-PR branch is harmless).

**Commit-tag taxonomy:**

<!-- prettier-ignore -->
| Tag | Suppressor? | Effect |
| --- | --- | --- |
| `[skip ci]` / `[ci skip]` / `[no ci]` / `[skip actions]` / `[actions skip]` | YES — CI suppressor | GitHub Actions skips the workflow; `statusCheckRollup` empty. |
| `bkit [skip ci]` | YES (substring match on `[skip ci]`) | bkit bookkeeping commits — `worktree-setup`, `create-pr`, `summary` (design/plan), status pushes to `dev`. Intentionally silent; never on CI-triggering HEAD. |
| `bkit [skip build]` | NO for CI; YES for Vercel | Vercel ignore script cancels preview build; CI cap remains at partial tier. Not a CI suppressor — safe on PR HEAD when CI must fire. PR title must not carry it (blocks post-squash deploy). |
| `bkit [force build]` | NO (not a suppressor) | Forces full CI + Vercel build even on docs-only paths. Escape hatch for migrations/etc. |
| `bkit [auto route]` | NO (not a suppressor) | Loud routing marker on close-workflow + debug re-trigger commits. Free-tier gate for `bkit-cloud.yml` CI auto-route. Present on opted-in close-workflow HEAD; treated as legitimate by the HEAD-Subject Assertion. |
| `bkit [verbose ci]` | NO (not a suppressor) | Escalates CI log detail for one run (debug path). |

<!-- prettier-ignore -->
| Surface | Mechanic |
| --- | --- |
| build/debug PR push (final close-workflow) | `chore({FID}): close-workflow` — no skip tags; loud. Opted-in builds additionally append `bkit [auto route]` (conditional on issue `bkit:auto` at close time). Push fires `pull_request` synchronize. |
| build/debug `worktree-setup` commit | `chore({FID}): worktree-setup bkit [skip ci]` — bookkeeping; no CI trigger. |
| build `create-pr` commit | `chore({FID}): create-pr bkit [skip ci]` — bookkeeping; no CI trigger. Fires after PR creation but before the close-workflow push. |
| ship squash merge | `gh pr merge --squash --body ""` — empty body strips PR-body `bkit [skip ci]` from the squash subject so `dev`'s merge HEAD is clean. Followed by post-merge `gh run list --branch dev --limit 5` gate that captures `RUN_ID`. |

All other docs-only intermediate commits (start-workflow, summary, install-skills, update-docs, archive, worktree-cleanup) retain `bkit [skip build] bkit [skip ci]` to save CI minutes. Only the trailing `close-workflow` commit (build/debug) and the squash-merge subject (ship) are unmarked and loud.

**Commit-message tags reference (full table):** see `.bkit/workflows.md` § "CI / Vercel commit tags".

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

1. **Phase 1 — Preflight (read-only).** Runs blocker + advisory detectors. Blockers exit 1 before any writes (e.g. malformed `package.json`, no git repo). Advisories accumulate in `ctx.advisories`. Note: there is no hooks-config-overwrite preflight gate — deep-containment merge guarantees consumer-key survival (see KN-8, DE-8).
2. **Phase 2 — Install (writes — staged).** Module dispatch writes to `.bkit-staging/<module>/` (v0.9.0+). Modules append further structured advisories to `ctx.advisories`. On any error before commit, `discardAllStaging` removes staging dirs — consumer files left byte-identical to pre-install state (see KN-12, DE-9).
3. **Phase 3 — Post-install (re-detect + commit).** Re-runs token-surface, `ci.yml`, vale-sync, devDeps detectors after writes. Cross-phase dedupe: Phase 3 wins on id conflict. In `bkit check` (v2.2.3+), Phase 3 runs in read-only mode — same advisory set as install, no writes. See KN-4. **Phase 3 blockers exit 1** (v0.7.0+) with a single-line recovery command (`pnpm bkit uninstall <flags> && <fix> && pnpm bkit install <flags>`); pass `--auto-revert` to in-process invoke `runUninstall` before exit.

`pnpm bkit install` always runs all three phases. `pnpm bkit check` runs Phase 1 + Phase 3 (read-only, v2.2.3+); exits 1 if any Tier-1/Tier-2 drift is detected; no writes. `pnpm bkit doctor` (v0.6.0+) runs Phase 1 + Phase 3 detection without writing — read-only diagnostic. `pnpm bkit upgrade` (v0.9.0+) compares old vs new template content against `canonicalHashes` to detect consumer drift; non-conflicting changes apply automatically, conflicts emit to stderr (`--non-interactive` exits non-zero on any conflict). `bkit upgrade` ALSO re-renders the bkit-managed OUTPUT that lives outside `.bkit/templates/` — host agents/commands (source-rendered from `.bkit/prompts` + `.bkit/workflows`) and the `.bkit/*.md` canonical docs (`runBkitDocs`) — for every host the consumer has installed (detected by each host's `agents/` dir, so an opt-in host is never force-created). These are bkit-owned, force-overwritten output, so a version bump delivers new prompts/agents/commands/docs without a follow-up `bkit install`; `.bkit/prompts.md` is markered, so its managed block refreshes while consumer overrides below `bkit:end` are block-merge-preserved.

### `bkit-cloud.yml` — dual-job cloud-agent lane

`bkit install --auto=…` ships a single `.github/workflows/bkit-cloud.yml` carrying TWO runtime-gated dispatch jobs so one GitHub-tracker repo can run claude AND opencode cloud agents from one file (additive):

<!-- prettier-ignore -->
| Job | Dispatch | Gated on | LLM secret |
| --- | --- | --- | --- |
| `claude` | `claude-code-action@v1` (OIDC via Claude GitHub App) | first step exports `enabled=true` only when `ANTHROPIC_API_KEY` is non-empty; absent → `::notice::… no-op` | `ANTHROPIC_API_KEY` |
| `opencode` | `opencode run` CLI (installed in-job) | first step exports `enabled=true` only when `OPENCODE_PROVIDER_KEY` is non-empty; absent → no-op | `OPENCODE_PROVIDER_KEY` |

**Rules:**

- **Secret-gated, never branch-gated.** Each job no-ops (does not fail) when its key is absent — set only the secret(s) for the cloud agent(s) you want active. Both keys present = both jobs act on the same event; serialise via the shared `concurrency.group` (still keyed `bkit-auto-${{ inputs.issue || …head_branch }}`).
- **`--auto=opencode` requires `tracker=github` AND a remote provider.** The install precondition hard-errors when the configured `.opencode/` provider is `ollama-local` (or any local/keyless provider): the GitHub runner has no local Ollama server, so the opencode job could never reach the model. Use a remote provider (nvidia) for the cloud lane.
- **Single fanned-out provider key.** `OPENCODE_PROVIDER_KEY` is exported under the env-var name the committed `opencode.json` references (the configured provider's `envVar`) so the job resolves regardless of which remote provider is installed; ANTHROPIC_API_KEY is absent in the opencode job (no Claude identity leak). GHA-injection hardened — `PHASE`/`ARG` pass via `env:` + shell-var refs, `ARG` validated against `^[0-9A-Za-z.*/-]+$` (KN-37).
- **Renovate exemption** (`bkit-cloud.yml` in `ignorePaths`) and the **`bkit [auto route]` free-tier gate** are unchanged by the rename — see § GitHub Actions pinning and the commit-tag taxonomy above.

### Consumer CI auth — user-level `pnpm config set` (canonical)

Consumer CI workflows authenticate `@cbartens/bkit` by writing the token into pnpm's user-level config **before** install — `pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN"` then `pnpm install` — with `GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}` on the step. The committed `.npmrc` carries ONLY the registry mapping (`@cbartens:registry=https://npm.pkg.github.com`); pnpm >=10.34.3 no longer authenticates a project-`.npmrc` `${GH_BKIT_TOKEN}` env-substitution (it 401s on download — see KN-CORE-7). No composite action, no cross-org `uses:` reference — `bkit` stays private without affecting any consumer's auth context. See README §"Adding a new consumer — checklist" and §"Consumer CI auth" for the consumer-side detail; the canonical `ci.yml` template at `.bkit/templates/.github/workflows/ci.yml` is the authoritative source for the install-step shape.

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
