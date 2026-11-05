Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

Coverage: partial diff coverage. Findings are limited to the supplied diff and source changes inspected directly. The publisher, provider inspection, locks, subprocess deadlines, lifecycle callers and corresponding tests were reviewed. This verdict does not claim a complete audit of omitted generated mirrors or installed third-party skill documentation.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A lost append response lets the next report overwrite an intervening human correction.
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tracker.ts:1817`
  - **DONE WHEN:** Recognizing a delivered section after a lost response preserves its successful outcome and known URL, but does not adopt an altered remote revision as future append authority. Retain append eligibility only when the recovered representation is proven to match the intended engine aggregate; otherwise seal the segment and start the next routine report in a new comment. A marker-preserving human correction survives that next report. The current recognition branch accepts ID, author and section marker, then saves the locally intended source with the human-edited fingerprint; its postflight sees the same edited revision and retains it. The existing recognition test has no intervening edit or third report. An independently rerun local built-export reproduction returned three successes, one comment, and correction-preserved true after recognition but false after the third report. This violates `docs/security.md` § Workflow comment ownership and `docs/architecture.md` § Tracker reporting boundary, beyond the accepted final-preflight race.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.test.ts` `preserves a human correction after lost append recognition and a later report` fails on a marker-preserving edit between a lost append acknowledgment and recognition being overwritten by a subsequent routine report; assert acknowledged delivery remains successful, the correction remains intact, and the later report creates a fresh comment without editing the corrected segment.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Auto startup with a PR link prematurely terminates its routine progress segment.
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/issues.ts:1084`
  - **DONE WHEN:** Ordinary PR-link metadata does not classify a report as terminal or select an ended-run identity. The actual auto startup command with `--pr-number`, followed by Dispatch in the same explicit session, shares one routine progress comment; an explicitly identified final Create PR report remains a separate terminal comment. Propagate that explicit completion purpose through the build caller and generated host contracts. The command currently treats every `prNumber` as terminal even though `.bkit/core/workflows/bkit-auto.md:126` uses it on Start Workflow. An independently rerun built-command reproduction returned two successful creates, no edit and no startup progress marker. The existing clean-build integration cases cover final PR reporting, but not this auto startup shape. This violates `.bkit/trackers.md` § Workflow comment delivery and the plan's routine-startup acceptance scenario.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `keeps auto startup with PR metadata and dispatch in one progress comment` fails on the real startup and Dispatch CLI flag shapes creating two comments despite the same valid session; assert the routine aggregate contains both reports and a later explicit completion remains separate.

<!-- bkit:task 2 end -->

## Validation Notes

Both reported behavior reproductions were independently executed against the committed built exports under the repository's shared tests lock. They used synthetic transports and temporary repositories, made no provider calls, and exited zero with the faulty observations described above. The reproduction commands are preserved in `build-plan-verify-holistic.md`.

The supplied required changed-test run remains failed: its related selection timed out `preserves substantive step results under every comment boundary fault` at 37,200 ms, with 41,911 ms reported. Its later named selection passed 149 files and 7,766 tests with two existing skips. That later pass does not turn the overall failed command into a pass. The existing Task 7 already owns this case and its nine fault boundaries with both substantive verdicts, so this review does not invent a duplicate behavior finding or waive its unresolved validation. Preserve its assertions and obtain the workflow's required passing gate after the repairs. No broad test suite was rerun for this challenge.
