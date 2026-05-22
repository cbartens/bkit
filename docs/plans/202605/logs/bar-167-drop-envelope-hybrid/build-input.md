# Build Input — bar-167-drop-envelope-hybrid

## Session Prompt

/bkit-build bar-167

## Issue ID

BAR-167

## Issue Title

Template ownership via markers + JSON containment

## FID

bar-167-drop-envelope-hybrid

## Sub-Plan Count

3 (SUB_COUNT=3, SINGLE_PLAN=false)
Sub-plans: bar-167-drop-envelope-hybrid-plan-1.md (Phase 1), bar-167-drop-envelope-hybrid-plan-2.md (Phase 2), bar-167-drop-envelope-hybrid-plan-3.md (Phase 3)

## Plan File

docs/plans/active/bar-167-drop-envelope-hybrid-plan.md

## Master Plan Content

Verdict: PASS

<!-- verdict:end -->

# BAR-167 — plan-v4 split index

**Children (executable artifacts):**

- [bar-167-drop-envelope-hybrid-plan-1.md](./bar-167-drop-envelope-hybrid-plan-1.md) — Sub-plan A (Phase 1: drop envelope, JSON primitives, Phase 1 docs).
- [bar-167-drop-envelope-hybrid-plan-2.md](./bar-167-drop-envelope-hybrid-plan-2.md) — Sub-plan B (Phase 2: markers everywhere + manifest dispatch refactor).
- [bar-167-drop-envelope-hybrid-plan-3.md](./bar-167-drop-envelope-hybrid-plan-3.md) — Sub-plan C (Phase 3: terminology sweep + schema cleanup + lint script).

**Master historical record:** [plan-v3-checked.md](./plan-v3-checked.md). The unified plan remains the authoritative description of the original merged scope. Sub-plans v4-1 through v4-3 are the executable artifacts that build agents read.

**Complexity check input:** [plan-complexity-check.md](./plan-complexity-check.md) (verdict: SPLIT).

---

## Why split

The unified `plan-v3-checked.md` exceeds all three SINGLE thresholds simultaneously per `plan-complexity-check.md`:

1. **Token estimate ~110–125K** (over 100K budget). Plan body alone is ~49K tokens; build-time read overhead adds ~15–20K context per phase.
2. **Task count is 41** vs ~30 SINGLE threshold. No compression possible — every task has a hard prerequisite chain.
3. **Files touched ~44** vs ~25 SINGLE threshold. Cross-domain (source / templates / tests / fixtures / docs).

The plan was designed to be split — the Splittability Note in `plan-v3-checked.md` (lines 798–806) explicitly defines the three sub-plan groupings and documents the hard cross-phase dependencies. Phase boundaries are the natural cleavage points.

---

## Sub-plan summary

