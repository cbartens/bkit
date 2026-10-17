<!-- bkit:start -->

<!-- bkit:managed v5.2.3 — do not edit; run `bkit upgrade` to refresh -->

# Testing

> [!CAUTION]
> **Purpose:** Testing strategy — tier boundaries, framework choices, naming conventions, CI execution.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Notation: one job per mark — `.bkit/prompts.md` § `Notation`.
> - Describe current state / rules, not reasons / history; state what to do, not why.
> - Check `.agents/docs.md` index first and confirm topic belongs in this doc, not another.
> - Tiers strictly separated — Static · Unit · Integration · E2E · @live · Smoke.
> - Pre-push: `pnpm bkit:gate:static-unit`, then `bkit check`; the `.husky/pre-push` template runs `bkit:gate:static` (no tests) on revert branches / commits. Gate scripts are consumer-owned; bkit's default = typecheck + lint + format:check + prose + slop:delta + `pnpm test` (unit + in-process integration). E2E, @live, service-backed integration excluded (CI — see below). never `--no-verify`.

## CI test tiers (the bkit scaffold)

CI runs tiers through bkit scaffold — **one parallel lane (job) per tier**, not steps in one job (step-by-step: `.github/workflows/bkit-ci.yml` § "full CI scaffold reference"; run-level shape: `deployments.md` § Run-level decision matrix).

Graph **flat and wide** for static / unit / build / integration: scope fans out; capstone joins. **One exception:** when `bkit-tests-migration` owns the shared-remote migration apply, e2e / live `needs:` that lane (ordering) — never gate live behind static / unit / build / e2e:

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

Adopt in this order. Stop at the first tier this repo does not have. You write the step bodies; these files name the job, the `needs`, the `if`, and the rule.

1. Keep `bkit-tests-static` and `bkit-tests-unit`.
2. Add `bkit-tests-scope`. Every later `if:` reads `plan`. One marker parse. Push base = last green run (`deployments.md` § One run).
3. Move integration out of unit into `bkit-tests-integration`.
4. Add `bkit-tests-build-web`. Compile, or create this SHA's deployment and publish `deployment_url` + `deployment_id` un-promoted on the default branch. Do not also enable `bkit-stub:vercel-await`.
5. Add `bkit-tests-migration` when you have migrations. Remote apply of new migrations (e.g. `supabase db push --linked --include-all`) lives here, after the from-empty replay. On the default branch it waits for static / unit / integration / `build-web` before touching production's database. Immutability and slop-delta use the planner base on every event.
6. Add `bkit-tests-reset` / `-cleanup` only when two or more lanes share one long-lived resource. Otherwise provision fresh and drop both.
7. Add `bkit-tests-e2e-web`. Full suite on a PR and on a push. Feature → `dev` PR hits a local stack. `TEST_URL` only. A pass on retry is a failure.
8. Add device build and device E2E only for a platform you ship. Same rule on a PR, a push, and a dispatch. `bkit-tests-e2e-ios` needs `build-ios` and `build-web`; android the same with its build lane.
9. Add `bkit-tests-live-web` for a push to `dev` or the default branch when `web_affected`. Not a PR. Not a dispatch. Do not `needs:` static, unit, integration, or e2e.
10. `bkit-tests-check` `needs:` every lane you kept. Sole required check. The assert is a script (§ Validated means executed).
11. `bkit-tests-deploy` on a default-branch push, **before** the E2E / `@live` lanes. Promotes that exact `deployment_id`; each tenant lane `needs:` it and refuses unless production serves this run's build. Not a required check (`deployments.md` § Promote before the lanes).
12. Health is `health.yml`, `workflow_run` after that CI success. A logging probe is a step inside each runtime lane, not a job.

Scripts these files do not ship, so the plan names them and you write them: marker parser, capstone assert, lease acquire and release. The last-green push base ships as a template (`.bkit/templates/scripts/ci/lanes/resolve-push-base.mjs`, copied to `scripts/ci/lanes/`).

