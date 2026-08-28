Verdict: PASS

<!-- verdict:end -->

# Ship Summary

## Overview

PR #411 (feat(380-roadmap-analysis-refresh): roadmap ledger + fold + analysis) merged successfully via squash merge into `origin/dev` at 2026-08-27T22:02:54Z. The feature automates `docs/roadmap.md` with a two-tier generated artifact: a deterministic mechanical status tier refreshed at every workflow close (design/plan/build/debug/ship), and an opus analysis tier refreshed at ship/on-demand via `@bkit-roadmap-refresh` and `/bkit-roadmap` utility.

**Scope:** 112 files changed; 6957 additions, 592 deletions across 9 commits. Large Diff Guard active (10049-line diff over 10000-line threshold).

**Key deliverables landed:** (1) `kind:"feature"` codec + six-state ladder in telemetry; (2) `docs/roadmap.jsonl` ledger (completed.md migration + bootstrap seed); (3) `bkit-roadmap-fold.sh` shell helper (foundation, on-disk-first sensing, tracker-additive enrichment); (4) per-workflow close hooks (all five workflows wired with staging per shape); (5) `@bkit-roadmap-refresh` subagent (analysis tier, ship Step 10 parallel); (6) cadence-driven audit/ledger injection; (7) reverse tracker-sync (settled-drift-guarded, MCP-only); (8) drift-check reconcile step; (9) `/bkit-roadmap` on-demand utility; (10) cross-provider mirror regen (six workflows/agent/utility mirrored to claude/cursor/opencode).

**Acceptance Scenario:** User closes a workflow phase; `docs/roadmap.md` auto-updates to show issue phase (from on-disk artifacts + optional tracker enrichment) with no manual edit. Ship/on-demand refresh analysis block with best-next-step, groupings, prompt suggestions, coverage-stamped. **All 5 Success Criteria verified at HEAD.**

## CI Status

Green — merge succeeded on first attempt with no regressions.

**Test suite:** 3728 passed / 1 failed (pre-existing) / 2 skipped. The single failure (`detectBkitNotOnPath`) exists unchanged on `origin/dev` and is untouched by this branch — environmental issue in remote-agent context, not this cycle's regression.

**Bats:** 234 ok / 1 not ok. The single failure (`roadmap-cadence-fire-readonly-dir-bats-case`) is uid-0 environment-specific; shipped fail-open behaviour is correct. Plan's own Gate 4 recorded suite green in CI runner (non-root).

**Lint/format:** Typecheck clean, format check clean (uncommitted artifacts only), prose warnings pre-existing.

**Verification gates:**

- `pnpm vitest run`: 3728/3731 (pre-existing fail, 2 skips)
- `npx bats tests/*.bats`: 234/235 (uid-0 environmental)
- `pnpm typecheck`: ✓
- `pnpm format:check`: ✓
- `pnpm slop:delta`: net 0 findings
- `pnpm bkit check`: ✓ (0 writes)
- `pnpm bkit:check:dist`: ✓ (dist/ byte-identical)
- Board re-fold parity: ✓ (byte-identical)
- Repository↔template script parity: ✓ (all four SHA-256 identical)

**Deferred sweep verdict:** PASS — no blocking deferrals. All 5 open integration gaps claimed in PR #411 body (stale as of rebase + 4 later commits) re-verified CLOSED at HEAD. All 23 intended deliverables confirmed DELIVERED. Partial diff coverage applied (Large Diff Guard); unverified line-by-line hunks are covered by test suite + end-state source inspection.

## Action Items

**Post-merge queue (deferred work, none blocking merge):**

1. **`docs/architecture.md`** — bounded documentation update. Add `docs/roadmap.jsonl` to the ledger inventory, list the three `bkit-roadmap-*.sh` scripts in the scripts section, add `/bkit-roadmap` workflow, and update the telemetry-migrate description to name the fifth migration pair + bootstrap seed. Scope: ~4 lines across 2 sections. Not in any Done-when or Success Criteria; no runtime path reads it.

2. **`docs/setup.md`** — consumer migration guide. Add a short section documenting the one-time `bkit telemetry migrate` run (parity-gated, deletes `docs/completed.md`, runs bootstrap seed), that `bkit upgrade` does not auto-run it, and that the board is EMPTY rather than wrong until it runs. The advisory text from `.bkit/src/bkit-preflight.ts:166` can be reused verbatim. Scope: ~1 section. Deferred from sub-plan 3 Documentation Updates table (item marked [x] but not applied).

3. **Test environment fragility** — two pre-existing test issues flagged as lazy deferrals for future resolution:
   - `preflight-bkit-not-on-path-test-ignores-cloud-agent-env-gate`: Test in `.bkit/src/bkit-preflight.test.ts:1780` does not clear remote-agent env flags alongside `CI` deletion; exists unchanged on `origin/dev`. Remediation: one-line scope fix.
   - `roadmap-cadence-fire-readonly-dir-bats-case-cannot-fail-under-root`: Case `tests/telemetry-failopen.bats:159-171` uses `chmod 555` for uid-0 bypass detection; uid 0 cannot use it. Remediation: skip with reason when `id -u` is 0, or make target genuinely unwritable regardless of uid.

