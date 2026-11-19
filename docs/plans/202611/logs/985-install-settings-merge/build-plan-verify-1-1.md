Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2
Loosened: none
Fingerprint: 42008a952fff73a6011bdd5eeed4b1656405752442aba7da4375460516305ccb
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

- TASK 1 satisfied: `RETIRED_SETTINGS_ENTRIES` (one entry, `.claude/settings.json` `permissions.allow` `mcp__claude_ai_Linear__*`), `findRetiredSettingsEntries(rel, doc, template?, list?)` returning `{ retired, edited }` and `pruneRetiredSettingsEntries(rel, doc, list?)` are exported from `.bkit/core/engine/install/write.ts` beside `RETIRED_DRIVER_HASHES`. File match is equal-or-ends-with `/` plus the path (backslashes normalised); an edited entry starts with the value minus trailing `*`, is not equal to it and is not in the template's list. Adding an entry is one list line, as the brief's Deviations ask.
- TASK 2 satisfied: `writeTier2JsonContained` prunes before `deepContains`, treats a changed document as a write (`update` recorded in a dry run, file written only when not a dry run), passes the pruned base to `mergeManagedJson`, and emits one `console.warn` per edited entry naming the file, the list, the entry and the line to delete. No caller signature changed.
- Ran `pnpm bkit:test:file .bkit/core/engine/install/write.test.ts`: 96 passed. Ran `pnpm bkit:test:file .bkit/core/engine/commands/install/upgrade.integration.test.ts`: 82 passed (includes the two #985 integration tests, which spawn the real CLI against a tmp consumer with no mocks). Language-server diagnostics for `write.ts`: none.
- Every group-1 `Derived Test Matrix` row (7 for TASK 1, 6 for TASK 2) maps to a named `TEST FIRST` test that exists and passes. Edge cases covered: contained template, dry run, template-shipped entry, person entry in another list (`deny`) or another file (`other.json`), relative and absolute destination.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, `Verdict: PASS`, 0 gaps, 0 unproven; every test red then green. No Taken over, Changed by a code step, Updated tests or Already landed sections.
- `dist/install/write.js` was rebuilt in this group (TASK 5's area); harmless, and matches the `Engine builds` rule.
- No decision records and no earlier verify or remediation reports were supplied.
- `docs/testing.md` and `docs/observability.md` are present; the warning uses the existing `console.warn` channel `writeTier2` already uses.

## Identified Gaps Log

None
