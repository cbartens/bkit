Verdict: PASS

<!-- verdict:end -->

# Docs Update — BAR-141

## Inputs Re-read

- `docs/plans/active/bar-141-preflight-checklist-plan.md` (559 lines)
- `docs/plans/logs/bar-141-preflight-checklist/build-summary.md`
- `docs/plans/logs/bar-141-preflight-checklist/build-plan-execute-1-log.md`
- `docs/plans/logs/bar-141-preflight-checklist/build-challenge.md`
- `.agents/docs.md` (workflow doc index)

## Stale-doc Sweep

Walked changed-files vs `docs/*.md` references. Source surfaces:

| Path | Status |
| --- | --- |
| `.agents/scripts/bkit-preflight.ts` | NEW — covered in README `## Install lifecycle`, KN-4, KN-5, KN-8, DE-4. |
| `.agents/scripts/bkit-postinstall.ts` | NEW — covered in README `## Install lifecycle`, KN-4, KN-6, DE-4. |
| `.agents/scripts/bkit-install.ts` | MODIFIED — Phase 1/3 wiring; covered in README `## Install lifecycle`, DE-4, KN-4. |
| `.agents/scripts/bkit-modules.ts` | MODIFIED — `printSink → advisories` migration; constants deleted; covered in DE-4. |
| `.agents/scripts/bkit-tiers.ts` | MODIFIED — `WriteEntry.devDepsAdded` extension; internal — no doc surface. |
| `dist/*.js` | REGEN — gotcha captured in KN-7. |
| `README.md` | UPDATED in build phase — `## Install lifecycle` section + `PreflightFinding` shape + ID registry. |
| `docs/decisions.md` | UPDATED in build phase — DE-4 ADR appended. |
| `docs/knowledge.md` | UPDATED in build/debug phase — KN-4 (Phase 3 install-only), KN-5 (parseInt NaN), KN-6 (execFileSync), KN-7 (dist/ staleness), KN-8 (Tier-1 unsafe). |
| `docs/architecture.md` | NO-OP — file is intentionally minimal (just header); BAR-141 did not change service boundaries. |
| `docs/testing.md` | NO-OP — file is intentionally minimal (just header); test naming/tier strategy unchanged. |
| `docs/security.md` | NO-OP — KN-6 captures the security gotcha (token-presence-only, `execFileSync` defence) and is the canonical home. |
| `docs/observability.md` | NO-OP — `console.error("[bkit-install] {Message}")` pattern preserved per plan. |
| `.agents/docs.md` | NO-OP — no new docs added. |
| `.agents/workflows.md` | NO-OP — no workflow contract changed. |

## Updates Applied This Step

| File | Change |
| --- | --- |
| `docs/completed.md` | APPENDED entry "bkit install preflight + post-install AI checklist — BAR-141 (2026-05-06)" with full summary (3 phases, new files, migrations, dedup model, dry-run parity, challenge findings remediation, dist/ debug cycle, hooks-overwrite blocker, test counts, related IDs). |

Sole-writer policy: this agent only writes `docs/completed.md`. README, decisions.md, knowledge.md edits were applied by build-phase agents. No further updates needed there.

## Pending Items Surfaced

Already-recorded entries in `docs/pending.md` referencing `BAR-141`:

| Title | Action |
| --- | --- |
| `bkit doctor verb — standalone preflight CLI subcommand (2026-05-06)` | Already present; no change required. References `runPreflight()` from BAR-141. |

No new pending items surface from this ship cycle.

## Learnings Surfaced (for sole-writer agents)

These are already persisted by build/debug remediation agents — listed for parent-orchestrator audit:

- **DE-4** (`docs/decisions.md`): structured `PreflightFinding` replaces `printSink`. Already persisted by `@bkit-design-generate` at plan time.
- **KN-4** (`docs/knowledge.md`): Phase 3 runs ONLY in install (not check) — dry-run parity. Already persisted in build phase.
- **KN-5** (`docs/knowledge.md`): `parseInt("")` returns `NaN` — guard version file reads. Persisted via challenge-remediate.
- **KN-6** (`docs/knowledge.md`): Use `execFileSync` over `execSync` when argument comes from a variable. Persisted via challenge-remediate.
- **KN-7** (`docs/knowledge.md`): `dist/` staleness — `pnpm build` must run before push for `.agents/scripts/*.ts` changes. Persisted via debug-failure-remediate.
- **KN-8** (`docs/knowledge.md`): Tier-1 full-overwrite is unsafe for consumer-extensible config files. Persisted via debug-failure-remediate (PR #5 hooks-overwrite mitigation).

## Blockers

None.
