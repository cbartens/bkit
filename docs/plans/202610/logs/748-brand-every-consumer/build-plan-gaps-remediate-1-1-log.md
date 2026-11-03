Verdict: FAIL
Strategy: STANDARD
Fixed: 2

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 1: tools.test.ts detect assertion — added expect(result!.detect).toContain("bkit:lint:prose"); 33 tests pass (.bkit/core/engine/checks/after/tools.test.ts)
DONE — Gap 2: capabilities.md drift — pnpm bkit:graph:refresh, graph:check passes (docs/capabilities.md)
BLOCKED — bkit:generate: instructions:sync fails on .bkit/core/prompts/bkit-build-plan-tests.md:80 no entry (prompt text from the dev merge, outside this group's diff)
