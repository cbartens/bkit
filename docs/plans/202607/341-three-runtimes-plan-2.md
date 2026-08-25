# Three-Runtime Workflow Execution (#341) — Sub-Plan 2: Invariants + CI-Wait Kernel

**Parent Plan:** [./341-three-runtimes-plan.md](./341-three-runtimes-plan.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this sub-plan natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

> [!IMPORTANT]
> This is the **bkit repo itself** — no app stack. Test tiers: **Static · Unit (vitest) · Integration (bats) · Integration (vitest)**; @live is a real mode-3 session owned by Sub-Plan 6.

## Context & Goals (inherited from parent)

bkit's five phase workflows + `bkit-auto` now run in **four runtimes**: laptop (mode 1), GH-Actions (mode 2), claude.ai cloud (mode 3, `CLAUDE_CODE_REMOTE=true`), Cursor cloud agent (mode 4). Mechanism (settled design `docs/plans/202607/341-three-runtimes-design.md`): a sourced runtime shim (`bkit-runtime.sh`) emits a 5-row capability table (`RUNTIME` → `CAN_WORKTREE`/`CAN_PUSH_DEV`/`CAN_SLEEP`/`GH_OK`); workflow headers branch on `CAN_*`; **invariants land in `.agents/rules.md`**; the close path gains transport-agnostic guards. Spikes A/B/C are CLOSED — fold findings.

**This sub-plan (2 of 6) — Invariants + CI-wait kernel (T6–T7).**

- **Depends on Sub-Plan 1:** T7 consumes T3's shim file (`.bkit/scripts/bkit-runtime.sh`) — it adds the `bkit_wait_ci` function to it. T6 depends on nothing new.
- **Feeds:** the `CAN_SLEEP` semantics and the rules-doctrine consumed by Sub-Plans 3–5.

### Inherited Success Criteria (whole effort — this sub-plan owns SC7 + the rules doctrine behind SC2–5)

1. All five phases + `bkit-auto` complete in each of the four runtimes (mode 4 = Cursor, gated on detection-var confirmation); mode-1 non-regressed by a real run.
2. No run mutates the checked-out branch in a runtime that cannot restore it (D6/D23).
3. Every phase-close body free of CI-suppression tokens (D24); `dev` CI-dispatch asserted (D1).
4. Any gh→MCP transition is bounded (max 1/run), recorded, cross-checked (D25).
5. An MCP read returning empty/zero is never authoritative absence (D12).
6. A shim that fails to source is loud and distinguishable from a least-capable runtime (Flow 1).
7. **No wait can hang — every bounded poll's cap survives a blocked `sleep` (D22).** ← primary for T7.

## Global Execution Constraints (inherited from parent — apply to every sub-plan)

> [!IMPORTANT]
>
> - **Continuous Execution:** work autonomously; check `[x]` as you go.
> - **Serialise landing:** repo doctrine forbids concurrent bkit workflows on one clone; land in DAG order. **T7 touches `bkit-build.md`/`bkit-debug.md`/`bkit-ship.md` (shared with Sub-Plans 3–4) — land T7 before those sub-plans' shared-file edits.**
> - **Line anchors are indicative, re-locate at build.** Every `:NNN` anchor may be stale — re-grep; NEVER edit by line number blind.
> - **Spikes A/B/C are CLOSED** — fold findings.
> - **Blockers → tracker issue (`blocker`), then stop.** Deferrals → `docs/deferrals.jsonl`; bugs → `docs/failures.jsonl`.
> - **Batch mirror regen (`bkit install`) at the END (Sub-Plan 6),** NOT after each edit. Mirrors NOT drift-gated (D19).
> - **ASCII operators** (`!=` `>=` `<=`) in `.bkit/workflows/*.md` and `.bkit/prompts/*.md`; never Unicode.
> - **Merge method: always squash.**

## Behaviour Constraints (inherited — govern T6–T7)

> [!CAUTION]
> **The blind CI-wait `sleep` in `bkit-ship.md` is removed** (re-locate at build — the `:556`/`sleep 30` anchor is STALE) — a knowing **reversal** of a prior decision (the CI-dispatch alignment test records "Ship is OUT of scope"); replaced by a bounded `RUN_ID` poll. **Legitimate retry/backoff sleeps are NOT removed** and MUST be distinguishable from CI-wait polls.

> [!WARNING]
> **Prose/doctrine change (D17):** `rules.md:71` branch-naming rule reframed — once FID comes from the tracker marker, an adopted `claude/…` branch no longer violates the "branch must contain FID" rule.

- **REJECTED — one `bkit_wait_ci` function for both CI-wait branches (D22).** `CAN_SLEEP=false` is agent control flow (bash cannot yield a turn); only the `CAN_SLEEP=true` branch is bash. The `CAN_SLEEP=false` branch stays agent prose in headers (D4/D22 boundary).
- **Assumption:** the `CAN_SLEEP=false` yield branch can carry an attempt counter across turns via the existing counter-bus (proven for `DEBUG_ATTEMPT`). → If not, the CI-wait yield branch degenerates.

## Architecture & Component Changes (this sub-plan)

### Invariants — `.agents/rules.md` (Layer 3)

#### [MODIFY] `.agents/rules.md` (bkit:start/end block) (+ its single template mirror) (T6)

- **Existence Check:** file exists; managed block exists; 2 files reach all 6 workflows.
- Add invariants: merge/commit body MUST be skip-token-free (D10, named+shared so both transports inherit); never foreground-sleep (D22); fallback bounded+recorded+success-asserted (D13); empty MCP read is inconclusive (D12). Reframe `rules.md:71` branch-naming (D17). Adopt-or-mint **procedure** does NOT go here (D15 — stays in headers, Sub-Plan 3).

### Mechanism — `bkit_wait_ci` in the shim (Layer 0/1) (T7)

#### [MODIFY] `.bkit/scripts/bkit-runtime.sh` (+ template)

- `bkit_wait_ci` — `CAN_SLEEP=true` branch only (bash): bounded poll, `timeout`-wrapped so a blocked primitive fails loud (D22). The `CAN_SLEEP=false` branch stays agent prose in headers (D4/D22 boundary).

#### [MODIFY] `.bkit/workflows/bkit-{build,debug,ship}.md` (T7 — CI-wait migration only)

- Re-census the sleeps at build first (the "7 sleeps / 4 constructs" count is stale — ~12 across 5 files; `bkit-ship.md` alone has 4 at `~:75/573/823/1102`, and there is NO `sleep 30` at `:556`). Migrate only CI-wait polls to `bkit_wait_ci` + the prose yield branch; leave retry/backoff sleeps in place. Delete the blind CI-wait `sleep` in `bkit-ship.md` (D11 reversal — re-locate).

### [DELETE] (see Supersession)

- The two inline `# --- CI-Dispatch Gate shared kernel ---` blocks in `bkit-build.md`/`bkit-debug.md` (extracted into `bkit_wait_ci`; the alignment test is **rewritten**, not dropped). The blind CI-wait `sleep` in `bkit-ship.md` (`:556`/`sleep 30` anchor STALE — re-locate).

## 🔒 Gate 1: Prerequisites Check

- [x] **Human confirmations `[x]`** in parent (Acceptance / Breaking / Open Questions). _(Unchecked → `REVISE`.)_
- [x] **Prerequisite:** Sub-Plan 1's T3 shim (`.bkit/scripts/bkit-runtime.sh`) landed — T7 extends it.
- [x] **Project Context:** `docs/knowledge.jsonl` (KN-11/DE-32 skip-ci-not-HEAD); the CI-dispatch alignment test (`.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts`) already exists.
- [x] **Gate 1 - Verified.**

## Derived Test Matrix (this sub-plan)

<!-- prettier-ignore -->
| # | Test description | Type | Target file | Task |
| --- | --- | --- | --- | --- |
| 5 | `bkit_wait_ci` `timeout`-wrapped cap fires on a blocked/never-returning `sleep` (never hangs); attempt + elapsed bounds enforced (D22) | Integration (bats) | `tests/bkit-runtime.bats` | T7 |
| 6 | CI-Dispatch kernel alignment test still asserts byte-identity after extraction into `bkit_wait_ci` (rewritten, not deleted) | Unit (vitest) | `.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts` | T7 |

_(T6's rules-invariant landing is verified by the rules-sync test + the design Step-3.1 D12-corroboration wiring in its `Done when`; its runtime consumption rests on Sub-Plan 6's row-15 prose audit + live run, per the honest limit D3.)_

## Agent Execution Runbook

- [x] **T6 — WS-7: Invariants into `.agents/rules.md` (D10/D12/D13/D15/D17/D22).** Add skip-token-free-body, never-foreground-sleep, bounded+recorded+asserted-fallback, empty-MCP-inconclusive invariants; reframe `rules.md:71`; keep adopt-or-mint procedure OUT (D15). Update the single template mirror. **Verify the empty-MCP-inconclusive invariant (D12) actually governs the design Step-3.1 `0 hits -> None.` call site** — the one that produced the logged `search_issues` silent-zero failure (this run's own `related-issues.md` shows it still fires) — so the corroboration guarantee is wired into that call site, not merely prose-adjacent in `rules.md`. **Done when:** the four invariants + the `rules.md:71` reframe are present in the managed block (both mirrors); the rules-sync test passes; the design Step-3.1 zero-hit path reads the D12 corroboration invariant (not a bare `0 hits -> None`); consumption verified live in T16.
- [x] **T7 — WS-8: `bkit_wait_ci` + kernel extraction + the D11 reversal.** Add the `CAN_SLEEP=true` bash branch (`timeout`-wrapped) to the shim + the `CAN_SLEEP=false` prose yield branch to headers. **Re-census the sleeps at build first — the "7 sleeps / 4 constructs" and `bkit-ship.md:556 sleep 30` anchors are STALE** (live source has ~12 `sleep` occurrences across 5 workflow files; `bkit-ship.md` alone has 4 at `~:75/573/823/1102`, and there is NO `sleep 30` at `:556`). Only the **CI-wait polls** migrate to `bkit_wait_ci`; **legitimate retry/backoff sleeps stay** and MUST be distinguishable from CI-wait polls (else row 15 either false-fails valid backoff or is weakened to a hollow gate). **Delete** the blind CI-wait `sleep` in `bkit-ship.md` (D11 reversal — re-locate at build; record the reversal). Extract the two kernel blocks and **rewrite** `bkit-ci-dispatch-gate-alignment.test.ts` to assert alignment post-extraction. Verify the counter-bus carries the cross-turn attempt counter. **Done when:** no foreground **CI-wait** `sleep` sits outside the CI-wait rule (retry/backoff sleeps explicitly exempted and marked); **Integration (bats)** row 5 asserts the `timeout` cap fires on a blocked/never-returning sleep (never hangs); **Unit (vitest)** row 6 (`bkit-ci-dispatch-gate-alignment.test.ts`) still asserts byte-identity and passes.

### 🔒 Gate 2: Code Implementation Check

- [x] **No bolt-on / no gate-weakening:** `bkit_wait_ci` extends the existing shim (not a parallel script); the rewritten alignment test asserts real byte-identity; no `.skip`/`@ts-ignore`/error-swallowing introduced.
- [x] **Gate 2 - Verified:** Every task checkbox independently verified.

**Mandatory Tasks (Testing & Documentation):**

- [x] **Verify test coverage:** rows 5–6→T7 map to checked tasks; T6 rules-sync test passes.
- [x] **Update existing tests:** rewrite `bkit-ci-dispatch-gate-alignment.test.ts` for the kernel extraction (T7).
- [x] **Write new tests:** the `bkit_wait_ci` timeout assertion (row 5) added to `tests/bkit-runtime.bats`.
- [x] **Update documentation:** `docs/knowledge.jsonl` — capture the shim state-model gotcha (sourced state dies across Bash calls; re-source per block) + the D1 aetiology (skip-token in merge _body_, not title) as durable traps.

### 🔒 Gate 3: Testing & Documentation Check

- [x] **Docs updated:** this sub-plan's `Documentation Updates` rows done; `.agents/docs.md` still accurate.
- [x] **Gate 3 - Verified.**

## Verification Plan

### Automated Tests

- [x] **Full local gate suite:** `pnpm typecheck` · lint · `format:check` · vale · `pnpm lint:slop` + `slop:delta` · `pnpm bkit check` · `pnpm test` · `pnpm test:bats`. Do NOT weaken any gate.
- [x] **New/updated:** `tests/bkit-runtime.bats` row 5 (timeout cap) + the rewritten `bkit-ci-dispatch-gate-alignment` (row 6) pass; rules-sync test green.

### 🔒 Gate 4: Automated Verification Confirmed

- [x] **Gate 4 - Verified:** every Automated Tests checkbox verified with explicit proof.

## Merge Method

**Merge method: always squash.** `gh pr merge --squash --delete-branch --body ""`. Landings serialise (T7 shares files with downstream sub-plans) — decompose into separate PRs per landing group. Never `rebase`/`merge-commit`.
