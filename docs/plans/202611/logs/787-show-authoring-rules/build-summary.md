Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

CONCERNS

- build-plan-gaps-remediate-holistic CONCERNS
- build-challenge round 1: MEDIUM .bkit/core/engine/install/write.ts:231, accepted limitation
- build-challenge round 1: LOW .bkit/core/hooks/guardrails-shell.js:730
- build-challenge round 1: LOW .bkit/core/hooks/guardrails-shell.js:1514
- build-challenge round 1: LOW .bkit/core/hooks/guardrails-shell.js:637
- build-challenge round 1: LOW .bkit/core/.cursor/hooks/bkit-guardrails.cjs:84
- build-challenge round 1: LOW .bkit/core/.codex/hooks/bkit-guardrails.cjs:83
- build-challenge round 1: LOW .bkit/core/hooks/gateguard-engine.js:115
- build-challenge round 1: LOW .bkit/core/hooks/guardrails-shell.js:1577
- build-challenge round 1: LOW .bkit/core/engine/install/write.ts:256
- build-challenge round 2: HIGH .bkit/core/engine/install/write.ts:243
- build-challenge round 2: MEDIUM .bkit/core/hooks/gateguard-edit-payload.js:20, accepted limitation
- build-challenge round 2: MEDIUM .bkit/core/hooks/guardrails-shell.js:265
- build-challenge round 2: MEDIUM .bkit/core/hooks/guardrails-shell.js:924
- build-challenge round 2: MEDIUM .bkit/core/hooks/guardrails-shell.js:846
- build-challenge round 2: LOW .bkit/core/hooks/gateguard-engine.js:115
- build-challenge round 2: LOW .bkit/core/.codex/hooks/bkit-guardrails.cjs:83
- build-challenge round 2: LOW .bkit/core/hooks/guardrails-shell.js:841
- build-challenge round 2: LOW .bkit/core/hooks/guardrails-shell.js:1682
- build-challenge round 2: LOW .bkit/core/hooks/gateguard-engine.js:211
- build-plan-verify (group 6) CONCERNS
- build-plan-gaps-remediate (group 6) CONCERNS
- 11 item(s) accepted at the Decision Pause
- 11 deferral(s) from this run remain open

Plan tasks: 29 of 29 ticked in `docs/plans/202611/787-show-authoring-rules-plan.md`.

