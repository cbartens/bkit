Enforced: true
Verdict: null
Gaps: 2
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/719-cloud-variants-add-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "github fetch marks a closed issue terminal and an open one not" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "linear fetch marks a completed state renamed Shipped terminal" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "linear fetch marks a canceled state terminal and a started state not" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "jira fetch marks a done-category status renamed Shipped terminal and an indeterminate one not" | red | passed |
| 1 | `.bkit/core/engine/commands/workflow/issues.test.ts` "fetch prints terminal in its facts and in issue-facts.json" | red | passed |
| 2 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "github issue without bkit:auto stops the Cursor background session" | red | passed |
| 2 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "github closed issue stops the session and an open labelled one passes" | red | passed |
| 2 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "github read failure stops the session naming the tracker and the reason" | red | passed |
| 2 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "linear completed state renamed Shipped stops the session" | red | passed |
| 2 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "generated Claude and Cursor hooks carry the one preflight-tracker.sh part" | red | passed |
| 3 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "jira terminal issue stops the Cursor background session" | red | passed |
| 3 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "jira session without node_modules/.bin/bkit stops naming the missing bin" | red | passed |
| 3 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "jira fetch %s stops the session naming the tracker and the reason" | red | passed |
| 3 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "%s session with no issue id records bkit:auto not verified and exits 0" | red | passed |
| 3 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "Claude session carrying GITHUB_ISSUE_ID runs the tracker guard" | red | passed |
| 3 | `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` "unset tracker without LINEAR_ISSUE_ID adds advisory context and exits 0" | red | passed |
| 4 | `.bkit/core/engine/install/manifest.test.ts` "parseCloudAgents accepts codex" | red | passed |
| 4 | `.bkit/core/engine/cli.test.ts` "--auto=codex parses to the codex cloud variant" | red | passed |
| 4 | `.bkit/core/engine/cli.test.ts` "--auto=<bad> lists claude, cursor, opencode and codex" | red | passed |
| 5 | `.bkit/core/engine/install/modules/cloud.integration.test.ts` "codex variant advisory names --codex, .codex/bkit-cloud.md and BKIT_OPENAI_API_KEY" | red | passed |
| 5 | `.bkit/core/engine/install/modules/cloud.integration.test.ts` "%s variant under %s names only that tracker's key" | red | passed |
| 5 | `.bkit/core/engine/install/modules/cloud.integration.test.ts` "claude variant advisory names BKIT_ANTHROPIC_API_KEY or the federation variables" | red | passed |
| 5 | `.bkit/core/engine/install/modules/cloud.integration.test.ts` "opencode variant advisory names the configured provider's BKIT_ key" | red | passed |
| 5 | `.bkit/core/engine/audits/templates/templates-content.test.ts` "vendor API keys are BKIT_-prefixed" | red | passed |
| 6 | `.bkit/core/engine/commands/install/install.test.ts` "validateCloudTrackerWired passes %s with %s" | red | passed |
| 6 | `.bkit/core/engine/commands/install/install.test.ts` "validateCloudTrackerWired refuses tracker none naming --tracker=" | red | passed |
| 6 | `.bkit/core/engine/commands/install/install.integration.test.ts` "--auto=codex without .codex/ exits 1 naming --codex and writes nothing" | red | passed |
| 6 | `.bkit/core/engine/commands/install/install.integration.test.ts` "--tracker=jira --codex --auto=codex exits 0 and records codex" | passed-accepted | passed |
| 6 | `.bkit/core/engine/commands/install/install.integration.test.ts` "--tracker=github --auto=cursor exits 0 and records cursor" | red | passed |
| 6 | `.bkit/core/engine/commands/install/install.integration.test.ts` "--tracker=github --opencode --auto=opencode in one run exits 0 and records opencode" | red | passed |
| 19 | `.bkit/core/engine/commands/install/install.integration.test.ts` "--tracker=jira --codex --auto=codex exits 0 and records codex" | passed-accepted | passed |
| 7 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "enabled is true when any agent BKIT_ secret is set and false when none is" | red-not-loaded | passed |
| 7 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "absent bkit.cloud.agent selects no job and the notice names bkit install --auto=" | red-not-loaded | passed |
| 7 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "recorded claude with BKIT_ANTHROPIC_API_KEY selects only the claude job" | red-not-loaded | passed |
| 7 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "recorded codex selects only codex while BKIT_ANTHROPIC_API_KEY is also set" | red-not-loaded | passed |
| 7 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "recorded agent without its secret selects no job and names the missing secret" | red-not-loaded | passed |
| 7 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "recorded %s selects no router job" | red-not-loaded | not passed |
| 7 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "claude job reads secrets.BKIT_ANTHROPIC_API_KEY and no step names secrets.ANTHROPIC_API_KEY" | red | passed |
| 7 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "opencode dispatch maps each provider BKIT_ secret to its own env name" | red | passed |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "github feat run passes the gate through the real bkit and stub gh" | red | passed |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "label removed gives label-absent, skip and a summary row" | red | passed |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "%s recorded fetch reply carrying bkit:auto passes the gate" | red | passed |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "jira marker AB2-12 dispatches" | red | passed |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "exit 80 reason=auth with BKIT_JIRA_API_KEY empty warns naming the secret and exits green" | red | passed |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "exit 80 reason=%s is unreadable with that reason and exits green" | red | passed |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "%s fetch output is unreadable reason=output-unparseable" | red | passed |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "absent node_modules/.bin/bkit warns bkit unavailable and exits green" | red | passed |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "feat branch with no marker and no feature row gives no-issue" | red | passed |
| 8 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "context checkout ref is the workflow_run head branch on feat/** and dev for dev runs and workflow_dispatch" | red | passed |
| 9 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "pass row's jobs field names codex:BKIT_OPENAI_API_KEY and the ignored claude job with its reason" | red | passed |
| 9 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "no-agent row's jobs field names the recorded agent's missing BKIT_ secret and the ignored secrets" | red | passed |
| 10 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "dev subject feat(<fid>): resolves the FID via --prompt-file and the issue via the feature row" | red | passed |
| 10 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "linear-shaped FID under the github tracker gives no-issue and no dispatch" | red | passed |
| 10 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "dev subject naming several issues is a no-FID no-op" | red | passed |
| 10 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "dev arm passes the gate for a closed issue that still carries bkit:auto" | passed-accepted | passed |
| 10 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "dev subject feat(ab2-12-login-retry) under jira passes bkit_dev_dispatch_guard and dispatches" | red | passed |
| 10 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "traversal FID from the subject or the merged-PR body is a no-FID no-op that writes nothing outside docs/plans/" | passed-accepted | passed |
| 11 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "tracker secrets sit in the ctx and every dispatch step env and in no job or workflow env" | red | passed |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "codex job runs only when the context job selects codex and skip is not true" | red | passed |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "codex job installs dependencies before openai/codex-action" | red | passed |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "codex-action is SHA-pinned with a v1 comment and codex-version is pinned under a renovate annotation" | red | passed |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "codex-action passes danger-full-access, allow-bots, BKIT_OPENAI_API_KEY and the $bkit-auto prompt" | red | passed |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "trust step writes a codex-home config.toml trusting the workspace" | red | passed |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "filled bkit-cloud.yml passes actionlint" | red | passed |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "codex summary step runs under if: always() and writes action, commits and comments" | red | passed |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "opencode job installs dependencies before its dispatch step" | red | passed |
| 13 | `.bkit/core/engine/checks/after/github.test.ts` "adopted copy serving the GitHub tracker only under %s gives cloud-router-tracker-stale" | red | passed |
| 13 | `.bkit/core/engine/checks/after/github.test.ts` "adopted copy without openai/codex-action under cloud.agent codex gives cloud-router-codex-missing" | red | passed |
| 13 | `.bkit/core/engine/checks/after/github.test.ts` "missing id-token wins over tracker-stale and tracker-stale over codex-missing" | red | passed |
| 13 | `.bkit/core/engine/checks/after/github.test.ts` "cloud-claude-missing-id-token action names the template re-copy, not --tracker=github" | red | passed |
| 13 | `.bkit/core/engine/checks/after/github.test.ts` "jira tracker without a router gets the tracker-neutral cloud-router-none nudge" | red | passed |
| 13 | `.bkit/core/engine/checks/after/github.test.ts` "cloud-router advisory names the Claude GitHub App only for cloud.agent claude" | red | passed |
| 13 | `.bkit/core/engine/checks/after/github.test.ts` "adopted router with no bkit.cloud.agent gives cloud-router-agent-unset naming bkit install --auto=" | red | passed |
| 14 | `.bkit/core/engine/checks/after/auth.test.ts` "%s tracker without its BKIT_ secret gives cloud-router-tracker-secret-missing naming it" | red | passed |
| 14 | `.bkit/core/engine/checks/after/auth.test.ts` "cloud.agent codex without BKIT_OPENAI_API_KEY gives codex-api-key-secret-missing" | red | passed |
| 14 | `.bkit/core/engine/checks/after/auth.test.ts` "anthropic findings fire only for cloud.agent claude, under BKIT_ANTHROPIC_API_KEY" | red | passed |
| 14 | `.bkit/core/engine/checks/after/auth.test.ts` "legacy ANTHROPIC_API_KEY without BKIT_ANTHROPIC_API_KEY gives cloud-router-secret-renamed" | red | passed |
| 14 | `.bkit/core/engine/checks/after/auth.test.ts` "legacy OPENCODE_PROVIDER_KEY without the provider key gives cloud-router-secret-renamed naming that key" | red | passed |
| 14 | `.bkit/core/engine/checks/after/auth.test.ts` "dashboards router section names the recorded variant's BKIT_ secret" | red | passed |
| 14 | `.bkit/core/engine/checks/after/auth.test.ts` "adopted copy still reading legacy secret names gets legacy-name findings and no cloud-router-secret-renamed" | red | passed |
| 15 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "cloud tip names the Claude GitHub App and BKIT_ANTHROPIC_API_KEY only for cloud.agent claude" | red | passed |
| 15 | `.bkit/core/engine/checks/tips/catalogue.test.ts` "cloud tip for codex names --codex and BKIT_OPENAI_API_KEY" | red | passed |
| 21 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "exit 80 reason=auth with BKIT_JIRA_API_KEY set names the secret but never prints its value" | red | passed |
| 22 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "dev arm with absent node_modules/.bin/bkit warns bkit unavailable and exits green" | red | passed |
| 23 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "context job installs and runs bkit from dev, never from the feat/** PR head" | red | passed |
| 24 | `.bkit/core/engine/install/cloud-env.test.ts` "never lets BKIT_OPENAI_API_KEY into the paste block" | red | passed |
| 25 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "context job tooling setup steps before Install bkit cannot fail the job" | red | passed |
| 26 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "Select agent job dispatches the agent recorded on dev for a feat branch that predates the recording" | red | passed |

