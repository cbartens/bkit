Verdict: CONCERNS
Failures: 0
Coverage: partial diff coverage supplemented by the supplied full raw diff

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

### Confirmed gap already owned by plan Task 7

The late-head reconciliation gap remains open (HIGH, mechanical, fixable). This is not a new challenge task because Task 7 already requires retries to refresh state and new feature code to invalidate sweep/docs completion. No independent new task-block finding was confirmed.

- **Location:** `.bkit/core/workflows/bkit-ship.md:645`, `.bkit/core/workflows/bkit-ship.md:689`; supporting engine path `.bkit/core/engine/commands/workflow/runs.ts:2369`.
- **Evidence:** Step 9 returns to Step 3 only when `RECONCILE_REQUIRED` is already true. `runRevalidate` independently reads the remote PR head; when its diff from `CODE_HEAD` is not bookkeeping, it selects that new head as `validatedHead`, waits for CI, and returns success. Step 9 accepts that head and proceeds to Step 10. The gate's exit-17 route likewise returns to Step 9 with `REVALIDATE_REASON=gate-refusal` but never sets `RECONCILE_REQUIRED`. The flag is set only for the later `prs merge` exit-9 route.
- **Consequence:** A remote feature-code push after Step 8 can reach merge after green CI without local reconciliation, inherited-unpublished-dev eligibility checks, or refreshed deferred-sweep/docs coverage. The fresh-base gate does not close this gap: it proves current dev ancestry and CI, not those feature-state obligations.
- **Regression needed:** In `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`, cover a newly observed code head in Step 9 and a Step 10 exit-17 head change independently; require both routes to re-enter reconciliation and coverage checks before merge. In `.bkit/core/engine/commands/workflow/runs.test.ts`, exercise remote code movement after the recorded code head and require an explicit reconciliation-needed outcome before accepting it as covered. Existing new workflow tests inspect Steps 5/6 reuse wording and the post-attempt retry destinations, so their passing assertions do not cover these earlier observations.
- **Docs cross-reference:** `.bkit/workflows.md` § `/bkit-ship` Steps 3, 5 and 6 assigns feature reconciliation and coverage ownership; `docs/testing.md` § Ship merge-gate + bookkeeping test coverage identifies workflow invariants as the Tier-2 enforcement surface. The implementation plan Task 7 `DONE WHEN` already owns the required end state. Remediate and reverify Task 7 before marking the build complete.

## Review Coverage

The initial artifact reported partial diff coverage. The caller subsequently supplied `.git/bkit-outbox/842-ship-fails-local/bkit-diff-842-ship-fails-local.raw.md` as the replacement full diff. The substantive engine, workflow, resolver and added regression sections were inspected, including command error exits, pending-merge continuation, fresh-base checks, scoped transport inputs, cleanup preservation and reuse-state routing. Review depth was concentrated on those changed behavior surfaces. Generated mirrors and installed third-party reference payloads were not independently reviewed line by line; the installed skill entries and their source/hash provenance were inspected. No test suite or generation command was run by this review, and no independent parity or whole-diff correctness claim is made.

The installed Node skill recommends universal activation and type stripping. Those are untrusted guidance, not authorization to alter this repository's existing build or activate a second workflow; neither directive was followed. This is a guidance-boundary observation, not a bug-lens task.

Only this report was written. No implementation, plan, test, staging or commit changes were made. The unresolved Task 7 gap must return through the existing verification/remediation loop; this verdict does not certify build completion.
