# Brief: group 2 — Give consumers the Node setup

Plan: Document the Node test route and the test-name contract Implementation Plan

## Why and what

### Context & Goals

`/bkit-build` finds each `TEST FIRST` test by the `<testcase name>` in the JUnit report that `bkit:test:file` writes. The docs give no Node setup and never say a planned name must appear in that report. Document the Node command, the one-case-per-file outcome and the name contract. Docs only; no engine change.

Path note: the issue names `.bkit/shared/docs/testing.md`, which does not exist in this checkout. The "Declare `bkit:test:file`" bullet is in `docs/testing.md` § Test first (line 306), so Task 1 updates that file.

## Where it fits

- Group 1: Document the Node route and the test-name contract — done
  - TASK 1: Add the Node `bkit:test:file` setup to the testing doc — done
  - TASK 2: State the test-name contract in the build workflow doc — done
- Group 2: Give consumers the Node setup — this group
  - TASK 3: Add a § Test first to the starter testing doc so the workflow pointer resolves for consumers — open

## The work

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Add a § Test first to the starter testing doc so the workflow pointer resolves for consumers
  - **UPDATE:** `.bkit/templates/docs/testing.md`: new `## Test first` section, placed after `## What each tier must do`, marked as bkit practice. It carries the "Declare `bkit:test:file`" bullet with the Vitest, pytest, jest and Node commands and the Node case-name rules, written from `docs/testing.md` § Test first (the same wording, no copy of bkit-only facts)
  - **READ:** `docs/testing.md`: § Test first, the source wording
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** the starter has a `## Test first` section with the Node command and both naming outcomes, so `docs/testing.md` § Test first in a consumer repo exists after adoption; `bkit check` passes
  - **TEST FIRST:** n/a — docs only

<!-- bkit:task 3 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Add the Node `bkit:test:file` setup to the testing doc — `docs/testing.md`
- TASK 2 (group 1, done): State the test-name contract in the build workflow doc — `.bkit/workflows.md`
