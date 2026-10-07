<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Deployments

> [!CAUTION]
> **Purpose:** Deployment / environment config / CI/CD pipeline rules — secrets sync, branch protection, run-level tiers.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; NO filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Describe current state / rules, NOT reasons / history; state what to do, NOT why.
> - Check `.agents/docs.md` index first and confirm topic belongs in THIS doc, not another.
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
- On `revert-*` branches pre-push drops only the **unit lane** (`bkit:gate:static` in place of `bkit:gate:static-unit`) — the static lane and the bkit drift gate still run → revert PR pushable when source state transitionally inconsistent.

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
- **`workflow_dispatch`**: neither field populated → **every** marker inert (planner sets `MSG=""` for non-`push`/`pull_request` events; `[force full]` / `[force build]` / `[verbose ci]` all dropped, silently). Steer a dispatch with **inputs**, never a marker — mandatory when the dispatch default is expensive: consumer's dispatch forced both metered native build lanes past their reuse gate, 30 builds against a $45/mo limit in one month, until an input (default `false`) gated the lookup.

<!-- prettier-ignore -->
| Tag | Effect | Scope |
| --- | --- | --- |
| `[force cache]` | Sets `TURBO_FORCE=1` for the run — turbo recomputes instead of replaying cache hits. Use when investigating suspected ghost-greens. | Read by `Detect Direct Push` step |
| `[force build]` | The lighter hammer. Exposes `should_force_build=true` + `run_level=full`; does **not** bypass `web_affected`, so no integration / e2e / @live unless web is genuinely affected. Rebuild without paying @live's side effects. No effect unless the consumer's deploy steps gate on the output. | Read by `Detect Direct Push` step |
| `[force full]` | The hammer. `run_level=full` **and** it bypasses `web_affected`, so integration, `bkit-tests-e2e-web`, and `bkit-tests-live-web` run on any commit, including docs-only. The E2E spec set does not change — a PR already runs the full suite. `@live` stays **push-only** (a docs-only `[force full]` push reaches it through the effective `web_affected`; never a PR, never a dispatch). | Read by `Detect Direct Push` step |
| `[verbose ci]` | Escalates log detail for one run: `TURBO_LOG_LEVEL=full`, `NODE_OPTIONS=--trace-warnings --trace-deprecation` (a job-level `env:` key — never a `$GITHUB_ENV` write, which the runner rejects while still reporting success), `DEBUG=vercel:*,supabase:*`, plus Playwright `--trace=on` (when E2E stub enabled). Use when `bkit-debug` diagnose returns thin evidence; never for routine pushes (trace.zip files are MB-scale). See `testing.md` for the full knob list and the `--reporter=line` hostile gap. | Read by `bkit:start verbose-ci-env` on `bkit-tests-static` (copy the same `env:` onto each lane) |
| `[skip ci]` / `[skip actions]` | Honoured natively by GitHub Actions — suppresses workflow dispatch entirely. Use sparingly: the suppressed run will not appear in `gh run list`, and downstream `workflow_run` triggers will not fire. | Native GitHub behaviour, not a bkit-level toggle |

**Two deploy-forcing markers only: `[force build]` + `[force full]`.** No granular `[force e2e]` / `[force live]` — they would be silent no-ops gated behind `web_affected`. `[force full]` = single gate-bypass ("validate everything") → one effective `web_affected` drives integration + e2e + @live uniformly.

- **Precedence — `[skip ci]` / `[skip actions]` hard-vetoes any force marker.** `[skip ci]` commit never dispatches (native GitHub suppression, before `ci.yml`) — no force marker un-suppresses. To validate would-be-skipped commit: drop `[skip ci]`, push with `[force full]`.
- **`[force cache]` orthogonal** — busts turbo _replay_ (`TURBO_FORCE=1`), different axis from _which lanes run_. Never folded into `[force full]`. Combine `[force full] [force cache]` for "everything, fresh."
- **Marker parity (deploy-forcing set).** e2e / @live lanes resolve per-SHA deployment → marker that force-runs them MUST **also** force host build, or lane dies at "resolve deployment URL". Host build-cancel script (e.g. Vercel `ignoreCommand`) MUST honor **every** marker in the deploy-forcing set (`[force build]` + `[force full]` shipped, plus any consumer marker widening a deploy-backed lane); assert in CI (`grep -qF` over cancel script). `[force cache]` / `[verbose ci]` / `[skip ci]` test-plane-only — NOT honored by cancel script.
- **Match a signature, not a spelling.** Value-list marker (`[platform web ios]`) is invisible to a substring test for `[platform web]` → match the opening token (`[platform `) on BOTH sides. Assertion pinned to one spelling stays green while the cancel script kills the build the marker asked for.
- **A widening marker is an OR term, never a condition.** Marker that ADDS a lane the affected graph missed must only widen. As a condition (`contains(plan.platforms, 'web')` in a lane `if:`) it also **removes** — `[platform ios]` on a web-touching commit silently drops the web lane, run green. Guard the direction over the workflow text; mutation-prove both ways. Intent does not hold this shape.
- **Widen job gate + step gates together, or not at all.** Job-level `if:` alone → lane starts, every step inside skips: green lane that ran nothing — the capstone's own failure mode, arriving where the capstone cannot see it. One consumer found 25 step-level readers of `web_affected` behind 4 job-level ones; count them before widening a shared plan value. Forcing a **subset** (builds without their tests) → do NOT widen the shared value: derive a **new** boolean beside it (`build_forced` next to `web_affected`), gate only the lanes it owns. Valid ONLY for a lane with **no** step-level reader of that value — assert it directly, error message naming what breaks when someone adds one.
- **Invoke the marker parser unconditionally.** Substring pre-gate in front of a parser = silent no-op: consumer gated on the literal `[screenshots ` **with a trailing space** → bare `[screenshots]` never reached the parser, step exited 0 with an empty plan, run green having captured nothing. Parser runs every time and owns every failure class (unknown value, invalid combination, arguments to a bare flag) — loudly, in the planner, before any lane starts.

