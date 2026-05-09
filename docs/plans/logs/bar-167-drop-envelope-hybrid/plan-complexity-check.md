Verdict: SINGLE

<!-- verdict:end -->

# Plan Complexity Check

## Counts

### Runbook Tasks (Phase 1 only — the scoped ship unit)

| Task | Description | Domain |
| --- | --- | --- |
| 0a | Cursor v1 spike re-run (sandbox + log verification) | Infra / tooling |
| 0b | Read decisions + knowledge docs | Context |
| 0c | Create `tests/fixtures/heavy-customised-consumer-v1-envelope/` static fixture | Test data |
| 1 | Implement `deepContains` in `bkit-tiers.ts` | Core logic |
| 1b | Extract `getPkgRoot()` to new `bkit-paths.ts` | Refactor |
| 2 | Rename `writeTier2Json` → `writeTier2JsonContained`; remove envelope guard; add schema-flip | Core logic |
| 3 | Implement `migrateLegacyBkitEnvelope` pure helper in `bkit-tiers.ts` | Core logic |
| 4 | Update `runClaudeModule` + `runCursorModule` in `bkit-modules.ts` | Integration wiring |
| 4a | Reclassify manifest tier integers in `bkit-manifest.ts` | Config |
| 4b | Implement `stripTier2JsonScope` + extend `case 2` branch in `bkit-uninstall.ts` | Core logic |
| 5 | Rewrite two template JSON files; run self-install smoke | Templates |
| 6 | Add three advisories/blockers to `bkit-preflight.ts` | Core logic |
| 7 | Delete `bkit-tier1-defaults.ts`, `bkit-tier1-defaults.test.ts`; delete three symbols from `bkit-tiers.ts`; fix import sites | Deletions |
| 8 | Rewrite `bkit-tiers.test.ts` — remove old blocks, add 14+ new test rows | Tests |
| 9 | Add upgrade integration tests to `bkit-modules.upgrade.integration.test.ts` | Tests |
| 10 | Add modules integration test rows (advisory/blocker/uninstall matrix) | Tests |
| 10a | Add `bkit doctor` integration test rows | Tests |
| 11 | Append DE-16; mark DE-7, DE-8 superseded in `docs/decisions.md` | Docs |
| 12 | Append KN-9; mark KN-8 superseded in `docs/knowledge.md` | Docs |
| 13 | Rewrite Tier-2 JSON section of `docs/architecture.md` | Docs |
| 14 | Append v2.0.0 CHANGELOG entry | Docs |
| 14a | Bump `package.json` to `2.0.0`; `pnpm install` | Versioning |
| 15 | README sweep — remove `__bkit__` mentions | Docs |
| 16 | Append 5 entries to `docs/pending.md` | Docs |

**Total runbook tasks:** 24 (including 3 pre-implementation tasks, 12 code tasks, 4 test tasks, 5 doc tasks)

### Gates

- Gate 1: Prerequisites (2 human-confirmation checkboxes + 4 checklist items)
- Gate 2: Code Implementation (LOC delta verification)
- Gate 3: Testing & Documentation
- Gate 4: Automated Verification

**Total gates:** 4 (all 4 are sequential within Phase 1)

### Domain Areas

| Domain | Files touched |
| --- | --- |
| Core logic (bkit-tiers.ts) | ADD `deepContains`, `writeTier2JsonContained`, `migrateLegacyBkitEnvelope`; DELETE 3 exports |
| Core logic (bkit-uninstall.ts) | ADD `stripTier2JsonScope`; extend `case 2` branch |
| Integration wiring (bkit-modules.ts) | Swap `writeTier2Json` → `writeTier2JsonContained`; add migration call sites |
| Preflight (bkit-preflight.ts) | ADD 3 advisories/blockers; extend allow-list |
| Shared util (bkit-paths.ts) | NEW file (lift `getPkgRoot`) |
| Manifest (bkit-manifest.ts) | 2 tier integer flips |
| Templates (2 JSON files) | Rewrite `.cursor/hooks.json`, `.claude/settings.json` |
| Test fixtures | CREATE `tests/fixtures/heavy-customised-consumer-v1-envelope/` (3 JSON files) |
| Tests (4 files) | `bkit-tiers.test.ts`, `bkit-modules.upgrade.integration.test.ts`, `bkit-modules.integration.test.ts`, `bkit-doctor.integration.test.ts` |
| Deletions (2 files) | `bkit-tier1-defaults.ts`, `bkit-tier1-defaults.test.ts` |
| Docs (6 files) | `docs/decisions.md`, `docs/knowledge.md`, `docs/architecture.md`, `CHANGELOG.md`, `README.md`, `docs/pending.md` |

