Enforced: true
Red: 9
Accepted: 0
Updated: 0
Gaps: 3

<!-- verdict:end -->

# Tests Red — group 5, attempt 1

Plan: `docs/plans/202610/719-cloud-variants-add-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "github feat run passes the gate through the real bkit and stub gh" | red | failure: expected 'pr list --head feat/363-widen-bkit-cl…' to match /api repos\/[^ ]*\/issues\/363/[^ ]*\ |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "label removed gives label-absent, skip and a summary row" | red | failure: expected '::notice::Issue #363 no longer carrie…' to contain 'label-absent' |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "%s recorded fetch reply carrying bkit:auto passes the gate" | missing | "%s recorded fetch reply carrying bkit:auto passes the gate" did not run; the report holds "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > dev CI failure dispatches debug with FID recovered from the squash-merge commit scope", "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > dev CI success is a no-op — skip=true, no dispatch, no counter write", "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash", "bkit-cloud.yml ctx step — extracted bash (#363) > T16: a Linear-shaped commit scope (bar-123-slug) is admitted by the FID regex, not silently no-op'd on shape alone", "bkit-cloud.yml ctx step — extracted bash (#363) > T16: a Jira-shaped commit scope with a digit in the key (ab1-123-slug) no-ops — no dispatch", … |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "jira marker AB2-12 dispatches" | red | failure: expected 'true' to be 'false' // Object.is equality |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "exit 80 reason=auth with BKIT_JIRA_API_KEY empty warns naming the secret and exits green" | red | failure: expected '::notice::bkit.tracker.default is \'j…' to contain '::warning::' |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "exit 80 reason=%s is unreadable with that reason and exits green" | missing | "exit 80 reason=%s is unreadable with that reason and exits green" did not run; the report holds "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > dev CI failure dispatches debug with FID recovered from the squash-merge commit scope", "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > dev CI success is a no-op — skip=true, no dispatch, no counter write", "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash", "bkit-cloud.yml ctx step — extracted bash (#363) > T16: a Linear-shaped commit scope (bar-123-slug) is admitted by the FID regex, not silently no-op'd on shape alone", "bkit-cloud.yml ctx step — extracted bash (#363) > T16: a Jira-shaped commit scope with a digit in the key (ab1-123-slug) no-ops — no dispatch", … |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "%s fetch output is unreadable reason=output-unparseable" | missing | "%s fetch output is unreadable reason=output-unparseable" did not run; the report holds "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > dev CI failure dispatches debug with FID recovered from the squash-merge commit scope", "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > dev CI success is a no-op — skip=true, no dispatch, no counter write", "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash", "bkit-cloud.yml ctx step — extracted bash (#363) > T16: a Linear-shaped commit scope (bar-123-slug) is admitted by the FID regex, not silently no-op'd on shape alone", "bkit-cloud.yml ctx step — extracted bash (#363) > T16: a Jira-shaped commit scope with a digit in the key (ab1-123-slug) no-ops — no dispatch", … |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "absent node_modules/.bin/bkit warns bkit unavailable and exits green" | red | failure: expected 'false' to be 'true' // Object.is equality |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "feat branch with no marker and no feature row gives no-issue" | red | failure: expected 'false' to be 'true' // Object.is equality |
| 8 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "context checkout ref is the workflow_run head branch on feat/** and dev for dev runs and workflow_dispatch" | red | failure: ref is not a single expression: dev: expected undefined to be defined |
| 9 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "pass row's jobs field names codex:BKIT_OPENAI_API_KEY and the ignored claude job with its reason" | red | failure: ctx step maps no steps.select.outputs.* into its env: expected [] to not deeply equal [] |
| 9 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "no-agent row's jobs field names the recorded agent's missing BKIT_ secret and the ignored secrets" | red | failure: ctx step maps no steps.select.outputs.* into its env: expected [] to not deeply equal [] |

## Gaps

- TASK 8 `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "%s recorded fetch reply carrying bkit:auto passes the gate" `missing` — "%s recorded fetch reply carrying bkit:auto passes the gate" did not run; the report holds "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > dev CI failure dispatches debug with FID recovered from the squash-merge commit scope", "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > dev CI success is a no-op — skip=true, no dispatch, no counter write", "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash", "bkit-cloud.yml ctx step — extracted bash (#363) > T16: a Linear-shaped commit scope (bar-123-slug) is admitted by the FID regex, not silently no-op'd on shape alone", "bkit-cloud.yml ctx step — extracted bash (#363) > T16: a Jira-shaped commit scope with a digit in the key (ab1-123-slug) no-ops — no dispatch", …
- TASK 8 `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "exit 80 reason=%s is unreadable with that reason and exits green" `missing` — "exit 80 reason=%s is unreadable with that reason and exits green" did not run; the report holds "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > dev CI failure dispatches debug with FID recovered from the squash-merge commit scope", "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > dev CI success is a no-op — skip=true, no dispatch, no counter write", "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash", "bkit-cloud.yml ctx step — extracted bash (#363) > T16: a Linear-shaped commit scope (bar-123-slug) is admitted by the FID regex, not silently no-op'd on shape alone", "bkit-cloud.yml ctx step — extracted bash (#363) > T16: a Jira-shaped commit scope with a digit in the key (ab1-123-slug) no-ops — no dispatch", …
- TASK 8 `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "%s fetch output is unreadable reason=output-unparseable" `missing` — "%s fetch output is unreadable reason=output-unparseable" did not run; the report holds "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > dev CI failure dispatches debug with FID recovered from the squash-merge commit scope", "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > dev CI success is a no-op — skip=true, no dispatch, no counter write", "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash", "bkit-cloud.yml ctx step — extracted bash (#363) > T16: a Linear-shaped commit scope (bar-123-slug) is admitted by the FID regex, not silently no-op'd on shape alone", "bkit-cloud.yml ctx step — extracted bash (#363) > T16: a Jira-shaped commit scope with a digit in the key (ab1-123-slug) no-ops — no dispatch", …

