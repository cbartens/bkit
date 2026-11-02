Verdict: CONCERNS
Failures: 2
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Regression risk — touched surfaces, backwards compatibility, design-coverage.

## Surface-Area Map

<!-- prettier-ignore -->
| Task | Surface and consumers | Risk and coverage |
| --- | --- | --- |
| 1 | `step-table.ts`: `WORKFLOW_STEPS`, new `runProgress`, and the existing resume reader. The table is also checked against workflow headings. | Shared exported utility; high risk. Nine new calculation cases cover the five workflows, duplicate numbers, group totals, attempts and rounding. Existing resume behavior is explicitly preserved. |
| 2 | `steps.ts`: exported `writeStepRow`, `finish`, `steps done` and `steps gate`; `counters.ts`: frozen limits and grants. Language-server references identify `context.ts`, `runs.ts`, `tests.ts` and `workflows.ts` as the additional row-writer consumers. | Shared persistence and command boundary; high risk. The plan traces every writer and preserves optional return compatibility, existing row schemas, exit codes and loop policy. Two gaps below concern the journal boundary and failure ordering. |
| 3 | The shared narration clause, six workflow sources, source workflow catalog and host renderer tests; consumers are Claude, Cursor, Codex, Antigravity and opencode payloads. | Cross-provider instruction contract. The plan includes synchronization, hidden stdout sites, gate-only positions, duplicate narration and generated mirrors. Static/render checks are suitable for this text change. |
| 4 | Canonical CLI/workflow docs, testing docs, changelog and the phone verification artifact. | No runtime schema or endpoint changes. The external phone screenshot remains explicitly unverified until performed; character counts are not presented as layout proof. |

No database, event bus, network endpoint, migration or credential contract changes. The input names no design artifact. The proposed integration tests exercise real local files, Git and command dispatch. Existing related failures about prior-run contamination and journal write roots remain relevant: the plan scopes progress to the supplied status file/current run and preserves status schemas.

## CRITICAL

1. **R2-1 — The gate test contradicts the existing command journal (plan edit).** Task 2's `progress gate only completions` test fails when gate rendering mutates status bytes, while the architecture requires real command dispatch and preservation of existing behavior. `runCommand` invokes `journal.call` before the verb at `.bkit/core/engine/commands/lib.ts:584`; `engineJournal` appends an `engine-call` row to the active status file at `.bkit/core/engine/commands/lib.ts:482`. Thus an ordinary gate call against an active run changes status bytes even though `steps gate` itself is read-only (`steps.ts:1705`). No task changes this journal behavior, and disabling it to satisfy the test would lose the existing completeness evidence. Change the requirement and test to assert that the gate creates no `step-done`/other domain row and does not alter existing rows, while allowing and checking the normal `engine-call` row. Keep real dispatch and the journal enabled in that integration case.

2. **R2-2 — Newly fallible progress reads need a pre-write failure boundary and regression case (plan edit).** The architecture directs `writeStepRow` to calculate progress only after successfully recording completion, to reread/parse the plan, and to surface invalid plan/status errors. Today `writeStepRow` appends at `.bkit/core/engine/commands/workflow/steps.ts:554`, returns immediately for `commit=none` at line 593, and commits before successful returns at lines 603/607. Its rollback covers commit refusal/failure, not an exception in a new calculation after those successful returns. A malformed or unreadable plan can therefore make the command report failure after a durable `DONE` row or commit, advancing resume/attempt state despite the failure; the planned failed-write test does not exercise this new cause. Define the ordering explicitly: resolve/validate all fallible progress inputs before the completion append (using the prospective row for calculation), then expose the prepared string only after the existing write/commit succeeds. Add a matrix/test case for malformed/unreadable progress input proving no new domain completion row and no commit lands, plus the existing refused-commit case proving no progress is emitted. Preserve normal engine journal evidence. This can be a table of cases within Task 2's test cap, or the task can be split if necessary.

## OPTIONAL

- The shared `WORKFLOW_STEPS` export, `writeStepRow` persistence seam and frozen-counter reader are high-risk utilities. Keep their existing focused regression suites in the verification set in addition to the new progress cases.
- Clarify whether `g` in the expanded build formula is the ordinal position of the current group or its marker number. `parsePlanBlocks` checks increasing group numbers rather than contiguity (`plan-blocks.ts:435`); a sparse group list should not produce a fraction above the total or an unexplained `Group 5 of 2`. A focused sparse-group fixture would make the intended contract explicit.

## OUT OF SCOPE

None. The related journal attribution failure is context for keeping explicit file/run scoping; repairing its broader active-run discovery behavior is not part of this feature.
