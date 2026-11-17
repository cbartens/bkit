Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 5, 6, 8
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 2, tasks 5–8. Compared the supplied group diff from `5bf200528d5003f9c89844a0c21d082e65190d2e` with the supplied briefs and current source.

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

Tasks 5 and 6 implement the declared opt-in contracts: fresh dev ancestry is checked against the validated code head before override/bookkeeping carry-forward; missing evidence refuses; foreign-repository and MCP facts are scoped; merge refusals distinguish moved heads, dev conflicts and terminal failures using independent rereads. Default command behavior remains covered by the existing tests. Refusal diagnostics use the owning command logger, and the fresh-base snapshot records the compared head and evidence availability.

Task 7 implements early reconciliation/publication, fresh-PR handling, pinned merge-target continuation, durable retry accounting, scoped MCP handoff and preservation on exhaustion. Its feature-coverage comparison remains incomplete for merge-only content, as logged below.

Task 8's five documentation rows are present in the canonical catalogs, generated catalogs, testing guide and observability guide. Compiled output includes the new reconciliation target, fresh-base gate and merge classification. `tmp/bkit-task8-generate-final.log` records build, CLI/instruction synchronization, five-provider regeneration with zero conflicts and 288 passing render tests. The fresh scratch-consumer install/upgrade/check logs show five host mirrors and zero drift writes. No publication was required or performed by this verifier.

The supplied test-first audit is enforced and PASS, with all 13 planned tests red then green, zero gaps and zero unproven tests. No loosened planned test was found. Each group-2 Derived Test Matrix row maps to its task's tests or task 8's generation checks. The completed changed gate records 7,571 named and 329 related tests passing, with two existing skips in each selection, and static checks passing (`tmp/bkit-task8-changed-pass.log`). The previously recorded intermittent wrapper JSON-read failure remains an OPEN pre-existing diagnostic; the supplied focused rerun did not reproduce it. This group review did not rerun build/install or claim a new full-suite execution.

## Identified Gaps Log

TASK 7: `.bkit/core/workflows/bkit-ship.md:422` and `:483` — feature-coverage-merge-content: The state uses `git rev-list --no-merges origin/dev..HEAD`, so feature changes made only by an imported merge commit do not change the recorded state when its non-merge ancestors were already covered. Likewise, Step 4 routes a resolved dev merge directly to Step 5 with the pre-integration state; its instruction to invalidate conflict-resolution feature code has no effective comparison because that merge is excluded. Steps 5–6 can therefore reuse sweep/docs artifacts that never covered the new feature content. Make the state account for merge-introduced feature changes while allowing proven base-only integrations to reuse coverage, refresh it before either reuse decision after integration, and add regression evidence covering unchanged non-merge ancestors with changed merge content. The existing planned structural test asserts the prose but does not establish this behavior. Regenerate affected workflow/catalog mirrors after remediation. — Fixable: true
