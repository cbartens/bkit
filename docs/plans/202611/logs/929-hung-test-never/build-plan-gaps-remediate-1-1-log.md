Verdict: PASS
Strategy: STANDARD
Fixed: 3

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 1: TASK 1 `.ts` import extension (TS5097) — dropped the extension in the test import (.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts)
DONE — Gap 2: TASK 1 double cast in withChildDeadline — parameter is now a structural `ChildFunctions` type (method syntax), no cast (vitest.child-deadline.ts)
DONE — Gap 3: TASK 1 double cast in test helper — removed, the plain object fits `ChildFunctions` (.bkit/core/engine/audits/repo/vitest-child-deadline.test.ts)
DONE — Group gate: also fixed a regression the gate found: vitest-timeout-budget.test.ts needs the literal `vi.setConfig(tierTimeouts(` in vitest.setup.ts; restored it, and ran prettier on vitest.child-deadline.ts (vitest.setup.ts)
DONE — Group gate: exit 0 (bkit tests changed --fallback=bkit:gate:static-unit; bkit:gate:changed verdict PASS, 50 related files / 3695 tests passed)
