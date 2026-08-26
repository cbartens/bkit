# Ship Debug Abort Handover

## The Short Version

Feature #380 ("keep `docs/roadmap.md` always up to date automatically") is built, tested, and green on every mechanical gate — but Ship's own pre-merge completeness check (Step 5) found 5 small places where the finished pieces don't quite fit together, and refused to let the PR merge until a human decides what to do about them. This is NOT a new bug and NOT a build/test failure: it's a deliberate stop-and-check gate doing its job. The underlying code has already survived one full build cycle (4 sub-plan rounds) and a debug cycle that got stuck on an unrelated branch-sync conflict, which a human then resolved by hand to get the PR this far.

## What's Actually Happening

**Symptom:** `bkit-ship` Step 5 (`@bkit-ship-deferred-sweep`, the pre-merge completeness gate) returned `Verdict: FAIL / Failures: 5` on PR #411 and the ship workflow stopped (`workflow-failed` at `2026-07-31T00:00:59Z`, per `status.jsonl` line 31). No CI failure, no rebase failure, no max-retry exhaustion occurred in this ship run — Steps 1–4 (start, worktree setup, regression guard) all passed cleanly on the first attempt.

**Trigger:** The deferred-sweep gate diffs "what was designed/planned" against "what the PR actually delivers" and found 5 unresolved gaps that were already known before ship started — they are the same 5 findings the prior `build` workflow's holistic verify pass caught (`build-plan-verify-holistic.md`, `Verdict: FAIL / Failures: 5`, 2026-07-29), carried through an aborted `debug` attempt, and re-confirmed as still-present against the current PR HEAD.

**Proximate cause:** Three of the five are handoff drops between the plan's 3 sub-plans (a sub-plan explicitly deferred a piece of work to "sub-plans 2/3" and neither of those actually picked it up); the other two are consistency/hygiene defects on the same seam (a stale generated artifact, an undeclared gitignore entry). None is a logic bug in delivered code — the full gate suite (`pnpm test`, `test:bats`, `typecheck`, `check:dist`, `slop:delta`, `bkit check`, `lint:prose`, `format:check`) was green at both the build holistic-verify pass and this ship deferred-sweep.

**Root cause (design fragility, not a defect):** The plan split #380 into 3 sub-plans and explicitly handed the ship-close wiring ("the `roadmap-status` regenerate at ship, the analysis Step 10 wiring, and the cadence step") from sub-plan 1 to "sub-plans 2/3" as a cross-cutting commitment in prose, rather than as a task on either sub-plan's own runbook. No per-sub-plan verify pass (11 of them ran, all green) could catch this — a prose handoff between plan documents isn't visible to a scope that only looks at one sub-plan's own diff. This is a process/plan-decomposition fragility, not a coding mistake.

**Contributing factors:** This PR already carries real history that should NOT be mistaken for fresh flailing:

1. The original `build` workflow needed 2 remediation cycles across 3 sub-plans before its own per-sub-plan verifies went green, then failed its holistic (cross-sub-plan) verify — see Attempt History.
2. The subsequent `debug` workflow's _first_ attempt never even reached diagnosis: it aborted at Worktree Setup because rebasing the 31-commits-ahead feature branch onto `origin/dev` (7 commits behind) hit 3 real conflicts (2 content, 1 modify/delete on `docs/completed.md`, which #380 itself deletes as part of its own migration). That abort produced `debug-handover.md`.
3. A human then resolved those 3 conflicts by hand (commits `7385085c`, `47472bf1`, `2b9b0a67`, all after the debug abort) and pushed the PR to where it now sits: rebased, green, mergeable — but the 5 holistic gaps from step 1 were never diagnosed or fixed, because the debug cycle that was supposed to reach them got consumed entirely by the rebase.

So: **this ship abort is the first time anyone has actually reached the 5 real gaps with the branch in a clean, rebased state.** They are old, known, well-documented findings — not a new discovery.

## Rot Signals

None. No `ship-failure-diagnose-*.md` or `ship-failure-remediate-*-log.md` artifacts exist for this ship run — the deferred-sweep gate stops the workflow directly, before any diagnose/remediate subagent runs, so no rot-signal extraction was possible this cycle.

## Out-of-Scope Recommendations

