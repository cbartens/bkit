Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log

SOURCE — TASK 29: the row shapes (decision-counts loop {title, options, recommended, reason}; decision-answer q as a number, answer, by, assumed) are the plan's Data Schema Usage fields (build-input-2.md:771); loop's inner shape and gateRerun(open, read, rel) / skipProblem(read, rel) signatures are not fixed by the plan, so the tests fix them from DecisionItem in .bkit/core/engine/commands/workflow/open-decision.ts:20
WROTE — TASK 27: `.bkit/core/engine/commands/workflow/status.test.ts` `bkit status row > refuses the engine-only types decision-counts and decision-answer`
WROTE — TASK 28: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > writes the attempt line, progress, base check and loop question into the engine file only`
WROTE — TASK 28: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > recommends Decide when the last round changed no source`
WROTE — TASK 28: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > recommends Try again when the last round made progress`
WROTE — TASK 28: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > engine file recommends Stop when the base check is all and no questions are counted`
WROTE — TASK 28: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > engine file recommends Decide when the base check is all and questions are counted`
WROTE — TASK 28: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > writes Source changed and Gate into the engine file for a verify pause with no loop`
WROTE — TASK 28: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions counts > prints the attempt, progress, base and loop question lines in show`
WROTE — TASK 29: `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > decisionItems reads the loop question and progress from the engine file`
WROTE — TASK 29: `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > the engine file's Decision line wins for one question`
WROTE — TASK 29: `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > openDecision reads Gate and Source changed from the engine file's header`
WROTE — TASK 29: `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > a pause whose loop answer is Try again reads DECIDED`
WROTE — TASK 29: `.bkit/core/engine/commands/workflow/open-decision.test.ts` `gateRerun > re-runs a red-gate pause laid out in two files`
WROTE — TASK 29: `.bkit/core/engine/commands/workflow/open-decision.test.ts` `skipProblem > reads Source changed and the loop answer from the engine file`
WROTE — TASK 29: `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > an owner's Fix now in the decision file wins over an engine Accept (assumed)`
WROTE — TASK 29: `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision file readers > an owner's answer in the decision file wins over an engine line applied without asking`
WROTE — TASK 29: `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision rows > the row appended last wins even when its at is earlier`
WROTE — TASK 29: `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision rows > a Decision line in a file with no Status header is not read as an answer`
WROTE — TASK 30: `.bkit/core/engine/commands/workflow/status.test.ts` `bkit status resume gate re-run > re-runs the gate of a red-gate pause laid out in two files`
WROTE — TASK 30: `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows summary > counts an assumed item in an engine file once`
WROTE — TASK 30: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions skip > keeps the re-run when the owner's Fix now beats an engine Accept (assumed)`
WROTE — TASK 31: `.bkit/core/engine/commands/workflow/open-decision.test.ts` `decision rows > a decision file with no readable question reads OPEN with questions 0`
WROTE — TASK 31: `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=headless > exits non-zero on a decision file with no readable question`
WROTE — TASK 31: `.bkit/core/engine/commands/workflow/tasks.test.ts` `bkit tasks tick > ticks the task an Accept row names and no task for a Fix now row`
