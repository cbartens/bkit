Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

CONCERNS

- build-challenge round 1: LOW .bkit/core/engine/commands/workflow/tracker.ts:2026
- build-challenge round 1: LOW .bkit/core/engine/commands/workflow/tracker.ts:2019
- build-challenge round 1: LOW docs/security.md:62
- 3 deferral(s) from this run remain open

Plan tasks: 6 of 6 ticked in `docs/plans/202611/918-ad-hoc-agent-plan.md`.

Publish: held

Docs: not synced (ship syncs on landing)

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 1 | - |
| build-worktree-setup | - | - | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-input-1.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | - |
| build-plan-current | PASS | - | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-plan-current.md` |
| build-install-skills | - | - | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-install-skills.md` |
| build-group-start (group 1) | - | - | 1 | - |
| build-plan-tests (group 1) | PASS | - | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | - | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | - | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 0 | 2 | `docs/plans/202611/logs/918-ad-hoc-agent/build-plan-verify-1-2.md` |
| build-plan-gaps-remediate (group 1) | PASS | - | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-plan-gaps-remediate-1-1-log.md` |
| build-group-gate (group 1) | PASS | - | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-group-gate-1-2.md` |
| build-group-start (group 2) | - | - | 1 | - |
| build-plan-tests (group 2) | PASS | - | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | - | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | - | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 0 | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-plan-verify-2-1.md` |
| build-plan-verify-holistic | PASS | 0 | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-plan-verify-holistic-1.md` |
| build-challenge | CONCERNS | 3 | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-challenge-1.md`, `docs/plans/202611/logs/918-ad-hoc-agent/build-challenge-2.md` |
| build-run-tests | PASS | 0 | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/run-tests-1.md` |

## Resolved Findings

None

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/918-ad-hoc-agent/build-input-1.md` |
| build-branch-sync | - | - | - |
| build-plan-convert | - | 1 | - |
| build-plan-current | PASS | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-plan-current.md` |
| build-install-skills | - | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-install-skills.md` |
| build-group-start (group 1) | - | - | - |
| build-plan-tests (group 1) | PASS | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | CONCERNS | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-plan-verify-1-1.md` |
| build-plan-gaps-remediate (group 1) | PASS | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-plan-gaps-remediate-1-1-log.md` |
| build-plan-verify (group 1) | PASS | 2 | `docs/plans/202611/logs/918-ad-hoc-agent/build-plan-verify-1-2.md` |
| build-group-gate (group 1) | PASS | 2 | `docs/plans/202611/logs/918-ad-hoc-agent/build-group-gate-1-2.md` |
| build-group-start (group 2) | - | - | - |
| build-plan-tests (group 2) | PASS | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-plan-verify-2-1.md` |
| build-plan-verify-holistic | PASS | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-plan-verify-holistic-1.md` |
| build-challenge | CONCERNS | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/build-challenge-1.md`, `docs/plans/202611/logs/918-ad-hoc-agent/build-challenge-2.md` |
| build-run-tests | PASS | 1 | `docs/plans/202611/logs/918-ad-hoc-agent/run-tests-1.md` |

## Challenge

- LOW, deferred: 918-ad-hoc-agent-challenge-low-bkit-core-engine-commands-workflow-tracker-ts-2026 — LOW build challenge finding at .bkit/core/engine/commands/workflow/tracker.ts:2026: An ad-hoc agent passes --kind=audit --audit-slug=x/../../.. --body-file=notes.md (a file at the repo root) and the run-proof guard accepts it, because the audit proof joins an unvalidated slug into the outbox path; only buildComment's later slug check stops the body today. Done when: commentRunProof returns null unless --audit-slug matches ^[a-z0-9-]+$ before the slug is joined into <outbox>/audit-{slug}, as the plan's Architecture commentRunProof "audit" bullet specifies; a path-traversing slug is refused by the guard itself with the "workflow steps only" message, not by the later "--kind=audit needs --audit-slug" usage error.
- LOW, deferred: 918-ad-hoc-agent-challenge-low-bkit-core-engine-commands-workflow-tracker-ts-2019 — LOW build challenge finding at .bkit/core/engine/commands/workflow/tracker.ts:2019: An ad-hoc caller passes --kind=audit --audit-slug=x/../../.. --body-file=agenda.md and the audit run proof accepts it, because the unvalidated slug walks audit-{slug} up out of the outbox to the repo root. Done when: commentRunProof returns "audit" only when --audit-slug matches ^[a-z0-9-]+$ (the allowlist the plan's Architecture section for tracker.ts names and buildComment already applies at .bkit/core/engine/commands/workflow/issues.ts:846), so a traversal slug is refused by the guard itself with the "workflow steps only" message instead of relying on the later buildComment slug check to stop the comment
- LOW, deferred: 918-ad-hoc-agent-challenge-low-docs-security-md-62 — LOW build challenge finding at docs/security.md:62: docs/security.md says an ad-hoc agent "cannot post" a marked comment, yet any agent passes the guard with a guessed --session-dir=.git/bkit-outbox/sessions/x (the folder need not exist) or a committed status.jsonl, so a reviewer relying on the doc treats a speed bump as a boundary. Done when: § Workflow comment ownership states the refusal as a misuse guard, not an authorization boundary: it says the proofs (a path under the Git-common bkit-outbox/sessions/, a run status.jsonl, an audit outbox body file) can be supplied by any local caller, and that the marker carries no provenance, matching the plan's own Assumption ("The guard is a speed bump")

## Tests

- Attempt 1: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-ship #918
```
