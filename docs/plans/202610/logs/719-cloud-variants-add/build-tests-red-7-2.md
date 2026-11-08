Enforced: true
Red: 1
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 7, attempt 2

Plan: `docs/plans/202610/719-cloud-variants-add-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 14 | `.bkit/core/engine/checks/after/auth.test.ts` "adopted copy still reading legacy secret names gets legacy-name findings and no cloud-router-secret-renamed" | red | failure: expected undefined to be defined |

## Gaps

None.

## Lint output — `.bkit/core/engine/checks/after/auth.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/checks/after/auth.test.ts

```

## Runner output — `.bkit/core/engine/checks/after/auth.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/checks/after/auth.test.ts

[test-timeout-budget] load average 8.8 on 10 cores: unit limits 8900ms per test, 17800ms per hook (x1.78)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

 ❯ .bkit/core/engine/checks/after/auth.test.ts (44 tests | 7 failed) 38ms
   ✓ detectShellGhMcpToken (4)
     ✓ returns 'present' when BKIT_GH_TOKEN is set and non-empty 1ms
     ✓ returns 'missing' when BKIT_GH_TOKEN is not set 0ms
     ✓ returns 'empty' when BKIT_GH_TOKEN is set to empty string 0ms
     ✓ 'empty' and 'missing' are distinct values (not equal) 1ms
   ✓ hasGithubMcpServer (6)
     ✓ true when root .mcp.json declares a github server 1ms
     ✓ true when only .cursor/mcp.json declares a github server 1ms
     ✓ false when no mcp config exists 0ms
     ✓ false when mcp config has only the linear server 0ms
     ✓ false when mcp config has only the jira server 0ms
     ✓ false (does not throw) on malformed JSON 0ms
   ✓ detectGhSecret (3)
     ✓ returns 'present' when gh CLI reports the named secret exists 0ms
     ✓ returns 'missing' when gh CLI reports no such secret 0ms
     ✓ returns 'unknown' when gh CLI fails (absent / unauthenticated) 0ms
   ✓ detectCiRouterSecrets (12)
     ✓ returns empty when bkit-cloud.yml is absent 0ms
     ✓ linear tracker, no claude credential: ONE finding naming the key and the federation variables (no tracker token) 1ms
     ✓ github tracker, no claude credential: ONE finding naming the key and the federation variables (no tracker token) 1ms
     ✓ jira tracker, no claude credential: ONE finding naming the key and the federation variables (no tracker token) 1ms
     ✓ returns empty when the ANTHROPIC_API_KEY secret is present 1ms
     ✓ no finding when federation variables are set and the adopted copy passes them 1ms
     ✓ one federation variable only: missing-credential finding 1ms
     ✓ federation variables set but the adopted copy predates the federation inputs: stale-copy finding 1ms
     ✓ key secret AND federation variables: the key shadows federation — finding says to delete the secret 1ms
     ✓ silent when gh cannot list secrets 1ms
     ✓ key secret present, variables unlistable: no finding (the key works) 1ms
     ✓ key secret missing, variables unlistable: missing-credential finding says the variables went unchecked 1ms
   ❯ detectCiRouterSecrets per variant (7)
     × %s tracker without its BKIT_ secret gives cloud-router-tracker-secret-missing naming it 3ms
     × cloud.agent codex without BKIT_OPENAI_API_KEY gives codex-api-key-secret-missing 1ms
     × anthropic findings fire only for cloud.agent claude, under BKIT_ANTHROPIC_API_KEY 1ms
     × legacy ANTHROPIC_API_KEY without BKIT_ANTHROPIC_API_KEY gives cloud-router-secret-renamed 1ms
     × legacy OPENCODE_PROVIDER_KEY without the provider key gives cloud-router-secret-renamed naming that key 1ms
     × adopted copy still reading legacy secret names gets legacy-name findings and no cloud-router-secret-renamed 1ms
     × dashboards router section names the recorded variant's BKIT_ secret 3ms
   ✓ buildCloudDashboardsAdvisory (12)
     ✓ returns null when none of router / .claude / .cursor / .codex exist 0ms
     ✓ bkit-cloud.yml alone: only the GitHub Actions credential, no host dashboard 1ms
     ✓ .claude/ alone: names that host's dashboard and its generated paste doc 0ms
     ✓ .cursor/ alone: names that host's dashboard and its generated paste doc 0ms
     ✓ .codex/ alone: names that host's dashboard and its generated paste doc 0ms
     ✓ names every installed host's dashboard when several are present 1ms
     ✓ never mentions the retired BKIT_GH_TOKEN_INSTALL install token 0ms
     ✓ github tracker: the checklist is identical and names no tracker token 1ms
     ✓ linear tracker: the checklist is identical and names no tracker token 1ms
     ✓ jira tracker: the checklist is identical and names no tracker token 1ms
     ✓ none tracker: the checklist is identical and names no tracker token 1ms
     ✓ lists cloud context-fetch creds (VERCEL_TOKEN etc.) for /bkit-debug in the cloud 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 7 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/after/auth.test.ts > detectCiRouterSecrets per variant > %s tracker without its BKIT_ secret gives cloud-router-tracker-secret-missing naming it
