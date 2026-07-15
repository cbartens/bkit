<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket, set at design start = 202607). Logs sit at `docs/plans/202607/logs/58-workflow-counters/` and are delete-eligible. -->

# Workflow Attempt Counters — Sub-Plan 2: Convert all call sites, THEN harden the guard (the KN-26 atomic core)

**Parent Plan:** [`58-workflow-counters-plan.md`](58-workflow-counters-plan.md)
**Sibling Sub-Plans:** [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md) (fold + helpers + cross-process tests — **must be complete**) · [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md) (prose cleanup, deletion, provenance, docs)
**Scope:** T5.1 + T5.3 + WS-3 (T3.0–T3.9) + T5.4 · **14 tasks** · contains 🔒 Gate 2b.
**Position in order:** SECOND. Requires [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md)'s 🔒 Gate 2a `[x]`.

> [!CAUTION]
> **🛑 THIS SUB-PLAN IS ATOMIC. DO NOT SPLIT IT FURTHER, AND DO NOT STOP IN THE MIDDLE OF IT.**
>
> **It is 14 tasks — 2 over the 12-task heuristic. That excess is a justified, deliberate exception, not an oversight.** This sub-plan contains the KN-26 seam: T3.1–T3.7 (derivation) and T3.8 (fail-closed hardening) are two halves of one change and **cannot be separated by any boundary** — not a sub-plan boundary, not a PR boundary, not a session boundary.
>
> **Why splitting it reproduces the exact bug #58 exists to fix:** hardening `decide_next`/`check_max` while any site still supplies a model-authored value converts "may silently overrun" into "**never retries**" — every retry route hard-fails. That is a _different wrong_, not a partial fix. Conversely, converting without hardening leaves the fail-open in place. Cutting this sub-plan at 12 tasks would put the cut somewhere inside T3.0–T3.9, i.e. exactly on the seam. **Honouring the task ceiling here would recreate the regression.** The ceiling yields; the seam does not.
>
> **Run this sub-plan as ONE uninterrupted execution session, start to finish.**

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this file natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

## Context & Goals

Workflow orchestrators branch their retry loops on attempt counters the **model** tracks in prose. The counter reaching the shell is a number the model remembered and typed in. `decide_next` does not make that deterministic: it launders a model-supplied number through shell and returns it wearing a uniform, then faithfully enforces the cap against the wrong number.

The fix (`docs/decisions.jsonl` → `58-workflow-attempt-counters-derived-from-status-jsonl-not-stored`) is **derivation, not storage**: `attempt(step) = count(step-done rows for that step, status DONE, in the ACTIVE run of that workflow) + 1`, evaluated at step START and **re-derived** in every fenced block that needs it. Shell state does not survive between orchestrator Bash calls, so a counter is never carried — only re-read.

**This sub-plan is where that actually happens.** [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md) built the helpers; this one converts all **18 `--argjson` sites / 19 counter references** across `bkit-build.md`, `bkit-debug.md` and `bkit-ship.md` to call them, and only then hardens the guard. It also ships the two rules that make the conversion's completeness machine-checkable (T5.3) and its mapping falsifiable (T5.4) — plus the widened prose audit (T5.1) whose output the next sub-plan consumes.

**Success Criteria (this sub-plan):**

- **T5.3 is GREEN over all 5 workflows** — zero fenced blocks read a bare `$X_ATTEMPT` they do not derive. This, not a hand-count, is what "the conversion is complete" means.
- Every site in `unconverted-sites.txt` is converted, and re-running the rule prints an empty worklist.
- T3.8's hardening lands **after** T3.0–T3.7, in the same PR, and `tests/counter-failclosed.bats` goes green **for the documented reason**.
- No legitimate `0`-route was bricked; KN-26's `debug-run-tests` no-commit remediation is intact.

**Related Issues:**

- `#234 — telemetry JSONL master feature (open)` — absorbed #58's measurement slice, not its control-flow slice. Owns the `counterSource` enum question; this plan uses the existing `shell-bus` value and adds no enum member.
- `#209 — status.json → append-only status.jsonl + fold (closed)` — the event-log shape derivation depends on.
- `#232`, `#183`, `#233` — consolidated into #234 alongside #58 on 2026-06-06.
- `#341 — all-runtimes / gh fallback + trackers-stay-on-MCP (open)` — named as the fix path for the related-issues search failure; no scope here.

> [!CAUTION]
> **The related-issues scan was NOT performed this run — treat as missing context, not as "nothing related exists".** `mcp__github__search_issues` returned `total_count: 0` for every probe **including the control** `repo:cbartens/bkit telemetry`, which must match. The refs above are carried from the issue body and comments, not re-confirmed by search. Recurrence logged to `.bkit/friction.jsonl`. See `related-issues.md`.

## Dependencies — HARD PREREQUISITES

> [!WARNING]
> **Do NOT start until [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md)'s 🔒 Gate 2a is `[x]`.** Every task here calls something that sub-plan built.

- [ ] **Gate 1 passed in [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md)** — both 👤 human confirmation checkboxes are `[x]`. This sub-plan carries **no** confirmation checkbox of its own (§ Inherited Human Sign-Off below).
- [ ] **Gate 2a passed in [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md)** — specifically:
  - **T2.1** shipped `counter_count` / `counter_next` / `counter_current` into `.bkit/templates/.bkit/scripts/bkit-counter-bus.sh`. Every conversion below calls them; without T2.1 they do not exist.
  - **T2.0** repointed all three bats suites **and** `.bkit/src/bkit-counter-prose-audit.test.ts` template-relative. **T5.3/T5.4 are added to that same Vitest file** — if the repoint was skipped, this sub-plan's suite reads the stale mirror.
  - **T1.1/T1.2** shipped `bkit-status-fold.sh` + the 15 fail-closed source lines. The per-site shape below sources it at every converted block.
  - **T2.7 / T2.9** created `tests/counter-failclosed.bats` and it is **RED for the documented reason** (stdout `step-14`, exit 0 — the fail-open; **not** `command not found`). T3.8's Done-when is "it goes green"; without the suite there is nothing to turn green.
  - **T2.8 / T2.2–T2.5 / T2.10** created `tests/counter-derive.bats`. T3.6's Done-when adds a case to it; T3.4b's adds another.
- [ ] **Carried from `58-workflow-counters-plan-1.md`'s handoff:** T1.1's measured figures; **which RED-window option was taken** (no-push vs skip-tag — if a skip-tag, T3.8 removes it); T2.7's/T2.9's/T5.2's documented REDs; `red-vs-dev.txt` exists.
- **Downstream:** [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md) cannot start until 🔒 Gate 2b **and** T3.8/T3.9 here are `[x]`. Its T4.1 deletes the prose that instructs the model to substitute values into these blocks — doing that while any block is unconverted is **worse than the status quo**. Its T6.1 deletes the primitives, which is only safe once every site is converted. Its T7.1 depends on T3.4 having converted `:332`.

### RED-window obligation carried across the boundary

> [!CAUTION]
> `ci.yml:500-502` runs `npx --yes bats tests/*.bats` on **every push**. `tests/counter-failclosed.bats` is RED from `58-workflow-counters-plan-1.md`'s Gate 2a until **T3.8 in this sub-plan**. That window now spans a sub-plan boundary and most of this session. Either no push happens in this window, or the suite carries a skip-tag that **T3.8 removes**. The merge is squash and the KN-26 pair must not split, so a red CI here is noise, not signal. **Honour whichever option `58-workflow-counters-plan-1.md` recorded.**

## 👤 ⚠️ Inherited Human Sign-Off — no new checkbox

> [!CAUTION]
> **The human review + confirmation checkboxes for this feature live in [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md) § Acceptance Scenario and § Breaking Changes & Naming Review.** They gate Gate 1 for all three sub-plans. **Do not duplicate them here and do not proceed if they are unchecked.**
>
> The items below are restated because they **govern this sub-plan's tasks** and an executor must not have to read a sibling to act correctly. They are context, not a second sign-off.

**Item 5 — the narrowing of "no `*_ATTEMPT` in prose". This is the acceptance criterion the human signed off on, and T5.1 here is the artifact that encodes it.**

Issue #58's acceptance says "no `*_ATTEMPT` in prose", full stop. That is **not literally achievable** — 62 lines carry a non-`$` brace placeholder the orchestrator substitutes from shell stdout (build 26, debug 26, ship 10), and artifact filenames (`build-plan-verify-{SUB_PLAN}-{VERIFY_ATTEMPT}.md`) plus subagent Context lines depend on them. The **narrowed, enforceable** criterion signed off in `58-workflow-counters-plan-1.md`:

- **BANNED** outside a fenced block: any bare `X_ATTEMPT` token (catches every assignment, increment, reset and comparison — all of them name the counter bare).
- **ALLOWED:** `{X_ATTEMPT}` — a substitution token, never a computation; and `MAX_X_ATTEMPT` — a constant **name** pointing at the config, carrying no value.
- **NOT allowed, and the exemption must not leak into it:** `${X_ATTEMPT}` — a _value_ reference. **48 `${X_ATTEMPT}` shell expansions exist in the corpus**; an exemption written as "`{X_ATTEMPT}` is allowed" silently exempts every one. **The placeholder exemption MUST carry a negative lookbehind on `$`.** T5.1's negative control asserts `${TEST_ATTEMPT}` in prose is **caught**, not exempt.

