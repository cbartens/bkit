Verdict: PASS

<!-- verdict:end -->

# Design Summary

## Overview

Issue #261 identifies a blind spot: builds/debug workflows can exit "green" with a `[skip ci]` HEAD that never gets tested because CI was suppressed by an undetected `[skip ci]` token in the final commit message. Root cause: the existing HEAD-Subject Assertion checks a string the orchestrator typed, not what GitHub actually dispatched. The design fixes this by adding an outcome-based CI-Dispatch gate that polls the live GitHub signal (via `statusCheckRollup`) after the final loud push to confirm a `bkit-decide` run was dispatched, or self-heals once if the push landed suppressed, or routes to a named failure if recovery is impossible. Four changes: (1) the outcome gate kernel (poll budget ~60s, four terminal verdicts), (2) EC-2 abort-guard preventing `[skip ci]` pushes onto live PRs, (3) EC-1 pre-flight fast-fail on existing PRs, (4) re-trigger marker treatment ensuring `AUTO_ROUTE_SUFFIX` is preserved. No application code; authoring-only changes to `.bkit/workflows/*.md` plus rationale docs. All two review-round concerns (CONCERNS ×2) have been addressed in v3-organised.

## Design Quality

Exceptionally well-reasoned. The design moves from trust-what-we-typed (string assertion) to trust-what-GitHub-did (live dispatch signal), directly addressing the #261 root cause. The four-outcome state machine is diagnosable (named verdicts `dispatched` / `self-healed` / `no-ci` / `unresolved` with sub-reason codes), on-call-actionable, and composes cleanly with the #209 NDJSON state model. The risk-premortem layer adds critical safeguards: re-trigger-clean-before-`no-ci` prevents false all-clears on suppressed re-triggers, `gh`-error retry-then-`unresolved` closes the silent-drop hole, AUTO_ROUTE assert-equal-before-push prevents marker silently dropping and missing cloud dispatch. The design explicitly preserves the D2 hard constraint ("fire CI exactly once") by gating post-final-push-only, capping self-heal to 1, and keeping the intermediate `[skip ci]` commits intentionally silent. Trade-offs are explicitly named: latency trade (up to ~120s on self-heal path), cosmetic extra commit on false-positive heal, lockstep-edit tax. The "why we sacrificed this" reasoning is sound and proportional. No edge cases missed; queue-latency ambiguity, re-trigger marker interaction, ship composition with #81, debug-LOCAL pre-PR push all handled. Status quo changes (what does NOT change under D2 invariants) are explicitly listed.

## Acceptance Scenario

Narrative: developer runs `/bkit-build` or `/bkit-debug`, workflow closes on a PR; they expect CI to have actually dispatched for the HEAD the PR points at (not sit undetected on `[skip ci]`). Success criteria: (1) CI confirmed dispatched for exact pushed HEAD or self-healed once, (2) zero additional mid-build triggers (D2 preserved), (3) no-CI repos pass as no-op, (4) abort preserves last validated HEAD on open PR, (5) re-run on existing PR fails fast with clear message. Key edge cases covered: queue latency vs suppression (bounded poll + heal-only-empty), self-heal double-firing on `bkit:auto` (capped-1), inline-copy drift (scoped grep check), `gh` API failures (retry-then-unresolved), silent marker-drop (assert-equal), EC-1→EC-2 chain (both ends closed), ship composition with #81 (layered backstops). **Adherence to `docs/plans/template.md` § Acceptance Scenario:** The design provides a complete Narrative (user POV, what they do + what they get) and explicit Success Criteria (5 bullets, measurable/testable, outcomes not steps). Key Edge Cases are design-level, informing spec; plan phase will inherit and add plan-level validation/boundary cases. The scenario is ready for plan expansion into Concrete Example and Derived Test Matrix.

## Breaking Changes

None. This is a pure authoring-only change to workflow instructions and docs. No new files, no schema, no API changes, no application code. The four changes (outcome gate, EC-2 abort-guard, EC-1 pre-flight, re-trigger marker treatment) are inlined into existing `.bkit/workflows/*.md` files and produce an additive field (`ciDispatch`) on the existing `step-done` NDJSON record, which is backward-compatible (union-safe, unknown keys ignored by existing readers). The gate's verdict routing (Failure Path on `unresolved`) aligns with existing error flows. No naming changes except the rename of `.bkit/workflows.md` § "HEAD-Subject Assertion" → § "CI-Dispatch Gate" (internal documentation, no breaking surface).

## Feasibility

