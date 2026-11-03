
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/700-session-start-nudge
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/700-session-start-nudge

 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts (11 tests | 5 failed) 260ms
   ❯ BAR-186 — Claude SessionStart preflight.sh runtime behaviour (3)
     × emits the rules advisory on a Claude IDE session 20ms
     × a cloud session prints one JSON document carrying the advisory and the Linear guard result 49ms
     ✓ missing BKIT_LINEAR_API_KEY hard-stops when LINEAR_ISSUE_ID is present (regression guard) 41ms
   ❯ Claude SessionStart preflight.sh — no Jira guard (2)
     × a Jira session (token set, no LINEAR_ISSUE_ID) emits the advisory and exits 0 15ms
     ✓ neither generated hook reads the Jira token or calls Atlassian 1ms
   ❯ Cursor sessionStart preflight.sh runtime behaviour (3)
     × a Cursor session emits the advisory without python3 and exits 0 15ms
     ✓ a background agent without BKIT_LINEAR_API_KEY hard-stops in Cursor's shape 46ms
     ✓ a background agent with a key but no LINEAR_ISSUE_ID hard-stops 54ms
   ❯ preflight.sh — the rules-read advisory (1)
     × names .agents/rules.md and never AGENTS.md 15ms
   ✓ preflight.sh — generated from one Linear guard (1)
     ✓ both generated hooks carry the shared guard verbatim and never call bkit 1ms
   ✓ BAR-186 — SessionStart preflight.sh source-level checks (1)
     ✓ brew-bin loop is wrapped in a Darwin OS gate 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts > BAR-186 — Claude SessionStart preflight.sh runtime behaviour > emits the rules advisory on a Claude IDE session
SyntaxError: Unexpected end of JSON input
 ❯ emittedContext .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:74:20
     72| /** The context string a rendered hook writes, in that host's own stdo…
     73| function emittedContext(stdout: string): string {
     74|   const doc = JSON.parse(stdout);
       |                    ^
     75|   return doc.hookSpecificOutput?.additionalContext ?? doc.additional_c…
     76| }
 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:82:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

 FAIL  .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts > BAR-186 — Claude SessionStart preflight.sh runtime behaviour > a cloud session prints one JSON document carrying the advisory and the Linear guard result
AssertionError: expected 'Guard pre-check: FAIL — BKIT_LINEAR_A…' to contain '.agents/rules.md'

Expected: ".agents/rules.md"
Received: "Guard pre-check: FAIL — BKIT_LINEAR_API_KEY missing for BAR-186-test. HARD STOP: refuse any Linear-related work, report the failure to the user, and stop."

 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:90:21
     88|     expect(result.stdout.trim().split("\n")).toHaveLength(1);
     89|     const context = emittedContext(result.stdout);
     90|     expect(context).toContain(".agents/rules.md");
       |                     ^
     91|     expect(context).toContain("HARD STOP");
     92|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

 FAIL  .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts > Claude SessionStart preflight.sh — no Jira guard > a Jira session (token set, no LINEAR_ISSUE_ID) emits the advisory and exits 0
SyntaxError: Unexpected end of JSON input
 ❯ emittedContext .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:74:20
     72| /** The context string a rendered hook writes, in that host's own stdo…
     73| function emittedContext(stdout: string): string {
     74|   const doc = JSON.parse(stdout);
       |                    ^
     75|   return doc.hookSpecificOutput?.additionalContext ?? doc.additional_c…
     76| }
 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:109:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

 FAIL  .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts > Cursor sessionStart preflight.sh runtime behaviour > a Cursor session emits the advisory without python3 and exits 0
SyntaxError: Unexpected end of JSON input
 ❯ emittedContext .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:74:20
     72| /** The context string a rendered hook writes, in that host's own stdo…
     73| function emittedContext(stdout: string): string {
     74|   const doc = JSON.parse(stdout);
       |                    ^
     75|   return doc.hookSpecificOutput?.additionalContext ?? doc.additional_c…
     76| }
 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:128:12

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

 FAIL  .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts > preflight.sh — the rules-read advisory > names .agents/rules.md and never AGENTS.md
SyntaxError: Unexpected end of JSON input
 ❯ emittedContext .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:74:20
     72| /** The context string a rendered hook writes, in that host's own stdo…
     73| function emittedContext(stdout: string): string {
     74|   const doc = JSON.parse(stdout);
       |                    ^
     75|   return doc.hookSpecificOutput?.additionalContext ?? doc.additional_c…
     76| }
 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:158:23

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯


 Test Files  1 failed (1)
      Tests  5 failed | 6 passed (11)
   Start at  17:27:16
   Duration  379ms (tests 84%, transform 13%, setup 2%, import 1%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-poM4aY/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
