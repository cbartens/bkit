Verdict: FAIL
Failures: 1
Fixable: false
Tasks: 1, 2
Loosened: none
Fingerprint: 9108440edd2d0f9dd1860c55416f2367a607cca63255f7a8608dc459e6b0a221
<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

1 of 1 (the plan has 1 group).

## Integration Gaps

1 gap.

- TASK 2's new pointers in the shipped `.bkit/core/.bkit/workflows.md:1802` (report bullet) and `:1804` (Literal-names bullet) name `docs/testing.md` § Test first as the home of per-runner commands. `bkit install` / `upgrade` write that file byte-equal into every consumer (`.bkit/core/engine/install/manifest.ts:156`). TASK 1's section is in bkit's own `docs/testing.md:298` (945 lines, adapted far from its starter). A consumer's `docs/testing.md` is copied from `.bkit/templates/docs/testing.md` (512 lines, unchanged on this branch), which has no § Test first and no `bkit:test:file` text, so in a consumer repo the pointer leads nowhere. The shipped list of per-runner commands is `.bkit/core/.bkit/templates.md:197-201`, which has Vitest and jest only: the new Node command and the Node case-name rules reach no consumer. This is the only shipped pointer into a `docs/testing.md` section that the starter lacks (the other, § "CI verbosity", exists in the starter). The issue named `.bkit/shared/docs/testing.md`, a shipped path; the plan's path note retargeted it to bkit's own project doc. Closing it needs an owner choice the plan does not make: retarget both pointers to `.bkit/templates.md` and add the Node lines there, or add a § Test first to the starter `.bkit/templates/docs/testing.md`. Either one changes files the plan does not list and contradicts TASK 2's `DONE WHEN` pointer. `Fixable: false`.

## Previously Attempted

- `docs/plans/202611/logs/917-docs-node-test/build-plan-verify-1-1.md`: CONCERNS, 2 gaps (TASK 1 nested-`describe` naming; TASK 2 edited only the mirror).
- `docs/plans/202611/logs/917-docs-node-test/build-plan-gaps-remediate-1-1-log.md`: both gaps DONE in f1369db03; `bkit:generate` snapshot step BLOCKED on the tests lock.
- `docs/plans/202611/logs/917-docs-node-test/build-plan-verify-1-2.md`: PASS, Tasks 1, 2.
- No earlier holistic verify.

## Notes

- Docs-only plan, one group, two tasks; both `TEST FIRST: n/a — docs only`. The `Derived Test Matrix` has one `none: docs-only change` row, so no test is owed. No `Documentation Updates` section. No decision records (`build-decision-*.md` absent).
- TASK 1 satisfied: `docs/testing.md:302-303` gives the Node command, says to write Node tests with `node:test`, says a non-`node:test` file reports one case named after the path as passed and the plan names it by that path, and says nested `describe` names are dropped. `node dist/cli.js check` exits 0 (advisories only, no drift).
- TASK 2 satisfied: the Red row, report bullet and Literal-names bullet in `.bkit/core/.bkit/workflows.md` match `isNamedCase` / `judgeRed` (`.bkit/core/engine/commands/workflow/tests.ts:522-578`), and both bullets point to `docs/testing.md` § Test first. Source and mirror `.bkit/workflows.md` differ only on the managed-marker line 3.
- Cross-task consistency inside bkit's repo holds: a `node:test` file whose import fails reports one failing case named after its path, which `judgeRed` reads as `red-not-loaded` when the plan names the leaf test, as TASK 2's wording says.
- Test-first audit `build-tests-green-1-2.md`: `Enforced: true`, `Gaps: 0`, `Unproven: 0`; no `Updated tests`, `Already landed`, `Unproven` or `delete-still-referenced` entries.
- `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` not run: the Context says not to run the full test gate or wait on the machine-wide test lock, and `origin/dev` is far behind this branch (hundreds of changed files, so `bkit:gate:changed`, which takes the tests lock, would be close to a full run). This branch's own diff since a2c8e2741 touches only Markdown (`docs/testing.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/workflows.md`) plus plan logs, so no test can newly fail from it.
- `docs/observability.md`: not applicable (no code paths, no errors to log).
- Out of scope, not logged: `.bkit/core/.bkit/templates.md:197-201` also lacks pytest, which bkit's own `docs/testing.md` lists.

## Identified Gaps Log

1 gap.

- INTEGRATION: TASK 2 -> TASK 1 (group 1) — the shipped `.bkit/core/.bkit/workflows.md:1802,1804` (byte-equal into every consumer's `.bkit/workflows.md`, manifest.ts:156) now sends readers to `docs/testing.md` § Test first for per-runner commands, but that section exists only in bkit's own adapted `docs/testing.md:298`; a consumer's `docs/testing.md` starts from `.bkit/templates/docs/testing.md`, which has no § Test first and no `bkit:test:file` text, and the shipped per-runner list (`.bkit/core/.bkit/templates.md:197-201`) still has only Vitest and jest, no Node; closing it needs a choice the plan does not make (retarget the pointer to `.bkit/templates.md` and add the Node lines there, or add a § Test first to the starter template) — Fixable: false

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Shipped workflows.md points consumers to docs/testing.md § Test first, which exists only in bkit own project doc; Node command reaches no consumer
  **Severity:** MEDIUM · **Class:** integration-dangling-pointer · **Fixable:** false · **Location:** `.bkit/core/.bkit/workflows.md:1804` · **Round:** 1
  - **DONE WHEN:** Every shipped pointer for per-runner bkit:test:file commands resolves in a fresh consumer install, and the Node command and case-name rules are in that shipped location
  - **TEST FIRST:**
<!-- bkit:task 1 end -->
