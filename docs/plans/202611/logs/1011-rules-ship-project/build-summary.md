Verdict: CONCERNS
Failures: 0
<!-- verdict:end -->

# Build Summary

## Verdict

CONCERNS

- build-challenge round 1: LOW .bkit/core/engine/checks/tips/detect.ts:242
- build-challenge round 1: LOW .bkit/instructions.md:2573
- build-challenge round 2: LOW .bkit/core/engine/checks/tips/detect.ts:244
- 3 deferral(s) from this run remain open

Plan tasks: 7 of 7 ticked in `docs/plans/202611/1011-rules-ship-project-plan.md`.

Publish: held

Docs: not synced (ship syncs on landing)

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| build-start-workflow | - | - | 1 | - |
| build-worktree-setup | - | - | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-input-2.md` |
| build-branch-sync | - | - | 1 | - |
| build-plan-convert | - | - | 1 | `docs/plans/202611/1011-rules-ship-project-plan.md`, `docs/plans/202611/logs/1011-rules-ship-project/build-plan-check.md` |
| build-plan-current | - | - | 1 | - |
| build-install-skills | - | - | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-install-skills.md` |
| build-group-start (group 1) | - | - | 1 | - |
| build-plan-tests (group 1) | PASS | - | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | - | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | - | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 0 | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-plan-verify-1-1.md` |
| build-group-gate (group 1) | PASS | - | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-group-gate-1-1.md` |
| build-group-start (group 2) | - | - | 1 | - |
| build-plan-tests (group 2) | PASS | - | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | - | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | - | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 0 | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-plan-verify-2-1.md` |
| build-plan-verify-holistic | PASS | 0 | 3 | `docs/plans/202611/logs/1011-rules-ship-project/build-plan-verify-holistic-2-3.md` |
| build-holistic-gate | PASS | - | 2 | `docs/plans/202611/logs/1011-rules-ship-project/build-holistic-gate-2-3.md` |
| build-challenge | CONCERNS | 4 | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-challenge-1.md`, `docs/plans/202611/logs/1011-rules-ship-project/build-challenge-2.md` |
| build-group-start (group 3) | - | - | 1 | - |
| build-plan-tests (group 3) | PASS | - | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | - | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-tests-red-3-1.md` |
| build-plan-tasks (group 3) | PASS | - | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 0 | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-plan-verify-3-1.md` |
| build-challenge | CONCERNS | 1 | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-challenge-1.md`, `docs/plans/202611/logs/1011-rules-ship-project/build-challenge-2.md` |
| build-run-tests | PASS | 0 | 1 | `docs/plans/202611/logs/1011-rules-ship-project/run-tests-1.md` |

## Resolved Findings

- build-challenge round 1: MEDIUM .bkit/core/engine/checks/tips/detect.ts:243, resolved by build-plan-verify (group 3, task 6)
- build-challenge round 1: MEDIUM .bkit/core/engine/checks/tips/detect.ts:245, resolved by build-plan-verify (group 3, task 7)

## Assessment History

<!-- prettier-ignore -->
| Step | Verdict | Attempt | Artifact |
| --- | --- | --- | --- |
| build-start-workflow | - | - | - |
| build-worktree-setup | - | - | `docs/plans/202611/logs/1011-rules-ship-project/build-input-2.md` |
| build-branch-sync | - | - | - |
| build-plan-convert | - | 1 | `docs/plans/202611/1011-rules-ship-project-plan.md`, `docs/plans/202611/logs/1011-rules-ship-project/build-plan-check.md` |
| build-plan-current | - | 1 | - |
| build-install-skills | - | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-install-skills.md` |
| build-group-start (group 1) | - | - | - |
| build-plan-tests (group 1) | PASS | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-plan-tests-1-log.md` |
| build-tests-red (group 1) | - | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-tests-red-1-1.md` |
| build-plan-tasks (group 1) | PASS | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-plan-tasks-1-log.md` |
| build-plan-verify (group 1) | PASS | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-plan-verify-1-1.md` |
| build-group-gate (group 1) | PASS | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-group-gate-1-1.md` |
| build-group-start (group 2) | - | - | - |
| build-plan-tests (group 2) | PASS | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-plan-tests-2-log.md` |
| build-tests-red (group 2) | - | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-tests-red-2-1.md` |
| build-plan-tasks (group 2) | PASS | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-plan-tasks-2-log.md` |
| build-plan-verify (group 2) | PASS | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-plan-verify-2-1.md` |
| build-plan-verify-holistic | PASS | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-plan-verify-holistic-2-1.md` |
| build-plan-verify-holistic | CONCERNS | 2 | `docs/plans/202611/logs/1011-rules-ship-project/build-plan-verify-holistic-2-2.md` |
| build-holistic-gate | PASS | 2 | `docs/plans/202611/logs/1011-rules-ship-project/build-holistic-gate-2-2.md` |
| build-challenge | CONCERNS | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-challenge-1.md`, `docs/plans/202611/logs/1011-rules-ship-project/build-challenge-2.md` |
| build-group-start (group 3) | - | - | - |
| build-plan-tests (group 3) | PASS | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-plan-tests-3-log.md` |
| build-tests-red (group 3) | - | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-tests-red-3-1.md` |
| build-plan-tasks (group 3) | PASS | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-plan-tasks-3-log.md` |
| build-plan-verify (group 3) | PASS | 1 | `docs/plans/202611/logs/1011-rules-ship-project/build-plan-verify-3-1.md` |
| build-plan-verify-holistic | PASS | 3 | `docs/plans/202611/logs/1011-rules-ship-project/build-plan-verify-holistic-2-3.md` |
| build-holistic-gate | PASS | 3 | `docs/plans/202611/logs/1011-rules-ship-project/build-holistic-gate-2-3.md` |
| build-challenge | CONCERNS | 2 | `docs/plans/202611/logs/1011-rules-ship-project/build-challenge-1.md`, `docs/plans/202611/logs/1011-rules-ship-project/build-challenge-2.md` |
| build-run-tests | PASS | 1 | `docs/plans/202611/logs/1011-rules-ship-project/run-tests-1.md` |

