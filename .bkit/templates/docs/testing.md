<!-- bkit:start -->

# Testing

> [!CAUTION]
> **Purpose:** Testing strategy — tier boundaries, framework choices, naming conventions, CI execution.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Tiers strictly separated — Unit · Integration · E2E · @live · Smoke.
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

## Schema-invariant DB checks (RLS coverage, etc.)

Assert DB-level invariants ("every public table has RLS enabled", no hardcoded list) one of two co-equal ways. Pick by **deploy topology**, not by whether you can run pgTAP locally:

- **pgTAP** — `supabase/tests/*.sql` run by `supabase db test` in the `bkit-stub:test-db` step against a CI-local fixture built from `supabase/migrations`. Fast, hermetic, offline; keeps the invariant out of app code. Caveat: the fixture can differ from prod — a migration that doesn't reproduce the live schema leaves this green while prod RLS is actually broken. Best when there is **no** deploy/`@live` tier, or for pure-logic DB unit tests.
- **@live catalog-RPC** — a `SECURITY DEFINER`, service_role-only RPC (e.g. `public.rls_coverage_gaps()`) called over REST from the `@live` tier, validating the **real deployed schema** in `bkit-tests-live`. Needs a deploy + the RPC. **Recommended default once you have a deploy/`@live` tier** — for RLS/tenancy invariants especially, a passing local-fixture check is not evidence that prod is locked down. (Direct port-5432 from CI runners is IPv4-flaky — use the REST path the tier already has.)
- **PostgREST gotcha** — `GET /rest/v1/` (OpenAPI) is service_role-only by default: fetch the exposed surface with the service-role key, then probe each table with the ANON key (only the leak assertion must be anon).

An auto-discovering RLS suite (RLS-enabled / anon-reads-`[]` / cross-tenant-denial, no hardcoded table list — so it catches the _next_ table too) belongs in `bkit-tests-live`. The scaffold reference in `.github/workflows/ci.yml` § JOB 3 carries the pattern (Supabase/PostgREST as the worked example). RLS coverage is stack-specific, so bkit ships the **pattern**, not a drop-in test — implement it for your backing store (swap the catalog source + anon-probe for your stack's equivalent).

## Provision backing services fresh

A tier that needs a stateful backing service (database, cache, queue, search index) must run against a **freshly-provisioned** instance, not a long-lived shared one. Green against a shared environment carrying accumulated state is **not** evidence of reproducibility — a migration that never re-applies cleanly, a seed that aborts on an empty store, or a row another run left behind all stay invisible until the service is rebuilt from scratch. Prove a fresh provision + seed succeeds **in CI**: e.g. an ephemeral per-PR database started fresh each run (Supabase: `supabase db reset` + seed). Reserve the shared remote/dev instance for the `@live` tier (it validates the real deployed schema); it is never the integration tier's source of truth. bkit's `bkit-tests-migrate` tier (an independent sibling of `bkit-tests` — `bkit-stub:bkit-tests-migrate` in the scaffold reference) is the ready-made home for this gate: it always runs, self-skips when no migration/seed source changed, and folds into the `bkit-tests-check` capstone so a failed replay reds the build.

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
