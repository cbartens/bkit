Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 1, attempt 1. Tasks 1 and 2 were judged against the group brief and the diff from `8261fddd9f52be9967abc4794d9d4268a9afbc65`.

## Groups Verified

None.

## Integration Gaps

None.

## Previously Attempted

None.

## Notes

- Task 1 is satisfied. The parser checks exact local and remote refs, excludes URLs, rejects missing explicit branches and ambiguity, and reports the branch source. Debug accepts an existing named branch and refuses a conflicting checkout before switching it. The planned sentinel test proves the conflicting worktree's branch, commit and uncommitted file remain unchanged. Built CLI help documents Debug branch adoption.
- Task 2's lookup, reference precedence, saved-selection reads, configured-workflow filtering, PR-head filtering, frozen attempts, complete job pagination, fork and ancestry checks, normalized fallback, shared selection validator and evidence identity are present. The malformed-list case below violates its explicit requirement that malformed evidence never select local discovery, so Task 2 remains open.
- The supplied test-first audit is PASS: all 11 named unit tests were recorded red and now pass, with no gaps, unproven tests or updated planned tests. The code diff changes an existing usage-message expectation to the new wording and supplies a package manifest in the existing worktree integration fixture; neither removes an assertion or weakens a planned test.
- Source and generated `dist/` changes are present, and both generated CLI references list the new commands. The execution record reports passing build, generation, lint, formatting, typecheck and fresh-consumer checks. Independent built-CLI help reads confirmed the new flags, outputs and documented exit semantics.
- The complete changed-file check remains FAIL on five pre-existing test timeouts. The execution record reports that the affected files passed unchanged together in isolation, 207 tests in 29.07 seconds, and records each timeout in `docs/failures.jsonl`. This review does not relabel that broad check as passing. The workflow's group gate and final full-suite gate remain required.
- Groups 2–4 and their documentation or end-to-end work are outside this group review. No plan checkbox, source file or planned test was edited.
- Independent reproduction used the built CLI and the existing `tests/fixtures/gh/bin/gh` fixture shim with a temporary JSON response under `tmp/`. With an automatic branch lookup returning `{"total_count":-1,"workflow_runs":[]}`, the command exited 1 and wrote `{"mode":"local","reason":"automatic-no-red"}`. No remote call was made.

## Identified Gaps Log

TASK 2: `.bkit/core/engine/commands/workflow/runs.ts:368-389` — malformed-evidence: the workflow-list parser accepts a negative `total_count` because it checks only `Number.isSafeInteger`, then treats an empty list as proven no-red. The built CLI reproduces exit 1 and a local selection for `{"total_count":-1,"workflow_runs":[]}`. Require a nonnegative count and a valid empty-result shape before taking automatic local discovery; malformed list metadata must stop without writing a local selection. Recheck the lookup's malformed-response cases without weakening the frozen planned tests. — Fixable: true
