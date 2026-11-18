Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: none
Loosened: none
Fingerprint: 03551903dc94637e37d309a18b67f9dc1492518acf026f56ad117f10b7dcad35
<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

Group 3 holds one task (TASK 6, docs and ledgers). Checked against `build-diff-3-1.md`: `docs/security.md:66` (§ Workflow comment ownership) adds the `0700` `invocation-context/` folder; `docs/observability.md:32` (§ Bookkeeping effects and receipts) adds the `0700` folder and `0600` corrections file; `docs/testing.md` rows for `commands/workflow/ledgers.test.ts`, `commands/lib.test.ts` and `commands/workflow/decisions.test.ts` add the `--month` / `--fid` refusal, lock deletion, folder mode and `pending` `--fid` refusal; `.bkit/core/.bkit/workflows.md:147` adds the lock-deletion sentence and the re-rendered `.bkit/workflows.md:147` is byte-identical, with only the matching hash change in `.bkit/version`; `docs/deferrals.jsonl` has an engine-filled `CLOSED` row (`firstTs`, `updates: 2`) for `992-ledger-commands-six-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1273`. The lock-deletion wording matches the code at `.bkit/core/engine/commands/workflow/ledgers.ts:1309-1318` (only `ls-files --deleted` paths ending `.bkit-lock` are added). All five `Documentation Updates` rows are covered. TASK 6 is held off `Tasks` because two inserts split existing sentences and attach old clauses to the new text (see the gaps log); both are wording moves. Test-first audit (`build-tests-green-3-1.md`): `Enforced: true`, `Verdict: PASS`, 0 gaps, 0 unproven; TASK 6 is `TEST FIRST: n/a`. No `build-plan-tests-3-log.md`, `build-plan-current.md`, earlier `build-plan-verify-3-*`, gaps-remediate log or decision record was present.

## Identified Gaps Log

2 gaps.

- TASK 6: `docs/testing.md:808` — the `invocation-context/` folder-mode clause was inserted between "Flag parsing and usage errors" and its parenthetical, so "(a literal `{UPPER}` placeholder in any flag or positional value refused, exit 2)" now reads as describing the folder-mode test; move the new clause after the parenthetical (for example after "usage errors (... exit 2)") — Fixable: true
- TASK 6: `.bkit/core/.bkit/workflows.md:147` (rendered `.bkit/workflows.md:147`) — the lock-deletion sentence was inserted before "— a claude-only consumer with no `.cursor` / `.opencode` mirror sweeps zero for those globs rather than aborting", so that dash clause, which explains the unmatched-glob behaviour, now hangs off the lock sentence; restore the dash clause to the glob sentence and put the lock sentence after it, then re-run `pnpm tsx .bkit/core/engine/cli.ts upgrade` — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 6: folder-mode clause splits the usage-errors parenthetical
  **Severity:** LOW · **Class:** doc-wording · **Fixable:** true · **Location:** `docs/testing.md:808` · **Round:** 1
  - **DONE WHEN:** The `commands/lib.test.ts` row names the `invocation-context/` folder mode as its own clause, and the `{UPPER}` placeholder parenthetical stays attached to "Flag parsing and usage errors".
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 6: lock sentence detaches the unmatched-glob clause
  **Severity:** LOW · **Class:** doc-wording · **Fixable:** true · **Location:** `.bkit/core/.bkit/workflows.md:147` · **Round:** 1
  - **DONE WHEN:** The dash clause about a claude-only consumer sweeping zero for unmatched globs follows the glob sentence again, the lock-deletion sentence comes after it, and `pnpm tsx .bkit/core/engine/cli.ts upgrade` re-renders `.bkit/workflows.md:147` to match.
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
