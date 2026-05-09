Verdict: CONCERNS
Failures: 4

<!-- verdict:end -->

# Plan Review

## CRITICAL

1. **Build workflow renumber drift — claims "former Step 17 → Step 18" but workflow tops out at Step 15.** `Architecture & Component Changes → bkit-build.md → Renumber:` says "former Step 17 → Step 18". The actual `bkit-build.md` step inventory (verified via `Grep`) is: Step 1 Start Workflow, 2 Worktree Setup, 3 Branch Sync, 4 Install Skills, 5 Plan Execute, 6 Plan Verify, 7 Plan Gaps Remediate, 8 Plan Verify Holistic, 9 Build Challenge, 10 Build Challenge Remediate, 11 Build Challenge Tests, 12 Run Tests, 13 Failure Diagnose, 14 Failure Remediate, 15 Summary. Inserting a NEW Step 10 (Reconcile) shifts: 10→11 (remediate), 11→12 (tests), 12→13 (run-tests), 13→14 (diagnose), 14→15 (remediate), 15→16 (summary). The plan's "up to Step 18" suggests the author miscounted — risk that runbook Task 11 misses several forward refs. Fix: replace explicit "Step 17 → 18" with verified end-step (Step 15 → 16), and enumerate every forward jump that must be remapped (Step 9 PASS jumps to current Step 12 = new Step 13; Step 11 routing "re-run Step 9 else Step 12" must remap; Step 12 routing "→ Step 15" on PASS and "→ Step 13" on FAIL; Step 14 routing "→ Step 12"; comment headings `### Step N — ...` in every status-comment block).

2. **Reconciler severity ladder uses non-existent terms (BLOCK / WARN).** `Architecture & Component Changes → bkit-build-challenge-reconcile.md → Process step 6/7` and `Acceptance Scenario → Edge Cases` cite severities `BLOCK > WARN > PASS / FAIL > CONCERNS > PASS`. Existing `bkit-build-challenge.md` (read verbatim) defines per-finding severity as `CRITICAL/HIGH/MEDIUM/LOW` and verdict as `PASS|CONCERNS|FAIL`. The reconciler must be drop-in compatible with the existing remediate consumer; using `BLOCK/WARN` terminology in the prompt or its outputs breaks downstream extraction (`Read build-challenge.md until <!-- verdict:end -->` in workflow Step 9/10/11). Fix: replace with the canonical ladder — severity max-wins on `CRITICAL > HIGH > MEDIUM > LOW`, verdict `FAIL` if any CRITICAL else `CONCERNS` if any finding else `PASS`.

3. **Fix 2 task-count cap (>15 tasks → SPLIT) would self-refuse this very plan.** This plan contains 18 tasks (verified `grep -cE '^- \[ \] \*\*Task \d+' plan-v1-draft.md` = 18). Once Fix 2 ships, any future re-run of `bkit-plan` over a similar-shape plan-input would force `SPLIT`, but the ship vehicle (this plan, 18 tasks) demonstrates the threshold is too aggressive against bkit-internal plans. Either (a) lower the actual task count of this plan to ≤15 before merging by collapsing trivial tasks (e.g., Task 17 ADR + Task 18 pending append could be a single "Documentation Append" task; Task 4 audit pass is a single classification step), OR (b) raise the cap to 20 (Linear issue actually says "20 = lowest dirty"; "15 = safe boundary" is conservative). Recommend (a) — it preserves Linear's prescribed boundary while letting this plan ship.

4. **Renumbering plan understates routing risk in `bkit-build.md` Step 9 → Step 11.** Current Step 9 routes: PASS→Step 12, CONCERNS@<1→Step 10, FAIL@<1→Step 10, FAIL@>=1→Failure Path. After insertion of new Step 10 (Reconcile) and renumbering: the verdict-extraction logic moves to NEW Step 10 (per plan), so the PASS→Step 12 jump must become `→ NEW Step 13` (Run Tests), not Step 12 (now Build Challenge Tests). The plan section "Sub-step 4-onwards: branching identical to current Step 9 sub-steps 4–11" is correct in principle but the runbook Task 11 only says "Update every `Step N` reference" — without enumerating which targets remap. Add explicit before/after table to runbook Task 11 covering: Step 9 sub-step 6 (`→ Step 12` becomes `→ Step 13`), Step 9 sub-step 7/9 (`→ Step 10` becomes `→ Step 11`), Step 11 sub-step 6 (`re-run Step 9` stays; `else → Step 12` becomes `→ Step 13`), Step 12 sub-step 6 (`→ Step 15` becomes `→ Step 16`), Step 13 sub-steps if any reference, Step 14 sub-step (`→ Step 12` becomes `→ Step 13`), gate labels (`Gate 10` → `Gate 11`, etc), and comment-block headers `### Step N`.

