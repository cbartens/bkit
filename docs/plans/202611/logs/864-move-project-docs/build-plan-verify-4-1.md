Verdict: PASS
Failures: 0
Fixable: false
Tasks: 10, 11, 12, 13, 14
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 4

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Judged against `build-diff-4-1.md` (commits `841399c87` tests, `27a353462` code) and the codebase at `27a353462`. The test-first audit `build-tests-green-4-1.md` has `Enforced: true`, `Gaps: 0`, `Unproven: 0`, and all 10 planned tests went red, then green. It has no `Updated tests`, `Already landed` or `delete-still-referenced` entries.
- TASK 10: `isRawInput` now also excludes `related-(issues|failures|deferrals).md`, and `stripUntrusted` drops text between `===== BEGIN UNTRUSTED =====` and `===== END UNTRUSTED =====` before the `## Documentation Warnings` section is parsed. An unclosed fence is stripped to the end of the file. The marker text matches `FENCE_OPEN` in `.bkit/core/engine/commands/workflow/context.ts:90`. `*-input-*` is still excluded.
- TASK 11: `legacyStarterTopic` matches against the new `LEGACY_STARTER_DIGEST_HISTORY`. `LEGACY_STARTER_DIGESTS` is unchanged and is now only a test oracle for revision `45f4254bd`. I treated this as meeting the DONE WHEN, because the digest set it describes exists and is the one used for matching. I checked it independently: every release tag that shipped `.bkit/shared/docs/` (v5.0.0 to v6.1.1, 17 tags), all ten topics, rendered with the v5 PolyForm notice and with the 6.x notice, and with default branches `main`, `dev`, `develop`, `master` and `release/1.x`, comes back as the right topic: 1700 of 1700. The script is `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/cb321a06-73f5-4f6a-b91c-b8900cbd6d4b/scratchpad/v4/check-digests.mts`.
- TASK 12: `MANAGED_NOTICE_RE` and `LEGACY_NOTICE_RE` both accept an optional middle clause (`— … —`) and `do not` / `do NOT`. This covers the v5.0.0 PolyForm form, the v4.12.0 `do NOT edit` form recorded in `3446554a5`, and the 6.x form.
- TASK 13: `inspectRepoFile`, the `readProjectIndex` read, the doc read and write in `syncProjectDocs`, and the index write now catch filesystem errors. They record the path under `unsafe` or `indexProblem` with the error code, and `logReport` warns about each one. `detectProjectDocs` sends unsafe states to `project-docs-ambiguous`, and its file reads go through `readTextFile`, which does not throw. `upgrade.ts:1024` and `install.ts:519` call `syncProjectDocs` with no exception path left for optional-document errors.
- TASK 14: Decision `build-decision-1-5.md` (`Decision: Fix now — Yes, both halves`) asks for both fixes, and both are in. (1) Sync skips a default doc only when the indexed equivalent row is in the tree and points at a regular file; otherwise it registers the default doc. `logReport` prints the `equivalent` entries it skipped. (2) The detector reports a default doc that sits beside a usable equivalent with a hand-edit action that does not mention `bkit upgrade`. The detector and sync use the same usability check, so no advisory promises an action the CLI will not perform. The row in `docs/observability.md` § `project-docs-unindexed` was updated to match.
- One existing test was changed: `.bkit/core/engine/install/project-docs.test.ts` `adds no row when an indexed equivalent covers the topic`. The change only adds setup (the equivalent file now exists, which the new usability rule needs); its expectations are unchanged. This is Task 14 fixing a test it broke, not a loosened test.
- Gates: `pnpm typecheck` exits 0. The four group test files pass (132 tests). `vitest related --run` on the four changed source files passes 117 of 117 files (5865 passed, 2 skipped, none of the skips in group 4 files).
- Earlier decision records `build-decision-1-1.md` to `build-decision-1-4.md` cover groups 1 and 2 and do not apply to this group.

## Identified Gaps Log

None

