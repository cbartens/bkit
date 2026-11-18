Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 1, 2, 4
Loosened: none
Fingerprint: 76c311d8a80f817641456c4221353192419a647a3370c70c44bced449a808807
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 plan groups.

## Integration Gaps

0. Group 1 (the `OPEN` default in `bkit ledgers append`, tasks 1-2) and group 2 (the shipped `authoring.md` clean-up, tasks 3-4) touch separate files. Task 4 joins them: `dist/commands/workflow/ledgers.js:1450` holds the compiled default, `.bkit/jsonl.md:347` and `.bkit/authoring.md` are refreshed with their `.bkit/version` hashes, and `node dist/cli.js check` exits 0.

## Previously Attempted

None. Earlier per-group reports: `build-plan-verify-1-1.md` (Group 1, PASS, tasks 1, 2) and `build-plan-verify-2-1.md` (Group 2, PASS, tasks 3, 4).

## Notes

- TASK 1: `appendLedgerRows` in `.bkit/core/engine/commands/workflow/ledgers.ts:1798` sets `status: "OPEN"` before `validate(row)` when `status` is undefined and the kind is in `SEVERITY_KINDS` (`friction`, `deferral`, `failure`; `.bkit/core/engine/ledgers/telemetry.ts:265`), so knowledge and decision rows get no `status`. The four TEST FIRST tests exist and pass. `ledgers.test.ts`, `journal.integration.test.ts`, `run-facts.test.ts`, `runs.test.ts` and `status.test.ts` pass. The `docs/testing.md` row names the behaviour.
- TASK 2: `.bkit/core/.bkit/jsonl.md:347` and the per-kind table state the `OPEN` default on append; nothing about correcting old rows.
- TASK 3: not satisfied. Its DONE WHEN items hold: `.bkit/core/.bkit/authoring.md` names none of the four commands (grep exit 1), `.agents/rules.md` below `bkit:end` holds the two bullets, `shipped-docs-refs.test.ts` and `instructions.test.ts` pass, and `docs/testing.md:739` names the check. But the two new Project Rules bullets broke `.bkit/core/engine/tools/instructions-sources.test.ts` `the repo store matches rules.md`: `.bkit/instructions.md` § Project Rules has no entries for them (the branch never touched that file), so the store is off by two. A task must fix the tests it breaks. No group gate ran after group 2 (the last group), so the earlier Group 2 PASS did not catch it.
- TASK 4: `dist/commands/workflow/ledgers.js` holds the default; `.bkit/authoring.md` names none of the commands; `.bkit/jsonl.md:347` holds the sentence; `node dist/cli.js check` exits 0. I did not rebuild (mandate).
- Tests run (from the repo root, by file): the plan's named files plus every test file under `.bkit/core/engine` that reads `authoring.md`, `jsonl.md`, `.agents/rules.md` or `commands/workflow/ledgers`, except the four install integration tests (`commands/install/install.integration.test.ts`, `commands/install/uninstall.integration.test.ts`, `install/modules/core.integration.test.ts`, `install/modules/index.integration.test.ts`). 35 files ran; 1 test failed (above). The full suite is left to the holistic gate (`Local tests first`).
- Test-first audits `build-tests-green-1-1.md` and `build-tests-green-2-1.md` were not in the Read list; their headers read `Enforced: true`, `Verdict: PASS`, `Gaps: 0`, `Unproven: 0`.
- Derived Test Matrix: rows 1-4 are in Task 1's DONE WHEN, row 5 in Task 3's; all those tests exist and pass.
- The plan has no `Documentation Updates` section. No error path was added, so `docs/observability.md` adds no logging requirement.
- No decision records or remediation logs were supplied.

## Identified Gaps Log

1 gap.

TASK 3: `.bkit/core/engine/tools/instructions-sources.test.ts` `the repo store matches rules.md` fails — the two Project Rules bullets added to `.agents/rules.md` (`Shared wording sync`, `Save checklist`) have no `### {name}` entries in `.bkit/instructions.md` § Project Rules, so the store is shifted by two (11 rules "text differs", bullets 19 and 20 "has no entry"); add the two entries in rules.md order and re-run `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 3: new Project Rules bullets have no .bkit/instructions.md entries
  **Severity:** HIGH · **Class:** broken-test · **Fixable:** true · **Location:** `.bkit/core/engine/tools/instructions-sources.test.ts:170` · **Round:** 1
  - **DONE WHEN:** `.bkit/instructions.md` § Project Rules has entries for `Shared wording sync` and `Save checklist` in rules.md order, and `pnpm exec vitest run .bkit/core/engine/tools/instructions-sources.test.ts` passes
  - **TEST FIRST:**
    - .bkit/core/engine/tools/instructions-sources.test.ts
<!-- bkit:task 1 end -->
