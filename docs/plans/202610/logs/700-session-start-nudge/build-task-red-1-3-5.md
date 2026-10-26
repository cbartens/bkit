
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/700-session-start-nudge
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts

[test-timeout-budget] load average 17.4 on 10 cores: unit limits 8715ms per test, 17430ms per hook (x1.74)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/700-session-start-nudge

 ❯ .bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts (11 tests | 5 failed) 374ms
   ✓ opencode plugin — the rules-read advisory (4)
     ✓ opencode plugin appends the rules advisory to the first tool result 11ms
     ✓ opencode plugin appends nothing on the second call in the same session 5ms
     ✓ opencode plugin fails open on a malformed hook input 3ms
     ✓ the 1.x driver delivers the same advisory once per session 2ms
   ❯ codex hook — the rules-read advisory (3)
     × codex hook writes the rules advisory as additionalContext once per session 82ms
     × codex hook fails open on an empty payload 63ms
     × an unknown session id still yields the advisory once and never throws 52ms
   ❯ antigravity hook — the rules-read advisory (1)
     × antigravity hook denies the first call once with the advisory and allows the retry 63ms
   ❯ every rendered advisory hook (1)
     × every rendered advisory hook names .agents/rules.md and not AGENTS.md 82ms
   ✓ the shared rules-read advisory (2)
     ✓ the shared advisory names .agents/rules.md and not AGENTS.md 2ms
     ✓ the shell part and the JS part hold the byte-identical advisory string 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts > codex hook — the rules-read advisory > codex hook writes the rules advisory as additionalContext once per session
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts:218:26
    216|     });
    217|     const first = runHook(CODEX_HOOK, payload);
    218|     expect(first.status).toBe(0);
       |                          ^
    219|     expect(JSON.parse(first.stdout).hookSpecificOutput.additionalConte…
    220|       ".agents/rules.md",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

 FAIL  .bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts > codex hook — the rules-read advisory > codex hook fails open on an empty payload
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts:230:27
    228|   it("codex hook fails open on an empty payload", () => {
    229|     const result = runHook(CODEX_HOOK, "");
    230|     expect(result.status).toBe(0);
       |                           ^
    231|     expect(result.stdout).toBe("");
    232|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

 FAIL  .bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts > codex hook — the rules-read advisory > an unknown session id still yields the advisory once and never throws
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts:239:26
    237|     const payload = JSON.stringify({ tool_name: "Bash", cwd: "/w" });
    238|     const first = runHook(CODEX_HOOK, payload);
    239|     expect(first.status).toBe(0);
       |                          ^
    240|     expect(JSON.parse(first.stdout).hookSpecificOutput.additionalConte…
    241|       ".agents/rules.md",

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

 FAIL  .bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts > antigravity hook — the rules-read advisory > antigravity hook denies the first call once with the advisory and allows the retry
AssertionError: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts:258:26
    256|     });
    257|     const first = runHook(ANTIGRAVITY_HOOK, payload);
    258|     expect(first.status).toBe(0);
       |                          ^
    259|     const decision = JSON.parse(first.stdout);
    260|     expect(decision.decision).toBe("deny");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

 FAIL  .bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts > every rendered advisory hook > every rendered advisory hook names .agents/rules.md and not AGENTS.md
AssertionError: /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-rules-X78PV2/bkit-rules.cjs: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts:284:35
    282|       expect(fs.readFileSync(hook, "utf-8"), hook).not.toContain("AGEN…
    283|       const result = runHook(hook, payload);
    284|       expect(result.status, hook).toBe(0);
       |                                   ^
    285|       const doc = JSON.parse(result.stdout);
    286|       const advisory = doc.hookSpecificOutput?.additionalContext ?? do…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯


 Test Files  1 failed (1)
      Tests  5 failed | 6 passed (11)
   Start at  17:34:52
   Duration  716ms (tests 74%, transform 20%, setup 3%, import 2%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-liA9tD/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
