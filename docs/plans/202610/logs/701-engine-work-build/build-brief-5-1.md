# Brief: group 5 — The sweep's deferral rules move to the engine

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
- Group 5: The sweep's deferral rules move to the engine — this group
  - TASK 7: `ledgers triage` — open
  - TASK 8: `ship-update-docs` `Pending Items` from the engine — open
- Group 6: Producers, docs, indexes and mirrors — next
  - TASK 9: The plan format teaches the producers: the clause and its carriers — open
  - TASK 10: Sync the docs the change touches — open
  - TASK 11: Refresh the capability register, the mirrors and `dist/`, then dogfood — open

## The work

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** `ledgers triage`
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

- [ ] **TASK 8:** `ship-update-docs` `Pending Items` from the engine
  - **UPDATE:** `.bkit/core/prompts/bkit-ship-update-docs.md`: drop Process 7 (the `docs/deferrals.jsonl` grep); `Pending Items` is filled from the passed scan artifact
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: Step 6 runs `context ledger-scan --terms='{FID}' --source=docs/deferrals.jsonl --artifact="{OUTBOX}/ship-pending-items.md" --fid={FID} --step=ship-update-docs --reset-log` and lists that artifact in the subagent's `Read:`
  - **READ:** `.bkit/core/engine/commands/workflow/context.ts`: `ledger-scan`'s required flags (`--terms`, `--source`, `--artifact`), its clamp and its keep-cap, so the step's call is complete and the FID term's over-match is accepted (the scan's truncation notice is what `Pending Items` tolerates)
  - **DONE WHEN:** the `ship-update-docs` prompt names no `docs/deferrals.jsonl` grep and names the artifact its `Pending Items` comes from; the ship workflow's Step 6 call carries `--terms`, `--source`, `--artifact` and `--reset-log`, and lists the artifact in the subagent's `Read:`; `pnpm vitest run .bkit/core/engine/audits/workflows/workflow-shape.test.ts` is green
  - **TEST FIRST:** n/a — prompt and workflow text only, no behaviour

<!-- bkit:task 8 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Plan table readers (`Derived Test Matrix`, `Supersession Inventory`, `Out of Scope`) | `.bkit/core/engine/commands/workflow/plan-blocks.ts` | read `reuseInventory` + `tableCells` in full; `grep -rn -e "Derived Test Matrix" -e "Supersession" -e "Out of Scope" .bkit/core/engine/commands`; `grep -rn -e "BRIEF_SECTIONS" -e "planSection" .bkit/core/engine/commands/workflow` | `reuseInventory(text)` — the plan's Reuse Inventory table reader, with `tableCells` and heading scoping; `context.ts`'s private `planSection` reached through `BRIEF_SECTIONS` is the only `Out of Scope` reader and is unexported | EXTEND | same file, same shape: three more readers over the same `tableCells` helper, so all plan-table parsing stays in the one module `tests` and `challenge` already import; exporting `context.ts`'s `planSection` would put a heading reader in the artifact-writer module |
| Deferral triage and the `unjustified` / `TRIAGED` row write | `.bkit/core/engine/commands/workflow/ledgers.ts` | read `append`'s validator entry points (`APPEND_LEDGERS`, `EXIT_ROW_REFUSED`, the writer check) and `check`; `grep -rn "DEFERRAL_REASONS\|UNJUSTIFIED_REASON" .bkit/core/engine` | `append` (mints `ts`, validates a row, checks its writer, all-or-nothing) and `ledgers/telemetry.ts`'s `DEFERRAL_REASONS` / `UNJUSTIFIED_REASON` | EXTEND | `triage` computes a bucket and hands each row it must write to the same append path, so the row shape, the `ts` mint and the writer check stay in one place |
| The sweep's deferral-row list and the ship docs agent's `Pending Items` | `.bkit/core/workflows/bkit-ship.md` | `grep -n "ledger-scan\|deferrals.jsonl\|Step 6" .bkit/core/workflows/bkit-ship.md`; read Step 5 and Step 6 | `bkit context ledger-scan` (a shipped verb) and the ship workflow's existing per-step artifact pattern | EXTEND | Task 8 runs the verb and passes its artifact; no new command, and `docs/deferrals.jsonl` never reaches the docs agent as an unfiltered read |

### Architecture entries

#### [MODIFY] `.bkit/core/engine/commands/workflow/plan-blocks.ts`

- **Existence Check:** file exists.
- Add `derivedTestMatrix(text)`, `supersessionInventory(text)` and `outOfScope(text)` beside `reuseInventory`, reusing `tableCells` and the same heading scoping: the first table under the first heading naming the section, before the next heading of the same or a higher level; `derivedTestMatrix` returns each row's cells plus the `Task` column's index (`null` when the header has none), the header line and the row lines; `supersessionInventory` returns each row's backticked paths; `outOfScope` returns each row's cells (the excluded item and the `Where it belongs` cell) so `ledgers triage`'s fourth reason test can read the plan's own declaration. Pure text in, rows out — no file-system access, so `tests`, `challenge` and the workflow verbs keep sharing it.

#### [MODIFY] `.bkit/core/prompts/bkit-ship-update-docs.md`

- **Existence Check:** file exists.
- Drop Process 7 (the `docs/deferrals.jsonl` grep); `Pending Items` is filled from the `bkit context ledger-scan` artifact the ship workflow passes.

Reuse Inventory rows left out: 0; Architecture entries left out: 3 — read them in docs/plans/202610/701-engine-work-build-plan.md § Reuse Inventory and § Architecture & Component Changes.
