Verdict: CONCERNS
<!-- verdict:end -->

<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket, set at design start = 202607). Logs sit at `docs/plans/202607/logs/58-workflow-counters/` and are delete-eligible. -->

# Workflow Attempt Counters — Derived from `status.jsonl` Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this `plan.md` natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

## Context & Goals

Workflow orchestrators (`bkit-build`, `bkit-debug`, `bkit-ship`) branch their retry loops on attempt counters the **model** tracks in prose — `Init counters: TEST_ATTEMPT = 0` (`bkit-build.md:316`), `Increment TEST_ATTEMPT + 1` (`bkit-build.md:911`). The counter reaching the shell is a number the model remembered and typed in. `decide_next` does not make that deterministic: it launders a model-supplied number through shell and returns it wearing a uniform, then faithfully enforces the cap against the wrong number. bkit's own telemetry has recorded this since the schema landed — all 10 `counter` rows in `stats.jsonl` declare `counterSource: "model-self-report"`, zero `shell-bus`.

The fix (agreed, `docs/decisions.jsonl` → `58-workflow-attempt-counters-derived-from-status-jsonl-not-stored`) is **derivation, not storage**: `attempt(step) = count(step-done rows for that step, status DONE, in the ACTIVE run of that workflow) + 1`, evaluated at step START and **re-derived** in every fenced block that needs it. Shell state does not survive between orchestrator Bash calls, so a counter is never carried — only re-read. That makes the whole class of bug structurally impossible rather than merely fixed, and makes resume free (a fresh process reading the same log lands on the same attempt because there is nothing to restore).

`status.jsonl` only became an append-only event log with a fold at #209 — after #58 was filed against the old `status.json` array. The data was always in the log; only the read was missing.

**Success Criteria:**

- No counter value originates in orchestrator context — every branch point re-derives it from `status.jsonl` in the fenced block that uses it, and no `*_ATTEMPT` name is referenced in orchestrator prose outside a fenced block (a `{PLACEHOLDER}` substitution token and a bare `MAX_*` constant name are the only exemptions — see § Breaking Changes item 5).
- **The conversion's completeness is machine-checked, not hand-asserted.** The site list is produced by a rule over the corpus (§ Breaking Changes item 10a), not enumerated by hand: **no fenced block may read a bare `$X_ATTEMPT` unless that same block derives it**. Because this rule looks _inside_ fenced blocks — where the existing prose audit is blind by construction (`stripFencedBlocks`) — it is the only artifact in the plan that can detect an unconverted site. Every hand-written line number below is a convenience index into that rule's output, never the authority.
- A workflow exceeding a `MAX_*` threshold **and** a workflow with an unusable counter both route to the Failure Path — `decide_next` / `check_max` fail closed, no `2>/dev/null` hiding the diagnostic.
- Cross-process integration tests (separate processes sharing only `status.jsonl`) cover over-cap, unset/empty, per-attempt row counting, active-run scoping, subPlan isolation, SOAK marker reset and fold dedup in both directions — and the fail-closed pair demonstrably fails against today's `dev`.

**Related Issues:**

- `#234 — telemetry JSONL master feature (open)` — absorbed #58's measurement slice, not its control-flow slice. Owns the `counterSource` enum question; this plan uses the existing `shell-bus` value and adds no enum member.
- `#209 — status.json → append-only status.jsonl + fold (closed)` — the event-log shape derivation depends on.
- `#232`, `#183`, `#233` — consolidated into #234 alongside #58 on 2026-06-06.
- `#341 — all-runtimes / gh fallback + trackers-stay-on-MCP (open)` — named as the fix path for the related-issues search failure below; no scope here.

