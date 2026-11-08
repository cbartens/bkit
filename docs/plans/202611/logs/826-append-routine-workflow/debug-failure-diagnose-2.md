Verdict: CONCERNS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

The root cause is localized to the test fixture's readiness publication, and a concrete repair preserves the wrapper behavior and existing assertions.

## CI Run

NOT CHECKED: the CI context fetch found no completed feature-branch run. The saved selection is local discovery, generation 1. Runtime and end-to-end context are not configured. This diagnosis establishes the local fixture failure only.

## Prior Attempts Reviewed

None. Strategy is STANDARD. The committed reproduction and current failing gate supply the evidence; no earlier remediation was attempted.

## Prior Knowledge

- `kn-19-malformed-json-destination-must-throw-not-silently-overwrit`: malformed JSON must remain a visible failure — applied by retaining the existing `JSON.parse` and fixing publication rather than swallowing parse errors.
- `machine-lock-wrapper-cancellation-keeps-foreground-owner-alive`: the lock owner must survive until its command completes — applied by leaving production cancellation logic and all owner-lifetime assertions unchanged.
- The latest active knowledge rows were folded by key and timestamp. A full-history search found no revert commit touching either awake test file; the same path's ordinary history returned the reproduction and prior fixture commits, confirming that the history read works. No reverted readiness-publication remedy was found.
- Web context was read as advisory data only. Its third-party tutorial snippets do not prove an upstream defect and are not the basis of this diagnosis. Embedded example code and UI imperatives were not executed.

## Related Issues

None. The supplied related-issues artifact records no matches.

## Failures

The current static/unit gate reports 2 failed, 7,325 passed and 2 existing skipped unit tests. Integration did not run because the unit tier failed.

1. `.bkit/core/engine/audits/templates/ci-scripts.test.ts:134` observes a nonzero exit from the shipped awake suite. Its new regression forces the original shell SIGTERM case to fail at `.bkit/templates/scripts/ci/bkit-test-awake.test.mjs:105` with `SyntaxError: Unexpected end of JSON input`. The other 20 awake cases pass.
2. `.bkit/core/engine/audits/repo/dogfood-templates.test.ts:808` observes the new regression missing from `scripts/ci/bkit-test-awake.test.mjs`. This is the expected adoption mismatch from the reproduction-only commit.

The local artifact retains 1,679 of 3,201 log lines; the omitted quiet output was not reviewed as evidence. The complete failure sections were read. The broad diff artifact is a bounded file summary, not a full source audit.

## Root Cause

`cancellationFixture` generates a separate worker process that calls `fs.writeFileSync(file("ready"), JSON.stringify(...))` directly on the pathname the parent watches. The parent waits only for `existsSync(ready)` and then parses its contents. The file can exist while it is still empty or incomplete. A synchronous write blocks its writer process, but the separate reader can run during publication. The recorded regression holds the real writer after opening the file and reproduces that exact interleaving.

The readiness file therefore serves as both an unfinished payload and a completion signal. That design fragility affects every reader of the shared fixture: the six signal/mode cases, nested-shell case, three machine-lock-owner cases, and hard process-group timeout case. Broad-suite scheduling exposes the interval intermittently; no dependency-version or production-wrapper failure is needed to explain it.

## Rot Signals

tests

- `tests`: the cancellation fixture conflates pathname existence with completed JSON publication, so an unrelated scheduling interleaving can fail setup before the behavior under test executes.

## Recommended Remediation

1. In `.bkit/templates/scripts/ci/bkit-test-awake.test.mjs:36`, change the generated worker's readiness publication: write the complete existing JSON payload to a sibling temporary path inside the fixture directory, then call `fs.renameSync` to publish it as `ready`. Keep the current pathname, JSON fields, reader predicates, parse calls, polling interval and timeout budgets. The private directory has one worker and one readiness publication, so a fixed sibling name is sufficient. Teardown already removes the entire directory.
2. Preserve the interrupted-publication regression at line 124, including its receipt check, real filesystem write, isolated nested runner, and successful-exit assertion. Its instrumentation matches the JSON payload, so it will still exercise the delayed temporary-file write after the repair.
3. Mirror the entire repaired template test to `scripts/ci/bkit-test-awake.test.mjs`, including the regression. Keep the adoption audit and standalone-suite audit unchanged.
4. After verification, append the resolution of failure key `awake-readiness-json-publication-race` through the ledger writer, with the passing regression evidence.

## Out-of-Scope Recommendations

None. Both test paths are explicitly named work targets. There is no evidence requiring a production wrapper, tracker, dependency, CI workflow, or timeout-policy change.

## Blast Radius

