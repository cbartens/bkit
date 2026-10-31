<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Deployments

> [!CAUTION]
> **Purpose:** The rules for deployment, environment config and the CI/CD pipeline: secrets sync, branch protection and run-level tiers.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
> - Pre-push runs the project's gate set locally (see "Pre-push checklist" below).
> - Never use `--no-verify`.

## Production rollback runbook

> Use this runbook when a bad release is live. Move production back to the last good deployment, then fix forward through `dev`. Production moves first, and `main` keeps its history. The steps work on any host. The commands use Vercel as the example.

### Preconditions

- You know the last good deployment id. It is the deployment production served before the bad release, which `bkit-tests-deploy` logs as the deployment it replaced. Without that log, use the host's deployment for a commit that is green on `main` (`gh run list --branch main --status success --limit 5`).
- `gh auth status` is green.

### Playbook

1. **Move production back** to the last good deployment. Do not rebuild, and make no git change. Move every production host the release moved (the site, and webhook or background-job aliases), never the website alone. With `bkit-tests-deploy` adopted, run the switch from a `workflow_dispatch` rollback workflow in the deploy job's `concurrency:` group (`cancel-in-progress: false`), so a release and a rollback never switch production at once. For example, on Vercel:
   ```bash
   vercel ls --meta githubCommitSha=<green-sha>
   vercel promote <prior-deployment-url>
   ```
2. **Mark the bad deployment** when `bkit-tests-deploy` is adopted. `bkit-tests-deploy` refuses the deployment id in repo variable `ROLLED_BACK_DEPLOYMENT_ID` (§ Promote before the lanes), so a "Re-run all jobs" of the bad run cannot promote it again.
   ```bash
   gh variable set ROLLED_BACK_DEPLOYMENT_ID --body <bad-deployment-id>
   ```
3. **Verify** the rollback with § Post-rollback verification.
4. **Fix forward through `dev`.** Revert the bad change on a `revert-*` branch off `dev`, or ship the fix. Open a PR into `dev`, then release `dev` → `main` as usual. Hold every other release PR into `main` until it carries the fix, because a release cut from `main`'s tip ships the bad commit again. The release descends from the commit production serves, so `bkit-tests-deploy` promotes it. Never rewind or re-seed the database. Ship a corrective migration instead (§ Applying migrations at deploy time). The rolled-back build must work on the newer schema, so expand first and contract later.
5. **Reset `main` — last resort.** Do this only when `main` holds commits that a `dev` release cannot undo (for example, a squash that landed on `main` without going through `dev`), and only after step 1. If you reset first, `bkit-tests-deploy` refuses every release until production moves, including the run the reset starts, because production's commit is no longer an ancestor of `main`. The reset is a push to `main`. With `bkit-tests-deploy`, it starts a release run that builds and promotes a fresh deployment of `<green-sha>`. You need `jq`, a local repo on `main` and a clean tree.
   ```bash
   # save protection verbatim (GET and PUT shapes differ; raw GET avoids hand-mapping)
   gh api repos/{OWNER}/{REPO}/branches/main/protection > /tmp/main-protection.json
   # disable protection so the force-reset is accepted
   gh api -X DELETE repos/{OWNER}/{REPO}/branches/main/protection
   # force-reset the ref
   gh api -X PATCH repos/{OWNER}/{REPO}/git/refs/heads/main -f sha=<green-sha> -F force=true
   # restore: inspect the saved JSON and PUT the equivalent shape (`required-status-checks` → `required_status_checks`, contexts list, etc.)
   gh api -X PUT repos/{OWNER}/{REPO}/branches/main/protection --input /tmp/main-protection.json
   ```

### Revert, not reset

- A reset rewrites the history that every clone, open PR and release record points at, and it runs with branch protection off. A revert keeps `main` equal to what was released.
- `git revert` on a cross-branch squash (for example, `feat/*` landed on `main`, not `dev`) can delete files that `main` code still references. The tree then fails CI despite its "clean" history. That squash is the step-5 case. Production merges MUST come from `dev` (single-feature squash scope).
- On `revert-*` branches, pre-push drops only the unit and integration lanes (`bkit:gate:static` in place of the push gate). The static lane and the bkit drift gate still run, so a revert PR can be pushed while the source state is briefly inconsistent.

### Post-rollback verification

- Every production host reports the last good deployment id. Read it back from the host API, or from the `curl -sI https://{prod-alias}` headers.
- Run the production smoke suite to confirm the rolled-back app behaves as expected.
- With `bkit-tests-deploy` adopted, `gh variable get ROLLED_BACK_DEPLOYMENT_ID` prints the bad deployment id.
- After a step-5 reset, `gh api repos/{OWNER}/{REPO}/git/refs/heads/main --jq .object.sha` equals the green SHA.

## Dev rollback runbook

> Use this runbook to unwind a bad commit on `dev` to the prior known-good SHA when the rolled-out range included applied migrations. A code-only rollback leaves the dev DB ahead of the code, so schema-aware tests (schema introspection, access-policy integration) fail on an otherwise clean tree. The steps work with any database. The commands use Supabase as the example.

### Preconditions

- You have a known-good SHA on `dev`. Confirm the target SHA is green with `gh run list --branch dev --status success --limit 5`.
- The local repo is on `dev`, with a clean tree, and `gh auth status` is green.
- `bkit-tests-migration` is adopted, because it owns the remote apply (§ Applying migrations at deploy time).
- The dev DB admin connection string is in your local env (for example, on Supabase: the service-role `SUPABASE_DB_URL`).

### Playbook

1. **Revert the bad range locally.** NEVER `git reset` or force-push `dev` (`.agents/rules.md` § Git, CI & Merges). Push ONLY at step 3, after the dev DB reset in step 2, because CI on the push must meet the reset DB. **If** the range holds a merge commit → revert it with `-m 1`.
   ```bash
   git revert --no-edit <green-sha>..HEAD
   git diff --stat <green-sha> HEAD   # empty = tree matches known-good
   ```
2. **Reset the dev DB.** Drop every schema your migrations create (`CASCADE`), then truncate the migration ledger. Name only your own app-managed schemas. For example, on Supabase (`public` is shown; add each schema your migrations create):
   ```bash
   psql "$SUPABASE_DB_URL" -c 'DROP SCHEMA IF EXISTS public CASCADE;'
   psql "$SUPABASE_DB_URL" -c 'TRUNCATE supabase_migrations.schema_migrations;'
   ```
3. **Push the revert.** The push run's `bkit-tests-migration` re-applies every migration on the reverted tree, because an empty ledger makes every migration new. NEVER apply by hand. **If** `dev` is protected → push the revert on a `revert-*` branch and merge its PR. The apply then runs on the merge push to `dev`.
   ```bash
   git push origin dev
   ```
4. **Re-seed fixtures.** **If** the dev DB is seeded:
   - Once `bkit-tests-migration` is green, re-seed with your seed command (for example, `pnpm db:seed`).
   - Then re-run the lanes that read seed data: `gh run rerun <run-id> --failed`.

### Why code-only rollback is not enough

- A revert removes the range's migration files from the tree, but their migrations stay applied, because the DB has no "unapply" for code-driven migrations.
- Schema-introspection tests (columns, access policies such as RLS, table presence) then see structure the code no longer declares, and fail on drift.
- An apply after the ledger truncate re-applies only the reverted tree's migrations, so the DB lines up with the code.

### Post-rollback verification

- `git diff --stat <green-sha> origin/dev` must print nothing.
- The migration ledger must match the reverted tree's migration files. For example, on Supabase, compare `psql "$SUPABASE_DB_URL" -c 'SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;'` with `ls supabase/migrations/`.
- Re-run the schema-aware test suite (e.g. `pnpm test:integration`) to confirm DB and code agree.

## Commit-message force tags

bkit's `bkit-ci.yml` recognises the tags below. They are case-sensitive and use the literal `[...]` form. A tag may appear anywhere in its source string. Tags compose: several on the same commit or PR title each fire independently.

**Where to put the tag:**

