Verdict: PASS
Failures: 0
Fixable: false
Tasks: 13, 14, 15, 16, 17
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 5

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Judged against `build-diff-5-1.md` (commits 978dc121c..a3ef07181). The five planned tests pass by name. `steps.test.ts` and `journal.integration.test.ts` pass in full (142 tests). `vitest related` on the four changed engine files passes 3575 of 3575 tests in 60 files.
- `dist/` matches source: `issues.js`, `ledgers.js`, `runs.js` and `steps.js` carry the same edits as their `.ts` sources, in the same commit a3ef07181.
- TASK 13: When `--to` already holds a non-empty file, an audit render now writes the summary to `<result-file stem>.summary.md`, prints `reportKept`, and leaves the report untouched (`steps.ts` stub `--result-file` branch). DONE WHEN allows "writes the summary to its own path". `build-decision-1-5.md` Q1 ("Fix now") left the splice-vs-separate-file choice open. The tasks log line `BLOCKED — TASK 13` is stale: the tests log shows `CORRECTED` (mkdir added) and `PASSES`, and the test passes.
- TASK 14: The request hash is now `{ledger, rows}` without the invocation id. A stale operation is replayed by id under a newer invocation, writes the recorded block, and `ledgers union` then exits 0 (test). Engine-issued operation ids (`appendOperationId`) still bind the invocation id, so identical rows from different invocations are not merged into one write. Moving storage out of `.bkit/ledger-operations.jsonl`, and with it intents that another checkout wrote, stays with Task 23 (group 7), as the caller directed. `build-decision-1-5.md` Q2 is the owner's "Fix now".
- TASK 15: `auditLedgerRows` emits no `by`. The printed rows append verbatim under `--standalone=audit --name=security` (test).
- TASK 16: At `commit-created` the guard blocks whenever the remote tip is not an ancestor of the re-trigger commit, whatever `origin/<branch>` holds. The test asserts the foreign commit stays the tip, no re-trigger runs, and no `push-completed` row is written.
- TASK 17: Reconcile counts the prepared-block bytes that landed at the recorded offset. If any landed, it throws `UncertainEffect` before the prepare-afresh branch, so prepare-afresh runs only when zero bytes landed. The test asserts the ledger is unchanged and holds exactly one `first-landed` row.
- Test-first audit (`build-tests-green-5-1.md`): Enforced true, Gaps 0, Unproven 0. Already landed: Task 13 `steps.test.ts` "audit result render keeps an existing anchored report intact". The tests step's reason: the group 5 code was already built, so the corrected test passed at re-record.
- Advisory, not a gap: the `.bkit/core/prompts/bkit-audit-generate.md` edit has not been re-rendered into the host mirrors yet. Per `.agents/rules.md` § Install to mirror, `upgrade` runs once at the end of the session.

## Identified Gaps Log

None
