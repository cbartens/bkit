Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 3, 4
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 2, attempt 1. Tasks 3–5 were judged against `build-brief-2-1.md` and the supplied group diff. The brief's instruction to continue beyond the one-hour limit was honored.

## Groups Verified

None.

## Integration Gaps

None.

## Previously Attempted

None for group 2.

## Notes

- Task 3 is satisfied. The metadata writer validates the complete selection before appending, restricts it to an active Debug run, replaces the whole selection object, preserves the generation for unchanged evidence and increments it for replacement. Routing scopes reproduction and fixes to the active generation, retains the global fix count, clears CI routing for `[local]`, and orders covering gates without restoring the disabled live tier.
- Task 4 is satisfied. Before a matching completed fix, `tests run` writes a FAIL CI artifact and bounded row with null gate, exit code and failure count, without invoking the local runner. A completed remediation or soak in the active generation enables the normal local runner. The shared validator rejects invalid CI variants and retains numeric local exit-code validation.
- Task 5's completion path validates the selected run, attempt, generation, repository, workflow, commit and artifact contents. It refuses a mismatched or forged artifact and preserves local clamp enforcement. Its status-hole audit still has the stale-selection problem below, so Task 5 remains open.
- The supplied test-first report is PASS: all 12 planned tests were recorded red and now pass, with zero gaps, unproven tests or changed planned tests. The group diff adds the planned cases without loosening existing expectations.
- The implementation log records the initial formatting failure and its resolved rerun: 695 affected tests, 3923 related tests and 6205 path-reference tests pass, along with node and bats audits, lint, formatting, production/test typechecks, generation and build. Generated `dist/` and both CLI references include this group's changes. This review did not repeat the broad suite.
- Independent verification invoked the built `check` and `deriveContract` functions with a context-completion record after an explicit local selection. Without an earlier CI test-run row, `evidenceHoles` is empty. Adding only an earlier CI test-run row produces a missing `context fetch` hole even though the current selection is local. The predicate reads any historical CI row after the workflow start and never consults the current selection or generation.
- Groups 3–4, including their workflow, context and documentation updates, remain outside this review. No source, test, plan or ledger file was edited.

## Identified Gaps Log

TASK 5: `.bkit/core/engine/checks/status-holes.ts:662-678` — stale-ci-audit: the extra context-fetch requirement is activated by any earlier CI test-run in the current workflow, even after a later atomic selection switches to local or another generation. A local run with no configured fetch blocks can legitimately finalize its context without a context-fetch call; retaining the old CI history now marks that same path HOLEY. Scope this requirement to the active validated CI selection and matching generation at the context step, retaining ordinary local auditing and the required-fetch check for current CI evidence. The built checker reproduces a context-fetch hole with the old CI row and none without it. — Fixable: true
