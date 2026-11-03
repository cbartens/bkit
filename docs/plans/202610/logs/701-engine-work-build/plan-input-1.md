## Session Prompt — this run's, newer than everything below

#701

## Issue description — oldest

### Problem

#676 — Orchestrator work the engine could do as bkit commands — https://github.com/cbartens/bkit/issues/676 audited the six workflow files for prose the orchestrator parses by hand. It did not audit the **subagent prompts**. Those hold the same class of work: lookup tables, set comparisons, arithmetic and file writes where the engine already holds the data. The rule is the one #663 settled — a fact with one right answer is the engine's; judgement is the agent's.

Two agents carry most of it:

<!-- prettier-ignore -->
| Agent | Turns | Mechanical work inside it |
| --- | --- | --- |
| `bkit-build-plan-verify` | 100, once per group + once holistic | test-first gap → `Fixable` mapping, verdict arithmetic, task tick, task ↔ `DONE` log cross-reference, matrix ↔ runbook coverage |
| `bkit-ship-deferred-sweep` | 200, once per ship | disabled-test diff scan, deferral reason tests, bucket verdict |

`bkit-build-plan-current` (50 turns) also spends its steps 5-7 on search the engine can do.

This is measured from the prompts, not estimated. `bkit-build-plan-verify.md:67-82` is an 11-row kind→`Fixable` table plus a three-line verdict mapping, run on every group. `bkit-ship-deferred-sweep.md:69` is a disabled-test diff scan that decides the ship gate.

### Narrative

A bkit maintainer wants the build and ship subagents to stop re-deriving facts the engine already holds. After this, the verifier and the deferred sweep decide only what needs judgement, and the engine computes the verdicts, ticks the plan, matches plan tasks to landed changes, scans the diff for disabled tests and writes the deferral rows.

### Success Criteria

- `bkit tests green` prints `verdict` and a `fixable` per gap; `bkit-build-plan-verify.md` names no kind→`Fixable` mapping and no verdict mapping.
- No subagent edits the plan to tick a task; `bkit tasks tick` does it.
- `bkit tests plan-check` exits 1 on a `Derived Test Matrix` row mapped to no task and on a `DELETE` with no `Supersession Inventory` row.
- `bkit branches scan-diff --disabled-tests` exits 1 on an added `.skip` / `@Disabled` / `t.Skip()` and is the only place the disabled-test list lives.
- `bkit ledgers triage` prints each deferral's bucket and writes the `unjustified` / `TRIAGED` rows; `bkit-ship-deferred-sweep.md` names no reason test.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| a gap kind needs a diff read (`test-changed`) | `tests green` prints `fixable: null` and `verdict: null`; the verifier classifies it |
| a plan has no task blocks | `tasks tick` / `open` / `currency` refuse, naming the plan-check reason |
| a task number named to `tick` sits in another group | `tick` exits 2 and names the task and its group |
| a `Derived Test Matrix` row maps to two tasks | `plan-check` exits 1, naming the row and both tasks |
| a `DELETE` has no `Supersession Inventory` row | `plan-check` exits 1, naming the missing row |
| the diff adds a `.skip` inside a planned test | `scan-diff --disabled-tests` exits 1 with `file:line` and the test name |
| a `.skip` predates `--base` | `scan-diff` ignores it |
| a deferral's `reason` is `low-severity` with `severity: LOW` | `ledgers triage` keeps it `Exempt` and writes no row |
| a deferral's `reason` does not hold at ship time | `ledgers triage` marks it `Lazy` and writes an `unjustified` / `TRIAGED` row with a minted `ts` |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `green` prints a verdict and a `fixable` per gap | unit | `.bkit/core/engine/commands/workflow/tests.test.ts` |
| `green` verdict is `FAIL` when a gap is unfixable | unit | `.bkit/core/engine/commands/workflow/tests.test.ts` |
| `green` leaves a diff-reading kind `fixable: null` | unit | `.bkit/core/engine/commands/workflow/tests.test.ts` |
| `tick` marks only the named tasks | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` |
| `tick` refuses a task in another group | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` |
| a new command source is registered | unit | `.bkit/core/engine/commands/conventions.test.ts` |
| `open` lists tasks with no done line | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` |
| `open` sets `handover` only when a task is open | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` |
| `currency` matches a task on a moved symbol | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` |
| `currency` emits no hunk outside the matched set | unit | `.bkit/core/engine/commands/workflow/tasks.test.ts` |
| `plan-check` refuses an unmapped matrix row | unit | `.bkit/core/engine/commands/workflow/tests.test.ts` |
| `plan-check` refuses a delete with no supersession row | unit | `.bkit/core/engine/commands/workflow/tests.test.ts` |
| `scan-diff` finds an added skip | unit | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| `scan-diff` ignores a skip predating the base | unit | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| `scan-diff` reports a disabled test with its line | unit | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| `ledgers triage` keeps a low-severity deferral exempt | unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` |
| `ledgers triage` marks an unjustified deferral lazy | unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` |
| `ledgers triage` writes an unjustified row with a minted ts | unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` |

