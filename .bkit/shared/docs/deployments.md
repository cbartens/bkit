<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Deployments

> [!CAUTION]
> **Purpose:** Deployment / environment config / CI/CD pipeline rules — secrets sync, branch protection, run-level tiers.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Notation: one job per mark — `.bkit/prompts.md` § `Notation`.
> - Describe current state / rules, not reasons / history; state what to do, not why.
> - Check `.agents/docs.md` index first and confirm topic belongs in this doc, not another.
> - Pre-push runs project gate set locally (see "Pre-push checklist" below); never `--no-verify`.

## Production rollback runbook

> Bad commit on `main` (production) → unwind to prior known-good SHA. Steps 1-4 are host-agnostic; step 5 re-points the host (commands = Vercel example).

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
5. **Re-point production deployment** at the host. A host that aliases production to its latest build does not auto-rollback on git ref rewrites, so the alias stays on most-recent push until manually promoted. Look up prior good deployment by commit SHA and promote it. e.g. Vercel:
   ```bash
   vercel ls --meta githubCommitSha=<green-sha>
   vercel promote <prior-deployment-url>
   ```
   Without this step: git ref rolled back but production still serves bad build.

### Why force-push on `main` alone is not enough

- `git revert` on cross-branch squash (e.g. `feat/*` landed on `main` not `dev`) can delete files `main` code still references → tree fails CI despite "clean" history.
- `feat/*`-onto-`main` is root cause of destructive recovery; production merges MUST come from `dev` (single-feature squash scope).
- On `revert-*` branches pre-push drops only the **unit lane** (`bkit:gate:static` in place of `bkit:gate:static-unit`), so the static lane and the bkit drift gate still run → revert PR pushable when source state transitionally inconsistent.

### Post-rollback verification

- `gh api repos/{OWNER}/{REPO}/git/refs/heads/main --jq .object.sha` must equal the green SHA.
- `curl -sI https://{prod-alias}` headers report the rolled-back deployment id.
- Run the production smoke suite to confirm the rolled-back app behaves as expected.

## Dev rollback runbook

> Bad commit on `dev` → unwind to prior known-good SHA. Use when rolled-out range included applied migrations, because code-only rollback leaves dev DB ahead of code; schema-aware tests (schema introspection, access-policy integration) fail on otherwise-clean tree. Steps are DB-agnostic; commands = Supabase example.

### Preconditions

- Known-good SHA on `dev`. Confirm: `gh run list --branch dev --status success --limit 5` (target SHA green).
- Local repo on `dev`, clean tree, `gh auth status` green.
- `bkit-tests-migration` adopted — it owns the remote apply (§ Applying migrations at deploy time).
- Dev DB admin connection string in local env (e.g. Supabase: service-role `SUPABASE_DB_URL`).

### Playbook

1. **Revert the bad range locally.** never `git reset` or force-push `dev` (`.agents/rules.md` § Git, CI & Merges). Do not push yet, because CI on the push must meet the reset DB. Merge commit in range → revert it with `-m 1`.
   ```bash
   git revert --no-edit <green-sha>..HEAD
   git diff --stat <green-sha> HEAD   # empty = tree matches known-good
   ```
2. **Reset the dev DB.** Drop every schema your migrations create (`CASCADE`), truncate the migration ledger. Name only your own app-managed schemas. e.g. Supabase (`public` shown; add each schema your migrations create):
   ```bash
   psql "$SUPABASE_DB_URL" -c 'DROP SCHEMA IF EXISTS public CASCADE;'
   psql "$SUPABASE_DB_URL" -c 'TRUNCATE supabase_migrations.schema_migrations;'
   ```
3. **Push the revert.** The push run's `bkit-tests-migration` re-applies every migration on the reverted tree (empty ledger → all new); never apply by hand. `dev` protected → push the revert on a `revert-*` branch and merge its PR; the apply runs on the merge push to `dev`.
   ```bash
   git push origin dev
   ```
4. **Re-seed fixtures** (if the dev DB is seeded) once `bkit-tests-migration` is green, with your seed command (e.g. `pnpm db:seed`). Then re-run lanes that read seed data: `gh run rerun <run-id> --failed`.

### Why code-only rollback is not enough

- Revert removes the range's migration files from the tree; their migrations stay materialised, because DB has no "unapply" for code-driven migrations.
- Schema-introspection tests (columns, access policies e.g. RLS, table presence) see structure code no longer declares → drift failure.
- Apply after ledger truncate re-applies only the reverted tree's migrations → DB aligns with code.

### Post-rollback verification

- `git diff --stat <green-sha> origin/dev` must print nothing.
- Migration ledger must match the reverted tree's migration files. e.g. Supabase: `psql "$SUPABASE_DB_URL" -c 'SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;'` vs `ls supabase/migrations/`.
- Re-run the schema-aware test suite (e.g. `pnpm test:integration`) to confirm DB and code agree.

## Commit-message force tags

Bkit `bkit-ci.yml` recognises tags below. Case-sensitive, literal `[...]` form; may appear anywhere in source string. Tags compose: multiple on same commit / PR title fire independently.

**Where to put the tag — read carefully:**

- **Direct push to `dev` or `{{DEFAULT_BRANCH}}`** (no PR): tag in **commit message** (`github.event.head_commit.message`).
- **Feature branch with open PR** (open / synchronize / edit): tag in **PR title** (`github.event.pull_request.title`). Commit message not consulted, because the workflow fires on `pull_request`, not `push`.
- **Both surfaces** checked by `contains()` in env block — marker in either wins for its event. Pick right one: `[verbose ci]` in feature-branch commit message has no effect, because only the PR title is read.
- **`workflow_dispatch`**: neither field populated → **every** marker inert (planner sets `MSG=""` for non-`push`/`pull_request` events; `[force full]` / `[force build]` / `[verbose ci]` all dropped, silently). Steer a dispatch with **inputs**, never a marker — mandatory when the dispatch default is expensive: consumer's dispatch forced both metered native build lanes past their reuse gate, 30 builds against a $45/mo limit in one month, until an input (default `false`) gated the lookup.

