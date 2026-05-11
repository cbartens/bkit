Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

## Findings

### Finding 1 — bkit-ship.md sentinel touched before logs dir created (HIGH, mechanical)

- **Severity:** HIGH
- **Class:** mechanical
- **Location:** `.agents/workflows/bkit-ship.md:151-155, 169`
- **Exploit scenario:** In Step 2's worktree-resume branch, `touch "docs/plans/logs/{FID}/.rebase-failed"` (line 154) runs INSIDE the `if [ -d "$WORKTREE_PATH" ]` block, after `cd "$WORKTREE_PATH"`. The `mkdir -p docs/plans/logs/{FID}/` runs at line 169, AFTER the if/else block. If `docs/plans/logs/{FID}/` doesn't exist yet inside the worktree (e.g. after a fresh checkout of a feature branch where logs were `.gitignore`d, or after manual cleanup), `touch` fails with "No such file or directory". The bash block has no `set -e`, so failure is silent. The sentinel never gets written, sub-step 3a's `[ -e ... ]` check returns false, the rebase-failed Failure Path NEVER fires, and the workflow proceeds with rebase state aborted but no error signal — defeating the whole point of Fix 5.
- **Suggested fix:** Move `mkdir -p "docs/plans/logs/{FID}/"` before the `if [ -d "$WORKTREE_PATH" ]` block, OR add `mkdir -p "docs/plans/logs/{FID}/" &&` before the `touch` call inside the rebase-failure branch. The simpler fix is the inline `mkdir -p` in the failure branch since the post-block `mkdir -p` (line 169) won't run if a path before it errors out.

### Finding 2 — Long-branch advisory misreports when origin/dev not yet fetched (MEDIUM, mechanical)

- **Severity:** MEDIUM
- **Class:** mechanical
- **Location:** `.agents/workflows/bkit-build.md:91-96`
- **Exploit scenario:** Step 1a runs BEFORE any `git fetch origin` (the first fetch is in Step 3 Branch Sync sub-step 1, not Step 1). On a fresh clone, or after the local `origin/dev` ref has been pruned, `git rev-list --count HEAD..origin/dev` errors with "unknown revision or path not in the working tree" (suppressed via `2>/dev/null`) and the `|| echo 0` fallback yields `behind=0`. Operator sees `[bkit-build] feature branch is 0 commits behind dev / unknown since divergence` even though branch is N commits behind. Worse: if `origin/dev` exists locally but is stale (last fetched 3 days ago), `behind` reports stale count, not actual count — which is the OPPOSITE of the long-branch advisory's intent. The plan's SC-5 specifies "regardless of N", but the value is silently wrong when ref is missing or stale.
- **Suggested fix:** Add `git fetch origin dev 2>/dev/null` immediately before the `git rev-list` to ensure the ref is current. Alternatively, detect missing/stale ref and emit `[bkit-build] feature branch divergence: unknown (origin/dev not fetched — run /bkit-build after a fresh clone fetch)` rather than silently falsifying as 0.

### Finding 3 — Long-branch advisory `age` falls back to HEAD age, not "unknown" (MEDIUM, mechanical)

- **Severity:** MEDIUM
- **Class:** mechanical
- **Location:** `.agents/workflows/bkit-build.md:94`
- **Exploit scenario:** `age=$(git show -s --format=%ar $(git merge-base HEAD origin/dev 2>/dev/null) 2>/dev/null || echo "unknown")`. When `git merge-base HEAD origin/dev` fails (e.g. `origin/dev` ref absent, or unrelated histories), the inner subshell substitutes empty string. The outer `git show -s --format=%ar` (with no rev arg) defaults to HEAD, exits 0, and outputs the age of HEAD — NOT "unknown". The `|| echo "unknown"` branch is never reached because `git show -s --format=%ar` succeeds (it just operates on HEAD by default). Operator sees a valid-looking timestamp ("4 hours ago") that has nothing to do with divergence age.
- **Suggested fix:** Capture merge-base into an explicit variable first and check non-empty: `mb=$(git merge-base HEAD origin/dev 2>/dev/null); age=$([ -n "$mb" ] && git show -s --format=%ar "$mb" 2>/dev/null || echo "unknown")`. The current command-substitution form swallows the empty-mergebase signal.

### Finding 4 — bkit-build-plan-verify.md Fix 1b directive lands findings outside `## Gaps Identified` section (HIGH, mechanical)