### Tasks

<!-- bkit:group 1 start -->

### GROUP 1: The test-first verdict comes from the engine

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** `tests green` emits the verdict, a `fixable` per gap, and the gap-log lines
  - **UPDATE:** `green` in `.bkit/core/engine/commands/workflow/tests.ts`: emit `verdict` (`PASS` no gaps, `FAIL` any gap unfixable, `CONCERNS` otherwise, `null` when a gap needs a diff read) and `fixable` / `logLine` on each gap; `fixable: null` for `delete-still-referenced`, `test-changed`, `red-mismatch` and `Changed since red = added lines only`.
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: drop the kind→`Fixable` table and the verdict mapping from Process 8 and 10; keep the four diff reads.
  - **DONE WHEN:** `bkit tests green` on a fixture with one `not-green`, one `no-red` and one `test-changed` gap prints `verdict: null` and `fixable` false, false, null; `bkit-build-plan-verify.md` names no kind→`Fixable` mapping.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green emits a verdict and a fixable per gap` fails on `verdict` or `fixable` missing
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green verdict is FAIL when a gap is unfixable` fails on `verdict` not `FAIL`
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `green leaves a diff-reading kind fixable null` fails on `fixable` not `null`

<!-- bkit:task 1 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### GROUP 2: The `tasks` noun — the engine ticks, opens and matches plan tasks

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Create the `tasks` noun with `tick`
  - **CREATE:** `.bkit/core/engine/commands/workflow/tasks.ts`: the `tasks` command over a plan's task blocks — verbs `tick`, `open`, `currency`; this task lands the noun and `tick`.
  - **UPDATE:** `COMMANDS` in `.bkit/core/engine/commands/registry.ts`: register `tasksCommand`.
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: the verifier no longer edits the plan; it passes the satisfied task numbers.
  - **DONE WHEN:** `bkit tasks --help` lists `tick`; `bkit tasks tick --plan= --group= --tasks=` ticks exactly the named tasks and prints their numbers; the verify prompt names no plan tick edit.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick marks only the named tasks` fails on an unnamed task being ticked
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick refuses a task in another group` fails on exit 0
    - `.bkit/core/engine/commands/conventions.test.ts` `every command source is registered` fails on `tasks.ts` missing from `COMMANDS`

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** `tasks open` — the group's tasks with no `DONE` / `BLOCKED` line
  - **UPDATE:** `open` in `.bkit/core/engine/commands/workflow/tasks.ts`: print the group's tasks with neither line and `handover: true` when any exist.
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 6 sub-step 5 reads the verb instead of the prose set difference.
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: Process 6-7 drop the `DONE` log cross-reference.
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `bkit tasks open --plan= --group= --log=` prints the tasks with neither line and `handover: true` only when one is open; the build workflow's handover set difference is gone.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `open lists tasks with no done line` fails on a task with a `BLOCKED` line being listed
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `open sets handover only when a task is open` fails on `handover: true` with none

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** `tasks currency` — plan-current's path and symbol match
  - **UPDATE:** `currency` in `.bkit/core/engine/commands/workflow/tasks.ts`: per task print the matched paths and needles and the diff hunks for its `CREATE` / `READ` / `UPDATE` / `DELETE` fields against `--base`.
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-current.md`: drop Process 5-7's search; keep the `Executable` / `Reword` / `Broken` call.
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `bkit tasks currency --plan= --base=` prints each matched task with its matched paths and needles and the diff hunks; the plan-current prompt names no `git diff` search of its own.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `currency matches a task on a moved symbol` fails on the task not being listed
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `currency emits no hunk outside the matched set` fails on an unmatched path appearing

<!-- bkit:task 4 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### GROUP 3: The plan's matrix and the ship diff become engine checks

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** `tests plan-check` refuses an unmapped matrix row and a `DELETE` with no Supersession row
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests.ts`: add problem kinds `matrix` (a row with no task, a task with no row, a row mapped to more than one task) and `supersession` (a `DELETE` with no `Supersession Inventory` row).
  - **UPDATE:** `.bkit/core/prompts/bkit-plan-scope-check.md`: drop the two checks now engine-side.
  - **DONE WHEN:** `bkit tests plan-check` exits 1 on a plan with a `Derived Test Matrix` row mapped to no task and on a `DELETE` with no `Supersession Inventory` row, naming the line.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses an unmapped matrix row` fails on exit 0
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `plan-check refuses a delete with no supersession row` fails on exit 0

<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** `branches scan-diff --disabled-tests`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.ts`: `scan-diff` gains `--disabled-tests` — added lines only from `{base}...HEAD`, `docs/plans/**` excluded, matching `.skip` / `.todo` / `.fixme` / `xfail`, `t.Skip()`, `#[ignore]`, `@Disabled` and deleted assertions; exit 1 on any hit, printing `file:line` and the test name.
  - **UPDATE:** `.bkit/core/prompts/bkit-ship-deferred-sweep.md`: Process 8 reads the verb instead of scanning the diff.
  - **DONE WHEN:** `bkit branches scan-diff --disabled-tests --base=origin/dev` exits 1 on an added `.skip` and prints `file:line`; a `.skip` predating the base is ignored.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff finds an added skip` fails on exit 0
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff ignores a skip predating the base` fails on exit 1
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff reports a disabled test with its line` fails on the line missing

<!-- bkit:task 6 end -->

<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### GROUP 4: The sweep's deferral rules move to the engine

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** `ledgers triage`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.ts`: add the `triage` verb — read the FID's `docs/deferrals.jsonl` rows, apply the closed-enum reason tests from `.bkit/jsonl.md`, print each row's bucket (`Exempt` / `Lazy`) and result, and write the `unjustified` / `TRIAGED` rows with a minted `ts`.
  - **UPDATE:** `.bkit/core/prompts/bkit-ship-deferred-sweep.md`: Process 9-11 read the verb; Process 7 (deliverable verification) stays.
  - **DONE WHEN:** `bkit ledgers triage --fid= --plan=` prints each row's bucket and reason-test result and writes the `unjustified` / `TRIAGED` rows; the sweep prompt names no reason test.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage keeps a low-severity deferral exempt` fails on the row being lazy
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage marks an unjustified deferral lazy` fails on the row staying exempt
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `triage writes an unjustified row with a minted ts` fails on the row missing

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** `ship-update-docs` `Pending Items` from the engine
  - **UPDATE:** `.bkit/core/prompts/bkit-ship-update-docs.md`: drop Process 7 (the `docs/deferrals.jsonl` grep).
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: Step 6 runs `context ledger-scan --source=docs/deferrals.jsonl --terms={FID}` and passes the result.
  - **DONE WHEN:** the `ship-update-docs` prompt names no `docs/deferrals.jsonl` grep and the ship workflow passes the scan result.
  - **TEST FIRST:** n/a — prompt and workflow text only, no behaviour

<!-- bkit:task 8 end -->

<!-- bkit:group 4 end -->

### Open Questions & Assumptions

1. **Where do the plan-block verbs live?** Options: (a) a new `tasks` noun; (b) fold into `context` (`brief`, `diff`) and `tests`. **Recommended:** (a) — the plan-block verbs sit together and `context` keeps artifact work. **Default if unanswered:** (a). Assumption: a new noun is acceptable; if not, task 2 changes to a `context` verb and the rest follow.
2. **Does `tests green` always print `verdict`?** Options: (a) always; (b) behind `--verdict`. **Recommended:** (a) — the audit log is already machine-read. **Default if unanswered:** (a).
3. **Does `tick` tick the whole group or only `--tasks=`?** Options: (a) only the named tasks; (b) every task in the group with no gap, narrowed by `--tasks=`. **Recommended:** (b) as the default. **Default if unanswered:** (b).

### Breaking Changes & Naming

- New command noun `tasks`; no existing command changes name.
- `tests green` output gains `verdict`, `fixable` and `logLine` keys — additive, existing keys unchanged.
- `branches scan-diff` gains `--disabled-tests`; `ledgers` gains `triage` — additive.
- No agent, step or prompt is removed. The prompts lose steps but keep their names, so `## Model Overrides` rows and the `§ Models` table are unaffected.