**Total distinct files touched:** ~17 (10 code/test + 3 fixture + 2 template + 6 doc; minus 2 deleted = 15 net)

### LOC Delta Estimate

- Additions: `deepContains` ~60 LOC, `writeTier2JsonContained` ~40 LOC, `migrateLegacyBkitEnvelope` ~40 LOC, `stripTier2JsonScope` ~50 LOC, `bkit-paths.ts` ~15 LOC, preflight advisories ~80 LOC, test additions ~250 LOC across 4 files, doc prose ~150 LOC. Total additions: ~685 LOC.
- Deletions: `bkit-tier1-defaults.ts` + test file ~180 LOC, 3 deleted symbols ~120 LOC, old envelope test blocks ~60 LOC, old import wires ~20 LOC. Total deletions: ~380 LOC. Net reduction: ~-200 LOC raw (aligns with the plan's stated ≥ 200 LOC reduction gate).

## Session Fit Estimate

- **Context cost:** plan doc at ~32K tokens (read once at session start). Core source files (`bkit-tiers.ts`, `bkit-modules.ts`, `bkit-uninstall.ts`, `bkit-preflight.ts`) estimated 2K–5K tokens each — 4 files = ~16K tokens. Supporting files (manifest, paths, tests, templates) ~10K tokens. Total read budget: ~58K tokens.
- **Execution cost:** 24 sequential tasks, each requiring a targeted read-modify-verify cycle. Median task size is modest (single-function add or targeted edit). The largest tasks (Task 1/2/3/4b — new primitives; Task 8/9/10 — test rewrites) each resolve inside one or two edit+verify tool calls. Estimated generation cost across all tasks: ~25K–35K tokens.
- **Total estimate: ~83K–93K tokens — below the 100K threshold.**

The plan's tasks are well-sequenced with explicit hard prerequisites (Task 14a before Task 5; Task 0c before Task 7). Every task has a discrete, verifiable output (`pnpm vitest run <file>` green or `pnpm tsc --noEmit` clean). There are no ambiguous open design decisions left in Phase 1; all edge cases are fully specified in the plan.

## Rationale

Phase 1 fits a single build session. Key reasons:

1. **Bounded surface.** All code changes are concentrated in one module family (`bkit-tiers.ts`, `bkit-modules.ts`, `bkit-uninstall.ts`, `bkit-preflight.ts`) plus a new two-file extraction (`bkit-paths.ts`). No new routes, no DB changes, no infra changes. The scope is a single-domain internal CLI refactor.

2. **Tight sequential ordering.** The plan already serialises the risky ordering constraints (version bump before self-install, fixture commit before deletions, core primitives before callers). A build agent can execute linearly without backtracking.

3. **Deletions reduce complexity mid-session.** Tasks 0c and 7 remove the `bkit-tier1-defaults` module and three stale exports before the test phase. This cleans up the compile surface so later tasks face fewer moving parts.

4. **Test additions are self-contained.** The ~14 new test rows map 1:1 to the plan's Derived Test Matrix. Each row targets a specific function with a specific input-output contract. No new test infrastructure is required (existing Vitest + fixture pattern).

5. **Token budget clears the threshold.** Estimated 83K–93K tokens is comfortably below 100K. The plan's documentation tasks (Tasks 11–16) are prose appends — low token cost, no logic.

6. **Phase 2 and Phase 3 are fully out of scope.** The plan is unambiguous: Phase 1 ships alone as v2.0.0. The complexity-check result does not change that decision — a SINGLE verdict here does not bundle Phase 2; it confirms Phase 1 fits one session.