Direct push to `dev` (no merged PR ancestry) auto-sets `TURBO_FORCE=1` regardless of tags. See `bkit-debug` runbook for cache-bust rationale.

## Autonomous phase-close prerequisites

Design/plan Close Workflow lands docs on `dev` two ways. When the runtime can push `dev` (`RUNTIME_DEVPUSHES=true` — laptop, GitHub-Actions runner) it runs the local squash-merge and direct push: **no repo setting is required, and no PR is created**. When it cannot (cloud agent session, or an unclassified runtime) it opens a PR and squash-merges it, which adds two repo prerequisites. Neither is pre-flighted — no admin-scope token is required; the dependency asserts itself by the close's own merge failing loudly.

- **Branch protection on `dev` permits the autonomous merge** — no required human review. The PR-path merge does **not** wait for checks: its merge subject carries `bkit [skip ci]`, so a docs-only close dispatches no run to wait for. A rule requiring status checks to pass will block it.
- **"Automatically delete head branches" is enabled** (repo Settings → General). The PR-path close deliberately does not pass `--delete-branch` — `gh` also deletes the local branch, which fails when that branch is checked out in a worktree and returns non-zero _after_ a successful merge. Head-branch cleanup relies on the repo setting instead.

Confirm both before running phase closes from a cloud agent session.

## Run-level decision matrix

Bkit ships a **mostly flat, wide** scaffold: `bkit-tests-scope` (always-on; reads markers once, computes `run_level` / optional `run_migration` / `tenant_target`, emits `bkit-test-plan` JSON) fans out to every lane — `bkit-tests-static` / `-unit` / `-build-web` / `-build-ios` / `-build-android` / `-integration` / `-e2e-web` / `-e2e-ios` / `-e2e-android` / `-live-web` / `-migration` / `-reset` / `-cleanup` — and `bkit-tests-check` joins them. `bkit-tests-deploy` runs after the capstone, on a push to the default branch only, and is not required. Static/unit/integration/build wait only on the planner. **Ordering edges:** when `bkit-tests-migration` owns the shared-remote `db push`, every lane that hits that database `needs:` it with `result != 'failure'`. `bkit-tests-reset` sits after migration and before those lanes. Do **not** gate `bkit-tests-live-web` behind static/unit/integration/e2e. Adopt only the lanes this repo has. Lane names and the adopt order: `testing.md` § CI test tiers. Before CI speed spend: **measure job graph, find pole**. The jobs above the reference in `ci.yml` are the any-repo starter. The **FULL CI SCAFFOLD REFERENCE** names each target job's `needs`, `if`, and step order. When a starter stub disagrees with that reference, follow the reference.

<!-- prettier-ignore -->
| Run level | When | Runs | Defers |
| --- | --- | --- | --- |
| `none` | `[skip ci]` / `[skip actions]`, or `cache.outputs.skip == 'true'` (this SHA went green in the last 7 days). | Planner, then stop. | Every test lane. |
| `partial` | Push to `dev` that came from a merged PR, and no `[force build]` / `[force full]`. | Static, unit, integration when `web_affected`, build lanes, migration. `@live` (`bkit-tests-live-web`) still runs on this push when `web_affected`. | `bkit-tests-e2e-web`. Deploy (not the default branch). |
| `full` | Pull request; `workflow_dispatch`; push to `{{DEFAULT_BRANCH}}`; direct push to `dev` (no merged PR); `[force build]` / `[force full]`. | Partial's lanes, plus `bkit-tests-e2e-web` when `web_affected`. Same spec set as a push (`testing.md` § E2E on PRs). | `@live` off a PR and off a dispatch. `bkit-tests-deploy` only on a default-branch push, after the capstone, and it is not required. Health runs as `workflow_run` after CI. |

