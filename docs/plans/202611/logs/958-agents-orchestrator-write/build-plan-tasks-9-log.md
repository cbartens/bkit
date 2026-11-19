Verdict: FAIL

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 32: Headless, re-run and ship answers and ship's deferrals are decision-answer rows — `pending --defer` now writes `deferred: "needs-decision"` (row type `deferred?: string | boolean`; fold reads any non-false value); headless/rerun/confirm already wrote rows only. Removes: the boolean `deferred: true` row value (.bkit/core/engine/commands/workflow/decisions.ts, open-decision.ts, ledgers/status.ts)
BLOCKED — TASK 32: test `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=owner and pending > writes a confirmation into the engine file` — asserts the owner's reason ("fine") inside the decision-answer row's answer; TASK 33's multi-line test requires the reason-file text to never reach status.jsonl, so both cannot hold. Built to TASK 33; the answer reads "Accept — confirmed by the owner at ship (owner, DATE)"
DONE — TASK 33: Owner answers are Q{n}={letter} plus Q{n}={task} only — `apply --by=owner` takes repeatable `--answer=Q{n}={letter}` and `--fix-task=Q{n}={task}`, all validated before any row is appended; `--reason-file` only with `--confirm`/`--reject` (text goes to the decisions.jsonl rationale; `--reject` stores the file path as `reasonFile`). Removes: the `--reason` flag and the `--answer=<Try again|Decide|Stop>` form. Earlier-task tests in decisions.test.ts that passed `--reason` (3) moved to `--reason-file` and a non-reason answer pattern. bkit-ship.md Confirm step now writes a reason file (workflow-shape test); bkit-build.md line 292 still shows the old `--answer="{Try again|...}"` form and is left to TASK 36
DONE — TASK 34: `decisions check` refuses Decision:/Fix task:/Rejected:/Deferred: lines in an item, naming the question (itemProblem); the decision-counts read was already in place from the group 8 fix. Removes: nothing (no second path)
DONE — TASK 35: `bkit decisions answers --file=` prints {file, status, items:[{q,title,answer,by,assumed,rejected,deferred,fixTask}]} from the folded rows, writes nothing; `DecisionItem` gained `by`. cli.md regenerated with `pnpm cli:sync`; `pnpm build` run
