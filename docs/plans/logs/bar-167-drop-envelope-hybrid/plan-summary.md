Verdict: CONCERNS

<!-- verdict:end -->

# BAR-167 Plan Summary — Build-Readiness Review

## Overview

BAR-167 ships bkit v2.0.0 as a three-phase major release: Phase 1 drops the `__bkit__` JSON envelope and introduces format-aware containment primitives; Phase 2 adds `bkit:start..bkit:end` markers to 12 group-A full-ownership files and partial-marker blocks to 3 group-B files, refactoring manifest dispatch to a single `format`-based model; Phase 3 narrows the `.bkit-version` writer to emit `tier3Hashes` for byte-equal-text files only and sweeps residual `Tier [123]` terminology from docs. This reverses DE-7/DE-8 and collapses the Tier 1/2/3 distinction into one rule: **every template's bkit-owned scope must be intact in the consumer file.**

**Sub-plan inventory:**

- **Sub-plan A (Phase 1)** — 24 tasks, ~17 files touched, v2.0.0-alpha target. Core: drop envelope, build `deepContains`/`writeTier2JsonContained`/`migrateLegacyBkitEnvelope`/`stripTier2JsonScope`, reclassify JSON files to `tier: 2`, extend preflight advisories. ~50K tokens.
- **Sub-plan B (Phase 2)** — 14 tasks, ~15 files touched, v2.0.0-beta target. Core: add markers to 12 group-A files + 3 group-B partial blocks, simplify manifest schema `tier → format`, single dispatch on format in install/check/uninstall, Phase-2 `tier2-text-drift` advisory. ~40K tokens.
- **Sub-plan C (Phase 3)** — 5 tasks, ~10 files touched, v2.0.0 final target. Core: narrow `tier3Hashes` writer to byte-equal-text, rewrite `bkit-tiers.ts` doc-block, sweep `Tier [123]` strings from docs, add `lint:no-tier-terms` script. ~20K tokens.

**Total: 43 tasks, ~42 files, three independent sub-plans with hard cross-plan dependencies preserved.**

## Plan Quality

The split structure is mathematically sound: master plan-v3 had 41 numbered tasks + 2 in-runbook items (Sub-gate 2A + lint script) = 43 total. Sub-plans distribute as 24+14+5=43, zero duplication, zero loss. All task IDs preserved; no renumbering. Each sub-plan ≤100K tokens. Task ordering constraints documented explicitly (e.g., Tasks 1, 4b, 6 of sub-plan A are hard prerequisites for sub-plan B's Tasks 20/21/23a; Task 19 of sub-plan B is hard prerequisite for sub-plan C's Task 25).

Cross-sub-plan dependency diagram in `plan-v4-split.md` maps all hard prerequisites via ASCII tree. Sub-gate 2A serves as the boundary marker between sub-plan A's Task 4b (`stripTier2JsonScope` definition) and sub-plan B's Task 19 (manifest `format` field adoption) — blocking premature integration test execution until Task 19 lands.

Each sub-plan is self-contained per `docs/plans/template.md` with Verdict header, Acceptance Scenario (including human checkboxes), Breaking Changes, all four gates, Acceptance Scenario and Breaking Changes sub-section in each sub-plan (3 sub-plans × 2 boxes = 6 unchecked checkboxes across all three sub-plans — expected state for pre-review). No circular inter-plan dependencies.

## Completeness

**Master success criteria preserved across all three sub-plans:**

1. Zero-drift on clean v2.0.0 install (JSON surfaces sub-plan A; markered-text surfaces sub-plan B; cumulative verification sub-plan C).
2. `__bkit__` removed; Cursor v1 keyed-object schema; consumer keys byte-identical across upgrade chain (sub-plan A).
3. Phase 2 markers on all listed files; partial-ownership block byte-equal enforced; Tier-3 drift regression caught (sub-plan B — captures the `app-gether-life` regression that lost `bkit check` step from `.github/workflows/ci.yml`).
4. Phase 3 cleanup: `Tier [123]` removed from docs; `format` field on manifest; `bkit-tiers.ts` doc-block rewritten; `lint:no-tier-terms` exits 0 (sub-plan C).

**Scope tightness check (lossless decomposition):**

