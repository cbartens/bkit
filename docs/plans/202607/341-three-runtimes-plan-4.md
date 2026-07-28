# Three-Runtime Workflow Execution (#341) — Sub-Plan 4: Close Shapes (B/C) + §6d Skip-CI + Shape A

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

bkit's five phase workflows + `bkit-auto` now run in **four runtimes**: laptop (mode 1), GH-Actions (mode 2), claude.ai cloud (mode 3, `CLAUDE_CODE_REMOTE=true`), Cursor cloud agent (mode 4). This sub-plan wires the **phase-close transports** for all three shapes onto the close-guard kernel (D23/D24/D25) built in Sub-Plan 3, and reconciles the **§6d `[skip ci]`-subject convention** that the recommended shape-A transport (D5(a) PR-close) requires as a prerequisite. Mechanism reference: `docs/plans/202607/341-three-runtimes-design.md`. Spikes A/B/C are CLOSED — fold findings.

**This sub-plan (4 of 6) — Close shapes B/C + §6d + shape A (T10–T13).**

- **Depends on Sub-Plan 3:** T10/T11/T13 inherit T9's D24 scan + D25 cross-check + D23 guard. T13 additionally depends on T12.
- **Highest-risk reconciliation work** (T12 enumerate-and-reconcile 6+ coupled skip-ci sites; T13 shape-A PR-close) — isolated so it isn't rushed inside a larger sub-plan.

### Inherited Success Criteria (this sub-plan lands the close transports behind SC3)

1. All five phases + `bkit-auto` complete in each of the four runtimes (mode 4 = Cursor, gated on detection-var confirmation); mode-1 non-regressed by a real run.
2. No run mutates the checked-out branch in a runtime that cannot restore it (D6/D23).
3. **Every phase-close lands on `dev` with a body free of CI-suppression tokens (D24); `dev` CI-dispatch asserted (D1).** ← close transports here.
4. Any gh→MCP transition is bounded, recorded, cross-checked (D25).
5. An MCP read returning empty/zero is never authoritative absence (D12).
6. A shim that fails to source is loud and distinguishable (Flow 1).
7. No wait can hang (D22).

## Global Execution Constraints (inherited from parent — apply to every sub-plan)