## OPTIONAL

- **`bkit-build.md` Step 2 has the same `git rebase ... || { echo "Rebase conflict — resolve manually"; exit 1; }` anti-pattern as ship Step 2** (verified `bkit-build.md:153`). The plan's Fix 5 only patches `bkit-ship.md`. Linear issue scoped Fix 5 to ship explicitly, so this is consistent — but the same friction class will persist on build entry. Suggest either (a) extending Fix 5 to build's Step 2 in the same PR, or (b) adding a follow-up note in `docs/pending.md` so it surfaces.

- **Multi-issue gate false positive — incidental `BAR-N` references.** `plan-input.md` regularly contains `BAR-N` mentions in "Related" sections, prior-issue narrative, or doc paths (this very plan's input has BAR-131 / BAR-137 / BAR-93 / BAR-132 / BAR-141 / BAR-148 references in narrative — count = 6+). Plan acknowledges this in Edge Cases ("user splits prose mentions"), but the gate as specified (`grep -oE 'BAR-[0-9]+' | sort -u`) will refuse this plan's own input. Suggest tightening the regex to count only `BAR-N` tokens that appear at the start of a line OR inside a designated `## Linear Issue:` heading section, not anywhere in prose. Alternatively, extract from the session prompt (`bkit-plan BAR-155`) which is a single token by design.

- **Reconciler `cp` source choice ambiguous.** Process step 1 says "`cp` of one input as scaffold (or fresh `Write` of skeleton — match `bkit-design-update.md` exactly)". `bkit-design-update.md` copies the prior versioned design — but in challenge there is no "prior" file, both inputs are sibling. Pick one explicitly: either copy `-1` (Opus, `effort: high` slot — likely deeper findings) and surgically merge `-2`, or `Write` a fresh skeleton. Document the choice in the prompt.

- **`maxTurns: 50` for reconciler may be over-budgeted.** `bkit-design-update.md` is 50 turns because it rewrites a multi-section design doc. Challenge reconcile is structurally smaller (a Findings list dedup + a single `Verdict:` Edit). 30 turns aligns better with `xhigh / Opus` budget for synthesizers operating on small inputs.

- **Plan asserts `bkit-build-plan-verify.md` and `bkit-build-challenge-tests.md` exist; runbook Task 1 captures verbatim from execute/gaps-remediate but does not Read these target files first.** Add explicit Read step in runbook Task 2/3 to confirm the current Process step number where the directive lands (Process step 4 may not be the right slot in `*-tests`; tests have a different Process layout).

- **`docs/decisions.md` ADR addition is light on substance.** Currently described as "ADR for Parallel `bkit-build-challenge` pair + reconcile decision". An ADR should record (a) context, (b) decision, (c) alternatives rejected, (d) consequences. The plan's "Alternative Approaches" section already has the rejected list — fold those rejections into the ADR explicitly.

- **`Frontmatter` of new `bkit-build-challenge-1.md`: existing `bkit-build-challenge.md` is `effort: xhigh, model: claude-opus-4-7`.** Plan correctly downgrades `-1` to `effort: high`. Update `.agents/prompts.md` Effort tiers table § `xhigh` row to remove `bkit-build-challenge` AND add `bkit-build-challenge-reconcile` — currently the plan says "replace `bkit-build-challenge` with `bkit-build-challenge-reconcile` in `xhigh` row" which is correct, but the workflow trace also needs to verify the `xhigh` row examples list stays canonical (see Mandatory Tasks).

- **Failure Path Step 4 condition broadening for ship — preserve idempotency.** The proposed condition `MAX_*_ATTEMPT exceeded OR REBASE_FAILED = true` is fine, but ship's `MAX_MERGE_ATTEMPT` is set in Step 2 sub-step 5 (after rebase). If rebase fails, those MAX_* counters are unset; downstream comparison may need a `[ -z "${MAX_VERIFY_ATTEMPT:-}" ] && ...` guard. Confirm shell semantics in the plan.

## OUT OF SCOPE

- **Retrofit `bkit-design-review-*` and `bkit-plan-review-*` parallel pairs with the `Parallel:` Contract guard** — the plan adds it only to new `bkit-build-challenge-1/-2`. Linear issue Out of Scope explicitly says no retrofit; plan correctly excludes. Out-of-scope.

- **Auto-renumber KN-* / DE-* on rebase conflicts** — Linear-defined Out of Scope; plan correctly excludes.

- **Replace `bkit install` mirror-regen with delta sync** — out of scope; plan correctly defers.

- **`task-range` parameter for `bkit-build-plan-execute`** — plan correctly defers via `docs/pending.md` append.

- **Telemetry / Linear MCP integrations / new CI gates** — plan explicitly out of scope.
