Verdict: PASS
<!-- verdict:end -->

# Sub-Plan 1 — Foundations & Tier-1 Gate (Implementation Plan)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this `plan.md` natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

**Parent Plan:** `docs/plans/202607/logs/384-ship-bookkeeping/plan-v4-split.md` (parent index) · `plan-v3-checked.md` (full checked plan, full feature context).
**Design (source of truth):** `docs/plans/202607/384-ship-bookkeeping-design.md` (appended in `plan-input.md`).
**FID:** `384-ship-bookkeeping` · **ISSUE:** cbartens/bkit#384 · **Sub-plan:** 1 of 3.

> [!IMPORTANT]
> **This sub-plan is self-contained.** The design slice its tasks depend on is re-stated below so it does not depend on sibling sub-plans for context. The full Acceptance Scenario, Success Criteria, Breaking Changes, Open Questions, Out-of-Scope and Rollback live in `plan-v3-checked.md` and are inherited as confirmed (Gate 1 human-review sections are feature-level, already confirmed). No DB / no Vercel / Supabase / Inngest — bkit meta-repo.

## Context & Goals (this slice)

This sub-plan lands the **serialisation carve-out, the configuration surface, the `gh` stub harness, the Tier-2 invariant test (RED), and the tested Tier-1 merge gate**. It is the direct antidote to `01f8b8d9` (worktree model and head-match gate landed in one commit, neither reviewed against the other): the gate and its bats suite land first, proven against captured fixtures, before any prose is rewritten (the rewrite is Sub-plan 2). It ends with: **tested gate GREEN + Tier-2 invariant RED** (ready for Sub-plan 2 to turn the invariant GREEN).

Success Criterion 1 (the merge call refuses a head other than the validated one) rests primarily on the Tier-1 carrier this sub-plan builds. Task 2's `gh` stub harness is the plan's **single cost hinge** — a NO-GO halts the whole plan.

**Tasks in this sub-plan:** 0, 1, 2, 3, 4 (original IDs preserved; cross-task references below keep their original numbers).

---

## Design Slice — Decisions This Sub-Plan Owns

These are the load-bearing design decisions the tasks below implement, re-stated here so the sub-plan is independently buildable. Verbatim from the design (`docs/plans/202607/384-ship-bookkeeping-design.md`).

### Tiered carriers (the organising choice)

All seven findings reduce to one defect class — a load-bearing rule that lives only in prose, that no gate can check. This sub-plan builds **Tier 1** (the merge gate → tested executable) and **Tier 2's defender** (the vitest invariant test, RED before the rewrite). Tier 3 (advisory detector) is Sub-plan 3.

- **Tier 1 — merge gate:** capstone present + `success` at the current PR head. Failure is **unrecoverable** (`ci.yml:130-131` gives merged-PR dev pushes only `run_level=light`). Carrier: `.bkit/scripts/bkit-ship-gate.sh` + `tests/ship-gate.bats` against captured `gh` JSON.
- **Tier 2 — push contract / staging / step keys:** recoverable but silently drifting. Carrier: prose in `bkit-ship.md`, mechanically constrained by a vitest markdown-invariant test (`stripFencedBlocks` reused).

### Configuration, not literals

`bkit-tests-check` is hard-coded in `docs/deployments.md`, in `bkit-protect-main.sh`, and would be a third copy in the gate. The CI workflow filename is the same class of literal. Both resolve from `package.json` (read by `jq`, survive `stripManagedKeys` because it touches only `scripts` + `devDependencies`):

<!-- prettier-ignore -->
| Key | Default | Read by |
| --- | --- | --- |
| `bkit.capstoneJob` | `bkit-tests-check` | gate; `bkit-protect-main.sh` |
| `bkit.ciWorkflow` | `ci.yml` | gate's run-selection query |

**Config-home rule:** `.bkit/scripts/*` is Tier 1 (bkit-owned, force-overwritten on `bkit upgrade`) — anything a consumer may tune lives in `package.json`; only bkit-owned defaults live in a managed config script. Timeouts/limits are bkit-owned → one managed config script (`bkit-ship-timeouts.sh`) with units in identifiers, matching the `bkit-counter-bus-config.sh` precedent.

### Run selection (decided before exit codes can mean anything)

