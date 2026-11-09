Enforced: true
Red: 13
Accepted: 2
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 6, attempt 1

Plan: `docs/plans/202610/719-cloud-variants-add-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 10 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "dev subject feat(<fid>): resolves the FID via --prompt-file and the issue via the feature row" | red | failure: expected 'issues fetch --issue 363 --outbox /va…' to match /fids parse --prompt-file \S+ --json/ |
| 10 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "linear-shaped FID under the github tracker gives no-issue and no dispatch" | red | failure: expected 'false' to be 'true' // Object.is equality |
| 10 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "dev subject naming several issues is a no-FID no-op" | red | failure: expected 'false' to be 'true' // Object.is equality |
| 10 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "dev arm passes the gate for a closed issue that still carries bkit:auto" | passed-accepted | passes; accepted by the tests step: current bkit_gate already reads labels only (bkit-cloud.yml template bkit_gate), so the closed issue passes |
| 10 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "dev subject feat(ab2-12-login-retry) under jira passes bkit_dev_dispatch_guard and dispatches" | red | failure: expected 'true' to be 'false' // Object.is equality |
| 10 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "traversal FID from the subject or the merged-PR body is a no-FID no-op that writes nothing outside docs/plans/" | passed-accepted | passes; accepted by the tests step: current YAML slug allowlist already rejects ../x before any path is built |
| 11 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "tracker secrets sit in the ctx and every dispatch step env and in no job or workflow env" | red | failure: run BKIT_LINEAR_API_KEY: expected false to be true // Object.is equality |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "codex job runs only when the context job selects codex and skip is not true" | red | failure: no codex job: expected undefined to be defined |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "codex job installs dependencies before openai/codex-action" | red | failure: no codex job: expected undefined to be defined |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "codex-action is SHA-pinned with a v1 comment and codex-version is pinned under a renovate annotation" | red | failure: no codex job: expected undefined to be defined |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "codex-action passes danger-full-access, allow-bots, BKIT_OPENAI_API_KEY and the $bkit-auto prompt" | red | failure: no codex job: expected undefined to be defined |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "trust step writes a codex-home config.toml trusting the workspace" | red | failure: no codex job: expected undefined to be defined |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "filled bkit-cloud.yml passes actionlint" | red | failure: ../../../../../../../var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-cloud-lint-IbXQjv/bkit-cloud.yml:285:9: shellcheck reported issue in this script: SC2034:warning:112:39: verdict appears unused. Verify use (or export if used externally) [shellcheck] \| 285 \| run: \| \| ^~~~ : expected 1 to be +0 // Object.is equality |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "codex summary step runs under if: always() and writes action, commits and comments" | red | failure: no codex job: expected undefined to be defined |
| 12 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "opencode job installs dependencies before its dispatch step" | red | failure: no pnpm install --frozen-lockfile step: expected -1 to be greater than -1 |

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

[test-timeout-budget] load average 6.8 on 10 cores: unit limits 7900ms per test, 15800ms per hook (x1.58)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (64 tests | 4 failed) 39607ms
   ❯ bkit-cloud.yml ctx step — extracted bash (#363) (45)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 1363ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 125ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 981ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) is admitted by the FID regex, not silently no-op'd on shape alone 964ms
     ✓ T16: a Jira-shaped commit scope with a digit in the key (ab1-123-slug) no-ops — no dispatch 390ms
     ✓ feat/** path — bkit_gate outcomes (9)
       ✓ github feat run passes the gate through the real bkit and stub gh 892ms
       ✓ label removed gives label-absent, skip and a summary row 1152ms
       ✓ %s recorded fetch reply carrying bkit:auto passes the gate 1195ms
       ✓ jira marker AB2-12 dispatches 976ms
       ✓ exit 80 reason=auth with BKIT_JIRA_API_KEY empty warns naming the secret and exits green 660ms
       ✓ exit 80 reason=%s is unreadable with that reason and exits green 1012ms
       ✓ %s fetch output is unreadable reason=output-unparseable 1028ms
       ✓ absent node_modules/.bin/bkit warns bkit unavailable and exits green 347ms
       ✓ feat branch with no marker and no feature row gives no-issue 729ms
     ❯ dev path — engine parse of the squash subject and merged-PR body (6)
       × dev subject feat(<fid>): resolves the FID via --prompt-file and the issue via the feature row 1332ms
       × linear-shaped FID under the github tracker gives no-issue and no dispatch 1306ms
       × dev subject naming several issues is a no-FID no-op 1050ms
       ✓ dev arm passes the gate for a closed issue that still carries bkit:auto 995ms
       × dev subject feat(ab2-12-login-retry) under jira passes bkit_dev_dispatch_guard and dispatches 639ms
       ✓ traversal FID from the subject or the merged-PR body is a no-FID no-op that writes nothing outside docs/plans/ 490ms
     ✓ a github tracker in package.json passes the tracker gate and dispatches 868ms
     ✓ dev path — cross-session loop cap (T5) (4)
       ✓ refuses to dispatch uncounted when package.json cannot be read 846ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 695ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 623ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 816ms
     ✓ fix/** is not a routed surface (3)
       ✓ the workflow_run trigger filter covers feat/** and dev only 131ms
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 699ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 765ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 1093ms
       ✓ F3: a non-FID-shaped branch (feat/add-oauth) no-ops cleanly instead of aborting the step 727ms
       ✓ F3: a non-FID-shaped branch (feat/hotfix-login) no-ops cleanly instead of aborting the step 693ms
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 699ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 690ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 876ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 1140ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 1025ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 1024ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 1042ms
       ✓ a branch with no status.jsonl dispatches as before 970ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 809ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 1187ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 769ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 702ms
     ✓ kill switch precedes the stale-run guard: a revoked FID writes no drop telemetry 732ms
     ✓ FID recovery reads the commit SUBJECT, not a scoped line in the body 377ms
   ✓ bkit-cloud.yml summary row — jobs field from the Select hand-off (2)
     ✓ pass row's jobs field names codex:BKIT_OPENAI_API_KEY and the ignored claude job with its reason 899ms
     ✓ no-agent row's jobs field names the recorded agent's missing BKIT_ secret and the ignored secrets 894ms
   ✓ bkit-cloud.yml gate step — per-job credential detection (17)
     ✓ BKIT_ANTHROPIC_API_KEY alone enables the run 8ms
     ✓ both federation variables, no key, enable the run 8ms
     ✓ only ANTHROPIC_FEDERATION_RULE_ID set: claude job no-ops with a notice naming ANTHROPIC_ORGANIZATION_ID 8ms
     ✓ only ANTHROPIC_ORGANIZATION_ID set: claude job no-ops with a notice naming ANTHROPIC_FEDERATION_RULE_ID 8ms
     ✓ no claude credential: notice names both the secret and the federation variables 7ms
     ✓ BKIT_ANTHROPIC_API_KEY alone sets enabled true 7ms
     ✓ BKIT_OPENCODE_API_KEY alone sets enabled true 7ms
     ✓ BKIT_OPENROUTER_API_KEY alone sets enabled true 7ms
     ✓ BKIT_OLLAMA_API_KEY alone sets enabled true 7ms
     ✓ BKIT_OPENAI_API_KEY alone sets enabled true 7ms
     ✓ enabled is true when any agent BKIT_ secret is set and false when none is 49ms
     ✓ absent bkit.cloud.agent selects no job and the notice names bkit install --auto= 10ms
     ✓ recorded claude with BKIT_ANTHROPIC_API_KEY selects only the claude job 10ms
     ✓ recorded codex selects only codex while BKIT_ANTHROPIC_API_KEY is also set 11ms
     ✓ recorded agent without its secret selects no job and names the missing secret 11ms
     ✓ recorded cursor selects no router job 11ms
     ✓ recorded none selects no router job 10ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > dev path — engine parse of the squash subject and merged-PR body > dev subject feat(<fid>): resolves the FID via --prompt-file and the issue via the feature row
AssertionError: expected 'issues fetch --issue 363 --outbox /va…' to match /fids parse --prompt-file \S+ --json/

- Expected:
/fids parse --prompt-file \S+ --json/

+ Received:
"issues fetch --issue 363 --outbox /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/tmp.2L4THb17kJ --json
"

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:632:25
    630|       expect(result.outputs.arg).toBe(FID);
    631|       const bkitCalls = fs.readFileSync(bkitLog, "utf8");
    632|       expect(bkitCalls).toMatch(/fids parse --prompt-file \S+ --json/);
       |                         ^
    633|       expect(bkitCalls).toContain(`--branch feat/${FID}`);
    634|       const ghCalls = fs.readFileSync(ghLog, "utf8");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > dev path — engine parse of the squash subject and merged-PR body > linear-shaped FID under the github tracker gives no-issue and no dispatch
AssertionError: expected 'false' to be 'true' // Object.is equality

Expected: "true"
Received: "false"

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:647:35
    645|       });
    646|       expect(result.status, result.stderr).toBe(0);
    647|       expect(result.outputs.skip).toBe("true");
       |                                   ^
    648|       expect(result.outputs.phase).toBeUndefined();
    649|       expect(result.stdout).toContain("no-issue");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > dev path — engine parse of the squash subject and merged-PR body > dev subject naming several issues is a no-FID no-op
AssertionError: expected 'false' to be 'true' // Object.is equality

Expected: "true"
Received: "false"

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:661:35
    659|       );
    660|       expect(result.status, result.stderr).toBe(0);
    661|       expect(result.outputs.skip).toBe("true");
       |                                   ^
    662|       expect(result.outputs.phase).toBeUndefined();
    663|       expect(readStatusRows(fixture.workspaceDir, FID)).toEqual([]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > dev path — engine parse of the squash subject and merged-PR body > dev subject feat(ab2-12-login-retry) under jira passes bkit_dev_dispatch_guard and dispatches
AssertionError: expected 'true' to be 'false' // Object.is equality

Expected: "false"
Received: "true"

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:689:35
    687|       });
    688|       expect(result.status, result.stderr).toBe(0);
    689|       expect(result.outputs.skip).toBe("false");
       |                                   ^
    690|       expect(result.outputs.phase).toBe("debug");
    691|       expect(result.outputs.arg).toBe(jiraFid);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 60 passed (64)
   Start at  13:16:34
   Duration  39.72s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-msX504/junit.xml
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

[test-timeout-budget] load average 4.7 on 10 cores: unit limits 6851ms per test, 13701ms per hook (x1.37)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

(node:58295) Warning: Keys with collection values will be stringified due to JS Object restrictions: "{ NODE_VERSION }". Set mapAsMap: true to use object keys.
(Use `node --trace-warnings ...` to show where the warning was created)
 ❯ .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts (30 tests | 9 failed) 187ms
   ✓ bkit-cloud.yml template — GitHub-only content (8)
     ✓ carries id-token: write, GitHub MCP only and the tracker read keys in the context step 1ms
     ✓ claude job reads secrets.BKIT_ANTHROPIC_API_KEY and no step names secrets.ANTHROPIC_API_KEY 0ms
     ✓ opencode dispatch maps each provider BKIT_ secret to its own env name 0ms
     ✓ context checkout ref is the workflow_run head branch on feat/** and dev for dev runs and workflow_dispatch 4ms
     ✓ claude step passes the four workload identity federation inputs from repo variables 0ms
     ✓ every job's runs-on is the {{CLOUD_RUNNER}} placeholder the consumer fills in 1ms
     ✓ one context job resolves phase + arg; both runner jobs need it and read its outputs 0ms
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
   ❯ bkit-cloud.yml template — dispatch jobs (9)
     × tracker secrets sit in the ctx and every dispatch step env and in no job or workflow env 3ms
     × codex job runs only when the context job selects codex and skip is not true 0ms
     × codex job installs dependencies before openai/codex-action 0ms
     × codex-action is SHA-pinned with a v1 comment and codex-version is pinned under a renovate annotation 0ms
     × codex-action passes danger-full-access, allow-bots, BKIT_OPENAI_API_KEY and the $bkit-auto prompt 0ms
     × trust step writes a codex-home config.toml trusting the workspace 0ms
     × filled bkit-cloud.yml passes actionlint 147ms
     × codex summary step runs under if: always() and writes action, commits and comments 0ms
     × opencode job installs dependencies before its dispatch step 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 9 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts > bkit-cloud.yml template — dispatch jobs > tracker secrets sit in the ctx and every dispatch step env and in no job or workflow env
AssertionError: run BKIT_LINEAR_API_KEY: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts:433:81
    431|     expect(dispatch.map(([id]) => id).sort()).toEqual(expect.arrayCont…
    432|     for (const [id, st] of dispatch) {
    433|       for (const name of secrets) expect(mapped(st.env, name), `${id} …
       |                                                                                 ^
    434|     }
    435|     for (const [id, job] of Object.entries(doc.jobs)) {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/9]⎯

 FAIL  .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts > bkit-cloud.yml template — dispatch jobs > codex job runs only when the context job selects codex and skip is not true