## Lint output — `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts

```

## Runner output — `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`

```

> @cbartens/bkit@6.1.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts

[test-timeout-budget] load average 2.5 on 10 cores: unit limits 5750ms per test, 11500ms per hook (x1.15)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (61 tests | 14 failed) 18184ms
   ❯ bkit-cloud.yml ctx step — extracted bash (#363) (42)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 550ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 122ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 411ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) is admitted by the FID regex, not silently no-op'd on shape alone 534ms
     ✓ T16: a Jira-shaped commit scope with a digit in the key (ab1-123-slug) no-ops — no dispatch 422ms
     ❯ feat/** path — bkit_gate outcomes (12)
       × github feat run passes the gate through the real bkit and stub gh 445ms
       × label removed gives label-absent, skip and a summary row 425ms
       × linear recorded fetch reply carrying bkit:auto passes the gate 129ms
       × jira recorded fetch reply carrying bkit:auto passes the gate 128ms
       × jira marker AB2-12 dispatches 129ms
       × exit 80 reason=auth with BKIT_JIRA_API_KEY empty warns naming the secret and exits green 122ms
       × exit 80 reason=network is unreadable with that reason and exits green 440ms
       × exit 80 reason=not-found is unreadable with that reason and exits green 414ms
       × empty fetch output is unreadable reason=output-unparseable 420ms
       × non-array fetch output is unreadable reason=output-unparseable 424ms
       × absent node_modules/.bin/bkit warns bkit unavailable and exits green 438ms
       × feat branch with no marker and no feature row gives no-issue 500ms
     ✓ a github tracker in package.json passes the tracker gate and dispatches 537ms
     ✓ dev path — cross-session loop cap (T5) (4)
       ✓ refuses to dispatch uncounted when package.json cannot be read 415ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 540ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 425ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 591ms
     ✓ fix/** is not a routed surface (3)
       ✓ the workflow_run trigger filter covers feat/** and dev only 118ms
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 452ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 419ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 447ms
       ✓ F3: a non-FID-shaped branch (feat/add-oauth) no-ops cleanly instead of aborting the step 428ms
       ✓ F3: a non-FID-shaped branch (feat/hotfix-login) no-ops cleanly instead of aborting the step 420ms
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 422ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 422ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 438ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 567ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 585ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 572ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 564ms
       ✓ a branch with no status.jsonl dispatches as before 534ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 436ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 733ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 397ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 413ms
     ✓ kill switch precedes the stale-run guard: a revoked FID writes no drop telemetry 403ms
     ✓ FID recovery reads the commit SUBJECT, not a scoped line in the body 417ms
   ❯ bkit-cloud.yml summary row — jobs field from the Select hand-off (2)
     × pass row's jobs field names codex:BKIT_OPENAI_API_KEY and the ignored claude job with its reason 128ms
     × no-agent row's jobs field names the recorded agent's missing BKIT_ secret and the ignored secrets 125ms
   ✓ bkit-cloud.yml gate step — per-job credential detection (17)
     ✓ BKIT_ANTHROPIC_API_KEY alone enables the run 8ms
     ✓ both federation variables, no key, enable the run 7ms
     ✓ only ANTHROPIC_FEDERATION_RULE_ID set: claude job no-ops with a notice naming ANTHROPIC_ORGANIZATION_ID 7ms
     ✓ only ANTHROPIC_ORGANIZATION_ID set: claude job no-ops with a notice naming ANTHROPIC_FEDERATION_RULE_ID 7ms
     ✓ no claude credential: notice names both the secret and the federation variables 7ms
     ✓ BKIT_ANTHROPIC_API_KEY alone sets enabled true 6ms
     ✓ BKIT_OPENCODE_API_KEY alone sets enabled true 7ms
     ✓ BKIT_OPENROUTER_API_KEY alone sets enabled true 7ms
     ✓ BKIT_OLLAMA_API_KEY alone sets enabled true 7ms
     ✓ BKIT_OPENAI_API_KEY alone sets enabled true 7ms
     ✓ enabled is true when any agent BKIT_ secret is set and false when none is 45ms
     ✓ absent bkit.cloud.agent selects no job and the notice names bkit install --auto= 10ms
     ✓ recorded claude with BKIT_ANTHROPIC_API_KEY selects only the claude job 11ms
     ✓ recorded codex selects only codex while BKIT_ANTHROPIC_API_KEY is also set 10ms
     ✓ recorded agent without its secret selects no job and names the missing secret 10ms
     ✓ recorded cursor selects no router job 10ms
     ✓ recorded none selects no router job 10ms

⎯⎯⎯⎯⎯⎯ Failed Tests 14 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > feat/** path — bkit_gate outcomes > github feat run passes the gate through the real bkit and stub gh
AssertionError: expected 'pr list --head feat/363-widen-bkit-cl…' to match /api repos\/[^ ]*\/issues\/363/[^ ]*\

- Expected:
/api repos\/[^ ]*\/issues\/363/

+ Received:
"pr list --head feat/363-widen-bkit-cloud-trigger --base dev --state open --json number --jq .[0].number // empty
pr view 77 --json body --jq .body
issue view 363 --json labels --jq .labels[].name
"

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:422:21
    420|       expect(result.outputs.arg).toBe("77");
    421|       const calls = fs.readFileSync(ghLog, "utf8");
    422|       expect(calls).toMatch(/api repos\/[^ ]*\/issues\/363/);
       |                     ^
    423|       expect(calls).not.toContain("issue view");
    424|       expect(verdictRow(result.summary, "pass")).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/14]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > feat/** path — bkit_gate outcomes > label removed gives label-absent, skip and a summary row
AssertionError: expected '::notice::Issue #363 no longer carrie…' to contain 'label-absent'

- Expected
+ Received

- label-absent
+ ::notice::Issue #363 no longer carries bkit:auto — no-op exit (kill switch).
+

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:433:29
    431|       expect(result.outputs.phase).toBeUndefined();
    432|       expect(result.stdout).toContain("::notice::");
    433|       expect(result.stdout).toContain("label-absent");
       |                             ^
    434|       expect(verdictRow(result.summary, "label-absent")).toBe(true);
    435|     });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/14]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > feat/** path — bkit_gate outcomes > linear recorded fetch reply carrying bkit:auto passes the gate
 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > feat/** path — bkit_gate outcomes > jira recorded fetch reply carrying bkit:auto passes the gate
AssertionError: expected 'true' to be 'false' // Object.is equality

Expected: "false"
Received: "true"

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:448:35
    446|       );
    447|       expect(result.status, result.stderr).toBe(0);
    448|       expect(result.outputs.skip).toBe("false");
       |                                   ^
    449|       expect(result.outputs.phase).toBe("debug");
    450|       expect(result.stdout).not.toContain("serves the GitHub tracker o…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/14]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > feat/** path — bkit_gate outcomes > jira marker AB2-12 dispatches
AssertionError: expected 'true' to be 'false' // Object.is equality

Expected: "false"
Received: "true"

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:461:35
    459|       );
    460|       expect(result.status, result.stderr).toBe(0);
    461|       expect(result.outputs.skip).toBe("false");
       |                                   ^
    462|       expect(result.outputs.phase).toBe("debug");
    463|       expect(result.outputs.arg).toBe("77");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/14]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > feat/** path — bkit_gate outcomes > exit 80 reason=auth with BKIT_JIRA_API_KEY empty warns naming the secret and exits green
AssertionError: expected '::notice::bkit.tracker.default is \'j…' to contain '::warning::'

- Expected
+ Received

- ::warning::
+ ::notice::bkit.tracker.default is 'jira' — bkit-cloud.yml serves the GitHub tracker only; no-op exit.
+

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:480:29
    478|       expect(result.outputs.skip).toBe("true");
    479|       expect(result.outputs.phase).toBeUndefined();
    480|       expect(result.stdout).toContain("::warning::");
       |                             ^
    481|       expect(result.stdout).toContain("BKIT_JIRA_API_KEY");
    482|       expect(verdictRow(result.summary, "unreadable")).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/14]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > feat/** path — bkit_gate outcomes > exit 80 reason=network is unreadable with that reason and exits green
 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > feat/** path — bkit_gate outcomes > exit 80 reason=not-found is unreadable with that reason and exits green
AssertionError: expected '::notice::Issue #363 no longer carrie…' to contain 'unreadable'

- Expected
+ Received

- unreadable
+ ::notice::Issue #363 no longer carries bkit:auto — no-op exit (kill switch).
+

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:495:31
    493|         expect(result.outputs.skip).toBe("true");
    494|         expect(result.outputs.phase).toBeUndefined();
    495|         expect(result.stdout).toContain("unreadable");
       |                               ^
    496|         expect(result.stdout).toContain(reason);
    497|         expect(result.stdout).not.toContain("label-absent");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/14]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > feat/** path — bkit_gate outcomes > empty fetch output is unreadable reason=output-unparseable
 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > feat/** path — bkit_gate outcomes > non-array fetch output is unreadable reason=output-unparseable
AssertionError: expected '::notice::Issue #363 no longer carrie…' to contain 'output-unparseable'

- Expected
+ Received

- output-unparseable
+ ::notice::Issue #363 no longer carries bkit:auto — no-op exit (kill switch).
+

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:512:29
    510|       expect(result.outputs.skip).toBe("true");
    511|       expect(result.outputs.phase).toBeUndefined();
    512|       expect(result.stdout).toContain("output-unparseable");
       |                             ^
    513|       expect(verdictRow(result.summary, "unreadable")).toBe(true);
    514|       expect(verdictRow(result.summary, "label-absent")).toBe(false);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/14]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > feat/** path — bkit_gate outcomes > absent node_modules/.bin/bkit warns bkit unavailable and exits green
AssertionError: expected 'false' to be 'true' // Object.is equality

Expected: "true"
Received: "false"

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:522:35
    520|       const result = featRun({ STUB_ISSUE_LABELS: "bkit:auto" });
    521|       expect(result.status, result.stderr).toBe(0);
    522|       expect(result.outputs.skip).toBe("true");
       |                                   ^
    523|       expect(result.outputs.phase).toBeUndefined();
    524|       expect(result.stdout).toContain("::warning::");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/14]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > feat/** path — bkit_gate outcomes > feat branch with no marker and no feature row gives no-issue
AssertionError: expected 'false' to be 'true' // Object.is equality

Expected: "true"
Received: "false"

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:533:35
    531|       const result = featRun({ STUB_ISSUE_LABELS: "bkit:auto", STUB_GH…
    532|       expect(result.status, result.stderr).toBe(0);
    533|       expect(result.outputs.skip).toBe("true");
       |                                   ^
    534|       expect(result.outputs.phase).toBeUndefined();
    535|       expect(result.stdout).toContain("no-issue");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/14]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml summary row — jobs field from the Select hand-off > pass row's jobs field names codex:BKIT_OPENAI_API_KEY and the ignored claude job with its reason
AssertionError: ctx step maps no steps.select.outputs.* into its env: expected [] to not deeply equal []

Compared values have no visual difference.

 ❯ handoffEnv .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:1017:92
    1015|         env[m[1]!] = outputs[m[2]!] ?? "";
    1016|       }
    1017|       expect(Object.keys(env), "ctx step maps no steps.select.outputs.…
       |                                                                                            ^
    1018|         [],
    1019|       );
 ❯ runFeatCtx .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:1033:12
 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:1042:22

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/14]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml summary row — jobs field from the Select hand-off > no-agent row's jobs field names the recorded agent's missing BKIT_ secret and the ignored secrets
AssertionError: ctx step maps no steps.select.outputs.* into its env: expected [] to not deeply equal []

Compared values have no visual difference.

 ❯ handoffEnv .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:1017:92
    1015|         env[m[1]!] = outputs[m[2]!] ?? "";
    1016|       }
    1017|       expect(Object.keys(env), "ctx step maps no steps.select.outputs.…
       |                                                                                            ^
    1018|         [],
    1019|       );
 ❯ runFeatCtx .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:1033:12
 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:1054:22

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/14]⎯


 Test Files  1 failed (1)
      Tests  14 failed | 47 passed (61)
   Start at  12:38:55
   Duration  18.32s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-mOTBMI/junit.xml
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

[test-timeout-budget] load average 2.8 on 10 cores: unit limits 5900ms per test, 11800ms per hook (x1.18)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

 ❯ .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts (25 tests | 1 failed) 36ms
   ❯ bkit-cloud.yml template — GitHub-only content (8)
     ✓ carries id-token: write, GitHub MCP only and no tracker sentinels 1ms
     ✓ claude job reads secrets.BKIT_ANTHROPIC_API_KEY and no step names secrets.ANTHROPIC_API_KEY 0ms
     ✓ opencode dispatch maps each provider BKIT_ secret to its own env name 0ms
     × context checkout ref is the workflow_run head branch on feat/** and dev for dev runs and workflow_dispatch 7ms
     ✓ claude step passes the four workload identity federation inputs from repo variables 0ms
     ✓ every job's runs-on is the {{CLOUD_RUNNER}} placeholder the consumer fills in 0ms
     ✓ one context job resolves phase + arg; both runner jobs need it and read its outputs 0ms
     ✓ header states App required and the bkit:auto label (no bare Auto) 0ms
   ✓ T3.1 — concurrency.group intra-surface serialisation (D3 race prevention) (3)
     ✓ concurrency.group dispatch path keys on inputs.issue (bare issue number) 0ms
     ✓ concurrency.group CI-completion path keys on head_branch (full slugged branch name) 0ms
     ✓ realistic slugged branch (feat/141-cloud-app) does NOT equal dispatch issue number (141) — cross-surface asymmetry is expected and documented 0ms
   ✓ T2.7 — two-tier CI gate positive assertions (GAP-3) (4)
     ✓ (b) free-tier if: contains 'bkit [auto route]' — gate fires when marker is HEAD commit 0ms
     ✓ (b) dispatch path always proceeds (workflow_dispatch bypasses marker check) 0ms
     ✓ (c) kill-switch gh issue view uses $ISSUE from SHARED-DERIV step — single-sourced 0ms
     ✓ (c) the free-tier marker check lives in the context job's if: gate, which both runner jobs need 0ms
   ✓ KN-3 regression: bkit-ci.yml files must NOT set `with.version:` for pnpm action (2)
     ✓ bkit-ci.yml template does NOT set both `with.version:` and rely on packageManager (KN-3) 1ms
     ✓ bkit's own .github/workflows/bkit-ci.yml does NOT set `with.version:` for pnpm action (KN-3) 0ms
   ✓ Challenge Finding 1 — SHARED-DERIV portability and pipefail safety regression (8)
     ✓ (1a) canonical bkit-cloud.yml contains NO grep -oP (PCRE lookbehind) — portability regression guard 0ms
     ✓ (1a) template bkit-cloud.yml contains NO grep -oP (PCRE lookbehind) — portability regression guard 0ms
     ✓ (1b) ISSUE assignment in canonical has || true failure guard (pipefail safety) 0ms
     ✓ (1b) FID assignment in canonical has || true failure guard (pipefail safety) 0ms
     ✓ (1b) ISSUE assignment in template has || true failure guard (pipefail safety) 0ms
     ✓ (1b) FID assignment in template has || true failure guard (pipefail safety) 0ms
     ✓ (1c) SHARED-DERIV extraction snippet exits 0 under set -euo pipefail when PR body is empty (real-tool validation) 12ms
     ✓ (1c) SHARED-DERIV extraction snippet correctly parses a well-formed PR body (positive case) 11ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts > bkit-cloud.yml template — GitHub-only content > context checkout ref is the workflow_run head branch on feat/** and dev for dev runs and workflow_dispatch
AssertionError: ref is not a single expression: dev: expected undefined to be defined
 ❯ .bkit/core/engine/audits/templates/workflow-templates.integration.test.ts:56:60
     54|     const ref = String(checkout!.with!.ref);
     55|     const expr = /^\$\{\{([\s\S]*)\}\}$/.exec(ref.trim())?.[1];
     56|     expect(expr, `ref is not a single expression: ${ref}`).toBeDefined…
       |                                                            ^
     57|     const evaluate = (eventName: string, headBranch: string | undefine…
     58|       const github = {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 24 passed (25)
   Start at  12:39:14
   Duration  133ms (tests 47%, setup 23%, import 23%, transform 5%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-0oZoI3/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
