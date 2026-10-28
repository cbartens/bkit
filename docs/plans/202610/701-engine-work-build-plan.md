<!-- bkit:anchor
baseSha: 5c94780ac17069866165f160f118100ffb8b9f32
baseRef: origin/dev
bkitVersion: 6.0.0
bkitLatest: 6.0.0
-->

Verdict: PASS

<!-- verdict:end -->

# Engine Facts in Build Verify and Ship Implementation Plan

> [!CAUTION]
> **Purpose:** Implementation plan — pre-flight, gates, runbook, verification, rollback.

## Context & Goals

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

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Testable feature contract — implementation, tests, verification derive from what you confirm here. Wrong here → wrong downstream.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.

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

### Process Sketch

- **WHEN** the build's verify step runs `bkit tests green --group={N}` **→ THEN** the report and stdout carry a `verdict` and each gap carries `fixable` (`true` / `false` / `null`) and its ready-to-append log line.
- **WHEN** a gap needs a diff read (`test-changed`, `red-mismatch`, `delete-still-referenced`, a row `Changed since red = added lines only`) **→ THEN** that gap prints `fixable: null` and the report's `verdict` is `null`; the verifier decides each one from the diff it reads, logs the line with its decided `Fixable: true|false` in place of `null`, and its artifact header `Verdict:` is the post-judgement roll-up (`PASS` / `CONCERNS` / `FAIL`), never `null`.
- **WHEN** the verifier judges a task's `DONE WHEN` satisfied **→ THEN** its header carries the satisfied task numbers and the workflow ticks them with `bkit tasks tick --group=` — at Step 7 for that group, and at the holistic Step 9 once per group; no agent edits the plan.
- **WHEN** a build group's execute log holds neither a `DONE` nor a `BLOCKED` line for some of the group's tasks **→ THEN** `bkit tasks open` lists exactly those tasks and prints `handover: true`.
- **WHEN** the plan-currency step runs `bkit tasks currency --base={BASE_SHA}` **→ THEN** each task whose paths or needles moved between `{BASE_SHA}` and `origin/dev` (the `{BASE_SHA}...origin/dev` three-dot range) is printed with its matched paths and diff hunks, and no hunk outside that set appears.
- **WHEN** the ship step runs `bkit branches scan-diff --disabled-tests --base=origin/dev` **→ THEN** it exits 1 on an added `.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled` or deleted assertion, printing `file:line` and the test name; a skip predating the base is ignored.
- **WHEN** the ship step runs `bkit ledgers triage --fid={FID} --plan={PLAN}` **→ THEN** each deferral row prints its bucket (`Exempt` / `Lazy`) and, when the reason does not hold, a same-`key` `unjustified` / `TRIAGED` row is appended with a minted `ts` — a `low-severity` `LOW` row stays `Exempt` and writes nothing.

### Concrete Example

**Setup:** A bkit maintainer resumes `/bkit-build` on a plan whose group 1 has one task the executor finished and one it left untouched; the branch is a feature branch off `origin/dev`, and the plan's `Derived Test Matrix` carries a `Task` column.

**Steps:**

1. The build runs Step 6 for group 1 → the executor writes `DONE — TASK 1` and returns `HANDOVER` because its turn cap was near.
2. Step 6's route calls `bkit tasks open --plan={PLAN} --group=1 --log={EXECUTE_LOG}` → it prints task 2 (neither line) and `handover: true`, so the build re-runs Step 6 for the handover with a brief that leaves out task 1.
3. Step 7 calls `bkit tests green --group=1` → the report prints `verdict: null`, and task 2's gap prints `fixable: null` with its log line; the verifier reads that gap's diff itself, decides the gap, logs the line with its decided `Fixable: false`, judges task 1's `DONE WHEN` satisfied in the codebase, and returns the satisfied number with its header `Verdict:` = `FAIL` (the roll-up over its decided `false`).
4. Step 7 calls `bkit tasks tick --plan={PLAN} --group=1 --tasks=1` → the plan's task 1 line becomes ticked and its number is printed; the verifier never writes the plan.
5. At `/bkit-ship`, Step 5 runs `bkit branches scan-diff --disabled-tests --base=origin/dev` → exit 0 with `disabled: []`, so the sweep's report names no disabled test; `bkit ledgers triage --fid=... --plan=...` prints `Exempt` for a `low-severity` row and writes nothing.

**Outcome:** the plan is ticked by a command, the verdict and every `fixable` come from the engine, the disabled-test list exists in exactly one place, and the deferral rows are written by the engine — every remaining decision is the agent's.

### Edge Cases

`#701` `### Edge Cases`, verbatim, plus plan-added validation / error / boundary cases:

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| a gap kind needs a diff read (`test-changed`) | `tests green` prints `fixable: null` and `verdict: null`; the verifier classifies it |
| a plan has no task blocks | `tasks tick` / `open` / `currency` refuse, naming the plan-check reason |
| a task number named to `tick` sits in another group | `tick --group=` exits 2 and names the task and its group; a call with no `--group` exits 2 |
| a `Derived Test Matrix` row maps to two tasks | `plan-check` exits 1, naming the row and both tasks |
| a `DELETE` has no `Supersession Inventory` row | `plan-check` exits 1, naming the missing row |
| the diff adds a `.skip` inside a planned test | `scan-diff --disabled-tests` exits 1 with `file:line` and the test name |
| a `.skip` predates `--base` | `scan-diff` ignores it |
| a deferral's `reason` is `low-severity` with `severity: LOW` | `ledgers triage` keeps it `Exempt` and writes no row |
| a deferral's `reason` does not hold at ship time | `ledgers triage` marks it `Lazy` and writes an `unjustified` / `TRIAGED` row with a minted `ts` |
| `green` finds no gap at all (plan-added) | it prints `verdict: PASS` with `gaps: []`, exit 0; the workflow ticks the group's tasks with `bkit tasks tick --plan= --group= --green={GREEN_REPORT}` and logs no gap |
| a `Derived Test Matrix` carries no `Task` column (plan-added) | `plan-check` exits 1 with one `matrix` problem naming the column to add, never one problem per row |
| a `Derived Test Matrix` row names a task the plan does not define (plan-added) | `plan-check` exits 1, naming the row and the unknown number |
| a task whose only `TEST FIRST` entry is `n/a — {reason}` (plan-added) | no matrix row is required for it; `plan-check` accepts the plan |
| `tick` names a task already ticked (plan-added) | nothing changes, the number is printed, exit 0 — ticking is idempotent |
| `--tasks` carries a value that is not a task number (plan-added) | exit 2, the bad value named, no line written |
| `--plan` names no file (plan-added) | each `tasks` verb exits 2, naming the path |
| `ledgers triage` finds no deferral row for the FID (plan-added) | it prints an empty bucket list, writes no row, exit 0 |
| `scan-diff --disabled-tests` on a diff that adds no disabled test (plan-added) | exit 0 with `disabled: []` — never a silent non-run |
| `currency` matches no task (plan-added) | it prints no hunks, exit 0; the plan-currency agent reads that as "no affected task" |
| a plan carries no `Derived Test Matrix` section (plan-added) | `matrix` is a no-op: the plan is not refused for the absence, because a refusal on a row presupposes the table and issue-form plans carry none |
| a build appends a test-bearing task to a matrix-bearing plan — `challenge merge`, Step 5 `Fix now` (plan-added) | the producer writes the task's `Derived Test Matrix` row in the same append, so the bidirectional `matrix` check holds and the append lands |
| a plan resumed from before this change carries a matrix with no `Task` column (plan-added) | `plan-check` exits 1 with one `matrix` problem naming the column; build Steps 3 and 7 route it to `@bkit-build-plan-convert`, like a `markers` problem |
| a red's test gained added lines only (plan-added) | `green` emits one `test-changed` gap with `fixable: null`, the row's `changed` = `added lines only`, and exits 1; the verifier clears it only when the added lines sit outside every planned test |
| a report gap prints `fixable: null` / the report `verdict` is `null` (plan-added) | the verifier logs the line with its decided `Fixable: true\|false` and its artifact header `Verdict:` carries the roll-up (`PASS` / `CONCERNS` / `FAIL`), never `null` |
| `no-red` on a task the plan-currency report classifies `Broken` with work already landed, and the execute log records `DONE — TASK {N}: already landed` (plan-added) | the verifier overrides the engine's `no-red` `fixable: false` and records no gap — the build does not regress to a Decision Pause |
| the holistic verify judges a task in an earlier group satisfied (plan-added) | the workflow runs one `bkit tasks tick --plan= --group={N} --tasks={NUMBERS}` per group, each naming its group and that group's numbers, so the ship summary sees no unticked task |
| dev moves an affected task's paths after `{BASE_SHA}` (plan-added) | `currency --base={BASE_SHA} --against=origin/dev` matches it; a change the branch itself landed since the base does not match |

### Derived Test Matrix

