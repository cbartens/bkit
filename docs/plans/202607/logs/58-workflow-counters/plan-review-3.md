Verdict: FAIL
Failures: 3

<!-- verdict:end -->

# Plan Review

Lens: Regression risk, design-coverage.

## Surface-Area Map

Every surface below is **shipped to consumer repos** (`.bkit/templates/.bkit/scripts/` → core template walk; `.bkit/workflows/` → rendered into `.claude/` / `.cursor/` / `.opencode/` by `bkit install`). Blast radius = every build, debug and ship run in this repo and in every consumer.

<!-- prettier-ignore -->
| Task | Surface touched | Consumers of that surface |
| --- | --- | --- |
| T1.1–T1.2 | **[NEW]** `bkit-status-fold.sh` (`BKIT_STATUS_FOLD`); 15 inline `FOLD=` sites across **5** workflows | Every fold block in build/debug/ship/plan/design. Verified: `bkit-debug.md:179` carries the blob inline. Sourcing failure = every derive block dies. |
| T2.1, T3.8, T6.1 | `bkit-counter-bus.sh` — **high-risk shared utility**, hashed at `.bkit/version:65`. `decide_next`/`check_max` exit contract; `counter_init`/`inc`/`get`/`reset` deleted | Verified sole callers: `bkit-build.md:960`, `bkit-debug.md:194`, `:424`, `:432`, `:440`, `bkit-ship.md:586`. All converted in-PR. |
| T3.1–T3.7 | 7 counter routing sites + 20 `--argjson` write sites | Orchestrator control flow. **Backwards-compat boundary:** unset counter flips continue → Failure Path. |
| T3.6 | **`status.jsonl` schema:** `workflow-meta.soakEntryAt` (additive) | Fold merge branch (`.[$i] += ($e\|del(.type,.workflow,.at))`, last-wins) — verified at `bkit-debug.md:179`. Old logs: absent marker → `.at > ""` → all rows. No migration needed. **Confirmed additive.** |
| T5.1–T5.2 | `bkit-counter-prose-audit.test.ts` patterns (`:89-97`), `EXPECTED_FUNCTIONS` (`:167-174`), `EXPECTED_CONSTANTS` (`:144-151`) | Line refs verified exact. |
| T7.1 | `.bkit/stats.jsonl` `counter` rows — `counterSource` enum | #234 harvest / #183 analysis. No enum member added. |
| T8.3 | `.bkit/version` canonicalHashes; `.claude`/`.cursor`/`.opencode` mirrors | `bkit check` drift gate. |

**Verified accurate in the plan** (I checked these rather than take them on trust):

- **Item 6 (audit vacuity) — CONFIRMED.** `\bATTEMPT\b` cannot match `X_ATTEMPT`. I also checked the _second_ alternative and `MAX_LITERAL_DEFINITION_PATTERN`: `grep -E 'MAX_\w+\s*(<=|>=|<|>)\s*\d|MAX_\w+`?\s*=\s*\d'`over`.bkit/workflows/` returns **zero matches anywhere** (fenced or not). Both patterns are vacuous. The plan's strongest claim is true.
- **Config has all 7 `MAX_*`** (`bkit-counter-bus-config.sh:12-22`), incl. `MAX_CHALLENGE_REMEDIATE_ATTEMPT=1`. The shipped audit's `EXPECTED_CONSTANTS` lists only **6** — it omits `MAX_CHALLENGE_REMEDIATE_ATTEMPT`, the dead one. T5.2's dynamic enumeration closes this.
- **CI wiring** — `ci.yml:500-502` `npx --yes bats tests/*.bats` exactly as claimed. No CI wiring needed.
- **KN-26** exists and reads "Two complementary defences land together (cannot be split)". Citation is apt — and see CRITICAL 2, where the plan collides with KN-26's _own remediation_.

## CRITICAL

### 1. `counter_current`'s return-2-at-zero converts two legitimate first-attempt routes into Failure Path — the exact regression constraint 1 exists to prevent

The plan defines (§ Architecture, `counter_current`): "= `counter_count`, refusing (**return 2**) when the count is 0". The per-site shape wraps every derive in `|| exit 2` → Failure Path. That is sound at the two positions the contract was designed for (route immediately after the step wrote _its own_ row → count >= 1). **Two mandated sites are not that position**, and both legitimately read 0:

**(a) T3.3 — `CHALLENGE_REMEDIATE_ATTEMPT`.** Verified `bkit-build.md:778-784`: Step 10 routes on the count of _prior_ `build-challenge-remediate` rows — a step that has **not run yet** on the first pass. First CONCERNS/FAIL verdict → 0 rows → `counter_current` returns 2 → `|| exit 2` → **Failure Path**, where today it routes to Step 11. Every build reaching Step 10 with a non-PASS challenge verdict hard-fails on its first remediation attempt. T3.3's own **Done when** demands the opposite — "routing behaviour is unchanged (0 prior remediations → Step 11)" — so the task contradicts the helper spec it mandates.

