<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket, set at design start = 202607). Logs sit at `docs/plans/202607/logs/58-workflow-counters/` and are delete-eligible. -->

# Workflow Attempt Counters — Sub-Plan 1: Single-source the fold + derivation helpers + cross-process tests

**Parent Plan:** [`plan-v4-split.md`](plan-v4-split.md)
**Sibling Sub-Plans:** [`plan-v4-2.md`](plan-v4-2.md) (the KN-26 atomic core) · [`plan-v4-3.md`](plan-v4-3.md) (prose cleanup, deletion, provenance, docs)
**Scope:** WS-1 (T1.1–T1.3) + WS-2 (T2.0–T2.10) + T5.2 · **15 tasks** · ends at 🔒 Gate 2a.
**Position in order:** FIRST. No sub-plan may start before this one's Gate 2a is `[x]`.

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this file natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

## Context & Goals

Workflow orchestrators (`bkit-build`, `bkit-debug`, `bkit-ship`) branch their retry loops on attempt counters the **model** tracks in prose — `Init counters: TEST_ATTEMPT = 0` (`bkit-build.md:316`), `Increment TEST_ATTEMPT + 1` (`bkit-build.md:911`). The counter reaching the shell is a number the model remembered and typed in. `decide_next` does not make that deterministic: it launders a model-supplied number through shell and returns it wearing a uniform, then faithfully enforces the cap against the wrong number. bkit's own telemetry has recorded this since the schema landed — all 10 `counter` rows in `stats.jsonl` declare `counterSource: "model-self-report"`, zero `shell-bus`.

The fix (agreed, `docs/decisions.jsonl` → `58-workflow-attempt-counters-derived-from-status-jsonl-not-stored`) is **derivation, not storage**: `attempt(step) = count(step-done rows for that step, status DONE, in the ACTIVE run of that workflow) + 1`, evaluated at step START and **re-derived** in every fenced block that needs it. Shell state does not survive between orchestrator Bash calls, so a counter is never carried — only re-read.

**This sub-plan is the purely additive foundation.** It single-sources the `status.jsonl` fold into a shipped script, adds the three new derivation helpers **alongside** the still-live inert primitives, repoints the whole test corpus template-relative, and lands the cross-process test suites that prove derivation works. **Nothing here touches an existing `--argjson` call site, hardens a guard, or deletes anything.** That is what makes it reversible in isolation and what keeps it off the KN-26 seam.

**Success Criteria (this sub-plan):**

- The fold blob exists exactly once, in `.bkit/templates/.bkit/scripts/bkit-status-fold.sh`, and all 15 inline copies source it fail-closed.
- `counter_count` / `counter_next` / `counter_current` exist in the counter-bus **template** with the three-position contract documented, and the four inert primitives are **untouched**.
- Every bats suite and the Vitest prose-audit suite resolve the shipped scripts **template-relative** — no suite reads the generated `.bkit/scripts/` mirror.
- The cross-process derivation suites pass; `tests/counter-failclosed.bats` is RED **for the documented reason** (the fail-open), proving it can detect the defect.

**Related Issues:**

- `#234 — telemetry JSONL master feature (open)` — absorbed #58's measurement slice, not its control-flow slice. Owns the `counterSource` enum question; this plan uses the existing `shell-bus` value and adds no enum member.
- `#209 — status.json → append-only status.jsonl + fold (closed)` — the event-log shape derivation depends on.
- `#232`, `#183`, `#233` — consolidated into #234 alongside #58 on 2026-06-06.
- `#341 — all-runtimes / gh fallback + trackers-stay-on-MCP (open)` — named as the fix path for the related-issues search failure below; no scope here.

