Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 1: renderOpencodeJson permission.bash keys from .bkit/core/engine/install/modules/opencode.ts:348
SOURCE — TASK 1: opencode glob last-match-wins, globToRe from .bkit/core/engine/install/modules/index.integration.test.ts:703
WROTE — TASK 1: `.bkit/core/engine/install/modules/opencode.integration.test.ts` `injects consumer allowed-domains into the fetch tool and never into shell allows`
WROTE — TASK 1: `.bkit/core/engine/install/modules/opencode.integration.test.ts` `permission: opencode tool-keyed map (not Claude {rules:[...]}), force-push gated, no shell fetch allows`
WROTE — TASK 1: `.bkit/core/engine/install/modules/index.integration.test.ts` `every derived base reaches the fetch tool on every host, and an OpenCode shell fetch asks`
SOURCE — TASK 2: PreflightFinding shape (id, severity, detect, action) from .bkit/core/engine/checks/before/files.ts:101
WROTE — TASK 2: `.bkit/core/engine/checks/before/files.test.ts` `reports each substring curl and wget allow with its removal action`
WROTE — TASK 2: `.bkit/core/engine/checks/before/files.test.ts` `ignores webfetch, non-allow and unrelated consumer entries`
WROTE — TASK 2: `.bkit/core/engine/checks/before/files.test.ts` `redacts URL credentials and query strings in a reported key`
WROTE — TASK 2: `.bkit/core/engine/checks/before/files.test.ts` `reports nothing and writes nothing for an absent, unparseable or map-less file`
WROTE — TASK 2: `.bkit/core/engine/commands/install/upgrade.integration.test.ts` `upgrade keeps legacy OpenCode substring fetch grants and reports each for owner review`
