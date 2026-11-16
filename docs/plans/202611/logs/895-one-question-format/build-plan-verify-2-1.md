Verdict: PASS
Failures: 0
Fixable: false
Tasks: 3, 4
Loosened: none
Fingerprint: f028c09d5cad04cce8395069764ad8df1b73b093739f8d373920ef0bc8d38140
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

- Mode `Group`, judged against `build-diff-2-1.md`. No `Deviations` section in `build-brief-2-1.md` or `build-brief-2-2.md`; no decision record, no remediate log and no earlier group 2 verify report exist.
- TASK 3: `.bkit/core/.bkit/authoring.md` § Human questions (`:631`) holds every planned bullet: who asks, the per-line shape, the widened plain-English rule, the closed seven-phrase `Default if unanswered:` set with the `; ` join, the dropped "yes" half, `Recommended: none — {why}`, both `Stop` wordings, the reply line, the "one by one" line and route, the `**Action needed — {title}:**` line, the no-status-file wait wording, and the debug Loop Question and build verify-gap examples. The section has no `Options:` line and no `No recommendation` line. `.bkit/core/.bkit/workflows.md` § Question layout keeps the attempt line, option names and `optionAnswer` sentence and points to § Human questions. The test file has `OPTION_LINE`, `none — ` in `RECOMMENDED_LETTER`, per-line blocks in `scanCounts` and `optionViolations`, and the seven planned tests.
- TASK 3 wording: the UPDATE says `layoutBullet` reads § Human questions, but the planned test `the Question layout bullet points to § Human questions` needs `layoutBullet` to keep reading the `.bkit/core/.bkit/workflows.md` bullet. The code keeps `layoutBullet` on that bullet and moves `the canonical layout letters every option and recommendation` to `humanQuestions()`, which satisfies both. No gap.
- TASK 4: `.bkit/instructions.md` has `workflow-question-reply-line` (the `workflow-yes-takes-all` entry removed, its text retired), `workflow-stop-writes-handover` reworded with both old texts retired, and `workflow-question-plain` reworded with carriers `workflow all except bkit-auto`. No retired text is a prefix of its new text. The widened sentence appears exactly once in each of `bkit-design.md`, `bkit-plan.md`, `bkit-build.md`, `bkit-debug.md` and `bkit-ship.md`. The debug and ship reply lines and the build step 4 line carry the clause sentences. The five `*.none.txt` snapshots change only those lines, so the `No tracker connected` counts did not change.
- TASK 4 § Local Instructions: only the debug Loop Question entry changed. The build, ship and plan lines are built only from clause sentences and have no local entry, and `pnpm tsx .bkit/core/engine/tools/instructions.ts` (no flag) exits 0 with no report, so no hand edit is outstanding.
- BLOCKED `pnpm vitest run .bkit/core/engine/tools/` (code log): the lock was free during this verify, so I ran the five test files in that folder by name (`cli-doc`, `grammar-density`, `instructions-coverage`, `instructions-sources`, `instructions`). All 5 files passed, 172 tests. Nothing in either task's DONE WHEN is left unproven.
- Also run here: `.bkit/core/engine/render/trackers.test.ts` plus all 29 test files in `.bkit/core/engine/audits/workflows/`, 30 files passed, 1094 tests passed and 2 skipped. The skips are in `workflow-lock-snippet.integration.test.ts`, `workflow-archive-snippet.integration.test.ts` and `workflow-fence-syntax.test.ts`, none touched by this group. `pnpm prettier --check` on the five workflows, `authoring.md`, `workflows.md` and `instructions.md` passed. The no-flag `instructions.ts` run reporting nothing shows a second `instructions:sync` would change nothing. I did not run `--write` because this agent writes no code.
- Test-first audit (`build-tests-green-2-1.md`): `Enforced: true`, 0 gaps, 0 unproven, no `Updated tests` or `Already landed` section. All 10 planned tests went red, then green.
- The planned `the canonical layout letters every option and recommendation` edit is an existing test changed by the code step, not the tests step, and the code log (`build-plan-tasks-2-log.md` line 14) calls it owner-approved. The Task 3 UPDATE plans that exact change, and the test still asserts a lettered option line and `Recommended: A)` in the new canonical place. It is not a loosening.
- Docs: `.agents/docs.md` read. `docs/testing.md` and `docs/observability.md` are present. This group adds no runtime error paths, so there is nothing to check against `docs/observability.md`. The `docs/knowledge.jsonl` entries the plan cites (`wording-retired-prefix-of-new-text-and-loose-list-items` and `instructions-store-clause-text-and-local-entries-need-hand-edits`) are both met.
- Not in this group's scope: § Human questions ends with `Example (bkit-design.md § Step 3 — Grill): the shape for a round of several questions.` and no example block after it. The line was already like that before this group.

## Identified Gaps Log

None
