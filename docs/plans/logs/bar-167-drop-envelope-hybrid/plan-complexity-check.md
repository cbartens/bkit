Verdict: SPLIT

<!-- verdict:end -->

# Plan Complexity Check

## Counts

**Tasks (runbook checkboxes):** 41 discrete tasks across three phases

- Phase 1: Tasks 0c, 0d, 0e, 1, 1b, 2, 3, 4, 4b, 5, 6, 7, 8, 8b, 9, 10, 10a, 11, 12, 13, 14, 14a, 15, 16 — 24 tasks
- Phase 2: Tasks 17, 17a, 18, 18a, 18b, Sub-gate 2A, 19, 20, 21, 22, 23, 23a, 23b, 24 — 14 tasks (including gate)
- Phase 3: Tasks 25, 26, 27, 28 — 4 tasks
- Shared mandatory / gate tasks: Gate 1 (2 human checkboxes), Gate 2, Gate 3, Gate 4 — 4 gates total (1 human-gated)

**Gates (🔒):** 5 gates

- Gate 1 (human confirmation — 2 checkboxes, NOT auto-passable)
- Sub-gate 2A (manifest reclassification readiness)
- Gate 2 (code implementation check)
- Gate 3 (testing and documentation check)
- Gate 4 (automated verification confirmed)

**Domain areas touched:**

- Core library code (`.agents/scripts/`) — bkit-tiers.ts, bkit-modules.ts, bkit-preflight.ts, bkit-uninstall.ts, bkit-install.ts, bkit-manifest.ts, bkit-version.ts, bkit-paths.ts (new)
- Templates (`.agents/templates/`) — 14 template files modified (2 JSON rewrites, 12 marker additions)
- Tests — 7 test files modified/created (bkit-tiers.test.ts, bkit-uninstall.test.ts, bkit-templates.test.ts (new), bkit-modules.upgrade.integration.test.ts, bkit-modules.integration.test.ts, bkit-doctor.integration.test.ts, bkit-version.test.ts)
- Static fixtures — 3 new fixture directories (heavy-customised-consumer-v1-envelope, heavy-customised-prepush, heavy-customised-ci)
- Documentation — 9 doc files (docs/architecture.md, docs/decisions.md, docs/knowledge.md, docs/testing.md, docs/deployments.md, CHANGELOG.md, README.md, docs/pending.md, docs/completed.md)
- Config — package.json (version bump + new lint script)

**Derived Test Matrix rows:** 34 test rows across 7 test files

**Files touched (total):** ~44 files

- 8 source files modified, 1 source file created, 2 source files deleted
- 14 template files modified
- 7 test files modified/created
- 3 fixture directories (new)
- 9 documentation files
- 1 config file (package.json)

## Session Fit Estimate

**Estimated tokens to execute the full plan in one session:**

| Phase   | Source edits                                                                 | Test writes                                    | Doc writes                           | Subtotal estimate |
| ------- | ---------------------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------ | ----------------- |
| Phase 1 | ~800 LOC added + ~400 LOC deleted across 9 source files                      | ~350 LOC across 5 test files                   | ~400 LOC across 6 doc files          | ~50K tokens       |
| Phase 2 | ~600 LOC across 6 source files + 14 template marker edits                    | ~300 LOC across 3 test files + fixture commits | ~minimal (docs already done Phase 1) | ~40K tokens       |
| Phase 3 | ~200 LOC across 4 files (writer narrowing + doc-block + sweep + lint script) | ~100 LOC across 2 test files                   | ~300 LOC terminology sweep           | ~20K tokens       |

**Estimated total: ~110K tokens** — approximately 10–15% over the 100K single-session threshold, before accounting for read overhead (the plan itself is ~49K tokens; reading source files for each edit adds another ~15–20K in context load during execution).

**Read overhead at execution time:** the build agent must read each source file before editing (rules mandate this). 9 source files at an average of ~200 lines each = ~1,800 lines = ~9K tokens. Integration test files are typically 300–600 lines each = another ~5K. Total context load during execution is estimated at ~125K tokens across the full plan, comfortably above the 100K threshold.

**Task count:** 41 tasks vs the ~30 SINGLE threshold.

**Files touched:** ~44 files vs the ~25 SINGLE threshold.

## Rationale

The plan is SPLIT. Three independent measures all exceed SINGLE thresholds simultaneously:

1. **Token estimate exceeds 100K.** The plan is ~995 lines of dense specification. Full execution requires reading every target file before editing (per rules), writing new code primitives (~60 LOC `deepContains`, ~30 LOC `writeTier2JsonContained`, ~40 LOC `migrateLegacyBkitEnvelope`, ~40 LOC `stripTier2JsonScope`), writing 34 test rows across 7 files, and sweeping 9 documentation files. Estimated execution tokens ~110–125K.

2. **Task count is 41 (threshold is ~30).** No compression is possible — every task has a hard prerequisite chain and an explicit verification step.

3. **Files touched are ~44 (threshold is ~25).** The plan spreads across source, templates, tests, fixtures, and docs; each domain is non-trivially large.

