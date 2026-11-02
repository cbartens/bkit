Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 15, 16, 17, 18, 19
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

- `build-plan-verify-6-1.md` (CONCERNS, 2 gaps: Task 19 Vale symlink notice; three `docs/migrations.md` rows). Remediated in `build-plan-gaps-remediate-6-1-log.md` (commit 678c3619b, both DONE).

## Notes

- Judged against `build-diff-6-2.md` (tests b0f13e810, code f01554f22, remediation 678c3619b). The remediation touched `core.ts`, `dist/install/modules/core.js` and `docs/migrations.md` only; no planned test was edited after the tests step.
- Test-first audit `build-tests-green-6-2.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`; all seven planned tests red then green. No `Updated tests`, `Already landed` or `Unproven` entries.
- `pnpm bkit:gate:static-unit` exit 0 (166 files, 6960 passed, 2 skipped; bats green). `vitest run core.integration.test.ts core.test.ts`: 159 passed, including all seven group 6 tests.
- TASK 15, 16, 17, 18 satisfied: code unchanged since round 1, where each DONE WHEN was met; tests still pass.
- TASK 19 satisfied. Every symlink case the DONE WHEN names was probed against `dist/install/modules/core.js` in a scratch repo with a sibling out-of-repo dir; each gave one `console.warn` naming the path, zero `ws.writes`, and no change outside the repo:
  - CI scripts: dangling `bkit-accepted-advisories.json` target; symlinked old `.mjs` source; `scripts/ci` linked; `scripts/ci/lanes` linked; `scripts` linked (`linkedPath` checks every path component of source and target; `exists` uses `lstat`). The two planned tests cover the dangling target and the symlinked data file.
  - Vale: `.vale` linked; `.vale/styles` linked; `House` linked (round-1 gap, now warns at `core.ts:1246`); `Bkit` linked; `House/<rule>.yml` linked (round-1 gap, now warns at `core.ts:1262`); a dangling `Bkit/<rule>.yml` target counts as present via `lstat` and is never written.
  - A data-file-only unit still moves: the edited and no-template filters apply to `.mjs` only. Warnings name paths only, never file bytes (`docs/security.md` § PII).
- `docs/migrations.md` rows checked against code: "Branded script tokens in hooks and CI" (Task 18 scan, and the `--filter=` forms of Task 17 fall under the existing unreachable-name warning) and "Branded CI script files" (Tasks 15 and 19, whole unit left) now match; "Branded check names" ("when the job has none") holds for Task 16. The "Vale style" row misstates the per-rule symlink case (gap logged).
- `build-decision-1-1.md` covers group 3 only and accepts nothing in this group. `build-plan-current.md` names line-anchor rewording for Tasks 1, 2, 3, 7, 8, 11, 12 only.
- Out of scope, not gated: the five LOW challenge findings are deferred in `docs/deferrals.jsonl` (`748-brand-every-consumer-challenge-low-*`). Seen while probing, not in any DONE WHEN: a symlinked `.github/workflows` directory or workflow file is skipped by `otherWorkflows`, so the Task 15 and 18 scans see nothing there; a symlinked `.vale` or `.vale/styles` warns on every upgrade even after `House` is gone.

## Identified Gaps Log

1 gap.

GROUP 6 (Task 19 docs): `docs/migrations.md` row "Vale style `House` → `Bkit`" (line 38) says "a symlinked `.vale`, `.vale/styles`, `House` or `Bkit` directory, or a symlinked rule, leaves the rules unmoved with a warning". For the directories that holds (`migrateValeHouseStyle` returns before any move, `core.ts:1245-1258`), but a symlinked `.vale/styles/House/<rule>.yml` leaves only that rule unmoved: the loop `continue`s at `core.ts:1262-1267` and every other shipped-identical rule still moves (probe V2 against `dist/install/modules/core.js`). Reword the clause so a symlinked rule is listed with the per-rule cases ("an edited rule, a taken target or a symlinked rule stays with a warning naming the manual move") — Fixable: true
