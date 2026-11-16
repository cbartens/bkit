Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2
Loosened: none
Fingerprint: 235ab4a36cd863efb77b06adec379e6cecfae5eabe423bb295242a951dee6c8b
<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-1-1.md`: CONCERNS, 2 gaps (TASK 1 starter-rule scope, TASK 2 adoption-order chart, table and notes), both `Fixable: true`.
- `build-plan-gaps-remediate-1-1-log.md`: PASS, both gaps marked DONE, group gate exit 0 (commit `97c45eb53`).

## Notes

- Mode: Group. Judged Tasks 1 and 2 against `build-diff-1-2.md` (all group 1 changes, execute plus remediation). The brief has no `Deviations` section, and no decision records exist for group 1.
- Test-first audit (`build-tests-green-1-2.md`): `Enforced: true`, 0 gaps, 0 unproven. Both tasks are `TEST FIRST: n/a — docs`.
- Gap 1 from attempt 1 is closed. The starter-scoped rules sit in **Starter facts only**, **Starter: write once, link elsewhere** and **Starter empty state**, and each lead names `.bkit/templates/docs/*.md` as its scope. With **Project-doc starters**, they cover history, sources, `## Open questions`, write once, tables over prose, naming the file that holds a value, and `Not applicable: {reason}`. The Mermaid rule is still unscoped. The **Rules header** rule and § Which Sections Apply are unchanged.
- Gap 2 from attempt 1 is closed. The chart in `.bkit/core/.bkit/templates.md` § Project docs — adoption order matches doc review § 2.2 node for node and arrow for arrow (ids `IDEA`, `COMP`, `TECH`, `DES`, `ARCH`, `SET`, `SEC`, `TEST`, `OBS`, `DATA`, `DEP`, `NOISE`, `CAP`; the `IDEA` label is `"idea.md"`), plus the `DATA -.-> SEC` arrow. The `Fill these first` column lists exactly the sources of the solid arrows. The dotted-arrow notes are § 2.2's six notes plus data-schema → security.
- TASK 1 also met: the § Docs scope line, the reworded § Doc Templates headline and its starter sentence, the absence of "Template is shape, prompt owns rules" (0 hits), `.bkit/instructions.md` row 27, and the § Template Instructions opener ("holds shape only" has 0 hits).
- TASK 2 also met: line 16, the link from § Project documents, the `docs/idea.md` rule, and the note in `.bkit/core/.agents/docs.md` line 48. `.bkit/core/.bkit/templates.md` has no `#NN` reference.
- The mirrors (`.bkit/authoring.md`, `.bkit/templates.md`, `.agents/docs.md`) match their sources apart from the rendered install marker and the project-owned section below `bkit:end`.
- Gates rerun on the current tree: `pnpm bkit:lint:prose` passed with 0 errors and 47 warnings, across 152 files. The `tsx .bkit/core/engine/tools/instructions.ts` sync check exited 0. `instructions.test.ts`, `instructions-coverage.test.ts`, `instructions-sources.test.ts`, `gateguard-dogfood.integration.test.ts` and `shipped-docs-refs.test.ts` passed: 5 files, 474 tests.
- Docs: `.agents/docs.md` was loaded. `.bkit/authoring.md` was applied through the hook text. `docs/testing.md` and `docs/observability.md` are indexed, but they do not apply to this docs-only group, which adds no tests or error logging.

## Identified Gaps Log

None
