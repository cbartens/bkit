Verdict: FAIL
Failures: 2
Fixable: false

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 2` (task 2 only).

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None — no `build-plan-verify-2-*` file exists, no `build-decision-2-*.md` and no `build-plan-gaps-remediate-2-*-log.md`. The nearest precedent is group 1: `build-plan-verify-1-1.md` reported five `test-changed` gaps as FAIL, the owner accepted all five in `build-decision-1-1.md`, and `build-plan-verify-1-2.md` returned PASS. That record covers TASK 1's five tests only; it names none of TASK 2's.

## Notes

- TASK 2's `DONE WHEN` holds in the codebase. `.bkit/core/workflows/bkit-build.md` Step 5 — Plan Current carries exactly two `steps finish --workflow=build --step=build-plan-current` lines, at 415 and 424: both `--number=5 --post --title="Plan Current"`, the first (the `anchor-read` exit-12 skip) with no `--agent` and no `--artifact` plus `--comment-field="Status=skipped (no plan anchor)"` and `--message="chore({FID}): plan-current skipped"`, the second the subagent finish with `--agent=bkit-build-plan-current`. Exit 12 routes to sub-step 2, exit 0 to sub-step 3, both routes reach the advisory at sub-step 5 and then Step 6; Gate 5 names both routes (`Base commit resolved, or the missing anchor named as the skip`, `Subagent invoked (…) when the base commit resolved`, `Advisory emitted when the base commit resolved`).
- The `DONE WHEN` suites were re-run here, not taken on trust: `pnpm vitest run .bkit/core/engine/audits/workflows/workflow-shape.test.ts .bkit/core/engine/render/trackers.test.ts` → `2` files, `336` tests pass. `bkit-build.none.txt` matches the edited workflow byte for byte (that baseline test is green), and both new tests are present at `workflow-shape.test.ts:593` and `:600` with their helpers at `:384`-`:392`.
- The execute log's `DONE — TASK 2` line was treated as a claim; the workflow text, the start/end of Step 5, the regenerated baseline and the test run above substantiate the deliverable itself.
- Test-first audit `build-tests-green-2-1.md`: `Enforced: true`, `Gaps: 2`, `Test order only: true`, both `test-changed` on `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` for TASK 2's two new tests; the third test (`trackers.test.ts` `bkit-build: the none render matches its baseline byte for byte`) shows `Changed since red` = `no`, and all three are `passed`. The report carries no `Late-red check` section.
- Both reds are genuine and failed for the reasons the plan's `TEST FIRST` lines name (`build-task-red-2-2-1.md`: `expected [ Array(1) ] to have a length of 2 but got 1`; `-2-2-2.md`: `expected [] to have a length of 1 but got +0`), recorded at `02:59` against `parentSha ddc6c2f7e`, before TASK 2's code commit.
- The two gaps are one cause, and it is not an assertion repair. The diff since each red snapshot adds `stepFinishLines()` / `withNoAgent()` at module level and replaces the tests' two inline `commandLines(...).filter(...)` setup expressions with calls to them; every `expect(...)` statement in both tests is byte-identical to its red snapshot (three in the first test, six in the second, including the anchor-before-field-before-dispatch ordering assertions). The helpers reproduce the inline predicates exactly, so nothing was weakened, removed or rewritten. `tests green` reports `test-changed` only because `onlyAddsLines` (`tests.ts:621`) tolerates insertions and this edit also removes lines.
- So the run context's question is the right one — this gap is not `Fixable: false` on the "assertions rewritten" ground — but the evidence answers it the other way on a mechanical point: a re-record against the current file does not close the gap for an agent. TASK 2's code commit `4cbade226` already carries `build-plan-execute-2-log.md` with `DONE — TASK 2`, so `taskCodeCommits` (`tests.ts:701`) resolves TASK 2's code commit to it, and any red written now sits at `parentSha` `4cbade226` or later; `merge-base --is-ancestor` then fires `late-red` (`tests.ts:1476`-`1485`), which is the swap the suite's own test asserts (`tests.test.ts:1709`-`1731`: re-record after the code commit yields `["late-red"]`, not a clean task). `tests red` exposes no `parentSha` flag to declare an earlier point (`tests.ts:1140`-`1167`), and the rules bar rewriting history to land the red where it belonged.
- What I would require, precisely: (a) the owner's `Decision: Accept`, recorded as a `- **TEST EXCEPTION:**` field on TASK 2 naming both tests, in the shape `build-decision-1-1.md` already used for the same class of gap — the assertions are demonstrably untouched, so that waiver carries no test-strength cost; or (b) if the owner prefers fresh evidence to a waiver, an explicit authorisation to re-record the two reds with Step 5's skip route temporarily reverted (the only honest landing point) and to accept the `late-red` rows that then stand in place of `test-changed`. Neither is an agent's call: one needs the owner's waiver, the other the owner's authorisation.
- The `docs/knowledge.jsonl` row `red-snapshot-freezes-the-test-file-write-it-lint-clean-first` (ACTIVE) describes this exact mechanism — write the test lint-clean before its red, touch the test file afterwards only under a human `TEST EXCEPTION` — and the execute log cites it when declaring the blocker rather than re-running a red.
- Declared carry-over, not a TASK 2 gap: `.bkit/core/.bkit/workflows.md` still carries the pre-split numbering (line 876 `| 4 — Plan Current |`, line 1429 `Step 3 @bkit-build-plan-convert`), and the plan's `Documentation Updates` rows (`workflows.md` catalogue, `instructions:sync`, `docs/testing.md`, the knowledge-row correction) are assigned to TASK 3 and TASK 5 in group 3. TASK 2's own `DONE WHEN` names neither file.
- The plan has no `Derived Test Matrix`, so there are no rows to check for a missing test. No `docs/deferrals.jsonl` row and no `BLOCKED` line is offered as evidence for TASK 2.
- TASK 2 is left `- [ ]` because two test-first audit gaps stand against it; nothing else was ticked, and nothing was committed by this step.

## Identified Gaps Log

1. TASK 2: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Plan Current posts a comment whether it runs or skips` — test-changed — the diff since its red snapshot moves the test's setup predicate into the module-level helper `stepFinishLines()`, leaving all three `expect(...)` statements byte-identical; a re-record against the current file would be `late-red` because TASK 2's code commit `4cbade226` already holds the `DONE — TASK 2` log, so only the owner can waive or authorise it — Fixable: false
2. TASK 2: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Plan Current's skipped comment says no plan anchor` — test-changed — same cause: its inline `… && !l.includes("--agent")` setup became `withNoAgent(stepFinishLines(…))`, all six `expect(...)` statements byte-identical, including the anchor → field → dispatch order checks; the same `late-red` block stops an agent-side re-record, and the inline form re-triggers `vitest(no-conditional-in-test)` (`error` in `.oxlintrc.json:14`) — Fixable: false
