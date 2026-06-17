Verdict: CONCERNS
Failures: 2

<!-- verdict:end -->

# Build Challenge

Reconciled from two parallel lenses: challenge-1 (bug/correctness) and challenge-2 (security).
No CRITICAL findings; the gate's runtime CI-dispatch logic and the D2 invariant (no new mid-build
trigger; gate fires only post-final-push) hold. Verdict CONCERNS, not FAIL: the actionable findings
are non-blocking fixes that do not ship a broken gate or a D2 regression.

Disposition legend: **REMEDIATE-NOW** (fix before merge) / **ACCEPT** (accepted-risk, fail-closed) /
**OUT-OF-SCOPE** (pre-existing or outside this PR's documented 2-site scope).

`Failures: 2` = count of REMEDIATE-NOW findings (F1, F2).

## Findings

### F1 — HIGH — architectural — REMEDIATE-NOW — post-push `ciDispatch` `step-done` is never committed/pushed (committed remote ledger loses the deliverable)

- **Lens:** bug/correctness (challenge-1 F1).
- **Severity:** HIGH. **Class:** architectural (the value is only known after push+poll, so it cannot ride the close-workflow commit — the close-workflow tail needs a follow-up persist, not a one-line move).
- **Location:**
  - `.bkit/workflows/bkit-build.md:1274-1282` (build Step 18 close-workflow) and the gate `jq ... >> "$STATUS"` tail.
  - `.bkit/workflows/bkit-debug.md:1078-1085` (debug create-pr LOCAL-mode sub-step 9) and PR-mode sub-step 3 `step-done` after the gate.
- **Exploit / failure scenario:** The `step-done` carrying the `ciDispatch` verdict is emitted AFTER the final `git push`; close-workflow / create-pr is the last step, so nothing afterward runs `git add/commit/push`. The `ciDispatch`-bearing `step-done` stays an uncommitted working-tree edit and never reaches `feat/{FID}`. On an ephemeral cloud-agent run the worktree is discarded → the verdict is permanently lost and the plan's own Concrete Example outcome (`status.jsonl` `step-done` carrying `ciDispatch.outcome='dispatched'`) is unmet on the remote. The committed remote ledger then has `workflow-done` but is MISSING the final `*-close-workflow` / `debug-create-pr` `step-done`; a resume/fold off the remote sees a DONE workflow whose final step never recorded. Locally it leaves `status.jsonl` dirty for the next workflow's `git add -A` to sweep into an unrelated commit.
- **Suggested fix:** After the gate's `jq ... >> "$STATUS"`, add `git add -A && git commit --allow-empty -m "chore({FID}): ci-dispatch-verdict bkit [skip build] bkit [skip ci]" && <branch-cased push>` so the verdict is persisted to `feat/{FID}`. The `[skip ci]` keeps it D2-safe (it lands after the loud trigger HEAD, so the rollup is already populated and no new run fires). Place it before the `case ... unresolved) exit 1` so the verdict persists even on the Failure-Path exit.
- `agreement: 1/2` (challenge-1 only; challenge-2's security lens did not target this).

### F2 — LOW — mechanical — REMEDIATE-NOW — WS-6 byte-equality test compares only the FIRST kernel; debug's second (LOCAL-mode) kernel is unguarded

- **Lens:** bug/correctness (challenge-1 F2).
- **Severity:** LOW. **Class:** mechanical (cheap test fix).
- **Location:** `.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts:160-171` (`extractSharedKernelLines` + the equality `it`).
- **Exploit / failure scenario:** Not a current defect (all kernels are presently byte-identical modulo indentation). `extractSharedKernelLines` returns only the FIRST `# --- ... kernel ---` block, so test #3 compares `build[0]` vs `debug[0]` (PR-mode) only. Debug has TWO kernel sites (PR-mode sub-step 3 and LOCAL-mode sub-step 9). A future one-sided edit to debug's LOCAL-mode kernel (changed `POLL_INTERVAL_S`, tweaked `poll_decide` jq filter, dropped `GH_ALL_ERRORED` reset) would pass every assertion while silently diverging the LOCAL-mode site — the WS-6 "byte-equal on the shared poll-loop" contract is only half-enforced (vacuous-guard / guard-rot class).
- **Suggested fix:** Extract ALL kernel blocks per file (loop until no further start delimiter) and assert every extracted block (trimmed) equals build's single kernel; at minimum assert debug contains exactly 2 kernels and both match build.
- `agreement: 1/2` (challenge-1 only).

### F3 — LOW — mechanical — ACCEPT (minor-hardening, fail-closed) — unguarded transient empties/failures convert to a wrong terminal verdict

- **Lens:** bug/correctness (challenge-1 F3) + security (challenge-2 F2) — merged: same root cause (an unguarded transient empty/failure in the gate tail flips the gate to a wrong terminal verdict, in a fail-direction).
- **Severity:** LOW. **Class:** mechanical. Both reported LOW independently; merged severity stays LOW (no divergence to escalate).
- **Location:**
  - `.bkit/workflows/bkit-build.md:1215`, `.bkit/workflows/bkit-debug.md:901` — `PR_NUMBER=$(gh pr list ... || echo "")`: a transient empty `PR_NUMBER` makes every `poll_decide` run `gh pr view ""` → errors → `GH_ALL_ERRORED` stays true → after the 60s budget concludes `unresolved(gh-error)` → `exit 1` Failure Path even when CI dispatched correctly (challenge-1 F3).
  - `.bkit/workflows/bkit-build.md:1251`, `.bkit/workflows/bkit-debug.md` (PR-mode + LOCAL-mode re-trigger push lines) — `git push --force-with-lease origin "$B"` has no exit-status guard: a lease rejection (remote advanced) still sets `PUSHED_HEAD` to the un-pushed local SHA and re-polls a HEAD GitHub never received → poll exhausts → false `no-ci` logged pass (challenge-2 F2).
- **Exploit / failure scenario:** Both paths require a transient condition (slow/blipping `gh pr list`; a mid-gate remote advance racing the lease). The first fails CLOSED (→ Failure Path / human intervention — safe direction but noisy); the second fails toward a logged `no-ci` pass for a HEAD never on the remote, but is bounded by the "no concurrent bkit workflows on one clone" invariant (single-clone serialization makes a mid-gate remote advance unlikely). Accepted risk for this PR; cheap hardening if touched.
- **Suggested fix (optional hardening):** Guard the gate on non-empty `PR_NUMBER` (one retry of the `gh pr list` derivation, or treat empty `PR_NUMBER` as its own named sub-reason rather than folding into `gh-error`); and guard the re-trigger push: `... || { CI_OUTCOME="unresolved"; CI_REASON="retrigger-push-failed"; }` and skip the re-poll when the push did not land.
- `agreement: 2/2` (challenge-1 F3 + challenge-2 F2).

### F4 — LOW — mechanical — OUT-OF-SCOPE (pre-existing) — suppressor deny-list omits GitHub's `***NO_CI***` token

- **Lens:** security (challenge-2 F1).
- **Severity:** LOW. **Class:** mechanical.
- **Location:** `.bkit/workflows/bkit-build.md:1243,1262`; `.bkit/workflows/bkit-debug.md:929,948,1048,1067` (and the established repo-wide list at `.bkit/workflows.md:1001`).
- **Exploit / failure scenario:** The clean/dirty grep covers 5 of GitHub's 6 skip-CI tokens, omitting `***NO_CI***`. A HEAD whose subject contains `***NO_CI***` would be GitHub-suppressed (no run) yet classified CLEAN → falls to the self-heal/`no-ci` logged-pass path instead of `unresolved(timeout-dirty)`. **OUT-OF-SCOPE for this PR:** the same 5-token list is established repo-wide prior art (not introduced here), and bkit's own commit subjects never emit `***NO_CI***`. This is a latent corpus-wide gap to fix in a separate hardening change, not a regression this authoring-only PR introduces.
- **Suggested fix (separate change):** Add `|\*\*\*no_ci\*\*\*` (case-insensitive) to all suppressor deny-list greps repo-wide.
- `agreement: 1/2` (challenge-2 only).

### F5 — LOW — architectural — OUT-OF-SCOPE (outside documented 2-site scope) — debug on `dev`/`main` with `PUSH_MODE=LOCAL` runs no CI-Dispatch gate

- **Lens:** security (challenge-2 F3).
- **Severity:** LOW. **Class:** architectural (mode-coverage gap, not a single-line fix).
- **Location:** `.bkit/workflows/bkit-debug.md:899-900` (gate guarded by `if [ "$PUSH_MODE" = "PR" ]`) vs `:985-988` (`CURRENT=dev|main → TRIGGER_PR=0`).
- **Exploit / failure scenario:** When `CURRENT=dev|main`, `TRIGGER_PR=0` skips the sub-step-9 LOCAL gate; with `PUSH_MODE=LOCAL` the sub-step-3 PR-mode gate is also skipped. The close-workflow commit pushes directly to `dev` (fires CI) but no CI-Dispatch verification runs and only a plain `step-done` (no `ciDispatch`) is written. No extra `[skip ci]` is pushed and no extra trigger fires → verification-coverage gap, NOT a safety/D2 regression. **OUT-OF-SCOPE:** the plan scopes the gate to feature-branch flows; debug-on-dev is an unusual operator mode outside the documented 2-site scope.
- **Suggested fix (optional, doctrine note only):** Note the dev/main + LOCAL combination as an explicit "no gate (direct-to-dev)" case in the doctrine; no code change required for this PR.
- `agreement: 1/2` (challenge-2 only).

## Reconciliation notes

- **Verdict CONCERNS, not FAIL:** no CRITICAL findings; nothing ships a broken gate or a D2 regression. Max actionable severity is HIGH (F1), which is a lost-audit/ledger-integrity defect, not a runtime gate break. Both source lenses independently returned CONCERNS.
- **Cleared (probed, not defects) — carried from challenge-1:** gh `--jq '.[0].number'` empty-vs-`null` (gh suppresses top-level null to empty; EC-1/EC-2 inverted defaults correct); EC-2 fail-closed default; EC-1 fail-open default; `CI_OUTCOME` never left unset; re-trigger fires at most once; D2 invariant holds (worktree-setup + create-pr commits keep `[skip ci]`, gate fires only post-final-push — F1's fix MUST keep `[skip ci]`); ASCII-operator rule satisfied in workflow bash; `ciDispatch` jq/FOLD round-trip valid and survives the #209 `del(.type,.workflow)` fold.
