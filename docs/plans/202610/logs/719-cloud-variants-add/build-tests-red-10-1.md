Enforced: true
Red: 4
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 10, attempt 1

Plan: `docs/plans/202610/719-cloud-variants-add-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 21 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "exit 80 reason=auth with BKIT_JIRA_API_KEY set names the secret but never prints its value" | red | failure: expected '::warning::[bkit-cloud] gate: unreada…' not to contain 'jira-secret-value' |
| 22 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "dev arm with absent node_modules/.bin/bkit warns bkit unavailable and exits green" | red | failure: expected '::notice::Cannot derive FID by dev co…' to contain '::warning::[bkit-cloud] gate: unreada…' |
| 23 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "context job installs and runs bkit from dev, never from the feat/** PR head" | red | failure: expected 'feat/363-widen-bkit-cloud-trigger' to be 'dev' // Object.is equality |
| 24 | `.bkit/core/engine/install/cloud-env.test.ts` "never lets BKIT_OPENAI_API_KEY into the paste block" | red | failure: expected [ 'BKIT_GH_TOKEN', …(1) ] to not include 'BKIT_OPENAI_API_KEY' |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts

[test-timeout-budget] load average 3.4 on 10 cores: unit limits 6200ms per test, 12400ms per hook (x1.24)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (66 tests | 2 failed) 39394ms
   ❯ bkit-cloud.yml ctx step — extracted bash (#363) (47)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 1193ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 128ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 797ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) under the linear tracker dispatches 948ms
     ✓ T16: a Jira-shaped commit scope under the github tracker has no issue — no dispatch 639ms
     ❯ feat/** path — bkit_gate outcomes (10)
       ✓ github feat run passes the gate through the real bkit and stub gh 861ms
       ✓ label removed gives label-absent, skip and a summary row 793ms
       ✓ %s recorded fetch reply carrying bkit:auto passes the gate 855ms
       ✓ jira marker AB2-12 dispatches 643ms
       ✓ exit 80 reason=auth with BKIT_JIRA_API_KEY empty warns naming the secret and exits green 656ms
       × exit 80 reason=auth with BKIT_JIRA_API_KEY set names the secret but never prints its value 595ms
       ✓ exit 80 reason=%s is unreadable with that reason and exits green 792ms
       ✓ %s fetch output is unreadable reason=output-unparseable 782ms
       ✓ absent node_modules/.bin/bkit warns bkit unavailable and exits green 333ms
       ✓ feat branch with no marker and no feature row gives no-issue 558ms
     ❯ dev path — engine parse of the squash subject and merged-PR body (7)
       ✓ dev subject feat(<fid>): resolves the FID via --prompt-file and the issue via the feature row 1503ms
       ✓ linear-shaped FID under the github tracker gives no-issue and no dispatch 623ms
       ✓ dev subject naming several issues is a no-FID no-op 774ms
       × dev arm with absent node_modules/.bin/bkit warns bkit unavailable and exits green 123ms
       ✓ dev arm passes the gate for a closed issue that still carries bkit:auto 958ms
       ✓ dev subject feat(ab2-12-login-retry) under jira passes bkit_dev_dispatch_guard and dispatches 931ms
       ✓ traversal FID from the subject or the merged-PR body is a no-FID no-op that writes nothing outside docs/plans/ 1502ms
     ✓ a github tracker in package.json passes the tracker gate and dispatches 1117ms
     ✓ dev path — cross-session loop cap (T5) (4)
       ✓ refuses to dispatch uncounted when package.json cannot be read 534ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 933ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 867ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 1321ms
     ✓ fix/** is not a routed surface (3)
       ✓ the workflow_run trigger filter covers feat/** and dev only 117ms
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 577ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 588ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 850ms
       ✓ F3: a non-FID-shaped branch (feat/add-oauth) no-ops cleanly instead of aborting the step 585ms
       ✓ F3: a non-FID-shaped branch (feat/hotfix-login) no-ops cleanly instead of aborting the step 577ms
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 592ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 574ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 785ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 926ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 887ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 995ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 906ms
       ✓ a branch with no status.jsonl dispatches as before 786ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 981ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 1373ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 1023ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 963ms
     ✓ kill switch precedes the stale-run guard: a revoked FID writes no drop telemetry 974ms
     ✓ FID recovery reads the commit SUBJECT, not a scoped line in the body 766ms
   ✓ bkit-cloud.yml summary row — jobs field from the Select hand-off (2)
     ✓ pass row's jobs field names codex:BKIT_OPENAI_API_KEY and the ignored claude job with its reason 841ms
     ✓ no-agent row's jobs field names the recorded agent's missing BKIT_ secret and the ignored secrets 789ms
   ✓ bkit-cloud.yml gate step — per-job credential detection (17)
     ✓ BKIT_ANTHROPIC_API_KEY alone enables the run 8ms
     ✓ both federation variables, no key, enable the run 8ms
     ✓ only ANTHROPIC_FEDERATION_RULE_ID set: claude job no-ops with a notice naming ANTHROPIC_ORGANIZATION_ID 7ms
     ✓ only ANTHROPIC_ORGANIZATION_ID set: claude job no-ops with a notice naming ANTHROPIC_FEDERATION_RULE_ID 7ms
     ✓ no claude credential: notice names both the secret and the federation variables 7ms
     ✓ BKIT_ANTHROPIC_API_KEY alone sets enabled true 7ms
     ✓ BKIT_OPENCODE_API_KEY alone sets enabled true 7ms
     ✓ BKIT_OPENROUTER_API_KEY alone sets enabled true 7ms
     ✓ BKIT_OLLAMA_API_KEY alone sets enabled true 7ms
     ✓ BKIT_OPENAI_API_KEY alone sets enabled true 7ms
     ✓ enabled is true when any agent BKIT_ secret is set and false when none is 44ms
     ✓ absent bkit.cloud.agent selects no job and the notice names bkit install --auto= 10ms
     ✓ recorded claude with BKIT_ANTHROPIC_API_KEY selects only the claude job 11ms
     ✓ recorded codex selects only codex while BKIT_ANTHROPIC_API_KEY is also set 11ms
     ✓ recorded agent without its secret selects no job and names the missing secret 10ms
     ✓ recorded cursor selects no router job 10ms
     ✓ recorded none selects no router job 10ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > feat/** path — bkit_gate outcomes > exit 80 reason=auth with BKIT_JIRA_API_KEY set names the secret but never prints its value
AssertionError: expected '::warning::[bkit-cloud] gate: unreada…' not to contain 'jira-secret-value'

- Expected
+ Received

- jira-secret-value
+ ::warning::[bkit-cloud] gate: unreadable (reason=auth) — the jira read was refused; check the BKIT_JIRA_API_KEY secret (set but rejectedjira-secret-value). No agent starts.
+

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:522:33
    520|       expect(result.stdout).toContain("BKIT_JIRA_API_KEY");
    521|       expect(result.stdout).toContain("set but rejected");
    522|       expect(result.stdout).not.toContain("jira-secret-value");
       |                                 ^
    523|       expect(result.stderr).not.toContain("jira-secret-value");
    524|       expect(result.summary).not.toContain("jira-secret-value");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > dev path — engine parse of the squash subject and merged-PR body > dev arm with absent node_modules/.bin/bkit warns bkit unavailable and exits green
AssertionError: expected '::notice::Cannot derive FID by dev co…' to contain '::warning::[bkit-cloud] gate: unreada…'

- Expected
+ Received

- ::warning::[bkit-cloud] gate: unreadable (bkit-unavailable)
+ ::notice::Cannot derive FID by dev commit scope or linked PR — no-op exit (fail-safe).
+

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:707:29
    705|       expect(result.outputs.skip).toBe("true");
    706|       expect(result.outputs.phase).toBeUndefined();
    707|       expect(result.stdout).toContain(
       |                             ^
    708|         "::warning::[bkit-cloud] gate: unreadable (bkit-unavailable)",
    709|       );

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 64 passed (66)
   Start at  17:36:04
   Duration  39.50s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-jAzbYP/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts

[test-timeout-budget] load average 2.9 on 10 cores: unit limits 5950ms per test, 11900ms per hook (x1.19)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

(node:90654) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ NODE_VERSION }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:90654) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ NODE_VERSION }". Set mapAsMap: true to use object keys.
 ❯ .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts (31 tests | 1 failed) 334ms
   ❯ bkit-cloud.yml template — GitHub-only content (9)
     ✓ carries id-token: write, GitHub MCP only and the tracker read keys in the context step 1ms
     ✓ claude job reads secrets.BKIT_ANTHROPIC_API_KEY and no step names secrets.ANTHROPIC_API_KEY 0ms
     ✓ opencode dispatch maps each provider BKIT_ secret to its own env name 0ms
     ✓ context checkout ref is the workflow_run head branch on feat/** and dev for dev runs and workflow_dispatch 5ms
     × context job installs and runs bkit from dev, never from the feat/** PR head 6ms
     ✓ claude step passes the four workload identity federation inputs from repo variables 0ms
     ✓ every job's runs-on is the {{CLOUD_RUNNER}} placeholder the consumer fills in 0ms
     ✓ one context job resolves phase + arg; every runner job needs it and read its outputs 0ms
     ✓ header states App required and the bkit:auto label (no bare Auto) 0ms
   ✓ T3.1 — concurrency.group intra-surface serialisation (D3 race prevention) (3)
     ✓ concurrency.group dispatch path keys on inputs.issue (bare issue number) 0ms
     ✓ concurrency.group CI-completion path keys on head_branch (full slugged branch name) 0ms
     ✓ realistic slugged branch (feat/141-cloud-app) does NOT equal dispatch issue number (141) — cross-surface asymmetry is expected and documented 0ms
   ✓ T2.7 — two-tier CI gate positive assertions (GAP-3) (4)
     ✓ (b) free-tier if: contains 'bkit [auto route]' — gate fires when marker is HEAD commit 0ms
     ✓ (b) dispatch path always proceeds (workflow_dispatch bypasses marker check) 0ms
     ✓ (c) the label gate is bkit_gate, defined after SHARED-DERIV and called on both arms; no gh issue view remains 0ms
     ✓ (c) the free-tier marker check lives in the context job's if: gate, which both runner jobs need 0ms
   ✓ KN-3 regression: bkit-ci.yml files must NOT set `with.version:` for pnpm action (2)
     ✓ bkit-ci.yml template does NOT set both `with.version:` and rely on packageManager (KN-3) 1ms
     ✓ bkit's own .github/workflows/bkit-ci.yml does NOT set `with.version:` for pnpm action (KN-3) 0ms
   ✓ Challenge Finding 1 — SHARED-DERIV portability and pipefail safety regression (4)
     ✓ (1a) canonical bkit-cloud.yml contains NO grep -oP (PCRE lookbehind) — portability regression guard 1ms
     ✓ (1a) template bkit-cloud.yml contains NO grep -oP (PCRE lookbehind) — portability regression guard 0ms
     ✓ (1b) feat-arm FID/ISSUE parse lines in canonical and template carry a || true failure guard (pipefail safety) 0ms
     ✓ (1c) the FID/ISSUE extraction lines exit 0 under set -euo pipefail on an empty parse and read a recorded parse (real-tool validation) 33ms
   ✓ bkit-cloud.yml template — dispatch jobs (9)
     ✓ tracker secrets sit in the ctx and every dispatch step env and in no job or workflow env 0ms
     ✓ codex job runs only when the context job selects codex and skip is not true 0ms
     ✓ codex job installs dependencies before openai/codex-action 0ms
     ✓ codex-action is SHA-pinned with a v1 comment and codex-version is pinned under a renovate annotation 0ms
     ✓ codex-action passes danger-full-access, allow-bots, BKIT_OPENAI_API_KEY and the $bkit-auto prompt 0ms
     ✓ trust step writes a codex-home config.toml trusting the workspace 11ms
     ✓ filled bkit-cloud.yml passes actionlint 212ms
     ✓ codex summary step runs under if: always() and writes action, commits and comments 62ms
     ✓ opencode job installs dependencies before its dispatch step 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts > bkit-cloud.yml template — GitHub-only content > context job installs and runs bkit from dev, never from the feat/** PR head
AssertionError: expected 'feat/363-widen-bkit-cloud-trigger' to be 'dev' // Object.is equality

Expected: "dev"
Received: "feat/363-widen-bkit-cloud-trigger"

 ❯ .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts:126:59
    124|     const head = "feat/363-widen-bkit-cloud-trigger";
    125|     for (const co of intoInstallDir) {
    126|       expect(evalCheckoutRef(String(co.with?.ref), head)).toBe("dev");
       |                                                           ^
    127|     }
    128|     // The checkout that populates the install directory last decides …

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 30 passed (31)
   Start at  17:36:44
   Duration  460ms (tests 82%, import 12%, setup 5%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-qsVO5K/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/install/cloud-env.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/install/cloud-env.test.ts

```