Publish: pr

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 1 | - |
| build-worktree-setup | - | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-input-1.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | `docs/plans/202611/787-show-authoring-rules-plan.md`, `docs/plans/202611/logs/787-show-authoring-rules/build-plan-check.md` |
| build-plan-current | PASS | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-current.md` |
| build-install-skills | - | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-install-skills.md` |
| build-group-start (group 1) | - | - | 1 | - |
| build-plan-tests (group 1) | PASS | - | 3 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | - | 4 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-1-4.md` |
| build-plan-tasks (group 1) | PASS | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 0 | 4 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-1-4.md` |
| build-plan-gaps-remediate (group 1) | PASS | - | 3 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-1-3-log.md` |
| build-group-gate (group 1) | PASS | 0 | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-group-gate-1-4.md` |
| build-group-start (group 2) | - | - | 1 | - |
| build-plan-tests (group 2) | PASS | - | 3 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | - | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-2-3.md` |
| build-plan-tasks (group 2) | FAIL | - | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 0 | 3 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-2-3.md` |
| build-plan-gaps-remediate (group 2) | FAIL | - | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-2-2-log.md` |
| build-decision | - | - | 10 | `docs/plans/202611/logs/787-show-authoring-rules/build-decision-1-10.md` |
| build-group-gate (group 2) | PASS | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-group-gate-2-3.md` |
| build-group-start (group 3) | - | - | 1 | - |
| build-plan-tests (group 3) | PASS | - | 5 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | - | 5 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-3-5.md` |
| build-plan-tasks (group 3) | PASS | - | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 0 | 6 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-3-6.md` |
| build-plan-gaps-remediate (group 3) | FAIL | - | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-3-3-log.md` |
| build-plan-verify-holistic | PASS | 0 | 8 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-holistic-8.md` |
| build-plan-gaps-remediate-holistic | CONCERNS | - | 4 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-holistic-4-log.md` |
| build-challenge | CONCERNS | 0 | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-challenge-1.md`, `docs/plans/202611/logs/787-show-authoring-rules/build-challenge-2.md` |
| build-group-start (group 4) | - | - | 1 | - |
| build-plan-tests (group 4) | PASS | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-4-1.md` |
| build-plan-tasks (group 4) | PASS | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | PASS | 0 | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-4-2.md` |
| build-group-gate (group 4) | PASS | - | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-group-gate-4-2.md` |
| build-plan-gaps-remediate (group 4) | PASS | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-4-1-log.md` |
| build-group-start (group 5) | - | - | 1 | - |
| build-plan-tests (group 5) | PASS | - | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-5-log.md` |
| build-tests-red (group 5) | - | - | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-5-2.md` |
| build-plan-tasks (group 5) | PASS | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tasks-5-log.md` |
| build-plan-verify (group 5) | PASS | 0 | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-5-2.md` |
| build-challenge | CONCERNS | 0 | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-challenge-1.md`, `docs/plans/202611/logs/787-show-authoring-rules/build-challenge-2.md` |
| build-group-start (group 6) | - | - | 1 | - |
| build-plan-tests (group 6) | PASS | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-6-log.md` |
| build-tests-red (group 6) | - | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-6-1.md` |
| build-plan-verify (group 6) | CONCERNS | 7 | 5 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-6-5.md` |
| build-plan-gaps-remediate (group 6) | CONCERNS | - | 4 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-6-4-log.md` |
| build-group-start (group 7) | - | - | 1 | - |
| build-plan-tests (group 7) | PASS | - | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-7-log.md` |
| build-tests-red (group 7) | - | - | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-7-2.md` |
| build-plan-tasks (group 7) | PASS | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tasks-7-log.md` |
| build-plan-verify (group 7) | PASS | 0 | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-7-2.md` |
| build-group-gate (group 7) | PASS | - | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-group-gate-7-2.md` |
| build-plan-gaps-remediate (group 7) | PASS | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-7-1-log.md` |
| build-group-start (group 8) | - | - | 1 | - |
| build-plan-tests (group 8) | PASS | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-8-log.md` |
| build-tests-red (group 8) | - | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-8-1.md` |
| build-plan-tasks (group 8) | PASS | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tasks-8-log.md` |
| build-plan-verify (group 8) | PASS | 0 | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-8-2.md` |
| build-plan-gaps-remediate (group 8) | PASS | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-8-1-log.md` |
| build-run-tests | PASS | 0 | 1 | `docs/plans/202611/logs/787-show-authoring-rules/run-tests-1.md` |

## Resolved Findings

