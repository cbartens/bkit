# Brief: group 6 — Producers, docs, indexes and mirrors

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
- Group 4: The plan's matrix, the ship diff and the producers they touch become engine checks — done
  - TASK 5: `tests plan-check` refuses an unmapped matrix row and a `DELETE` with no Supersession row — done
  - TASK 6: `branches scan-diff --disabled-tests` — done
- Group 5: The sweep's deferral rules move to the engine — done
  - TASK 7: `ledgers triage` — done
  - TASK 8: `ship-update-docs` `Pending Items` from the engine — done
- Group 6: Producers, docs, indexes and mirrors — this group
  - TASK 9: The plan format teaches the producers: the clause and its carriers — open
  - TASK 10: Sync the docs the change touches — open
  - TASK 11: Refresh the capability register, the mirrors and `dist/`, then dogfood — open

## The work

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** The plan format teaches the producers: the clause and its carriers
  - **UPDATE:** `.bkit/instructions.md`: the `plan-scenario-detail` clause gains the `Task` column as the mapping carrier, the retired wording moves to a `retired` block, then `pnpm instructions:sync` rewrites the carriers
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-convert.md`: the Contract's plan shape gains the `Task` column, so a converted plan passes `plan-check` on its re-run
  - **READ:** `.bkit/instructions.md`: § Clauses `plan-scenario-detail` and the `carriers:` rule (`pnpm instructions:show --file bkit-plan-generate.md` first)
  - **READ:** `.bkit/core/engine/tools/instructions.test.ts`: what the clause guard asserts
  - **DEPENDS ON:** 5
  - **DONE WHEN:** the clause names the column and every one of its carrier prompts carries the new sentence after `pnpm instructions:sync`, and `convert`'s Contract names the column (the template's own `Task` column landed in Task 5); `pnpm vitest run .bkit/core/engine/tools/instructions.test.ts .bkit/core/engine/audits/repo/dogfood-templates.test.ts .bkit/core/engine/audits/templates/template-shape.test.ts` is green
  - **TEST FIRST:** n/a — clause and prompt prose; the guards are existing tests, named in `DONE WHEN`

<!-- bkit:task 9 end -->

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Sync the docs the change touches
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

- [ ] **TASK 11:** Refresh the capability register, the mirrors and `dist/`, then dogfood
  - **UPDATE:** `.bkit/prompts.md`: regenerated by `bkit install` from `.bkit/core/.bkit/prompts.md` — never hand-edited
  - **UPDATE:** `.bkit/workflows.md`: regenerated by `bkit install` from `.bkit/core/.bkit/workflows.md`
  - **UPDATE:** `docs/templates/bkit-plan.md`: regenerated by `bkit install` from `.bkit/core/docs/templates/bkit-plan.md`
  - **UPDATE:** `docs/capabilities.md`: regenerated by `pnpm graph:refresh`
  - **UPDATE:** `dist/cli.js`: regenerated by `pnpm build` (this repo commits its CLI)
  - **DEPENDS ON:** 9, 10
  - **DONE WHEN:** `bkit install` regenerates the `.claude/`, `.cursor/` and `.opencode/` mirrors of the changed prompts / workflows / template and leaves `bkit check` drift-clean; `pnpm graph:refresh` leaves the register unchanged or updated in the same commit; `pnpm build` regenerates `dist/cli.js` and `pnpm bkit:check:dist` is clean; a fresh scratch consumer run of `node dist/cli.js tasks --help`, `node dist/cli.js branches scan-diff --help` and `node dist/cli.js ledgers --help` lists the new verbs and flags; `pnpm bkit:gate:static-unit-integration` and `pnpm vitest run` (full, never scoped) are green
  - **TEST FIRST:** n/a — install and build regeneration of generated artifacts; no behaviour of its own

<!-- bkit:task 11 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): `tests green` emits `verdict`, a `fixable` per gap and the gap log lines — `.bkit/core/engine/commands/workflow/tests.ts`, `.bkit/core/prompts/bkit-build-plan-verify.md`
- TASK 2 (group 2, done): Create the `tasks` noun with `tick`, and wire the verifier, the tick and the holistic pass to it — `.bkit/core/engine/commands/workflow/tasks.ts`, `.bkit/core/engine/commands/registry.ts`, `.bkit/core/prompts/bkit-build-plan-verify.md`, `.bkit/core/workflows/bkit-build.md`
- TASK 3 (group 2, done): `tasks open` — the group's tasks with no `DONE` / `BLOCKED` line — `.bkit/core/engine/commands/workflow/tasks.ts`, `.bkit/core/workflows/bkit-build.md`, `.bkit/core/prompts/bkit-build-plan-verify.md`
- TASK 4 (group 3, done): `tasks currency` — plan-current's path and symbol match — `.bkit/core/engine/commands/workflow/tasks.ts`, `.bkit/core/prompts/bkit-build-plan-current.md`
- TASK 5 (group 4, done): `tests plan-check` refuses an unmapped matrix row and a `DELETE` with no Supersession row — `.bkit/core/engine/commands/workflow/tests.ts`, `.bkit/core/engine/commands/workflow/plan-blocks.ts`, `.bkit/core/engine/commands/workflow/challenge.ts`, `.bkit/core/workflows/bkit-build.md`, `.bkit/core/docs/templates/bkit-plan.md`, `.bkit/core/prompts/bkit-plan-scope-check.md`
- TASK 6 (group 4, done): `branches scan-diff --disabled-tests` — `.bkit/core/engine/commands/workflow/branches.ts`, `.bkit/core/prompts/bkit-ship-deferred-sweep.md`, `.bkit/core/workflows/bkit-ship.md`
- TASK 7 (group 5, done): `ledgers triage` — `.bkit/core/engine/commands/workflow/ledgers.ts`, `.bkit/core/engine/commands/workflow/plan-blocks.ts`, `.bkit/core/prompts/bkit-ship-deferred-sweep.md`
- TASK 8 (group 5, done): `ship-update-docs` `Pending Items` from the engine — `.bkit/core/prompts/bkit-ship-update-docs.md`, `.bkit/core/workflows/bkit-ship.md`

### Architecture entries

#### [MODIFY] `.bkit/core/prompts/bkit-build-plan-convert.md`

- **Existence Check:** file exists.
- Contract: add the `Task` column to the plan shape it writes (a `Derived Test Matrix` converted from an issue body has three columns), so a converted plan passes `plan-check` on its re-run.

#### [MODIFY] `.bkit/instructions.md`

- **Existence Check:** file exists.
- § Clauses: the `plan-scenario-detail` clause's `Derived Test Matrix` sentence gains the `Task` column as the mapping carrier, then `pnpm instructions:sync` rewrites its copies in the four carrier prompts; `pnpm instructions:show --file bkit-build-plan-convert.md` before the convert prompt gains the same line.
