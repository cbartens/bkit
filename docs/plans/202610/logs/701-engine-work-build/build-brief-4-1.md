# Brief: group 4 — The plan's matrix, the ship diff and the producers they touch become engine checks

Plan: Engine Facts in Build Verify and Ship Implementation Plan

## Why and what

### Context & Goals

**Problem.** `#676` (closed) audited the six workflow files for orchestrator prose the engine already holds. It did not audit the **subagent prompts**, which carry the same class of work: lookup tables, set comparisons, arithmetic and file writes where the engine holds the data. Two agents carry most of it, measured from the prompts (not estimated): `bkit-build-plan-verify` (100 turns, once per group plus once holistic — an 11-row kind→`Fixable` table plus a three-line verdict mapping at `bkit-build-plan-verify.md:67-82`, a task ↔ `DONE` log cross-reference, a task tick, and matrix ↔ runbook coverage), `bkit-ship-deferred-sweep` (200 turns, once per ship — a disabled-test diff scan at `bkit-ship-deferred-sweep.md:69` that decides the ship gate, plus deferral reason tests and a bucket verdict); `bkit-build-plan-current` (50 turns) spends its steps 5-7 on search the engine can do.

**Goal.** `#701`, by the rule `#663` settled: a fact with one right answer is the engine's; judgement is the agent's. The engine computes the test-first verdict and a `fixable` per gap, ticks the plan, matches plan tasks to landed changes, scans the diff for disabled tests, and writes the deferral rows; the verifier and the deferred sweep keep only what needs judgement (whether the codebase satisfies a task, the four diff reads, the `Executable` / `Reword` / `Broken` call, deliverable verification, doc edits).

**Inputs and precedence.** No design doc and no audit report. `#701` is a `change`-shape issue (`.bkit/trackers.md` § Issue shapes), so its `Narrative`, `Success Criteria`, `Edge Cases`, `Derived Test Matrix`, `Tasks`, `Open Questions & Assumptions`, `Breaking Changes & Naming` and `Out of Scope` are the spec, kept word for word. The plan-input's newest section is the session prompt (`#701` alone), which adds nothing. Two places where the issue's own text disagrees are resolved in this plan and named in `Open Questions & Assumptions` (rows 5 and 6): the order of `fixable` values in `Tasks` Task 1's `DONE WHEN`, and the `tick` default between `Open Questions` item 3 and `Tasks` Task 2.

**Review round merged.** Three lenses reviewed this plan as `plan-v1-draft.md`: plan review (tightness, dependency order, design coverage), code review (regression risk) and the scope check (scope, criteria, verification). Their findings are merged here. Six seams they named are settled and named in `Open Questions & Assumptions` (rows 7-11) or in the sections they touch: the `fixable: null` / `verdict: null` seam at the verifier boundary (the engine's `logLine` is a template the verifier substitutes its decided `Fixable` into, and the artifact header `Verdict:` is the post-judgement roll-up, never the report's `null`); the `no-red` "work already landed" exemption kept in the prompt as a verifier override; the holistic verify's group-required tick path; the `matrix` check's semantics, the three in-build producers it would otherwise strand, and the recovery route for a legacy plan; `tasks currency`'s diff range (`{base}...{against}`, `against` = `origin/dev` — three dots is merge-base(`{base}`, `{against}`)..`{against}`, identical to two dots when `{base}` is an ancestor of `{against}`, the normal case now that design and plan worktrees base on `origin/dev`, and it matches `branches scan-diff`, which already diffs `<base>...HEAD`); and the `Changed since red = added lines only` gap (kind `test-changed`, `fixable: null`).

**Related Issues:**

