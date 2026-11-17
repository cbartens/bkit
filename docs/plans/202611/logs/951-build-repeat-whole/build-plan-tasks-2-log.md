Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 6: Changed-files scope for `tests run` — --changed-since runs bkit:gate:changed on changed files, writes the test-run row with file count scope (.bkit/core/engine/commands/workflow/tests.ts)
DONE — TASK 7: The group gate tests the group's own changes — Step 8 sub-step 8 and Step 9 sub-step 3 use --changed-since={GROUP_BASE} with re-derive (.bkit/core/workflows/bkit-build.md)
DONE — TASK 8: Soak tests only what it changed — soak runs bkit tests changed with the exit-81 line (.bkit/core/prompts/bkit-debug-failure-soak.md)
DONE — TASK 9: Upgrade lowers verify limits above 2 — lowerVerifyMaxAttempts and migrations row (.bkit/core/engine/install/modules/core.ts)
DONE — TASK 8 follow-up: soak prompt carries the local-pre-commit rule, instructions.md carry updated (.bkit/core/prompts/bkit-debug-failure-soak.md)