- **Direct push to `dev` or `{{DEFAULT_BRANCH}}`** (no PR): put the tag in the commit message (`github.event.head_commit.message`).
- **Feature branch with an open PR** (open, synchronize or edit): put the tag in the PR title (`github.event.pull_request.title`). The commit message is not read, because the workflow fires on `pull_request`, not `push`.
- **Both surfaces** are checked by `contains()` in the env block, and a marker in either one wins for its event. Pick the right one: `[verbose ci]` in a feature-branch commit message has no effect, because only the PR title is read.
- **`workflow_dispatch`**: neither field is filled, so every marker is inert. The planner sets `MSG=""` for events other than `push` and `pull_request`, and silently drops `[force full]`, `[force build]` and `[verbose ci]`. Steer a dispatch with inputs, never a marker. Inputs are mandatory when the dispatch default is expensive, for example when a dispatch forces the metered native build lanes past their reuse gate and spends build quota on every run. Gate the lookup behind an input that defaults to `false`.

<!-- prettier-ignore -->
| Tag | Effect | Scope |
| --- | --- | --- |
| `[force cache]` | Busts the task-runner cache for the run — recompute instead of replaying cache hits (e.g. turbo: `TURBO_FORCE=1`). Use when investigating suspected ghost-greens. | Read by `Detect Direct Push` |
| `[force build]` | The lighter hammer. Exposes `should_force_build=true` + `run_level=full`. It does not bypass `web_affected`, so integration, e2e and @live run only when web is genuinely affected. Use it to rebuild without paying @live's side effects. Deploy steps act on it only when they gate on the output. | Read by `Detect Direct Push` |
| `[force full]` | The hammer. Sets `run_level=full` and bypasses `web_affected`, so integration, `bkit-tests-e2e-web`, and `bkit-tests-live-web` run on any commit, including docs-only. The E2E spec set does not change, because a PR already runs the full suite. `@live` stays push-only: a docs-only `[force full]` push reaches it through the effective `web_affected`, but a PR or a dispatch never does. | Read by `Detect Direct Push` step |
| `[verbose ci]` | Escalates log detail for one run. Shipped stub flips turbo / Node / Vercel / Supabase / Playwright knobs: `TURBO_LOG_LEVEL=full`, `NODE_OPTIONS=--trace-warnings --trace-deprecation` (a job-level `env:` key, never a `$GITHUB_ENV` write, which the runner rejects while still reporting success), `DEBUG=vercel:*,supabase:*`, plus Playwright `--trace=on` (when E2E stub enabled). Add your stack's equivalents to the same `env:`. Use when `bkit-debug` diagnose returns thin evidence; never for routine pushes (trace.zip files are MB-scale). See `testing.md` for the full knob list and the `--reporter=line` hostile gap. | Read by the job-level `env:` of `bkit-tests-static` (copy the same `env:` onto each lane) |
| `[skip ci]` / `[skip actions]` | Honoured natively by GitHub Actions, so it suppresses workflow dispatch entirely. Use sparingly: the suppressed run will not appear in `gh run list`, and downstream `workflow_run` triggers will not fire. | Native GitHub behaviour, not a bkit-level toggle |

**Two deploy-forcing markers only: `[force build]` and `[force full]`.** There is no granular `[force e2e]` or `[force live]`, because they would be silent no-ops gated behind `web_affected`. `[force full]` is the single gate bypass ("validate everything"): one effective `web_affected` drives integration, e2e and @live the same way.

- **Precedence: `[skip ci]` / `[skip actions]` vetoes any force marker.** A `[skip ci]` commit never dispatches, because GitHub suppresses it natively before `bkit-ci.yml` runs. No force marker undoes that. To validate a commit that would be skipped, drop `[skip ci]` and push with `[force full]`.
- **`[force cache]` is a separate axis.** It busts task-runner replay (for example, turbo `TURBO_FORCE=1`), which is a different axis from which lanes run. It is never folded into `[force full]`. Combine `[force full] [force cache]` for "everything, fresh."
- **Marker parity (deploy-forcing set).** The e2e and @live lanes resolve a per-SHA deployment, so a marker that force-runs them must also force the host build. Otherwise the lane dies at "resolve deployment URL". The host build-cancel script (for example, Vercel `ignoreCommand`) must honor every marker in the deploy-forcing set: the shipped `[force build]` and `[force full]`, plus any consumer marker that widens a deploy-backed lane. Assert this in CI (`grep -qF` over the cancel script). `[force cache]`, `[verbose ci]` and `[skip ci]` act on the test plane only, and the cancel script does not honor them.
- **Match a signature, not a spelling.** A value-list marker (`[platform web ios]`) is invisible to a substring test for `[platform web]`. Match the opening token (`[platform `) on both sides. An assertion pinned to one spelling stays green while the cancel script kills the build the marker asked for.
- **A widening marker is an or term, never a condition.** A marker that adds a lane the affected graph missed must only widen. Used as a condition (`contains(plan.platforms, 'web')` in a lane `if:`), it also removes: `[platform ios]` on a web-touching commit silently drops the web lane, and the run goes green. Guard the direction with a check over the workflow text, and mutation-prove it both ways. Intent alone does not hold this shape.
- **Widen the job gate and the step gates together, or not at all.** A job-level `if:` alone starts the lane while every step inside it skips. The result is a green lane that ran nothing, which is the capstone's own failure mode, arriving where the capstone cannot see it. Step-level readers of a plan value can far outnumber its job-level readers, so count them before you widen a shared plan value.
- **Forcing a subset** (builds without their tests): do not widen the shared value. Derive a new boolean beside it (`build_forced` next to `web_affected`), and gate only the lanes it owns. This is valid only for a lane with no step-level reader of that value. Assert that directly, with an error message that names what breaks when someone adds one.
- **Invoke the marker parser unconditionally.** A substring pre-gate in front of a parser is a silent no-op. A pre-gate on the literal `[screenshots ` with a trailing space never matches a bare `[screenshots]`, so the step exits 0 with an empty plan, and the run goes green having captured nothing. Run the parser every time, and let it own every failure class (unknown value, invalid combination, arguments to a bare flag), loudly, in the planner, before any lane starts.

A direct push to `dev` (no merged PR ancestry) auto-busts the task-runner cache (for example, turbo `TURBO_FORCE=1`) regardless of tags. See the `bkit-debug` runbook for why the cache is busted.

## Autonomous phase-close prerequisites

The design and plan Close Workflow lands docs on `dev` in one of two ways. Every runtime first builds the close commit off `origin/dev` and pushes it straight to `dev`. When that push goes through, no repo setting is required, and no PR is created. When GitHub refuses it (branch protection or a ruleset on `dev`), the close opens a PR and squash-merges it, which adds two repo prerequisites. Neither is pre-flighted, because no admin-scope token is required. Instead, a missing prerequisite shows itself when the close's own merge fails loudly.

- **Branch protection on `dev` permits the autonomous merge**, because no human review is required. The PR-path merge does not wait for checks: its merge subject carries `bkit [skip ci]`, so a docs-only close dispatches no run to wait for. A rule requiring status checks to pass will block it.
- **"Automatically delete head branches" is enabled** (repo Settings → General). The PR-path close deliberately does not pass `--delete-branch`, because `gh` would also delete the local branch. That fails when the branch is checked out in a worktree, and returns non-zero after a successful merge. Head-branch cleanup relies on the repo setting instead.

Confirm both before running phase closes from a cloud agent session.

## Run-level decision matrix

bkit ships a mostly flat, wide scaffold. `bkit-tests-scope` always runs. It reads the markers once, computes `run_level`, the optional `run_migration` and `tenant_target`, and emits the `bkit-test-plan` JSON. It fans out to every lane (`bkit-tests-static` / `-unit` / `-build-web` / `-build-ios` / `-build-android` / `-integration` / `-e2e-web` / `-e2e-ios` / `-e2e-android` / `-live-web` / `-migration` / `-reset` / `-cleanup`), and `bkit-tests-check` joins them. `bkit-tests-deploy` runs on a push to the default branch only, promotes the release before the E2E / `@live` lanes run, and is not required. Static/unit/integration/build wait only on the planner.

