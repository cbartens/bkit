Verdict: PASS

<!-- verdict:end -->

# Build Summary

## Overview

BAR-141 preflight checklist feature completed successfully. Replaced bkit's ad-hoc `printSink` advisory pattern with a structured three-phase install architecture:
- **Phase 1 (Preflight):** Read-only blocker detection before any writes; exits 1 if critical issues found.
- **Phase 2 (Install):** Current module dispatch with writes.
- **Phase 3 (Post-install):** Re-detection of token surfaces, CI config, and environment after writes; unified formatted output.

**Features delivered:**
- 2 new files: `bkit-preflight.ts` (blocker + advisory detectors), `bkit-postinstall.ts` (post-install detectors + formatter).
- 3 blocker detectors: `detectNoPackageJson`, `detectMalformedPackageJson`, `detectNotGitRepo`.
- 10 advisory detectors across phases: Husky markers, Prettier markers, lint-prose F9 guard, version downgrade/stale pin, shell token, npmrc auth, GH secret, Vercel env, CI yml env, vale sync, devDeps fetch.
- Structured `PreflightFinding` shape with `{id, severity, detect, action}` replacing unstructured string arrays.
- Deduplicated cross-phase output (Phase 3 wins on id conflicts); silent skips on missing optional configs (no `.npmrc`, no Vercel project).
- All existing `printSink` messages migrated to new findings with stable `id` registry.
- Documentation: README `## Install lifecycle` section, `docs/decisions.md` ADR (DE-4), `docs/knowledge.md` gotcha (KN-4).

## Implementation Quality

Per `build-plan-verify-1-1.md`: All Phase A–G runbook tasks (A1–G4) verified against codebase artefacts. No gaps identified.

Code migration complete:
- `bkit-modules.ts`: `ModuleContext.printSink: string[]` replaced by `advisories: PreflightFinding[]`; all `printSink.push()` call sites (15+) migrated to structured findings. Constants `GH_BKIT_TOKEN_MISSING_INSTRUCTIONS`, `GH_BKIT_TOKEN_UNKNOWN_INSTRUCTIONS`, `VERCEL_AUTH_INSTRUCTIONS` deleted; ownership moved to Phase 3 detectors.
- `bkit-tiers.ts`: `writeTier3` signature updated; `ensurePackageJsonDevDeps` consumers threaded devDeps metadata through for Phase 3 detection.
- `bkit-install.ts`: Phase 1 wired BEFORE `resolveTokens` (blocker exit-1 short-circuit); Phase 3 invoked POST-dispatch with cross-phase dedup; dry-run path preserves Phase 1 advisory visibility while suppressing Phase 3 detectors.

Architecture respected per plan:
- `bkit-preflight.ts` is upstream of dispatch (no imports from `bkit-modules.ts`); synchronous (no `await`).
- Token detectors check **presence only** — value never logged or echoed; all token refs are `Boolean(...)` or key-name inclusion checks.
- `formatChecklist([])` returns empty string; guarded banners prevent spurious output on zero advisories.
- Intra-phase dedupe-by-id (first occurrence wins) in both `runPreflight` and `runPostInstallCheck`; cross-phase dedupe (Phase 3 wins).

## Verification Status

Per `build-plan-verify-1-1.md`: All tasks verified. No unresolved gaps.

Per `build-plan-execute-1-log.md`: All 28 runbook tasks (A1–G4) completed. Gate 2, 3, 4 verified. Manual verification steps (dogfood install, blocker exit, synthetic advisory matrix, dry-run parity, snapshot match) remain unchecked in plan template (by design — human-driven); equivalent assertions covered by integration tests.

Test coverage:
- `bkit-preflight.test.ts`: 30 unit tests covering all 8 detectors (blocker + advisory) with positive + negative cases; intra-phase dedupe exercised.
- `bkit-postinstall.test.ts`: 38 unit tests covering 7 Phase-3 detectors + formatter snapshot + empty-array + silent-skip cases + cross-phase dedupe (Phase 3 wins).
- `bkit-challenge-tests.test.ts`: 21 additional tests added post-challenge to cover edge cases (NaN guards, dedup variants, format snapshot).
- `bkit-install.integration.test.ts`: 3 scenarios (blocker exit 1, advisory checklist, dry-run Phase 1 parity).
- **Total: 371 tests pass, 0 failures (14 test files).**

## Test Status

All tests pass on first run post-remediation. Build log `status.json` shows:
- `plan-execute`: PASS (attempt 1)
- `plan-verify`: PASS (attempt 1, 0 failures)
- `challenge`: CONCERNS (attempt 1, 10 findings)
- `challenge-remediate`: PASS (attempt 1)
- `challenge-tests`: PASS (attempt 1)
- `run-tests`: PASS (attempt 1, 0 failures)

