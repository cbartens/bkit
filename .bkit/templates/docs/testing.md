<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Testing

> [!CAUTION]
> **Purpose:** Testing strategy — tier boundaries, framework choices, naming conventions, CI execution.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; NO filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Describe current state / rules, NOT reasons / history; state what to do, NOT why.
> - Check `.agents/docs.md` index first and confirm topic belongs in THIS doc, not another.
> - Tiers strictly separated — Static · Unit · Integration · E2E · @live · Smoke.
> - Pre-push: `pnpm bkit:gate:static-unit`, then `bkit check`; the `.husky/pre-push` template runs `bkit:gate:static` (no tests) on revert branches / commits. Gate scripts are consumer-owned; bkit's default = typecheck + lint + format:check + prose + slop:delta + `pnpm test` (unit + in-process integration). E2E, @live, service-backed integration excluded (CI — see below). NEVER `--no-verify`.

## CI test tiers (the bkit scaffold)

CI runs tiers through bkit scaffold — **one parallel lane (job) per tier**, not steps in one job (step-by-step: `.github/workflows/ci.yml` § "FULL CI SCAFFOLD REFERENCE"; run-level shape: `deployments.md` § Run-level decision matrix).

Graph **flat and wide** for static/unit/build/integration: scope fans out; capstone joins. **One exception:** when `bkit-tests-migration` owns the shared-remote migration apply, e2e/live `needs:` that lane (ordering) — never gate live behind static/unit/build/e2e:

```
  bkit-tests-scope ─┬─ bkit-tests-static
    always-on        ├─ bkit-tests-unit
    never skips      ├─ bkit-tests-build-web
    (~15s)           ├─ bkit-tests-integration
                     ├─ bkit-tests-build-ios
                     ├─ bkit-tests-build-android
                     └─ bkit-tests-migration ─→ bkit-tests-reset ─┬─→ bkit-tests-e2e-web
                          always-on                   (lease)     ├─→ bkit-tests-live-web
                                                                  ├─→ bkit-tests-e2e-ios
                                                                  └─→ bkit-tests-e2e-android
                                          │
                                          ▼
                               bkit-tests-cleanup (always(); releases the lease)
                                          │
                                          ▼
                               bkit-tests-check (needs: scope + every lane you have)
                                          │
                                          ▼
                               bkit-tests-deploy (default-branch push only; not required)

  static/unit/integration/build-*: needs:[bkit-tests-scope]; if: run_level != 'none'
  bkit-tests-migration:            needs:[bkit-tests-scope]; NO job-level if (always-on)
  bkit-tests-reset:                needs:[scope, migration]; if: tenant_target != ''
  e2e-web / live-web / e2e-ios / e2e-android:
                                   needs:[scope, migration, reset, <build>];
                                   if: !cancelled() && scope==success && <own gate>
                                   && migration != 'failure' && reset != 'failure'
```

Adopt only lanes your repo has. Add a lane the moment its tier exists — a tier with no lane is a tier nothing gates. The jobs above the reference in `ci.yml` are the starter: `bkit-tests-static` and `bkit-tests-unit`, joined by the `bkit-tests-check` capstone `/bkit-ship` merges on. Every lane you add joins the capstone's `needs:` and its assert. The reference is the target. A starter stub that still sits inside `bkit-tests-unit` is the pre-split shape.

Adopt in this order. Stop at the first tier this repo does not have. You write the step bodies; these files name the job, the `needs`, the `if`, and the rule.

1. Keep `bkit-tests-static` and `bkit-tests-unit`.
2. Add `bkit-tests-scope`. Every later `if:` reads `plan`. One marker parse. Push base = last green run (`deployments.md` § One run).
3. Move integration out of unit into `bkit-tests-integration`.
4. Add `bkit-tests-build-web`. Compile, or create this SHA's deployment and publish `deployment_url` + `deployment_id` un-promoted on the default branch. Do not also enable `bkit-stub:vercel-await`.
5. Add `bkit-tests-migration` when you have migrations. Remote apply of new migrations (e.g. `supabase db push --linked --include-all`) lives here, after the from-empty replay. Immutability and slop-delta use the planner base on every event.
6. Add `bkit-tests-reset` / `-cleanup` only when two or more lanes share one long-lived resource. Otherwise provision fresh and drop both.
7. Add `bkit-tests-e2e-web`. Full suite on a PR and on a push. Feature → `dev` PR hits a local stack. `TEST_URL` only. A pass on retry is a failure.
8. Add device build and device E2E only for a platform you ship. Same rule on a PR, a push, and a dispatch. `bkit-tests-e2e-ios` needs `build-ios` and `build-web`; android the same with its build lane.
9. Add `bkit-tests-live-web` for a push to `dev` or the default branch when `web_affected`. Not a PR. Not a dispatch. Do not `needs:` static, unit, integration, or e2e.
10. `bkit-tests-check` `needs:` every lane you kept. Sole required check. The assert is a script (§ Validated means executed).
11. `bkit-tests-deploy` on a default-branch push, after the capstone. Promotes that exact `deployment_id`. Not required (`deployments.md` § Promote after the capstone).
12. Health is `health.yml`, `workflow_run` after that CI success. A logging probe is a step inside each runtime lane, not a job.

Scripts these files do not ship, so the plan names them and you write them: last-green base, marker parser, capstone assert, lease acquire and release.

