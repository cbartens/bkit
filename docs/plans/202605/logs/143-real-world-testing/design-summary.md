Verdict: PASS

<!-- verdict:end -->

# Design Summary

## Overview

The design enforces real-world (non-mock) testing across debug, build, and plan workflows to prevent runtime-only defects shipping green behind mocked tests. The core invariant: "A test that exercises the real integration boundary must exist, must FAIL before a fix, and must PASS after it—and when that test cannot be run, the green result must be loud, auditable, and never silently equated with 'works.'"

**Crux resolution:** A consumer-declared `test:real` script (discovered via the existing `jq -e .scripts["test:real"]` / turbo pattern) is the "real stack" contract. When absent or opted-out (`[real-stack=off]`), gates degrade to CONCERNS (never hard-FAIL) and the skip is recorded in status.json + always-written surfaces (summary artifact + PR body). Hard FAIL fires only when the real stack IS available and `test:real` fails after remediation—the exact failure mode #143 targets. Soak mode is a fourth OBSERVE_MODE value for iterative unknown-cause bugs, bounded by existing attempt caps.

**7 workstreams + dependency spine:** WS-1 (docs/testing.md convention) → WS-2 (capability resolution + status.json schema foundation) → {WS-3 (plan mandate), WS-4 (build gates), WS-5 (debug reproduce + verify)} in parallel → WS-6 (soak mode + guard coverage) → WS-7 (canonical-mirror lockstep edits).

## Design Quality

Exceptionally well-reasoned. The design takes a systems-thinking approach to the #143 root cause (missing invariant, not missing subsystem) and solves it with ~85% reuse of existing bkit machinery: the script-discovery pattern, the OBSERVE_MODE axis, the diagnose→remediate→run-tests loop, the status.json per-step verdicts. Trade-offs are explicit and intentional:

- **Rejects hard gates** because unsatisfiable on credential-less consumers would be silently disabled (the exact problem it targets)
- **Accepts mock-vs-real boundary ambiguity** as an inherent ceiling of consumer-agnostic enforcement, stated openly rather than papered over
- **Chose `test:real` script over config file** to avoid new file type/parser/drift (preserves vacuous-pass detection via status.json fail-then-pass record instead)
- **Chose soak as 4th OBSERVE_MODE** (not "just re-run existing loop") because the issue is decisive that accumulating-context iteration is the tool that cracked the bugs, and cost is bounded by reusing MAX_DEBUG_ATTEMPT

The design is dense but internally consistent. Each component (reproduce-first gate, empirical-verify, soak mode, plan mandate, escape-hatch audit) has a clear rationale. Edge cases (vacuous pass, infra failure misclassified as functional, soak without real stack) are addressed by specific mechanisms (fail-then-pass recording, reproKind classifier, soak→off downgrade before any guard runs).

## Acceptance Scenario

**Adheres to `docs/plans/template.md` § Acceptance Scenario → Spec.** The design document has a formal Acceptance Scenario section (§ at line 7) with:

- **Narrative:** Yes, user POV, 2 sentences (maintainer running plan/build/debug workflows) — ✓
- **Success Criteria:** Yes, 4 bullets, all measurable/testable (plan flagged if lacking non-mock test; test must fail-then-pass; gates degrade to CONCERNS when stack absent; soak mode for iterative bugs) — ✓
- **Key Edge Cases:** Yes, 6 concretely stated (vacuous pass via repro-first gate; real stack reached but verify fails → hard FAIL only; creds missing → infra classification → CONCERNS not functional FAIL; soak downgrade when no stack; mock mislabeled as real is residual risk; resume preserves capability state) — ✓

All criteria are traceable to specific design sections and mechanisms. Human confirmation gate exists in the design document (line ~not visible in excerpt but standard for v3-organised docs) with the checkbox structure per template — **however, we cannot see the human-confirmation checkbox state from this read, so unchecked gates remain a residual action item** (see Action Items below).

## Feasibility

**One verify-in-build risk flagged, not a blocker.** The design calls out that `pnpm turbo run test:real --dry-run` for monorepo task existence detection is unproven against the pinned turbo version (Risks section, line 627–632). This is correctly framed as a **build-phase spike, not a design blocker**—the fallback path (accept absent task as "no-op" without dry-run probe) is already documented and safe. The single-package `jq -e .scripts["test:real"]` path is established and safe; only the monorepo path is the spike.

All other components are composable from existing bkit primitives:

- Capability resolution = ~15 lines of shell (jq + grep + condition)
- reproduce-first gate = ~20 lines of shell classifier + status.json write
- empirical-verify = append `test:real` to existing run-tests sequences
- soak = reuse diagnose→remediate→run-tests machinery with one new subagent
- plan mandate = two instruction/lens additions to existing generate + review agents
- escape-hatch audit = one line appended to summary subagents

No new language, no new libraries, no architectural subsystems. Feasibility is high given the existing bkit codebase patterns.

## Synthesis Coverage

The design document enumerates 3 brainstorms (or "Approaches") across multiple iterations and synthesizes them explicitly in the "Approaches Considered" table (lines 569–581). Coverage is comprehensive:

- **B1-A (capability-gated gates + soak + docs snippet):** MERGED as spine
- **B3-A (reuse-everything `test:real` script, status.json fail-then-pass, no modes):** MERGED (script discovery + cost ordering + fail-then-pass record); soak stance REJECTED for B1's soak
- **B2-A (tiered repro contract via config file + graceful downgrade):** MERGED (downgrade semantics); config-file mechanism REJECTED for B3's script convention
- **B2/B3 soak risk-mitigations:** KEPT layered onto chosen soak (reuse cap, document boundary)
- **B3-C / B2 plan mandate scoped to boundary-crossing:** KEPT (prevents bloat, named ground-truth)
- **B1-B, B1-C, B2-B, B2-C, B3-B:** All explicitly REJECTED with stated reasons

