Enforced: true
Verdict: null
Gaps: 14
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/958-agents-orchestrator-write-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "promptHeader > reads the Failures count rule of bkit-plan-review-1" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/steps.test.ts` "headerDeclaration > refuses an unknown count declaration" | red | passed |
| 1 | `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` "every count-checked prompt declares a known count rule" | red | passed |
| 1 | `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` "no prompt leaves an incomplete finding out of the Failures count" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > checks Failures against the ## CRITICAL items and ignores OPTIONAL ones" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > reads None under ## CRITICAL as zero items" | passed-accepted | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > refuses a verify Fixable that disagrees with its gap lines" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > counts only the Fixable gap lines under a verify gap-count line" | passed-accepted | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > refuses a challenge PASS with a HIGH task block" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > refuses a challenge CONCERNS with a CRITICAL task block" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > hands back a challenge task block it cannot read" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > refuses a report the old render wrote whose Failures counted an OPTIONAL item" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > checks each agent's count in a two-agent finish" | red | passed |
| 3 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "engine calls > no prompt names a Result: launch line or a structured result file" | red | passed |
| 3 | `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` "every judgment field a result prompt names is a header line promptHeader reads" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "engine calls > no workflow names a Result: line, a -result.json file or a result-file render" | red | passed |
| 4 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "engine calls > the steps finish re-ask passes the printed problem" | red | passed |
| 5 | `.bkit/core/engine/commands/workflow/audit-report.test.ts` "parseAuditReport > reads IDs, severities, titles and keys from the Findings table" | red-not-loaded | passed |
| 5 | `.bkit/core/engine/commands/workflow/audit-report.test.ts` "parseAuditReport > refuses a row with an unknown key, naming its ID" | red-not-loaded | passed |
| 5 | `.bkit/core/engine/commands/workflow/audit-report.test.ts` "parseAuditReport > refuses a row with an empty severity, naming its ID" | red-not-loaded | passed |
| 6 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "bkit ledgers findings > prints the totals and the ledger rows from a report" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "bkit ledgers findings > prints zero totals and no ledger rows for a report with no findings" | red | passed |
| 6 | `.bkit/core/engine/commands/workflow/issues.test.ts` "bkit issues comment > audit comment derives Findings from --report" | red | passed |
| 7 | `.bkit/core/engine/audits/templates/template-shape.test.ts` "audit templates carry Title and Key columns in their Findings table" | red | passed |
| 7 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "engine calls > no prompt or workflow names --result-file" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps stub > refuses --result-file as an unknown flag" | red | passed |
| 8 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps verdict > reads a header with a leftover Fingerprint line" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > decisionItems reads the loop question and progress from the engine file" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > the engine file's Decision line wins for one question" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > decisionItems reads an old single-file layout like parseDecisionItems" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > openDecision reads Gate and Source changed from the engine file's header" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > a pause whose loop answer is Try again reads DECIDED" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "gateRerun > re-runs a red-gate pause laid out in two files" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "skipProblem > reads Source changed and the loop answer from the engine file" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/status.test.ts` "bkit status resume gate re-run > re-runs the gate of a red-gate pause laid out in two files" | red | passed |
| 9 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows summary > counts an assumed item in an engine file once" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a question without lettered options, naming it" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses Q1 when the engine file holds the loop question" | red | passed |
| 10 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > accepts questions numbered from Q1 when the pause has no engine file" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > writes the attempt line, progress, base check and loop question into the engine file only" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > recommends Decide when the last round changed no source" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > recommends Try again when the last round made progress" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > engine file recommends Stop when the base check is all and no questions are counted" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > engine file recommends Decide when the base check is all and questions are counted" | red | passed |
| 11 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > writes Source changed and Gate into the engine file for a verify pause with no loop" | red | passed |
| 12 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged" | red | passed |
| 12 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" | red | passed |
| 12 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1" | red | passed |
| 13 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "engine calls > no workflow names decision-items.json or decisions compose" | red | passed |
| 14 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "engine calls > no workflow names {OUTBOX_ROOT}/error.md or {OUTBOX}/stderr.log" | red | passed |
| 14 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "engine calls > every workflow that passes --stderr-file says the file holds only the last 20 lines of stderr" | red | passed |
| 15 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "engine calls > no prompt or workflow writes a file with a shell heredoc" | red | passed |
| 17 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a question line written with an en dash, naming the line" | red | passed |
| 17 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a file with no question when the engine file holds no loop question" | red | passed |
| 18 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > an owner's Fix now in the decision file wins over an engine Accept (assumed)" | red | passed |
| 18 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > an owner's answer in the decision file wins over an engine line applied without asking" | red | passed |
| 18 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions skip > keeps the re-run when the owner's Fix now beats an engine Accept (assumed)" | red | passed |
| 19 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a Status, Source changed or Gate line in the orchestrator's header" | red | passed |
| 20 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > does not count a fenced line under ## CRITICAL as an item" | red | passed |
| 20 | `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > a fenced ## line under ## CRITICAL does not end the section" | red | passed |
| 21 | `.bkit/core/engine/commands/workflow/audit-report.test.ts` "parseAuditReport > reads a row whose Evidence cell holds a backslash" | red | passed |
| 21 | `.bkit/core/engine/commands/workflow/audit-report.test.ts` "parseAuditReport > reads a lone short None row as no finding" | red | passed |
| 22 | `.bkit/core/engine/commands/workflow/audit-report.test.ts` "parseAuditReport > refuses a row whose Location is not path:line, naming its ID" | red | passed |
| 23 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail > rewrites the error and stderr files with configured secret values redacted and stderr cut to 20 lines" | red | passed |
| 24 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "engine calls > no bkit-build bash block puts the owner's words inside a double-quoted argument" | red | passed |
| 24 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file" | red | passed |
| 25 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options" | red | passed |
| 26 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail > redacts credentials beyond the tracker keys from the error and stderr files" | red | passed |
| 26 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail > writes the stderr file with the checkout path made relative and the home directory as ~" | red | passed |
| 27 | `.bkit/core/engine/commands/workflow/status.test.ts` "bkit status row > refuses the engine-only types decision-counts and decision-answer" | red | passed |
| 28 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > writes the attempt line, progress, base check and loop question into the engine file only" | red | passed |
| 28 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > recommends Decide when the last round changed no source" | red | passed |
| 28 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > recommends Try again when the last round made progress" | red | passed |
| 28 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > engine file recommends Stop when the base check is all and no questions are counted" | red | passed |
| 28 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > engine file recommends Decide when the base check is all and questions are counted" | red | passed |
| 28 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > writes Source changed and Gate into the engine file for a verify pause with no loop" | red | passed |
| 28 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > prints the attempt, progress, base and loop question lines in show" | red | passed |
| 29 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > decisionItems reads the loop question and progress from the engine file" | red | passed |
| 29 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > the engine file's Decision line wins for one question" | red | passed |
| 29 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > openDecision reads Gate and Source changed from the engine file's header" | red | passed |
| 29 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > a pause whose loop answer is Try again reads DECIDED" | red | passed |
| 29 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "gateRerun > re-runs a red-gate pause laid out in two files" | red | passed |
| 29 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "skipProblem > reads Source changed and the loop answer from the engine file" | red | passed |
| 29 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > an owner's Fix now in the decision file wins over an engine Accept (assumed)" | red | passed |
| 29 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > an owner's answer in the decision file wins over an engine line applied without asking" | red | passed |
| 29 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision rows > the row appended last wins even when its at is earlier" | red | passed |
| 29 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision rows > a Decision line in a file with no Status header is not read as an answer" | red | passed |
| 30 | `.bkit/core/engine/commands/workflow/status.test.ts` "bkit status resume gate re-run > re-runs the gate of a red-gate pause laid out in two files" | red | passed |
| 30 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows summary > counts an assumed item in an engine file once" | red | passed |
| 30 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions skip > keeps the re-run when the owner's Fix now beats an engine Accept (assumed)" | red | passed |
| 31 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision rows > a decision file with no readable question reads OPEN with questions 0" | red | passed |
| 31 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=headless > exits non-zero on a decision file with no readable question" | red | passed |
| 31 | `.bkit/core/engine/commands/workflow/tasks.test.ts` "bkit tasks tick > ticks the task an Accept row names and no task for a Fix now row" | red | passed |
| 32 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged" | updated | passed |
| 32 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" | updated | passed |
| 32 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=rerun > records the re-run as a Q1 row and the pause reads DECIDED" | passed-accepted | passed |
| 32 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > pending --defer keeps the answer and marks it needs-decision" | red | passed |
| 33 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1" | red | passed |
| 33 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file" | red | passed |
| 33 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer=Q2=B --fix-task=Q2=31 records Fix now with its task" | red | passed |
| 33 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > refuses an --answer that is not Q{n} and an option letter" | red | passed |
| 33 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > refuses --reason as an unknown flag" | red | passed |
| 33 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > a multi-line --reason-file reaches only the decisions.jsonl rationale" | red | passed |
| 34 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses Q1 when the engine file holds the loop question" | updated | passed |
| 34 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > accepts questions numbered from Q1 when the pause has no engine file" | updated | passed |
| 34 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options" | updated | passed |
| 34 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a Decision, Fix task, Rejected or Deferred line in the orchestrator's file" | red | passed |
| 35 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions answers > prints the last appended answer per question with its writer" | red | passed |
| 35 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions answers > prints an old single-file decision's in-file answers" | red | passed |
| 36 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "engine calls > no workflow names the engine decision file or the build reason file, or passes the owner's words in --reason" | red | passed |
| 36 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "engine calls > bkit-build records owner answers with one decisions apply call and routes a resumed pause with no question to decisions check" | red | passed |
| 38 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" | passed-accepted | passed |
| 39 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses Q1 when the engine file holds the loop question" | red | passed |
| 40 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged" | passed-accepted | passed |
| 41 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1" | passed-accepted | passed |
| 42 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file" | passed-accepted | passed |
| 43 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options" | red | passed |
| 44 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" | updated | passed |
| 47 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > confirming Q1 of an old per-line file with two assumed Accepts leaves Q2 confirmable" | red | passed |
| 47 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > pending lists the second assumed Accept of an old per-line file after the first is confirmed" | red | passed |
| 47 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision rows > an old file keeps the in-file answers of questions no row names" | red | passed |
| 47 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "skipProblem > an old file keeps its Source changed header after a row names it" | red | passed |
| 48 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail > redacts token-shaped values that no environment variable holds from the error and stderr files" | red | passed |
| 49 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail > redacts the values of credential env vars named KEY, PASS or WEBHOOK from the error and stderr files" | red | passed |
| 50 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail > redacts the password of a URL with an empty user name from the error and stderr files" | red | passed |
| 51 | `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision rows > a loop pause whose questions decisions check refuses resumes to Decision Pause step 2, not a gate re-run" | red | passed |
| 51 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=headless > exits 6 on a loop pause whose own questions decisions check refuses" | red | passed |
| 52 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a question whose bold closes before the colon, naming the line" | red | passed |
| 53 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a question line behind a list marker on a loop pause, naming the line" | red | passed |
| 53 | `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a question written as **Question 2 on a loop pause, naming the line" | red | passed |
| 54 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows fail > redacts a Bearer value in a quoted or JSON Authorization header from the error and stderr files" | red | passed |

## Gaps

- Task 3 `delete-still-referenced` — DELETE `.bkit/instructions.md`: the file still exists — Fixable: null — log: TASK 3: delete-still-referenced — Fixable: null
- Task 4 `delete-still-referenced` — DELETE `.bkit/instructions.md`: the file still exists — Fixable: null — log: TASK 4: delete-still-referenced — Fixable: null
- Task 8 `delete-still-referenced` — DELETE `FINGERPRINT` in `.bkit/core/engine/commands/workflow/steps.ts` is still referenced: `.bkit/core/engine/audits/workflows/ship-invariants.test.ts:309` — Fixable: null — log: TASK 8: delete-still-referenced — Fixable: null
- Task 8 `delete-still-referenced` — DELETE `.bkit/core/engine/commands/workflow/steps.ts`: the file still exists — Fixable: null — log: TASK 8: delete-still-referenced — Fixable: null
- Task 8 `delete-still-referenced` — DELETE `structuredFindings` in `.bkit/core/engine/commands/workflow/challenge.ts` is still referenced: `docs/audits/202611/deferrals-20261116T065554Z.md:277`, `docs/deferrals.jsonl:257`, `docs/deferrals.jsonl:429` — Fixable: null — log: TASK 8: delete-still-referenced — Fixable: null
- Task 8 `delete-still-referenced` — DELETE `parseAuditResult` in `.bkit/core/engine/commands/workflow/audit-report.ts` is still referenced: `docs/decisions.jsonl:963` — Fixable: null — log: TASK 8: delete-still-referenced — Fixable: null
- Task 8 `delete-still-referenced` — DELETE `.bkit/instructions.md`: the file still exists — Fixable: null — log: TASK 8: delete-still-referenced — Fixable: null
- Task 8 `delete-still-referenced` — DELETE `.bkit/core/engine/commands/workflow/steps.test.ts`: the file still exists — Fixable: null — log: TASK 8: delete-still-referenced — Fixable: null
- Task 8 `delete-still-referenced` — DELETE `.bkit/core/engine/commands/workflow/challenge.test.ts`: the file still exists — Fixable: null — log: TASK 8: delete-still-referenced — Fixable: null
- Task 13 `delete-still-referenced` — DELETE `compose` in `.bkit/core/engine/commands/workflow/decisions.ts` is still referenced: `.agents/plugins/bkit/agents/bkit-build-plan-gaps-remediate.md:67`, `.agents/plugins/bkit/agents/bkit-build-plan-tasks.md:73`, `.agents/plugins/bkit/agents/bkit-build-plan-tests.md:57`, `.agents/rules.md:136`, `.bkit/cloud.md:662`, and 438 more — Fixable: null — log: TASK 13: delete-still-referenced — Fixable: null
- Task 13 `delete-still-referenced` — DELETE `composeItems` in `.bkit/core/engine/commands/workflow/decisions.ts` is still referenced: `docs/audits/202611/deferrals-20261116T065554Z.md:310`, `docs/plans/202610/logs/703-standardise-question-option/build-diff-1-1.md:212`, `docs/plans/202610/logs/703-standardise-question-option/build-diff-1-1.md:304` — Fixable: null — log: TASK 13: delete-still-referenced — Fixable: null
- Task 13 `delete-still-referenced` — DELETE `itemLines` in `.bkit/core/engine/commands/workflow/decisions.ts` is still referenced: `.bkit/core/engine/shared/text.ts:245`, `.bkit/core/engine/shared/text.ts:254`, `.bkit/core/engine/shared/text.ts:259`, `dist/shared/text.js:223`, `dist/shared/text.js:231`, and 21 more — Fixable: null — log: TASK 13: delete-still-referenced — Fixable: null
- Task 13 `delete-still-referenced` — DELETE `.bkit/core/engine/commands/workflow/decisions.test.ts`: the file still exists — Fixable: null — log: TASK 13: delete-still-referenced — Fixable: null
- Task 29 `delete-still-referenced` — DELETE `mergeItems` in `.bkit/core/engine/commands/workflow/open-decision.ts` is still referenced: `docs/deferrals.jsonl:531` — Fixable: null — log: TASK 29: delete-still-referenced — Fixable: null

## Already landed

- Task 2 `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > reads None under ## CRITICAL as zero items" — passed at the group's red, and the tests step accepted it: current finish counts no section, so a PASS with None and Failures 0 is accepted; the test guards the new count check; no red is due
- Task 2 `.bkit/core/engine/commands/workflow/steps.test.ts` "bkit steps finish > counts only the Fixable gap lines under a verify gap-count line" — passed at the group's red, and the tests step accepted it: current finish counts no section, so the report is accepted; the test guards the new count check; no red is due
- Task 32 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=rerun > records the re-run as a Q1 row and the pause reads DECIDED" — passed at the group's red, and the tests step accepted it: apply --by=rerun already appends the Q1 row with by rerun (decisions.ts:686); no red is due
- Task 38 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" — passed at the group's red, and the tests step accepted it: apply already writes decision-answer rows and no engine file (decisions.ts:741); no red is due
- Task 40 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged" — passed at the group's red, and the tests step accepted it: apply already appends assumed decision-answer rows (decisions.ts:647); no red is due
- Task 41 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1" — passed at the group's red, and the tests step accepted it: apply already appends the owner answer row (decisions.ts:714); no red is due
- Task 42 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file" — passed at the group's red, and the tests step accepted it: apply already reads the reason file into the answer row (decisions.ts:714); no red is due

