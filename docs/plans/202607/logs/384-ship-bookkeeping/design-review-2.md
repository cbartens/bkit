Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Operability — failure modes, observability, on-call ergonomics.

## Failure-Mode Enumeration

### F1 — Merge of unvalidated head (stale green / absent capstone / superseded SHA)

- **What fails:** Gate keys on wrong signal (`statusCheckRollup`, latest-run, list-and-filter) or treats missing capstone as pass; squash lands; post-merge `dev` push is `run_level=light` only → never gets full validation.
- **Detection:** Designed — `bkit-ship-gate.sh` SHA-keyed query; exit 10–14; prints required head, tested head, run URL. Override path logs `BKIT_SHIP_GATE_OVERRIDE=<sha>` to `status.jsonl`.
- **Blast radius:** Whole product on `dev` (and downstream `main` promote) — unrecoverable class. Correctly Tier-1.

### F2 — Gate refuse under API / auth / secondary rate-limit (unknown vs unvalidated)

- **What fails:** `gh api` 403/429/auth; today collapsed into "no run / PAT scope".
- **Detection:** Designed — exit 20 distinct from 10–14. `--explain` for read-only interrogation.
- **Blast radius:** One ship run blocked; risk is human UI-merge of green-looking PR (operator override). Design mitigates with printed dual-SHA + logged escape.

### F3 — Path B head move with no CI dispatch (CONFLICTING / buried `[skip ci]`)

- **What fails:** `pull_request` never fires (`refs/pull/<n>/merge` absent) or history-poisoned skip-ci; wait-only never recovers.
- **Detection:** Unconditional `gh workflow run` after observed head move; gate exit 10 if still no run; poll dual-capped (attempt + elapsed) + `timeout`-wrapped so hang fails loud.
- **Blast radius:** One FID / one PR. No merge until gate 0.

### F4 — CI poll hang / session timeout with zero status row

- **What fails:** Blocked `sleep` / unbounded wait; step never completes → no narration, no terminal `status.jsonl` row; may hold dev lock (see F7).
- **Detection:** Design requires dual caps + timeout wrap specifically because hang produces zero observability. Recovery: external session kill + Failure Path / resume.
- **Blast radius:** One ship session; secondary lock contention for other phases on same clone.

### F5 — Capstone present but run degraded (`run_level` ≠ full / paths-ignore / docs short-circuit)

- **What fails:** Consumer CI change keeps job name `bkit-tests-check` while skipping lanes; gate sees present+success → vacuous full-validation claim. Design Risk 3; **open, undecided**.
- **Detection:** Capstone-present check does **not** catch this. User report / post-merge defect only unless `run_level` asserted or published as hard consumer contract.
- **Blast radius:** Same as F1 (unrecoverable class) — silent.

### F6 — `BOOK_ROOT` / flush wrong tree (mode 3 / optimistic `CAN_PUSH_DEV`)

- **What fails:** Until #341, identity-derived default (worktree present ⇒ true); false positive → write/checkout `dev` on live cloud session, or flush never lands on durable tree.
- **Detection:** "Real push fails loud" for false-positive push; outbox at `$GIT_COMMON_DIR/bkit-outbox/{FID}/` survives worktree remove; Step 1 records resolved `BOOK_ROOT` in status row.
- **Blast radius:** One FID's bookkeeping / partial state; mode-3 session integrity if checkout attempted. Push-timing invariant still holds for merge correctness.

### F7 — Dev lock held across CI-run minutes (Path B re-validate)

- **What fails:** Lock acquire 600s / staleness 900s while wait is CI-duration; unrelated runs expire a legitimately held lock and proceed → concurrent staging on shared `dev` (exact race BOOK_PATHS exists to contain).
- **Detection:** Lock-staleness cross-check (`:27`); misattributed commits post-hoc; friction rows. No alert — agent/session only.
- **Blast radius:** Multi-FID on shared clone (misattribution, dirty index). Design Risk 5 **open** (release-and-reacquire vs raise deadlines).

### F8 — Failure Path silent no-op / mid-rebase leftover / wrong tree / wrong order

