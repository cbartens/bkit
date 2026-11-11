Verdict: PASS
Failures: 0
Fixable: false
Tasks: 9, 10
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 3: Tasks 9 and 10, judged against the supplied group diff and current implementation.

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

First Group 3 attempt. `build-plan-verify-holistic.md` and `build-challenge-1.md` identified the late-head coverage gap now assigned to Task 9. `build-challenge-2.md` identified the nested MCP Actions provenance gap assigned to Task 10. Both are resolved within this group's requirements.

## Notes

Task 9 is satisfied. With `--require-reconciled`, newly observed non-bookkeeping code returns exit 21, `reconcileRequired: true`, and `validatedHead: null` before CI probing or dispatch. The command records one `ship-gate-refusal` arrival. The workflow consumes that result before holding VALIDATED_HEAD and routes it through the existing bounded Step 3 path. Gate exit 17 now has its own equivalent reconciliation route. Step 3 invokes the shared eligibility/reconciliation owner and returns through the existing Steps 5–6 feature-state coverage checks. Pure bookkeeping still retains the covered code head, and generic callers retain their prior behavior. This closes the precise initial-Step-9 and exit-17 paths from the holistic report.

Task 10 is satisfied. The MCP adapter binds every supplied run to its repository, head repository, configured workflow path or numeric identity, head SHA, branch, positive run ID and scoped URL. Jobs are checked against the selected run's ID, head SHA and repository-scoped run URL across all supplied pages. Missing or mismatched provenance refuses, while matching controls and a capstone on page two pass. The workflow facts contract documents these fields, and the compiled adapter contains the same checks.

Independent verification ran the complete affected files through `bkit:test:file`: `runs.test.ts` passed 192 tests and `ship-invariants.test.ts` passed 61 tests, both exit 0. The enforced supplied test-first audit records all four planned tests red then green, zero gaps and zero unproven tests. The real-Git late-code regression distinguishes the protected opt-in from generic behavior, asserts no CI probe/dispatch on refusal, and preserves bookkeeping reuse. Workflow assertions check both distinct route blocks, durable counter ownership and the coverage paths. No planned assertion was loosened. The existing polling assertion now excludes exit 17 because the new planned assertion covers its required Step 3 route.

The supplied changed-gate log ends PASS/exit 0: 1,389 related tests and 7,579 named tests passed, with two existing skipped named cases, plus selected Node/Bats and static checks (`tmp/build-group3-changed-final.log`). Generation refreshed the CLI/catalogs, workflow mirrors and compiled output; the fresh-consumer report records five hosts, install/upgrade/check, matching paginated evidence and rejected foreign run/job evidence (`tmp/build-group3-generate-final.log`, `tmp/build-group3-dogfood-final.log`). These selected suites overlap; this review does not claim a new whole-repository gate execution.

Explicit override boundary: a read-only compiled CLI reproduction with mismatched job run_id returned exit 20 and `passed: false`. Setting the pre-existing head-matched `BKIT_SHIP_GATE_OVERRIDE` changed the result to `passed: true`, `overridden: true`, with its override audit row. This is the existing explicit CI-override contract, not acceptance of foreign evidence as valid CI; the reported Task 10 exploit without that override is closed. The fresh-base prerequisite remains outside that override. No broader override-policy change was included in this group.

Required documentation and rendered-contract changes are present. Refusals use the owning CLI diagnostics and status records. No source, tests, plan, staging or commits were changed by this verifier.

## Identified Gaps Log

None
