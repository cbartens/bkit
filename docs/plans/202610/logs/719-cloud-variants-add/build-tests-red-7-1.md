Enforced: true
Red: 13
Accepted: 0
Updated: 0
Gaps: 1

<!-- verdict:end -->

# Tests Red — group 7, attempt 1

Plan: `docs/plans/202610/719-cloud-variants-add-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 13 | `.bkit/core/engine/checks/after/github.test.ts` "adopted copy serving the GitHub tracker only under %s gives cloud-router-tracker-stale" | red | failure: linear: expected 'cloud-router' to be 'cloud-router-tracker-stale' // Object.is equality |
| 13 | `.bkit/core/engine/checks/after/github.test.ts` "adopted copy without openai/codex-action under cloud.agent codex gives cloud-router-codex-missing" | red | failure: expected 'cloud-router' to be 'cloud-router-codex-missing' // Object.is equality |
| 13 | `.bkit/core/engine/checks/after/github.test.ts` "missing id-token wins over tracker-stale and tracker-stale over codex-missing" | red | failure: expected 'cloud-router' to be 'cloud-router-tracker-stale' // Object.is equality |
| 13 | `.bkit/core/engine/checks/after/github.test.ts` "cloud-claude-missing-id-token action names the template re-copy, not --tracker=github" | red | failure: expected 'Re-run `pnpm bkit install --auto=clau…' not to contain '--tracker=github' |
| 13 | `.bkit/core/engine/checks/after/github.test.ts` "jira tracker without a router gets the tracker-neutral cloud-router-none nudge" | red | failure: expected undefined to be 'cloud-router-none' // Object.is equality |
| 13 | `.bkit/core/engine/checks/after/github.test.ts` "cloud-router advisory names the Claude GitHub App only for cloud.agent claude" | red | failure: codex: expected 'Cloud agents: post-CI auto-routing is…' not to contain 'Claude GitHub App' |
| 13 | `.bkit/core/engine/checks/after/github.test.ts` "adopted router with no bkit.cloud.agent gives cloud-router-agent-unset naming bkit install --auto=" | red | failure: expected 'cloud-router' to be 'cloud-router-agent-unset' // Object.is equality |
| 14 | `.bkit/core/engine/checks/after/auth.test.ts` "%s tracker without its BKIT_ secret gives cloud-router-tracker-secret-missing naming it" | red | failure: linear: expected undefined to be defined |
| 14 | `.bkit/core/engine/checks/after/auth.test.ts` "cloud.agent codex without BKIT_OPENAI_API_KEY gives codex-api-key-secret-missing" | red | failure: expected undefined to be defined |
| 14 | `.bkit/core/engine/checks/after/auth.test.ts` "anthropic findings fire only for cloud.agent claude, under BKIT_ANTHROPIC_API_KEY" | red | failure: expected [ …(3) ] to not include 'anthropic-api-key-secret-missing' |
| 14 | `.bkit/core/engine/checks/after/auth.test.ts` "legacy ANTHROPIC_API_KEY without BKIT_ANTHROPIC_API_KEY gives cloud-router-secret-renamed" | red | failure: expected undefined to be defined |
| 14 | `.bkit/core/engine/checks/after/auth.test.ts` "legacy OPENCODE_PROVIDER_KEY without the provider key gives cloud-router-secret-renamed naming that key" | red | failure: expected undefined to be defined |
| 14 | `.bkit/core/engine/checks/after/auth.test.ts` "dashboards router section names the recorded variant's BKIT_ secret" | red | failure: claude: expected 'Set each secret in the required locat…' not to contain 'gh secret set ANTHROPIC_API_KEY' |
| 14 | `.bkit/core/engine/checks/after/auth.test.ts` "adopted copy still reading legacy secret names gets legacy-name findings and no cloud-router-secret-renamed" | vacuous | "adopted copy still reading legacy secret names gets legacy-name findings and no cloud-router-secret-renamed" passes at its red, so it proves nothing |

## Gaps

- TASK 14 `.bkit/core/engine/checks/after/auth.test.ts` "adopted copy still reading legacy secret names gets legacy-name findings and no cloud-router-secret-renamed" `vacuous` — "adopted copy still reading legacy secret names gets legacy-name findings and no cloud-router-secret-renamed" passes at its red, so it proves nothing

