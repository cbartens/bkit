Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

WROTE — TASK 1: `.bkit/core/engine/install/write.test.ts` `shipped list holds mcp__claude_ai_Linear__* for .claude/settings.json permissions.allow`
WROTE — TASK 1: `.bkit/core/engine/install/write.test.ts` `removes a retired entry and keeps the person's entries beside it`
WROTE — TASK 1: `.bkit/core/engine/install/write.test.ts` `returns a document without the retired entry unchanged and a second prune changes nothing`
WROTE — TASK 1: `.bkit/core/engine/install/write.test.ts` `reports an edited variant as edited and never removes it`
WROTE — TASK 1: `.bkit/core/engine/install/write.test.ts` `does not report an entry the template ships as edited`
WROTE — TASK 1: `.bkit/core/engine/install/write.test.ts` `matches the file by repo-relative path whether the destination is relative or absolute`
WROTE — TASK 1: `.bkit/core/engine/install/write.test.ts` `prunes a retired entry in any host file the list names`
WROTE — TASK 2: `.bkit/core/engine/install/write.test.ts` `drops a retired entry even when the template is otherwise contained`
WROTE — TASK 2: `.bkit/core/engine/install/write.test.ts` `dry run records the same write and leaves the file untouched`
WROTE — TASK 2: `.bkit/core/engine/install/write.test.ts` `a second run after pruning writes nothing`
WROTE — TASK 2: `.bkit/core/engine/install/write.test.ts` `keeps an edited variant and warns with the file and the entry`
WROTE — TASK 2: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade over a seeded old-shape settings file removes the retired grant and keeps the person's`
WROTE — TASK 2: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade dry run lists the settings update and leaves the retired grant`
SOURCE — TASK 1: list entry shape {file,path,value} is a guess; writeTier2JsonContained behaviour from .bkit/core/engine/install/write.ts:361
WROTE — TASK 2: `.bkit/core/engine/install/write.test.ts` `a second run after pruning writes nothing`
