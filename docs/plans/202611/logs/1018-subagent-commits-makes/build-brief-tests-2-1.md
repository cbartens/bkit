# Brief: group 2 — Workflow calls, docs and mirrors (tests)

Plan: Subagent commits: make the changed-files and gaps-fix checks measure from the last step-done commit Implementation Plan

## Why and what

### Context & Goals

`bkit tests changed` defaults `--base` to `HEAD` (`tests-changed.ts`), and `bkit-build.md` Step 9 sub-step 5 and the holistic Step 10 sub-step 12 run `bkit branches scan-diff --base=HEAD~1 --code`. Both assume a subagent never commits. A subagent that does commit gets an empty changed set (lint and typecheck never run on its files) or a wrong range (a Decision Pause for a gaps fix that exists). Issue #1018 (finding C2 of #1012): both checks answer the same whether or not a subagent committed, because they measure from the commit that holds the previous `step-done` row of the active run, never from `HEAD` or `HEAD~1`.

Decided in the issue and not reopened: refusing a subagent commit outright and the `Commits` bullet in `.bkit/instructions.md` are out of scope; the four prompts that call `bkit tests changed` without `--base` get no edit; the existing run resolver `resolveActiveRun` in `.bkit/core/engine/commands/lib.ts` is used, no second one is added.

**Related Issues:**

- #1018 — Subagent commits make the changed-files and gaps-fix checks measure the wrong range (open)
- #1012 — Project Goals audit: where bkit falls short, and what to change (umbrella)

---

### Narrative

A build subagent finishes its edits and either commits them or leaves them uncommitted. `bkit tests changed` lists the same files, and the gaps-fix check reports the same source change, in both cases.

### Success Criteria

- `bkit tests changed` with no `--base` lists the same files whether the subagent committed or not.
- It never lists files from the previous step's own commit.
- `bkit branches scan-diff --since-step=<step> --code` exits the same whether the fix was committed by the subagent or left for `steps finish` to commit.
- No `--base=HEAD~1` literal is left in `.bkit/core/workflows/bkit-build.md`.
- No `bkit tests changed` call in a prompt needs an edit.

## Where it fits

- Group 1: Base resolver and the two engine checks — done
  - TASK 1: Add `stepBase`, the resolver of the commit a run's last step began after — done
  - TASK 2: Make `bkit tests changed` default its base to the run's last step-done commit — done
  - TASK 3: Add `--since-step` to `bkit branches scan-diff` — done
- Group 2: Workflow calls, docs and mirrors — this group
  - TASK 4: Point both gaps-fix source checks in `bkit-build.md` at `--since-step` — open
  - TASK 5: Update the docs and re-render the mirrors and `dist/` — done

## The work

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Point both gaps-fix source checks in `bkit-build.md` at `--since-step`
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 9 sub-step 5 becomes `"{BKIT}" branches scan-diff --since-step=build-plan-gaps-remediate --file="{STATUS}" --code >/dev/null`; Step 10 sub-step 12 the same with `--since-step=build-plan-gaps-remediate-holistic`; no `--base=HEAD~1` literal is left
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the markdown invariant
  - **READ:** `.bkit/instructions.md`: shared clauses touching these lines (`pnpm instructions:show --file bkit-build.md`)
  - **READ:** `.bkit/authoring.md`: § Which Sections Apply, § Before You Save
  - **UPDATE:** `.bkit/workflows.md`: no edit unless the Step 9 or Step 10 row describes the range; index stays accurate (`.bkit/core/.bkit/workflows.md` is the source)
  - **DEPENDS ON:** 3
  - **DONE WHEN:** `rg -n 'HEAD~1' .bkit/core/workflows/bkit-build.md` finds nothing, both calls carry `--since-step` and `--file="{STATUS}"`, and the `workflow-shape.test.ts` invariant passes along with the workflow fence-syntax audit
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `bkit-build gaps-fix source checks measure from the previous step, never HEAD~1` fails on "--base=HEAD~1" still being in `bkit-build.md`

<!-- bkit:task 4 end -->

### Earlier tasks this group depends on

- TASK 3 (group 1, done): Add `--since-step` to `bkit branches scan-diff` — `.bkit/core/engine/commands/workflow/branches.ts`, `.bkit/core/engine/commands/workflow/branches.test.ts`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `bkit-build.md` holds no `--base=HEAD~1` and both gaps-fix checks use `--since-step` | unit (markdown-invariant) | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |

## Deviations

publish=false
