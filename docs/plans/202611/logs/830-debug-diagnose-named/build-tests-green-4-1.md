Enforced: true
Verdict: PASS
Gaps: 0
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/830-debug-diagnose-named-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 10 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "checks the complete selected CI fix sequence against green and red final runs" | passed-accepted | passed |
| 10 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "reloads saved fixes and recollects explicitly replaced evidence generations" | passed-accepted | passed |
| 10 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "preserves local and repro overrides across actual workflow command sequences" | red | passed |
| 10 | `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "blocks missing logs and wrong-branch evidence before source edits" | passed-accepted | passed |

## Gaps

None.

## Already landed

- Task 10 `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "checks the complete selected CI fix sequence against green and red final runs" — passed at the group's red, and the tests step accepted it: implemented groups 1-3 retain exact attempt identity, defer actual local package gate until diagnosis/fix, and reject selected red run 302 despite configured CI success after green run 301; no red is due
- Task 10 `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "reloads saved fixes and recollects explicitly replaced evidence generations" — passed at the group's red, and the tests step accepted it: real fresh CLI processes reload saved generation/fix state and replacement run 124 starts generation 2 CI evidence without rerunning a locally passing gate; no red is due
- Task 10 `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` "blocks missing logs and wrong-branch evidence before source edits" — passed at the group's red, and the tests step accepted it: shipped context script rejects unavailable pinned logs and real runs locate exits 82 on fix/other versus adopted fix/ci without writing a selection; no red is due