**The plan was designed to be split.** The Runbook's Splittability Note (lines 798–806) explicitly defines the three sub-plan groupings and documents the hard cross-phase dependencies. Phases 1 and 2 are strongly coupled (Phase 2 hard-deps on Phase 1 Tasks 1, 4b, 6, and 19), and Phase 3 hard-deps on Phase 2. The natural cleavage is at phase boundaries.

---

## Proposed Sub-plans

### Sub-plan A — v2.0.0-alpha (Phase 1)

**Scope:** Drop the `__bkit__` envelope; introduce JSON containment primitives; migrate existing consumers; Phase 1 tests + docs.

**Tasks:** 0c, 0d, 0e, 1, 1b, 2, 3, 4, 4b, 5, 6, 7, 8, 8b, 9, 10, 10a, 11, 12, 13, 14, 14a, 15, 16 (24 tasks)

**Files touched (~17):**

- Source (new/modified): `bkit-tiers.ts`, `bkit-modules.ts`, `bkit-preflight.ts`, `bkit-uninstall.ts`, `bkit-version.ts`, `bkit-paths.ts` (new), `bkit-tier1-defaults.ts` (delete), `bkit-tier1-defaults.test.ts` (delete)
- Templates: `.agents/templates/.cursor/hooks.json`, `.agents/templates/.claude/settings.json`
- Tests: `bkit-tiers.test.ts`, `bkit-uninstall.test.ts`, `bkit-modules.upgrade.integration.test.ts`, `bkit-modules.integration.test.ts`, `bkit-doctor.integration.test.ts`
- Fixtures: `tests/fixtures/heavy-customised-consumer-v1-envelope/`, `tests/fixtures/heavy-customised-prepush/`, `tests/fixtures/heavy-customised-ci/`
- Docs: `docs/decisions.md`, `docs/knowledge.md`, `docs/architecture.md`, `CHANGELOG.md`, `README.md`, `docs/pending.md`, `package.json` (version bump only)

**Estimated tokens:** ~50K — fits single session.

**Exit condition:** `pnpm turbo lint typecheck format:check test` green; Phase 1 net deletion ≥ 200 LOC (path-scoped to the five Phase 1 deletion targets); `pnpm bkit check` against worktree zero drift on JSON surfaces; Gate 2 partial (Phase 1 tasks only).

---

### Sub-plan B — v2.0.0-beta (Phase 2)

**Hard dep:** Sub-plan A merged into branch. Tasks 1, 4b, 6 (deepContains, stripTier2JsonScope, preflight allow-list) and manifest baseline from Task 19 itself must be present.

**Scope:** Add bkit:start..bkit:end markers to 14 template files; simplify `bkit-manifest.ts` to `{ path, format }`; refactor install/check/uninstall to single dispatch on `entry.format`; Phase 2 marker tests + Tier-3 drift regression test.

**Tasks:** 17, 17a, 18, 18a, 18b, Sub-gate 2A, 19, 20, 21, 22, 23, 23a, 23b, 24 (14 tasks including gate)

**Files touched (~15):**

- Source: `bkit-manifest.ts`, `bkit-install.ts`, `bkit-modules.ts`, `bkit-uninstall.ts`, `bkit-preflight.ts`
- Templates (Group A, 12 files): `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/00-shared-rules.mdc`, `.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml`, `.agents/{rules,docs,friction,skills}.md`, `docs/plans/template.md`
- Templates (Group B, 3 files): `.github/workflows/ci.yml`, `.vale.ini`, `.husky/pre-push` (verify only)
- Tests: `bkit-templates.test.ts` (new), `bkit-modules.test.ts`, `bkit-modules.upgrade.integration.test.ts`, `bkit-modules.integration.test.ts`
- Config: `package.json` (no additional version bump needed)

**Estimated tokens:** ~40K — fits single session.

**Exit condition:** `pnpm turbo lint typecheck format:check test` green; `pnpm bkit check` against worktree zero drift on all surfaces (JSON + markered-text); Gate 2 (full).

---

### Sub-plan C — v2.0.0-final (Phase 3)

**Hard dep:** Sub-plan B merged. `format: "byte-equal-text"` field must exist on `ManifestEntry` (Task 19); Phase 1 docs (Tasks 11–13) must be present as baseline for terminology sweep.

**Scope:** Narrow `tier3Hashes` writer to byte-equal-text only; rewrite `bkit-tiers.ts` doc-block; sweep `Tier [123]` terminology from docs; add `lint:no-tier-terms` script.

**Tasks:** 25, 26, 27, 28 (4 tasks)

**Files touched (~10):**

- Source: `bkit-version.ts`, `bkit-tiers.ts` (doc-block only)
- Tests: `bkit-version.test.ts`, `bkit-tiers.test.ts` (static grep check), `bkit-modules.integration.test.ts` (`.cursor/Dockerfile` safe-delete row)
- Docs: `docs/architecture.md` (residual sweep), `docs/testing.md`, `docs/deployments.md`, `README.md`
- Config: `package.json` (add `lint:no-tier-terms` script)
- Post-merge: `docs/completed.md`

**Estimated tokens:** ~20K — comfortably fits single session.

**Exit condition:** `pnpm turbo lint typecheck format:check test` green; `pnpm lint:no-tier-terms` exits 0; Gates 3 and 4 confirmed; manual verification steps 1–4 passed.
