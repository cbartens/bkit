# Brief: group 2 — The plan tick, the group handover and the `tasks` noun come from the engine

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
- Group 2: The plan tick, the group handover and the `tasks` noun come from the engine — this group
  - TASK 2: Create the `tasks` noun with `tick`, and wire the verifier, the tick and the holistic pass to it — open
  - TASK 3: `tasks open` — the group's tasks with no `DONE` / `BLOCKED` line — open
- Group 3: `tasks currency` replaces plan-current's path and symbol search — next
  - TASK 4: `tasks currency` — plan-current's path and symbol match — open
- Group 4: The plan's matrix, the ship diff and the producers they touch become engine checks — later
  - TASK 5: `tests plan-check` refuses an unmapped matrix row and a `DELETE` with no Supersession row — open
  - TASK 6: `branches scan-diff --disabled-tests` — open
- Group 5: The sweep's deferral rules move to the engine — later
  - TASK 7: `ledgers triage` — open
  - TASK 8: `ship-update-docs` `Pending Items` from the engine — open
- Group 6: Producers, docs, indexes and mirrors — later
  - TASK 9: The plan format teaches the producers: the clause and its carriers — open
  - TASK 10: Sync the docs the change touches — open
  - TASK 11: Refresh the capability register, the mirrors and `dist/`, then dogfood — open