AssertionError: no codex job: expected undefined to be defined
 ❯ codexJob .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts:413:33
    411|   const codexJob = (): CloudJob => {
    412|     const job = doc.jobs.codex;
    413|     expect(job, "no codex job").toBeDefined();
       |                                 ^
    414|     return job!;
    415|   };
 ❯ .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts:442:17

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/9]⎯

 FAIL  .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts > bkit-cloud.yml template — dispatch jobs > codex job installs dependencies before openai/codex-action
AssertionError: no codex job: expected undefined to be defined
 ❯ codexJob .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts:413:33
    411|   const codexJob = (): CloudJob => {
    412|     const job = doc.jobs.codex;
    413|     expect(job, "no codex job").toBeDefined();
       |                                 ^
    414|     return job!;
    415|   };
 ❯ .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts:451:17

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/9]⎯

 FAIL  .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts > bkit-cloud.yml template — dispatch jobs > codex-action is SHA-pinned with a v1 comment and codex-version is pinned under a renovate annotation
AssertionError: no codex job: expected undefined to be defined
 ❯ codexJob .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts:413:33
    411|   const codexJob = (): CloudJob => {
    412|     const job = doc.jobs.codex;
    413|     expect(job, "no codex job").toBeDefined();
       |                                 ^
    414|     return job!;
    415|   };
 ❯ .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts:464:20

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/9]⎯

 FAIL  .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts > bkit-cloud.yml template — dispatch jobs > codex-action passes danger-full-access, allow-bots, BKIT_OPENAI_API_KEY and the $bkit-auto prompt
