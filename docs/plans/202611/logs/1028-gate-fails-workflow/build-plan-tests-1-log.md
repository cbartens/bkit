Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 1: record shape {workflows:{ceiling,reason},prompts:{ceiling,reason}} from plan task 3 DONE WHEN (script not on disk; assumed)
WROTE — TASK 1: `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `fails above the ceiling and names total, ceiling, grown files and the raise command`
WROTE — TASK 1: `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `passes when a total equals its ceiling`
WROTE — TASK 1: `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `fails below the ceiling and names the lower command`
WROTE — TASK 1: `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `names only the files that grew since the record's last commit`
WROTE — TASK 2: `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `raise without a reason refuses and leaves the record unchanged`
WROTE — TASK 2: `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `raise with a reason rewrites both ceilings and stores the reason on the folder that grew`
WROTE — TASK 2: `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `lower rewrites both ceilings and keeps each reason`
WROTE — TASK 2: `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `lower refuses when a total is above its ceiling`
WROTE — TASK 3: `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `bkit's own workflow and prompt folders sit exactly at the committed ceilings`
WROTE — TASK 3: `.bkit/core/engine/audits/repo/package-json.test.ts` `bkit:text:ceiling runs scripts/gate/bkit-text-ceiling.mjs`
