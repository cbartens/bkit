Verdict: CONCERNS

<!-- verdict:end -->

# Plan Summary

## Overview

This plan executes the bkit v0.4.0 GitHub Packages npm registry distribution migration. The feature hard-cuts bkit distribution from git-dependency (`github:cbartens/bkit#vX.Y.Z`) to scoped-package registry path (`@cbartens/bkit@^0.4.0`), eliminating four classes of consumer friction: private-repo auth-shim, two auth surfaces (Actions + Vercel), lifecycle-hook OOM, and pnpm tag-drop.

The plan splits into two sequential sub-plans (v4-1 and v4-2, ~70K + ~55K tokens) to respect session budgets. Sub-plan 1 covers Phase A (pipeline foundation: branch, package.json edits, release.yml creation, pre.1 publish smoke), Phase B Tasks B1–B7 (installer print constants, CI template edits), and Phase C Tasks C0–C2 (Vitest tests). Sub-plan 2 covers Phase B Tasks B8–B15 (docs rewrites, dist rebuild, pre.2 publish smoke), Phase C Tasks C3–C5 (scratch consumer smoke), Phase D (production ship: PR, squash-merge, dev→main, v0.4.0 tag, BAR-131 resolution), and Gates 2/3/4.

**Total scope:** 30 named tasks + 5 mandatory testing/doc checklist items + 4 hard gates + inline task-level gates. Two pre-release validation tags (v0.4.0-pre.1 pipeline-only, v0.4.0-pre.2 prints+docs) before production v0.4.0 cutover.

## Plan Quality

**Well-scoped:** Clear boundary between pipeline foundation (Phase A, sub-plan 1) and feature validation (Phases B–D, split across sub-plans). Each task is atomic with explicit acceptance criteria and verification steps. Dependencies between sub-plans are explicitly wired (hand-off state checklist at end of sub-plan 1; re-read gate at start of sub-plan 2).

**Gates correctly structured:** Four hard gates (Gate 1: prerequisites; Gate 2: code implementation; Gate 3: testing & documentation; Gate 4: automated verification) match the template spec. Inline task-level gates (A5, B15, C5) provide failure-surface isolation (pre.1 validates pipeline, pre.2 validates prints+docs, scratch-consumer smoke gates production cut).

**Dependencies clear:** Sub-plan 1 must complete green (v0.4.0-pre.1 published, all Tasks A–C checked) before sub-plan 2 starts. No cross-cutting dependencies outside the linear sequence. Design (approved 2026-05-06) is the source of truth for Acceptance Scenario — plan inherits verbatim and expands with Concrete Example + plan-level Edge Cases + Derived Test Matrix.

**Design alignment:** Acceptance Scenario narrative and success criteria match the approved design doc exactly. Plan scope is strict subset of design scope: only bkit-side ship (publishing pipeline, installer prints, README/docs, ADR, pre-release validations, scratch-consumer smoke). Per-consumer migrations explicitly out of scope (tracked separately in `docs/pending.md`).

## Completeness

**Plan-level coverage:** All 30 tasks present and mapped to the Derived Test Matrix. Each row in the matrix corresponds to exactly one task (C0 → manifest test; C1 → print-constant test; C1.5 → release.yml structural test; C2 → consumer ci.yml template snapshot; A4–A5 → pre.1 publish smoke; B14–B15 → pre.2 publish smoke; C3–C5 → scratch-consumer smoke; D4 → production v0.4.0 publish).

**Testing adequate:** Vitest unit tests (Tasks C0, C1) assert manifest invariants, print-constant rewrites, and first-install banner edits. Release-workflow structural test (C1.5) validates YAML schema and step ordering. Template snapshot test (C2) protects consumer ci.yml regression. Live release smokes (A5, B15) validate npm publish against GH Packages. Scratch-consumer smoke (C4–C5) end-to-end tests registry install + bkit seeding. No E2E Playwright; no integration tests against live registry in CI (design explicitly excludes — pre-release publish IS the integration test).

**Docs planned:** README.md, .agents/README.md, docs/decisions.md (ADR DE-3), docs/pending.md (per-consumer migration entries), docs/knowledge.md (pnpm v7.20+ footgun entry) all tracked as Tasks B8–B11.5 in sub-plan 2. `.agents/docs.md` index already includes plan/build/debug/ship workflow matrix — no new doc files added, only updates to existing.

## Acceptance Scenario

Scenario is complete and concrete per `docs/plans/template.md` spec:

- **Narrative (inherited from design):** Verbatim from approved design.
- **Success Criteria (inherited from design):** Five numbered bullets covering npm publish via GITHUB_TOKEN, scratch-consumer install via .npmrc + env, print message updates, CI template edits, pre-release tags + ADR.
- **Concrete Example:** Setup, numbered steps, observable outcome specified (scratch repo scratch/bar-138-smoke/, .npmrc config, pnpm add, bkit install --full, verification of seeded files and print sink).
- **Edge Cases:** Nine rows inherited from design + plan-level boundary conditions (tag re-use, stale PAT scopes, pre-existing installCommand shim, unset env vars, stale dist/, permission mismatches, repository.url format, env interpolation).
- **Derived Test Matrix:** 13 rows, each mapping to a specific task. One-to-one correspondence verified.

**However: Both human-confirmation gates are UNCHECKED.** Per the contract in `plan-v4-split.md` (lines 128, 168) and the `docs/plans/template.md` spec (line 88), Gate 1 cannot pass until:

- `[ ] **Acceptance Scenario confirmed**` → `[x]`
- `[ ] **Breaking Changes confirmed**` → `[x]`

These are unchecked in the source file as of this read.

## Design Alignment

Acceptance Scenario narrative and success criteria match the approved design doc (`design-input.md` § Narrative and Success Criteria) verbatim. Plan scope strictly adheres to bkit-side ship (no per-consumer migrations, no dual-publish, no backward-compat flag gating). The Concrete Example, Edge Cases, and Derived Test Matrix expand from the design's Key Edge Cases but do not contradict or reframe the design's intent. Architecture & Component Changes section aligns with design's specified file edits (package.json, release.yml, bkit-modules.ts print constants, CI templates, README, ADR). All supersession decisions (dead code removal: Configure private-repo auth steps in both ci.yml files; print-constant rewrites; onlyBuiltDependencies banner edit) are design-aligned.

## Risks

**Unchecked human-confirmation gates (BLOCKING):** The two checkboxes in the parent plan (`plan-v4-split.md` lines 128, 168) are unchecked. Per the template contract and the caution blocks in the plan itself, **Gate 1 cannot be passed** until both are checked `[x]`. This is not a plan-quality issue but an execution blocker — the plan awaits human confirmation.

**Token budget split:** Sub-plan 1 estimated at ~70K tokens, sub-plan 2 at ~55K, totaling ~125K. Session token budgets typically allow 100–120K per session. This split is deliberate and necessary to respect the token limit while maintaining plan coherence. Recovery path is clear: if either sub-plan exceeds budget during execution, create a follow-up session starting from the explicit hand-off state checkpoint.

**`release.yml` GITHUB_TOKEN permissions:** The plan relies on `permissions: packages: write` being available to the built-in `GITHUB_TOKEN` in the cbartens/bkit repo. This is the default for private repos in the same org; verification is implicit in the Gate 1 checklist item (Conditional, Secrets & Env Vars). If the repo defaults to read-only GITHUB_TOKEN scope, the explicit `permissions:` block in release.yml must override it — this is already in the design and the plan; pre.1 publish will validate.

**pnpm v7.20+ silent-`.npmrc`-ignore footgun:** The plan explicitly enumerates this in print constants (Tasks B1–B4) and the knowledge base (Task B11.5). Symptom is opaque 401 from npmjs.org (not "token missing"), root cause is pnpm silently dropping `.npmrc` on unset env var. Mitigation is mandatory in rewritten print copy — all four constants and the first-install banner mention this verbatim so an AI agent can map symptom → cause.

**Dist rebuild determinism:** `release.yml` pins Node 20 to match current ci.yml (not 22) to ensure `check:dist` determinism — both reviews flagged the v1 "pin 22" line as contradicting the actually-shipped ci.yml. If ci.yml is ever bumped to 22, both workflows must be kept in lock-step with a `dist/` regeneration commit. This is documented in the Knowledge/Decisions section.

**First-ever GH Packages publish:** v0.4.0-pre.1 is the first-ever npm publish to GH Packages for `@cbartens/bkit`. Auth bugs (GITHUB_TOKEN scope, `permissions:` mismatch, registry-url setup) will surface here. Pre.1 publish failure is zero-cost to fix (tag is throwaway); without the pre-release gate, discovering the bug on v0.4.0 proper would require a patch release.

## Action Items

Only one action item — **required human confirmation before execution can begin:**

1. **BLOCKING:** Check `[x]` the two human-confirmation checkboxes in the parent plan (`plan-v4-split.md`):
   - Line 128: `[x] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.`
   - Line 168: `[x] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.`

   Once both are checked, save the file, and the plan is ready for Gate 1 entry. No other revisions needed — the plan scope, completeness, test coverage, and design alignment are all sound.
