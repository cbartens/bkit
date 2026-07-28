<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Deployments

> [!CAUTION]
> **Purpose:** Deployment / environment config / CI/CD pipeline rules — secrets sync, branch protection, run-level tiers.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Describe current state / rules, NOT reasons / history; state what to do; NOT why.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Pre-push runs project gate set locally (see "Pre-push checklist" below); never `--no-verify`.

## Production rollback runbook

> Bad commit on `main` (production) → unwind to prior known-good SHA. Vercel assumed; adjust deploy step for other hosting.

### Preconditions

- Known-good SHA on `main`. Confirm: `gh run list --branch main --status success --limit 5` (target SHA green).
- Local repo on `main`, clean tree, `gh auth status` green.
- `jq` installed (`brew install jq` / system package manager).

### Playbook

1. **Save current protection JSON** for verbatim restore. GET and PUT shapes differ; raw GET avoids hand-mapping fields.
   ```bash
   gh api repos/{OWNER}/{REPO}/branches/main/protection > /tmp/main-protection.json
   ```
2. **Disable protection** so force-reset is accepted.
   ```bash
   gh api -X DELETE repos/{OWNER}/{REPO}/branches/main/protection
   ```
3. **Force-reset the `main` ref** to the known-good SHA.
   ```bash
   gh api -X PATCH repos/{OWNER}/{REPO}/git/refs/heads/main -f sha=<green-sha> -F force=true
   ```
4. **Restore protection** from saved JSON. GET → PUT shape mismatch: `required-status-checks` → `required_status_checks`, contexts list, etc. Inspect saved JSON; PUT equivalent shape.
   ```bash
   gh api -X PUT repos/{OWNER}/{REPO}/branches/main/protection --input /tmp/main-protection.json
   ```
5. **Re-point production deployment** (Vercel does NOT auto-rollback on git ref rewrites — alias stays on most-recent push until manually promoted). Look up prior good deployment by commit SHA and promote:
   ```bash
   vercel ls --meta githubCommitSha=<green-sha>
   vercel promote <prior-deployment-url>
   ```
   Without this step: git ref rolled back but production still serves bad build.

### Why force-push on `main` alone is not enough

- `git revert` on cross-branch squash (e.g. `feat/*` landed on `main` not `dev`) can delete files `main` code still references → tree fails CI despite "clean" history.
- `feat/*`-onto-`main` is root cause of destructive recovery; production merges MUST come from `dev` (single-feature squash scope).
- On `revert-*` branches pre-push skips only **test suite** — typecheck, format:check, prose, slop:delta, bkit drift gate still run → revert PR pushable when source state transitionally inconsistent.

### Post-rollback verification

- `gh api repos/{OWNER}/{REPO}/git/refs/heads/main --jq .object.sha` must equal the green SHA.
- `curl -sI https://{prod-alias}` headers report the rolled-back deployment id.
- Run the production smoke suite to confirm the rolled-back app behaves as expected.

## Dev rollback runbook

> Bad commit on `dev` → unwind to prior known-good SHA. Use when rolled-out range included applied migrations — code-only rollback leaves dev DB ahead of code; schema-aware tests (cdc-schema, schema-introspection, RLS integration) fail on otherwise-clean tree. Supabase assumed; adjust DB step for other providers.

### Preconditions

- Known-good SHA on `dev`. Confirm: `gh run list --branch dev --status success --limit 5` (target SHA green).
- Local repo on `dev`, clean tree, `gh auth status` green.
- `supabase` CLI linked to dev project (`supabase link --project-ref <dev-ref>`).
- Dev DB service-role connection string in local env (`SUPABASE_DB_URL` or equivalent).

### Playbook

1. **Force-reset `dev` ref** to known-good SHA. `dev` typically unprotected; if protected → production-rollback save/disable/restore pattern.
   ```bash
   git reset --hard <green-sha>
   git push --force-with-lease origin dev
   ```
2. **Reset linked dev DB.** Drop consumer-managed schemas `CASCADE`, truncate migrations ledger, replay surviving migration files. Substitute schema names for consumer's managed set.
   ```bash
   psql "$SUPABASE_DB_URL" -c 'DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS stripe CASCADE;'
   psql "$SUPABASE_DB_URL" -c 'TRUNCATE supabase_migrations.schema_migrations;'
   supabase db push --linked --include-all
   ```
3. **Re-seed fixtures** (if consumer runs seed script on dev).
   ```bash
   pnpm db:seed
   ```
4. **Re-trigger CI** on rolled-back `dev` ref → confirm green-on-rollback baseline.
   ```bash
   git commit --allow-empty -m "chore: trigger CI after dev rollback"
   git push origin dev
   ```

### Why code-only rollback is not enough

- `git reset` rewinds source tree; migrations from rolled-out range stay materialised — DB has no "unapply" for code-driven migrations.
- Schema-introspection tests (columns, RLS, table presence) see structure code no longer declares → drift failure.
- `supabase db push --linked --include-all` after ledger truncate reapplies only rolled-back-tree migrations → DB aligns with code.

### Post-rollback verification

