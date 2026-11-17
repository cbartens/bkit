Enforced: true
Verdict: null
Gaps: 1
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/892-template-copies-bkit-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/install/template-copies.integration.test.ts` "leaves a staged template copy unchanged under plain lint-staged" | red | passed |
| 1 | `.bkit/core/engine/install/template-copies.integration.test.ts` "ships the sample configs under non-discoverable names" | red | passed |
| 1 | `.bkit/core/engine/commands/install/upgrade.integration.test.ts` "upgrade replaces the old sample config names" | red | passed |

## Gaps

- Task 1 `delete-still-referenced` — DELETE `.bkit/templates/.lintstagedrc.json` is still referenced as `.lintstagedrc`: `.agents/plugins/bkit/hooks/bkit-gateguard.cjs:78`, `.agents/skills/vitest/references/features-filtering.md:75`, `.bkit/core/.bkit/templates.md:166`, `.bkit/core/.bkit/templates.md:341`, `.bkit/core/.bkit/templates.md:343`, and 683 more — Fixable: null — log: TASK 1: delete-still-referenced — Fixable: null
