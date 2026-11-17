Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

BLOCKED — TASK 1: test `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `gh not on PATH → warns, gates run` — pathWithoutGh() runs mkdirSync("sysbin") on each loop pass, so the second hook (.husky/pre-push) throws EEXIST; the first hook (template) passes; the test needs mkdirSync recursive or a fresh dir per call
DONE — TASK 1: PR lookup and PR conflict check — all other conflict tests and the 116 existing tests pass (.bkit/templates/.husky/pre-push, .husky/pre-push)
DONE — TASK 2: pre-push-pr-conflict tip (.bkit/core/engine/checks/tips/catalogue.ts)
DONE — TASK 3: documented PR conflict check (.bkit/core/.bkit/templates.md, mirror .bkit/templates.md)
DONE — TASK 4: pathWithoutGh() idempotent (recursive mkdir, skip existing links); all 124 tests pass (.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts)
