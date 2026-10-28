# Brief: group 3 — `tasks currency` replaces plan-current's path and symbol search

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
- Group 3: `tasks currency` replaces plan-current's path and symbol search — this group
  - TASK 4: `tasks currency` — plan-current's path and symbol match — open
- Group 4: The plan's matrix, the ship diff and the producers they touch become engine checks — next
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

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** `tasks currency` — plan-current's path and symbol match
  - **UPDATE:** `currency` in `.bkit/core/engine/commands/workflow/tasks.ts`: per task print the matched paths and needles and the diff hunks for its `CREATE` / `READ` / `UPDATE` / `DELETE` fields over `{base}...{against}` (`--against` defaulting to `origin/dev`), not `{base}...HEAD`
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-current.md`: drop Process 5-7's search and call `bkit tasks currency --base={BASE_SHA} --against=origin/dev` (its `{BASE_SHA}...origin/dev` three-dot range); keep the `Executable` / `Reword` / `Broken` call
  - **DEPENDS ON:** 2
  - **READ:** `.bkit/core/engine/commands/workflow/branches.ts`: the `git diff` base guard and the `--name-only` forms the verb copies
  - **DONE WHEN:** `bkit tasks currency --plan= --base= --against=` prints each task whose paths or needles moved between `{base}` and `{against}` (the `{base}...{against}` three-dot range) with its matched paths and needles and the diff hunks, and no hunk for a path outside the matched set; a change the branch itself landed since `{base}` does not match, and a change dev landed after `{base}` does; the plan-current prompt names no `git diff` search of its own and passes both flags; an unmatched plan prints no hunks and exits 0
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `currency matches a task on a moved symbol` fails while the task is not listed
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `currency emits no hunk outside the matched set` fails while an unmatched path's diff appears
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `currency refuses a plan with no task blocks` fails while it prints an empty result and exits 0
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `currency exits 0 with no hunks when no task matches` fails while an unmatched plan exits non-zero or prints a hunk
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `currency judges base...against (origin/dev), not base...HEAD` fails while a change the branch itself landed since the base is reported as a match

<!-- bkit:task 4 end -->

### Earlier tasks this group depends on

- TASK 2 (group 2, done): Create the `tasks` noun with `tick`, and wire the verifier, the tick and the holistic pass to it — `.bkit/core/engine/commands/workflow/tasks.ts`, `.bkit/core/engine/commands/registry.ts`, `.bkit/core/prompts/bkit-build-plan-verify.md`, `.bkit/core/workflows/bkit-build.md`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| The `tasks` noun (`tick`, `open`, `currency`) | `.bkit/core/engine/commands/workflow/tasks.ts` | `grep -rln "parsePlanBlocks" .bkit/core/engine` (`tests.ts`, `challenge.ts`, `run-facts.ts`, `summary.ts`); `grep -rn -e "doneTasks" -e "loggedDone" -e "isDone" .bkit/core/engine/commands/workflow/context.ts .bkit/core/engine/commands/workflow/tests.ts`; read `context.ts`'s `brief` (`loggedDone`, `isDone`, its `open` filter) and `doneTasks`; `ls .bkit/core/engine/commands/workflow/`; read `registry.ts` and `conventions.test.ts` | `context.ts` (its `brief` already computes the group's tick-plus-log done set and the same `filter(t => !isDone(t))` open set, and its `doneTasks` reader is an exported shared export); `tests.ts` (owns `plan-check`, the plan's reader consumer) | NEW | (b) `CommandSpec` is one noun per source and `conventions.test.ts` asserts noun uniqueness and one exported command per file, so folding `tick` into `tests` would make `bkit tests tick` a test verb, and folding `open` into `context` would make one noun both the plan-block verb a workflow calls for a machine verdict and the artifact writer whose callers read a clamped brief — that contract breaks. The capability itself is not duplicated: `open` imports the same exported `doneTasks` reader `context.ts` uses rather than re-parsing the log lines |

### Architecture entries

#### [new] `.bkit/core/engine/commands/workflow/tasks.ts`

- **Reuse Check:** `Reuse Inventory` row "The `tasks` noun (`tick`, `open`, `currency`)" — reason (b).
- `noun: "tasks"`, `summary`, verbs `tick` / `open` / `currency`, each with `flags`, `output` and `exitCodes` per `lib.ts`'s `VerbSpec`; imports `parsePlanBlocks` (and `derivedTestMatrix` only if a verb needs it) rather than re-parsing the block format, and imports `doneTasks` from `./tests.js` rather than re-parsing an execute log. Task 2 lands the noun and `tick`; Tasks 3 and 4 `UPDATE` this file with `open` and `currency`, so no verb is declared without a handler.
- `tick --plan= --group= (--tasks= | --green=)`: `--group` is required — there is no cross-group call, and a call naming no `--group` exits 2. Candidates are `--group`'s tasks. One of `--tasks=` / `--green=` is required; with neither the verb exits 2. `--tasks` (repeatable, positive integers) ticks exactly those numbers, and a number outside the group exits 2, naming the task and its group. `--green` (a `tests green` audit report) drops every task the report gaps — it matches the report's `- Task {N} \`{kind}\` — {detail}`gap lines and its`gaps: [{task, kind, …}]`payload, the shape Task 1 writes — so`--green`alone ticks the group's gap-free tasks and both together intersect. Ticks each remaining task's`- [ ] **TASK {N}:**`line to`- [x]`, addressed by `parsePlanBlocks`'s task `line`, leaving every other line byte-identical; prints each ticked number. The verb's `--help`states the two required flags. Exit 0 ticked (including none — idempotent); exit 1 a plan with no task blocks, naming the`plan-check`reason; exit 2 no`--group`, neither selector, a `--tasks`value that is not a positive integer or names a task the plan does not define, a task named outside the given`--group`(naming the task and its group), or a`--plan` that is no file.
- `open --plan= --group= --log=`: prints the group's tasks holding neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in `--log` (the log's own line forms, read through the shared `doneTasks` reader), and `handover: true` when at least one is open, else `false`. Exit 0 (including an empty list); exit 1 a plan with no task blocks, naming the `plan-check` reason; exit 2 a missing `--plan` / `--log` file.
- `currency --plan= [--base=] [--against=]`: per task, the paths and needles its `CREATE` / `READ` / `UPDATE` / `DELETE` fields name, matched against `git diff --name-only {base}...{against}` (three dots — merge-base(`{base}`, `{against}`)..`{against}`, matching `branches scan-diff`'s `{base}...HEAD`; default `origin/dev`) and `git diff {base}...{against} -S{needle} --name-only`; for matched tasks only, print the matched paths, the needles that matched and `git diff {base}...{against} -- {paths}`; no hunk outside the matched set. `--against` exists because the search this verb replaces judges landed changes on `origin/dev`, while on the build worktree `HEAD` is the feature branch. Exit 0 (including no match); exit 1 a plan with no task blocks, naming the `plan-check` reason; exit 2 a `--plan` that is no file; the existing diff-failure code when `--base` or `--against` does not resolve.

#### [MODIFY] `.bkit/core/prompts/bkit-build-plan-current.md`

- **Existence Check:** file exists.
- Process 5-7: drop the changed-path list, the `-S{needle}` search and the per-path diff read; Process 5 keeps "record what each task depends on" as the input to `bkit tasks currency --base={BASE_SHA} --against=origin/dev`, and Process 7 becomes "read the hunks `currency` printed for the matched tasks". Process 8's `Executable` / `Reword` / `Broken` call is unchanged.
