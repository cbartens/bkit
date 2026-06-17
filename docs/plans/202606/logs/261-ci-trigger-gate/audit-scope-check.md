Verdict: CONCERNS
Failures: 5

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

## CRITICAL

**C-1 (Task 2 / WS-2): `PR_NUMBER` in-scope assumption for debug PR-mode gate is unverified — missing re-derivation instruction.**

The plan's Architecture section states "`PR_NUMBER` in scope from the create-pr step" for debug PR-mode (Step 10 sub-step 3 close-workflow push). In the live `bkit-debug.md`, `PR_NUMBER` / `EXISTING_PR` is re-captured in sub-step 4 (AFTER sub-step 3's push). For the gate appended after sub-step 3's push line, `PR_NUMBER` must be in scope from a prior execution context. The plan does not tell the builder to re-derive `PR_NUMBER` in the PR-mode gate (as it explicitly does for build), nor confirm the shell var persists from Step 1's sub-step 6 capture into Step 10's bash block. If the var is not in scope, the gate will poll with an empty `{PR_NUMBER}` and silently succeed on a no-ci path.

Fix: Add to WS-2 Done when: "the PR-mode gate either (a) re-derives `PR_NUMBER` via `gh pr list --head … --base dev --json number --jq '.[0].number'` inside the sub-step 3 bash block, or (b) explicitly confirms the existing `EXISTING_PR` variable is captured earlier in the same bash block and is in scope here; verify `gh pr view` call carries a non-empty PR number reference."

---

**C-2 (Task 8 / WS-6): WS-6 Done when does not specify what lines constitute the shared subset — the extraction anchor is missing.**

The Done when says "the SHARED poll-loop + named-symbol sub-lines are byte-equal across build/debug (NOT whole-gate)" but provides no extraction anchor the builder can use to identify which lines are shared vs. site-specific. The precedent test uses `line.startsWith("YYYYMM=$(ls -d")` as an explicit extractable string. For WS-6, neither the Done when nor the architecture section gives a regex or string anchor the builder can use in the test's extraction logic (e.g., `between '# --- CI-Dispatch Gate' and '# --- end shared kernel ---'` comment delimiters). A builder could extract a superset or subset of the intended lines and the test would still produce a passing vitest run.

Fix: Add to WS-6 Done when: "the shared-line extraction uses the `# --- CI-Dispatch Gate` … `# --- end shared kernel` comment delimiters as anchors (per the architecture section); verify the extraction regex matched > 0 lines (vacuous-match guard); the extracted line count is >= N (specify the expected count from the canonical kernel block to prevent subset extraction from passing)."

---

**C-3 (Task 8 / WS-6): `retrigger-suppressed` sub-reason is assigned to `no-ci` in the canonical bash but the design specifies it as an `unresolved` sub-reason — WS-6 does not test this logic boundary.**

The plan's Architecture section canonical bash assigns `CI_OUTCOME="no-ci"; CI_REASON="retrigger-suppressed"` when the re-trigger poll exhausts the budget without finding a run. The design's Data Model and Component Flow 1 use `retrigger-suppressed` as a sub-reason under `unresolved` (when the re-trigger HEAD ITSELF carries a suppressor), and `no-ci` is for when the re-trigger HEAD is clean but dispatches nothing. The canonical bash conflates the two or mislabels the sub-reason. WS-6 Task 8's FOLD round-trip assertion (e) tests key-survival but does not test the `outcome` / `reason` value boundary — a builder can implement the wrong logic and still pass assertion (e).

Fix: Add to WS-6 Done when: "assertion (d) [new] — fabricate a scenario where the re-trigger poll exhausts and assert the outcome is `no-ci` (not `unresolved`) and the reason is NOT `retrigger-suppressed` (which belongs to `unresolved`); alternatively, verify in Task 1/Task 2 Done when that the `retrigger-suppressed` sub-reason is exclusively on the `unresolved` branch (not the `no-ci` branch)."

---

**C-4 (Tasks 3 and 4 / WS-3a, WS-3b): Done when conditions for the abort-guard skip-push logic are not codebase-verifiable — no grep or structural check given.**

Task 3 Done when says "the open-PR and probe-failure branches both skip the push." Task 4 Done when says "§ Failure Path step 5 states the open-PR-preserve-HEAD rule AND the inverted-safe-default-on-probe-failure rule explicitly." Neither provides a grep pattern or executable check. A builder could add the `grep 'abort-guard'` log line (which is tested) inside the wrong branch (e.g., always-log, never-skip) and the Done when would pass.

Fix for Task 3: Add explicit structural assertion: "`grep -A5 'abort-guard' .bkit/workflows/bkit-build.md` shows the push line is inside an `else` branch (no open PR), not executed unconditionally." Or specify the expected conditional structure: "`if [ -z "$EXISTING_PR" ]`; then push; fi`".

Fix for Task 4: Add a grep pattern: "`grep 'preserve.*HEAD\|do NOT push' .bkit/workflows.md` matches within § Failure Path step 5 context."

---

**C-5 (Task 8 / WS-6 assertion e): FOLD round-trip Done when says "ciDispatch key survives" but does not specify what the test must assert about the key's value — a vacuous round-trip test could pass with a null or empty value.**