**T5.1 below is where this narrowing becomes code. If you find yourself widening an exemption to make a stubborn line pass, you are un-doing the thing the human signed off on — stop.**

**Item 1 — the exit-contract change is BREAKING, and it is the point.** Today an unset counter → `[ "" -gt 3 ]` → non-zero → indistinguishable from "condition false" → **continue**. After T3.8 it → exit 2 → **Failure Path**.

> [!WARNING]
> **This cannot ship alone (KN-26 shape). T3.1–T3.7 (derivation) land before T3.8 (hardening), both in the same PR. Do not reorder, do not split the PR along that seam.** This is the constraint that made this sub-plan atomic.

**Item 8 — `DEBUG_ATTEMPT`'s scoping must stay CROSS-run; do not "fix" it to active-run.** `bkit-debug.md:175-181` folds `last.debugAttempt` across **all** `debug` runs and adds 1. Correct: it counts **invocations**, not steps within a run. Active-run scoping would reset it every invocation and permanently disable SOAK escalation.

> [!WARNING]
> **The fold is COPIED, not moved.** `$DEBUG_ATTEMPT` is assigned once at `:180-181` and read cross-block in **~18 further places** — including `:332` (the `workflow-meta` marker **itself**), `:334`, `:376`, and the whole `:473-573` `debug-context-*` fetch phase. _Moving_ the fold starves all of them → `:332`'s `--argjson` hard-fails → **every debug run dies at `debug-worktree-setup`**. `:180-181` **stays** as the orchestrator's substitution source; every consuming fenced block **re-derives** with the identical cross-run expression.
>
> **Circularity worth naming:** `:332` writes the `debugAttempt` marker _from_ `$DEBUG_ATTEMPT`, and the cross-run fold reads that marker back. Until `:332` re-derives in-block, the plan's only cross-run counter is grounded in a model-supplied value — so `58-workflow-counters-plan-3.md`'s T7.1 would inherit it. `:332` is an unconverted **consumer**, not merely "the marker precedent".

**Item 10b — `counter_current`'s refuse-at-0 bricks two legitimate first-attempt routes.** The two-position contract has no slot for a **third real position**: _route on the count of a different, not-yet-executed step_. Two mandated sites are exactly that and both legitimately read `0` — `bkit-build.md:778-784` (T3.3) and `bkit-debug.md:440` (T3.6). Both use **`counter_count`** (0 legal, exit 0) with `THRESHOLD=$((MAX_X - 1))`. **Never `counter_current` at these sites.**

**Item 10c — `debug-run-tests` has no per-attempt commit; KN-26 removed it deliberately.** `bkit-debug.md:396` reads "**Update status:**" with **no commit** — the only step-done-writing step in debug without one. That asymmetry **is** KN-26's remediation: a `chore(...)` branch HEAD makes the Vercel-ignore regex skip the preview → CI demotes to `partial` → integration/Playwright skipped → `conclusion=success` with no coverage. Severity: **critical**. **The per-site shape's commit-subject clause does NOT apply at `:396-403`. Do not add a commit there.**

**Item 7 — 3 extra prose counter comparisons exist** beyond the issue's 7-site table: `bkit-debug.md:417` (`NORMAL_ATTEMPT > 1`), `:418` (`NORMAL_ATTEMPT = 1`), `:802` (`NORMAL_ATTEMPT > 1`). Not `MAX_` caps — they distinguish "passed first try" from "we fixed something" — but they are model-authored counter comparisons. Folded into T3.5.

**Item 6 — the shipped prose audit is vacuous; its green is evidence of nothing.** `\bATTEMPT\b` cannot match inside `VERIFY_ATTEMPT` (the preceding `_` is a word character — no word boundary). **The pattern cannot match any real counter name in the corpus.** Both `describe` blocks pass because they match nothing at all. The widened audit **must** ship with a negative control (T5.1) proving the pattern fires on known-bad lines.

