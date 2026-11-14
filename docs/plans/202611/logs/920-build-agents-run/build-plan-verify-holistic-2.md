Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6
Loosened: none
Fingerprint: 603edd08caefda4e7d0e9078c953437a9a44051cef526e8a0ab87de1e53d9688
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has two groups: group 1 holds tasks 1-2, group 2 holds tasks 3-6).

## Integration Gaps

0. Group 1 and group 2 work together:
- The `local-pre-commit` wording from tasks 1-2 and the `carry` list widened by task 4 agree. The store entry in `.bkit/instructions.md`, `.bkit/core/.agents/rules.md`:123 and `.agents/rules.md`:123 hold the same text. Six prompt sources carry it. Each of the six has a mirror in `.claude`, `.cursor`, `.opencode`, `.codex` and `.agents/plugins/bkit`.
- The task 5 `Local tests first` wording sits at `.bkit/core/.agents/rules.md`:121, `.agents/rules.md`:121 and in the four carrier prompts. The two rules no longer clash: neither one asks for the whole local suite while working.
- The task 3 exit-80 arm (`.bkit/core/workflows/bkit-ship.md`:352) matches the `gh` path. `prs checks` counts cancelled, action-required and stale checks in `cancelled`, which keeps the rollup off green (`.bkit/core/engine/commands/workflow/prs.ts`:842 and :900). That code came in with #911 through the branch sync.

## Previously Attempted

- `build-plan-verify-holistic-1.md` (holistic attempt 1): PASS, tasks 1 and 2, no gaps. It ran before group 2 (the challenge round 1 tasks 3-6) was added to the plan.
- `build-plan-verify-1-1.md` (group 1, attempt 1): PASS, tasks 1 and 2.
- `build-plan-verify-2-1.md` (group 2, attempt 1): CONCERNS, 2 gaps (task 3 none-render snapshot, task 5 `retired` block). `build-plan-gaps-remediate-2-1-log.md` fixed both.
- `build-plan-verify-2-2.md` (group 2, attempt 2): PASS, tasks 3, 4 and 5.

## Notes

- Scope: only #920's six tasks were judged. Local `dev` is 23 commits ahead of `origin/dev`, so `tmp/bkit-diff-920-build-agents-run.md` also holds the #911, #915 and #929 work. That work was read only where it meets #920 (the `prs checks` counting and the Task 6 floor).
- Task 1: the `### local-pre-commit` store text matches the `.bkit/core/.agents/rules.md`:123 bullet. The old text sits first under `retired`. The `- carry:` line names the five prompts, plus `bkit-debug-failure-reproduce` from task 4.
- Task 2: each of the six prompt sources holds the bullet once, and so does every host mirror. `pnpm instructions:sync` in check mode (no flag) exits 0. `node dist/cli.js check` reports `0 write(s) would occur`, so no mirror has drifted.
- Task 3: the arm "**If** any check is cancelled, action required or stale → **Failure Path**." sits before **Else** → next sub-step and does not name `/bkit-debug {FID}`. The same line is in `__snapshots__/bkit-ship.none.txt`:272, `.claude/commands/bkit-ship.md`:307, `.cursor/commands/bkit-ship.md`:306, `.opencode/commands/bkit-ship.md`:310 and both `.agents` `bkit-ship/SKILL.md` copies (:308).
- Task 4: `carry` and `verbatim` both name `bkit-debug-failure-reproduce`. The carrier tests in `.bkit/core/engine/tools/instructions.test.ts` find a test-running prompt by its run step (`Run only those tests`, `test runner`, `file or name filter`), not only by the two command names.
- Task 5: `build-decision-1-1.md` Q1 (`Decision: Fix now`) changed this task, and it was judged against the DONE WHEN as the plan now states it. The new wording is the same in the store, both rules files and the four carriers. The `retired` block (`.bkit/instructions.md`:1672-1676) holds the old "Exhaust the local test suite" text once, plus two older wordings. Outside that block and the test, no tracked file under `.bkit`, `.agents`, `.claude`, `.cursor`, `.opencode`, `.codex` or `docs/templates` still says "Exhaust the local test suite".
- Task 6: the owner accepted it in `build-decision-1-1.md` Q2 (`Decision: Accept`, the owner's own answer). The accepted risk is recorded in `docs/decisions.jsonl` (key `920-audit-reports-may-skip-ci-on-dev`) and in `docs/security.md`:25, which is what its DONE WHEN asks for. Because of that record, the missing TEST FIRST test and its missing red are not gaps. The existing test `audit report to dev under a [skip ci] head → allowed, light gate` matches the accepted behaviour.
- `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 0 and ran `bkit:gate:changed`. Related vitest: 237 files, 9790 passed, 2 skipped. Named vitest: 171 files, 8625 passed, 2 skipped. The node:test files, bats, lint, format and typecheck all passed ("every stage passed").
- No test-first audit report was among this step's inputs. The group reports (`build-tests-green-2-2.md`, as read by `build-plan-verify-2-2.md`) show tasks 3, 4 and 5 going red and then green. Task 6's test is `Unproven`, and Q2 covers it.
- Derived Test Matrix: rows 1-5 are the TEST FIRST tests of tasks 1, 3, 4 and 5. All of them exist in `.bkit/core/engine/tools/instructions.test.ts` and `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`, and all pass. Row 6 (task 6) is covered by the Q2 accept. These tasks name their tests under TEST FIRST rather than DONE WHEN. Because the tests exist and pass, that is a point about the plan's shape, not a build gap; earlier attempts judged it the same way.
- Docs: `.agents/docs.md` was loaded. `docs/testing.md` has nothing that conflicts with the new wording. `docs/observability.md` does not apply, because the change adds no error path. The plan has no `Documentation Updates` section.
- Out-of-scope proposals, not gaps:
  1. Three `kept:` drift reasons in `.bkit/instructions.md` (the `local-tests-first` drift at :1666 and two others) still quote the retired `local-pre-commit` wording "`/bkit-*` steps run their own gates".
  2. The new `Local tests first` says "the full suite runs only in the pre-push hook". The same prompts' steps run `bkit tests changed --fallback=bkit:gate:static-unit`, which runs the whole unit gate when `bkit:gate:changed` is not declared. `Local pre-commit` exempts that run ("A `/bkit-*` step's named command is the only wider run"), but `Local tests first` does not. The owner chose this wording in Q1, so a follow-up could add the same exemption to it.

## Identified Gaps Log

None
