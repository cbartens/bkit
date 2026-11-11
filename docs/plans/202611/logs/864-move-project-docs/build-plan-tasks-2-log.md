Verdict: FAIL

<!-- verdict:end -->

# Build Plan

## Execution Log

BLOCKED — TASK 5: test `.bkit/core/engine/checks/after/tools.test.ts` `resolves an indexed equivalent without a missing default warning` — line 576 `vi.spyOn(fs, "readFileSync")` on the `import * as fs from "node:fs"` namespace throws "Cannot spy on export" under vitest 5 ESM before the detector runs; a copy of the file with only that spy replaced by a stub passes 36/36, so the detector satisfies every other assertion (incl. the out-of-tree symlink and ../ cases)
DONE — TASK 5: detectProjectDocs added to checks/after/tools.ts and wired into runPostInstallCheck with per-id suppression (.bkit/core/engine/checks/after/tools.ts)
NOTE — TASK 6 code part: summary.ts aggregates attributed Documentation Warnings records by topic and gap; summary.test.ts and workflows.integration.test.ts pass 43/43; workflows.ts needs no change because runStatusRows already limits rows to the active run and handover does not select warning files (.bkit/core/engine/commands/workflow/summary.ts)
DONE — TASK 4: utility-update-documentation, ship-update-docs and the documentation and adoption audit templates now check presence, index accuracy and starter-only content, keep unresolved coverage in results and write Documentation Warnings records (.bkit/core/prompts/bkit-utility-update-documentation.md)
DONE — TASK 3: shared load-docs clause warns instead of skipping; plan, convert, update, audit-generate, design/plan/build/debug/ship/auto workflows, plan template and per-prompt focus lines carry the consultation contract; coverage tables added to workflows.md and prompts.md; instructions registry synced (.bkit/core/.bkit/workflows.md)
DONE — TASK 6: summary.ts consolidates attributed Documentation Warnings; shipped-docs-refs.test.ts 281/281, summary and workflows.integration tests pass; workflows.ts unchanged because runStatusRows already scopes to the active run and handover selects no warning files (.bkit/core/engine/commands/workflow/summary.ts)
BLOCKED — TASK 7: docs/architecture.md, observability.md, testing.md, README.md, DETAILS.md updated and dist rebuilt and staged, render baselines refreshed; the scratch-consumer dogfood matrix and the mirror/dogfood template refresh (docs/templates/bkit-audit-*.md, bkit-plan.md copies; templates.test.ts dogfood checks) need `bkit upgrade`, which the brief reserves for the orchestrator
