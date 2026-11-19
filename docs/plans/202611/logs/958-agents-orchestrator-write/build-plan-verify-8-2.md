Verdict: PASS
Failures: 0
Fixable: false
Tasks: 27, 28, 29, 30, 31
Loosened: none
Fingerprint: 1edb7870d48a82d74a09fb484beacf6e6a4cf4a0d757a50d5b0634f98365b983
<!-- verdict:end -->

# Plan Verification

## Scope

Group 8

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-8-1.md` (attempt 1): `CONCERNS`, 3 fixable gaps; Tasks 27 and 30 satisfied. Gap 1 (Task 28: the `decision-counts` row lacked the attempt, max and `loopProgress` numbers). Gap 2 (Task 31: `pauseStatus` returned a written `Status: DECIDED` for a file with no readable question). Gap 3 (Task 29: a `Gate:` or `Source changed:` header also marked a file as old).
- `build-plan-gaps-remediate-8-1-log.md` (commit `207418dfb`): all three closed, each with a new test.

## Notes

- Mode `Group`, judged against `build-diff-8-2.md` and the remediation commit `207418dfb`.
- Gap 1 closed: `loop` in the row at `.bkit/core/engine/commands/workflow/decisions.ts:519-537` now carries `attempt`, `max` and `progress` (`problems`, `gateFailures`, `codeChanged`, `lastStrategy`, `nextStrategy`, `finalSpent`, `minutesPerRound`, `trend`). `baseCheck` was already in the row, so the row now holds every number the `-engine.md` file held. The new test `bkit decisions counts > carries the attempt, max and progress numbers in the row's loop` checks this; `DecisionCountsLoop` in `.bkit/core/engine/ledgers/status.ts` declares the fields.
- Gap 2 closed: `pauseStatus` at `.bkit/core/engine/commands/workflow/open-decision.ts:264-274` returns a written `Status` only when the file has a parseable question, so it and `openDecision` read `OPEN` for a no-question file whatever its `Status` line says. Checked by the new test `decision rows > a no-question file reads OPEN whatever Status line it carries`.
- Gap 3 closed: `hasEngineLines` at `open-decision.ts:157` is now `"Status" in header`. Checked by the new test `decision rows > a file with a Gate header, a Decision line and no rows reads no answer`. A text-only `DecisionSource` (a string) is also read as an old file (`textOnly`). That is not a gap: no production caller passes a string, because every caller in `challenge.ts`, `decisions.ts`, `status.ts`, `steps.ts`, `summary.ts`, `summary-findings.ts`, `tasks.ts` and `workflows.ts` passes a reader.
- `dist/commands/workflow/open-decision.js` and `dist/commands/workflow/decisions.js` include the remediation changes. `git grep` finds no `engineSibling`, `isEngineFile`, `mergeItems`, `mergeHeader`, `TAKEN_UNASKED`, `engineStub` or `engineWith` in `.bkit/core/engine` outside the tests.
- Tests run: `status.test.ts`, `ledgers/status.test.ts`, `open-decision.test.ts`, `decisions.test.ts`, `workflows.test.ts`, `tasks.test.ts`, `challenge.test.ts`, `steps.test.ts` and `cli-doc.test.ts` gave 687 passed and 16 failed. Every planned group 8 test and every remediation test passes.
- The 16 failures are the same older `decisions.test.ts` apply, pending and check tests that attempt 1 listed. They still assert the `-engine.md` layout. No group 8 `DONE WHEN` or `TEST FIRST` names them, so they are not gaps here, and the group gate routes them. Six are taken over in group 9 (Tasks 32, 33, 34). No later task names the other ten, so the holistic check must see them fixed.
- `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `engine calls > build calls only verbs and flags the CLI has` fails with `decisions counts: no --out`. Task 28 renamed `--out` to `--decision`, but `.bkit/core/workflows/bkit-build.md:207` still passes `--out`. Task 36 (group 10) makes that workflow edit. No group 8 task names this test, so it is not a gap here; the holistic check must see it pass after Task 36.
- Test-first audit (`build-tests-green-8-2.md`): `Enforced: true`. It has no `Unproven`, `Changed by a code step`, `Updated tests` or `Already landed` sections.
- Audit gap `TASK 29: delete-still-referenced` (`mergeItems` at `docs/deferrals.jsonl:531`) is not a gap. The hit is text inside an append-only deferral row, not a code reference.
- Taken over, each judged as a planned test of the task that took it, against that task's `DONE WHEN`: Task 28 took six Task 11 `decisions counts` tests; Task 29 took six Task 9 and two Task 18 `open-decision.test.ts` tests; Task 30 took the Task 9 `status resume` and `workflows summary` tests and the Task 18 `decisions skip` test. Each asserts the row-based behaviour its task names, and each was red before its code and passes now.
- Decision records `build-decision-1-1.md` (group 3 verify) and `build-decision-1-2.md` (challenge, Task 18 Fix now, assumed, not the owner's acceptance) accept no group 8 gap.

## Identified Gaps Log

None
