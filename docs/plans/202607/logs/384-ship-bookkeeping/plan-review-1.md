Verdict: FAIL
Failures: 3
<!-- verdict:end -->

# Plan Review — 384-ship-bookkeeping (Lens 1)

Lens: Plan tightness, scope discipline, design-coverage, dependency correctness.

Scope of review: `docs/plans/202607/logs/384-ship-bookkeeping/plan-v1-draft.md` against `plan-input.md` (issue + appended design), `related-deferrals.md`, `related-failures.md`, `docs/plans/template.md`, `.agents/rules.md`. Codebase probes run against the post-#341 worktree state.

## CRITICAL

### C1 — Task 0 (WS-1) GO/NO-GO `Done when` cites a marker that is structurally absent from ship — root gate is unpassable as written

`plan-v1-draft.md:445` (Task 0 Done-when) asserts:

> current `bkit-ship.md` Step 9 contains `bkit_close_guard_checkout` (post-#341 marker) — confirms diff base.

Codebase evidence contradicts this:

- `grep -c 'bkit_close_guard_checkout' .bkit/workflows/bkit-ship.md` → **0**. Also `bkit_close_guard_scan_body` / `bkit_close_guard_cross_check` → 0 in ship.
- `.bkit/workflows.md:114` explicitly documents: **"Ship Step 9 does NOT use `bkit_close_guard_checkout`"** — the helper installs an `EXIT` trap that would undo staying on `dev` for Steps 10–13 and clobber the DEVLOCK trap; ship asserts the double-guard condition **inline instead**.
- The close-guard kernel from #341 HAS landed (`bkit_close_guard_checkout` defined at `.bkit/scripts/bkit-runtime.sh:430`; called in `bkit-design.md`, `bkit-plan.md`, `bkit-build.md`, `bkit-debug.md`) — ship is the documented exception, not the marker of presence.

Consequence: Task 0 is the plan's root serialisation GO/NO-GO (every other task depends on it). Its pass criterion is unachievable against the actual diff base. A builder executing literally either blocks at the root gate (best case) or — worse, given the "fix code, never gate" rule — weakens the check to make it pass, which is the precise anti-pattern this plan exists to prevent. It also violates `.agents/rules.md` "No invented symbols."

Fix: replace the marker with one actually present in post-#341 ship prose — any of `RUNTIME_DEVPUSHES` (`bkit-ship.md:28,825,833,…`), `bkit_runtime_row ship` (`:320`), the inline double-guard condition, or verify the kernel landed in `.bkit/scripts/bkit-runtime.sh` instead of in ship's Step 9. The intent ("confirm diff base is post-#341") is correct; the assertion is wrong.

Note: the plan's claim that #341 is CLOSED (`Context & Goals:24`) is accurate against the worktree (runtime-resolved-row CLOSED per `related-failures.md:2`; `RUNTIME_DEVPUSHES`/`bkit_runtime_row` present). The appended design's "OPEN" label is stale — not a plan defect. The defect is solely the verification symbol.

## MAJOR

### M1 — "First-of-its-kind `gh` stub" premise is false; reuse-search false negative + overstated `[NEW]` justification + mis-calibrated cost hinge

The plan states in four places that no bats file in the repo stubs an external command and the PATH-shimmed `gh` stub is genuinely new infrastructure:

- Pre-Flight `Existing-solution search` (`plan-v1-draft.md:247`): "no bats file stubs an external command (Risk 12 correction); the PATH-shimmed `gh` stub is genuinely new infrastructure, not an evolution."
- Architecture `[NEW] tests/fixtures/gh/` (`:317`): "Why new: First-of-its-kind harness in this repo."
- Task 2 (`:449`): "Build the first-of-its-kind bats external-command stub."
- Gate 2 (`:473`): "The PATH-shimmed `gh` stub is justified as the first of its kind (Risk 12 correction)."

Codebase evidence contradicts the premise: `tests/bkit-runtime.bats:41-58` already PATH-shims a fake `gh`:

```
# A fake `gh` on PATH so RUNTIME_GITHUBCLI is deterministic across test environments
cat >"$FAKE_BIN/gh" <<'EOF'
…
chmod +x "$FAKE_BIN/gh"
```

So the PATH-shim idiom is an existing, reusable pattern. What IS genuinely new is the **fixture-file dispatch** (argv → JSON file under `tests/fixtures/gh/`); the PATH-shim wrapper is not. Impact:

1. The plan's `Existing-solution search` checkbox records a false negative — it missed `bkit-runtime.bats`, violating `.agents/rules.md` "Improve over duplicate" / "Existing-solution search."
2. The `[NEW] tests/fixtures/gh/` justification ("First-of-its-kind") is overstated; a reviewer would accept it uncritically.
3. The Risk-12 GO/NO-GO cost hinge ("~half a day") is calibrated against "first-of-its-kind." With the `bkit-runtime.bats` precedent, the harness is an extension of an existing idiom plus the new dispatch layer — cheaper than claimed, which is good news, but the hinge should be re-stated so a NO-GO decision is not taken on a wrong premise.

The carrier choice (build the stub) survives the correction, so this is MAJOR not CRITICAL. Fix: reframe Task 2 / Pre-Flight / Architecture / Gate 2 to "extend the `bkit-runtime.bats` PATH-shim idiom with fixture-file dispatch (the genuinely new piece)" and recalibrate the Risk-12 hinge.

### M2 — `Suggested Scope Expansion` ignores `related-deferrals.md`; five #384-deferred items neither surfaced as candidates nor cross-referenced

`docs/plans/template.md:187` mandates that `Suggested Scope Expansion` draw from "`docs/deferrals.jsonl` deferrals, `docs/failures.jsonl` failures." The provided `related-deferrals.md` carries five OPEN entries directly referencing #384:

- `384-extract-ship-git-ci-mechanics-into-a-tested-kernel` (kernel extraction)
- `384-promote-status-hole-detector-from-advisory-to-gate` (detector promotion)
- `384-ship-without-a-writable-branch-checkout-outside-b2` (remove writable checkout outside B2)
- `per-workflow-rollback-path-for-shipped-bkit-workflow-changes` (per-workflow revert mechanism)
- `384-ship-redesign-sequence-after-341` (sequencing — remediation satisfied by this plan existing)

The plan's `Suggested Scope Expansion` table (`plan-v1-draft.md:216-224`) has four rows, **none** sourced from `docs/deferrals.jsonl` — all are issue-body / #341 references. The substantive scope decision is correct (none are absorbed into scope — kernel extraction and detector-promotion are honoured as follow-ups, the manual rollback path is documented in `docs/deployments.md` via Task 9, and Task 0 records the sequencing decision), but the section exists specifically to surface prior deferrals for human review, and a peer reviewer scanning it would conclude no prior deferrals overlap. Additionally, Task 9 (`:463`) mirrors "the seven out-of-scope rows" into `docs/deferrals.jsonl` without acknowledging that three of these items already have prior OPEN deferral rows — risking duplicate ledger entries that `.bkit/jsonl.md` dedup tuples may or may not collapse.

Fix: add the five deferrals as `keep deferred` rows in `Suggested Scope Expansion` (candidate / source `docs/deferrals.jsonl` / surface / recommendation), and have Task 9 check existing entries before appending (per `.agents/rules.md` "check existing entries first").

## MINOR

### m1 — Task 5 (WS-8) dependency label "Task 6 contract (BOOK_ROOT)" misnames Task 3

`plan-v1-draft.md:455` (Task 5 Dependencies): "Task 4 (gate, per design ordering), **Task 6 contract (BOOK_ROOT** — refer to Task 3's published name even though the prose rewrite is Task 7)." `BOOK_ROOT` is defined in WS-6, which maps to plan **Task 3** (not Task 6 = WS-5 Gate Distribution). The parenthetical self-corrects, so the dependency edge is right, but the label is wrong and a builder reading serially could infer an unnecessary Task 6 → Task 5 edge. Design WS-8 `Requires: [WS-4, WS-6]` = Task 4 + Task 3. Fix: s/Task 6 contract/Task 3 contract/.

### m2 — Supersession Inventory omits the "rebase-on-resume" deletion row

Task 7 (`plan-v1-draft.md:459`) carries "the three deletions (rebase-on-resume, Step 3 prior-run diffing, Step 8 `Update: Source files.`)". The `Supersession Inventory` (`:396-406`) rows cover Step 3 diffing, Step 6.4 PRE_HEAD, `:618-620` push/update-branch, Step 8 retry loop, `bkit-protect-main.sh` literal, and the `git add -A` idiom — but NOT ship's unconditional rebase-on-resume. Template default is `DELETE` for replaced artifacts; the inventory should carry a row for the rebase-on-resume removal (with its line range) so the inventory and the runbook's "three deletions" agree.

### m3 — `BOOK_PATHS` literal allow-list not enumerated in any task contract

The design (`plan-input.md:423-429`) enumerates `BOOK_PATHS`: `docs/plans/{YYYYMM}/logs/{FID}/` + `docs/completed.md`, `docs/deferrals.jsonl`, `docs/failures.jsonl`, `docs/knowledge.jsonl`, `docs/decisions.jsonl`, `.bkit/friction.jsonl`, `.agents/skills`, `skills-lock.json`. The plan references `BOOK_PATHS` as "literal staging allow-list (+ named ledgers)" in Breaking Changes (`:130`), Concrete Example (`:66`), Task 3, and Task 7 — but never inlines the list. SC5 and the Tier-2 test hinge on the exact membership; a builder must consult the design to stage correctly. Recommend inlining the list in Task 3 (where the canonical step-key set is also published) so the plan is self-contained on the load-bearing allow-list.

### m4 — `RUNTIME_DEVPUSHES`-conditioned `BOOK_ROOT` selection is implicit in task contracts

The design's Data Model table (`plan-input.md:441-446`) makes `BOOK_ROOT`'s value conditional on `CAN_PUSH_DEV` (dev tree when true; current working branch / adopt tree when false — mode 3). The plan honours this in the Edge Cases table (`:84`) and Concrete Example (`:66`) and via Task 0's post-#341 verification, but neither Task 3 nor Task 7 spells the conditional selection into the contract the builder implements. Given this is the rule that unblocks 384 from #341 (and the subject of `384-ship-redesign-sequence-after-341`), it should be an explicit bullet in Task 7 Step 1, not only in the Edge Cases appendix.

### m5 — Helper-script count "9" vs 8 `.sh` (defensible but inconsistent with design)

Pre-Flight (`:247`) and Gate 2 (`:473`) say "9 helper scripts"; design said "eight." Actual: 8 `.sh` + 1 `.mjs` (`bkit-slop-type-suppression.mjs`) in `.bkit/scripts/`. Counting the `.mjs` makes 9 defensible; the design/plan discrepancy is cosmetic but the plan should pick one count and footnote the `.mjs`.

## OUT OF SCOPE

No additional out-of-scope findings. The plan's `Out of Scope` table correctly treats the design's rejected/deferred alternatives as `Exempt` (merge queue, required status checks on `dev`, executable kernel, head-move observer, Step-1 probe, surgical patch, cross-phase worktree conventions, `paths-ignore` residual). None of the #384-related deferrals in `related-deferrals.md` are absorbed into scope (verified: kernel extraction = gate-only; detector = advisory-only; ship-without-branch-checkout = only its two findings absorbed as decisions; per-workflow rollback = manual path documented, mechanism not built). The gap is surfacing (M2), not scope creep.

## SUGGESTED SCOPE EXPANSION

Surfaced from `related-deferrals.md` (advisory only — never tasks):

| Candidate                                                      | Source                 | Overlaps                                             | Recommendation                                                                                             |
| -------------------------------------------------------------- | ---------------------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `384-extract-ship-git-ci-mechanics-into-a-tested-kernel`       | `docs/deferrals.jsonl` | Out-of-Scope "Executable ship kernel" row            | Keep deferred — already in Out of Scope (`:204`); ensure Task 9 does not duplicate the ledger row          |
| `384-promote-status-hole-detector-from-advisory-to-gate`       | `docs/deferrals.jsonl` | Task 10 (Tier-3 advisory); Task 9 promotion criteria | Keep deferred — promotion gated on clean watermark; cross-link from Task 9/10                              |
| `384-ship-without-a-writable-branch-checkout-outside-b2`       | `docs/deferrals.jsonl` | Task 5 Step 12 ownership; push-timing invariant      | Keep deferred — design rejected full removal; two findings already absorbed                                |
| `per-workflow-rollback-path-for-shipped-bkit-workflow-changes` | `docs/deferrals.jsonl` | Task 9 `docs/deployments.md` manual rollback path    | Keep deferred — manual path is in scope; mechanism is the follow-up                                        |
| `384-ship-redesign-sequence-after-341`                         | `docs/deferrals.jsonl` | Task 0 serialisation decision                        | Keep deferred / close after Task 0 — remediation ("design/plan #384 after #341") is satisfied by this plan |

## Summary

- Workstream coverage: WS-1…WS-12 all map to Tasks 0…11; no orphaned or missing workstreams. Design sections (Architecture, Data Model, Flows 1–9, Decisions, Approaches, Risks 1–13) all map to tasks/docs.
- Dependency correctness: gate-first order holds (Task 4 gate + Task 3 RED invariant land before Task 7 prose rewrite; Task 5 failure-path hardening before Task 7). Design `Requires` lists faithfully reflected; Task 11 correctly adds WS-8 (Task 5) beyond the design's WS-12 list because SC3/SC4 are WS-8's surface. One mislabel (m1).
- Tiered carriers, `BOOK_ROOT`/`BOOK_PATHS`, outbox, push-timing invariant, `--match-head-commit`, path-scoped staging, and `RUNTIME_DEVPUSHES` conditional are all honoured (m3/m4 are explicitness gaps, not omissions).
- #341 serialisation: treated as landed (correct against worktree); the verification marker is the blocker (C1).
- Blocking issue is C1 alone; M1/M2 are correctness/completeness defects that should be fixed before build but do not block progression if the orchestrator reconciles them.
