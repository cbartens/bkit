Verdict: FAIL
Failures: 2

<!-- verdict:end -->

# Plan Verification

## Scope

Single (sub-plan 2 of 3: `141-cloud-app-plan-2.md`).

## Sub-Plans Verified

None (Single scope).

## Integration Gaps

None (Single scope).

## Previously Attempted

build-plan-verify-2-1.md (attempt 1, FAIL, 3 gaps: GAP-1 T3.1 concurrency, GAP-2 T3.1 render test, GAP-3 T2.7 positive assertions). Remediation logged in build-plan-gaps-remediate-2-1-log.md (claims all 3 DONE).

## Notes

Re-verified the WHOLE of sub-plan 2 (T2.1–T2.7 + T3.1) directly against files + `git diff origin/dev..HEAD` (remediation log NOT trusted). The remediation commit (`6c8b16a`) touched only `.github/workflows/bkit-cloud.yml`, its template, and `bkit-modules.integration.test.ts` — so T2.1–T2.6 (verified PASS in attempt 1, untouched here) still hold; spot-checked anchors confirm this.

T2.1–T2.6: PASS (unchanged, re-confirmed):

- T2.1 — #184 HEAD-Subject Assertion lives in `.agents/workflows.md` (§ "HEAD-Subject Assertion"), deny-list, `bkit [auto route]`/`[verbose ci]`/`[force build]` pass; reconciled from `rules.md` + `deployments.md`. OK.
- T2.2 — `bkit-build.md:260` worktree-setup + `:925` create-pr carry `bkit [skip ci]`. OK.
- T2.3 — pre-commit `bkit:auto` re-read at `bkit-build.md:949` precedes the close-workflow commit (`:976`), AUTO_ROUTE_SUFFIX appended conditionally. OK.
- T2.4 — mode-dependent marker placement in `bkit-debug.md`; coexists with `bkit [verbose ci]`. OK.
- T2.5 — ship Gate references the assertion; inline rule removed. OK.
- T2.6 — orchestrator gates ceded to YAML; `grep -n update_pull_request .agents/trackers.md` → none (PR-label mirror DELETED, DECISION-E honoured). OK.

GAP-1 (T3.1) — GENUINELY UNRESOLVED. The remediation changed the concurrency key from `bkit-cloud-${{ inputs.issue || github.event.workflow_run.head_branch }}` to `bkit-cloud-${{ inputs.issue || replace(github.event.workflow_run.head_branch, 'feat/', '') }}` and added a comment claiming "FID = issue number (numeric)" and "head_branch is always feat/{FID} with no slug". BOTH claims are FALSE per the project's own conventions and docs:

- `bkit-build.md:146` defines FID as "lowercase `ISSUE_ID` and kebab from title, no stopwords, <=3 tokens (e.g. `bar-123-word1-word2-word3`)" — the FID INCLUDES a slug; the branch is `feat/{FID}` = `feat/141-cloud-app` in THIS very build.
- `replace('feat/141-cloud-app','feat/','')` = `141-cloud-app` (NOT the numeric issue `141`).
- The dispatch path `inputs.issue` is the bare issue number (`Tracker issue number/id`, top-of-file input desc) = `141`.
- Therefore for the SAME feature: dispatch group = `bkit-cloud-141`, CI-completion group = `bkit-cloud-141-cloud-app`. DIFFERENT groups → `cancel-in-progress` cannot serialise the dispatched build against the auto-ship it triggers. The D3 race the task exists to eliminate is NOT eliminated.
- This directly contradicts `docs/knowledge.md` KN-30 (line 495) which states the intended fix: "both dispatch and CI paths resolve to `bkit-cloud-<FID>` … FID (issue number) from the PR body `bkit:fid` marker (primary) or branch slug (fallback)" — i.e. the canonical NUMERIC FID. The shipped `replace()` does not normalise to the numeric FID and is not the SHARED-DERIV expression at all. KN-30 line 494 even names the original bug as mixing numeric FID with `feat/50-slug`; the "fix" still emits `50-slug` on the CI path.

NOTE on SHARED-DERIV internal inconsistency: even the SHARED-DERIV step itself is inconsistent — PRIMARY FID (from `bkit:fid` marker) = full slugged FID (`141-cloud-app`), while FALLBACK FID (`sed 's|^feat/||' | grep -oE '^[0-9]+|^[a-z]+-[0-9]+'`) = numeric `141`. The concurrency `replace()` matches NEITHER reliably. The "single source" the comment asserts does not exist.