## Updated tests

- Task 32 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged" — an existing test the tests step changed since `0431e556f`; the update may add expectations, never remove or loosen one. not additive: a line of the test was removed or changed — read the diff for an expectation removed or loosened

  ```diff
     it("writes assumed decisions into the engine file and leaves the decision file unchanged", async () => {
       const { root, logs } = checkout();
       const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 1);
  +    seedStatus(logs);
       const before = fs.readFileSync(out, "utf-8");
       process.env.BKIT_RUNTIME = "GITHUB_ACTION";
       const r = await run(["decisions", "apply", "--by=headless", `--file=${out}`], root);
       expect(r.code).toBe(0);
       expect(fs.readFileSync(out, "utf-8")).toBe(before);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toMatch(
  -      /Decision: Accept \(assumed\) — the caller already caps it \(headless, GITHUB_ACTION, /,
  -    );
  -    expect(engine).not.toMatch(/^Status:/m);
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
  +    const rows = statusRows(out);
  +    const answers = rows.filter((x) => x.type === "decision-answer");
  +    expect(answers.map((x) => x.q)).toEqual([1, 2]);
  +    for (const a of answers) {
  +      expect(a).toMatchObject({ by: "headless", assumed: true });
  +      expect(String(a.answer)).toMatch(
  +        /Accept \(assumed\) — the caller already caps it \(headless, GITHUB_ACTION, /,
  +      );
  +    }
  +    expect(JSON.stringify(rows)).not.toMatch(/Status:/);
     });
  ```