- **What fails:** Append then abort discards row; `--git-common-dir` vs `--show-toplevel` split; `2>/dev/null || true` reports success while writing nothing; dangling `IN_PROGRESS`.
- **Detection:** Designed fixes: write `.deferred-blocked` on sweep FAIL; single `BOOK_ROOT`; append after abort; drop silencing. Pre-merge snapshot + outbox for post-mortem.
- **Blast radius:** One FID observability + resume/lock fold corruption; merge never happens on Failure Path (correct) but handover may be missing today — fixed in-scope.

### F9 — Shared worktree force-removed while another phase owns it

- **What fails:** Step 12 `worktree remove --force` after Path A read-only resume; destroys concurrent/other-phase checkout.
- **Detection:** Live destruction (user/session fail); design scopes remove to "this run created worktree" only.
- **Blast radius:** One FID worktree / all five phases sharing it.

### F10 — Staging scope drift / concurrent plan staged under ship FID

- **What fails:** Blanket `git add -- docs/` or `-A` on shared `dev`; relocating bookkeeping **increases** exposure.
- **Detection:** Tier-2 vitest invariants (presence in prose); runtime relies on agent honouring `BOOK_PATHS`. Misattribution detectable only post-hoc in git history / friction.
- **Blast radius:** Multiple FIDs' ledger/plan files. Recoverable but silent until noticed.

### F11 — Incomplete `status.jsonl` / invented step keys / terminal row missing

- **What fails:** Holey step sets (25–65% corpus); invented names invisible to counter-bus/fold; aborted run without terminal row.
- **Detection:** Tier-3 advisory detector (derive expected set from `bkit-ship.md`, watermark delta, fail-open); Success Criterion 3 requires terminal row. MTTD days while advisory.
- **Blast radius:** Post-hoc telemetry / resume correctness for one FID; not merge correctness (Tier 1 covers that).

### F12 — Shipped workflow regression with no per-workflow rollback

- **What fails:** Bad gate or prose lands via `bkit upgrade` across pinned consumers.
- **Detection:** Consumer ship fails / false refuses; override escape. Risk 8: recovery path undefined.
- **Blast radius:** All upgraded consumer repos' ship phase until pin/downgrade manually.

## Observability Coverage

Project baseline (`docs/observability.md`): CLI uses load-bearing `[{Context}]` prefixes; workflow telemetry is `status.jsonl` / ledgers / friction — **no** metrics pipeline, traces, or on-call alert stack for ship. `docs/deployments.md` makes capstone `bkit-tests-check` the sole required check and documents `[skip ci]` / dispatch-gate / `run_level` contracts the gate depends on.

| Failure                | Logs / status                                                           | Metrics                           | Traces / correlation                | Gap                                                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------- | --------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| F1 merge unvalidated   | Gate refuse msgs + dual SHA + run URL; override row; pre-merge snapshot | None (exit codes only in-process) | FID + head SHA + run id in snapshot | Gate script stderr prefix not named (`[bkit-ship-gate]` or reuse `[bkit-telemetry]`) — greppable CI/session drains need a convention |
| F2 API unknown         | Exit 20 + distinct copy                                                 | None                              | Same                                | Good: 20 ≠ 10. Rate-limit sampling **unmeasured** (Risk 4)                                                                           |
| F3 no dispatch         | Unconditional dispatch narration; gate 10                               | None                              | workflow_run id after dispatch      | Covered                                                                                                                              |
| F4 poll hang           | Dual cap → loud fail **if** caps work                                   | None                              | Missing if hang before status write | Design acknowledges; must emit status/failure row on timeout path                                                                    |
| F5 degraded run_level  | **None**                                                                | None                              | None                                | **CRITICAL gap** — same blast as F1, no detection                                                                                    |
| F6 BOOK_ROOT wrong     | Step 1 status carries resolved values; push fail loud; outbox           | None                              | BOOK_ROOT in start row              | Mode-3 optimistic default: failure is loud push, not early probe (probe correctly rejected)                                          |
| F7 lock overhold       | Staleness fold; no dedicated "lock held for CI wait" row                | None                              | Lock file only                      | No structured signal when ship chooses to hold across re-validate                                                                    |
| F8 Failure Path        | `.deferred-blocked`; `workflow-failed` on BOOK_ROOT; silencing removed  | None                              | FID log dir                         | Verify no path still depends on silent no-ops (Risk 6 — not yet done)                                                                |
| F9 worktree destroy    | Step 12 records create-ownership                                        | None                              | —                                   | Ownership bit must be durable across resume (outbox or status)                                                                       |
| F10 staging drift      | Vitest presence only; not runtime                                       | None                              | —                                   | Design Trade-offs: Tier 2 cannot assert honour — e2e ship required                                                                   |
| F11 holes              | Advisory detector                                                       | Fail-open channel                 | Step-key schema published           | Intentional MTTD days for one release                                                                                                |
| F12 upgrade regression | Consumer ship refuse / override                                         | None                              | —                                   | No pin/rollback runbook in design                                                                                                    |

