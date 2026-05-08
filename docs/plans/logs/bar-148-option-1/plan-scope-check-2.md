Verdict: CONCERNS
Failures: 6

<!-- verdict:end -->

# Plan Scope Check

## CRITICAL

**C1 — Gate 1 human confirmation checkboxes unchecked (template-blocking)**
Both "Acceptance Scenario confirmed" and "Breaking Changes confirmed" checkboxes remain `[ ]`. Per the plan template and the in-plan caution blocks, Gate 1 is blocked and execution agents must issue `REVISE`. The plan itself acknowledges this; the scope check records it as a blocking gap that must be resolved before any Phase A–E work begins.

**C2 — Bidirectional matrix↔runbook 1:1 mapping broken**
Test matrix Rows 1 and 2 both map to runbook task C1 (`.agents/scripts/bkit-modules.test.ts`). The template mandates each row maps to exactly one task AND each task maps to exactly one row. The reverse fails: C1 covers two distinct behaviours (seed-when-absent and print-when-present). Fix: split C1 into C1a and C1b, each with its own matrix row reference, or merge Rows 1 and 2 into a single two-assertion row with a single runbook task. Either resolves the bidirectional gap.

**C3 — No runbook tasks for Path A schema propagation to 5 existing orchestrators**
Data Schema Integration § Path A explicitly states "Propagate the write [of `issueId` and `commentId`] to all 5 existing orchestrators (`bkit-plan.md`, `bkit-build.md`, `bkit-ship.md`, `bkit-debug.md`, `bkit-review.md`)." No Phase A, B, C, D, or E task covers these five file modifications. These are in-scope build tasks with no corresponding runbook entry.

**C4 — No verification task for Path A schema propagation**
Parallel to C3: there is no matrix row and no C-task testing that the 5 existing orchestrators write `issueId` and `commentId` to `status.json`. The router's Step 1 depends on these fields; if any orchestrator omits them, the router fails with a "missing issueId/commentId" no-op comment. The missing verification means this dependency goes untested.

**C5 — Dogfood `.github/workflows/bkit-ci-router.yml` (A2) has build task but no verification task**
C5 (`bkit-action-yaml.test.ts`) explicitly targets `templates/.github/workflows/bkit-ci-router.yml`, not `.github/workflows/bkit-ci-router.yml`. The dogfood file in the bkit repo itself has no corresponding test row or verification task. A structural drift between template and dogfood file is undetectable by the current test matrix.

**C6 — C7 authoring-conventions test scope ambiguity for router's missing Worktree Setup step**
The router is explicitly designed as a leaf orchestrator with no Worktree Setup creation step (the runner provides the worktree). The D1 documentation task says to add an "authoring-checklist note for leaf orchestrators with no Worktree Setup." However, the C7 task spec says to check for "every step has `### 🔒 Gate N`" and mirrors assertions against the existing 5 workflows — which all have a Worktree Setup step. If existing `release-workflow.test.ts` assertions require a Worktree Setup step for all workflows, C7 will produce a false failure unless the test is explicitly amended to allow the router's absence of that step. The C7 task description does not mention this exception requirement.

---

## OPTIONAL

**O1 — Edge case rows in Acceptance Scenario table have no matrix coverage**
Five edge cases documented in the table have no Derived Test Matrix rows and no C-tasks:
- `cancelled` CI conclusion → no-op exit (mentioned in orchestrator Step 5 skeleton only)
- `status.json` missing or malformed → failure exit
- PR closed (ship merged before router fires) → no-op
- Two CI runs back-to-back on same branch → concurrency queuing
- `feat/**` filter mismatch → GHA filter rejects before job starts

These are testable at the unit/integration tier (mock env vars, synthetic `status.json` states). Their absence means the declared edge-case contract is unverified.

**O2 — No test for `--ci-router` CLI flag parsing in `bkit-cli.ts`**
C1 includes "dispatch-order-includes-ci-router" which tests the module list constant, but no matrix row verifies that `bkit install --ci-router` parses the flag correctly via `bkit-cli.ts` argument processing. B3 adds the flag; there is no corresponding test row verifying it is accepted and dispatches only `runCiRouterModule` (not the full module set).

**O3 — `timeout-minutes` value has no lower-bound guard**
The test assertion in C5 checks `timeout-minutes ≤ 240`. The skeleton value is 210. No lower bound is asserted. A future change that sets this to, say, 30 (insufficient for MAX_DEBUG_ATTEMPT=3) would pass the test. Consider adding a lower-bound assertion (e.g., ≥ 180) to the YAML test alongside the upper bound.

**O4 — `docs/testing.md` not in the Documentation Updates table**
The plan adds new test file patterns (GHA YAML lint tests, orchestrator authoring-convention assertions). Per `.agents/docs.md` matrix, `docs/testing.md` is marked `●` for Build workflows. No row in the Documentation Updates table covers updating `docs/testing.md` to record the new test categories. If the patterns are genuinely novel, this doc should be updated.

---

## OUT OF SCOPE

**OOS1 — Behavioral/integration test of bkit-ci-router.md orchestrator logic**
Full end-to-end testing of label gate, stale-run guard, and dispatch decision logic inside a real GHA runner is infeasible at the unit/integration tier. The plan correctly defers this to Manual Verification Step 5 (end-to-end smoke with `ANTHROPIC_API_KEY`). No change recommended to the plan scope.

**OOS2 — Per-PR opt-in alternative to `bkit:auto-route` label**
Acknowledged as a deferral in `docs/pending.md` per the plan. Out of scope for this implementation.
