## Session Prompt — this run's, newer than everything below

/bkit-build #917

## Issue description — oldest

### Narrative

`/bkit-build` finds each `TEST FIRST` test by the `<testcase name>` in the JUnit report that the repo's `bkit:test:file` writes (`isNamedCase` in `.bkit/core/engine/commands/workflow/tests.ts`). The docs never say that the planned test name has to be a name that report actually contains. They also give no Node setup: `.bkit/shared/docs/testing.md` § Test first ("Declare `bkit:test:file`", line 306) shows Vitest, pytest and jest only.

Consumers filled the gap themselves. `gether-life/app-gether-life` and `fcte-com-au/visitfrasercoast-com` run `*.test.mjs` with plain `node <file>` and write a report with one case named after the file's basename. A plan that names an individual test inside such a file can never be matched. This happened in a recent app-gether-life build: Task 7 named two tests inside a plain-node file, bkit could not find them, and they stayed unproven. Which issue or plan that was is not recorded here.

Node 24 has a built-in JUnit reporter, and it behaves differently depending on how the file is written. Verified on Node v24.16.0:

<!-- prettier-ignore -->
| File | `node --test --test-reporter=junit --test-reporter-destination="$BKIT_TEST_REPORT" {file}` reports |
| --- | --- |
| written with `node:test` | one case per test, named after the test (`scripts/ci/guards/dependency-decoder.test.mjs` → 4 cases) |
| not written with `node:test` (a home-made `test(name, fn)` helper) | one case named after the path **as passed** (`scripts/ci/deploy/health-baseline.test.mjs`), not the basename |
| fails to load (import of unwritten code) | one failing case named after the path, message `test failed`, which bkit already reads as `red-not-loaded` |

So the ideal Node setup is: write Node tests with `node:test`, and run them through `node --test` with the JUnit reporter plus `spec` to stdout. A file that does not use `node:test` gets one case per file, and the plan must name it exactly as that report does.

### Success Criteria

- `.bkit/shared/docs/testing.md` § Test first gives the Node `bkit:test:file` command next to Vitest, pytest and jest, and says Node tests should be written with `node:test`.
- The same section says a file not written with `node:test` reports one case named after the path as passed, and that the plan names it that way.
- `.bkit/workflows.md` § Test-first says a `TEST FIRST` test name must be a `<testcase name>` the repo's `bkit:test:file` writes, and that a runner reporting one case per file means the plan names the file.
- `.bkit/workflows.md` § Test-first describes `red-not-loaded` the way `judgeRed` decides it: no case carries the planned name, and every case in the report is a non-passing case whose name contains the file's stem.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `node:test` file with nested `describe` | the case is named after the leaf test; the plan names the leaf, or `suite > test` |
| non-`node:test` file run under `node --test` | one case named after the repo-relative path bkit passed; a plan naming only the basename does not match (`isNamedCase` needs an exact name or a space before the suffix) |
| `node:test` file run with plain `node {file}` | still runs and exits non-zero on failure, so CI runners that call `node` per file keep working |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| none: docs-only change | n/a | n/a |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Document the Node route and the test-name contract
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Add the Node `bkit:test:file` setup to the shipped testing doc
  - **UPDATE:** `.bkit/shared/docs/testing.md`: in § Test first, extend the "Declare `bkit:test:file`" bullet with the Node command (`node --test --test-reporter=spec --test-reporter-destination=stdout --test-reporter=junit --test-reporter-destination="$BKIT_TEST_REPORT"`), the `node:test` recommendation and the one-case-per-file naming for files without it
  - **READ:** `.bkit/core/engine/commands/workflow/tests.ts`: `isNamedCase`, `judgeRed`
  - **DONE WHEN:** the bullet gives the Node command and both naming outcomes in the table above, and `bkit check` passes on bkit's own checkout
  - **TEST FIRST:** n/a — docs only
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [ ] **TASK 2:** State the test-name contract in the build workflow doc
  - **UPDATE:** `.bkit/workflows.md`: § Test-first, the **Literal names** bullet: a planned name must be a `<testcase name>` the repo's `bkit:test:file` writes, and a one-case-per-file runner means the plan names the file
  - **UPDATE:** `.bkit/workflows.md`: § Test-first, the `red-not-loaded` wording in the Red row and in the **The report, never the exit code** bullet, matched to `judgeRed`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** both bullets match `judgeRed` and `isNamedCase` in `tests.ts`, and point to `.bkit/shared/docs/testing.md` § Test first for the per-runner commands
  - **TEST FIRST:** n/a — docs only
<!-- bkit:task 2 end -->
<!-- bkit:group 1 end -->

### Open Questions & Assumptions

- bkit's own template tests are not written with `node:test`, except `bkit-test-awake.test.mjs`: `.bkit/templates/scripts/ci/bkit-check-accepted-divergences.test.mjs`, `bkit-check-capstone.test.mjs`, `bkit-check-dependency-audit.test.mjs`, `lanes/bkit-resolve-push-base.test.mjs`. Consumers adopt them, so they report one case per file. Moving them to `node:test` is a separate decision.

### Out of Scope

- Engine changes to `judgeRed` or its messages.
- Consumer `bkit-test-file.mjs` scripts, which are tracked in each consumer repo.

### References

- `.bkit/shared/docs/testing.md` § Test first
- `.bkit/workflows.md` § Local gate scripts, § Test-first
- `.bkit/core/engine/commands/workflow/tests.ts`: `isNamedCase`, `judgeRed`, `parseJunit`