## Recommended Next Step

No further bkit command — feature shipped.

Brief: Post-merge monitoring and deferred documentation updates. The feature is production-ready; all gating criteria met. Verify in `dev` branch CI that cross-provider mirrors (claude/cursor/opencode) regenerated correctly for the six wired workflows, the new agent, and the new utility. Then pick up the three post-merge items (two doc sections, two test fixes) on the next available cycle.

## Deferred & Out-of-Scope

**Blocking Deferrals:** None.

**Exempt (out-of-scope, holds):**

1. **#260 autonomous actuator / sensing contract / standalone sensing schema** — sub-plan 1 § Out of Scope: "Speculative against #260's unbuilt tick (YAGNI); the leaf/fold boundary preserves the evolution path". Verified: no actuator/sensing-contract stub added. Belongs to `#260`.

2. **#80 lens engine (concrete audit lenses)** — sub-plans 1/2 § Out of Scope: "Depends on #80 landing; cadence injects a generic 'run an audit' reference until then". Verified: cadence injection writes literal generic line with no lens hook stubbed. Blocker still live; belongs to `#80`.

3. **`bkit harvest` / `bkit analysis` ingestion of `docs/roadmap.jsonl`** — all sub-plans § Out of Scope: "DECIDED out (owner 2026-07-25) — harvest neither copies nor counts it; codec-acceptance is enough". Owner decision on record.

4. **`references: ["{FID}"]` on close-step `outcome` rows** — sub-plans 1/3 § Out of Scope: "REJECTED (design Addendum 3 § R) — a FID is consumer task detail and must never enter harvested `stats.jsonl`". Verified: both cadence counter rows are FID-free. ADR on record.

5. **Renaming/splitting `.bkit/stats.jsonl` into `activity.jsonl`** — sub-plan 1 § Out of Scope: "REJECTED (design Addendum 2 § L) — breaks harvest export contract and puts durable history in compaction path".

6. **`github-mcp-search-issues-silently-returns-zero-private-repo` (#341)** — sub-plan 2 § Out of Scope CAUTION: "KEEP DEFERRED: honored by mandating `list_issues` (never `search_issues`), treating 0/empty as inconclusive, with on-disk-first floor as mitigation". Verified across every enrichment hook — all call `mcp__github__list_issues`, write `[]` on error.

7. **`58-no-shellcheck-gate-over-bkit-scripts`** — pre-existing deferral: `bkit-roadmap-fold.sh` "lands on the un-shellchecked shipped shell surface tracked by OPEN deferral (#58)". No new lint work in this cycle. Belongs to `#58`.

8. **`380-roadmap-md-generated-but-not-prettier-ignored`** — deferral folded to CLOSED (owner sign-off obtained): `.prettierignore:38` + template now carry `docs/roadmap.md`; `format:check` clean. ✓ Complete.

**Lazy (unjustified deferrals, picked up next cycle):**

1. **`380-architecture-md-not-updated-for-roadmap-ledger-and-scripts`** — docs/deferrals.jsonl, reason: "unjustified". Adds canonical ledger, generated board, three shipped scripts, workflow, prompt to surface but `docs/architecture.md` has 0 mentions. Bounded remediation (see Action Items #1).

2. **`380-consumer-migrate-doc-row-not-applied-to-setup-md`** — docs/deferrals.jsonl, reason: "unjustified". Sub-plan 3 § Documentation Updates requires a setup.md section on `completed.md` → `docs/roadmap.jsonl` migration; section not applied. Bounded remediation (see Action Items #2). Install advisory already provides working pointer.

3. **`380-first-bootstrap-preserve-preexisting-consumer-roadmap-content`** — docs/deferrals.jsonl, reason: "unjustified", status: CLOSED. Work already done (verified: bootstrap preserves pre-existing bytes into `## Backlog / Ideas`; bats cases cover). Resurfaced for rate tracking only — no action.

4. **`roadmap-cadence-fire-readonly-dir-bats-case-cannot-fail-under-root`** — docs/failures.jsonl, category: "testing", status: OPEN. Environmental: uid 0 bypasses `chmod 555` precondition. Shipped fail-open behaviour correct. Remediation scope: skip case when `id -u` is 0 (see Action Items #3).

5. **`preflight-bkit-not-on-path-test-ignores-cloud-agent-env-gate`** — docs/failures.jsonl, category: "testing", status: OPEN. Pre-existing on `origin/dev`; neither function nor case touched by this branch. Test does not clear remote-agent env vars alongside `CI`. Remediation scope: one-line fix (see Action Items #3).
