Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 7, 8
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 4

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-4-1.md`: CONCERNS, 10 gaps, Tasks 8.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-4-1-log.md`: 9 gaps reported DONE, gap 10 BLOCKED.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-4-2.md`: CONCERNS, 4 gaps, Tasks 7, 8.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-4-2-log.md`: 4 gaps reported DONE.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-verify-4-3.md`: CONCERNS, 3 gaps, Tasks 7, 8.
- `docs/plans/202611/logs/860-move-deterministic-bookkeeping/build-plan-gaps-remediate-4-3-log.md`: 3 gaps reported DONE.

## Notes

1 gap, fixable, in Task 9. Tasks 7 and 8 stay satisfied.

- **Round 3 gaps, checked against the code:**
  - Gap 1 (result-file JSON shape) is closed for nine of the ten agents called with `Result:`. The `structured-result-file` clause (`.bkit/instructions.md:4926`) now gives the exact keys accepted by `renderResult` (`.bkit/core/engine/commands/workflow/steps.ts:1624-1698`), the duty to write the full report in `body`, and the exit-6 Failure Path. The clause is in `bkit-build-challenge-1/2`, `bkit-design-review-1/2`, `bkit-plan-review-1/2`, `bkit-plan-scope-check`, `bkit-design-spike` and `bkit-debug-failure-diagnose`. It is missing from `bkit-build-plan-verify`, which `bkit-build.md` calls with `Result:` at two sites. That leftover is the one gap below.
  - Gap 2 (Failures rule) is closed. The structured-result bullet sits nested directly under each of the five prompts' "Failures = CRITICAL count" step, and says the engine count of every finding replaces "any other count in your steps". So an agent in result mode gets a local rule that says which count wins, not two rules that clash. The CRITICAL-only count applies only when no `Result:` is named, and every current caller names one. The engine count matches what `challenge merge` does with the findings, since CRITICAL, HIGH and MEDIUM findings all become task blocks (`.bkit/core/workflows/bkit-build.md`, Step 11 sub-step 5). The plan asks for redundant machine-field instructions to be replaced; it does not ask for the no-`Result:` text to be removed, so the remaining lines are not a gap.
  - Gap 3 (`bkit-plan-review-2.md` split list) is closed: the bullet is indented under step 11 (`:88`), and no prompt has a structured-result bullet at column 0.
- **Checks run here:** instructions check mode and `cli-doc` check mode both exit 0. All 8 named group 4 tests pass: the five unit tests, and the three integration tests (2 files, 3 passed). `steps.test.ts`, `challenge.test.ts`, `runs.test.ts`, `status.test.ts`, `lib.test.ts` and `counters.test.ts` pass in full. The Task 9 test in `instructions.test.ts` timed out (7.2 s limit) once in a parallel run and once in a run of its own file. It passed when run by name (7.5 s), and the full file then passed 102/102 at a load average of about 7. Per the caller's rule this is load-dependent and not a deliverable defect; `build-tests-green-4-4.md` also records it green.
- **Not judged:** `pnpm build`, `bkit check` and the deepest gate in Task 9's DONE WHEN, because this agent does not build. Generated mirrors were not judged either. Task 9 stays open because of the gap anyway.
- **Test-first audit (`build-tests-green-4-4.md`):** `Enforced: true`, 0 gaps, 0 unproven, and no `Updated tests` or `Already landed` sections, so nothing needed deciding.
- **Decision records:** none was supplied for group 4, and none accepts a group 4 gap.

## Identified Gaps Log

1 gap.

- TASK 9: `bkit-build-plan-verify` still has no result-file JSON shape — `.bkit/core/workflows/bkit-build.md:700` and `:862` pass it `Result:` and then run `bkit steps stub --agent=bkit-build-plan-verify --result-file`, but the `structured-result-file` clause (`.bkit/instructions.md:4920-4927`) lists only nine carriers and leaves this prompt out; `.bkit/core/prompts/bkit-build-plan-verify.md:112` says only "give each gap its own `fixable` judgment there", with no `findings` / `judgments` / `body` / `evidenceComplete` keys and no duty to put the report in `body`. Probe in the scratchpad: a plan-verify result with findings plus `Verdict`, `Tasks`, `Loosened` judgments and no `body` exits 0 and overwrites the agent's full **Create** with the header and a generated "Challenge finding" Findings Log, which drops Scope, Notes and the Identified Gaps Log the remediate step reads. This is the plan-verify part of the round 3 gap 1, which named plan-verify's `Tasks` and `Loosened` judgments; fix by adding `bkit-build-plan-verify` to the clause carriers and syncing (plan UPDATE `.bkit/core/prompts/bkit-build-plan-verify.md`: "result serialization and retained evidence judgments"; DONE WHEN "every ... redundant machine-field instruction is replaced") — Fixable: true
