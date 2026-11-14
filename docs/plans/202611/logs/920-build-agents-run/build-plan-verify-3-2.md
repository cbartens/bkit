Verdict: PASS
Failures: 0
Fixable: false
Tasks: 7, 8, 9
Loosened: none
Fingerprint: 22ef5c50dd5e0cbdd0d5f1ebad55e9394273ee5d0e92d9675e0aa459e2d26ca0
<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-3-1.md`: CONCERNS, 2 fixable gaps on TASK 9 (the `checksFor` exit-80 hint in `prs.ts` still named `get_status`; the pre-group `workflow-gh-fallback` wording was missing from its `retired` block).
- `build-plan-gaps-remediate-3-1-log.md`: PASS, both gaps fixed.

## Notes

- TASK 7: satisfied. The exit-80 sub-list of Step 2 sub-step 5 in `.bkit/core/workflows/bkit-ship.md` sends failure, timed out, startup failure and a commit status of `error` to `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path** before the **Else** arm. The **Else** arm continues only when every check passed (success, neutral or skipped), matching `PASS_STATES` at `.bkit/core/engine/commands/workflow/prs.ts:839`. The arm hashes identical in the source and the five rendered mirrors, and `__snapshots__/bkit-ship.none.txt:269-274` carries the same text.
- TASK 8: satisfied. Step 6 of `.bkit/core/prompts/bkit-debug-failure-reproduce.md` names each test file through `bkit:test:file` and allows a name filter only on top of the file. The `PASS` mapping drops "other tests are unaffected". The prompt and its Claude, Cursor, OpenCode, Codex and plugin copies hash identical on both lines. No core prompt, workflow or agent mirror still holds "a file or name filter" or "other tests are unaffected".
- TASK 9: satisfied. The exit-80 arm reads `pull_request_read` (`get_check_runs`) or `actions_list` runs for the head SHA. The `workflow-gh-fallback` clause maps `bkit prs checks --number` to `get_check_runs` / `actions_list`, "never `get_status`", and all 35 copies (5 carrier workflows x source, 5 mirrors and snapshot) hold the clause text exactly once.
  - Attempt-1 gap 1 closed: `checksFor` at `prs.ts:848-849` (doc comment) and `:859` (log line) now name `get_check_runs` / `actions_list`; `dist/commands/workflow/prs.js` matches. No `get_status` remains in `.bkit/core/engine/commands` or `dist/commands`.
  - Attempt-1 gap 2 closed: the exact pre-group clause text (from commit `8ea7ec207`) sits as one line of the clause's `retired` block in `.bkit/instructions.md`.
- Tests: `pnpm -s bkit:test:file` on `ship-invariants.test.ts`, `instructions.test.ts` and `commands/workflow/prs.test.ts` passed 3 files, 295 tests, including the three TEST FIRST tests and the corpus tests. `pnpm -s instructions:sync` printed nothing to rewrite. `pnpm -s bkit check` exited 0 with no drift lines. The full suite was not run, per the caller's instruction (shared tests lock).
- Test-first audit (`build-tests-green-3-2.md`): Enforced true, Verdict PASS, Gaps 0, Unproven 0. No `Updated tests` or `Already landed` section.
- Decision record `build-decision-1-1.md` covers group 2 tasks; it has no bearing on group 3.
- Derived Test Matrix rows 51-53 (tasks 7, 8, 9) each have their test in the task's TEST FIRST; each test exists and passes. The plan has no `Documentation Updates` section. Group 3 adds no error-logging code, so `docs/observability.md` does not apply. `build-plan-current.md` is not present.
- Docs: `.agents/docs.md` read; no further indexed doc bears on this verification.
- Out of scope, carried from attempt 1 for the owner: `get_check_runs` returns check runs only, not commit statuses, so on the MCP path a red commit status from a non-Actions CI is not seen, and the "a commit status of `error`" clause cannot match there. Task 9's DONE WHEN made this choice, so it is not a gap.

## Identified Gaps Log

None
