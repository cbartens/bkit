Verdict: PASS

<!-- verdict:end -->

# Design Summary: `/bkit-audit` Workflow (Pass 3) — Minimal Conditional-Lens Keystone

## Overview

Pass 3 extends the PASS'd 10-step `/bkit-audit` baseline (11 universal lenses, stack-detect + skill-install enrichment) with a **minimal conditional-lens model** that gates lenses on applicability flags. The design adds five new conditional lenses (`ui-ux`, `supply-chain`, `data-layer`, `ai-llm`, `reference-signal`) plus the keystone infrastructure: a `## Applicability` block inlined into `audit-stack.md` with five named boolean flags, a new `requires:` frontmatter key on every lens, a three-state `## Missing Lenses` coverage manifest (`ran` | `N/A — not applicable` | `crashed`), and operator escape hatches (`[lenses=...]` restricted launch, `[applicability-override=...]` force-flag, `--with-websearch` opt-in network). The design resolves all CRITICAL review gaps from passes 1 and 2 via five tagged resolutions: **R1-B1** (canonical 16-slug list inlined in workflow Step 6), **R1-B2** (down-rank enforced by organise self-verify grep-assert), **R1-B3** (renderer output locked to verbatim YAML fence echo), **R2-O1** (synthesiser post-process closes field-omission bypass), **R2-O2** (orchestrator pre-launch cleanup + excluded-slot stubs preserve array invariant). The pipeline grows 11 lenses → 16 slots; parallel fan-out cost ~4.5× design-triplet (frozen per comment 4539759063 §2, no Sonnet downgrade). Core strength: ~95% reuse of Pass-2 baseline with zero new step types, zero new agent classes, and one new schema-versioned contract surface (`audit-stack.md` v1 → v2).

## Design Quality

**Strengths:**

- **Schema-versioned single-contract model** — the `## Applicability` block lives in `audit-stack.md` (one file), versioned with `schemaVersion: 2`, and owned by its producer (stack-detect). All 16 lens consumers read one contract, eliminating multi-surface drift (a brainstorm-3 sidecar was rejected for this reason).
- **Belt-and-braces gating without silent-skip** — conditional lenses launch unconditionally and self-no-op when their flag is false (writing `# Not Applicable` + exiting cleanly). A stack-detect flag bug cannot silently drop a lens — the launch artifact and `## Missing Lenses` row both persist with a flag-named reason.
- **Machine-enforceable reference-signal down-rank** — the `source: reference-repo` optional field + organise self-verify grep-assert prevent prose drift on the "never top/critical" constraint (mirrors existing orphan/DAG-cycle self-verify discipline). Rendering is locked to verbatim YAML fence echo (R1-B3) so the literal-string grep is sound.
- **Minimal surface area** — one new block in `audit-stack.md`, one new frontmatter key, one new coverage state. No sidecar, no roster artifact, no new step. ~95% reuse of proven patterns.
- **Operator recoverability** — `[lenses=...]` partial-rerun and `[applicability-override=...]` force-flag close the 10×-scale and 3am-on-call failure modes without architectural commitment.

**Trade-offs and accepted residuals:**

- **Token cost grows to 16 Opus lenses** (~4.5× design-triplet); Sonnet-downgrade lever stays documented but not exercised per 4539759063 §2. Cost trajectory acknowledged as acceptable for 16-lens diversity pending real-world usage.
- **Tool-surface heterogeneity** — `supply-chain` carries allowlisted `Bash` (read-only allowlist: `git log` / `git rev-parse` / `git cat-file` / `cat` / `jq` / `grep`; NEVER `git checkout` / `reset` / `push` / `commit`); `reference-signal` carries `WebSearch`. The "read-only reviewer" pattern now has 3 sub-shapes. Justified once in `.agents/prompts.md` § Tool set patterns, with honest "discipline-not-sandbox" caveat (the allowlist is author guidance, not a runtime sandbox).
- **Network surface count grows 1 → 2** (Step 4 skill-install + Step 5 reference-signal lens, both opt-in). Pass-2 prose "the only network surface" is explicit in docs to update.
- **Applicability false-negative is silent by construction** — a mis-detected `hasWebSurface=false` renders as `N/A — not applicable` (not a finding). Mitigations: (a) inverse-evidence guard (`hasWebSurface=false but frameworks contains UI-shaped token` → CONCERNS), (b) operator-visible Applicability summary in Step 3 tracker comment, (c) `[applicability-override=...]` re-invocation. None eliminate the risk; documented explicitly.