## Gaps

- Task 7 `not-green` — the named test "recorded %s selects no router job" did not run; the report holds "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > dev CI failure dispatches debug with FID recovered from the squash-merge commit scope", "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > dev CI success is a no-op — skip=true, no dispatch, no counter write", "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash", "bkit-cloud.yml ctx step — extracted bash (#363) > T16: a Linear-shaped commit scope (bar-123-slug) under the linear tracker dispatches", "bkit-cloud.yml ctx step — extracted bash (#363) > T16: a Jira-shaped commit scope under the github tracker has no issue — no dispatch", … — Fixable: true — log: TASK 7: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `recorded %s selects no router job` — not-green — Fixable: true
- Task 2 `delete-still-referenced` — DELETE `.bkit/core/hooks/preflight-linear.sh` is still referenced as `preflight-linear`: `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts:502`, `docs/audits/202611/deferrals.md:422`, `docs/decisions.jsonl:421`, `docs/deferrals.jsonl:132`, `docs/deferrals.jsonl:71`, and 2 more — Fixable: null — log: TASK 2: delete-still-referenced — Fixable: null

## Already landed

- Task 6 `.bkit/core/engine/commands/install/install.integration.test.ts` "--tracker=jira --codex --auto=codex exits 0 and records codex" — passed at the group's red, and the tests step accepted it: the implementation already satisfies the planned behavior; the current engine run in build-tests-red-3-2.md passed all 62 install integration tests. The test reaches the real install and retains all corrected behavior assertions. Preserved source, test and earlier red evidence rather than inventing a new failure.; no red is due
- Task 19 `.bkit/core/engine/commands/install/install.integration.test.ts` "--tracker=jira --codex --auto=codex exits 0 and records codex" — passed at the group's red, and the tests step accepted it: existing runCodexModule writes .codex/hooks.json; the task corrects only the stale footprint filename while retaining exit 0, tracker jira and cloud agent codex assertions. The full integration file passed 62 tests; targeted lint, formatting and git diff --check passed. Existing implementation and prior red evidence were preserved.; no red is due
- Task 10 `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "dev arm passes the gate for a closed issue that still carries bkit:auto" — passed at the group's red, and the tests step accepted it: current bkit_gate already reads labels only (bkit-cloud.yml template bkit_gate), so the closed issue passes; no red is due
- Task 10 `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "traversal FID from the subject or the merged-PR body is a no-FID no-op that writes nothing outside docs/plans/" — passed at the group's red, and the tests step accepted it: current YAML slug allowlist already rejects ../x before any path is built; no red is due

