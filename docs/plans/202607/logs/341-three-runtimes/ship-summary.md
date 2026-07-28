Verdict: PASS

<!-- verdict:end -->

# Ship Summary

## Overview

#341 Three-Runtime Workflow Execution successfully shipped. This feature enables bkit's five phase workflows (`/bkit-{design,plan,build,debug,ship}`) + `bkit-auto` to run correctly across three materially different runtime environments: local laptop (mode 1), GitHub-Actions runner (mode 2), and claude.ai cloud sessions (mode 3). The implementation follows a minimal, additive approach based on a runtime capability table rather than rewriting every call site.

**Key Changes:**

- **Runtime detection shim**: New `.bkit/scripts/bkit-runtime.sh` (688 lines, 10 functions) that detects the runtime environment and emits a 5-row capability table (`RUNTIME`, `CAN_WORKTREE`, `CAN_PUSH_DEV`, `CAN_SLEEP`, `GH_OK`)
- **gh→MCP fallback lane**: Controlled fallback from `gh` CLI to GitHub MCP tools when `gh` is unavailable/unauthed, with bounded retry and recording in `status.jsonl`
- **Adopt-or-mint branch model**: Workflows now adopt existing branches or mint new ones, removing the hard `feat/` prefix requirement and supporting arbitrary branch names
- **CI-suppression close guard**: Multi-layered protection against `[skip ci]` tokens leaking into merge bodies, with post-hoc body scanning and CI-dispatch assertion
- **Capability-gated workflow paths**: All divergence points branch on capability flags, with mode 1 and 2 taking identical code paths

**Scale:**

- 9,554 additions, 1,866 deletions across 106 files
- 26 commits squash-merged as `d64ef5be`
- 6 sub-plans (T1–T16) implemented across the full bkit workflow suite
- New test coverage: 2 `tests/*.bats` files, 5 `.bkit/src/*.test.ts` files
- 107/107 bats tests passing, 2,523 vitest tests passing

## CI Status

**Green — all checks passed on first attempt.**

- **Build phase CI**: All 5 checks pass (bkit-tests-static, -unit, -integration, -scope, -check)
- **Build-challenge findings**: 4 findings surfaced (F1–F4), all resolved before PR creation
  - F1 [HIGH]: D24 CI-suppression token scan widened to cover all 5 tokens case-insensitively
  - F2 [HIGH]: `bkit_wait_ci` gained macOS `timeout`/`gtimeout` resolution with fallback
  - F3 [LOW]: EXIT-trap command injection neutralized via single-quoting
  - F4 [architectural]: FID path traversal validation — escalated to human, fixed with slug allowlist, independently re-verified PASS
- **Regression tests**: 9 new bats tests for F1/F2/F3 (F4 covered by existing `bkit-auto-fid-guard.test.ts`)
- **Final test suite**: `pnpm typecheck && pnpm test && pnpm format:check && pnpm lint:slop && pnpm lint:prose && pnpm test:coverage:unit` — 0 failures
- **Merge verification**: PR #382 merged cleanly to dev at 2026-07-28T06:25:26Z with mergeState CLEAN

**No retries or post-merge issues observable from CI logs/status.jsonl.**

## Action Items

**Post-merge monitoring required:**

1. **Live mode-1 verification** (deferred:50 OPEN): Run one real `/bkit-design` or `/bkit-plan` cycle on the laptop (mode 1) to confirm the close path lands `docs({FID}): {phase} DONE bkit [skip ci]` on dev with no CI run dispatched, and that ship completes with a dirty dev tree (the AHEAD_NON_SKIP path).

2. **Live mode-3 verification** (deferred:50 OPEN): Run one phase from a claude.ai cloud session (mode 3) to confirm the PR-path close, the adopt-mode worktree skip, the `runtime-resolved`/`close-transport`/`transport-fallback` status rows, and `dev` CI-dispatch (SC3).

3. **Cursor mode-4 confirmation** (deferred:29 CLOSED): Verify the exact detection bridge (`is_background_agent` → env marker) and sleep-block behavior against a real Cursor Cloud Agent. Code/bridge delivered; only live confirmation remains.

4. **#384 sequencing** (deferred:51 OPEN): Do NOT fold #384 (ship redesign) back into #341 post-hoc. Land #341 first, then design/plan #384 with the `RUNTIME_DEVPUSHES`-conditioned bookkeeping rule already available.

**No immediate action required — feature shipped successfully with documented follow-ups.**

## Recommended Next Step

_No further bkit command — feature shipped._

**Brief:** All 16 tasks (T1–T16) delivered, all tests passing, all build-challenge findings resolved, PR merged cleanly to dev. The runtime-consumption guarantee rests on live mode-1 and mode-3 verification steps documented in deferred:50 — these are post-merge confidence builders, not blockers. The next cycle can proceed; #384 should be sequenced after this ships.

