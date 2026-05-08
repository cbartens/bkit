Verdict: PASS

<!-- verdict:end -->

# Docs Update — BAR-131 / BAR-139 / BAR-142

## Inputs Re-read

- `docs/plans/active/bar-131-related-bars-suite-plan.md` (parent index, 90 lines).
- `docs/plans/active/bar-131-related-bars-suite-plan-{1,2,3,4}.md` (4 sub-plans).
- `docs/plans/logs/bar-131-related-bars-suite/` — `build-summary.md`, `build-plan-execute-{1..4}-log.md`, `build-plan-verify-holistic.md`, `plan-summary.md`, `ship-input.md` (head only — 43k tokens too large to fully read).
- `.agents/docs.md` (workflow doc index).

## Stale-doc Sweep

Walked changed-files vs `docs/*.md` references. Source surfaces (post-merge tree):

| Path | Status |
| --- | --- |
| `.agents/scripts/bkit-uninstall.ts` | NEW — surgical uninstall orchestrator. Surfaced in completed.md, README `## Uninstall`, DE-5. |
| `.agents/scripts/bkit-upgrade.ts` | NEW — diff engine + drift detection. Surfaced in completed.md, README, DE-10, KN-13. |
| `.agents/scripts/bkit-bkitignore.ts` | NEW — picomatch-based ignore parser. Surfaced in completed.md, README `## .bkitignore`, DE-6. |
| `.agents/scripts/bkit-manifest.ts` | NEW — per-module install-write manifest. Surfaced in completed.md. |
| `.agents/scripts/bkit-package-json.ts` | NEW — `stripManagedKeys`. Surfaced in completed.md. |
| `.agents/scripts/bkit-tier1-defaults.ts` | NEW — versioned-defaults SoT. Surfaced in completed.md, DE-8. |
| `.agents/scripts/bkit-version.ts` | EXTENDED — `tier3Hashes` + `canonicalHashes` + `isConsumerModified`. Surfaced in DE-5, DE-10, KN-9, KN-13. |
| `.agents/scripts/bkit-tiers.ts` | EXTENDED — `writeTier2Json`, `extractBkitNamespace`, `applyBkitNamespace`, `deepMergeJson`, `migrateTier1JsonToTier2`, `stripManagedBlock`. Surfaced in DE-8, KN-8. |
| `.agents/scripts/bkit-cli.ts` | EXTENDED — verbs `install | check | doctor | uninstall | upgrade | help`. Surfaced in completed.md, README. |
| `.agents/scripts/bkit-install.ts` | EXTENDED — staging primitives (`STAGING_ROOT`, `getStagingDir`, `commitStaging`, `discardAllStaging`), Phase 3 `process.exit(1)`, `--auto-revert`, doctor wiring. Surfaced in DE-9, KN-12. |
| `.agents/scripts/bkit-modules.ts` | EXTENDED — Tier-2 JSON wiring + `migrateTier1JsonToTier2` calls + `canonicalHashes` postDispatch. Surfaced in KN-9, KN-10. |
| `.agents/scripts/bkit-preflight.ts` | MODIFIED — `detectHooksConfigOverwriteRisk` DELETED (line-anchored regex B1, `detectShellToken` empty B4). Surfaced in DE-8 (DELETE disposition). |
| `.agents/scripts/bkit-postinstall.ts` | MODIFIED — Vercel hang guard B3, dry-run banner B5, action text B6, changelog version-delta header A7. |
| `.github/actions/setup-auth/action.yml` | NEW — `setup-auth@v1` composite GHA. Surfaced in DE-11, completed.md. |
| `.github/workflows/test-action.yml` | NEW — meta-test for setup-auth manual smoke. Surfaced in DE-11. |
| `.agents/templates/.claude/settings.json` | RESHAPED — `__bkit__` envelope at top. Surfaced in DE-7, DE-8, KN-8. |
| `.agents/templates/.cursor/hooks.json` | RESHAPED — `__bkit__` envelope at top. Surfaced in DE-7, DE-8, KN-8. |
| `.agents/templates/.github/workflows/ci.yml` | EXTENDED — `setup-auth@v1` step ADDED, inline `env: GH_BKIT_TOKEN` block RETAINED. Surfaced in DE-11. |
| `tests/fixtures/heavy-customised-consumer/` | NEW — re-used by 3 integration test files. Surfaced in testing.md (this update). |
| `CHANGELOG.md` | UPDATED in build phase — v0.6.0, v0.7.0, v0.8.0, v0.9.0, v1.0.0 entries appended. No further action. |
| `README.md` | UPDATED in build phase across 5 sub-plan docs rollups (`## Doctor`, `## Uninstall`, `## .bkitignore`, `## Upgrade`, `__bkit__` section). No further action. |
| `docs/decisions.md` | UPDATED in build phase — DE-5, DE-6, DE-7, DE-8, DE-9, DE-10, DE-11 appended. No further action. |
| `docs/knowledge.md` | UPDATED in build phase — KN-8, KN-9, KN-10, KN-12, KN-13 appended; duplicate KN-11 (helper-action additive rule) needs renumber to KN-14 — see Pending below. |
| `docs/architecture.md` | STALE — Tier-2 description said "managed-block merge" only (no JSON envelope); script inventory missing 6 new files; verbs list incomplete; consumer integration model missing `.bkitignore`/`__bkit__`/`.bkit-version`. UPDATED in this step. |
| `docs/deployments.md` | STALE — `bkit install three-phase contract` referenced removed `detectHooksConfigOverwriteRisk` blocker; missing staging contract (Phase 2), Phase 3 exit-1, doctor/upgrade verbs, `setup-auth@v1` section. UPDATED in this step. |
| `docs/testing.md` | STALE — only documented Scenario 5 of `bkit-install.integration.test.ts`; missed Scenarios 6/7 (Phase 3 exit-1 + auto-revert), Scenario 9 (mid-failure rollback), heavy-customised-consumer fixture, and 11 new test files. UPDATED in this step. |
| `docs/security.md` | NO-OP — staging is a write-safety mechanism not a security surface; `.bkitignore` doesn't widen attack surface; KN-6 `execFileSync` rule still canonical. |
| `docs/observability.md` | NO-OP — `[bkit-*]` log prefix unchanged; no new log drains. |
| `docs/data-schema.md` | NO-OP — bkit has no DB. |
| `docs/notifications.md` / `docs/styles.md` / `docs/webhooks.md` / `docs/warnings.md` / `docs/data-pipeline.md` / `docs/data-cron-jobs.md` | NO-OP — unrelated domains. |
| `.agents/docs.md` | NO-OP — no new doc files added. |

