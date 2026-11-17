Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (the plan has 2 groups).

## Integration Gaps

0 gaps.

- Round 1's gap is closed. The shipped `.bkit/core/.bkit/workflows.md:1802` and `:1804` still send readers to `docs/testing.md` § Test first. The starter `.bkit/templates/docs/testing.md` now has `## Test first` at line 368, right after `## What each tier must do` (line 301) and before `## Design assertions are a dimension, not a lane` (line 379). A consumer who adopts the starter therefore has the section the pointer names, with the Vitest, pytest, jest and Node commands and the Node case-name rules.
- The four texts agree with each other and with the engine (`.bkit/core/engine/commands/workflow/tests.ts:522-578`):
  - `isNamedCase` matches a case whose name equals the planned name or ends with ` {name}`. The Literal-names bullet (`workflows.md:1804`) says the same thing word for word.
  - `judgeRed` returns `red-not-loaded` when no case matches the planned name and the report has either no cases or only non-passing cases whose names contain the file stem (`fileStem`: base name without its extension). The Red row (`workflows.md:1797`) and the report bullet (`:1802`) both say this.
  - The case name is the raw `<testcase name>` attribute (`junit.ts:118`), so a name the runner leaves out (such as Node's `describe` names) cannot be matched. This is why `docs/testing.md:303` and the starter's line 373 tell the plan to use the leaf name and never `suite > test` for Node. The general `suite > test` sentence in `:1804` covers only runners that write that path. It does not conflict, because the same bullet first requires the planned name to be a `<testcase name>` the runner writes.
  - A plain script reports one case named after the path as passed. The plan uses that path, and `isNamedCase` matches it exactly. That is the "runner that reports one case per file means the plan names the file" clause in `:1804`.
- I ran Node v24.16.0 with the documented command in the scratchpad to confirm the documented behaviour:
  - A `describe("suite") > it("leaf")` file reports `<testcase name="leaf">`.
  - A file with a failing import reports one failing case `name="t/b.test.mjs"`, which contains the stem `b.test`. When the plan names a leaf test, `judgeRed` reads this as `red-not-loaded`.
  - A plain script reports one passing case `name="t/c.test.mjs"`, the path as passed.
- `docs/testing.md:302-307` and `.bkit/templates/docs/testing.md:372-377` (the "Declare `bkit:test:file`" bullet and its sub-bullets) are byte-identical, checked with `diff`.
- The source `.bkit/core/.bkit/workflows.md` and its mirror `.bkit/workflows.md` differ only on the managed-marker line 3.

## Previously Attempted

- `build-plan-verify-holistic-1.md`: FAIL, 1 gap. The shipped pointer to `docs/testing.md` § Test first led nowhere in a consumer repo. `build-decision-1-1.md` chose Fix now, option (b), which became TASK 3 in group 2.
- `build-plan-verify-2-1.md`: CONCERNS, 1 gap. The starter's Node bullet added "and that case counts as passed". `build-plan-gaps-remediate-2-1-log.md` (c0c800b10) deleted it.
- `build-plan-verify-2-2.md`: PASS, Tasks 3.
- Group 1: `build-plan-verify-1-1.md` (CONCERNS, 2 gaps, fixed by `build-plan-gaps-remediate-1-1-log.md`) and `build-plan-verify-1-2.md` (PASS, Tasks 1, 2).

## Notes

- This is a docs-only plan with 2 groups and 3 tasks. Every `TEST FIRST` is `n/a — docs only`. Both `Derived Test Matrix` rows are `none: docs-only change` (tasks 1 and 3), so no test is owed. The plan has no `Documentation Updates` section.
- TASK 1 is satisfied: `docs/testing.md:302-303` has the Node command, the `node:test` recommendation, the leaf-name rule for nested `describe` and the path-as-passed rule for plain scripts.
- TASK 2 is satisfied: the Red row, the report bullet and the Literal-names bullet match `judgeRed` / `isNamedCase` and point to `docs/testing.md` § Test first.
- TASK 3 is satisfied: the starter has `## Test first` with the Node command and both naming outcomes. `node dist/cli.js check` exits 0 with no drift lines.
- `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 0. It covered 31 changed files and ran `pnpm bkit:gate:changed`, verdict PASS.
- Test-first audits: `build-tests-green-2-2.md` (and group 1's `build-tests-green-1-2.md`) show `Enforced: true`, `Gaps: 0`, `Unproven: 0`. They have no `Updated tests`, `Already landed`, `Unproven` or `delete-still-referenced` entries to decide.
- Decision record `build-decision-1-1.md` is where TASK 3 comes from. It accepts no gap.
- `docs/observability.md` does not apply: the change has no code paths and no errors to log.
- Known limit, not a gap: `.bkit/templates/docs/testing.md` is a copy-and-own starter. A consumer who already adopted an older copy does not receive the new section on `bkit upgrade`. TASK 3's `DONE WHEN` scopes the fix to "after adoption", which is the owner's option (b).
- Out of scope, proposed separately: `.bkit/core/.bkit/templates.md:197-201` is the shipped `package.json` script list. For `bkit:test:file` it still lists only Vitest and jest, while the starter's § Test first now lists Vitest, pytest, jest and Node. The per-runner commands now live in two shipped places that disagree. Option (b) left `templates.md` unchanged on purpose, so this is a follow-up: point that list at the starter section or add the missing runners.
- The decision says "note in 887". This run's logs and `tmp/bkit-comment-*.md` show no comment on #887. It is a tracker action for the orchestrator, not a plan task, so it is not logged as a gap.

## Identified Gaps Log

None