## Runner output — `.bkit/core/engine/install/cloud-env.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/install/cloud-env.test.ts

[test-timeout-budget] load average 2.8 on 10 cores: unit limits 5900ms per test, 11800ms per hook (x1.18)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

 ❯ .bkit/core/engine/install/cloud-env.test.ts (101 tests | 1 failed) 70ms
   ✓ parseEnvrc (1)
     ✓ extracts dotenv targets in order, unsets (single + multi), and exports 1ms
   ✓ parseDotenv (1)
     ✓ parses KEY=value, honours quotes, export prefix, and '=' inside value 0ms
   ✓ resolveConsumerPnpm / renderCorepackLine (2)
     ✓ parses the full pnpm version from packageManager 0ms
     ✓ degrades to bare corepack enable when packageManager is absent 0ms
   ❯ resolveCloudEnvVars (7)
     ✓ follows .envrc: last-source wins, honours unsets, drops hijack + empty, flags placeholders 1ms
     ✓ drops exactly the three documented session-hijack keys (docs/security.md) 0ms
     ✓ never lets ANTHROPIC_API_KEY into the paste block 1ms
     ✓ never lets BKIT_ANTHROPIC_API_KEY into the paste block 1ms
     ✓ never lets ANTHROPIC_AUTH_TOKEN into the paste block 1ms
     × never lets BKIT_OPENAI_API_KEY into the paste block 3ms
     ✓ returns an empty resolution (the sole baseline placeholder) when no .envrc exists 0ms
   ✓ renderCloudEnvBlock (2)
     ✓ emits only the resolved lines when every baseline token resolved 1ms
     ✓ emits a placeholder line for an absent baseline token 1ms
   ✓ renderCloudEnvNotes (2)
     ✓ summarises dropped/unset/empty/placeholder categories 1ms
     ✓ emits a no-.envrc message when none exists 0ms
   ✓ template generation sentinels (8)
     ✓ template carries the generation sentinels the module substitutes 0ms
     ✓ trust + user-settings sentinels sit AFTER the jq install (both regions need jq) 0ms
     ✓ cache-bust sentinel sits at the top of the setup script (after the shebang) 0ms
     ✓ installs the pinned Node onto PATH before corepack runs 0ms
     ✓ pins a Node major that satisfies package.json engines.node 1ms
     ✓ pairs every download *_VERSION with a *_SHA256 1ms
     ✓ shares every version + sha256 pin with the Cursor Dockerfile template 1ms
     ✓ puts a renovate comment directly above every *_VERSION pin 0ms
   ✓ extractContextFetchProvisionRecipes / renderCloudContextFetchProvision (5)
     ✓ returns [] when .agents/context.md is absent 0ms
     ✓ ignores provision blocks inside the managed block (only consumer-section counts) 0ms
     ✓ extracts the bash body of each consumer-section provision block 1ms
     ✓ names an unnamed provision block by its position 0ms
     ✓ does not treat a fetch (context-fetch:start) block as a provision recipe 0ms
   ✓ renderCloudCacheBust (4)
     ✓ starts the counter at 1 when no prior doc exists 0ms
     ✓ increments the counter when the prior doc has today's date 0ms
     ✓ resets the counter to 1 when the prior doc is from an earlier date 0ms
     ✓ starts at 1 when the prior doc has no cache-bust line (pre-feature doc) 0ms
   ✓ writeClaudeCloudDoc — end-to-end render (real template) (4)
     ✓ emits a cache-bust line and leaves NO unreplaced @@CLOUD_ sentinels 1ms
     ✓ advances the counter on a same-day regeneration 1ms
     ✓ renders the always-Custom block with shipped hosts when no allowed-domains are declared 1ms
     ✓ renders the Custom allowlist when allowed-domains are declared 1ms
   ✓ extractAllowedDomains / expandAllowedDomains / renderCloudNetworkAllowlist (9)
     ✓ returns [] when context.md is absent or has no allowed-domains block 0ms
     ✓ extracts declared domains, ignoring comments/blank/marker lines 0ms
     ✓ only reads blocks BELOW bkit:end (managed-section examples ignored) 1ms
     ✓ expands each domain to apex + wildcard, normalising a leading *., deduped/sorted 0ms
     ✓ networkAllowlistBases collapses wildcards to apex, dedupes, and sorts 0ms
     ✓ networkAllowlistBases drops empty/whitespace entries and trims 0ms
     ✓ networkAllowlistBases returns [] for an empty input 0ms
     ✓ renders the always-Custom block (with pointer) when nothing is declared 0ms
     ✓ resolveNetworkAllowlist stays stack-agnostic until consumer declares domains 1ms
   ✓ cloudRepoPath / renderCloudWorkspaceTrust (3)
     ✓ bakes the container clone path from the repo directory name 0ms
     ✓ merges the trust key rather than clobbering an existing .claude.json 0ms
     ✓ honours CLAUDE_CONFIG_DIR, falling back to $HOME 0ms
   ✓ cloudAutoModeEnvironment / renderCloudUserSettings (5)
     ✓ ALWAYS emits $defaults first — omitting it discards every built-in trust slot 0ms
     ✓ names the sandbox in a Host containment entry (default assumes an open-internet dev box) 0ms
     ✓ lists every allowlist host exactly once, from the same resolver the other consumers use 1ms
     ✓ seeds with //= so a consumer's own autoMode.environment is never overwritten 0ms
     ✓ embeds the environment list as valid JSON inside single quotes 0ms
   ✓ cloud setup scripts — the closing line names failed provision recipes (2)
     ✓ .claude: closes with $BKIT_UNAVAILABLE, after the recipes run 1ms
     ✓ .codex: closes with $BKIT_UNAVAILABLE, after the recipes run 1ms
   ✓ cloud docs — the env block never depends on the tracker (6)
     ✓ .claude: every tracker renders the same block for the same .envrc 2ms
     ✓ .cursor: every tracker renders the same block for the same .envrc 2ms
     ✓ .codex: every tracker renders the same block for the same .envrc 2ms
     ✓ .claude: no tracker key gets a placeholder; only BKIT_GH_TOKEN does 1ms
     ✓ .cursor: no tracker key gets a placeholder; only BKIT_GH_TOKEN does 1ms
     ✓ .codex: no tracker key gets a placeholder; only BKIT_GH_TOKEN does 5ms
   ✓ renderCursorContextFetchProvision (2)
     ✓ returns '' when no consumer provision blocks are declared 0ms
     ✓ surfaces the same recipes as the Claude path, pointed at environment.json install 0ms
   ✓ renderCursorNetworkAllowlist (3)
     ✓ no allowed-domains → still emits a fence carrying the shipped hosts (T13) 0ms
     ✓ declared domains → each as the domain and a *. wildcard, so its subdomains are reachable 1ms
     ✓ a declared shared hosting platform is widened too, with a note that it reaches every tenant 1ms
   ✓ cursor template generation sentinels (2)
     ✓ carries the sentinels writeCursorCloudDoc substitutes, and NO Claude-only ones 0ms
     ✓ directs secrets to the Runtime Secret / Secrets-tab path, not the Environment Variables pane 0ms
   ✓ writeCursorCloudDoc — end-to-end render (real template) (1)
     ✓ writes a sentinel-free, chmod-600 doc naming the repo 10ms
   ✓ extractCloudToolchainScript (1)
     ✓ returns the pinned Node/vale/gh/jq installs from the Claude template, markers stripped 0ms
   ✓ renderCodexNetworkAllowlist (2)
     ✓ lists the same entries as the Cursor doc under the Codex internet-access toggles 1ms
     ✓ marks the *. entries untested on Codex and names the way around a blocked host 0ms
   ✓ network allowlist count note (6)
     ✓ claude: a declared entry bkit already ships is counted once, and the numbers add up 0ms
     ✓ cursor: a declared entry bkit already ships is counted once, and the numbers add up 0ms
     ✓ codex: a declared entry bkit already ships is counted once, and the numbers add up 0ms
     ✓ claude: no overlap note when every declared entry is new 1ms
     ✓ cursor: no overlap note when every declared entry is new 0ms
     ✓ codex: no overlap note when every declared entry is new 0ms
   ✓ codex template generation sentinels (2)
     ✓ carries the sentinels writeCodexCloudDoc substitutes, and no Claude-only ones 0ms
     ✓ states the Codex mechanics: env vars vs network secrets, Personal vault, unproven hooks 0ms
   ✓ writeCodexCloudDoc — end-to-end render (real template) (4)
     ✓ writes a sentinel-free, chmod-600 doc with the resolved env block 1ms
     ✓ inlines the Claude template's toolchain pins and the consumer's corepack pnpm 1ms
     ✓ bakes the consumer's context-fetch provision recipes into the install script 1ms
     ✓ records the repo root before any toolchain step can leave it, and returns there 1ms
   ✓ extractMcpServers / resolveClaudeDerivedAllows (4)
     ✓ returns [] when context.md is absent or declares no mcp-servers block 0ms
     ✓ extracts names verbatim below bkit:end, deduped, comments and examples ignored 0ms
     ✓ an mcp-servers block does not leak into allowed-domains, nor the reverse 0ms
     ✓ derives WebFetch grants, then both Claude MCP tool-id forms per server 1ms
   ✓ writeCursorCliPermissionsArtifact — .cursor/cli.json writer (4)
     ✓ writes one Mcp(<server>:*) allow per declared server 1ms
     ✓ writes an empty allow list when no servers are declared 0ms
     ✓ regenerates over a hand edit, and is a no-op once current 0ms
     ✓ dry-run reports the pending write without touching disk 0ms
   ✓ egress registry — completeness, invariants and the anti-widening gate (9)
     ✓ T1: one opencode-provider row per provider key, ids unique, rows well-formed 0ms
     ✓ T1: every issue tracker but the 'none' sentinel has an mcp row, and 'none' was the only skip 0ms
     ✓ T2: provider rows match their baseURL host, and every host is covered by a base 0ms
     ✓ T3: no base collapses into a public suffix, a shared-tenant apex, or a single label 1ms
     ✓ T3: the gate rejects a fixture row whose base is a shared-tenant apex 0ms
     ✓ T3: every shipped base on a .dev / .app / .run TLD is on the accepted-warn list 0ms
     ✓ T5: deriveEgressEntries is pure over injected rows, sorted and deduped 0ms
     ✓ T5: the shipped exports are a strict superset of the ten hand-typed bases 0ms
     ✓ T7: unallowlistable URLs contribute nothing and none of them throws 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/install/cloud-env.test.ts > resolveCloudEnvVars > never lets BKIT_OPENAI_API_KEY into the paste block
AssertionError: expected [ 'BKIT_GH_TOKEN', …(1) ] to not include 'BKIT_OPENAI_API_KEY'
 ❯ .bkit/core/engine/install/cloud-env.test.ts:201:46
    199|     const block = renderCloudEnvBlock(res);
    200|
    201|     expect(res.included.map(([k]) => k)).not.toContain("BKIT_OPENAI_AP…
       |                                              ^
    202|     expect(block).not.toContain("BKIT_OPENAI_API_KEY");
    203|     expect(block).not.toContain("sk-openai-must-not-leak");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 100 passed (101)
   Start at  17:36:45
   Duration  174ms (tests 60%, setup 16%, import 12%, transform 11%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-pZPNCY/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