## Deferred & Out-of-Scope

**Full list of every deferred item from deferred-sweep, both `Blocking Deferrals` and `Exempt (out-of-scope)`.**

### Blocking Deferrals

**None** — every task T1–T16 is `Delivered` or legitimately `Exempt` (live-only).

### Exempt (out-of-scope)

1. **Shell-native MCP CLI shim (real exit codes)** — Plan § Out of Scope; design REJECTED alternatives; deferred:27 OPEN; Bespoke CLI duplicating MCP auth/session semantics; minimal/additive principle rules it out for this cycle.
2. **Uniform PR-close phase-close in ALL runtimes (delete local squash-merge)** — Plan § Out of Scope; design REJECTED; deferred:28 OPEN; Regresses mode-1 (offline/instant); collides with `[skip ci]` PR-title assert; depends on invisible branch-protection settings.
3. **Narrow gh read-path corroboration outside MCP (private-repo search_issues)** — Plan § Out of Scope; failures:1; deferred:30 OPEN; bkit doctrine forbids gh for tracker ops; D12 mitigates within MCP.
4. **Root-cause MCP `search_issues` silent-zero on private repos** — Plan § Out of Scope; failures:1 OPEN (informational); Root cause unknown (bkit-side scope vs upstream MCP bug); informationally logged, never gates ship.
5. **Periodic transport-fallback frequency summariser** — Plan § Out of Scope; design OQ5; deferred:37 OPEN; New analysis feature; D25 gives the per-run reader, aggregation layer is additive extra.
6. **Mode-tuned subagent-fan-out concurrency pacing** — Plan § Out of Scope; issue §6g (N2); deferred:38 OPEN; "Revisit only if hit" — claude.ai shared-account rate budget not yet observed.
7. **`/Users/jesse` vendored skill "fix" (D20 correction)** — Plan § Out of Scope; no row — D20 doctrine: do NOT touch vendored skill content; Out-of-scope by doctrine.
8. **Manual Verification Step 1 — mode-1 laptop e2e** — SP6 § Manual Verification; design D3 honest limit; deferred:50 OPEN; Multi-hour real-FID laptop run; unreachable from a non-interactive ship subagent.
9. **Manual Verification Step 2 — mode-3 claude.ai live session** — SP6 § Manual Verification; design D3; deferred:50 OPEN; Real claude.ai browser session required; subagent cannot open it.
10. **Manual Verification Step 3 — mode-2 GH-Actions runner trigger** — SP6 § Manual Verification (note: SP6 closeout observes mode-2 is byte-identical to mode-1 at every flag, asserted in `tests/bkit-runtime.bats`; deferrals:49 records this partial resolution); bundled with deferrals:46/49/50; CI event/label trigger + observe; not stageable in this turn.
11. **Manual Verification Step 4 — `dev` branch-protection/auto-delete-head-branches admin confirm** — SP6 § Manual Verification (note: SP6 closeout records auto-delete-head-branches ENABLED on cbartens/bkit via REST; branch-protection API 403 on this plan → no rule can block; both recorded in `docs/deployments.md` — deferrals:49 CLOSED-partial); bundled with deferrals:46/49; Repo-admin dashboard access; subagent does not hold it.
12. **Manual Verification Step 5 — debug-egress loudness (T15's debug-egress half)** — SP5 § Manual Verification; design D3 honest limit; tracked alongside deferrals:46; SP5 Step 5 `[ ]`; Reachable only in a `CAN_WORKTREE=false` runtime; per the honest limit, no automated assertion (the worktree-self-skip half IS bats-tested).
13. **#384 ship redesign (Path A/B + capstone gate + bookkeeping on dev tree)** — cross-issue, surfaced at #341 build closeout; deferred:51 OPEN; Layers on #341; folding it in would re-open the local-path byte-identity question this PR closed.
14. **Cursor mode-4 exact detection-var + sleep-block live confirmation** — SC1 gating; design D3; deferred:29 CLOSED — promoted into scope; live confirmation held for WS-16; Code/bridge delivered; only live confirmation remains (bundled with Manual Step 2).

**Note on F4 architectural finding:** `build-challenge.md` finding F4 (marker-primary FID reorder → untrusted PR-body path traversal) was `class=architectural` and initially left `BLOCKED` per protocol. It was subsequently manually remediated with a slug allowlist at all 4 FID exit points in `bkit-auto.md`, doctrine recorded in `docs/security.md` § CI Auto-Route Trust, and 39-case regression test in `.bkit/src/bkit-auto-fid-guard.test.ts`. Independent re-challenge `build-challenge-verify-f4.md` returned `PASS / 0 failures`. **Not a blocker at ship time** — genuinely resolved + independently re-verified.
