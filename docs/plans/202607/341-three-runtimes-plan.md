Verdict: PASS

<!-- verdict:end -->

# Three-Runtime Workflow Execution (#341) Implementation Plan — Parent Index

> [!IMPORTANT]
> **This is a SPLIT parent index.** The executable work (16 tasks T1–T16, its 🔒 Gates, and Manual Verification steps) has been partitioned losslessly into six self-contained sub-plans (see `Sub-Plan Index`). This file retains only shared context, goals, and the split map. Build from the sub-plans, in DAG order.

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state. Read a sub-plan natively ONCE at its session start; source of truth = its literal `[x]`/`[ ]` checkboxes. `[ ]` = NOT DONE regardless of conversation context.

> [!IMPORTANT]
> **Docs & stack project-resolved.** This is the **bkit repo itself** — no app stack (no DB, no deployed URL, no browser). Test tiers reduce to **Static · Unit (vitest) · Integration (vitest, real subprocess/git) · Shell (bats)**; E2E/@live/migration/smoke are N/A (`docs/testing.md` § Stack / Tiers). "@live" here means a **real claude.ai (mode-3) session** — the only boundary that exercises the mode-3 code path, and it has no CI harness (WS-16, manual; Sub-Plan 6).

## Context & Goals

bkit's five phase workflows (`/bkit-{design,plan,build,debug,ship}`) + `bkit-auto` were authored for a laptop (mode 1) but now run in **four materially different runtimes**: laptop (mode 1), GitHub-Actions runner (mode 2), a **claude.ai cloud session** (mode 3, `CLAUDE_CODE_REMOTE=true`), and a **Cursor cloud agent** (mode 4). Several steps assume laptop-only capabilities. Running phases on the claude.ai runner surfaced a cluster of deviations culminating in a **silent CI-suppression bug (D1)**: `[skip ci]` leaked into a squash-merge _body_ on `dev` because an unauthed `gh` was replaced by an ad-hoc, unguarded MCP `merge_pull_request` that defaulted the body.

This plan implements the **settled design** (`docs/plans/202607/341-three-runtimes-design.md`, verdict CONCERNS) whose guiding principle is **minimal, additive changes gated on one capability table — not a rewrite of every call site**. The mechanism: a sourced runtime shim (`bkit-runtime.sh`) emits a 5-row capability table (`RUNTIME` → `CAN_WORKTREE`/`CAN_PUSH_DEV`/`CAN_SLEEP`/`GH_OK`; row 4 = Cursor cloud agent, mode-2-equivalent, exact detection var held for live confirmation); workflow headers branch on `CAN_*`; invariants land in `.agents/rules.md`; the close path gains transport-agnostic guards (D23/D24/D25). Three pre-build spikes (A/B/C) have **run and closed** (`spike-findings.md`, `design-addendum-spikes.md`) — their findings are folded, and they are NOT re-planned as open spikes; the only residuals are live-mode-3 observations owned by the terminal verification task (Sub-Plan 6).

> Success criteria live ONCE below; each runbook task (in the sub-plans) carries its own `Done when`.

**Related Issues:**

- `#341` — Make workflows run in all runtimes local GH Actions claude.ai (open) — this plan
- `#134` — design→ship artifact-trail model (closed, superseded)
- `#209` — state model / design-plan feat-locate (closed, shipped)
- `#234` — NDJSON `status.jsonl` (closed, shipped) — the per-step status ledger the three new row types ride
- `#342` — Prompt-injection hardening (open) — owns §5a/§6f mitigation; adjacent, do NOT duplicate
- `#99` — bkit workflow friction optimisation (open) — general friction tracker

---

## Success Criteria _(inherited from design — the shared testable contract; each sub-plan repeats the subset it owns)_

1. All five phases + `bkit-auto` complete end-to-end in each of the four runtimes (mode 4 = Cursor cloud agent, gated on live confirmation of its detection var); the mode-1 laptop path is verified non-regressed by a real end-to-end run (not a rule-text-presence test). This run is also the only guarantee that prose rules _honour_ the capability flags — no static engine can assert that.
2. No run ever mutates the session's checked-out branch in a runtime that cannot restore it — zero `git checkout dev` when dev-push capability is absent (D6). Held by a double-guard plus a reversible checkout (D23).
3. Every phase-close lands on `dev` with a commit/merge body free of CI-suppression tokens — asserted post-hoc against the landed commit on whichever transport ran (D24) — and the resulting CI-dispatch outcome on `dev` is asserted rather than assumed (D1 closed on both transports).
4. Any gh→MCP transition is bounded (max 1 per run), recorded in `status.jsonl`, confirmed by an independent re-read, and cross-checked mechanically (D25).
5. An MCP read returning empty/zero is never recorded as authoritative absence — it is corroborated or reported as unavailable, with the corroboration attempt logged as its own distinguishable state (D12).
6. A shim that fails to source is loud and distinguishable from a correctly-detected least-capable runtime (Flow 1).
7. No wait can hang. Every bounded poll's cap is enforced by a mechanism that survives a blocked `sleep` (D22).

