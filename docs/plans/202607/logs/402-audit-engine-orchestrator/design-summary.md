Verdict: PASS

<!-- verdict:end -->

# Design Summary

## Overview

This is Pass 4 (reconciliation) of the `/bkit-audit` engine design, chartering three peer workstreams (WS-A #402, WS-B #403, WS-C #405) for three independent `/bkit-plan` runs. The design carries forward the Pass-3 architecture (10-step orchestrator, stack-detect + skill-install enrichment, conditional-lens keystone, YAML finding schema, reference-signal down-rank, operator escapes) unchanged and reconciles five post-PASS drifts: contract paths and state format (Task 1: `.agents/` → `.bkit/`, `status.json` → `status.jsonl`); workstream decomposition (Task 2: WS-1..WS-8 → A1..A7 + WS-B + WS-C); lens charter (Task 3: 11 universal + 5 conditional → 13 universal + 5 conditional = 18 total, absorbing 10 post-design amendments); synthesiser upgrade (Task 4: dedup → **correlate**, adding the silent-corruption-candidate rule); version target (Task 5: `4.11.0` with A+B+C in one minor).

The design is self-contained: the three plan runs do not read each other or the issue thread. WS-A (#402) owns the contract declaration and the orchestrator; WS-B (#403) owns 13 always-on lenses; WS-C (#405) owns 5 flag-gated lenses. The cross-workstream contract is restated inside each charter (X1–X4 handshakes). WS-B and WS-C require only A1 + A2 from WS-A; the A6/A7 interleave awaits both peers, resolving the issue-level cycle into a sub-plan DAG.

## Design Quality

The design is thorough and mechanically rigorous. Every amendment has an executable landing site (subject:, signal:, evidence:, ## Suggested Guards, narrowed debt clause). The false-all-clear invariant — the design's load-bearing property — is enforced at three separate points: organise self-verify (refuses verdict if manifests missing), Step-7 orchestrator gate, and Step-10 post-copy assert on the published file. Reason-string contract is pinned to substituted form only, guarded by a dedicated parity assertion to catch literal-`flag=` drift. Signal-enum parity is now three-way (workflow enum ↔ synthesiser enum ↔ on-disk `signals:` frontmatter) and bidirectional (every canonical token declared by ≥1 lens; every declared token in canonical enum).

The specification is dense and precise. Every count in the document derives from a single 18-row inventory table; all four-way slug parity assertions and eight parity assertions (on the shipped test) are named in the review disposition. The design explicitly identifies which edge cases are addressed (manifests carried verbatim through three steps, cap eviction tracked by subject/signal pairs resolving to `unevaluable`, override-caused visibility via `## Run Scope`'s `complete:` boolean) and which are residual (hasDb=false false-negative is silent by construction; a lens emitting wrong subject produces wrong join not no join; reference-signal non-reproducible; universality gate is denylist).

Weaknesses: complexity is high — 10 tasks, 23 subagents, 18 lenses, 5 manifest sections, 8 parity assertions. Tool-surface heterogeneity persists (supply-chain Bash allowlist, reference-signal WebSearch); described as "discipline, not sandbox." Cost trajectory keeps climbing (5× design triplet at 18 Opus lenses); Sonnet downgrade lever documented but frozen NO. One correlation rule ships, not two (derived-divergence-candidate deferred).

## Acceptance Scenario

The scenario narrative is concrete: run `/bkit-audit` ad-hoc, get one ranked report at `docs/audits/{FID}-audit.md` plus tracker sub-issues, no code touched. Every lens names itself and its reason (`N/A — not applicable (hasDb=false)`, never silent); truncated/crashed lenses say so. Three separate lenses seeing one problem compose into one red silent-corruption-candidate at top. Success criteria span 6 points: 10-step orchestrator, 18 slots, coverage honest (every slot exactly one state token), correlation fires with coverage manifest, ranking discipline holds (ref-signal and low-confidence below), manifests reach published report. Key edge cases cover all five false-all-clear failure modes (flag false, flag true no surface, universal lens empty scope, override indistinguishability, correlation leg never ran, cap eviction indistinguishability, signal typo). Dogfood acceptance specifies manifest rows read from published file, not ranked list. The scenario adheres to template § Acceptance Scenario (concrete narrative, success criteria with testable assertions, edge cases with mitigations identified).

## Breaking Changes

None at the language-contract level. Operator API additions: `[applicability-override=flag=bool]`, `--with-websearch` (both in Step 2 already). Skill machinery call site change (prune entry point added to A3). Event schema addition (Step 5 `step-done` carries variable-length `artifacts` array, not fixed 16; seven event types instead of six, adding `transport-fallback` which is Close-gating). Registry surface: `.bkit/prompts.md` § Audit Phase new, § Tool set patterns four sub-rows new, § Frontmatter Conventions updated, `/bkit-audit` section wholesale replaced. Legacy `.bkit/workflows.md` stale 7-step block eliminated. `.agents/docs.md` Audit column updated. No breaking changes to data model; all additions are additive-optional (subject:, signal:, evidence:, guard-ref: fields; signals: and requires: frontmatter).

## Feasibility

Both Step-5 and Step-6 reviews returned CONCERNS with ten CRITICAL findings. All ten are APPLIED (none deferred, none rejected). Review 1 (buildability): supply-chain tool-set resolved to additive Bash, synthesiser tool set stated explicitly with Pass-3 lens-allowlist argument distinguished, models rows landing per sub-plan instead of batched, branch-placement additive claim corrected, lens tally corrected exposing hidden 8th amendment, reason-string contract pinned to substituted form, `transport-fallback` event added, `--git-common-dir` scope narrowed, `docs/audits/` mkdir added, hollow-boundary confidence:medium clause added, issue-level requires cycle narrowed, universality denylist extended, canonicalHashes regen added, `legs:` length policy pinned. Review 2 (operability): manifest propagation contract with three enforcement points, `signals:` frontmatter for three-way enum parity, per-eviction (subject, signal) records for cap-eviction leg-state resolution, `## Run Scope` with complete:boolean and (operator override) reason modifier, universal lens sanity-probe-before-emit extended via Reviewed:N=0 rule, Failure Path skill cleanup clarified, ai-llm off-dogfood validation added, debt three-way cap split with per-group truncation. One PoC recommendation applied in spirit (one-lens vertical slice as A4's first task). No findings rejected or deferred to future cycles.

The design is implementable. No specification gap remains open (all edge cases either addressed or explicitly noted as residual with mitigation). WS-A's A1–A7 form a connected sub-DAG inside one plan run; WS-B and WS-C fork from the same two sub-plans (A1+A2) narrowing true dependency. Build order is clear: A1→A2,A3,A4,A5→WS-B,WS-C→A6→A7.

## Synthesis Coverage

Not a brainstorm-synthesis design; this is a reconciliation pass. The design explicitly states that "the Pass-3 architecture carries verdict PASS and is not re-litigated here" and lists what does not change (10-step shape, stack-detect+skill-install model, keystone structure, finding schema, reference-signal down-rank, operator escapes). Synthesis is addressed in one sentence per task: ten post-PASS charter amendments are folded in below the named sections. Every amendment's rationale is traceable (either to #80 comment thread or to #403/#405 bodies; the 7 dead comment IDs are not to be cited). The Pass-3 decisions carried forward are not re-argued; focus is narrowly on the five drift items.

## Scope Alignment

The design explicitly bounds scope. In-scope: WS-A (contract + orchestrator + five pipeline agents + registry), WS-B (13 always-on lenses), WS-C (5 flag-gated lenses). Out-of-scope (each with own issue): WS-E #83 (runtime/log evidence), WS-D #207 (web-product lens family), WS-F #309 (red-team), WS-G #324 (triggers/automation). Audit stays read-only, ad-hoc, terminal at In Review. The design does not build anything (design-only mandate). The version target `4.11.0` is closed (no hedging). Three peer-issue amendments are identified as superseding the filed issue lines (ai-llm dogfood, debt tracker-cross-check narrow, both Requires narrow). No creep beyond the five Task boundaries is present.

## Risks

**Real, addressed, explicit:**

- `hasDerivedStore` is weakest flag (hardest to detect, false-negative exposed); inverse-evidence guard carries weight. Plan should seed positive and negative fixtures.
- 25-finding cap can still bite (5-slot reserve bounds but doesn't eliminate); residual now visible via per-eviction (subject, signal) records and truncation state.
- Lens that forgets subject:/signal: makes correlation silently never fire; mitigated by unevaluable(no subject match)→CONCERNS and fixture asserts in WS-B/WS-C acceptance, but residual remains (wrong subject produces wrong join not no join).
- Signal-enum typo was the exact false-all-clear shape the design exists to catch, reintroduced at lens level; now caught by three-way parity assertion + fixture criteria.
- Universality gate is denylist, cannot catch library names it has never heard of; token set extended in same edit adding new lenses.
- Conformance-vs-reliability privilege-aware up-rank requires correct subject on both legs; a missing or wrong-subject reliability finding degrades silent-corruption-candidate to silence (mitigated by coupling-1 document and fixture asserts).
- Author-leaves / bus factor: ten amendments rationale in 50-comment thread with 7 cited IDs now 404; **this document is the only surviving copy**. Three "why" items explicitly decided to resist deletion.
- Tool-surface heterogeneity (Bash allowlist on supply-chain, WebSearch on reference-signal) is permanent and discipline-based, not sandboxed; documented in prompt body.
- Cost keeps climbing (5× design triplet); Sonnet downgrade re-affirmed as future lever, frozen NO.
- Concurrency not supported on same clone; concurrent bkit workflows collide on shared dev / working tree / .git/config — use separate clones.

**Open, assigned, tracked:**

- Which hasDerivedStore heuristics actually fire on consumer repos (WS-C, fixture both directions, expect one revision after contact).
- Sub-class axis for matrix at 18 lenses (out of scope, flagged for WS-D).
- Skill authoring audit-{token} (separate follow-up, Step 4 mostly no-ops).
- Who owns scheduling WS-G vs #260 (product decision, settled before WS-G design, not here).
- One-lens vertical slice de-risking (A4 first task, not separate workstream).
- Derived-divergence-candidate second rule (deferred, recorded in deferrals.jsonl).

## Action Items

None. All ten CRITICAL findings from both reviews are APPLIED. No deferred items. The design is ready to proceed. Three amendments to peer issue bodies are superseded by this document (dogfood, debt narrow, Requires narrow), but those can be applied during plan phase or the plans can simply cite this doc as ground truth.

Procedural note (advisory): the three `/bkit-plan` runs must be serial (shared clone constraint). Build order: A1→A2,A3,A4,A5→WS-B,WS-C→A6→A7. Model rows land per sub-plan (not batched), keeping bkit-catalog-parity.test.ts green at every point. WS-B and WS-C require only A1+A2 (narrowed dependency). A4's first task should be the one-lens vertical slice (subject normalisation + alias resolution + rule table + leg-state assignment, hand-written fixtures, single run through synthesiser). No human confirmation gate is open; this design is the ground truth for all three plan runs.

## Outstanding Questions

- **Q: Which of derived-data's heuristics actually fire on real consumer repos?** — **Recommended:** Expect the flag to need one revision after first contact with real repos. The plan should seed both a positive (has derived store + recompute path) and a negative (no derived store) fixture in WS-C acceptance.

- **Q: Do we need a sub-class axis for the matrix at 18 lenses?** — **Recommended:** Defer this to WS-D (#207), which makes the problem worse. The per-class appendix is the escape valve in 4.11.0.

- **Q: Should installs be constrained beyond the 10-skill cap?** — **Recommended:** Unchanged from Pass 2. Default is build-agent parity. Revisit if Step 4 audit-{token} skills become a material registry item.

- **Q: Who owns scheduling — WS-G (#324) or #260?** — **Recommended:** This is a product decision, not design-time. Settle before WS-G's plan phase; audit stays ad-hoc and terminal at In Review in 4.11.0. Two schedulers over one-workflow-per-clone is a collision, not redundancy.

## Suggested Workstreams

**WS-A (#402): Orchestrator, conditional-lens keystone, pipeline contracts.** Seven sub-plans (A1–A7), 23 total subagents (orchestrator + 5 pipeline agents + 18 lens prompts). Requires: none. A1 (keystone contract) → A2 (stack-detect) → A3 (skill-install), A4 (synthesiser incl. correlation), A5 (organise+summary) in parallel after A2 → A6 (10-step orchestrator) → A7 (registry+gates+tests) after WS-B and WS-C built. The A4 first task is a one-lens vertical slice (reliability + contract-conformance hand-written fixtures, no orchestrator, no workflow). Delivers contract declaration, five pipeline agents with all manifests sections, orchestrator with feat-located status.jsonl and post-copy assert, canonical enums inline, 8 parity assertions extending existing test file.

**WS-B (#403): Universal lens layer, 13 always-on lenses.** 13 × `.bkit/prompts/bkit-audit-lens-{slug}.md` (architecture, hotpath, config, reliability, observability, debt, dead-code, deps, security, supply-chain, tests, docs-drift, logic-dupe). Model: claude-opus-5, effort: high, maxTurns: 50. Requires: WS-A A1 + A2 only (A3–A7 not blockers). Composition: 4 unchanged + 7 amended + 1 reclassified (supply-chain hasCi→always) + 1 new (logic-dupe). Accepts all ten amendments into deliverable probes. Fixture asserts on subject:/signal: emission for reliability/observability/tests; signals: frontmatter on all 13; models rows per-lens in same change. Supply-chain is only exception with additive Bash.

**WS-C (#405): Conditional lens layer, 5 flag-gated lenses.** 5 × `.bkit/prompts/bkit-audit-lens-{slug}.md` (ui-ux hasWebSurface, contract-conformance hasDb, derived-data hasDerivedStore, ai-llm hasLLM, reference-signal hasNetwork). Requires: WS-A A1 + A2 only. Composition: 2 unchanged + 1 renamed+rewritten (data-layer→contract-conformance) + 1 amended (ai-llm four dimensions) + 1 new (derived-data). Hardest surface: derive hasDerivedStore flag (inverse-evidence guard; plan should fixture both directions; expect one revision). Dogfood acceptance asserts manifest rows (published file) showing 5 conditional slots as N/A, never ran. Contract-conformance emits ## Subject Aliases; all 5 emit subject: + signal: on eligible findings. AI-llm validated off-dogfood. Per-dimension probe-clause criterion for ai-llm amendments.

## Recommended Next Step

`/bkit-plan 402` - WS-A engine and orchestrator. Brief: Reconciliation Pass 4 of the audit engine; charter the contract declaration (A1–A2), five pipeline agents with correlation pass (A3–A5), orchestrator (A6), and registry gates (A7). Version target 4.11.0 with #403 and #405 in one release. Critical de-risking: one-lens vertical slice as A4 task 1 (hand-written fixtures, real synthesiser + Bash, answers subject normalisation + parsing + manifest carry-through). Ref: design-v3-organised.md § WS-A (#402).
