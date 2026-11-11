Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 3, 4, 6, 7
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

- `build-plan-verify-2-1.md` (CONCERNS, 4 gaps: Task 5 ESM spy, Task 6 multi-line warning records, Task 3 debug handover, Task 7 scratch matrix).
- `build-plan-gaps-remediate-2-1-log.md` (FAIL, fixed 3; blocked on the Task 5 planned test).

## Notes

- Judged against `build-diff-2-2.md`, the group diff since group 2 started, and the tree at `215e70962`.
- Test-first audit `build-tests-green-2-2.md`: `Enforced: true`, `Unproven: 0`. It has one gap, Task 5 `not-green`, which the engine marks `Fixable: true`; that value stands. The audit has no `Updated tests` or `Already landed` section, so no test was loosened.
- Targeted run (`pnpm bkit:test:file` on `checks/after/tools.test.ts`, `checks/after/index.test.ts`, `commands/workflow/summary.test.ts`, `commands/workflow/workflows.integration.test.ts`, `audits/repo/shipped-docs-refs.test.ts`, `audits/templates/template-shape.test.ts`, `audits/templates/templates.test.ts`, `audits/repo/dogfood-templates.test.ts`, `audits/repo/rules-sync.test.ts`, `render/`): 13 files, 1046 passed, 1 failed. The failure is the Task 5 ESM spy.
- The Task 5 gap needs an edit to the planned test, for example observing reads through `vi.mock("node:fs", ...)` or a wrapper instead of `vi.spyOn` on the ESM namespace. The code-fix step may not make that edit, and it blocked in attempt 1. A second code-fix round will block the same way. Route it to the tests step or to the owner, as group 1 did with `build-decision-1-1.md`. The detector itself passes every other assertion of the test.
- Task 6 is now satisfied. `jsonObjectChunks` in `.bkit/core/engine/commands/workflow/summary.ts` reads pretty-printed and one-line records, and the new `summary.test.ts` case `reads pretty-printed and one-line warning records from a jsonl fence` passes. `workflows.ts` is unchanged, because `runStatusRows` already limits the summary to the active run.
- Task 3 is now satisfied. `.bkit/core/prompts/bkit-debug-abort-handover.md` step 7 and its `Documentation Warnings` output section carry the run's records and skip raw inputs. The `.bkit/instructions.md` entry is added, and all five host copies (`.claude`, `.codex`, `.cursor`, `.opencode`, `.agents/plugins`) contain the section.
- Task 7 is now satisfied. The scratch matrix logs are in `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/cb321a06-73f5-4f6a-b91c-b8900cbd6d4b/scratchpad/` (`fresh-*.log`, `legacy-*.log`), and the remediation log records each command and its exit code. Both uninstall logs delete no `docs/*.md` project document. `fresh/docs/security.md` is still the byte-identical starter after uninstall. Upgrade registered the adopted docs in `Project Documents`. The `project-docs-missing`, `project-docs-unpopulated` and `project-docs-unindexed` advisories appear as advisories. `node dist/cli.js check` on the dogfood repo exits 0 with no drift, and `.agents/docs.md` keeps its 22 project rows. `dist/` contains `jsonObjectChunks` and `detectProjectDocs`.
- Task 4 was ticked in attempt 1 and is still satisfied.
- Every `Documentation Updates` row has a matching change, in group 1 or in this diff. Every group 2 Derived Test Matrix row has its test named in a task's `DONE WHEN`. The decision records `build-decision-1-1.md` to `build-decision-1-3.md` cover group 1 only, and none of them accepts a group 2 gap.

## Identified Gaps Log

1 gap.

TASK 5: `.bkit/core/engine/checks/after/tools.test.ts` `resolves an indexed equivalent without a missing default warning` — not-green: line 576 `vi.spyOn(fs, "readFileSync")` on the `import * as fs from "node:fs"` namespace still throws "Cannot spy on export" under vitest ESM before the second `detectProjectDocs` call (reproduced: 1 failed / 1046 passed across the group's 13 test files); the code-fix step blocked on it in attempt 1 because only an edit to the planned test fixes it — Fixable: true
