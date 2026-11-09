Verdict: CONCERNS
Failures: 4
Fixable: true
Tasks: 4
Loosened: none

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

- Judged against `build-diff-2-1.md` plus the uncommitted regenerated host mirrors and `docs/templates/` copies from `pnpm bkit:generate`, as the caller directed. Those files still need committing by the caller.
- Test-first audit `build-tests-green-2-1.md`: `Enforced: true`, `Unproven: 0`; one gap (Task 5 `not-green`, engine `Fixable: true`, kept). No `Updated tests` or `Already landed` sections, so nothing is loosened.
- Targeted run (`pnpm bkit:test:file` on `checks/after/tools.test.ts`, `checks/after/index.test.ts`, `commands/workflow/summary.test.ts`, `commands/workflow/workflows.integration.test.ts`, `audits/repo/shipped-docs-refs.test.ts`, `audits/templates/template-shape.test.ts`, `audits/templates/templates.test.ts`, `audits/repo/dogfood-templates.test.ts`, `audits/repo/rules-sync.test.ts`, `render/`): 13 files, 1045 passed, 1 failed (the Task 5 ESM spy). `templates.test.ts` dogfood checks pass with the mirrors present. The instruction registry check (`tools/instructions.ts`, no `--write`) exits 0.
- `node dist/cli.js check` on the dogfood repo exits 0 with no drift and raises `project-docs-unpopulated` for `docs/data-schema.md` and `docs/noise.md` as an advisory. `.agents/docs.md` keeps its `Project Documents` rows.
- Task 4 satisfied: the four maintenance and audit sources check presence, index accuracy and starter-only content in their steps and report sections. They keep absent, starter-only and undercovered topics out of a clean result, populate only within scope and evidence, and keep absence, incomplete coverage and not-applicable topics apart.
- Task 6 lists `workflows.ts` under UPDATE but leaves it unchanged. The build log says `runStatusRows` already limits rows to the active run. The integration test confirms this: earlier-run and raw-input records do not appear. So this is not a gap by itself. The open Task 6 gap is the record shape (see the log).
- Task 3: the `.bkit/core/.agents/rules.md` warn-and-continue wording landed in group 1 (`d51b44bc4`), so the `retained` coverage rows for the rules are correct. Only the debug handover claim is unbacked.
- The decision records `build-decision-1-1.md` to `build-decision-1-3.md` cover group 1 only. None accepts a group 2 gap.
- Derived Test Matrix: every group 2 row (5, 6, 6, 6, 7) is named by its task. The row-98 handover clause is covered by the Task 3 gap.

## Identified Gaps Log

4 gaps.

TASK 5: `.bkit/core/engine/checks/after/tools.test.ts` `resolves an indexed equivalent without a missing default warning` — not-green: line 576 `vi.spyOn(fs, "readFileSync")` on the `import * as fs from "node:fs"` namespace throws "Cannot spy on export" under vitest ESM before the detector runs (reproduced: 1 failed / 1045 passed across the group's 13 test files); the detector satisfies the remaining assertions per the build log, so the fix is a test-side observation of reads that works under ESM — Fixable: true
TASK 6: warning records never reach the summary in their shipped shape — `documentationWarnings` in `.bkit/core/engine/commands/workflow/summary.ts` parses the `jsonl` fence one line at a time, but every shipped example (`bkit-plan-generate.md:111`, `bkit-build-plan-convert.md:70`, `bkit-plan-update.md:88`, `bkit-audit-generate.md:137`, `bkit-ship-update-docs.md:75`, `bkit-utility-update-documentation.md:66`, `bkit-audit-documentation.md:99`, `bkit-audit-adoption.md:108`, `bkit-plan.md:198`) is a pretty-printed multi-line object, and prettier rewrites even a single-line record into that shape on commit (probe: `prettier` on a one-line `jsonl` fence printed a 7-line object); every such line fails `parseJson` and is skipped, so a real run shows no `## Documentation Warnings` while the unit and integration fixtures (single-line `JSON.stringify`) pass. Fix either side: parse each fence as a sequence of JSON objects, or ship single-line examples with `<!-- prettier-ignore -->` before every fence, and add a fixture in the shipped shape — Fixable: true
TASK 3: debug handover path drops warnings — `.bkit/core/workflows/bkit-debug.md` Step 5 says "A handover keeps the unresolved warnings" and the `.bkit/core/.bkit/prompts.md` coverage row for `bkit-debug-abort-handover.md` says it "keeps their warnings", but `.bkit/core/prompts/bkit-debug-abort-handover.md` has no instruction to carry `## Documentation Warnings` records from the run's artifacts (only the load-docs clause changed), and `bkit workflows handover` selects no warning files; the brief's UPDATE for `bkit-debug.md` ("capture warnings on no-plan and handover paths") and the coverage record's evidence are therefore unmet — Fixable: true
TASK 7: the packaged-CLI scratch-consumer matrix (fresh and legacy scratch repos: template refresh, project ownership, index preservation, advisory output, adopted and untouched documents surviving template refresh and uninstall) has not run, and no commands, exit codes or ownership and advisory outputs are recorded; `build-plan-tasks-2-log.md:15` is `BLOCKED`, which never satisfies `DONE WHEN`. The rendered host mirrors and `docs/templates/` copies now exist (uncommitted) and `node dist/cli.js check` exits 0 on the dogfood repo, so only the matrix run and its record remain — Fixable: true
