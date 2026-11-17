Enforced: true
Red: 2
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 11, attempt 1

Plan: `docs/plans/202610/719-cloud-variants-add-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 25 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "context job tooling setup steps before Install bkit cannot fail the job" | red | failure: pnpm/action-setup@ea17c68df8912ef543352723c149a84f56e3d413 can fail the context job: expected undefined to be true // Object.is equality |
| 26 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "Select agent job dispatches the agent recorded on dev for a feat branch that predates the recording" | red | failure: expected 'agent=none\nclaude=false\nopencode=fa…' to match /^codex=true$/m |

## Gaps

None.

## Lint output — `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts

[test-timeout-budget] load average 3.0 on 10 cores: unit limits 6000ms per test, 12000ms per hook (x1.20)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

(node:96993) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ NODE_VERSION }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
(node:96993) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ NODE_VERSION }". Set mapAsMap: true to use object keys.
(node:96993) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ NODE_VERSION }". Set mapAsMap: true to use object keys.
(node:96993) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ NODE_VERSION }". Set mapAsMap: true to use object keys.
 ❯ .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts (33 tests | 1 failed) 293ms
   ❯ bkit-cloud.yml template — GitHub-only content (11)
     ✓ carries id-token: write, GitHub MCP only and the tracker read keys in the context step 1ms
     ✓ claude job reads secrets.BKIT_ANTHROPIC_API_KEY and no step names secrets.ANTHROPIC_API_KEY 0ms
     ✓ opencode dispatch maps each provider BKIT_ secret to its own env name 0ms
     ✓ context checkout ref is the workflow_run head branch on feat/** and dev for dev runs and workflow_dispatch 6ms
     ✓ context job installs and runs bkit from dev, never from the feat/** PR head 5ms
     × context job tooling setup steps before Install bkit cannot fail the job 6ms
     ✓ context job runs the workspace-root checkout before every nested `path:` checkout 4ms
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
     ✓ bkit-ci.yml template does NOT set both `with.version:` and rely on packageManager (KN-3) 0ms
     ✓ bkit's own .github/workflows/bkit-ci.yml does NOT set `with.version:` for pnpm action (KN-3) 0ms
   ✓ Challenge Finding 1 — SHARED-DERIV portability and pipefail safety regression (4)
     ✓ (1a) canonical bkit-cloud.yml contains NO grep -oP (PCRE lookbehind) — portability regression guard 0ms
     ✓ (1a) template bkit-cloud.yml contains NO grep -oP (PCRE lookbehind) — portability regression guard 0ms
     ✓ (1b) feat-arm FID/ISSUE parse lines in canonical and template carry a || true failure guard (pipefail safety) 0ms
     ✓ (1c) the FID/ISSUE extraction lines exit 0 under set -euo pipefail on an empty parse and read a recorded parse (real-tool validation) 28ms
   ✓ bkit-cloud.yml template — dispatch jobs (9)
     ✓ tracker secrets sit in the ctx and every dispatch step env and in no job or workflow env 3ms
     ✓ codex job runs only when the context job selects codex and skip is not true 0ms
     ✓ codex job installs dependencies before openai/codex-action 0ms
     ✓ codex-action is SHA-pinned with a v1 comment and codex-version is pinned under a renovate annotation 0ms
     ✓ codex-action passes danger-full-access, allow-bots, BKIT_OPENAI_API_KEY and the $bkit-auto prompt 0ms
     ✓ trust step writes a codex-home config.toml trusting the workspace 11ms
     ✓ filled bkit-cloud.yml passes actionlint 162ms
     ✓ codex summary step runs under if: always() and writes action, commits and comments 63ms
     ✓ opencode job installs dependencies before its dispatch step 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts > bkit-cloud.yml template — GitHub-only content > context job tooling setup steps before Install bkit cannot fail the job
AssertionError: pnpm/action-setup@ea17c68df8912ef543352723c149a84f56e3d413 can fail the context job: expected undefined to be true // Object.is equality

- Expected:
true

+ Received:
undefined

 ❯ .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts:151:78
    149|     expect(tooling.length, "no pnpm / setup-node step before Install b…
    150|     for (const st of tooling) {
    151|       expect(st["continue-on-error"], `${st.uses} can fail the context…
       |                                                                              ^
    152|     }
    153|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 32 passed (33)
   Start at  20:04:44
   Duration  389ms (tests 87%, import 6%, setup 5%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-18YI4H/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts

[test-timeout-budget] load average 3.0 on 10 cores: unit limits 6000ms per test, 12000ms per hook (x1.20)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (67 tests | 1 failed) 39429ms
   ✓ bkit-cloud.yml ctx step — extracted bash (#363) (47)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 1085ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 129ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 851ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) under the linear tracker dispatches 952ms
     ✓ T16: a Jira-shaped commit scope under the github tracker has no issue — no dispatch 647ms
     ✓ feat/** path — bkit_gate outcomes (10)
       ✓ github feat run passes the gate through the real bkit and stub gh 779ms
       ✓ label removed gives label-absent, skip and a summary row 764ms
       ✓ %s recorded fetch reply carrying bkit:auto passes the gate 855ms
       ✓ jira marker AB2-12 dispatches 621ms
       ✓ exit 80 reason=auth with BKIT_JIRA_API_KEY empty warns naming the secret and exits green 586ms
       ✓ exit 80 reason=auth with BKIT_JIRA_API_KEY set names the secret but never prints its value 577ms
       ✓ exit 80 reason=%s is unreadable with that reason and exits green 846ms
       ✓ %s fetch output is unreadable reason=output-unparseable 801ms
       ✓ absent node_modules/.bin/bkit warns bkit unavailable and exits green 299ms
       ✓ feat branch with no marker and no feature row gives no-issue 573ms
     ✓ dev path — engine parse of the squash subject and merged-PR body (7)
       ✓ dev subject feat(<fid>): resolves the FID via --prompt-file and the issue via the feature row 1476ms
       ✓ linear-shaped FID under the github tracker gives no-issue and no dispatch 623ms
       ✓ dev subject naming several issues is a no-FID no-op 749ms
       ✓ dev arm with absent node_modules/.bin/bkit warns bkit unavailable and exits green 131ms
       ✓ dev arm passes the gate for a closed issue that still carries bkit:auto 929ms
       ✓ dev subject feat(ab2-12-login-retry) under jira passes bkit_dev_dispatch_guard and dispatches 930ms
       ✓ traversal FID from the subject or the merged-PR body is a no-FID no-op that writes nothing outside docs/plans/ 1555ms
     ✓ a github tracker in package.json passes the tracker gate and dispatches 1190ms
     ✓ dev path — cross-session loop cap (T5) (4)
       ✓ refuses to dispatch uncounted when package.json cannot be read 560ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 934ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 819ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 1312ms
     ✓ fix/** is not a routed surface (3)
       ✓ the workflow_run trigger filter covers feat/** and dev only 117ms
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 567ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 597ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 798ms
       ✓ F3: a non-FID-shaped branch (feat/add-oauth) no-ops cleanly instead of aborting the step 577ms
       ✓ F3: a non-FID-shaped branch (feat/hotfix-login) no-ops cleanly instead of aborting the step 560ms
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 568ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 570ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 807ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 886ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 950ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 914ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 913ms
       ✓ a branch with no status.jsonl dispatches as before 771ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 998ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 1316ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 1194ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 1093ms
     ✓ kill switch precedes the stale-run guard: a revoked FID writes no drop telemetry 949ms
     ✓ FID recovery reads the commit SUBJECT, not a scoped line in the body 714ms
   ✓ bkit-cloud.yml summary row — jobs field from the Select hand-off (2)
     ✓ pass row's jobs field names codex:BKIT_OPENAI_API_KEY and the ignored claude job with its reason 861ms
     ✓ no-agent row's jobs field names the recorded agent's missing BKIT_ secret and the ignored secrets 939ms
   ❯ bkit-cloud.yml Select agent job — routing config source (1)
     × Select agent job dispatches the agent recorded on dev for a feat branch that predates the recording 14ms
   ✓ bkit-cloud.yml gate step — per-job credential detection (17)
     ✓ BKIT_ANTHROPIC_API_KEY alone enables the run 8ms
     ✓ both federation variables, no key, enable the run 7ms
     ✓ only ANTHROPIC_FEDERATION_RULE_ID set: claude job no-ops with a notice naming ANTHROPIC_ORGANIZATION_ID 7ms
     ✓ only ANTHROPIC_ORGANIZATION_ID set: claude job no-ops with a notice naming ANTHROPIC_FEDERATION_RULE_ID 7ms
     ✓ no claude credential: notice names both the secret and the federation variables 7ms
     ✓ BKIT_ANTHROPIC_API_KEY alone sets enabled true 7ms
     ✓ BKIT_OPENCODE_API_KEY alone sets enabled true 7ms
     ✓ BKIT_OPENROUTER_API_KEY alone sets enabled true 7ms
     ✓ BKIT_OLLAMA_API_KEY alone sets enabled true 7ms
     ✓ BKIT_OPENAI_API_KEY alone sets enabled true 7ms
     ✓ enabled is true when any agent BKIT_ secret is set and false when none is 48ms
     ✓ absent bkit.cloud.agent selects no job and the notice names bkit install --auto= 11ms
     ✓ recorded claude with BKIT_ANTHROPIC_API_KEY selects only the claude job 12ms
     ✓ recorded codex selects only codex while BKIT_ANTHROPIC_API_KEY is also set 11ms
     ✓ recorded agent without its secret selects no job and names the missing secret 11ms
     ✓ recorded cursor selects no router job 10ms
     ✓ recorded none selects no router job 10ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml Select agent job — routing config source > Select agent job dispatches the agent recorded on dev for a feat branch that predates the recording
AssertionError: expected 'agent=none\nclaude=false\nopencode=fa…' to match /^codex=true$/m

- Expected:
/^codex=true$/m

+ Received:
"agent=none
claude=false
opencode=false
codex=false
dispatched=
ignored=codex
"

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:1350:19
    1348|       expect(res.status, res.stderr).toBe(0);
    1349|       const out = fs.readFileSync(outputFile, "utf8");
    1350|       expect(out).toMatch(/^codex=true$/m);
       |                   ^
    1351|       expect(out).toMatch(/^dispatched=codex$/m);
    1352|       expect(res.stdout).not.toContain("Run bkit install --auto=");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 66 passed (67)
   Start at  20:04:45
   Duration  39.53s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-8wozwR/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
