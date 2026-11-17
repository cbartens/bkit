Enforced: true
Verdict: null
Gaps: 1
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/960-build-diffs-count-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/context.test.ts` "featureBase picks the local dev meeting point when the branch was cut from a local dev ahead of origin/dev" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/context.test.ts` "featureBase picks the origin/dev meeting point when local dev equals origin/dev" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/context.test.ts` "featureBase picks the origin/dev meeting point when the branch was cut from origin/dev and local dev diverged" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/context.test.ts` "featureBase combines both meeting points when origin/dev was merged into a branch cut from local dev" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/context.test.ts` "featureBase falls back to the origin/dev meeting point and logs when the combination conflicts" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/context.test.ts` "featureBase uses the origin/dev meeting point when there is no local dev" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/context.test.ts` "context diff without --base leaves out an unpushed local dev commit" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/challenge.test.ts` "challenge gate without --base sizes only the branch's own lines" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/branches.test.ts` "scan-diff without --base ignores a match that only an unpushed local dev commit adds" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/status.test.ts` "cleanBase with no clean round returns the feature base, not origin/dev" | red | passed |

## Gaps

- Task 1 `delete-still-referenced` — DELETE `DIFF_BASE` in `.bkit/core/engine/commands/workflow/context.ts` is still referenced: `.agents/plugins/bkit/skills/bkit-debug/SKILL.md:269`, `.agents/plugins/bkit/skills/bkit-debug/SKILL.md:681`, `.agents/plugins/bkit/skills/bkit-debug/SKILL.md:91`, `.agents/skills/bkit-debug/SKILL.md:269`, `.agents/skills/bkit-debug/SKILL.md:681`, and 346 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
