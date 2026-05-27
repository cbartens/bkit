Verdict: PASS
Strategy: PIVOT

<!-- verdict:end -->

# Plan Gaps — Remediation Log (Sub-plan 2, Attempt 2)

## Remediation Log

DONE — Gap 1: T3.1 concurrency.group invalid replace() + cross-surface identity claim — Removed invalid replace() expression; keyed dispatch path on inputs.issue, CI-completion path on github.event.workflow_run.head_branch; replaced misleading comment with accurate asymmetry explanation; canonical and template byte-identical (.github/workflows/bkit-cloud.yml:58-69 + .agents/templates/.github/workflows/bkit-cloud.yml:58-69)
DONE — Gap 2: T3.1 false-confidence test (unrealistic feat/141 fixture) — Replaced describe block with 4 tests asserting actual intra-surface design: dispatch keys on inputs.issue (no replace()), CI-completion keys on head_branch (no replace()), realistic feat/141-cloud-app fixture proves replace() cannot produce correct FID (141-cloud-app != 141), byte-identity assertion retained (.agents/scripts/bkit-modules.integration.test.ts)
DONE — Gap 3: T2.7(c) cross-task single-sourcing criterion now attainable — T2.7(c) Done-when revised to scope only ISSUE single-sourcing from SHARED-DERIV (not cross-surface FID equality with concurrency key, which was coupled to the impossible T3.1 criterion); test comment updated to reflect intra-surface concurrency design; existing (c) assertions (gh issue view position after shared-deriv block, ISSUE set within shared-deriv) remain valid and pass (docs/plans/202605/141-cloud-app-plan-2.md T2.7 + T3.1 + Gate 2)
DONE — KN-30 updated — D3 fix-or-rule revised to document corrected intra-surface design; structural impossibility of cross-surface token equality explained; stale-run guard + status.json lock documented as the cross-boundary race mitigation (docs/knowledge.md KN-30)
