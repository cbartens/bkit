<!-- bkit:start -->

<!-- bkit:managed v4.7.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Testing

> [!CAUTION]
> **Purpose:** Testing strategy — tier boundaries, framework choices, naming conventions, CI execution.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Describe current state / rules, NOT reasons / history; state what to do; NOT why.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Tiers strictly separated — Static · Unit · Integration · E2E · @live · Smoke.
> - Pre-push: typecheck + format:check + `pnpm test` (unit + in-process integration) + prose + slop:delta + `bkit check`; E2E, @live, service-backed integration excluded (CI — see below). NEVER `--no-verify`.

## CI test tiers (the bkit scaffold)

CI runs tiers through bkit scaffold — **one parallel lane (job) per tier**, not steps in one job (step-by-step: `.github/workflows/ci.yml` § "FULL CI SCAFFOLD REFERENCE"; run-level shape: `deployments.md` § Run-level decision matrix).

Graph **flat and wide**: scope fans out to every lane; capstone joins them. Nothing waits but planner → **wall-clock = slowest single lane**:

```
  bkit-tests-scope ─┬─ bkit-tests-static      ─┬─ bkit-tests-check
    always-on,       ├─ bkit-tests-unit        │    needs: [scope + ALL lanes]
    never skips      ├─ bkit-tests-build       │    if: !cancelled()
    (~15s)           ├─ bkit-tests-integration │    asserts each lane succeeded
                     ├─ bkit-tests-e2e         │    AND each tier's *_ran > 0
                     ├─ bkit-tests-live        │
                     └─ bkit-tests-migration  ─┘

  every lane:           needs:[bkit-tests-scope]; if: run_level != 'none'
  bkit-tests-live:      needs:[bkit-tests-scope]; if: run_live      <- NOT gated on the lanes
  bkit-tests-migration: needs:[bkit-tests-scope] for ORDERING only; the replay itself is
                        unconditional (self-skips its heavy steps when no migration/seed changed)
```

Adopt only lanes your repo has. Add lane the moment its tier exists — tier with no lane = tier nothing gates.

- **`bkit-tests-scope`** (always-on) computes `run_level` + emits `bkit-test-plan` contract — _what should run_.
- **`bkit-tests-static` / `-unit` / `-integration` / `-e2e`** — one **lane per tier**, separate parallel jobs (shape bkit CI + consumers gether/fraser run, not monolithic `bkit-tests` steps). Integration / E2E gate on `web_affected` / `run_e2e`; each lane emits executed-count for capstone and (coverage tiers) posts own coverage comment. Start `-static` + `-unit`, add lane per tier (`deployments.md` § Parallel test lanes).
- **`bkit-tests-migration`** (optional; DB repos) — parallel sibling proving every migration replays from **empty** DB (+ seed loads) on fresh ephemeral instance. Always runs, self-skips heavy steps when no migration/seed changed; folds into `bkit-tests-check` capstone. `needs:` planner for graph ordering only — replay never gated on `run_level`. See § Provision backing services fresh.
- **`bkit-tests-live`** runs `@live` tier against deployed URL (`run_live`; drop job if no deploy). `needs:` **planner only** — parallel to test lanes; do **not** gate behind them (~35% wall-clock on real consumer, buys ~nothing: `@live` push-only, post-merge, PR-validated; non-compiling tree reds via own build).
- **`bkit-tests-check`** capstone — `needs:` **all** lanes; fails if any expected tier skipped or executed zero → green required check = **validated**, not merely "nothing failed". Sole branch-protection required check.

### Which resources may each lane touch?

Every lane must **declare** what it may reach; declaration enforced by lane env — not by comment. Lane that _can_ reach shared remote instance eventually will → cross-run interference, not failure.

<!-- prettier-ignore -->
| Lane | Real external APIs | Stateful backing service (DB / cache / queue) | Deployed app |
| --- | --- | --- | --- |
| `bkit-tests-static` | none | none | none |
| `bkit-tests-unit` | none — **mocked** | none | none |
| `bkit-tests-build` | none | none | none |
| `bkit-tests-integration` | none — **mocked** | **ephemeral, CI-local, fresh each run** | none |
| `bkit-tests-migration` | none | **ephemeral, replayed from EMPTY** | none |
| `bkit-tests-e2e` | none — **mocked** | ephemeral **local** (PR) / the migrated shared one (push) | preview / deployed URL |
| `bkit-tests-live` | **REAL** | the deployed environment's **real** instance | **REAL** deployed URL |

Read table as rule: **`bkit-tests-live` ONLY lane permitted to spend real external quota**; **ONLY `-live` and push-side `-e2e` may touch shared long-lived instance**. Everything else provisions own (§ Provision backing services fresh). Parallel-safe: lanes owning state cannot contend → fan out + raise internal parallelism freely.

> [!IMPORTANT]
> **"Real external API" and "real remote backing service" are two INDEPENDENT axes — never one flag.**
> Most expensive mistake in this doc. Single overloaded gate (`LIVE_API`, `TEST_REAL`, …) meaning _both_ "hit real third-party APIs" _and_ "hit real remote database" collapses unrelated needs. Real consumer result: **10 suites needing ONLY real DB (no external API) sat in serial push-only `@live` lane** — invisible on PRs, inflated gating lane. Moving to `-integration` (ephemeral local DB): `@live` 86→44 tests, PR coverage for first time. Gate each axis on what it needs: external-boundary test → API credential; DB test → DB URL (prefer **ephemeral** — no gate needed).

**Moving suite between lanes = three edits; third bites.** Retag file, move to new lane — **delete old gate**. Suite with `skipIf(!LIVE_API)` in lane that doesn't set `LIVE_API` **silently skips forever** — green lane, plausible count, coverage gone (hollow-green via back door, § Validated means executed). After lane move: assert destination executed count **up** by moved test count.

**Missing gate variable → honest detectable skip — never silent pass.** Tier needing URL/credential run lacks must report skipped (and, if planned, fail capstone), not exit 0 having run nothing. Per-file assert where it matters: `numPassedTests >= 1 && numPendingTests === 0` catches ghost-green no-op and quiet skip.