Device lanes follow `plan.run_native_*`, not `run_level`. Same rule on a PR, a push (including `partial`), and a dispatch.

## One run per branch or pull request

```yaml
group: ci-${{ github.workflow }}-${{ github.event_name == 'pull_request' && format('pr-{0}', github.event.pull_request.number) || github.ref }}
cancel-in-progress: true
```

A newer run cancels the older one on every event. A pull request keys on its number; a push or dispatch keys on the ref, so a PR and a `dev` push still overlap. A `workflow_run` observer sees the latest run on that ref only.

A push diffs against the head of the last successful CI run on that branch, not `github.event.before`. Fall back to `github.event.before` only when there is no such run or it is no longer an ancestor. A `workflow_dispatch` has no base commit: short-circuit the affected step to fully affected. `HEAD~1` is only for the delta gates on a dispatch. Markers are inert on dispatch — steer with inputs (§ Commit-message force tags). The planner parses markers once; every lane reads `plan.markers_present`. The only re-read of the commit or PR text is workflow-level `TURBO_FORCE`. Plan JSON: validate with `has()` / `!= null`. jq `//` treats `false` as absent and drops a real `run_live: false`.

Migration-immutability and slop-delta run on every event against that same base. The starter's copies of those steps are still `pull_request`-only; that `if:` is the pre-planner shape. Point them at the planner base once `bkit-tests-scope` exists.

Composition guidance:

- `cache.outputs.skip` = `none` gate — every step: `if: steps.cache.outputs.skip != 'true'`.
- `steps.detect.outputs.should_force_build` / `should_run_full` = escalation into `full`.
- No merged PR on `dev` push (auto `TURBO_FORCE=1`) = recovery signal — partial CI with cache busted.
- Health (or smoke, when the probe is a script rather than a health URL): separate workflow, `workflow_run` after CI success — not a required check. One of the two, unless the probes differ (§ Smoke trigger plumbing).
- Capstone `bkit-tests-check` = SOLE branch-protection required check (`.bkit/scripts/bkit-protect-main.sh`). Green = expected tiers ran and passed (`green == validated`), not merely "tests job didn't fail". A `partial` or cache-skipped green is not a `full` validation.

### Parallel test lanes (one lane per tier)

Each tier = **own parallel lane** (job) — `bkit-tests-static` / `-unit` / `-integration` / `-e2e-web` (+ `-migration` / `-live-web`, and optional `-build-ios` / `-e2e-ios` / `-build-android` / `-e2e-android`) — **not** monolithic `bkit-tests` steps. Proven shape: bkit CI + consumers gether/fraser run separate lanes. Wall-clock = `max(lane)` not **sum** of serial steps; each tier gets honest coverage + executed-count + job-level permissions; slow tier can't serialise fast ones. Cost: per-lane setup duplicate (checkout/install, shared infra e.g. local DB) — mitigate with turbo remote cache + DB service container. Capstone `needs:` **all** lanes; each emits executed-count for non-hollow assertion (`testing.md` § Validated means executed). Starter: `-static` + `-unit`; add lane per tier. Tiny repo: collapse tiers into one lane steps — capstone must assert each tier count via step outputs. E2E full-suite parity + local-vs-preview DB routing → `testing.md` § "E2E on PRs".

**Shared resource: reset first, clean up last** (optional). WHEN: 2+ lanes use ONE long-lived resource. `bkit-tests-reset` runs after scope + migration, takes a lease, and puts the resource in its known state before any of those lanes start. `bkit-tests-cleanup` runs last, `if: always()`, and releases the lease. The lease is what serialises an overlapping PR and `dev` push. The planner names at most one target; an empty target skips both jobs. Capstone reds if a planned reset skipped or either job failed. DROP both when the resource is provisioned fresh per run (`testing.md` § Provision backing services fresh — the preferred answer).

