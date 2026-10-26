Verdict: CONCERNS
Failures: 3

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

Scope verified against `docs/templates/bkit-plan.md`: every mandated section is present and populated (Context & Goals, Acceptance Scenario with Narrative / Success Criteria / Process Sketch / Concrete Example / Edge Cases / Derived Test Matrix, Breaking Changes & Naming, Open Questions & Assumptions, Alternative Approaches, Out of Scope, Suggested Scope Expansion, Security & Privacy, Pre-Flight with Gate 1, Data Schema Integration, Reuse Inventory, Architecture & Component Changes with the `Ledger rows` line, Cron Jobs, Supersession Inventory, Documentation Updates, Rollback Strategy, Agent Execution Runbook with Gates 2-3, Verification Plan with Gate 4). No `PENDING` remains. The issue's `Narrative`, `Success Criteria`, `Edge Cases`, `Derived Test Matrix` and `Breaking Changes & Naming` carry over word for word; Process Sketch is 7 lines with no new example; each group is within 3 tasks / 15 `TEST FIRST` tests and each task within 10 tests / 3 files. Every task has scope and a verification step, every Success Criterion has a build task and a matrix row, and the matrix↔runbook mapping is 1:1 in both directions. Findings below are the exceptions.

## CRITICAL

**C1 — The `Derived Test Matrix` does not cover the plan's own testable behaviours; add rows (and, for one, a `TEST FIRST` test).**
The `Edge Cases` table declares 10 plan-added behaviours (`plan-v1-draft.md:91-100`) and the matrix carries 10 plan-added rows (`:127-136`), but only two line up: `green` with no gaps (`:91` → row `:127`, task 1) and `scan-diff` adding none (`:99` → row `:135`, task 6). Seven declared behaviours have no row: the missing-`Task`-column refusal (`:92`), a `Task` cell naming an undefined task (`:93`), an `n/a`-only task needing no row (`:94`), `tick` idempotence (`:95`), a non-numeric `--tasks` (`:96`), a missing `--plan` (`:97`), an empty deferral set for the FID (`:98`) — plus `currency` matching no task (`:100`). Three of them are also asserted in a task `DONE WHEN` with no test behind them:

- Task 5 "on a matrix header with no `Task` column" (`:565`) — the load-bearing refusal of the plan-format migration (`:154`, `:188`);
- Task 2 "leaving every other plan line byte-identical" (`:510`) — Assumption 3 (`:200`) claims "`tasks.test.ts` pins that no other line changes", but no `TEST FIRST` entry or row does;
- Task 4 "an unmatched plan prints no hunks and exits 0" (`:548`).

