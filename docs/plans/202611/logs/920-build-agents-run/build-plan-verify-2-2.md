Verdict: PASS
Failures: 0
Fixable: false
Tasks: 3, 4, 5
Loosened: none
Fingerprint: e5e2f895cecd661425c0ee5ccc906e8ff1679bb3720c7972f5b5ff6e25c1ab2a
<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-2-1.md` (attempt 1): `CONCERNS`, 2 gaps. One was task 3, where the snapshot `.bkit/core/engine/render/__snapshots__/bkit-ship.none.txt` did not match `.bkit/core/workflows/bkit-ship.md`:352. The other was task 5, where the `local-tests-first` `retired` block in `.bkit/instructions.md` was wrong.
- `build-plan-gaps-remediate-2-1-log.md`: `PASS`, both gaps reported fixed. This attempt confirms both fixes in the codebase.

## Notes

- Task 3: the exit-80 arm "**If** any check is cancelled, action required or stale → **Failure Path**." sits at `.bkit/core/workflows/bkit-ship.md`:352, before **Else** → next sub-step, and does not name `/bkit-debug {FID}`. The same line is in `__snapshots__/bkit-ship.none.txt`:272, `.claude/commands/bkit-ship.md`:307, `.cursor/commands/bkit-ship.md`:306, `.opencode/commands/bkit-ship.md`:310 and both `.agents` `bkit-ship/SKILL.md` copies (:308). The group diff changes the snapshot by that one line only. `trackers.test.ts` now passes, including `bkit-ship: the none render matches its baseline byte for byte`.
- Task 4: already ticked. `### local-pre-commit` `carry` and `verbatim` name `bkit-debug-failure-reproduce`. The bullet is in the prompt and in every host mirror, and the carrier tests detect a test run by its run step. Judged satisfied again.
- Task 5: the `local-tests-first` `retired` block in `.bkit/instructions.md` (1673-1675) now holds the old "Exhaust the local test suite" wording once, plus the two older wordings, and no longer lists the current text. Outside that retired block and `instructions.test.ts`, no tracked file under `.bkit`, `.agents`, `.claude`, `.cursor`, `.opencode`, `.codex` or `docs/templates` still holds "Exhaust the local test suite". `pnpm instructions:sync` (check mode, no flag) exits 0 and changes nothing.
- Tests run (`CI=1 pnpm bkit:test:file`): `render/trackers.test.ts`, `audits/workflows/ship-invariants.test.ts` and `tools/instructions.test.ts` all pass, 284 tests. `bkit check` exits 0 with advisories only and no mirror drift.
- Task 6: accepted by `build-decision-1-1.md` Q2 (`Decision: Accept`, the owner's own answer). Because of that record, the test-first audit's task 6 `not-green` gap is not a gap. The task is already ticked and is not in this group's brief.
- Test-first audit `build-tests-green-2-2.md`: `Enforced: true`. Tasks 3, 4 and 5 went red, then green. It has no `Updated tests` or `Already landed` section.
- Unproven: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → blocked before any gate` (task 6). Not a gap: the owner answers it at the end of the build, and `build-decision-1-1.md` Q2 accepts task 6.
- Task 5 was rewritten by `build-decision-1-1.md` Q1 (`Decision: Fix now`) and was judged against the DONE WHEN as the plan now states it.
- `docs/observability.md`: not applicable, because the change is prompt, rule and test text only. The plan has no `Documentation Updates` rows. Each Derived Test Matrix row for tasks 3, 4 and 5 is the TEST FIRST of its own task, and each of those tests passes.

## Identified Gaps Log

None
