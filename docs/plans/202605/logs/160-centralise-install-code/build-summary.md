Verdict: SHIP

<!-- verdict:end -->

# Build Summary

## Overview

Feature 160 (centralise-install-code) consolidates all engine source, templates, and scripts from `.agents/scripts/`, `.agents/templates/` into `.bkit/src/` and `.bkit/templates/` respectively. Plan execution spanned 4 sub-plans (WS-1 through WS-7 distributed across 4 delivery nodes):

- **WS-1**: Flip imports/exports to new `.bkit/` paths (bkit-paths, bkit-modules)
- **WS-2**: Baseline install engine test + dual-axis (install/upgrade) verification
- **WS-3**: Move source, templates, config; remove orphan cleanup; update paths
- **WS-4**: Update prose (README, architecture, deployments, testing)
- **WS-6**: Ensure renovate.json5, rules.md consistent with new layout
- **WS-7**: Enforce `.bkit/templates/.agents/rules.md` byte-parity with source

Build gate: holistic plan verify returned PASS (4 of 4 sub-plans, all integration seams verified, no gaps). All 113 changed files accounted for.

## Implementation Quality

**Per build-plan-verify-holistic-1.md:** All 16 cross-cutting structural checks PASS. Config (tsconfig.json include → `.bkit/src/**/*.ts`), vitest.config.ts, package.json (files[] excludes test/snapshot; ships `.bkit/templates/` 56 entries; `.agents/scripts|templates` removed). Tarball-hygiene validated: `npm pack --dry-run` shows no leaked test or secrets. dist/ fresh per `pnpm check:dist` exit 0. Load-bearing seams (WS-1 flips, WS-3 paths, WS-4 prose, WS-6 rules, WS-7 gate) all consistent — no half-moved state. Live `.agents/` runtime (rules, trackers, workflows, 47 prompts, 18 skill dirs) intact.

**Per build-challenge-remediate-1.md:** 2 MEDIUM findings (F1, F2) remediated:

- **F1** (removeOrphanTemplatesDir unguarded delete): Added bkit-origin sentinel gate; checks for known bkit-managed basenames (AGENTS.md, CLAUDE.md, .github/workflows, .github/renovate.json5, .github/dependabot.yml, gitignore, .vale.ini) before delete; skips if none found.
- **F2** (.agents/README.md stale paths): Surgical find/replace — `.agents/scripts/bkit-install.ts` → `.bkit/src/bkit-install.ts` (lines 55, 144–145, 300), test path updated (line 210), `.agents/templates/` → `.bkit/templates/` (lines 176–199, 207, 209).

4 LOW findings (F3–F6) not remediated per task scope (architecture, not blockers):

- **F3**: Upgrade `.agents/` hash exclusion (new, intentional consistency with install filter).
- **F4**: `isDogfood()` exported + tested but never called in production (latent, safe — src===dst guard is active).
- **F5**: `doctor` verb prints templates root without `guardTemplatesRoot()` (diagnostic blind spot, not crash).
- **F6**: `guardTemplatesRoot()` only called in `runCoreTemplates`; other modules silent-skip on missing root (order-coupled, safe because core runs first).

## Verification Status

Holistic plan verify: PASS (1 attempt, no gaps). Challenge reconciled: CONCERNS (2 MEDIUM, 4 LOW). Challenge remediate: PASS (2 MEDIUMs fixed, build + test green). Challenge tests: PASS (23 new regression tests, all pass).

All findings in challenge phase were identified from code review (Lens: Bugs + Security), logged, and either remediated (MEDIUMs) or documented as deferred (LOWs). No findings were left unresolved beyond task scope.

## Test Status

**Original test suite (1141 tests, 32 files):** All PASS (2 skipped, 1 todo, 0 failures).

**New challenge-tests (23 tests, 1 file `.bkit/src/bkit-challenge-tests-160.test.ts`):**

- F1 sentinel guard: 13 tests (delete on bkit basenames present; skip on consumer content; dryRun no-op).
- `getTemplatesRoot()` path validation: 6 tests (three contexts: dist, tsx-from-source, resolved path consistency; regression guard against old `.agents/templates` form).
- `guardTemplatesRoot()` edge cases: 4 tests (falsy root → exit 1 with message; non-empty path no-op).

**Post-remediate full suite:** `pnpm test` → 1164 passed (1141 original + 23 new), 2 skipped, 1 todo, 0 failures, 33 files. `pnpm build` exit 0. `pnpm check:dist` exit 0 (dist fresh).

## Challenge

Reconciled challenge output: CONCERNS (6 findings, 0 CRITICAL, 0 HIGH, 2 MEDIUM, 4 LOW).

**Remediated (2 MEDIUM):**

- F1: `removeOrphanTemplatesDir` now gates deletion on presence of bkit-origin sentinel basenames; skips if consumer-owned.
- F2: `.agents/README.md` all stale paths updated to `.bkit/src/` and `.bkit/templates/` literals.

**Deferred (4 LOW):**

- F3 (informational): `.agents/` hash exclusion in upgrade is new but intentional; no bug.
- F4 (informational): `isDogfood()` dead code; safe because src===dst guard is active; optional refactor.
- F5 (diagnostic gap): `doctor` does not call `guardTemplatesRoot()`; silent if templates missing (low severity).
- F6 (order-coupled): `guardTemplatesRoot()` only in `runCoreTemplates`; safe because core always first; optional hoist.

No CRITICAL, HIGH, or remaining unresolved MEDIUM findings.

## Generated Tests

23 regression tests added in `.bkit/src/bkit-challenge-tests-160.test.ts`:

- **Edge cases covered:** removeOrphanTemplatesDir sentinel presence/absence, dryRun modes, getTemplatesRoot() three-context resolution, regression guard against old `.agents/templates` form, guardTemplatesRoot() falsy-root exit, logPrefix inclusion.
- **Bugs caught:** None during new test execution; tests designed to catch future regressions of F1 sentinel gate logic and path resolution consistency.
- **All tests PASS:** No blockers introduced; suite now 1164 total, 0 failures.

## Risks

**Informational — no action required this cycle:**

- F3 (Hash exclusion order): Pre-existing `.agents/*` keys in canonicalHashes manifest could become orphaned if upgrade hashing changes again; optional manifest-hygiene cleanup on next upgrade.
- F4 (isDogfood dead code): If `isDogfood()` is wired into production dispatch in the future, ensure it does not override the stricter src===dst equality guard already active in `runPayload`.
- F5/F6 (Guard coupling): `guardTemplatesRoot()` effectiveness depends on (a) core always in resolveModules and (b) core always dispatching first (MODULE_DISPATCH_ORDER[0]). Safe under current invariants; document or refactor if dispatch order becomes dynamic.

## Action Items

None. All MEDIUM findings remediated. All CRITICAL/HIGH findings: zero. LOW findings are deferred non-blockers documented in challenge output.

## Recommended Next Step

```text
/bkit-ship 160
Brief: Centralise install code to .bkit/. Plan PASS (holistic verify, 4 sub-plans, all seams consistent). Challenge CONCERNS → PASS after remediate (2 MEDIUMs fixed: removeOrphanTemplatesDir sentinel gate, .agents/README.md paths updated). Tests green: 1164/1164 (1141 + 23 new), 0 failures. dist/ fresh. Ready to ship.
```
