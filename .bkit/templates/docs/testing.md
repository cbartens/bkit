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

CI runs the tiers through the 4-job scaffold (full step-by-step in
`.github/workflows/ci.yml` § "FULL CI SCAFFOLD REFERENCE"; run-level shape in
`deployments.md` § Run-level decision matrix):

- **`bkit-decide`** (always-on) computes `run_level` + emits the `bkit-test-plan`
  contract — _what should run_.
- **`bkit-tests`** runs Unit → Integration → E2E (Integration / E2E gated on
  `web_affected` / `run_e2e`).
- **`bkit-tests-live`** runs the `@live` tier against the deployed URL (gated on
  `run_live`; drop the whole job if you have no deploy).
- **`bkit-tests-check`** is the capstone — it fails the run if any tier the plan
  _expected_ was skipped, so a green required check means **validated**, not merely
  "nothing failed". Make it the sole branch-protection required check.

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
