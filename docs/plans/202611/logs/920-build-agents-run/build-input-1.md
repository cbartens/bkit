## Session Prompt — this run's, newer than everything below

#920

## Issue description — oldest

### Narrative

The build and debug prompts tell each agent which check to run at the end of its step (`bkit tests changed --fallback=...`), but nothing about how to run tests while it works, so the agent picks its own command. A narrow pick (named test files) is lock-free, because `vitest.test-lock.ts` `testLockDecision` skips the lock when every argument is an existing file. A wide pick (a folder, a pattern, the whole suite, a related-files mode, or a raw `bkit:gate:*` script) holds the machine-wide tests lock for as long as it runs, and every other worktree's tests and pushes wait behind it.

The one rule that narrows test runs, `Local pre-commit` (`.bkit/core/.agents/rules.md`, Universal Rules › Testing & Debugging), covers commits only and ends "`/bkit-*` steps run their own gates", which reads as an exemption for the workflow agents. The prompts only apply it (`.bkit/instructions.md` § `local-pre-commit`, relation `applies`); none carries the bullet in its `**Rules:**` block.

The fix: reword `Local pre-commit` so it also covers runs made while working, and have every build and debug prompt that runs tests carry the whole bullet. The step's own named command stays its only wide run.

Evidence from the #860 build (#860 — Move deterministic bookkeeping and safe recovery into the engine — https://github.com/cbartens/bkit/issues/860): its 69 subagents ran 126 test commands. About 80 named their files (no lock), about 25 were the required end-of-step `bkit tests changed` runs, and about 12 were wide runs that no prompt or brief asked for:

<!-- prettier-ignore -->
| Agent | Command it chose |
| --- | --- |
| tasks, group 1 | `vitest run .bkit/core/engine/commands .bkit/core/engine/ledgers` |
| verify, group 1 | `npx vitest run` (whole suite) |
| verify, group 2 | `pnpm bkit:gate:static-unit`, which the group gate (`.bkit/core/workflows/bkit-build.md` Step 8) runs again straight afterwards |
| tasks, group 5 | a `…/workflow/runs` pattern, then `pnpm bkit:gate:changed` on top of its required `tests changed` |
| verify, group 5 | `vitest related --run …` twice, and a run including the `.bkit/core/engine/render` folder |
| verify, group 6 | `pnpm exec vitest run` (whole suite) |
| tasks, group 7 | the `.bkit/core/engine/ledgers` folder twice, then `.bkit/core/engine/commands/workflow`; that last run held the lock while another worktree's push waited |

### Success Criteria

- `Local pre-commit` says that before a commit and while working, an agent runs only the tests the change affects, naming each test file, and never a folder, a pattern, the full suite or a `bkit:gate:*` script; a `/bkit-*` step's named command is its only wider run.
- `bkit-build-plan-tasks`, `bkit-build-plan-tests`, `bkit-build-plan-verify`, `bkit-build-plan-gaps-remediate` and `bkit-debug-failure-remediate` each carry the whole bullet in their `**Rules:**` block, and every host's rendered copy matches.
- The retired wording is recorded, so `pnpm instructions:sync` rewrites any copy still holding it.
- The wording names no test runner or stack.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| A step's own named command (`bkit tests changed`, the group gate) is wide | Still runs; the rule names it as the step's only wider run |
| A test file outside the diff imports changed code | The agent names that file; it is a test the change affects |
| The change touches many files | The agent names each test file; a long list of files stays lock-free |
| A consumer uses another test runner (pytest, jest) | The wording still applies: it speaks of test files, not one runner |
| A prompt copy drifts from `rules.md` | The `.bkit/core/engine/tools/instructions.test.ts` corpus checks fail until sync rewrites it |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| every build and debug prompt that runs tests carries `local-pre-commit` | unit | `.bkit/core/engine/tools/instructions.test.ts` |
| `local-pre-commit` covers test runs made while working, not only before a commit | unit | `.bkit/core/engine/tools/instructions.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Narrow test runs while agents work
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Reword `Local pre-commit` to cover runs made while working, and make the build and debug prompts carry it
  - **UPDATE:** `.bkit/core/.agents/rules.md`: reword the `Local pre-commit` bullet per Success Criteria 1
  - **UPDATE:** `.bkit/instructions.md`: in `### local-pre-commit`, the new text, the old text under `retired`, and a `- carry:` line naming the five prompts in Success Criteria 2
  - **READ:** `.bkit/instructions.md`: `## Format` (rule section lines, the `carry` relation)
  - **READ:** `.bkit/authoring.md`: § Which Sections Apply, § Before You Save
  - **DONE WHEN:** the store entry and the `rules.md` bullet hold the same new text, and the five prompts are listed under `carry`
  - **TEST FIRST:**
    - `.bkit/core/engine/tools/instructions.test.ts` `every build and debug prompt that runs tests carries local-pre-commit` fails on a prompt that runs tests but is missing from the rule's `carry` list
    - `.bkit/core/engine/tools/instructions.test.ts` `local-pre-commit covers test runs made while working, not only before a commit` fails on rule text that limits itself to before a commit
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Copy the reworded rule into the prompts, mirrors and installed rules file
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-tasks.md`, `.bkit/core/prompts/bkit-build-plan-tests.md`, `.bkit/core/prompts/bkit-build-plan-verify.md`, `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`, `.bkit/core/prompts/bkit-debug-failure-remediate.md`: the `**Rules:**` block gains the bullet, written by `pnpm instructions:sync`, not by hand
  - **UPDATE:** `.agents/rules.md` and the host mirrors: rewritten by `pnpm bkit:generate`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `.bkit/core/engine/tools/instructions.test.ts` `has no findings` and `sync has nothing left to rewrite` pass, and `bkit check` reports no mirror drift
  - **TEST FIRST:** n/a — generated copies, checked by the existing corpus tests named in DONE WHEN
<!-- bkit:task 2 end -->
<!-- bkit:group 1 end -->

### Open Questions & Assumptions

- Assumed: the rule keeps its name and ID `local-pre-commit`. Renaming it would touch every tag that cites it (`.bkit/instructions.md` § Local Instructions) for no change in behaviour.
- Assumed: verify in group mode keeps running tests, but only by named file, to check each task's `DONE WHEN`. The rule covers this; no step text changes.
- Order per the store's rules: write the `## Rules` entry first, run `pnpm instructions:sync` without `--write` to check, then write.

