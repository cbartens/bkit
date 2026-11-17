Verdict: CONCERNS
Failures: 1
Redesign: false

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope audit — scope, criteria, verification.

## CRITICAL

1. **SC-1 (plan edit) — Task-like documentation checkbox outside the runbook blocks.** Supplied plan-check finding, retained verbatim:

   `docs/plans/202611/logs/860-move-deterministic-bookkeeping/plan-v1-draft.md:507` `stray` — task-like text outside every task block: - [ ] **Docs updated:** Task 9 covers every Documentation Updates row and generated mirror.

   **Required edit:** Render this documentation cross-reference as ordinary prose, retaining Task 9's documentation and generated-mirror verification. Rerun `bkit tests plan-check` against the updated plan; this finding is resolved when it reports no stray task-like text. No design decision or additional implementation task is needed.

## OPTIONAL

None.

The plan includes the mandated sections, carries the eight audit areas and six accepted defaults into scoped tasks and verification, and assigns each of the 27 derived tests to one task. Its nine tasks across three groups fit the supplied task, test and test-file caps. Each task has named files, dependencies, checkable completion criteria and its own tests; Task 9 names the maintained caller and documentation surfaces rather than leaving an unspecified repository-wide sweep.

The 24 reuse families record searches, existing commands or engine symbols, target files and task ownership. They cover invocation identity, attribution, canonical reads, replay receipts, result parsing/rendering, tracker posting, CI handoff, recovery counters, locks, paths and generated documentation. The plan extends existing modules and preserves the existing host/model and tracker contracts; it does not introduce an untraced new source file or parallel service. Source changes target maintained sources, with generated mirrors refreshed through the existing tooling. No required audit area is parked in Out of Scope, and no runbook task delegates required ledger bookkeeping to the build.

## OUT OF SCOPE

None.