<!-- prettier-ignore -->
| Tag | Effect | Scope |
| --- | --- | --- |
| `[force cache]` | Busts the task-runner cache for the run — recompute instead of replaying cache hits (e.g. turbo: `TURBO_FORCE=1`). Runs the suite even when the SHA already has a green run. Use when investigating suspected ghost-greens. | Read by `Check SHA Cache` and `Detect Direct Push` |
| `[force build]` | The lighter hammer. Exposes `should_force_build=true` + `run_level=full`; does **not** bypass `web_affected`, so no integration / e2e / @live unless web is genuinely affected. Rebuild without paying @live's side effects. Runs the suite even when the SHA already has a green run; deploy steps act on it only when they gate on the output. | Read by `Check SHA Cache` and `Detect Direct Push` |
| `[force full]` | The hammer. `run_level=full` **and** it bypasses `web_affected`, so integration, `bkit-tests-e2e-web`, and `bkit-tests-live-web` run on any commit, including docs-only. The E2E spec set does not change, because a PR already runs the full suite. `@live` stays **push-only** (a docs-only `[force full]` push reaches it through the effective `web_affected`; never a PR, never a dispatch). | Read by `Detect Direct Push` step |
| `[verbose ci]` | Escalates log detail for one run. Shipped stub flips turbo / Node / Vercel / Supabase / Playwright knobs: `TURBO_LOG_LEVEL=full`, `NODE_OPTIONS=--trace-warnings --trace-deprecation` (a job-level `env:` key, never a `$GITHUB_ENV` write, which the runner rejects while still reporting success), `DEBUG=vercel:*,supabase:*`, plus Playwright `--trace=on` (when E2E stub enabled). Add your stack's equivalents to the same `env:`. Use when `bkit-debug` diagnose returns thin evidence; never for routine pushes (trace.zip files are MB-scale). See `testing.md` for the full knob list and the `--reporter=line` hostile gap. | Read by the job-level `env:` of `bkit-tests-static` (copy the same `env:` onto each lane) |
| `[skip ci]` / `[skip actions]` | Honoured natively by GitHub Actions, so it suppresses workflow dispatch entirely. Use sparingly: the suppressed run will not appear in `gh run list`, and downstream `workflow_run` triggers will not fire. | Native GitHub behaviour, not a bkit-level toggle |

**Two deploy-forcing markers only: `[force build]` + `[force full]`.** No granular `[force e2e]` / `[force live]` — they would be silent no-ops gated behind `web_affected`. `[force full]` = single gate-bypass ("validate everything") → one effective `web_affected` drives integration + e2e + @live uniformly.

- **Precedence — `[skip ci]` / `[skip actions]` hard-vetoes any force marker.** `[skip ci]` commit never dispatches (native GitHub suppression, before `bkit-ci.yml`) — no force marker un-suppresses. To validate would-be-skipped commit: drop `[skip ci]`, push with `[force full]`.
- **`[force cache]` orthogonal** — busts task-runner replay (e.g. turbo `TURBO_FORCE=1`), different axis from which lanes run. Never folded into `[force full]`. Combine `[force full] [force cache]` for "everything, fresh."
- **Marker parity (deploy-forcing set).** e2e / @live lanes resolve per-SHA deployment → marker that force-runs them must **also** force host build, or lane dies at "resolve deployment URL". Host build-cancel script (e.g. Vercel `ignoreCommand`) must honor **every** marker in the deploy-forcing set (`[force build]` + `[force full]` shipped, plus any consumer marker widening a deploy-backed lane); assert in CI (`grep -qF` over cancel script). `[force cache]` / `[verbose ci]` / `[skip ci]` test-plane-only — not honored by cancel script.
- **Match a signature, not a spelling.** Value-list marker (`[platform web ios]`) is invisible to a substring test for `[platform web]` → match the opening token (`[platform `) on both sides. Assertion pinned to one spelling stays green while the cancel script kills the build the marker asked for.
- **A widening marker is an or term, never a condition.** Marker that adds a lane the affected graph missed must only widen. As a condition (`contains(plan.platforms, 'web')` in a lane `if:`) it also **removes**, because `[platform ios]` on a web-touching commit silently drops the web lane, run green. Guard the direction over the workflow text; mutation-prove both ways. Intent does not hold this shape.
- **Widen job gate + step gates together, or not at all.** Job-level `if:` alone → lane starts, every step inside skips: green lane that ran nothing, namely the capstone's own failure mode, arriving where the capstone cannot see it. One consumer found 25 step-level readers of `web_affected` behind 4 job-level ones; count them before widening a shared plan value. Forcing a **subset** (builds without their tests) → do not widen the shared value: derive a **new** boolean beside it (`build_forced` next to `web_affected`), gate only the lanes it owns. Valid only for a lane with **no** step-level reader of that value; assert it directly, error message naming what breaks when someone adds one.
- **Invoke the marker parser unconditionally.** Substring pre-gate in front of a parser = silent no-op: consumer gated on the literal `[screenshots ` **with a trailing space** → bare `[screenshots]` never reached the parser, step exited 0 with an empty plan, run green having captured nothing. Parser runs every time and owns every failure class (unknown value, invalid combination, arguments to a bare flag) — loudly, in the planner, before any lane starts.

Direct push to `dev` (no merged PR ancestry) auto-busts the task-runner cache (e.g. turbo `TURBO_FORCE=1`) regardless of tags. See `bkit-debug` runbook for cache-bust rationale.

## Autonomous phase-close prerequisites

Design / plan Close Workflow lands docs on `dev` two ways. When the runtime can push `dev` (`RUNTIME_DEVPUSHES=true` — laptop, GitHub-Actions runner) it runs the local squash-merge and direct push: **no repo setting is required, and no PR is created**. When it cannot (cloud agent session, or an unclassified runtime) it opens a PR and squash-merges it, which adds two repo prerequisites. Neither is pre-flighted, because no admin-scope token is required; the dependency asserts itself by the close's own merge failing loudly.

- **Branch protection on `dev` permits the autonomous merge**, because no human review is required. The PR-path merge does **not** wait for checks: its merge subject carries `bkit [skip ci]`, so a docs-only close dispatches no run to wait for. A rule requiring status checks to pass will block it.
- **"Automatically delete head branches" is enabled** (repo Settings → General). The PR-path close deliberately does not pass `--delete-branch`, because `gh` also deletes the local branch, which fails when that branch is checked out in a worktree and returns non-zero after a successful merge. Head-branch cleanup relies on the repo setting instead.

Confirm both before running phase closes from a cloud agent session.

## Run-level decision matrix

Bkit ships a **mostly flat, wide** scaffold: `bkit-tests-scope` (always-on; reads markers once, computes `run_level` / optional `run_migration` / `tenant_target`, emits `bkit-test-plan` JSON) fans out to every lane — `bkit-tests-static` / `-unit` / `-build-web` / `-build-ios` / `-build-android` / `-integration` / `-e2e-web` / `-e2e-ios` / `-e2e-android` / `-live-web` / `-migration` / `-reset` / `-cleanup` — and `bkit-tests-check` joins them. `bkit-tests-deploy` runs on a push to the default branch only, promotes the release **before** the E2E / `@live` lanes run, and is not required. Static/unit/integration/build wait only on the planner. **Ordering edges:** when `bkit-tests-migration` owns the shared-remote migration apply, every lane that hits that database `needs:` it with `result != 'failure'`; on the default branch migration also waits for static / unit / integration / build-web before touching production's database. `bkit-tests-reset` sits after migration and before those lanes. On the default branch every tenant lane `needs:` `bkit-tests-deploy` and refuses unless production serves this run's build. Do **not** gate `bkit-tests-live-web` behind static/unit/integration/e2e. Adopt only the lanes this repo has. Lane names and the adopt order: `testing.md` § CI test tiers. Before CI speed spend: **measure job graph, find pole**. The jobs above the reference in `bkit-ci.yml` are the any-repo starter. The **full CI scaffold reference** names each target job's `needs`, `if`, and step order. When a starter stub disagrees with that reference, follow the reference.

