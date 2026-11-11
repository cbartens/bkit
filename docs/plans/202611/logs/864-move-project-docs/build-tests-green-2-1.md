Enforced: true
Verdict: CONCERNS
Gaps: 1
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/864-move-project-docs-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 5 | `.bkit/core/engine/checks/after/tools.test.ts` "distinguishes missing and empty project documentation from populated candidates" | red | passed |
| 5 | `.bkit/core/engine/checks/after/tools.test.ts` "recognizes current and migrated untouched starters" | red | passed |
| 5 | `.bkit/core/engine/checks/after/tools.test.ts` "resolves an indexed equivalent without a missing default warning" | red | not passed |
| 5 | `.bkit/core/engine/checks/after/index.test.ts` "reports and suppresses project documentation advisories without a blocker" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/summary.test.ts` "consolidates documentation warnings from the active run without changing its verdict" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/workflows.integration.test.ts` "reports only attributed documentation warnings for the active run" | red | passed |
| 6 | `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` "covers the full documentation responsibility inventory" | red | passed |
| 6 | `.bkit/core/engine/audits/repo/shipped-docs-refs.test.ts` "ships documentation warning contracts for plan and no-plan paths" | red | passed |

## Gaps

- Task 5 `not-green` — "resolves an indexed equivalent without a missing default warning" failure: Cannot spy on export "readFileSync". Module namespace is not configurable in ESM. See: https://vitest.dev/guide/mocking/modules#mocking-a-module — Fixable: true — log: TASK 5: `.bkit/core/engine/checks/after/tools.test.ts` `resolves an indexed equivalent without a missing default warning` — not-green — Fixable: true

## Runner output — `.bkit/core/engine/checks/after/tools.test.ts`

```
     ✓ blocks (dep-updater-unset) when a Renovate config is present and the updater is undefined 1ms
     ✓ blocks (dep-updater-unset) when a Renovate config is present and the updater is "Renovate" 0ms
     ✓ blocks (dep-updater-mismatch) when a Renovate config is present and the updater is dependabot 1ms
     ✓ blocks (dep-updater-mismatch) when a Renovate config is present and the updater is none 1ms
     ✓ blocks (dep-updater-mismatch) when the updater names a config that is not present 0ms
     ✓ finds a Renovate config at the repo root, not only under .github/ 0ms
   ✓ detectWorkflowLintToolsMissing (3)
     ✓ returns null when the repo has no workflows 0ms
     ✓ returns null when both actionlint and shellcheck are on PATH 0ms
     ✓ fires (advisory) when a tool is missing, naming it 1ms
   ❯ detectProjectDocs (3)
     ✓ distinguishes missing and empty project documentation from populated candidates 3ms
     ✓ recognizes current and migrated untouched starters 14ms
     × resolves an indexed equivalent without a missing default warning 5ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/after/tools.test.ts > detectProjectDocs > resolves an indexed equivalent without a missing default warning
TypeError: Cannot spy on export "readFileSync". Module namespace is not configurable in ESM. See: https://vitest.dev/guide/mocking/modules#mocking-a-module
 ❯ .bkit/core/engine/checks/after/tools.test.ts:576:26
    574|         { doc: "../escape/noise.md", scope: "Equivalent to docs/noise.…
    575|       ]);
    576|       const readSpy = vi.spyOn(fs, "readFileSync");
       |                          ^
    577|       const again = detectProjectDocs(tmpDir);
    578|       const reads = readSpy.mock.calls.map((c) => String(c[0]));

Caused by: TypeError: Cannot redefine property: readFileSync
 ❯ .bkit/core/engine/checks/after/tools.test.ts:576:26

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 35 passed (36)
   Start at  07:00:49
   Duration  191ms (tests 36%, transform 35%, setup 17%, import 9%, worker 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-qBA4rP/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
