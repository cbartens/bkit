Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Resuming debug or retrying challenge formatting displays an incorrect budget attempt
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:481`
  - **DONE WHEN:** Progress derives the attempt and allowance from the same workflow counter: normal debug remediation uses its cross-run remediation count, saved soak attempts survive later completions, and build challenge uses its challenge round rather than its report invocation count. This preserves the counter scopes documented in `.bkit/core/.bkit/workflows.md` under Counters and Progress Lines and the plan's requirement to use normal/soak/challenge counter contexts.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress normal debug attempts span runs` fails when one remediation in a completed debug run followed by the first remediation in a new run with a frozen maximum of three emits no `Attempt 2 of 3` suffix.
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress reuses saved soak counter on later completions` fails when a saved `soakAttempt: 4`, a maximum of three and one grant are followed by `debug-run-tests --attempt=2`, producing `Attempt 2 of 6` instead of `Attempt 4 of 6`.
    - `.bkit/core/engine/commands/workflow/progress.integration.test.ts` `progress challenge budget follows round rather than report attempt` fails when `build-challenge --attempt=2 --field=round=1` follows the first report in round one and incorrectly prints `Attempt 2 of 2`, although the challenge remains in its first budget round.

<!-- bkit:task 1 end -->

Evidence: all three cases reproduced with the built `dist/cli.js steps done` command against isolated valid status ledgers. Each completion succeeded with exit code 0. `stepProgress` prefers the row-local `attempt` over challenge `round`, never derives the cross-run normal remediation count, and accepts saved soak counts only when their type is numeric even though `runOrStepField` returns a string. Existing progress tests cover same-run retries and a soak count on the current completion; they do not cover these counter transitions.

Coverage: partial diff coverage. The supplied capped diff omits source content; relevant engine and workflow changes were reviewed through scoped git diffs. Findings are limited to the reviewed content. No broad test suite was rerun and no implementation changes were made.
