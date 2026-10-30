<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Testing

> [!CAUTION]
> **Purpose:** The testing strategy: tier boundaries, framework choices, naming conventions and CI execution.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
> - Keep the tiers strictly separate: Static · Unit · Integration · E2E · @live · Smoke.
> - Pre-push runs one gate script, then `bkit check`:
>   - **If** `pnpm bkit:gate:static-unit-integration` is declared → pre-push runs it.
>   - **Else** → pre-push runs `pnpm bkit:gate:static-unit`.
> - On revert branches and revert commits, the `.husky/pre-push` template runs `bkit:gate:static`, which runs no tests.
> - Gate scripts are consumer-owned. bkit's default is typecheck + lint + format:check + prose + slop:delta + `pnpm test` (unit tier only).
> - Integration runs at pre-push once its gate is declared. Local services, such as a Docker database, are fine there.
> - E2E, @live and tests against a deployed service are excluded from pre-push. They run in CI (see below).
> - Never bypass the hooks with `--no-verify`.

## CI test tiers (the bkit scaffold)

CI runs the tiers through the bkit scaffold as one parallel lane (job) per tier, not as steps in one job. The step-by-step shape is in `.github/workflows/bkit-ci.yml` § "full CI scaffold reference", and the run-level shape is in `deployments.md` § Run-level decision matrix.

The graph is flat and wide for static / unit / build / integration: scope fans out, and the capstone joins. **One exception:** when `bkit-tests-migration` owns the shared-remote migration apply, e2e / live `needs:` that lane for ordering. Never gate live behind static / unit / build / e2e:

```
  bkit-tests-scope ─┬─ bkit-tests-static
    always-on        ├─ bkit-tests-unit
    never skips      ├─ bkit-tests-build-web ─────────────────────┐
    (~15s)           ├─ bkit-tests-integration                    │
                     ├─ bkit-tests-build-ios                      │
                     ├─ bkit-tests-build-android                  │
                     └─ bkit-tests-migration ─┬─→ bkit-tests-deploy (default-branch push only; promotes)
                                              │            │
                                              │            ▼
                                              └─→ bkit-tests-reset ─┬─→ bkit-tests-e2e-web
                                                    (lease)         ├─→ bkit-tests-live-web
                                                                    ├─→ bkit-tests-e2e-ios
                                                                    └─→ bkit-tests-e2e-android
                                          │
                                          ▼
                               bkit-tests-cleanup (always(); releases the lease)
                                          │
                                          ▼
                               bkit-tests-check (needs: scope + every lane you have, deploy included)

  static/unit/integration/build-*: needs:[bkit-tests-scope]; if: run_level != 'none'
  bkit-tests-migration:            needs:[bkit-tests-scope]; no job-level if (always-on)
  bkit-tests-deploy:               needs:[bkit-tests-migration, bkit-tests-build-web]; default-branch push only
  bkit-tests-reset:                needs:[scope, migration]; if: tenant_target != ''
  e2e-web / live-web / e2e-ios / e2e-android:
                                   needs:[scope, migration, deploy, reset, <build>];
                                   if: !cancelled() && scope==success && <own gate>
                                   && migration != 'failure' && deploy != 'failure'
                                   && reset != 'failure'
```

Adopt only lanes your repo has. Add a lane the moment its tier exists, because a tier with no lane is a tier nothing gates. The jobs above the reference in `bkit-ci.yml` are the starter: `bkit-tests-static` and `bkit-tests-unit`, joined by the `bkit-tests-check` capstone `/bkit-ship` merges on. Every lane you add joins the capstone's `needs:` and its assert. The reference is the target. A starter stub that still sits inside `bkit-tests-unit` is the pre-split shape.

Adopt in this order, and stop at the first tier this repo does not have. You write the step bodies. These files name the job, the `needs`, the `if`, and the rule.

1. Keep `bkit-tests-static` and `bkit-tests-unit`.
2. Add `bkit-tests-scope`. Every later `if:` reads `plan`, and the markers are parsed once. The push base is the last green run (`deployments.md` § One run).
3. Move integration out of unit into `bkit-tests-integration`.
4. Add `bkit-tests-build-web`. It compiles, or it creates this SHA's deployment and publishes `deployment_url` + `deployment_id`, leaving the deployment un-promoted on the default branch. Do not also enable `bkit-stub:vercel-await`.
5. Add `bkit-tests-migration` when you have migrations. The remote apply of new migrations (for example, `supabase db push --linked --include-all`) lives here, after the from-empty replay. On the default branch it waits for static / unit / integration / `build-web` before touching production's database. Immutability and slop-delta use the planner base on every event.
6. Add `bkit-tests-reset` / `-cleanup` only when two or more lanes share one long-lived resource. Otherwise provision fresh and drop both.
7. Add `bkit-tests-e2e-web`. It runs the full suite on a PR and on a push. A feature → `dev` PR hits a local stack. The target comes from `TEST_URL` only. A pass on retry is a failure.
8. Add device build and device E2E only for a platform you ship. Same rule on a PR, a push, and a dispatch. `bkit-tests-e2e-ios` needs `build-ios` and `build-web`. Android is the same, with its own build lane in place of `build-ios`.
9. Add `bkit-tests-live-web` for a push to `dev` or the default branch when `web_affected`. It never runs on a PR or on a dispatch. Do not `needs:` static, unit, integration, or e2e.
10. `bkit-tests-check` `needs:` every lane you kept. It is the sole required check, and its assert is a script (§ Validated means executed).
11. Run `bkit-tests-deploy` on a default-branch push, before the E2E / `@live` lanes. It promotes that exact `deployment_id`, and each tenant lane `needs:` it and refuses unless production serves this run's build. Not a required check (`deployments.md` § Promote before the lanes).
12. Health is `bkit-health.yml`, which runs as `workflow_run` after every finished CI run on the default branch. A logging probe is a step inside each runtime lane, not a job.

These files do not ship some scripts, so the plan names them and you write them: the marker parser, and lease acquire and release. The last-green push base and the capstone assert ship as templates (`.bkit/templates/scripts/ci/lanes/bkit-resolve-push-base.mjs`, copied to `scripts/ci/lanes/`; `.bkit/templates/scripts/ci/bkit-check-capstone.mjs`, copied to `scripts/ci/`).

- **`bkit-tests-scope`** (always-on) computes `run_level` (plus the optional `run_migration`) and emits the `bkit-test-plan` contract, which says what should run.
- **`bkit-tests-static` / `-unit` / `-integration` / `-e2e-web`:** one lane per tier, as separate parallel jobs.
  - A platform suffix (`-web` / `-ios` / `-android`) is required when that tier exists for more than one platform. `static` / `unit` / `integration` / `migration` stay bare.
  - Integration and web E2E gate on `web_affected` / `run_e2e`.
  - Each lane emits its executed count for the capstone, and each coverage tier posts its own coverage comment.
  - Start with `-static` + `-unit`, then add one lane for each tier (`deployments.md` § Parallel test lanes).
  - Do not put the remote migration apply in E2E, because it lives in `-migration`.
  - Web E2E on a feature → `dev` PR hits a local stack with this PR's migrations. Every other event hits the deployment.
  - The outcome rules (retries, traces, flake handling) are the same everywhere. A pass on retry is a failure. The target comes from `TEST_URL` alone. No spec is filtered by tag.
- **`bkit-tests-migration`** (optional; DB repos) is an always-on ordering and provisioning lane. It does two things:
  1. A fresh-DB replay and a seed assert, each step gated on the plan or the changed paths.
  2. On every push to `dev`/`main`, the remote apply of new migrations (for example, `supabase db push --linked --include-all`). This step is not gated by `run_migration`, so it self-heals a remote left behind.

  The lane has no job-level `if:`, because e2e / live `needs:` it, and a skip would cascade. The capstone asserts `success` whenever scope succeeded. See § Provision backing services fresh.