- **`bkit-tests-scope`** (always-on) computes `run_level` (+ optional `run_migration`) + emits `bkit-test-plan` contract — what should run.
- **`bkit-tests-static` / `-unit` / `-integration` / `-e2e-web`** — one **lane per tier**, separate parallel jobs. A platform suffix (`-web` / `-ios` / `-android`) is required when that tier exists for more than one platform; `static` / `unit` / `integration` / `migration` stay bare. Integration / web E2E gate on `web_affected` / `run_e2e`; each lane emits executed-count for capstone and (coverage tiers) posts own coverage comment. Start `-static` + `-unit`, add lane per tier (`deployments.md` § Parallel test lanes). E2E: do **not** put remote migration apply here, because that lives in `-migration`. Web E2E on a feature → `dev` PR hits a local stack with this PR's migrations; every other event hits the deployment. Same outcome rules everywhere (retries, traces, flake handling). A pass on retry is a failure. Target from `TEST_URL` alone. No spec filtered by tag.
- **`bkit-tests-migration`** (optional; DB repos) — always-on ordering + provisioning lane: (1) fresh-DB replay + seed assert (plan- / path-gated per-step); (2) on every push to `dev`/`main`, remote apply of new migrations (e.g. `supabase db push --linked --include-all`) (un-gated by `run_migration`, so it self-heals a remote left behind). No job-level `if:`, because e2e / live `needs:` it; a skip would cascade. Capstone asserts `success` whenever scope succeeded. See § Provision backing services fresh.
- **`bkit-tests-build-web`** — web compile, or the host deployment gate (e.g. Vercel: create this SHA's deployment, publish `deployment_url` + `deployment_id`, leave it un-promoted on the default branch). Emits no `*_ran`.
- **`bkit-tests-build-ios` / `-e2e-ios` / `bkit-tests-build-android` / `-e2e-android`** (optional) — device build and device flows. Same rule on a PR, a push, and a dispatch: not a post-merge canary. `bkit-tests-e2e-ios` `needs:` scope, migration, reset, `bkit-tests-build-ios`, and `bkit-tests-build-web`. Android matches, with `bkit-tests-build-android`. A planned red reds the capstone. Drop any platform you do not ship. e.g. a hosted build service plus a device-flow runner.
- **`bkit-tests-live-web`** runs `@live` against the deployed URL (`run_live`; drop the job if no deploy). Push to `dev` or the default branch only, when `web_affected`. Not a pull request. Not a dispatch. `needs:` planner + migration + reset + `bkit-tests-build-web`. Do **not** gate behind static / unit / integration / e2e. A planned failure reds the capstone. `/bkit-ship` still filters a job named `bkit-tests-live`; this name does not match, so the capstone is the gate.
- **`bkit-tests-reset` / `bkit-tests-cleanup`** (optional; one shared long-lived resource) — reset takes the lease and puts the resource in its known state **before** any lane uses it; cleanup runs last, `if: always()`, and releases the lease. Planner names at most one target. Empty target skips both. Capstone reds if a planned reset skipped or either job failed. DROP both when the resource is provisioned fresh per run (§ Provision backing services fresh — the preferred answer).
- **Logging probe** (optional step, not a lane) — inside each runtime lane, emit one marked event and ask the error tracker whether it arrived. e.g. Sentry. Skip when that lane did not run the probe.
- **`bkit-tests-deploy`** (optional) — on a push to the default branch only, **before** the E2E / `@live` lanes. Promotes the exact `deployment_id` `bkit-tests-build-web` published; each tenant lane `needs:` it and starts by proving production serves this run's build (by deployment id). Carries its own `concurrency:` group (`cancel-in-progress: false`) and is not a required check. A red job means the previous deployment stays live.
- **Health** (optional, separate workflow) — `workflow_run` after CI succeeds on the default branch; smoke the deployment this SHA promoted. Not a required check. Copy the stub to `.github/workflows/health.yml`.
- **`bkit-tests-check`** capstone — `needs:` **all** lanes; fails if any expected tier skipped or executed zero → green required check = **validated**, not merely "nothing failed". Sole branch-protection required check.

### Accepted divergences

CI branches on the event in a few places. Each is a deliberate, recorded divergence from "one script runs everywhere" — not an accident. Every such site is registered so a new one is caught.

**The guard.** A workflow step, or the workflow-level `concurrency:` block (keyed `file#(workflow)#concurrency#field`), that reads an event field (`github.event_name`, `github.ref`, `github.ref_name`, `github.base_ref`, `github.head_ref`, `github.event.head_commit.message`, `github.event.pull_request.title`) must be listed in the registry (`scripts/ci/accepted-divergences.json`) with its decision and reason. The guard (`scripts/ci/check-accepted-divergences.mjs`) reds on an unregistered site, on a registered site that no longer exists, and on a decision missing from the table below. A new comparison inside an already-registered step is a new site. The guard scans `.github/workflows/*.yml` only; scripts, hooks and tests that read `CI` / `GITHUB_*` are outside it.

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

Every lane must **declare** what it may reach; declaration enforced by lane env — not by comment. Lane that can reach shared remote instance eventually will → cross-run interference, not failure.

<!-- prettier-ignore -->
| Lane | Real external APIs | Stateful backing service (DB / cache / queue) | Deployed app |
| --- | --- | --- | --- |
| `bkit-tests-static` | none | none | none |
| `bkit-tests-unit` | none — **mocked** | none | none |
| `bkit-tests-build-web` | none | none | creates this SHA's deployment; does not promote it |
| `bkit-tests-build-ios` / `-android` | the build host (e.g. a device-build service) | none | none |
| `bkit-tests-integration` | none — **mocked** | **ephemeral, CI-local, fresh each run** | none |
| `bkit-tests-migration` | none | **ephemeral, replayed from EMPTY** (plan- / path-gated) + **shared remote push** on every `dev`/`main` push | none |
| `bkit-tests-reset` / `-cleanup` | none | the **one** shared long-lived resource this run named | none |
| `bkit-tests-e2e-web` | none — **mocked** | ephemeral **local** (feature → `dev` PR) / the leased shared one (other events) | this SHA's deployment |
| `bkit-tests-e2e-ios` / `-android` | the device host | the leased shared resource | the deployed backend |
| `bkit-tests-live-web` | **real** | the deployed environment's **real** instance | **real** deployed URL |
| `bkit-tests-deploy` | the host API | none | promotes the deployment the tenant lanes then test |

Read table as rule: **`bkit-tests-live-web` and the device E2E lanes are the lanes that may spend real external quota**; **only those, plus push-side `-e2e-web`, may touch the shared long-lived resource**, and only between reset and cleanup. Everything else provisions its own (§ Provision backing services fresh).

> [!IMPORTANT]
> **"Real external API" and "real remote backing service" are two INDEPENDENT axes — never one flag.**
> Most expensive mistake in this doc. Single overloaded gate (`LIVE_API`, `TEST_REAL`, …) meaning both "hit real third-party APIs" and "hit real remote database" collapses unrelated needs. Real consumer result: **10 suites needing ONLY real DB (no external API) sat in serial push-only `@live` lane** — invisible on PRs, inflated gating lane. Moving to `-integration` (ephemeral local DB): `@live` 86→44 tests, PR coverage for first time. Gate each axis on what it needs: external-boundary test → API credential; DB test → DB URL (prefer **ephemeral** — no gate needed).

**Moving suite between lanes = three edits; third bites.** Retag file, move to new lane — **delete old gate**. Suite with `skipIf(!LIVE_API)` in lane that doesn't set `LIVE_API` **silently skips forever** — green lane, plausible count, coverage gone (hollow-green via back door, § Validated means executed). After lane move: assert destination executed count **up** by moved test count.

**Missing gate variable → honest detectable skip — never silent pass.** Tier needing URL / credential run lacks must report skipped (and, if planned, fail capstone), not exit 0 having run nothing. Per-file assert where it matters — e.g. (Vitest JSON) `numPassedTests >= 1 && numPendingTests === 0` — catches ghost-green no-op and quiet skip.

### Validated means executed, not "didn't fail"

Green capstone = planned tiers ran tests and passed — not merely nothing visibly failed. Three states per tier, gated independently:

- **Absent** — no declared entrypoint (e.g. a `test:integration` / `test:live` script, an enabled E2E step). The capstone asserts nothing; a repo with no integration / E2E / `@live` tier is fully valid (bkit's own repo has none).
- **Declared + planned to run** — assert the tier ran **and** executed **> 0** tests. This closes the green-with-zero hole: `--passWithNoTests` matching nothing, a `@live`-tagged suite whose owning package declares no live entrypoint (e.g. no `test:live` script, so `turbo run test:live` runs nothing), or every test `skipIf`-gated off, so all exit 0 and look green.
- **Declared + correctly skipped** (light run / not `web_affected`) — assert it was skipped, not vacuously passed.

A declared tier therefore emits an **executed count** (a runner's machine summary — e.g. vitest `numPassedTests + numFailedTests`); the capstone asserts `count > 0` for every declared-and-planned tier. The same rule at install time is "every tagged suite has a CI home": each `@live`-tagged test must live in a package whose declared entrypoint (e.g. a `test:live` script) the tier actually invokes, or the tag is dead code.

**The assert is a script, not a heredoc in the workflow.** It is the only required check, and a shell heredoc inside YAML cannot be unit-tested. Move the decision into a script the normal test command already runs, with the environment as an argument. Four cases must red: a lane that failed; a gated lane that ran when its gate said skip; a tier reporting success with zero tests; a plan that will not parse. The checkout that fetches that script is ungated and not `continue-on-error`. A checkout gated on `run_level == 'full'` leaves every other run with no script, and the required check exits on "cannot find module" without reading the plan.

**Namespace.** `bkit-tests-scope` is the planner. A loop over every `bkit-tests-*` job skips it, and a scope failure then leaves the capstone green. Exempt `bkit-tests-scope`, `bkit-tests-reset`, and `bkit-tests-cleanup` by name from any guard that treats every `bkit-tests-*` job as a counting lane. Point branch protection at `bkit-tests-check`.

**A per-tier count won't catch a file that stops running everywhere.** `count > 0` proves each tier ran tests; it does not prove every test file ran in some lane. A file renamed out of its glob, moved to a lane whose filter excludes it, or left carrying a stale `skipIf` (the lane-move trap above) can quietly stop executing in **every** lane — each lane green, each count still plausible. The capstone is the only job that `needs:` every lane, so it is the only place to answer this, on the **union**: reconcile the on-disk test-file inventory against the set of files that executed across all lanes. Skipped in one lane but run in another is fine, but only **dead in every lane** is the bug. Its checkout stays `continue-on-error` and must not be the script checkout above. Keep it a **non-blocking** diagnostic (it must never red the required check) and **full-runs-only** (a PR's unit lane is affected-scoped, and `bkit-tests-live-web` is absent, so the PR delta is expected and large — a cry-wolf guard gets turned off); start report-only, then flip to an assert once the allowlist of legitimately-never-run files is seeded from a real inventory.

**Executed is not the same as exercised.** `count > 0` proves a test ran; it does not prove the test reached the behaviour it claims to cover. A **hollow boundary test** — non-mock, owns a CI home, executes, passes — can still cover nothing if it short-circuits before the boundary. Worked example: a golden test for an external OCR lane called the extractor with the wrong argument shape, so the input field was `undefined`, the extractor returned `{ text: "", extractor: "none" }` in ~2ms, **no API call was ever made**, and the assertion (on a field that didn't exist) was never reached — green in CI, covering zero. A boundary test must therefore assert a **ground-truth signal only the real boundary can produce** — a specific returned value / shape / identity / latency floor (e.g. `extractor === "mistral-ocr"` and `text.length > 50`), never "did not throw" or a value a degenerate / short-circuit path could also return. Two corollaries: (1) when a deploy / `@live` tier exists, route external / deployed-boundary behaviours (3rd-party API, model, payment, deployed schema, RLS / tenancy) to `@live`, because a passing local fixture is not evidence prod is correct (§ Schema-invariant DB checks); (2) type-system escapes at a boundary call-site are forbidden — e.g. TS `as unknown as` / `as any` casts and `@ts-ignore` / `@ts-nocheck` / `@ts-expect-error` directives, Python `# type: ignore`, alike, because they suppress the contract drift (a renamed SDK field, a changed signature) the boundary test exists to catch, so the bug ships while the test passes against the wrong shape.

**Never manufacture a vacuous green.** A pass-with-no-tests option (e.g. `passWithNoTests: true` / `--passWithNoTests`) makes a runner report PASS with zero tests run — the exact hole the executed-count gate exists to close; it is a **banned override** in any bkit-managed test config. Two adjacent guards: emit the executed count as a build **output** (not a log line) so a build-cache replay (e.g. a task runner like turbo) restores the real number, and let a cache short-circuit report a `cached` sentinel (validated-on-cache, not a hollow 0); assert unit / integration counts only on **non-PR full runs**, because a PR run is affected-scoped and can legitimately resolve to 0 affected tests.

### Step names say whether a red is real

One verb scheme across every step in `bkit-ci.yml`, so a red run can be triaged from the step name alone before opening a log:

<!-- prettier-ignore -->
| Verb | Means |
| --- | --- |
| `Assert` | a red here is a real failure |
| `Check` | looks and reports, cannot red the lane |
| `Run` | invokes a named tool or suite |
| `Report` / `Upload` / `Count` / `Merge` / `Fetch` | move or publish results |

`Guard`, `Validate`, `Verify` and `Audit` are **not** in the scheme: each means "fail the job if this isn't true", which is `Assert`. `Check` is the load-bearing half: it is reserved for a step that genuinely cannot red the lane, either because it carries `continue-on-error: true` or because its body only ever warns. A step named `Check` that can fail the build is the one naming error this scheme exists to prevent, because it trains you to skim past a real failure.

Two smaller rules that follow from the same idea:

- **Name the tool the way the tool is named.** `Run actionlint`, not `Run Actionlint`; `Run bkit Check`, not `Run Bkit Check`. A step name that misspells its own tool is a step name you cannot grep for.
- **Drop a qualifier the job name already carries.** Inside `bkit-tests-unit`, `Run Unit Tests` beats `Run Vitest Unit Tests`, because the lane already said which tier, and the runner is visible in the command. Keep a bracket only when it disambiguates two steps that would otherwise share a name and mirrors a literal flag or tool: `Run Slop Scan (full)` / `(delta)`, `Run Shell Tests (bats)`.

### A guard asserts the rule, not the sentence that explains it

A shape guard over a config file reads that file as text, so it is easy to anchor it on whatever string happens to be nearby. Anchor on the **rule**; a guard pinned to the prose around the rule fails the moment someone improves the comment, and passes for years after the rule itself is deleted.

The failure mode is specific and it is not hypothetical: a guard asserting `expect(content).toMatch(/bootstrap paradox/)` was protecting a real invariant — that a lane checks the repo out before calling a local composite. Tidying the phrase "bootstrap paradox" out of the comment reddened the guard while the invariant was untouched. Assert the thing that must hold (`must already be checked out`, a step id, a flag, an `if:` shape), not the words chosen to describe it.

Three practical rules:

- **Pin the mechanism, not the wording.** `expect(step).not.toMatch(/exit [1-9]/)` proves a step is non-blocking; matching a comment that says "this only warns" proves nothing about the code.
- **Derive the list, never hand-write it.** A guard that enumerates lanes goes stale the day a lane is added. Derive the set from the file under test — count the `VERBOSE_CI` declarations, read the `needs:` array — so a new lane is covered without editing the guard.
- **Prove it can fail.** Put the bug back and watch the guard red before you trust it. A guard that has never failed is indistinguishable from a guard that cannot.

**The exception, stated so it is not mistaken for the rule.** When the shipped artefact is prose — a rules file an agent reads, a CLI help string, an advisory message — the wording is the behaviour, and asserting on it is correct. The distinction is whether the text is the deliverable or a description of one.

### Composite actions: two rules that fail silently

A composite action (`uses: ./.github/actions/setup`) is the right way to stop copy-pasting a setup block across lanes. Two of its rules are not obvious and neither fails loudly:

- **A composite cannot own the checkout that fetches it.** A local `uses: ./…` path is resolved from the runner's own filesystem, so the repo must already be checked out before the runner can read the composite's `action.yml` at all. Putting `actions/checkout` inside the composite and making the composite each lane's first step is a bootstrap paradox, so the lane reds with "can't find action.yml". Every adopting lane runs `actions/checkout` as its **own** first step, with its own explicit `fetch-depth`, before it calls the composite.
- **Job-level `env:` reaches a composite step's process, but not its `env` expression context.** The `env` context inside a composite reflects only what the composite itself declares, so `if: env.VERBOSE_CI == '1'` on a composite step is **permanently false**, so the step silently never runs, and nothing reds. Gate in the shell instead (`if [ "${VERBOSE_CI:-}" != "1" ]; then exit 0; fi`) and say so in a comment, or the next person tidies it back into an `if:`.

The same expression-context trap has a neighbour outside composites: the `env` context is not available to a **job-level `env:` value** either, so `NODE_OPTIONS: ${{ env.VERBOSE_CI && '…' || '' }}` resolves empty on every run. Spell the marker test out — see § CI verbosity.

### E2E on PRs: run the full suite, watch which DB it hits

Two PR-time E2E concerns, both gated on **real preconditions** (event, head ref), never a kill-switch flag:

- **Parity — PR and push run the full suite.** `pull_request` runs the **same** E2E spec set as the `dev`/`main` push. Scale a slow suite by sharding (parallel lanes / more workers). PR↔push differ only by **DB target** (below) and **push-only tiers** (e.g. `@live`).
- **Correctness — migration-coupled PRs.** If preview deploys share one `dev` database, that database does not yet carry a PR's unmerged migration (it applies only on the post-merge push). A PR that adds / renames a column **and** uses it in the same PR therefore deterministically 500s pre-merge; a force-all-E2E marker does **not** help (same migration-less DB). Fix: on **feature→`dev` PRs** run E2E against a **local** DB that has applied this PR's migrations (reset local → prod build → run vs `localhost`); keep preview-backed E2E for `dev`/`main` **pushes** (deploy fidelity). The `dev`→`main` release PR (head ref `dev`) already targets the migrated `dev` DB, so it stays on remote. Repos with more than one migration system must apply **all** of them locally.

### Concurrent invocations collide on disk, not just in the database

Per-shard data isolation (§ Optional hardening) is necessary, **not** sufficient. One job launching several runner processes concurrently → anything keyed on the runner's **own worker index** collides: that index restarts at 0 in every process.

Consumer fanned one E2E step over 12 concurrent Playwright invocations. Each wrote its minted session into one shared auth dir as `user-w<N>.json`, `<N>` = `workerInfo.parallelIndex` → two lanes both wrote `user-w0.json`, later write won, browsers loaded sessions their own worker never built: 486 `Cannot read properties of undefined` + 102 sign-in redirects. DB rows never collided (random owners → tenant tag is a label, not a key); the collision was purely on disk, and the suite's cross-tenant bleed tripwire could not see it, because a clobbered file still holds a valid identity.

- **Make the index global.** Distinct lane index per invocation → `laneIndex * workersPerLane + parallelIndex`. Unset → offset 0, local runs byte-identical.
- **Throw on a bad value, never clamp.** An index silently reading as 0 is the defect being prevented.
- **Assert distinctness, not presence.** A guard checking each invocation has an index passes with two lanes sharing 0 — bug restored.
- **Bands unique, never dense.** A `--workers=1` lane leaves most of its band unused; that waste is the point. Tightening spacing to real worker counts is how bands overlap again.
- **Test the loop by running it.** Loop-generated invocations are invisible to a static scan → execute the real `run:` body in the guard, control plus mutations (pinned lane index, stripped cache-dir suffix) that must red.

Same rule for every per-worker artefact keyed that way — transform caches, blob report dirs, JSON output names, artifact dirs — and the fix removes the reason to serialise the lanes at all.

Two further axes, same root cause:

- **Shared identity vs per-principal rate limits.** Four lanes driving one fixture owner created more records in a minute than the product allows one user → 429 on three of four. The limiter was working; the fixture was pretending four lanes are one person. Per-lane fixture identity under a suffix, teardown deletes by id, and guard the fixture build **separately** from the lanes.
- **Shared service load.** A per-navigation auth call became 3,500 `GET /auth/v1/user` in 4 minutes under a 12-lane fan-out, stalling the provider and reddening the `@live` lane on a **separate machine**. Audit per-request calls to shared external services before fanning out — verify locally first (JWKS), call the service only when the local check cannot decide. Distinct from the phase-split lever (`deployments.md` § Parallel test lanes): this cuts per-request cost, not peak concurrency.

## Which tier does a behaviour need?

Assign every behaviour its **lowest sufficient tier(s)** — the lowest tier that actually exercises it. A behaviour may need more than one. Never substitute a lower or mocked tier for a boundary a higher tier validates; **under-tiering** (a lower / mocked tier where the rubric demands a higher / `@live` one — a user-visible flow with no E2E row, an external-API behaviour tested only against a local fixture, a migration with no fresh-DB replay) is a defect, not a shortcut.

<!-- prettier-ignore -->
| Behaviour | Required tier |
| --- | --- |
| Any change (every commit) | **Static** — type / lint / format / prose / drift; pre-push + CI fail-fast |
| Pure function / single module, no I/O | **Unit** |
| Crosses a LOCAL stateful boundary (own DB / own API, no 3rd party) | **Integration** vs a freshly-provisioned instance, no mocks at the boundary |
| Crosses an EXTERNAL / DEPLOYED boundary (3rd-party API, model / LLM, payment, deployed schema, RLS / tenancy) | **@live (golden)** — reaches the real boundary, asserts a boundary-only signal |
| User-visible UI flow / DOM state | **E2E** |
| Design token value / reference-doc parity | **Unit** — reference doc vs each implementation, asserted independently (§ Design assertions) |
| Rendered geometry, contrast, touch-target size | **E2E** — computed style + a11y scan in the existing browser project (§ Design assertions) |
| New / changed migration or seed | **fresh-DB replay** (`bkit-tests-migration`) — replays from empty + the seed loads |
| Post-deploy health of a deployed surface | **Smoke** (post-CI or post-deploy — see `deployments.md`) |

A plan's `Derived Test Matrix` (`docs/templates/bkit-plan.md`) is the per-feature application of this rubric: one row per behaviour, each mapped to a build + verify task. Boundary rows carry the rigor above — reach the boundary; assert a signal only it can produce; no `as unknown as` at the call-site.

## Test first

`/bkit-build` writes each task's tests before its code and proves them: each test fails against stubs (red), then passes once the code exists (green). Unit and integration tiers only; E2E and `@live` rows run in CI and stay planned in the `Derived Test Matrix`. Each plan task names its tests on a `**Test first:**` line (`;`-separated), or `n/a — {reason}`.

- **Declare `bkit:test:file`:** runs the ONE test file bkit appends as its argument (repo-relative path) and writes a JUnit XML report to the path in `$BKIT_TEST_REPORT`. Vitest: `vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT"`; pytest: `pytest --junitxml="$BKIT_TEST_REPORT"`; jest needs the `jest-junit` reporter. Undeclared → build reports test-first as not enforced.
- **Call the runner directly:** a task runner that caches results or runs dependent packages' suites first breaks the one-file contract. A monorepo routes the path to the package and config owning it; an integration file gets the same environment setup the integration suite gets.
- **Judged by the report, never the exit code:** a misspelled path, a syntax error and an import of unwritten code all exit non-zero like a real failure. A red counts only when the named test ran and failed; green only when it ran and passed.
- **Stub first:** tests failing because the code they import does not exist never show their assertions failing. Write stubs, then see the assertions fail.
- **Test name:** as the runner reports it, or its last segment (`clamp > keeps a value inside the range` → `keeps a value inside the range`).
- **The red test stays:** after the red, the test may gain tests or formatting; a weakened, removed or rewritten assertion fails the build's verify.

## What each tier must do

Tier-by-tier rules: **do** the rule, avoid the **Not** (the failure it prevents). Stack tools (Vitest / Playwright / a Supabase-style local stack / a Vercel-style preview) appear only as worked examples, because the rule is the principle; implement it for your stack.

### Static

- Run the whole non-test gate set: typecheck · format check · lint · prose lint · code-slop scan (full **plus** a PR **delta** gate that fails only net-new findings) · drift check · workflow linter. Locally this set is one script, `bkit:gate:static`, and `bkit:gate:static-unit` chains the unit tier on top — the same scripts pre-push, the build loop and the remediate agents all run, so a green push and a green agent gate mean the same thing. CI runs the rest fail-fast **before** any env pull or heavy tier.
- Scan a **clean tree** — run static **before** the test tiers write coverage / result artifacts, or the scan flags the artifacts instead of your code.
- On PRs scope to the **affected graph** (e.g. a monorepo task runner's `--filter=...[base]`) over a **non-shallow checkout** (full history) — never a shallow clone that fails affected-selection open to "everything".
- **Not:** a green CI that never ran the slop / drift / prose gates because they sat behind a test step that exited early.

### Unit

- Pure functions and single-module logic, in-process, **no I/O**. Mock or inject the slow / side-effecting collaborators.
- **Not:** a "unit" test that opens a DB connection or hits the network: that is an integration or @live behaviour wearing a unit suffix, and it will flake.

### Integration

- Cross a **local** stateful boundary (your own DB / API) against a **freshly-provisioned** instance, **no mocks at the boundary** (§ Provision backing services fresh).
- **Self-seed each test's own fixtures** (e.g. in `beforeAll`); do **not** assert on rows the seed file plants. Coupling to the shared seed makes the tier brittle to seed edits and lets seed regressions hide, because the seed has its own gate (§ Migration-replay + seed).
- Design for **unique-ID independence**: each case creates uniquely-keyed data and never assumes a clean shared store, so the suite parallelises. Transaction-rollback isolation is a pgTAP-style fast-path; application-level tests can't use it, so pin file-level serialism where files must share one local instance.
- The DB boundary stays hermetic-local, but a **read-only** external API may legitimately be exercised here behind an opt-in flag; anything with **spend, side effects, a deployed schema, or tenancy / RLS** belongs in @live, not here.
- Source real credentials **explicitly** when the runner does not auto-load `.env`, then **override** the backing-service vars to the local instance so a stray remote URL can't redirect the tier at production data.
- **Not:** an "integration" test green against a long-lived shared dev DB carrying another run's rows — reproducibility unproven.

### Deploy-reachability (between integration and E2E)

- Before any tier runs against a freshly-deployed URL, assert it is **actually serving** — **ready ≠ serving**. A platform can report a deployment ready while it 404s / 500s; a bare "did the deploy finish" check passes anyway.
- Make a missing target an **honest failure**, not a silent skip: assert ≥1 reachability test actually ran (per-file executed-count), so an unreachable target reds the build instead of green-no-op.
- **Not:** an E2E suite that "passes" because every spec silently skipped against a target that was never serving.

### E2E

- Drive the real UI against the **specific commit's** preview — resolve the deploy by commit SHA, never a static branch alias that may point at a stale build — after confirming it is ready + serving.
- Locally, run against a **production build**, not a dev server: a dev file-watcher remounts components mid-test and breaks stateful UI (dialogs, wizards).
- Use **stable selectors** (test-ids) and **condition-based waits**; never a fixed-time or network-idle wait. Don't gate a response-wait on status — match URL + method, then assert success explicitly, or a non-2xx silently spins to timeout.
- Clean up what you create (`afterAll`) and warn on accumulated `test_` / `e2e_` rows so leaked fixtures can't slowly corrupt a shared environment.
- On a pull request and on a push, run the **same** spec set — § "E2E on PRs". Scale a slow suite by sharding, not by dropping specs.
- **Not:** clicking by visible text and waiting on `networkidle` — the two classic flaky-E2E footguns.

### @live (golden)

- Cross the **real external / deployed boundary** and assert a **ground-truth signal only it can produce** (§ Validated means executed). Two shapes: **in-process** (the test calls the real SDK / model / API directly) and **deployed-endpoint** (the test fetches the running app) — use whichever observes the boundary you're validating.
- Push to `dev` or the default branch only, when `web_affected` (`run_live`). A planned failure reds the capstone. It does not run on a pull request or a dispatch. A newer run on the same ref cancels the older one (`deployments.md` § One run per branch or pull request).
- **Honest skip vs hollow:** when there is genuinely nothing deployed to validate, **skip with a recorded reason** (the capstone then asserts nothing about its count) — distinct from a tier that ran 0 tests. But a **missing credential with the tier enabled must fail loudly at connect**, never skip, because a vacuous skip hides infra rot.
- Never blast a production system with test traffic: use a **synthetic-identity namespace** + a guarded teardown that refuses to delete anything outside it.
- **Not:** a non-mock @live test that short-circuits before the boundary (the hollow case), or one that asserts only "did not throw".

### Migration-replay + seed (the fresh-DB gate)

- Prove every migration **replays from an empty database** on a fresh ephemeral instance, then the **seed loads** — the always-on sibling gate `bkit-tests-migration` (§ Provision backing services fresh). Distinct from the deploy-time "apply only new migrations onto the already-migrated remote" step (`deployments.md` § Applying migrations at deploy time) — that remote push also lives in the **same** always-on lane, after the replay, so a from-empty failure never reaches shared remote.
- **Assert the seed actually loaded** — check a known row exists. A reset / replay can exit 0 while a conditional insert silently no-ops or the seed aborts mid-file; a green replay is not proof the fixture is present (the seed analog of the hollow-boundary rule).
- Generate the seed from a **single deterministic source** — a pure data definition with no wall-clock `now()`, no random values, explicit IDs / enums so triggers don't randomise it — and regenerate the checked-in seed file from it. Two hand-maintained copies drift.
- **Replay-from-empty, not reused-volume.** A bare "start the local stack" can reuse a stale data volume and silently skip newer migrations, so it is **not** a freshness proof; only a reset / replay from empty is.
- Trigger the gate on **every** migration / seed source — including the seed **generator** and its data definition, not just the emitted seed file — and replay **every** migration chain (a second ORM / CMS chain this gate never replays is an unverified hole).
- **Not:** treating a reset / replay command's exit 0 as "seed loaded", or proving freshness with a volume-reusing start command.

### Smoke

- After deploy, run a **fast, dependency-light** probe of the live surface (a handful of health / route / contract checks, or a tiny tagged browser subset) — breadth ("is the app fundamentally up?"), not depth.
- It is an **observability gate, not a merge gate**: own workflow, never in branch protection. When `bkit-tests-deploy` promotes inside CI, this probe is the health workflow, not a second file (`deployments.md` § Smoke trigger plumbing, § Promote before the lanes).
- **Not:** a smoke suite wired into branch protection, or one so heavy it can't run on every deploy.

## Design assertions are a dimension, not a lane

**NEVER add a design lane.** The lane axis is **resource profile** (a millisecond file read vs a booted app + browser), not subject matter, because design assertions span both. A `bkit-tests-design` job (or a design-only browser project) splits one concern across two profiles and buys nothing existing lanes don't provide. Fold each assertion into the tier that already fits it: CI topology, the capstone's `needs:`, the browser-project partition all stay **unchanged** (a real consumer's full design-system rollout landed with `bkit-ci.yml` byte-unchanged).

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

- **One reference, asserted independently.** The reference doc owns the token contract and its parsing rules (`design.md` § Machine-checked reference). What lanes care about: each implementation is its **own** test, so one red names its culprit.
- **Merge-gated from day one — never an advisory window.** Assertions live inside lanes the capstone already gates, so a design red blocks merge on the first PR that adds one. No promotion step to schedule → no deferral row to forget.
- **A group tag carries zero routing power.** Tag design tests in the test **title** (never a filename convention) + add a `test:design` script for local iteration only. The tag must never appear in an execution gate or inverse-grep filter, because a test without it still runs in its normal lane. Keep the **standard filename** in a location the package's include glob already matches: a bespoke `*.design.test.ts` or an unreached dir runs in **zero** lanes — green everywhere, covering nothing (§ Validated means executed). Pass-with-no-tests is mandatory on every fan-out; each runner spells that flag differently, and a browser runner hard-errors on a path / project name matching nothing.
- **Cache footgun — design tests read files outside their own package.** A token-parity test reads the reference doc; a raw-hex contract scans the source tree. Under a per-package-hash runner, editing the reference doc changes no package hash → a warm cache replays a **PASS against a reference the code now contradicts**. Put the reference doc (+ any rendered style guide) in the runner's **global dependencies** + mark the design-selection task **uncached**. Same trap class: a design run overwriting the machine-readable results file the executed-count gate consumes, so re-run the full suite before trusting either.
- **Keep the first honest reds.** A first real geometry / a11y sweep surfaces genuine defects (undersized controls, failing contrast). File as issues, allowlist behind a **named constant**, and ship the allowlist's **stale-entry check** in the same change, because an allowlist that never rejects a fixed entry decays into a silent exemption. Enumerate sweep scope by **role and tag**, never by test-id presence (library-generated markup escapes the gate by construction). Measure **every** theme before asserting any, or a light-theme red hides dark-theme offenders.

## Schema-invariant DB checks (e.g. RLS coverage)

Access-policy coverage is stack-specific: bkit ships the **pattern** (two routes below), not a drop-in test. Supabase / PostgREST is the worked example — implement it for your backing store (swap the catalog source + anon-probe for your stack's equivalent).

Assert DB-level invariants (e.g. "every public table has RLS enabled", no hardcoded list) one of two co-equal ways. Pick by **deploy topology**, not by whether you can run a local DB-test runner (e.g. pgTAP):

- **pgTAP** (hermetic-fixture route) — e.g. `supabase/tests/*.sql` run by `supabase db test` in the `bkit-stub:test-db` step against a CI-local fixture built from `supabase/migrations`. Fast, hermetic, offline; keeps the invariant out of app code. Caveat: the fixture can differ from prod, so a migration that doesn't reproduce the live schema leaves this green while prod access policies are actually broken. Best when there is **no** deploy / `@live` tier, or for pure-logic DB unit tests.
- **@live catalog-RPC** — a privileged, server-only catalog query called from the `@live` tier (e.g. Supabase: `SECURITY DEFINER`, service_role-only RPC `public.rls_coverage_gaps()` over REST), validating the **real deployed schema** in `bkit-tests-live-web`. Needs a deploy + the RPC. **Recommended default once you have a deploy / `@live` tier**, because for access-policy / tenancy invariants especially, a passing local-fixture check is not evidence that prod is locked down. (e.g. Supabase: direct port-5432 from CI runners is IPv4-flaky, so use the REST path the tier already has.)
- **PostgREST gotcha** — `GET /rest/v1/` (OpenAPI) is service_role-only by default: fetch the exposed surface with the service-role key, then probe each table with the ANON key (only the leak assertion must be anon).

An auto-discovering access-policy suite (e.g. RLS: RLS-enabled / anon-reads-`[]` / cross-tenant-denial, no hardcoded table list, so it catches the next table too) belongs in `bkit-tests-live-web`.

## Provision backing services fresh

A tier that needs a stateful backing service (database, cache, queue, search index) must run against a **freshly-provisioned** instance, not a long-lived shared one. Green against a shared environment carrying accumulated state is **not** evidence of reproducibility, because a migration that never re-applies cleanly, a seed that aborts on an empty store, or a row another run left behind all stay invisible until the service is rebuilt from scratch. Prove a fresh provision + seed succeeds **in CI**: e.g. an ephemeral per-PR database started fresh each run (Supabase: `supabase db reset` + seed). Reserve the shared remote / dev instance for the `@live` tier and push-side E2E (they validate the real deployed schema); it is never the integration tier's source of truth.

bkit's `bkit-tests-migration` lane (`bkit-stub:bkit-tests-migration`) is the ready-made home: **always-on** (no job-level `if:` because e2e / live `needs:` it for remote-push ordering; a skip cascades). Replay + seed assert stay plan- / path-gated per-step. On every push to `dev`/`main` the same lane owns remote apply of new migrations (e.g. `supabase db push --linked --include-all`) (un-gated by `run_migration` so it self-heals; after replay so from-empty failure never reaches remote). Capstone asserts `result == success` whenever scope succeeded. Fold into `bkit-tests-check`'s `needs:`.

**Local integration freshness.** If your local stack reuses a warm data volume (e.g. Docker + `supabase start`), a bare start can leave migrations unapplied (stale-volume footgun). Prefer a reset-by-default runner over a bare integration run (e.g. `turbo run test:integration`) — mirror local E2E: reset unless `--no-reset`. Shape: `pnpm test:integration:local` → script that starts local stack, hides remote env file (e.g. `.env.local`), resets from empty (e.g. `supabase db reset --local`), then runs integration (CI passthrough, because CI boots its own hermetic stack).

**"Fresh" means replay-from-empty, not a reused volume.** A bare "start the local stack" command often **reuses an existing data volume** and applies only what's missing, so a "fresh" start can silently run a months-old schema while reporting success. Only a reset / replay from an **empty** store is a freshness proof. And a green replay is not a green **seed**: assert the seed actually loaded (a known row exists), because the reset can exit 0 while a conditional insert no-ops or the seed aborts mid-file (§ Migration-replay + seed carries the full seed-determinism rules).

**Multiple migration systems:** a repo running more than one migration chain (e.g. a SQL chain for the public schema **and** an ORM / CMS chain such as Payload or Prisma) must fresh-apply **every** chain here and trigger on **every** migration source dir. A chain this gate never replays is an unverified hole, so a broken migration in it lands green.

## Optional hardening (adopt when the cost is justified)

Beyond the gates above, three practices raise confidence further — opt-in, not baseline:

- **Mutation testing** (e.g. StrykerJS over a Vitest suite) automates the "executed ≠ exercised" intent: it injects bugs into production code and fails when no test catches them. Run it locally, on demand. It is not a CI lane and not a nightly workflow. Gate a local run on a survival-score threshold, never 100% (equivalent mutants make perfection unreachable). Capstone asks "did tests run?"; mutation asks "do they catch injected bugs?".
- **E2E sharding** (`--shard` matrix + report merge) cuts wall-clock on a large browser suite, but it is **gated on per-shard data isolation** (the unique-ID independence above). A single shared seed pins `workers: 1` and blocks sharding until the data is isolated. Isolated data is still not enough once several invocations share one job — § Concurrent invocations collide on disk, not just in the database.
- **Bounded flaky-retry with tracking.** A capped retry on the flake-prone E2E tier is low-risk **only** when paired with explicit flake **tracking**, because an auto-retry that silently passes hides a real regression, the inverse of "validated ≠ didn't fail".

## Coverage on PRs

Shipped stubs target Vitest (`bkit-stub:coverage`) and Playwright (`bkit-stub:e2e-coverage`); on another runner keep the rules (per-tier, report-only, ratchet from current) and swap the tooling.

Report coverage on each PR **without a paid product or a third-party service** — e.g. the `bkit-stub:coverage` block in `.github/workflows/bkit-ci.yml` runs `davelosert/vitest-coverage-report-action` entirely inside Actions with `GITHUB_TOKEN`, posting sticky per-PR comments (safe for private repos; no coverage data leaves the runner). Replaces GitHub Code Quality's coverage-on-PR value (`deployments.md` § Disable GitHub Code Quality billing) — **not** CodeQL security scanning, a separate product.

**Per-tier, not merged.** Unit and integration are measured and commented **separately** (two runs into `coverage/unit` and `coverage/integration`, two comments keyed by a distinct `name:`). A single merged number is the weakest option: coverage is a **union**, so a line covered only by an integration test reads as covered and **hides a missing unit test**, so a merged gate lets integration mask a hollow unit suite. The two numbers also have different denominators, so they can't be honestly combined into one.

- **Report-only by default.** No `thresholds`, so coverage never reds the lane, so enabling the block on an existing repo can't break it.
- **Reporters are load-bearing.** The action reads `coverage-summary.json` (from the `json-summary` reporter, mandatory) and `coverage-final.json` (from `json`, required for `file-coverage-mode: changes`). Enable both in `coverage.reporter` or the step no-ops.
- **Two runs, separate dirs.** `vitest run --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts'` for unit; a second run into `coverage/integration` for the integration tier. Separate dirs also avoid the last-writer-wins **clobber** a second same-dir `--coverage` run would cause.
- **Thresholds are opt-in and per tier:**
  - **Unit = the gate.** Pass `--coverage.thresholds.branches=<current>` as a CLI flag on the **unit** run only, because **branches** is the meaningful floor (line / statement % overstates confidence); set it to your **current** coverage and ratchet up. vitest coverage is per-**run** (root config), **not** per-project, so `projects` does **not** scope it and a `thresholds` block in `vitest.config` would red **both** runs, because the per-run flag (or a second `vitest.<tier>.config.ts` run with `-c`) is what keeps the gate off integration. 80% is convention, not best practice, because a fetishised high bar breeds assertion-free line-touching tests; the executed-≠-exercised rule (§ Validated means executed) matters far more than the number.
  - **Integration = report-only.** Gate integration on **execution** (the capstone's `integration_ran > 0`), **not** a %. A whole-repo integration % is denominator-noise, because integration covers boundaries / flows, not pure logic, and rarely drives every branch, so a hard threshold on it punishes the correct pyramid shape. If you want a real integration %, add `--coverage.include='src/server/**'` on the integration run (same CLI-flag idiom as `--exclude`) to scope it to the integration surface, **then** set a floor, or **ratchet from current** — never a number picked from thin air.
- **Share the unit gate with the build workflow.** Put the unit run (`--coverage … --coverage.thresholds.branches=<current>`) in a `test:coverage:unit` script and chain it into `bkit:gate:static-unit` — the CI unit lane calls the script, `/bkit-build` Run Tests calls the gate, so the threshold has **one source** and a regression fails in the worktree, not only on the PR. Never duplicate the command and sync it by comment, because that drifts. The build runs only the deepest declared `bkit:gate:*`, never the script by name: **left out of the chain, it never gates the build**. (bkit's own repo does exactly this.)
- **Permissions.** The report steps need `pull-requests: write` — declare it at **job level** on the lane that posts. Job-level `permissions:` **replaces** the workflow-level block (not additive), and the SHA-cache step calls `gh run list`, so re-include `actions: read` too or it breaks. **Separate lanes:** with a lane per tier (recommended — see `deployments.md` § Parallel test lanes), each coverage comment posts from its own lane (unit-cov → `bkit-tests-unit`, integration-cov → `bkit-tests-integration`), so put the block on **each** lane that reports. With the combined starter, both live on `bkit-tests-unit`.
- **Fork PRs.** `GITHUB_TOKEN` is read-only for PRs from a fork, so the steps fail — the shipped `head.repo == repo` guard skips them there; adopt the action's `workflow_run` two-workflow pattern if you must comment on fork PRs. The integration step is also guarded on `hashFiles(...)` so a repo with **no integration tier** skips it cleanly.
- **Base-branch delta** (▲▼ vs the default branch) is **not** shipped by default, because it needs the base's `coverage-summary.json` (a second run or a stored artifact); wire the action's `json-summary-compare-path` if you want it.

### E2E coverage on PRs

The **E2E tier** (`bkit-stub:e2e-coverage`) reports Playwright coverage the same free, in-Actions, private-repo-safe way — a **third** sticky comment keyed `name: e2e`, never merged into the unit / integration numbers. Unlike vitest there is **no `--coverage` flag**: Playwright is black-box and doesn't instrument your source, so it's a 3-part pipeline.

- **Collect during the run.** Either an **Istanbul instrumented build** (`vite-plugin-istanbul` exposes `window.__coverage__`, scraped in a Playwright fixture — works on every browser) or the **V8 API** (`page.coverage`, Chromium-only, needs source maps). Istanbul is the cross-browser default.
- **Report with Monocart.** `monocart-coverage-reports` (wired via the `monocart-reporter` Playwright reporter) ingests **either** V8 or Istanbul input and emits Istanbul-format `coverage/e2e/coverage-summary.json` + `coverage-final.json` — the **same two files** the vitest action reads (`reports: ['json-summary', 'json', 'lcov']`), so no new commenter is needed.
- **Comment by reuse.** Point `davelosert/vitest-coverage-report-action@v2` at `coverage/e2e` with `name: e2e`. If Monocart's `coverage-final.json` isn't accepted for `file-coverage-mode: changes`, drop to `file-coverage-mode: all`, or comment via a cobertura action (`irongut/CodeCoverageSummary`) on Monocart's `cobertura` report.
- **Report-only — no threshold by default.** A whole-app E2E % is denominator-noise (E2E exercises user **flows**, not every branch), so gate the tier on the **E2E step succeeding**, not a number. For a real E2E %, scope Monocart's `entryFilter`/`sourceFilter` to the surface E2E is meant to cover, **then** ratchet from current — never a picked number.
- **Permissions / forks.** The E2E coverage report runs in the **`bkit-tests-e2e-web` lane** (or, with the combined starter, in `bkit-tests-unit`), and needs that lane's job-level `pull-requests: write` + `actions: read` + `contents: read` block, or the comment can't post. The `head.repo == repo` guard skips fork PRs; a `hashFiles('coverage/e2e/coverage-summary.json')` guard skips repos with no E2E coverage.

## CI verbosity (`[verbose ci]`)

See `deployments.md` § Commit-message force tags for the marker mechanics (where to put it: PR title for feature-branch pushes, commit message for direct push to `dev` / `main`). This section covers the testing-specific knobs.

**Knobs flipped under the marker** — shipped stub flips turbo / Node / Vercel / Supabase / Playwright knobs; add your stack's equivalents:

- `TURBO_LOG_LEVEL=full` — surfaces Vitest / build output across all turbo steps (otherwise compressed to errors-only)
- `NODE_OPTIONS=--trace-warnings --trace-deprecation` — stacks on deprecations / transitive-dep regressions. Set as a job-level `env:` key in static YAML, never written to `$GITHUB_ENV`: the runner blocklists `NODE_OPTIONS` for that command, rejects the write with an `::error::`, and still concludes the step `success`, so the flag reaches nothing while the run goes green. Spell the `contains()` marker test out rather than reusing `env.VERBOSE_CI`, because the `env` context is not available to a job-level `env:` value. A step with its own `env:` block replaces the job-level value rather than merging, so it must restate the flags
- `DEBUG=vercel:*,supabase:*` — Vercel deploy + Supabase migration internal chain (no `pw:*`, because it duplicates Playwright trace)
- Playwright (when `bkit-stub:e2e` enabled): appends `--trace=on` only, because `--video` and `--screenshot` are `playwright.config.ts use:` keys, not CLI flags (Playwright errors on unknown CLI options). The trace.zip captures snapshots / network / console / source, which covers the dominant diagnose use case. Never pass `--reporter=line` — let `playwright.config.ts`'s chain run

**Use when:** debug returns thin evidence (no `file:line`, only "tests failed", e2e fail without trace). `bkit-debug` / `failure-diagnose` auto-recommends. Never on first attempt; never on `bkit-ship`, because verbose on a green run is pure cost — artifact storage + run time.

**Hostile gap — Playwright `--reporter=line` override.** If your `playwright test` invocation passes `--reporter=line`, drop it. With the marker on, traces are written but no reporter surfaces them → wasted artifact upload. `bkit install` flags this as an advisory.

**Artifact paths** (already in `.gitignore` via bkit template): `test-results/`, `playwright-report/`, `blob-report/`, `playwright/.auth/`. Never commit these, because traces alone run 1-50MB each.

<!-- bkit:end -->

## Stack

- **Runner:** Vitest 4 (`pnpm test` → `vitest run`). Shell: bats (`pnpm bkit:test:bats`).
- **Test files** sit next to the file they test under `.bkit/core/engine/`; tests that read shipped text (workflows, templates, hooks, this repo's own docs and ledgers) sit in `.bkit/core/engine/audits/{workflows,templates,hooks,repo}/`. `tests/` = bats (`tests/*.bats`) + fixtures (`tests/fixtures/`).
- **No mocking framework.** Real filesystem (`os.tmpdir()`) over mocked `fs`. `vi.spyOn(process, "exit", ...)` only for `process.exit(1)` paths. Narrow exception: `.bkit/core/engine/checks/after/index.test.ts` mocks `node:child_process` via `vi.hoisted` — extend mock when boundary grows.

## Tiers

<!-- prettier-ignore -->
| Tier | Suffix | Scope | Where it runs |
| --- | --- | --- | --- |
| Unit | `*.test.ts` | Pure functions, single module. In-process; may `chdir` into an `os.tmpdir()`. No real subprocess (`spawn`/`exec` a real `git`/`npm`/`node`/`bash`): that is Integration. | Pre-push + CI |
| Integration | `*.integration.test.ts` | Multi-module wiring inside a process. May use `os.tmpdir()` + `process.chdir()`. May spawn `bkit` via `tsx`. | Pre-push (in-process, via `pnpm test`) + CI `bkit-tests-integration` lane; service / DB-backed integration is CI-only |
| E2E | (none yet) | Full end-to-end against a real consumer repo. | Out of scope for bkit |
| @live | (none) | Endpoint tests against a deployed URL (`test:live`). | `bkit-tests-live` job — N/A for bkit (no deploy) |

## Live-test gates in the agent workflows

`/bkit-debug` gates on declared live tier (`test:live` / `test:integration:live` / `test:e2e:live`) when consumer declares one — appended to Run-Tests (`[live=off]` opt-out); recorded in `TEST_SCOPE`. **`/bkit-build` does not run live tier**, because @live needs deployed URL; validated post-merge by push-only `bkit-tests-live` + reproduced via `/bkit-debug` (never purely local).

- **Build** — local tiers only (`test`); never `test:live`; @live = push-only canary.
- **Debug** — live boundary iteration 1 (reproduce); diagnose live-tier failure; require fail→pass before close.
- **Soak** (`DEBUG_MODE = SOAK` at start when `DEBUG_ATTEMPT` >= `MAX_DEBUG_ATTEMPT` or `[soak]`, mid-run `Mode: SOAK`, or NORMAL loop exhausted) — one instrument-or-fix step / iteration on live boundary, bounded by `MAX_SOAK_ATTEMPT`.

No live tier (or `[live=off]`) → Debug degrades to CONCERNS + `testsLiveSkipped` in status.jsonl / close comment — green ≠ "works." bkit has no deploy → CONCERNS by design. Build records no `testsLiveSkipped` — @live out of scope, not skipped.

## Consumer-runtime parity rule

CI must catch every consumer `pnpm bkit install` hard-fail. Same `.bkit/core/engine/**` code in repo + consumers, so release must not ship untested install paths.

**Required coverage per consumer-runtime hard-fail** (`process.exit(1)` from `bkit install` / `bkit check`):

1. **Unit test** — failure branch (bad input → exit).
2. **Smoke spawn** — `bkit install --claude --cursor` on scratch consumer (`os.tmpdir()`, exit 0). `.bkit/core/engine/commands/install/install.integration.test.ts` § Scenario 5.
3. **Stale-state spawn** — pre-seeded upgrade-skew consumer. Same file § Scenario 5.
4. **Phase 3 blocker** — Scenario 6 (exit 1 + recovery) + 7 (`--auto-revert` → `runUninstall`).
5. **Mid-failure rollback** — Scenario 9: post-first-module failure → `discardAllStaging`, byte-identical consumer.

## Heavy-customised consumer fixture

`tests/fixtures/heavy-customised-consumer/` is committed and consumed by:

- `.bkit/core/engine/commands/install/uninstall.integration.test.ts` — round-trip uninstall preserves consumer content byte-identically.
- `.bkit/core/engine/install/modules/claude.integration.test.ts` — two-version (v0.5.x → v0.8.0) upgrade-survival regression: consumer Stop hook and `failClosed` and `loop_limit` keys survive deep-containment merge.
- `.bkit/core/engine/commands/install/upgrade.integration.test.ts` — drift detection against `canonicalHashes`; `--non-interactive` exits non-zero on conflicts.

When adding bkit-managed file types or scope keys, extend fixture — single source of truth for real consumer surface; do not mock.

## Pre-release consumer shapes

`utility-pre-release-check` dogfoods the packed tarball in each consumer shape bkit ships to. bkit's own repo (single-package, marker-free `bkit-ci.yml`) is not one of them.

<!-- prettier-ignore -->
| Shape | Proves |
| --- | --- |
| Single-package repo | Every verb, drift gate, option matrix, uninstall symmetry; `bkit upgrade --to=<v>` self-bump runs `pnpm add -D` WITHOUT `-w` |
| pnpm workspace root, bkit as root devDependency | `bkit upgrade --to=<v>` self-bump runs `pnpm add -D -w` and succeeds against the real registry |

## Counter derivation test coverage

`*_ATTEMPT` counters **derived** from `status.jsonl` at use — never carried across Bash calls (§ Attempt counters, `.bkit/workflows.md`). Shell state does not persist between fenced blocks → value crosses only via `status.jsonl`, read by `bkit counters` / `bkit status`.

<!-- prettier-ignore -->
| File | Tier | Scope |
| --- | --- | --- |
| `commands/workflow/counters.test.ts` | Unit | Row counting at the three positions (`current` refuses 0); fold dedup (retries survive / replays collapse); active-run scoping; sub-plan isolation; `--since`; run numbering incl. resume + interleave; fail-closed value / max; `--limit`; thresholds |
| `commands/workflow/status.test.ts` | Unit | `debugMode`/`pushMode` meta (run-level over step); last verdict / failures; all-runs strategy + next rung; `--require` failures |
| `.bkit/core/engine/audits/workflows/counter-prose-audit.test.ts` | Unit (markdown-invariant) | No prose `Init` / `Increment`, no bare `*_ATTEMPT` / `MAX_*` comparison outside fenced blocks; counters derived in the block that routes on them, or by the routing / writing command itself (`steps finish --attempt=next` / `--attempt-of`, `counters route --of`); each derived counter maps to the right step; counted steps commit in-block or are exempted |

## Runtime detection + gh-preflight test coverage

`bkit runtime detect` maps detection primitives (`BKIT_RUNTIME` override, `.bkit/.runtime-cursor` marker, `CLAUDE_CODE_REMOTE`, `GITHUB_ACTIONS`/`CI`) to `runtime` ∈ {`LOCAL`,`GITHUB_ACTION`,`CLOUD_CLAUDE`,`CLOUD_CURSOR`,`UNKNOWN`} and a capability table (`runtimeWorktrees` / `runtimeDevPushes` / `runtimeGithubCli`, plus `runtimeHeadless` derived from `runtime` and never stored on the row), so workflow headers branch on the `RUNTIME_*` values instead of re-deriving runtime logic per call site. `runtimeGithubCli` is the ONE live probe (`gh auth status`, once, loud); `runtimeDevPushes` is deliberately never probed, because a `--dry-run` push probe fails dangerously. No `CAN_SLEEP` / `RUNTIME_SLEEPS` row exists, because sleeping is measured inside `bkit runs wait` / `bkit runs dispatch` (`blocked`, exit 81 → the agent turn loop). `commands/workflow/runtime.test.ts` runs each scenario against a fake `gh` on `PATH` — covers the table mapping (incl. `UNKNOWN` → least-capable, never LOCAL; `runtimeHeadless` per runtime), explicit-falsy vs unset primitives, `worktreePath` mint-vs-adopt, re-derivation per call (no state leaks between calls), `runtimeGithubCli` round-tripping through the `runtime-resolved` row, `runtime assert` re-deriving `runtimeHeadless` from the row's `runtime`, and `runtime assert` on a missing / malformed row.

Each of the five phase workflows' Step 2 (Worktree Setup) emits the durable `runtime-resolved` row via `bkit runtime row --file=` and reads it back with `bkit runtime assert` in the same block. Without the row, `bkit prs cross-check` could never see a real `runtimeGithubCli` value and its `false` branch would be vacuous in every live run. `.bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts` asserts the reader / writer chain is present in the workflows — presence, not behaviour; the behaviour guarantee rests on a live run.

`bkit runs dispatch` is the shared CI-Dispatch Gate poll at all 3 call sites (build close-workflow; debug PR-mode close-workflow; debug LOCAL-mode create-pr). `commands/workflow/runs.test.ts` covers its verdicts (`dispatched` / `self-healed` / `no-ci` / `unresolved` and every sub-reason), the one-re-trigger cap, the blocked-sleep hand-off and re-entry, and the `--file` / `--step` verdict row plus the close-transport row; it also covers `bkit runs revalidate` (ship Step 9's presence-only duplicate-dispatch probe OUTSIDE the gate — `--head --dispatch-if-absent`, not the PR rollup: the PR head is ship's `[skip ci]` bookkeeping commit) and `bkit runs context` (auto Step 1). `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` asserts the workflow side — one dispatch block per site taking the re-read labels, the held PR, the status file and step; nothing pushed after it; ship's Step 9 going through `runs revalidate` and its bounded gate-refusal re-entry:

- **Probe:** one dispatch site; bounded `VALIDATED_HEAD` presence probe before it; `ship-revalidate-dispatch` row; head-anchored completion poll.
- **Gate-refusal re-entry:** `REVALIDATE_REASON=gate-refusal` second trigger; lands at Step 9, after the sweep and bookkeeping commit; bounded by `MAX_REVALIDATE_ATTEMPT` (`bkit counters route --limit=`).

Validated-head carry-forward = Tier 1: `commands/workflow/runs.test.ts` (`--validated`, code 17), `commands/workflow/ledgers.test.ts` (`only-bookkeeping`, `--scope=pr`).

`tests/bkit-cloud-bootstrap-preflight.bats` isolates the gh-preflight block inside `.claude/hooks/bkit-cloud-bootstrap.sh` (a tmp git `CLAUDE_PROJECT_DIR` with no `pnpm-lock.yaml`/`.vale.ini`/`.agents/context.md` self-skips the rest of the hook; its `node_modules/.bin/bkit` shims the built `dist/cli.js`, which the hook's `bkit runtime detect` probe and `bkit context list-blocks` provisioning call) — covers: the loud skip without bkit; provision recipes from below `bkit:end` only; sanctioned `GH_TOKEN`/`GITHUB_TOKEN` env preferred over `gh auth login --with-token`; `RUNTIME_GITHUBCLI` recorded loudly every run; the dual-lane WARNING (non-blocking, because SessionStart hooks cannot hard-stop a session) firing only when `BKIT_GH_TOKEN`/`GH_TOKEN`/`GITHUB_TOKEN` are ALL unset.

`BKIT_CLOUD_BOOTSTRAP_SH` overrides the template-relative default script path.

<!-- prettier-ignore -->
| File | Tier | Scope |
| --- | --- | --- |
| `commands/workflow/runtime.test.ts` | Unit (fake `gh` on `PATH`) | `runtime`/capability table mapping incl. `UNKNOWN` + `CLOUD_CURSOR` (marker read from the main checkout inside a worktree), `runtimeHeadless` per runtime and re-derived by `assert`; explicit-falsy vs unset; `gh` probe and exit 127; `worktreePath` mint-vs-adopt; `runtime row` round-trip and NDJSON append; `runtime assert` exits |
| `tests/bkit-cloud-bootstrap-preflight.bats` | Shell (cross-process, fake `gh`, built `bkit`) | `GH_TOKEN`/`GITHUB_TOKEN` precedence over `--with-token`; loud `RUNTIME_GITHUBCLI` record; non-blocking dual-lane WARNING gating; loud skip without bkit; provision recipes via `bkit context list-blocks` |
| `.bkit/core/engine/audits/templates/mcp-toolsets.test.ts` | Unit | `.mcp.json`/template `X-MCP-Toolsets` include `actions`; live == real `buildMcpJson("github")` render of the template |
| `.bkit/core/engine/audits/templates/template-no-userpath.test.ts` | Unit | No leaked `/Users/<name>`\|`/home/<name>` absolute path in the shipped plan template or its repo copy |
| `.bkit/core/engine/audits/workflows/runtime-prose-audit.test.ts` | Unit | Every runtime capability key (`runtimeWorktrees` / `runtimeDevPushes` / `runtimeGithubCli` / `runtimeHeadless`) has >=1 reader in `.bkit/core/workflows/`; `CAN_SLEEP` absent; one identical `gh MCP fallback` header line whose `transport-row` passes `--file`; no raw call-site CI-wait `sleep` — presence, not behaviour |

## Ship merge-gate + bookkeeping test coverage

The ship gate + bookkeeping is a **tiered carrier**: the rule whose failure is unrecoverable is an executable command, `bkit runs gate` (Tier 1, vitest against a stubbed `gh`); the prose invariants are enforced by a vitest markdown-invariant test (Tier 2); the status.jsonl step-set hole detector is a fail-open advisory (Tier 3). The three tiers trade confidence for cost: the merge gate is a gate (a wrong merge is unrecoverable); the prose invariants are a hard CI gate (a regression is a one-line fix); the hole detector is advisory (a noisy day-one gate on a 25-65% holey corpus is muted within a week — decision `384-tier3-promotion`).

### Reusable external-command stub harness (`tests/fixtures/gh/` + `PATH` shim)

The merge gate shells out to `gh api` against the GitHub Actions REST surface. Tests cannot call the real GitHub from CI. The reusable pattern (lift it for any command that shells out to a network CLI):

1. **Stub tree under `tests/fixtures/gh/`** — canned JSON payloads per named behaviour under `runs/`, `jobs/`, `ratelimit/`, dispatched by `tests/fixtures/gh/bin/gh` on `$1/$2` (`api` + the path tail) with the CLI's real exit code. Env knobs (`BKIT_FAKE_GH_API_ERROR`, `BKIT_FAKE_RATELIMITED`, `BKIT_FAKE_RATELIMIT_STATE`) select failure shapes; an unmocked argv exits non-zero, and a `../`-laden SHA is refused.
2. **`PATH` shim per test** — the test prepends `tests/fixtures/gh/bin` to `PATH`, so the command resolves `gh` to the stub with no source edit. The shipped command runs unchanged, so the test exercises the real dispatch, exit-code mapping, and `[bkit-runs]` stderr, not a re-implementation. `tests/gh-stub-smoke.bats` pins the stub itself.

`commands/workflow/runs.test.ts` covers every gate exit code (0/2/10/11/12/13/14/15/16/17/20/80), the `--validated` carry-forward (bookkeeping-only commits on a green head → pass; source change past it → code 17; validated SHA's own CI must be green; non-ancestor → 17), the `--event` filter (a `pull_request` run at the head never counts toward `--event push`, and a newer green PR run cannot mask a red push run), the `BKIT_SHIP_GATE_OVERRIDE=<refused-head>` honoured-vs-ignored split (audit row to `--file`, else stderr), and the `bkit.capstoneJob` / `bkit.ciWorkflow` / `bkit.shipGateRequiredLanes` package.json config resolution. Code 16's opt-in contract has its own block: a skipped lane alone exits 0, the skip is still REPORTED on stderr (never silent), a lane named in `bkit.shipGateRequiredLanes` exits 16, an unrelated declaration does not refuse, and an absent or malformed `bkit.shipGateRequiredLanes` degrades to the empty list. `commands/workflow/ledgers.test.ts` covers the bookkeeping staging (allow-list per scope, empty-pathspec refusal, `--squash-of`, `union` never carrying `.bkit/issues.jsonl`, `only-bookkeeping`); `commands/workflow/worktrees.test.ts` + `worktrees.integration.test.ts` cover the worktree-ownership marker in the outbox; `commands/workflow/workflows.test.ts` covers the Failure Path state (`BOOK_ROOT` lock, sentinel clearing, `handoverNeeded`, labels, failure comment, nothing changed without `--token`), the handover push / ship flush, the close's commit / outbox / comment, `promote` and `links`; `--pr` / `--squash-of` / `--snapshot` / `--record` and `prs merge` are in `runs.test.ts` / `prs.test.ts`. The prose contract (no `git add -A`, staging only through `bkit ledgers`, `{STATUS}` status writes, the merge pinned to the gate's head, canonical 15 step keys, pre-merge pushes confined to Step 2, B2 and Commit + Push Bookkeeping, dev-lock windows only inside commands) is asserted by `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` — Tier 2, a regression is a one-line fix.

### Tier-3 fail-open advisory channel

The status-hole detector (`.bkit/core/engine/checks/status-holes.ts`) is **advisory, fail-open**: its CLI MUST exit 0 with a delta report on stdout (never non-zero), even on a known-holey fixture. A day-one blocking gate on a corpus that is 25-65% holey is noise that gets disabled, and once disabled it stays disabled (decision `384-tier3-promotion`). Promotion to a blocking gate is gated on one release of fail-open signal without muting — recorded in `docs/decisions.jsonl`, cross-linked from deferral `384-promote-status-hole-detector-from-advisory-to-gate`. The detector derives its expected step set from `.bkit/core/workflows/bkit-ship.md` (headings + `step:"ship-*"` literals), NEVER a hand-maintained table.

<!-- prettier-ignore -->
| File | Tier | Scope |
| --- | --- | --- |
| `commands/workflow/runs.test.ts` | Unit (`tests/fixtures/gh/` stub + `PATH` shim) | `bkit runs gate`: every exit code (0/2/10/11/12/13/14/15/16/17/20/80); `--validated` carry-forward; `--capstone-only` (red run with green capstone passes, capstone still running polls); override honoured-vs-ignored; config resolution; code 16 opt-in via `shipGateRequiredLanes`; `--event` filter. Also `runs mirror`, `runs wait`, `runs dispatch`, `runs declared` |
| `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | Unit (markdown-invariant) | No `git add -A`; staging only through `bkit ledgers`; every status write targets `{STATUS}`; the merge pinned to the gate's head (`runs gate --pr` before `prs merge --match-head`); canonical 15 step keys; pre-merge pushes confined to Step 2, B2 and Commit + Push Bookkeeping; dev-lock windows only inside commands; Failure Path = one `workflows fail` + one `workflows handover --flush` |
| `.bkit/core/engine/checks/status-holes.test.ts` | Unit | Expected set derived from source md (no parallel table); path-conditional sets; advisory exit 0 on holey fixture; invented names surface as delta |

## Key test files

<!-- prettier-ignore -->
| File | Tier | Scope |
| --- | --- | --- |
| `.bkit/core/engine/commands/install/doctor.integration.test.ts` | Integration | `bkit doctor` exit 0 and Phase 1 and Phase 3 advisory replay. |
| `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` | Integration | design / plan close `branches land` line run verbatim (local runtime) against a real remote + worktree: refused squash and conflict-dropped doc keep `feat/{FID}` and leave `dev` unmoved; another session's staged doc stays out of the close commit; clean close lands the branch copy, then deletes the branch. |
| `.bkit/core/engine/commands/install/uninstall.test.ts` | Unit | `runUninstall` orchestrator — format-aware decision matrix (fully-managed / markered-text / byte-equal-text), dry-run, idempotency, `--nuke`; `docs/*.md` block strip (managed marker included, consumer content kept) and `docs/templates/bkit-*.md` deletion on a full uninstall only. |
| `.bkit/core/engine/commands/install/uninstall.integration.test.ts` | Integration | Round-trip byte-identity vs `tests/fixtures/heavy-customised-consumer/`; opencode uninstall zero-footprint (P4.T7). |
| `.bkit/core/engine/install/manifest.test.ts` | Unit | Per-module install-write manifest assertions. |
| `.bkit/core/engine/install/write.integration.test.ts` | Integration | Consumer key survival through `writeTier2JsonContained` (heavy-customised fixture, cursor v1 schema); opencode reconverge. |
| `.bkit/core/engine/commands/install/upgrade.test.ts` and `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | Unit and Integration | Diff engine, drift detection, `--non-interactive` semantics. Managed-version marker guard: every non-JSON, non-template file a real full install writes carries the marker and equals `listStampedFiles`; a version bump restamps every marker with no conflict and `bkit check` is then clean. A 5.1.0 Antigravity `hooks.json` (fixture `tests/fixtures/antigravity-5.1.0/hooks.json`) upgrades onto the shipped matchers (guardrails on `view_file\|run_command`). |
| `.bkit/core/engine/install/version-file.test.ts` (extended) | Unit | `.bkit/version` JSON parse (non-JSON reads as absent), `canonicalHashes` / `claudeAllowDerived` defaults, serialize round-trip, `mergeCanonicalHashes` (fresh entries overwrite; entries for paths no longer on disk are pruned and counted). The install and upgrade writers of the same merge are pinned in `install/modules/core.integration.test.ts` (a seeded stale entry is dropped by a core run) and `install/version-file.integration.test.ts` (a prune-only upgrade run is persisted; nothing is written when nothing changed). |
| `.bkit/core/engine/audits/hooks/gateguard-claude.integration.test.ts` | Integration | Claude GateGuard hook (`.claude/hooks/bkit-gateguard.cjs`, spawned as a real process): advisory / deny modes, dedup, docs/\*.md density advisory (path-scoped, segment match). |
| `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` | Unit | opencode GateGuard plugin: subagents included, advisory / deny modes, dedup, docs/\*.md density advisory, managed-block boundary (no `export` inside the marker region), twin parity vs the Claude hook. |
| `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` | Integration | Cursor GateGuard hook (`.cursor/hooks/bkit-gateguard.cjs`, spawned): advisory via `additional_context` on an allow, deny via `agent_message`, workspace-relative path resolution, managed-block parity with the Claude twin. |
| `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` | Integration | One GateGuard behaviour table asserted on all five hosts' generated hooks (template + `hooks/`, as install writes them) through per-host adapters — advisory content, docs density, dedup, modes, fail-open, subagents included — plus the documented deviations; every host's block carries `gateguard-engine.js` verbatim. |
| `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts` | Integration | Antigravity guardrails hook on the host's live-verified `{ toolCall, conversationId }` / `{ decision, reason }` contract: deny tier every time, ask tier → Antigravity `ask`, advisory tiers deny once then allow the identical retry, other tools allowed, fail-open. `view_file` secret reads: `*.pem` / `*.p12` / `id_rsa` deny every time, `.env` / `.bkit/.env` / `.env.*` ask, ordinary files and `.env.example` allow; shipped `hooks.json` registers guardrails on `view_file\|run_command`. |
| `.bkit/core/engine/audits/hooks/readguard-parity.integration.test.ts` | Integration | One ReadGuard behaviour table asserted on all five hosts' generated hooks through per-host adapters — repeat / sub-range / wider / changed-file reads, shell-read forms and untracked shapes, sessions, `BKIT_READGUARD=off`, compaction reset — plus host registrations, documented deviations (subagent key, Antigravity envelope, opencode whole-file read, fail-open) and managed-block structure. |
| `.bkit/core/engine/audits/hooks/gateguard-dogfood.integration.test.ts` | Integration | bkit-repo-only authoring advisories (`.bkit/core/workflows/`, `.bkit/core/prompts/`, bkit's own `.md` docs, `.agents/rules.md` § Repo Authoring prose scope) in all four installed hooks: routing per host, placement after `bkit:end`, never present in a template, rule-coverage vs the source sections, shared rules read from the source at hook time, every path the Repo Authoring rules name exists. |
| `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | Unit | Every template has an entry; each repo-root copy equals the template after its listed edits (placeholder / adapt / bkit-only), else the test fails. Change a copy → list the edit there. |
| `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | Integration | Cursor destructive-op / secret-exposure hook (`.cursor/hooks/bkit-guardrails.cjs`, spawned): shell deny / ask patterns, curl-wget host allowlist, private-key and `.env` reads, managed-block boundary. |
| `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` | Integration | Claude and Cursor `bkit-preflight.sh` as generated (spawned under bash): IDE-skip paths, missing key / issue hard-stops in each host's output shape, the shared Linear guard carried verbatim, no call into bkit. |
| `.bkit/core/engine/render/parts.test.ts` | Unit | `renderParts` part-line splicing (JS and shell markers, no nesting, missing part throws); the nine host hook templates splice parts only inside the managed block, every part is used by two or more hosts, and every generated hook passes `node --check` / `bash -n`. |
| `.bkit/core/engine/install/modules/index.integration.test.ts` | Integration | One canonical permission-gate table asserted across Claude `settings.json`, opencode `opencode.json`, Cursor `bkit-guardrails.cjs` and Codex `bkit-guardrails.cjs` — same verdict for every destructive command on all four hosts; secret reads asserted on opencode, Cursor and Antigravity `bkit-guardrails.cjs` (Codex has no read gate, see deferrals). Plus shell-as-edit-channel advisories, curl / wget host matching, and the documented per-host divergences. |
| `.bkit/core/engine/commands/workflow/context.test.ts` | Unit | Untrusted-content fence: identical at every workflow write site, no second fence from shipped fetch blocks, `Context:` names untrusted `Read:` paths. |
| `.bkit/core/engine/commands/conventions.test.ts` | Unit | `bkit <noun> <verb>` conventions over `commands/registry.ts`: kebab nouns / verbs / flags, camelCase output keys, own exit codes in 3-79, every exit code a source can return (its `EXIT_*` constants and exit-code maps) listed in some verb's `--help` table, every exported command present in `COMMANDS`, every source in `commands/{workflow,ci,setup}/` tested and writing only via `ctx.log` / `ctx.emit`, every `shared/*.ts` tested; checker negative controls (including a help check that fails). |
| `commands/lib.test.ts` | Unit (boundary: real temp git repo + linked worktree) | Flag parsing and usage errors (a literal `{UPPER}` placeholder in any flag or positional value refused, exit 2), dispatch and classic-verb collision (`bkit status`), help rendering, exit-code mapping, UTC month, skip-CI tokens, repo root from a worktree, `status.jsonl` location per workflow kind. |
| `commands/workflow/status.test.ts` | Unit | `bkit status path / route / meta`: location per workflow kind, active-run verdict / failures, all-runs strategy + next rung, run-level mode over step mode, `--require` failures, `route --expect=field=value` (exit 4 when it differs or is missing), meta append + validation; the fold skips a row it does not model, a line that is not JSON exits 3. |
| `commands/workflow/counters.test.ts` | Unit | `bkit counters derive / run / route / max`: the three positions, `current` refusing 0, active-run scoping, sub-plan isolation (empty `--sub-plan` rejected), `--since`, de-dupe, metacharacter step names, run numbering incl. resume + interleave (a resumed build after an interleaved debug run resets its budget), two `soakEntryAt` markers in one second fold to one, fail-closed value / max (max 0: value 0 continues, value 1 routes to `exceeded`), `--limit`, `route --of=<step>:<pos>` deriving the value (sub-plan scoped, `current` with no own row → exit 4), thresholds. |
| `commands/workflow/steps.test.ts` | Unit (boundary: real temp git repo + failing pre-commit hook) | `bkit steps done / verdict / gate`: `parentSha` captured before the commit, `--attempt=next`, `--attempt=0` written, `--commit=none`, extra fields, artifact / verdict / failures / strategy validation, a complexity `verdict` from the agent's own set, a PR URL in `artifacts`, `timeout_s` kept, commit failure exit, header parse + PENDING / missing / invalid exits, allowed values from the prompt's `Verdict:` line, gate pass + each failing check, gate failing a row missing its `attempt` / `strategy` / `scope`, `ROW_FIELDS` held to every workflow `steps done` / `steps finish` call (an `--agent` whose prompt declares `Strategy` counts). `bkit steps finish`: header read, attempt derived and `<attempt>` filled, row + commit + comment; PENDING (5) / missing declared field (6) re-ask with nothing written; a row missing a gate field refused before writing; worst verdict + summed failures across agents; header `Strategy` on the row; `--count-field`; `<done>` + fallback; `--docs-only` (9). `bkit steps stub` (`--strip-header`, missing source 4). Gate `--placeholder` without a status file, `--fid` shape, `--attempt-of`. |
| `commands/workflow/runtime.test.ts` | Unit (fake `gh` on `PATH`) | `bkit runtime detect / row / assert` — see § Runtime detection. |
| `commands/workflow/repo.test.ts` | Unit (boundary: real temp git repo) | `bkit repo info`: owner / repo from `gh`, else the origin remote; neither → exit 3; detached HEAD → exit 4 unless `--allow-detached`; `behindDev` / `divergedAgo`, null (never a false 0) when `origin/dev` is unknown; `--fetch` failure logged, not fatal; `repoRoot` / `bkit` / `outboxRoot` name the main checkout from a worktree too. |
| `commands/workflow/fids.test.ts` | Unit | `bkit fids check / parse`: per-tracker shapes, `any` for CI_DEV, linear lowercased, tracker from the main checkout's `package.json`; marker beats branch, malformed or foreign marker falls through, neither → exit 3. `bkit fids find --issue`: one (0) / none (1) / several (4), never a longer issue number, Linear case-insensitive; auto's FID entry points go through `runs context`. |
| `commands/workflow/tests.test.ts` | Unit (boundary: real subprocess) | `bkit tests run`: deepest declared gate wins, an empty script is not declared; PASS / FAIL with the log always saved; no gate declared → exit 3; runner could not run → exit 4 (never FAIL); runs at the checkout top; `--tail`. |
| `commands/workflow/locks.test.ts` | Unit (boundary: real temp git repo + linked worktree) | `bkit locks acquire / release`: month bucket (existing, UTC new, split refused); live vs reclaimable holder (a step in the last 30 minutes is live; an idle, finished or log-less holder is reclaimed whatever the lock file's age; worktree copy first); ship book root; dev lock deadline / wait; release by token, never another owner's. |
| `commands/workflow/workflows.test.ts` | Unit (boundary: real temp git repos + bare remote) | `bkit workflows start / fail / handover / close / promote / links`: run opened vs resumed, `--lock-held`; failed row, own-lock release, rebase abort only when in progress, sentinel clearing, `handoverNeeded` (incl. debug `SOAK`), nothing changed without `--token` (empty values count as absent), labels, failure comment from `--error-file`; handover `--push` (missing → 8, open PR → 9 with no link, pushed → linked comment) and ship `--flush` (one FAILED commit, nothing-to-commit, worktree logs copied); compliance rows before counter + outcome rows, `planSource`, unwritable stats never failing the close, ship size + coverage, artifact links, `--message` commit with the exact-match auto-route marker and `--verbose-ci-local`, `--record-step`, `--outbox` + `--number` comment; promote (`--resolve`, exit 12, archive of a changed canonical, anchor from the base commit, plan children + name rewrite); links (comment, branch name in URLs). |
| `commands/workflow/worktrees.test.ts`, `worktrees.integration.test.ts` | Unit and Integration (real git remote) | `bkit worktrees setup / remove`: adopt in place, debug / ship branch rules, mint off a freshly fetched `origin/dev`, resume rebase + sentinel, `bkit.worktree.copy` list with missing entries narrated, install in every workflow (design / plan included), install failure vs could-not-run exits, `--detect` taking mint vs adopt from the runtime (exclusive with `--worktrees`), ownership marker, removal only of a marked worktree, `--branch` deleting the local and remote branch unless another worktree holds it (`branchBlockedBy`). |
| `commands/workflow/branches.test.ts` | Unit (boundary: real temp git repos) | `bkit branches rebase / anchor-stamp / anchor-read / push / sync / switch`: ledger union byte-identical to `merge=union`, lockfile from the rebase target then regenerated, refuse-before-mutate; idempotent anchor stamp, `--base-ref` override; `--against` skip exits; one `git push`, lease only off `dev`/`main`, `--require-ci`, abort guard + `--open-pr`; docs-from-dev merge; switch under the dev lock (82 on CI-running local commits, 16 on a failed install); a refused rebase whose `--abort` fails reports `aborted: false` and `ABORT FAILED`. `bkit branches land`: workflow refusal, stray main-checkout artifacts (17), local squash → `design DONE` commit pushed + audited, non-doc files refused (17), PR shape handing the PR to MCP (80, stage `open`) after pushing the roadmap commit; the full local close is also run from the workflow in `close-squash.integration.test.ts`. |
| `commands/workflow/skills.test.ts` | Unit (stub skills CLI) | `bkit skills prune`: union of folders and lock keys, never `bkit-*`, whole-name and literal matching, skips with a warning (exit 0) without `.agents/skills.md`, CLI failure and could-not-run warned and listed in `failed` (exit 0). |
| `commands/workflow/prs.test.ts` | Unit (stub `gh`) | `bkit prs open / probe / merge / verbose-ci / scan-body / cross-check / transport-row`: marker first in every body, open-PR refusal vs reuse, one retry, base read-back, 80 with the printed title / body; probe states; merge (empty body, `--match-head`, `--delete-branch`, exact-match auto-route subject, already-merged skip, `--expect-merged` 7, 80); verbose-ci on / off / no-op / 5 / 80; body-only token scan; fallback-row cross-check; `transport-row --scan` (clean, token recorded then exit 1, unreadable 8, `--cross-check` refusal unrecorded). |
| `commands/workflow/issues.test.ts` | Unit | `bkit issues text / labels / comment`: generated drop before the last-marker cut, oldest-first sort; phase vs additive label arithmetic, `merged` clears `bkit:failed`, board payloads from `bkit.githubProject`; comment bodies, defused cut marker, fenced stderr, `--error-file`. Never shells out, because tracker writes stay on MCP. |
| `commands/workflow/runs.test.ts` | Unit (`tests/fixtures/gh/` stub, stub `gh`) | `bkit runs gate / mirror / wait / dispatch / revalidate / context / declared` — see § Ship merge-gate. Gate `--pr` / `--squash-of` heads, title skip token (18), `--snapshot` written before deciding, `--record` refusal / `ship-merge-ci` rows, unreadable PR (20); revalidate with no head move, unreadable PR (1), 80, bad `--reason`; auto context BRIEF / CI_DEV (slug refused, 9) / CI (marker, branch fallback, not open 7, no run 8, unknown phase 3, 80); dispatch `--file` / `--step` row + close transport. |
| `commands/workflow/ledgers.test.ts` | Unit (boundary: real temp git repo) | `bkit ledgers commit / union / only-bookkeeping`: allow-list per scope, unmatched glob never aborts, empty pathspec refused (exit 6), staging failure no false success, `--squash-of`, `--only-if-dirty-tracked`; union append-only, never `.bkit/issues.jsonl`; carry-forward range check. |
| `commands/workflow/context.test.ts` | Unit (boundary: real `bash` for blocks) | `bkit context clamp / clamp-log / ledger-scan / list-blocks / run-block / finalise`: both profiles read against the clamped FILE, in-place loss markers, ceiling; ranked ledger scan; block parsing by ordinal; fence written byte-for-byte, clamp inside the fence; finalise verdict / contexts / records; `finalise --record` writes + commits the `context-fetch` row and prints the comment (`--file` required). |
| `commands/workflow/roadmap.test.ts` | Unit (real fixture ledgers, real git remote for `mirror`) | `bkit roadmap fold`: ledger projection, deterministic regenerate, `ABANDONED` hidden, fail-open on malformed / absent ledger and unwritable board, consumer text preserved, notes blocks, `## Shipped` cap, marker self-heal. `feature --strict` (exit 1 when not appended). `mirror`: worktree row then the same row committed + pushed on dev under the dev lock, adopt mode mirrors nothing, a refused push never fails the close. |
| `.bkit/core/engine/ledgers/clamp-log.test.ts` | Unit | Clamp record log path (checkout `tmp/`, attempt suffix, non-git fallback) and reading (never drained, malformed line reported, missing log empty). |
| `commands/workflow/workstreams.test.ts` | Unit | `bkit workstreams parse / comment`: `WS-N` blocks and `Requires`, none → exit 3, comment body equal to the `bkit-design.md` template. |
| `commands/ci/ci.test.ts` | Unit + real `slop-scan` | `bkit ci slop`: net-finding / net-score gate, base resolution (`--base`, bare argument, `$SLOP_BASE_REF`, merge-base fallbacks, skip when absent or HEAD), slop-scan could-not-run vs failed, base worktree removed on SIGTERM. `bkit ci prose` (fake vale): glob selection, vale exit mapping, skip when vale / files absent, write-good restore from the main worktree else `vale sync`. `bkit ci skip-token`: token in subject or body, `--ref`, unreadable commit. |
| `commands/setup/setup.test.ts` | Unit (stub `gh`) | `bkit setup protect-main`: policy payload requiring `bkit.capstoneJob`, pre-flight on the CI workflow and job name, `--dry-run`, `--print`, unauthenticated vs missing `gh`. |
| `.bkit/core/engine/shared/settings.test.ts`, `package-json.test.ts`, `package-manager.test.ts`, `timeouts.test.ts`, `egress.test.ts` | Unit | `package.json` `bkit` settings with per-key defaults (`ciWorkflow`, `capstoneJob`, `worktree.copy` / `install`, tracker, board, required lanes); `package.json` edits; package-manager commands and could-not-run codes; the `TIMEOUTS` table; egress registry shape (bare lowercase hostnames, no duplicates, provider key placeholders). |
| `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | Unit (markdown-invariant) | Shapes commands and routes depend on: one bkit lookup per workflow held as `{BKIT}`, Step 1 FID check + `fids find` + gated FID / lock in every phase workflow, pre-worktree commit `--root`, one `workflows fail` per Failure Path (error via `--error-file`, no heredoc), build / debug `handover --push` and ship `--flush`, build clamp flags as separate arguments, the committed test log and Step 15 reading it, challenge attempt via `--attempt-of`, PR URL in `artifacts`, the exit 5 / 6 re-ask Finish line and no `steps verdict`, the four `status route --require=strategy` sites, auto's single `runs context`, 3600s Timeouts line, Large Diff Guard on its own line, ship `runs gate --squash-of` / cleanup / skill prune / `runs revalidate` / `prs merge` / `workflows close --flush`, design / plan close through `promote` → `land` → `links`, Locks lines without a lock-age wait. |
| `.bkit/core/engine/audits/workflows/workflow-fence-syntax.test.ts` | Unit (real `bash` / `zsh`) | Every fenced shell block in `.bkit/core/workflows/*.md`, placeholders replaced, parses under `bash -n` and `zsh -n` (zsh half skipped when zsh is absent). |
| `.bkit/core/engine/audits/templates/template-ci-yml.test.ts` | Unit (YAML via the `yaml` devDependency; `tests/fixtures/gh/` stub) | The template `bkit-ci.yml`, placeholders filled, parses as YAML with the capstone needing every other job, passes actionlint (skipped when absent); `bkit runs gate` finds the capstone among the template's job names and refuses when it fails. |
| `.bkit/core/engine/audits/templates/template-path-refs.test.ts` | Unit | No workflow, prompt or `.bkit/wording.md` names a template path. The forbidden names come from `.bkit/templates/` itself (its CI workflow files, `scripts/` folders) plus `.husky/`, `.vale*`, `.lintstagedrc.json`, `slop-scan.config.json` and `.envrc`, so a new template is covered without editing the test. |
| `.bkit/core/engine/tools/wording.test.ts` | Unit | `.bkit/wording.md` against run-time enumeration of `.bkit/core/prompts/`, `.bkit/core/workflows/`, the `.agents/rules.md` managed block, and the managed block of every `.bkit/core/docs/templates/bkit-audit-*.md` plus its adopted copy in `docs/templates/`: per-surface mode (required / where-used / repeatable / forbidden / if-verdict / if-bash), near-copies (checkbox stripped; a line carrying a sibling clause verbatim is not one), retired wordings, anchored templates, header order, unlisted sentences per surface cut-off (5+ prompts, 3+ workflows, 5+ audit templates; split at `.` and `;`, near-copies counted, adopted copies counted once, headings / HTML comments / table rows skipped), every clause reaching one surface's cut-off, sync idempotence (template and adopted copy rewritten alike), `.agents/rules.md` group headings, external-input legs, the `.bkit/core/.bkit/prompts.md` untrusted-input doctrine row (universal policy named, retired scoped policy not restated — the catalog sits outside the corpus, so nothing else would red on a silent reversion), checker negative controls. |

## Roadmap fold test coverage

`docs/roadmap.md` is a generated artifact over one input: the canonical `.bkit/issues.jsonl` feature ledger. `bkit roadmap fold` rewrites the whole generated region and runs at every phase close. `commands/workflow/roadmap.test.ts` exercises it over fixture ledgers in a temp checkout (no mocks at the boundary); a real workflow close is the runtime ground-truth.

<!-- prettier-ignore -->
| File | Tier | Scope |
| --- | --- | --- |
| `commands/workflow/roadmap.test.ts` | Unit (real fixture ledgers) | Ledger projection under `tracker: none`; deterministic / idempotent regenerate; status projection incl. `ABANDONED` hidden; fail-open exit 0 (malformed line skips only its row; absent ledger bootstraps; unwritable board left as-is); consumer text byte-unchanged; duplicate-line collapse; `## Shipped` capped at 10; marker repair; no tracker block rendered. |
| `.bkit/core/engine/audits/workflows/ship-verdict.integration.test.ts` | Integration | Ship Step 6 `roadmap feature --strict` line run verbatim: the `SHIPPED` row lands in the worktree ledger; an unwritable ledger or a crashed command stops the step. |

## Compliance grader test coverage

**Boundary: git diff** — `.bkit/core/engine/commands/comply.integration.test.ts` uses temp git repo + real `git diff parentSha..HEAD`; no mocks at boundary. Canonical pattern for git-diff validation.

**Pattern:**

```typescript
gitInit(tmpDir);
// Parent commit
const parentSha = commit(tmpDir, "init");
// Introduce the change to flag
fs.writeFileSync(path.join(tmpDir, ".claude/agents/x.md"), "# edited\n");
commit(tmpDir, "feat: mirror edit");
// Run with realGitAdapter (the production git adapter — no mocks)
const violations = runGrader({ parentSha, phase: "ship", gitAdapter: realGitAdapter, cwd: tmpDir });
```

**Gate-wiring audit** — `.bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts`: every phase workflow closes through exactly one `workflows close` that commits what it graded and writes `close-telemetry.md` for the close comment; no workflow calls `bkit comply` itself (`workflows close` grades first — `commands/workflow/workflows.test.ts`, `commands/comply.test.ts` `gradeCompliance`).

<!-- prettier-ignore -->
| File | Tier | Scope |
| --- | --- | --- |
| `.bkit/core/engine/shared/protected-paths.test.ts` | Unit | Drift test: committed `.cjs` === `generateGatePathsCjs()` output; `isMirrorPath` / `isGateConfig` correctness. |
| `.bkit/core/engine/commands/comply.test.ts` | Unit | `ruleNoMirrorEdit`, `ruleSkipCiNotHead`, `runGrader`, `buildComplianceRows`, `formatComplianceSummary` — determinism, pass / fail, row shape (`bkitVersion` on every row); `gradeCompliance` (the pass `workflows close` runs first): one row per rule, violations returned, fail-open with no commits or an unwritable stats file. |
| `.bkit/core/engine/commands/comply.integration.test.ts` | Integration (boundary: git diff) | Temp git repo and `realGitAdapter`; asserts `no-mirror-edit` flagged on actual diff output. |
| `.bkit/core/engine/audits/workflows/comply-gate-wiring.test.ts` | Integration (boundary: workflow files) | Grep-based audit: one committing `workflows close` per phase, `--outbox` telemetry embedded in the close comment, no direct `bkit comply`. |

## opencode host test coverage

<!-- prettier-ignore -->
| Matrix row | Test location | Signal |
| --- | --- | --- |
| install-flag CLI selection | `.bkit/core/engine/cli.test.ts` (plan-v4-2 Task 2.3) | `--opencode=<provider>` sets provider correctly |
| install-flag selection and `bkit doctor` / `bkit status` | `.bkit/core/engine/cli.test.ts` (plan-v4-3 Task 4.1) | additive install; doctor / status verbs |
| opencode manifest round-trip | `.bkit/core/engine/commands/install/uninstall.integration.test.ts` | install → zero drift → uninstall → zero `.opencode/` footprint |
| opencode reconverge on upgrade | `.bkit/core/engine/install/write.integration.test.ts` | consumer keys in `opencode.json` survive; bkit keys reconverged |
| GateGuard opencode plugin | `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` | advisory fires, subagents included, dedup, docs density advisory, managed-block boundary |
| GateGuard markered-text | `.bkit/core/engine/install/modules/claude.integration.test.ts`, `.bkit/core/engine/commands/install/upgrade.test.ts`, `.bkit/core/engine/commands/install/upgrade.integration.test.ts` | install and upgrade engines: fresh install writes the slash-comment block, a marker-less consumer file gets the block appended, upgrade round-trip refreshes the block while preserving consumer content outside it |
| end-to-end (manual) | `e2e-verdict.md` (Task 5.1) | § Manual recipe — opencode E2E |

## Manual recipe — opencode E2E (Task 5.1)

Run once a live provider (OpenRouter or an opencode gateway) is available:

1. `bkit install --opencode=openrouter` (or `--opencode=opencode-go`) in a clean consumer repo.
2. Confirm `.opencode/` tree: agents, commands, `opencode.json`, `plugin/bkit-gateguard.js`. Seeded agents carry the curated per-agent pins for the chosen provider; consumer tunes per-agent.
3. Confirm `bkit check --opencode` exits 0, `bkit status` shows opencode host and provider, and `bkit doctor` reports the provider's API key as PRESENT.
4. Launch opencode; run `/bkit-plan #<issue>`; confirm subagents dispatch and verdicts collected.
5. Confirm provider served the subagents (opencode logs / provider dashboard — not model identity self-report).
6. Edit a `tsconfig.json` in the opencode session; confirm GateGuard plugin injects advisory.
7. Record outcome in `docs/plans/202606/logs/245-opencode-provider-host/e2e-verdict.md`.

Smoke test is load-bearing — catches `Missing model lookup for {agent}` before publish. Add Scenario per new consumer input shape. **If consumer can hit it, CI must hit it first.**

## Spawning `bkit` from tests

Use project-local `tsx` binary. Do NOT `node --import tsx/register`, because `ERR_MODULE_NOT_FOUND` exit 1 passes vacuous exit-code checks. Pattern:

```ts
const tsxBin = path.resolve(__dirname, "../../node_modules/.bin/tsx");
if (!fs.existsSync(tsxBin)) return; // CI without devDeps — skip rather than fail
const result = spawnSync(tsxBin, [bkitInstallPath, "install", "--claude", "--cursor"], {
  cwd: tmpDir,
  encoding: "utf-8",
  timeout: 60_000,
});
expect(result.status, `install crashed:\n${result.stdout}\n${result.stderr}`).toBe(0);
```

`install` requires ≥1 module flag, because bare / dropped flags exit 1. Spawn explicit module set under test.

Assert ≥1 positive signal (`[bkit-install]` prefix, exit 0 with reason, or file exists), else binary-not-found exit 1 passes vacuously.

## Filesystem consumer-repo boundary pattern

Harvest boundary tests: real `os.tmpdir()`, `fs.stat`/`fs.readFileSync` ground truth — NO mocks.

1. `fs.mkdtempSync` → temp consumer tree.
2. Write fixture to `consumerPath/.bkit/stats.jsonl`.
3. `snapshotFile` BEFORE harvest.
4. `runHarvest(bkitRoot)`.
5. `snapshotFile` AFTER harvest.
6. `fileUnchanged(before, after)` — content + size byte-identical.
7. `harvest/stats.jsonl` gained expected rows.

**Per-file invariant.** `stats.jsonl` copy-only → step 6 MUST pass. `friction.jsonl` MOVE → prune after store; `fileUnchanged` false by design.

Pruning makes store sole copy until commit — property-test destructive half: store accumulates, malformed never pruned, absent rows left. See `.bkit/core/engine/commands/harvest.integration.test.ts`.

Any read-only filesystem invariant: step 6 = `fileUnchanged` (not mtime). `afterEach(() => fs.rmSync(tmpDir, { recursive: true }))`.

## What not to test

- `.claude/` / `.cursor/` mirror contents — generated at install; test transforms (`applyT1`/`applyT2`/`applyT3`) + `dispatchModules`, not snapshot regen.
- Real `gh`/`vercel` CLIs — stub via `process.env`.
- Network — isolate `.bkit/core/engine/install/placeholders.ts` behind injectable resolvers.

## CI execution

`.github/workflows/bkit-ci.yml` is the template `.bkit/templates/.github/workflows/bkit-ci.yml` with the adaptations `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` lists. It runs a 5-job scaffold on every push to `dev` / `main` and PRs into them — a **flat DAG**: `bkit-tests-scope` fans out to every lane, the capstone joins them, so wall-clock == the slowest single lane. One run per branch or PR: a newer run cancels the older one on every event (template `concurrency`). bkit has no browser / DB / deploy, so there is no `bkit-tests-build` / `-e2e` / `-migration` / `-live`:

1. **`bkit-tests-scope`** (always-on planner; no `if:`, never skips) — reads markers, computes `run_level` (`[skip ci]` → none, a hard veto over any force marker; `[force build]` / `[force full]` / PR / `workflow_dispatch` / push-to-`main` / direct `dev` push → full; merged-PR `dev` push → light; `commits/{sha}/pulls` API error → full, run-to-be-safe), emits the `bkit-test-plan` JSON via `steps.scope.outputs.plan` and a `$GITHUB_STEP_SUMMARY` table. Markers are read from the commit message (push) or the PR title (`pull_request`) only, so **none** of them apply on a `workflow_dispatch` — steer that path with workflow inputs (`deployments.md` § Commit-message force tags). It is the PLANNER, not a test lane, but it lives in the `bkit-tests-*` namespace, so any guard treating every `bkit-tests-*` job as a lane must exempt it BY NAME.
2. **`bkit-tests-static`** (`if: run_level != 'none'`) — static-analysis lane, run on a CLEAN tree (no test artifacts): `pnpm typecheck` → `pnpm format:check` → vale prose lint → `pnpm lint:slop` → slop delta (PR-only) → actionlint → `pnpm bkit check` (drift gate) → `pnpm bkit:check:dist` (rebuilds `dist/`, fails on drift) → `pnpm bkit:audit:status` (Tier-3 status-hole detector over `docs/plans/*/logs/*/status.jsonl`). The status-hole step is the ONLY non-blocking step in this lane — the detector exits 0 even when it finds holes and the step appends `|| true`, so it can never fail `bkit-tests-static`. Keep it wired: promotion to a blocking gate is gated on accruing fail-open signal, which requires a live caller (contract: § Tier-3 fail-open advisory channel). Checks out at `fetch-depth: 0` so slop delta can materialise the PR base as a worktree. Vale is installed in-lane (pinned tarball, sha256-verified before extract, then `vale sync`) — the runner has none and `.vale/styles/` is gitignored, so without it `pnpm lint:prose` guard-skips and the prose gate is silently dead. Also carries the non-blocking promotion-lag warning on `dev` pushes (see `docs/deployments.md` § Promotion-lag warning). A SHA-cache step short-circuits a SHA already green in the last 7 days; `[force build]` / `[force cache]` bypass it.
3. **`bkit-tests-unit`** (`if: run_level != 'none'`) — unit-test lane: runs `pnpm test:coverage:unit`, then the bats shell tier (`npx --yes bats tests/*.bats` — the bkit-cloud-bootstrap gh preflight, the `gh` stub harness and the release-PR mirror script, logic vitest cannot reach because it lives in shell). The gate command itself lives in the `test:coverage:unit` **package.json script** — unit suite (`--exclude '**/*.integration.test.ts'`), `--coverage.include` scoped to the logic surface (the files its flags list plus every `.bkit/core/engine/commands/**/*.ts`; `install/modules/` is measured on the integration lane only), and the branch-coverage floor `--coverage.thresholds.branches` (currently `70`, set just below current and ratcheted up; it lives on the unit run only — vitest coverage is per-run, so a `vitest.config` block would gate both lanes). **SINGLE SOURCE:** `/bkit-build`'s pre-PR gate runs the SAME script, so a coverage drop fails in the worktree before this lane sees it — bump the threshold in `package.json` and both callers move together. The CI step only appends the JSON reporter emitting `tests_ran`. On PRs it posts a `name: unit` coverage comment via `davelosert/vitest-coverage-report-action` (skipped on fork PRs, because the token is read-only). Needs the job-level `permissions:` block (`actions: read` and `contents: read` and `pull-requests: write`) — job-level permissions REPLACE the workflow-level block, so `actions: read` must be re-declared for the SHA-cache `gh run list`. Same SHA-cache short-circuit as static. **`.bkit/core/engine/cli.ts` reads low on this gate on purpose** — `.bkit/core/engine/commands/install/install.integration.test.ts` spawns `tsx` dozens of times against its un-exported `main()` dispatch (real CLI process per scenario), which in-process v8 coverage cannot see; only the handful of pure decision functions pulled out of `main()` for direct unit testing (e.g. `validateModuleFlagsForVerb` in `cli.ts`, `validateCloudTrackerMatch` in `commands/install/install.ts`) register here. A low `cli.ts` % on this lane is a spawn-tested blind spot, not evidence of missing coverage: the integration lane's executed-count + the Consumer-runtime parity rule (below) are the CLI dispatch's real gate.
4. **`bkit-tests-integration`** (`if: run_level != 'none'`) — integration-test lane (parallel sibling): `vitest run --coverage` over `*.integration.test.ts`, scoped via `--coverage.include` to the engine surface (`modules` / `install` / `upgrade` / `uninstall`), emitting its own `tests_ran`. **Report-only** (no threshold, because a whole-repo integration % is denominator-noise and punishes the pyramid shape); posts a `name: integration` coverage comment. A separate lane per tier — mirrors how consumer repos run it and dogfoods the shipped scaffold. Own job-level `permissions:` and SHA-cache.
5. **`bkit-tests-check`** (capstone, `if: !cancelled()`) — asserts `bkit-tests-scope` succeeded and, when `run_level != none`, `bkit-tests-static` and `bkit-tests-unit` and `bkit-tests-integration` all succeeded **and unit and integration each executed > 0 tests** (per-lane `assert_ran` over each lane's `tests_ran`; a SHA-cache short-circuit (`cache_skip`) or `run_level=none` asserts nothing). This is the SOLE branch-protection required check (`bkit setup protect-main`, which requires `bkit.capstoneJob` = `bkit-tests-check`) — green here means the planned suite actually ran, not merely "nothing failed".

Release workflow (`.github/workflows/release.yml`, tag-triggered) re-runs the static and test steps (typecheck → test → format:check → prose → slop → bkit:check:dist → `CHANGELOG.md` tag block) before `npm publish`; the `pnpm bkit check` drift gate is intentionally omitted, because the tagged tree should already match dev's clean state.
