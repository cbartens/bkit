Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 1: stub gh reply "<number> <base>" from .bkit/templates/.husky/pre-push:121 (current lookup prints number only; new shape per task UPDATE line)
SOURCE — TASK 1: push-gate / bkit check call shapes from .bkit/templates/.husky/pre-push:236
WROTE — TASK 1: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `open PR whose base conflicts → blocked before bkit check, names the file`
PASSES — TASK 1: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `open PR that merges cleanly → gates run, no message`: today's hook has no conflict check, so a clean run passes already
PASSES — TASK 1: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `no open PR → no fetch, gates run`: today's hook never fetches or warns
WROTE — TASK 1: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `gh not on PATH → warns, gates run`
WROTE — TASK 1: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `base fetch fails → warns, gates run`
PASSES — TASK 1: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `dev push → no PR lookup`: today's hook already skips the lookup on dev
WROTE — TASK 1: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `min push of a conflicting PR → blocked`
SOURCE — TASK 2: tip shape from .bkit/core/engine/checks/tips/catalogue.ts:456
WROTE — TASK 2: `.bkit/core/engine/checks/tips/catalogue.test.ts` `pre-push-pr-conflict fires only for a hook without merge-tree`
SOURCE — TASK 4: pathWithoutGh mkdirSync EEXIST from .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1659
WROTE — TASK 4: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `gh not on PATH → warns, gates run for both hook copies`