AssertionError: linear: expected undefined to be defined
 ❯ .bkit/core/engine/checks/after/auth.test.ts:302:32
    300|         (f) => f.id === "cloud-router-tracker-secret-missing",
    301|       );
    302|       expect(finding, tracker).toBeDefined();
       |                                ^
    303|       expect(text(finding!), tracker).toContain(keys[tracker]!);
    304|       for (const other of Object.keys(keys).filter((k) => k !== tracke…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/7]⎯

 FAIL  .bkit/core/engine/checks/after/auth.test.ts > detectCiRouterSecrets per variant > cloud.agent codex without BKIT_OPENAI_API_KEY gives codex-api-key-secret-missing
AssertionError: expected undefined to be defined
 ❯ .bkit/core/engine/checks/after/auth.test.ts:314:21
    312|     const findings = detectCiRouterSecrets(tmpDir);
    313|     const finding = findings.find((f) => f.id === "codex-api-key-secre…
    314|     expect(finding).toBeDefined();
       |                     ^
    315|     expect(text(finding!)).toContain("BKIT_OPENAI_API_KEY");
    316|     expect(findings.map((f) => f.id)).not.toContain("anthropic-api-key…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/7]⎯

 FAIL  .bkit/core/engine/checks/after/auth.test.ts > detectCiRouterSecrets per variant > anthropic findings fire only for cloud.agent claude, under BKIT_ANTHROPIC_API_KEY
AssertionError: expected [ …(3) ] to not include 'anthropic-api-key-secret-missing'
 ❯ .bkit/core/engine/checks/after/auth.test.ts:327:77
    325|     setup({ agent: "codex" });
    326|     mockGhNames({ secret: [], variable: [] });
    327|     for (const f of detectCiRouterSecrets(tmpDir)) expect(anthropicIds…
       |                                                                             ^
    328|     setup({ agent: "opencode", provider: "openrouter" });
    329|     mockGhNames({ secret: [], variable: [] });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/7]⎯

 FAIL  .bkit/core/engine/checks/after/auth.test.ts > detectCiRouterSecrets per variant > legacy ANTHROPIC_API_KEY without BKIT_ANTHROPIC_API_KEY gives cloud-router-secret-renamed
AssertionError: expected undefined to be defined
 ❯ .bkit/core/engine/checks/after/auth.test.ts:347:21
    345|       (f) => f.id === "cloud-router-secret-renamed",
    346|     );
    347|     expect(finding).toBeDefined();
       |                     ^
    348|     expect(finding!.action).toContain("gh secret set BKIT_ANTHROPIC_AP…
    349|     expect(finding!.action).toContain("gh secret delete ANTHROPIC_API_…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/7]⎯

 FAIL  .bkit/core/engine/checks/after/auth.test.ts > detectCiRouterSecrets per variant > legacy OPENCODE_PROVIDER_KEY without the provider key gives cloud-router-secret-renamed naming that key
AssertionError: expected undefined to be defined
 ❯ .bkit/core/engine/checks/after/auth.test.ts:358:21
    356|       (f) => f.id === "cloud-router-secret-renamed",
    357|     );
    358|     expect(finding).toBeDefined();
       |                     ^
    359|     expect(finding!.action).toContain("gh secret set BKIT_OPENCODE_API…
    360|     expect(finding!.action).toContain("gh secret delete OPENCODE_PROVI…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/7]⎯

 FAIL  .bkit/core/engine/checks/after/auth.test.ts > detectCiRouterSecrets per variant > adopted copy still reading legacy secret names gets legacy-name findings and no cloud-router-secret-renamed
AssertionError: expected undefined to be defined
 ❯ .bkit/core/engine/checks/after/auth.test.ts:377:21
    375|       (f) => f.id === "cloud-router-secret-renamed",
    376|     );
    377|     expect(renamed).toBeDefined();
       |                     ^
    378|     expect(renamed!.action).toContain("gh secret set BKIT_ANTHROPIC_AP…
    379|     expect(renamed!.action).toContain("gh secret delete ANTHROPIC_API_…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/7]⎯

 FAIL  .bkit/core/engine/checks/after/auth.test.ts > detectCiRouterSecrets per variant > dashboards router section names the recorded variant's BKIT_ secret
AssertionError: claude: expected 'Set each secret in the required locat…' not to contain 'gh secret set ANTHROPIC_API_KEY'

- Expected
+ Received

- gh secret set ANTHROPIC_API_KEY
+ Set each secret in the required locations:
+
+ 1. **GitHub Actions** (used by bkit-cloud.yml and your own workflows):
+        gh secret set ANTHROPIC_API_KEY --body='<value>'
+
+        Verify: `gh secret list | grep -E 'ANTHROPIC_API_KEY'`
+
+        Keyless alternative for bkit-cloud.yml (workload identity federation): leave the secret unset and set the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables (`gh variable set`) from a Claude Console federation rule.
+
+        ANTHROPIC_API_KEY is read from the Anthropic dashboard (https://console.anthropic.com/settings/keys); `.bkit/.env` holds the same value as BKIT_ANTHROPIC_API_KEY. The Claude GitHub App (`/install-github-app`) is also required for `cloud=claude`.
+
+ **Context-fetch (`/bkit-debug` in the cloud):** if you run the debug workflow in these cloud agents, the observability creds your `.agents/context.md` context-fetch blocks use (e.g. `VERCEL_TOKEN`, `SUPABASE_ACCESS_TOKEN`) must ALSO be set in the same dashboards above — non-interactively, since headless agents cannot `vercel login`. These are operator/observability READ creds, not app-runtime secrets. Commit the non-secret selectors (team scope / project ref / `--environment`) in your copied block so they need no dashboard entry. The CLIs those blocks call install automatically in the cloud from each block's `context-fetch:provision` sibling — no manual setup.
+
+ Same VALUE in all places.

 ❯ .bkit/core/engine/checks/after/auth.test.ts:400:38
    398|       const action = buildCloudDashboardsAdvisory(tmpDir)!.action;
    399|       expect(action, opts.agent).toContain(secret);
    400|       expect(action, opts.agent).not.toContain("gh secret set ANTHROPI…
       |                                      ^
    401|     }
    402|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/7]⎯


 Test Files  1 failed (1)
      Tests  7 failed | 37 passed (44)
   Start at  14:34:20
   Duration  188ms (tests 38%, transform 33%, setup 21%, import 7%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-oAtPd0/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
