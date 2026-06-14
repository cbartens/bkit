Verdict: CONCERNS
Failures: 2

<!-- verdict:end -->

# Plan Review

Lens: Tightness, scope discipline, design-coverage.

Reviewed: `docs/plans/202606/261-ci-trigger-gate-plan.md` against
`docs/plans/202606/261-ci-trigger-gate-design.md` and
`docs/plans/202606/logs/261-ci-trigger-gate/plan-input.md`.

## Summary

The plan is a faithful, disciplined expansion of the design. All 7 workstreams map
1:1, the DAG is preserved, scope is correctly held to 2 gate sites (ship OUT), and every
listed design constraint (D2 post-final-push-only, 4-outcome machine, named symbols,
`[bkit-ci-gate]` prefix, gh-error retry, AUTO_ROUTE assert-equal, EC-1/EC-2 inverted
defaults, debug ordering, WS-6 shared-sub-line equality, WS-7 batch-at-end, additive
`ciDispatch`, no per-edit `bkit install`) is present and correctly stated. Every runbook
task carries a terse, codebase-verifiable `Done when:`.

Two design-coverage gaps prevent a clean PASS. Neither is a rework-class failure — both
are additive omissions a builder could close inside the existing task structure — so the
verdict is CONCERNS, not FAIL.

## CRITICAL

1. **Missing design directive: `bkit-decide` fuzzy-vs-exact reconciliation (design Assumptions, line 305 + review-1 OPTIONAL).** The design issues an explicit instruction to the plan phase: the plan "should either adopt the same anchored/fuzzy tolerance for the `bkit-decide` probe (so a consumer-renamed decide job does not produce a permanent self-heal -> `no-ci`/`unresolved`) **or** document why decide must be an exact literal while tests is fuzzy." The plan's kernel (line 266) uses `test("decide"; "i")` — a fuzzy/case-insensitive match — but **nowhere** states this was the deliberate resolution of the design's either/or, nor records the decision in WS-5 docs or the DE entry. The design also flags that ship's run-list probe (`select(.name | test("test"; "i"))`, confirmed at `bkit-ship.md:936`) and build/debug's `statusCheckRollup` probe expose **different JSON shapes and cannot share a jq filter verbatim** — the plan's kernel correctly uses the rollup shape, but never acknowledges the shape divergence the design required it to call out. A builder following the plan literally satisfies the fuzzy-match intent by accident but leaves the design directive unrecorded.
   - **Patch:** Add to WS-5a (Task 6) / the DE entry an explicit line: "`bkit-decide` probe uses fuzzy `test(\"decide\"; \"i\")` to tolerate consumer job renames, matching ship's fuzzy `test(\"test\"; \"i\")`; the two probes use shape-correct jq (rollup check-run shape for build/debug vs `gh run list` workflow-run shape for ship) and cannot share a filter." Add a `Done when:` clause asserting the rationale is recorded.

2. **WS-6 deliverable softened from "mandatory check" to "test file" (design lines 294, 353-359, review-2 O5).** Design WS-6 scope is explicit and double-emphasised: "Wire it into the existing bkit-check gate (pre-push hook / `ci.yml` check step) **as a mandatory check** so it does not decay; otherwise drift is detected only by human review or by symptom." The plan's WS-6 (Task 8) authors `.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts` as a vitest and relies on the implicit claim (line 393) that "the vitest suite is run by the bkit-repo `bkit-tests` CI job." That is true and arguably satisfies "mandatory check" — but the plan never verifies the test is actually picked up by the check gate, and the `Done when:` only asserts the test passes locally (`pnpm vitest run …`), not that it runs in the gate. The review-2 O5 finding the design elevates is specifically about decay-prevention via the gate, not about the test merely existing.
   - **Patch:** Add to Task 8 `Done when:` a clause confirming the new test is in the path the `bkit-tests` / `bkit check` gate executes (e.g. it is discovered by the default `vitest run` glob the CI job invokes, or it is referenced by the pre-push hook), not merely that it passes when invoked by name. One verifying grep/command suffices.