> [!CAUTION]
> **The related-issues scan was NOT performed this run — treat as missing context, not as "nothing related exists".** `mcp__github__search_issues` returned `total_count: 0` for every probe **including the control** `repo:cbartens/bkit telemetry`, which must match (#234's body is dense with the word). The refs above are carried from the issue body and comments, not re-confirmed by search. Recurrence logged to `.bkit/friction.jsonl` (`design-step-3-related-issues-search-silently-empty-on-private-repo`, `recurrenceCount: 2`). See `related-issues.md`.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **You do NOT need to read the rest of this plan.** Focus here. The agent handles the rest.

### Narrative

> [!CAUTION]
> **⚠️ No parent design exists (standalone issue). The Narrative below is AGENT-SYNTHESISED from issue #58 § Goal — it is NOT human-provided and appears verbatim nowhere in the issue. Confirm it or replace it.**
>
> `docs/plans/template.md:46` mandates a design-missing fallback that blocks Gate 1 until a human supplies the Narrative. This plan **deviates**: it offers a synthesis to react to rather than a blank, on the judgement that reviewing a concrete sentence beats authoring one from scratch. That deviation is itself a thing you are signing off — see § Breaking Changes item 10. If you would rather the template were followed literally, strike the paragraph below and write your own; Gate 1 stays blocked either way until this section's checkbox is `[x]`.

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

### Edge Cases _(plan-level; the issue states no Key Edge Cases section)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Counter expands empty / non-integer at a routing block | `decide_next` / `check_max` print **nothing** on stdout, emit a diagnostic on stderr, `return 2` → block exits 2 → orchestrator routes to **Failure Path**. Never "continue". |
| `status.jsonl` missing or unreadable at a derive block | `counter_count` returns 2 → call site `\|\| exit 2` → **Failure Path**. Never a default of 0. |
| **A routing site reads `0` legitimately** (routes on a *prior, not-yet-executed* step: `bkit-build.md:778-784` challenge-remediate on first CONCERNS/FAIL; `bkit-debug.md:440` SOAK budget in Step 3, where soak rows are written in Step 7) | `counter_count` prints `0`, exit **0** → the **continue** branch (Step 11 / Step 4). **NOT** Failure Path. `0` is the correct answer, not an error. Only `counter_current` (post-own-write) may refuse `0`; these sites must not use it. This is issue constraint 1's regression through a side door — asserted by a test, not by prose. |
| **Resume** of a killed run (latest run is still `IN_PROGRESS` for this workflow) | `bkit-build.md:334-337` / `bkit-debug.md:325-327` append `workflow-started` **only if** the latest folded run is not (this workflow AND `IN_PROGRESS`) → no new run → active-run scoping **continues** the count. The spent budget is inherited **on purpose**: acceptance bullet 5 ("no fresh budget") holds. |
| **Re-invoke** after the previous run reached DONE / FAILED | A new `workflow-started` is appended → new active run → **fresh budget**, never the previous run's spent one (the DE-25 starvation). The opposite of the resume row above, and correct for the opposite reason. |
| A `debug` run interleaves into the same `status.jsonl` between two `build` invocations | **Flagged, not proven, and load-bearing.** `bkit-build.md:335` tests `(.[-1] // {})` — the last run **overall**, not the last *build* run. A finished `debug` run at `.[-1]` makes a resuming build append a fresh `workflow-started` → new run → **budget silently resets** (Defect 3 by a side door, reachable through the exact build→debug→build path this feature governs). A lock exists at `:143`; whether it excludes the interleave is unestablished. Covered by a fixture (T2.10) that pins today's behaviour either way; the run-boundary semantics themselves are #209's substrate → deferral row. |
| `PRIOR_STRATEGY` reads the same log with all-runs scoping | Left **unchanged and deliberately opposite**. Both sites carry a comment naming the asymmetry, so neither reads as a bug from the other's side. |
| Two real retries of the same step | Survive the fold: the dedup key is `"S {workflow} {step} {parentSha} {at}"` — it includes **`at`**. Two retries differ if **either** `parentSha` **or** the wall-clock second differs. |
| A byte-identical row replayed (double-append of the same block) | Collapses to 1 by the same dedup key — the intended behaviour, and the reason the counter is coupled to the per-attempt commit cadence. |
| Per-attempt `--allow-empty` commit dropped from a step | Attempts collapse into one **only when `parentSha` AND the same-second `at` both collide** — the key includes `at`, so the coupling is narrower than "no commit → collapse". Stated precisely because T1.1 ships this invariant into a consumer-facing header comment where future agents will trust it. |
| **A counted step whose `parentSha` advances only transitively** (`debug-run-tests`: `bkit-debug.md:396` writes its row with **no commit** — Steps 4/5/6 commit at `:573`/`:646`/`:707`) | Real and **deliberate**: KN-26 removed debug's intermediate `chore(...)` commits so `fix(...)` stays branch HEAD (a `chore` HEAD makes the Vercel-ignore regex skip the preview → CI demotes to `partial` → integration/Playwright skipped → `conclusion=success` with no coverage). `NORMAL_ATTEMPT` therefore depends on Steps 4/5/6 for its `parentSha` advance. **Must NOT be "fixed" by re-adding a commit** — the per-site shape's commit-subject position does not apply at `:396-403`. Audited by corpus test (T2.6), not asserted by prose. |
| `DEBUG_MODE` selection (`bkit-debug.md:183-186`) | Unchanged across all four entry conditions (fresh run / `[soak]` prompt / soak-rows-present / `DEBUG_ATTEMPT >= MAX`). The bare-name prose at `:186` becomes a fenced derive (active-run `debug-failure-soak` count); the **mode branch stays prose** — it is a verdict-shaped judgment, not a number. Note the underlying key: soak rows carry `attempt: $NORMAL_ATTEMPT`, **not** a `debugAttempt` field, so "recorded for the current `DEBUG_ATTEMPT`" is only well-defined because active-run scoping gives one `workflow-started` per debug invocation — fortunate rather than designed, and now stated. |
| `VERIFY_ATTEMPT` across sub-plans | `subPlan` filter isolates each sub-plan's count — the `Reset VERIFY_ATTEMPT = 0 at start of each SUB_PLAN` prose becomes structurally unnecessary. |
| SOAK re-entered after NORMAL exhaustion, mid-run | A `workflow-meta` marker carrying `soakEntryAt` is appended at each SOAK entry; SOAK counts only `debug-failure-soak` rows with `.at > soakEntryAt` → fresh budget without any stored counter. |
| Two SOAK entries within the same wall-clock second | Fold dedups `workflow-meta` on `"W {type} {workflow} {at}"` → collapse to one marker. Same-second re-entry counts as one entry; acceptable and asserted. |
| Log with no `soakEntryAt` marker (fresh SOAK run, or a log written by an older bkit) | `.at > ""` is true for every row → counts all soak rows in the active run. Correct fresh-budget behaviour; additive, no migration. |
| Orchestrator mis-transcribes a derived value into a filename / comment | Artifact name and the row's `attempt` field are wrong; **routing is unaffected** — it re-derives. `attempt` is telemetry-only by contract. |

### Derived Test Matrix

> Tiering per `docs/testing.md` § "Which tier does a behaviour need?". Every row below crosses a real boundary (the `status.jsonl` file, `jq`, `git`, process boundaries) and carries a non-mock test that asserts a ground-truth signal. bkit has no DB/deploy/UI, so no `@live`, `E2E`, `fresh-DB replay` or `Smoke` rows exist. `bats` suites run in CI's `bkit-tests-unit` lane via `npx --yes bats tests/*.bats` (`ci.yml:500-502`) — no CI wiring needed.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Fold blob is single-sourced: zero inline `FOLD='def lastIdx…'` assignments remain in any `.bkit/workflows/*.md`; the shipped script's blob is byte-identical to the retired one (length + md5 as **measured at T1.1** — the issue's `1079` / `d04a2499…` are not inherited, see T1.1); every source site is fail-closed | Unit (Vitest) | `.bkit/src/bkit-status-fold.test.ts` | T1.3 |
| Per-attempt row counting across **separate processes**: three sequential `bash -c` invocations sharing only `status.jsonl` derive 1, 2, 3; the post-write re-derive equals the start-derive for the same attempt | Integration (bats, boundary: `status.jsonl` + process boundary) | `tests/counter-derive.bats` | T2.2 |
| Active-run scoping: a completed run with 3 rows + a fresh `workflow-started` → derive returns 1, not 4 (and the same fixture proves `PRIOR_STRATEGY`'s all-runs read still returns the old value — the asymmetry is intentional) | Integration (bats) | `tests/counter-derive.bats` | T2.3 |
| subPlan isolation: `build-plan-verify` rows for `subPlan:1` do not count toward `subPlan:2` | Integration (bats) | `tests/counter-derive.bats` | T2.4 |
| Fold dedup, both directions: 2 rows differing only in `parentSha` → count 2 (retries survive); 2 byte-identical rows → count 1 (replays collapse) | Integration (bats) | `tests/counter-derive.bats` | T2.5 |
| **Corpus audit of the commit-cadence invariant:** for every counted step, assert its row-writing block either commits in-block **or** is on the documented transitive list (`debug-run-tests` → Steps 4/5/6, citing KN-26). A counted step that neither commits nor is listed reds. (Replaces "assert `git commit --allow-empty` advances HEAD" — that is a property of **git**, cannot fail, and cannot detect `debug-run-tests`.) | Unit (Vitest, corpus scan) | `.bkit/src/bkit-counter-prose-audit.test.ts` | T2.6 |
| **Completeness rule (the only check that can see inside fenced blocks):** no fenced block in the 5 workflows reads a bare `$X_ATTEMPT` unless that same block derives it (`counter_count`/`counter_next`/`counter_current`/an inline fold). `CI_ATTEMPTS` is exempt by name (loop-local, assigned and consumed in one block). Fails today against **all 18 `--argjson` sites** — the RED-first proof that it can detect an unconverted site | Unit (Vitest, block-scoped scan) | `.bkit/src/bkit-counter-prose-audit.test.ts` | T5.3 |
| **Count-0 at a prior-step routing site is legal:** `counter_count` over a log with zero rows for the target step prints `0` and exits **0**; challenge-first-pass routes to Step 11 and soak-first-pass routes to Step 4 — **not** Failure Path. Plus `MAX=0` (`MAX_CHALLENGE_REMEDIATE_ATTEMPT=1` → `THRESHOLD=0`) is accepted as a valid max by the hardened guard, not rejected as falsy | Integration (bats) | `tests/counter-failclosed.bats` | T2.9 |
| **`DEBUG_MODE` selection unchanged** across fresh run / `[soak]` prompt / soak-rows-present / `DEBUG_ATTEMPT >= MAX` after `:183-186` becomes a fenced derive | Integration (bats) | `tests/counter-derive.bats` | T3.4b |
| **Run-boundary interleave:** a `build` run left `IN_PROGRESS`, a complete `debug` run appended after it, then a resuming build → pins whether `bkit-build.md:335`'s `(.[-1] // {})` resets the budget. Asserts today's actual behaviour (characterisation), so the derivation's dependence on `:335` is visible rather than latent | Integration (bats) | `tests/counter-derive.bats` | T2.10 |
| Fail-closed: unset / empty / non-integer counter → `decide_next` and `check_max` print nothing on stdout, exit 2 (**refused**, not continue); over-cap → prints `failure-path`, exit 1. Both **fail against `dev`'s counter-bus** via the `BKIT_COUNTER_BUS` override | Integration (bats, boundary: exit codes across processes) | `tests/counter-failclosed.bats` | T2.7 |
| SOAK marker: rows before `soakEntryAt` are excluded → a second SOAK entry gets a full fresh budget; absent marker counts all rows | Integration (bats) | `tests/counter-derive.bats` | T2.8 |
| Prose audit fires: the widened pattern matches known-bad fixture lines (`Init counters: VERIFY_ATTEMPT = 0`, `Increment TEST_ATTEMPT + 1`, `CHALLENGE_REMEDIATE_ATTEMPT < 1`, `NORMAL_ATTEMPT > 1`) and does NOT match `{VERIFY_ATTEMPT}` or a bare `MAX_TEST_ATTEMPT` — a **negative control**, because the shipped pattern matches nothing (see § Breaking Changes item 6) | Unit (Vitest) | `.bkit/src/bkit-counter-prose-audit.test.ts` | T5.1 |
| Every `MAX_*` defined in `bkit-counter-bus-config.sh` is referenced by >=1 fenced shell block across the workflow corpus (no dead constant — closes constraint 6's second half) | Unit (Vitest) | `.bkit/src/bkit-counter-prose-audit.test.ts` | T5.2 |
| Deleted primitives are gone and unreferenced: `counter_init` / `counter_inc` / `counter_get` / `counter_reset` / `BKIT_COUNTER_` appear in **zero** files under `.bkit/` and `tests/` | Unit (Vitest) | `.bkit/src/bkit-counter-prose-audit.test.ts` | T6.2 |
| Every `counter` row emitter passes a fold-derived `counterValue` and `counterSource: "shell-bus"`; zero `model-self-report` literals remain in the workflow corpus | Unit (Vitest) | `.bkit/src/bkit-counter-prose-audit.test.ts` | T7.1 |
| Static gate on every changed file | Static | `pnpm typecheck && pnpm format:check && pnpm lint:slop && pnpm lint:prose && pnpm bkit check` | T8.3 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below. This is the only other section requiring your attention.

**1. `decide_next` / `check_max` exit contract changes — BREAKING, and it is the point.**

`.bkit/scripts/bkit-counter-bus.sh` is a **shipped consumer file** (core template walk, `.bkit/version` canonicalHashes). Today an unset counter → `[ "" -gt 3 ]` → non-zero → indistinguishable from "condition false" → **continue**. After this change it → exit 2 → **Failure Path**. Any consumer calling `decide_next` with an unset variable flips from silently retrying forever to failing loudly. The only callers in the corpus are bkit's own workflows, which this plan converts in the same PR.

> [!WARNING]
> **This cannot ship alone (KN-26 shape).** Hardening the guard without the derivation converts "may silently overrun" into "**never retries**" — every retry route hard-fails. Task order is load-bearing: **T3.1–T3.7 (derivation) land before T3.8 (hardening)**, both in the same PR. Do not reorder, do not split the PR along that seam.

**2. Inert primitives deleted from a shipped script — BREAKING.** `counter_init` / `counter_inc` / `counter_get` / `counter_reset` and the `BKIT_COUNTER_*` convention are removed (WS-6, **last**). They are called from exactly one live site today (`bkit-debug.md:432`, itself inert — the helper writes `BKIT_COUNTER_SOAK_ATTEMPT` while `:440` reads `$SOAK_ATTEMPT`; the two never meet). Deletion is only safe once every site is converted.

**3. New shipped file: `.bkit/scripts/bkit-status-fold.sh`** exporting `BKIT_STATUS_FOLD`. Ships via the core template walk from `.bkit/templates/.bkit/scripts/` like its siblings — no manifest entry (counter-bus has none either); `bkit install` stamps its `canonicalHashes` entry. The variable is **renamed** from the workflows' current local `FOLD` to `BKIT_STATUS_FOLD` (a sourced script must not claim a name as generic as `FOLD`). 15 use sites across 5 workflows change.

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

The fix is structural, not a longer list: **T5.3 ships a block-scoped rule** — no fenced block may read a bare `$X_ATTEMPT` unless it derives it — and **T3.0 generates the worklist by running that rule**. Hand-written line numbers below are a convenience index into its output, never the authority.

> [!CAUTION]
> **Known residual risk — the reason this plan is CONCERNS, not PASS.** T5.3 proves each fenced block _derives_ its counter. It does **not** prove the block derives the **right** counter: at **7 of the 18 sites** the counter's step is not the row's step (`bkit-build.md:612`, `:1006`, `:1056`; `bkit-debug.md:643`, `:697`, `:808`; `bkit-ship.md:625`, `:685`). A wrong step/sub-plan/`--since` mapping there produces **valid JSON and a green T5.3** — a miscount, which is exactly the defect class that survives `--argjson`'s hard-fail (the shortfall this whole item describes). The mitigation is procedural, not mechanical: T3.0 records the mapping per site _before_ conversion, and each WS-3 task's Done-when names its counter's step explicitly. **An implementer must treat a green T5.3 as necessary, not sufficient**, and diff each converted site's derive against T3.0's recorded mapping. Closing this properly would need a fixture per site asserting the derived number against a seeded log — worth doing if the mapping proves error-prone in practice, but it is a materially larger test surface than #58 scopes, so it is flagged here rather than silently absorbed.

> [!WARNING]
> **Ordering consequence — WS-4 must not run early.** T4.1 deletes the prose (`Init counters:`, `Increment X + 1`) that instructs the model to substitute these values. Deleting it while the 18 blocks are unconverted is **worse than the status quo**: no derive _and_ no substitution → `--argjson a "$TEST_ATTEMPT"` on an empty expansion → `jq: invalid JSON text` → hard failure on `build-failure-diagnose`, `debug-failure-soak`, `ship-failure-remediate` and every `debug-context-*` fetch. WS-4 is gated on T5.3 going green, not merely on T3.1–T3.7 being ticked.

**10b. `counter_current`'s refuse-at-0 bricks two legitimate first-attempt routes — issue constraint 1's regression through a side door.** The two-position contract (`counter_next` at start / `counter_current` after own write) has no slot for a **third real position**: _route on the count of a different, not-yet-executed step_. Two mandated sites are exactly that, and both legitimately read `0`:

- `bkit-build.md:778-784` — Step 10 routes on the count of _prior_ `build-challenge-remediate` rows. First CONCERNS/FAIL → 0 rows → refuse → **Failure Path**, where today it routes to Step 11. The draft's own T3.3 Done-when demanded the opposite ("0 prior remediations → Step 11"), contradicting the helper spec it mandated.
- `bkit-debug.md:440` — `check_max SOAK_ATTEMPT` fires in **Step 3**, but `debug-failure-soak` rows are written in **Step 7**. Every `[soak]`-prompt invocation (`:185`) or `DEBUG_ATTEMPT >= MAX` escalation (`:194`) hits `:440` with 0 soak rows → **Failure Path** on its first failing test run.

Both sites use **`counter_count`** (0 legal, exit 0) with `THRESHOLD=$((MAX_X - 1))`. `counter_current`'s 0-refusal is reserved for post-own-write positions **only**. This would have shipped green: no matrix row exercised a valid `0`, and `red-vs-dev.txt` would have looked exactly as promised while both routes were bricked. T2.9 now exercises it.

**10c. `debug-run-tests` has no per-attempt commit — KN-26 removed it deliberately, and the per-site shape would re-add it.** `bkit-build.md:932` reads "Update status **and commit**" (`:939` commits `--allow-empty`); `bkit-debug.md:396` reads "**Update status:**" with **no commit** — the only step-done-writing step in debug without one (`:308`, `:560`, `:639`, `:693`, `:752`, `:867` all commit). That asymmetry **is KN-26's remediation**: a `chore(...)` branch HEAD makes the Vercel-ignore regex skip the preview → CI demotes to `partial` → integration/Playwright skipped → `conclusion=success` with no coverage. Severity: **critical**. The draft's per-site shape — which the runbook instructs to "repeat **verbatim**" — put the derived value in "the commit subject", so an implementer applying it to T3.5's `:400` write would re-enter the known-broken pattern. The shape is now **conditional** on the block already committing, and `:396-403` is named as must-not-gain-one.

**11. Template deviation (design-missing fallback) — signed off here, not asserted.** `docs/plans/template.md:46` mandates that a plan with no parent design replace the Narrative with a blocking `⚠️ MISSING` string and let a human fill it. This plan instead offers an **agent-synthesised** Narrative for the human to confirm or replace, on the judgement that reacting to a concrete sentence beats authoring from a blank. The draft additionally labelled that text _"taken verbatim from issue #58 … NOT fabricated"_ — **false on both counts** (the sentence appears nowhere in #58) and sitting on the one surface where the human is the sole check. Relabelled honestly in § Acceptance Scenario. The § Success Criteria there _are_ near-verbatim from #58 § Acceptance; that half of the original label was fair. Confirming this section confirms the deviation.

**Proposed names** (all new): `.bkit/scripts/bkit-status-fold.sh`, `BKIT_STATUS_FOLD`, `counter_count`, `counter_next`, `counter_current`, `soakEntryAt`, `tests/counter-derive.bats`, `tests/counter-failclosed.bats`, `.bkit/src/bkit-status-fold.test.ts`, env override `BKIT_COUNTER_BUS`, env override `BKIT_STATUS_FOLD_SH`.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

- **Stored `counters` object in status (the original #58 sketch) — REJECTED.** It had to propose a policing invariant (_"`counters.verifyAttempt` must equal the count of `plan-verify` entries"_) precisely because a stored counter drifts from the rows. Counting the rows makes that invariant true by construction. Superseded by the ACTIVE decision record; written in May against the pre-#209 `status.json` array.
- **Persist `BKIT_COUNTER_*` across blocks — REJECTED, and now known impossible.** Each fenced block is a fresh process. Even with persistence the wiring is broken (helper writes `BKIT_COUNTER_{NAME}`, call sites read `${NAME}`).
- **Read back the `attempt` field instead of counting rows — REJECTED.** It reintroduces a dependence on every step faithfully writing `attempt`. Counting rows needs no such trust, which is what lets `attempt` become telemetry-only.
- **Copy `PRIOR_STRATEGY`'s fold-and-read shape — REJECTED.** Verified all-runs (`[.[] | .steps[] | …] | last`). Correct-ish for strategy (a resumed run arguably should not restart the STANDARD → PIVOT → FINAL ladder); wrong for attempts (a resumed run would inherit a spent budget — the DE-25 starvation). Two reads, one log, deliberately opposite scoping, commented at both sites.
- **Harden `decide_next` now, derive later — REJECTED.** Converts silent-overrun into never-retries. KN-26 shape. **The same inversion re-entered through two side doors and was caught only in review** — `counter_current`'s refuse-at-0 at `bkit-build.md:778-784` and `bkit-debug.md:440` (§ Breaking Changes item 10b). "Do not harden ahead of derivation" is not only a task-ordering rule; it is a per-site property, and the sites that route on a _prior_ step are where it hides.
- **Enumerate the call sites by hand — REJECTED (this is the plan's own central correction).** The draft did exactly this and reached 7 of 18 while its gates stayed green, because the prose audit strips fenced blocks and could not see the remainder. A hand-list cannot be complete-by-construction and its blind spots correlate with the defect's (the shipped `EXPECTED_CONSTANTS` omits 6-of-7 — precisely the dead constant). The list is derived from a rule over the corpus (T5.3) and the rule's green is what licenses T3.8 (Gate 2b). See § Breaking Changes item 10a.
- **Change `>` to `>=` while converting — REJECTED (out of scope).** Preserve today's comparison semantics exactly; the point is provenance, not threshold tuning. `MAX_CHALLENGE_REMEDIATE_ATTEMPT` reuses the existing `THRESHOLD=$((MAX_X - 1))` idiom (precedent: `bkit-debug.md:192-193`) to reproduce the literal-`1` gate byte-for-byte.
- **Future recommendation (not this plan):** there is **no shellcheck gate over `.bkit/scripts/*.sh`** — actionlint only shellchecks `run:` blocks in `.github/workflows/*`. The `SC2016` directive this plan adds is therefore defensive for local runs, not CI-enforced. Deferred (see § Out of Scope).

## Out of Scope

- Verdict semantics, strategy selection, sub-plan iteration logic. `PASS`/`FAIL`/`CONCERNS` and `STANDARD`/`PIVOT`/`FINAL` need judgment and stay in the orchestrator.
- Renaming or restructuring step IDs; artifact file formats.
- The `counterSource` enum question (`"derived"` vs `"shell-bus"`, which names the transport rather than the provenance) — #234 owns that schema.
- `TEST_VERDICT` / `TEST_SCOPE` pass via `--arg` and accept empty silently, unlike the counters' `--argjson` hard-stop. Legitimately model judgments; noted on the findings comment, not fixed here. → deferral row.
- `PRIOR_STRATEGY`'s all-runs scoping — flagged and commented, not changed. Which behaviour strategy actually wants was never established. → deferral row. _(Note `bkit-build.md:593` is additionally sub-plan-scoped — all-runs **and** `--argjson sp "$SUB_PLAN"`, a third scoping variant the "two reads, deliberately opposite" framing does not name. One clause in T1.2's comment, not a task.)_
- Adding a shellcheck CI gate over `.bkit/scripts/*.sh`. → deferral row.
- `CI_ATTEMPTS` (`bkit-build.md:1258`+, `bkit-debug.md:980`+, `bkit-ship.md`) — a loop-local poll counter incremented and consumed **inside one fenced block**. Never crosses a process boundary, never model-authored. Not a call site. **T5.3 exempts it by name** — that exemption is a consequence of the completeness rule's existence, not a scope expansion.
- **`status.jsonl` run-boundary semantics** — `bkit-build.md:335` / `bkit-debug.md:325-327` key the "start a new run?" test on `(.[-1] // {})`, the last run **overall**, not the last run _of this workflow_. The derivation makes this load-bearing (it decides whether a resuming build inherits or resets its budget), so T2.10 **characterises** it; changing it belongs to #209's substrate. → deferral row.
- **Whether `debug-run-tests` should regain a per-attempt commit**, making `NORMAL_ATTEMPT`'s row-counting self-sufficient rather than transitively dependent on Steps 4/5/6. A real design question that **collides with KN-26** (§ Breaking Changes item 10c) and must not be answered by an implementer applying the per-site shape. → deferral row.
- **`counterName` ↔ `counterValue` pairing at the 5 close-workflow emitters** — whether the `workflow-started` count matches each emitter's declared `DESIGN_ATTEMPT`/`PLAN_ATTEMPT`/… name is #234's schema question. T7.1 makes the value honest; it does not adjudicate the name. → deferral row.

## Merge Method

**Merge method: always squash.** All workstreams land in **ONE PR** — non-negotiable per Breaking Changes item 1: WS-3's derivation and T3.8's fail-closed hardening are the two halves of the KN-26 pair and must not be separable at the merge boundary. `bkit-ship.md` Step 5 is hardcoded to `gh pr merge --squash --delete-branch --body ""`.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| 15 × inline `FOLD='def lastIdx…'` assignments across `bkit-build.md` (`:146`, `:333`, `:592`, `:987`), `bkit-debug.md` (`:132`, `:179`, `:323`, `:624`), `bkit-ship.md` (`:135`, `:304`, `:665`), `bkit-plan.md` (`:104`, `:255`), `bkit-design.md` (`:103`, `:251`) | `.bkit/scripts/bkit-status-fold.sh` (`BKIT_STATUS_FOLD`) | DELETE | 15 hand-synced copies of a 1079-byte jq reducer across **5** workflows (the issue says 3 — plan/design carry it too). Sourcing once makes derivation and workflows agree by construction. |
| `counter_init` / `counter_inc` / `counter_get` / `counter_reset` + the `BKIT_COUNTER_*` convention (`bkit-counter-bus.sh:27-62`) | `counter_count` / `counter_next` / `counter_current` (re-derive per block) | DELETE | Inert: shell state does not survive across orchestrator Bash calls, and the helpers write `BKIT_COUNTER_{NAME}` while every call site reads `${NAME}`. Keeping dead helpers beside a different live convention is what let Defect 2 hide. |
| `tests/counter-bus.bats` §1-4 (`counter_init`/`inc`/`get`/`reset`), §8's `counter_init`/`counter_inc`/`counter_get` cases, §9 integration cases | `tests/counter-derive.bats` + `tests/counter-failclosed.bats` | DELETE | They exercise the deleted primitives **inside a single `bash -c`** — the one condition the real workflow never satisfies. §5-7 (`check_max` / `decide_next` / config constants) are RETAINED and extended. |
| `ATTEMPT_COMPARISON_PATTERN` + `MAX_LITERAL_DEFINITION_PATTERN` (`bkit-counter-prose-audit.test.ts:89-97`) | widened bare-name pattern + placeholder/`MAX_` exemptions + negative control | DELETE | `\bATTEMPT\b` cannot match `X_ATTEMPT`; both patterns match nothing in the corpus (§ Breaking Changes item 6). |
| `EXPECTED_FUNCTIONS` list (`bkit-counter-prose-audit.test.ts:167-174`) asserting the 4 inert primitives exist | list asserting `counter_count`/`counter_next`/`counter_current`/`check_max`/`decide_next` exist **and** the 4 primitives are absent | DELETE | Asserts the presence of code this plan deletes; would red the suite at T6.1. |
| `EXPECTED_CONSTANTS` list (`bkit-counter-prose-audit.test.ts:144-151`) — hardcodes **6 of the 7** `MAX_*` in the config, omitting exactly `MAX_CHALLENGE_REMEDIATE_ATTEMPT` | T5.2's dynamic enumeration parsed from `bkit-counter-bus-config.sh` | DELETE | The one constant the hand-list omits is the one that is **dead** (constraint 6) — the hand-list's blind spot and the defect are the same shape. A rule-derived list cannot have that blind spot; that is the whole argument of § Breaking Changes item 10a in miniature. |
| Prose counter statements — **worklist generated by T5.1's audit (`prose-violations.txt`), not this list**: `bkit-build.md:316`, `:470`, `:526`, `:806`, `:911`; `bkit-debug.md:306`, `:372`, `:744`; `bkit-ship.md:286`, `:519`; **plus the 4 the draft missed** — `bkit-debug.md:175`, `:186`, `:187`, `:434` | derive blocks at each site (`:186` → T3.4b; `:434` → T3.6) | DELETE | `Init counters:` / `Increment X + 1` / `Reset X = 0` / `Set X = 0` — the model-authored counter this issue exists to remove. The draft's hand-list missed 4 sites, and its own grep missed `:434` besides (reversed operand order: "`SOAK_ATTEMPT` reset to 0"). |
| **18 fenced `--argjson {a,sa} "$X_ATTEMPT"` write sites** (`bkit-build.md:538`, `:612`, `:716`, `:761`, `:818`, `:936`, `:1006`, `:1056`; `bkit-debug.md:332`, `:400`, `:570`, `:643`, `:697`, `:756` ×2, `:808`; `bkit-ship.md:562`, `:625`, `:685`) | in-block re-derive at every site (`counter_next` / `counter_current` / `counter_count` per position) | DELETE | **The plan's central correction.** Each is a fenced block reading a number that shell state cannot have carried — i.e. one the model remembered and typed, the exact defect #58 was filed against. The draft converted 7 and none of its gates could see the rest (the prose audit strips fenced blocks). Enumerated here as an index; **T5.3's rule is the authority** (§ Breaking Changes item 10a). |
| Hardcoded literal `1` gate: `bkit-build.md:780-783`, `:804` | `MAX_CHALLENGE_REMEDIATE_ATTEMPT` via `THRESHOLD=$((MAX_CHALLENGE_REMEDIATE_ATTEMPT - 1))` | DELETE | Closes constraint 6 in both directions: the literal is duplicated in prose **and** the constant is dead. |
| `--argjson counterValue 1` + `--arg counterSource "model-self-report"` × 5 (`bkit-build.md:1196-1197`, `bkit-debug.md:953-954`, `bkit-ship.md:1004-1005`, `bkit-plan.md:760-761`, `bkit-design.md:764-765`) | fold-derived `counterValue` + `counterSource "shell-bus"` | DELETE | A hardcoded `1` labelled `model-self-report` is dishonest in both fields. |
| `2>/dev/null` on all 6 `decide_next`/`check_max` call sites | stderr surfaced | DELETE | Suppresses the only diagnostic the guard produces. |

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
- [ ] **Prerequisite Plans:** None. #209 (status.jsonl + fold) already shipped and is the substrate.
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
- **Output (Write):** `step-done` rows (unchanged shape; `attempt` now shell-derived within the writing block instead of `--argjson`-ed from a model-supplied variable). `.bkit/stats.jsonl` `counter` rows → `counterValue` (now derived), `counterSource` (now `shell-bus`).

### Data Schema Changes

- **ADD:** `workflow-meta.soakEntryAt` (type: string, ISO-8601 UTC) — appended at every SOAK entry in `bkit-debug.md`. Folds onto the run object via the existing `workflow-meta` merge branch. Additive and optional; absent → all soak rows in the active run count (fresh budget). No migration.
- **UNCHANGED:** `step-done.attempt` stays on every row and keeps its type, but is **re-classified as telemetry-only** — routing counts rows, so a missing or wrong `attempt` cannot corrupt control flow. Documented in `.bkit/workflows.md`.
- **UNCHANGED:** the fold reducer itself (byte-identical, just relocated). `soakEntryAt` needs no fold change.

## Architecture & Component Changes

### Shell — shipped scripts (source: `.bkit/templates/.bkit/scripts/`)

#### [NEW] `.bkit/templates/.bkit/scripts/bkit-status-fold.sh`

- Defines exactly one variable, `BKIT_STATUS_FOLD`, holding the jq prelude (`def lastIdx($w): …; def fold: …;`) **byte-identical** to the blob currently inlined 15×. Its length/md5 are **measured at T1.1**, not inherited (§ Runbook T1.1).
- Header comment states: single source of truth for the `status.jsonl` fold; the dedup key is `"S {workflow} {step} {parentSha} {at}"` — it includes **`at`**, so two rows collapse only when `parentSha` **and** the wall-clock second **both** collide. Row counting therefore depends on `parentSha` advancing per attempt **or** attempts landing in different seconds. Do **not** state the stronger "no commit → attempts collapse": it is false, and a shipped comment asserting a false invariant will be trusted by future agents. Name the transitive case: `debug-run-tests` never commits in-block (KN-26 — see § Breaking Changes item 10c); its `parentSha` advances via Steps 4/5/6.
- Carries `# shellcheck disable=SC2016` for the single-quoted blob (`$w` / `$e` / `$i` are jq variables, not shell). Note: no CI shellcheck gate covers `.bkit/scripts/*.sh` today — the directive is for local runs.
- Ships via the core template walk (`bkit-modules.ts:349` `processCoreTemplateDir` → `writeTier2`), like `bkit-counter-bus.sh`. No manifest entry. Installed copy `.bkit/scripts/bkit-status-fold.sh` + `.bkit/version` hash are produced by `bkit install`.

#### [MODIFY] `.bkit/templates/.bkit/scripts/bkit-counter-bus.sh`

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
- **HARDEN** `check_max` / `decide_next`: `case $_val in ''|*[!0-9]*) … return 2;; esac` on both the value and the max; exit 2 prints **nothing** on stdout, diagnostic on stderr with the `[bkit-telemetry]` prefix. Preserve `>`-comparison semantics exactly.
- **[DELETE]** `counter_init`, `counter_inc`, `counter_get`, `counter_reset` and the `BKIT_COUNTER_*` convention — **WS-6, last**.

#### [MODIFY] `.bkit/templates/.bkit/scripts/bkit-counter-bus-config.sh`

- **Existence Check:** exists; all 7 `MAX_*` already defined. No value changes. Comment only: note `MAX_CHALLENGE_REMEDIATE_ATTEMPT` is consumed via the `THRESHOLD=$((MAX_X - 1))` idiom.

### Orchestrator workflows (canonical source: `.bkit/workflows/`)

#### [MODIFY] `.bkit/workflows/bkit-build.md`

- **Existence Check:** exists. Verified sites: `:49` Limits, `:89` Failure Path trigger, `:146`/`:333`/`:592`/`:987` FOLD, `:316` Init counters, `:367` Gate 4, `:470` sub-plan reset, `:526` Increment VERIFY, `:538` verify row write, `:563` `decide_next VERIFY`, `:571` Gate 6, `:716`/`:761`/`:818` challenge rows, `:780-783`/`:804` literal-`1` gate (**position 4 — `counter_count`, 0 legal; NOT `counter_current`**), `:806` Increment CHALLENGE, `:841` Gate 11, `:911` Increment TEST, `:936` test row write, `:960` `decide_next TEST`, `:968` Gate 13, `:1196-1197` counter row.
- **8 `--argjson` counter sites** (T3.0's rule-derived worklist is authoritative, not this list): `:538`, `:612`, `:716`, `:761`, `:818`, `:936`, `:1006`, `:1056`. The draft's existence-check named `:716`/`:761` only as "challenge rows" and omitted `:612`/`:1006`/`:1056` entirely — all five are **unconverted consumers**, each reading a bare `$X_ATTEMPT` across a process boundary. `:612`, `:1006` and `:1056` write a row for a **different step** than the counter they carry.
- Steps: 4 FOLD sites → source; VERIFY / TEST / CHALLENGE_REMEDIATE derive + route at **every** site the rule lists; prose removed; gate checklists rewritten; telemetry row derived.

#### [MODIFY] `.bkit/workflows/bkit-debug.md`

- **Existence Check:** exists. Verified sites: `:49-50` Limits, `:90` Failure Path trigger, `:132`/`:179`/`:323`/`:624` FOLD, `:175-181` `PRIOR_DEBUG_ATTEMPT` fold (**cross-run — preserve, and COPY not move; it is the placeholder source for ~18 readers**), `:183-186` `DEBUG_MODE` selection (**control-flow, T3.4b**), `:187-194` `decide_next DEBUG`, `:243` Gate 1, `:306` Init counters, `:325-327` run-boundary condition (a fresh **invocation** is not a fresh **run**), `:332` `workflow-meta debugAttempt` (**both the marker precedent AND an unconverted consumer**), `:358` Gate 2, `:372` Increment NORMAL, `:396` "Update status:" — **no commit, KN-26; must not gain one**, `:400` run-tests row, `:417-418` prose `NORMAL_ATTEMPT` comparisons, `:424` `decide_next NORMAL`, `:427-434` SOAK escalation + `counter_reset` (`:434` uses reversed operand order — "`SOAK_ATTEMPT` reset to 0"), `:440` `check_max SOAK` (**position 4 — `counter_count`, 0 legal; rows are written in Step 7**), `:448` Gate 3, `:661` diagnose-driven SOAK reset, `:744` Increment SOAK, `:756` soak row (carries **both** `a`=NORMAL and `sa`=SOAK), `:784` Gate 7, `:802` prose `NORMAL_ATTEMPT > 1`, `:808` Step 8 row write (**distinct from `:802`'s prose**), `:953-954` counter row.
- **7 `--argjson` counter sites / 8 counter references** (T3.0's rule-derived worklist is authoritative): `:332` (DEBUG), `:400` (NORMAL), `:570` (DEBUG), `:643` (NORMAL), `:697` (NORMAL), `:756` (**NORMAL `a` + SOAK `sa`**), `:808` (NORMAL).
- Steps: 4 FOLD sites → source; DEBUG re-derived in **every** consuming block (cross-run scoping preserved + commented; `:180-181` retained); `DEBUG_MODE` selection at `:183-186` → fenced derive, mode branch stays prose; NORMAL derived at all 5 sites (incl. the 3 non-cap prose comparisons); SOAK derived via `--since soakEntryAt` + marker appended at **all three** entry points (`:427-434`, `:661`, **and invocation-start `:185-186`/`:194`**); prose removed; telemetry row derived.

#### [MODIFY] `.bkit/workflows/bkit-ship.md`

- **Existence Check:** exists. Verified sites: `:49` Limits, `:93` Failure Path guards, `:135`/`:304`/`:665` FOLD, `:286` `Set MERGE_ATTEMPT = 0`, `:338` Gate 2, `:519` Increment MERGE, `:562` merge row, `:586` `decide_next MERGE`, `:594` Gate 6, `:1004-1005` counter row.
- **3 `--argjson` counter sites** (T3.0's rule-derived worklist is authoritative): `:562`, `:625`, `:685`. The draft named `:562` only; `:625` (`ship-failure-diagnose`) and `:685` (`ship-failure-remediate`) each write a row for a **different step** than the `MERGE_ATTEMPT` they carry.

#### [MODIFY] `.bkit/workflows/bkit-plan.md` · `.bkit/workflows/bkit-design.md`

- **Existence Check:** both exist. FOLD sites only (`bkit-plan.md:104`, `:255`; `bkit-design.md:103`, `:251`) + the counter row (`bkit-plan.md:760-761`, `bkit-design.md:764-765`). No `*_ATTEMPT` retry counters.

### Tests

#### [MODIFY] `.bkit/src/bkit-counter-prose-audit.test.ts`

- **Existence Check:** exists (187 lines).
- Replace both vacuous patterns; add the placeholder / `MAX_`-name exemptions; add the negative control; add the no-dead-constant rule; add the no-primitives rule; add the counter-row provenance rule. Update `EXPECTED_FUNCTIONS`.

#### [NEW] `.bkit/src/bkit-status-fold.test.ts` · [NEW] `tests/counter-derive.bats` · [NEW] `tests/counter-failclosed.bats`

- Colocation per `docs/testing.md` § Stack (test files under `.bkit/src/`); bats suites live in `tests/` beside `counter-bus.bats` / `telemetry-failopen.bats` and auto-run via `npx --yes bats tests/*.bats`.

> [!WARNING]
> **Test paths resolve to the TEMPLATE, not the installed copy — an inverted dependency edge the draft shipped.** `tests/counter-bus.bats:15` reads `COUNTER_BUS="$REPO_ROOT/.bkit/scripts/bkit-counter-bus.sh"` — the **installed** file. But every code task edits `.bkit/templates/.bkit/scripts/…`, and `pnpm bkit install` runs **ONCE at T8.3**. So under the draft: `.bkit/scripts/bkit-status-fold.sh` does not exist until T8.3 (T2.2–T2.6, T2.8 cannot run); the installed bus has no `counter_count`/`counter_next`/`counter_current` (T2.2's Done-when unreachable); T3.8's "goes green" unreachable; T6.2's `.bkit/` grep cannot pass; and **Gate 2a is unpassable** — its RED would be `command not found`, not a fail-open.
>
> **Fix — template-relative defaults in all three bats suites:**
>
> ```sh
> COUNTER_BUS="${BKIT_COUNTER_BUS:-$REPO_ROOT/.bkit/templates/.bkit/scripts/bkit-counter-bus.sh}"
> COUNTER_CONFIG="${BKIT_COUNTER_CONFIG:-$REPO_ROOT/.bkit/templates/.bkit/scripts/bkit-counter-bus-config.sh}"
> STATUS_FOLD_SH="${BKIT_STATUS_FOLD_SH:-$REPO_ROOT/.bkit/templates/.bkit/scripts/bkit-status-fold.sh}"
> ```
>
> The overrides keep the RED-vs-`dev` proof working (point `BKIT_COUNTER_BUS` at a `git show dev:` extract). The **installed** path is exercised exactly where it belongs — T8.3's byte-identical `diff` and Manual Step 6's fresh-consumer install. **Do NOT resolve this with a per-edit `pnpm bkit install`** — that contradicts the runbook's batching rule and is a standing prohibition.

#### [MODIFY] `tests/counter-bus.bats`

- Prune §1-4, §8's primitive cases and §9; retain and extend §5-7. Repoint `COUNTER_BUS` / `COUNTER_CONFIG` (`:15-16`) to the template-relative defaults above — same override shape as the new suites, so the whole bats corpus resolves consistently and no suite silently tests a stale installed copy.

### Database Migrations

None — bkit has no database. The only persistent store is the `status.jsonl` append-only event log; its one additive field (`workflow-meta.soakEntryAt`) needs no migration in either direction (§ Data Schema Changes, § Rollback Strategy).

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `.bkit/workflows.md` | § Authoring Checklist item _"Loops cap at `MAX_*_ATTEMPT` constants"_ (`:1194`) → rewrite: counters are **derived** from `status.jsonl` in the fenced block that uses them, never carried and never prose-authored; **every fenced block that reads a counter derives it itself — enforced by the T5.3 rule, not by review**; every `MAX_*` comes from `bkit-counter-bus-config.sh`. Add the **four-position contract** (`counter_next` at start · `counter_current` after own write · `counter_count` when routing on a prior/not-yet-run step, where **`0` is a legal answer** · commit-subject only where the block already commits). § Status → add: `attempt` is telemetry-only; the `soakEntryAt` marker; the fold is sourced from `.bkit/scripts/bkit-status-fold.sh`; the dedup key is `at`-inclusive, so row counting couples to the per-attempt commit **or** a differing second — and name `debug-run-tests` as the KN-26 transitive exception that must **not** regain a commit. |
| `docs/testing.md` | Repo-local section (below `bkit:end`) → new subsection "Counter derivation test coverage": the cross-process rule (no counter value may cross from one `bash -c` to the next except through `status.jsonl`), the `BKIT_COUNTER_BUS` override for the RED-vs-`dev` proof, and a file/tier/scope table row per new suite. Add `tests/counter-derive.bats` + `tests/counter-failclosed.bats` to § Key test files. Do NOT touch the managed block. |
| `docs/decisions.jsonl` | **Already written at plan time** — `58-status-fold-sourced-once-from-shared-script`, `58-prose-audit-bans-bare-attempt-names-allows-brace-placeholders`. T8.2 verifies, does not re-append. |
| `docs/deferrals.jsonl` | **Already written — 6 rows, do not re-append.** Plan time: `58-test-verdict-scope-arg-accepts-empty-silently`, `58-prior-strategy-all-runs-scoping-unresolved`, `58-no-shellcheck-gate-over-bkit-scripts`. Review time: `58-status-jsonl-run-boundary-keys-on-last-run-overall`, `58-debug-run-tests-parentsha-advances-only-transitively`, `58-counter-row-countername-value-pairing-unverified` (findings that imply work beyond #58's scope — recorded rather than silently absorbed or dropped). T8.2 verifies, does not re-append. **Append-only: never rewrite the file.** |
| `.bkit/jsonl.md` | **No change** — `counterSource: "shell-bus"` is already the documented enum member (`:61`) and the shipped example already uses it (`:262`). Confirm during T7.1; do not add `"derived"` (#234 owns it). |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A — no database. | — |
| **Code** | `git revert {SQUASH_SHA}` then `pnpm bkit install` to regenerate mirrors + `.bkit/version` hashes. | Single squash commit; revert restores the prose counters and the fail-open guard together (the KN-26 pair inverts cleanly). |
| **Data** | None. `soakEntryAt` rows already in a `status.jsonl` are ignored by the reverted code; `counter` rows already emitted with `shell-bus` stay valid (documented enum member). Both are additive and forward-compatible. | No log migration either way. |
| **Risk window** | None — no deploy, no migration. A consumer only picks the change up on their next `bkit install` / version bump. |  |

_Code-only — `git revert` sufficient._

## Agent Execution Runbook

[Chronological, step-by-step checklist guiding implementation. **MANDATORY**]

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, **DO NOT fail silently**. Append a `kind:"deferral"` (or `kind:"failure"`) row per `.bkit/jsonl.md` with context before stopping.
> **Step Isolation:** Do NOT jump ahead. Complete each task fully (including its verification and checking its box) before starting the exact next task.
> **Edit the SOURCE, never the mirror:** `.bkit/templates/.bkit/scripts/*.sh` → `.bkit/scripts/*.sh`; `.bkit/workflows/*.md` → `.claude/` / `.cursor/` / `.opencode/`. Run `pnpm bkit install` ONCE at T8.3, never per edit.
> **ASCII operators only** in `.bkit/workflows/*.md` and `.bkit/prompts/*.md` — `!=` `>=` `<=`, never `≠ ≥ ≤`.

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

- [ ] **T2.0:** Repoint `tests/counter-bus.bats:15-16` to the template-relative overrides and adopt the same three-variable shape in the two new suites as they are created.
  - **Done when:** `grep -rn 'BKIT_COUNTER_BUS\|BKIT_STATUS_FOLD_SH' tests/*.bats` shows every suite resolving via `${VAR:-$REPO_ROOT/.bkit/templates/.bkit/scripts/…}`; `grep -rc '\$REPO_ROOT/\.bkit/scripts/' tests/*.bats` = 0; `npx bats tests/counter-bus.bats` still passes unchanged against the template (it is byte-identical to the installed copy today, so this repoint is behaviour-neutral **now** and correct **later** — verify with `diff .bkit/templates/.bkit/scripts/bkit-counter-bus.sh .bkit/scripts/bkit-counter-bus.sh` empty before the repoint).
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
- [ ] **T2.7:** `tests/counter-failclosed.bats`, resolving the bus template-relative per T2.0. Cases: unset / empty / `abc` / `1.5` value → exit 2, **empty stdout**; unset/empty MAX → exit 2; over-cap → `failure-path` + exit 1; at-cap → continue + exit 0. Then capture the RED-vs-`dev` proof: `git show dev:.bkit/scripts/bkit-counter-bus.sh > "$TMP/dev-bus.sh"` → `BKIT_COUNTER_BUS="$TMP/dev-bus.sh" npx bats tests/counter-failclosed.bats`.
  - **Done when:** the RED run's output is saved to `docs/plans/202607/logs/58-workflow-counters/red-vs-dev.txt`; the failure is recorded **by reason, not merely by non-zero exit** — `dev` prints `step-14` on **stdout** and exits **0** (the fail-open) where the suite demands empty stdout + exit 2. A RED that reads `command not found` is **not** the proof and means the template-relative wiring (T2.0) is wrong. The suite also fails against the current tree for the same _reason_ (T3.8 has not hardened it yet). Both facts recorded.
- [ ] **T2.9:** `tests/counter-failclosed.bats` — **count-0 is legal, and `MAX=0` is a valid max** (§ Breaking Changes item 10b). Cases: `counter_count` over a log with zero rows for the target step → prints `0`, exit **0**; `decide_next X 0 0 step-11 failure-path` (the `THRESHOLD=$((MAX_CHALLENGE_REMEDIATE_ATTEMPT - 1))` = 0 case, the corpus's only live zero-threshold) → **continue** branch, exit 0; `decide_next X 1 0 …` → `failure-path`, exit 1. Assert the hardened guard's `case … in ''|*[!0-9]*)` accepts `0` as a non-negative integer rather than rejecting it as falsy — the obvious place for a "reject empty-or-zero" reflex to creep in.
  - **Done when:** all three cases pass; a deliberate `[ -z "$MAX" ] || [ "$MAX" -eq 0 ]`-style rejection introduced into the guard reds the suite (verify by temporary edit, then restore); the suite comments name the two live position-3 sites (`bkit-build.md:778-784`, `bkit-debug.md:440`).
- [ ] **T2.10:** `tests/counter-derive.bats` — **run-boundary interleave characterisation** (§ Edge Cases). Fixture: `build` `workflow-started` + 2 `build-run-tests` rows, no `workflow-done`; then a complete `debug` run (`workflow-started` … `workflow-done`); then resume `build`. Run `bkit-build.md:335`'s **shipped** `(.[-1] // {})` condition over the fixture and assert what it actually does — whether it appends a fresh `workflow-started` (budget resets to 1) or not (derives 3).
  - **Done when:** the assertion pins **today's real behaviour** (characterisation, not aspiration) and its comment states the consequence either way; if the interleave **does** reset the budget, that fact is recorded in the deferral row `58-status-jsonl-run-boundary-keys-on-last-run-overall` rather than fixed here (run-boundary semantics are #209's substrate, out of scope). The derivation's dependence on `:335` is visible in a test rather than latent.
- [ ] **T2.8:** `tests/counter-derive.bats` — SOAK marker. Fixture: 2 `debug-failure-soak` rows, a `workflow-meta` row carrying `soakEntryAt`, then 1 more soak row.
  - **Done when:** `counter_next … --since soakEntryAt` prints `2` (only the post-marker row counts) while the same call without `--since` prints `4`; a marker-absent fixture prints the all-rows count; a same-second double-marker fixture folds to one marker.

### 🔒 Gate 2a: Derivation Available, Guard Not Yet Hardened

> The draft's Gate 2a was **unpassable** (it demanded suites run against an installed copy that T8.3 had not yet produced, so its RED would have been `command not found`) and **misplaced** (sitting between WS-2 and WS-3, it can only block entry to T3.1 — never T3.8). An unpassable gate gets waived, and its trailing seam sentence goes with it. Criteria are now achievable here, and the seam is enforced by **Gate 2b, positioned immediately before T3.8**.

- [ ] **Gate 2a - Verified:** T1.1–T2.10 all `[x]`. All suites resolve template-relative (T2.0). `npx bats tests/*.bats` runs with >0 tests. `tests/counter-failclosed.bats` is RED **for the documented reason** (stdout `step-14`, exit 0 — the fail-open; **not** `command not found`), and `red-vs-dev.txt` proves it is RED against `dev` for that same reason. Every other suite is green.
- [ ] **No push in the RED window:** `ci.yml:500-502` runs `npx --yes bats tests/*.bats` on **every push**, and `pnpm test` is `vitest run` — so bats does not red the local gate but **CI will**, between here and T3.8. Either no push happens in this window, or `tests/counter-failclosed.bats` carries a skip-tag that T3.8 removes. The merge is squash and the KN-26 pair must not split, so a red CI here is noise, not signal. State which option was taken.

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
> **Counter ≠ the row's own step at 7 of the 18 sites.** `bkit-build.md:612`, `:1006`, `:1056`; `bkit-debug.md:643`, `:697`, `:808`; `bkit-ship.md:625`, `:685` each write a row for a _different_ step than the counter they record (e.g. `:612` writes a `build-plan-gaps-remediate` row carrying `attempt: $VERIFY_ATTEMPT`). The derive is therefore keyed on **the counter's step, not the row's step** — `counter_current "$STATUS" build build-plan-verify --sub-plan N` at `:612`, not `build-plan-gaps-remediate`. T3.0's worklist states the mapping per site; getting it wrong is silent (valid JSON, wrong number).
>
> Every routing block gains: `- **If** any other exit → **Failure Path**.` and loses its `2>/dev/null`.

- [ ] **T3.0:** **(FIRST in WS-3 — the worklist is generated, not hand-copied.)** Land T5.3's completeness rule **first** (it is listed under WS-5 for topical grouping; execute it here), then run it and let it print the worklist. It must red today against **all 18 `--argjson` sites**. Record its output verbatim to `docs/plans/202607/logs/58-workflow-counters/unconverted-sites.txt` — that file, not the line numbers in this plan, is the authority for what T3.1–T3.7 must convert. For each site record: file:line · counter · **the counter's step** (which is _not_ the row's step at 7 sites — see the per-site shape) · sub-plan/since qualifier · which of the four positions it is.
  - **Done when:** `unconverted-sites.txt` exists and lists **18** sites (`bkit-build.md` 8, `bkit-debug.md` 7, `bkit-ship.md` 3) with a position and counter-step mapping each; the rule's RED output is the file's source (regenerated by command, not typed); `CI_ATTEMPTS` is absent (exempt by name — loop-local); every site in the file maps to exactly one of T3.1–T3.7 and no site is unassigned. **If the count is not 18, the rule is authoritative and this plan's prose is stale — follow the rule, and note the delta here.**
- [ ] **T3.1:** `VERIFY_ATTEMPT` — `bkit-build.md` Step 6. Derive at `:526` (replacing `Increment VERIFY_ATTEMPT + 1`), re-derive in the `:538` write block, route at `:563` with `counter_current "$STATUS" build build-plan-verify --sub-plan "$SUB_PLAN"`. **Plus `:612`** (per T3.0's worklist) — a separate fenced block writing a `build-plan-gaps-remediate` row that carries `attempt: $VERIFY_ATTEMPT` and uses the value 3× (`--argjson a`, `artifacts` path, commit subject); it re-derives `counter_current … build build-plan-verify --sub-plan "$SUB_PLAN"` (**the counter's step, not the row's**). Preserve the `>` comparison against `MAX_VERIFY_ATTEMPT`.
  - **Done when:** `grep -n 'Increment .VERIFY_ATTEMPT' .bkit/workflows/bkit-build.md` returns nothing; the `:563` block contains `counter_current`, `--sub-plan`, no `2>/dev/null`, and the routing list has an `any other exit` → Failure Path line; **both** `VERIFY_ATTEMPT` sites from `unconverted-sites.txt` (`:538`, `:612`) derive in-block and neither reads a bare `$VERIFY_ATTEMPT`; `pnpm vitest run .bkit/src/bkit-counter-prose-audit.test.ts` still passes.
- [ ] **T3.2:** `TEST_ATTEMPT` — `bkit-build.md` Step 13 (`:911` derive, `:936` write, `:960` route, step `build-run-tests`) **plus `:1006` and `:1056`** (per T3.0's worklist — Step 14's `build-failure-diagnose` and Step 15's remediate write blocks, each reading `$TEST_ATTEMPT` with no in-block derive and using it 3×). Both re-derive `counter_current "$STATUS" build build-run-tests` (the counter's step, not the row's).
  - **Done when:** the `:960` block matches the routing position of the per-site shape (no `2>/dev/null`, `counter_current`, `any other exit` line); `grep -n 'Increment .TEST_ATTEMPT' .bkit/workflows/bkit-build.md` returns nothing; all **3** `TEST_ATTEMPT` sites from `unconverted-sites.txt` derive in-block.
- [ ] **T3.3:** `CHALLENGE_REMEDIATE_ATTEMPT` — `bkit-build.md` Steps 10-11. Replace the literal-`1` prose gate (`:780-783`, `:804`) with two fenced `decide_next` blocks (one per verdict branch: CONCERNS → exceeded `step-13`; FAIL → exceeded `failure-path`), each deriving with **`counter_count "$STATUS" build build-challenge-remediate`** — **NOT `counter_current`** (§ Breaking Changes item 10b: this is position 4, routing on a step that has **not run yet**; on the first CONCERNS/FAIL the count is legitimately `0`, and `counter_current` would refuse it → `|| exit 2` → Failure Path where today it routes to Step 11, hard-failing **every** build that reaches Step 10 with a non-PASS verdict). Compare against `THRESHOLD=$((MAX_CHALLENGE_REMEDIATE_ATTEMPT - 1))` (idiom precedent: `bkit-debug.md:192-193`). Note `MAX_CHALLENGE_REMEDIATE_ATTEMPT=1` → **`THRESHOLD=0`**, the corpus's only live zero-threshold: `decide_next` compares `count > 0`, reproducing the `< 1` gate byte-for-byte, and T3.8's guard must accept `0` as a valid max (T2.9 asserts this). Derive at `:806`; re-derive in the `:818` write block. **Plus `:716` and `:761`** (per T3.0's worklist — the Step 9/10 challenge-row writes, both reading a bare `$CHALLENGE_REMEDIATE_ATTEMPT`). Keep the verdict branches themselves in prose.
  - **Done when:** `grep -nE 'CHALLENGE_REMEDIATE_ATTEMPT.*(<|>=) 1' .bkit/workflows/bkit-build.md` returns nothing; `grep -rn 'MAX_CHALLENGE_REMEDIATE_ATTEMPT' .bkit/workflows/` returns >=1 hit inside a fenced block (the constant is no longer dead); **no `counter_current` appears at `:778-784`/`:804`**; routing behaviour is unchanged and **proved by T2.9's count-0 case**, not by prose (0 prior remediations → Step 11; 1 → Step 13 / Failure Path per verdict); all **3** `CHALLENGE_REMEDIATE_ATTEMPT` sites from `unconverted-sites.txt` derive in-block.
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
  - **Done when:** `grep -c soakEntryAt .bkit/workflows/bkit-debug.md` = 4 (**three** writers + the `--since` reader); `grep -n counter_reset .bkit/workflows/bkit-debug.md` returns nothing; **no `counter_current` at `:440`**; T2.8 passes against the real workflow's marker shape; a bats case asserts a resumed invocation-start SOAK gets a **fresh** budget (marker present) rather than inheriting the prior invocation's spent one; T2.9's soak-first-pass case routes to **Step 4**, not Failure Path.

- [ ] **T3.7:** `MERGE_ATTEMPT` — `bkit-ship.md` (`:519` derive, `:562` write, `:586` route, step `ship-merge-pr`) **plus `:625` and `:685`** (per T3.0's worklist — the `ship-failure-diagnose` and `ship-failure-remediate` write blocks, both reading a bare `$MERGE_ATTEMPT`; each re-derives `counter_current "$STATUS" ship ship-merge-pr` — the counter's step, not the row's). Remove `Set MERGE_ATTEMPT = 0` at `:286`.
  - **Done when:** `grep -nE 'Increment .MERGE_ATTEMPT|Set .MERGE_ATTEMPT. = 0' .bkit/workflows/bkit-ship.md` returns nothing; the `:586` block matches the routing position of the per-site shape; all **3** `MERGE_ATTEMPT` sites from `unconverted-sites.txt` derive in-block.

### 🔒 Gate 2b: Derivation COMPLETE — the KN-26 seam, held by construction

> Positioned **immediately before T3.8** so it blocks at the seam it names. The draft's seam sentence lived in Gate 2a (between WS-2 and WS-3), where it could only block entry to T3.1 — never T3.8. The seam is otherwise held only by T3.8's inline note and Gate 2's _retrospective_ checkbox; this gate makes it prospective. Merge Method (ONE PR, squash) already forecloses the PR-boundary risk: **the seam cannot become a PR boundary.**

- [ ] **Gate 2b - Verified:** T3.0–T3.7 all `[x]`. **T5.3's completeness rule is GREEN over all 5 workflows** — zero fenced blocks read a bare `$X_ATTEMPT` they do not derive (`CI_ATTEMPTS` exempt). Every site in `unconverted-sites.txt` is converted and the rule re-run prints an empty worklist. `grep -rn 'Increment .*_ATTEMPT' .bkit/workflows/` is empty. **This gate — not a hand-count — is what licenses T3.8.** Hardening the guard while any site still supplies a model-authored value converts "may silently overrun" into "never retries" (KN-26 shape).

- [ ] **T3.8:** **(LAST in WS-3 — do not start until Gate 2b is `[x]`)** Harden `check_max` + `decide_next` in `.bkit/templates/.bkit/scripts/bkit-counter-bus.sh`: reject empty / non-integer value **and** max (`case … in ''|*[!0-9]*)`) → stderr diagnostic + `return 2`, printing nothing on stdout. **`0` is a valid value AND a valid max** — the `case` above accepts it (non-negative integer), and `MAX_CHALLENGE_REMEDIATE_ATTEMPT=1` → `THRESHOLD=0` is the corpus's only live zero-threshold; do **not** add a falsy-rejection (T2.9 reds if you do). Confirm zero `2>/dev/null` remain on any counter-bus call site.
  - **Done when:** `npx bats tests/counter-failclosed.bats` goes **green** (it was RED at Gate 2a **for the documented reason**, not for `command not found`), **including T2.9's count-0 and `MAX=0` cases**; `grep -rn 'decide_next\|check_max' .bkit/workflows/ | grep -c '2>/dev/null'` = 0; every routing list in the 3 workflows has an `any other exit` → Failure Path line (`grep -rc 'any other exit' .bkit/workflows/bkit-{build,debug,ship}.md` >= 1 each).
- [ ] **T3.9:** Re-run the full bats corpus against the converted tree.
  - **Done when:** `npx --yes bats tests/*.bats` exits 0 with >0 tests; `red-vs-dev.txt` still shows the same suite failing against `dev` (the file is evidence, not a test — do not regenerate it).

### WS-4 — Prose stops assigning counters (worklist comes from WS-5's audit, NOT from this list)

> [!WARNING]
> **Method inverted — run T5.1 FIRST.** The draft hand-enumerated line numbers and the enumeration was provably incomplete (`bkit-debug.md:175`, `:186`, `:187`, `:434` carry bare counter names no task touched). Worse, `:434` **slips T4.1's own grep**: the pattern is `reset .(VERIFY|SOAK)_ATTEMPT` but the line reads "`SOAK_ATTEMPT` reset to 0" — **operand order reversed** (`:661`'s "reset `SOAK_ATTEMPT` = 0" matches; `:434` does not). A hand-list that misses sites _and_ a grep that misses one of the sites it does list is exactly the failure this plan exists to end.
>
> **Land T5.1's pattern first, run it, and let its output be the removal worklist.** Record it to `docs/plans/202607/logs/58-workflow-counters/prose-violations.txt`. The line numbers below are a convenience index into that output, never the authority.
>
> **Prerequisite: Gate 2b.** T4.1 deletes the prose instructing the model to substitute values into the 18 fenced blocks. Deleting it while any block is unconverted is **worse than the status quo** — no derive _and_ no substitution → `--argjson a "$X_ATTEMPT"` on empty → `jq: invalid JSON text` → hard failure on `build-failure-diagnose`, `debug-failure-soak`, `ship-failure-remediate` and every `debug-context-*` fetch (§ Breaking Changes item 10a).

- [ ] **T4.1:** Run T5.1's widened audit → `prose-violations.txt`. Remove every prose counter statement it lists. Known members (index, not authority): `bkit-build.md:316` (`Init counters:`), `:470` (`Reset VERIFY_ATTEMPT = 0 at start of each SUB_PLAN` — now structural, the `subPlan` filter does it), `:526`, `:806`, `:911`; `bkit-debug.md:306` (`Init counters:`), `:372`, `:744`; `bkit-ship.md:286`, `:519`. **Plus the four the draft missed**: `bkit-debug.md:175` (bare `PRIOR_DEBUG_ATTEMPT` + `DEBUG_ATTEMPT` — the fold **stays**, the prose naming it goes; see T3.4), `:186` (→ T3.4b converts it), `:187` (bare `DEBUG_ATTEMPT >= MAX_DEBUG_ATTEMPT` — reword to the `MAX_*` name only), `:434` (→ T3.6 replaces the `counter_reset` it describes).
  - **Done when:** `prose-violations.txt` exists and was generated by running the audit (not typed); every line it listed is resolved; the audit re-run over all 5 workflows is **green**; `grep -rniE 'init counters|increment .(VERIFY|TEST|CHALLENGE_REMEDIATE|NORMAL|SOAK|MERGE)_ATTEMPT|reset .(VERIFY|SOAK)_ATTEMPT' .bkit/workflows/` returns nothing **and** `grep -rniE '(VERIFY|SOAK|NORMAL|TEST|MERGE|DEBUG)_ATTEMPT.{0,12}reset' .bkit/workflows/` returns nothing (the reversed-operand form the draft's grep missed).
- [ ] **T4.2:** Rewrite the dependent prose the audit lists: Gate checklists (`bkit-build.md:367`, `:571`, `:841`, `:968`; `bkit-debug.md:243`, `:358`, `:448`, `:784`; `bkit-ship.md:338`, `:594`) — `"Verify attempt incremented (VERIFY_ATTEMPT + 1)"` → `"Verify attempt derived from status.jsonl (active run, this sub-plan)"`; Limits notes (`bkit-build.md:49`, `bkit-debug.md:49-50`, `bkit-ship.md:49`) — drop the bare counter names and the `>=` comparisons, keep the `MAX_*` constant names + config path; Failure Path triggers (`bkit-build.md:89`, `bkit-debug.md:90`, `bkit-ship.md:93`) — keep the `MAX_*` names (allowed), remove any bare counter name.
  - **Done when:** every bare `X_ATTEMPT` outside a fenced block in the 5 workflows is either `{X_ATTEMPT}` or `MAX_X_ATTEMPT`; T5.1's audit is green.

> [!CAUTION]
> **T4.2's remit is WORDING ONLY — gate checklists, Limits notes, Failure Path triggers.** If the audit reds on a line that carries **semantics** (a comparison, a branch condition, a mode selection), it belongs to a WS-3 task, **not** here. The known case is `bkit-debug.md:186`, which **selects `DEBUG_MODE`** — it is T3.4b's, and rewording it here would silently change SOAK-vs-NORMAL selection. **Do NOT reword your way to a green audit.** If a red line is not in T4.1's or T4.2's remit and has no WS-3 owner, **stop and add the task** (§ "No Architectural Downgrades").

### WS-5 — Widen the prose audit + add the completeness rule (and prove BOTH fire)

> **Execution order:** T5.1 and T5.3 land **before** the WS-3/WS-4 work that consumes their output (T3.0 runs T5.3; T4.1 runs T5.1). They are grouped here topically, not chronologically. Both must be **RED against today's tree first** — a rule that has never fired is a rule with no evidence behind it (§ Breaking Changes item 6).

- [ ] **T5.1:** Rewrite `.bkit/src/bkit-counter-prose-audit.test.ts`'s patterns: ban any bare `\b[A-Z][A-Z0-9_]*_ATTEMPT\b` outside a fenced block, exempting (a) `{X_ATTEMPT}` brace placeholders **with a negative lookbehind on `$`** and (b) `MAX_`-prefixed constant **names**. The lookbehind is load-bearing: **48 `${X_ATTEMPT}` shell expansions** exist in the corpus, and an exemption written as "`{X_ATTEMPT}` is allowed" silently exempts every one — a model-substituted **value** reference, precisely what the rule exists to ban (§ Breaking Changes item 5). Add a **negative control** `describe` asserting the pattern matches the four known-bad literals (`Init counters: \`VERIFY_ATTEMPT\` = 0`, `Increment \`TEST_ATTEMPT\` + 1`, `\`CHALLENGE_REMEDIATE_ATTEMPT\` < 1`, `\`NORMAL_ATTEMPT\` > 1`) **and the reversed-operand form** (`\`SOAK_ATTEMPT\` reset to 0`— the shape`:434`uses and T4.1's draft grep missed), matches`${TEST_ATTEMPT}`in prose, and does **NOT** match`{VERIFY_ATTEMPT}`or`MAX_TEST_ATTEMPT`. Delete `ATTEMPT_COMPARISON_PATTERN`and`MAX_LITERAL_DEFINITION_PATTERN`.
  - **Done when:** the negative-control tests pass — including the `${TEST_ATTEMPT}`-is-caught and `SOAK_ATTEMPT reset to 0`-is-caught cases (proving the pattern fires; the shipped one matched **nothing**); the rule is **RED against today's corpus** and its output is captured to `prose-violations.txt` for T4.1; after WS-4 the corpus tests pass over all 5 workflows; re-introducing `Init counters: \`TEST_ATTEMPT\` = 0`into`bkit-build.md` reds the suite (verify by temporary edit, then restore).
- [ ] **T5.2:** Add the no-dead-constant rule: parse every `MAX_\w+=` from `bkit-counter-bus-config.sh` and assert each name appears >=1 time **inside a fenced block** across `.bkit/workflows/*.md`. Replaces the hardcoded `EXPECTED_CONSTANTS` list (`:144-151`), which lists **6 of 7** — omitting exactly `MAX_CHALLENGE_REMEDIATE_ATTEMPT`, the dead one. The hand-list's blind spot and the defect are the same shape.
  - **Done when:** the test enumerates all 7 constants dynamically (no hardcoded list) and passes; deleting the `MAX_CHALLENGE_REMEDIATE_ATTEMPT` reference added in T3.3 reds it; no hardcoded constant list remains in the file.
- [ ] **T5.3:** **The completeness rule — the only artifact in this plan that can see inside a fenced block, and therefore the only one that can detect an unconverted site (§ Breaking Changes item 10a).** Add to `.bkit/src/bkit-counter-prose-audit.test.ts`: for each fenced block in the 5 workflows, if the block references a bare `$X_ATTEMPT` / `${X_ATTEMPT}` then that **same block** must derive it (`counter_count` / `counter_next` / `counter_current`, or an inline `debugAttempt` fold). Exempt `CI_ATTEMPTS` **by name**, with a comment: it is loop-local, assigned and consumed inside one block, never crosses a process boundary, and is out of scope by § Out of Scope — the exemption is a consequence of this rule's existence, not a scope expansion. Note the existing `stripFencedBlocks` (`:36-40`) is the _prose_ audit's helper; this rule needs the inverse (iterate blocks, not strip them).
  - **Done when:** the rule is **RED against today's tree, listing all 18 `--argjson` sites** (`bkit-build.md` 8, `bkit-debug.md` 7, `bkit-ship.md` 3) — that RED is captured to `unconverted-sites.txt` and is T3.0's worklist; the `CI_ATTEMPTS` exemption is by-name with the stated reason (`bkit-build.md:1258`+, `bkit-debug.md:980`+ do not red); after WS-3 the rule is **green**; re-introducing a bare `$TEST_ATTEMPT` read into any converted block reds it (verify by temporary edit, then restore); Gate 2b consumes this rule's green as its licence for T3.8.

### WS-6 — Delete the inert primitives (LAST — constraint 5)

- [ ] **T6.1:** Delete `counter_init`, `counter_inc`, `counter_get`, `counter_reset` and every `BKIT_COUNTER_*` reference from `.bkit/templates/.bkit/scripts/bkit-counter-bus.sh`; update its header contract block to document only `counter_count` / `counter_next` / `counter_current` / `check_max` / `decide_next`.
  - **Done when:** `grep -rn 'counter_init\|counter_inc\|counter_get\|counter_reset\|BKIT_COUNTER_' .bkit/templates/ .bkit/workflows/` returns nothing.
- [ ] **T6.2:** Prune `tests/counter-bus.bats` §1-4, §8's primitive cases and §9 (retain and extend §5-7). Update `EXPECTED_FUNCTIONS` in the prose audit to the new five and add a rule asserting the four primitives are **absent** from `.bkit/` and `tests/`.
  - **Done when:** `npx --yes bats tests/*.bats` exits 0 with >0 tests; `pnpm vitest run .bkit/src/bkit-counter-prose-audit.test.ts` passes; `grep -rn 'counter_init\|counter_inc\|counter_get\|counter_reset\|BKIT_COUNTER_' .bkit/templates/ .bkit/workflows/ .bkit/src/ tests/ --include='*.sh' --include='*.bats' --include='*.md' --include='*.ts'` returns nothing. **Note the scope:** the grep targets the **sources**. `.bkit/scripts/*.sh` is a generated mirror that still carries the primitives until T8.3 regenerates it — asserting over `.bkit/` wholesale (as the draft did) cannot pass before T8.3 and would push an implementer toward a per-edit `bkit install`, which is prohibited. T8.3's Done-when covers the installed copy via its byte-identical `diff`; Manual Step 6 covers the consumer surface.

### WS-7 — Honest provenance on emitted counter rows

- [ ] **T7.1:** At all 5 close-workflow emitters (`bkit-build.md:1191-1199`, `bkit-debug.md:948-956`, `bkit-ship.md` ~`:999-1007`, `bkit-plan.md` ~`:755-763`, `bkit-design.md` ~`:759-767`) replace `--argjson counterValue 1` with a fold-derived value and `--arg counterSource "model-self-report"` with `"shell-bus"`. Keep the append best-effort (`|| echo "[bkit-telemetry] append failed: $STATS"`).
  - **ONE definition across all five** (the draft gave two — "count of `workflow-started` events" for four emitters, "may reuse its existing `debugAttempt` fold" for `bkit-debug.md`; two definitions of one telemetry field is what `counterSource` exists to disambiguate): `counterValue` = the count of `workflow-started` events for that workflow, **all-runs scoping** — a cross-run **invocation index**, explicitly **NOT** this plan's headline active-run rule (which would reset it to 1 every run). State the scoping in a comment at each site, since a reader will otherwise apply the active-run rule by default. `bkit-debug.md` uses the same expression as the other four and does **NOT** reuse its `debugAttempt` fold — that fold reads a marker written at `:332` from a model-supplied `$DEBUG_ATTEMPT` (§ Breaking Changes item 8), so reusing it would ground the honest-provenance claim in the very value this plan de-modelises. **Depends on T3.4** converting `:332`.
  - **Done when:** `grep -rc 'model-self-report' .bkit/workflows/` = 0 across all files; each emitter's `counterValue` comes from a `$(jq …)` capture, not a literal; all 5 use the **same** all-runs `workflow-started` expression (`grep -c` for it = 5) and each carries the all-runs scoping comment; a prose-audit rule asserts both facts; one manual run appends a `counter` row with `counterSource:"shell-bus"` and a value matching the run count. Whether the value matches each emitter's declared `counterName` (`DESIGN_ATTEMPT`/`PLAN_ATTEMPT`/…) is **#234's schema question** — do not "fix" the pairing here; it is recorded as a deferral row.

### WS-8 — Docs, ledgers, regeneration

- [ ] **T8.1:** Update `.bkit/workflows.md` (§ Authoring Checklist `:1194`, § Status) and `docs/testing.md` (repo-local section only — never the managed block) per § Documentation Updates. Rewrite prose; no lazy bullet appends.
  - **Done when:** `.bkit/workflows.md:1194` no longer says only _"Loops cap at `MAX_*_ATTEMPT` constants"_ but states counters are derived per-block from `status.jsonl`; `docs/testing.md` carries the cross-process rule + the 2 new bats rows; `git diff docs/testing.md` shows zero changes between `<!-- bkit:start -->` and `<!-- bkit:end -->`.
- [ ] **T8.2:** **Verify only — the 8 ledger rows were written at plan/review time; do NOT re-append** (a duplicate `key` with nothing changed is a dedup violation per `.bkit/jsonl.md` § Identity / Dedup). Confirm the 2 `decision` rows (`58-status-fold-sourced-once-from-shared-script`, `58-prose-audit-bans-bare-attempt-names-allows-brace-placeholders`) and the **6** `deferral` rows survived any rebase: the 3 from plan time (`58-test-verdict-scope-arg-accepts-empty-silently`, `58-prior-strategy-all-runs-scoping-unresolved`, `58-no-shellcheck-gate-over-bkit-scripts`) and the **3 added at review time** (`58-status-jsonl-run-boundary-keys-on-last-run-overall`, `58-debug-run-tests-parentsha-advances-only-transitively`, `58-counter-row-countername-value-pairing-unverified`). **If** implementation contradicted a recorded decision → append a same-`key` update row (never edit the original line). **`docs/deferrals.jsonl` is append-only:** verify any change with `git diff --numstat docs/deferrals.jsonl` showing **0 deletions**.
  - **Done when:** `jq -sr '[.[] | select(.key | startswith("58-"))] | length' docs/decisions.jsonl` = 3 (2 new + the parent `58-workflow-attempt-counters-derived-…`) and `= 6` for `docs/deferrals.jsonl`; `jq -c . docs/decisions.jsonl docs/deferrals.jsonl >/dev/null` exits 0 (every row well-formed, one per line); `jq -r '.key' docs/deferrals.jsonl | sort | uniq -d` is empty; `git diff --numstat docs/deferrals.jsonl` shows 0 deletions.
- [ ] **T8.3:** **Batched regeneration — run ONCE, at the end.** `pnpm bkit install` (regenerates `.bkit/scripts/*.sh` from templates, re-stamps `.bkit/version` canonicalHashes incl. the new `bkit-status-fold.sh`, re-renders `.claude/` / `.cursor/` / `.opencode/` mirrors) → `git config core.bare false` (install flips it) → `pnpm bkit check`.
  - **Done when:** `pnpm bkit check` exits 0; `.bkit/version` contains a `.bkit/scripts/bkit-status-fold.sh` hash; `.bkit/scripts/bkit-counter-bus.sh` is byte-identical to its template (`diff .bkit/templates/.bkit/scripts/bkit-counter-bus.sh .bkit/scripts/bkit-counter-bus.sh` is empty); `git status --porcelain` shows the mirror trees updated.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Testing & Documentation`.

- [ ] **Gate 2 - Verified:** Every task T1.1–T8.3 independently verified and checked off against the plan.
- [ ] **Completeness is machine-checked, not asserted:** T5.3 is green over all 5 workflows — **zero** fenced blocks read a bare `$X_ATTEMPT` they do not derive. `unconverted-sites.txt`'s 18 sites are all converted; re-running the rule prints an empty worklist. **This checkbox, not a hand-count, is what "the conversion is complete" means here.** A green Gate 2 with this box unchecked is the exact failure mode § Breaking Changes item 10a describes.
- [ ] **KN-26 pair intact:** T3.8 (fail-closed) is committed **after** T3.0–T3.7 (derivation) and in the same PR. No commit exists where the guard fails closed without a derived value behind it. Gate 2b enforced this prospectively; this is the retrospective confirmation.
- [ ] **KN-26 remediation intact (10c):** `bkit-debug.md:396` still reads "Update status:" with **no** `git commit` — the per-site shape's commit-subject position was **not** applied there. No `chore(...)` commit was added to debug's test loop.
- [ ] **No legitimate 0-route was bricked (10b):** `counter_current` appears at **no** position-4 site — `grep -n 'counter_current' .bkit/workflows/bkit-build.md` shows none in `:778-784`/`:804`, and none at `bkit-debug.md:440`. T2.9's count-0 cases are green.
- [ ] **Deletion ordering intact:** T6.1 ran only after every call site was converted (`grep` for `counter_reset` in `.bkit/workflows/` returned nothing before deletion).

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** All **17** rows have a corresponding task checked off — **17 rows, 17 distinct tasks, one-to-one**: T1.3, T2.2, T2.3, T2.4, T2.5, T2.6, T2.7, T2.8, T2.9, T2.10, T3.4b, T5.1, T5.2, T5.3, T6.2, T7.1, T8.3. Add tasks if any row is uncovered. _(The draft said "All 14 rows" against a 13-row matrix and a 13-task list — an off-by-one in a mandatory self-check that would send an agent hunting for a 14th row. This count was **measured** from the matrix, not carried forward; if it ever disagrees with § Derived Test Matrix, **the matrix is authoritative** and this line is stale.)_
- [ ] **Update existing tests:** `tests/counter-bus.bats` pruned to the retained sections (T6.2); `.bkit/src/bkit-counter-prose-audit.test.ts` rewritten (T5.1, T5.2, T6.2, T7.1).
- [ ] **Write new tests:** `tests/counter-derive.bats`, `tests/counter-failclosed.bats`, `.bkit/src/bkit-status-fold.test.ts`. Every boundary suite reaches the real boundary (`status.jsonl` on disk, real `git`, real process boundaries) and asserts a ground-truth signal (a specific derived integer / exit code / empty stdout) — never "did not throw".
- [ ] **Verify observability:** Every new diagnostic carries the `[bkit-telemetry]` prefix (log-drain grep). Telemetry appends stay best-effort and never gate a workflow. `decide_next`'s exit-2 diagnostic reaches stderr at every call site (no `2>/dev/null`).
- [ ] **Update documentation:** `.bkit/workflows.md` + `docs/testing.md` rewritten (T8.1); `docs/decisions.jsonl` + `docs/deferrals.jsonl` appended (T8.2). Docs and code land in the same change — never as a follow-up.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Verification Plan`.

- [ ] **Docs updated:** Every row in § Documentation Updates completed. `.agents/docs.md` still accurate (no new doc file → no new index row).
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck` + `pnpm format:check` + `pnpm lint:slop` + `pnpm lint:prose`.
- [ ] **Slop delta:** `pnpm slop:delta` — net-new findings only. The new shell helpers add no try/catch; if `defensive.error-obscuring` rises, use non-throwing forms rather than suppressing the rule.
- [ ] **Completeness rule green (T5.3):** `pnpm vitest run .bkit/src/bkit-counter-prose-audit.test.ts` — zero fenced blocks read a bare `$X_ATTEMPT` they do not derive. **This is the gate that means "the migration is done".** Re-running the rule prints an empty worklist against `unconverted-sites.txt`'s 18 entries.
- [ ] **Both new rules demonstrably fire:** T5.1 and T5.3 were each RED against today's tree before their conversions (`prose-violations.txt`, `unconverted-sites.txt` are the evidence) and red again on a temporary re-introduction. A rule that has only ever been green is not evidence (§ Breaking Changes item 6).
- [ ] **Test Synchronization:** `tests/counter-bus.bats` (pruned + repointed template-relative, T2.0/T6.2) and `.bkit/src/bkit-counter-prose-audit.test.ts` (rewritten) must be updated **in the same commit** as the code they assert, or the suite reds mid-sequence.
- [ ] **No suite reads a stale installed copy:** `grep -rc '\$REPO_ROOT/\.bkit/scripts/' tests/*.bats` = 0 — all three bats suites resolve template-relative (T2.0). The installed copy is exercised only at T8.3 and Manual Step 6. **No `pnpm bkit install` was added to any task except T8.3.**
- [ ] **Build Configuration:** No new mock files or test configs; no `tsconfig.json` `exclude` change needed (bats files are not TS).
- [ ] **Shell suites (`tests/*.bats`):** `npx --yes bats tests/*.bats` — auto-gated in CI's `bkit-tests-unit` lane (`ci.yml:500-502`), no CI wiring needed.
- [ ] **Vitest (`.bkit/src/bkit-status-fold.test.ts`, `.bkit/src/bkit-counter-prose-audit.test.ts`):** `pnpm test`. Unit lane is branch-coverage-gated at 65 — confirm no regression.
- [ ] **Portability:** re-run `tests/counter-failclosed.bats` under `sh`, `bash`, `dash` and `zsh` (the shells the issue reproduced the fail-open on). All four must refuse the unset counter.
- [ ] **Drift:** `pnpm bkit check` exits 0 after the single batched `pnpm bkit install` (T8.3).
- [ ] **Run all tests:** `pnpm test` + `npx --yes bats tests/*.bats`. Fix all failures before Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades**: If you hit build/compiler/test errors during verification, NEVER resolve them via hot fixes or anti-patterns. In particular: do NOT re-add `2>/dev/null` to silence a stderr diagnostic, do NOT default a failed derivation to `0`, and do NOT weaken the prose audit to make a stubborn line pass. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Manual Verification`.

- [ ] **Gate 4 - Verified:** Every checkbox in Automated Tests independently verified and checked off. Explicit proof (test outputs, CLI results) gathered — including `red-vs-dev.txt`.

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Proactively use local CLIs (`gh`, `npx bats`, `jq`) to verify pipelines instead of asking users to check dashboards.

- [ ] **Step 1 — The tests fail against `dev` (the acceptance's load-bearing claim):** `git show dev:.bkit/scripts/bkit-counter-bus.sh > /tmp/dev-bus.sh && BKIT_COUNTER_BUS=/tmp/dev-bus.sh npx bats tests/counter-failclosed.bats`. Confirm the unset-counter case FAILS: `dev` prints `step-14` and exits 0 (retry, cap ignored) where the suite demands empty stdout + exit 2. Compare against `red-vs-dev.txt`.
- [ ] **Step 2 — End-to-end derivation in a real log:** in a scratch dir, seed a `status.jsonl` with one `workflow-started` row, then run the Step 13 derive → write → route blocks as **three separate `bash -c` invocations** four times over, each with a distinct `parentSha`. Confirm the printed sequence is `1, 2, 3, failure-path` and that `[bkit-telemetry] counter TEST_ATTEMPT exceeded max=3 (value=4)` appears on stderr.
- [ ] **Step 3 — Resume:** kill the loop after attempt 2, start a fresh shell, run only the derive block. Confirm it prints `3` with no restored state.
- [ ] **Step 4 — Active-run scoping:** append a `workflow-done` + a fresh `workflow-started` to the same log. Confirm the derive block prints `1` (fresh budget) while the shipped `PRIOR_STRATEGY` expression over the same file still returns the prior run's `strategy` — the intended asymmetry, observed rather than assumed.
- [ ] **Step 4b — The legitimate `0` routes, observed (§ Breaking Changes item 10b):** in a scratch log with **zero** `build-challenge-remediate` rows, run Step 10's routing block → confirm it prints the **continue** branch (Step 11) and exits 0, **not** Failure Path. Repeat for `bkit-debug.md:440` with zero `debug-failure-soak` rows → Step 4, not Failure Path. These are the two routes the draft's `counter_current` would have bricked on every first attempt; observe them rather than trust the task text.
- [ ] **Step 4c — Completeness, observed:** `pnpm vitest run .bkit/src/bkit-counter-prose-audit.test.ts` → T5.3 green. Then re-introduce a bare `$TEST_ATTEMPT` read into one converted block and confirm the rule **reds** (restore afterwards). A completeness rule that has never fired is not evidence of completeness — the same standard § Breaking Changes item 6 applies to the prose audit.
- [ ] **Step 5 — Provenance:** `jq -r 'select(.kind=="counter") | .counterSource' .bkit/stats.jsonl | sort | uniq -c` after one workflow close. Confirm the new row reads `shell-bus` and its `counterValue` matches the run count in `status.jsonl`. Historical `model-self-report` rows remain (append-only; they are the record of the defect).
- [ ] **Step 6 — Consumer surface:** `pnpm pack` → install the tarball into a fresh scratch consumer → `bkit install` → confirm `.bkit/scripts/bkit-status-fold.sh` lands, `bkit check` exits 0, and the installed `bkit-counter-bus.sh` carries no `counter_init`.
- [ ] **Step 7 — CI:** after push, `gh run watch` → `bkit-tests-check` green. Confirm the bats step reports the new suites (`gh run view --log | grep counter-derive`), not a silent zero.
