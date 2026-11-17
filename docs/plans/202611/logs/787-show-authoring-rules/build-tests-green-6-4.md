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
| 21 | `.bkit/core/engine/install/write.test.ts` "keeps a consumer hook placed inside a bkit hook group" | red | passed |
| 21 | `.bkit/core/engine/install/modules/core.integration.test.ts` "upgrades a shipped Claude edit group without dropping a consumer hook inside it" | red | passed |
| 22 | `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` "keeps a shell target eligible after an unverified Cursor edit reminder" | no row | not passed |
| 23 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "keeps commands after a heredoc substitution that holds an apostrophe" | red | passed |
| 24 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "flags a script an earlier copy or move produced" | red | passed |
| 25 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "marks scripts run by unanalysed interpreters as uncertain" | red | passed |

## Gaps

- Task 22 `not-green` — the named test "keeps a shell target eligible after an unverified Cursor edit reminder" did not run; the report holds "cursor gateguard — advisory delivery > emits permission allow with additional_context (never blocks by default)", "cursor gateguard — advisory delivery > dedups per (session, file) — second touch is a bare allow", "cursor gateguard — advisory delivery > emits exactly one JSON document", "cursor gateguard — relative path resolution (spike fix) > an EXISTING file gets the investigation checklist, not the new-file nudge", "cursor gateguard — relative path resolution (spike fix) > a genuinely absent file gets the new-file nudge", … — Fixable: true — log: TASK 22: `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` `keeps a shell target eligible after an unverified Cursor edit reminder` — not-green — Fixable: true

## Unproven

- Task 22 `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` "keeps a shell target eligible after an unverified Cursor edit reminder" — no tests step recorded a red for it (`bkit tests red --group=6`); the owner answers it at the end of the build

## Runner output — `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts

[test-timeout-budget] load average 7.2 on 10 cores: unit limits 8101ms per test, 16201ms per hook (x1.62)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules

 ✓ .bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts (15 tests) 337ms

 Test Files  1 passed (1)
      Tests  15 passed (15)
   Start at  09:54:53
   Duration  438ms (tests 87%, import 7%, setup 5%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-PMAbUg/junit.xml
```
