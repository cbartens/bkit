Verdict: PASS
Strategy: STANDARD
Fixed: 2

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 1: steps.test.ts --commit=none case asserts uncommitted: true; new tests-changed.test.ts case lists the subagent file after a later commit sweeps an uncommitted row (.bkit/core/engine/commands/workflow/steps.test.ts, tests-changed.test.ts)
DONE — Gap 2: workflows.md step-done field list and parentSha text name uncommitted and stepBase; re-rendered with upgrade (.bkit/core/.bkit/workflows.md, .bkit/workflows.md)
DONE — Holistic gate: exit 0 (pnpm bkit:gate:changed)
