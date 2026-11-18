Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 1, 2
Loosened: none
Fingerprint: 220eac3b53e5be544e0265a003294bc131907304d814b318179cf8b937de2651
<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode `Group`, judged against `build-diff-1-1.md` (commits `2846fafbb` tests and `d860779a9` code). No earlier verify report, gaps-remediate log or decision record exists for group 1.
- Task 1 satisfied: `StatusEvent` gains `progress?: string`, `fold` copies a string `progress` and leaves the key out otherwise; `status.test.ts` passes.
- Task 2 satisfied: `newSessionDir` writes a 32-hex `progress-id` (mode `0600`), the `sessionDir` description is updated, `sessionPublication` keeps the folder check and hashes the id with the workflow, and a missing or empty id throws; its three TEST FIRST tests and the two named integration tests pass; `repo.test.ts`, `issues.test.ts` and `tracker.test.ts` pass.
- Task 3 not satisfied: the code matches every field (`grep -rn '"invocations"' .bkit/core/engine` finds nothing, the start row carries `progress` only for a new run, a `sessionPublication` error goes through `commentDiagnostic`, `progressBinding` reads `run.progress` with the FID/workflow/run/startedAt fallback, `bindRunPublication` and `runPublicationFile` are gone). One of its five TEST FIRST tests fails on its last assertion; see the gap.
- Task 4 not satisfied: `runActionKey` names the latest run, `commentKey` drops `numberOf`, `endedRunActionKey` is gone from `.bkit/core/engine` and `dist/`, `issues.ts` and `failVerb` use `runActionKey`, `dist/` is rebuilt, and its three TEST FIRST tests plus the regression guard pass. `pnpm bkit:graph:check` reports drift in `docs/capabilities.md`; see the gap. Its whole-file `tracker.integration.test.ts` pass also waits on the Task 3 gap.
- Test-first audit `delete-still-referenced` gaps (Task 3 `bindRunPublication` and `runPublicationFile`, Task 4 `endedRunActionKey`): no gap. The hits `docs/decisions.jsonl:948`, `:950` and `:951` are this plan's own append-only decision rows that record the removal, not uses of the symbols; no code, `dist/`, doc or `.bkit/core/.bkit` file references them.
- Test-first audit `not-green` gap (Task 3): kept at `Fixable: true` as the audit decided.
- Audit `Enforced: true`, `Unproven: 0`; no `Taken over`, `Changed by a code step`, `Updated tests` or `Already landed` sections.
- Checks run here: `pnpm -s bkit:graph:check` (drift), and `pnpm -s bkit:test:file` on `status.test.ts`, `repo.test.ts`, `issues.test.ts`, `workflows.test.ts` and `tracker.test.ts` (5 files, 467 tests passed). The integration file result is taken from `build-tests-green-1-1.md` (27 passed, 1 failed; the named existing integration tests pass).
- Errors on the new path go through `commentDiagnostic` with the `[bkit-tracker]` prefix and `tracker-comment/comment-association` friction, matching `docs/observability.md` § Tracker reporting diagnostics.
- Load guard: the 1-minute load stayed above 6 for 15 minutes, so the test run started anyway, per the brief's Deviations.

## Identified Gaps Log

2 gaps.

TASK 3: `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `keeps one progress comment when the status file moves to the main checkout` — not-green: the one-comment assertions pass, but the last assertion `rows(cwd).at(-1)?.type` toBe "workflow-started" (line 800) fails because the keyed post from the main checkout appends an engine-action row; the DONE WHEN asks the test to prove the run stays IN_PROGRESS, which the tests step should check on the folded run (or the absence of a close row) instead of the last row type — Fixable: true
TASK 4: `docs/capabilities.md` — graph not refreshed: `pnpm bkit:graph:check` reports "DRIFT: docs/capabilities.md is not what this tree produces" after the tracker.ts symbol removals; DONE WHEN needs `pnpm bkit:graph:refresh` to rewrite the graph block (it reads staged files, so the engine edits are committed already) and `pnpm bkit:graph:check` to pass — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 3: moved-status-file test fails on its last-row assertion
  **Severity:** HIGH · **Class:** not-green · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tracker.integration.test.ts:800` · **Round:** 1
  - **DONE WHEN:** Task 3 five TEST FIRST tests pass; the moved-status-file test keeps the run IN_PROGRESS while the file moves (check the folded run status or the absence of a close row, not rows(cwd).at(-1)?.type, because the keyed post appends an engine-action row)
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/tracker.integration.test.ts keeps one progress comment when the status file moves to the main checkout
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 4: capabilities graph not refreshed
  **Severity:** MEDIUM · **Class:** graph-drift · **Fixable:** true · **Location:** `docs/capabilities.md:23` · **Round:** 1
  - **DONE WHEN:** pnpm bkit:graph:refresh rewrites the docs/capabilities.md graph block and pnpm bkit:graph:check passes
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
