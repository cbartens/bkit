Verdict: PASS
Strategy: STANDARD
Fixed: 1

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 1: handover comment linked a deleted ship-failed branch — landFailedRecord returns linkRef = dev when the PR merged (close-pr), the branch for close-pr-open; handoverVerb links linkRef, JSON ref unchanged; new test "--flush refused by dev links the handover comment at dev once the PR merged" asserts /blob/dev/; the planned test is untouched (.bkit/core/engine/commands/workflow/workflows.ts, workflows.test.ts, dist/commands/workflow/workflows.js)
