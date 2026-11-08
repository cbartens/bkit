Enforced: true
Verdict: CONCERNS
Gaps: 1
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/719-cloud-variants-add-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 7 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "enabled is true when any agent BKIT_ secret is set and false when none is" | red-not-loaded | passed |
| 7 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "absent bkit.cloud.agent selects no job and the notice names bkit install --auto=" | red-not-loaded | passed |
| 7 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "recorded claude with BKIT_ANTHROPIC_API_KEY selects only the claude job" | red-not-loaded | passed |
| 7 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "recorded codex selects only codex while BKIT_ANTHROPIC_API_KEY is also set" | red-not-loaded | passed |
| 7 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "recorded agent without its secret selects no job and names the missing secret" | red-not-loaded | passed |
| 7 | `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` "recorded %s selects no router job" | red-not-loaded | not passed |
| 7 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "claude job reads secrets.BKIT_ANTHROPIC_API_KEY and no step names secrets.ANTHROPIC_API_KEY" | red | passed |
| 7 | `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` "opencode dispatch maps each provider BKIT_ secret to its own env name" | red | passed |

## Gaps

- Task 7 `not-green` — the named test "recorded %s selects no router job" did not run; the report holds "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > dev CI failure dispatches debug with FID recovered from the squash-merge commit scope", "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > dev CI success is a no-op — skip=true, no dispatch, no counter write", "bkit-cloud.yml ctx step — extracted bash (#363) > dev path — FID recovery + success/failure routing (T3, T4) > a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash", "bkit-cloud.yml ctx step — extracted bash (#363) > T16: a Linear-shaped commit scope (bar-123-slug) is admitted by the FID regex, not silently no-op'd on shape alone", "bkit-cloud.yml ctx step — extracted bash (#363) > T16: a Jira-shaped commit scope with a digit in the key (ab1-123-slug) no-ops — no dispatch", … — Fixable: true — log: TASK 7: `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `recorded %s selects no router job` — not-green — Fixable: true

## Runner output — `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts`

```
     ✓ dev path — FID recovery + success/failure routing (T3, T4) (3)
       ✓ dev CI failure dispatches debug with FID recovered from the squash-merge commit scope 559ms
       ✓ a non-conventional squash subject (no scope) fails safe — no-op, no dispatch, no crash 424ms
     ✓ T16: a Linear-shaped commit scope (bar-123-slug) is admitted by the FID regex, not silently no-op'd on shape alone 554ms
     ✓ T16: a Jira-shaped commit scope with a digit in the key (ab1-123-slug) no-ops — no dispatch 422ms
     ✓ a github tracker in package.json passes the tracker gate and dispatches 560ms
     ✓ dev path — cross-session loop cap (T5) (4)
       ✓ refuses to dispatch uncounted when package.json cannot be read 427ms
       ✓ 4 dev-dispatch rows with the SAME headSha count as ONE cycle — cap not tripped 544ms
       ✓ 4 DISTINCT failed headShas exhaust the default cap (2 + 2) — 5th dispatch no-ops with an operator-review notice 436ms
       ✓ the set debug limits size the cap; an invalid limit takes its default of 2 587ms
     ✓ fix/** is not a routed surface (3)
       ✓ a fix/ branch reaching the ctx step (CI success) no-ops — no dispatch, no counter row 439ms
       ✓ a fix/ branch reaching the ctx step (CI failure) no-ops — no dispatch, no counter row 430ms
     ✓ feat/** path — FID recovery + cap exemption (T13, H1 regression) (6)
       ✓ T13/H1: a marker-less feat/** PR recovers the FULL FID slug from the branch (not truncated to '363') 460ms
       ✓ F3: a non-FID-shaped branch (feat/add-oauth) no-ops cleanly instead of aborting the step 444ms
       ✓ F3: a non-FID-shaped branch (feat/hotfix-login) no-ops cleanly instead of aborting the step 429ms
       ✓ F3: a non-FID-shaped branch (feat/renovate-bump) no-ops cleanly instead of aborting the step 425ms
       ✓ an issue-less marker resolves no issue — the step no-ops (/bkit-auto stays issue-only) 418ms
       ✓ feat/** failure dispatches debug and is NOT subject to the dispatch cap 450ms
     ✓ feat/** path — build-still-running guard (5)
       ✓ a build started minutes ago with no workflow-done no-ops the failure dispatch 579ms
       ✓ a build started minutes ago with no workflow-done no-ops the success dispatch 598ms
       ✓ a build whose newest row is over 30 min old is abandoned — dispatch proceeds 573ms
       ✓ a finished build (workflow-done after workflow-started) does not block dispatch 573ms
       ✓ a branch with no status.jsonl dispatches as before 462ms
     ✓ M1 regression: an unparseable status.jsonl fails CLOSED (refuses to dispatch), not open 422ms
     ✓ T17: a counter write that cannot land on origin/dev fails closed — skip=true, no phase/arg emitted 764ms
     ✓ kill switch: bkit:auto revoked on the issue halts the dev dispatch even with cap budget remaining 413ms
     ✓ stale-run guard: a dev CI run whose head_sha is not the latest completed CI head no-ops 402ms
     ✓ kill switch precedes the stale-run guard: a revoked FID writes no drop telemetry 391ms
     ✓ FID recovery reads the commit SUBJECT, not a scoped line in the body 403ms

 Test Files  1 passed (1)
      Tests  49 passed (49)
   Start at  12:28:06
   Duration  14.37s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-5lk0SC/junit.xml
```