**(b) T3.6 — `SOAK_ATTEMPT`.** Verified `bkit-debug.md:435-443`: `:440` fires in **Step 3**, but `debug-failure-soak` rows are written in **Step 7** (`:752-758`). On a `[soak]`-prompt invocation (`:185`) or a `DEBUG_ATTEMPT >= MAX` escalation (`:194`), Step 3 reaches `:440` with **0** soak rows. T3.6 states this itself — "Invocation-start SOAK (`:185-186`, `:194`) needs no marker — **a fresh run has no soak rows**" — and then routes `:440` through the one helper that cannot express 0. Result: every `[soak]`-mode debug invocation hard-fails at its first failing test run.

**Root cause:** the two-position contract (`counter_next` at start / `counter_current` after own write) has no slot for a third, real position — _route on the count of a different, not-yet-executed step_. Both sites need `counter_count` (0 legal), with `THRESHOLD=$((MAX_X - 1))` reproducing the literal-`1` and budget gates. The plan reaches for `counter_current` because it is the "routing" helper, and inherits its 0-refusal.

**Why it ships green:** **no Derived Test Matrix row exercises count-0 at a routing site**, `counter_current`'s 0-refusal, the `THRESHOLD=$((MAX_X - 1))` idiom, or challenge/SOAK routing at all. T2.7 covers unset/empty/non-integer — never _a valid, correct 0_. `tests/counter-failclosed.bats` would be green and `red-vs-dev.txt` would look exactly as promised while both routes are bricked.

**Fix:** use `counter_count` at `bkit-build.md:780-783`/`:804` and `bkit-debug.md:440`; reserve `counter_current`'s 0-refusal for post-own-write positions only. Add a matrix row: _"count-0 at a prior-step routing site → prints `0`, exit 0, routes to the continue branch (NOT Failure Path)"_ — and assert challenge-first-pass → Step 11 and soak-first-pass → Step 4 explicitly.

### 2. `debug-run-tests` has **no per-attempt commit** — KN-26 deliberately removed it, and the per-site shape would re-add it

Verified asymmetry the plan does not register:

- `bkit-build.md:932` — "Update status **and commit**:" → `:939` `git commit --allow-empty -m "chore({FID}): run-tests attempt ${TEST_ATTEMPT}"`.
- `bkit-debug.md:396` — "**Update status:**" → `:397-403`. **No commit.** It is the only step-done-writing step in debug without one (`:308`, `:560`, `:639`, `:693`, `:752`, `:867` all commit).

That is not an oversight — it is **KN-26's remediation**: _"Step 7 removes its prior intermediate `chore(...)` commits — status.json updates are file-only between Steps 5 and 7; the push leaves `fix(...)` as branch HEAD. Vercel-ignore regex `^chore:` no longer matches."_

The plan's WS-3 **per-site shape** (which the runbook instructs to "repeat verbatim") states the status-write position uses the derived value for "`attempt`, the `artifacts` filename **and the commit subject**". At `bkit-debug.md:396-403` there is no commit subject. An implementer applying the shape verbatim to T3.5's ":400 write" re-adds `chore({FID}): run-tests attempt N` into debug's loop — **re-entering the known-broken pattern KN-26 fixed** (`chore` as branch HEAD → Vercel cancels preview → CI demotes to `partial` → Playwright/integration skipped → `conclusion=success` with no coverage). Severity in KN-26: **critical**.

**Compounding:** `NORMAL_ATTEMPT` counts `debug-run-tests` rows, whose `parentSha` advances **only transitively**, via Steps 4/5/6's commits (`:573`, `:646`, `:707`) — never its own. The plan declares "row counting depends on `parentSha` advancing per attempt" as a _global_ invariant (Edge Cases; T1.1's shipped header comment) but **never audits the corpus for sites that violate it**. T2.6 "asserts `git commit --allow-empty` advances HEAD in a real temp repo" — that is a property of **git**, not of the workflow. It cannot fail and cannot detect this gap. That is precisely the Defect-4 shape this plan was written to eliminate: evidence that asserts the mechanism that was built rather than the behaviour required.

**Fix:** (i) qualify the per-site shape — the status-write position uses the derived value for the commit subject **only where the block already commits**; state explicitly that `bkit-debug.md:396-403` must **not** gain a commit (cite KN-26); (ii) replace T2.6 with a **corpus audit**: for each counted step, assert its `parentSha` advances between consecutive rows in the real workflow — naming `debug-run-tests` as the transitive-dependency case; (iii) correct T1.1's header comment (see OPTIONAL 1).

### 3. `bkit-debug.md:186` is an unlisted control-flow site that the widened audit will red, with no conversion contract

Verified bare `*_ATTEMPT` prose in `bkit-debug.md`: `:49`, `:50`, `:175`, `:186`, `:243`, `:306`, `:358`, `:372`, `:417`, `:418`, `:434`, `:448`, `:661`, `:744`, `:784`, `:802`. Task coverage: T4.1 → `:306`/`:372`/`:744`; T4.2 → `:49-50`/`:243`/`:358`/`:448`/`:784`; T3.5 → `:417`/`:418`/`:802`; T3.6 → `:434`/`:661`; T3.4 → `:175-181`.

