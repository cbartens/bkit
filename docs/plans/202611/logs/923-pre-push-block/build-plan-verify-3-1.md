Verdict: PASS
Failures: 0
Fixable: false
Tasks: 10, 11, 12
Loosened: none
Fingerprint: 124610e6d272ca1c5b3d30a8e58288419b88453ff5c988e29f798ac16d6e8e4e
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

- TASK 10 satisfied: all six `branches push` lines in `.bkit/core/workflows/bkit-ship.md` (282, 306, 432, 485, 644, 746) start with `BKIT_PR_CONFLICT_CHECK=false`. Task 5's test was replaced by `ship switches the PR conflict check off for every push` in `ship-invariants.test.ts`, and the two push-shape tests it broke (integrate push, bookkeeping push) were updated to the new line. Both `templates.md` copies (line 329) carry the new bullet. `bkit-ship.none.txt` and the `.claude` / `.cursor` / `.opencode` / `.agents` mirrors have 6 of 6 push lines switched.
- TASK 11 satisfied: the four `branches push --mode=feature` lines in `.bkit/core/workflows/bkit-debug.md` (649, 680, 752, 792) carry the switch; the `--mode=dev` close push (763) is unchanged, as the DONE WHEN requires. The new `debug-ci-evidence.integration.test.ts` test exists and passes. `bkit-debug.none.txt` and all host mirrors have 4 of 4 switched. Both `templates.md` copies name `/bkit-debug`.
- TASK 12 satisfied: `.bkit/templates/.husky/pre-push:236` and `.husky/pre-push:293` check `git rev-parse --is-shallow-repository` after the off switch and before the base fetch, and print one WARN naming the shallow clone and `git fetch --unshallow`. The PR-conflict block is byte-identical between the two hook copies. Both `templates.md` copies list the shallow case among the warn-only paths in section `Git hooks — Husky`. The test `shallow clone → no base fetch, warns, gates run` runs against both hook copies and passes; the existing full-clone tests still pass.
- Tests run (exit 0): `ship-invariants.test.ts`, `debug-ci-evidence.integration.test.ts`, `husky-pre-push.integration.test.ts`, `render/trackers.test.ts` (315 tests), plus `ci-dispatch-gate-alignment.test.ts` and `workflow-fence-syntax.test.ts` (51 tests), because they match on push lines.
- Test-first audit `build-tests-green-3-1.md`: Enforced true, 0 gaps, 0 unproven, no updated or already-landed tests.
- Decision record `build-decision-2-1.md` (Q1, Q2: Fix now) set the direction for tasks 10 and 11; the changes follow it.
- Derived Test Matrix rows for tasks 10, 11 and 12 each have their test in that task's TEST FIRST, and each test exists and passes. The plan has no `Documentation Updates` section. The new hook WARN uses the hook's existing `[pre-push] WARN:` format.
- Docs: `.agents/docs.md` loaded; `docs/testing.md` and `docs/observability.md` are present; `docs/data-schema.md` is a 10-line stub that does not apply here.
- Out of scope (not a gap; for the owner to consider): the feature-branch pushes in `bkit-build`, `bkit-plan` and `bkit-design` (for example `.claude/commands/bkit-build.md`, 2 lines) do not carry `BKIT_PR_CONFLICT_CHECK=false`. The plan's tasks 10 and 11 cover only ship and debug, so this is not judged here.

## Identified Gaps Log

None
