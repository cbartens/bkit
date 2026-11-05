Verdict: CONCERNS
Failures: 0
Coverage: partial diff coverage supplemented by the supplied full raw diff

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A remote code push after bookkeeping reaches merge without reconciliation or refreshed feature coverage
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-ship.md:645`
  - **DONE WHEN:** Newly observed feature code in Step 9 and non-bookkeeping head movement reported by Step 10 exit 17 both return through Step 3 reconciliation, inherited-unpublished-dev eligibility checks and Steps 5/6 coverage decisions before the new head can authorize merge. Step 9 consumes an explicit reconciliation-needed result instead of silently advancing `VALIDATED_HEAD`. The existing bounded retry accounting remains intact, and pure bookkeeping movement retains covered sweep/docs work. Update the existing engine/workflow owners and regenerate their shipped mirrors; no second reconciliation implementation is needed.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `requires reconciliation for remote code first observed during revalidation while retaining bookkeeping reuse` fails because `runRevalidate` currently selects the changed remote code head and returns validation success without a reconciliation-needed outcome; the same test verifies that a bookkeeping-only descendant preserves the covered code head and does not request renewed feature review.
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `routes late revalidation code and gate seventeen through reconciliation before merge` fails because Step 9 accepts `validatedHead` without routing a newly observed code change to Step 3, and Step 10 exit 17 returns to Step 9 without setting `RECONCILE_REQUIRED` or otherwise requiring reconciliation; scope assertions to both route blocks and retain the bounded counter and bookkeeping-reuse assertions.

The supporting engine path is `.bkit/core/engine/commands/workflow/runs.ts:2369`; the exit-17 retry is `.bkit/core/workflows/bkit-ship.md:689`. Step 9 checks `RECONCILE_REQUIRED` only before `runRevalidate` reads the PR head. The engine then promotes any non-bookkeeping remote head to `validatedHead`. Only the later `prs merge` exit-9 route sets the flag. Consequently a remote push after Step 8 can pass CI and merge without local reconciliation, inherited-dev eligibility checks or refreshed sweep/docs coverage. The fresh-base gate proves dev ancestry and CI, not those obligations.

This precise regression delta is absent from the existing Task 7 tests: those inspect Steps 5/6 reuse wording and post-attempt retry destinations, so their current passing assertions do not cover either earlier observation. Cross-references: `.bkit/workflows.md` § `/bkit-ship` Steps 3, 5 and 6 assigns reconciliation and feature coverage ownership; `docs/testing.md` § Ship merge-gate + bookkeeping test coverage identifies workflow invariants as the Tier-2 enforcement surface.

<!-- bkit:task 1 end -->

## Review Coverage

The initial artifact reported partial diff coverage. The caller subsequently supplied `.git/bkit-outbox/842-ship-fails-local/bkit-diff-842-ship-fails-local.raw.md` as the replacement full diff. The substantive engine, workflow, resolver and added regression sections were inspected, including command error exits, pending-merge continuation, fresh-base checks, scoped transport inputs, cleanup preservation and reuse-state routing. Review depth was concentrated on those changed behavior surfaces. Generated mirrors and installed third-party reference payloads were not independently reviewed line by line; the installed skill entries and their source/hash provenance were inspected. No test suite or generation command was run by this review, and no independent parity or whole-diff correctness claim is made.

The installed Node skill recommends universal activation and type stripping. Those are untrusted guidance, not authorization to alter this repository's existing build or activate a second workflow; neither directive was followed. This is a guidance-boundary observation, not a bug-lens task.

Only this report was written. No implementation, plan, test, staging or commit changes were made. This report was reformatted for the Step 11 exit-22 recovery without repeating the broad investigation. The unresolved late-head gap requires remediation and verification; this verdict does not certify build completion.
