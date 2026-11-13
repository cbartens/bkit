Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 7: ticket and held-place first line "<who> — <checkout>" from .bkit/templates/scripts/ci/bkit-machine-lock.sh:271
SOURCE — TASK 8: waiting run's who "bkit tests run <gate> <fid> <step>" from .bkit/core/engine/commands/workflow/tests.ts:1856
SOURCE — TASK 9: verdict simulators claudeShellVerdict/opencodeVerdict/cursorVerdict/codexVerdict from .bkit/core/engine/install/modules/index.integration.test.ts:688-780
WROTE — TASK 7: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a jump marker moves its waiting run to the front of the line`
WROTE — TASK 7: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `the newest jump marker goes first`
WROTE — TASK 7: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a jump marker that matches no waiting run is deleted`
WROTE — TASK 7: `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `a jumped run that gives up and asks again within 120 s keeps the front`
WROTE — TASK 8: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests jump moves a waiting run to the front of the tests line`
WROTE — TASK 8: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests jump refuses a run name no waiting run carries`
WROTE — TASK 8: `.bkit/core/engine/commands/workflow/tests-lock.integration.test.ts` `tests jump refuses a run name two waiting runs share`
WROTE — TASK 9: `.bkit/core/engine/install/modules/index.integration.test.ts` `bkit tests jump asks the human on claude, opencode, cursor and antigravity and is denied on codex`
WROTE — TASK 9: `.bkit/core/engine/install/modules/index.integration.test.ts` `path-prefixed bkit tests jump forms get the same verdicts on every host`
