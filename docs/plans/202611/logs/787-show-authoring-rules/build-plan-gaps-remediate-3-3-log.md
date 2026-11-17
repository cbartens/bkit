Verdict: FAIL
Strategy: PIVOT
Fixed: 2

<!-- verdict:end -->

# Plan Gaps

## Remediation Log
DONE — Gap 2: groupCommands now reads an entry top-level command (Cursor flat entries); dist rebuilt, write.test.ts 79 pass (.bkit/core/engine/install/write.ts)
DONE — Gap 3: docs/testing.md core.integration.test.ts row now states shipped-registration upgrade is covered (docs/testing.md)
BLOCKED — Gap 1: planned integration test bkit-gateguard.cjs substring count (~line 2647) counts 2 for one correct Claude group; defect in a recorded TEST FIRST test, not editable here — Fixable: false (tests step must rewrite it)
BLOCKED — Group gate: bkit:gate:changed fails only on core.integration.test.ts "upgrades shipped registrations..." (expected 2 to be 1), the Gap 1 planned-test defect; all other tests pass (147/148)