Missing observability for **F5** (CRITICAL severity blast, zero detection) drives the CONCERNS verdict more than any other single gap.

## On-Call Ergonomics

This is agent/session "on-call" (developer running `/bkit-ship`), not paging. Anticipated pages ≈ gate refuse + handover + lock contention.

| Alert / symptom                                     | Runbook from payload?                                                                   | Recovery                                                                      | Noise                                                                                                         |
| --------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Gate exit 10–14                                     | Yes — dual SHA + run URL + condition-specific code makes green-looking PR self-refuting | Refuse; re-validate or fix CI; logged override only as last resort            | Low if codes not collapsed; high if 11 (in-progress) pages as hard fail without poll-retry guidance in caller |
| Gate exit 20                                        | Partial — "API/auth/rate limit" still needs `gh api rate_limit` / token scope chase     | Retry / fix PAT / wait; must **not** treat as "no run"                        | Risk of override-as-workaround under secondary limits (shared PAT across repos)                               |
| Sweep FAIL → handover                               | Yes — once `.deferred-blocked` writer exists; routes to `@bkit-debug-abort-handover`    | Human judgement via handover artifact; never bare STOP                        | Low                                                                                                           |
| Lock acquire fail / stale expiry during Path B wait | Weak — stale lock looks like abandoned run                                              | Human judgement; release-vs-hold policy **undecided** → wrong recovery common | **High** if deadlines unchanged: legitimate ships cause cascade expiries                                      |
| Status holes (advisory)                             | Delta vs watermark                                                                      | Fix workflow / backfill; fail-open                                            | Tuned correctly by advisory-first (corpus 25–65% holey)                                                       |
| Override used                                       | status.jsonl row                                                                        | Audit after; treat as incident                                                | Good — visible beats silent UI merge                                                                          |