The Done when says "a `ciDispatch`-bearing `step-done` line folds cleanly through the #209 FOLD reducer (run the FOLD jq via `execFileSync("bash", …)` and assert the `ciDispatch` key survives on the folded step)." An assertion that the key "exists" (e.g., `!== undefined`) passes even if the FOLD reducer zeroes or transforms the value. The design requires the full object `{outcome, head, attempts, retrigger, reason?}` to survive unchanged.

Fix: Add to Done when: "assert the folded output's `ciDispatch.outcome` equals the input `ciDispatch.outcome` (e.g., `"dispatched"`) and `ciDispatch.head` equals the input SHA — key-value preservation, not just key-existence."

## OPTIONAL

**O-1 (Task 1 / WS-1): Done when uses a file-wide `grep -c 'bkit-ci-gate'` — does not confirm gate is inside the Step 18 bash block.**

A stale `[bkit-ci-gate]` reference in a comment elsewhere in `bkit-build.md` would satisfy the count. The 4-outcome string check partially mitigates this, but none of the Done when checks confirm the gate's structural position (inside the `B=$(git branch --show-current); case … esac` push block, after the push line).

Suggested improvement: Add "`grep -A200 'Step 18.*Close Workflow' .bkit/workflows/bkit-build.md | grep 'POLL_BUDGET_S=60'` matches (confirms POLL_BUDGET_S is within Step 18's text)."

---

**O-2 (Task 5 / WS-4): EC-1 Done when lacks a grep for the named Failure Path message text.**

`grep '# TODO(#261-ec1)'` confirms the placeholder exists but does not verify the named message ("Open PR #N already exists…") is present. An implementer could add the `TODO` comment without the human-readable Failure Path message.

Suggested improvement: Add "`grep 'EC-1:' .bkit/workflows/bkit-build.md` matches" or "`grep 'already has open PR' .bkit/workflows/bkit-build.md` matches."

---

**O-3 (Task 6 / WS-5a): "HEAD-Subject Assertion" stale-heading check lacks a grep with context.**

Done when says `grep 'HEAD-Subject Assertion' .bkit/workflows.md` "returns ONLY retained-clause references." Without `-C` context flags, a builder cannot confirm the remaining references are prose references vs. a surviving heading. Add "`grep -n 'HEAD-Subject Assertion' .bkit/workflows.md | grep -v '#'`" (no heading-level `#` prefix in the retained lines) or "`grep '## HEAD-Subject Assertion\|### HEAD-Subject Assertion' .bkit/workflows.md` returns 0 matches."

---

**O-4 (Task 7 / WS-5b): DE-N numbering check is underspecified.**

Done when says "a new `## DE-N: CI-Dispatch Gate …` entry exists" but `N` is a placeholder. The plan says "check the last DE number first; allocate the next," but the Done when does not include a grep for the actual expected pattern. A builder could allocate DE-0 or reuse an existing number.

Suggested improvement: Add "confirm the new DE number is `last_existing_DE + 1` by running `grep '^## DE-' docs/decisions.md | tail -1` before and after the edit."

---

**O-5 (Task 2 / WS-2): `RETRIGGER_SUFFIX="$AUTO_ROUTE_SUFFIX"` grep pattern missing from Done when.**

Done when says "verify `RETRIGGER_SUFFIX="$AUTO_ROUTE_SUFFIX"`" but the grep needed is `grep 'RETRIGGER_SUFFIX="\$AUTO_ROUTE_SUFFIX"' .bkit/workflows/bkit-debug.md`. Without it the builder must infer the exact search pattern. Minor but consistent with the plan's own grep-assertion discipline.

---

**O-6 (Task 9 / WS-7 / mirror render): Done when relies on `git status` showing updated mirrors but does not specify which mirror paths must appear.**

"git status shows the mirror files updated" could pass if only one of the three host-mirror directories (`.claude/`, `.cursor/`, `.opencode/`) updates. The `grep -rl 'bkit-ci-gate'` check is better but also assumes the string propagates to all three mirrors.

Suggested improvement: Add "`.claude/commands/bkit-build.md` and `.claude/commands/bkit-debug.md` (or equivalent rendered paths) contain `bkit-ci-gate`; repeat for `.cursor/` and `.opencode/`."

## OUT OF SCOPE

**OOS-1: The design's open question about `bkit-cloud.yml` stale-run guard under two coexisting self-heal runs is flagged but not investigated.**

The design notes "confirm the D2/D3 stale-run guard in `bkit-cloud.yml` tolerates the at-most-one extra self-heal run on a `bkit:auto` consumer" as a remaining open question. This is outside this plan's scope and correctly deferred — noting for awareness only.

**OOS-2: The `no-ci` confirmed vs. inferred log-line distinction (design Data Model) has no vitest assertion.**

The design specifies that `no-ci` log lines must distinguish "confirmed" (re-trigger clean, dispatches nothing) from "inferred" (re-trigger poll also timed out). The plan's canonical bash does not show this distinction in the code block. A vitest assertion for this would require executing the bash state machine against mock `gh` responses, which is outside the grep-equality test scope. Flagged as a behavioural correctness gap that manual verification (Step 3) will cover, but the static test matrix has no row for it. Could be added as a grep assertion: "`grep 'confirmed\|inferred' .bkit/workflows/bkit-build.md` matches" as a presence check.