None produced this cycle (no diagnose attempt ran). For reference, `ship-deferred-sweep.md` § Exempt lists 9 previously-declared out-of-scope items (deferred to #260, #80, or explicitly rejected) that are NOT part of the 5 blocking gaps below — see that file if triaging scope.

## Attempt History

<!-- prettier-ignore -->
| Strategy | What was tried | Why it failed / current state |
| --- | --- | --- |
| `build` sub-plan 1, attempts 1–4 | Execute → verify → gaps-remediate loop (STANDARD → PIVOT → FINAL strategies) | Reached PASS at attempt 4 (2026-07-29 09:16) after 2 remediation passes |
| `build` sub-plan 2, attempts 1–4 | Same loop | Reached PASS at attempt 4 (2026-07-29 09:50) after 2 remediation passes |
| `build` sub-plan 3, attempts 1–3 | Same loop | Reached PASS at attempt 3 (2026-07-29 12:02) after 1 remediation pass |
| `build-plan-verify-holistic`, attempt 1 | Cross-sub-plan integration verify against the full feature diff | **FAIL, 5 failures** — the same 5 gaps below; `build` workflow terminated (`workflow-failed`, 2026-07-29 12:15) |
| `debug`, attempt 1 (Step 2 Worktree Setup) | Rebase `feat/380-roadmap-analysis-refresh` onto `origin/dev` before running tests/diagnosis | **Aborted before any diagnosis** — 3 real conflicts beyond the auto-resolved `pnpm-lock.yaml` case (`debug-handover.md`); `debug` workflow terminated (`workflow-failed`, 2026-07-30 12:10) |
| *(human, out-of-workflow)* | Manually resolved the 3 rebase conflicts and pushed | Branch is now clean, rebased, and mergeable — but the 5 gaps below were never touched |
| `ship`, this run — Steps 1–4 | Start / worktree setup / regression guard | All PASS |
| `ship`, this run — Step 5 (`@bkit-ship-deferred-sweep`) | Pre-merge completeness sweep of the full PR against design/plan intent | **FAIL, 5 failures** — the same 5 gaps, re-verified against current HEAD, still unfixed. Ship workflow stopped here. |

## Verified Resolutions (DO NOT ROLL BACK)

Everything landed by the `build` workflow (all 3 sub-plans, verified PASS individually) and everything the human's manual rebase-conflict resolution preserved remains correct and should NOT be reverted:

- `kind:"feature"` telemetry codec + `docs/roadmap.jsonl` append-only ledger (51 rows), `merge=union` `.gitattributes` entries.
- `bkit.roadmap.buildCycles` / `stalenessDays` manifest keys.
- `bkit telemetry migrate` bootstrap seed + install advisory + full migration from `docs/completed.md`.
- `bkit-roadmap-fold.sh` projection (mechanical status board) + bootstrap/self-heal + marker-pair invariant — green in both unit and bats coverage.
- Ship writer / verdict reader swap from `docs/completed.md` presence-check to `docs/roadmap.jsonl` `status=="SHIPPED"` check; `docs/completed.md` fully removed (file, template, `.bkit/version` hash, prose references).
- Design/plan/build/debug close-step hooks (mechanical board regenerate on every close except ship — see Blocking 1) + widened STRAY allowlists + tracker enrichment.
- `@bkit-roadmap-refresh` opus leaf (analysis tier) + its wiring as ship Step 10's third parallel subagent.
- Cadence counter (`bkit-roadmap-cadence.sh`, distinct `BUILT` FIDs since last fire) + reverse tracker sync (settled-drift-guarded, MCP-only) + drift check (`live feat/* with no ledger row`).
- The human's 3 rebase-conflict resolutions: `.bkit/workflows.md` (re-applied #380's edits on top of dev's `fbd46ad0` auto-route-marker fix), `.bkit/src/bkit-manifest.test.ts` (kept #380's assertions + dev's `a62dc54d` prose-gate fix), `docs/completed.md` deletion (accepted, with FID #363's completion row from `fe289e67` carried forward into `docs/roadmap.jsonl` first).

Full gate suite (`pnpm test` — 2780 passed; `test:bats`; `typecheck`; `check:dist`; `slop:delta` — net 0; `bkit check` — 0 drift; `lint:prose`; `format:check`) is green as of the ship deferred-sweep's own re-verification.

## Persistent Errors