**Uncovered: `:186`** — "**If** any `debug-failure-soak` step recorded for the current `DEBUG_ATTEMPT` → `DEBUG_MODE` = SOAK." T3.6 cites `:185-186` only to say it "needs no marker"; no task converts the bare name. T5.1's widened pattern (`\b[A-Z][A-Z0-9_]*_ATTEMPT\b`, exempting only `{X_ATTEMPT}` and `MAX_*`) **will flag it**. Same for `:175`'s bare `PRIOR_DEBUG_ATTEMPT` — T3.4 moves the fold but its Done-when never removes the `:175` prose.

This is not cosmetic: **`:186` selects `DEBUG_MODE`**. An implementer hitting a red audit at T4.2 — whose stated remit is gate/Limits/Failure-Path _wording_ — will reword a mode-selection branch it was never scoped to touch, silently changing SOAK-vs-NORMAL selection. **No test matrix row covers `DEBUG_MODE` selection at all.**

There is a latent correctness question underneath, which the plan's `attempt`-is-telemetry-only reclassification makes worse: soak rows carry `attempt: $NORMAL_ATTEMPT` (verified `:756` `--argjson a "$NORMAL_ATTEMPT"`), **not** a `debugAttempt`. So "recorded for the current `DEBUG_ATTEMPT`" has no field to key on. Only active-run scoping (one `workflow-started` per debug invocation) makes it well-defined — which is _fortunate_, not designed, and the plan never says so.

**Fix:** add an explicit task converting `:183-186` to a fenced derive (active-run `debug-failure-soak` count, mode branch stays prose), delete the `:175` prose in T3.4, and add a matrix row asserting `DEBUG_MODE` selection is unchanged across (fresh run / `[soak]` prompt / soak-rows-present / `DEBUG_ATTEMPT >= MAX`).

## OPTIONAL

1. **The stated dedup invariant is imprecise, and T1.1 ships it into a consumer-facing header.** The key is `"S \($e.workflow) \($e.step) \($e.parentSha) \($e.at)"` (verified `bkit-debug.md:179`) — it includes **`at`**. So dropping a per-attempt commit collapses attempts only when `parentSha` **and** the wall-clock second both collide. The plan's Edge Case ("commit dropped → attempts silently collapse into one") and T1.1's mandated header comment overstate this. The direction is conservative, so it is not a regression — but a shipped comment stating a false invariant will be trusted by future agents. State the real condition: _same `parentSha` **and** same-second `at`_.
2. **Gate 2a mandates a RED bats suite; CI reds on any push in that window.** `ci.yml:500-502` runs `npx --yes bats tests/*.bats` on every push. `pnpm test` is `vitest run` (`package.json:42`) so bats does **not** red the local Step-13 gate — but CI will, between Gate 2a and T3.8. Since the merge is squash and the KN-26 pair must not split, either skip-tag `tests/counter-failclosed.bats` until T3.8 flips it on, or state explicitly that no push happens in that window.
3. **T7.1 defines `counterValue` two ways.** "count of `workflow-started` events for that workflow" for 4 emitters, but "`bkit-debug.md` may reuse its existing `debugAttempt` fold" for the 5th. Two definitions of one telemetry field across emitters is what `counterSource` exists to disambiguate. Pick one and state it.
4. **Call out the `EXPECTED_CONSTANTS` gap explicitly.** The shipped audit lists 6 of 7 constants, omitting exactly the dead one (`MAX_CHALLENGE_REMEDIATE_ATTEMPT`) — the same blind spot as constraint 6. T5.2 fixes it dynamically; naming the current 6-of-7 state in the Supersession Inventory makes the regression story legible.
5. **Consumer mid-flight sourcing.** A consumer whose converted workflows land without `.bkit/scripts/bkit-status-fold.sh` fails at _every_ fold block, not just counters. Manual Step 6 covers the fresh-install path; consider a defensive `[ -f "$FOLD_SH" ] || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run bkit install" >&2; exit 2; }` at the source sites so the diagnostic names the fix.

## OUT OF SCOPE

- **Design-coverage: no gaps.** No parent design exists (standalone, confirmed in plan-input.md § Session Prompt). All 6 of the issue's "What must be true to close this" items map to tasks (1→WS-3, 2→T3.8, 3→WS-6, 4→falls out of derivation + Manual Step 3, 5→WS-4/WS-5, 6→WS-2), and constraints 1-6 each have a home. Coverage is complete in _scope_; the failures above are in _semantics_ and _evidence_.
- Adding a shellcheck gate over `.bkit/scripts/*.sh` — plan defers correctly (`58-no-shellcheck-gate-over-bkit-scripts`).
- `PRIOR_STRATEGY`'s all-runs scoping — flag-and-comment is right; T2.3's sibling assertion (asserting the asymmetry rather than only commenting it) is the strongest test in the matrix.
- The `counterSource` `"derived"` vs `"shell-bus"` enum question — #234 owns it.
- Whether `debug-run-tests` _should_ regain a commit (making `NORMAL_ATTEMPT`'s row-counting self-sufficient rather than transitively dependent on Steps 4/5/6) is a real design question, but it collides with KN-26 and belongs in a follow-up, not here.