- `git rev-parse origin/dev` must equal the green SHA.
- `psql "$SUPABASE_DB_URL" -c 'SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;'` must match `ls supabase/migrations/` on the rolled-back tree.
- Re-run the schema-aware test suite (`pnpm test:integration` or the consumer's equivalent) to confirm DB and code agree.

## Commit-message force tags

Bkit `ci.yml` recognises tags below. Case-sensitive, literal `[...]` form; may appear anywhere in source string. Tags compose — multiple on same commit / PR title fire independently.

**Where to put the tag — read carefully:**

- **Direct push to `dev` or `{{DEFAULT_BRANCH}}`** (no PR): tag in **commit message** (`github.event.head_commit.message`).
- **Feature branch with open PR** (open / synchronize / edit): tag in **PR title** (`github.event.pull_request.title`). Commit message NOT consulted — workflow fires on `pull_request`, not `push`.
- **Both surfaces** checked by `contains()` in env block — marker in either wins for its event. Pick right one: `[verbose ci]` in feature-branch commit message has no effect — only PR title read.
- **`workflow_dispatch`**: neither field populated; tags don't apply. Use workflow_dispatch input checkboxes if present.

<!-- prettier-ignore -->
| Tag | Effect | Scope |
| --- | --- | --- |
| `[force cache]` | Sets `TURBO_FORCE=1` for the run — turbo recomputes instead of replaying cache hits. Use when investigating suspected ghost-greens. | Read by `Detect Direct Push` step |
| `[force build]` | The lighter hammer. Exposes `should_force_build=true` + `run_level=full`; does **not** bypass `web_affected`, so no integration / e2e / @live unless web is genuinely affected. Rebuild without paying @live's side effects. No effect unless the consumer's deploy steps gate on the output. | Read by `Detect Direct Push` step |
| `[force full]` | The hammer. Exposes `should_run_full=true` → `run_level=full` **and** bypasses `web_affected` (the `bkit-stub:e2e` / integration / `bkit-tests-live` blocks run on **any** commit, incl. docs-only / empty), greening the non-hollow capstone (the forced lanes must genuinely run). On a PR it upgrades the local e2e lane to the full suite; `@live` stays **push-only** (reached on a docs-only/empty `[force full]` push via the effective `web_affected`, never off a PR / dispatch — real LLM + email side effects). Replaces the removed `[force e2e]` / `[force live]`. | Read by `Detect Direct Push` step |
| `[verbose ci]` | Escalates log detail for one run: `TURBO_LOG_LEVEL=full`, `NODE_OPTIONS=--trace-warnings --trace-deprecation`, `DEBUG=vercel:*,supabase:*`, plus Playwright `--trace=on` (when E2E stub enabled). Use when `bkit-debug` diagnose returns thin evidence; never for routine pushes (trace.zip files are MB-scale). See `testing.md` for the full knob list and the `--reporter=line` hostile gap. | Read by `bkit:start verbose-ci-env` env block (top of `bkit-tests` job) |
| `[skip ci]` / `[skip actions]` | Honoured natively by GitHub Actions — suppresses workflow dispatch entirely. Use sparingly: the suppressed run will not appear in `gh run list`, and downstream `workflow_run` triggers will not fire. | Native GitHub behaviour, not a bkit-level toggle |

**Two deploy-forcing markers only (#291): `[force build]` + `[force full]`.** Granular `[force e2e]` / `[force live]` removed — silent no-ops gated behind `web_affected`. `[force full]` = single gate-bypass ("validate everything") → one effective `web_affected` drives integration + e2e + @live uniformly.

- **Precedence — `[skip ci]` / `[skip actions]` hard-vetoes any force marker.** `[skip ci]` commit never dispatches (native GitHub suppression, before `ci.yml`) — no force marker un-suppresses. To validate would-be-skipped commit: drop `[skip ci]`, push with `[force full]`.
- **`[force cache]` orthogonal** — busts turbo _replay_ (`TURBO_FORCE=1`), different axis from _which lanes run_. Never folded into `[force full]`. Combine `[force full] [force cache]` for "everything, fresh."
- **Marker parity (deploy-forcing set).** e2e / @live lanes resolve per-SHA deployment → marker that force-runs them MUST **also** force host build, or lane dies at "resolve deployment URL". Host build-cancel script (e.g. Vercel `ignoreCommand`) MUST honor **both** `[force build]` and `[force full]`; assert in CI (`grep -qF` over cancel script). `[force cache]` / `[verbose ci]` / `[skip ci]` test-plane-only — NOT honored by cancel script.

Direct push to `dev` (no merged PR ancestry) auto-sets `TURBO_FORCE=1` regardless of tags. See `bkit-debug` runbook for cache-bust rationale.

## Autonomous phase-close prerequisites

Design/plan Close Workflow lands docs on `dev` two ways. When the runtime can push `dev` (`RUNTIME_DEVPUSHES=true` — laptop, GitHub-Actions runner) it runs the local squash-merge and direct push: **no repo setting is required, and no PR is created**. When it cannot (cloud agent session, or an unclassified runtime) it opens a PR and squash-merges it, which adds two repo prerequisites. Neither is pre-flighted — no admin-scope token is required; the dependency asserts itself by the close's own merge failing loudly.

- **Branch protection on `dev` permits the autonomous merge** — no required human review. The PR-path merge does **not** wait for checks: its merge subject carries `bkit [skip ci]`, so a docs-only close dispatches no run to wait for. A rule requiring status checks to pass will block it.
- **"Automatically delete head branches" is enabled** (repo Settings → General). The PR-path close deliberately does not pass `--delete-branch` — `gh` also deletes the local branch, which fails when that branch is checked out in a worktree and returns non-zero _after_ a successful merge. Head-branch cleanup relies on the repo setting instead.

Confirm both before running phase closes from a cloud agent session.

## Run-level decision matrix

Bkit ships a **mostly flat, wide** scaffold: `bkit-tests-scope` (always-on; reads markers, computes `run_level` / optional `run_migration`, emits `bkit-test-plan` JSON) fans out to every lane — `bkit-tests-static` / `-unit` / `-build` / `-integration` / `-e2e` / `-live` / `-migration` — and `bkit-tests-check` capstone joins them (asserts every expected tier ran and passed). Static/unit/build/integration wait only on the planner. **One exception (#385):** when `bkit-tests-migration` owns the shared-remote `db push`, e2e/live `needs:` that lane with `result != 'failure'` so they cannot race a schema the push has not applied (and a from-empty failure cannot reach remote). Do **not** gate live behind static/unit/build/e2e (~35% wall-clock on real consumer, buys ~nothing). `bkit-tests-migration` (DB repos): always-on (no job-level `if:`); replay plan-/path-gated per-step; remote push on every `dev`/`main` push, un-gated by `run_migration` (self-heal); capstone asserts success whenever scope succeeded (`bkit-stub:bkit-tests-migration`). Before CI speed spend: **measure job graph, find pole** — same consumer: setup levers (browser cache, `node_modules` cache, composite setup, fetch-depth) ~3%; one `needs:` edge 35%; lever on non-pole lane = zero gain. Starter `ci.yml` ships primitives; **FULL CI SCAFFOLD REFERENCE** at end of `.github/workflows/ci.yml` reproduces every step for tier adoption. Table below: `none` / `partial` / `full` shape primitives + plan plug into.

<!-- prettier-ignore -->
| Run level | When | Runs | Defers |
| --- | --- | --- | --- |
| `none` | HEAD has `[skip ci]` / `[skip actions]`; or `cache.outputs.skip == 'true'` (SHA passed in last 7 days). | Nothing (workflow skipped entirely or short-circuited after the cache check). | All gates |
| `partial` | Push to `dev` from a merged PR; routine chore commits without `[force build]`. | Typecheck, unit tests, integration tests, format check, prose + slop lint, bkit check. | Deploy, smoke, E2E. |
| `full` | Push to `{{DEFAULT_BRANCH}}`; PR runs; or any commit with `[force build]` / `[force full]`. | Partial + deploy gate + (optional) Vercel preview await + E2E. | Smoke (runs as `workflow_run` after CI). |

Composition guidance:

- `cache.outputs.skip` = `none` gate — every step: `if: steps.cache.outputs.skip != 'true'`.
- `steps.detect.outputs.should_force_build` / `should_run_full` = escalation into `full`.
- No merged PR on `dev` push (auto `TURBO_FORCE=1`) = recovery signal — partial CI with cache busted.
- Smoke: separate workflow (`bkit-stub:smoke` in `ci.yml`), `workflow_run`-keyed — non-blocking for PR merges, gates production observability.
- Capstone `bkit-tests-check` = SOLE branch-protection required check (`.bkit/scripts/bkit-protect-main.sh`). Green = expected tiers ran and passed (`green == validated`), not merely "tests job didn't fail". Light/cached/partial green by construction — confirm `full` run before treating green as validation.

### Parallel test lanes (one lane per tier)

Each tier = **own parallel lane** (job) — `bkit-tests-static` / `-unit` / `-integration` / `-e2e` (+ `-migration` / `-live`) — **not** monolithic `bkit-tests` steps. Proven shape: bkit CI + consumers gether/fraser run separate lanes. Wall-clock = `max(lane)` not **sum** of serial steps; each tier gets honest coverage + executed-count + job-level permissions; slow tier can't serialise fast ones. Cost: per-lane setup duplicate (checkout/install, shared infra e.g. local DB) — mitigate with turbo remote cache + DB service container. Capstone `needs:` **all** lanes; each emits executed-count for non-hollow assertion (`testing.md` § Validated means executed). Starter: `-static` + `-unit`; add lane per tier. Tiny repo: collapse tiers into one lane steps — capstone must assert each tier count via step outputs. E2E PR-subset tiering + local-vs-preview DB routing → `testing.md` § "E2E on PRs".

**Runner size = per-lane lever, ONLY for pole.** Flat graph → one lane defines wall-clock (commonly E2E). Larger runner (more vCPU/RAM) raises internal parallelism (more workers, concurrent E2E projects) → can cut long lane substantially; scope via `runs-on: <your-larger-runner-label>` to **one** lane, default runner elsewhere. Two caveats: (1) **higher per-minute rate** — confirm before adopting (may not appear until first invoice). [Depot](https://depot.dev/docs/github-actions/runner-types) labels (e.g. `depot-ubuntu-24.04-8`) ~30% cheaper than GitHub-hosted; `ci.yml` consumer-owned; bkit-managed via `bkit.runners` — § Self-hosted Renovate. (2) **Zero wall-clock** when aimed at non-pole lane: consumer measured bigger E2E runner **+0.0 min** while `@live` stayed pole — worth ~7 min ONLY after `@live` gate removed and E2E became pole. Measure first, re-measure after: pole moves.

### turbo `//` over-triggers `web_affected` on docs-only diffs

`bkit-tests-scope` affected-graph (monorepo) forces `web_affected=true` on **real global dependency** change. Turbo attributes any changed root-level path outside workspace / undeclared `globalDependency` (`docs/**`, `README`, `LICENSE`, …) to root `//` (`FileChanged`). Fallback keying on _any_ `//` `FileChanged` can't distinguish global-dep bump from docs-only diff → over-triggers: e2e scheduled, ignore-command cancels docs-only preview, `Await Deployment` reds e2e on **every** docs-only push.

Fix at source: gate global-dep force on **real** global-dep change. Intersect changed root files against `turbo.json` `globalDependencies` / `globalEnv` (+ root lockfile + `package.json`); force `web_affected` ONLY on match. Turbo-pinned `//` (docs, metadata, non-triggering root dirs) must **not** force. Narrow `docs/**`-only guard = same idea, incomplete (`README`-only still over-triggers) — prefer `globalDependencies` intersection. Consumer `ci.yml` (Tier-3 `bkit-stub:affected-graph`); port fix per monorepo. Orthogonal to `[force full]` (deliberately bypasses `web_affected`).

### Promotion-lag warning (`Check Main Lags Dev`)

CI on `dev` proves code good; nothing checks good code reached default branch. Gap bites — surfaces read LIVE from default branch, not `dev` / validated tip:

- **Renovate** resolves its config only from the default branch (see § Customizing Renovate). A `renovate.json5` edit on `dev` is inert until promoted — `useBaseBranchConfig: "merge"` softens this for the config file but is itself read from the default branch.
- **Scheduled / default-branch-triggered Actions** run the default-branch copy of each workflow, so a `.github/workflows/` fix on `dev` does not take effect on those runs until promoted.
- **The published package / production deploy** are cut from the default branch, so unpromoted `dev` work is invisible to consumers.

`Check Main Lags Dev` (`bkit-tests-static` lane) closes blind spot: every `dev` push diffs `renovate.json5`, `renovate.json`, `.github/workflows/**` vs default branch → `::warning::` + `$GITHUB_STEP_SUMMARY` if stale. **Non-blocking** nudge; keys ONLY consumed-from-default-branch surfaces. Clear: `dev` → default-branch PR.

Ships as bkit-managed `main-lag-warning` block (`# bkit:start main-lag-warning` / `# bkit:end main-lag-warning`): `bkit check` → non-blocking `tier2-text-drift` if **missing or drifted**. Sync from template; do not hand-edit. Safe even without default-branch-behind-`dev` gating: `dev` pushes only, self-skips when default branch is `dev`/unset.

## Smoke trigger plumbing

Smoke runs **after** deploy, in its own workflow, off the merge gate (what it actually probes → `testing.md` § Smoke). Pick the trigger by **where the deploy happens**, not by habit:

- **Deploy happens inside CI** → key smoke to **`workflow_run`** (the CI workflow `completed` + `conclusion == 'success'`). Mind the 3-level `workflow_run` chain cap — a fourth chained workflow will not fire.
- **An external platform deploys after merge** (Vercel / Netlify-style Git integration) → key to a **post-_deploy_** signal — `deployment_status` (`state == 'success'`) or the platform's `repository_dispatch` event — so smoke fires when the deploy is actually **live**, not merely when CI finished. `workflow_run` here smokes a not-yet-serving (or about-to-be-replaced) deployment.
- Either way: separate workflow, **non-blocking** (never a required check), and wait for the target to be **serving** before probing — READY ≠ serving (`testing.md` § Deploy-reachability).
- **Not:** smoke wired into branch protection (it gates observability, not merges), or a `workflow_run`-keyed smoke against an externally-deployed app that probes the old build.

## Applying migrations at deploy time

The deploy-time **apply** and the test-time **replay** gate are different guarantees — keep both, preferably in the **same always-on lane** (`bkit-tests-migration`, #385):

- **Apply (deploy path):** push only the **new** migrations onto the already-migrated remote — idempotent (applies what's not yet in the ledger; safe to retry), and it **never** replays from empty or runs the seed. Home: `bkit-tests-migration` on every push to `dev`/`main` (`db push --linked --include-all`), **not** inside `bkit-tests-e2e` (leaving it in e2e while live runs parallel is the schema-cache race). Un-gated by `run_migration` so it self-heals a remote left behind. AFTER the replay steps so a from-empty failure never reaches shared remote.
- **Replay (test path):** the fresh-DB gate proves from-empty replay + seed load (`testing.md` § Migration-replay + seed). Passing one is not passing the other.
- **Immutability:** once a migration is merged, never edit it — ship a new corrective migration. Flag any modification to an already-merged migration file in review.
- **Multiple chains:** apply **every** migration system (e.g. a SQL chain + an ORM / CMS chain), each idempotent and retried independently.
- **Transient-pooler hardening:** remote applies over a connection pooler can blip (e.g. an IPv4 session pooler's `i/o timeout`); wrap link + apply in a bounded retry — idempotency makes a re-attempt after a mid-apply drop safe.
- Ordering of apply vs the deploy's build is a **separate** hazard — § Build-vs-migration race.
- **Not:** assuming the deploy-time apply also validates a clean from-scratch install or the seed — it does neither; **not** putting remote push inside e2e while live is ungated from e2e.

## Build-vs-migration race

If your host auto-deploys on push (Vercel / Netlify Git integration) while CI applies migrations as a **separate, unordered** step, the deploy's build and the migration race. A build-time DB read that lands **before** the migration creates its object hard-ERRORs the **first** deploy shipping it. Build-time reads come from: `sitemap.ts` / `robots.ts`, `generateStaticParams` / `generateMetadata`, an OG-image route, a static (non-dynamic) page's server read, or marking a DB route `force-static` / ISR. Postgres signatures: `42P01` (relation), `42703` (column), `42704` (type), `3F000` (schema).

**Fingerprint:** prod keeps serving the prior deployment, and a redeploy of the **same SHA** clears it — a genuine bad migration would not self-heal on redeploy.

**Fix, strongest first:**

1. **Serialise migrate → deploy.** Disable host auto-deploy for the production branch (keep preview auto-deploys); have CI trigger the prod deploy **after** the migration step succeeds. Schema-before-build by construction.
2. **Belt-and-braces.** Narrowly catch those PG codes in build-time queries (return empty + `dynamicParams` / ISR so the route self-heals on first request) while keeping request-time reads strict (a missing object at request time is a real incident, not a race).

Latent until the first build-time DB read lands, so flag it in review when one is added. Note `bkit-tests-migration` proves migrations _replay_ from empty **and** (on push) owns the remote apply; it still does nothing for build-vs-deploy _host_ ordering — this race is orthogonal to that gate (serialise migrate → deploy at the host).

## Vercel Deployment Checks — hold production promotion until CI passes

Vercel **Deployment Checks** (Project Settings → Build & Deployment → Deployment Checks) hold production promotion until a named GitHub Actions check reports success. The build starts immediately on push (in parallel with CI), but the production alias is NOT updated until the check passes.

### Setup

1. **Dashboard:** Vercel Dashboard → Project → Settings → Build & Deployment → Deployment Checks. Add a check matching the capstone job name (e.g. `bkit-tests-check`).

2. **CI workflow:** Add the `vercel/repository-dispatch/actions/status@v1` action as the last step in the capstone job. This reports the job outcome back to Vercel so the deployment check resolves:

```yaml
- name: Notify Vercel Deployment Check
  if: always()
  uses: vercel/repository-dispatch/actions/status@30f760c6640485cd92f8c785ef361382555fb712 # v1
  with:
    name: "Vercel - <project-name>: <capstone-job-name>"
```

## Disable GitHub Code Quality before GA billing

GitHub **Code Quality** (coverage-on-PR + the _Code Quality: CodeQL_ runs) is free public-preview only until **GA on 2026-07-20**, after which it bills **per active committer + Actions minutes + AI credits** — and it is **opt-out**: repos with default setup enabled are billed silently unless it is turned off first.

- **If your repo had Code Quality default setup enabled, disable it** — repo → **Settings → Code security → Code Quality** (turn off default setup) before the billing start date, or accept the per-committer charge.
- **The bkit coverage stub replaces the coverage-on-PR value only.** `bkit-stub:coverage` gives a free, in-Actions vitest coverage comment (`testing.md` § Coverage on PRs) with no third-party service. It does **not** replace **CodeQL security scanning** — keep or re-enable that separately if you rely on it (a distinct product/decision).

## GitHub Actions pinning

**Pin every third-party dependency to immutable digest; pair pin with updater.** Floating ref (`@v{N}` tag, `ubuntu:26.04` image, unversioned `curl … | bash`) is mutable — compromised maintainer re-points to malicious code on next push with runner token. One exposure class, three surfaces:

- **Actions** — pin every `uses:` to a 40-character commit SHA, never `@v{N}`. Resolve it with `git ls-remote https://github.com/<owner>/<repo>.git 'refs/tags/vX.Y.Z'` and append a `# vX.Y.Z` comment so the version stays human-readable:

  ```yaml
  - uses: actions/checkout@a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e # v4.2.1
  ```

- **Container images** — pin `FROM` to a `sha256:` digest, keeping the tag **inline** so an updater can still track it (`FROM ubuntu:26.04@sha256:…`, not a bare `ubuntu:26.04` nor a digest with the tag in a trailing comment). Resolve with `docker pull <image>:<tag>` (prints `Digest:`).
- **Downloaded installers / binaries** — a `curl … | bash` or release-tarball fetch must either pin its source to an immutable ref (a commit SHA in a `raw.githubusercontent.com` URL, not a mutable git tag) or verify a pinned `sha256sum` before executing/extracting, and pin the tool version explicitly rather than resolving "latest".

Elevated-permission workflows (`packages: write`, `id-token: write`, `contents: write`, or deploy credentials) are where this is **especially critical** — a re-pointed ref there runs with those credentials — but the practice applies to **all** third-party refs, not only elevated ones.

**Pair with updater.** Pinning freezes version — without updater, CVEs in pinned refs stay unpatched indefinitely. Pinning without updater worse than not pinning. bkit: `pnpm bkit install --dependency=renovate` (recommended — phase-gated, monorepo-aware, lockfile maintenance) or `pnpm bkit install --dependency=dependabot` (first-party GitHub, no third-party trust surface). Canonical Renovate config: `.bkit/templates/.github/renovate.json5`.

**Choosing a Renovate runner (mend vs self-hosted).** Renovate runs on the **Mend Community Cloud App** by default (`--renovate=mend`) — recommended for almost every repo (free, one-click, nothing to operate). The one reason to switch is scale: a large pnpm monorepo can exhaust Mend's fixed **3 GB hosted-runner memory** and fail every run with `kernel-out-of-memory` (KN-CORE-10). Those repos run Renovate **self-hosted** on GitHub Actions instead (`--renovate=self`, `ubuntu-latest` ~16 GB). Start on `mend`; move to `self` only if you hit the OOM (the `pnpm-release-age-gate-oom` advisory points you there when you do). Full details, token setup, and the migration steps are in § Self-hosted Renovate below; the rest of this section (config, grouping, activation) applies to both runners.

The shipped config:

- Sets `baseBranches: ["dev"]` — bkit consumers gate `main` to PRs-from-`dev`-only, so Renovate PRs must land on `dev`. Mandatory; not optional. Paired with `useBaseBranchConfig: "merge"` so config edits committed to `dev` are honored for dev-targeted runs — **without it Renovate reads config only from the default branch (`main`), so any `renovate.json5` change on `dev` is silently ignored until released to `main`.** Bootstrap caveat: `useBaseBranchConfig` is itself read from `main`, so it needs one merge to `main` before dev-side config takes effect (see § Renovate activation below).
- Runs weekly (`schedule: ["before 6am on Monday"]`) with lockfile maintenance. **All auto-mergeable non-major bumps collapse into a single `automerge: true` PR** (`groupName: "bkit: renovate non-major dependencies"`): devDependency minor+patch, production patches, `@types/*`, the eslint family, and the non-major bumps of the multi-package ecosystems (`@tanstack/*`, `vitest`/`@vitest/*`, `@playwright/*`). Rationale: every Renovate PR rewrites `pnpm-lock.yaml`, so several auto-merge PRs firing in one window force a serial rebase cascade that stalls `platformAutomerge` — one shared group means one lockfile mutation, one merge, no cascade. Reviewed separately, never auto-merged: production **minor** bumps; **all majors** (one PR each, `dep-major` label); and **ecosystem majors** — `@tanstack/*`, `vitest`/`@vitest/*`, `@playwright/*` are each grouped at the major level so a coordinated breaking bump lands in one reviewed PR (otherwise the peer-coupled halves split into separate per-package PRs and fail CI against each other).
- Enables `osvVulnerabilityAlerts: true` so CVE-driven PRs fire immediately regardless of schedule.
- Caps pnpm's worker pool (`env: { PNPM_WORKERS, PNPM_MAX_WORKERS }`) and enforces release-age freshness in Renovate (`minimumReleaseAge: "1 day"`) — the pnpm-11 microvm-OOM mitigation. See § Renovate pnpm-11 freshness gate & microvm memory below; large monorepos on a pnpm-level `minimumReleaseAge` gate must also drop it to clear the OOM.
- For the `github-actions` ecosystem: `pinDigests: true` keeps every `uses:` line on a 40-character SHA + tag comment, refreshed on upstream releases and CVE disclosures.
- For the `dockerfile` manager: image `FROM <image>:<tag>@sha256:<digest>` pins are refreshed on upstream releases and CVE disclosures (the tag stays inline so Renovate can map digest→tag). Installer fetches pinned by a paired **version + `sha256sum`** (the Vale tarball in `ci.yml`) or by a **commit SHA in a raw URL** (the actionlint download-script) are **not** Renovate-managed — it cannot recompute a tarball checksum — so bump those version/sha pairs by hand when you upgrade the tool.
- For bkit-managed workflow files (`bkit-cloud.yml`): the file is listed in `ignorePaths` so Renovate never scans it — new SHAs/versions arrive via `bkit install`, not consumer Renovate. The `ignorePaths` entry is load-bearing: a packageRule `enabled: false` alone only suppresses _version updates_, but the `github-actions` manager still scans the file and applies tag→SHA `pinDigests`, which recreates a `chore(deps): Pin dependencies` PR on every scan. A `matchFileNames` + `enabled: false` packageRule is kept as a secondary guard.
- Carries no private-registry token itself — the `hostRules` token anchor for `npm.pkg.github.com` is seeded into the consumer-owned `renovate-local.json5` instead, so it survives `bkit upgrade` (this file is canonical-overwrite and would clobber a token added here). You must provision a read token there to make Renovate's lockfile regeneration work (see § Renovate read-auth below). Without it, every dependency PR fails CI.
- `extends` a consumer-owned local preset (`local>{{REPO_SLUG}}//.github/renovate-local.json5`) so you can add repo-specific rules that survive `bkit install`/`bkit upgrade` (see § Customizing Renovate below). `renovate.json5` itself is bkit-managed and rewritten on every `bkit install` — hand-edits there are clobbered.

**Exemption — `bkit-cloud.yml`:** The bkit-canonical `bkit-cloud.yml` uses floating major-version tags (e.g. `actions/checkout@v4`, `anthropics/claude-code-action@v1`) rather than SHA pins. The `ignorePaths` entry above keeps consumer-side Renovate out of this file entirely. New SHAs/versions arrive via `bkit install` when consumers bump the bkit package, not via consumer Renovate. SHA-pinning applies to your own CI workflows (`ci.yml` and any custom workflows), not to `bkit-cloud.yml`.

**Renovate activation (phase-gated).** Renovate is opt-in via `pnpm bkit install --dependency=renovate`. The Renovate App's first scan reads the default branch — installing the App before the config reaches `main` produces a broken onboarding PR (wrong base branch, ungrouped, redundant root `renovate.json`). bkit-install enforces the order via a two-phase flow:

1. **Phase A** (first run, config not yet on `origin/<default-branch>`): writes `.github/renovate.json5` to the working tree and prints a prompt to commit, open a PR to your integration branch, and merge through to the default branch. Do NOT install the Renovate App yet.
2. **Phase B** (re-run after merge to default branch): bkit detects the file on `origin/<default-branch>` and prints the App install URL https://github.com/apps/renovate (Mend Community Cloud, one-click, free — no `gh api` equivalent) plus the activation checklist (verify onboarding PR base branch, disable Dependabot version updates, merge onboarding PR). Within ~5 minutes of install, Renovate opens its onboarding PR; merge it and the first batch of grouped update PRs follows on the next scheduled run.

> **Why Renovate over Dependabot:** Renovate is monorepo-aware (one PR per dependency group, not one per package), supports lockfile maintenance, scopes bumps per file via `matchFileNames`, and respects `baseBranches` natively — no equivalent of Dependabot's silent-inert behaviour when the config sits anywhere other than the default branch. Renovate is Apache-2.0 OSS; the Mend Community Cloud App is a free hosted instance, self-hostable via `renovatebot/github-action` if you ever want to drop the Mend dependency. bkit ships that self-hosted path as a first-class opt-in (`--renovate=self`), primarily for repos that OOM on Mend's 3 GB runner — see § Self-hosted Renovate (GitHub Actions alternative to Mend) below.

(Security invariant: Renovate PRs run with a restricted `GITHUB_TOKEN` and no access to the cloud lane's model-auth secrets (`secrets.ANTHROPIC_API_KEY` / `secrets.OPENCODE_PROVIDER_KEY`) — `bkit-cloud.yml` will not dispatch on them by design. See `security.md` § Supply-Chain.)

### Renovate read-auth for the private package

`@cbartens/bkit` lives on GitHub Packages (`npm.pkg.github.com`, restricted). To regenerate `pnpm-lock.yaml` after bumping **any** dependency, Renovate resolves the whole workspace — including `@cbartens/bkit` — so it needs read auth to that registry. Without it, lockfile regeneration fails, every dependency PR lands with a stale lockfile, and CI fails `pnpm install --frozen-lockfile` with `ERR_PNPM_OUTDATED_LOCKFILE`. Disabling _updates_ to `@cbartens/bkit` does not help — the regen for unrelated deps still resolves it.

**Critical:** the `GH_BKIT_TOKEN_INSTALL` you set as a GitHub Actions secret for CI is **not** visible to Mend's hosted Renovate runner. The token must be provisioned on Renovate's side. Your consumer-owned `.github/renovate-local.json5` ships a commented `hostRules` anchor for `npm.pkg.github.com`; finish it via the path matching your setup. (It lives in `renovate-local.json5`, not the canonical `renovate.json5`, so it survives `bkit upgrade` — Renovate merges `hostRules` across extended presets, and a secret-bearing token in the local preset is honored.)

- **Mend Community Cloud (hosted, default):** Add `GH_BKIT_TOKEN_INSTALL` (a PAT with `read:packages`) as a **Mend repository secret** at https://developer.mend.io/github/<owner>/<repo> → Settings → Secrets. **In the secret dialog, tick the "If checked - secret will be used during the scan as an environment variable." box** — this is required: without it the secret exists but is never exposed to the scan, so lockfile regeneration still 401s exactly as if no token were set. Then uncomment the `token: "{{ secrets.GH_BKIT_TOKEN_INSTALL }}"` line in `.github/renovate-local.json5` so the `hostRules` entry resolves the secret. (Do not commit a literal token; `{{ secrets.* }}` references the dashboard secret.)
- **Self-hosted Renovate:** Inject the token via the `RENOVATE_HOST_RULES` env var, the bot's `config.js`, or an `encrypted: { token: "<blob>" }` field encrypted with your own bot key — no edit to the committed `token` line needed.

Do **not** use an `encrypted` block on Mend hosted: the Mend cloud apps no longer read `encrypted` secrets from repo config — only dashboard secrets (the path above). The `encrypted` route is self-hosted only.

This is part of Phase B activation; `pnpm bkit install --dependency=renovate` prints it in the activation checklist. The `hostRules` anchor in `renovate-local.json5` is inert (no-op) until you uncomment the token, so it never breaks consumers who have not provisioned it yet — and because that file is consumer-owned (never overwritten), your activation is not clobbered on the next `bkit upgrade`.

### Renovate pnpm-11 freshness gate & microvm memory

The shipped `renovate.json5` carries two Renovate-scoped mitigations for a physical OOM (`Error: kernel-out-of-memory`) that large **pnpm 11** monorepos hit on Mend's low-RAM hosted runner during `pnpm update --lockfile-only`:

- **(A) Worker cap** — `env: { PNPM_WORKERS: "1", PNPM_MAX_WORKERS: "1" }` bounds pnpm's worker-pool memory. Both vars are allow-listed by Mend's `global:safeEnv` preset (no admin `allowedEnv` change needed) and the cap touches only Renovate's runner, never CI/Vercel/local. `--lockfile-only` barely engages the worker pool, so this alone may **not** clear a metadata-driven OOM.
- **(B) Renovate-native freshness** — `minimumReleaseAge: "1 day"` holds deps younger than 24h out of PRs with **no** per-install timestamp verification. Security / `osvVulnerabilityAlerts` PRs bypass it by design, so CVE fixes are never delayed.

**Consumer action for (B) — this is the part that actually clears the OOM.** pnpm 11 defaults `minimumReleaseAge` to **1440** (pnpm 10 defaulted it off), so the per-install gate is active **even with no key set** — and it, not Renovate's `minimumReleaseAge`, verifies a publish timestamp for every dependency on every install and OOMs the microvm. Set **`minimumReleaseAge: 0`** as a top-level key in your **`pnpm-workspace.yaml`**: `0` short-circuits the per-entry check entirely (fast install, no OOM). Do **not** just delete the key — pnpm 11 falls back to the `1440` default, so the gate (and the OOM) stay active, and you lose any `minimumReleaseAgeExclude`, which makes same-day `@cbartens/bkit` upgrades fail the gate. Safe for `--frozen-lockfile`: pnpm does not record `minimumReleaseAge` in `pnpm-lock.yaml`'s `settings:` block. `bkit install`/`upgrade` surfaces this as the `pnpm-release-age-gate-oom` advisory (fires on pnpm 11 + Renovate active whenever the gate is not `0`).

**Trade-off.** The pnpm gate aged **every** install (Renovate, CI, Vercel, local, and manual/transitive installs); Renovate-only freshness gates only what Renovate proposes. Accept a small reduction in supply-chain defense-in-depth in exchange for clearing the OOM and faster CI/Vercel builds — or keep the pnpm gate and rely on (A) alone. Either way, **verify against a live Renovate run** with the config on your default branch (Renovate reads config from there); the OOM cannot be reproduced or cleared from a local checkout.

### Self-hosted Renovate (GitHub Actions alternative to Mend)

For repos that OOM on Mend's 3 GB hosted microvm (`Error: kernel-out-of-memory`, 3.0/3.0 GB during `pnpm update --lockfile-only` — see § Renovate pnpm-11 freshness gate & microvm memory above and KN-CORE-10), bkit ships an opt-in self-hosted runner: `pnpm bkit install --renovate=self`. It writes a bkit-managed `.github/workflows/renovate.yml` that runs `renovatebot/github-action@<pinned-sha>` on `ubuntu-latest` (~16 GB — the OOM cannot occur there), moving the execution engine off the Mend App into your own Actions. Default is `--renovate=mend` (the hosted App, § Renovate activation above). Mode is recorded in `package.json` `bkit.renovateRunner`; switch by re-installing with the other value (mend ↔ self). A plain `--dependency=renovate` re-install **preserves** an existing self-hosted mode (detected from the field + `renovate.yml`'s presence), so a routine `bkit install`/`upgrade` never silently reverts you to Mend.

**Custom runner label (Depot / GitHub larger runner / self-hosted).** The `runs-on:` of the self-hosted `renovate.yml` — and both jobs of `bkit-cloud.yml` — are bkit-substituted from a `bkit.runners` config key in `package.json`, so a consumer can point them at any runner without fighting the canonical-overwrite drift gate (the value is rendered from config on every `bkit install`/`upgrade`, so it survives). Unset → `ubuntu-latest` (zero change for existing repos). The label is arbitrary: a GitHub-hosted larger runner, a [Depot](https://depot.dev/docs/github-actions/runner-types) label (`depot-ubuntu-24.04-4`, ~30% cheaper per-minute), or a self-hosted label. For Renovate keep ≥16 GB of headroom (KN-CORE-10). Shape:

```jsonc
"bkit": {
  "runners": {
    "default": "ubuntu-latest",     // fallback for any bkit-managed workflow
    "renovate": "depot-ubuntu-24.04-4",
    "bkitCloud": "depot-ubuntu-24.04" // both cloud jobs (claude + opencode) share one label
  }
}
```

Precedence per workflow: the specific key (`renovate` / `bkitCloud`) → `default` → literal `ubuntu-latest`. `ci.yml` is consumer-owned (not canonical) — edit its `runs-on:` directly.

**Config is single-source — the mode IS the workflow file's presence.** `renovate.json5` is byte-identical for both runners (nothing in it names Mend); the whole difference is whether `.github/workflows/renovate.yml` exists. The workflow does no checkout and sets no `configurationFile` — Renovate autodiscovers `.github/renovate.json5`. Everything under § GitHub Actions pinning applies unchanged: the `dev` base branch, `useBaseBranchConfig: "merge"`, the grouping/auto-merge rules, and `osvVulnerabilityAlerts`. Because `renovate.json5` sets `env: { PNPM_WORKERS, PNPM_MAX_WORKERS }` and `allowedEnv` is a global-only option, the shipped workflow sets `RENOVATE_ALLOWED_ENV: "PNPM_*"` (Mend permits these via its safeEnv preset) — without it the self-hosted bot rejects the whole config. bkit ships this in the workflow; you do not configure it.

**Schedule reconciliation — do NOT narrow the cron to weekly.** The workflow triggers on `schedule: cron "17 6 * * *"` (once daily) + `workflow_dispatch` (inputs `logLevel`, `dryRun`), with `timeout-minutes: 30`, `permissions: contents: read`, and `concurrency: { group: renovate, cancel-in-progress: false }` (serialise runs so two never race the lockfile). The cron only _wakes_ the bot; `renovate.json5`'s own `schedule` ("before 6am on Monday") still gates when normal PRs open, and `osvVulnerabilityAlerts` CVE PRs bypass both. A daily wake bounds worst-case CVE-PR latency to ~24h; narrowing the cron to Monday-only would delay CVE PRs by up to a week — the two schedules are layered by design, so keep the cron at least daily.

**Platform auth — a `GH_BKIT_TOKEN` secret, never `GITHUB_TOKEN`.** Set a repo secret `GH_BKIT_TOKEN`; the workflow authenticates Renovate with it. `GITHUB_TOKEN` does **not** work here: PRs opened under it do not trigger CI, so required checks never run and `platformAutomerge` / branch-protection never fire. Use a fine-grained PAT scoped to THIS repo:

<!-- prettier-ignore -->
| Repository permission | Access |
| --- | --- |
| Contents | Read and write |
| Pull requests | Read and write |
| Workflows | Read and write |
| Commit statuses | Read and write |
| Issues | Read and write |
| Dependabot alerts | Read |
| Metadata | Read-only |

`Commit statuses: Read and write` lets Renovate read a commit's CI state (to open the PR and gate `platformAutomerge`) and post its own internal checks (e.g. `renovate/stability-days`); **without it Renovate creates the `renovate/*` branch but 403s on `GET /commits/{sha}/statuses` and never opens the PR** — the tell-tale symptom is a lone `renovate/*` branch with no PR and no CI run. Fine-grained PATs have **no separate `Checks` permission** (check-run _writes_ are GitHub-App-only), so commit statuses is the mechanism a PAT-based Renovate uses — do not go looking for a Checks toggle. `Dependabot alerts: Read` lets Renovate read GitHub's vulnerability feed for security-fix PRs; without it the run logs a harmless `403` and relies on `osvVulnerabilityAlerts` (OSV) alone. (Classic-PAT equivalent: `repo` + `workflow`.) If `GH_BKIT_TOKEN` is missing or under-scoped, no Renovate PRs open and the scheduled Actions run 401s. Keep it **separate** from `GH_BKIT_TOKEN_INSTALL` (which stays `read:packages`-only, least privilege — see § Renovate read-auth above). **Hardening (no annual PAT expiry):** swap the PAT for a self-managed GitHub App — store its `APP_ID` + private key as secrets and mint a short-lived installation token in the workflow via `actions/create-github-app-token`. This is NOT the one-click `/install-github-app` used for Claude (that OIDC broker is Anthropic-specific and has no Renovate equivalent).

**Commit author (`RENOVATE_GIT_AUTHOR`) — matters on org repos.** Renovate authors its branch commits from the token owner's email, read via the `Email addresses: Read` **Account** permission. That permission only exists on **personal-account** fine-grained PATs — an **org-owned** token has no such permission (only Organization + Repository permissions), so Renovate can't read an email and falls back to the Mend bot author (`renovate@whitesourcesoftware.com`), which shows commits as `Unverified`. The portable fix: set the repo **variable** `RENOVATE_GIT_AUTHOR` (Settings → Secrets and variables → Actions → **Variables**), e.g. `Renovate Bot <renovate@your-domain>`; the shipped workflow reads `${{ vars.RENOVATE_GIT_AUTHOR }}`. On a personal-account repo you can instead add `Email addresses: Read` to the token and leave the variable unset. (Cosmetic either way — commit attribution only.)

**Enable GitHub's vulnerability feed — alerts ON, auto-fixes OFF.** For Renovate's security-fix PRs (and to clear the `Dependabot alerts` `403`), enable the detection feed but NOT Dependabot's own remediation. In **Settings → Advanced Security**:

<!-- prettier-ignore -->
| Setting | Set to | Why |
| --- | --- | --- |
| Dependency graph | **Enabled** | prerequisite for Dependabot alerts |
| Dependabot alerts | **Enabled** | the vulnerability feed Renovate reads |
| Dependabot security updates | **Disabled** | this makes _Dependabot_ open fix PRs — competing with Renovate. Renovate opens them itself |
| Dependabot version updates | **Disabled** | the version-bump bot Renovate replaces (mutually exclusive) |

The rule: **detection ON, auto-fixing OFF.** Dependabot feeds vulnerabilities to Renovate; Renovate does all the PR work. (Malware alerts / automatic dependency submission are harmless if you also want them.)

**Private-registry auth — `RENOVATE_HOST_RULES`, keep the token line COMMENTED.** Self-hosted has no Mend dashboard, so the `{{ secrets.GH_BKIT_TOKEN_INSTALL }}` templating from § Renovate read-auth does not apply. The workflow instead injects the `@cbartens/bkit` read token via env:

```
RENOVATE_HOST_RULES=[{"matchHost":"npm.pkg.github.com","hostType":"npm","token":"${{ secrets.GH_BKIT_TOKEN_INSTALL }}"}]
```

Leave the `token:` line in `.github/renovate-local.json5` **commented** — an uncommented Mend-style line adds a second, empty-token `hostRules` entry that 401s self-hosted. `GH_BKIT_TOKEN_INSTALL` is still required, as the Actions secret the env above reads.

**Migrating off Mend — suspend the App first (mutual exclusion).** Mend and self-hosted both open `renovate/*` PRs against the same repo; leaving both active duplicates every PR. When you enable self-hosted, SUSPEND the Mend App for the repo: GitHub UI → Settings → Applications → Renovate → Configure → remove this repo from its access list (no `gh api` equivalent). The App's per-repo state is off-repo, so bkit cannot verify it — `bkit install`/`check` emits the warn-only `renovate-self-hosted-mend-both-active` advisory as a reminder. Keep the default `renovate/` `branchPrefix`: self-hosted Renovate then ADOPTS the existing Dependency Dashboard issue + open Mend PRs instead of opening a parallel set.

**Observability replaces the Mend dashboard.** Failures surface as GitHub Actions run failures (GitHub emails the scheduled workflow's last committer) plus the in-repo Dependency Dashboard issue Renovate maintains. Reproduce a run on demand via `workflow_dispatch` → `logLevel=debug` / `dryRun=full`.

**OOM mitigations are KEPT, not relaxed.** The `PNPM_WORKERS` / `PNPM_MAX_WORKERS` cap is ~no-op under `--lockfile-only`, and both `minimumReleaseAge` knobs (Renovate-side + the `pnpm-workspace.yaml` gate) double as supply-chain / CI-speed controls independent of runner size — so § Renovate pnpm-11 freshness gate stays in force on 16 GB. Only the `pnpm-release-age-gate-oom` advisory is suppressed when `renovate.yml` is present (the OOM it warns about cannot occur on ubuntu-latest).

**`renovate.yml` is bkit-owned → it goes in `ignorePaths`.** Like `bkit-cloud.yml`, the SHA-pinned `renovatebot/github-action` in `renovate.yml` is listed in `renovate.json5`'s `ignorePaths` so the `github-actions` manager never re-pins bkit's own workflow (KN-CORE-5 — `enabled: false` alone is insufficient; only `ignorePaths` stops the scan). New action SHAs arrive via `bkit install`, not consumer Renovate.

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
