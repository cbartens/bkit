Verdict: FAIL
Failures: 3
Fixable: false
Tasks: none

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 3`

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- **Code vs `DONE WHEN`:** both tasks' code meets every `DONE WHEN` clause; each is held off `Tasks` only by its test-first audit gaps. Checks run this pass: `status-holes.test.ts` + `workflow-shape.test.ts` 285/285 green; `pnpm bkit check` exit 0; `rg --hidden` finds no importer of `deriveExpectedStepSetFromSource` / `checkSourceCanonicalDrift` and no `--ship-md` caller; `workflow-shape.test.ts` imports `callWords` / `stepSections` from `checks/status-holes` and holds no local copies; `dist/checks/status-holes.js` rebuilt with the sweep line; the build Step 4 skip row reaches `.claude/`, `.cursor/`, `.opencode/` and both `.agents/**/bkit-build/SKILL.md` mirrors; `.bkit/authoring.md` / `.bkit/workflows.md` equal their `.bkit/core/.bkit/` sources but for the managed marker.
- **TASK 7 conditionality fixture:** checked independently with an awk scan of column-0 `**Run only if**` / `**Skip if**` lines and `(Path X only)` headings in the five workflow files. It gives exactly the fixture's `CONDITIONAL_STEPS` (design 7,11,12; plan 8; build 6,9,13-16; debug 4-11; ship 4,11-13), and no marker sits in a non-step section.
- **TASK 6 `test-changed` "derives the expected step universe for every workflow" → `Fixable: false`:** after the red, `expect(contract.orphanSteps, name).toEqual([])` moved out of the five-workflow loop and became a ship-only assertion. Checks for design / plan / build / debug were removed. A `tsx` probe shows build's derived `orphanSteps` is `["build-decision"]` (the Decision Pause row R4 puts outside every step), so the red-time expectation was wrong for build. Removing the assertion is still a weakening after the red. The planned failure mode (five-workflow universe equality + `SHIP_STEP_ORDER`) is intact.
- **TASK 6 audit gaps judged no gap:** `red-mismatch` + `not-green` on "records every {BKIT} literal in a step as a required call" — the recorded red "records every BKIT literal in a step as a required call" is the planned test with only the braces removed (red-tool limitation in the execute log), and it passes now. Its body still asserts every call in a section, plus flag names without values. `test-changed` on "prints a sweep summary line and exits 0": compared with the red snapshot, only the `flowRow` helper was reformatted. `test-changed` on "holds the workflows to the step table": the `promoted parsers` block is byte-identical to the red snapshot; the rest of the diff is TASK 7's Step 4 rewrites of other build tests. `delete-still-referenced`: the DELETE targets two exports, not the file; both exports are gone and nothing references them.
- **TASK 7 `no-red` ×2 → `Fixable: false`:** both reds were refused because the tests passed at once (`build-task-red-3-7-1.md` 43/43, `3-7-2.md` 242/242). The conditionality rule was already in TASK 6's `deriveContract`, and the Step 4 markdown was edited before its test was written (execute log). `build-plan-current.md` reports `Affected: 0` (no `Broken` task), and the execute log has no `already landed` line, so the override does not apply. `build-decision-1-1.md` / `1-2.md` cover groups 1-2 only, so no decision record accepts these gaps. Only the owner can excuse a missing red.
- **Observation (no gap):** `main()` treats each workflow in a file as one run (`inferWorkflows` per file). Two runs of the same workflow in one `status.jsonl` merge into one audit and one holey count. The planned test passes and run boundaries belong to TASK 9's read path; recorded here for the group 4 verifier.

## Identified Gaps Log

- TASK 6: `.bkit/core/engine/checks/status-holes.test.ts` `derives the expected step universe for every workflow` — test-changed — Fixable: false
- TASK 7: `.bkit/core/engine/checks/status-holes.test.ts` `classifies a step conditional only under the column-0 marker rule` — no-red — Fixable: false
- TASK 7: `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `writes a build-plan-convert row on the no-conversion route` — no-red — Fixable: false