<!-- prettier-ignore -->
| Sub-plan | Scope summary | Tasks | Files touched | Hard prereqs | Estimated tokens | Ship target |
| --- | --- | --- | --- | --- | --- | --- |
| **A** ([bar-167-drop-envelope-hybrid-plan-1.md](./bar-167-drop-envelope-hybrid-plan-1.md)) | Phase 1: drop `__bkit__` envelope; add `deepContains`, `writeTier2JsonContained`, `migrateLegacyBkitEnvelope`, `stripTier2JsonScope`; rewrite `.cursor/hooks.json` (Cursor v1 keyed-object) and `.claude/settings.json` (envelope-free); preflight advisories + blocker; Phase 1 docs (DE-16, KN-15, architecture rewrite, CHANGELOG, README, pending). | 24 (`0c, 0d, 0e, 1, 1b, 2, 3, 4, 4b, 5, 6, 7, 8, 8b, 9, 10, 10a, 11, 12, 13, 14, 14a, 15, 16`) | ~17 — `.agents/scripts/{bkit-tiers,bkit-modules,bkit-preflight,bkit-uninstall,bkit-version,bkit-paths(new),bkit-tier1-defaults(delete),bkit-tier1-defaults.test(delete)}.ts`; `.agents/templates/.cursor/hooks.json`; `.agents/templates/.claude/settings.json`; `.agents/scripts/{bkit-tiers,bkit-uninstall,bkit-modules.upgrade.integration,bkit-modules.integration,bkit-doctor.integration}.test.ts`; `tests/fixtures/heavy-customised-consumer-v1-envelope/`, `tests/fixtures/heavy-customised-prepush/`, `tests/fixtures/heavy-customised-ci/`; `docs/{decisions,knowledge,architecture,pending}.md`; `CHANGELOG.md`; `README.md`; `package.json` (version bump). | None — sub-plan A is the foundation. | ~50K | `bkit v2.0.0-alpha` (or first incremental landing if single-tag mode). |
| **B** ([bar-167-drop-envelope-hybrid-plan-2.md](./bar-167-drop-envelope-hybrid-plan-2.md)) | Phase 2: add `<!-- bkit:start -->` markers to 12 Group A files + 3 Group B partial-marker files; simplify `bkit-manifest.ts` schema (`tier` → `format`); refactor install/check/uninstall to single dispatch on `entry.format`; add advisory `tier2-text-drift`; Phase 2 marker tests + Tier-3 drift regression. | 14 (`17, 17a, 18, 18a, 18b, Sub-gate 2A, 19, 20, 21, 22, 23, 23a, 23b, 24`) | ~15 — `.agents/scripts/{bkit-manifest,bkit-install,bkit-modules,bkit-uninstall,bkit-preflight}.ts`; Group A templates: `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/00-shared-rules.mdc`, `.vale/styles/House/{Filler,Hedging,LLMSlop,Verbose}.yml`, `.agents/{rules,docs,friction,skills}.md`, `docs/plans/template.md`; Group B templates: `.github/workflows/ci.yml`, `.vale.ini`, `.husky/pre-push` (verify only); test files: `bkit-templates.test.ts (NEW)`, `bkit-modules.test.ts`, `bkit-modules.upgrade.integration.test.ts`, `bkit-modules.integration.test.ts`. | Sub-plan A merged. Specifically: Task 1 (`deepContains`), Task 4b (`stripTier2JsonScope`), Task 6 (preflight allow-list); Task-0d / Task-0e fixtures. | ~40K | `bkit v2.0.0-beta` (or second incremental landing). |
| **C** ([bar-167-drop-envelope-hybrid-plan-3.md](./bar-167-drop-envelope-hybrid-plan-3.md)) | Phase 3: narrow `.bkit-version` writer to emit `tier3Hashes` for `byte-equal-text` only; rewrite `bkit-tiers.ts` doc-block (single-model semantics); sweep `Tier [123]` strings from `docs/`; add `lint:no-tier-terms` to `package.json`. | 5 (`25, 26, 27, 28` + `lint:no-tier-terms` script) | ~10 — `.agents/scripts/bkit-version.ts`; `.agents/scripts/bkit-tiers.ts` (doc-block only); `.agents/scripts/{bkit-version,bkit-tiers}.test.ts`; `.agents/scripts/bkit-modules.integration.test.ts` (re-verify Dockerfile safe-delete row); `docs/{architecture,testing,deployments,knowledge,completed}.md`; `README.md`; `package.json` (lint script + version bump). | Sub-plan B merged (Task 19 — manifest `format` field). Sub-plan A merged (Tasks 11–13 — DE-16, KN-15, architecture rewrite as baseline for Task 27 sweep). | ~20K | `bkit v2.0.0` (final tag drops `-alpha`/`-beta` suffix). |

**Total tasks across children: 24 + 14 + 5 = 43.**

