Verdict: CONCERNS
Failures: 4

<!-- verdict:end -->

# Plan Scope Check

## CRITICAL

1. **status.json schema bump (Path A) has no build tasks for the 5 existing orchestrators.** Section "Data Schema Changes" mandates extending `status.json` with `issueId: string` and `commentId: string`, propagated to all 5 existing orchestrators (`bkit-plan.md`, `bkit-build.md`, `bkit-ship.md`, `bkit-debug.md`, `bkit-review.md`) at Start Workflow. The Architecture section's `[MODIFY] .agents/workflows.md` row does not list this propagation, and the Agent Execution Runbook (Phase A–E) has zero tasks to actually edit those 5 orchestrator `.md` files. Without the schema write, router Step 1 (Path A) cannot recover `ISSUE_ID`/`COMMENT_ID` and the entire Label Gate (Step 3) and Linear-comment-append (Step 7) fail. Add: explicit `[MODIFY]` rows for all 5 orchestrators in Architecture; new Phase A tasks (e.g., A4–A8) instructing edits at each Start Workflow step plus authoring-convention test updates.

2. **No verification task for status.json schema bump.** The Derived Test Matrix has eight rows; none assert that the 5 orchestrators write `issueId`/`commentId` at Start Workflow. Add a matrix row + Phase C task (e.g., extend `release-workflow.test.ts` or a dedicated `status-json-schema.test.ts`) verifying the field-write across all 5 workflows. Without it, router-side Path A reads have no upstream guarantee.

3. **Linear label `bkit:auto-route` creation is unscoped.** The Edge Cases, Spec, and Acceptance Scenario all gate behaviour on the `bkit:auto-route` label, but the Runbook contains no task to create the label in the Linear workspace (or document the manual prerequisite for consumers). Add: a Phase D task to document the consumer-side label creation in `docs/deployments.md` and an explicit "create label in bkit's Linear workspace" prerequisite (or pre-flight item) for dogfood. Without it, dogfood Step 5 of Manual Verification cannot succeed.

4. **Test matrix coverage gap: label-gate and stale-run-guard runtime behaviour are unverified.** Edge Cases lists six runtime scenarios (stale CI run, label absent, missing secret, back-to-back runs, MAX_DEBUG_ATTEMPT, malformed status.json), and the Plan acknowledges these in the orchestrator skeleton (Steps 3–4), but the Derived Test Matrix has zero rows for them. The `release-workflow.test.ts` authoring-conventions check (matrix row 8) only asserts file shape, not runtime branch behaviour. Add matrix rows + Phase C tasks for: (a) label-absent no-op exit; (b) head-SHA mismatch no-op exit; (c) malformed `status.json` failure; (d) PR-closed no-op exit. Even shallow pure-function tests of the decision branches in `bkit-ci-router.md` step contracts qualify.

## OPTIONAL

- **C1 dispatch-order assertion is undeclared in the matrix.** Phase C1 includes a "dispatch-order-includes-ci-router" assertion not present as its own matrix row. Either elevate it to a dedicated row or fold it into row 1 description for traceability.
- **B4 underspecified.** "Wire installer to record canonicalHashes entry" is tagged "no schema change" but doesn't enumerate the actual code change in `bkit-modules.ts` / `bkit-version.ts`. Tighten to: "Confirm `runCiRouterModule` calls `recordCanonicalHash(...)` after `writeTier3` (mirror `runCiModule` line N)."
- **Pre-flight check for `recordCanonicalHash` signature missing.** Pre-flight section lists no item verifying `recordCanonicalHash` exists and accepts the new path. Add a Core or Conditional pre-flight bullet.
- **`bkit-ci-router.md` step-count is unspecified.** Architecture says "`### /bkit-ci-router — N steps`" with literal `N` placeholder. Tighten to a concrete number (7 per the step skeleton) so D1 doesn't drift.
- **Manual Verification Step 5 dogfood requires `ANTHROPIC_API_KEY` in this repo.** Plan acknowledges this but doesn't require setting up the secret as an explicit pre-flight or runbook task. Add a setup task or explicit "out of scope for v1; defer dogfood to follow-up issue" entry in `docs/pending.md`.
- **Acceptance Scenario / Breaking Changes human-confirmation checkboxes are unchecked.** The plan-v2-reviewed.md verdict is `PASS` despite both `👤 ✅ Human Confirmation` boxes being `[ ]`. Per template Gate-1 fallback rules, summary should issue `REVISE`. Confirm with the human reviewer that this was an intentional override; otherwise re-run plan-summary.
- **`bkit-ci-router.md` Worktree Setup ambiguity.** Step 2 says "runner is the worktree" but also "`cd` into checkout root." The orchestrator should clarify whether it skips Worktree Setup entirely (per "leaf orchestrator with no Worktree Setup creation step") or runs a runner-specific variant. Tighten the step skeleton to remove ambiguity before A3.
- **`prompt: "/bkit-ci-router"` semantics unclear.** Architecture says the action's `prompt:` is `/bkit-ci-router {FID}` in one place and `/bkit-ci-router` in the YAML skeleton. Reconcile: how does the runner-side Claude session derive `{FID}` if it's not in the prompt? (Step 1 derives it from `docs/plans/logs/`.) Document explicitly.

## OUT OF SCOPE

- **Future-phase: Step 18 chained dispatch in `bkit-build`.** Already deferred; left to follow-up.
- **Per-PR opt-in (alternative to per-issue label).** Already in `docs/pending.md`; no action.
- **Dead-letter / retry on `claude-code-action@v1` crash.** Already in `docs/pending.md`; no action.
- **Anthropic Managed Agents Sessions API (Option 2).** Skipped per design; no action.
- **Cross-repo router dispatch.** Out of scope for v1.
