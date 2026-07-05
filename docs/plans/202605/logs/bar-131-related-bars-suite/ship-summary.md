Verdict: CONCERNS

<!-- verdict:end -->

# Ship Summary

## Overview

**Feature:** bkit consumer-friction suite v0.6.x → v1.0 (BAR-131/139/142 consolidated build; 50-commit feature branch squash-merged as commit `5fbb5c8` to `dev` 2026-05-08T05:36:03Z). **Scope:** Four phased releases across v0.6.x (Phase 0/1 basics), v0.7.x (Phase 2 exit-1 + .bkitignore schema), v0.8.x (Phase 3 Tier-2 JSON migration), v0.9.x→v1.0 (Phase 4 transactional install + upgrade verb + helper action). **Code & Artifacts:** ~2.6k lines TS across 13 files in `.agents/scripts/`; full test suite 712 tests pass; typecheck + format:check green. **Plan execution:** All 46 phase tasks (11 sub-plan-1, 13 sub-plan-2, 13 sub-plan-3, 9 sub-plan-4) completed with PASS verdicts through build phase (plan verify, challenge remediation, test fixes, holistic verification all green). **Master success criteria achieved:** Consumer config keys survive upgrades byte-identically; `bkit install` exits 1 with recovery banner on Phase 3 blockers; `bkit uninstall` round-trip leaves files unchanged.

**Rebase friction (pre-merge):** 50-commit feature branch rebased onto `origin/dev` produced 5 conflict commits across `docs/knowledge.md`, `docs/deployments.md`, `.agents/rules.md`, `.husky/pre-push`, `.agents/templates/.husky/pre-push` (parallel BAR-146 entries + widened KN-8 line + renumbered feature's KN-9/10 → KN-12/13 to avoid collision). Conflicts resolved via: (1) widening KN-8 Related line to reference BAR-131; (2) combining deployments.md sub-sections from both teams; (3) taking rules.md incoming superset; (4) preserving bkit-repo-only `pnpm bkit check` gate outside markers in `.husky/pre-push` while NOT adding `bkit check` to template (per auto-memory: bkit dev pain ≠ consumer pain); (5) adding incoming's `pnpm check:dist` gate outside markers to bkit repo. Rebase completed cleanly.

**Post-merge:** Fresh CI run #25538826802 on `dev` HEAD green. Parent repo had 3 stale local-only commits (start-workflow churn + `.claude/scheduled_tasks.lock` accidentally tracked); user-authorized `git reset --hard origin/dev` to drop them. Worktree cleaned.

## CI Status

**Build phase:** Green attempt 1 (plan-execute, plan-verify × 4 sub-plans, holistic verify, challenge, challenge-remediate, challenge-tests, run-tests × 2 attempts). Tests: sub-plan-1 PASS 0/failures; sub-plan-2 CONCERNS → remediate → re-verify PASS 0/failures (`.bkitignore` wiring gap fixed); sub-plan-3 PASS 0/failures; sub-plan-4 PASS 0/failures. Challenge flagged 3 CONCERNS (C1 raw `.bkit-version` read yielding JSON string instead of semver, C2 misleading doc comment, C3 `canonicalHashes` never populated on install) — all remediated pre-merge. First run of `run-tests` failed (2 files, 4 assertions) on P4.T8 implementation regression (inline `env:` block for `GH_BKIT_TOKEN_INSTALL` deleted when composite action `setup-auth@v1` was added, violating RETAIN-WITH-REASON kill-date v1.1.0); diagnosed and fixed in-flight; re-run PASS 112 tests.

**Merge CI:** Post-merge run #25538826802 on squash-merged `5fbb5c8` (title "feat(BAR-131/139/142): bkit consumer-friction suite v0.6.x→v1.0") — green. No retries needed. Rollup status: clean.

**Pre-push gates:** All bkit-repo pre-push checks passed (typecheck, test, bkit check, check:dist). No local-gate failures detected.

## Action Items

1. **Post-v1.0 staging integration wiring (deferred, low severity):** Holistic verifier flagged sub-plan-4 staging primitives exported but not wired into live `bkit-modules.ts` install paths. Master plan success criterion (mid-failure leaves consumer files untouched) is enforced at API-level (unit tests + direct-call integration test Scenario 9) and via `writeTier2Json` deep-merge semantics, but NOT through a real subprocess SIGTERM integration test. Architecturally sound (exported primitives, unit-tested); gap is bounded to call-site wiring in `bkit-modules.ts` (2 `writeTier2Json` invocations at lines 432, 518) + one new subprocess integration test. Addressable in post-v1.0 maintenance cycle (BAR-145 or later). **Related:** build-plan-verify-holistic.md §1, docs/knowledge.md KN-12.

2. **Helper-action retention enforcement (ongoing):** Four test assertions in `templates.test.ts` + `bkit-install.test.ts` now enforce RETAIN-WITH-REASON pattern for inline `GH_BKIT_TOKEN_INSTALL: ${{ secrets.GH_BKIT_TOKEN_INSTALL }}` env block in seeded `.agents/templates/.github/workflows/ci.yml` through kill-date v1.1.0. Block any future template edit that removes this env block without advancing the kill-date (contract: composite action `setup-auth@v1` is additive, not a replacement). **Related:** docs/knowledge.md KN-11, bar-131-related-bars-suite-plan-4.md §P4.T8, build-failure-diagnose-1.md.

3. **Pre-push dist/ staleness regression guard (monitoring):** BAR-131 PR #7 introduced `pnpm check:dist` gate to bkit repo's `.husky/pre-push` hook (outside bkit:start..bkit:end block, source-repo only). Guard now prevents `.agents/scripts/*.ts` edits from shipping with stale `dist/`. Monitor for any future developer bypasses (KN-7 recurrence). Build process documents the requirement in `docs/deployments.md` § `.dist/` commit policy.

4. **Post-merge docs entry (recommended):** Add a completed-plan entry to `docs/completed.md` for BAR-131/139/142 consolidated build under today's date. Template available at `docs/completed.md` § Format. Artifact paths: `docs/plans/completed/202605/bar-131-related-bars-suite-plan.md` (parent index + 4 sub-plans), logs at `docs/plans/logs/bar-131-related-bars-suite/`. Category: agentic. This is a **recommended** action, not blocking — the plan is already merged and shippable.