AssertionError: no codex job: expected undefined to be defined
 ❯ codexJob .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts:413:33
    411|   const codexJob = (): CloudJob => {
    412|     const job = doc.jobs.codex;
    413|     expect(job, "no codex job").toBeDefined();
       |                                 ^
    414|     return job!;
    415|   };
 ❯ .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts:475:20

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/9]⎯

 FAIL  .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts > bkit-cloud.yml template — dispatch jobs > trust step writes a codex-home config.toml trusting the workspace
AssertionError: no codex job: expected undefined to be defined
 ❯ codexJob .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts:413:33
    411|   const codexJob = (): CloudJob => {
    412|     const job = doc.jobs.codex;
    413|     expect(job, "no codex job").toBeDefined();
       |                                 ^
    414|     return job!;
    415|   };
 ❯ .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts:489:18

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/9]⎯

 FAIL  .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts > bkit-cloud.yml template — dispatch jobs > filled bkit-cloud.yml passes actionlint
AssertionError: ../../../../../../../var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-cloud-lint-IbXQjv/bkit-cloud.yml:285:9: shellcheck reported issue in this script: SC2034:warning:112:39: verdict appears unused. Verify use (or export if used externally) [shellcheck]
    |
285 |         run: |
    |         ^~~~