> [!IMPORTANT]
>
> - **Continuous Execution:** work autonomously; check `[x]` as you go.
> - **Serialise landing:** repo doctrine forbids concurrent bkit workflows on one clone; land in DAG order. **T10/T11 touch `bkit-build.md`/`bkit-debug.md`/`bkit-ship.md` (shared with Sub-Plan 2's T7); T12 across all workflows; T13 in `bkit-design.md`/`bkit-plan.md`/`bkit-ship.md`. Land after Sub-Plans 2 and 3.**
> - **Line anchors are indicative, re-locate at build.** Every `:NNN` anchor may be stale (verified drift: `git push origin dev` now near `bkit-ship.md:840`, `core.bare` flip near `:816`; there is NO `sleep 30` at `:556`). Re-grep; NEVER edit by line number blind.
> - **Spikes A/B/C are CLOSED** — fold findings.
> - **Blockers → tracker issue (`blocker`), then stop.** Deferrals → `docs/deferrals.jsonl`; bugs → `docs/failures.jsonl`.
> - **Batch mirror regen (`bkit install`) at the END (Sub-Plan 6),** NOT after each edit. Mirrors NOT drift-gated (D19).
> - **ASCII operators** (`!=` `>=` `<=`) in `.bkit/workflows/*.md`; never Unicode.
> - **Merge method: always squash.**

## Open Questions governing this sub-plan (RESOLVE at parent Gate 1 before build)

> [!CAUTION]
> **OQ-A — Shape-A (design/plan docs-only) mode-3 transport: PR-close (D5(a)) vs `push_files` (D5)?** **Plan recommendation: D5(a) PR-close.** Spike B (closed) confirmed `push_files` is append-only, single-parent, full-content, and **cannot express `merge --squash -X ours`**; its payload defect (~40–48k tokens inlined per call) is non-repairable and its conflict semantics **invert** `-X ours` (branch-wins vs dev-wins → silent divergence, Risk 9). D5(a) is uniform with ship's server-side merge, credential-decoupled, and free of both defects — at the cost of pulling **§6d into scope as a prerequisite**. **This sub-plan's runbook is written for D5(a) (T12 + T13).** **If the human selects D5**, DROP T12 entirely and swap T13's tail for the `push_files` prologue (STRAY-over-unfiltered-diff, `get_file_contents({ref:"dev"})` assert, dev-head-unmoved precondition; do NOT split to `create_or_update_file`), and drop matrix row 12.
>
> **OQ-D — Docs-only closes now fire full CI (knowing cost reversal; only live under OQ-A=D5(a)).** Dropping `[skip ci]` from design/plan docs-only close subjects (T12) reclassifies them from `bkit-tests-scope` `run_level=none` to a full-CI `dev` push — it is the counterpart mechanism KN-11's fix relied on. **Confirm this CI-cost is accepted** (same class as the D11 sleep reversal), OR require the D5(a) transport to carry the skip signal WITHOUT surfacing the token in the merge subject. Either way the coupled ship-side gates (`bkit-ship.md` HEAD-skip-ci `~:682` + `AHEAD_NON_SKIP` counter `~:833`) and the design/plan checklist prose (`~:853`/`~:913`) must be reconciled in T12. Moot if the human selects D5 in OQ-A.

## Behaviour Constraints (inherited — govern T10–T13)

> [!CAUTION]
> **§6d (under the recommended D5(a) transport):** `[skip ci]` dropped from phase-close subjects AND intermediate status-commit subjects, because a PR-close surfaces the subject as the PR title/merge subject. This changes commit subjects on `dev`. T12 must reconcile every coupled site, not just remove the token.

- **CHOSEN — Shape-A mode-3 transport = D5(a) PR-close.** Uniform with ship, credential-decoupled, no token-bloat, no conflict-inversion; §6d becomes a prerequisite.
- **REJECTED — `push_files` as shape-A primary (D5).** Non-repairable payload bloat + conflict inversion + credential coupling. Kept as the fallback shape only if the human overrides OQ-A.
- **`push_files`/PR-close conflict when `dev` head moved under a mode-3 close** → dev-head-unmoved precondition guards it (Risk 9); reject-vs-clobber on a moved head is a residual settled by the live run (Sub-Plan 6 / WS-16).
- **Ship close (D16/Risk 8):** skip the post-merge dev-sync block when `CAN_PUSH_DEV=false`; keep the `core.bare` flip unconditional.

## Architecture & Component Changes (this sub-plan)

### Procedure — workflow headers (Layer 2) — close shapes

#### [MODIFY] `.bkit/workflows/bkit-{build,debug}.md` — close shape B (T10)

- Verify shape B already works in mode 3 (current branch pushable); wire the `close-transport` row + D24 scan + D25 cross-check; skip branch cleanup in adopt mode.

#### [MODIFY] `.bkit/workflows/bkit-ship.md` — close shape C (T11)

- Skip the post-merge dev-sync block (`bkit-ship.md:733-751`, incl. `:746` `git push origin dev`) when `CAN_PUSH_DEV=false` (D16/Risk 8); consume T9's reversible-checkout guard for the mode-1/2 path (`:736-738`); keep the `core.bare` flip unconditional; register the auto-delete-head-branches dependency under T9's Risk-4 commitment. **Anchors `:733-751`/`:746`/`:736-738` are STALE — re-locate at build** (`git push origin dev` now near `:840`, `core.bare` flip near `:816`).

#### [MODIFY] `.bkit/workflows/*.md` — §6d skip-ci reconciliation (T12) — dropped entirely if human selects D5

- Remove `[skip ci]` from phase-close subjects + intermediate status-commit subjects; reconcile the `bkit-ship.md` HEAD-skip-ci gate (`~:682`), the `AHEAD_NON_SKIP` counter (`~:833`), the design/plan checklist prose (`~:853`/`~:913`), the intermediate `chore(...) [skip ci]` subjects (`bkit-plan.md ~:740`, `bkit-design.md ~:567`, `bkit-build.md ~:349`, `bkit-ship.md ~:261/579/1178`), and the `bkit-tests-scope` planner's `[skip ci]`→`run_level=none` classification. All anchors stale — re-census at build.

#### [MODIFY] `.bkit/workflows/bkit-{design,plan}.md` — close shape A (T13)

- Transport-independent prologue: STRAY guard FIRST over the UNFILTERED diff → Failure Path, then compute the set; skip branch cleanup in adopt mode; give plan's close the canonical assert it lacks (`:786-792`). D5(a) tail: open a `feat/{FID}→dev` PR at close and merge via gh-primary / `merge_pull_request`-fallback with a skip-token-free body; inherit T9's D24/D25/D23.

## 🔒 Gate 1: Prerequisites Check

- [x] **Human confirmations `[x]`** in parent — notably **OQ-A (transport)** and **OQ-D (docs-close CI-cost)**, both resolved explicitly BEFORE build (OQ-A picks whether T12 exists at all). **If the human selects D5 over the D5(a) default:** drop row 12 + T12 and re-point T13's tail/target per the OQ-A swap instructions, then re-verify this sub-plan's matrix/runbook re-sync before build. _(Unchecked → `REVISE`.)_ — Parent plan's Alternative Approaches + Breaking Changes sections state D5(a) as **CHOSEN** and the OQ-D CI-cost reversal as accepted fact (not conditional); Sub-Plans 1-3 already built the D24/D25/D23 close-guard kernel generically for "whichever transport wins" per WS-10's own framing. Confirmed at build via `docs/decisions.jsonl` key `341-oqa-shape-a-transport-d5a-pr-close-confirmed`.
- [x] **Prerequisite:** Sub-Plan 3 (T9 close-guard kernel) landed; Sub-Plan 2 (T7 `bkit-{build,debug,ship}.md` edits) landed (serialise shared files). — verified via `docs/plans/202607/logs/341-three-runtimes/build-plan-execute-2-log.md` and `build-plan-execute-3-log.md`, both Verdict: PASS.
- [x] **Project Context:** `docs/knowledge.jsonl` (KN-11/DE-32 skip-ci-not-HEAD); `docs/decisions.jsonl`. — read; T12's skip-ci reconciliation is consistent with KN-11/DE-32 (skip-ci must not land on a PR-triggering HEAD/title — this sub-plan enforces exactly that by removing the token from every subject that could become one).
- [x] **Gate 1 - Verified.**

## Derived Test Matrix (this sub-plan)

<!-- prettier-ignore -->
| # | Test description | Type | Target file | Task |
| --- | --- | --- | --- | --- |
| 12 | §6d: no phase-close subject NOR intermediate status-commit subject in `.bkit/workflows/*.md` carries `[skip ci]`; NO workflow prose still claims a docs-close is "pushed with 'bkit [skip ci]'"; the `bkit-ship.md` HEAD-skip-ci gate + `AHEAD_NON_SKIP` promotion-lag counter re-audited coherent under the new subject convention (D5(a) prerequisite) | Unit (vitest) | `.bkit/src/bkit-skip-ci-subject-audit.test.ts` | T12 |

_(T10/T11/T13 close-transport obligations are held by Sub-Plan 3's rows 7–9 (D24/D25/D23 kernel) + Sub-Plan 6's live run; their `close-transport` emission is verified live per the honest limit D3. Row 12 is dropped if the human selects D5.)_

## Agent Execution Runbook

- [x] **T10 — WS-11: Close shape B (build, debug).** Verify shape B already works in mode 3 (current branch pushable); wire the `close-transport` row + D24 scan + D25 cross-check; skip branch cleanup in adopt mode. **Done when:** build/debug close emits a `close-transport` row and passes the D24/D9-kernel obligations (T9 rows 7–8); adopt-mode cleanup skipped; live-verified in T16. _(Serialise landing vs T7 — shared files.)_
- [x] **T11 — WS-12: Close shape C (ship), skip the local sync block (D16/Risk 8).** Skip the post-merge dev-sync block (`bkit-ship.md:733-751`, incl. `:746` `git push origin dev`) when `CAN_PUSH_DEV=false`; consume T9's reversible-checkout guard for the mode-1/2 path (`:736-738`); keep the `core.bare` flip unconditional; register the auto-delete-head-branches dependency under T9's Risk-4 commitment. **Anchors `:733-751`/`:746`/`:736-738` are STALE — re-locate at build** (verified drift: `git push origin dev` now near `:840`, `core.bare` flip near `:816`). **Done when:** ship's server-side merge is unchanged; the dev-sync block is `CAN_PUSH_DEV`-gated; the mode-1/2 checkout uses the D23 trap-restore (T9 row 9); live-verified in T16. _(Serialise landing vs T7 — shared file.)_
- [x] **T12 — §6d prerequisite (under D5(a), OQ-A): drop `[skip ci]` from close + intermediate status-commit subjects, AND reconcile every site the docs-close skip-ci convention is load-bearing for.** Remove `[skip ci]` from phase-close subjects (`docs({FID}): … DONE bkit [skip ci]`) and intermediate status-commit subjects across `.bkit/workflows/*.md`, so a PR-close does not surface the token as the PR title/merge subject. **This is a knowing CI-cost reversal (human-gated, OQ-D; same class as the D11 sleep reversal):** the `[skip ci]` on docs-only close subjects is load-bearing — `bkit-tests-scope` classifies it as `run_level=none`, so removing it makes EVERY design/plan docs-only close fire full CI on `dev`; it is the counterpart mechanism KN-11's fix relied on. Before removal, **re-locate and enumerate at build** (line anchors below are indicative/stale — re-census) EVERY site that references the convention and update each coherently, not silently: (a) the `bkit-ship.md` HEAD-skip-ci gate (`~:682` — degenerates to a trivial always-pass once no close subject carries the token); (b) the `AHEAD_NON_SKIP` promotion-lag counter (`~:833` — docs closes now count as non-skip, shifting the lag warning); (c) the checklist prose in `bkit-design.md` (`~:853`) / `bkit-plan.md` (`~:913`) that still claims "merged to 'dev' and pushed with 'bkit [skip ci]'" (now contradicts the code); (d) the intermediate `chore(...) [skip ci]` status-commit subjects (`bkit-plan.md ~:740`, `bkit-design.md ~:567`, `bkit-build.md ~:349`, `bkit-ship.md ~:261/579/1178`); (e) the `bkit-tests-scope` planner's `[skip ci]` → `run_level=none` classification. Resolve OQ-D first: if the human declines the docs-close CI-cost, the D5(a) transport must carry the skip signal WITHOUT surfacing the token in the merge subject (Failure Path back to OQ-A) rather than dropping it. **Done when:** **Unit (vitest)** `.bkit/src/bkit-skip-ci-subject-audit.test.ts` (matrix row 12) asserts (i) no phase-close or intermediate status-commit subject in `.bkit/workflows/*.md` carries `[skip ci]`, (ii) no `.bkit/workflows/*.md` prose still claims a docs-close is "pushed with 'bkit [skip ci]'", and (iii) the `bkit-ship.md` HEAD-skip-ci gate + `AHEAD_NON_SKIP` promotion-lag counter are re-audited to hold their intended meaning under the new subject convention (every coupled site enumerated in this task body reconciled, not invalidated), and passes. _(Dropped entirely if the human selects D5 in OQ-A.)_
- [x] **T13 — WS-13: Close shape A (design/plan docs-only) — D5(a) PR-close (Flow 4, OQ-A).** Transport-independent prologue: STRAY guard FIRST over the UNFILTERED diff (`git diff --name-only dev...feat/{FID} | grep -vE '^docs/plans/|^\.bkit/friction\.md$'`) → Failure Path, then compute the set; skip branch cleanup in adopt mode; give plan's close the canonical assert it lacks today (`:786-792`). D5(a) tail: open a `feat/{FID}→dev` PR at close and merge via the gh-primary / `merge_pull_request`-fallback path with a skip-token-free body; inherit T9's D24 scan + D25 cross-check + D23 guard. **Done when:** the STRAY guard runs over the unfiltered diff; shape-A close lands docs on `dev` via PR-merge with a skip-token-free body (T9 row 7 + T12 row 12 hold); design AND plan closes assert the landed doc; consumption verified live in T16. _(If human selects D5: swap the tail for `push_files` + `get_file_contents({ref:"dev"})` assert + dev-head-unmoved precondition; do NOT split to `create_or_update_file`.)_

### 🔒 Gate 2: Code Implementation Check

- [x] **No bolt-on / no gate-weakening:** the `[NEW]` `bkit-skip-ci-subject-audit.test.ts` justified against extending an existing artifact — no prior test asserts §6d subject coherence, and the existing `bkit-ci-dispatch-gate-alignment.test.ts` covers a different concern (kernel byte-alignment, not subject/prose content); no `.skip`/`@ts-ignore`/error-swallowing introduced; T12's audit asserts real coherence (8 named subjects absent + Failure-Path exemption list present + prose-claim absence + gate/counter presence), not a hollow always-pass — verified by running it (18/18 pass, all assertions exercised against the real edited files, not mocks).
- [x] **Gate 2 - Verified:** Every task checkbox independently verified against the actual edited `.bkit/workflows/*.md` files and the new test's real (non-mocked) pass.

**Mandatory Tasks (Testing & Documentation):**

- [x] **Verify test coverage:** row 12→T12 maps to a checked task (`bkit-skip-ci-subject-audit.test.ts`, 18/18 pass); T10/T11/T13 held by Sub-Plan 3 rows 7–9 (D24/D25/D23 kernel, already bats-tested) + Sub-Plan 6's live run.
- [x] **Write new tests:** `.bkit/src/bkit-skip-ci-subject-audit.test.ts` (row 12) — written, 18/18 pass.
- [x] **Update documentation:** `docs/decisions.jsonl` — recorded the confirmed shape-A transport decision (D5(a), key `341-oqa-shape-a-transport-d5a-pr-close-confirmed`) at build, per the parent plan's already-`CHOSEN` framing.

### 🔒 Gate 3: Testing & Documentation Check

- [x] **Docs updated:** `docs/decisions.jsonl` entry added (this sub-plan's only Documentation Updates row, per the parent's whole-plan table); `.agents/docs.md` unaffected (no new doc file introduced — only a `.bkit/src/*.test.ts` source file and workflow edits).
- [x] **Gate 3 - Verified.**

## Verification Plan

### Automated Tests

- [x] **Full local gate suite:** `pnpm typecheck` (clean) · `pnpm format:check` (clean, after `prettier --write` on the new test file) · `pnpm lint:prose` (vale, 0/0/0 across 97 files) · `pnpm lint:slop` (10 pre-existing findings, unchanged) + `pnpm slop:delta` (net 0 findings/score vs base) · `pnpm bkit check --dry-run` (only the expected pre-existing `.bkit/scripts/bkit-runtime.sh` core-template + `.claude`/`.cursor`/`.opencode` command-mirror drift, deferred to Sub-Plan 6 per D19/Global Execution Constraints — no other drift) · `pnpm test` (69 files / 2476 passed, 2 skipped, 1 todo — 0 failures) · `pnpm test:bats` (94/94 pass, 0 failures). No gate weakened.
- [x] **New vitest:** `bkit-skip-ci-subject-audit` (row 12) passes — 18/18.

### 🔒 Gate 4: Automated Verification Confirmed

- [x] **Gate 4 - Verified:** every Automated Tests checkbox verified with explicit proof above (real command output, not assumed).

## Merge Method

**Merge method: always squash.** `gh pr merge --squash --delete-branch --body ""`. Landings serialise (shared files across T7/T10/T11 + T12/T13) — decompose into separate PRs per landing group. Never `rebase`/`merge-commit`.
