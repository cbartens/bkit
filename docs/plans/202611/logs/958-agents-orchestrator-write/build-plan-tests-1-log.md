Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

WROTE — TASK 1: `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` `every count-checked prompt declares a known count rule`
WROTE — TASK 1: `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` `no prompt leaves an incomplete finding out of the Failures count`
WROTE — TASK 3: `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` `every judgment field a result prompt names is a header line promptHeader reads`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/steps.test.ts` `promptHeader > reads the Failures count rule of bkit-plan-review-1`
WROTE — TASK 1: `.bkit/core/engine/commands/workflow/steps.test.ts` `headerDeclaration > refuses an unknown count declaration`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > checks Failures against the ## CRITICAL items and ignores OPTIONAL ones`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > refuses a verify Fixable that disagrees with its gap lines`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > refuses a challenge PASS with a HIGH task block`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > refuses a challenge CONCERNS with a CRITICAL task block`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > hands back a challenge task block it cannot read`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > refuses a report the old render wrote whose Failures counted an OPTIONAL item`
WROTE — TASK 2: `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > checks each agent's count in a two-agent finish`
WROTE — TASK 3: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > no prompt names a Result: launch line or a structured result file`
WROTE — TASK 4: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > no workflow names a Result: line, a -result.json file or a result-file render`
WROTE — TASK 4: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > the steps finish re-ask passes the printed problem`
SOURCE — TASK 2: fixture c1.md changed to FAIL (CRITICAL block, Failures 1) since plan's CONCERNS+CRITICAL contradicts the CONCERNS rule; expectation now verdict FAIL
PASSES — TASK 2: `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > reads None under ## CRITICAL as zero items`: current finish counts no section, so a PASS with None and Failures 0 is accepted; the test guards the new count check
PASSES — TASK 2: `.bkit/core/engine/commands/workflow/steps.test.ts` `bkit steps finish > counts only the Fixable gap lines under a verify gap-count line`: current finish counts no section, so the report is accepted; the test guards the new count check