## OPTIONAL

- **WS-2 `Done when:` ordering check is grep-by-proximity, not a true ordering assertion.** Task 2's `Done when:` says "the `cat \"$BKIT_AUTO_ROUTE_FILE\"`/suffix-read precedes `rm -f \"$BKIT_AUTO_ROUTE_FILE\"` in sub-step 9." This is verifiable by hand but the WS-6 vitest does not assert it (it is excluded from the shared-sub-line equality by design). The single most load-bearing debug-specific invariant (read-before-rm) therefore has no automated guard. Consider adding a targeted ordering assertion to the WS-6 test (index-of read line < index-of `rm` line within the debug create-pr block) so a future re-order regression is caught mechanically, not only at review.

- **`PR_NUMBER` empty path in build is under-specified.** Plan line 331 says build re-derives `PR_NUMBER` via `gh pr list … --jq '.[0].number'` and "if empty treat as `no-ci` path candidate via the re-trigger discriminator." That is a plausible mapping, but it is not in the kernel bash (the kernel polls `gh pr view {PR_NUMBER}` unconditionally) and not in any `Done when:`. If `PR_NUMBER` is empty, `gh pr view ""` will error every iteration and route to `unresolved(gh-error)`, not `no-ci`. Either wire the empty-`PR_NUMBER` -> `no-ci` mapping into the kernel/tail or drop the line-331 claim. Low risk (build always has a PR by Step 18) but the stated behaviour and the kernel disagree.

- **Latency operability note (design Trade-offs, line 269 / review-2 O4) not surfaced as a task.** Design requires a one-line "this step may hang 60-120s while the gate polls" note above the gate bash so an operator does not mistake polling for a hung workflow. The plan documents the latency in WS-5 prose context but no task `Done when:` asserts the inline one-line note is present at the gate site itself. Consider adding it to Task 1/Task 2 done-criteria.

- **`bkit-cloud.yml` stale-run-guard open question (design line 301) correctly deferred** — the plan does not carry it, which matches the design's "separate `bkit-cloud.yml` hardening, not a change to this gate." No action; noted for completeness so it is not mistaken for missing coverage.

## OUT OF SCOPE

- EC-3 (clean create-pr commit) — design defers; plan correctly lists OUT. No action.
- #279 squash-body leak — design defers; plan correctly lists OUT. No action.
- Full PUSH_MODE/EXISTING_PR idempotent-resume (EC-1 underlying fix) — design defers behind the `# TODO(#261-ec1)` placeholder; plan honours this. No action.
- Tuning `POLL_BUDGET_S` against real dispatch-surfacing p99 — design notes it is not measurable under the current token; out of this plan's authoring scope. No action.

## Scope-discipline verdict (per requested checks)

1. **Scope creep:** None. No deferred item re-introduced; no feature beyond the design's 4 changes. Ship correctly excluded at every site.
2. **Missing coverage:** Two items — the `bkit-decide` fuzzy/shape reconciliation directive (CRITICAL 1) and the WS-6 mandatory-check wiring (CRITICAL 2). All 7 design WS otherwise mapped.
3. **Ambiguous task scope:** Minor — empty-`PR_NUMBER` build path (OPTIONAL) is the only place the prose and the kernel could be read as conflicting.
4. **Acceptance-criteria gaps:** Every task has a `Done when:`. The two CRITICALs are about a `Done when:` not covering a design-mandated sub-deliverable, not about a missing `Done when:` line.
5. **Ordering violations:** None. Runbook DAG (WS-1 -> WS-2 -> WS-6; WS-3/WS-4 independent; WS-1+2+3+4+5 -> WS-7) matches the design DAG exactly. WS-5 depends on WS-1..4 and WS-7 on WS-1..5 as designed.
