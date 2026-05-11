Verdict: PASS

<!-- verdict:end -->

## Ship Summary — BAR-167

### What shipped

**Merged commit:** `da8dcfc` (squash merge to dev, 2026-05-11T10:11:09Z)
**PR:** #20 — bkit v2.0.0 breaking-change release

**Scope:** All three phases of bar-167 bundled into single v2.0.0 squash:

- **Phase 1 (A):** Drop `__bkit__` JSON envelope; add `deepContains`, `writeTier2JsonContained`, `migrateLegacyBkitEnvelope`, `stripTier2JsonScope`; rewrite `.cursor/hooks.json` and `.claude/settings.json` to envelope-free; introduce preflight advisories; Phase 1 docs (DE-16, KN-15, architecture rewrite, CHANGELOG, README).
- **Phase 2 (B):** Add `<!-- bkit:start -->` markers to 12 Group A + 3 Group B template files; simplify `bkit-manifest.ts` schema (tier→format); refactor install/check/uninstall to single dispatch on `entry.format`; add `tier2-text-drift` advisory; Phase 2 marker tests + Tier-3 drift regression.
- **Phase 3 (C):** Narrow `.bkit-version` writer to emit `tier3Hashes` for `byte-equal-text` only; rewrite `bkit-tiers.ts` doc-block; sweep `Tier [123]` strings from docs; add `lint:no-tier-terms` script.

**Scale:** 11,211 additions, 1,801 deletions across 116 files. Largest diff at ~17.5K lines (flagged for partial coverage review per threshold).

### Key decisions

1. **Three sub-plans executed sequentially (Phase 1→2→3) with per-phase remediation loops** — 12 gaps in Phase 1 + 7 gaps in Phase 2 + 0 gaps in Phase 3 all fixed without reversion. Each sub-plan re-verified to PASS after remediation before advancing. Holistic cross-phase verification (build-plan-verify-holistic.md) confirmed all invariants post-remediation.

2. **6 MAJOR findings in build-challenge phase all remediated pre-merge** — 4 CRITICAL (writeTier2JsonContained data-loss, manifest format mismatches for slop-scan.config.json / ci.yml / .vale.ini) + 2 HIGH (CHANGELOG.md under-representation, stripBkitBlock regex greediness). Challenge remediate cycle completed with full test green (787 passed, 2 skipped, 1 todo).

3. **Rebase to dev required 4 conflict rounds** (commits 8, 11, 38, 40 of 50) — all mechanical: version bump (2.0.0 vs 1.1.2), getPkgRoot refactor into bkit-paths.ts, CHANGELOG additive entries, mirror command files. Typecheck and test suite passed post-rebase. Rebase result: 50/50 commits rebased cleanly after conflict resolution.

4. **Squash merge strategy** — all 50 commits (3 sub-plans worth) bundled into single squash commit `da8dcfc` to dev. No pre-release tags applied (alternative considered in plan was `2.0.0-alpha` → `2.0.0-beta` → `2.0.0`; final call merged at `2.0.0` directly).

### Shipability

**Merge status:** COMPLETED — PR #20 merged to dev at 2026-05-11T10:11:09Z. Conflicts resolved, all tests green.

**CI status:** Full test suite passed (787 tests, 2 skipped, 1 todo). No regressions introduced by remediation fixes. `pnpm typecheck`, `pnpm build` all exit 0.

**Verification:** Build-challenge cycle identified and fixed all MAJOR findings. Holistic verification (post-Phase-3) confirmed zero integration failures across all three sub-plans. Drift advisory routing, manifest dispatch consistency, JSON containment dispatch, writer narrowing, doc-block sweep ordering all validated.

**Known follow-ups (post-merge maintenance, not blockers):** 10 MINOR findings deferred — deepContains docstring precision, stripTier2JsonScope JSON key-order sensitivity, detectSchemaFlip shallow-only limitation, migrateLegacyBkitEnvelope dry-run idempotence, markeredTextPaths hard-coding, ci.yml indented-marker assertion, describe.skip blocks ready for Task 19 follow-up. None block shipment; all are observability/maintenance quality issues flagged for next cycle.

### Follow-ups (docs/pending.md)

1. **Post-merge test smoke:** Consumer repo migration via `pnpm bkit upgrade` deferred to deployment phase (not in build phase scope). Verify envelope-migration path works on at least one customer repo once v2.0.0 released.

2. **MINOR findings remediation:** Address MINOR-1 through MINOR-11 in dedicated maintenance cycle post-ship — priority: MINOR-9 (describe.skip blocks to activate when Task 19 re-verification occurs), MINOR-1/2 (precision issues in JSON containment), MINOR-11 (migration idempotence).

3. **NPM release:** Tag `v2.0.0` on squash commit `da8dcfc` and publish to npm. Breaking change notice in release notes: drops `__bkit__` envelope (consumers auto-migrate via `pnpm bkit upgrade`); introduces format-aware containment (markers for text, deep trees for JSON); schema change in bkit-manifest.ts (tier→format field).

4. **Consumer outreach:** Announce v2.0.0 breaking change to app-gether-life and any other known consumers. Recommend upgrade path: `pnpm install -u bkit@2.0.0`, then `pnpm bkit upgrade` to auto-migrate config files.
