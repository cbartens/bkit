Verdict: CONCERNS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

The malformed lock reply localises the failure; an isolated probe reproduces both the byte loss and the resulting subprocess timeout.

## CI Run

NOT CHECKED: local pre-push gate incident. Read `tmp/pre-push.log`; unit/static passed, integration reported `1 failed | 1818 passed (1819)`. The parent reports the preceding complete gate passed all 1,819 integration tests. No remote run was requested.

## Prior Attempts Reviewed

None — STANDARD for this new publication incident. The earlier final-test diagnosis remains unchanged. Reviewed `cb63d6e5f`: it reduces Perl polling from one second to 0.1 seconds and preserves the handoff assertion; it does not address timed shell reads. This repair does not reapply that commit. Non-shallow history search found no reverted commits touching the two candidate files; a normal path history lookup confirmed the search paths.

## Prior Knowledge

`machine-lock-wrapper-cancellation-keeps-foreground-owner-alive`: holder lifetime follows the wrapper — applied to explain the error-path wait cycle and require explicit holder stop/reap.

`spawn-heavy-unit-suite-needs-its-own-budget-under-load`: load can affect subprocess timing — checked, but this suite already uses the integration budget, and malformed `k` cannot be explained as an ordinary slow assertion.

Existing failure key `machine-lock-history-wait-returned-refusal` is OPEN and records a related unexplained refusal. Reuse that key for accumulated evidence if updating the ledger, while preserving that the earlier exit-73/75 incident is not proven to share this cause. Other active machine-lock knowledge concerns name identity, unset defaults and empty holder slots; none explains this reply corruption. No dependency-version hypothesis or external signal is needed.

## Related Issues

NOT CHECKED: no remote issue search or new tracker issue. The existing failure-ledger key provides the prior-incident pointer.

## Failures

The named-lock test at `machine-lock.integration.test.ts:745` received `second.status === null`; stderr ended `could not take the lock for tests: k`. The case took 41,490ms. This differs from normal timeout output and exit 75. `run()` retains only status/stdout/stderr/ms, discarding `spawnSync.error` and `spawnSync.signal`, so the exact signal and error of the historical run cannot be recovered. The focused existing test passed in 2.50 seconds with one pass and 42 filtered/skipped cases.

## Root Cause

The FIFO reader at `.bkit/templates/scripts/ci/bkit-machine-lock.sh:288–301` discards `_lsl_line` whenever `read -r -t 1` times out. Bash can consume and return part of a line on that timeout. If `o` from `ok` is consumed before the deadline and discarded, the next read returns `k`. The malformed-response branch then reaches `wait "$_lsl_pid"` without stopping the Perl holder. That holder has acquired the lock and waits for its shell parent to exit; the shell is waiting for the holder. The outer subprocess timeout breaks this cycle.

An isolated probe used this same loop with a writer emitting `o`, pausing 1.2 seconds, then emitting `k` plus newline while remaining alive. It produced `reply: <k>`, then `status:null`, `signal:SIGTERM`, `error:ETIMEDOUT`. This establishes the mechanism, not the original scheduler interleaving. The original helper prints the complete `ok` in one write, but a timed Bash read can still be interrupted between consuming bytes. Historical signal/error remain unobserved because the test discards them.

## Rot Signals

reliability, observability

- reliability: timed-read partial bytes are lost, and malformed replies wait indefinitely on a holder that depends on caller exit.
- observability: the test's Result drops child-process signal and error, leaving a null status without its reason.

## Recommended Remediation

The parent explicitly authorised the minimal lock repair as necessary publication work.

1. In canonical `.bkit/templates/scripts/ci/bkit-machine-lock.sh:288–301`, accumulate partial `_lsl_line` content across timed reads and emit the entire response only when the newline completes. Apply the same accumulation to the final drain after holder death. Preserve the existing dead-holder check and one-second read timeout.
2. In that file's failure tail around line 328, stop the spawned holder before reaping it when no successful `ok` was accepted. Reuse the existing `release_local_stack_lock` stop-then-wait ordering: signal only this invocation's recorded PID, tolerate an already-exited process, then wait. Keep normal busy/timeout exit behavior and diagnostics unchanged. Never merely omit wait and leak an acquired lock.
3. Synchronise adopted `scripts/ci/bkit-machine-lock.sh` with the canonical template using the repository's established template-copy mechanism, and verify its dogfood parity. The prior handoff commit updates these same two paths together. This shell fix needs no engine/dist or provider workflow change.
4. In `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`, add the deterministic regressions described below. Preserve every existing assertion and timeout. Retain optional `signal`/`error.code` in diagnostic output for the new probes so a null status is actionable; do not broaden scope into unrelated test-helper refactoring.
5. If recording the incident, append evidence to `docs/failures.jsonl` under `machine-lock-history-wait-returned-refusal`. Distinguish confirmed current mechanism from the earlier incident's unconfirmed cause.

