Verdict: PASS

<!-- verdict:end -->

# Build Plan Tests

## Test Log
SOURCE — TASK 6: CiSelection fields and strict repository/run/attempt URL contract from .bkit/core/engine/ledgers/status.ts:21
SOURCE — TASK 6: real child environment, REPO_ROOT and context block output capture from .bkit/core/engine/commands/workflow/context.ts:1941
SOURCE — TASK 6: planned context fetch --ci-selection-file and bkit-ci-evidence JSON identity/nonempty-log contract from docs/plans/202611/logs/830-debug-diagnose-named/build-brief-tests-3-1.md:70
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/context-fetch.test.ts` `pins selected evidence variables and clears inherited pins without selection`
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/context-fetch.test.ts` `accepts only matching complete CI receipts with nonempty logs`
WROTE — TASK 6: `.bkit/core/engine/commands/workflow/context-fetch.test.ts` `validates adapted legacy and fallback context through the same receipt path`
SOURCE — TASK 7: GitHub REST run fields workflow_id/head_sha/run_attempt and workflow-scoped lookup from .bkit/core/engine/commands/workflow/runs.ts:277
SOURCE — TASK 7: actual shipped CI/diff bash blocks and existing gh run view JSON job shape from .bkit/templates/context/bkit-github.md:1
WROTE — TASK 7: `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` `fetches pinned attempts without branch discovery and filters unpinned discovery`
WROTE — TASK 7: `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` `emits complete receipts only after all selected job logs succeed`
WROTE — TASK 7: `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` `ends pinned diffs at selected commits with ancestral same-workflow baselines`
PASSES — TASK 7: `.bkit/core/engine/audits/templates/context-github-ci-block.test.ts` `keeps adopted GitHub context blocks equal to shipped blocks`: existing CI and diff fenced bodies in .agents/context.md equal .bkit/templates/context/bkit-github.md
SOURCE — TASK 8: selected gate extension contract is runs gate --ci-selection-file=<validated original selection>; retain configured gate and require selected workflow success at exact --head from docs/plans/202611/logs/830-debug-diagnose-named/build-brief-tests-3-1.md:118
SOURCE — TASK 8: configured workflow and capstone continue to come from package bkit settings from .bkit/core/engine/commands/workflow/runs.ts:18
SOURCE — TASK 8: shared status-row ciGeneration/ciReproduced remain authoritative; workflow tests require ciGeneration finish fields and current-generation reproduction routing from .bkit/core/engine/ledgers/status.ts:121
WROTE — TASK 8: `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` `routes selected evidence through context diagnosis and generation-scoped fixes`
WROTE — TASK 8: `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` `honors CI reproduction before remediation and blocks unreproduced failures`
WROTE — TASK 8: `.bkit/core/engine/commands/workflow/runs.test.ts` `requires selected other-workflow success at the exact pushed head`
WROTE — TASK 8: `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` `retains original and verifying run identities through close and auto handoff`
