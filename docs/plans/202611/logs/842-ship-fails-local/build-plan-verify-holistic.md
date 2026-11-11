Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 3, 4, 5, 6, 8
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic: all eight tasks across both groups.

## Groups Verified

2 of 2.

## Integration Gaps

1: newly observed feature content can enter CI validation and merge without re-entering reconciliation and feature-coverage checks. See Task 7 in the gap log.

## Previously Attempted

Group 1: `build-plan-verify-1-1.md` found staged-index loss; `build-plan-gaps-remediate-1-1-log.md` fixed it, and `build-plan-verify-1-2.md` passed all four tasks. Group 2: `build-plan-verify-2-1.md` found merge-only content missing from coverage; `build-plan-gaps-remediate-2-1-log.md` fixed that comparison and refresh ordering, and `build-plan-verify-2-2.md` passed its four tasks. Both prior gaps remain resolved. No decision records were supplied or found. This is the first holistic attempt.

## Notes

Partial diff coverage: `tmp/bkit-diff-842-ship-fails-local.md` explicitly truncates a 20,596-line, 114-file branch diff. This review did not infer complete coverage from that artifact. It supplemented the prior group reviews with complete per-file Git diffs and current source reads for the engine owners, workflow, resolver, affected tests and documentation. The added third-party skill reference libraries were not reviewed line by line as product implementation. Generated host copies were assessed through generation/parity evidence rather than treating each repeated copy as an independent implementation.

Tasks 1–4 retain their verified command behavior: feature fetch/reconciliation precedes classification and publication; inherited unpublished dev checks guard setup and reconciled candidates; merged-entry qualification distinguishes newer feature work; one shared landed comparison protects cleanup, including index and working-tree state and expected-tip local deletion. The mechanical `notOnDev` deletion warning remains a false positive about intended imports/callers of the moved helper. Task 4 is judged satisfied despite its currently unticked plan box; the verifier does not edit the plan.

Tasks 5 and 6 correctly implement their opt-in command contracts. The pre-merge gate checks scoped fresh dev ancestry against the validated code head before CI override or bookkeeping carry-forward. Missing evidence refuses. Independently read merge state distinguishes moved head, conflict and terminal refusal while keeping generic behavior. Task 7 wires these outcomes but still has the cross-group route gap below: validating a newly observed remote head is not proof that its feature content passed reconciliation and the sweep/docs agents.

Task 8's five Documentation Updates rows are reflected in the canonical and generated catalogs, CLI reference, testing and observability guides. Compiled code contains the new reconciliation, feature-state, fresh-base and merge-retry contracts. `tmp/bkit-842-remediation-generate.log` records build, CLI/instruction synchronization, upgrade with zero conflicts, 288 passing render tests and regenerated capability diagrams. `tmp/bkit-842-coverage-consumer.log` and the group-2 verification record the fresh five-host consumer install/upgrade/check and compiled semantic-merge exercise. The earlier generation lock blocker was superseded by this successful generation evidence.

The enforced test-first reports record all 36 planned tests red then green, with no unproven tests. Group 1's only mechanical audit warning is adjudicated above; group 2 reports no gaps. Every Derived Test Matrix row maps to an owning task's named tests or Task 8's generation checks. The tests' current passing assertions do not exercise remote feature movement between coverage and Step 9, or the exit-17 coverage route. No planned test was loosened by this review. Existing compatibility expectation changes implement the declared retention and routing contracts.

Reviewed errors use the owning CLI logger and existing refusal/snapshot records. No source, tests, plan or commits were changed by this verifier.

Ran the required `node dist/cli.js tests changed --base=origin/dev --fallback=bkit:gate:static-unit`. The sandboxed invocation could not access the machine lock; the authorized retry ran but returned exit 1, with its failure detail lost to tool-output truncation. A diagnostic repeat retained the complete output in `tmp/bkit-holistic-changed.log` and passed without implementation changes: 2,520 related tests and 7,831 named tests passed, with two existing skips in each selection, plus the selected Node/Bats and static checks. Final output is `exitCode: 0`, `verdict: PASS`, `lockHolder: null`. The selections overlap and do not claim execution of every repository test. The earlier failed invocation is not diagnosed or silently relabeled as a lock wait; the final retained run establishes the current required gate result. No further repeat was run.

## Identified Gaps Log

TASK 7: `.bkit/core/workflows/bkit-ship.md:644` and `:684`, with `.bkit/core/engine/commands/workflow/runs.ts:2360` — newly-observed-feature-bypasses-coverage: New remote feature content discovered by Step 9 or by the Step 10 gate's exit 17 can be validated and merged without reconciliation or refreshed sweep/docs coverage. After Steps 5–6 cover local feature A, a concurrent push adds code B on the PR. `runRevalidate` chooses the current PR head when `onlyBookkeeping(CODE_HEAD, current)` fails, waits for its CI, and returns B as `validatedHead`; Step 9 stores it and proceeds directly to Step 10. If dev is already in B and CI is green, fresh-base and pinned-head checks permit merging B although the local checkout, eligibility check and coverage artifacts still describe A. The exit-17 retry likewise sets only `REVALIDATE_REASON=gate-refusal`; it never sets `RECONCILE_REQUIRED`, unlike the moved-head merge-refusal route. CI validation proves B's tests, not its reconciliation, inherited-dev eligibility or sweep/docs coverage. Route newly observed non-bookkeeping feature heads back through Step 3 and the refreshed Steps 5–6 before merge authorization, including initial Step 9 observation and exit-17 retries; retain direct polling/bookkeeping reuse when feature content is unchanged. Add discriminating real-Git/command and route regression evidence, and regenerate affected workflow/catalog mirrors. — Fixable: true