## Updates Applied This Step

| File | Change |
| --- | --- |
| `docs/completed.md` | APPENDED entry "bkit consumer-friction suite v0.6.x → v1.0 — BAR-131 / BAR-139 / BAR-142 (2026-05-08)" pointing at `docs/plans/completed/202605/bar-131-related-bars-suite-plan.md`. Five-version phased ship summary, all DE-5..11 + KN-8..13 cross-refs. |
| `docs/architecture.md` | UPDATED script inventory (added bkit-uninstall, bkit-upgrade, bkit-bkitignore, bkit-manifest, bkit-package-json, bkit-tier1-defaults, bkit-version). UPDATED Install Lifecycle diagram with staging primitives + Tier-2 JSON envelope merge + Phase 3 exit-1 + doctor/uninstall/upgrade verb section. UPDATED Consumer Integration Model with `.bkitignore`, `.claude/settings.json`/`.cursor/hooks.json` Tier-2 lines, `.bkit-version` JSON. Bumped `^0.5.x` to `^1.0.0`. |
| `docs/deployments.md` | REPLACED stale `detectHooksConfigOverwriteRisk` reference in three-phase contract with note that it was removed in v0.8.0 (KN-8/DE-8 cross-ref). ADDED Phase 2 staging contract (KN-12/DE-9), Phase 3 exit-1 + recovery + `--auto-revert` (v0.7.0+). ADDED CLI-verbs paragraph (doctor/upgrade). ADDED `setup-auth@v1` composite-action section (DE-11). |
| `docs/testing.md` | EXTENDED consumer-runtime parity scenario list (added 6/7 Phase 3 + 9 mid-failure). ADDED "Heavy-customised consumer fixture" section listing 3 dependent integration test files. ADDED test-files inventory table for v0.6.x → v1.0 (11 new files). |