> [!CAUTION]
> **Human review is a shared Gate-1 prerequisite for every sub-plan.** The `👤` Acceptance Scenario, Breaking Changes, and Open Questions sections (below) MUST be confirmed `[x]` before ANY sub-plan builds. Sub-Plan 4 additionally hard-depends on OQ-A (transport D5(a) vs D5 — picks whether T12 exists) and OQ-D (docs-close CI cost); Sub-Plan 5 on OQ-B (Playwright seam); Sub-Plans 3 & 6 on OQ-C (dev branch-protection config).

## 👤 Breaking Changes & Naming Review _(shared doctrine — HUMAN REVIEW REQUIRED)_

**None break existing consumers on modes 1–2; every mode-3-specific path is additive.**

> [!IMPORTANT]
> **Flag naming is non-negotiable (D1): `RUNTIME`, never `MODE`.** `bkit-auto.md:70-80` already binds `MODE=CI|BRIEF`. The shim MUST be `bkit-runtime.sh`, never `bkit-mode.sh` (retired in #245).

- **New capability flags:** `RUNTIME` + `CAN_WORKTREE`/`CAN_PUSH_DEV`/`CAN_SLEEP`/`GH_OK` (additive).
- **New shipped file:** `.bkit/scripts/bkit-runtime.sh` (+ template), rides `bkit install`; `.bkit/version` tracks it.
- **New `status.jsonl` row types (additive, #234 artifact):** `runtime-resolved`, `transport-fallback`, `close-transport`.
- **FID resolution reorder (D9):** marker-primary → branch-derive fallback; the `feat/`-prefix hard-reject at `bkit-auto.md:86-87` is **deleted**.
- **Prose/doctrine (D17):** `rules.md:71` branch-naming reframed; adopt-mode headers drop `Worktree created/resumed`/`Worktree removed` gate items and rewrite `pwd`-outside-worktree → `pwd != WORKTREE_PATH`.
- **Behaviour on `dev` (all modes):** `.mcp.json` gains `actions` (C1); `cloud-bootstrap.sh` gh-auth hardening (C2); the blind CI-wait `sleep` in `bkit-ship.md` removed (D11 reversal); §6d drops `[skip ci]` from close + intermediate status subjects under D5(a) (knowing CI-cost reversal, OQ-D).

## 👤 Open Questions & Assumptions _(shared — HUMAN REVIEW REQUIRED; resolve before build)_

- **OQ-A — Shape-A mode-3 transport: PR-close (D5(a), recommended) vs `push_files` (D5)?** Spike B: `push_files` cannot express `merge --squash -X ours`, has non-repairable payload bloat, inverts conflict semantics. D5(a) is uniform with ship, credential-decoupled — at the cost of pulling §6d into scope. Sub-Plan 4 is written for D5(a); selecting D5 DROPS T12 and swaps T13's tail. → resolve before Sub-Plan 4.
- **OQ-B — Playwright artifact seam.** `download_workflow_run_artifact` covers the seam (C1) but its output shape must be verified live (Sub-Plan 6); `get_job_logs` is the standing default. → confirm job-logs-only fallback acceptable.
- **OQ-C — `dev` branch-protection config.** Confirm branch protection permits the autonomous close + enable "Automatically delete head branches". Committed pre-close assertion + `docs/deployments.md` dependency (Sub-Plan 3); verified Manual Step 4 (Sub-Plan 6). → human/admin action.
- **OQ-D — Docs-only closes now fire full CI (knowing cost reversal; only under OQ-A=D5(a)).** Dropping `[skip ci]` reclassifies design/plan docs-only closes from `run_level=none` to full CI. → confirm cost accepted OR require the transport to carry the skip signal without surfacing the token. Reconciled in T12 (Sub-Plan 4).

**Key assumptions (→ what breaks):** Spikes A/B closed, only live residuals remain (T14/T16 re-open if contradicted, all named-and-mitigated); five phases' Step-2 branch logic uniform enough for one adopt-or-mint rule (else T8 grows variants); `CAN_SLEEP=false` yield can carry an attempt counter via the counter-bus; `RUNTIME` is a clean token; mode-3's proxy restricts `git push` to the current branch.

## Alternative Approaches & Recommendations

- **CHOSEN — Capability table from one detection + a sourced shim (D2/D3).** Buys testable detection (bats); consumption stays prose (honest limit, discharged by SC1's real run).
- **CHOSEN — Shape-A mode-3 transport = D5(a) PR-close.** Uniform with ship, credential-decoupled, no token-bloat, no conflict-inversion; §6d becomes a prerequisite.
- **REJECTED —** `push_files` as shape-A primary (D5); `git push --dry-run` probe for `CAN_PUSH_DEV` (D23, fails dangerous); uniform PR-close in all runtimes; render-time mode gating (D14, impossible); one `bkit_wait_ci` for both branches (D22); shell-native MCP CLI shim (deferred).

## Out of Scope

Shell-native MCP CLI shim; uniform PR-close all runtimes; narrow gh read-path corroboration outside MCP; root-cause of MCP `search_issues` zero-on-private-repo; periodic transport-fallback frequency summariser; mode-tuned subagent-fan-out pacing; the `/Users/jesse` vendored skill "fix" (D20 correction). Each mirrored in `docs/deferrals.jsonl` (OQ3 in `docs/failures.jsonl`). **Runtime 4 (Cursor Cloud Agent) was PROMOTED out of this list into scope (2026-07-23)** — first-class row in the capability table; detection bridges the `is_background_agent` hook signal to an env marker (bkit seam, #75), held for live confirmation (verify-first).

## Security & Privacy

- **NO new secret/env var (C2):** uses existing `GH_TOKEN`/`GH_BKIT_TOKEN`; gh-hardening prefers the sanctioned `GH_TOKEN` env; loud dual-lane preflight makes "no credential" a hard-fail.
- **Untrusted input (§6f):** tracker/PR/comment bodies untrusted; mitigation = D13's bounded fallback + narrowest token; injection hardening is `#342`'s scope — do NOT duplicate.
- Not applicable: routes/DB/RLS/Zod/PII/redirect/webhook — bkit has no app runtime.

## Architecture & Component Changes (register split, D15)

Grouped by the design's register split: **Mechanism** (`.bkit/scripts/bkit-runtime.sh` + template — shim, `bkit_wait_ci`, close-guard helpers), **Invariants** (`.agents/rules.md` + template mirror), **Procedure** (workflow headers `.bkit/workflows/bkit-{auto,design,plan,build,debug,ship,worktree-prune,worktree-sync}.md`), **Config/hook** (`.mcp.json` + template; `.claude/hooks/cloud-bootstrap.sh` + template), **Tests/docs** (2 `tests/*.bats` + 5 `.bkit/src/*.test.ts` + docs). Host-render mirrors (`.claude`/`.cursor`/`.opencode`) are force-rendered and NOT drift-gated (D19); true edit cost is the `.bkit/` sources (+ two `.bkit/templates/` mirror exceptions), batch-regenerated at the end (Sub-Plan 6). Per-sub-plan `[NEW]`/`[MODIFY]`/`[DELETE]` detail lives in each sub-plan's `Architecture & Component Changes`.

### Supersession Inventory (whole plan)

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Sub-Plan |
| --- | --- | --- | --- |
| Inline `# --- CI-Dispatch Gate shared kernel ---` blocks (`bkit-build.md`, `bkit-debug.md`) | `bkit_wait_ci` in `.bkit/scripts/bkit-runtime.sh` (alignment test rewritten, not dropped) | DELETE | 2 (T7) |
| The blind CI-wait `sleep` in `bkit-ship.md` (`:556`/`sleep 30` anchor STALE) | `bkit_wait_ci` bounded `RUN_ID` poll (D11 reversal) | DELETE | 2 (T7) |
| `feat/`-prefix hard-reject `bkit-auto.md:86-87` | Marker-primary FID resolution (D9) | DELETE | 1 (T2) |
| Hard-coded `/Users/christian/...create-t3-turbo` path (template + repo copies) | Stack/host-agnostic placeholder (D20) | DELETE | 1 (T1) |

### Documentation Updates (whole plan)

<!-- prettier-ignore -->
| Doc | Change required | Sub-Plan |
| --- | --- | --- |
| `docs/decisions.jsonl` | Shape-A transport decision (D5(a)/D5 per OQ-A) + C1/C2 posture — human-gated | 4 |
| `docs/knowledge.jsonl` | Shim state-model gotcha + D1 aetiology (skip-token in merge *body*) | 2 |
| `docs/deployments.md` | `dev` branch-protection + auto-delete-head-branches dependency (Risk 4) | 3 |
| `docs/testing.md` | New bats + vitest audits; new `status.jsonl` row types | 1, 6 |
| `docs/observability.md` | Step-1 narrated line + three `status.jsonl` row types + debug-egress loudness | 1, 3, 5, 6 |
| `.bkit/workflows.md` § Status | `runtime-resolved`/`transport-fallback`/`close-transport` row shapes | 1, 3 |

## Rollback Strategy

Code-only — `git revert {COMMIT}` per landed workstream + `pnpm bkit install` to re-render mirrors, then `git config core.bare false`. Mode-3 paths are additive and gated on `CAN_*`; reverting restores mode-1/2 behaviour with no residue. `status.jsonl` rows are additive/forward-compatible. No migration, no deploy.

## Data Schema Integration

**No database.** The only stateful surface is the existing NDJSON ledger `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (#234). The shim is a **stateless pure function re-sourced per block** (D21). Env-only flags re-derive free per block; `GH_OK` is probed once at Step 1 and read back from the `runtime-resolved` row — no cache file. **ADD (NDJSON row types, not DB):** `runtime-resolved`, `transport-fallback`, `close-transport`. No new artifact type.

---

## Sub-Plan Index _(replaces the Agent Execution Runbook — build in DAG order)_

**Ordering (build-dependency DAG):** `T1,T2,T3,T4,T5` → `T6,T7` → `T8,T9` → `T10,T11,T12,T13` → `T14,T15` → `T16`. Repo doctrine forbids concurrent bkit workflows on one clone — land serially, never in parallel. Batch mirror regen (`bkit install`) happens once, in Sub-Plan 6.

<!-- prettier-ignore -->
| Sub-Plan | Scope | Tasks | Matrix rows | Depends on | Key gates/OQ |
| --- | --- | --- | --- | --- | --- |
| [341-three-runtimes-plan-1.md](./341-three-runtimes-plan-1.md) | Independent roots (macOS path, FID reorder, runtime shim, `actions` toolset, gh-hardening) | T1, T2, T3, T4, T5 | 1–4, 10, 11, 13 | — (DAG root) | Owns 🔒 Gate 1 (Prerequisites) + human confirmations |
| [341-three-runtimes-plan-2.md](./341-three-runtimes-plan-2.md) | Invariants + CI-wait kernel | T6, T7 | 5, 6 | Sub-Plan 1 (T3 shim) | D11 sleep reversal; kernel-alignment test rewrite |
| [341-three-runtimes-plan-3.md](./341-three-runtimes-plan-3.md) | Branch model + close-guard kernel (adopt-or-mint 13-site commit, D23/D24/D25) | T8, T9 | 7–9 | Sub-Plans 1 (T2/T3), 2 (T7 shared files) | OQ-C (branch protection, Risk 4) |
| [341-three-runtimes-plan-4.md](./341-three-runtimes-plan-4.md) | Close shapes B/C + §6d skip-ci + shape A | T10, T11, T12, T13 | 12 | Sub-Plans 2 (T7), 3 (T9 kernel) | **OQ-A** (D5(a) vs D5 — picks whether T12 exists), **OQ-D** (docs-close CI cost) |
| [341-three-runtimes-plan-5.md](./341-three-runtimes-plan-5.md) | gh→MCP fallback lane + peripherals (worktree self-skip, debug egress, Playwright seam) | T14, T15 | 16 | Sub-Plans 1 (T4 `actions`), 3 (T9 D25) | OQ-B (job-logs default); owns Manual Step 5 |
| [341-three-runtimes-plan-6.md](./341-three-runtimes-plan-6.md) | Terminal verification: prose audit, batch mirror regen, live mode-1/2/3/4 runs, SC1–7 | T16 | 14, 15 | ALL (Sub-Plans 1–5) | 🔒 Gate 4 final suite; Manual Steps 1–4; OQ-C confirm |

**Derived Test Matrix → task → sub-plan map (all 16 rows, one task each):** rows 1–4→T3 (SP1), 5–6→T7 (SP2), 7–9→T9 (SP3), 10→T4 (SP1), 11→T1 (SP1), 12→T12 (SP4), 13→T5 (SP1), 14–15→T16 (SP6), 16→T15 (SP5). No uncovered row; no duplicated row.

## Merge Method

**Merge method: always squash.** Default `gh pr merge --squash --delete-branch --body ""`. Landings serialise (shared files across T7/T10/T11 and T8/T12); decompose into separate PRs per landing group rather than requesting a non-squash merge. Never `rebase`/`merge-commit` into `dev`.
