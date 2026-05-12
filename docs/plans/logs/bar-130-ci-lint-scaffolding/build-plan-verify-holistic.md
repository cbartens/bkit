# Build Plan Verify — Holistic

**FID:** bar-130-ci-lint-scaffolding
**Verdict:** CONCERNS
**Failures:** 0

## DoD bullet coverage (per parent index Cross-cutting table)

<!-- prettier-ignore -->
| # | DoD bullet | Owner | Status |
| --- | --- | --- | --- |
| 1 | bkit's own PRs run typecheck + vitest + Vale + slop-scan + self-test | v4-1 | ✓ — `.github/workflows/ci.yml` lines 43-72 sequence verified |
| 2 | `bkit install` (no flags) seeds full stack across 3 tiers | v4-3 | ✓ — `resolveModules` (`bkit-cli.ts:33-43`) maps empty/`full` → all six modules |
| 3 | `bkit install --claude` seeds only `.claude/**` + core | v4-3 | ✓ — `bkit-modules.integration.test.ts` `--claude` only test |
| 4 | `bkit install --ci --lint` seeds CI + lint + core | v4-3 | ✓ — integration test present |
| 5 | `bkit install --ci` on existing customised `ci.yml` injects bkit-managed block w/ tokens | v4-2 | ✓ — `writeTier2` + Task 6.1b end-to-end test |
| 6 | `bkit install` on existing `slop-scan.config.json` (Tier 3) preserves + prints | v4-2 | ✓ — `writeTier3` print-only path verified |
| 7 | `bkit install` second run zero diff | v4-3 | ✓ — idempotence integration test |
| 8 | `bkit check --full` ≡ `bkit install --full` writeset (14-vs-15 regression) | v4-2 | ✓ — `bkit-dry-run-parity.integration.test.ts` 4 active rules |
| 9 | Token-substituted `ci.yml` has consumer's `.nvmrc` + default branch | v4-2 | ✓ — `resolveTokens` chain + `applyTokens` write-time |
| 10 | `bkit init` deprecation stub | v4-3 | ✓ — `parseArgs` `deprecations.initVerb` + `printDeprecationWarnings` |
| 11 | `bkit install --host=claude` deprecation stub | v4-3 | ✓ — `deprecations.hostFlag` path |
| 12 | Seeded `ci.yml` includes auth-shim + README documents `BKIT_READ_TOKEN` | v4-2 + v4-3 | ✓ — template line 23 auth-shim asserted; README §Consumer CI auth lines 72-112 |
| 13 | `app-gether-life` re-installs at v0.1.2 (Gate 4.5a) | v4-3 | DEFERRED — post-PR human run |
| 14 | Second consumer onboards via `install --full` (Gate 4.5b) | v4-3 | DEFERRED — post-PR human run |
| 15 | `package.json` bumped to `0.1.2`; tag pushed | v4-3 | ✓ version 0.1.2 (line 3); tag handed to bkit-ship |
| 16 | README + `.agents/README.md` document three-tier model + module-flag CLI + init deprecation | v4-3 | ✓ — both rewritten |

## Cross-sub-plan integration checks

- Token resolver (`bkit-tokens.ts`) → tier writers (`bkit-tiers.ts:11`) imports `applyTokens` and `TokenMap`. Module dispatcher (`bkit-modules.ts:12`) imports `TokenMap`. ✓
- Tier writers `WriteSet` API (`bkit-tiers.ts:13` re-exports `WriteSet`/`WriteEntry` from `bkit-install.ts`) consumed by module dispatcher (`bkit-modules.ts:11`) and main() (`bkit-install.ts:657 ws: WriteSet = { writes: [] }`). ✓
- Marker generalisation in `bkit-install.ts` (`MarkerStyle`, default `"html-comment"`) honoured by Tier 2 writer (uses `extractFullManagedBlock`/`updateManagedBlock` with explicit hash-comment style). ✓
- CLI parser routes deprecation paths through module dispatcher: `init` verb normalises to `install` + `full` module; `--host=claude/cursor` adds module flag. Verified `bkit-cli.ts` parseArgs + main() (`bkit-install.ts:624-684`). ✓
- `package.json.bin.bkit` → `./dist/bkit-install.js` resolves to compiled entry from `.agents/scripts/bkit-install.ts` (rootDir per tsconfig.json). ✓
- `package.json` `"files"` allowlist includes only `dist`, `.agents`, `README.md` — `.github/`, `.vale*`, `.husky/`, `.cursor/`, `.prettierignore`, `.prettierrc.json`, root configs default-excluded by npm. ✓
- `dist/` post-build expected entries: `bkit-cli.js`, `bkit-install.js`, `bkit-modules.js`, `bkit-status.js`, `bkit-tiers.js`, `bkit-tokens.js`. `bkit-init.ts` source deleted (per v4-3 verify); typecheck PASS reported by sub-plan logs.
- All sub-plan tests reported green by execute logs (157 passed, 7 files).