## Out-of-Scope Recommendations

None beyond the parent-authorised publication repair. Do not alter timeout budgets, lock-slot counts, gate scope or unrelated feature behavior.

## Blast Radius

The canonical script is a consumer template; the adopted copy gates this repo's tests and pushes. The reply reader is shared by named/unnamed locks and wait/try modes, so retain complete `ok`, `busy`, `timeout`, error and dead-holder handling. Successful `ok` must leave the holder alive until release; every failed take must leave no live owned holder. Existing lock suite covers these surfaces; add fragmented reply and malformed acquired-holder probes before rerunning that suite. No API or exit-code changes are intended. Compatibility of the proposed fix still requires those tests; diagnosis did not implement it.

## Suggested Tests

1. Fragmented successful reply: follow the existing copied-script fixture pattern (the test near line 690 injects a Perl early exit). Replace only the fixture's `print $out "ok\\n";` with an autoflushed `o`, a delay longer than the existing one-second read deadline, then `k\\n`. Assert successful acquisition, explicit release and a subsequent acquisition by another process. This must fail before the reader repair with the malformed `k` or captured subprocess timeout, then pass after it. Keep the normal test timeout unchanged.
2. Malformed acquired-holder reply: a second copied-script fixture emits a complete invalid response after acquiring the lock, then retains the existing holder lifetime loop. Assert failure returns promptly rather than reaching the outer timeout, no fixture holder survives, and a subsequent ordinary caller can acquire the same lock. Use the existing observable subprocess/PID helpers and a bounded wait; explicitly clean up the probe if it fails.
3. Retain and rerun the original cross-repository contention test, dead-before-answer test, ordinary busy/timeout cases, release and cancellation cases. Prefer running the whole existing machine-lock file once after focused regressions pass; no broad suite is required for diagnosis.

## Verification Commands

```bash
pnpm bkit:test:file .bkit/core/engine/audits/templates/machine-lock.integration.test.ts -t 'a named lock is machine-wide: checkouts of two different repos wait on the same named lock'
pnpm bkit:test:file .bkit/core/engine/audits/templates/machine-lock.integration.test.ts
pnpm bkit:test:file .bkit/core/engine/audits/repo/dogfood-templates.test.ts
```

Run the first command now only as the recorded reproduction (it passed); run the remaining checks after repair. Publication must rerun its unchanged mandatory pre-push gate. A retry-only response is not justified by the focused pass because a concrete failure mechanism is reproduced. No source changes, commits, workflow-status mutations or broad suite runs were performed in this diagnosis.

## Hypotheses

### Hypothesis 1: This is ordinary temporary lock contention

#### Reason

The previous complete integration gate passed and this failure occurred while a second repo waited for the first.

#### Act

Read the original failure and rerun only the existing machine-wide named-lock test.

#### Observe

```text
[machine-lock] ❌ could not take the lock for tests: k
: expected null to be +0 // Object.is equality
 Test Files  1 passed (1)
      Tests  1 passed | 42 skipped (43)
   Duration  2.50s (tests 99%)
```

#### Result

REFUTED — the focused pass proves intermittency, but ordinary contention yields `timeout <holder>` and exit 75, not the malformed reply `k` followed by null child status.

### Hypothesis 2: A timed FIFO read loses part of `ok`, then the error path waits on a live holder

#### Reason

The shell discards `_lsl_line` whenever `read -t 1` returns nonzero. Bash can return partial bytes in that variable on timeout. A surviving `k` falls through the protocol's error branch and waits on the Perl holder, which waits for its parent to exit.

#### Act

Executed an isolated FIFO probe using the same timed-read loop. The writer emitted `o`, waited 1.2 seconds, then emitted `k` and a newline, while remaining alive. The parent used spawnSync with a 2.5-second timeout. No repository code was edited.

#### Observe

```text
{"status":null,"signal":"SIGTERM","error":"ETIMEDOUT","stdout":"reply: <k>\n","stderr":"timed read discarded: <o>\nwaiting on live holder after malformed reply\n"}
```

#### Result

CONFIRMED — partial timed reads lose response bytes and the malformed-reply wait path deadlocks until the outer process timeout. The exact original signal/error remains unknown because its helper discarded them.