- Task 32 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" — an existing test the tests step changed since `0431e556f`; the update may add expectations, never remove or loosen one. not additive: a line of the test was removed or changed — read the diff for an expectation removed or loosened

  ```diff
     it("writes a confirmation into the engine file", async () => {
       const { root, logs } = checkout();
       const out = path.join(logs, "build-decision-1-1.md");
       fs.writeFileSync(
         out,
         [
           "Question: CHALLENGE",
           "From: verify",
           "",
           "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
           "A) Accept — the item is recorded as accepted",
           "B) Fix now — a fix task is added to the plan",
           "Recommended: A) Accept — the caller already caps it",
           "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
           "Decision: A) Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
           "",
         ].join("\n"),
       );
  +    fs.appendFileSync(
  +      seedStatus(logs),
  +      `${JSON.stringify({
  +        type: "decision-answer",
  +        workflow: "build",
  +        at: "2026-10-28T00:00:00Z",
  +        file: path.relative(root, out),
  +        q: 1,
  +        answer:
  +          "Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
  +        by: "headless",
  +        assumed: true,
  +      })}\n`,
  +    );
       const before = fs.readFileSync(out, "utf-8");
       expect(fs.existsSync(engineOf(out))).toBe(false);
  +    const reasonFile = path.join(logs, "owner-reason.md");
  +    fs.writeFileSync(reasonFile, "fine\n");
       const r = await run(
  -      ["decisions", "apply", "--by=owner", `--file=${out}`, "--q=1", "--confirm", "--reason=fine"],
  +      [
  +        "decisions",
  +        "apply",
  +        "--by=owner",
  +        `--file=${out}`,
  +        "--q=1",
  +        "--confirm",
  +        `--reason-file=${reasonFile}`,
  +      ],
         root,
       );
       expect(r.code).toBe(0);
       expect(fs.readFileSync(out, "utf-8")).toBe(before);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toMatch(/Decision: Accept — fine \(owner, confirmed at ship, /);
  -    expect(engine).not.toMatch(/^Status:/m);
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
  +    const rows = statusRows(out);
  +    const confirmed = rows.filter((x) => x.type === "decision-answer").at(-1);
  +    expect(confirmed).toMatchObject({ q: 1, by: "owner", workflow: "ship" });
  +    expect(String(confirmed?.answer)).toMatch(/^Accept — /);
  +    expect(String(confirmed?.answer)).not.toContain("fine");
  +    expect(JSON.stringify(rows.at(-1))).not.toContain("fine");
  +    expect(JSON.stringify(rows)).not.toMatch(/Status:/);
     });
  ```

- Task 34 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses Q1 when the engine file holds the loop question" — an existing test the tests step changed since `0431e556f`; the update may add expectations, never remove or loosen one. not additive: a line of the test was removed or changed — read the diff for an expectation removed or loosened

  ```diff
     it("refuses Q1 when the engine file holds the loop question", async () => {
       const { root, logs } = checkout();
       const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1);
  -    fs.writeFileSync(
  -      engineOf(file),
  -      [
  -        "Source changed: false",
  -        "",
  -        "build verify: attempt 2 of 2",
  -        "",
  -        "## Progress",
  -        "",
  -        "**Q1 — Verify:** decide the items below instead of another round?",
  -        "A) Try again — one more fix round runs",
  -        "B) Decide — the questions below are asked instead of another round",
  -        "Recommended: B) Decide — another round is unlikely to help",
  -        "",
  -      ].join("\n"),
  -    );
  +    countsRow(logs, file, {
  +      title: "Verify",
  +      question: "decide the items below instead of another round?",
  +      options: ["Try again", "Decide"],
  +      recommended: "Decide",
  +      reason: "another round is unlikely to help",
  +    });
  +    const rows = statusRows(file);
  +    expect(rows.find((x) => x.type === "decision-counts")).toMatchObject({
  +      loop: { title: "Verify", options: ["Try again", "Decide"], recommended: "Decide" },
  +    });
  +    expect(fs.existsSync(engineOf(file))).toBe(false);
       const r = await run(["decisions", "check", `--file=${file}`], root);
       expect(r.code).toBe(6);
       expect(`${JSON.stringify(r.json)}${r.err}`).toContain("Q1");
     });
  ```

- Task 34 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > accepts questions numbered from Q1 when the pause has no engine file" — an existing test the tests step changed since `0431e556f`; the update may add expectations, never remove or loosen one. additive: no line of the test was removed, so no expectation was dropped — read the added lines for one that disables an earlier expectation

  ```diff
     it("accepts questions numbered from Q1 when the pause has no engine file", async () => {
       const { root, logs } = checkout();
       const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 1);
       expect(fs.existsSync(engineOf(file))).toBe(false);
  +    fs.appendFileSync(
  +      seedStatus(logs),
  +      `${JSON.stringify({
  +        type: "decision-counts",
  +        workflow: "build",
  +        at: "2026-10-01T00:05:00Z",
  +        file: path.relative(path.resolve(logs, "../../../../.."), file),
  +        sourceChanged: true,
  +        gate: "PASS",
  +      })}\n`,
  +    );
  +    expect(statusRows(file).find((x) => x.type === "decision-counts")?.loop).toBeUndefined();
       const r = await run(["decisions", "check", `--file=${file}`], root);
       expect(r.code).toBe(0);
     });
  ```

- Task 34 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options" — an existing test the tests step changed since `0431e556f`; the update may add expectations, never remove or loosen one. not additive: a line of the test was removed or changed — read the diff for an expectation removed or loosened

  ```diff
     it("refuses a decision file whose question count no longer matches the engine file's loop options", async () => {
       const { root, logs } = checkout();
       const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
  -    fs.writeFileSync(
  -      engineOf(file),
  -      [
  -        "Source changed: false",
  -        "",
  -        "build verify: attempt 2 of 2",
  -        "",
  -        "## Progress",
  -        "",
  -        "**Q1 \u2014 Verify:** another fix round, or stop here?",
  -        "A) Try again \u2014 one more fix round runs",
  -        "B) Stop \u2014 the run ends here with a handover; the next run resumes here",
  -        "Recommended: B) Stop \u2014 no question is left to decide",
  -        "",
  -      ].join("\n"),
  -    );
  +    countsRow(logs, file, {
  +      title: "Verify",
  +      question: "another fix round, or stop here?",
  +      options: ["Try again", "Stop"],
  +      recommended: "Stop",
  +      reason: "no question is left to decide",
  +    });
  +    expect(statusRows(file).find((x) => x.type === "decision-counts")).toMatchObject({
  +      loop: { options: ["Try again", "Stop"], recommended: "Stop" },
  +    });
  +    expect(fs.existsSync(engineOf(file))).toBe(false);
       const r = await run(["decisions", "check", `--file=${file}`], root);
       expect(r.code).toBe(6);
       expect(`${JSON.stringify(r.json)}${r.err}`).toContain("decisions counts");
     });
  ```