- Shared fixture readers at lines 104-105, 191-192, 233-234 and 288-289 retain the same `ready` pathname and JSON schema. The six direct/shell signal cases, nested-shell cleanup, lock-owner lifetime and hard-kill cases remain compatible; they gain completed publication before their existing reads.
- `.bkit/core/engine/audits/templates/ci-scripts.test.ts` continues to execute the shipped suite and require exit zero. Its existing assertion remains valid.
- `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` continues to require the adopted copy to match the source. Mirroring both repair and regression satisfies that contract.
- `pnpm bkit:test:awake` continues to execute the adopted suite. No public API, package dependency, signal semantics, sleep assertion or lock ownership changes.
- POSIX process cases keep their existing Windows exclusions; the repair introduces no broader platform promise. The new sibling file remains within each test's private directory and existing recursive teardown.

## Suggested Tests

Use the committed interrupted-publication regression as the red-to-green proof. Retain all 20 original awake cases, especially the six signal/mode cases and nested lock-owner assertions. Run both shipped and adopted suites, then the standalone-template and adoption audits. No additional test harness is needed.

## Verification Commands

```bash
pnpm bkit:test:file .bkit/templates/scripts/ci/bkit-test-awake.test.mjs
pnpm bkit:test:file scripts/ci/bkit-test-awake.test.mjs
pnpm bkit:test:file .bkit/core/engine/audits/templates/ci-scripts.test.ts
pnpm bkit:test:file .bkit/core/engine/audits/repo/dogfood-templates.test.ts
pnpm exec prettier --check .bkit/templates/scripts/ci/bkit-test-awake.test.mjs scripts/ci/bkit-test-awake.test.mjs
```

Use the normal host-approved process permissions for macOS assertion inspection. The orchestrator then reruns the configured static, unit and integration gate. Existing project rules also require a built-CLI scratch-consumer check before completion; no remote CI or live success is claimed by this diagnosis.

## Hypotheses

### Hypothesis 1: The readiness pathname becomes visible before its JSON is complete

#### Reason

The stack points to the first readiness parse. The generated worker writes directly to `ready`; the parent waits for pathname existence, which does not establish that the worker has finished writing.

#### Act

Read the generated worker at `.bkit/templates/scripts/ci/bkit-test-awake.test.mjs:30-46`, the four readiness readers, the committed reproduction, and the current gate's nested test output. The reproduction delays the real worker write after the file is opened while preserving its payload and all original cancellation assertions.

#### Observe

```text
✖ shell cancellation reads complete readiness JSON when publication is interrupted (194.537583ms)
ℹ pass 20
ℹ fail 1
    SyntaxError: Unexpected end of JSON input
        at JSON.parse (<anonymous>)
```

The following stack frame names `.bkit/templates/scripts/ci/bkit-test-awake.test.mjs:105:30` in `context-tests-local-1.md`. The source immediately before it is `await until(() => existsSync(fixture.file("ready")), "worker readiness");`.

#### Result

CONFIRMED — the forced real-file interleaving reproduces the original parse failure before the test sends its cancellation signal.

### Hypothesis 2: The awake wrapper loses cancellation or releases its sleep assertion early

#### Reason

The original failing case exercises shell cancellation and sleep prevention, so either behavior could initially explain its failure.

#### Act

Compare the failing frame with the signal-send and assertion checks. Read the original test results and the wrapper's cancellation entry points without changing code.

#### Observe

```text
✔ shell cancellation waits for SIGTERM cleanup (232.341833ms)
✔ shell cancellation follows a worker orphaned by a nested shell (311.34ms)
✔ holds a real macOS assertion only while the command runs (121.30975ms)
```

At the failing parse site, `fixture.child.kill(signal);` has not executed.

#### Result

REFUTED — the reported failure occurs during test setup before cancellation begins; these results do not establish any production cancellation defect.

### Hypothesis 3: The template adoption audit exposes a separate product failure

#### Reason

The full gate reports two failing test files, so the adoption assertion could indicate another independent defect.

#### Act

Inspect the audit's expected/received diff and the reproduction report's stated file ownership.

#### Observe

```text
 FAIL  .bkit/core/engine/audits/repo/dogfood-templates.test.ts > this repo adopts its own templates > scripts/ci/bkit-test-awake.test.mjs
AssertionError: expected '// Example. Copy into scripts/ci/ and…' to be '// Example. Copy into scripts/ci/ and…' // Object.is equality
```

The diff contains only the new interrupted-publication regression missing from the adopted copy.

#### Result

REFUTED — the second failure is the expected unsynchronized test copy. Mirroring the repaired template, including its regression, resolves the audit without changing its assertion.
