Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 4: mainAuditFiles minPushOutside(paths) from .bkit/core/engine/commands/ci/ci.ts:678
SOURCE — TASK 5: git diff --name-only without -z from .bkit/core/engine/commands/ci/ci.ts:676
SOURCE — TASK 6: sections-only refusal from .bkit/core/engine/commands/ci/ci.ts:681
WROTE — TASK 4: `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main refuses an audit template's project section even when minPushPaths matches docs/**`
WROTE — TASK 5: `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main refuses a docs/audits file whose name has non-ASCII characters`
WROTE — TASK 6: `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main refuses an audit template project section already on origin/dev when its managed block also changed since origin/main`
WROTE — TASK 6: `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main refuses an audit template new to main whose project section was edited on origin/dev`