- Task 44 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" — an existing test the tests step changed since `0431e556f`; the update may add expectations, never remove or loosen one. not additive: a line of the test was removed or changed — read the diff for an expectation removed or loosened

  ```diff
     it("writes a confirmation into the engine file", async () => {
       const { root, logs } = checkout();
       const out = path.join(logs, "build-decision-1-1.md");
       fs.writeFileSync(
         out,
         [
           "Question: CHALLENGE",
           "From: verify",
           "",
           "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
           "A) Accept — the item is recorded as accepted",
           "B) Fix now — a fix task is added to the plan",
           "Recommended: A) Accept — the caller already caps it",
           "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
           "Decision: A) Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
           "",
         ].join("\n"),
       );
  +    fs.appendFileSync(
  +      seedStatus(logs),
  +      `${JSON.stringify({
  +        type: "decision-answer",
  +        workflow: "build",
  +        at: "2026-10-28T00:00:00Z",
  +        file: path.relative(root, out),
  +        q: 1,
  +        answer:
  +          "Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
  +        by: "headless",
  +        assumed: true,
  +      })}\n`,
  +    );
       const before = fs.readFileSync(out, "utf-8");
       expect(fs.existsSync(engineOf(out))).toBe(false);
  +    const reasonFile = path.join(logs, "owner-reason.md");
  +    fs.writeFileSync(reasonFile, "fine\n");
       const r = await run(
  -      ["decisions", "apply", "--by=owner", `--file=${out}`, "--q=1", "--confirm", "--reason=fine"],
  +      [
  +        "decisions",
  +        "apply",
  +        "--by=owner",
  +        `--file=${out}`,
  +        "--q=1",
  +        "--confirm",
  +        `--reason-file=${reasonFile}`,
  +      ],
         root,
       );
       expect(r.code).toBe(0);
       expect(fs.readFileSync(out, "utf-8")).toBe(before);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toMatch(/Decision: Accept — fine \(owner, confirmed at ship, /);
  -    expect(engine).not.toMatch(/^Status:/m);
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
  +    const rows = statusRows(out);
  +    const confirmed = rows.filter((x) => x.type === "decision-answer").at(-1);
  +    expect(confirmed).toMatchObject({ q: 1, by: "owner", workflow: "ship" });
  +    expect(String(confirmed?.answer)).toMatch(/^Accept — /);
  +    expect(String(confirmed?.answer)).not.toContain("fine");
  +    expect(JSON.stringify(rows.at(-1))).not.toContain("fine");
  +    expect(JSON.stringify(rows)).not.toMatch(/Status:/);
     });
  ```


## Taken over

- Task 28 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > writes the attempt line, progress, base check and loop question into the engine file only" — taken over from Task 11; recorded `red` after the rewrite

  ```diff
     it("writes the attempt line, progress, base check and loop question into the engine file only", async () => {
       const { root, logs } = checkout();
       const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 2);
       const before = fs.readFileSync(out, "utf-8");
       const base = baseFile(root, { verdict: "none", baseRed: 0, branch: 3 });
  -    const r = await counts(
  +    const r = await countsAt(
         root,
         out,
         statusOf(logs, [4, 4]),
         "--source-changed=false",
         `--base-check=${base}`,
       );
       expect(r.code).toBe(0);
       expect(fs.readFileSync(out, "utf-8")).toBe(before);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toContain("Source changed: false");
  -    expect(engine).toContain("Gate: FAIL");
  -    expect(engine).toContain("build verify: attempt 2 of 2");
  -    expect(engine).toContain("## Progress");
  -    expect(engine).toContain("Problems after each round: 4 → 4");
  -    expect(engine).toContain("Also red on base abc1234: 0 of 3");
  -    expect(engine).toMatch(/\*\*Q1 — Verify:\*\* decide the items below/);
  -    expect(engine).toContain("A) Try again — one more fix round runs");
  -    expect(engine).toContain("B) Decide — ");
  -    expect(engine).not.toContain("**Q2");
  -    expect(engine).not.toMatch(/^Status:/m);
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
  +    expect(fs.readdirSync(logs).filter((f) => f.endsWith(".md"))).toEqual([
  +      "build-decision-1-1.md",
  +    ]);
  +    const rows = countsRows(logs);
  +    expect(rows).toHaveLength(1);
  +    expect(rows[0]).toMatchObject({
  +      type: "decision-counts",
  +      workflow: "build",
  +      sourceChanged: false,
  +      gate: "FAIL",
  +      loop: { recommended: "Decide" },
  +    });
  +    expect(String(rows[0]!.file)).toMatch(/build-decision-1-1\.md$/);
  +    expect(JSON.stringify(rows[0])).toContain("abc1234");
  +    const shown = shownOf(r.json);
  +    expect(shown).toContain("build verify: attempt 2 of 2");
  +    expect(shown).toContain("Problems after each round: 4 → 4");
  +    expect(shown).toContain("Also red on base abc1234: 0 of 3");
  +    expect(shown).toMatch(/\*\*Q1 — Verify:\*\* decide the items below/);
  +    expect(shown).toContain("A) Try again — one more fix round runs");
  +    expect(shown).toContain("B) Decide — ");
  +    expect(shown).not.toContain("**Q2");
     });
  ```

- Task 28 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > recommends Decide when the last round changed no source" — taken over from Task 11; recorded `red` after the rewrite

  ```diff
     it("recommends Decide when the last round changed no source", async () => {
       const { root, logs } = checkout();
       const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
  -    const r = await counts(root, out, statusOf(logs, [4, 4]), "--source-changed=false");
  +    const r = await countsAt(root, out, statusOf(logs, [4, 4]), "--source-changed=false");
       expect(r.code).toBe(0);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toContain("Source changed: false");
  -    expect(engine).toMatch(/Recommended: B\) Decide — another round is unlikely/);
  +    const rows = countsRows(logs);
  +    expect(rows[0]).toMatchObject({ sourceChanged: false, loop: { recommended: "Decide" } });
  +    expect(shownOf(r.json)).toMatch(/Recommended: B\) Decide — another round is unlikely/);
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
     });
  ```

- Task 28 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > recommends Try again when the last round made progress" — taken over from Task 11; recorded `red` after the rewrite

  ```diff
     it("recommends Try again when the last round made progress", async () => {
       const { root, logs } = checkout();
       const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
  -    const r = await counts(root, out, statusOf(logs, [5, 2]), "--source-changed=true");
  +    const r = await countsAt(root, out, statusOf(logs, [5, 2]), "--source-changed=true");
       expect(r.code).toBe(0);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toContain("Source changed: true");
  -    expect(engine).toContain("(5 → 2)");
  -    expect(engine).toMatch(/Recommended: A\) Try again — the last round made progress/);
  +    const rows = countsRows(logs);
  +    expect(rows[0]).toMatchObject({ sourceChanged: true, loop: { recommended: "Try again" } });
  +    expect(shownOf(r.json)).toContain("(5 → 2)");
  +    expect(shownOf(r.json)).toMatch(/Recommended: A\) Try again — the last round made progress/);
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
     });
  ```

- Task 28 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > engine file recommends Stop when the base check is all and no questions are counted" — taken over from Task 11; recorded `red` after the rewrite

  ```diff
     it("engine file recommends Stop when the base check is all and no questions are counted", async () => {
       const { root, logs } = checkout();
       const out = orchestratorPause(logs, [], 2);
  -    const r = await counts(root, out, statusOf(logs, [4, 4]), `--base-check=${baseFile(root, {})}`);
  +    const r = await countsAt(
  +      root,
  +      out,
  +      statusOf(logs, [4, 4]),
  +      `--base-check=${baseFile(root, {})}`,
  +    );
       expect(r.code).toBe(0);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toMatch(/Recommended: B\) Stop — .*fail on `dev` too/);
  -    expect(engine).toContain("Fix `dev`, then resume.");
  +    expect(countsRows(logs)[0]).toMatchObject({ loop: { recommended: "Stop" } });
  +    expect(shownOf(r.json)).toMatch(/Recommended: B\) Stop — .*fail on `dev` too/);
  +    expect(shownOf(r.json)).toContain("Fix `dev`, then resume.");
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
     });
  ```

- Task 28 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > engine file recommends Decide when the base check is all and questions are counted" — taken over from Task 11; recorded `red` after the rewrite

  ```diff
     it("engine file recommends Decide when the base check is all and questions are counted", async () => {
       const { root, logs } = checkout();
       const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 2);
  -    const r = await counts(root, out, statusOf(logs, [4, 4]), `--base-check=${baseFile(root, {})}`);
  +    const r = await countsAt(
  +      root,
  +      out,
  +      statusOf(logs, [4, 4]),
  +      `--base-check=${baseFile(root, {})}`,
  +    );
       expect(r.code).toBe(0);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toMatch(/Recommended: B\) Decide — .*fail on `dev` too/);
  +    expect(countsRows(logs)[0]).toMatchObject({ loop: { recommended: "Decide" } });
  +    expect(shownOf(r.json)).toMatch(/Recommended: B\) Decide — .*fail on `dev` too/);
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
     });
  ```