- **Severity:** HIGH
- **Class:** mechanical
- **Location:** `.agents/prompts/bkit-build-plan-verify.md:39, 49-82`
- **Exploit scenario:** Process step 4 instructs "For each gap found, append finding entry at EOF via Bash `echo {finding} >> {output}`". But the Output format defines six structured sections after `# Plan Verification`: `## Scope`, `## Gaps Identified`, `## Sub-Plans Verified`, `## Integration Gaps`, `## Previously Attempted`, `## Notes`. EOF is the end of `## Notes`, NOT `## Gaps Identified`. Findings appended at EOF land in the `## Notes` section, breaking the structured format that downstream consumers (`bkit-build-plan-gaps-remediate`) expect. The agent will likely either (a) violate the directive and use `Edit` to land findings in the right section, defeating Fix 1b's "no Edit" intent; or (b) follow the directive literally and produce a malformed artifact where gaps appear under Notes. Compare to `bkit-build-plan-execute.md` whose flat-log Output format (line 60) is explicitly compatible with EOF append — that's why the pattern was designed for L-tier flat-log agents per `prompts.md` § "Flat append-only log" row. `bkit-build-plan-verify` is a multi-section stubbed agent, mismatched.
- **Suggested fix:** Either (a) restructure `bkit-build-plan-verify.md` Output format so `## Gaps Identified` is the LAST section (so EOF == end of gaps), or (b) keep multi-section structure and revert Fix 1b on this file to the canonical `replace each PENDING via Edit` standing directive (matching the "Stubbed output" row in `prompts.md` § Special Behaviors line 271). Option (b) preserves architecture; option (a) preserves Fix 1b but requires reordering downstream consumer parsing.

### Finding 5 — bkit-build-challenge-tests.md references `Bugs Discovered` section that doesn't exist in Output format (MEDIUM, mechanical)

- **Severity:** MEDIUM
- **Class:** mechanical
- **Location:** `.agents/prompts/bkit-build-challenge-tests.md:42, 49-63`
- **Exploit scenario:** Process step 6: "For each `Bugs Discovered` entry, append via Bash `echo {finding} >> {output}` as work progresses." But the Output format defines only `# Build Challenge Testing`, `[Brief]`, and `## Blockers` — no `## Bugs Discovered` section anywhere. Appending at EOF lands findings inside the `## Blockers` section (which has different semantics: `Blockers` are FAIL-reasons; `Bugs Discovered` are out-of-scope per step 6 line 42 "do NOT block this agent's verdict"). Operator gets `Verdict: PASS` with bug entries in the Blockers section — confusing and structurally broken.
- **Suggested fix:** Add `## Bugs Discovered\n\n[List of out-of-scope bugs found during test runs, one per line. Do NOT block this agent's verdict.]` AFTER `## Blockers` in Output format (keeping it as last section so EOF appending lands here). Or move it BEFORE `## Blockers` if blockers must remain last for downstream parsing.

### Finding 6 — Stale `bkit-build-challenge` (no suffix) reference in prompts.md Loop context row (LOW, mechanical)

