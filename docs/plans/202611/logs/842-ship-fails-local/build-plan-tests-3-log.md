Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log
SOURCE — TASK 9: runRevalidate reads current PR head and onlyBookkeeping(codeHead,currentHead), then selects current for changed code from .bkit/core/engine/commands/workflow/runs.ts:2328-2444. Its existing CLI flags/output from runs.ts:2950-2996 contain neither require-reconciled nor exit 21; no use of code 21 was found in runs.ts.
SOURCE — TASK 9: Chosen additive workflow contract: runs revalidate --require-reconciled returns exit 21 with {reconcileRequired:true,currentHead,validatedHead:null,revalidated:false,dispatched:false,probe:null,wait:null} for newly observed feature code, without probing or dispatching CI. Bookkeeping-only movement returns exit 0 with reconcileRequired:false and the covered code validatedHead; generic callers retain current behavior.
SOURCE — TASK 9: Existing Step 9 and gate exit-17 routes from .bkit/core/workflows/bkit-ship.md:645-705. Both new route blocks must set RECONCILE_REQUIRED=true and consume existing MERGE_ATTEMPT accounting with --continue=step-3; Step3 reconciliation and Steps5/6 feature-state coverage decisions remain mandatory.
WROTE — TASK 9: `.bkit/core/engine/commands/workflow/runs.test.ts` `requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse`
WROTE — TASK 9: `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `routes late revalidation code and gate seventeen through reconciliation before merge`
SOURCE — TASK 10: MCP adapter returns ci.workflowRuns and ci.jobs without nested identity checks from .bkit/core/engine/commands/workflow/runs.ts:2016-2040; actual paginated jobs shape is an array of {total_count,jobs} pages consumed at runs.ts:1182-1206. Existing Actions run identity fields repository.full_name, head_repository.full_name, workflow_id, path, head_sha, head_branch and html_url from runs.test.ts:302-372.
SOURCE — TASK 10: Valid facts retain scoped PR/base plus configured .github/workflows/bkit-ci.yml run path and example/example repository; each job supplies run_id, API run_url and head_sha matching that run. Tests refuse mismatched or missing provenance, retain successful capstone controls and accept a capstone on the second paginated jobs page.
SOURCE — TASK 10: Focused writer validation observed both matching controls pass, then foreign repository evidence and run_id=9999 each incorrectly produce gate exit 0. Three engine tests and one workflow test fail as expected; the Task9 generic control validates the real late-remote Git fixture before the missing opt-in flag fails. Engine red proof remains the caller responsibility.
WROTE — TASK 10: `.bkit/core/engine/commands/workflow/runs.test.ts` `rejects MCP green runs from another repository or workflow at the same head`
WROTE — TASK 10: `.bkit/core/engine/commands/workflow/runs.test.ts` `rejects MCP capstone jobs belonging to another run`