<!-- prettier-ignore -->
| Run level | When | Runs | Defers |
| --- | --- | --- | --- |
| `none` | `[skip ci]` / `[skip actions]`, or `cache.outputs.skip == 'true'` (this SHA went green in the last 7 days); or release-PR mirror mode (the capstone copies the `dev` push run — § One CI run per dev commit). | Planner, then stop. | Every test lane. |
| `partial` | Push to `dev` that came from a merged PR, and no `[force build]` / `[force full]`. | Static, unit, integration when `web_affected`, build lanes, migration. `@live` (`bkit-tests-live-web`) still runs on this push when `web_affected`. | `bkit-tests-e2e-web`. Deploy (not the default branch). |
| `full` | Pull request; `workflow_dispatch`; push to `{{DEFAULT_BRANCH}}`; direct push to `dev` (no merged PR); `[force build]` / `[force full]`. | Partial's lanes, plus `bkit-tests-e2e-web` when `web_affected`. Same spec set as a push (`testing.md` § E2E on PRs). | `@live` off a PR and off a dispatch. On a default-branch push, `bkit-tests-deploy` promotes **before** the E2E / `@live` lanes run; it is not required, and its own `concurrency:` group stops two releases overlapping. Health runs as `workflow_run` after CI. |

Device lanes follow `plan.run_native_*`, not `run_level`. Same rule on a PR, a push (including `partial`), and a dispatch.

## One run per branch or pull request

```yaml
group: ci-${{ github.workflow }}-${{ github.event_name == 'pull_request' && format('pr-{0}', github.event.pull_request.number) || github.ref }}
cancel-in-progress: ${{ github.ref != 'refs/heads/{{DEFAULT_BRANCH}}' }}
```

A newer run cancels the older one on every event **except the default branch, which queues**: that run promotes the deployment, so cancelling it mid-promote could strand production across two releases (§ Promote before the lanes). A pull request keys on its number; a push or dispatch keys on the ref, so a PR and a `dev` push still overlap. A `workflow_run` observer sees the latest run on that ref only.

A push diffs against the head of the last successful CI run on that branch, not `github.event.before`. Fall back to `github.event.before` only when there is no such run or it is no longer an ancestor. A `workflow_dispatch` has no base commit: short-circuit the affected step to fully affected. `HEAD~1` is only for the delta gates on a dispatch. Markers are inert on dispatch; steer with inputs (§ Commit-message force tags). The planner parses markers once; every lane reads `plan.markers_present`. The only re-read of the commit or PR text is the workflow-level task-runner cache bust (e.g. `TURBO_FORCE`). Plan JSON: validate with `has()` / `!= null`. jq `//` treats `false` as absent and drops a real `run_live: false`.

Migration-immutability and slop-delta run on every event against that same base. The starter's copies of those steps are still `pull_request`-only; that `if:` is the pre-planner shape. Point them at the planner base once `bkit-tests-scope` exists.

Composition guidance:

- `cache.outputs.skip` = `none` gate — every step: `if: steps.cache.outputs.skip != 'true'`.
- `steps.detect.outputs.should_force_build` / `should_run_full` = escalation into `full`.
- No merged PR on `dev` push (auto cache bust, e.g. `TURBO_FORCE=1`) = recovery signal — partial CI with cache busted.
- Health (or smoke, when the probe is a script rather than a health URL): separate workflow, `workflow_run` after CI success — not a required check. One of the two, unless the probes differ (§ Smoke trigger plumbing).
- Capstone `bkit-tests-check` = SOLE branch-protection required check (`bkit setup protect-main` applies it, reading the check name from `bkit.capstoneJob` and the workflow from `bkit.ciWorkflow`). Green = expected tiers ran and passed (`green == validated`), not merely "tests job didn't fail". A `partial` or cache-skipped green is not a `full` validation.

### Parallel test lanes (one lane per tier)

Each tier = **own parallel lane** (job) — `bkit-tests-static` / `-unit` / `-integration` / `-e2e-web` (+ `-migration` / `-live-web`, and optional `-build-ios` / `-e2e-ios` / `-build-android` / `-e2e-android`) — **not** monolithic `bkit-tests` steps. Proven shape: bkit CI + consumer repos run separate lanes. Wall-clock = `max(lane)` not **sum** of serial steps; each tier gets honest coverage + executed-count + job-level permissions; slow tier can't serialise fast ones. Cost: per-lane setup duplicate (checkout / install, shared infra e.g. local DB) — mitigate with a remote task-runner cache (e.g. turbo) + DB service container. Capstone `needs:` **all** lanes; each emits executed-count for non-hollow assertion (`testing.md` § Validated means executed). Starter: `-static` + `-unit`; add lane per tier. Tiny repo: collapse tiers into one lane steps — capstone must assert each tier count via step outputs. E2E full-suite parity + local-vs-preview DB routing → `testing.md` § "E2E on PRs".

**Shared resource: reset first, clean up last** (optional). WHEN: 2+ lanes use one long-lived resource. `bkit-tests-reset` runs after scope + migration, takes a lease, and puts the resource in its known state before any of those lanes start. `bkit-tests-cleanup` runs last, `if: always()`, and releases the lease. The lease is what serialises an overlapping PR and `dev` push. The planner names at most one target; an empty target skips both jobs. Capstone reds if a planned reset skipped or either job failed. DROP both when the resource is provisioned fresh per run (`testing.md` § Provision backing services fresh — the preferred answer).

