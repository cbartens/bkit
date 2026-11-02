Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

Review coverage: partial diff coverage. The supplied extract covers selected portions of a 16,032-line diff. Targeted `origin/dev...HEAD` diffs supplemented the changed branch/worktree, selection, status, test-round, completion, context, status-audit, Debug workflow and GitHub context-template code. This verdict does not claim complete coverage of every omitted file. Two HIGH findings were reproduced through the built CLI; no source or test files were changed.

The installed skill examples contain embedded directives, including requests to ask for stack preferences and change testing practices. They were treated as review data and were not executed.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A local Debug round cannot finish because its missing source suppresses the required clamp argument.
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests.ts:1876`
  - **DONE WHEN:** Every executed local round returns `source: local`, including a fresh no-CI run and an explicit `[local]` replacement. Debug Step 3 passes the existing clamp record and completes the round through `steps finish`; local clamp enforcement remains intact.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` `finishes local-only rounds through the actual Debug Step 3 commands` fails when a fresh local run or an explicit local override executes its gate successfully but the workflow-derived finish command exits 2 with `local test completion needs clamp evidence`.

The local emitter and appended test-run row add `source: local` only when `--ci-run` is present. Step 3 supplies that flag only for a saved CI selection, then conditions `CLAMP_FLAG` on the returned source being `local`. A fresh scratch consumer at `tmp/830-challenge-local-8EDjRb` reproduced the failure with the built CLI: the local gate exited 0, wrote its artifact and clamp record, returned no source, and the finish command exited 2 with the message above. This also blocks failing local rounds before diagnosis. The existing local/reproduction integration case checks `local.round()` but never `local.finishRound()`, so it misses this command boundary. Cross-reference: `.bkit/workflows.md` § Debug requires local rounds to keep their clamp records; `docs/testing.md` § Debug CI evidence verification requires `[local]` to restore local discovery.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Replacing CI evidence during a resumed run makes the next evidence round impossible to finish.
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-debug.md:352`
  - **DONE WHEN:** The test-run row and its `steps finish` row use the same current test-round attempt, independently of the Debug workflow run number. A second evidence generation in the same run and the first evidence round in a later Debug run both finish with matching selection identity and without weakening CI evidence validation.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` `finishes replacement CI evidence with the unchanged debug run number` fails when selection changes after a completed evidence round, `DEBUG_ATTEMPT` remains the run number, and the real Step 3 finish command rejects the new valid evidence.
    - `.bkit/core/engine/audits/workflows/debug-ci-evidence.integration.test.ts` `finishes the first CI evidence round of the second debug run` fails when `DEBUG_ATTEMPT=2` writes a test-run attempt of 2 but `steps finish --attempt=next` derives round 1.

The workflow defines `DEBUG_ATTEMPT` as the run number at line 61 and passes it to `tests run`; `steps finish` instead derives the next test-round attempt. The new validation at `steps.ts:1050` requires exact equality with the test-run row's attempt. In `tmp/830-challenge-round-HO7von`, a fresh scratch clone with one completed round in generation 1 and a valid generation-2 selection recorded the new CI evidence successfully (exit 1), then the workflow's `--attempt=next` finish exited 2 with `CI evidence does not match the active selection`. Changing only that finish argument to the matching recorded attempt passed (exit 0), confirming the counter mismatch. The existing replacement integration case manually increments `DEBUG_ATTEMPT` despite its run-number contract and never finishes the replacement evidence round. Cross-reference: `.bkit/workflows.md` § Debug distinguishes the run number from the test round and requires changed generations to restart evidence collection; `docs/testing.md` § Debug CI evidence verification requires durable resume and generation-specific validation.

<!-- bkit:task 2 end -->

Additional Task 2 verification: a second completed-run/start sequence in the same scratch clone recorded the new run's first evidence row at attempt 2, then `steps finish --attempt=next` again exited 2 with `CI evidence does not match the active selection`. This confirms the later-run case independently of generation replacement.