## Lint output — `.bkit/core/engine/checks/after/github.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/checks/after/github.test.ts

```

## Runner output — `.bkit/core/engine/checks/after/github.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/checks/after/github.test.ts

[test-timeout-budget] load average 14.7 on 10 cores: unit limits 11850ms per test, 23700ms per hook (x2.37)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

 ❯ .bkit/core/engine/checks/after/github.test.ts (63 tests | 7 failed) 175ms
   ✓ Trivy required-check migration (6)
     ✓ detects the legacy classic requirement and preserves protection in its instructions 7ms
     ✓ detects a legacy context in an active ruleset 3ms
     ✓ stays quiet when every checked requirement already uses the branded name 2ms
     ✓ reports an unavailable protection read instead of treating it as clean 1ms
     ✓ reports partial reads when the protected-branch budget is exceeded 1ms
     ✓ does not query protection when the workflow is absent 1ms
   ✓ detectProjectsToolset (5)
     ✓ 'present' when X-MCP-Toolsets includes projects 1ms
     ✓ 'missing' when header present but omits projects (old-install drift) 1ms
     ✓ 'unknown' when .mcp.json absent 0ms
     ✓ 'unknown' when github server has no toolset header (can't judge) 1ms
     ✓ 'unknown' (does not throw) on malformed JSON 1ms
   ✓ detectActionsWritePermissions (4)
     ✓ 'present' when write perms AND PR approval allowed 0ms
     ✓ 'missing' when permissions are read-only 0ms
     ✓ 'missing' when PR creation/approval is disabled even if write 0ms
     ✓ 'unknown' when gh CLI throws (unavailable / unauthenticated) 0ms
   ✓ buildGithubProjectAdvisory (13)
     ✓ returns null when workflows are not installed 1ms
     ✓ returns null when tracker is linear 3ms
     ✓ returns null when tracker is jira 1ms
     ✓ flags both prerequisites when config absent and toolset missing 2ms
     ✓ flags only the toolset when config is present but projects toolset missing 1ms
     ✓ flags only the config when toolset present but bkit.tracker.github.project absent 1ms
     ✓ returns null when both prerequisites are satisfied 2ms
     ✓ accepts a personal board URL with a trailing view 2ms
     ✓ stays quiet on explicit opt-out (bkit.tracker.github.project: false), even with toolset missing 2ms
     ✓ flags a project that is not a board URL (https://github.com/acme/web) 2ms
     ✓ flags a project that is not a board URL (https://github.com/orgs/acme/projects/0) 2ms
     ✓ flags a project that is not a board URL (github.com/orgs/acme/projects/7) 2ms
     ✓ shows the URL form for both owner kinds and the token each reaches 2ms
   ✓ detectMainBranchProtection (3)
     ✓ returns 'present' when gh api returns 200 1ms
     ✓ returns 'missing' when gh api stderr contains 'Branch not protected' 3ms
     ✓ returns 'unknown' when gh is unauthenticated / not a git repo 1ms
   ❯ buildCloudSetupAdvisory (14)
     ✓ bkit-cloud.yml present → cloud-router (informational, active) 2ms
     ✓ nudges (cloud-router-none) when workflows exist but the router is absent 1ms
     ✓ returns null when no workflows dir exists (no CI to route on — no nudge) 0ms
     ✓ stays quiet when bkit.cloud.agent is explicitly 'none' (deliberate opt-out) 1ms
     ✓ still nudges when bkit.cloud.agent is absent (undecided, not opted out) 1ms
     ✓ still nudges when bkit.cloud.agent is the empty value install seeds 2ms
     ✓ router presence wins over a stale bkit.cloud.agent=none field 2ms
     × adopted copy serving the GitHub tracker only under %s gives cloud-router-tracker-stale 18ms
     × adopted copy without openai/codex-action under cloud.agent codex gives cloud-router-codex-missing 3ms
     × missing id-token wins over tracker-stale and tracker-stale over codex-missing 3ms
     × cloud-claude-missing-id-token action names the template re-copy, not --tracker=github 4ms
     × jira tracker without a router gets the tracker-neutral cloud-router-none nudge 14ms
     × cloud-router advisory names the Claude GitHub App only for cloud.agent claude 4ms
     × adopted router with no bkit.cloud.agent gives cloud-router-agent-unset naming bkit install --auto= 2ms
   ✓ buildTrackerSetupAdvisory — explicit-none opt-out symmetry (10)
     ✓ nudges (tracker-setup-none) when bkit.tracker.default is absent (undecided) 1ms
     ✓ nudges when bkit.tracker.default is the empty value install seeds 1ms
     ✓ stays quiet when bkit.tracker.default is explicitly 'none' (deliberate opt-out) 1ms
     ✓ informational when tracker is github, naming BKIT_GH_TOKEN 1ms
     ✓ informational when tracker is linear, naming BKIT_LINEAR_API_KEY 1ms
     ✓ informational when tracker is jira, naming BKIT_JIRA_API_KEY 7ms
     ✓ github: fires with only .cursor/ installed, stays quiet with no host installed 2ms
     ✓ linear: fires with only .cursor/ installed, stays quiet with no host installed 8ms
     ✓ jira: fires with only .cursor/ installed, stays quiet with no host installed 1ms
     ✓ jira: names the admin switch, the token and the package.json keys 1ms
   ✓ buildGithubProjectTokenScopeAdvisory (8)
     ✓ classic token with the project scope: quiet 1ms
     ✓ classic token without the project scope: names the fix 1ms
     ✓ fine-grained token that can see the board: quiet 1ms
     ✓ fine-grained token whose board query returns null: names the fix 1ms
     ✓ fine-grained token whose board query is refused: names the fix 1ms
     ✓ gh unavailable or unauthenticated: quiet (cannot judge) 6ms
     ✓ no board configured, another tracker, or cloud: no gh call at all 19ms
     ✓ never prints the token 4ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 7 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/after/github.test.ts > buildCloudSetupAdvisory > adopted copy serving the GitHub tracker only under %s gives cloud-router-tracker-stale
AssertionError: linear: expected 'cloud-router' to be 'cloud-router-tracker-stale' // Object.is equality

Expected: "cloud-router-tracker-stale"
Received: "cloud-router"

 ❯ .bkit/core/engine/checks/after/github.test.ts:454:60
    452|     for (const tracker of ["linear", "jira"]) {
    453|       writeRouter(`${STALE}permissions:\n  id-token: write\nsecrets.BK…
    454|       expect(buildCloudSetupAdvisory(tmpDir)?.id, tracker).toBe("cloud…
       |                                                            ^
    455|     }
    456|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/7]⎯

 FAIL  .bkit/core/engine/checks/after/github.test.ts > buildCloudSetupAdvisory > adopted copy without openai/codex-action under cloud.agent codex gives cloud-router-codex-missing
AssertionError: expected 'cloud-router' to be 'cloud-router-codex-missing' // Object.is equality

Expected: "cloud-router-codex-missing"
Received: "cloud-router"

 ❯ .bkit/core/engine/checks/after/github.test.ts:460:49
    458|   it("adopted copy without openai/codex-action under cloud.agent codex…
    459|     writeRouter("name: bkit-auto\nsecrets.BKIT_X\n", "codex", "github"…
    460|     expect(buildCloudSetupAdvisory(tmpDir)?.id).toBe("cloud-router-cod…
       |                                                 ^
    461|   });
    462|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/7]⎯

 FAIL  .bkit/core/engine/checks/after/github.test.ts > buildCloudSetupAdvisory > missing id-token wins over tracker-stale and tracker-stale over codex-missing
AssertionError: expected 'cloud-router' to be 'cloud-router-tracker-stale' // Object.is equality

Expected: "cloud-router-tracker-stale"
Received: "cloud-router"

 ❯ .bkit/core/engine/checks/after/github.test.ts:467:49
    465|     expect(buildCloudSetupAdvisory(tmpDir)?.id).toBe("cloud-claude-mis…
    466|     writeRouter(`${STALE}id-token: write\nsecrets.BKIT_X\n`, "claude",…
    467|     expect(buildCloudSetupAdvisory(tmpDir)?.id).toBe("cloud-router-tra…
       |                                                 ^
    468|     writeRouter(`${STALE}secrets.BKIT_X\n`, "codex", "linear");
    469|     expect(buildCloudSetupAdvisory(tmpDir)?.id).toBe("cloud-router-tra…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/7]⎯

 FAIL  .bkit/core/engine/checks/after/github.test.ts > buildCloudSetupAdvisory > cloud-claude-missing-id-token action names the template re-copy, not --tracker=github
AssertionError: expected 'Re-run `pnpm bkit install --auto=clau…' not to contain '--tracker=github'

Expected: "--tracker=github"
Received: "Re-run `pnpm bkit install --auto=claude --tracker=github` to regenerate the workflow with `id-token: write` and the App-auth framing. Also verify the Claude GitHub App is installed (`/install-github-app`). See bkit's `cloud.md` § Post-CI auto-routing."

 ❯ .bkit/core/engine/checks/after/github.test.ts:478:32
    476|     const result = buildCloudSetupAdvisory(tmpDir);
    477|     expect(result?.id).toBe("cloud-claude-missing-id-token");
    478|     expect(result!.action).not.toContain("--tracker=github");
       |                                ^
    479|     expect(result!.action).toMatch(/template/i);
    480|     expect(result!.action).toMatch(/re-copy/i);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/7]⎯

 FAIL  .bkit/core/engine/checks/after/github.test.ts > buildCloudSetupAdvisory > jira tracker without a router gets the tracker-neutral cloud-router-none nudge
AssertionError: expected undefined to be 'cloud-router-none' // Object.is equality

- Expected:
"cloud-router-none"

+ Received:
undefined

 ❯ .bkit/core/engine/checks/after/github.test.ts:490:24
    488|     );
    489|     const result = buildCloudSetupAdvisory(tmpDir);
    490|     expect(result?.id).toBe("cloud-router-none");
       |                        ^
    491|     expect(result!.action).toMatch(/bkit install --auto=/);
    492|     expect(result!.action).not.toContain("For a GitHub-tracker repo");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/7]⎯

 FAIL  .bkit/core/engine/checks/after/github.test.ts > buildCloudSetupAdvisory > cloud-router advisory names the Claude GitHub App only for cloud.agent claude
AssertionError: codex: expected 'Cloud agents: post-CI auto-routing is…' not to contain 'Claude GitHub App'

- Expected
+ Received

- Claude GitHub App
+ Cloud agents: post-CI auto-routing is active (`.github/workflows/bkit-cloud.yml` present). The Claude GitHub App is required — run `/install-github-app` (Claude Code CLI) once if not already done.
+ The workflow requires: the `ANTHROPIC_API_KEY` repo secret OR the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables (keyless workload identity federation), the Claude GitHub App (`/install-github-app`), and GitHub Actions write permissions (org AND repo). See the `bkit-auto-setup` advisory (emitted by `bkit install --auto=claude`) and bkit's `cloud.md` § Post-CI auto-routing for the full checklist.
+
+ bkit's agents comment as you, so every workflow those comments trigger notifies you, even ones that skip. To see only failures: GitHub → Settings → Notifications → System → Actions → "Only notify for failed workflows".

 ❯ .bkit/core/engine/checks/after/github.test.ts:505:63
    503|       const other = buildCloudSetupAdvisory(tmpDir);
    504|       expect(other?.id, agent).toBe("cloud-router");
    505|       expect(`${other!.detect}\n${other!.action}`, agent).not.toContai…
       |                                                               ^
    506|     }
    507|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/7]⎯

 FAIL  .bkit/core/engine/checks/after/github.test.ts > buildCloudSetupAdvisory > adopted router with no bkit.cloud.agent gives cloud-router-agent-unset naming bkit install --auto=
