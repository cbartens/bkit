# Research — Monorepo CI & testing-tier organisation (vs. bkit doctrine)

> **Scope:** Industry best practice for how a TypeScript/pnpm monorepo (Turborepo/Nx · Vitest · Playwright · pgTAP/Supabase · Vercel-style deploys) should organise its CI and testing tiers — local · unit · integration · E2E · @live · smoke · migration-replay. Grounded against bkit's existing doctrine (`docs/testing.md`, `.github/workflows/ci.yml` scaffold, `deployments.md` run-level matrix).
>
> **Method:** `deep-research` harness — 5 search angles → 23 sources fetched → 111 claims extracted → 25 verified under 3-vote adversarial check → 19 confirmed / 6 dropped → 7 synthesised findings. Date: 2026-06-15.
>
> **Confidence note (read this):** Items 1–4 (taxonomy, triggers, monorepo scale, green==validated) are well-grounded on primary docs. The canonical test-pyramid statement fell to a verifier _abstention_ (network stall, **not** genuine refutation) on the first pass; it is included as established-by-consensus with that caveat.
>
> **Follow-up pass (2026-06-15, tracked in #270):** the four under-grounded areas from the first pass — post-deploy trigger plumbing, mock-vs-real / @live boundary (item 5), fresh-DB provisioning, and StrykerJS placement — were plugged via targeted direct fetches of authoritative docs (GitHub Actions events, Vercel, Martin Fowler, Supabase, Testcontainers, StrykerJS, Elastic synthetic-monitoring). Those sections are now grounded and marked **[grounded — follow-up]**. The post-deploy claims the first pass _abstained_ on (workflow_run depth-3 chaining; `deployment_status` as the external-deploy hook) are now **confirmed** by the GitHub docs directly. A real bkit-consumer worked example (gether-life #523) was also incorporated — see § Worked example.

---

## TL;DR

1. **The canonical layering** is now Static → Unit → Integration → E2E → (live/smoke), with **integration weighted highest for confidence-per-second** (Kent C. Dodds' "Testing Trophy"; Spotify's "Testing Honeycomb" reaches the same integration-centric conclusion independently for service-style code). The strict pyramid (mostly unit) is increasingly treated as one shape among several, not the default.
2. **Trigger mapping:** cheap/fast/deterministic tiers gate every PR; slow/flaky tiers (full E2E, @live, post-deploy smoke) run **async or scheduled**, off the merge gate. GitHub Actions `cron` (POSIX, **5-minute floor**, always against default-branch HEAD) is the canonical nightly trigger.
3. **Monorepo scale** is handled by three orthogonal levers: **affected-graph selection** (Turborepo `--affected`, Nx `affected` — both _fail safe to running everything_ when git history is missing), **sharding/atomization** (Playwright `--shard=x/y` matrix; Nx Atomizer splits one E2E task per file), and **automated flaky classification + retry** (Playwright native retries; Nx input-hash flaky detection — _Nx Cloud paid feature_).
4. **`green == validated`** is bkit's strongest area of alignment. Vitest's `passWithNoTests` defaults to **false** (empty suite → exit 1), but `true` produces a vacuous green — bkit's executed-count capstone is **stronger** than relying on that default. The authoritative industry step _beyond_ executed-counts and coverage is **mutation testing** (StrykerJS; validated by Google's ICSE 2021 study) — the clearest candidate improvement.
5. **Item 5 — now grounded (follow-up).** The decision rule is: **mock only the slow/side-effecting collaborators** in the integration tier (Fowler), **hit the real boundary in @live**, and keep @live/smoke **off the merge gate** — run them async/scheduled as production-facing checks (the synthetic-monitoring posture). This _confirms_ bkit's existing doctrine (route external boundaries to @live; @live degrades to CONCERNS, never blocks; smoke async). Contract tests (Pact) are the recognised middle ground for service-to-service compatibility.