- Task 28 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions counts > writes Source changed and Gate into the engine file for a verify pause with no loop" — taken over from Task 11; recorded `red` after the rewrite

  ```diff
     it("writes Source changed and Gate into the engine file for a verify pause with no loop", async () => {
       const { root, logs } = checkout();
       const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1);
       const before = fs.readFileSync(out, "utf-8");
  +    fs.writeFileSync(
  +      path.join(logs, "status.jsonl"),
  +      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-10-01T00:00:00Z" })}\n`,
  +    );
       const r = await run(
         [
           "decisions",
           "counts",
  -        `--out=${out}`,
  +        `--decision=${out}`,
           "--source-changed=true",
           `--base-check=${baseFile(root, {})}`,
         ],
         root,
       );
       expect(r.code).toBe(0);
       expect(fs.readFileSync(out, "utf-8")).toBe(before);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toContain("Source changed: true");
  -    expect(engine).toContain("Gate: FAIL");
  -    expect(engine).not.toContain("## Progress");
  -    expect(engine).not.toContain("**Q1");
  +    const rows = countsRows(logs);
  +    expect(rows).toHaveLength(1);
  +    expect(rows[0]).toMatchObject({ sourceChanged: true, gate: "FAIL" });
  +    expect(rows[0]!.loop).toBeUndefined();
  +    expect(shownOf(r.json)).not.toContain("**Q1");
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
     });
  ```

- Task 29 `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > decisionItems reads the loop question and progress from the engine file" — taken over from Task 9; recorded `red` after the rewrite

  ```diff
     it("decisionItems reads the loop question and progress from the engine file", () => {
  -    const { read, rel } = pauseDir(orchestratorFile(), engineFile());
  +    const { read, rel, logDir } = rowDir(orchestratorFile(), [countsRow()]);
  +    expect(fs.existsSync(path.join(logDir, "build-decision-1-1-engine.md"))).toBe(false);
       const items = decisionItems(read, rel);
       expect(items.map((i) => [i.n, i.title])).toEqual([
         [1, "Verify"],
         [2, "Task 3 [src/a.ts:10]"],
       ]);
       expect(items[0]!.options).toEqual(["Try again", "Decide"]);
       expect(items[0]!.recommended).toBe("Decide");
       expect(items[1]!.options).toEqual(["Accept", "Fix now"]);
       expect(items[1]!.recommended).toBe("Accept");
     });
  ```

