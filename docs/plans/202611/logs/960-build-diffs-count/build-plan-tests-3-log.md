Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 7: build scan line from .bkit/core/workflows/bkit-build.md:1277; debug no-leak line from .bkit/core/workflows/bkit-debug.md:737
SOURCE — TASK 8: featureBase from .bkit/core/engine/commands/workflow/feature-base.ts:22
SOURCE — TASK 9: ship context diff lines from .bkit/core/workflows/bkit-ship.md:530
WROTE — TASK 7: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build migration scan and debug off-dev no-leak scan pass --base=origin/dev`
WROTE — TASK 8: `.bkit/core/engine/commands/workflow/feature-base.test.ts` `featureBase falls back to the origin/dev meeting point when local dev already contains HEAD`
WROTE — TASK 8: `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff without --base finds a marker the branch added when local dev already contains the branch`
WROTE — TASK 9: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `ship sweep and Failure Path context diff lines pass --base=origin/dev`
