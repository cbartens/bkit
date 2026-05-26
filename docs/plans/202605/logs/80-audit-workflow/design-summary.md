Verdict: PASS

<!-- verdict:end -->

# Design Summary: bkit-audit Workflow Re-design

## Overview

The design introduces `/bkit-audit`, a peer workflow to `/bkit-design`, that performs read-only stack-aware code audits on any repository. The core innovation is a two-enrichment-step pipeline (stack-detect + skill-install) feeding 11 parallel universal-pattern lenses, where enrichment failures degrade gracefully rather than blocking the run. The pipeline produces a severity×class ranked audit report at `docs/audits/{FID}-audit.md` plus one sub-issue per workstream. Critical strengths: ~80% reuse of proven bkit patterns (`bkit-design` 10-step shape, `bkit-build-install-skills` skill-installer model, `bkit-design-brainstorm-ideate` lens skeleton), genuine stack-agnosticism via universal-pattern probes (zero library names), and offline resilience via `[skills=false]` escape hatch. The design successfully resolves all CONCERNS raised in two review cycles (review-1 on feasibility, review-2 on operability) through concrete mitigations: `confidence: low → CONCERNS` guard on stack-detect, `## Parse Errors` section in synthesiser with orchestrator gate, `## Missing Lenses` coverage manifest with grep-assert at Step 6, post-copy assertion on the canonical artifact, and intermediate progress logging on skill-install.

## Design Quality

The design demonstrates strong architectural reasoning:

- **Single-responsibility step isolation** — each of the 10 steps owns a distinct concern with independently-resumable outputs, preventing cascading failure (e.g., a failed install does not poison the valid stack report).
- **Schema-versioned contract** — the `audit-stack.md` schema is owned by its producer (`bkit-audit-stack-detect`), uses generic field names (`packageManager` not `IS_PNPM`), permits `unknown` values and `[]` empty lists, and versioned with `schemaVersion: 1` to handle future evolution.
- **Failure-isolation posture** — both enrichment steps (detect, install) are explicitly non-gating; degraded or absent enrichment lowers verdict to CONCERNS, never triggers Failure Path. This is the only way to achieve "runs on any stack" without false-negative fail-fast on ambiguous repos.
- **Two-layer separation** — orchestrator owns tracker/git/lock; all 16 agents are leaves (non-tracker, non-mutating except for Edit/Bash where necessary). Proven pattern reused from `bkit-design.md`.
- **Universality constraint with enforcement** — lens prompts carry zero library names (checked by grep gate per acceptance criteria); stack-specificity arrives purely through `audit-stack.md` + installed skills + target repo's docs.

**Trade-offs are explicit and justified.** Token cost (11 parallel Opus lenses, ~4× design triplet) is accepted as fair for 11-lens diversity; a future lever is per-lens model downgrade. No mechanical universality enforcement (lint gate) is stated as accepted residual risk, hedged by per-prompt discipline clause + grep-gate in acceptance criteria. External registry dependency is acknowledged with `audit-install-skills.md` version capture as reproducibility hedge. The 11-wide parallel fan-out (3.6× largest existing) is flagged for plan-time validation.

## Acceptance Scenario

The acceptance scenario adheres to `docs/plans/template.md` § Acceptance Scenario → Spec:

- **Narrative** ✓ — user POV, 1 sentence, describes what the developer does (invoke `/bkit-audit` ad-hoc) and what they get (stack report, 11-lens audit findings, matrix + workstreams). Covers the offline edge case explicitly.
- **Success Criteria** ✓ — 5 bullets, all measurable/testable: (1) /bkit-audit ships as 10-step peer to /bkit-design, (2) runs to full strength on universal lenses regardless of enrichment, (3) grep-checkable zero library names, (4) severity×class matrix + Missing Lenses gate, (5) offline runs complete without network at skill-install. Each is verifiable.
- **Key Edge Cases** ✓ — 6 design-stage cases, all cross-feature interactions or failure modes: degraded stack-detect, network unavailable, single-contract feeding 11 readers, lens-output scaling, concurrency with FID suffixes, skill provenance/reproducibility. Each captures the risk the design is built to handle.

No Concrete Example or Derived Test Matrix are required at design phase (per template); those are plan-phase expansions. The scenario is production-ready for plan handoff.

## Feasibility

The design passed two rigorous reviews without blockers:

- **Stack feasibility** (review-1) — all load-bearing mechanisms are clones of shipping code: 10-step orchestrator (`bkit-design.md`), skill-installer (`bkit-build-install-skills.md`), lens skeleton (`bkit-design-brainstorm-ideate-1`), workstream sub-issue machinery (`design-organise` + Step 9). Proven patterns. The PoC smoke tests (clone-and-slug-swap, skill dry-run, universality grep) de-risk the orchestrator backbone and lens authoring independently.
- **Operability feasibility** (review-2) — 13 failure modes are enumerated with detection, blast radius, and recovery assessed. Every CRITICAL observability gap is resolved: (C-1) `confidence: low` guard added to stack-detect, (C-2) `## Parse Errors` section surfaced in synthesiser, (C-3) `## Missing Lenses` grep-gated at orchestrator. Every OPTIONAL ergonomics gap is addressed: (O-1) Step 4 Failure Path carries `[skills=false]` hint, (O-2) intermediate progress logging on skill-install, (O-4) post-copy assertion on canonical artifact. Four OPTIONAL recommendations are incorporated into the design doc (see Design Workstreams WS-2, WS-4, WS-5, WS-6).

The only latent limitation is that `audit-*` skills do not yet exist in the public registry — Step 4 will almost always be a no-op in v1. This is acceptable and fully mitigated: the non-gating design absorbs it, the audit runs to full strength on universal lenses regardless, and the skill-enrichment benefit is latent-but-not-blocked pending community/bkit authors shipping `audit-nextjs`, `audit-vitest`, etc.

## Acceptance Scenario

Adheres fully to `docs/plans/template.md` § Acceptance Scenario → Spec:

- **Narrative (design phase):** User POV, 1 sentence: developer invokes `/bkit-audit` ad-hoc, gets back stack-aware audit findings + workstream sub-issues. Explicitly covers offline resilience.
- **Success Criteria (design phase):** 5 bullets—all measurable, all verifiable. Each criterion maps to a concrete deliverable: 10-step workflow, degraded-enrichment resilience, zero library names in lenses (grep-checkable), severity×class matrix + Missing Lenses gate, offline-complete audit with `[skills=false]` escape.
- **Key Edge Cases (design phase):** 6 cross-feature interactions and failure modes—degraded stack-detect, network unavailable, single-contract feeding 11 readers, output scaling, concurrency with FID suffixes, skill provenance tracking. Each is a real risk the design is built to handle.

The scenario is design-complete and ready for plan expansion (which will add Concrete Example, Derived Test Matrix, Edge Case table per template).

## Synthesis Coverage

The design brainstorms produced three distinct approach trees:

1. **lens-1** — Orchestrator architecture: Clone-and-extend `bkit-design` skeleton (A—KEPT); Merged preflight agent (B—REJECTED); Charter-driven thin lenses (C—REJECTED).
2. **lens-2** — Detection & enrichment integration: Linear pipeline + flat-versioned schema + pure-universal lenses (A—KEPT); Inline stack context with lens self-discovery (B—REJECTED).
3. **lens-3** — Enrichment failure posture: Best-effort never-gates (A—KEPT); Fail-fast gating (B—REJECTED); Skills-first thin lenses (C—REJECTED).

The final design is a **merge of the three strongest approaches**: lens-1 A (80% reuse + inlined lenses) + lens-2 A (step isolation + clean rewrite + versioned schema) + lens-3 A (enrichment-never-gates + versioned schema + coverage gate + offline escape). Each lens addresses a distinct concern; no approach was fully adopted as consensus, and no good option was discarded. The synthesis is sound.

## Risks

**Mitigation status by risk severity:**

