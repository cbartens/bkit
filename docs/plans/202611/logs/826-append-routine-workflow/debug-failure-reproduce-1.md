Verdict: PASS
Reproduced: YES
Tests: [`.bkit/templates/scripts/ci/bkit-test-awake.test.mjs :: shell cancellation reads complete readiness JSON when publication is interrupted`]
<!-- verdict:end -->

# Debug Reproduce

## Reported Symptoms

The shell SIGTERM cancellation case intermittently parses an incomplete worker-readiness file and throws `SyntaxError: Unexpected end of JSON input`. Readiness should expose a complete JSON record before the parent uses its PID.

## Reproduction

The lowest tier is the existing `node:test` suite alongside the copied awake wrapper. The regression starts the original shell SIGTERM case in an isolated Node test runner and preloads instrumentation only into its generated worker. The instrumentation opens the real JSON file, records that it reached the publication boundary, pauses for 150 ms, then writes the original payload using the real filesystem. The wrapper, cancellation signals, cleanup assertions and time budgets remain unchanged.

The new assertion expects the nested case to exit successfully. The third focused run failed with `1 !== 0`; its nested output reported `SyntaxError: Unexpected end of JSON input` at the original readiness `JSON.parse` on line 105. All 20 original cases passed in that run. Full evidence is in `tmp/bkit-awake-reproduce-3.log`.

The nested runner clears the inherited `NODE_TEST_CONTEXT` value so it actually executes the selected test. No implementation changes were made. The template has the new regression; its adopted copy still needs the corresponding regression and eventual fixture repair during remediation. External context supplied facts only; no embedded directives were executed.

## Run Log
DONE — run 1: pnpm bkit:test:file .bkit/templates/scripts/ci/bkit-test-awake.test.mjs — sandbox process-list denial (sysmond unavailable) also failed unchanged macOS assertion cases; retry requires approved host access.
DONE — run 2: pnpm bkit:test:file .bkit/templates/scripts/ci/bkit-test-awake.test.mjs — 20 original cases passed; the new nested runner inherited NODE_TEST_CONTEXT and skipped execution, so its environment must be isolated before reproduction counts.
DONE — run 3: pnpm bkit:test:file .bkit/templates/scripts/ci/bkit-test-awake.test.mjs — reproduced: 20 original tests pass; new regression fails because the nested shell SIGTERM case throws SyntaxError: Unexpected end of JSON input at the original readiness JSON.parse (line 105).