**Ordering edges:**

- **If** `bkit-tests-migration` owns the shared-remote migration apply → every lane that hits that database `needs:` it with `result != 'failure'`.
- On the default branch, migration also waits for static / unit / integration / build-web before it touches production's database.
- `bkit-tests-reset` sits after migration and before those lanes.
- On the default branch, every tenant lane `needs:` `bkit-tests-deploy`, and refuses unless production serves this run's build.
- Do not gate `bkit-tests-live-web` behind static/unit/integration/e2e.

Adopt only the lanes this repo has. Lane names and the adopt order are in `testing.md` § CI test tiers. Before you spend on CI speed, measure the job graph and find the pole (the lane that sets the wall-clock time). The jobs above the reference in `bkit-ci.yml` are the any-repo starter. The **full CI scaffold reference** names each target job's `needs`, `if`, and step order. When a starter stub disagrees with that reference, follow the reference.

<!-- prettier-ignore -->
| Run level | When | Runs | Defers |
| --- | --- | --- | --- |
| `none` | `[skip ci]` / `[skip actions]`; or release-PR mirror mode (the capstone copies the `dev` push run — § One CI run per dev commit). | Planner, then stop. | Every test lane. |
| `partial` | Push to `dev` that came from a merged PR, and no `[force build]` / `[force full]`. | Static, unit, integration when `web_affected`, build lanes, migration. `@live` (`bkit-tests-live-web`) still runs on this push when `web_affected`. | `bkit-tests-e2e-web`. Deploy (not the default branch). |
| `full` | Pull request; `workflow_dispatch`; push to `{{DEFAULT_BRANCH}}`; direct push to `dev` (no merged PR); `[force build]` / `[force full]`. | Partial's lanes, plus `bkit-tests-e2e-web` when `web_affected`. Same spec set as a push (`testing.md` § E2E on PRs). | `@live` off a PR and off a dispatch. On a default-branch push, `bkit-tests-deploy` promotes before the E2E / `@live` lanes run. It is not required, and its own `concurrency:` group stops two releases overlapping. Health runs as `workflow_run` after CI. |

Device lanes follow `plan.run_native_*`, not `run_level`. The same rule holds on a PR, a push (including `partial`), and a dispatch.

## One run per branch or pull request

```yaml
group: ci-${{ github.workflow }}-${{ github.event_name == 'pull_request' && format('pr-{0}', github.event.pull_request.number) || github.ref }}
cancel-in-progress: ${{ github.ref != 'refs/heads/{{DEFAULT_BRANCH}}' }}
```

A newer run cancels the older one on every event except the default branch, which queues. That run promotes the deployment, so cancelling it mid-promote could strand production across two releases (§ Promote before the lanes). A pull request keys on its number, and a push or dispatch keys on the ref, so a PR and a `dev` push still overlap. A `workflow_run` observer sees the latest run on that ref only.

A push diffs against the head of the last successful CI run on that branch, not `github.event.before`. Fall back to `github.event.before` only when there is no such run, or when that run's head is no longer an ancestor. A `workflow_dispatch` has no base commit, so short-circuit the affected step to fully affected. `HEAD~1` is only for the delta gates on a dispatch. Markers are inert on a dispatch, so steer it with inputs (§ Commit-message force tags). The planner parses markers once, and every lane reads `plan.markers_present`. The only re-read of the commit or PR text is the workflow-level task-runner cache bust (for example, `TURBO_FORCE`). Validate the plan JSON with `has()` / `!= null`, because jq `//` treats `false` as absent and drops a real `run_live: false`.

Migration-immutability and slop-delta run on every event against that same base. The starter's copies of those steps are still `pull_request`-only, and that `if:` is the shape from before the planner existed. Point them at the planner base once `bkit-tests-scope` exists. Pre-push on a `dev` push resolves the same base (`bkit-resolve-push-base.mjs --local`, `.bkit/templates.md` § Git hooks) and exports it as `SLOP_BASE_REF`. A repo-owned migration-immutability pre-push check reads that variable too.

Composition guidance:

- `steps.detect.outputs.should_force_build` / `should_run_full` escalate the run into `full`.
- A `dev` push with no merged PR (which auto-busts the cache, for example `TURBO_FORCE=1`) is a recovery signal: partial CI with the cache busted.
- Health (or smoke, when the probe is a script rather than a health URL) is a separate workflow that runs as `workflow_run` after CI succeeds. It is not a required check. Use one of the two, unless the probes differ (§ Smoke trigger plumbing).
- The capstone `bkit-tests-check` is the sole branch-protection required check. `bkit setup protect-main` applies it, reading the check name from `bkit.testing.ciCapstone` and the workflow from `bkit.testing.ciWorkflow`. Green means the expected tiers ran and passed (`green == validated`), not merely that the tests job did not fail. A `partial` or cache-skipped green is not a `full` validation.

### Parallel test lanes (one lane per tier)

Each tier gets its own parallel lane (job): `bkit-tests-static` / `-unit` / `-integration` / `-e2e-web` (+ `-migration` / `-live-web`, and optional `-build-ios` / `-e2e-ios` / `-build-android` / `-e2e-android`). Do not run the tiers as steps of one monolithic `bkit-tests` job. bkit CI and consumer repos run separate lanes, which has proven out. Wall-clock time is `max(lane)`, not the sum of serial steps. Each tier gets honest coverage, an executed count and job-level permissions, and a slow tier cannot serialise the fast ones.

The cost is duplicated per-lane setup (checkout, install, and shared infra such as a local DB). Reduce it with a remote task-runner cache (for example, turbo) and a DB service container. The capstone `needs:` all lanes, and each lane emits its executed count so the capstone can assert it was not hollow (`testing.md` § Validated means executed). Start with `-static` + `-unit`, and add a lane per tier. In a tiny repo you can collapse the tiers into steps of one lane, but the capstone must then assert each tier's count through step outputs. E2E full-suite parity and local-vs-preview DB routing are in `testing.md` § "E2E on PRs".

**Shared resource: reset first, clean up last** (optional). Use this when 2+ lanes use one long-lived resource. `bkit-tests-reset` runs after scope + migration, takes a lease, and puts the resource in its known state before any of those lanes start. `bkit-tests-cleanup` runs last, `if: always()`, and releases the lease. The lease is what serialises an overlapping PR and `dev` push. The planner names at most one target; an empty target skips both jobs. Capstone reds if a planned reset skipped or either job failed. Drop both when the resource is provisioned fresh per run (`testing.md` § Provision backing services fresh — the preferred answer).

**Runner size is a per-lane lever, and only for the pole.** In a flat graph, one lane defines the wall-clock time (commonly E2E). A larger runner (more vCPU / RAM) raises internal parallelism (more workers, concurrent E2E projects), which can cut a long lane substantially. Scope it with `runs-on: <your-larger-runner-label>` to one lane, and keep the default runner everywhere else. Three caveats:

