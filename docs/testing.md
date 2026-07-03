<!-- bkit:start -->

<!-- bkit:managed v4.1.11 — do NOT edit; run `bkit upgrade` to refresh -->

# Testing

> [!CAUTION]
> **Purpose:** Testing strategy — tier boundaries, framework choices, naming conventions, CI execution.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Tiers strictly separated — Static · Unit · Integration · E2E · @live · Smoke.
> - Pre-push runs typecheck + unit tests + `bkit check`; integration, E2E, and @live excluded (they run in CI — see below). NEVER `--no-verify`.

## CI test tiers (the bkit scaffold)

CI runs the tiers through the bkit scaffold — **one parallel lane (job) per tier**, not steps
in one job (full step-by-step in `.github/workflows/ci.yml` § "FULL CI SCAFFOLD REFERENCE";
run-level shape in `deployments.md` § Run-level decision matrix):

- **`bkit-decide`** (always-on) computes `run_level` + emits the `bkit-test-plan`
  contract — _what should run_.
- **`bkit-tests-static` / `-unit` / `-integration` / `-e2e`** — one **lane per tier**, separate
  parallel jobs (the shape bkit's own CI and consumers gether/fraser run, not steps in a
  monolithic `bkit-tests`). Integration / E2E lanes gate on `web_affected` / `run_e2e`; each lane
  emits its own executed-count for the capstone and (coverage tiers) posts its own coverage
  comment. Start with `-static` + `-unit`, add a lane per tier you have (`deployments.md` §
  Parallel test lanes).
- **`bkit-tests-migrate`** (optional; DB repos) — an independent **sibling** lane
  that proves every migration replays from an **empty** database (+ the seed loads) on a fresh
  ephemeral instance. Always runs and reports a status, but self-skips the heavy steps when no
  migration/seed source changed; folds into the `bkit-tests-check` capstone (a red replay reds
  the build). See § Provision backing services fresh.
- **`bkit-tests-live`** runs the `@live` tier against the deployed URL (gated on
  `run_live`; drop the whole job if you have no deploy).
- **`bkit-tests-check`** is the capstone — it `needs:` **all** lanes and fails the run if any tier
  the plan _expected_ was skipped or executed zero, so a green required check means **validated**,
  not merely "nothing failed". Make it the sole branch-protection required check.

### Validated means executed, not "didn't fail"

A green capstone must mean the planned tiers _ran tests and passed_ — not that nothing visibly failed. Each tier has three states, gated independently:

- **Absent** — no entrypoint (`test:integration` / `test:live` script, enabled E2E step). The capstone asserts nothing; a repo with no integration / E2E / `@live` tier is fully valid (bkit's own repo has none).
- **Declared + planned to run** — assert the tier ran **and** executed **> 0** tests. This closes the green-with-zero hole: `--passWithNoTests` matching nothing, a `@live`-tagged suite whose owning package declares no `test:live` script (so `turbo run test:live` runs nothing), or every test `skipIf`-gated off — all exit 0 and look green.
- **Declared + correctly skipped** (light run / not `web_affected`) — assert it was _skipped_, not vacuously passed.

A declared tier therefore emits an **executed count** (a runner's machine summary — e.g. vitest `numPassedTests + numFailedTests`); the capstone asserts `count > 0` for every declared-and-planned tier. The same rule at install time is "every tagged suite has a CI home": each `@live`-tagged test must live in a package whose `test:live` script the tier actually invokes, or the tag is dead code.

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
| New / changed migration or seed | **fresh-DB replay** (`bkit-tests-migrate`) — replays from empty + the seed loads |
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

- Prove every migration **replays from an empty database** on a fresh ephemeral instance, then the **seed loads** — the always-on sibling gate `bkit-tests-migrate` (§ Provision backing services fresh). Distinct from the deploy-time "apply only new migrations onto the already-migrated remote" step, which never replays from zero or runs the seed (`deployments.md` § Applying migrations at deploy time).
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

A tier that needs a stateful backing service (database, cache, queue, search index) must run against a **freshly-provisioned** instance, not a long-lived shared one. Green against a shared environment carrying accumulated state is **not** evidence of reproducibility — a migration that never re-applies cleanly, a seed that aborts on an empty store, or a row another run left behind all stay invisible until the service is rebuilt from scratch. Prove a fresh provision + seed succeeds **in CI**: e.g. an ephemeral per-PR database started fresh each run (Supabase: `supabase db reset` + seed). Reserve the shared remote/dev instance for the `@live` tier (it validates the real deployed schema); it is never the integration tier's source of truth. bkit's `bkit-tests-migrate` tier (an independent sibling of `bkit-tests` — `bkit-stub:bkit-tests-migrate` in the scaffold reference) is the ready-made home for this gate: it always runs, self-skips when no migration/seed source changed, and folds into the `bkit-tests-check` capstone so a failed replay reds the build.

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

- **Runner:** Vitest 2 (`pnpm test` → `vitest run`).
- **Test files** colocated with source under `.bkit/src/`. No separate `tests/` tree.
- **No mocking framework.** Prefer real filesystem against `os.tmpdir()` over mocked `fs`. `vi.spyOn(process, "exit", ...)` only where production code calls `process.exit(1)` (T1/T2/T3 hard-fails).

## Tiers

<!-- prettier-ignore -->
| Tier | Suffix | Scope | Where it runs |
| --- | --- | --- | --- |
| Unit | `*.test.ts` | Pure functions, single module. No subprocess, no `process.cwd()` change. | Pre-push + CI |
| Integration | `*.integration.test.ts` | Multi-module wiring inside a process. May use `os.tmpdir()` + `process.chdir()`. May spawn `bkit` via `tsx`. | CI — `bkit-tests-integration` lane (excluded from pre-push) |
| E2E | (none yet) | Full end-to-end against a real consumer repo. | Out of scope for bkit |
| @live | (none) | Endpoint tests against a deployed URL (`test:live`). | `bkit-tests-live` job — N/A for bkit (no deploy) |

## Live-test gates in the agent workflows

`/bkit-build` and `/bkit-debug` gate on the declared live tier (`test:live` / `test:integration:live` / `test:e2e:live`) when a consumer declares one — appended to the Run-Tests command (opt-out via `[live=off]`); what actually ran is recorded in `TEST_SCOPE` (no separate capability flag).

- **Build** appends the curated `test:live` LAST in its pre-PR run and will not raise a PR if it fails (`scope` records the verbatim test command).
- **Debug** runs the live boundary as iteration 1 of its Run-Tests loop (the reproduce), anchors diagnosis on the live-tier failure (treating infra/credential failures as environment, not feature-broken), and requires the live tier to flip fail -> pass before close (the empirical fail-then-pass gate).
- **Soak** (`DEBUG_MODE = SOAK`, entered at invocation start when `DEBUG_ATTEMPT` >= `MAX_DEBUG_ATTEMPT` or `[soak]` is set, mid-run when the diagnose agent sets `Mode: SOAK`, or when the NORMAL loop exhausts all three strategies) replaces diagnose+remediate with one accumulating-context instrument-or-fix step per loop iteration against the live boundary, bounded by `MAX_SOAK_ATTEMPT`.

When no live tier is declared (or `[live=off]`), these gates degrade to CONCERNS with a consumer-neutral `testsLiveSkipped` recorded in status.jsonl and the close comment — a green result is never silently equated with "works." bkit itself declares all live tiers absent (no deploy), so its own runs degrade to CONCERNS by design.

## Consumer-runtime parity rule

bkit's CI must catch any hard-fail a downstream consumer would hit on `pnpm bkit install`. The repo and its consumers run the same `.bkit/src/*` code, so a release tag must not ship an install path the repo's own CI hasn't exercised end-to-end.

**Required coverage for every consumer-runtime hard-fail** (any `process.exit(1)` reachable from `bkit install` / `bkit check`):

1. **Unit test** of the failure branch (positive: bad input → exit). Cheap regression guard.
2. **Smoke spawn test** of `bkit install --claude --cursor --tooling` against a scratch consumer in `os.tmpdir()` (assert exit 0). Catches the failure regardless of which branch introduces it. Lives in `bkit-install.integration.test.ts` § Scenario 5.
3. **Stale-state spawn test** of `bkit install` / `bkit check` against a consumer pre-seeded with the upgrade-skew condition (e.g. stale `.bkit/prompts.md`, missing managed-block markers, malformed YAML). Lives alongside Scenario 5.
4. **Phase 3 blocker exit-1 + recovery test** — Scenario 6 (exit 1 with recovery line) + Scenario 7 (`--auto-revert` calls `runUninstall` in-process before exit). v0.7.0+.
5. **Mid-failure rollback test** — Scenario 9: simulate failure after first module commit; assert consumer files byte-identical to pre-install state via `discardAllStaging` (KN-12). v0.9.0+.

## Heavy-customised consumer fixture

`tests/fixtures/heavy-customised-consumer/` is committed and consumed by:

- `bkit-uninstall.surgical.integration.test.ts` — round-trip uninstall preserves consumer content byte-identically.
- `bkit-modules.upgrade.integration.test.ts` — two-version (v0.5.x → v0.8.0) upgrade-survival regression: consumer Stop hook + `failClosed` + `loop_limit` keys survive deep-containment merge.
- `bkit-upgrade.integration.test.ts` — drift detection against `canonicalHashes`; `--non-interactive` exits non-zero on conflicts.

When adding new bkit-managed file types or new managed-scope keys, extend the fixture rather than mocking — the fixture is the single source of truth for "real consumer surface" testing.

## Key test files

<!-- prettier-ignore -->
| File | Tier | Scope |
| --- | --- | --- |
| `bkit-doctor.integration.test.ts` | Integration | `bkit doctor` exit 0 + Phase 1 + Phase 3 advisory replay. |
| `bkit-uninstall.test.ts` | Unit | `runUninstall` orchestrator — format-aware decision matrix (fully-managed / markered-text / byte-equal-text), dry-run, idempotency, `--nuke`. |
| `bkit-uninstall.surgical.integration.test.ts` | Integration | Round-trip byte-identity vs `tests/fixtures/heavy-customised-consumer/`; opencode uninstall zero-footprint (P4.T7). |
| `bkit-bkitignore.test.ts` + `bkit-bkitignore.integration.test.ts` | Unit + Integration | `.bkitignore` parser, picomatch matcher, per-key opt-in via env. |
| `bkit-manifest.test.ts` | Unit | Per-module install-write manifest assertions. |
| `bkit-package-json.test.ts` | Unit | `stripManagedKeys` manifest-driven cleanup. |
| `bkit-modules.upgrade.integration.test.ts` | Integration | Two-version fully-managed → json-format migration (consumer key survival); opencode reconverge + seeded `bkit-mode.sh` deletion advisory. |
| `bkit-upgrade.test.ts` + `bkit-upgrade.integration.test.ts` | Unit + Integration | Diff engine, drift detection, `--non-interactive` semantics. |
| `bkit-version.test.ts` (extended) | Unit | `tier3Hashes` (v0.7.0+) + `canonicalHashes` (v0.9.0+) backward-compat reads. |
| `bkit-gateguard-opencode.test.ts` | Unit | opencode GateGuard plugin: subagent-exemption, advisory/deny modes, dedup. |

## opencode host test coverage (sub-plan 4)

<!-- prettier-ignore -->
| Matrix row | Test location | Signal |
| --- | --- | --- |
| install-flag CLI selection | `bkit-cli.test.ts` (plan-v4-2 Task 2.3) | `--opencode=<provider>` sets provider correctly |
| install-flag selection + `bkit doctor`/`bkit status` | `bkit-cli.test.ts` (plan-v4-3 Task 4.1) | additive install; doctor/status verbs |
| `bkit-mode.sh` removal + deletion advisory | `bkit-modules.upgrade.integration.test.ts` | seeded copy → `bkit-mode-sh-deletion-required` advisory, NOT silent preservation |
| opencode manifest round-trip | `bkit-uninstall.surgical.integration.test.ts` | install → zero drift → uninstall → zero `.opencode/` footprint |
| opencode reconverge on upgrade | `bkit-modules.upgrade.integration.test.ts` | consumer keys in `opencode.json` survive; bkit keys reconverged |
| GateGuard opencode plugin | `bkit-gateguard-opencode.test.ts` | advisory fires, subagent-exempt, dedup |
| end-to-end (manual) | `e2e-verdict.md` (Task 5.1) | deferred — provider offline during session |

## Manual recipe — opencode E2E (Task 5.1)

Run once a live provider (Ollama or NVIDIA) is available:

1. `bkit install --opencode=ollama-local` (or `--opencode=nvidia`) in a clean consumer repo. (Provider key is `ollama-local`, not bare `ollama` — npm custom-provider format.)
2. Confirm `.opencode/` tree: agents, commands, `opencode.json`, `plugin/gateguard.js`. Seeded agents share a single local model pin (`qwen3-coder:30b`); consumer tunes per-agent.
3. Confirm `bkit check --opencode` exits 0 and `bkit status` shows opencode host + provider. For `ollama-local`, `bkit doctor` surfaces the server-side memory-safety check (`OLLAMA_MAX_LOADED_MODELS=1` / `OLLAMA_NUM_PARALLEL=1` / `OLLAMA_KEEP_ALIVE=2m`).
4. Launch opencode; run `/bkit-plan #<issue>`; confirm subagents dispatch + verdicts collected (on `ollama-local` with `OLLAMA_NUM_PARALLEL=1` the fan-out serializes — one model, no parallel speedup).
5. Confirm provider served the subagents (opencode logs/provider dashboard — not model identity self-report).
6. Edit a `tsconfig.json` in the opencode session; confirm GateGuard plugin injects advisory.
7. Run `bkit upgrade` over a consumer dir seeded with `.bkit/scripts/bkit-mode.sh`; confirm deletion advisory fires (NOT silent preservation).
8. Record outcome in `docs/plans/202606/logs/245-opencode-provider-host/e2e-verdict.md`.

The smoke test is the load-bearing one — catches `Missing model lookup for {agent}`-class regressions before tag-and-publish. Add a Scenario for every new consumer-side input shape (per-prompt frontmatter field, new template file, new module). The principle: **if a consumer can hit it, CI must hit it first.**

## Spawning `bkit` from tests

Use the project-local `tsx` binary directly. Do NOT invoke `node --import tsx/register <script>` — `tsx` package exports do not resolve from the binary path and the resulting `ERR_MODULE_NOT_FOUND` exits with status 1, which silently passes assertions that only check exit code. Pattern:

```ts
const tsxBin = path.resolve(__dirname, "../../node_modules/.bin/tsx");
if (!fs.existsSync(tsxBin)) return; // CI without devDeps — skip rather than fail
const result = spawnSync(tsxBin, [bkitInstallPath, "install", "--full"], {
  cwd: tmpDir,
  encoding: "utf-8",
  timeout: 60_000,
});
expect(result.status, `install crashed:\n${result.stdout}\n${result.stderr}`).toBe(0);
```

Always assert at least one positive signal (a known log prefix like `[bkit-install]`, an exit code 0 with reason in the failure message, or a written-file existence) — otherwise a binary-not-found exit-1 would pass vacuously.

## What not to test

- `.claude/` and `.cursor/` mirror file contents — generated from `.bkit/workflows/` + `.bkit/prompts/` at install time; regenerating from a snapshot tests the snapshot, not the install. Test the transform (`applyT1` / `applyT2` / `applyT3`) and dispatch (`dispatchModules`) instead.
- Token resolution against the real `gh`/`vercel` CLIs. Stub via `process.env` overrides.
- Network calls. `bkit-tokens.ts` is the only network-adjacent surface; isolate behind injectable resolvers.

## CI execution

`.github/workflows/ci.yml` runs a 5-job scaffold on every push to `dev`/`main` and PRs into them — **one parallel lane per tier**, dogfooding the separate-lane shape consumers run. bkit has no browser/DB/deploy, so there is no `bkit-tests-e2e`/`-migrate`/`-live`:

1. **`bkit-decide`** (always-on) — reads markers, computes `run_level` (`[skip ci]` → none; PR / push-to-`main` / direct `dev` push → full; merged-PR `dev` push → light), emits the `bkit-test-plan` JSON + a `$GITHUB_STEP_SUMMARY` table.
2. **`bkit-tests-static`** (`if: run_level != 'none'`) — static-analysis lane: `pnpm typecheck` → `pnpm format:check` → vale prose lint → `pnpm lint:slop` → slop delta (PR-only) → actionlint → `pnpm check:dist` (rebuilds `dist/`, fails on drift) → `pnpm bkit check` (drift gate). A SHA-cache step short-circuits a SHA already green in the last 7 days; `[force build]` / `[force cache]` bypass it.
3. **`bkit-tests-unit`** (`if: run_level != 'none'`) — unit-test lane (parallel sibling of static): `vitest run --coverage` over the unit suite (`--exclude '**/*.integration.test.ts'`), **scoped per tier** via `--coverage.include` to the logic surface (all `.bkit/src` except the `bkit-modules` data registry), with a JSON reporter emitting `tests_ran`. **Gated on branch coverage** via a per-run `--coverage.thresholds.branches` flag (currently `65`, set just below current and ratcheted up; the flag lives on the unit run only — vitest coverage is per-run, so a `vitest.config` block would gate both lanes). On PRs it posts a `name: unit` coverage comment via `davelosert/vitest-coverage-report-action`. Needs the job-level `permissions:` block (`actions: read` + `contents: read` + `pull-requests: write`). Same SHA-cache short-circuit as static.
4. **`bkit-tests-integration`** (`if: run_level != 'none'`) — integration-test lane (parallel sibling): `vitest run --coverage` over `*.integration.test.ts`, scoped via `--coverage.include` to the engine surface (`modules`/`install`/`upgrade`/`uninstall`), emitting its own `tests_ran`. **Report-only** (no threshold — a whole-repo integration % is denominator-noise and punishes the pyramid shape); posts a `name: integration` coverage comment. A separate lane per tier — mirrors how consumers (gether/fraser) run it and dogfoods the shipped scaffold. Own job-level `permissions:` + SHA-cache.
5. **`bkit-tests-check`** (capstone, `if: !cancelled()`) — asserts `bkit-decide` succeeded and, when `run_level != none`, `bkit-tests-static` + `bkit-tests-unit` + `bkit-tests-integration` all succeeded **and unit + integration each executed > 0 tests** (per-lane `assert_ran` over each lane's `tests_ran`; a SHA-cache short-circuit (`cache_skip`) or `run_level=none` asserts nothing). This is the SOLE branch-protection required check (`.bkit/scripts/bkit-protect-main.sh`, `REQUIRED_JOB=bkit-tests-check`) — green here means the planned suite actually ran, not merely "nothing failed".

Release workflow (`.github/workflows/release.yml`, tag-triggered) re-runs the static + test steps (typecheck → test → format:check → prose → slop → check:dist) before `npm publish`; the `pnpm bkit check` drift gate is intentionally omitted — the tagged tree should already match dev's clean state.
