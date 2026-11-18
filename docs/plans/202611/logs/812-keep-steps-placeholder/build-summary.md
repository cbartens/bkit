Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

CONCERNS

- build-challenge round 1: LOW .bkit/core/engine/commands/workflow/steps.ts:1175
- build-challenge round 1: LOW .bkit/core/engine/commands/workflow/steps.ts:871
- build-challenge round 1: LOW .bkit/core/engine/commands/workflow/steps.ts:1161
- 3 deferral(s) from this run remain open

Plan tasks: 3 of 3 ticked in `docs/plans/202611/812-keep-steps-placeholder-plan.md`.

Publish: held

Docs: not synced (ship syncs on landing)

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 1 | - |
| build-worktree-setup | - | - | 1 | `docs/plans/202611/logs/812-keep-steps-placeholder/build-input-1.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | `docs/plans/202611/812-keep-steps-placeholder-plan.md`, `docs/plans/202611/logs/812-keep-steps-placeholder/build-plan-check.md` |
| build-plan-current | - | - | 1 | - |
| build-install-skills | - | - | 1 | `docs/plans/202611/logs/812-keep-steps-placeholder/build-install-skills.md` |
| build-group-start (group 1) | - | - | 1 | - |
| build-plan-tests (group 1) | PASS | - | 1 | `docs/plans/202611/logs/812-keep-steps-placeholder/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | - | 1 | `docs/plans/202611/logs/812-keep-steps-placeholder/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | - | 1 | `docs/plans/202611/logs/812-keep-steps-placeholder/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 0 | 1 | `docs/plans/202611/logs/812-keep-steps-placeholder/build-plan-verify-1-1.md` |
| build-plan-verify-holistic | PASS | 0 | 1 | `docs/plans/202611/logs/812-keep-steps-placeholder/build-plan-verify-holistic-1-1.md` |
| build-holistic-gate | PASS | - | 1 | `docs/plans/202611/logs/812-keep-steps-placeholder/build-holistic-gate-1-1.md` |
| build-challenge | CONCERNS | 3 | 1 | `docs/plans/202611/logs/812-keep-steps-placeholder/build-challenge-1.md`, `docs/plans/202611/logs/812-keep-steps-placeholder/build-challenge-2.md` |
| build-run-tests | PASS | 0 | 1 | `docs/plans/202611/logs/812-keep-steps-placeholder/run-tests-1.md` |

## Resolved Findings

None

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/812-keep-steps-placeholder/build-input-1.md` |
| build-branch-sync | - | - | - |
| build-plan-convert | - | 1 | `docs/plans/202611/812-keep-steps-placeholder-plan.md`, `docs/plans/202611/logs/812-keep-steps-placeholder/build-plan-check.md` |
| build-plan-current | - | 1 | - |
| build-install-skills | - | 1 | `docs/plans/202611/logs/812-keep-steps-placeholder/build-install-skills.md` |
| build-group-start (group 1) | - | - | - |
| build-plan-tests (group 1) | PASS | 1 | `docs/plans/202611/logs/812-keep-steps-placeholder/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 1 | `docs/plans/202611/logs/812-keep-steps-placeholder/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | 1 | `docs/plans/202611/logs/812-keep-steps-placeholder/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 1 | `docs/plans/202611/logs/812-keep-steps-placeholder/build-plan-verify-1-1.md` |
| build-plan-verify-holistic | PASS | 1 | `docs/plans/202611/logs/812-keep-steps-placeholder/build-plan-verify-holistic-1-1.md` |
| build-holistic-gate | PASS | 1 | `docs/plans/202611/logs/812-keep-steps-placeholder/build-holistic-gate-1-1.md` |
| build-challenge | CONCERNS | 1 | `docs/plans/202611/logs/812-keep-steps-placeholder/build-challenge-1.md`, `docs/plans/202611/logs/812-keep-steps-placeholder/build-challenge-2.md` |
| build-run-tests | PASS | 1 | `docs/plans/202611/logs/812-keep-steps-placeholder/run-tests-1.md` |

## Challenge

- LOW, deferred: 812-keep-steps-placeholder-challenge-low-bkit-core-engine-commands-workflow-steps-ts-1175 — LOW build challenge finding at .bkit/core/engine/commands/workflow/steps.ts:1175: A `steps finish --agent=X --derived-artifact=related.md` call with no matching `--artifact` reads the step's verdict header from copied external text, so a forged `Verdict: PASS` / `Failures: 0` header in another issue's body sets the step verdict. Done when: `--derived-artifact` files are excluded from every slot that reads an artifact as the run's own output: the `--agent` position count and `artifacts[i]` header read (`steps.ts:1174-1187`), the `build-challenge` findings merge (`steps.ts:1226-1230`) and the `build-decision` `continueCheck(artifacts[0])` decision file; they stay in `artifacts` for presence, recording, the row and `laterAttempts`; `steps finish --agent=bkit-build-challenge-1 --derived-artifact=logs/related.md` with no `--artifact` exits 2 naming "each --agent reads the --artifact in the same position"
- LOW, deferred: 812-keep-steps-placeholder-challenge-low-bkit-core-engine-commands-workflow-steps-ts-871 — LOW build challenge finding at .bkit/core/engine/commands/workflow/steps.ts:871: A step that passes one path as both `--artifact` (or `--optional-artifact`) and `--derived-artifact` (directly, or after `<attempt>` fills both to the same name) finishes with a `PENDING` stub left in its own artifact, because the skip matches by path string instead of by the flag that supplied the entry. Done when: an entry from `--artifact` or `--optional-artifact` is always scanned for `PENDING` whatever `--derived-artifact` holds (the skip keys on the flag the entry came from, or finish refuses a path given under two artifact flags with a usage error); `steps finish --artifact=logs/own.md --derived-artifact=logs/own.md` with `PENDING` in `logs/own.md` exits non-zero naming "placeholders logs/own.md"
- LOW, deferred: 812-keep-steps-placeholder-challenge-low-bkit-core-engine-commands-workflow-steps-ts-1161 — LOW build challenge finding at .bkit/core/engine/commands/workflow/steps.ts:1161: A `--derived-artifact` file of copied external text joins the step's own artifact list, so a finish with no own artifact posts an issue commenter's text as the bkit `--comment-body`, reads an `--agent` verdict from it, or puts its DONE line in the commit message. Done when: `finish` keeps derived artifacts out of every position-based read: the `--agent` count check and verdict reads (`steps.ts:1174`, `steps.ts:1187`), the `build-challenge` findings parse (`steps.ts:1226`), `continueCheck` and the BLOCKED-line read of `artifacts[0]` (`steps.ts:1330`, `steps.ts:1360`), the `<done>` description (`steps.ts:1604`) and the `--comment-body` source (`steps.ts:1658`) read only `--artifact` / `--optional-artifact` files; derived files are still presence-checked, recorded on the row and linked in the comment

## Tests

- Attempt 1: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Documentation Warnings

- **data-schema** (not applicable) — `docs/data-schema.md`
  - Evidence: The change adds a CLI flag and edits one workflow line; no database is touched.
  - Action: None needed.

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-ship #812
```
