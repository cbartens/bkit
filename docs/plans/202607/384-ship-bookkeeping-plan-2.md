Verdict: PASS
<!-- verdict:end -->

# Sub-Plan 2 — Hardening, Prose Rewrite & Mirrors (Implementation Plan)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this `plan.md` natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

**Parent Plan:** `docs/plans/202607/logs/384-ship-bookkeeping/384-ship-bookkeeping-plan.md` (parent index) · `plan-v3-checked.md` (full checked plan, full feature context).
**Design (source of truth):** `docs/plans/202607/384-ship-bookkeeping-design.md` (appended in `plan-input.md`).
**FID:** `384-ship-bookkeeping` · **ISSUE:** cbartens/bkit#384 · **Sub-plan:** 2 of 3.

> [!IMPORTANT]
> **This sub-plan is self-contained.** The design slice its tasks depend on is re-stated below. Full Acceptance Scenario / Success Criteria / Breaking Changes / Open Questions / Out-of-Scope / Rollback live in `plan-v3-checked.md` (inherited as confirmed). No DB / no Vercel / Supabase / Inngest — bkit meta-repo.

## Context & Goals (this slice)

This sub-plan hardens the Failure Path and Step 12 underneath the rewrite, mirrors the gate into both homes (dogfood), rewrites `bkit-ship.md` to the verify → base-check → integrate → re-validate → merge gate → merge → close shape (turning the Tier-2 invariant test GREEN), and regenerates the rendered mirrors + `workflows.md` step table. It ends with: **new ship workflow live across all mirrors + Tier-2 invariant GREEN.**

The rewrite is the spine of the change — findings dissolve structurally rather than each needing a conditional. The RED→GREEN Tier-2 invariant (from Sub-plan 1, Task 3) is the central quality mechanism: a half-applied rewrite carrying both the head-mutating and frozen-head model is worse than either, and the red test is the only thing that makes it visible. This sub-plan is the **sole session** that turns the invariant GREEN, which is exactly why it is split out from the other 11 tasks.

**Tasks in this sub-plan:** 5, 6, 7, 8 (original IDs preserved; cross-task references keep original numbers).

---

## Design Slice — Decisions This Sub-Plan Owns

### Ship's shape (the rewrite target)

```
1  start          -> resolve BOOK_ROOT + BOOK_PATHS once; create outbox; record them
                     (dev lock taken only around the dev-tree write, then released)
2  verify PR      -> read PR head SHA (ENTRY_HEAD), mergeable state; NO local rebase
3  base check     -> git merge-base --is-ancestor origin/dev origin/feat/{FID}
                       ancestor      -> Path A  -> step 6
                       not ancestor  -> Path B  -> step 4
4  integrate      -> B1 mergeable:    gh pr update-branch
                     B2 conflicting:  worktree + @bkit-ship-conflict-resolve + push --force-with-lease
                     non-mechanical:  handover
5  re-validate    -> IF current head != ENTRY_HEAD: unconditional gh workflow run, then bounded poll
                     (no dev lock held across the wait — writes go to the outbox)
6  merge gate     -> bkit-ship-gate.sh assert <current head>   (the ONLY merge precondition)
6b merge          -> gh pr merge --squash --match-head-commit <gate head>. No update-branch here.
7+ close          -> docs, summary, re-acquire dev lock, flush outbox,
                     one path-scoped [skip ci] commit + push, release lock
```

**Three deletions ride along** (each exists only to compensate for the incompatibility being removed): ship's unconditional rebase-on-resume (four other phases keep theirs — none gate on head match); Step 3's prior-run diffing; Step 8's `Update: Source files.` retry loop (code-level failures route back to build).

### `BOOK_ROOT` resolution (load-bearing rule that unblocks 384 from #341)

`BOOK_ROOT` resolution MUST spell out the `CAN_PUSH_DEV`/`RUNTIME_DEVPUSHES` conditional explicitly in Step 1 (review-1 m4):

- `RUNTIME_DEVPUSHES=true` (worktree present, modes 1–2) → `BOOK_ROOT=$REPO_ROOT` (dev tree).
- `RUNTIME_DEVPUSHES=false` (mode 3, cloud) → `BOOK_ROOT` = current working branch / adopt tree, bookkeeping lands with the phase-close PR per #341 shape A.

