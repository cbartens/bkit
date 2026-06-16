<!-- bkit:start -->

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

CI runs the tiers through the core 4-job scaffold (full step-by-step in
`.github/workflows/ci.yml` § "FULL CI SCAFFOLD REFERENCE"; run-level shape in
`deployments.md` § Run-level decision matrix):

- **`bkit-decide`** (always-on) computes `run_level` + emits the `bkit-test-plan`
  contract — _what should run_.
- **`bkit-tests`** runs Unit → Integration → E2E (Integration / E2E gated on
  `web_affected` / `run_e2e`).
- **`bkit-tests-migrate`** (optional; DB repos) — an independent **sibling** of `bkit-tests`
  that proves every migration replays from an **empty** database (+ the seed loads) on a fresh
  ephemeral instance. Always runs and reports a status, but self-skips the heavy steps when no
  migration/seed source changed; folds into the `bkit-tests-check` capstone (a red replay reds
  the build). See § Provision backing services fresh.
- **`bkit-tests-live`** runs the `@live` tier against the deployed URL (gated on
  `run_live`; drop the whole job if you have no deploy).
- **`bkit-tests-check`** is the capstone — it fails the run if any tier the plan
  _expected_ was skipped, so a green required check means **validated**, not merely
  "nothing failed". Make it the sole branch-protection required check.

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

- **Speed — tier the suite.** When a single-worker E2E suite dominates CI wall-clock, run only a critical-path **subset** on PRs and the **full** suite on `dev`/`{{DEFAULT_BRANCH}}` push + nightly. Tag ~10–15 specs with the runner's first-class tag facility (Playwright `{ tag: '@smoke' }` on `test.describe`) and select them with a **project-scoped** filter (e.g. a `PW_E2E_GREP` env set only on `pull_request`). Do **not** use a CLI / top-level `--grep`: it also filters the auth / global-setup / seed **setup** projects, so seeding is skipped and every test fails unauthenticated — scope the filter to the browser project so the setup-dependency chain survives (`playwright test --list` to verify). Under turbo strict-env, allow-list the var in the `test:e2e` task `env`. The subset still satisfies the capstone's executed-count `> 0`; the required check stays `bkit-tests-check`.
- **Correctness — migration-coupled PRs.** A preview deploy runs against the **shared** `dev` database, which does not yet carry a PR's unmerged migration (it applies only on the post-merge push). A PR that adds/renames a column **and** uses it in the same PR therefore deterministically 500s pre-merge; a force-all-E2E marker does **not** help (same migration-less DB). Fix: on **feature→`dev` PRs** run E2E against a **local** DB that has applied this PR's migrations (reset local → prod build → run vs `localhost`); keep preview-backed E2E for `dev`/`{{DEFAULT_BRANCH}}` **pushes** (deploy fidelity). The `dev`→`{{DEFAULT_BRANCH}}` release PR (head ref `dev`) already targets the migrated `dev` DB, so it stays on remote. Repos with more than one migration system must apply **all** of them locally.

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

## CI verbosity (`[verbose ci]`)

See `deployments.md` § Commit-message force tags for the marker mechanics (where to put it: PR title for feature-branch pushes, commit message for direct push to `dev` / `{{DEFAULT_BRANCH}}`). This section covers the testing-specific knobs.

**Knobs flipped under the marker:**

- `TURBO_LOG_LEVEL=full` — surfaces Vitest/build output across all turbo steps (otherwise compressed to errors-only)
- `NODE_OPTIONS=--trace-warnings --trace-deprecation` — stacks on deprecations / transitive-dep regressions
- `DEBUG=vercel:*,supabase:*` — Vercel deploy + Supabase migration internal chain (no `pw:*` — duplicates Playwright trace)
- Playwright (when `bkit-stub:e2e` enabled): appends `--trace=on` only — `--video` and `--screenshot` are `playwright.config.ts use:` keys, not CLI flags (Playwright errors on unknown CLI options). The trace.zip captures snapshots / network / console / source, which covers the dominant diagnose use case. Never pass `--reporter=line` — let `playwright.config.ts`'s chain run

**Use when:** debug returns thin evidence (no `file:line`, only "tests failed", e2e fail without trace). `bkit-debug` / `failure-diagnose` auto-recommends. Never on first attempt; never on `bkit-ship` (verbose on a green run is pure cost — artifact storage + run time).

**Hostile gap — Playwright `--reporter=line` override.** If your `playwright test` invocation passes `--reporter=line`, drop it. With the marker on, traces are written but no reporter surfaces them → wasted artifact upload. `bkit install` flags this as an advisory.

**Artifact paths** (already in `.gitignore` via bkit template): `test-results/`, `playwright-report/`, `blob-report/`, `playwright/.auth/`. Never commit these — traces alone run 1-50MB each.

<!-- bkit:end -->