A head SHA legitimately carries several runs. Query `GET /repos/{o}/{r}/actions/workflows/{ciWorkflow}/runs?head_sha=<sha>` (workflow-scoped, NOT repo-wide), then select the **most recent `completed` run of that workflow**. If runs exist but none completed → "in progress" (code 11), not "absent".

### Gate exit codes — one per condition, never collapsed

<!-- prettier-ignore -->
| Code | Condition | Merge |
| --- | --- | --- |
| 0 | Capstone present in selected run, concluded `success` | proceed |
| 10 | No run of the CI workflow exists at head | refuse |
| 11 | Runs exist at head but none completed | refuse (caller may poll) |
| 12 | Selected run concluded failure | refuse |
| 13 | Selected run exists but capstone job **absent** | refuse — never vacuous pass |
| 14 | Green run exists, but at a **superseded** SHA | refuse, print both SHAs + run URL |
| 15 | Selected run concluded `cancelled` | refuse — "dispatch, do not push" |
| 16 | Capstone green but a lane concluded `skipped` (not full) | refuse — vacuous green |
| 20 | API error / rate limit / auth | refuse, **distinct from "no run"** |

Codes 10–16 mean "not validated". Code 20 means "unknown". Conflating them lets a degraded API read as an unvalidated head, and lets an unvalidated head read as an API blip. Distinguish a `skipped` lane (code 16) from a `cache_skip` sentinel green (code 0 + `--explain` note) — the SHA-cache short-circuit is keyed to the exact commit SHA and is sound.

### `BOOK_ROOT` / `BOOK_PATHS` — the two named conventions

```
BOOK_ROOT   = the single tree every status/artifact write in this run targets.
              Resolved once in Step 1. A single variable cannot resolve to two trees
              (Finding 4 dissolves). Value selected by #341's CAN_PUSH_DEV
              (worktree present ⇒ true, modes 1–2 ⇒ dev tree; mode 3 ⇒ adopt tree).
              Prose resolution is enforced by Task 3's presence check; the live
              mode-3 E2E is deferred (Sub-plan 3, Task 11).

BOOK_PATHS  = the staging allow-list, expanded literally into every git add:
              docs/plans/{YYYYMM}/logs/{FID}/
              docs/completed.md docs/deferrals.jsonl docs/failures.jsonl
              docs/knowledge.jsonl docs/decisions.jsonl .bkit/friction.jsonl
              .agents/skills skills-lock.json
              Never `-A`. Never a bare `docs/`.
```