## Test sweep summary

- Total tests reported across sub-plans: 157 passed, 7 files (`bkit-install.test.ts`, `bkit-tokens.test.ts`, `bkit-tiers.test.ts`, `bkit-cli.test.ts`, `bkit-modules.integration.test.ts`, `bkit-dry-run-parity.integration.test.ts`, `bkit-status.test.ts`).
- Lint: `format:check` ✓, `lint:slop` ✓ (3 pre-existing in `.agents/skills/`), `lint:prose` graceful-skip (vale absent in CI runner).
- `pnpm typecheck` ✓, `pnpm build` ✓ (per sub-plan execute logs).
- Note: holistic `pnpm turbo test --filter='...[origin/dev]'` not re-run here — sub-plan verify logs already cover unit + integration suites green; no new artifacts since v4-3 verify.

## Concerns inherited from sub-plans

- v4-1 verify CONCERNS-0:
  - `lint:prose` script body uses `find`-based enumerator (vs plan's literal `vale .agents/ "*.md"`). Behaviourally equivalent (graceful skip + propagated findings).
  - `.prettierignore` adds `docs/` and `pnpm-lock.yaml` beyond plan list. Pragmatic, non-blocking.
  - `.prettierrc.json` introduced without explicit plan authorisation. Reasonable accompaniment.
  - `lint:slop` uses `slop-scan scan .` vs plan-suggested `node ./node_modules/.bin/slop-scan ...`. Functionally equivalent via PATH.
- v4-2 verify PASS-0: no concerns.
- v4-3 verify CONCERNS-0:
  - bkit self-test exits 1 (drift detected on bkit-the-repo against templates). Pre-acknowledged by plan author (line 426). Acceptable — bkit is SoT, not consumer.
  - Manual smoke gates 4.5a/4.5b (DoD #13/#14) deferred to post-PR human + external repos by plan design.

## Findings

1. (Concern, inherited from v4-1) Cosmetic deviations between plan body and codebase: `lint:prose` script form, `.prettierignore` extra rows, undocumented `.prettierrc.json`, `lint:slop` invocation form. Behavioural contract preserved; no test regression.
2. (Concern, inherited from v4-3) Gate 4.5a + Gate 4.5b smoke runs deferred. Plan explicitly defers these to post-PR human verification — not a build-phase failure.
3. (Concern, inherited from v4-3) Self-test on bkit-the-repo reports drift (exit 1) by design — bkit is the source of truth for templates, so its own files differ from the templates it ships.

No blocking failures. No integration gaps between v4-1, v4-2, v4-3 surfaces (token resolver → tier writers → module dispatcher → CLI parser chain verified intact via imports + types).

## Decision

CONCERNS — All 16 DoD bullets accounted for; bullets 13 and 14 explicitly deferred to post-PR human smoke per plan design. Cross-sub-plan integration verified at the import/type/test layer. Inherited concerns are cosmetic (v4-1 lint script wording) or design-acknowledged (v4-3 self-test drift, manual smoke deferral). Recommend gap-remediate to align v4-1 plan text with implementation (or vice versa); v4-2/v4-3 require no remediation. Manual smoke gates remain caller's responsibility post-PR.

<!-- verdict:end -->