## Acceptance Scenario

**Narrative:**
A developer invokes `/bkit-audit` ad-hoc on any repository. The workflow detects the stack, raises applicability flags, opportunistically installs matching `audit-*` skills, and fans 16 lenses out in parallel. Conditional lenses self-no-op when their surface is absent (recorded as **N/A — not applicable**, distinct from "ran clean"). The optional reference-signal lens runs only when `--with-websearch` is passed. The run terminates at `In Review` with a single severity×class ranked report at `docs/audits/{FID}-audit.md` and one workstream sub-issue per finding cluster.

**Success Criteria:**

1. `/bkit-audit` ships as a **10-step** orchestrator with full FID/lock/status.json/gate/per-step tracker comment/Failure Path ceremony; ad-hoc-only; terminal at `In Review`.
2. Step 5 fans out **16 lens slots**; conditional lenses self-no-op when `requires:` flag is false, and `## Missing Lenses` records every slot as one of three explicit states (`ran` | `N/A — not applicable ({flag}=false)` | `crashed`).
3. Lens prompts are library-name-free: universality grep-gate across `.agents/prompts/bkit-audit-lens-*.md` returns zero library-name matches (extended regex set per review-1 OPTIONAL #1: UI/design-system/DB platform/LLM provider names + semantic-CI exception for `supply-chain`).
4. Reference-signal findings are demonstrably ranked **strictly below all internal-evidence findings** — never matrix top row, never ranked-list top 3, never executive summary — enforced by organise self-verify grep-assert (R1-B2, R1-B3).
5. An audit run on bkit's own repo (no UI, no DB, no LLM, no public web surface) **no-ops cleanly**: `ui-ux`, `data-layer`, `ai-llm` rows show `N/A — not applicable ({flag}=false)`, NOT `ran clean`; the audit terminates with a valid report.

**Key Edge Cases:**

- **False-negative applicability flag (silent miss):** stack-detect mis-reads as `hasWebSurface=false` on a real frontend repo. Mitigations: (a) inverse-evidence guard emits CONCERNS if `frameworks` contains UI-shaped token despite false flag, (b) Step 3 tracker comment surfaces Applicability summary for operator sanity-check, (c) `[applicability-override=hasWebSurface=true]` re-invocation lets operator force run.
- **False-positive applicability flag (noise findings):** lens runs on absent surface. Each conditional lens carries a sanity-probe-before-emit clause: if first-pass probe finds zero files even though flag is true, emit `# Not Applicable (flag=true but no surface evidence)` and exit instead of inventing findings.
- **Reference-signal network reproducibility:** two `--with-websearch` runs can consult different reference repos. The lens captures repo names + commit/tag + search query in `## Reference Repos Used` — same provenance discipline as `audit-install-skills.md`. Reproducibility is "explainable", not "identical".
- **Supply-chain Bash surface heterogeneity:** only the `supply-chain` lens carries `Bash` (allowlisted read-only commands). Allowlist is prompt-author discipline, not runtime sandbox. Future edits MUST justify widening the allowlist in the same edit; caveat written into prompt + `.agents/prompts.md`.
- **AI/LLM lens self-reference:** running the `ai-llm` lens on a repo whose own source ships LLM prompts (e.g. `.agents/prompts/*.md`) requires explicit `.agents/**` / `.cursor/**` / `.claude/**` scope exclusion to avoid mis-classifying agent assets as product LLM surfaces.

**Adherence to template spec:**
All three sections (Narrative, Success Criteria, Key Edge Cases) follow `docs/plans/template.md` § Acceptance Scenario → Spec. The scenario is design-complete and ready for plan expansion (which will add Concrete Example and Derived Test Matrix per template).

## Breaking Changes

**Enumerated schema / contract changes visible to external consumers:**

- **`audit-stack.md` schema bump v1 → v2** — adds `## Applicability` block (5 named flags), `## Applicability — Flag Inventory` (enum), `## Applicability Overrides` (audit trail), `## Applicability Disagreement` (inverse-evidence guard). Lenses assert `schemaVersion >= 2` and degrade gracefully on v1. Optional field `heuristicDepthLimit:` added to `## Detection Coverage` (additive).
- **Per-lens frontmatter addition** — new `requires:` key on all 16 lens prompts (values: `always` + 5 flag names; default `always` if omitted).
- **`## Missing Lenses` now three-state manifest** — replaces Pass-2's implicit two-state with explicit `ran` | `N/A — not applicable ({reason})` | `crashed ({reason})` rows, one per slot.
- **`audit-stack.md ## Applicability` flag-naming** — public API (lenses read these flags; orchestrator escape-hatches reference them). Flag names: `hasWebSurface`, `hasDb`, `hasLLM`, `hasCi`, `hasNetwork` (no breaking change to their names from design to final; stable).
- **Orchestrator input flags** — new `--with-websearch`, `[lenses=slug,...]`, `[applicability-override=flag=bool]` surface (ad-hoc-only caller-facing interface; internal).
- **Fan-out slot count grows 11 → 16** — `status.json#steps[5].artifacts` is now a fixed-length 16-entry array. Downstream readers (bkit-trackers, cloud orchestration) MUST treat as variable-length list, not hard-compare to 11 or 16.

**Backward compatibility:**

- Stack-detect output is v2 (schemaVersion bump). Lenses from Pass-2 (expecting v1) MUST degrade or fail. This is acceptable because Pass-2 lenses are being updated to include `requires: always` in WS-3, closing the version gap.
- No workflow file output-artifact names change; no new step names; no new agent slugs except the 5 new lenses.

## Feasibility

**Design feasibility (Pass 3 extensions on Pass-2 PASS baseline):**

The design adds no new step types, no new agent classes, and zero new orchestrator ceremonies beyond input parsing and extended gates. All load-bearing mechanisms reuse proven code:

- **Orchestrator extensions** — clone-and-modify of existing Step 2/3/5/6 gates; no new MCP calls.
- **Lens layer** — 11 existing lenses + 5 new lenses under the same `bkit-design-brainstorm-ideate-1` skeleton, same Opus/high/M(50) assignment.
- **Synthesiser / organise / summary** — Pass-2 agents with targeted extensions (3-state coverage rendering, reference-signal down-rank grep-assert). No new tool surfaces except organise's existing Bash (already used for self-verify).
- **Stack-detect schema bump** — v1 → v2 within the same prompt; no new agent.
- **Input escape hatches** (`[lenses=...]`, `[applicability-override=...]`, `--with-websearch`) — orchestrator parsing only; no new infrastructure.

**Plan-phase risks and mitigations:**

- **`status.json` 16-slot array compat** — review-2 O-5 gates downstream readers at plan time (grep `bkit-trackers.ts` + any cloud code for hard-coded length comparisons against `steps[5]`).
- **Canonical-16-slug consistency** — review-1 B-1 gates at plan time (grep-assert workflow Step 6 inline enum = synthesiser enum = lens-prompt `requires:` value union).
- **Organise renderer output contract** — review-1 B-3 gates at plan-time self-test (feed organise a sample reference-signal finding; assert rendered output contains literal `source: reference-repo` token).
- **Supply-chain Bash allowlist discipline** — review-1 OPTIONAL #2 + review-2 O-6 gates at plan time (grep `NEVER git checkout` returns ≥1 match in the prompt body).
- **Tracker inline-pair convention** — review-1 OPTIONAL #5 gates at plan time (confirm `bkit-audit.md` uses `bkit:tracker` inline pairs, not older substitution-from-trackers.md model).

**Build-side deliverables (WS-1..WS-8):**

- 5 new lens prompts (`ui-ux`, `supply-chain`, `data-layer`, `ai-llm`, `reference-signal`).
- 1 schema-bumped stack-detect prompt (v1 → v2).
- 3 extended synthesiser / organise / summary prompts.
- 1 extended orchestrator (`bkit-audit.md`).
- 3 registry/metadata file updates (`.agents/prompts.md`, `.agents/workflows.md`; `.agents/docs.md` unchanged).

All feasible within the existing bkit pipeline; no new language, no new tool surface beyond Bash (allowlisted) and WebSearch (opt-in, isolated to reference-signal lens).

## Synthesis Coverage

**Brainstorm outputs:**

- **Brainstorm-1 (lens-1, lens-2, lens-3)** — 3 orthogonal concern trees (orchestrator architecture, detection/enrichment, enrichment failure posture).
- **Brainstorm-2 A** (merged) — strict signal-tier separation via `source:` marker on findings.
- **Brainstorm-2 B** (rejected) — flat fan-out without applicability flags (false-all-clear problem explicitly identified).
- **Brainstorm-3 A** (merged, with B-1/B-2/B-3 refinements) — risk-premortem mitigation layer (operator escapes, inverse-evidence guard, fixed-slot array).
- **Brainstorm-3 B** (rejected) — self-gating lenses without centralised applicability block.
- **Brainstorm-3 C** (rejected) — three-track Step 5 (universal / conditional / external-signal).

**Approaches kept vs dropped:**

- **KEPT (Brainstorm-1 A):** flag-stamped lens roster (inlined `## Applicability` + `requires:` frontmatter + launch-and-self-no-op + 3-state coverage) — smallest deviation from baseline, ~95% reuse, no new step type.
- **MERGED (Brainstorm-2 A):** strict signal-tier separation via `source:` field, machine-enforceable down-rank — additive, non-breaking contract.
- **MERGED (Brainstorm-3 A):** risk-premortem mitigations (`[lenses=...]`, `[applicability-override=...]`, inverse-evidence guard, fixed-slot array, UI/UX no-op acceptance test) — direct mitigations to 10×-scale + 3am failure modes.
- **DROPPED (Brainstorm-1 B):** two-tier fan-out (5a always-on + 5b conditional) — pipeline grows 10 → 11 steps; pre-launch filter is the silent-skip footgun; diverges from `/bkit-design` pattern.
- **DROPPED (Brainstorm-1 C):** roster artifact `audit-lens-roster.md` — single point of failure (stack-detect bug silently drops lens); two-file edit per new lens.
- **DROPPED (Brainstorm-3 B):** self-gating lenses without centralised block — gating logic distributed across N prompts; no single source of truth.
- **DROPPED (Brainstorm-3 C):** three-track Step 5 — triples gate logic; introduces track-taxonomy concept that diverges from `/bkit-design`'s flat fan-out.

**Synthesis assessment:**
The final design is a **merge of the three strongest approaches**: Brainstorm-1 A (80% reuse) + Brainstorm-2 A (machine-enforceable down-rank) + Brainstorm-3 A (operator escapes + inverse-evidence guard). Each addresses a distinct concern:

- **1 A** — architectural reuse + minimal surface area.
- **2 A** — reference-signal safety (external signal never top-critical).
- **3 A** — operational robustness (recoverability on failure).

No approach was fully adopted as consensus, and no good option was discarded. The synthesis is sound and stress-tests the keystone with 4 conditional lenses (UI/UX + data-layer + AI/LLM + supply-chain) before #207 extends the flag taxonomy.

## Risks

**Documented risks with mitigation status:**

<!-- prettier-ignore -->
| Risk | Severity | Mitigation | Status |
| --- | --- | --- | --- |
| Conditional-lens false-negative N/A is silent by construction | **CRITICAL** | (a) inverse-evidence guard (`hasWebSurface=false but frameworks contains UI-shaped token` → CONCERNS); (b) Step 3 tracker-comment Applicability summary; (c) `[applicability-override=...]` re-invocation. None eliminate the risk; documented explicitly. | Mitigated |
| Conditional-lens false-positive (running on absent surface) | MEDIUM | Sanity-probe-before-emit clause: if zero matching files despite flag=true, emit `# Not Applicable (flag=true but no surface evidence)` and exit (not inventing findings). 25-finding cap + explicit `location:` fields make noise identifiable. | Mitigated |
| Reference-signal network reproducibility | MEDIUM | `## Reference Repos Used` captures repo names + commit/tag + search query (same provenance discipline as `audit-install-skills.md`). Reproducibility is "explainable", not "identical". | Mitigated |
| Second network surface opens with `--with-websearch` | MEDIUM | Opt-in only. Pass-2 prose "the only network surface" must be updated to "two opt-in network surfaces: Step 4 and Step 5 reference-signal". NOT a hidden surface. | Mitigated |
| Supply-chain `Bash` allowlist is prompt-level discipline | MEDIUM | Allowlist documented in prompt body + `.agents/prompts.md` § Tool set patterns. "Discipline, not sandbox" caveat explicit. Plan-time grep-gate verifies `NEVER git checkout` survives edits. Future widening MUST justify in same edit. | Mitigated |
| `status.json#steps[5].artifacts` grows 11 → 16 | MEDIUM | Downstream readers MUST treat as variable-length list (review-2 O-5 gates at plan time). No hard-comparison to 11 or 16 in bkit-trackers.ts / cloud code. | Mitigated |
| `audit-*` skills do not exist in registry yet (known Pass-2) | ACCEPTED KNOWN | Non-gating design. Audit runs to full strength on universal lenses regardless. Skill enrichment is latent until community/bkit authors them. v1 limitation, not blocker. | Acceptable |
| Universality constraint (zero library names) unenforceable | ACCEPTED RESIDUAL | Per-prompt `**Lens discipline:**` clause + grep-gate in acceptance criteria. Review-time discipline (mirrors Pass-2). | Accepted |
| AI/LLM lens self-reference on agent prompts | LOW | Explicit `.agents/**` / `.cursor/**` / `.claude/**` scope exclusion in lens prompt body. Self-classification risk if exclusion is forgotten; mitigated by plan-phase review. | Noted |
| Ship-prune transience of auto-installed `audit-*` skills | LOW | Version capture in `audit-install-skills.md` makes divergence explainable. Reproducibility hedge is version log not persistence (same posture as Pass-2). | Noted |
| Token cost grows to ~4.5× design-triplet | ACKNOWLEDGED | Frozen per comment 4539759063 §2 (no Sonnet downgrade this pass). Revisit after real-world usage if cost binds in production. | Deferred |

**Out-of-scope risks carried from Pass-2:**

- Stack-detect on polyglot / non-Node repos (single contract feeding 16 readers).
- External skill registry dependency.
- Adversarial review of synthesis (audit is read-only terminal).

## Outstanding Questions

**Sourced from design-v3-organised.md § Risks & Open Questions:**

- **Q: Sonnet downgrade for selected conditional lenses (cost lever).** — **Recommended:** Keep frozen at Opus/high this pass per comment 4539759063 §2. Track the 16-lens cost trajectory in production; revisit downgrade only if usage patterns show bindings. The lever is documented and ready for activation if needed. This is the right default (don't optimize prematurely) until real-world data exists.

- **Q: Skill source constraint.** — **Recommended:** Keep the current posture (10-skill cap, no additional source constraints beyond the existing parity with build-agent). The non-gating design absorbs missing/unavailable skills already. Defer source-reputation constraints to a follow-up if the registry grows messy.

- **Q: `audit-{framework}` skill authoring.** — **Recommended:** Community/bkit `audit-nextjs`, `audit-vue`, `audit-prisma`, `audit-langchain`, `audit-github-actions` etc. do not exist today. The audit runs at full strength on universal probes regardless (non-gating). The headline enrichment value is latent. Plan for a follow-up issue (#207 boundary?) to seed a minimal set of community-friendly audit skills, or track in `docs/pending.md` as a future opportunity.

- **Q: #207 boundary — extended flag taxonomy.** — **Recommended:** This pass ships the gating mechanism + 4 conditional lenses (`ui-ux`, `data-layer`, `ai-llm`, `supply-chain` though always-on by default). #207 extends the flag taxonomy (`hasMobileApp`, `hasGraphQL`, `hasGRPC`, per-language sub-lenses) WITHOUT breaking existing flags. Define #207's extended flag schema there (out of scope here).

- **Q: Phase 3 (WebSearch) full scope vs Pass-3 reference-signal lens.** — **Recommended:** This pass lands the FIRST concrete use of the reserved `--with-websearch` flag (reference-signal lens as finder of shared-convention divergence vs reference repos). Future Phase-3 augments (e.g. per-lens WebSearch enrichment like `"{stack} {lens} best practice {year}"` query) remain deferred. They would use the same `hasNetwork` flag without re-plumbing, tracked as a `docs/pending.md` candidate.

_These recommendations are advisory only and do NOT influence the Verdict._

## Scope

**Brief asks for:**

- Stack-detect + skill-install (Phases 1–2).
- Universal-pattern lenses with conditional gating on applicability flags (Phase 1b, new in Pass 3).
- Phase 3 WebSearch deferred (reserved slot).

**Design delivers:**

- ✓ **Phase 1** — Stack-detect agent + `audit-stack.md` v1 → v2 schema bump with `## Applicability` block + heuristics + override + disagreement guard.
- ✓ **Phase 1b (new in Pass 3)** — Conditional-lens keystone (WS-8): `requires:` frontmatter + launch-and-self-no-op pattern + 3-state coverage manifest + operator escapes.
- ✓ **Phase 2** — Skill-install agent + 16 universal-pattern lenses (11 baseline + 5 new) with conditional gating + synthesiser + organise + summary.
- ✓ **Phase 3 (deferred)** — WebSearch augmentation: first concrete use (reference-signal lens) lands; further per-lens WebSearch enrichment deferred to follow-up.
- ✓ **Read-only, ad-hoc, terminal** — no mutations outside Step 10 close, `/bkit-audit [target]` at ad-hoc tier, state → `In Review` (hard stop).

**No scope creep.** Out-of-scope items tracked for follow-up (`docs/pending.md` + decision log for `docs/decisions.md` at build time): legacy `bkit-utility-audit-*` deletion, per-lens fixers, CI scheduling, cross-repo aggregation, live runtime-signal lens (#83), `/bkit-debug` hint integration (#94), rendered-result UX screenshot review (#206), web SEO/AIO/IA + analytics + web-perf + DX + extended conditional-lens model (#207).

## Action Items

None. The design is PASS-ready for planning.

All CRITICAL review gaps from passes 1 and 2 are resolved in this Pass-3 v3-organised artifact via five tagged resolutions:

- **R1-B1 (review-1 CRITICAL):** Canonical 16-slug list inlined in `bkit-audit.md` Step 6 inline enum (single source of truth); synthesiser prompt enum + lens `requires:` value union are derived views, checked by WS-K plan-time grep-assert.
- **R1-B2 (review-1 CRITICAL):** Reference-signal down-rank enforcement lives in organise self-verify grep-assert (not orchestrator post-step gate); mirrors existing orphan/DAG-cycle self-verify discipline.
- **R1-B3 (review-1 CRITICAL):** Organise renderer-output-format locked to verbatim YAML fence echo so `source: reference-repo` and `confidence: low` render as literal start-of-line tokens, greppable.
- **R2-O1 (review-2 CRITICAL):** Synthesiser R2-O1 post-process catches reference-signal field-omission (missing `source:` or `confidence:` fields) and adds to `## Parse Errors`, preventing silent bypass.
- **R2-O2 (review-2 CRITICAL):** Orchestrator `[lenses=...]` excluded-slot handling: (a) pre-launch stale-artifact cleanup deletes prior-run artifacts, (b) excluded slots get orchestrator-written `# Not Applicable` stubs, preserving 16-slot array invariant + row-per-slot grep-assert.

All OPTIONAL review recommendations are applied (8 items, review-1 OPTIONAL #1–5 + review-2 O-2/O-3/O-4/O-6). No items declined.

## Recommended Next Step

**Frame for human review (HARD STOP — design is terminal, not auto-triggering /bkit-plan):**

The issue body flags "Confirm the version split before /bkit-plan" as a plan-phase gate. This design is a HARD STOP awaiting explicit human confirmation that:

1. **Keystone correctness** — Does the `## Applicability` block inlined + `requires:` frontmatter + launch-and-self-no-op + 3-state coverage genuinely fix the false-all-clear problem? Validate: run `/bkit-audit` on bkit's own repo and confirm UI/UX row shows `N/A — not applicable (hasWebSurface=false)`, NOT `ran clean`.

2. **Down-rank enforceability** — Does the `source: reference-repo` field + organise self-verify grep-assert close the "reference-signal must never be top/critical" requirement without prose drift?

3. **Tool-surface invariant** — Does `supply-chain` Bash-allowlist + `reference-signal` WebSearch fit cleanly into `.agents/prompts.md` § Tool set patterns, or do they require separate pattern definitions?

4. **Workstream re-cut** — Do WS-K + WS-3Δ + WS-4Δ + WS-5Δ + WS-6Δ + WS-7Δ consolidate cleanly into Pass-2 WS-1..WS-7 backbone, or should build-side treat Pass-3 as a fresh decomposition?

5. **`audit-applicability.md` sidecar rejection** — Brainstorm-3 A proposed a sidecar. The decision to inline into `audit-stack.md` instead ties applicability to the stack-detect schema bump cadence. Is this the right trade?

6. **Network-surface count update** — Confirm the rewritten `.agents/workflows.md bkit-audit.md` block + `.agents/prompts.md` § Audit Phase rationale both update the "only network surface" prose to "two opt-in network surfaces" together.

Once confirmed, proceed to `/bkit-plan` with the understanding that:

- Spike Phase 1 (WS-1..WS-8) validates the conditional-lens model end-to-end on bkit's own repo.
- Spike Phase 2 (WS-3Δ..WS-7Δ) ships the 5 new lenses and registry updates.
- Build Phase follows with full orchestrator + subagent implementation.