- build-plan-tasks (group 2) FAIL, resolved by build-plan-verify
- build-plan-gaps-remediate (group 2) FAIL, resolved by build-plan-verify
- build-plan-gaps-remediate (group 3) FAIL, resolved by build-plan-verify
- build-challenge round 1: HIGH .bkit/core/hooks/guardrails-shell.js:821, resolved by build-plan-verify (group 4, task 14)
- build-challenge round 1: MEDIUM .bkit/core/hooks/guardrails-shell.js:742, resolved by build-plan-verify (group 4, task 15)
- build-challenge round 1: MEDIUM .bkit/core/hooks/guardrails-shell.js:527, resolved by build-plan-verify (group 4, task 16)
- build-challenge round 1: MEDIUM .bkit/core/hooks/guardrails-shell.js:440, resolved by build-plan-verify (group 4, task 17)
- build-challenge round 1: MEDIUM .bkit/core/hooks/guardrails-shell.js:1608, resolved by build-plan-verify (group 5, task 19)
- build-challenge round 1: MEDIUM .bkit/core/hooks/guardrails-shell.js:862, resolved by build-plan-verify (group 5, task 20)
- build-challenge round 2: MEDIUM .bkit/core/.cursor/hooks/bkit-guardrails.cjs:84, resolved by build-plan-verify (group 8, task 26)
- build-challenge round 2: MEDIUM .bkit/core/hooks/guardrails-shell.js:1634, resolved by build-plan-verify (group 8, task 27)

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/787-show-authoring-rules/build-input-1.md` |
| build-branch-sync | - | - | - |
| build-plan-convert | - | 1 | `docs/plans/202611/787-show-authoring-rules-plan.md`, `docs/plans/202611/logs/787-show-authoring-rules/build-plan-check.md` |
| build-plan-current | PASS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-current.md` |
| build-install-skills | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-install-skills.md` |
| build-group-start (group 1) | - | - | - |
| build-plan-tests (group 1) | FAIL | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-1-1.md` |
| build-plan-tests (group 1) | PASS | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-1-2.md` |
| build-plan-tasks (group 1) | PASS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | CONCERNS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-1-1.md` |
| build-plan-gaps-remediate (group 1) | CONCERNS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-1-1-log.md` |
| build-plan-verify (group 1) | CONCERNS | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-1-2.md` |
| build-plan-gaps-remediate (group 1) | CONCERNS | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-1-2-log.md` |
| build-plan-verify (group 1) | PASS | 3 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-1-3.md` |
| build-group-gate (group 1) | FAIL | 3 | `docs/plans/202611/logs/787-show-authoring-rules/build-group-gate-1-3.md` |
| build-plan-gaps-remediate (group 1) | PASS | 3 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-1-3-log.md` |
| build-plan-verify (group 1) | PASS | 4 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-1-4.md` |
| build-group-gate (group 1) | PASS | 4 | `docs/plans/202611/logs/787-show-authoring-rules/build-group-gate-1-4.md` |
| build-group-start (group 2) | - | - | - |
| build-plan-tests (group 2) | PASS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | FAIL | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | CONCERNS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-2-1.md` |
| build-plan-gaps-remediate (group 2) | FAIL | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-2-1-log.md` |
| build-plan-verify (group 2) | CONCERNS | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-2-2.md` |
| build-plan-gaps-remediate (group 2) | FAIL | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-2-2-log.md` |
| build-decision | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-decision-1-1.md` |
| build-plan-tests (group 2) | PASS | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-2-log.md` |
| build-plan-tests (group 2) | PASS | 3 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | 3 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-2-3.md` |
| build-plan-tasks (group 2) | FAIL | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 3 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-2-3.md` |
| build-group-gate (group 2) | PASS | 3 | `docs/plans/202611/logs/787-show-authoring-rules/build-group-gate-2-3.md` |
| build-group-start (group 3) | - | - | - |
| build-plan-tests (group 3) | PASS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-3-1.md` |
| build-plan-tasks (group 3) | PASS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | FAIL | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-3-1.md` |
| build-plan-gaps-remediate (group 3) | CONCERNS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-3-1-log.md` |
| build-plan-verify (group 3) | FAIL | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-3-2.md` |
| build-decision | - | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-decision-1-2.md` |
| build-plan-tests (group 3) | PASS | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-3-2.md` |
| build-plan-tasks (group 3) | PASS | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | CONCERNS | 3 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-3-3.md` |
| build-plan-gaps-remediate (group 3) | FAIL | 3 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-3-3-log.md` |
| build-plan-verify (group 3) | FAIL | 4 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-3-4.md` |
| build-decision | - | 3 | `docs/plans/202611/logs/787-show-authoring-rules/build-decision-1-3.md` |
| build-plan-tests (group 3) | PASS | 3 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | 3 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-3-3.md` |
| build-plan-tests (group 3) | PASS | 4 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | 4 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-3-4.md` |
| build-plan-verify (group 3) | FAIL | 5 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-3-5.md` |
| build-decision | - | 4 | `docs/plans/202611/logs/787-show-authoring-rules/build-decision-1-4.md` |
| build-plan-tests (group 3) | PASS | 5 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | 5 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-3-5.md` |
| build-plan-verify (group 3) | PASS | 6 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-3-6.md` |
| build-plan-verify-holistic | CONCERNS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-holistic-1.md` |
| build-decision | - | 5 | `docs/plans/202611/logs/787-show-authoring-rules/build-decision-1-5.md` |
| build-plan-tests (group 1) | PASS | 3 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 3 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-1-3.md` |
| build-tests-red (group 1) | - | 4 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-1-4.md` |
| build-plan-gaps-remediate-holistic | FAIL | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-holistic-1-log.md` |
| build-plan-verify-holistic | CONCERNS | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-holistic-2.md` |
| build-plan-gaps-remediate-holistic | CONCERNS | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-holistic-2-log.md` |
| build-plan-verify-holistic | CONCERNS | 3 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-holistic-3.md` |
| build-plan-gaps-remediate-holistic | FAIL | 3 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-holistic-3-log.md` |
| build-plan-verify-holistic | CONCERNS | 4 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-holistic-4.md` |
| build-plan-gaps-remediate-holistic | CONCERNS | 4 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-holistic-4-log.md` |
| build-plan-verify-holistic | FAIL | 5 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-holistic-5.md` |
| build-decision | - | 6 | `docs/plans/202611/logs/787-show-authoring-rules/build-decision-1-6.md` |
| build-plan-verify-holistic | PASS | 6 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-holistic-6.md` |
| build-challenge | CONCERNS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-challenge-1.md`, `docs/plans/202611/logs/787-show-authoring-rules/build-challenge-2.md` |
| build-decision | - | 7 | `docs/plans/202611/logs/787-show-authoring-rules/build-decision-1-7.md` |
| build-group-start (group 4) | - | - | - |
| build-plan-tests (group 4) | PASS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-4-log.md` |
| build-tests-red (group 4) | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-4-1.md` |
| build-plan-tasks (group 4) | PASS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tasks-4-log.md` |
| build-plan-verify (group 4) | PASS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-4-1.md` |
| build-group-gate (group 4) | FAIL | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-group-gate-4-1.md` |
| build-plan-gaps-remediate (group 4) | PASS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-4-1-log.md` |
| build-plan-verify (group 4) | PASS | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-4-2.md` |
| build-group-gate (group 4) | PASS | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-group-gate-4-2.md` |
| build-group-start (group 5) | - | - | - |
| build-plan-tests (group 5) | PASS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-5-log.md` |
| build-tests-red (group 5) | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-5-1.md` |
| build-plan-tasks (group 5) | PASS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tasks-5-log.md` |
| build-plan-verify (group 5) | CONCERNS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-5-1.md` |
| build-plan-tests (group 5) | PASS | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-5-log.md` |
| build-tests-red (group 5) | - | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-5-2.md` |
| build-plan-verify (group 5) | PASS | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-5-2.md` |
| build-plan-verify-holistic | PASS | 7 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-holistic-7.md` |
| build-challenge | CONCERNS | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-challenge-1.md`, `docs/plans/202611/logs/787-show-authoring-rules/build-challenge-2.md` |
| build-decision | - | 8 | `docs/plans/202611/logs/787-show-authoring-rules/build-decision-1-8.md` |
| build-group-start (group 6) | - | - | - |
| build-plan-tests (group 6) | PASS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-6-log.md` |
| build-tests-red (group 6) | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-6-1.md` |
| build-plan-verify (group 6) | CONCERNS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-6-1.md` |
| build-plan-gaps-remediate (group 6) | PASS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-6-1-log.md` |
| build-plan-verify (group 6) | CONCERNS | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-6-2.md` |
| build-plan-gaps-remediate (group 6) | PASS | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-6-2-log.md` |
| build-plan-verify (group 6) | CONCERNS | 3 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-6-3.md` |
| build-plan-gaps-remediate (group 6) | PASS | 3 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-6-3-log.md` |
| build-plan-verify (group 6) | CONCERNS | 4 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-6-4.md` |
| build-plan-gaps-remediate (group 6) | CONCERNS | 4 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-6-4-log.md` |
| build-plan-verify (group 6) | CONCERNS | 5 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-6-5.md` |
| build-decision | - | 9 | `docs/plans/202611/logs/787-show-authoring-rules/build-decision-1-9.md` |
| build-group-start (group 7) | - | - | - |
| build-plan-tests (group 7) | PASS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-7-log.md` |
| build-tests-red (group 7) | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-7-1.md` |
| build-plan-tests (group 7) | PASS | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-7-log.md` |
| build-tests-red (group 7) | - | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-7-2.md` |
| build-plan-tasks (group 7) | PASS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tasks-7-log.md` |
| build-plan-verify (group 7) | PASS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-7-1.md` |
| build-group-gate (group 7) | FAIL | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-group-gate-7-1.md` |
| build-plan-gaps-remediate (group 7) | PASS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-7-1-log.md` |
| build-plan-verify (group 7) | PASS | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-7-2.md` |
| build-group-gate (group 7) | PASS | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-group-gate-7-2.md` |
| build-group-start (group 8) | - | - | - |
| build-plan-tests (group 8) | PASS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-8-log.md` |
| build-tests-red (group 8) | - | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-tests-red-8-1.md` |
| build-plan-tasks (group 8) | PASS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-tasks-8-log.md` |
| build-plan-verify (group 8) | CONCERNS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-8-1.md` |
| build-plan-gaps-remediate (group 8) | PASS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-8-1-log.md` |
| build-plan-verify (group 8) | PASS | 2 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-8-2.md` |
| build-plan-verify-holistic | PASS | 8 | `docs/plans/202611/logs/787-show-authoring-rules/build-plan-verify-holistic-8.md` |
| build-run-tests | PASS | 1 | `docs/plans/202611/logs/787-show-authoring-rules/run-tests-1.md` |
| build-decision | - | 10 | `docs/plans/202611/logs/787-show-authoring-rules/build-decision-1-10.md` |

## Challenge

- Task 14 — HIGH — ticked (`docs/plans/202611/787-show-authoring-rules-plan.md`)
- Task 15 — MEDIUM — ticked (`docs/plans/202611/787-show-authoring-rules-plan.md`)
- Task 16 — MEDIUM — ticked (`docs/plans/202611/787-show-authoring-rules-plan.md`)
- Task 17 — MEDIUM — ticked (`docs/plans/202611/787-show-authoring-rules-plan.md`)
- Task 18 — MEDIUM — ticked (`docs/plans/202611/787-show-authoring-rules-plan.md`)
- Task 19 — MEDIUM — ticked (`docs/plans/202611/787-show-authoring-rules-plan.md`)
- Task 20 — MEDIUM — ticked (`docs/plans/202611/787-show-authoring-rules-plan.md`)
- Task 21 — HIGH — ticked (`docs/plans/202611/787-show-authoring-rules-plan.md`)
- Task 22 — MEDIUM — ticked (`docs/plans/202611/787-show-authoring-rules-plan.md`)
- Task 23 — MEDIUM — ticked (`docs/plans/202611/787-show-authoring-rules-plan.md`)
- Task 24 — MEDIUM — ticked (`docs/plans/202611/787-show-authoring-rules-plan.md`)
- Task 25 — MEDIUM — ticked (`docs/plans/202611/787-show-authoring-rules-plan.md`)
- Task 28 — MEDIUM — ticked (`docs/plans/202611/787-show-authoring-rules-plan.md`)
- Task 29 — MEDIUM — ticked (`docs/plans/202611/787-show-authoring-rules-plan.md`)
- Task 26 — MEDIUM — ticked (`docs/plans/202611/787-show-authoring-rules-plan.md`)
- Task 27 — MEDIUM — ticked (`docs/plans/202611/787-show-authoring-rules-plan.md`)
- LOW, deferred: 787-show-authoring-rules-challenge-low-bkit-core-hooks-guardrails-shell-js-730 — LOW build challenge finding at .bkit/core/hooks/guardrails-shell.js:730: `cp new.md docs/` or `mv draft.md .agents/` writes a new agent-read file into a directory, and the detector reports nothing or names the directory instead of the file. Done when: A `cp` / `mv` destination that ends in `/` or is an existing directory resolves to `dest/basename(source)` for each literal source (or reports `unresolved-target` when a source is dynamic), and the directory itself is never a target. Probe today: `cp new.md docs/` returns empty evidence.
- LOW, deferred: 787-show-authoring-rules-challenge-low-bkit-core-hooks-guardrails-shell-js-1514 — LOW build challenge finding at .bkit/core/hooks/guardrails-shell.js:1514: `node -e "const {writeFileSync: w} = require('fs'); w('docs/testing.md','x')"` is classified as a safe reader: the destructured alias is bound as a known name and the write is never seen. Done when: In `analyzeJs`, a destructuring binding from a safe module that renames a writer (`{ writeFileSync: w }`, `{ rmSync: r }`) either maps the alias to the writer so a literal call is a target, or marks the program `unknown`; a plain read-only destructure (`{ readFileSync }`) stays quiet. Probe today: empty evidence.
- LOW, deferred: 787-show-authoring-rules-challenge-low-bkit-core-hooks-guardrails-shell-js-637 — LOW build challenge finding at .bkit/core/hooks/guardrails-shell.js:637: `perl -lpi -e … docs/testing.md` (or `-0pi`) edits in place, but `perlRubyFiles` stops scanning the flag cluster at `l` / `0` before it reaches `i`. Done when: `-l` and `-0` consume only their optional octal digits and the scan continues through the rest of the cluster, so `-lpi`, `-0pi` and `-0777pi` set in-place; `-Mmodule`, `-Idir` and `-F` patterns still end the cluster. Probe today: `perl -lpi -e 's/a/b/' docs/testing.md` returns empty evidence.
- LOW, deferred: 787-show-authoring-rules-challenge-low-bkit-core-cursor-hooks-bkit-guardrails-cjs-84 — LOW build challenge finding at .bkit/core/.cursor/hooks/bkit-guardrails.cjs:84: On Cursor, `curl https://off-list.example/x && sed -i … docs/testing.md` asks about the fetch and drops the edit evidence `classifyShell` now returns, so the approved command runs with no authoring advice. Done when: Cursor's `fetch` branch composes `shellEditContext(shellEditAdvisory(v.edits), …, ADVICE_BUDGETS.cursor, fetchText)` into the ask's `agent_message` when `v.edits` is present, as the Codex branch already does (`.bkit/core/.codex/hooks/bkit-guardrails.cjs:85`), without changing the `ask` permission.
- LOW, deferred: 787-show-authoring-rules-challenge-low-bkit-core-codex-hooks-bkit-guardrails-cjs-83 — LOW build challenge finding at .bkit/core/.codex/hooks/bkit-guardrails.cjs:83: A long fetch-plus-edit command (a 3 KB URL) on Codex or Antigravity echoes the full command in the fetch note, so `fixedCost` exceeds the 2,000-byte budget, every per-file block is omitted and the response still overruns the budget. Done when: The composed fetch-plus-edit response on Codex (`fetchNote`) and Antigravity (`fetchLine`, `.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs:126`) stays within its budget whatever the command length: the echoed command is capped (or dropped) before `fixedCost` is computed, and `selectAdvice` never receives a `fixedCost` larger than the budget.
- LOW, deferred: 787-show-authoring-rules-challenge-low-bkit-core-hooks-gateguard-engine-js-115 — LOW build challenge finding at .bkit/core/hooks/gateguard-engine.js:115: A consumer whose checkout sits under a `docs/` folder (`/home/u/docs/app`) gets the agent-read reminder, and on `.md` files the docs advisory, for every file, because the new absolute identity key is matched for `/docs/` anywhere in the path. Done when: `isAgentReadPath`, `isDocsPath` and `isGateConfig` classify the path relative to the call's workspace (`cwd` / root passed to `prepareAdvice`), not the absolute `key`, so directories above the workspace never match; the normalized absolute `key` stays the warning identity. Probe today: `isAgentReadPath("/home/u/docs/app/src/index.ts")` and `isDocsPath("/home/u/docs/app/README.md")` both return `true`. Codex and OpenCode, which used to pass relative spellings, are the hosts this newly reaches.
- LOW, deferred: 787-show-authoring-rules-challenge-low-bkit-core-hooks-guardrails-shell-js-1577 — LOW build challenge finding at .bkit/core/hooks/guardrails-shell.js:1577: A command over 256 KiB of multi-byte text is cut with `text.slice(0, 262144)`, which counts UTF-16 units, so up to about 768 KiB is still analysed and a target past the byte bound is reported as found before the limit. Done when: The command is cut at the last whole character within 256 KiB of UTF-8 bytes (no split surrogate pair), so analysis covers exactly the bytes `LIMIT_REASONS["command-size"]` names.
- LOW, deferred: 787-show-authoring-rules-challenge-low-bkit-core-engine-install-write-ts-256 — LOW build challenge finding at .bkit/core/engine/install/write.ts:256: A permission grant or hook group that a later bkit release retires stays in every upgraded consumer forever, because the list merge treats it as consumer-added. Done when: The owner decides how the install engine tells a previously shipped list entry from a consumer-added one, for example by recording the shipped plain-value entries and hook commands in the install manifest and pruning entries that bkit shipped before but no longer ships, or by keeping a per-release retired-entries list. No agent can settle it, because it changes the JSON ownership contract in `.bkit/core/.bkit/install.md` and the list rule that task 13 adopted. Today `mergeManagedList` keeps every non-template plain value (`permissions.allow` included) and every hook group whose command is not in the template. A release that tightens permissions by removing an `allow` entry therefore never reaches upgraded consumers. Before this change, a drift merge replaced the array and dropped such entries.
- LOW, deferred: 787-show-authoring-rules-challenge-low-bkit-core-hooks-guardrails-shell-js-841 — LOW build challenge finding at .bkit/core/hooks/guardrails-shell.js:841: `git -C sub apply ../x.patch` (or `git -c core.x=y apply x.patch`) rewrites the patch's files, and the shell check reports nothing. Done when: The `git` case skips git's global options (`-C <dir>`, `-c <k=v>`, `--git-dir=…`, `--work-tree=…`, `--no-pager`) before testing for `apply`. A literal `-C` directory becomes the base directory for the source file and the patch paths, through `resolveCwd`, and a dynamic one gives `unresolved-directory`. Probe today: `git -C docs apply ../x.patch` returns `{"targets":[],"uncertain":[],"limit":null}`, because only `args[0] === "apply"` is checked.
- LOW, deferred: 787-show-authoring-rules-challenge-low-bkit-core-hooks-guardrails-shell-js-1682 — LOW build challenge finding at .bkit/core/hooks/guardrails-shell.js:1682: A 256 KiB command bound measured in bytes is cut in UTF-16 characters, so a long non-ASCII command keeps and analyses up to three times the stated limit, and a target past the byte limit is still reported. Done when: `shellEditTargets` cuts the text at 256 KiB of UTF-8 bytes (for example `Buffer.from(text, "utf8").subarray(0, limit).toString("utf8")`, which drops a split trailing character) rather than `text.slice(0, 262144)`. A target that starts after the byte limit is no longer analysed, and `limit` stays `command-size`. Today `Buffer.byteLength(text) > 256 KiB` is tested, then `text.slice(0, EVIDENCE_LIMITS.commandBytes)` keeps 262,144 UTF-16 units, so a command of 140,000 `é` (280,000 bytes) is kept whole.
- LOW, deferred: 787-show-authoring-rules-challenge-low-bkit-core-hooks-gateguard-engine-js-211 — LOW build challenge finding at .bkit/core/hooks/gateguard-engine.js:211: On a shared Linux `/tmp`, another local user pre-creates `bkit-gateguard-<uid>` and plants `<session>.json` as a symlink, and the next shell or edit hook call overwrites the victim's file with warning JSON. Done when: `stateDir()` is created with mode `0o700`, and every state read and write first confirms with `lstat` that the folder is a real directory owned by `process.getuid()` with no group or other access; otherwise the call treats state as unavailable and falls back to the in-process set (advisory only, as today). `markWarned` writes through a temporary file opened with `O_CREAT | O_EXCL | O_NOFOLLOW` plus `rename`, so a planted symlink is never followed. Probe on the current code: with `TMPDIR` set to a scratch folder and `stateFile("sess-1")` planted as a symlink to `victim.txt`, `firstTouchAdvice("docs/x.md", "sess-1", false, "/repo")` replaced `victim.txt` with `{"files":{"/repo/docs/x.md":true,"docs/x.md":true}}`. The state code predates this branch, but the branch adds the engine to the Claude, Cursor, Codex and Antigravity shell guardrails hooks, so every shell edit call now writes there, and the files also record edited paths at the default `0644` (`docs/security.md` § PII; `.agents/rules.md` § Data access).