**Runner size = per-lane lever, ONLY for pole.** Flat graph → one lane defines wall-clock (commonly E2E). Larger runner (more vCPU/RAM) raises internal parallelism (more workers, concurrent E2E projects) → can cut long lane substantially; scope via `runs-on: <your-larger-runner-label>` to **one** lane, default runner elsewhere. Two caveats: (1) **higher per-minute rate** — confirm before adopting (may not appear until first invoice). [Depot](https://depot.dev/docs/github-actions/runner-types) labels (e.g. `depot-ubuntu-24.04-8`) ~30% cheaper than GitHub-hosted; `ci.yml` consumer-owned; bkit-managed via `bkit.runners` — § Self-hosted Renovate. (2) **Zero wall-clock** when aimed at non-pole lane: consumer measured bigger E2E runner **+0.0 min** while `@live` stayed pole — worth ~7 min ONLY after `@live` gate removed and E2E became pole. Measure first, re-measure after: pole moves. (3) **A label that does not exist does not fail — it queues.** Typo'd / retired label → no error anywhere, job queued indefinitely, run neither reds nor completes. Label set in exactly ONE place, every `runs-on:` derived from it, planner fails closed on no label.

**Cut per-request cost before peak concurrency.** Fan-out multiplies every per-request call to a shared external service: a per-navigation auth call became 3,500 `GET /auth/v1/user` in 4 minutes under a 12-lane fan-out, stalling the provider and reddening the `@live` lane on a **separate machine**. Audit those calls before widening — verify locally first (JWKS) and hit the service only when the local check cannot decide. Cheaper than either lever below.

**Phase-split before a bigger runner.** Fanned-out lanes failing together → find the contended resource before spending. Consumer's 12 concurrent E2E lanes: 0 unexpected / 6 flaky → 5 unexpected / 25 flaky when 2 more joined, **and** a lane on a separate machine reddened. That second fact is the diagnosis — a lane on its own runner cannot be starved by this runner's CPU/memory, so contention was the shared remote DB and a bigger runner buys zero. Lower **peak** concurrency, not total: order the groups into phases (wait on group 1's PIDs, then launch group 2), concurrency inside each group untouched, both groups' exit codes into ONE failure counter so a red in either still reds the step.

### turbo `//` over-triggers `web_affected` on docs-only diffs

Capture turbo stdout and stderr separately. Merging with `2>&1` puts the banner in the JSON; jq falls back to `[]` and the lane ghost-greens. Error, missing base, or non-JSON → `web_affected=true`.

`bkit-tests-scope` affected-graph (monorepo) forces `web_affected=true` on **real global dependency** change. Turbo attributes any changed root-level path outside workspace / undeclared `globalDependency` (`docs/**`, `README`, `LICENSE`, …) to root `//` (`FileChanged`). Fallback keying on _any_ `//` `FileChanged` can't distinguish global-dep bump from docs-only diff → over-triggers: e2e scheduled, ignore-command cancels docs-only preview, `Await Deployment` reds e2e on **every** docs-only push.

Fix at source: gate global-dep force on **real** global-dep change. Intersect changed root files against `turbo.json` `globalDependencies` / `globalEnv` (+ root lockfile + `package.json`); force `web_affected` ONLY on match. Turbo-pinned `//` (docs, metadata, non-triggering root dirs) must **not** force. Narrow `docs/**`-only guard = same idea, incomplete (`README`-only still over-triggers) — prefer `globalDependencies` intersection. Consumer `ci.yml` (Tier-3 `bkit-stub:affected-graph`); port fix per monorepo. Orthogonal to `[force full]` (deliberately bypasses `web_affected`).

### Promotion-lag warning (`Check Default Branch Lags Dev`)

CI on `dev` proves code good; nothing checks good code reached default branch. Gap bites — surfaces read LIVE from default branch, not `dev` / validated tip:

- **Renovate** resolves its config only from the default branch (see § Dependency updaters). A `renovate.json5` edit on `dev` is inert until promoted — `useBaseBranchConfig: "merge"` softens this for the config file but is itself read from the default branch.
- **Scheduled / default-branch-triggered Actions** run the default-branch copy of each workflow, so a `.github/workflows/` fix on `dev` does not take effect on those runs until promoted.
- **The published package / production deploy** are cut from the default branch, so unpromoted `dev` work is invisible to consumers.

`Check Default Branch Lags Dev` (`bkit-tests-static` lane) closes blind spot: every `dev` push diffs `renovate.json5`, `renovate.json`, `.github/workflows/**` vs default branch → `::warning::` + `$GITHUB_STEP_SUMMARY` if stale. **Non-blocking** nudge; keys ONLY consumed-from-default-branch surfaces. Clear: `dev` → default-branch PR.

Ships as bkit-managed `main-lag-warning` block (`# bkit:start main-lag-warning` / `# bkit:end main-lag-warning`): `bkit check` → non-blocking `tier2-text-drift` if **missing or drifted**. Sync from template; do not hand-edit. Safe even without default-branch-behind-`dev` gating: `dev` pushes only, self-skips when default branch is `dev`/unset.

## Workflow-file limits GitHub does not enforce visibly

**The 21,000-character expression cap.** GitHub compiles every block scalar containing a `${{ … }}` expression as ONE expression and refuses to compile the workflow past 21,000 characters:

```
failed to parse workflow: (Line: 2112, Col: 14): Exceeded max expression length 21000
```

Undocumented, and invisible to the toolchain — file stays valid YAML, passes `actionlint`, passes GitHub's own `@actions/workflow-parser`. GitHub refuses to compile, near-silently: `pull_request` runs **never created** (PR sits with no checks, no API error); push to a branch the `on:` filters exclude mints a zero-job run named after the file path. Consumer added ~4.6 KB of prose to one E2E step → CI stopped running on that branch for two hours with nothing to read.

- **A comment inside a `run: |` body is part of the expression.** A `#` comment above the step is free. Keep that comment to the rule plus a pointer at this section. The essay stays here. Pasting it into `run:` is what trips the cap.
- **Guard below the cap, not at it.** 20,999 leaves the next edit no room and fails unreadably. Static lane: scan `.github/workflows/*.{yml,yaml}`, measure every block scalar containing `${{`, fail with margin (consumer uses 20,000).
- **A long `run:` body is the symptom.** Fix is rarely compression — move the logic into a script the step calls (`node scripts/ci/…`), unit-testable as a side effect.

## Post-merge dev CI auto-routing

`bkit-cloud.yml`'s `workflow_run` trigger fires on `feat/**` AND `dev` CI completion (never `main`) — the per-branch success/failure matrix is canonical in `.bkit/cloud.md` § Branch-aware routing. What the post-merge surfaces add on top of it:

- **Trigger scope.** Dispatch jobs gate on `workflow_run.head_repository` being this repo, so a fork PR's CI completion never boots one; on `dev` the same gate excludes `conclusion == 'success'` outright, so a green post-merge run costs zero runner minutes (the merge already happened — that run only confirms the regression check passed).
- **FID recovery on `dev`.** No open PR exists, so `{FID}` comes from the squash-merge commit scope (`feat({FID}): …`, primary), falling back to the `bkit:fid` marker in the body of the merged same-repo PR for that SHA. Neither resolving → no-op, no dispatch.
- **Loop bound.** A `dev` CI failure dispatches `/bkit-debug` under `MAX_DEV_DISPATCH_ATTEMPTS` — distinct failed CI SHAs per `{FID}`. `/bkit-debug` creates no branch of its own, so on this surface it remediates on `dev` itself and its push re-triggers this same router; the cap is what terminates that loop. `feat/**` is not capped here (in-session `MAX_DEBUG_ATTEMPT` bounds it).

**Auto-route contract:** the `bkit [auto route]` free-tier gate marker is threaded by `/bkit-ship` onto the squash-merge `--subject` (not just the sync-merge commit) whenever the issue carries `bkit:auto` — this is what admits `dev`-triggered runs through the existing `bkit-cloud.yml` gate; there is no second gate path. The `[skip ci]` ship-DONE close commit that follows the squash merge never carries the marker and never triggers CI, so it cannot interact with this trigger. Trust surface, kill switch and the cap's tamper caveat → `docs/security.md` § CI Auto-Route Trust.

**Docs-only-diff precondition:** the `dev`-trigger path routes every post-merge CI failure to `/bkit-debug`. This is only correct for docs-only diffs if the consumer's `ci.yml` "Await Vercel Deployment" step neutralises a Vercel-CANCELED build (skip e2e, stay green) rather than reds it — if a consumer reds on Vercel-CANCELED, every docs-only squash-merge to `dev` false-dispatches `/bkit-debug` and burns loop-cap budget. Verify this per consumer before relying on the `dev` trigger.

**Consumer-repo acceptance note:** the full happy-path loop (squash-merge → post-merge CI → `workflow_run` → `/bkit-debug` dispatch → fix PR → re-merge) is only exercisable on consumer repos with `bkit-cloud.yml` installed and its dispatch secrets wired (see `BKIT_GH_TOKEN_INSTALL` — presence matrix, below, and the cloud-agent auth surfaces in `docs/security.md`). A consumer without `bkit-cloud.yml` installed, or without CI running on `push: branches: [dev]`, never emits the `workflow_run` event this trigger depends on — the feature degrades to a silent no-op, not a failure.

## Ship gate + bookkeeping

`/bkit-ship` is keyed on `git merge-base --is-ancestor origin/dev origin/feat/{FID}`. **Path A** — `dev` has not moved — resumes read-only, no rebase, no bookkeeping commits, no push; merge. **Path B** — `dev` moved — integrates (B1 `gh pr update-branch`, or B2 worktree + `@bkit-ship-conflict-resolve` + `git push --force-with-lease`), then re-validates unconditionally. Both paths end at the same gate: `bkit-ship-gate.sh assert --head <current>` concluded `success` at the **current** PR head.

### Consumer CI contract — `pull_request` resolves to `run_level=full`

The merge gate (`bkit-ship-gate.sh`) asserts the capstone job's `conclusion=success` at the head being merged. That assertion is only load-bearing while `pull_request ⇒ run_level=full` holds — i.e. the capstone is green **because every expected tier ran and passed**, not because the lanes were skipped (see `## Run-level decision matrix` above). A consumer that narrows CI on `pull_request` has opted out of the merge-gate guarantee by construction:

- **`paths-ignore` / `paths` filters** that skip `pull_request` on some changes → the capstone may not run at all (no workflow run at head → gate code 10, refuse).
- **A docs-only short-circuit** in the host's build-cancel (Vercel `ignoreCommand` / Netlify) that cancels the run mid-flight → capstone may land `cancelled` (gate code 15) or never complete (code 11).
- **A `[skip ci]` token** in a feature-branch commit subject when the PR opens → GitHub suppresses the `pull_request` run entirely; the PR's `statusCheckRollup` is vacuously empty → no run at head (gate code 10).

bkit-ship-gate covers the **common** violation shapes. A skipped non-capstone lane is **reported, not refused** — the planned-vs-vacuous judgement belongs to the capstone, which takes every lane result as an input and already asserts it per lane. The gate cannot make that judgement itself: the jobs API reports no reason for a skip (a job skipped by a job-level `if:` never reaches a runner, so it carries an empty `steps` array), and a SHA-cache short-circuit concludes `success` with step-level skips plus a `cache_skip` output, never `skipped`.

**Code 16 is opt-in, and must stay that way.** It fires only for lanes named in `bkit.shipGateRequiredLanes` (package.json array) or `--required-lanes a,b,c`; the default empty list never refuses. A blanket refuse-on-any-skip is **unsatisfiable by construction** for the CI shape bkit ships: a lane whose `if:` is event-scoped — `bkit-tests-live-web` runs on a push to `dev` or the default branch only — cannot run pre-merge at any head, so a pre-merge gate demanding it refuses every PR forever. Device lanes (`-ios` / `-android`) use the same rule on a pull request and a push; do not treat them as post-merge canaries. Name a lane in `shipGateRequiredLanes` only when your capstone does not assert it and the lane genuinely can run pre-merge. `BKIT_SHIP_GATE_OVERRIDE` remains the audited per-head escape hatch. What still carries the anti-vacuity guarantee is codes 10-15: a run exists, at THIS head, completed, not cancelled, capstone present, capstone green. Code 14 (green at a superseded head) requires `--branch`: the head-keyed run query is filtered server-side, so a moved head returns the same empty list as a head that never ran, and only a second branch-scoped query separates them. A run that is **present but degraded-but-not-skipped** (e.g. a required lane ran with a reduced test set due to a consumer config the gate cannot see) is a **residual risk named here, not claimed as covered** — the capstone is green because bkit's own `run_level` planner computed `full`; a consumer narrowing inside a lane bkit does not own is invisible to the gate. Keep the capstone (`bkit-tests-check`) as the sole branch-protection required check so `green == validated` survives a docs-only push; do NOT add per-lane required checks (a hollow lane then green-bars the capstone).

**No duplicate dispatch on an already-triggered head (ship Step 5):** a branch push / `gh pr update-branch` fires `pull_request` at the new SHA on its own. The scaffold keys a pull request on `pr-{number}` and a `workflow_dispatch` on `github.ref` — separate groups, so a redundant dispatch is never cancelled and burns a full duplicate run. Ship probes that exact head for a run (presence-only) and dispatches ONLY on no-run; the probe is not a pass condition, and the completion poll is head-anchored (`select(.headSha == $h)`) because an unfiltered `gh run list --limit 1` can return a completed run from a superseded head. Gate codes 10 / 11 / 14 re-enter that probe-and-poll ONLY, never the deferred sweep, bounded by `MAX_REVALIDATE_ATTEMPT`.

### Consumer rollback path

The ship gate + bookkeeping rework ship together in one `bkit upgrade` so no consumer sees prose calling a gate it does not have. To unwind a bad ship surface (gate script, managed config, or rewritten `bkit-ship.md`) without downgrading unrelated fixes:

1. **Pin the previous `@cbartens/bkit`** in `package.json` (the sliding `@v{N}` tag auto-receives patches; a regression lands via the tag, so pin to the last known-good immutable `v{N}.x.y` or `@<sha>` — see § Sliding major-version tag). Re-install and confirm `bkit check` reports no drift.
2. **Hold `bkit upgrade` for ship surfaces** (`.bkit/workflows/bkit-ship.md`, `.bkit/scripts/bkit-ship-gate.sh`, `.bkit/scripts/bkit-ship-timeouts.sh`, the package-level `bkit.ship` config) until the regression is fixed upstream. Other bkit upgrades are independent.
3. **Audit any `BKIT_SHIP_GATE_OVERRIDE` rows** in `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` written in the interim. Each `type:"ship-gate-override"` row is a sanctioned escape that turned a refusal into a merge — treat every row as a PR whose capstone was NOT green at the merged head and re-verify it against the pinned-good gate (`bkit-ship-gate.sh assert --head <sha>`). `[bkit-ship-gate] override honoured for head …` is the matching `docs/observability.md` grep key.
4. **A per-workflow pin/revert affordance does not yet exist** (deferral `per-workflow-rollback-path-for-shipped-bkit-workflow-changes`); today the package pin + selective `bkit upgrade` hold is the recovery path. Document any incident in `docs/failures.jsonl`.

Bookkeeping (`status.jsonl`, ship artifacts) goes to the dev tree from Step 1 when `RUNTIME_DEVPUSHES=true` (modes 1–2), or the current working branch tree when `false` (mode 3 — cloud) — see `.bkit/workflows.md` § Ship `BOOK_ROOT`. The single `[skip ci]` close push carries bookkeeping; no bookkeeping commit rides `feat/{FID}` before the merge.

## Smoke trigger plumbing

Smoke runs **after** deploy, in its own workflow, off the merge gate (what it actually probes → `testing.md` § Smoke). When `bkit-tests-deploy` promotes inside CI, that probe is `health.yml` (`workflow_run` after CI success on the default branch) — one workflow, not a second smoke file, unless the two probes differ. Pick the trigger by **where the deploy happens**, not by habit:

- **Deploy happens inside CI** → key smoke to **`workflow_run`** (the CI workflow `completed` + `conclusion == 'success'`). Mind the 3-level `workflow_run` chain cap — a fourth chained workflow will not fire.
- **An external platform deploys after merge** (Vercel / Netlify-style Git integration) → key to a **post-_deploy_** signal — `deployment_status` (`state == 'success'`) or the platform's `repository_dispatch` event — so smoke fires when the deploy is actually **live**, not merely when CI finished. `workflow_run` here smokes a not-yet-serving (or about-to-be-replaced) deployment.
- Either way: separate workflow, **non-blocking** (never a required check), and wait for the target to be **serving** before probing — READY ≠ serving (`testing.md` § Deploy-reachability).
- **Not:** smoke wired into branch protection (it gates observability, not merges), or a `workflow_run`-keyed smoke against an externally-deployed app that probes the old build.

## Applying migrations at deploy time

The deploy-time **apply** and the test-time **replay** gate are different guarantees — keep both, preferably in the **same always-on lane** (`bkit-tests-migration`):

- **Apply (deploy path):** push only the **new** migrations onto the already-migrated remote — idempotent (applies what's not yet in the ledger; safe to retry), and it **never** replays from empty or runs the seed. Home: `bkit-tests-migration` on every push to `dev`/`main` (`db push --linked --include-all`), **not** inside `bkit-tests-e2e-web` (leaving it in e2e while live runs parallel is the schema-cache race). Un-gated by `run_migration` so it self-heals a remote left behind. AFTER the replay steps so a from-empty failure never reaches shared remote.
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

## Promote after the capstone (`bkit-tests-deploy`)

The host does not auto-build the default branch. `bkit-tests-build-web` creates this SHA's deployment and leaves it un-promoted. The lanes test that URL. `bkit-tests-deploy` `needs: [bkit-tests-check, bkit-tests-build-web]`, runs on a push to the default branch only, and is not a required check. It promotes the exact `deployment_id` the build lane published. It does not look the deployment up again by SHA. A red deploy job means the previous deployment stays live.

Do not add a host-side "hold promotion until a named check passes" setting (e.g. Vercel Deployment Checks). That list stays empty. This job is the promotion. e.g. Vercel: `git.deploymentEnabled` for the default branch is false; auto-assign of production domains is off.

Health (optional, `.github/workflows/health.yml`) runs on `workflow_run` after that CI run succeeds, and smokes the deployment this SHA promoted. Not a required check.

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

### Dependency updaters

**Pair with an updater.** A pin that nothing bumps stays on a vulnerable digest. All templates: `.bkit/templates.md`. Copy one updater example and own it:

<!-- prettier-ignore -->
| Updater | Copy | When |
| --- | --- | --- |
| Renovate (rules) | `.bkit/templates/.github/renovate.json5` → `.github/renovate.json5` | Default. Grouped PRs, lockfile maintenance, `osvVulnerabilityAlerts`. |
| Renovate (self-hosted runner) | `.bkit/templates/.github/workflows/renovate.yml` → `.github/workflows/renovate.yml` | Mend's 3 GB runner OOMs (`kernel-out-of-memory`) on a large pnpm graph. `ubuntu-latest` is ~16 GB. Edit `runs-on` in the copy. |
| Dependabot | `.bkit/templates/.github/dependabot.yml` → `.github/dependabot.yml` | First-party GitHub. No App. One PR per package. No lockfile-maintenance job. |

Use one. Both open PRs for the same packages. `bkit.depUpdater: "none"` skips the install-time absence advisory.

**Hands off bkit-owned files.** `bkit install` rewrites `.github/workflows/bkit-cloud.yml`. An updater that bumps its action pins opens the same PR forever.

- Renovate: list `.github/workflows/bkit-cloud.yml` in `ignorePaths`. A packageRule `enabled: false` does not stop the scan; `pinDigests` still rewrites the file.
- Also ignore `.bkit/templates/**` and `.agents/skills/**` (bkit-owned; scanning them is noise).
- Dependabot: `exclude-paths: [".github/workflows/bkit-cloud.yml"]` on the `github-actions` block. That covers version updates. Security-update PRs for that file can still open; close them.
- Your own `ci.yml` and, if you copied it, `renovate.yml` stay out of that list so their pins can refresh.
- `bkit install` warns when `bkit-cloud.yml` exists and the updater config does not name it (`dep-updater-touches-bkit`).

**Land config on the default branch before the bot runs.** GitHub Apps and Dependabot read config from the default branch. The example sets `baseBranchPatterns: ["dev"]` (PRs land on `dev`) and `useBaseBranchConfig: "merge"` (edits on `dev` apply to dev-targeted runs). `useBaseBranchConfig` itself is read from the default branch, so it needs one merge there before dev-side edits take effect.

**Renovate, Mend.** Install the App at https://github.com/apps/renovate only after `renovate.json5` is on the default branch. No `gh api` equivalent. Within a few minutes the App opens an onboarding PR; merge it.

**Renovate, self-hosted.** Copy the workflow example. Suspend the Mend App for this repo (Settings → Applications → Renovate → Configure → remove this repo) or both open `renovate/*` PRs. The cron wakes the bot daily; `renovate.json5` `schedule` still gates normal PRs. Do not narrow the cron to weekly — `osvVulnerabilityAlerts` PRs need the daily wake.

Platform auth is a repo secret `BKIT_GH_TOKEN`, never `GITHUB_TOKEN` (those PRs do not trigger CI, so required checks and automerge never fire). Fine-grained PAT, this repo:

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

`Commit statuses: Read and write` is what opens the PR. Without it Renovate creates the branch and 403s on commit status. There is no separate Checks permission on a fine-grained PAT. Keep `BKIT_GH_TOKEN` separate from `BKIT_GH_TOKEN_INSTALL` (`read:packages` only). Org-owned tokens cannot read the owner email; set the Actions variable `RENOVATE_GIT_AUTHOR` (for example `Renovate Bot <renovate@your-domain>`).

**Private package.** `@cbartens/bkit` is on `npm.pkg.github.com`. Lockfile regen resolves it for every bump. Without a read token, regen 401s and CI fails `pnpm install --frozen-lockfile`.

- Mend: add `BKIT_GH_TOKEN_INSTALL` as a Mend repository secret and tick "used during the scan as an environment variable". Uncomment the `hostRules` `token` line in `renovate.json5`.
- Self-hosted: leave that line commented. The example workflow sets `RENOVATE_HOST_RULES` from the Actions secret. An uncommented Mend-style line adds an empty-token rule and 401s.

**pnpm 11 on Mend's runner.** A large graph can OOM during `pnpm update --lockfile-only`. The example sets `minimumReleaseAge: "1 day"` and caps `PNPM_WORKERS`. To clear the per-install gate, set `minimumReleaseAge: 0` in `pnpm-workspace.yaml`. Deleting the key does not: pnpm 11 defaults it to 1440. Self-hosted on `ubuntu-latest` has the memory; the freshness setting is still yours to keep or drop.

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

**Runner labels for bkit workflows.** `bkit-cloud.yml` `runs-on` comes from `bkit.runners.bkitCloud` in `package.json` (else `runners.default`, else `ubuntu-latest`). Do not hand-edit that file. `ci.yml` and a copied `renovate.yml` are yours — edit `runs-on` in the file.

```jsonc
"bkit": {
  "runners": {
    "default": "ubuntu-latest",
    "bkitCloud": "depot-ubuntu-24.04"
  }
}
```

### Manual CVE handling (when an alert fires)

Renovate's `osvVulnerabilityAlerts: true` opens CVE-driven PRs immediately against `dev`. If you also want to keep GitHub's Dependabot **alerts** on (Settings → Code security → Dependabot alerts), the Security tab continues to surface advisories — useful as a parallel signal, not required. Handle each alert against `dev`:

1. Read the alert — note `vulnerable_version_range` and `first_patched_version`. Check `pnpm why <pkg>` to see the import chain (direct vs transitive; dev vs prod scope).
2. **Direct dep**: bump in `package.json`, run `pnpm install` + `pnpm typecheck` + `pnpm test`.
3. **Transitive dep**: bump the parent that pins it (e.g. bump `vitest` to pull in a CVE-fixed `vite`). If the parent itself cannot upgrade, add a `pnpm.overrides` entry pinning the transitive to a fixed version — or add the transitive directly to `devDependencies` to force the resolution.
4. Open a PR against `dev` titled `fix(security): bump <pkg> >=<fixed-version> (CVE-XXXX-YYYY)`. After merge to `dev → main`, the alert auto-closes once GitHub re-scans the default branch.
5. If a CVE has no impact on your usage pattern (e.g. dev-server-only vuln in a build tool that you never run as a server), dismiss in the GitHub UI with the **"Vulnerable code is not actually used"** reason and a one-line justification. Don't dismiss without documenting why.

<!-- bkit:end -->