| Risk                                                                            | Severity          | Mitigation                                                                                                                                                               | Status       |
| ------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------ |
| Network dependency at audit time (new; build/ship precedent in install-skills)  | MEDIUM            | `[skills=false]` escape + non-gating design absorbs no-skill fallback                                                                                                    | Mitigated    |
| Single `audit-stack.md` contract feeding 11 parallel readers                    | MEDIUM            | `schemaVersion` assertion + `unknown`-tolerant fields + `confidence: low → CONCERNS` guard (C-1) + coverage-manifest gate (C-3)                                          | Mitigated    |
| Silent wrong-context propagation (plausible-but-incorrect stack-detect)         | **CRITICAL**      | `confidence: low                                                                                                                                                         | medium       | high` self-assessment in Detection Coverage; low forces CONCERNS; orchestrator surfaces in Step 3 comment (review-2 C-1) | **RESOLVED** |
| Finding block parse failures silent drop                                        | **CRITICAL**      | `## Parse Errors` section in synthesiser with raw block + reason; orchestrator gate checks presence + reads None (review-2 C-2)                                          | **RESOLVED** |
| Coverage manifest (`## Missing Lenses`) not itself gated                        | **CRITICAL**      | Orchestrator Step 6 gate adds grep-assertion on `## Missing Lenses` section presence; absence → re-issue then Failure Path (review-2 C-3)                                | **RESOLVED** |
| Canonical artifact copy fails at close                                          | OPTIONAL          | Post-copy assertion: orchestrator gates that `docs/audits/{FID}-audit.md` exists and is non-empty (review-2 O-4)                                                         | **RESOLVED** |
| Step 4 skill-install network hang has no intermediate signal                    | OPTIONAL          | Agent logs per-query progress (`skills find audit-{token} → hit/miss/error`) before next (review-2 O-2); operator can detect hang before 3600s                           | **RESOLVED** |
| `[skills=false]` escape is not discoverable from Failure Path comment           | OPTIONAL          | Step 4 Failure Path comment body includes hint: "Re-invoke with `[skills=false]` to bypass skill install" (review-2 O-1)                                                 | **RESOLVED** |
| `audit-*` skills do not exist in registry yet                                   | KNOWN LIMITATION  | Non-gating design; audit runs to full strength on universal lenses regardless; skill enrichment is latent until community/bkit authors them (v1 limitation, not blocker) | Acceptable   |
| Universality constraint (zero library names in lenses) unenforceable by tooling | ACCEPTED RESIDUAL | Per-prompt `**Lens discipline:**` clause; grep-gate in acceptance criteria; review-time discipline                                                                       | Accepted     |
| Ship-prune transience of auto-installed `audit-*` skills                        | LOW               | Version capture in `audit-install-skills.md` makes divergence explainable; reproducibility hedge is version log not persistence                                          | Noted        |

All three CRITICAL gaps raised in review-2 are explicitly resolved in the v3-organised design. The design is operationally sound.

## Scope

The brief asks for: stack-detect + skill-install + universal-pattern lenses (Phases 1–2; Phase 3 WebSearch deferred). Audit is read-only, ad-hoc-only, terminal at In Review.

The design delivers exactly this scope:

- ✓ **Phase 1** — Stack-detect agent + versioned schema (WS-1) + skill-install agent (WS-2).
- ✓ **Phase 2** — 11 universal-pattern lenses (WS-3) + synthesiser (WS-4) + organise + summary (WS-5).
- ✓ **Phase 3 (deferred)** — WebSearch augmentation noted as a Step-5 follow-up slot, not designed, explicit in design doc.
- ✓ **Read-only, ad-hoc, terminal** — no mutations outside Step 10 close, `/bkit-audit [target]` at ad-hoc slash-command tier, state → `In Review` (hard stop, no auto-Done).

No scope creep. Out-of-scope items are tracked for follow-up (`docs/pending.md` + decision log for `docs/decisions.md` at build time).

## Action Items

None. The design is PASS-ready.

All CONCERNS from review-1 and review-2 are resolved in the v3-organised artifact:

- Finding-format reconciliation: YAML `finding` block + `awk` state-machine is the single canonical format (review-1 C1, decided).
- Stale `bkit-audit.md` registry block rewrite: full 7-item scope enumerated for plan (review-1 C2, scoped).
- Phase-label decision: NO new `Audit` phase label (review-1, resolved and documented).
- Stack-detect confidence guard: `confidence: low → CONCERNS` rule implemented (review-2 C-1, resolved).
- Finding parse-error surfacing: `## Parse Errors` section with orchestrator gate (review-2 C-2, resolved).
- Coverage-manifest gate: `## Missing Lenses` grep-assertion at Step 6 (review-2 C-3, resolved).
- Failure Path hint on Step 4: `[skills=false]` recovery hint specified (review-2 O-1, resolved).
- Progress logging on skill-install: intermediate per-query stdout logging specified (review-2 O-2, resolved).
- Post-copy assertion at close: `docs/audits/{FID}-audit.md` existence gate specified (review-2 O-4, resolved).

The design-apply-review step (v2 → v3) successfully incorporated all review guidance. The v3-organised artifact is production-ready for plan handoff.