: expected 1 to be +0 // Object.is equality

- Expected
+ Received

- 0
+ 1

 ❯ .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts:525:50
    523|       fs.writeFileSync(file, filled);
    524|       const r = spawnSync("actionlint", ["-no-color", file], { encodin…
    525|       expect(r.status, `${r.stdout}${r.stderr}`).toBe(0);
       |                                                  ^
    526|     } finally {
    527|       fs.rmSync(dir, { recursive: true, force: true });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/9]⎯

 FAIL  .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts > bkit-cloud.yml template — dispatch jobs > codex summary step runs under if: always() and writes action, commits and comments
AssertionError: no codex job: expected undefined to be defined
 ❯ codexJob .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts:413:33
    411|   const codexJob = (): CloudJob => {
    412|     const job = doc.jobs.codex;
    413|     expect(job, "no codex job").toBeDefined();
       |                                 ^
    414|     return job!;
    415|   };
 ❯ .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts:532:17

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/9]⎯

 FAIL  .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts > bkit-cloud.yml template — dispatch jobs > opencode job installs dependencies before its dispatch step
AssertionError: no pnpm install --frozen-lockfile step: expected -1 to be greater than -1
 ❯ .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts:585:63
    583|     );
    584|     expect(dispatch, "no opencode dispatch step").toBeGreaterThan(-1);
    585|     expect(install, "no pnpm install --frozen-lockfile step").toBeGrea…
       |                                                               ^
    586|     expect(install).toBeLessThan(dispatch);
    587|     const before = job.steps.slice(0, install);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/9]⎯


 Test Files  1 failed (1)
      Tests  9 failed | 21 passed (30)
   Start at  13:17:15
   Duration  308ms (tests 79%, import 11%, setup 8%, transform 2%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-aYPCRd/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