1. **A higher per-minute rate.** Confirm the rate before you adopt a larger runner, because it may not show until the first invoice. [Depot](https://depot.dev/docs/github-actions/runner-types) labels (for example, `depot-ubuntu-24.04-8`) are ~30% cheaper than GitHub-hosted runners. `bkit-ci.yml`, `bkit-cloud.yml` and `bkit-renovate.yml` are templates you own, so set `runs-on` in your copy.
2. **Zero wall-clock gain when it is aimed at a lane that is not the pole.** The pole is the slowest lane, and it sets the run's wall-clock time. A bigger runner on any other lane saves no time, and it pays off only once its own lane is the pole. Measure first, and re-measure afterwards, because the pole moves.
3. **A label that does not exist does not fail, so the job queues.** A typo'd or retired label raises no error anywhere: the job stays queued indefinitely, and the run neither reds nor completes. Set the label in exactly one place, derive every `runs-on:` from it, and make the planner fail closed when there is no label.

**Cut per-request cost before peak concurrency.** Fan-out multiplies every per-request call to a shared external service. For example, a per-navigation auth call under a wide fan-out turns into thousands of `GET /auth/v1/user` requests in minutes. That stalls the provider and reddens lanes on other machines that share it. Audit those calls before you widen the fan-out. Verify locally first (JWKS), and call the service only when the local check cannot decide. This is cheaper than either lever below.

**Phase-split before a bigger runner.** When fanned-out lanes fail together, find the contended resource before you spend. The tell-tale is that adding lanes raises the failure count and a lane on a separate machine reddens too. That second fact is the diagnosis. A lane on its own runner cannot be starved by this runner's CPU or memory, so the contention is a shared remote resource (for example, the DB), and a bigger runner buys nothing. Lower the peak concurrency, not the total:

- Order the groups into phases: wait on group 1's PIDs, then launch group 2.
- Leave the concurrency inside each group untouched.
- Feed both groups' exit codes into one failure counter, so a red in either group still reds the step.

### turbo `//` over-triggers `web_affected` on docs-only diffs (turbo monorepos)

Capture turbo stdout and stderr separately. Merging them with `2>&1` puts the banner in the JSON, so jq falls back to `[]` and the lane ghost-greens. On an error, a missing base, or non-JSON output, set `web_affected=true`.

The `bkit-tests-scope` affected graph (monorepo) forces `web_affected=true` on a real global dependency change. Turbo attributes any changed root-level path outside a workspace or an undeclared `globalDependency` (`docs/**`, `README`, `LICENSE`, …) to the root `//` (`FileChanged`). A fallback that keys on any `//` `FileChanged` cannot tell a global-dep bump from a docs-only diff, so it over-triggers: e2e is scheduled, the ignore command cancels the docs-only preview, and `Await Deployment` reds e2e on every docs-only push.

Fix it at the source: force on a global dep only when a real global dep changed.

- Intersect the changed root files with `turbo.json` `globalDependencies` / `globalEnv` (plus the root lockfile and `package.json`), and force `web_affected` only on a match.
- Turbo-pinned `//` paths (docs, metadata, root dirs that trigger nothing) must not force it.
- A narrow `docs/**`-only guard is the same idea, but incomplete, because a `README`-only diff still over-triggers. Prefer the `globalDependencies` intersection.

The fix goes in the consumer's `bkit-ci.yml` (adopted template, `bkit-stub:affected-graph`). Port it to each monorepo. It is separate from `[force full]`, which deliberately bypasses `web_affected`.

### Promotion-lag warning (`Check Default Branch Lags Dev`)

CI on `dev` proves the code is good, but nothing checks that the good code reached the default branch. The gap matters, because some surfaces read live from the default branch, not from `dev` or the validated tip:

- **Renovate** resolves its config only from the default branch (see § Dependency updaters). A `renovate.json5` edit on `dev` is inert until promoted. `useBaseBranchConfig: "merge"` softens this for the config file, but that setting is itself read from the default branch.
- **Scheduled / default-branch-triggered Actions** run the default-branch copy of each workflow, so a `.github/workflows/` fix on `dev` does not take effect on those runs until promoted.
- **The published package / production deploy** are cut from the default branch, so unpromoted `dev` work is invisible to consumers.

`Check Default Branch Lags Dev` (`bkit-tests-static` lane) closes this blind spot. On every `dev` push it diffs `renovate.json5`, `renovate.json` and `.github/workflows/**` against the default branch. **If** they are stale → it writes a `::warning::` and a `$GITHUB_STEP_SUMMARY` note. It is a non-blocking nudge, and it checks only the surfaces that are consumed from the default branch. To clear it, open a `dev` → default-branch PR.

It ships in the `bkit-ci.yml` template as the `Check Default Branch Lags Dev` step, and `bkit upgrade` lists `bkit-ci.yml` when it changes. It is safe even without default-branch-behind-`dev` gating: it runs on `dev` pushes only, and skips itself when the default branch is `dev` or unset.

### One CI run per dev commit (release PR mirrors the `dev` push run)

This is optional. A same-repo promotion PR into the default branch (head `dev`, or a `release/*` branch cut at the `dev` tip) has the same head that the `dev` push run already tests, so a full PR run repeats the slowest run in the repo. Mirror mode runs it once.

- **Planner** (`Decide Release Mirror`, `bkit-tests-scope`): **if** the event is `pull_request` **and** head repo == this repo **and** base == default branch **and** `head_ref` is a promotion branch (`dev`, or `release/*`) → `mirror_push_run=true`, `run_level=none`, `run_e2e` / `run_live` / `run_migration` / `web_affected=false`. Every lane skips. The field is required in the plan (`false` otherwise). Fork PRs and every other head / base pair keep the normal plan.
- **Capstone** (`Mirror Push Run`, `bkit-tests-check`, before `Assert Test Plan Followed`): `bkit runs mirror --head <PR head sha> --branch dev --max-minutes 170`. It waits for the `dev` push run at that SHA (each poll is `bkit runs gate --event push`), and passes only when that run's capstone passed. The step runs bkit, so the job needs a checkout and installed dependencies, both ungated. Neither step sets `continue-on-error`.
- **Never skip the PR's required check instead.** A skipped required check can read as passed on the PR while the push run is red.
- **`release/*` resolves the push run by SHA.** A `release/*` head with no green `dev` push run (extra commits past the `dev` tip) fails the mirror red (exit `3`). That failure is safe, not silent.

<!-- prettier-ignore -->
| Push run at PR head | PR `bkit-tests-check` | `bkit runs mirror` exit |
| --- | --- | --- |
| Capstone `success` | Green | `0` |
| In progress | Waits (`--max-minutes 170`, job `timeout-minutes` 180 in this mode only) | `4` at the limit |
| Failed / cancelled / capstone absent or skipped | Red | `1` |
| None within 10 min (`[skip ci]` at the `dev` tip dispatches none) | Red — push a commit without it to `dev`, re-run the check | `3` |
| GitHub API error 3x in a row | Red | `20` |

**Preconditions.** Mirroring copies whatever the push run validated, so these must hold:

1. **A `dev` push resolves `run_level=full`.** Drop the merged-PR → `partial` arm from `Decide Run Level`. A `partial` push run skips E2E, and the release PR inherits that.
2. **A push run diffs against the last green push run's head**, not `github.event.before`. Otherwise a red run N followed by an unrelated commit N+1 plans a green N+1 that never re-tests what N broke, and the mirror copies that green.
3. **Promotion hangs off the push to `{{DEFAULT_BRANCH}}`** (`bkit-tests-deploy`; § Promote before the lanes), never off the PR check. The mirror is the merge gate, and the default-branch push run is the release gate.

**Operating it:**

- **If** you open the release PR after `dev` is green → the check passes within a minute.
- **If** you open it earlier → the check waits for the push run.
- A red push run that is re-run to green does not update the PR. Re-run the PR's `bkit-tests-check` afterwards.
- A new `dev` push moves the PR head. `pull_request` concurrency cancels the old mirror and starts one for the new SHA.
- The release PR gives up PR-only output (coverage comments, PR-only coverage measurement). None of it blocks a merge.
- Feature → `dev` PRs are unaffected. `pull_request => run_level=full` (§ Consumer CI contract) still holds there, and `/bkit-ship`'s gate relies on that.

## Workflow-file limits GitHub does not enforce visibly

**The 21,000-character expression cap.** GitHub compiles every block scalar containing a `${{ … }}` expression as one expression and refuses to compile the workflow past 21,000 characters:

```
failed to parse workflow: (Line: 2112, Col: 14): Exceeded max expression length 21000
```

The cap is undocumented and invisible to the toolchain, because the file stays valid YAML, passes `actionlint`, and passes GitHub's own `@actions/workflow-parser`. GitHub refuses to compile it, almost silently. `pull_request` runs are never created, so the PR sits with no checks and no API error. A push to a branch that the `on:` filters exclude mints a zero-job run named after the file path. A step already close to the 21,000 cap crosses it with a few kilobytes of added prose, and CI then stops running on that branch with nothing to read.

- **A comment inside a `run: |` body is part of the expression.** A `#` comment above the step is free. Keep that comment to the rule plus a pointer at this section. The essay stays here. Pasting it into `run:` is what trips the cap.
- **Guard below the cap, not at it.** 20,999 leaves the next edit no room, and it fails unreadably. In the static lane, scan `.github/workflows/*.{yml,yaml}`, measure every block scalar containing `${{`, and fail with a margin (for example, at 20,000).
- **A long `run:` body is the symptom.** The fix is rarely compression. Move the logic into a script the step calls (`node scripts/ci/…`), which also makes it unit-testable.

## Post-merge dev CI auto-routing

`bkit-cloud.yml`'s `workflow_run` trigger fires when CI completes on `feat/**` and `dev`, never on `main`. The per-branch success / failure matrix lives in `.bkit/cloud.md` § Branch-aware routing. The post-merge surfaces add the following on top of it:

- **Trigger scope.** Dispatch jobs gate on `workflow_run.head_repository` being this repo, so a fork PR's CI completion never boots one. On `dev`, the same gate excludes `conclusion == 'success'` outright, so a green post-merge run costs zero runner minutes. The merge already happened, so that run only confirms the regression check passed.
- **FID recovery on `dev`.** No open PR exists, so `{FID}` comes from the squash-merge commit scope (`feat({FID}): …`) first. The fallback is the `bkit:fid` marker in the body of the merged same-repo PR for that SHA. **If** neither resolves → it does nothing and dispatches nothing.
- **Loop bound.** A `dev` CI failure dispatches `/bkit-debug` until the `{FID}` has `bkit.workflows.debug.fix.maxAttempts` + `bkit.workflows.debug.soak.maxAttempts` distinct failed CI SHAs (2 + 2 by default). `/bkit-debug` creates no branch of its own, so on this surface it remediates on `dev` itself, and its push re-triggers this same router. The cap is what ends that loop. `feat/**` is not capped here. `/bkit-debug` bounds it with the same two limits, counted across every debug run of the feature.

**Auto-route contract:** whenever the issue carries `bkit:auto`, `/bkit-ship` adds the `bkit [auto route]` free-tier gate marker to the squash-merge `--subject` (not just the sync-merge commit). That marker is what lets `dev`-triggered runs through the existing `bkit-cloud.yml` gate, and there is no second gate path. The `[skip ci]` ship-DONE close commit that follows the squash merge never carries the marker and never triggers CI, so it cannot interact with this trigger. The trust surface, the kill switch and the cap's tamper caveat are in `docs/security.md` § CI Auto-Route Trust.

**Docs-only-diff precondition:** the `dev`-trigger path routes every post-merge CI failure to `/bkit-debug`. That is correct for docs-only diffs only when the consumer's `bkit-ci.yml` deploy-await step treats a host-cancelled build as a skip, not a red (skip e2e and stay green; for example, Vercel `CANCELED`). **If** a consumer reds on a host-cancelled build → every docs-only squash-merge to `dev` falsely dispatches `/bkit-debug` and burns loop-cap budget. Verify this for each consumer before you rely on the `dev` trigger.

**Consumer-repo acceptance note:** the full happy-path loop (squash-merge → post-merge CI → `workflow_run` → `/bkit-debug` dispatch → fix PR → re-merge) can only be exercised on consumer repos that have `bkit-cloud.yml` installed and its dispatch secrets wired (see the cloud-agent auth surfaces in `docs/security.md`). A consumer without `bkit-cloud.yml` installed, or without CI running on `push: branches: [dev]`, never emits the `workflow_run` event this trigger depends on. The feature then becomes a silent no-op, not a failure.

## Ship gate + bookkeeping

`/bkit-ship` is keyed on `bkit branches sync --head=<PR head>`, which reports whether `origin/dev` is an ancestor of the PR head (`basePath`).

- **Path A** (`dev` has not moved) resumes read-only: no rebase, no bookkeeping commits, no push. Then it merges.
- **Path B** (`dev` moved) integrates, then re-validates when the head moved. It integrates in one of two ways:
  - B1: `bkit prs update-branch --only-if-required`, which refreshes the head only when `dev` requires status checks.
  - B2: a worktree + `@bkit-ship-conflict-resolve` + `bkit branches push --mode=feature`, which is a `--force-with-lease` push.
- A B1 head left unchanged merges at the head CI passed at, and the `dev` push run tests the merged result.

Both paths end at the same gate: `bkit runs gate --head=<current>` exits 0 (capstone concluded `success`) at the current PR head.

### Consumer CI contract — `pull_request` resolves to `run_level=full`

The merge gate (`bkit runs gate`) asserts the capstone job's `conclusion=success` at the head being merged. That assertion only means something while `pull_request => run_level=full` holds: the capstone is green because every expected tier ran and passed, not because the lanes were skipped (see `## Run-level decision matrix` above). A consumer that narrows CI on `pull_request` has, by doing so, opted out of the merge-gate guarantee:

- **`paths-ignore` / `paths` filters** that skip `pull_request` on some changes mean the capstone may not run at all. With no workflow run at the head, the gate refuses with code 10.
- **A docs-only short-circuit** in the host's build-cancel (Vercel `ignoreCommand` / Netlify) that cancels the run mid-flight means the capstone may land `cancelled` (gate code 15) or never complete (code 11).
- **A `[skip ci]` token** in a feature-branch commit subject when the PR opens makes GitHub suppress the `pull_request` run entirely. The PR's `statusCheckRollup` is then vacuously empty, so there is no run at the head (gate code 10).

`bkit runs gate` covers the common violation shapes. It reports a skipped non-capstone lane but does not refuse it, because the judgement of planned versus vacuous belongs to the capstone, which takes every lane result as an input and already asserts it per lane. The gate cannot make that judgement itself, because the jobs API reports no reason for a skip: a job skipped by a job-level `if:` never reaches a runner, so it carries an empty `steps` array.

**Code 16 is opt-in, and must stay that way.** It fires only for lanes named in `bkit.testing.shipGate` (a package.json array), and the default empty list never refuses. A blanket refuse-on-any-skip can never be satisfied with the CI shape bkit ships. A lane whose `if:` is event-scoped cannot run pre-merge at any head: `bkit-tests-live-web` runs on a push to `dev` or the default branch only. A pre-merge gate that demands such a lane refuses every PR forever. Device lanes (`-ios` / `-android`) use the same rule on a pull request and a push, so do not treat them as post-merge canaries. Name a lane in `shipGateRequiredLanes` only when your capstone does not assert it and the lane genuinely can run pre-merge. `BKIT_SHIP_GATE_OVERRIDE` remains the audited per-head escape hatch.

Codes 10-15 still carry the guarantee that a green result is not vacuous: a run exists, at this head, completed, not cancelled, with the capstone present and green. Code 14 (green at a superseded head) requires `--branch`. The head-keyed run query is filtered server-side, so a moved head returns the same empty list as a head that never ran, and only a second branch-scoped query separates them.

A run that is present and degraded but not skipped (for example, a required lane ran a reduced test set because of a consumer config the gate cannot see) is a residual risk. It is named here, and not claimed as covered. The capstone is green because bkit's own `run_level` planner computed `full`, and a consumer narrowing inside a lane bkit does not own is invisible to the gate. Keep the capstone (`bkit-tests-check`) as the sole branch-protection required check, so `green == validated` survives a docs-only push. Do not add per-lane required checks, because a hollow lane then green-bars the capstone.

**No duplicate dispatch on an already-triggered head (ship Step 9):** a branch push or `gh pr update-branch` fires `pull_request` at the new SHA on its own. The scaffold keys a pull request on `pr-{number}` and a `workflow_dispatch` on `github.ref`. The two are separate groups, so a redundant dispatch is never cancelled and burns a full duplicate run. Ship probes the head whose CI the gate will check (`VALIDATED_HEAD`) with `bkit runs wait --head=<VALIDATED_HEAD> --branch=<branch> --until=present --dispatch-if-absent`, which dispatches only when no run appears. The probe is not a pass condition. The completion wait (`bkit runs wait --head=<VALIDATED_HEAD> --until=completed`) reads only runs at that exact head, so a completed run from a superseded head never answers it. Gate codes 10 / 11 / 14 / 17 re-enter that probe-and-poll only, never the deferred sweep. `bkit.workflows.ship.merge.maxAttempts` bounds the retries, and it counts gate refusals and failed merges together.

**No CI run for ship's own docs commit (validated-head carry-forward):** ship's pre-merge `[skip ci]` bookkeeping commit (docs, summaries, ledgers, skill removals) runs no CI.

- **If** every path between the last CI-tested commit and the PR head is on the bookkeeping allow-list (`bkit ledgers only-bookkeeping`) → `bkit runs gate --validated=<sha>` checks CI at the tested commit.
- **Else** → the gate refuses with code 17.

The merge still pins the exact head (`--match-head-commit`). A green PR costs zero extra runs. The bookkeeping commit merges untested, and post-merge `dev` CI (the `ship-merge-ci` row) is the backstop. **If** `dev` requires status checks (classic branch protection or a ruleset) → GitHub refuses a head with no run, so ship runs CI at the PR head.

### Consumer rollback path

To unwind a bad ship surface (the gate command, managed config, or a rewritten `bkit-ship.md`) without downgrading unrelated fixes:

1. **Pin the previous `@cbartens/bkit`** in `package.json`. The sliding `@v{N}` tag receives patches automatically, so a regression lands through the tag. Pin to the last known-good immutable `v{N}.x.y` or `@<sha>` (see § Sliding major-version tag). Re-install, and confirm that `bkit check` reports no drift.
2. **Hold `bkit upgrade` for `.bkit/core/workflows/bkit-ship.md`** until the regression is fixed upstream. The gate (`bkit runs gate`) and ship's waits ship inside the `@cbartens/bkit` package (`dist/`), not as files in your repo, so the version pin in step 1 is what rolls them back. Other bkit upgrades are independent.
3. **Audit any `BKIT_SHIP_GATE_OVERRIDE` rows** written in the meantime in `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`. Each `type:"ship-gate-override"` row is a sanctioned escape that turned a refusal into a merge. Treat every row as a PR whose capstone was not green at the merged head, and re-verify it against the pinned-good gate (`bkit runs gate --head=<sha>`). `[bkit-runs] override honoured for head …` is the matching `docs/observability.md` grep key.
4. **No per-workflow pin or revert exists.** The package pin plus the selective `bkit upgrade` hold is the recovery path. Document any incident in `docs/failures.jsonl`.

Ship's docs sync, summaries, `SHIPPED` roadmap row and skill removals ride the PR as one `[skip ci]` commit on the feature branch before the merge. That is the only pre-merge push besides conflict-resolve. Status rows (`status.jsonl`) go to the feature worktree's tree on every runtime (`BOOK_ROOT` = `{WORKTREE_PATH}`), and ship never checks out `dev`. See `.bkit/workflows.md` § `status.jsonl` — workflow state SoT. The post-merge tail is one `[skip ci]` close commit, built in a throwaway checkout of `origin/dev`, that carries the book:

- Ship pushes it to `dev`.
- **If** `dev` moved → ship rebuilds the commit and pushes again.
- **If** the push is refused → ship opens a `ship-close/{FID}` PR.

## Smoke trigger plumbing

Smoke runs after the deploy, in its own workflow, off the merge gate (what it actually probes is in `testing.md` § Smoke). When `bkit-tests-deploy` promotes inside CI, that probe is `bkit-health.yml` (`.bkit/templates.md` § Health check): one workflow, not a second smoke file. Pick the trigger by where the deploy happens, not by habit:

- **If** the deploy happens inside CI → key smoke to `workflow_run` (the CI workflow `completed`, any conclusion), and probe only when production serves that run's commit. The deploy promotes before the tenant lanes, so a red run can still have put a release live. Fail, rather than skip, when production's commit cannot be read. Mind the 3-level `workflow_run` chain cap, because a fourth chained workflow will not fire.
- **If** an external platform deploys after the merge (Vercel / Netlify-style Git integration) → key smoke to a post-deploy signal: `deployment_status` (`state == 'success'`) or the platform's `repository_dispatch` event. Smoke then fires when the deploy is actually live, not merely when CI finished. `workflow_run` in this case smokes a deployment that is not serving yet, or is about to be replaced.
- Either way, make smoke a separate, non-blocking workflow (never a required check), and wait for the target to be serving before probing, because ready != serving (`testing.md` § Deploy-reachability).
- Do not wire smoke into branch protection, because it gates observability, not merges.
- Do not key smoke to `workflow_run` for an externally deployed app, because it then probes the old build.

## Applying migrations at deploy time

The deploy-time apply and the test-time replay gate are different guarantees. Keep both, preferably in the same always-on lane (`bkit-tests-migration`):

- **Apply (deploy path):** push only the new migrations onto the already-migrated remote. The apply is idempotent: it applies what is not yet in the ledger, so it is safe to retry. It never replays from empty and never runs the seed.
  - Its home is `bkit-tests-migration` on every push to `dev`/`main` (a remote apply of the new migrations, for example `supabase db push --linked --include-all`).
  - Do not put it inside `bkit-tests-e2e-web`. Leaving it in e2e while live runs in parallel is the schema-cache race.
  - It is not gated by `run_migration`, so it repairs a remote that was left behind.
  - It runs after the replay steps, so a from-empty failure never reaches the shared remote.
- **Replay (test path):** the fresh-DB gate proves from-empty replay and seed load (`testing.md` § Migration-replay + seed). Passing one is not passing the other.
- **Immutability:** once a migration is merged, never edit it. Ship a new corrective migration instead. Flag any change to an already-merged migration file in review.
- **Multiple chains:** apply every migration system (for example, a SQL chain and an ORM / CMS chain), each one idempotent and retried on its own.
- **Transient-pooler hardening:** remote applies over a connection pooler can blip (for example, an IPv4 session pooler's `i/o timeout`). Wrap the link and the apply in a bounded retry, because idempotency makes a re-attempt after a mid-apply drop safe.
- The order of the apply and the deploy's build is a separate hazard (§ Build-vs-migration race).
- Do not assume the deploy-time apply also validates a clean from-scratch install or the seed, because it does neither.
- Do not put the remote push inside e2e while live is not gated on e2e.

## Build-vs-migration race

When your host auto-deploys on push (Vercel / Netlify Git integration) while CI applies migrations as a separate, unordered step, the deploy's build and the migration race. A build-time DB read that lands before the migration creates its object makes the first deploy that ships it fail with a hard error. Build-time reads come from any statically rendered or build-generated route. Examples in Next.js: `sitemap.ts` / `robots.ts`, `generateStaticParams` / `generateMetadata`, an OG-image route, a static (non-dynamic) page's server read, or marking a DB route `force-static` / ISR. The missing-object error signatures in Postgres, for example, are `42P01` (relation), `42703` (column), `42704` (type) and `3F000` (schema).

**Fingerprint:** prod keeps serving the prior deployment, and a redeploy of the same SHA clears the error. A genuinely bad migration would not clear itself on a redeploy.

**Fix, strongest first:**

1. **Serialise migrate → deploy.** Disable host auto-deploy for the production branch, and keep preview auto-deploys. Have CI trigger the prod deploy after the migration step succeeds. The schema then always exists before the build.
2. **Belt-and-braces.** Narrowly catch those missing-object codes in build-time queries, and return empty so the route repairs itself on the first request (for example, Next.js `dynamicParams` / ISR). Keep request-time reads strict, because a missing object at request time is a real incident, not a race.

The race stays hidden until the first build-time DB read lands, so flag it in review when one is added. `bkit-tests-migration` proves that migrations replay from empty, and on push it owns the remote apply. It still does nothing for the order of build and deploy on the host, because this race is separate from that gate. Serialise migrate → deploy at the host.

## Promote before the lanes (`bkit-tests-deploy`)

With `bkit-tests-deploy` adopted, the host does not auto-build the default branch. `bkit-tests-build-web` creates this SHA's deployment, polls it until it is ready, and publishes `deployment_url` + `deployment_id`. The production alias still serves the previous release. `bkit-tests-deploy` `needs: [bkit-tests-migration, bkit-tests-build-web]`, runs on a push to the default branch only, and is not a required check. It promotes the exact `deployment_id` the build lane published, without looking the deployment up again by SHA. A `409` counts as success only when the body says this id is already current production. On `{{DEFAULT_BRANCH}}` it runs before the E2E / `@live` lanes. Each of those lanes `needs:` it and starts by proving, by deployment id, that production serves this run's build. A re-run after a rollback therefore refuses, instead of testing the old build and going green. A red deploy job means the release did not happen, and production still serves the previous deployment.

Before it promotes, the job refuses and moves nothing in either of these cases:

- The deployment id equals the repo variable `ROLLED_BACK_DEPLOYMENT_ID` (§ Production rollback runbook step 2).
- This commit is neither the commit production serves nor a descendant of it (for example, GitHub's compare API `<production-sha>...<this-sha>` returns a status other than `ahead` / `identical`).

A re-run of an old run then cannot move production back to an older release.

- **If** production is unreadable, or its deployment records no commit → refuse.
- **If** it is the same commit → promote, because the re-run is idempotent.

Two guards keep a release honest. The deploy job carries its own `concurrency:` group (`cancel-in-progress: false`), so two releases never overlap. The workflow-level block queues on `{{DEFAULT_BRANCH}}` (§ One run per branch or pull request), so a newer push waits instead of cancelling a switch in flight. `bkit-tests-migration` waits for static / unit / integration / `build-web` before it touches production's database.

Do not add a host-side "hold promotion until a named check passes" setting (for example, Vercel Deployment Checks). That list stays empty, because this job is the promotion. On Vercel, for example, `git.deploymentEnabled` is false for the default branch, and auto-assign of production domains is off.

The capstone `needs:` `bkit-tests-deploy`, so on a default-branch push a skipped or failed deploy reds it. Health (optional, `.github/workflows/bkit-health.yml`) runs on `workflow_run` after every finished CI run on the default branch, and probes production when it serves that run's commit. Not a required check.

## Disable GitHub Code Quality billing

GitHub Code Quality (coverage-on-PR plus the `Code Quality: CodeQL` runs) bills per active committer, plus Actions minutes, plus AI credits. It is opt-out: a repo with default setup enabled is billed silently until it is turned off.

- **If** your repo has Code Quality default setup enabled → either disable it in repo → **Settings → Code security → Code Quality** (turn off default setup), or accept the per-committer charge.
- **The bkit coverage stub replaces the coverage-on-PR value only.** `bkit-stub:coverage` gives a free, in-Actions coverage comment with no third-party service (the shipped stub targets Vitest; `testing.md` § Coverage on PRs). It does not replace CodeQL security scanning. If you rely on that scanning, keep it or re-enable it separately, because it is a distinct product and a distinct decision.

## GitHub Actions pinning

**Pin every third-party dependency to an immutable digest, and pair each pin with an updater.** A floating ref (a `@v{N}` tag, a `ubuntu:26.04` image, an unversioned `curl … | bash`) is mutable, because a compromised maintainer can re-point it, on their next push, to malicious code that runs with your runner token. It is one exposure class across three surfaces:

- **Actions:** pin every `uses:` to a 40-character commit SHA, never `@v{N}`. Resolve it with `git ls-remote https://github.com/<owner>/<repo>.git 'refs/tags/vX.Y.Z'`, and append a `# vX.Y.Z` comment so the version stays human-readable:

  ```yaml
  - uses: actions/checkout@a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e # v4.2.1
  ```

- **Container images:** pin `FROM` to a `sha256:` digest, and keep the tag inline so an updater can still track it (`FROM ubuntu:26.04@sha256:…`). Do not use a bare `ubuntu:26.04`, or a digest with the tag in a trailing comment. Resolve the digest with `docker pull <image>:<tag>`, which prints `Digest:`.
- **Downloaded installers / binaries:** a `curl … | bash` or a release-tarball fetch must either pin its source to an immutable ref (a commit SHA in a `raw.githubusercontent.com` URL, not a mutable git tag) or verify a pinned `sha256sum` before it executes or extracts anything. Also pin the tool version explicitly instead of resolving "latest".

This matters most in elevated-permission workflows (`packages: write`, `id-token: write`, `contents: write`, or deploy credentials), because a re-pointed ref there runs with those credentials. The practice still applies to all third-party refs, not only elevated ones.

### Dependency updaters

**Pair with an updater.** A pin that nothing bumps stays on a vulnerable digest. All templates are listed in `.bkit/templates.md`. Copy one updater example and own it:

<!-- prettier-ignore -->
| Updater | Copy | When |
| --- | --- | --- |
| Renovate (rules) | `.bkit/templates/.github/renovate.json5` → `.github/renovate.json5` | Default. Grouped PRs, lockfile maintenance, `osvVulnerabilityAlerts`. |
| Renovate (self-hosted runner) | `.bkit/templates/.github/workflows/bkit-renovate.yml` → `.github/workflows/bkit-renovate.yml` | Mend's 3 GB runner OOMs (`kernel-out-of-memory`) on a large pnpm graph. `ubuntu-latest` is ~16 GB. Edit `runs-on` in the copy. |
| Dependabot | `.bkit/templates/.github/dependabot.yml` → `.github/dependabot.yml` | First-party GitHub. No App. One PR per package. No lockfile-maintenance job. |

Use one, because both open PRs for the same packages. Record your choice in `bkit.dependencies.updater`: `"renovate"`, `"dependabot"`, or `"none"` to run no updater. `bkit install` / `bkit upgrade` fill an empty value from the one config present. `bkit check` blocks when the value and the configs disagree: a config the value does not name (`dep-updater-unset`, `dep-updater-mismatch`), or a named updater with no config (`dep-updater-mismatch`). Renovate config is found at every location Renovate reads (`renovate.json*`, `.github/` and `.gitlab/` `renovate.json*`, `.renovaterc*`, a `package.json` `renovate` block). Dependabot config is found at `.github/dependabot.yml` / `.yaml`.

**Gate on known advisories.** Updater PRs never fail CI on a vulnerable version that is already in the lockfile. Copy `.bkit/templates/scripts/ci/bkit-check-dependency-audit.mjs`, its `.test.mjs` and `bkit-accepted-advisories.json` → `scripts/ci/`. The `Check Dependency Audit` step (`bkit-tests-static`) skips itself until then. The `.husky/pre-push` template runs the same gate above the gates, so a known advisory fails at the push instead of in a remote run. The gate runs `pnpm audit --json`, and fails on a blocking advisory (default high / critical) that has no acceptance:

<!-- prettier-ignore -->
| Fails on | Fix |
| --- | --- |
| Blocking advisory, no row | Upgrade: `pnpm update -r <pkg>` moves a transitive within its declared range. When there is no patched release, or a parent pins it, add a row |
| Row past its `expires` day | Upgrade, or re-review and renew |
| `expires` further out than the severity's `blocking` days (default critical 7, high 30) | Shorten it |
| Row whose advisory the audit no longer reports | Delete the row |
| Row without `advisory`, `reason` or a `YYYY-MM-DD` `expires`, or listed twice | Fix the row |
| Audit prints no report after 3 tries, or the registry is unreachable | Fails closed; rerun. A refused or unresolved registry fails in under a second — `--unreachable=warn` relaxes only that case |

`blocking` maps each severity to the maximum days an acceptance may last. It is the repo's fix-time policy, and it is held only there. Do not use `auditConfig.ignoreGhsas`, because it ignores forever and records no reason. When a new advisory reds an unrelated push, upgrade or accept it in the next push. In a non-pnpm repo, adapt `blockingFindings()`, or let the Trivy scan own the lockfile.

**Scan beyond the pnpm lockfile.** `.bkit/templates/.github/workflows/bkit-trivy.yml` → `.github/workflows/bkit-trivy.yml` fails on HIGH / CRITICAL findings in any lockfile, in Dockerfile / IaC settings and in committed secrets. It runs on push, on pull request and daily. With `bkit-check-dependency-audit.mjs` adopted, it skips `pnpm-lock.yaml`, so each pnpm advisory is accepted in one file only. Acceptances, pinning and traps are in `.bkit/templates.md` § Trivy.

**Hands off bkit-owned trees.** In Renovate, ignore `.bkit/templates/**` and `.agents/skills/**`. bkit rewrites them, so scanning them is noise. A packageRule `enabled: false` does not stop the scan, and `pinDigests` still rewrites the file, so use `ignorePaths`. Workflows you copied from `.bkit/templates/` (`bkit-ci.yml`, `bkit-cloud.yml`, `bkit-renovate.yml`, `bkit-trivy.yml`) are yours. Leave them out of that list so their pins refresh.

**Renovate example settings.** The example extends `config:best-practices`: `config:recommended` plus Docker and GitHub Actions digest pinning, exact devDependency pins, config-migration PRs, and an abandoned-packages section on the dashboard. That preset gates npm packages at 3 days, and the example's first `packageRules` entry restores `7 days`. Other settings:

<!-- prettier-ignore -->
| Setting | Effect |
| --- | --- |
| `rebaseWhen: "conflicted"` | A PR is rebased only when it conflicts; the default re-runs CI on every auto-merge PR each time the base branch moves. |
| `schedule` | Every hour of Monday (UTC). A scheduled GitHub run can start hours after its cron time, so a window of a few hours misses the daily wake. |
| `lockFileMaintenance.schedule` | Every hour of the first day of the month (UTC), for the same reason. |
| Majors rule `dependencyDashboardApproval: true` | No branch, PR or CI run until you tick the update on the Dependency Dashboard issue. |
| `ignorePaths` | Replaces the `:ignoreModulesAndTests` default, so the example repeats its entries (`node_modules`, `bower_components`, `vendor`, `examples`, `__tests__`, `test`, `tests`, `__fixtures__`) and adds `docs/plans/**` plus the bkit-owned trees. |
| Non-major group `matchDepTypes` | `devDependencies` and `packageManager`: a pnpm bump joins the group instead of opening alone. |
| `customManagers` | One regex manager for pins that sit in no package file (below). |
| `custom.regex` group rules | Every pin that manager finds opens in one reviewed `pinned tools` PR; the Dockerfile `PNPM_VERSION` joins the non-major group with `packageManager`. |

**Pins outside package files.** The `customManagers` entry scans `Dockerfile`, `.claude/bkit-cloud.md` and `.github/workflows/*.yml` for a comment line directly above the pin: `# renovate: datasource=<datasource> depName=<name>` (optional `packageName=`, `versioning=`, `extractVersion=`). The next line is read as `[ARG|export] <NAME>_VERSION=<v>` or `<NAME>_VERSION: "<v>"`, `<NAME>_SPEC: "<pkg>==<v>"`, `npm install -g <pkg>@<v>`, or `bash "<installer>" <v>`. Renovate bumps the version only. A pin paired with a checksum (Vale, gh, jq, Node, actionlint) needs its sha256 updated by hand in the same PR, or the install fails closed. The `Check Pinned Checksums` step in `bkit-ci.yml` (`bkit ci pins --file=<path>`) downloads every `*_VERSION` + `*_SHA256` pair in `.cursor/Dockerfile` and fails the PR, naming the tool, until they agree. A pin in a workflow fails in its own install step.

**One source per tool.** When a version already lives in a file (an exact pin in a package manifest, or a build service's CLI pin such as `eas.json` `cli.version`), CI reads it from that file and never types it into the workflow: `npm i -g "turbo@$(node -p "require('./package.json').devDependencies.turbo")"`. A typed copy drifts, and Renovate bumps only one of the two. A tool with no such file gets one `<NAME>_VERSION` per workflow with the comment above, used by every call. A bare `npx <tool>` downloads the newest release on every run and skips the release-age wait, so pin it the same way.

**Land config on the default branch before the bot runs.** GitHub Apps and Dependabot read config from the default branch. The example sets `baseBranchPatterns: ["dev"]` (PRs land on `dev`) and `useBaseBranchConfig: "merge"` (edits on `dev` apply to dev-targeted runs). `useBaseBranchConfig` itself is read from the default branch, so it needs one merge there before dev-side edits take effect. The merge appends list options (`customManagers`, `packageRules`) to the default branch's instead of replacing them: each custom manager runs twice (the dashboard lists its files twice, the run logs "Cannot find replaceString" on the second pass), PRs still open once, and a rule deleted on `dev` keeps applying until the default branch drops it.

**Renovate, Mend.** Install the App at https://github.com/apps/renovate only after `renovate.json5` is on the default branch. No `gh api` equivalent. Within a few minutes the App opens an onboarding PR; merge it.

**Renovate, self-hosted.** Copy the workflow example; it pins `renovate-version` to an exact Renovate release. A `# renovate:` annotation on that line reads GitHub releases (dated, so `minimumReleaseAge` holds) and the example disables the native lookup of the same line, which uses ghcr.io image tags that carry no publish date and would hold every update as pending. Suspend the Mend App for this repo (Settings → Applications → Renovate → Configure → remove this repo) or both open `renovate/*` PRs. The cron wakes the bot daily; `renovate.json5` `schedule` still gates normal PRs. Do not narrow the cron to weekly, because `osvVulnerabilityAlerts` PRs need the daily wake.

Platform auth is a repo secret `BKIT_GH_TOKEN`, never `GITHUB_TOKEN`, because PRs opened with `GITHUB_TOKEN` do not trigger CI, so required checks and automerge never fire.

- **If** this repo is the only owner scope bkit touches → use a fine-grained PAT.
- **If** the same token must cover more than one owner → use a classic PAT, because fine-grained PATs cannot span organizations.

Fine-grained permissions for this repo:

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

`Commit statuses: Read and write` is what opens the PR. Without it Renovate creates the branch and 403s on commit status. A fine-grained PAT has no separate Checks permission. Classic equivalent: scopes `repo`, `workflow`, `security_events` (plus `user:email` for commit authorship). Org-owned tokens cannot read the owner email; set the Actions variable `RENOVATE_GIT_AUTHOR` (for example `Renovate Bot <renovate@your-domain>`).

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

Renovate's `osvVulnerabilityAlerts: true` opens CVE-driven PRs against `dev` immediately. If you also keep GitHub's Dependabot alerts on (Settings → Code security → Dependabot alerts), the Security tab keeps surfacing advisories. That is useful as a parallel signal, but not required. Handle each alert against `dev`:

1. Read the alert, and note `vulnerable_version_range` and `first_patched_version`. Trace the import chain with the package manager's why / explain command (for example, `pnpm why <pkg>`) to see whether it is direct or transitive, and whether it is in dev or prod scope.
2. **Direct dep:** bump it in the dependency manifest (for example, `package.json`), reinstall (for example, `pnpm install`), and run the deepest declared `bkit:gate:*` script (for example, `pnpm bkit:gate:static-unit`).
3. **Transitive dep:** bump the parent that pins it (for example, bump `vitest` to pull in a CVE-fixed `vite`).
   - **If** the parent itself cannot upgrade → override the transitive to a fixed version (for example, a `pnpm.overrides` entry; with Renovate, fence it, see **Fence a `pnpm.overrides` pin**), or add the transitive as a direct dev dependency (for example, in `devDependencies`) to force the resolution.
4. Open a PR against `dev` titled `fix(security): bump <pkg> >=<fixed-version> (CVE-XXXX-YYYY)`. After the merge to `dev → main`, the alert closes automatically once GitHub re-scans the default branch.
5. **If** a CVE has no impact on your usage pattern (for example, a dev-server-only vuln in a build tool that you never run as a server) → dismiss it in the GitHub UI with the "Vulnerable code is not actually used" reason and a one-line justification. Do not dismiss an alert without documenting why.

<!-- bkit:end -->
