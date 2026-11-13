Enforced: true
Verdict: CONCERNS
Gaps: 2
Unproven: 4

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/787-show-authoring-rules-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "retains lexical context for nested shell edits" | red | passed |
| 1 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "recognizes direct edit command families" | red | passed |
| 1 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "normalizes literal working directories without guessing" | red | passed |
| 1 | `.bkit/core/engine/install/modules/index.integration.test.ts` "keeps existing shell consumers working with structured evidence" | red | passed |
| 2 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "extracts all literal patch effects" | red | passed |
| 2 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "classifies inline and named script effects" | red | passed |
| 2 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "requires a positive whole-program reader grammar" | red | passed |
| 2 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "retains exact targets beside uncertain script effects" | red | passed |
| 3 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "bounds direct source inspection without executing it" | red | passed |
| 3 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "stops analysis at each internal bound" | vacuous | passed |
| 3 | `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts` "preserves stronger shell decisions and compound advice" | red | passed |
| 4 | `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` "prepares complete advice without acknowledging it" | red | passed |
| 4 | `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` "shares normalized warning identity across edit channels" | red | passed |
| 5 | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` "acknowledges only complete selected blocks on verified routes" | red | passed |
| 5 | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` "reserves notices inside conservative host budgets" | red | passed |
| 5 | `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` "preserves off deny and state-fallback semantics" | red | passed |
| 6 | `.bkit/core/engine/audits/hooks/gateguard-claude.integration.test.ts` "routes Claude notebook and shell targets through shared advice" | red | passed |
| 7 | `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` "routes Cursor delete and shell targets without replacing its driver" | passed-accepted | passed |
| 8 | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` "routes Codex complete patches and initial shell commands" | red | passed |
| 9 | `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts` "routes Antigravity multi-replace and shell targets" | red | passed |
| 9 | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` "preserves OpenCode edit coverage and after-execute boundary" | red | passed |
| 9 | `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts` "leaves Antigravity targets eligible when retry transport cannot deliver" | red | passed |
| 10 | `.bkit/core/engine/install/modules/core.test.ts` "keeps shipped authoring pointers in their editor context" | red | passed |
| 11 | `.bkit/core/engine/install/modules/core.integration.test.ts` "installs and upgrades shared hook behavior without replacing owned drivers" | passed-accepted | passed |
| 12 | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` "keeps rendered classification advice and acknowledgement equivalent" | passed-accepted | passed |
| 12 | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` "bounds rendered cold-start time and complete response size" | red | passed |
| 13 | `.bkit/core/engine/install/write.test.ts` "merges managed lists while keeping consumer-added entries" | red | passed |
| 13 | `.bkit/core/engine/install/modules/core.integration.test.ts` "upgrades shipped registrations without dropping consumer hook groups or permissions" | vacuous | passed |
| 14 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "flags a script the same command writes before running it" | red | passed |
| 15 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "marks shell scripts run by name or on stdin" | red | passed |
| 16 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "follows wrapper options and find -exec to the edit they run" | red | passed |
| 17 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "treats stdout-carrying fd redirects as edits" | red | passed |
| 18 | `.bkit/core/engine/install/write.test.ts` "drops an entry the previous template shipped and the current one retired" | no row | not passed |
| 19 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "never echoes inspected source text as hook instructions" | red | passed |
| 20 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "parses hostile patch lines in linear time" | red | passed |
| 21 | `.bkit/core/engine/install/write.test.ts` "keeps a consumer hook placed inside a bkit hook group" | red | passed |
| 21 | `.bkit/core/engine/install/modules/core.integration.test.ts` "upgrades a shipped Claude edit group without dropping a consumer hook inside it" | red | passed |
| 22 | `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` "keeps a shell target eligible after an unverified Cursor edit reminder" | no row | not passed |
| 23 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "keeps commands after a heredoc substitution that holds an apostrophe" | red | passed |
| 24 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "flags a script an earlier copy or move produced" | red | passed |
| 25 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "marks scripts run by unanalysed interpreters as uncertain" | red | passed |
| 28 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "flags a script copied into a new directory or by a glob" | red | passed |
| 29 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "cursor: mirror matches its template" | red | passed |
| 29 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "claude: mirror matches its template" | red | passed |
| 29 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "codex: mirror matches its template" | red | passed |
| 29 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "agents: mirror matches its template" | red | passed |
| 26 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "keeps edit advice beside an off-list fetch" | red | passed |
| 27 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "analyses dense script sources in linear time" | red | passed |