## Challenge

- Task 6 — MEDIUM — ticked (`docs/plans/202611/1011-rules-ship-project-plan.md`)
- Task 7 — MEDIUM — ticked (`docs/plans/202611/1011-rules-ship-project-plan.md`)
- LOW, deferred: 1011-rules-ship-project-challenge-low-bkit-core-engine-checks-tips-detect-ts-242 — LOW build challenge finding at .bkit/core/engine/checks/tips/detect.ts:242: A Project Rules bullet that quotes an unclosed HTML comment opener in a code span makes the comment strip swallow everything up to the next comment closer, including the `## Project Goals` heading, so the tip fires although the goals are filled. Done when: an unclosed comment opener outside the `## Project Goals` section can no longer remove the heading or its bullets; for example the detector finds the section on the raw text below `<!-- bkit:end -->` first and strips HTML comments only inside the section
- LOW, deferred: 1011-rules-ship-project-challenge-low-bkit-instructions-md-2573 — LOW build challenge finding at .bkit/instructions.md:2573: A goal that rewards finishing unattended (bkit's own `Runs finish unattended`) tips a security challenger's borderline CRITICAL down to HIGH, so the gate reports CONCERNS instead of FAIL. Done when: The owner has decided whether `Project Goals` may break ties in the severity and verdict calls of gate agents (`bkit-build-challenge-*`, `bkit-build-plan-verify`, `bkit-*-review-*`, `bkit-plan-scope-check`, `bkit-ship-deferred-sweep`). Then either clause `rules-leaf` states the limit (for example "goals never lower a severity or a verdict"), or `docs/decisions.jsonl` records the accepted risk. No agent can settle this alone: the plan records the owner's decision to put one clause in all 40 prompts, and its recorded reasons cover scope creep only, not gate calls.
- LOW, deferred: 1011-rules-ship-project-challenge-low-bkit-core-engine-checks-tips-detect-ts-244 — LOW build challenge finding at .bkit/core/engine/checks/tips/detect.ts:244: The owner (or a heading-case linter) writes the heading as `## Project goals` above filled goals, so the tip fires on every design and plan run and tells the agent to add a second `## Project Goals` section. Done when: `hasProjectGoalsHeading` (`detect.ts:244`) and the section match in `hasNoProjectGoals` (`detect.ts:255`) find the `## Project Goals` heading whatever its letter case, so a filled `## Project goals` section keeps the tip quiet and a comment-only one gets the fill-the-existing-section ask, never the add-a-section ask

## Tests

- Attempt 1: PASS, failures 0, ran `pnpm bkit:gate:static-unit-integration`

## Risks and Action Items

None

## Recommended Next Step

```text
/bkit-ship #1011
```