`green`'s `verdict: null` when a gap needs a diff read (the issue's own `Edge Cases` row, `:82`) is only half-covered by matrix row `:111`, which names `fixable: null` alone. The mapping itself is sound (every row traces to exactly one task's `TEST FIRST`); the rows are missing, not mis-mapped. **Add:** one row per behaviour above, each mapped to its task — `…/commands/workflow/tests.test.ts` → task 1 for `verdict: null` and → task 5 for the two `plan-check` cases; `…/commands/workflow/tasks.test.ts` → tasks 2 / 3 / 4; `…/commands/workflow/ledgers.test.ts` → task 7 — and a `TEST FIRST` test in Task 5 for the missing-column refusal.

**C2 — The `no-red` "work already landed" exemption is deleted with no replacement, no Open Question and no row.**
`bkit-build-plan-verify.md` § Process 8 holds: "`no-red` on a task the plan-currency report classifies `Broken` with work already landed **and** the execute log records `DONE — TASK {N}: already landed` → no gap" (verified in the file). The engine emits a `no-red` gap unconditionally — `.bkit/core/engine/commands/workflow/tests.ts:1469-1473`. Task 1's `UPDATE` (`:487`) drops the table and keeps only the four diff reads, and the mapping (`:330`) sets `no-red` → `fixable: false`, which Process 4 turns straight into `Verdict = FAIL`: a build that passes today becomes a FAIL. The Supersession row (`:436`) justifies the DELETE with "the engine already computes every gap kind it maps", which does not hold for this row, and the `fixable` assumption (`:198`) does not name it. **Fix:** keep the exemption in Process 8 beside the four diff reads, or implement it in `green` (then add its matrix row); either way record it in `Open Questions & Assumptions`. The same `UPDATE` should also state the fate of the two report-level bullets it removes with the table — `Enforced: false` → reason in `Notes`, and the `Late-red check` section → `lateRedUnchecked` (already emitted, `tests.ts:1278-1286`).

**C3 — The `tasks` noun's `NEW` row misses the existing implementation of `open`.**
`Reuse Inventory` (`:310`) files reason (b) against _noun folding_ (`CommandSpec` is one noun per source), but `context.ts` already computes exactly what `bkit tasks open` reports: `loggedDone` reads the execute logs' `DONE — TASK {N}` lines (`context.ts:1024-1058,1527`), `isDone = t.done || done.has(t.task)` (`:1528`) is the tick-plus-log set, and `open = o.group.tasks.filter(t => !o.isDone(t))` (`:1153`) is the same set difference; the `DONE`-line reader is already a shared export (`doneTasks`, imported at `context.ts:62`). Task 3 carries no `READ` for it, so `open` can become a second parser of the same lines. Per "Improve over duplicate" and the `Reuse Inventory` rule (default `EXTEND`; `NEW` needs reason (a) / (b) / (c)), the row's `Search performed` must record the `context brief` / `doneTasks` search and give reason (b) **about that capability** (or `EXTEND` `context.ts`), and Task 3 must `READ` and reuse `doneTasks`.

## OPTIONAL

**O1 — `[DELETE]` mirror absent from `Architecture & Component Changes`.** All ten `Supersession Inventory` rows (`:434-445`) carry `Replaced by … (Task N)`, so each removal sits in a task, but the section (`:317-427`) holds only `[MODIFY]` / `[new]` entries. Add one `[DELETE]` line per row naming the file and section it removes (e.g. `[DELETE]` `.bkit/core/prompts/bkit-build-plan-verify.md` § Process 8 kind→`Fixable` table) so the deletions are visible where an implementer reads.

**O2 — `Out of Scope` rows 1-3 have no matching `docs/deferrals.jsonl` row.** Only row 4 writes one (`701-design-workflow-reviewer-audit`, in the `Ledger rows` line). Rows 1-3 say "there is no deferred work to remediate"; if that is the position, say it in `Where it belongs` (or write the rows) so the table and the `Ledger rows` line agree.

**O3 — Task 2 changes `bkit-build.md` Step 7 but names no workflow guard.** `workflow-shape.test.ts:538-550` and `:771-787` assert the Step 7 body; Task 3 names that file for Step 6, so Task 2's `DONE WHEN` should name it (and fix it if red) for Step 7.

**O4 — `plan-blocks.ts`'s two new readers gain no direct test.** `plan-blocks.test.ts` exists beside `reuseInventory`; Task 5 adds `derivedTestMatrix` / `supersessionInventory` (`:337`) verified only indirectly through `tests.test.ts`. Add a `plan-blocks.test.ts` test for the header-with-no-`Task`-column return and the heading-scoping boundary.

**O5 — Task 1's `DONE WHEN` grep cannot read as written.** The prompt keeps `— Fixable: false` (`:370`), so `grep -c "Fixable"` is never 0. State the check as "no kind→`Fixable` table row and no verdict-mapping line", or grep the table's shape, so it is checkable as written.

**O6 — Task 7's `UPDATE` names the wrong symbol.** `` `append` in `.bkit/core/engine/commands/workflow/ledgers.ts`: add the `triage` verb `` — the field's `{symbol}` should be `triage` (the new verb) or `ledgersCommand`, per the runbook field format.

## OUT OF SCOPE

**A mechanical backfill for the new `Task` column.** A `bkit tests plan-check --fix-matrix` (or an equivalent) that adds the column to in-flight plans, so no plan needs a hand edit before it can be built. Touches the plan-format surface Tasks 5 and 9 own, but is a new command and its own issue (`@bkit-build-plan-convert` already covers converted plans).

**The same engine-facts audit for the remaining build and ship prompts.** `bkit-build-plan-execute` (red command line, `DONE — TASK {N}` log line), `bkit-build-plan-gaps-remediate` and the sweep's other steps carry the same class of mechanical prose; `#701` scopes only plan-verify, the deferred sweep and plan-current, so this belongs in a follow-up.

**Fold `ledgers triage`'s disposition and closing into the same verb** (the `@bkit-utility-update-deferrals` sweep). Rejected in `Alternative Approaches` — a different contract on the same ledger; keep deferred.