### Breaking Changes & Naming

None. Consumers get the reworded bullet in their installed `.agents/rules.md` on `bkit upgrade`; nothing they declare changes.

### Out of Scope

- Enforcing the lock on raw runner commands with a host hook: #822 — Route raw test-runner commands through the tests lock per host — https://github.com/cbartens/bkit/issues/822
- Which waiting run gets the lock next: #916 — Tests lock: waiting runs win at random, so one can wait out its limit — https://github.com/cbartens/bkit/issues/916
- Changing what `bkit tests changed` or the group gate runs.

### References

- #744 — Build agents re-run the whole unit suite after every change — https://github.com/cbartens/bkit/issues/744 (made the end-of-step check narrow; this issue covers the runs between those checks)
- `.bkit/core/.agents/rules.md` § Testing & Debugging `Local pre-commit`
- `.bkit/instructions.md` § `local-pre-commit`, § `local-tests-first` (an existing `carry` example)
- `vitest.test-lock.ts` `testLockDecision`
- `.bkit/core/prompts/bkit-build-plan-tasks.md` steps 8 and 10; `bkit-build-plan-gaps-remediate.md` step 9; `bkit-build-plan-verify.md` steps 6 and 7; `bkit-build-plan-tests.md` step 6; `bkit-debug-failure-remediate.md` step 8
- `.bkit/core/workflows/bkit-build.md` Step 8 (group gate)

## Issue comment — posted 2026-11-11T01:25:54.000Z

Rewrote the body from the idea shape into the change shape, and swapped `next:design` for `next:build`. The owner settled the three open questions: widen the shared `Local pre-commit` rule rather than adding a build-only one, keep verify's own test runs but only by named file, and include `bkit-debug-failure-remediate`. That last prompt has the same gap: its step 8 names only the end-of-step `bkit tests changed`.

The fix comes down to one rule reworded in `.bkit/core/.agents/rules.md` and `.bkit/instructions.md` § `local-pre-commit`. The five prompts are then listed under `carry`, so `pnpm instructions:sync` copies the whole bullet into each one. The body now has two tasks in one group, plus two planned unit tests in `.bkit/core/engine/tools/instructions.test.ts`. No code or prompt has changed yet.

## Plan — docs/plans/202611/920-build-agents-run-plan.md — last committed 2026-11-13T22:33:00.000Z

# Build agents' test runs while working Implementation Plan

## Context & Goals

The `Local pre-commit` rule covers only the run before a commit, so build and debug agents pick their own wide test commands while they work and hold the machine-wide tests lock (#920). The rule is reworded to cover runs made while working, and the five build and debug prompts that run tests each carry the whole bullet.

**Related Issues:**

- #920 — Build agents' test runs while working (open)
- #744 — Build agents re-run the whole unit suite after every change
- #822 — Route raw test-runner commands through the tests lock per host (out of scope)
- #916 — Tests lock: waiting runs win at random (out of scope)

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Path | Section used | Coverage | Gap | Action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | n/a | not applicable: no boundary or package changes | none | none |
| technology | `docs/technology.md` | n/a | not applicable: no new library or convention | none | none |
| security | `docs/security.md` | n/a | not applicable: no auth, input or secret change | none | none |
| testing | `docs/testing.md` | `## Tests lock` | covers which runs take the lock (light runs take none) | none | none; the rule text lives in `.agents/rules.md` and `.bkit/instructions.md` |

## Documentation Warnings

```jsonl

```

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | Searches run | Decision | File | Reason |
| --- | --- | --- | --- | --- |
| Rule text covering test runs made while working | text search for `Local pre-commit` in `.bkit/core/.agents/rules.md` and `.bkit/instructions.md`; read both | EXTEND | `.bkit/core/.agents/rules.md` | reword the existing bullet |
| Store entry, retired wording and `carry` list | read `### local-pre-commit` and the `### local-tests-first` `carry` example in `.bkit/instructions.md` | EXTEND | `.bkit/instructions.md` | existing entry gains text, retired line and `carry` |
| Corpus checks for the rule and its carriers | read `.bkit/core/engine/tools/instructions.test.ts` | EXTEND | `.bkit/core/engine/tools/instructions.test.ts` | existing corpus suite gains two tests |
| Rule bullet in the five prompts | read `**Rules:**` blocks; `pnpm instructions:sync` writes carried bullets | EXTEND | `.bkit/core/prompts/bkit-build-plan-tasks.md` | existing prompt gains the bullet |

## Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| every build and debug prompt that runs tests carries `local-pre-commit` | Unit | `.bkit/core/engine/tools/instructions.test.ts` | 1 |
| `local-pre-commit` covers test runs made while working, not only before a commit | Unit | `.bkit/core/engine/tools/instructions.test.ts` | 1 |

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Narrow test runs while agents work

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

<!-- bkit:group 1 end -->