## Tests

- Attempt 1: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Risks and Action Items

- BLOCKED — TASK 5: `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` `reserves notices inside conservative host budgets` — same: the 8,000-char/2,000-byte batching function is unnamed and no existing caller exposes it (`docs/plans/202611/logs/787-show-authoring-rules/build-plan-tests-1-log.md`)
- BLOCKED — TASK 13: test `.bkit/core/engine/install/modules/core.integration.test.ts` `upgrades shipped registrations without dropping consumer hook groups or permissions` — Claude no-duplicate assertion (line 2647) counts "bkit-gateguard.cjs" in JSON.stringify of PreToolUse, but the shipped single Claude group command is `test -f .claude/hooks/bkit-gateguard.cjs && node .claude/hooks/bkit-gateguard.cjs || true`, which names the file twice, so the count is 2 for exactly one group (also 2 in the pre-change shipped file). Needs count of groups/commands, not substring. mergeManagedJson added in write.ts and wired into writeTier2JsonContained; install.md list rule added; write.test.ts mergeManagedJson case passes; all other assertions in the core test pass. No engine build artifact needed beyond the end-of-session upgrade. (`docs/plans/202611/logs/787-show-authoring-rules/build-plan-tasks-3-log.md`)
- BLOCKED — Group gate: tc-h4.log failed "related" at load average ~33 with timeouts in tracker.integration.test.ts (3), check.integration.test.ts (2) and one upgrade.integration.test.ts exit-143 case, none touching this change; tracker + check files pass alone (46/46), the hook test passes. Load-dependent timeouts from other repos' runs on the shared machine; no clean full gate run. (`docs/plans/202611/logs/787-show-authoring-rules/build-plan-gaps-remediate-holistic-4-log.md`)
- Accepted: docs/plans/202611/logs/787-show-authoring-rules/build-decision-1-7.md: Decision: Accept — owner chose Accept: fine leaving it as is and handling retirements when they come up.
- Accepted: docs/plans/202611/logs/787-show-authoring-rules/build-decision-1-8.md: Decision: Accept — owner chose Accept: answered "A)" with no reason given.
- Accepted: docs/plans/202611/logs/787-show-authoring-rules/build-decision-1-9.md: Decision: Accept — owner answered "Yes, all recommended"
- Accepted: docs/plans/202611/logs/787-show-authoring-rules/build-decision-1-9.md: Decision: Accept — owner answered "Yes, all recommended"
- Accepted: docs/plans/202611/logs/787-show-authoring-rules/build-decision-1-9.md: Decision: Accept — owner answered "Yes, all recommended"
- Accepted: docs/plans/202611/logs/787-show-authoring-rules/build-decision-1-9.md: Decision: Accept — owner answered "Yes, all recommended"
- Accepted: docs/plans/202611/logs/787-show-authoring-rules/build-decision-1-9.md: Decision: Accept — owner answered "Yes, all recommended"
- Accepted: docs/plans/202611/logs/787-show-authoring-rules/build-decision-1-10.md: Decision: Accept — owner: "yes ok to accept all"; left re-running the tests against the old code to my call, and it adds nothing, because tasks 3 and 13 already passed on the old code and tasks 18 and 22 have no test.
- Accepted: docs/plans/202611/logs/787-show-authoring-rules/build-decision-1-10.md: Decision: Accept — owner: "yes ok to accept all"; left re-running the tests against the old code to my call, and it adds nothing, because tasks 3 and 13 already passed on the old code and tasks 18 and 22 have no test.
- Accepted: docs/plans/202611/logs/787-show-authoring-rules/build-decision-1-10.md: Decision: Accept — owner: "yes ok to accept all"; left re-running the tests against the old code to my call, and it adds nothing, because tasks 3 and 13 already passed on the old code and tasks 18 and 22 have no test.
- Accepted: docs/plans/202611/logs/787-show-authoring-rules/build-decision-1-10.md: Decision: Accept — owner: "yes ok to accept all"; left re-running the tests against the old code to my call, and it adds nothing, because tasks 3 and 13 already passed on the old code and tasks 18 and 22 have no test.
- TEST EXCEPTION, task 3: `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `stops analysis at each internal bound` fails on overflow erasing established targets or continuing analysis without a limit reason. — accepted with no further reason given ("yes ok to accept all") (owner, 2026-11-13) (`docs/plans/202611/787-show-authoring-rules-plan.md`)
- TEST EXCEPTION, task 13: `.bkit/core/engine/install/modules/core.integration.test.ts` `upgrades shipped registrations without dropping consumer hook groups or permissions` fails on an upgrade from the shipped layout that loses a custom hook group or custom permission entry on any host. — accepted with no further reason given ("yes ok to accept all") (owner, 2026-11-13) (`docs/plans/202611/787-show-authoring-rules-plan.md`)
- TEST EXCEPTION, task 18: `.bkit/core/engine/install/write.test.ts` `drops an entry the previous template shipped and the current one retired` fails on `mergeManagedJson({ plugin: ["./plugin/bkit-old.js", "./plugin/bkit-gateguard.js"] }, { plugin: ["./plugin/bkit-gateguard.js"] })` keeping `./plugin/bkit-old.js` when the previous shipped template held it. — accepted with no further reason given ("yes ok to accept all") (owner, 2026-11-13) (`docs/plans/202611/787-show-authoring-rules-plan.md`)
- TEST EXCEPTION, task 22: `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` `keeps a shell target eligible after an unverified Cursor edit reminder` fails on `runShell("sed -i s/a/b/ docs/a.md", session)` after `run(writePayload("docs/a.md", session))` returning an `agent_message` without `First edit to`. — accepted with no further reason given ("yes ok to accept all") (owner, 2026-11-13) (`docs/plans/202611/787-show-authoring-rules-plan.md`)

## Recommended Next Step

```text
/bkit-ship #787
```
