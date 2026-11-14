Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 7, 8
Loosened: none
Fingerprint: 18b88c92ce7e6a2509d2b2b62128c6f62441f7cc13d20d5bc4538f4f2f89cb3a
<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 7: satisfied. The exit-80 sub-list in `.bkit/core/workflows/bkit-ship.md:349-353` sends failure, timed out, startup failure and error to `/bkit-debug {FID}` → **Failure Path** before the **Else** arm, and the **Else** arm continues only when every check passed (success, neutral or skipped, matching `PASS_STATES` in `.bkit/core/engine/commands/workflow/prs.ts:839`). The source, the five rendered mirrors and `__snapshots__/bkit-ship.none.txt` hash identical.
- TASK 8: satisfied. Step 6 of `.bkit/core/prompts/bkit-debug-failure-reproduce.md` names each test file through `bkit:test:file` and allows a name filter only on top of the file. The `PASS` mapping drops "other tests are unaffected". The prompt and its Claude, Cursor, OpenCode, Codex and plugin mirrors agree. No other core prompt or workflow still says "a file or name filter".
- TASK 9: not satisfied. The exit-80 arm and the `### workflow-gh-fallback` clause read `get_check_runs` / `actions_list`. All 5 carrier workflows × (source, 5 mirrors, snapshot) = 35 copies hash identical to `.bkit/instructions.md:3149`, and `bkit-auto` carries no copy. Two gaps remain: the engine's own exit-80 hint still says `get_status`, and the old clause wording was not retired.
- Tests: `pnpm -s bkit:test:file` on `ship-invariants.test.ts`, `instructions.test.ts` and `render/trackers.test.ts` passed 3 files, 287 tests. That run includes the three TEST FIRST tests and the corpus tests `has no findings` and `sync has nothing left to rewrite`. `pnpm -s bkit check` exited 0 with no drift lines.
- Test-first audit (`build-tests-green-3-1.md`): Enforced true, Gaps 0, Unproven 0. It has no `Updated tests` or `Already landed` section.
- Decision record `build-decision-1-1.md` covers TASKS 5 and 6 (group 2). It has no bearing on group 3.
- Derived Test Matrix rows for tasks 7, 8 and 9 each have their test in the task's TEST FIRST, and each test exists and passes. The plan has no `Documentation Updates` section. Group 3 adds no error-logging code, so `docs/observability.md` does not apply.
- Out of scope, for the owner: `get_check_runs` returns only check runs, not commit statuses. On the MCP path, a red commit status posted by a non-Actions CI is now invisible, and the "a commit status of `error`" clause in the debug arm cannot match. The `gh` path reads `statusCheckRollup`, which holds both. Task 9's DONE WHEN made this choice, so it is not logged as a gap.

## Identified Gaps Log

2 gaps.

TASK 9: `.bkit/core/engine/commands/workflow/prs.ts:859` — `checksFor` still prints "read the rollup through pull_request_read (get_status)" when gh is unavailable (the exit-80 case), and its doc comment at `:849` says the same, so at the exact moment the exit-80 arm fires the CLI tells the agent to read `get_status`, the opposite of the reworded arm and gh MCP fallback clause ("never `get_status`"); `dist/commands/workflow/prs.js` carries the same text — Fixable: true
TASK 9: `.bkit/instructions.md:3149` — the `### workflow-gh-fallback` clause text changed, but the old wording (`bkit prs checks --number` → `pull_request_read` (`get_status`);) was not moved into its `retired` block, as `.bkit/instructions.md` § Format ("Change a clause by editing its `text` block, moving the old wording into its `retired` block") requires; none of the five retired lines at :3153-3157 equals the pre-group text — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** checksFor exit-80 hint still names get_status
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/prs.ts:859` · **Round:** 1
  - **DONE WHEN:** checksFor in .bkit/core/engine/commands/workflow/prs.ts (log line :859 and doc comment :849) names pull_request_read get_check_runs or actions_list runs for the head SHA, not get_status; dist/commands/workflow/prs.js rebuilt to match
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** old gh MCP fallback wording not moved to retired
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/instructions.md:3149` · **Round:** 1
  - **DONE WHEN:** the pre-group workflow-gh-fallback text (bkit prs checks --number -> pull_request_read (get_status);) sits as a line in the clause retired block, and instructions.test.ts has no findings and sync has nothing left to rewrite
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
