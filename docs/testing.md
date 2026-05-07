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
> - Pre-push runs lint/typecheck/unit only; integration and E2E excluded. NEVER `--no-verify`.

<!-- bkit:end -->

## Stack

- **Runner:** Vitest 2 (`pnpm test` → `vitest run`).
- **Test files** colocated with source under `.agents/scripts/`. No separate `tests/` tree.
- **No mocking framework.** Prefer real filesystem against `os.tmpdir()` over mocked `fs`. `vi.spyOn(process, "exit", ...)` only where the production code calls `process.exit(1)` (T1/T2/T3 hard-fails).

## Tiers

| Tier | Suffix | Scope | Where it runs |
| --- | --- | --- | --- |
| Unit | `*.test.ts` | Pure functions, single module. No subprocess, no `process.cwd()` change. | Pre-push + CI |
| Integration | `*.integration.test.ts` | Multi-module wiring inside a process. May use `os.tmpdir()` + `process.chdir()`. May spawn `bkit` via `tsx`. | CI (excluded from pre-push) |
| E2E | (none yet) | Full end-to-end against a real consumer repo. | Out of scope for bkit |

## Consumer-runtime parity rule

bkit's CI must catch any hard-fail that a downstream consumer would hit on `pnpm bkit install`. The repo and its consumers run the same `.agents/scripts/*` code, so a release tag must not ship an install path the repo's own CI hasn't exercised end-to-end.

**Required coverage for every consumer-runtime hard-fail** (any `process.exit(1)` reachable from `bkit install` / `bkit check`):

1. **Unit test** of the failure branch (positive: bad input → exit). Cheap regression guard.
2. **Smoke spawn test** of `bkit install --full` against a scratch consumer in `os.tmpdir()` (assert exit 0). Catches the failure regardless of which branch introduces it. Lives in `bkit-install.integration.test.ts` § Scenario 5.
3. **Stale-state spawn test** of `bkit install` / `bkit check` against a consumer pre-seeded with the upgrade-skew condition (e.g. stale `.agents/prompts.md`, missing managed-block markers, malformed YAML). Lives alongside Scenario 5.

The smoke test (#2) is the load-bearing one — catches `Missing model lookup for {agent}`-class regressions before tag-and-publish. Add a Scenario for every new consumer-side input shape (per-prompt frontmatter field, new template file, new module). The principle: **if a consumer can hit it, CI must hit it first.**

## Spawning `bkit` from tests

Use the project-local `tsx` binary directly. Do NOT invoke `node --import tsx/register <script>` — `tsx` package exports do not resolve from the binary path and the resulting `ERR_MODULE_NOT_FOUND` exits with status 1, which silently passes assertions that only check exit code. Pattern:

```ts
const tsxBin = path.resolve(__dirname, "../../node_modules/.bin/tsx");
if (!fs.existsSync(tsxBin)) return; // CI without devDeps — skip rather than fail
const result = spawnSync(tsxBin, [bkitInstallPath, "install", "--full"], { cwd: tmpDir, encoding: "utf-8", timeout: 60_000 });
expect(result.status, `install crashed:\n${result.stdout}\n${result.stderr}`).toBe(0);
```

Always assert at least one positive signal (a known log prefix like `[bkit-install]`, an exit code 0 with reason in the failure message, or a written-file existence) — otherwise a binary-not-found exit-1 would pass vacuously.

## What not to test

- `.claude/` and `.cursor/` mirror file contents — generated from `.agents/` at install time, regenerating from a snapshot would test the snapshot, not the install. Test the transform (`applyT1` / `applyT2` / `applyT3`) and the dispatch (`dispatchModules`) instead.
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