- Task 29 `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > the engine file's Decision line wins for one question" — taken over from Task 9; recorded `red` after the rewrite

  ```diff
     it("the engine file's Decision line wins for one question", () => {
  -    const { read, rel } = pauseDir(
  -      orchestratorFile({ answer: "Accept — the orchestrator wrote this" }),
  -      engineFile({ q2: "Fix now — the engine file wrote this" }),
  +    const { read, rel } = rowDir(
  +      `Status: OPEN\n${orchestratorFile({ answer: "Accept — the orchestrator wrote this" })}`,
  +      [countsRow(), answerRow(2, "Fix now — the row wrote this")],
       );
       const q2 = decisionItems(read, rel).find((i) => i.n === 2)!;
  -    expect(q2.decision).toBe("Fix now — the engine file wrote this");
  +    expect(q2.decision).toBe("Fix now — the row wrote this");
       expect(q2.options).toEqual(["Accept", "Fix now"]);
     });
  ```

- Task 29 `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > openDecision reads Gate and Source changed from the engine file's header" — taken over from Task 9; recorded `red` after the rewrite

  ```diff
     it("openDecision reads Gate and Source changed from the engine file's header", () => {
  -    const { tree, logDir } = pauseDir(
  -      orchestratorFile(),
  -      engineFile({ headers: ["Source changed: true", "Gate: FAIL"] }),
  -    );
  +    const { tree, logDir } = rowDir(orchestratorFile(), [countsRow({ sourceChanged: true })]);
       const open = openDecision(logDir, tree, "build", 1);
       expect(open).toMatchObject({
         file: "logs/build-decision-1-1.md",
         from: "verify",
         question: "CHALLENGE",
         group: 1,
         gate: "FAIL",
         sourceChanged: "true",
         status: "OPEN",
       });
     });
  ```

- Task 29 `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > a pause whose loop answer is Try again reads DECIDED" — taken over from Task 9; recorded `red` after the rewrite

  ```diff
     it("a pause whose loop answer is Try again reads DECIDED", () => {
  -    const { tree, logDir, rel } = pauseDir(
  -      orchestratorFile(),
  -      engineFile({ loop: "Try again — one more round" }),
  -    );
  +    const { tree, logDir, rel } = rowDir(orchestratorFile(), [
  +      countsRow(),
  +      answerRow(1, "Try again — one more round"),
  +    ]);
       expect(openDecision(logDir, tree, "build", 1, [rel])).toBeNull();
       // The same pause with its loop question unanswered is still open.
  -    const unanswered = pauseDir(orchestratorFile(), engineFile());
  +    const unanswered = rowDir(orchestratorFile(), [countsRow()]);
       expect(
         openDecision(unanswered.logDir, unanswered.tree, "build", 1, [unanswered.rel]),
       ).toMatchObject({
         status: "OPEN",
       });
     });
  ```

- Task 29 `.bkit/core/engine/commands/workflow/open-decision.test.ts` "gateRerun > re-runs a red-gate pause laid out in two files" — taken over from Task 9; recorded `red` after the rewrite

  ```diff
     it("re-runs a red-gate pause laid out in two files", () => {
       const orchestrator = ["Question: VERIFY_GAPS", "From: verify", "Group: 1", ""].join("\n");
  -    const { tree, logDir, read, rel } = pauseDir(orchestrator, engineFile());
  +    const { tree, logDir, read, rel } = rowDir(orchestrator, [countsRow()]);
       const open = openDecision(logDir, tree, "build", 1);
       expect(open).not.toBeNull();
  -    const engine = read("logs/build-decision-1-1-engine.md")!;
  -    expect(gateRerun(open, read(rel)!, engine)).toEqual({ gateRerun: true, rerunFrom: "verify" });
  +    expect(gateRerun(open, read, rel)).toEqual({ gateRerun: true, rerunFrom: "verify" });
     });
  ```

- Task 29 `.bkit/core/engine/commands/workflow/open-decision.test.ts` "skipProblem > reads Source changed and the loop answer from the engine file" — taken over from Task 9; recorded `red` after the rewrite

  ```diff
     it("reads Source changed and the loop answer from the engine file", () => {
  -    const orchestrator = orchestratorFile({ answer: "Accept — the caller caps it" });
  -    const decided = engineFile({ headers: ["Source changed: false"], loop: "Decide" });
  -    expect(skipProblem(orchestrator, decided)).toBeNull();
  -    const again = engineFile({ headers: ["Source changed: false"], loop: "Try again" });
  -    expect(skipProblem(orchestrator, again)).toBe(
  +    const orchestrator = orchestratorFile();
  +    const decided = rowDir(orchestrator, [
  +      countsRow({ gate: undefined }),
  +      answerRow(2, "Accept — the caller caps it"),
  +      answerRow(1, "Decide"),
  +    ]);
  +    expect(skipProblem(decided.read, decided.rel)).toBeNull();
  +    const again = rowDir(orchestrator, [
  +      countsRow({ gate: undefined }),
  +      answerRow(2, "Accept — the caller caps it"),
  +      answerRow(1, "Try again"),
  +    ]);
  +    expect(skipProblem(again.read, again.rel)).toBe(
         'the loop question Q1 is "Try again", not Decide',
       );
     });
  ```

- Task 29 `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > an owner's Fix now in the decision file wins over an engine Accept (assumed)" — taken over from Task 18; recorded `red` after the rewrite

  ```diff
     it("an owner's Fix now in the decision file wins over an engine Accept (assumed)", () => {
  -    const { read, rel } = pauseDir(
  -      orchestratorFile({ answer: "Fix now — the owner chose a fix" }),
  -      engineFile({ q2: "Accept (assumed) — cosmetic (no owner, LOCAL, 2026-11-17)" }),
  -    );
  +    const { read, rel } = rowDir(orchestratorFile(), [
  +      countsRow(),
  +      answerRow(2, "Accept (assumed) — cosmetic (no owner, LOCAL, 2026-11-17)", {
  +        assumed: true,
  +        by: "headless",
  +      }),
  +      answerRow(2, "Fix now — the owner chose a fix"),
  +    ]);
       const q2 = decisionItems(read, rel).find((i) => i.n === 2)!;
       expect(q2.decision).toBe("Fix now — the owner chose a fix");
  +    expect(q2.assumed).toBe(false);
     });
  ```

- Task 29 `.bkit/core/engine/commands/workflow/open-decision.test.ts` "decision file readers > an owner's answer in the decision file wins over an engine line applied without asking" — taken over from Task 18; recorded `red` after the rewrite

  ```diff
     it("an owner's answer in the decision file wins over an engine line applied without asking", () => {
  -    const { read, rel } = pauseDir(
  -      orchestratorFile({ answer: "Fix now — the owner chose a fix" }),
  -      engineFile({ q2: "Accept — recommended; applied without asking (GITHUB_ACTION)" }),
  -    );
  +    const { read, rel } = rowDir(orchestratorFile(), [
  +      countsRow(),
  +      answerRow(2, "Accept — recommended; applied without asking (GITHUB_ACTION)", {
  +        by: "headless",
  +      }),
  +      answerRow(2, "Fix now — the owner chose a fix"),
  +    ]);
       const q2 = decisionItems(read, rel).find((i) => i.n === 2)!;
       expect(q2.decision).toBe("Fix now — the owner chose a fix");
     });
  ```

- Task 30 `.bkit/core/engine/commands/workflow/status.test.ts` "bkit status resume gate re-run > re-runs the gate of a red-gate pause laid out in two files" — taken over from Task 9; recorded `red` after the rewrite

  ```diff
     it("re-runs the gate of a red-gate pause laid out in two files", async () => {
  +    const root = tmp();
  +    spawnSync("git", ["init", "-q", "-b", "dev"], { cwd: root });
  +    fs.writeFileSync(path.join(root, "package.json"), "{}");
  +    const logs = path.join(root, "logs");
  +    fs.mkdirSync(logs);
       const orchestrator = [
         "Question: VERIFY_GAPS",
         "From: verify",
         "Group: 1",
         "",
         "**Q2 — Task 3 gap:** accept it?",
         "A) Accept — the item is recorded as accepted",
         "B) Fix now — a fix task is added to the plan",
         "Recommended: A) Accept — minor",
         "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
  -      "Decision: Accept — minor",
         "",
       ].join("\n");
  -    const engine = [
  -      "Source changed: false",
  -      "Gate: FAIL",
  -      "",
  -      "build verify: attempt 3 of 3",
  -      "",
  -      "## Progress",
  -      "",
  -      "**Q1 — Verify:** another fix round?",
  -      "A) Try again — another fix round runs",
  -      "B) Stop — the run ends here",
  -      "Recommended: A) Try again — the last round made progress",
  -      "",
  -    ].join("\n");
  -    const file = stopped(orchestrator);
  -    fs.writeFileSync(path.join(path.dirname(file), "build-decision-1-1-engine.md"), engine);
  -    const r = await resume(file);
  +    fs.writeFileSync(path.join(logs, "build-decision-1-1.md"), orchestrator);
  +    const decision = "logs/build-decision-1-1.md";
  +    const rows = [
  +      started("build", "2026-11-01T00:00:00Z"),
  +      done("build", "build-plan-verify", "2026-11-01T00:10:00Z", { group: 1, verdict: "PASS" }),
  +      {
  +        type: "decision-counts",
  +        workflow: "build",
  +        at: "2026-11-01T00:11:00Z",
  +        file: decision,
  +        sourceChanged: false,
  +        gate: "FAIL",
  +        loop: {
  +          title: "Verify",
  +          options: ["Try again", "Stop"],
  +          recommended: "Try again",
  +          reason: "the last round made progress",
  +        },
  +      },
  +      {
  +        type: "decision-answer",
  +        workflow: "build",
  +        at: "2026-11-01T00:12:00Z",
  +        file: decision,
  +        q: 2,
  +        answer: "Accept — minor",
  +        by: "owner",
  +      },
  +    ];
  +    const status = path.join(logs, "status.jsonl");
  +    fs.writeFileSync(status, rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
  +    expect(fs.existsSync(path.join(logs, "build-decision-1-1-engine.md"))).toBe(false);
  +    const r = await run(["status", "resume", "--workflow=build", `--file=${status}`], root);
       expect(r.code).toBe(0);
       expect(r.json).toMatchObject({ gateRerun: true, rerunFrom: "verify" });
     });
  ```

- Task 30 `.bkit/core/engine/commands/workflow/workflows.test.ts` "bkit workflows summary > counts an assumed item in an engine file once" — taken over from Task 9; recorded `red` after the rewrite

  ```diff
     it("counts an assumed item in an engine file once", async () => {
  -    const cwd = tree(
  -      [done("ship-merge-pr", "2020-01-01T00:10:00Z", { workflow: "ship" })],
  +    const decisionRel = `${SREL}/build-decision-1-1.md`;
  +    const orchestrator = [
  +      "Question: CHALLENGE",
  +      "From: challenge",
  +      "",
  +      "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
  +      "A) Accept — the item is recorded as accepted",
  +      "B) Fix now — a fix task is added to the plan",
  +      "Recommended: A) Accept — the caller already caps it",
  +      "Default if unanswered: the run waits for you",
  +      "",
  +    ].join("\n");
  +    const answer = (workflow: string, at: string, extra: object) => ({
  +      type: "decision-answer",
  +      workflow,
  +      at,
  +      file: decisionRel,
  +      q: 1,
  +      ...extra,
  +    });
  +    const assumedRow = answer("build", "2020-01-01T00:05:00Z", {
  +      answer: "Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
  +      by: "headless",
  +      assumed: true,
  +    });
  +    const shipRow = answer("ship", "2020-01-01T00:11:00Z", {
  +      answer: "Accept — confirmed at ship",
  +      by: "owner",
  +    });
  +
  +    // A ship summary: the assumed item is read once, from its row, with no -engine.md file.
  +    const shipTree = tree(
  +      [assumedRow, done("ship-merge-pr", "2020-01-01T00:10:00Z", { workflow: "ship" })],
         undefined,
         "ship",
       );
  -    const item = (decision: string) =>
  -      [
  -        "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
  -        "A) Accept — the item is recorded as accepted",
  -        "B) Fix now — a fix task is added to the plan",
  -        "Recommended: A) Accept — the caller already caps it",
  -        `Decision: ${decision}`,
  -        "",
  -      ].join("\n");
  -    const assumed =
  -      "A) Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)";
  -    write(
  -      cwd,
  -      `${SREL}/build-decision-1-1.md`,
  -      `Question: CHALLENGE\nFrom: challenge\n\n${item(assumed)}`,
  -    );
  -    write(cwd, `${SREL}/build-decision-1-1-engine.md`, `Source changed: false\n\n${item(assumed)}`);
  -    const r = await summarize(cwd, "ship");
  +    write(shipTree, decisionRel, orchestrator);
  +    const r = await summarize(shipTree, "ship");
       expect(r.code).toBe(0);
       expect(r.json.reasons).toContain("shipped with 1 assumed item(s) the owner did not confirm");
  +    expect(fs.existsSync(path.join(shipTree, `${SREL}/build-decision-1-1-engine.md`))).toBe(false);
  +
  +    // A build summary: a ship answer row for the same question is not a build answer, so the
  +    // item stays assumed and is counted once as accepted without the owner.
  +    const buildTree = tree(
  +      [
  +        done("build-plan-verify", "2020-01-01T00:04:00Z", { verdict: "PASS", failures: 0 }),
  +        done("build-decision", "2020-01-01T00:06:00Z", { artifacts: [decisionRel] }),
  +        assumedRow,
  +        shipRow,
  +      ],
  +      planOf(task(1, true)),
  +    );
  +    write(buildTree, decisionRel, orchestrator);
  +    const b = await summarize(buildTree);
  +    expect(b.code).toBe(0);
  +    expect(b.json.reasons).toContain(
  +      "1 item(s) accepted without the owner (assumed; ship asks to confirm)",
  +    );
  +    expect(b.json.reasons).not.toContain("1 item(s) accepted at the Decision Pause");
     });
  ```

- Task 30 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions skip > keeps the re-run when the owner's Fix now beats an engine Accept (assumed)" — taken over from Task 18; recorded `red` after the rewrite

  ```diff
     it("keeps the re-run when the owner's Fix now beats an engine Accept (assumed)", async () => {
       const { root, logs } = checkout();
  -    const file = path.join(logs, "build-decision-1-1.md");
  +    const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
  +    const status = path.join(logs, "status.jsonl");
       fs.writeFileSync(
  -      file,
  -      [
  -        "Question: CHALLENGE",
  -        "From: verify",
  -        "Group: 1",
  -        "",
  -        "**Q2 \u2014 Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
  -        "A) Accept \u2014 the item is recorded as accepted",
  -        "B) Fix now \u2014 a fix task is added to the plan",
  -        "Recommended: A) Accept \u2014 the caller already caps it",
  -        "Decision: Fix now \u2014 the owner wants it fixed",
  -        "",
  -      ].join("\n"),
  +      status,
  +      `${JSON.stringify({ type: "workflow-started", workflow: "build", at: "2026-11-17T00:00:00Z" })}\n`,
       );
  -    fs.writeFileSync(
  -      engineOf(file),
  -      [
  -        "Source changed: false",
  -        "",
  -        "## Progress",
  -        "",
  -        "**Q1 \u2014 Verify loop:** decide the items below instead of another round?",
  -        "A) Try again \u2014 another fix round runs",
  -        "B) Decide \u2014 the questions below are asked instead of another round",
  -        "Recommended: B) Decide \u2014 another round is unlikely to help",
  -        "Decision: Decide",
  -        "",
  -        "**Q2 \u2014 Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
  -        "Decision: Accept (assumed) \u2014 the caller caps it (no owner, LOCAL, 2026-11-17)",
  -        "",
  -      ].join("\n"),
  +    const counted = await run(
  +      ["decisions", "counts", `--decision=${file}`, "--source-changed=false"],
  +      root,
       );
  +    expect(counted.code).toBe(0);
  +    const named = (
  +      JSON.parse(fs.readFileSync(status, "utf-8").trim().split("\n").at(-1)!) as { file: string }
  +    ).file;
  +    const answer = (text: string, extra: object) =>
  +      fs.appendFileSync(
  +        status,
  +        `${JSON.stringify({
  +          type: "decision-answer",
  +          workflow: "build",
  +          at: "2026-11-17T00:01:00Z",
  +          file: named,
  +          q: 2,
  +          answer: text,
  +          ...extra,
  +        })}\n`,
  +      );
  +    answer("Accept (assumed) — the caller caps it (no owner, LOCAL, 2026-11-17)", {
  +      by: "headless",
  +      assumed: true,
  +    });
  +    const settled = await run(["decisions", "skip", `--file=${file}`], root);
  +    expect(settled.code).toBe(0);
  +    expect(settled.json.route).toBe("continue");
  +    answer("Fix now — the owner wants it fixed", { by: "owner" });
       const r = await run(["decisions", "skip", `--file=${file}`], root);
       expect(r.code).toBe(1);
       expect(r.json.route).toBeNull();
       expect(r.json.problem).toContain("Fix now");
     });
  ```

- Task 32 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged" — taken over from Task 12; recorded `updated` after the rewrite

  ```diff
     it("writes assumed decisions into the engine file and leaves the decision file unchanged", async () => {
       const { root, logs } = checkout();
       const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 1);
  +    seedStatus(logs);
       const before = fs.readFileSync(out, "utf-8");
       process.env.BKIT_RUNTIME = "GITHUB_ACTION";
       const r = await run(["decisions", "apply", "--by=headless", `--file=${out}`], root);
       expect(r.code).toBe(0);
       expect(fs.readFileSync(out, "utf-8")).toBe(before);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toMatch(
  -      /Decision: Accept \(assumed\) — the caller already caps it \(headless, GITHUB_ACTION, /,
  -    );
  -    expect(engine).not.toMatch(/^Status:/m);
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
  +    const rows = statusRows(out);
  +    const answers = rows.filter((x) => x.type === "decision-answer");
  +    expect(answers.map((x) => x.q)).toEqual([1, 2]);
  +    for (const a of answers) {
  +      expect(a).toMatchObject({ by: "headless", assumed: true });
  +      expect(String(a.answer)).toMatch(
  +        /Accept \(assumed\) — the caller already caps it \(headless, GITHUB_ACTION, /,
  +      );
  +    }
  +    expect(JSON.stringify(rows)).not.toMatch(/Status:/);
     });
  ```

- Task 32 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" — taken over from Task 12; recorded `updated` after the rewrite

  ```diff
     it("writes a confirmation into the engine file", async () => {
       const { root, logs } = checkout();
       const out = path.join(logs, "build-decision-1-1.md");
       fs.writeFileSync(
         out,
         [
           "Question: CHALLENGE",
           "From: verify",
           "",
           "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
           "A) Accept — the item is recorded as accepted",
           "B) Fix now — a fix task is added to the plan",
           "Recommended: A) Accept — the caller already caps it",
           "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
           "Decision: A) Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
           "",
         ].join("\n"),
       );
  +    fs.appendFileSync(
  +      seedStatus(logs),
  +      `${JSON.stringify({
  +        type: "decision-answer",
  +        workflow: "build",
  +        at: "2026-10-28T00:00:00Z",
  +        file: path.relative(root, out),
  +        q: 1,
  +        answer:
  +          "Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
  +        by: "headless",
  +        assumed: true,
  +      })}\n`,
  +    );
       const before = fs.readFileSync(out, "utf-8");
       expect(fs.existsSync(engineOf(out))).toBe(false);
  +    const reasonFile = path.join(logs, "owner-reason.md");
  +    fs.writeFileSync(reasonFile, "fine\n");
       const r = await run(
  -      ["decisions", "apply", "--by=owner", `--file=${out}`, "--q=1", "--confirm", "--reason=fine"],
  +      [
  +        "decisions",
  +        "apply",
  +        "--by=owner",
  +        `--file=${out}`,
  +        "--q=1",
  +        "--confirm",
  +        `--reason-file=${reasonFile}`,
  +      ],
         root,
       );
       expect(r.code).toBe(0);
       expect(fs.readFileSync(out, "utf-8")).toBe(before);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toMatch(/Decision: Accept — fine \(owner, confirmed at ship, /);
  -    expect(engine).not.toMatch(/^Status:/m);
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
  +    const rows = statusRows(out);
  +    const confirmed = rows.filter((x) => x.type === "decision-answer").at(-1);
  +    expect(confirmed).toMatchObject({ q: 1, by: "owner", workflow: "ship" });
  +    expect(String(confirmed?.answer)).toMatch(/^Accept — /);
  +    expect(String(confirmed?.answer)).not.toContain("fine");
  +    expect(JSON.stringify(rows.at(-1))).not.toContain("fine");
  +    expect(JSON.stringify(rows)).not.toMatch(/Status:/);
     });
  ```

- Task 33 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1" — taken over from Task 12; recorded `red` after the rewrite

  ```diff
     it("--answer writes the loop answer under the engine file's Q1", async () => {
  -    const { root, logs } = checkout();
  -    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
  +    const { root, out } = loopPause();
       const before = fs.readFileSync(out, "utf-8");
  -    fs.writeFileSync(
  -      engineOf(out),
  -      [
  -        "Source changed: false",
  -        "Gate: FAIL",
  -        "",
  -        "build verify: attempt 2 of 2",
  -        "",
  -        "## Progress",
  -        "",
  -        "**Q1 — Verify:** decide the items below instead of another round?",
  -        "A) Try again — one more fix round runs",
  -        "B) Decide — the questions below are asked instead of another round",
  -        "Recommended: B) Decide — another round is unlikely to help",
  -        "",
  -      ].join("\n"),
  -    );
  -    const r = await run(
  -      [
  -        "decisions",
  -        "apply",
  -        "--by=owner",
  -        `--file=${out}`,
  -        "--q=1",
  -        "--answer=Try again",
  -        "--reason=one more round",
  -      ],
  -      root,
  -    );
  +    const r = await owner(root, out, "--answer=Q1=A");
       expect(r.code).toBe(0);
       expect(fs.readFileSync(out, "utf-8")).toBe(before);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine.indexOf("Decision: Try again")).toBeGreaterThan(engine.indexOf("**Q1"));
  -    expect(engine).toContain("one more round");
  -    expect(engine).not.toMatch(/^Status:/m);
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
  +    const rows = statusRows(out);
  +    const answer = rows.find((x) => x.type === "decision-answer");
  +    expect(answer).toMatchObject({ q: 1, by: "owner" });
  +    expect(String(answer?.answer)).toMatch(/^Try again/);
  +    expect(rows.indexOf(answer!)).toBeGreaterThan(
  +      rows.findIndex((x) => x.type === "decision-counts"),
  +    );
  +    expect(JSON.stringify(rows)).not.toMatch(/Status:/);
     });
  ```

- Task 33 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > --answer reads the owner's reason from --reason-file" — taken over from Task 24; recorded `red` after the rewrite

  ```diff
     it("--answer reads the owner's reason from --reason-file", async () => {
  -    const { root, logs } = checkout();
  -    const out = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
  -    fs.writeFileSync(
  -      engineOf(out),
  -      [
  -        "Source changed: false",
  -        "Gate: FAIL",
  -        "",
  -        "build verify: attempt 2 of 2",
  -        "",
  -        "## Progress",
  -        "",
  -        "**Q1 — Verify:** decide the items below instead of another round?",
  -        "A) Try again — one more fix round runs",
  -        "B) Decide — the questions below are asked instead of another round",
  -        "Recommended: B) Decide — another round is unlikely to help",
  -        "",
  -      ].join("\n"),
  -    );
  +    const { root, logs, out } = loopPause();
       const reasonFile = path.join(logs, "owner-reason.md");
  -    const words = "run `touch pwned` and $(echo hi) once more";
  -    fs.writeFileSync(reasonFile, `${words}\n`);
  -    const r = await run(
  -      [
  -        "decisions",
  -        "apply",
  -        "--by=owner",
  -        `--file=${out}`,
  -        "--q=1",
  -        "--answer=Try again",
  -        `--reason-file=${reasonFile}`,
  -      ],
  -      root,
  -    );
  -    expect(r.code).toBe(0);
  -    const engine = fs.readFileSync(engineOf(out), "utf-8");
  -    expect(engine).toMatch(/Decision: Try again/);
  -    expect(engine).toContain(words);
  +    fs.writeFileSync(reasonFile, "run `touch pwned` and $(echo hi) once more\n");
  +    const r = await owner(root, out, "--answer=Q1=A", `--reason-file=${reasonFile}`);
  +    expect(r.code).toBe(2);
  +    expect(answerRows(out)).toEqual([]);
  +    expect(fs.existsSync(engineOf(out))).toBe(false);
  +    expect(fs.existsSync(path.join(root, "pwned"))).toBe(false);
  +    expect((await owner(root, out, "--answer=Q1=A")).code).toBe(0);
  +    expect(answerRows(out)).toHaveLength(1);
     });
  ```

- Task 34 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses Q1 when the engine file holds the loop question" — taken over from Task 10; recorded `updated` after the rewrite

  ```diff
     it("refuses Q1 when the engine file holds the loop question", async () => {
       const { root, logs } = checkout();
       const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 1);
  -    fs.writeFileSync(
  -      engineOf(file),
  -      [
  -        "Source changed: false",
  -        "",
  -        "build verify: attempt 2 of 2",
  -        "",
  -        "## Progress",
  -        "",
  -        "**Q1 — Verify:** decide the items below instead of another round?",
  -        "A) Try again — one more fix round runs",
  -        "B) Decide — the questions below are asked instead of another round",
  -        "Recommended: B) Decide — another round is unlikely to help",
  -        "",
  -      ].join("\n"),
  -    );
  +    countsRow(logs, file, {
  +      title: "Verify",
  +      question: "decide the items below instead of another round?",
  +      options: ["Try again", "Decide"],
  +      recommended: "Decide",
  +      reason: "another round is unlikely to help",
  +    });
  +    const rows = statusRows(file);
  +    expect(rows.find((x) => x.type === "decision-counts")).toMatchObject({
  +      loop: { title: "Verify", options: ["Try again", "Decide"], recommended: "Decide" },
  +    });
  +    expect(fs.existsSync(engineOf(file))).toBe(false);
       const r = await run(["decisions", "check", `--file=${file}`], root);
       expect(r.code).toBe(6);
       expect(`${JSON.stringify(r.json)}${r.err}`).toContain("Q1");
     });
  ```

- Task 34 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > accepts questions numbered from Q1 when the pause has no engine file" — taken over from Task 10; recorded `updated` after the rewrite

  ```diff
     it("accepts questions numbered from Q1 when the pause has no engine file", async () => {
       const { root, logs } = checkout();
       const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]", "Task 4 [src/b.ts:2]"], 1);
       expect(fs.existsSync(engineOf(file))).toBe(false);
  +    fs.appendFileSync(
  +      seedStatus(logs),
  +      `${JSON.stringify({
  +        type: "decision-counts",
  +        workflow: "build",
  +        at: "2026-10-01T00:05:00Z",
  +        file: path.relative(path.resolve(logs, "../../../../.."), file),
  +        sourceChanged: true,
  +        gate: "PASS",
  +      })}\n`,
  +    );
  +    expect(statusRows(file).find((x) => x.type === "decision-counts")?.loop).toBeUndefined();
       const r = await run(["decisions", "check", `--file=${file}`], root);
       expect(r.code).toBe(0);
     });
  ```

- Task 34 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions check > refuses a decision file whose question count no longer matches the engine file's loop options" — taken over from Task 25; recorded `updated` after the rewrite

  ```diff
     it("refuses a decision file whose question count no longer matches the engine file's loop options", async () => {
       const { root, logs } = checkout();
       const file = orchestratorPause(logs, ["Task 3 [src/a.ts:10]"], 2);
  -    fs.writeFileSync(
  -      engineOf(file),
  -      [
  -        "Source changed: false",
  -        "",
  -        "build verify: attempt 2 of 2",
  -        "",
  -        "## Progress",
  -        "",
  -        "**Q1 \u2014 Verify:** another fix round, or stop here?",
  -        "A) Try again \u2014 one more fix round runs",
  -        "B) Stop \u2014 the run ends here with a handover; the next run resumes here",
  -        "Recommended: B) Stop \u2014 no question is left to decide",
  -        "",
  -      ].join("\n"),
  -    );
  +    countsRow(logs, file, {
  +      title: "Verify",
  +      question: "another fix round, or stop here?",
  +      options: ["Try again", "Stop"],
  +      recommended: "Stop",
  +      reason: "no question is left to decide",
  +    });
  +    expect(statusRows(file).find((x) => x.type === "decision-counts")).toMatchObject({
  +      loop: { options: ["Try again", "Stop"], recommended: "Stop" },
  +    });
  +    expect(fs.existsSync(engineOf(file))).toBe(false);
       const r = await run(["decisions", "check", `--file=${file}`], root);
       expect(r.code).toBe(6);
       expect(`${JSON.stringify(r.json)}${r.err}`).toContain("decisions counts");
     });
  ```

- Task 44 `.bkit/core/engine/commands/workflow/decisions.test.ts` "bkit decisions apply --by=owner and pending > writes a confirmation into the engine file" — taken over from Task 38; recorded `updated` after the rewrite

  ```diff
     it("writes a confirmation into the engine file", async () => {
       const { root, logs } = checkout();
       const out = path.join(logs, "build-decision-1-1.md");
       fs.writeFileSync(
         out,
         [
           "Question: CHALLENGE",
           "From: verify",
           "",
           "**Q1 — Task 3 [src/a.ts:10]:** MEDIUM: the retry has no cap. Accept it?",
           "A) Accept — the item is recorded as accepted",
           "B) Fix now — a fix task is added to the plan",
           "Recommended: A) Accept — the caller already caps it",
           "Default if unanswered: the run waits for you; taken as A when nobody can be asked",
           "Decision: A) Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
           "",
         ].join("\n"),
       );
       fs.appendFileSync(
         seedStatus(logs),
         `${JSON.stringify({
           type: "decision-answer",
           workflow: "build",
           at: "2026-10-28T00:00:00Z",
           file: path.relative(root, out),
           q: 1,
           answer:
             "Accept (assumed) — the caller already caps it (headless, GITHUB_ACTION, 2026-10-28)",
           by: "headless",
           assumed: true,
         })}\n`,
       );
       const before = fs.readFileSync(out, "utf-8");
       expect(fs.existsSync(engineOf(out))).toBe(false);
  +    const reasonFile = path.join(logs, "owner-reason.md");
  +    fs.writeFileSync(reasonFile, "fine\n");
       const r = await run(
  -      ["decisions", "apply", "--by=owner", `--file=${out}`, "--q=1", "--confirm", "--reason=fine"],
  +      [
  +        "decisions",
  +        "apply",
  +        "--by=owner",
  +        `--file=${out}`,
  +        "--q=1",
  +        "--confirm",
  +        `--reason-file=${reasonFile}`,
  +      ],
         root,
       );
       expect(r.code).toBe(0);
       expect(fs.readFileSync(out, "utf-8")).toBe(before);
       expect(fs.existsSync(engineOf(out))).toBe(false);
       const rows = statusRows(out);
       const confirmed = rows.filter((x) => x.type === "decision-answer").at(-1);
  -    expect(confirmed).toMatchObject({ q: 1, by: "owner" });
  -    expect(String(confirmed?.answer)).toMatch(/^Accept — fine \(owner, confirmed at ship, /);
  +    expect(confirmed).toMatchObject({ q: 1, by: "owner", workflow: "ship" });
  +    expect(String(confirmed?.answer)).toMatch(/^Accept — /);
  +    expect(String(confirmed?.answer)).not.toContain("fine");
  +    expect(JSON.stringify(rows.at(-1))).not.toContain("fine");
       expect(JSON.stringify(rows)).not.toMatch(/Status:/);
     });
  ```

