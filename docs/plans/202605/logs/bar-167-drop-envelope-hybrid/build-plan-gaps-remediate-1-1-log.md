Verdict: PASS
Strategy: STANDARD

<!-- verdict:end -->

# Plan Gaps

## Remediation Log

DONE — Gap 1: Remove stale P3.T4/P3.T5 test blocks from bkit-modules.test.ts — deleted ~50 LOC of describe blocks referencing deleted symbols (writeTier2Json, migrateTier1JsonToTier2, **bkit** envelope) (.agents/scripts/bkit-modules.test.ts)
DONE — Gap 2: Update stale doc-comment in bkit-upgrade.ts:21 — replaced P3.T6 migrateTier1JsonToTier2 reference with BAR-167 v2.0.0 migrateLegacyBkitEnvelope description (.agents/scripts/bkit-upgrade.ts)
DONE — Gap 3: Task 7 net-deletion verification — path-scoped git diff shows 534 deletions, 219 insertions = net -315 LOC across the five Phase 1 paths (>=200 threshold satisfied) (.agents/scripts/bkit-tier1-defaults.ts, bkit-tiers.ts, templates)
DONE — Gap 4: Add missing Task 10 stubs to bkit-modules.integration.test.ts — added describe.skip blocks for bkit uninstall --claude consumer-key survival, bkit uninstall --cursor consumer-key survival, and slop-scan.config.json tier2-json-drift row; all marked PREREQ: Task 19 reclassification (.agents/scripts/bkit-modules.integration.test.ts)
DONE — Gap 5: Task 11 DE-18 — appended DE-18 (BAR-167 drop-envelope decision) to docs/decisions.md; marked DE-7 and DE-8 headers superseded by DE-18 2026-05-11 (docs/decisions.md)
DONE — Gap 6: Task 12 KN-17 — appended KN-17 (BAR-167 deep-containment knowledge entry) to docs/knowledge.md; marked KN-8 header superseded by KN-17 BAR-167 2026-05-11 (docs/knowledge.md)
DONE — Gap 7: Task 13 architecture.md rewrite — updated Tier-2 JSON section (line 66: deep-containment merge + writeTier2JsonContained), bkit-tiers.ts description, bkit-tier1-defaults.ts deletion note, and consumer integration model lines for .claude/settings.json and .cursor/hooks.json (docs/architecture.md)
DONE — Gap 8: Task 14 CHANGELOG v2.0.0 entry — appended v2.0.0 entry covering all breaking changes: **bkit** removal, public API deletions, writeTier2Json rename, Cursor v1 schema flip, migration mechanic, new primitives (CHANGELOG.md)
DONE — Gap 9: Task 15 README.md sweep — replaced **bkit** envelope section heading and all 6 user-facing prescriptive **bkit** mentions with deep-containment/format-aware language; 2 remaining historical context mentions in upgrade paragraph are appropriate (README.md)
DONE — Gap 10: Task 16 docs/pending.md follow-ups — appended bkit upgrade --prune deferred entry and Drop decorative .cursor/hooks.json echoes deferred entry per Plan-Phase Decision 3 (docs/pending.md)
DONE — Gap 12: Gate 1 human-confirmation checkboxes — checked [x] Acceptance Scenario confirmed and [x] Breaking Changes confirmed in plan (docs/plans/active/bar-167-drop-envelope-hybrid-plan-1.md:118-119)
DONE — Gap 11: Full test suite pass — typecheck, test (713 passed, 3 skipped, 1 todo), format:check, lint:slop, lint:prose all pass; also updated stale C1 regression tests in bkit-modules.integration.test.ts to reflect v2.0.0 deep-containment semantics (no **bkit** assertion)
