Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Review

Lens: Dependency correctness, design-coverage.

## CRITICAL

None. The dependency DAG is sound, every declared edge is a real artefact consumer, no hidden prereqs, no cycles, and every design-implied dependency is reflected as a task. The inlined pseudocode faithfully encodes the design's state machine. Details below.

### Dependency-graph audit (all declared edges verified real)

Declared DAG (runbook + design Suggested Workstreams agree):
`WS-1 → WS-2`; `WS-3 []`; `WS-4 []`; `WS-1+WS-2 → WS-6`; `WS-1+WS-2+WS-3+WS-4 → WS-5`; `WS-1..WS-5 → WS-7`.

- **WS-1 → WS-2 (real).** WS-2 must reuse the byte-exact shared poll-loop + named-symbol sub-lines that WS-1 establishes; WS-6's grep-equality assertion compares debug against build, so debug authored-after-build keeps them in lockstep by construction. B genuinely consumes A's artefact (the canonical kernel text). Not fabricated.
- **WS-6 requires [WS-1, WS-2] (real).** The alignment test extracts shared sub-lines from _both_ `bkit-build.md` and `bkit-debug.md` and asserts equality + the ship negative; it cannot be authored or pass until both gate copies exist. Verified against the precedent `.bkit/src/bkit-workflow-lock-snippet.test.ts` (reads `.bkit/workflows/*.md`, extracts lines, asserts cross-file). Real consumer.
- **WS-5 requires [WS-1, WS-2, WS-3, WS-4] (real).** The docs (`workflows.md` § rename, `deployments.md`, KN-11, DE-N) describe the exact verdict enum, sub-reason codes, AUTO_ROUTE sourcing difference, and EC-1/EC-2 guards produced by all four behavioural workstreams. Documenting before the behaviour is authored would invite drift. Real semantic dependency.
- **WS-7 requires [WS-1..WS-5] (real).** Mirror re-render is a mechanical force-overwrite of `.bkit/` source; it must run once after every source edit (incl. the WS-5 `.bkit/workflows.md` § rename) lands. Correctly the terminal node. Confirmed against project memory (host-render mirrors force-overwritten, batched at session end).
- **WS-3 [] and WS-4 [] (correctly independent).** I verified both touch disjoint anchors from the gate kernel: WS-3 edits build inline Failure Path sub-steps 8–10 (`bkit-build.md:94-96`) + shared `.bkit/workflows.md` § Failure Path step 5 (`workflows.md:506`); WS-4 edits build Step 17 entry (`bkit-build.md:1088`, before `gh pr create` at `:1092`). Neither shares bash with WS-1/WS-2, neither consumes their output. Declaring them dependency-free is correct — no fabricated edge, and no missing edge (the gate is their _runtime_ backstop, not an _authoring_ prerequisite; the plan states this explicitly).

No cycle exists (DAG is a strict partial order: 1→2→{6, and 1..5→{5,7}}). No fabricated edges (every declared `Requires:` maps to a consumed artefact). No missing prereqs (independent tasks are genuinely independent at authoring time).

### Anchor / existence verification (every [MODIFY] anchor confirmed live)

I read the live tree to confirm each task can find its anchor (plan correctly forbids line numbers):

- **WS-1** — `bkit-build.md` Step 18 close-workflow block confirmed: `AUTO_ROUTE_SUFFIX` derived in-block from `LABELS` (`:1168-1169`), commit (`:1179`) + HEAD-subject clause (`:1182-1185`) + push (`:1189`) all in one shell block. The plan's note that build does **not** carry `PR_NUMBER` at Step 18 (fresh shell — it was set in Step 17 at `:1109`) is **correct and load-bearing**; the re-derive-via-`gh pr list` instruction in Task 1 is necessary, not optional. Faithfully captured.
- **WS-2** — `bkit-debug.md` Step 10 (heading `:853`) confirmed; the plan's anchor-note that the file says "Step 10" while doctrine/design say "Step 12" is accurate (`workflows.md:933-934, :944` say "Step 12"). Close-workflow push (`:949`), `BKIT_AUTO_ROUTE_FILE` written (`:876-877`) and read-then-`rm`-ed in the create-pr block (`:937-939`) confirmed. See pseudocode audit below for the ordering correctness.
- **WS-3** — build inline Failure Path commit+push confirmed at `bkit-build.md:95-96`; shared `.bkit/workflows.md` § Failure Path step 5 confirmed at `:506` (`docs({FID}): {phase} aborted bkit [skip build] bkit [skip ci]` → push). Both anchors exist.
- **WS-4** — build Step 17 `git fetch origin dev` (`:1088`) precedes blind `gh pr create` (`:1092`); insertion point exists.
- **WS-5** — `### HEAD-Subject Assertion` section confirmed at `workflows.md:938`; `### bkit [auto route] Marker Propagation` at `:532` already names "the debug re-trigger commit" — confirming the design's instruction to add the _build_ re-trigger to that list.
- **WS-6** — precedent test file exists and matches the described shape.

