Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 9: decisionItems(read: (rel) => string | null, rel) returns DecisionItem[]; gateRerun(open, text, engineText?) and skipProblem(text, engineText?) take the engine file text as a trailing argument (assumed signature; brief does not fix it) from .bkit/core/engine/commands/workflow/open-decision.ts:63-190
WROTE — TASK 9: `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > decisionItems reads the loop question and progress from the engine file`
WROTE — TASK 9: `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > the engine file's Decision line wins for one question`
WROTE — TASK 9: `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > decisionItems reads an old single-file layout like parseDecisionItems`
WROTE — TASK 9: `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > openDecision reads Gate and Source changed from the engine file's header`
WROTE — TASK 9: `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > a pause whose loop answer is Try again reads DECIDED`
WROTE — TASK 9: `.bkit/core/engine/commands/workflow/open-decision.test.ts` `gateRerun > re-runs a red-gate pause laid out in two files`
WROTE — TASK 9: `.bkit/core/engine/commands/workflow/open-decision.test.ts` `skipProblem > reads Source changed and the loop answer from the engine file`
WROTE — TASK 9: `.bkit/core/engine/commands/workflow/status.test.ts` `bkit status resume gate re-run > re-runs the gate of a red-gate pause laid out in two files`
WROTE — TASK 9: `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows summary > counts an assumed item in an engine file once`
WROTE — TASK 10: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses a question without lettered options, naming it`
WROTE — TASK 10: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > refuses Q1 when the engine file holds the loop question`
WROTE — TASK 10: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions check > accepts questions numbered from Q1 when the pause has no engine file`
WROTE — TASK 11: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > writes the attempt line, progress, base check and loop question into the engine file only`
WROTE — TASK 11: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > recommends Decide when the last round changed no source`
WROTE — TASK 11: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > recommends Try again when the last round made progress`
WROTE — TASK 11: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > engine file recommends Stop when the base check is all and no questions are counted`
WROTE — TASK 11: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > engine file recommends Decide when the base check is all and questions are counted`
WROTE — TASK 11: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > writes Source changed and Gate into the engine file for a verify pause with no loop`
WROTE — TASK 12: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=headless > writes assumed decisions into the engine file and leaves the decision file unchanged`
WROTE — TASK 12: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > writes a confirmation into the engine file`
WROTE — TASK 12: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > --answer writes the loop answer under the engine file's Q1`
WROTE — TASK 13: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > no workflow names decision-items.json or decisions compose`
SOURCE — TASK 10: check refusal is exit 6 with the question named in output; engine sibling is <file>-engine.md; item layout from .bkit/core/engine/commands/workflow/decisions.ts:344-520 (compose output)
