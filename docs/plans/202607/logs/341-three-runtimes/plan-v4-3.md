# Three-Runtime Workflow Execution (#341) — Sub-Plan 3: Branch Model + Close-Guard Kernel

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

bkit's five phase workflows + `bkit-auto` now run in **three runtimes**: laptop (mode 1), GH-Actions (mode 2), claude.ai cloud (mode 3, `CLAUDE_CODE_REMOTE=true`). Mechanism (design `docs/plans/202607/341-three-runtimes-design.md`): a sourced runtime shim emits a 4-row capability table (`RUNTIME` → `CAN_WORKTREE`/`CAN_PUSH_DEV`/`CAN_SLEEP`/`GH_OK`); **workflow headers branch on `CAN_*`** for the adopt-or-mint branch model; **the close path gains transport-agnostic guards (D23/D24/D25)**. Spikes A/B/C are CLOSED — fold findings.

**This sub-plan (3 of 6) — Branch model + close-guard kernel (T8–T9).**

- **Depends on Sub-Plan 1:** T8 requires T2's marker-primary FID resolution (adopt mode is only reachable once the `feat/`-prefix hard-reject is deleted); T9 consumes T3's shim.
- **Feeds:** T9's close-guard kernel (D23/D24/D25) is consumed by the close shapes in Sub-Plans 4 (shapes A/B/C wiring) — land this before Sub-Plan 4.

### Inherited Success Criteria (this sub-plan owns SC2 + the kernel behind SC3/SC4)

1. All five phases + `bkit-auto` complete in each of the three runtimes; mode-1 non-regressed by a real run.
2. **No run mutates the checked-out branch in a runtime that cannot restore it — zero `git checkout dev` when dev-push is absent (D6), held by a double-guard + reversible checkout (D23).** ← primary for T8/T9.
3. **Every phase-close body free of CI-suppression tokens — asserted post-hoc against the landed commit (D24); `dev` CI-dispatch asserted (D1).** ← kernel in T9.
4. **Any gh→MCP transition is bounded, recorded, cross-checked (D25).** ← cross-check kernel in T9.
5. An MCP read returning empty/zero is never authoritative absence (D12).
6. A shim that fails to source is loud and distinguishable from a least-capable runtime (Flow 1).
7. No wait can hang (D22).

## Global Execution Constraints (inherited from parent — apply to every sub-plan)