- **Severity:** LOW
- **Class:** mechanical
- **Location:** `.agents/prompts.md:269`
- **Exploit scenario:** Special Behaviors table row "Loop context accumulation" lists `bkit-build-plan-verify`/`bkit-build-plan-gaps-remediate`, `bkit-build-challenge`/`bkit-build-challenge-remediate`, `bkit-debug-failure-diagnose`. The bare `bkit-build-challenge` (no suffix) was deleted in this diff but the row still references it. Verification Plan Step 15 specifies `Grep "bkit-build-challenge[^-]"` should return zero hits across `.agents/`. Confirmed via Grep: line 269 in prompts.md still matches. Index drift = regression per `bkit Repo Authoring` rules and per the plan's Verification Plan Step 15 + Manual Verification Step "No-leak check".
- **Suggested fix:** Update line 269 to either drop the entry (parallel-pair `bkit-build-challenge-*` doesn't share the loop-context-glob pattern that the row describes) or replace with `bkit-build-challenge-1`/`bkit-build-challenge-2`/`bkit-build-challenge-remediate` — but reviewing the row's intent (loop context accumulation via per-attempt log files), the parallel pair doesn't fit the pattern (each parallel run produces fixed-name `build-challenge-1.md`/`build-challenge-2.md` artifacts, no `*-{N}-*.md` loop). Drop the entry.

### Finding 7 — bkit-build.md Step 1 sub-step "1a" numbering may break sequential tooling (LOW, mechanical)

- **Severity:** LOW
- **Class:** mechanical
- **Location:** `.agents/workflows/bkit-build.md:91`
- **Exploit scenario:** Step 1's sub-steps go `1, 1a, 2, 3, ...`. The `1a.` form is mid-step interleaving common in bkit-ship.md `3a.` and is parsed correctly by orchestrator agents reading sequentially. However, the `1a` substep is OUTSIDE the bash block from sub-step 1 (separate prose block), so it's a discrete sub-step. The plan template `1a` form was designed for sub-steps that condition on prior bash output (e.g., bkit-ship Step 2 sub-step 3a checks the sentinel from sub-step 2). Here `1a` is unconditional advisory output — it should logically be sub-step 2 with renumbering of subsequent sub-steps. Cosmetic but inconsistent with the rest of the file's numbering style. Forward-jump remap table in plan §Architecture didn't account for this sub-step (numbering is by major step only).
- **Suggested fix:** Either renumber sub-step 1a to a proper "2" with all subsequent sub-steps shifted by +1 (and update Gate 1 references), or accept the `1a` convention if the project standard allows interleaved sub-steps. No functional bug, just style debt.

### Finding 8 — bkit-build.md `[skip ci]` not appended to status commits in build-challenge / reconcile / remediate (MEDIUM, architectural)

- **Severity:** MEDIUM
- **Class:** architectural
- **Location:** `.agents/workflows/bkit-build.md:494-499 (Step 9), 527-532 (Step 10), 572-577 (Step 11)`
- **Exploit scenario:** Other workflow status commits use `[skip build] [skip ci]` markers to prevent CI loops on every status update (e.g., Step 4 line 264, Step 7 line 269, Step 16 line 783). The new Step 10 (Reconcile) and existing Step 9 (Build Challenge) status commits do NOT include these markers. Each status commit triggers a CI run on the feature branch, which:  (a) wastes CI minutes; (b) adds noise to PR status checks; (c) violates the auto-memory `feedback_skip_ci_pr_trigger.md` rule. The diff doesn't introduce this regression for Step 9 (pre-existing) but it propagates the antipattern to NEW Step 10. Note: the user's auto-memory says `skip-ci commits must not be HEAD when PR is created` — but mid-build status commits ARE the right place to skip CI.
- **Suggested fix:** Add `[skip build] [skip ci]` to Step 9 / Step 10 / Step 11 status commit messages (lines 494, 499, 527, 532, 572, 577). Audit the rest of the file for missing markers.

### Finding 9 — Sentinel cleanup missing in bkit-ship.md after Failure Path or successful resume (MEDIUM, architectural)

- **Severity:** MEDIUM
- **Class:** architectural
- **Location:** `.agents/workflows/bkit-ship.md:151-155, 180, 54`
- **Exploit scenario:** Sentinel `docs/plans/logs/{FID}/.rebase-failed` is created but NEVER deleted. If a user (a) sees the rebase failure, (b) manually resolves the conflict outside the workflow, (c) re-invokes `/bkit-ship`, the sentinel still exists from the prior run. Step 2 sub-step 3a's `[ -e ... ]` check fires immediately and routes to Failure Path even though rebase has been resolved. Operator must `rm` the sentinel before retry — undocumented step. Compare to the `.lock` file pattern, which is explicitly removed in the Failure Path (line 43) and in close-workflow steps. The sentinel has no equivalent cleanup.
- **Suggested fix:** Add `rm -f "docs/plans/logs/{FID}/.rebase-failed"` to (a) the start of Step 2 sub-step 2 (so the check is fresh per invocation, not stale from prior run), (b) the Failure Path after the handover is invoked, and (c) any other resume-eligible entry point. Document the cleanup in Gate 2.

### Finding 10 — Multiple gate checkboxes reference stale (pre-renumber) Step numbers (HIGH, mechanical)

- **Severity:** HIGH
- **Class:** mechanical
- **Location:** `.agents/workflows/bkit-build.md:728, 766, 809, 851`
- **Exploit scenario:** The renumber +1 shift (old Steps 10→11, 11→12, ..., 17→18, with NEW Step 10 inserted) was supposed to update every Step-N reference inside the file body per the plan's Forward-jump remap table (plan lines 360-385). The gate-checkbox lines below reference the WRONG step number after renumber:
  - Line 728 (Gate 14 — Failure Diagnose): `Issue comment attempted (`Step 13` section)` — actual comment posted at line 716 is `### Step 14 — Failure Diagnose`. Should be `Step 14`.
  - Line 766 (Gate 15 — Failure Remediate): `Issue comment attempted (`Step 14` section)` — actual comment at line 755 is `### Step 15 — Failure Remediate`. Should be `Step 15`.
  - Line 809 (Gate 16 — Summary): `Issue comment attempted (`Step 15` section)` — actual comment at line 793 is `### Step 16 — Summary`. Should be `Step 16`.
  - Line 851 (Gate 17 — Create PR): `Issue comment attempted (`Step 16` section)` — actual comment at line 842 is `### Step 17 — Create PR`. Should be `Step 17`.
  Plan SC-3 / Verification Plan Step 15 specifies "step inventory monotonic 1..18 post-renumber (no stale Step-N refs)". Verification check `Grep "Step 1[0-7]"` would catch line 728, 766, 809, 851 as stale. The plan's task list (Task 8) explicitly required walking the remap table row-by-row but the gate-checkbox references were missed. Operator/agent following the gate may look for "Step 13 section" in the Linear comment thread and conclude the comment wasn't posted (because it was posted as "Step 14"), failing the gate spuriously.
- **Suggested fix:** Edit the four lines: 728 → `Step 14`; 766 → `Step 15`; 809 → `Step 16`; 851 → `Step 17`. Verify via `Grep -n "Issue comment attempted" .agents/workflows/bkit-build.md` followed by manual cross-check against each gate's owning Step header.

### Finding 11 — Plan Task 12 friction.md `FIXED-IN: BAR-155` markers absent (MEDIUM, mechanical)

- **Severity:** MEDIUM
- **Class:** mechanical
- **Location:** `.agents/friction.md` (entire file; plan Task 12 line 561, Verification Plan line 637)
- **Exploit scenario:** Plan Task 12 specifies "Edit `.agents/friction.md` — for each of the 5 retained entries, update `Status:` line to `FIXED-IN: BAR-155`". Plan Verification Plan Step 9 validates: `Grep "FIXED-IN: BAR-155" .agents/friction.md` → 5 hits expected. Actual: zero hits in the current friction.md. The five entries listed in plan §`[MODIFY]` `.agents/friction.md` (e.g., "Plan-execute agent returned PENDING verdict after ~20min (2026-05-06)", "bkit-plan-generate stream-timeout on multi-issue plan input (2026-05-06)", etc) are not present in the file at all — the file contains four 2026-05-09 entries that don't match the plan's expected titles. This means EITHER (a) Task 12 was never executed, OR (b) the friction-log entries the plan references were already pruned/never present. Either way, the plan's Success Criteria about marking 5 entries cannot be verified, and downstream readers tracking which friction items shipped under BAR-155 have no audit trail. Plan task is marked `[x]` (line 561) which is misleading.
- **Suggested fix:** Either (a) re-run Task 12 if those entries should exist (restore them from git history first), OR (b) update plan §`[MODIFY]` `.agents/friction.md` and Verification Plan Step 9 to match reality (zero entries to mark, since the file has been pruned). The Status line of plan Task 12 should not be `[x]` if the markers are absent.

### Finding 12 — bkit-build-challenge-reconcile.md Failures count contradicts max-wins verdict semantics (LOW, architectural)

- **Severity:** LOW
- **Class:** architectural
- **Location:** `.agents/prompts/bkit-build-challenge-reconcile.md:57-61`
- **Exploit scenario:** Process step 8: `Count Failures = number of CRITICAL findings (post-dedup)`. Process step 9 mapping: `CONCERNS = at least one finding, max severity ≤ HIGH`. The orchestrator (bkit-build.md Step 10 line 523, Gate 10 cross-field invariants per line 22 of the workflow header) enforces `CONCERNS ⇒ failures≥0` — OK. But `FAIL ⇒ failures>0` is also documented as a cross-field invariant. If the reconciler counts `Failures` as ONLY CRITICAL count (per step 8), and verdict is FAIL when any CRITICAL exists, that's consistent. However, sibling parallel-pair agents (e.g., `bkit-plan-review-*`) define `Failures` as TOTAL findings (HIGH + CRITICAL combined). The reconciler unilaterally redefines `Failures` semantics. If the orchestrator's status.json schema or `bkit-build-challenge-remediate` consumer expects total findings, the value is wrong post-reconcile.
- **Suggested fix:** Verify and document the Failures-count semantics. Either align reconciler with sibling agents (count all findings, not just CRITICAL) or audit downstream consumers (`bkit-build-challenge-remediate`, status.json) to confirm CRITICAL-only is the contract. Add a comment to step 8 explaining the choice.


