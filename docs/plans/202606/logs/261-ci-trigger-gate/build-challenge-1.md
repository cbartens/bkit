Verdict: CONCERNS
Failures: 1

<!-- verdict:end -->

<!-- F1 (HIGH) is a real defect: the ciDispatch verdict + close-workflow step-done are
     written post-push and never committed/pushed, regressing prior committed-ledger
     state and losing the feature's deliverable on ephemeral runs. It does NOT break the
     gate's runtime CI-dispatch logic and does NOT regress D2 — hence CONCERNS, not FAIL,
     per the task's "break the gate or regress D2" rubric. Author should fix before merge. -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

### F1 — HIGH (mechanical→architectural) — close-workflow `step-done` + `ciDispatch` verdict is written AFTER the final push and never committed/pushed

- **Files:**
  - `.bkit/workflows/bkit-build.md:1274-1282` (build Step 18 close-workflow)
  - `.bkit/workflows/bkit-debug.md:1078-1085` (debug create-pr LOCAL-mode, sub-step 9)
  - `.bkit/workflows/bkit-debug.md` PR-mode `step-done` (Step 10 sub-step 3, the `jq ... >> "$STATUS"` after the gate) and the LOCAL-mode `else` branch at debug.md:907-911 of the diff
- **What breaks (regression vs. origin/dev):** In origin/dev the close-workflow `step-done` record was emitted BEFORE `git add -A && git commit` (build origin line 1176→1179; debug create-pr origin line writing step-done before commit), so it was committed and pushed to `feat/{FID}` — that is exactly what the Gate 18/Gate 10 checklist item "Workflow status committed on `feat/{FID}` (status.jsonl)" asserts. The new code moves the `step-done` emission to AFTER the final `git push` (it must, because `ciDispatch` is unknown until the post-push poll runs). The close-workflow / create-pr step is the LAST step; nothing after it runs `git add/commit/push`. The `step-done` line (carrying the entire `ciDispatch` verdict — the deliverable of this feature) is therefore left as an uncommitted working-tree edit and never reaches the remote branch.
- **Triggering scenario:** Every successful build close-workflow and every debug PR-mode/LOCAL-mode close. On an ephemeral cloud-agent run the worktree is discarded after the run, so the `ciDispatch` verdict is permanently lost; the Concrete Example's stated outcome ("a `status.jsonl` `step-done` record carrying `ciDispatch.outcome='dispatched'`" — plan §Concrete Example) is NOT satisfied on the remote. Local runs leave status.jsonl dirty, which the next workflow's `git add -A` will sweep into an unrelated commit.
- **Secondary integrity effect:** `workflow-done` is still written/committed BEFORE the commit (build line 1202, debug line 884), so the committed remote ledger has `workflow-done` for the workflow but is MISSING the `build-close-workflow` / `debug-close-workflow` / `debug-create-pr` `step-done` entirely. A resume/fold off the remote branch sees a DONE workflow whose final step never recorded — and never records the `ciDispatch` audit the gate exists to produce.
- **Why class is architectural-leaning:** the value genuinely cannot be committed in the same commit as close-workflow (it is only known after the push+poll). A correct fix needs a follow-up `git add -A && git commit ... && git push` of status.jsonl AFTER the gate — but that follow-up push must itself carry `[skip ci]` to avoid re-triggering CI (D2), and must not run when the gate already pushed a re-trigger. That is a small redesign of the close-workflow tail, not a one-line move.
- **Suggested fix:** After the gate's `jq ... >> "$STATUS"`, add `git add -A && git commit --allow-empty -m "chore({FID}): ci-dispatch-verdict bkit [skip build] bkit [skip ci]" && <branch-cased push>` so the `ciDispatch`-bearing `step-done` is persisted to `feat/{FID}` without firing a new CI run (the `[skip ci]` makes it D2-safe — it lands after the loud trigger HEAD, so the rollup is already populated). Place it before the `case ... unresolved) exit 1` so the verdict persists even on the Failure-Path exit.

### F2 — LOW (mechanical) — WS-6 byte-equality test only compares build's first kernel to debug's FIRST kernel; debug's second (LOCAL-mode) kernel is unguarded