**The 5 blocking gaps (unchanged since `build-plan-verify-holistic.md`, attempt 1, 2026-07-29; re-confirmed by `ship-deferred-sweep.md` against current PR #411 HEAD):**

1. **Ship close never regenerates the roadmap-status board.** `.bkit/workflows/bkit-ship.md` has zero `bkit_roadmap_fold` call sites (design/plan/build/debug and the `/bkit-roadmap` utility all call it; ship does not). Sub-plan 1 explicitly deferred "the `roadmap-status` regenerate at ship" to sub-plans 2/3; neither picked it up. Effect: at ship, the `SHIPPED` row is appended and the verdict greens off it, but the board keeps showing the shipped FID under Build/Debug until some unrelated FID's close happens to regenerate it. Breaks Success Criterion #1 for the ship close specifically.
2. **`### Ship` (in flight) section is a permanently-empty placeholder leaking bkit-internal text.** `.bkit/scripts/bkit-roadmap-fold.sh:180` (and its template copy) emit the literal `### Ship _(in flight — populated by ship-close wiring, sub-plans 2/3)_` followed by hardcoded `_(none)_` into every consumer's `docs/roadmap.md`. Two problems in one line: bkit's internal sub-plan numbering ships as consumer-facing text, and the six-state status ladder has no in-flight-ship state, so no ledger row can ever populate that section as built.
3. **`/bkit-roadmap` (on-demand utility) drops the scan-coverage counter.** The `shell-bus` counter-derivation decision (caller's shell greps the leaf's report and appends a `ROADMAP_SCAN_COVERAGE` row) was implemented in `bkit-ship.md` only; `bkit-roadmap.md` reuses the same analysis leaf but has no shell-side derivation or `stats.jsonl` append, so on-demand refreshes record no coverage telemetry.
4. **Undeclared scratch path, false "gitignored" claim.** `.bkit/workflows/bkit-roadmap.md:39` tells the leaf to write `.bkit/.roadmap-refresh-on-demand.md` and describes it as "(gitignored, not committed)" — it is not, in either `.gitignore` or `.bkit/templates/gitignore` (unlike its two sibling `#380` scratch paths). Because build/debug closes stage with `git add -A`, a stray on-demand report can get swept into a close commit.
5. **Committed dogfood board is stale vs the shipped fold.** The committed `docs/roadmap.md` renders 4 columns and no `### Ship` section; the current `bkit-roadmap-fold.sh` renders 5 columns (matching the plan's Data Schema contract) plus `### Ship`. It was generated by a pre-remediation version of the script and never re-folded — self-heals on the next close, but is currently the feature's only end-to-end evidence, and it's wrong.

None of the five appears in `docs/deferrals.jsonl`, any plan Out-of-Scope table, the design's non-goals, or a phase summary — they are logged only as a bug (`docs/failures.jsonl` key `380-holistic-verify-5-cross-sub-plan-integration-gaps`, `status: OPEN`), which confers no exemption. All five are therefore unplanned gaps that must be either fixed or explicitly deferred with an owner before this PR can re-attempt ship.

**Resolved, do not re-investigate:** the debug-attempt-1 rebase conflict (3 files: `.bkit/workflows.md`, `.bkit/src/bkit-manifest.test.ts`, `docs/completed.md`) is fully resolved by the human's manual continuation; branch is clean and rebased. The stale `docs/deferrals.jsonl` row for that abort (`380-debug-attempt-1-aborted-rebase-conflicts-before-diagnosis`) is closed as part of writing this handover.

## Recommended Next Steps

**Option A — Route back to `bkit-debug` (or a fresh `bkit-build` gaps-remediate pass) to close all 5 gaps, then re-run `bkit-ship`. (Recommended.)**
✅ FIXES: all 5 gaps properly, with the design's own success criteria fully satisfied.
❌ DOES NOT FIX: nothing outstanding — this is the complete fix.
⚠️ COST: Per `ship-deferred-sweep.md` § Handover Notes, gaps 1–4 are small, well-scoped edits (add one `bkit_roadmap_fold` call site to ship's close path; remove or properly implement the `### Ship` section; port ~25 lines of shell-bus counter derivation into `bkit-roadmap.md`; add one `.gitignore` line + template mirror); gap 5 is a re-fold + commit, cheapest of the five and should be done last (after gap 2 is decided, so the artifact matches the final renderer). Estimated 1–2 hours of focused work, low risk — the gaps are additive/isolated, not architecture-level.

**Option B — Defer the gaps explicitly (declared `docs/deferrals.jsonl` rows + plan Out-of-Scope updates with owners) and override the sweep to ship as-is.**
✅ FIXES: unblocks merge immediately.
❌ DOES NOT FIX: any of the 5 gaps — the board will visibly misbehave in production (ship closes won't regenerate the status section; consumers see a bkit-internal placeholder string in their `docs/roadmap.md`; on-demand refreshes silently lose coverage telemetry) until a later fast-follow closes them.
⚠️ COST: Requires deliberately untick-ing the plan checkboxes that currently assert behaviour that cannot occur as built (sub-plan 2 Concrete Example step 4, sub-plan 3 Manual Verification step 4) — a paper-trail cost, not a code cost. Only sensible if there's schedule pressure to ship the mechanical/analysis tiers now and gap 2 in particular (shipping bkit's internal sub-plan numbering to every consumer) is judged tolerable short-term.

**Option C — Fix only the highest-severity gap (1: ship-close fold) and defer the rest.**
✅ FIXES: the one gap that breaks a Success Criterion outright (SC#1 for the ship close) and is also a prerequisite for gap 5's re-fold being meaningful long-term.
❌ DOES NOT FIX: gaps 2–4 (placeholder leak to consumers, missing on-demand coverage counter, undeclared scratch path) — all still ship as-is.
⚠️ COST: Smallest targeted fix, but leaves the consumer-visible `### Ship` placeholder text (gap 2) in production, which is arguably worse optics than gap 1 alone; would still need explicit deferral rows for gaps 2–4.

## Recommended Path

**Option A.** All 5 gaps are small, additive, well-diagnosed fixes with an exact remediation recipe already written in `ship-deferred-sweep.md` § Handover Notes (reproduced under Persistent Errors above) — there is no design ambiguity left to resolve, only implementation. Given the PR has already survived a full build cycle, a rebase-conflict debug abort, and a manual human rescue to get this far, the lowest-risk path to actually shipping a fully-correct feature is one more focused pass (likely `bkit-build-plan-gaps-remediate`-shaped, or a fresh `bkit-debug` cycle now that the branch is clean) rather than shipping known-incomplete behavior and hoping the deferred fast-follow happens.

## Reference Docs

- `docs/plans/202607/logs/380-roadmap-analysis-refresh/ship-deferred-sweep.md` — the FAIL verdict this handover summarizes; primary source for all 5 gaps and their remediation recipes.
- `docs/plans/202607/logs/380-roadmap-analysis-refresh/build-plan-verify-holistic.md` — where the 5 gaps were first found (2026-07-29), including the full gate-suite pass evidence.
- `docs/plans/202607/logs/380-roadmap-analysis-refresh/debug-handover.md` — the aborted debug attempt (rebase conflicts), now fully resolved; explains why the gaps reached ship undiagnosed.
- `docs/plans/202607/380-roadmap-analysis-refresh-plan.md` (+ `-plan-1.md`/`-plan-2.md`/`-plan-3.md`) — master plan + 3 sub-plans; sub-plan 1 § `[MODIFY] .bkit/workflows/bkit-ship.md` is where the ship-close fold was deferred to "sub-plans 2/3" and never picked up.
- `docs/plans/202607/logs/380-roadmap-analysis-refresh/status.jsonl` — full workflow history: design DONE, plan DONE, build FAILED at holistic verify (5 failures), debug FAILED at Step 2, this ship run FAILED at Step 5 (deferred sweep, 5 failures).
- `docs/failures.jsonl` key `380-holistic-verify-5-cross-sub-plan-integration-gaps` (`ts` 1785401000001, `status: OPEN`) — the bug-log record of the 5 gaps.
- `docs/deferrals.jsonl` key `380-debug-attempt-1-aborted-rebase-conflicts-before-diagnosis` — closed by this handover (rebase resolved by the human continuation); do not let closing it be mistaken for closing the 5 gaps themselves, which remain open.
- `docs/deferrals.jsonl` key `380-bootstrap-seed-key-namespace-mismatch-vs-migrated-completed-md-keys` (OPEN, unrelated minor cosmetic issue, not blocking) — legacy migrated rows render synthesised `completed-…-<hash>` keys instead of FIDs in the `## Shipped` column; noted by the sweep as a corollary, not one of the 5 blockers.
