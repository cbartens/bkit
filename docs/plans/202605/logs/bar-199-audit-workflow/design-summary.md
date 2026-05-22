Verdict: PASS

<!-- verdict:end -->

# Design Summary

## Overview

Ship `/bkit-audit` — a sixth peer workflow alongside `/bkit-design`/`/bkit-plan`/`/bkit-build`/`/bkit-debug`/`/bkit-ship` — that runs 11 parallel best-practice lens audits and synthesizes them into a Severity × Class prioritized report. Driver: BAR-197 retro — the catch-all Lambda bundling + ESM-only `serverExternalPackages` debt would not have been caught by the single-prompt `bkit-utility-audit-codebase` because it lacks probe specificity. Multi-lens fan-out + structured YAML-finding synthesis closes that gap by reusing ~85% of `bkit-design.md`'s orchestrator ceremony.

## Design Quality

Well-reasoned end-to-end. All three design passes (review-1 buildability, review-2 operability, v2-reviewed architecture) converged on a coherent merged design (v3-organised). Key decisions are grounded: 11-lens merge (error-handling + resource-lifecycle → reliability) reduces token cost ~15% without losing detection power; YAML-frontmatter fenced blocks over brief's heading format enable mechanical dedup at synthesizer scale; charter doc as passive index (not runtime cross-reference) satisfies standalone-runnable rule. Trade-offs explicitly accepted: ~4× token cost vs alternatives, no adversarial review of synthesis, no auto-Done on PASS (every audit ends In Review). Edge cases handled: FID format extended for re-audits (`{ISSUE_ID-slug}-audit-{YYYYMMDD-HHmm}`), synthesizer truncation visible via `{N}/{TOTAL}` metric, smoke-test attestation emits `CONCERNS` (not silent N/A) if golden file absent.

## Acceptance Scenario

Adheres to brief's acceptance criteria and brief's scope. Seven success criteria (§Acceptance Scenario): `/bkit-audit` ships as top-level slash command with 7-step ceremony; 11 lens prompts + 3 pipeline prompts + charter doc exist and are registered; smoke-test runs against current `dev` HEAD + seed file and surfaces BAR-197-class findings; lens prompts are stack-agnostic (no unconditional `Next.js|Vercel|pnpm|esbuild`); standalone utility prompts carry deprecation headers. All mapped to design sections; no vague or contradictory wording. Reconciliation: brief's lens count "~12" → design keeps 11 (rationale: merge of Lens 4+6 is defensible; brief's optional Lens 13 deferred to v2 per brief decision). Brief acceptance line on `.agents/skills.md` registration reinterpreted per user memory to mean workflow registration in `.agents/workflows.md` — documented in design as a reconciliation (not silent drift).

## Feasibility

Spike (design-review-1.md buildability lens + design-review-2.md operability lens) both passed: all components map onto existing bkit primitives (bash + jq + awk + Linear MCP + git worktrees), no new third-party deps, 11-way parallel fan-out uses existing Agent tool pattern (scale tested via design/plan triplets). Design-v2-reviewed carried forward as-is; design-v3-organised (workstream decomposition) adds five modular WS with clear Requires edges: WS-1 (orchestrator contract) → WS-2 (lens prompts) + WS-3 (pipeline prompts); WS-4 (deprecation) independent; WS-5 (smoke-test) depends on WS-1+WS-3. No spike failure; all gaps from review rounds were addressed and locked into design decisions and requirements table.

## Synthesis Coverage

Design-brainstorm-ideate cycle proposed N=3 approaches across three lenses (structure, schema, integration). Synthesis kept A1 (7-step orchestrator skeleton) + A2 (YAML-finding schema + 11-lens merge + golden file) + A3 (Linear-bound 6th workflow + `/bkit-audit` command + Audit label + INDEX.md). Dropped: B1 (5-step mega-agent = OOM + no fine-grained recovery), B2 (Core 6 + Extended 5 with free-text headings = probe fragility at 11-output scale), B3 (lightweight subroutine of design = no institutional memory), C1 (9-step adversarial review = over-engineered for read-only), C2 (single-agent loop = context exhaustion), C3 (Linear-skipped = zero queryability). Reasoning sound: each alternative traded off key concerns (orchestrator reuse, structural finding schema, Linear integration, portability); merged design keeps strongest-per-concern. Good options not lost — e.g., auto-Done on PASS audit (rejected lens-3 approach A) is explicitly acknowledged as a trade-off (every audit ends In Review, preserving uniform workflow lifecycle).

## Risks

Carried forward from three review rounds and design phases. Top 3 operability: (1) synthesizer scale-out at 11 lenses × 30-finding cap = 330-finding ceiling to one Opus agent (mitigated by self-report `{N}/{TOTAL}`, cap-per-lens); (2) probe drift over time without mechanical gate (mitigated by portability synthesizer-side check for `Next.js|Vercel|pnpm|esbuild` + v2 drift-lint hook); (3) smoke-test reproducibility tied to seed file (mitigated by checked-in `tests/golden/seeds/bar-197-known-debt.seed.ts`; optional `BKIT_AUDIT_SMOKE_BASE_REF` env-var override for advanced users). Secondary: 7 Linear writes/run approaches rate-limit territory at 10× scale (mitigated by Step 3 consolidation); deprecation half-life of 4 utility prompts (mitigated by explicit `Deletion target v2.3.0` clock); charter-vs-prompt drift (mitigated by developer-facing self-test note in charter doc; v2 mechanical check pending).

## Scope

Disciplined to brief scope. In-scope v1: 7-step orchestrator, 11 lens prompts, 3 pipeline prompts, lint-charter doc, `/bkit-audit` command, Linear-bound FID/label/ceremony, output to `docs/audits/`, deprecation headers on 4 utility prompts, smoke-test with golden file, `.agents/workflows.md`/`.agents/prompts.md`/`.agents/docs.md` registry updates. Out-of-scope (brief carries forward): per-lens fixers, CI scheduling, live-runtime lens, cross-repo aggregation, deletion of utility prompts (header-only in v1), A11y/i18n/migrations lenses, cross-workflow hooks, workstream Linear sub-issues. No scope creep. One brief erratum reconciled: acceptance line on `.agents/skills.md` registration reinterpreted per user memory (registration lives in `.agents/workflows.md` because `skills.md` is manually curated). All three review rounds flagged concerns; design-v3 incorporated resolutions as explicit Decisions table entries (post-Step-3 assertion gate, resume path, hard-stop sentence, golden-file-absent→CONCERNS, charter-as-passive-index).

## Action Items

None for verdict PASS. Unchecked human-confirmation gates (typical for new design): Linear `Audit` label creation (one-time server-side ops, pre-requisite for first run); model-strategy revisit post-10-runs if cost binds (brief decision §4, flagged for future attention). No blocking items. Design is ready for `/bkit-plan` step once `/bkit-design-review` gate approves this summary.
