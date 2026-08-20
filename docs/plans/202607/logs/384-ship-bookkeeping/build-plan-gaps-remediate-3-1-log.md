Verdict: PASS
Strategy: STANDARD

<!-- verdict:end -->

# Plan Gaps Remediation — Sub-Plan 3 (Attempt 1)

**FID:** `384-ship-bookkeeping` · **ISSUE:** cbartens/bkit#384 · **Sub-plan:** 3 of 3 · **Attempt:** 1
**Strategy:** STANDARD

## Investigation

The verify subagent (build-plan-verify-3-1.md) reported FAIL with 1 blocking gap: Task 9 added the "Ship gate + bookkeeping" consumer CI contract to `docs/deployments.md` (root) but NOT to the template source `.bkit/templates/docs/deployments.md`. This caused `bkit check` to report 2 writes of drift (the deployments.md managed-block mismatch + a cascading `.bkit/version` canonical-hash write). The verify report also flagged observability.md and testing.md templates as stale (0 occurrences of `bkit-ship-gate`), and noted a stale claim in the E2E report.

### Root-cause analysis

**deployments.md (BLOCKING):** The ship-gate section was added INSIDE the `<!-- bkit:start -->` ... `<!-- bkit:end -->` managed block of the root (lines 190–214; managed block spans lines 1–461). The template's managed block (lines 1–436) did not contain this section. Because `bkit check`'s core templates pass renders the template with token substitution and compares the managed block to the root, this mismatch was flagged as drift. The `.bkit/version` write was a cascading consequence: `postDispatch` records canonical hashes from `ws.writes`, and the deployments.md write populated `newCanonicalEntries` → `needsWrite = true`.

**observability.md & testing.md (non-blocking):** Investigation revealed the ship-gate content in both docs was added OUTSIDE the managed block:

- `docs/observability.md`: managed block = lines 1–22 (both root and template match). Ship-gate content at lines 41/81 is in bkit's dogfood space. ALL prefix documentation has always been outside the managed block by design.
- `docs/testing.md`: managed block = lines 1–251 (both root and template match). Ship-gate content at line 337 is in bkit's dogfood space.

Since `bkit check` only compares the managed block (Tier-2 html-comment format), these files were never in drift. `bkit upgrade` (Tier-2) only replaces content between markers — the ship-gate content is safe from overwrite. The content references bkit-specific test files (`tests/ship-gate.bats`, `.bkit/src/bkit-ship-invariants.test.ts`) — bkit dogfood documentation, not consumer-shipped by design. No template sync was needed for `bkit check` to report 0 writes.

## Changes Made

### 1. `.bkit/templates/docs/deployments.md` — Ship gate section added to managed block (BLOCKING FIX)

Added the "Ship gate + bookkeeping" section (25 lines: consumer CI contract `pull_request ⇒ run_level=full`, `BKIT_SHIP_GATE_OVERRIDE` rollback audit, Path A/B description, residual-risk naming, bookkeeping `BOOK_ROOT` routing) to the template's managed block, between the "Promotion-lag warning" section and "Smoke trigger plumbing" — matching the exact insertion point in the root. No token substitution needed (the section contains no `main`/`{{DEFAULT_BRANCH}}` or `cbartens/bkit`/`{{REPO_SLUG}}` references). This resolved BOTH `bkit check` writes (deployments.md core drift + cascading `.bkit/version` pin write).

### 2. `ship-e2e-validation.md` line 170 — Stale claim updated (Gap 3)

Updated the "Rollout readiness" paragraph that claimed `bkit check` was verified green "in the Seam 2 prelude" to note it was re-verified after the gaps-remediate-3-1 cycle synced the template.

### 3. observability.md & testing.md templates — No change (analysed, not needed)

Documented that the ship-gate content lives outside the managed block in both docs. The templates' managed blocks already match the root's managed blocks. No template modification was required for `bkit check` to pass. The content is bkit dogfood documentation that is not consumer-shipped by design (the templates intentionally ship only the managed block).

## Test Results

<!-- prettier-ignore -->
| Gate | Result | Notes |
| --- | --- | --- |
| `pnpm bkit check` | ✅ 0 writes, exit 0 | GREEN — was 2 writes/exit 1 before fix |
| `pnpm typecheck` | ✅ GREEN | `tsc --noEmit` clean |
| `pnpm test` | ✅ 75/75 files, 2651 passed | 0 failures (pre-existing flake `bkit-upgrade.integration.test.ts` passed this run) |
| `pnpm format:check` | ✅ GREEN | Prettier clean |
| `pnpm lint:prose` | ✅ 0 errors, 1 warning | Pre-existing write-good warning in testing.md:318 |
| `pnpm lint:slop` | report-only | 11 findings, all pre-existing (not from this change) |
| `pnpm test:bats` | ✅ 140/140 passed | ship-gate.bats (16), ship-failure-path.bats (6), ship-worktree-ownership.bats (6), + others |
| `pnpm vitest run bkit-status-hole-detector` | ✅ 35/35 passed | Task 10 detector test |

### Pre-existing concerns (NOT from this change, NOT fixed)

- **`pnpm slop:delta`:** 4 added findings (net score +4.80) in `.bkit/src/bkit-modules.ts` (2 catch blocks) and `.cursor/hooks/guardrails.cjs` / template (1 each). These were introduced by sub-plans 1–2, NOT by this gaps-remediate change. My changes (deployments.md template + E2E report) are documentation-only and introduced 0 slop findings.
- **`bkit-upgrade.integration.test.ts` (#281 AC):** Pre-existing flaky test (5000ms timeout spawning real subprocesses). Passed this run. NOT in sub-plan 3's diff. Environmental.

## Remediation Log

DONE — Gap 1: deployments.md template sync — Added 'Ship gate + bookkeeping' section (consumer CI contract + rollback path) to .bkit/templates/docs/deployments.md managed block; pnpm bkit check now 0 writes/exit 0 (was 2 writes/exit 1)
DONE — Gap 1 (obs+testing analysis): observability.md and testing.md ship-gate content is OUTSIDE the managed block (obs: block ends line 22, content at line 41/81; testing: block ends line 251, content at line 337). Managed blocks match between root and template. bkit upgrade (Tier-2) only replaces content between markers — content is safe. No template sync needed for bkit check (already 0 writes). Content is bkit dogfood documentation (references bkit-specific test files) — not consumer-shipped by design.
DONE — Gap 3: E2E report stale claim — Updated ship-e2e-validation.md line 170 to note re-verification after gaps-remediate-3-1 cycle (bkit check now GREEN after template sync)