GAP-2 (T3.1 render test) — UNRESOLVED + FALSE CONFIDENCE. A `describe("T3.1 — concurrency.group FID single-sourcing")` block was added (4 tests, all green: 92 passed total), but the "value equality" test (lines 895–908) uses the UNREALISTIC example branch `feat/141` (no slug). With `feat/141`, `replace()` yields `141` and the assertion passes — but a real `feat/{FID}` branch carries the slug (`feat/141-cloud-app`), where `replace()` yields `141-cloud-app != 141`. The test asserts against an input shape that never occurs in practice and gives false confidence (exactly the failure class in MEMORY "Validate shipped config with the real tool, not string-presence tests"). Moreover the T3.1 Done-when requires proof "by string-equality of the FID expression appearing in `concurrency.group` against the SHARED-DERIV step output" — structurally UNATTAINABLE, because GitHub evaluates `concurrency.group` at workflow start, before any step runs; the concurrency expression cannot reference `steps.ctx.outputs.fid`. The added tests do NOT compare the concurrency expression to the SHARED-DERIV step output; they assert string-presence of two separate literals.

GAP-3 (T2.7 positive assertions (b)+(c)) — (b) ADEQUATELY ADDRESSED, (c) STILL UNMET. The added `describe("T2.7 — two-tier CI gate positive assertions")` block (4 tests, green) covers (b): the free-tier `if:` contains `bkit [auto route]`, the dispatch step exists, the dispatch path short-circuits via `workflow_dispatch ||`, and `bkit:start/end auto-route-gate` wraps the marker check. (b) is meaningful and passes. (d) markers and (e) canonical↔template byte-identity also hold (`diff` → IDENTICAL; test at line 910 confirms). HOWEVER (c)'s cross-task single-sourcing — the kill-switch `{ISSUE}` must use "the same FID expression as T3.1's concurrency key … proved mechanically by string-equality between the SHARED-DERIV step output and the `gh issue view` consumer" — CANNOT hold while the concurrency key uses a DIFFERENT expression (`replace(head_branch,…)`) than the kill switch (`$ISSUE` from the SHARED-DERIV step). The added (c) test (line 960) only asserts `gh issue view "$ISSUE"` is positioned after the shared-deriv block — it does NOT compare against the concurrency key, so it cannot prove the required cross-surface single-sourcing. T2.7(c) is coupled to and blocked by the broken T3.1.

REMEDIATION-READY FIX (for gap-remediate):

1. Decide the canonical FID for the concurrency key. KN-30 + DE-21 say the key must be the NUMERIC issue number on both surfaces. Two viable approaches:
   - (Preferred, matches KN-30) Normalise the CI-path branch to the numeric issue inside the YAML concurrency expression. GitHub expressions have no regex; `replace()` only strips literal prefixes. A pure-expression numeric extraction from `feat/{FID}` (where FID may be `141-cloud-app` or `bar-123-slug`) is NOT achievable with `replace()` alone. So either: (a) accept the FULL slugged FID as the key on BOTH surfaces — then the DISPATCH side must also key on the slugged FID, not the bare issue number. But `inputs.issue` is the bare number and the dispatcher cannot know the slug. This path is unreconcilable without a shared lookup that concurrency cannot perform. OR (b) key BOTH surfaces on the PR number instead of FID: on the CI path the PR is resolvable, but again concurrency runs before the `gh pr list` step, so the PR number is not available in the concurrency expression either.
   - (Honest structural conclusion) GitHub evaluates `concurrency.group` from trigger-payload context ONLY (`inputs.*`, `github.event.*`) before any step — it cannot consume a step output or perform a tracker/PR lookup. The dispatch payload exposes only the bare issue number; the CI payload exposes only `head_branch` (= `feat/{slugged-FID}`). These two cannot be reduced to one identical token by expression functions alone when FID contains a slug. The plan's T3.1 Done-when (single FID-derived token equal across both surfaces, single-sourced with the step) is therefore NOT satisfiable as currently specified.