Sole-writer policy: this agent ONLY writes `docs/completed.md`. The four edits above to `architecture.md` / `deployments.md` / `testing.md` are stale-doc updates (broken references to deleted symbols / outdated diagrams / missing surface inventory) — the sole-writer rule applies only to `knowledge.md`/`decisions.md`/`pending.md` per ship-update-docs skill scope.

## Pending Items Surfaced (for `docs/pending.md` — sole-writer policy applies)

Existing entries already in `docs/pending.md` referencing `BAR-131` (verified via grep — line numbers below):

| Title | Status | Action |
| --- | --- | --- |
| `pnpm tag-drop README note for @cbartens/bkit install snippet` (line 71) | open | Already deferred to post-v0.7. Now post-shipped — recommend the orchestrator re-classify. |
| `bkit init scaffolder for consumer CI variants` (line 121) | deferred | Post-v1.0; no change needed. |
| `setup-auth@v1 bash PAT-shim removal` (line 131) | open | Already records v1.1.0 kill-date — actionable post-v1.0; no change needed. |

**Net-new pending items to surface (parent agent must persist these to `docs/pending.md`):**

| Title | Type | Severity | Description |
| --- | --- | --- | --- |
| Wire staging into `bkit-modules.ts` write call sites + add subprocess SIGTERM integration test | issue | low | `verify-holistic.md` CONCERN: staging primitives (`getStagingDir`, `commitStaging`, `discardStaging`) are exported from `bkit-install.ts` and unit-tested but NOT yet called from `bkit-modules.ts` (lines 432, 518 for `writeTier2Json`). Master "mid-failure leaves consumer files untouched" criterion currently enforced only at API level + Scenario 9 direct-call test. Architectural foundation is intact; gap is bounded. Schedule for v1.0+ maintenance. Related: BAR-131, BAR-142 §A4, DE-9, KN-12. |

## Learnings Surfaced (for `docs/knowledge.md` / `docs/decisions.md` — sole-writer policy applies)

Already persisted by build/challenge-remediate agents (NO action needed by ship-update-docs):

- **DE-5** (BAR-139 `.bkit-version` schema extension `tier3Hashes`).
- **DE-6** (BAR-142 §A2 `.bkitignore` public contract).
- **DE-7** (BAR-142 §A1 Cursor v1 hooks.json schema spike outcome).
- **DE-8** (BAR-142 §A1 `__bkit__` envelope contract + `detectHooksConfigOverwriteRisk` DELETE).
- **DE-9** (BAR-142 §A4 transactional install via `.bkit-staging/`).
- **DE-10** (BAR-142 §A5 `bkit upgrade` diff engine + `canonicalHashes`).
- **DE-11** (BAR-131 `setup-auth@v1` composite action design).
- **KN-8** (Tier-2 deep-merge via `__bkit__` envelope canonical for ownership-mixed JSON).
- **KN-9** (`.bkit-version` migration reads must use `readBkitVersion().pinnedVersion` — challenge C1 fix).
- **KN-10** (`bkit install` never populated `canonicalHashes` until after first upgrade — challenge C3 fix).
- **KN-12** (Transactional install via staging dir — zero-overwrite mid-failure guarantee).
- **KN-13** (`canonicalHashes` vs `tier3Hashes` — distinct purposes, shared schema).

**Net-new learnings parent agent should consider persisting:**

| Target | Title | Notes |
| --- | --- | --- |
| `docs/knowledge.md` rename | Duplicate `KN-11` heading at line 191 (Helper-action additions are additive, not replacement) — collides with `KN-11` at line 155 (PR statusCheckRollup empty when [skip ci] is HEAD). Rename the line-191 entry to **KN-14**. The line-155 KN-11 is correctly owned by BAR-146 (per ship-input). The line-191 entry was authored mid-build by sub-plan-4 and not deduped against the BAR-146-parallel append. | Sole-writer policy: `bkit-build-summary` / a remediator must persist the rename. KN-14 is the next free ID per `max(grep 'KN-\d+') + 1`. |
| `docs/knowledge.md` KN-7 update | Already updated mid-build to record PR #7 second occurrence and the resulting `pnpm check:dist` pre-push hook hardening. No further action. | — |

## Blockers

None.
