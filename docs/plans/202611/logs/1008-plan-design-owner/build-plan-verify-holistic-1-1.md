Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7
Loosened: none
Fingerprint: 570055677f30125a78d856584eeb2a81aa9866c1e459a5d576d6a30e6fb98b19
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has 2 groups: Group 1 holds Tasks 1, 2, 3, 4 and 7; Group 2 holds Tasks 5 and 6).

## Integration Gaps

0. The groups work together:

- Group 1 → Group 2 contract: the Owner Answers lines (Task 5) post with `--file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"` and no `--session-dir`. In `postForVerb` a `--file` post skips the session lookup, `runActionKey` (Task 4) keys it to the latest run (active or ended), `commentRunProof` accepts it through the same `runActionKey`, and `progressBinding` (Task 3) reads the folded run's `progress` (Task 1), which `workflows start` (Task 3) wrote from `sessionPublication` (Task 2). The integration tests `joins the run's progress comment with the Owner Answers after workflows close` and `keeps two Owner Answers rounds in one comment after a terminal close comment` drive exactly the CLI call that the workflow lines make.
- Shared state: the session link (`actionHash` of `progress-id` and the workflow) is the same value the start row stores, so pre-start session reports and later status-file reports share one invocation; a run with no `progress` falls back to a hash of workflow, run number, `startedAt` and FID, with no path, the same from every checkout.
- Bullet order: in both workflows the tracker block now sits above the commit bullet, so the post's `engine-action` row lands in the round's commit; the plan's exit 0 route reads `the next bullet.`, and the two stop routes still end the round before the comment.
- Docs (Task 6) describe the engine as built: `.bkit/core/.bkit/workflows.md` (`progress?` on `workflow-started`, the `--file` after-end key rule), `.bkit/core/.bkit/trackers.md`, `docs/architecture.md`, `docs/security.md` and `docs/testing.md`.

## Previously Attempted

- `build-plan-verify-1-1.md`: CONCERNS, Tasks 1, 2 (gaps: moved-status-file test, graph drift).
- `build-plan-gaps-remediate-1-1-log.md`: FAIL, Fixed 1 (graph refreshed; test gap BLOCKED).
- `build-plan-verify-1-2.md`: CONCERNS, Tasks 1, 2 (same two gaps).
- `build-decision-1-1.md`: Q1 Decide, Q2 Fix now, Q3 Fix now; routed to new Task 7.
- `build-plan-verify-1-3.md`: PASS, Tasks 1, 2, 3, 4, 7.
- `build-plan-verify-2-1.md`: CONCERNS, Task 5 (two Task 6 doc-row gaps).
- `build-plan-gaps-remediate-2-1-log.md`: PASS, Fixed 2.
- `build-plan-verify-2-2.md`: PASS, Tasks 5, 6.
- This is the first holistic attempt.

## Notes

- Mode `Holistic`, judged against `tmp/bkit-diff-1008-plan-design-owner.md` (the whole feature diff) and the tree at `7b4d07a76`.
- All seven tasks satisfied:
  - Task 1: `StatusEvent` gains `progress?: string`, and `fold` copies a string `progress` onto the run.
  - Task 2: `newSessionDir` writes a 32-hex `progress-id` file with mode `0600`. `sessionPublication` hashes the id with the workflow, and throws when the id is missing or empty.
  - Task 3: `workflows start` writes `progress` only for a new run. On error it goes through `commentDiagnostic`. `progressBinding` reads `run.progress`. `bindRunPublication`, `runPublicationFile` and `"invocations"` are gone from `.bkit/core/engine` and `dist/`.
  - Task 4: `endedRunActionKey` is gone. `issues.ts` and `failVerb` use `runActionKey`, and `commentKey` dropped `numberOf`.
  - Task 5: both Owner Answers lines are swapped and moved, the route line is changed, and `bkit-plan.none.txt` changes only at that line.
  - Task 6: the docs above.
  - Task 7: the moved-status-file test checks that the folded run is `IN_PROGRESS`, and the graph is current.
- The plan file still shows Tasks 3 and 4 as `[ ]`, although `build-plan-verify-1-3.md` passed them. Both are named on the `Tasks` line above so the workflow ticks them.
- Checks run here, with the 1-minute load around 8 on 10 CPUs:
  - `pnpm -s bkit:test:file` on `status.test.ts`, `repo.test.ts`, `tracker.test.ts`, `workflows.test.ts`, `issues.test.ts`, `workflow-shape.test.ts`, `catalog-parity.test.ts` and `trackers.test.ts`: 8 files, 913 tests passed.
  - `tracker.integration.test.ts`: 28 of 28 passed.
  - `pnpm -s bkit:graph:check`: "docs/capabilities.md matches a rebuild at 7b4d07a76".
  - `pnpm exec tsx .bkit/core/engine/tools/instructions.ts`: exit 0, no output.
  - `prettier --check` on both workflows: passes.
  - `bkit check`: "0 write(s) would occur."
  - Word counts: workflows 58535 (at most 58536), prompts 86494.
  - The Task 6 `run association` / `invocation files` grep finds nothing.
- Derived Test Matrix: every row has its test in a task's `DONE WHEN` or `TEST FIRST`, and each named test exists and passes.
- `Documentation Updates`: every row is done.
  - The three `1008-*` decision rows are in `docs/decisions.jsonl`, and deferral `1008-leftover-outbox-invocation-cache-files` is in `docs/deferrals.jsonl`.
  - The plan's `docs/architecture.md` "line 27" paragraph now sits in § Tracker reporting boundary, because the project-docs refresh moved it. It names the start-row link, and § Knowledge / Decisions JSONL Ledgers no longer says the outbox holds invocation receipts.
- Observability: the new catch in `workflows start` logs through `commentDiagnostic` with the `[bkit-tracker]` prefix and `tracker-comment/comment-association` friction, per `docs/observability.md` § Tracker reporting diagnostics. The unit test `start with a session folder that holds no progress id ...` pins this.
- No leftover references: outside archived `docs/plans/**`, no `.ts`, `.js`, `.mjs` or `.md` file names `endedRunActionKey`, `bindRunPublication`, `runPublicationFile` or `bkit-outbox/invocations`.
- Unproven (from `build-plan-verify-1-3.md`): Task 3 `tracker.integration.test.ts` `keeps one progress comment when the status file moves to the main checkout` was left `vacuous`, not red. The owner answers it at the end of the build. This is not a gap.
- Taken over (from `build-plan-verify-1-3.md`): Task 7 took over the same test from Task 3. It meets Task 7's `DONE WHEN`.
- Decision record `build-decision-1-1.md` holds no Accept. Its Fix-now answers were assumed by the orchestrator, not given by the owner.
- Full suite: not run here. Per the rules, only affected test files run locally, and the holistic gate runs the full suite.

## Identified Gaps Log

None