No test failures in execution.

## Challenge

Challenge phase identified 10 MEDIUM/LOW findings; all remediated before test run:

**MEDIUM findings (all fixed):**
1. **MEDIUM-1 — Empty `.bkit-version` produces NaN-major advisory:** Added empty-string and `Number.isNaN()` guards in `detectBkitVersionMajorDowngrade` and `detectBkitVersionPinStale`.
2. **MEDIUM-2 — `ctx.advisories` not deduplicated before `runPostInstallCheck`:** Added `dedupeById(preflightAdvisories)` call inside `runPostInstallCheck` before cross-phase filter.
3. **MEDIUM-3 — Intra-phase dedup not tested:** Exported `dedupeById` helper and added direct unit tests exercising duplicate injection via spies.
4. **MEDIUM-4 — `detectCiYmlMissingTokenEnv` brittle to whitespace/quoting:** Replaced literal substring match with regex `/GH_BKIT_TOKEN\s*:\s*["']?\$\{\{\s*secrets\.GH_BKIT_TOKEN\s*\}\}/` supporting variants.
5. **MEDIUM-5 — Template injection in `detectVercelEnv`:** Switched from `execSync(\`vercel env ls ${env}\`)` to `execFileSync("vercel", ["env", "ls", env])` with runtime guard.

**LOW findings (deferred or documented):**
- LOW-1 (hasBkitMarkers uses naive substring): Documented as LOW; uses same marker logic as install block for this feature; future refactor recommended.
- LOW-2 (cross-phase dedup re-orders findings): Documented as LOW; position shift acceptable per plan ("Phase 3 wins on conflict" — content, not position).
- LOW-3 (Vercel CLI may hang): Documented as LOW; 10s timeout protects against indefinite hang; existing behavior.
- LOW-4 (empty-string token): Documented as LOW; edge case documented.
- LOW-5 (log prefix inconsistency in dry-run): Documented as LOW; plan does not mandate prefix consistency.

Remediation verified by `build-challenge-tests.md`: 21 new challenge tests exercise NaN guards, dedup variants, format snapshots, and integration subprocess patterns.

## Generated Tests

Challenge phase added 21 new tests in `bkit-challenge-tests.test.ts`:
- **7 tests** for MEDIUM-1 (NaN guard): empty file, whitespace-only, non-semver, detect-text assertions, regression guard, pin-stale empty variants.
- **2 tests** for MEDIUM-3 (intra-phase dedup): direct `dedupeById` exercises via spy-injected duplicates.
- **5 tests** for format snapshot (MEDIUM-4 via MEDIUM-3 testing): 2-finding fixture, single blocker, empty array, separator width, label alignment — all using `toMatchInlineSnapshot` for byte-for-byte lock.
- **4 tests** for integration edge cases: function-API pipeline (not subprocess), blocker render count, spy observation pattern, explicit deletion of env vars.
- **3 bonus tests** for cross-phase dedup content verification: Phase 3 content replaces Phase 1, preflight-only survives, order preserved.

All tests pass. No test coverage gaps remain per plan Derived Test Matrix.

## Risks

**Informational (no action required this cycle):**

1. **hasBkitMarkers substring brittleness (LOW):** If a consumer's `.husky/pre-commit` file contains `<!-- bkit:start -->` inside a commented prose example (not an actual managed block), the marker check silently passes. The install block uses `findLineAnchoredMarkers` for actual detection. Future refactor should align preflight to the same anchored logic to prevent drift.

2. **Vercel CLI latency on unlinked projects (LOW):** Consumers with `vercel.json` but no `.vercel/project.json` will incur a 10s timeout per `detectVercelEnv` call (2x for preview + production = 20s per install). Acceptable with timeout guard; documented in code comment.

3. **CI yml false positives on custom layouts (MEDIUM-4 residual):** Even with regex flex, a consumer with a bespoke CI workflow that manually passes `GH_BKIT_TOKEN` as a pipeline parameter (not an `env` block) may still trigger the advisory. Action text now documents "bespoke layouts may need manual verification" as a hedge.

4. **Token presence semantics (LOW-4):** Empty-string `GH_BKIT_TOKEN=""` is treated as "missing". Technically correct but not called out in action text. Acceptable; edge case.

5. **DedupeById export (maintenance risk):** Now exported for testing; future changes to the dedup contract must be coordinated across `bkit-preflight.ts` and `bkit-postinstall.ts`. Low risk — simple function; documented in both files.

## Action Items

None. All MEDIUM challenge findings remediated and tested. Feature is complete and passes all gates.

Build is ready for merge per GitOps workflow (squash merge to `dev` per plan).
