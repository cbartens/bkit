# Document the Node test route and the test-name contract Implementation Plan

## Context & Goals

`/bkit-build` finds each `TEST FIRST` test by the `<testcase name>` in the JUnit report that `bkit:test:file` writes. The docs give no Node setup and never say a planned name must appear in that report. Document the Node command, the one-case-per-file outcome and the name contract. Docs only; no engine change.

Path note: the issue names `.bkit/shared/docs/testing.md`, which does not exist in this checkout. The "Declare `bkit:test:file`" bullet is in `docs/testing.md` § Test first (line 306), so Task 1 updates that file.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| testing | `docs/testing.md` | yes — the doc being changed | `docs/testing.md` § Test first | covered | None. |
| architecture | `docs/architecture.md` | no — docs-only change | none | none | None. |
| technology | `docs/technology.md` | no — docs-only change | none | none | None. |
| security | `docs/security.md` | no — docs-only change | none | none | None. |

## Documentation Warnings

```jsonl
{
  "topic": "testing",
  "gap": "issue path missing",
  "recommendedPath": ".bkit/shared/docs/testing.md",
  "alternativeEvidence": "docs/testing.md § Test first holds the Declare bkit:test:file bullet",
  "action": "Update docs/testing.md instead."
}
```

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Node `bkit:test:file` command and naming outcomes | `docs/testing.md` | `grep -rl 'Declare `bkit:test:file`' .bkit docs`, read § Test first | `docs/testing.md` — has Vitest, pytest, jest; missing Node | EXTEND | Add Node command and both naming outcomes to the existing bullet. |
| Test-name contract and `red-not-loaded` wording | `.bkit/workflows.md` | `grep -n "red-not-loaded\|Literal names" .bkit/workflows.md`, read `isNamedCase` / `judgeRed` in `tests.ts` | `.bkit/workflows.md` § Test-first — names and `red-not-loaded` present, imprecise | EXTEND | Reword the Literal names bullet and the `red-not-loaded` text to match `judgeRed`. |

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Document the Node route and the test-name contract

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Add the Node `bkit:test:file` setup to the testing doc
  - **UPDATE:** `docs/testing.md`: in § Test first, extend the "Declare `bkit:test:file`" bullet with the Node command (`node --test --test-reporter=spec --test-reporter-destination=stdout --test-reporter=junit --test-reporter-destination="$BKIT_TEST_REPORT"`), the `node:test` recommendation, the one-case-per-file naming (path as passed) for files without it, and the leaf-test or `suite > test` naming for nested `describe`
  - **READ:** `.bkit/core/engine/commands/workflow/tests.ts`: `isNamedCase` and `judgeRed`, the matching rules
  - **DONE WHEN:** the bullet gives the Node command, says Node tests use `node:test`, and states that a non-`node:test` file reports one case named after the path as passed and the plan names it that way; `bkit check` passes
  - **TEST FIRST:** n/a — docs only

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** State the test-name contract in the build workflow doc
  - **UPDATE:** `.bkit/workflows.md`: § Test-first, the **Literal names** bullet: a planned name must be a `<testcase name>` the repo's `bkit:test:file` writes; a one-case-per-file runner means the plan names the file
  - **UPDATE:** `.bkit/workflows.md`: § Test-first, the `red-not-loaded` wording in the Red row and the **The report, never the exit code** bullet, matched to `judgeRed` (no case carries the planned name, and every case in the report is a non-passing case whose name contains the file's stem)
  - **READ:** `.bkit/core/engine/commands/workflow/tests.ts`: `isNamedCase` and `judgeRed`, the matching rules
  - **DEPENDS ON:** 1
  - **DONE WHEN:** both bullets match `judgeRed` and `isNamedCase`, and point to `docs/testing.md` § Test first for per-runner commands
  - **TEST FIRST:** n/a — docs only

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Give consumers the Node setup

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Add a § Test first to the starter testing doc so the workflow pointer resolves for consumers
  - **UPDATE:** `.bkit/templates/docs/testing.md`: new `## Test first` section, placed after `## What each tier must do`, marked as bkit practice. It carries the "Declare `bkit:test:file`" bullet with the Vitest, pytest, jest and Node commands and the Node case-name rules, written from `docs/testing.md` § Test first (the same wording, no copy of bkit-only facts)
  - **READ:** `docs/testing.md`: § Test first, the source wording
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** the starter has a `## Test first` section with the Node command and both naming outcomes, so `docs/testing.md` § Test first in a consumer repo exists after adoption; `bkit check` passes
  - **TEST FIRST:** n/a — docs only

<!-- bkit:task 3 end -->

<!-- bkit:group 2 end -->

## Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| none: docs-only change | n/a | n/a | 1 |
| none: docs-only change | n/a | n/a | 3 |
