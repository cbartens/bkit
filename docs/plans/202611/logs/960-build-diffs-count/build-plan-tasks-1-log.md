Verdict: HANDOVER

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 1: Add featureBase and remove DIFF_BASE — featureBase in context.ts, six featureBase tests green; tasks.ts keeps its own origin/dev default (.bkit/core/engine/commands/workflow/context.ts)
DONE — TASK 2: Default the diff readers to featureBase — context diff, challenge gate, scan-diff default to featureBase via defaultRange; three new tests green (context.ts, challenge.ts, branches.ts)
DONE — TASK 3: Use featureBase as the holistic test base fallback — cleanBase falls back to featureBase; new test green (status.ts)
BLOCKED — TASK 2: two existing context.test.ts tests ("writes origin/dev...HEAD without docs/plans/**", "diff from a group start covers only the group's commits") run on branch dev, where local dev now counts as the feature base; need `g(dir, "checkout", "-q", "-b", "feat/1-x")` after `repo(...)`, but the Edit tool was denied by the permission classifier for those two (the same edit on the other two tests and on challenge.test.ts went through)