## Edge Cases — this sub-plan's slice

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Counter expands empty / non-integer at a routing block | `decide_next` / `check_max` print **nothing** on stdout, emit a diagnostic on stderr, `return 2` → block exits 2 → orchestrator routes to **Failure Path**. Never "continue". _(T3.8 builds this; `58-workflow-counters-plan-1.md`'s T2.7 demands it.)_ |
| `status.jsonl` missing or unreadable at a derive block | `counter_count` returns 2 → call site `|| exit 2` → **Failure Path**. Never a default of 0. |
| **A routing site reads `0` legitimately** (routes on a *prior, not-yet-executed* step: `bkit-build.md:778-784` challenge-remediate on first CONCERNS/FAIL; `bkit-debug.md:440` SOAK budget in Step 3, where soak rows are written in Step 7) | `counter_count` prints `0`, exit **0** → the **continue** branch (Step 11 / Step 4). **NOT** Failure Path. `0` is the correct answer, not an error. Only `counter_current` (post-own-write) may refuse `0`; these sites must not use it. This is issue constraint 1's regression through a side door — asserted by a test, not by prose. |
| **A counted step whose `parentSha` advances only transitively** (`debug-run-tests`: `bkit-debug.md:396` writes its row with **no commit** — Steps 4/5/6 commit at `:573`/`:646`/`:707`) | Real and **deliberate**: KN-26 removed debug's intermediate `chore(...)` commits so `fix(...)` stays branch HEAD. `NORMAL_ATTEMPT` therefore depends on Steps 4/5/6 for its `parentSha` advance. **Must NOT be "fixed" by re-adding a commit** — the per-site shape's commit-subject position does not apply at `:396-403`. Audited by corpus test (T2.6), not asserted by prose. |
| `DEBUG_MODE` selection (`bkit-debug.md:183-186`) | Unchanged across all four entry conditions (fresh run / `[soak]` prompt / soak-rows-present / `DEBUG_ATTEMPT >= MAX`). The bare-name prose at `:186` becomes a fenced derive (active-run `debug-failure-soak` count); the **mode branch stays prose** — it is a verdict-shaped judgment, not a number. Note the underlying key: soak rows carry `attempt: $NORMAL_ATTEMPT`, **not** a `debugAttempt` field, so "recorded for the current `DEBUG_ATTEMPT`" is only well-defined because active-run scoping gives one `workflow-started` per debug invocation — fortunate rather than designed, and now stated. |
| `VERIFY_ATTEMPT` across sub-plans | `subPlan` filter isolates each sub-plan's count — the `Reset VERIFY_ATTEMPT = 0 at start of each SUB_PLAN` prose becomes structurally unnecessary. |
| SOAK re-entered after NORMAL exhaustion, mid-run | A `workflow-meta` marker carrying `soakEntryAt` is appended at each SOAK entry; SOAK counts only `debug-failure-soak` rows with `.at > soakEntryAt` → fresh budget without any stored counter. |
| Log with no `soakEntryAt` marker (fresh SOAK run, or a log written by an older bkit) | `.at > ""` is true for every row → counts all soak rows in the active run. Correct fresh-budget behaviour; additive, no migration. |
| Orchestrator mis-transcribes a derived value into a filename / comment | Artifact name and the row's `attempt` field are wrong; **routing is unaffected** — it re-derives. `attempt` is telemetry-only by contract. |
| `PRIOR_STRATEGY` reads the same log with all-runs scoping | Left **unchanged and deliberately opposite**. Both sites carry a comment naming the asymmetry, so neither reads as a bug from the other's side. |

## Derived Test Matrix — this sub-plan's slice (**5 of the master's 19 rows**)

> Rows 1–6, 9, 11, 12, 13, 16 (T1.3, T2.2–T2.10, T5.2) → [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md). Rows 17, 18, 19 (T6.2, T7.1, T8.3) → [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md). **11 + 5 + 3 = 19.**

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| **Completeness rule (the only check that can see inside fenced blocks):** no fenced block in the 5 workflows reads a bare `$X_ATTEMPT` unless that same block derives it (`counter_count`/`counter_next`/`counter_current`/an inline fold). `CI_ATTEMPTS` is exempt by name (loop-local, assigned and consumed in one block). Fails today against **all 18 `--argjson` sites** — the RED-first proof that it can detect an unconverted site | Unit (Vitest, block-scoped scan) | `.bkit/src/bkit-counter-prose-audit.test.ts` | T5.3 |
| **Mapping rule — each block derives the RIGHT counter, not merely _a_ counter:** for every fenced block that writes a `step-done` row and derives a counter, the derive call's step argument equals `COUNTER_STEP_MAP[row's step]` (11 counter-!=-row entries + 6 counter-==-row entries; `DEBUG_ATTEMPT` exempt as a non-step-keyed invocation index). A deriving block whose row-step is absent from the map reds, so the map cannot be silently short. **Pins the mapping; does not prove it** (§ T5.4) | Unit (Vitest, block-scoped scan) | `.bkit/src/bkit-counter-prose-audit.test.ts` | T5.4 |
| **`DEBUG_MODE` selection unchanged** across fresh run / `[soak]` prompt / soak-rows-present / `DEBUG_ATTEMPT >= MAX` after `:183-186` becomes a fenced derive | Integration (bats) | `tests/counter-derive.bats` | T3.4b |
| **Invocation-start SOAK gets a fresh budget:** a resumed invocation entering SOAK via `:185-186`/`:194` (marker present) counts only post-marker soak rows rather than inheriting the prior invocation's spent budget. **Distinct from the row above** — that one covers the marker _mechanism_ generically; this covers the **invocation-start entry path**, which the draft excluded on the false premise that "a fresh run has no soak rows" and which is where the DE-25 starvation actually lands (§ T3.6) | Integration (bats) | `tests/counter-derive.bats` | T3.6 |
| Prose audit fires: the widened pattern matches known-bad fixture lines (`Init counters: VERIFY_ATTEMPT = 0`, `Increment TEST_ATTEMPT + 1`, `CHALLENGE_REMEDIATE_ATTEMPT < 1`, `NORMAL_ATTEMPT > 1`) **plus the two cases the plan's own review added and this row omitted: `${TEST_ATTEMPT}` in prose is CAUGHT** (the negative lookbehind on `$` — without it, the placeholder exemption silently widens to all 48 shell expansions) **and the reversed-operand `SOAK_ATTEMPT reset to 0` is CAUGHT** (the `:434` shape T4.1's draft grep missed) — and does NOT match `{VERIFY_ATTEMPT}` or a bare `MAX_TEST_ATTEMPT`. A **negative control**, because the shipped pattern matches nothing (see § Breaking Changes item 6) | Unit (Vitest) | `.bkit/src/bkit-counter-prose-audit.test.ts` | T5.1 |

## Alternative Approaches & Recommendations _(the ones governing this sub-plan)_

- **Harden `decide_next` now, derive later — REJECTED.** Converts silent-overrun into never-retries. KN-26 shape. **The same inversion re-entered through two side doors and was caught only in review** — `counter_current`'s refuse-at-0 at `bkit-build.md:778-784` and `bkit-debug.md:440` (§ item 10b). "Do not harden ahead of derivation" is not only a task-ordering rule; it is a per-site property, and the sites that route on a _prior_ step are where it hides.
- **Enumerate the call sites by hand — REJECTED (this is the plan's own central correction).** The draft did exactly this and reached 7 of 18 while its gates stayed green, because the prose audit strips fenced blocks and could not see the remainder. A hand-list cannot be complete-by-construction and its blind spots correlate with the defect's (the shipped `EXPECTED_CONSTANTS` omits 6-of-7 — precisely the dead constant). The list is derived from a rule over the corpus (T5.3) and the rule's green is what licenses T3.8 (Gate 2b).
- **Change `>` to `>=` while converting — REJECTED (out of scope).** Preserve today's comparison semantics exactly; the point is provenance, not threshold tuning. `MAX_CHALLENGE_REMEDIATE_ATTEMPT` reuses the existing `THRESHOLD=$((MAX_X - 1))` idiom (precedent: `bkit-debug.md:192-193`) to reproduce the literal-`1` gate byte-for-byte.
- **Copy `PRIOR_STRATEGY`'s fold-and-read shape — REJECTED.** Correct-ish for strategy; wrong for attempts (a resumed run would inherit a spent budget — the DE-25 starvation). Two reads, one log, deliberately opposite scoping, commented at both sites.
- **A fixture per site asserting the derived _number_ against a seeded log — OUT OF SCOPE.** T5.4 pins the mapping without needing one.

## Out of Scope _(this sub-plan)_

- **Prose removal (WS-4), primitive deletion (WS-6), telemetry provenance (WS-7), docs/ledgers/regeneration (WS-8)** — all [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md). In particular: **do NOT delete prose counter statements here.** T4.1 deleting the substitution prose while any block is unconverted is worse than the status quo; it is correctly gated on Gate 2b, which this sub-plan produces.
- **`pnpm bkit install`** — runs ONCE at T8.3 in [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md). **Do NOT run it here for any reason**, including to make a gate pass. `58-workflow-counters-plan-1.md`'s T2.0 repointed every suite template-relative precisely so you never need to.
- Verdict semantics, strategy selection, sub-plan iteration logic. `PASS`/`FAIL`/`CONCERNS` and `STANDARD`/`PIVOT`/`FINAL` need judgment and stay in the orchestrator.
- Renaming or restructuring step IDs; artifact file formats.
- `TEST_VERDICT` / `TEST_SCOPE` pass via `--arg` and accept empty silently, unlike the counters' `--argjson` hard-stop. Legitimately model judgments; not fixed here. → deferral row.
- `PRIOR_STRATEGY`'s all-runs scoping — flagged and commented, not changed. → deferral row.
- `CI_ATTEMPTS` — a loop-local poll counter incremented and consumed **inside one fenced block**. Never crosses a process boundary, never model-authored. Not a call site. **T5.3 exempts it by name** — that exemption is a consequence of the completeness rule's existence, not a scope expansion. **Sites, corrected and measured:** three `--argjson a "$CI_ATTEMPTS"` consumers at `bkit-build.md:1312`, `bkit-debug.md:1035` and `bkit-debug.md:1153`, in three assign-and-consume loop blocks at `bkit-build.md:1258`+, `bkit-debug.md:980`+ and `bkit-debug.md:1099`+ — **debug has two CI-gate blocks, and `bkit-ship.md` has ZERO `CI_ATTEMPTS` references** (this plan cited `bkit-ship.md` through review; the "×3" total was right by accident). The exclusion itself is verified correct: each block assigns and consumes within one fence.
- **`status.jsonl` run-boundary semantics** — characterised by `58-workflow-counters-plan-1.md`'s T2.10; changing it belongs to #209's substrate. → deferral row.
- **Whether `debug-run-tests` should regain a per-attempt commit** — collides with KN-26 (§ item 10c) and **must not be answered by an implementer applying the per-site shape**. → deferral row.

## Merge Method

**Merge method: always squash.** All three sub-plans land in **ONE PR** — non-negotiable per Breaking Changes item 1: **WS-3's derivation and T3.8's fail-closed hardening are the two halves of the KN-26 pair and must not be separable at the merge boundary.** The sub-plan split is an execution-session boundary, **NOT** a PR boundary. Do not open a PR at the end of this sub-plan. `bkit-ship.md` Step 5 is hardcoded to `gh pr merge --squash --delete-branch --body ""`.

## Supersession Inventory _(this sub-plan's rows)_

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `ATTEMPT_COMPARISON_PATTERN` + `MAX_LITERAL_DEFINITION_PATTERN` (`bkit-counter-prose-audit.test.ts:89-97`) | widened bare-name pattern + placeholder/`MAX_` exemptions + negative control | DELETE | `\bATTEMPT\b` cannot match `X_ATTEMPT`; both patterns match nothing in the corpus (§ Breaking Changes item 6). |
| **18 fenced `--argjson {a,sa} "$X_ATTEMPT"` write sites** (`bkit-build.md:538`, `:612`, `:716`, `:761`, `:818`, `:936`, `:1006`, `:1056`; `bkit-debug.md:332`, `:400`, `:570`, `:643`, `:697`, `:756` ×2, `:808`; `bkit-ship.md:562`, `:625`, `:685`) | in-block re-derive at every site (`counter_next` / `counter_current` / `counter_count` per position) | DELETE | **The plan's central correction.** Each is a fenced block reading a number that shell state cannot have carried — i.e. one the model remembered and typed, the exact defect #58 was filed against. The draft converted 7 and none of its gates could see the rest (the prose audit strips fenced blocks). Enumerated here as an index; **T5.3's rule is the authority** (§ Breaking Changes item 10a). |
| Hardcoded literal `1` gate: `bkit-build.md:780-783`, `:804` | `MAX_CHALLENGE_REMEDIATE_ATTEMPT` via `THRESHOLD=$((MAX_CHALLENGE_REMEDIATE_ATTEMPT - 1))` | DELETE | Closes constraint 6 in both directions: the literal is duplicated in prose **and** the constant is dead. |
| `2>/dev/null` on all 6 `decide_next`/`check_max` call sites | stderr surfaced | DELETE | Suppresses the only diagnostic the guard produces. |
| `counter_reset SOAK_ATTEMPT` call at `bkit-debug.md:432` | `soakEntryAt` `workflow-meta` marker (T3.6) | DELETE | Inert: the helper writes `BKIT_COUNTER_SOAK_ATTEMPT` while `:440` reads `$SOAK_ATTEMPT`; the two never meet. _(The primitive's own definition is deleted at T6.1 in [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md) — LAST, per constraint 5.)_ |

## Security & Privacy

- [x] **None — no new routes, DB writes, secrets, or user input.**
- **Untrusted input:** counters are derived from `status.jsonl`, written only by the workflows themselves — not from issue/PR/comment bodies. The derivation adds no attacker-controlled path (#342 contract unaffected).

## Data Schema Integration

No database. The "schema" here is the `status.jsonl` append-only event log.

- **Input (Read):** folded run array → `.workflow`, `.status`, `.steps[].step`, `.steps[].status`, `.steps[].subPlan`, `.steps[].at`, `.steps[].parentSha`; run-level `.debugAttempt` (existing `workflow-meta` field, cross-run, `DEBUG_ATTEMPT` only).
- **Output (Write):** `step-done` rows (unchanged shape; `attempt` now shell-derived within the writing block instead of `--argjson`-ed from a model-supplied variable).
- **ADD:** `workflow-meta.soakEntryAt` (type: string, ISO-8601 UTC) — appended at every SOAK entry in `bkit-debug.md` (**T3.6 — this sub-plan writes it**). Folds onto the run object via the existing `workflow-meta` merge branch. Additive and optional; absent → all soak rows in the active run count (fresh budget). No migration.

> [!IMPORTANT]
> The marker's timestamp MUST be carried in the named `soakEntryAt` field, **not** inferred from the event's `at`: the fold does `del(.type,.workflow,.at)` on `workflow-meta`, so `at` is discarded before it reaches the run object.

## Architecture & Component Changes

### [MODIFY] `.bkit/templates/.bkit/scripts/bkit-counter-bus.sh` — **hardening half only (T3.8)**

- **HARDEN** `check_max` / `decide_next`: `case $_val in ''|*[!0-9]*) … return 2;; esac` on both the value and the max; exit 2 prints **nothing** on stdout, diagnostic on stderr with the `[bkit-telemetry]` prefix. Preserve `>`-comparison semantics exactly.
- **NOT here:** adding the three helpers (`58-workflow-counters-plan-1.md` T2.1, done) or deleting the four primitives (`58-workflow-counters-plan-3.md` T6.1, last).

### [MODIFY] `.bkit/workflows/bkit-build.md`

- **Existence Check:** exists. Verified sites: `:49` Limits, `:89` Failure Path trigger, `:146`/`:333`/`:592`/`:987` FOLD (**already converted by `58-workflow-counters-plan-1.md` T1.2**), `:316` Init counters, `:367` Gate 4, `:470` sub-plan reset, `:526` Increment VERIFY, `:538` verify row write, `:563` `decide_next VERIFY`, `:571` Gate 6, `:716`/`:761`/`:818` challenge rows, `:780-783`/`:804` literal-`1` gate (**position 4 — `counter_count`, 0 legal; NOT `counter_current`**), `:806` Increment CHALLENGE, `:841` Gate 11, `:911` Increment TEST, `:936` test row write, `:960` `decide_next TEST`, `:968` Gate 13, `:1196-1197` counter row (**→ `58-workflow-counters-plan-3.md` T7.1**).
- **8 `--argjson` counter sites** (T3.0's rule-derived worklist is authoritative, not this list): `:538`, `:612`, `:716`, `:761`, `:818`, `:936`, `:1006`, `:1056`. The draft's existence-check named `:716`/`:761` only as "challenge rows" and omitted `:612`/`:1006`/`:1056` entirely — all five are **unconverted consumers**, each reading a bare `$X_ATTEMPT` across a process boundary. `:612`, `:1006` and `:1056` write a row for a **different step** than the counter they carry.
- Steps here: VERIFY / TEST / CHALLENGE_REMEDIATE derive + route at **every** site the rule lists. _(Prose removal and gate-checklist rewording are `58-workflow-counters-plan-3.md`'s WS-4; the telemetry row is its T7.1.)_

### [MODIFY] `.bkit/workflows/bkit-debug.md`

- **Existence Check:** exists. Verified sites: `:49-50` Limits, `:90` Failure Path trigger, `:132`/`:179`/`:323`/`:624` FOLD (**already converted**), `:175-181` `PRIOR_DEBUG_ATTEMPT` fold (**cross-run — preserve, and COPY not move; it is the placeholder source for ~18 readers**), `:183-186` `DEBUG_MODE` selection (**control-flow, T3.4b**), `:187-194` `decide_next DEBUG`, `:243` Gate 1, `:306` Init counters, `:325-327` run-boundary condition (a fresh **invocation** is not a fresh **run**), `:332` `workflow-meta debugAttempt` (**both the marker precedent AND an unconverted consumer**), `:358` Gate 2, `:372` Increment NORMAL, `:396` "Update status:" — **no commit, KN-26; must not gain one**, `:400` run-tests row, `:417-418` prose `NORMAL_ATTEMPT` comparisons, `:424` `decide_next NORMAL`, `:427-434` SOAK escalation + `counter_reset` (`:434` uses reversed operand order — "`SOAK_ATTEMPT` reset to 0"), `:440` `check_max SOAK` (**position 4 — `counter_count`, 0 legal; rows are written in Step 7**), `:448` Gate 3, `:661` diagnose-driven SOAK reset, `:744` Increment SOAK, `:756` soak row (carries **both** `a`=NORMAL and `sa`=SOAK), `:784` Gate 7, `:802` prose `NORMAL_ATTEMPT > 1`, `:808` Step 8 row write (**distinct from `:802`'s prose**), `:953-954` counter row (**→ `58-workflow-counters-plan-3.md` T7.1**).
- **7 `--argjson` counter sites / 8 counter references** (T3.0's rule-derived worklist is authoritative): `:332` (DEBUG), `:400` (NORMAL), `:570` (DEBUG), `:643` (NORMAL), `:697` (NORMAL), `:756` (**NORMAL `a` + SOAK `sa`**), `:808` (NORMAL).
- Steps here: DEBUG re-derived in **every** consuming block (cross-run scoping preserved + commented; `:180-181` retained); `DEBUG_MODE` selection at `:183-186` → fenced derive, mode branch stays prose; NORMAL derived at all 5 sites (incl. the 3 non-cap prose comparisons); SOAK derived via `--since soakEntryAt` + marker appended at **all three** entry points (`:427-434`, `:661`, **and invocation-start `:185-186`/`:194`**).

### [MODIFY] `.bkit/workflows/bkit-ship.md`

- **Existence Check:** exists. Verified sites: `:49` Limits, `:93` Failure Path guards, `:135`/`:304`/`:665` FOLD (**already converted**), `:286` `Set MERGE_ATTEMPT = 0`, `:338` Gate 2, `:519` Increment MERGE, `:562` merge row, `:586` `decide_next MERGE`, `:594` Gate 6, `:1004-1005` counter row (**→ `58-workflow-counters-plan-3.md` T7.1**).
- **3 `--argjson` counter sites** (T3.0's rule-derived worklist is authoritative): `:562`, `:625`, `:685`. The draft named `:562` only; `:625` (`ship-failure-diagnose`) and `:685` (`ship-failure-remediate`) each write a row for a **different step** than the `MERGE_ATTEMPT` they carry.

### [MODIFY] `.bkit/workflows/bkit-plan.md` · `.bkit/workflows/bkit-design.md`

- FOLD sites only — **already converted by `58-workflow-counters-plan-1.md` T1.2**. No `*_ATTEMPT` retry counters. Their counter rows (`bkit-plan.md:760-761`, `bkit-design.md:764-765`) are `58-workflow-counters-plan-3.md`'s T7.1. **T5.3 still scans all 5 workflows** and must be green over them.

### [MODIFY] `.bkit/src/bkit-counter-prose-audit.test.ts` — **T5.1 + T5.3 + T5.4 only**

- **Existence Check:** exists. **`58-workflow-counters-plan-1.md`'s T2.0 already repointed `configPath`/`busPath` template-relative** — if it did not, stop and fix that first.
- **This sub-plan:** replace both vacuous patterns + add the placeholder / `MAX_`-name exemptions + the negative control (T5.1); add the completeness rule (T5.3); add the mapping rule (T5.4).
- **NOT this sub-plan:** `EXPECTED_FUNCTIONS` + absent-primitives rule (T6.2) and the counter-row provenance rule (T7.1) → [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md). T2.6 + T5.2 already landed in [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md). **The file is edited by all three sub-plans; each owns disjoint rules — do not touch a sibling's.**

> [!NOTE]
> T5.1/T5.3/T5.4 scan `.bkit/workflows/*.md` — the canonical **source**, not a mirror — and are correct as written. Only reads of `.bkit/scripts/*.sh` were affected by the installed-mirror defect.

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, **DO NOT fail silently**. Append a `kind:"deferral"` (or `kind:"failure"`) row per `.bkit/jsonl.md` with context before stopping.
> **Step Isolation:** Do NOT jump ahead. Complete each task fully (including its verification and checking its box) before starting the exact next task.
> **Edit the SOURCE, never the mirror:** `.bkit/templates/.bkit/scripts/*.sh` → `.bkit/scripts/*.sh`; `.bkit/workflows/*.md` → `.claude/` / `.cursor/` / `.opencode/`. **`pnpm bkit install` runs ONCE at T8.3 in [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md) — never here.**
> **ASCII operators only** in `.bkit/workflows/*.md` and `.bkit/prompts/*.md` — `!=` `>=` `<=`, never `≠ ≥ ≤`.
> **Execution order is load-bearing and is NOT the section order below.** Run: **T5.1 → T5.3 → T3.0 → T3.1 → T3.2 → T3.3 → T3.4 → T3.4b → T3.5 → T3.6 → T3.7 → T5.4 → 🔒 Gate 2b → T3.8 → T3.9.** T5.1/T5.3 must be **RED against today's tree first** — a rule that has never fired is a rule with no evidence behind it (§ item 6). They are listed in a WS-5 section for topical grouping only.

### WS-5 (partial) — Widen the prose audit + add the completeness rule (BOTH must fire before WS-3)

> **These two run FIRST.** T3.0 runs T5.3 and consumes its output; [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md)'s T4.1 runs T5.1 and consumes its output. Both must be **RED against today's tree first**.
>
> T5.2 already landed in [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md). **T5.4 runs LAST of the four** — after T3.7 — because before WS-3 no block derives at all, so it has nothing to map.

- [ ] **T5.1:** Rewrite `.bkit/src/bkit-counter-prose-audit.test.ts`'s patterns: ban any bare `\b[A-Z][A-Z0-9_]*_ATTEMPT\b` outside a fenced block, exempting (a) `{X_ATTEMPT}` brace placeholders **with a negative lookbehind on `$`** and (b) `MAX_`-prefixed constant **names**. The lookbehind is load-bearing: **48 `${X_ATTEMPT}` shell expansions** exist in the corpus, and an exemption written as "`{X_ATTEMPT}` is allowed" silently exempts every one — a model-substituted **value** reference, precisely what the rule exists to ban (§ Breaking Changes item 5). Add a **negative control** `describe` asserting the pattern matches the four known-bad literals (`Init counters: \`VERIFY_ATTEMPT\` = 0`, `Increment \`TEST_ATTEMPT\` + 1`, `\`CHALLENGE_REMEDIATE_ATTEMPT\` < 1`, `\`NORMAL_ATTEMPT\` > 1`) **and the reversed-operand form** (`\`SOAK_ATTEMPT\` reset to 0`— the shape`:434`uses and T4.1's draft grep missed), matches`${TEST_ATTEMPT}`in prose, and does **NOT** match`{VERIFY_ATTEMPT}`or`MAX_TEST_ATTEMPT`. Delete `ATTEMPT_COMPARISON_PATTERN`and`MAX_LITERAL_DEFINITION_PATTERN`.
  - **Done when:** the negative-control tests pass — including the `${TEST_ATTEMPT}`-is-caught and `SOAK_ATTEMPT reset to 0`-is-caught cases (proving the pattern fires; the shipped one matched **nothing**); the rule is **RED against today's corpus** and its output is captured to `prose-violations.txt` for T4.1; after WS-4 the corpus tests pass over all 5 workflows; re-introducing `Init counters: \`TEST_ATTEMPT\` = 0`into`bkit-build.md` reds the suite (verify by temporary edit, then restore).

  > [!IMPORTANT]
  > **Cross-sub-plan clause:** "after WS-4 the corpus tests pass over all 5 workflows" cannot be satisfied here — WS-4 is [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md)'s T4.1/T4.2. Land the pattern + negative control here, capture the RED to `docs/plans/202607/logs/58-workflow-counters/prose-violations.txt`, and tick T5.1 on the negative-control + RED-captured + red-on-reintroduction clauses. **The corpus-green clause is re-verified at `58-workflow-counters-plan-3.md`'s T4.2 Done-when, which independently requires T5.1's audit to be green.** The RED is expected and correct here — **do NOT delete prose to chase green** (that is T4.1's, and doing it before Gate 2b is worse than the status quo — see § Out of Scope).

- [ ] **T5.3:** **The completeness rule — the only artifact in this plan that can see inside a fenced block, and therefore the only one that can detect an unconverted site (§ Breaking Changes item 10a).** Add to `.bkit/src/bkit-counter-prose-audit.test.ts`: for each fenced block in the 5 workflows, if the block references a bare `$X_ATTEMPT` / `${X_ATTEMPT}` then that **same block** must derive it (`counter_count` / `counter_next` / `counter_current`, or an inline `debugAttempt` fold). Exempt `CI_ATTEMPTS` **by name**, with a comment: it is loop-local, assigned and consumed inside one block, never crosses a process boundary, and is out of scope by § Out of Scope — the exemption is a consequence of this rule's existence, not a scope expansion. Note the existing `stripFencedBlocks` (`:36-40`) is the _prose_ audit's helper; this rule needs the inverse (iterate blocks, not strip them).
  - **Done when:** the rule is **RED against today's tree, listing all 18 `--argjson` sites** (`bkit-build.md` 8, `bkit-debug.md` 7, `bkit-ship.md` 3) — that RED is captured to `unconverted-sites.txt` and is T3.0's worklist; the `CI_ATTEMPTS` exemption is by-name with the stated reason and **all three** of its loop blocks stay green (`bkit-build.md:1258`+, `bkit-debug.md:980`+ **and `bkit-debug.md:1099`+** — debug has **two** CI-gate blocks; the plan cited only one through review, harmless because the exemption is by-name, but the citation was short); after WS-3 the rule is **green**; re-introducing a bare `$TEST_ATTEMPT` read into any converted block reds it (verify by temporary edit, then restore); Gate 2b consumes this rule's green as its licence for T3.8.

### WS-3 — Convert all call sites, THEN harden the guard (the KN-26 atomic pair)

> **Per-site shape** (adapt per position — do **NOT** apply verbatim; match existing formatting per `.bkit/workflows.md` § Reuse wording and formatting):
>
> ```bash
> REPO_ROOT=$(git rev-parse --show-toplevel)
> . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
> . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"
> . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus-config.sh"
> STATUS="$REPO_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl"
> # ACTIVE-RUN scoping — deliberately OPPOSITE to PRIOR_STRATEGY's all-runs read (Step N).
> TEST_ATTEMPT=$(counter_current "$STATUS" build build-run-tests) || exit 2
> decide_next TEST_ATTEMPT "$TEST_ATTEMPT" "$MAX_TEST_ATTEMPT" step-14 failure-path
> ```
>
> **FOUR positions per site** — the draft named three and mandated "repeat verbatim", which is how two live routes got bricked (10b) and how KN-26's fix would have been reverted (10c):
>
> 1. **derive-at-START** — `counter_next`; prints the value the orchestrator substitutes into `{X_ATTEMPT}` placeholders.
> 2. **status-write** — re-derives with `counter_next` **inside the same block** (the row is not yet appended) and uses it for `attempt` and the `artifacts` filename, replacing `--argjson a "$X_ATTEMPT"`. **The commit-subject clause applies ONLY where the block already commits.** `bkit-debug.md:396-403` writes its row with **no commit** and **must not gain one** — that is KN-26's remediation, not an oversight (item 10c). Verbatim application here re-enters a critical known-broken pattern.
> 3. **route-after-own-write** — `counter_current` (the row it just wrote _is_ this attempt; `0` is impossible).
> 4. **route-on-a-prior/not-yet-executed-step** — **`counter_count`**, `0` legal, exit 0 → continue branch. Live sites: `bkit-build.md:778-784`/`:804`, `bkit-debug.md:440`. **Never `counter_current` here** (item 10b).
>
> **Counter != the row's own step at 11 of the 19 counter references** (spanning 11 of the 18 sites — measured, see § Breaking Changes item 10a; this plan said "7" through review while listing 8). Each of these writes a row for a _different_ step than the counter it records, so the derive is keyed on **the counter's step, not the row's step**:
>
> <!-- prettier-ignore -->
> | Site | Row's step | Counter | Derives on (counter's step) | Task |
> | --- | --- | --- | --- | --- |
> | `bkit-build.md:612` | `build-plan-gaps-remediate` | `VERIFY_ATTEMPT` | `build-plan-verify` `--sub-plan N` | T3.1 |
> | `bkit-build.md:716` | `build-challenge` | `CHALLENGE_REMEDIATE_ATTEMPT` | `build-challenge-remediate` | T3.3 |
> | `bkit-build.md:761` | `build-challenge-reconcile` | `CHALLENGE_REMEDIATE_ATTEMPT` | `build-challenge-remediate` | T3.3 |
> | `bkit-build.md:1006` | `build-failure-diagnose` | `TEST_ATTEMPT` | `build-run-tests` | T3.2 |
> | `bkit-build.md:1056` | `build-failure-remediate` | `TEST_ATTEMPT` | `build-run-tests` | T3.2 |
> | `bkit-debug.md:643` | `debug-failure-diagnose` | `NORMAL_ATTEMPT` | `debug-run-tests` | T3.5 |
> | `bkit-debug.md:697` | `debug-failure-remediate` | `NORMAL_ATTEMPT` | `debug-run-tests` | T3.5 |
> | `bkit-debug.md:756` (`a`) | `debug-failure-soak` | `NORMAL_ATTEMPT` | `debug-run-tests` | T3.5 |
> | `bkit-debug.md:808` | `debug-push-remediation` | `NORMAL_ATTEMPT` | `debug-run-tests` | T3.5 |
> | `bkit-ship.md:625` | `ship-failure-diagnose` | `MERGE_ATTEMPT` | `ship-merge-pr` | T3.7 |
> | `bkit-ship.md:685` | `ship-failure-remediate` | `MERGE_ATTEMPT` | `ship-merge-pr` | T3.7 |
>
> The remaining 8 references need no mapping care: 6 already match (`build:538`, `:818`, `:936`; `debug:400`, `:756`'s `sa`; `ship:562`) and 2 are `DEBUG_ATTEMPT`'s invocation index (`debug:332`, `:570`), which is not step-keyed at all.
>
> **T3.0's worklist — regenerated by rule — is the authority; this table is a convenience index into it** (and the same mapping T5.4 asserts mechanically). Getting it wrong is silent: valid JSON, wrong number, green T5.3.
>
> Every routing block gains: `- **If** any other exit → **Failure Path**.` and loses its `2>/dev/null`.

- [ ] **T3.0:** **(FIRST in WS-3 — the worklist is generated, not hand-copied.)** Land T5.3's completeness rule **first** (it is listed under WS-5 for topical grouping; execute it here), then run it and let it print the worklist. It must red today against **all 18 `--argjson` sites**. Record its output verbatim to `docs/plans/202607/logs/58-workflow-counters/unconverted-sites.txt` — that file, not the line numbers in this plan, is the authority for what T3.1–T3.7 must convert. For each site record: file:line · counter · **the counter's step** (which is _not_ the row's step at 7 sites — see the per-site shape) · sub-plan/since qualifier · which of the four positions it is.
  - **Done when:** `unconverted-sites.txt` exists and lists **exactly 18** sites / **19 counter references** (`bkit-build.md` 8, `bkit-debug.md` 7 — `:756` carries two — `bkit-ship.md` 3) with a position and counter-step mapping each; the rule's RED output is the file's source (regenerated by command, not typed); `CI_ATTEMPTS` is absent (exempt by name — loop-local); every site in the file maps to exactly one of T3.1–T3.7 and no site is unassigned; the recorded mapping **matches § WS-3's per-site table on all 11 counter-!=-row references** and is the source T5.4's `COUNTER_STEP_MAP` is written from. **If the count is not 18/19: STOP and reconcile before converting anything** — the rule is authoritative over this plan's prose, so either the corpus moved since plan time or the rule is mis-scoped; establish which, record it here, and only then proceed. _(This clause previously read "follow the rule and note the delta", which every outcome satisfied — an unfalsifiable line in the plan's most load-bearing task. 18/19 is measured against the tree; a divergence is a real signal, not a formality.)_
- [ ] **T3.1:** `VERIFY_ATTEMPT` — `bkit-build.md` Step 6. Derive at `:526` (replacing `Increment VERIFY_ATTEMPT + 1`), re-derive in the `:538` write block, route at `:563` with `counter_current "$STATUS" build build-plan-verify --sub-plan "$SUB_PLAN"`. **Plus `:612`** (per T3.0's worklist) — a separate fenced block writing a `build-plan-gaps-remediate` row that carries `attempt: $VERIFY_ATTEMPT` and uses the value 3× (`--argjson a`, `artifacts` path, commit subject); it re-derives `counter_current … build build-plan-verify --sub-plan "$SUB_PLAN"` (**the counter's step, not the row's**). Preserve the `>` comparison against `MAX_VERIFY_ATTEMPT`.
  - **Done when:** `grep -n 'Increment .VERIFY_ATTEMPT' .bkit/workflows/bkit-build.md` returns nothing; the `:563` block contains `counter_current`, `--sub-plan`, no `2>/dev/null`, and the routing list has an `any other exit` → Failure Path line; **both** `VERIFY_ATTEMPT` sites from `unconverted-sites.txt` (`:538`, `:612`) derive in-block and neither reads a bare `$VERIFY_ATTEMPT`; `pnpm vitest run .bkit/src/bkit-counter-prose-audit.test.ts` still passes.
- [ ] **T3.2:** `TEST_ATTEMPT` — `bkit-build.md` Step 13 (`:911` derive, `:936` write, `:960` route, step `build-run-tests`) **plus `:1006` and `:1056`** (per T3.0's worklist — Step 14's `build-failure-diagnose` and Step 15's remediate write blocks, each reading `$TEST_ATTEMPT` with no in-block derive and using it 3×). Both re-derive `counter_current "$STATUS" build build-run-tests` (the counter's step, not the row's).
  - **Done when:** the `:960` block matches the routing position of the per-site shape (no `2>/dev/null`, `counter_current`, `any other exit` line); `grep -n 'Increment .TEST_ATTEMPT' .bkit/workflows/bkit-build.md` returns nothing; all **3** `TEST_ATTEMPT` sites from `unconverted-sites.txt` derive in-block.
- [ ] **T3.3:** `CHALLENGE_REMEDIATE_ATTEMPT` — `bkit-build.md` Steps 10-11. Replace the literal-`1` prose gate (`:780-783`, `:804`) with two fenced `decide_next` blocks (one per verdict branch: CONCERNS → exceeded `step-13`; FAIL → exceeded `failure-path`), each deriving with **`counter_count "$STATUS" build build-challenge-remediate`** — **NOT `counter_current`** (§ Breaking Changes item 10b: this is position 4, routing on a step that has **not run yet**; on the first CONCERNS/FAIL the count is legitimately `0`, and `counter_current` would refuse it → `|| exit 2` → Failure Path where today it routes to Step 11, hard-failing **every** build that reaches Step 10 with a non-PASS verdict). Compare against `THRESHOLD=$((MAX_CHALLENGE_REMEDIATE_ATTEMPT - 1))` (idiom precedent: `bkit-debug.md:192-193`). Note `MAX_CHALLENGE_REMEDIATE_ATTEMPT=1` → **`THRESHOLD=0`**, the corpus's only live zero-threshold: `decide_next` compares `count > 0`, reproducing the `< 1` gate byte-for-byte, and T3.8's guard must accept `0` as a valid max (T2.9 asserts this). Derive at `:806`; re-derive in the `:818` write block. **Plus `:716` and `:761`** (per T3.0's worklist — the Step 9/10 challenge-row writes, both reading a bare `$CHALLENGE_REMEDIATE_ATTEMPT`). **Both are counter-!=-row sites and both must derive on `build-challenge-remediate`, NOT on the step their own row names** (`:716` writes a `build-challenge` row; `:761` writes `build-challenge-reconcile`; only `:818` writes `build-challenge-remediate` itself). This task previously named these two sites without naming their step — the one WS-3 task missing the explicit step-naming its four siblings carry, and precisely where the plan's "7 of 18" undercount hid them (§ Breaking Changes item 10a). Keep the verdict branches themselves in prose.
  - **Done when:** `grep -nE 'CHALLENGE_REMEDIATE_ATTEMPT.*(<|>=) 1' .bkit/workflows/bkit-build.md` returns nothing; `grep -rn 'MAX_CHALLENGE_REMEDIATE_ATTEMPT' .bkit/workflows/` returns >=1 hit inside a fenced block (the constant is no longer dead); **no `counter_current` appears at `:778-784`/`:804`**; routing behaviour is unchanged and **proved by T2.9's count-0 case**, not by prose (0 prior remediations → Step 11; 1 → Step 13 / Failure Path per verdict); all **3** `CHALLENGE_REMEDIATE_ATTEMPT` sites from `unconverted-sites.txt` derive in-block, and **each of the 3 derives on the step `build-challenge-remediate`** — verify literally: every `counter_count`/`counter_current` call in the `:716`, `:761` and `:818` blocks names `build-challenge-remediate` and **none names `build-challenge` or `build-challenge-reconcile`** (T5.4 asserts this mapping mechanically; this Done-when is the human-readable statement of it).

  > [!NOTE]
  > **This task closes [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md)'s T5.2 RED.** The `MAX_CHALLENGE_REMEDIATE_ATTEMPT` reference this task adds is the one the no-dead-constant rule was waiting for. Re-run T5.2's full Done-when at Gate 2b, including its delete-the-reference red-proof.

- [ ] **T3.4:** `DEBUG_ATTEMPT` — `bkit-debug.md`. **COPY the `:180-181` fold into every consuming fenced block; do NOT move it** (§ Breaking Changes item 8 — moving it starves ~18 cross-block readers including `:332`'s marker write, killing every debug run at `debug-worktree-setup`; the draft's "no cross-block `$DEBUG_ATTEMPT` read" Done-when was unsatisfiable either way). `:180-181` **stays** as the orchestrator's substitution source for `{DEBUG_ATTEMPT}` placeholders. Each consumer re-derives with the cross-run expression **preserved verbatim** (`[.[] | select(.workflow=="debug")] | last.debugAttempt // 0`), carrying a comment that this counter is an **invocation index** and must **NOT** be scoped to the active run (that would permanently disable SOAK escalation). Convert per T3.0's worklist: the `:187-194` routing block (keep `THRESHOLD=$((MAX_DEBUG_ATTEMPT - 1))`, drop `2>/dev/null`, add the `any other exit` line), **`:332`** (the `workflow-meta` marker write — an unconverted **consumer**, not merely "the marker precedent"; until it re-derives, the plan's only cross-run counter is grounded in a model-supplied value that T7.1 would inherit), and **`:570`** (the `debug-context-fetch` row write).
  - **Done when:** `:180-181` still exists (it is the placeholder source); every fenced block in `unconverted-sites.txt` that references `DEBUG_ATTEMPT` (`:332`, `:570`, plus `:187-194`'s route) derives it in-block; each carries the comment containing `invocation` and `NOT active-run`; `grep -c 'select(.workflow=="debug")] | last.debugAttempt' .bkit/workflows/bkit-debug.md` >= 3; T5.3 shows zero remaining `DEBUG_ATTEMPT` violations.
- [ ] **T3.4b:** `DEBUG_MODE` selection — `bkit-debug.md:183-186`. Convert `:186`'s bare-name prose ("any `debug-failure-soak` step recorded for the current `DEBUG_ATTEMPT`") into a fenced derive: the **active-run** `debug-failure-soak` count (`counter_count "$STATUS" debug debug-failure-soak`, `0` legal). **The mode branch stays prose** — SOAK-vs-NORMAL is a verdict-shaped judgment, not a number (§ Out of Scope). Add a comment recording _why_ this is well-defined: soak rows carry `attempt: $NORMAL_ATTEMPT`, **not** a `debugAttempt` field, so "recorded for the current `DEBUG_ATTEMPT`" has no field to key on — only active-run scoping (one `workflow-started` per debug invocation) makes it meaningful, which is fortunate rather than designed. **This task exists because `:186` is a control-flow site no draft task touched**, while T5.1's widened audit would flag its bare name — pushing an implementer at T4.2 (remit: gate/Limits **wording**) into silently rewording a mode-selection branch.
  - **Done when:** `:183-186` carries a fenced derive and no bare `DEBUG_ATTEMPT`; the mode branch is still prose; a bats case asserts `DEBUG_MODE` selection is **unchanged** across all four entry conditions (fresh run / `[soak]` prompt / soak-rows-present / `DEBUG_ATTEMPT >= MAX`); T5.1 is green over `bkit-debug.md:183-186`.
- [ ] **T3.5:** `NORMAL_ATTEMPT` — `bkit-debug.md` Step 3 (`:372` derive, `:400` write, `:424` route, step `debug-run-tests`) **plus the 3 prose sites the issue's table omits** (`:417`, `:418`, `:802` compare `NORMAL_ATTEMPT` against a literal in prose — convert each to a fenced derive + comparison; keep the PASS/FAIL verdict branch in prose) **plus the 3 write sites from T3.0's worklist**: `:643` (`debug-failure-diagnose`), `:697` (`debug-failure-remediate`), `:808` (Step 8's write — distinct from `:802`'s prose, which the draft conflated), and the `a` argument at `:756` (which carries **both** `a`=`NORMAL_ATTEMPT` and `sa`=`SOAK_ATTEMPT`; T3.6 covers only `sa`). Each re-derives `counter_current "$STATUS" debug debug-run-tests` (the counter's step, not the row's).
  - **Done when:** `grep -nE 'NORMAL_ATTEMPT.*(>|=) 1' .bkit/workflows/bkit-debug.md` returns nothing outside a fenced block; Step 8's `Run only if` at `:802` reads from a fenced derive; `grep -n 'Increment .NORMAL_ATTEMPT' .bkit/workflows/bkit-debug.md` returns nothing; all **5** `NORMAL_ATTEMPT` sites from `unconverted-sites.txt` (`:400`, `:643`, `:697`, `:756`'s `a`, `:808`) derive in-block. **`:396` still reads "Update status:" and has NO commit** (`grep -A8 -n '^5\. Update status:' .bkit/workflows/bkit-debug.md | grep -c 'git commit'` = 0) — KN-26's remediation is intact (§ Breaking Changes item 10c); the commit-subject position of the per-site shape does **not** apply here.
- [ ] **T3.6:** `SOAK_ATTEMPT` — `bkit-debug.md`. Append a `soakEntryAt` marker at **all THREE** SOAK entry paths — `jq -nc --arg t "$(date -u +%FT%TZ)" '{type:"workflow-meta", workflow:"debug", at:$t, soakEntryAt:$t}' >> "$STATUS"`, modelled on the existing `debugAttempt` marker at `:332`:
  1. `:427-434` — the mid-run escalation (replacing `counter_reset SOAK_ATTEMPT`).
  2. `:661` — the diagnose-driven `Mode: SOAK` switch.
  3. **`:185-186` / `:194` — invocation-start SOAK.** The draft excluded this on the grounds that "a fresh run has no soak rows" — **false, and it contradicts the plan's own invocation-vs-run distinction** (§ Breaking Changes item 8). `bkit-debug.md:325-327` appends `workflow-started` **only if** the latest folded run is not (`debug` AND `IN_PROGRESS`), so a fresh **invocation** is not a fresh **run**: a killed or in-progress prior invocation is _resumed_ and its `debug-failure-soak` rows stay in the active run. Invocation-start SOAK is reached precisely via `decide_next DEBUG_ATTEMPT >= MAX_DEBUG_ATTEMPT` (`:194`) — i.e. **only after prior invocations**, exactly the population most likely to carry soak rows. With no marker, `--since soakEntryAt` degrades to `.at > ""` → counts them all → the resumed SOAK inherits a spent budget → **the DE-25 starvation this plan's own Edge Cases claim to prevent**. The marker must precede its consumer on every path.

  Derive at `:744`; re-derive in the `:756` write block (`sa`); route at `:440` with **`counter_count "$STATUS" debug debug-failure-soak --since soakEntryAt`** — **NOT `counter_current`** (§ Breaking Changes item 10b: `:440` is in **Step 3**, soak rows are written in **Step 7**, so it is a route-before-write position that legitimately reads `0`; `counter_current` would refuse it → every `[soak]`-mode invocation hard-fails on its first failing test run — converting today's fail-open into _never-runs-SOAK_, the exact KN-26 inversion at a site the KN-26 discussion never covered).
  - **Done when:** `grep -c soakEntryAt .bkit/workflows/bkit-debug.md` = 4 (**three** writers + the `--since` reader); `grep -n counter_reset .bkit/workflows/bkit-debug.md` returns nothing; **no `counter_current` at `:440`**; T2.8 passes against the real workflow's marker shape; a bats case **in `tests/counter-derive.bats`** (§ Derived Test Matrix carries its own row — this case is distinct from T2.8's generic marker-mechanism row and had no row until scope-check, leaving it invisible to Gate 2's coverage self-check) asserts a resumed invocation-start SOAK gets a **fresh** budget (marker present) rather than inheriting the prior invocation's spent one — fixture: a prior invocation's `debug-failure-soak` rows in the active run, then invocation-start SOAK entry; T2.9's soak-first-pass case routes to **Step 4**, not Failure Path.

- [ ] **T3.7:** `MERGE_ATTEMPT` — `bkit-ship.md` (`:519` derive, `:562` write, `:586` route, step `ship-merge-pr`) **plus `:625` and `:685`** (per T3.0's worklist — the `ship-failure-diagnose` and `ship-failure-remediate` write blocks, both reading a bare `$MERGE_ATTEMPT`; each re-derives `counter_current "$STATUS" ship ship-merge-pr` — the counter's step, not the row's). Remove `Set MERGE_ATTEMPT = 0` at `:286`.
  - **Done when:** `grep -nE 'Increment .MERGE_ATTEMPT|Set .MERGE_ATTEMPT. = 0' .bkit/workflows/bkit-ship.md` returns nothing; the `:586` block matches the routing position of the per-site shape; all **3** `MERGE_ATTEMPT` sites from `unconverted-sites.txt` derive in-block.

### WS-5 (cont.) — the mapping rule (runs AFTER T3.7, BEFORE Gate 2b)

> **T5.4 cannot be RED-first like T5.1/T5.3** — before WS-3 no block derives at all, so it has nothing to map. It runs here, once every site is converted, so Gate 2b can diff its map against `unconverted-sites.txt`. Its evidence is the **three temporary edits** its Done-when mandates, not a RED-vs-`dev` capture.

- [ ] **T5.4:** **The mapping rule — makes "derives the RIGHT counter" falsifiable without a fixture matrix.** Extend `.bkit/src/bkit-counter-prose-audit.test.ts`: for every fenced block that both writes a `step-done` row and derives a counter, extract (a) the row's `step:"…"` literal and (b) the **step argument of the block's `counter_count`/`counter_next`/`counter_current` call**, then assert (b) equals `COUNTER_STEP_MAP[(a)]` — a checked-in table of row-step → counter-step + qualifier (`--sub-plan` / `--since`). T5.3 already parses each block and locates its derive call, so this is a second read of the same parse, not a new mechanism. **Keyed on the row's step, never on line numbers**, which WS-3's edits shift. The map is the durable serialisation of T3.0's worklist (which records exactly this per site, plus the volatile line number).
  - **Why this is not the hand-list the plan spends item 10a rejecting** — the distinction is load-bearing and must not be blurred: a hand-list of **sites** has blind spots correlated with the defect (it cannot know what it omits). This is a table of **intent**, which cannot be derived from the corpus at all, because the corpus is the thing under test. Its **completeness is enforced by the corpus**: any deriving block whose row-step is absent from the map **reds**, so the map cannot be silently short — the one property `EXPECTED_CONSTANTS`'s 6-of-7 hand-list lacked. Only the values are hand-authored.
  - **What it does NOT prove, stated plainly:** the map is authored from T3.0's recorded mapping, so an implementer who mis-maps a site **and** writes the same mistake into the map gets green. It **pins** the mapping; it does not **prove** it. What it buys is that the mapping becomes 11 rows reviewable in one table — diffable against `unconverted-sites.txt` at Gate 2b — instead of 11 derive calls scattered across 5 files and read by eye, and that any later drift reds. Proving the mapping needs a seeded-log fixture per site asserting the derived **number**; that stays out of scope (§ Alternative Approaches).
  - **Done when:** `COUNTER_STEP_MAP` contains the **11** counter-!=-row entries and the **6** counter-==-row entries (17 step-keyed references; `DEBUG_ATTEMPT`'s `debug:332`/`:570` are exempt by name — an invocation index, derived by inline fold, not step-keyed) and every entry matches § WS-3's per-site table; the rule is **green** after WS-3; **each of these three temporary edits reds it, verified one at a time then restored** — (1) changing `:716`'s derive from `build-challenge-remediate` to `build-challenge` (the mis-map this rule exists to catch), (2) deleting any one map entry while its block still derives (proving the map cannot be short), (3) adding a deriving block with a row-step absent from the map; `jq`-free, no fixture, no `bkit install`.

### 🔒 Gate 2b: Derivation COMPLETE — the KN-26 seam, held by construction

> Positioned **immediately before T3.8** so it blocks at the seam it names. The draft's seam sentence lived in Gate 2a (between WS-2 and WS-3), where it could only block entry to T3.1 — never T3.8. The seam is otherwise held only by T3.8's inline note and Gate 2's _retrospective_ checkbox; this gate makes it prospective. Merge Method (ONE PR, squash) already forecloses the PR-boundary risk: **the seam cannot become a PR boundary.**
>
> **It cannot become a sub-plan boundary either: this gate and T3.8 are in the SAME sub-plan, deliberately.** Both halves of the pair ship from here.

- [ ] **Gate 2b - Verified:** T3.0–T3.7 all `[x]`. **T5.3's completeness rule is GREEN over all 5 workflows** — zero fenced blocks read a bare `$X_ATTEMPT` they do not derive (`CI_ATTEMPTS` exempt). Every site in `unconverted-sites.txt` is converted and the rule re-run prints an empty worklist. `grep -rn 'Increment .*_ATTEMPT' .bkit/workflows/` is empty. **This gate — not a hand-count — is what licenses T3.8.** Hardening the guard while any site still supplies a model-authored value converts "may silently overrun" into "never retries" (KN-26 shape).
- [ ] **T5.4 green + map diffed:** `COUNTER_STEP_MAP` diffed against `unconverted-sites.txt` — all 11 counter-!=-row references present and identical.
- [ ] **Inherited re-runs now unblocked** (each was legitimately RED or vacuous in [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md) and is satisfiable only now):
  - **T5.2's** full Done-when, including the delete-the-`MAX_CHALLENGE_REMEDIATE_ATTEMPT`-reference red-proof (T3.3 added the reference).
  - **T2.6's** full Done-when — its enumeration of counted steps was vacuous with no derive sites in the corpus; it now enumerates real ones. Re-run both red-proofs.

- [ ] **T3.8:** **(LAST in WS-3 — do not start until Gate 2b is `[x]`)** Harden `check_max` + `decide_next` in `.bkit/templates/.bkit/scripts/bkit-counter-bus.sh`: reject empty / non-integer value **and** max (`case … in ''|*[!0-9]*)`) → stderr diagnostic + `return 2`, printing nothing on stdout. **`0` is a valid value AND a valid max** — the `case` above accepts it (non-negative integer), and `MAX_CHALLENGE_REMEDIATE_ATTEMPT=1` → `THRESHOLD=0` is the corpus's only live zero-threshold; do **not** add a falsy-rejection (T2.9 reds if you do). Confirm zero `2>/dev/null` remain on any counter-bus call site.
  - **Done when:** `npx bats tests/counter-failclosed.bats` goes **green** (it was RED at Gate 2a **for the documented reason**, not for `command not found`), **including T2.9's count-0 and `MAX=0` cases**; `grep -rn 'decide_next\|check_max' .bkit/workflows/ | grep -c '2>/dev/null'` = 0; every routing list in the 3 workflows has an `any other exit` → Failure Path line (`grep -rc 'any other exit' .bkit/workflows/bkit-{build,debug,ship}.md` >= 1 each).

  > [!NOTE]
  > **If [`58-workflow-counters-plan-1.md`](58-workflow-counters-plan-1.md)'s Gate 2a chose the skip-tag option for the RED window, T3.8 removes the skip-tag** — that was the recorded contract. The RED window closes here.

- [ ] **T3.9:** Re-run the full bats corpus against the converted tree.
  - **Done when:** `npx --yes bats tests/*.bats` exits 0 with >0 tests; `red-vs-dev.txt` still shows the same suite failing against `dev` (the file is evidence, not a test — do not regenerate it).

### Handoff to [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md)

Record before ending this session:

- [ ] **`unconverted-sites.txt` exists and its worklist is now empty on re-run** — it is `58-workflow-counters-plan-3.md`'s reference for what "converted" meant, and Manual Step 4d diffs `COUNTER_STEP_MAP` against it.
- [ ] **`prose-violations.txt` exists** (T5.1's captured RED) — it is **T4.1's removal worklist** in `58-workflow-counters-plan-3.md`, and must have been generated by running the audit, not typed.
- [ ] **Gate 2b is `[x]`** — `58-workflow-counters-plan-3.md`'s T4.1 is gated on it. Deleting the substitution prose before this is worse than the status quo.
- [ ] **T3.4 converted `:332`** — `58-workflow-counters-plan-3.md`'s T7.1 depends on it; without it the honest-provenance claim is grounded in a model-supplied value.
- [ ] **The RED window is CLOSED** (T3.8 green; skip-tag removed if one was used). Pushing is safe again from here.
- [ ] **`red-vs-dev.txt` is untouched** — evidence, not a test. Do not regenerate it downstream.

## Verification Plan _(this sub-plan)_

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck` + `pnpm format:check` + `pnpm lint:slop` + `pnpm lint:prose`.
- [ ] **Slop delta:** `pnpm slop:delta` — net-new findings only. The new shell helpers add no try/catch; if `defensive.error-obscuring` rises, use non-throwing forms rather than suppressing the rule.
- [ ] **Completeness rule green (T5.3):** `pnpm vitest run .bkit/src/bkit-counter-prose-audit.test.ts` — zero fenced blocks read a bare `$X_ATTEMPT` they do not derive. **This is the gate that means "the migration is done".** Re-running the rule prints an empty worklist against `unconverted-sites.txt`'s 18 entries.
- [ ] **T5.3 demonstrably fires:** it was RED against today's tree before the conversion (`unconverted-sites.txt` is the evidence) and reds again on a temporary re-introduction of a bare `$TEST_ATTEMPT` read into a converted block.
- [ ] **T5.4 demonstrably fires:** **T5.4 cannot be RED-first the same way** — before WS-3 no block derives at all, so it has nothing to map; its evidence is instead the three temporary edits its Done-when mandates, each verified to red **one at a time, then restored**: (1) a derive pointed at the wrong step (`build-challenge` instead of `build-challenge-remediate` at `:716`), (2) a map entry deleted while its block still derives, (3) a deriving block whose row-step is absent from the map. Record which of the three were observed. A rule that has only ever been green is not evidence (§ Breaking Changes item 6) — and T5.4 is the mechanism this plan adopted to close its own residual mapping concern, so shipping it unexercised would be that same Defect-4 shape one level up.
- [ ] **T5.1 demonstrably fires:** its negative control passes (including `${TEST_ATTEMPT}`-is-caught and `SOAK_ATTEMPT reset to 0`-is-caught) and `prose-violations.txt` is its captured RED. _(Its corpus-green clause is `58-workflow-counters-plan-3.md`'s T4.2.)_
- [ ] **Shell suites (`tests/*.bats`):** `npx --yes bats tests/*.bats` exits 0 after T3.8 (T3.9).
- [ ] **Vitest:** `pnpm test`. Unit lane is branch-coverage-gated at 65 — confirm no regression.
- [ ] **No `pnpm bkit install` was run in this sub-plan.** The single batched install is T8.3 in [`58-workflow-counters-plan-3.md`](58-workflow-counters-plan-3.md).

> [!IMPORTANT]
> **No Architectural Downgrades**: If you hit build/compiler/test errors during verification, NEVER resolve them via hot fixes or anti-patterns. In particular: do NOT re-add `2>/dev/null` to silence a stderr diagnostic, do NOT default a failed derivation to `0`, do NOT weaken the prose audit to make a stubborn line pass, do NOT add a commit to `bkit-debug.md:396` to make row-counting "self-sufficient" (KN-26 — critical), do NOT use `counter_current` at a position-4 site to make a `0` go away, and do NOT run `bkit install`. Halt if stuck.

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A — no database. | — |
| **Code** | `git revert {SQUASH_SHA}` then `pnpm bkit install` to regenerate mirrors + `.bkit/version` hashes. | Single squash commit spanning all three sub-plans; revert restores the prose counters and the fail-open guard together (**the KN-26 pair inverts cleanly — which is only true because both halves are in this one sub-plan and one PR**). |
| **Data** | None. `soakEntryAt` rows already in a `status.jsonl` are ignored by the reverted code. Additive and forward-compatible. | No log migration either way. |
| **Risk window** | None — no deploy, no migration. A consumer only picks the change up on their next `bkit install` / version bump. | |

_Code-only — `git revert` sufficient._
