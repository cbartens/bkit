# Brief: group 1 — Narrow test runs while agents work

Plan: Build agents' test runs while working Implementation Plan

## Why and what

### Context & Goals

The `Local pre-commit` rule covers only the run before a commit, so build and debug agents pick their own wide test commands while they work and hold the machine-wide tests lock (#920). The rule is reworded to cover runs made while working, and the five build and debug prompts that run tests each carry the whole bullet.

**Related Issues:**

- #920 — Build agents' test runs while working (open)
- #744 — Build agents re-run the whole unit suite after every change
- #822 — Route raw test-runner commands through the tests lock per host (out of scope)
- #916 — Tests lock: waiting runs win at random (out of scope)

## Where it fits

- Group 1: Narrow test runs while agents work — this group
  - TASK 1: Reword `Local pre-commit` to cover runs made while working, and make the build and debug prompts carry it — open
  - TASK 2: Copy the reworded rule into the prompts, mirrors and installed rules file — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Reword `Local pre-commit` to cover runs made while working, and make the build and debug prompts carry it
  - **UPDATE:** `.bkit/core/.agents/rules.md`: reword the `Local pre-commit` bullet: before a commit and while working, run only the tests the change affects, naming each test file, never a folder, a pattern, the full suite or a `bkit:gate:*` script; a `/bkit-*` step's named command is its only wider run; no test runner or stack named
  - **UPDATE:** `.bkit/instructions.md`: in `### local-pre-commit`, the new text, the old text added under `retired`, and a `- carry:` line naming `bkit-build-plan-tasks`, `bkit-build-plan-tests`, `bkit-build-plan-verify`, `bkit-build-plan-gaps-remediate` and `bkit-debug-failure-remediate`
  - **UPDATE:** `.bkit/core/engine/tools/instructions.test.ts`: add the two tests below
  - **READ:** `.bkit/instructions.md`: `## Format` (rule section lines, the `carry` relation)
  - **READ:** `.bkit/authoring.md`: § Which Sections Apply, § Before You Save
  - **DONE WHEN:** the store entry and the `rules.md` bullet hold the same new text, and the five prompts are listed under `carry`
  - **TEST FIRST:**
    - `.bkit/core/engine/tools/instructions.test.ts` `every build and debug prompt that runs tests carries local-pre-commit` fails on a prompt that runs tests but is missing from the rule's `carry` list
    - `.bkit/core/engine/tools/instructions.test.ts` `local-pre-commit covers test runs made while working, not only before a commit` fails on rule text that limits itself to before a commit

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Copy the reworded rule into the prompts, mirrors and installed rules file
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-tasks.md`: the `**Rules:**` block gains the bullet, written by `pnpm instructions:sync`, not by hand
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-tests.md`: same, written by `pnpm instructions:sync`
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: same, written by `pnpm instructions:sync`
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`: same, written by `pnpm instructions:sync`
  - **UPDATE:** `.bkit/core/prompts/bkit-debug-failure-remediate.md`: same, written by `pnpm instructions:sync`
  - **UPDATE:** `.agents/rules.md`: rewritten by `pnpm bkit:generate`, along with the host mirrors
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `.bkit/core/engine/tools/instructions.test.ts` `has no findings` and `sync has nothing left to rewrite` pass, and `bkit check` reports no mirror drift
  - **TEST FIRST:** n/a — generated copies, checked by the existing corpus tests named in DONE WHEN

<!-- bkit:task 2 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | Searches run | Decision | File | Reason |
| --- | --- | --- | --- | --- |
| Rule text covering test runs made while working | text search for `Local pre-commit` in `.bkit/core/.agents/rules.md` and `.bkit/instructions.md`; read both | EXTEND | `.bkit/core/.agents/rules.md` | reword the existing bullet |
| Store entry, retired wording and `carry` list | read `### local-pre-commit` and the `### local-tests-first` `carry` example in `.bkit/instructions.md` | EXTEND | `.bkit/instructions.md` | existing entry gains text, retired line and `carry` |
| Corpus checks for the rule and its carriers | read `.bkit/core/engine/tools/instructions.test.ts` | EXTEND | `.bkit/core/engine/tools/instructions.test.ts` | existing corpus suite gains two tests |
| Rule bullet in the five prompts | read `**Rules:**` blocks; `pnpm instructions:sync` writes carried bullets | EXTEND | `.bkit/core/prompts/bkit-build-plan-tasks.md` | existing prompt gains the bullet |
