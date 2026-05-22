Verdict: PASS

<!-- verdict:end -->

# Plan Summary — bar-131-related-bars-suite

## Outcome

Four self-contained sub-plans (v0.6.x through v1.0) ship consumer-friction resolution across `bkit install`/`check`/`uninstall` workstreams. Split upheld losslessness: 46 phase tasks preserved, 4 cross-cutting gates intact, dependency graph explicit. All sub-plans build-ready with human-confirmable Acceptance Scenarios.

## Sub-plan ship readiness

<!-- prettier-ignore -->
| Sub-plan | Version | Verdict | Build-ready? | Major-Changes | Notes |
| --- | --- | --- | --- | --- | --- |
| sub-plan-1 | v0.6.x | PASS | Yes | None | `bkit doctor`, polish, changelog. Independent; Gate 1+2+3+4 clearable. |
| sub-plan-2 | v0.7.x | PASS | Yes | 2 items | `bkit uninstall`, Phase 3 exit-1, `.bkitignore`. Depends on sub-plan-1 (P2.T11 → P1.T1). Human-confirmed Major-Changes (exit-1 behaviour, `.bkitignore` public contract). |
| sub-plan-3 | v0.8.x | PASS | Yes | 2 items | Tier-2 deep-merge via `__bkit__` namespace. Depends on sub-plan-2 (P3.T9 → P2.T8a fixture). Human-confirmed Major-Changes (`__bkit__` public contract, Tier-1→Tier-2 reclass). P3.T0 Cursor schema spike required pre-Gate-1. |
| sub-plan-4 | v0.9–v1.0 | PASS | Conditional | None | Transactional install, `bkit upgrade`, helper action. **NOT independently shippable** — hard-blockers on sub-plan-2 (P4.T4→P2.T3, P4.T7→P2.T8a) and sub-plan-3 (P4.T1→P3.T3, P4.T5→P3.T6). Buildable after sub-plans 2+3 merge. |

## Coverage matrix

<!-- prettier-ignore -->
| Linear DoD | Closed by | Confidence | Notes |
| --- | --- | --- | --- |
| BAR-131 helper-action stretch | sub-plan-4 P4.T8 | High | Composite action, offline YAML parse test, manual GHA smoke, v1 tag. Defers to v0.2+ stretch (v1.0+ foundation only). |
| BAR-139 uninstall core | sub-plan-2 P2.T5,T6,T8a | High | Surgical uninstall (Tier-1 delete, Tier-2 managed-block strip, Tier-3 hash-guard), idempotent, `--dry-run` table, test fixtures. |
| BAR-139 Phase 3 blocker exit-1 | sub-plan-2 P2.T9 | High | Wiring in `bkit-install.ts`, recovery action text, integration fixture. |
| BAR-139 `--auto-revert` flag | sub-plan-2 P2.T10 | High | Opt-in install flag, reverts on blocker, integration test. |
| BAR-142 A1 (Tier-2 JSON refactor) | sub-plan-3 P3.T1–T6 | High | Deep-merge, `__bkit__` envelope, `writeTier2Json`, migration via versioned-defaults SoT. Two-version upgrade-survival regression test. Cursor v1 schema spike (P3.T0) prerequisite. |
| BAR-142 A3 (bkit doctor) | sub-plan-1 P1.T1 | High | CLI verb, pure read-only, integration test on stale-pin fixture. |
| BAR-142 A4 (transactional install) | sub-plan-4 P4.T1–T3 | High | Staging dir, atomic-rename, mid-failure rollback fixture (SIGTERM-after-first-module). |
| BAR-142 A5 (bkit upgrade) | sub-plan-4 P4.T5–T7 | High | Diff engine, `--non-interactive` flag, 0.4→0.5 customised-hooks scenario test. |
| BAR-142 A6 (.bkitignore) | sub-plan-2 P2.T11 | High | Parser, fs matcher, `bkit check`/`bkit doctor` integration. Per-key gated by env. |
| BAR-142 A7 (changelog surface) | sub-plan-1 P1.T7 | High | Version-delta header in post-install, CHANGELOG.md skeleton in tarball. |
| BAR-142 B1–B6 (polish) | sub-plan-1 P1.T2–T6 | High | Line-anchored markers (B1), position-stable dedup (B2), `detectShellToken` empty/unset (B4), `LOG_PREFIX` dry-run (B5), `.npmrc` fallback (B6). Vercel CLI hang guard (B3) in sub-plan-3 P3.T8. |

