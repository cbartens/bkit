Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9
Loosened: none
Fingerprint: 0b5919d3f0a76ddb7db74f04e544945c28111c09da9674dc21e51e9d573a741f
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (group 1 holds tasks 1-2, group 2 holds tasks 3-6, group 3 holds tasks 7-9).

## Integration Gaps

0. The three groups work together:
- Group 1 and group 2: the `local-pre-commit` text from tasks 1-2 and the `carry` list widened by task 4 agree. The store entry in `.bkit/instructions.md`, `.bkit/core/.agents/rules.md`:123 and `.agents/rules.md`:123 hold the same text, and the six carrier prompt sources each hold it once. The task 5 `Local tests first` text sits at `.bkit/core/.agents/rules.md`:121, `.agents/rules.md`:121 and in its four carriers; the two rules no longer clash.
- Group 2 and group 3 on `bkit-debug-failure-reproduce`: task 4 made it carry `local-pre-commit`, and task 8 made its step 6 name each test file (through `bkit:test:file`, a name filter only on top of a file) and dropped "other tests are unaffected" from its `PASS` mapping. The prompt now follows the rule it carries. No tracked prompt, workflow or mirror still says "a file or name filter", "other tests are unaffected" or "Exhaust the local test suite".
- Group 2 and group 3 on ship Step 2's exit-80 arm: task 3's cancelled / action-required / stale stop arm, task 7's failure / timed-out / startup-failure / error arm and every-check-passed **Else**, and task 9's `get_check_runs` / `actions_list` read sit together in one sub-list, ordered failure arm, no-check-or-pending arm, cancelled arm, **Else**. This matches the `gh` path in `checksFor` (`.bkit/core/engine/commands/workflow/prs.ts`:839-842, `PASS_STATES` and `NO_VERDICT_STATES`), whose exit-80 hint now names `get_check_runs` / `actions_list` too. The arm hashes identical in the source, the five rendered mirrors and `__snapshots__/bkit-ship.none.txt`.
- Task 9's `workflow-gh-fallback` clause: all 35 copies (five carrier workflow sources, their mirrors and the none-render snapshots) mention `get_status` only as "never `get_status`", and the old wording sits in the clause's `retired` block.

## Previously Attempted

- `build-plan-verify-holistic-1.md` (holistic attempt 1): PASS, tasks 1 and 2. It ran before groups 2 and 3 were added.
- `build-plan-verify-holistic-2.md` (holistic attempt 2): PASS, tasks 1-6. It ran before group 3 (challenge round 2, tasks 7-9) was added.
- `build-plan-verify-1-1.md`: PASS, tasks 1 and 2.
- `build-plan-verify-2-1.md`: CONCERNS, 2 gaps, fixed by `build-plan-gaps-remediate-2-1-log.md`; `build-plan-verify-2-2.md`: PASS, tasks 3, 4 and 5.
- `build-plan-verify-3-1.md`: CONCERNS, 2 gaps on task 9 (the `checksFor` hint still named `get_status`; the old clause wording was missing from `retired`), fixed by `build-plan-gaps-remediate-3-1-log.md`; `build-plan-verify-3-2.md`: PASS, tasks 7, 8 and 9.

## Notes

- Scope: only #920's nine tasks were judged. `tmp/bkit-diff-920-build-agents-run.md` was read in full for the #920 files; the #911, #915 and #929 work that came in through the branch sync was read only where it meets #920 (`checksFor` in `prs.ts`, and the Task 6 floor).
- Tasks 1 and 2: the `### local-pre-commit` store text matches `.bkit/core/.agents/rules.md`:123 and `.agents/rules.md`:123. The old text is first under `retired`. `carry` names the five planned prompts plus `bkit-debug-failure-reproduce`. `pnpm -s instructions:sync` (check mode) exited 0, and `bkit check` reported `0 write(s) would occur`, so no mirror has drifted.
- Task 3: the cancelled / action-required / stale arm sits before **Else** and does not name `/bkit-debug {FID}`, in the source, five mirrors and the none-render snapshot.
- Task 4: `bkit-debug-failure-reproduce` carries the rule. `bkit-debug-failure-soak` runs only its named `pnpm bkit:gate:static-unit`, so its DONE WHEN does not require it to carry the rule.
- Task 5: `build-decision-1-1.md` Q1 (`Decision: Fix now`, the owner's own answer) shaped this task. The new wording is in the store, both rules files and the four carriers; the old wording is under `retired`.
- Task 6: accepted by the owner in `build-decision-1-1.md` Q2 (`Decision: Accept`, the owner's own answer, not an assumed accept). The record its DONE WHEN asks for exists: `docs/decisions.jsonl` key `920-audit-reports-may-skip-ci-on-dev` and `docs/security.md`:25. Because of that, the missing TEST FIRST test is not a gap.
- Tasks 7, 8 and 9: satisfied, as described under Integration Gaps. `checksFor` at `prs.ts`:848-849 and :859 names `get_check_runs` / `actions_list`, and `dist/commands/workflow/prs.js` matches.
- Tests: `pnpm -s bkit:test:file` on `ship-invariants.test.ts`, `instructions.test.ts`, `commands/workflow/prs.test.ts` and `render/trackers.test.ts` passed 4 files, 402 tests. A filtered run of the TEST FIRST and DONE WHEN tests (the five `local-pre-commit` describe tests, the three exit-80 tests, `has no findings`, `sync has nothing left to rewrite`) passed 10 of 10.
- `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` was not run. The caller told this step not to run the full suite because the tests lock is shared across worktrees, so only single-file runs were made. Holistic attempt 2 ran it green over tasks 1-6; group 3 changed only prompt and workflow text, `prs.ts` messages and their mirrors, and every test file that reads them passed above.
- No test-first audit report was among this step's inputs. The group 3 report `build-tests-green-3-2.md` (as read by `build-plan-verify-3-2.md`) has Enforced true, Gaps 0, Unproven 0.
- Derived Test Matrix: rows 1-5 and 7-9 name tests that exist and pass. Row 6 (task 6) is covered by the Q2 accept. These tasks name their tests under TEST FIRST rather than DONE WHEN; because the tests exist and pass, earlier attempts treated this as a point about the plan's shape, not a build gap, and so does this one.
- Docs: `.agents/docs.md` was read; `docs/testing.md` has nothing that conflicts. `docs/observability.md` does not apply, because no task adds an error path. The plan has no `Documentation Updates` section.
- Out-of-scope proposals, not gaps:
  1. `get_check_runs` returns check runs only, so on the MCP path a red commit status from a CI outside GitHub Actions is not seen, and the "a commit status of `error`" clause cannot match there. Task 9's DONE WHEN made this choice.
  2. `Local tests first` says "the full suite runs only in the pre-push hook", while the build prompts' named `bkit tests changed --fallback=bkit:gate:static-unit` can run the whole unit gate. `Local pre-commit` exempts that run; `Local tests first` does not. The owner chose this wording in Q1.
  3. Three `kept:` drift reasons in `.bkit/instructions.md` still quote the retired `local-pre-commit` phrase "`/bkit-*` steps run their own gates".

## Identified Gaps Log

None