- **File:** `.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts:160-171` (`extractSharedKernelLines` + the equality `it`)
- **What breaks:** `extractSharedKernelLines` deliberately returns only the FIRST `# --- ... kernel ---` block (`endIdx = first end after start`). Debug has TWO kernel sites (PR-mode sub-step 3 and LOCAL-mode sub-step 9). Test #3 compares `build[0]` vs `debug[0]` (PR-mode) only. A future one-sided edit to debug's LOCAL-mode kernel (sub-step 9) — e.g. a changed `POLL_INTERVAL_S`, a tweaked `poll_decide` jq filter, or a dropped `GH_ALL_ERRORED` reset — would pass every assertion in this file while silently diverging the LOCAL-mode site. The plan's WS-6 contract ("Build and debug gates are byte-equal on the SHARED poll-loop") is only half-enforced.
- **Triggering scenario:** Not a current defect (I verified all three kernels are presently byte-identical modulo indentation). It is a latent gap that lets the WS-6 guard rot on the next edit — exactly the "encode the bug as expectation / vacuous assertion" failure class.
- **Suggested fix:** Extract ALL kernel blocks per file (loop until no further start delimiter) and assert every extracted block (trimmed) equals build's. At minimum assert `debug` contains exactly 2 kernels and both equal build's single kernel.

### F3 — LOW (informational, non-blocking) — `gh-error` false-positive when `PR_NUMBER` re-derivation transiently fails

- **Files:** `.bkit/workflows/bkit-build.md:1215` and `.bkit/workflows/bkit-debug.md:901` (`PR_NUMBER=$(gh pr list ... || echo "")`)
- **What breaks:** If the `gh pr list` re-derivation returns empty (transient API hiccup, or PR genuinely not yet visible), `PR_NUMBER=""`. Every `poll_decide` then runs `gh pr view "" ...` which errors → `GH_ALL_ERRORED` stays `true` → after the 60s budget the gate concludes `unresolved(gh-error)` → `exit 1` → Failure Path, even if CI actually dispatched correctly. This is fail-closed (safe direction) but converts a transient list hiccup into a full workflow Failure Path / human intervention.
- **Triggering scenario:** Build Step 18 immediately after Step 17 created the PR, on a slow GH API; or any debug PR-mode re-derivation blip.
- **Suggested fix:** Guard the gate on non-empty `PR_NUMBER` (e.g. one retry of the `gh pr list` derivation, or treat empty `PR_NUMBER` as its own named sub-reason rather than folding into `gh-error`). Non-blocking; does not break D2 or leave a silent green PR.

### Cleared (probed, NOT defects)

- **gh `--jq '.[0].number'` empty-vs-"null":** EC-1/EC-2 conditionals rely on a no-PR branch yielding an EMPTY string. Standalone `jq -r '.[0].number'` on `[]` prints literal `null`, which would invert both guards. But gh's built-in `--jq` suppresses a top-level null result to empty — proven by the pre-existing, production-working debug Step 1 logic (origin `bkit-debug.md:172-174`) that selects `PUSH_MODE=LOCAL` exactly when this idiom is empty. EC-1/EC-2 inverted defaults are therefore correct.
- **EC-2 inverted default:** `EXISTING_PR=$(... || echo "PROBE_FAILED")` → `[ -z "$EXISTING_PR" ]` false on both "a PR number" and "PROBE_FAILED" → no push. Correct fail-closed.
- **EC-1 default:** `... || echo ""` → `[ -n ]` false on probe failure → falls through to blind create. Correct fail-open, no regression.
- **`CI_OUTCOME` never left unset:** every branch of the tail assigns one of dispatched/self-healed/no-ci/unresolved(+reason); the final `case unresolved) exit 1` reliably routes unresolved to Failure Path.
- **Re-trigger fires at most once:** the self-heal block is gated by `if [ -z "$CI_OUTCOME" ]` and the single `git commit --allow-empty` re-trigger; cap=1 holds.
- **D2 invariant:** `worktree-setup` and `create-pr` commits retain `[skip ci]`; the gate fires only post-final-push; no new mid-build trigger introduced. (Note F1's suggested fix must use `[skip ci]` to keep this true.)
- **ASCII-operator rule:** no Unicode comparison operators in the workflow `.md` bash. (`≡` appears once in `docs/decisions.md`, which is outside the workflows/prompts scope of that rule.)
- **`ciDispatch` jq / FOLD round-trip:** valid JSON; optional `reason` omitted cleanly via `(if $r=="" then {} else {reason:$r} end)`; survives the #209 `del(.type,.workflow)` fold (WS-6 test #5 asserts values, not just key presence — passes live).