- Phase 1 (24 tasks): foundational JSON drop, JSON primitives, tests, fixtures, Phase-1 docs (DE-16, KN-15, architecture rewrite, CHANGELOG, README). Target: v2.0.0-alpha.
- Phase 2 (14 tasks): markers on 12 group-A + 3 group-B files, manifest reclassification, single dispatch refactor, Phase-2 tests + Tier-3 drift regression. Target: v2.0.0-beta.
- Phase 3 (5 tasks): schema narrowing, terminology sweep, doc-block rewrite, lint script. Target: v2.0.0 final.

**Critical fixes from plan-v3 review/scope-check all present in sub-plans:**

1. `deepContains` semantics (order-insensitive object-array containment; subset for primitive arrays; null boundaries) — sub-plan A Task 1.
2. Manifest reclassification (JSON files from `tier: 1` to `format: "json"`) — sub-plan B Task 19.
3. JSON-aware `stripTier2JsonScope` helper for uninstall — sub-plan A Task 4b.
4. `bkit-preflight.ts` allow-list extension + advisories (`legacy-bkit-envelope-detected`, `tier2-json-drift`, `pre-envelope-bkit-version-detected`) — sub-plan A Task 6, sub-plan B Task 21.
5. Static fixture `tests/fixtures/heavy-customised-consumer-v1-envelope/` for upgrade-chain regression — sub-plan A Task 0c.
6. Atomic-write pattern in `migrateLegacyBkitEnvelope` call sites — sub-plan A Task 4.
7. Cursor v1 keyed-object schema migration for `.cursor/hooks.json` — sub-plan A Task 5.
8. Phase 2 marker scope correctness (group B partial-ownership precise specs: `ci.yml` wraps `Install Dependencies` + `Run Bkit Check` inclusive; `.vale.ini` wraps four required keys at column 0) — sub-plan B Tasks 18/18b.

## Acceptance Scenario

Each sub-plan carries its own Acceptance Scenario section with narrative, concrete example (walkthrough of v0.8.x → v2.0.0 or v1.1.1 → v2.0.0 upgrade paths), edge cases (6–10 per sub-plan), and a derived test matrix mapping rows to Agent Execution Runbook tasks.

**Sub-plan A Acceptance Scenario:** consumer running `pnpm bkit upgrade` from v1.1.1 to v2.0.0(-alpha) sees `__bkit__` envelope stripped, templates rewritten schema-clean, `deepContains` enforced, consumer-added keys (`hooks.Stop`, `failClosed`) byte-identical, migration logs emitted, `pnpm bkit check` exits 0 with zero drift on JSON surfaces.

**Sub-plan B Acceptance Scenario:** consumer on v2.0.0-alpha upgrades to v2.0.0-beta. Markers wrap 12 group-A files + 3 group-B partial blocks. The `pnpm bkit check` step missing from `ci.yml` (the regression) is now caught as `tier2-text-drift`. Markers on `AGENTS.md`, `CLAUDE.md`, etc. wrap bkit content; consumer content above/below preserved.

**Sub-plan C Acceptance Scenario:** after A+B land, sub-plan C narrows `tier3Hashes` writer, rewrites `bkit-tiers.ts` doc-block, sweeps `Tier [123]` strings, adds `lint:no-tier-terms` script. `cat .agents/.bkit-version` shows `tier3Hashes` map containing only `.cursor/Dockerfile` hash. `pnpm lint:no-tier-terms` exits 0.

**Status of human-confirmation gates:** all three sub-plans have Acceptance Scenario + Breaking Changes confirmation checkboxes (6 boxes total). All are unchecked — expected pre-build state. Human must tick them sequentially per sub-plan before each `/bkit-build` invocation.

## Design Alignment

Plan narrative + success criteria align verbatim with the binding scope decisions from Linear comment (Plan-Phase Clarifications): bundle Phase 1+2+3 into single v2.0.0 ship; skip Cursor v1 spike (Task 0a removed); keep decorative echoes (Decision 3); defer pre-push duplicate-work to Phase 2 markers (Decision 4); manual consumer fixes left uncommitted (Decision 5).

Plan scope ⊆ design scope: BAR-167 issue defines the "format-aware containment" single-model rule. All three phases are in-scope — Phase 1 drops envelope + builds primitives, Phase 2 adds markers + refactors dispatch, Phase 3 cleans up schema + terminology. No out-of-scope creep detected.

