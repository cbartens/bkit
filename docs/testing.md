<!-- bkit:start -->

# Testing

> [!CAUTION]
> **Purpose:** Testing strategy — tier boundaries, framework choices, naming conventions, CI execution.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Tiers strictly separated — Unit · Integration · E2E · Smoke.
> - Pre-push runs typecheck + unit tests + `bkit check`; integration and E2E excluded. NEVER `--no-verify`.

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
- **Test files** colocated with source under `.agents/scripts/`. No separate `tests/` tree.
- **No mocking framework.** Prefer real filesystem against `os.tmpdir()` over mocked `fs`. `vi.spyOn(process, "exit", ...)` only where production code calls `process.exit(1)` (T1/T2/T3 hard-fails).

## Tiers

<!-- prettier-ignore -->
| Tier | Suffix | Scope | Where it runs |
| --- | --- | --- | --- |
| Unit | `*.test.ts` | Pure functions, single module. No subprocess, no `process.cwd()` change. | Pre-push + CI |
| Integration | `*.integration.test.ts` | Multi-module wiring inside a process. May use `os.tmpdir()` + `process.chdir()`. May spawn `bkit` via `tsx`. | CI (excluded from pre-push) |
| E2E | (none yet) | Full end-to-end against a real consumer repo. | Out of scope for bkit |

## Consumer-runtime parity rule

bkit's CI must catch any hard-fail a downstream consumer would hit on `pnpm bkit install`. The repo and its consumers run the same `.agents/scripts/*` code, so a release tag must not ship an install path the repo's own CI hasn't exercised end-to-end.

**Required coverage for every consumer-runtime hard-fail** (any `process.exit(1)` reachable from `bkit install` / `bkit check`):

1. **Unit test** of the failure branch (positive: bad input → exit). Cheap regression guard.
2. **Smoke spawn test** of `bkit install --full` against a scratch consumer in `os.tmpdir()` (assert exit 0). Catches the failure regardless of which branch introduces it. Lives in `bkit-install.integration.test.ts` § Scenario 5.
3. **Stale-state spawn test** of `bkit install` / `bkit check` against a consumer pre-seeded with the upgrade-skew condition (e.g. stale `.agents/prompts.md`, missing managed-block markers, malformed YAML). Lives alongside Scenario 5.
4. **Phase 3 blocker exit-1 + recovery test** — Scenario 6 (exit 1 with recovery line) + Scenario 7 (`--auto-revert` calls `runUninstall` in-process before exit). v0.7.0+.
5. **Mid-failure rollback test** — Scenario 9: simulate failure after first module commit; assert consumer files byte-identical to pre-install state via `discardAllStaging` (KN-12). v0.9.0+.

## Heavy-customised consumer fixture

`tests/fixtures/heavy-customised-consumer/` is committed and consumed by:

- `bkit-uninstall.surgical.integration.test.ts` — round-trip uninstall preserves consumer content byte-identically.
- `bkit-modules.upgrade.integration.test.ts` — two-version (v0.5.x → v0.8.0) upgrade-survival regression: consumer Stop hook + `failClosed` + `loop_limit` keys survive deep-containment merge.
- `bkit-upgrade.integration.test.ts` — drift detection against `canonicalHashes`; `--non-interactive` exits non-zero on conflicts.

When adding new bkit-managed file types or new managed-scope keys, extend the fixture rather than mocking — the fixture is the single source of truth for "real consumer surface" testing.

## Test files added in v0.6.x → v1.0

<!-- prettier-ignore -->
| File | Tier | Scope |
| --- | --- | --- |
| `bkit-doctor.integration.test.ts` | Integration | `bkit doctor` exit 0 + Phase 1 + Phase 3 advisory replay. |
| `bkit-uninstall.test.ts` | Unit | `runUninstall` orchestrator — format-aware decision matrix (fully-managed / markered-text / byte-equal-text), dry-run, idempotency, `--nuke`. |
| `bkit-uninstall.surgical.integration.test.ts` | Integration | Round-trip byte-identity vs `tests/fixtures/heavy-customised-consumer/`. |
| `bkit-bkitignore.test.ts` + `bkit-bkitignore.integration.test.ts` | Unit + Integration | `.bkitignore` parser, picomatch matcher, per-key opt-in via env. |
| `bkit-manifest.test.ts` | Unit | Per-module install-write manifest assertions. |
| `bkit-package-json.test.ts` | Unit | `stripManagedKeys` manifest-driven cleanup. |
| `bkit-modules.upgrade.integration.test.ts` | Integration | Two-version fully-managed → json-format migration (consumer key survival). |
| `bkit-upgrade.test.ts` + `bkit-upgrade.integration.test.ts` | Unit + Integration | Diff engine, drift detection, `--non-interactive` semantics. |
| `bkit-version.test.ts` (extended) | Unit | `tier3Hashes` (v0.7.0+) + `canonicalHashes` (v0.9.0+) backward-compat reads. |

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

- `.claude/` and `.cursor/` mirror file contents — generated from `.agents/` at install time; regenerating from a snapshot tests the snapshot, not the install. Test the transform (`applyT1` / `applyT2` / `applyT3`) and dispatch (`dispatchModules`) instead.
- Token resolution against the real `gh`/`vercel` CLIs. Stub via `process.env` overrides.
- Network calls. `bkit-tokens.ts` is the only network-adjacent surface; isolate behind injectable resolvers.

## CI execution

`.github/workflows/ci.yml` runs every push to `dev`/`main` and PRs into them. Order:

1. `pnpm typecheck`
2. `pnpm test` (unit + integration)
3. `pnpm format:check`
4. `pnpm lint:prose` (vale)
5. `pnpm lint:slop`
6. `pnpm check:dist` — rebuilds `dist/` and fails if working tree differs from committed
7. `pnpm bkit check` — drift gate against the bkit repo itself

Release workflow (`.github/workflows/release.yml`, tag-triggered) re-runs steps 1–6 before `npm publish`. Step 7 is intentionally omitted — the tagged tree should already match dev's clean state.