## Gaps

- Task 18 `not-green` — the named test "drops an entry the previous template shipped and the current one retired" did not run; the report holds "writeTier1 > writes file when dest missing", "writeTier1 > rewrites file when dest exists with different content (idempotent rewrite)", "writeTier1 > no-op when dest matches src (idempotent — no double-count)", "writeTier1 > substitutes tokens in dest content", "writeTier1 > dry-run does not write to disk but records write in WriteSet", … — Fixable: true — log: TASK 18: `.bkit/core/engine/install/write.test.ts` `drops an entry the previous template shipped and the current one retired` — not-green — Fixable: true
- Task 22 `not-green` — the named test "keeps a shell target eligible after an unverified Cursor edit reminder" did not run; the report holds "cursor gateguard — advisory delivery > emits permission allow with additional_context (never blocks by default)", "cursor gateguard — advisory delivery > dedups per (session, file) — second touch is a bare allow", "cursor gateguard — advisory delivery > emits exactly one JSON document", "cursor gateguard — relative path resolution (spike fix) > an EXISTING file gets the investigation checklist, not the new-file nudge", "cursor gateguard — relative path resolution (spike fix) > a genuinely absent file gets the new-file nudge", … — Fixable: true — log: TASK 22: `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` `keeps a shell target eligible after an unverified Cursor edit reminder` — not-green — Fixable: true

## Already landed

- Task 7 `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` "routes Cursor delete and shell targets without replacing its driver" — passed at the group's red, and the tests step accepted it: original plan name restored; the body is the owner-approved corrected one (contradictory single-line emit assertion dropped, all other assertions kept); the code already exists and satisfies it (driver has only the ternary form), so it passes now; no red is due
- Task 11 `.bkit/core/engine/install/modules/core.integration.test.ts` "installs and upgrades shared hook behavior without replacing owned drivers" — passed at the group's red, and the tests step accepted it: fresh install and upgrade already keep the managed shell advice, customised driver bytes and custom Claude registration group (Tier-2 writeTier2 in the host modules); no red is due
- Task 12 `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` "keeps rendered classification advice and acknowledgement equivalent" — passed at the group's red, and the tests step accepted it: all four shell adapters already give the same shared reminder, acknowledgement and unknown-target warning; OpenCode has no shell hook (stated exception); no red is due

## Unproven

- Task 3 `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` "stops analysis at each internal bound" — the tests step left it as `vacuous`, not red; the owner answers it at the end of the build
- Task 13 `.bkit/core/engine/install/modules/core.integration.test.ts` "upgrades shipped registrations without dropping consumer hook groups or permissions" — the tests step left it as `vacuous`, not red; the owner answers it at the end of the build
- Task 18 `.bkit/core/engine/install/write.test.ts` "drops an entry the previous template shipped and the current one retired" — no tests step recorded a red for it (`bkit tests red --group=4`); the owner answers it at the end of the build
- Task 22 `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` "keeps a shell target eligible after an unverified Cursor edit reminder" — no tests step recorded a red for it (`bkit tests red --group=6`); the owner answers it at the end of the build

## Runner output — `.bkit/core/engine/install/write.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/install/write.test.ts

[test-timeout-budget] load average 4.7 on 10 cores: unit limits 6851ms per test, 13701ms per hook (x1.37)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules

stderr | .bkit/core/engine/install/write.test.ts > writeTier2 — html-comment markers > does NOT append when dest has duplicate/unparseable markers (avoids compounding corruption)
[bkit] Managed block markers present but unparseable in /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-tiers-test-s2Mpch/architecture.md — skipping (expected exactly one start/end)

 ✓ .bkit/core/engine/install/write.test.ts (80 tests) 43ms

 Test Files  1 passed (1)
      Tests  80 passed (80)
   Start at  07:56:48
   Duration  137ms (tests 52%, setup 22%, transform 13%, import 12%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-b7qNj2/junit.xml
```

## Runner output — `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts

[test-timeout-budget] load average 5.0 on 10 cores: unit limits 7000ms per test, 14000ms per hook (x1.40)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/787-show-authoring-rules

 ✓ .bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts (15 tests) 380ms

 Test Files  1 passed (1)
      Tests  15 passed (15)
   Start at  07:56:42
   Duration  471ms (tests 92%, setup 5%, import 1%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-jj357u/junit.xml
```