- **`bkit-tests-build-web`** compiles the web app, or acts as the host deployment gate (for example, on Vercel: create this SHA's deployment, publish `deployment_url` + `deployment_id`, and leave it un-promoted on the default branch). It emits no `*_ran`.
- **`bkit-tests-build-ios` / `-e2e-ios` / `bkit-tests-build-android` / `-e2e-android`** (optional) run the device build and the device flows. Same rule on a PR, a push, and a dispatch: these lanes are not a post-merge canary. `bkit-tests-e2e-ios` `needs:` scope, migration, reset, `bkit-tests-build-ios`, and `bkit-tests-build-web`. Android matches, with `bkit-tests-build-android`. A planned red reds the capstone. Drop any platform you do not ship. One example setup is a hosted build service plus a device-flow runner.
- **`bkit-tests-live-web`** runs `@live` against the deployed URL (`run_live`). Drop the job when there is no deploy. It runs on a push to `dev` or the default branch only, when `web_affected`, and never on a pull request or a dispatch. It `needs:` the planner, migration, reset and `bkit-tests-build-web`. Do not gate it behind static / unit / integration / e2e. A planned failure reds the capstone. `/bkit-ship` still filters a job named `bkit-tests-live`. This lane's name does not match it, so the capstone is the gate.
- **`bkit-tests-reset` / `bkit-tests-cleanup`** (optional; one shared long-lived resource): reset takes the lease and puts the resource in its known state before any lane uses it; cleanup runs last, `if: always()`, and releases the lease. Planner names at most one target. Empty target skips both. Capstone reds if a planned reset skipped or either job failed. Drop both when the resource is provisioned fresh per run (§ Provision backing services fresh — the preferred answer).
- **Logging probe** (an optional step, not a lane): inside each runtime lane, emit one marked event and ask the error tracker (for example, Sentry) whether it arrived. Skip when that lane did not run the probe.
- **`bkit-tests-deploy`** (optional) runs on a push to the default branch only, before the E2E / `@live` lanes. It promotes the exact `deployment_id` that `bkit-tests-build-web` published. Each tenant lane `needs:` it, and its first step proves (by deployment id) that production serves this run's build. The job carries its own `concurrency:` group (`cancel-in-progress: false`) and is not a required check. A red job means the previous deployment stays live.
- **Health** (optional, separate workflow) runs as `workflow_run` after every finished CI run on the default branch, green or red, because the deploy promotes before the tenant lanes. It probes only when production serves that run's commit. Not a required check. Copy `.bkit/templates/.github/workflows/bkit-health.yml` to `.github/workflows/bkit-health.yml` (`.bkit/templates.md` § Health check).
- **`bkit-tests-check`** (the capstone) `needs:` all lanes. It fails when any expected tier skipped or executed zero tests, so a green required check means the run was validated, not merely that nothing failed. It is the sole branch-protection required check.

### Accepted divergences

CI branches on the event in a few places. Each one is a deliberate, recorded divergence from "one script runs everywhere", not an accident. Every such site is registered, so a new one is caught.

**The guard.** A workflow step, or the workflow-level `concurrency:` block (keyed `file#(workflow)#concurrency#field`), that reads an event field (`github.event_name`, `github.ref`, `github.ref_name`, `github.base_ref`, `github.head_ref`, `github.event.head_commit.message`, `github.event.pull_request.title`) must be listed in the registry (`scripts/ci/bkit-accepted-divergences.json`) with its decision and reason. The guard (`scripts/ci/bkit-check-accepted-divergences.mjs`) reds on an unregistered site, on a registered site that no longer exists, and on a decision missing from the table below. A new comparison inside an already-registered step is a new site. The guard scans `.github/workflows/*.yml` only; scripts, hooks and tests that read `CI` / `GITHUB_*` are outside it.

<!-- prettier-ignore -->
| Decision | Rule |
| --- | --- |
| `one-run-per-branch` | Concurrency key is the PR number, else the ref; the default branch queues, every other event cancels the older run. |
| `diff-base` | A PR plans against its base. A push plans against the branch's last green run. |
| `pr-affected-only` | A PR runs lint, typecheck, format, unit, and integration for affected packages. A push runs everything. |
| `b1-local-e2e-on-pr` | A feature → `dev` PR's web E2E hits a local stack with this PR's migrations. Every other event hits the deployment. |
| `b3-live-push-only` | `@live` runs on `dev` / default-branch pushes and on dispatch only. |
| `b4-remote-db-push` | Only `dev` / default-branch pushes apply migrations to a shared remote database. A PR never does. |
| `main-basic-lanes-before-production-migration` | On a default-branch push, `bkit-tests-migration` waits for static / unit / integration / `build-web` before it pushes production's migrations. |
| `release-promotes-first` | On a default-branch push the release promotes production before the E2E / `@live` lanes run; each refuses unless production serves this run's build. |
| `promotion-lag` | A `dev` push notes when the default branch lags. It tests nothing. |
| `ci-fresh-stack` | The local integration runner resets its database. CI's volume is already empty. Both start from the same state. |
| `local-runner-stands-down` | The laptop E2E entrypoints are no-ops under `CI`. |
| `human-confirmation` | A laptop reset of a remote tenant needs an explicit yes. The CI run is the approval. |
| `revert-recovery` | A revert push skips the pre-push unit and integration tiers. CI still runs every tier. |
| `output-channel` | CI prints annotations and job summaries. A terminal prints lines. |
| `ci-strict-time-limits` | Unit time limits grow with a laptop's load, re-read as each test file starts so a mid-run ramp cannot starve late files. Under `CI` they stay fixed. |
| `playwright-outcomes` | Same retries, traces, and flake handling on every machine. A pass on retry is a failure. The target comes from `TEST_URL` alone. No spec is filtered by tag. |

### Which resources may each lane touch?

Every lane must declare what it may reach, and the lane's env enforces the declaration, not a comment. A lane that can reach a shared remote instance eventually will, and the result is cross-run interference, not a failure.

<!-- prettier-ignore -->
| Lane | Real external APIs | Stateful backing service (DB / cache / queue) | Deployed app |
| --- | --- | --- | --- |
| `bkit-tests-static` | none | none | none |
| `bkit-tests-unit` | none — **mocked** | none | none |
| `bkit-tests-build-web` | none | none | creates this SHA's deployment; does not promote it |
| `bkit-tests-build-ios` / `-android` | the build host (e.g. a device-build service) | none | none |
| `bkit-tests-integration` | none — **mocked** | **ephemeral, CI-local, fresh each run** | none |
| `bkit-tests-migration` | none | **ephemeral, replayed from empty** (plan- / path-gated) + **shared remote push** on every `dev`/`main` push | none |
| `bkit-tests-reset` / `-cleanup` | none | the **one** shared long-lived resource this run named | none |
| `bkit-tests-e2e-web` | none — **mocked** | ephemeral **local** (feature → `dev` PR) / the leased shared one (other events) | this SHA's deployment |
| `bkit-tests-e2e-ios` / `-android` | the device host | the leased shared resource | the deployed backend |
| `bkit-tests-live-web` | **real** | the deployed environment's **real** instance | **real** deployed URL |
| `bkit-tests-deploy` | the host API | none | promotes the deployment the tenant lanes then test |

Read the table as a rule. `bkit-tests-live-web` and the device E2E lanes are the only lanes that may spend real external quota. Only those lanes, plus push-side `-e2e-web`, may touch the shared long-lived resource, and only between reset and cleanup. Every other lane provisions its own (§ Provision backing services fresh).

> [!IMPORTANT]
> **"Real external API" and "real remote backing service" are two independent axes — never one flag.**
> This is the most expensive mistake in this doc. A single overloaded gate (`LIVE_API`, `TEST_REAL`, …) that means both "hit real third-party APIs" and "hit the real remote database" collapses unrelated needs. Suites that need only the real DB (no external API) then sit in the serial, push-only `@live` lane, where they are invisible on PRs and inflate the gating lane. Moving them to `-integration` (ephemeral local DB) shrinks `@live` and gives them PR coverage. Gate each axis on what it needs: an external-boundary test on an API credential, and a DB test on a DB URL. Prefer an ephemeral DB, which needs no gate.

**Moving a suite between lanes takes three edits, and the third is the one that bites.** Retag the file, move it to the new lane, and delete the old gate. A suite with `skipIf(!LIVE_API)` in a lane that does not set `LIVE_API` silently skips forever: the lane is green, the count looks plausible, and the coverage is gone (a hollow green through the back door, § Validated means executed). After a lane move, assert that the destination's executed count went up by the moved test count.

**A missing gate variable must give an honest, detectable skip, never a silent pass.** A tier that needs a URL or credential the run lacks must report itself skipped, not exit 0 having run nothing. **If** that tier was planned → it must also fail the capstone. Where it matters, add a per-file assert, for example (Vitest JSON) `numPassedTests >= 1 && numPendingTests === 0`. It catches both a ghost-green no-op and a quiet skip.

**A missing tool that a test needs (binary, CLI, interpreter) must fail loudly, never `return` early.** Resolve the tool through one shared test helper that throws when it is absent (for example, `requireTsx()`), with no per-file check. An early `return` is a pass that asserted nothing. A self-skip on an absent tool (`skipIf(!hasTool)`) must not skip on CI. Install the tool on that lane, or fail when `CI` is set. Otherwise the lane skips the same tests on every run and stays green.

### Validated means executed, not "didn't fail"

A green capstone means the planned tiers ran tests and passed, not merely that nothing visibly failed. Each tier is in one of three states, and each state is gated independently:

- **Absent:** no declared entrypoint (for example, a `test:integration` / `test:live` script, or an enabled E2E step). The capstone asserts nothing. A repo with no integration / E2E / `@live` tier is fully valid.
- **Declared + planned to run:** assert that the tier ran and executed > 0 tests. This closes the green-with-zero hole, where everything exits 0 and looks green: `--passWithNoTests` matching nothing, a `@live`-tagged suite whose owning package declares no live entrypoint (for example, no `test:live` script, so `turbo run test:live` runs nothing), or every test gated off by `skipIf`.
- **Declared + correctly skipped** (a light run, or not `web_affected`): assert that it was skipped, not vacuously passed.

A declared tier therefore emits an **executed count**, taken from the runner's machine summary (for example, vitest `numPassedTests + numFailedTests`). The capstone asserts `count > 0` for every declared-and-planned tier. At install time, the same rule reads "every tagged suite has a CI home": each `@live`-tagged test must live in a package whose declared entrypoint (for example, a `test:live` script) the tier actually invokes. Otherwise the tag is dead code.

**The assert is a script, not a heredoc in the workflow.** It is the only required check, and a shell heredoc inside YAML cannot be unit-tested. Move the decision into a script that the normal test command already runs, with the environment as an argument. Four cases must red:

- a lane that failed
- a gated lane that ran when its gate said skip
- a tier that reports success with zero tests
- a plan that will not parse

The checkout that fetches that script is ungated and not `continue-on-error`. A checkout gated on `run_level == 'full'` leaves every other run with no script, and the required check then exits on "cannot find module" without reading the plan. bkit ships the script as `.bkit/templates/scripts/ci/bkit-check-capstone.mjs` with its test `bkit-check-capstone.test.mjs`. The script takes the environment in, and puts `::error::` / `::warning::` lines and an exit code out. A consumer copies both files with `bkit-ci.yml`. When the script is missing, the capstone step reds with a copy-the-script message, and never skips.

**Namespace.** `bkit-tests-scope` is the planner. A loop over every `bkit-tests-*` job skips it, and a scope failure then leaves the capstone green. Exempt `bkit-tests-scope`, `bkit-tests-reset`, and `bkit-tests-cleanup` by name from any guard that treats every `bkit-tests-*` job as a counting lane. Point branch protection at `bkit-tests-check`.

**A per-tier count will not catch a file that stops running everywhere.** `count > 0` proves each tier ran tests, but it does not prove every test file ran in some lane. A file renamed out of its glob, moved to a lane whose filter excludes it, or left carrying a stale `skipIf` (the lane-move trap above) can quietly stop executing in every lane, while each lane stays green and each count still looks plausible. The capstone is the only job that `needs:` every lane, so it is the only place to answer this, on the union: reconcile the on-disk test-file inventory against the set of files that executed across all lanes. A file skipped in one lane but run in another is fine. Only a file that is dead in every lane is the bug.

- Its checkout stays `continue-on-error`, and must not be the script checkout above.
- Keep it a non-blocking diagnostic. It must never red the required check.
- Run it on full runs only. A PR's unit lane is affected-scoped and `bkit-tests-live-web` is absent, so the PR delta is expected and large, and a guard that cries wolf gets turned off.
- Start it report-only. Flip it to an assert once the allowlist of files that legitimately never run is seeded from a real inventory.

**Executed is not the same as exercised.** `count > 0` proves a test ran, but it does not prove the test reached the behaviour it claims to cover. A **hollow boundary test** is non-mock, owns a CI home, executes and passes, and can still cover nothing when it short-circuits before the boundary. A worked example: a golden test for an external OCR lane called the extractor with the wrong argument shape. The input field was `undefined`, the extractor returned `{ text: "", extractor: "none" }` in ~2ms, no API call was ever made, and the assertion (on a field that did not exist) was never reached. The test was green in CI and covered nothing.

A boundary test must therefore assert a ground-truth signal that only the real boundary can produce: a specific returned value, shape, identity or latency floor (for example, `extractor === "mistral-ocr"` and `text.length > 50`). Never assert "did not throw", or a value that a degenerate or short-circuit path could also return. Two corollaries:

1. When a deploy / `@live` tier exists, route external and deployed-boundary behaviours (3rd-party API, model, payment, deployed schema, RLS / tenancy) to `@live`, because a passing local fixture is not evidence that prod is correct (§ Schema-invariant DB checks).
2. Type-system escapes at a boundary call-site are forbidden. Examples are TS `as unknown as` / `as any` casts, the `@ts-ignore` / `@ts-nocheck` / `@ts-expect-error` directives, and Python `# type: ignore`. They suppress the contract drift (a renamed SDK field, a changed signature) that the boundary test exists to catch, so the bug ships while the test passes against the wrong shape.

**Never manufacture a vacuous green.** A pass-with-no-tests option (for example, `passWithNoTests: true` / `--passWithNoTests`) makes a runner report PASS with zero tests run. That is the exact hole the executed-count gate exists to close, so it is a **banned override** in any bkit-managed test config. Two adjacent guards:

- Emit the executed count as a build output, not a log line, so a build-cache replay (for example, from a task runner like turbo) restores the real number. Let a cache short-circuit report a `cached` sentinel (validated on cache), not a hollow 0.
- Assert unit / integration counts only on non-PR full runs, because a PR run is affected-scoped and can legitimately resolve to 0 affected tests.

### Step names say whether a red is real

One verb scheme across every step in `bkit-ci.yml`, so a red run can be triaged from the step name alone before opening a log:

<!-- prettier-ignore -->
| Verb | Means |
| --- | --- |
| `Assert` | a red here is a real failure |
| `Check` | looks and reports, cannot red the lane |
| `Run` | invokes a named tool or suite |
| `Report` / `Upload` / `Count` / `Merge` / `Fetch` | move or publish results |

`Guard`, `Validate`, `Verify` and `Audit` are not in the scheme: each means "fail the job if this isn't true", which is `Assert`. `Check` is the load-bearing half: it is reserved for a step that genuinely cannot red the lane, either because it carries `continue-on-error: true` or because its body only ever warns. A step named `Check` that can fail the build is the one naming error this scheme exists to prevent, because it trains you to skim past a real failure.

Two smaller rules that follow from the same idea:

- **Name the tool the way the tool is named.** `Run actionlint`, not `Run Actionlint`; `Run bkit Check`, not `Run Bkit Check`. A step name that misspells its own tool is a step name you cannot grep for.
- **Drop a qualifier the job name already carries.** Inside `bkit-tests-unit`, `Run Unit Tests` beats `Run Vitest Unit Tests`, because the lane already said which tier, and the runner is visible in the command. Keep a bracket only when it disambiguates two steps that would otherwise share a name and mirrors a literal flag or tool: `Run Slop Scan (full)` / `(delta)`, `Run Shell Tests (bats)`.

### A guard asserts the rule, not the sentence that explains it

A shape guard over a config file reads that file as text, so it is easy to anchor it on whatever string happens to be nearby. Anchor it on the rule. A guard pinned to the prose around the rule fails the moment someone improves the comment, and passes for years after the rule itself is deleted.

For example, a guard asserting `expect(content).toMatch(/bootstrap paradox/)` to protect a real invariant (a lane checks the repo out before it calls a local composite) goes red when someone tidies the phrase out of the comment, while the invariant still holds. Assert the thing that must hold (`must already be checked out`, a step id, a flag, an `if:` shape), not the words chosen to describe it.

Three practical rules:

- **Pin the mechanism, not the wording.** `expect(step).not.toMatch(/exit [1-9]/)` proves a step is non-blocking; matching a comment that says "this only warns" proves nothing about the code.
- **Derive the list, never hand-write it.** A guard that enumerates lanes goes stale the day a lane is added. Derive the set from the file under test (count the `VERBOSE_CI` declarations, or read the `needs:` array), so a new lane is covered without editing the guard.
- **Prove it can fail.** Put the bug back and watch the guard red before you trust it. A guard that has never failed is indistinguishable from a guard that cannot.

**The exception, stated so it is not mistaken for the rule.** When the shipped artefact is prose (a rules file an agent reads, a CLI help string, an advisory message), the wording is the behaviour, and asserting on it is correct. The distinction is whether the text is the deliverable or a description of one.

### Composite actions: two rules that fail silently

A composite action (`uses: ./.github/actions/setup`) is the right way to stop copy-pasting a setup block across lanes. Two of its rules are not obvious and neither fails loudly:

- **A composite cannot own the checkout that fetches it.** A local `uses: ./…` path is resolved from the runner's own filesystem, so the repo must already be checked out before the runner can read the composite's `action.yml` at all. Putting `actions/checkout` inside the composite and making the composite each lane's first step is a bootstrap paradox, so the lane reds with "can't find action.yml". Every adopting lane runs `actions/checkout` as its own first step, with its own explicit `fetch-depth`, before it calls the composite.
- **Job-level `env:` reaches a composite step's process, but not its `env` expression context.** The `env` context inside a composite reflects only what the composite itself declares. `if: env.VERBOSE_CI == '1'` on a composite step is therefore always false: the step silently never runs, and nothing reds. Gate in the shell instead (`if [ "${VERBOSE_CI:-}" != "1" ]; then exit 0; fi`), and say so in a comment, or the next person tidies it back into an `if:`.

The same expression-context trap has a neighbour outside composites. The `env` context is not available to a job-level `env:` value either, so `NODE_OPTIONS: ${{ env.VERBOSE_CI && '…' || '' }}` resolves empty on every run. Spell the marker test out (see § CI verbosity).

### E2E on PRs: run the full suite, watch which DB it hits

There are two PR-time E2E concerns. Both are gated on real preconditions (event, head ref), never on a kill-switch flag:

- **Parity — PR and push run the full suite.** `pull_request` runs the same E2E spec set as the `dev`/`{{DEFAULT_BRANCH}}` push. Scale a slow suite by sharding (parallel lanes, more workers). PR and push runs differ only in their DB target (below) and in push-only tiers (for example, `@live`).
- **Correctness — migration-coupled PRs.** When preview deploys share one `dev` database, that database does not yet carry a PR's unmerged migration, because the migration applies only on the post-merge push. A PR that adds or renames a column and also uses it therefore fails with a 500 every time before the merge. A force-all-E2E marker does not help, because it hits the same migration-less DB.
  - On feature→`dev` PRs, run E2E against a local DB that has applied this PR's migrations: reset local → prod build → run against `localhost`.
  - Keep preview-backed E2E for `dev`/`main` pushes, for deploy fidelity.
  - The `dev`→`main` release PR (head ref `dev`) already targets the migrated `dev` DB, so it stays on the remote.
  - A repo with more than one migration system must apply all of them locally.

### Concurrent invocations collide on disk, not just in the database

Per-shard data isolation (§ Optional hardening) is necessary, but not sufficient. When one job launches several runner processes at once, anything keyed on the runner's own worker index collides, because that index restarts at 0 in every process.

For example, when one E2E step fans out over several concurrent Playwright invocations and each writes its minted session into one shared auth dir as `user-w<N>.json` (`<N>` = `workerInfo.parallelIndex`), every invocation has a worker 0, so several of them write `user-w0.json`. The later write wins, and browsers load sessions their own worker never built, which surfaces as `Cannot read properties of undefined` errors and sign-in redirects. DB rows with random owners do not collide, so the collision is purely on disk. A cross-tenant bleed tripwire cannot see it, because a clobbered file still holds a valid identity.

- **Make the index global.** Give each invocation a distinct lane index, and use `laneIndex * workersPerLane + parallelIndex`. When the lane index is unset, the offset is 0, so local runs stay byte-identical.
- **Throw on a bad value, never clamp.** An index that silently reads as 0 is the defect being prevented.
- **Assert distinctness, not presence.** A guard that checks each invocation has an index still passes when two lanes share 0, which restores the bug.
- **Keep bands unique, never dense.** A `--workers=1` lane leaves most of its band unused, and that waste is the point. Tightening the spacing to real worker counts is how bands overlap again.
- **Test the loop by running it.** A static scan cannot see loop-generated invocations. Execute the real `run:` body in the guard: a control run, plus mutations (a pinned lane index, a stripped cache-dir suffix) that must red.

The same rule applies to every per-worker artefact keyed that way: transform caches, blob report dirs, JSON output names and artifact dirs. The fix also removes the reason to serialise the lanes at all.

Two further axes share the same root cause:

- **Shared identity vs per-principal rate limits.** Several lanes driving one fixture owner create more records in a minute than the product allows one user, so the lanes past the per-user limit get a 429. The limiter is working, and the fixture is pretending several lanes are one person. Give each lane its own fixture identity under a suffix, make teardown delete by id, and guard the fixture build separately from the lanes.
- **Shared service load.** A per-navigation auth call under a wide fan-out turns into thousands of `GET /auth/v1/user` requests in minutes, which stalls the provider and reddens lanes on other machines that share it. Before fanning out, audit per-request calls to shared external services. Do the local check first (JWKS). Call the service only for the cases that check cannot decide. This is a different lever from the phase-split one (`deployments.md` § Parallel test lanes): it cuts per-request cost, not peak concurrency.

## Which tier does a behaviour need?

Assign every behaviour its **lowest sufficient tier(s)**: the lowest tier that actually exercises it. A behaviour may need more than one. Never substitute a lower or mocked tier for a boundary that a higher tier validates. **Under-tiering** is a defect, not a shortcut. It means using a lower or mocked tier where the rubric demands a higher or `@live` one, for example a user-visible flow with no E2E row, an external-API behaviour tested only against a local fixture, or a migration with no fresh-DB replay.

<!-- prettier-ignore -->
| Behaviour | Required tier |
| --- | --- |
| Any change (every commit) | **Static** — type / lint / format / prose / drift; pre-push + CI fail-fast |
| Pure function / single module, no I/O | **Unit** |
| Crosses a LOCAL stateful boundary (own DB / own API, no 3rd party) | **Integration** vs a freshly-provisioned instance, no mocks at the boundary |
| Crosses an external / deployed boundary (3rd-party API, model / LLM, payment, deployed schema, RLS / tenancy) | **@live (golden)** — reaches the real boundary, asserts a boundary-only signal |
| User-visible UI flow / DOM state | **E2E** |
| Design token value / reference-doc parity | **Unit** — reference doc vs each implementation, asserted independently (§ Design assertions) |
| Rendered geometry, contrast, touch-target size | **E2E** — computed style + a11y scan in the existing browser project (§ Design assertions) |
| New / changed migration or seed | **fresh-DB replay** (`bkit-tests-migration`) — replays from empty + the seed loads |
| Post-deploy health of a deployed surface | **Smoke** (post-CI or post-deploy — see `deployments.md`) |

A plan's `Derived Test Matrix` (`docs/templates/bkit-plan.md`) applies this rubric to one feature: one row per behaviour, each mapped to a build + verify task. Boundary rows carry the rigor above: reach the boundary, assert a signal only it can produce, and use no `as unknown as` at the call-site.

## Test first

`/bkit-build` writes each task's tests before its code and proves them: each test fails against stubs (red), then passes once the code exists (green). This covers the unit and integration tiers only. E2E and `@live` rows run in CI and stay planned in the `Derived Test Matrix`. Each plan task names its tests on a `**Test first:**` line (`;`-separated), or `n/a — {reason}`.

- **Declare `bkit:test:file`:** it runs the one test file bkit appends as its argument (a repo-relative path), and writes a JUnit XML report to the path in `$BKIT_TEST_REPORT`. Vitest: `vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT"`. pytest: `pytest --junitxml="$BKIT_TEST_REPORT"`. jest needs the `jest-junit` reporter.
  - **If** it is undeclared → the build reports test-first as not enforced.
  - **If** the test files belong to more than one runner (for example, `.bats` and `node:test`) → point it at a script that picks the runner by file type.
  - **If** `$BKIT_TEST_REPORT` is unset → pass no report flag. An empty `--outputFile.junit=` takes the next argument, the test file, as the report path, and overwrites it.
- **Declare `bkit:lint:file`:** it lints the one test file bkit appends (a repo-relative path) with the static gate's linter config, and exits 0 when clean. ESLint: `eslint --max-warnings=0`. Ruff: `ruff check`.
  - **If** the linter does not cover the test file (for example, `.bats`) → exit 0 (Oxlint: `--no-error-on-unmatched-pattern`).
  - The build lints each new test before its red. **If** `bkit:lint:file` is undeclared → the red is recorded unlinted, and a lint rewrite after it reads as an edited test.
- **Call the runner directly:** a task runner that caches results, or runs dependent packages' suites first, breaks the one-file contract. A monorepo routes the path to the package and config that own it. An integration file gets the same environment setup that the integration suite gets.
- **Judged by the report, never the exit code:** a misspelled path, a syntax error and an import of unwritten code all exit non-zero, just like a real failure. A red counts only when the named test ran and failed, and a green only when it ran and passed.
- **Stub first:** tests that fail because the code they import does not exist never show their assertions failing. Write stubs, then see the assertions fail.
- **Test name:** use the name as the runner reports it, or its last segment (`clamp > keeps a value inside the range` → `keeps a value inside the range`).
- **The red test stays:** after the red, the test may gain tests or formatting. A weakened, removed or rewritten assertion fails the build's verify.

## JUnit reports for bkit

`bkit tests run` counts a gate's failures from JUnit XML, not from its log. It empties a report folder before each run and passes its absolute path to the gate as `$BKIT_TEST_REPORT_DIR`.

- **Every runner in a gate writes JUnit there** when the variable is set: one file per runner or per run, `*.xml`, with any name. Two runs in one gate never write the same file name.
- **Counted:** failing plus erroring test cases across every file. Skipped cases do not count.
- **No reports:** `failures` is `null` (count unknown), and a hint says to turn the reporters on. The verdict still comes from the gate's exit code.
- **Unset variable:** the runner behaves as it always does, so a gate run by hand writes nothing extra.

## What each tier must do

Each tier lists the rule to follow, then a **Not:** line naming the failure the rule prevents. Stack tools (Vitest / Playwright / a Supabase-style local stack / a Vercel-style preview) appear only as worked examples, because the rule is the principle. Implement it for your stack.

### Static

- Run the whole non-test gate set: typecheck · format check · lint · prose lint · code-slop scan (full, plus a PR delta gate that fails only on net-new findings) · drift check · workflow linter. Locally this set is one script, `bkit:gate:static`, and `bkit:gate:static-unit` chains the unit tier on top. Pre-push, the build loop and the remediate agents all run these same scripts, so a green push and a green agent gate mean the same thing. CI runs the rest fail-fast, before any env pull or heavy tier.
- Lint covers test files too, with rules that catch tests that cannot fail: no assertion, a conditional inside a test, a conditional `expect`, an unawaited promise. The linter is consumer-owned (for example, Vitest `expect-expect`, `no-conditional-in-test`, `no-conditional-expect`, `valid-expect`, and type-aware `no-floating-promises`). An optional JS / TS starting point is `.bkit/templates/.oxlintrc.json`.
- Scan a clean tree. Run static before the test tiers write coverage or result artifacts, or the scan flags the artifacts instead of your code.
- On PRs, scope to the affected graph (for example, a monorepo task runner's `--filter=...[base]`) over a non-shallow checkout (full history). Never use a shallow clone, because its affected-selection fails open to "everything".
- **Not:** a green CI that never ran the slop / drift / prose gates, because they sat behind a test step that exited early.

### Unit

- Test pure functions and single-module logic, in-process, with no I/O. Mock or inject the slow or side-effecting collaborators.
- **Not:** a "unit" test that opens a DB connection or hits the network. That is an integration or @live behaviour wearing a unit suffix, and it will flake.

### Integration

- Cross a local stateful boundary (your own DB / API) against a freshly-provisioned instance, with no mocks at the boundary (§ Provision backing services fresh).
- Self-seed each test's own fixtures (for example, in `beforeAll`). Do not assert on rows the seed file plants. Coupling to the shared seed makes the tier brittle to seed edits and lets seed regressions hide, because the seed has its own gate (§ Migration-replay + seed).
- Design for **unique-ID independence**: each case creates uniquely-keyed data and never assumes a clean shared store, so the suite parallelises. Transaction-rollback isolation is a pgTAP-style fast path that application-level tests cannot use, so pin file-level serialism where files must share one local instance.
- The DB boundary stays hermetic and local, but a read-only external API may legitimately be exercised here behind an opt-in flag. Anything with spend, side effects, a deployed schema, or tenancy / RLS belongs in @live, not here.
- When the runner does not auto-load `.env`, source real credentials explicitly. Then override the backing-service vars to point at the local instance, so a stray remote URL cannot redirect the tier at production data.
- **Not:** an "integration" test that is green against a long-lived shared dev DB carrying another run's rows. Its reproducibility is unproven.

### Deploy-reachability (between integration and E2E)

- Before any tier runs against a freshly-deployed URL, assert that it is actually serving, because **ready != serving**. A platform can report a deployment ready while it returns 404 / 500, and a bare "did the deploy finish" check passes anyway.
- Make a missing target an honest failure, not a silent skip. Assert that >=1 reachability test actually ran (per-file executed count), so an unreachable target reds the build instead of passing as a green no-op.
- **Not:** an E2E suite that "passes" because every spec silently skipped against a target that was never serving.

### E2E

- Drive the real UI against the specific commit's preview, after confirming it is ready and serving. Resolve the deploy by commit SHA, never by a static branch alias that may point at a stale build.
- Locally, run against a production build, not a dev server, because a dev file-watcher remounts components mid-test and breaks stateful UI (dialogs, wizards).
- Use stable selectors (test-ids) and condition-based waits. Never use a fixed-time or network-idle wait.
- Do not gate a response-wait on status. Match URL + method, then assert success explicitly, or a non-2xx response silently spins until the timeout.
- Clean up what you create (`afterAll`), and warn on accumulated `test_` / `e2e_` rows, so leaked fixtures cannot slowly corrupt a shared environment.
- On a pull request and on a push, run the same spec set (§ "E2E on PRs"). Scale a slow suite by sharding, not by dropping specs.
- **Not:** clicking by visible text and waiting on `networkidle`, which are the two classic causes of flaky E2E.

### @live (golden)

- Cross the real external or deployed boundary, and assert a ground-truth signal that only it can produce (§ Validated means executed). There are two shapes: **in-process** (the test calls the real SDK / model / API directly) and **deployed-endpoint** (the test fetches the running app). Use whichever one observes the boundary you are validating.
- It runs on a push to `dev` or the default branch only, when `web_affected` (`run_live`). A planned failure reds the capstone. It does not run on a pull request or a dispatch. A newer run on the same ref cancels the older one (`deployments.md` § One run per branch or pull request).
- **Honest skip vs hollow:**
  - **If** there is genuinely nothing deployed to validate → skip with a recorded reason. The capstone then asserts nothing about the count. This is different from a tier that ran 0 tests.
  - **If** a credential is missing while the tier is enabled → fail loudly at connect, never skip, because a vacuous skip hides infra rot.
- Never blast a production system with test traffic. Use a synthetic-identity namespace, plus a guarded teardown that refuses to delete anything outside it.
- **Not:** a non-mock @live test that short-circuits before the boundary (the hollow case), or one that asserts only "did not throw".

### Migration-replay + seed (the fresh-DB gate)

- Prove that every migration replays from an empty database on a fresh ephemeral instance, and that the seed then loads. This is the always-on sibling gate `bkit-tests-migration` (§ Provision backing services fresh). It is different from the deploy-time step that applies only new migrations onto the already-migrated remote (`deployments.md` § Applying migrations at deploy time). That remote push lives in the same always-on lane too. It comes after the replay, which keeps a from-empty failure away from the shared remote.
- Assert that the seed actually loaded by checking that a known row exists. A reset or replay can exit 0 while a conditional insert silently does nothing or the seed aborts mid-file. A green replay is not proof that the fixture is present (this is the seed version of the hollow-boundary rule).
- Generate the seed from a single deterministic source, and regenerate the checked-in seed file from it. The source is a pure data definition with no wall-clock `now()`, no random values, and explicit IDs / enums so triggers do not randomise it. Two hand-maintained copies drift.
- **Replay-from-empty, not reused-volume.** A bare "start the local stack" can reuse a stale data volume and silently skip newer migrations, so it is not a freshness proof. Only a reset or replay from empty is.
- Trigger the gate on every migration and seed source, including the seed generator and its data definition, not just the emitted seed file. Replay every migration chain, because a second ORM / CMS chain that this gate never replays is an unverified hole.
- **Not:** treating a reset or replay command's exit 0 as "seed loaded", or proving freshness with a start command that reuses the volume.

### Smoke

- After the deploy, run a fast, dependency-light probe of the live surface (a handful of health / route / contract checks, or a tiny tagged browser subset). It checks breadth ("is the app fundamentally up?"), not depth.
- It is an observability gate, not a merge gate. It has its own workflow and is never in branch protection. When `bkit-tests-deploy` promotes inside CI, this probe is the health workflow, not a second file (`deployments.md` § Smoke trigger plumbing, § Promote before the lanes).
- **Not:** a smoke suite wired into branch protection, or one so heavy that it cannot run on every deploy.

## Design assertions are a dimension, not a lane

**Never add a design lane.** The lane axis is **resource profile** (a millisecond file read vs a booted app + browser), not subject matter, because design assertions span both. A `bkit-tests-design` job (or a design-only browser project) splits one concern across two profiles and buys nothing that the existing lanes do not already provide. Fold each assertion into the tier that already fits it. The CI topology, the capstone's `needs:` and the browser-project partition all stay unchanged. A real consumer's full design-system rollout landed with `bkit-ci.yml` byte-unchanged.

<!-- prettier-ignore -->
| Design assertion | Lane |
| --- | --- |
| Token parity — reference doc vs each implementation (stylesheet variables, theme object) | `bkit-tests-unit` |
| Static guards — no raw hex, no arbitrary-value utility classes (utility-CSS repos, e.g. Tailwind) | `bkit-tests-static` (lint rule, anchored on the **class boundary** so e.g. Tailwind `p-[3px]` reds but a legitimate substring does not) |
| Repo-wide raw-hex contract (scans the source tree off disk, no I/O beyond the filesystem) | `bkit-tests-unit` |
| Contract depth — component-level token / test-id / behaviour assertions | `bkit-tests-unit` |
| Computed style + measured geometry (resolved pixels, touch-target size) | `bkit-tests-e2e-web` — ordinary specs in the **existing** browser project, selected by path |
| Accessibility scan (contrast, target size) | `bkit-tests-e2e-web` — the scanner is an imported helper, not a project fixture |
| Design-source parity (a rendered style guide vs the reference doc) | `bkit-tests-unit` |
| Visual regression (screenshot baselines) | **opt-in, not baseline** (§ Optional hardening) — highest maintenance cost of the set |

- **One reference, asserted independently.** The reference doc owns the token contract and its parsing rules (`design.md` § Machine-checked reference). What the lanes care about is that each implementation is its own test, so one red names its culprit.
- **Merge-gated from day one, never an advisory window.** The assertions live inside lanes that the capstone already gates, so a design red blocks the merge on the first PR that adds one. There is no promotion step to schedule, so there is no deferral row to forget.
- **A group tag carries zero routing power.**
  - Tag design tests in the test title, never by a filename convention, and add a `test:design` script for local iteration only.
  - The tag must never appear in an execution gate or an inverse-grep filter, because a test without it still runs in its normal lane.
  - Keep the standard filename, in a location that the package's include glob already matches. A bespoke `*.design.test.ts` or an unreached dir runs in zero lanes, so it is green everywhere and covers nothing (§ Validated means executed).
  - Pass-with-no-tests is mandatory on every `test:design` fan-out, and only there. The lane configs keep the ban (§ Validated means executed). Each runner spells that flag differently, and a browser runner hard-errors on a path or project name that matches nothing.
- **Cache footgun: design tests read files outside their own package.** A token-parity test reads the reference doc, and a raw-hex contract scans the source tree. Under a per-package-hash runner, editing the reference doc changes no package hash, so a warm cache replays a PASS against a reference that the code now contradicts. Put the reference doc (and any rendered style guide) in the runner's global dependencies, and mark the design-selection task uncached. A design run that overwrites the machine-readable results file the executed-count gate consumes is the same kind of trap, so re-run the full suite before trusting either.
- **Keep the first honest reds.** A first real geometry or a11y sweep surfaces genuine defects (undersized controls, failing contrast).
  - File them as issues, allowlist them behind a **named constant**, and ship the allowlist's **stale-entry check** in the same change, because an allowlist that never rejects a fixed entry decays into a silent exemption.
  - Enumerate the sweep scope by role and tag, never by test-id presence, because library-generated markup escapes that gate by construction.
  - Measure every theme before asserting any, or a light-theme red hides the dark-theme offenders.

## Schema-invariant DB checks (e.g. RLS coverage)

Access-policy coverage is stack-specific. bkit ships the pattern (the two routes below), not a drop-in test. Supabase / PostgREST is the worked example. Implement it for your backing store by swapping the catalog source and the anon probe for your stack's equivalent.

Assert DB-level invariants (for example, "every public table has RLS enabled", with no hardcoded list) in one of two co-equal ways. Pick by deploy topology, not by whether you can run a local DB-test runner (for example, pgTAP):

- **pgTAP** (the hermetic-fixture route): for example, `supabase/tests/*.sql` run by `supabase db test` in the `bkit-stub:test-db` step, against a CI-local fixture built from `supabase/migrations`. It is fast, hermetic and offline, and it keeps the invariant out of app code. Caveat: the fixture can differ from prod, so a migration that does not reproduce the live schema leaves this green while the prod access policies are actually broken. It is best when there is no deploy / `@live` tier, or for pure-logic DB unit tests.
- **@live catalog-RPC:** a privileged, server-only catalog query called from the `@live` tier (for example, Supabase: a `SECURITY DEFINER`, service_role-only RPC `public.rls_coverage_gaps()` over REST). It validates the real deployed schema in `bkit-tests-live-web`, and it needs a deploy and the RPC. It is the recommended default once you have a deploy / `@live` tier, because for access-policy and tenancy invariants especially, a passing local-fixture check is not evidence that prod is locked down. For example, on Supabase a direct port-5432 connection from CI runners is IPv4-flaky, so use the REST path that the tier already has.
- **PostgREST gotcha:** `GET /rest/v1/` (OpenAPI) is service_role-only by default. Fetch the exposed surface with the service-role key, then probe each table with the ANON key. Only the leak assertion must use anon.

An auto-discovering access-policy suite belongs in `bkit-tests-live-web`. For RLS it checks RLS-enabled, anon-reads-`[]` and cross-tenant-denial with no hardcoded table list, so it catches the next table too.

## Provision backing services fresh

A tier that needs a stateful backing service (database, cache, queue, search index) must run against a freshly-provisioned instance, not a long-lived shared one. Green against a shared environment carrying accumulated state is not evidence of reproducibility. A migration that never re-applies cleanly, a seed that aborts on an empty store, or a row another run left behind all stay invisible until the service is rebuilt from scratch. Prove that a fresh provision + seed succeeds in CI: for example, an ephemeral per-PR database started fresh each run (Supabase: `supabase db reset` + seed). Reserve the shared remote / dev instance for the `@live` tier and push-side E2E, because they validate the real deployed schema. It is never the integration tier's source of truth.

bkit's `bkit-tests-migration` lane (`bkit-stub:bkit-tests-migration`) is the ready-made home.

- It is always-on. It has no job-level `if:`, because the e2e and live lanes `needs:` it for remote-push ordering, and a skip would cascade.
- The replay and the seed assert stay plan-gated and path-gated per step.
- On every push to `dev`/`main`, the same lane owns the remote apply of new migrations (for example, `supabase db push --linked --include-all`). That apply has no `run_migration` gate, so the lane self-heals. Because the apply comes after the replay, a from-empty failure never gets to the remote.
- The capstone asserts `result == success` whenever the scope succeeded. Fold the lane into `bkit-tests-check`'s `needs:`.

**Local integration freshness.** A bare start of a local stack that reuses a warm data volume (for example, Docker + `supabase start`) can leave migrations unapplied (the stale-volume footgun).

- Prefer a reset-by-default runner over a bare integration run (for example, `turbo run test:integration`). Mirror local E2E: reset unless `--no-reset`.
- Shape: `pnpm test:integration:local` → a script that starts the local stack, exports its URL + keys, resets from empty (for example, `supabase db reset --local`), then runs integration. In CI it passes straight through, because CI boots its own hermetic stack.

**Local runners never touch env files** (for example, `.env.local` or `.env.production`, which may be the only copy of live credentials):

- Target the local stack by exporting its values before the config loads. Loaders (Next, dotenv `override: false`) never override a key that is already set.
- Blank a hosted key with `export KEY=""`, never with `unset`, because the loader refills unset keys from the file.
- NEVER delete, move or hide-and-restore the file, because a killed run loses it.
- NEVER `vercel env pull` onto it, because that replaces it with the host's keys only. Pull to a scratch file, then copy the keys across.
- A guard test fails any tracked script that deletes, moves or overwrites an env file.

**"Fresh" means replay-from-empty, not a reused volume.** A bare "start the local stack" command often reuses an existing data volume and applies only what is missing, so a "fresh" start can silently run a months-old schema while reporting success. Only a reset or replay from an empty store is a freshness proof. A green replay is also not a green seed. Assert that the seed actually loaded (a known row exists), because the reset can exit 0 while a conditional insert does nothing or the seed aborts mid-file. § Migration-replay + seed carries the full seed-determinism rules.

**Multiple migration systems:** a repo that runs more than one migration chain (for example, a SQL chain for the public schema and an ORM / CMS chain such as Payload or Prisma) must fresh-apply every chain here, and trigger on every migration source dir. A chain that this gate never replays is an unverified hole, so a broken migration in it lands green.

## Optional hardening (adopt when the cost is justified)

Beyond the gates above, three practices raise confidence further. They are opt-in, not baseline.

- **Mutation testing** (for example, StrykerJS over a Vitest suite) automates the "executed != exercised" intent. It injects bugs into production code and fails when no test catches them.
  - Run it locally, on demand. It is not a CI lane and not a nightly workflow.
  - Gate a local run on a survival-score threshold, never 100%, because equivalent mutants make perfection unreachable.
  - The capstone asks "did tests run?". Mutation asks "do they catch injected bugs?".
- **E2E sharding** (a `--shard` matrix + report merge) cuts wall-clock time on a large browser suite, but it is gated on per-shard data isolation (the unique-ID independence above). A single shared seed pins `workers: 1` and blocks sharding until the data is isolated. Isolated data is still not enough once several invocations share one job (§ Concurrent invocations collide on disk, not just in the database).
- **Bounded flaky-retry with tracking.** A capped retry on the flake-prone E2E tier is low-risk only when it is paired with explicit flake tracking. An auto-retry that silently passes hides a real regression, which is the inverse of "validated != didn't fail".

## Coverage on PRs

Shipped stubs target Vitest (`bkit-stub:coverage`) and Playwright (`bkit-stub:e2e-coverage`). On another runner, keep the rules (per-tier, report-only, ratchet from current) and swap the tooling.

Report coverage on each PR without a paid product or a third-party service. For example, the `bkit-stub:coverage` block in `.github/workflows/bkit-ci.yml` runs `davelosert/vitest-coverage-report-action` entirely inside Actions with `GITHUB_TOKEN`, and posts sticky per-PR comments. That is safe for private repos, because no coverage data leaves the runner. It replaces GitHub Code Quality's coverage-on-PR value (`deployments.md` § Disable GitHub Code Quality billing). It does not replace CodeQL security scanning, which is a separate product.

**Per-tier, not merged.** Unit and integration are measured and commented separately: two runs into `coverage/unit` and `coverage/integration`, and two comments keyed by a distinct `name:`. A single merged number is the weakest option. Coverage is a union, so a line covered only by an integration test reads as covered and hides a missing unit test. A merged gate therefore lets integration mask a hollow unit suite. The two numbers also have different denominators, so they cannot be honestly combined into one.

- **Report-only by default.** There are no `thresholds`, so coverage never reds the lane, and enabling the block on an existing repo cannot break it.
- **Reporters are load-bearing.** The action reads `coverage-summary.json` (from the `json-summary` reporter, which is mandatory) and `coverage-final.json` (from `json`, which `file-coverage-mode: changes` requires). Enable both in `coverage.reporter`, or the step does nothing.
- **Two runs, separate dirs.** Run `vitest run --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts'` for unit, and a second run into `coverage/integration` for the integration tier. Separate dirs also avoid the last-writer-wins clobber that a second `--coverage` run into the same dir would cause.
- **Thresholds are opt-in and per tier:**
  - **Unit = the gate.**
    - Put `coverage.thresholds.branches: <current>` in a `vitest.unit.config.ts` (`mergeConfig` over `vitest.config`) that only the unit run loads via `-c`. Branches is the meaningful floor, because line / statement % overstates confidence. Set it to your current coverage and ratchet up.
    - vitest coverage is per run (root config), not per project. `projects` does not scope it, and a `thresholds` block in `vitest.config` would red both runs. The `-c` file is what keeps the gate off integration.
    - A `--coverage.thresholds.branches=<n>` CLI flag also gates, but the report step cannot read it.
    - 80% is convention, not best practice, because a fetishised high bar breeds assertion-free line-touching tests. The executed-!=-exercised rule (§ Validated means executed) matters far more than the number.
  - **Floor beside the figure.** The unit report step runs on every event, a red run too (via `!cancelled()` plus a `hashFiles` guard). It passes `vite-config-path: vitest.unit.config.ts`, and comments only on same-repo PRs (`comment-on: pr`, else `none`). So every job summary, pushes included, shows the measured % against its 🎯 floor. The action regex-matches `<metric>: <number>` in that file's raw text. Keep the floor on one unquoted line, with no other metric name + colon + number in the file, because a broken match drops the target silently while the gate keeps passing.
  - **Integration = report-only.** Gate integration on execution (the capstone's `integration_ran > 0`), not on a %. A whole-repo integration % is denominator noise. Integration covers boundaries and flows, not pure logic, and rarely drives every branch, so a hard threshold on it punishes the correct pyramid shape.
    - **If** you want a real integration % → add `--coverage.include='src/server/**'` on the integration run (the same CLI-flag idiom as `--exclude`) to scope it to the integration surface. Then set a floor, or ratchet from current. Never use a number picked from thin air.
- **Share the unit gate with the build workflow.**
  - Put the unit run (`vitest run -c vitest.unit.config.ts --coverage …`) in a `test:coverage:unit` script, and chain it into `bkit:gate:static-unit` in place of `pnpm test`. Never put it beside `pnpm test`, because both run every unit test, so each test runs twice.
  - The CI unit lane calls the script, and `/bkit-build` Run Tests calls the gate. So the floor has one source, and a regression fails in the worktree, not only on the PR.
  - Never duplicate the command and sync it by comment, because that drifts.
  - The build runs only the deepest declared `bkit:gate:*`, never the script by name. Left out of the chain, the script never gates the build. bkit's own repo does exactly this.
- **Permissions.**
  - The report steps need `pull-requests: write`. Declare it at job level on the lane that posts.
  - A job-level `permissions:` block replaces the workflow-level block rather than adding to it. So re-include `contents: read` too, or the checkout breaks.
  - **Separate lanes:** with a lane per tier (recommended, see `deployments.md` § Parallel test lanes), each coverage comment posts from its own lane (unit-cov → `bkit-tests-unit`, integration-cov → `bkit-tests-integration`). Put the block on each lane that reports. With the combined starter, both live on `bkit-tests-unit`.
- **Fork PRs.** `GITHUB_TOKEN` is read-only for PRs from a fork, so commenting fails.
  - The shipped unit step sets `comment-on: none` there, and its job summary still lands.
  - The integration step's `head.repo == repo` guard skips it.
  - **If** you must comment on fork PRs → adopt the action's `workflow_run` two-workflow pattern.
  - The integration step is also guarded on `hashFiles(...)`, so a repo with no integration tier skips it cleanly.
- **Base-branch delta** (▲▼ vs the default branch) is not shipped by default, because it needs the base's `coverage-summary.json` (from a second run or a stored artifact). **If** you want it → wire the action's `json-summary-compare-path`.

### E2E coverage on PRs

The E2E tier (`bkit-stub:e2e-coverage`) reports Playwright coverage in the same free, in-Actions, private-repo-safe way. It posts a third sticky comment keyed `name: e2e`, and it is never merged into the unit / integration numbers. Unlike vitest, there is no `--coverage` flag. Playwright is black-box and does not instrument your source, so this is a 3-part pipeline.

- **Collect during the run.** Use either an **Istanbul instrumented build** (`vite-plugin-istanbul` exposes `window.__coverage__`, which a Playwright fixture scrapes; it works on every browser) or the **V8 API** (`page.coverage`, which is Chromium-only and needs source maps). Istanbul is the cross-browser default.
- **Report with Monocart.** `monocart-coverage-reports` (wired via the `monocart-reporter` Playwright reporter) ingests either V8 or Istanbul input. It emits Istanbul-format `coverage/e2e/coverage-summary.json` + `coverage-final.json`, the same two files the vitest action reads (`reports: ['json-summary', 'json', 'lcov']`), so no new commenter is needed.
- **Comment by reuse.** Point `davelosert/vitest-coverage-report-action@v2` at `coverage/e2e` with `name: e2e`. **If** `file-coverage-mode: changes` does not accept Monocart's `coverage-final.json` → drop to `file-coverage-mode: all`, or comment via a cobertura action (`irongut/CodeCoverageSummary`) on Monocart's `cobertura` report.
- **Report-only, no threshold by default.** A whole-app E2E % is denominator noise, because E2E exercises user flows, not every branch. So gate the tier on the E2E step succeeding, not on a number. For a real E2E %, scope Monocart's `entryFilter`/`sourceFilter` to the surface E2E is meant to cover, then ratchet from current. Never use a picked number.
- **Permissions / forks.** The E2E coverage report runs in the `bkit-tests-e2e-web` lane (or, with the combined starter, in `bkit-tests-unit`). It needs that lane's job-level `pull-requests: write` + `contents: read` block, or the comment cannot post. The `head.repo == repo` guard skips fork PRs. A `hashFiles('coverage/e2e/coverage-summary.json')` guard skips repos with no E2E coverage.

## CI verbosity (`[verbose ci]`)

See `deployments.md` § Commit-message force tags for the marker mechanics. That covers where to put it: the PR title for feature-branch pushes, and the commit message for a direct push to `dev` / `{{DEFAULT_BRANCH}}`. This section covers the testing-specific knobs.

**Knobs flipped under the marker.** The shipped stub flips turbo / Node / Vercel / Supabase / Playwright knobs. Add your stack's equivalents.

- `TURBO_LOG_LEVEL=full` surfaces Vitest / build output across all turbo steps. Without it, that output is compressed to errors only.
- `NODE_OPTIONS=--trace-warnings --trace-deprecation` prints stacks on deprecations and transitive-dep regressions.
  - Set it as a job-level `env:` key in static YAML, never by writing it to `$GITHUB_ENV`. The runner blocklists `NODE_OPTIONS` for that command: it rejects the write with an `::error::` and still concludes the step `success`. The flag then reaches nothing while the run goes green.
  - Spell the `contains()` marker test out rather than reusing `env.VERBOSE_CI`, because the `env` context is not available to a job-level `env:` value.
  - A step with its own `env:` block replaces the job-level value rather than merging with it, so that step must restate the flags.
- `DEBUG=vercel:*,supabase:*` shows the Vercel deploy and Supabase migration internal chain. It leaves out `pw:*`, because that duplicates the Playwright trace.
- Playwright (when `bkit-stub:e2e` is enabled) appends `--trace=on` only. `--video` and `--screenshot` are `playwright.config.ts use:` keys, not CLI flags, and Playwright errors on unknown CLI options. The trace.zip captures snapshots / network / console / source, which covers the main diagnose use case. Never pass `--reporter=line`. Let the `playwright.config.ts` chain run.

**Use when:** debug returns thin evidence (no `file:line`, only "tests failed", or an e2e failure without a trace). `bkit-debug` / `failure-diagnose` recommends it automatically. Never use it on a first attempt, and never on `bkit-ship`, because verbose output on a green run is pure cost in artifact storage and run time.

**Hostile gap: Playwright `--reporter=line` override.** **If** your `playwright test` invocation passes `--reporter=line` → drop it. With the marker on, traces are written but no reporter surfaces them, so the artifact upload is wasted. `bkit install` flags this as an advisory.

**Artifact paths** (already in `.gitignore` via the bkit template): `test-results/`, `playwright-report/`, `blob-report/`, `playwright/.auth/`. Never commit these, because traces alone run 1-50MB each.

<!-- bkit:end -->
