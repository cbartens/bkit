Enforced: true
Red: 3
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 5, attempt 2

Plan: `docs/plans/202610/719-cloud-variants-add-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "%s recorded fetch reply carrying bkit:auto passes the gate" | red | failure: case linear: expected 'true' to be 'false' // Object.is equality |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "exit 80 reason=%s is unreadable with that reason and exits green" | red | failure: reason network: expected '::notice::Issue #363 no longer carrie…' to contain 'unreadable' |
| 8 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "%s fetch output is unreadable reason=output-unparseable" | red | failure: case empty: expected '::notice::Issue #363 no longer carrie…' to contain 'output-unparseable' |

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

[test-timeout-budget] load average 3.9 on 10 cores: unit limits 6450ms per test, 12900ms per hook (x1.29)

 RUN  v5.0.5 /Users/christian/Documents/GitHub/bkit/.worktrees/719-cloud-variants-add

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts (58 tests | 11 failed) 17237ms
   ❯ bkit-cloud.yml ctx step — extracted bash (#363) (39)
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 556ms
       ✓ dev CI success is a no-op — skip=true, no dispatch, no counter write 143ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 428ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) is admitted by the FID regex, not silently no-op'd on shape alone 569ms
     ✓ T16: a Jira-shaped commit scope with a digit in the key (ab1-123-slug) no-ops — no dispatch 414ms
     ❯ feat/** path — bkit_gate outcomes (9)
       × github feat run passes the gate through the real bkit and stub gh 434ms
       × label removed gives label-absent, skip and a summary row 426ms
       × %s recorded fetch reply carrying bkit:auto passes the gate 124ms
       × jira marker AB2-12 dispatches 131ms
       × exit 80 reason=auth with BKIT_JIRA_API_KEY empty warns naming the secret and exits green 127ms
       × exit 80 reason=%s is unreadable with that reason and exits green 429ms
       × %s fetch output is unreadable reason=output-unparseable 412ms
       × absent node_modules/.bin/bkit warns bkit unavailable and exits green 444ms
       × feat branch with no marker and no feature row gives no-issue 450ms
     ✓ a github tracker in package.json passes the tracker gate and dispatches 528ms
     ✓ dev path — cross-session loop cap (T5) (4)
       ✓ refuses to dispatch uncounted when package.json cannot be read 404ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 536ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 416ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 573ms
     ✓ fix/** is not a routed surface (3)
       ✓ the workflow_run trigger filter covers feat/** and dev only 115ms
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 431ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 415ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 450ms
       ✓ F3: a non-FID-shaped branch (feat/add-oauth) no-ops cleanly instead of aborting the step 436ms
       ✓ F3: a non-FID-shaped branch (feat/hotfix-login) no-ops cleanly instead of aborting the step 424ms
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 440ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 418ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 434ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 575ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 603ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 570ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 565ms
       ✓ a branch with no status.jsonl dispatches as before 460ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 422ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 820ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 413ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 401ms
     ✓ kill switch precedes the stale-run guard: a revoked FID writes no drop telemetry 390ms
     ✓ FID recovery reads the commit SUBJECT, not a scoped line in the body 426ms
   ❯ bkit-cloud.yml summary row — jobs field from the Select hand-off (2)
     × pass row's jobs field names codex:BKIT_OPENAI_API_KEY and the ignored claude job with its reason 147ms
     × no-agent row's jobs field names the recorded agent's missing BKIT_ secret and the ignored secrets 143ms
   ✓ bkit-cloud.yml gate step — per-job credential detection (17)
     ✓ BKIT_ANTHROPIC_API_KEY alone enables the run 9ms
     ✓ both federation variables, no key, enable the run 7ms
     ✓ only ANTHROPIC_FEDERATION_RULE_ID set: claude job no-ops with a notice naming ANTHROPIC_ORGANIZATION_ID 7ms
     ✓ only ANTHROPIC_ORGANIZATION_ID set: claude job no-ops with a notice naming ANTHROPIC_FEDERATION_RULE_ID 7ms
     ✓ no claude credential: notice names both the secret and the federation variables 8ms
     ✓ BKIT_ANTHROPIC_API_KEY alone sets enabled true 8ms
     ✓ BKIT_OPENCODE_API_KEY alone sets enabled true 7ms
     ✓ BKIT_OPENROUTER_API_KEY alone sets enabled true 8ms
     ✓ BKIT_OLLAMA_API_KEY alone sets enabled true 8ms
     ✓ BKIT_OPENAI_API_KEY alone sets enabled true 8ms
     ✓ enabled is true when any agent BKIT_ secret is set and false when none is 53ms
     ✓ absent bkit.cloud.agent selects no job and the notice names bkit install --auto= 12ms
     ✓ recorded claude with BKIT_ANTHROPIC_API_KEY selects only the claude job 11ms
     ✓ recorded codex selects only codex while BKIT_ANTHROPIC_API_KEY is also set 11ms
     ✓ recorded agent without its secret selects no job and names the missing secret 11ms
     ✓ recorded cursor selects no router job 11ms
     ✓ recorded none selects no router job 12ms

⎯⎯⎯⎯⎯⎯ Failed Tests 11 ⎯⎯⎯⎯⎯⎯⎯

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

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/11]⎯

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

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/11]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > feat/** path — bkit_gate outcomes > %s recorded fetch reply carrying bkit:auto passes the gate
AssertionError: case linear: expected 'true' to be 'false' // Object.is equality

Expected: "false"
Received: "true"

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:455:42
    453|         );
    454|         expect(result.status, `${ctx}: ${result.stderr}`).toBe(0);
    455|         expect(result.outputs.skip, ctx).toBe("false");
       |                                          ^
    456|         expect(result.outputs.phase, ctx).toBe("debug");
    457|         expect(result.stdout, ctx).not.toContain("serves the GitHub tr…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/11]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > feat/** path — bkit_gate outcomes > jira marker AB2-12 dispatches
AssertionError: expected 'true' to be 'false' // Object.is equality

Expected: "false"
Received: "true"

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:469:35
    467|       );
    468|       expect(result.status, result.stderr).toBe(0);
    469|       expect(result.outputs.skip).toBe("false");
       |                                   ^
    470|       expect(result.outputs.phase).toBe("debug");
    471|       expect(result.outputs.arg).toBe("77");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/11]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > feat/** path — bkit_gate outcomes > exit 80 reason=auth with BKIT_JIRA_API_KEY empty warns naming the secret and exits green
AssertionError: expected '::notice::bkit.tracker.default is \'j…' to contain '::warning::'

- Expected
+ Received

- ::warning::
+ ::notice::bkit.tracker.default is 'jira' — bkit-cloud.yml serves the GitHub tracker only; no-op exit.
+

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:488:29
    486|       expect(result.outputs.skip).toBe("true");
    487|       expect(result.outputs.phase).toBeUndefined();
    488|       expect(result.stdout).toContain("::warning::");
       |                             ^
    489|       expect(result.stdout).toContain("BKIT_JIRA_API_KEY");
    490|       expect(verdictRow(result.summary, "unreadable")).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/11]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > feat/** path — bkit_gate outcomes > exit 80 reason=%s is unreadable with that reason and exits green
AssertionError: reason network: expected '::notice::Issue #363 no longer carrie…' to contain 'unreadable'

- Expected
+ Received

- unreadable
+ ::notice::Issue #363 no longer carries bkit:auto — no-op exit (kill switch).
+

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:503:36
    501|         expect(result.outputs.skip, ctx).toBe("true");
    502|         expect(result.outputs.phase, ctx).toBeUndefined();
    503|         expect(result.stdout, ctx).toContain("unreadable");
       |                                    ^
    504|         expect(result.stdout, ctx).toContain(reason);
    505|         expect(result.stdout, ctx).not.toContain("label-absent");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/11]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > feat/** path — bkit_gate outcomes > %s fetch output is unreadable reason=output-unparseable
AssertionError: case empty: expected '::notice::Issue #363 no longer carrie…' to contain 'output-unparseable'

- Expected
+ Received

- output-unparseable
+ ::notice::Issue #363 no longer carries bkit:auto — no-op exit (kill switch).
+

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:523:36
    521|         expect(result.outputs.skip, ctx).toBe("true");
    522|         expect(result.outputs.phase, ctx).toBeUndefined();
    523|         expect(result.stdout, ctx).toContain("output-unparseable");
       |                                    ^
    524|         expect(verdictRow(result.summary, "unreadable"), ctx).toBe(tru…
    525|         expect(verdictRow(result.summary, "label-absent"), ctx).toBe(f…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/11]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > feat/** path — bkit_gate outcomes > absent node_modules/.bin/bkit warns bkit unavailable and exits green
AssertionError: expected 'false' to be 'true' // Object.is equality

Expected: "true"
Received: "false"

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:534:35
    532|       const result = featRun({ STUB_ISSUE_LABELS: "bkit:auto" });
    533|       expect(result.status, result.stderr).toBe(0);
    534|       expect(result.outputs.skip).toBe("true");
       |                                   ^
    535|       expect(result.outputs.phase).toBeUndefined();
    536|       expect(result.stdout).toContain("::warning::");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[8/11]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml ctx step — extracted bash (#363) > feat/** path — bkit_gate outcomes > feat branch with no marker and no feature row gives no-issue
AssertionError: expected 'false' to be 'true' // Object.is equality

Expected: "true"
Received: "false"

 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:545:35
    543|       const result = featRun({ STUB_ISSUE_LABELS: "bkit:auto", STUB_GH…
    544|       expect(result.status, result.stderr).toBe(0);
    545|       expect(result.outputs.skip).toBe("true");
       |                                   ^
    546|       expect(result.outputs.phase).toBeUndefined();
    547|       expect(result.stdout).toContain("no-issue");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[9/11]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml summary row — jobs field from the Select hand-off > pass row's jobs field names codex:BKIT_OPENAI_API_KEY and the ignored claude job with its reason
AssertionError: ctx step maps no steps.select.outputs.* into its env: expected [] to not deeply equal []

Compared values have no visual difference.

 ❯ handoffEnv .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:1029:92
    1027|         env[m[1]!] = outputs[m[2]!] ?? "";
    1028|       }
    1029|       expect(Object.keys(env), "ctx step maps no steps.select.outputs.…
       |                                                                                            ^
    1030|         [],
    1031|       );
 ❯ runFeatCtx .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:1045:12
 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:1054:22

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[10/11]⎯

 FAIL  .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts > bkit-cloud.yml summary row — jobs field from the Select hand-off > no-agent row's jobs field names the recorded agent's missing BKIT_ secret and the ignored secrets
AssertionError: ctx step maps no steps.select.outputs.* into its env: expected [] to not deeply equal []

Compared values have no visual difference.

 ❯ handoffEnv .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:1029:92
    1027|         env[m[1]!] = outputs[m[2]!] ?? "";
    1028|       }
    1029|       expect(Object.keys(env), "ctx step maps no steps.select.outputs.…
       |                                                                                            ^
    1030|         [],
    1031|       );
 ❯ runFeatCtx .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:1045:12
 ❯ .bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts:1066:22

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[11/11]⎯


 Test Files  1 failed (1)
      Tests  11 failed | 47 passed (58)
   Start at  12:39:59
   Duration  17.38s (tests 99%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-qKX9yx/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