**Worked example (gether-life #523):** a real bkit consumer running the scaffold verbatim — hard timing data showing the dominant cost is a single serial `bkit-tests` job (E2E ~12m of a ~22m run). Its remediations (tier E2E with `@smoke`, split the monolith into parallel lanes, shard once data is isolated) are the concrete instantiation of §2–§3 and surface one finding that touches bkit's **own** shipped scaffold. See § Worked example.

---

## 1. Tier taxonomy & definitions

**Finding (high confidence).** The industry-canonical layering adds **static analysis as a foundation** beneath unit tests, and weights **integration** as the highest-ROI tier.

- Google's `web.dev` testing-strategies guide and Kent C. Dodds' "Testing Trophy" both put **static analysis** (types, lint) at the base — _"lets you catch typos, style mistakes, and other bugs"_ — precisely because JS/TS type-safety "is not a given." ([web.dev], [kentcdodds])
- The Trophy's load-bearing claim: **integration tests are the sweet spot for ROI** — _"the most business value by giving you a daily high confidence level while maintaining a reasonable execution time."_ Guillermo Rauch's maxim: _"Write tests. Not too many. Mostly integration."_ ([web.dev])
- Spotify's 2018 **"Testing Honeycomb"** independently reaches an integration-centric conclusion for service code: _focus on integration tests, few implementation-detail tests, "even fewer Integrated Tests (ideally none)"_ — and explicitly warns the pyramid "can be actively harmful" in a microservices world. ([spotify])
- The strict **test pyramid** (many unit → fewer integration → fewest E2E) remains the baseline mental model — the first pass's verifier abstained on it (stall), but the follow-up grounds it on Fowler directly. Fowler's "practical test pyramid" and "2021 test shapes" pieces frame pyramid/trophy/honeycomb as _shapes to choose between_, not one true answer. ([fowler-pyramid], [fowler-shapes])

**Accepted tier vocabulary (synthesised), mapped to the bkit stack:**

| Tier                            | What it validates                                                                                                                         | bkit name / runner                                     |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **Static**                      | Types, lint, format, prose, drift                                                                                                         | `typecheck` + `format:check` + `lint:*` + `bkit check` |
| **Unit**                        | Pure function / single module, no I/O                                                                                                     | `*.test.ts` (Vitest)                                   |
| **Integration / component**     | Multi-module wiring; crosses a _local_ stateful boundary (own DB/API), no 3rd party, **no mocks at the boundary**                         | `*.integration.test.ts` (Vitest)                       |
| **Contract**                    | Producer/consumer API compatibility without full E2E (Pact-style)                                                                         | _not present in bkit_ — see §5                         |
| **E2E**                         | User-visible UI flow / DOM state                                                                                                          | Playwright (template scaffold)                         |
| **@live (golden)**              | Crosses an _external/deployed_ boundary (3rd-party API, model/LLM, payment, deployed schema, RLS/tenancy); asserts a boundary-only signal | `test:live` → `bkit-tests-live`                        |
| **Migration-replay / fresh-DB** | Every migration replays from an **empty** DB + seed loads                                                                                 | `bkit-tests-migrate`                                   |
| **Smoke (post-deploy)**         | Health of a deployed surface after release                                                                                                | separate `workflow_run` workflow                       |

> **bkit alignment:** bkit already runs strict Unit/Integration/E2E/@live/Smoke separation **plus** static-as-base at pre-push (`typecheck + unit + bkit check`) — exactly the Trophy's base layer. The "integration-as-highest-ROI" doctrine is the theoretical backing for bkit's **lowest-sufficient-tier assignment** rule. The one gap vs. taxonomy: bkit has **no contract-test tier** (acceptable — bkit is not a multi-service producer/consumer system; flagged for consumers that are).

---

## 2. Where each tier runs (trigger mapping & the cost/confidence curve)

**Finding (high confidence) on the async trigger.** GitHub Actions `cron` is the canonical scheduled trigger: _"Use POSIX cron syntax… The shortest interval you can run scheduled workflows is once every 5 minutes… Scheduled workflows run on the latest commit on the default branch."_ Caveat: scheduled runs can be **delayed under load, skipped, or auto-disabled after 60 days** of repo inactivity (public repos) — firing _cadence_ is best-effort; the _target ref_ (default-branch HEAD) is guaranteed. ([gh-events])

**The trade-off curve.** The deeper a tier sits, the more _realistic_ and the more _expensive/flaky_ it is — so place each tier where the cost is justified by the confidence it buys:

| Tier                                  | Speed / cost        | Determinism          | Where it runs                                 | Gates merge?                                |
| ------------------------------------- | ------------------- | -------------------- | --------------------------------------------- | ------------------------------------------- |
| Static, Unit                          | seconds, ~free      | high                 | **pre-push** + every PR                       | **Yes**                                     |
| Integration (fresh local backing svc) | tens of seconds     | high                 | every PR (affected)                           | **Yes**                                     |
| Migration-replay                      | tens of seconds     | high                 | every PR (self-skips if no migration changed) | **Yes** (folds into capstone)               |
| E2E (Playwright)                      | minutes, costly     | medium (flaky-prone) | PR when `web_affected`/`run_e2e`; else async  | Conditionally                               |
| @live (golden)                        | slow, network-bound | low (external)       | merge-to-main / scheduled / `[force live]`    | **No** (degrades to CONCERNS)               |
| Smoke (post-deploy)                   | fast probe          | medium               | **after** deploy, `workflow_run`              | **No** (observability gate, not merge gate) |

**Post-deploy trigger mechanics `[grounded — follow-up]`.** Three native GitHub Actions hooks, with a sharp distinction between _post-CI_ and _post-deploy_: ([gh-events], [vercel-smoke])

- **`workflow_run`** — fires when _another workflow_ completes; filter by `workflows: [CI]`, `types: [completed]`, branch, and conclusion (`github.event.workflow_run.conclusion == 'success'`). **Hard limit: cannot chain more than three levels deep.** Fires when the _CI workflow_ finishes — correct only when the deploy happens **inside** that CI run.
- **`deployment`** — fires only when a deployment is created **via the GitHub API**; does not auto-fire on push.
- **`deployment_status`** — _"Runs your workflow when a third party provides a deployment status"_ — the correct hook when an **external** platform (Vercel/AWS) deploys after merge. Gate with `if: github.event.deployment_status.state == 'success'` (+ environment check); a state of `inactive` does **not** trigger a run. Vercel additionally emits a `repository_dispatch` event (type `vercel.deployment.success`) that current Vercel docs prefer for the same purpose.

**The nuance that matters for bkit:** `workflow_run` triggers off the _CI workflow_ completing, **not** off the deploy being live. bkit's scaffold keys smoke to `workflow_run` after CI — correct for a deploy-inside-CI topology. For a **separate external deploy** (Vercel-style, the bkit consumer stack), the more precise post-_deploy_ hook is **`deployment_status` (state==success) or Vercel's `repository_dispatch`**, which fire when the deployment is actually serving. Either way the smoke tier lives in its own workflow and never blocks PR merges.

> **bkit alignment:** Strong. bkit's `none`/`partial`/`full` run-level matrix is a precise encoding of this curve — PRs and pushes-to-`main` get `full` (deploy + E2E), merged-PR `dev` pushes get `partial`, `[skip ci]` gets `none`. Pre-push = `typecheck + unit + bkit check` (the two cheapest/most-deterministic tiers) matches the "gate the merge only with fast deterministic tiers" rule. Smoke correctly runs async via `workflow_run`. **One refinement (follow-up):** for consumers whose deploy runs on an external platform _after_ merge (Vercel-style), key the smoke workflow to `deployment_status` (state==success) / Vercel `repository_dispatch` rather than `workflow_run`, so it fires when the deploy is actually live rather than when CI finishes — see §2 post-deploy mechanics.

---

## 3. Monorepo-specific concerns

### 3a. Affected-graph selection (all-vs-affected)

**Finding (high confidence).** Both Turborepo and Nx run tasks **only for changed packages and their dependents**, and both **fail safe**: when git history is missing (shallow clone), `--affected` _falls back to running ALL tasks_ rather than silently skipping them.

- Turborepo: _"Filtering using source control changes is only possible when history is available… If you are using shallow clones, history will not be available"_ and _"If the checkout is too shallow, then all packages will be considered changed."_ ([turbo-ci], [turbo-run])
- Nx: _"Use `nx affected` to only run tasks on projects that have been changed and projects that depend on changed projects… This drastically improves the speed of your CI."_ Nuance: a lockfile/`package.json` change can mark **all** projects affected — "affected" is coarse in dependency-update scenarios. ([nx-affected])

This fail-_safe_ (not fail-_open_) property is directly relevant to bkit's green==validated concern: a CI misconfiguration that loses git history runs _more_, never _fewer_, tiers. The companion claim that Turborepo reads `GITHUB_BASE_REF` to diff PR base vs. head was **dropped to a stall** — don't assert the exact env-var mechanism.

> **bkit alignment / gap:** bkit's own repo is single-package, so affected-graph is moot for it — but the _template scaffold_ already gates Integration/E2E on `web_affected` / `run_e2e`, which is the same idea applied at the tier level rather than the package level. **Candidate note for consumers:** multi-package consumers should adopt `turbo run … --affected` (or `nx affected`) and ensure CI checkout uses `fetch-depth: 0` (full history) so affected filtering is precise rather than falling back to all.

### 3b. Sharding & parallelism

**Finding (high confidence).** Two patterns:

- **Playwright sharding** — `--shard=x/y` across a GitHub Actions matrix (`shardIndex`/`shardTotal`), each shard uploading a `blob-report-${index}` merged in a dependent `needs:` job via `playwright merge-reports`. Near-linear speedup, but **~3–4x for 4 shards, not a clean 4x** (merge overhead + shard imbalance, mitigated by `fullyParallel: true`). ([pw-sharding])
- **Nx Atomizer** — splits one E2E task into one sub-task **per test file** (e.g. one `nx-e2e` → 13 sub-tasks) for finer distribution across agents. _Nx-Cloud-specific._ ([nx-split])

> **bkit gap (candidate improvement):** bkit's testing.md describes the E2E tier but **does not document a sharding pattern**. For consumers with a non-trivial Playwright suite, the matrix-shard + blob-merge pattern is the directly-applicable best practice and worth adding to the scaffold reference as an optional block.
>
> **Sharding is coupled to data isolation (worked example).** A real bkit consumer — gether-life [#523] — _cannot_ shard its Playwright suite because `workers: 1` is **load-bearing**: a single shared DB seed. Sharding across N runners requires **per-shard data isolation** first, so this depends on the §3d fresh-provisioning + unique-ID-independence finding — a prerequisite, not an afterthought. See the § Worked example (gether-life #523).

### 3c. Flaky-test management

**Finding (high confidence).**

- **Playwright** treats flaky as a first-class outcome — `passed` / `flaky` (failed-then-passed-on-retry) / `failed` — and retries up to a configurable cap (`--retries=N` / `retries: N`). ([pw-retries])
- **Nx** auto-detects flakiness by **input hash**: same inputs fail-then-succeed ⇒ provably flaky; with distributed execution it auto-reruns the task **on a different agent** (max 2 tries) to rule out environment causes. _Nx Cloud + Nx Agents paid feature; flag auto-clears after ~2 weeks clean._ ([nx-flaky])

> **bkit gap (candidate improvement, with a caveat):** bkit has the SHA-cache short-circuit and `[verbose ci]` diagnostics but **no automated flaky classification or bounded auto-retry**. Adding Playwright `retries` on the E2E tier is low-risk and directly usable. Input-hash flaky detection is more powerful but **auto-rerun-on-different-agent risks masking real failures** — pair any retry with explicit flake _tracking_ so a "flaky" test can't quietly hide a genuine regression. This sits well alongside bkit's "validated ≠ didn't fail" philosophy.

### 3d. Fresh-DB / backing-service provisioning `[grounded — follow-up]`

Two industry-standard routes, both of which _provision fresh_:

- **Supabase-native (the bkit consumer stack).** CI pattern is `supabase/setup-cli` → **`supabase start`** (launches a fresh local instance) → **`supabase test db`** (runs pgTAP via `pg_prove` against the volume-mounted `supabase/tests`). **`supabase db reset`** rebuilds the schema from migrations to a clean state. pgTAP tests are **transaction-wrapped** (`begin; … rollback;`) so each rolls back regardless of outcome — isolation without per-test resets. ([supabase-testing], [supabase-ci]) Critical caveat: **application-level (non-pgTAP) tests cannot use transaction isolation** — design them independent (unique IDs per case), don't rely on a clean shared state, because resetting before each is slow and serialises parallelism.
- **Testcontainers (non-Supabase stacks).** Throwaway Docker instances of the real DB (Postgres/MySQL/etc.), spun up per test/suite from code, auto-removed after — same DB version on every machine and CI run, needs only Docker. Per-method containers only where strict isolation is required (perf trade-off); mix per-test for crucial cases + shared containers for parallel collections. ([testcontainers], [msft-testcontainers])

> **bkit alignment (confirmed):** bkit's "**Provision backing services fresh**" doctrine is the principle these implement. bkit's **`bkit-tests-migrate`** (replay-from-empty + seed-loads on a fresh ephemeral instance) _is_ the Supabase route (`supabase db reset` + seed) wired into the capstone. The grounded refinement: bkit's docs should note the **transaction-rollback isolation** fast-path for pgTAP vs. the **unique-ID independence** requirement for app-level integration tests (a real foot-gun — app tests that assume a clean DB will flake under parallelism, exactly the `workers: 1` constraint gether-life hit in § Worked example), and name **Testcontainers** as the non-Supabase equivalent of the fresh-provision rule.

---

## 4. The "green == validated" problem ← strongest bkit alignment

**Finding (high confidence).** The vacuous-green hazard is real and concrete in this stack:

- **Vitest `passWithNoTests` defaults to `false`** — an empty suite _fails_ with exit 1 and "No test files found." But setting it `true` (config or `--passWithNoTests`) reports the suite **PASSING with zero tests executed** — the exact "skipped tier reported as passed" hazard. ([vitest-pwnt])
- **Coverage is an unreliable quality signal.** Martin Fowler names the anti-pattern outright — **"Assertion-Free Testing"** — and calls coverage "of little use as a numeric statement of how good your tests are." ([fowler-coverage])
- **The authoritative step beyond executed-counts/coverage is mutation testing.** It injects bugs (mutants) into production code and runs the suite per mutant: a mutant is **killed** only if at least one test _fails_ while it's active; if all tests pass, the mutant **survives** — signalling a missing or hollow (assertion-free) test. Google's ICSE 2021 study (1,502 bugs, ~400k mutants) found that in **~69%** of bug-fixing changes the bug was _coupled_ to a mutant — i.e. mutation-detection sensitivity correlates with real-bug detection (fault-coupling hypothesis). **StrykerJS** is the canonical JS/TS tool and supports Vitest. ([google-mutation], [stryker], [stryker-states], [icse2021]) _(The "33M / 70%" figure was the only split vote — correct magnitude, but the precise number is 69% and the unit is "test target executions," not "test suites.")_

> **bkit alignment (strong) and the one candidate improvement:**
>
> - bkit's **executed-count capstone** (`bkit-tests-check` asserts every declared-and-planned tier ran **> 0** tests) is **strictly stronger than the framework default** — `passWithNoTests=false` only catches the _empty-suite_ case; bkit also catches files-exist-but-all-skipped/short-circuited. **`passWithNoTests=true` should be a banned override in any bkit-managed Vitest config** (it manufactures the exact vacuous green the capstone exists to prevent).
> - bkit's **"executed ≠ exercised" / hollow-boundary rule** (assert a ground-truth signal only the real boundary can produce; the OCR worked-example; `as unknown as` / `as any` forbidden at boundary call-sites, enforced by the `boundary/unsafe-cast` slop rule + `slop:delta`) is a **manual + static-analysis analog of exactly what mutation testing automates**. bkit independently arrived at the mutation-testing _intent_ without the tool.
> - **Candidate improvement — add StrykerJS to the Vitest tier.** It goes beyond the executed-count capstone by _verifying tests actually assert at the boundary_. It _complements_ rather than duplicates the capstone (capstone = "did tests run?"; Stryker = "do tests catch injected bugs?"). Caveats: compute cost and the **equivalent-mutant problem** (undecidable in general) → 100% is unreachable; gate on a _threshold_, not perfection. **Placement (grounded — follow-up, [stryker-incremental], [stryker-config]):**
>   - **Nightly/scheduled full run** (`stryker run`, optionally `--force`) is the _gate_: set `thresholds.break` (e.g. start at `null` to baseline, then ratchet) so a mutation score below the bar exits 1 and reds the build. Defaults are `{ high: 80, low: 60, break: null }` — `null` never fails, so you must set `break` to make it a gate. Scope with `mutate` to production files only.
>   - **Per-PR fast feedback** via `--incremental` (reuses `reports/stryker-incremental.json`, re-mutates only changed code) or `--since <ref>` (diff against the merge base) — affected-only, so it stays cheap enough for a PR. Known limit: changes _outside_ mutated/test files aren't detected by incremental, so it's feedback, not the authoritative gate.
>   - Net: **nightly full = the score gate; per-PR incremental = fast signal.** This mirrors bkit's own "slow/expensive tier runs scheduled, not on the merge gate" rule (§2).

---

## 5. E2E vs @live vs smoke boundary `[grounded — follow-up]`

The first pass came back thin here (one claim genuinely refuted 0-3, the rest dropped to stalls). The follow-up grounds it on Fowler + synthetic-monitoring sources, and the result **confirms bkit's existing doctrine**.

**The mock-vs-real decision rule (Fowler).** Mock only collaborators that are _"slow or have bigger side effects (e.g. classes that access databases or make network calls)"_; the deeper reason to double an external third-party is **decoupling** (and quota), not just speed. **Never hit the real production system in automated tests** — _"Blasting thousands of test requests against a production system is a surefire way to get people angry"_ — use a test instance, or for DB/filesystem write narrow integration tests against a **local** instance. ([fowler-pyramid])

**E2E is flaky by nature — minimise it.** Fowler: E2E tests are _"notoriously flaky and often fail for unexpected and unforeseeable reasons"_ (browser quirks, timing, animations, popups); _"aim to reduce the number of end-to-end tests to a bare minimum"_ — cover only critical user journeys. **Subcutaneous** tests (just beneath the UI) or REST-level tests get most of the confidence without browser flakiness. ([fowler-pyramid])

**Contract testing (Pact / consumer-driven contracts)** is the recognised middle ground between mocked integration and full E2E: the consumer writes tests for the interface it needs; the **provider runs those CDC tests in its own pipeline** to catch breaking changes immediately — independent service development without a full integrated deploy. ([fowler-pyramid], [pactflow])

**Keeping live/post-deploy tiers non-blocking: the synthetic-monitoring posture.** Run the same browser/API journeys against the **deployed environment on a schedule** rather than gating merges with them. _"Synthetic journeys are end-to-end tests executed by a real browser … configure[d] to run periodically … against any deployment environments, including production"_ ([elastic-synthetic]) — they catch infra/latency/timeout and rarely-exercised-feature failures CI can't, and moving the flaky browser tier from the PR gate to production monitoring is itself the flakiness fix. General E2E-flakiness hygiene that _does_ belong on the gate: **stable data-attribute selectors, condition-based (not fixed) waits, a predictable starting state, and fixing flakes promptly rather than retrying around them.** ([datadog-e2e]) "Golden"/approval tests assert output against a known-good reference signal — bkit's `@live` "golden" usage (assert a boundary-only signal the real boundary alone can produce) is this idea applied at the external boundary.

> **bkit alignment (confirmed — do not weaken):** the grounded evidence agrees with bkit's doctrine point-for-point —
>
> - **Route external/deployed boundaries to @live**, never substitute a mocked or local-fixture tier (3rd-party API, model/LLM, payment, deployed schema, RLS/tenancy). "A passing local fixture is not evidence prod is correct."
> - **@live degrades to CONCERNS, never blocks** — a green is never silently equated with "works" when the live tier is absent or skipped (`testsLiveSkipped` recorded). This is precisely the "keep the flaky/external tier off the merge gate but never let its absence read as success" posture the synthetic-monitoring sources independently arrive at ([elastic-synthetic], [datadog-e2e]).
> - **Schema-invariant checks** (RLS coverage) pick pgTAP vs. @live catalog-RPC **by deploy topology** — a nuanced position more advanced than anything surfaced.
>
> **Recommendation:** Keep bkit's §"E2E/@live/Smoke" doctrine as-is — the grounded follow-up _validates_ it. The only additive guidance worth shipping: name the **synthetic-monitoring posture** explicitly (the @live/smoke tiers are scheduled production-facing checks, not merge gates) and cross-reference the on-gate E2E-flakiness hygiene (stable selectors, condition-based waits, predictable start state) for consumers running a Playwright tier.

---

## Worked example: gether-life #523 — tiering & de-serializing a real bkit-consumer CI

**Why this is here:** gether-life (Supabase/Vercel/Next.js) runs the **bkit CI scaffold verbatim** (`bkit-decide` → `bkit-tests` / `bkit-tests-migrate` / `bkit-tests-live` → `bkit-tests-check`). Issue [#523] is hard run-timing data, not theory — it both _validates_ §2–§3 and surfaces a scaffold-level limitation bkit ships.

**Diagnosis** (run `27464677879`, a clean ~22m success; up to ~50m observed):

- `bkit-tests` is effectively **one serial job** (every other job is <15s).
- **Playwright E2E = ~12m (>50% of the run), single-threaded** — `workers: 1` is pinned in CI and is _load-bearing_ (single shared family seed); no `--shard`. ~122 cases run strictly serially against the Vercel preview.
- The other **~10m is a serial prelude** — lint → typecheck → unit → build → supabase → integration — all sequential on one runner with no ordering need.
- **Already-good (matches §3a):** `bkit-decide` skips the whole job when unaffected; PRs scope unit/integration/lint/type via `turbo --filter=…[origin/<base>]`; E2E is `WEB_AFFECTED`-gated; the parallel-deploy trick makes the Vercel preview wait measure **0s**.

**Remediations (ranked in the issue) → mapped to this report:**

<!-- prettier-ignore -->
| # | Remediation | PR wall-clock | Maps to |
| --- | --- | --- | --- |
| 1 | **Tier E2E with `@smoke`** — tag ~10–15 critical specs; PR runs `@smoke` only (~2–3m), full suite on dev-push + nightly, keyed on `github.event_name` | ~22m → **~10m** | **finer §2** — a *test-subset* tier between the affected-graph gate and the full suite |
| 2 | **Split the `bkit-tests` monolith into parallel lanes** (lint/type · unit+build · integration · E2E) → wall-clock = `max(lanes)` not sum | ~22m → **~13m** | **scaffold-level** candidate (§6) |
| 3 | **Shard / multi-worker E2E** — blocked by `workers: 1` being load-bearing; needs per-shard data isolation (do with seed-fixture #450) | full ~12m → **~4m** | **§3b × §3d** — sharding is *gated on* fresh/isolated per-shard data |
| 4 | Polish — scope `Build All Packages` with `--filter` (the one unscoped turbo task); verify turbo remote cache is hitting (`--summarize`) | — | **§3a** remote cache |

**The `@smoke` selection rubric (implemented in #524) — transferable:**

- **`@smoke` = "is the app fundamentally up for a normal user?"** Breadth over depth: one top-level `describe` per critical surface, _not_ edge cases. gether-life tagged **8 files → 58 of 250 chromium tests (~23%)**; target **≤ ~⅓**.
- **IN** = a core journey is down (auth, view/CRUD your own data, family core, billing, profile). **OUT** = feature-specific flows, destructive/lifecycle edges, seed/infra plumbing — slower and more seed-dependent, exactly what shouldn't gate every PR. The **full suite still runs on every `dev`/`main` push**, so nothing loses coverage.
- **Mechanism (a real gotcha):** tag via Playwright's first-class `{ tag: "@smoke" }` on the **top-level `test.describe`** (≥1.42; children inherit). Select via a **project-level `grep` on the `chromium` project only — NOT CLI `--grep`** — so the `auth → global-setup → *-setup` dependency chain is not filtered out and left without its fixtures. Verify with `playwright test --list`.
- **Maintenance:** smoke must stay green/reliable — a flaky smoke spec defeats the purpose (demote to full-only; gether-life flags `sign-up` rate-limit flake). New _feature_ spec stays untagged.

**Two scaffold-level lessons for bkit itself:**

1. **The shipped `bkit-tests` job is a serial monolith.** At a real consumer's scale it serialises ~10m of prelude behind ~12m of E2E. The **parallel-lane split (remediation #2)** is largely _stack-agnostic_ CI job topology — a candidate for the scaffold reference (cost: install + supabase-start duplicate per lane; mitigate with turbo remote cache + a Supabase service container). This is the one finding that touches **bkit's own shipped surface**, not just consumer advisories.
2. **The `@smoke` PR-subset is a tier bkit's run-level matrix doesn't model.** The matrix decides _run-level_ (`none`/`partial`/`full`); gether-life adds an orthogonal axis — _which E2E specs_ run per trigger. Worth documenting as the consumer pattern for "what E2E runs on a PR vs. full" (stack-specific Playwright tag mechanism → scaffold/advisory).

---

## 6. bkit alignment scorecard

| Best practice (industry)                                  | bkit status                                                      | Action                                                          |
| --------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------- |
| Static analysis as base tier                              | ✅ pre-push `typecheck` + `bkit check`                           | none                                                            |
| Strict tier separation U/I/E2E/@live/Smoke                | ✅ explicit in testing.md                                        | none                                                            |
| Integration = highest-ROI / lowest-sufficient-tier        | ✅ rubric in testing.md                                          | none                                                            |
| Fast/deterministic tiers gate merge; slow async           | ✅ run-level matrix (`none`/`partial`/`full`)                    | none                                                            |
| Smoke async via `workflow_run`, non-blocking              | ✅ separate workflow                                             | refine: `deployment_status` for external deploys                |
| Fresh-provisioned backing services                        | ✅ `bkit-tests-migrate`, `supabase db reset`                     | none                                                            |
| Executed-count gate (>0 tests per planned tier)           | ✅ `bkit-tests-check` capstone (stronger than `passWithNoTests`) | keep; ban `passWithNoTests=true`                                |
| `executed ≠ exercised` / boundary-only signal             | ✅ hollow-boundary rule + `boundary/unsafe-cast` slop gate       | none                                                            |
| Affected-graph selection (`turbo`/`nx affected`)          | ◑ tier-level `web_affected`/`run_e2e`; n/a for bkit's single pkg | document `fetch-depth: 0` + `--affected` for consumers          |
| Playwright sharding (`--shard` matrix + blob-merge)       | ✗ not documented                                                 | **add optional scaffold block** (needs data isolation — §3d)    |
| Automated flaky classification + bounded retry            | ✗ none (has SHA-cache only)                                      | **add Playwright `retries` + flake tracking**                   |
| Mutation testing (StrykerJS)                              | ✗ none (manual analog only)                                      | **add nightly StrykerJS w/ survival threshold**                 |
| E2E tiering by trigger (`@smoke` PR subset, full on push) | ✗ run-level matrix only                                          | document tag + event-keyed-grep pattern (gether-life #523/#524) |
| Parallel CI job lanes (vs serial `bkit-tests` monolith)   | ◑ single serial `bkit-tests` job                                 | **consider lane-split in scaffold** (gether-life #523)          |
| Contract tests (Pact)                                     | ✗ none                                                           | flag for multi-service consumers only                           |

**Five candidate improvements, in priority order:**

1. **StrykerJS mutation testing** on the Vitest tier — nightly full run with `thresholds.break` as the gate + per-PR `--incremental`/`--since` for fast signal (see §4 placement). Automates bkit's existing "executed ≠ exercised" intent. Highest leverage.
2. **`@smoke` PR-subset E2E tiering** — tag critical specs, event-keyed grep; PR runs the subset (~2–3m), full suite on push + nightly (gether-life #523/#524). Biggest PR-wall-clock win, lowest risk; the directly-proven one.
3. **Playwright `retries` + explicit flake tracking** on the E2E tier — low-risk, directly usable; pair retry with tracking so flakes can't mask regressions.
4. **Document a Playwright sharding block** in the CI scaffold reference — but note it is **gated on per-shard data isolation** (§3d), the constraint that blocks gether-life today.
5. **Parallel-lane split of the `bkit-tests` monolith** — the one scaffold-_structural_ change; turns sum-of-steps into max-of-lanes (gether-life remediation #2).

\#1–4 are **consumer-stack-specific** (Playwright/Vitest tooling) → template scaffold reference / advisories, per bkit's stack-independence rule. **#5 is CI job topology in bkit's shipped scaffold** — the one item that touches bkit's own surface, not just consumer advisories.

---

## Open questions — RESOLVED in the follow-up (2026-06-15, #270)

The four first-pass gaps are now grounded:

1. ~~Post-deploy trigger~~ → **§2 post-deploy mechanics.** `workflow_run` (post-CI, 3-level chain cap) vs. `deployment_status`/Vercel `repository_dispatch` (post-deploy, external platforms). Non-blocking = separate workflow off the merge gate.
2. ~~Mock-vs-real boundary~~ → **§5.** Mock slow/side-effecting collaborators; hit the real boundary in @live; never hit prod in automated tests; minimise E2E; contract tests for service compat; synthetic-monitoring posture for live/smoke.
3. ~~Fresh-DB provisioning~~ → **§3d.** Supabase `start`/`db reset` + `test db` (pgTAP, transaction-isolated) — bkit's `bkit-tests-migrate`; Testcontainers for non-Supabase. App-level tests need unique-ID independence, not transaction isolation.
4. ~~StrykerJS placement~~ → **§4.** Nightly full run + `thresholds.break` gate; per-PR `--incremental`/`--since`. Complements (not duplicates) the executed-count capstone.

**Residual (genuinely still open — lower priority):**

- **Ephemeral preview-environment-per-PR** provisioning (Vercel preview deploys + per-PR DB branching, e.g. Supabase branching) was only lightly touched — worth a dedicated pass if bkit wants to ship a preview-env scaffold block.
- **Whether to actually adopt** Stryker / Playwright sharding / retries in the bkit scaffold is an implementation decision for a separate design issue, not a research question.

---

## Sources

Primary / authoritative (verified this run):

- [web.dev] Testing strategies — https://web.dev/articles/ta-strategies
- [kentcdodds] The Testing Trophy — https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications
- [spotify] Testing of Microservices (Honeycomb) — https://engineering.atspotify.com/2018/01/testing-of-microservices
- [gh-events] GitHub Actions — events that trigger workflows — https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows
- [turbo-ci] Turborepo — Constructing CI — https://turborepo.dev/docs/crafting-your-repository/constructing-ci
- [turbo-run] Turborepo — run reference — https://turborepo.dev/docs/reference/run
- [nx-affected] Nx — affected — https://nx.dev/docs/features/ci-features/affected
- [nx-split] Nx — test-splitting / Atomizer — https://nx.dev/blog/test-splitting-techniques · https://nx.dev/docs/features/ci-features/split-e2e-tasks
- [nx-flaky] Nx — flaky tasks — https://nx.dev/docs/features/ci-features/flaky-tasks
- [pw-sharding] Playwright — test sharding — https://playwright.dev/docs/test-sharding
- [pw-retries] Playwright — test retries — https://playwright.dev/docs/test-retries
- [vitest-pwnt] Vitest — passWithNoTests — https://vitest.dev/config/passwithnotests
- [google-mutation] Google Testing Blog — Mutation Testing — https://testing.googleblog.com/2021/04/mutation-testing.html
- [stryker] StrykerJS — https://github.com/stryker-mutator/stryker-js
- [stryker-states] StrykerJS — mutant states & metrics — https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/
- [fowler-coverage] Martin Fowler — Test Coverage — https://martinfowler.com/bliki/TestCoverage.html
- [icse2021] Petrović et al., "Practical Mutation Testing at Scale" (ICSE 2021) — https://homes.cs.washington.edu/~rjust/publ/mutation_testing_practices_icse_2021.pdf

Follow-up pass (2026-06-15, #270) — grounded by direct fetch:

- [gh-events] GitHub Actions — events (workflow_run / deployment / deployment_status) — https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows
- [vercel-smoke] Vercel post-deploy smoke testing (deployment_status / `repository_dispatch`) — https://vercel.com/docs/deployment-checks · https://github.com/vercel/next.js/discussions/11290
- [fowler-pyramid] Martin Fowler — Practical Test Pyramid (mock-vs-real, contract tests, E2E flakiness, subcutaneous) — https://martinfowler.com/articles/practical-test-pyramid.html
- [pactflow] Pactflow — What is contract testing? — https://pactflow.io/blog/what-is-contract-testing/
- [elastic-synthetic] Elastic — Replace E2E tests with synthetic monitors — https://www.elastic.co/blog/why-and-how-replace-end-to-end-tests-synthetic-monitors
- [datadog-e2e] Datadog — Best practices for maintaining E2E tests (selectors, waits, state) — https://www.datadoghq.com/blog/test-maintenance-best-practices/
- [supabase-testing] Supabase — Testing overview (pgTAP, `supabase test db`, transaction isolation) — https://supabase.com/docs/guides/local-development/testing/overview
- [supabase-ci] Supabase — CLI `supabase test db` reference — https://supabase.com/docs/reference/cli/supabase-test-db
- [testcontainers] Testcontainers — throwaway container instances — https://testcontainers.com/
- [msft-testcontainers] Microsoft ISE — Testing with Testcontainers — https://devblogs.microsoft.com/ise/testing-with-testcontainers/
- [stryker-incremental] StrykerJS — incremental mode (`--incremental`, `--since`) — https://stryker-mutator.io/docs/stryker-js/incremental/
- [stryker-config] StrykerJS — configuration (thresholds high/low/break, `mutate`) — https://stryker-mutator.io/docs/stryker-js/configuration/

Supporting (fetched, not adversarially re-verified):

- [fowler-shapes] Martin Fowler — On the Diverse And Fantastical Shapes of Testing — https://martinfowler.com/articles/2021-test-shapes.html
- [sparrow] When to mock vs. hit live APIs — https://sparrowapp.dev/blogs/when-to-mock-vs-when-to-hit-live-apis-integration-testing-best-practices/

**Cross-references (bkit consumer repos):** gether-life [#523] — CI runtime reduction (tier E2E, de-serialize the `bkit-tests` monolith); [#524] — `@smoke` PR-subset implementation. Real run-timing data behind the § Worked example. (Private repo `gether-life/app-gether-life`.)

**Status of first-pass abstentions/refutations after follow-up:** `workflow_run` depth-3 chaining → **CONFIRMED** ([gh-events]); `deployment`/`deployment_status` as post-deploy hook → **CONFIRMED** ([gh-events]); test-pyramid inverse-count → established-by-consensus (still not adversarially re-verified); Turborepo reads `GITHUB_BASE_REF` → still unconfirmed (don't assert the exact env-var); live-LLM-provider deploy-gating probe → **genuinely refuted (0-3)**, not adopted.