2. CORRECT REMEDIATION REQUIRES A PLAN-LEVEL DECISION (escalate; this is beyond a string tweak): EITHER (i) make the dispatch input carry the SAME token the CI path can produce — e.g. require the dispatcher to pass the slugged FID (change input semantics + run-name), so both sides key on `feat/`-stripped branch / slugged FID; OR (ii) change the bkit branch convention so `feat/{FID}` where FID == bare numeric issue (no slug in the branch) — then `replace(head_branch,'feat/','')` == `inputs.issue` and KN-30's numeric-FID claim becomes true (but this contradicts `bkit-build.md:146`'s slugged FID and is a large cross-cutting change); OR (iii) accept that concurrency cannot fully serialise across the dispatch↔CI boundary and re-scope T3.1 to serialise WITHIN each surface (CI-path runs key on `head_branch`, which is correct intra-surface) while documenting that a dispatched build and its triggered auto-ship inherently use different payload identities — then the D3 race must be mitigated by a different mechanism (e.g. the kill-switch / status.json lock) rather than the concurrency key.
3. The render test (GAP-2) MUST use a REALISTIC slugged branch (`feat/141-cloud-app` or `feat/bar-123-slug`) and assert the chosen reconciliation truly yields equal keys; the current `feat/141` fixture encodes the bug as the expectation and must be removed/replaced.
4. Whatever option is chosen, T2.7(c) string-equality single-sourcing must then be made attainable (or the Done-when relaxed) — the concurrency expression and the kill-switch ISSUE source must be provably the same token, which requires the above decision first.

ASCII-operator check on `.agents/workflows/*.md`: no Unicode `≠ ≥ ≤` introduced by this change. Integration test file: 92 passed | 2 skipped (green) — but GAP-2's green test is false-confidence (unrealistic fixture). Plan checkboxes for T2.7, T3.1, and Gate 2 reverted to `[ ]` to reflect true state.

## Identified Gaps Log

GAP-1 (T3.1, BLOCKING — D3 race not eliminated): concurrency.group = `bkit-cloud-${{ inputs.issue || replace(github.event.workflow_run.head_branch, 'feat/', '') }}` (.github/workflows/bkit-cloud.yml:69 + template:69). For the SAME feature, dispatch yields `bkit-cloud-141` (inputs.issue = bare numeric issue) while CI-completion yields `bkit-cloud-141-cloud-app` (`replace()` only strips literal `feat/`, leaving the slugged FID). FID INCLUDES a slug per `bkit-build.md:146` (e.g. `bar-123-word1-word2-word3`); the real branch in this build is `feat/141-cloud-app`. Different groups → `cancel-in-progress` cannot serialise the dispatched build against the auto-ship it triggers. The added comment's claims ("FID = issue number numeric", "head_branch is always feat/{FID} with no slug") are FALSE and contradict KN-30:495 (numeric-FID-both-paths) and KN-30:494 (original bug = numeric FID vs feat/50-slug; the fix still emits 50-slug). T3.1 Done-when (plan:134/189 "both yield bkit-cloud-<FID>", single-sourced) NOT satisfied.
GAP-2 (T3.1 render test, false confidence + structurally unattainable criterion): the new T3.1 describe block's value-equality test (bkit-modules.integration.test.ts:895–908) uses the unrealistic branch `feat/141` (no slug), so `replace()`→`141` matches dispatch `141` and passes — but a real `feat/{FID}` branch carries the slug and breaks the equality. Encodes the bug as expectation (MEMORY "validate with the real tool, not string-presence"). The Done-when's "string-equality of the FID expression in concurrency.group against the SHARED-DERIV step output" is structurally impossible: GitHub evaluates concurrency.group before any step runs, so it cannot reference `steps.ctx.outputs.fid`. The added tests assert two separate literals, not single-sourcing.
GAP-3 (T2.7 (c) only — (b) addressed): (b) marker→HEAD→dispatch chain is now meaningfully asserted (free-tier `if:` contains `bkit [auto route]`, dispatch step present, workflow_dispatch short-circuit, bkit:start/end wrap) and (d)/(e) hold (byte-identical canonical/template). But (c) — the kill-switch {ISSUE} must use the SAME FID expression as T3.1's concurrency key, proved by string-equality — cannot hold while concurrency uses `replace(head_branch,…)` and the kill switch uses `$ISSUE` from the SHARED-DERIV step (two different expressions). The added (c) test (line 960) only checks `gh issue view "$ISSUE"` ordering relative to the shared-deriv block; it never compares against the concurrency key. T2.7(c) is blocked by the broken T3.1.
