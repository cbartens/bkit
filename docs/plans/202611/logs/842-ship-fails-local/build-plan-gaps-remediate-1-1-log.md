Verdict: FAIL
Strategy: STANDARD
Fixed: 2

<!-- verdict:end -->

# Plan Gaps

## Remediation Log
DONE — Gap 1: Preserve staged index contents during landed cleanup — four real-Git cases reproduced deletion before the fix; index content, mode, type and deletion are now checked against origin/dev independently from working-tree state, and all 17 cleanup unit cases pass (.bkit/core/engine/commands/workflow/worktrees.test.ts).
DONE — Gap 2: Align design and plan close compatibility checks with conditional remote cleanup — the required changed gate exposed two obsolete remote-deletion expectations; both now assert the original remote tip remains unchanged while the proved local branch and worktree are removed, and both integration cases pass (.bkit/core/engine/audits/workflows/close-squash.integration.test.ts).
BLOCKED — bkit:generate: Vitest tests lock exited before readiness (75) on the final compatibility-edit refresh; an earlier generation after the source fix passed all 288 render tests and graph refresh, but the final refresh could not acquire the shared tests lock.
DONE — Local tests: required changed gate exit 0; 2265 related tests, 4024 named tests, five Bats cases, type-aware lint, formatting and source/test typecheck passed (tmp/bkit-gap-remediate-1-1-changed.log).
