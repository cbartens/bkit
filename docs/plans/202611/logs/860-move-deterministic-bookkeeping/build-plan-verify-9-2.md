Verdict: PASS
Failures: 0
Fixable: false
Tasks: 30, 31
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

- `build-plan-verify-9-1.md`: `CONCERNS`. Task 31 was satisfied. Task 30 had one gap: the audit key changed on a re-render after the audit's own append (`audit-security-token-logged` became `audit-security-token-logged-2`).
- `build-plan-gaps-remediate-9-1-log.md`: `PASS`, 1 fixed. `auditEntries` reuses a held key when the row has the same summary and `file:line`. `ledgerKeys` resolves `docs/failures.jsonl` from `repoRoot(cwd)`. Added test `keeps the audit key when the same finding is rendered again after its append`.

## Notes

- **Inputs:** brief `build-brief-9-1.md`, group diff `build-diff-9-2.md`, tests and tasks logs, test-first audit `build-tests-green-9-2.md` (`Enforced: true`, `Gaps: 0`, `Unproven: 0`, no `Updated tests` or `Already landed` section, so the audit has no gap to decide). `build-plan-current.md` names Tasks 1, 4, 6 and 9 only. `build-decision-1-*.md` cover groups 1, 3 and the round 1 challenge; none of them accepts a group 9 gap. The brief has no `Deviations` section.
- **Tests run (by path):** `.bkit/core/engine/commands/workflow/steps.test.ts`, `.bkit/core/engine/commands/workflow/status.test.ts`, `.bkit/core/engine/commands/workflow/issues.test.ts` and `.bkit/core/engine/commands/lib.test.ts`: 4 files, 375 passed (374 in attempt 1, plus the added re-render test). `pnpm typecheck` printed no errors. The full suite and `bkit tests changed` were not run, per the caller's instruction.
- **TASK 30 (satisfied):** the planned test `derives a fresh audit key when the ledger already holds it` passes. A scratch run against `dist/cli.js` used the real `ledgers append --operation`. The first render gave `audit-security-token-logged`. After that row was appended, the second render gave the same key and the same `Fingerprint`. With an OPEN row of a different finding (`src/old.ts:9`) already held, the render gave `-2`. After `-2` was appended, a re-render still gave `-2`, and both rows stayed OPEN. A third same-title finding (`src/other.ts:1`), rendered from a subdirectory, gave `-3`, which confirms the `repoRoot` fix. An explicit `priorKey` still sets the key directly (`auditEntries` derives a key only when `key === undefined`). The attempt 1 gap is closed.
- **TASK 31 (satisfied, undisturbed):** the remediate round changed only `issues.ts`, `steps.ts`, `steps.test.ts` and their `dist/` copies. `status.ts:694` (the `lstatSync` refusal) and `resolvesInside` in `commands/lib.ts` are unchanged since attempt 1. The planned test `refuses to issue an invocation through a status file symlinked out of the checkout` passes.
- **Out of scope, still not a gap:** step 11 of `bkit-audit-generate.md` does not yet mention the `-N` suffix. The same-finding match reads `file:line` from `references` or from the `(file:line);` part of the description, so a location that contains a space would not match. No task names either one.
- **Scratch fixtures:** `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/c8df0e69-6e8c-4878-95dc-cd64f434fb6b/scratchpad/t30v2.sh` and `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/c8df0e69-6e8c-4878-95dc-cd64f434fb6b/scratchpad/t30v2/`. No source file was edited.

## Identified Gaps Log

None

