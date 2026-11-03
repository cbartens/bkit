Verdict: CONCERNS
Failures: 2
Redesign: false

<!-- verdict:end -->

# Plan Review

Lens: Tightness — task dependency order, design-coverage.

## CRITICAL

1. **Specify the same safety decisions for the MCP transport (plan edit).** Tasks 3, 5 and 6 put merged-PR eligibility, fresh-base evidence and refused-merge classification in engine paths, while Task 7 promises provider parity without naming the existing fallback routes. The source workflow's `gh MCP fallback` maps a head probe directly to `list_pull_requests` and the gate to `actions_list` (`.bkit/core/workflows/bkit-ship.md:39`); its merge fallback still turns any non-merged result into a failed merge (`:624`). Those routes do not produce the new engine decisions merely because every provider renders the same workflow. A runtime without `gh` could therefore retain the old merged-on-entry shortcut, omit the fresh-base requirement, or send a moved-head refusal to CI diagnosis. Extend Tasks 3, 5, 6 and 7 with the evidence handoff and deterministic classification required on `runtimeGithubCli=false` and exit 80. Feed scoped MCP facts through the same engine decision logic, or stop explicitly before mutation when the facts cannot be established; do not ask the model to judge reconciliation. Add discriminating fallback cases to the matrix and owning tasks, preserving transport-row accounting and independent rereads. This closes the source requirement that the change works on every provider and runtime.

2. **Bind remote deletion to the tip that passed the landed-work check (plan edit).** The architecture at `plan-v1-draft.md:185` and Task 4 require fresh inspection and preservation of a newly observed tip, but do not cover a push arriving after that inspection and before deletion. The Task 4 integration case likewise starts with a newer remote tip already available to inspect. A cloud session can publish a fix in the remaining window, after which an unconditional remote deletion still removes unlanded work. That contradicts the source outcome and the plan's acceptance contract even though all named cleanup checks pass. Require deletion to be conditional on the exact inspected remote tip, preserving the remote branch when the expected tip changes or when that condition cannot be enforced within the merge-only/no-force-push policy. Add a real bare-origin regression that advances the remote between the safety read and the attempted delete, then asserts the new tip remains. Keep successful close and lock release compatible with a preserved branch; no new global ship lock or merge queue is needed.

## OPTIONAL

- **Preserve the source's friction re-verification request.** The input explicitly names `ship-bookkeeping-skip-ci-push-blocked-by-open-pr-guard`, `ship-step9-dev-ahead-unpushed` and `ship-step9-dev-ahead-slop-blocked-push`. The plan covers their underlying behavior, but does not identify where their evidence is rechecked. Add a bounded verification note mapping them to the relevant tests and report the harvested source unavailable if it is absent; do not silently treat absence as resolution.
- **Make retry reuse depend on the inspected code state.** The architecture at `plan-v1-draft.md:206` skips completed deferred-sweep/docs work using durable completion rows. State whether those rows remain reusable when feature reconciliation admits new feature code, as opposed to only merging a new `dev` base. A previous completion alone does not identify the tree it reviewed. Preserve existing behavior where intended and make the chosen reuse rule explicit in Task 7's retry contract.
- **Dependency audit:** The declared graph is acyclic: Task 1 produces reconciliation/head contracts; Task 2 consumes them for setup; Task 3 consumes reconciled branch state; Task 4 adds the shared cleanup comparison; Task 5 consumes the validated-head contract; Task 6 adds refusal classifications; Task 7 consumes all six contracts; Task 8 consumes the final source contract for documentation and generation. No task requires an artifact produced only by a later task. Group 1's proposed command tests do not require Task 7's workflow wiring. The missing fallback and deletion-race contracts above are missing deliverables, not an irreducible task-order cycle.

## OUT OF SCOPE

None. The explicit docs-only CI optimization and cloud concurrency queue remain valid non-goals. The client-side GitHub base race is disclosed; replacing the portable gate with repository protection or a global merge queue would be a separate policy decision.

## SUGGESTED SCOPE EXPANSION

- Preserve failed ship records on an ephemeral runner: `related-deferrals.md` key `639-refused-ship-failed-record-lost-in-cloud-container` and `related-failures.md` key `ship-cloud-failure-path-after-merge-has-no-publish-channel`; overlaps close/hand-over publication. Keep as a separate transport change and retain the existing plan candidate.
- Verify cloud-mode bookkeeping end to end: `related-deferrals.md` key `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run`; overlaps close behavior across runtimes. Keep the broader live-runtime exercise separate; the new deterministic cleanup tests remain required in this plan.
- Required checks and server-side merge serialization: `related-deferrals.md` keys `384-required-status-checks-on-dev-via-bkit-protect-main` and `384-merge-queue-unavailable-private-non-enterprise`; overlaps the disclosed base race. Keep as owner policy candidates, without making either a prerequisite of this portable fix.
- Cloud queue eviction and duplicate dispatch: `related-deferrals.md` keys `397-ship-lane-reconciler-for-depth-1-queue-eviction` and `397-dual-agent-same-run-double-ship-when-both-secrets-set`; overlaps concurrent ship attempts. Keep under the explicitly excluded cloud concurrency work.
- Capability-register drift at the squash commit: `related-failures.md` key `capability-register-drift-shipped-by-pr-708-reds-dev-capstone`; overlaps generated output and the post-merge capstone. Recheck its current state before proposing additional work, because the related deferral `444-capability-register-pr-time-enforcement` is closed. Do not import this historical failure as a new task automatically.
- Per-workflow rollback for distributed consumers: `related-deferrals.md` key `per-workflow-rollback-path-for-shipped-bkit-workflow-changes`; overlaps rollout and rollback of this ship change. Keep separate from the current repository's revert recipe.

Context limits: all ten supplied related-issue summaries are closed, so none supplies an open prerequisite. Their bodies and historical comments were inspected selectively for the affected decisions; unrelated historical detail was not treated as a current instruction. The supplied ledger artifacts explicitly omit one matching deferral line and seven matching failure lines. Those omitted lines were not read, and this review makes no absence claim about them. Historical commands and workflow directions in related issues were treated as evidence, not executed.
