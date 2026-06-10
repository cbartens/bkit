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

## Schema-invariant DB checks (RLS coverage, etc.)

Assert DB-level invariants ("every public table has RLS enabled", no hardcoded list) one of two co-equal ways. Pick by **deploy topology**, not by whether you can run pgTAP locally:

- **pgTAP** — `supabase/tests/*.sql` run by `supabase db test` in the `bkit-stub:test-db` step against a CI-local fixture built from `supabase/migrations`. Fast, hermetic, offline; keeps the invariant out of app code. Caveat: the fixture can differ from prod — a migration that doesn't reproduce the live schema leaves this green while prod RLS is actually broken. Best when there is **no** deploy/`@live` tier, or for pure-logic DB unit tests.
- **@live catalog-RPC** — a `SECURITY DEFINER`, service_role-only RPC (e.g. `public.rls_coverage_gaps()`) called over REST from the `@live` tier, validating the **real deployed schema** in `bkit-tests-live`. Needs a deploy + the RPC. **Recommended default once you have a deploy/`@live` tier** — for RLS/tenancy invariants especially, a passing local-fixture check is not evidence that prod is locked down. (Direct port-5432 from CI runners is IPv4-flaky — use the REST path the tier already has.)
- **PostgREST gotcha** — `GET /rest/v1/` (OpenAPI) is service_role-only by default: fetch the exposed surface with the service-role key, then probe each table with the ANON key (only the leak assertion must be anon).

An auto-discovering RLS suite (RLS-enabled / anon-reads-`[]` / cross-tenant-denial, no hardcoded table list) is a natural fit for `bkit-tests-live`; bkit may ship it as a template later.

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
| Integration | `*.integration.test.ts` | Multi-module wiring inside a process. May use `os.tmpdir()` + `process.chdir()`. May spawn `bkit` via `tsx`. | CI (excluded from pre-push) |
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
2. **Smoke spawn test** of `bkit install --full` against a scratch consumer in `os.tmpdir()` (assert exit 0). Catches the failure regardless of which branch introduces it. Lives in `bkit-install.integration.test.ts` § Scenario 5.
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
2. Confirm `.opencode/` tree: agents, commands, `opencode.json`, `plugin/gateguard.js`. Seeded agents share a single local model pin (`qwen2.5-coder:7b`); consumer tunes per-agent.
3. Confirm `bkit check --opencode` exits 0 and `bkit status` shows opencode host + provider. For `ollama-local`, `bkit doctor` surfaces the server-side memory-safety check (`OLLAMA_MAX_LOADED_MODELS=1` / `OLLAMA_NUM_PARALLEL=1` / `OLLAMA_KEEP_ALIVE=2m`).
4. Launch opencode; run `/bkit-plan #<issue>`; confirm subagents dispatch + verdicts collected (on `ollama-local` with `OLLAMA_NUM_PARALLEL=1` the fan-out serializes — one model, no parallel speedup).
5. Confirm provider served the subagents (opencode logs/provider dashboard — not model identity self-report).
6. Edit a `tsconfig.json` in the opencode session; confirm GateGuard plugin injects advisory.
7. Run `bkit upgrade` over a consumer dir seeded with `.bkit/scripts/bkit-mode.sh`; confirm deletion advisory fires (NOT silent preservation).
8. Record outcome in `docs/plans/202606/logs/245-opencode-provider-host/e2e-verdict.md`.

The smoke test (#2) is the load-bearing one — catches `Missing model lookup for {agent}`-class regressions before tag-and-publish. Add a Scenario for every new consumer-side input shape (per-prompt frontmatter field, new template file, new module). The principle: **if a consumer can hit it, CI must hit it first.**

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

`.github/workflows/ci.yml` runs the degenerate 3-job scaffold on every push to `dev`/`main` and PRs into them (bkit is single-package with no deploy, so there is no `bkit-tests-live`):

1. **`bkit-decide`** (always-on) — reads markers, computes `run_level` (`[skip ci]` → none; PR / push-to-`main` / direct `dev` push → full; merged-PR `dev` push → light), emits the `bkit-test-plan` JSON + a `$GITHUB_STEP_SUMMARY` table.
2. **`bkit-tests`** (`if: run_level != 'none'`) — the suite, in order: `pnpm typecheck` → `pnpm test` (unit + integration) → `pnpm format:check` → `pnpm lint:prose` (vale) → `pnpm lint:slop` → `pnpm check:dist` (rebuilds `dist/`, fails on drift) → `pnpm bkit check` (drift gate). A SHA-cache step short-circuits a SHA already green in the last 7 days; `[force build]` / `[force cache]` bypass it.
3. **`bkit-tests-check`** (capstone, `if: !cancelled()`) — asserts `bkit-decide` succeeded and, when `run_level != none`, `bkit-tests` succeeded. This is the SOLE branch-protection required check (`.bkit/scripts/bkit-protect-main.sh`, `REQUIRED_JOB=bkit-tests-check`) — green here means the planned suite actually ran, not merely "nothing failed".

Release workflow (`.github/workflows/release.yml`, tag-triggered) re-runs the `bkit-tests` static + test steps (typecheck → test → format:check → prose → slop → check:dist) before `npm publish`; the `pnpm bkit check` drift gate is intentionally omitted — the tagged tree should already match dev's clean state.
