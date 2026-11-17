Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 31
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 9

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- **Inputs:** brief `build-brief-9-1.md`, group diff `build-diff-9-1.md`, tests and tasks logs, test-first audit `build-tests-green-9-1.md` (`Enforced: true`, `Gaps: 0`, `Unproven: 0`, so no audit gap to decide). `build-plan-current.md` names Tasks 1, 4, 6 and 9 only. `build-decision-1-*.md` cover group 1 only; none accepts a group 9 gap. No earlier group 9 verify or remediate report exists.
- **Tests run (by path):** `commands/workflow/steps.test.ts`, `commands/workflow/status.test.ts`, `commands/workflow/issues.test.ts`, `commands/lib.test.ts` (374 passed), and `commands/workflow/ledgers.test.ts`, `ledgers/journal.integration.test.ts`, `commands/workflow/counters.test.ts` (193 passed), all under `.bkit/core/engine/`. The full suite was not run, per the caller's instruction.
- **TASK 31 (satisfied):** `status invocation` refuses a symlinked final component with `lstatSync` before any write (`status.ts:694`); the planned test passes. `resolvesInside` (`commands/lib.ts:648`) realpaths the file itself and refuses a path outside the checkout or owned by a nested worktree. A scratch run against `dist/cli.js` confirmed both receipt paths: with the receipt present, `ledgers append --invocation` exits 2 with `... resolves outside this checkout` (`resolveInvocation`); with the receipt deleted, it exits 2 with `not issued in this repository` (`rebuildInvocation` skips the symlinked file), and the other repository's `status.jsonl` stays byte-identical in both. Control: with a real file in place, the rebuild writes the receipt again. No planned test covers the two `lib.ts` refusals; the DONE WHEN does not ask for one.
- **TASK 30 (not satisfied):** the DONE WHEN holds as written. `ledgerKeys` reads every fold winner of `docs/failures.jsonl` through `queryLedger` with no status filter, CLOSED rows included. An explicit `priorKey` still bypasses the check, and the planned test passes. The gap is the re-render instability logged below. `steps verdict --result-file` cannot reach it for audits (`bkit-audit-generate declares no Verdict: line`), so the Fingerprint change has no shipped reader; the duplicate-row path through a re-render plus a fresh `--operation` does.
- **Out of scope, not a gap:** `ledgerKeys` resolves `docs/failures.jsonl` against `ctx.cwd`, not the repository top, so a `steps stub` run from a subdirectory sees no held keys. `bkit-audit-generate.md` step 11 still describes a new key as `audit-{slug}-{content-slug}` and does not mention the `-2` suffix. No task names either one.
- **Edits by script:** the code agent's Python-script edits were judged on the code alone. Scratch fixtures live under `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/c8df0e69-6e8c-4878-95dc-cd64f434fb6b/scratchpad/`. No source file was edited.

## Identified Gaps Log

1 gap.

- TASK 30: `renderAudit` (`.bkit/core/engine/commands/workflow/steps.ts:1571`) is no longer stable for one result: once its own `ledgerRows` land in `docs/failures.jsonl`, re-rendering the same result file treats those rows as held and derives `audit-security-token-logged-2` (reproduced with `dist/cli.js`: stub -> `ledgers append --operation=op-1` -> stub again). A resumed audit step that re-renders and appends with a fresh `--operation` therefore writes a second OPEN row of the same finding under a new key, and the `## Ledger` list and Fingerprint change. The held-key check needs to skip a held winner that is this same finding (same `summary` and the same `file:line` in its `description`, the prompt's own same-problem rule), and a test that a second render after the append keeps the original key. — Fixable: true
