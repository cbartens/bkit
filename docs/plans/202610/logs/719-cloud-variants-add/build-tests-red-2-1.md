Enforced: true
Red: 6
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 2, attempt 1

Plan: `docs/plans/202610/719-cloud-variants-add-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 3 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "jira terminal issue stops the Cursor background session" | red | failure: expected +0 to be 1 // Object.is equality |
| 3 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "jira session without node_modules/.bin/bkit stops naming the missing bin" | red | failure: expected +0 to be 1 // Object.is equality |
| 3 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "jira fetch %s stops the session naming the tracker and the reason" | red | failure: auth: expected +0 to be 1 // Object.is equality |
| 3 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "%s session with no issue id records bkit:auto not verified and exits 0" | red | failure: github: expected 1 to be +0 // Object.is equality |
| 3 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "Claude session carrying GITHUB_ISSUE_ID runs the tracker guard" | red | failure: expected +0 to be 1 // Object.is equality |
| 3 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "unset tracker without LINEAR_ISSUE_ID adds advisory context and exits 0" | red | failure: undefined: expected 1 to be +0 // Object.is equality |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts

[test-timeout-budget] load average 2.4 on 10 cores: unit limits 5700ms per test, 11400ms per hook (x1.14)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts (24 tests | 6 failed) 3018ms
   ✓ BAR-186 — Claude SessionStart preflight.sh runtime behaviour (4)
     ✓ emits the rules advisory on a Claude IDE session 18ms
     ✓ a cloud session prints one JSON document carrying the advisory and the Linear guard result 74ms
     ✓ missing BKIT_LINEAR_API_KEY hard-stops when LINEAR_ISSUE_ID is present (regression guard) 35ms
     ✓ a context carrying a control character still yields one parseable JSON document 40ms
   ✓ Claude SessionStart preflight.sh — Jira session without an issue (2)
     ✓ a Jira session (token set, no LINEAR_ISSUE_ID) emits the advisory and exits 0 9ms
     ✓ neither generated hook reads the Jira token or calls Atlassian 0ms
   ✓ Cursor sessionStart preflight.sh runtime behaviour (3)
     ✓ a Cursor session emits the advisory without python3 and exits 0 10ms
     ✓ a background agent without BKIT_LINEAR_API_KEY hard-stops in Cursor's shape 68ms
     ✓ a background agent with a key but no LINEAR_ISSUE_ID hard-stops 65ms
   ✓ preflight.sh — the rules-read advisory (1)
     ✓ names .agents/rules.md and never AGENTS.md 20ms
   ✓ preflight.sh — generated from one tracker guard (1)
     ✓ both generated hooks carry the shared guard verbatim and never call bkit 0ms
   ✓ BAR-186 — SessionStart preflight.sh source-level checks (1)
     ✓ brew-bin loop is wrapped in a Darwin OS gate 0ms
   ✓ preflight-tracker.sh — GitHub tracker (4)
     ✓ github issue without bkit:auto stops the Cursor background session 525ms
     ✓ github closed issue stops the session and an open labelled one passes 878ms
     ✓ github read failure stops the session naming the tracker and the reason 432ms
     ✓ github read failure stops the session naming the tracker and the reason 69ms
   ✓ preflight-tracker.sh — Linear tracker by state category (1)
     ✓ linear completed state renamed Shipped stops the session 468ms
   ❯ preflight-tracker.sh — Jira and session issue sources (6)
     × jira terminal issue stops the Cursor background session 62ms
     × jira session without node_modules/.bin/bkit stops naming the missing bin 49ms
     × jira fetch %s stops the session naming the tracker and the reason 50ms
     × %s session with no issue id records bkit:auto not verified and exits 0 50ms
     × Claude session carrying GITHUB_ISSUE_ID runs the tracker guard 21ms
     × unset tracker without LINEAR_ISSUE_ID adds advisory context and exits 0 50ms
   ✓ preflight-tracker.sh — one shared part (1)
     ✓ generated Claude and Cursor hooks carry the one preflight-tracker.sh part 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts > preflight-tracker.sh — Jira and session issue sources > jira terminal issue stops the Cursor background session
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:391:28
    389|       cwd: terminal.cwd,
    390|     });
    391|     expect(stopped.status).toBe(1);
       |                            ^
    392|     const context = onlyDocument(stopped.stdout);
    393|     expect(context).toContain("HARD STOP");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/6]⎯

 FAIL  .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts > preflight-tracker.sh — Jira and session issue sources > jira session without node_modules/.bin/bkit stops naming the missing bin
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:420:27
    418|       cwd: fixtureRepo("jira", "feat/ab2-12-thing"),
    419|     });
    420|     expect(result.status).toBe(1);
       |                           ^
    421|     const context = onlyDocument(result.stdout);
    422|     expect(context).toContain("HARD STOP");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/6]⎯

 FAIL  .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts > preflight-tracker.sh — Jira and session issue sources > jira fetch %s stops the session naming the tracker and the reason
AssertionError: auth: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:438:37
    436|         timeout: 25_000,
    437|       });
    438|       expect(result.status, reason).toBe(1);
       |                                     ^
    439|       const context = onlyDocument(result.stdout);
    440|       expect(context, reason).toContain("HARD STOP");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/6]⎯

 FAIL  .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts > preflight-tracker.sh — Jira and session issue sources > %s session with no issue id records bkit:auto not verified and exits 0
AssertionError: github: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:452:38
    450|         cwd: fixtureRepo(tracker, "work/session"),
    451|       });
    452|       expect(result.status, tracker).toBe(0);
       |                                      ^
    453|       const context = onlyDocument(result.stdout);
    454|       expect(context, tracker).toContain(

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/6]⎯

 FAIL  .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts > preflight-tracker.sh — Jira and session issue sources > Claude session carrying GITHUB_ISSUE_ID runs the tracker guard
AssertionError: expected +0 to be 1 // Object.is equality

- Expected
+ Received

- 1
+ 0

 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:473:27
    471|       },
    472|     );
    473|     expect(result.status).toBe(1);
       |                           ^
    474|     const context = onlyDocument(result.stdout);
    475|     expect(context).toContain("HARD STOP");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/6]⎯

 FAIL  .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts > preflight-tracker.sh — Jira and session issue sources > unset tracker without LINEAR_ISSUE_ID adds advisory context and exits 0
AssertionError: undefined: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:485:46
    483|         cwd: fixtureRepo(tracker),
    484|       });
    485|       expect(result.status, String(tracker)).toBe(0);
       |                                              ^
    486|       const context = onlyDocument(result.stdout);
    487|       expect(context).toContain(".agents/rules.md");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/6]⎯


 Test Files  1 failed (1)
      Tests  6 failed | 18 passed (24)
   Start at  17:29:17
   Duration  3.12s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-rTRMDA/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
