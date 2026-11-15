Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 4, 5
Loosened: none
Fingerprint: c38346b7e41e340398f20b94b0935c1c3bb09e6fd022e3a17529bdd0fa1f93d4
<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

Group 1 (Tasks 1-5) was judged against `build-diff-1-1.md`. Briefs `build-brief-1-1.md` and `build-brief-1-2.md` are identical and have no `Deviations` section. No decision record or earlier verify or remediate log exists for group 1.

- Task 1: `build.holistic` is in `ASK_POINTS` and `CONFIG_DEFAULTS` (`{ ask: true, max: 2 }`) in `.bkit/core/engine/shared/settings.ts`. `workflows.test.ts` frozen limits, the `core.integration.test.ts` seeded build block, the migrate-layout expectation and the counters `DEFAULT_MAX` all name it. The route test shows exit 1 with `value: 3` on the third fix round, with a clean check between rounds, and `value: 1` in a new run. `package.json` is not in the diff. `dist/shared/settings.js` carries the point.
- Task 2: `cleanBase` in `status.ts` uses `lastCleanRound` and `git merge-base --is-ancestor`, falling back to `origin/dev`. The five `status.test.ts` cases pass. `dist/commands/workflow/status.js` is refreshed.
- Task 3: the prompt, `LOOPS.holistic.point`, the sub-step 6 route, the grant, the dropped `PAUSE_MAX` disjunct, `PAUSE_POINT` = `build.holistic` and the resume mapping are all done. Line 85 has no `--since-clean`, and counter-prose audit section 2 passes. One gap remains: the Limits paragraph (line 85) does not name `build.holistic`, so Task 3 is left off `Tasks`.
- Task 4: every holistic report and fix-log path in `.bkit/core/workflows/bkit-build.md` carries `{RUN}`. `counters derive` and `--attempt-of` take no `--all-runs`.
- Task 5: `SINCE_CLEAN_FLAG` and `sinceCleanStep` are gone. The only `sinceClean` left is in `loopProgress` and the `progress` verb. `.bkit/core/.bkit/cli.md` lists `--since-clean` only on `progress`, and `cli-doc.test.ts` passes (7/7). `challenge.ts:671` calls `grantCount` with five arguments, which matches the new signature.
- Tests run: settings, counters, core.integration, status, local-gate-audit, counter-prose-audit, decisions and workflows test files: 8 files passed, 681 tests passed, 2 skipped, no skips added by the diff. `cli-doc.test.ts` passed. `node dist/cli.js check` reported no mirror drift (advisories only).
- Test-first audit (`build-tests-green-1-1.md`, `Enforced: true`): all 15 tests went red then green. Its two Task 5 `delete-still-referenced` gaps point at `docs/decisions.jsonl:849`, the decision row `951-retire-counters-since-clean`. That row records the deletion. It is not a code reference, so it is a different thing with the same name and no gap.
- `Unproven`: 0. No `Updated tests` section and no `Already landed` section.
- Out of scope for this group: `.bkit/core/.bkit/workflows.md` lines 974 and 1001 still describe `--since-clean` and the old holistic file names. Plan Task 12 (group 3) owns that update, so it is not a group 1 gap.
- Docs: `.agents/docs.md` was read. `docs/testing.md` and `docs/observability.md` exist. The diff adds no error-logging paths.

## Identified Gaps Log

1 gap.

TASK 3: `.bkit/core/workflows/bkit-build.md:85` — the Limits paragraph still lists only `bkit.workflows.build.verify` / `.challenge` / `.tests` and does not name `build.holistic` (the run-wide holistic fix-round allowance), which the task UPDATE field requires; the Step 10 intro was updated, the Limits paragraph was not. Fix: name `.holistic` in the Limits paragraph and say it counts holistic fix rounds within the run, then regenerate mirrors (`pnpm bkit:generate`) — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 3: Limits paragraph does not name build.holistic
  **Severity:** MEDIUM · **Class:** missing-update · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:85` · **Round:** 1
  - **DONE WHEN:** The Limits paragraph in .bkit/core/workflows/bkit-build.md names build.holistic (holistic fix rounds counted within the run) and the host mirrors are regenerated with no bkit check drift
  - **TEST FIRST:**
<!-- bkit:task 1 end -->