Must be an explicit bullet in Step 1's prose, not only in the Edge Cases appendix (Sub-plan 1 Task 3's Tier-2 presence check asserts it mechanically). The live mode-3 E2E is deferred (Sub-plan 3, Task 11).

### Re-validation keyed on observed head movement

Trigger: current PR head differs from `ENTRY_HEAD` — an observed fact, not a path label (also covers head moves ship did not cause). Dispatch is **unconditional** `gh workflow run` after any head move (CONFLICTING PRs fire nothing by construction — PR #720 `total_count 0`; buried `[skip ci]` poisons push-triggered dispatch identically). Poll bounded by **attempt cap AND elapsed cap**, `timeout`-wrapped, jittered backoff; **timeouts sourced from `bkit-ship-timeouts.sh` (`SHIP_CI_WAIT_TIMEOUT_S`, `SHIP_POLL_INTERVAL_S`, `MAX_MERGE_ATTEMPT`) — NOT re-hardcoded as bare numeric literals** (review-3 m2: prevents a third source of truth drifting). Sample `gh api rate_limit` before loop; write status row before exiting on either cap.

### Merge gate + `--match-head-commit`

Step 6 writes pre-merge snapshot (PR head SHA, `origin/dev` SHA, ancestor verdict, capstone run id + URL, `mergeable`, gate exit code) to outbox BEFORE merge fires; calls `bkit-ship-gate.sh assert --head <current>`; branches on exit code with a `status.jsonl` row per refusal. Step 6b `gh pr merge --squash --match-head-commit <gate head>` and nothing else — no `update-branch` here; a rejected `--match-head-commit` routes back to re-validation. The assertion and the merge are one decision; `--match-head-commit` makes SC 1 mechanically true (server refuses the merge when the head moved, atomically, inside the merge call).

### Outbox + dev-lock windowing

Outbox at `$(git rev-parse --path-format=absolute --git-common-dir)/bkit-outbox/{FID}/` (outside every worktree; survives Step 12 `worktree remove`). The dev lock covers dev-tree write windows only (Step 1 start row + Step 13 flush); released across the CI wait. Steps 7+ re-acquire dev lock, flush outbox, one **path-scoped `[skip ci]` commit + push** to dev, release lock. Release + re-acquire emit status rows; handover on failed re-acquire (never silent unlocked flush).

### Failure Path + `.deferred-blocked` + Step 12 ownership (Task 5)

1. **Write the sentinel** — `@bkit-ship-deferred-sweep` returning FAIL touches `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.deferred-blocked` (reader `:114` + `rm -f` `:67` already exist; only the writer is missing). Without it Failure Path step 4's condition can never be true — a sweep FAIL falls through to a bare STOP.
2. **One tree** — Failure Path reads `BOOK_ROOT` like every other step (not `--git-common-dir`).
3. **Order the append after the abort** — today `:61` appends, `:62` aborts (mid-rebase abort discards the append).
4. **Drop silent-failure idiom** — `git rebase --abort 2>/dev/null || true` + six `2>/dev/null || true` git calls at `:79-82`; sweep every close/failure route that depended on a silenced call being non-fatal.
5. **Step 12 ownership** — scope `worktree remove --force` to worktrees this run created; ownership bit written at creation time to outbox AND `status.jsonl` row; absent-default = "not mine". Leave design/plan/build/debug worktree conventions untouched.

### Distribution: the gate script is two files (Task 6)

`.bkit/scripts` is excluded from the npm `files` list — consumers receive scripts from `.bkit/templates/.bkit/scripts/`; the root copy is the dogfood mirror. `bkit-ship-gate.sh` + `bkit-ship-timeouts.sh` are byte-identical pairs, enforced by the templates-content snapshot + `bkit-dogfood-noop.integration.test.ts`. `bkit check` reports a partially-applied upgrade. **Task 6 is the SOLE owner of the `bkit-dogfood-noop.integration.test.ts` extension** (Tasks 1+4 from Sub-plan 1 satisfy byte-identity via manual `diff`; Task 6 automates the property for both new scripts).

---

## Predecessor Verification (Seam 1 — before Task 5 starts)

> [!CAUTION]
> **Re-verify Sub-plan 1's outputs landed.** Do NOT assume. If any check fails, Sub-plan 1 is incomplete — halt and surface to orchestrator (do not proceed into the rewrite on an unproven gate).

- [ ] **Tested gate present:** `.bkit/scripts/bkit-ship-gate.sh` AND `.bkit/templates/.bkit/scripts/bkit-ship-gate.sh` exist; `pnpm test:bats tests/ship-gate.bats` passes all 10 cases (Sub-plan 1 Task 4).
- [ ] **Tier-2 invariant RED:** `.bkit/src/bkit-ship-invariants.test.ts` exists and FAILS against current `bkit-ship.md` (Sub-plan 1 Task 3) — canonical 14 step-key set + frozen 8-path `BOOK_PATHS` published in the test.
- [ ] **Config present:** `bkit.capstoneJob` / `bkit.ciWorkflow` in `package.json`; `.bkit/scripts/bkit-ship-timeouts.sh` exists (Sub-plan 1 Task 1).
- [ ] **Stub harness present:** `tests/fixtures/gh/bin/gh` executable; fixture corpus present (Sub-plan 1 Task 2).

---

## Architecture & Component Changes (this slice)

### Workflow prose

#### [MODIFY] `.bkit/workflows/bkit-ship.md` (structural rewrite) — Task 7

- **Existence Check:** Exists; 1278 lines, post-#341 (review-3 m4).
- **Change:** Rewrite to verify → base-check → integrate → re-validate → merge gate → merge → close shape (full detail in the Design Slice above). **Tier-2 invariant test is RED before this task starts and GREEN after it.**

#### [MODIFY] `.bkit/workflows/bkit-ship.md` Failure Path block — Task 5

- **Existence Check:** lines 56–139.
- **Change:** Add `.deferred-blocked` writer on `@bkit-ship-deferred-sweep` FAIL. Read `BOOK_ROOT` (not `--git-common-dir`). Order `git rebase --abort` before status append. Remove six `2>/dev/null || true` silencings; sweep close/failure routes that depended on a non-fatal silenced call.

#### [MODIFY] `.bkit/workflows/bkit-ship.md` Step 12 block — Task 5

- Scope `worktree remove --force` to worktrees this run created; ownership bit in outbox + status row; absent-default = "not mine".

#### [MODIFY] `.bkit/workflows.md` — Task 8

- **Existence Check:** 1288 lines.
- **Change:** Step table for ship re-sectioned. `.deferred-blocked` contract at `:531`/`:751` now has a writer to point at. Add Tier-1/Tier-2/Tier-3 carrier explanation + `BOOK_ROOT`/`BOOK_PATHS`/outbox to the ship subsection.

### Rendered mirrors (Task 8 — regeneration only, via `bkit install`)

- `.claude/commands/bkit-ship.md` (byte-identical)
- `.cursor/commands/bkit-ship.md` (T1/T2/T3 transformed)
- `.opencode/commands/bkit-ship.md`
- Templates-content snapshot (enforces byte-identical dogfood mirror)

### Tests (this slice)

- `bkit-dogfood-noop.integration.test.ts` extended for both new scripts (`bkit-ship-gate.sh`, `bkit-ship-timeouts.sh`) — **Task 6 sole owner** (scope-check-1 MAJOR-1).
- `tests/ship-failure-path.bats` (Task 5, sub-concern I) + `tests/ship-worktree-ownership.bats` (Task 5, sub-concern II).

---

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work autonomously. No pause for user permission at the SP2 Gate. Check `[x]` tasks as you go.
> **Blockers:** Task incomplete → create tracker issue (label `blocker`) before stopping.
> **Never drop work silently:** append deferred/out-of-scope to `docs/deferrals.jsonl`, bugs to `docs/failures.jsonl` (check existing entries first).
> **Step Isolation:** Complete each task fully before the next in its dependency chain. Task 5 + Task 6 both depend on Sub-plan 1 outputs and MAY run in parallel; Task 7 depends on Tasks 4 (SP1), 5, 3 (SP1); Task 8 depends on Tasks 7 + 5.

- [ ] **Task 5 — WS-8: Failure Path + Worktree Hardening (lands before prose rewrite).** _(Scope-check-1 MINOR-1: this task bundles two distinct hardening areas of `bkit-ship.md` — (I) Failure Path and (II) Step 12 worktree ownership — both grouped under design WS-8 as "ship hardening underneath the rewrite"; each produces its own bats file so neither sub-concern is lost. Delineation below is explicit.)_ **(I) Failure Path** — three fixes in the current `bkit-ship.md` Failure Path block: (a) add `.deferred-blocked` writer — `@bkit-ship-deferred-sweep` returning FAIL touches `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/.deferred-blocked` (reader at `:114` and `rm -f` at `:67` already exist); (b) make Failure Path read `BOOK_ROOT` like every other step rather than resolving `--git-common-dir`; (c) order the status append AFTER `git rebase --abort`, not before. Remove the silencing idiom — the silenced `rebase --abort` plus six `2>/dev/null || true` git calls at `:79-82`. Sweep every close and failure route that may have depended on one of those calls being non-fatal. **(II) Step 12 worktree ownership** — scope Step 12's `worktree remove --force` to worktrees this run created — ownership bit written at creation time to outbox AND `status.jsonl` row, absent-default = "not mine". Explicitly leave design/plan/build/debug worktree conventions untouched. Add `tests/ship-failure-path.bats` (sub-concern I) + `tests/ship-worktree-ownership.bats` (sub-concern II). **Dependencies:** Task 4 (gate, per design ordering), Task 3 (BOOK_ROOT contract — the name published by the WS-6 invariant test, available before the prose rewrite in Task 7). Per design `WS-8 → [WS-4, WS-6]` = Task 4 + Task 3 (review-2 M1: the prior "Task 6 contract" label pointed at WS-5 Gate Distribution, which is unrelated to `BOOK_ROOT`). **Done when:** `pnpm test:bats tests/ship-failure-path.bats` passes (append ordered after abort; BOOK_ROOT honoured; no silencing); `pnpm test:bats tests/ship-worktree-ownership.bats` passes (ownership bit absent → no removal; present → removal fires; bit survives simulated crash); `grep -c '2>/dev/null || true' .bkit/workflows/bkit-ship.md` is reduced from baseline by at least 6 (the six identified silencings removed); `.deferred-blocked` writer wired into `@bkit-ship-deferred-sweep` prompt description in `.bkit/workflows.md`.

- [ ] **Task 6 — WS-5: Gate Distribution / Dogfood Mirroring.** Confirm `bkit install` / `bkit upgrade` place `bkit-ship-gate.sh` and `bkit-ship-timeouts.sh` in both homes (`.bkit/scripts/` root copy + `.bkit/templates/.bkit/scripts/` template copy), that the executable bit survives templating, and that `bkit check` reports a partially-applied upgrade (delete one of the pair, run `bkit check`, expect drift). Enforce byte-identity via the templates-content snapshot and `bkit-dogfood-noop.integration.test.ts` — **Task 6 is the SOLE owner of the `bkit-dogfood-noop.integration.test.ts` extension** (scope-check-1 MAJOR-1: Tasks 1 and 4 now satisfy their byte-identity Done-when via manual `diff` so their checkboxes are runnable before Task 6 lands; Task 6 is what automates the property into the integration test for both new scripts). **Dependencies:** Task 1, Task 4. **Done when:** `pnpm test bkit-dogfood-noop` passes for both new scripts; manual `bkit check` after deleting `.bkit/scripts/bkit-ship-gate.sh` reports drift; `ls -l .bkit/scripts/bkit-ship-gate.sh .bkit/templates/.bkit/scripts/bkit-ship-gate.sh` shows both executable; `diff` between the pair is empty.

- [ ] **Task 7 — WS-7: `bkit-ship.md` Structural Rewrite (Tier-2 invariant test turns GREEN).** Rewrite `.bkit/workflows/bkit-ship.md` to the design's shape: Step 1 resolves `BOOK_ROOT` + `BOOK_PATHS`, creates outbox at `$(git rev-parse --path-format=absolute --git-common-dir)/bkit-outbox/{FID}/`, writes `ship-start-workflow` row to `BOOK_ROOT`, preflights `actions: write` once. **`BOOK_ROOT` resolution MUST spell out the `CAN_PUSH_DEV`/`RUNTIME_DEVPUSHES` conditional explicitly in Step 1 (review-1 m4):** `RUNTIME_DEVPUSHES=true` (worktree present, modes 1–2) → `BOOK_ROOT=$REPO_ROOT` (dev tree); `RUNTIME_DEVPUSHES=false` (mode 3, cloud) → `BOOK_ROOT` = current working branch / adopt tree, bookkeeping lands with the phase-close PR per #341 shape A. This is the load-bearing rule that unblocks 384 from #341; it must be an explicit bullet in Step 1's prose, not only in the Edge Cases appendix (Task 3's Tier-2 presence check asserts it mechanically). Steps 2–3 read `ENTRY_HEAD` + `mergeable`, classify via `git merge-base --is-ancestor origin/dev origin/feat/{FID}` — Path A → Step 6; Path B → Step 4. Step 4 Path B only: B1 `gh pr update-branch`; B2 worktree + `@bkit-ship-conflict-resolve` + `git push --force-with-lease`; non-mechanical → handover. Step 5 re-validates on observed head movement (current head != `ENTRY_HEAD`, not path label): unconditional `gh workflow run ci.yml --ref feat/{FID}`, bounded poll under attempt cap AND elapsed cap **sourced from `bkit-ship-timeouts.sh` (`SHIP_CI_WAIT_TIMEOUT_S`, `SHIP_POLL_INTERVAL_S`, `MAX_MERGE_ATTEMPT`) — NOT re-hardcoded as bare numeric literals** (review-3 m2: prevents a third source of truth drifting), `timeout`-wrapped, jittered backoff, sample `gh api rate_limit` before loop, write status row before exiting on either cap. Step 6 writes pre-merge snapshot (PR head SHA, `origin/dev` SHA, ancestor verdict, capstone run id + URL, `mergeable`, gate exit code) to outbox BEFORE merge fires, calls `bkit-ship-gate.sh assert --head <current>`, branches on exit code with a `status.jsonl` row per refusal carrying that code. Step 6b `gh pr merge --squash --match-head-commit <gate head>` and nothing else — no `update-branch` here; a rejected `--match-head-commit` routes back to re-validation. Steps 7+ re-acquire dev lock, flush outbox, one path-scoped `[skip ci]` commit + push to dev, release lock. Implement dev-lock windowing with status rows on release + re-acquire; handover on failed re-acquire (never silent unlocked flush). Carry the three deletions (rebase-on-resume, Step 3 prior-run diffing, Step 8 `Update: Source files.` with code-level failures routing back to build). **Preserve Task 5's Failure Path block intact (review-2 MINOR 4):** the rewrite consumes the `.deferred-blocked` writer under `BOOK_ROOT`, abort-before-append ordering, removed silencings, and Step 12 ownership scoping from Task 5 — keep that block; Task 3's Tier-2 invariant test asserts these properties and will go RED if dropped, but state it explicitly so a from-scratch rewrite does not waste a cycle rediscovering Task 5's fixes. **Dependencies:** Task 4 (gate proven), Task 5 (Failure Path hardened underneath), Task 3 (Tier-2 invariant test RED, turns GREEN). **Done when:** `.bkit/src/bkit-ship-invariants.test.ts` turns GREEN against the rewritten `bkit-ship.md` (Tier-2 invariants hold, including the positive `BOOK_PATHS` 8-path presence + `CAN_PUSH_DEV`-conditional `BOOK_ROOT` presence); `grep -c 'git add -A' .bkit/workflows/bkit-ship.md` = 0; every `gh pr merge` line carries `--match-head-commit`; dev-lock release + re-acquire status rows present; the rewritten shape matches verify → base-check → integrate → re-validate → merge gate → merge → close; no bare numeric timeout literal outside the `SHIP_*` sourcing line; `BOOK_ROOT` referenced at every status write site; canonical 14 `ship-*` step keys present (set published in Task 3's test); `pnpm slop:delta` stays green (no net-new prose findings); `pnpm lint:prose` stays green.

- [ ] **Task 8 — WS-9: Rendered Mirrors + Workflow Index Regeneration.** Regenerate all derived surfaces in one pass via `bkit install`: `.claude/commands/bkit-ship.md` (byte-identical), `.cursor/commands/bkit-ship.md` (transformed), `.opencode/commands/bkit-ship.md`, templates-content snapshot. Re-section `.bkit/workflows.md`'s ship step table; ensure the `.deferred-blocked` contract at `:531`/`:751` now has a writer to point at. **Preserve Task 5's `.deferred-blocked` writer wire-in** (scope-check-1 MINOR-2: Task 5 wires the writer into the `@bkit-ship-deferred-sweep` prompt; Task 8 re-sections the step table — sequential additive edits to non-overlapping sections of the same file; Task 8's re-section MUST NOT drop Task 5's prompt edit, mirroring the pattern Task 7 uses for Task 5's Failure Path block at review-2 MINOR 4). Confirm `<!-- bkit:managed vX.Y.Z -->` markers are restamped. **Dependencies:** Task 7, Task 5. **Done when:** `bkit install` exits 0; `bkit check` reports no `bkit-rendered-prompts-stale` drift; `diff .bkit/workflows/bkit-ship.md .claude/commands/bkit-ship.md` is empty (byte-identical); `.bkit/workflows.md` ship section reflects new step numbers and references `.deferred-blocked` writer.

### 🔒 SP2 Gate: Hardened Rewrite + Byte-Identical Mirrors

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, hand off to Sub-plan 3 (`384-ship-bookkeeping-plan-3.md`).

- [ ] **No bolt-on / no gate-weakening:** rewrite preserves Task 5's hardening (review-2 MINOR 4); no `as any` / `@ts-ignore` / `.skip` / empty `catch` / error-swallowing introduced to make a gate pass. No regression in the Tier-1 carrier (`tests/ship-gate.bats` still GREEN).
- [ ] **Tier-2 invariant GREEN:** `.bkit/src/bkit-ship-invariants.test.ts` PASSES against rewritten `bkit-ship.md` — the RED→GREEN transition proves the rewrite is complete, not half-applied (central quality mechanism).
- [ ] **Hardening landed:** `tests/ship-failure-path.bats` + `tests/ship-worktree-ownership.bats` GREEN; `.deferred-blocked` writer wired; six silencings removed; Step 12 ownership-scoped.
- [ ] **Dogfood mirroring:** `pnpm test bkit-dogfood-noop` GREEN for both new scripts (Task 6 sole owner); `bkit check` reports drift on partial deletion.
- [ ] **Mirrors byte-identical:** `diff .bkit/workflows/bkit-ship.md .claude/commands/bkit-ship.md` empty; `bkit check` reports no `bkit-rendered-prompts-stale`.
- [ ] **SP2 - Verified:** Every checkbox above independently verified. Tasks 5–8 all `[x]`.

## Verification Plan (SP2)

### Automated Tests

- [ ] **bats suite (this slice):** `pnpm test:bats tests/ship-failure-path.bats tests/ship-worktree-ownership.bats` pass; `tests/ship-gate.bats` still GREEN (no Tier-1 regression).
- [ ] **Unit suite (this slice):** `.bkit/src/bkit-ship-invariants.test.ts` GREEN against rewritten `bkit-ship.md` (the RED→GREEN proof).
- [ ] **Integration:** `pnpm test bkit-dogfood-noop` GREEN for both new scripts.
- [ ] **Full gate suite:** `pnpm typecheck && pnpm test && pnpm format:check && pnpm lint:prose && pnpm slop:delta && pnpm test:bats && pnpm bkit check` all green. Do NOT weaken any gate to pass.
- [ ] **Test Synchronization:** `bkit-counter-prose-audit.test.ts` updated for any new ship step-key references (verify cross-check still passes); `bkit-ci-dispatch-gate-alignment.test.ts` unaffected (CI-Dispatch gate is build/debug; ship uses the new gate).

> [!IMPORTANT]
> **No Architectural Downgrades:** If build/test errors surface, NEVER resolve via hot fixes or anti-patterns. Halt and follow `docs/architecture.md` + `docs/knowledge.jsonl`.

### Hand-off to Sub-plan 3

This sub-plan's outputs are **Seam 2** for Sub-plan 3 (`384-ship-bookkeeping-plan-3.md`):

- Rewritten `bkit-ship.md` (Tier-2 invariant GREEN) — Sub-plan 3 Task 10 parses it for the detector's expected set.
- Byte-identical mirrors + re-sectioned `workflows.md` — Sub-plan 3 Task 9 references the final workflow shape in docs.
- Hardened Failure Path + `.deferred-blocked` writer — Sub-plan 3 Task 11 E2E validates the deferred-sweep FAIL → handover route.

Sub-plan 3's first action re-verifies these landed before proceeding.

## Merge Method

**Merge method: always squash.** This sub-plan's commits land as part of the single squash-merged PR to `dev` (see `plan-v3-checked.md` § Merge Method).
