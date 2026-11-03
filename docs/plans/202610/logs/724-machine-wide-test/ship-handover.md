# Debug Abort Handover

## The Short Version

Shipping stopped because the test-removal scan reported 107 hits across 12 files. The pull request remains open; the findings need reconciliation before another ship attempt.

## What's Actually Happening

The scan exited 1 against `origin/dev`, so the sweep's required rule produced FAIL. It counts deleted assertions, including a renamed test file whose compatibility scenarios survive. Other deletions need replacement-coverage checks. The evidence does not establish 107 runtime regressions or a root cause for every hit. Diff coverage is partial.

## Rot Signals

None. No diagnosis attempts were supplied.

## Out-of-Scope Recommendations

None. The four existing declared deferrals passed triage as Exempt; no new deferral was created.

## Attempt History

<!-- prettier-ignore -->
| Strategy | Action and outcome |
| --- | --- |
| STANDARD | Integrated `dev` and pushed `8543394a21a5e65de7f97c8fcc1d737e1562a3e6`; local push checks passed. |
| STANDARD | Disabled-test scan: initial sandbox fetch denial; permitted retry fetched successfully and retained 107 hits. Sweep FAIL. No remediation attempted. |

## Verified Resolutions (do not roll back)

Preserve the integrated feature work and machine-lock implementation. The sweep supports all intended deliverables and records shell syntax and adopted-template parity checks. Earlier build verification is historical evidence, not a fresh suite run by the sweep.

## Persistent Errors

Step 5, sub-step 4 failed: `branches scan-diff --disabled-tests --base=origin/dev` exited 1. `ship-deferred-sweep.md` lists every hit as B001–B107, including repeated coordinates. Its reported names can refer to adjacent tests. Renamed `local-stack-lock.integration.test.ts` assertions are included. Deleted resolve-push-base, ci-scripts and workflow assertions also require reconciliation. `workflows fail` recorded FAILED, added `bkit:failed`, and released the workflow lock. No merge occurred.

## Recommended Next Steps

1. Map each hit to surviving coverage. ✅ FIXES attribution uncertainty. ❌ does not FIX missing tests. ⚠️ COST: focused review across 12 files.
2. Restore genuinely lost coverage. ✅ FIXES verified gaps. ❌ does not FIX rename detection. ⚠️ COST: targeted tests and validation.
3. Correct proven scanner misclassification through the normal change process. ✅ FIXES false positives. ❌ does not FIX real coverage loss. ⚠️ COST: scanner regression tests and review.
4. Rerun the scan and ship workflow. ✅ FIXES stale gate evidence after corrections. ❌ does not FIX unresolved hits. ⚠️ COST: local checks and CI time.

## Recommended Path

Start with coverage mapping, then repair only demonstrated gaps or scanner errors. Preserve assertions and gate strength. Resume with `/bkit-ship 724-machine-wide-test` after the required scan passes.

## Reference Docs

- `ship-input-1.md`: owner context and plan.
- `ship-deferred-sweep.md`: source evidence, all scanner hits and four exempt deferrals.
- `status.jsonl`: execution and FAILED state.
- `tmp/bkit-diff-724-machine-wide-test.md`: partial diff coverage.
- Pull request: https://github.com/cbartens/bkit/pull/848.
- No ship diagnosis, remediation or merge-CI evidence exists for this run.