The synthesis is not just a vote—each rejection has a loaded-bearing reason. The "two divergent options, resolved" section (Architecture §, lines 103–138) explains why script vs. config and soak vs. no-soak were the crux questions and how the final design threads them. No strong alternative appears lost; the discarded approaches are defensible but sacrifice either scope (B1-B drops soak which the issue calls decisive) or surface area (B2 config file adds drift and complexity the script discovery avoids).

## Risks

**Named open questions and residual limits** (from Risks & Open Questions, lines 605–635):

1. **Unsatisfiable-gate disablement risk** — mitigation: per-repo declared capability + CONCERNS degradation + loud audit on always-written surface. Residual: escape-hatch ergonomics must stay frictionless or consumers route around it.

2. **Mock-vs-real boundary ambiguity** — consumer mislabeling a mocked suite as `test:real` recreates #143 with a green light. No bkit-side change fully prevents this; stated as an accepted residual risk, not silently assumed.

3. **Cost/credential blast radius** — running `test:real` on every debug attempt + every soak iteration multiplies spend at 10x scale. Bounded by existing retry caps and run-last ordering. **Open question:** should `test:real` run on every attempt or only on final verify? Current design runs at reproduce + each run-tests + each soak iteration; plan-time decision may cap soak iterations more tightly for paid endpoints.

4. **OBSERVE_MODE enum surface** — adding `soak` touches resume logic, 14+ guard sites, and gate tables. **Risk of half-wired branch shipping.** Mitigated by exhaustive per-site guard table in §D (each row an explicit plan task), NOT by canonical boundary sentence alone.

5. **bkit repo's own E2E tier is "out of scope" today** — dogfooding `test:real` requires bkit-repo decision (grows real-stack test or declares `none`). Must sit outside consumer-facing `bkit:start/end` markers per repo-vs-consumer scoping rule. **Open question for plan.**

6. **`pnpm turbo run test:real --dry-run` detection** — monorepo existence probe is unproven against pinned turbo version. Design correctly routes to build-phase spike; fallback is documented and safe.

7. **Consumer mirror upgrade** — `docs/testing.md` managed-block edit and new `bkit-debug-soak.md` prompt must flow through install/upgrade mirror. Batched at session end per project rules, not per-edit.

## Scope

**Design scope aligns tightly with issue #143 brief.** The issue explicitly asks for:

1. ✓ Real-world testing gate for plan/build/debug workflows
2. ✓ Gate fails fast when real test exists + fails before fix (reproduce-first)
3. ✓ Gate passes when real test passes after fix (empirical-verify)
4. ✓ Graceful degradation when no runnable stack (loud audit, not silent skip)
5. ✓ Soak mode for iterative unknown-cause bugs ("instead of diagnose→remediate handoff")

The design adds exactly these without creep:

- No new magic-number constant (soak reuses MAX_DEBUG_ATTEMPT)
- No new config file type (reuses `test:real` script convention)
- No Unicode operators (all ASCII in workflow/prompt files)
- No consumer-facing internal refs (KN-/BAR- refs prohibited on always-written surfaces)

The design is **focused and boundary-respecting**. It does NOT attempt to solve:

- Paid API cost management (beyond run-last ordering + existing caps)
- Automated mock detection (stated as inherent ceiling, not in scope)
- bkit repo's own E2E strategy (deferred to plan phase as bkit-repo-specific decision, outside consumer-facing docs)

One boundary question: "Should plan be stateless (can verify on any repo) or stateful (requires runnable stack)?" The design chose stateless (plan-time static check, no-runnable-stack required), verified downstream by build/debug, which is the right asymmetry for a general tool.

## Action Items

**Proceed to planning with these carries:**

1. **Human Acceptance Scenario confirmation** (design-phase gate) — verify the Narrative, Success Criteria, Key Edge Cases, and Concrete Example are confirmed by the human reviewer. The design document structure supports this but the checkbox state is not visible from our read. **Recommend:** ping the issue tracker to confirm human has signed off on the Acceptance Scenario before planning begins.

2. **Turbo `--dry-run` probe validation** (build-phase spike) — before implementing capability resolution, validate that `pnpm turbo run test:real --dry-run` returns predictable exit status for missing tasks against the repo's pinned turbo version. If unreliable, fall back to the documented "include task and let turbo no-op" pattern (single-package `jq -e` path is safe; only monorepo probe is unproven).

3. **bkit repo `test:real` choice** (bkit-repo-specific decision) — decide whether bkit itself grows a `test:real` script or declares `[real-stack=off]`. This choice sits **outside** the `bkit:start/end` markers in `docs/testing.md` per repo-vs-consumer scoping rules. Carry into plan for resolution.

4. **OBSERVE_MODE guard coverage task itemization** (anti-half-wiring) — the design enumerates ~14 guard sites in §D table (lines 423–440). Each row must become an explicit plan task so no guard ships half-wired. This is the design's own top risk; the canonical boundary sentence in `.agents/workflows.md` prevents doc drift but does not enforce coverage.

5. **Soak cost-cap decision** (plan-time tuning) — the design runs `test:real` at reproduce-first + each run-tests + each soak iteration. For paid endpoints, decide in planning whether to cap soak iterations more tightly or run test:real only on final verify passes. Current unbounded iteration risk is documented; plan-time decision required before implementation.
