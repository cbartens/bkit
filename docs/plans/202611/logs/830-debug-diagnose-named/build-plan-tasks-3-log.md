Verdict: FAIL

<!-- verdict:end -->

# Build Plan

## Execution Log
DONE — TASK 6: Pin and validate context evidence — child pins are set from validated selection and removed without one; selected CI receipts require matching complete identity and nonempty logs; legacy and fallback outputs use the same check. Context unit suites pass 119 tests and pnpm build passes (.bkit/core/engine/commands/workflow/context.ts).
DONE — TASK 7: Make the shipped evidence blocks honor the selection — exact attempt metadata/jobs/log reads, complete receipts, configured discovery and ancestral selected-commit diffs pass all 4 real-Bash block tests; existing context preflight suite passes 101 tests; adopted blocks match template and build passes (.bkit/templates/context/bkit-github.md).
BLOCKED — bkit:generate: instructions:sync rejected unregistered workflow instruction changes; updating the canonical instruction registry before retrying.
BLOCKED — TASK 8: Wire selection, reproduction and final proof through Debug — initial changed-file gate found an underused shared instruction clause and conditional assertions in the updated legacy audit; both are corrected for revalidation.
DONE — TASK 8: Wire selection, reproduction and final proof through Debug — selection resolves before resume; CI reproduction and fixes are generation-scoped; configured CI and the selected workflow must pass at the pushed head; auto preserves its run. Planned tests are unchanged. Final source-CLI changed gate passes: 2072 related tests, 7397 named tests with 2 existing skips, Node/Bats, lint, format and typecheck. Generation retry and 273 render tests pass; built-CLI scratch pins and mismatch rejection pass. The initial generation failure remains recorded per the verdict contract (.bkit/core/workflows/bkit-debug.md).