**Runner size = per-lane lever, only for pole.** Flat graph → one lane defines wall-clock (commonly E2E). Larger runner (more vCPU / RAM) raises internal parallelism (more workers, concurrent E2E projects) → can cut long lane substantially; scope via `runs-on: <your-larger-runner-label>` to **one** lane, default runner elsewhere. Two caveats: (1) **higher per-minute rate** — confirm before adopting (may not appear until first invoice). [Depot](https://depot.dev/docs/github-actions/runner-types) labels (e.g. `depot-ubuntu-24.04-8`) ~30% cheaper than GitHub-hosted; `bkit-ci.yml`, `bkit-cloud.yml` and `bkit-renovate.yml` are templates you own, so set `runs-on` in your copy. (2) **Zero wall-clock** when aimed at non-pole lane: consumer measured bigger E2E runner **+0.0 min** while `@live` stayed pole — worth ~7 min only after `@live` gate removed and E2E became pole. Measure first, re-measure after: pole moves. (3) **A label that does not exist does not fail, so the job queues.** Typo'd / retired label → no error anywhere, job queued indefinitely, run neither reds nor completes. Label set in exactly one place, every `runs-on:` derived from it, planner fails closed on no label.

**Cut per-request cost before peak concurrency.** Fan-out multiplies every per-request call to a shared external service: a per-navigation auth call became 3,500 `GET /auth/v1/user` in 4 minutes under a 12-lane fan-out, stalling the provider and reddening the `@live` lane on a **separate machine**. Audit those calls before widening — verify locally first (JWKS) and hit the service only when the local check cannot decide. Cheaper than either lever below.

**Phase-split before a bigger runner.** Fanned-out lanes failing together → find the contended resource before spending. Consumer's 12 concurrent E2E lanes: 0 unexpected / 6 flaky → 5 unexpected / 25 flaky when 2 more joined, **and** a lane on a separate machine reddened. That second fact is the diagnosis: a lane on its own runner cannot be starved by this runner's CPU / memory, so contention was the shared remote DB and a bigger runner buys zero. Lower **peak** concurrency, not total: order the groups into phases (wait on group 1's PIDs, then launch group 2), concurrency inside each group untouched, both groups' exit codes into one failure counter so a red in either still reds the step.

### turbo `//` over-triggers `web_affected` on docs-only diffs (turbo monorepos)

Capture turbo stdout and stderr separately. Merging with `2>&1` puts the banner in the JSON; jq falls back to `[]` and the lane ghost-greens. Error, missing base, or non-JSON → `web_affected=true`.

`bkit-tests-scope` affected-graph (monorepo) forces `web_affected=true` on **real global dependency** change. Turbo attributes any changed root-level path outside workspace / undeclared `globalDependency` (`docs/**`, `README`, `LICENSE`, …) to root `//` (`FileChanged`). Fallback keying on any `//` `FileChanged` can't distinguish global-dep bump from docs-only diff → over-triggers: e2e scheduled, ignore-command cancels docs-only preview, `Await Deployment` reds e2e on **every** docs-only push.

Fix at source: gate global-dep force on **real** global-dep change. Intersect changed root files against `turbo.json` `globalDependencies` / `globalEnv` (+ root lockfile + `package.json`); force `web_affected` only on match. Turbo-pinned `//` (docs, metadata, non-triggering root dirs) must **not** force. Narrow `docs/**`-only guard = same idea, incomplete (`README`-only still over-triggers); prefer `globalDependencies` intersection. Consumer `bkit-ci.yml` (adopted template, `bkit-stub:affected-graph`); port fix per monorepo. Orthogonal to `[force full]` (deliberately bypasses `web_affected`).

### Promotion-lag warning (`Check Default Branch Lags Dev`)

CI on `dev` proves code good; nothing checks good code reached default branch. Gap bites, because surfaces read LIVE from default branch, not `dev` / validated tip:

- **Renovate** resolves its config only from the default branch (see § Dependency updaters). A `renovate.json5` edit on `dev` is inert until promoted, though `useBaseBranchConfig: "merge"` softens this for the config file but is itself read from the default branch.
- **Scheduled / default-branch-triggered Actions** run the default-branch copy of each workflow, so a `.github/workflows/` fix on `dev` does not take effect on those runs until promoted.
- **The published package / production deploy** are cut from the default branch, so unpromoted `dev` work is invisible to consumers.

`Check Default Branch Lags Dev` (`bkit-tests-static` lane) closes blind spot: every `dev` push diffs `renovate.json5`, `renovate.json`, `.github/workflows/**` vs default branch → `::warning::` + `$GITHUB_STEP_SUMMARY` if stale. **Non-blocking** nudge; keys only consumed-from-default-branch surfaces. Clear: `dev` → default-branch PR.

Ships in the `bkit-ci.yml` template as the `Check Default Branch Lags Dev` step; `bkit upgrade` lists `bkit-ci.yml` when it changes. Safe even without default-branch-behind-`dev` gating: `dev` pushes only, self-skips when default branch is `dev`/unset.

### One CI run per dev commit (release PR mirrors the `dev` push run)

Optional. A same-repo promotion PR into the default branch — head `dev`, or a `release/*` branch cut at the `dev` tip — has the same head the `dev` push run already tests, so a full PR run repeats the slowest run in the repo. Mirror mode runs it once.

- **Planner** (`Decide Release Mirror`, `bkit-tests-scope`): `pull_request` + head repo == this repo + base == default branch + `head_ref` is a promotion branch (`dev`, or `release/*`) → `mirror_push_run=true`, `run_level=none`, `run_e2e` / `run_live` / `run_migration` / `web_affected=false`. Every lane skips. Field is required in the plan (`false` otherwise). Fork PRs and every other head / base pair keep the normal plan.
- **Capstone** (`Mirror Push Run`, `bkit-tests-check`, before `Assert Test Plan Followed`): `bkit runs mirror --head <PR head sha> --branch dev --max-minutes 170`. Waits for the `dev` push run at that SHA (each poll is `bkit runs gate --event push`) and passes only when its capstone passed. The step runs bkit, so the job needs a checkout and installed dependencies, both ungated. Neither step `continue-on-error`.
- **Never skip the PR's required check instead.** A skipped required check can read as passed on the PR while the push run is red.
- **`release/*` resolves the push run by SHA.** A `release/*` head with no green `dev` push run (extra commits past the `dev` tip) fails the mirror red (exit `3`) — safe, not silent.
- **bkit's own CI adopts this.** `Decide Release Mirror` accepts `dev` and `release/*`; `Decide Run Level` has no merged-PR → `light` arm, so every `dev` push resolves `full` (precondition 1); the capstone's `Mirror Push Run` runs `bkit runs mirror --head="$PR_HEAD_SHA" --branch=dev --max-minutes=170`.

<!-- prettier-ignore -->
| Push run at PR head | PR `bkit-tests-check` | `bkit runs mirror` exit |
| --- | --- | --- |
| Capstone `success` | Green | `0` |
| In progress | Waits (`--max-minutes 170`, job `timeout-minutes` 180 in this mode only) | `4` at the limit |
| Failed / cancelled / capstone absent or skipped | Red | `1` |
| None within 10 min (`[skip ci]` at the `dev` tip dispatches none) | Red — push a commit without it to `dev`, re-run the check | `3` |
| GitHub API error 3× in a row | Red | `20` |

**Preconditions — mirroring copies whatever the push run validated:**

1. **A `dev` push resolves `run_level=full`.** Drop the merged-PR → `partial` arm from `Decide Run Level`; a `partial` push run skips E2E and the release PR inherits that.
2. **A push run diffs against the last green push run's head**, not `github.event.before`. Else red run N, then an unrelated commit N+1, plans a green N+1 that never re-tests what N broke, and the mirror copies that green.
3. **Promotion hangs off the push to `{{DEFAULT_BRANCH}}`** (`bkit-tests-deploy`; § Promote before the lanes), never off the PR check. Mirror = merge gate; default-branch push run = release gate.

**Operating it:**

- Open the release PR after `dev` is green → check passes within a minute. Open it earlier → check waits for the push run.
- A red push run re-run to green does not update the PR; re-run the PR's `bkit-tests-check` afterwards.
- A new `dev` push moves the PR head; `pull_request` concurrency cancels the old mirror and starts one for the new SHA.
- Release PR gives up PR-only output (coverage comments, PR-only coverage measurement). None blocks a merge.
- Feature → `dev` PRs are unaffected: `pull_request ⇒ run_level=full` (§ Consumer CI contract) still holds there, which is what `/bkit-ship`'s gate relies on.

## Workflow-file limits GitHub does not enforce visibly

**The 21,000-character expression cap.** GitHub compiles every block scalar containing a `${{ … }}` expression as one expression and refuses to compile the workflow past 21,000 characters:

```
failed to parse workflow: (Line: 2112, Col: 14): Exceeded max expression length 21000
```

Undocumented, and invisible to the toolchain, because the file stays valid YAML, passes `actionlint`, passes GitHub's own `@actions/workflow-parser`. GitHub refuses to compile, near-silently: `pull_request` runs **never created** (PR sits with no checks, no API error); push to a branch the `on:` filters exclude mints a zero-job run named after the file path. Consumer added ~4.6 KB of prose to one E2E step → CI stopped running on that branch for two hours with nothing to read.

- **A comment inside a `run: |` body is part of the expression.** A `#` comment above the step is free. Keep that comment to the rule plus a pointer at this section. The essay stays here. Pasting it into `run:` is what trips the cap.
- **Guard below the cap, not at it.** 20,999 leaves the next edit no room and fails unreadably. Static lane: scan `.github/workflows/*.{yml,yaml}`, measure every block scalar containing `${{`, fail with margin (consumer uses 20,000).
- **A long `run:` body is the symptom.** Fix is rarely compression; move the logic into a script the step calls (`node scripts/ci/…`), unit-testable as a side effect.

## Post-merge dev CI auto-routing

`bkit-cloud.yml`'s `workflow_run` trigger fires on `feat/**` and `dev` CI completion (never `main`) — the per-branch success / failure matrix is canonical in `.bkit/cloud.md` § Branch-aware routing. What the post-merge surfaces add on top of it:

- **Trigger scope.** Dispatch jobs gate on `workflow_run.head_repository` being this repo, so a fork PR's CI completion never boots one; on `dev` the same gate excludes `conclusion == 'success'` outright, so a green post-merge run costs zero runner minutes (the merge already happened, so that run only confirms the regression check passed).
- **FID recovery on `dev`.** No open PR exists, so `{FID}` comes from the squash-merge commit scope (`feat({FID}): …`, primary), falling back to the `bkit:fid` marker in the body of the merged same-repo PR for that SHA. Neither resolving → no-op, no dispatch.
- **Loop bound.** A `dev` CI failure dispatches `/bkit-debug` under `MAX_DEV_DISPATCH_ATTEMPTS` — distinct failed CI SHAs per `{FID}`. `/bkit-debug` creates no branch of its own, so on this surface it remediates on `dev` itself and its push re-triggers this same router; the cap is what terminates that loop. `feat/**` is not capped here (in-session `MAX_DEBUG_ATTEMPT` bounds it).

**Auto-route contract:** the `bkit [auto route]` free-tier gate marker is threaded by `/bkit-ship` onto the squash-merge `--subject` (not just the sync-merge commit) whenever the issue carries `bkit:auto` — this is what admits `dev`-triggered runs through the existing `bkit-cloud.yml` gate; there is no second gate path. The `[skip ci]` ship-DONE close commit that follows the squash merge never carries the marker and never triggers CI, so it cannot interact with this trigger. Trust surface, kill switch and the cap's tamper caveat → `docs/security.md` § CI Auto-Route Trust.

**Docs-only-diff precondition:** the `dev`-trigger path routes every post-merge CI failure to `/bkit-debug`. This is only correct for docs-only diffs if the consumer's `bkit-ci.yml` deploy-await step treats a host-cancelled build as skip, not red (skip e2e, stay green; e.g. Vercel `CANCELED`), but if a consumer reds on a host-cancelled build, every docs-only squash-merge to `dev` false-dispatches `/bkit-debug` and burns loop-cap budget. Verify this per consumer before relying on the `dev` trigger.

**Consumer-repo acceptance note:** the full happy-path loop (squash-merge → post-merge CI → `workflow_run` → `/bkit-debug` dispatch → fix PR → re-merge) is only exercisable on consumer repos with `bkit-cloud.yml` installed and its dispatch secrets wired (see the cloud-agent auth surfaces in `docs/security.md`). A consumer without `bkit-cloud.yml` installed, or without CI running on `push: branches: [dev]`, never emits the `workflow_run` event this trigger depends on, so the feature degrades to a silent no-op, not a failure.

## Ship gate + bookkeeping

`/bkit-ship` is keyed on `bkit branches sync --head=<PR head>`, which reports whether `origin/dev` is an ancestor of the PR head (`basePath`). **Path A** — `dev` has not moved — resumes read-only, no rebase, no bookkeeping commits, no push; merge. **Path B** — `dev` moved — integrates (B1 `gh pr update-branch`, or B2 worktree + `@bkit-ship-conflict-resolve` + `bkit branches push --mode=feature`, a `--force-with-lease` push), then re-validates unconditionally. Both paths end at the same gate: `bkit runs gate --head=<current>` exits 0 (capstone concluded `success`) at the **current** PR head.

### Consumer CI contract — `pull_request` resolves to `run_level=full`

The merge gate (`bkit runs gate`) asserts the capstone job's `conclusion=success` at the head being merged. That assertion is only load-bearing while `pull_request ⇒ run_level=full` holds — i.e. the capstone is green **because every expected tier ran and passed**, not because the lanes were skipped (see `## Run-level decision matrix` above). A consumer that narrows CI on `pull_request` has opted out of the merge-gate guarantee by construction:

- **`paths-ignore` / `paths` filters** that skip `pull_request` on some changes → the capstone may not run at all (no workflow run at head → gate code 10, refuse).
- **A docs-only short-circuit** in the host's build-cancel (Vercel `ignoreCommand` / Netlify) that cancels the run mid-flight → capstone may land `cancelled` (gate code 15) or never complete (code 11).
- **A `[skip ci]` token** in a feature-branch commit subject when the PR opens → GitHub suppresses the `pull_request` run entirely; the PR's `statusCheckRollup` is vacuously empty → no run at head (gate code 10).

`bkit runs gate` covers the **common** violation shapes. A skipped non-capstone lane is **reported, not refused**, because the planned-vs-vacuous judgement belongs to the capstone, which takes every lane result as an input and already asserts it per lane. The gate cannot make that judgement itself: the jobs API reports no reason for a skip (a job skipped by a job-level `if:` never reaches a runner, so it carries an empty `steps` array), and a SHA-cache short-circuit concludes `success` with step-level skips plus a `cache_skip` output, never `skipped`.

**Code 16 is opt-in, and must stay that way.** It fires only for lanes named in `bkit.shipGateRequiredLanes` (package.json array); the default empty list never refuses. A blanket refuse-on-any-skip is **unsatisfiable by construction** for the CI shape bkit ships: a lane whose `if:` is event-scoped — `bkit-tests-live-web` runs on a push to `dev` or the default branch only — cannot run pre-merge at any head, so a pre-merge gate demanding it refuses every PR forever. Device lanes (`-ios` / `-android`) use the same rule on a pull request and a push; do not treat them as post-merge canaries. Name a lane in `shipGateRequiredLanes` only when your capstone does not assert it and the lane genuinely can run pre-merge. `BKIT_SHIP_GATE_OVERRIDE` remains the audited per-head escape hatch. What still carries the anti-vacuity guarantee is codes 10-15: a run exists, at this head, completed, not cancelled, capstone present, capstone green. Code 14 (green at a superseded head) requires `--branch`: the head-keyed run query is filtered server-side, so a moved head returns the same empty list as a head that never ran, and only a second branch-scoped query separates them. A run that is **present but degraded-but-not-skipped** (e.g. a required lane ran with a reduced test set due to a consumer config the gate cannot see) is a **residual risk named here, not claimed as covered**: the capstone is green because bkit's own `run_level` planner computed `full`; a consumer narrowing inside a lane bkit does not own is invisible to the gate. Keep the capstone (`bkit-tests-check`) as the sole branch-protection required check so `green == validated` survives a docs-only push; do not add per-lane required checks (a hollow lane then green-bars the capstone).

**No duplicate dispatch on an already-triggered head (ship Step 9):** a branch push / `gh pr update-branch` fires `pull_request` at the new SHA on its own. The scaffold keys a pull request on `pr-{number}` and a `workflow_dispatch` on `github.ref`. The two are separate groups, so a redundant dispatch is never cancelled and burns a full duplicate run. Ship probes the head whose CI the gate will check (`VALIDATED_HEAD`) with `bkit runs wait --head=<VALIDATED_HEAD> --branch=<branch> --until=present --dispatch-if-absent`, which dispatches only when no run appears; the probe is not a pass condition. The completion wait (`bkit runs wait --head=<VALIDATED_HEAD> --until=completed`) reads only runs at that exact head, so a completed run from a superseded head never answers it. Gate codes 10 / 11 / 14 / 17 re-enter that probe-and-poll only, never the deferred sweep, bounded by `MAX_REVALIDATE_ATTEMPT`.

**No CI run for ship's own docs commit (validated-head carry-forward):** ship's pre-merge `[skip ci]` bookkeeping commit (docs, summaries, ledgers, skill removals) runs no CI. Every path between the last CI-tested commit and the PR head on the bookkeeping allow-list (`bkit ledgers only-bookkeeping`) → `bkit runs gate --validated=<sha>` checks CI at the tested commit; else code 17. Merge still pins the exact head (`--match-head-commit`). Green PR → zero extra runs. Bookkeeping commit merges untested; post-merge `dev` CI (`ship-merge-ci` row) is the backstop. `dev` REQUIRES status checks (classic branch protection or ruleset) → GitHub refuses a head with no run → ship runs CI at the PR head.

### Consumer rollback path

To unwind a bad ship surface (the gate command, managed config, or rewritten `bkit-ship.md`) without downgrading unrelated fixes:

1. **Pin the previous `@cbartens/bkit`** in `package.json` (the sliding `@v{N}` tag auto-receives patches; a regression lands via the tag, so pin to the last known-good immutable `v{N}.x.y` or `@<sha>` — see § Sliding major-version tag). Re-install and confirm `bkit check` reports no drift.
2. **Hold `bkit upgrade` for `.bkit/core/workflows/bkit-ship.md`** until the regression is fixed upstream. The gate (`bkit runs gate`) and ship's waits ship inside the `@cbartens/bkit` package (`dist/`), not as files in your repo, so the version pin in step 1 is what rolls them back. Other bkit upgrades are independent.
3. **Audit any `BKIT_SHIP_GATE_OVERRIDE` rows** in `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` written in the interim. Each `type:"ship-gate-override"` row is a sanctioned escape that turned a refusal into a merge; treat every row as a PR whose capstone was not green at the merged head and re-verify it against the pinned-good gate (`bkit runs gate --head=<sha>`). `[bkit-runs] override honoured for head …` is the matching `docs/observability.md` grep key.
4. **No per-workflow pin / revert exists**; the package pin + selective `bkit upgrade` hold is the recovery path. Document any incident in `docs/failures.jsonl`.

Ship's docs sync, summaries, `SHIPPED` roadmap row and skill removals ride the PR: one `[skip ci]` commit on the feature branch before the merge — the only pre-merge push besides conflict-resolve. Status rows (`status.jsonl`) → dev tree from Step 1 when `RUNTIME_DEVPUSHES=true` (modes 1-2), current working branch tree when `false` (mode 3 — cloud); see `.bkit/workflows.md` § Ship `BOOK_ROOT`. Post-merge tail = one `[skip ci]` close commit → push `dev` from the dev checkout (modes 1-2), or built off `origin/dev` → push `dev`, refused → `ship-close/{FID}` PR (mode 3).

## Smoke trigger plumbing

Smoke runs **after** deploy, in its own workflow, off the merge gate (what it actually probes → `testing.md` § Smoke). When `bkit-tests-deploy` promotes inside CI, that probe is `health.yml` (`workflow_run` after CI success on the default branch) — one workflow, not a second smoke file, unless the two probes differ. Pick the trigger by **where the deploy happens**, not by habit:

- **Deploy happens inside CI** → key smoke to **`workflow_run`** (the CI workflow `completed` + `conclusion == 'success'`). Mind the 3-level `workflow_run` chain cap, because a fourth chained workflow will not fire.
- **An external platform deploys after merge** (Vercel / Netlify-style Git integration) → key to a **post-deploy** signal — `deployment_status` (`state == 'success'`) or the platform's `repository_dispatch` event — so smoke fires when the deploy is actually **live**, not merely when CI finished. `workflow_run` here smokes a not-yet-serving (or about-to-be-replaced) deployment.
- Either way: separate workflow, **non-blocking** (never a required check), and wait for the target to be **serving** before probing, because ready ≠ serving (`testing.md` § Deploy-reachability).
- **Not:** smoke wired into branch protection (it gates observability, not merges), or a `workflow_run`-keyed smoke against an externally-deployed app that probes the old build.

## Applying migrations at deploy time

The deploy-time **apply** and the test-time **replay** gate are different guarantees; keep both, preferably in the **same always-on lane** (`bkit-tests-migration`):

- **Apply (deploy path):** push only the **new** migrations onto the already-migrated remote, because it is idempotent (applies what's not yet in the ledger; safe to retry), and it **never** replays from empty or runs the seed. Home: `bkit-tests-migration` on every push to `dev`/`main` (remote apply of new migrations, e.g. `supabase db push --linked --include-all`), **not** inside `bkit-tests-e2e-web` (leaving it in e2e while live runs parallel is the schema-cache race). Un-gated by `run_migration` so it self-heals a remote left behind. after the replay steps so a from-empty failure never reaches shared remote.
- **Replay (test path):** the fresh-DB gate proves from-empty replay + seed load (`testing.md` § Migration-replay + seed). Passing one is not passing the other.
- **Immutability:** once a migration is merged, never edit it; ship a new corrective migration. Flag any modification to an already-merged migration file in review.
- **Multiple chains:** apply **every** migration system (e.g. a SQL chain + an ORM / CMS chain), each idempotent and retried independently.
- **Transient-pooler hardening:** remote applies over a connection pooler can blip (e.g. an IPv4 session pooler's `i/o timeout`); wrap link + apply in a bounded retry, because idempotency makes a re-attempt after a mid-apply drop safe.
- Ordering of apply vs the deploy's build is a **separate** hazard — § Build-vs-migration race.
- **Not:** assuming the deploy-time apply also validates a clean from-scratch install or the seed, because it does neither; **not** putting remote push inside e2e while live is ungated from e2e.

## Build-vs-migration race

If your host auto-deploys on push (Vercel / Netlify Git integration) while CI applies migrations as a **separate, unordered** step, the deploy's build and the migration race. A build-time DB read that lands **before** the migration creates its object hard-ERRORs the **first** deploy shipping it. Build-time reads come from any statically rendered or build-generated route, e.g. Next.js: `sitemap.ts` / `robots.ts`, `generateStaticParams` / `generateMetadata`, an OG-image route, a static (non-dynamic) page's server read, or marking a DB route `force-static` / ISR. Missing-object error signatures, e.g. Postgres: `42P01` (relation), `42703` (column), `42704` (type), `3F000` (schema).

**Fingerprint:** prod keeps serving the prior deployment, and a redeploy of the **same SHA** clears it, because a genuine bad migration would not self-heal on redeploy.

**Fix, strongest first:**

1. **Serialise migrate → deploy.** Disable host auto-deploy for the production branch (keep preview auto-deploys); have CI trigger the prod deploy **after** the migration step succeeds. Schema-before-build by construction.
2. **Belt-and-braces.** Narrowly catch those missing-object codes in build-time queries (return empty so the route self-heals on first request, e.g. Next.js `dynamicParams` / ISR) while keeping request-time reads strict (a missing object at request time is a real incident, not a race).

Latent until the first build-time DB read lands, so flag it in review when one is added. Note `bkit-tests-migration` proves migrations replay from empty **and** (on push) owns the remote apply; it still does nothing for build-vs-deploy host ordering, because this race is orthogonal to that gate (serialise migrate → deploy at the host).

## Promote before the lanes (`bkit-tests-deploy`)

With `bkit-tests-deploy` adopted, the host does not auto-build the default branch. `bkit-tests-build-web` creates this SHA's deployment, polls it to ready, and publishes `deployment_url` + `deployment_id`; the production alias still serves the previous release. `bkit-tests-deploy` `needs: [bkit-tests-migration, bkit-tests-build-web]`, runs on a push to the default branch only, and is not a required check. It promotes the exact `deployment_id` the build lane published — it does not look the deployment up again by SHA — and a `409` is success only when the body says this id is already current production. On `{{DEFAULT_BRANCH}}` it runs **before** the E2E / `@live` lanes: each of those `needs:` it and starts by proving production serves this run's build (by deployment id), so a re-run after a rollback refuses instead of testing the old build and going green. A red deploy job means the release did not happen; production still serves the previous deployment.

Two guards keep a release honest: the deploy job carries its own `concurrency:` group (`cancel-in-progress: false`, so two releases never overlap), and the workflow-level block queues on `{{DEFAULT_BRANCH}}` (§ One run per branch or pull request) so a newer push waits rather than cancelling a switch in flight. `bkit-tests-migration` waits for static / unit / integration / `build-web` before it touches production's database.

Do not add a host-side "hold promotion until a named check passes" setting (e.g. Vercel Deployment Checks). That list stays empty. This job is the promotion. e.g. Vercel: `git.deploymentEnabled` for the default branch is false; auto-assign of production domains is off.

The capstone `needs:` `bkit-tests-deploy`: on a default-branch push a skipped or failed deploy reds it. Health (optional, `.github/workflows/health.yml`) runs on `workflow_run` after that CI run succeeds, and smokes the deployment this SHA promoted. Not a required check.

## Disable GitHub Code Quality billing

GitHub **Code Quality** (coverage-on-PR + the _Code Quality: CodeQL_ runs) bills **per active committer + Actions minutes + AI credits**, and it is **opt-out**: repos with default setup enabled are billed silently unless it is turned off.

- **If your repo has Code Quality default setup enabled, disable it**; repo → **Settings → Code security → Code Quality** (turn off default setup), or accept the per-committer charge.
- **The bkit coverage stub replaces the coverage-on-PR value only.** `bkit-stub:coverage` gives a free, in-Actions coverage comment (shipped stub targets Vitest; `testing.md` § Coverage on PRs) with no third-party service. It does **not** replace **CodeQL security scanning** — keep or re-enable that separately if you rely on it (a distinct product / decision).

## GitHub Actions pinning

**Pin every third-party dependency to immutable digest; pair pin with updater.** Floating ref (`@v{N}` tag, `ubuntu:26.04` image, unversioned `curl … | bash`) is mutable, because a compromised maintainer re-points to malicious code on next push with runner token. One exposure class, three surfaces:

- **Actions** — pin every `uses:` to a 40-character commit SHA, never `@v{N}`. Resolve it with `git ls-remote https://github.com/<owner>/<repo>.git 'refs/tags/vX.Y.Z'` and append a `# vX.Y.Z` comment so the version stays human-readable:

  ```yaml
  - uses: actions/checkout@a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e # v4.2.1
  ```

- **Container images** — pin `FROM` to a `sha256:` digest, keeping the tag **inline** so an updater can still track it (`FROM ubuntu:26.04@sha256:…`, not a bare `ubuntu:26.04` nor a digest with the tag in a trailing comment). Resolve with `docker pull <image>:<tag>` (prints `Digest:`).
- **Downloaded installers / binaries** — a `curl … | bash` or release-tarball fetch must either pin its source to an immutable ref (a commit SHA in a `raw.githubusercontent.com` URL, not a mutable git tag) or verify a pinned `sha256sum` before executing / extracting, and pin the tool version explicitly rather than resolving "latest".

Elevated-permission workflows (`packages: write`, `id-token: write`, `contents: write`, or deploy credentials) are where this is **especially critical**, because a re-pointed ref there runs with those credentials, but the practice applies to **all** third-party refs, not only elevated ones.

### Dependency updaters

**Pair with an updater.** A pin that nothing bumps stays on a vulnerable digest. All templates: `.bkit/templates.md`. Copy one updater example and own it:

<!-- prettier-ignore -->
| Updater | Copy | When |
| --- | --- | --- |
| Renovate (rules) | `.bkit/templates/.github/renovate.json5` → `.github/renovate.json5` | Default. Grouped PRs, lockfile maintenance, `osvVulnerabilityAlerts`. |
| Renovate (self-hosted runner) | `.bkit/templates/.github/workflows/bkit-renovate.yml` → `.github/workflows/bkit-renovate.yml` | Mend's 3 GB runner OOMs (`kernel-out-of-memory`) on a large pnpm graph. `ubuntu-latest` is ~16 GB. Edit `runs-on` in the copy. |
| Dependabot | `.bkit/templates/.github/dependabot.yml` → `.github/dependabot.yml` | First-party GitHub. No App. One PR per package. No lockfile-maintenance job. |

Use one. Both open PRs for the same packages. `bkit.depUpdater: "none"` skips the install-time absence advisory.

**Gate on known advisories.** Updater PRs never fail CI on a vulnerable version already in the lockfile. Copy `.bkit/templates/scripts/ci/check-dependency-audit.mjs`, its `.test.mjs` and `accepted-advisories.json` → `scripts/ci/`; the `Check Dependency Audit` step (`bkit-tests-static`) self-skips until then. It runs `pnpm audit --json`; a blocking advisory (default high / critical) without an acceptance fails:

<!-- prettier-ignore -->
| Fails on | Fix |
| --- | --- |
| Blocking advisory, no row | Upgrade: `pnpm update -r <pkg>` moves a transitive within its declared range. No patched release / parent pins it → add a row |
| Row past its `expires` day | Upgrade, or re-review and renew |
| `expires` further out than the severity's `blocking` days (default critical 7, high 30) | Shorten it |
| Row whose advisory the audit no longer reports | Delete the row |
| Row without `advisory`, `reason` or a `YYYY-MM-DD` `expires`, or listed twice | Fix the row |
| Audit prints no report after 3 tries | Fails closed; rerun |

`blocking` = severity → max days per acceptance: the repo's fix-time policy, held only there. Not `auditConfig.ignoreGhsas`: it ignores forever and records no reason. New advisory reds an unrelated push → upgrade or accept in the next push. Non-pnpm repo → adapt `blockingFindings()`, or let the Trivy scan own the lockfile.

**Scan beyond the pnpm lockfile.** `.bkit/templates/.github/workflows/bkit-trivy.yml` → `.github/workflows/bkit-trivy.yml` fails on HIGH / CRITICAL findings in any lockfile, Dockerfile / IaC settings and committed secrets, on push, pull request and daily. With `check-dependency-audit.mjs` adopted it skips `pnpm-lock.yaml`, so each pnpm advisory is accepted in one file. Acceptances, pinning, traps → `.bkit/templates.md` § Trivy.

**Hands off bkit-owned trees.** Renovate: ignore `.bkit/templates/**` and `.agents/skills/**` (bkit rewrites them; scanning them is noise). A packageRule `enabled: false` does not stop the scan; `pinDigests` still rewrites the file, so use `ignorePaths`. Workflows you copied from `.bkit/templates/` (`bkit-ci.yml`, `bkit-cloud.yml`, `bkit-renovate.yml`, `bkit-trivy.yml`) are yours: leave them out of that list so their pins refresh.

**Land config on the default branch before the bot runs.** GitHub Apps and Dependabot read config from the default branch. The example sets `baseBranchPatterns: ["dev"]` (PRs land on `dev`) and `useBaseBranchConfig: "merge"` (edits on `dev` apply to dev-targeted runs). `useBaseBranchConfig` itself is read from the default branch, so it needs one merge there before dev-side edits take effect.

**Renovate, Mend.** Install the App at https://github.com/apps/renovate only after `renovate.json5` is on the default branch. No `gh api` equivalent. Within a few minutes the App opens an onboarding PR; merge it.

**Renovate, self-hosted.** Copy the workflow example. Suspend the Mend App for this repo (Settings → Applications → Renovate → Configure → remove this repo) or both open `renovate/*` PRs. The cron wakes the bot daily; `renovate.json5` `schedule` still gates normal PRs. Do not narrow the cron to weekly, because `osvVulnerabilityAlerts` PRs need the daily wake.

Platform auth is a repo secret `BKIT_GH_TOKEN`, never `GITHUB_TOKEN` (those PRs do not trigger CI, so required checks and automerge never fire). Use a **fine-grained** PAT when this repo is the only owner-scope bkit touches; use a **classic** PAT when the same token must cover more than one owner — fine-grained PATs cannot span organizations. Fine-grained permissions for this repo:

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

`Commit statuses: Read and write` is what opens the PR. Without it Renovate creates the branch and 403s on commit status. There is no separate Checks permission on a fine-grained PAT. Classic equivalent: scopes `repo`, `workflow`, `security_events` (plus `user:email` for commit authorship). Org-owned tokens cannot read the owner email; set the Actions variable `RENOVATE_GIT_AUTHOR` (for example `Renovate Bot <renovate@your-domain>`).

**pnpm 11 on Mend's runner.** A large graph can OOM during `pnpm update --lockfile-only`. The example sets `minimumReleaseAge: "7 days"` and caps `PNPM_WORKERS`. To clear the per-install gate, set `minimumReleaseAge: 0` in `pnpm-workspace.yaml`. Deleting the key does not: pnpm 11 defaults it to 1440. Self-hosted on `ubuntu-latest` has the memory; the freshness setting is still yours to keep or drop.

**Fence a `pnpm.overrides` pin.** Renovate's lockfile regen does not honor `pnpm.overrides`. An eligible bump rewrites the lock while the override stays, and `pnpm install --frozen-lockfile` fails. Add a `packageRules` entry `{ matchPackageNames: ["<pkg>"], enabled: false }` in `renovate.json5`.

**Dependabot repo settings** (Settings → Advanced Security), when Dependabot is the updater:

<!-- prettier-ignore -->
| Setting | Set to |
| --- | --- |
| Dependency graph | Enabled |
| Dependabot alerts | Enabled |
| Dependabot security updates | Enabled |
| Dependabot version updates | Enabled (this file drives them) |

When Renovate is the updater, leave alerts on and turn security updates and version updates off so Dependabot does not open competing PRs.

**Runner labels for bkit workflows.** `bkit-ci.yml`, `bkit-cloud.yml`, `bkit-renovate.yml` and `bkit-trivy.yml` are templates you copy and own; edit `runs-on` in your copy. The `bkit-cloud.yml` template ships the `{{CLOUD_RUNNER}}` placeholder in both jobs: replace it with a label (e.g. `ubuntu-latest`).

### Manual CVE handling (when an alert fires)

Renovate's `osvVulnerabilityAlerts: true` opens CVE-driven PRs immediately against `dev`. If you also want to keep GitHub's Dependabot **alerts** on (Settings → Code security → Dependabot alerts), the Security tab continues to surface advisories — useful as a parallel signal, not required. Handle each alert against `dev`:

1. Read the alert; note `vulnerable_version_range` and `first_patched_version`. Trace the import chain with the package manager's why / explain command (e.g. `pnpm why <pkg>`): direct vs transitive; dev vs prod scope.
2. **Direct dep**: bump in the dependency manifest (e.g. `package.json`), reinstall (e.g. `pnpm install`), run the deepest declared `bkit:gate:*` script (e.g. `pnpm bkit:gate:static-unit`).
3. **Transitive dep**: bump the parent that pins it (e.g. bump `vitest` to pull in a CVE-fixed `vite`). If the parent itself cannot upgrade, override the transitive to a fixed version (e.g. a `pnpm.overrides` entry; Renovate: fence it, see **Fence a `pnpm.overrides` pin**); or add the transitive as a direct dev dependency (e.g. `devDependencies`) to force the resolution.
4. Open a PR against `dev` titled `fix(security): bump <pkg> >=<fixed-version> (CVE-XXXX-YYYY)`. After merge to `dev → main`, the alert auto-closes once GitHub re-scans the default branch.
5. If a CVE has no impact on your usage pattern (e.g. dev-server-only vuln in a build tool that you never run as a server), dismiss in the GitHub UI with the **"Vulnerable code is not actually used"** reason and a one-line justification. Don't dismiss without documenting why.

<!-- bkit:end -->
