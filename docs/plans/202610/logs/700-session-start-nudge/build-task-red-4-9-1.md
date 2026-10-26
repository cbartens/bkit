
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/700-session-start-nudge
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/700-session-start-nudge

 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts (12 tests | 1 failed) 220ms
   ❯ BAR-186 — Claude SessionStart preflight.sh runtime behaviour (4)
     ✓ emits the rules advisory on a Claude IDE session 20ms
     ✓ a cloud session prints one JSON document carrying the advisory and the Linear guard result 19ms
     ✓ missing BKIT_LINEAR_API_KEY hard-stops when LINEAR_ISSUE_ID is present (regression guard) 19ms
     × a context carrying a control character still yields one parseable JSON document 23ms
   ✓ Claude SessionStart preflight.sh — no Jira guard (2)
     ✓ a Jira session (token set, no LINEAR_ISSUE_ID) emits the advisory and exits 0 16ms
     ✓ neither generated hook reads the Jira token or calls Atlassian 1ms
   ✓ Cursor sessionStart preflight.sh runtime behaviour (3)
     ✓ a Cursor session emits the advisory without python3 and exits 0 23ms
     ✓ a background agent without BKIT_LINEAR_API_KEY hard-stops in Cursor's shape 34ms
     ✓ a background agent with a key but no LINEAR_ISSUE_ID hard-stops 27ms
   ✓ preflight.sh — the rules-read advisory (1)
     ✓ names .agents/rules.md and never AGENTS.md 37ms
   ✓ preflight.sh — generated from one Linear guard (1)
     ✓ both generated hooks carry the shared guard verbatim and never call bkit 1ms
   ✓ BAR-186 — SessionStart preflight.sh source-level checks (1)
     ✓ brew-bin loop is wrapped in a Darwin OS gate 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts > BAR-186 — Claude SessionStart preflight.sh runtime behaviour > a context carrying a control character still yields one parseable JSON document
SyntaxError: Bad control character in string literal in JSON at position 244 (line 1 column 245)
 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:110:22
    108|     const result = runPreflight(CLAUDE_HOOK, { LINEAR_ISSUE_ID: "BAR-1…
    109|     expect(result.status).toBe(1);
    110|     const doc = JSON.parse(result.stdout);
       |                      ^
    111|     expect(doc.hookSpecificOutput.additionalContext).toContain("HARD S…
    112|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 11 passed (12)
   Start at  06:24:11
   Duration  382ms (tests 76%, transform 18%, setup 3%, import 2%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-m0KRgf/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
