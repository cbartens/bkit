Verdict: FAIL
Strategy: STANDARD
Fixed: 4

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 1: TS6133 unused engineFile in open-decision.test.ts — removed the unused helper (.bkit/core/engine/commands/workflow/open-decision.test.ts)
DONE — Gap 2: decisions.test.ts failures — fixtures ported to status.jsonl rows (seedStatus, statusRows, countsRow helpers); assertions on the engine file now assert the rows; no engine source changed; "writes a confirmation into the engine file" restored to the tests step's version (.bkit/core/engine/commands/workflow/decisions.test.ts)
BLOCKED — Gap 4: test `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses Q1 when the engine file holds the loop question` — fixture ported from the -engine.md file to a decision-counts loop row, because the engine file is no longer written; Task 34 owns it and makes check read the row
BLOCKED — Gap 4: test `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options` — fixture ported to a decision-counts loop row (Try again / Stop), because the engine file is no longer written; Task 34 owns it and makes check read the row
BLOCKED — Gap 2: test `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged` — asserts the decision-answer rows instead of the engine file, because apply writes rows and no engine file
BLOCKED — Gap 2: test `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1` — fixture ported to a decision-counts loop row and the answer asserted as a decision-answer row, because the engine file is no longer written
BLOCKED — Gap 2: test `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file` — fixture ported to a decision-counts loop row and the answer asserted as a decision-answer row, because the engine file is no longer written
DONE — Gap 3: workflow-shape "build calls only verbs and flags the CLI has" — bkit-build.md decisions counts now uses --decision= (same path); upgrade re-rendered copies; text:ceiling check ok (text grew, no lower); no Task 36 test identified as newly passing (.bkit/core/workflows/bkit-build.md)
DONE — pnpm build run earlier; no source touched since
BLOCKED — Group gate: exit 1; failing tests are `bkit decisions apply --by=owner and pending > writes a confirmation into the engine file` (restored to the tests step's version; Task 38 rewrites it), `bkit decisions check > refuses Q1 when the engine file holds the loop question` and `bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options` (Task 34 behaviour) (/Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/958-agents-orchestrator-write/build-plan-gaps-remediate-8-2-gate.log)
DONE — Gap 4: SUPERSEDED — the four earlier BLOCKED lines for the five tests below (Gap 4 and Gap 2) no longer hold; each test is back as the tests step left it
DONE — Restored `bkit decisions check > refuses Q1 when the engine file holds the loop question` from HEAD; takeover TASK 39-43 (group 11) rewrites it
DONE — Restored `bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged` from HEAD; a takeover task rewrites it
DONE — Restored `bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1` from HEAD; a takeover task rewrites it
DONE — Restored `bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file` from HEAD; a takeover task rewrites it
DONE — Restored `bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options` from HEAD; a takeover task rewrites it
BLOCKED — Group gate: exit 1; failing tests are the six restored or taken-over tests, all red as the tests step left them: `bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged`, `bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file`, `bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1`, `bkit decisions apply --by=owner and pending > writes a confirmation into the engine file`, `bkit decisions check > refuses Q1 when the engine file holds the loop question`, `bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options` (/Users/christian/Documents/GitHub/bkit/.git/bkit-outbox/958-agents-orchestrator-write/build-plan-gaps-remediate-8-2-gate.log)