No feasibility spike was conducted. The design is grounded entirely in existing bkit infrastructure already shipping: the `status.jsonl` NDJSON model (#209, merged), the `gh pr view --json statusCheckRollup` and `gh run list` GitHub CLI surfaces (stable, in use by ship's pre-existing gate), the existing Failure Path / issue-comment handover, the existing HEAD-Subject Assertion, debug's `gh pr list` PUSH_MODE decision logic, and the abort flow. The new bash is straightforward (poll loop, re-trigger commit, record verdict). No unknown infra dependencies, no new GitHub API surfaces, no new build/debug semantics — this is hardening, not new capability. The design does not require changes to `ci.yml`, `bkit-cloud.yml`, or any runtime service. Risk lies in the poll-budget tuning and the inline-copy lockstep, both mitigated by named symbols and the grep-equality check. **Verdict:** Ready to plan. No spike validation needed.

## Synthesis Coverage

Three approaches brainstormed (Pragmatic/Structural variants A–C, Risk-premortem variants A–B); synthesis selected and merged kernels cleanly. **Kept:** inline outcome-gate as post-push twin (Pragmatic A / Structural A kernel — D2-safe, pure idiom reuse). **Merged (onto the kernel):** Risk-premortem 4-outcome state machine with `ciDispatch` verdict, per-attempt poll logging, re-trigger-clean re-assertion (closes false all-clear hole). Structural C conservative EC-1 pre-flight (surfaces gap without D2 risk, leaves placeholder for deferred full PUSH_MODE fix). Named poll symbols + KN-11 rationale home + scoped grep-equality check (mitigates inline-doctrine drift + magic-number risk). Operability hardening (gh-error retry, AUTO_ROUTE assert-equal, sub-reason codes, no-ci confirmed/inferred). **Rejected with clear rationale:** Full PUSH_MODE/EXISTING_PR alignment now (D2-risky mid-build synchronize, deferred). Build create-pr clean (changes D2 contract, deferred). Verify-only gate no self-heal (re-introduces "trust what we typed" root cause, pages on queue latency). New gate at ship (redundant, would mask #81 signal). Centralized templated fragment (forbidden infra, inline-doctrine violation). Good options not lost; the design shows alternatives were systematically evaluated against D2/operability/regression risk.

## Scope Alignment

Design tightly targets the issue's scope. #261 is "CI-trigger gate blind spot — build/debug can leave [skip ci] HEAD on PR → bkit-tests never run." The four changes address this: (1) gate confirms dispatch (closes the blind spot), (2) abort-guard prevents suppressed push onto live PR (blocks the symptom), (3) pre-flight fast-fail (improves UX on most common mis-trigger path), (4) marker treatment (ensures re-trigger doesn't accidentally drop cloud dispatch). **Deferred explicitly:** Full PUSH_MODE/EXISTING_PR idempotency alignment (flagged as D2-risky, placeholder left, gate is backstop). Build create-pr clean (denoted EC-3, gate recovers it, deferred). Ship is explicitly scoped OUT — ship already has a pre-existing outcome-based gate (SQUASH_SHA poll + hard-fail), ship has no post-merge loud push to gate, and adding self-heal at ship would mask the #81 Change C signal. **Scope creep check:** No unrelated hardening, no API refactors, no new capability beyond "verify dispatch happened." The design is tightly bounded to closing the blind spot.

## Risks

Eight primary risks identified; all have documented mitigations (none blockers). **Queue latency vs suppression (universal ambiguity):** poll budget is the knob; invariant documented in KN-11 "budget must exceed dispatch p99, not wait for run completion"; bounded by heal-only-on-empty, cap-1, per-attempt logging. **Self-heal double-firing auto-router:** capped-1 + empty-rollup discriminator keeps spurious rare; question noted for cross-check with `bkit-cloud.yml` stale-run guard (marked "not blocking," separate hardening). **Inline-copy drift (2 aligned gate copies + 2 abort-guard copies):** mitigated by named symbols + scoped grep-equality check (shared poll-loop + symbol lines only, not whole-gate byte-equality). **Magic-number drift (6 months):** constants promoted to named symbols with rationale home in KN-11. **`gh` API failures (rate-limit/scope/network):** retry-then-`unresolved` rule ensures gate never `set -e`'s out, always writes terminal verdict; behaviors differ per cost-asymmetry (poll loop retries, EC-1 pre-flight falls through, EC-2 abort-guard does-not-push). **Silent AUTO_ROUTE marker-drop:** assert-equal-before-push rule routes mismatch to `unresolved` subcode `autoroute-mismatch`. **Debug AUTO_ROUTE ordering:** gate must run in same shell block as `BKIT_AUTO_ROUTE_FILE` read, before `rm`; inlining is mandatory. **Bus factor / simplification regression:** discriminator-by-construction, re-trigger-clean, AUTO_ROUTE assert-equal, `gh`-error retry, debug-LOCAL pre-PR no-fire assumptions all recorded explicitly in `deployments.md` D2 record to prevent silent regression.

## Action Items

None. All review concerns from v1→v2 and v2→v3 rounds have been addressed. The design carries no CONCERNS or FAIL markers; the verdict is PASS. No revisions are needed before plan entry. The seven workstreams (WS-1 through WS-7) form a clean, dependency-respecting DAG with no blocking unknowns. Plan phase can proceed directly to authoring.

## Outstanding Questions

- **Q: Confirm D2/D3 stale-run guard in `bkit-cloud.yml` tolerates the at-most-one extra self-heal run on a `bkit:auto` consumer?** — **Recommended:** Assume yes (guard is designed to tolerate multiple coexisting runs in the same graph position, which is the self-heal's behavior); defer cross-check to post-plan if measurable. Gate's blast radius is bounded to exactly one run at the close-workflow graph position, matching guard's design tolerance.

- **Q: Should the `bkit-decide` probe adopt the same fuzzy matching as ship's tests probe (consumer ci.yml job-name variance) or remain exact literal?** — **Recommended:** Ship's test probe is fuzzy (`test` as substring) because consumer jobs vary widely; `bkit-decide` is bkit-specific and exact matches are intentional (a consumer cannot rename a bkit-provided job), so keep exact literal `bkit-decide` match. This documents the assumption explicitly in the plan: "bkit-decide is the guaranteed entry-job name, exact match by design; if renamed by consumer, the gate's probe must be updated."

- **Q: Tune `POLL_BUDGET_S` against real dispatch-surfacing p99?** — **Recommended:** Defer tuning to post-ship observation. Current `6 × 10s = 60s` budget is conservative. After bkit v4.0 ships, measure real GitHub webhook fanout latency on a few production queues (internal + consumer orgs) and tighten if safely above p99. Document the process in KN-11 so the tuning is repeatable.

## Suggested Workstreams

**WS-1: CI-Dispatch gate kernel — build close-workflow site** — Author the outcome gate (Change 1) inlined into `bkit-build.md` Step 18. Full state machine: poll budget, `gh pr view` probe for `bkit-decide`, per-attempt logging, `gh`-error retry, empty-rollup self-heal (cap-1), terminal verdicts. Includes build-side AUTO_ROUTE re-trigger (Change 4): re-derive from `LABELS`, assert-equal-before-push. Emits `ciDispatch` on `step-done`. **Requires:** None.

**WS-2: CI-Dispatch gate kernel — debug create-pr/close-workflow site** — Author aligned gate at `bkit-debug.md` Step 12 (LOCAL: create-pr; PR: close-workflow), reusing byte-exact shared poll-loop + symbols from WS-1. Debug-specific AUTO_ROUTE: source from `BKIT_AUTO_ROUTE_FILE` (same block, before `rm`), same assert-equal rule. Encodes debug-LOCAL `ci.yml on.push = [dev,main]` only assumption. **Requires:** [WS-1].

**WS-3: EC-2 abort-guard** — Wrap abort commit + push in PR-existence conditional at two sites (build inline Failure Path, shared Failure Path / workflows.md). Reuse debug's `gh pr list` probe. Open PR → preserve last validated HEAD (write artifact/status/comment, no push); no PR → push as today; failed probe → do-not-push (safe default). **Requires:** None.

**WS-4: EC-1 pre-flight** — Read-only `gh pr list` at build Step 17 entry, before blind `gh pr create`. Existing PR → clear Failure Path with message + placeholder for deferred PUSH_MODE fix. Failed probe → fall through (no regression). **Requires:** None.

**WS-5: Doc & rationale** — Update `docs/deployments.md` KN-11 with outcome gate + discriminator + named poll-budget rationale; extend D2 record with all invariants (AUTO_ROUTE assert-equal, `gh`-error retry, debug-LOCAL no-fire). Rename `.bkit/workflows.md` § "HEAD-Subject Assertion" → § "CI-Dispatch Gate"; add build gate re-trigger to Marker Propagation. **Requires:** [WS-1, WS-2, WS-3, WS-4].

**WS-6: Grep-equality check** — Author scoped grep-equality check (poll-loop + named symbols only, not whole-gate) for build/debug alignment; wire into `bkit-check`. **Requires:** [WS-1, WS-2].

**WS-7: Mirror re-render** — Re-render `.claude/` / `.cursor/` / `.opencode/` after `.bkit/` source edits land (batched, terminal workstream). **Requires:** [WS-1, WS-2, WS-3, WS-4, WS-5].

## Recommended Next Step

```
/bkit-plan 261
Brief: Authoring 4-change CI-Dispatch gate + docs. 7 clean workstreams: gate kernel (WS-1/2 build/debug), abort-guard (WS-3), pre-flight (WS-4), docs/rename (WS-5), grep-check (WS-6), mirror-render (WS-7). Design ready; no revisions needed. See design-v3-organised.md for full architecture and workstreams DAG.
```
