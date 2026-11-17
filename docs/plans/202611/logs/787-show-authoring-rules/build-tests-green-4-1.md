Enforced: true
Verdict: CONCERNS
Gaps: 1
Unproven: 1

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/787-show-authoring-rules-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 14 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "flags a script the same command writes before running it" | red | passed |
| 15 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "marks shell scripts run by name or on stdin" | red | passed |
| 16 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "follows wrapper options and find -exec to the edit they run" | red | passed |
| 17 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "treats stdout-carrying fd redirects as edits" | red | passed |
| 18 | `.bkit/core/engine/install/write.test.ts` "drops an entry the previous template shipped and the current one retired" | no row | not passed |

## Gaps

- Task 18 `not-green` — the named test "drops an entry the previous template shipped and the current one retired" did not run; the report holds "writeTier1 > writes file when dest missing", "writeTier1 > rewrites file when dest exists with different content (idempotent rewrite)", "writeTier1 > no-op when dest matches src (idempotent — no double-count)", "writeTier1 > substitutes tokens in dest content", "writeTier1 > dry-run does not write to disk but records write in WriteSet", … — Fixable: true — log: TASK 18: `.bkit/core/engine/install/write.test.ts` `drops an entry the previous template shipped and the current one retired` — not-green — Fixable: true

## Unproven

- Task 18 `.bkit/core/engine/install/write.test.ts` "drops an entry the previous template shipped and the current one retired" — no tests step recorded a red for it (`bkit tests red --group=4`); the owner answers it at the end of the build

## Runner output — `.bkit/core/engine/install/write.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/install/write.test.ts

[test-timeout-budget] load average 26.6 on 10 cores: unit limits 17800ms per test, 35600ms per hook (x3.56)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules

stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-TBDqTC/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/install/write.test.ts (79 tests) 479ms

 Test Files  1 passed (1)
      Tests  79 passed (79)
   Start at  13:22:11
   Duration  1.81s (tests 48%, setup 22%, transform 18%, import 11%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-OjOB2P/junit.xml
```