> Note on the count: master plan-v3 enumerates 41 numbered runbook tasks plus 2 cross-cutting checkboxes inside the runbook (the explicit `Sub-gate 2A` checkbox and the `lint:no-tier-terms` script — separate from Task 28's wrapper-task) that the splittability note references. Sub-plan B carries the `Sub-gate 2A` row (gate-marker, +1); sub-plan C carries the `lint:no-tier-terms` script row (+1). The arithmetic is `24 + 14 + 5 = 43` against `41 numbered tasks + 2 in-runbook items = 43`. No tasks are duplicated across sub-plans; no tasks are dropped.

---

## Cross-sub-plan dependency diagram

```
sub-plan A (bar-167-drop-envelope-hybrid-plan-1.md, Phase 1)
  │
  ├─ Task 0c ───► fixture used by Task 3 + Task 9
  ├─ Task 0d ───► fixture used by sub-plan B Task 23b
  ├─ Task 0e ───► fixture used by sub-plan B Task 23a
  ├─ Tasks 1, 1b, 2, 3, 4 ───► foundational primitives + module rewrite
  ├─ Task 4b  ════════════════════════════════════╗
  ├─ Task 5 (PREREQ: 1, 1b, 2, 3, 4, 14a)         ║
  ├─ Task 6   ════════════════════════════════════╣
  ├─ Task 7 (PREREQ: 0c)                          ║
  ├─ Tasks 8–10a (tests; some marked              ║
  │     `// PREREQ: Task 19 reclassification`)    ║
  ├─ Tasks 11–13  ════════════════════════════════╬══╗   (DE-16, KN-15,
  ├─ Task 14a (MUST run before Task 5)            ║  ║    architecture
  └─ Tasks 14, 15, 16                             ║  ║    rewrite —
                                                  ║  ║    baseline for
                                                  ║  ║    sub-plan C sweep)
                                                  ║  ║
                                                  ▼  ║
sub-plan B (bar-167-drop-envelope-hybrid-plan-2.md, Phase 2)                   ║
  ├─ Tasks 17, 17a, 18, 18a, 18b                     ║
  ├─ ─── 🔒 Sub-gate 2A ───                          ║
  │      (blocks PREREQ-tagged tests until Task 19)  ║
  ├─ Task 19 ════════════════════════════════════╗   ║   (`format` on
  ├─ Task 20 (single dispatch on `entry.format`) ║   ║    ManifestEntry —
  ├─ Task 21 (`tier2-text-drift` advisory)       ║   ║    needed by
  ├─ Task 22 (bkit-templates.test.ts NEW)        ║   ║    sub-plan C
  ├─ Task 23 (Tier-3 drift regression)           ║   ║    Task 25)
  ├─ Task 23a (PREREQ: sub-plan A Task 0e)       ║   ║
  ├─ Task 23b (PREREQ: sub-plan A Task 0d)       ║   ║
  └─ Task 24 (Phase 2 zero-drift verification)   ║   ║
                                                 ▼   ▼
sub-plan C (bar-167-drop-envelope-hybrid-plan-3.md, Phase 3)
  ├─ Task 25 (PREREQ: sub-plan B Task 19)
  ├─ Task 26 (PREREQ: sub-plan A Tasks 11–13 — HARD ORDERING)
  ├─ Task 27 (PREREQ: sub-plan A Tasks 11–16 — HARD ORDERING; sweep AFTER baseline)
  └─ Task 28 (`lint:no-tier-terms` script — Task 27 verification dependency)
```

**Hard dependencies (one-line summary):**

- **Sub-plan B → sub-plan A:** Tasks 1, 4b, 6 of sub-plan A; fixtures from Tasks 0d and 0e.
- **Sub-plan C → sub-plan B:** Task 19 of sub-plan B (manifest `format` field).
- **Sub-plan C → sub-plan A:** Tasks 11–13 of sub-plan A (doc-rewrite baseline for sweep).

---

## Ship-mode decision

**Choice: pre-release tags per sub-plan landing — `2.0.0-alpha` (sub-plan A) → `2.0.0-beta` (sub-plan B) → `2.0.0` final (sub-plan C).**

Rationale:

- Each sub-plan is independently testable end-to-end; pre-release tags let consumers opt in to early phases (e.g. `app-gether-life` could test `2.0.0-alpha` for envelope migration before Phase 2 markers add complexity).
- Reduces risk of a single 3-phase-wide ship cycle going red.
- Simplifies rollback granularity: each sub-plan is its own `git revert` boundary.
- `package.json` `"version"` bumps in sub-plan A Task 14a (to `2.0.0-alpha`), sub-plan B (to `2.0.0-beta`), sub-plan C (to `2.0.0`).

The alternative — single v2.0.0 tag on the last merge with all three sub-plans landing in `dev` incrementally — is acceptable if the team prefers to avoid pre-release npm tags. In that mode the `package.json` version stays at `2.0.0` from sub-plan A Task 14a onwards, and only the final tag operation in sub-plan C is treated as the "v2.0.0 ship".

---

## Master Success Criteria — preserved across children

The four success criteria from `plan-v3-checked.md` §Acceptance Scenario apply collectively across all three sub-plans:

1. **Zero-drift on clean v2.0.0 install** — sub-plan A handles JSON surfaces; sub-plan B handles markered-text surfaces; sub-plan C verifies the cumulative.
2. **`__bkit__` removed; Cursor v1 keyed-object schema; consumer keys preserved byte-identical across upgrade chain** — sub-plan A.
3. **Phase 2 markers added to all listed files; partial-ownership block byte-equal enforced; Tier-3 drift regression caught** — sub-plan B.
4. **Phase 3 cleanup: `Tier [123]` removed from docs; `bkit-manifest.ts` `format` field; `bkit-tiers.ts` doc-block rewritten; `lint:no-tier-terms` exits 0** — sub-plan C.

The "net deletion ≥ 200 LOC" requirement applies to the **path-scoped** Phase 1 deletion targets only (sub-plan A Task 7 verification). Sub-plan B's marker additions are explicitly excluded from this check.

---

## Self-verification (lossless split)

**Task count parity:** master enumerates 41 numbered runbook tasks plus 2 in-runbook items (`Sub-gate 2A` checkbox + `lint:no-tier-terms` script wrapped under Task 28) = 43. Sub-plans carry: A=24, B=14 (incl. Sub-gate 2A as gate-marker), C=5 (incl. `lint:no-tier-terms` script row + Task 28) → 24+14+5 = **43 = 43 ✓**.

**Test Matrix row parity:**

- Phase 1 rows (24 in master) → all in sub-plan A.
- Phase 2 rows (7 in master) → all in sub-plan B.
- Phase 3 rows (5 in master) → all in sub-plan C.
- Total 36 rows → preserved across sub-plans (no row dropped or duplicated).

**🔒 Gate parity:** master has Gate 1, Sub-gate 2A, Gate 2, Gate 3, Gate 4. Sub-plan A carries scoped-A versions of Gate 1/2/3/4. Sub-plan B carries Sub-gate 2A and scoped-B versions of Gate 1/2/3/4. Sub-plan C carries scoped-C versions of Gate 1/2/3/4 (the final sub-plan C Gate 2/3/4 are the cumulative "all phases done" signal).

**Token-budget parity:** sub-plan A ~50K, sub-plan B ~40K, sub-plan C ~20K → all ≤100K cap.

**Bidirectional links:** each child carries `Parent Plan: bar-167-drop-envelope-hybrid-plan.md`; this index links to all three children.

**Template invariants per `docs/plans/template.md`:** each child has Verdict header, Context/Goals, Acceptance Scenario with human checkboxes, Breaking Changes & Naming Review, Out of Scope, Merge Method, Supersession Inventory, Security & Privacy, Pre-Flight + Gate 1, Architecture & Component Changes, Documentation Updates, Rollback Strategy, Agent Execution Runbook with task-id checkboxes, Gates 2/3/4, Verification Plan, Open-Question Disposition, Reviewer notes.

**Verdict:** PASS — split is lossless, dependencies preserved, each sub-plan ≤100K tokens, each sub-plan self-contained per template.
