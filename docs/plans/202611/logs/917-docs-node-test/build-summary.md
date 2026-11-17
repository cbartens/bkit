Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

CONCERNS

- build-failure-diagnose CONCERNS

Plan tasks: 3 of 3 ticked in `docs/plans/202611/917-docs-node-test-plan.md`.

Publish: held

Docs: not synced (ship syncs on landing)

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 1 | - |
| build-worktree-setup | - | - | 1 | `docs/plans/202611/logs/917-docs-node-test/build-input-1.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | `docs/plans/202611/917-docs-node-test-plan.md`, `docs/plans/202611/logs/917-docs-node-test/build-plan-check.md` |
| build-plan-current | - | - | 1 | - |
| build-install-skills | - | - | 1 | `docs/plans/202611/logs/917-docs-node-test/build-install-skills.md` |
| build-group-start (group 1) | - | - | 1 | - |
| build-plan-tasks (group 1) | PASS | - | 1 | `docs/plans/202611/logs/917-docs-node-test/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 0 | 2 | `docs/plans/202611/logs/917-docs-node-test/build-plan-verify-1-2.md` |
| build-plan-gaps-remediate (group 1) | FAIL | - | 1 | `docs/plans/202611/logs/917-docs-node-test/build-plan-gaps-remediate-1-1-log.md` |
| build-plan-verify-holistic | PASS | 0 | 2 | `docs/plans/202611/logs/917-docs-node-test/build-plan-verify-holistic-2.md` |
| build-decision | - | - | 2 | `docs/plans/202611/logs/917-docs-node-test/build-decision-1-2.md` |
| build-group-start (group 2) | - | - | 1 | - |
| build-plan-tasks (group 2) | PASS | - | 1 | `docs/plans/202611/logs/917-docs-node-test/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 0 | 2 | `docs/plans/202611/logs/917-docs-node-test/build-plan-verify-2-2.md` |
| build-plan-gaps-remediate (group 2) | PASS | - | 1 | `docs/plans/202611/logs/917-docs-node-test/build-plan-gaps-remediate-2-1-log.md` |
| build-challenge | PASS | 0 | 1 | `docs/plans/202611/logs/917-docs-node-test/build-challenge-2.md` |
| build-run-tests | PASS | 0 | 3 | `docs/plans/202611/logs/917-docs-node-test/run-tests-3.md` |
| build-failure-diagnose | CONCERNS | - | 2 | `docs/plans/202611/logs/917-docs-node-test/build-failure-diagnose-2.md` |
| build-failure-remediate | PASS | - | 2 | `docs/plans/202611/logs/917-docs-node-test/build-failure-remediate-2-log.md` |

## Resolved Findings

- build-plan-gaps-remediate (group 1) FAIL, resolved by build-plan-verify

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/917-docs-node-test/build-input-1.md` |
| build-branch-sync | - | - | - |
| build-plan-convert | - | 1 | `docs/plans/202611/917-docs-node-test-plan.md`, `docs/plans/202611/logs/917-docs-node-test/build-plan-check.md` |
| build-plan-current | - | 1 | - |
| build-install-skills | - | 1 | `docs/plans/202611/logs/917-docs-node-test/build-install-skills.md` |
| build-group-start (group 1) | - | - | - |
| build-plan-tasks (group 1) | PASS | 1 | `docs/plans/202611/logs/917-docs-node-test/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | CONCERNS | 1 | `docs/plans/202611/logs/917-docs-node-test/build-plan-verify-1-1.md` |
| build-plan-gaps-remediate (group 1) | FAIL | 1 | `docs/plans/202611/logs/917-docs-node-test/build-plan-gaps-remediate-1-1-log.md` |
| build-plan-verify (group 1) | PASS | 2 | `docs/plans/202611/logs/917-docs-node-test/build-plan-verify-1-2.md` |
| build-plan-verify-holistic | FAIL | 1 | `docs/plans/202611/logs/917-docs-node-test/build-plan-verify-holistic-1.md` |
| build-decision | - | 1 | `docs/plans/202611/logs/917-docs-node-test/build-decision-1-1.md` |
| build-group-start (group 2) | - | - | - |
| build-plan-tasks (group 2) | PASS | 1 | `docs/plans/202611/logs/917-docs-node-test/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | CONCERNS | 1 | `docs/plans/202611/logs/917-docs-node-test/build-plan-verify-2-1.md` |
| build-plan-gaps-remediate (group 2) | PASS | 1 | `docs/plans/202611/logs/917-docs-node-test/build-plan-gaps-remediate-2-1-log.md` |
| build-plan-verify (group 2) | PASS | 2 | `docs/plans/202611/logs/917-docs-node-test/build-plan-verify-2-2.md` |
| build-plan-verify-holistic | PASS | 2 | `docs/plans/202611/logs/917-docs-node-test/build-plan-verify-holistic-2.md` |
| build-challenge | PASS | 1 | `docs/plans/202611/logs/917-docs-node-test/build-challenge-2.md` |
| build-run-tests | FAIL | 1 | `docs/plans/202611/logs/917-docs-node-test/run-tests-1.md` |
| build-failure-diagnose | CONCERNS | 1 | `docs/plans/202611/logs/917-docs-node-test/build-failure-diagnose-1.md` |
| build-failure-remediate | PASS | 1 | `docs/plans/202611/logs/917-docs-node-test/build-failure-remediate-1-log.md` |
| build-run-tests | FAIL | 2 | `docs/plans/202611/logs/917-docs-node-test/run-tests-2.md` |
| build-decision | - | 2 | `docs/plans/202611/logs/917-docs-node-test/build-decision-1-2.md` |
| build-failure-diagnose | CONCERNS | 2 | `docs/plans/202611/logs/917-docs-node-test/build-failure-diagnose-2.md` |
| build-failure-remediate | PASS | 2 | `docs/plans/202611/logs/917-docs-node-test/build-failure-remediate-2-log.md` |
| build-run-tests | PASS | 3 | `docs/plans/202611/logs/917-docs-node-test/run-tests-3.md` |

## Challenge

- challenge-1 skipped: small change (27 lines, 5 files)

## Tests

- Attempt 1: FAIL, failures 2, ran `pnpm bkit:gate:static-unit-integration`
- Attempt 2: FAIL, failures 1, ran `pnpm bkit:gate:static-unit-integration`
- Attempt 3: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Documentation Warnings

- **testing** (issue path missing) — `.bkit/shared/docs/testing.md`
  - Evidence: docs/testing.md § Test first holds the Declare bkit:test:file bullet
  - Action: Update docs/testing.md instead.
- **noise** (starter-only: the registry holds its header and rules but no entries) — `docs/noise.md`
  - Evidence: None available
  - Action: Add entries when a signal is deliberately downgraded; nothing in this failure needs one.
- **deployments / observability** (not loaded: listed for debug in .agents/docs.md but irrelevant to a local unit-test failure with no deploy or runtime signal) — `docs/deployments.md`
  - Evidence: The gate log run-tests-2.log and docs/testing.md:819 (the instructions-coverage.test.ts row) cover this failure.
  - Action: None for this run.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-ship #917
```