> [!IMPORTANT]
>
> - **Continuous Execution:** work autonomously; check `[x]` as you go.
> - **Serialise landing:** repo doctrine forbids concurrent bkit workflows on one clone; land in DAG order. **T8 edits all five phase workflow files; land after Sub-Plan 1 (T2) and Sub-Plan 2 (T7's `bkit-{build,debug,ship}.md` edits). T9's kernel must land before Sub-Plan 4's close-shape wiring.**
> - **Line anchors are indicative, re-locate at build.** Every `:NNN` anchor may be stale — re-grep; NEVER edit by line number blind (verified drift: `git push origin dev` now near `bkit-ship.md:840`, `core.bare` flip near `:816`).
> - **Spikes A/B/C are CLOSED** — fold findings.
> - **Blockers → tracker issue (`blocker`), then stop.** Deferrals → `docs/deferrals.jsonl`; bugs → `docs/failures.jsonl`.
> - **Batch mirror regen (`bkit install`) at the END (Sub-Plan 6),** NOT after each edit. Mirrors NOT drift-gated (D19).
> - **ASCII operators** (`!=` `>=` `<=`) in `.bkit/workflows/*.md`; never Unicode.
> - **Merge method: always squash.**

## Behaviour & Edge-Case Constraints (inherited — govern T8–T9)

> [!WARNING]
> **Adopt-mode workflow headers drop** the `Worktree created/resumed` and `Worktree removed` gate items and rewrite the `pwd`-outside-worktree rule to `pwd != WORKTREE_PATH` (5 header files; `bkit-auto.md` has none). This **`pwd != WORKTREE_PATH` rewrite MUST ship in the SAME commit as adopt-or-mint (D7)** — else the workflow cannot take one step.

- **Identity says capable, reality says not** (mode-2 read-only `GITHUB_TOKEN`; rotated `GH_TOKEN` 401) → `CAN_PUSH_DEV` selects a transport, not a permission; the **real push** certifies loudly (`push origin dev || exit 1`); no `--dry-run` probe (D23).
- **Repo settings invisible to git** (branch protection on `dev`; auto-delete-head-branches) → committed pre-close assertion on the real push (Risk 4); dependency written into `docs/deployments.md`; NO Step-1 `gh api` probe (token lacks admin scope). **(OQ-C — human/admin confirms branch protection permits the autonomous close + enables auto-delete-head-branches; verified in Sub-Plan 6 Manual Step 4.)**
- **Adopt mode collapses worktree isolation** (`WORKTREE_PATH == REPO_ROOT`) → accepted; the existing `.lock` is the only concurrency guard.
- **REJECTED — `git push --dry-run origin dev` probe for `CAN_PUSH_DEV` (D23).** Fails dangerous: no ref-update, branch protection never evaluated → false-positive → `git checkout dev` on the live session. Replaced by double-guard + reversible checkout + the real push certifying permission.
- **Assumption:** the five phases' Step-2 branch logic is uniform enough for one adopt-or-mint rule (design/plan verified; build/debug/ship spot-checked). → If not, T8 grows per-phase variants.

## Architecture & Component Changes (this sub-plan)

### Procedure — workflow headers (Layer 2) — adopt-or-mint (T8)

#### [MODIFY] `.bkit/workflows/bkit-{design,plan,build,debug,ship}.md` (Step 2)

- **Existence Check:** all exist. Step 2: adopt-or-mint (Flow 2) + the **13 coupled sites in one commit** (D7): `pwd != WORKTREE_PATH` rule rewrite (5 files), Placeholders redefinition (5 files), 5 `Worktree created/resumed` gate items, 3 `Worktree removed` gate items; `WORKTREE_PATH` 6 assignment sites (D8). `CAN_WORKTREE=true`→mint (untouched); `false`→adopt in place, `WORKTREE_PATH=$REPO_ROOT`, assert `branch != dev`.

### Mechanism — close-guard + close-audit kernel in the shim (T9)

#### [MODIFY] `.bkit/scripts/bkit-runtime.sh` (+ template)

- Close-guard helpers (all bash-expressible, transport-agnostic): D23 double-guard (`CAN_WORKTREE=true AND CAN_PUSH_DEV=true`) + reversible trap-restored checkout; D24 post-close `git log -1 --format=%B <SHA>` skip-token scan (fetch first for server-side); D25 `transport-fallback` cross-check (`GH_OK=false` + mapped-tool ⇒ row MUST exist). Emit `transport-fallback` + `close-transport` rows.

#### [MODIFY] `docs/deployments.md` (T9)

- Add the `dev` branch-protection + auto-delete-head-branches dependency for the autonomous close (Risk 4).

## 🔒 Gate 1: Prerequisites Check

- [ ] **Human confirmations `[x]`** in parent (Acceptance / Breaking / Open Questions incl. OQ-C branch-protection). _(Unchecked → `REVISE`.)_
- [ ] **Prerequisite:** Sub-Plan 1 landed (T2 marker-primary FID — required for adopt mode; T3 shim — extended by T9). Sub-Plan 2's `bkit-{build,debug,ship}.md` edits landed (serialise).
- [ ] **Project Context:** `docs/knowledge.jsonl`; `docs/decisions.jsonl`. New `status.jsonl` row types (`transport-fallback`/`close-transport`) follow `.bkit/jsonl.md`.
- [ ] **Gate 1 - Verified.**

## Derived Test Matrix (this sub-plan)

<!-- prettier-ignore -->
| # | Test description | Type | Target file | Task |
| --- | --- | --- | --- | --- |
| 7 | D24 post-close scan flags `[skip ci]` in the LANDED commit body (`git log -1 --format=%B <SHA>`) on any transport → Failure Path | Integration (bats) | `tests/bkit-runtime.bats` | T9 |
| 8 | D25 cross-check: `runtime-resolved.GH_OK=false` + a mapped-tool close with NO `transport-fallback` row → Failure Path (reads real `status.jsonl`) | Integration (bats) | `tests/bkit-runtime.bats` | T9 |
| 9 | D23 double-guard: the local-checkout branch requires `CAN_WORKTREE=true` AND `CAN_PUSH_DEV=true`; trap restores the original branch on exit | Integration (bats) | `tests/bkit-runtime.bats` | T9 |

_(T8's adopt-or-mint consumption is covered by Sub-Plan 1 row 4 (`WORKTREE_PATH` mint/adopt) + Sub-Plan 6's row-15 prose audit (a `CAN_WORKTREE` reader at each site) + the live run, per the honest limit D3.)_

## Agent Execution Runbook

- [ ] **T8 — WS-9: Adopt-or-mint branch model + the 13 coupled sites, ONE commit (D7/D8/Flow 2). Requires T2's marker-primary FID resolution** — adopt mode is only reachable via `bkit-auto` once the `feat/`-prefix hard-reject is deleted (T2), so land T2 first. Step 2 of all five phases: `CAN_WORKTREE=true`→mint (untouched); `false`→adopt in place, `WORKTREE_PATH=$REPO_ROOT`, assert `branch != dev`. Ship together: `pwd != WORKTREE_PATH` rewrite (5 files), Placeholders redefinition (5 files), 5 `Worktree created/resumed` + 3 `Worktree removed` gate items removed/gated, 6 `WORKTREE_PATH` assignment sites. Verify build/debug/ship Step-2 uniformity (assumption). **Done when:** adopt mode takes every step without a `pwd`-outside-worktree Failure Path; all 13 coupled sites land in one commit; `WORKTREE_PATH` resolution covered by T3 row 4; prose-audit (T16 row 15) sees a `CAN_WORKTREE` reader at each site; consumption verified live in T16.
- [ ] **T9 — WS-10: Close-guard + close-audit kernel, transport-agnostic (D23/D24/D25/Risk 4).** Shim helpers: D23 double-guard (`CAN_WORKTREE=true AND CAN_PUSH_DEV=true`) + reversible trap-restored checkout; D24 post-close `git log -1 --format=%B <SHA>` skip-token scan (fetch first for server-side); D25 cross-check (`GH_OK=false` + mapped-tool ⇒ `transport-fallback` row MUST exist). Emit `transport-fallback` + `close-transport` rows. Commit the Risk-4 pre-close assertion (on the real push) + write the `docs/deployments.md` dependency; record OQ5 not-adopted. **Done when:** **Integration (bats)** rows 7–9 pass over real git + real `status.jsonl`: D24 flags `[skip ci]` in a landed body → Failure Path; D25 flags a missing `transport-fallback` row → Failure Path; D23 double-guard + trap-restore keeps the original branch.

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on / no gate-weakening:** close-guard helpers extend the existing shim (not a parallel script); no `.skip`/`@ts-ignore`/empty `catch`/error-swallowing introduced to pass a gate.
- [ ] **Gate 2 - Verified:** Every task checkbox independently verified.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage:** rows 7–9→T9 map to checked tasks; T8 covered by row 4 (Sub-Plan 1) + prose audit (Sub-Plan 6).
- [ ] **Write new tests:** rows 7–9 added to `tests/bkit-runtime.bats`.
- [ ] **Verify observability:** the three `status.jsonl` row types (`runtime-resolved` from Sub-Plan 1, `transport-fallback`/`close-transport` here) documented in `docs/observability.md` / `.bkit/workflows.md`.
- [ ] **Update documentation:** `docs/deployments.md` branch-protection + auto-delete-head-branches dependency (Risk 4); `.bkit/workflows.md` § Status — document `transport-fallback`/`close-transport` row shapes.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** this sub-plan's `Documentation Updates` rows done; `.agents/docs.md` still accurate.
- [ ] **Gate 3 - Verified.**

## Verification Plan

### Automated Tests

- [ ] **Full local gate suite:** `pnpm typecheck` · lint · `format:check` · vale · `pnpm lint:slop` + `slop:delta` · `pnpm bkit check` · `pnpm test` · `pnpm test:bats`. Do NOT weaken any gate.
- [ ] **New bats:** `tests/bkit-runtime.bats` rows 7–9 execute over a real git repo + real `status.jsonl` and pass.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 - Verified:** every Automated Tests checkbox verified with explicit proof.

## Merge Method

**Merge method: always squash.** `gh pr merge --squash --delete-branch --body ""`. T8's 13-coupled-site edit lands in ONE commit; T9 is a separate landing. Never `rebase`/`merge-commit`.
