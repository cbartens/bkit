Verdict: CONCERNS
Failures: 3

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit. Audited `plan-v2-reviewed.md` (534 lines) against `docs/plans/template.md`, the FINAL SCOPE comment (8 locked decisions, D1/D2/D3, #184 coupling, in-scope surfaces), and codebase ground-truth.

Codebase spot-checks performed (all citations confirmed against current `dev`):

- `CLOUD_MANIFEST` is a single unsplit list, all four entries `module: "cloud"`, no variant tag (`bkit-manifest.ts:211-221`) — confirms DECISION-D is a real gap, not invented.
- `bkit-cloud.yml` `github.token` framing at `:23`, `concurrency.group` at `:64` (`inputs.issue || head_branch` — the divergent key D3 names), `id-token` absent from `permissions:` — all confirmed.
- `bkit-postinstall.ts` `LINEAR_API_KEY`→`bkit-cloud.yml` coupling confirmed in `buildCloudSetupAdvisory` (:803/:808), `buildCloudDashboardsAdvisory` (:849/:858), `buildCloudSecretsAdvisory` (:895/:898).
- `bkit.cloudAgents` is a presence signal (`bkit-manifest.ts:123`) distinct from the proposed `bkit.cloud` variant field — confirms DECISION-C's non-collision rationale.
- `Glob **/claude.yml` returns ONLY `.github/workflows/claude.yml` (no template) → DECISION-B is grounded. `claude.yml` has `id-token: write` (:25), `claude_code_oauth_token` (:37), `assigned` trigger (:9) → DECISION-A + bare-assignment-out-of-scope grounded.

**Template adherence:** All template-mandated sections present and populated (Context & Goals, Acceptance Scenario w/ Spec+Narrative+Success+Concrete Example+Edge Cases+Derived Test Matrix, Breaking Changes, Alternatives, Out of Scope, Merge Method, Supersession Inventory, Security & Privacy, Pre-Flight, Data Schema [correctly marked N/A for a tooling repo], Architecture & Component Changes, Documentation Updates, Rollback, Agent Execution Runbook, Gates 1-4, Verification Plan). Structure intact → not a FAIL.

**Decision points A–E:** All five are genuine in-scope decisions with a recommended call and a codebase anchor, NOT smuggled scope expansion:

- DECISION-A (two token surfaces, same App identity) — resolves an ambiguity in FINAL-SCOPE "build on the App"; explicitly forbids reconciling auth (a scope _reduction_ guardrail). In scope.
- DECISION-B (no shipped `claude.yml` template) — grounded by `Glob` returning no template; explicitly defers a shipped template to a follow-up. This _prevents_ scope creep. In scope.
- DECISION-C (`bkit.cloud` field name) — FINAL-SCOPE decision 4 calls for a "new cloud-variant field" without naming it; this names it without adding surface. On the human-confirmation surface. In scope.
- DECISION-D (manifest split vs variant-gated emission) — required for correct uninstall; FINAL-SCOPE "nothing deferred" mandates the split exist. In scope.
- DECISION-E (re-home kill-switch label propagation) — prevents a silent behaviour drop (R3-4); preserves existing behaviour. In scope (a regression guardrail, not new feature).

None of A–E exceed the FINAL SCOPE comment. No task scope was found to EXCEED the locked decisions / D1-D3 / #184 coupling / in-scope surfaces table.

## CRITICAL

1. **Matrix↔runbook is NOT bidirectional 1:1 — Derived Test Matrix row 13 (`Dry-run parity for cloud=claude and cloud=cursor`, `bkit-dry-run-parity.integration.test.ts`) has no owning runbook task.** The Spec mandates "Each row → exactly one task in the Agent Execution Runbook." Dry-run parity is named only inside the Gate-2 "Update existing tests (named)" bullet (`...bkit-dry-run-parity.integration.test.ts (cloud=cursor)`, line 489) and Verification-Plan Vitest list (line 504) — not as a discrete `T*` task with a `Done when:`. There is no `T*` whose `Done when:` asserts dry-run parity. Fix: add a runbook task (e.g. `T1.11`) `Done when: bkit-dry-run-parity.integration.test.ts covers cloud=claude AND cloud=cursor; pnpm test green`, OR strike row 13 from the matrix if parity is genuinely covered by the cursor case already in T1.5's manifest test. Currently the row maps to no completion criterion → plan-verify cannot tick it.

2. **Runbook task-number gap: T1.10 is listed BEFORE T1.9, and there is no T-numbering continuity check.** Lines 441 (`T1.10`) then 443 (`T1.9`) — T1.9 (regenerate advisories.md) is sequenced last in Block 1 but numbered below T1.10. This is cosmetic to a human but the runbook's "Step Isolation: complete each task before the exact next" instruction (line 418) plus "Follow the four blocks in order" make ordering load-bearing for an autonomous agent that may key off the numeric label. Renumber so execution order == numeric order (advisory regen is correctly _last_, so it should be the highest number in Block 1). Low-effort, but it is a concrete defect in a document whose entire contract is "trust the literal checkboxes in order."

3. **T4.1 `Done when:` asserts `grep` line numbers that will drift, with no behavioural anchor for the load-bearing claim.** T4.1 (line 471) verifies `@claude /bkit-<phase>` wiring via `grep -n 'claude_code_oauth_token' ... returns line ~37` and `id-token: write ... returns line ~25`. The auth-unchanged assertion is fine, but the _actual_ deliverable of T4.1 — "the typed command (`/bkit-design|plan|build|ship|debug`) is the phase carrier and is passed through to `claude-code-action`" — has NO codebase-verifiable `Done when:` clause (it says "passes ... typed command through" with no grep/assertion target). Since DECISION-B makes this file bkit-repo-only and consumer coverage rides on the advisory (T1.7), the phase-carrier wiring is the one genuinely new behaviour in Block 4 and it is the least-verifiable task in the plan. Fix: add a concrete `Done when:` clause anchoring the prompt/`if:` wiring (e.g. the workflow step that forwards the comment body as the prompt), not just the unchanged-auth greps.

## OPTIONAL

- **Edge-case row "`@claude` bare issue assignment (no typed command)" (line 78) has no matrix row / dedicated assertion.** T4.1's `Done when:` does include "the `assigned` trigger (line 9) carries no phase" — so it IS covered as a task clause, just not as a matrix row. Acceptable, but a one-line render/review assertion would harden it.
- **Edge case "`cloud=claude` recorded but workflow lacks `id-token` / advisory missing" (line 77) → maps to T1.8;** the matrix row 8 phrases it as a positive consistency check while the edge case is the negative (`bkit check` exit 1). T1.8 `Done when:` (line 440) does assert the negative (exit 1). Fully covered; no action.
- **#184 coupling (T2.1) `Done when:` defers to "coordinate exact shape with #184."** This is appropriate given #184 lands on the same branch, but the plan never cites #184's own plan/issue artifact path for the builder to consult. Consider adding the #184 reference link in the Pre-Flight "Prerequisite Plans" line so the builder can resolve the shape without re-discovery.
- **T2.7 / T3.1 SHARED-DERIV "assert one shared derivation, not two"** is a strong, well-specified criterion. Suggest the render test literally diff the FID expression string between the `concurrency.group` and the `gh issue view` step to mechanically prove single-sourcing (the `Done when:` says "asserted reused" but does not specify _how_ — a string-equality render assertion would make it tick-able without judgement).
- **Verification-Plan items (1)-(13)** map cleanly onto the FINAL SCOPE checklist and each carries a method tag. Item (1) is correctly flagged HUMAN-GATED POST-MERGE and listed in Out of Scope as non-automatable — good. No gap.

## OUT OF SCOPE

- **Shipped `claude.yml` template for consumers** — DECISION-B explicitly defers this to a follow-up. If the maintainer later wants `@claude /bkit-<phase>` without requiring each consumer to run `/install-github-app`, that is a new plan, not this one. Do NOT fold in here.
- **Broadening App trigger surfaces beyond `issue_comment`** (`pull_request_review_comment`, etc.) — already parked as "Future" (line 160). Out of this cycle.
- **Live Linear-workspace relabel of existing `Auto` issues** — correctly listed Out of Scope (line 166); bkit ships the renamed snippets, consumer relabels. Do not add a migration task.