**Push-timing invariant (the design's sharpest departure, decouples 384 from #341):** no ship bookkeeping commit reaches `origin/feat/{FID}` before the merge. True in every runtime; `BOOK_ROOT`'s value is a runtime detail.

### Canonical `ship-*` step keys — stable schema

Step **numbers** may move; **keys** may not. Renaming resets attempt counters across three repos and orphans the Tier-3 detector corpus. Publishing the set makes Finding 7 (invented names) detectable:

```
ship-start-workflow      ship-worktree-setup      ship-regression-guard
ship-conflict-resolve    ship-deferred-sweep      ship-merge-pr
ship-failure-diagnose    ship-failure-remediate   ship-switch-to-dev
ship-update-docs         ship-summary             ship-prune-skills
ship-worktree-cleanup    ship-close-workflow
```

### #341 serialisation

#341 (CLOSED, merged `d64ef5be`) ship-touching workstreams have landed. 384 re-derives against the post-#341 `bkit-ship.md`. Ship is the documented exception that does NOT call `bkit_close_guard_checkout` (its EXIT trap would undo staying on `dev` for Steps 10–13); the kernel exists for the other phases.

### Cost hinge (Risk 12, recalibrated)

The `gh` stub harness **reuses the existing PATH-shim idiom** (`tests/bkit-runtime.bats:44-58` writes a fake `gh` to `FAKE_BIN`, `chmod +x`, prepends to `PATH`). The genuinely-new piece is **fixture-file dispatch** (argv → JSON file under `tests/fixtures/gh/`). Cheaper than "first-of-its-kind" — but a NO-GO still removes SC 1's primary carrier and halts the whole plan.

---

## Architecture & Component Changes (this slice)

Per `docs/architecture.md` topology (`.bkit/scripts/` = Tier-1 force-overwritten; `.bkit/src/` = install engine + tests; `tests/` = bats + fixtures). **CRITICAL:** no `as any` / `@ts-ignore` / `.skip` / empty `catch` to make a gate pass. **CRITICAL:** `bkit-ship-gate.sh` + `bkit-ship-timeouts.sh` are byte-identical pairs (root + template); Tasks 1 & 4 satisfy byte-identity via manual `diff` (Task 6 / Sub-plan 2 automates it into the integration test — sole owner).

### Shell scripts

#### [NEW] `.bkit/scripts/bkit-ship-gate.sh` + `.bkit/templates/.bkit/scripts/bkit-ship-gate.sh` (byte-identical pair) — Task 4

- **Existence Check:** Does not exist. Closest `gh`-calling script is `bkit-protect-main.sh` (uncovered by bats, one-shot branch-protection setup). Different responsibility; cannot be evolved without rewriting its contract.
- **Why new:** Ship's merge gate is the last load-bearing rule of its class (failure unrecoverable) living only in prose. Same shape as routing (`bkit-status-route.sh`) and counting (`bkit-counter-bus.sh`); the last piece uncovered.
- **Contract:** `assert --head <sha> [--capstone <job>] [--workflow <file>] [--repo <o/r>] [--explain]`. Workflow-scoped SHA-keyed query; select most recent `completed` run; read `/actions/runs/{id}/jobs --paginate`; one exit code per condition (0/10/11/12/13/14/15/16/20). Diagnostics on stderr behind `[bkit-ship-gate]`. `BKIT_SHIP_GATE_OVERRIDE=<sha>` honoured only when equals refused head; gate appends its own override `status.jsonl` row. Samples `gh api rate_limit` for code-20 message.

#### [NEW] `.bkit/scripts/bkit-ship-timeouts.sh` + `.bkit/templates/.bkit/scripts/bkit-ship-timeouts.sh` (byte-identical pair) — Task 1

- **Existence Check:** Does not exist. `bkit-counter-bus-config.sh` is the precedent for bkit-owned-defaults config.
- **Contract:** `SHIP_CI_WAIT_TIMEOUT_S`, `SHIP_POLL_INTERVAL_S`, `SHIP_DEV_LOCK_STALE_S`, `SHIP_DEV_LOCK_ACQUIRE_DEADLINE_S`, `MAX_MERGE_ATTEMPT` — units in identifiers.

#### [MODIFY] `.bkit/scripts/bkit-protect-main.sh` + `.bkit/templates/.bkit/scripts/bkit-protect-main.sh` — Task 1

- **Existence Check:** Exists; `REQUIRED_JOB="bkit-tests-check"` hard-coded at line 38.
- **Change:** Read `bkit.capstoneJob` from `package.json` via `jq -r '.bkit.capstoneJob // "bkit-tests-check"'`. Retires the third copy.

### Tests

#### [NEW] `tests/fixtures/gh/` corpus + fixture-file dispatch layer on the existing PATH-shim `gh` — Task 2

- **Existence Check:** The PATH-shimmed-`gh` idiom is NOT new (`bkit-runtime.bats:44-58`). The genuinely-new piece is fixture-file dispatch (argv → JSON file under `tests/fixtures/gh/`).
- **Corpus (7 + 1):** green capstone at head; capstone absent; failed run; in-progress run; superseded green; PR #720 `total_count 0` (CONFLICTING); cache-skipped green with `cache_skip` sentinel; plus an API-error fixture for code-20 distinction.

#### [NEW] `tests/ship-gate.bats` — Task 4

- Cases: `accepts-green-capstone-at-head` (0), `rejects-failed-run` (12), `rejects-no-run-at-head` (10), `rejects-none-completed` (11), `rejects-stale-green-at-superseded-head` (14), `rejects-run-missing-capstone` (13), `rejects-cancelled-run-at-head` (15), `rejects-run-with-skipped-lanes` (16), `accepts-cache-skipped-green` (0), `distinguishes-api-error-from-no-run` (20 vs 10). Override honoured only on refused head.

#### [NEW] `.bkit/src/bkit-ship-invariants.test.ts` — Task 3

- **Existence Check:** Does not exist. `bkit-counter-prose-audit.test.ts` is the pattern; `stripFencedBlocks` directly reusable.
- Cases (Tier 2, RED against current `bkit-ship.md`): no `git add -A`; no blanket `git add -- docs/`; every `status.jsonl` write via `BOOK_ROOT`; canonical 14 `ship-*` step-key set present; no `git commit`/`git push` to `feat/{FID}` outside the B2 block; every `gh pr merge` carries `--match-head-commit`; no dev-tree write between the two lock windows; `.deferred-blocked` writer referenced under `BOOK_ROOT`. **Positive presence:** `BOOK_PATHS` = frozen 8-path allow-list; `BOOK_ROOT` carries `CAN_PUSH_DEV`/`RUNTIME_DEVPUSHES`-conditional resolution (mode-3).

#### [NEW] `.bkit/src/bkit-config-keys.test.ts` — Task 1

- Cases: `bkit.capstoneJob` default `bkit-tests-check`; `bkit.ciWorkflow` default `ci.yml`; `stripManagedKeys` leaves both intact; `bkit-protect-main.sh` reads `bkit.capstoneJob` not the literal.

---

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work autonomously. No pause for user permission at the SP1 Gate. Check `[x]` tasks as you go.
> **Blockers:** Task incomplete → create tracker issue (label `blocker`) before stopping.
> **Never drop work silently:** append deferred/out-of-scope to `docs/deferrals.jsonl`, bugs to `docs/failures.jsonl` (check existing entries first).
> **Step Isolation:** Complete each task fully (verification + checkbox) before the next in its dependency chain. Tasks 1, 2, 3 all depend only on Task 0 and MAY run in parallel after Task 0. Task 4 depends on Tasks 1 + 2.

Task numbers are the original feature-level IDs (preserved verbatim). Cross-task references keep their original numbers; tasks in sibling sub-plans are noted `(SP2 …)` / `(SP3 …)`.

- [ ] **Task 0 — WS-1: #341 Serialisation Carve-Out (GO/NO-GO gate).** Verify #341's ship-touching workstreams have landed and the post-#341 `bkit-ship.md` is the diff base for this plan's rewrite. Confirm no other open PR/branch is rewriting `bkit-ship.md` (repo doctrine: no concurrent bkit workflows on one clone). Fold the three comment corrections into issue body context if not already done by design: (a) non-firing `pull_request` on a CONFLICTING PR is general GitHub behaviour, not a bkit token quirk; (b) `cancel-in-progress` is a second independent justification for the frozen head; (c) Path B2 is the common case, not the escape hatch. Record the serialisation decision in `docs/decisions.jsonl` (key `384-341-serialisation`): which side landed first (#341), and that 384 re-derives against post-#341 state. **Dependencies:** none. **Done when:** `git log --oneline d64ef5be..HEAD -- .bkit/workflows/bkit-ship.md` is empty or carries only this FID's commits; `docs/decisions.jsonl` row `384-341-serialisation` exists with `outcome: "341-first-landed"`; current `bkit-ship.md` carries the post-#341 runtime markers — `grep -c 'bkit_runtime_row ship' .bkit/workflows/bkit-ship.md` ≥ 1 (the runtime-resolved-row landed at `:320`) AND `grep -c 'RUNTIME_DEVPUSHES' .bkit/workflows/bkit-ship.md` ≥ 1 — confirms diff base. (Note: ship is the _documented exception_ that does NOT call `bkit_close_guard_checkout` — per `.bkit/workflows.md:114` that helper's EXIT trap would undo staying on `dev` for Steps 10–13; ship asserts the double-guard inline. The kernel _is_ landed for the other phases: `grep -c 'bkit_close_guard_checkout' .bkit/scripts/bkit-runtime.sh` ≥ 1 proves the function exists at `:430`. Asserting the close-guard call in ship's Step 9 is wrong — this Done-when uses the markers that are genuinely present.)

- [ ] **Task 1 — WS-3: Configuration Surface (`bkit.capstoneJob`, `bkit.ciWorkflow`, managed config script).** Add `bkit.capstoneJob` (default `bkit-tests-check`) and `bkit.ciWorkflow` (default `ci.yml`) to bkit's own `package.json` as worked example (consumer-tunable; `stripManagedKeys` leaves them intact — verify by reading `bkit-package-json.ts` `stripManagedKeys` source). Create `.bkit/scripts/bkit-ship-timeouts.sh` + `.bkit/templates/.bkit/scripts/bkit-ship-timeouts.sh` (byte-identical) with `SHIP_CI_WAIT_TIMEOUT_S` (e.g. 1800), `SHIP_POLL_INTERVAL_S` (e.g. 30), `SHIP_DEV_LOCK_STALE_S` (900), `SHIP_DEV_LOCK_ACQUIRE_DEADLINE_S` (600), `MAX_MERGE_ATTEMPT` (3) — units in identifiers per `bkit-counter-bus-config.sh` precedent. Modify `.bkit/scripts/bkit-protect-main.sh` + `.bkit/templates/.bkit/scripts/bkit-protect-main.sh` to read `bkit.capstoneJob` from `package.json` (via `jq -r '.bkit.capstoneJob // "bkit-tests-check"'`) instead of the literal at line 38. Add unit test `.bkit/src/bkit-config-keys.test.ts`. **Dependencies:** Task 0. **Done when:** `.bkit/src/bkit-config-keys.test.ts` passes (`pnpm test bkit-config-keys`); `bkit-protect-main.sh` grep shows no `REQUIRED_JOB="bkit-tests-check"` literal and instead a `jq` read of `bkit.capstoneJob`; `pnpm test bkit-package-json` still passes (stripManagedKeys leaves new keys intact); `diff .bkit/scripts/bkit-ship-timeouts.sh .bkit/templates/.bkit/scripts/bkit-ship-timeouts.sh` is empty AND `diff .bkit/scripts/bkit-protect-main.sh .bkit/templates/.bkit/scripts/bkit-protect-main.sh` is empty (manual byte-identity check — Task 6 is the sole owner of the `bkit-dogfood-noop.integration.test.ts` extension that automates this property; Tasks 1 and 4 satisfy byte-identity independently via `diff` so their checkboxes are runnable before Task 6 lands).

- [ ] **Task 2 — WS-2: gh Stub Harness + Fixture Corpus (GO/NO-GO cost hinge, recalibrated).** **Extend the existing PATH-shim `gh` idiom** from `tests/bkit-runtime.bats:44-58` (which writes a fake `gh` to a `FAKE_BIN` temp dir and `chmod +x`s it) **with the genuinely-new piece: fixture-file dispatch.** Build a PATH-shimmed `gh` script under `tests/fixtures/gh/bin/gh` that dispatches on argv (subcommand + flags, e.g. `api /repos/.../runs?head_sha=`) to a fixture JSON file under `tests/fixtures/gh/`. Capture the seven design-mandated fixtures from real `gh` output across bkit + (where available) the two consumer repos: (1) green capstone at head; (2) capstone absent from run; (3) failed run; (4) in-progress run; (5) superseded green; (6) PR #720 `total_count 0` (CONFLICTING — no `refs/pull/<n>/merge`); (7) cache-skipped green with `cache_skip` sentinel. Add an API-error fixture for code-20 distinction. **Fixture fallback (review-3 m3):** if PR #720 is unavailable (closed/deleted) by implementation time, capture the equivalent `total_count 0` shape from any CONFLICTING PR with zero runs, or commit a synthetic JSON matching PR #720's observed fields. Wire `pnpm test:bats` into `.husky/pre-push` after the existing `pnpm bkit check` line. **GO/NO-GO (plan-halting, not a Task-2-only skip — review-3 m5):** if this task cannot be settled in roughly half a day (8 agent turns), the Tier-1 carrier is more expensive than assumed — STOP, append `docs/deferrals.jsonl` row (`key: 384-gh-stub-cost-hinge`), and surface to orchestrator for explicit tiering revisit. Because the PATH-shim wrapper reuses an existing idiom (`bkit-runtime.bats`) and only the dispatch layer is new, this hinge is **cheaper than originally claimed** (Risk-12 recalibrated per review-1 M1) — but a NO-GO still removes SC 1's primary carrier (Tier-1 merge gate), leaving SC 1 resting on Tier-2 prose invariants alone, which the design says is insufficient (Risk 9). NO-GO therefore halts the whole plan, not Tasks 3–11. **Dependencies:** Task 0. **Done when:** `tests/fixtures/gh/bin/gh` exists and is executable (reusing the `bkit-runtime.bats` `FAKE_BIN`/`chmod +x` pattern); seven fixture JSON files exist under `tests/fixtures/gh/`; a smoke bats case at `tests/fixtures/gh/smoke.bats` (scope-check-1 MINOR-4: file ownership fixed — the smoke case belongs in `tests/fixtures/gh/smoke.bats` here in Task 2; `tests/ship-gate.bats` is created solely by Task 4) verifies the stub dispatches each fixture; `.husky/pre-push` contains `pnpm test:bats` line; `pnpm test:bats` exits 0 on `tests/fixtures/gh/smoke.bats`.

- [ ] **Task 3 — WS-6: Bookkeeping Contract + Tier-2 Invariant Test (RED test, lands BEFORE prose rewrite).** Write `.bkit/src/bkit-ship-invariants.test.ts` asserting against the _current_ `bkit-ship.md` (which still has the head-mutating model). Reuse `stripFencedBlocks` from `bkit-counter-prose-audit.test.ts`. Cases must FAIL on current prose and PASS on rewritten prose: no `git add -A`; no blanket `git add -- docs/`; every `status.jsonl` write resolves via `BOOK_ROOT`; canonical 14 `ship-*` step-key set present and unchanged (publish the set in the test as the source of truth the rewrite must match); no `git commit`/`git push` to `feat/{FID}` outside the B2 block; every `gh pr merge` carries `--match-head-commit`; no dev-tree write between the two lock windows (release row + re-acquire row present); `.deferred-blocked` writer referenced under `BOOK_ROOT`. **Positive presence assertions (review-3 M1 + M2):** (a) assert `BOOK_PATHS` is defined exactly as the frozen 8-path allow-list — `docs/plans/{YYYYMM}/logs/{FID}/`, `docs/completed.md`, `docs/deferrals.jsonl`, `docs/failures.jsonl`, `docs/knowledge.jsonl`, `docs/decisions.jsonl`, `.bkit/friction.jsonl`, `.agents/skills`, `skills-lock.json` (cite the design block verbatim; publish the list in the test) — and that every `git add` in `bkit-ship.md` resolves via `BOOK_PATHS`; (b) assert `bkit-ship.md` carries the `CAN_PUSH_DEV`/`RUNTIME_DEVPUSHES`-conditional `BOOK_ROOT` resolution text (presence check: dev tree when true, adopt/current-working-branch tree when false — mode 3) so the mode-3 path is mechanically asserted, not prose-only. **Dependencies:** Task 0. **Done when:** `.bkit/src/bkit-ship-invariants.test.ts` exists and FAILS on current `bkit-ship.md` (verifying the test is genuinely RED — proves it would catch a half-applied rewrite); the canonical 14 step-key set is published in the test file as a frozen list; the frozen 8-path `BOOK_PATHS` allow-list is published in the test file as a frozen list.

- [ ] **Task 4 — WS-4: `bkit-ship-gate.sh` + `tests/ship-gate.bats` (Tier-1 carrier, MUST land before prose rewrite).** Create `.bkit/scripts/bkit-ship-gate.sh` + `.bkit/templates/.bkit/scripts/bkit-ship-gate.sh` (byte-identical). Contract: `assert --head <sha> [--capstone <job>] [--workflow <file>] [--repo <o/r>] [--explain]`. Run selection per design: query `gh api /repos/{o}/{r}/actions/workflows/{ciWorkflow}/runs?head_sha=<sha>` (workflow-scoped), select most recent `completed` run; if runs exist but none completed → exit 11 (in progress, not absent). Read capstone presence + conclusion from `/actions/runs/{id}/jobs --paginate`. Implement one exit code per condition (0/10/11/12/13/14/15/16/20). Distinguish `skipped` lane (code 16) from `cache_skip` sentinel green (code 0 + `--explain` note). Every diagnostic on stderr behind `[bkit-ship-gate]`; every refusal prints required head + head actually tested + run URL. Sample `gh api rate_limit` for code-20 message. Honour `BKIT_SHIP_GATE_OVERRIDE=<sha>` only when equals refused head; gate itself appends override `status.jsonl` row. Create `tests/ship-gate.bats` with the 10 named cases. **Dependencies:** Task 1 (config keys), Task 2 (stub harness). **Done when:** `pnpm test:bats tests/ship-gate.bats` passes all 10 cases against the captured fixtures (proves fixtures map to exit codes BEFORE any prose is touched); `bkit-ship-gate.sh --explain` is invocable and exits 0/10/11/12/13/14/15/16/20 deterministically per fixture; `diff .bkit/scripts/bkit-ship-gate.sh .bkit/templates/.bkit/scripts/bkit-ship-gate.sh` is empty (manual byte-identity check — Task 6 is the sole owner of the `bkit-dogfood-noop.integration.test.ts` extension that automates this property; Tasks 1 and 4 satisfy byte-identity independently via `diff` so their checkboxes are runnable before Task 6 lands).

### 🔒 SP1 Gate: Foundations + Tested Tier-1 Gate

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, hand off to Sub-plan 2 (`plan-v4-2.md`).

- [ ] **No bolt-on / no gate-weakening:** `bkit-ship-gate.sh` is a new artifact justified against the existing 9 helper scripts (8 `.sh` + 1 `.mjs`; same class — load-bearing rule extracted from prose — last uncovered). `bkit-ship-timeouts.sh` is justified against the `bkit-counter-bus-config.sh` precedent. The `tests/fixtures/gh/` harness **extends the existing PATH-shim `gh` idiom in `tests/bkit-runtime.bats:44-58`** (the `FAKE_BIN`/`chmod +x` pattern) and adds the genuinely-new fixture-file dispatch layer on top — not "first-of-its-kind" (review-1 M1 correction). No `as any` / `as unknown as` / `@ts-ignore` / `.skip` / empty `catch` / error-swallowing introduced to make any gate pass.
- [ ] **Tier-1 carrier proven before any prose touched:** `pnpm test:bats tests/ship-gate.bats` passes all 10 cases; `bkit-ship-gate.sh --explain` deterministic per fixture.
- [ ] **Tier-2 invariant RED:** `.bkit/src/bkit-ship-invariants.test.ts` exists and FAILS against current `bkit-ship.md` (proves it would catch a half-applied rewrite — Sub-plan 2 turns it GREEN).
- [ ] **Byte-identity (manual `diff`, pre-Task-6):** root ↔ template pairs empty for `bkit-ship-gate.sh`, `bkit-ship-timeouts.sh`, `bkit-protect-main.sh`.
- [ ] **Config home correct:** `bkit.capstoneJob` / `bkit.ciWorkflow` in `package.json` (survive `stripManagedKeys`); `bkit-protect-main.sh` reads `bkit.capstoneJob` not the literal.
- [ ] **Pre-push wired:** `.husky/pre-push` contains `pnpm test:bats`.
- [ ] **SP1 - Verified:** Every checkbox above independently verified. Tasks 0–4 all `[x]`.

## Verification Plan (SP1)

### Automated Tests

- [ ] **bats suite (this slice):** `pnpm test:bats tests/fixtures/gh/smoke.bats` and `pnpm test:bats tests/ship-gate.bats` pass. Uses PATH-shimmed `gh` stub against real JSON fixtures (no mocking of the boundary under test). Fixtures committed read-only; no real PAT in fixtures.
- [ ] **Unit suite (this slice):** `pnpm test bkit-config-keys` passes; `.bkit/src/bkit-ship-invariants.test.ts` exists and is RED against current `bkit-ship.md` (expected — GREEN comes in SP2 Task 7). `pnpm test bkit-package-json` still passes.
- [ ] **Gate suite (no regression):** `pnpm typecheck && pnpm test && pnpm format:check && pnpm lint:prose && pnpm slop:delta && pnpm bkit check` green (invariant test being RED is the exception — it ships RED deliberately; `pnpm test` overall may be RED solely on `bkit-ship-invariants.test.ts`; if so, that is expected and does not block SP1 hand-off).
- [ ] **Build Configuration:** No `tsconfig.json` exclusion needed — new files are `.test.ts` (vitest) or `.bats`/`.sh` (not type-checked).

> [!IMPORTANT]
> **No Architectural Downgrades:** If build/test errors surface, NEVER resolve via hot fixes or anti-patterns. Halt and follow `docs/architecture.md` + `docs/knowledge.jsonl`.

### Hand-off to Sub-plan 2

This sub-plan's outputs are **Seam 1** for Sub-plan 2 (`plan-v4-2.md`):

- Tested `bkit-ship-gate.sh` + `tests/ship-gate.bats` (10 cases GREEN) — Sub-plan 2 Task 5/6/7 depend on it.
- `BOOK_ROOT`/`BOOK_PATHS` contract published in `.bkit/src/bkit-ship-invariants.test.ts` (RED) — Sub-plan 2 Task 5 reads it; Task 7 turns it GREEN.
- `bkit.capstoneJob` / `bkit.ciWorkflow` config keys + `bkit-ship-timeouts.sh` — Sub-plan 2 Task 7 sources the timeouts.

Sub-plan 2's first action re-verifies these landed before proceeding.

## Merge Method

**Merge method: always squash.** This sub-plan's commits land as part of the single squash-merged PR to `dev` (see `plan-v3-checked.md` § Merge Method).
