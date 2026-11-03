Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Cancelling a gate wrapper releases its lock while the gate keeps running
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh:370`
  - **UPDATE:** `.bkit/templates/scripts/ci/bkit-machine-lock.sh`: supervise the wrapped command on cancellation so the lock remains held until that command has stopped; mirror the adopted `scripts/ci/bkit-machine-lock.sh` copy through the normal generation path.
  - **DONE WHEN:** Sending SIGTERM to a running wrapper cannot leave its gate command alive after another run acquires the same tests lock; ordinary command status propagation and inherited-owner behavior still pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts` `terminating a run wrapper stops its gate before another run acquires the tests lock` fails because SIGTERM kills the wrapper, the Perl holder releases within a second, and the wrapped command survives while a second run acquires the lock.

<!-- bkit:task 1 end -->

Evidence: a real private-cache probe started `run challenge-holder --lock tests -- sh -c 'echo $$ > "$1"; exec sleep 30'`, waited for the child PID, sent SIGTERM only to the wrapper, and then tried a second zero-wait run. Observed `wrapperExit: -15`, `commandStillAlive: true`, `secondLockExit: 0`. The probe stopped its surviving child afterward. The existing killed-holder test covers a sourced lock holder, not a wrapper supervising a live gate. This contradicts the run-wide exclusion described in `docs/testing.md` § Tests lock and the template's wrapped-gate contract.

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** A tests-lock retry closes and publishes the same build repeatedly
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:1156`
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: separate the once-only roadmap and workflow close work from the retryable push, retain the close outputs before retrying, and release the workflow lock after a successful push; regenerate its mirrors and snapshot.
  - **DONE WHEN:** An exit-81 push followed by a successful retry executes workflow close once, preserves its original final-return data, and releases the workflow lock only after the successful push.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `a build close push retry does not repeat workflow close or lose its outputs` fails because the exit-81 route retries a fenced block that runs `workflows close --post --message --session-dir` before its push and retains the close outputs only after that block succeeds.

<!-- bkit:task 2 end -->

Evidence: the new route at line 1156 says to rerun the whole lines 1148–1153 block. `closeWorkflow` appends completeness, `workflow-done` and telemetry rows on each invocation; it has no closed-run guard. A real built-CLI probe in an isolated temporary repository invoked `workflows close` twice and returned `closeExitCodes: [0, 0]`, `workflowDoneRows: 2`. The production block additionally passes `--message` and `--post`, so retries also create new close commits/comments. `sessionRemoval` deletes the session after the first close; `finalReturnParts` reads its issue facts only while that file exists. Retaining outputs after the retry therefore loses the original final-return issue link. The existing route-presence test proves exit preservation, not safe replay of preceding side effects. This conflicts with the append-only workflow status and close-report contract in `.bkit/workflows.md`.

## Coverage and existing work

- Coverage: partial diff coverage. The supplied diff truncates large files and omits smaller files. Review focused on the shown lock implementation and its integration tests, with supplemental scoped diffs/source reads for the CLI classifiers, push paths, Vitest setup and retry workflows. This is not a claim that every generated mirror or installed skill reference was exhaustively reviewed.
- Both findings were reproduced against current code; no source, tests, plan or ledger was changed. Temporary probe resources and the surviving probe command were cleaned up. No full-suite rerun was needed to establish either failure.
- The holistic report's missing decision-ledger rows remain unresolved existing plan work: `724-lock-wait-is-host-budget-not-constant`, `724-branches-push-maps-hook-lock-give-up-to-81`, and `724-test-workers-leave-one-core`. They are not duplicated as a challenge task because the plan already requires them; this report does not accept or waive that gap.

