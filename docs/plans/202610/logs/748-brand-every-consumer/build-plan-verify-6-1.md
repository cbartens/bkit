Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 15, 16, 17, 18
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 6

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Judged against `build-diff-6-1.md` (commits b0f13e810 tests, f01554f22 code). The code commit touched only `core.ts` and `dist/install/modules/core.js`, so every planned group 6 test is unedited since the tests step.
- Test-first audit `build-tests-green-6-1.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`; all seven planned tests went red, then green. No `Updated tests`, `Already landed` or `Unproven` entries.
- `pnpm bkit:gate:static-unit` exit 0 (166 unit files, 6960 passed, 2 skipped; bats green). `vitest run core.integration.test.ts core.test.ts`: 159 passed, including all seven group 6 tests.
- TASK 15 satisfied: `otherWorkflows([ciWorkflowPath("."), bkit-trivy.yml])` is scanned per unit before any move; a hit logs `{file}:{line} still names {from}` and `continue`s.
- TASK 16 satisfied: the job body runs to the next 2-space key or top-level key; `name:` is inserted only when no 4-space `name:` is in it; the test parses the result with `parseYaml`.
- TASK 17 satisfied: a negative lookahead `(?!-(?:F|C|-filter|-dir|-prefix))` stops the flag group, so the call stays; `findOldScriptNames` still matches the bare old name after a space, so the hook/CI warning fires.
- TASK 18 satisfied: after the rewrite loop, every other workflow file gets `findOldScriptNames` with warnings only, no write.
- TASK 19 not satisfied: the CI-script half meets the DONE WHEN (`linkedPath` checks every component of source and target, and `exists` uses `lstat`); the Vale half leaves a symlinked `House` directory or `House/<rule>.yml` source without the warning (gap logged).
- `build-decision-1-1.md` covers group 3 (Tasks 7, 8) and accepts nothing in this group.
- `build-plan-current.md` (CONCERNS) names only line-anchor rewording for Tasks 1, 2, 3, 7, 8, 11, 12, none of them in this group.
- Out of scope, not gated: the five LOW challenge findings were deferred to `docs/deferrals.jsonl` in the tests commit (rows `748-brand-every-consumer-challenge-low-*`).

## Identified Gaps Log

2 gaps.

TASK 19: `.bkit/core/engine/install/modules/core.ts` `migrateValeHouseStyle` — a symlinked source is skipped with no `console.warn`: a symlinked `.vale/styles/House` directory returns silently at `core.ts:1245` (`lstat(...).isDirectory()` is false for a link), and a symlinked `.vale/styles/House/<rule>.yml` is skipped silently at `core.ts:1256` (`isFile()` is false for a link). The DONE WHEN asks that every source, target and target directory be checked and a symlink be treated as "not moved" with one `console.warn` naming the path; only `.vale`, `.vale/styles`, `.vale/styles/Bkit` and a taken `Bkit/<rule>.yml` target warn today. No write goes through the link, so this is a missing notice, not a write-through — Fixable: true
GROUP 6: `docs/migrations.md` rows no longer describe what the code does after this group: "Branded CI script files" (line 36) still says only "an edited unit or an existing target is left with a warning", but a unit is now also left when a workflow outside the path pass names its old path (Task 15) or when a source, target or directory is a symlink (Task 19); "Branded script tokens in hooks and CI" (line 35) does not say every other `.github/workflows/*.yml` / `*.yaml` file is now scanned and warned with file and line, without a write (Task 18); "Vale style `House` → `Bkit`" (line 38) does not say a symlinked `.vale`, `.vale/styles` or `Bkit` directory leaves the rules unmoved (Task 19). The plan's Mandatory Tasks require affected docs rewritten to match — Fixable: true