### Pseudocode / state-machine fidelity (design specifics faithfully inlined)

All the caller-flagged design specifics are present and correct in the plan's inlined kernel (plan §"Shared gate logic", lines 257-326):

- **Poll captures `gh` exit code, no `set -e`** — `poll_decide()` does `...2>/dev/null); rc=$?` then `[ "$rc" -ne 0 ] && { echo "err"; return; }`; iteration retries within budget; `GH_ALL_ERRORED` only stays `"true"` if no clean read ever occurred → `unresolved(gh-error)`. Matches design Change-1 / review-2 C1 exactly.
- **Self-heal only on EMPTY rollup** — the suppressor/timeout branch only runs when `CI_OUTCOME` is still empty after the poll; the `found` path (`out -gt 0`) breaks to `dispatched`. There is no heal-on-non-green path. Matches the "heal-only-on-empty" decision.
- **Cap=1** — exactly one re-trigger block, no loop around it; after the single re-poll, `[ -z "$CI_OUTCOME" ] && CI_OUTCOME="no-ci"`. Cap honoured.
- **HEAD re-asserted clean BEFORE concluding** — `PUSHED_HEAD_MSG` suppressor grep gates the self-heal (`timeout-dirty` → unresolved). The design also requires re-asserting the _re-trigger_ HEAD clean before `no-ci` (`retrigger-suppressed`). NOTE: the plan's inlined tail does not re-grep the re-trigger commit message after `git commit --allow-empty` (it relies on the message being clean by construction since `RETRIGGER_SUFFIX` is a deny-list marker), yet it still emits `CI_REASON="retrigger-suppressed"` on the no-ci path. This is a benign labelling looseness, not a dependency/coverage gap — see OPTIONAL.
- **AUTO_ROUTE_SUFFIX derived + asserted-equal before push at both sites** — `[ "$RETRIGGER_SUFFIX" = "$AUTO_ROUTE_SUFFIX" ] || { ...autoroute-mismatch... }` present; build sources `RETRIGGER_SUFFIX="$AUTO_ROUTE_SUFFIX"` in-block (Task 1), debug sources from `BKIT_AUTO_ROUTE_FILE` before `rm` (Task 2). Both legs covered.
- **`ciDispatch` is an additive field on the `step-done` `jq -nc` append, not a separate record** — confirmed in the plan's jq block (`ciDispatch: ({outcome..} + ...)` merged into the one `step-done` object). I verified the live FOLD reducer (`bkit-build.md:131`) does `($e|del(.type,.workflow))` then merges the remainder into `.steps`, so an extra `ciDispatch` key survives untouched — the additive/backward-compatible claim is factually true, not assumed.
- **EC-2 probe-failure → "PR exists → do NOT push"** — WS-3/Task 3 states the inverted-safe-default explicitly (cost-asymmetry). Correct and matches design.
- **EC-1 probe-failure → fall through to blind create** — WS-4/Task 5 states fall-through (no regression). Correct, and correctly the _opposite_ default from EC-2.
- **WS-6 grep-equality scoped to shared poll-loop + named-symbol lines, NOT whole-gate** — plan Task 8 (c) + Derived Test Matrix row 3 + Supersession/Alternatives all state the AUTO_ROUTE sourcing lines are excluded. Faithful.
- **Debug pre-PR close-workflow push fires nothing (feat/\* not in `on.push`)** — design §"Debug LOCAL-mode fire-CI-exactly-once" and Assumptions require this be encoded as an inline comment. WS-2/Task 2 scope says "Encodes the load-bearing debug-LOCAL `ci.yml on.push = [dev, main]` only ... assumption as an inline comment." Covered (see OPTIONAL for a hardening nit on the Done-when).

### Design-coverage cross-check (every design change → a task)

- Change 1 (4-outcome gate) → WS-1 + WS-2. Covered.
- Change 2 (EC-2 abort-guard, 2 sites) → WS-3a + WS-3b. Covered.
- Change 3 (EC-1 pre-flight) → WS-4. Covered.
- Change 4 (re-trigger marker, build + debug legs) → folded into WS-1 / WS-2 (correctly — marker treatment is logic inside the self-heal branch, not a separable task). Covered.
- Doc surface (deployments KN-11 + D2 record, workflows.md § rename, observability `[bkit-ci-gate]`, marker-propagation list) → WS-5. Covered, incl. the debug-LOCAL `on.push` invariant recorded in the D2 record.
- WS-6 wired into bkit-check as mandatory (design review-2 O5) → Task 8 + Verification Plan. Covered.
- Mirror re-render → WS-7. Covered.
- Ship explicitly OUT (no `ciDispatch`, no gate) → encoded as a negative assertion (Task 8 (d) / Derived Test Matrix row 4) and in Out-of-Scope. Covered.