> [!CAUTION]
> **The related-issues scan was NOT performed this run — treat as missing context, not as "nothing related exists".** `mcp__github__search_issues` returned `total_count: 0` for every probe **including the control** `repo:cbartens/bkit telemetry`, which must match (#234's body is dense with the word). The refs above are carried from the issue body and comments, not re-confirmed by search. Recurrence logged to `.bkit/friction.jsonl` (`design-step-3-related-issues-search-silently-empty-on-private-repo`, `recurrenceCount: 2`). See `related-issues.md`.

## Dependencies

- **Upstream:** None. This is the first sub-plan. `#209` (status.jsonl + fold) already shipped and is the substrate.
- **Downstream:** [`plan-v4-2.md`](plan-v4-2.md) cannot start until 🔒 Gate 2a here is `[x]` — it converts call sites to call `counter_count`/`counter_next`/`counter_current`, which do not exist until T2.1, and its T3.8 hardening is proven by `tests/counter-failclosed.bats`, which does not exist until T2.7/T2.9.
- **This sub-plan owns 🔒 Gate 1 and 🔒 Gate 2a**, and the two 👤 human confirmation checkboxes that gate Gate 1 for the **whole feature** (all three sub-plans).

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **This section is the sign-off point for ALL THREE sub-plans, not just this one.** `plan-v4-2.md` and `plan-v4-3.md` inherit it and carry no second checkbox.
>
> **You do NOT need to read the rest of this plan.** Focus here. The agent handles the rest.

### Narrative

> [!CAUTION]
> **⚠️ No parent design exists (standalone issue). The Narrative below is AGENT-SYNTHESISED from issue #58 § Goal — it is NOT human-provided and appears verbatim nowhere in the issue. Confirm it or replace it.**
>
> `docs/plans/template.md:46` mandates a design-missing fallback that blocks Gate 1 until a human supplies the Narrative. This plan **deviates**: it offers a synthesis to react to rather than a blank, on the judgement that reviewing a concrete sentence beats authoring one from scratch. That deviation is itself a thing you are signing off — see § Breaking Changes item 10/11. If you would rather the template were followed literally, strike the paragraph below and write your own; Gate 1 stays blocked either way until this section's checkbox is `[x]`.

An engineer runs `/bkit-build` on a feature whose tests keep failing. Every retry the workflow takes is bounded by a number the shell counted out of the run's own event log, so the loop stops at the cap it advertises — and if the number is ever unusable, the run stops loudly instead of retrying forever.

### Success Criteria _(inherited from issue #58 § Acceptance — verbatim intent, re-worded only where the source states an impossible absolute; see § Breaking Changes item 5)_

- No `*_ATTEMPT` variable is referenced in orchestrator markdown outside a fenced shell block — including assignment and increment, not only comparisons. (Exemptions, both enforced by the audit: a `{X_ATTEMPT}` brace placeholder the orchestrator substitutes from shell stdout, and a bare `MAX_*` constant **name**.)
- No counter value originates in orchestrator context — every one is read from `status.jsonl` at the point of use. **Enforced by rule, not by a hand-list:** no fenced block reads a bare `$X_ATTEMPT` it did not itself derive (19 counter references across 18 `--argjson` sites today — see § Breaking Changes item 10a).
- All `MAX_*` thresholds come from `bkit-counter-bus-config.sh`, with no literal duplicated in prose and no constant left unreferenced.
- **No legitimate first-attempt route is converted into a Failure Path.** A count of `0` is a valid answer at any site that routes on a step which has not run yet; only a post-own-write position may treat `0` as impossible.
- A workflow exceeding a `MAX_*` threshold cannot silently continue — and an unusable counter cannot silently continue. Both route to the Failure Path.
- Resume re-derives every counter: no restored state, no fresh budget.
- Every emitted `counter` row can honestly claim a non-`model-self-report` provenance.

### Concrete Example _(plan expands from the issue)_

**Setup:** An engineer runs `/bkit-build` on FID `58-workflow-counters`. `MAX_TEST_ATTEMPT=3`. `docs/plans/202607/logs/58-workflow-counters/status.jsonl` holds one `workflow-started` row for `build` and no `build-run-tests` rows.

**Steps:**

1. Orchestrator enters Step 13 → runs the derive block → shell prints `1` → orchestrator uses `1` for the tracker comment (`Attempt: 1`). Tests fail.
2. Orchestrator runs the status-write block → the block **re-derives** `1` itself, appends `{step:"build-run-tests", attempt:1, verdict:"FAIL", parentSha:"a1b2c3d"}`, commits `--allow-empty` (HEAD moves).
3. Orchestrator runs the routing block → re-derives → **`1`** (the row it just wrote **is** attempt 1) → `decide_next TEST_ATTEMPT 1 3 step-14 failure-path` → prints `step-14`, exit 0 → Step 14.
4. Loop repeats. On the 4th failure the routing block derives `4` → `decide_next` prints `failure-path`, exit 1, and `[bkit-telemetry] counter TEST_ATTEMPT exceeded max=3 (value=4)` reaches stderr → **Failure Path**.
5. The engineer kills the session at attempt 2 and re-runs `/bkit-build`. The resumed run re-derives `3` from the same log — no restored state, no fresh budget.

**Outcome:** The run stops at the advertised cap. Four `build-run-tests` rows exist, each with a distinct `parentSha`; the `attempt` field on each equals the row's own ordinal, and every routing decision was made from a number the shell counted, not one the model remembered.

### Edge Cases _(this sub-plan's slice; the full table lives in the parent index)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Counter expands empty / non-integer at a routing block | `decide_next` / `check_max` print **nothing** on stdout, emit a diagnostic on stderr, `return 2` → block exits 2 → orchestrator routes to **Failure Path**. Never "continue". _(Guard hardening itself is `plan-v4-2.md`'s T3.8; the suite that demands this is T2.7 here.)_ |
| `status.jsonl` missing or unreadable at a derive block | `counter_count` returns 2 → call site `|| exit 2` → **Failure Path**. Never a default of 0. |
| **A routing site reads `0` legitimately** (routes on a *prior, not-yet-executed* step: `bkit-build.md:778-784` challenge-remediate on first CONCERNS/FAIL; `bkit-debug.md:440` SOAK budget in Step 3, where soak rows are written in Step 7) | `counter_count` prints `0`, exit **0** → the **continue** branch (Step 11 / Step 4). **NOT** Failure Path. `0` is the correct answer, not an error. Only `counter_current` (post-own-write) may refuse `0`; these sites must not use it. This is issue constraint 1's regression through a side door — asserted by a test, not by prose. |
| **Resume** of a killed run (latest run is still `IN_PROGRESS` for this workflow) | `bkit-build.md:334-337` / `bkit-debug.md:325-327` append `workflow-started` **only if** the latest folded run is not (this workflow AND `IN_PROGRESS`) → no new run → active-run scoping **continues** the count. The spent budget is inherited **on purpose**: acceptance bullet 5 ("no fresh budget") holds. |
| **Re-invoke** after the previous run reached DONE / FAILED | A new `workflow-started` is appended → new active run → **fresh budget**, never the previous run's spent one (the DE-25 starvation). The opposite of the resume row above, and correct for the opposite reason. |
| A `debug` run interleaves into the same `status.jsonl` between two `build` invocations | **Flagged, not proven, and load-bearing.** `bkit-build.md:335` tests `(.[-1] // {})` — the last run **overall**, not the last *build* run. A finished `debug` run at `.[-1]` makes a resuming build append a fresh `workflow-started` → new run → **budget silently resets** (Defect 3 by a side door, reachable through the exact build→debug→build path this feature governs). A lock exists at `:143`; whether it excludes the interleave is unestablished. Covered by a fixture (T2.10) that pins today's behaviour either way; the run-boundary semantics themselves are #209's substrate → deferral row. |
| `PRIOR_STRATEGY` reads the same log with all-runs scoping | Left **unchanged and deliberately opposite**. Both sites carry a comment naming the asymmetry, so neither reads as a bug from the other's side. |
| Two real retries of the same step | Survive the fold: the dedup key is `"S {workflow} {step} {parentSha} {at}"` — it includes **`at`**. Two retries differ if **either** `parentSha` **or** the wall-clock second differs. |
| A byte-identical row replayed (double-append of the same block) | Collapses to 1 by the same dedup key — the intended behaviour, and the reason the counter is coupled to the per-attempt commit cadence. |
| Per-attempt `--allow-empty` commit dropped from a step | Attempts collapse into one **only when `parentSha` AND the same-second `at` both collide** — the key includes `at`, so the coupling is narrower than "no commit → collapse". Stated precisely because T1.1 ships this invariant into a consumer-facing header comment where future agents will trust it. |
| **A counted step whose `parentSha` advances only transitively** (`debug-run-tests`: `bkit-debug.md:396` writes its row with **no commit** — Steps 4/5/6 commit at `:573`/`:646`/`:707`) | Real and **deliberate**: KN-26 removed debug's intermediate `chore(...)` commits so `fix(...)` stays branch HEAD (a `chore` HEAD makes the Vercel-ignore regex skip the preview → CI demotes to `partial` → integration/Playwright skipped → `conclusion=success` with no coverage). `NORMAL_ATTEMPT` therefore depends on Steps 4/5/6 for its `parentSha` advance. **Must NOT be "fixed" by re-adding a commit** — the per-site shape's commit-subject position does not apply at `:396-403`. Audited by corpus test (T2.6), not asserted by prose. |
| SOAK re-entered after NORMAL exhaustion, mid-run | A `workflow-meta` marker carrying `soakEntryAt` is appended at each SOAK entry; SOAK counts only `debug-failure-soak` rows with `.at > soakEntryAt` → fresh budget without any stored counter. |
| Two SOAK entries within the same wall-clock second | Fold dedups `workflow-meta` on `"W {type} {workflow} {at}"` → collapse to one marker. Same-second re-entry counts as one entry; acceptable and asserted. |
| Log with no `soakEntryAt` marker (fresh SOAK run, or a log written by an older bkit) | `.at > ""` is true for every row → counts all soak rows in the active run. Correct fresh-budget behaviour; additive, no migration. |
| Orchestrator mis-transcribes a derived value into a filename / comment | Artifact name and the row's `attempt` field are wrong; **routing is unaffected** — it re-derives. `attempt` is telemetry-only by contract. |

### Derived Test Matrix — this sub-plan's slice (**11 of the master's 19 rows**)

> Tiering per `docs/testing.md` § "Which tier does a behaviour need?". Every row below crosses a real boundary (the `status.jsonl` file, `jq`, `git`, process boundaries) and carries a non-mock test that asserts a ground-truth signal. bkit has no DB/deploy/UI, so no `@live`, `E2E`, `fresh-DB replay` or `Smoke` rows exist. `bats` suites run in CI's `bkit-tests-unit` lane via `npx --yes bats tests/*.bats` (`ci.yml:500-502`) — no CI wiring needed.
>
> Rows 7, 8, 10, 14, 15 (T5.3, T5.4, T3.4b, T3.6, T5.1) → [`plan-v4-2.md`](plan-v4-2.md). Rows 17, 18, 19 (T6.2, T7.1, T8.3) → [`plan-v4-3.md`](plan-v4-3.md). **11 + 5 + 3 = 19.**

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Fold blob is single-sourced: zero inline `FOLD='def lastIdx…'` assignments remain in any `.bkit/workflows/*.md`; the shipped script's blob is byte-identical to the retired one (length + md5 as **measured at T1.1** — the issue's `1079` / `d04a2499…` are not inherited, see T1.1); every source site is fail-closed | Unit (Vitest) | `.bkit/src/bkit-status-fold.test.ts` | T1.3 |
| Per-attempt row counting across **separate processes**: three sequential `bash -c` invocations sharing only `status.jsonl` derive 1, 2, 3; the post-write re-derive equals the start-derive for the same attempt | Integration (bats, boundary: `status.jsonl` + process boundary) | `tests/counter-derive.bats` | T2.2 |
| Active-run scoping: a completed run with 3 rows + a fresh `workflow-started` → derive returns 1, not 4 (and the same fixture proves `PRIOR_STRATEGY`'s all-runs read still returns the old value — the asymmetry is intentional) | Integration (bats) | `tests/counter-derive.bats` | T2.3 |
| subPlan isolation: `build-plan-verify` rows for `subPlan:1` do not count toward `subPlan:2` | Integration (bats) | `tests/counter-derive.bats` | T2.4 |
| Fold dedup, both directions: 2 rows differing only in `parentSha` → count 2 (retries survive); 2 byte-identical rows → count 1 (replays collapse) | Integration (bats) | `tests/counter-derive.bats` | T2.5 |
| **Corpus audit of the commit-cadence invariant:** for every counted step, assert its row-writing block either commits in-block **or** is on the documented transitive list (`debug-run-tests` → Steps 4/5/6, citing KN-26). A counted step that neither commits nor is listed reds. (Replaces "assert `git commit --allow-empty` advances HEAD" — that is a property of **git**, cannot fail, and cannot detect `debug-run-tests`.) | Unit (Vitest, corpus scan) | `.bkit/src/bkit-counter-prose-audit.test.ts` | T2.6 |
| **Count-0 at a prior-step routing site is legal:** `counter_count` over a log with zero rows for the target step prints `0` and exits **0**; challenge-first-pass routes to Step 11 and soak-first-pass routes to Step 4 — **not** Failure Path. Plus `MAX=0` (`MAX_CHALLENGE_REMEDIATE_ATTEMPT=1` → `THRESHOLD=0`) is accepted as a valid max by the hardened guard, not rejected as falsy | Integration (bats) | `tests/counter-failclosed.bats` | T2.9 |
| **Run-boundary interleave:** a `build` run left `IN_PROGRESS`, a complete `debug` run appended after it, then a resuming build → pins whether `bkit-build.md:335`'s `(.[-1] // {})` resets the budget. Asserts today's actual behaviour (characterisation), so the derivation's dependence on `:335` is visible rather than latent | Integration (bats) | `tests/counter-derive.bats` | T2.10 |
| Fail-closed: unset / empty / non-integer counter → `decide_next` and `check_max` print nothing on stdout, exit 2 (**refused**, not continue); over-cap → prints `failure-path`, exit 1. Both **fail against `dev`'s counter-bus** via the `BKIT_COUNTER_BUS` override | Integration (bats, boundary: exit codes across processes) | `tests/counter-failclosed.bats` | T2.7 |
| SOAK marker: rows before `soakEntryAt` are excluded → a second SOAK entry gets a full fresh budget; absent marker counts all rows | Integration (bats) | `tests/counter-derive.bats` | T2.8 |
| Every `MAX_*` defined in `bkit-counter-bus-config.sh` is referenced by >=1 fenced shell block across the workflow corpus (no dead constant — closes constraint 6's second half) | Unit (Vitest) | `.bkit/src/bkit-counter-prose-audit.test.ts` | T5.2 |

> [!IMPORTANT]
> **T5.2's dependency runs the other way.** Its "no dead constant" rule only goes green once T3.3 (in [`plan-v4-2.md`](plan-v4-2.md)) adds the `MAX_CHALLENGE_REMEDIATE_ATTEMPT` reference. T5.2 lands **here** because it is a pure test-authoring change with no coupling to the conversion, and its Done-when is written to be satisfiable here: it enumerates dynamically and passes against the corpus as it stands at that moment. If the constant is still dead when T5.2 lands, the rule is RED for that one constant — record it as an expected RED carried into `plan-v4-2.md`'s T3.3, exactly like T2.7's documented RED. **Do NOT hardcode a list to make it green** (that reproduces the `EXPECTED_CONSTANTS` 6-of-7 blind spot this task exists to delete), and do NOT add the reference here — that is T3.3's, and it belongs on the far side of the seam.

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked. **This checkbox gates all three sub-plans.**

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below. This is the only other section requiring your attention.
>
> **This section is the sign-off point for ALL THREE sub-plans.** It is reproduced here in full because Gate 1 lives here and Gate 1 gates the whole feature. `plan-v4-2.md` and `plan-v4-3.md` restate the items that govern their own tasks and carry **no second checkbox** — one sign-off, here.

**1. `decide_next` / `check_max` exit contract changes — BREAKING, and it is the point.**

`.bkit/scripts/bkit-counter-bus.sh` is a **shipped consumer file** (core template walk, `.bkit/version` canonicalHashes). Today an unset counter → `[ "" -gt 3 ]` → non-zero → indistinguishable from "condition false" → **continue**. After this change it → exit 2 → **Failure Path**. Any consumer calling `decide_next` with an unset variable flips from silently retrying forever to failing loudly. The only callers in the corpus are bkit's own workflows, which this plan converts in the same PR.

> [!WARNING]
> **This cannot ship alone (KN-26 shape).** Hardening the guard without the derivation converts "may silently overrun" into "**never retries**" — every retry route hard-fails. Task order is load-bearing: **T3.1–T3.7 (derivation) land before T3.8 (hardening)**, both in the same PR. Do not reorder, do not split the PR along that seam. **Both halves live in [`plan-v4-2.md`](plan-v4-2.md); this sub-plan deliberately ships neither.**

**2. Inert primitives deleted from a shipped script — BREAKING.** `counter_init` / `counter_inc` / `counter_get` / `counter_reset` and the `BKIT_COUNTER_*` convention are removed (WS-6, **last**, in [`plan-v4-3.md`](plan-v4-3.md)). They are called from exactly one live site today (`bkit-debug.md:432`, itself inert — the helper writes `BKIT_COUNTER_SOAK_ATTEMPT` while `:440` reads `$SOAK_ATTEMPT`; the two never meet). Deletion is only safe once every site is converted.

**3. New shipped file: `.bkit/scripts/bkit-status-fold.sh`** exporting `BKIT_STATUS_FOLD`. Ships via the core template walk from `.bkit/templates/.bkit/scripts/` like its siblings — no manifest entry (counter-bus has none either); `bkit install` stamps its `canonicalHashes` entry. The variable is **renamed** from the workflows' current local `FOLD` to `BKIT_STATUS_FOLD` (a sourced script must not claim a name as generic as `FOLD`). 15 use sites across 5 workflows change. **This is T1.1/T1.2 — this sub-plan.**

**4. New `status.jsonl` field: `soakEntryAt`** on a `workflow-meta` event. Additive; the existing fold needs no change (it merges `workflow-meta` fields into the run object, last-wins). A log without the marker counts all soak rows = fresh budget, so old logs need no migration.

> [!IMPORTANT]
> The marker's timestamp MUST be carried in the named `soakEntryAt` field, **not** inferred from the event's `at`: the fold does `del(.type,.workflow,.at)` on `workflow-meta`, so `at` is discarded before it reaches the run object.

**5. The issue's "no `*_ATTEMPT` in prose" is not literally achievable — two exemptions are proposed.**

Artifact filenames embed the attempt (`build-plan-verify-{SUB_PLAN}-{VERIFY_ATTEMPT}.md`) and subagent Context lines carry it (`attempt {VERIFY_ATTEMPT}`). Such placeholders **must** stay — the orchestrator substitutes them from the derive block's stdout.

**Measured, not inherited** (the draft carried "roughly 40" from the issue; it was never established): `grep -rcE '(^|[^$])\{[A-Z][A-Z0-9_]*_ATTEMPT\}' .bkit/workflows/*.md` → **62 lines** carry a non-`$` brace placeholder (build 26, debug 26, ship 10), some fenced. A separate **48** occurrences are `${X_ATTEMPT}` **shell expansions** — which are _not_ placeholders and must **not** be exempted.

The enforceable rule, which preserves the issue's actual intent (no counter value **originates** in context):

- **BANNED** outside a fenced block: any bare `X_ATTEMPT` token (this catches every assignment, increment, reset and comparison, since all of them name the counter bare).
- **ALLOWED:** `{X_ATTEMPT}` — a substitution token, never a computation; and `MAX_X_ATTEMPT` — a constant **name** pointing at the config, carrying no value.
- **NOT allowed, and the exemption must not leak into it:** `${X_ATTEMPT}` — a _value_ reference. The placeholder exemption must carry a negative lookbehind on `$`; otherwise the 48 shell expansions above silently widen it. T5.1 carries a negative-control case asserting `${TEST_ATTEMPT}` in prose is **caught**, not exempt.

A transcription error in a placeholder mis-names an artifact; it cannot corrupt routing, because routing re-derives. That is exactly why the decision makes `attempt` telemetry-only.

> [!CAUTION]
> **This item is the narrowing of issue #58's acceptance criterion and it is the thing most needing your sign-off.** The issue says "no `*_ATTEMPT` in prose", full stop. That is not achievable — 62 placeholder lines must survive. Confirming this section confirms that the shipped criterion is the **narrowed** one above (bare name banned; `{X_ATTEMPT}` and `MAX_*` exempt; `${X_ATTEMPT}` NOT exempt), not the issue's literal absolute. The rule is authored at T5.1 in [`plan-v4-2.md`](plan-v4-2.md) and enforced against the corpus at T4.1/T4.2 in [`plan-v4-3.md`](plan-v4-3.md); both inherit this checkbox and add none of their own.

**6. The shipped prose audit is vacuous, not merely narrow — its green is evidence of nothing.**

`ATTEMPT_COMPARISON_PATTERN = /\bATTEMPT\b.*(?:<=|>=|<|>)\s*(?:`?)MAX_|MAX_\w+\s*(?:<=|>=|<|>)\s*\d/`. `\bATTEMPT\b`cannot match inside`VERIFY_ATTEMPT`— the preceding`_`is a word character, so there is no word boundary. **The pattern cannot match any real counter name in the corpus.** The same holds for`MAX_LITERAL_DEFINITION_PATTERN` (`MAX_X = N`appears in no workflow). Both`describe` blocks pass because they match nothing at all. Worse than #179/#195's class: the test does not merely assert the shape that was built, it asserts nothing. The widened audit therefore **must** ship with a negative control (T5.1) proving the pattern fires on known-bad lines.

**7. The issue's 7-site table is incomplete — 3 more prose counter comparisons exist.**

`bkit-debug.md:417` (`NORMAL_ATTEMPT > 1`), `:418` (`NORMAL_ATTEMPT = 1`) and `:802` (`NORMAL_ATTEMPT > 1`) compare a counter against a literal in prose. They are not `MAX_` caps — they distinguish "passed first try" from "we fixed something" — but they are model-authored counter comparisons and the widened audit flags them. Folded into T3.5. Verdict/mode semantics stay in the orchestrator; only the **number** moves to shell.

**8. `DEBUG_ATTEMPT` is already derived, and its scoping must stay CROSS-run — do not "fix" it to active-run.**

`bkit-debug.md:175-181` already folds `last.debugAttempt` (a `workflow-meta` field) across **all** `debug` runs and adds 1. That is correct: `DEBUG_ATTEMPT` counts **invocations**, not steps within a run. Applying this feature's active-run rule to it would reset it every invocation and permanently disable SOAK escalation. Its actual defect is narrower: the value is derived in the Step 7 block and read in the **Step 8** block (`:194`), across a process boundary where shell state does not survive.

> [!WARNING]
> **The draft's "move the `:180-181` fold into `:187-194`" was self-contradictory and is corrected here.** `$DEBUG_ATTEMPT` is assigned **once** at `:180-181` and read cross-block in **~18 further places** — including `:332` (`--argjson da "$DEBUG_ATTEMPT"`, the `workflow-meta` marker **itself**), `:334` (`debug-input-'"${DEBUG_ATTEMPT}"'.md`), `:376`, and the whole `:473-573` `debug-context-*` fetch phase. _Moving_ the fold starves all of them → `:332`'s `--argjson` hard-fails → **every debug run dies at `debug-worktree-setup`**. Keeping it makes the draft's Done-when ("no cross-block `$DEBUG_ATTEMPT` read") literally false. The fold is therefore **copied, not moved**: `:180-181` stays as the orchestrator's substitution source, and every consuming fenced block **re-derives** with the identical cross-run expression — which is what the completeness rule (item 10a) enforces anyway.
>
> **Circularity worth naming:** `:332` writes the `debugAttempt` marker _from_ `$DEBUG_ATTEMPT`, and the cross-run fold reads that marker back. Until `:332` re-derives in-block, the plan's only cross-run counter is grounded in a model-supplied value — so T7.1's "reuse the existing `debugAttempt` fold" would inherit it. `:332` is an unconverted **consumer**, not merely "the marker precedent".

**9. `counterSource` flips `model-self-report` → `shell-bus` on 5 emitters.** Consumers of `.bkit/stats.jsonl` (#234 harvest / #183 analysis) will see the distribution change. No enum member is added — `"derived"` vs `"shell-bus"` is #234's question and stays untouched.

> [!IMPORTANT]
> The 5 emitters currently pass `--argjson counterValue 1` — a **hardcoded literal**, not a remembered number. Flipping only the `counterSource` flag would swap one dishonest label for another. T7.1 derives the value from the fold first; the flag follows the fact.
>
> **One definition, not two.** `counterValue` = the count of `workflow-started` events for that workflow, **all-runs** (a cross-run invocation index, like `DEBUG_ATTEMPT` — explicitly **not** this plan's headline active-run rule, which would reset it to 1 every run). `bkit-debug.md` uses the same expression as the other four; it does **not** reuse its `debugAttempt` fold (which is grounded in a model-supplied value — item 8). Whether the value matches each emitter's declared `counterName` (`DESIGN_ATTEMPT`/`PLAN_ATTEMPT`/…) is #234's schema question → deferral row.

**10. The site list is rule-derived. Three findings that hand-enumeration hid — read this item as the plan's central correction.**

**10a. The completeness rule (NEW, load-bearing).** The draft converted ~7 sites and cited issue #58 Comment 3's "20 `--argjson` call sites" without ever reconciling the two numbers. Measured against the tree — `grep -rnE '\-\-argjson [a-z]+ "\$[A-Z_]*ATTEMPT"' .bkit/workflows/` → **18 lines / 19 counter references** (`bkit-build.md` 8, `bkit-debug.md` 7 — `:756` carries both `a` and `sa` — `bkit-ship.md` 3; Comment 3's 20 additionally counts `CI_ATTEMPTS` ×3, correctly out of scope, and is itself approximate). Every one is a **fenced** block reading a bare `$X_ATTEMPT` with no in-block derive: exactly the model-remembered-and-typed number the issue exists to delete.

The draft's own governing artifact said so. `docs/decisions.jsonl` (ACTIVE, `58-workflow-attempt-counters-derived-from-status-jsonl-not-stored`) reads _"every fenced block RE-DERIVES it"_ and names the _"20 status-write sites"_. **And nothing in the draft could detect the shortfall:** the prose audit strips fenced blocks (`stripFencedBlocks`), so all 18 sites were invisible to it; T5.1/T5.2 are blind by construction; T7.1 inspects only the 5 telemetry rows; T3.8's hardening cannot help, because `--argjson` already hard-fails on _empty_ — the surviving defect is a **miscount**, which is valid JSON. The draft could therefore have reached Gate 4 fully green with 12 of 18 counter values still model-authored, and would have certified the migration complete on that basis. **That is the Defect-4 indictment of Breaking Changes item 6, reproduced one level up by the plan that exists to fix it.**

The fix is structural, not a longer list: **T5.3 ships a block-scoped rule** — no fenced block may read a bare `$X_ATTEMPT` unless it derives it — and **T3.0 generates the worklist by running that rule**. Hand-written line numbers are a convenience index into its output, never the authority. **Both live in [`plan-v4-2.md`](plan-v4-2.md).**

**10b. `counter_current`'s refuse-at-0 bricks two legitimate first-attempt routes — issue constraint 1's regression through a side door.** The two-position contract (`counter_next` at start / `counter_current` after own write) has no slot for a **third real position**: _route on the count of a different, not-yet-executed step_. Two mandated sites are exactly that, and both legitimately read `0`:

- `bkit-build.md:778-784` — Step 10 routes on the count of _prior_ `build-challenge-remediate` rows. First CONCERNS/FAIL → 0 rows → refuse → **Failure Path**, where today it routes to Step 11. The draft's own T3.3 Done-when demanded the opposite ("0 prior remediations → Step 11"), contradicting the helper spec it mandated.
- `bkit-debug.md:440` — `check_max SOAK_ATTEMPT` fires in **Step 3**, but `debug-failure-soak` rows are written in **Step 7**. Every `[soak]`-prompt invocation (`:185`) or `DEBUG_ATTEMPT >= MAX` escalation (`:194`) hits `:440` with 0 soak rows → **Failure Path** on its first failing test run.

Both sites use **`counter_count`** (0 legal, exit 0) with `THRESHOLD=$((MAX_X - 1))`. `counter_current`'s 0-refusal is reserved for post-own-write positions **only**. This would have shipped green: no matrix row exercised a valid `0`, and `red-vs-dev.txt` would have looked exactly as promised while both routes were bricked. **T2.9 — this sub-plan — now exercises it.**

**10c. `debug-run-tests` has no per-attempt commit — KN-26 removed it deliberately, and the per-site shape would re-add it.** `bkit-build.md:932` reads "Update status **and commit**" (`:939` commits `--allow-empty`); `bkit-debug.md:396` reads "**Update status:**" with **no commit** — the only step-done-writing step in debug without one (`:308`, `:560`, `:639`, `:693`, `:752`, `:867` all commit). That asymmetry **is KN-26's remediation**: a `chore(...)` branch HEAD makes the Vercel-ignore regex skip the preview → CI demotes to `partial` → integration/Playwright skipped → `conclusion=success` with no coverage. Severity: **critical**. The draft's per-site shape — which the runbook instructs to "repeat **verbatim**" — put the derived value in "the commit subject", so an implementer applying it to T3.5's `:400` write would re-enter the known-broken pattern. The shape is now **conditional** on the block already committing, and `:396-403` is named as must-not-gain-one. **T2.6 — this sub-plan — audits it.**

> [!WARNING]
> **Ordering consequence — WS-4 must not run early.** T4.1 deletes the prose (`Init counters:`, `Increment X + 1`) that instructs the model to substitute these values. Deleting it while the 18 blocks are unconverted is **worse than the status quo**: no derive _and_ no substitution → `--argjson a "$TEST_ATTEMPT"` on an empty expansion → `jq: invalid JSON text` → hard failure on `build-failure-diagnose`, `debug-failure-soak`, `ship-failure-remediate` and every `debug-context-*` fetch. WS-4 is gated on T5.3 going green, not merely on T3.1–T3.7 being ticked. **WS-4 is in [`plan-v4-3.md`](plan-v4-3.md), two sub-plans downstream of here.**

**11. Template deviation (design-missing fallback) — signed off here, not asserted.** `docs/plans/template.md:46` mandates that a plan with no parent design replace the Narrative with a blocking `⚠️ MISSING` string and let a human fill it. This plan instead offers an **agent-synthesised** Narrative for the human to confirm or replace, on the judgement that reacting to a concrete sentence beats authoring from a blank. The draft additionally labelled that text _"taken verbatim from issue #58 … NOT fabricated"_ — **false on both counts** (the sentence appears nowhere in #58) and sitting on the one surface where the human is the sole check. Relabelled honestly in § Acceptance Scenario. The § Success Criteria there _are_ near-verbatim from #58 § Acceptance; that half of the original label was fair. Confirming this section confirms the deviation.

**Proposed names** (all new): `.bkit/scripts/bkit-status-fold.sh`, `BKIT_STATUS_FOLD`, `counter_count`, `counter_next`, `counter_current`, `soakEntryAt`, `tests/counter-derive.bats`, `tests/counter-failclosed.bats`, `.bkit/src/bkit-status-fold.test.ts`, env override `BKIT_COUNTER_BUS`, env override `BKIT_STATUS_FOLD_SH`.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked. **This checkbox gates all three sub-plans.**

---

## Alternative Approaches & Recommendations _(inherited — full list in the parent index)_

- **Stored `counters` object in status (the original #58 sketch) — REJECTED.** It had to propose a policing invariant (_"`counters.verifyAttempt` must equal the count of `plan-verify` entries"_) precisely because a stored counter drifts from the rows. Counting the rows makes that invariant true by construction. Superseded by the ACTIVE decision record; written in May against the pre-#209 `status.json` array.
- **Persist `BKIT_COUNTER_*` across blocks — REJECTED, and now known impossible.** Each fenced block is a fresh process. Even with persistence the wiring is broken (helper writes `BKIT_COUNTER_{NAME}`, call sites read `${NAME}`).
- **Read back the `attempt` field instead of counting rows — REJECTED.** It reintroduces a dependence on every step faithfully writing `attempt`. Counting rows needs no such trust, which is what lets `attempt` become telemetry-only.
- **Copy `PRIOR_STRATEGY`'s fold-and-read shape — REJECTED.** Verified all-runs (`[.[] | .steps[] | …] | last`). Correct-ish for strategy (a resumed run arguably should not restart the STANDARD → PIVOT → FINAL ladder); wrong for attempts (a resumed run would inherit a spent budget — the DE-25 starvation). Two reads, one log, deliberately opposite scoping, commented at both sites.
- **Harden `decide_next` now, derive later — REJECTED.** Converts silent-overrun into never-retries. KN-26 shape. **The same inversion re-entered through two side doors and was caught only in review** — `counter_current`'s refuse-at-0 at `bkit-build.md:778-784` and `bkit-debug.md:440` (§ Breaking Changes item 10b). "Do not harden ahead of derivation" is not only a task-ordering rule; it is a per-site property, and the sites that route on a _prior_ step are where it hides.

## Out of Scope _(this sub-plan)_

- Converting any `--argjson` call site, hardening `check_max`/`decide_next`, deleting the inert primitives, touching prose, or flipping `counterSource`. **All of that is [`plan-v4-2.md`](plan-v4-2.md) and [`plan-v4-3.md`](plan-v4-3.md).** This sub-plan is additive by construction.
- `PRIOR_STRATEGY`'s all-runs scoping — flagged and commented, not changed. Which behaviour strategy actually wants was never established. → deferral row. _(Note `bkit-build.md:593` is additionally sub-plan-scoped — all-runs **and** `--argjson sp "$SUB_PLAN"`, a third scoping variant the "two reads, deliberately opposite" framing does not name. One clause in T1.2's comment, not a task.)_
- **`status.jsonl` run-boundary semantics** — `bkit-build.md:335` / `bkit-debug.md:325-327` key the "start a new run?" test on `(.[-1] // {})`, the last run **overall**, not the last run _of this workflow_. The derivation makes this load-bearing (it decides whether a resuming build inherits or resets its budget), so T2.10 **characterises** it; changing it belongs to #209's substrate. → deferral row.
- Adding a shellcheck CI gate over `.bkit/scripts/*.sh`. → deferral row.
- **Whether `debug-run-tests` should regain a per-attempt commit**, making `NORMAL_ATTEMPT`'s row-counting self-sufficient rather than transitively dependent on Steps 4/5/6. A real design question that **collides with KN-26** (§ Breaking Changes item 10c) and must not be answered by an implementer applying the per-site shape. → deferral row.

## Merge Method

**Merge method: always squash.** All three sub-plans land in **ONE PR** — non-negotiable per Breaking Changes item 1: WS-3's derivation and T3.8's fail-closed hardening are the two halves of the KN-26 pair and must not be separable at the merge boundary. **The sub-plan split is an execution-session boundary, NOT a PR boundary.** Do not open a PR at the end of this sub-plan. `bkit-ship.md` Step 5 is hardcoded to `gh pr merge --squash --delete-branch --body ""`.

## Supersession Inventory _(this sub-plan's rows)_

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| 15 × inline `FOLD='def lastIdx…'` assignments across `bkit-build.md` (`:146`, `:333`, `:592`, `:987`), `bkit-debug.md` (`:132`, `:179`, `:323`, `:624`), `bkit-ship.md` (`:135`, `:304`, `:665`), `bkit-plan.md` (`:104`, `:255`), `bkit-design.md` (`:103`, `:251`) | `.bkit/scripts/bkit-status-fold.sh` (`BKIT_STATUS_FOLD`) | DELETE | 15 hand-synced copies of a 1079-byte jq reducer across **5** workflows (the issue says 3 — plan/design carry it too). Sourcing once makes derivation and workflows agree by construction. |
| `EXPECTED_CONSTANTS` list (`bkit-counter-prose-audit.test.ts:144-151`) — hardcodes **6 of the 7** `MAX_*` in the config, omitting exactly `MAX_CHALLENGE_REMEDIATE_ATTEMPT` | T5.2's dynamic enumeration parsed from `bkit-counter-bus-config.sh` | DELETE | The one constant the hand-list omits is the one that is **dead** (constraint 6) — the hand-list's blind spot and the defect are the same shape. A rule-derived list cannot have that blind spot; that is the whole argument of § Breaking Changes item 10a in miniature. |

> Rows for the inert primitives, `tests/counter-bus.bats` §1-4/§8/§9, the two vacuous patterns, `EXPECTED_FUNCTIONS`, the 18 `--argjson` sites, the literal-`1` gate, the 5 telemetry emitters and the 6 `2>/dev/null` suppressions belong to [`plan-v4-2.md`](plan-v4-2.md) / [`plan-v4-3.md`](plan-v4-3.md).

## Security & Privacy

- [x] **None — no new routes, DB writes, secrets, or user input.** No API route, no DB table/column, no role-gated mutation, no user input, no PII, no redirect, no webhook, no new env var.
- **New executable surface, assessed:** `.bkit/scripts/bkit-status-fold.sh` is sourced (`.`) by workflow bash blocks from `$REPO_ROOT` — identical trust boundary and idiom to the existing `bkit-counter-bus.sh` / `bkit-counter-bus-config.sh` sourcing. It defines one variable and no functions. No new `ask`/`deny` entry in `.claude/settings.json` is needed (no new destructive command; § Authoring Checklist item on destructive shell commands is satisfied vacuously).
- **Untrusted input:** counters are derived from `status.jsonl`, written only by the workflows themselves — not from issue/PR/comment bodies. The derivation adds no attacker-controlled path (#342 contract unaffected).

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core (always verify)

- [ ] **Package Management:** No new packages. `bats` is already used via `npx --yes bats` (`ci.yml:502`); `jq` is a runtime prerequisite of the existing workflows. Verify `pnpm-lock.yaml` syncs cleanly.
- [ ] **Dependency Versions:** `pnpm --version` (hold pnpm at **10.34.1** — 10.34.3 breaks `bkit download`, #176/#268), `npx tsc --version`, `jq --version`, `npx bats --version`.
- [ ] **User Context:** Verify write access to `.bkit/templates/.bkit/scripts/`, `.bkit/workflows/`, `.bkit/src/`, `tests/`.
- [ ] **Pending Blockers:** Query the tracker for open `blocker`-labelled issues touching the counter-bus or `status.jsonl`.
- [ ] **Project Context:** Read `docs/decisions.jsonl` → `58-workflow-attempt-counters-derived-from-status-jsonl-not-stored` (ACTIVE — the contract this plan implements) and `de-24-143-soak-mode-reuses-max-debug-attempt-as-the-single-sh` / `de-25-143-observe-mode-removed-observation-logging-folds-into` (SOAK budget history). Read `docs/knowledge.jsonl` KN-26 (two complementary defences land together).
- [ ] **Testing & Quality:** Strategy aligns with `docs/testing.md` — boundary tests reach the real boundary and assert a ground-truth signal, never "did not throw"; `passWithNoTests` is banned; no mocks at the `status.jsonl` / `git` boundary.
- [ ] **Prerequisite Plans:** None. #209 (status.jsonl + fold) already shipped and is the substrate. **This is the first of three sub-plans** — no sibling must run before it.
- [ ] **Concurrency:** No second bkit workflow may run on this clone during execution (two workflows share `dev` + working tree + `.git/config`). Serialise.

### Conditional (verify only when applicable)

- [ ] **Architecture:** `.bkit/workflows/` is the **canonical source**; `.claude/commands/`, `.cursor/commands/`, `.opencode/` are regenerated by `bkit install` and must never be hand-edited (`.bkit/workflows.md:17`, `:1182`). `.bkit/templates/.bkit/scripts/*.sh` is the **source** for `.bkit/scripts/*.sh` (core template walk, `bkit-modules.ts:238-244`, `:349`) — edit the template, regenerate the installed copy.
- [ ] **Observability:** Every telemetry append stays best-effort (`|| echo "[bkit-telemetry] append failed: $FILE"`) and NEVER gates a workflow (`.bkit/workflows.md:1177`). All diagnostics keep the `[bkit-telemetry]` prefix (log-drain grep depends on it).

_Not applicable: Secrets & Env Vars, Schema State (no DB), UI/Design, Notifications._

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

No database. The "schema" here is the `status.jsonl` append-only event log (`.bkit/workflows.md` § Status; `docs/data-schema.md` is not applicable to bkit itself).

### Data Schema Usage (Inputs & Outputs)

- **Input (Read):** `status.jsonl` folded run array → `.workflow`, `.status`, `.steps[].step`, `.steps[].status`, `.steps[].subPlan`, `.steps[].at`, `.steps[].parentSha`; run-level `.debugAttempt` (existing `workflow-meta` field, cross-run, `DEBUG_ATTEMPT` only).
- **Output (Write):** `step-done` rows (unchanged shape). _(The `attempt`-field derivation and `.bkit/stats.jsonl` `counter` rows are written in the downstream sub-plans; this one only reads.)_

### Data Schema Changes

- **ADD:** `workflow-meta.soakEntryAt` (type: string, ISO-8601 UTC) — appended at every SOAK entry in `bkit-debug.md`. Folds onto the run object via the existing `workflow-meta` merge branch. Additive and optional; absent → all soak rows in the active run count (fresh budget). No migration. _(The workflow-side writers are T3.6 in [`plan-v4-2.md`](plan-v4-2.md); T2.8 here tests the read against a hand-seeded fixture.)_
- **UNCHANGED:** `step-done.attempt` stays on every row and keeps its type, but is **re-classified as telemetry-only** — routing counts rows, so a missing or wrong `attempt` cannot corrupt control flow. Documented in `.bkit/workflows.md` (T8.1, [`plan-v4-3.md`](plan-v4-3.md)).
- **UNCHANGED:** the fold reducer itself (byte-identical, just relocated). `soakEntryAt` needs no fold change.

## Architecture & Component Changes

### Shell — shipped scripts (source: `.bkit/templates/.bkit/scripts/`)

#### [NEW] `.bkit/templates/.bkit/scripts/bkit-status-fold.sh`

- Defines exactly one variable, `BKIT_STATUS_FOLD`, holding the jq prelude (`def lastIdx($w): …; def fold: …;`) **byte-identical** to the blob currently inlined 15×. Its length/md5 are **measured at T1.1**, not inherited (§ Runbook T1.1).
- Header comment states: single source of truth for the `status.jsonl` fold; the dedup key is `"S {workflow} {step} {parentSha} {at}"` — it includes **`at`**, so two rows collapse only when `parentSha` **and** the wall-clock second **both** collide. Row counting therefore depends on `parentSha` advancing per attempt **or** attempts landing in different seconds. Do **not** state the stronger "no commit → attempts collapse": it is false, and a shipped comment asserting a false invariant will be trusted by future agents. Name the transitive case: `debug-run-tests` never commits in-block (KN-26 — see § Breaking Changes item 10c); its `parentSha` advances via Steps 4/5/6.
- Carries `# shellcheck disable=SC2016` for the single-quoted blob (`$w` / `$e` / `$i` are jq variables, not shell). Note: no CI shellcheck gate covers `.bkit/scripts/*.sh` today — the directive is for local runs.
- Ships via the core template walk (`bkit-modules.ts:349` `processCoreTemplateDir` → `writeTier2`), like `bkit-counter-bus.sh`. No manifest entry. Installed copy `.bkit/scripts/bkit-status-fold.sh` + `.bkit/version` hash are produced by `bkit install` — **at T8.3 in [`plan-v4-3.md`](plan-v4-3.md), never here.**

#### [MODIFY] `.bkit/templates/.bkit/scripts/bkit-counter-bus.sh` — **additive half only**

- **Existence Check:** exists (`.bkit/templates/.bkit/scripts/bkit-counter-bus.sh`); installed copy `.bkit/scripts/bkit-counter-bus.sh` is byte-identical and hashed at `.bkit/version:65`.
- **ADD** `counter_count STATUS_FILE WORKFLOW STEP [--sub-plan N] [--since FIELD]` → prints the count of `step-done` rows for `STEP` with `status=="DONE"` in the **ACTIVE run** (`fold | map(select(.workflow==$w)) | last | .steps`). `--sub-plan` adds `and .subPlan==$sp`; `--since FIELD` adds `and .at > (run[FIELD] // "")`. Returns **2** (printing nothing on stdout) when the file is missing/unreadable, jq fails, or the result is not a non-negative integer. Requires `BKIT_STATUS_FOLD` to be sourced.
- **ADD** `counter_next …` = `counter_count` + 1 — the value at step **START** (what the artifact filename embeds and the row records).
- **ADD** `counter_current …` = `counter_count`, refusing (return 2) when the count is 0 — the value **after** the step appended its row (the row it just wrote _is_ this attempt). Its 0-refusal is a **post-own-write** assertion and is valid **only** at that position.
- **THREE positions, not two** (§ Breaking Changes item 10b — the draft's two-position contract had no slot for the third and bricked two live routes):
  1. **derive-at-START** → `counter_next`.
  2. **route-after-own-write** → `counter_current` (0 is impossible here; refusing it catches a dropped row).
  3. **route-on-a-prior/not-yet-executed-step** → `counter_count` directly. **`0` is a legal answer, exit 0**, routing to the continue branch. Live sites: `bkit-build.md:778-784`/`:804` (challenge-remediate, first pass) and `bkit-debug.md:440` (SOAK budget in Step 3; rows written in Step 7). Never `counter_current` here.
- **`counter_count` is public API**, not an internal of the other two. Its header documents position 3 and names both live sites, so the next reader does not reach for `counter_current` because it is "the routing helper".
- **ADD** a header comment naming the deliberate asymmetry with `PRIOR_STRATEGY`'s all-runs read.
- **NOT HERE — [`plan-v4-2.md`](plan-v4-2.md) T3.8:** hardening `check_max` / `decide_next`. **NOT HERE — [`plan-v4-3.md`](plan-v4-3.md) T6.1:** deleting `counter_init`/`counter_inc`/`counter_get`/`counter_reset`. **Both are explicitly out of this sub-plan's scope and doing either here breaks the KN-26 ordering.**

#### [MODIFY] `.bkit/templates/.bkit/scripts/bkit-counter-bus-config.sh`

- **Existence Check:** exists; all 7 `MAX_*` already defined. No value changes. Comment only: note `MAX_CHALLENGE_REMEDIATE_ATTEMPT` is consumed via the `THRESHOLD=$((MAX_X - 1))` idiom.

### Orchestrator workflows (canonical source: `.bkit/workflows/`) — **FOLD sites only in this sub-plan**

- `bkit-build.md` (`:146`, `:333`, `:592`, `:987`), `bkit-debug.md` (`:132`, `:179`, `:323`, `:624`), `bkit-ship.md` (`:135`, `:304`, `:665`), `bkit-plan.md` (`:104`, `:255`), `bkit-design.md` (`:103`, `:251`) — 15 sites, T1.2. Plus the `PRIOR_STRATEGY` all-runs comments at `bkit-build.md:592`, `:987`; `bkit-debug.md:624`; `bkit-ship.md:665`.
- **No `--argjson` counter site is touched here.** Those 18 sites are [`plan-v4-2.md`](plan-v4-2.md)'s.

### Tests

#### [MODIFY] `.bkit/src/bkit-counter-prose-audit.test.ts` — **T2.0's repoint + T2.6 + T5.2 only**

- **Existence Check:** exists (187 lines).
- **This sub-plan:** repoint both script reads template-relative (T2.0); add the commit-cadence corpus audit (T2.6); replace `EXPECTED_CONSTANTS` with T5.2's dynamic enumeration.
- **NOT this sub-plan:** the widened prose pattern + negative control (T5.1), the completeness rule (T5.3), the mapping rule (T5.4) → [`plan-v4-2.md`](plan-v4-2.md); `EXPECTED_FUNCTIONS` + absent-primitives rule (T6.2), counter-row provenance rule (T7.1) → [`plan-v4-3.md`](plan-v4-3.md). **The file is edited by all three sub-plans; each owns disjoint rules.**

#### [NEW] `.bkit/src/bkit-status-fold.test.ts` · [NEW] `tests/counter-derive.bats` · [NEW] `tests/counter-failclosed.bats`

- Colocation per `docs/testing.md` § Stack (test files under `.bkit/src/`); bats suites live in `tests/` beside `counter-bus.bats` / `telemetry-failopen.bats` and auto-run via `npx --yes bats tests/*.bats`.

> [!WARNING]
> **Test paths resolve to the TEMPLATE, not the installed copy — an inverted dependency edge the draft shipped. Fixing it is T2.0, and it is the FIRST task in WS-2 for a reason.** `tests/counter-bus.bats:15` reads `COUNTER_BUS="$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"` — the **installed** file. But every code task edits `.bkit/templates/.bkit/scripts/…`, and `pnpm bkit install` runs **ONCE at T8.3** (in [`plan-v4-3.md`](plan-v4-3.md)). So without T2.0: `.bkit/scripts/bkit-status-fold.sh` does not exist until T8.3 (T2.2–T2.6, T2.8 cannot run); the installed bus has no `counter_count`/`counter_next`/`counter_current` (T2.2's Done-when unreachable); T3.8's "goes green" unreachable; T6.2's `.bkit/` grep cannot pass; and **Gate 2a is unpassable** — its RED would be `command not found`, not a fail-open.
>
> **The defect is NOT confined to bats — `.bkit/src/bkit-counter-prose-audit.test.ts` has it at two reads**, and the first pass of this fix repointed only the bats suites while leaving the Vitest suite pointing at the mirror. `configPath` (`:143`) and `busPath` (`:166`) both resolve `.bkit/scripts/`. **T6.2 is the unreachable one:** it rewrites `EXPECTED_FUNCTIONS` to the new five and adds a rule asserting the four primitives are **absent** — both asserted against `busPath`. T2.1 adds the new helpers to the template only and T6.1 deletes the primitives from the template only, so until T8.3 the mirror still lacks the five and still carries the four: **both halves of T6.2's Done-when are red at T6.2**, and T6.2 < T8.3. That is the same unpassable-gate shape this WARNING exists to kill, and the pressure it creates is the **prohibited per-edit `bkit install`**.
>
> **Fix — template-relative defaults in all three bats suites AND the Vitest suite:**
>
> ```sh
> COUNTER_BUS="${BKIT_COUNTER_BUS:-$REPO_ROOT/.bkit/templates/.bkit/scripts/bkit-counter-bus.sh}"
> COUNTER_CONFIG="${BKIT_COUNTER_CONFIG:-$REPO_ROOT/.bkit/templates/.bkit/scripts/bkit-counter-bus-config.sh}"
> STATUS_FOLD_SH="${BKIT_STATUS_FOLD_SH:-$REPO_ROOT/.bkit/templates/.bkit/scripts/bkit-status-fold.sh}"
> ```
>
> ```ts
> // .bkit/src/bkit-counter-prose-audit.test.ts — same override shape, same default root.
> const TEMPLATE_SCRIPTS = path.join(REPO_ROOT, ".bkit/templates/.bkit/scripts");
> const configPath =
>   process.env.BKIT_COUNTER_CONFIG ?? path.join(TEMPLATE_SCRIPTS, "bkit-counter-bus-config.sh");
> const busPath =
>   process.env.BKIT_COUNTER_BUS ?? path.join(TEMPLATE_SCRIPTS, "bkit-counter-bus.sh");
> ```
>
> The overrides keep the RED-vs-`dev` proof working (point `BKIT_COUNTER_BUS` at a `git show dev:` extract). The **installed** path is exercised exactly where it belongs — T8.3's byte-identical `diff` and Manual Step 6's fresh-consumer install, both in [`plan-v4-3.md`](plan-v4-3.md). **Do NOT resolve this with a per-edit `pnpm bkit install`** — that contradicts the runbook's batching rule and is a standing prohibition.
>
> **Scope of the defect, stated precisely so it is not over-applied:** only reads of `.bkit/scripts/*.sh` are affected. T5.3/T5.1/T2.6/T7.1 scan `.bkit/workflows/*.md` — the canonical **source**, not a mirror — and are correct as written. T6.2's _grep_ half (over `.bkit/templates/`, `.bkit/workflows/`, `.bkit/src/`, `tests/`) is likewise already source-scoped; it is only the `busPath`/`configPath` **reads** that move.

#### [MODIFY] `tests/counter-bus.bats` — **repoint only in this sub-plan**

- Repoint `COUNTER_BUS` / `COUNTER_CONFIG` (`:15-16`) to the template-relative defaults above — same override shape as the new suites, so the whole bats corpus resolves consistently and no suite silently tests a stale installed copy (T2.0).
- **NOT this sub-plan:** pruning §1-4, §8's primitive cases and §9 → T6.2 in [`plan-v4-3.md`](plan-v4-3.md), which must run after the primitives are deleted.

### Database Migrations

None — bkit has no database.

### Cron Jobs & Scheduled Tasks

None.

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, **DO NOT fail silently**. Append a `kind:"deferral"` (or `kind:"failure"`) row per `.bkit/jsonl.md` with context before stopping.
> **Step Isolation:** Do NOT jump ahead. Complete each task fully (including its verification and checking its box) before starting the exact next task.
> **Edit the SOURCE, never the mirror:** `.bkit/templates/.bkit/scripts/*.sh` → `.bkit/scripts/*.sh`; `.bkit/workflows/*.md` → `.claude/` / `.cursor/` / `.opencode/`. Run `pnpm bkit install` ONCE at T8.3 — **which is in [`plan-v4-3.md`](plan-v4-3.md), not here. Do NOT run `bkit install` in this sub-plan for any reason**, including to make a gate pass; T2.0 exists precisely so you never need to.
> **ASCII operators only** in `.bkit/workflows/*.md` and `.bkit/prompts/*.md` — `!=` `>=` `<=`, never `≠ ≥ ≤`.
> **Do NOT open a PR at the end of this sub-plan.** One PR spans all three (§ Merge Method).

### WS-1 — Single-source the fold (prerequisite; pure refactor, green standalone)

- [ ] **T1.1:** Create `.bkit/templates/.bkit/scripts/bkit-status-fold.sh` defining `BKIT_STATUS_FOLD` with the blob copied **byte-for-byte** from `.bkit/workflows/bkit-build.md:146` (do not retype it), plus the header comment (§ Architecture — the precise `at`-inclusive dedup key, the `debug-run-tests` transitive case, the `PRIOR_STRATEGY` asymmetry) and `# shellcheck disable=SC2016`. **MEASURE the invariant, do not inherit it:** the `1079` / `d04a2499ad1900d9757b00774dd87866` figures came from issue #58 and it was never established whether they measured the extracted **value** or the whole `FOLD='…'` assignment line (the `FOLD='` wrapper + closing `'` is 7 bytes). Compute both from the tree first, record the value-figures in this task, and only then let T1.3 assert them. A plan that lectures about inherited-and-unverified constants must not stall on one.
  - **Done when:** `.bkit/templates/.bkit/scripts/bkit-status-fold.sh` exists; the **measured** figures are recorded inline in this task (`{MEASURED_BYTES}` / `{MEASURED_MD5}`, from `sh -c '. ./.bkit/templates/.bkit/scripts/bkit-status-fold.sh; printf "%s" "$BKIT_STATUS_FOLD"' | wc -c` and `| md5`); the extracted value is byte-identical to the blob inside `bkit-build.md:146`'s quotes (`diff <(…extract…) <(…script…)` empty); if the measured length is not 1079, the issue's figure is noted as having measured the assignment line, not the value.
- [ ] **T1.2:** Replace all 15 inline `FOLD='…'` assignments with a **fail-closed** source line and rename every use `"$FOLD"` → `"$BKIT_STATUS_FOLD"`, across `bkit-build.md` (`:146`, `:333`, `:592`, `:987`), `bkit-debug.md` (`:132`, `:179`, `:323`, `:624`), `bkit-ship.md` (`:135`, `:304`, `:665`), `bkit-plan.md` (`:104`, `:255`), `bkit-design.md` (`:103`, `:251`). Use the block's existing root variable where one exists (`$WT` at `bkit-build.md:333`, `bkit-debug.md:323`). The source line must name its own fix, because a consumer mid-upgrade whose workflows land before `bkit install` fails at **every fold block**, not just counters — and a bare `. missing` returns non-zero but leaves `BKIT_STATUS_FOLD` unset, so the block would carry on with an empty jq program (fail-open, the exact shape this plan exists to delete):

  ```bash
  . "$REPO_ROOT/.bkit/scripts/bkit-status-fold.sh" || { echo "[bkit-telemetry] missing bkit-status-fold.sh — run 'bkit install'" >&2; exit 2; }
  ```

  Add the all-runs-scoping comment at each `PRIOR_STRATEGY` site (`bkit-build.md:592`, `:987`; `bkit-debug.md:624`; `bkit-ship.md:665`) — noting at `:592` that the build sub-plan read is all-runs **and** sub-plan-scoped (`--argjson sp "$SUB_PLAN"`), a third scoping variant the "two reads, deliberately opposite" framing does not otherwise name.
  - **Done when:** `grep -rc "FOLD='def lastIdx" .bkit/workflows/` reports 0 for all 5 files; `grep -rl 'BKIT_STATUS_FOLD' .bkit/workflows/ | wc -l` = 5; every source site carries the `|| { … exit 2; }` guard with the `[bkit-telemetry]` prefix (`grep -c 'missing bkit-status-fold.sh' .bkit/workflows/*.md` totals 15); every `PRIOR_STRATEGY` block carries a comment containing `all runs`.

- [ ] **T1.3:** Add `.bkit/src/bkit-status-fold.test.ts` — asserts (a) zero `FOLD='def lastIdx` occurrences across `.bkit/workflows/*.md`, (b) the script's extracted blob length and md5 equal the figures **T1.1 measured** (not the inherited ones), (c) every workflow that uses `$BKIT_STATUS_FOLD` also sources `bkit-status-fold.sh`, (d) every source site is fail-closed (carries the `|| { … exit 2; }` guard).
  - **Done when:** `pnpm vitest run .bkit/src/bkit-status-fold.test.ts` passes with >0 tests; deleting the source line from any one workflow reds it (verify by temporary edit, then restore); dropping the `|| exit 2` guard from any one site reds it.

### WS-2 — Derivation helpers + cross-process tests (additive; primitives untouched)

> Every suite here obeys one rule: **no counter value may cross from one `bash -c` to the next except through `status.jsonl` on disk.** Multiple sequential `bash -c` invocations are the point (they are the separate processes); a single `bash -c` carrying state is the banned shape `tests/counter-bus.bats` ships today.
>
> **All three bats suites resolve the scripts TEMPLATE-relative** (`BKIT_COUNTER_BUS` / `BKIT_COUNTER_CONFIG` / `BKIT_STATUS_FOLD_SH`, defaulting under `.bkit/templates/.bkit/scripts/`) — see § Architecture › Tests. Every code task edits the template and `bkit install` runs **once** at T8.3, so an installed-copy default makes T2.2–T2.8, T3.8, T6.2 and Gate 2a unrunnable. **Do NOT "fix" that by inserting a per-edit `bkit install`.** The installed copy is exercised at T8.3 and Manual Step 6 only.

- [ ] **T2.0:** Repoint `tests/counter-bus.bats:15-16` to the template-relative overrides and adopt the same three-variable shape in the two new suites as they are created. **Repoint `.bkit/src/bkit-counter-prose-audit.test.ts`'s `configPath` (`:143`) and `busPath` (`:166`) to the same template-relative defaults** (`BKIT_COUNTER_CONFIG` / `BKIT_COUNTER_BUS` overrides — see § Architecture › Tests). The Vitest suite carries the identical installed-mirror defect and it lands **here**, not at T6.2, because T6.2's Done-when is the one that becomes unreachable without it (the mirror still lacks the new five helpers and still carries the four primitives until T8.3). Doing both here means the whole test corpus — bats and Vitest — resolves the scripts from one root before any suite consumes them.
  - **Done when:** `grep -rn 'BKIT_COUNTER_BUS\|BKIT_STATUS_FOLD_SH' tests/*.bats` shows every suite resolving via `${VAR:-$REPO_ROOT/.bkit/templates/.bkit/scripts/…}`; `grep -rc '\$REPO_ROOT/\.bkit/scripts/' tests/*.bats` = 0; **`grep -c '"\.bkit/scripts/' .bkit/src/bkit-counter-prose-audit.test.ts` = 0** (both script reads now resolve under `.bkit/templates/.bkit/scripts/`, honouring the `BKIT_COUNTER_BUS` / `BKIT_COUNTER_CONFIG` overrides); `npx bats tests/counter-bus.bats` **and** `pnpm vitest run .bkit/src/bkit-counter-prose-audit.test.ts` still pass unchanged against the template (it is byte-identical to the installed copy today, so this repoint is behaviour-neutral **now** and correct **later** — verify with `diff .bkit/templates/.bkit/scripts/bkit-counter-bus.sh .bkit/scripts/bkit-counter-bus.sh` empty before the repoint).
- [ ] **T2.1:** Add `counter_count` / `counter_next` / `counter_current` to `.bkit/templates/.bkit/scripts/bkit-counter-bus.sh` per § Architecture — **including the three-position contract in the header** (`counter_count` is public; `0` is legal at a prior-step routing site; `counter_current`'s 0-refusal is post-own-write only, § Breaking Changes item 10b). POSIX `sh` only (no bashisms, no process substitution). Do NOT touch `counter_init`/`inc`/`get`/`reset` yet; do NOT harden `decide_next` yet.
  - **Done when:** `sh -c '. ./.bkit/templates/.bkit/scripts/bkit-status-fold.sh; . ./.bkit/templates/.bkit/scripts/bkit-counter-bus.sh; type counter_count counter_next counter_current'` exits 0 under `sh`, `bash`, `dash` and `zsh`; `counter_count /nonexistent build x; echo $?` prints `2` and no stdout; `counter_count` over a log with zero matching rows prints `0` and exits **0** (a valid answer, not an error); `counter_current` over the same log returns 2; the header documents all three positions and names `bkit-build.md:778-784` + `bkit-debug.md:440` as position-3 sites.
- [ ] **T2.2:** `tests/counter-derive.bats` — per-attempt row counting across separate processes. Fixture: a tmp dir with `status.jsonl` seeded with one `workflow-started` row. Three sequential `bash -c` invocations, each derive→write→derive, distinct `parentSha` per attempt.
  - **Done when:** the suite asserts `counter_next` prints 1, 2, 3 on successive iterations **and** that the post-write `counter_current` equals the pre-write `counter_next` for the same iteration; `npx bats tests/counter-derive.bats` passes; no test carries a counter value between `bash -c` calls.
- [ ] **T2.3:** Same file — active-run scoping. Fixture: run A (`workflow-started` + 3 `build-run-tests` DONE rows + `workflow-done`) then run B (`workflow-started`, no step rows).
  - **Done when:** `counter_next` returns `1` (not `4`) for run B; a sibling assertion runs the **shipped** `PRIOR_STRATEGY` jq expression over the same fixture and shows it returns the run-A value — the asymmetry is asserted, not merely commented.
- [ ] **T2.4:** Same file — subPlan isolation. Fixture: 2 `build-plan-verify` rows with `subPlan:1`, 0 with `subPlan:2`.
  - **Done when:** `counter_next … --sub-plan 2` prints `1` while `--sub-plan 1` prints `3`.
- [ ] **T2.5:** Same file — fold dedup, both directions. Fixture A: two rows identical except `parentSha`. Fixture B: two byte-identical rows.
  - **Done when:** fixture A counts `2` (distinct retries survive) and fixture B counts `1` (byte-identical replays collapse); both assertions are in the suite and both pass.
- [ ] **T2.6:** **Corpus audit of the commit-cadence invariant** — in `.bkit/src/bkit-counter-prose-audit.test.ts`, **not** a temp-repo bats test. For every counted step (the steps the derive sites count), assert its row-writing block either (a) commits in-block, or (b) appears on an explicit, commented transitive-exemption list — today exactly `debug-run-tests`, whose `parentSha` advances via Steps 4/5/6 (`bkit-debug.md:573`/`:646`/`:707`) because **KN-26 deliberately removed its commit**. A counted step that neither commits nor is listed reds. **The draft's version of this task was vacuous:** "assert `git commit --allow-empty` advances HEAD in a real temp repo" tests a property of **git** — it cannot fail, and it cannot detect the one real gap in the corpus. That is the Defect-4 shape (evidence asserting the mechanism that was built rather than the behaviour required) which § Breaking Changes item 6 indicts.
  - **Done when:** the test enumerates counted steps from the derive call sites (not a hardcoded list) and passes; the transitive-exemption list contains `debug-run-tests` with a comment citing KN-26; **removing `debug-run-tests` from the exemption list reds the suite** (proving the audit actually inspects commit presence, verify by temporary edit then restore); adding a fake counted step with no commit and no exemption reds it.

  > [!NOTE]
  > **Sequencing note for this sub-plan:** T2.6 enumerates counted steps "from the derive call sites". No derive call site exists in the corpus until [`plan-v4-2.md`](plan-v4-2.md)'s WS-3. Land the rule and its exemption list here with the enumeration written against the derive-call grammar T2.1 just defined; against today's corpus it enumerates the empty set and passes vacuously. **Its two red-proofs (removing `debug-run-tests` from the exemption list; adding a fake counted step) are the evidence that it is not vacuous** — run both here, and re-run the whole task's Done-when at Gate 2b in `plan-v4-2.md` once real derive sites exist. Do not weaken the enumeration to a hardcoded list to give it something to chew on now.

- [ ] **T2.7:** `tests/counter-failclosed.bats`, resolving the bus template-relative per T2.0. Cases: unset / empty / `abc` / `1.5` value → exit 2, **empty stdout**; unset/empty MAX → exit 2; over-cap → `failure-path` + exit 1; at-cap → continue + exit 0. Then capture the RED-vs-`dev` proof: `git show dev:.bkit/scripts/bkit-counter-bus.sh > "$TMP/dev-bus.sh"` → `BKIT_COUNTER_BUS="$TMP/dev-bus.sh" npx bats tests/counter-failclosed.bats`.
  - **Done when:** the RED run's output is saved to `docs/plans/202607/logs/58-workflow-counters/red-vs-dev.txt`; the failure is recorded **by reason, not merely by non-zero exit** — `dev` prints `step-14` on **stdout** and exits **0** (the fail-open) where the suite demands empty stdout + exit 2. A RED that reads `command not found` is **not** the proof and means the template-relative wiring (T2.0) is wrong. The suite also fails against the current tree for the same _reason_ (T3.8 has not hardened it yet). Both facts recorded.
- [ ] **T2.9:** `tests/counter-failclosed.bats` — **count-0 is legal, and `MAX=0` is a valid max** (§ Breaking Changes item 10b). Cases: `counter_count` over a log with zero rows for the target step → prints `0`, exit **0**; `decide_next X 0 0 step-11 failure-path` (the `THRESHOLD=$((MAX_CHALLENGE_REMEDIATE_ATTEMPT - 1))` = 0 case, the corpus's only live zero-threshold) → **continue** branch, exit 0; `decide_next X 1 0 …` → `failure-path`, exit 1. Assert the hardened guard's `case … in ''|*[!0-9]*)` accepts `0` as a non-negative integer rather than rejecting it as falsy — the obvious place for a "reject empty-or-zero" reflex to creep in.
  - **Done when:** all three cases pass; a deliberate `[ -z "$MAX" ] || [ "$MAX" -eq 0 ]`-style rejection introduced into the guard reds the suite (verify by temporary edit, then restore); the suite comments name the two live position-3 sites (`bkit-build.md:778-784`, `bkit-debug.md:440`).

  > [!NOTE]
  > **Sequencing note:** T2.9's `decide_next` cases assert the **hardened** guard's behaviour, and hardening is T3.8 in [`plan-v4-2.md`](plan-v4-2.md). Author the cases here; the `counter_count` count-0 case passes now (T2.1 built it that way), the `decide_next` cases are RED for the same documented reason as T2.7 and go green at T3.8. The falsy-rejection red-proof is runnable here against T2.1's helpers. **Do not harden the guard here to make them pass** — that is the KN-26 inversion this whole split exists to prevent.

- [ ] **T2.10:** `tests/counter-derive.bats` — **run-boundary interleave characterisation** (§ Edge Cases). Fixture: `build` `workflow-started` + 2 `build-run-tests` rows, no `workflow-done`; then a complete `debug` run (`workflow-started` … `workflow-done`); then resume `build`. Run `bkit-build.md:335`'s **shipped** `(.[-1] // {})` condition over the fixture and assert what it actually does — whether it appends a fresh `workflow-started` (budget resets to 1) or not (derives 3).
  - **Done when:** the assertion pins **today's real behaviour** (characterisation, not aspiration) and its comment states the consequence either way; if the interleave **does** reset the budget, that fact is recorded in the deferral row `58-status-jsonl-run-boundary-keys-on-last-run-overall` rather than fixed here (run-boundary semantics are #209's substrate, out of scope). The derivation's dependence on `:335` is visible in a test rather than latent.
- [ ] **T2.8:** `tests/counter-derive.bats` — SOAK marker. Fixture: 2 `debug-failure-soak` rows, a `workflow-meta` row carrying `soakEntryAt`, then 1 more soak row.
  - **Done when:** `counter_next … --since soakEntryAt` prints `2` (only the post-marker row counts) while the same call without `--since` prints `4`; a marker-absent fixture prints the all-rows count; a same-second double-marker fixture folds to one marker.

### WS-5 (partial) — the no-dead-constant rule

> T5.1 / T5.3 / T5.4 are **NOT here** — they travel with WS-3 in [`plan-v4-2.md`](plan-v4-2.md), because each must be RED before the conversion and green after, and separating a rule from the conversion it polices leaves both halves unverifiable. **T5.2 alone lands here:** it polices the config, not the conversion, and has no RED-first coupling to WS-3.

- [ ] **T5.2:** Add the no-dead-constant rule: parse every `MAX_\w+=` from `bkit-counter-bus-config.sh` and assert each name appears >=1 time **inside a fenced block** across `.bkit/workflows/*.md`. Replaces the hardcoded `EXPECTED_CONSTANTS` list (`:144-151`), which lists **6 of 7** — omitting exactly `MAX_CHALLENGE_REMEDIATE_ATTEMPT`, the dead one. The hand-list's blind spot and the defect are the same shape.
  - **Done when:** the test enumerates all 7 constants dynamically (no hardcoded list) and passes; deleting the `MAX_CHALLENGE_REMEDIATE_ATTEMPT` reference added in T3.3 reds it; no hardcoded constant list remains in the file.

  > [!IMPORTANT]
  > **This Done-when's second and third clauses are cross-sub-plan.** "deleting the `MAX_CHALLENGE_REMEDIATE_ATTEMPT` reference added in T3.3" cannot be exercised until T3.3 exists ([`plan-v4-2.md`](plan-v4-2.md)); until then the constant is genuinely dead and the rule is legitimately RED for exactly that one constant. **Record that RED here as expected** (alongside T2.7's), tick T5.2 on the dynamic-enumeration + no-hardcoded-list clauses, and **re-run the full Done-when — including the delete-the-reference red-proof — at Gate 2b in `plan-v4-2.md`**. `plan-v4-2.md`'s T3.3 Done-when independently requires `grep -rn 'MAX_CHALLENGE_REMEDIATE_ATTEMPT' .bkit/workflows/` to return >=1 fenced hit, so the reference cannot be silently skipped. **Do NOT hardcode, exempt, or skip the constant to force green here.**

### 🔒 Gate 2a: Derivation Available, Guard Not Yet Hardened

> The draft's Gate 2a was **unpassable** (it demanded suites run against an installed copy that T8.3 had not yet produced, so its RED would have been `command not found`) and **misplaced** (sitting between WS-2 and WS-3, it can only block entry to T3.1 — never T3.8). An unpassable gate gets waived, and its trailing seam sentence goes with it. Criteria are now achievable here, and the seam is enforced by **Gate 2b, positioned immediately before T3.8** — in [`plan-v4-2.md`](plan-v4-2.md).
>
> **This gate is this sub-plan's exit criterion.** [`plan-v4-2.md`](plan-v4-2.md) must not start until every box below is `[x]`.

- [ ] **Gate 2a - Verified:** T1.1–T2.10 all `[x]`. All suites resolve template-relative (T2.0). `npx bats tests/*.bats` runs with >0 tests. `tests/counter-failclosed.bats` is RED **for the documented reason** (stdout `step-14`, exit 0 — the fail-open; **not** `command not found`), and `red-vs-dev.txt` proves it is RED against `dev` for that same reason. Every other suite is green.
- [ ] **No push in the RED window:** `ci.yml:500-502` runs `npx --yes bats tests/*.bats` on **every push**, and `pnpm test` is `vitest run` — so bats does not red the local gate but **CI will**, between here and T3.8. Either no push happens in this window, or `tests/counter-failclosed.bats` carries a skip-tag that T3.8 removes. The merge is squash and the KN-26 pair must not split, so a red CI here is noise, not signal. State which option was taken.

> [!CAUTION]
> **The RED window now spans a sub-plan boundary.** Under the master plan this window ran from Gate 2a to T3.8 within one session; it now runs from the end of THIS sub-plan, across the whole of [`plan-v4-2.md`](plan-v4-2.md), to that sub-plan's T3.8. **Whichever option you take above, record it in the handoff and carry it into `plan-v4-2.md`** — a skip-tag chosen here is removed by T3.8 there, and "no push in the window" is a constraint the next session must honour, not just this one. `plan-v4-2.md`'s Gate 2a-inherited box restates it.
>
> **The split does NOT license a PR here.** The KN-26 pair (derivation + hardening) is `plan-v4-2.md`'s and lands whole. One PR, one squash, all three sub-plans (§ Merge Method).

### Handoff to [`plan-v4-2.md`](plan-v4-2.md)

Record before ending this session:

- [ ] **T1.1's measured figures** (`{MEASURED_BYTES}` / `{MEASURED_MD5}`) — noted inline in T1.1 above.
- [ ] **Which RED-window option was taken** (no-push vs skip-tag) — `plan-v4-2.md`'s T3.8 removes the skip-tag if one was added.
- [ ] **T2.7's / T2.9's / T5.2's documented REDs** — the exact reason each is red (fail-open / unhardened guard / dead constant), so the next session recognises the expected RED and does not "fix" it by hardening early or hardcoding a list.
- [ ] **`red-vs-dev.txt` exists** at `docs/plans/202607/logs/58-workflow-counters/red-vs-dev.txt` — it is evidence, not a test. `plan-v4-2.md`'s T3.9 asserts it still shows the same failure and must **not** regenerate it.
- [ ] **T2.6's re-run obligation** — its enumeration is vacuous until WS-3 creates derive sites; `plan-v4-2.md`'s Gate 2b re-runs its Done-when.

## Verification Plan _(this sub-plan)_

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck` + `pnpm format:check` + `pnpm lint:slop` + `pnpm lint:prose`.
- [ ] **Slop delta:** `pnpm slop:delta` — net-new findings only. The new shell helpers add no try/catch; if `defensive.error-obscuring` rises, use non-throwing forms rather than suppressing the rule.
- [ ] **No suite reads a stale installed copy:** `grep -rc '\$REPO_ROOT/\.bkit/scripts/' tests/*.bats` = 0 — all three bats suites resolve template-relative (T2.0). The installed copy is exercised only at T8.3 and Manual Step 6. **No `pnpm bkit install` was added to any task except T8.3.**
- [ ] **Build Configuration:** No new mock files or test configs; no `tsconfig.json` `exclude` change needed (bats files are not TS).
- [ ] **Shell suites (`tests/*.bats`):** `npx --yes bats tests/*.bats` — auto-gated in CI's `bkit-tests-unit` lane (`ci.yml:500-502`), no CI wiring needed. `tests/counter-failclosed.bats` RED for the documented reason is expected here.
- [ ] **Vitest (`.bkit/src/bkit-status-fold.test.ts`, `.bkit/src/bkit-counter-prose-audit.test.ts`):** `pnpm test`. Unit lane is branch-coverage-gated at 65 — confirm no regression.
- [ ] **Portability:** T2.1's `type counter_count counter_next counter_current` check passes under `sh`, `bash`, `dash` and `zsh`. _(The full four-shell `counter-failclosed.bats` re-run belongs to [`plan-v4-3.md`](plan-v4-3.md)'s Gate 4, once the guard is hardened.)_

> [!IMPORTANT]
> **No Architectural Downgrades**: If you hit build/compiler/test errors during verification, NEVER resolve them via hot fixes or anti-patterns. In particular: do NOT harden the guard early to turn T2.7/T2.9 green (that is the KN-26 inversion), do NOT default a failed derivation to `0`, do NOT hardcode a constant list to turn T5.2 green, and do NOT run `bkit install` to resolve a path problem. Halt if stuck.

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A — no database. | — |
| **Code** | `git revert {SQUASH_SHA}` then `pnpm bkit install` to regenerate mirrors + `.bkit/version` hashes. | Single squash commit spanning all three sub-plans; revert restores the prose counters and the fail-open guard together (the KN-26 pair inverts cleanly). **This sub-plan is not independently revertible because it is not independently merged.** |
| **Data** | None. `soakEntryAt` rows already in a `status.jsonl` are ignored by the reverted code; `counter` rows already emitted with `shell-bus` stay valid (documented enum member). Both are additive and forward-compatible. | No log migration either way. |
| **Risk window** | None — no deploy, no migration. A consumer only picks the change up on their next `bkit install` / version bump. | |

_Code-only — `git revert` sufficient._