AssertionError: expected 'cloud-router' to be 'cloud-router-agent-unset' // Object.is equality

Expected: "cloud-router-agent-unset"
Received: "cloud-router"

 ❯ .bkit/core/engine/checks/after/github.test.ts:512:24
    510|     writeRouter("name: bkit-auto\nsecrets.BKIT_X\n", undefined, "githu…
    511|     const result = buildCloudSetupAdvisory(tmpDir);
    512|     expect(result?.id).toBe("cloud-router-agent-unset");
       |                        ^
    513|     expect(result!.action).toContain("bkit install --auto=");
    514|     expect(result!.detect).not.toMatch(/routing is active/i);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/7]⎯


 Test Files  1 failed (1)
      Tests  7 failed | 56 passed (63)
   Start at  14:33:14
   Duration  563ms (tests 49%, transform 20%, setup 17%, import 13%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-GIdKZY/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/checks/after/auth.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/checks/after/auth.test.ts

```

## Runner output — `.bkit/core/engine/checks/after/auth.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/checks/after/auth.test.ts

[test-timeout-budget] load average 16.2 on 10 cores: unit limits 12600ms per test, 25200ms per hook (x2.52)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

 ❯ .bkit/core/engine/checks/after/auth.test.ts (44 tests | 6 failed) 159ms
   ✓ detectShellGhMcpToken (4)
     ✓ returns 'present' when BKIT_GH_TOKEN is set and non-empty 3ms
     ✓ returns 'missing' when BKIT_GH_TOKEN is not set 1ms
     ✓ returns 'empty' when BKIT_GH_TOKEN is set to empty string 1ms
     ✓ 'empty' and 'missing' are distinct values (not equal) 1ms
   ✓ hasGithubMcpServer (6)
     ✓ true when root .mcp.json declares a github server 1ms
     ✓ true when only .cursor/mcp.json declares a github server 22ms
     ✓ false when no mcp config exists 4ms
     ✓ false when mcp config has only the linear server 2ms
     ✓ false when mcp config has only the jira server 1ms
     ✓ false (does not throw) on malformed JSON 1ms
   ✓ detectGhSecret (3)
     ✓ returns 'present' when gh CLI reports the named secret exists 1ms
     ✓ returns 'missing' when gh CLI reports no such secret 1ms
     ✓ returns 'unknown' when gh CLI fails (absent / unauthenticated) 1ms
   ✓ detectCiRouterSecrets (12)
     ✓ returns empty when bkit-cloud.yml is absent 1ms
     ✓ linear tracker, no claude credential: ONE finding naming the key and the federation variables (no tracker token) 2ms
     ✓ github tracker, no claude credential: ONE finding naming the key and the federation variables (no tracker token) 4ms
     ✓ jira tracker, no claude credential: ONE finding naming the key and the federation variables (no tracker token) 3ms
     ✓ returns empty when the ANTHROPIC_API_KEY secret is present 3ms
     ✓ no finding when federation variables are set and the adopted copy passes them 3ms
     ✓ one federation variable only: missing-credential finding 3ms
     ✓ federation variables set but the adopted copy predates the federation inputs: stale-copy finding 2ms
     ✓ key secret AND federation variables: the key shadows federation — finding says to delete the secret 2ms
     ✓ silent when gh cannot list secrets 2ms
     ✓ key secret present, variables unlistable: no finding (the key works) 2ms
     ✓ key secret missing, variables unlistable: missing-credential finding says the variables went unchecked 2ms
   ❯ detectCiRouterSecrets per variant (7)
     × %s tracker without its BKIT_ secret gives cloud-router-tracker-secret-missing naming it 11ms
     × cloud.agent codex without BKIT_OPENAI_API_KEY gives codex-api-key-secret-missing 2ms
     × anthropic findings fire only for cloud.agent claude, under BKIT_ANTHROPIC_API_KEY 3ms
     × legacy ANTHROPIC_API_KEY without BKIT_ANTHROPIC_API_KEY gives cloud-router-secret-renamed 2ms
     × legacy OPENCODE_PROVIDER_KEY without the provider key gives cloud-router-secret-renamed naming that key 2ms
     ✓ adopted copy still reading legacy secret names gets legacy-name findings and no cloud-router-secret-renamed 2ms
     × dashboards router section names the recorded variant's BKIT_ secret 46ms
   ✓ buildCloudDashboardsAdvisory (12)
     ✓ returns null when none of router / .claude / .cursor / .codex exist 1ms
     ✓ bkit-cloud.yml alone: only the GitHub Actions credential, no host dashboard 2ms
     ✓ .claude/ alone: names that host's dashboard and its generated paste doc 1ms
     ✓ .cursor/ alone: names that host's dashboard and its generated paste doc 1ms
     ✓ .codex/ alone: names that host's dashboard and its generated paste doc 1ms
     ✓ names every installed host's dashboard when several are present 1ms
     ✓ never mentions the retired BKIT_GH_TOKEN_INSTALL install token 1ms
     ✓ github tracker: the checklist is identical and names no tracker token 3ms
     ✓ linear tracker: the checklist is identical and names no tracker token 4ms
     ✓ jira tracker: the checklist is identical and names no tracker token 3ms
     ✓ none tracker: the checklist is identical and names no tracker token 2ms
     ✓ lists cloud context-fetch creds (VERCEL_TOKEN etc.) for /bkit-debug in the cloud 1ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/checks/after/auth.test.ts > detectCiRouterSecrets per variant > %s tracker without its BKIT_ secret gives cloud-router-tracker-secret-missing naming it
AssertionError: linear: expected undefined to be defined
 ❯ .bkit/core/engine/checks/after/auth.test.ts:302:32
    300|         (f) => f.id === "cloud-router-tracker-secret-missing",
    301|       );
    302|       expect(finding, tracker).toBeDefined();
       |                                ^
    303|       expect(text(finding!), tracker).toContain(keys[tracker]!);
    304|       for (const other of Object.keys(keys).filter((k) => k !== tracke…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/6]⎯

 FAIL  .bkit/core/engine/checks/after/auth.test.ts > detectCiRouterSecrets per variant > cloud.agent codex without BKIT_OPENAI_API_KEY gives codex-api-key-secret-missing
AssertionError: expected undefined to be defined
 ❯ .bkit/core/engine/checks/after/auth.test.ts:314:21
    312|     const findings = detectCiRouterSecrets(tmpDir);
    313|     const finding = findings.find((f) => f.id === "codex-api-key-secre…
    314|     expect(finding).toBeDefined();
       |                     ^
    315|     expect(text(finding!)).toContain("BKIT_OPENAI_API_KEY");
    316|     expect(findings.map((f) => f.id)).not.toContain("anthropic-api-key…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/6]⎯

 FAIL  .bkit/core/engine/checks/after/auth.test.ts > detectCiRouterSecrets per variant > anthropic findings fire only for cloud.agent claude, under BKIT_ANTHROPIC_API_KEY
AssertionError: expected [ …(3) ] to not include 'anthropic-api-key-secret-missing'
 ❯ .bkit/core/engine/checks/after/auth.test.ts:327:77
    325|     setup({ agent: "codex" });
    326|     mockGhNames({ secret: [], variable: [] });
    327|     for (const f of detectCiRouterSecrets(tmpDir)) expect(anthropicIds…
       |                                                                             ^
    328|     setup({ agent: "opencode", provider: "openrouter" });
    329|     mockGhNames({ secret: [], variable: [] });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/6]⎯

 FAIL  .bkit/core/engine/checks/after/auth.test.ts > detectCiRouterSecrets per variant > legacy ANTHROPIC_API_KEY without BKIT_ANTHROPIC_API_KEY gives cloud-router-secret-renamed
AssertionError: expected undefined to be defined
 ❯ .bkit/core/engine/checks/after/auth.test.ts:347:21
    345|       (f) => f.id === "cloud-router-secret-renamed",
    346|     );
    347|     expect(finding).toBeDefined();
       |                     ^
    348|     expect(finding!.action).toContain("gh secret set BKIT_ANTHROPIC_AP…
    349|     expect(finding!.action).toContain("gh secret delete ANTHROPIC_API_…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/6]⎯

 FAIL  .bkit/core/engine/checks/after/auth.test.ts > detectCiRouterSecrets per variant > legacy OPENCODE_PROVIDER_KEY without the provider key gives cloud-router-secret-renamed naming that key
AssertionError: expected undefined to be defined
 ❯ .bkit/core/engine/checks/after/auth.test.ts:358:21
    356|       (f) => f.id === "cloud-router-secret-renamed",
    357|     );
    358|     expect(finding).toBeDefined();
       |                     ^
    359|     expect(finding!.action).toContain("gh secret set BKIT_OPENCODE_API…
    360|     expect(finding!.action).toContain("gh secret delete OPENCODE_PROVI…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/6]⎯

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

 ❯ .bkit/core/engine/checks/after/auth.test.ts:392:38
    390|       const action = buildCloudDashboardsAdvisory(tmpDir)!.action;
    391|       expect(action, opts.agent).toContain(secret);
    392|       expect(action, opts.agent).not.toContain("gh secret set ANTHROPI…
       |                                      ^
    393|     }
    394|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/6]⎯


 Test Files  1 failed (1)
      Tests  6 failed | 38 passed (44)
   Start at  14:33:18
   Duration  633ms (tests 47%, setup 43%, import 4%, transform 3%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-jloAn5/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