Recovery actions that are automatic/idempotent: server-side B1 update-branch; force-with-lease B2; gate assert pure read; outbox flush at close. Human judgement required: override, non-mechanical conflict handover, lock policy under long CI wait, mode-3 flush via phase-close PR (#341).

## Operational Dependencies

New / changed burden (acknowledge, not blockers):

1. **`.bkit/scripts/bkit-ship-gate.sh` + `tests/ship-gate.bats`** — maintain fixture corpus (incl. PR #720 `total_count 0`); `--explain` becomes the primary diagnostic tool.
2. **`package.json` → `bkit.capstoneJob`** — config surface; drift from consumer job rename → permanent FAIL (good) if misconfigured.
3. **Timeout/limit config** (CI-wait, poll interval, lock 900s/600s, `MAX_MERGE_ATTEMPT`) — single file with units in names; on-call must know where to raise under F7.
4. **Outbox path** `$GIT_COMMON_DIR/bkit-outbox/{FID}/` — disk hygiene / leftover dirs after aborted ships; flush semantics in mode 3 depend on #341.
5. **Tier-2 vitest** `bkit-ship-invariants.test.ts` — CI signal for prose drift; false confidence if agents ignore prose.
6. **Tier-3 advisory status-hole detector** — one-release fail-open channel; watermark maintenance; promote-to-gate decision later.
7. **Logged gate override** — audit convention for `BKIT_SHIP_GATE_OVERRIDE` rows.
8. **No new dashboard/pager** — fits current stack (status/friction/failures + CLI prefixes). Sequencing dependency on **#341** ship-touching workstreams remains an operational landing risk (Risk 1).

## Verdict Reasoning

The design is strong on the unrecoverable merge path: executable SHA-keyed gate, distinct exit codes, dual-SHA refuse copy, pre-merge snapshot, outbox durability, Failure Path sentinel/order/tree fixes, and unconditional Path B dispatch. Those are operable relative to today's prose-only collapse.

CONCERNS (not FAIL) because three operability holes remain open or underspecified for a design that otherwise proceeds:

1. **F5** — load-bearing assertion can go vacuous with no detection (Risk 3 undecided).
2. **F7** — lock hold vs CI wait has no chosen recovery; wrong choice re-opens the concurrent-staging blast the design itself expands.
3. **Gate/script observability convention** and **timeout-path status emission** are implied but not contracted against `docs/observability.md` `[{Context}]` / terminal-row success criteria.

None of these make the design non-operable in the current (ledger + agent) monitoring stack if Plan closes them; they are not "missing the entire observability plane." Advisory Tier 3 and Tier-2 presence-only limits are accepted trade-offs, not FAIL conditions.

## CRITICAL

1. **Decide and document the `run_level` / consumer CI contract for the gate (Risk 3)** before Plan freezes the assert surface — either assert `run_level=full` (or equivalent non-hollow signal) in `bkit-ship-gate.sh`, or publish a hard consumer contract with a detector/advisory when PR runs are not full. Leaving F5 undetectable preserves the unrecoverable class the Tier-1 carrier exists to close.
2. **Close Risk 5 (dev-lock across CI wait) with an explicit policy** — release+reacquire vs raised deadlines vs lock scope that excludes the poll wait — including how concurrent staging stays impossible under the chosen policy. Path B is the common case; shipping without this invites lock-expiry cascades and misattribution under the new `dev` bookkeeping home.
3. **Contract gate refuse / timeout observability** — named stderr prefix per `docs/observability.md`; every non-zero gate path and poll-timeout path writes a terminal or failure `status.jsonl` row (plus pre-merge snapshot fields already listed) so a refused/hung ship is diagnosable from the log dir alone without re-running `gh`.

## OPTIONAL

1. Sample `gh api rate_limit` before Path B poll loops; surface remaining quota in exit-20 / `--explain` output (Risk 4).
2. Emit a structured status row when the lock is held across re-validate (duration, head SHA, run id) to make F7 greppable.
3. Persist Step 12 "created_worktree" ownership in outbox/status so resume after crash cannot force-delete a shared tree.
4. Document consumer rollback: pin previous `@cbartens/bkit` / skip `bkit upgrade` for ship surfaces; pair with override audit (Risk 8).
5. After one advisory release, promote hole detector with path-conditional expected sets; keep fail-open until watermark noise is known.
6. Verify no Failure Path / close path still depends on silenced git no-ops (Risk 6 remainder).
7. End-to-end ship dogfood in a consumer repo (Risk 10–11): Tier 2 cannot prove honour; one real Path A + Path B2 run is the operability proof.

## OUT OF SCOPE

- Implementing #341 `CAN_PUSH_DEV` / three-runtime capability table (384 correctly uses identity default + push-timing invariant).
- Friction/failures capture gaps in visitfrasercoast-com (corpus bias for detector validation).
- Dogfooding solely from bkit's own fixture `stats.jsonl` / zero-sweep corpus.
- Extracting a full executable ship kernel (deferred end state).
- Changing design/plan/build/debug unconditional rebase conventions.
- Traditional metrics backends, log drains, or pager integration — outside current project observability scope.
- Serialisation mechanics of #341 vs 384 landing (process risk; must be answered before Plan, but not an in-run failure mode of this design's runtime).
