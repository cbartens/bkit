<!-- verdict:start -->
Verdict: CONCERNS
Failures: 1
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic — master plan + all 4 sub-plans (`bar-131-related-bars-suite-plan.md` + `-plan-1.md` + `-plan-2.md` + `-plan-3.md` + `-plan-4.md`). Per Large Diff Guard (15236 lines > 10000), per-file budget mode used: focused on cross-sub-plan integration boundaries rather than re-verifying single-scope tasks (which were already PASS in `verify-1-1.md`, `verify-2-2.md`, `verify-3-1.md`, `verify-4-1.md`).

## Gaps Identified

1 integration gap (CONCERN-level, not blocking):

1. **Sub-plan-4 transactional staging primitives are exported but NOT wired into `bkit-modules.ts` or the main `bkit install` runbook.** Grep of `staging|Staging|STAGING` in `bkit-modules.ts` returns zero matches. Plan P4.T1 explicitly lists `bkit-modules.ts` as a target file ("staging-aware write wrapper"). The primitives (`STAGING_ROOT`, `getStagingDir`, `initStagingDir`, `commitStaging`, `discardStaging`, `discardAllStaging`) exist + are exported from `bkit-install.ts` (lines 39-103) and are unit-tested in `bkit-install.test.ts:721-840`. Integration test "Scenario 9 — P4.T3" in `bkit-install.integration.test.ts:681-758` calls these primitives via direct API, NOT through `bkit install` end-to-end. Consequence: master plan's P4 success criterion ("`bkit install` mid-failure leaves consumer files untouched (staging dir discarded)") is enforced only at API-level, not via a real SIGTERM-after-first-module integration test. This was accepted as PASS by the single-scope sub-plan-4 verifier (`verify-4-1.md`); flagged here at the holistic level because it crosses sub-plan boundaries (sub-plan-4 staging needs sub-plan-3 `writeTier2Json` consumers in `bkit-modules.ts` to migrate to staging writes).

## Sub-Plans Verified

4 of 4 sub-plans (1, 2, 3, 4). Matches the count of `docs/plans/active/bar-131-related-bars-suite-plan-{1,2,3,4}.md` files. Each sub-plan's runbook tasks (P0/P1/P2/P3/P4) are already ticked `[x]` per single-scope verifier conclusions:
- sub-plan-1 (`verify-1-1.md`): PASS (P0.T0, P0.T1, P1.T0–T8 all verified).
- sub-plan-2 (`verify-2-2.md`): PASS after remediation of `verify-2-1.md` CONCERNS (`.bkitignore` wiring + `--auto-revert` integration test); see `gaps-remediate-2-1-log.md`.
- sub-plan-3 (`verify-3-1.md`): PASS (all 13 P3 tasks T0–T10 verified).
- sub-plan-4 (`verify-4-1.md`): PASS (all 9 P4 tasks T1–T9 verified at single-scope level).

## Integration Gaps

1 (see Gaps Identified §1). Other integration boundaries verified clean:

- **sub-plan-2 → sub-plan-1 (doctor verb, runUninstall)**: `bkit-install.ts:14` imports `runUninstall` from `./bkit-uninstall.js`; `bkit-cli.ts:6` `Verb` union includes all five verbs (`install | check | doctor | uninstall | upgrade | help`); `bkit-install.ts:746/766/824` switch arms exist; `verify-1-1.md` confirms doctor wiring.
- **sub-plan-3 → sub-plan-2 (heavy-customised-consumer fixture)**: `tests/fixtures/heavy-customised-consumer/{package.json,README.md,...}` referenced by `bkit-modules.upgrade.integration.test.ts` and `bkit-uninstall.surgical.integration.test.ts`.
- **sub-plan-4 → sub-plan-2 (.bkit-version schema)**: `bkit-version.ts:46` `tier3Hashes` (sub-plan-2) + `:63` `canonicalHashes` (sub-plan-4) coexist; backward-compat read at `:97-103` defaults `canonicalHashes` to `{}` for v0.7.x payloads.
- **sub-plan-4 → sub-plan-3 (writeTier2Json/migrateTier1JsonToTier2 used in module install)**: `bkit-modules.ts` imports both at lines 15-16; invokes `migrateTier1JsonToTier2` at 425/511 and `writeTier2Json` at 432/518 for Claude settings and Cursor hooks.
- **Master success criterion (a) — consumer keys byte-identical across upgrades**: enforced via `writeTier2Json` + `extractBkitNamespace`/`applyBkitNamespace` deep-merge + `bkit-modules.upgrade.integration.test.ts` regression cases (Stop-hook survival, failClosed/loop_limit survival).
- **Master success criterion (b) — `bkit install` exit-1 + recovery on Phase 3 blocker**: `bkit-install.ts:947-973` enforces `process.exit(1)` after recovery banner; `bkit-install.integration.test.ts` Scenario 7 + Scenario 8 (--auto-revert) cover both paths.
- **Master success criterion (c) — `bkit uninstall` round-trip byte-identical**: `bkit-uninstall.surgical.integration.test.ts` references the heavy-customised-consumer fixture; `runUninstall` orchestrator in `bkit-uninstall.ts` 700+ lines handles WriteSet.deletes + `stripManagedBlock` + `stripManagedKeys`.

## Previously Attempted

`build-plan-verify-2-1.md` (CONCERNS, 2 failures) → remediated in `build-plan-gaps-remediate-2-1-log.md` (DONE for both gaps) → re-verified by `build-plan-verify-2-2.md` (PASS). All other sub-plans single-shot PASS on attempt 1. No prior holistic verifier.

## Notes

Methodology: targeted `grep` and bounded `Read` per Large Diff Guard. Did NOT run `pnpm test` or `pnpm turbo test` (no `turbo.json` in worktree root for this scope; verifier MUST NOT build/install per protocol). Existence-based and integration-boundary verification only. Master plan checkbox state preserved (master `bar-131-related-bars-suite-plan.md` is an index page with Verdict: PASS at line 1 — no per-task checkboxes to flip; sub-plan checkboxes were ticked by their respective single-scope verifiers).

The single integration gap (sub-plan-4 staging not wired into `bkit-modules.ts`) is addressable by gap-remediate. The architectural foundation (exported primitives, unit tests, API-level integration test) is intact; what's missing is the actual call-site change in `bkit-modules.ts` to route writes through `getStagingDir`/`commitStaging` and a real subprocess SIGTERM integration test. Verdict CONCERNS rather than FAIL because:
- master plan-level breaking-changes review is PASS;
- all 46 phase tasks are checkboxed `[x]` per single-scope verifiers;
- no architectural blocker — staging is exported and unit-tested;
- gap is bounded to a single file (`bkit-modules.ts`) plus one new subprocess integration test.

Files of interest (absolute paths):
- /Users/christian/Documents/GitHub/bkit/.worktrees/bar-131-related-bars-suite/.agents/scripts/bkit-install.ts (lines 39-103, 746-973)
- /Users/christian/Documents/GitHub/bkit/.worktrees/bar-131-related-bars-suite/.agents/scripts/bkit-modules.ts (lines 15-16, 425-518)
- /Users/christian/Documents/GitHub/bkit/.worktrees/bar-131-related-bars-suite/.agents/scripts/bkit-version.ts (lines 46-228)
- /Users/christian/Documents/GitHub/bkit/.worktrees/bar-131-related-bars-suite/.agents/scripts/bkit-cli.ts (line 6)
- /Users/christian/Documents/GitHub/bkit/.worktrees/bar-131-related-bars-suite/.agents/scripts/bkit-uninstall.ts
- /Users/christian/Documents/GitHub/bkit/.worktrees/bar-131-related-bars-suite/.agents/scripts/bkit-postinstall.ts (filterBkitIgnored at 504)
- /Users/christian/Documents/GitHub/bkit/.worktrees/bar-131-related-bars-suite/.agents/scripts/bkit-install.integration.test.ts (Scenarios 7, 8, 9)
- /Users/christian/Documents/GitHub/bkit/.worktrees/bar-131-related-bars-suite/tests/fixtures/heavy-customised-consumer/
