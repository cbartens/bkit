# Debug Abort Handover

## The Short Version

All five progress-line tasks are implemented and reviewed. Publication remains blocked by four test timeouts and a source-test conflict encountered while resuming; the resolver safely restored the branch.

## What's Actually Happening

Covered corpus scans and nested Node subprocesses exceeded elapsed-time budgets under host load. Their precise cost remains unresolved. Separately, rebasing onto newer `origin/dev` conflicted in `steps.test.ts`; the mechanical resolver refuses source conflicts. No time limit applies.

## Rot Signals

tests, reliability

- tests: repeated whole-corpus scans and a nested synchronous test suite have resource-sensitive wall-clock budgets; three signatures already recur in the ledger.
- reliability: the required local gate intermittently fails without assertion differences, blocking unrelated feature delivery; #814 remains open.

## Out-of-Scope Recommendations

- `.bkit/core/engine/tools/instructions.ts:763,978`: under #814, profile and reduce redundant corpus/clause work while preserving exact findings and sync output. This implementation appears through failure paths, not as a #825 work target.
- `.bkit/core/engine/tools/instructions.test.ts:55,213,228,1029` and `.bkit/core/engine/audits/templates/ci-scripts.test.ts:260`: include the newly observed sync timeout in #814 evidence and validate any scheduling/performance change against the covered full gate. Do not weaken assertions, skip tests or increase budgets in #825.
- `vitest.config.ts`, `vitest.timeout-budget.ts`, `vitest.setup.ts`: a permanent shared runner scheduling solution belongs to #814; this diagnosis only verifies the existing environment control.
- `docs/failures.jsonl`: correct the retired-clause entry's stale CLI-spawn explanation separately and extend the corpus incident with the sync case. No ledger changes were made by this diagnosis.

## Attempt History

<!-- prettier-ignore -->
| Strategy | Attempt and outcome |
| --- | --- |
| STANDARD | Final gate: four timeouts; 6983 passed, two skipped; Bats/integration not reached. |
| STANDARD | Four isolated assertions passed without coverage. Covered one-worker scans passed, but the child test still took 37.725s against 30s. |
| STANDARD | Resume rebase onto `02eab8bf` refused `steps.test.ts`; aborted safely. |

## Verified Resolutions (do not roll back)

Preserve progress calculation, output propagation, provider narration and counter-context corrections. Group verification and final challenge passed; fresh consumer checks passed. The phone screenshot remains unverified. The complete review disclosed partial aggregate diff coverage.

## Persistent Errors

- `instructions.test.ts:213,228`: `Error: Test timed out in 70128ms.`
- `instructions.test.ts:1029`: `Error: Test timed out in 5844ms.`
- `ci-scripts.test.ts:260`: `Error: Test timed out in 30000ms.`
- Resume: `REFUSE .bkit/core/engine/commands/workflow/steps.test.ts — not an append-only ledger, a recognised lockfile or a generated register`; exit 3, rebase aborted.

## Recommended Next Steps

1. Resolve the source conflict with review. ✅ FIXES branch synchronization; ❌ does not FIX timeouts; ⚠️ COST small merge review.
2. Profile covered subprocess/scanner cost under #814. ✅ FIXES the evidence gap; ❌ does not FIX synchronization; ⚠️ COST measured investigation.
3. Run the unchanged full gate after a measured remedy. ✅ FIXES validation gap if green; ❌ does not FIX unmeasured causes; ⚠️ COST full suite.
4. Capture the 375px Claude screenshot. ✅ FIXES layout evidence; ❌ does not FIX build blockers; ⚠️ COST owner device check.

## Recommended Path

Resolve synchronization first, then continue measured timeout remediation and the complete gate before pushing or creating a PR. One worker alone was insufficient; preserve assertions, coverage and budgets.

## Reference Docs

`build-failure-diagnose-1.md`, `run-tests-1.md`, `build-plan-verify-3-1.md`, `build-challenge-{1,2}.md`, `status.jsonl`, `rebase-resolve-log.md`; raw gate log in `.git/bkit-outbox/825-show-progress-bar/run-tests-1.log`. Related issue: [#814 — Give load-sensitive tests a budget that holds under the full gate](https://github.com/cbartens/bkit/issues/814). No PR exists.