`Type` = a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay, Smoke. Rows 1-18 are `#701` `### Derived Test Matrix` verbatim (their `unit` label is the issue's own word; the tier `docs/testing.md` records for these files is `Unit` — `.bkit/core/engine/commands/**/*.test.ts` is the unit lane, `branches.test.ts` / `ledgers.test.ts` run real temp git repos as that tier's boundary form). Rows 19+ are plan-added, all `Unit`: rows 19-46 from an `Edge Cases` row or a seam the review round named (the `verdict: null` roll-up, the added-lines-only gap, the `matrix` semantics and the producers it touches, `currency`'s range, the group-required tick, the `triage` edge cases), rows 47-54 one per `TEST FIRST` test of the challenge round 1 findings tasks 12-18, rows 55-60 one per `TEST FIRST` test of the challenge round 2 findings tasks 20-23. `Task` maps each row to exactly one runbook task. `challenge.test.ts` / `plan-blocks.test.ts` are the two files the `matrix` work and the plan-block readers add to the lane.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `green` prints a verdict and a `fixable` per gap | unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| `green` verdict is `FAIL` when a gap is unfixable | unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| `green` leaves a diff-reading kind `fixable: null` | unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| `tick` marks only the named tasks | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 2 |
| `tick` refuses a task in another group | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 2 |
| a new command source is registered | unit | `.bkit/core/engine/commands/conventions.test.ts` | 2 |
| `open` lists tasks with no done line | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 3 |
| `open` sets `handover` only when a task is open | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 3 |
| `currency` matches a task on a moved symbol | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 4 |
| `currency` emits no hunk outside the matched set | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 4 |
| `plan-check` refuses an unmapped matrix row | unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 5 |
| `plan-check` refuses a delete with no supersession row | unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 5 |
| `scan-diff` finds an added skip | unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 6 |
| `scan-diff` ignores a skip predating the base | unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 6 |
| `scan-diff` reports a disabled test with its line | unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 6 |
| `ledgers triage` keeps a low-severity deferral exempt | unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 7 |
| `ledgers triage` marks an unjustified deferral lazy | unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 7 |
| `ledgers triage` writes an unjustified row with a minted ts | unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 7 |
| `green` with no gaps prints `verdict: PASS` and an empty `gaps` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| `tick` refuses a plan with no task blocks, naming the plan-check reason | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 2 |
| `tick` narrows the group's gap-free tasks by `--tasks` | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 2 |
| `open` refuses a plan with no task blocks, naming the plan-check reason | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 3 |
| `currency` refuses a plan with no task blocks, naming the plan-check reason | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 4 |
| `plan-check` refuses a matrix row mapped to two tasks, naming the row and both | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 5 |
| `plan-check` refuses a task no matrix row maps to | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 5 |
| `plan-check` accepts a matrix that maps every test-bearing task | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 5 |
| `scan-diff` exits 0 on a diff that adds no disabled test | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 6 |
| `ledgers triage` ignores another feature's deferral rows | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 7 |
| `green` prints `verdict: null` when a gap needs a diff read | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| `green` emits a `test-changed` gap for a red whose test gained added lines only | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 1 |
| `tick` is idempotent on an already-ticked task | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 2 |
| `tick` refuses a `--tasks` value that is not a task number | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 2 |
| `tick` refuses a `--plan` that is no file | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 2 |
| `tick` leaves every other plan line byte-identical | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 2 |
| `tick` refuses a call with no `--group` or with neither selector | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 2 |
| `currency` exits 0 with no hunks when no task matches | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 4 |
| `currency` judges `base...against` (`origin/dev`), not `base...HEAD` | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 4 |
| `plan-check` refuses a matrix header with no `Task` column, naming the column to add | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 5 |
| `plan-check` refuses a `Task` cell naming an undefined task | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 5 |
| `plan-check` accepts a task whose only `TEST FIRST` is `n/a` | Unit | `.bkit/core/engine/commands/workflow/tests.test.ts` | 5 |
| `challenge merge` writes a matrix row for each appended finding task | Unit | `.bkit/core/engine/commands/workflow/challenge.test.ts` | 5 |
| `derivedTestMatrix` returns a null column index when the header has no `Task` column | Unit | `.bkit/core/engine/commands/workflow/plan-blocks.test.ts` | 5 |
| `triage` writes nothing when the FID has no deferral row | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 7 |
| `triage` marks a `scope-declared` row whose only declaration is itself `Lazy` | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 7 |
| `outOfScope` returns the plan's `Out of Scope` rows | Unit | `.bkit/core/engine/commands/workflow/plan-blocks.test.ts` | 7 |
| the `plan-blocks.ts` readers stop at the next heading of the same or a higher level | Unit | `.bkit/core/engine/commands/workflow/plan-blocks.test.ts` | 7 |
| triage keeps an own-cycle deferral exempt | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 12 |
| scan-diff ignores a removed comment in a test file | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 13 |
| scan-diff ignores an assertion moved within the file | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 13 |
| scan-diff finds an added pytest mark skip | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 14 |
| tick treats the header's none as nothing to tick | Unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` | 15 |
| triage writes no row for a closed deferral | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 16 |
| triage reports an adjudicated unjustified row outside exempt | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 17 |
| triage refuses a plan with no task blocks | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 18 |
| scan-diff ignores a quoted skip in a documentation file | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 20 |
| scan-diff ignores a marker literal in a non-test source file | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 20 |
| scan-diff ignores an assertion whose expectation changed | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 21 |
| scan-diff ignores an assertion replaced by another in the same test | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 21 |
| scan-diff reports a deleted test file | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 22 |
| scan-diff reports an assertion re-added only outside the test file | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 23 |

### 👤 ✅ Human Confirmation

- [x] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Review proposed names and breaking changes below.

**Breaking changes:** `#701` `### Breaking Changes & Naming`, verbatim: _New command noun `tasks`; no existing command changes name. `tests green` output gains `verdict`, `fixable` and `logLine` keys — additive, existing keys unchanged. `branches scan-diff` gains `--disabled-tests`; `ledgers` gains `triage` — additive. No agent, step or prompt is removed. The prompts lose steps but keep their names, so `## Model Overrides` rows and the `§ Models` table are unaffected._

One addition the issue does not name, because its own Success Criterion 3 cannot be met without it (see `Open Questions` row 4):

- **Plan format:** `bkit tests plan-check` gains two refusing problem kinds, and a `Derived Test Matrix` whose header holds no `Task` column is refused (one `matrix` problem per plan, naming the column to add) — the machine-readable row↔task mapping the criterion reads. Every plan written before this change therefore needs one mechanical column added to its matrix table before it can be built; `docs/templates/bkit-plan.md` and the clause the plan-writing prompts carry gain the column in the same change, so new plans are born compliant.

Additions the review round named, none of which the issue's list holds:

- **The verifier's artifact header.** `Verdict:` in `build-plan-verify-*.md` stays one of `PASS` / `CONCERNS` / `FAIL` (`steps finish` refuses any other word), so a report `verdict: null` never reaches it: the header is the verifier's post-judgement roll-up over the gaps it decided. A gap line's `Fixable:` is likewise the verifier's decided `true` / `false`, substituted into the engine's `logLine` where the engine printed `null` (see `Open Questions` row 8).
- **The `no-red` "work already landed" exemption is kept.** The engine emits `no-red` → `fixable: false` unconditionally; the prompt keeps its override (plan-currency `Broken` + the execute log's `DONE — TASK {N}: already landed` → no gap), so a resumed build whose work already landed does not regress to a Decision Pause (see `Open Questions` row 7).
- **`bkit tasks tick` requires `--group` and one of `--tasks=` / `--green=`.** A call with no `--group` exits 2 — there is no cross-group call — and a call with neither selector exits 2 too; inside the group, `--tasks=` ticks exactly those numbers and `--green=` ticks the group's gap-free tasks. The holistic verify (build Step 9) judges satisfied tasks across every group, so it buckets the numbers the artifact judged satisfied per group and runs one `tick` per group, naming that group (see `Open Questions` rows 9 and 11).
- **`challenge merge` and build Step 5's `Fix now` write a `Derived Test Matrix` row per task they append.** Both append test-bearing tasks into a plan that carries a matrix, so the bidirectional `matrix` check would otherwise refuse their own append; a one-row-per-task write keeps the check true (see `Open Questions` row 4).
- **Build Steps 3 and 7 route a `matrix` / `supersession` problem to `@bkit-build-plan-convert`**, as they already route a `markers` problem — the recovery path for a plan written before the `Task` column (see `Open Questions` row 4).
- **`bkit tasks currency` diffs `{base}...{against}`** (`--against` defaults to `origin/dev`), not `{base}...HEAD`: the search it replaces judges landed changes on `origin/dev`, and on a worktree `HEAD` is the feature branch (see `Open Questions` row 12).

**New names:**

- `bkit tasks` — a new command noun; verbs `tick`, `open`, `currency` (`.bkit/core/engine/commands/workflow/tasks.ts`). It reads and writes a plan file's task blocks; there is no new task store.
- `bkit branches scan-diff --disabled-tests` — the flag that computes the disabled-test list; `bkit ledgers triage` — the verb that buckets deferral rows and writes the `unjustified` / `TRIAGED` rows; `bkit tasks currency --against` — the commit the matched diff is judged against (`origin/dev` by default).
- `Derived Test Matrix` row column `Task` — the row's single task number; `plan-blocks.ts` gains the `derivedTestMatrix`, `supersessionInventory` and `outOfScope` readers beside `reuseInventory`.

### 👤 ✅ Human Confirmation

- [x] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> **🛑 HUMAN must READ and CONFIRM this SECTION.**
> Unknowns + assumptions this plan relies on. Unresolved question = risk; wrong assumption breaks downstream. If none, write "None".

- **Open Question:** where do the plan-block verbs live? → `#701` `Open Questions` item 1, carried forward.
  - **Options:** A — a new `tasks` noun · B — fold into `context` (`brief`, `diff`) and `tests`.
  - **Recommended:** A — the plan-block verbs sit together and `context` keeps artifact work.
  - **Default if unanswered:** A.
- **Open Question:** does `tests green` always print `verdict`? → `#701` `Open Questions` item 2, carried forward.
  - **Options:** A — always · B — behind `--verdict`.
  - **Recommended:** A — the audit log is already machine-read.
  - **Default if unanswered:** A.
- **Open Question:** does `tick` tick the whole group or only `--tasks=`? → `#701` `Open Questions` item 3, carried forward; the plan's tasks and matrix rows pin both halves, so this is a confirmation, not an open fork. **Owner answered B:** the group-wide gap-free set is what `--green` selects, and `--tasks=` narrows it.
  - **Options:** A — only the named tasks · B — every task in the group with no gap, narrowed by `--tasks=`.
  - **Recommended:** B — the verifier passes the numbers it judged satisfied, so a named-only `tick` would lose the engine's own test-first gap filter; `--tasks=` narrows it.
  - **Default if unanswered:** B.
- **Open Question:** how does `plan-check` know which task a `Derived Test Matrix` row maps to? → answered by this plan; the human confirms because it changes the plan format for every producer.
  - **Options:** A — the row's `Task` cell (a fourth column; `651-sops-env-backup-plan.md` already ships one) · B — infer the mapping from the row's `Target file` plus its test words against each task's `TEST FIRST` · C — check nothing and leave the mapping to the scope-check agent.
  - **Recommended:** A — B cannot discriminate (`700-session-start-nudge-plan.md`'s rows 4-14 share one target file across tasks 1-3, and row wording there differs from every `TEST FIRST` name), and C leaves Success Criterion 3 unmet.
  - **Default if unanswered:** A.
- **Open Question:** what is `fixable` for a `not-green` gap? → answered by this plan from the mapping it moves; the issue's `Tasks` Task 1 `DONE WHEN` lists `false, false, null` for a `not-green`, `no-red`, `test-changed` fixture, which contradicts the prompt's own Process 8 (`not-green` → `Fixable: true`, `bkit-build-plan-verify.md:68`).
  - **Options:** A — `not-green` → `fixable: true` (the prompt's mapping, moved verbatim) · B — `not-green` → `fixable: false` (the issue's literal value order).
  - **Recommended:** A — the engine's mapping must equal the mapping it replaces, or the verifier's verdict changes for every failing test; and `not-green` is exactly the gap a fix executor closes.
  - **Default if unanswered:** A.
- **Open Question:** which gap wins the report `verdict`? The issue's Edge Case says a diff-reading kind prints `verdict: null`, and its Task 1 `DONE WHEN` fixture holds an unfixable gap alongside a diff-reading one.
  - **Options:** A — any `fixable: null` gap makes `verdict` null, so the verifier applies its mapping to every gap · B — any `fixable: false` gap makes `verdict` `FAIL`, else null.
  - **Recommended:** A — it is what the issue's Edge Case and its `DONE WHEN` fixture both state; the verifier still reaches `FAIL` from the gap lines the engine emits.
  - **Default if unanswered:** A.
- **Open Question:** what happens to `no-red`'s "work already landed" exemption? The prompt clears a `no-red` gap when the plan-currency report classifies the task `Broken` **and** the execute log records `DONE — TASK {N}: already landed`; the engine's mapping marks every `no-red` `fixable: false`, which becomes a `FAIL`.
  - **Options:** A — keep the exemption in the prompt as a verifier override of the engine's `fixable: false` · B — teach `tests green` to suppress the `no-red` gap itself when the execute log records the `already landed` line for the task.
  - **Recommended:** A — the exemption needs the plan-currency report, which the engine does not read for this verb, and the verifier is the caller that holds it; B would push a plan-currency classification into the test-first audit.
  - **Default if unanswered:** A.
- **Open Question:** what does the verify artifact's `Verdict:` header carry when the report's `verdict` is `null`? `steps finish` refuses any word but `PASS` / `CONCERNS` / `FAIL`, and the prompt's gap log contract accepts only `— Fixable: true` / `— Fixable: false`.
  - **Options:** A — the header is the verifier's post-judgement roll-up (any decided `false` → `FAIL`; else any decided `true` → `CONCERNS`; else `PASS`), and each gap line carries the verifier's decided `Fixable` in place of the engine's `null` · B — the report's `null` is copied into the header and `steps finish` is widened to accept it.
  - **Recommended:** A — the header is the step's own contract and the log line feeds `bkit-build-plan-gaps-remediate`, which must see a decided value.
  - **Default if unanswered:** A.
- **Open Question:** how does the holistic verify (build Step 9) tick a task in an earlier group, when `tick --group=` exits 2 on a task outside the group? **Owner answered B.**
  - **Options:** A — `--group` is optional: with it, a named number outside the group exits 2; without it, `tick --tasks=` ticks every named task the plan defines, whatever its group · B — Step 9 runs one `tick` per group, over the numbers that group holds, with `--group` required and no call without it.
  - **Recommended:** B — one `tick` per group keeps one call shape for every caller, and the group guard stays the verb's, not the workflow's.
  - **Default if unanswered:** B — the owner's answer.
- **Open Question:** which gap kind does a red whose test gained added lines only emit? Today that row produces no gap at all.
  - **Options:** A — `test-changed`, the kind already in `TEST_ORDER_GAPS` and already one of the prompt's four diff reads; the row's `changed` = `added lines only` tells the verifier which read applies · B — a new kind (e.g. `red-added-lines`) joining `TEST_ORDER_GAPS`, the workflow's test-order gap list and the prompt.
  - **Recommended:** A — no new kind, no new set membership, and the verifier already distinguishes the case by the row state; B widens four lists for one row state.
  - **Default if unanswered:** A.
- **Open Question:** `tick` with neither `--tasks` nor `--green` ticks every gap-free task in the group (row 3, option B) — a caller that forgets `--tasks=` ticks tasks no agent judged satisfied. **Owner answered B.**
  - **Options:** A — keep the default and name its only intended caller in the verb's `--help` · B — require one of `--tasks` / `--green`, exit 2 otherwise.
  - **Recommended:** B — a call with neither selector exits 2, and the verb's `--help` states the two required flags instead of a default's caller.
  - **Default if unanswered:** B — the owner's answer.
- **Open Question:** what does `currency` compare against? The process it replaces judges `{BASE_SHA}...origin/dev`; the plan's first draft said `{base}...HEAD`. **Owner answered A**, refined to three dots.
  - **Options:** A — `{base}...{against}` with `--against` defaulting to `origin/dev`, and the plan-current prompt passes `--base={BASE_SHA}` · B — `{base}...HEAD`.
  - **Recommended:** A — on the build worktree `HEAD` is the feature branch and Step 3 merges only `docs/` from dev, so `{base}...HEAD` misses dev's code-side movement, the check's whole signal, and on a resume flags every earlier group; three dots equals two dots whenever `{base}` is an ancestor of `{against}`, and it matches `branches scan-diff`'s `diff <base>...HEAD`.
  - **Default if unanswered:** A — the owner's answer.
- **Assumption:** the engine's `fixable` vocabulary is `true` / `false` / `null`, where `null` means "the answer needs a diff read" — the four sites the issue names (`delete-still-referenced`, `test-changed`, `red-mismatch`, row `Changed since red = added lines only`). → if wrong (for example the engine is expected to decide `delete-still-referenced` itself), the verifier loses a judgement it must keep and the `deleteGaps` codebase read becomes load-bearing; the mapping is one table in `tests.ts` and moves in one edit.
- **Assumption:** the `Task` column is the plan's only mapping carrier, the `matrix` check is a no-op on a plan that carries no `Derived Test Matrix` section, and every in-flight plan that carries the table gets the column added mechanically before it is built. → if wrong, a resumed build of an older matrix-bearing plan stops in Step 3's `plan-check` with one `matrix` problem naming the missing column (never a per-row flood) and Steps 3 and 7 route it to `@bkit-build-plan-convert`; a plan with no table at all is never refused for the absence.
- **Assumption:** `tick` may write the plan file, so the file it writes is the one `plan-check` reads back, and the write is line-addressed through `parsePlanBlocks`'s task `line` field, never a re-render. → if wrong, a plan re-render would lose consumer prose; `DONE WHEN` pins the line-addressed write and `tasks.test.ts` pins that no other line changes.
- **Assumption:** `ledgers triage` can decide the four reason tests from the ledger row, the plan and the diff, without a human. → if wrong on a row the engine cannot decide, that row is bucketed `Exempt` and no row is written: the failure mode is a missed `unjustified` verdict, never a wrong one written over a genuine deferral.
- **Assumption:** the disabled-test marker set (`.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled`, and a removed assertion line inside a test file) covers what `.bkit/jsonl.md` and the sweep's Process 8 name, with `docs/plans/**` excluded, and `branches.ts`'s set is aligned with the one `.bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs` already carries. → if wrong, the sweep's gate under-reports; the verb is the single place the list lives, so widening the set is one edit in `branches.ts`.
- **Assumption:** the deferral rows this plan writes (`reason` `scope-declared`, one per `Exempt` row that holds real future work) are the only new ledger rows, and the three rows that keep judgement with an agent carry none. → if wrong, `/bkit-ship`'s `ledgers triage` sees a row with no bounded remediation and buckets it `Lazy`, writing an `unjustified` row against a deferral that was never work.
- **Assumption:** the new problems refuse every plan-check caller, including `bkit tests plan-check --existence=report` in build Steps 3 and 7 and `--existence=refuse` in plan Steps 3 and 7. → if wrong, a build whose plan has an unmapped matrix row proceeds and the criterion is unenforced; `plan-check` has one refusal path, so correcting it is one return value.
- **Assumption:** the in-build producers of test-bearing tasks — `bkit challenge merge`'s `appendTasks` and build Step 5's `Fix now` writer — write a `Derived Test Matrix` row for every task they add. → if wrong, the append is refused by the `matrix` check inside its own written range and the findings are stranded (the failure the review round named).
- **Assumption:** the engine's `no-red` → `fixable: false` is the prompt's to override for the "work already landed" case, and the verifier is the only caller holding the plan-currency classification and the execute log the override reads. → if wrong, a resumed build whose work already landed turns `FAIL` and stops in a Decision Pause for a human-written `TEST EXCEPTION`.
- **Assumption:** `green` emitting a `test-changed` gap for `changed: added lines only` moves that row's `green` exit from 0 to 1 and adds it to `testOrderOnly`, and the verifier's own diff read clears it whenever the added lines sit outside every planned test. → if wrong, builds whose tests only gained lines block on a test-order gap the verifier cannot clear.
- **Assumption:** the `Out of Scope` reader `ledgers triage`'s fourth reason test needs is a new export in `plan-blocks.ts` beside `reuseInventory`, because the only existing one is the private, unexported `planSection` in `context.ts`, reached through `BRIEF_SECTIONS`. → if wrong, the `scope-declared` test has no declaration to read and every `scope-declared` row buckets `Lazy`.

### 👤 ✅ Human Confirmation

- [x] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

- **Fold the plan-block verbs into `context` and `tests`** (`#701` `Open Questions` item 1 option B). Rejected: `CommandSpec` is one noun per source, `bkit tests tick` is not a test verb, and `context`'s verbs are artifact writers; the mapping would live in two files and the `conventions.test.ts` noun-uniqueness rule would not catch a future drift.
- **Gate the verdict behind `--verdict`** (`#701` `Open Questions` item 2 option B). Rejected: the audit report is already machine-read by the verifier and the remediate agent, and a flag would let a caller ask for the half of the report the gate reads.
- **Infer the matrix↔task mapping from `Target file` plus test words** (`Open Questions` row 4 option B). Rejected on evidence: `700-session-start-nudge-plan.md` rows 4-14 target two files across tasks 1-3, so a file key cannot discriminate, and its row wording differs from every `TEST FIRST` name, so a name key matches nothing.
- **Keep the mapping in `bkit-plan-scope-check`** (option C). Rejected: Success Criterion 3 requires `plan-check` to exit 1, and a judgement agent cannot be a gate.
- **Make `plan-check` report a missing `Task` column per row** rather than once per plan. Rejected: a 40-row matrix would print 40 identical problems and bury the one fix; one problem naming the column is the actionable form.
- **Move the four diff reads into the engine too.** Rejected: they are judgement (is this hit a different thing with the same name; does this added line sit inside a planned test), and the issue's Edge Case row 1 keeps them with the verifier.
- **Move the sweep's deliverable verification (Process 7) into the engine.** Rejected: it is the judgement the criterion explicitly keeps, and it reads the plan for it anyway.
- **Let `ledgers triage` also close / re-severity rows** (the `utility-update-deferrals` sweep). Rejected: a different contract (disposition and closing) on the same ledger; this plan only adjudicates `reason` at ship time.
- **Copy the report's `null` verdict into the verify artifact's header** (`Open Questions` row 8 option B). Rejected: `steps finish` refuses any word but `PASS` / `CONCERNS` / `FAIL`, and the verifier's gap lines feed `bkit-build-plan-gaps-remediate`, which reads a decided `Fixable`.
- **Teach `tests green` to suppress a `no-red` gap itself** (`Open Questions` row 7 option B). Rejected: the exemption needs the plan-currency report's `Broken` call and the execute log's `already landed` line, neither of which this verb reads; suppressing inside the audit widens it for a case only the verifier can judge.
- **A new gap kind for the added-lines-only row** (`Open Questions` row 10 option B). Rejected: it would join `TEST_ORDER_GAPS`, the workflow's test-order gap list and the prompt's four diff reads for one row state the report's `changed` column already names.
- **Judge `currency`'s diff over `{base}...HEAD`** (`Open Questions` row 12 option B). Rejected on evidence: on the build worktree `HEAD` is the feature branch and Step 3 merges only `docs/` from dev, so this range misses dev's code-side movement — the check's whole signal — and flags the branch's own landed work on every resume.
- **Refuse every plan whose `Derived Test Matrix` section is absent** (the `matrix` semantics). Rejected: it strands issue-form and converted plans and breaks the shipped `trackers.md` / issue-form examples; the check is a no-op when the table is absent, and the table's absence is a plan-shape question the template owns.
- **Recommendation for a future phase:** after this lands, the same treatment is due to the design-workflow prompts, which have no run measurements yet (`docs/deferrals.jsonl` key `701-design-workflow-reviewer-audit`).

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The deferred sweep's deliverable verification (Process 7) | `#701` declared it out of scope before work started; it is judgement (does the codebase satisfy a deliverable), no Success Criterion or matrix row needs it; `docs/deferrals.jsonl` key `701-sweep-deliverable-verification-stays-in-prompt` records it | stays in `.bkit/core/prompts/bkit-ship-deferred-sweep.md` § Process 7 |
| `plan-current`'s `Executable` / `Reword` / `Broken` classification | `#701` declared it out of scope before work started; the engine cannot decide whether landed changes leave a task executable, and Task 4 keeps the call; `docs/deferrals.jsonl` key `701-plan-current-classification-stays-in-prompt` records it | stays in `.bkit/core/prompts/bkit-build-plan-current.md` § Process 8 |
| The four diff-reading test-order classifications in `bkit-build-plan-verify.md` | `#701` declared them out of scope before work started; they are judgement, and Task 1 keeps them; `docs/deferrals.jsonl` key `701-verify-diff-reads-stay-in-prompt` records it | stays in `.bkit/core/prompts/bkit-build-plan-verify.md` § Process 8 |
| Design-workflow reviewers | `#701` declared them out of scope before work started: no design-run measurements exist, so which prose is mechanical is unmeasured — real future work | new audit of the design prompts; `docs/deferrals.jsonl` key `701-design-workflow-reviewer-audit` |

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| `#101` — plan-review routing (item 1 conditional 1x / 2x fan-out) and the `chore({FID}):` commit-subject audit (item 3) | `#101` (open) | `bkit-plan-scope-check.md`, which Task 5 edits, and the review fan-out this plan keeps at two reviewers plus the scope check | keep deferred — routing is not a fact the engine computes, and this plan only removes two checks |
| `#699` — engine run completeness (expected engine calls derived from the workflow markdown) plus `friction` rows on engine errors | `#699` (open) | `workflow-shape.test.ts` and the new `bkit tasks` / `ledgers triage` calls Tasks 3 / 6 / 8 add to `bkit-build.md` and `bkit-ship.md` | keep deferred — this plan must not add a parallel expected-call table |
| A mechanical backfill for the new `Task` column (`bkit tests plan-check --fix-matrix` or an equivalent engine affordance) | plan review (review 2) and the scope check, both out of scope | the plan-format surface Tasks 5 and 9 own; `@bkit-build-plan-convert` covers converted plans but not a plan already in flight | keep deferred — new command, its own issue; Steps 3 and 7 now route such a plan to convert |
| The same engine-facts audit for the remaining build and ship prompts (`bkit-build-plan-execute`, `bkit-build-plan-gaps-remediate`, the sweep's other steps) | the scope check, out of scope | `#676`'s workflow-prose half and `#701`'s prompt half; `bkit-build-plan-execute.md:93` writes the `DONE — TASK {N}` line this plan reads | keep deferred — `#701` scopes only plan-verify, the deferred sweep and plan-current; the rest belongs in a follow-up |
| `tasks currency` ignores paths / symbols named only in a task's `DONE WHEN` prose, which the agent it replaces includes in its in-scope set | plan review (review 2), out of scope | the `currency` verb Task 4 adds | keep deferred — extracting paths from prose is judgement; if missed coverage shows up, a future affordance could parse backticked `DONE WHEN` paths |
| A `task-range` parameter for `bkit-build-plan-execute` (the group brief's task slice) | `docs/deferrals.jsonl` key `pending-bar-155-deferred-task-range-parameter-for-bkit-build-pl` (OPEN, LOW) | the new `tasks` noun's `--tasks=` selection | keep deferred — a brief-range parameter consumed by `context brief`, a different verb from `tasks`; the noun covers tick / open / currency only |
| Amend the plan template's Design-Missing Fallback for standalone plans | `docs/deferrals.jsonl` key `442-plan-template-design-missing-fallback-amendment` (OPEN, LOW) | the same file Task 9 edits (`.bkit/core/docs/templates/bkit-plan.md`, `docs/templates/bkit-plan.md`) | keep deferred — a wording amendment to the MISSING-fallback contract; folding it in changes Narrative / Success Criteria semantics this plan must not touch |
| The pre-commit `bkit:check:dist` gate fails any commit while another agent holds unstaged engine edits | `docs/failures.jsonl` key `precommit-check-dist-blocks-parallel-agents` (OPEN, MEDIUM) | Task 11 rebuilds `dist/` in a tree other agents may be writing | keep deferred — a `.husky/pre-commit` concern of its own; this plan regenerates `dist/` once, in its close-out task |
| Promote the status-hole detector from advisory to gate | `docs/deferrals.jsonl` key `384-promote-status-hole-detector-from-advisory-to-gate` (OPEN, LOW) | the same move as this plan (a prose / advisory check becoming an engine refusal), on `bkit-audit:status` | keep deferred — a separate detector and a separate repo-only gate; no criterion here needs it |
| Pre-push lint and typecheck scope vs CI's whole-repo scope | `docs/deferrals.jsonl` key `653-pre-push-lint-typecheck-scope-vs-ci-whole-repo` (OPEN, MEDIUM) | the gate suite every task's `DONE WHEN` runs | keep deferred — a gate-scope question, unrelated to where a fact is computed |
| `#662` — a worktree a failed ship left dirty blocks the next workflow's rebase | `#662` (open) | `bkit-ship.md` Steps 5-6, which Tasks 6 and 8 edit | keep deferred — different root cause, and the ship edits are additive |
| `#697` — context-fetch options 4-6 (clamp profiles, saving report, table flatten) | `#697` (open) | the `context ledger-scan` clamp Task 8 leans on | keep deferred — the ledger scan keeps its own keep-cap |
| A `--scope` that accepts empty silently in `bkit steps done` | `docs/deferrals.jsonl` key `58-test-verdict-scope-arg-accepts-empty-silently` (OPEN, MEDIUM, `scope-declared`) | the `bkit tests` command surface Tasks 1 and 5 extend | keep deferred — a `steps` validation gap; no criterion here needs it |
| A gitignored `worktree.copy` entry once broke every commit in a worktree | `docs/failures.jsonl` key `worktree-copy-gitignored-file-breaks-commit` (HIGH, fixed in `412fe612f`) | Task 11 runs `bkit install` and commits in `.worktrees/701-engine-work-build` | no action — already fixed and covered by `worktrees.test.ts` |

## Security & Privacy

- [ ] **New API Route** — no; the engine's commands are local.
- [ ] **New DB Table/Column** — no database in this repo.
- [x] **User Input** — the new verbs' flags are validated in the handler, not only by their caller: `--plan` must resolve to a file (else exit 2, path named), every `--tasks` value must be a positive integer naming a task the plan defines (else exit 2), `--base` and `--against` must resolve as commits (else the existing `EXIT_DIFF_FAILED`), and `--fid` / `--group` go through the same `positiveInt` / string helpers the neighbouring verbs use.
- [ ] **PII** — no personal data; the commands read and write plan text and ledger rows that name issue numbers, files and tests.
- [ ] **Redirect URL** — no.
- [ ] **Webhook** — no.
- [ ] **New Secret/Env Var** — no.
- [ ] **Role-Gated Mutation** — no roles; the plan file and the ledgers are repo-local files the engine already writes.

_Two surfaces are write paths and stay inside the existing privilege_: `bkit tasks tick` rewrites the plan file's own task line (`docs/plans/**`, already written by the plan workflow and the verifier today), and `bkit ledgers triage` appends to `docs/deferrals.jsonl` through the existing `ledgers append` validation and minted-`ts` path — it never rewrites a prior row, and it carries an existing `reason` verbatim rather than inventing one.

## Pre-Flight / Dependencies

### Core

- [x] **Package Management:** no packages added or changed; `package.json` and `pnpm-lock.yaml` stay in sync untouched.
- [x] **Dependency Versions:** node `v24.16.0` (matches `.nvmrc` `24`), pnpm `10.34.6`, git `2.56.0`. `pnpm bkit:deps:outdated` reports 5 outdated dev-only deps — `vitest` 5.0.3→5.0.5, `@vitest/coverage-v8` 5.0.3→5.0.5, `oxlint` 1.87.0→1.88.0, `@types/node` 24.19.2→26.6.5, `vite` 6.4.4→8.3.4. None blocks this change: no dependency is added, and the `vite` major sits upstream of the vitest stack. Stack CLI: the engine runs from the committed `dist/` (`pnpm bkit` = `node dist/cli.js`), so Task 11 rebuilds it — a `dist/` that lags its source is the one CLI/backend mismatch this plan can hit, and `bkit:check:dist` fails CI on it.
- [x] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory` (`grep -rn` over `.bkit/core/engine/commands/workflow/` for the plan-block readers, the diff scan and the ledger writers; a `grep -rn "doneTasks\|loggedDone\|isDone"` over `context.ts` / `tests.ts` for the group's open-task set `tasks open` reports; a `grep -rn "TEST_SUFFIX\|TEST_GLOBAL"` over `.bkit/templates/scripts/slop/` for the disabled-test marker set; reads of `plan-blocks.ts`, `tests.ts`'s `green` / `plan-check`, `branches.ts`'s `scanDiffVerb`, `ledgers.ts`'s `append`, `ledgers/telemetry.ts`'s reason enum, `context.ts`'s `ledger-scan` / `doneTasks` / `brief`).
- [x] **User Context:** file access confirmed (worktree `.worktrees/701-engine-work-build`); every file the runbook names was opened this session; no missing user information — the twelve `Open Questions` carry 2-3 options with their trade-offs, a recommendation and a default.
- [x] **Project Context:** read `docs/testing.md` § CI test tiers / § Which tier does a behaviour need? / § Test first / § Key test files, `.bkit/jsonl.md` § Deferral Reason / § Write Idiom, `.bkit/trackers.md` § Issue shapes, `docs/templates/bkit-plan.md`, `.bkit/instructions.md` § Clauses (`plan-scenario-detail`), `docs/decisions.jsonl` (keys near `plan-check` / deferrals — none to supersede) and `docs/deferrals.jsonl` + `docs/failures.jsonl` (open rows in `Suggested Scope Expansion`).
- [x] **Testing & Quality:** matches `docs/testing.md` — every row is `Unit`, the tier its target file already runs in; `.bkit/core/engine/commands/**/*.test.ts` is the unit lane (bkit's repo declares no integration / E2E / `@live` tier — `docs/testing.md` § Validated means executed, "a repo with no integration / E2E / `@live` tier is fully valid"), and `branches.test.ts` / `ledgers.test.ts` / `tests.test.ts` already exercise real temp git repos and the real test-file subprocess as that tier's boundary form. No DB, no external or deployed boundary → no `@live`, E2E or fresh-DB replay row.
- [x] **Prerequisite Plans:** None — `#680` (the append machinery `triage` reuses) and `#685` (the plan-block format) are closed and their code is in this tree.

### Conditional

- [x] **Secrets & Env Vars:** none added; the verbs read no secret and the ledgers stay repo-local.
- [x] **Schema State:** N/A — no database. The two machine-read text contracts this change writes are recorded in `Data Schema Integration`.
- [x] **Architecture & UI:** `docs/architecture.md` needs no edit — no service boundary, topology or installed-layout change (the new file sits in the `commands/workflow/` folder the tree sketch already names); no UI.
- [x] **Observability:** no new logs, audit tables or traces. Each verb reports through `ctx.log` / `ctx.emit` (stderr / stdout) per the engine convention `conventions.test.ts` enforces, and `docs/observability.md` describes the consumer's logging, not the engine's channel — no row there.
- [x] **Notifications:** None — no alert or toast. The only human-facing signal is a nonzero exit code a workflow routes on.

### 🔒 Gate 1: Prerequisites Check

- [x] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`).
- [x] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`).
- [x] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` section (checkbox is `[x]`).
- [x] **Security & Privacy checked:** the one applicable row verified; the rest justified `None`.
- [x] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision`; every `NEW` cites its reason.
- [x] **Gate 1 - Verified:** Core items and applicable Conditional items checked.

## Data Schema Integration

No database in this repo. The two machine-read text contracts this change reads and writes are recorded here in the schema section's place, because they carry the same "schema, never prose" obligation.

### Data Schema Usage

- **Input (Read):** the plan file's group / task blocks (`<!-- bkit:group N start -->` … `<!-- bkit:group N end -->`, `<!-- bkit:task N start -->` … `<!-- bkit:task N end -->`, the uppercase fields) via `parsePlanBlocks`; the plan's `Derived Test Matrix` table and its `Task` column; the plan's `Supersession Inventory` table; the plan's `Out of Scope` table; `docs/deferrals.jsonl` rows (`key`, `type`, `category`, `severity`, `reason`, `description`, `remediation`, `references`, `status`); the `bkit tests green` audit report's `gaps: [{task, kind, detail, fixable, logLine}]` and its `verdict`; the build execute log's `DONE — TASK {N}` / `BLOCKED — TASK {N}` / `DONE — TASK {N}: already landed` lines; `{base}...{against}` and `{base}...HEAD` diffs.
- **Output (Write):** the plan file's task line (`- [ ] **TASK {N}:**` → `- [x] **TASK {N}:**`), line-addressed by `parsePlanBlocks`'s task `line`; the plan file's `Derived Test Matrix` rows the in-build producers append; `docs/deferrals.jsonl` rows (`schema`, `ts`, `kind`, `key`, `repo`, `bkit`, `by`, `references`, `type`, `category`, `severity`, `reason`, `status`, `description`, `remediation`) written through the existing `ledgers append` validation with a minted `ts`.

### Data Schema Changes

- **ADD:** the optional `Task` column on a plan's `Derived Test Matrix` table (plan text, not a store) — made required by `plan-check`'s new `matrix` kind and carried by `docs/templates/bkit-plan.md`; and `plan-check`'s two new problem kinds (`matrix`, `supersession`) in the verb's `problems` payload.
- **MODIFY:** no ledger field is added or renamed; `reason` → `unjustified` and `status` → `TRIAGED` are the existing `.bkit/jsonl.md` § Deferral Reason / § Updating a Row semantics.
- **None** for `docs/data-schema.md` — it indexes production database tables only.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Test-first verdict, per-gap `fixable` and the ready-to-append log line | `.bkit/core/engine/commands/workflow/tests.ts` | `grep -n "kind\|gap(" .bkit/core/engine/commands/workflow/tests.ts`; read the `Gap` type, `writeAuditReport`, `green`'s `ctx.emit` block and `deleteGaps`; `grep -rn "Fixable" .bkit/core/prompts/bkit-build-plan-verify.md .bkit/instructions.md` | `green`'s existing `gaps` array (`{task, kind, detail}`) and its report writer | EXTEND | add `verdict` to the emitted payload and the report, and `fixable` / `logLine` per gap, from one mapping table in the file; every existing key and the report's sections stay |
| Plan table readers (`Derived Test Matrix`, `Supersession Inventory`, `Out of Scope`) | `.bkit/core/engine/commands/workflow/plan-blocks.ts` | read `reuseInventory` + `tableCells` in full; `grep -rn -e "Derived Test Matrix" -e "Supersession" -e "Out of Scope" .bkit/core/engine/commands`; `grep -rn -e "BRIEF_SECTIONS" -e "planSection" .bkit/core/engine/commands/workflow` | `reuseInventory(text)` — the plan's Reuse Inventory table reader, with `tableCells` and heading scoping; `context.ts`'s private `planSection` reached through `BRIEF_SECTIONS` is the only `Out of Scope` reader and is unexported | EXTEND | same file, same shape: three more readers over the same `tableCells` helper, so all plan-table parsing stays in the one module `tests` and `challenge` already import; exporting `context.ts`'s `planSection` would put a heading reader in the artifact-writer module |
| The `tasks` noun (`tick`, `open`, `currency`) | `.bkit/core/engine/commands/workflow/tasks.ts` | `grep -rln "parsePlanBlocks" .bkit/core/engine` (`tests.ts`, `challenge.ts`, `run-facts.ts`, `summary.ts`); `grep -rn -e "doneTasks" -e "loggedDone" -e "isDone" .bkit/core/engine/commands/workflow/context.ts .bkit/core/engine/commands/workflow/tests.ts`; read `context.ts`'s `brief` (`loggedDone`, `isDone`, its `open` filter) and `doneTasks`; `ls .bkit/core/engine/commands/workflow/`; read `registry.ts` and `conventions.test.ts` | `context.ts` (its `brief` already computes the group's tick-plus-log done set and the same `filter(t => !isDone(t))` open set, and its `doneTasks` reader is an exported shared export); `tests.ts` (owns `plan-check`, the plan's reader consumer) | NEW | (b) `CommandSpec` is one noun per source and `conventions.test.ts` asserts noun uniqueness and one exported command per file, so folding `tick` into `tests` would make `bkit tests tick` a test verb, and folding `open` into `context` would make one noun both the plan-block verb a workflow calls for a machine verdict and the artifact writer whose callers read a clamped brief — that contract breaks. The capability itself is not duplicated: `open` imports the same exported `doneTasks` reader `context.ts` uses rather than re-parsing the log lines |
| Disabled-test diff scan | `.bkit/core/engine/commands/workflow/branches.ts` | read `scanDiffVerb` and the `--marker` added-line branch; `grep -rn -e "disabled" -e "skip" .bkit/core/engine/commands`; `grep -rn -e "TEST_SUFFIX" -e "TEST_GLOBAL" .bkit/templates/scripts/slop/` | `scan-diff`'s `--marker` branch (added lines from `{base}...HEAD`, `docs/plans` excluded) and its `--expect-none` exit inversion; `.bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs` already carries a `TEST_SUFFIX` / `TEST_GLOBAL` marker set | EXTEND | one more branch beside `--marker`, sharing the fetch / `rev-parse` guard and the diff loop; the line number comes from the hunk header the loop already walks, and the marker set is aligned with the slop template's rather than newly invented |
| Deferral triage and the `unjustified` / `TRIAGED` row write | `.bkit/core/engine/commands/workflow/ledgers.ts` | read `append`'s validator entry points (`APPEND_LEDGERS`, `EXIT_ROW_REFUSED`, the writer check) and `check`; `grep -rn "DEFERRAL_REASONS\|UNJUSTIFIED_REASON" .bkit/core/engine` | `append` (mints `ts`, validates a row, checks its writer, all-or-nothing) and `ledgers/telemetry.ts`'s `DEFERRAL_REASONS` / `UNJUSTIFIED_REASON` | EXTEND | `triage` computes a bucket and hands each row it must write to the same append path, so the row shape, the `ts` mint and the writer check stay in one place |
| The deferral reason vocabulary and the four tests' inputs | `.bkit/core/engine/ledgers/telemetry.ts` | `grep -rn "DeferralReason\|DEFERRAL_REASONS\|UNJUSTIFIED_REASON" .bkit/core/engine`; read its § Deferral Reason doc block | `DEFERRAL_REASONS` (the closed enum) and `UNJUSTIFIED_REASON`, with the four tests documented beside them | EXTEND | no code change: `triage` imports the enum instead of re-declaring it, so a new reason is one edit; the four tests themselves are new logic in `triage` |
| The sweep's deferral-row list and the ship docs agent's `Pending Items` | `.bkit/core/workflows/bkit-ship.md` | `grep -n "ledger-scan\|deferrals.jsonl\|Step 6" .bkit/core/workflows/bkit-ship.md`; read Step 5 and Step 6 | `bkit context ledger-scan` (a shipped verb) and the ship workflow's existing per-step artifact pattern | EXTEND | Task 8 runs the verb and passes its artifact; no new command, and `docs/deferrals.jsonl` never reaches the docs agent as an unfiltered read |
| The `Task` column on the plan template | `.bkit/core/docs/templates/bkit-plan.md` | `grep -n "Target file" .bkit/core/docs/templates/bkit-plan.md docs/plans/202610/*.md`; `find .bkit -name bkit-plan.md` | `651-sops-env-backup-plan.md` and `700-session-start-nudge-plan.md` already ship a `Task` column; the template's matrix holds three columns | EXTEND | add the column and one sentence to the template's matrix, and to the `plan-scenario-detail` clause the plan-writing prompts carry; the mirror `docs/templates/bkit-plan.md` is regenerated by `bkit install` |

## Architecture & Component Changes

**Ledger rows:** `701-tasks-command-noun`, `701-green-always-prints-verdict`, `701-tick-narrows-by-tasks`, `701-matrix-task-column`, `701-verify-header-rollup`, `701-no-red-exemption-kept-in-prompt`, `701-added-lines-only-gap-kind`, `701-currency-against`, `701-not-green-fixable-true`, `701-verdict-precedence`, `701-tick-requires-selector`, `701-currency-range-three-dot`, `701-design-workflow-reviewer-audit`, `701-sweep-deliverable-verification-stays-in-prompt`, `701-plan-current-classification-stays-in-prompt`, `701-verify-diff-reads-stay-in-prompt`

`701-tick-narrows-by-tasks` and `701-matrix-task-column` each gain a same-`key` row for the refinement the review round forced (the tick's required `--group` and selector; the `matrix` semantics and the producers' row write).

### Database Migrations

None — no database.

### Engine Commands — `.bkit/core/engine/commands/workflow/`

#### [MODIFY] `.bkit/core/engine/commands/workflow/tests.ts`

- **Existence Check:** file exists.
- `green`: emit a top-level `verdict` (`PASS` no gaps · `FAIL` any gap `fixable: false` · `CONCERNS` every gap `fixable: true` · `null` any gap `fixable: null`) and, on each gap, `fixable` and `logLine`; carry both into `writeAuditReport`'s gap lines so the verifier's prompt reads them from the report. The mapping is one table in the file: `true` — `not-green`; `null` — `delete-still-referenced`, `test-changed`, `red-mismatch`, and the row state `changed: added lines only` (the four diff reads); `false` — `no-red`, `late-red`, `no-test-first`, `test-first-malformed`, `test-first-unread`, `red-evidence-missing`, `exception-refused`. `logLine` is the line the verifier appends: ``TASK {N}: `{test file}` `{test name}` — {kind} — Fixable: {fixable}``, rendered once, in the file.
- `green` also emits the diff-read gap for a row state that today produces none: a red whose snapshot and test differ by added lines only (the `added` branch beside `row.changed = "added lines only"` at the `onlyAddsLines` call) now pushes the same `test-changed` gap the non-added branch does, with `fixable: null`, so the verifier is handed the diff read the prompt already holds. `green` therefore exits 1 on that row where it exits 0 today, and the row joins `testOrderOnly` (kind `test-changed` is already in `TEST_ORDER_GAPS`); no new kind and no set widening.
- `plan-check`: extend the `problems` kind union (line 344) with `matrix` and `supersession`, and their checks in `checkPlanText`; update the verb's `summary`, its `output.problems` line and its `--help`. **`matrix` semantics, pinned:** a plan whose text carries no `Derived Test Matrix` section yields no `matrix` problem whatever its tasks name (the refusal is on a row, and issue-form / converted plans carry no table). A plan that carries the table is checked in both directions: the header carries no `Task` column → one problem at the header line naming the column to add; a row whose `Task` cell names no task number, or a number no task block defines → one problem at the row; a row naming two or more numbers → one problem naming the row and both tasks; a task that names at least one `TEST FIRST` test and is named by no row → one problem at its task line (a task whose `TEST FIRST` is `n/a` needs no row). The bidirectional half holds after an in-build append only because `challenge.ts`'s `appendTasks` and build Step 5's `Fix now` writer add a row for every task they write. `supersession`: every `DELETE` reference of a task names a file that appears in the plan's `Supersession Inventory` table, else one problem at the `DELETE` line.
- No exit code changes; the two kinds join the existing `problems`, so `plan-check` still exits 0 / 1. `doneTasks` stays the shared, exported reader of the execute logs' `DONE — TASK {N}` lines (`context.ts` imports it); `tasks open` reuses it rather than re-parsing.

#### [MODIFY] `.bkit/core/engine/commands/workflow/plan-blocks.ts`

- **Existence Check:** file exists.
- Add `derivedTestMatrix(text)`, `supersessionInventory(text)` and `outOfScope(text)` beside `reuseInventory`, reusing `tableCells` and the same heading scoping: the first table under the first heading naming the section, before the next heading of the same or a higher level; `derivedTestMatrix` returns each row's cells plus the `Task` column's index (`null` when the header has none), the header line and the row lines; `supersessionInventory` returns each row's backticked paths; `outOfScope` returns each row's cells (the excluded item and the `Where it belongs` cell) so `ledgers triage`'s fourth reason test can read the plan's own declaration. Pure text in, rows out — no file-system access, so `tests`, `challenge` and the workflow verbs keep sharing it.

#### [new] `.bkit/core/engine/commands/workflow/tasks.ts`

- **Reuse Check:** `Reuse Inventory` row "The `tasks` noun (`tick`, `open`, `currency`)" — reason (b).
- `noun: "tasks"`, `summary`, verbs `tick` / `open` / `currency`, each with `flags`, `output` and `exitCodes` per `lib.ts`'s `VerbSpec`; imports `parsePlanBlocks` (and `derivedTestMatrix` only if a verb needs it) rather than re-parsing the block format, and imports `doneTasks` from `./tests.js` rather than re-parsing an execute log. Task 2 lands the noun and `tick`; Tasks 3 and 4 `UPDATE` this file with `open` and `currency`, so no verb is declared without a handler.
- `tick --plan= --group= (--tasks= | --green=)`: `--group` is required — there is no cross-group call, and a call naming no `--group` exits 2. Candidates are `--group`'s tasks. One of `--tasks=` / `--green=` is required; with neither the verb exits 2. `--tasks` (repeatable, positive integers) ticks exactly those numbers, and a number outside the group exits 2, naming the task and its group. `--green` (a `tests green` audit report) drops every task the report gaps — it matches the report's `- Task {N} \`{kind}\` — {detail}`gap lines and its`gaps: [{task, kind, …}]`payload, the shape Task 1 writes — so`--green`alone ticks the group's gap-free tasks and both together intersect. Ticks each remaining task's`- [ ] **TASK {N}:**`line to`- [x]`, addressed by `parsePlanBlocks`'s task `line`, leaving every other line byte-identical; prints each ticked number. The verb's `--help`states the two required flags. Exit 0 ticked (including none — idempotent); exit 1 a plan with no task blocks, naming the`plan-check`reason; exit 2 no`--group`, neither selector, a `--tasks`value that is not a positive integer or names a task the plan does not define, a task named outside the given`--group`(naming the task and its group), or a`--plan` that is no file.
- `open --plan= --group= --log=`: prints the group's tasks holding neither a `DONE — TASK {N}` nor a `BLOCKED — TASK {N}` line in `--log` (the log's own line forms, read through the shared `doneTasks` reader), and `handover: true` when at least one is open, else `false`. Exit 0 (including an empty list); exit 1 a plan with no task blocks, naming the `plan-check` reason; exit 2 a missing `--plan` / `--log` file.
- `currency --plan= [--base=] [--against=]`: per task, the paths and needles its `CREATE` / `READ` / `UPDATE` / `DELETE` fields name, matched against `git diff --name-only {base}...{against}` (three dots — merge-base(`{base}`, `{against}`)..`{against}`, matching `branches scan-diff`'s `{base}...HEAD`; default `origin/dev`) and `git diff {base}...{against} -S{needle} --name-only`; for matched tasks only, print the matched paths, the needles that matched and `git diff {base}...{against} -- {paths}`; no hunk outside the matched set. `--against` exists because the search this verb replaces judges landed changes on `origin/dev`, while on the build worktree `HEAD` is the feature branch. Exit 0 (including no match); exit 1 a plan with no task blocks, naming the `plan-check` reason; exit 2 a `--plan` that is no file; the existing diff-failure code when `--base` or `--against` does not resolve.

#### [MODIFY] `.bkit/core/engine/commands/workflow/branches.ts`

- **Existence Check:** file exists.
- `scan-diff` gains `--disabled-tests` (boolean), joining the "give exactly one of `--paths`, `--marker`, `--code`" guard as a fourth mutually exclusive mode. It reads added lines only from `{base}...HEAD` with `docs/plans` excluded, walking the diff's `@@ … +N,M @@` hunk headers to keep the new-file line number, and reports `{file, line, test}` for each added line matching `.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled`, or a removed assertion line inside a test file (`*.test.*`, `*.spec.*`, `*_test.*`, `test_*.py`) matching an assertion call. The marker set is the one `.bkit/templates/scripts/slop/bkit-slop-type-suppression.mjs` already carries (`TEST_SUFFIX` / `TEST_GLOBAL`), widened by this flag's added-line forms and kept as one list in this file. `test` is the nearest preceding test declaration in the working-tree file at that line (`it(`, `test(`, `it.each(`, `func Test`, `def test_`, `@Test`), else the marker line's own trimmed text. `found` / `disabled` join the `output`, and the verb's `summary` and `--help` state the exit inversion (0 nothing added, 1 something added) alongside `--expect-none`'s, and that `--disabled-tests` inverts its sibling modes' polarity (`--paths` / `--marker` / `--code` exit 0 on a hit) so the two must not be passed together. Exit codes unchanged: `EXIT_DIFF_FAILED` when `--base` does not resolve or the diff fails.

#### [MODIFY] `.bkit/core/engine/commands/workflow/ledgers.ts`

- **Existence Check:** file exists.
- New verb `triage` in `ledgers.ts` (`triage --fid= --plan=`): reads `docs/deferrals.jsonl` (folding same-`key` rows last-wins) and keeps the rows whose `key` starts with the FID's leading issue number, or whose `references` name `#{N}` / the FID. Per row: `reason: "low-severity"` with `severity: "LOW"` → bucket `Exempt`, no write. Else the four tests of `.bkit/jsonl.md` § Deferral Reason, all decidable from the row, the plan and the diff: (1) `remediation` names at least one path that exists in the tree and no new architecture; (2) a named path or `references` entry sits inside a surface the plan's tasks touch (their `CREATE` / `READ` / `UPDATE` / `DELETE` files, or the plan's `Reuse Inventory` `File` cells — both through `plan-blocks.ts`); (3) `reason` is neither `hard-blocked` nor `needs-decision`; (4) a `scope-declared` row's `references` name a plan item (a row of the plan's `Out of Scope` table, read through `plan-blocks.ts`'s `outOfScope`) or a design § that declared it out of scope — a row that is its own only declaration fails. All four hold → bucket `Lazy` and append a same-`key` row carrying every prior field verbatim with `reason: "unjustified"`, `status: "TRIAGED"` and a `description` naming the failed tests, through `append`'s path (minted `ts`, writer check, all-or-nothing). Prints `{key, bucket, tests}` per row and a total. Exit 0 (including no matching row); `EXIT_ROW_REFUSED` if a computed row fails validation (nothing written); exit 2 a missing `--fid` / `--plan` file. The verb's `output` and `--help` list both codes.

#### [MODIFY] `.bkit/core/engine/commands/registry.ts`

- **Existence Check:** file exists.
- Import `tasksCommand` from `./workflow/tasks.js` and add it to `COMMANDS` beside `testsCommand`, so `conventions.test.ts`'s reachability, noun-uniqueness and per-source-test rules cover it.

#### [MODIFY] `.bkit/core/engine/commands/workflow/challenge.ts`

- **Existence Check:** file exists.
- `appendTasks` (and `findingGroups`, its block writer) writes one `Derived Test Matrix` row per finding task it appends — `{test description, Type, Target file, Task}`, from the finding's own `TEST FIRST` — so the appended range holds a conforming plan and `planProblems`' line-range filter still passes. `planProblems` keeps its role as the merge gate unchanged; it needs no new arm.

#### [DELETE] — the prompt blocks this change removes

One line per `Supersession Inventory` row, named here so the removals are visible where an implementer reads:

- [DELETE] `.bkit/core/prompts/bkit-build-plan-verify.md` § Process 8 — the eleven-row kind→`Fixable` table (Task 1).
- [DELETE] `.bkit/core/prompts/bkit-build-plan-verify.md` § Process 10 — the three-line verdict mapping (Task 1).
- [DELETE] `.bkit/core/prompts/bkit-build-plan-verify.md` § Process 9 — the plan tick edit (Task 2).
- [DELETE] `.bkit/core/prompts/bkit-build-plan-verify.md` § Process 6-7 — the task ↔ `DONE` log cross-reference (Task 3).
- [DELETE] `.bkit/core/prompts/bkit-build-plan-current.md` § Process 5-7 — the changed-path list, the `-S` needle search and the per-path diff read (Task 4).
- [DELETE] `.bkit/core/prompts/bkit-plan-scope-check.md` § Process 9 — matrix ↔ runbook coverage (Task 5).
- [DELETE] `.bkit/core/prompts/bkit-plan-scope-check.md` § Process 11 — supersession inventory presence (Task 5).
- [DELETE] `.bkit/core/prompts/bkit-ship-deferred-sweep.md` § Process 8 — the disabled-test diff scan (Task 6).
- [DELETE] `.bkit/core/prompts/bkit-ship-deferred-sweep.md` § Process 9-11 — the deferral reason tests and the `unjustified` row write (Task 7).
- [DELETE] `.bkit/core/prompts/bkit-ship-update-docs.md` § Process 7 — the `docs/deferrals.jsonl` grep (Task 8).

### Prompts — `.bkit/core/prompts/`

#### [MODIFY] `.bkit/core/prompts/bkit-build-plan-verify.md`

- **Existence Check:** file exists.
- Contract: the mandate loses "change plan only to mark tasks done" → the verifier never writes the plan; add the satisfied task numbers to the machine-parseable header (one line, e.g. `Tasks: 1, 2`; the empty form is `Tasks: none`, because `readHeader` refuses an empty declared field), because the workflow reads them to tick. `Verdict:` stays one of `PASS` / `CONCERNS` / `FAIL` and is the verifier's post-judgement roll-up, never the report's `null`.
- Process 4: the gap log line is the report's `logLine` with the verifier's decided `Fixable: true|false` substituted wherever the engine printed `Fixable: null`, no longer assembled by hand.
- Process 6-7: drop the `DONE` log cross-reference (the engine's `open` and the execute log's lines are the workflow's inputs).
- Process 8: drop the eleven-row kind→`Fixable` table and keep the four diff reads (`delete-still-referenced`, `test-changed`, row `Changed since red`, `red-mismatch`), now written as "the engine prints `fixable: null` for these and you decide them"; keep the `no-red` "work already landed" override (plan-currency `Broken` + the execute log's `DONE — TASK {N}: already landed` → no gap) as an explicit override of the engine's `no-red` `fixable: false`; keep the two report-level bullets the table sits among — `Enforced: false` → a reason in `Notes` (no gap) and the `Late-red check` section → each unchecked task in `Notes` (no gap); add that a `logLine` carrying `Fixable: false` is a `FAIL`. For the row state `Changed since red = added lines only` the engine now emits a `test-changed` gap with `fixable: null`: read its diff, and added lines inside a planned test or in setup it runs → `Fixable: false`, added lines only outside every planned test → no gap.
- Process 9: replace the plan tick with "pass the satisfied task numbers it judged"; Process 10: drop the verdict mapping and read `verdict` from the report, mapping the three judged words itself when the report's `verdict` is `null`.

#### [MODIFY] `.bkit/core/prompts/bkit-build-plan-current.md`

- **Existence Check:** file exists.
- Process 5-7: drop the changed-path list, the `-S{needle}` search and the per-path diff read; Process 5 keeps "record what each task depends on" as the input to `bkit tasks currency --base={BASE_SHA} --against=origin/dev`, and Process 7 becomes "read the hunks `currency` printed for the matched tasks". Process 8's `Executable` / `Reword` / `Broken` call is unchanged.

#### [MODIFY] `.bkit/core/prompts/bkit-ship-deferred-sweep.md`

- **Existence Check:** file exists.
- Process 8: read `bkit branches scan-diff --disabled-tests --base=origin/dev` and its `disabled` list instead of scanning the supplied diff; a non-empty list is a `Blocking Deferral` and a `FAIL`.
- Process 9-11: read `bkit ledgers triage --fid={FID} --plan={PLAN}` — its `Exempt` rows are the `Exempt Deferrals`, its `Lazy` rows the `Lazy Deferrals` — and drop the reason tests and the `ledgers append` write (the verb writes). Process 7 (deliverable verification) is untouched: it keeps its own `unjustified` / `TRIAGED` write for a `Planned` item that stays unmet, so the ban this change states covers the _reason_-adjudication rows only.

#### [MODIFY] `.bkit/core/prompts/bkit-ship-update-docs.md`

- **Existence Check:** file exists.
- Drop Process 7 (the `docs/deferrals.jsonl` grep); `Pending Items` is filled from the `bkit context ledger-scan` artifact the ship workflow passes.

#### [MODIFY] `.bkit/core/prompts/bkit-plan-scope-check.md`

- **Existence Check:** file exists.
- Process 9 (matrix ↔ runbook mapping) and Process 11 (supersession inventory presence) are dropped — `plan-check` refuses both; the lens keeps every other check. Process 17's verdict mapping and the Contract's Scenario-detail clause are reworded in the same edit so neither keeps claiming the two checks this lens no longer performs (the Scenario-detail clause stops assigning the agent the matrix-to-runbook mapping audit); the Contract's `Runbook tasks` line is untouched.

#### [MODIFY] `.bkit/core/prompts/bkit-build-plan-convert.md`

- **Existence Check:** file exists.
- Contract: add the `Task` column to the plan shape it writes (a `Derived Test Matrix` converted from an issue body has three columns), so a converted plan passes `plan-check` on its re-run.

### Workflows — `.bkit/core/workflows/`

#### [MODIFY] `.bkit/core/workflows/bkit-build.md`

- **Existence Check:** file exists.
- Step 3's route (sub-step 2's `CONVERTED` arm): a `matrix` or `supersession` problem joins the `markers` arm → `@bkit-build-plan-convert`, so a plan written before the `Task` column has a recovery path instead of the Failure Path.
- Step 5 `Fix now`: the task block the workflow writes also adds its `Derived Test Matrix` row (one per test in `TEST FIRST`), so the plan-check it runs immediately after passes and the check box "Fix now tasks checked (`tests plan-check`)" holds.
- Step 6 sub-step 5: replace the prose set difference with `bkit tasks open --plan={PLAN} --group={GROUP} --log={EXECUTE_LOG}`, routing on `handover: true` — the existing `EXECUTE_VERDICT` = `HANDOVER` disjunct and the `EXECUTE_RESUMED` guard are preserved as they are.
- Step 7 sub-step 4: the subagent's `Update:` line drops the plan (the verifier writes no plan file) and its `Read:` list keeps the diff and the green report; sub-step 4's hold gains the satisfied task numbers from the verify artifact's header as the field `Tasks` (so the number survives the tool-call boundary through `steps finish`; the empty form is `Tasks: none`); a new sub-step runs `bkit tasks tick --plan={PLAN} --group={GROUP} --tasks={VERIFIED_TASKS} --green={GREEN_REPORT}` before the step finishes.
- Step 7 sub-step 6's `tests plan-check` route: a `matrix` / `supersession` problem joins the `markers` arm → `@bkit-build-plan-convert` there too.
- Step 9: the tick runs after the holistic verify once per group — the workflow buckets the satisfied numbers the holistic artifact names per group and runs `bkit tasks tick --plan={PLAN} --group={GROUP} --tasks={VERIFIED_TASKS} --green={GREEN_REPORT}` for each group, because the artifact names satisfied tasks across every group and ship's summary blocks on an unticked task. The subagent's `Update:` line is dropped for the same reason as Step 7's.

#### [MODIFY] `.bkit/core/workflows/bkit-ship.md`

- **Existence Check:** file exists.
- Step 5 sub-step 2: pass the sweep the diff base it runs the scan against (`origin/dev`, the base the `context diff` artifact already uses), so the sweep's `--base` is not guessed.
- Step 6 sub-step 1: run `bkit context ledger-scan --terms='{FID}' --source=docs/deferrals.jsonl --artifact="{OUTBOX}/ship-pending-items.md" --fid={FID} --step=ship-update-docs --reset-log`, pass the artifact in the subagent's `Read:` list, and drop the raw `docs/deferrals.jsonl` read where the scan replaces it.

### Template & Clauses

#### [MODIFY] `.bkit/core/docs/templates/bkit-plan.md`

- **Existence Check:** file exists.
- § Derived Test Matrix: the table gains a `Task` column and one sentence — each row maps to exactly one runbook task by its number, and an `n/a`-only task needs no row. The column lands with Task 5 (the change that makes it required), not with Task 9, because Task 5's own tests read the shipped template example; Task 9 carries the clause and its carrier prompts. The mirror `docs/templates/bkit-plan.md` is regenerated by `bkit install` in Task 11.

#### [MODIFY] `.bkit/instructions.md`

- **Existence Check:** file exists.
- § Clauses: the `plan-scenario-detail` clause's `Derived Test Matrix` sentence gains the `Task` column as the mapping carrier, then `pnpm instructions:sync` rewrites its copies in the four carrier prompts; `pnpm instructions:show --file bkit-build-plan-convert.md` before the convert prompt gains the same line.

### Cron Jobs & Scheduled Tasks

None — every verb is invoked by a workflow step, on demand.

## Supersession Inventory

Each row is prose inside a prompt that stays: the block is deleted, the prompt file itself is kept and modified. Each DELETEd block is replaced by an engine verb, and the runbook task that removes it is named in `Replaced by`.

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `bkit-build-plan-verify.md` § Process 8 — the eleven-row kind→`Fixable` table | `bkit tests green`'s `fixable` per gap (Task 1) | DELETE | one right answer, and the engine already computes every gap kind it maps; the four diff reads stay in the prompt |
| `bkit-build-plan-verify.md` § Process 10 — the three-line verdict mapping | `bkit tests green`'s `verdict` (Task 1) | DELETE | the mapping is arithmetic over `fixable`, which the report now carries |
| `bkit-build-plan-verify.md` § Process 9 — the plan tick edit | `bkit tasks tick` (Task 2) | DELETE | Success Criterion 2: no subagent edits the plan; the tick is a line-addressed write |
| `bkit-build-plan-verify.md` § Process 6-7 — the task ↔ `DONE` log cross-reference | `bkit tasks open` (Task 3) | DELETE | a set difference over the group's tasks and the log's lines, which the engine reads with `parsePlanBlocks` |
| `bkit-build-plan-current.md` § Process 5-7 — the changed-path list, the `-S` needle search and the per-path diff read | `bkit tasks currency` (Task 4) | DELETE | path and needle matching against a base commit is mechanical; the `Executable` / `Reword` / `Broken` call stays |
| `bkit-plan-scope-check.md` § Process 9 — matrix ↔ runbook coverage | `bkit tests plan-check` `matrix` problems (Task 5) | DELETE | Success Criterion 3 makes it a gate, and a gate is the engine's |
| `bkit-plan-scope-check.md` § Process 11 — supersession inventory presence | `bkit tests plan-check` `supersession` problems (Task 5) | DELETE | same: a `DELETE` with no `Supersession Inventory` row is a fact, not a judgement |
| `bkit-ship-deferred-sweep.md` § Process 8 — the disabled-test diff scan | `bkit branches scan-diff --disabled-tests` (Task 6) | DELETE | Success Criterion 4 makes the verb the only place the list lives; the sweep keeps the verdict it decides from the list |
| `bkit-ship-deferred-sweep.md` § Process 9-11 — the deferral reason tests and the `unjustified` row write | `bkit ledgers triage` (Task 7) | DELETE | Success Criterion 5 names the verb; the sweep keeps deliverable verification (Process 7) |
| `bkit-ship-update-docs.md` § Process 7 — the `docs/deferrals.jsonl` grep | `bkit context ledger-scan` (Task 8) | DELETE | the ledger scan is a shipped verb with a clamp and an artifact; a raw grep has neither |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.bkit/prompts.md` (source) | The Plan Phase and Build Phase / Ship Phase tables stay name-for-name (no prompt added or removed); record the changed scope of `bkit-build-plan-verify` (no plan write; `tasks: 1, 2` header line), `bkit-build-plan-current` (no diff search), `bkit-ship-deferred-sweep` (no diff scan, no reason tests, no ledger write), `bkit-ship-update-docs` (Pending Items from the scan artifact) and `bkit-plan-scope-check` (two checks dropped) — one row per prompt whose scope line changes, and nothing else |
| `.bkit/prompts.md` (mirror) | Regenerated by `bkit install` from the source above; `bkit check` must stay drift-clean |
| `.bkit/core/.bkit/workflows.md` (source) | § `/bkit-build` — 15 steps: the Step 6 row's handover set difference and the Step 7 row's tick now name `bkit tasks open` / `bkit tasks tick` and the verify header's task numbers; § `/bkit-ship` — 14 steps: the Step 5 row names `scan-diff --disabled-tests` and `ledgers triage`, the Step 6 row names the `ledger-scan` artifact. `.bkit/core/engine/audits/workflows/catalog-parity.test.ts` reads these rows, so the index and the workflow move together |
| `.bkit/workflows.md` (mirror) | Regenerated by `bkit install` from the source above |
| `.bkit/instructions.md` | § Clauses `plan-scenario-detail`: the `Task` column as the matrix's mapping carrier; every `text` block this change retires moves to a `retired` block, then `pnpm instructions:sync` rewrites the copies. The per-file prompt sections for `bkit-build-plan-verify` (`[R72]` and neighbours) and `bkit-ship-deferred-sweep` lose the lines this change deletes, regenerated by the same sync — `.bkit/core/engine/tools/instructions.test.ts` is the guard |
| `.bkit/core/docs/templates/bkit-plan.md` (source) + `docs/templates/bkit-plan.md` (mirror) | § Derived Test Matrix: the `Task` column and its one-sentence rule; the mirror is regenerated by `bkit install` |
| `docs/testing.md` | § Key test files: add rows for `.bkit/core/engine/commands/workflow/tasks.test.ts` (Unit — `bkit tasks tick / open / currency`), `.bkit/core/engine/commands/workflow/plan-blocks.test.ts` (Unit — the `Derived Test Matrix`, `Supersession Inventory` and `Out of Scope` readers) and `.bkit/core/engine/commands/workflow/challenge.test.ts` (Unit — the merge writes a matrix row per appended task), and extend the existing rows for `tests.test.ts` (`green`'s `verdict` / `fixable` / `logLine` and the added-lines-only gap; `plan-check`'s `matrix` / `supersession` problems), `branches.test.ts` (`scan-diff --disabled-tests`) and `ledgers.test.ts` (`triage`'s buckets and its minted-`ts` row). § Test first is unchanged |
| `.bkit/pipeline.md` | The pipeline description of `bkit-build-plan-verify` still reads "critic — the group's own diff; tick only on confirmed artifacts" and "ticks boxes only on confirmed artifacts"; after Success Criterion 2 the verifier writes no plan and passes the satisfied numbers, so those two sentences are rewritten (precedent: `#656` updated `pipeline.md` for an agent-scope change) |
| `docs/capabilities.md` | Regenerated by `pnpm graph:refresh` (the register is built off live source and CI's push-side `graph:check` fails when it differs); no capability rule is added unless the refresh shows the new command file inside an existing rule's scope |
| `docs/knowledge.jsonl` | One row: a plan's `Derived Test Matrix` needs a `Task` column because two plans can share a target test file, so a file key cannot map a row to a task — the reason the format carries the mapping |
| `docs/decisions.jsonl` | Rows `701-tasks-command-noun`, `701-green-always-prints-verdict`, `701-tick-narrows-by-tasks`, `701-matrix-task-column` (each carried; the last two gain a same-`key` refinement row), `701-verify-header-rollup`, `701-no-red-exemption-kept-in-prompt`, `701-added-lines-only-gap-kind`, `701-currency-against` — written by this plan |
| `docs/deferrals.jsonl` | Rows `701-design-workflow-reviewer-audit`, `701-sweep-deliverable-verification-stays-in-prompt`, `701-plan-current-classification-stays-in-prompt`, `701-verify-diff-reads-stay-in-prompt` — written by this plan |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | no database |
| **Code** | `git revert {COMMIT}` | the engine edits, the prompt / workflow edits, the template and the committed `dist/` revert together; a consumer's installed mirrors roll back on the next `bkit upgrade` from the reverted package |
| **Risk window** | none pre-merge | no migration and no deploy in this repo; the only ordering constraint is that `dist/` ships with its source in the same commit, so a revert cannot leave a stale CLI |

Code-only — `git revert` sufficient. The one non-code residue: a plan that gained a `Task` column keeps it (harmless when the reverted `plan-check` ignores the column), and the `docs/deferrals.jsonl` row `701-design-workflow-reviewer-audit` stays OPEN as a deferral — a revert does not delete a ledger row.

## Agent Execution Runbook

Build order: the engine commands first (Groups 1-4), then the ship-side deferral rules (Group 5), then the producers, docs, indexes and mirrors (Group 6). Tasks 1, 2, 5 and 6 are independent; Tasks 3 and 4 depend on the `tasks` noun from Task 2; Task 9 depends on Task 5. Groups 1-4 split so no group holds more than 15 `TEST FIRST` tests: Group 1 (`green`'s verdict and gaps), Group 2 (the `tasks` noun, the tick and `open`), Group 3 (`currency`), Group 4 (the plan's matrix, the ship diff and the producers). **Integration shape (advice only, never a gate):** one PR for all 11 tasks is fine; the natural split is Groups 1-4 (the engine commands and the plan format), Group 5 (the ship-side sweep), then Group 6 (producers, docs, mirrors) — no merge method is implied.

<!-- bkit:group 1 start -->

### GROUP 1: `tests green` emits the test-first verdict, a `fixable` per gap and the gap log lines

<!-- bkit:task 1 start -->

- [x] **TASK 1:** `tests green` emits `verdict`, a `fixable` per gap and the gap log lines
  - **UPDATE:** `green` in `.bkit/core/engine/commands/workflow/tests.ts`: emit `verdict` (`PASS` no gaps · `FAIL` any gap unfixable · `CONCERNS` otherwise · `null` when any gap needs a diff read) plus `fixable` and `logLine` on each gap, carried into `writeAuditReport` too; `fixable: null` for `delete-still-referenced`, `test-changed`, `red-mismatch` and the row state `Changed since red = added lines only`; emit the `test-changed` gap the added-lines-only row does not produce today
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: drop the kind→`Fixable` table and the verdict mapping from Process 8 and 10; keep the four diff reads, the `no-red` "work already landed" override, the `Enforced: false` and `Late-red check` bullets, and the `— Fixable: false` log contract; Process 4 substitutes the verifier's decided `Fixable` where the engine printed `null`; the header `Verdict:` is the post-judgement roll-up and the header gains the `Tasks:` line with the empty form `Tasks: none`
  - **READ:** `.bkit/core/engine/commands/workflow/plan-blocks.ts`: the parsed task / gap shapes the audit reads
  - **READ:** `.bkit/instructions.md`: § Clauses and the `bkit-build-plan-verify` per-file section, before editing prose (`pnpm instructions:show --file bkit-build-plan-verify.md`)
  - **DONE WHEN:** `bkit tests green` on a fixture with a `not-green`, a `no-red` and a `test-changed` gap prints `verdict: null` and `fixable` `true`, `false`, `null` in that order (the issue's own fixture, corrected per `Open Questions` row 5); a fixture whose red's test gained added lines only prints one `test-changed` gap with `fixable: null` and exits 1; the same report file carries `verdict` and each gap's `fixable` / `logLine`; `bkit-build-plan-verify.md` holds no kind→`Fixable` table row and no verdict-mapping line (its `— Fixable: false` log contract, its `Enforced: false` / `Late-red check` bullets, its `no-red` override and the four diff reads stay); `pnpm instructions:sync` leaves `instructions.test.ts` green
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green prints a verdict and a fixable per gap` fails while the emitted payload carries no `verdict` and no gap `fixable`
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green verdict is FAIL when a gap is unfixable` fails while a `no-red` gap alone still prints `CONCERNS`
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green leaves a diff-reading kind fixable null` fails while a `test-changed` gap prints `fixable: false`
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green with no gaps prints verdict PASS and an empty gaps` fails while a clean audit prints no `verdict`
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green prints verdict null when a gap needs a diff read` fails while a plan whose only gap is `test-changed` prints a decided `verdict`
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green emits a test-changed gap for a red whose test gained added lines only` fails while that row produces no gap and `green` exits 0

<!-- bkit:task 1 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### GROUP 2: The plan tick, the group handover and the `tasks` noun come from the engine

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Create the `tasks` noun with `tick`, and wire the verifier, the tick and the holistic pass to it
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

- [x] **TASK 3:** `tasks open` — the group's tasks with no `DONE` / `BLOCKED` line
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

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### GROUP 3: `tasks currency` replaces plan-current's path and symbol search

<!-- bkit:task 4 start -->

- [x] **TASK 4:** `tasks currency` — plan-current's path and symbol match
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

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### GROUP 4: The plan's matrix, the ship diff and the producers they touch become engine checks

<!-- bkit:task 5 start -->

- [x] **TASK 5:** `tests plan-check` refuses an unmapped matrix row and a `DELETE` with no Supersession row
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

- [x] **TASK 6:** `branches scan-diff --disabled-tests`
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

<!-- bkit:group 4 end -->

<!-- bkit:group 5 start -->

### GROUP 5: The sweep's deferral rules move to the engine

<!-- bkit:task 7 start -->

- [x] **TASK 7:** `ledgers triage`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.ts`: add the `triage` verb — read the FID's `docs/deferrals.jsonl` rows, apply the closed-enum reason tests from `.bkit/jsonl.md`, print each row's bucket (`Exempt` / `Lazy`) and result, and write the `unjustified` / `TRIAGED` rows with a minted `ts` through the existing append path
  - **UPDATE:** `.bkit/core/engine/commands/workflow/plan-blocks.ts`: add `outOfScope` beside `reuseInventory`, so the fourth reason test reads the plan's own `Out of Scope` rows rather than a second parser
  - **UPDATE:** `.bkit/core/prompts/bkit-ship-deferred-sweep.md`: Process 9-11 read the verb; Process 7 (deliverable verification, and the `unjustified` / `TRIAGED` row it writes for an unmet deliverable) stays
  - **READ:** `.bkit/core/engine/ledgers/telemetry.ts`: `DEFERRAL_REASONS` and `UNJUSTIFIED_REASON`, the enum `triage` imports, and the four tests documented beside them
  - **READ:** `.bkit/jsonl.md`: § Deferral Reason — the four tests and the `low-severity` exemption the verb implements
  - **READ:** `.bkit/core/engine/commands/workflow/plan-blocks.ts`: `reuseInventory` and the new `outOfScope` the reason tests 2 and 4 read
  - **DONE WHEN:** `bkit ledgers triage --fid= --plan=` prints each deferral row's bucket and reason-test result, writes a same-`key` `unjustified` / `TRIAGED` row with a minted `ts` for a row whose reason does not hold, writes nothing for a `low-severity` `LOW` row, writes nothing when the FID has no row, and reports nothing for another feature's rows; the sweep prompt names no reason test and its reason-adjudication rows are written by the verb (Process 7's deliverable rows stay its own)
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage keeps a low-severity deferral exempt` fails while the row is bucketed `Lazy`
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage marks an unjustified deferral lazy` fails while the row stays `Exempt`
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage writes an unjustified row with a minted ts` fails while the row is missing
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage ignores another feature's deferral rows` fails while another FID's row is bucketed and written
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage writes nothing when the FID has no deferral row` fails while it exits non-zero or writes a row for an empty set
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage marks a scope-declared row whose only declaration is itself lazy` fails while a row that is its own only out-of-scope declaration stays `Exempt`
    - `.bkit/core/engine/commands/workflow/plan-blocks.test.ts` `outOfScope returns the plan's Out of Scope rows` fails while the reader returns nothing for a plan that declares them
    - `.bkit/core/engine/commands/workflow/plan-blocks.test.ts` `plan-blocks readers stop at the next heading of the same or a higher level` fails while a table under a later heading of the same level is read as the section's

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [x] **TASK 8:** `ship-update-docs` `Pending Items` from the engine
  - **UPDATE:** `.bkit/core/prompts/bkit-ship-update-docs.md`: drop Process 7 (the `docs/deferrals.jsonl` grep); `Pending Items` is filled from the passed scan artifact
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: Step 6 runs `context ledger-scan --terms='{FID}' --source=docs/deferrals.jsonl --artifact="{OUTBOX}/ship-pending-items.md" --fid={FID} --step=ship-update-docs --reset-log` and lists that artifact in the subagent's `Read:`
  - **READ:** `.bkit/core/engine/commands/workflow/context.ts`: `ledger-scan`'s required flags (`--terms`, `--source`, `--artifact`), its clamp and its keep-cap, so the step's call is complete and the FID term's over-match is accepted (the scan's truncation notice is what `Pending Items` tolerates)
  - **DONE WHEN:** the `ship-update-docs` prompt names no `docs/deferrals.jsonl` grep and names the artifact its `Pending Items` comes from; the ship workflow's Step 6 call carries `--terms`, `--source`, `--artifact` and `--reset-log`, and lists the artifact in the subagent's `Read:`; `pnpm vitest run .bkit/core/engine/audits/workflows/workflow-shape.test.ts` is green
  - **TEST FIRST:** n/a — prompt and workflow text only, no behaviour

<!-- bkit:task 8 end -->

<!-- bkit:group 5 end -->

<!-- bkit:group 6 start -->

### GROUP 6: Producers, docs, indexes and mirrors

<!-- bkit:task 9 start -->

- [x] **TASK 9:** The plan format teaches the producers: the clause and its carriers
  - **UPDATE:** `.bkit/instructions.md`: the `plan-scenario-detail` clause gains the `Task` column as the mapping carrier, the retired wording moves to a `retired` block, then `pnpm instructions:sync` rewrites the carriers
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-convert.md`: the Contract's plan shape gains the `Task` column, so a converted plan passes `plan-check` on its re-run
  - **READ:** `.bkit/instructions.md`: § Clauses `plan-scenario-detail` and the `carriers:` rule (`pnpm instructions:show --file bkit-plan-generate.md` first)
  - **READ:** `.bkit/core/engine/tools/instructions.test.ts`: what the clause guard asserts
  - **DEPENDS ON:** 5
  - **DONE WHEN:** the clause names the column and every one of its carrier prompts carries the new sentence after `pnpm instructions:sync`, and `convert`'s Contract names the column (the template's own `Task` column landed in Task 5); `pnpm vitest run .bkit/core/engine/tools/instructions.test.ts .bkit/core/engine/audits/repo/dogfood-templates.test.ts .bkit/core/engine/audits/templates/template-shape.test.ts` is green
  - **TEST FIRST:** n/a — clause and prompt prose; the guards are existing tests, named in `DONE WHEN`

<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->

- [x] **TASK 10:** Sync the docs the change touches
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: the changed scope of `bkit-build-plan-verify`, `bkit-build-plan-current`, `bkit-ship-deferred-sweep`, `bkit-ship-update-docs` and `bkit-plan-scope-check`; no name, effort, model or `maxTurns` moves
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: § `/bkit-build` — 15 steps (Steps 3 and 5's matrix route and Fix-now row, Step 6's handover check, Steps 7 and 9's tick), § `/bkit-ship` — 14 steps (Step 5's two verbs, Step 6's scan artifact)
  - **UPDATE:** `docs/testing.md`: § Key test files — rows for `tasks.test.ts`, `plan-blocks.test.ts` and `challenge.test.ts`, and the extended rows for `tests.test.ts`, `branches.test.ts` and `ledgers.test.ts`
  - **UPDATE:** `.bkit/pipeline.md`: the two stale verifier sentences ("critic — the group's own diff; tick only on confirmed artifacts" and "ticks boxes only on confirmed artifacts") are rewritten, because the verifier writes no plan and passes the satisfied numbers
  - **UPDATE:** `docs/knowledge.jsonl`: the `Task`-column gotcha row
  - **DEPENDS ON:** 1, 2, 3, 4, 5, 6, 7, 8
  - **DONE WHEN:** the prompts index and the workflows index describe the changed steps and prompt scopes, `docs/testing.md` names `tasks.test.ts`, `plan-blocks.test.ts` and `challenge.test.ts` and the three extended files, `.bkit/pipeline.md`'s two verifier sentences are rewritten, and the knowledge row exists; `pnpm vitest run .bkit/core/engine/audits/workflows/catalog-parity.test.ts .bkit/core/engine/audits/workflows/models-table-parity.test.ts .bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts` is green
  - **TEST FIRST:** n/a — docs and indexes; the guards are existing tests, named in `DONE WHEN`

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [x] **TASK 11:** Refresh the capability register, the mirrors and `dist/`, then dogfood
  - **UPDATE:** `.bkit/prompts.md`: regenerated by `bkit install` from `.bkit/core/.bkit/prompts.md` — never hand-edited
  - **UPDATE:** `.bkit/workflows.md`: regenerated by `bkit install` from `.bkit/core/.bkit/workflows.md`
  - **UPDATE:** `docs/templates/bkit-plan.md`: regenerated by `bkit install` from `.bkit/core/docs/templates/bkit-plan.md`
  - **UPDATE:** `docs/capabilities.md`: regenerated by `pnpm graph:refresh`
  - **UPDATE:** `dist/cli.js`: regenerated by `pnpm build` (this repo commits its CLI)
  - **DEPENDS ON:** 9, 10
  - **DONE WHEN:** `bkit install` regenerates the `.claude/`, `.cursor/` and `.opencode/` mirrors of the changed prompts / workflows / template and leaves `bkit check` drift-clean; `pnpm graph:refresh` leaves the register unchanged or updated in the same commit; `pnpm build` regenerates `dist/cli.js` and `pnpm bkit:check:dist` is clean; a fresh scratch consumer run of `node dist/cli.js tasks --help`, `node dist/cli.js branches scan-diff --help` and `node dist/cli.js ledgers --help` lists the new verbs and flags; `pnpm bkit:gate:static-unit-integration` and `pnpm vitest run` (full, never scoped) are green
  - **TEST FIRST:** n/a — install and build regeneration of generated artifacts; no behaviour of its own

<!-- bkit:task 11 end -->

<!-- bkit:group 6 end -->

<!-- bkit:group 7 start -->

### GROUP 7: Challenge round 1 findings

<!-- bkit:task 12 start -->

- [x] **TASK 12:** `ledgers triage` adjudicates a genuine `own-cycle` ("new architecture") deferral as `unjustified` and appends a permanent wrong verdict — `.bkit/jsonl.md` test 1 requires "not a new architecture", and no predicate implements it nor excludes `own-cycle`
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1724` · **Round:** 1
  - **DONE WHEN:** a `reason: "own-cycle"` deferral is bucketed `Exempt` (or fails `bounded-remediation`) whatever its `remediation` names, and no `unjustified` row is written for it; a test pins it
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage keeps an own-cycle deferral exempt` fails on today's code: the row buckets `Lazy`, `written` = 1, and a second row appears in `docs/deferrals.jsonl`

<!-- bkit:task 12 end -->
<!-- bkit:task 13 start -->

- [x] **TASK 13:** `scan-diff --disabled-tests` reports every removed line of a test file that matches `ASSERTION` (`expect|assert\w*|should|should_\w+`), so deleting a comment, an import line or an assertion moved elsewhere sets exit 1 and the sweep records a `Blocking Deferral` + `Verdict: FAIL`
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:1084` · **Round:** 1
  - **DONE WHEN:** a removed line that is a comment, a non-assertion statement or an assertion re-added elsewhere in the same diff is not reported; a removed assertion call (a net drop in the file) still is; the sweep's `disabled` list and exit code follow
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff ignores a removed comment in a test file` fails today: exit 1 with `disabled: [{file: "a.test.ts", line: 4, test: "adds"}]` for a deleted `// should not be reached` line
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff ignores an assertion moved within the file` fails today: the removed half of a move is reported

<!-- bkit:task 13 end -->
<!-- bkit:task 14 start -->

- [x] **TASK 14:** `scan-diff --disabled-tests` misses Python's skipped tests — `@pytest.mark.skip` and `@unittest.skip` match no marker, so a run that disables Python tests exits 0 with `disabled: []` and the ship gate passes
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:1074` · **Round:** 1
  - **DONE WHEN:** an added `@pytest.mark.skip` / `@unittest.skip` / bare `.skip(` line in a `test_*.py` or `*.test.*` file is reported with its line and test name and exits 1, while `TEST_FILE`'s existing Python class still applies
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff finds an added pytest mark skip` fails today: a diff adding `@pytest.mark.skip(reason="flaky")` above `def test_a` exits 0 with an empty `disabled`
  - **TEST EXCEPTION:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff finds an added pytest mark skip` fails on a diff that adds `@pytest.mark.skip(reason="flaky")` above `def test_a`, which exits 0 with an empty `disabled` — accepted by owner: "accept" (owner, 2026-10-28)

<!-- bkit:task 14 end -->
<!-- bkit:group 7 end -->

<!-- bkit:group 8 start -->

### GROUP 8: Plan matrix repair

<!-- bkit:task 19 start -->

- [x] **TASK 19:** Add the `Derived Test Matrix` rows tasks 12-18 are missing, so the plan passes its own `matrix` check
  - **UPDATE:** `docs/plans/202610/701-engine-work-build-plan.md`: one `Derived Test Matrix` row per `TEST FIRST` test of tasks 12-18, each `Task` cell naming its task
  - **DONE WHEN:** `node dist/cli.js tests plan-check --plan=docs/plans/202610/701-engine-work-build-plan.md` (this worktree's build) exits 0 with no `matrix` problem, and each new row's `Test description` / `Type` / `Target file` / `Task` cells match the test it names
  - **TEST FIRST:** n/a — plan table text repair; `tests plan-check` is the check

<!-- bkit:task 19 end -->

<!-- bkit:group 8 end -->

<!-- bkit:group 9 start -->

### GROUP 9: Challenge round 1 findings

<!-- bkit:task 15 start -->

- [x] **TASK 15:** Build Steps 7 and 9 pass the verify header's documented empty form `Tasks: none` straight into `--tasks=`, which `tick` refuses with exit 2 — every verify round that satisfies no task logs a usage error and ticks nothing
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tasks.ts:74` · **Round:** 1
  - **DONE WHEN:** `--tasks=none` is accepted as "no task" (exit 0, `ticked: []`, file untouched), or both calls in `.bkit/core/workflows/bkit-build.md:522` and `:648` drop the flag when `{VERIFIED_TASKS}` is `none`; the verb's `--help` states which
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick treats the header's none as nothing to tick` fails today: `--tasks=none` exits 2 with `--tasks must name positive task numbers, got "none"`

<!-- bkit:task 15 end -->
<!-- bkit:task 16 start -->

- [x] **TASK 16:** `ledgers triage` re-adjudicates a `status: "CLOSED"` deferral (work already finished) and appends `reason: "unjustified"` / `status: "TRIAGED"`, moving finished work back onto the triage ladder and adding an unjustified count to `computeDeferralDiscipline`
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1715` · **Round:** 1
  - **DONE WHEN:** a folded row whose `status` is `CLOSED` buckets `Exempt`, prints no test result and writes nothing; the concurrent-`OPEN` case keeps today's behaviour
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage writes no row for a closed deferral` fails today: the `CLOSED` fixture gets a second row and `written` = 1

<!-- bkit:task 16 end -->
<!-- bkit:task 17 start -->

- [x] **TASK 17:** A deferral already adjudicated `unjustified` is bucketed `Exempt` on every later run, so the ship sweep records an outstanding unjustified deferral under `Exempt Deferrals` and the summary reports it as settled
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1718` · **Round:** 1
  - **DONE WHEN:** a folded row whose `reason` is `unjustified` reports a bucket that keeps it out of the sweep's `Exempt Deferrals` (its own label or `Lazy`) and still writes no new row; re-running triage twice leaves the report stable
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage reports an adjudicated unjustified row outside exempt` fails today: the second run prints `Exempt` for a row `reason: "unjustified"`

<!-- bkit:task 17 end -->
<!-- bkit:group 9 end -->

<!-- bkit:group 10 start -->

### GROUP 10: Challenge round 1 findings

<!-- bkit:task 18 start -->

- [x] **TASK 18:** `ledgers triage` reads the plan's task surfaces without checking `parsePlanBlocks`' errors, so a plan with no task blocks silently buckets every deferral `Exempt` (exit 0, no warning) — the one plan reader that neither refuses nor warns
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1701` · **Round:** 1
  - **DONE WHEN:** a plan with no task blocks exits 1 naming `NO_MARKERS_REASON`, and a plan whose blocks do not parse exits 2 naming the line — as `tasks tick|open|currency` already do — with no rows written
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage refuses a plan with no task blocks` fails today: exit 0 with `rows: [{bucket: "Exempt"}]` and no message

<!-- bkit:task 18 end -->
<!-- bkit:group 10 end -->

<!-- bkit:group 11 start -->

### GROUP 11: Challenge round 2 findings

<!-- bkit:task 20 start -->

- [x] **TASK 20:** `scan-diff --disabled-tests` matches its disable markers on every added line of every file, so any prose that quotes `test.skip` / `describe.skip` / `@Disabled` / `t.Skip(` / `xfail` — a skill doc, `docs/knowledge.jsonl`, `docs/testing.md`, the marker's own regex literal in `branches.ts` — is reported as a disabled test, and the ship sweep turns that `disabled` list into Blocking Deferrals + `Verdict: FAIL`; this branch's own diff already exits 1 with 18 hits (`.agents/skills/vitest/references/core-describe.md:60`, `docs/knowledge.jsonl:321`, `.bkit/core/engine/commands/workflow/branches.ts:1080`, its `dist/` copy, …)
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:1090` · **Round:** 2
  - **DONE WHEN:** `node dist/cli.js branches scan-diff --disabled-tests --base=origin/dev` on this branch exits 0 with `disabled: []` — its only marker-shaped added lines are quoted prose under `.agents/skills/**` and `docs/*`, the engine's own marker literals in `branches.ts` / `dist/`, and `branches.test.ts`'s `'@pytest.mark.skip(…)'` fixture strings; an added `test.skip(` / `@pytest.mark.skip` / `@Disabled` **call** in a `*.test.*` / `*.spec.*` / `test_*.py` file still exits 1 naming `file:line` and the test — `markersFor` scopes the marker set to test files and the added-line check skips a marker inside a comment or a quoted span, instead of handing `DISABLED_MARKERS` to every path
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff ignores a quoted skip in a documentation file` fails on today's code: a branch that adds `docs/guide.md` holding "never call \`test.skip\` in a spec; a \`describe.skip\` hides regressions" exits 1 with `disabled: [{file: "docs/guide.md", line: 3, test: "Never call \`test.skip\` …"}]`
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff ignores a marker literal in a non-test source file` fails on today's code: adding the line `/@Disabled\b/,` to a `.ts` source file exits 1 with that line's text as the test name

<!-- bkit:task 20 end -->
<!-- bkit:task 21 start -->

- [x] **TASK 21:** `scan-diff --disabled-tests` reports a test file whose assertion **changed** as a disabled test — the re-add check compares each removed line's exact trimmed text against the added lines, not the file's assertion count — so the round-1 comment/import/move fix still fires on any edited expectation or matcher, and the sweep records a Blocking Deferral for a test that is intact; this branch's own diff carries two such hits (`.bkit/core/engine/commands/workflow/tests.test.ts:1769` from `{ enforced: true, gaps: [] }` → `{ …, verdict: "PASS" }`, and `:2065` from `toEqual([])` → `toEqual([objectContaining(…)])`)
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:1194` · **Round:** 2
  - **DONE WHEN:** a diff that rewrites one assertion's expected value or matcher inside a test body exits 0 with `disabled: []`; a diff that drops one assertion and adds a different one to the same test still exits 0; a diff whose removed assertion count exceeds its added assertion count in that file exits 1 naming the file, line and test (a net drop, as `Task 13`'s `DONE WHEN` words it); the repo's own `tests.test.ts` diff yields no hit
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff ignores an assertion whose expectation changed` fails on today's code: `expect(1).toBe(1)` → `expect(1).toBe(2)` exits 1 with `disabled: [{file: "src/a.test.ts", line: 2, test: "a"}]`
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff ignores an assertion replaced by another in the same test` fails on today's code: `expect(a).toEqual([])` → `expect(a).toEqual([expect.objectContaining({})])` exits 1

<!-- bkit:task 21 end -->
<!-- bkit:task 22 start -->

- [x] **TASK 22:** `scan-diff --disabled-tests` cannot see a **deleted** test file — git writes `+++ /dev/null` for a deletion, the loop overwrites `file` with that path, `TEST_FILE` no longer matches and no removed assertion is recorded — so a diff that removes an entire `*.test.*` file (every test and assertion in it) exits 0 with `disabled: []` and the ship gate passes the strongest form of test removal
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:1170` · **Round:** 2
  - **DONE WHEN:** the diff walk keeps the `--- a/{path}` token and uses it when `+++` is `/dev/null`, so a deleted test file reports its removed assertions (naming the file, its line and the nearest declaration) and exits 1, while an added file still resolves its `+++` path and an ordinary edit is unchanged
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff reports a deleted test file` fails on today's code: `git rm src/a.test.ts` (3 lines, one `it` with one `expect`) on a feature branch exits 0 with `disabled: []`, `found: false`

<!-- bkit:task 22 end -->
<!-- bkit:group 11 end -->

<!-- bkit:group 12 start -->

### GROUP 12: Challenge round 2 findings

<!-- bkit:task 23 start -->

- [ ] **TASK 23:** `scan-diff --disabled-tests` tallies re-added assertion lines across the whole diff, not per file, so deleting `expect(2).toBe(2);` from `src/a.test.ts` and adding the identical trimmed line in any other file (verified with `src/notes.md`) exits 0 with `disabled: []` — the ship gate passes with a dropped assertion, against task 13's own `DONE WHEN` ("a net drop in the file" still reported)
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:1185` · **Round:** 2
  - **DONE WHEN:** the `readded` tally is scoped so a line added in a different file (test or not) never cancels a removal in the test file — per-file keying, or counting re-adds from test files only; the cross-file fixture exits 1 naming the dropped assertion, and `scan-diff ignores an assertion moved within the file` plus `scan-diff still reports a removed assertion` stay green
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff reports an assertion re-added only outside the test file` fails on the masking: a diff removing `expect(2).toBe(2);` from `src/a.test.ts` while adding the identical trimmed line in `src/notes.md` exits 0 with `disabled: []`

<!-- bkit:task 23 end -->
<!-- bkit:group 12 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on / no gate-weakening:** every `[NEW]` traces to a `Reuse Inventory` `NEW` row; every `EXTEND` landed in its named artifact; no gate weakened.
- [ ] **Every task has a test or a TEST EXCEPTION:** every planned test recorded a red before its code and is unchanged since; test-order gaps cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 - Verified:** every box above checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test sits in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests fixed; full suite green.
- [ ] **Sweep new tests:** every task's `DONE WHEN` tests exist and pass.
- [ ] **Verify observability:** errors logged and traced per `docs/observability.md`.
- [ ] **Update documentation:** affected docs rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row done; `.agents/docs.md` accurate.
- [ ] **Gate 3 - Verified:** every box above checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** `pnpm bkit:gate:static-unit-integration` (which includes `slop:delta`) and `bkit check` pass.
- [ ] **Test Synchronization:** `conventions.test.ts` (the new source is registered and tested), `catalog-parity.test.ts` + `workflow-shape.test.ts` (the build / ship step bodies moved, including Step 3 / 5 / 7 / 9), `instructions.test.ts` (a synced clause), `dogfood-templates.test.ts` + `template-shape.test.ts` (the template's new column), `verdict-vocabulary.test.ts` and `models-table-parity.test.ts` (no prompt name, verdict line or step key moved), `ledger-integrity.test.ts` (the rows this plan writes), `challenge.test.ts` and `plan-blocks.test.ts` (the merge writes a matrix row; the new readers), and the existing `tests.test.ts` fixtures the new `matrix` kind touches (the check is a no-op on a plan with no `Derived Test Matrix`, so a matrix-less fixture stays green).
- [ ] **Build Configuration:** no new test-only config; `tasks.test.ts` sits beside its source under `.bkit/core/engine/commands/workflow/` and stays out of the production build as today.
- [ ] **Unit (`.bkit/core/engine/commands/workflow/tests.test.ts`, `tasks.test.ts`, `branches.test.ts`, `ledgers.test.ts`, `challenge.test.ts`, `plan-blocks.test.ts`, `conventions.test.ts`):** the 60 `Derived Test Matrix` rows — `green`'s `verdict` / `fixable` / `logLine` and its added-lines-only gap, `tick` / `open` / `currency` on real temp plan files and temp git repos (including the group-required tick, the header's `none` and `currency`'s `--against`), `plan-check`'s `matrix` / `supersession` problems with an accepting control and the no-matrix no-op, `scan-diff --disabled-tests` on real temp git repos (an added `.skip` / `@pytest.mark.skip`, a removed comment or an assertion moved within the file), `ledgers triage` writing a real row through `append` (its `own-cycle`, `CLOSED` and adjudicated `unjustified` buckets, and its refusal of a plan with no task blocks), the `challenge` merge append, and the three `plan-blocks.ts` readers.
- [ ] **Apply local migrations:** N/A — no database.
- [ ] **Run all tests:** `pnpm vitest run` (full, never scoped) passes.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 - Verified:** every Automated Tests box checked, with proof (test output, CLI result, API response).

### 👤 Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks — advisory only.** An unticked box blocks nothing: not the merge, not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** `pnpm build`, then in a fresh scratch consumer (a plan copied in from this repo) run `node dist/cli.js tasks open --plan=… --group=1 --log=…`, `node dist/cli.js tests plan-check --plan=… --existence=refuse --log=/tmp/pc.md` and `node dist/cli.js tasks tick --plan=… --group=1 --tasks=1`; confirm the plan's other lines are byte-identical after the tick.
- [ ] **Step 2:** In a scratch git repo, add an `.skip` to a test file on a branch, then run `node dist/cli.js branches scan-diff --disabled-tests --base=<the branch point>`; confirm exit 1 with `file:line` and the test name, and exit 0 after the same `.skip` is committed before the base.
- [ ] **Step 3:** On a plan whose `Derived Test Matrix` row names no task, run `node dist/cli.js tests plan-check --plan=… --existence=report --log=/tmp/pc2.md`; confirm exit 1 and that the report names the row and the task that has no row.
