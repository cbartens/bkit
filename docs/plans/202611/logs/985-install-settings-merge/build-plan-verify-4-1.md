Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: none
Loosened: none
Fingerprint: 2c354cb70d1124d10ba59cef4cf9e98933713bfe21beca4fe697ad4f1c0fa2d8
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

Task 8 code is in place: `RETIRED_SETTINGS_ENTRIES` (`.bkit/core/engine/install/write.ts:364`) holds the ten `mcp__claude_ai_Linear__<tool>` strings; `findRetiredSettingsEntries` skips listed values when detecting edited copies, so they report as `retired`; `writeTier2JsonContained` prunes them through `liveList`; `dist/install/write.js` matches; the `docs/migrations.md` row names each value and its tags (the list-versus-migrations test passes). Both TEST FIRST tests and the five rewritten tests pass (`write.test.ts`, `claude.integration.test.ts`: 133 passed). Test-first audit: Enforced true, 0 gaps, no Taken over / Unproven / Changed by a code step / Updated tests / Already landed sections. The five rewritten earlier-task tests belong to takeover tasks 9-13 (group 5, commit `b59e312ec`), not judged here. Decision record `build-decision-1-1.md` (Task 7, `Decision: Fix now`, assumed by the orchestrator, not the owner's answer) bears on no group 4 gap. One gap open: the plan's Concrete Example still uses `mcp__claude_ai_Linear__get_issue` as the edited example, so Task 8 is not ticked. `docs/testing.md` and `docs/observability.md` present; the change adds no error path.

## Identified Gaps Log

1 gap.

TASK 8: `docs/plans/202611/985-install-settings-merge-plan.md:45` Concrete Example still uses `mcp__claude_ai_Linear__get_issue` as the person's edited example (Setup line 45, step 2 line 50), a string bkit shipped in v0.4.0-v2.2.3 and that `bkit upgrade` now removes, so the example describes the wrong outcome; DONE WHEN requires a string no release shipped there — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 8: plan Concrete Example still uses a retired string as the edited example
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `docs/plans/202611/985-install-settings-merge-plan.md:45` · **Round:** 1
  - **DONE WHEN:** The plan's Concrete Example (Setup line 45 and step 2 line 50) uses as the person's edited example a string no release shipped (for example mcp__claude_ai_Linear__my_own_tool), not mcp__claude_ai_Linear__get_issue, which is now a retired entry that bkit upgrade removes.
  - **TEST FIRST:**
<!-- bkit:task 1 end -->
