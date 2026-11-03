Verdict: CONCERNS
Failures: 2
Redesign: false

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope audit — scope, criteria, verification.

## CRITICAL

1. **Expand the Derived Test Matrix to name each testable behavior (plan edit).** The matrix's first row combines fetching, behind/ahead/diverged reconciliation and conflict preservation, while Task 1 separately requires six Unit tests and one Integration test. Other rows similarly combine success and unavailable-evidence behavior. In particular, Task 5's foreign-repository scoping and unavailable-base refusal and Task 6's terminal refusal have no explicit matrix behavior; the gate row describes only stale ancestry and the refusal row describes classification generally. The matrix is the acceptance-to-test coverage map, so task-level detail cannot replace its required one-row-per-behavior contract. Split the broad rows into the distinct planned behaviors, retaining their current target files and owning task numbers; include the failure and boundary cases already required by the task instructions. This needs no new feature or test beyond the current plan.

2. **Complete file-level reuse traceability (plan edit).** `Architecture & Component Changes` introduces guarded-close reporting in `.bkit/core/engine/commands/workflow/workflows.ts` and merge-target continuation in `.bkit/core/prompts/bkit-ship-conflict-resolve.md`, and Tasks 4 and 7 modify those owners. Neither owner appears in the Reuse Inventory's `File` column: cleanup names only `worktrees.ts`, and portable routing names only `bkit-ship.md`. The regression row also uses an adjacent-file glob rather than naming the existing files it decides to extend. Add or expand rows to name these exact owners and their searches/candidates, and replace the regression glob with the exact existing test files. Preserve the EXTEND decisions and existing task scope. Record reproducible search expressions and scoped paths rather than phrases such as `rg for snapshot consumers`.

## OPTIONAL

- Mirror the `notOnDev` symbol removal with an explicit `[DELETE]` entry in `Architecture & Component Changes`. The Supersession Inventory and Task 4 already require deletion, so the implementation intent is clear, but the architecture section currently shows only `[MODIFY]` entries.
- Make scratch-consumer verification consistently mandatory or advisory. Task 8's `DONE WHEN` requires inspecting the compiled CLI's fresh-consumer footprint, while `Verification Plan` calls that same recipe advisory. The repository's completion rule and the task currently require it; remove the advisory qualification to avoid an executor treating required evidence as optional.

## OUT OF SCOPE

None. The two excluded items are explicit issue non-goals and have matching deferral rows. No required branch-reconciliation, stale-base, refusal-routing or preservation work is parked outside the runbook.

## Coverage checked

All mandated top-level plan sections are present and filled. Each of the eight tasks has an explicit update scope and a checkable completion condition. The runbook covers the seven reported gaps and adopt-mode fetching. The three open questions supply lettered options, recommendations and defaults; assumptions state their consequences. Human confirmation boxes remain unticked. The five keys on `Ledger rows` exist, and no runbook task writes a ledger row. Documentation updates target canonical sources or the project-owned sections of `docs/testing.md` and `docs/observability.md`.

Related issue history was read selectively by subject; the supplied ledger artifacts include explicit truncation notices, so omitted ledger rows were not treated as absent. Findings above rely on the complete draft and input contract, the plan template, and the scoped documentation reads.