## Residual concerns

- **Human-confirmation gates unchecked:** Each sub-plan has 2 human-confirm checkboxes (Acceptance Scenario + Breaking Changes / No-Breaking-Changes). Status.json shows all steps DONE, but checkboxes themselves NOT visibly checked in source files. This is expected pre-review state — human review will check them before Gate 1 passes. Not a downgrade trigger per contract.
- **P3.T0 Cursor v1 schema spike:** Sub-plan-3 gates on P3.T0 spike to verify Cursor v1 hooks schema and bless `__bkit__` namespace shape. Spike is agent-executable (web search + docs review); if Cursor schema is undocumented after reasonable effort, agent issues blocker issue and pauses Phase 3 entry. Embedded in runbook as explicit abort path.
- **Sub-plan-4 cross-sub-plan blockers:** Hard dependency on sub-plan-2 P2.T3 (`.bkit-version` schema extension) and sub-plan-3 P3.T3 + P3.T6 (`writeTier2Json`, migration). Sub-plan-4 task list explicitly chains these in `Depends on` rows. Build sequence MUST be 1→2→3→4; any skip breaks build.
- **Fixture re-use across phases:** `tests/fixtures/heavy-customised-consumer/` created in sub-plan-2 P2.T8a, consumed by sub-plan-3 P3.T9 and sub-plan-4 P4.T7. Fixture is committed; all consumers reference it natively. Cross-sub-plan consistency risk mitigated by fixture snapshot baselines in each test.
- **Integration test auto-discovery:** P0.T1 extends `vitest.config.ts` glob to include `*.integration.test.ts`. Without this, integration tests added in P1+ silently skip and produce false-greens at gates. Mitigation: P0.T1 is a hard prerequisite; its verification step asserts glob string presence before any integration test is authored.

## Recommended next step

1. **Human review of sub-plans 1–4 Acceptance Scenarios.** Read each sub-plan's `## 👤 ⚠️ Acceptance Scenario` and `## 👤 ⚠️ Breaking Changes & Naming Review` sections. Confirm or request revisions before build begins. Sub-plans 2 and 3 have Major-Changes items requiring explicit human sign-off.

2. **Build sub-plan-1 first** (v0.6.x, no Major-Changes). All gates are clear: no human-confirmations needed, no cross-sub-plan dependencies. Verify Gates 1–4 cleanly before merging. This builds confidence in the split and provides `bkit doctor` for sub-plan-2's Phase 2 dependencies.

3. **Sequence thereafter:** sub-plan-2 (requires sub-plan-1 merged) → sub-plan-3 (requires sub-plan-2 merged + P3.T0 Cursor spike complete) → sub-plan-4 (requires sub-plan-2 AND sub-plan-3 merged).

4. **Friction item:** `bkit-plan-generate` stream-timeout (`.agents/friction.md` entry 2026-05-06, status OPEN) surfaced on this run. Recommend future multi-issue plans >25KB use per-phase orchestration splits or incremental writes to avoid timeout. Not a blocker for this plan (generate-plan already completed), but note for next run.

## Friction sweep

Friction entries created during this plan cycle:

<!-- prettier-ignore -->
| Title | Category | Status | Recovery | Related |
| --- | --- | --- | --- | --- |
| bkit-plan-generate stream-timeout on multi-issue plan input | tool-failure | OPEN | Retry with narrower per-phase scope. Consider splitting large plan inputs >25KB or per-phase subagent calls. | bar-131-related-bars-suite, plan-step-3 |

**Other open friction items from prior runs (not this cycle, included for context):**

- `Drafts filename lacks descriptive slug`: RECOVERED (manual mv); affects plan/design drafts naming. Recommend future FID derivation include slug token.
- `CI failure after rebase — Prettier on generated mirror files`: RECOVERED (manual `pnpm prettier`); note for future: generated mirrors should be Prettier-formatted before commit or added to `.prettierignore`.

**All major-cycle friction from design+plan workflows this session:** Recovered (canonical design copy via manual recreate, drafts naming via manual mv, stream-timeout via retry with scope reduction). Build phase is clean to enter.