- **`bkit-tests-scope`** (always-on) computes `run_level` (+ optional `run_migration`) + emits `bkit-test-plan` contract — _what should run_.
- **`bkit-tests-static` / `-unit` / `-integration` / `-e2e-web`** — one **lane per tier**, separate parallel jobs. A platform suffix (`-web` / `-ios` / `-android`) is required when that tier exists for more than one platform; `static` / `unit` / `integration` / `migration` stay bare. Integration / web E2E gate on `web_affected` / `run_e2e`; each lane emits executed-count for capstone and (coverage tiers) posts own coverage comment. Start `-static` + `-unit`, add lane per tier (`deployments.md` § Parallel test lanes). E2E: do **not** put remote migration apply here — that lives in `-migration`. Web E2E on a feature → `dev` PR hits a local stack with this PR's migrations; every other event hits the deployment. Same outcome rules everywhere (retries, traces, flake handling). A pass on retry is a failure. Target from `TEST_URL` alone. No spec filtered by tag.
- **`bkit-tests-migration`** (optional; DB repos) — always-on ordering + provisioning lane: (1) fresh-DB replay + seed assert (plan-/path-gated per-step); (2) on every push to `dev`/`main`, remote apply of new migrations (e.g. `supabase db push --linked --include-all`) (un-gated by `run_migration` — self-heals a remote left behind). No job-level `if:` — e2e/live `needs:` it; a skip would cascade. Capstone asserts `success` whenever scope succeeded. See § Provision backing services fresh.
- **`bkit-tests-build-web`** — web compile, or the host deployment gate (e.g. Vercel: create this SHA's deployment, publish `deployment_url` + `deployment_id`, leave it un-promoted on the default branch). Emits no `*_ran`.
- **`bkit-tests-build-ios` / `-e2e-ios` / `bkit-tests-build-android` / `-e2e-android`** (optional) — device build and device flows. Same rule on a PR, a push, and a dispatch: not a post-merge canary. `bkit-tests-e2e-ios` `needs:` scope, migration, reset, `bkit-tests-build-ios`, and `bkit-tests-build-web`. Android matches, with `bkit-tests-build-android`. A planned red reds the capstone. Drop any platform you do not ship. e.g. a hosted build service plus a device-flow runner.
- **`bkit-tests-live-web`** runs `@live` against the deployed URL (`run_live`; drop the job if no deploy). Push to `dev` or the default branch only, when `web_affected`. Not a pull request. Not a dispatch. `needs:` planner + migration + reset + `bkit-tests-build-web`. Do **not** gate behind static/unit/integration/e2e. A planned failure reds the capstone. `/bkit-ship` still filters a job named `bkit-tests-live`; this name does not match, so the capstone is the gate.
- **`bkit-tests-reset` / `bkit-tests-cleanup`** (optional; one shared long-lived resource) — reset takes the lease and puts the resource in its known state **before** any lane uses it; cleanup runs last, `if: always()`, and releases the lease. Planner names at most one target. Empty target skips both. Capstone reds if a planned reset skipped or either job failed. DROP both when the resource is provisioned fresh per run (§ Provision backing services fresh — the preferred answer).
- **Logging probe** (optional step, not a lane) — inside each runtime lane, emit one marked event and ask the error tracker whether it arrived. e.g. Sentry. Skip when that lane did not run the probe.
- **`bkit-tests-deploy`** (optional) — after the capstone, on a push to the default branch only. Promotes the exact `deployment_id` `bkit-tests-build-web` published. Not a required check. A red job means the previous deployment stays live.
- **Health** (optional, separate workflow) — `workflow_run` after CI succeeds on the default branch; smoke the deployment this SHA promoted. Not a required check. Copy the stub to `.github/workflows/health.yml`.
- **`bkit-tests-check`** capstone — `needs:` **all** lanes; fails if any expected tier skipped or executed zero → green required check = **validated**, not merely "nothing failed". Sole branch-protection required check.

### Which resources may each lane touch?

Every lane must **declare** what it may reach; declaration enforced by lane env — not by comment. Lane that _can_ reach shared remote instance eventually will → cross-run interference, not failure.

<!-- prettier-ignore -->
| Lane | Real external APIs | Stateful backing service (DB / cache / queue) | Deployed app |
| --- | --- | --- | --- |
| `bkit-tests-static` | none | none | none |
| `bkit-tests-unit` | none — **mocked** | none | none |
| `bkit-tests-build-web` | none | none | creates this SHA's deployment; does not promote it |
| `bkit-tests-build-ios` / `-android` | the build host (e.g. a device-build service) | none | none |
| `bkit-tests-integration` | none — **mocked** | **ephemeral, CI-local, fresh each run** | none |
| `bkit-tests-migration` | none | **ephemeral, replayed from EMPTY** (plan-/path-gated) + **shared remote push** on every `dev`/`main` push | none |
| `bkit-tests-reset` / `-cleanup` | none | the **one** shared long-lived resource this run named | none |
| `bkit-tests-e2e-web` | none — **mocked** | ephemeral **local** (feature → `dev` PR) / the leased shared one (other events) | this SHA's deployment |
| `bkit-tests-e2e-ios` / `-android` | the device host | the leased shared resource | the deployed backend |
| `bkit-tests-live-web` | **REAL** | the deployed environment's **real** instance | **REAL** deployed URL |
| `bkit-tests-deploy` | the host API | none | promotes the deployment the lanes tested |

Read table as rule: **`bkit-tests-live-web` and the device E2E lanes are the lanes that may spend real external quota**; **only those, plus push-side `-e2e-web`, may touch the shared long-lived resource**, and only between reset and cleanup. Everything else provisions its own (§ Provision backing services fresh).

> [!IMPORTANT]
> **"Real external API" and "real remote backing service" are two INDEPENDENT axes — never one flag.**
> Most expensive mistake in this doc. Single overloaded gate (`LIVE_API`, `TEST_REAL`, …) meaning _both_ "hit real third-party APIs" _and_ "hit real remote database" collapses unrelated needs. Real consumer result: **10 suites needing ONLY real DB (no external API) sat in serial push-only `@live` lane** — invisible on PRs, inflated gating lane. Moving to `-integration` (ephemeral local DB): `@live` 86→44 tests, PR coverage for first time. Gate each axis on what it needs: external-boundary test → API credential; DB test → DB URL (prefer **ephemeral** — no gate needed).

**Moving suite between lanes = three edits; third bites.** Retag file, move to new lane — **delete old gate**. Suite with `skipIf(!LIVE_API)` in lane that doesn't set `LIVE_API` **silently skips forever** — green lane, plausible count, coverage gone (hollow-green via back door, § Validated means executed). After lane move: assert destination executed count **up** by moved test count.

**Missing gate variable → honest detectable skip — never silent pass.** Tier needing URL/credential run lacks must report skipped (and, if planned, fail capstone), not exit 0 having run nothing. Per-file assert where it matters — e.g. (Vitest JSON) `numPassedTests >= 1 && numPendingTests === 0` — catches ghost-green no-op and quiet skip.

### Validated means executed, not "didn't fail"

Green capstone = planned tiers _ran tests and passed_ — not merely nothing visibly failed. Three states per tier, gated independently:

- **Absent** — no declared entrypoint (e.g. a `test:integration` / `test:live` script, an enabled E2E step). The capstone asserts nothing; a repo with no integration / E2E / `@live` tier is fully valid (bkit's own repo has none).
- **Declared + planned to run** — assert the tier ran **and** executed **> 0** tests. This closes the green-with-zero hole: `--passWithNoTests` matching nothing, a `@live`-tagged suite whose owning package declares no live entrypoint (e.g. no `test:live` script, so `turbo run test:live` runs nothing), or every test `skipIf`-gated off — all exit 0 and look green.
- **Declared + correctly skipped** (light run / not `web_affected`) — assert it was _skipped_, not vacuously passed.

A declared tier therefore emits an **executed count** (a runner's machine summary — e.g. vitest `numPassedTests + numFailedTests`); the capstone asserts `count > 0` for every declared-and-planned tier. The same rule at install time is "every tagged suite has a CI home": each `@live`-tagged test must live in a package whose declared entrypoint (e.g. a `test:live` script) the tier actually invokes, or the tag is dead code.

**The assert is a script, not a heredoc in the workflow.** It is the only required check, and a shell heredoc inside YAML cannot be unit-tested. Move the decision into a script the normal test command already runs, with the environment as an argument. Four cases must red: a lane that failed; a gated lane that ran when its gate said skip; a tier reporting success with zero tests; a plan that will not parse. The checkout that fetches that script is ungated and not `continue-on-error`. A checkout gated on `run_level == 'full'` leaves every other run with no script, and the required check exits on "cannot find module" without reading the plan.

**Namespace.** `bkit-tests-scope` is the planner. A loop over every `bkit-tests-*` job skips it, and a scope failure then leaves the capstone green. Exempt `bkit-tests-scope`, `bkit-tests-reset`, and `bkit-tests-cleanup` by name from any guard that treats every `bkit-tests-*` job as a counting lane. Point branch protection at `bkit-tests-check`.

**A per-tier count won't catch a file that stops running everywhere.** `count > 0` proves each _tier_ ran tests; it does not prove every _test file_ ran in _some_ lane. A file renamed out of its glob, moved to a lane whose filter excludes it, or left carrying a stale `skipIf` (the lane-move trap above) can quietly stop executing in **every** lane — each lane green, each count still plausible. The capstone is the only job that `needs:` every lane, so it is the only place to answer this, on the **union**: reconcile the on-disk test-file inventory against the set of files that executed across all lanes. Skipped in one lane but run in another is fine — only **dead in every lane** is the bug. Its checkout stays `continue-on-error` and must not be the script checkout above. Keep it a **non-blocking** diagnostic (it must never red the required check) and **full-runs-only** (a PR's unit lane is affected-scoped, and `bkit-tests-live-web` is absent, so the PR delta is expected and large — a cry-wolf guard gets turned off); start report-only, then flip to an assert once the allowlist of legitimately-never-run files is seeded from a real inventory.

**Executed is not the same as _exercised_.** `count > 0` proves a test ran; it does NOT prove the test reached the behaviour it claims to cover. A **hollow boundary test** — non-mock, owns a CI home, executes, passes — can still cover nothing if it short-circuits before the boundary. Worked example: a golden test for an external OCR lane called the extractor with the wrong argument shape, so the input field was `undefined`, the extractor returned `{ text: "", extractor: "none" }` in ~2ms, **no API call was ever made**, and the assertion (on a field that didn't exist) was never reached — green in CI, covering zero. A boundary test MUST therefore assert a **ground-truth signal only the real boundary can produce** — a specific returned value / shape / identity / latency floor (e.g. `extractor === "mistral-ocr"` AND `text.length > 50`), never "did not throw" or a value a degenerate / short-circuit path could also return. Two corollaries: (1) when a deploy / `@live` tier exists, route external / deployed-boundary behaviours (3rd-party API, model, payment, deployed schema, RLS/tenancy) to `@live` — a passing local fixture is not evidence prod is correct (§ Schema-invariant DB checks); (2) type-system escapes at a boundary call-site are forbidden — e.g. TS `as unknown as` / `as any` casts and `@ts-ignore` / `@ts-nocheck` / `@ts-expect-error` directives, Python `# type: ignore`, alike — they suppress the contract drift (a renamed SDK field, a changed signature) the boundary test exists to catch, so the bug ships while the test passes against the wrong shape.

**Never manufacture a vacuous green.** A pass-with-no-tests option (e.g. `passWithNoTests: true` / `--passWithNoTests`) makes a runner report PASS with zero tests run — the exact hole the executed-count gate exists to close; it is a **banned override** in any bkit-managed test config. Two adjacent guards: emit the executed count as a build **output** (not a log line) so a build-cache replay (e.g. a task runner like turbo) restores the real number, and let a cache short-circuit report a `cached` sentinel (validated-on-cache, not a hollow 0); assert unit / integration counts only on **non-PR full runs** — a PR run is affected-scoped and can legitimately resolve to 0 affected tests.

### Step names say whether a red is real

One verb scheme across every step in `ci.yml`, so a red run can be triaged from the step name alone before opening a log:

<!-- prettier-ignore -->
| Verb | Means |
|---|---|
| `Assert` | a red here is a real failure |
| `Check` | looks and reports, cannot red the lane |
| `Run` | invokes a named tool or suite |
| `Report` / `Upload` / `Count` / `Merge` / `Fetch` | move or publish results |

`Guard`, `Validate`, `Verify` and `Audit` are **not** in the scheme: each means "fail the job if this isn't true", which is `Assert`. `Check` is the load-bearing half: it is reserved for a step that genuinely cannot red the lane, either because it carries `continue-on-error: true` or because its body only ever warns. A step named `Check` that can fail the build is the one naming error this scheme exists to prevent, because it trains you to skim past a real failure.

Two smaller rules that follow from the same idea:

- **Name the tool the way the tool is named.** `Run actionlint`, not `Run Actionlint`; `Run bkit Check`, not `Run Bkit Check`. A step name that misspells its own tool is a step name you cannot grep for.
- **Drop a qualifier the job name already carries.** Inside `bkit-tests-unit`, `Run Unit Tests` beats `Run Vitest Unit Tests` — the lane already said which tier, and the runner is visible in the command. Keep a bracket only when it disambiguates two steps that would otherwise share a name and mirrors a literal flag or tool: `Run Slop Scan (full)` / `(delta)`, `Run Shell Tests (bats)`.

### A guard asserts the rule, not the sentence that explains it

A shape guard over a config file reads that file as text, so it is easy to anchor it on whatever string happens to be nearby. Anchor on the **rule**; a guard pinned to the prose around the rule fails the moment someone improves the comment, and passes for years after the rule itself is deleted.

The failure mode is specific and it is not hypothetical: a guard asserting `expect(content).toMatch(/bootstrap paradox/)` was protecting a real invariant — that a lane checks the repo out before calling a local composite. Tidying the phrase "bootstrap paradox" out of the comment reddened the guard while the invariant was untouched. Assert the thing that must hold (`must already be checked out`, a step id, a flag, an `if:` shape), not the words chosen to describe it.

Three practical rules:

- **Pin the mechanism, not the wording.** `expect(step).not.toMatch(/exit [1-9]/)` proves a step is non-blocking; matching a comment that says "this only warns" proves nothing about the code.
- **Derive the list, never hand-write it.** A guard that enumerates lanes goes stale the day a lane is added. Derive the set from the file under test — count the `VERBOSE_CI` declarations, read the `needs:` array — so a new lane is covered without editing the guard.
- **Prove it can fail.** Put the bug back and watch the guard red before you trust it. A guard that has never failed is indistinguishable from a guard that cannot.

**The exception, stated so it is not mistaken for the rule.** When the shipped artefact _is_ prose — a rules file an agent reads, a CLI help string, an advisory message — the wording is the behaviour, and asserting on it is correct. The distinction is whether the text is the deliverable or a description of one.

### Composite actions: two rules that fail silently

A composite action (`uses: ./.github/actions/setup`) is the right way to stop copy-pasting a setup block across lanes. Two of its rules are not obvious and neither fails loudly:

- **A composite cannot own the checkout that fetches it.** A local `uses: ./…` path is resolved from the runner's own filesystem, so the repo must already be checked out before the runner can read the composite's `action.yml` at all. Putting `actions/checkout` inside the composite and making the composite each lane's first step is a bootstrap paradox — the lane reds with "can't find action.yml". Every adopting lane runs `actions/checkout` as its **own** first step, with its own explicit `fetch-depth`, before it calls the composite.
- **Job-level `env:` reaches a composite step's process, but not its `env` expression context.** The `env` context inside a composite reflects only what the composite itself declares, so `if: env.VERBOSE_CI == '1'` on a composite step is **permanently false** — the step silently never runs, and nothing reds. Gate in the shell instead (`if [ "${VERBOSE_CI:-}" != "1" ]; then exit 0; fi`) and say so in a comment, or the next person tidies it back into an `if:`.

The same expression-context trap has a neighbour outside composites: the `env` context is not available to a **job-level `env:` value** either, so `NODE_OPTIONS: ${{ env.VERBOSE_CI && '…' || '' }}` resolves empty on every run. Spell the marker test out — see § CI verbosity.

### E2E on PRs: run the full suite, watch which DB it hits

Two PR-time E2E concerns, both gated on **real preconditions** (event, head ref), never a kill-switch flag:

- **Parity — PR and push run the full suite.** `pull_request` runs the **same** E2E spec set as the `dev`/`{{DEFAULT_BRANCH}}` push. Scale a slow suite by sharding (parallel lanes / more workers). PR↔push differ only by **DB target** (below) and **push-only tiers** (e.g. `@live`).
- **Correctness — migration-coupled PRs.** If preview deploys share one `dev` database, that database does not yet carry a PR's unmerged migration (it applies only on the post-merge push). A PR that adds/renames a column **and** uses it in the same PR therefore deterministically 500s pre-merge; a force-all-E2E marker does **not** help (same migration-less DB). Fix: on **feature→`dev` PRs** run E2E against a **local** DB that has applied this PR's migrations (reset local → prod build → run vs `localhost`); keep preview-backed E2E for `dev`/`{{DEFAULT_BRANCH}}` **pushes** (deploy fidelity). The `dev`→`{{DEFAULT_BRANCH}}` release PR (head ref `dev`) already targets the migrated `dev` DB, so it stays on remote. Repos with more than one migration system must apply **all** of them locally.

### Concurrent invocations collide on disk, not just in the database

Per-shard data isolation (§ Optional hardening) is necessary, **not** sufficient. One job launching several runner processes concurrently → anything keyed on the runner's **own worker index** collides: that index restarts at 0 in every process.

Consumer fanned one E2E step over 12 concurrent Playwright invocations. Each wrote its minted session into one shared auth dir as `user-w<N>.json`, `<N>` = `workerInfo.parallelIndex` → two lanes both wrote `user-w0.json`, later write won, browsers loaded sessions their own worker never built: 486 `Cannot read properties of undefined` + 102 sign-in redirects. DB rows never collided (random owners → tenant tag is a label, not a key); the collision was purely on disk, and the suite's cross-tenant bleed tripwire could not see it — a clobbered file still holds a valid identity.

- **Make the index global.** Distinct lane index per invocation → `laneIndex * workersPerLane + parallelIndex`. Unset → offset 0, local runs byte-identical.
- **Throw on a bad value, never clamp.** An index silently reading as 0 is the defect being prevented.
- **Assert distinctness, not presence.** A guard checking each invocation _has_ an index passes with two lanes sharing 0 — bug restored.
- **Bands unique, never dense.** A `--workers=1` lane leaves most of its band unused; that waste is the point. Tightening spacing to real worker counts is how bands overlap again.
- **Test the loop by running it.** Loop-generated invocations are invisible to a static scan → execute the real `run:` body in the guard, control plus mutations (pinned lane index, stripped cache-dir suffix) that must red.

Same rule for every per-worker artefact keyed that way — transform caches, blob report dirs, JSON output names, artifact dirs — and the fix removes the reason to serialise the lanes at all.

Two further axes, same root cause:

- **Shared identity vs per-principal rate limits.** Four lanes driving ONE fixture owner created more records in a minute than the product allows one user → 429 on three of four. The limiter was working; the fixture was pretending four lanes are one person. Per-lane fixture identity under a suffix, teardown deletes by id, and guard the fixture build **separately** from the lanes.
- **Shared service load.** A per-navigation auth call became 3,500 `GET /auth/v1/user` in 4 minutes under a 12-lane fan-out, stalling the provider and reddening the `@live` lane on a **separate machine**. Audit per-request calls to shared external services before fanning out — verify locally first (JWKS), call the service only when the local check cannot decide. Distinct from the phase-split lever (`deployments.md` § Parallel test lanes): this cuts per-request cost, not peak concurrency.

## Which tier does a behaviour need?

Assign every behaviour its **lowest sufficient tier(s)** — the lowest tier that _actually exercises_ it. A behaviour may need more than one. Never substitute a lower or mocked tier for a boundary a higher tier validates; **under-tiering** (a lower / mocked tier where the rubric demands a higher / `@live` one — a user-visible flow with no E2E row, an external-API behaviour tested only against a local fixture, a migration with no fresh-DB replay) is a defect, not a shortcut.

<!-- prettier-ignore -->
| Behaviour | Required tier |
| --- | --- |
| Any change (every commit) | **Static** — type / lint / format / prose / drift; pre-push + CI fail-fast |
| Pure function / single module, no I/O | **Unit** |
| Crosses a LOCAL stateful boundary (own DB / own API, no 3rd party) | **Integration** vs a freshly-provisioned instance, no mocks at the boundary |
| Crosses an EXTERNAL / DEPLOYED boundary (3rd-party API, model/LLM, payment, deployed schema, RLS/tenancy) | **@live (golden)** — reaches the real boundary, asserts a boundary-only signal |
| User-visible UI flow / DOM state | **E2E** |
| Design token value / reference-doc parity | **Unit** — reference doc vs each implementation, asserted independently (§ Design assertions) |
| Rendered geometry, contrast, touch-target size | **E2E** — computed style + a11y scan in the existing browser project (§ Design assertions) |
| New / changed migration or seed | **fresh-DB replay** (`bkit-tests-migration`) — replays from empty + the seed loads |
| Post-deploy health of a deployed surface | **Smoke** (post-CI or post-deploy — see `deployments.md`) |

A plan's `Derived Test Matrix` (`docs/templates/bkit-plan.md`) is the per-feature application of this rubric: one row per behaviour, each mapped to a build + verify task. Boundary rows carry the rigor above — reach the boundary; assert a signal only it can produce; no `as unknown as` at the call-site.

## What each tier must do

Tier-by-tier rules: **do** the rule, avoid the **Not** (the failure it prevents). Stack tools (Vitest / Playwright / a Supabase-style local stack / a Vercel-style preview) appear only as worked examples — the rule is the principle; implement it for your stack.

### Static

- Run the whole non-test gate set: typecheck · format check · lint · prose lint · code-slop scan (full **plus** a PR **delta** gate that fails only net-new findings) · drift check · workflow linter. Locally this set is one script, `bkit:gate:static`, and `bkit:gate:static-unit` chains the unit tier on top — the same scripts pre-push, the build loop and the remediate agents all run, so a green push and a green agent gate mean the same thing. CI runs the rest fail-fast **before** any env pull or heavy tier.
- Scan a **clean tree** — run static **before** the test tiers write coverage / result artifacts, or the scan flags the artifacts instead of your code.
- On PRs scope to the **affected graph** (e.g. a monorepo task runner's `--filter=...[base]`) over a **non-shallow checkout** (full history) — never a shallow clone that fails affected-selection open to "everything".
- **Not:** a green CI that never ran the slop / drift / prose gates because they sat behind a test step that exited early.

### Unit

- Pure functions and single-module logic, in-process, **no I/O**. Mock or inject the slow / side-effecting collaborators.
- **Not:** a "unit" test that opens a DB connection or hits the network — that is an integration or @live behaviour wearing a unit suffix, and it will flake.

### Integration

- Cross a **local** stateful boundary (your own DB / API) against a **freshly-provisioned** instance, **no mocks at the boundary** (§ Provision backing services fresh).
- **Self-seed each test's own fixtures** (e.g. in `beforeAll`); do **not** assert on rows the seed file plants. Coupling to the shared seed makes the tier brittle to seed edits and lets seed regressions hide — the seed has its own gate (§ Migration-replay + seed).
- Design for **unique-ID independence**: each case creates uniquely-keyed data and never assumes a clean shared store, so the suite parallelises. (Transaction-rollback isolation is a pgTAP-style fast-path; application-level tests can't use it — pin file-level serialism where files must share one local instance.)
- The DB boundary stays hermetic-local, but a **read-only** external API may legitimately be exercised here behind an opt-in flag; anything with **spend, side effects, a deployed schema, or tenancy / RLS** belongs in @live, not here.
- Source real credentials **explicitly** when the runner does not auto-load `.env`, then **override** the backing-service vars to the local instance so a stray remote URL can't redirect the tier at production data.
- **Not:** an "integration" test green against a long-lived shared dev DB carrying another run's rows — reproducibility unproven.

### Deploy-reachability (between integration and E2E)

- Before any tier runs against a freshly-deployed URL, assert it is **actually serving** — **READY ≠ serving**. A platform can report a deployment READY while it 404s / 500s; a bare "did the deploy finish" check passes anyway.
- Make a missing target an **honest failure**, not a silent skip: assert ≥1 reachability test actually ran (per-file executed-count), so an unreachable target reds the build instead of green-no-op.
- **Not:** an E2E suite that "passes" because every spec silently skipped against a target that was never serving.

### E2E

- Drive the real UI against the **specific commit's** preview — resolve the deploy by commit SHA, never a static branch alias that may point at a stale build — after confirming it is READY + serving.
- Locally, run against a **production build**, not a dev server: a dev file-watcher remounts components mid-test and breaks stateful UI (dialogs, wizards).
- Use **stable selectors** (test-ids) and **condition-based waits**; never a fixed-time or network-idle wait. Don't gate a response-wait on status — match URL + method, then assert success explicitly, or a non-2xx silently spins to timeout.
- Clean up what you create (`afterAll`) and warn on accumulated `test_` / `e2e_` rows so leaked fixtures can't slowly corrupt a shared environment.
- On a pull request and on a push, run the **same** spec set — § "E2E on PRs". Scale a slow suite by sharding, not by dropping specs.
- **Not:** clicking by visible text and waiting on `networkidle` — the two classic flaky-E2E footguns.

### @live (golden)

- Cross the **real external / deployed boundary** and assert a **ground-truth signal only it can produce** (§ Validated means executed). Two shapes: **in-process** (the test calls the real SDK / model / API directly) and **deployed-endpoint** (the test fetches the running app) — use whichever observes the boundary you're validating.
- Push to `dev` or the default branch only, when `web_affected` (`run_live`). A planned failure reds the capstone. It does not run on a pull request or a dispatch. A newer run on the same ref cancels the older one (`deployments.md` § One run per branch or pull request).
- **Honest skip vs hollow:** when there is genuinely nothing deployed to validate, **skip with a recorded reason** (the capstone then asserts nothing about its count) — distinct from a tier that ran 0 tests. But a **missing credential with the tier enabled must fail loudly at connect**, never skip — a vacuous skip hides infra rot.
- Never blast a production system with test traffic: use a **synthetic-identity namespace** + a guarded teardown that refuses to delete anything outside it.
- **Not:** a non-mock @live test that short-circuits before the boundary (the hollow case), or one that asserts only "did not throw".

### Migration-replay + seed (the fresh-DB gate)

- Prove every migration **replays from an empty database** on a fresh ephemeral instance, then the **seed loads** — the always-on sibling gate `bkit-tests-migration` (§ Provision backing services fresh). Distinct from the deploy-time "apply only new migrations onto the already-migrated remote" step (`deployments.md` § Applying migrations at deploy time) — that remote push also lives in the **same** always-on lane, after the replay, so a from-empty failure never reaches shared remote.
- **Assert the seed actually loaded** — check a known row exists. A reset / replay can exit 0 while a conditional insert silently no-ops or the seed aborts mid-file; a green replay is not proof the fixture is present (the seed analog of the hollow-boundary rule).
- Generate the seed from a **single deterministic source** — a pure data definition with no wall-clock `now()`, no random values, explicit IDs / enums so triggers don't randomise it — and regenerate the checked-in seed file from it. Two hand-maintained copies drift.
- **Replay-from-empty, not reused-volume.** A bare "start the local stack" can reuse a stale data volume and silently skip newer migrations — it is **not** a freshness proof; only a reset / replay from empty is.
- Trigger the gate on **every** migration / seed source — including the seed **generator** and its data definition, not just the emitted seed file — and replay **every** migration chain (a second ORM / CMS chain this gate never replays is an unverified hole).
- **Not:** treating a reset/replay command's exit 0 as "seed loaded", or proving freshness with a volume-reusing start command.

### Smoke

- After deploy, run a **fast, dependency-light** probe of the live surface (a handful of health / route / contract checks, or a tiny tagged browser subset) — breadth ("is the app fundamentally up?"), not depth.
- It is an **observability gate, not a merge gate**: own workflow, never in branch protection. When `bkit-tests-deploy` promotes inside CI, this probe is the health workflow, not a second file (`deployments.md` § Smoke trigger plumbing, § Promote after the capstone).
- **Not:** a smoke suite wired into branch protection, or one so heavy it can't run on every deploy.

## Design assertions are a dimension, not a lane

**NEVER add a design lane.** The lane axis is **resource profile** (a millisecond file read vs a booted app + browser), not subject matter — design assertions span both. A `bkit-tests-design` job (or a design-only browser project) splits one concern across two profiles and buys nothing existing lanes don't provide. Fold each assertion into the tier that already fits it: CI topology, the capstone's `needs:`, the browser-project partition all stay **unchanged** (a real consumer's full design-system rollout landed with `ci.yml` byte-unchanged).

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
- **A group tag carries zero routing power.** Tag design tests in the test **title** (NEVER a filename convention) + add a `test:design` script for local iteration only. The tag MUST NEVER appear in an execution gate or inverse-grep filter — a test without it still runs in its normal lane. Keep the **standard filename** in a location the package's include glob already matches: a bespoke `*.design.test.ts` or an unreached dir runs in **zero** lanes — green everywhere, covering nothing (§ Validated means executed). Pass-with-no-tests is mandatory on every fan-out; each runner spells that flag differently, and a browser runner hard-errors on a path / project name matching nothing.
- **Cache footgun — design tests read files outside their own package.** A token-parity test reads the reference doc; a raw-hex contract scans the source tree. Under a per-package-hash runner, editing the reference doc changes no package hash → a warm cache replays a **PASS against a reference the code now contradicts**. Put the reference doc (+ any rendered style guide) in the runner's **global dependencies** + mark the design-selection task **uncached**. Same trap class: a design run overwriting the machine-readable results file the executed-count gate consumes — re-run the full suite before trusting either.
- **Keep the first honest reds.** A first real geometry / a11y sweep surfaces genuine defects (undersized controls, failing contrast). File as issues, allowlist behind a **named constant**, and ship the allowlist's **stale-entry check** in the same change — an allowlist that never rejects a fixed entry decays into a silent exemption. Enumerate sweep scope by **role and tag**, NEVER by test-id presence (library-generated markup escapes the gate by construction). Measure **every** theme before asserting any, or a light-theme red hides dark-theme offenders.

## Schema-invariant DB checks (e.g. RLS coverage)

Access-policy coverage is stack-specific: bkit ships the **pattern** (two routes below), not a drop-in test. Supabase/PostgREST is the worked example — implement it for your backing store (swap the catalog source + anon-probe for your stack's equivalent).

Assert DB-level invariants (e.g. "every public table has RLS enabled", no hardcoded list) one of two co-equal ways. Pick by **deploy topology**, not by whether you can run a local DB-test runner (e.g. pgTAP):

- **pgTAP** (hermetic-fixture route) — e.g. `supabase/tests/*.sql` run by `supabase db test` in the `bkit-stub:test-db` step against a CI-local fixture built from `supabase/migrations`. Fast, hermetic, offline; keeps the invariant out of app code. Caveat: the fixture can differ from prod — a migration that doesn't reproduce the live schema leaves this green while prod access policies are actually broken. Best when there is **no** deploy/`@live` tier, or for pure-logic DB unit tests.
- **@live catalog-RPC** — a privileged, server-only catalog query called from the `@live` tier (e.g. Supabase: `SECURITY DEFINER`, service_role-only RPC `public.rls_coverage_gaps()` over REST), validating the **real deployed schema** in `bkit-tests-live-web`. Needs a deploy + the RPC. **Recommended default once you have a deploy/`@live` tier** — for access-policy / tenancy invariants especially, a passing local-fixture check is not evidence that prod is locked down. (e.g. Supabase: direct port-5432 from CI runners is IPv4-flaky — use the REST path the tier already has.)
- **PostgREST gotcha** — `GET /rest/v1/` (OpenAPI) is service_role-only by default: fetch the exposed surface with the service-role key, then probe each table with the ANON key (only the leak assertion must be anon).

An auto-discovering access-policy suite (e.g. RLS: RLS-enabled / anon-reads-`[]` / cross-tenant-denial, no hardcoded table list — so it catches the _next_ table too) belongs in `bkit-tests-live-web`.

## Provision backing services fresh

A tier that needs a stateful backing service (database, cache, queue, search index) must run against a **freshly-provisioned** instance, not a long-lived shared one. Green against a shared environment carrying accumulated state is **not** evidence of reproducibility — a migration that never re-applies cleanly, a seed that aborts on an empty store, or a row another run left behind all stay invisible until the service is rebuilt from scratch. Prove a fresh provision + seed succeeds **in CI**: e.g. an ephemeral per-PR database started fresh each run (Supabase: `supabase db reset` + seed). Reserve the shared remote/dev instance for the `@live` tier and push-side E2E (they validate the real deployed schema); it is never the integration tier's source of truth.

bkit's `bkit-tests-migration` lane (`bkit-stub:bkit-tests-migration`) is the ready-made home: **always-on** (no job-level `if:` — e2e/live `needs:` it for remote-push ordering; a skip cascades). Replay + seed assert stay plan-/path-gated per-step. On every push to `dev`/`main` the same lane owns remote apply of new migrations (e.g. `supabase db push --linked --include-all`) (un-gated by `run_migration` so it self-heals; after replay so from-empty failure never reaches remote). Capstone asserts `result == success` whenever scope succeeded. Fold into `bkit-tests-check`'s `needs:`.

**Local integration freshness.** If your local stack reuses a warm data volume (e.g. Docker + `supabase start`), a bare start can leave migrations unapplied (stale-volume footgun). Prefer a reset-by-default runner over a bare integration run (e.g. `turbo run test:integration`) — mirror local E2E: reset unless `--no-reset`. Shape: `pnpm test:integration:local` → script that starts local stack, hides remote env file (e.g. `.env.local`), resets from empty (e.g. `supabase db reset --local`), then runs integration (CI passthrough — CI boots its own hermetic stack).

**"Fresh" means replay-from-empty, not a reused volume.** A bare "start the local stack" command often **reuses an existing data volume** and applies only what's missing — a "fresh" start can silently run a months-old schema while reporting success. Only a reset / replay from an **empty** store is a freshness proof. And a green replay is not a green **seed**: assert the seed actually loaded (a known row exists), because the reset can exit 0 while a conditional insert no-ops or the seed aborts mid-file (§ Migration-replay + seed carries the full seed-determinism rules).

**Multiple migration systems:** a repo running more than one migration chain (e.g. a SQL chain for the public schema **and** an ORM/CMS chain such as Payload or Prisma) must fresh-apply **every** chain here and trigger on **every** migration source dir. A chain this gate never replays is an unverified hole — a broken migration in it lands green.

## Optional hardening (adopt when the cost is justified)

Beyond the gates above, three practices raise confidence further — opt-in, not baseline:

- **Mutation testing** (e.g. StrykerJS over a Vitest suite) automates the "executed ≠ exercised" intent: it injects bugs into production code and fails when no test catches them. Run it locally, on demand. It is not a CI lane and not a nightly workflow. Gate a local run on a survival-score threshold, never 100% (equivalent mutants make perfection unreachable). Capstone asks "did tests run?"; mutation asks "do they catch injected bugs?".
- **E2E sharding** (`--shard` matrix + report merge) cuts wall-clock on a large browser suite — but it is **gated on per-shard data isolation** (the unique-ID independence above). A single shared seed pins `workers: 1` and blocks sharding until the data is isolated. Isolated data is still not enough once several invocations share one job — § Concurrent invocations collide on disk, not just in the database.
- **Bounded flaky-retry with tracking.** A capped retry on the flake-prone E2E tier is low-risk **only** when paired with explicit flake **tracking** — an auto-retry that silently passes hides a real regression, the inverse of "validated ≠ didn't fail".

## Coverage on PRs

Shipped stubs target Vitest (`bkit-stub:coverage`) and Playwright (`bkit-stub:e2e-coverage`); on another runner keep the rules (per-tier, report-only, ratchet from current) and swap the tooling.

Report coverage on each PR **without a paid product or a third-party service** — e.g. the `bkit-stub:coverage` block in `.github/workflows/ci.yml` runs `davelosert/vitest-coverage-report-action` entirely inside Actions with `GITHUB_TOKEN`, posting sticky per-PR comments (safe for private repos; no coverage data leaves the runner). Replaces GitHub Code Quality's coverage-on-PR value (`deployments.md` § Disable GitHub Code Quality billing) — **not** CodeQL security scanning, a separate product.

**Per-tier, not merged.** Unit and integration are measured and commented **separately** (two runs into `coverage/unit` and `coverage/integration`, two comments keyed by a distinct `name:`). A single merged number is the weakest option: coverage is a **union**, so a line covered only by an integration test reads as covered and **hides a missing unit test** — a merged gate lets integration mask a hollow unit suite. The two numbers also have different denominators, so they can't be honestly combined into one.

- **Report-only by default.** No `thresholds`, so coverage never reds the lane — enabling the block on an existing repo can't break it.
- **Reporters are load-bearing.** The action reads `coverage-summary.json` (from the `json-summary` reporter, mandatory) and `coverage-final.json` (from `json`, required for `file-coverage-mode: changes`). Enable both in `coverage.reporter` or the step no-ops.
- **Two runs, separate dirs.** `vitest run --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts'` for unit; a second run into `coverage/integration` for the integration tier. Separate dirs also avoid the last-writer-wins **clobber** a second same-dir `--coverage` run would cause.
- **Thresholds are opt-in and per tier:**
  - **Unit = the gate.** Pass `--coverage.thresholds.branches=<current>` as a CLI flag on the **unit** run only — **branches** is the meaningful floor (line/statement % overstates confidence); set it to your **current** coverage and ratchet up. vitest coverage is per-**run** (root config), **not** per-project, so `projects` does **not** scope it and a `thresholds` block in `vitest.config` would red **both** runs — the per-run flag (or a second `vitest.<tier>.config.ts` run with `-c`) is what keeps the gate off integration. 80% is convention, not best practice — a fetishised high bar breeds assertion-free line-touching tests; the executed-≠-exercised rule (§ Validated means executed) matters far more than the number.
  - **Integration = report-only.** Gate integration on **execution** (the capstone's `integration_ran > 0`), **not** a %. A whole-repo integration % is denominator-noise — integration covers boundaries/flows, not pure logic, and rarely drives every branch, so a hard threshold on it punishes the correct pyramid shape. If you want a real integration %, add `--coverage.include='src/server/**'` on the integration run (same CLI-flag idiom as `--exclude`) to scope it to the integration surface, **then** set a floor, or **ratchet from current** — never a number picked from thin air.
- **Share the unit gate with the build workflow.** Put the unit run (`--coverage … --coverage.thresholds.branches=<current>`) in a `test:coverage:unit` script and chain it into `bkit:gate:static-unit` — the CI unit lane calls the script, `/bkit-build` Run Tests calls the gate, so the threshold has **one source** and a regression fails in the worktree, not only on the PR. Never duplicate the command and sync it by comment — that drifts. The build runs only the deepest declared `bkit:gate:*`, never the script by name: **left out of the chain, it never gates the build**. (bkit's own repo does exactly this.)
- **Permissions.** The report steps need `pull-requests: write` — declare it at **job level** on the lane that posts. Job-level `permissions:` **replaces** the workflow-level block (not additive), and the SHA-cache step calls `gh run list`, so re-include `actions: read` too or it breaks. **Separate lanes:** with a lane per tier (recommended — see `deployments.md` § Parallel test lanes), each coverage comment posts from its own lane (unit-cov → `bkit-tests-unit`, integration-cov → `bkit-tests-integration`), so put the block on **each** lane that reports. With the combined starter, both live on `bkit-tests-unit`.
- **Fork PRs.** `GITHUB_TOKEN` is read-only for PRs from a fork, so the steps fail — the shipped `head.repo == repo` guard skips them there; adopt the action's `workflow_run` two-workflow pattern if you must comment on fork PRs. The integration step is also guarded on `hashFiles(...)` so a repo with **no integration tier** skips it cleanly.
- **Base-branch delta** (▲▼ vs the default branch) is **not** shipped by default — it needs the base's `coverage-summary.json` (a second run or a stored artifact); wire the action's `json-summary-compare-path` if you want it.

### E2E coverage on PRs

The **E2E tier** (`bkit-stub:e2e-coverage`) reports Playwright coverage the same free, in-Actions, private-repo-safe way — a **third** sticky comment keyed `name: e2e`, never merged into the unit/integration numbers. Unlike vitest there is **no `--coverage` flag**: Playwright is black-box and doesn't instrument your source, so it's a 3-part pipeline.

- **Collect during the run.** Either an **Istanbul instrumented build** (`vite-plugin-istanbul` exposes `window.__coverage__`, scraped in a Playwright fixture — works on every browser) or the **V8 API** (`page.coverage`, Chromium-only, needs source maps). Istanbul is the cross-browser default.
- **Report with Monocart.** `monocart-coverage-reports` (wired via the `monocart-reporter` Playwright reporter) ingests **either** V8 or Istanbul input and emits Istanbul-format `coverage/e2e/coverage-summary.json` + `coverage-final.json` — the **same two files** the vitest action reads (`reports: ['json-summary', 'json', 'lcov']`), so no new commenter is needed.
- **Comment by reuse.** Point `davelosert/vitest-coverage-report-action@v2` at `coverage/e2e` with `name: e2e`. If Monocart's `coverage-final.json` isn't accepted for `file-coverage-mode: changes`, drop to `file-coverage-mode: all`, or comment via a cobertura action (`irongut/CodeCoverageSummary`) on Monocart's `cobertura` report.
- **Report-only — no threshold by default.** A whole-app E2E % is denominator-noise (E2E exercises user **flows**, not every branch), so gate the tier on the **E2E step succeeding**, not a number. For a real E2E %, scope Monocart's `entryFilter`/`sourceFilter` to the surface E2E is meant to cover, **then** ratchet from current — never a picked number.
- **Permissions/forks.** The E2E coverage report runs in the **`bkit-tests-e2e-web` lane** (or, with the combined starter, in `bkit-tests-unit`), and needs that lane's job-level `pull-requests: write` + `actions: read` + `contents: read` block, or the comment can't post. The `head.repo == repo` guard skips fork PRs; a `hashFiles('coverage/e2e/coverage-summary.json')` guard skips repos with no E2E coverage.

## CI verbosity (`[verbose ci]`)

See `deployments.md` § Commit-message force tags for the marker mechanics (where to put it: PR title for feature-branch pushes, commit message for direct push to `dev` / `{{DEFAULT_BRANCH}}`). This section covers the testing-specific knobs.

**Knobs flipped under the marker** — shipped stub flips turbo / Node / Vercel / Supabase / Playwright knobs; add your stack's equivalents:

- `TURBO_LOG_LEVEL=full` — surfaces Vitest/build output across all turbo steps (otherwise compressed to errors-only)
- `NODE_OPTIONS=--trace-warnings --trace-deprecation` — stacks on deprecations / transitive-dep regressions. Set as a job-level `env:` key in static YAML, NEVER written to `$GITHUB_ENV`: the runner blocklists `NODE_OPTIONS` for that command, rejects the write with an `::error::`, and still concludes the step `success` — so the flag reaches nothing while the run goes green. Spell the `contains()` marker test out rather than reusing `env.VERBOSE_CI` (the `env` context is not available to a job-level `env:` value). A step with its own `env:` block replaces the job-level value rather than merging, so it must restate the flags
- `DEBUG=vercel:*,supabase:*` — Vercel deploy + Supabase migration internal chain (no `pw:*` — duplicates Playwright trace)
- Playwright (when `bkit-stub:e2e` enabled): appends `--trace=on` only — `--video` and `--screenshot` are `playwright.config.ts use:` keys, not CLI flags (Playwright errors on unknown CLI options). The trace.zip captures snapshots / network / console / source, which covers the dominant diagnose use case. Never pass `--reporter=line` — let `playwright.config.ts`'s chain run

**Use when:** debug returns thin evidence (no `file:line`, only "tests failed", e2e fail without trace). `bkit-debug` / `failure-diagnose` auto-recommends. Never on first attempt; never on `bkit-ship` (verbose on a green run is pure cost — artifact storage + run time).

**Hostile gap — Playwright `--reporter=line` override.** If your `playwright test` invocation passes `--reporter=line`, drop it. With the marker on, traces are written but no reporter surfaces them → wasted artifact upload. `bkit install` flags this as an advisory.

**Artifact paths** (already in `.gitignore` via bkit template): `test-results/`, `playwright-report/`, `blob-report/`, `playwright/.auth/`. Never commit these — traces alone run 1-50MB each.

<!-- bkit:end -->
