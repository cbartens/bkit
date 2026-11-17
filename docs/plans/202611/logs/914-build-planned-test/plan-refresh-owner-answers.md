# Plan Refresh Inputs

## Owner answers

- **Q4 (how the code-step finish learns which tests the plan names):** keep the lookup already on `dev`, and drop the required `--plan` flag.
  - **What is on `dev`:** `finish` in `.bkit/core/engine/commands/workflow/steps.ts` uses `--plan` when it is given, and otherwise derives the plan from the status file's folder with `runPlanPath` in `.bkit/core/engine/commands/workflow/tests.ts`. `touchedTests` takes the plan text and checks only tests a `TEST FIRST` line still names. With no plan file it checks every recorded test.
  - **Why:** the protection is the same, and no build already running breaks. Every build path writes the plan to `docs/plans/{YYYYMM}/{FID}-plan.md`, the path `runPlanPath` reads, so a missing-plan error is not worth adding.
  - **Remove:**
    - Task 1 (the required `--plan` flag on the three code-step finishes).
    - The plan-lookup half of Task 2, with its three `TEST FIRST` tests that already pass on `dev`: "plan no longer names", "names only under another task number", and the integration case "plan dropped".
    - Any expectation that a code-step finish without `--plan` exits 2. The landed test in `steps.test.ts` asserts exit 11.
    - The `Breaking Changes` row about the required flag, and Q4 from `Open Questions & Assumptions`.
  - **Keep:**
    - Fault 1 (a code step that changes another group's planned test is caught in that step).
    - Fault 3 (the `BLOCKED` escape is read, and the change reaches the owner at the Decision Pause).
    - Tasks 3-8, reworded per the plan-currency report.
  - **Renumber:** renumber the remaining tasks in build order, and update every `DEPENDS ON`, `Derived Test Matrix` `Task` cell and cross-reference to match.
  - Recorded on the issue: https://github.com/cbartens/bkit/issues/914#issuecomment-6868580061