## The work

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Create the `tasks` noun with `tick`, and wire the verifier, the tick and the holistic pass to it
  - **CREATE:** `.bkit/core/engine/commands/workflow/tasks.ts`: the `tasks` command over a plan's task blocks — the noun and `tick --plan= --group= (--tasks= | --green=)`; Tasks 3 and 4 `UPDATE` this same file with `open` and `currency`, so no verb is declared without a handler. `--green` matches Task 1's report gap lines
  - **UPDATE:** `COMMANDS` in `.bkit/core/engine/commands/registry.ts`: register `tasksCommand`
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: the verifier no longer edits the plan; its header carries the satisfied task numbers (`Tasks: 1, 2`, or `Tasks: none`) and the mandate drops the plan-write clause
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 7 sub-step 4's `Update:` no longer names the plan, the hold reads the satisfied task numbers as the field `Tasks`, and a new sub-step runs `bkit tasks tick --plan={PLAN} --group={GROUP} --tasks={VERIFIED_TASKS} --green={GREEN_REPORT}` before the step finishes; Step 9 runs the same verb once per group after the holistic verify, each call naming its group with that group's satisfied numbers, and its subagent `Update:` line is dropped
  - **DEPENDS ON:** 1
  - **READ:** `.bkit/core/engine/commands/workflow/plan-blocks.ts`: `parsePlanBlocks` and the task block's `line` / `end` fields the tick address
  - **READ:** `.bkit/core/engine/commands/workflow/tests.ts`: the verb / flag / exit-code conventions `bkit tests` follows, and the `writeAuditReport` gap lines `--green` matches
  - **READ:** `.bkit/core/engine/commands/registry.ts`: what registering a command costs
  - **READ:** `.bkit/core/engine/commands/conventions.test.ts`: the rules a new command source must satisfy
  - **DONE WHEN:** `bkit tasks --help` lists `tick` and states the two required flags (`--group`, and one of `--tasks` / `--green`); `bkit tasks tick --plan= --group= --tasks=` ticks exactly the named tasks and prints their numbers, leaving every other plan line byte-identical; `bkit tasks tick --plan= --tasks=` with no `--group`, and `bkit tasks tick --plan= --group=` with neither `--tasks` nor `--green`, each exits 2 and writes no line; re-ticking a ticked task changes nothing and exits 0; `bkit-build-plan-verify.md` names no plan tick edit and `bkit-build.md` Steps 7 and 9 call the verb; `pnpm vitest run .bkit/core/engine/commands/conventions.test.ts .bkit/core/engine/audits/workflows/workflow-shape.test.ts` is green
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick marks only the named tasks` fails while an unnamed group task is ticked
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick refuses a task in another group` fails while it exits 0
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick refuses a plan with no task blocks` fails while it ticks nothing and exits 0 instead of naming the plan-check reason
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick narrows the group's gap-free tasks by --tasks` fails while a task the `--green` report gaps is ticked
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick is idempotent on an already-ticked task` fails while a second tick rewrites the line or exits non-zero
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick refuses a --tasks value that is not a task number` fails while a non-numeric value exits 0 or writes a line
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick refuses a --plan that is no file` fails while a missing path exits 0
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick leaves every other plan line byte-identical` fails while an untouched line moves
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick refuses a call with no --group or with neither selector` fails while a call naming no `--group`, or naming neither `--tasks` nor `--green`, exits 0 and writes a line
    - `.bkit/core/engine/commands/conventions.test.ts` `each export a command, and every exported command is in COMMANDS (reachable)` fails while `tasks.ts` exports `tasksCommand` and `COMMANDS` does not list it

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** `tasks open` — the group's tasks with no `DONE` / `BLOCKED` line
  - **UPDATE:** `open` in `.bkit/core/engine/commands/workflow/tasks.ts`: print the group's tasks with neither line and `handover: true` when any exist; read the log's lines through the shared `doneTasks` reader `context.ts` already imports, never a second parser
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 6 sub-step 5 reads the verb instead of the prose set difference
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: Process 6-7 drop the `DONE` log cross-reference
  - **DEPENDS ON:** 2
  - **READ:** `.bkit/core/engine/commands/workflow/context.ts`: `loggedDone` / `isDone` and the `brief` open set the verb must not duplicate
  - **READ:** `.bkit/core/engine/commands/workflow/tests.ts`: the exported `doneTasks` reader `open` reuses
  - **DONE WHEN:** `bkit tasks open --plan= --group= --log=` prints the tasks with neither line and `handover: true` only when one is open; the build workflow's handover set difference is gone and Step 6 routes on `handover`; `pnpm vitest run .bkit/core/engine/audits/workflows/workflow-shape.test.ts` is green
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `open lists tasks with no done line` fails while a task with a `BLOCKED` line is listed
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `open sets handover only when a task is open` fails on `handover: true` with none
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `open refuses a plan with no task blocks` fails while it prints an empty list and exits 0

<!-- bkit:task 3 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): `tests green` emits `verdict`, a `fixable` per gap and the gap log lines — `.bkit/core/engine/commands/workflow/tests.ts`, `.bkit/core/prompts/bkit-build-plan-verify.md`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| The `tasks` noun (`tick`, `open`, `currency`) | `.bkit/core/engine/commands/workflow/tasks.ts` | `grep -rln "parsePlanBlocks" .bkit/core/engine` (`tests.ts`, `challenge.ts`, `run-facts.ts`, `summary.ts`); `grep -rn -e "doneTasks" -e "loggedDone" -e "isDone" .bkit/core/engine/commands/workflow/context.ts .bkit/core/engine/commands/workflow/tests.ts`; read `context.ts`'s `brief` (`loggedDone`, `isDone`, its `open` filter) and `doneTasks`; `ls .bkit/core/engine/commands/workflow/`; read `registry.ts` and `conventions.test.ts` | `context.ts` (its `brief` already computes the group's tick-plus-log done set and the same `filter(t => !isDone(t))` open set, and its `doneTasks` reader is an exported shared export); `tests.ts` (owns `plan-check`, the plan's reader consumer) | NEW | (b) `CommandSpec` is one noun per source and `conventions.test.ts` asserts noun uniqueness and one exported command per file, so folding `tick` into `tests` would make `bkit tests tick` a test verb, and folding `open` into `context` would make one noun both the plan-block verb a workflow calls for a machine verdict and the artifact writer whose callers read a clamped brief — that contract breaks. The capability itself is not duplicated: `open` imports the same exported `doneTasks` reader `context.ts` uses rather than re-parsing the log lines |

Reuse Inventory rows left out: 0; Architecture entries left out: 4 — read them in docs/plans/202610/701-engine-work-build-plan.md § Reuse Inventory and § Architecture & Component Changes.