### Out of Scope

- The deferred sweep's deliverable verification (Process 7) — judgement, and the agent reads the plan for it anyway.
- `plan-current`'s `Executable` / `Reword` / `Broken` classification.
- The four diff-reading test-order classifications in `bkit-build-plan-verify.md`.
- Design-workflow reviewers; no design-run measurements exist.

### Constraints and non-goals

- The judgement stays with the agents: does the codebase satisfy a `DONE WHEN` / deliverable; the diff-reading test-order exceptions; the plan-current classification; doc content edits.
- No new task store. `tasks` reads and writes the plan file's task blocks (#685).
- Works on every host bkit supports; no new config.
- Tasks 1, 2, 5 and 6 are independent; tasks 3 and 4 depend on the noun from task 2.

### Decisions already made

- None yet.

### References

- #663 — Workflow prompt process token optimisation (parent)
- #676 — Orchestrator work the engine could do as bkit commands (the workflow-prose half of the same audit)
- #685 — How plans are shaped, reviewed and built
- #665 — Fewer plan reviewers and rounds
- #668 — Build in task slices: symbol refs per task, 160k cap per agent
- #680 — ledgers append: engine writes ledger rows with a minted ts
- `.bkit/core/prompts/bkit-build-plan-verify.md`, `bkit-build-plan-current.md`, `bkit-ship-deferred-sweep.md`, `bkit-ship-update-docs.md`
- `.bkit/core/engine/commands/workflow/tests.ts`, `branches.ts`, `ledgers.ts`, `context.ts`
- `.bkit/core/workflows/bkit-build.md` § Steps 6-9; `bkit-ship.md` § Step 5