No open design question or risk is left without a task: EC-1/EC-2/AUTO_ROUTE-assert/gh-error/no-ci-confirmed-vs-inferred/`[bkit-ci-gate]` prefix/named-symbols all map to WS-1..WS-6.

### Verification-step audit (every task has a checkable Done-when)

Every runbook task carries a terse, codebase-verifiable `Done when:` (grep counts, presence of named symbols, jq-object key presence, ordering check, test-passes, mirror-grep). Builder can self-verify each. Manual Verification steps 1–5 map 1:1 to the live boundary rows in the Derived Test Matrix.

## OPTIONAL

- **Re-trigger HEAD re-assertion is implicit, not explicit, in the inlined tail.** The design's Decisions table calls out "Re-assert the re-trigger HEAD is clean before concluding `no-ci`" as the Risk-premortem lens's highest-value safety add (closes the suppressed-re-trigger false-all-clear). The plan's inlined kernel (lines 294-306) relies on `RETRIGGER_SUFFIX` being a deny-list marker (clean by construction) rather than re-grepping `git log -1 --pretty=%B` after the `--allow-empty` commit, yet still labels the no-run outcome `retrigger-suppressed`. Functionally safe given the assert-equal guard, but the `retrigger-suppressed` sub-reason can never actually fire as written. Consider either (a) adding the explicit post-commit `%B` grep on the re-trigger (mirroring the design literally and making the sub-reason reachable), or (b) renaming the no-ci sub-reason so the label matches the realised behaviour. Authoring detail for the builder; not a dependency or coverage defect.
- **WS-2 Done-when verifies the `cat ... before rm` ordering but the simplest faithful implementation reuses the in-scope shell variable.** The live `:937-939` already captures `AUTO_ROUTE_SUFFIX=$(cat "$BKIT_AUTO_ROUTE_FILE")` then `rm`s within the same block, so the gate can simply use the already-assigned `AUTO_ROUTE_SUFFIX` shell variable after the `rm` (it persists in-process) rather than re-reading the file. The plan accommodates both ("read suffix → assign → rm → gate uses the variable"), but the Done-when grep asserting `cat` precedes `rm` could pass trivially without proving the gate actually consumes the captured value. A stronger Done-when would assert `RETRIGGER_SUFFIX`/`AUTO_ROUTE_SUFFIX` is referenced inside the gate block after the `rm`. Minor.
- **`### bkit [auto route] Marker Propagation` (`workflows.md:532`) already names "the debug re-trigger commit."** A debug "re-trigger" notion thus pre-exists in doctrine while the plan introduces the gate's `re-trigger ci` commit as new. WS-5/Task 6 should reconcile the two (confirm they are the same concept or disambiguate) so the renamed § does not leave two unrelated "re-trigger" references. Doc-clarity nit.
- **WS-6 negative ship assertion is by log-prefix only.** Task 8 (c) asserts ship carries no `[bkit-ci-gate]` line. If a future ship edit ever borrowed the `[bkit-ci-gate]` prefix for an unrelated log line the negative would false-positive. Consider also asserting absence of the `POLL_BUDGET_S`/`ciDispatch` symbols at ship. Cheap hardening.

## OUT OF SCOPE

- **EC-3 (clean build create-pr commit)** — design defers it (D2-coupled); the gate's self-heal recovers it. Correctly excluded; no task should add it.
- **Full PUSH_MODE/EXISTING_PR build↔debug branch-PR alignment** — design defers as D2-risky behind the `# TODO(#261-ec1)` hook. Correctly excluded.
- **#279 squash-body `[skip ci]` leak (ship side)** — same suppression class, tracked separately. Correctly excluded.
- **`bkit-cloud.yml` D2/D3 stale-run guard tolerance for the at-most-one extra self-heal run** — design flags it as a separate `bkit-cloud.yml` hardening (open question, not blocking). If it turns out the guard is weak under two coexisting runs on a `bkit:auto` consumer, that is a follow-up issue, not a change to this plan.
- **Tuning `POLL_BUDGET_S` against real dispatch-surfacing p99** — deferred until measurable (`gh`/REST 404 on consumer orgs under current token). The named symbol + KN-11 home make the future tune a one-line change; out of scope for this plan's execution.
