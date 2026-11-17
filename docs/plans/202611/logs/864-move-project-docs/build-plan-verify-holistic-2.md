Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5, 6, 7, 8, 9
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (Group 1: Tasks 1, 2, 8; Group 2: Tasks 3, 4, 5, 6, 7; Group 3: Task 9).

## Integration Gaps

0 integration gaps.

- The attempt-1 gap is closed. `bkit-debug-failure-diagnose.md`, `bkit-debug-failure-remediate.md` and `bkit-debug-failure-reproduce.md` (`.bkit/core/prompts/`) now carry the `doc-warning-record` clause in step 3 (the five fields `topic`, `gap`, `recommendedPath`, `alternativeEvidence`, `action`, with a filled example) and a `## Documentation Warnings` section in their output format. `.bkit/instructions.md` lists them as carriers of that clause. `bkit-debug-abort-handover.md` step 7 now collects from the diagnose, remediate and reproduce logs, and the handover launch in `.bkit/core/workflows/bkit-debug.md:107` globs `debug-*.md`, which covers all three log names (`:517`, `:550`, `:585`). The records match `WARNING_FIELDS` in `.bkit/core/engine/commands/workflow/summary.ts`, which reads every attributed artifact of the run's status rows, so debug-run warnings now reach the summary and the handover.
- The Claude, Cursor, OpenCode and Codex mirrors of the three prompts carry the section. `node dist/cli.js check` exits 0 with `0 write(s) would occur`.
- Group 1 resolver, Group 2 detector and summary contracts are unchanged since attempt 1: `git diff 4a2205870 HEAD -- .bkit/core/engine dist` is empty.

## Previously Attempted

- Holistic: `build-plan-verify-holistic-1.md` (CONCERNS, 1 integration gap: debug diagnose/remediate/reproduce prompts lacked the `## Documentation Warnings` section and five-field record), fixed per `build-plan-gaps-remediate-holistic-1-log.md` (PASS, Fixed: 1) in `59a26cb79`.
- Group 1: `build-plan-verify-1-1.md` to `-1-5.md` (final PASS, Tasks 1, 2, 8), decisions `build-decision-1-1.md` (Fix now, added Task 8), `-1-2.md`, `-1-3.md`.
- Group 2: `build-plan-verify-2-1.md`, `-2-2.md` (CONCERNS), decision `build-decision-1-4.md` (Fix now, added Task 9).
- Group 3: `build-plan-verify-3-1.md` (PASS, Task 9).

## Notes

- Mode `Holistic`, all 3 groups, judged on the current tree at `59a26cb79` (the holistic remediation commit). The only change since attempt 1 is that commit: the three debug prompts, the handover step, the instruction registry, their host mirrors, `.bkit/version`, and regenerated graph counts in `DETAILS.md` and `docs/capabilities.md`. Its edit to the plan only ticks Tasks 1, 5, 8 and 9, which the workflow does.
- Tests, narrow run as the caller directed (the full changed-file run passed in attempt 1, and the remediation log records `bkit tests changed` exit 0 after the fix): the instruction registry check (`tsx .bkit/core/engine/tools/instructions.ts`) exits 0. Vitest `shipped-docs-refs`, `template-path-refs`, `rules-sync`, `templates` and `summary` pass 633/633. Vitest `tools/instructions*`, `render/hosts`, `render/trackers`, `template-shape` and `audits/workflows/` pass 35 files, 1337 passed, 2 skipped. Two earlier tries of the second run gave up waiting for the machine-wide tests lock, which other worktrees held. That is a lock wait, not a failure. Logs: `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/cb321a06-73f5-4f6a-b91c-b8900cbd6d4b/scratchpad/h2-audits.log`, `h2-audits-3.log`, `h2-instructions.log`, `h2-check.log` in the same folder.
- Task 3 is now satisfied: its `bkit-debug.md` UPDATE ("capture warnings on no-plan and handover paths") works end to end. Tasks 1, 2, 4, 5, 6, 7, 8 and 9 stay satisfied for the reasons in `build-plan-verify-holistic-1.md`, and no engine or `dist/` file has changed since then.
- No test-first audit report was supplied. Per the caller, tests of Tasks 1, 5, 8 and 9 that passed at their red step are for the owner to answer at Step 15, not gaps. They are Task 1 `migrates legacy ownership without changing project text or core ownership` (red `vacuous`), Task 5's tests as repaired by Task 9 under `build-decision-1-4.md`, Task 8 `leaves project docs, the index and the version file unchanged when upgrade runs twice`, and Task 9 `keeps an indexed equivalent warning-free and in-tree without spying on the fs namespace`.
- Decision records: `build-decision-1-1.md` (Fix now, added Task 8) and `build-decision-1-4.md` (Fix now, added Task 9) are the owner's choices. `build-decision-1-2.md` and `-1-3.md` hold no questions. No record accepts a gap.
- Mandatory checks hold as in attempt 1. Each Derived Test Matrix row's test is named in its task's `DONE WHEN`. Every Documentation Updates row has a matching change. Errors go through `logReport` and the `project-docs-*` advisories, per `docs/observability.md`.
- Out-of-scope observation, not a gap: the debug rows of `.bkit/core/.bkit/prompts.md` § Debug Phase (line 353) still describe the handover as reading "diagnose / remediate / verify logs". The coverage table's general sentence at line 490 already covers the warning records.
- Out-of-scope observations carried from attempt 1: plan reviewers have no `Documentation Warnings` output, and `docs/testing.md:560` does not yet list the pass-through `node:fs` mock in `checks/after/tools.test.ts` among its exceptions.

## Identified Gaps Log

None.

