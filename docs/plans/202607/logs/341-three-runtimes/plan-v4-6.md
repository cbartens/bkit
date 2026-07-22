# Three-Runtime Workflow Execution (#341) — Sub-Plan 6: Terminal Verification + Live Runs

**Parent Plan:** [./plan-v4-split.md](./plan-v4-split.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this sub-plan natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

> [!IMPORTANT]
> This is the **bkit repo itself** — no app stack. The end-to-end runtime behaviour is reachable only by a **real mode-3 session (no CI harness)** — carried as one `@live`-manual row (WS-16). Per the design's honest limit (D3), the shim buys testable **detection**, not testable **consumption**; consumption rests on this sub-plan's real run.

## Context & Goals (inherited from parent)

bkit's five phase workflows + `bkit-auto` now run in **three runtimes**: laptop (mode 1), GH-Actions (mode 2), claude.ai cloud (mode 3, `CLAUDE_CODE_REMOTE=true`). This **terminal** sub-plan adds the prose audit, performs the batch mirror regen, runs all five phases + `bkit-auto` end-to-end in each of the three runtimes, and asserts SC1–7 against the landed system. Mechanism reference: `docs/plans/202607/341-three-runtimes-design.md`. Spikes A/B/C are CLOSED — the only residuals are the live-mode-3 observations owned by this task.

**This sub-plan (6 of 6) — Terminal verification (T16 alone).**

- **Depends on ALL prior sub-plans** (1–5): reachable only after every other task lands. Kept solo so a real live-session run isn't rushed inside a larger sub-plan.

### Success Criteria — this sub-plan is the ONLY guarantee they are honoured (D3)

1. **All five phases + `bkit-auto` complete end-to-end in each of the three runtimes; the mode-1 laptop path is verified non-regressed by a real end-to-end run (not a rule-text-presence test).** This run is also the only guarantee that prose rules _honour_ the capability flags — no static engine can assert that.
2. No run ever mutates the session's checked-out branch in a runtime that cannot restore it — zero `git checkout dev` when dev-push capability is absent (D6/D23).
3. Every phase-close lands on `dev` with a body free of CI-suppression tokens (D24) — and the resulting `dev` CI-dispatch outcome is asserted rather than assumed (D1 closed on both transports).
4. Any gh→MCP transition is bounded (max 1/run), recorded, confirmed by an independent re-read, cross-checked mechanically (D25).
5. An MCP read returning empty/zero is never recorded as authoritative absence (D12).
6. A shim that fails to source is loud and distinguishable from a least-capable runtime (Flow 1).
7. No wait can hang — every bounded poll's cap survives a blocked `sleep` (D22).

## Global Execution Constraints (inherited from parent — apply to every sub-plan)

> [!IMPORTANT]
>
> - **Continuous Execution:** work autonomously; check `[x]` as you go.
> - **Serialise landing:** repo doctrine forbids concurrent bkit workflows on one clone; land in DAG order — **this sub-plan is TERMINAL; land it last, after Sub-Plans 1–5.**
> - **Line anchors are indicative, re-locate at build.** Every `:NNN` anchor may be stale — re-grep; NEVER edit by line number blind.
> - **Spikes A/B/C are CLOSED** — fold findings; the residual live-mode-3 items are owned HERE.
> - **Blockers → tracker issue (`blocker`), then stop.** Deferrals → `docs/deferrals.jsonl`; bugs → `docs/failures.jsonl`.
> - **Batch mirror regen (`bkit install`) happens HERE** (then `git config core.bare false` — known install side effect). Confirm `.bkit/version` tracks the shim.
> - **ASCII operators** (`!=` `>=` `<=`) in `.bkit/workflows/*.md`; never Unicode.
> - **Merge method: always squash.**

## Behaviour Constraints (inherited — govern T16)

> [!IMPORTANT]
> **No Architectural Downgrades:** resolve build/test errors via `docs/architecture.md` + `docs/knowledge.jsonl`, never hot fixes. The design's honest limit stands — bats/vitest prove **detection + presence**, NOT that prose rules _honour_ the flags. Halt if stuck.

- **Three live residuals to settle here** (all named-and-mitigated, so behaviour is safe either way): sleep block-vs-error (`timeout` cap); which MCP server mode 3 loads + `GH_BKIT_TOKEN` in-sandbox (dual-lane abort); `push_files`/PR-close reject-vs-clobber on a moved `dev` head (dev-head-unmoved precondition).
- **OQ-C (dev config):** confirm branch protection permits the autonomous close (status-checks-only, no required human review) and enable "Automatically delete head branches" (there is no MCP `delete_branch`) — Manual Step 4. Human/admin action.
- **Risk window:** mirror regen (`.claude`/`.cursor`/`.opencode`) must follow any `.bkit/` source revert; batch `bkit install` at the end; after install run `git config core.bare false`.

## Architecture & Component Changes (this sub-plan)

### Tests / docs — prose audit + verification (T16)

#### [NEW] `.bkit/src/bkit-runtime-prose-audit.test.ts`

- Vitest prose audit: every `CAN_*` has >=1 reader in `.bkit/workflows/`; every foreground **CI-wait** `sleep` sits under the CI-wait rule (retry/backoff sleeps explicitly exempted, NOT flagged) — presence, NOT behaviour.

#### Mirror regen + version tracking

- Batch mirror regen via `bkit install` (then `git config core.bare false`); confirm `.bkit/version` tracks the shim.

## 🔒 Gate 1: Prerequisites Check

- [ ] **Human confirmations `[x]`** in parent (Acceptance / Breaking / Open Questions incl. OQ-C dev config). _(Unchecked → `REVISE`.)_
- [ ] **Prerequisite:** Sub-Plans 1–5 all landed and green (this task is only reachable after every other task lands).
- [ ] **Project Context:** `docs/testing.md`; `docs/deployments.md` (branch-protection dependency from Sub-Plan 3); `spike-findings.md` + `design-addendum-spikes.md` (residuals).
- [ ] **Gate 1 - Verified.**

## Derived Test Matrix (this sub-plan)

<!-- prettier-ignore -->
| # | Test description | Type | Target file | Task |
| --- | --- | --- | --- | --- |
| 14 | End-to-end: all 5 phases + `bkit-auto` complete in each of the 3 runtimes; mode-1 non-regression by a real run; status trail shows `RUNTIME`/`CAN_*`/transport (SC1–7) | @live (manual, WS-16) | live claude.ai session + `docs/plans/.../status.jsonl` asserts | T16 |
| 15 | Vitest prose audit: every `CAN_*` has >=1 reader in `.bkit/workflows/`; every foreground **CI-wait** `sleep` sits under the CI-wait rule (retry/backoff sleeps explicitly exempted, NOT flagged) (presence, NOT behaviour) | Unit (vitest) | `.bkit/src/bkit-runtime-prose-audit.test.ts` | T16 |

## Agent Execution Runbook

- [ ] **T16 — WS-16: Verification, prose audit, mirror regen, live runs (SC1–7, D3/D19).** Add the **Unit (vitest)** prose audit `.bkit/src/bkit-runtime-prose-audit.test.ts` (every `CAN_*` has >=1 reader; every CI-wait `sleep` under the CI-wait rule, retry/backoff sleeps exempted — presence, NOT behaviour). Batch mirror regen via `bkit install` (then `git config core.bare false`); confirm `.bkit/version` tracks the shim. Run all five phases + `bkit-auto` end-to-end in each runtime; verify mode-1 non-regression by a real run; settle the three live residuals (sleep block-vs-error; which MCP server + `GH_BKIT_TOKEN` in-sandbox; `push_files`/PR-close reject-vs-clobber). Assert SC1–7 against the landed system. **Done when:** **Unit (vitest)** row 15 passes; **@live (manual)** row 14 — a real mode-3 session + real mode-1 run — completes all phases with a status trail showing `RUNTIME`/`CAN_*`/transport, mode-1 non-regressed, `dev` CI dispatched (SC3), and no hang (SC7).

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on / no gate-weakening:** the `[NEW]` `bkit-runtime-prose-audit.test.ts` justified against extending an existing artifact; no `.skip`/`@ts-ignore`/error-swallowing introduced to pass a gate.
- [ ] **Gate 2 - Verified:** the task checkbox independently verified against the plan.

**Mandatory Tasks (Testing & Documentation) — whole-plan closeout:**

- [ ] **Verify test coverage against Derived Test Matrix:** all 16 rows across Sub-Plans 1–6 map to a checked task (rows 1–4→T3, 5–6→T7, 7–9→T9, 10→T4, 11→T1, 12→T12, 13→T5, 14–15→T16, 16→T15). No uncovered row.
- [ ] **Write new tests:** `.bkit/src/bkit-runtime-prose-audit.test.ts` (row 15).
- [ ] **Verify observability:** Step-1 narrated line + three `status.jsonl` row types documented in `docs/observability.md` / `.bkit/workflows.md`; debug egress loudness (Sub-Plan 5 / T15) per `docs/observability.md`.
- [ ] **Update documentation (whole-plan closeout):** every `Documentation Updates` row completed across all sub-plans (`docs/deployments.md` branch-protection dependency; `docs/testing.md` new tests + row types; `docs/knowledge.jsonl` traps; `docs/decisions.jsonl` transport + C1/C2 at build once OQ-A confirmed).

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row done across all sub-plans; `.agents/docs.md` still accurate.
- [ ] **Gate 3 - Verified:** every checkbox independently verified.

## Verification Plan

### Automated Tests (whole-plan final gate)

- [ ] **Full local gate suite:** `pnpm typecheck` · lint · `format:check` · prose (vale) · `pnpm lint:slop` + `slop:delta` · `pnpm bkit check` (drift) · `pnpm test` (vitest unit + in-process integration) · `pnpm test:bats` (`npx --yes bats tests/*.bats`). Do NOT weaken any gate to pass.
- [ ] **All bats:** `tests/bkit-runtime.bats` (rows 1–9, 16), `tests/cloud-bootstrap-preflight.bats` (row 13) execute the real scripts in fresh subprocesses and pass.
- [ ] **All vitest:** `bkit-runtime-prose-audit` (row 15), `bkit-mcp-toolsets` (row 10), `bkit-skip-ci-subject-audit` (row 12), `bkit-template-no-userpath` (row 11), and the rewritten `bkit-ci-dispatch-gate-alignment` (row 6) pass.
- [ ] **Drift + mirror parity:** `pnpm bkit check` green after `bkit install` regen; `.mcp.json` ↔ template and `cloud-bootstrap.sh` ↔ template byte-identical; `.bkit/version` tracks the shim.
- [ ] **No migration / no @live CI tier for bkit** — the runtime-behaviour guarantee is the manual live run below, not an automated tier.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 - Verified:** every Automated Tests checkbox verified with explicit proof (test output / CLI results).

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** verify CI via `gh` (`gh run list`), never a dashboard.

- [ ] **Step 1 — mode-1 non-regression (laptop):** run all five phases + `bkit-auto` on the laptop; confirm mint-path + local close unchanged, `dev` CI dispatched, no `[skip ci]` in landed bodies (D24).
- [ ] **Step 2 — mode-3 live run (claude.ai session, WS-16 row 14):** run each phase on the claude.ai runner; confirm adopt-or-mint (no worktree), no `git checkout dev`, shape-A/B/C closes land on `dev` via the confirmed transport, `dev` CI dispatched (SC3), no hang (SC7), and `status.jsonl` shows `runtime-resolved`/`close-transport` (+ `transport-fallback` if gh fell back). Settle the three live residuals (sleep block-vs-error; MCP server + `GH_BKIT_TOKEN` in-sandbox; reject-vs-clobber).
- [ ] **Step 3 — mode-2 runner:** trigger a phase via the CI event/label path; confirm `RUNTIME=2`, `GH_BKIT_TOKEN`/App write path, CI dispatched.
- [ ] **Step 4 — `dev` config (OQ-C):** confirm branch protection permits the autonomous close and "Automatically delete head branches" is enabled.

_(Manual-Verification Step 5 — debug-egress loudness — is owned by Sub-Plan 5 (T15), its named verification mechanism; coordinate its live check with this sub-plan's mode-3 session.)_

## Merge Method

**Merge method: always squash.** `gh pr merge --squash --delete-branch --body ""`. Never `rebase`/`merge-commit` into `dev`.
