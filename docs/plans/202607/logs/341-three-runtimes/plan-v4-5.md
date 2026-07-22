# Three-Runtime Workflow Execution (#341) — Sub-Plan 5: Fallback Lane + Peripherals

**Parent Plan:** [./plan-v4-split.md](./plan-v4-split.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this sub-plan natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

> [!IMPORTANT]
> This is the **bkit repo itself** — no app stack. Test tiers: **Static · Unit (vitest) · Integration (bats) · Integration (vitest)**; @live is a real mode-3 session owned by Sub-Plan 6.

## Context & Goals (inherited from parent)

bkit's five phase workflows + `bkit-auto` now run in **three runtimes**: laptop (mode 1), GH-Actions (mode 2), claude.ai cloud (mode 3, `CLAUDE_CODE_REMOTE=true`). This sub-plan adds the **gh→MCP fallback lane** (bounded, recorded, corroborated) and the **peripheral gating** (worktree helpers self-skip, debug-egress loudness, Playwright artifact seam). Mechanism reference: `docs/plans/202607/341-three-runtimes-design.md`. Spikes A/B/C are CLOSED — fold findings.

**This sub-plan (5 of 6) — Fallback lane + peripherals (T14–T15).**

- **Depends on Sub-Plan 1:** both T14 and T15 read T4's `actions` toolset (the §6c `actions_*`/`get_job_logs`/`download_workflow_run_artifact` names resolve only once T4 adds `actions`). T14's `transport-fallback` row is cross-checked by Sub-Plan 3's T9 D25.
- **Feeds:** provisional tool names are finalised live in Sub-Plan 6 (T16); a residual re-point is a bounded post-T16 rework, not a silent surprise.

### Inherited Success Criteria (this sub-plan owns SC4/SC5 fallback behaviour)

1. All five phases + `bkit-auto` complete in each of the three runtimes; mode-1 non-regressed by a real run.
2. No run mutates the checked-out branch in a runtime that cannot restore it (D6/D23).
3. Every phase-close body free of CI-suppression tokens (D24); `dev` CI-dispatch asserted (D1).
4. **Any gh→MCP transition is bounded (max 1/run), recorded in `status.jsonl`, confirmed by an independent re-read, cross-checked mechanically (D25).** ← fallback lane in T14.
5. **An MCP read returning empty/zero is never recorded as authoritative absence — corroborated or reported unavailable, the attempt logged as its own state (D12).** ← T14 corroboration.
6. A shim that fails to source is loud and distinguishable (Flow 1).
7. No wait can hang (D22).

## Global Execution Constraints (inherited from parent — apply to every sub-plan)

> [!IMPORTANT]
>
> - **Continuous Execution:** work autonomously; check `[x]` as you go.
> - **Serialise landing:** repo doctrine forbids concurrent bkit workflows on one clone; land in DAG order. **T15 edits `bkit-worktree-{prune,sync}.md` + `bkit-debug.md` + `.agents/config.md`; T14 is prose in workflow headers (fallback map). Land after Sub-Plan 1 (T4).**
> - **Line anchors are indicative, re-locate at build.** Every `:NNN` anchor may be stale — re-grep; NEVER edit by line number blind.
> - **Spikes A/B/C are CLOSED** — fold findings.
> - **Blockers → tracker issue (`blocker`), then stop.** Deferrals → `docs/deferrals.jsonl`; bugs → `docs/failures.jsonl`.
> - **Batch mirror regen (`bkit install`) at the END (Sub-Plan 6),** NOT after each edit. Mirrors NOT drift-gated (D19).
> - **ASCII operators** (`!=` `>=` `<=`) in `.bkit/workflows/*.md`; never Unicode.
> - **Merge method: always squash.**

## Open Question governing this sub-plan (RESOLVE at parent Gate 1)

> [!CAUTION]
> **OQ-B — Playwright artifact seam (§8.2 / OQ1).** C1 (verified) says `actions_get`'s `download_workflow_run_artifact` method covers the seam, so the earlier "no MCP artifact-download tool" limitation is dropped — **but the method's output shape must be verified at build (T15) against a real run** (reachable only in Sub-Plan 6 / T16). If it does not carry the rich report, fall back to `get_job_logs` (job-logs-only; failure signal is not lost). **`get_job_logs` is the standing default.** → confirm the job-logs-only fallback is acceptable.

## Behaviour & Edge-Case Constraints (inherited — govern T14–T15)

> [!WARNING]
> Adopt-mode workflow headers must self-skip loudly for worktree helpers when `CAN_WORKTREE=false` — **silent omission = obscure mode-3 failures.**

- **MCP up but silently wrong** (`search_issues` clean `0` on a private repo) → empty/zero read is INCONCLUSIVE; corroborate via a second MCP signal (a `list_*` call) or report unavailable; log the attempt as its own state (D12).
- **Budget reading (D13):** bounded (max-1 gh→MCP/run). The `push_files`/shape-A transport is a fallback for _git_, not _gh_ — does NOT consume the max-1 budget.
- **Untrusted input (§6f):** every extra MCP call (T14) widens the lethal-trifecta surface; T14's bounded-fallback cap (D13) is a real mitigation; the injection **hardening** is `#342`'s scope — do NOT duplicate.
- **Honest-limit asymmetry (D3, intentional):** T15's debug-egress half carries no automated assertion — it rests on Manual-Verification Step 5 + the row-15 prose audit (Sub-Plan 6). The worktree-helper self-skip half IS bats-tested (row 16). This asymmetry is deliberate, NOT an oversight.
- **Residual (NOT assumed closed):** if Sub-Plan 6's live run finds the built-in mode-3 server exposes different tool names, the §6c map is re-pointed there — a bounded post-T16 rework.

## Architecture & Component Changes (this sub-plan)

### Procedure — workflow headers (Layer 2)

#### [MODIFY] `.bkit/workflows/bkit-{design,plan,build,debug,ship}.md` — fallback lane (T14)

- Prose (D4 — bash detects `GH_OK=false`, cannot invoke the tool): the §6c map under the C1-verified names (`actions_list`, `actions_get`, `get_job_logs`, `download_workflow_run_artifact`); bounded (max-1 gh→MCP/run) + recorded (`transport-fallback`) + success-asserted (independent re-read); empty MCP read INCONCLUSIVE → corroborate via a `list_*` call or report unavailable, logging the attempt as its own state (D12).

#### [MODIFY] `.bkit/workflows/bkit-worktree-{prune,sync}.md` — self-skip (T15)

- **Existence Check:** verify exist. Loud self-skip when `CAN_WORKTREE=false` (Flow 7).

#### [MODIFY] `.bkit/workflows/bkit-debug.md` + `.agents/config.md` — debug egress loudness (T15)

- Debug egress blindness: Custom allowlist + loudness so a self-skip `exit 0` never reads as "no runtime errors" (`bkit-debug.md:551-565` — re-locate at build). Playwright seam (OQ-B): `get_job_logs` is the **standing default**; verify `download_workflow_run_artifact` output shape against a real run (Sub-Plan 6) and adopt it ONLY if it carries the rich report.

## 🔒 Gate 1: Prerequisites Check

- [ ] **Human confirmations `[x]`** in parent — notably **OQ-B** (job-logs-only fallback acceptable). _(Unchecked → `REVISE`.)_
- [ ] **Prerequisite:** Sub-Plan 1 (T4 `actions` toolset) landed — the §6c tool names resolve only once `actions` is added; Sub-Plan 3 (T9 D25 cross-check) landed — reads T14's `transport-fallback` row.
- [ ] **Project Context:** `docs/observability.md` (debug-fetch loudness, `.agents/config.md`); `docs/failures.jsonl` (`github-mcp-search-issues-silently-returns-zero-private-repo`).
- [ ] **Gate 1 - Verified.**

## Derived Test Matrix (this sub-plan)

<!-- prettier-ignore -->
| # | Test description | Type | Target file | Task |
| --- | --- | --- | --- | --- |
| 16 | `bkit-worktree-{prune,sync}` helpers self-skip loudly on `CAN_WORKTREE=false` (Flow 7) — a real **behaviour** assertion over the helper self-skip path, NOT presence-only; distinct from row 4 (which covers only shim `WORKTREE_PATH` mint/adopt resolution) | Integration (bats) | `tests/bkit-runtime.bats` | T15 |

_(T14's fallback map + D13 bound + D12 corroboration are prose (D4) — tool-name resolution + credential-coupling posture are verified live in Sub-Plan 6 (T16); the `transport-fallback` row is cross-checked by Sub-Plan 3's D25 (row 8). T15's debug-egress half rests on Manual Step 5 + row-15 prose audit per the honest limit D3.)_

## Manual Verification (this sub-plan — the named mechanism for T15's debug-egress half)

> [!WARNING]
> **Dashboard Ban:** verify CI via `gh` (`gh run list`), never a dashboard.

- [ ] **Step 5 — debug-egress loudness (T15):** run `/bkit-debug` in a `CAN_WORKTREE=false` runtime; confirm the egress path emits a **loud signal** instead of a silent `exit 0`, so a self-skip never reads as "no runtime errors" (the named verification mechanism for T15's debug-egress half, which carries no automated assertion per the honest limit D3). _(Reachable only in a live runtime — coordinate with Sub-Plan 6's live-run session.)_

## Agent Execution Runbook

- [ ] **T14 — WS-14: gh→MCP fallback lane (Flow 6, D4/D12/D13, §6c under C1 names). Requires T4's `actions` toolset** (the §6c `actions_*`/`get_job_logs` names resolve only once T4 adds `actions`). Prose (D4 — bash detects `GH_OK=false`, cannot invoke the tool): the §6c map under the C1-verified names; bounded (max-1 gh→MCP/run) + recorded (`transport-fallback`) + success-asserted (independent re-read); empty MCP read INCONCLUSIVE → corroborate via a `list_*` call or report unavailable, logging the attempt as its own state (D12). Adopt the explicit budget reading: `push_files`/shape-A transport is a fallback for _git_, not _gh_ — does NOT consume the max-1 budget. Record OQ2/OQ3/shell-CLI deferrals. **Done when:** the fallback map + D13 bound + D12 corroboration prose are present; the `transport-fallback` row is written and cross-checked by T9's D25 (row 8); tool-name resolution + the credential-coupling posture (C2) verified in the live run (T16). _(Gated conceptually on WS-2/D26 — CLOSED as C1/C2; provisional tool names finalised live in T16. Residual tracked, NOT assumed closed: if T16 finds the built-in mode-3 server exposes different tool names, the §6c map is re-pointed there — a bounded post-T16 rework, not a silent surprise.)_
- [ ] **T15 — WS-15: Peripheral gating + localized fixes (Flow 7).** `bkit-worktree-{prune,sync}.md`: loud self-skip when `CAN_WORKTREE=false`. Debug egress blindness: Custom allowlist + loudness so a self-skip `exit 0` never reads as "no runtime errors" (`.agents/config.md`, `bkit-debug.md:551-565`). Playwright seam (OQ-B, **requires T4's `actions` toolset**): `get_job_logs` is the **standing default** (job-logs-only failure signal, never lost); verify `download_workflow_run_artifact` output shape against a real run — reachable only in T16 — and adopt it ONLY if it carries the rich report, else stay on the `get_job_logs` default. **Done when:** the two worktree helpers self-skip loudly on `CAN_WORKTREE=false` — asserted by a **behaviour** test in `tests/bkit-runtime.bats` (matrix row 16; the `CAN_WORKTREE=false` self-skip is bash-expressible and cheap to discriminate), NOT presence-only; debug egress emits a loud signal instead of a silent `exit 0`, verified by **Manual-Verification Step 5** (run `/bkit-debug` in a `CAN_WORKTREE=false` runtime and confirm the loud egress signal, not a silent `exit 0`) — this half of T15 has no automated assertion and rests on the live manual step + row-15 prose-audit per the honest limit (D3), an intentional asymmetry with the bats-tested self-skip half, NOT an oversight; the artifact seam is resolved per OQ-B with `get_job_logs` as the default until T16 confirms; consumption verified live in T16.

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on / no gate-weakening:** row 16's self-skip assertion is a real behaviour test (not presence-only); no `.skip`/`@ts-ignore`/error-swallowing introduced; the debug-egress loudness makes a self-skip loud, never a silent `exit 0`.
- [ ] **Gate 2 - Verified:** Every task checkbox independently verified.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage:** row 16→T15 maps to a checked task; T14 held by Sub-Plan 3 row 8 (D25) + live run.
- [ ] **Write new tests:** row 16 self-skip behaviour test added to `tests/bkit-runtime.bats`.
- [ ] **Verify observability:** debug egress loudness (T15) per `docs/observability.md`.
- [ ] **Update documentation:** record OQ2/OQ3/shell-CLI deferrals in `docs/deferrals.jsonl` (OQ3 → `docs/failures.jsonl`) per T14; `docs/observability.md` debug-egress loudness note.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** this sub-plan's `Documentation Updates` rows done; `.agents/docs.md` still accurate.
- [ ] **Gate 3 - Verified.**

## Verification Plan

### Automated Tests

- [ ] **Full local gate suite:** `pnpm typecheck` · lint · `format:check` · vale · `pnpm lint:slop` + `slop:delta` · `pnpm bkit check` · `pnpm test` · `pnpm test:bats`. Do NOT weaken any gate.
- [ ] **New bats:** `tests/bkit-runtime.bats` row 16 (worktree-helper self-skip behaviour) passes.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 - Verified:** every Automated Tests checkbox verified with explicit proof.

## Merge Method

**Merge method: always squash.** `gh pr merge --squash --delete-branch --body ""`. Never `rebase`/`merge-commit`.
