Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 5
Loosened: none
Fingerprint: e28fe3723feb7217b694f03a0f9db2e65825c7009390a75428c7cd22f959cebf
<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 5 satisfied. The group diff swaps `--session-dir="{SESSION_DIR}"` for `--file="{REPO_ROOT}/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"` on both Owner Answers lines, moves the commit bullet below the tracker block in `.bkit/core/workflows/bkit-plan.md` and `.bkit/core/workflows/bkit-design.md`, and changes the plan-check exit 0 route to `the next bullet.`. DONE WHEN checked: workflows 58535 words (at most 58536), prompts 86494 words; `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exit 0 with empty output; prettier check passes on both workflows; `trackers.test.ts` (107), `workflow-shape.test.ts` (328) and `catalog-parity.test.ts` (11) pass; `bkit-design.none.txt` is not in the diff and `bkit-plan.none.txt` changes only at the route line. The existing route expectation at `workflow-shape.test.ts:1627` was updated to the new wording, which is the test the task broke.
- TASK 6 not ticked. Its DONE WHEN passes: the `run association` / `invocation files` grep finds nothing, the upgrade re-rendered `.bkit/trackers.md`, `.bkit/workflows.md` and the `.claude`, `.cursor`, `.opencode` and `.agents` mirrors, and `bkit check` reports 0 writes. Two plan `Documentation Updates` rows are only partly done (`docs/testing.md`, `docs/security.md`), logged below against the task that owns them.
- Test-first audit (`build-tests-green-2-1.md`): Enforced true, 0 gaps, 0 unproven, no Taken over, Changed by a code step, Updated tests or Already landed sections.
- Decision record `build-decision-1-1.md` covers group 1 only, and none of its accepts touch group 2.
- The other `Documentation Updates` rows are done: the three `1008-*` rows are in `docs/decisions.jsonl`, `docs/architecture.md` has the run-link sentence, and `.bkit/core/.bkit/trackers.md` and `.bkit/core/.bkit/workflows.md` carry the planned edits.
- The `docs/observability.md` error-logging check does not apply: group 2 changes only workflow text, one test and docs.

## Identified Gaps Log

2 gaps.

- TASK 6: `docs/testing.md:999` § Routine tracker reporting coverage — the plan's Documentation Updates row asks for "the file also covers a post after close and a status file moved to the main checkout"; the paragraph gained the post-after-close clause but still does not name the moved-status-file coverage (`tracker.integration.test.ts`, Tasks 3 and 7) — Fixable: true
- TASK 6: `docs/security.md:140-142` § Workflow comment ownership — the plan's Documentation Updates row asks for "the outbox holds progress files and session ids; the run's committed `progress` link holds no path"; the paragraph now says only the progress source cache stays in the outbox, and neither mentions the session folders' random ids nor states that the committed `progress` link carries no path — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Routine tracker reporting coverage omits the moved-status-file test
  **Severity:** LOW · **Class:** doc-row-incomplete · **Fixable:** true · **Location:** `docs/testing.md:999` · **Round:** 1
  - **DONE WHEN:** docs/testing.md § Routine tracker reporting coverage names both a post after close and a status file moved to the main checkout, per the plan Documentation Updates row
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Workflow comment ownership does not say the outbox holds session ids or that the committed progress link holds no path
  **Severity:** LOW · **Class:** doc-row-incomplete · **Fixable:** true · **Location:** `docs/security.md:142` · **Round:** 1
  - **DONE WHEN:** docs/security.md § Workflow comment ownership last paragraph says the outbox holds progress files and session ids and the run committed progress link holds no path, per the plan Documentation Updates row
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