- `#701` — Engine work in build verify and ship: emit the facts, keep the judgement (open — this issue)
- `#663` — Workflow prompt process token optimisation (closed — parent; settled the engine-fact / judgement rule)
- `#676` — Orchestrator work the engine could do as bkit commands (closed — the workflow-prose half of the same audit; this plan is the subagent-prompt half)
- `#685` — How plans are shaped, reviewed and built (closed — the plan-block format this plan reads and writes)
- `#665` — Fewer plan reviewers and rounds; challenge only on large diffs (closed — why the plan-review fan-out stays at two reviewers plus the scope check)
- `#668` — Build in task slices: symbol refs per task, 160k cap per agent (closed — the per-task `CREATE` / `READ` / `UPDATE` / `DELETE` fields `tasks currency` reads)
- `#679` — Engine commands for the build / ship orchestration prose (closed — created `branches scan-diff`, the verb Task 6 extends, and the raw-call fence guard; its "print only the fields the workflow reads next" rule applies to Task 6's new output)
- `#656` — Test-order gaps: `no-red` / `late-red` / `test-changed` and the caps (closed — created the gap kinds Task 1 maps and the 10-tests / 3-files caps every group here holds)
- `#680` — ledgers append: engine writes ledger rows with a minted ts (closed — the append machinery `ledgers triage` reuses)
- `#700` — Session-start nudge: read `.agents/rules.md` on every platform (open — shipped-pending neighbour, no shared surface)

---

### Narrative

`#701` `### Narrative`, verbatim:

A bkit maintainer wants the build and ship subagents to stop re-deriving facts the engine already holds. After this, the verifier and the deferred sweep decide only what needs judgement, and the engine computes the verdicts, ticks the plan, matches plan tasks to landed changes, scans the diff for disabled tests and writes the deferral rows.

### Success Criteria

`#701` `### Success Criteria`, verbatim:

- `bkit tests green` prints `verdict` and a `fixable` per gap; `bkit-build-plan-verify.md` names no kind→`Fixable` mapping and no verdict mapping.
- No subagent edits the plan to tick a task; `bkit tasks tick` does it.
- `bkit tests plan-check` exits 1 on a `Derived Test Matrix` row mapped to no task and on a `DELETE` with no `Supersession Inventory` row.
- `bkit branches scan-diff --disabled-tests` exits 1 on an added `.skip` / `@Disabled` / `t.Skip()` and is the only place the disabled-test list lives.
- `bkit ledgers triage` prints each deferral's bucket and writes the `unjustified` / `TRIAGED` rows; `bkit-ship-deferred-sweep.md` names no reason test.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The deferred sweep's deliverable verification (Process 7) | `#701` declared it out of scope before work started; it is judgement (does the codebase satisfy a deliverable), no Success Criterion or matrix row needs it; `docs/deferrals.jsonl` key `701-sweep-deliverable-verification-stays-in-prompt` records it | stays in `.bkit/core/prompts/bkit-ship-deferred-sweep.md` § Process 7 |
| `plan-current`'s `Executable` / `Reword` / `Broken` classification | `#701` declared it out of scope before work started; the engine cannot decide whether landed changes leave a task executable, and Task 4 keeps the call; `docs/deferrals.jsonl` key `701-plan-current-classification-stays-in-prompt` records it | stays in `.bkit/core/prompts/bkit-build-plan-current.md` § Process 8 |
| The four diff-reading test-order classifications in `bkit-build-plan-verify.md` | `#701` declared them out of scope before work started; they are judgement, and Task 1 keeps them; `docs/deferrals.jsonl` key `701-verify-diff-reads-stay-in-prompt` records it | stays in `.bkit/core/prompts/bkit-build-plan-verify.md` § Process 8 |
| Design-workflow reviewers | `#701` declared them out of scope before work started: no design-run measurements exist, so which prose is mechanical is unmeasured — real future work | new audit of the design prompts; `docs/deferrals.jsonl` key `701-design-workflow-reviewer-audit` |

## Where it fits

- Group 1: `tests green` emits the test-first verdict, a `fixable` per gap and the gap log lines — done
  - TASK 1: `tests green` emits `verdict`, a `fixable` per gap and the gap log lines — done
- Group 2: The plan tick, the group handover and the `tasks` noun come from the engine — done
  - TASK 2: Create the `tasks` noun with `tick`, and wire the verifier, the tick and the holistic pass to it — done
  - TASK 3: `tasks open` — the group's tasks with no `DONE` / `BLOCKED` line — done
- Group 3: `tasks currency` replaces plan-current's path and symbol search — done
  - TASK 4: `tasks currency` — plan-current's path and symbol match — done
- Group 4: The plan's matrix, the ship diff and the producers they touch become engine checks — this group
  - TASK 5: `tests plan-check` refuses an unmapped matrix row and a `DELETE` with no Supersession row — open
  - TASK 6: `branches scan-diff --disabled-tests` — open
- Group 5: The sweep's deferral rules move to the engine — next
  - TASK 7: `ledgers triage` — open
  - TASK 8: `ship-update-docs` `Pending Items` from the engine — open
- Group 6: Producers, docs, indexes and mirrors — later
  - TASK 9: The plan format teaches the producers: the clause and its carriers — open
  - TASK 10: Sync the docs the change touches — open
  - TASK 11: Refresh the capability register, the mirrors and `dist/`, then dogfood — open

## The work

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** `tests plan-check` refuses an unmapped matrix row and a `DELETE` with no Supersession row
  - **UPDATE:** `plan-check` in `.bkit/core/engine/commands/workflow/tests.ts`: add problem kinds `matrix` and `supersession`, and update the verb's `summary`, `output.problems` and help text. **`matrix` semantics:** no `Derived Test Matrix` section → no problem (the refusal is on a row); with the table present, a header with no `Task` column → one problem naming the column, a row whose `Task` cell names no task / an undefined task / two or more tasks → one problem at the row, and a test-bearing task no row names → one problem at its task line (an `n/a`-only task needs no row). `supersession`: a `DELETE` whose file is in no `Supersession Inventory` row
  - **UPDATE:** `.bkit/core/engine/commands/workflow/plan-blocks.ts`: add `derivedTestMatrix` and `supersessionInventory` beside `reuseInventory`, over the same `tableCells` helper
  - **UPDATE:** `.bkit/core/engine/commands/workflow/challenge.ts`: `appendTasks` writes a `Derived Test Matrix` row per finding task it appends, so the bidirectional check holds inside its own written range
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 5's `Fix now` writes a matrix row per test in the task block it adds, and Steps 3 and 7 route a `matrix` / `supersession` problem to `@bkit-build-plan-convert` like a `markers` problem
  - **UPDATE:** `.bkit/core/docs/templates/bkit-plan.md`: § Derived Test Matrix — the `Task` column and its one-sentence rule (the column lands here, not with Task 9, because this task's tests read the shipped template example)
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-scope-check.md`: drop Process 9 and Process 11, and reword Process 17's verdict mapping and the Contract's Scenario-detail clause so neither claims them
  - **READ:** `.bkit/core/engine/commands/workflow/tests.ts`: `checkPlanText`'s `problems` kind union and the report writer
  - **READ:** `.bkit/core/engine/commands/workflow/challenge.ts`: `planProblems`' line-range filter and `appendTasks`' block writer
  - **READ:** `.bkit/core/engine/commands/workflow/challenge.test.ts`: the fixture plan the merge tests use
  - **READ:** `.bkit/core/prompts/bkit-build-plan-verify.md`: the caller that reads a plan-check refusal
  - **READ:** `.bkit/core/workflows/bkit-build.md`: the callers that read `problems` and route on exit 1
  - **DONE WHEN:** `bkit tests plan-check` exits 1 on a plan with a row mapped to no task, on a matrix header with no `Task` column, on a `Task` cell naming an undefined task, on a row naming two tasks, on a test-bearing task no row names, and on a `DELETE` with no `Supersession Inventory` row, naming the line each time, and exits 0 on this plan (which carries the column and maps every test-bearing task) and on a plan with no matrix section at all; `bkit challenge merge` writes a `Derived Test Matrix` row for each appended finding task and appends; Step 5 `Fix now`'s task block carries its row; the template's matrix header holds `Task`; `plan-scope-check` names neither check; `pnpm vitest run .bkit/core/engine/commands/workflow/tests.test.ts .bkit/core/engine/commands/workflow/challenge.test.ts .bkit/core/engine/commands/workflow/plan-blocks.test.ts` is green
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses an unmapped matrix row` fails on exit 0
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses a delete with no supersession row` fails on exit 0
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses a matrix row mapped to two tasks` fails while the plan is accepted, or while the problem names only one of the two tasks
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses a task no matrix row maps to` fails while a plan with an unmapped test-bearing task is accepted
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check accepts a matrix that maps every test-bearing task` fails while a conforming plan is refused
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses a matrix header with no Task column, naming the column to add` fails while the plan is accepted, or while the problem names a row instead of the header
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses a Task cell naming an undefined task` fails while a cell naming a task the plan does not define is accepted
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check accepts a task whose only TEST FIRST is n/a` fails while an `n/a`-only task with no row is refused
    - `.bkit/core/engine/commands/workflow/challenge.test.ts` `challenge merge writes a matrix row for each appended finding task` fails while the merge writes tasks with no row, or refuses its own append
    - `.bkit/core/engine/commands/workflow/plan-blocks.test.ts` `derivedTestMatrix returns a null column index when the header has no Task column` fails while the reader reports a column index for a header without one

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** `branches scan-diff --disabled-tests`
  - **UPDATE:** `scan-diff` in `.bkit/core/engine/commands/workflow/branches.ts`: gain `--disabled-tests` — added lines only from `{base}...HEAD`, `docs/plans/**` excluded, matching `.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled` and a removed assertion line inside a test file; exit 1 on any hit, printing `file:line` and the test name; the marker set is the one `.bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs` carries, and the `--help` states that this flag inverts `--paths` / `--marker` / `--code`'s polarity and composes with `--expect-none`, so the two are never passed together
  - **UPDATE:** `.bkit/core/prompts/bkit-ship-deferred-sweep.md`: Process 8 reads the verb instead of scanning the diff
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: Step 5 passes the diff base (`origin/dev`) the scan runs against, so the sweep never guesses it
  - **READ:** `.bkit/core/engine/commands/workflow/branches.ts`: `scanDiffVerb`, its `--marker` added-line loop and the mutually exclusive mode guard
  - **READ:** `.bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs`: the `TEST_SUFFIX` / `TEST_GLOBAL` marker set the new flag aligns with
  - **DONE WHEN:** `bkit branches scan-diff --disabled-tests --base=origin/dev` exits 1 on a diff that adds a `.skip`, printing `file:line` and the test name, exits 0 on a `.skip` predating the base, and exits 0 with `disabled: []` on a diff that adds none; the sweep prompt names no diff scan of its own
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff finds an added skip` fails on exit 0
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff ignores a skip predating the base` fails on exit 1
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff reports a disabled test with its line` fails while the reported line number or the test name is missing
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff exits 0 on a diff that adds no disabled test` fails while it exits 1 with an empty `disabled`

<!-- bkit:task 6 end -->

### Architecture entries

#### [MODIFY] `.bkit/core/engine/commands/workflow/challenge.ts`

- **Existence Check:** file exists.
- `appendTasks` (and `findingGroups`, its block writer) writes one `Derived Test Matrix` row per finding task it appends — `{test description, Type, Target file, Task}`, from the finding's own `TEST FIRST` — so the appended range holds a conforming plan and `planProblems`' line-range filter still passes. `planProblems` keeps its role as the merge gate unchanged; it needs no new arm.

Reuse Inventory rows left out: 5; Architecture entries left out: 8 — read them in docs/plans/202610/701-engine-work-build-plan.md § Reuse Inventory and § Architecture & Component Changes.
