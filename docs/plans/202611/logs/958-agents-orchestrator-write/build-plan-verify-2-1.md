Verdict: PASS
Failures: 0
Fixable: false
Tasks: 5, 6, 7, 8
Loosened: none
Fingerprint: cdfa90e6ce5ca52c04ac43f9545ae0a7f566dc56932d125cb9b52c7d49e96455
<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

Group 2 (Tasks 5-8) judged against `build-diff-2-1.md`. All four tasks are satisfied.

- Tests: one run over `audit-report.test.ts`, `ledgers.test.ts`, `issues.test.ts`, `template-shape.test.ts`, `workflow-shape.test.ts`, `steps.test.ts`, `challenge.test.ts`, `cli-doc.test.ts`, `instructions-coverage.test.ts`, `instructions.test.ts` and `instructions-sources.test.ts` passed (11 files, 956 tests). That run covers all 10 `TEST FIRST` tests and `bkit issues audit ledger keys`. A second run over `journal.integration.test.ts`, `conventions.test.ts` and `branding.test.ts` passed (3 files, 45 tests). Task 8 broke `journal.integration.test.ts` and fixed it by moving it from `steps stub --result-file` to `ledgers findings --report`.
- Task 5: `audit-report.ts` imports only `../lib.js`, `../../shared/text.js` and `../../ledgers/telemetry.js`, and `grep -n 'from "\./'` prints nothing. `issues.ts` and `steps.ts` no longer hold the audit block or `ledgerKeys`.
- Task 6: `ledgers.ts` imports only from `audit-report.js`, never from `issues`. A missing file exits 2 (`EXIT.USAGE`) and a malformed table exits 6 (`EXIT_BAD_REPORT`). `issues comment --report` derives `Findings` and refuses a hand-written `--field Findings`. `node dist/cli.js ledgers findings --help` and `node dist/cli.js help` both exit 0.
- Task 7: all 35 `.bkit/core/docs/templates/bkit-audit-*.md` carry `| ID | Severity | Title | Location | Evidence | Expected | Key |`. `grep -n 'Serialize the findings'` prints nothing. The no-flag `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exits 0 with no output.
- Task 7 deviation, not a gap: the task field asks each template for a one-line `Key` placeholder rule. The rule is in `bkit-audit-generate.md` step 9 instead ("Fill `Key` with `new` or the `key` of an open row"). That prompt fills every template, so the rule reaches the agent that writes the column and is stated once (`.bkit/authoring.md` "Say it once"). No `DONE WHEN` names the template line.
- Task 8: the `DONE WHEN` grep finds only `refuses --result-file as an unknown flag` in `steps.test.ts`. `DERIVED_FIELDS`, `AUDIT_AGENT`, `structuredFindings`, `renderFindingsLog` and `parseAuditResult` have no engine references left. `steps stub` keeps only `--from`, `--to` and `--strip-header`. `steps verdict` drops `--result-file` and keeps `--agent` / `--allowed`, which the plan leaves in place. The clause `stub-seed-fingerprint` and its three carrier lines are deleted, as Architecture § Prompts, workflows and clauses says ("Delete the clauses ..."). `pnpm bkit:text:ceiling check` exits 0 at prompts 83844, workflows 58012, and the ceiling file matches. `dist/` holds no removed symbol, and `dist/commands/workflow/audit-report.js` exports `parseAuditReport`. No source workflow or prompt names `steps stub --agent`, `--invocation` or `Fingerprint`.
- Test-first audit (`Enforced: true`, 7 gaps, all `delete-still-referenced`, all `Fixable: null`), each decided as no gap:
  - `FINGERPRINT` at `.bkit/core/engine/audits/workflows/ship-invariants.test.ts:309` is the `FEATURE_CODE_FINGERPRINT` regex in the ship workflow test, a different thing.
  - "`steps.ts` still exists": the DELETE names flags inside the file, and those flags are gone.
  - `structuredFindings` at `docs/audits/202611/deferrals-20261116T065554Z.md:277` and `docs/deferrals.jsonl:257,429` are append-only history records, not code.
  - `parseAuditResult` at `docs/decisions.jsonl:963` is the append-only decision record of this change.
  - "`.bkit/instructions.md` still exists": the DELETE names the clause, which is gone.
  - "`steps.test.ts` still exists": the DELETE names the `bkit steps stub --result-file` describe block, which is gone.
  - "`challenge.test.ts` still exists": the DELETE names the `structured challenge findings` describe block, which is gone.
- Red results: the three Task 5 tests are `red-not-loaded`, because the module did not exist before Task 5, which is the planned failure. The report has no `Unproven`, `Taken over`, `Changed by a code step`, `Updated tests` or `Already landed` sections.
- Documentation Updates: the group's rows are done (`cli.md` regenerated, and `cli-doc.test.ts` passes; `.bkit/instructions.md` entries edited by hand). The `docs/testing.md` rows belong to Task 16.
- No decision records were supplied.

## Identified Gaps Log

None
