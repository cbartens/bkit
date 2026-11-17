Verdict: FAIL
Strategy: PIVOT
Fixed: 2

<!-- verdict:end -->

# Plan Gaps

## Remediation Log
DONE — Gap 1: testing.md workflow-shape row stale on {NOLEAK_BASE} and --base=origin/dev shapes — reworded (docs/testing.md:821)
DONE — Gap 2: Diff per reader row omitted ship --base=origin/dev — added in both workflows.md copies, synced .bkit/instructions.md (.bkit/core/.bkit/workflows.md:259, .bkit/workflows.md:259, .bkit/instructions.md)
BLOCKED — Test local-gate-audit.test.ts "build workflow and verify prompt name no origin/dev diff or test base": the planned test asserts build has no --base=origin/dev, but TASK 7 (owner decision Q1 Fix now, build-decision-1-1.md) puts --base=origin/dev on the Step 16 migration scan; the edit was made in 443524a21, not this round, and restoring it fails the gate (nothing written)
BLOCKED — Test workflow-shape.test.ts "debug passes --base only when it runs in place on dev": the planned test asserts {BASE_FLAG} on every branches scan-diff line, but TASK 7 moved the no-leak scan to {NOLEAK_BASE}; edited in 443524a21, not this round, and restoring it fails the gate (nothing written)