## Risks

**Known parked items from plan-v3 scope-check (9 CRITICAL items all addressed):**

1. ✅ `deepContains` semantics — resolved in sub-plan A Task 1 (~60 LOC, order-insensitive arrays, null boundaries).
2. ✅ Manifest reclassification — resolved in sub-plan B Task 19 (tier → format).
3. ✅ JSON-aware uninstall — resolved in sub-plan A Task 4b (`stripTier2JsonScope`).
4. ✅ Cursor v1 schema — resolved in sub-plan A Task 5 (keyed-object migration).
5. ✅ Migration mechanics — resolved in sub-plan A Task 3 (`migrateLegacyBkitEnvelope`) + Task 4.
6. ✅ Fixture approach — resolved in sub-plan A Task 0c.
7. ✅ Preflight allow-list — resolved in sub-plan A Task 6 + sub-plan B Task 21.
8. ✅ Phase 2 marker anchors (group B precise specs) — resolved in sub-plan B Tasks 18/18b.
9. ✅ Phase 3 hard-ordering (Tasks 26/27 after sub-plan A Tasks 11–13) — documented in sub-plan C Runbook.

**Additional known risks (documented in each sub-plan's Reviewer Notes):**

- Array-containment semantics correctness (deepContains for object-arrays).
- `migrateLegacyBkitEnvelope` idempotency.
- Phase 1 supersession inventory completeness (six functions + one file deleted).
- Phase 2 manifest-dispatch refactor (no Phase 1 JSON behaviour regression).
- Phase 2 partial-marker scope correctness (ci.yml block covers the right steps).
- Sub-gate 2A correctness (PREREQ tests blocked until Task 19).
- Phase 3 `tier3Hashes` writer narrowing (no safe-delete regression on `.cursor/Dockerfile`).
- Task 26/27 hard-ordering (must run after sub-plan A Tasks 11–13 land).

**Deferred to post-v2.0.0:**

- `bkit upgrade --prune` flag (documented in `docs/pending.md`).
- Cursor v1 runtime spike (Task 0a removed per Decision 2).
- Potential renaming `tier2-text-drift` → `markered-block-drift` (backward-compat key retained).

## Action Items

1. **Human review gates:** Each sub-plan requires tick-off of Acceptance Scenario + Breaking Changes checkboxes before `/bkit-build` execution. Total 6 checkboxes across three sub-plans.

2. **Sub-gate 2A blockage:** Integration tests gated by Sub-gate 2A (`bkit uninstall --claude/--cursor` rows from sub-plan A Task 10; `slop-scan.config.json` drift row) must NOT run until sub-plan B Task 19 (manifest `format` field) merges. Runbook includes explicit comment markers (`// PREREQ: Task 19 reclassification`).

3. **Sub-plan C hard-ordering:** Verify that sub-plan A Tasks 11–13 (DE-16, KN-15, `docs/architecture.md` rewrite) are merged BEFORE sub-plan C Tasks 26–27 execute. Task 13's section rewrite is the baseline; Task 27's terminology sweep builds on it.

4. **Lint script implementation choice:** Sub-plan C Task 28 (`lint:no-tier-terms`) can use simple `grep -v` OR a Node script with explicit exclusion list. Runbook preference is Node script (`.agents/scripts/lint-no-tier-terms.ts`) because file-level `grep -v` skip misses future regressions in new locations inside historically-excluded sections.

5. **Manual consumer fixes:** `app-gether-life` and `visitfrasercoast-com` have two manual edits each (documented in `plan-input.md` Section 6) left uncommitted. Out of v2.0.0 build scope; human review post-Phase-3.

6. **Build sequencing:** Sub-plan A must merge to dev first; then sub-plan B (after A merges); then sub-plan C (after B merges). Three sequential PRs with dependency chain.

---

**Summary:** Plan is ready for build with known parking-lot items documented above. Three sub-plans are self-contained, complexity-checked, gate-structured, and test-matrixchecked. All hard cross-plan dependencies are explicit and blockable (Sub-gate 2A). Human must confirm acceptance + breaking changes per sub-plan before kicking off `/bkit-build`.