## Runner output — `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`

```
       ✓ dev subject feat(ab2-12-login-retry) under jira passes bkit_dev_dispatch_guard and dispatches 952ms
       ✓ traversal FID from the subject or the merged-PR body is a no-FID no-op that writes nothing outside docs/plans/ 1633ms
     ✓ a github tracker in package.json passes the tracker gate and dispatches 1246ms
     ✓ dev path — cross-session loop cap (T5) (4)
       ✓ refuses to dispatch uncounted when package.json cannot be read 501ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 1184ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 767ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 1805ms
     ✓ fix/** is not a routed surface (3)
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 537ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 527ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 746ms
       ✓ F3: a non-FID-shaped branch (feat/add-oauth) no-ops cleanly instead of aborting the step 534ms
       ✓ F3: a non-FID-shaped branch (feat/hotfix-login) no-ops cleanly instead of aborting the step 549ms
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 589ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 526ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 792ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 886ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 900ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 918ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 1141ms
       ✓ a branch with no status.jsonl dispatches as before 770ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 960ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 1770ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 1020ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 1011ms
     ✓ kill switch precedes the stale-run guard: a revoked FID writes no drop telemetry 985ms
     ✓ FID recovery reads the commit SUBJECT, not a scoped line in the body 746ms
   ✓ bkit-cloud.yml summary row — jobs field from the Select hand-off (2)
     ✓ pass row's jobs field names codex:BKIT_OPENAI_API_KEY and the ignored claude job with its reason 792ms
     ✓ no-agent row's jobs field names the recorded agent's missing BKIT_ secret and the ignored secrets 768ms

 Test Files  1 passed (1)
      Tests  67 passed (67)
   Start at  20:47:44
   Duration  39.84s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-pMthpA/junit.xml
```
