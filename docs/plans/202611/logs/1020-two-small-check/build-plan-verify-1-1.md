Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2
Loosened: none
Fingerprint: acdda8103405bb2d7d7ded79f26bdac7b996490c90a23a12d02dfd2b927511a7
<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 1: `appendLedgerRows` in `.bkit/core/engine/commands/workflow/ledgers.ts:1798` sets `status: "OPEN"` before `validate(row)` when `status` is undefined and the kind is in `SEVERITY_KINDS` (`friction`, `deferral`, `failure`; `.bkit/core/engine/ledgers/telemetry.ts:265`), so knowledge and decision rows get no `status`. `SEVERITY_KINDS` is added to the existing import. The four TEST FIRST tests exist in `describe("bkit ledgers append")` and pass. `pnpm exec vitest run` on `ledgers.test.ts`, `journal.integration.test.ts`, `run-facts.test.ts`, `runs.test.ts` and `status.test.ts` passed: 5 files, 443 tests. The `docs/testing.md` `commands/workflow/ledgers.test.ts` row names the new behaviour. `dist/commands/workflow/ledgers.js` is rebuilt with the same change.
- TASK 2: `.bkit/core/.bkit/jsonl.md` § Updating a Row states the `OPEN` default on append, and the `friction` / `deferral` / `failure` rows of the per-kind table mark `status` as defaulting to `OPEN` on append. The file says nothing about correcting old rows. The rendered `.bkit/jsonl.md` and its `.bkit/version` hash are refreshed.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, `Verdict: PASS`, 0 gaps, 0 unproven. It has no Taken over, Changed by a code step, Updated tests or Already landed entries.
- Derived Test Matrix: rows 1-4 (Task 1) are covered by task 1's DONE WHEN tests. Row 5 belongs to Task 3, which is in group 2 and out of scope here.
- The plan has no `Documentation Updates` section. The change adds no error path, so `docs/observability.md` adds no logging requirement.
- No decision records, earlier verify reports or remediation logs were supplied.

## Identified Gaps Log

None