### Validated means executed, not "didn't fail"

Green capstone = planned tiers _ran tests and passed_ — not merely nothing visibly failed. Three states per tier, gated independently:

- **Absent** — no entrypoint (`test:integration` / `test:live` script, enabled E2E step). The capstone asserts nothing; a repo with no integration / E2E / `@live` tier is fully valid (bkit's own repo has none).
- **Declared + planned to run** — assert the tier ran **and** executed **> 0** tests. This closes the green-with-zero hole: `--passWithNoTests` matching nothing, a `@live`-tagged suite whose owning package declares no `test:live` script (so `turbo run test:live` runs nothing), or every test `skipIf`-gated off — all exit 0 and look green.
- **Declared + correctly skipped** (light run / not `web_affected`) — assert it was _skipped_, not vacuously passed.

A declared tier therefore emits an **executed count** (a runner's machine summary — e.g. vitest `numPassedTests + numFailedTests`); the capstone asserts `count > 0` for every declared-and-planned tier. The same rule at install time is "every tagged suite has a CI home": each `@live`-tagged test must live in a package whose `test:live` script the tier actually invokes, or the tag is dead code.

**A per-tier count won't catch a file that stops running everywhere.** `count > 0` proves each _tier_ ran tests; it does not prove every _test file_ ran in _some_ lane. A file renamed out of its glob, moved to a lane whose filter excludes it, or left carrying a stale `skipIf` (the lane-move trap above) can quietly stop executing in **every** lane — each lane green, each count still plausible. The capstone is the only job that `needs:` every lane, so it is the only place to answer this, on the **union**: reconcile the on-disk test-file inventory against the set of files that executed across all lanes. Skipped in one lane but run in another is fine — only **dead in every lane** is the bug. Keep it a **non-blocking** diagnostic (it must never red the required check) and **full-runs-only** (a PR runs filtered / smoke subsets and any push-only lane is absent, so the PR delta is expected and large — a cry-wolf guard gets turned off); start report-only, then flip to an assert once the allowlist of legitimately-never-run files is seeded from a real inventory.

**Executed is not the same as _exercised_.** `count > 0` proves a test ran; it does NOT prove the test reached the behaviour it claims to cover. A **hollow boundary test** — non-mock, owns a CI home, executes, passes — can still cover nothing if it short-circuits before the boundary. Worked example: a golden test for an external OCR lane called the extractor with the wrong argument shape, so the input field was `undefined`, the extractor returned `{ text: "", extractor: "none" }` in ~2ms, **no API call was ever made**, and the assertion (on a field that didn't exist) was never reached — green in CI, covering zero. A boundary test MUST therefore assert a **ground-truth signal only the real boundary can produce** — a specific returned value / shape / identity / latency floor (e.g. `extractor === "mistral-ocr"` AND `text.length > 50`), never "did not throw" or a value a degenerate / short-circuit path could also return. Two corollaries: (1) when a deploy / `@live` tier exists, route external / deployed-boundary behaviours (3rd-party API, model, payment, deployed schema, RLS/tenancy) to `@live` — a passing local fixture is not evidence prod is correct (§ Schema-invariant DB checks); (2) constructs that silence the type system at a boundary call-site are forbidden — `as unknown as` / `as any` casts and `@ts-ignore` / `@ts-nocheck` / `@ts-expect-error` directives alike — they suppress the contract drift (a renamed SDK field, a changed signature) the boundary test exists to catch, so the bug ships while the test passes against the wrong shape.

**Never manufacture a vacuous green.** `passWithNoTests: true` (or `--passWithNoTests`) makes a runner report PASS with zero tests run — the exact hole the executed-count gate exists to close; it is a **banned override** in any bkit-managed test config. Two adjacent guards: emit the executed count as a build **output** (not a log line) so a build-cache replay (e.g. a task runner like turbo) restores the real number, and let a cache short-circuit report a `cached` sentinel (validated-on-cache, not a hollow 0); assert unit / integration counts only on **non-PR full runs** — a PR run is affected-scoped and can legitimately resolve to 0 affected tests.

### E2E on PRs: tier the suite, watch which DB it hits

Two PR-time E2E concerns, both gated on **real preconditions** (event, head ref), never a kill-switch flag:

- **Speed — tier the suite.** When a single-worker E2E suite dominates CI wall-clock, run only a critical-path **subset** on PRs and the **full** suite on `dev`/`main` push + nightly. Tag ~10–15 specs with the runner's first-class tag facility (Playwright `{ tag: '@smoke' }` on `test.describe`) and select them with a **project-scoped** filter (e.g. a `PW_E2E_GREP` env set only on `pull_request`). Do **not** use a CLI / top-level `--grep`: it also filters the auth / global-setup / seed **setup** projects, so seeding is skipped and every test fails unauthenticated — scope the filter to the browser project so the setup-dependency chain survives (`playwright test --list` to verify). Under turbo strict-env, allow-list the var in the `test:e2e` task `env`. The subset still satisfies the capstone's executed-count `> 0`; the required check stays `bkit-tests-check`.
- **Correctness — migration-coupled PRs.** A preview deploy runs against the **shared** `dev` database, which does not yet carry a PR's unmerged migration (it applies only on the post-merge push). A PR that adds/renames a column **and** uses it in the same PR therefore deterministically 500s pre-merge; a force-all-E2E marker does **not** help (same migration-less DB). Fix: on **feature→`dev` PRs** run E2E against a **local** DB that has applied this PR's migrations (reset local → prod build → run vs `localhost`); keep preview-backed E2E for `dev`/`main` **pushes** (deploy fidelity). The `dev`→`main` release PR (head ref `dev`) already targets the migrated `dev` DB, so it stays on remote. Repos with more than one migration system must apply **all** of them locally.

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
| New / changed migration or seed | **fresh-DB replay** (`bkit-tests-migration`) — replays from empty + the seed loads |
| Post-deploy health of a deployed surface | **Smoke** (post-CI or post-deploy — see `deployments.md`) |

A plan's `Derived Test Matrix` (`docs/plans/template.md`) is the per-feature application of this rubric: one row per behaviour, each mapped to a build + verify task. Boundary rows carry the rigor above — reach the boundary; assert a signal only it can produce; no `as unknown as` at the call-site.

## What each tier must do

Tier-by-tier rules: **do** the rule, avoid the **Not** (the failure it prevents). Stack tools (Vitest / Playwright / a Supabase-style local stack / a Vercel-style preview) appear only as worked examples — the rule is the principle; implement it for your stack.

### Static

- Run the whole non-test gate set: typecheck · format check · lint · prose lint · code-slop scan (full **plus** a PR **delta** gate that fails only net-new findings) · drift check · workflow linter. The cheap deterministic subset (typecheck + unit + drift) also runs **pre-push**; the rest is CI fail-fast **before** any env pull or heavy tier.
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
- Source real credentials **explicitly** (the tier does not auto-load `.env`), then **override** the backing-service vars to the local instance so a stray remote URL can't redirect the tier at production data.
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
- Keep E2E minimal and tier it by trigger (PR subset vs full) — § "E2E on PRs".
- **Not:** clicking by visible text and waiting on `networkidle` — the two classic flaky-E2E footguns.

### @live (golden)

- Cross the **real external / deployed boundary** and assert a **ground-truth signal only it can produce** (§ Validated means executed). Two shapes: **in-process** (the test calls the real SDK / model / API directly) and **deployed-endpoint** (the test fetches the running app) — use whichever observes the boundary you're validating.
- Run it **off the merge gate**: a push-only canary (and / or scheduled), concurrency-keyed so a release-candidate push is **never cancelled** by a later PR re-push — the candidate is @live-validated before promotion.
- **Honest skip vs hollow:** when there is genuinely nothing deployed to validate, **skip with a recorded reason** (the capstone then asserts nothing about its count) — distinct from a tier that ran 0 tests. But a **missing credential with the tier enabled must fail loudly at connect**, never skip — a vacuous skip hides infra rot.
- Never blast a production system with test traffic: use a **synthetic-identity namespace** + a guarded teardown that refuses to delete anything outside it.
- **Not:** a non-mock @live test that short-circuits before the boundary (the hollow case), or one that asserts only "did not throw".

### Migration-replay + seed (the fresh-DB gate)

- Prove every migration **replays from an empty database** on a fresh ephemeral instance, then the **seed loads** — the always-on sibling gate `bkit-tests-migration` (§ Provision backing services fresh). Distinct from the deploy-time "apply only new migrations onto the already-migrated remote" step, which never replays from zero or runs the seed (`deployments.md` § Applying migrations at deploy time).
- **Assert the seed actually loaded** — check a known row exists. A reset / replay can exit 0 while a conditional insert silently no-ops or the seed aborts mid-file; a green replay is not proof the fixture is present (the seed analog of the hollow-boundary rule).
- Generate the seed from a **single deterministic source** — a pure data definition with no wall-clock `now()`, no random values, explicit IDs / enums so triggers don't randomise it — and regenerate the checked-in seed file from it. Two hand-maintained copies drift.
- **Replay-from-empty, not reused-volume.** A bare "start the local stack" can reuse a stale data volume and silently skip newer migrations — it is **not** a freshness proof; only a reset / replay from empty is.
- Trigger the gate on **every** migration / seed source — including the seed **generator** and its data definition, not just the emitted seed file — and replay **every** migration chain (a second ORM / CMS chain this gate never replays is an unverified hole).
- **Not:** treating a reset/replay command's exit 0 as "seed loaded", or proving freshness with a volume-reusing start command.

### Smoke

- After deploy, run a **fast, dependency-light** probe of the live surface (a handful of health / route / contract checks, or a tiny tagged browser subset) — breadth ("is the app fundamentally up?"), not depth.
- It is an **observability gate, not a merge gate**: own workflow, never in branch protection. Trigger plumbing (post-CI vs post-deploy) → `deployments.md` § Smoke trigger plumbing.
- **Not:** a smoke suite wired into branch protection, or one so heavy it can't run on every deploy.

## Schema-invariant DB checks (RLS coverage, etc.)

Assert DB-level invariants ("every public table has RLS enabled", no hardcoded list) one of two co-equal ways. Pick by **deploy topology**, not by whether you can run pgTAP locally:

- **pgTAP** — `supabase/tests/*.sql` run by `supabase db test` in the `bkit-stub:test-db` step against a CI-local fixture built from `supabase/migrations`. Fast, hermetic, offline; keeps the invariant out of app code. Caveat: the fixture can differ from prod — a migration that doesn't reproduce the live schema leaves this green while prod RLS is actually broken. Best when there is **no** deploy/`@live` tier, or for pure-logic DB unit tests.
- **@live catalog-RPC** — a `SECURITY DEFINER`, service_role-only RPC (e.g. `public.rls_coverage_gaps()`) called over REST from the `@live` tier, validating the **real deployed schema** in `bkit-tests-live`. Needs a deploy + the RPC. **Recommended default once you have a deploy/`@live` tier** — for RLS/tenancy invariants especially, a passing local-fixture check is not evidence that prod is locked down. (Direct port-5432 from CI runners is IPv4-flaky — use the REST path the tier already has.)
- **PostgREST gotcha** — `GET /rest/v1/` (OpenAPI) is service_role-only by default: fetch the exposed surface with the service-role key, then probe each table with the ANON key (only the leak assertion must be anon).

An auto-discovering RLS suite (RLS-enabled / anon-reads-`[]` / cross-tenant-denial, no hardcoded table list — so it catches the _next_ table too) belongs in `bkit-tests-live`. The scaffold reference in `.github/workflows/ci.yml` § JOB 3 carries the pattern (Supabase/PostgREST as the worked example). RLS coverage is stack-specific, so bkit ships the **pattern**, not a drop-in test — implement it for your backing store (swap the catalog source + anon-probe for your stack's equivalent).

## Provision backing services fresh

A tier that needs a stateful backing service (database, cache, queue, search index) must run against a **freshly-provisioned** instance, not a long-lived shared one. Green against a shared environment carrying accumulated state is **not** evidence of reproducibility — a migration that never re-applies cleanly, a seed that aborts on an empty store, or a row another run left behind all stay invisible until the service is rebuilt from scratch. Prove a fresh provision + seed succeeds **in CI**: e.g. an ephemeral per-PR database started fresh each run (Supabase: `supabase db reset` + seed). Reserve the shared remote/dev instance for the `@live` tier (it validates the real deployed schema); it is never the integration tier's source of truth. bkit's `bkit-tests-migration` tier (a parallel sibling of the test lanes, gated on the planner for ordering only — `bkit-stub:bkit-tests-migration` in the scaffold reference) is the ready-made home for this gate: it always runs, self-skips when no migration/seed source changed, and folds into the `bkit-tests-check` capstone so a failed replay reds the build.

**"Fresh" means replay-from-empty, not a reused volume.** A bare "start the local stack" command often **reuses an existing data volume** and applies only what's missing — a "fresh" start can silently run a months-old schema while reporting success. Only a reset / replay from an **empty** store is a freshness proof. And a green replay is not a green **seed**: assert the seed actually loaded (a known row exists), because the reset can exit 0 while a conditional insert no-ops or the seed aborts mid-file (§ Migration-replay + seed carries the full seed-determinism rules).

**Multiple migration systems:** a repo running more than one migration chain (e.g. a SQL chain for the public schema **and** an ORM/CMS chain such as Payload or Prisma) must fresh-apply **every** chain here and trigger on **every** migration source dir. A chain this gate never replays is an unverified hole — a broken migration in it lands green.

## Optional hardening (adopt when the cost is justified)

Beyond the gates above, three practices raise confidence further — opt-in, not baseline:

- **Mutation testing** (e.g. StrykerJS over a Vitest suite) automates the "executed ≠ exercised" intent: it injects bugs into production code and fails when no test catches them, surfacing assertion-free / hollow tests the executed-count gate can't see. Run it as a **nightly full pass** gated on a survival-score threshold (start unset to baseline, then ratchet) plus a per-PR **incremental / `--since`** pass for fast affected-only signal. Gate on a threshold, never 100% (equivalent mutants make perfection unreachable). It complements the capstone — capstone asks "did tests run?", mutation asks "do they catch injected bugs?".
- **E2E sharding** (`--shard` matrix + report merge) cuts wall-clock on a large browser suite — but it is **gated on per-shard data isolation** (the unique-ID independence above). A single shared seed pins `workers: 1` and blocks sharding until the data is isolated.
- **Bounded flaky-retry with tracking.** A capped retry on the flake-prone E2E tier is low-risk **only** when paired with explicit flake **tracking** — an auto-retry that silently passes hides a real regression, the inverse of "validated ≠ didn't fail".

## Coverage on PRs

Report vitest coverage on each PR **without a paid product or a third-party service** — the `bkit-stub:coverage` block in `.github/workflows/ci.yml` runs `davelosert/vitest-coverage-report-action` entirely inside Actions with `GITHUB_TOKEN`, posting sticky per-PR comments (safe for private repos; no coverage data leaves the runner). Replaces GitHub Code Quality's coverage-on-PR value (`deployments.md` § Disable GitHub Code Quality before GA billing) — **not** CodeQL security scanning, a separate product.

**Per-tier, not merged.** Unit and integration are measured and commented **separately** (two runs into `coverage/unit` and `coverage/integration`, two comments keyed by a distinct `name:`). A single merged number is the weakest option: coverage is a **union**, so a line covered only by an integration test reads as covered and **hides a missing unit test** — a merged gate lets integration mask a hollow unit suite. The two numbers also have different denominators, so they can't be honestly combined into one.

- **Report-only by default.** No `thresholds`, so coverage never reds the lane — enabling the block on an existing repo can't break it.
- **Reporters are load-bearing.** The action reads `coverage-summary.json` (from the `json-summary` reporter, mandatory) and `coverage-final.json` (from `json`, required for `file-coverage-mode: changes`). Enable both in `coverage.reporter` or the step no-ops.
- **Two runs, separate dirs.** `vitest run --coverage --coverage.reportsDirectory=coverage/unit --exclude '**/*.integration.test.ts'` for unit; a second run into `coverage/integration` for the integration tier. Separate dirs also avoid the last-writer-wins **clobber** a second same-dir `--coverage` run would cause.
- **Thresholds are opt-in and per tier:**
  - **Unit = the gate.** Pass `--coverage.thresholds.branches=<current>` as a CLI flag on the **unit** run only — **branches** is the meaningful floor (line/statement % overstates confidence); set it to your **current** coverage and ratchet up. vitest coverage is per-**run** (root config), **not** per-project, so `projects` does **not** scope it and a `thresholds` block in `vitest.config` would red **both** runs — the per-run flag (or a second `vitest.<tier>.config.ts` run with `-c`) is what keeps the gate off integration. 80% is convention, not best practice — a fetishised high bar breeds assertion-free line-touching tests; the executed-≠-exercised rule (§ Validated means executed) matters far more than the number.
  - **Integration = report-only.** Gate integration on **execution** (the capstone's `integration_ran > 0`), **not** a %. A whole-repo integration % is denominator-noise — integration covers boundaries/flows, not pure logic, and rarely drives every branch, so a hard threshold on it punishes the correct pyramid shape. If you want a real integration %, add `--coverage.include='src/server/**'` on the integration run (same CLI-flag idiom as `--exclude`) to scope it to the integration surface, **then** set a floor, or **ratchet from current** — never a number picked from thin air.
- **Share the unit gate with the build workflow.** Put the unit gate command (the `--coverage … --coverage.thresholds.branches=<current>` run) in a `test:coverage:unit` `package.json` script, and have **both** the CI unit lane **and** the `/bkit-build` pre-PR gate (`bkit-build.md` Step 13) call it — a **single source** for the threshold. A coverage regression then fails in the worktree during build, not only later on the PR; bump the number in one place and both callers move together. Don't duplicate the command into the workflow and "keep them in sync" by comment — that drifts. The build workflow references the script **name** (stack-agnostic), so define the script and the gate engages, omit it and it no-ops — whatever your runner or threshold. (bkit's own repo does exactly this.)
- **Permissions.** The report steps need `pull-requests: write` — declare it at **job level** on the lane that posts. Job-level `permissions:` **replaces** the workflow-level block (not additive), and the SHA-cache step calls `gh run list`, so re-include `actions: read` too or it breaks. **Separate lanes:** with a lane per tier (recommended — see `deployments.md` § Parallel test lanes), each coverage comment posts from its own lane (unit-cov → `bkit-tests-unit`, integration-cov → `bkit-tests-integration`), so put the block on **each** lane that reports. With the combined starter, both live on `bkit-tests-unit`.
- **Fork PRs.** `GITHUB_TOKEN` is read-only for PRs from a fork, so the steps fail — the shipped `head.repo == repo` guard skips them there; adopt the action's `workflow_run` two-workflow pattern if you must comment on fork PRs. The integration step is also guarded on `hashFiles(...)` so a repo with **no integration tier** skips it cleanly.
- **Base-branch delta** (▲▼ vs the default branch) is **not** shipped by default — it needs the base's `coverage-summary.json` (a second run or a stored artifact); wire the action's `json-summary-compare-path` if you want it.

### E2E coverage on PRs

The **E2E tier** (`bkit-stub:e2e-coverage`) reports Playwright coverage the same free, in-Actions, private-repo-safe way — a **third** sticky comment keyed `name: e2e`, never merged into the unit/integration numbers. Unlike vitest there is **no `--coverage` flag**: Playwright is black-box and doesn't instrument your source, so it's a 3-part pipeline.

- **Collect during the run.** Either an **Istanbul instrumented build** (`vite-plugin-istanbul` exposes `window.__coverage__`, scraped in a Playwright fixture — works on every browser) or the **V8 API** (`page.coverage`, Chromium-only, needs source maps). Istanbul is the cross-browser default.
- **Report with Monocart.** `monocart-coverage-reports` (wired via the `monocart-reporter` Playwright reporter) ingests **either** V8 or Istanbul input and emits Istanbul-format `coverage/e2e/coverage-summary.json` + `coverage-final.json` — the **same two files** the vitest action reads (`reports: ['json-summary', 'json', 'lcov']`), so no new commenter is needed.
- **Comment by reuse.** Point `davelosert/vitest-coverage-report-action@v2` at `coverage/e2e` with `name: e2e`. If Monocart's `coverage-final.json` isn't accepted for `file-coverage-mode: changes`, drop to `file-coverage-mode: all`, or comment via a cobertura action (`irongut/CodeCoverageSummary`) on Monocart's `cobertura` report.
- **Report-only — no threshold by default.** A whole-app E2E % is denominator-noise (E2E exercises user **flows**, not every branch), so gate the tier on the **E2E step succeeding**, not a number. For a real E2E %, scope Monocart's `entryFilter`/`sourceFilter` to the surface E2E is meant to cover, **then** ratchet from current — never a picked number.
- **Permissions/forks.** The E2E coverage report runs in the **`bkit-tests-e2e` lane** (or, with the combined starter, in `bkit-tests-unit`), and needs that lane's job-level `pull-requests: write` + `actions: read` + `contents: read` block, or the comment can't post. The `head.repo == repo` guard skips fork PRs; a `hashFiles('coverage/e2e/coverage-summary.json')` guard skips repos with no E2E coverage.

## CI verbosity (`[verbose ci]`)

See `deployments.md` § Commit-message force tags for the marker mechanics (where to put it: PR title for feature-branch pushes, commit message for direct push to `dev` / `main`). This section covers the testing-specific knobs.

**Knobs flipped under the marker:**

- `TURBO_LOG_LEVEL=full` — surfaces Vitest/build output across all turbo steps (otherwise compressed to errors-only)
- `NODE_OPTIONS=--trace-warnings --trace-deprecation` — stacks on deprecations / transitive-dep regressions
- `DEBUG=vercel:*,supabase:*` — Vercel deploy + Supabase migration internal chain (no `pw:*` — duplicates Playwright trace)
- Playwright (when `bkit-stub:e2e` enabled): appends `--trace=on` only — `--video` and `--screenshot` are `playwright.config.ts use:` keys, not CLI flags (Playwright errors on unknown CLI options). The trace.zip captures snapshots / network / console / source, which covers the dominant diagnose use case. Never pass `--reporter=line` — let `playwright.config.ts`'s chain run

**Use when:** debug returns thin evidence (no `file:line`, only "tests failed", e2e fail without trace). `bkit-debug` / `failure-diagnose` auto-recommends. Never on first attempt; never on `bkit-ship` (verbose on a green run is pure cost — artifact storage + run time).

**Hostile gap — Playwright `--reporter=line` override.** If your `playwright test` invocation passes `--reporter=line`, drop it. With the marker on, traces are written but no reporter surfaces them → wasted artifact upload. `bkit install` flags this as an advisory.

**Artifact paths** (already in `.gitignore` via bkit template): `test-results/`, `playwright-report/`, `blob-report/`, `playwright/.auth/`. Never commit these — traces alone run 1-50MB each.

<!-- bkit:end -->

## Stack

- **Runner:** Vitest 4 (`pnpm test` → `vitest run`). Shell: bats (`pnpm test:bats`).
- **Test files** colocated under `.bkit/src/`. `tests/` = bats (`tests/*.bats`) + fixtures (`tests/fixtures/`).
- **No mocking framework.** Real filesystem (`os.tmpdir()`) over mocked `fs`. `vi.spyOn(process, "exit", ...)` only for `process.exit(1)` paths. Narrow exception: `bkit-postinstall.test.ts` mocks `node:child_process` via `vi.hoisted` — extend mock when boundary grows.

## Tiers

<!-- prettier-ignore -->
| Tier | Suffix | Scope | Where it runs |
| --- | --- | --- | --- |
| Unit | `*.test.ts` | Pure functions, single module. No subprocess, no `process.cwd()` change. | Pre-push + CI |
| Integration | `*.integration.test.ts` | Multi-module wiring inside a process. May use `os.tmpdir()` + `process.chdir()`. May spawn `bkit` via `tsx`. | Pre-push (in-process, via `pnpm test`) + CI `bkit-tests-integration` lane; service/DB-backed integration is CI-only |
| E2E | (none yet) | Full end-to-end against a real consumer repo. | Out of scope for bkit |
| @live | (none) | Endpoint tests against a deployed URL (`test:live`). | `bkit-tests-live` job — N/A for bkit (no deploy) |

## Live-test gates in the agent workflows

`/bkit-debug` gates on declared live tier (`test:live` / `test:integration:live` / `test:e2e:live`) when consumer declares one — appended to Run-Tests (`[live=off]` opt-out); recorded in `TEST_SCOPE`. **`/bkit-build` does not run live tier** — @live needs deployed URL; validated post-merge by push-only `bkit-tests-live` + reproduced via `/bkit-debug` (never purely local).

- **Build** — local tiers only (`test`); never `test:live`; @live = push-only canary.
- **Debug** — live boundary iteration 1 (reproduce); diagnose live-tier failure; require fail→pass before close.
- **Soak** (`DEBUG_MODE = SOAK` at start when `DEBUG_ATTEMPT` >= `MAX_DEBUG_ATTEMPT` or `[soak]`, mid-run `Mode: SOAK`, or NORMAL loop exhausted) — one instrument-or-fix step/iteration on live boundary, bounded by `MAX_SOAK_ATTEMPT`.

No live tier (or `[live=off]`) → Debug degrades to CONCERNS + `testsLiveSkipped` in status.jsonl/close comment — green ≠ "works." bkit has no deploy → CONCERNS by design. Build records no `testsLiveSkipped` — @live out of scope, not skipped.

## Consumer-runtime parity rule

CI must catch every consumer `pnpm bkit install` hard-fail. Same `.bkit/src/*` code in repo + consumers — release must not ship untested install paths.

**Required coverage per consumer-runtime hard-fail** (`process.exit(1)` from `bkit install` / `bkit check`):

1. **Unit test** — failure branch (bad input → exit).
2. **Smoke spawn** — `bkit install --claude --cursor --tooling` on scratch consumer (`os.tmpdir()`, exit 0). `bkit-install.integration.test.ts` § Scenario 5.
3. **Stale-state spawn** — pre-seeded upgrade-skew consumer. Same file § Scenario 5.
4. **Phase 3 blocker** — Scenario 6 (exit 1 + recovery) + 7 (`--auto-revert` → `runUninstall`). v0.7.0+.
5. **Mid-failure rollback** — Scenario 9: post-first-module failure → `discardAllStaging`, byte-identical consumer (KN-12). v0.9.0+.

## Heavy-customised consumer fixture

`tests/fixtures/heavy-customised-consumer/` is committed and consumed by:

- `bkit-uninstall-surgical.integration.test.ts` — round-trip uninstall preserves consumer content byte-identically.
- `bkit-modules-upgrade.integration.test.ts` — two-version (v0.5.x → v0.8.0) upgrade-survival regression: consumer Stop hook and `failClosed` and `loop_limit` keys survive deep-containment merge.
- `bkit-upgrade.integration.test.ts` — drift detection against `canonicalHashes`; `--non-interactive` exits non-zero on conflicts.

When adding bkit-managed file types or scope keys, extend fixture — single source of truth for real consumer surface; do not mock.

## Key test files

<!-- prettier-ignore -->
| File | Tier | Scope |
| --- | --- | --- |
| `bkit-doctor.integration.test.ts` | Integration | `bkit doctor` exit 0 and Phase 1 and Phase 3 advisory replay. |
| `bkit-uninstall.test.ts` | Unit | `runUninstall` orchestrator — format-aware decision matrix (fully-managed / markered-text / byte-equal-text), dry-run, idempotency, `--nuke`. |
| `bkit-uninstall-surgical.integration.test.ts` | Integration | Round-trip byte-identity vs `tests/fixtures/heavy-customised-consumer/`; opencode uninstall zero-footprint (P4.T7). |
| `bkit-bkitignore.test.ts` and `bkit-bkitignore.integration.test.ts` | Unit and Integration | `.bkitignore` parser, picomatch matcher, per-key opt-in via env. |
| `bkit-manifest.test.ts` | Unit | Per-module install-write manifest assertions. |
| `bkit-package-json.test.ts` | Unit | `stripManagedKeys` manifest-driven cleanup. |
| `bkit-modules-upgrade.integration.test.ts` | Integration | Two-version fully-managed → json-format migration (consumer key survival); opencode reconverge and seeded `bkit-mode.sh` deletion advisory. |
| `bkit-upgrade.test.ts` and `bkit-upgrade.integration.test.ts` | Unit and Integration | Diff engine, drift detection, `--non-interactive` semantics. |
| `bkit-version.test.ts` (extended) | Unit | `tier3Hashes` (v0.7.0+) and `canonicalHashes` (v0.9.0+) backward-compat reads. |
| `bkit-gateguard-opencode.test.ts` | Unit | opencode GateGuard plugin: subagent-exemption, advisory/deny modes, dedup. |

## Compliance grader test coverage (#234 WS-2)

**Boundary: git diff** — `bkit-comply.integration.test.ts` uses temp git repo + real `git diff parentSha..HEAD`; no mocks at boundary. Canonical pattern for git-diff validation.

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

**Fail-open shell gate** — `tests/telemetry-failopen.bats` SC #4: `false || echo "[bkit-comply] grader unavailable, skipping"` exits 0.

**Gate-wiring audit** — `bkit-comply-gate-wiring.test.ts`: every `pnpm bkit comply` has same-line `|| echo`; none bare under `set -e`.

<!-- prettier-ignore -->
| File | Tier | Scope |
| --- | --- | --- |
| `bkit-paths-policy.test.ts` | Unit | Drift test: committed `.cjs` === `generateGatePathsCjs()` output; `isMirrorPath` / `isGateConfig` correctness. |
| `bkit-comply.test.ts` | Unit | `ruleNoMirrorEdit`, `ruleSkipCiNotHead`, `runGrader`, `buildComplianceRows`, `formatComplianceSummary` — determinism, pass/fail, row shape (`bkitVersion` on every row). |
| `bkit-comply.integration.test.ts` | Integration (boundary: git diff) | Temp git repo and `realGitAdapter`; asserts `no-mirror-edit` flagged on actual diff output. |
| `bkit-comply-gate-wiring.test.ts` | Integration (boundary: workflow files) | Grep-based audit: every wired close gate has `|| echo`, no bare invocation under `set -e`. |
| `tests/telemetry-failopen.bats` SC #4 | Shell (boundary: exit codes) | `|| echo "[bkit-comply] grader unavailable, skipping"` exits 0 when command fails. |

## opencode host test coverage (sub-plan 4)

<!-- prettier-ignore -->
| Matrix row | Test location | Signal |
| --- | --- | --- |
| install-flag CLI selection | `bkit-cli.test.ts` (plan-v4-2 Task 2.3) | `--opencode=<provider>` sets provider correctly |
| install-flag selection and `bkit doctor` / `bkit status` | `bkit-cli.test.ts` (plan-v4-3 Task 4.1) | additive install; doctor/status verbs |
| `bkit-mode.sh` removal and deletion advisory | `bkit-modules-upgrade.integration.test.ts` | seeded copy → `bkit-mode-sh-deletion-required` advisory, NOT silent preservation |
| opencode manifest round-trip | `bkit-uninstall-surgical.integration.test.ts` | install → zero drift → uninstall → zero `.opencode/` footprint |
| opencode reconverge on upgrade | `bkit-modules-upgrade.integration.test.ts` | consumer keys in `opencode.json` survive; bkit keys reconverged |
| GateGuard opencode plugin | `bkit-gateguard-opencode.test.ts` | advisory fires, subagent-exempt, dedup |
| end-to-end (manual) | `e2e-verdict.md` (Task 5.1) | deferred — provider offline during session |

## Manual recipe — opencode E2E (Task 5.1)

Run once a live provider (Ollama or NVIDIA) is available:

1. `bkit install --opencode=ollama-local` (or `--opencode=nvidia`) in a clean consumer repo. (Provider key is `ollama-local`, not bare `ollama` — npm custom-provider format.)
2. Confirm `.opencode/` tree: agents, commands, `opencode.json`, `plugin/gateguard.js`. Seeded agents share a single local model pin (`qwen3-coder:30b`); consumer tunes per-agent.
3. Confirm `bkit check --opencode` exits 0 and `bkit status` shows opencode host and provider. For `ollama-local`, `bkit doctor` surfaces the server-side memory-safety check (`OLLAMA_MAX_LOADED_MODELS=1` / `OLLAMA_NUM_PARALLEL=1` / `OLLAMA_KEEP_ALIVE=2m`).
4. Launch opencode; run `/bkit-plan #<issue>`; confirm subagents dispatch and verdicts collected (on `ollama-local` with `OLLAMA_NUM_PARALLEL=1` the fan-out serializes — one model, no parallel speedup).
5. Confirm provider served the subagents (opencode logs/provider dashboard — not model identity self-report).
6. Edit a `tsconfig.json` in the opencode session; confirm GateGuard plugin injects advisory.
7. Run `bkit upgrade` over a consumer dir seeded with `.bkit/scripts/bkit-mode.sh`; confirm deletion advisory fires (NOT silent preservation).
8. Record outcome in `docs/plans/202606/logs/245-opencode-provider-host/e2e-verdict.md`.

Smoke test is load-bearing — catches `Missing model lookup for {agent}` before publish. Add Scenario per new consumer input shape. **If consumer can hit it, CI must hit it first.**

## Spawning `bkit` from tests

Use project-local `tsx` binary. Do NOT `node --import tsx/register` — `ERR_MODULE_NOT_FOUND` exit 1 passes vacuous exit-code checks. Pattern:

```ts
const tsxBin = path.resolve(__dirname, "../../node_modules/.bin/tsx");
if (!fs.existsSync(tsxBin)) return; // CI without devDeps — skip rather than fail
const result = spawnSync(
  tsxBin,
  [bkitInstallPath, "install", "--claude", "--cursor", "--tooling"],
  {
    cwd: tmpDir,
    encoding: "utf-8",
    timeout: 60_000,
  },
);
expect(result.status, `install crashed:\n${result.stdout}\n${result.stderr}`).toBe(0);
```

`install` requires ≥1 module flag (v4.0.0+) — bare/dropped flags exit 1. Spawn explicit module set under test.

Assert ≥1 positive signal (`[bkit-install]` prefix, exit 0 with reason, or file exists) — else binary-not-found exit 1 passes vacuously.

## Filesystem consumer-repo boundary pattern (#234 WS-4, amended #343)

Harvest boundary tests: real `os.tmpdir()`, `fs.stat`/`fs.readFileSync` ground truth — NO mocks.

1. `fs.mkdtempSync` → temp consumer tree.
2. Write fixture to `consumerPath/.bkit/stats.jsonl`.
3. `snapshotFile` BEFORE harvest.
4. `runHarvest(bkitRoot)`.
5. `snapshotFile` AFTER harvest.
6. `fileUnchanged(before, after)` — content + size byte-identical.
7. `harvest/stats.jsonl` gained expected rows.

**Per-file invariant (#343).** `stats.jsonl` copy-only → step 6 MUST pass. `friction.jsonl` MOVE → prune after store; `fileUnchanged` false by design.

Pruning makes store sole copy until commit — property-test destructive half: store accumulates, malformed never pruned, absent rows left. See `bkit-harvest.integration.test.ts`.

Any read-only filesystem invariant: step 6 = `fileUnchanged` (not mtime). `afterEach(() => fs.rmSync(tmpDir, { recursive: true }))`.

## What not to test

- `.claude/` / `.cursor/` mirror contents — generated at install; test transforms (`applyT1`/`applyT2`/`applyT3`) + `dispatchModules`, not snapshot regen.
- Real `gh`/`vercel` CLIs — stub via `process.env`.
- Network — isolate `bkit-tokens.ts` behind injectable resolvers.

## CI execution

`.github/workflows/ci.yml` runs a 5-job scaffold on every push to `dev` / `main` and PRs into them — a **flat DAG**: `bkit-tests-scope` fans out to every lane, the capstone joins them, so wall-clock == the slowest single lane. bkit has no browser/DB/deploy, so there is no `bkit-tests-build` / `-e2e` / `-migration` / `-live`:

1. **`bkit-tests-scope`** (always-on planner; no `if:`, never skips) — reads markers, computes `run_level` (`[skip ci]` → none, a hard veto over any force marker; `[force build]` / `[force full]` / PR / `workflow_dispatch` / push-to-`main` / direct `dev` push → full; merged-PR `dev` push → light; `commits/{sha}/pulls` API error → full, run-to-be-safe), emits the `bkit-test-plan` JSON via `steps.scope.outputs.plan` and a `$GITHUB_STEP_SUMMARY` table. It is the PLANNER, not a test lane, but it lives in the `bkit-tests-*` namespace — any guard treating every `bkit-tests-*` job as a lane must exempt it BY NAME.
2. **`bkit-tests-static`** (`if: run_level != 'none'`) — static-analysis lane, run on a CLEAN tree (no test artifacts): `pnpm typecheck` → `pnpm format:check` → vale prose lint → `pnpm lint:slop` → slop delta (PR-only) → actionlint → `pnpm check:dist` (rebuilds `dist/`, fails on drift) → `pnpm bkit check` (drift gate). Checks out at `fetch-depth: 0` so slop delta can materialise the PR base as a worktree. Vale is installed in-lane (pinned tarball, sha256-verified before extract, then `vale sync`) — the runner has none and `.vale/styles/` is gitignored, so without it `pnpm lint:prose` guard-skips and the prose gate is silently dead. Also carries the non-blocking promotion-lag warning on `dev` pushes (see `docs/deployments.md` § Promotion-lag warning). A SHA-cache step short-circuits a SHA already green in the last 7 days; `[force build]` / `[force cache]` bypass it.
3. **`bkit-tests-unit`** (`if: run_level != 'none'`) — unit-test lane: runs `pnpm test:coverage:unit`, then the bats shell tier (`npx --yes bats tests/*.bats` — the counter-bus retry-gating helpers and the telemetry fail-open contract, logic vitest cannot reach because it sources `.bkit/scripts/*.sh`). The gate command itself lives in the `test:coverage:unit` **package.json script** — unit suite (`--exclude '**/*.integration.test.ts'`), `--coverage.include` scoped to the logic surface (all `.bkit/src` except the `bkit-modules` data registry), and the branch-coverage floor `--coverage.thresholds.branches` (currently `65`, set just below current and ratcheted up; it lives on the unit run only — vitest coverage is per-run, so a `vitest.config` block would gate both lanes). **SINGLE SOURCE:** `/bkit-build`'s pre-PR gate runs the SAME script, so a coverage drop fails in the worktree before this lane sees it — bump the threshold in `package.json` and both callers move together. The CI step only appends the JSON reporter emitting `tests_ran`. On PRs it posts a `name: unit` coverage comment via `davelosert/vitest-coverage-report-action` (skipped on fork PRs — read-only token). Needs the job-level `permissions:` block (`actions: read` and `contents: read` and `pull-requests: write`) — job-level permissions REPLACE the workflow-level block, so `actions: read` must be re-declared for the SHA-cache `gh run list`. Same SHA-cache short-circuit as static.
4. **`bkit-tests-integration`** (`if: run_level != 'none'`) — integration-test lane (parallel sibling): `vitest run --coverage` over `*.integration.test.ts`, scoped via `--coverage.include` to the engine surface (`modules` / `install` / `upgrade` / `uninstall`), emitting its own `tests_ran`. **Report-only** (no threshold — a whole-repo integration % is denominator-noise and punishes the pyramid shape); posts a `name: integration` coverage comment. A separate lane per tier — mirrors how consumers (gether/fraser) run it and dogfoods the shipped scaffold. Own job-level `permissions:` and SHA-cache.
5. **`bkit-tests-check`** (capstone, `if: !cancelled()`) — asserts `bkit-tests-scope` succeeded and, when `run_level != none`, `bkit-tests-static` and `bkit-tests-unit` and `bkit-tests-integration` all succeeded **and unit and integration each executed > 0 tests** (per-lane `assert_ran` over each lane's `tests_ran`; a SHA-cache short-circuit (`cache_skip`) or `run_level=none` asserts nothing). This is the SOLE branch-protection required check (`.bkit/scripts/bkit-protect-main.sh`, `REQUIRED_JOB=bkit-tests-check`) — green here means the planned suite actually ran, not merely "nothing failed".

Release workflow (`.github/workflows/release.yml`, tag-triggered) re-runs the static and test steps (typecheck → test → format:check → prose → slop → check:dist) before `npm publish`; the `pnpm bkit check` drift gate is intentionally omitted — the tagged tree should already match dev's clean state.

## Packed-tarball migration validation pattern (#234 WS-5)

Validating `bkit telemetry migrate` via a packed tarball in a clean consumer dir (the "dogfood via packed tarball" pattern from MEMORY):

```bash
# In the bkit repo:
pnpm pack
# → @cbartens-bkit-X.Y.Z.tgz

# In a fresh empty dir:
mkdir /tmp/migrate-test && cd /tmp/migrate-test
mkdir docs
cp /path/to/knowledge.md docs/
cp /path/to/decisions.md docs/
echo '{}' > package.json
echo '{}' > docs/knowledge.jsonl
echo '{}' > docs/decisions.jsonl
npm install --save-dev /path/to/@cbartens-bkit-X.Y.Z.tgz
node node_modules/@cbartens/bkit/dist/bkit-install.js telemetry migrate --dry-run
# verify expected row count; then run without --dry-run
node node_modules/@cbartens/bkit/dist/bkit-install.js telemetry migrate
# verify docs/knowledge.jsonl + docs/decisions.jsonl populated, .md deleted, lookup table written
```

**Why:** `pnpm pack` → fresh install catches runtime-dep mis-classification. `bkit check` does NOT — only real pack/install. Mirrors `docs/knowledge.jsonl:120` dogfood discipline.
